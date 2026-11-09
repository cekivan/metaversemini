// public/js/renderers/renderPetShop.js
// 🐾 2.5D İZOMETRİK SEVİMLİ PATİLER PET SHOP İÇ MEKANI (1000 x 625)
// Dev Mercan Akvaryumu, Yavru Köpek/Kedi Oyun Bahçesi, Kedi Ağacı, Pet Spa/Kuaför, Raflar, Koltuklar & Veteriner Pamuk Hanım NPC

(function (window) {
    'use strict';

    const CANV_W = 1000;
    const CANV_H = 625;

    let petShopBgCache = null;

    /**
     * Statik Pet Shop İç Mekan Arka Planı (bgCache)
     */
    function renderStaticPetShopTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. DUVARLAR & ÜST CEPHE (Adaçayı Yeşili ve Doğal Ahşap Çıtalar)
        let wallGrad = bctx.createLinearGradient(0, 0, 0, 240);
        wallGrad.addColorStop(0, '#f0fdf4');
        wallGrad.addColorStop(0.7, '#dcfce7');
        wallGrad.addColorStop(1, '#bbf7d0');
        bctx.fillStyle = wallGrad;
        bctx.fillRect(0, 0, width, 240);

        // Tavan / Üst Duvar Ambient Occlusion Gölgelendirmesi
        let ceilingShadow = bctx.createLinearGradient(0, 0, 0, 45);
        ceilingShadow.addColorStop(0, "rgba(0, 0, 0, 0.12)");
        ceilingShadow.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        bctx.fillStyle = ceilingShadow;
        bctx.fillRect(0, 0, width, 45);

        // Ahşap Akustik Dikey Çıtalar
        bctx.strokeStyle = "rgba(180, 83, 9, 0.15)";
        bctx.lineWidth = 1.5;
        for (let x = 15; x < width - 15; x += 18) {
            bctx.beginPath();
            bctx.moveTo(x, 0);
            bctx.lineTo(x, 215);
            bctx.stroke();
        }

        // Dekoratif Duvar Pati İkonları
        bctx.fillStyle = "rgba(34, 197, 94, 0.22)";
        for (let x = 60; x < width; x += 160) {
            drawWallPawPrint(bctx, x, 75, 14);
        }

        // Duvar Üst Süpürgelik Gölgesi (Ambient Occlusion)
        let wallBaseShadow = bctx.createLinearGradient(0, 202, 0, 215);
        wallBaseShadow.addColorStop(0, "rgba(0, 0, 0, 0.0)");
        wallBaseShadow.addColorStop(1, "rgba(0, 0, 0, 0.08)");
        bctx.fillStyle = wallBaseShadow;
        bctx.fillRect(0, 202, width, 13);

        // Duvar Süpürgeliği (Baseboard)
        bctx.fillStyle = "#854d0e";
        bctx.fillRect(0, 215, width, 14);
        bctx.fillStyle = "#713f12";
        bctx.fillRect(0, 227, width, 2);

        // Süpürgelik Altı Zemin Temas Gölgesi (Floor AO)
        let floorAoShadow = bctx.createLinearGradient(0, 229, 0, 245);
        floorAoShadow.addColorStop(0, "rgba(0, 0, 0, 0.20)");
        floorAoShadow.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        bctx.fillStyle = floorAoShadow;
        bctx.fillRect(0, 229, width, 16);

        // 2. ZEMİN (Açık İskandinav Meşe Parkesi & Pastel Oyun Karoları)
        let floorGrad = bctx.createLinearGradient(0, 229, 0, height);
        floorGrad.addColorStop(0, '#fef3c7');
        floorGrad.addColorStop(0.5, '#fde68a');
        floorGrad.addColorStop(1, '#fcd34d');
        bctx.fillStyle = floorGrad;
        bctx.fillRect(0, 229, width, height - 229);

        // Parke Derz Çizgileri
        bctx.strokeStyle = "rgba(180, 83, 9, 0.18)";
        bctx.lineWidth = 1.0;
        for (let y = 230; y < height; y += 28) {
            bctx.beginPath();
            bctx.moveTo(0, y);
            bctx.lineTo(width, y);
            bctx.stroke();
        }
        for (let y = 230; y < height; y += 28) {
            const offset = (Math.floor((y - 230) / 28) % 2 === 0) ? 0 : 50;
            for (let x = offset; x < width; x += 100) {
                bctx.beginPath();
                bctx.moveTo(x, y);
                bctx.lineTo(x, y + 28);
                bctx.stroke();
            }
        }

        // 3. DOĞAL IŞIK HÜZMELERİ (Tavan Pencerelerinden Süzülen Güneş Işığı)
        bctx.fillStyle = "rgba(255, 255, 255, 0.14)";
        for (let i = 0; i < 4; i++) {
            bctx.beginPath();
            bctx.moveTo(140 + i * 210, 0);
            bctx.lineTo(240 + i * 220, 0);
            bctx.lineTo(340 + i * 220, 320);
            bctx.lineTo(190 + i * 210, 320);
            bctx.closePath();
            bctx.fill();
        }

        // 4. ARKA DUVAR RAF SİSTEMİ (Mama Paketleri, Ödül Kutuları, Oyuncaklar)
        drawStaticPetShelves(bctx, 270, 75, 460, 140);

        // 5. GİRİŞ KAPISI ZEMİN PASPASI (Altın Saçaklı & Bordürlü Welcome Mat)
        const matX = 350, matY = height - 44, matW = 300, matH = 44;
        bctx.fillStyle = "#1e293b";
        bctx.beginPath();
        bctx.roundRect(matX, matY, matW, matH, [12, 12, 0, 0]);
        bctx.fill();

        // Çift Katmanlı Altın Bordür
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 2.5;
        bctx.stroke();
        bctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
        bctx.lineWidth = 1;
        bctx.strokeRect(matX + 4, matY + 4, matW - 8, matH - 8);

        // Altın Püsküller (Decorative Gold Fringe)
        bctx.fillStyle = "#eab308";
        for (let fx = matX + 8; fx < matX + matW - 8; fx += 8) {
            bctx.fillRect(fx, matY + 1, 3.5, 3);
        }

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 12px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🐾 HOŞ GELDİNİZ • SEVİMLİ PATİLER • ÇIKIŞ", 500, height - 16);
    }

    /**
     * Dekoratif Pati İzi Çizici
     */
    function drawWallPawPrint(ctx, cx, cy, size) {
        ctx.beginPath();
        // Ana avuç yastığı
        ctx.ellipse(cx, cy + size * 0.2, size * 0.45, size * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        // 4 Minik parmak yastığı
        const toes = [
            { x: -0.32, y: -0.25, r: 0.16 },
            { x: -0.12, y: -0.42, r: 0.17 },
            { x: 0.12, y: -0.42, r: 0.17 },
            { x: 0.32, y: -0.25, r: 0.16 }
        ];
        toes.forEach(t => {
            ctx.beginPath();
            ctx.arc(cx + t.x * size, cy + t.y * size, size * t.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Arka Duvar Rafları (Organik Butik Mama Paketleri, Ödül Kavanozları, Peluş Oyuncaklar & Bakım Ürünleri)
     */
    function drawStaticPetShelves(ctx, rx, ry, rw, rh) {
        ctx.save();

        // 1. Duvara Bıraktığı Yumuşak Ambiyans Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        ctx.beginPath();
        ctx.roundRect(rx - 3, ry - 3, rw + 6, rh + 8, 8);
        ctx.fill();

        // 2. Masif İskandinav Meşe Dolap Gövdesi
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.roundRect(rx, ry, rw, rh, 6);
        ctx.fill();

        // Üst Saçak / Taç Çıtası (Crown Molding)
        ctx.fillStyle = "#92400e";
        ctx.fillRect(rx - 4, ry - 3, rw + 8, 7);
        ctx.fillStyle = "#b45309";
        ctx.fillRect(rx - 4, ry - 3, rw + 8, 2);

        // Koyu Sıcak Ahşap Arka Panel
        ctx.fillStyle = "#451a03";
        ctx.fillRect(rx + 6, ry + 5, rw - 12, rh - 10);

        // Dolap İçi Derinlik Gölgeleri (Vignette)
        let innerShadow = ctx.createLinearGradient(rx + 6, ry + 5, rx + 6, ry + 25);
        innerShadow.addColorStop(0, "rgba(0,0,0,0.45)");
        innerShadow.addColorStop(1, "rgba(0,0,0,0.0)");
        ctx.fillStyle = innerShadow;
        ctx.fillRect(rx + 6, ry + 5, rw - 12, 20);

        // 3 Katlı Ahşap Raf Tablaları
        const shelfLevels = [ry + 46, ry + 92, ry + 134];
        shelfLevels.forEach(sy => {
            // Rafın üst aydınlık vurgusu
            ctx.fillStyle = "#d97706";
            ctx.fillRect(rx + 6, sy, rw - 12, 1.5);
            // Rafın kalın ahşap ön profili
            ctx.fillStyle = "#b45309";
            ctx.fillRect(rx + 6, sy + 1.5, rw - 12, 5.5);
            // Alt gölge
            ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            ctx.fillRect(rx + 6, sy + 7, rw - 12, 3);
        });

        // -----------------------------------------------------------------
        // KAT 1: ÜST RAF (Butik Kavisli Mama Torbaları & Çantaları)
        // -----------------------------------------------------------------
        const bags = [
            { w: 34, h: 32, col: '#1e3a8a', trim: '#fbbf24', stamp: 'paw', label: 'PUPPY' },
            { w: 30, h: 29, col: '#065f46', trim: '#a7f3d0', stamp: 'fish', label: 'CAT' },
            { w: 36, h: 33, col: '#c2410c', trim: '#fed7aa', stamp: 'bone', label: 'BEEF' },
            { w: 32, h: 30, col: '#6b21a8', trim: '#f5d0fe', stamp: 'paw', label: 'LAMB' },
            { w: 38, h: 34, col: '#b45309', trim: '#fef08a', stamp: 'bone', label: 'GOLD' },
            { w: 29, h: 28, col: '#be185d', trim: '#fce7f3', stamp: 'fish', label: 'SALMON' },
            { w: 33, h: 31, col: '#0284c7', trim: '#bae6fd', stamp: 'fish', label: 'TUNA' },
            { w: 31, h: 29, col: '#15803d', trim: '#bbf7d0', stamp: 'paw', label: 'VEG' },
            { w: 36, h: 32, col: '#991b1b', trim: '#fecaca', stamp: 'bone', label: 'DUCK' },
            { w: 33, h: 30, col: '#334155', trim: '#e2e8f0', stamp: 'heart', label: 'CARE' }
        ];

        let curBx = rx + 18;
        for (let i = 0; i < bags.length; i++) {
            const b = bags[i];
            const by = ry + 46;
            drawShelvedPetFoodBag(ctx, curBx, by, b.w, b.h, b.col, b.trim, b.stamp, b.label);
            curBx += b.w + 9;
        }

        // -----------------------------------------------------------------
        // KAT 2: ORTA RAF (Şeffaf Cam Ödül Kavanozları, Vitaminler & Ödül Kutuları)
        // -----------------------------------------------------------------
        const midY = ry + 92;
        let curMx = rx + 16;

        // 1. Cam Kavanoz (Kemik Kurabiyeler)
        drawGlassTreatJar(ctx, curMx, midY, 28, 28, 'bone', '#d97706');
        curMx += 36;

        // 2. Zümrüt Yeşil Vitamin Şişesi (Omega 3)
        drawApothecaryBottle(ctx, curMx, midY, 18, 27, '#065f46', '#ffffff', 'leaf');
        curMx += 26;

        // 3. Cam Kavanoz (Yıldız Bisküviler)
        drawGlassTreatJar(ctx, curMx, midY, 26, 26, 'star', '#facc15');
        curMx += 34;

        // 4. Kırmızı Metal Ödül Tenekesi
        drawTreatTinCan(ctx, curMx, midY, 24, 25, '#dc2626', '#ffffff', '#facc15');
        curMx += 32;

        // 5. Amber İlaç Şişesi (Damla Tıpası)
        drawApothecaryBottle(ctx, curMx, midY, 17, 26, '#b45309', '#0f172a', 'cross');
        curMx += 25;

        // 6. Ahşap Çiğneme Çubuğu Sepeti (Dental Sticks)
        drawDentalStickBasket(ctx, curMx, midY, 32, 22);
        curMx += 40;

        // 7. Kobalt Mavi Damlalıklı Şişe
        drawApothecaryBottle(ctx, curMx, midY, 17, 26, '#1d4ed8', '#ffffff', 'drop');
        curMx += 25;

        // 8. Cam Kavanoz (Renkli Balık Krakerleri)
        drawGlassTreatJar(ctx, curMx, midY, 28, 28, 'fish', '#fb923c');
        curMx += 36;

        // 9. Mor Gurme Ödül Kutusu (Altın Kurdeleli)
        drawGourmetBox(ctx, curMx, midY, 26, 25, '#7e22ce', '#fbbf24');
        curMx += 34;

        // 10. Cam Kavanoz (Kalp Bisküviler)
        drawGlassTreatJar(ctx, curMx, midY, 26, 26, 'heart', '#f43f5e');
        curMx += 34;

        // 11. Turkuaz Krem Kavanozu
        drawApothecaryBottle(ctx, curMx, midY, 20, 24, '#0891b2', '#f8fafc', 'heart');

        // -----------------------------------------------------------------
        // KAT 3: ALT RAF (Peluş Oyuncaklar, İp Düğümleri & Bakım Ürünleri)
        // -----------------------------------------------------------------
        const botY = ry + 134;
        let curBx3 = rx + 18;

        // 1. Sarı Peluş Vakvak Ördek
        drawPlushDuck(ctx, curBx3 + 12, botY);
        curBx3 += 38;

        // 2. Kırmızı Peluş Kemik Yastık
        drawPlushBone(ctx, curBx3 + 14, botY);
        curBx3 += 38;

        // 3. Mavi-Sarı Örgülü Çekiştirme Halatı (Rope Toy)
        drawBraidedRopeToy(ctx, curBx3 + 18, botY);
        curBx3 += 46;

        // 4. Şık Beyaz Pompalı Pet Şampuanı
        drawShampooPumpBottle(ctx, curBx3, botY, 18, 28, '#f8fafc', '#facc15', 'SHAMP');
        curBx3 += 26;

        // 5. Turkuaz Tüy Bakım Spreyi
        drawShampooPumpBottle(ctx, curBx3, botY, 16, 26, '#a7f3d0', '#047857', 'SPRAY');
        curBx3 += 24;

        // 6. Ahşap Saplı Doğal Kıl Tüy Tarağı
        drawWoodenPetBrush(ctx, curBx3 + 16, botY);
        curBx3 += 40;

        // 7. Mavi Peluş Farecik
        drawPlushMouse(ctx, curBx3 + 12, botY);
        curBx3 += 36;

        // 8. Zıplayan Neon Tenis Topu
        drawTennisBallToy(ctx, curBx3 + 10, botY);
        curBx3 += 30;

        // 9. Çiftli Paslanmaz Mama & Su Kabı
        drawDoublePetBowl(ctx, curBx3 + 18, botY);
        curBx3 += 44;

        // 10. Mor Peluş Çıngıraklı Halka
        drawPlushDonutToy(ctx, curBx3 + 12, botY);

        ctx.restore();
    }

    /**
     * Butik Kavisli Mama Paketi Çizici
     */
    function drawShelvedPetFoodBag(ctx, bx, by, bw, bh, col, trim, emblem, label) {
        ctx.save();
        // Zemin gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, by + 0.5, bw * 0.44, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Kavisli torba gövdesi
        const topW = bw * 0.74;
        const topX = bx + (bw - topW) / 2;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(bx + 2, by);
        ctx.quadraticCurveTo(bx - 1, by - bh * 0.35, topX, by - bh);
        ctx.lineTo(topX + topW, by - bh);
        ctx.quadraticCurveTo(bx + bw + 1, by - bh * 0.35, bx + bw - 2, by);
        ctx.closePath();
        ctx.fill();

        // 3D Hacim Gölgelendirmesi
        let bagVol = ctx.createLinearGradient(bx, by, bx + bw, by);
        bagVol.addColorStop(0, "rgba(255, 255, 255, 0.22)");
        bagVol.addColorStop(0.25, "rgba(255, 255, 255, 0.0)");
        bagVol.addColorStop(0.7, "rgba(0, 0, 0, 0.0)");
        bagVol.addColorStop(1, "rgba(0, 0, 0, 0.32)");
        ctx.fillStyle = bagVol;
        ctx.beginPath();
        ctx.moveTo(bx + 2, by);
        ctx.quadraticCurveTo(bx - 1, by - bh * 0.35, topX, by - bh);
        ctx.lineTo(topX + topW, by - bh);
        ctx.quadraticCurveTo(bx + bw + 1, by - bh * 0.35, bx + bw - 2, by);
        ctx.closePath();
        ctx.fill();

        // Üst Tırtıklı Kapatma Şeridi (Crimped Seal)
        ctx.fillStyle = trim;
        ctx.fillRect(topX - 1, by - bh - 2, topW + 2, 4);
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        for (let c = topX + 2; c < topX + topW - 1; c += 3) {
            ctx.fillRect(c, by - bh - 2, 1, 4);
        }

        // Ön Etiket Bandı
        const lw = bw * 0.68;
        const lh = bh * 0.48;
        const lx = bx + (bw - lw) / 2;
        const ly = by - bh * 0.75;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 3);
        ctx.fill();
        ctx.strokeStyle = trim;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Alt Lezzet Çizgisi
        ctx.fillStyle = trim;
        ctx.fillRect(lx + 2, ly + lh - 5, lw - 4, 3);

        // Amblem İkonu (paw, bone, fish, heart)
        const emX = lx + lw / 2;
        const emY = ly + lh * 0.42;
        ctx.fillStyle = col;
        if (emblem === 'paw') {
            ctx.beginPath();
            ctx.arc(emX, emY + 1, 2.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(emX - 3.2, emY - 2.2, 1.1, 0, Math.PI * 2);
            ctx.arc(emX, emY - 3.6, 1.1, 0, Math.PI * 2);
            ctx.arc(emX + 3.2, emY - 2.2, 1.1, 0, Math.PI * 2);
            ctx.fill();
        } else if (emblem === 'bone') {
            ctx.fillRect(emX - 4, emY - 1, 8, 2.2);
            ctx.beginPath();
            ctx.arc(emX - 4, emY - 2, 1.3, 0, Math.PI * 2);
            ctx.arc(emX - 4, emY + 2, 1.3, 0, Math.PI * 2);
            ctx.arc(emX + 4, emY - 2, 1.3, 0, Math.PI * 2);
            ctx.arc(emX + 4, emY + 2, 1.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (emblem === 'fish') {
            ctx.beginPath();
            ctx.ellipse(emX, emY, 4, 2.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(emX - 3.5, emY);
            ctx.lineTo(emX - 6.5, emY - 2.5);
            ctx.lineTo(emX - 6.5, emY + 2.5);
            ctx.closePath();
            ctx.fill();
        } else if (emblem === 'heart') {
            ctx.beginPath();
            ctx.arc(emX - 2, emY - 1.5, 2, 0, Math.PI * 2);
            ctx.arc(emX + 2, emY - 1.5, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(emX - 4, emY - 0.5);
            ctx.lineTo(emX, emY + 3.5);
            ctx.lineTo(emX + 4, emY - 0.5);
            ctx.fill();
        }

        // Mini Metin
        if (label) {
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 6px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(label, emX, ly + lh * 0.88);
        }
        ctx.restore();
    }

    /**
     * Şeffaf Cam Ödül Kavanozu & Mantar Kapak
     */
    function drawGlassTreatJar(ctx, jx, jy, jw, jh, treatType, treatCol) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(jx + jw / 2, jy, jw * 0.44, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();

        const jarH = jh - 7;
        const jarY = jy - jarH;
        ctx.fillStyle = "rgba(224, 242, 254, 0.35)";
        ctx.beginPath();
        ctx.roundRect(jx, jarY, jw, jarH, [0, 0, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = "rgba(186, 230, 253, 0.75)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.fillStyle = treatCol;
        if (treatType === 'bone') {
            for (let i = 0; i < 4; i++) {
                const bx = jx + 6 + (i % 2) * 11;
                const by = jarY + 8 + Math.floor(i / 2) * 7;
                ctx.fillRect(bx - 3, by, 6, 2);
                ctx.beginPath();
                ctx.arc(bx - 3, by, 1.2, 0, Math.PI * 2);
                ctx.arc(bx + 3, by, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (treatType === 'star') {
            for (let i = 0; i < 5; i++) {
                const sx = jx + 5 + (i * 4.2);
                const sy = jarY + 6 + ((i * 3) % 9);
                ctx.beginPath();
                ctx.arc(sx, sy, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (treatType === 'heart') {
            for (let i = 0; i < 4; i++) {
                const hx = jx + 6 + (i % 2) * 10;
                const hy = jarY + 7 + Math.floor(i / 2) * 7;
                ctx.beginPath();
                ctx.arc(hx - 1.5, hy, 1.8, 0, Math.PI * 2);
                ctx.arc(hx + 1.5, hy, 1.8, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            for (let i = 0; i < 4; i++) {
                const fx = jx + 5 + (i % 2) * 11;
                const fy = jarY + 7 + Math.floor(i / 2) * 7;
                ctx.beginPath();
                ctx.ellipse(fx, fy, 3.5, 1.8, 0.2, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Cam Yansıma Şeridi
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillRect(jx + 3, jarY + 2, 3, jarH - 5);

        // Mantar Tıpa / Kapak
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.roundRect(jx + 2, jarY - 4, jw - 4, 5, 2);
        ctx.fill();
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(jx + jw / 2, jarY - 4, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Eczacı Tipi Renkli Cam Vitamin Şişesi
     */
    function drawApothecaryBottle(ctx, bx, by, bw, bh, glassCol, capCol, iconType) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, by, bw * 0.45, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const bodyH = bh - 8;
        const bodyY = by - bodyH;
        ctx.fillStyle = glassCol;
        ctx.beginPath();
        ctx.roundRect(bx, bodyY, bw, bodyH, 3);
        ctx.fill();

        ctx.fillRect(bx + (bw - 6) / 2, bodyY - 4, 6, 4);

        ctx.fillStyle = capCol;
        ctx.beginPath();
        ctx.roundRect(bx + (bw - 8) / 2, bodyY - 8, 8, 4, 2);
        ctx.fill();

        const lw = bw - 4;
        const lh = bodyH - 8;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(bx + 2, bodyY + 4, lw, lh, 2);
        ctx.fill();

        ctx.fillStyle = glassCol;
        const ix = bx + bw / 2;
        const iy = bodyY + 4 + lh / 2;
        if (iconType === 'cross') {
            ctx.fillRect(ix - 3, iy - 1, 6, 2);
            ctx.fillRect(ix - 1, iy - 3, 2, 6);
        } else if (iconType === 'leaf') {
            ctx.beginPath();
            ctx.ellipse(ix, iy, 2.5, 4, 0.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (iconType === 'drop') {
            ctx.beginPath();
            ctx.arc(ix, iy + 1, 2, 0, Math.PI * 2);
            ctx.moveTo(ix - 1.8, iy);
            ctx.lineTo(ix, iy - 3);
            ctx.lineTo(ix + 1.8, iy);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(ix - 1.5, iy - 1, 1.8, 0, Math.PI * 2);
            ctx.arc(ix + 1.5, iy - 1, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(ix - 3, iy); ctx.lineTo(ix, iy + 3); ctx.lineTo(ix + 3, iy); ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Yuvarlak Metal Ödül Tenekesi
     */
    function drawTreatTinCan(ctx, cx, cy, cw, ch, canCol, labelCol, lidCol) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(cx + cw / 2, cy, cw * 0.45, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const canY = cy - ch;
        ctx.fillStyle = canCol;
        ctx.beginPath();
        ctx.roundRect(cx, canY, cw, ch, 3);
        ctx.fill();

        ctx.fillStyle = labelCol;
        ctx.fillRect(cx, canY + ch * 0.3, cw, ch * 0.4);

        ctx.fillStyle = canCol;
        ctx.beginPath();
        ctx.arc(cx + cw / 2, canY + ch * 0.5, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = lidCol;
        ctx.beginPath();
        ctx.roundRect(cx - 1, canY - 2, cw + 2, 4, 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Ahşap Sepette Çiğneme Çubukları
     */
    function drawDentalStickBasket(ctx, bx, by, bw, bh) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, by, bw * 0.45, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const stickColors = ['#15803d', '#854d0e', '#16a34a', '#a16207', '#15803d'];
        for (let i = 0; i < 5; i++) {
            const sx = bx + 4 + i * 5;
            ctx.fillStyle = stickColors[i];
            ctx.beginPath();
            ctx.roundRect(sx, by - bh - 5 + (i % 2) * 3, 4, bh + 4, 1.5);
            ctx.fill();
        }

        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.roundRect(bx, by - bh * 0.65, bw, bh * 0.65, [2, 2, 5, 5]);
        ctx.fill();
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.strokeStyle = "rgba(120, 53, 15, 0.4)";
        ctx.beginPath();
        ctx.moveTo(bx + 4, by - bh * 0.35); ctx.lineTo(bx + bw - 4, by - bh * 0.35);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Gurme Ödül Hediye Kutusu
     */
    function drawGourmetBox(ctx, bx, by, bw, bh, boxCol, ribbonCol) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, by, bw * 0.45, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const boxY = by - bh;
        ctx.fillStyle = boxCol;
        ctx.beginPath();
        ctx.roundRect(bx, boxY, bw, bh, 3);
        ctx.fill();

        ctx.fillStyle = ribbonCol;
        ctx.fillRect(bx + bw / 2 - 2, boxY, 4, bh);
        ctx.fillRect(bx, boxY + bh / 2 - 2, bw, 4);

        ctx.beginPath();
        ctx.arc(bx + bw / 2 - 3, boxY - 1, 3, 0, Math.PI * 2);
        ctx.arc(bx + bw / 2 + 3, boxY - 1, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Sarı Peluş Vakvak Ördek
     */
    function drawPlushDuck(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 10, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 8, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx + 5, cy - 16, 5.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.ellipse(cx + 10, cy - 15, 3.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 17, 1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Kırmızı Peluş Kemik Yastık
     */
    function drawPlushBone(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const by = cy - 8;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.roundRect(cx - 10, by - 3, 20, 7, 3);
        ctx.fill();

        const ends = [-9, 9];
        ends.forEach(ex => {
            ctx.beginPath();
            ctx.arc(cx + ex, by - 4, 3.2, 0, Math.PI * 2);
            ctx.arc(cx + ex, by + 4, 3.2, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cx, by, 1.5, 0, Math.PI * 2);
        ctx.arc(cx - 4, by, 1.2, 0, Math.PI * 2);
        ctx.arc(cx + 4, by, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Mavi-Sarı Örgülü Çekiştirme Halatı
     */
    function drawBraidedRopeToy(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const ry = cy - 7;
        const colors = ['#2563eb', '#facc15', '#2563eb', '#facc15', '#2563eb'];
        for (let i = 0; i < 5; i++) {
            const rx = cx - 10 + i * 5;
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.ellipse(rx, ry, 3.5, 5, 0.3 * (i % 2 === 0 ? 1 : -1), 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 12, ry); ctx.lineTo(cx - 17, ry - 3);
        ctx.moveTo(cx - 12, ry); ctx.lineTo(cx - 17, ry + 3);
        ctx.moveTo(cx + 12, ry); ctx.lineTo(cx + 17, ry - 3);
        ctx.moveTo(cx + 12, ry); ctx.lineTo(cx + 17, ry + 3);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Pompalı Pet Bakım Şampuanı
     */
    function drawShampooPumpBottle(ctx, bx, by, bw, bh, bodyCol, capCol, lbl) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(bx + bw / 2, by, bw * 0.44, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const bodyH = bh - 7;
        const bodyY = by - bodyH;
        ctx.fillStyle = bodyCol;
        ctx.beginPath();
        ctx.roundRect(bx, bodyY, bw, bodyH, [4, 4, 2, 2]);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = capCol;
        ctx.fillRect(bx + bw / 2 - 2, bodyY - 4, 4, 4);
        ctx.beginPath();
        ctx.moveTo(bx + bw / 2 - 4, bodyY - 4);
        ctx.lineTo(bx + bw / 2 + 5, bodyY - 4);
        ctx.lineTo(bx + bw / 2 + 5, bodyY - 7);
        ctx.lineTo(bx + bw / 2 - 2, bodyY - 7);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = capCol;
        ctx.font = "bold 5.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(lbl, bx + bw / 2, bodyY + bodyH * 0.6);

        ctx.restore();
    }

    /**
     * Ahşap Saplı Doğal Tüy Fırçası
     */
    function drawWoodenPetBrush(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy - 7, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.ellipse(cx - 4, cy - 8, 6, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.roundRect(cx + 3, cy - 8.5, 9, 3, 1.5);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Mavi Peluş Farecik
     */
    function drawPlushMouse(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 9, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        const my = cy - 6;
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.ellipse(cx, my, 7, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#f472b6";
        ctx.beginPath();
        ctx.arc(cx - 2, my - 4, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(cx + 6, my - 1, 1, 0, Math.PI * 2);
        ctx.arc(cx + 3, my - 2, 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#f472b6";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx - 7, my);
        ctx.quadraticCurveTo(cx - 12, my - 6, cx - 10, my - 9);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Zıplayan Neon Tenis Topu
     */
    function drawTennisBallToy(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 7, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#84cc16";
        ctx.beginPath();
        ctx.arc(cx, cy - 7, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy - 7, 4, 0.5, 2.5);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Çiftli Paslanmaz Mama & Su Kabı
     */
    function drawDoublePetBowl(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.22)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 14, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#854d0e";
        ctx.beginPath();
        ctx.roundRect(cx - 13, cy - 6, 26, 6, 3);
        ctx.fill();

        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(cx - 6, cy - 6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 6, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.arc(cx + 6, cy - 6, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Mor Peluş Donut Oyuncak
     */
    function drawPlushDonutToy(ctx, cx, cy) {
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 9, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(cx, cy - 7, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.arc(cx, cy - 7, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#facc15";
        ctx.fillRect(cx - 4, cy - 10, 1.5, 1.5);
        ctx.fillRect(cx + 3, cy - 6, 1.5, 1.5);
        ctx.fillStyle = "#ec4899";
        ctx.fillRect(cx + 2, cy - 10, 1.5, 1.5);
        ctx.fillRect(cx - 3, cy - 5, 1.5, 1.5);

        ctx.restore();
    }

    /**
     * DİNAMİK PET SHOP İÇ MEKAN ÇİZİMİ (drawPetShopInteriorEnvironment)
     */
    function drawPetShopInteriorEnvironment() {
        const now = Date.now();
        const canvas = document.getElementById('gameCanvas');
        const ctx = window.ctx || (typeof ctx !== 'undefined' ? ctx : (canvas && canvas.getContext('2d')));
        if (!ctx) return;

        // 1. Statik Arka Planı Çiz
        if (!petShopBgCache || petShopBgCache.width !== CANV_W || petShopBgCache.height !== CANV_H) {
            petShopBgCache = document.createElement('canvas');
            petShopBgCache.width = CANV_W;
            petShopBgCache.height = CANV_H;
            const bctx = petShopBgCache.getContext('2d');
            renderStaticPetShopTo(bctx, CANV_W, CANV_H);
        }
        ctx.drawImage(petShopBgCache, 0, 0);

        const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) ? players[myId] : null;
        const mouseX = (typeof canvasMouseX !== 'undefined') ? canvasMouseX : -999;
        const mouseY = (typeof canvasMouseY !== 'undefined') ? canvasMouseY : -999;

        // 1.5. ÜST DUVAR & TAVAN ASILI DEKORLAR
        drawKitCatPendulumClock(ctx, 246, 42, now);
        drawHangingMacramePlant(ctx, 130, 0, now);
        drawHangingMacramePlant(ctx, 690, 0, now);

        // LÜKS VETERİNER KLİNİK & DANIŞMA DUVARI (Diplomalar, İlaç/Aşı Vitrini & Işıklı Tabela)
        drawClinicWallDecor(ctx, 720, 35, 250, 165, now);

        // 2. STATİK MOBİLYA VE NPC DERİNLİK SIRASI (Sıfır-Tahsis / Zero-GC Doğrudan Çizim)
        // A) Karşılama Tezgahı ve Veteriner Dr. Selim Hekimoğlu NPC (Semihus Aydınus & VIP Club Standardı)
        drawPetShopReceptionCounter(ctx, 725, 205, 235, 105, now);
        drawVeterinerDoctorNPC(ctx, 665, 268, now, myP, mouseX, mouseY);

        // B) Dev Mercan Resifi Akvaryumu (Sol Duvar - Y: 330)
        drawTropicalAquarium(ctx, 30, 120, 215, 210, now);

        // C) Lüks Yavru Köpek & Kedi Oyun Bahçesi (Merkez Zemin 2.5D: cx: 405, cy: 315 - Y: 368)
        drawPuppyPlaypen(ctx, 405, 315, 112, 52, now);

        // D) İskandinav Müşteri Bekleme Koltuğu & Kahve Sehpası (Sittable - Y: 450)
        drawCustomerWaitingLounge(ctx, 275, 410, 260, 52, now);

        // E) Sağ Alt Köşe: Seramik Saksıda Monstera Bitkisi & Dijital Pet Tartısı (Y: 475)
        drawBoutiqueMonsteraAndScale(ctx, 875, 440, now);

        // F) Butik Hayvan Kostüm Standı (Sol Alt: 9 Hayvan Kostümü - Y: 490)
        drawAnimalCostumeBoutiqueStand(ctx, 45, 370, 205, 130, now);

        // 3. ETKİLEŞİM VE HOVER KONTROLLERİ (Hover & Click detection)
        handlePetShopInteractions(ctx, now);
    }

    /**
     * 1. DEV MERCAN RESİFİ AKVARYUMU (Animasyonlu Balıklar & Hava Kabarcıkları)
     */
    function drawTropicalAquarium(ctx, ax, ay, aw, ah, now) {
        ctx.save();

        // Zemin Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(ax + aw / 2, ay + ah + 4, aw * 0.52, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ceviz Alt Dolap
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.roundRect(ax, ay + ah - 55, aw, 55, [0, 0, 8, 8]);
        ctx.fill();
        ctx.fillStyle = "#78350f";
        ctx.fillRect(ax + 6, ay + ah - 50, aw - 12, 45);
        ctx.fillStyle = "#facc15"; // Pirinç kulplar
        ctx.fillRect(ax + aw * 0.35, ay + ah - 30, 4, 12);
        ctx.fillRect(ax + aw * 0.65, ay + ah - 30, 4, 12);

        // Akrilik Cam Tank Gövdesi
        const tankH = ah - 75;
        const tankY = ay + 20;

        // Su Gradyanı (Işıltılı Tropik Derinlik)
        const waterGrad = ctx.createLinearGradient(ax, tankY, ax, tankY + tankH);
        waterGrad.addColorStop(0, '#38bdf8');
        waterGrad.addColorStop(0.4, '#0284c7');
        waterGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(ax + 5, tankY, aw - 10, tankH);

        // Dipteki Beyaz Mercan Kumu & Kayalıklar
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.ellipse(ax + aw / 2, tankY + tankH - 4, aw * 0.46, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mercanlar & Anemonlar
        const corals = [
            { x: ax + 25, col: '#f43f5e', h: 32 },
            { x: ax + 65, col: '#a855f7', h: 42 },
            { x: ax + aw - 50, col: '#10b981', h: 38 },
            { x: ax + aw - 85, col: '#ec4899', h: 46 }
        ];
        corals.forEach(c => {
            ctx.fillStyle = c.col;
            ctx.beginPath();
            ctx.moveTo(c.x, tankY + tankH - 4);
            ctx.quadraticCurveTo(c.x - 12, tankY + tankH - c.h, c.x, tankY + tankH - c.h - 5);
            ctx.quadraticCurveTo(c.x + 12, tankY + tankH - c.h, c.x + 8, tankY + tankH - 4);
            ctx.fill();
        });

        // Yüzen Animasyonlu Tropikal Balıklar
        const fishes = [
            { id: 1, y: tankY + 35, speed: 0.0012, len: 16, col: '#f97316', name: 'Nemo' },
            { id: 2, y: tankY + 65, speed: -0.0015, len: 14, col: '#facc15', name: 'Tang' },
            { id: 3, y: tankY + 95, speed: 0.0018, len: 18, col: '#06b6d4', name: 'Angel' }
        ];

        fishes.forEach(f => {
            const cycle = (now * f.speed);
            const range = aw - 45;
            const fx = ax + 25 + ((Math.sin(cycle) + 1) * 0.5 * range);
            const dir = Math.cos(cycle) >= 0 ? 1 : -1;
            const finWag = Math.sin(now * 0.02) * 3;

            ctx.save();
            ctx.translate(fx, f.y);
            ctx.scale(dir, 1);

            // Balık Gövdesi
            ctx.fillStyle = f.col;
            ctx.beginPath();
            ctx.ellipse(0, 0, f.len * 0.55, f.len * 0.32, 0, 0, Math.PI * 2);
            ctx.fill();

            // Beyaz Şeritler (Nemo stili)
            if (f.col === '#f97316') {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-2, -f.len * 0.3, 3, f.len * 0.6);
            }

            // Kuyruk Yüzgeci
            ctx.beginPath();
            ctx.moveTo(-f.len * 0.5, 0);
            ctx.lineTo(-f.len * 0.85, -5 + finWag);
            ctx.lineTo(-f.len * 0.85, 5 + finWag);
            ctx.closePath();
            ctx.fill();

            // Göz
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(f.len * 0.3, -2, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(f.len * 0.3 + 0.5, -2, 0.9, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // Yükselen Hava Kabarcığı Sütunları
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        for (let b = 0; b < 10; b++) {
            const bPhase = (now * 0.04 + b * 25) % tankH;
            const by = tankY + tankH - bPhase;
            const bx1 = ax + 40 + Math.sin(now * 0.005 + b) * 4;
            const bx2 = ax + aw - 40 + Math.cos(now * 0.005 + b) * 4;
            ctx.beginPath();
            ctx.arc(bx1, by, 1.8, 0, Math.PI * 2);
            ctx.arc(bx2, by, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Akrilik Cam Çerçevesi & Yansımalar
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 3;
        ctx.strokeRect(ax + 5, tankY, aw - 10, tankH);

        // Cam Yansıma Şeridi
        ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
        ctx.beginPath();
        ctx.moveTo(ax + 12, tankY);
        ctx.lineTo(ax + 38, tankY);
        ctx.lineTo(ax + 20, tankY + tankH);
        ctx.lineTo(ax + 5, tankY + tankH);
        ctx.closePath();
        ctx.fill();

        // Üst LED Aydınlatma Başlığı
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.roundRect(ax, ay + 6, aw, 16, [6, 6, 0, 0]);
        ctx.fill();
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(ax + 15, ay + 18, aw - 30, 2);

        // -----------------------------------------------------------------
        // DİNAMİK SU IŞIK KIRILMALARI & CAUSTIC YANSIMALARI (Zemin Ahşap Parke Üzerinde)
        // -----------------------------------------------------------------
        const cFloorY = ay + ah + 15;
        const cFloorX = ax + aw / 2;
        const causticAlpha = 0.16 + Math.sin(now * 0.002) * 0.05;

        // Yumuşak dairesel su parıltısı
        let causticGlow = ctx.createRadialGradient(cFloorX, cFloorY, 15, cFloorX, cFloorY, aw * 0.58);
        causticGlow.addColorStop(0, `rgba(56, 189, 248, ${causticAlpha * 1.5})`);
        causticGlow.addColorStop(0.5, `rgba(45, 212, 191, ${causticAlpha})`);
        causticGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = causticGlow;
        ctx.beginPath();
        ctx.ellipse(cFloorX, cFloorY, aw * 0.58, 24, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Dalgalanan su ışık şeritleri
        ctx.strokeStyle = `rgba(224, 242, 254, ${causticAlpha * 1.8})`;
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 5; i++) {
            const offset = Math.sin(now * 0.0018 + i * 1.2) * 12;
            const waveY = cFloorY - 10 + i * 5.5;
            ctx.beginPath();
            ctx.moveTo(ax + 20, waveY + Math.sin(now * 0.003 + i) * 2.5);
            ctx.bezierCurveTo(
                ax + aw * 0.32 + offset, waveY - 4,
                ax + aw * 0.68 - offset, waveY + 4,
                ax + aw - 20, waveY + Math.cos(now * 0.003 + i) * 2.5
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 2. LÜKS YAVRU KÖPEK & KEDİ OYUN BAHÇESİ (2.5D Isometric Playpen)
     * Zemin düzleminde (cx: 405, cy: 315, rx: 112, ry: 52)
     */
    function drawPuppyPlaypen(ctx, cx, cy, rx, ry, now) {
        ctx.save();

        // 1. Zemin İletişim / Ambiyans Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8, rx + 12, ry + 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Çevre Direkleri Koordinatları (8 Adet Butik Ahşap & Pirinç Dikme)
        const postH = 22;
        const postCount = 8;
        const posts = [];
        for (let i = 0; i < postCount; i++) {
            const angle = (i * Math.PI * 2) / postCount;
            const px = cx + Math.cos(angle) * rx;
            const py = cy + Math.sin(angle) * ry;
            posts.push({ x: px, y: py, angle: angle, isBack: Math.sin(angle) < 0 });
        }

        // 2. ARKA KORKULUK PANELLERİ & ARKA DİKMELER (sin < 0)
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI * 2, false);
        ctx.lineTo(cx + rx, cy - postH);
        ctx.ellipse(cx, cy - postH, rx, ry, 0, Math.PI * 2, Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Arka dikmeler
        posts.filter(p => p.isBack).forEach(p => {
            ctx.fillStyle = "#e2e8f0";
            ctx.fillRect(p.x - 2.5, p.y - postH, 5, postH);
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(p.x, p.y - postH - 1, 3, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        // 3. ZEMİN OYUN MATI (Soft Pastel Peluş Halı)
        ctx.fillStyle = "#fae8ff";
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();

        // Kesikli dikişli şık kenar çizgisi
        ctx.strokeStyle = "#e879f9";
        ctx.lineWidth = 2.0;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx - 3, ry - 3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // İç kremsi yumuşak oyun alanı
        ctx.fillStyle = "#fdf4ff";
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx - 10, ry - 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Mat üzerindeki sevimli pati baskıları
        ctx.fillStyle = "rgba(232, 121, 249, 0.28)";
        drawWallPawPrint(ctx, cx - 60, cy + 4, 11);
        drawWallPawPrint(ctx, cx + 10, cy - 12, 11);
        drawWallPawPrint(ctx, cx + 70, cy + 6, 11);

        // 4. MAT İÇİNDEKİ SEVİMLİ DONUT KÖPEK YATAĞI (Sol Köşe)
        const bedX = cx - 62, bedY = cy - 10;
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.ellipse(bedX, bedY, 20, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.ellipse(bedX, bedY, 13, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Yatak üzerindeki minik peluş kemik
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(bedX - 4, bedY - 1, 8, 2);
        ctx.beginPath();
        ctx.arc(bedX - 4, bedY - 1, 1.2, 0, Math.PI * 2);
        ctx.arc(bedX + 4, bedY - 1, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // 5. OYNAYAN YAVRU KÖPEK (Golden Retriever / Corgi)
        const pupX = cx - 22 + Math.sin(now * 0.003) * 14;
        const pupY = cy + 6;
        const tailWag = Math.sin(now * 0.02) * 4;

        ctx.save();
        ctx.translate(pupX, pupY);

        // Yavru köpek gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.ellipse(0, 6, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gövde
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Beyaz Göğüs
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(6, 2, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Sallanan Kuyruk
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-12, -2);
        ctx.quadraticCurveTo(-18, -10 + tailWag, -22, -6 + tailWag);
        ctx.stroke();

        // Kafa
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(12, -6, 8, 0, Math.PI * 2);
        ctx.fill();

        // Düşük Kulaklar
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.ellipse(8, -4, 3, 6, 0.4, 0, Math.PI * 2);
        ctx.ellipse(15, -4, 3, 6, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Burun & Gözler
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(17, -5, 1.8, 0, Math.PI * 2);
        ctx.arc(11, -8, 1.4, 0, Math.PI * 2);
        ctx.arc(15, -8, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 6. YUVARLANAN KIRMIZI KAUÇUK TOP
        const ballX = cx + 8 + Math.sin(now * 0.003) * 14;
        const ballY = cy + 10;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(ballX, ballY + 4, 6, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.arc(ballX, ballY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(ballX - 4, ballY - 1, 8, 2);
        ctx.restore();

        // 7. OYNAYAN YAVRU BEYAZ KEDİ (Pati Atma & İple Oynama)
        const catX = cx + 46;
        const catY = cy + 2;
        const pawAngle = Math.sin(now * 0.006) * 0.45;

        ctx.save();
        ctx.translate(catX, catY);

        // Kedi gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
        ctx.beginPath();
        ctx.ellipse(0, 6, 13, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gövde
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(0, 0, 13, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Kafa
        ctx.beginPath();
        ctx.arc(-10, -5, 7.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Kulaklar
        ctx.fillStyle = "#fbcfe8";
        ctx.beginPath();
        ctx.moveTo(-15, -9); ctx.lineTo(-17, -17); ctx.lineTo(-11, -11); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-9, -11); ctx.lineTo(-6, -17); ctx.lineTo(-4, -9); ctx.fill();

        // Pati atma
        ctx.save();
        ctx.translate(-4, 4);
        ctx.rotate(pawAngle);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 9, 3.5);
        ctx.restore();

        // Kıvrık Kedi Kuyruğu
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(11, 2);
        ctx.quadraticCurveTo(18, -4 + Math.sin(now * 0.01) * 3, 16, -10);
        ctx.stroke();

        ctx.restore();

        // 8. MAVİ YÜN YUMAĞI VE KIVRIMLI İP
        const yarnX = catX - 20;
        const yarnY = catY + 8;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(yarnX, yarnY + 4, 5, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#3b82f6";
        ctx.beginPath();
        ctx.arc(yarnX, yarnY, 5.5, 0, Math.PI * 2);
        ctx.fill();
        // Kıvrımlı serbest ip
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(yarnX + 3, yarnY);
        ctx.quadraticCurveTo(yarnX + 10, yarnY + 5, catX - 4, catY + 6);
        ctx.stroke();
        ctx.restore();

        // 9. ÖN KORKULUK PANELLERİ & ÖN DİKMELER (sin >= 0)
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 0.26)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI, false);
        ctx.lineTo(cx - rx, cy - postH);
        ctx.ellipse(cx, cy - postH, rx, ry, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Ön dikmeler
        posts.filter(p => !p.isBack).forEach(p => {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(p.x - 2.5, p.y - postH, 5, postH);
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1;
            ctx.strokeRect(p.x - 2.5, p.y - postH, 5, postH);

            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.arc(p.x, p.y - postH - 1, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(p.x - 1, p.y - postH - 2, 1.2, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();

        ctx.restore();
    }

    /**
     * 3. LÜKS VETERİNER KLİNİK & DANIŞMA DUVARI (Diplomalar, İlaç/Aşı Vitrini & Işıklı Tabela)
     * Resepsiyon bankosunun hemen arkasındaki duvarda yer alır
     */
    function drawClinicWallDecor(ctx, cx, cy, cw, ch, now) {
        ctx.save();

        // 1. ÜST PIRINÇ & MEŞE IŞIKLI KLİNİK TABELASI (Backlit Clinic Sign)
        const signX = cx + 10;
        const signY = cy + 2;
        const signW = cw - 20;
        const signH = 26;

        // Arka altın ambiyans parıltısı
        ctx.fillStyle = "rgba(250, 204, 21, 0.22)";
        ctx.beginPath();
        ctx.roundRect(signX - 4, signY - 2, signW + 8, signH + 4, 10);
        ctx.fill();

        // Masif Meşe Gövde
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.roundRect(signX, signY, signW, signH, 8);
        ctx.fill();
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Altın Tabela Başlığı
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🐾 PATİ KLİNİK & DANIŞMA", signX + signW / 2, signY + 17);

        // 2. ALTIN VARAKLI DİPLOMALAR & LİSANSLAR (Sol Duvar Paneli: x = cx + 10..cx + 104)
        const dipX = cx + 12;

        // A) Üst Diploma: Veteriner Hekimlik Diploması
        const dip1Y = cy + 36;
        const dipW = 90, dip1H = 54;
        ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        ctx.fillRect(dipX + 2, dip1Y + 2, dipW, dip1H);

        // Altın Çerçeve
        ctx.fillStyle = "#b45309";
        ctx.fillRect(dipX, dip1Y, dipW, dip1H);
        ctx.fillStyle = "#facc15";
        ctx.strokeRect(dipX + 1.5, dip1Y + 1.5, dipW - 3, dip1H - 3);

        // Eskitme Parşömen Kağıdı
        ctx.fillStyle = "#fefdfa";
        ctx.fillRect(dipX + 4, dip1Y + 4, dipW - 8, dip1H - 8);

        // Diploma Başlığı & Hat Çizgileri
        ctx.fillStyle = "#78350f";
        ctx.font = "bold 6px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("VETERİNER HEKİMLİK DİPLOMASI", dipX + dipW / 2, dip1Y + 12);
        ctx.fillStyle = "#94a3b8";
        for (let l = 0; l < 4; l++) {
            ctx.fillRect(dipX + 8, dip1Y + 17 + l * 4, dipW - 16, 1.2);
        }

        // Kırmızı Balmumu Mühür & Kurdele
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.arc(dipX + dipW - 14, dip1Y + dip1H - 12, 4.5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dipX + dipW - 16, dip1Y + dip1H - 10);
        ctx.lineTo(dipX + dipW - 18, dip1Y + dip1H - 4);
        ctx.moveTo(dipX + dipW - 12, dip1Y + dip1H - 10);
        ctx.lineTo(dipX + dipW - 10, dip1Y + dip1H - 4);
        ctx.stroke();

        // B) Alt Diploma: Uluslararası Pati Koruma & Sağlık Lisansı
        const dip2Y = cy + 98;
        const dip2H = 50;
        ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        ctx.fillRect(dipX + 2, dip2Y + 2, dipW, dip2H);

        // Maun Çerçeve
        ctx.fillStyle = "#451a03";
        ctx.fillRect(dipX, dip2Y, dipW, dip2H);
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(dipX + 1.5, dip2Y + 1.5, dipW - 3, dip2H - 3);

        // Kağıt
        ctx.fillStyle = "#fdfbf7";
        ctx.fillRect(dipX + 4, dip2Y + 4, dipW - 8, dip2H - 8);

        ctx.fillStyle = "#065f46";
        ctx.font = "bold 5.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PATİ KORUMA LİSANSI", dipX + dipW / 2, dip2Y + 12);
        ctx.fillStyle = "#94a3b8";
        for (let l = 0; l < 3; l++) {
            ctx.fillRect(dipX + 10, dip2Y + 17 + l * 4.5, dipW - 20, 1.2);
        }

        // Zümrüt Yeşil Mühür
        ctx.fillStyle = "#059669";
        ctx.beginPath();
        ctx.arc(dipX + 16, dip2Y + dip2H - 12, 4, 0, Math.PI * 2, false);
        ctx.fill();

        // 3. GÖMME İLAÇ & AŞI VİTRİNİ (Glass Medicine & Vaccine Cabinet: Sağ Duvar)
        const cabX = cx + 110;
        const cabY = cy + 36;
        const cabW = cw - 122;
        const cabH = 118;

        // Duvar Oyuğu & Koyu Ahşap Kasa
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.roundRect(cabX - 2, cabY - 2, cabW + 4, cabH + 4, 6);
        ctx.fill();

        ctx.fillStyle = "#331604";
        ctx.beginPath();
        ctx.roundRect(cabX, cabY, cabW, cabH, 5);
        ctx.fill();
        ctx.strokeStyle = "#854d0e";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tepe LED Spot Işık Konisi
        let spotGrad = ctx.createLinearGradient(cabX + cabW / 2, cabY, cabX + cabW / 2, cabY + cabH);
        spotGrad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
        spotGrad.addColorStop(0.6, "rgba(254, 240, 138, 0.08)");
        spotGrad.addColorStop(1, "rgba(0, 0, 0, 0.0)");
        ctx.fillStyle = spotGrad;
        ctx.fillRect(cabX + 4, cabY + 4, cabW - 8, cabH - 8);

        // 2 Katlı Cam Raf Tablaları
        const shelfLevels = [cabY + 46, cabY + 84];
        shelfLevels.forEach(sy => {
            // Şeffaf cam raf
            ctx.fillStyle = "rgba(186, 230, 253, 0.65)";
            ctx.fillRect(cabX + 4, sy, cabW - 8, 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fillRect(cabX + 4, sy, cabW - 8, 0.8);
        });

        // KAT 1 (Üst Raf): Renkli Aşı Ampulleri & Paslanmaz Tepsi
        const ampY = cabY + 44;
        const vaccines = [
            { col: '#0284c7', cap: '#e2e8f0', x: cabX + 14 }, // Kuduz (Mavi)
            { col: '#dc2626', cap: '#e2e8f0', x: cabX + 28 }, // Karma (Kırmızı)
            { col: '#16a34a', cap: '#e2e8f0', x: cabX + 42 }, // Lösemi (Yeşil)
            { col: '#d97706', cap: '#e2e8f0', x: cabX + 56 }  // Parvo (Altın)
        ];
        vaccines.forEach(v => {
            // Cam ampul gövdesi
            ctx.fillStyle = v.col;
            ctx.fillRect(v.x, ampY - 14, 8, 14);
            ctx.fillStyle = v.cap;
            ctx.fillRect(v.x + 1, ampY - 18, 6, 4);
            ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            ctx.fillRect(v.x + 2, ampY - 13, 2, 12);
        });

        // Minik Şırınga ve Metal Kutu (Sağ Raf Üstü)
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(cabX + 74, ampY - 6, 38, 6);
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(cabX + 78, ampY - 10, 16, 3);
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cabX + 94, ampY - 8.5); ctx.lineTo(cabX + 104, ampY - 8.5);
        ctx.stroke();

        // KAT 2 (Alt Raf): Amber Damlalık Şişesi, Vitamin Kavanozu & Pamuk Kabı
        const botY = cabY + 82;
        // Amber damlalık şişesi
        ctx.fillStyle = "#b45309";
        ctx.fillRect(cabX + 16, botY - 18, 12, 18);
        ctx.fillStyle = "#0f172a"; // Damlalık kauçuk başlığı
        ctx.fillRect(cabX + 19, botY - 24, 6, 6);

        // Kobalt mavi damlalık şişesi
        ctx.fillStyle = "#1d4ed8";
        ctx.fillRect(cabX + 34, botY - 18, 12, 18);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cabX + 37, botY - 24, 6, 6);

        // Kalp vitamin tabletleri kavanozu
        ctx.fillStyle = "rgba(224, 242, 254, 0.45)";
        ctx.beginPath();
        ctx.roundRect(cabX + 54, botY - 20, 20, 20, 3);
        ctx.fill();
        ctx.strokeStyle = "rgba(186, 230, 253, 0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = "#fb7185"; // Pembe kalp vitaminler
        ctx.fillRect(cabX + 58, botY - 12, 12, 10);
        ctx.fillStyle = "#facc15"; // Sarı kapak
        ctx.fillRect(cabX + 53, botY - 23, 22, 4);

        // Pamuk kavanozu
        ctx.fillStyle = "rgba(224, 242, 254, 0.45)";
        ctx.fillRect(cabX + 82, botY - 16, 18, 16);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(cabX + 91, botY - 7, 5, 0, Math.PI * 2, false);
        ctx.fill();

        // Çift Cam Kapı & Çapraz Işık Yansıması (Glossy Reflection Sheen)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 1;
        ctx.strokeRect(cabX + 3, cabY + 3, (cabW - 6) / 2, cabH - 6);
        ctx.strokeRect(cabX + 3 + (cabW - 6) / 2, cabY + 3, (cabW - 6) / 2, cabH - 6);

        // Pirinç kollar
        ctx.fillStyle = "#facc15";
        ctx.fillRect(cabX + (cabW / 2) - 3, cabY + cabH / 2 - 6, 2, 12);
        ctx.fillRect(cabX + (cabW / 2) + 1, cabY + cabH / 2 - 6, 2, 12);

        // Çapraz parlaklık
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.beginPath();
        ctx.moveTo(cabX + 8, cabY + 4);
        ctx.lineTo(cabX + 32, cabY + 4);
        ctx.lineTo(cabX + 12, cabY + cabH - 4);
        ctx.lineTo(cabX + 4, cabY + cabH - 4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * SAĞ ALT KÖŞE: BÜYÜK SERAMİK MONSTERA BİTKİSİ & DİJİTAL PET TARTISI
     * Danışmanın yukarı taşınmasıyla açılan ferah sağ alt köşeyi taçlandırır
     */
    function drawBoutiqueMonsteraAndScale(ctx, mx, my, now) {
        ctx.save();

        // 1. Zemin İletişim / Ambiyans Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.ellipse(mx - 20, my + 14, 52, 12, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // 2. DİJİTAL PET TARTISI (Veterinary Pet Scale: Sol Taraf)
        const scX = mx - 72;
        const scY = my + 4;
        const scW = 54;
        const scH = 22;

        // Kauçuk Kenarlı Paslanmaz Çelik Platform
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(scX, scY, scW, scH, 6);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(scX + 2, scY + 2, scW - 4, scH - 4, 4);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Platform Üstü Beyaz Pati İkonu
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        drawWallPawPrint(ctx, scX + scW / 2, scY + scH / 2, 9);

        // Dijital LED Gösterge Ekranı (Mavi Arkadan Aydınlatmalı)
        const ledX = scX + 8;
        const ledY = scY + scH - 7;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(ledX, ledY, 38, 6);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(ledX, ledY, 38, 6);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 5.5px monospace";
        ctx.textAlign = "center";
        ctx.fillText("🐾 0.00 KG", ledX + 19, ledY + 4.8);

        // 3. FLÜTLÜ BEYAZ PORSELEN SAKSI & MONSTERA (Devetabanı: Sağ Taraf)
        const potX = mx;
        const potY = my - 12;
        const potW = 34;
        const potH = 28;

        // Saksı Gövdesi
        const pGrad = ctx.createLinearGradient(potX, potY, potX + potW, potY);
        pGrad.addColorStop(0, '#f8fafc');
        pGrad.addColorStop(0.5, '#ffffff');
        pGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.roundRect(potX, potY, potW, potH, [3, 3, 10, 10]);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Saksı Üst Bileziği
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(potX - 2, potY - 3, potW + 4, 6, 3);
        ctx.fill();
        ctx.stroke();

        // Koyu Zengin Toprak
        ctx.fillStyle = "#3b200b";
        ctx.beginPath();
        ctx.ellipse(potX + potW / 2, potY + 1, potW * 0.44, 3, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Monstera Deliciosa (Lush Split Leaves - Fenestrations)
        const fronds = [
            { x: potX + 4, y: potY - 14, scale: 0.85, rot: -0.45 },
            { x: potX + potW / 2, y: potY - 26, scale: 1.1, rot: 0.05 },
            { x: potX + potW - 4, y: potY - 16, scale: 0.95, rot: 0.4 },
            { x: potX - 8, y: potY - 4, scale: 0.75, rot: -0.8 },
            { x: potX + potW + 8, y: potY - 6, scale: 0.8, rot: 0.75 }
        ];

        const leafSway = Math.sin(now * 0.002) * 1.5;

        fronds.forEach((f, fi) => {
            ctx.save();
            ctx.translate(f.x + leafSway * (fi % 2 === 0 ? 1 : -1), f.y);
            ctx.rotate(f.rot);
            ctx.scale(f.scale, f.scale);

            // Yaprak Sapı
            ctx.strokeStyle = "#15803d";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(0, 18);
            ctx.quadraticCurveTo(0, 8, 0, 0);
            ctx.stroke();

            // Kalp Şekilli Parlak Devetabanı Yaprağı
            ctx.fillStyle = (fi % 2 === 0) ? '#16a34a' : '#15803d';
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.bezierCurveTo(-14, -18, -18, -4, -14, 8);
            ctx.bezierCurveTo(-10, 16, 0, 18, 0, 18);
            ctx.bezierCurveTo(0, 18, 10, 16, 14, 8);
            ctx.bezierCurveTo(18, -4, 14, -18, 0, -18);
            ctx.closePath();
            ctx.fill();

            // Ana Yaprak Damarı
            ctx.strokeStyle = "#4ade80";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 18); ctx.lineTo(0, -14);
            ctx.stroke();

            // Monstera Yırtmaç Kesikleri (Fenestrations)
            ctx.fillStyle = "#fef3c7"; // Arka plan parke rengi illüzyonu
            const holes = [-8, 8];
            holes.forEach(hx => {
                ctx.beginPath();
                ctx.ellipse(hx, -2, 2.5, 5, 0.4 * (hx > 0 ? 1 : -1), 0, Math.PI * 2, false);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(hx * 0.8, 6, 2, 4, 0.3 * (hx > 0 ? 1 : -1), 0, Math.PI * 2, false);
                ctx.fill();
            });

            ctx.restore();
        });

        ctx.restore();
    }

    /**
     * 4. BUTİK HAYVAN KOSTÜM STANDI (Animal Costume Boutique Stand)
     * Projedeki 9 özel hayvan kostümünü sergiler (Zombiler hariç)
     */
    function drawAnimalCostumeBoutiqueStand(ctx, sx, sy, sw, sh, now) {
        ctx.save();

        // 1. Zemin İletişim / Ambiyans Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
        ctx.beginPath();
        ctx.ellipse(sx + sw / 2, sy + sh + 3, sw * 0.48, 10, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // 2. Doğal İskandinav Masif Meşe Alt Aksesuar Tablası (Slatted Oak Deck)
        const deckH = 20;
        const deckY = sy + sh - deckH;
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.roundRect(sx + 10, deckY, sw - 20, deckH, 6);
        ctx.fill();
        ctx.fillStyle = "#b45309";
        ctx.fillRect(sx + 12, deckY + 2, sw - 24, 4);

        // Ahşap çıta derzleri & pirinç köşe klipsleri
        for (let slx = sx + 22; slx < sx + sw - 22; slx += 18) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            ctx.fillRect(slx, deckY + 2, 1.5, deckH - 4);
        }
        ctx.fillStyle = "#facc15"; // Pirinç köşe takviyeleri
        ctx.fillRect(sx + 12, deckY + 3, 5, 5);
        ctx.fillRect(sx + sw - 17, deckY + 3, 5, 5);

        // Alt Tabladaki Butik Aksesuarlar
        // A) Katlanmış Peluş Panda Başlığı & Pati Terlikleri
        const panX = sx + 32, panY = deckY - 6;
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.ellipse(panX, panY, 13, 7, 0, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(panX - 9, panY - 5, 3.5, 0, Math.PI * 2, false);
        ctx.arc(panX + 9, panY - 5, 3.5, 0, Math.PI * 2, false);
        ctx.fill();
        // Mini pati terlikleri
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.ellipse(panX + 24, panY + 2, 6, 4, 0, 0, Math.PI * 2, false);
        ctx.ellipse(panX + 37, panY + 2, 6, 4, 0, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(panX + 24, panY + 2, 2, 0, Math.PI * 2, false);
        ctx.arc(panX + 37, panY + 2, 2, 0, Math.PI * 2, false);
        ctx.fill();

        // B) Şık Butik Kutu & İpek Kurdele (Sağ Taraf)
        const boxX = sx + sw - 62, boxY = deckY - 12;
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, 38, 12, 3);
        ctx.fill();
        ctx.fillStyle = "#a855f7"; // Mor ipek kurdele
        ctx.fillRect(boxX + 17, boxY, 4, 12);
        ctx.beginPath();
        ctx.arc(boxX + 19, boxY - 2, 3, 0, Math.PI * 2, false);
        ctx.fill();

        // 3. Mat Siyah & Cilalı Pirinç Metal Elbise Askılığı Boruları
        const railTopY = sy + 30;
        const poleLeftX = sx + 22;
        const poleRightX = sx + sw - 22;

        // Dikey Taşıyıcı Dikmeler
        const poleGrad = ctx.createLinearGradient(0, railTopY, 0, deckY);
        poleGrad.addColorStop(0, '#facc15');
        poleGrad.addColorStop(0.3, '#334155');
        poleGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = poleGrad;
        ctx.fillRect(poleLeftX - 3, railTopY - 2, 6, deckY - railTopY + 2);
        ctx.fillRect(poleRightX - 3, railTopY - 2, 6, deckY - railTopY + 2);

        // Tepe Pirinç Küre Finialleri
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(poleLeftX, railTopY - 3, 5, 0, Math.PI * 2, false);
        ctx.arc(poleRightX, railTopY - 3, 5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(poleLeftX - 1.5, railTopY - 4.5, 1.5, 0, Math.PI * 2, false);
        ctx.arc(poleRightX - 1.5, railTopY - 4.5, 1.5, 0, Math.PI * 2, false);
        ctx.fill();

        // Yatay Askı Borusu (Garment Rail)
        let railGrad = ctx.createLinearGradient(poleLeftX, railTopY, poleRightX, railTopY);
        railGrad.addColorStop(0, '#eab308');
        railGrad.addColorStop(0.5, '#fef08a');
        railGrad.addColorStop(1, '#ca8a04');
        ctx.fillStyle = railGrad;
        ctx.fillRect(poleLeftX, railTopY, poleRightX - poleLeftX, 4);

        // 4. ASKIDA ASILI 4 ÖZEL HAYVAN KOSTÜMÜ
        const garments = [
            { id: 'panda', name: 'Panda', x: sx + 50 },
            { id: 'lion', name: 'Aslan', x: sx + 88 },
            { id: 'frog', name: 'Kurbağa/Dino', x: sx + 126 },
            { id: 'bird', name: 'Kartal/Kuş', x: sx + 162 }
        ];

        garments.forEach((g, idx) => {
            const hx = g.x;
            const hy = railTopY + 4;
            const tagSway = Math.sin(now * 0.003 + idx * 1.4) * 2;

            // Ahşap Askı Çengeli (Brass Hook & Wood Hanger)
            ctx.strokeStyle = "#ca8a04";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(hx, hy + 2, 3, Math.PI, 0, false);
            ctx.stroke();

            // Ahşap Omuz Askısı
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.moveTo(hx - 14, hy + 10);
            ctx.lineTo(hx, hy + 5);
            ctx.lineTo(hx + 14, hy + 10);
            ctx.lineTo(hx + 12, hy + 12);
            ctx.lineTo(hx - 12, hy + 12);
            ctx.closePath();
            ctx.fill();

            // Kostüm Silüeti & Dokusu
            const costTopY = hy + 11;
            const costH = 54;

            if (g.id === 'panda') {
                // A) Panda Peluş Kostümü (Kapüşonlu Siyah-Beyaz Peluş)
                ctx.fillStyle = "#f8fafc";
                ctx.beginPath();
                ctx.roundRect(hx - 13, costTopY, 26, costH, [6, 6, 8, 8]);
                ctx.fill();
                // Siyah kollar & omuzlar
                ctx.fillStyle = "#0f172a";
                ctx.beginPath();
                ctx.roundRect(hx - 16, costTopY + 2, 6, costH - 8, 3);
                ctx.roundRect(hx + 10, costTopY + 2, 6, costH - 8, 3);
                ctx.fill();
                // Kapüşondaki minik yuvarlak panda kulakları
                ctx.beginPath();
                ctx.arc(hx - 8, costTopY + 2, 3, 0, Math.PI * 2, false);
                ctx.arc(hx + 8, costTopY + 2, 3, 0, Math.PI * 2, false);
                ctx.fill();
                // Fermuar hattı
                ctx.strokeStyle = "#64748b";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(hx, costTopY + 8); ctx.lineTo(hx, costTopY + costH - 4);
                ctx.stroke();
            } else if (g.id === 'lion') {
                // B) Savana Kralı Aslan Pelerini (Kızıl-Altın Peluş Yeleli)
                ctx.fillStyle = "#d97706";
                ctx.beginPath();
                ctx.roundRect(hx - 14, costTopY, 28, costH, [6, 6, 9, 9]);
                ctx.fill();
                // Katmanlı kızıl kürk yele (Auburn Mane Trim)
                ctx.fillStyle = "#92400e";
                ctx.beginPath();
                ctx.moveTo(hx - 15, costTopY);
                ctx.lineTo(hx + 15, costTopY);
                ctx.lineTo(hx + 13, costTopY + 16);
                ctx.lineTo(hx, costTopY + 22);
                ctx.lineTo(hx - 13, costTopY + 16);
                ctx.closePath();
                ctx.fill();
                // Altın toka
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.arc(hx, costTopY + 10, 3, 0, Math.PI * 2, false);
                ctx.fill();
            } else if (g.id === 'frog') {
                // C) Zıplayan Kurbağa / T-Rex Kostümü (Zümrüt Yeşil & Sırt Pulları)
                ctx.fillStyle = "#15803d";
                ctx.beginPath();
                ctx.roundRect(hx - 13, costTopY, 26, costH, [6, 6, 8, 8]);
                ctx.fill();
                // Açık sarı karın bölgesi
                ctx.fillStyle = "#bef264";
                ctx.beginPath();
                ctx.ellipse(hx, costTopY + 28, 7, 18, 0, 0, Math.PI * 2, false);
                ctx.fill();
                // Sırt dinozor pulları / tırnakları
                ctx.fillStyle = "#facc15";
                for (let si = 0; si < 3; si++) {
                    ctx.beginPath();
                    ctx.moveTo(hx + 12, costTopY + 12 + si * 12);
                    ctx.lineTo(hx + 17, costTopY + 17 + si * 12);
                    ctx.lineTo(hx + 12, costTopY + 21 + si * 12);
                    ctx.closePath();
                    ctx.fill();
                }
            } else if (g.id === 'bird') {
                // D) Göklerin Kartalı Kanat Pelerini (Derin Mavi & Kızıl Kanatlar)
                ctx.fillStyle = "#1e3a8a";
                ctx.beginPath();
                ctx.roundRect(hx - 14, costTopY, 28, costH, [6, 6, 12, 12]);
                ctx.fill();
                // Kanat telekleri
                ctx.fillStyle = "#3b82f6";
                ctx.fillRect(hx - 13, costTopY + 14, 5, costH - 20);
                ctx.fillRect(hx + 8, costTopY + 14, 5, costH - 20);
                ctx.fillStyle = "#facc15"; // Sarı altın kanat ucu
                ctx.fillRect(hx - 13, costTopY + costH - 10, 5, 6);
                ctx.fillRect(hx + 8, costTopY + costH - 10, 5, 6);
            }

            // Sallanan Kraft Butik Fiyat Etiketi (Boutique Tag)
            ctx.strokeStyle = "#ca8a04";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(hx + 8, costTopY + 12);
            ctx.lineTo(hx + 14 + tagSway, costTopY + 20);
            ctx.stroke();

            ctx.fillStyle = "#fef3c7";
            ctx.beginPath();
            ctx.roundRect(hx + 10 + tagSway, costTopY + 20, 11, 14, 2);
            ctx.fill();
            ctx.strokeStyle = "#b45309";
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.fillStyle = "#92400e";
            ctx.font = "bold 5px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("TL", hx + 15.5 + tagSway, costTopY + 29);
        });

        // 5. ÜST PIRINÇ KEMER VE IŞIKLI BUTİK TABELASI (Overhead Boutique Sign)
        const signW = 168;
        const signH = 22;
        const signX = sx + (sw - signW) / 2;
        const signY = sy + 3;

        // Tabela askı kolları
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(signX + 20, railTopY);
        ctx.lineTo(signX + 20, signY + signH);
        ctx.moveTo(signX + signW - 20, railTopY);
        ctx.lineTo(signX + signW - 20, signY + signH);
        ctx.stroke();

        // Tabela gövdesi
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.roundRect(signX, signY, signW, signH, 11);
        ctx.fill();
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Tabela arkası mor ambiyans parıltısı
        ctx.fillStyle = "rgba(168, 85, 247, 0.22)";
        ctx.beginPath();
        ctx.roundRect(signX - 3, signY - 2, signW + 6, signH + 4, 13);
        ctx.fill();

        // Tabela metni
        ctx.fillStyle = "#f3e8ff";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🐾 HAYVAN KOSTÜM BUTİĞİ", signX + signW / 2, signY + 14.5);

        // Parıldayan Butik Yıldızları
        for (let sp = 0; sp < 3; sp++) {
            const spAlpha = Math.sin(now * 0.004 + sp * 2.1) * 0.5 + 0.5;
            const spX = sx + 30 + sp * 70;
            const spY = sy + 18 + Math.cos(now * 0.003 + sp) * 8;
            ctx.fillStyle = `rgba(250, 204, 21, ${spAlpha})`;
            ctx.beginPath();
            ctx.arc(spX, spY, 1.8, 0, Math.PI * 2, false);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * 5. İSKANDİNAV MÜŞTERİ BEKLEME KOLTUĞU & KAHVE SEHPASI (Sittable Scandinavian Lounge)
     * Yumuşak krem/oatmeal bukle kumaş, kıvrılmış uyuyan yavru köpek & kahveli ahşap sehpa
     */
    function drawCustomerWaitingLounge(ctx, lx, ly, lw, lh, now) {
        ctx.save();

        // 1. Zemin Ambiyans Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.ellipse(lx + lw / 2, ly + lh + 3, lw * 0.5, 9, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // 2. Kavisli İskandinav Bukle Koltuk Gövdesi (Cream / Oatmeal Bouclé)
        const sofaGrad = ctx.createLinearGradient(lx, ly, lx, ly + lh);
        sofaGrad.addColorStop(0, '#fefbf6');
        sofaGrad.addColorStop(0.5, '#f5efe6');
        sofaGrad.addColorStop(1, '#e7ded1');
        ctx.fillStyle = sofaGrad;
        ctx.beginPath();
        ctx.roundRect(lx, ly, lw, lh, 14);
        ctx.fill();
        ctx.strokeStyle = "#d6c7b2";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Üst Sırt Minderi & Dikey Dikiş Fitilleri
        ctx.fillStyle = "#ede5d8";
        ctx.beginPath();
        ctx.roundRect(lx + 4, ly + 3, lw - 8, 14, 8);
        ctx.fill();
        ctx.strokeStyle = "rgba(180, 160, 140, 0.35)";
        ctx.lineWidth = 1;
        for (let fx = lx + 28; fx < lx + lw - 20; fx += 26) {
            ctx.beginPath();
            ctx.moveTo(fx, ly + 4);
            ctx.lineTo(fx, ly + 16);
            ctx.stroke();
        }

        // 3 Oturma Minderi Bölümü (3-Seater Cushions)
        const seatW = (lw - 18) / 3;
        for (let i = 0; i < 3; i++) {
            const sx = lx + 9 + (i * seatW);
            ctx.fillStyle = "#faf6ef";
            ctx.beginPath();
            ctx.roundRect(sx, ly + 18, seatW - 5, lh - 24, 7);
            ctx.fill();
            ctx.strokeStyle = "#e2d6c5";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Minder Düğmeleri
            ctx.fillStyle = "#cbbca8";
            ctx.beginPath();
            ctx.arc(sx + (seatW - 5) / 2, ly + 31, 2, 0, Math.PI * 2, false);
            ctx.fill();
        }

        // Tapered Masif Meşe Konik Ayaklar & Pirinç Pabuçlar
        const legOffsets = [14, lw - 20];
        legOffsets.forEach(ox => {
            ctx.fillStyle = "#854d0e";
            ctx.fillRect(lx + ox, ly + lh - 2, 6, 8);
            ctx.fillStyle = "#facc15"; // Pirinç pabuç
            ctx.fillRect(lx + ox, ly + lh + 4, 6, 2.5);
        });

        // 3. DEKORATİF KIRLENTLER (Throw Pillows)
        // A) Sağ Minderde: Güneş Sarısı Örgü Yastık
        const pilX = lx + lw - 48, pilY = ly + 20;
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.roundRect(pilX, pilY, 20, 20, 5);
        ctx.fill();
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Örgü deseni
        ctx.strokeStyle = "rgba(161, 98, 7, 0.4)";
        ctx.beginPath();
        ctx.moveTo(pilX + 4, pilY + 4); ctx.lineTo(pilX + 16, pilY + 16);
        ctx.moveTo(pilX + 16, pilY + 4); ctx.lineTo(pilX + 4, pilY + 16);
        ctx.stroke();

        // B) Orta Minder Sağında: Mercan Pembe Pati Nakışlı Kadife Yastık
        const pil2X = lx + lw - 74, pil2Y = ly + 22;
        ctx.fillStyle = "#fb7185";
        ctx.beginPath();
        ctx.roundRect(pil2X, pil2Y, 18, 18, 5);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        drawWallPawPrint(ctx, pil2X + 9, pil2Y + 8, 7);

        // 4. SOL MİNDERDE KIVRILMIŞ UYUYAN YAVRU KÖPEK (Sleeping Golden Pup)
        const pupX = lx + 48;
        const pupY = ly + 27;
        const pupBreath = Math.sin(now * 0.003) * 0.6;

        ctx.save();
        ctx.translate(pupX, pupY);

        // Uyuyan yavru köpek gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
        ctx.beginPath();
        ctx.ellipse(0, 7, 15, 6, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Kıvrılmış bal rengi gövde
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(0, 0, 15 + pupBreath * 0.4, 10 + pupBreath * 0.4, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Beyaz göğüs lekesi
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.ellipse(-2, 3, 7, 5, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Kıvrık kafa
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(10, 0, 7.5, 0, Math.PI * 2, false);
        ctx.fill();

        // Düşük yumuşak kulak
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.ellipse(9, 1, 3.5, 6, 0.4, 0, Math.PI * 2, false);
        ctx.fill();

        // Minik siyah burun & uyuyan kapalı göz yayı
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(16, 1, 1.3, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(11, -1, 1.4, 0.2, Math.PI - 0.2, false);
        ctx.stroke();

        // Vücuda sokulmuş kıvrık kuyruk & beyaz pati
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-12, 1);
        ctx.quadraticCurveTo(-17, 6, -11, 8);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(4, 7, 3, 2, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Yavru köpekten süzülen minik Zzz
        for (let pz = 0; pz < 2; pz++) {
            const zProgress = ((now * 0.0006 + pz * 0.5) % 1.0);
            const zx = 14 + zProgress * 6;
            const zy = -6 - zProgress * 16;
            const zAlpha = Math.sin(zProgress * Math.PI) * 0.8;
            ctx.fillStyle = `rgba(168, 85, 247, ${zAlpha})`;
            ctx.font = `bold ${Math.round(7 + zProgress * 3)}px sans-serif`;
            ctx.fillText("z", zx, zy);
        }

        ctx.restore();

        // 5. YUVARLAK MASİF MEŞE KAHVE SEHPASI (Solid Oak Coffee Table & Mug & Magazine)
        // Koltuğun hemen önünde şık ve ferah orta sehpa
        const tabX = lx + lw * 0.52;
        const tabY = ly + lh + 12;
        const tabRx = 23, tabRy = 10;

        // Sehpa zemin gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.ellipse(tabX, tabY + 9, tabRx * 1.1, tabRy * 0.9, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Pirinç saç tokası ayaklar (Hairpin Brass Legs)
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tabX - 16, tabY + 4); ctx.lineTo(tabX - 18, tabY + 14);
        ctx.moveTo(tabX, tabY + 6); ctx.lineTo(tabX, tabY + 16);
        ctx.moveTo(tabX + 16, tabY + 4); ctx.lineTo(tabX + 18, tabY + 14);
        ctx.stroke();

        // Masif Meşe Ahşap Tabla & Yıllık Halka Deseni
        let tabGrad = ctx.createLinearGradient(tabX - tabRx, tabY, tabX + tabRx, tabY);
        tabGrad.addColorStop(0, '#b45309');
        tabGrad.addColorStop(0.5, '#d97706');
        tabGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = tabGrad;
        ctx.beginPath();
        ctx.ellipse(tabX, tabY, tabRx, tabRy, 0, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Ahşap damar halkası
        ctx.strokeStyle = "rgba(254, 240, 138, 0.35)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.ellipse(tabX, tabY, tabRx * 0.6, tabRy * 0.6, 0, 0, Math.PI * 2, false);
        ctx.stroke();

        // Masa Üstü Obje 1: "Pati & Dost" Dergisi
        const magX = tabX - 14, magY = tabY - 5;
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.roundRect(magX, magY, 13, 9, 1.5);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(magX + 2, magY + 2, 9, 3);
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(magX + 6.5, magY + 6.5, 1.5, 0, Math.PI * 2, false);
        ctx.fill();

        // Masa Üstü Obje 2: Sıcak Buharı Tüten Seramik Kahve Kupası
        const mugX = tabX + 7, mugY = tabY - 6;
        // Kupa gövdesi (Pastel Turkuaz)
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.roundRect(mugX, mugY, 8, 8, [1, 1, 3, 3]);
        ctx.fill();
        // Kulp
        ctx.strokeStyle = "#0891b2";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mugX + 8.5, mugY + 4, 2.5, -Math.PI / 2, Math.PI / 2, false);
        ctx.stroke();
        // Kahve yüzeyi
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.ellipse(mugX + 4, mugY + 1, 3.5, 1.5, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Tüten sıcak kahve buharı (Steaming Vapor Wisps)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
        ctx.lineWidth = 0.9;
        for (let st = 0; st < 2; st++) {
            const steamPhase = ((now * 0.0018 + st * 0.5) % 1.0);
            const stX = mugX + 2 + st * 4 + Math.sin(now * 0.004 + st) * 2;
            const stY = mugY - 2 - steamPhase * 10;
            const stAlpha = Math.sin(steamPhase * Math.PI) * 0.6;
            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${stAlpha})`;
            ctx.beginPath();
            ctx.moveTo(stX, stY + 3);
            ctx.quadraticCurveTo(stX + 2, stY + 1, stX - 1, stY - 2);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
    }

    /**
     * DUVAR DEKORU 1: RETRO KIT-CAT SARKAÇLI DUVAR SAATİ (Kit-Cat Klock)
     * Sağa-sola bakan animasyonlu büyük kedi gözleri & sallanan sarkaç kuyruk
     */
    function drawKitCatPendulumClock(ctx, cx, cy, now) {
        ctx.save();

        const eyeShift = Math.sin(now * 0.0032) * 2.8;
        const tailAngle = Math.sin(now * 0.0032) * 0.35;

        // Duvara bıraktığı gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy + 28, 14, 26, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Sallanan Sarkaç Kuyruk (Body altından asılı)
        ctx.save();
        ctx.translate(cx, cy + 50);
        ctx.rotate(tailAngle);
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-5, 14, 3, 26);
        ctx.stroke();
        // Kuyruk beyaz ucu
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(1, 22);
        ctx.lineTo(3, 26);
        ctx.stroke();
        ctx.restore();

        // Parlak Siyah Kedi Gövdesi (Glossy Black Clock Body)
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 30, 13, 20, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Kedi Kafası & Sivri Kulaklar
        ctx.beginPath();
        ctx.arc(cx, cy + 8, 11, 0, Math.PI * 2, false);
        // Kulaklar
        ctx.moveTo(cx - 10, cy + 4); ctx.lineTo(cx - 13, cy - 8); ctx.lineTo(cx - 3, cy);
        ctx.moveTo(cx + 3, cy); ctx.lineTo(cx + 13, cy - 8); ctx.lineTo(cx + 10, cy + 4);
        ctx.closePath();
        ctx.fill();

        // Büyük Beyaz Karikatür Göz Yuvaları
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(cx - 4.5, cy + 6, 4.2, 5.5, 0, 0, Math.PI * 2, false);
        ctx.ellipse(cx + 4.5, cy + 6, 4.2, 5.5, 0, 0, Math.PI * 2, false);
        ctx.fill();

        // Sağa-Sola Senkronize Hareket Eden Göz Bebekleri
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(cx - 4.5 + eyeShift, cy + 6, 2.2, 0, Math.PI * 2, false);
        ctx.arc(cx + 4.5 + eyeShift, cy + 6, 2.2, 0, Math.PI * 2, false);
        ctx.fill();

        // Beyaz Papyon (White Bowtie)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(cx, cy + 18);
        ctx.lineTo(cx - 7, cy + 15);
        ctx.lineTo(cx - 7, cy + 21);
        ctx.lineTo(cx, cy + 18);
        ctx.lineTo(cx + 7, cy + 15);
        ctx.lineTo(cx + 7, cy + 21);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#dc2626"; // Kırmızı papyon düğmesi
        ctx.beginPath();
        ctx.arc(cx, cy + 18, 1.8, 0, Math.PI * 2, false);
        ctx.fill();

        // Gövdedeki Saat Kadranı (Clock Dial)
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(cx, cy + 32, 9, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Akrep & Yelkovan (Altın İbreler)
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 32); ctx.lineTo(cx - 3, cy + 27); // Akrep
        ctx.moveTo(cx, cy + 32); ctx.lineTo(cx + 4, cy + 28); // Yelkovan
        ctx.stroke();

        ctx.restore();
    }

    /**
     * DUVAR DEKORU 2: TAVANDAN SARKAN MAKROME SARMAŞIK BİTKİSİ (Hanging Macrame Plant)
     * Örgülü pamuk ipler, ahşap boncuklar, sırlı saksı ve sarkan sarmaşık dalları
     */
    function drawHangingMacramePlant(ctx, cx, cy, now) {
        ctx.save();

        const sway = Math.sin(now * 0.002 + cx) * 2.2;
        const potY = cy + 54;

        // Tavandan Sarkan Makrome İpleri
        ctx.strokeStyle = "#fef3c7";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx - 10 + sway, potY);
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + 10 + sway, potY);
        ctx.stroke();

        // Makrome Düğümleri ve Ahşap Boncuklar
        const beads = [cy + 15, cy + 32];
        beads.forEach(by => {
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.arc(cx + sway * ((by - cy) / 54), by, 2.5, 0, Math.PI * 2, false);
            ctx.fill();
        });

        // Sırlı Terracotta / Adaçayı Saksı
        ctx.save();
        ctx.translate(sway, 0);

        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.roundRect(cx - 12, potY, 24, 16, [2, 2, 8, 8]);
        ctx.fill();
        ctx.strokeStyle = "#9a3412";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Saksı Kenar Bordürü
        ctx.fillStyle = "#ea580c";
        ctx.fillRect(cx - 14, potY - 2, 28, 4);

        // Saksıdan Aşağı Sarkan Sarmaşık Yaprakları (Trailing Pothos / Ivy Vines)
        const vines = [
            { ox: -8, len: 32, col: '#15803d' },
            { ox: -2, len: 44, col: '#16a34a' },
            { ox: 4, len: 52, col: '#22c55e' },
            { ox: 9, len: 36, col: '#15803d' }
        ];

        vines.forEach((v, vi) => {
            const vSway = Math.sin(now * 0.0025 + vi) * 3;
            const rootX = cx + v.ox;
            const rootY = potY + 12;

            ctx.strokeStyle = v.col;
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(rootX, rootY);
            ctx.quadraticCurveTo(rootX + vSway, rootY + v.len * 0.5, rootX + vSway * 1.5, rootY + v.len);
            ctx.stroke();

            // Yaprak kümeleri
            for (let lf = 8; lf < v.len; lf += 10) {
                const lfx = rootX + vSway * (lf / v.len);
                const lfy = rootY + lf;
                ctx.fillStyle = (lf % 20 === 0) ? '#86efac' : v.col;
                ctx.beginPath();
                ctx.ellipse(lfx + (vi % 2 === 0 ? 3 : -3), lfy, 3.5, 2.2, 0.4 * (vi % 2 === 0 ? 1 : -1), 0, Math.PI * 2, false);
                ctx.fill();
            }
        });

        ctx.restore();
        ctx.restore();
    }

    /**
     * 6. MODERN İSKANDİNAV KLİNİK BANKOSU (Boutique Reception Desk)
     */
    function drawPetShopReceptionCounter(ctx, cx, cy, cw, ch, now) {
        ctx.save();

        // 1. Zemin İletişim / Ambiyans Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx + cw / 2, cy + ch + 3, cw * 0.52, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. MODERN İSKANDİNAV KLİNİK BANKOSU GÖVDESİ
        // Banko Gövdesi (Koyu Meşe Arka Panel)
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.roundRect(cx, cy + 8, cw, ch - 8, [6, 6, 10, 10]);
        ctx.fill();

        // Dikey Akustik Ahşap Çıtalar (Slatted Wood Front)
        const slatW = 5;
        const slatGap = 3;
        for (let sx = cx + 8; sx < cx + cw - 8; sx += (slatW + slatGap)) {
            // Çıta gölgesi
            ctx.fillStyle = "#78350f";
            ctx.fillRect(sx, cy + 12, slatW, ch - 22);
            // Çıta ön yüzey meşe rengi
            ctx.fillStyle = "#b45309";
            ctx.fillRect(sx, cy + 12, slatW - 1, ch - 22);
            // Çıta sol ışık hattı
            ctx.fillStyle = "#d97706";
            ctx.fillRect(sx, cy + 12, 1, ch - 22);
        }

        // Fırçalanmış Pirinç Alt Süpürgelik Bazası (Brass Kickplate)
        let brassGrad = ctx.createLinearGradient(cx, cy + ch - 12, cx, cy + ch);
        brassGrad.addColorStop(0, "#facc15");
        brassGrad.addColorStop(0.5, "#eab308");
        brassGrad.addColorStop(1, "#ca8a04");
        ctx.fillStyle = brassGrad;
        ctx.beginPath();
        ctx.roundRect(cx, cy + ch - 12, cw, 12, [0, 0, 8, 8]);
        ctx.fill();
        ctx.strokeStyle = "#a16207";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Ön Cephede Şık Işıklı Klinik Tabelası (Boutique Reception Badge)
        const badgeW = 152;
        const badgeH = 26;
        const badgeX = cx + (cw - badgeW) / 2;
        const badgeY = cy + ch * 0.48;

        // Tabela arkası sıcak ambiyans parıltısı
        ctx.fillStyle = "rgba(250, 204, 21, 0.20)";
        ctx.beginPath();
        ctx.roundRect(badgeX - 4, badgeY - 3, badgeW + 8, badgeH + 6, 14);
        ctx.fill();

        // Tabela gövdesi
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
        ctx.fill();
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Tabela metni
        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🐾 PATİ DANIŞMA & SAHİPLENME", badgeX + badgeW / 2, badgeY + 16.5);

        // 3. CİLALI İTALYAN CARRARA BEYAZ MERMER TEZGAH (2.5D Kavisli Üst Tablo)
        const marbleGrad = ctx.createLinearGradient(cx, cy, cx + cw, cy);
        marbleGrad.addColorStop(0, '#f8fafc');
        marbleGrad.addColorStop(0.5, '#ffffff');
        marbleGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = marbleGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 6, cy, cw + 12, 18, 6);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Mermer altı gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(cx - 3, cy + 18, cw + 6, 3);

        // 4. MASAÜSTÜ LÜKS BUTİK DONATILAR
        // A) İnce Çerçeveli Hepsi-Bir-Arada Klinik PC (All-In-One Touchscreen)
        const pcX = cx + 18, pcY = cy - 20;
        ctx.fillStyle = "#64748b"; // Metalik stand
        ctx.fillRect(pcX + 13, pcY + 18, 5, 8);
        ctx.beginPath();
        ctx.ellipse(pcX + 15, pcY + 26, 8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#0f172a"; // İnce çerçeve
        ctx.beginPath();
        ctx.roundRect(pcX, pcY, 30, 20, 3);
        ctx.fill();
        ctx.fillStyle = "#0284c7"; // Ekran iç ışığı
        ctx.fillRect(pcX + 2, pcY + 2, 26, 16);
        // Ekranda EKG Kalp Ritmi & Pati Çizgisi
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(pcX + 4, pcY + 10);
        ctx.lineTo(pcX + 11, pcY + 10);
        ctx.lineTo(pcX + 14, pcY + 5);
        ctx.lineTo(pcX + 17, pcY + 15);
        ctx.lineTo(pcX + 20, pcY + 10);
        ctx.lineTo(pcX + 26, pcY + 10);
        ctx.stroke();

        // B) Sahiplenme Kayıt Altlığı & Kalem (Adoption Clipboard)
        const clipX = cx + 64, clipY = cy - 5;
        ctx.fillStyle = "#92400e"; // Ahşap altlık
        ctx.beginPath();
        ctx.roundRect(clipX, clipY, 22, 16, 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff"; // Kağıt yaprağı
        ctx.fillRect(clipX + 2, clipY + 2, 18, 12);
        ctx.fillStyle = "#facc15"; // Metal altın klips
        ctx.fillRect(clipX + 7, clipY - 1, 8, 3);
        // Kağıt yazı çizgileri
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(clipX + 4, clipY + 5, 12, 1);
        ctx.fillRect(clipX + 4, clipY + 8, 14, 1);
        ctx.fillRect(clipX + 4, clipY + 11, 9, 1);

        // C) Pirinç Resepsiyon Zili (Brass Desk Bell)
        const bellX = cx + 100, bellY = cy - 6;
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.ellipse(bellX + 7, bellY + 9, 7, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#854d0e"; // Taban
        ctx.fillRect(bellX + 2, bellY + 7, 10, 2);
        ctx.fillStyle = "#facc15"; // Pirinç kubbe
        ctx.beginPath();
        ctx.arc(bellX + 7, bellY + 6, 6, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#ffffff"; // Tepe düğmesi
        ctx.fillRect(bellX + 6, bellY - 1, 2, 2);

        // D) Seramik Saksıda Sukulent / Çiçek
        const potX = cx + cw - 72, potY = cy - 12;
        ctx.fillStyle = "#f8fafc"; // Beyaz porselen saksı
        ctx.beginPath();
        ctx.roundRect(potX, potY + 6, 16, 12, [2, 2, 4, 4]);
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.stroke();
        // Yeşil sukulent yaprakları
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.ellipse(potX + 8, potY + 4, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#059669";
        ctx.beginPath();
        ctx.arc(potX + 5, potY + 2, 3, 0, Math.PI * 2);
        ctx.arc(potX + 11, potY + 2, 3, 0, Math.PI * 2);
        ctx.arc(potX + 8, potY, 3, 0, Math.PI * 2);
        ctx.fill();

        // E) Masa Üzeri: Cam Ödül Maması Kavanozu (Bone Treats)
        const jarX = cx + cw - 40, jarY = cy - 14;
        ctx.fillStyle = "rgba(224, 242, 254, 0.45)";
        ctx.beginPath();
        ctx.roundRect(jarX, jarY, 18, 16, 3);
        ctx.fill();
        ctx.strokeStyle = "rgba(186, 230, 253, 0.8)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // İçindeki kemik bisküviler
        ctx.fillStyle = "#d97706";
        ctx.fillRect(jarX + 3, jarY + 6, 12, 7);
        // Kırmızı parlak kapak
        ctx.fillStyle = "#dc2626";
        ctx.beginPath();
        ctx.roundRect(jarX - 1, jarY - 3, 20, 4, 2);
        ctx.fill();

        ctx.restore();
    }

    // --- VETERİNER DR. SELİM HEKİMOĞLU REPLİK & KONUŞMA SİSTEMİ ---
    let vetLastQuoteTime = Date.now(); // İlk açılışta hemen bir replik söyler (7 sn ekranda kalır, sonra 60 sn ara)
    const VET_QUOTES = [
        "Minik dostlarımızın aşı ve parazit kontrollerini asla ihmal etmeyin! 🐾",
        "Kedilerin taze su içmesi böbrek sağlığı için hayati önem taşır. 🐱💧",
        "Düzenli yürüyüş ve sevgi, bir köpeğin en iyi ilacıdır! 🐶❤️",
        "Kliniğimizde tırnak bakımı, tüy tarama ve sevgi seanslarımız ücretsizdir! ✨",
        "Tahlillerimiz tertemiz çıktı, kliniğimizdeki tüm patilere maşallah! 🩺",
        "Bir evcil hayvan sahiplenmek bir heves değil, ömürlük bir dostluktur. 🐾",
        "Köpeğinizi ödüllendirirken kaliteli kemik ve bisküvi tercih edin! 🦴",
        "Gözlerindeki ışık, tüylerindeki parlaklık sağlıklı beslenmenin aynasıdır! 🌟",
        "Hoş geldin! Sevimli dostunun periyodik aşı kartını getirdin mi? 📋"
    ];

    window.triggerVeterinerGreeting = function() {
        vetLastQuoteTime = Date.now();
    };

    /**
     * Veteriner İçin Özel Replik Konuşma Baloncuğu (Semihus Aydınus & VIP Club Standardı)
     */
    function drawVeterinerSpeechBubble(ctx, x, y, text) {
        ctx.save();
        ctx.font = "bold 10px sans-serif";
        const textWidth = ctx.measureText(text).width;
        const padX = 12;
        const padY = 7;
        const bW = Math.max(130, textWidth + padX * 2);
        const bH = 24;
        const bX = Math.max(10, Math.min(CANV_W - bW - 10, x - bW / 2));
        const bY = y - bH;

        // Balon Arka Planı (Koyu Şık Kart & Zümrüt Yeşili Çerçeve)
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, bH, 6);
        ctx.fill();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Balon Kuyruğu (Doktorun başına doğru işaret eden minik üçgen)
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.beginPath();
        ctx.moveTo(x - 5, bY + bH - 0.5);
        ctx.lineTo(x + 5, bY + bH - 0.5);
        ctx.lineTo(x, bY + bH + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 5, bY + bH - 0.5);
        ctx.lineTo(x, bY + bH + 6);
        ctx.lineTo(x + 5, bY + bH - 0.5);
        ctx.stroke();

        // Metin
        ctx.fillStyle = "#a7f3d0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, bX + bW / 2, bY + bH / 2);
        ctx.restore();
    }

    /**
     * VETERİNER DR. SELİM HEKİMOĞLU NPC ÇİZİMİ (2.5D Semihus Aydınus & VIP Club Standardı Tam Model)
     * Karizmatik, entelektüel, güven veren hekim:
     * - Ortopedik beyaz medikal sabo terlikleri (lacivert taban, gümüş toka, havalandırma delikleri)
     * - Cerrahi teal/mavi medikal scrubs pantolonu
     * - Bembeyaz hekim önlüğü (lab coat), V-yaka iç scrubs, klapalar, yan cepler
     * - Esnek siyah stetoskop boyunda asılı, göğüste krom tambur & diyafram
     * - Göğüs cebinde altın Caduceus brövesi, kırmızı/mavi tükenmez kalemler, muayene feneri & Dr. Selim kimlik kartı
     * - Sol elinde medikal muayene panosu (clipboard - hasta takip formu & pati damgası), sağ elinde köpek bisküvisi
     * - İnce gümüş çerçeveli hekim gözlüğü, lens parıltısı, göz kırpma, yana taranmış kır saçlar, bakımlı ince sakal
     * - Semihus Aydınus standardı zümrüt isim etiketi, [E] etkileşim pili ve 60 saniyede bir veteriner replik baloncukları
     */
    function drawVeterinerDoctorNPC(ctx, npcX, npcY, now, myP, mouseX, mouseY) {
        const scale = 1.30; // Semihus Aydınus & VIP Club standardı %30 büyütme
        const groundY = npcY + 16; // Ayakların yere bastığı zemin temas noktası
        const dist = (myP && typeof myP.x === 'number') ? Math.hypot(myP.x - npcX, myP.y - npcY) : 999;
        const isHover = (mouseX >= npcX - 45 && mouseX <= npcX + 45 && mouseY >= npcY - 70 && mouseY <= npcY + 30);

        ctx.save();
        // Zemin temas noktası referans alınarak büyütme
        ctx.translate(npcX, groundY);
        ctx.scale(scale, scale);
        ctx.translate(-npcX, -groundY);

        // 1. ÇİFT KATMANLI KONTAK GÖLGELERİ (3D Solid Grounding)
        // A) Yaygın Ortam Gölgesi (Ambient Occlusion)
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(npcX, npcY + 16, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // B) Çekirdek Yere Mıhlama Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
        ctx.beginPath();
        ctx.ellipse(npcX, npcY + 15, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. DİNAMİK ANİMASYON DEĞERLERİ
        const breathe = Math.sin(now / 500) * 1.1;
        const glance = Math.sin(now / 900);
        const isBlinking = ((now % 4200) < 170);
        const glassesGlint = (Math.sin(now / 350) > 0.7);

        // A) Ortopedik Beyaz Medikal Sabo Terlikleri (Doctor Clog Shoes)
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.roundRect(npcX - 7.5, npcY + 10, 6.5, 7.5, [3, 3, 1, 1]);
        ctx.roundRect(npcX + 1.5, npcY + 10, 6.5, 7.5, [3, 3, 1, 1]);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Lacivert Ortopedik Yastıklama Tabanı
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(npcX - 7.5, npcY + 14.8, 6.5, 2.7);
        ctx.fillRect(npcX + 1.5, npcY + 14.8, 6.5, 2.7);

        // Terlik Gümüş Yan Tokaları & Hava Delikleri
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(npcX - 7.5, npcY + 11.5, 1.6, 1.2);
        ctx.fillRect(npcX + 6.4, npcY + 11.5, 1.6, 1.2);
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(npcX - 4.5, npcY + 12, 1, 1);
        ctx.fillRect(npcX + 3.5, npcY + 12, 1, 1);

        // B) Cerrahi Teal / Medikal Mavi Scrubs Pantolonu
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(npcX - 8.5, npcY - 1, 7.5, 12);
        ctx.fillRect(npcX + 1, npcY - 1, 7.5, 12);
        // Pantolon Yan Cepleri ve Kumaş Dikişleri
        ctx.fillStyle = "#0369a1";
        ctx.fillRect(npcX - 9, npcY + 3, 1.5, 5);
        ctx.fillRect(npcX + 7.5, npcY + 3, 1.5, 5);
        ctx.fillRect(npcX - 1, npcY - 1, 2, 12); // Arakatman gölgesi

        // C) Gövde: V-Yaka Scrubs İç Forma + Bembeyaz Hekim Önlüğü (Lab Coat)
        // İç Medikal Forma
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.roundRect(npcX - 9, npcY - 13 + breathe, 18, 14, 3);
        ctx.fill();
        // V-Yaka Koyu Hat
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.moveTo(npcX - 4, npcY - 13 + breathe);
        ctx.lineTo(npcX, npcY - 6 + breathe);
        ctx.lineTo(npcX + 4, npcY - 13 + breathe);
        ctx.closePath();
        ctx.fill();

        // Bembeyaz Hekim Önlüğü (Lab Coat)
        ctx.fillStyle = "#ffffff";
        // Sol kanat
        ctx.beginPath();
        ctx.roundRect(npcX - 10, npcY - 13.5 + breathe, 7.5, 17, [3, 1, 2, 2]);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.9;
        ctx.stroke();
        // Sağ kanat
        ctx.beginPath();
        ctx.roundRect(npcX + 2.5, npcY - 13.5 + breathe, 7.5, 17, [1, 3, 2, 2]);
        ctx.fill();
        ctx.stroke();

        // Önlük Yan Cepleri
        ctx.strokeStyle = "#cbd5e1";
        ctx.strokeRect(npcX - 9, npcY + 0.5 + breathe, 5.5, 3.5);
        ctx.strokeRect(npcX + 3.5, npcY + 0.5 + breathe, 5.5, 3.5);

        // Sol Göğüs Cebi: Kalemler, Muayene Feneri & Altın Caduceus Brövesi
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(npcX - 9, npcY - 8 + breathe, 5.5, 4.5);
        ctx.strokeRect(npcX - 9, npcY - 8 + breathe, 5.5, 4.5);
        // Kırmızı ve Mavi Muayene Kalemi Klipleri
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(npcX - 8.5, npcY - 10 + breathe, 1.2, 3);
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(npcX - 6.5, npcY - 10.5 + breathe, 1.2, 3.5);
        // Gümüş Medikal Pupil Feneri
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(npcX - 4.5, npcY - 9.5 + breathe, 1.0, 2.5);
        // Altın Caduceus Hekim Rozeti (Tıbbi Yılanlı Asa)
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(npcX - 6.2, npcY - 5.5 + breathe, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Sağ Göğüs: Hekim İsim Kartı (Dr. Selim)
        ctx.fillStyle = "rgba(2, 132, 199, 0.2)";
        ctx.fillRect(npcX + 4, npcY - 7 + breathe, 5.5, 3);
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 0.6;
        ctx.strokeRect(npcX + 4, npcY - 7 + breathe, 5.5, 3);
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(npcX + 4.5, npcY - 6.2 + breathe, 1.5, 1.5); // Fotoğraf minyatürü

        // D) Esnek Boyun Stetoskobu (Flexible Black Stethoscope)
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 1.5;
        // Boyun askı halkası
        ctx.beginPath();
        ctx.arc(npcX, npcY - 14 + breathe, 5.0, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();
        // Göğse inen kordon
        ctx.beginPath();
        ctx.moveTo(npcX - 3.5, npcY - 10 + breathe);
        ctx.quadraticCurveTo(npcX - 1, npcY - 4 + breathe, npcX, npcY - 2 + breathe);
        ctx.stroke();
        // Krom Çan & Diyafram Tamburu (Stainless Steel Chestpiece)
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.arc(npcX, npcY - 1.5 + breathe, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(npcX - 0.7, npcY - 2.2 + breathe, 1.4, 1.4);

        // E) Kollar & Aksesuarlar
        // Sol Kol: Beyaz önlük kolu + Sol elde ahşap Aşı/Muayene Panosu (Clipboard)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(npcX - 12, npcY - 12 + breathe, 3.5, 7.5);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(npcX - 12, npcY - 12 + breathe, 3.5, 7.5);
        ctx.fillStyle = "#ffd1a4";
        ctx.fillRect(npcX - 12, npcY - 4.5 + breathe, 3.5, 3.5); // Sol El

        // Ahşap Aşı Takip Panosu (Medical Clipboard)
        const panX = npcX - 17, panY = npcY - 7 + breathe;
        ctx.fillStyle = "#78350f"; // Masif ceviz pano
        ctx.beginPath();
        ctx.roundRect(panX, panY, 8.5, 11, 1.5);
        ctx.fill();
        ctx.fillStyle = "#ffffff"; // Sağlık formu kağıdı
        ctx.fillRect(panX + 1, panY + 1.5, 6.5, 8.5);
        ctx.fillStyle = "#facc15"; // Altın klips
        ctx.fillRect(panX + 2.5, panY - 0.5, 3.5, 2);
        // Form üzerindeki pati logosu ve satır çizgileri
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.arc(panX + 4.2, panY + 3.5, 1.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(panX + 2, panY + 5.5, 4.5, 0.8);
        ctx.fillRect(panX + 2, panY + 7.2, 4.0, 0.8);

        // Sağ Kol: Beyaz önlük kolu + Sağ elde altın sarısı Pati Ödül Bisküvisi
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(npcX + 8.5, npcY - 12 + breathe, 3.5, 7.5);
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.8;
        ctx.strokeRect(npcX + 8.5, npcY - 12 + breathe, 3.5, 7.5);
        ctx.fillStyle = "#ffd1a4";
        ctx.fillRect(npcX + 8.5, npcY - 4.5 + breathe, 3.5, 3.5); // Sağ El

        // Altın Kemik Ödül Bisküvisi (Dog Bone Treat)
        const boneX = npcX + 11.5, boneY = npcY - 4 + breathe;
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(boneX - 1, boneY, 5, 2);
        ctx.beginPath();
        ctx.arc(boneX - 1, boneY - 0.5, 1.2, 0, Math.PI * 2);
        ctx.arc(boneX - 1, boneY + 2.5, 1.2, 0, Math.PI * 2);
        ctx.arc(boneX + 4, boneY - 0.5, 1.2, 0, Math.PI * 2);
        ctx.arc(boneX + 4, boneY + 2.5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // F) Kafa, Boyun, Saçlar, Gözlükler, Göz Kırpma & Samimi Gülümseme
        ctx.fillStyle = "#ffd1a4";
        ctx.fillRect(npcX - 3, npcY - 16 + breathe, 6, 4); // Boyun
        ctx.beginPath();
        ctx.arc(npcX, npcY - 20 + breathe, 8.5, 0, Math.PI * 2); // Baş
        ctx.fill();

        // Şık, Yana Taranmış, Şakakları Kırlaşmış Hekim Saçları (Gentleman Side-Part)
        ctx.fillStyle = "#2d1b18";
        ctx.beginPath();
        ctx.arc(npcX, npcY - 21.5 + breathe, 8.8, Math.PI * 0.95, Math.PI * 2.05, false);
        ctx.lineTo(npcX + 8.6, npcY - 21.0 + breathe);
        ctx.lineTo(npcX + 7.8, npcY - 19.8 + breathe);
        ctx.quadraticCurveTo(npcX + 3.0, npcY - 23.5 + breathe, npcX - 1.0, npcY - 24.2 + breathe);
        ctx.quadraticCurveTo(npcX - 5.0, npcY - 23.2 + breathe, npcX - 7.8, npcY - 19.8 + breathe);
        ctx.lineTo(npcX - 8.6, npcY - 21.0 + breathe);
        ctx.closePath();
        ctx.fill();

        // Şakaklarda Karizmatik Gümüş/Gri Röfleler
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(npcX - 8.2, npcY - 22.0 + breathe, 1.4, 2.5);
        ctx.fillRect(npcX + 6.8, npcY - 22.0 + breathe, 1.4, 2.5);

        // Gözler (Canlı Göz Kırpma & Sağa Sola Bakış)
        const eyeShift = (glance > 0.35) ? 0.9 : ((glance < -0.35) ? -0.9 : 0);
        if (isBlinking) {
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(npcX - 4.0, npcY - 20.5 + breathe, 2.0, 0.2, Math.PI - 0.2);
            ctx.arc(npcX + 2.8, npcY - 20.5 + breathe, 2.0, 0.2, Math.PI - 0.2);
            ctx.stroke();
        } else {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.ellipse(npcX - 4.0, npcY - 20.5 + breathe, 2.4, 1.8, 0, 0, Math.PI * 2);
            ctx.ellipse(npcX + 2.8, npcY - 20.5 + breathe, 2.4, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(npcX - 4.0 + eyeShift, npcY - 20.5 + breathe, 1.1, 0, Math.PI * 2);
            ctx.arc(npcX + 2.8 + eyeShift, npcY - 20.5 + breathe, 1.1, 0, Math.PI * 2);
            ctx.fill();
            // Gözbebeği Işıltısı
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(npcX - 4.4 + eyeShift, npcY - 20.9 + breathe, 0.5, 0, Math.PI * 2);
            ctx.arc(npcX + 2.4 + eyeShift, npcY - 20.9 + breathe, 0.5, 0, Math.PI * 2);
            ctx.fill();
        }

        // İnce Tel Çerçeveli Gümüş Doktor Gözlükleri
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.roundRect(npcX - 6.2, npcY - 22.4 + breathe, 4.4, 3.6, 1.2);
        ctx.roundRect(npcX + 0.8, npcY - 22.4 + breathe, 4.4, 3.6, 1.2);
        ctx.stroke();
        // Burun köprüsü
        ctx.beginPath();
        ctx.moveTo(npcX - 1.8, npcY - 20.6 + breathe);
        ctx.lineTo(npcX + 0.8, npcY - 20.6 + breathe);
        ctx.stroke();
        // Cam Işıltısı
        if (glassesGlint) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
            ctx.fillRect(npcX - 5.5, npcY - 22.0 + breathe, 1.4, 1.4);
            ctx.fillRect(npcX + 1.5, npcY - 22.0 + breathe, 1.4, 1.4);
        }

        // Karizmatik İnce Bıyık / Çene Sakalı
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.ellipse(npcX - 0.5, npcY - 17.2 + breathe, 3.2, 1.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Samimi Doktor Gülümsemesi
        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(npcX - 0.5, npcY - 17.5 + breathe, 2.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // G) İSİM ETİKETİ (Semihus Aydınus & VIP Club Standardı)
        const tagY = npcY - 54 + breathe;
        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.beginPath();
        ctx.roundRect(npcX - 54, tagY, 108, 16, 5);
        ctx.fill();
        ctx.strokeStyle = isHover ? "#34d399" : "#10b981";
        ctx.lineWidth = isHover ? 2.0 : 1.4;
        ctx.stroke();

        ctx.fillStyle = isHover ? "#a7f3d0" : "#6ee7b7";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Dr. Selim Hekimoğlu", npcX, tagY + 11.5);

        // I) SOHBET / REPLİK BALONCUĞU (Semihus Aydınus standardı: 60 saniyede bir replik)
        const quoteDuration = 7000;  // 7 saniye ekranda kalma
        const quotePause = 60000;    // 60 saniye (1 dakika) bekleme
        const quoteInterval = quoteDuration + quotePause; // 67 saniye toplam döngü
        const elapsed = Math.max(0, now - vetLastQuoteTime);
        const cycleIndex = Math.floor(elapsed / quoteInterval);
        const timeInCycle = elapsed % quoteInterval;

        if (timeInCycle < quoteDuration) {
            const activeQuote = VET_QUOTES[cycleIndex % VET_QUOTES.length];
            drawVeterinerSpeechBubble(ctx, npcX, tagY - 8, activeQuote);
        }

        ctx.restore();
    }

    /**
     * ETKİLEŞİM VE TIKLAMA YÖNETİMİ
     */
    function handlePetShopInteractions(ctx, now) {
        if (typeof canvasMouseX === 'undefined' || typeof canvasMouseY === 'undefined') return;

        // 1. Dr. Selim Hekimoğlu & Klinik Bankosu Hover Etkileşimi (x: 630..965, y: 150..315)
        const isNpcHover = (canvasMouseX >= 630 && canvasMouseX <= 965 && canvasMouseY >= 150 && canvasMouseY <= 315);
        if (isNpcHover) {
            if (typeof setGameCursor === 'function') setGameCursor('pointer');
        }

        // 2. Butik Hayvan Kostüm Standı Hover Etkileşimi (x: 40..255, y: 360..505)
        const isBoutiqueHover = (canvasMouseX >= 40 && canvasMouseX <= 255 && canvasMouseY >= 360 && canvasMouseY <= 505);
        if (isBoutiqueHover) {
            if (typeof setGameCursor === 'function') setGameCursor('pointer');
        }

        // 3. Çıkış Kapısı Hover (Paspas: x: 350..650, y: 560..625)
        const isDoorHover = (canvasMouseX >= 350 && canvasMouseX <= 650 && canvasMouseY >= 570);
        if (isDoorHover) {
            if (typeof setGameCursor === 'function') setGameCursor('pointer');
            ctx.save();
            ctx.fillStyle = "#facc15";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🚪 Cadde'ye Çıkış (Tıkla)", 500, 560);
            ctx.restore();
        }
    }

    // -------------------------------------------------------------------------
    // 7. PET SHOP HAYVAN KOSTÜM BUTİĞİ VE CANLI KARAKTER ÖNİZLEME MOTORU
    // -------------------------------------------------------------------------
    const BOUTIQUE_ANIMAL_TRANSFORMATIONS = [
        {
            id: 'costume_panda',
            category: 'costumes',
            name: 'Panda Kostümü',
            cost: 2600,
            icon: '🐼',
            desc: 'Ağzında taze bambu filizi, 8 yönlü sevimli ve heybetli panda.'
        },
        {
            id: 'costume_lion',
            category: 'costumes',
            name: 'Savana Kralı Aslan',
            cost: 4800,
            icon: '🦁',
            desc: 'Görkemli kızıl yeleli, 4 patili izometrik kraliyet aslanı.'
        },
        {
            id: 'costume_elephant',
            category: 'costumes',
            name: 'Heybetli Gerçekçi Fil',
            cost: 4500,
            icon: '🐘',
            desc: 'Devasa gövdesi, kıvrık hortumu ve fildişi dişleriyle 2.5D fil.'
        },
        {
            id: 'costume_frog',
            category: 'costumes',
            name: 'Zıplayan Kurbağa',
            cost: 3200,
            icon: '🐸',
            desc: 'Yüksek parabolik zıplamalarla hoplayan sevimli zehirli kurbağa.'
        },
        {
            id: 'costume_trex',
            category: 'costumes',
            name: 'T-Rex',
            cost: 5000,
            icon: '🦖',
            desc: '2.5D izometrik 8 yönlü dev Jurassic T-Rex. Güçlü bacakları, savrulan kuyruğu ve jilet dişleriyle dinozorlar kralı.'
        },
        {
            id: 'costume_bird',
            category: 'costumes',
            name: 'Göklerin Kartalı',
            cost: 3500,
            icon: '🦅',
            desc: '8 yöne uçabilen, süzülen ve hareketsizken tüneyen asil kartal.'
        },
        {
            id: 'costume_spider',
            category: 'costumes',
            name: 'Sekiz Bacaklı Karadul',
            cost: 2900,
            icon: '🕷️',
            desc: '8 eklemli bacak ve kırmızı kum saati desenli gerçekçi örümcek.'
        },
        {
            id: 'costume_anaconda',
            category: 'costumes',
            name: 'Amazon Anakondası',
            cost: 4500,
            icon: '🐍',
            desc: 'S-kıvrımlarla sürünen, oturduğunda çöreklenip dik kafayla bakan dev yılan.'
        },
        {
            id: 'costume_cockroach',
            category: 'costumes',
            name: 'Huysuz Mafya Hamamböceği',
            cost: 3800,
            icon: '🪳',
            desc: 'Cilalı kitin zırhı ve silah çıkarıp havaya sıkan mafya böceği.'
        }
    ];

    const BOUTIQUE_ANIMAL_OUTFITS = [
        {
            id: 'outfit_k2_cat',
            category: 'outfits',
            name: 'K2 Sevimli Kedi Kostümü',
            cost: 3200,
            icon: '🐱',
            badge: 'Avatar 2 Özel',
            desc: 'Sallanan kuyruklu, kulak içi tüylü sevimli kapüşonlu, çanlı ve pati eldivenli kedi tulumu.'
        }
    ];

    const ALL_BOUTIQUE_ITEMS = [...BOUTIQUE_ANIMAL_TRANSFORMATIONS, ...BOUTIQUE_ANIMAL_OUTFITS];
    const BOUTIQUE_ANIMAL_COSTUMES = ALL_BOUTIQUE_ITEMS; // Geriye dönük uyumluluk
    let activeBoutiqueCategory = 'transformations'; // 'transformations' | 'outfits'

    let isBoutiqueModalOpen = false;
    let boutiquePreviewCostume = null;
    let boutiquePreviewFacing = 'down';
    let boutiqueDragStartX = 0;
    let boutiqueIsDragging = false;

    const BOUTIQUE_FACINGS = [
        { id: 'down', label: 'Ön (Güney)' },
        { id: 'down-left', label: 'Ön Sol' },
        { id: 'left', label: 'Sol (Batı)' },
        { id: 'up-left', label: 'Arka Sol' },
        { id: 'up', label: 'Arka (Kuzey)' },
        { id: 'up-right', label: 'Arka Sağ' },
        { id: 'right', label: 'Sağ (Doğu)' },
        { id: 'down-right', label: 'Ön Sağ' }
    ];

    function rotateBoutiqueAvatarPreview(delta) {
        if (typeof playSound === 'function') playSound('uiClick');
        let idx = BOUTIQUE_FACINGS.findIndex(f => f.id === boutiquePreviewFacing);
        if (idx === -1) idx = 0;
        idx = (idx + delta + BOUTIQUE_FACINGS.length) % BOUTIQUE_FACINGS.length;
        boutiquePreviewFacing = BOUTIQUE_FACINGS[idx].id;
        const badge = document.getElementById('boutiquePreviewFacingBadge');
        if (badge) badge.innerText = BOUTIQUE_FACINGS[idx].label;
        drawBoutiqueAvatarPreview();
    }

    function setupBoutiquePreviewCanvasDrag() {
        const canvas = document.getElementById('boutiqueAvatarPreviewCanvas');
        if (!canvas || canvas._boutiqueDragBound) return;
        canvas._boutiqueDragBound = true;

        canvas.addEventListener('mousedown', (e) => {
            boutiqueIsDragging = true;
            boutiqueDragStartX = e.clientX;
            canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!boutiqueIsDragging) return;
            const dx = e.clientX - boutiqueDragStartX;
            if (Math.abs(dx) > 18) {
                rotateBoutiqueAvatarPreview(dx > 0 ? 1 : -1);
                boutiqueDragStartX = e.clientX;
            }
        });

        window.addEventListener('mouseup', () => {
            if (boutiqueIsDragging) {
                boutiqueIsDragging = false;
                if (canvas) canvas.style.cursor = 'grab';
            }
        });

        // Mobil Dokunmatik Desteği
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches[0]) {
                boutiqueIsDragging = true;
                boutiqueDragStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        canvas.addEventListener('touchmove', (e) => {
            if (!boutiqueIsDragging || !e.touches || !e.touches[0]) return;
            const dx = e.touches[0].clientX - boutiqueDragStartX;
            if (Math.abs(dx) > 18) {
                rotateBoutiqueAvatarPreview(dx > 0 ? 1 : -1);
                boutiqueDragStartX = e.touches[0].clientX;
            }
        }, { passive: true });

        canvas.addEventListener('touchend', () => {
            boutiqueIsDragging = false;
        });
    }

    function drawBoutiqueAvatarPreview() {
        const canvas = document.getElementById('boutiqueAvatarPreviewCanvas');
        if (!canvas) return;
        const pCtx = canvas.getContext('2d');
        pCtx.clearRect(0, 0, canvas.width, canvas.height);

        const cX = canvas.width / 2;
        const cY = 122;

        // Platform Zemin Parıltı Elipsi
        pCtx.fillStyle = "rgba(168, 85, 247, 0.16)";
        pCtx.beginPath();
        pCtx.ellipse(cX, cY + 22, 54, 16, 0, 0, Math.PI * 2, false);
        pCtx.fill();
        pCtx.strokeStyle = "rgba(168, 85, 247, 0.55)";
        pCtx.lineWidth = 1.5;
        pCtx.stroke();

        pCtx.fillStyle = "rgba(168, 85, 247, 0.28)";
        pCtx.beginPath();
        pCtx.ellipse(cX, cY + 22, 34, 10, 0, 0, Math.PI * 2, false);
        pCtx.fill();

        const idleBob = Math.sin(Date.now() / 260) * 2.5;

        pCtx.save();
        pCtx.translate(cX, cY + idleBob);
        pCtx.scale(1.85, 1.85);

        // Zemin temas gölgesi
        pCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
        pCtx.beginPath();
        pCtx.ellipse(0, 22, 12, 5, 0, 0, Math.PI * 2, false);
        pCtx.fill();

        // Karakter avatarını klonla ve denenmekte olan kostümü uygula
        const baseAv = (typeof myAvatar !== 'undefined' && myAvatar) ? { ...myAvatar } : { model: 'classic_2', skinColor: '#facc15', color: '#3b82f6' };
        const previewAv = { ...baseAv };
        const userGen = (typeof getPlayerGender === 'function') ? getPlayerGender() : (typeof window !== 'undefined' ? (window.myGender || 'male') : 'male');
        previewAv.gender = userGen;
        previewAv.isFemale = (userGen === 'female');
        if (!previewAv.id && typeof window !== 'undefined') previewAv.id = window.myId || 'preview_self';
        if ((!previewAv.face || previewAv.face === 'none') && myAvatar && myAvatar.face && myAvatar.face !== 'none') {
            previewAv.face = myAvatar.face;
            previewAv.faceColor = myAvatar.faceColor || 'original';
        }

        if (boutiquePreviewCostume) {
            if (boutiquePreviewCostume === 'none' || boutiquePreviewCostume === 'costume_none') {
                previewAv.costume = null;
                previewAv.outfit = null;
            } else if (boutiquePreviewCostume.startsWith('outfit_') || boutiquePreviewCostume.startsWith('outfits_')) {
                previewAv.costume = null;
                previewAv.outfit = boutiquePreviewCostume;
                // Karakter 2'ye özel kedi kostümü denendiğinde Karakter 2 üzerinde net göster
                if (boutiquePreviewCostume === 'outfit_k2_cat' || boutiquePreviewCostume === 'outfits_outfit_k2_cat') {
                    previewAv.model = 'karakter_2';
                    previewAv.shirt = null;
                    previewAv.pants = null;
                    if (!previewAv.outfitColor || previewAv.outfitColor === 'original' || previewAv.color === '#3b82f6') {
                        previewAv.outfitColor = '#18181b';
                        previewAv.color = '#18181b';
                    }
                }
            } else {
                previewAv.costume = boutiquePreviewCostume;
                previewAv.outfit = boutiquePreviewCostume;
            }
        }

        const facing = boutiquePreviewFacing || 'down';
        const previewCycle = Date.now() / 250;
        const costumeId = previewAv.costume || (previewAv.outfit && previewAv.outfit.startsWith('costume_') ? previewAv.outfit : null);

        if (costumeId && typeof AnimalCostumeRenderer !== 'undefined' && AnimalCostumeRenderer.isCostume(costumeId)) {
            AnimalCostumeRenderer.draw(pCtx, 0, 0, previewAv, facing, false, false, previewCycle, true);
        } else if ((previewAv.model === 'karakter_2' || previewAv.outfit === 'outfit_k2_cat' || previewAv.outfit === 'outfits_outfit_k2_cat') && typeof Karakter2Renderer !== 'undefined') {
            Karakter2Renderer.draw(pCtx, 0, 0, previewAv, facing, false, 0, previewCycle, false, true);
        } else if (typeof drawClassic2Avatar === 'function') {
            drawClassic2Avatar(pCtx, 0, 0, previewAv, facing, false, 0, previewCycle, false, true);
        }

        pCtx.restore();
    }

    function boutiquePreviewLoop() {
        if (!isBoutiqueModalOpen) return;
        drawBoutiqueAvatarPreview();
        requestAnimationFrame(boutiquePreviewLoop);
    }

    function selectCostumeForPreview(costumeId) {
        if (typeof playSound === 'function') playSound('uiClick');
        boutiquePreviewCostume = costumeId;

        const badge = document.getElementById('boutiquePreviewStatusBadge');
        const item = ALL_BOUTIQUE_ITEMS.find(c => c.id === costumeId);
        if (badge) {
            if (item) {
                badge.innerText = `👀 Deneniyor: ${item.name}`;
                badge.style.color = '#fde047';
                badge.style.borderColor = '#facc15';
            } else {
                badge.innerText = '✨ Mevcut Görünüm';
                badge.style.color = '#c084fc';
                badge.style.borderColor = 'rgba(168, 85, 247, 0.3)';
            }
        }

        renderAnimalCostumeBoutiqueContent();
        drawBoutiqueAvatarPreview();
    }

    function switchBoutiqueCategory(cat) {
        if (typeof playSound === 'function') playSound('uiClick');
        activeBoutiqueCategory = (cat === 'outfits') ? 'outfits' : 'transformations';

        const tabTrans = document.getElementById('boutiqueTab_transformations');
        const tabOutfits = document.getElementById('boutiqueTab_outfits');
        const countBadge = document.getElementById('boutiqueCategoryCountBadge');

        if (tabTrans && tabOutfits) {
            if (activeBoutiqueCategory === 'transformations') {
                tabTrans.style.border = '1.5px solid #a855f7';
                tabTrans.style.background = 'linear-gradient(135deg, #7c3aed, #6d28d9)';
                tabTrans.style.color = '#ffffff';
                tabTrans.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.4)';

                tabOutfits.style.border = '1.5px solid rgba(168, 85, 247, 0.3)';
                tabOutfits.style.background = 'rgba(30, 41, 59, 0.8)';
                tabOutfits.style.color = '#cbd5e1';
                tabOutfits.style.boxShadow = 'none';

                if (countBadge) countBadge.innerText = `${BOUTIQUE_ANIMAL_TRANSFORMATIONS.length} Özel Hayvan Formu`;
            } else {
                tabOutfits.style.border = '1.5px solid #ec4899';
                tabOutfits.style.background = 'linear-gradient(135deg, #db2777, #be185d)';
                tabOutfits.style.color = '#ffffff';
                tabOutfits.style.boxShadow = '0 2px 8px rgba(219, 39, 119, 0.4)';

                tabTrans.style.border = '1.5px solid rgba(168, 85, 247, 0.3)';
                tabTrans.style.background = 'rgba(30, 41, 59, 0.8)';
                tabTrans.style.color = '#cbd5e1';
                tabTrans.style.boxShadow = 'none';

                if (countBadge) countBadge.innerText = `${BOUTIQUE_ANIMAL_OUTFITS.length} Giyilebilir Hayvan Kıyafeti`;
            }
        }
        renderAnimalCostumeBoutiqueContent();
    }

    function resetBoutiquePreview() {
        if (typeof playSound === 'function') playSound('uiClick');
        const activeCostume = (typeof myAvatar !== 'undefined' && myAvatar && (myAvatar.costume || myAvatar.outfit)) || null;
        boutiquePreviewCostume = activeCostume;

        const badge = document.getElementById('boutiquePreviewStatusBadge');
        if (badge) {
            badge.innerText = '✨ Mevcut Görünüm';
            badge.style.color = '#c084fc';
            badge.style.borderColor = 'rgba(168, 85, 247, 0.3)';
        }

        renderAnimalCostumeBoutiqueContent();
        drawBoutiqueAvatarPreview();
    }

    function openAnimalCostumeBoutiqueModal() {
        if (typeof playSound === 'function') playSound('uiClick');

        const modal = document.getElementById('animalCostumeBoutiqueModal');
        if (!modal) return;

        isBoutiqueModalOpen = true;
        const activeCostume = (typeof myAvatar !== 'undefined' && myAvatar && (myAvatar.costume || myAvatar.outfit)) || null;
        boutiquePreviewCostume = activeCostume;

        // Bakiye göstergesini güncelle
        const moneyDisplay = document.getElementById('userMoneyDisplay') || document.getElementById('moneyDisplay');
        const boutMoneyEl = document.getElementById('animalBoutiqueUserMoney');
        if (boutMoneyEl) {
            const curMoney = (typeof myMoney !== 'undefined' ? myMoney : (moneyDisplay ? parseInt(moneyDisplay.innerText) || 0 : 0));
            boutMoneyEl.innerText = `${curMoney.toLocaleString('tr-TR')} TL`;
        }

        const pName = (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId] ? players[myId].name : (typeof myAvatar !== 'undefined' && myAvatar.name ? myAvatar.name : "Kivre"));
        const nameEl = document.getElementById('boutiquePreviewPlayerName');
        if (nameEl) nameEl.innerText = pName;

        const badge = document.getElementById('boutiquePreviewStatusBadge');
        if (badge) {
            badge.innerText = activeCostume ? '🐾 Kuşanılmış Kostüm' : '✨ İnsan Formu';
            badge.style.color = '#c084fc';
            badge.style.borderColor = 'rgba(168, 85, 247, 0.3)';
        }

        setupBoutiquePreviewCanvasDrag();
        switchBoutiqueCategory(activeBoutiqueCategory || 'transformations');
        modal.style.display = 'flex';
        requestAnimationFrame(boutiquePreviewLoop);
    }

    function closeAnimalCostumeBoutiqueModal() {
        isBoutiqueModalOpen = false;
        const modal = document.getElementById('animalCostumeBoutiqueModal');
        if (modal) modal.style.display = 'none';
    }

    function isCostumeOwned(costumeId) {
        if (typeof isItemOwned === 'function') {
            const cat = costumeId.startsWith('outfit_') ? 'outfits' : 'costumes';
            if (isItemOwned(cat, costumeId)) return true;
        }
        const activeInv = (typeof window !== 'undefined' && window.myInventory) || (typeof myInventory !== 'undefined' && myInventory);
        if (Array.isArray(activeInv)) {
            return activeInv.includes(costumeId) || activeInv.includes(`costumes_${costumeId}`) || activeInv.includes(`outfits_${costumeId}`);
        } else if (activeInv && typeof activeInv === 'object') {
            if (activeInv.costumes && (activeInv.costumes.includes(costumeId) || activeInv.costumes.includes(`costumes_${costumeId}`))) return true;
            if (activeInv.outfits && (activeInv.outfits.includes(costumeId) || activeInv.outfits.includes(`outfits_${costumeId}`))) return true;
        }
        return false;
    }

    function isCostumeEquipped(costumeId) {
        if (typeof myAvatar !== 'undefined' && myAvatar) {
            if (myAvatar.costume === costumeId || myAvatar.outfit === costumeId) return true;
            if (costumeId.startsWith('outfit_') && myAvatar.outfit === costumeId) return true;
        }
        if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) {
            if (players[myId].costume === costumeId || players[myId].outfit === costumeId) return true;
        }
        return false;
    }

    function renderAnimalCostumeBoutiqueContent() {
        const grid = document.getElementById('animalCostumeBoutiqueGrid');
        if (!grid) return;

        const itemsToRender = (activeBoutiqueCategory === 'transformations')
            ? BOUTIQUE_ANIMAL_TRANSFORMATIONS
            : BOUTIQUE_ANIMAL_OUTFITS;

        let html = '';
        itemsToRender.forEach(item => {
            const owned = isCostumeOwned(item.id);
            const equipped = isCostumeEquipped(item.id);
            const isPreviewed = (boutiquePreviewCostume === item.id);

            let actionBtn = '';
            if (equipped) {
                actionBtn = `
                    <button type="button" onclick="event.stopPropagation(); unequipCurrentCostumeFromBoutique()"
                        style="width: 100%; padding: 6px; border: none; border-radius: 8px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-weight: 800; font-size: 11px; cursor: pointer; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);">
                        ✕ Kostümü Çıkar
                    </button>
                `;
            } else if (owned) {
                actionBtn = `
                    <button type="button" onclick="event.stopPropagation(); buyOrEquipCostumeFromBoutique('${item.id}')"
                        style="width: 100%; padding: 6px; border: none; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 800; font-size: 11px; cursor: pointer; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.4);">
                        ✅ Kuşan
                    </button>
                `;
            } else {
                actionBtn = `
                    <button type="button" onclick="event.stopPropagation(); buyOrEquipCostumeFromBoutique('${item.id}')"
                        style="width: 100%; padding: 6px; border: none; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 800; font-size: 11px; cursor: pointer; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.4);">
                        🛒 ${item.cost.toLocaleString('tr-TR')} TL
                    </button>
                `;
            }

            let borderCol = 'rgba(168, 85, 247, 0.35)';
            let boxGlow = '';
            if (isPreviewed) {
                borderCol = '#e879f9';
                boxGlow = 'box-shadow: 0 0 14px rgba(232, 121, 249, 0.65), inset 0 0 8px rgba(232, 121, 249, 0.2);';
            } else if (equipped) {
                borderCol = '#38bdf8';
                boxGlow = 'box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);';
            } else if (owned) {
                borderCol = '#10b981';
            }

            const bgGrad = isPreviewed
                ? 'linear-gradient(145deg, rgba(59, 23, 85, 0.9), rgba(15, 23, 42, 0.95))'
                : (equipped ? 'linear-gradient(145deg, rgba(30, 58, 138, 0.8), rgba(15, 23, 42, 0.95))' : 'linear-gradient(145deg, rgba(30, 41, 59, 0.85), rgba(15, 23, 42, 0.95))');

            let topBadge = '';
            if (isPreviewed) {
                topBadge = '<div style="position: absolute; top: -5px; right: 6px; background: linear-gradient(135deg, #c084fc, #a855f7); color: white; font-size: 8.5px; font-weight: 900; padding: 1px 6px; border-radius: 6px; box-shadow: 0 2px 6px rgba(168,85,247,0.5);">👀 DENENİYOR</div>';
            } else if (equipped) {
                topBadge = '<div style="position: absolute; top: -5px; right: 6px; background: #38bdf8; color: #0f172a; font-size: 8.5px; font-weight: 900; padding: 1px 6px; border-radius: 6px;">⭐ ÜSTÜNDE</div>';
            } else if (owned) {
                topBadge = '<div style="position: absolute; top: -5px; right: 6px; background: #10b981; color: white; font-size: 8.5px; font-weight: 900; padding: 1px 6px; border-radius: 6px;">SAHİPSİN</div>';
            } else if (item.badge) {
                topBadge = `<div style="position: absolute; top: -5px; right: 6px; background: linear-gradient(135deg, #f43f5e, #e11d48); color: white; font-size: 8.5px; font-weight: 900; padding: 1px 6px; border-radius: 6px;">${item.badge}</div>`;
            }

            html += `
                <div onclick="selectCostumeForPreview('${item.id}')"
                    style="background: ${bgGrad}; border: 1.5px solid ${borderCol}; border-radius: 12px; padding: 10px 8px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; min-height: 165px; box-sizing: border-box; position: relative; cursor: pointer; transition: all 0.2s; ${boxGlow}">
                    ${topBadge}
                    <div>
                        <div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); margin-bottom: 2px;">${item.icon}</div>
                        <div style="font-weight: 800; font-size: 12px; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</div>
                        <div style="font-size: 9.5px; color: #cbd5e1; line-height: 1.25; margin: 3px 0 6px 0; min-height: 24px;">${item.desc}</div>
                    </div>
                    <div>
                        <div style="font-size: 11px; font-weight: 900; color: #facc15; margin-bottom: 6px;">${item.cost.toLocaleString('tr-TR')} TL</div>
                        ${actionBtn}
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    function buyOrEquipCostumeFromBoutique(costumeId) {
        if (typeof playSound === 'function') playSound('uiClick');

        boutiquePreviewCostume = costumeId;
        const item = ALL_BOUTIQUE_ITEMS.find(c => c.id === costumeId);
        const category = (item && item.category) ? item.category : (costumeId.startsWith('outfit_') ? 'outfits' : 'costumes');

        if (typeof buyWardrobeItem === 'function') {
            buyWardrobeItem(category, costumeId);
        } else if (typeof socket !== 'undefined' && socket.connected) {
            socket.emit('buyWardrobeItem', { category: category, id: costumeId });
        }

        setTimeout(() => {
            renderAnimalCostumeBoutiqueContent();
            drawBoutiqueAvatarPreview();
            const moneyDisplay = document.getElementById('userMoneyDisplay') || document.getElementById('moneyDisplay');
            const boutMoneyEl = document.getElementById('animalBoutiqueUserMoney');
            if (boutMoneyEl) {
                const curMoney = (typeof myMoney !== 'undefined' ? myMoney : (moneyDisplay ? parseInt(moneyDisplay.innerText) || 0 : 0));
                boutMoneyEl.innerText = `${curMoney.toLocaleString('tr-TR')} TL`;
            }
        }, 150);
    }

    function unequipCurrentCostumeFromBoutique() {
        if (typeof playSound === 'function') playSound('uiClick');

        boutiquePreviewCostume = null;

        // Hem hayvan dönüşümünü hem de kedi kostümü vb. kıyafet takımlarını çıkar
        if (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.outfit && (myAvatar.outfit === 'outfit_k2_cat' || myAvatar.outfit.startsWith('outfit_k2_'))) {
            if (typeof unequipWardrobeItem === 'function') {
                unequipWardrobeItem('outfits', 'none');
            } else if (typeof socket !== 'undefined' && socket.connected) {
                socket.emit('buyWardrobeItem', { category: 'outfits', id: 'none' });
            }
        }
        if (typeof unequipWardrobeItem === 'function') {
            unequipWardrobeItem('costumes', 'costume_none');
        } else if (typeof socket !== 'undefined' && socket.connected) {
            socket.emit('buyWardrobeItem', { category: 'costumes', id: 'costume_none' });
        }

        if (typeof showGameNotification === 'function') {
            showGameNotification('🚶 Normal kıyafet / insan formuna dönüldü.');
        }

        const badge = document.getElementById('boutiquePreviewStatusBadge');
        if (badge) {
            badge.innerText = '✨ İnsan Formu';
            badge.style.color = '#c084fc';
            badge.style.borderColor = 'rgba(168, 85, 247, 0.3)';
        }

        setTimeout(() => {
            renderAnimalCostumeBoutiqueContent();
            drawBoutiqueAvatarPreview();
        }, 150);
    }

    // Soket gardırop güncellemesinde butik açık ise güncelle
    if (typeof socket !== 'undefined' && socket) {
        socket.on('wardrobeUpdate', () => {
            if (isBoutiqueModalOpen) {
                renderAnimalCostumeBoutiqueContent();
                drawBoutiqueAvatarPreview();
            }
        });
    }

    // Dışa aktar
    window.renderStaticPetShopTo = renderStaticPetShopTo;
    window.drawPetShopInteriorEnvironment = drawPetShopInteriorEnvironment;
    window.openAnimalCostumeBoutiqueModal = openAnimalCostumeBoutiqueModal;
    window.closeAnimalCostumeBoutiqueModal = closeAnimalCostumeBoutiqueModal;
    window.renderAnimalCostumeBoutiqueContent = renderAnimalCostumeBoutiqueContent;
    window.buyOrEquipCostumeFromBoutique = buyOrEquipCostumeFromBoutique;
    window.unequipCurrentCostumeFromBoutique = unequipCurrentCostumeFromBoutique;
    window.rotateBoutiqueAvatarPreview = rotateBoutiqueAvatarPreview;
    window.selectCostumeForPreview = selectCostumeForPreview;
    window.switchBoutiqueCategory = switchBoutiqueCategory;
    function setBoutiquePreviewFacing(facing) {
        boutiquePreviewFacing = facing;
        const badge = document.getElementById('boutiquePreviewFacingBadge');
        const fObj = BOUTIQUE_FACINGS.find(f => f.id === facing);
        if (badge && fObj) badge.innerText = fObj.label;
        drawBoutiqueAvatarPreview();
    }
    window.setBoutiquePreviewFacing = setBoutiquePreviewFacing;
    window.resetBoutiquePreview = resetBoutiquePreview;

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
