// public/js/renderers/k2/k2Fx.js - Karakter 2 Partikül, Hareket Dinamikleri, Sigara & Duman FX Motoru
(function (global) {
    'use strict';

    class K2Fx {
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
                        K2Fx.spawnK2AshParticles(tipWorldX, tipWorldY, isLeft);
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
                        K2Fx.spawnK2AshParticles(tipWorldX, tipWorldY, isLeft);
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

    
        static spawnGroundCrack(x, y) {
            const crackId = 'crack_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4);
            const branches = [];
            const branchCount = 6;
            for (let i = 0; i < branchCount; i++) {
                const angle = (i * (Math.PI * 2 / branchCount)) + (Math.random() - 0.5) * 0.45;
                const points = [{ x: 0, y: 0 }];
                const segments = 3 + Math.floor(Math.random() * 2);
                let curDist = 0;
                let curAngle = angle;
                for (let s = 0; s < segments; s++) {
                    curDist += 5.5 + Math.random() * 5.0;
                    curAngle += (Math.random() - 0.5) * 0.5;
                    points.push({
                        x: Math.cos(curAngle) * curDist,
                        y: Math.sin(curAngle) * curDist * 0.65
                    });
                }
                branches.push(points);
            }

            this.groundCracks.push({
                id: crackId,
                x: x,
                y: y,
                startTime: Date.now(),
                duration: 5000,
                branches: branches,
                embers: []
            });
            if (typeof window !== 'undefined') {
                window.activeGroundCracks = this.groundCracks;
            }
        }

        static updateAndDrawGroundCracks(ctx) {
            if (!this.groundCracks || this.groundCracks.length === 0) return;
            const now = Date.now();
            ctx.save();

            for (let i = this.groundCracks.length - 1; i >= 0; i--) {
                const crack = this.groundCracks[i];
                const elapsed = now - crack.startTime;
                if (elapsed >= crack.duration) {
                    this.groundCracks.splice(i, 1);
                    continue;
                }

                let alpha = 1.0;
                if (elapsed > 3800) {
                    alpha = (crack.duration - elapsed) / 1200;
                }
                if (elapsed < 200) {
                    alpha = elapsed / 200;
                }

                const pulse = Math.sin((now - crack.startTime) / 120) * 0.15 + 0.85;

                ctx.save();
                ctx.translate(crack.x, crack.y);

                const heatRadius = 26;
                const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, heatRadius);
                grad.addColorStop(0, `rgba(239, 68, 68, ${(0.45 * alpha * pulse).toFixed(3)})`);
                grad.addColorStop(0.5, `rgba(249, 115, 22, ${(0.25 * alpha * pulse).toFixed(3)})`);
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, heatRadius * 1.2, heatRadius * 0.7, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = `rgba(20, 10, 5, ${(0.85 * alpha).toFixed(3)})`;
                ctx.lineWidth = 3.2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                for (const branch of crack.branches) {
                    ctx.beginPath();
                    ctx.moveTo(branch[0].x, branch[0].y);
                    for (let p = 1; p < branch.length; p++) {
                        ctx.lineTo(branch[p].x, branch[p].y);
                    }
                    ctx.stroke();
                }

                ctx.strokeStyle = `rgba(249, 115, 22, ${(0.95 * alpha * pulse).toFixed(3)})`;
                ctx.lineWidth = 1.8;
                for (const branch of crack.branches) {
                    ctx.beginPath();
                    ctx.moveTo(branch[0].x, branch[0].y);
                    for (let p = 1; p < branch.length; p++) {
                        ctx.lineTo(branch[p].x, branch[p].y);
                    }
                    ctx.stroke();
                }

                ctx.strokeStyle = `rgba(254, 240, 138, ${(0.9 * alpha * pulse).toFixed(3)})`;
                ctx.lineWidth = 0.9;
                for (const branch of crack.branches) {
                    ctx.beginPath();
                    ctx.moveTo(branch[0].x, branch[0].y);
                    const midLen = Math.max(1, branch.length - 1);
                    for (let p = 1; p <= midLen; p++) {
                        ctx.lineTo(branch[p].x, branch[p].y);
                    }
                    ctx.stroke();
                }

                if (elapsed < 4200 && Math.random() < 0.28) {
                    crack.embers.push({
                        x: (Math.random() - 0.5) * 22,
                        y: (Math.random() - 0.5) * 8,
                        vx: (Math.random() - 0.5) * 0.4,
                        vy: -0.6 - Math.random() * 0.6,
                        size: 0.8 + Math.random() * 0.8,
                        life: 600 + Math.random() * 500,
                        born: now
                    });
                }

                for (let eIdx = crack.embers.length - 1; eIdx >= 0; eIdx--) {
                    const emb = crack.embers[eIdx];
                    const eAge = now - emb.born;
                    if (eAge >= emb.life) {
                        crack.embers.splice(eIdx, 1);
                        continue;
                    }
                    emb.x += emb.vx;
                    emb.y += emb.vy;
                    const eAlpha = (1.0 - (eAge / emb.life)) * alpha;
                    ctx.fillStyle = `rgba(251, 146, 60, ${eAlpha.toFixed(3)})`;
                    ctx.beginPath();
                    ctx.arc(emb.x, emb.y, emb.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }

            ctx.restore();
        }
    }

    global.K2Fx = K2Fx;
    global.__k2Modules = global.__k2Modules || [];
    global.__k2Modules.push(K2Fx);

    function attach(target) {
        Object.getOwnPropertyNames(K2Fx).forEach(name => {
            if (name !== 'length' && name !== 'name' && name !== 'prototype') {
                target[name] = K2Fx[name];
            }
        });
    }

    if (global.Karakter2Renderer) {
        attach(global.Karakter2Renderer);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = K2Fx;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));


