// public/js/renderers/renderBotanicShop.js
// 🌿 2.5D İZOMETRİK BOTANİK DÜKKANI & BİTKİ SERASI (1000 x 625)
// Cam sera kubbesi, asılı sarmaşıklar, bonsai ağaçları, katlı çiçek kasaları, Botanikçi Defne & Çiçek Tüccarı Rasim

(function (window) {
    'use strict';

    const CANV_W = 1000;
    const CANV_H = 625;

    /**
     * Statik Sera Arka Planı (bgCache Uyumlu)
     */
    function renderStaticBotanicShopTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. ZEMİN VE GÖKYÜZÜ (Cam tavan arkasından sızan gün ışığı ve gökyüzü)
        let skyGrad = bctx.createLinearGradient(0, 0, 0, 220);
        skyGrad.addColorStop(0, '#0284c7');
        skyGrad.addColorStop(0.6, '#38bdf8');
        skyGrad.addColorStop(1, '#bae6fd');
        bctx.fillStyle = skyGrad;
        bctx.fillRect(0, 0, width, 220);

        // Güneş Işığı Hüzmeleri (Sun Rays)
        bctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        for (let i = 0; i < 5; i++) {
            bctx.beginPath();
            bctx.moveTo(150 + i * 180, 0);
            bctx.lineTo(260 + i * 190, 0);
            bctx.lineTo(340 + i * 190, 240);
            bctx.lineTo(190 + i * 180, 240);
            bctx.closePath();
            bctx.fill();
        }

        // 2. VİCTORİA DÖNEMİ FERFORJE CAM SERA ÇATISI (Glass Conservatory Dome)
        bctx.strokeStyle = "#1e293b";
        bctx.lineWidth = 4;
        // Kavisli çelik kemerler
        for (let x = 60; x <= width - 60; x += 110) {
            bctx.beginPath();
            bctx.moveTo(x, 220);
            bctx.quadraticCurveTo(x, 40, width / 2, 15);
            bctx.stroke();
        }
        for (let x = width - 60; x >= 60; x -= 110) {
            bctx.beginPath();
            bctx.moveTo(x, 220);
            bctx.quadraticCurveTo(x, 40, width / 2, 15);
            bctx.stroke();
        }
        // Yatay cam kayıt profilleri
        bctx.lineWidth = 2;
        bctx.strokeStyle = "rgba(30, 41, 59, 0.7)";
        for (let y = 35; y <= 210; y += 35) {
            bctx.beginPath();
            bctx.moveTo(30, y);
            bctx.lineTo(width - 30, y);
            bctx.stroke();
        }

        // Cam Yansımaları
        bctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        bctx.fillRect(40, 20, width - 80, 200);

        // 3. İZOMETRİK KARO ZEMİN (Terracotta & Yosun Yeşili Doğal Taşlar)
        let floorY = 220;
        let floorH = height - floorY;

        let floorGrad = bctx.createLinearGradient(0, floorY, 0, height);
        floorGrad.addColorStop(0, '#1c1917');
        floorGrad.addColorStop(1, '#0c0a09');
        bctx.fillStyle = floorGrad;
        bctx.fillRect(0, floorY, width, floorH);

        // 2.5D İzometrik Karolar (40x20px Elmas Izgara)
        for (let y = floorY; y < height; y += 22) {
            for (let x = -40; x < width + 40; x += 44) {
                let isOdd = ((y / 22) % 2 === 0);
                let offsetX = isOdd ? 22 : 0;
                let cx = x + offsetX;

                bctx.fillStyle = ((cx + y) % 3 === 0) ? '#166534' : (((cx + y) % 2 === 0) ? '#78350f' : '#292524');
                bctx.beginPath();
                bctx.moveTo(cx, y);
                bctx.lineTo(cx + 22, y + 11);
                bctx.lineTo(cx, y + 22);
                bctx.lineTo(cx - 22, y + 11);
                bctx.closePath();
                bctx.fill();

                bctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                bctx.lineWidth = 1;
                bctx.stroke();
            }
        }

        // 4. ARKA DUVAR & TUĞLA BORDÜR
        bctx.fillStyle = "#78350f";
        bctx.fillRect(0, 215, width, 10);
        bctx.fillStyle = "#451a03";
        bctx.fillRect(0, 222, width, 4);

        // 5. ASMA SARMAŞIKLAR VE BOTANİK DEKORLARI (Hanging Vines)
        for (let vx = 50; vx < width - 40; vx += 75) {
            bctx.fillStyle = "#15803d";
            bctx.beginPath();
            bctx.moveTo(vx, 20);
            bctx.bezierCurveTo(vx - 10, 80, vx + 15, 120, vx, 160);
            bctx.lineWidth = 3;
            bctx.strokeStyle = "#166534";
            bctx.stroke();

            // Sarmaşık Yaprakları
            for (let l = 30; l < 155; l += 14) {
                bctx.fillStyle = (l % 28 === 0) ? "#4ade80" : "#22c55e";
                bctx.beginPath();
                bctx.ellipse(vx + ((l % 4 === 0) ? 6 : -6), l, 6, 3, Math.PI / 4, 0, Math.PI * 2);
                bctx.fill();
            }
        }

        // 6. SOL TEZGAH (Tedarikçi Defne - Ahşap Rustik Botanik Masası)
        drawSupplierCounterBase(bctx, 220, 240);

        // 7. SAĞ TEZGAH (Çiçek Tüccarı Rasim - Ahşap Çiçek Sandıkları & Borsa Tahtası)
        drawMerchantCounterBase(bctx, 660, 240);

        // 8. MERKEZ SÜS HAVUZU & BOTANİK BİTKİ ADASI
        drawCenterBotanicalFountain(bctx, width / 2, 380);

        // 9. ÇIKIŞ KAPISI (Alt Merkez - Cadde 2'ye Çıkış)
        drawBotanicExitDoor(bctx, width / 2 - 45, height - 55, 90, 50);
    }

    /**
     * Tedarikçi Masası Çizimi (Sol)
     */
    function drawSupplierCounterBase(ctx, x, y) {
        // Ahşap Masif Tezgah
        ctx.fillStyle = "#532e08";
        ctx.beginPath();
        ctx.roundRect(x - 10, y, 200, 55, 6);
        ctx.fill();
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Tezgah Üstü Mermer Plaka
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(x - 14, y - 6, 208, 10);
        ctx.strokeStyle = "#94a3b8";
        ctx.strokeRect(x - 14, y - 6, 208, 10);

        // Yeşil Çizgili Saçak Tente
        ctx.fillStyle = "#15803d";
        ctx.fillRect(x - 20, y - 75, 220, 16);
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#16a34a" : "#f8fafc";
            ctx.fillRect(x - 20 + i * 31.4, y - 75, 31.4, 16);
        }

        // Tente Ahşap Taşıyıcı Dikmeleri
        ctx.fillStyle = "#78350f";
        ctx.fillRect(x - 18, y - 75, 5, 75);
        ctx.fillRect(x + 193, y - 75, 5, 75);

        // Tabela: TEDARİK & TOHUM
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌱 BOTANİKÇİ DEFNE (TEDARİK)", x + 90, y - 82);

        // Saksılar ve Fide Kasaları (Tezgahta)
        let potCols = ['#dc2626', '#facc15', '#a855f7'];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = "#78350f";
            ctx.fillRect(x + 10 + i * 55, y - 22, 22, 16);
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.arc(x + 21 + i * 55, y - 24, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = potCols[i];
            ctx.beginPath();
            ctx.arc(x + 21 + i * 55, y - 26, 3.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Çiçek Tüccarı Masası & Borsa Tahtası Çizimi (Sağ)
     */
    function drawMerchantCounterBase(ctx, x, y) {
        // Ahşap Sandıklar
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.roundRect(x - 10, y, 200, 55, 6);
        ctx.fill();
        ctx.strokeStyle = "#92400e";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Mermer Üst Tabaka
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(x - 14, y - 6, 208, 10);
        ctx.strokeStyle = "#64748b";
        ctx.strokeRect(x - 14, y - 6, 208, 10);

        // Bordo-Altın Çizgili Tente
        for (let i = 0; i < 7; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#991b1b" : "#fef08a";
            ctx.fillRect(x - 20 + i * 31.4, y - 75, 31.4, 16);
        }
        ctx.fillStyle = "#78350f";
        ctx.fillRect(x - 18, y - 75, 5, 75);
        ctx.fillRect(x + 193, y - 75, 5, 75);

        // Tabela: ÇİÇEK BORSASI
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💐 ÇİÇEK TÜCCARI RASİM (BORSA)", x + 90, y - 82);

        // Ahşap Çiçek Kasaları
        ctx.fillStyle = "#451a03";
        ctx.fillRect(x + 15, y - 20, 48, 14);
        ctx.fillStyle = "#ef4444";
        for (let r = 0; r < 3; r++) {
            ctx.beginPath();
            ctx.arc(x + 23 + r * 14, y - 22, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Terazi (Pirinç Kefe)
        ctx.fillStyle = "#facc15";
        ctx.fillRect(x + 120, y - 24, 4, 18);
        ctx.fillRect(x + 105, y - 24, 34, 2);
        ctx.beginPath(); ctx.arc(x + 109, y - 18, 5, 0, Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 135, y - 18, 5, 0, Math.PI); ctx.fill();
    }

    /**
     * Merkez Süs Havuzu ve Egzotik Bitki Adası
     */
    function drawCenterBotanicalFountain(ctx, cx, cy) {
        // Dış Taş Çember
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 75, 38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#64748b";
        ctx.lineWidth = 3;
        ctx.stroke();

        // İç Su Havuzu
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 66, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nilüfer Yaprakları (Water Lilies)
        ctx.fillStyle = "#15803d";
        ctx.beginPath(); ctx.arc(cx - 30, cy - 6, 8, 0, Math.PI * 1.8); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 25, cy + 8, 7, 0, Math.PI * 1.8); ctx.fill();
        ctx.fillStyle = "#f472b6";
        ctx.beginPath(); ctx.arc(cx - 30, cy - 6, 3, 0, Math.PI * 2); ctx.fill();

        // Merkez Taş Kaide & Bonsai Ağacı
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 5, 24, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bonsai Gövdesi
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 8);
        ctx.quadraticCurveTo(cx - 12, cy - 26, cx - 2, cy - 40);
        ctx.stroke();

        // Bonsai Yeşil Taç Yaprakları
        ctx.fillStyle = "#166534";
        ctx.beginPath(); ctx.arc(cx - 15, cy - 35, 14, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 8, cy - 42, 16, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx - 2, cy - 50, 12, 0, Math.PI * 2); ctx.fill();
    }

    /**
     * Alt Çıkış Kapısı
     */
    function drawBotanicExitDoor(ctx, x, y, w, h) {
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, [8, 8, 0, 0]);
        ctx.fill();
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🚪 CADDE 2", x + w / 2, y + 24);
        ctx.fillStyle = "#bbf7d0";
        ctx.font = "9px sans-serif";
        ctx.fillText("Çıkış Kapısı", x + w / 2, y + 38);
    }

    /**
     * Canlı Varlıklar: NPC Defne, NPC Rasim, Canlı Stok Tahtası ve İnteraktif Hover
     */
    function drawBotanicShopEntities(ctx, canvas, myAvatar) {
        if (!canvas) return;
        let now = Date.now();

        // A) NPC 1: BOTANİKÇİ DEFNE (x: 310, y: 220)
        drawNpcDefne(ctx, 310, 215, now);

        // B) NPC 2: ÇİÇEK TÜCCARI RASİM (x: 750, y: 220)
        drawNpcRasim(ctx, 750, 215, now);

        // C) CANLI BORSA STOK KARA TAHTASI (x: 885, y: 155)
        drawLiveStockBoard(ctx, 875, 120, now);

        // D) OYUNCU YAKINLIK VE İNTERAKTİF İPUÇLARI (Kullanıcı talebiyle [E] yazıları kaldırıldı, tıklama veya [E] tuşu çalışmaya devam eder)
    }

    /**
     * NPC 1: Botanikçi Defne Çizimi
     */
    function drawNpcDefne(ctx, x, y, now) {
        ctx.save();
        let breathe = Math.sin(now / 450) * 1.5;

        // Ayaklar & Botlar
        ctx.fillStyle = "#3f2c1d";
        ctx.fillRect(x - 7, y + 16, 5, 8);
        ctx.fillRect(x + 2, y + 16, 5, 8);

        // Yeşil Bahçıvan Önlüğü
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.roundRect(x - 9, y - 6 + breathe, 18, 24, 4);
        ctx.fill();
        ctx.strokeStyle = "#14532d";
        ctx.stroke();

        // Gövde İç Tişörtü (Sarı)
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(x - 6, y - 10 + breathe, 12, 6);

        // Kafa & Yüz
        ctx.fillStyle = "#fcd34d";
        ctx.beginPath();
        ctx.arc(x, y - 16 + breathe, 8, 0, Math.PI * 2);
        ctx.fill();

        // Gözler & Gülümseme
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x - 4, y - 18 + breathe, 2, 2.5);
        ctx.fillRect(x + 2, y - 18 + breathe, 2, 2.5);
        ctx.beginPath();
        ctx.arc(x, y - 14 + breathe, 3, 0, Math.PI);
        ctx.stroke();

        // Hasır Bahçıvan Şapkası (Gardener Straw Hat)
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(x, y - 23 + breathe, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y - 25 + breathe, 7, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = "#92400e";
        ctx.stroke();

        // İsim Etiketi
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.roundRect(x - 55, y - 48 + breathe, 110, 17, 6);
        ctx.fill();
        ctx.strokeStyle = "#22c55e";
        ctx.stroke();

        ctx.fillStyle = "#86efac";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌿 Botanikçi Defne", x, y - 36 + breathe);

        ctx.restore();
    }

    /**
     * NPC 2: Çiçek Tüccarı Rasim Çizimi
     */
    function drawNpcRasim(ctx, x, y, now) {
        ctx.save();
        let breathe = Math.sin(now / 480 + 1) * 1.5;

        // Ayaklar & Kundura
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x - 7, y + 16, 5, 8);
        ctx.fillRect(x + 2, y + 16, 5, 8);

        // Yelek & Beyaz Gömlek
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 8, y - 8 + breathe, 16, 24);
        ctx.fillStyle = "#7f1d1d"; // Bordo Yelek
        ctx.fillRect(x - 9, y - 6 + breathe, 6, 22);
        ctx.fillRect(x + 3, y - 6 + breathe, 6, 22);

        // Papyon
        ctx.fillStyle = "#dc2626";
        ctx.fillRect(x - 3, y - 8 + breathe, 6, 3);

        // Kafa
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(x, y - 16 + breathe, 8, 0, Math.PI * 2);
        ctx.fill();

        // Bıyık & Gözlük
        ctx.fillStyle = "#451a03";
        ctx.fillRect(x - 5, y - 14 + breathe, 10, 2.5); // Bıyık
        ctx.strokeStyle = "#facc15"; // Altın çerçeve gözlük
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 6, y - 19 + breathe, 4, 4);
        ctx.strokeRect(x + 2, y - 19 + breathe, 4, 4);
        ctx.beginPath(); ctx.moveTo(x - 2, y - 17 + breathe); ctx.lineTo(x + 2, y - 17 + breathe); ctx.stroke();

        // Kasket (Flat Cap)
        ctx.fillStyle = "#374151";
        ctx.beginPath();
        ctx.ellipse(x, y - 22 + breathe, 11, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // İsim Etiketi
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.roundRect(x - 60, y - 48 + breathe, 120, 17, 6);
        ctx.fill();
        ctx.strokeStyle = "#eab308";
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💐 Çiçek Tüccarı Rasim", x, y - 36 + breathe);

        ctx.restore();
    }

    /**
     * Canlı Çiçek Borsası Kara Tahtası (Chalkboard Stock)
     */
    function drawLiveStockBoard(ctx, x, y, now) {
        ctx.save();
        let stock = (window.botanicMarketData && window.botanicMarketData.stock) 
            ? window.botanicMarketData.stock 
            : { gul: 20, papatya: 20, orkide: 20 };

        // Tahta Çerçevesi
        ctx.fillStyle = "#532e08";
        ctx.fillRect(x - 4, y - 4, 112, 108);
        ctx.strokeStyle = "#78350f";
        ctx.strokeRect(x - 4, y - 4, 112, 108);

        // Kara Tahta
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x, y, 104, 100);

        // Başlık
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📋 CANLI BORSA", x + 52, y + 14);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 6, y + 18); ctx.lineTo(x + 98, y + 18); ctx.stroke();

        // Stok Kalemleri
        let items = [
            { name: "🌹 Gül:", count: stock.gul ?? 0 },
            { name: "🌼 Papatya:", count: stock.papatya ?? 0 },
            { name: "🌸 Orkide:", count: stock.orkide ?? 0 }
        ];

        items.forEach((item, idx) => {
            let rowY = y + 36 + idx * 20;
            ctx.fillStyle = "#f8fafc";
            ctx.font = "8.5px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(item.name, x + 8, rowY);

            // Stok sayısı (0 ise kırmızı Kıtlık)
            ctx.textAlign = "right";
            if (item.count <= 0) {
                ctx.fillStyle = "#ef4444";
                ctx.font = "bold 8px sans-serif";
                ctx.fillText("KITLIK", x + 96, rowY);
            } else {
                ctx.fillStyle = "#4ade80";
                ctx.font = "bold 9px monospace";
                ctx.fillText(item.count + " Ad", x + 96, rowY);
            }
        });

        ctx.restore();
    }

    /**
     * İnteraktif Etkileşim Hapı
     */
    function drawInteractionPill(ctx, x, y, text, glowColor = "#22c55e") {
        ctx.save();
        let bounce = Math.sin(Date.now() / 200) * 2;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.roundRect(x - 105, y - 14 + bounce, 210, 24, 12);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y + 2 + bounce);
        ctx.restore();
    }

    // Export
    window.renderStaticBotanicShopTo = renderStaticBotanicShopTo;
    window.drawBotanicShopEntities = drawBotanicShopEntities;

})(window);
