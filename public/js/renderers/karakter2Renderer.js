/**
 * karakter2Renderer.js - Bütünsel 8-Yönlü İzometrik Karakter Motoru (Karakter 2)
 * 
 * MODEL: 'karakter_2'
 * 
 * YENİ MİMARİ & GELİŞTİRMELER:
 * 1. 8 Yönlü Bütünsel İzometrik Tasarım (3D Hissiyatı):
 *    - Karakter parçalanmış çubuklar/kemikler yerine yöne göre 3D derinlik kazanan bir bütün olarak çizilir.
 *    - Sağa/sola ve 4 çapraza (down-right, down-left, up-right, up-left) dönüldüğünde gövde ve omuzlar kafayla
 *      birlikte 3/4 izometrik açıya döner; kafa asla gövdeden bağımsız ters dönmez!
 * 2. Karakter 1 Tarzı Zıt Fazlı Yürüyüş Sarkacı (Counter-Phase Swing):
 *    - Sol bacak öne adım attığında sağ kol öne, sol kol arkaya salınır.
 *    - Sağ bacak öne adım attığında sol kol öne, sağ kol arkaya salınır.
 *    - Kollar hareket yönü ekseninde (ileri-geri) doğal bir sarkaç açısıyla salınır.
 * 3. Derinlik Katmanlaması (Far / Near Layering):
 *    - Yana ve çapraza bakarken arka kol ve arka bacak gövdenin arkasında (Far layer) adımlar.
 *    - Ön kol ve ön bacak gövdenin önünde (Near layer) adımlar; kopuk çizgiler tamamen yok edilmiştir.
 * 4. Sempatik & Canlı Dinamikler (Chibi-Streetwear):
 *    - Adım atarken kalça ve gövdede tatlı bir dikey yaylanma (bounce).
 *    - Canlı göz kırpma (blinking) mikro-animasyonu.
 *    - Pofuduk kargo jogger, düşük omuzlu oversize streetwear t-shirt ve chunky platform sneaker silueti.
 */

