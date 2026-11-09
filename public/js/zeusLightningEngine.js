// public/js/zeusLightningEngine.js - Zeus'un Yıldırımı Görsel ve Efekt Motoru
// 10 sn Kademe Kademe Gök Kararması + Dönen Fırtına Bulutu + 1 sn İskelet Şoku + 30 sn Kül Yığını + Küllerinden Doğuş

(function() {
    'use strict';

    const ZeusLightningEngine = {
        activeStrikes: [],
        rebirthEffects: [],
        smokeParticles: [],
        flashAlpha: 0,
        initialized: false,

        init: function(socket) {
            if (!socket || this.initialized) return;
            this.initialized = true;

            // 1. Fırtına Başlangıcı (10 saniye boyunca gök kararması ve dönen bulut)
            socket.on('zeusLightningStrikeStart', (data) => {
                console.log('⚡ [ZEUS ENGINE] Fırtına başladı:', data);
                this.activeStrikes = this.activeStrikes.filter(s => s.strikeId !== data.strikeId);
                this.activeStrikes.push({
                    strikeId: data.strikeId,
                    casterId: data.casterId,
                    casterName: data.casterName,
                    targetId: data.targetId,
                    targetName: data.targetName,
                    targetX: data.targetX,
                    targetY: data.targetY,
                    startTime: data.startTime || Date.now(),
                    gatheringMs: data.gatheringMs || 10000,
                    impactTime: null,
                    phase: 'gathering'
                });

                if (typeof myId !== 'undefined' && data.targetId === myId) {
                    this.showTargetWarningBanner(`⚡ GÖKYÜZÜ KARARIYOR! ${data.casterName} senin üstüne Zeus'un Yıldırımı'nı çağırdı!`);
                }
            });

            // 2. Yıldırım Çarpması (10. saniye - 1 saniyelik iskelet şoku)
            socket.on('zeusLightningImpact', (data) => {
                console.log('⚡ [ZEUS ENGINE] Yıldırım çaktı:', data);
                const strike = this.activeStrikes.find(s => s.strikeId === data.strikeId);
                if (strike) {
                    strike.impactTime = data.impactTime || Date.now();
                    strike.phase = 'impact';
                    if (data.interceptorPet) {
                        strike.interceptorPet = data.interceptorPet;
                        strike.targetX = data.interceptorPet.x;
                        strike.targetY = data.interceptorPet.y;
                    }
                }
                this.flashAlpha = 0.95;

                if (data.interceptorPet) {
                    // Fedai paratoner gibi öne atıldı, darbeyi göğüsledi! Patron sağlam!
                    if (window.activeCompanionPets && window.activeCompanionPets[data.interceptorPet.id]) {
                        window.activeCompanionPets[data.interceptorPet.id].isElectrocuted = true;
                    }
                    this.createImpactSparksAt(data.interceptorPet.x, data.interceptorPet.y);
                } else {
                    if (typeof players !== 'undefined' && players[data.targetId]) {
                        players[data.targetId].isElectrocuted = true;
                    }
                    this.createImpactSparks(data.targetId);
                }
            });

            // 3. Kül Olma (11. saniye - Fedai veya Oyuncunun küle dönmesi)
            socket.on('zeusTargetAshed', (data) => {
                console.log('💀 [ZEUS ENGINE] Kül oldu:', data);
                const strike = this.activeStrikes.find(s => s.strikeId === data.strikeId);
                if (strike) {
                    strike.phase = 'ashed';
                    strike.ashedUntil = data.ashedUntil;
                    strike.durationMs = data.durationMs || 30000;
                    if (data.interceptorPet) {
                        strike.interceptorPet = data.interceptorPet;
                        strike.targetX = data.interceptorPet.x;
                        strike.targetY = data.interceptorPet.y;
                    }
                }

                if (data.interceptorPet) {
                    // Fedai kül yığınına dönüştü!
                    if (window.activeCompanionPets && window.activeCompanionPets[data.interceptorPet.id]) {
                        window.activeCompanionPets[data.interceptorPet.id].isElectrocuted = false;
                        window.activeCompanionPets[data.interceptorPet.id].isAshed = true;
                    }
                    this.createAshExplosionAt(data.interceptorPet.x, data.interceptorPet.y);
                } else {
                    if (typeof players !== 'undefined' && players[data.targetId]) {
                        players[data.targetId].isElectrocuted = false;
                        players[data.targetId].isAshed = true;
                        players[data.targetId].ashedUntil = data.ashedUntil;
                    }

                    if (typeof myId !== 'undefined' && data.targetId === myId) {
                        this.showAshedBanner(data.ashedUntil);
                    }

                    this.createAshExplosion(data.targetId);
                }
            });

            // 3.5. Fedai Küllerinin Toz Olup Dağılması
            socket.on('zeusProtectorAshScattered', (data) => {
                console.log('💨 [ZEUS ENGINE] Fedai külleri toza dönüştü:', data);
                if (typeof playSound === 'function') playSound('wind_whoosh');
                this.createAshDustScatterAt(data.x, data.y);
                this.activeStrikes = this.activeStrikes.filter(s => s.strikeId !== data.strikeId);
            });

            // 4. Küllerinden Yeniden Doğuş (41. saniye - Anka Kuşu Dirilişi)
            socket.on('zeusTargetRebirth', (data) => {
                console.log('🔥 [ZEUS ENGINE] Küllerinden yeniden doğdu:', data);
                let tx = 0, ty = 0;
                if (typeof players !== 'undefined' && players[data.targetId]) {
                    players[data.targetId].isElectrocuted = false;
                    players[data.targetId].isAshed = false;
                    players[data.targetId].ashedUntil = 0;
                    tx = players[data.targetId].x;
                    ty = players[data.targetId].y;
                } else {
                    const strike = this.activeStrikes.find(s => s.strikeId === data.strikeId);
                    if (strike) { tx = strike.targetX; ty = strike.targetY; }
                }

                this.rebirthEffects.push({
                    x: tx,
                    y: ty,
                    startTime: Date.now(),
                    duration: 3500
                });

                this.activeStrikes = this.activeStrikes.filter(s => s.strikeId !== data.strikeId);

                if (typeof myId !== 'undefined' && data.targetId === myId) {
                    this.removeAshedBanner();
                    this.showRebirthBanner();
                }
            });
        },

        // --- UI BİLDİRİM VE BANNERLAR ---
        showTargetWarningBanner: function(msg) {
            let el = document.getElementById('zeus-warning-banner');
            if (!el) {
                el = document.createElement('div');
                el.id = 'zeus-warning-banner';
                el.style.position = 'fixed';
                el.style.top = '70px';
                el.style.left = '50%';
                el.style.transform = 'translateX(-50%)';
                el.style.zIndex = '99999';
                el.style.padding = '12px 24px';
                el.style.borderRadius = '12px';
                el.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(88, 28, 135, 0.95))';
                el.style.border = '2px solid #facc15';
                el.style.color = '#fef08a';
                el.style.fontFamily = 'Inter, sans-serif';
                el.style.fontWeight = 'bold';
                el.style.fontSize = '14px';
                el.style.boxShadow = '0 0 25px rgba(234, 179, 8, 0.5), inset 0 0 10px rgba(250, 204, 21, 0.3)';
                el.style.animation = 'zeusPulse 1.2s infinite ease-in-out';
                document.body.appendChild(el);
            }
            el.innerHTML = msg;
            setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 9500);
        },

        showAshedBanner: function(ashedUntil) {
            let el = document.getElementById('zeus-ashed-banner');
            if (!el) {
                el = document.createElement('div');
                el.id = 'zeus-ashed-banner';
                el.style.position = 'fixed';
                el.style.top = '70px';
                el.style.left = '50%';
                el.style.transform = 'translateX(-50%)';
                el.style.zIndex = '99999';
                el.style.padding = '12px 26px';
                el.style.borderRadius = '14px';
                el.style.background = 'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.96))';
                el.style.border = '2px solid #ef4444';
                el.style.color = '#fca5a5';
                el.style.fontFamily = 'Inter, sans-serif';
                el.style.fontWeight = 'bold';
                el.style.fontSize = '14px';
                el.style.boxShadow = '0 0 30px rgba(239, 68, 68, 0.5), inset 0 0 12px rgba(248, 113, 113, 0.3)';
                document.body.appendChild(el);
            }

            const updateTimer = () => {
                const now = Date.now();
                const rem = Math.max(0, Math.ceil((ashedUntil - now) / 1000));
                if (rem <= 0) {
                    this.removeAshedBanner();
                    return;
                }
                if (el) {
                    el.innerHTML = `💀 <b>ZEUS'UN YILDIRIMIYLA KÜL OLDUN!</b><br><span style="color:#ffffff; font-size:12px; font-weight:normal;">Hareket edemez ve konuşamazsın. Küllerinden doğuşa: <span style="color:#facc15; font-weight:bold; font-size:15px;">${rem} sn</span></span>`;
                }
                if (rem > 0) requestAnimationFrame(updateTimer);
            };
            updateTimer();
        },

        removeAshedBanner: function() {
            const el = document.getElementById('zeus-ashed-banner');
            if (el && el.parentNode) el.parentNode.removeChild(el);
        },

        showRebirthBanner: function() {
            let el = document.createElement('div');
            el.style.position = 'fixed';
            el.style.top = '70px';
            el.style.left = '50%';
            el.style.transform = 'translateX(-50%)';
            el.style.zIndex = '99999';
            el.style.padding = '14px 28px';
            el.style.borderRadius = '14px';
            el.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))';
            el.style.border = '2px solid #fef08a';
            el.style.color = '#ffffff';
            el.style.fontFamily = 'Inter, sans-serif';
            el.style.fontWeight = 'bold';
            el.style.fontSize = '15px';
            el.style.boxShadow = '0 0 35px rgba(245, 158, 11, 0.7), inset 0 0 15px rgba(254, 240, 138, 0.5)';
            el.innerHTML = `✨ <b>ANKA KUŞU GİBİ KÜLLERİNDEN DOĞDUN!</b><br><span style="font-size:12px; font-weight:normal;">Kudretin ve yaşam gücün geri yüklendi!</span>`;
            document.body.appendChild(el);
            setTimeout(() => { if (el && el.parentNode) el.parentNode.removeChild(el); }, 4500);
        },

        // --- PARTİKÜL YARATMA ---
        createImpactSparks: function(targetId) {
            let p = (typeof players !== 'undefined') ? players[targetId] : null;
            if (!p) return;
            this.createImpactSparksAt(p.x, p.y);
        },

        createImpactSparksAt: function(x, y) {
            for (let i = 0; i < 40; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.5 + Math.random() * 4.5;
                this.smokeParticles.push({
                    x: x,
                    y: y - 10,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed * 0.6,
                    radius: 2 + Math.random() * 3,
                    alpha: 1,
                    color: Math.random() > 0.4 ? '#38bdf8' : '#ffffff',
                    life: 45
                });
            }
        },

        createAshExplosion: function(targetId) {
            let p = (typeof players !== 'undefined') ? players[targetId] : null;
            if (!p) return;
            this.createAshExplosionAt(p.x, p.y);
        },

        createAshExplosionAt: function(x, y) {
            for (let i = 0; i < 35; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.5 + Math.random() * 2.5;
                this.smokeParticles.push({
                    x: x + (Math.random() - 0.5) * 16,
                    y: y + 10 + (Math.random() - 0.5) * 6,
                    vx: Math.cos(angle) * speed,
                    vy: -0.3 - Math.random() * 1.5,
                    radius: 3 + Math.random() * 4,
                    alpha: 0.8,
                    color: Math.random() > 0.5 ? '#1e293b' : '#475569',
                    life: 60
                });
            }
        },

        createAshDustScatterAt: function(x, y) {
            // Rüzgarla savrulan kül tozları (sol ve sağa, yukarı doğru uçuşan gri-siyah parçacıklar)
            for (let i = 0; i < 60; i++) {
                const windDir = Math.random() > 0.5 ? 1 : -1;
                const speedX = (1.5 + Math.random() * 3.5) * windDir;
                const speedY = -0.8 - Math.random() * 2.2;
                this.smokeParticles.push({
                    x: x + (Math.random() - 0.5) * 20,
                    y: y + 10 + (Math.random() - 0.5) * 10,
                    vx: speedX,
                    vy: speedY,
                    radius: 1.5 + Math.random() * 2.5,
                    alpha: 0.9,
                    color: Math.random() > 0.6 ? '#64748b' : (Math.random() > 0.3 ? '#334155' : '#94a3b8'),
                    life: 50 + Math.random() * 30
                });
            }
        },

        // --- ANA CANVAS ÇİZİMİ: GÖK KARARMASI, DÖNEN BULUT VE YILDIRIM ---
        drawSkyAndStorm: function(ctx, canvasWidth, canvasHeight) {
            const now = Date.now();
            let maxDarkness = 0;

            // Süresi dolmuş grevleri temizle (> 50 sn)
            if (this.activeStrikes.length > 0) {
                this.activeStrikes = this.activeStrikes.filter(s => (now - s.startTime) < 55000);
            }

            // Aktif grevleri incele
            for (let i = 0; i < this.activeStrikes.length; i++) {
                const strike = this.activeStrikes[i];
                const elapsed = now - strike.startTime;

                // Kademe kademe gök kararması (0 - 10 sn)
                if (elapsed < strike.gatheringMs) {
                    const gatherRatio = Math.min(1, elapsed / strike.gatheringMs);
                    const strikeDarkness = gatherRatio * 0.72;
                    if (strikeDarkness > maxDarkness) maxDarkness = strikeDarkness;
                } else if (elapsed < strike.gatheringMs + 2000) {
                    const fadeRatio = 1 - ((elapsed - strike.gatheringMs) / 2000);
                    const strikeDarkness = fadeRatio * 0.72;
                    if (strikeDarkness > maxDarkness) maxDarkness = strikeDarkness;
                }
            }

            // 1. Ekran Katmanları: Şimşek Parlaması ve Gök Kararması (Ekran Koordinatlarında)
            if (this.flashAlpha > 0 || maxDarkness > 0) {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);

                if (this.flashAlpha > 0) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    this.flashAlpha = Math.max(0, this.flashAlpha - 0.05);
                }

                if (maxDarkness > 0) {
                    ctx.fillStyle = `rgba(8, 12, 28, ${maxDarkness})`;
                    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                }
                ctx.restore();
            }

            // 2. Bulut ve Yıldırım Çizimleri (Dünya koordinatlarında)
            for (let i = 0; i < this.activeStrikes.length; i++) {
                const strike = this.activeStrikes[i];
                const elapsed = now - strike.startTime;

                let targetX = strike.targetX;
                let targetY = strike.targetY;
                if (strike.interceptorPet) {
                    if (window.activeCompanionPets && window.activeCompanionPets[strike.interceptorPet.id]) {
                        targetX = window.activeCompanionPets[strike.interceptorPet.id].x;
                        targetY = window.activeCompanionPets[strike.interceptorPet.id].y;
                    } else {
                        targetX = strike.interceptorPet.x;
                        targetY = strike.interceptorPet.y;
                    }
                } else if (typeof players !== 'undefined' && players[strike.targetId]) {
                    targetX = players[strike.targetId].x;
                    targetY = players[strike.targetId].y;
                }

                // A) DÖNEN SİYAH FIRTINA BULUTU (0 - 11 sn)
                if (elapsed < strike.gatheringMs + 1200) {
                    this.drawSpinningCycloneCloud(ctx, targetX, targetY - 145, elapsed, strike.gatheringMs);
                }

                // B) YILDIRIM DARBESİ (10.0 sn - 11.0 sn)
                if (elapsed >= strike.gatheringMs && elapsed <= strike.gatheringMs + 1000) {
                    const strikeDuration = elapsed - strike.gatheringMs;
                    this.drawLightningBolt(ctx, targetX, targetY - 145, targetX, targetY, strikeDuration);
                }
            }

            // 3. Küllerinden Doğuş Efektleri (Rebirth)
            this.drawActiveRebirths(ctx);

            // 4. Partikül Güncelleme ve Çizimi
            this.updateAndDrawParticles(ctx);
        },

        // --- DÖNEN SİYAH SİKLON FIRTINA BULUTU ---
        drawSpinningCycloneCloud: function(ctx, x, y, elapsed, gatheringMs) {
            const growRatio = Math.min(1, elapsed / 2500);
            const radiusX = 64 * growRatio;
            const radiusY = 28 * growRatio;
            const spinAngle = (elapsed * 0.0035);

            ctx.save();
            ctx.translate(x, y);

            // 1. Bulutun Altında Zemin Gölgesi / Fırtına Aurası
            const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, radiusX * 1.4);
            auraGrad.addColorStop(0, 'rgba(15, 23, 42, 0.7)');
            auraGrad.addColorStop(0.6, 'rgba(88, 28, 135, 0.35)');
            auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, radiusX * 1.4, radiusY * 1.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Dönen Sarmal Bulut Parçaları (3 Katmanlı Elips Döngüsü)
            const layers = [
                { count: 6, dist: radiusX * 0.65, rX: 24, rY: 14, col: 'rgba(15, 23, 42, 0.88)', speed: 1.0 },
                { count: 5, dist: radiusX * 0.42, rX: 20, rY: 12, col: 'rgba(30, 41, 59, 0.92)', speed: -1.3 },
                { count: 4, dist: radiusX * 0.20, rX: 16, rY: 10, col: 'rgba(2, 6, 23, 0.98)', speed: 1.8 }
            ];

            layers.forEach(layer => {
                const baseAngle = spinAngle * layer.speed;
                for (let i = 0; i < layer.count; i++) {
                    const a = baseAngle + (i * (Math.PI * 2 / layer.count));
                    const px = Math.cos(a) * layer.dist;
                    const py = Math.sin(a) * (layer.dist * (radiusY / radiusX));

                    ctx.fillStyle = layer.col;
                    ctx.beginPath();
                    ctx.ellipse(px, py, layer.rX, layer.rY, a, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // 3. Fırtına Gözü (Merkez Vortex Girdabı)
            ctx.fillStyle = '#020617';
            ctx.beginPath();
            ctx.ellipse(0, 0, radiusX * 0.25, radiusY * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();

            // 4. Bulutun İçinde Çakan Şimşek Kıvılcımları (Elektrik Dansı)
            const flicker = Math.sin(elapsed * 0.04) > 0.55;
            if (flicker) {
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.8;
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                for (let s = 0; s < 3; s++) {
                    const sa = spinAngle * 2 + (s * 2.1);
                    const sx1 = Math.cos(sa) * (radiusX * 0.3);
                    const sy1 = Math.sin(sa) * (radiusY * 0.3);
                    const sx2 = Math.cos(sa + 0.4) * (radiusX * 0.8);
                    const sy2 = Math.sin(sa + 0.4) * (radiusY * 0.8);
                    const midX = (sx1 + sx2) / 2 + (Math.random() - 0.5) * 8;
                    const midY = (sy1 + sy2) / 2 + (Math.random() - 0.5) * 6;
                    ctx.moveTo(sx1, sy1);
                    ctx.lineTo(midX, midY);
                    ctx.lineTo(sx2, sy2);
                }
                ctx.stroke();
            }

            ctx.restore();
        },

        // --- ZEUS'UN DEV YILDIRIM DARBESİ ---
        drawLightningBolt: function(ctx, x1, y1, x2, y2, strikeElapsed) {
            ctx.save();

            // 1. Zemin Şok Dalgası Genişlemesi (Giderek açılan izometrik halka)
            const shockwaveProgress = Math.min(1, strikeElapsed / 700);
            const shockRadiusX = 15 + shockwaveProgress * 45;
            const shockRadiusY = shockRadiusX * 0.5;
            const shockAlpha = (1 - shockwaveProgress) * 0.9;

            ctx.strokeStyle = `rgba(56, 189, 248, ${shockAlpha})`;
            ctx.lineWidth = 3.5 * (1 - shockwaveProgress);
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.ellipse(x2, y2 + 10, shockRadiusX, shockRadiusY, 0, 0, Math.PI * 2);
            ctx.stroke();

            // 2. Çok Kırılımlı Zikzak Şimşek Gövdesi
            const segments = 12;
            const points = [{ x: x1, y: y1 }];
            const dy = (y2 - y1) / segments;
            const dx = (x2 - x1) / segments;

            for (let i = 1; i < segments; i++) {
                const jitterMag = Math.sin((strikeElapsed * 0.1) + i) * 16 + (Math.random() - 0.5) * 12;
                points.push({
                    x: x1 + (dx * i) + jitterMag,
                    y: y1 + (dy * i)
                });
            }
            points.push({ x: x2, y: y2 });

            // A) Dış Parlama Katmanı (Cyan / Mavi Halka)
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
            ctx.lineWidth = 9;
            ctx.shadowColor = '#0ea5e9';
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.stroke();

            // B) İç Akkor Çekirdek Katmanı (Bembeyaz İlahi Işık)
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.stroke();

            // C) Yan Dallar (Branching lightning)
            ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
            ctx.lineWidth = 1.8;
            for (let b = 2; b < segments - 1; b += 3) {
                const pt = points[b];
                const dir = (b % 2 === 0 ? 1 : -1);
                ctx.beginPath();
                ctx.moveTo(pt.x, pt.y);
                ctx.lineTo(pt.x + dir * 18, pt.y + 12);
                ctx.lineTo(pt.x + dir * 28, pt.y + 24);
                ctx.stroke();
            }

            // D) GÖKTEN YERE SAPLANAN İLAHİ ALTIN ZEUS ŞİMŞEĞİ (Thor: Love & Thunder 3D Thunderbolt)
            if (typeof ZeusThunderboltRenderer !== 'undefined' && typeof ZeusThunderboltRenderer.drawGoldenThunderbolt === 'function') {
                const spearProgress = Math.min(1, strikeElapsed / 180);
                const spearY = y1 + (y2 - y1) * spearProgress;
                const spearScale = 1.65;
                const vibe = (Math.random() - 0.5) * 4;

                ctx.save();
                ZeusThunderboltRenderer.drawGoldenThunderbolt(ctx, x2 + vibe, spearY - 10, spearScale, 0, 'down', {
                    showAura: true,
                    showArcs: true,
                    glowIntensity: 1.6
                });
                ctx.restore();
            }

            ctx.restore();
        },

        // --- 1 SANİYE ELEKTRİK ÇARPAN İSKELET ÇİZİMİ ---
        drawElectrocutedSkeleton: function(ctx, x, y, p) {
            ctx.save();

            // 1. Çarpılma Titremesi (Rapid Jitter / Screen Shake)
            const jitterX = (Math.random() - 0.5) * 5;
            const jitterY = (Math.random() - 0.5) * 3;
            ctx.translate(x + jitterX, y + jitterY);

            // 2. Arka Plan X-Ray Elektrik Parlaması
            const auraRad = 26 + Math.sin(Date.now() / 40) * 4;
            const grad = ctx.createRadialGradient(0, -16, 2, 0, -16, auraRad);
            grad.addColorStop(0, 'rgba(56, 189, 248, 0.65)');
            grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.25)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(0, -16, auraRad, 0, Math.PI * 2);
            ctx.fill();

            // 3. İSKELET ANATOMİSİ ÇİZİMİ (X-Ray Kemik Dokusu)
            ctx.fillStyle = '#ffffff';
            ctx.strokeStyle = '#e0f2fe';
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 1.6;

            // A) KAFATASI
            ctx.beginPath();
            ctx.arc(0, -36, 9.5, 0, Math.PI * 2);
            ctx.fill();
            // Çene kemiği
            ctx.fillRect(-5, -28, 10, 4.5);
            // Göz çukurları ve burun deliği
            ctx.fillStyle = '#0f172a';
            ctx.beginPath();
            ctx.arc(-3.2, -36, 2.2, 0, Math.PI * 2);
            ctx.arc(3.2, -36, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(-1, -33, 2, 2.2);

            // B) OMURGA
            ctx.fillStyle = '#ffffff';
            for (let v = 0; v < 5; v++) {
                ctx.fillRect(-2, -23 + (v * 3.2), 4, 2.2);
            }

            // C) KABURGALAR
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.6;
            for (let r = 0; r < 4; r++) {
                const ry = -22 + (r * 3);
                const rw = 8.5 - (r * 1.2);
                ctx.beginPath();
                ctx.moveTo(-rw, ry);
                ctx.quadraticCurveTo(0, ry - 1.5, rw, ry);
                ctx.stroke();
            }

            // D) LEĞEN KEMİĞİ
            ctx.fillRect(-7, -8, 14, 3.5);

            // E) KOLLAR
            ctx.beginPath();
            ctx.moveTo(-7, -22);
            ctx.lineTo(-14, -14);
            ctx.lineTo(-18, -6);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(7, -22);
            ctx.lineTo(14, -14);
            ctx.lineTo(18, -6);
            ctx.stroke();

            // F) BACAKLAR
            ctx.beginPath();
            ctx.moveTo(-4, -5);
            ctx.lineTo(-6, 7);
            ctx.lineTo(-7, 18);
            ctx.lineTo(-11, 20);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(4, -5);
            ctx.lineTo(6, 7);
            ctx.lineTo(7, 18);
            ctx.lineTo(11, 20);
            ctx.stroke();

            // 4. İskeletin Etrafında Dans Eden Şimşek Kıvılcımları
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.4;
            for (let a = 0; a < 5; a++) {
                const startBoneY = -35 + Math.random() * 50;
                const sign = Math.random() > 0.5 ? 1 : -1;
                ctx.beginPath();
                ctx.moveTo(sign * 4, startBoneY);
                ctx.lineTo(sign * (12 + Math.random() * 10), startBoneY + (Math.random() - 0.5) * 8);
                ctx.lineTo(sign * (18 + Math.random() * 8), startBoneY + (Math.random() - 0.5) * 12);
                ctx.stroke();
            }

            ctx.restore();
        },

        // --- 30 SANİYE KÜL YIĞINI ÇİZİMİ ---
        drawAshPile: function(ctx, x, y, p) {
            const now = Date.now();
            ctx.save();
            ctx.translate(x, y + 10);

            // 1. Zemin Yanık Lekesi
            ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
            ctx.beginPath();
            ctx.ellipse(0, 4, 18, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Kül Tepesi
            const ashGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 15);
            ashGrad.addColorStop(0, '#475569');
            ashGrad.addColorStop(0.5, '#334155');
            ashGrad.addColorStop(0.85, '#1e293b');
            ashGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = ashGrad;
            ctx.beginPath();
            ctx.moveTo(-15, 4);
            ctx.quadraticCurveTo(-10, -5, 0, -7);
            ctx.quadraticCurveTo(10, -5, 15, 4);
            ctx.quadraticCurveTo(0, 9, -15, 4);
            ctx.fill();

            // 3. İçten İçe Yanan Kor ve Közler
            const emberPulse = (Math.sin(now / 180) + 1) * 0.5;
            const emberColor = `rgba(249, 115, 22, ${0.45 + emberPulse * 0.5})`;
            ctx.fillStyle = emberColor;
            ctx.shadowColor = '#f97316';
            ctx.shadowBlur = 8;
            const embers = [
                { ox: -5, oy: -2, r: 2.2 },
                { ox: 3, oy: -3, r: 1.8 },
                { ox: -1, oy: 1, r: 2.5 },
                { ox: 8, oy: 2, r: 1.5 },
                { ox: -8, oy: 2, r: 1.6 }
            ];
            embers.forEach(em => {
                ctx.beginPath();
                ctx.arc(em.ox, em.oy, em.r, 0, Math.PI * 2);
                ctx.fill();
            });

            // 4. Kül Üzerinden Yükselen Duman Dalgası
            const smokeY = (now % 2000) / 2000;
            ctx.fillStyle = `rgba(203, 213, 225, ${0.35 * (1 - smokeY)})`;
            ctx.beginPath();
            ctx.arc(Math.sin(now / 300) * 4, -8 - (smokeY * 22), 3 + (smokeY * 5), 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // 5. Kül Yığını Üstünde Sayaç ve Bilgi Rozeti
            const ashedExp = (p && p.ashedUntil) || 0;
            const remainingSec = Math.max(0, Math.ceil((ashedExp - now) / 1000));
            const tagText = `💀 ${p ? (p.name || p.petName || 'Fedai') : 'Oyuncu'} Kül Oldu (${remainingSec}s)`;

            ctx.save();
            ctx.font = 'bold 10px sans-serif';
            const tagW = ctx.measureText(tagText).width + 16;
            const tagY = y - 24;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.beginPath();
            ctx.roundRect(x - tagW / 2, tagY, tagW, 18, 6);
            ctx.fill();

            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 1.2;
            ctx.stroke();

            ctx.fillStyle = '#fca5a5';
            ctx.textAlign = 'center';
            ctx.fillText(tagText, x, tagY + 13);

            // Mini İlerleme Çubuğu (30 saniye doluşu)
            const progressRatio = Math.max(0, Math.min(1, remainingSec / 30));
            const barW = tagW - 6;
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.fillRect(x - barW / 2, tagY + 15, barW, 2);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x - barW / 2, tagY + 15, barW * (1 - progressRatio), 2);

            ctx.restore();
        },

        // --- KÜLLERİNDEN DOĞUŞ EFEKTLERİ (REBIRTH) ---
        drawActiveRebirths: function(ctx) {
            const now = Date.now();
            this.rebirthEffects = this.rebirthEffects.filter(eff => now - eff.startTime < eff.duration);

            for (let i = 0; i < this.rebirthEffects.length; i++) {
                const eff = this.rebirthEffects[i];
                const progress = (now - eff.startTime) / eff.duration;
                const alpha = Math.sin(progress * Math.PI);

                ctx.save();
                ctx.translate(eff.x, eff.y);

                // 1. Göğe Yükselen Altın Işık Sütunu
                const colGrad = ctx.createLinearGradient(0, 15, 0, -120);
                colGrad.addColorStop(0, `rgba(251, 191, 36, ${alpha * 0.85})`);
                colGrad.addColorStop(0.5, `rgba(254, 240, 138, ${alpha * 0.95})`);
                colGrad.addColorStop(1, `rgba(255, 255, 255, 0)`);
                ctx.fillStyle = colGrad;
                ctx.beginPath();
                ctx.moveTo(-16, 15);
                ctx.lineTo(-6, -120);
                ctx.lineTo(6, -120);
                ctx.lineTo(16, 15);
                ctx.closePath();
                ctx.fill();

                // 2. Yükselen Anka Kıvılcımları
                for (let s = 0; s < 8; s++) {
                    const sparkProgress = ((now + s * 300) % 1500) / 1500;
                    const sx = Math.sin(s * 1.5 + now * 0.005) * 18;
                    const sy = 10 - (sparkProgress * 90);
                    ctx.fillStyle = `rgba(251, 191, 36, ${(1 - sparkProgress) * alpha})`;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        },

        // --- PARTİKÜLLER ---
        updateAndDrawParticles: function(ctx) {
            for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
                const p = this.smokeParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= (1 / p.life);
                if (p.alpha <= 0) {
                    this.smokeParticles.splice(i, 1);
                    continue;
                }
                ctx.save();
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    };

    window.ZeusLightningEngine = ZeusLightningEngine;
    if (typeof window !== 'undefined') {
        if (window.socket) {
            ZeusLightningEngine.init(window.socket);
        } else {
            window.addEventListener('DOMContentLoaded', () => {
                if (window.socket) ZeusLightningEngine.init(window.socket);
            });
        }
    }
})();
