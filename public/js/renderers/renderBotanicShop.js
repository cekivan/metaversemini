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
        bctx.fillRect(0, 212, width, 12);
        bctx.fillStyle = "#451a03";
        bctx.fillRect(0, 222, width, 3);

        // 5. ASILI SARMAŞIKLAR VE ÇİÇEK SEPETLERİ (Tavandan Sarkan)
        drawHangingFlora(bctx, width);

        // 6. SOL TEZGAH (Tedarikçi Defne - Ahşap Rustik Botanik Masası)
        drawSupplierCounterBase(bctx, 210, 195);

        // 7. SAĞ TEZGAH (Tüccar Rasim - Çiçek Borsası Masası)
        drawMerchantCounterBase(bctx, 650, 195);

        // 8. ORTA MERKEZ HAVUZ VE GÖLET (Zen Lotus Havuzu)
        drawCenterPond(bctx, width / 2, 450);

        // 9. DÜKKAN İÇİ DEKORASYONLAR VE SAKSILAR (Çevreleyen Flora)
        drawFloorPotsAndBonsai(bctx, width, height);

        // 10. ÇIKIŞ KAPISI İŞARETİ (Cadde 2'ye Dönüş)
        drawExitDoorMarker(bctx, width / 2 - 60, height - 55, 120, 45);
    }

    /**
     * Tavandan Sarkan Sarmaşıklar ve Sepetler
     */
    function drawHangingFlora(ctx, width) {
        ctx.save();
        const vines = [
            { x: 90, len: 75, color: '#15803d' },
            { x: 180, len: 110, color: '#16a34a' },
            { x: 280, len: 90, color: '#22c55e' },
            { x: 420, len: 120, color: '#15803d' },
            { x: 580, len: 105, color: '#16a34a' },
            { x: 720, len: 85, color: '#22c55e' },
            { x: 820, len: 115, color: '#15803d' },
            { x: 910, len: 70, color: '#16a34a' }
        ];

        vines.forEach(v => {
            // Asma halat
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(v.x, 30);
            ctx.lineTo(v.x, 30 + v.len * 0.4);
            ctx.stroke();

            // Sepet (Terracotta saksı)
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.roundRect(v.x - 14, 30 + v.len * 0.4, 28, 14, [2, 2, 8, 8]);
            ctx.fill();

            // Sarkan Yapraklar
            ctx.fillStyle = v.color;
            for (let i = 0; i < 7; i++) {
                let ly = 40 + v.len * 0.4 + i * 8;
                let lx = v.x + Math.sin(i * 1.3) * 10;
                ctx.beginPath();
                ctx.ellipse(lx, ly, 7, 10, (i % 2 === 0 ? 0.3 : -0.3), 0, Math.PI * 2);
                ctx.fill();
            }
        });
        ctx.restore();
    }

    /**
     * Sol Tezgah Tabanı (Tedarikçi Defne)
     */
    function drawSupplierCounterBase(ctx, x, y) {
        ctx.save();
        // Gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(x + 100, y + 80, 115, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tente (Yeşil - Beyaz Dalgalı Çizgili)
        let awningW = 200;
        let awningH = 34;
        let segW = awningW / 8;
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = (i % 2 === 0) ? '#15803d' : '#f8fafc';
            ctx.beginPath();
            ctx.roundRect(x + i * segW, y - 60, segW, awningH, [4, 4, 8, 8]);
            ctx.fill();
        }
        // Tente Demirleri
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 10, y - 26);
        ctx.lineTo(x + 10, y + 20);
        ctx.moveTo(x + awningW - 10, y - 26);
        ctx.lineTo(x + awningW - 10, y + 20);
        ctx.stroke();

        // Ahşap Rustik Tezgah Gövdesi
        ctx.fillStyle = "#5c3317";
        ctx.beginPath();
        ctx.roundRect(x, y + 10, 200, 65, 8);
        ctx.fill();
        ctx.strokeStyle = "#3b1e08";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Ahşap çıta çizgileri
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1.5;
        for (let py = y + 25; py <= y + 65; py += 14) {
            ctx.beginPath();
            ctx.moveTo(x + 5, py);
            ctx.lineTo(x + 195, py);
            ctx.stroke();
        }

        // Mermer Üst Tabla
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.roundRect(x - 5, y + 5, 210, 16, 5);
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tezgah Üstü Tohum Çuvalları ve Mini Saksılar
        drawSeedSacks(ctx, x + 15, y - 2);
        drawMiniPots(ctx, x + 130, y + 4);

        // Tezgah Tabelası
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.roundRect(x + 20, y - 95, 160, 22, 6);
        ctx.fill();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🌱 BOTANİKÇİ DEFNE (TEDARİK)", x + 100, y - 80);

        ctx.restore();
    }

    /**
     * Sağ Tezgah Tabanı (Tüccar Rasim - Borsa)
     */
    function drawMerchantCounterBase(ctx, x, y) {
        ctx.save();
        // Gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(x + 100, y + 80, 115, 30, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tente (Bordo - Altın Sarısı Çizgili)
        let awningW = 200;
        let awningH = 34;
        let segW = awningW / 8;
        for (let i = 0; i < 8; i++) {
            ctx.fillStyle = (i % 2 === 0) ? '#991b1b' : '#fef08a';
            ctx.beginPath();
            ctx.roundRect(x + i * segW, y - 60, segW, awningH, [4, 4, 8, 8]);
            ctx.fill();
        }
        // Tente Demirleri
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 10, y - 26);
        ctx.lineTo(x + 10, y + 20);
        ctx.moveTo(x + awningW - 10, y - 26);
        ctx.lineTo(x + awningW - 10, y + 20);
        ctx.stroke();

        // Koyu Maun Tezgah Gövdesi
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.roundRect(x, y + 10, 200, 65, 8);
        ctx.fill();
        ctx.strokeStyle = "#290c02";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pirinç/Altın Köşe Koruyucuları
        ctx.fillStyle = "#eab308";
        ctx.fillRect(x + 5, y + 15, 10, 10);
        ctx.fillRect(x + 185, y + 15, 10, 10);
        ctx.fillRect(x + 5, y + 60, 10, 10);
        ctx.fillRect(x + 185, y + 60, 10, 10);

        // Cilalı Ahşap Üst Tabla
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.roundRect(x - 5, y + 5, 210, 16, 5);
        ctx.fill();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Çiçek Kasaları (Güller, Laleler, Papatyalar)
        drawFlowerCrates(ctx, x + 15, y - 6);

        // Tezgah Tabelası
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.roundRect(x + 15, y - 95, 170, 22, 6);
        ctx.fill();
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💐 ÇİÇEK BORSASI (TÜCCAR RASİM)", x + 100, y - 80);

        ctx.restore();
    }

    /**
     * Tohum Çuvalları Çizimi
     */
    function drawSeedSacks(ctx, x, y) {
        // Çuval 1 (Keten Tohumu)
        ctx.fillStyle = "#d7b98d";
        ctx.beginPath();
        ctx.ellipse(x + 12, y, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#854d0e";
        ctx.fillRect(x + 4, y - 4, 16, 3); // Ağız ipi

        // Çuval 2 (Gübre)
        ctx.fillStyle = "#9a7b56";
        ctx.beginPath();
        ctx.ellipse(x + 34, y + 1, 13, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#15803d";
        ctx.fillRect(x + 26, y - 3, 16, 3);
    }

    /**
     * Mini Saksılar Çizimi
     */
    function drawMiniPots(ctx, x, y) {
        for (let i = 0; i < 3; i++) {
            let px = x + i * 18;
            ctx.fillStyle = "#b45309";
            ctx.beginPath();
            ctx.roundRect(px, y - 6, 12, 10, [1, 1, 3, 3]);
            ctx.fill();

            // Yeşil Filiz
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.arc(px + 6, y - 8, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    /**
     * Çiçek Kasaları Çizimi
     */
    function drawFlowerCrates(ctx, x, y) {
        // Ahşap Sandık
        ctx.fillStyle = "#a16207";
        ctx.fillRect(x, y - 10, 48, 18);
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y - 10, 48, 18);

        // Kırmızı Güller
        ctx.fillStyle = "#dc2626";
        ctx.beginPath(); ctx.arc(x + 10, y - 12, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 24, y - 14, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 38, y - 11, 5, 0, Math.PI * 2); ctx.fill();

        // Beyaz Papatya Kasası
        ctx.fillStyle = "#854d0e";
        ctx.fillRect(x + 56, y - 8, 44, 16);
        ctx.fillStyle = "#fef08a";
        ctx.beginPath(); ctx.arc(x + 68, y - 11, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 82, y - 12, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(x + 68, y - 11, 3, 0, Math.PI); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 82, y - 12, 3, 0, Math.PI); ctx.fill();
    }

    /**
     * Merkez Süs Havuzu ve Egzotik Bitki Adası
     */
    function drawCenterPond(ctx, cx, cy) {
        ctx.save();
        // Dış Taş Çerçeve
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.ellipse(cx, cy, 140, 65, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#334155";
        ctx.lineWidth = 4;
        ctx.stroke();

        // İç Su Yüzeyi (Berrak Turkuaz)
        let waterGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 125);
        waterGrad.addColorStop(0, '#06b6d4');
        waterGrad.addColorStop(0.7, '#0284c7');
        waterGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 130, 56, 0, 0, Math.PI * 2);
        ctx.fill();

        // Su Parıltıları
        ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        ctx.beginPath();
        ctx.ellipse(cx - 40, cy - 15, 25, 6, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Nilüfer / Lotus Yaprakları
        ctx.fillStyle = "#15803d";
        ctx.beginPath(); ctx.ellipse(cx - 50, cy + 10, 16, 9, 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 60, cy - 8, 18, 10, -0.3, 0, Math.PI * 2); ctx.fill();

        // Pembe Nilüfer Çiçeği
        ctx.fillStyle = "#f472b6";
        ctx.beginPath(); ctx.arc(cx - 52, cy + 8, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fbcfe8";
        ctx.beginPath(); ctx.arc(cx - 52, cy + 7, 3, 0, Math.PI * 2); ctx.fill();

        // Merkezde Antika Bronz Fıskiye
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.roundRect(cx - 12, cy - 25, 24, 30, [4, 4, 1, 1]);
        ctx.fill();
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 25, 20, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fıskiye Su Püskürtmesi
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.beginPath();
        ctx.ellipse(cx, cy - 36, 6, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Zemin Saksıları, Bonsai Ağaçları ve Katlı Raflar
     */
    function drawFloorPotsAndBonsai(ctx, width, height) {
        // Sol Köşe Katlı Bonsai Sehpası
        drawBonsaiStand(ctx, 60, 270);
        drawLargeMonsteraPot(ctx, 40, 420);

        // Sağ Köşe Kaktüs & Sukulent Rafı
        drawSucculentRack(ctx, 900, 270);
        drawLargePalmPot(ctx, 920, 430);
    }

    function drawBonsaiStand(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = "#78350f";
        ctx.fillRect(x - 4, y, 8, 45);
        ctx.fillRect(x - 22, y, 44, 6);
        ctx.fillRect(x - 18, y + 45, 36, 6);

        // Bonsai Saksısı
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(x - 18, y - 10, 36, 10, [2, 2, 4, 4]);
        ctx.fill();

        // Bonsai Ağacı Gövdesi
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.quadraticCurveTo(x + 10, y - 25, x - 5, y - 35);
        ctx.stroke();

        // İğne Yaprak Bulutları
        ctx.fillStyle = "#15803d";
        ctx.beginPath(); ctx.arc(x - 6, y - 38, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 10, y - 28, 9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    function drawLargeMonsteraPot(ctx, x, y) {
        ctx.save();
        // Saksı
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.roundRect(x - 16, y, 32, 28, [2, 2, 8, 8]);
        ctx.fill();

        // Deve Tabanı (Monstera) Geniş Yaprakları
        ctx.fillStyle = "#16a34a";
        for (let i = 0; i < 5; i++) {
            let a = i * 0.7 - 1.4;
            let lx = x + Math.cos(a) * 26;
            let ly = y - 14 + Math.sin(a) * 20;
            ctx.beginPath();
            ctx.ellipse(lx, ly, 14, 8, a, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawSucculentRack(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = "#475569";
        ctx.fillRect(x - 20, y, 40, 50);
        ctx.fillStyle = "#334155";
        ctx.fillRect(x - 24, y + 15, 48, 4);
        ctx.fillRect(x - 24, y + 35, 48, 4);

        // Kaktüsler
        ctx.fillStyle = "#15803d";
        ctx.beginPath(); ctx.roundRect(x - 14, y + 5, 8, 10, 4); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x + 6, y + 23, 10, 12, 4); ctx.fill();
        ctx.restore();
    }

    function drawLargePalmPot(ctx, x, y) {
        ctx.save();
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.roundRect(x - 18, y, 36, 32, [2, 2, 8, 8]);
        ctx.fill();

        // Hurma / Palmiye Dalları
        ctx.strokeStyle = "#16a34a";
        ctx.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            let a = i * 0.5 - 1.25;
            let tx = x + Math.cos(a) * 45;
            let ty = y - 10 + Math.sin(a) * 35;
            ctx.beginPath();
            ctx.moveTo(x, y - 5);
            ctx.quadraticCurveTo(x, y - 25, tx, ty);
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * Çıkış Kapısı Zemin İşareti
     */
    function drawExitDoorMarker(ctx, x, y, w, h) {
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.fill();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🚪 CADDE 2", x + w / 2, y + 24);
        ctx.fillStyle = "#bbf7d0";
        ctx.font = "9px sans-serif";
        ctx.fillText("Çıkış Kapısı", x + w / 2, y + 38);
        ctx.restore();
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
        ctx.roundRect(x - 65, y - 48 + breathe, 130, 17, 6);
        ctx.fill();
        ctx.strokeStyle = "#eab308";
        ctx.stroke();

        ctx.fillStyle = "#fde047";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💐 Çiçek Tüccarı Rasim", x, y - 36 + breathe);

        ctx.restore();
    }

    /**
     * Canlı Borsa ve Stok Durum Kara Tahtası
     */
    function drawLiveStockBoard(ctx, x, y, now) {
        ctx.save();
        // Ahşap Çerçeve
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.roundRect(x - 5, y - 5, 115, 105, 6);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Siyah Tahta
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.roundRect(x, y, 105, 95, 4);
        ctx.fill();

        // Başlık
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("📊 CANLI BORSA", x + 52, y + 14);

        ctx.strokeStyle = "rgba(56, 189, 248, 0.3)";
        ctx.beginPath(); ctx.moveTo(x + 5, y + 18); ctx.lineTo(x + 100, y + 18); ctx.stroke();

        // Çiçek Fiyat Endeksi
        let flowerPrices = [
            { name: "K. Gül", price: "240 TL", trend: "▲", color: "#4ade80" },
            { name: "Akd. Lale", price: "410 TL", trend: "▲", color: "#4ade80" },
            { name: "M. Orkide", price: "720 TL", trend: "▼", color: "#f87171" },
            { name: "Lavanta", price: "180 TL", trend: "▲", color: "#4ade80" }
        ];

        ctx.font = "8px sans-serif";
        flowerPrices.forEach((f, i) => {
            let rowY = y + 32 + i * 15;
            ctx.fillStyle = "#94a3b8";
            ctx.textAlign = "left";
            ctx.fillText(f.name, x + 8, rowY);

            ctx.fillStyle = "#f8fafc";
            ctx.textAlign = "right";
            ctx.fillText(f.price, x + 80, rowY);

            ctx.fillStyle = f.color;
            ctx.fillText(f.trend, x + 96, rowY);
        });

        ctx.restore();
    }

    /**
     * İnteraktif Hap (Pill) Butonu
     */
    function drawInteractionPill(ctx, x, y, text, color) {
        ctx.save();
        ctx.font = "bold 10px sans-serif";
        let tw = ctx.measureText(text).width;
        let pw = tw + 20;

        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.beginPath();
        ctx.roundRect(x - pw / 2, y - 10, pw, 20, 10);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    /**
     * Ana Döngü Çağrısı (main.js)
     */
    function drawBotanicShopEnvironment() {
        let bg = (typeof bgCache !== 'undefined') ? bgCache.getCanvas('botanic_shop', canvas.width, canvas.height) : null;
        if (bg) {
            ctx.drawImage(bg, 0, 0);
        } else {
            renderStaticBotanicShopTo(ctx, canvas.width, canvas.height);
        }

        let myAvatar = (typeof players !== 'undefined' && typeof myId !== 'undefined') ? players[myId] : null;
        drawBotanicShopEntities(ctx, canvas, myAvatar);
    }
    window.drawBotanicShopEnvironment = drawBotanicShopEnvironment;

    // Dışa Aktarımlar
    window.renderStaticBotanicShopTo = renderStaticBotanicShopTo;
    window.drawBotanicShopEntities = drawBotanicShopEntities;
    window.drawNpcDefne = drawNpcDefne;
    window.drawNpcRasim = drawNpcRasim;
    window.drawLiveStockBoard = drawLiveStockBoard;
    window.CANV_W = CANV_W;
    window.CANV_H = CANV_H;

})(typeof window !== 'undefined' ? window : this);