(function (global) {
    'use strict';

    class Karakter2Renderer {
        static spriteSheetImage = null;
        static spriteAtlasData = null;
        static playerMotionStates = new Map();
        static footstepParticles = [];
        static k2AshParticles = [];

        /**
         * 4. ADIM: Oyuncu Hareket, Dönüş ve İniş Dinamikleri Motoru
         * (Inertia Smoothing, Turn Smoothing & Landing Cushion)
         */
        static getPlayerMotionDynamics(pId, isMoving, facing, isLeft, now) {
            if (!this.playerMotionStates) this.playerMotionStates = new Map();
            let state = this.playerMotionStates.get(pId);
            if (!state) {
                state = {
                    weight: isMoving ? 1.0 : 0.0,
                    wasMoving: isMoving,
                    lastFacing: facing,
                    lastIsLeft: isLeft,
                    stoppedAt: 0,
                    turnStartTime: 0,
                    lastTime: now
                };
                this.playerMotionStates.set(pId, state);
                return {
                    motionWeight: state.weight,
                    turnScaleX: 1.0,
                    turnTilt: 0.0,
                    landingCushionY: 0.0,
                    landingSquashScaleY: 1.0
                };
            }

            const dt = Math.min(100, Math.max(1, now - state.lastTime));
            state.lastTime = now;

            // 1. Hareket Ağırlığı (Inertia Deceleration / Eylemsizlik Sönümlemesi)
            if (isMoving) {
                state.weight = Math.min(1.0, state.weight + (dt / 70));
            } else {
                if (state.wasMoving && !isMoving) {
                    // Tam durduğu anı kaydet (Landing cushion için)
                    state.stoppedAt = now;
                }
                state.weight = Math.max(0.0, state.weight - (dt / 180));
            }
            state.wasMoving = isMoving;

            // 2. 8 Yönlü Ani Yön Değişimi Yumuşatması (8-Way Turn Smoothing & Volume Anticipation)
            if (state.lastIsLeft !== isLeft || state.lastFacing !== facing) {
                state.turnStartTime = now;
                state.turnFromFacing = state.lastFacing || facing;
                state.turnFromIsLeft = (state.lastIsLeft !== undefined) ? state.lastIsLeft : isLeft;
                state.lastIsLeft = isLeft;
                state.lastFacing = facing;
            }

            let turnScaleX = 1.0;
            let turnScaleY = 1.0;
            let turnTilt = 0.0;
            const turnElapsed = now - (state.turnStartTime || 0);
            const TURN_DURATION = 130; // 130ms mikro-dönüş elastikiyeti

            if (turnElapsed < TURN_DURATION) {
                const t = turnElapsed / TURN_DURATION;
                const squash = Math.sin(t * Math.PI);

                const isHorizontalFlip = (state.turnFromIsLeft !== undefined && state.turnFromIsLeft !== isLeft);
                const fromFacing = state.turnFromFacing || facing;
                const isVerticalFlip = (
                    (fromFacing.includes('up') && facing.includes('down')) ||
                    (fromFacing.includes('down') && facing.includes('up'))
                );

                if (isHorizontalFlip) {
                    // Yatay 180° Dönüş (A <-> D, Sol <-> Sağ)
                    turnScaleX = 1.0 - (squash * 0.14); // %14 yatay esneme
                    turnScaleY = 1.0 + (squash * 0.05); // Hacim koruma (squash & stretch)
                    turnTilt = (isLeft ? -1 : 1) * (squash * 0.022); // ~1.25° dönüş ataleti
                } else if (isVerticalFlip) {
                    // Dikey 180° Dönüş (W <-> S, Yukarı <-> Aşağı)
                    turnScaleY = 1.0 - (squash * 0.09); // %9 dikey esneme
                    turnScaleX = 1.0 + (squash * 0.05); // Hacim koruma
                    turnTilt = (isLeft ? -1 : 1) * (squash * 0.012);
                } else {
                    // 45° Çapraz Geçişler (W -> W+D, S -> S+A vb.)
                    turnScaleX = 1.0 - (squash * 0.08); // %8 dengeli toparlanma
                    turnScaleY = 1.0 - (squash * 0.05);
                    turnTilt = (isLeft ? -1 : 1) * (squash * 0.015);
                }
            }

            // 3. Dururken İniş/Adım Yaylanması (Landing Cushion / Shock Absorption)
            let landingCushionY = 0.0;
            let landingSquashScaleY = 1.0;
            const stopElapsed = now - (state.stoppedAt || 0);
            const STOP_CUSHION_DURATION = 210; // 210ms taban/diz süspansiyonu
            if (state.stoppedAt && stopElapsed < STOP_CUSHION_DURATION) {
                const t = stopElapsed / STOP_CUSHION_DURATION;
                const wave = Math.sin(t * Math.PI) * (1.0 - t);
                landingCushionY = wave * 1.5; // 1.5px diz ve platform taban çökmesi
                landingSquashScaleY = 1.0 - (wave * 0.035); // Dikey %3.5 yaylanma
            }

            if (this.playerMotionStates.size > 200) {
                for (let [id, s] of this.playerMotionStates.entries()) {
                    if (now - s.lastTime > 30000) this.playerMotionStates.delete(id);
                }
            }

            return {
                motionWeight: state.weight,
                turnScaleX,
                turnScaleY,
                turnTilt,
                landingCushionY,
                landingSquashScaleY,
                stateRef: state
            };
        }

        /**
         * Geriye Dönük Uyumluluk Sarmalayıcısı
         */
        static getPlayerMotionWeight(pId, isMoving, now) {
            return this.getPlayerMotionDynamics(pId, isMoving, 'down', false, now).motionWeight;
        }

        /**
         * 5. ADIM: Zemin Türü Algılama (Su, Sahil Kumu, Çimenlik, Sert Zemin)
         */
        static getSurfaceType(x, y) {
            if (typeof currentRoom === 'undefined') return 'solid';

            // 1. Su Kontrolü
            let inWater = false;
            if (currentRoom === 'sahilv2' && typeof isSahilV2Water === 'function') {
                inWater = isSahilV2Water(x, y);
            } else if (currentRoom === 'sahil') {
                let onPier = (x >= 70 && x <= 555 && y >= 150 && y <= 235);
                let shoreX = (typeof getBeachShoreX === 'function') ? getBeachShoreX(y) : 300;
                inWater = (x < shoreX && !onPier);
            }
            if (inWater) return 'water';

            // 2. Ahşap İskele & Ahşap Zeminli Mekanlar
            if (currentRoom === 'sahil') {
                let onPier = (x >= 70 && x <= 555 && y >= 150 && y <= 235);
                if (onPier) return 'wood';
            }
            if (currentRoom === 'kafe' || currentRoom === 'dostlar_kiraathanesi' || currentRoom === 'nargile_cafe' || currentRoom === 'bar' || currentRoom === 'ev' || currentRoom === 'ev_salon') {
                return 'wood';
            }

            // 3. Sahil Kumu Kontrolü (İskele değilse ve su değilse)
            if (currentRoom === 'sahil' || currentRoom === 'sahilv2') {
                let onPier = (currentRoom === 'sahil' && x >= 70 && x <= 555 && y >= 150 && y <= 235);
                if (!onPier) return 'sand';
            }

            // 4. Çimenlik Park / Bahçe Kontrolü
            if (currentRoom === 'bahce' || currentRoom === 'park' || currentRoom === 'orman' || currentRoom === 'ciftlik' || currentRoom === 'villa_bahce') {
                return 'grass';
            }

            return 'solid';
        }

        /**
         * 6. ADIM: Adım Basma Efekti (Expanding Water Ripples, Beach Sand Specks & Anime Dust Puffs)
         */
        static spawnFootstepParticle(pX, pY, facing, isLeftFoot, isSprinting) {
            if (!this.footstepParticles) this.footstepParticles = [];
            if (this.footstepParticles.length > 70) {
                this.footstepParticles.splice(0, 15); // Havuz taşmasını önle (Zero-lag)
            }

            const surface = this.getSurfaceType(pX, pY);
            const now = Date.now();

            let footOffsetX = 0;
            let footOffsetY = 21.0;

            const isLeft = (facing === 'left' || facing === 'down-left' || facing === 'up-left');
            const isProfile = (facing === 'left' || facing === 'right');
            const isDiagonal = (facing.includes('-'));

            if (isProfile) {
                footOffsetX = (isLeftFoot ? -4.5 : 4.5) * (isLeft ? -1 : 1);
            } else if (isDiagonal) {
                footOffsetX = (isLeftFoot ? -3.6 : 3.2) * (isLeft ? -1 : 1);
            } else {
                footOffsetX = isLeftFoot ? -4.2 : 4.2;
            }

            const footX = pX + footOffsetX;
            const footY = pY + footOffsetY;

            let dirX = 0;
            let dirY = 0;
            if (facing.includes('right')) dirX = 1;
            if (facing.includes('left')) dirX = -1;
            if (facing.includes('down')) dirY = 1;
            if (facing.includes('up')) dirY = -1;
            if (dirX === 0 && dirY === 0) dirY = 1;

            if (surface === 'water') {
                // SU HALKASI: Genişleyen şeffaf su halkası
                this.footstepParticles.push({
                    type: 'water_ripple',
                    x: footX,
                    y: footY,
                    radiusX: 3.5,
                    radiusY: 1.6,
                    maxRadiusX: isSprinting ? 14.5 : 11.0,
                    maxRadiusY: isSprinting ? 5.5 : 4.0,
                    alpha: 0.75,
                    duration: isSprinting ? 460 : 380,
                    startTime: now
                });

                if (isSprinting) {
                    for (let i = 0; i < 3; i++) {
                        const spread = (Math.random() - 0.5) * 1.6;
                        this.footstepParticles.push({
                            type: 'water_splash',
                            x: footX + (Math.random() - 0.5) * 4,
                            y: footY - 1,
                            vx: -dirX * 0.8 + spread,
                            vy: -1.2 - Math.random() * 1.0,
                            size: 1.2 + Math.random() * 0.8,
                            alpha: 0.85,
                            duration: 320,
                            startTime: now
                        });
                    }
                }
            } else if (surface === 'sand') {
                // SAHİL KUMU: Arkaya doğru fırlayan sıcak altın sarısı kum tanecikleri
                const speckCount = isSprinting ? 4 : 2;
                const sandColors = ['#f59e0b', '#fbbf24', '#d97706', '#fde68a'];
                for (let i = 0; i < speckCount; i++) {
                    const spread = (Math.random() - 0.5) * 1.2;
                    this.footstepParticles.push({
                        type: 'sand_speck',
                        x: footX + (Math.random() - 0.5) * 3,
                        y: footY - 1,
                        vx: -dirX * (isSprinting ? 1.4 : 0.8) + spread,
                        vy: -0.8 - Math.random() * 1.2,
                        color: sandColors[Math.floor(Math.random() * sandColors.length)],
                        size: 1.0 + Math.random() * 0.9,
                        alpha: 0.85,
                        duration: isSprinting ? 340 : 260,
                        startTime: now
                    });
                }
            } else if (surface === 'grass') {
                // ÇİMENLİK: Hafif yeşil çimen kırıntıları
                const grassColors = ['#22c55e', '#16a34a', '#84cc16'];
                const count = isSprinting ? 2 : 1;
                for (let i = 0; i < count; i++) {
                    this.footstepParticles.push({
                        type: 'grass_speck',
                        x: footX + (Math.random() - 0.5) * 2,
                        y: footY - 1,
                        vx: -dirX * 0.7 + (Math.random() - 0.5) * 0.8,
                        vy: -0.6 - Math.random() * 0.8,
                        color: grassColors[Math.floor(Math.random() * grassColors.length)],
                        size: 1.1 + Math.random() * 0.8,
                        alpha: 0.8,
                        duration: 260,
                        startTime: now
                    });
                }
            } else {
                // SERT ZEMİN / ASFALT: Sadece Shift ile koşulduğunda anime adım tozu (Dust Puffs)
                if (isSprinting) {
                    this.footstepParticles.push({
                        type: 'dust_puff',
                        x: footX - dirX * 2.0,
                        y: footY - 1.5,
                        vx: -dirX * 0.6 + (Math.random() - 0.5) * 0.5,
                        vy: -0.2 - Math.random() * 0.3,
                        radius: 2.2,
                        maxRadius: 5.8,
                        alpha: 0.65,
                        duration: 340,
                        startTime: now
                    });
                    this.footstepParticles.push({
                        type: 'dust_puff',
                        x: footX - dirX * 3.5 + (Math.random() - 0.5) * 2,
                        y: footY - 0.8,
                        vx: -dirX * 0.4 + (Math.random() - 0.5) * 0.4,
                        vy: -0.15 - Math.random() * 0.2,
                        radius: 1.4,
                        maxRadius: 3.8,
                        alpha: 0.55,
                        duration: 280,
                        startTime: now
                    });
                }
            }
        }

        /**
         * 7. ADIM: Zemin Parçacıklarının Güncellenmesi & Çizilmesi (GPU & 60-120 FPS Dostu)
         */
        static updateAndDrawFootstepParticles(ctx) {
            if (!this.footstepParticles || this.footstepParticles.length === 0) return;
            const now = Date.now();
            ctx.save();

            for (let i = this.footstepParticles.length - 1; i >= 0; i--) {
                const p = this.footstepParticles[i];
                const elapsed = now - p.startTime;
                if (elapsed >= p.duration) {
                    this.footstepParticles.splice(i, 1);
                    continue;
                }

                const t = elapsed / p.duration;
                const currentAlpha = p.alpha * (1.0 - t);

                if (p.type === 'water_ripple') {
                    const rx = p.radiusX + (p.maxRadiusX - p.radiusX) * Math.sin(t * (Math.PI / 2));
                    const ry = p.radiusY + (p.maxRadiusY - p.radiusY) * Math.sin(t * (Math.PI / 2));

                    ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha.toFixed(3)})`;
                    ctx.lineWidth = 1.3 * (1.0 - t * 0.4);
                    ctx.beginPath();
                    ctx.ellipse(p.x, p.y, rx, ry, 0, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.strokeStyle = `rgba(56, 189, 248, ${(currentAlpha * 0.6).toFixed(3)})`;
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.ellipse(p.x, p.y, Math.max(1, rx * 0.65), Math.max(0.5, ry * 0.65), 0, 0, Math.PI * 2);
                    ctx.stroke();

                } else if (p.type === 'water_splash') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.08;
                    ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha.toFixed(3)})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, Math.max(0.6, p.size * (1.0 - t * 0.4)), 0, Math.PI * 2);
                    ctx.fill();

                } else if (p.type === 'sand_speck' || p.type === 'grass_speck') {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.07;
                    ctx.fillStyle = p.color;
                    ctx.globalAlpha = Math.max(0, currentAlpha);
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;

                } else if (p.type === 'dust_puff') {
                    p.x += p.vx;
                    p.y += p.vy;
                    const r = p.radius + (p.maxRadius - p.radius) * Math.sin(t * (Math.PI / 2));

                    ctx.fillStyle = `rgba(203, 213, 225, ${(currentAlpha * 0.7).toFixed(3)})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = `rgba(248, 250, 252, ${(currentAlpha * 0.9).toFixed(3)})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y - 0.5, Math.max(0.5, r * 0.55), 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
        }

        static loadSpriteSheet(imageSrc, atlasJson = null) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                Karakter2Renderer.spriteSheetImage = img;
                Karakter2Renderer.spriteAtlasData = atlasJson;
            };
            img.src = imageSrc;
        }

        /**
         * Zemin Yumuşak Elips Gölgesi (İniş Yaylanması ve Adım Şokuna Göre Esner)
         */
        static drawGroundShadow(ctx, isMoving, bounceY, cushionY = 0) {
            ctx.save();
            ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
            const scale = isMoving ? (1.0 - Math.min(0.18, bounceY * 0.08)) : (1.0 + cushionY * 0.06);
            ctx.beginPath();
            ctx.ellipse(0, 21.0, 11.5 * scale, 3.8 * scale, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        /**
         * Taktik Kargo Jogger - Bel & Kalça (Pelvis)
         */
        static drawCargoPelvis(ctx, y, cargoColor, pocketColor, strapColor, facing, isFemale, isSkaterPants = false) {
            ctx.save();
            ctx.translate(0, y);
            ctx.fillStyle = cargoColor;

            const isProfile = (facing === 'right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const isBack = (facing === 'up' || facing === 'up-right');

            const pWidth = isFemale ? 13.0 : 14.8;

            if (isProfile) {
                // Profil Kalça (Derinlik 10.2px)
                ctx.beginPath();
                ctx.roundRect(-4.8, -2.5, 9.8, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                // Kemer
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-4.8, -2.5, 9.8, 1.9);
                // Yan Kemer Köprüsü
                ctx.fillStyle = "#64748b";
                ctx.fillRect(0, -2.5, 1.4, 2.2);

            } else if (isDiagonal) {
                // 3/4 Çapraz Kalça
                ctx.beginPath();
                ctx.roundRect(-pWidth * 0.50, -2.5, pWidth, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-pWidth * 0.50, -2.5, pWidth, 1.9);
                // Toka
                ctx.fillStyle = "#94a3b8";
                ctx.fillRect(isBack ? 1.5 : -1.6, -2.5, 2.4, 2.2);

            } else if (isBack) {
                // Tam Sırt Kalça
                ctx.beginPath();
                ctx.roundRect(-pWidth / 2, -2.5, pWidth, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-pWidth / 2, -2.5, pWidth, 1.9);
                // Arka kemer köprüleri
                ctx.fillStyle = cargoColor;
                ctx.fillRect(-3.8, -2.5, 1.4, 2.2);
                ctx.fillRect(2.4, -2.5, 1.4, 2.2);
                ctx.strokeStyle = "rgba(0,0,0,0.25)";
                ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(0, -0.6); ctx.lineTo(0, 2.7); ctx.stroke();

            } else {
                // Tam Ön Kalça
                ctx.beginPath();
                ctx.roundRect(-pWidth / 2, -2.5, pWidth, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-pWidth / 2, -2.5, pWidth, 1.9);
                // Metalik Toka
                ctx.fillStyle = "#94a3b8";
                ctx.fillRect(-1.2, -2.5, 2.6, 2.2);
                ctx.strokeStyle = "rgba(0,0,0,0.28)";
                ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(0.1, -0.5); ctx.lineTo(0.1, 2.7); ctx.stroke();
            }

            // Skater Pantolon İçin Gümüş Cüzdan / Pantolon Zinciri
            if (isSkaterPants) {
                ctx.strokeStyle = "#cbd5e1";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(0, -0.6);
                    ctx.quadraticCurveTo(2.4, 2.8, 3.8, 0.4);
                } else if (!isBack) {
                    ctx.moveTo(1.2, -0.6);
                    ctx.quadraticCurveTo(4.2, 3.0, 5.8, 0.2);
                }
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * Karakter 2 Sokak Stili Elbise Eteği (A-Line Cyber Mini & Pleated Gothic Skirt)
         */
        static drawDressSkirt(ctx, y, facing, isK2CyberDress = false, isK2GothDress = false, skirtColor = '#0ea5e9', isK2CargoMini = false) {
            ctx.save();
            ctx.translate(0, y);

            const isProfile = (facing === 'right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const isBack = (facing === 'up' || facing === 'up-right');

            const waistW = 12.0;
            const hemW = isProfile ? 10.5 : 17.5;
            const skirtLen = 8.5;

            if (isK2CargoMini) {
                // TAKTİK URBAN KARGO MİNİ ETEK
                ctx.fillStyle = "#1e293b"; // Koyu taktik grafit
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 2.5);
                    ctx.lineTo(-hemW * 0.42, skirtLen - 2.5);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(-hemW / 2, skirtLen - 2.5);
                }
                ctx.closePath();
                ctx.fill();

                // Etek Pilileri
                ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                [-3.5, 0, 3.5].forEach(px => {
                    ctx.moveTo(px * 0.6, -1.0);
                    ctx.lineTo(px * 1.1, skirtLen - 2.5);
                });
                ctx.stroke();

                // Taktik Kemer & Metalik Toka
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 2.0);
                ctx.fillStyle = "#cbd5e1"; // Gümüş toka
                ctx.fillRect(-1.4, -2.5, 2.8, 2.0);

                // Yan Kargo Flap Cep & Gümüş Perçin
                if (!isBack) {
                    ctx.fillStyle = "#334155";
                    ctx.fillRect(isProfile ? 1.0 : -waistW * 0.42, 0.5, 3.2, 3.8);
                    ctx.fillStyle = "#cbd5e1";
                    ctx.beginPath();
                    ctx.arc(isProfile ? 2.6 : -waistW * 0.42 + 1.6, 1.8, 0.45, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else if (isK2CyberDress) {
                // SİBER NEON A-LINE MİNİ ETEK
                ctx.fillStyle = "#0f172a"; // Koyu taktik zemin
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 2.5);
                    ctx.lineTo(-hemW * 0.42, skirtLen - 2.5);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(-hemW / 2, skirtLen - 2.5);
                }
                ctx.closePath();
                ctx.fill();

                // Neon Mavi & Pembe Asimetrik Bindirme Katmanı
                ctx.fillStyle = skirtColor;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.2, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 3.2);
                    ctx.lineTo(-waistW * 0.1, skirtLen - 4.5);
                } else if (!isBack) {
                    ctx.moveTo(-waistW * 0.1, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.8);
                    ctx.lineTo(-waistW * 0.2, skirtLen - 4.0);
                } else {
                    ctx.moveTo(-waistW * 0.3, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(-waistW * 0.3, skirtLen - 2.5);
                }
                ctx.closePath();
                ctx.fill();

                // Neon Pembe Etek Ucu Şeridi
                ctx.strokeStyle = "#ec4899";
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-hemW * 0.42, skirtLen - 2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 2.5);
                } else {
                    ctx.moveTo(-hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                }
                ctx.stroke();

                // Taktik Kemer & Toka
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 2.0);
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-1.5, -2.5, 3.0, 2.0);

            } else if (isK2GothDress) {
                // GOTİK GRUNGE PİLELİ ÇİFT KATMANLI ETEK
                // Alt katman: Koyu bordo/mor (#3b0764)
                ctx.fillStyle = "#3b0764";
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.35, -2.5);
                    ctx.lineTo(waistW * 0.35, -2.5);
                    ctx.lineTo(hemW * 0.52, skirtLen - 1.8);
                    ctx.lineTo(-hemW * 0.45, skirtLen - 1.8);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2 + 0.8, skirtLen - 1.8);
                    ctx.lineTo(-hemW / 2 - 0.8, skirtLen - 1.8);
                }
                ctx.closePath();
                ctx.fill();

                // Üst Katman: Derin Gotik Mor/Siyah (#181124)
                ctx.fillStyle = "#181124";
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.46, skirtLen - 3.5);
                    ctx.lineTo(-hemW * 0.40, skirtLen - 3.5);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2 - 0.6, skirtLen - 3.5);
                    ctx.lineTo(-hemW / 2 + 0.6, skirtLen - 3.5);
                }
                ctx.closePath();
                ctx.fill();

                // Pile Dikişleri (Pleats)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                const pleatSteps = isProfile ? [-2.0, 0, 2.0] : [-5.0, -2.5, 0, 2.5, 5.0];
                pleatSteps.forEach(px => {
                    ctx.moveTo(px * 0.7, -1.0);
                    ctx.lineTo(px * 1.1, skirtLen - 3.5);
                });
                ctx.stroke();

                // Sallanan Gümüş Metal Zincir (Silver Grunge Chain)
                ctx.strokeStyle = "#cbd5e1";
                ctx.lineWidth = 0.9;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-1.0, -1.0);
                    ctx.quadraticCurveTo(1.5, 3.2, 3.8, 0.8);
                } else if (!isBack) {
                    ctx.moveTo(-3.2, -1.0);
                    ctx.quadraticCurveTo(0, 3.5, 4.2, -0.6);
                }
                ctx.stroke();

                // Korse Taban Kemeri & Gümüş Kuşgözü/Toka
                ctx.fillStyle = "#09090b";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 2.2);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-1.2, -2.5, 2.4, 2.2);

            } else {
                // Klasik Kadın Elbisesi Eteği Fallback
                ctx.fillStyle = skirtColor;
                ctx.beginPath();
                ctx.moveTo(-waistW / 2, -2.5);
                ctx.lineTo(waistW / 2, -2.5);
                ctx.lineTo(hemW / 2, skirtLen - 2.5);
                ctx.lineTo(-hemW / 2, skirtLen - 2.5);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * Oversize Streetwear Tişört (Torso)
         */
        static drawStreetwearTorso(ctx, y, teeColor, teeAccent, isCyberTee, facing, isFemale, breathScaleX = 1.0, isGraffitiTee = false, isDress = false, isK2CyberDress = false, isK2GothDress = false, isK2CyberCrop = false, isK2GrungeOversize = false, isK2PastelHoodie = false, skinColor = '#ffd1a4') {
            ctx.save();
            ctx.translate(0, y);
            if (breathScaleX !== 1.0) {
                ctx.scale(breathScaleX, 1.0);
            }
            if (isK2GothDress) {
                ctx.fillStyle = "#181124";
            } else if (isK2CyberDress) {
                ctx.fillStyle = "#0f172a";
            } else if (isK2CyberCrop) {
                ctx.fillStyle = "#06b6d4";
            } else if (isK2GrungeOversize) {
                ctx.fillStyle = "#4c1d95";
            } else if (isK2PastelHoodie) {
                ctx.fillStyle = "#f472b6";
            } else {
                ctx.fillStyle = teeColor;
            }

            const isProfile = (facing === 'right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const isBack = (facing === 'up' || facing === 'up-right');

            const chestW = isFemale ? 15.6 : 19.8;
            const waistW = isFemale ? 11.2 : 15.2;

            ctx.beginPath();

            if (isProfile) {
                // YAN PROFİL (Dolgun, doğal 3D gövde & omuz eğimi)
                ctx.moveTo(-4.6, 4.5);
                ctx.lineTo(5.4, 4.5);
                ctx.lineTo(6.2, -5.2);
                ctx.quadraticCurveTo(6.0, -7.0, 3.2, -8.5); // Ön köprücük kemiği / yaka eğimi
                ctx.lineTo(0.5, -8.5);
                ctx.quadraticCurveTo(-2.8, -8.5, -4.8, -7.8); // Ense ve sırt trapez eğimi (yaka tabanıyla pürüzsüz birleşir)
                ctx.quadraticCurveTo(-5.2, -6.5, -4.8, -5.2);
                ctx.closePath();
                ctx.fill();

                // Omuz Dikişi & Göğüs Çizgisi
                ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(3.2, -8.5); ctx.lineTo(1.8, -6.5); ctx.stroke();

                ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, -8.5); ctx.lineTo(0, 4.5); ctx.stroke();

                if (isK2CyberDress) {
                    // Yan profil neon pembe omuz askısı & siber panel
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(1.2, -8.5, 1.8, 3.5);
                    ctx.fillStyle = "#0ea5e9";
                    ctx.fillRect(3.8, -5.5, 1.4, 7.5);
                } else if (isK2GothDress) {
                    // Yan profil gotik korse dikişi & mor panel
                    ctx.fillStyle = "#581c87";
                    ctx.fillRect(1.5, -5.0, 2.5, 9.0);
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(3.5, -4.0); ctx.lineTo(3.5, 3.5);
                    ctx.stroke();
                } else if (isCyberTee) {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(3.8, -6.5, 1.2, 8.5); // Göğüs ön çizgisi
                } else if (isGraffitiTee) {
                    // Yan profil neon sprey lekesi
                    ctx.fillStyle = "#ec4899";
                    ctx.beginPath(); ctx.arc(3.0, -2.5, 2.0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#22c55e";
                    ctx.beginPath(); ctx.arc(2.0, 0.8, 1.6, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#facc15";
                    ctx.fillRect(3.6, -4.5, 1.2, 7.0);
                }

            } else if (isDiagonal) {
                // 3/4 İZOMETRİK ÇAPRAZ GÖVDE
                if (isBack) {
                    // 3/4 Sırt (Doğal omuz eğimi & trapez hattı)
                    ctx.moveTo(-waistW * 0.44, 4.5);
                    ctx.lineTo(waistW * 0.54, 4.5);
                    ctx.lineTo(chestW * 0.54, -5.2);
                    ctx.quadraticCurveTo(chestW * 0.54, -6.8, chestW * 0.54 - 0.6, -7.0);
                    ctx.lineTo(4.2, -8.5);
                    ctx.lineTo(-2.6, -8.5);
                    ctx.lineTo(-chestW * 0.44 + 0.6, -6.8);
                    ctx.quadraticCurveTo(-chestW * 0.44, -6.8, -chestW * 0.44, -5.2);
                    ctx.closePath();
                    ctx.fill();

                    // 3/4 Ense Mock-Neck Taban Dikişi
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                    ctx.lineWidth = 1.1;
                    ctx.beginPath();
                    ctx.moveTo(-2.6, -8.5);
                    ctx.quadraticCurveTo(0.8, -8.0, 4.2, -8.5);
                    ctx.stroke();

                    // Sırt 02 Numarası veya Grafiti Tag
                    if (isCyberTee) {
                        ctx.fillStyle = teeAccent;
                        ctx.fillRect(-3.0, -4.5, 9.5, 1.6);
                        ctx.fillStyle = "#38bdf8";
                        ctx.font = "bold 6px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("02", 1.8, 2.0);
                    } else if (isGraffitiTee) {
                        ctx.fillStyle = "#22c55e";
                        ctx.fillRect(-2.5, -4.0, 8.5, 2.0);
                        ctx.fillStyle = "#ec4899";
                        ctx.font = "bold 5px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("SK8", 1.8, 1.5);
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath(); ctx.arc(4.5, 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
                    } else {
                        ctx.fillStyle = teeAccent;
                        ctx.fillRect(-3.0, -4.5, 9.5, 1.6);
                    }
                } else {
                    // 3/4 Ön Göğüs (Doğal omuz eğimi & trapez hattı)
                    ctx.moveTo(-waistW * 0.52, 4.5);
                    ctx.lineTo(waistW * 0.46, 4.5);
                    ctx.lineTo(chestW * 0.46, -5.2);
                    ctx.quadraticCurveTo(chestW * 0.46, -6.8, chestW * 0.46 - 0.6, -7.0);
                    ctx.lineTo(3.4, -8.5);
                    ctx.lineTo(-4.4, -8.5);
                    ctx.lineTo(-chestW * 0.52 + 0.6, -6.8);
                    ctx.quadraticCurveTo(-chestW * 0.52, -6.8, -chestW * 0.52, -5.2);
                    ctx.closePath();
                    ctx.fill();

                    // 3/4 Streetwear Mock-Neck Taban Dikişi
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                    ctx.lineWidth = 1.1;
                    ctx.beginPath();
                    ctx.moveTo(-4.4, -8.5);
                    ctx.quadraticCurveTo(-0.5, -7.5, 3.4, -8.5);
                    ctx.stroke();

                    // Minimalist Taktik Göğüs Cebi & Cyber Şerit
                    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
                    ctx.fillRect(-3.6, -5.5, 4.8, 5.2);
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(-3.6, -5.5, 4.8, 1.0);

                    if (isK2CyberDress) {
                        ctx.fillStyle = "#ec4899";
                        ctx.fillRect(-3.6, -8.5, 1.5, 5.0);
                        ctx.fillRect(1.8, -8.5, 1.5, 5.0);
                        ctx.fillStyle = "#0ea5e9";
                        ctx.fillRect(-1.5, -4.0, 3.8, 6.5);
                    } else if (isK2GothDress) {
                        ctx.fillStyle = "#581c87";
                        ctx.fillRect(-2.2, -4.5, 4.4, 7.5);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(-1.8, -3.5); ctx.lineTo(1.8, -1.5);
                        ctx.moveTo(1.8, -3.5); ctx.lineTo(-1.8, -1.5);
                        ctx.moveTo(-1.6, -1.5); ctx.lineTo(1.6, 1.0);
                        ctx.stroke();
                    } else if (isCyberTee) {
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath();
                        ctx.moveTo(-1.2, -4.0); ctx.lineTo(-2.2, -2.5); ctx.lineTo(-1.3, -2.5);
                        ctx.lineTo(-2.0, -1.0); ctx.lineTo(-0.4, -2.7); ctx.lineTo(-1.3, -2.7);
                        ctx.closePath(); ctx.fill();
                    } else if (isGraffitiTee) {
                        // 3/4 Grafiti Sprey Sıçraması
                        ctx.fillStyle = "#ec4899";
                        ctx.beginPath(); ctx.arc(-1.2, -2.5, 2.2, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#22c55e";
                        ctx.beginPath(); ctx.arc(1.0, -1.0, 1.7, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath(); ctx.arc(-2.6, -0.6, 1.1, 0, Math.PI * 2); ctx.fill();
                    }
                }

            } else if (isBack) {
                // TAM SIRT (Kuzey - Doğal trapez eğimi & yuvarlatılmış omuz başları)
                ctx.moveTo(-waistW / 2, 4.5);
                ctx.lineTo(waistW / 2, 4.5);
                ctx.lineTo(chestW / 2, -5.2);
                ctx.quadraticCurveTo(chestW / 2, -6.8, chestW / 2 - 0.6, -6.9);
                ctx.lineTo(4.2, -8.5);
                ctx.lineTo(-4.2, -8.5);
                ctx.lineTo(-chestW / 2 + 0.6, -6.9);
                ctx.quadraticCurveTo(-chestW / 2, -6.8, -chestW / 2, -5.2);
                ctx.closePath();
                ctx.fill();

                // Ense Mock-Neck Taban Dikişi
                ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(-4.2, -8.5);
                ctx.quadraticCurveTo(0, -8.0, 4.2, -8.5);
                ctx.stroke();

                // Dikiş
                ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-7.5, -6.0); ctx.lineTo(7.5, -6.0);
                ctx.moveTo(0, -6.0); ctx.lineTo(0, 4.5);
                ctx.stroke();

                if (isK2CyberDress) {
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(-4.5, -8.5, 1.6, 6.5);
                    ctx.fillRect(2.9, -8.5, 1.6, 6.5);
                    ctx.fillStyle = "#0ea5e9";
                    ctx.fillRect(-2.0, -3.0, 4.0, 5.5);
                } else if (isK2GothDress) {
                    ctx.fillStyle = "#581c87";
                    ctx.fillRect(-3.0, -5.0, 6.0, 8.5);
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(-2.0, -4.0); ctx.lineTo(2.0, -1.5);
                    ctx.moveTo(2.0, -4.0); ctx.lineTo(-2.0, -1.5);
                    ctx.stroke();
                } else if (isCyberTee) {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(-5.5, -4.5, 11.0, 1.6);
                    ctx.fillStyle = "#38bdf8";
                    ctx.font = "bold 6px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("02", 0, 2.0);
                } else if (isGraffitiTee) {
                    // Devasa neon yeşil sprey aurası
                    ctx.fillStyle = "#22c55e";
                    ctx.beginPath();
                    ctx.ellipse(0, -1.5, 6.4, 3.8, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // "SKATE" Kalın Grafiti Sokak Tag'i (Drop shadow ile temiz ve okunaklı)
                    ctx.fillStyle = "#0f172a";
                    ctx.font = "900 6.5px 'Impact', sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("SKATE", 0.6, 1.1); // Drop shadow
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText("SKATE", 0, 0.6);   // Canlı neon pembe ana tag

                    // Parlayan sarı sprey sıçramaları (Bağımsız damlacıklar - çokgen hatası yok)
                    ctx.fillStyle = "#facc15";
                    [[-4.5, -3.2, 0.9], [4.2, -2.8, 1.0], [3.0, 2.5, 0.8]].forEach(([dx, dy, dr]) => {
                        ctx.beginPath();
                        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
                        ctx.fill();
                    });
                } else {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(-5.5, -4.5, 11.0, 1.6);
                }

            } else {
                // TAM ÖN GÖĞÜS (Güney - Doğal trapez eğimi & düşük omuz kavisleri)
                if (isFemale) {
                    // Kum Saati Korse & Bel Oyuntusu
                    ctx.moveTo(-waistW / 2, 4.5);
                    ctx.quadraticCurveTo(0, 4.8, waistW / 2, 4.5);
                    ctx.quadraticCurveTo(waistW * 0.44, 0, chestW / 2, -5.2);
                    ctx.quadraticCurveTo(chestW / 2, -6.8, chestW / 2 - 0.6, -6.9);
                    ctx.lineTo(3.6, -8.5);
                    ctx.lineTo(-3.6, -8.5);
                    ctx.lineTo(-chestW / 2 + 0.6, -6.9);
                    ctx.quadraticCurveTo(-chestW / 2, -6.8, -chestW / 2, -5.2);
                    ctx.quadraticCurveTo(-waistW * 0.44, 0, -waistW / 2, 4.5);
                } else {
                    ctx.moveTo(-waistW / 2, 4.5);
                    ctx.quadraticCurveTo(0, 4.9, waistW / 2, 4.5); // Dökümlü sokak alt etek ucu
                    ctx.lineTo(chestW / 2, -5.2);
                    ctx.quadraticCurveTo(chestW / 2, -6.8, chestW / 2 - 0.6, -6.9); // Sağ omuz başı
                    ctx.lineTo(4.2, -8.5); // Sağ trapez eğimi
                    ctx.lineTo(-4.2, -8.5); // Yaka hattı
                    ctx.lineTo(-chestW / 2 + 0.6, -6.9); // Sol trapez eğimi
                    ctx.quadraticCurveTo(-chestW / 2, -6.8, -chestW / 2, -5.2); // Sol omuz başı
                }
                ctx.closePath();
                ctx.fill();

                // Streetwear Mock-Neck Taban Dikişi (Yüksek Yaka Seviyesi)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(-4.2, -8.5);
                ctx.quadraticCurveTo(0, -7.5, 4.2, -8.5);
                ctx.stroke();

                if (isK2CyberCrop) {
                    // Siber Crop Top: Neon pembe askılar & açık göbek ve göbek deliği
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(-3.8, -8.5, 1.4, 5.0);
                    ctx.fillRect(2.4, -8.5, 1.4, 5.0);
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(-waistW / 2 - 0.2, 0.8, waistW + 0.4, 3.8);
                    ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
                    ctx.beginPath();
                    ctx.arc(0, 2.6, 0.45, 0, Math.PI * 2);
                    ctx.fill();
                } else if (isK2GrungeOversize) {
                    // Grunge Düşük Omuz: Sol omuz açıkta ten
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.moveTo(-chestW / 2, -6.5);
                    ctx.lineTo(-0.8, -8.5);
                    ctx.lineTo(-0.8, -4.5);
                    ctx.lineTo(-chestW / 2, -4.0);
                    ctx.closePath();
                    ctx.fill();
                    // Grunge yırtık etek ucu detayı
                    ctx.fillStyle = "#181124";
                    ctx.fillRect(-2.5, 3.2, 5.0, 1.4);
                } else if (isK2PastelHoodie) {
                    // Pastel Crop Hoodie: Beyaz kapüşon ipleri & ribana
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-1.6, -7.5); ctx.lineTo(-1.8, -2.5);
                    ctx.moveTo(1.6, -7.5); ctx.lineTo(1.8, -2.5);
                    ctx.stroke();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(-waistW / 2, 3.2, waistW, 1.2);
                } else if (isK2CyberDress) {
                    // Cyber Neon Gövde: Neon pembe omuz askıları & siber göğüs paneli
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(-5.2, -8.5, 1.6, 6.0); // Sol askı
                    ctx.fillRect(3.6, -8.5, 1.6, 6.0);  // Sağ askı
                    ctx.fillStyle = "#0ea5e9";
                    ctx.beginPath();
                    ctx.moveTo(-3.0, -4.5); ctx.lineTo(3.0, -4.5);
                    ctx.lineTo(1.8, 3.0); ctx.lineTo(-1.8, 3.0);
                    ctx.closePath();
                    ctx.fill();
                    // Neon siber çekirdek
                    ctx.fillStyle = "#38bdf8";
                    ctx.beginPath(); ctx.arc(0, -1.0, 1.2, 0, Math.PI * 2); ctx.fill();
                } else if (isK2GothDress) {
                    // Gotik Korse Bodice: Derin mor panel & gümüş çapraz bağcıklar
                    ctx.fillStyle = "#581c87";
                    ctx.beginPath();
                    ctx.moveTo(-3.8, -5.5); ctx.lineTo(3.8, -5.5);
                    ctx.lineTo(2.4, 4.0); ctx.lineTo(-2.4, 4.0);
                    ctx.closePath();
                    ctx.fill();
                    // Gümüş Çapraz Korse Bağcıkları
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-2.8, -4.0); ctx.lineTo(2.8, -1.5);
                    ctx.moveTo(2.8, -4.0); ctx.lineTo(-2.8, -1.5);
                    ctx.moveTo(-2.5, -1.5); ctx.lineTo(2.5, 1.2);
                    ctx.moveTo(2.5, -1.5); ctx.lineTo(-2.5, 1.2);
                    ctx.moveTo(-2.2, 1.2); ctx.lineTo(2.2, 3.8);
                    ctx.moveTo(2.2, 1.2); ctx.lineTo(-2.2, 3.8);
                    ctx.stroke();
                } else {
                    // Minimalist Taktik Göğüs Cebi
                    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
                    ctx.fillRect(1.5, -5.5, 4.8, 5.2);
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(1.5, -5.5, 4.8, 1.0);

                    if (isCyberTee) {
                        // Neon Mavi Orta Dikiş & Şerit
                        ctx.fillStyle = teeAccent;
                        ctx.fillRect(-0.5, -6.0, 1.0, 10.5);

                        // Cep Üstü Neon Yıldırım İkonu
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath();
                        ctx.moveTo(3.9, -4.0); ctx.lineTo(2.9, -2.5); ctx.lineTo(3.8, -2.5);
                        ctx.lineTo(3.1, -1.0); ctx.lineTo(4.7, -2.7); ctx.lineTo(3.8, -2.7);
                        ctx.closePath(); ctx.fill();
                    } else if (isGraffitiTee) {
                        // Göğüs ortasında canlı grafiti sprey lekesi
                        ctx.fillStyle = "#ec4899";
                        ctx.beginPath(); ctx.arc(-1.5, -2.2, 2.8, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#22c55e";
                        ctx.beginPath(); ctx.arc(2.0, -1.0, 2.2, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath(); ctx.arc(0.2, 1.0, 1.6, 0, Math.PI * 2); ctx.fill();

                        // Cep üstü "SK8" mini tag
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 4px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("SK8", 3.8, -2.0);

                        // Sprey damlacıkları (Bağımsız damlacıklar)
                        ctx.fillStyle = "#ec4899";
                        [[-4.2, -3.5, 0.7], [-3.0, 2.2, 0.8], [5.2, 0.5, 0.7]].forEach(([dx, dy, dr]) => {
                            ctx.beginPath();
                            ctx.arc(dx, dy, dr, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }
                }
            }

            ctx.restore();
        }

        /**
         * Düşük Omuzlu Streetwear Kol & El (Yumuşak Kumaş & Doğal Sarkaç)
         */
        static drawStreetwearArm(ctx, shoulderX, shoulderY, angle, teeColor, teeAccent, skinColor, isCyberTee, isFar, handPose, smokeState, facing = 'down', isGraffitiTee = false, isFemale = false, isDress = false, isK2CyberDress = false, isK2GothDress = false, isSleeveless = false) {
            ctx.save();
            ctx.translate(shoulderX, shoulderY);
            ctx.rotate(angle);

            const isBack = (facing === 'up' || facing === 'up-right');
            const isProfile = (facing === 'right');
            const isRightSide = (shoulderX > 0);
            const bodyDir = isRightSide ? -1 : 1; // Gövdenin bulunduğu yön (iç kol)

            const armW = isFemale ? 4.2 : 5.6;
            const armLen = 12.0;
            const topW = isFemale ? 3.4 : 4.4;
            const wristW = isFemale ? 2.4 : 3.2;
            const wristY = armLen - 0.4;
            const isBareArm = isDress || isSleeveless;
            const sleeveLen = 6.2;

            if (isBareArm) {
                // 1. PÜRÜZSÜZ KADIN ANATOMİK KOLU (Tek Parça Deltoid Omuz -> Dirsek -> Zarif Bilek)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                // Yuvarlak anatomik omuz başı (deltoid)
                ctx.arc(0, 0, armW * 0.5, Math.PI, 0, false);
                // Dış hat: Omuzdan dirseğe (y: 5.8) ve bileğe (y: wristY) basamaksız yumuşak geçiş
                ctx.quadraticCurveTo(armW * 0.48, 2.8, topW * 0.5, 5.8);
                ctx.lineTo(wristW * 0.5, wristY);
                // Bilek ucu
                ctx.lineTo(-wristW * 0.5, wristY);
                // İç hat: Bilekten dirseğe ve omuz tabanına
                ctx.lineTo(-topW * 0.5, 5.8);
                ctx.quadraticCurveTo(-armW * 0.48, 2.8, -armW * 0.5, 0);
                ctx.closePath();
                ctx.fill();
            } else {
                // 1. T-Shirt Kolu (Düşük omuzlu dökümlü kumaş formu)
                ctx.fillStyle = teeColor;
                ctx.beginPath();
                const innerX = bodyDir * armW / 2;
                const outerX = -bodyDir * armW / 2;
                ctx.moveTo(innerX, -1.2);
                ctx.quadraticCurveTo(0, -1.3, outerX, -0.6); // Düşük omuz dikiş kavisi
                ctx.lineTo(outerX + (bodyDir < 0 ? 0.3 : -0.3), sleeveLen);
                ctx.lineTo(innerX + (bodyDir < 0 ? -0.3 : 0.3), sleeveLen);
                ctx.closePath();
                ctx.fill();

                if (isCyberTee) {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 1.2, armW + 0.4, 1.0);
                } else if (isGraffitiTee) {
                    ctx.fillStyle = "#ec4899"; // Neon pembe manşet şeridi
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 1.4, armW + 0.4, 0.8);
                    ctx.fillStyle = "#22c55e"; // Neon yeşil alt çizgi
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 0.6, armW + 0.4, 0.6);
                }

                // Kol ribanası / dikiş
                ctx.strokeStyle = "rgba(0,0,0,0.22)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(-armW / 2 - 0.3, sleeveLen); ctx.lineTo(armW / 2 + 0.3, sleeveLen);
                ctx.stroke();

                // 2. Ön Kol (Kumaş kolun altından çıkan ten)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.moveTo(-topW / 2, sleeveLen - 0.2);
                ctx.lineTo(topW / 2, sleeveLen - 0.2);
                ctx.lineTo(wristW / 2, wristY);
                ctx.lineTo(-wristW / 2, wristY);
                ctx.closePath();
                ctx.fill();
            }

            // Gövdeye bakan iç kol gölgesi (Ambient Occlusion - Kolların gövdeye yapışıklığını kırar)
            const startOcclusionY = isBareArm ? 4.5 : sleeveLen;
            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.beginPath();
            if (bodyDir < 0) {
                // Gövde solda
                ctx.moveTo(-topW / 2, startOcclusionY);
                ctx.lineTo(-topW / 2 + 1.1, startOcclusionY);
                ctx.lineTo(-wristW / 2 + 0.8, wristY);
                ctx.lineTo(-wristW / 2, wristY);
            } else {
                // Gövde sağda
                ctx.moveTo(topW / 2, startOcclusionY);
                ctx.lineTo(topW / 2 - 1.1, startOcclusionY);
                ctx.lineTo(wristW / 2 - 0.8, wristY);
                ctx.lineTo(wristW / 2, wristY);
            }
            ctx.closePath();
            ctx.fill();

            // Elbise Bilek Aksesuarları
            if (isK2CyberDress) {
                ctx.fillStyle = "#0ea5e9";
                ctx.fillRect(-wristW / 2 - 0.4, wristY - 2.2, wristW + 0.8, 1.8);
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-wristW / 2 - 0.4, wristY - 1.2, wristW + 0.8, 0.6);
            } else if (isK2GothDress) {
                ctx.fillStyle = "#09090b";
                ctx.fillRect(-wristW / 2 - 0.4, wristY - 2.2, wristW + 0.8, 1.8);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-0.4, wristY - 1.7, 0.8, 0.8);
            }

            // Bilek eklem çizgisi (Doğal eklem geçişi)
            ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-wristW / 2 + 0.3, wristY);
            ctx.lineTo(wristW / 2 - 0.3, wristY);
            ctx.stroke();

            // 3. El Çizimi (Açıya Duyarlı: Arkadan El Sırtı, Önden Dinlenen El, Profilde Yan El)
            ctx.save();
            ctx.translate(0, wristY + 0.3);
            this.drawHandAtOrigin(ctx, skinColor, handPose, smokeState, facing, isBack, isProfile, bodyDir);
            ctx.restore();

            // Arka kol derinlik gölgesi (Omuzdan parmak ucuna kadar kolun tamamını gölgeler)
            if (isFar) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                ctx.beginPath();
                ctx.roundRect(-armW / 2 - 0.2, -1.2, armW + 0.4, armLen + 3.6, 2);
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * 2.5. Articulated Streetwear Smoking Arm (Dirsekten Bükülen & Ağza Erişen Kol)
         * Omuz yerinde sabit kalır, dirsek bükülür, ön kol göğsü çizerek ağza çıkar.
         * Kafanın önünde çizildiği için asla çenenin/boynun içine geçmez.
         * Filtre tam dudak noktasına (mouthX, mouthY) oturur, sigara dışarı havaya uzanır.
         */
        static drawStreetwearSmokingArm(ctx, shoulderX, shoulderY, mouthX, mouthY, liftProgress, teeColor, teeAccent, skinColor, isCyberTee, isGraffitiTee, effFacing, smokeState, isSitting = false, isMoving = false, lighterArmShoulder = null, isSprinting = false) {
            ctx.save();

            // 1. Omuz, Dirsek, Bilek ve Sigara Kinematiği
            let idleElbowX, idleElbowY, idleWristX, idleWristY, idleCigAngle;
            let liftedElbowX, liftedElbowY, liftedWristX, liftedWristY, liftedCigAngle;

            if (effFacing === 'down') {
                // Tam Ön Bakış (Güney) - Kol vücudun dış yanına doğal sarkar, sigara tıpkı Karakter 1 gibi yana (dışarıya) bakar!
                idleElbowX = shoulderX - 1.2;
                idleElbowY = shoulderY + 5.8;
                idleWristX = shoulderX - 2.2;
                idleWristY = shoulderY + 10.8;
                idleCigAngle = 2.88; // ~165° (Bilekten yana/dışarı doğru neredeyse yatay, Karakter 1 gibi karizmatik yana bakar!)

                // Sigara ağızdayken: Sağ el sol göğüsten ağza çıkar
                // Dirsek kaburga yanında doğal durur (omuz kumaşı boyna girmez!)
                liftedElbowX = shoulderX + 2.0;
                liftedElbowY = shoulderY + 6.2;
                liftedWristX = mouthX - 3.6;
                liftedWristY = mouthY + 2.4;
                liftedCigAngle = 2.80; // Ağızdan dışarı sola doğru ~160° açıyla uzanır

            } else if (effFacing === 'down-right') {
                // 3/4 Çapraz Bakış (Güney-Doğu) - Sigara dış yana doğru bakar
                idleElbowX = shoulderX - 1.0;
                idleElbowY = shoulderY + 5.6;
                idleWristX = shoulderX - 1.8;
                idleWristY = shoulderY + 10.6;
                idleCigAngle = 2.78; // ~159° (Yana ve hafif ileri doğru, bacağa değmeden yana bakar)

                liftedElbowX = shoulderX + 1.8;
                liftedElbowY = shoulderY + 5.5;
                liftedWristX = mouthX - 1.2;
                liftedWristY = mouthY + 2.6;
                liftedCigAngle = 0.35; // Yüzün baktığı yöne (sağ ileri) doğru ~20° uzanır

            } else if (effFacing === 'right') {
                // Sağ Yan Profil (Doğu)
                idleElbowX = shoulderX + 1.6;
                idleElbowY = shoulderY + 5.4;
                idleWristX = shoulderX + 2.8;
                idleWristY = shoulderY + 10.4;
                idleCigAngle = 0.28; // ~16° (Sağ profile bakarken yana/öne doğru yatay)

                liftedElbowX = shoulderX + 1.6;
                liftedElbowY = shoulderY + 5.0;
                liftedWristX = mouthX - 1.4;
                liftedWristY = mouthY + 2.8;
                liftedCigAngle = 0.05; // Tam ileriye doğru yatay uzanır

            } else {
                // Diğer Açılar
                idleElbowX = shoulderX - 1.0;
                idleElbowY = shoulderY + 5.8;
                idleWristX = shoulderX - 1.8;
                idleWristY = shoulderY + 10.8;
                idleCigAngle = 2.82; // ~161° (Yana bakar)

                liftedElbowX = shoulderX - 1.0;
                liftedElbowY = shoulderY + 5.2;
                liftedWristX = mouthX - 2.5;
                liftedWristY = mouthY + 2.0;
                liftedCigAngle = 2.5;
            }

            const p = Math.max(0, Math.min(1, liftProgress));
            const easeP = 0.5 - 0.5 * Math.cos(Math.PI * p);

            const elbowX = idleElbowX + (liftedElbowX - idleElbowX) * easeP;
            const elbowY = idleElbowY + (liftedElbowY - idleElbowY) * easeP;
            const wristX = idleWristX + (liftedWristX - idleWristX) * easeP;
            const wristY = idleWristY + (liftedWristY - idleWristY) * easeP;

            // Filtre pozisyonu: Dinlenirken bilekteki elden, fırt anında TAM dudak noktasına (mouthX, mouthY) ulaşır!
            const idleFilterX = idleWristX + Math.cos(idleCigAngle) * 1.5;
            const idleFilterY = idleWristY + Math.sin(idleCigAngle) * 1.5;
            const liftedFilterX = mouthX;
            const liftedFilterY = mouthY;

            const filterX = idleFilterX + (liftedFilterX - idleFilterX) * easeP;
            const filterY = idleFilterY + (liftedFilterY - idleFilterY) * easeP;
            const cigAngle = idleCigAngle + (liftedCigAngle - idleCigAngle) * easeP;

            const armW = 5.6;

            // 2. T-SHIRT KOLU (Omuzdan Dirseğe Kumaş Kol)
            const sDx = elbowX - shoulderX;
            const sDy = elbowY - shoulderY;
            const sleeveAngle = Math.atan2(-sDx, sDy);
            const sleeveDist = Math.hypot(sDx, sDy);

            ctx.save();
            ctx.translate(shoulderX, shoulderY);
            ctx.rotate(sleeveAngle);

            ctx.fillStyle = teeColor;
            ctx.beginPath();
            ctx.roundRect(-armW / 2, -1.2, armW, sleeveDist + 1.0, [2.0, 2.0, 0.8, 0.8]);
            ctx.fill();

            if (isCyberTee) {
                ctx.fillStyle = teeAccent;
                ctx.fillRect(-armW / 2, sleeveDist - 1.2, armW, 1.0);
            } else if (isGraffitiTee) {
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-armW / 2, sleeveDist - 1.4, armW, 0.8);
                ctx.fillStyle = "#22c55e";
                ctx.fillRect(-armW / 2, sleeveDist - 0.6, armW, 0.6);
            }

            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(-armW / 2, sleeveDist);
            ctx.lineTo(armW / 2, sleeveDist);
            ctx.stroke();

            ctx.restore();

            // 3. ÖN KOL (Dirsekten Bileğe Ten)
            const fDx = wristX - elbowX;
            const fDy = wristY - elbowY;
            const forearmAngle = Math.atan2(-fDx, fDy);
            const forearmDist = Math.hypot(fDx, fDy);

            ctx.save();
            ctx.translate(elbowX, elbowY);
            ctx.rotate(forearmAngle);

            const topW = 4.4;
            const wristW = 3.2;

            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.moveTo(-topW / 2, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(-wristW / 2, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.beginPath();
            ctx.moveTo(topW / 2 - 1.0, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(wristW / 2 - 0.8, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-wristW / 2, forearmDist);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.stroke();

            ctx.restore();

            // 4. EL (Bilek Üzerinde)
            ctx.save();
            ctx.translate(wristX, wristY);

            // El filtresini işaret ve orta parmak arasında kavrayacak şekilde döner
            const handRot = Math.atan2(filterY - wristY, filterX - wristX);
            ctx.rotate(handRot);

            if (smokeState && smokeState.fingerFlick) {
                ctx.rotate(smokeState.fingerFlick);
            }

            // El Sırtı / Avuç
            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, 1.8, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Parmaklar (Sigarayı iki parmakla estetik kavrayış)
            const fingerDist = Math.hypot(filterX - wristX, filterY - wristY);
            const reach = Math.min(3.2, Math.max(1.8, fingerDist));
            ctx.beginPath();
            ctx.roundRect(0.2, -1.1, reach, 0.95, 0.45);
            ctx.roundRect(0.2, 0.15, reach * 0.95, 0.95, 0.45);
            ctx.fill();

            // Başparmak
            ctx.beginPath();
            ctx.ellipse(-0.3, 0.7, 0.95, 0.75, 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // 5. SİGARA (Dudaktan Dışarı Havaya Uzanır - Asla Kafanın İçine Girmez!)
            ctx.save();
            ctx.translate(filterX, filterY);
            ctx.rotate(cigAngle);

            const filterLen = 2.4;
            const cigWhiteLen = 5.8;
            const tipDist = filterLen + cigWhiteLen;

            // Filtre (Dudaklara temas eden turuncu filtre)
            ctx.fillStyle = "#d97706";
            ctx.fillRect(0, -0.65, filterLen, 1.3);
            ctx.strokeStyle = "#92400e";
            ctx.lineWidth = 0.3;
            ctx.strokeRect(0, -0.65, filterLen, 1.3);

            // Beyaz Gövde (Dışarıya uzanan gövde)
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(filterLen, -0.6, cigWhiteLen, 1.2);
            ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
            ctx.lineWidth = 0.3;
            ctx.strokeRect(filterLen, -0.6, cigWhiteLen, 1.2);

            // Kül Ucu
            ctx.fillStyle = "#64748b";
            ctx.beginPath();
            ctx.arc(tipDist, 0, 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Yanan Akkor Köz (Fırt, Zippo alevi VEYA Koşarken Rüzgarda Harlanan Köz)
            const isInhaling = smokeState && smokeState.isInhaling;
            const isLightingFlame = smokeState && smokeState.lighterFlame;
            if (isInhaling || isLightingFlame || isSprinting) {
                const pulse = Math.sin(Date.now() / 75) * 0.35;
                ctx.save();
                ctx.fillStyle = isSprinting ? "#ff5500" : "#ff2200";
                ctx.shadowColor = isSprinting ? "#ff7700" : "#ff3b00";
                const blurSize = (isInhaling ? 14 : (isSprinting ? 12 : 9)) + pulse * 4;
                ctx.shadowBlur = blurSize;
                ctx.beginPath();
                const emberRadius = (isInhaling ? 1.4 : (isSprinting ? 1.25 : 1.1)) + pulse * 0.2;
                ctx.arc(tipDist + 0.3, 0, emberRadius, 0, Math.PI * 2);
                ctx.fill();

                // Beyaz-sarı akkor iç çekirdek
                ctx.fillStyle = isSprinting ? "#fff7ed" : "#ffffff";
                ctx.beginPath();
                ctx.arc(tipDist + 0.3, 0, (isInhaling ? 0.75 : (isSprinting ? 0.65 : 0.55)), 0, Math.PI * 2);
                ctx.fill();

                // Koşarken rüzgardan geriye uçuşan mikro-kıvılcımlar (Wind sparks)
                if (isSprinting && Math.random() < 0.40) {
                    const sparkAngle = (Math.random() - 0.5) * 0.7 + Math.PI; // geriye doğru
                    const sparkDist = 1.6 + Math.random() * 3.8;
                    ctx.fillStyle = "#fdba74";
                    ctx.shadowColor = "#f97316";
                    ctx.shadowBlur = 2;
                    ctx.beginPath();
                    ctx.arc(tipDist + Math.cos(sparkAngle) * sparkDist, Math.sin(sparkAngle) * sparkDist, 0.45, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            } else {
                ctx.fillStyle = "#ef4444";
                ctx.beginPath();
                ctx.arc(tipDist + 0.2, 0, 0.85, 0, Math.PI * 2);
                ctx.fill();

                // Idle Duman Kıvrımı (Yalnızca el ağızda değilken)
                if (easeP < 0.25) {
                    ctx.save();
                    ctx.translate(tipDist + 0.3, 0);
                    ctx.rotate(-cigAngle); // Koordinatı dünya dikeyine çevir (-Y daima yukarı göğe doğru)

                    const idleTime = Date.now() / 320;
                    const windLean = isMoving ? (isSprinting ? -4.5 : -2.5) : 0;
                    ctx.strokeStyle = isMoving ? "rgba(226, 232, 240, 0.26)" : "rgba(226, 232, 240, 0.42)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(
                        Math.sin(idleTime) * 0.8 + windLean * 0.3, -2.5,
                        Math.cos(idleTime * 0.8) * 1.2 + windLean * 0.7, -5.5,
                        Math.sin(idleTime * 1.2) * 1.5 + windLean, -9.0
                    );
                    ctx.stroke();

                    // Minik zarif yükselen tütün dumanı tanesi
                    const tProgress = ((Date.now() / 1200) % 1.0);
                    const pY = -tProgress * 11;
                    const pX = Math.sin(Date.now() / 400) * (1.4 * tProgress) + windLean * tProgress;
                    const pAlpha = (1.0 - tProgress) * 0.38;
                    ctx.fillStyle = `rgba(226, 232, 240, ${pAlpha})`;
                    ctx.beginPath();
                    ctx.arc(pX, pY, 0.8 + tProgress * 1.6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                }
            }

            ctx.restore(); // 5. Sigaranın translate & rotate'i burada biter!

            // 6. ZIPPO / KLASİK METAL ÇAKMAK İLE ATEŞLEME (Sol Kol ile Tutulup Çakılır)
            if (smokeState && smokeState.isLighting) {
                const tipAvatarX = filterX + Math.cos(cigAngle) * tipDist;
                const tipAvatarY = filterY + Math.sin(cigAngle) * tipDist;

                const lShoulderX = lighterArmShoulder ? lighterArmShoulder.x : (effFacing === 'down' ? 9.5 : (effFacing === 'down-right' ? 6.4 : -2.2));
                const lShoulderY = lighterArmShoulder ? lighterArmShoulder.y : (effFacing === 'down-right' ? -7.0 : -6.0);

                Karakter2Renderer.drawStreetwearLighterArm(
                    ctx, lShoulderX, lShoulderY, tipAvatarX, tipAvatarY,
                    smokeState, teeColor, teeAccent, skinColor,
                    isCyberTee, isGraffitiTee, effFacing, isSitting, isMoving
                );
            }

            ctx.restore();
        }

        /**
         * 2.6. Articulated Streetwear Lighter Arm (Zippo Tutan & Sigarayı Yakan Sol Kol)
         * Sol omuzdan dirsek bükülerek Zippo çakmağı sigara kül ucuna ulaştırır.
         * Çakmak kapağı açılır, çarkı çakar, alev ve kıvılcımlarla ucu tutuşturur,
         * ardından kapağı kapatıp kolu cebine doğru indirir.
         */
        static drawStreetwearLighterArm(ctx, shoulderX, shoulderY, targetX, targetY, smokeState, teeColor, teeAccent, skinColor, isCyberTee, isGraffitiTee, effFacing, isSitting = false, isMoving = false) {
            if (!smokeState || !smokeState.isLighting) return;

            const lightElapsed = smokeState.elapsed || 0;

            // 1. Zippo Kolunun Yükselme & İndirme İlerlemesi (0.0 -> 1.0 -> 0.0)
            let liftT = 0;
            let lidOpen = 0;

            if (lightElapsed < 1000) {
                // Cebinden/kalçasından sigara ucuna doğru yükselir (0 -> 1000ms)
                const t = Math.max(0, lightElapsed / 1000);
                liftT = 0.5 - 0.5 * Math.cos(Math.PI * t);
                if (lightElapsed >= 700) {
                    lidOpen = Math.min(1.0, (lightElapsed - 700) / 250); // 700ms'de kapak açılmaya başlar
                }
            } else if (lightElapsed <= 2600) {
                // Sigaranın tam ucunda sabit tutuş & alevle yakma (1000ms -> 2600ms - 1.6 saniye doyurucu alev süresi!)
                liftT = 1.0;
                lidOpen = 1.0;
            } else if (lightElapsed <= 3400) {
                // Kapağı kapatıp kolu aşağı indirme (2600ms -> 3400ms)
                const t = (lightElapsed - 2600) / 800;
                liftT = 0.5 + 0.5 * Math.cos(Math.PI * t);
                lidOpen = Math.max(0, 1.0 - (lightElapsed - 2600) / 150); // Kapak "çıt" diye kapanır (2650ms zippo_close sesiyle tam senkron)
            } else {
                return; // Kol tamamen indi, kargo cep/rahat poz devreye girer
            }

            // 2. Hedef El & Bilek Konumu (Zippo tabanı)
            const lighterTipX = targetX;
            const lighterTipY = targetY + 2.6;

            let idleHandX = shoulderX - 1.2;
            let idleHandY = shoulderY + 11.2;
            if (effFacing === 'down') {
                idleHandX = shoulderX - 1.6;
                idleHandY = shoulderY + 11.0;
            } else if (effFacing === 'down-right') {
                idleHandX = shoulderX - 1.2;
                idleHandY = shoulderY + 10.8;
            } else if (effFacing === 'right') {
                idleHandX = shoulderX + 0.8;
                idleHandY = shoulderY + 10.6;
            }

            const handX = idleHandX + (lighterTipX - idleHandX) * liftT;
            const handY = idleHandY + (lighterTipY - idleHandY) * liftT;

            // 3. Dirsek Kinematiği (Kol içe/ağza bükülürken dirsek doğal dışa yaylanır)
            const midX = (shoulderX + handX) * 0.5;
            const midY = (shoulderY + handY) * 0.5;

            let elbowBendX = 0, elbowBendY = 0;
            if (effFacing === 'down') {
                elbowBendX = 3.2 * liftT;
                elbowBendY = 2.4 * (1.0 - liftT * 0.35);
            } else if (effFacing === 'down-right') {
                elbowBendX = 2.8 * liftT;
                elbowBendY = 2.2 * (1.0 - liftT * 0.35);
            } else if (effFacing === 'right') {
                elbowBendX = -2.6 * liftT;
                elbowBendY = 2.5 * (1.0 - liftT * 0.35);
            } else {
                elbowBendX = -2.0 * liftT;
                elbowBendY = 2.0 * (1.0 - liftT * 0.35);
            }

            const elbowX = midX + elbowBendX;
            const elbowY = midY + elbowBendY;

            // 4. T-SHIRT KOLU (Omuzdan Dirseğe Kumaş Kol)
            const sDx = elbowX - shoulderX;
            const sDy = elbowY - shoulderY;
            const sleeveAngle = Math.atan2(-sDx, sDy);
            const sleeveDist = Math.hypot(sDx, sDy);
            const armW = 5.4;

            ctx.save();
            ctx.translate(shoulderX, shoulderY);
            ctx.rotate(sleeveAngle);

            ctx.fillStyle = teeColor;
            ctx.beginPath();
            ctx.roundRect(-armW / 2, -1.2, armW, sleeveDist + 1.0, [2.0, 2.0, 0.8, 0.8]);
            ctx.fill();

            if (isCyberTee) {
                ctx.fillStyle = teeAccent;
                ctx.fillRect(-armW / 2, sleeveDist - 1.2, armW, 1.0);
            } else if (isGraffitiTee) {
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-armW / 2, sleeveDist - 1.4, armW, 0.8);
                ctx.fillStyle = "#22c55e";
                ctx.fillRect(-armW / 2, sleeveDist - 0.6, armW, 0.6);
            }

            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(-armW / 2, sleeveDist);
            ctx.lineTo(armW / 2, sleeveDist);
            ctx.stroke();

            ctx.restore();

            // 5. ÖN KOL (Dirsekten Bileğe Ten)
            const fDx = handX - elbowX;
            const fDy = handY - elbowY;
            const forearmAngle = Math.atan2(-fDx, fDy);
            const forearmDist = Math.hypot(fDx, fDy);

            ctx.save();
            ctx.translate(elbowX, elbowY);
            ctx.rotate(forearmAngle);

            const topW = 4.2;
            const wristW = 3.2;

            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.moveTo(-topW / 2, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(-wristW / 2, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.beginPath();
            ctx.moveTo(topW / 2 - 0.9, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(wristW / 2 - 0.7, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // 6. EL & ZIPPO ÇAKMAK
            ctx.save();
            ctx.translate(handX, handY);

            // A. Çakmağı Tutan El (Avuç İçi & Parmaklar)
            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.ellipse(0, 3.2, 2.2, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(-2.4, 1.8, 4.8, 3.2, 1.1);
            ctx.fill();

            // Çarkı çakan başparmak
            ctx.beginPath();
            ctx.ellipse(0.9, 0.5, 0.95, 1.5, 0.40, 0, Math.PI * 2);
            ctx.fill();

            // B. Zippo Krom Metalik Gövdesi
            ctx.fillStyle = "#94a3b8"; // Mat gümüş / krom
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.roundRect(-2.0, 0.4, 4.0, 5.4, [0.6, 0.6, 0.9, 0.9]);
            ctx.fill();
            ctx.stroke();

            // Gövde metalik dikey parıltı çizgisi
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.fillRect(-0.5, 0.6, 0.8, 5.0);

            // C. Açık Zippo Kapağı (Sola doğru menteşeli kapak)
            ctx.save();
            ctx.translate(-2.0, 0.6);
            ctx.rotate(-1.15 * lidOpen); // 0 (kapalı) -> ~66° açık kapak açısı
            ctx.fillStyle = "#cbd5e1";
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.roundRect(-3.0, -1.0, 3.2, 2.0, 0.5);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // D. Rüzgarlık (Chimney delikli gümüş) & Altın Çark
            ctx.fillStyle = "#64748b";
            ctx.fillRect(-1.3, -1.3, 2.6, 1.7);
            // Chimney havalandırma delikleri
            ctx.fillStyle = "#1e293b";
            [-0.8, 0, 0.8].forEach(hx => {
                ctx.fillRect(hx - 0.25, -0.9, 0.5, 0.9);
            });

            // Altın çakmaktaşı çarkı
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(1.1, -0.4, 0.75, 0, Math.PI * 2);
            ctx.fill();

            // E. Çakmak Alevi & Kıvılcımlar (smokeState.lighterFlame)
            if (smokeState.lighterFlame) {
                const now = Date.now();
                const flamePulse = Math.sin(now / 50) * 0.4;
                const flameWobble = Math.cos(now / 70) * 0.45;

                // 1. Dış sıcak turuncu alev aurası
                ctx.fillStyle = "rgba(249, 115, 22, 0.90)";
                ctx.shadowColor = "#f59e0b";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(flameWobble * 0.3, -2.8, 1.8 + flamePulse * 0.3, 3.0 + Math.abs(flamePulse) * 0.6, flameWobble * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // 2. İç parlak sarı alev
                ctx.fillStyle = "#fbbf24";
                ctx.beginPath();
                ctx.ellipse(flameWobble * 0.3, -2.6, 1.15, 2.0 + Math.abs(flamePulse) * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();

                // 3. Sıcak beyaz-mavi çekirdek
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(0, -1.5, 0.65, 1.1, 0, 0, Math.PI * 2);
                ctx.fill();

                // 4. Çakmak Kıvılcımları ✨
                ctx.fillStyle = "#fef08a";
                [-1.6, 1.2, -0.4, 0.9, 1.6].forEach((sx, idx) => {
                    const sparkY = -3.6 - (idx * 0.9) - Math.abs(flamePulse) * 1.3;
                    const sparkX = sx + Math.sin(now / 38 + idx) * 0.9;
                    ctx.beginPath();
                    ctx.arc(sparkX, sparkY, 0.5, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            ctx.restore();
        }

        /**
         * El Çizimi (Orjin Noktasında - Bilekten Çıkan Parmaklar & El Sırtı)
         */
        static drawHandAtOrigin(ctx, skinColor, handPose, smokeState, facing = 'down', isBack = false, isProfile = false, bodyDir = -1) {
            ctx.save();
            ctx.fillStyle = skinColor;

            if (handPose === 'pocket') {
                // --- SOKAK STİLİ: EL KARGO CEBİNDE (Hand In Pocket) ---
                const thumbSide = bodyDir; // Gövdeye bakan taraf

                // Cep ağzına giren el sırtı kısmı
                ctx.beginPath();
                ctx.ellipse(0, 0.8, 1.6, 1.1, 0, 0, Math.PI * 2);
                ctx.fill();

                // Cep ağzından dışarıda kalan rahat başparmak
                ctx.beginPath();
                ctx.roundRect(thumbSide * 1.3 - 0.4, 0.4, 0.85, 1.6, 0.4);
                ctx.fill();

                // Kargo cep ağzı kumaş gölgesi (Kumaşın eli örttüğü derinlik çizgisi)
                ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
                ctx.beginPath();
                ctx.moveTo(-1.6, 1.3);
                ctx.quadraticCurveTo(0, 1.8, 1.6, 1.3);
                ctx.lineTo(1.6, 2.5);
                ctx.lineTo(-1.6, 2.5);
                ctx.closePath();
                ctx.fill();

            } else if (handPose === 'hip') {
                // --- ZARİF KADIN ELİ BELDE (Feminine Hand On Hip) ---
                const thumbSide = bodyDir; // Gövdeye bakan taraf
                ctx.beginPath();
                ctx.ellipse(thumbSide * 0.4, 0.7, 1.4, 1.2, -thumbSide * 0.35, 0, Math.PI * 2);
                ctx.fill();

                // Bele yaslanan zarif parmaklar
                ctx.beginPath();
                ctx.roundRect(-thumbSide * 0.6 - 0.4, 0.3, 1.8, 1.2, 0.5);
                ctx.fill();

                // Bel derinlik gölgesi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-1.2, 1.3); ctx.lineTo(1.2, 1.3);
                ctx.stroke();

            } else if (handPose === 'cigarette') {
                // Sigara Tutan El
                ctx.beginPath();
                ctx.ellipse(0, 1.2, 1.8, 1.5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.roundRect(-1.3, 0.4, 1.1, 1.6, 0.5);
                ctx.roundRect(-0.8, 1.0, 0.8, 3.6, 0.4);
                ctx.roundRect(0.2, 1.0, 0.8, 3.8, 0.4);
                ctx.fill();

                // Sigara Çubuğu
                ctx.save();
                ctx.translate(-0.2, 2.6);
                ctx.rotate(0.14);

                // Filtre
                ctx.fillStyle = "#d97706";
                ctx.fillRect(-1.0, -0.9, 2.4, 1.8);
                // Gövde
                ctx.fillStyle = "#f8fafc";
                ctx.fillRect(1.4, -0.8, 6.6, 1.6);

                // Kor / Duman Ucu
                const tipX = 8.0;
                const isInhaling = smokeState && smokeState.isInhaling;
                if (isInhaling) {
                    // Derin nefes çekilirken parlayan akkor köz & sıcak alev halkası
                    const pulse = Math.sin(Date.now() / 85) * 0.3;
                    ctx.save();
                    ctx.fillStyle = "#ff2200";
                    ctx.shadowColor = "#ff3b00";
                    ctx.shadowBlur = 11 + pulse * 4;
                    ctx.beginPath();
                    ctx.arc(tipX + 0.3, 0, 1.4 + pulse * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(tipX + 0.3, 0, 0.75, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    // Dinlenme anı közü (Kızıl-turuncu hafif ışıma)
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.arc(tipX + 0.2, 0, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                    // İnce Doğal Tüten Duman Kıvrımı (Idle Smoke Wisp)
                    if (!smokeState || smokeState.liftProgress < 0.2) {
                        const idleTime = Date.now() / 320;
                        ctx.save();
                        ctx.strokeStyle = "rgba(226, 232, 240, 0.36)";
                        ctx.lineWidth = 0.65;
                        ctx.beginPath();
                        ctx.moveTo(tipX + 0.3, 0);
                        ctx.bezierCurveTo(
                            tipX + 1.2 + Math.sin(idleTime) * 0.8, -1.8,
                            tipX + 0.8 + Math.cos(idleTime * 0.8) * 1.2, -4.2,
                            tipX + 1.8 + Math.sin(idleTime * 1.2) * 1.5, -6.8
                        );
                        ctx.stroke();

                        ctx.strokeStyle = "rgba(241, 245, 249, 0.20)";
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(tipX + 0.5, -2.0);
                        ctx.quadraticCurveTo(
                            tipX + 2.2 + Math.cos(idleTime) * 1.0, -4.5,
                            tipX + 1.2 + Math.sin(idleTime * 0.9) * 1.4, -7.5
                        );
                        ctx.stroke();
                        ctx.restore();
                    }
                }
                ctx.restore();

            } else if (isBack) {
                // --- ARKADAN BAKIŞ: EL SIRTISI (Dorsum of Hand) & PARMAKLARIN DOĞAL KAVİSİ ---
                const thumbSide = bodyDir; // Başparmak gövdeye doğru (içe) bakar

                // 1. El Sırtı Ana Gövdesi (Zarif oval/yumuşak dikdörtgen)
                ctx.beginPath();
                ctx.roundRect(-1.7, 0, 3.4, 2.6, [0.8, 0.8, 1.2, 1.2]);
                ctx.fill();

                // 2. İç kısımdaki Başparmak (Gövdeye doğru kıvrık)
                ctx.beginPath();
                ctx.ellipse(thumbSide * 1.5, 1.4, 0.8, 1.2, thumbSide * 0.2, 0, Math.PI * 2);
                ctx.fill();

                // 3. Parmak Uçları (Arkadan bakıldığında öne kıvrılmış yumuşak tırnak/parmak boğumları)
                ctx.beginPath();
                ctx.roundRect(-1.5, 2.2, 3.0, 1.2, 0.6);
                ctx.fill();

                // 4. Parmak Eklemi Derinlik Çizgisi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(-1.2, 2.1); ctx.lineTo(1.2, 2.1);
                ctx.stroke();

            } else if (isProfile) {
                // --- YAN PROFİL: ZARİF YAN EL (İnce ve Dinamik) ---
                ctx.beginPath();
                ctx.ellipse(0, 1.5, 1.5, 2.2, 0.1, 0, Math.PI * 2);
                ctx.fill();

                // Öne bakan başparmak & işaret parmağı silüeti
                ctx.beginPath();
                ctx.roundRect(-0.8, 1.8, 1.6, 2.0, 0.6);
                ctx.fill();

            } else {
                // --- ÖNDEN / ÇAPRAZDAN BAKIŞ: DOĞAL DİNLENEN AVUÇ/EL ---
                const thumbSide = bodyDir; // Başparmak gövdeye (içe) bakar

                // Avuç İçi & Parmak Tabanı (Gövdeye göre simetrik)
                ctx.beginPath();
                ctx.ellipse(0, 1.2, 1.8, 1.7, 0, 0, Math.PI * 2);
                ctx.fill();

                // İçe dönük doğal başparmak (Gövde tarafında simetrik)
                ctx.beginPath();
                ctx.roundRect(thumbSide * 1.3 - 0.5, 0.6, 1.0, 1.8, 0.5);
                ctx.fill();

                // Bütünleşik doğal parmak grubu (Başparmaktan dışa doğru simetrik dizilim)
                [1.1, 0.4, -0.4, -1.1].forEach((distFromInner, idx) => {
                    const px = thumbSide * distFromInner;
                    const fLen = (idx === 1 || idx === 2) ? 2.3 : 1.9; // Orta ve yüzük parmakları hafif uzun
                    ctx.beginPath();
                    ctx.roundRect(px - 0.35, 1.4, 0.72, fLen, 0.35);
                    ctx.fill();
                });

                // Parmak boğumu ayrım gölgesi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.10)";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-1.1, 2.2); ctx.lineTo(1.1, 2.2);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * Taktik Kargo Bacak & Çok Katmanlı Chunky Platform Sneaker
         */
        static drawCargoLegAndShoe(ctx, hipX, hipY, cargoColor, pocketColor, strapColor, sneakerColor, isK2Shoes, facing, isFar, legAngle = 0, isSkaterPants = false, isSkateShoes = false, isSkirt = false, skinColor = '#ffd1a4', isK2CyberDress = false, isK2GothDress = false, isK2FlaredJeans = false, isK2GothFishnet = false, isK2GothBoots = false) {
            ctx.save();
            ctx.translate(hipX, hipY);
            if (legAngle !== 0) {
                ctx.rotate(legAngle);
            }

            const isProfile = (facing === 'right');
            const isBack = (facing === 'up' || facing === 'up-right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const legW = isSkirt ? 4.8 : 6.4;
            const legLen = 12.0;

            if (isSkirt) {
                // 1. ZARİF KADIN BACAKLARI (Slender Bare Legs / Gothic Sheer Stocking)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.moveTo(-legW / 2, 0);
                ctx.lineTo(legW / 2, 0);
                ctx.lineTo(legW / 2 - 0.2, 5.5); // Diz
                ctx.lineTo(legW / 2 - 0.5, legLen - 0.5); // Bilek
                ctx.lineTo(-legW / 2 + 0.5, legLen - 0.5);
                ctx.lineTo(-legW / 2 + 0.2, 5.5);
                ctx.closePath();
                ctx.fill();

                if (isK2GothDress) {
                    // Gotik Siyah Yarı Saydam File / Çorap Katmanı
                    ctx.fillStyle = "rgba(24, 17, 36, 0.30)";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0);
                    ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 - 0.2, 5.5);
                    ctx.lineTo(legW / 2 - 0.5, legLen - 0.5);
                    ctx.lineTo(-legW / 2 + 0.5, legLen - 0.5);
                    ctx.lineTo(-legW / 2 + 0.2, 5.5);
                    ctx.closePath();
                    ctx.fill();

                    // Gotik Üst Bacak Jartiyer Kemeri & Gümüş O-Ring
                    if (!isFar) {
                        ctx.fillStyle = "#09090b";
                        ctx.fillRect(-legW / 2 - 0.2, 2.6, legW + 0.4, 1.4);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.arc(0, 3.3, 0.9, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                } else if (isK2CyberDress) {
                    // Siber Neon Taktik Jartiyer Bandı & Mini Holster
                    if (!isFar) {
                        ctx.fillStyle = "#ec4899";
                        ctx.fillRect(-legW / 2 - 0.2, 2.6, legW + 0.4, 1.4);
                        ctx.fillStyle = "#0ea5e9";
                        ctx.fillRect(-0.8, 3.0, 1.6, 2.0);
                        ctx.fillStyle = "#facc15";
                        ctx.fillRect(-0.4, 3.4, 0.8, 0.7);
                    }
                }

                // Diz Kapağı Pembemsi Işıma (Soft Knee Blush & Form)
                ctx.fillStyle = "rgba(244, 114, 182, 0.16)";
                ctx.beginPath();
                ctx.ellipse(0, 5.5, 1.4, 0.9, 0, 0, Math.PI * 2);
                ctx.fill();

                // Bilek Ayakkabı Geçişi Dikişi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(-legW / 2 + 0.5, legLen - 0.6);
                ctx.lineTo(legW / 2 - 0.5, legLen - 0.6);
                ctx.stroke();

            } else {
                // 1. Kargo Pantolon Bacağı / İspanyol Paça Kot / Gotik Fileli Kot
                if (isK2FlaredJeans) {
                    // İspanyol Paça Kot (Dizden paçaya doğru genişleyen zarif paça)
                    ctx.fillStyle = "#1d4ed8";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0);
                    ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 + 0.1, 5.5);
                    ctx.lineTo(legW / 2 + 1.2, legLen + 0.5);
                    ctx.lineTo(-legW / 2 - 1.2, legLen + 0.5);
                    ctx.lineTo(-legW / 2 - 0.1, 5.5);
                    ctx.closePath();
                    ctx.fill();

                    // Kot sarı dikiş çizgisi
                    ctx.strokeStyle = "#f59e0b";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0); ctx.lineTo(0, legLen); ctx.stroke();
                } else if (isK2GothFishnet) {
                    // Gotik Siyah Yırtık Jean & File Çorap
                    ctx.fillStyle = "#18181b";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0);
                    ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 + 0.2, 5.5);
                    ctx.lineTo(legW / 2 - 0.2, legLen - 0.5);
                    ctx.lineTo(-legW / 2 + 0.2, legLen - 0.5);
                    ctx.lineTo(-legW / 2 - 0.2, 5.5);
                    ctx.closePath();
                    ctx.fill();

                    // Diz Yırtığı & Altından Görünen File Çorap
                    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                    ctx.fillRect(-legW * 0.35, 4.4, legW * 0.7, 2.2);
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-legW * 0.3, 4.6); ctx.lineTo(legW * 0.3, 6.4);
                    ctx.moveTo(legW * 0.3, 4.6); ctx.lineTo(-legW * 0.3, 6.4);
                    ctx.stroke();
                } else {
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    if (isSkaterPants) {
                        // Skater Salaş Geniş Paça (Dizden paçaya daralmayan, bol silüet)
                        ctx.moveTo(-legW / 2, 0);
                        ctx.lineTo(legW / 2, 0);
                        ctx.lineTo(legW / 2 + 0.3, 5.5); // Diz
                        ctx.lineTo(legW / 2 + 0.5, legLen + 0.4); // Dökümlü paça ucu
                        ctx.lineTo(-legW / 2 - 0.5, legLen + 0.4);
                        ctx.lineTo(-legW / 2 - 0.3, 5.5);
                    } else {
                        // Kalçadan dize hafif genişleme, dize kadar 6.6px, bileğe doğru 5.6px toparlanan jogger kalıbı
                        ctx.moveTo(-legW / 2, 0);
                        ctx.lineTo(legW / 2, 0);
                        ctx.lineTo(legW / 2 + 0.2, 5.5); // Diz bombesi
                        ctx.lineTo(legW / 2 - 0.4, legLen - 1.6); // Paçaya doğru incelme
                        ctx.lineTo(-legW / 2 + 0.4, legLen - 1.6);
                        ctx.lineTo(-legW / 2 - 0.2, 5.5);
                    }
                    ctx.closePath();
                    ctx.fill();
                }

                // Taktik Kargo Yan Cebi & Kumaş Hacmi
                if (isProfile) {
                    // Profil Körüklü Kargo Cep
                    ctx.fillStyle = pocketColor;
                    ctx.beginPath();
                    ctx.roundRect(-1.8, 1.4, 3.6, 5.2, [1.0, 1.0, 1.2, 1.2]);
                    ctx.fill();
                    // Cep kapağı
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    ctx.roundRect(-1.8, 1.4, 3.6, 1.4, [1.0, 1.0, 0, 0]);
                    ctx.fill();
                    // Taktik dokuma askı kayışı & D-Ring / Toka
                    ctx.fillStyle = strapColor;
                    ctx.fillRect(-0.5, 2.3, 1.0, 1.6);
                    ctx.fillStyle = isSkaterPants ? "#cbd5e1" : "#94a3b8"; // Metal D-Halka / Gümüş zincir ucu
                    ctx.fillRect(-0.6, 3.9, 1.2, 0.5);

                } else if (!isBack) {
                    // Ön ve Çapraz Bakışta Dış Kargo Cebi
                    ctx.fillStyle = pocketColor;
                    ctx.beginPath();
                    ctx.roundRect(1.2, 1.4, 2.5, 4.6, 1.0);
                    ctx.fill();
                    // Cep kapağı
                    ctx.fillStyle = cargoColor;
                    ctx.fillRect(1.2, 1.4, 2.5, 1.3);
                    // Mini taktik şerit / neon pembe askı
                    ctx.fillStyle = strapColor;
                    ctx.fillRect(1.9, 2.3, 0.9, 1.2);
                } else {
                    // Arkadan Bakış: Arka Cep Çizgisi
                    ctx.strokeStyle = "rgba(0,0,0,0.22)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.roundRect(-legW / 2 + 1.0, 1.2, legW - 2.0, 2.8, 0.6);
                    ctx.stroke();
                }

                // Kumaş Kırışıklıkları & Katlantı Dikişleri (Folds & Creases)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
                ctx.lineWidth = 0.75;
                if (isBack) {
                    // Diz arkası çukurluğu (Popliteal crease)
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 1.0, 5.8);
                    ctx.quadraticCurveTo(0, 5.2, legW / 2 - 1.0, 5.8);
                    ctx.stroke();
                } else {
                    // Diz ön katlantısı (Çift dikiş hattı)
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 0.8, 5.2);
                    ctx.quadraticCurveTo(0, 5.9, legW / 2 - 0.8, 5.2);
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(0, 0, 0, 0.11)";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 1.2, 6.4);
                    ctx.quadraticCurveTo(0, 7.0, legW / 2 - 1.2, 6.4);
                    ctx.stroke();

                    // Skater Diz Eskitme / Yırtık Detayı
                    if (isSkaterPants) {
                        ctx.fillStyle = "#18181b"; // İç astar yırtık yarığı
                        ctx.fillRect(-legW / 2 + 1.4, 5.4, legW - 2.8, 1.2);
                        ctx.strokeStyle = "#a1a1aa"; // Beyaz dikiş iplik lifleri
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(-legW / 2 + 2.0, 6.0); ctx.lineTo(-legW / 2 + 3.2, 6.0);
                        ctx.moveTo(legW / 2 - 3.2, 6.0); ctx.lineTo(legW / 2 - 2.0, 6.0);
                        ctx.stroke();
                    }
                }

                if (isSkaterPants) {
                    // --- SKATER SALAŞ DÖKÜMLÜ PAÇA (Baggy Drape Hem over Sneaker) ---
                    const hemW = legW + 1.0; // 7.4px geniş dökümlü paça
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    ctx.roundRect(-hemW / 2, legLen - 2.2, hemW, 3.0, [0.5, 0.5, 1.2, 1.2]);
                    ctx.fill();

                    // Kumaş yığılma & katlantı gölgesi (Accordion drape fold)
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.32)";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-hemW / 2 + 0.4, legLen - 1.4);
                    ctx.quadraticCurveTo(0, legLen - 0.8, hemW / 2 - 0.4, legLen - 1.4);
                    ctx.stroke();

                    // Paça alt duble dikiş hattı (Double stitch hem)
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-hemW / 2 + 0.6, legLen + 0.4);
                    ctx.lineTo(hemW / 2 - 0.6, legLen + 0.4);
                    ctx.stroke();

                    // Ayakkabı boğazına düşen yumuşak döküm gölgesi (Occlusion)
                    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
                    ctx.fillRect(-hemW / 2 + 0.4, legLen + 0.6, hemW - 0.8, 0.5);

                } else {
                    // Paça üstü kumaş yığılması (Cuff drape fold)
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 0.8, legLen - 1.9);
                    ctx.lineTo(legW / 2 - 0.8, legLen - 1.9);
                    ctx.stroke();

                    // Jogger Paça Elastik Ribanası (Ribbed Cuff)
                    const cuffW = legW - 0.8;
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(-cuffW / 2, legLen - 1.8, cuffW, 1.8, 0.5);
                    ctx.fill();

                    // Ribana mikro nervür dikişleri
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-cuffW / 4, legLen - 1.7); ctx.lineTo(-cuffW / 4, legLen - 0.1);
                    ctx.moveTo(cuffW / 4, legLen - 1.7); ctx.lineTo(cuffW / 4, legLen - 0.1);
                    ctx.stroke();
                }
            }

            // 2. Çok Katmanlı Chunky Platform Sneaker / Skater Sneaker / Gotik Platform Bot
            ctx.translate(0, legLen);

            const shoeStartX = isProfile ? -3.8 : (isDiagonal ? -3.6 : -3.3);
            const shoeW = isProfile ? 9.2 : (isDiagonal ? 8.0 : 6.6);

            if (isK2GothBoots) {
                // GOTİK KALIN TABAN PLATFORM BOT (Gothic Chunky Creeper Boots)
                const bootShaftW = isProfile ? 5.8 : 5.0;
                // Bot Koncu / Boğazı (Ankle Shaft)
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                ctx.roundRect(-bootShaftW / 2, -2.5, bootShaftW, 3.2, 0.5);
                ctx.fill();

                // Çift Gümüş Metalik Kemer & Toka (Buckle Straps)
                ctx.fillStyle = "#18181b";
                ctx.fillRect(-bootShaftW / 2 - 0.2, -1.8, bootShaftW + 0.4, 0.9);
                ctx.fillRect(-bootShaftW / 2 - 0.2, -0.4, bootShaftW + 0.4, 0.9);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(isProfile ? 1.0 : -0.5, -2.0, 1.2, 1.3);
                ctx.fillRect(isProfile ? 1.0 : -0.5, -0.6, 1.2, 1.3);

                // Bot Gövdesi
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(shoeStartX, 0);
                    ctx.lineTo(shoeStartX + shoeW, 0);
                    ctx.lineTo(shoeStartX + shoeW, 1.6);
                    ctx.lineTo(shoeStartX, 1.6);
                } else {
                    ctx.roundRect(shoeStartX, 0, shoeW, 2.0, [1.0, 1.0, 0.5, 0.5]);
                }
                ctx.closePath();
                ctx.fill();

                // Kalın Platform Taban (3.4px Lugged Platform Sole)
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                const soleStartX = shoeStartX - 0.4;
                const soleW = shoeW + 0.8;
                ctx.roundRect(soleStartX, 1.6, soleW, 2.4, [0.4, 0.4, 0.8, 0.8]);
                ctx.fill();

                // Gümüş Ön Burun Metal Plaka
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(isProfile ? shoeStartX + shoeW - 1.2 : -1.2, 1.8, isProfile ? 1.2 : 2.4, 1.0);

                // Taban Dişleri
                ctx.strokeStyle = "#27272a";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                const lugStep = soleW / 4;
                for (let i = 1; i <= 3; i++) {
                    const lx = soleStartX + i * lugStep;
                    ctx.moveTo(lx, 2.8); ctx.lineTo(lx, 4.0);
                }
                ctx.stroke();

                // Far Leg Shadow
                if (isFar) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                    ctx.beginPath();
                    ctx.roundRect(-legW / 2 - 0.5, -legLen, legW + (isProfile ? 3.4 : 1.0), legLen + 4.2, 2);
                    ctx.fill();
                }
                ctx.restore();
                return;
            }

            const neonCol = isSkateShoes ? "#d97706" : (isK2Shoes ? "#0ea5e9" : "#0284c7"); // Skate için gum sakız taban, K2 için siber neon

            // A) Sneaker Üst Gövdesi (Upper Body - Katmanlı Deri/Mesh veya Skater Turuncu/Süet)
            ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a"; // Kaykay ayakkabısında canlı turuncu panel
            ctx.beginPath();
            if (isProfile) {
                // Profilde burun yukarı hafif kıvrık dinamik form (toe spring)
                ctx.moveTo(shoeStartX, 0.2); // Topuk üstü
                ctx.lineTo(shoeStartX - 0.3, 1.6); // Topuk arka bombesi
                ctx.lineTo(shoeStartX + shoeW, 1.6); // Burun altı
                ctx.quadraticCurveTo(shoeStartX + shoeW + 0.4, 0.9, shoeStartX + shoeW - 1.2, 0.2); // Kavisli burun ucu
                ctx.lineTo(shoeStartX + 2.2, 0.1); // Boğaz girişi
                ctx.lineTo(shoeStartX, 0.2);
            } else if (isDiagonal) {
                ctx.roundRect(shoeStartX, 0, shoeW, 2.2, [1.4, 2.2, 0.8, 0.8]);
            } else if (isBack) {
                // Arkadan bakışta topuk kalkanı (heel counter)
                ctx.roundRect(shoeStartX, 0, shoeW, 2.2, [1.2, 1.2, 0.8, 0.8]);
            } else {
                // Önden bakış
                ctx.roundRect(shoeStartX, 0, shoeW, 2.2, [1.5, 1.5, 0.8, 0.8]);
            }
            ctx.closePath();
            ctx.fill();

            // Yan Deri/Teknik Panel Katmanı & Süet Burun Koruma
            ctx.fillStyle = isSkateShoes ? "#0f172a" : "#1e293b"; // Skater ayakkabısında siyah süet burun / ollie koruması
            if (isProfile) {
                ctx.beginPath();
                if (isSkateShoes) {
                    // Skater süet burun
                    ctx.roundRect(shoeStartX + shoeW - 3.8, 0.2, 3.8, 1.5, 0.6);
                } else {
                    ctx.roundRect(shoeStartX + 0.8, 0.3, shoeW - 2.8, 1.3, 0.6);
                }
                ctx.fill();
            } else if (!isBack) {
                ctx.beginPath();
                if (isSkateShoes) {
                    ctx.roundRect(shoeStartX + 0.6, 1.1, shoeW - 1.2, 1.1, 0.5);
                } else {
                    ctx.roundRect(shoeStartX + 0.6, 0.3, shoeW - 1.2, 1.2, 0.6);
                }
                ctx.fill();
            }

            // Sneaker Bağcıkları & Dil (Laces & Tongue)
            if (!isBack) {
                ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#e2e8f0"; // Skater için neon yeşil bağcıklar
                ctx.lineWidth = 0.65;
                ctx.beginPath();
                if (isProfile) {
                    // Profilde öne bakan 2 mikro bağcık çizgisi
                    ctx.moveTo(shoeStartX + 3.0, 0.4); ctx.lineTo(shoeStartX + 4.2, 0.9);
                    ctx.moveTo(shoeStartX + 4.4, 0.5); ctx.lineTo(shoeStartX + 5.6, 1.0);
                } else if (isDiagonal) {
                    ctx.moveTo(shoeStartX + 2.0, 0.4); ctx.lineTo(shoeStartX + 3.6, 0.9);
                    ctx.moveTo(shoeStartX + 3.6, 0.4); ctx.lineTo(shoeStartX + 5.2, 0.9);
                } else {
                    // Tam önden yatay bağcıklar
                    ctx.moveTo(shoeStartX + 1.8, 0.5); ctx.lineTo(shoeStartX + shoeW - 1.8, 0.5);
                    ctx.moveTo(shoeStartX + 2.0, 1.1); ctx.lineTo(shoeStartX + shoeW - 2.0, 1.1);
                }
                ctx.stroke();
            } else {
                // Arkadan dikey topuk dikişi & topuk çekme halkası
                ctx.fillStyle = isSkateShoes ? "#ea580c" : "#334155";
                ctx.fillRect(0, 0.2, 0.8, 1.8);
                // Topuk arkası çekme kulağı (Heel pull-tab)
                ctx.fillStyle = isSkateShoes ? "#22c55e" : neonCol;
                ctx.fillRect(-0.4, -0.6, 0.8, 0.9);
            }

            // Profilde Topuk Çekme Kulağı
            if (isProfile) {
                ctx.fillStyle = isSkateShoes ? "#22c55e" : neonCol;
                ctx.fillRect(shoeStartX - 0.4, -0.4, 0.8, 0.9);
            }

            // B) Kalın Heykelsi Chunky Taban (Sculpted Sole)
            ctx.fillStyle = sneakerColor;
            ctx.beginPath();
            const soleStartX = shoeStartX - 0.3;
            const soleW = shoeW + 0.6;
            if (isProfile) {
                // Profilde topukta kalın (2.4px), buruna doğru incelen (1.6px) ve burun ucu kalkık taban
                ctx.moveTo(soleStartX, 1.4);
                ctx.lineTo(soleStartX + soleW, 1.4);
                ctx.lineTo(soleStartX + soleW - 0.2, 2.9); // Burun ucu kalkıklığı
                ctx.lineTo(soleStartX + soleW * 0.45, 3.2); // Taban oyuğu (arch)
                ctx.lineTo(soleStartX, 3.4); // Kalın chunky topuk tabanı
                ctx.closePath();
            } else {
                // Önden / arkadan / çaprazdan zemine doğru genişleyen (flared) stabil taban
                ctx.roundRect(soleStartX, 1.4, soleW, 2.0, [0.6, 0.6, 1.0, 1.0]);
            }
            ctx.fill();

            // C) Cyber Neon / Skater Gum Taban Vurgu Şeridi
            ctx.fillStyle = neonCol;
            if (isProfile) {
                ctx.fillRect(soleStartX + 0.4, 2.2, soleW - 1.2, 0.65);
            } else {
                ctx.fillRect(soleStartX + 0.2, 2.3, soleW - 0.4, 0.65);
            }

            // D) Dişli Dış Taban (Lugged Outsole & Zemin Temas Çizgisi)
            ctx.fillStyle = isSkateShoes ? "#78350f" : "#0f172a"; // Skater için klasik kahverengi sakız taban
            ctx.fillRect(soleStartX + 0.2, 3.2, soleW - 0.4, 0.55);

            // Taban dişleri (Micro tread lugs)
            ctx.strokeStyle = sneakerColor;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            const lugStep = soleW / 4;
            for (let i = 1; i <= 3; i++) {
                const lx = soleStartX + i * lugStep;
                ctx.moveTo(lx, 3.2); ctx.lineTo(lx, 3.75);
            }
            ctx.stroke();

            // Arka bacak derinlik gölgesi (Far Leg Shadow)
            if (isFar) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                ctx.beginPath();
                ctx.roundRect(-legW / 2 - 0.5, -legLen, legW + (isProfile ? 3.4 : 1.0), legLen + 4.2, 2);
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * Oturma Pozisyonu Bacakları (Sandalyede / Yerde)
         */
        static drawSittingCargoLegs(ctx, facing, cargoColor, sneakerColor, isK2Shoes, skinColor, isFemale, isSkaterPants = false, isSkateShoes = false) {
            ctx.save();
            ctx.fillStyle = cargoColor;
            const legW = 6.2;
            const neonCol = isSkateShoes ? "#d97706" : (isK2Shoes ? "#0ea5e9" : "#0284c7");

            if (facing === 'right') {
                // Sağa dönük oturma: Uyluk yatay, kaval dikey
                ctx.beginPath();
                ctx.roundRect(-4.0, 7.0, 13.0, 6.2, [3, 4, 2, 2]);
                ctx.fill();

                // Dikey bacak
                ctx.beginPath();
                ctx.roundRect(4.5, 11.0, legW, 5.8, [1, 1, 1, 1]);
                ctx.fill();

                // Skater Diz Eskitme
                if (isSkaterPants) {
                    ctx.fillStyle = "#18181b";
                    ctx.fillRect(5.5, 10.2, legW - 2.0, 1.2);
                }

                if (isSkaterPants) {
                    // Skater salaş dökümlü paça
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    ctx.roundRect(4.2, 15.2, legW + 0.8, 2.2, [0.4, 0.4, 1.0, 1.0]);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(4.6, 16.0); ctx.lineTo(4.6 + legW, 16.0);
                    ctx.stroke();
                } else {
                    // Paça ribanası
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(4.6, 15.6, legW - 0.4, 1.4, 0.4);
                    ctx.fill();
                }

                // Chunky Sneaker Üst Gövdesi
                ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                ctx.beginPath();
                ctx.roundRect(4.0, 17.0, 8.2, 2.0, [1.2, 2.2, 0.6, 0.6]);
                ctx.fill();

                // Süet burun
                if (isSkateShoes) {
                    ctx.fillStyle = "#0f172a";
                    ctx.roundRect(8.4, 17.0, 3.8, 1.8, 0.6);
                    ctx.fill();
                }

                // Bağcıklar
                ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#e2e8f0";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(7.2, 17.4); ctx.lineTo(8.6, 17.8);
                ctx.moveTo(8.8, 17.4); ctx.lineTo(10.2, 17.8);
                ctx.stroke();

                // Chunky Taban
                ctx.fillStyle = sneakerColor;
                ctx.beginPath();
                ctx.roundRect(3.8, 18.8, 8.8, 1.8, [0.6, 0.6, 0.8, 0.8]);
                ctx.fill();

                // Neon Taban Çizgisi
                ctx.fillStyle = neonCol;
                ctx.fillRect(4.0, 19.6, 8.4, 0.6);

                // Dış Taban
                ctx.fillStyle = isSkateShoes ? "#78350f" : "#0f172a";
                ctx.fillRect(4.0, 20.4, 8.4, 0.5);

            } else {
                // Tam öne oturma
                [-5.0, 5.0].forEach(lx => {
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    ctx.roundRect(lx - legW / 2, 7.0, legW, 9.0, [2, 2, 1, 1]);
                    ctx.fill();

                    // Skater diz yırtığı
                    if (isSkaterPants) {
                        ctx.fillStyle = "#18181b";
                        ctx.fillRect(lx - legW / 2 + 1.2, 11.5, legW - 2.4, 1.2);
                    }

                    if (isSkaterPants) {
                        // Skater salaş dökümlü paça
                        ctx.fillStyle = cargoColor;
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.4, 15.4, legW + 0.8, 2.2, [0.4, 0.4, 1.0, 1.0]);
                        ctx.fill();
                        ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(lx - legW / 2, 16.2); ctx.lineTo(lx + legW / 2, 16.2);
                        ctx.stroke();
                    } else {
                        // Paça ribanası
                        ctx.fillStyle = "#0f172a";
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 + 0.3, 15.8, legW - 0.6, 1.4, 0.4);
                        ctx.fill();
                    }

                    // Chunky Sneaker
                    ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(lx - legW / 2 - 0.2, 17.0, legW + 0.4, 2.0, [1.4, 1.4, 0.6, 0.6]);
                    ctx.fill();

                    // Bağcık
                    ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#e2e8f0";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(lx - 1.2, 17.5); ctx.lineTo(lx + 1.2, 17.5);
                    ctx.stroke();

                    // Chunky Taban
                    ctx.fillStyle = sneakerColor;
                    ctx.beginPath();
                    ctx.roundRect(lx - legW / 2 - 0.4, 18.8, legW + 0.8, 1.8, [0.6, 0.6, 0.8, 0.8]);
                    ctx.fill();

                    // Neon Çizgi
                    ctx.fillStyle = neonCol;
                    ctx.fillRect(lx - legW / 2 - 0.3, 19.6, legW + 0.6, 0.6);

                    // Dış Taban
                    ctx.fillStyle = isSkateShoes ? "#78350f" : "#0f172a";
                    ctx.fillRect(lx - legW / 2 - 0.3, 20.4, legW + 0.6, 0.5);
                });
            }

            ctx.restore();
        }

        /**
         * 0. Anatomik Boyun (Organik Trapez Kavisli & Gövdeye Kenetlenen Boyun)
         */
        static drawSkeletalNeck(ctx, p, facing, isBack, isProfile, skinColor, isFemale = false) {
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const topW = isFemale ? 4.6 : 5.6;     // Çene altında toparlanan zarif boğaz genişliği
            const bottomW = isFemale ? 6.6 : 7.8;  // Omuz ve trapeze doğru genişleyen organik trapez tabanı

            ctx.save();
            ctx.fillStyle = skinColor;

            if (isProfile) {
                // Yan Profil Anatomik Boyun (Kafa arkası, ense ve sırtı tek parça bağlayan form)
                const nBackX = -dirSign * 4.8;  // Kafa arkası ve sırt omurgası ile kesintisiz hizalı ense hattı
                const nFrontX = dirSign * 3.2;  // Çene altından köprücük kemiğine inen boğaz hattı
                ctx.beginPath();
                ctx.moveTo(nBackX, 6.0);
                ctx.lineTo(nBackX, 9.8);
                ctx.lineTo(nFrontX + dirSign * 0.2, 9.8);
                ctx.quadraticCurveTo(nFrontX - dirSign * 0.2, 7.8, nFrontX, 6.0);
                ctx.closePath();
                ctx.fill();

            } else if (isBack) {
                // Tam Sırt & 3/4 Sırt (Ense - Organik Trapez Yayılımı)
                const shiftX = (facing === 'up-right' || facing === 'up-left') ? (dirSign * 0.5) : 0;
                ctx.beginPath();
                ctx.moveTo(shiftX - topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX - topW / 2 - 0.2, 7.8, shiftX - bottomW / 2, 9.8);
                ctx.lineTo(shiftX + bottomW / 2, 9.8);
                ctx.quadraticCurveTo(shiftX + topW / 2 + 0.2, 7.8, shiftX + topW / 2, 6.0);
                ctx.closePath();
                ctx.fill();

                // Ense omurga çukurluğu (Vertebral furrow)
                ctx.fillStyle = "rgba(15, 23, 42, 0.10)";
                ctx.beginPath();
                ctx.roundRect(shiftX - 0.5, 6.4, 1.0, 3.2, 0.5);
                ctx.fill();

            } else {
                // Tam Ön & 3/4 Ön (Boğaz & Çene Altı - Organik Trapez Boyun Kasları)
                const shiftX = (facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0;
                ctx.beginPath();
                ctx.moveTo(shiftX - topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX - topW / 2 - 0.2, 7.8, shiftX - bottomW / 2, 9.8);
                ctx.lineTo(shiftX + bottomW / 2, 9.8);
                ctx.quadraticCurveTo(shiftX + topW / 2 + 0.2, 7.8, shiftX + topW / 2, 6.0);
                ctx.closePath();
                ctx.fill();

                // Yan boyun / sternokleidomastoid derinlik gölgesi (Organik silindirik derinlik)
                ctx.fillStyle = "rgba(180, 83, 9, 0.14)";
                ctx.beginPath();
                ctx.moveTo(shiftX - topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX - topW / 2 - 0.2, 7.8, shiftX - bottomW / 2, 9.8);
                ctx.lineTo(shiftX - bottomW / 2 + 1.1, 9.8);
                ctx.quadraticCurveTo(shiftX - topW / 2 + 0.5, 7.8, shiftX - topW / 2 + 0.6, 6.0);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(shiftX + topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX + topW / 2 + 0.2, 7.8, shiftX + bottomW / 2, 9.8);
                ctx.lineTo(shiftX + bottomW / 2 - 1.1, 9.8);
                ctx.quadraticCurveTo(shiftX + topW / 2 - 0.5, 7.8, shiftX + topW / 2 - 0.6, 6.0);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * 1.5. Çene Altı & Boyun Derinlik Gölgesi (Ambient Occlusion)
         * Çenenin boyun silindirine düşürdüğü yumuşak anatomik gölge katmanı
         */
        static drawChinNeckOcclusionShadow(ctx, p, facing, isBack, isProfile, isFemale = false) {
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const topW = isFemale ? 4.6 : 5.6;
            const bottomW = isFemale ? 6.6 : 7.8;

            ctx.save();

            if (isProfile) {
                // Yan Profil Çene Altı Gölgesi (Submental Ambient Occlusion)
                const nBackX = -dirSign * 4.8;
                const nFrontX = dirSign * 3.2;
                const minX = Math.min(nBackX, nFrontX);
                const spanW = Math.abs(nFrontX - nBackX);

                ctx.beginPath();
                ctx.rect(minX, 5.8, spanW, 2.6);
                if (typeof ctx.clip === 'function') ctx.clip();

                // 1. Çene altı derinlik gölgesi (Mandibular crease)
                ctx.fillStyle = "rgba(180, 83, 9, 0.28)";
                ctx.beginPath();
                ctx.moveTo(nFrontX, 6.0);
                ctx.lineTo(nFrontX + dirSign * 0.1, 7.6);
                ctx.lineTo(nBackX + dirSign * 1.6, 7.6);
                ctx.lineTo(nBackX + dirSign * 1.6, 6.0);
                ctx.closePath();
                ctx.fill();

                // 2. Çene kemiği temas çizgisi (Jawline contact shadow)
                ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                ctx.beginPath();
                ctx.moveTo(nFrontX, 6.0);
                ctx.lineTo(nFrontX - dirSign * 0.2, 6.8);
                ctx.lineTo(nBackX + dirSign * 1.8, 6.8);
                ctx.lineTo(nBackX + dirSign * 1.8, 6.0);
                ctx.closePath();
                ctx.fill();

                // 3. Kulak arkası & ense başlangıç yumuşak gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.16)";
                ctx.fillRect(nBackX, 6.0, 2.0, 1.4);

            } else if (isBack) {
                // Sırt & 3/4 Sırt Ense Saç Altı Gölgesi
                const shiftX = (facing === 'up-right' || facing === 'up-left') ? (dirSign * 0.5) : 0;
                ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                ctx.beginPath();
                ctx.roundRect(shiftX - bottomW / 2 + 0.3, 6.0, bottomW - 0.6, 1.4, [0, 0, 0.6, 0.6]);
                ctx.fill();

            } else {
                // Tam Ön ve 3/4 Ön Çene Altı Yay Gölgesi (Ambient Occlusion)
                const shiftX = (facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0;

                // Yalnızca boyun genişliği içine maskele
                ctx.beginPath();
                ctx.rect(shiftX - bottomW / 2 - 0.5, 6.0, bottomW + 1.0, 3.2);
                if (typeof ctx.clip === 'function') ctx.clip();

                // 1. Yumuşak Sıcak Çene Altı Gölgesi (Melanin Ambient Occlusion)
                ctx.fillStyle = "rgba(180, 83, 9, 0.32)";
                ctx.beginPath();
                ctx.ellipse(shiftX, 6.9, topW * 0.60, 1.4, 0, 0, Math.PI);
                ctx.fill();

                // 2. Çene Hat Temas Çizgisi (Contact Crease Shadow)
                ctx.fillStyle = "rgba(15, 23, 42, 0.20)";
                ctx.beginPath();
                ctx.ellipse(shiftX, 6.7, topW * 0.52, 0.7, 0, 0, Math.PI);
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * 1.4. Streetwear Mock-Neck Boyunluk (Yükseltilmiş Dik Yaka Payı)
         * T-shirt kumaşının boyun dibini saran ribana dik yaka formu.
         * Boyun ile omuz/gövde arasında anatomik ve estetik bir köprü kurar.
         */
        static drawMockNeckCollar(ctx, p, facing, isBack, isProfile, teeColor, teeAccent, isFemale = false, isGraffitiTee = false, isCyberTee = false, isDress = false, isK2CyberDress = false, isK2GothDress = false) {
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const bottomW = isFemale ? 6.6 : 7.8;
            const collarW = bottomW + 0.6; // Organik trapez boyun tabanını tam saran yaka payı

            ctx.save();

            if (isK2GothDress) {
                // GOTİK KADIFE CHOKER & GÜMÜŞ KOLYE UCU
                const shiftX = isProfile ? (dirSign * 2.0) : ((facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0);
                ctx.fillStyle = "#09090b"; // Siyah kadife choker
                ctx.beginPath();
                ctx.roundRect(shiftX - collarW * 0.42, 7.8, collarW * 0.84, 1.4, 0.4);
                ctx.fill();

                if (!isBack) {
                    // Gümüş metal haç / halka kolye ucu
                    ctx.fillStyle = "#cbd5e1";
                    ctx.beginPath();
                    ctx.arc(shiftX, 8.8, 0.7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(shiftX - 0.3, 8.8, 0.6, 1.2);
                }
                ctx.restore();
                return;
            } else if (isK2CyberDress) {
                // SİBER NEON CHOKER & CYAN LED
                const shiftX = isProfile ? (dirSign * 2.0) : ((facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0);
                ctx.fillStyle = "#0f172a";
                ctx.beginPath();
                ctx.roundRect(shiftX - collarW * 0.44, 7.8, collarW * 0.88, 1.4, 0.4);
                ctx.fill();

                if (!isBack) {
                    // Parlayan cyan LED gösterge
                    ctx.fillStyle = "#0ea5e9";
                    ctx.shadowColor = "#38bdf8";
                    ctx.shadowBlur = 4;
                    ctx.fillRect(shiftX - 1.2, 8.1, 2.4, 0.8);
                }
                ctx.restore();
                return;
            } else if (isDress) {
                // Standart Kolsuz Elbise: Yaka Yok (Doğal Dekolte Boyun)
                ctx.restore();
                return;
            }

            if (isProfile) {
                // Yan Profil Dik Yaka (Ense ve gıdı eğimiyle uyumlu sokak mock-neck silüeti)
                const cBackX = -dirSign * 5.0;  // Ense arkasını ve sırtı tam kavrar
                const cFrontX = dirSign * 3.6;  // Ön köprücük kemiğini tam kavrar
                const minX = Math.min(cBackX, cFrontX);
                const spanW = Math.abs(cFrontX - cBackX);

                // 1. Ana Mock-Neck Yaka Kumaşı
                ctx.fillStyle = teeColor;
                ctx.beginPath();
                ctx.moveTo(cBackX, 7.7);
                ctx.quadraticCurveTo(0, 8.0, cFrontX, 8.2);
                ctx.lineTo(cFrontX + dirSign * 0.3, 10.0);
                ctx.lineTo(cBackX - dirSign * 0.2, 10.0);
                ctx.closePath();
                ctx.fill();

                // 2. Çift Dikişli Ribana Yaka Kenarı (Ribbed Hem Highlight)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(cBackX, 7.7);
                ctx.quadraticCurveTo(0, 8.0, cFrontX, 8.2);
                ctx.stroke();

                // 3. Boyun Tenine Düşen Mikro Temas Gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                ctx.beginPath();
                ctx.moveTo(cBackX + dirSign * 0.2, 7.4);
                ctx.lineTo(cFrontX - dirSign * 0.2, 7.9);
                ctx.lineTo(cFrontX, 8.2);
                ctx.lineTo(cBackX, 7.7);
                ctx.closePath();
                ctx.fill();

                // Cyber T-shirt için neon dikiş mikro-detayı
                if (isCyberTee) {
                    ctx.strokeStyle = "rgba(14, 165, 233, 0.50)";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(minX + spanW * 0.3, 9.2);
                    ctx.lineTo(minX + spanW * 0.7, 9.2);
                    ctx.stroke();
                }

            } else if (isBack) {
                // Tam Sırt & 3/4 Sırt Ense Yakası (Ense dibini saran dik ribana bandı)
                const shiftX = (facing === 'up-right' || facing === 'up-left') ? (dirSign * 0.5) : 0;

                // 1. Ana Mock-Neck Yaka Kumaşı
                ctx.fillStyle = teeColor;
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2, 8.1);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX + collarW / 2, 8.1);
                ctx.lineTo(shiftX + collarW / 2 + 0.3, 10.0);
                ctx.lineTo(shiftX - collarW / 2 - 0.3, 10.0);
                ctx.closePath();
                ctx.fill();

                // 2. Ribana Çift Dikiş Kenarı
                ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2 + 0.3, 8.1);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX + collarW / 2 - 0.3, 8.1);
                ctx.stroke();

                // 3. Ense Tenine Düşen Mikro Temas Gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.20)";
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2 + 0.4, 8.1);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX + collarW / 2 - 0.4, 8.1);
                ctx.lineTo(shiftX + collarW / 2 - 0.4, 7.5);
                ctx.quadraticCurveTo(shiftX, 7.1, shiftX - collarW / 2 + 0.4, 7.5);
                ctx.closePath();
                ctx.fill();

            } else {
                // Tam Ön & 3/4 Ön Boğaz Yakası (Ön boyun dibini saran streetwear mock-neck)
                const shiftX = (facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0;

                // 1. Ana Mock-Neck Yaka Kumaşı
                ctx.fillStyle = teeColor;
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2, 7.9);
                ctx.quadraticCurveTo(shiftX, 8.2, shiftX + collarW / 2, 7.9);
                ctx.lineTo(shiftX + collarW / 2 + 0.3, 10.0);
                ctx.lineTo(shiftX - collarW / 2 - 0.3, 10.0);
                ctx.closePath();
                ctx.fill();

                // 2. Ribana Çift Dikiş Kenarı (Streetwear Rib Hem)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2 + 0.3, 7.9);
                ctx.quadraticCurveTo(shiftX, 8.2, shiftX + collarW / 2 - 0.3, 7.9);
                ctx.stroke();

                // 3. Boğaz Tenine Düşen Mikro Temas Gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.18)";
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2 + 0.4, 7.9);
                ctx.quadraticCurveTo(shiftX, 8.2, shiftX + collarW / 2 - 0.4, 7.9);
                ctx.lineTo(shiftX + collarW / 2 - 0.4, 7.4);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX - collarW / 2 + 0.4, 7.4);
                ctx.closePath();
                ctx.fill();

                // Cyber T-shirt için neon dikiş mikro-detayı
                if (isCyberTee) {
                    ctx.strokeStyle = "rgba(14, 165, 233, 0.50)";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(shiftX - 2.0, 9.2);
                    ctx.lineTo(shiftX + 2.0, 9.2);
                    ctx.stroke();
                }
            }

            ctx.restore();
        }

        /**
         * Kafa, Saç ve Canlı Yüz (Blinking, Farkındalık & Konuşma Destekli)
         */
        static drawStreetwearHead(ctx, headX, headY, p, facing, isBack, isProfile, skinColor, blinkProgress = 0, lookShiftX = 0, lookShiftY = 0, isTalking = false, teeColor = null, teeAccent = null, isGraffitiTee = false, isCyberTee = false, smokeState = null) {
            ctx.save();
            ctx.translate(headX, headY);

            // T-shirt renk ve stil fallback koruması
            if (!teeColor) {
                const isGraff = (p && (p.shirt === 'k2_graffiti_oversize' || p.color === 'k2_graffiti_oversize'));
                const isCyber = (p && (p.shirt === 'cyber_tactical' || p.color === 'cyber_tactical'));
                teeColor = isGraff ? '#18181b' : (isCyber ? '#0f172a' : ((p && p.shirt && p.shirt !== 'none') ? p.shirt : ((p && p.color) || '#3b82f6')));
                teeAccent = isGraff ? '#ec4899' : (isCyber ? '#0ea5e9' : '#38bdf8');
                isGraffitiTee = isGraff;
                isCyberTee = isCyber;
            }

            // 0. Anatomik Boyun (Kafayı ve Gövdeyi Doğal Bağlayan Kavisli Boyun - 1.2px)
            const outfitId = (p && (p.outfit || p.color)) || '';
            const isK2CyberDress = (outfitId === 'dress_k2_cyber_street' || (p && p.shirt === 'dress_k2_cyber_street'));
            const isK2GothDress = (outfitId === 'dress_k2_goth_grunge' || (p && p.shirt === 'dress_k2_goth_grunge'));
            const isDress = isK2CyberDress || isK2GothDress || (typeof outfitId === 'string' && outfitId.startsWith('dress_'));
            const isFemale = (p && (p.isFemale || p.gender === 'female' || (typeof isFemaleAvatar === 'function' && isFemaleAvatar(p)) || isDress || (p.shirt && (p.shirt.includes('crop') || p.shirt.includes('dress') || p.shirt.includes('pastel'))) || (p.pants && (p.pants.includes('mini') || p.pants.includes('flared') || p.pants.includes('fishnet'))) || (p.hat && p.hat.startsWith('hair_k2_'))));
            this.drawSkeletalNeck(ctx, p, facing, isBack, isProfile, skinColor, isFemale);

            // 1. Kafa Tabanı & Kulaklar
            this.drawSkeletalHead(ctx, p, facing, isBack, isProfile, skinColor);

            // 1.4. Streetwear Mock-Neck Boyunluk / Gotik Choker / Siber Yaka
            this.drawMockNeckCollar(ctx, p, facing, isBack, isProfile, teeColor, teeAccent, isFemale, isGraffitiTee, isCyberTee, isDress, isK2CyberDress, isK2GothDress);

            // 2. Doğal Kavisli Saç / Şapka
            this.drawSkeletalHair(ctx, p, facing, isBack, isProfile, isFemale);

            // 3. Canlı Yüz & Göz Kırpma (Blinking, Idle Look-Around & Talking Mouth)
            if (!isBack) {
                this.drawSkeletalFace(ctx, p, facing, isProfile, blinkProgress, lookShiftX, lookShiftY, isTalking, smokeState, isFemale);
            }

            ctx.restore();
        }

        /**
         * Modüler Kafa Tabanı Çizimi (Kulaklar, Burun Çıkıntısı, Hacim Gölgelendirmesi)
         */
        static drawSkeletalHead(ctx, p, facing, isBack, isProfile, skinColor) {
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

            ctx.fillStyle = skinColor;
            ctx.strokeStyle = "rgba(0,0,0,0.18)";
            ctx.lineWidth = 0.8;

            // 1. Kulaklar (Kıkırdak Derinliğiyle)
            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Yan profilde kulak
                const earX = -2.4;
                const earY = -2.5;
                ctx.beginPath();
                ctx.ellipse(earX, earY, 2.2, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Kulak içi kıkırdak kıvrımı
                ctx.strokeStyle = "rgba(0,0,0,0.15)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.arc(earX, earY, 1.2, -Math.PI * 0.4, Math.PI * 0.7);
                ctx.stroke();

                ctx.restore();

            } else if (facing === 'down' || isBack) {
                // Ön ve arka bakışta iki yanda kulaklar
                [-9.2, 9.2].forEach(ex => {
                    ctx.beginPath();
                    ctx.ellipse(ex, -2.5, 2.1, 3.1, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Kıkırdak
                    ctx.strokeStyle = "rgba(0,0,0,0.14)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.arc(ex, -2.5, 1.1, 0, Math.PI * 2);
                    ctx.stroke();
                });

            } else {
                // Çapraz açılarda yakın kulak
                const nearEarX = -dirSign * 8.4;
                ctx.beginPath();
                ctx.ellipse(nearEarX, -2.5, 2.1, 2.9, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = "rgba(0,0,0,0.14)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.arc(nearEarX, -2.5, 1.1, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 2. Anatomik-Chibi Kafa & Çene Silüeti (Daire yerine organik hat)
            ctx.fillStyle = skinColor;
            ctx.strokeStyle = "rgba(0,0,0,0.18)";
            ctx.lineWidth = 0.9;
            ctx.beginPath();

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Yan Profil: Yuvarlak arka kafatası, hafif alın kavisi, kalkık burun, dudak ve yuvarlak çene
                ctx.arc(0, -2.5, 9.8, Math.PI * 0.42, Math.PI * 1.5, false);
                ctx.lineTo(6.0, -10.5);
                ctx.quadraticCurveTo(8.4, -6.8, 8.2, -4.2);
                // Burun ucu
                ctx.lineTo(10.4, -2.0);
                ctx.lineTo(8.6, -0.6);
                // Dudak & Çene
                ctx.quadraticCurveTo(8.4, 1.2, 6.6, 4.6);
                ctx.quadraticCurveTo(2.5, 6.8, 0, 7.0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();

            } else if (isDiagonal) {
                // 3/4 Çapraz: Üst kubbe, elmacık kemiği kavisi ve hafif asimetrik U-çene
                ctx.arc(0, -2.5, 9.8, Math.PI * 0.96, Math.PI * 0.04, false);
                ctx.quadraticCurveTo(9.6, 2.2, 5.0, 6.2);
                ctx.quadraticCurveTo(dirSign * 1.2, 7.2, -4.0, 6.2);
                ctx.quadraticCurveTo(-9.6, 2.0, -9.8, -2.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

            } else {
                // Tam Ön ve Tam Sırt: Üst geniş kubbe, dolgun yanaklar ve zarif U-çene
                ctx.arc(0, -2.5, 9.8, Math.PI, 0, false);
                ctx.quadraticCurveTo(9.6, 2.2, 4.4, 6.2);
                ctx.quadraticCurveTo(0, 7.2, -4.4, 6.2);
                ctx.quadraticCurveTo(-9.6, 2.2, -9.8, -2.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            // 4. Tepe Ortam Işığı Yansıması
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.beginPath();
            ctx.ellipse(-2.5, -8.5, 4.0, 1.8, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // 5. Yanaklarda Tatlı Sıcaklık (Chibi Soft Blush)
            if (!isBack) {
                ctx.fillStyle = "rgba(244, 114, 182, 0.16)";
                ctx.beginPath();
                if (isProfile) {
                    ctx.ellipse(dirSign * 4.6, 0.4, 2.6, 1.3, dirSign * 0.1, 0, Math.PI * 2);
                } else if (isDiagonal) {
                    ctx.ellipse(dirSign * 5.2, 0.4, 2.5, 1.3, dirSign * 0.1, 0, Math.PI * 2);
                    ctx.ellipse(-dirSign * 1.8, 0.3, 2.0, 1.1, -dirSign * 0.1, 0, Math.PI * 2);
                } else {
                    ctx.ellipse(-5.0, 0.4, 2.4, 1.3, -0.08, 0, Math.PI * 2);
                    ctx.ellipse(5.0, 0.4, 2.4, 1.3, 0.08, 0, Math.PI * 2);
                }
                ctx.fill();
            }
        }

        /**
         * K2 Skater Kova Şapka (Bucket Hat - 8 Açılı Salaş Kumaş Başlık)
         */
        static drawSkaterBucketHat(ctx, facing, isBack, isProfile) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');
            const shiftX = isProfile ? (dirSign * 1.5) : (isDiagonal ? (dirSign * 1.0) : 0);

            // 1. Kova Şapka Kubbesi (Crown)
            ctx.fillStyle = "#27272a";
            ctx.beginPath();
            ctx.roundRect(shiftX - 7.5, -12.5, 15.0, 8.5, [4.0, 4.0, 1.5, 1.5]);
            ctx.fill();

            // Kubbe dikiş halkası
            ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(shiftX - 7.0, -8.0);
            ctx.lineTo(shiftX + 7.0, -8.0);
            ctx.stroke();

            // 2. Salaş Kova Siperliği (Brim)
            ctx.fillStyle = "#18181b";
            ctx.beginPath();
            if (isProfile) {
                ctx.ellipse(shiftX + dirSign * 0.5, -4.5, 12.0, 3.8, dirSign * 0.08, 0, Math.PI * 2);
            } else if (isBack) {
                ctx.ellipse(shiftX, -4.2, 11.5, 3.4, 0, 0, Math.PI * 2);
            } else {
                ctx.ellipse(shiftX, -4.5, 12.0, 3.8, 0, 0, Math.PI * 2);
            }
            ctx.fill();

            // Siperlik Çift Dikiş Çizgisi
            ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.ellipse(shiftX, -4.5, 10.2, 3.0, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 3. Ön Neon Pembe Grafiti Yama (Logo Patch)
            if (!isBack) {
                const patchX = shiftX + (isProfile ? dirSign * 3.0 : 0);
                ctx.fillStyle = "#ec4899";
                ctx.beginPath();
                ctx.roundRect(patchX - 2.2, -10.0, 4.4, 3.2, 0.6);
                ctx.fill();

                // Yama içi beyaz mini skater simgesi
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(patchX - 1.2, -9.0, 2.4, 1.2);
            }

            // Siperliğin altından dökülen yan favoriler & arka saçlar
            ctx.fillStyle = "#26150b";
            if (isBack) {
                // Ense saçları
                ctx.beginPath();
                ctx.roundRect(-4.5, -2.5, 9.0, 3.2, [0, 0, 2, 2]);
                ctx.fill();
            } else if (isProfile) {
                // Kulak önü favori
                ctx.fillRect(-dirSign * 2.0, -3.5, 1.5, 3.0);
            } else {
                // İki yandaki favoriler
                ctx.fillRect(-7.2, -3.5, 1.4, 2.8);
                ctx.fillRect(5.8, -3.5, 1.4, 2.8);
            }

            ctx.restore();
        }

        /**
         * Modüler Saç Çizimi & K2 Özel Saç Modelleri
         */
        static drawSkeletalHair(ctx, p, facing, isBack, isProfile, isFemale = false) {
            const hatType = p.hat || 'none';
            if (hatType === 'k2_skater_bucket') {
                this.drawSkaterBucketHat(ctx, facing, isBack, isProfile);
                return;
            }

            const hairColor = p.hairColor || "#26150b";
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;

            const isK2TwinTails = (hatType === 'hair_k2_twin_tails' || hatType === 'hats_hair_k2_twin_tails');
            const isK2WavyShoulder = (hatType === 'hair_k2_wavy_shoulder' || hatType === 'hats_hair_k2_wavy_shoulder');
            const isK2HimeCut = (hatType === 'hair_k2_hime_cut' || hatType === 'hats_hair_k2_hime_cut');
            const isDefaultFemaleHair = (isFemale && (hatType === 'none' || !hatType || hatType === ''));

            if (isK2TwinTails) {
                this.drawK2TwinTails(ctx, hairColor, facing, isBack, isProfile, dirSign);
                return;
            } else if (isK2WavyShoulder || isDefaultFemaleHair) {
                this.drawK2WavyShoulder(ctx, hairColor, facing, isBack, isProfile, dirSign);
                return;
            } else if (isK2HimeCut) {
                this.drawK2HimeCut(ctx, hairColor, facing, isBack, isProfile, dirSign);
                return;
            }

            if (hatType !== 'none' && typeof drawAvatarHairAndHats === 'function') {
                drawAvatarHairAndHats(ctx, 0, 15.5, hatType, facing);
                return;
            }

            // Erkek Kısa Skater Saçı (Buzz Fade)
            const highlightColor = "rgba(255,255,255,0.12)";

            ctx.save();
            ctx.fillStyle = hairColor;

            if (isBack) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.3, Math.PI * 0.88, Math.PI * 0.12, false);
                ctx.quadraticCurveTo(8.5, 3.0, 5.0, 4.8);
                ctx.lineTo(-5.0, 4.8);
                ctx.quadraticCurveTo(-8.5, 3.0, -9.8, -1.8);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = "rgba(0,0,0,0.22)";
                ctx.beginPath();
                ctx.roundRect(-4.5, 2.8, 9.0, 2.0, [0, 0, 2, 2]);
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.0, 7.8, Math.PI * 1.15, Math.PI * 1.85);
                ctx.stroke();

            } else if (isProfile) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.3, Math.PI * 0.65, Math.PI * 1.85, false);
                ctx.lineTo(dirSign * 6.5, -7.5);
                ctx.quadraticCurveTo(dirSign * 2.0, -8.0, 0, -6.5);
                ctx.lineTo(-dirSign * 1.2, -1.5);
                ctx.lineTo(-dirSign * 3.5, -2.5);
                ctx.quadraticCurveTo(-dirSign * 6.0, 1.5, -dirSign * 4.0, 4.2);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.0, 7.5, Math.PI * 1.25, Math.PI * 1.75);
                ctx.stroke();

            } else {
                const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

                ctx.beginPath();
                ctx.arc(0, -3.2, 10.3, Math.PI * 0.95, Math.PI * 2.05, false);
                ctx.quadraticCurveTo(8.5, -3.0, 7.5 + fShift * 0.4, -6.0);
                ctx.quadraticCurveTo(3.0 + fShift, -4.5, fShift, -6.8);
                ctx.quadraticCurveTo(-3.0 + fShift, -4.5, -7.5 + fShift * 0.4, -6.0);
                ctx.quadraticCurveTo(-8.5, -3.0, -9.8, -1.8);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(fShift * 0.5, -5.5, 7.5, Math.PI * 1.2, Math.PI * 1.8);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * K2 Twin Tails (İkiz Örgü / İkiz Atkuyruğu - Sevimli Chibi Twintails & Kurdeleler)
         */
        static drawK2TwinTails(ctx, hairColor, facing, isBack, isProfile, dirSign) {
            const highlightColor = "rgba(255, 255, 255, 0.26)";
            const shadowColor = "rgba(0, 0, 0, 0.25)";
            const ribbonColor = "#ec4899";
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            ctx.save();
            ctx.fillStyle = hairColor;

            if (isBack) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.88, Math.PI * 0.12, false);
                ctx.quadraticCurveTo(8.5, 3.0, 5.0, 5.2);
                ctx.lineTo(-5.0, 5.2);
                ctx.quadraticCurveTo(-8.5, 3.0, -9.8, -1.8);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = shadowColor;
                ctx.lineWidth = 0.9;
                ctx.beginPath();
                ctx.moveTo(0, -12.5);
                ctx.lineTo(0, 4.5);
                ctx.stroke();

                [-1, 1].forEach(side => {
                    const tx = side * 8.2;
                    const ty = -3.5;
                    ctx.fillStyle = hairColor;
                    ctx.beginPath();
                    ctx.moveTo(tx - side * 1.5, ty);
                    ctx.bezierCurveTo(side * 12.5, 0.5, side * 13.5, 6.0, side * 9.5, 11.5);
                    ctx.bezierCurveTo(side * 10.5, 6.5, side * 9.2, 1.5, tx + side * 1.5, ty);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.moveTo(tx, ty + 1.0);
                    ctx.bezierCurveTo(side * 11.8, 1.5, side * 12.2, 5.5, side * 9.5, 10.5);
                    ctx.stroke();

                    ctx.fillStyle = ribbonColor;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 1.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(tx - 1.2, ty + 0.8, 0.8, 2.2);
                    ctx.fillRect(tx + 0.4, ty + 0.8, 0.8, 2.2);
                });

            } else if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // 1. Arka At Kuyruğu (Derinlik Gölgesi)
                ctx.fillStyle = shadowColor;
                ctx.beginPath();
                ctx.moveTo(-6.5, -3.0);
                ctx.bezierCurveTo(-10.5, 1.0, -10.8, 6.0, -7.5, 10.0);
                ctx.bezierCurveTo(-8.2, 6.0, -7.2, 1.5, -5.5, -3.0);
                ctx.fill();

                // 2. Kafa Tabanı Saçı (Kafatasını ve enseyi tam kapatan saç kütlesi)
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.moveTo(7.2, -6.8);
                ctx.quadraticCurveTo(5.0, -11.5, 0, -13.5);
                ctx.quadraticCurveTo(-7.5, -13.4, -11.0, -6.5);
                ctx.quadraticCurveTo(-11.8, -1.0, -10.5, 3.5);
                ctx.quadraticCurveTo(-8.5, 6.0, -5.5, 6.5);
                ctx.quadraticCurveTo(-2.0, 5.0, -0.5, 2.5);
                ctx.quadraticCurveTo(1.5, -1.0, 3.2, -4.2);
                ctx.quadraticCurveTo(5.0, -6.0, 7.2, -6.8);
                ctx.closePath();
                ctx.fill();

                // 3. Ön At Kuyruğu
                const nearTx = -3.0;
                const nearTy = -3.5;
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.moveTo(nearTx - 1.5, nearTy);
                ctx.bezierCurveTo(-8.0, 1.0, -6.5, 7.5, -1.5, 12.0);
                ctx.bezierCurveTo(-4.2, 7.0, -5.0, 1.5, nearTx + 1.5, nearTy);
                ctx.closePath();
                ctx.fill();

                // Işıltı
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(nearTx, nearTy + 1.0);
                ctx.bezierCurveTo(-6.8, 1.5, -5.5, 7.0, -1.8, 11.0);
                ctx.stroke();

                // Kurdele
                ctx.fillStyle = ribbonColor;
                ctx.beginPath();
                ctx.arc(nearTx, nearTy, 1.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(nearTx - 0.8, nearTy + 0.8, 1.6, 2.4);

                ctx.restore();

            } else {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.95, Math.PI * 2.05, false);
                ctx.quadraticCurveTo(8.8, -2.5, 8.0 + fShift * 0.4, -4.5);
                ctx.quadraticCurveTo(5.0 + fShift, -3.5, 3.2 + fShift, -5.0);
                ctx.quadraticCurveTo(1.0 + fShift, -3.2, -0.5 + fShift, -5.2);
                ctx.quadraticCurveTo(-2.8 + fShift, -3.5, -4.8 + fShift, -5.0);
                ctx.quadraticCurveTo(-7.5 + fShift, -3.5, -8.2 + fShift * 0.4, -4.5);
                ctx.quadraticCurveTo(-9.2, -2.5, -10.2, -1.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.arc(fShift * 0.4, -5.8, 7.6, Math.PI * 1.2, Math.PI * 1.8);
                ctx.stroke();

                [-1, 1].forEach(side => {
                    const tx = side * 8.6 + fShift * 0.3;
                    const ty = -3.2;

                    ctx.fillStyle = shadowColor;
                    ctx.beginPath();
                    ctx.ellipse(tx + side * 1.2, ty + 3.0, 1.8, 3.8, side * 0.25, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = hairColor;
                    ctx.beginPath();
                    ctx.moveTo(tx - side * 1.4, ty);
                    ctx.bezierCurveTo(side * 12.2 + fShift * 0.4, 1.5, side * 12.8 + fShift * 0.4, 6.5, side * 8.8 + fShift * 0.2, 11.2);
                    ctx.bezierCurveTo(side * 10.2 + fShift * 0.3, 6.5, side * 9.6 + fShift * 0.3, 1.5, tx + side * 1.4, ty);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.moveTo(tx, ty + 1.2);
                    ctx.bezierCurveTo(side * 11.4 + fShift * 0.4, 2.0, side * 11.8 + fShift * 0.4, 6.0, side * 9.0 + fShift * 0.2, 10.2);
                    ctx.stroke();

                    ctx.fillStyle = ribbonColor;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(tx - 0.7, ty + 0.8, 1.4, 2.2);
                });
            }

            ctx.restore();
        }

        /**
         * K2 Wavy Shoulder (Omuz Hizası Dalgalı Katlı Kadın Saçı - Doğal Tebessüm & Zarafet)
         */
        static drawK2WavyShoulder(ctx, hairColor, facing, isBack, isProfile, dirSign) {
            const highlightColor = "rgba(255, 255, 255, 0.24)";
            const shadowColor = "rgba(0, 0, 0, 0.22)";
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            ctx.save();
            ctx.fillStyle = hairColor;

            if (isBack) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.5, Math.PI * 0.85, Math.PI * 0.15, false);
                ctx.bezierCurveTo(9.8, 2.0, 10.8, 6.5, 8.5, 9.8);
                ctx.quadraticCurveTo(5.0, 8.5, 2.0, 9.5);
                ctx.quadraticCurveTo(-2.0, 8.5, -5.0, 9.5);
                ctx.bezierCurveTo(-8.5, 9.8, -10.8, 6.5, -9.8, 2.0);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = shadowColor;
                ctx.beginPath();
                ctx.ellipse(0, 6.2, 6.0, 1.8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.0, 7.6, Math.PI * 1.15, Math.PI * 1.85);
                ctx.moveTo(-5.5, 3.5); ctx.quadraticCurveTo(-7.0, 6.0, -6.0, 8.5);
                ctx.moveTo(5.5, 3.5); ctx.quadraticCurveTo(7.0, 6.0, 6.0, 8.5);
                ctx.stroke();

            } else if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Kafatası kubbesini, enseyi ve boyun arkasını tamamen örten kusursuz dalgalı saç silüeti
                ctx.beginPath();
                ctx.moveTo(7.2, -6.8);
                // Tepe kubbesi ve arka kafatası yayılımı
                ctx.quadraticCurveTo(5.0, -11.5, 0, -13.6);
                ctx.quadraticCurveTo(-7.5, -13.5, -11.2, -6.5);
                ctx.quadraticCurveTo(-12.5, -2.0, -11.5, 2.5);
                // Omuza dökülen dalgalı hacim (kafatasını ve enseyi %100 sarar)
                ctx.quadraticCurveTo(-10.8, 6.0, -8.5, 9.5);
                ctx.quadraticCurveTo(-7.0, 11.0, -4.5, 11.2);
                // Omuz üstü dalgalı alt hat
                ctx.quadraticCurveTo(-1.5, 9.8, 0.5, 10.8);
                ctx.quadraticCurveTo(2.2, 11.2, 3.8, 9.6);
                // Yüzü ve çeneyi çerçeveleyen ön lüle
                ctx.quadraticCurveTo(4.2, 6.5, 3.0, 2.5);
                ctx.quadraticCurveTo(1.5, -1.0, 3.2, -4.2);
                ctx.quadraticCurveTo(5.0, -6.0, 7.2, -6.8);
                ctx.closePath();
                ctx.fill();

                // Işıltı ve saç teli çizgileri
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.5, 7.5, Math.PI * 1.25, Math.PI * 1.75);
                ctx.moveTo(-4.0, 3.0);
                ctx.quadraticCurveTo(-6.0, 6.5, -3.5, 9.8);
                ctx.moveTo(1.5, 2.0);
                ctx.quadraticCurveTo(2.8, 5.5, 1.8, 8.5);
                ctx.stroke();

                ctx.restore();

            } else {
                ctx.fillStyle = shadowColor;
                [-1, 1].forEach(side => {
                    ctx.beginPath();
                    ctx.ellipse(side * 8.6 + fShift * 0.4, 4.0, 2.2, 5.5, side * 0.12, 0, Math.PI * 2);
                    ctx.fill();
                });

                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.5, Math.PI * 0.95, Math.PI * 2.05, false);
                ctx.bezierCurveTo(9.6, -1.0, 10.8 + fShift * 0.4, 4.0, 8.5 + fShift * 0.3, 9.5);
                ctx.quadraticCurveTo(7.2 + fShift * 0.3, 7.5, 6.2 + fShift * 0.2, 3.5);
                ctx.quadraticCurveTo(4.5 + fShift, -1.5, 1.8 + fShift, -4.5);
                ctx.quadraticCurveTo(0 + fShift, -3.2, -1.8 + fShift, -4.5);
                ctx.quadraticCurveTo(-4.5 + fShift, -1.5, -6.2 + fShift * 0.2, 3.5);
                ctx.quadraticCurveTo(-7.2 + fShift * 0.3, 7.5, -8.5 + fShift * 0.3, 9.5);
                ctx.bezierCurveTo(-10.8 + fShift * 0.4, 4.0, -9.6, -1.0, -10.4, -2.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.arc(fShift * 0.4, -5.6, 7.6, Math.PI * 1.2, Math.PI * 1.8);
                ctx.moveTo(-8.0 + fShift * 0.3, 1.0);
                ctx.quadraticCurveTo(-9.2 + fShift * 0.4, 4.5, -7.5 + fShift * 0.3, 8.5);
                ctx.moveTo(8.0 + fShift * 0.3, 1.0);
                ctx.quadraticCurveTo(9.2 + fShift * 0.4, 4.5, 7.5 + fShift * 0.3, 8.5);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * K2 Hime Cut (Geleneksel Düz Kahkül, Yanak Hizasında Keskin Yan Bukleler & Uzun Düz Saç)
         */
        static drawK2HimeCut(ctx, hairColor, facing, isBack, isProfile, dirSign) {
            const highlightColor = "rgba(255, 255, 255, 0.28)";
            const shadowColor = "rgba(0, 0, 0, 0.28)";
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            ctx.save();
            ctx.fillStyle = hairColor;

            if (isBack) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.88, Math.PI * 0.12, false);
                ctx.lineTo(9.5, 12.5);
                ctx.lineTo(-9.5, 12.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = shadowColor;
                ctx.fillRect(-9.5, 11.5, 19.0, 1.0);

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(0, -5.0, 7.6, Math.PI * 1.15, Math.PI * 1.85);
                ctx.moveTo(-7.0, 4.0); ctx.lineTo(-7.0, 10.5);
                ctx.moveTo(7.0, 4.0); ctx.lineTo(7.0, 10.5);
                ctx.stroke();

            } else if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Arka Düz Uzun Saç Kütlesi (Sırt boyunca dökülen düz saç)
                ctx.fillStyle = shadowColor;
                ctx.beginPath();
                ctx.moveTo(-2.0, 4.0);
                ctx.lineTo(-2.0, 13.5);
                ctx.lineTo(-9.8, 13.5);
                ctx.lineTo(-9.8, 4.0);
                ctx.closePath();
                ctx.fill();

                // Kafa Tabanı, Düz Ön Kâkül & Hime Yan Buklesi (Kafatasını ve enseyi %100 kapatır)
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.moveTo(7.2, -6.8);
                // Tepe kubbesi
                ctx.quadraticCurveTo(5.0, -11.5, 0, -13.5);
                ctx.quadraticCurveTo(-7.5, -13.4, -11.2, -6.5);
                ctx.quadraticCurveTo(-12.0, -1.0, -11.0, 4.0);
                ctx.lineTo(-9.5, 13.5);
                ctx.lineTo(-4.5, 13.5);
                ctx.lineTo(-4.5, 3.5);
                // İmza Hime Yan Buklesi (Çene hizasında küt kesim)
                ctx.lineTo(3.2, 3.5);
                ctx.lineTo(3.2, -3.8);
                ctx.quadraticCurveTo(5.0, -6.0, 7.2, -6.8);
                ctx.closePath();
                ctx.fill();

                // Vurgu Çizgileri
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.5, 7.5, Math.PI * 1.22, Math.PI * 1.78);
                ctx.moveTo(-7.0, 3.0);
                ctx.lineTo(-7.0, 12.0);
                ctx.moveTo(1.8, -1.0);
                ctx.lineTo(1.8, 3.0);
                ctx.stroke();

                ctx.restore();

            } else {
                ctx.fillStyle = shadowColor;
                ctx.fillRect(-9.8, -1.0, 19.6, 13.5);

                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.95, Math.PI * 2.05, false);
                ctx.lineTo(9.8 + fShift * 0.3, -2.0);
                ctx.lineTo(9.8 + fShift * 0.3, 2.2);
                ctx.lineTo(7.4 + fShift * 0.3, 2.2);
                ctx.lineTo(7.4 + fShift * 0.3, -4.6);
                ctx.lineTo(-7.4 + fShift * 0.3, -4.6);
                ctx.lineTo(-7.4 + fShift * 0.3, 2.2);
                ctx.lineTo(-9.8 + fShift * 0.3, 2.2);
                ctx.lineTo(-9.8 + fShift * 0.3, -2.0);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(fShift * 0.4, -5.6, 7.6, Math.PI * 1.2, Math.PI * 1.8);
                ctx.moveTo(-8.6 + fShift * 0.3, -2.0); ctx.lineTo(-8.6 + fShift * 0.3, 1.8);
                ctx.moveTo(8.6 + fShift * 0.3, -2.0); ctx.lineTo(8.6 + fShift * 0.3, 1.8);
                ctx.stroke();

                ctx.fillStyle = shadowColor;
                ctx.fillRect(-7.4 + fShift * 0.3, -4.8, 14.8, 0.6);
            }

            ctx.restore();
        }

        /**
         * Canlı Yüz Çizimi (Gözbebeği, Işıltı, Kaş, Tebessüm ve Göz Kırpma)
         */
        static drawSkeletalFace(ctx, p, facing, isProfile, blinkProgress = 0, lookShiftX = 0, lookShiftY = 0, isTalking = false, smokeState = null, isFemale = false) {
            isFemale = isFemale || (p && (p.isFemale || p.gender === 'female' || (typeof isFemaleAvatar === 'function' && isFemaleAvatar(p))));
            const faceType = p.face || 'none';
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isAfk = (p && p.action === 'afk');
            const isBlinkClosed = (!isAfk && blinkProgress > 0.72);
            const isInhaling = (smokeState && smokeState.isInhaling);
            const isExhaling = (smokeState && smokeState.isExhaling);
            const chillEyeScaleY = isInhaling ? 0.38 : (isExhaling ? (0.60 + Math.min(1.0, smokeState.exhaleProgress * 1.4) * 0.40) : 1.0);
            const eyeScaleY = Math.max(0.08, (1.0 - blinkProgress * 0.92) * chillEyeScaleY);
            const browOffsetY = isAfk ? 0.8 : (isInhaling ? 0.55 : (blinkProgress * 0.65));
            const now = Date.now();
            const talkMouthOpen = isTalking ? Math.max(0, Math.sin(now / 105) * 0.65 + Math.sin(now / 175) * 0.35) : 0;

            ctx.save();

            if (isProfile) {
                // --- YAN PROFİL ---
                const eyeX = dirSign * 4.6;
                const eyeY = -3.2;

                // Kaş (Göz kırparken veya uyurken hafifçe aşağı yaylanır)
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                if (isFemale) {
                    // Kadın için zarif, kavisli ince kaş
                    ctx.roundRect(eyeX - 1.0, eyeY - 3.6 + browOffsetY, 3.4, 0.75, 0.4);
                } else {
                    ctx.roundRect(eyeX - 1.2, eyeY - 3.8 + browOffsetY, 3.8, 1.1, 0.5);
                }
                ctx.fill();

                if (isAfk) {
                    // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡) - Pürüzsüz & sade dinlenme
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.arc(eyeX + 1.2, eyeY + 0.3, 1.8, 0.18 * Math.PI, 0.82 * Math.PI);
                    ctx.stroke();

                    // Kadın için kapalı göz kirpiği
                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        ctx.moveTo(eyeX + 1.2 + dirSign * 1.4, eyeY + 0.3);
                        ctx.quadraticCurveTo(eyeX + 1.2 + dirSign * 2.2, eyeY - 0.2, eyeX + 1.2 + dirSign * 2.6, eyeY - 0.6);
                        ctx.stroke();
                    }

                } else if (isBlinkClosed) {
                    // Normal uyanıkken göz kırpma çizgisi
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(eyeX + 1.2, eyeY, 1.8, Math.PI * 1.15, Math.PI * 1.85);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        ctx.moveTo(eyeX + 1.2 + dirSign * 1.4, eyeY);
                        ctx.quadraticCurveTo(eyeX + 1.2 + dirSign * 2.2, eyeY - 0.5, eyeX + 1.2 + dirSign * 2.6, eyeY - 0.8);
                        ctx.stroke();
                    }
                } else {
                    // Normal açık göz (Göz Akı & İris)
                    ctx.save();
                    ctx.translate(eyeX + 1.2, eyeY + 0.6);
                    ctx.scale(1.0, eyeScaleY);
                    ctx.translate(-(eyeX + 1.2), -(eyeY + 0.6));

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(eyeX - 0.4, eyeY - 1.2, 3.4, 3.6, 1.2);
                    ctx.fill();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(eyeX + (dirSign > 0 ? 0.4 : -0.2) + (lookShiftX * 0.4), eyeY - 0.8 + lookShiftY, 2.4, 3.0, 1.0);
                    ctx.fill();

                    // Canlılık katan beyaz parlama noktası ✨
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(eyeX + 1.2 + (lookShiftX * 0.4), eyeY + lookShiftY, 0.7, 0, Math.PI * 2);
                    ctx.fill();

                    // Kadın için kıvrık kuyruklu dış kirpik
                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        const lashCornerX = eyeX + (dirSign > 0 ? 2.8 : -0.2);
                        ctx.moveTo(lashCornerX, eyeY - 0.8);
                        ctx.quadraticCurveTo(lashCornerX + dirSign * 1.2, eyeY - 1.8, lashCornerX + dirSign * 1.8, eyeY - 2.2);
                        ctx.stroke();
                    }

                    ctx.restore();
                }

                // Kadın Yan Profil Allık (Cheek Blush & Highlight)
                if (isFemale) {
                    ctx.fillStyle = "rgba(244, 114, 182, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(eyeX + dirSign * 0.4, eyeY + 3.2, 2.0, 1.1, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                    ctx.beginPath();
                    ctx.arc(eyeX + dirSign * 0.4 + 0.4, eyeY + 2.8, 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Ağız / Konuşma / Sigara Durumları
                const isHoldingOrInhalingProfile = (smokeState && (smokeState.isInhaling || smokeState.liftProgress > 0.35));
                const isExhalingProfile = (smokeState && smokeState.isExhaling && smokeState.exhaleProgress < 0.95);

                if (isExhalingProfile) {
                    // DUMAN ÜFLERKEN: Karizmatik, zarif ve hafif büzülmüş "O" üfleme ağzı
                    const p = smokeState.exhaleProgress;
                    const pulse = Math.sin(p * Math.PI);
                    const openW = 0.95 + pulse * 0.35;
                    const openH = 0.85 + pulse * 0.40;

                    // Dış dudak
                    ctx.fillStyle = "#854d0e";
                    ctx.beginPath();
                    ctx.ellipse(dirSign * 5.6, 2.4, openW + 0.35, openH + 0.35, dirSign * 0.15, 0, Math.PI * 2);
                    ctx.fill();

                    // İç koyu boşluk
                    ctx.fillStyle = "#2d060e";
                    ctx.beginPath();
                    ctx.ellipse(dirSign * 5.6, 2.4, openW, openH, dirSign * 0.15, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isHoldingOrInhalingProfile) {
                    // SİGARA İÇERKEN: Dudaklar sigara filtresini sarar (sıkı, nötr, karizmatik dudak)
                    ctx.strokeStyle = "#854d0e";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(dirSign * 4.2, 2.2);
                    ctx.lineTo(dirSign * 6.8, 2.2);
                    ctx.stroke();

                    // Filtre tutuş koyuluğu
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    ctx.arc(dirSign * 5.6, 2.2, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isTalking && talkMouthOpen > 0.18) {
                    const openH = talkMouthOpen * 1.8;
                    ctx.fillStyle = "#881337";
                    ctx.strokeStyle = "#854d0e";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(dirSign * 5.6, 2.4, 1.6, openH, (dirSign > 0 ? 0.15 : -0.15), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Minik diş parıltısı
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(dirSign * 4.9, 2.4 - openH * 0.75, 1.4, Math.min(1.0, openH * 0.7), 0.3);
                    ctx.fill();
                } else {
                    if (isFemale) {
                        // Zarif kadın profili tebessüm ve cupid's bow dudak dolgunluğu
                        ctx.strokeStyle = "#e11d48";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 4.2, 2.0);
                            ctx.lineTo(dirSign * 6.5, 2.0);
                        } else {
                            ctx.moveTo(dirSign * 4.2, 2.1);
                            ctx.quadraticCurveTo(dirSign * 5.6, 2.5, dirSign * 6.8, 1.9);
                        }
                        ctx.stroke();

                        // Alt dudak yumuşak dolgunluk tonu
                        ctx.fillStyle = "rgba(244, 114, 182, 0.38)";
                        ctx.beginPath();
                        ctx.ellipse(dirSign * 5.4, 2.6, 0.85, 0.45, dirSign * 0.1, 0, Math.PI * 2);
                        ctx.fill();

                        // Parlak lip gloss ışıltısı ✨
                        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                        ctx.beginPath();
                        ctx.ellipse(dirSign * 5.4, 2.5, 0.45, 0.22, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Erkek doğal dinlenme / tebessüm kıvrımı
                        ctx.strokeStyle = "#854d0e";
                        ctx.lineWidth = 0.9;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 4.2, 2.0);
                            ctx.lineTo(dirSign * 6.5, 2.0);
                        } else {
                            ctx.moveTo(dirSign * 4.0, 2.2);
                            ctx.quadraticCurveTo(dirSign * 6.0, 2.8, dirSign * 7.2, 1.8);
                        }
                        ctx.stroke();
                    }
                }

            } else if (facing === 'down') {
                // --- TAM ÖN GÖRÜNÜM ---
                [-4.2, 4.2].forEach(eyeX => {
                    // Kaşlar (Hafif yaylanma veya uyku rahatlaması)
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    if (isFemale) {
                        // Kadın için zarif kavisli ince kaş
                        ctx.roundRect(eyeX - 1.5, -6.8 + browOffsetY, 3.0, 0.75, 0.4);
                    } else {
                        ctx.roundRect(eyeX - 1.6, -7.0 + browOffsetY, 3.4, 1.1, 0.5);
                    }
                    ctx.fill();

                    if (isAfk) {
                        // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡ ◡) - Pürüzsüz & sade dinlenme
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 1.4;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.arc(eyeX, -2.8, 1.9, 0.18 * Math.PI, 0.82 * Math.PI);
                        ctx.stroke();

                        if (isFemale) {
                            const lashSign = eyeX > 0 ? 1 : -1;
                            ctx.strokeStyle = "#0f172a";
                            ctx.lineWidth = 0.85;
                            ctx.lineCap = "round";
                            ctx.beginPath();
                            ctx.moveTo(eyeX + lashSign * 1.6, -2.5);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.6, -3.2, eyeX + lashSign * 3.2, -4.0);
                            ctx.stroke();
                        }

                    } else if (isBlinkClosed) {
                        // Normal uyanıkken göz kırpma çizgisi
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.arc(eyeX, -3.2, 1.8, Math.PI * 1.15, Math.PI * 1.85);
                        ctx.stroke();

                        if (isFemale) {
                            const lashSign = eyeX > 0 ? 1 : -1;
                            ctx.strokeStyle = "#0f172a";
                            ctx.lineWidth = 0.85;
                            ctx.lineCap = "round";
                            ctx.beginPath();
                            ctx.moveTo(eyeX + lashSign * 1.6, -2.8);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.6, -3.6, eyeX + lashSign * 3.2, -4.2);
                            ctx.stroke();
                        }
                    } else {
                        // Normal açık göz
                        ctx.save();
                        ctx.translate(eyeX, -2.3);
                        ctx.scale(1.0, eyeScaleY);
                        ctx.translate(-eyeX, 2.3);

                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.roundRect(eyeX - 1.8, -4.2, 3.6, 3.8, 1.2);
                        ctx.fill();

                        ctx.fillStyle = "#0f172a";
                        ctx.beginPath();
                        ctx.roundRect(eyeX - 1.2 + lookShiftX, -3.8 + lookShiftY, 2.4, 3.0, 1.0);
                        ctx.fill();

                        // Beyaz Işıltı Noktası ✨
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(eyeX - 0.2 + lookShiftX, -3.0 + lookShiftY, 0.75, 0, Math.PI * 2);
                        ctx.fill();

                        // Kadın için kıvrık yukarı doğru çift kirpik
                        if (isFemale) {
                            const lashSign = eyeX > 0 ? 1 : -1;
                            ctx.strokeStyle = "#0f172a";
                            ctx.lineWidth = 0.85;
                            ctx.lineCap = "round";
                            ctx.beginPath();
                            ctx.moveTo(eyeX + lashSign * 1.6, -3.8);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.8, -4.8, eyeX + lashSign * 3.4, -5.2);
                            ctx.moveTo(eyeX + lashSign * 1.2, -4.0);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.0, -5.2, eyeX + lashSign * 2.4, -5.8);
                            ctx.stroke();
                        }

                        ctx.restore();
                    }
                });

                // Kadın Yanak Allığı & Işıltı Noktaları (Cheek Blush & Sparkles)
                if (isFemale) {
                    [-4.6, 4.6].forEach(bx => {
                        ctx.fillStyle = "rgba(244, 114, 182, 0.28)";
                        ctx.beginPath();
                        ctx.ellipse(bx, 0.6, 2.2, 1.2, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                        ctx.beginPath();
                        ctx.arc(bx + (bx > 0 ? 0.4 : -0.4), 0.2, 0.45, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }

                // Minik 3D Chibi Burun Ucu & Hacim Gölgesi (Soft Chibi Nose Shadow)
                ctx.fillStyle = "rgba(180, 83, 9, 0.24)";
                ctx.beginPath();
                ctx.ellipse(lookShiftX * 0.35, -0.4 + lookShiftY * 0.2, 1.0, 0.7, 0, 0, Math.PI * 2);
                ctx.fill();

                // Minik burun ucu ışık pırıltısı
                ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
                ctx.beginPath();
                ctx.arc(lookShiftX * 0.35 - 0.2, -0.6 + lookShiftY * 0.2, 0.4, 0, Math.PI * 2);
                ctx.fill();

                // Ağız / Konuşma / Sigara Durumları
                const isHoldingOrInhalingFront = (smokeState && (smokeState.isInhaling || smokeState.liftProgress > 0.35));
                const isExhalingFront = (smokeState && smokeState.isExhaling && smokeState.exhaleProgress < 0.95);

                if (isExhalingFront) {
                    // DUMAN ÜFLERKEN: Karizmatik, zarif ve hafif büzülmüş "O" üfleme ağzı
                    const p = smokeState.exhaleProgress;
                    const pulse = Math.sin(p * Math.PI);
                    const openW = 1.1 + pulse * 0.35;
                    const openH = 0.9 + pulse * 0.35;

                    // 1. Dış dudak konturu
                    ctx.fillStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.beginPath();
                    ctx.ellipse(0, 2.3, openW + 0.35, openH + 0.35, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // 2. İç koyu ağız boşluğu
                    ctx.fillStyle = "#2d060e";
                    ctx.beginPath();
                    ctx.ellipse(0, 2.3, openW, openH, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // 3. Alt dudak ince ışık pırıltısı
                    ctx.fillStyle = "rgba(244, 114, 182, 0.35)";
                    ctx.beginPath();
                    ctx.ellipse(0, 2.3 + openH + 0.25, openW * 0.6, 0.45, 0, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isHoldingOrInhalingFront) {
                    // SİGARA İÇERKEN: Dudaklar sigara filtresini sarar (sıkı, nötr, karizmatik dudak)
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(-1.8, 2.2);
                    ctx.lineTo(1.8, 2.2);
                    ctx.stroke();

                    // Filtre tutuş koyuluğu (ortada)
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    ctx.arc(0, 2.2, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                    // Alt dudak gölgesi
                    ctx.fillStyle = "rgba(180, 83, 9, 0.22)";
                    ctx.beginPath();
                    ctx.ellipse(0, 3.1, 1.4, 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isTalking && talkMouthOpen > 0.18) {
                    const openW = 1.8 + talkMouthOpen * 1.3;
                    const openH = 1.0 + talkMouthOpen * 1.5;
                    ctx.fillStyle = "#881337";
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(0, 2.2, openW, openH, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Minik üst diş çizgisi
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(-openW * 0.65, 2.2 - openH * 0.85, openW * 1.3, Math.min(1.0, openH * 0.6), 0.3);
                    ctx.fill();
                } else {
                    if (isFemale) {
                        // Zarif kadınsı tebessüm ve cupid's bow dudak hattı
                        ctx.strokeStyle = "#e11d48";
                        ctx.lineWidth = 0.9;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(-1.6, 1.8);
                            ctx.lineTo(1.6, 1.8);
                        } else {
                            ctx.moveTo(-1.8, 2.0);
                            ctx.quadraticCurveTo(-0.9, 1.65, 0, 1.95);
                            ctx.quadraticCurveTo(0.9, 1.65, 1.8, 2.0);
                        }
                        ctx.stroke();

                        // Alt dudak yumuşak dolgunluk tonu (soft pink wash)
                        ctx.fillStyle = "rgba(244, 114, 182, 0.42)";
                        ctx.beginPath();
                        ctx.ellipse(0, 2.7, 1.4, 0.75, 0, 0, Math.PI * 2);
                        ctx.fill();

                        // Parlak lip gloss ışıltısı ✨
                        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                        ctx.beginPath();
                        ctx.ellipse(0.3, 2.6, 0.55, 0.25, -0.1, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Erkek dinlenme / tebessüm
                        ctx.strokeStyle = "#854d0e";
                        ctx.lineWidth = 1.0;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(-1.6, 1.8);
                            ctx.lineTo(1.6, 1.8);
                        } else {
                            ctx.arc(0, 1.2, 2.3, 0.25, Math.PI - 0.25);
                        }
                        ctx.stroke();
                    }
                }

            } else {
                // --- ÇAPRAZ İZOMETRİK (down-right / down-left) ---
                const nearEyeX = -dirSign * 1.8;
                const farEyeX = dirSign * 4.4;

                // Yakın Kaş & Göz
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                if (isFemale) {
                    ctx.roundRect(nearEyeX - 1.6, -6.8 + browOffsetY, 3.2, 0.75, 0.4);
                } else {
                    ctx.roundRect(nearEyeX - 1.8, -7.0 + browOffsetY, 3.6, 1.1, 0.5);
                }
                ctx.fill();

                if (isAfk) {
                    // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡) - Yakın Göz
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.arc(nearEyeX, -2.8, 1.9, 0.18 * Math.PI, 0.82 * Math.PI);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(nearEyeX - dirSign * 1.5, -2.5);
                        ctx.quadraticCurveTo(nearEyeX - dirSign * 2.5, -3.2, nearEyeX - dirSign * 3.0, -3.8);
                        ctx.stroke();
                    }

                } else if (isBlinkClosed) {
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(nearEyeX, -3.2, 1.8, Math.PI * 1.15, Math.PI * 1.85);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(nearEyeX - dirSign * 1.5, -2.8);
                        ctx.quadraticCurveTo(nearEyeX - dirSign * 2.5, -3.6, nearEyeX - dirSign * 3.0, -4.2);
                        ctx.stroke();
                    }
                } else {
                    ctx.save();
                    ctx.translate(nearEyeX, -2.3);
                    ctx.scale(1.0, eyeScaleY);
                    ctx.translate(-nearEyeX, 2.3);

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(nearEyeX - 1.8, -4.2, 3.6, 3.8, 1.2);
                    ctx.fill();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(nearEyeX - 1.2 + (lookShiftX * 0.8), -3.8 + lookShiftY, 2.4, 3.0, 1.0);
                    ctx.fill();

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(nearEyeX - 0.2 + (lookShiftX * 0.8), -3.0 + lookShiftY, 0.75, 0, Math.PI * 2);
                    ctx.fill();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(nearEyeX - dirSign * 1.6, -3.8);
                        ctx.quadraticCurveTo(nearEyeX - dirSign * 2.6, -4.8, nearEyeX - dirSign * 3.2, -5.2);
                        ctx.stroke();
                    }

                    ctx.restore();
                }

                // Uzak Kaş & Göz
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                if (isFemale) {
                    ctx.roundRect(farEyeX - 1.0, -6.6 + browOffsetY, 2.4, 0.70, 0.4);
                } else {
                    ctx.roundRect(farEyeX - 1.2, -6.8 + browOffsetY, 2.8, 1.0, 0.5);
                }
                ctx.fill();

                if (isAfk) {
                    // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡) - Uzak Göz
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.3;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.arc(farEyeX, -2.7, 1.5, 0.18 * Math.PI, 0.82 * Math.PI);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.8;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(farEyeX + dirSign * 1.2, -2.4);
                        ctx.quadraticCurveTo(farEyeX + dirSign * 2.0, -3.0, farEyeX + dirSign * 2.4, -3.5);
                        ctx.stroke();
                    }

                } else if (isBlinkClosed) {
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(farEyeX, -3.0, 1.5, Math.PI * 1.15, Math.PI * 1.85);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.8;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(farEyeX + dirSign * 1.2, -2.7);
                        ctx.quadraticCurveTo(farEyeX + dirSign * 2.0, -3.4, farEyeX + dirSign * 2.4, -3.9);
                        ctx.stroke();
                    }
                } else {
                    ctx.save();
                    ctx.translate(farEyeX, -2.2);
                    ctx.scale(1.0, eyeScaleY);
                    ctx.translate(-farEyeX, 2.2);

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(farEyeX - 1.2, -4.0, 2.6, 3.6, 1.0);
                    ctx.fill();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(farEyeX - 0.8 + (lookShiftX * 0.6), -3.6 + lookShiftY, 1.8, 2.8, 0.8);
                    ctx.fill();

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(farEyeX + (lookShiftX * 0.6), -2.8 + lookShiftY, 0.6, 0, Math.PI * 2);
                    ctx.fill();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.8;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(farEyeX + dirSign * 1.2, -3.6);
                        ctx.quadraticCurveTo(farEyeX + dirSign * 2.0, -4.4, farEyeX + dirSign * 2.4, -4.8);
                        ctx.stroke();
                    }

                    ctx.restore();
                }

                // Kadın Yanak Allığı (Çapraz Bakış)
                if (isFemale) {
                    ctx.fillStyle = "rgba(244, 114, 182, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(nearEyeX, 0.6, 2.2, 1.2, 0, 0, Math.PI * 2);
                    ctx.ellipse(farEyeX, 0.8, 1.8, 1.0, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                    ctx.beginPath();
                    ctx.arc(nearEyeX + 0.4, 0.2, 0.45, 0, Math.PI * 2);
                    ctx.arc(farEyeX + 0.3, 0.4, 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 3/4 Minik Chibi Burun Ucu & Köprüsü
                const noseX = dirSign * 1.6 + lookShiftX * 0.35;
                const noseY = -0.4 + lookShiftY * 0.2;
                ctx.fillStyle = "rgba(180, 83, 9, 0.26)";
                ctx.beginPath();
                ctx.ellipse(noseX, noseY, 1.1, 0.75, dirSign * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // Burun köprü ışığı
                ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
                ctx.beginPath();
                ctx.arc(noseX - dirSign * 0.2, noseY - 0.2, 0.45, 0, Math.PI * 2);
                ctx.fill();

                // Ağız / Konuşma / Sigara Durumları
                const mouthCenterX = dirSign * 1.8;
                const isHoldingOrInhalingDiag = (smokeState && (smokeState.isInhaling || smokeState.liftProgress > 0.35));
                const isExhalingDiag = (smokeState && smokeState.isExhaling && smokeState.exhaleProgress < 0.95);

                if (isExhalingDiag) {
                    // DUMAN ÜFLERKEN: Karizmatik, zarif ve hafif büzülmüş "O" üfleme ağzı
                    const p = smokeState.exhaleProgress;
                    const pulse = Math.sin(p * Math.PI);
                    const openW = 1.05 + pulse * 0.35;
                    const openH = 0.85 + pulse * 0.35;

                    ctx.fillStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.beginPath();
                    ctx.ellipse(mouthCenterX, 2.5, openW + 0.35, openH + 0.35, (dirSign > 0 ? 0.08 : -0.08), 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#2d060e";
                    ctx.beginPath();
                    ctx.ellipse(mouthCenterX, 2.5, openW, openH, (dirSign > 0 ? 0.08 : -0.08), 0, Math.PI * 2);
                    ctx.fill();

                } else if (isHoldingOrInhalingDiag) {
                    // SİGARA İÇERKEN: Dudaklar sigara filtresini sarar (sıkı, nötr, karizmatik dudak)
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(mouthCenterX - 1.6, 2.4);
                    ctx.lineTo(mouthCenterX + 1.6, 2.4);
                    ctx.stroke();

                    // Filtre tutuş noktası
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    ctx.arc(mouthCenterX, 2.4, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isTalking && talkMouthOpen > 0.18) {
                    const openW = 1.7 + talkMouthOpen * 1.1;
                    const openH = 0.9 + talkMouthOpen * 1.4;
                    ctx.fillStyle = "#881337";
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(mouthCenterX, 2.5, openW, openH, (dirSign > 0 ? 0.08 : -0.08), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Minik üst diş çizgisi
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(mouthCenterX - openW * 0.6, 2.5 - openH * 0.85, openW * 1.2, Math.min(0.9, openH * 0.6), 0.3);
                    ctx.fill();
                } else {
                    if (isFemale) {
                        // Zarif kadınsı çapraz tebessüm
                        ctx.strokeStyle = "#e11d48";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 0.8, 2.1);
                            ctx.lineTo(dirSign * 2.6, 2.1);
                        } else {
                            ctx.moveTo(dirSign * 0.5, 2.2);
                            ctx.quadraticCurveTo(dirSign * 1.8, 2.6, dirSign * 3.0, 2.0);
                        }
                        ctx.stroke();

                        // Alt dudak dolgunluğu & gloss
                        ctx.fillStyle = "rgba(244, 114, 182, 0.38)";
                        ctx.beginPath();
                        ctx.ellipse(mouthCenterX, 2.8, 1.1, 0.55, dirSign * 0.1, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                        ctx.beginPath();
                        ctx.ellipse(mouthCenterX + 0.2, 2.7, 0.5, 0.25, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Erkek ağız dinlenme / tebessüm
                        ctx.strokeStyle = "#854d0e";
                        ctx.lineWidth = 1.0;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 0.6, 2.0);
                            ctx.lineTo(dirSign * 2.8, 2.0);
                        } else {
                            ctx.moveTo(dirSign * 0.2, 2.4);
                            ctx.quadraticCurveTo(dirSign * 1.8, 3.0, dirSign * 3.4, 1.8);
                        }
                        ctx.stroke();
                    }
                }
            }

            // Aksesuarlar (Gözlük, Bıyık, Sakal - Kadınlarda sakal/bıyık gizlenir)
            if (faceType === 'sunglasses') {
                ctx.fillStyle = "#0f172a";
                if (isProfile) {
                    ctx.beginPath();
                    ctx.roundRect(dirSign * 2.5, -5.5, 7.5, 5.0, 1.5);
                    ctx.fill();
                } else if (facing === 'down') {
                    [-4.4, 4.4].forEach(gx => {
                        ctx.beginPath();
                        ctx.roundRect(gx - 3.2, -5.5, 6.4, 5.2, 1.5);
                        ctx.fill();
                        ctx.fillStyle = "rgba(255,255,255,0.4)";
                        ctx.fillRect(gx - 2.0, -4.5, 1.8, 1.8);
                        ctx.fillStyle = "#0f172a";
                    });
                    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(-1.2, -3.2); ctx.lineTo(1.2, -3.2); ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.roundRect(dirSign * 1.5, -5.5, 7.0, 5.2, 1.5);
                    ctx.roundRect(-dirSign * 3.8, -5.2, 4.8, 4.8, 1.2);
                    ctx.fill();
                }
            } else if (!isFemale && faceType === 'mustache') {
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                ctx.ellipse(isProfile ? dirSign * 5.0 : 0, 1.2, isProfile ? 3.2 : 5.5, 1.5, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (!isFemale && faceType === 'beard') {
                ctx.fillStyle = "rgba(30, 20, 10, 0.45)";
                ctx.beginPath();
                ctx.ellipse(isProfile ? dirSign * 3.5 : 0, 1.8, isProfile ? 6.5 : 8.2, isProfile ? 4.2 : 5.0, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * KARAKTER 2 ANA İZOMETRİK ÇİZİM MOTORU (drawSkeletalAvatar)
         */
        static drawSkeletalAvatar(ctx, pX, pY, p, facing = 'down', isSitting = false, legSwing = 0, playerWalkCycle = 0, isMoving = false, isPreview = false, legFilter = 'all') {
            facing = (typeof normalize8WayFacing === 'function') ? normalize8WayFacing(facing) : (facing || 'down');
            const outfitId = (p && (p.outfit || p.color)) || '';
            const shirtId = (p && (p.shirt || p.color)) || '';
            const pantsId = (p && p.pants) || '';
            const shoesId = (p && p.shoes) || '';

            const isK2CyberDress = (outfitId === 'dress_k2_cyber_street' || shirtId === 'dress_k2_cyber_street');
            const isK2GothDress = (outfitId === 'dress_k2_goth_grunge' || shirtId === 'dress_k2_goth_grunge');
            const isK2CyberCrop = (shirtId === 'top_k2_cyber_crop' || shirtId === 'tshirts_top_k2_cyber_crop');
            const isK2GrungeOversize = (shirtId === 'top_k2_grunge_oversize' || shirtId === 'tshirts_top_k2_grunge_oversize');
            const isK2PastelHoodie = (shirtId === 'top_k2_pastel_hoodie' || shirtId === 'tshirts_top_k2_pastel_hoodie');

            const isK2CargoMini = (pantsId === 'pants_k2_cargo_mini' || pantsId === 'pants_pants_k2_cargo_mini');
            const isK2FlaredJeans = (pantsId === 'pants_k2_flared_jeans' || pantsId === 'pants_pants_k2_flared_jeans');
            const isK2GothFishnet = (pantsId === 'pants_k2_goth_fishnet' || pantsId === 'pants_pants_k2_goth_fishnet');
            const isK2GothBoots = (shoesId === 'shoes_k2_goth_boots' || shoesId === 'shoes_shoes_k2_goth_boots');

            const isDress = isK2CyberDress || isK2GothDress || (typeof outfitId === 'string' && outfitId.startsWith('dress_'));
            const isSkirt = isDress || isK2CargoMini || (typeof outfitId === 'string' && outfitId.startsWith('skirt_'));
            const isFemale = (p && (p.isFemale || p.gender === 'female' || (typeof isFemaleAvatar === 'function' && isFemaleAvatar(p, p.color, p.hat, p.shoes)) || isDress || isK2CargoMini || isK2FlaredJeans || isK2GothFishnet || isK2CyberCrop || isK2GrungeOversize || isK2PastelHoodie || (p.hat && (p.hat.startsWith('hair_k2_') || p.hat.startsWith('hats_hair_k2_')))));
            const skinColor = p.skinColor || "#ffd1a4";

            // Yöne Göre Simetri & Aynalama (Sol yönler kusursuz ayna)
            const isLeft = (facing === 'left' || facing === 'down-left' || facing === 'up-left');
            let effFacing = facing;
            if (facing === 'left') effFacing = 'right';
            else if (facing === 'down-left') effFacing = 'down-right';
            else if (facing === 'up-left') effFacing = 'up-right';

            const isProfile = (effFacing === 'right');
            const isBack = (effFacing === 'up' || effFacing === 'up-right');

            // Renkler
            const isCyberTee = (p.shirt === 'k2_cyber_street' || p.color === 'k2_cyber_street');
            const isGraffitiTee = (p.shirt === 'k2_graffiti_oversize' || p.color === 'k2_graffiti_oversize');
            let teeColor = isGraffitiTee ? '#18181b' : (isCyberTee ? '#0f172a' : ((p.shirt && p.shirt.startsWith('#')) ? p.shirt : (p.color && p.color.startsWith('#') ? p.color : '#1e293b')));
            let teeAccent = isGraffitiTee ? '#ec4899' : (isCyberTee ? '#0ea5e9' : '#38bdf8');
            if (isK2CyberDress) {
                teeColor = '#0ea5e9';
                teeAccent = '#ec4899';
            } else if (isK2GothDress) {
                teeColor = '#581c87';
                teeAccent = '#cbd5e1';
            } else if (isK2CyberCrop) {
                teeColor = '#06b6d4';
                teeAccent = '#f43f5e';
            } else if (isK2GrungeOversize) {
                teeColor = '#4c1d95';
                teeAccent = '#cbd5e1';
            } else if (isK2PastelHoodie) {
                teeColor = '#f472b6';
                teeAccent = '#ffffff';
            }

            const isK2Pants = (pantsId === 'pants_k2_tactical_jogger');
            const isSkaterPants = (pantsId === 'pants_k2_skater_cargo');
            let cargoColor = isSkaterPants ? '#3f3f46' : (isK2Pants ? '#1e293b' : ((p.pants && p.pants.startsWith('#')) ? p.pants : ((p.pants === 'pants_classic_cargo_olive') ? '#4d5d3b' : ((p.pants === 'pants_classic_jeans') ? '#2563eb' : ((p.pants === 'pants_classic_beige') ? '#d4b996' : '#334155')))));
            let pocketColor = isSkaterPants ? '#27272a' : (isK2Pants ? '#0f172a' : '#1e293b');
            let strapColor = isSkaterPants ? '#ec4899' : (isK2Pants ? '#0ea5e9' : '#f59e0b');

            if (isK2FlaredJeans) {
                cargoColor = '#1d4ed8';
                pocketColor = '#1e40af';
                strapColor = '#f59e0b';
            } else if (isK2GothFishnet) {
                cargoColor = '#18181b';
                pocketColor = '#09090b';
                strapColor = '#cbd5e1';
            } else if (isK2CargoMini) {
                cargoColor = '#1e293b';
                pocketColor = '#0f172a';
                strapColor = '#0ea5e9';
            }

            const isK2Shoes = (shoesId === 'shoes_k2_chunky_sneaker');
            const isSkateShoes = (shoesId === 'shoes_k2_skate_pro');
            const sneakerColor = (isSkateShoes || isK2Shoes) ? '#f8fafc' : (isK2GothBoots ? '#09090b' : '#ffffff');

            const isBackFacing = (facing === 'up' || facing === 'up-right' || facing === 'up-left');
            const heldItem = p.heldItem || (p.hasTea ? 'cay' : 'none');
            const hasHeldItem = (heldItem && heldItem !== 'none');
            const isBackAccessory = (heldItem === 'sirtcantasi' || heldItem === 'gitar' || heldItem === 'baglama');
            const isHandHeldItem = hasHeldItem && !isBackAccessory && (heldItem !== 'sigara');
            const drawItemUnder = isBackFacing || (heldItem === 'sirtcantasi');

            // 1. Zıt Fazlı Yürüyüş ve Salınım Dinamikleri
            const now = Date.now();
            const cycle = playerWalkCycle || 0;
            let armSwing = 0;
            let legSwingAngle = 0;
            let legStep = 0;
            let bounceY = 0;
            let upperBodyLean = 0;
            let leanY = 0;
            const isSprinting = !!(p && p.isSprinting);

            // Dinamik Eylemsizlik, Dönüş Yumuşatması ve İniş Yaylanması (8-Way Dynamics Engine)
            const pId = p.id || p.socketId || p.name || 'player';
            const dynamics = isPreview
                ? { motionWeight: (isMoving ? 1.0 : 0.0), turnScaleX: 1.0, turnScaleY: 1.0, turnTilt: 0.0, landingCushionY: 0.0, landingSquashScaleY: 1.0, stateRef: null }
                : this.getPlayerMotionDynamics(pId, isMoving, facing, isLeft, now);
            const motionWeight = dynamics.motionWeight;
            const turnScaleX = dynamics.turnScaleX;
            const turnScaleY = dynamics.turnScaleY || 1.0;
            const turnTilt = dynamics.turnTilt;
            const landingCushionY = dynamics.landingCushionY;
            const landingSquashScaleY = dynamics.landingSquashScaleY;
            const mState = dynamics.stateRef;

            // Adım basma süspansiyonu (Step Touchdown Cushion: her iki adımda ayak yere bastığında minik süspansiyon)
            const walkStepCushion = (!isSitting && isMoving) ? (Math.pow(Math.sin(cycle), 2) * 0.45 * motionWeight) : 0;
            const totalCushionY = landingCushionY + walkStepCushion;

            if (isSitting) {
                armSwing = 0;
                legSwingAngle = 0;
                legStep = 0;
                bounceY = 0;
                upperBodyLean = 0;
                leanY = 0;
            } else if (isPreview) {
                armSwing = isHandHeldItem ? 0 : (Math.sin(now / 400) * 0.16);
                legSwingAngle = Math.sin(now / 400) * 0.08;
                bounceY = Math.abs(Math.sin(now / 400)) * 0.5;
                if (effFacing === 'right' || effFacing === 'down-right') {
                    upperBodyLean = Math.sin(now / 400) * 0.015;
                }
            } else {
                // Yürüyüş bileşenleri (Zıt fazlı sarkaç salınımı & Koşma Dinamikleri)
                const isSprinting = !!p.isSprinting;
                const walkArmSwing = isHandHeldItem ? 0 : (Math.sin(cycle) * (isSprinting ? 0.58 : 0.44));
                const walkLegSwing = Math.sin(cycle) * (isSprinting ? 0.48 : 0.38);
                const walkLegStep = Math.sin(cycle) * (isSprinting ? 3.6 : 2.8);
                const walkBounceY = Math.abs(Math.sin(cycle * 2)) * (isSprinting ? 1.75 : 1.3);

                let targetWalkLean = 0;
                let targetLeanY = 0;
                if (effFacing === 'right') {
                    // Koşarken ~4.0° - 4.6° öne aerodinamik eğim, yürürken ~2.2° - 2.6°
                    targetWalkLean = (isSprinting ? 0.070 : 0.038) + Math.sin(cycle * 2) * (isSprinting ? 0.012 : 0.008);
                } else if (effFacing === 'down-right') {
                    targetWalkLean = (isSprinting ? 0.046 : 0.026) + Math.sin(cycle * 2) * (isSprinting ? 0.008 : 0.005);
                    targetLeanY = isSprinting ? 0.55 : 0.3;
                } else if (effFacing === 'up-right') {
                    targetWalkLean = (isSprinting ? 0.038 : 0.022) + Math.sin(cycle * 2) * (isSprinting ? 0.007 : 0.005);
                    targetLeanY = isSprinting ? -0.55 : -0.3;
                } else if (effFacing === 'down') {
                    targetLeanY = isSprinting ? 0.95 : 0.55; // Kameraya doğru dinamik hücum
                } else if (effFacing === 'up') {
                    targetLeanY = isSprinting ? -0.80 : -0.45; // İleri doğru hücum
                }

                // 8 Yönlü Açı & Eğim Slerp Yumuşatması (Smooth Directional Lean Transition)
                let activeWalkLean = targetWalkLean;
                let activeLeanY = targetLeanY;
                if (mState) {
                    const dt = Math.min(100, Math.max(1, now - (mState.lastTime || now)));
                    if (mState.smoothWalkLean === undefined) mState.smoothWalkLean = targetWalkLean;
                    if (mState.smoothLeanY === undefined) mState.smoothLeanY = targetLeanY;

                    const leanBlend = Math.min(1.0, dt / 85); // 85ms ipeksi açı geçişi
                    mState.smoothWalkLean += (targetWalkLean - mState.smoothWalkLean) * leanBlend;
                    mState.smoothLeanY += (targetLeanY - mState.smoothLeanY) * leanBlend;

                    activeWalkLean = mState.smoothWalkLean;
                    activeLeanY = mState.smoothLeanY;
                }

                // Duruş / Bekleme bileşenleri (Doğal nefes mikro-salınımı)
                const idleArmSwing = isHandHeldItem ? 0 : (Math.sin(now / 650) * 0.04);
                const idleBounceY = Math.sin(now / 650) * 0.4;
                const idleLean = Math.sin(now / 650) * 0.004;

                // İpeksi Geçiş (Inertia Blend: 0.0 duruş <-> 1.0 tam hareket) + İniş/Adım Yaylanması
                armSwing = walkArmSwing * motionWeight + idleArmSwing * (1.0 - motionWeight);
                legSwingAngle = walkLegSwing * motionWeight;
                legStep = walkLegStep * motionWeight;
                bounceY = walkBounceY * motionWeight + idleBounceY * (1.0 - motionWeight) + totalCushionY;
                upperBodyLean = activeWalkLean * motionWeight + idleLean * (1.0 - motionWeight);
                leanY = activeLeanY * motionWeight;
            }

            // 4. ADIM: Zeminle Etkileşim & Adım Tozu (Footstep Surface Interaction)
            if (!isPreview && !isSitting && isMoving) {
                const stepCycle = Math.floor(cycle / Math.PI);
                if (mState && mState.lastStepCycle !== undefined && mState.lastStepCycle !== stepCycle) {
                    const isLeftFoot = (stepCycle % 2 === 0);
                    const groundX = (p && p.x !== undefined) ? p.x : pX;
                    const groundY = (p && p.y !== undefined) ? p.y : pY;
                    Karakter2Renderer.spawnFootstepParticle(groundX, groundY, facing, isLeftFoot, !!p.isSprinting);
                }
                if (mState) mState.lastStepCycle = stepCycle;
            }

            // 2. ADIM: "Farkındalık" ve Bekleme Mikro-Hareketleri (Idle Look-Around & Breathing)
            const charSeed = (p.id ? String(p.id).charCodeAt(0) : 0) + (p.name ? p.name.length * 89 : 137);
            const lookSeed = charSeed * 197;
            const lookInterval = 12000 + (lookSeed % 4000); // 12-16 sn bekleme ritmi
            const lookTime = (now + lookSeed) % lookInterval;
            let lookShiftX = 0;
            let lookShiftY = 0;
            let breathChestScaleX = 1.0;
            const isAfk = (p.action === 'afk');
            let sleepHeadNod = 0;

            if (isAfk) {
                // AFK Uyuklama Modülasyonu: Yavaş ve derin nefes alma + hafif öne düşen baş
                breathChestScaleX = 1.0 + (Math.sin(now / 950) * 0.024);
                sleepHeadNod = (Math.sin(now / 1100) * 0.5 + 0.5) * 1.8; // 0px - 1.8px yavaşça baş sallanması
            } else if (!isMoving && !isSitting) {
                // Nefes alıp verirken göğüs mikro-esnemesi (~2.6 saniyelik doğal döngü)
                const breathPhase = Math.sin(now / 420);
                breathChestScaleX = 1.0 + (breathPhase * 0.018); // %1.8 göğüs genişlemesi (0.35px)

                // Etrafa bakınma penceresi (1.6 saniye sürer)
                if (lookTime > lookInterval - 1600) {
                    const dt = lookTime - (lookInterval - 1600);
                    const lookCycleIdx = Math.floor((now + lookSeed) / lookInterval);
                    const lookDir = (lookCycleIdx % 2 === 0) ? 1 : -1;

                    let gazeT = 0;
                    if (dt < 400) {
                        gazeT = Math.sin((dt / 400) * (Math.PI / 2));
                    } else if (dt < 1200) {
                        gazeT = 1.0;
                    } else {
                        gazeT = Math.cos(((dt - 1200) / 400) * (Math.PI / 2));
                    }

                    lookShiftX = lookDir * gazeT * 0.75; // Maksimum 0.75px yana kayma
                    lookShiftY = -gazeT * 0.22; // Hafif meraklı yukarı bakış (-0.22px)
                }
            }

            // Canlı & Organik Göz Kırpma (Blinking) - 20 ile 30 saniye arasında değişken + Çift Kırpma (Double-Blink)
            const baseMin = isPreview ? 8000 : 20000;
            const baseRange = isPreview ? 4000 : 10000;
            const blinkInterval = baseMin + (charSeed % baseRange); // 20.0s - 30.0s arasında karaktere özel doğal ritim
            const blinkLocalTime = (now + charSeed * 173) % blinkInterval;

            // Her 4 döngüden birinde sevimli Çift Kırpma (Double-Blink: kırp - aç - kırp)
            const isDoubleBlinkCycle = (Math.floor((now + charSeed * 173) / blinkInterval) % 4 === 0);

            let blinkProgress = 0; // 0.0 (tam açık) -> 1.0 (tam kapalı)
            if (isAfk) {
                blinkProgress = 0; // AFK iken mahmur uykulu yarı açık ağır göz kapağı devrede
            } else if (isDoubleBlinkCycle) {
                // Çift kırpma (toplam 320ms)
                if (blinkLocalTime > blinkInterval - 320) {
                    const dt = blinkLocalTime - (blinkInterval - 320);
                    if (dt < 110) {
                        blinkProgress = Math.sin((dt / 110) * Math.PI);
                    } else if (dt < 200) {
                        blinkProgress = 0; // İki kırpma arası minik açılma
                    } else {
                        blinkProgress = Math.sin(((dt - 200) / 120) * Math.PI);
                    }
                }
            } else {
                // Standart yumuşak tek kırpma (130ms)
                if (blinkLocalTime > blinkInterval - 130) {
                    const dt = blinkLocalTime - (blinkInterval - 130);
                    blinkProgress = Math.sin((dt / 130) * Math.PI);
                }
            }

            // 3. ADIM: Canlı Konuşma & Chat Ağız Hareketi (Talking Mouth Animation)
            let isTalking = false;
            if (p.isSpeaking || p.isChatTalking) {
                isTalking = true;
            } else if (p.previewTalking || p.isTalking) {
                isTalking = true;
            } else if (p.lastChatTime && (now - p.lastChatTime < (p.lastChatDuration || 2800))) {
                isTalking = true;
            } else if (typeof activeChatBubbles !== 'undefined') {
                const checkKeys = [
                    p.id,
                    p.socketId,
                    pId,
                    (typeof myId !== 'undefined' && (p === (typeof myAvatar !== 'undefined' ? myAvatar : null) || p.id === myId) ? myId : null)
                ];
                for (const k of checkKeys) {
                    if (k && activeChatBubbles[k] && activeChatBubbles[k].length > 0) {
                        const bubbles = activeChatBubbles[k];
                        const lastBubble = bubbles[bubbles.length - 1];
                        if (lastBubble) {
                            const bubbleCreatedAt = lastBubble.createdAt || lastBubble._seenAt || now;
                            if (!lastBubble._seenAt) lastBubble._seenAt = now;
                            const bubbleAge = now - bubbleCreatedAt;
                            const talkDuration = Math.min(4200, Math.max(1800, (lastBubble.text ? lastBubble.text.length * 75 : 2200)));
                            if (bubbleAge < talkDuration) {
                                isTalking = true;
                                break;
                            }
                        }
                    }
                }
                if (!isTalking && p.name) {
                    for (const bId in activeChatBubbles) {
                        const blist = activeChatBubbles[bId];
                        if (blist && blist.length > 0) {
                            const lb = blist[blist.length - 1];
                            if (lb && lb.name === p.name) {
                                const bCreatedAt = lb.createdAt || lb._seenAt || now;
                                if (now - bCreatedAt < 2800) {
                                    isTalking = true;
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // Sigara Durumu: Karakter 2 Özel Sokak Stili Sigara Motoru (15s Periyot & Sıralı Devir Daim A/B Dumanı)
            const smokeState = (heldItem === 'sigara') ? this.getKarakter2SmokingState(p, isPreview, pX, pY, effFacing, isLeft) : null;

            // 2. Arka Plandaki El Eşyaları (Sırt Çantası, Gitar vb.)
            if (drawItemUnder && heldItem && heldItem !== 'none' && heldItem !== 'sigara') {
                if (typeof drawHeldItem === 'function') {
                    ctx.save();
                    ctx.translate(pX, pY);
                    const K2_SCALE = 1.11;
                    const GROUND_Y = 21.5;
                    ctx.translate(0, GROUND_Y);
                    ctx.scale(K2_SCALE, K2_SCALE);
                    ctx.translate(0, -GROUND_Y);
                    drawHeldItem(ctx, 0, 0, heldItem, isPreview, facing, false, 'classic_2', p);
                    ctx.restore();
                }
            }

            // 4. 8 YÖNLÜ İZOMETRİK AVATAR ÇİZİMİ (Derinlik Katmanlaması)
            ctx.save();
            ctx.translate(pX, pY);

            // Zemin seviyesi (ayak tabanı y=21.5) etrafında %11 karizmatik streetwear boyutlandırması
            // 4. ADIM: Ani Dönüş Yumuşatması (turnScaleX + turnTilt) ve İniş Yaylanması (landingSquashScaleY)
            const K2_SCALE = 1.11;
            const GROUND_Y = 21.5;
            ctx.translate(0, GROUND_Y);
            ctx.scale((isLeft ? -K2_SCALE : K2_SCALE) * turnScaleX, K2_SCALE * landingSquashScaleY * turnScaleY);
            if (turnTilt !== 0) ctx.rotate(turnTilt);
            ctx.translate(0, -GROUND_Y);

            // 4.1 Zemin Gölgesi (İniş yaylanması ile esner)
            this.drawGroundShadow(ctx, isMoving, bounceY, totalCushionY);

            // 4.2 Yöne Göre Omuz ve Bacak Koordinatları Hesabı
            let farArm = null;
            let nearArm = null;
            let farLeg = null;
            let nearLeg = null;

            if (isSitting) {
                // Oturma Pozisyonu
                nearArm = { x: -7.5, y: -4.0, angle: 0.32, handPose: 'default' };
                farArm = { x: 7.5, y: -4.0, angle: -0.32, handPose: 'default' };
            } else if (effFacing === 'down') {
                // Tam Öne (Güney)
                const shoulderDist = isFemale ? 7.6 : 9.5;
                const restArmAngle = isFemale ? 0.08 : 0;
                nearArm = [
                    { x: -shoulderDist, y: -6.0 + bounceY, angle: -armSwing * 0.7 + restArmAngle, isFar: false, handPose: 'default' },
                    { x: shoulderDist, y: -6.0 + bounceY, angle: armSwing * 0.7 - restArmAngle, isFar: false, handPose: 'default' }
                ];
                farLeg = { x: -4.4, y: 7.0 + bounceY - legStep * 0.5, angle: 0 };
                nearLeg = { x: 4.4, y: 7.0 + bounceY + legStep * 0.5, angle: 0 };

            } else if (effFacing === 'down-right') {
                // 3/4 Sağ İleri (Güney-Doğu) - Doğru 3D Perspektif Katmanlaması:
                // Kameraya bakan ön taraf ekranın soludur (Sağ kol ve sağ bacak önde!)
                const nearShoulderX = isFemale ? -6.2 : -7.2;
                const farShoulderX = isFemale ? 5.4 : 6.4;
                nearArm = { x: nearShoulderX, y: -5.0 + bounceY, angle: armSwing * 0.9, isFar: false, handPose: 'default' };
                farArm = { x: farShoulderX, y: -7.0 + bounceY, angle: -armSwing * 0.9, isFar: true, handPose: 'default' };
                nearLeg = { x: -3.8, y: 7.0 + bounceY + legStep * 0.3, angle: -legSwingAngle * 0.75 };
                farLeg = { x: 3.2, y: 7.0 + bounceY - legStep * 0.3, angle: legSwingAngle * 0.75 };

            } else if (effFacing === 'right') {
                // Sağ Profil (Doğu)
                const farShoulderX = isFemale ? -1.8 : -2.2;
                const nearShoulderX = isFemale ? 1.2 : 1.6;
                farArm = { x: farShoulderX, y: -6.2 + bounceY, angle: -armSwing * 1.15, isFar: true, handPose: 'default' };
                nearArm = { x: nearShoulderX, y: -5.8 + bounceY, angle: armSwing * 1.15, isFar: false, handPose: 'default' };
                farLeg = { x: -1.8, y: 7.0 + bounceY, angle: legSwingAngle * 1.05 };
                nearLeg = { x: 1.2, y: 7.0 + bounceY, angle: -legSwingAngle * 1.05 };

            } else if (effFacing === 'up-right') {
                // 3/4 Sağ Geri (Kuzey-Doğu)
                const farShoulderX = isFemale ? -5.8 : -6.8;
                const nearShoulderX = isFemale ? 4.8 : 5.5;
                farArm = { x: farShoulderX, y: -6.5 + bounceY, angle: armSwing * 0.8, isFar: true, handPose: 'default' };
                nearArm = { x: nearShoulderX, y: -6.2 + bounceY, angle: -armSwing * 0.8, isFar: true, handPose: 'default' };
                farLeg = { x: -3.8, y: 7.0 + bounceY + legStep * 0.3, angle: -legSwingAngle * 0.7 };
                nearLeg = { x: 3.2, y: 7.0 + bounceY - legStep * 0.3, angle: legSwingAngle * 0.7 };

            } else {
                // Tam Arka (Kuzey)
                const shoulderDist = isFemale ? 7.6 : 9.5;
                const restArmAngle = isFemale ? 0.08 : 0;
                farArm = { x: shoulderDist, y: -6.0 + bounceY, angle: armSwing * 0.7 - restArmAngle, isFar: true, handPose: 'default' };
                nearArm = { x: -shoulderDist, y: -6.0 + bounceY, angle: -armSwing * 0.7 + restArmAngle, isFar: true, handPose: 'default' };
                farLeg = { x: -4.4, y: 7.0 + bounceY + legStep * 0.5, angle: 0 };
                nearLeg = { x: 4.4, y: 7.0 + bounceY - legStep * 0.5, angle: 0 };
            }

            // Sigara Tutan Kolun Ayrıştırılması (Katman 8'de Kafanın Önünde Çizilir)
            let cigArm = null;
            let lighterArmShoulder = null;
            const isBackView = (effFacing === 'up' || effFacing === 'up-right');
            if (smokeState && heldItem === 'sigara') {
                if (Array.isArray(nearArm)) {
                    cigArm = nearArm[0]; // Tam önde sağ kol (ekran solu x: -9.5)
                    if (smokeState.isLighting) {
                        lighterArmShoulder = { x: nearArm[1].x, y: nearArm[1].y };
                        nearArm = null; // Zippo yakarken sol kol Katman 6'da değil, Zippo kolu olarak Katman 8'de çizilir!
                    } else {
                        nearArm = nearArm[1]; // Sol kol Katman 6'da normal salınır
                    }
                } else if (nearArm) {
                    cigArm = nearArm;
                    if (!isBackView) nearArm = null; // Katman 6'da çizilmez; Katman 8'de kafanın/çenenin önünde çizilecek!
                    if (smokeState.isLighting && farArm) {
                        lighterArmShoulder = { x: farArm.x, y: farArm.y };
                        farArm = null; // Zippo yakarken sol kol Katman 1'de değil, Zippo kolu olarak Katman 8'de çizilir!
                    }
                }

                // 4. ADIM: Boştaki Kolun Sokak Duruşu: Ayaktayken boştaki el kargo pantolon cebine girer! (Yalnızca Zippo yakılmıyorken)
                if (!isMoving && !isSitting && !smokeState.isLighting && !isFemale) {
                    if (effFacing === 'down' && nearArm) {
                        nearArm.angle = -0.28; // Sol kol kargo cebine doğru içe bükük
                        nearArm.handPose = 'pocket';
                    } else if (effFacing === 'down-right' && farArm) {
                        farArm.angle = 0.30;
                        farArm.handPose = 'pocket';
                    } else if (effFacing === 'right' && farArm) {
                        farArm.angle = 0.25;
                        farArm.handPose = 'pocket';
                    }
                }
            }



            const PIVOT_HIP_Y = 5.5 + bounceY;
            const isSleeveless = isDress || isK2CyberCrop;

            // KATMAN 1: Arka Kol (Far Arm - Gövdenin Arkasında Salınır)
            if (farArm) {
                ctx.save();
                if (upperBodyLean !== 0 || leanY !== 0) {
                    ctx.translate(0, PIVOT_HIP_Y + leanY);
                    ctx.rotate(upperBodyLean);
                    ctx.translate(0, -PIVOT_HIP_Y);
                }
                if (Array.isArray(farArm)) {
                    farArm.forEach(a => this.drawStreetwearArm(ctx, a.x, a.y, a.angle, teeColor, teeAccent, skinColor, isCyberTee, true, a.handPose, smokeState, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless));
                } else {
                    this.drawStreetwearArm(ctx, farArm.x, farArm.y, farArm.angle, teeColor, teeAccent, skinColor, isCyberTee, true, farArm.handPose, smokeState, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless);
                }
                ctx.restore();
            }

            // KATMAN 2: Bacaklar & Ayakkabılar
            if (isSitting) {
                this.drawSittingCargoLegs(ctx, effFacing, cargoColor, sneakerColor, isK2Shoes, skinColor, isFemale, isSkaterPants, isSkateShoes);
            } else {
                // Arka Bacak (Far Leg)
                if (farLeg && (legFilter === 'all' || legFilter === 'far')) {
                    this.drawCargoLegAndShoe(ctx, farLeg.x, farLeg.y, cargoColor, pocketColor, strapColor, sneakerColor, isK2Shoes, effFacing, true, farLeg.angle || 0, isSkaterPants, isSkateShoes, isSkirt, skinColor, isK2CyberDress, isK2GothDress, isK2FlaredJeans, isK2GothFishnet, isK2GothBoots);
                }
            }

            // KATMAN 3 & 4: Pelvis ve Oversize Streetwear Tişört / Elbise Eteği ve Torso
            ctx.save();
            if (upperBodyLean !== 0 || leanY !== 0) {
                ctx.translate(0, PIVOT_HIP_Y + leanY);
                ctx.rotate(upperBodyLean);
                ctx.translate(0, -PIVOT_HIP_Y);
            }
            // KATMAN 3: Taktik Kargo Pantolon Bel / Elbise Eteği (Pelvis)
            if (isSkirt) {
                this.drawDressSkirt(ctx, 5.5 + bounceY, effFacing, isK2CyberDress, isK2GothDress, teeColor, isK2CargoMini);
            } else {
                this.drawCargoPelvis(ctx, 5.5 + bounceY, cargoColor, pocketColor, strapColor, effFacing, isFemale, isSkaterPants);
            }

            // KATMAN 4: Oversize Streetwear Tişört / Elbise Üstü (Torso)
            this.drawStreetwearTorso(ctx, -0.5 + bounceY, teeColor, teeAccent, isCyberTee, effFacing, isFemale, breathChestScaleX, isGraffitiTee, isDress, isK2CyberDress, isK2GothDress, isK2CyberCrop, isK2GrungeOversize, isK2PastelHoodie, skinColor);
            ctx.restore();

            // KATMAN 5: Ön Bacak (Near Leg)
            if (!isSitting && nearLeg && (legFilter === 'all' || legFilter === 'near')) {
                this.drawCargoLegAndShoe(ctx, nearLeg.x, nearLeg.y, cargoColor, pocketColor, strapColor, sneakerColor, isK2Shoes, effFacing, false, nearLeg.angle || 0, isSkaterPants, isSkateShoes, isSkirt, skinColor, isK2CyberDress, isK2GothDress, isK2FlaredJeans, isK2GothFishnet, isK2GothBoots);
            }

            // KATMAN 6: Ön Kol (Near Arm - Gövdenin Önünde Salınır)
            if (nearArm) {
                ctx.save();
                if (upperBodyLean !== 0 || leanY !== 0) {
                    ctx.translate(0, PIVOT_HIP_Y + leanY);
                    ctx.rotate(upperBodyLean);
                    ctx.translate(0, -PIVOT_HIP_Y);
                }
                if (Array.isArray(nearArm)) {
                    nearArm.forEach(a => this.drawStreetwearArm(ctx, a.x, a.y, a.angle, teeColor, teeAccent, skinColor, isCyberTee, false, a.handPose, smokeState, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless));
                } else {
                    this.drawStreetwearArm(ctx, nearArm.x, nearArm.y, nearArm.angle, teeColor, teeAccent, skinColor, isCyberTee, false, nearArm.handPose, smokeState, effFacing, isGraffitiTee, isFemale, isDress, isK2CyberDress, isK2GothDress, isSleeveless);
                }
                ctx.restore();
            }

            // KATMAN 7: Kafa, Saç ve Canlı Yüz
            ctx.save();
            const headTurnOffset = (!isMoving ? (lookShiftX * 0.018) : 0);
            const sleepHeadAngle = isAfk ? ((Math.sin(now / 1150) * 0.5 + 0.5) * 0.035) : 0;
            const smokeHeadTilt = smokeState ? ((smokeState.headNodAngle || 0) + (smokeState.headTiltUp || 0)) : 0;
            if (upperBodyLean !== 0 || leanY !== 0 || headTurnOffset !== 0 || sleepHeadAngle !== 0 || smokeHeadTilt !== 0) {
                ctx.translate(0, PIVOT_HIP_Y + leanY);
                ctx.rotate(upperBodyLean + headTurnOffset + sleepHeadAngle + smokeHeadTilt);
                ctx.translate(0, -PIVOT_HIP_Y);
            }
            const headY = -17.0 + bounceY * 0.7 + sleepHeadNod;
            this.drawStreetwearHead(ctx, 0, headY, p, effFacing, isBack, isProfile, skinColor, blinkProgress, lookShiftX, lookShiftY, isTalking, teeColor, teeAccent, isGraffitiTee, isCyberTee, smokeState);
            ctx.restore();

            // KATMAN 8: Sigara Tutan Kol & El (Kafanın, Çenenin ve Boynun Önünde Çizilir - Asla İçine Girmez)
            if (cigArm && smokeState && heldItem === 'sigara' && !isBackView) {
                ctx.save();
                if (upperBodyLean !== 0 || leanY !== 0) {
                    ctx.translate(0, PIVOT_HIP_Y + leanY);
                    ctx.rotate(upperBodyLean);
                    ctx.translate(0, -PIVOT_HIP_Y);
                }
                const mouthLocalX = (effFacing === 'right' ? 5.6 : (effFacing === 'down-right' ? 1.8 : 0));
                const mouthLocalY = -17.0 + bounceY * 0.7 + sleepHeadNod + 2.3;
                Karakter2Renderer.drawStreetwearSmokingArm(
                    ctx, cigArm.x, cigArm.y, mouthLocalX, mouthLocalY,
                    smokeState.liftProgress, teeColor, teeAccent, skinColor,
                    isCyberTee, isGraffitiTee, effFacing, smokeState, isSitting, isMoving,
                    lighterArmShoulder, isSprinting
                );
                ctx.restore();
            }

            ctx.restore();

            // 5. Ön Plandaki El Eşyaları (Gövdenin önünde tutulan bardak, kadeh vb.)
            if (!drawItemUnder && heldItem && heldItem !== 'none' && heldItem !== 'sigara') {
                if (typeof drawHeldItem === 'function') {
                    ctx.save();
                    ctx.translate(pX, pY);
                    const K2_SCALE = 1.11;
                    const GROUND_Y = 21.5;
                    ctx.translate(0, GROUND_Y);
                    ctx.scale(K2_SCALE, K2_SCALE);
                    ctx.translate(0, -GROUND_Y);
                    drawHeldItem(ctx, 0, 0, heldItem, isPreview, facing, false, 'classic_2', p);
                    ctx.restore();
                }
            }

            // 6. Alkış Kıvılcım & Çak Vuruş Efekti ✨
            if (p.action === 'clap') {
                const clapPulse = Math.abs(Math.sin(Date.now() / 95));
                if (clapPulse < 0.28) {
                    ctx.save();
                    ctx.strokeStyle = "rgba(250, 204, 21, 0.85)";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(pX, pY - 2.5, 5.2, 0, Math.PI * 2);
                    ctx.stroke();

                    ctx.fillStyle = "#facc15";
                    ctx.font = "bold 13px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("✨", pX, pY - 9);
                    ctx.restore();
                }
            }

            // 7. Dans Eden Notalar (♪ ♫)
            if (p.action === 'dance') {
                const noteY = pY - 49 - ((Date.now() / 45) % 15);
                const noteXOffset = Math.sin(Date.now() / 190) * 8;
                ctx.save();
                ctx.fillStyle = "#ec4899";
                ctx.font = "bold 13px sans-serif";
                ctx.fillText("♪ ♫", pX + 8 + noteXOffset, noteY);
                ctx.restore();
            }

            // 7.5 AFK Uyku / Uyuklama Süzülen Zzz Efekti 💤
            if (isAfk) {
                Karakter2Renderer.drawAfkSleepBubbles(ctx, pX, pY);
            }

            // 8. Karakter 2 Özel Duman Üfleme (Option A: Duman Halkaları / Option B: Hacimli Bulut)
            if (smokeState && smokeState.isExhaling) {
                Karakter2Renderer.drawK2ExhaleSmoke(ctx, pX, pY, effFacing, isLeft, smokeState, bounceY, isMoving, p, isPreview, isSprinting);
            }
            // Havada süzülen bağımsız dünya duman parçacıklarını güncelle ve çiz
            Karakter2Renderer.updateAndDrawSmokeParticles(ctx, pX, pY, p, effFacing, isPreview);

            // 8.5. Kül Çırpma Zerrecikleri (Ash Particles)
            Karakter2Renderer.updateAndDrawAshParticles(ctx);


        }

        /**
         * 9. ADIM: AFK / Uyuklama Süzülen Zzz Efekti (Pastel Blue Floating Dream Bubbles)
         */
        static drawAfkSleepBubbles(ctx, pX, pY) {
            const now = Date.now();
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const zData = [
                { offset: 0, text: 'z', size: 9, font: 'bold 9px "Outfit", sans-serif' },
                { offset: 750, text: 'z', size: 12, font: 'bold 12px "Outfit", sans-serif' },
                { offset: 1500, text: 'Z', size: 15, font: 'bold 15px "Outfit", sans-serif' }
            ];

            const cycleDuration = 2250;

            for (let i = 0; i < zData.length; i++) {
                const item = zData[i];
                const t = ((now + item.offset) % cycleDuration) / cycleDuration; // 0.0 -> 1.0

                // Yükselme eğrisi (Kafanın üzerinden yukarıya doğru)
                const startY = pY - 40;
                const riseY = startY - (t * 30);

                // Zarif dalgalanma (S kıvrımı ile sağa-sola salınım)
                const driftX = pX + 11 + Math.sin(t * Math.PI * 2.2 + i * 1.5) * 4.5 + (t * 5);

                // Yumuşak beliriş ve siliniş (Fade In & Fade Out)
                const alpha = Math.sin(t * Math.PI) * 0.92;
                if (alpha <= 0.02) continue;

                // Minik pastel arka plan rüya ışıltısı / minik baloncuk
                ctx.fillStyle = `rgba(56, 189, 248, ${alpha * 0.22})`;
                ctx.beginPath();
                ctx.arc(driftX, riseY, item.size * 0.65, 0, Math.PI * 2);
                ctx.fill();

                // Z Harfi Gölgesi / Dış Konturu (Her zeminde net okunsun diye)
                ctx.font = item.font;
                ctx.strokeStyle = `rgba(12, 74, 110, ${alpha * 0.85})`;
                ctx.lineWidth = 2.4;
                ctx.strokeText(item.text, driftX, riseY);

                // Z Harfi Dolgusu (Bebek mavisi / pastel cyan)
                ctx.fillStyle = `rgba(224, 242, 254, ${alpha})`;
                ctx.fillText(item.text, driftX, riseY);
            }

            ctx.restore();
        }

        /**
         * 10. ADIM: Karakter 2 Özel Streetwear Sigara Motoru
         * 15 Saniyede Bir Fırt & A/B Devir Daim Sıralı Duman Üfleme (Halkalar <-> Bulut)
         */
        static getKarakter2SmokingState(p, isPreview = false, pX = 0, pY = 0, effFacing = 'down', isLeft = false) {
            if (!p) return null;
            const heldItem = p.heldItem || (p.hasTea ? 'cay' : 'none');
            if (heldItem !== 'sigara') {
                p._k2SmokeAnimStart = null;
                p._k2NextSmokeTime = null;
                p._k2AshSpawned = false;
                p._k2CigLit = false;
                p._k2UseLighter = false;
                return null;
            }

            const now = Date.now();
            const SMOKE_COOLDOWN = 30000; // Kullanıcı talebi: Tam 30 saniyede bir fırt döngüsü!

            if (!p._k2NextSmokeTime) {
                // Karakter sigarayı eline aldığında hemen test edebilmek için 1.5 saniye sonra ilk fırt başlar
                p._k2NextSmokeTime = now + (isPreview ? 1200 : 1500);
            }

            if (now >= p._k2NextSmokeTime && !p._k2SmokeAnimStart) {
                p._k2SmokeAnimStart = now;
                p._k2SmokePuffIndex = (p._k2SmokePuffIndex || 0) + 1;
                p._k2AshSpawned = false;
            }

            const currentPuffIndex = p._k2SmokePuffIndex || 1;
            // 4. Seçenek Devir Daim: Tek fırtlar -> Option A (Halkalar), Çift fırtlar -> Option B (Hacimli Bulut)
            const puffStyle = (currentPuffIndex % 2 === 1) ? 'rings' : 'cloud';

            if (!p._k2SmokeAnimStart) {
                return {
                    active: false,
                    liftProgress: 0,
                    isInhaling: false,
                    isExhaling: false,
                    exhaleProgress: 0,
                    headNodAngle: 0,
                    headTiltUp: 0,
                    fingerFlick: 0,
                    puffStyle: ((currentPuffIndex + 1) % 2 === 1) ? 'rings' : 'cloud',
                    puffIndex: currentPuffIndex,
                    nextSmokeIn: Math.max(0, p._k2NextSmokeTime - now)
                };
            }

            const elapsed = now - p._k2SmokeAnimStart;
            const isLighting = (p._k2UseLighter || !p._k2CigLit || currentPuffIndex === 1);
            const TOTAL_DURATION = isLighting ? 7800 : 4800; // Zippo ile yakma + yakar yakmaz derin ilk fırt + kül çırpma + duman: 7.8s, sonraki standart fırtlar: 4.8s

            if (elapsed >= TOTAL_DURATION) {
                p._k2SmokeAnimStart = null;
                p._k2NextSmokeTime = now + SMOKE_COOLDOWN;
                p._k2UseLighter = false;
                p._k2CigLit = true;
                p._k2AudioZippoOpen = false;
                p._k2AudioZippoStrike = false;
                p._k2AudioZippoClose = false;
                p._k2AudioInhale = false;
                p._k2AudioExhale = false;
                p._k2SpawnedSmokePuffs = null;
                return {
                    active: false,
                    liftProgress: 0,
                    isInhaling: false,
                    isExhaling: false,
                    isLighting: false,
                    lighterFlame: false,
                    exhaleProgress: 0,
                    headNodAngle: 0,
                    headTiltUp: 0,
                    fingerFlick: 0,
                    puffStyle: ((currentPuffIndex + 1) % 2 === 1) ? 'rings' : 'cloud',
                    puffIndex: currentPuffIndex,
                    nextSmokeIn: SMOKE_COOLDOWN
                };
            }

            let liftProgress = 0;
            let headNodAngle = 0;
            let headTiltUp = 0;
            let fingerFlick = 0;
            let isInhaling = false;
            let isExhaling = false;
            let exhaleProgress = 0;

            if (isLighting) {
                // =========================================================================
                // ZIPPO İLE YAVAŞÇA YAKMA VE YAKTIKTAN HEMEN SONRA İLK FIRTI ALMA (7.8s):
                // 1. FAZ: Sigarayı Ağza Alma (Sağ El) & Zippo'yu Kaldırma (Sol El) (0 -> 1000ms)
                // 2. FAZ: Zippo Çakar, Alev Sigara Ucunu Yavaşça Yakar (1000 -> 2600ms, 1.6s alev süresi)
                // 3. FAZ: DERİN İLK FIRT (2200 -> 3600ms) - Sigara yandığı anda doğrudan içine çeker!
                //         Bu sırada Zippo 2650ms'de kapanır, sol kol kargo cebe iner.
                // 4. FAZ: Kolu İndirme & Parmaktan Kül Çırpma (3600 -> 4800ms)
                // 5. FAZ: Duman Üfleme (4800 -> 7800ms) - Yoğun süt beyazı başlayıp havaya dağılan duman!
                // =========================================================================
                if (elapsed < 1000) {
                    const t = elapsed / 1000;
                    liftProgress = 0.5 - 0.5 * Math.cos(Math.PI * t);
                    headNodAngle = liftProgress * 0.052;
                } else if (elapsed < 3600) {
                    // Yakma ve hemen ardından derin ilk fırt boyunca sigara dudaklardadır
                    liftProgress = 1.0;
                    headNodAngle = 0.052;
                } else if (elapsed < 4800) {
                    // İlk fırttan sonra kolu kalçaya indirme ve kül çırpma
                    const t = (elapsed - 3600) / 1200;
                    liftProgress = 0.5 + 0.5 * Math.cos(Math.PI * t);
                    headNodAngle = liftProgress * 0.052;

                    if (elapsed >= 4100 && elapsed <= 4400) {
                        fingerFlick = Math.sin((elapsed - 4100) / 300 * Math.PI) * 0.14;
                    }

                    if (elapsed >= 4200 && !p._k2AshSpawned) {
                        p._k2AshSpawned = true;
                        const K2_SCALE = 1.11;
                        const GROUND_Y = 21.5;
                        const dir = isLeft ? -1 : 1;
                        const shoulderX = (effFacing === 'right' ? 1.6 : (effFacing === 'down-right' ? -7.2 : -9.5));
                        const tipLocalX = (effFacing === 'right') ? (shoulderX + 2.8 + Math.cos(0.28) * 8.2) : (shoulderX - 2.2 + Math.cos(2.88) * 8.2);
                        const tipLocalY = -6.0 + 10.8 + Math.sin(2.88) * 8.2;
                        const tipWorldX = pX + dir * tipLocalX * K2_SCALE;
                        const tipWorldY = pY + GROUND_Y + (tipLocalY - GROUND_Y) * K2_SCALE;
                        Karakter2Renderer.spawnK2AshParticles(tipWorldX, tipWorldY, isLeft);
                    }
                } else {
                    liftProgress = 0;
                }

                // Yakar yakmaz ilk derin fırt çekimi (2200 -> 3600ms)
                isInhaling = (elapsed >= 2200 && elapsed < 3600);
                isExhaling = (elapsed >= 4800 && elapsed < 7800);
                exhaleProgress = isExhaling ? (elapsed - 4800) / 3000 : 0;

                if (isExhaling) {
                    headTiltUp = Math.sin(exhaleProgress * Math.PI) * -0.055;
                }
            } else {
                // =========================================================================
                // SONRAKİ STANDART FIRTLAR (4.8s Toplam Süre):
                // 1. FAZ: Eli Ağza Götürme (0 -> 1000ms)
                // 2. FAZ: Derin Fırt & Akkor Köz & Süzülen Gözler (1000 -> 2200ms)
                // 3. FAZ: Kolu İndirme & Kül Çırpma (2200 -> 3100ms)
                // 4. FAZ: Duman Üfleme (2400 -> 4800ms)
                // =========================================================================
                if (elapsed < 1000) {
                    const t = elapsed / 1000;
                    liftProgress = 0.5 - 0.5 * Math.cos(Math.PI * t);
                    headNodAngle = liftProgress * 0.052;
                } else if (elapsed < 2200) {
                    liftProgress = 1.0;
                    headNodAngle = 0.052;
                } else if (elapsed < 3100) {
                    const t = (elapsed - 2200) / 900;
                    liftProgress = 0.5 + 0.5 * Math.cos(Math.PI * t);
                    headNodAngle = liftProgress * 0.052;

                    if (elapsed >= 2750 && elapsed <= 2950) {
                        fingerFlick = Math.sin((elapsed - 2750) / 200 * Math.PI) * 0.14;
                    }

                    if (elapsed >= 2850 && !p._k2AshSpawned) {
                        p._k2AshSpawned = true;
                        const K2_SCALE = 1.11;
                        const GROUND_Y = 21.5;
                        const dir = isLeft ? -1 : 1;
                        const shoulderX = (effFacing === 'right' ? 1.6 : (effFacing === 'down-right' ? -7.2 : -9.5));
                        const tipLocalX = (effFacing === 'right') ? (shoulderX + 2.8 + Math.cos(0.28) * 8.2) : (shoulderX - 2.2 + Math.cos(2.88) * 8.2);
                        const tipLocalY = -6.0 + 10.8 + Math.sin(2.88) * 8.2;
                        const tipWorldX = pX + dir * tipLocalX * K2_SCALE;
                        const tipWorldY = pY + GROUND_Y + (tipLocalY - GROUND_Y) * K2_SCALE;
                        Karakter2Renderer.spawnK2AshParticles(tipWorldX, tipWorldY, isLeft);
                    }
                } else {
                    liftProgress = 0;
                }

                isInhaling = (elapsed >= 1000 && elapsed < 2200);
                isExhaling = (elapsed >= 2400 && elapsed < 4800);
                exhaleProgress = isExhaling ? (elapsed - 2400) / 2400 : 0;

                if (isExhaling) {
                    headTiltUp = Math.sin(exhaleProgress * Math.PI) * -0.055;
                }
            }

            // Web Audio SFX Tetikleyicileri (Zippo Açılış, Çakma, Kapanış, Tütün Çatırtısı & Rahat Nefes Üfleme)
            if (isLighting) {
                if (elapsed >= 700 && !p._k2AudioZippoOpen) {
                    p._k2AudioZippoOpen = true;
                    if (typeof playSound === 'function') playSound('zippo_open');
                }
                if (elapsed >= 1000 && !p._k2AudioZippoStrike) {
                    p._k2AudioZippoStrike = true;
                    if (typeof playSound === 'function') playSound('zippo_strike');
                }
                if (elapsed >= 2650 && !p._k2AudioZippoClose) {
                    p._k2AudioZippoClose = true;
                    if (typeof playSound === 'function') playSound('zippo_close');
                }
            }

            if (isInhaling && !p._k2AudioInhale) {
                p._k2AudioInhale = true;
                if (typeof playSound === 'function') playSound('tobacco_inhale');
            }

            if (isExhaling && !p._k2AudioExhale) {
                p._k2AudioExhale = true;
                if (typeof playSound === 'function') playSound('smoke_exhale');
            }

            const isLightingActive = isLighting && (elapsed < 3400);
            const lighterFlame = isLighting && (elapsed >= 1000 && elapsed < 2600);
            if (elapsed >= 2800) {
                p._k2CigLit = true;
                p._k2UseLighter = false;
            }

            return {
                active: true,
                elapsed,
                liftProgress,
                isInhaling,
                isExhaling,
                isLighting: isLightingActive,
                lighterFlame,
                exhaleProgress,
                headNodAngle,
                headTiltUp,
                fingerFlick,
                puffStyle,
                puffIndex: currentPuffIndex,
                nextSmokeIn: Math.max(0, p._k2NextSmokeTime - now)
            };
        }

        /**
         * Kül Çırpma Mikro Kor/Kül Zerrecikleri Spawner'ı
         */
        static spawnK2AshParticles(x, y, isLeft) {
            if (!this.k2AshParticles) this.k2AshParticles = [];
            const dir = isLeft ? -1 : 1;
            for (let i = 0; i < 3; i++) {
                this.k2AshParticles.push({
                    x: x + (Math.random() - 0.5) * 1.5,
                    y: y + (Math.random() - 0.5) * 1.5,
                    vx: dir * (0.2 + Math.random() * 0.35) + (Math.random() - 0.5) * 0.25,
                    vy: 0.35 + Math.random() * 0.45,
                    size: 0.9 + Math.random() * 0.5,
                    life: 1.0,
                    decay: 0.016 + Math.random() * 0.012,
                    isEmber: (i === 0)
                });
            }
        }

        /**
         * Dökülen Kül Zerreciklerini Güncelleme ve Çizme Motoru
         */
        static updateAndDrawAshParticles(ctx) {
            if (!this.k2AshParticles || this.k2AshParticles.length === 0) return;
            for (let i = this.k2AshParticles.length - 1; i >= 0; i--) {
                const pt = this.k2AshParticles[i];
                pt.x += pt.vx;
                pt.y += pt.vy;
                pt.vy += 0.018; // Yerçekimi ivmesi
                pt.life -= pt.decay;

                if (pt.life <= 0) {
                    this.k2AshParticles.splice(i, 1);
                    continue;
                }

                ctx.save();
                const alpha = Math.max(0, pt.life);
                if (pt.isEmber && pt.life > 0.4) {
                    ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.9})`;
                    ctx.shadowColor = "#f97316";
                    ctx.shadowBlur = 3;
                } else {
                    ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.75})`;
                }
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, pt.size * (0.5 + pt.life * 0.5), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        /**
         * Karakter 2 Özel Duman Üfleme Çizici:
         * Dumanlar karakterin ya da itemin bir parçası DEĞİLDİR, havaya (dünya koordinatlarına) salınır!
         * Karakter sağa yürürken bi anda sola dönse bile havaya üflenmiş olan halkalar ve bulutlar
         * ASLA geriye dönmez veya ters yöne zıplamaz. Havada süzülür, yükselir ve yavaş yavaş yayılarak yok olur.
         * 
         * Option A (Tek Numaralı Fırtlar): Zarif Duman Halkaları (Smoke Rings)
         * Option B (Çift Numaralı Fırtlar): Hacimli Sokak Dumanı (Volumetric Cloud)
         */
        static drawK2ExhaleSmoke(ctx, pX, pY, effFacing, isLeft, smokeState, bounceY = 0, isMoving = false, p = null, isPreview = false, isSprinting = false) {
            if (!smokeState || !smokeState.isExhaling || smokeState.exhaleProgress <= 0) return;

            const progress = smokeState.exhaleProgress;
            const style = smokeState.puffStyle || 'rings';

            // Ağız Koordinatı Hesabı
            const K2_SCALE = 1.11;
            const GROUND_Y = 21.5;
            const dir = isLeft ? -1 : 1;

            let localMouthX = 0;
            if (effFacing === 'right') localMouthX = 5.6;
            else if (effFacing === 'down-right') localMouthX = 1.8;
            else if (effFacing === 'up-right') localMouthX = 1.6;

            const headY = -17.0 + (bounceY || 0) * 0.7;
            const localMouthY = headY + 2.4;

            // Dünya pozisyonu hesabı (Oyuncu hareket ettikçe duman geride kalsın)
            const playerWorldX = (p && typeof p.x === 'number') ? p.x : pX;
            const playerWorldY = (p && typeof p.y === 'number') ? p.y : pY;

            const spawnWorldX = playerWorldX + dir * localMouthX * K2_SCALE;
            const spawnWorldY = playerWorldY + GROUND_Y + (localMouthY - GROUND_Y) * K2_SCALE;

            // Yöne Duyarlı Üfleme Vektörleri
            let dirX = 0, dirY = 0;
            if (effFacing === 'right') { dirX = 1.0; dirY = -0.15; }
            else if (effFacing === 'down-right') { dirX = 0.85; dirY = 0.12; }
            else if (effFacing === 'down') { dirX = 0.0; dirY = 0.35; }
            else if (effFacing === 'up-right') { dirX = 0.70; dirY = -0.65; }
            else if (effFacing === 'up') { dirX = 0.0; dirY = -0.75; }

            if (isLeft) dirX = -dirX;

            const mouthScreenX = pX + dir * localMouthX * K2_SCALE;
            const mouthScreenY = pY + GROUND_Y + (localMouthY - GROUND_Y) * K2_SCALE;

            // ==========================================
            // BURUNDAN İNCE MİKRO DUMAN SIZINTISI (DUAL NOSTRIL STREAM)
            // ==========================================
            if (progress < 0.44) {
                const nostrilAlpha = Math.sin((progress / 0.44) * Math.PI) * 0.52;
                const nostrilDist = progress * 14.0;
                const nostrilY = mouthScreenY - 3.4;

                ctx.save();
                ctx.strokeStyle = `rgba(241, 245, 249, ${nostrilAlpha})`;
                ctx.lineWidth = 0.75;
                ctx.lineCap = "round";

                if (effFacing === 'down') {
                    [-1.1, 1.1].forEach(side => {
                        ctx.beginPath();
                        ctx.moveTo(mouthScreenX + side * 0.8, nostrilY);
                        ctx.quadraticCurveTo(
                            mouthScreenX + side * (1.6 + nostrilDist * 0.25), nostrilY + nostrilDist * 0.35,
                            mouthScreenX + side * (2.2 + nostrilDist * 0.5), nostrilY + nostrilDist * 0.75
                        );
                        ctx.stroke();
                    });
                } else if (effFacing === 'down-right') {
                    [0.2, 1.3].forEach(side => {
                        ctx.beginPath();
                        ctx.moveTo(mouthScreenX + dir * side * 0.7, nostrilY);
                        ctx.quadraticCurveTo(
                            mouthScreenX + dir * (side + nostrilDist * 0.35), nostrilY + nostrilDist * 0.35,
                            mouthScreenX + dir * (side * 1.5 + nostrilDist * 0.6), nostrilY + nostrilDist * 0.75
                        );
                        ctx.stroke();
                    });
                } else if (effFacing === 'right') {
                    ctx.beginPath();
                    ctx.moveTo(mouthScreenX - dir * 0.4, nostrilY);
                    ctx.quadraticCurveTo(
                        mouthScreenX + dir * (nostrilDist * 0.4), nostrilY + nostrilDist * 0.35,
                        mouthScreenX + dir * (nostrilDist * 0.75), nostrilY + nostrilDist * 0.7
                    );
                    ctx.stroke();
                }
                ctx.restore();
            }

            // ==========================================
            // BAĞIMSIZ PARÇACIK HAVUZUNA DUMAN SALINIMI
            // ==========================================
            if (!p) return;
            const particleKey = isPreview ? ('_k2Smoke_' + effFacing) : '_k2Smoke';
            if (!p[particleKey]) p[particleKey] = [];
            if (!p._k2SpawnedSmokePuffs) p._k2SpawnedSmokePuffs = {};

            const puffIdx = p._k2SmokePuffIndex || 1;

            if (style === 'rings') {
                // OPTION A: 4 ADET SIRALI BELİRGİN DUMAN HALKASI + AĞIZ ÇIKIŞI SÜZÜLEN BULUTU
                const ringThresholds = [0.05, 0.18, 0.34, 0.52];
                for (let i = 0; i < ringThresholds.length; i++) {
                    const thresh = ringThresholds[i];
                    const tag = `${puffIdx}_ring_${i}`;
                    if (progress >= thresh && !p._k2SpawnedSmokePuffs[tag]) {
                        p._k2SpawnedSmokePuffs[tag] = true;

                        const windBoostX = isMoving ? (effFacing.includes('left') ? -0.20 : 0.20) : 0;
                        const ringRot = (dirX !== 0) ? (dirX > 0 ? 0.28 : -0.28) : 0;

                        // 1. Toroidal Duman Halkası (Yavaşça havada süzülür, genişler ve dağılır)
                        p[particleKey].push({
                            type: 'ring',
                            worldX: spawnWorldX + dirX * 1.5,
                            worldY: spawnWorldY + dirY * 0.8,
                            vx: dirX * (0.45 + i * 0.05) + windBoostX,
                            vy: (dirY * 0.12) - 0.24 - (i * 0.03), // Yumuşak, sakin süzülüş
                            rot: ringRot,
                            baseRadiusX: 3.2,
                            maxRadiusX: 22.0 + i * 2.8, // Yavaşça yayılarak büyür
                            life: 1.0,
                            decay: 0.0028, // ~6.0 saniye boyunca havada asılı kalır ve yavaşça dağılır
                            wobblePhase: i * 2.1,
                            seed: Math.random() * 5
                        });

                        // 2. Ağız çıkışında halkaya eşlik eden narin duman buketi (wisp)
                        p[particleKey].push({
                            type: 'wisp',
                            worldX: spawnWorldX + dirX * 0.8,
                            worldY: spawnWorldY + dirY * 0.4,
                            vx: dirX * (0.28 + i * 0.03) + windBoostX + (Math.random() - 0.5) * 0.10,
                            vy: -0.20 - Math.random() * 0.08,
                            baseRadius: 3.4,
                            maxRadius: 18.0 + i * 2.0,
                            life: 1.0,
                            decay: 0.0030,
                            seed: Math.random() * 10
                        });
                    }
                }
            } else {
                // OPTION B: 8 ADET SIRALI YOĞUN & HACİMLİ SOKAK DUMANI BULUTU
                // İlk başta yoğun süt beyazı, sonrasında havada asılı kalarak yavaş yavaş dağılan sokak bulutu
                const cloudThresholds = [0.03, 0.08, 0.15, 0.23, 0.32, 0.42, 0.53, 0.65];
                for (let i = 0; i < cloudThresholds.length; i++) {
                    const thresh = cloudThresholds[i];
                    const tag = `${puffIdx}_cloud_${i}`;
                    if (progress >= thresh && !p._k2SpawnedSmokePuffs[tag]) {
                        p._k2SpawnedSmokePuffs[tag] = true;

                        const windBoostX = isMoving ? (effFacing.includes('left') ? -0.18 : 0.18) : 0;

                        p[particleKey].push({
                            type: 'cloud',
                            worldX: spawnWorldX + dirX * (1.0 + i * 0.6),
                            worldY: spawnWorldY + dirY * 0.5,
                            vx: dirX * (0.36 + i * 0.04) + windBoostX + (Math.random() - 0.5) * 0.10,
                            vy: -0.24 - Math.random() * 0.10 - (i * 0.02), // Hızlı uçup gitmez, havada yavaşça yükselir
                            baseRadius: 4.8 + i * 0.55, // Ağızdan çıkışta dolgun
                            maxRadius: 28.0 + i * 3.2,  // Yavaş yavaş gökyüzünde genişleyip dağılır
                            life: 1.0,
                            decay: 0.0025, // ~6.8 saniye boyunca havada kalır ve yavaşça silinir
                            seed: Math.random() * 10
                        });
                    }
                }
            }
        }

        /**
         * Havada Süzülen Bağımsız Dünya Duman Parçacıklarını Güncelleme ve Çizme Motoru
         * Karakterin hareketinden veya arkasını dönmesinden etkilenmez, havada doğal şekilde yayılır ve silinir.
         * Çıkış anında son derece yoğun/opak başlar, havada genişledikçe açılarak kaybolur.
         */
        static updateAndDrawSmokeParticles(ctx, pX, pY, p, effFacing, isPreview = false) {
            if (!p) return;
            const particleKey = isPreview ? ('_k2Smoke_' + effFacing) : '_k2Smoke';
            const particles = p[particleKey];
            if (!particles || particles.length === 0) return;

            const playerWorldX = (typeof p.x === 'number') ? p.x : pX;
            const playerWorldY = (typeof p.y === 'number') ? p.y : pY;

            // Havuz taşması emniyeti
            if (particles.length > 75) {
                particles.splice(0, 10);
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const pt = particles[i];

                // Bağımsız hareket & termal yükselme fiziği: Yumuşak sürtünme ve yavaş yükseliş
                pt.worldX += pt.vx;
                pt.worldY += pt.vy;
                pt.vx *= 0.965; // Havadaki sürtünmeyle durulur, hızlı fırlayıp gitmez
                pt.vy = Math.max(-0.55, pt.vy - 0.0022); // Sakin ve zarif termal yükseliş
                pt.life -= pt.decay;

                if (pt.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                const drawX = pt.worldX - playerWorldX + pX;
                const drawY = pt.worldY - playerWorldY + pY;

                const progress = Math.max(0, Math.min(1, 1.0 - pt.life));

                // KULLANICI TALEBİ: "üfledikten sonra yavaş yavaş dağılsın o biraz"
                // 1. Çıkış anında (progress 0 -> 0.15): Anında yoğun süt beyazı
                // 2. Dağılma safhasında (progress 0.15 -> 1.0): Genişledikçe ve yükseldikçe tül gibi yavaş yavaş dağılır
                let alpha;
                if (progress < 0.15) {
                    alpha = 0.88 + (progress / 0.15) * 0.10;
                } else {
                    const t = (progress - 0.15) / 0.85;
                    alpha = 0.98 * Math.pow(1.0 - t, 1.15); // Yavaş yavaş, tül gibi açılarak dağılır
                }

                ctx.save();

                if (pt.type === 'ring') {
                    // Duman Halkası: Havada süzülür, genişler ve dağılır
                    const radiusX = pt.baseRadiusX + progress * (pt.maxRadiusX - pt.baseRadiusX);
                    const radiusY = radiusX * 0.44;
                    const wobble = Math.sin(progress * 4.2 + pt.wobblePhase) * 1.5;

                    const rx = drawX + wobble * 0.3;
                    const ry = drawY;

                    // 1. Dış buhar aurası
                    ctx.strokeStyle = `rgba(226, 232, 240, ${alpha * 0.45})`;
                    ctx.lineWidth = Math.max(1.0, 3.4 - progress * 1.6);
                    ctx.beginPath();
                    ctx.ellipse(rx, ry, radiusX * 1.10, radiusY * 1.10, pt.rot, 0, Math.PI * 2);
                    ctx.stroke();

                    // 2. Net, parlak toroidal halka gövdesi
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.98})`;
                    ctx.lineWidth = Math.max(0.8, 2.2 - progress * 1.0);
                    ctx.beginPath();
                    ctx.ellipse(rx, ry, radiusX, radiusY, pt.rot, 0, Math.PI * 2);
                    ctx.stroke();

                    // 3. İç vortex minik hava türbülansı (Doğum anında yoğun disk)
                    if (progress < 0.35) {
                        const innerAlpha = (1.0 - progress / 0.35) * alpha * 0.60;
                        ctx.fillStyle = `rgba(241, 245, 249, ${innerAlpha})`;
                        ctx.beginPath();
                        ctx.ellipse(rx, ry, radiusX * 0.55, radiusY * 0.55, pt.rot, 0, Math.PI * 2);
                        ctx.fill();
                    }

                } else if (pt.type === 'cloud') {
                    // Hacimli Duman Bulutu: İlk başta yoğun süt beyazı, yükseldikçe açılarak yok olur
                    const radius = pt.baseRadius + progress * (pt.maxRadius - pt.baseRadius);
                    const waveX = Math.sin(progress * 3.8 + pt.seed) * 3.0;

                    const cx = drawX + waveX;
                    const cy = drawY;

                    // 1. Dış seyreltik duman buharı
                    ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.38})`;
                    ctx.beginPath();
                    ctx.arc(cx, cy, radius * 1.34, 0, Math.PI * 2);
                    ctx.fill();

                    // 2. Ana hacimli sokak dumanı gövdesi (Organik çoklu loblar)
                    ctx.fillStyle = `rgba(248, 250, 252, ${alpha * 0.85})`;
                    ctx.beginPath();
                    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                    ctx.fill();

                    const angle1 = pt.seed;
                    const angle2 = pt.seed + 2.1;
                    const lobeDist = radius * 0.32;
                    ctx.fillStyle = `rgba(241, 245, 249, ${alpha * 0.72})`;
                    ctx.beginPath();
                    ctx.arc(cx + Math.cos(angle1) * lobeDist, cy + Math.sin(angle1) * lobeDist, radius * 0.72, 0, Math.PI * 2);
                    ctx.arc(cx + Math.cos(angle2) * lobeDist, cy + Math.sin(angle2) * lobeDist, radius * 0.68, 0, Math.PI * 2);
                    ctx.fill();

                    // 3. Ağız çıkışında ultra-yoğun opak beyaz çekirdek (İlk %45'lik safha)
                    if (progress < 0.45) {
                        const coreAlpha = (1.0 - progress / 0.45) * alpha;
                        ctx.fillStyle = `rgba(255, 255, 255, ${coreAlpha * 0.95})`;
                        ctx.beginPath();
                        ctx.arc(cx, cy + 0.3, radius * 0.58, 0, Math.PI * 2);
                        ctx.fill();
                    }

                } else if (pt.type === 'wisp') {
                    // Halkalara eşlik eden ağız çıkışı duman buketi
                    const radius = pt.baseRadius + progress * (pt.maxRadius - pt.baseRadius);
                    const cx = drawX + Math.sin(progress * 2.5 + pt.seed) * 1.8;
                    const cy = drawY;

                    ctx.fillStyle = `rgba(241, 245, 249, ${alpha * 0.68})`;
                    ctx.beginPath();
                    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        static draw(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter = 'all') {
            return this.drawSkeletalAvatar(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter);
        }
    }

    global.Karakter2Renderer = Karakter2Renderer;
    global.drawSkeletalAvatar = function (ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter) {
        return Karakter2Renderer.drawSkeletalAvatar(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter);
    };
    global.getSurfaceType = function (x, y) {
        return Karakter2Renderer.getSurfaceType(x, y);
    };

    // Konsoldan veya test butonlarından Karakter 2 anında duman tetikleme
    global.triggerK2SmokeAnimation = function (targetPlayer, withLighter = false) {
        let p = targetPlayer || (typeof myAvatar !== 'undefined' ? myAvatar : null);
        if (!p) return;
        p.heldItem = 'sigara';
        p._k2SmokeAnimStart = Date.now();
        p._k2SmokePuffIndex = (p._k2SmokePuffIndex || 0) + 1;
        p._k2NextSmokeTime = Date.now() + 30000;
        p._k2AshSpawned = false;
        p._k2AudioZippoOpen = false;
        p._k2AudioZippoStrike = false;
        p._k2AudioZippoClose = false;
        p._k2AudioInhale = false;
        p._k2AudioExhale = false;
        p._k2SpawnedSmokePuffs = null;
        if (withLighter || !p._k2CigLit) {
            p._k2UseLighter = true;
            p._k2CigLit = false;
        }
    };

    // Genel triggerSmokeAnimation fonksiyonunu Karakter 2 desteğiyle genişlet
    const prevTriggerSmoke = global.triggerSmokeAnimation;
    global.triggerSmokeAnimation = function (targetPlayer, withLighter = false) {
        let p = targetPlayer || (typeof myAvatar !== 'undefined' ? myAvatar : null);
        if (p && (p.model === 'karakter_2' || (p.model && p.model.includes('karakter_2')))) {
            global.triggerK2SmokeAnimation(p, withLighter);
            return;
        }
        if (typeof prevTriggerSmoke === 'function') {
            prevTriggerSmoke(targetPlayer);
        } else if (p) {
            global.triggerK2SmokeAnimation(p, withLighter);
        }
    };

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
