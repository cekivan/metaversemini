// public/js/renderers/costumes/anacondaCostume.js - 🐍 Anakonda Kostümü
(function () {
    // 9. 🐍 DEV AMAZON ANAKONDASI (costume_anaconda) - Kusursuz 3D Silindirik Gövde & Doğal Anatomi
    // =========================================================================
    function drawAnaconda(ctx, facing, isMoving, walkCycle, isSitting) {
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

        // Kinematikler: Sürünme dalga hızı ve dil periyodu
        // Kullanıcı talebi: Yukarı ve aşağı gidişteki 1.4 kıvrılma hızı muhteşem oldu.
        // Aynı şekilde sağa, sola ve çapraz yönler de yavaşlatılarak tüm 8 yönde
        // 1.4 katsayısı ile pürüzsüz, asil ve sakin bir kıvrılma standardına getirildi.
        const moveSpeedMult = 1.4;
        const idleSpeedMult = 0.0012;

        const slitherSpeed = (isMoving && !isSitting) ? cycle * moveSpeedMult : time * idleSpeedMult;
        const tongueCycle = time % 2600;
        const isFlicking = tongueCycle < 1100;
        const tongueFlicker = Math.sin(time / 28) * 2.4;
        const tongueExt = Math.max(0, Math.sin((tongueCycle / 1100) * Math.PI)) * 13;

        // Otantik Amazon Yeşil Anakondası Paleti (Eunectes murinus)
        const dorsalLight = "#5c944e";    // Omurga tepesindeki güneşli zeytin yeşili
        const dorsalBase = "#3a6d31";     // Canlı orman & haki yeşili
        const dorsalShade = "#22481c";    // Gövde yanı gölgesi
        const dorsalDeep = "#0e200c";     // Zemin temas gölgesi

        const ventralLight = "#fef9c3";   // Vanilya-krem karın pulu
        const ventralBase = "#fde047";    // Karın orta tonu
        const ventralShade = "#ca8a04";   // Karın pul çizgisi

        const spotBlack = "#101610";      // Kömür anakonda lekesi
        const spotRim = "#1e2c1a";        // Leke dış halesi
        const flankOrange = "#f59e0b";    // Yan ocelli merkez amber tonu

        const eyeAmber = "#f59e0b";
        const eyePupil = "#09090b";
        const tongueRed = "#dc2626";

        ctx.save();
        ctx.scale(mirror * 1.18, 1.18);

        // =========================================================================
        // DURUM A: 🧘 ÇÖREKLENME MODU (isSitting === true: 3D Katmanlı Doğal Dinlenme Çöreği)
        // =========================================================================
        if (isSitting) {
            drawCoiledAnaconda(ctx, view, time, isFlicking, tongueExt, tongueFlicker, {
                dorsalLight, dorsalBase, dorsalShade, dorsalDeep,
                ventralLight, ventralBase, ventralShade,
                spotBlack, spotRim, flankOrange,
                eyeAmber, eyePupil, tongueRed
            });
            ctx.restore();
            return;
        }

        // =========================================================================
        // DURUM B: 🚶 8-YÖNLÜ PÜRÜZSÜZ & AKIŞKAN ZEMİN SÜRÜNMESİ
        // =========================================================================
        drawSmoothSlitheringAnaconda(ctx, view, isMoving, slitherSpeed, isFlicking, tongueExt, tongueFlicker, {
            dorsalLight, dorsalBase, dorsalShade, dorsalDeep,
            ventralLight, ventralBase, ventralShade,
            spotBlack, spotRim, flankOrange,
            eyeAmber, eyePupil, tongueRed
        });

        ctx.restore();
    }

    // =========================================================================
    // YARDIMCI 1: HAKİKİ 3D SİLİNDİRİK GÖVDE MOTORU (True Tube Geometry)
    // =========================================================================
    function drawSmoothSlitheringAnaconda(ctx, view, isMoving, slitherSpeed, isFlicking, tongueExt, tongueFlicker, pal) {
        const numSegments = 28;
        const spine = [];

        let dirX = 1.0, dirY = 0.0;
        let groundLatX = 0.0, groundLatY = 0.38;
        let waveAmp = 7.8;
        let headLift = -2.6;

        if (view === 'side') {
            dirX = 1.0; dirY = 0.0;
            groundLatX = 0.0; groundLatY = 0.38;
            waveAmp = 7.8;
            headLift = -2.8;
        } else if (view === 'quarter-front') {
            dirX = 0.86; dirY = 0.46;
            groundLatX = -0.46; groundLatY = 0.34;
            waveAmp = 7.2;
            headLift = -2.4;
        } else if (view === 'front') {
            dirX = 0.0; dirY = 0.95;
            groundLatX = -1.0; groundLatY = 0.0;
            waveAmp = 7.5; // Aşağı gidişte aşırı çırpınmayı önleyip daha asil ve akıcı kıvrılma sağlar
            headLift = -2.0;
        } else if (view === 'quarter-back') {
            dirX = 0.86; dirY = -0.46;
            groundLatX = 0.46; groundLatY = 0.34;
            waveAmp = 6.8;
            headLift = -1.4;
        } else if (view === 'back') {
            dirX = 0.0; dirY = -0.95;
            groundLatX = 1.0; groundLatY = 0.0;
            waveAmp = 7.5; // Yukarı gidişte daha sakin ve doğal kıvrılma
            headLift = -1.2;
        }

        const waveFreq = 0.38;

        for (let i = 0; i < numSegments; i++) {
            const dist = (i - 6.5) * 2.45;
            const phase = slitherSpeed - i * waveFreq;
            const localAmp = (i === 0) ? 1.2 : (i < 4 ? 1.2 + i * 1.3 : waveAmp * Math.min(1.0, (numSegments - i) / 5.5));
            const wave = Math.sin(phase) * localAmp;

            const baseX = -dist * dirX + wave * groundLatX;
            const baseY = -dist * dirY + wave * groundLatY;

            let r;
            if (i === 0) r = 5.8;
            else if (i < 3) r = 5.6 + i * 0.8;
            else if (i < 14) r = 6.8 + Math.sin((i - 3) / 11 * Math.PI) * 2.0;
            else {
                const tailProg = (i - 13) / (numSegments - 13);
                r = Math.max(0.6, 8.8 * Math.pow(1 - tailProg, 1.35));
            }

            spine.push({
                x: baseX,
                y: baseY + (i === 0 ? headLift : (i < 4 ? headLift * (4 - i) / 4 : 0)),
                r: r,
                waveVel: Math.cos(phase),
                idx: i
            });
        }

        const leftBoundary = [];
        const rightBoundary = [];

        for (let i = 0; i < numSegments; i++) {
            let tx, ty;
            if (i === 0) {
                tx = spine[0].x - spine[1].x;
                ty = spine[0].y - spine[1].y;
            } else if (i === numSegments - 1) {
                tx = spine[numSegments - 2].x - spine[numSegments - 1].x;
                ty = spine[numSegments - 2].y - spine[numSegments - 1].y;
            } else {
                tx = spine[i - 1].x - spine[i + 1].x;
                ty = spine[i - 1].y - spine[i + 1].y;
            }
            const len = Math.hypot(tx, ty) || 1;
            const nx = -ty / len;
            const ny = tx / len;

            spine[i].tanX = tx / len;
            spine[i].tanY = ty / len;
            spine[i].normX = nx;
            spine[i].normY = ny;

            leftBoundary.push({
                x: spine[i].x + nx * spine[i].r,
                y: spine[i].y + ny * spine[i].r
            });
            rightBoundary.push({
                x: spine[i].x - nx * spine[i].r,
                y: spine[i].y - ny * spine[i].r
            });
        }

        // Zemin Temas Gölgesi
        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        for (let i = 0; i < numSegments; i++) {
            const s = spine[i];
            ctx.ellipse(s.x, s.y + s.r * 0.55 + 1.2, s.r * 1.30, s.r * 0.45, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();

        // 3D Silindirik Gövde Hacmi
        for (let i = numSegments - 2; i >= 0; i--) {
            const p1 = spine[i];
            const p2 = spine[i + 1];
            const L1 = leftBoundary[i];
            const L2 = leftBoundary[i + 1];
            const R1 = rightBoundary[i];
            const R2 = rightBoundary[i + 1];

            // Sol Yarı: L1 -> p1
            const leftGrad = ctx.createLinearGradient(L1.x, L1.y, p1.x, p1.y);
            leftGrad.addColorStop(0, pal.dorsalShade);
            leftGrad.addColorStop(0.55, pal.dorsalBase);
            leftGrad.addColorStop(1, pal.dorsalLight);

            ctx.fillStyle = leftGrad;
            ctx.beginPath();
            ctx.moveTo(L1.x, L1.y);
            ctx.lineTo(L2.x, L2.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.closePath();
            ctx.fill();

            // Sağ Yarı: p1 -> R1
            const rightGrad = ctx.createLinearGradient(p1.x, p1.y, R1.x, R1.y);
            rightGrad.addColorStop(0, pal.dorsalLight);
            rightGrad.addColorStop(0.45, pal.dorsalBase);
            rightGrad.addColorStop(1, pal.dorsalShade);

            ctx.fillStyle = rightGrad;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(R2.x, R2.y);
            ctx.lineTo(R1.x, R1.y);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = pal.dorsalBase;
            ctx.lineWidth = 0.6;
            ctx.stroke();

            // Karın pulları yalnızca yan profillerde görünür
            if ((view === 'side' || view === 'quarter-front') && i < numSegments - 6) {
                const isLeftLower = (L1.y > R1.y);
                const low1 = isLeftLower ? L1 : R1;
                const low2 = isLeftLower ? L2 : R2;
                const normDir = isLeftLower ? 1 : -1;
                const bWidth = p1.r * 0.28;

                const bGrad = ctx.createLinearGradient(low1.x - p1.normX * normDir * bWidth, low1.y - p1.normY * normDir * bWidth, low1.x, low1.y);
                bGrad.addColorStop(0, pal.ventralLight);
                bGrad.addColorStop(0.7, pal.ventralBase);
                bGrad.addColorStop(1, pal.ventralShade);

                ctx.fillStyle = bGrad;
                ctx.beginPath();
                ctx.moveTo(low1.x - p1.normX * normDir * bWidth, low1.y - p1.normY * normDir * bWidth);
                ctx.lineTo(low2.x - p2.normX * normDir * bWidth, low2.y - p2.normY * normDir * bWidth);
                ctx.lineTo(low2.x, low2.y);
                ctx.lineTo(low1.x, low1.y);
                ctx.closePath();
                ctx.fill();

                if (i % 2 === 0) {
                    ctx.strokeStyle = "rgba(161, 98, 7, 0.35)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(low1.x, low1.y);
                    ctx.lineTo(low1.x - p1.normX * normDir * bWidth, low1.y - p1.normY * normDir * bWidth);
                    ctx.stroke();
                }
            }
        }

        // Kuyruk ucu
        const tailTip = spine[numSegments - 1];
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.moveTo(leftBoundary[numSegments - 2].x, leftBoundary[numSegments - 2].y);
        ctx.lineTo(tailTip.x, tailTip.y);
        ctx.lineTo(rightBoundary[numSegments - 2].x, rightBoundary[numSegments - 2].y);
        ctx.closePath();
        ctx.fill();

        // Organik benekler
        for (let i = 2; i < numSegments - 5; i += 2) {
            const s = spine[i];
            const spotAngle = Math.atan2(s.tanY, s.tanX);

            ctx.save();
            const stagger = (i % 4 === 2 ? 1 : -1) * (s.r * 0.22);
            ctx.translate(s.x + s.normX * stagger, s.y + s.normY * stagger);
            ctx.rotate(spotAngle);

            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.ellipse(0, 0, s.r * 0.52, s.r * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();

            if (i % 4 === 0) {
                const sideShift = (i % 8 === 0 ? 1 : -1) * (s.r * 0.36);
                ctx.fillStyle = pal.spotBlack;
                ctx.beginPath();
                ctx.ellipse(0, sideShift, s.r * 0.25, s.r * 0.18, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = pal.flankOrange;
                ctx.beginPath();
                ctx.arc(0, sideShift, s.r * 0.09, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }

        // Islak pul ışıltısı
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 1.3;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let i = 1; i < numSegments - 5; i++) {
            const s = spine[i];
            if (i === 1) ctx.moveTo(s.x, s.y);
            else ctx.lineTo(s.x, s.y);
        }
        ctx.stroke();
        ctx.restore();

        // Baş
        const head = spine[0];
        const headAngle = Math.atan2(head.tanY, head.tanX);
        drawSnakeHead(ctx, head.x, head.y, headAngle, view, isFlicking, tongueExt, tongueFlicker, pal);
    }

    // =========================================================================
    // YARDIMCI 2: ÇÖREKLENMİŞ DOĞAL VE HEYBETLİ DİNLENME ÇÖREĞİ (Natural Coiled Pose)
    // =========================================================================
    function drawCoiledAnaconda(ctx, view, time, isFlicking, tongueExt, tongueFlicker, pal) {
        ctx.save();
        ctx.translate(0, -2);

        // 1. Zemin Temas Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
        ctx.beginPath();
        ctx.ellipse(0, 7, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0, 0, 0, 0.40)";
        ctx.beginPath();
        ctx.ellipse(0, 6, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Kuyruk Ucu (Çöreğin altından kıvrılan zarif uç)
        ctx.save();
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath();
        ctx.moveTo(14, 6);
        ctx.quadraticCurveTo(23, 8, 25, 2);
        ctx.quadraticCurveTo(26, -1, 23, 1);
        ctx.quadraticCurveTo(16, 3, 14, 5);
        ctx.fill();
        ctx.restore();

        // 3. Alt Katman Çörek Halkası
        const outerGrad = ctx.createRadialGradient(-6, -2, 2, 0, 3, 24);
        outerGrad.addColorStop(0, pal.dorsalLight);
        outerGrad.addColorStop(0.35, pal.dorsalBase);
        outerGrad.addColorStop(0.75, pal.dorsalShade);
        outerGrad.addColorStop(1, pal.dorsalDeep);

        ctx.lineWidth = 12.0;
        ctx.lineCap = "round";
        ctx.strokeStyle = outerGrad;
        ctx.beginPath();
        ctx.ellipse(0, 3, 19.0, 10.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Karın pulu alt kenarı
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.ellipse(0, 7.5, 17.8, 8.5, 0, 0.35, Math.PI * 0.95);
        ctx.stroke();

        // Alt halka anakonda benekleri
        const outerSpots = [
            { x: -14, y: 2 }, { x: -7, y: 9 }, { x: 8, y: 9 }, { x: 16, y: 1 }, { x: 4, y: -4 }, { x: -6, y: -4 }
        ];
        outerSpots.forEach(sp => {
            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.ellipse(sp.x, sp.y, 3.5, 2.4, 0.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = pal.flankOrange;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 1.15, 0, Math.PI * 2);
            ctx.fill();
        });

        // 4. İkinci Katman Çörek Halkası (İçe ve üste binen gövde)
        const midGrad = ctx.createRadialGradient(-3, -5, 2, 0, -3, 16);
        midGrad.addColorStop(0, pal.dorsalLight);
        midGrad.addColorStop(0.4, pal.dorsalBase);
        midGrad.addColorStop(0.85, pal.dorsalShade);
        midGrad.addColorStop(1, pal.dorsalDeep);

        ctx.lineWidth = 9.8;
        ctx.strokeStyle = midGrad;
        ctx.beginPath();
        ctx.ellipse(0, -2.5, 12.0, 7.0, 0.1, 0, Math.PI * 2);
        ctx.stroke();

        const midSpots = [{ x: -7, y: -3.5 }, { x: 6, y: -2 }, { x: 0, y: -7.5 }];
        midSpots.forEach(sp => {
            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.ellipse(sp.x, sp.y, 2.9, 2.0, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = pal.flankOrange;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 0.95, 0, Math.PI * 2);
            ctx.fill();
        });

        // 5. Yükselen Kaslı S-Boyun (Rearing S-Neck poised to strike)
        const breathSway = Math.sin(time / 420) * 1.1;
        const headX = (view === 'side' ? 6.5 : (view === 'quarter-front' ? 4.5 : 0));
        const headY = -19 + breathSway;

        ctx.save();
        const neckGrad = ctx.createLinearGradient(-4, headY, 4, 0);
        neckGrad.addColorStop(0, pal.dorsalLight);
        neckGrad.addColorStop(0.5, pal.dorsalBase);
        neckGrad.addColorStop(1, pal.dorsalDeep);

        ctx.lineWidth = 7.6;
        ctx.lineCap = "round";
        ctx.strokeStyle = neckGrad;
        ctx.beginPath();
        ctx.moveTo(0, -3.5);
        ctx.quadraticCurveTo(-3.5, headY * 0.5, headX * 0.5, headY * 0.7);
        ctx.quadraticCurveTo(headX, headY * 0.85, headX, headY);
        ctx.stroke();

        // Boyun karın pulu
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.moveTo(0, -2.5);
        ctx.quadraticCurveTo(-1.8, headY * 0.5, headX * 0.5, headY * 0.7);
        ctx.stroke();
        ctx.restore();

        // 6. Baş Çizimi (DİK VE HEYBETLİ ÇÖREK BAŞI)
        drawCoiledHead(ctx, headX, headY, view, isFlicking, tongueExt, tongueFlicker, pal);

        ctx.restore();
    }

    // =========================================================================
    // YARDIMCI 2B: ÇÖREKLENMİŞ ASİL ANAKONDA BAŞI (Önden Tam Dik, Yandan Profil)
    // =========================================================================
    function drawCoiledHead(ctx, hx, hy, view, isFlicking, tongueExt, tongueFlicker, pal) {
        ctx.save();
        ctx.translate(hx, hy);

        if (view === 'front') {
            // Tam Önden Bakış: KAFASI DİK! (Salyangoz veya yana dönük değil, tam karşıya bakan heybetli baş)
            const hGrad = ctx.createRadialGradient(0, -2, 1, 0, 0, 10);
            hGrad.addColorStop(0, pal.dorsalLight);
            hGrad.addColorStop(0.55, pal.dorsalBase);
            hGrad.addColorStop(1, pal.dorsalDeep);
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, 7.2, 5.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Alt Çene Krem/Sarı Plaka (Öne bakan alt çene)
            ctx.fillStyle = pal.ventralLight;
            ctx.beginPath();
            ctx.ellipse(0, 3.2, 4.4, 1.7, 0, 0, Math.PI * 2);
            ctx.fill();

            // İki Yanda Altın Yırtıcı Gözler (Sağ ve Sol simetrik, dik duruş)
            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath();
            ctx.arc(-5.2, -1.8, 1.6, 0, Math.PI * 2);
            ctx.arc(5.2, -1.8, 1.6, 0, Math.PI * 2);
            ctx.fill();

            // Dikey Yarık Gözbebekleri
            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(-5.5, -2.8, 0.7, 2.0);
            ctx.fillRect(4.8, -2.8, 0.7, 2.0);

            // Göz pırıltısı
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(-4.7, -2.3, 0.45, 0, Math.PI * 2);
            ctx.arc(5.6, -2.3, 0.45, 0, Math.PI * 2);
            ctx.fill();

            // Burun delikleri
            ctx.fillStyle = pal.dorsalDeep;
            ctx.beginPath();
            ctx.arc(-1.9, 1.3, 0.7, 0, Math.PI * 2);
            ctx.arc(1.9, 1.3, 0.7, 0, Math.PI * 2);
            ctx.fill();

            // Çatallı kırmızı dil (Aşağıya / İzleyiciye doğru titrer - SSSS YAZISI YOK!)
            if (isFlicking && tongueExt > 0) {
                drawForkedTongue(ctx, 0, 3.6, Math.PI / 2, tongueExt, tongueFlicker, pal);
            }
        } else if (view === 'side') {
            // Tam Yan Profil
            const rot = 0.16;
            ctx.rotate(rot);

            const hGrad = ctx.createRadialGradient(2, -2, 1, 3, 0, 11);
            hGrad.addColorStop(0, pal.dorsalLight);
            hGrad.addColorStop(0.55, pal.dorsalBase);
            hGrad.addColorStop(1, pal.dorsalDeep);

            // Alt çene
            ctx.fillStyle = pal.ventralLight;
            ctx.beginPath();
            ctx.ellipse(3.5, 3.0, 5.8, 2.2, -0.1, 0, Math.PI * 2);
            ctx.fill();

            // Üst kafa kubbesi
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.moveTo(-6.0, -4.5);
            ctx.quadraticCurveTo(1.5, -6.0, 8.8, -1.8);
            ctx.quadraticCurveTo(10.5, 0.4, 8.8, 2.8);
            ctx.quadraticCurveTo(2.0, 4.5, -5.5, 3.8);
            ctx.quadraticCurveTo(-7.5, -0.5, -6.0, -4.5);
            ctx.closePath();
            ctx.fill();

            // Siyah Temporal Çizgi
            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.moveTo(1.0, -1.5);
            ctx.lineTo(8.0, -0.2);
            ctx.lineTo(6.5, 1.4);
            ctx.lineTo(-4.5, 1.2);
            ctx.lineTo(-6.5, -0.8);
            ctx.closePath();
            ctx.fill();

            // Burun Deliği
            ctx.fillStyle = pal.dorsalDeep;
            ctx.beginPath();
            ctx.arc(7.2, -1.2, 0.75, 0, Math.PI * 2);
            ctx.fill();

            // Altın Kehribar Göz
            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath();
            ctx.arc(2.8, -2.0, 1.85, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(2.5, -3.2, 0.7, 2.4);

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(3.3, -2.6, 0.5, 0, Math.PI * 2);
            ctx.fill();

            if (isFlicking && tongueExt > 0) {
                drawForkedTongue(ctx, 9.8, 0.8, -0.05, tongueExt, tongueFlicker, pal);
            }
        } else if (view === 'quarter-front') {
            ctx.rotate(0.36);

            const hGrad = ctx.createRadialGradient(2, -2, 1, 3, 0, 11);
            hGrad.addColorStop(0, pal.dorsalLight);
            hGrad.addColorStop(0.55, pal.dorsalBase);
            hGrad.addColorStop(1, pal.dorsalDeep);

            ctx.fillStyle = pal.ventralLight;
            ctx.beginPath();
            ctx.ellipse(3.5, 3.0, 5.8, 2.2, -0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.moveTo(-6.0, -4.5);
            ctx.quadraticCurveTo(1.5, -6.0, 8.8, -1.8);
            ctx.quadraticCurveTo(10.5, 0.4, 8.8, 2.8);
            ctx.quadraticCurveTo(2.0, 4.5, -5.5, 3.8);
            ctx.quadraticCurveTo(-7.5, -0.5, -6.0, -4.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.moveTo(1.0, -1.5);
            ctx.lineTo(8.0, -0.2);
            ctx.lineTo(6.5, 1.4);
            ctx.lineTo(-4.5, 1.2);
            ctx.lineTo(-6.5, -0.8);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = pal.dorsalDeep;
            ctx.beginPath();
            ctx.arc(7.2, -1.2, 0.75, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath();
            ctx.arc(2.8, -2.0, 1.85, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(2.5, -3.2, 0.7, 2.4);

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(3.3, -2.6, 0.5, 0, Math.PI * 2);
            ctx.fill();

            if (isFlicking && tongueExt > 0) {
                drawForkedTongue(ctx, 9.8, 0.8, -0.05, tongueExt, tongueFlicker, pal);
            }
        } else {
            // view === 'back' / 'quarter-back'
            const hGrad = ctx.createRadialGradient(-1, -2, 1, 0, 0, 10);
            hGrad.addColorStop(0, pal.dorsalLight);
            hGrad.addColorStop(0.6, pal.dorsalBase);
            hGrad.addColorStop(1, pal.dorsalDeep);
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, 7.2, 5.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Ense üzerindeki büyük leke
            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.ellipse(0, -0.5, 3.2, 2.0, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = pal.flankOrange;
            ctx.beginPath();
            ctx.arc(0, -0.5, 1.0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    // =========================================================================
    // YARDIMCI 3: ANAKONDA KAFASI & GÖZLERİ (Hareket Halinde)
    // =========================================================================
    function drawSnakeHead(ctx, hx, hy, angle, view, isFlicking, tongueExt, tongueFlicker, pal) {
        ctx.save();
        ctx.translate(hx, hy);

        if (view === 'quarter-front' || view === 'side') {
            const rot = (view === 'side') ? 0.16 : 0.36;
            ctx.rotate(rot);

            const hGrad = ctx.createRadialGradient(2, -2, 1, 3, 0, 11);
            hGrad.addColorStop(0, pal.dorsalLight);
            hGrad.addColorStop(0.55, pal.dorsalBase);
            hGrad.addColorStop(1, pal.dorsalDeep);

            // Alt çene
            ctx.fillStyle = pal.ventralLight;
            ctx.beginPath();
            ctx.ellipse(3.5, 3.0, 5.8, 2.2, -0.1, 0, Math.PI * 2);
            ctx.fill();

            // Üst kafa kubbesi
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.moveTo(-6.0, -4.5);
            ctx.quadraticCurveTo(1.5, -6.0, 8.8, -1.8);
            ctx.quadraticCurveTo(10.5, 0.4, 8.8, 2.8);
            ctx.quadraticCurveTo(2.0, 4.5, -5.5, 3.8);
            ctx.quadraticCurveTo(-7.5, -0.5, -6.0, -4.5);
            ctx.closePath();
            ctx.fill();

            // Siyah Temporal Çizgi
            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.moveTo(1.0, -1.5);
            ctx.lineTo(8.0, -0.2);
            ctx.lineTo(6.5, 1.4);
            ctx.lineTo(-4.5, 1.2);
            ctx.lineTo(-6.5, -0.8);
            ctx.closePath();
            ctx.fill();

            // Burun Deliği
            ctx.fillStyle = pal.dorsalDeep;
            ctx.beginPath();
            ctx.arc(7.2, -1.2, 0.75, 0, Math.PI * 2);
            ctx.fill();

            // Altın Kehribar Göz & Dikey Gözbebeği
            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath();
            ctx.arc(2.8, -2.0, 1.85, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(2.5, -3.2, 0.7, 2.4);

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(3.3, -2.6, 0.5, 0, Math.PI * 2);
            ctx.fill();

            if (isFlicking && tongueExt > 0) {
                drawForkedTongue(ctx, 9.8, 0.8, -0.05, tongueExt, tongueFlicker, pal);
            }
        } else if (view === 'front') {
            ctx.rotate(angle);

            const hGrad = ctx.createRadialGradient(2, 0, 1, 0, 0, 10);
            hGrad.addColorStop(0, pal.dorsalLight);
            hGrad.addColorStop(0.55, pal.dorsalBase);
            hGrad.addColorStop(1, pal.dorsalDeep);

            // Alt çene
            ctx.fillStyle = pal.ventralLight;
            ctx.beginPath();
            ctx.ellipse(3.8, 0, 5.2, 2.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Kafa kütlesi
            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.moveTo(-5.5, -4.8);
            ctx.quadraticCurveTo(0, -6.0, 6.8, -2.4);
            ctx.quadraticCurveTo(9.0, 0, 6.8, 2.4);
            ctx.quadraticCurveTo(0, 6.0, -5.5, 4.8);
            ctx.quadraticCurveTo(-4.2, 0, -5.5, -4.8);
            ctx.closePath();
            ctx.fill();

            // İki yanda gözler
            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath();
            ctx.arc(2.2, -4.2, 1.45, 0, Math.PI * 2);
            ctx.arc(2.2, 4.2, 1.45, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(1.8, -5.1, 0.7, 1.8);
            ctx.fillRect(1.8, 3.3, 0.7, 1.8);

            // Burun delikleri
            ctx.fillStyle = pal.dorsalDeep;
            ctx.beginPath();
            ctx.arc(6.0, -1.0, 0.65, 0, Math.PI * 2);
            ctx.arc(6.0, 1.0, 0.65, 0, Math.PI * 2);
            ctx.fill();

            if (isFlicking && tongueExt > 0) {
                drawForkedTongue(ctx, 8.2, 0, 0, tongueExt, tongueFlicker, pal);
            }
        } else {
            // view === 'back'
            ctx.rotate(angle);

            const hGrad = ctx.createRadialGradient(2, -1, 1, 0, 0, 9);
            hGrad.addColorStop(0, pal.dorsalLight);
            hGrad.addColorStop(0.55, pal.dorsalBase);
            hGrad.addColorStop(1, pal.dorsalDeep);

            ctx.fillStyle = hGrad;
            ctx.beginPath();
            ctx.moveTo(-5.5, -4.5);
            ctx.quadraticCurveTo(0, -5.8, 6.5, -2.2);
            ctx.quadraticCurveTo(8.5, 0, 6.5, 2.2);
            ctx.quadraticCurveTo(0, 5.8, -5.5, 4.5);
            ctx.quadraticCurveTo(-4.0, 0, -5.5, -4.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath();
            ctx.arc(1.8, -4.2, 1.3, 0, Math.PI * 2);
            ctx.arc(1.8, 4.2, 1.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(1.5, -5.0, 0.6, 1.6);
            ctx.fillRect(1.5, 3.4, 0.6, 1.6);

            ctx.fillStyle = pal.spotBlack;
            ctx.beginPath();
            ctx.moveTo(-4.5, -2.8);
            ctx.lineTo(-0.5, 0);
            ctx.lineTo(-4.5, 2.8);
            ctx.lineTo(-2.8, 0);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = pal.dorsalDeep;
            ctx.beginPath();
            ctx.arc(5.8, -1.0, 0.6, 0, Math.PI * 2);
            ctx.arc(5.8, 1.0, 0.6, 0, Math.PI * 2);
            ctx.fill();

            if (isFlicking && tongueExt > 0) {
                drawForkedTongue(ctx, 7.5, 0, 0, tongueExt, tongueFlicker, pal);
            }
        }

        ctx.restore();
    }

    // =========================================================================
    // YARDIMCI 4: TİTREŞİMLİ ÇATALLI DİL (YALNIZCA DİL - SSSS YAZISI KALDIRILDI)
    // =========================================================================
    function drawForkedTongue(ctx, tx, ty, angle, length, flicker, pal) {
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(angle);
        ctx.strokeStyle = pal.tongueRed;
        ctx.lineWidth = 1.35;
        ctx.lineCap = "round";

        // Dil kökü
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(length, flicker);
        ctx.stroke();

        // Çatallar
        ctx.beginPath();
        ctx.moveTo(length, flicker);
        ctx.lineTo(length + 4.2, flicker - 2.5);
        ctx.moveTo(length, flicker);
        ctx.lineTo(length + 4.2, flicker + 2.5);
        ctx.stroke();

        // NOT: Kullanıcı isteğiyle "Ssss~" yazısı tamamen kaldırılmıştır!
        ctx.restore();
    }


    const definition = {
        id: 'costume_anaconda',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawAnaconda(ctx, facing, isMoving, walkCycle, isSitting);
        },
        getNameTagOffset: () => -24
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_anaconda'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_anaconda', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
