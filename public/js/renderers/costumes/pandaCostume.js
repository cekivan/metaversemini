// public/js/renderers/costumes/pandaCostume.js - 🐼 Panda Kostümü
(function () {
    // 6. 🐼 PANDA (costume_panda) - 2.5D 8 Yönlü Hacimli Ayı Anatomisi & Bambu Kinematiği
    // =========================================================================
    function drawPanda(ctx, facing, isMoving, walkCycle, isSitting) {
            const poses = {
                'down':        { view: 'front',         mirror: 1 },
                'down-right':  { view: 'quarter-front', mirror: 1 },
                'right':       { view: 'side',          mirror: 1 },
                'up-right':    { view: 'quarter-back',  mirror: 1 },
                'up':          { view: 'back',          mirror: 1 },
                'up-left':     { view: 'quarter-back',  mirror: -1 },
                'left':        { view: 'side',          mirror: -1 },
                'down-left':   { view: 'quarter-front', mirror: -1 }
            };
    
            const pose = poses[facing] || poses.down;
            const view = pose.view;
            const mirror = pose.mirror;
    
            const time = Date.now();
            const cycle = walkCycle || 0;
    
            // Kinematikler: Ağır heybetli ayı adımı (Diagonal gait & waddle)
            const stride = (isMoving && !isSitting) ? Math.sin(cycle) * 6.0 : 0;
            const counterStride = -stride;
    
            const liftNF = (isMoving && !isSitting) ? Math.max(0, -Math.cos(cycle)) * 4.5 : 0;
            const liftFF = (isMoving && !isSitting) ? Math.max(0, Math.cos(cycle)) * 4.5 : 0;
            const liftNH = (isMoving && !isSitting) ? Math.max(0, Math.cos(cycle)) * 4.0 : 0;
            const liftFH = (isMoving && !isSitting) ? Math.max(0, -Math.cos(cycle)) * 4.0 : 0;
    
            // Gövde salınımı ve nefes alma
            const waddleRoll = (isMoving && !isSitting) ? Math.sin(cycle) * 0.055 : 0;
            const headBob = (isMoving && !isSitting) ? Math.abs(Math.sin(cycle)) * 2.4 : (isSitting ? Math.sin(time / 280) * 1.4 : Math.sin(time / 650) * 0.8);
            const breath = (isMoving || isSitting) ? 0 : Math.sin(time / 600) * 1.0;
            const earWiggle = Math.sin(time / 420) * 0.05;
    
            // Çiğneme ve bambu salınımı
            const chewBob = isSitting ? Math.sin(time / 260) * 1.8 : 0;
            const bambooSway = isMoving ? Math.sin(cycle * 0.9) * 0.12 : Math.sin(time / 500) * 0.04;
    
            // Malzeme & Renk Paleti (Sol-Üst 135° Işık Kırılımları)
            const whiteSunlit = "#ffffff";
            const whiteBase = "#f8f6f0";
            const whiteShade = "#ded5c8";
            const whiteDeep = "#c0b19d";
    
            const blackSunlit = "#404048";
            const blackBase = "#1c1c20";
            const blackShade = "#101013";
            const blackDeep = "#08080a";
    
            const padPink = "#3f3335";
            const padBase = "#262022";
            const noseLeather = "#121216";
            const eyeAmber = "#24160e";
            const clawColor = "#3d3d46";
    
            const bambooLight = "#4ade80";
            const bambooBase = "#16a34a";
            const bambooShade = "#14532d";
            const bambooNode = "#86efac";
    
            ctx.save();
            // Heybetli ve okunaklı 2.5D ayı ölçeği
            ctx.scale(mirror * 1.32, 1.32);
    
            // =========================================================================
            // 1. ZEMİN TEMAS GÖLGESİ (2:1 Katmanlı İzometrik Elips)
            // =========================================================================
            const shadowRx = isSitting ? 27 : (view === 'side' ? 29 : (view === 'front' || view === 'back' ? 24 : 26));
            const shadowRy = isSitting ? 11 : 9.0;
            const shadowY = isSitting ? 1.5 : 1.0;
    
            ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
            ctx.beginPath();
            ctx.ellipse(0, shadowY, shadowRx, shadowRy, 0, 0, Math.PI * 2);
            ctx.fill();
    
            ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
            ctx.beginPath();
            ctx.ellipse(0, shadowY, shadowRx * 0.65, shadowRy * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();
    
            // =========================================================================
            // YARDIMCI ÇİZİCİLER: Pençe, Bambu Dalı
            // =========================================================================
            function drawPaw(px, py, isNear, isFrontLeg, liftY) {
                ctx.save();
                ctx.translate(px, py - liftY);
                const w = isFrontLeg ? 5.6 : 6.2;
                const h = 3.5;
    
                // Taban gölgesi
                ctx.fillStyle = isNear ? blackShade : blackDeep;
                ctx.beginPath();
                ctx.ellipse(0, 0, w + 0.8, h + 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
    
                // Pençe ana kubbesi
                const pawGrad = ctx.createLinearGradient(0, -h, 0, h);
                pawGrad.addColorStop(0, isNear ? blackSunlit : blackBase);
                pawGrad.addColorStop(0.5, isNear ? blackBase : blackShade);
                pawGrad.addColorStop(1, blackDeep);
                ctx.fillStyle = pawGrad;
                ctx.beginPath();
                ctx.ellipse(0, -1, w, h, 0, 0, Math.PI * 2);
                ctx.fill();
    
                // 4 Parmak boğumu ve pençeler
                const toeOffsets = isFrontLeg ? [-3.0, -1.0, 1.0, 3.0] : [-3.4, -1.15, 1.15, 3.4];
                toeOffsets.forEach(ox => {
                    ctx.fillStyle = isNear ? blackBase : blackShade;
                    ctx.beginPath();
                    ctx.arc(ox, -0.6, 1.35, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Küçük kavisli pençe ucu
                    ctx.fillStyle = clawColor;
                    ctx.beginPath();
                    ctx.ellipse(ox, 0.9, 0.65, 1.1, 0, 0, Math.PI * 2);
                    ctx.fill();
                });
    
                ctx.restore();
            }
    
            function drawBambooBranch(bx, by, angle, scale) {
                ctx.save();
                ctx.translate(bx, by);
                ctx.rotate(angle + bambooSway);
                ctx.scale(scale, scale);
    
                const segH = 14;
                const segW = 3.2;
    
                // 3 Boğumlu Taze Bambu Gövdesi
                for (let i = 0; i < 3; i++) {
                    const sy = -i * (segH - 1.5);
                    const bGrad = ctx.createLinearGradient(-segW / 2, 0, segW / 2, 0);
                    bGrad.addColorStop(0, bambooLight);
                    bGrad.addColorStop(0.5, bambooBase);
                    bGrad.addColorStop(1, bambooShade);
    
                    ctx.fillStyle = bGrad;
                    ctx.beginPath();
                    ctx.roundRect(-segW / 2, sy - segH, segW, segH, 1.2);
                    ctx.fill();
    
                    // Boğum halkası (Node ring)
                    ctx.fillStyle = bambooNode;
                    ctx.beginPath();
                    ctx.ellipse(0, sy, segW / 2 + 0.7, 1.0, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.strokeStyle = bambooShade;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(-segW / 2 - 0.5, sy);
                    ctx.lineTo(segW / 2 + 0.5, sy);
                    ctx.stroke();
    
                    // Yaprak Çifti (Her boğumdan çıkan mızrak şeklinde taze yapraklar)
                    if (i >= 1) {
                        ctx.save();
                        ctx.translate(segW / 2, sy - segH * 0.4);
                        ctx.rotate(0.42);
                        const leafGrad = ctx.createLinearGradient(0, 0, 11, -5);
                        leafGrad.addColorStop(0, bambooLight);
                        leafGrad.addColorStop(1, bambooBase);
                        ctx.fillStyle = leafGrad;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(6, -6, 12, -4);
                        ctx.quadraticCurveTo(6, 0, 0, 0);
                        ctx.fill();
                        ctx.restore();
    
                        ctx.save();
                        ctx.translate(-segW / 2, sy - segH * 0.7);
                        ctx.rotate(-0.52);
                        ctx.fillStyle = bambooBase;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.quadraticCurveTo(-6, -6, -11, -3);
                        ctx.quadraticCurveTo(-5, 1, 0, 0);
                        ctx.fill();
                        ctx.restore();
                    }
                }
    
                // Tepe Taze Filiz Yaprakları
                ctx.save();
                ctx.translate(0, -3 * (segH - 1.5));
                ctx.fillStyle = bambooLight;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(4, -8, 2, -14);
                ctx.quadraticCurveTo(-2, -8, 0, 0);
                ctx.fill();
                ctx.restore();
    
                ctx.restore();
            }
    
            // =========================================================================
            // DURUM A: 🧘 OTURMA MODU (5 FARKLI İZOMETRİK AÇIDA OTURAN PANDA!)
            // =========================================================================
            if (isSitting) {
                ctx.save();
                ctx.translate(0, -5 + chewBob * 0.2);
    
                // A.1: SITTING - QUARTER-FRONT (Ön-Çeyrek Seated - Asıl 2.5D Duruş)
                if (view === 'quarter-front') {
                    // Uzak Bacak
                    ctx.save();
                    ctx.translate(-9, 1);
                    ctx.rotate(0.2);
                    ctx.fillStyle = blackDeep;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 7.5, 5.0, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
    
                    // Beyaz Karın / Sırt Kütlesi
                    const bGrad = ctx.createRadialGradient(-3, -9, 2, 0, -7, 18);
                    bGrad.addColorStop(0, whiteSunlit);
                    bGrad.addColorStop(0.55, whiteBase);
                    bGrad.addColorStop(0.85, whiteShade);
                    bGrad.addColorStop(1, whiteDeep);
                    ctx.fillStyle = bGrad;
                    ctx.beginPath();
                    ctx.ellipse(-1, -7, 16.5, 14.5, 0.1, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Siyah Omuz Kuşağı
                    const sGrad = ctx.createLinearGradient(0, -18, 8, -10);
                    sGrad.addColorStop(0, blackSunlit);
                    sGrad.addColorStop(0.5, blackBase);
                    sGrad.addColorStop(1, blackShade);
                    ctx.fillStyle = sGrad;
                    ctx.beginPath();
                    ctx.ellipse(3, -15, 13.5, 7.0, 0.25, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Yakın Bacak & Geniş Taban Yastığı
                    ctx.save();
                    ctx.translate(11, 2);
                    ctx.rotate(-0.25);
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 8.5, 5.5, 0.15, 0, Math.PI * 2);
                    ctx.fill();
                    // Sevimli Ayı Ayak Tabanı
                    ctx.fillStyle = padPink;
                    ctx.beginPath();
                    ctx.ellipse(0.5, 0, 5.0, 3.2, 0.15, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
    
                    // Bambu Dalı (İki patinin arasında tutuluyor)
                    drawBambooBranch(6, -8, 0.22, 1.05);
    
                    // Ön Kollar
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-5, -12, 4.8, 8.0, 0.45, 0, Math.PI * 2);
                    ctx.ellipse(8, -12, 4.8, 8.0, -0.45, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Kafa
                    ctx.save();
                    ctx.translate(5, -24 + chewBob * 0.5);
    
                    // Kulaklar
                    ctx.fillStyle = blackShade;
                    ctx.beginPath();
                    ctx.ellipse(-7, -10, 4.2, 4.8, -0.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(7, -10, 4.5, 5.2, 0.2, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Kafa küresi
                    const hGrad = ctx.createRadialGradient(-3, -2, 2, 0, 0, 15);
                    hGrad.addColorStop(0, whiteSunlit);
                    hGrad.addColorStop(0.55, whiteBase);
                    hGrad.addColorStop(0.85, whiteShade);
                    hGrad.addColorStop(1, whiteDeep);
                    ctx.fillStyle = hGrad;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 13.5, 12, 0.1, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Yanak pofudukları
                    ctx.fillStyle = whiteBase;
                    ctx.beginPath();
                    ctx.ellipse(-11.5, 2, 3.0, 4.2, -0.25, 0, Math.PI * 2);
                    ctx.ellipse(11.5, 2, 3.0, 4.2, 0.25, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Göz Yamaları
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-4.5, -1.8, 2.8, 4.0, -0.25, 0, Math.PI * 2);
                    ctx.ellipse(4.5, -1.8, 3.5, 4.5, 0.35, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = eyeAmber;
                    ctx.beginPath(); ctx.arc(-4.0, -1.5, 1.2, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(4.6, -1.5, 1.35, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath(); ctx.arc(-3.7, -1.8, 0.55, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(4.9, -1.8, 0.65, 0, Math.PI * 2); ctx.fill();
    
                    // Burun
                    ctx.fillStyle = noseLeather;
                    ctx.beginPath();
                    ctx.ellipse(1.5, 2.6, 2.3, 1.6, 0.1, 0, Math.PI * 2);
                    ctx.fill();
    
                    // Ağız
                    ctx.strokeStyle = blackBase;
                    ctx.lineWidth = 0.85;
                    ctx.beginPath();
                    ctx.moveTo(1.5, 4.2); ctx.lineTo(1.5, 5.4);
                    ctx.moveTo(1.5, 5.4); ctx.quadraticCurveTo(-1.0, 6.6, -2.5, 6.0);
                    ctx.moveTo(1.5, 5.4); ctx.quadraticCurveTo(3.8, 6.6, 5.2, 6.0);
                    ctx.stroke();
    
                    ctx.restore();
                }
    
                // A.2: SITTING - FRONT (Tam Ön Seated)
                else if (view === 'front') {
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-13, 2, 8.5, 5.5, -0.3, 0, Math.PI * 2);
                    ctx.ellipse(13, 2, 8.5, 5.5, 0.3, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = padPink;
                    ctx.beginPath();
                    ctx.ellipse(-13, 2, 5.0, 3.2, -0.3, 0, Math.PI * 2);
                    ctx.ellipse(13, 2, 5.0, 3.2, 0.3, 0, Math.PI * 2);
                    ctx.fill();
    
                    const fSitBelly = ctx.createRadialGradient(0, -9, 2, 0, -7, 18);
                    fSitBelly.addColorStop(0, whiteSunlit);
                    fSitBelly.addColorStop(0.55, whiteBase);
                    fSitBelly.addColorStop(0.85, whiteShade);
                    fSitBelly.addColorStop(1, whiteDeep);
                    ctx.fillStyle = fSitBelly;
                    ctx.beginPath();
                    ctx.ellipse(0, -7, 16.5, 14.5, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(0, -15, 15.0, 7.0, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    drawBambooBranch(4, -8, 0.25, 1.1);
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-7.5, -12, 4.8, 8.2, 0.45, 0, Math.PI * 2);
                    ctx.ellipse(7.5, -12, 4.8, 8.2, -0.45, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.save();
                    ctx.translate(0, -25 + chewBob * 0.5);
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-9.5, -9.5, 4.5, 5.2, -0.2, 0, Math.PI * 2);
                    ctx.ellipse(9.5, -9.5, 4.5, 5.2, 0.2, 0, Math.PI * 2);
                    ctx.fill();
    
                    const fHead = ctx.createRadialGradient(-2, -2, 2, 0, 0, 15);
                    fHead.addColorStop(0, whiteSunlit);
                    fHead.addColorStop(0.55, whiteBase);
                    fHead.addColorStop(0.85, whiteShade);
                    fHead.addColorStop(1, whiteDeep);
                    ctx.fillStyle = fHead;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 13.5, 12, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = whiteBase;
                    ctx.beginPath();
                    ctx.ellipse(-12.5, 2, 3.2, 4.2, -0.25, 0, Math.PI * 2);
                    ctx.ellipse(12.5, 2, 3.2, 4.2, 0.25, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-5.2, -1.5, 3.4, 4.5, -0.32, 0, Math.PI * 2);
                    ctx.ellipse(5.2, -1.5, 3.4, 4.5, 0.32, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = eyeAmber;
                    ctx.beginPath(); ctx.arc(-4.6, -1.2, 1.35, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(4.6, -1.2, 1.35, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath(); ctx.arc(-4.3, -1.6, 0.6, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.arc(4.9, -1.6, 0.6, 0, Math.PI * 2); ctx.fill();
    
                    ctx.fillStyle = noseLeather;
                    ctx.beginPath();
                    ctx.ellipse(0, 2.8, 2.3, 1.6, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.strokeStyle = blackBase;
                    ctx.lineWidth = 0.85;
                    ctx.beginPath();
                    ctx.moveTo(0, 4.4); ctx.lineTo(0, 5.6);
                    ctx.moveTo(0, 5.6); ctx.quadraticCurveTo(-2.4, 7.0, -4.0, 6.2);
                    ctx.moveTo(0, 5.6); ctx.quadraticCurveTo(2.4, 7.0, 4.0, 6.2);
                    ctx.stroke();
    
                    ctx.restore();
                }
    
                // A.3: SITTING - SIDE (Yan Profil Seated)
                else if (view === 'side') {
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(6, 2, 9.5, 5.0, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = padPink;
                    ctx.beginPath();
                    ctx.ellipse(12, 1.5, 3.2, 4.2, 0.2, 0, Math.PI * 2);
                    ctx.fill();
    
                    const sSitBelly = ctx.createRadialGradient(-3, -8, 2, 0, -6, 17);
                    sSitBelly.addColorStop(0, whiteSunlit);
                    sSitBelly.addColorStop(0.55, whiteBase);
                    sSitBelly.addColorStop(1, whiteShade);
                    ctx.fillStyle = sSitBelly;
                    ctx.beginPath();
                    ctx.ellipse(-1, -7, 15.0, 14.0, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(1, -14, 11.5, 7.5, 0.2, 0, Math.PI * 2);
                    ctx.fill();
    
                    drawBambooBranch(10, -8, 0.35, 1.05);
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(4, -12, 4.8, 8.0, -0.3, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.save();
                    ctx.translate(6, -24 + chewBob * 0.5);
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(0, -10, 4.4, 5.0, 0.1, 0, Math.PI * 2);
                    ctx.fill();
    
                    const sHead = ctx.createRadialGradient(-2, -2, 2, 0, 0, 13);
                    sHead.addColorStop(0, whiteSunlit);
                    sHead.addColorStop(0.6, whiteBase);
                    sHead.addColorStop(1, whiteShade);
                    ctx.fillStyle = sHead;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 12, 11, 0.1, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = whiteBase;
                    ctx.beginPath();
                    ctx.ellipse(7, 2, 5.5, 4.2, 0.1, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(3, -2, 3.6, 4.5, 0.3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = eyeAmber;
                    ctx.beginPath(); ctx.arc(3.5, -1.8, 1.3, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath(); ctx.arc(3.8, -2.1, 0.6, 0, Math.PI * 2); ctx.fill();
    
                    ctx.fillStyle = noseLeather;
                    ctx.beginPath();
                    ctx.ellipse(11, 1.5, 2.2, 1.8, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.restore();
                }
    
                // A.4 & A.5: SITTING - BACK & QUARTER-BACK (Arkadan Oturan Tonton Panda)
                else {
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-12, 2, 8.0, 5.5, -0.2, 0, Math.PI * 2);
                    ctx.ellipse(12, 2, 8.0, 5.5, 0.2, 0, Math.PI * 2);
                    ctx.fill();
    
                    const bSitBelly = ctx.createRadialGradient(0, -9, 2, 0, -7, 18);
                    bSitBelly.addColorStop(0, whiteSunlit);
                    bSitBelly.addColorStop(0.6, whiteBase);
                    bSitBelly.addColorStop(1, whiteShade);
                    ctx.fillStyle = bSitBelly;
                    ctx.beginPath();
                    ctx.ellipse(0, -7, 16.5, 14.5, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(0, -15, 15.0, 7.0, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.fillStyle = whiteBase;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 4.2, 3.5, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    drawBambooBranch(11, -12, 0.35, 1.0);
    
                    ctx.save();
                    ctx.translate(0, -25 + chewBob * 0.5);
    
                    ctx.fillStyle = blackBase;
                    ctx.beginPath();
                    ctx.ellipse(-9.5, -9.5, 4.5, 5.2, -0.2, 0, Math.PI * 2);
                    ctx.ellipse(9.5, -9.5, 4.5, 5.2, 0.2, 0, Math.PI * 2);
                    ctx.fill();
    
                    const bkHead = ctx.createRadialGradient(0, -2, 2, 0, 0, 14);
                    bkHead.addColorStop(0, whiteSunlit);
                    bkHead.addColorStop(0.65, whiteBase);
                    bkHead.addColorStop(1, whiteShade);
                    ctx.fillStyle = bkHead;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 13, 11.5, 0, 0, Math.PI * 2);
                    ctx.fill();
    
                    ctx.restore();
                }
    
                ctx.restore(); // Oturma modu sonu
                ctx.restore(); // Ana canvas sonu
                return;
            }
    
            // =========================================================================
            // DURUM B: 🚶 8-YÖNLÜ 2.5D DÖRT AYAKLI YÜRÜYÜŞ & DURUŞ MOTORU
            // =========================================================================
            ctx.save();
            ctx.rotate(waddleRoll);
    
            // -------------------------------------------------------------------------
            // GÖRÜNÜM 1: QUARTER-FRONT (Ön-Çeyrek - Down-Right / Down-Left) ★ HERO 2.5D
            // -------------------------------------------------------------------------
            if (view === 'quarter-front') {
                // 1. Far Hind Leg (Uzak Arka Bacak)
                const farHindX = -14 + counterStride * 0.9;
                ctx.save();
                ctx.fillStyle = blackDeep;
                ctx.beginPath();
                ctx.ellipse(farHindX, -8, 6.5, 9.5, -0.2, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(farHindX - 1, 0, false, false, liftFH);
                ctx.restore();
    
                // 2. Far Foreleg (Uzak Ön Bacak)
                const farForeX = 7 - stride * 0.8;
                ctx.save();
                ctx.fillStyle = blackDeep;
                ctx.beginPath();
                ctx.ellipse(farForeX, -10, 5.8, 9.2, 0.15, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(farForeX + 1, 0, false, true, liftFF);
                ctx.restore();
    
                // 3. Barrel Torso (Gövde)
                ctx.save();
                const bodyGrad = ctx.createRadialGradient(-2, -16, 4, 0, -14, 22);
                bodyGrad.addColorStop(0, whiteSunlit);
                bodyGrad.addColorStop(0.5, whiteBase);
                bodyGrad.addColorStop(0.85, whiteShade);
                bodyGrad.addColorStop(1, whiteDeep);
    
                ctx.fillStyle = bodyGrad;
                ctx.beginPath();
                ctx.ellipse(-3, -15 - breath * 0.5, 17.5, 13.5, 0.1, 0, Math.PI * 2);
                ctx.fill();
    
                // Siyah Omuz Kuşağı
                const saddleGrad = ctx.createLinearGradient(0, -26, 12, -8);
                saddleGrad.addColorStop(0, blackSunlit);
                saddleGrad.addColorStop(0.45, blackBase);
                saddleGrad.addColorStop(1, blackShade);
                ctx.fillStyle = saddleGrad;
                ctx.beginPath();
                ctx.ellipse(4, -16, 11.0, 14.0, 0.35, 0, Math.PI * 2);
                ctx.fill();
    
                // Siyah Arka Kalça Bağı
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-12, -15, 9.0, 11.0, -0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
    
                // 4. White Stubby Tail
                ctx.save();
                ctx.translate(-20, -17 + (isMoving ? Math.sin(cycle * 0.8) * 1.5 : 0));
                ctx.fillStyle = whiteBase;
                ctx.beginPath();
                ctx.ellipse(0, 0, 3.8, 3.2, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
    
                // 5. Near Hind Leg
                const nearHindX = -10 + stride * 0.9;
                ctx.save();
                const hindGrad = ctx.createLinearGradient(nearHindX - 6, -20, nearHindX + 6, -2);
                hindGrad.addColorStop(0, blackSunlit);
                hindGrad.addColorStop(0.5, blackBase);
                hindGrad.addColorStop(1, blackShade);
                ctx.fillStyle = hindGrad;
                ctx.beginPath();
                ctx.ellipse(nearHindX, -9, 7.8, 11.0, 0.1, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(nearHindX + 0.5, 0, true, false, liftNH);
                ctx.restore();
    
                // 6. Near Foreleg
                const nearForeX = 11 + counterStride * 0.9;
                ctx.save();
                const foreGrad = ctx.createLinearGradient(nearForeX - 5, -22, nearForeX + 5, -2);
                foreGrad.addColorStop(0, blackSunlit);
                foreGrad.addColorStop(0.45, blackBase);
                foreGrad.addColorStop(1, blackShade);
                ctx.fillStyle = foreGrad;
                ctx.beginPath();
                ctx.ellipse(nearForeX, -10, 6.5, 10.5, -0.15, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(nearForeX, 0, true, true, liftNF);
                ctx.restore();
    
                // 7. Head & Face (Ağzında Taze Bambu Taşıyan Sevimli Kafa!)
                ctx.save();
                ctx.translate(11, -22 - headBob);
    
                // Far Ear
                ctx.save();
                ctx.translate(-4, -12);
                ctx.rotate(-0.2 + earWiggle);
                ctx.fillStyle = blackShade;
                ctx.beginPath();
                ctx.ellipse(0, 0, 4.0, 4.6, -0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
    
                // Near Ear
                ctx.save();
                ctx.translate(7, -12);
                ctx.rotate(0.25 - earWiggle);
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(0, 0, 4.8, 5.4, 0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = blackShade;
                ctx.beginPath();
                ctx.ellipse(-0.5, 0.8, 2.8, 3.4, 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
    
                // Head Sphere
                const qHeadGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 15);
                qHeadGrad.addColorStop(0, whiteSunlit);
                qHeadGrad.addColorStop(0.55, whiteBase);
                qHeadGrad.addColorStop(0.85, whiteShade);
                qHeadGrad.addColorStop(1, whiteDeep);
                ctx.fillStyle = qHeadGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 13.5, 12.2, 0.1, 0, Math.PI * 2);
                ctx.fill();
    
                // Yanak Pofuduğu
                ctx.fillStyle = whiteBase;
                ctx.beginPath();
                ctx.ellipse(-10, 3, 3.0, 4.2, -0.3, 0, Math.PI * 2);
                ctx.fill();
    
                // Far Eye Patch
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-4.0, -1.8, 2.6, 3.8, -0.25, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = eyeAmber;
                ctx.beginPath(); ctx.arc(-3.6, -1.5, 1.2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(-3.3, -1.8, 0.55, 0, Math.PI * 2); ctx.fill();
    
                // Snout (Öne Doğru Çıkan Burun Kütlesi)
                const snoutGrad = ctx.createRadialGradient(4, 2, 1, 4, 3, 7);
                snoutGrad.addColorStop(0, whiteSunlit);
                snoutGrad.addColorStop(0.7, whiteBase);
                snoutGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = snoutGrad;
                ctx.beginPath();
                ctx.ellipse(4.5, 3.0, 5.8, 4.6, 0.15, 0, Math.PI * 2);
                ctx.fill();
    
                // Near Eye Patch
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(3.5, -2.2, 3.8, 4.8, 0.38, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = eyeAmber;
                ctx.beginPath(); ctx.arc(3.6, -1.8, 1.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(3.9, -2.2, 0.7, 0, Math.PI * 2); ctx.fill();
    
                // Burun Derisi
                ctx.fillStyle = noseLeather;
                ctx.beginPath();
                ctx.ellipse(8.0, 2.2, 2.3, 1.7, 0.15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
                ctx.beginPath();
                ctx.ellipse(7.8, 1.8, 1.2, 0.55, 0.15, 0, Math.PI * 2);
                ctx.fill();
    
                // Ağız Çizgisi
                ctx.strokeStyle = blackBase;
                ctx.lineWidth = 0.85;
                ctx.beginPath();
                ctx.moveTo(7.7, 3.8);
                ctx.quadraticCurveTo(5.8, 5.8, 3.8, 5.3);
                ctx.stroke();
    
                // Ağızda Taşınan Taze Bambu Sürgünü (Mouth-held Bamboo Branch!)
                drawBambooBranch(6.5, 4.2, 0.55, 0.95);
    
                ctx.restore();
            }
    
            // -------------------------------------------------------------------------
            // GÖRÜNÜM 2: FRONT (Tam Ön - Down)
            // -------------------------------------------------------------------------
            else if (view === 'front') {
                drawPaw(-14.5, 0, false, false, liftFH);
                drawPaw(14.5, 0, false, false, liftNH);
    
                const fBodyGrad = ctx.createRadialGradient(0, -14, 3, 0, -12, 18);
                fBodyGrad.addColorStop(0, whiteSunlit);
                fBodyGrad.addColorStop(0.6, whiteBase);
                fBodyGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = fBodyGrad;
                ctx.beginPath();
                ctx.ellipse(0, -13 - breath * 0.5, 17.0, 12.8, 0, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(0, -18, 16.0, 6.5, 0, 0, Math.PI * 2);
                ctx.fill();
    
                const leftLegX = -9.2 + stride * 0.6;
                const rightLegX = 9.2 - stride * 0.6;
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(leftLegX, -9, 6.0, 10.0, -0.1, 0, Math.PI * 2);
                ctx.ellipse(rightLegX, -9, 6.0, 10.0, 0.1, 0, Math.PI * 2);
                ctx.fill();
    
                drawPaw(leftLegX, 0, true, true, liftNF);
                drawPaw(rightLegX, 0, true, true, liftFF);
    
                ctx.save();
                ctx.translate(0, -24 - headBob);
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-10.0, -9.5, 4.6, 5.2, -0.2, 0, Math.PI * 2);
                ctx.ellipse(10.0, -9.5, 4.6, 5.2, 0.2, 0, Math.PI * 2);
                ctx.fill();
    
                const fHeadGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 15);
                fHeadGrad.addColorStop(0, whiteSunlit);
                fHeadGrad.addColorStop(0.6, whiteBase);
                fHeadGrad.addColorStop(0.9, whiteShade);
                fHeadGrad.addColorStop(1, whiteDeep);
                ctx.fillStyle = fHeadGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 14.0, 12.5, 0, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = whiteBase;
                ctx.beginPath();
                ctx.ellipse(-13.0, 2, 3.2, 4.5, -0.25, 0, Math.PI * 2);
                ctx.ellipse(13.0, 2, 3.2, 4.5, 0.25, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-5.4, -1.5, 3.5, 4.6, -0.32, 0, Math.PI * 2);
                ctx.ellipse(5.4, -1.5, 3.5, 4.6, 0.32, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = eyeAmber;
                ctx.beginPath(); ctx.arc(-4.8, -1.2, 1.4, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(4.8, -1.2, 1.4, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(-4.5, -1.6, 0.65, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(5.1, -1.6, 0.65, 0, Math.PI * 2); ctx.fill();
    
                ctx.fillStyle = noseLeather;
                ctx.beginPath();
                ctx.ellipse(0, 2.8, 2.4, 1.7, 0, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.strokeStyle = blackBase;
                ctx.lineWidth = 0.85;
                ctx.beginPath();
                ctx.moveTo(0, 4.5); ctx.lineTo(0, 5.7);
                ctx.moveTo(0, 5.7); ctx.quadraticCurveTo(-2.5, 7.1, -4.2, 6.3);
                ctx.moveTo(0, 5.7); ctx.quadraticCurveTo(2.5, 7.1, 4.2, 6.3);
                ctx.stroke();
    
                // Ağızdan yana doğru uzanan taze bambu filizi
                drawBambooBranch(4.2, 5.6, 0.65, 0.95);
    
                ctx.restore();
            }
    
            // -------------------------------------------------------------------------
            // GÖRÜNÜM 3: SIDE (Tam Profil - Right / Left)
            // -------------------------------------------------------------------------
            else if (view === 'side') {
                const farRearX = -13 + counterStride;
                const farFrontX = 8 - stride;
                ctx.fillStyle = blackDeep;
                ctx.beginPath();
                ctx.ellipse(farRearX, -8, 6.2, 9.8, 0, 0, Math.PI * 2);
                ctx.ellipse(farFrontX, -9, 5.5, 9.2, 0, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(farRearX, 0, false, false, liftFH);
                drawPaw(farFrontX, 0, false, true, liftFF);
    
                const sBodyGrad = ctx.createRadialGradient(-1, -15, 3, 0, -14, 20);
                sBodyGrad.addColorStop(0, whiteSunlit);
                sBodyGrad.addColorStop(0.55, whiteBase);
                sBodyGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = sBodyGrad;
                ctx.beginPath();
                ctx.ellipse(-1, -15, 18.5, 13.0, 0, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(7, -15, 10.0, 13.5, 0.2, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-10, -15, 9.5, 12.0, -0.15, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = whiteBase;
                ctx.beginPath();
                ctx.ellipse(-20, -17, 3.8, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();
    
                const nearRearX = -10 + stride;
                const nearFrontX = 11 + counterStride;
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(nearRearX, -9, 7.4, 11.0, 0, 0, Math.PI * 2);
                ctx.ellipse(nearFrontX, -10, 6.5, 10.5, 0, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(nearRearX, 0, true, false, liftNH);
                drawPaw(nearFrontX, 0, true, true, liftNF);
    
                ctx.save();
                ctx.translate(13, -22 - headBob);
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(0, -10.5, 4.6, 5.2, 0.1, 0, Math.PI * 2);
                ctx.fill();
    
                const sHeadGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 14);
                sHeadGrad.addColorStop(0, whiteSunlit);
                sHeadGrad.addColorStop(0.6, whiteBase);
                sHeadGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = sHeadGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 12.5, 11.5, 0.1, 0, Math.PI * 2);
                ctx.fill();
    
                // Gerçekçi Ayı Muzzle Profili (Alından buruna yumuşak eğim)
                ctx.fillStyle = whiteBase;
                ctx.beginPath();
                ctx.moveTo(3, -2);
                ctx.quadraticCurveTo(8, 0, 11.5, 1.5);
                ctx.quadraticCurveTo(11.5, 4.5, 8, 5.0);
                ctx.quadraticCurveTo(3, 4.5, 2, 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(3.2, -2, 3.8, 4.6, 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = eyeAmber;
                ctx.beginPath(); ctx.arc(3.6, -1.8, 1.35, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(3.9, -2.1, 0.65, 0, Math.PI * 2); ctx.fill();
    
                ctx.fillStyle = noseLeather;
                ctx.beginPath();
                ctx.ellipse(11.5, 1.5, 2.3, 1.8, 0, 0, Math.PI * 2);
                ctx.fill();
    
                // Ağızdan öne uzanan bambu
                drawBambooBranch(10, 4.0, 0.6, 0.98);
    
                ctx.restore();
            }
    
            // -------------------------------------------------------------------------
            // GÖRÜNÜM 4: QUARTER-BACK (Arka-Çeyrek - Up-Right / Up-Left)
            // -------------------------------------------------------------------------
            else if (view === 'quarter-back') {
                const farFrontX = 8 + stride * 0.8;
                ctx.fillStyle = blackDeep;
                ctx.beginPath();
                ctx.ellipse(farFrontX, -9, 5.5, 9.2, 0.1, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(farFrontX, 0, false, true, liftFF);
    
                ctx.save();
                ctx.translate(10, -22 - headBob);
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-5.5, -10.5, 4.4, 5.0, -0.2, 0, Math.PI * 2);
                ctx.ellipse(6.5, -10.5, 4.4, 5.0, 0.2, 0, Math.PI * 2);
                ctx.fill();
    
                const bHeadGrad = ctx.createRadialGradient(-2, -2, 2, 0, 0, 14);
                bHeadGrad.addColorStop(0, whiteSunlit);
                bHeadGrad.addColorStop(0.65, whiteBase);
                bHeadGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = bHeadGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 13.0, 12.0, 0, 0, Math.PI * 2);
                ctx.fill();
    
                // Ağızdaki bambu dalının ucu arkadan görünür
                drawBambooBranch(8, 2, 0.55, 0.9);
                ctx.restore();
    
                ctx.save();
                const qbBodyGrad = ctx.createRadialGradient(-4, -15, 3, 0, -14, 20);
                qbBodyGrad.addColorStop(0, whiteSunlit);
                qbBodyGrad.addColorStop(0.55, whiteBase);
                qbBodyGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = qbBodyGrad;
                ctx.beginPath();
                ctx.ellipse(-2, -15, 17.5, 13.5, 0, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(4, -16, 11.5, 14.0, 0.3, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-11, -15, 10.0, 12.0, -0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
    
                ctx.save();
                ctx.translate(-20, -16 + (isMoving ? Math.sin(cycle * 0.8) * 1.5 : 0));
                ctx.fillStyle = whiteBase;
                ctx.beginPath();
                ctx.ellipse(0, 0, 4.0, 3.4, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
    
                const nearFrontX = 11 - counterStride * 0.8;
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(nearFrontX, -10, 6.5, 10.5, -0.15, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(nearFrontX, 0, true, true, liftNF);
    
                const nearRearX = -9 + counterStride * 0.8;
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(nearRearX, -9, 7.5, 11.0, 0.1, 0, Math.PI * 2);
                ctx.fill();
                drawPaw(nearRearX, 0, true, false, liftNH);
            }
    
            // -------------------------------------------------------------------------
            // GÖRÜNÜM 5: BACK (Tam Arka - Up)
            // -------------------------------------------------------------------------
            else if (view === 'back') {
                ctx.save();
                ctx.translate(0, -23 - headBob);
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(-10.0, -9.5, 4.6, 5.2, -0.2, 0, Math.PI * 2);
                ctx.ellipse(10.0, -9.5, 4.6, 5.2, 0.2, 0, Math.PI * 2);
                ctx.fill();
    
                const bkHeadGrad = ctx.createRadialGradient(0, -2, 2, 0, 0, 14);
                bkHeadGrad.addColorStop(0, whiteSunlit);
                bkHeadGrad.addColorStop(0.65, whiteBase);
                bkHeadGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = bkHeadGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 13.5, 12.0, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
    
                const bkBodyGrad = ctx.createRadialGradient(0, -14, 3, 0, -12, 18);
                bkBodyGrad.addColorStop(0, whiteSunlit);
                bkBodyGrad.addColorStop(0.6, whiteBase);
                bkBodyGrad.addColorStop(1, whiteShade);
                ctx.fillStyle = bkBodyGrad;
                ctx.beginPath();
                ctx.ellipse(0, -13 - breath * 0.5, 16.5, 12.5, 0, 0, Math.PI * 2);
                ctx.fill();
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(0, -17, 15.5, 6.5, 0, 0, Math.PI * 2);
                ctx.fill();
    
                const bLeftLegX = -9.5 + counterStride * 0.6;
                const bRightLegX = 9.5 - counterStride * 0.6;
    
                ctx.fillStyle = blackBase;
                ctx.beginPath();
                ctx.ellipse(bLeftLegX, -9, 6.8, 10.5, -0.1, 0, Math.PI * 2);
                ctx.ellipse(bRightLegX, -9, 6.8, 10.5, 0.1, 0, Math.PI * 2);
                ctx.fill();
    
                drawPaw(bLeftLegX, 0, true, false, liftFH);
                drawPaw(bRightLegX, 0, true, false, liftNH);
    
                ctx.save();
                ctx.translate(0, -13 + (isMoving ? Math.sin(cycle * 0.8) * 1.5 : 0));
                ctx.fillStyle = whiteBase;
                ctx.beginPath();
                ctx.ellipse(0, 0, 4.2, 3.6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
    
            ctx.restore(); // Gövde roll sonu
            ctx.restore(); // Ana canvas sonu
        }
    

    // =========================================================================

    const definition = {
        id: 'costume_panda',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawPanda(ctx, facing, isMoving, walkCycle, isSitting);
        },
        getNameTagOffset: () => -28
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_panda'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_panda', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
