// public/js/renderers/costumes/spiderCostume.js - 🕷️ Karadul Örümcek Kostümü
(function () {
    // 4. 🕷️ 2.5D İZOMETRİK 8 YÖNLÜ KARADUL ÖRÜMCEK (costume_spider)
    // 8 Eklemli Boğumlu Bacak, Parlak Obsidian Kiti Gövde & Parlayan Kırmızı Kum Saati
    // =========================================================================
    function drawSpider(ctx, facing, isMoving, walkCycle) {
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
        const breath = Math.sin(time / 450) * 0.03;
        const twitch = Math.sin(time / 180) * 0.15;
        const hourglassPulse = 0.85 + Math.sin(time / 320) * 0.15;

        // Kinematics: 8 Bacak Yürüyüş Dalgası (Alternating Octopod Gait)
        const stride = isMoving ? walkCycle * 2.2 : 0;

        ctx.save();
        ctx.scale(mirror * 1.25, 1.25);

        // 1. ZEMİN GÖLGESİ (Gerçekçi Katmanlı Ambient Occlusion)
        ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
        ctx.beginPath();
        ctx.ellipse(0, 2, 25, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(0, 1, 15, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Renk Paleti (Obsidian Black Widow)
        const cChitinDark = "#050507";
        const cChitinBase = "#121217";
        const cChitinLight = "#272730";
        const cChitinHigh = "#3f3f4e";
        const cCrimsonCore = "#ef4444";
        const cCrimsonDeep = "#991b1b";

        // Yardımcı Fonksiyon: 3 Eklemli Boğumlu Örümcek Bacağı Çizimi
        function drawSpiderLeg(rootX, rootY, kneeX, kneeY, tipX, tipY, isForeground, legThickness) {
            ctx.save();
            // Bacak zemin temas gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            ctx.beginPath();
            ctx.ellipse(tipX, tipY + 1, 2.5, 1.2, 0, 0, Math.PI * 2);
            ctx.fill();

            const strokeColor = isForeground ? cChitinBase : cChitinDark;

            // 1. Segment: Femur (Gövdeden Yüksek Dize)
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = legThickness || (isForeground ? 2.5 : 2.0);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            ctx.beginPath();
            ctx.moveTo(rootX, rootY);
            ctx.quadraticCurveTo((rootX + kneeX) * 0.5 - 2, Math.min(rootY, kneeY) - 3, kneeX, kneeY);
            ctx.stroke();

            // Diz Boğum Halkası (Patella Knuckle)
            ctx.fillStyle = isForeground ? cChitinHigh : cChitinLight;
            ctx.beginPath();
            ctx.arc(kneeX, kneeY, isForeground ? 2.2 : 1.7, 0, Math.PI * 2);
            ctx.fill();

            // 2. Segment: Tibia ve Tarsus (Dizden Yere)
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = (legThickness ? legThickness * 0.8 : (isForeground ? 2.0 : 1.5));
            ctx.beginPath();
            ctx.moveTo(kneeX, kneeY);
            ctx.quadraticCurveTo(kneeX + (tipX - kneeX) * 0.4 + 2, (kneeY + tipY) * 0.5 - 1, tipX, tipY);
            ctx.stroke();

            // İnce pençe ucu (Tarsal Claw)
            ctx.fillStyle = cCrimsonDeep;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 1.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        // =====================================================================
        // GÖRÜNÜM 1: FRONT (down - Tam Ön Görünüm)
        // =====================================================================
        if (view === 'front') {
            const pL1 = Math.sin(stride + 0.0) * 5;
            const pL2 = Math.sin(stride + 1.6) * 5;
            const pL3 = Math.sin(stride + 3.2) * 5;
            const pL4 = Math.sin(stride + 4.8) * 5;

            const pR1 = Math.sin(stride + 3.2) * 5;
            const pR2 = Math.sin(stride + 4.8) * 5;
            const pR3 = Math.sin(stride + 0.0) * 5;
            const pR4 = Math.sin(stride + 1.6) * 5;

            // Arka Bacaklar
            drawSpiderLeg(-6, -11, -22, -26 + pL4 * 0.7, -32, 2 + pL4, false, 2.2);
            drawSpiderLeg(6, -11, 22, -26 + pR4 * 0.7, 32, 2 + pR4, false, 2.2);

            drawSpiderLeg(-5, -10, -25, -23 + pL3 * 0.7, -30, 4 + pL3, false, 2.3);
            drawSpiderLeg(5, -10, 25, -23 + pR3 * 0.7, 30, 4 + pR3, false, 2.3);

            // B) ABDOMEN (Arka Yuvarlak Gövde)
            ctx.save();
            const abdY = -18 + breath * 10;
            const abdGrad = ctx.createRadialGradient(-3, abdY - 4, 3, 0, abdY, 16);
            abdGrad.addColorStop(0, "#2c2c36");
            abdGrad.addColorStop(0.35, cChitinLight);
            abdGrad.addColorStop(0.75, cChitinBase);
            abdGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = abdGrad;
            ctx.beginPath();
            ctx.ellipse(0, abdY, 15, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Abdomen Işık Parıltısı
            ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(-4, abdY - 5, 8, Math.PI * 1.05, Math.PI * 1.6);
            ctx.stroke();

            // Parlayan Kırmızı Kum Saati
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 8 * hourglassPulse;
            ctx.fillStyle = cCrimsonCore;
            ctx.beginPath();
            ctx.moveTo(-5, abdY - 6);
            ctx.lineTo(5, abdY - 6);
            ctx.lineTo(0, abdY - 1);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(0, abdY - 1);
            ctx.lineTo(5, abdY + 5);
            ctx.lineTo(-5, abdY + 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#fca5a5";
            ctx.beginPath();
            ctx.arc(0, abdY - 1, 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // C) CEPHALOTHORAX (Ön Baş ve Gövde Kalkanı)
            const thxGrad = ctx.createRadialGradient(0, -9, 2, 0, -8, 9);
            thxGrad.addColorStop(0, cChitinHigh);
            thxGrad.addColorStop(0.5, cChitinBase);
            thxGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = thxGrad;
            ctx.beginPath();
            ctx.ellipse(0, -8, 8.5, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#09090b";
            ctx.lineWidth = 1;
            ctx.stroke();

            // D) ÖN 4 BACAK
            drawSpiderLeg(-4, -8, -26, -18 + pL2 * 0.8, -26, 6 + pL2, true, 2.5);
            drawSpiderLeg(4, -8, 26, -18 + pR2 * 0.8, 26, 6 + pR2, true, 2.5);

            drawSpiderLeg(-3, -6, -20, -13 + pL1 * 0.8, -17, 7 + pL1, true, 2.6);
            drawSpiderLeg(3, -6, 20, -13 + pR1 * 0.8, 17, 7 + pR1, true, 2.6);

            // E) 8 ADET PARLAYAN YAKUT GÖZ
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 4;
            ctx.fillStyle = cCrimsonCore;
            [[-3.8, -11], [-1.3, -11.5], [1.3, -11.5], [3.8, -11]].forEach(([gx, gy]) => {
                ctx.beginPath(); ctx.arc(gx, gy, 1.1, 0, Math.PI * 2); ctx.fill();
            });
            [[-3.2, -9.2], [-1.1, -9.5], [1.1, -9.5], [3.2, -9.2]].forEach(([gx, gy]) => {
                ctx.beginPath(); ctx.arc(gx, gy, 1.3, 0, Math.PI * 2); ctx.fill();
            });
            ctx.fillStyle = "#ffffff";
            [[-1.1, -9.7], [1.1, -9.7]].forEach(([gx, gy]) => {
                ctx.beginPath(); ctx.arc(gx + 0.3, gy - 0.3, 0.45, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore();

            // F) KELİSERLER VE ZEHİR DİŞLERİ
            ctx.fillStyle = cChitinDark;
            ctx.beginPath();
            ctx.roundRect(-3.5, -6, 3, 5, [1, 1, 2, 2]);
            ctx.roundRect(0.5, -6, 3, 5, [1, 1, 2, 2]);
            ctx.fill();

            ctx.strokeStyle = cCrimsonCore;
            ctx.lineWidth = 1.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(-2.5, -1.5);
            ctx.lineTo(-1.2, 2.5);
            ctx.moveTo(2.5, -1.5);
            ctx.lineTo(1.2, 2.5);
            ctx.stroke();

            // G) PEDİPALPLER
            ctx.strokeStyle = cChitinBase;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(-3, -6);
            ctx.lineTo(-7, -2 + twitch * 2);
            ctx.lineTo(-5, 3 + twitch * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(3, -6);
            ctx.lineTo(7, -2 - twitch * 2);
            ctx.lineTo(5, 3 - twitch * 2);
            ctx.stroke();
        }

        // =====================================================================
        // GÖRÜNÜM 2: QUARTER-FRONT (down-right / down-left - 2.5D İzometrik Çapraz Ön)
        // =====================================================================
        else if (view === 'quarter-front') {
            const p1 = Math.sin(stride + 0.0) * 5;
            const p2 = Math.sin(stride + 1.5) * 5;
            const p3 = Math.sin(stride + 3.0) * 5;
            const p4 = Math.sin(stride + 4.5) * 5;

            // 1. Arka Plandaki Sol Bacaklar
            drawSpiderLeg(-9, -12, -22, -26 + p4 * 0.7, -30, -3 + p4, false, 1.8);
            drawSpiderLeg(-6, -11, -26, -23 + p3 * 0.7, -29, 0 + p3, false, 1.9);
            drawSpiderLeg(-2, -9, -24, -18 + p2 * 0.8, -23, 3 + p2, false, 2.0);
            drawSpiderLeg(2, -7, -18, -13 + p1 * 0.8, -15, 5 + p1, false, 2.1);

            // 2. ABDOMEN
            ctx.save();
            const abdX = -9;
            const abdY = -16 + breath * 8;
            const abdGrad = ctx.createRadialGradient(abdX - 3, abdY - 4, 3, abdX, abdY, 16);
            abdGrad.addColorStop(0, "#2d2d38");
            abdGrad.addColorStop(0.35, cChitinLight);
            abdGrad.addColorStop(0.75, cChitinBase);
            abdGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = abdGrad;
            ctx.beginPath();
            ctx.ellipse(abdX, abdY, 15, 13, -0.25, 0, Math.PI * 2);
            ctx.fill();

            // Abdomen Parlak Çizgisi
            ctx.strokeStyle = "rgba(255, 255, 255, 0.38)";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.arc(abdX - 4, abdY - 5, 8, Math.PI * 0.95, Math.PI * 1.55);
            ctx.stroke();

            // Kırmızı Kum Saati
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 8 * hourglassPulse;
            ctx.fillStyle = cCrimsonCore;
            ctx.beginPath();
            ctx.moveTo(abdX - 1, abdY - 6);
            ctx.lineTo(abdX + 6, abdY - 4);
            ctx.lineTo(abdX + 2, abdY - 1);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(abdX + 2, abdY - 1);
            ctx.lineTo(abdX + 6, abdY + 3);
            ctx.lineTo(abdX - 1, abdY + 3);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // 3. CEPHALOTHORAX
            const thxX = 4;
            const thxY = -8;
            const thxGrad = ctx.createRadialGradient(thxX + 1, thxY - 2, 2, thxX, thxY, 10);
            thxGrad.addColorStop(0, cChitinHigh);
            thxGrad.addColorStop(0.55, cChitinBase);
            thxGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = thxGrad;
            ctx.beginPath();
            ctx.ellipse(thxX, thxY, 9, 7.5, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // 4. Ön Plandaki Sağ Bacaklar
            drawSpiderLeg(2, -9, 8, -25 + p4 * 0.8, 14, 2 + p4, true, 2.4);
            drawSpiderLeg(4, -8, 19, -23 + p3 * 0.8, 26, 4 + p3, true, 2.5);
            drawSpiderLeg(6, -7, 24, -18 + p2 * 0.9, 28, 6 + p2, true, 2.6);
            drawSpiderLeg(9, -6, 21, -12 + p1 * 0.9, 22, 7 + p1, true, 2.7);

            // 5. Gözler
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 5;
            ctx.fillStyle = cCrimsonCore;
            [[7, -11], [9.5, -11.2], [11.8, -10.5], [8, -9], [10.5, -9.2], [12.6, -8.6]].forEach(([gx, gy]) => {
                ctx.beginPath(); ctx.arc(gx, gy, 1.2, 0, Math.PI * 2); ctx.fill();
            });
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(10.8, -9.5, 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            // 6. Zehir Dişleri & Pedipalp
            ctx.strokeStyle = cCrimsonCore;
            ctx.lineWidth = 1.6;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(11, -5);
            ctx.lineTo(13.5, -1.5);
            ctx.stroke();

            ctx.strokeStyle = cChitinLight;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(9, -5);
            ctx.lineTo(13, -3 + twitch * 2);
            ctx.lineTo(11, 2 + twitch * 2);
            ctx.stroke();
        }

        // =====================================================================
        // GÖRÜNÜM 3: SIDE (right / left - Tam Profil Görünüm)
        // =====================================================================
        else if (view === 'side') {
            const p1 = Math.sin(stride + 0.0) * 5;
            const p2 = Math.sin(stride + 1.6) * 5;
            const p3 = Math.sin(stride + 3.2) * 5;
            const p4 = Math.sin(stride + 4.8) * 5;

            // Arka plandaki bacaklar
            drawSpiderLeg(-8, -11, -18, -25 + p4, -24, 0 + p4, false, 1.8);
            drawSpiderLeg(-3, -10, -14, -22 + p3, -18, 3 + p3, false, 1.9);
            drawSpiderLeg(3, -9, 3, -18 + p2, 6, 5 + p2, false, 2.0);
            drawSpiderLeg(8, -8, 14, -13 + p1, 18, 6 + p1, false, 2.1);

            // Abdomen
            ctx.save();
            const abdX = -10;
            const abdY = -15 + breath * 7;
            const abdGrad = ctx.createRadialGradient(abdX - 4, abdY - 5, 3, abdX, abdY, 16);
            abdGrad.addColorStop(0, "#2c2c36");
            abdGrad.addColorStop(0.35, cChitinLight);
            abdGrad.addColorStop(0.75, cChitinBase);
            abdGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = abdGrad;
            ctx.beginPath();
            ctx.ellipse(abdX, abdY, 15, 12, -0.15, 0, Math.PI * 2);
            ctx.fill();

            // Abdomen Şık Highlight
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(abdX - 5, abdY - 5, 8, Math.PI * 0.9, Math.PI * 1.5);
            ctx.stroke();

            // Profil Kum Saati Şeridi
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 7 * hourglassPulse;
            ctx.fillStyle = cCrimsonCore;
            ctx.beginPath();
            ctx.ellipse(abdX + 3, abdY, 2.5, 5, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.restore();

            // Thorax
            const thxX = 6;
            const thxY = -9;
            const thxGrad = ctx.createRadialGradient(thxX, thxY - 2, 2, thxX, thxY, 9);
            thxGrad.addColorStop(0, cChitinHigh);
            thxGrad.addColorStop(0.5, cChitinBase);
            thxGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = thxGrad;
            ctx.beginPath();
            ctx.ellipse(thxX, thxY, 8.5, 6.5, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Ön Plandaki 4 Bacak
            drawSpiderLeg(-5, -10, -12, -26 + p4 * 0.9, -18, 2 + p4, true, 2.4);
            drawSpiderLeg(0, -9, 0, -23 + p3 * 0.9, 2, 4 + p3, true, 2.5);
            drawSpiderLeg(5, -8, 12, -19 + p2 * 0.9, 16, 6 + p2, true, 2.6);
            drawSpiderLeg(10, -7, 22, -13 + p1 * 0.9, 24, 7 + p1, true, 2.7);

            // Gözler
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 4;
            ctx.fillStyle = cCrimsonCore;
            [[10, -11.5], [12, -11], [11, -9.5], [13, -9]].forEach(([gx, gy]) => {
                ctx.beginPath(); ctx.arc(gx, gy, 1.2, 0, Math.PI * 2); ctx.fill();
            });
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(12.2, -9.2, 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.restore();

            // Zehir Dişi & Pedipalp
            ctx.strokeStyle = cCrimsonCore;
            ctx.lineWidth = 1.7;
            ctx.beginPath();
            ctx.moveTo(13, -6);
            ctx.lineTo(15, -2);
            ctx.stroke();

            ctx.strokeStyle = cChitinLight;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(12, -5);
            ctx.lineTo(15, -3 + twitch * 2);
            ctx.lineTo(14, 1 + twitch * 2);
            ctx.stroke();
        }

        // =====================================================================
        // GÖRÜNÜM 4: QUARTER-BACK (up-right / up-left - 2.5D İzometrik Çapraz Arka)
        // =====================================================================
        else if (view === 'quarter-back') {
            const p1 = Math.sin(stride + 0.0) * 5;
            const p2 = Math.sin(stride + 1.5) * 5;
            const p3 = Math.sin(stride + 3.0) * 5;
            const p4 = Math.sin(stride + 4.5) * 5;

            // Arka plandaki ön bacaklar
            drawSpiderLeg(3, -10, 16, -18 + p1 * 0.8, 20, -2 + p1, false, 1.9);
            drawSpiderLeg(1, -11, 20, -22 + p2 * 0.8, 24, 0 + p2, false, 2.0);

            // Baş / Thorax
            ctx.fillStyle = cChitinDark;
            ctx.beginPath();
            ctx.ellipse(5, -12, 7, 6, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // ABDOMEN
            ctx.save();
            const abdX = -4;
            const abdY = -14 + breath * 8;
            const abdGrad = ctx.createRadialGradient(abdX - 2, abdY - 4, 3, abdX, abdY, 17);
            abdGrad.addColorStop(0, "#33333f");
            abdGrad.addColorStop(0.35, cChitinLight);
            abdGrad.addColorStop(0.75, cChitinBase);
            abdGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = abdGrad;
            ctx.beginPath();
            ctx.ellipse(abdX, abdY, 16, 14.5, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // Abdomen Sırt Çizgisi
            ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(abdX - 3, abdY - 4, 9, Math.PI * 1.0, Math.PI * 1.6);
            ctx.stroke();

            // Arka Sırt Kırmızı Benekleri
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 6 * hourglassPulse;
            ctx.fillStyle = cCrimsonCore;
            [[-7, abdY - 2], [-4, abdY - 4], [-1, abdY - 5]].forEach(([bx, by]) => {
                ctx.beginPath(); ctx.ellipse(bx, by, 1.8, 2.8, -0.4, 0, Math.PI * 2); ctx.fill();
            });
            ctx.restore();
            ctx.restore();

            // Ön Plandaki Arka Bacaklar
            drawSpiderLeg(-6, -11, -18, -25 + p4 * 0.9, -24, 3 + p4, true, 2.5);
            drawSpiderLeg(-3, -12, -23, -22 + p3 * 0.9, -27, 5 + p3, true, 2.6);
            drawSpiderLeg(0, -11, -12, -18 + p2 * 0.9, -15, 6 + p2, true, 2.7);
            drawSpiderLeg(3, -10, 6, -14 + p1 * 0.9, 10, 7 + p1, true, 2.8);
        }

        // =====================================================================
        // GÖRÜNÜM 5: BACK (up - Tam Arka Görünüm)
        // =====================================================================
        else if (view === 'back') {
            const pL1 = Math.sin(stride + 0.0) * 5;
            const pL2 = Math.sin(stride + 1.6) * 5;
            const pL3 = Math.sin(stride + 3.2) * 5;
            const pL4 = Math.sin(stride + 4.8) * 5;

            const pR1 = Math.sin(stride + 3.2) * 5;
            const pR2 = Math.sin(stride + 4.8) * 5;
            const pR3 = Math.sin(stride + 0.0) * 5;
            const pR4 = Math.sin(stride + 1.6) * 5;

            // İleriye uzanan ön bacaklar
            drawSpiderLeg(-4, -13, -18, -20 + pL1 * 0.7, -22, -4 + pL1, false, 2.0);
            drawSpiderLeg(4, -13, 18, -20 + pR1 * 0.7, 22, -4 + pR1, false, 2.0);
            drawSpiderLeg(-5, -12, -24, -22 + pL2 * 0.8, -28, -2 + pL2, false, 2.1);
            drawSpiderLeg(5, -12, 24, -22 + pR2 * 0.8, 28, -2 + pR2, false, 2.1);

            // ABDOMEN
            ctx.save();
            const abdY = -15 + breath * 9;
            const abdGrad = ctx.createRadialGradient(-3, abdY - 4, 3, 0, abdY, 17);
            abdGrad.addColorStop(0, "#33333f");
            abdGrad.addColorStop(0.35, cChitinLight);
            abdGrad.addColorStop(0.75, cChitinBase);
            abdGrad.addColorStop(1, cChitinDark);
            ctx.fillStyle = abdGrad;
            ctx.beginPath();
            ctx.ellipse(0, abdY, 16.5, 15, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sırt Parlaklığı
            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(-4, abdY - 5, 8.5, Math.PI * 1.05, Math.PI * 1.6);
            ctx.stroke();

            // Sırt Orta Kırmızı Hat & İpek Bezi (Spinneret)
            ctx.save();
            ctx.shadowColor = cCrimsonCore;
            ctx.shadowBlur = 6 * hourglassPulse;
            ctx.fillStyle = cCrimsonCore;
            ctx.beginPath();
            ctx.moveTo(0, abdY - 7);
            ctx.lineTo(2.5, abdY);
            ctx.lineTo(0, abdY + 5);
            ctx.lineTo(-2.5, abdY);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // İpek Bezi (Spinnerets)
            ctx.fillStyle = "#1e1e24";
            ctx.beginPath();
            ctx.ellipse(-1.8, abdY + 14, 1.5, 2.2, 0.2, 0, Math.PI * 2);
            ctx.ellipse(1.8, abdY + 14, 1.5, 2.2, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Geriye doğru açılan arka bacaklar
            drawSpiderLeg(-6, -11, -25, -24 + pL3 * 0.9, -30, 3 + pL3, true, 2.5);
            drawSpiderLeg(6, -11, 25, -24 + pR3 * 0.9, 30, 3 + pR3, true, 2.5);
            drawSpiderLeg(-5, -10, -21, -26 + pL4 * 0.9, -26, 5 + pL4, true, 2.6);
            drawSpiderLeg(5, -10, 21, -26 + pR4 * 0.9, 26, 5 + pR4, true, 2.6);
        }

        ctx.restore();
    }

        // =========================================================================

    const definition = {
        id: 'costume_spider',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawSpider(ctx, facing, isMoving, walkCycle);
        },
        getNameTagOffset: () => -20
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_spider'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_spider', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
