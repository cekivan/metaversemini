// public/js/renderers/izbandutRenderer.js - 2.5D İzbandut Koruma 8 Yönlü Çizim Motoru
// Yeni NPC Standardı: Kaslı, heybetli, siyah takım elbiseli, güneş gözlüklü, kulaklıklı fedai
// Boyut: Normal karakterlerden tam %10 daha büyük (scale: 1.10)

(function(global) {
    'use strict';

    function normalizeFacing(f) {
        if (!f) return 'down';
        let str = String(f).toLowerCase().replace('_', '-').trim();
        const valid = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
        return valid.includes(str) ? str : 'down';
    }

    const IzbandutRenderer = {
        /**
         * Tekil bir İzbandut Korumayı çizer
         * @param {CanvasRenderingContext2D} ctx 
         * @param {Object} pet - Pet / Bodyguard verisi (facing, slotIndex, walkCycle, isMoving, vb.)
         * @param {number} x - Merkez x koordinatı
         * @param {number} y - Zemin ayak hizası y koordinatı
         * @param {number} now - Date.now()
         */
        draw(ctx, pet, x, y, now) {
            if (!ctx) return;
            const facing = normalizeFacing(pet.facing || pet.direction || 'down');
            const isMoving = !!(pet.isMoving);
            const walkCycle = pet.walkCycle || 0;
            const slotIndex = (typeof pet.slotIndex === 'number') ? pet.slotIndex : 0;

            // Normal karakterlerden tam %10 daha büyük
            const SCALE = 1.10;

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(SCALE, SCALE);

            // 1. ZEMİN KONTAK GÖLGELERİ (Dual-Layer Ground Anchor)
            // A) Yaygın yumuşak ortam gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
            ctx.beginPath();
            ctx.ellipse(0, 18, 17, 6.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // B) Çekirdek yere mıhlama gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
            ctx.beginPath();
            ctx.ellipse(0, 17, 11, 4.0, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. DİNAMİK ANİMASYON SALINIMLARI
            // Nefes alma (dururken hafif göğüs inip kalkması)
            const breathe = isMoving ? 0 : Math.sin(now / 480) * 0.9;
            // Yürüme bacak ve kol salınımı
            const legSwing = isMoving ? Math.sin(walkCycle) * 6.5 : 0;
            const armSwing = isMoving ? Math.sin(walkCycle) * 4.5 : 0;

            const isBack = (facing === 'up' || facing === 'up-right' || facing === 'up-left');
            const isSide = (facing === 'right' || facing === 'left');
            const isFront = (facing === 'down' || facing === 'down-right' || facing === 'down-left');
            const isLeft = (facing === 'left' || facing === 'up-left' || facing === 'down-left');

            // 3. AYAKLAR & KUNDURALAR (Parlak Siyah Oxford Deri Kundura)
            ctx.save();
            const shoeY = 16;
            let leftShoeX = -6;
            let rightShoeX = 6;
            let leftShoeY = shoeY;
            let rightShoeY = shoeY;

            if (isMoving) {
                leftShoeY += legSwing * 0.4;
                rightShoeY -= legSwing * 0.4;
            }

            // Kunduraları çiz
            function drawShoe(sx, sy, dir) {
                ctx.save();
                ctx.fillStyle = "#09090b"; // Simsiyah deri
                ctx.beginPath();
                ctx.roundRect(sx - 3.5, sy - 2.5, 7.5, 5, [2, 3, 2, 2]);
                ctx.fill();
                // Taban dikişi
                ctx.fillStyle = "#18181b";
                ctx.fillRect(sx - 3.5, sy + 1.5, 7.5, 1.2);
                // Deri parlama ışıltısı
                ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                ctx.fillRect(sx - 1.5, sy - 2.0, 3, 1.2);
                ctx.restore();
            }

            if (isSide) {
                // Yan görünümde tek önde tek arkada ayak
                drawShoe(isLeft ? -4 : 4, shoeY + legSwing * 0.4, isLeft ? -1 : 1);
            } else {
                drawShoe(leftShoeX, leftShoeY, -1);
                drawShoe(rightShoeX, rightShoeY, 1);
            }
            ctx.restore();

            // 4. BACAKLAR & PANTOLON (Siyah Ütülü Takım Elbise Pantolonu)
            ctx.save();
            ctx.fillStyle = "#18181b"; // Premium koyu takım kumaşı
            if (isSide) {
                // Yan görünüm tek bacak profili
                ctx.beginPath();
                ctx.roundRect(isLeft ? -5.5 : -1.5, 2, 7.5, 14, 2);
                ctx.fill();
                // Pantolon ütü çizgisi
                ctx.strokeStyle = "#27272a";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(isLeft ? -2 : 2, 3);
                ctx.lineTo(isLeft ? -2 : 2, 14);
                ctx.stroke();
            } else {
                // İki bacak
                // Sol Bacak
                ctx.beginPath();
                ctx.roundRect(-8.5, 2, 6.5, 14, 2);
                ctx.fill();
                // Sağ Bacak
                ctx.beginPath();
                ctx.roundRect(2.0, 2, 6.5, 14, 2);
                ctx.fill();
                // Ütü dikişleri
                ctx.strokeStyle = "#27272a";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(-5.2, 3);
                ctx.lineTo(-5.2, 14);
                ctx.moveTo(5.2, 3);
                ctx.lineTo(5.2, 14);
                ctx.stroke();
            }
            ctx.restore();

            // 5. KEMER & KEMER TOKASI
            ctx.fillStyle = "#09090b";
            ctx.fillRect(-7.5, 0.5, 15, 2.2);
            if (!isBack) {
                // Gümüş kemer tokası
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-2, 0.2, 4, 2.8);
                ctx.fillStyle = "#09090b";
                ctx.fillRect(-1, 0.8, 2, 1.6);
            }

            // 6. GÖVDE: HEYBETLİ / KASLI TAKIM ELBİSE CEKETİ (V-Taper Muscular Silhouette)
            ctx.save();
            const torsoY = -14 + breathe;

            // Heybetli omuzlar: Genişlik 26px (Normal karaktere göre belirgin şekilde geniş ve kaslı)
            ctx.fillStyle = "#09090b"; // Derin siyah ceket
            ctx.beginPath();
            ctx.moveTo(-13, torsoY); // Sol omuz başı
            ctx.lineTo(13, torsoY);  // Sağ omuz başı
            ctx.lineTo(8.5, 1.5);    // Sağ bel (V şeklinde incelen atletik fit)
            ctx.lineTo(-8.5, 1.5);   // Sol bel
            ctx.closePath();
            ctx.fill();

            // Ceket kenar konturu
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 0.8;
            ctx.stroke();

            if (isBack) {
                // ARKA GÖRÜNÜM:
                // Ceket sırt dikişi
                ctx.strokeStyle = "#1f2937";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(0, torsoY + 2);
                ctx.lineTo(0, 1.0);
                ctx.stroke();
                // Çift yırtmaç çizgileri
                ctx.beginPath();
                ctx.moveTo(-5, -2);
                ctx.lineTo(-5, 1.5);
                ctx.moveTo(5, -2);
                ctx.lineTo(5, 1.5);
                ctx.stroke();
                // Ense beyaz yaka kenarı
                ctx.fillStyle = "#f8fafc";
                ctx.fillRect(-3.5, torsoY - 0.5, 7, 2);
                // Ceket arka yaka bandı
                ctx.fillStyle = "#18181b";
                ctx.fillRect(-4.5, torsoY + 0.5, 9, 2);
            } else {
                // ÖN & YAN GÖRÜNÜM:
                // A) Beyaz Gömlek Üçgeni (Crisp White Dress Shirt V)
                ctx.fillStyle = "#f8fafc";
                ctx.beginPath();
                ctx.moveTo(-4.5, torsoY);
                ctx.lineTo(4.5, torsoY);
                ctx.lineTo(0, torsoY + 10);
                ctx.closePath();
                ctx.fill();

                // Gömlek Sivri Yakaları
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(-5, torsoY);
                ctx.lineTo(-2, torsoY + 4);
                ctx.lineTo(-1, torsoY);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(5, torsoY);
                ctx.lineTo(2, torsoY + 4);
                ctx.lineTo(1, torsoY);
                ctx.closePath();
                ctx.fill();

                // B) İnce Siyah İpek Kravat (Sleek Black Silk Tie)
                ctx.fillStyle = "#020617";
                ctx.beginPath();
                ctx.moveTo(-1.2, torsoY + 1);
                ctx.lineTo(1.2, torsoY + 1);
                ctx.lineTo(1.6, torsoY + 9);
                ctx.lineTo(0, torsoY + 11.5);
                ctx.lineTo(-1.6, torsoY + 9);
                ctx.closePath();
                ctx.fill();

                // Kravat İğnesi (Gold Metallic Tie Clip)
                ctx.fillStyle = "#facc15";
                ctx.fillRect(-1.4, torsoY + 5.5, 2.8, 0.9);

                // C) Ceket Sivri Klapaları (Peaked Lapels)
                ctx.fillStyle = "#18181b";
                // Sol klapa
                ctx.beginPath();
                ctx.moveTo(-11, torsoY + 1);
                ctx.lineTo(-3.5, torsoY + 7);
                ctx.lineTo(-1.5, torsoY + 11);
                ctx.lineTo(-7.5, torsoY + 6);
                ctx.closePath();
                ctx.fill();
                // Sağ klapa
                ctx.beginPath();
                ctx.moveTo(11, torsoY + 1);
                ctx.lineTo(3.5, torsoY + 7);
                ctx.lineTo(1.5, torsoY + 11);
                ctx.lineTo(7.5, torsoY + 6);
                ctx.closePath();
                ctx.fill();

                // D) Ceket Düğmeleri
                ctx.fillStyle = "#27272a";
                ctx.beginPath();
                ctx.arc(0, torsoY + 12.5, 0.9, 0, Math.PI * 2);
                ctx.arc(0, torsoY + 14.5, 0.9, 0, Math.PI * 2);
                ctx.fill();

                // E) Sol Göğüs Cebi & Beyaz İpek Mendil (Pocket Square)
                if (facing !== 'right') {
                    ctx.fillStyle = "#09090b";
                    ctx.fillRect(-9, torsoY + 4.5, 4.5, 1.2);
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(-8.2, torsoY + 3.8, 3.0, 0.9);
                }
            }
            ctx.restore();

            // 7. KOLLAR & ELLER (Kaslı Pazular & Siyah Kol Dikişleri)
            ctx.save();
            const armY = -13 + breathe;

            function drawArm(isLeftArm) {
                ctx.save();
                const shoulderX = isLeftArm ? -13 : 13;
                const swing = isLeftArm ? armSwing : -armSwing;
                ctx.translate(shoulderX, armY);
                ctx.rotate((swing * Math.PI) / 180);

                // Pazı & Kol
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                ctx.roundRect(isLeftArm ? -2.5 : -1.5, 0, 4.2, 13, 2);
                ctx.fill();

                // Beyaz gömlek manşet ucu
                ctx.fillStyle = "#f8fafc";
                ctx.fillRect(isLeftArm ? -2.2 : -1.2, 12, 3.6, 1.2);

                // El (Güçlü yumruk / hazır duruş)
                ctx.fillStyle = "#ffd1a4";
                ctx.beginPath();
                ctx.arc(isLeftArm ? -0.4 : 0.6, 15, 2.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }

            if (isSide) {
                drawArm(isLeft);
            } else {
                drawArm(true);
                drawArm(false);
            }
            ctx.restore();

            // 8. BOYUN & KAFA (Güçlü Çene, Saç Kesimi, Kulaklık & Güneş Gözlüğü)
            ctx.save();
            const headY = -21 + breathe;

            // Güçlü Boyun
            ctx.fillStyle = "#ffd1a4";
            ctx.fillRect(-3.2, headY + 4, 6.4, 4);

            // Baş Ovalleri
            ctx.beginPath();
            ctx.ellipse(0, headY, 7.5, 8.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Saç Kesimi (Kısa Karizmatik Asker / Fade Tıraş)
            ctx.fillStyle = "#18181b";
            ctx.beginPath();
            if (isBack) {
                // Arkadan kafa: Saç tüm tepeyi ve enseyi kaplar
                ctx.arc(0, headY - 1, 7.8, Math.PI * 0.85, Math.PI * 2.15, false);
                ctx.lineTo(7.2, headY + 4);
                ctx.lineTo(-7.2, headY + 4);
                ctx.closePath();
                ctx.fill();
                // Ense traş çizgisi
                ctx.fillStyle = "#27272a";
                ctx.fillRect(-4.5, headY + 3.5, 9, 1.5);
            } else {
                // Önden ve yandan: Tepe saçı ve yanlarda temiz fade
                ctx.arc(0, headY - 2, 7.6, Math.PI * 0.9, Math.PI * 2.1, false);
                ctx.lineTo(7.2, headY - 2);
                ctx.quadraticCurveTo(0, headY - 5, -7.2, headY - 2);
                ctx.closePath();
                ctx.fill();
            }

            // GÜNEŞ GÖZLÜĞÜ & ÇENE (Yalnızca Önden & Yandan)
            if (!isBack) {
                // A) Köşeli Maskülen Çene & Sakal Gölgesi (5 o'clock shadow)
                ctx.fillStyle = "rgba(63, 32, 16, 0.25)";
                ctx.beginPath();
                ctx.arc(0, headY + 3.5, 5.0, 0.1, Math.PI - 0.1);
                ctx.fill();

                // Sert dudak çizgisi
                ctx.strokeStyle = "#78350f";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-2, headY + 5.5);
                ctx.lineTo(2, headY + 5.5);
                ctx.stroke();

                // B) VIP SİYAH DİKDÖRTGEN GÜNEŞ GÖZLÜĞÜ (Matrix / Secret Service)
                ctx.fillStyle = "#020617";
                if (facing === 'down') {
                    // İki cam & burun köprüsü
                    ctx.beginPath();
                    ctx.roundRect(-6.5, headY - 2.5, 5.4, 4.0, 1.0);
                    ctx.roundRect(1.1, headY - 2.5, 5.4, 4.0, 1.0);
                    ctx.fill();
                    // Burun köprüsü
                    ctx.fillRect(-1.5, headY - 1.5, 3.0, 1.2);
                    // Cam üzeri beyaz parıltı (specular glare)
                    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                    ctx.beginPath();
                    ctx.moveTo(-5.5, headY - 1.8);
                    ctx.lineTo(-3.5, headY - 1.8);
                    ctx.lineTo(-4.5, headY + 0.8);
                    ctx.closePath();
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(2.0, headY - 1.8);
                    ctx.lineTo(4.0, headY - 1.8);
                    ctx.lineTo(3.0, headY + 0.8);
                    ctx.closePath();
                    ctx.fill();
                } else if (facing === 'down-right' || facing === 'right') {
                    // Sağa doğru açılı tek veya iki cam
                    ctx.beginPath();
                    ctx.roundRect(-1.0, headY - 2.5, 6.5, 4.0, 1.0);
                    ctx.fill();
                    // Gözlük sapı
                    ctx.strokeStyle = "#020617";
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.moveTo(4.5, headY - 1.5);
                    ctx.lineTo(7.5, headY - 1.0);
                    ctx.stroke();
                    // Yansıma
                    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                    ctx.fillRect(1.0, headY - 1.8, 2.5, 1.2);
                } else {
                    // Sola doğru açılı tek veya iki cam
                    ctx.beginPath();
                    ctx.roundRect(-5.5, headY - 2.5, 6.5, 4.0, 1.0);
                    ctx.fill();
                    // Gözlük sapı
                    ctx.strokeStyle = "#020617";
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.moveTo(-4.5, headY - 1.5);
                    ctx.lineTo(-7.5, headY - 1.0);
                    ctx.stroke();
                    // Yansıma
                    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                    ctx.fillRect(-3.5, headY - 1.8, 2.5, 1.2);
                }
            }

            // 9. SECRET SERVICE SPIRAL AKUSTİK KULAKLIK (Coiled Earpiece Cable)
            // Kulağın arkasından boyuna ve ceket yakasına inen şeffaf spiral kablo
            ctx.save();
            const earX = (isLeft) ? -6.8 : 6.8;
            const earY = headY;

            // Kulak içi akustik parça
            ctx.fillStyle = "#e2e8f0";
            ctx.beginPath();
            ctx.arc(earX, earY, 1.3, 0, Math.PI * 2);
            ctx.fill();

            // Spiral kıvrımlı kablo
            ctx.strokeStyle = "rgba(226, 232, 240, 0.9)";
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(earX, earY);
            // Kulağın arkasından aşağı doğru helezon
            let step = isLeft ? 1 : -1;
            ctx.lineTo(earX + step * 0.5, earY + 2.5);
            ctx.lineTo(earX - step * 0.5, earY + 4.5);
            ctx.lineTo(earX + step * 0.5, earY + 6.5);
            ctx.lineTo(earX - step * 1.5, earY + 9.0);
            ctx.stroke();

            // Ceket klapasına tutturulan mini telsiz mandalı (Lapel clip)
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(earX - step * 2.2, earY + 8.5, 1.8, 1.2);
            ctx.restore();

            ctx.restore(); // Baş restore

            // 10. İZBANDUT KORUMA VIP İSİM ETİKETİ (Yalnızca pet.showLabel istendiğinde)
            if (pet && pet.showLabel) {
                const tagY = -36 + breathe;
                ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
                ctx.beginPath();
                ctx.roundRect(-38, tagY, 76, 13, 4);
                ctx.fill();
                ctx.strokeStyle = "#eab308";
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.fillStyle = "#facc15";
                ctx.font = "bold 8.5px sans-serif";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const slotSuffix = slotIndex > 0 ? ` #${slotIndex + 1}` : '';
                ctx.fillText(`🕶️ İzbandut${slotSuffix}`, 0, tagY + 6.8);
            }

            ctx.restore();
        }
    };

    global.IzbandutRenderer = IzbandutRenderer;
})(typeof window !== 'undefined' ? window : this);
