// public/js/renderers/renderKulturLobi.js - Kültür Merkezi Ana Lobi (Fuaye)
// Resepsiyon (Kayıt Defteri), Gişe (VIP Biletçi), Büfe & 3 Büyük Kapı (Kulis, Sahne, Sinema)

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    /**
     * Statik Lobi / Fuaye Arka Planı (bgCache uyumlu)
     */
    function renderStaticKulturLobiTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. ZEMİN: İtalyan Parlak Damarlı Mermer Karo (Kareli Siyah & Beyaz)
        const tileSize = 50;
        for (let y = 140; y < height; y += tileSize) {
            for (let x = 0; x < width; x += tileSize) {
                const isEven = ((x / tileSize) + (y / tileSize)) % 2 === 0;
                bctx.fillStyle = isEven ? "#f8fafc" : "#1e293b";
                bctx.fillRect(x, y, tileSize, tileSize);

                // İnce pirinç derz çizgisi
                bctx.strokeStyle = "rgba(217, 119, 6, 0.25)";
                bctx.lineWidth = 1;
                bctx.strokeRect(x, y, tileSize, tileSize);
            }
        }

        // 2. ARKA DUVAR & TAVAN KUŞAĞI (y: 0..140)
        // Koyu Gece Mavisi Lüks Duvar & Ahşap Boiserie Lambri
        const wallGrad = bctx.createLinearGradient(0, 0, 0, 140);
        wallGrad.addColorStop(0, "#0b0f19");
        wallGrad.addColorStop(0.7, "#111827");
        wallGrad.addColorStop(1, "#1f2937");
        bctx.fillStyle = wallGrad;
        bctx.fillRect(0, 0, width, 140);

        // Altın Varaklı Süpürgelik & Kordon Hattı
        bctx.fillStyle = "#d97706";
        bctx.fillRect(0, 136, width, 5);
        bctx.fillStyle = "#facc15";
        bctx.fillRect(0, 138, width, 2);

        // Tavan Kartonpiyer & Koridor Led Ambiyansı (y: 0..30)
        bctx.fillStyle = "#030712";
        bctx.fillRect(0, 0, width, 30);
        bctx.strokeStyle = "rgba(250, 204, 21, 0.35)";
        bctx.lineWidth = 1.5;
        bctx.beginPath(); bctx.moveTo(0, 30); bctx.lineTo(width, 30); bctx.stroke();

        // Üst Başlık Bandı: "ATATÜRK KÜLTÜR & SANAT MERKEZİ - FUAYE"
        bctx.fillStyle = "#fde047";
        bctx.font = "900 14px 'Arial Black', sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🏛️ ATATÜRK KÜLTÜR & SANAT MERKEZİ • ANA FUAYE", width / 2, 22);

        // =====================================================================
        // 3. ARKA DUVARDAKİ 3 BÜYÜK GEÇİŞ KAPISI
        // =====================================================================

        // -------------------------------------------------------------
        // KAPI 1 (SOL): 🚪 VIP KULİS & SANATÇI ODASI (x: 150..270, y: 40..136)
        // -------------------------------------------------------------
        const k1X = 150, k1Y = 40, k1W = 110, k1H = 96;
        bctx.fillStyle = "#1e1b4b";
        bctx.beginPath();
        bctx.roundRect(k1X, k1Y, k1W, k1H, [10, 10, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#a855f7";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        // Kulis Kapı Kanadı (Kapitoneli Bordo Deri)
        bctx.fillStyle = "#4c0519";
        bctx.fillRect(k1X + 8, k1Y + 12, k1W - 16, k1H - 12);
        bctx.strokeStyle = "#fb7185";
        bctx.lineWidth = 1;
        // Baklava dikiş çizgileri
        for (let ky = k1Y + 20; ky < k1Y + k1H - 10; ky += 16) {
            bctx.beginPath(); bctx.moveTo(k1X + 12, ky); bctx.lineTo(k1X + k1W - 12, ky); bctx.stroke();
        }

        // Tabela
        bctx.fillStyle = "#fdf4ff";
        bctx.font = "bold 9px sans-serif";
        bctx.fillText("💄 VIP KULİS", k1X + k1W / 2, k1Y + 8);
        bctx.fillStyle = "#e879f9";
        bctx.font = "bold 7px sans-serif";
        bctx.fillText("Sanatçı Girişi", k1X + k1W / 2, k1Y + k1H - 8);

        // -------------------------------------------------------------
        // KAPI 2 (ORTA): 🎭 ANA SANAT SAHNESİ (x: 430..570, y: 35..136)
        // -------------------------------------------------------------
        const k2X = 430, k2Y = 35, k2W = 140, k2H = 101;
        // Altın ve Kırmızı Çift Kanatlı Büyük Tiyatro Kapısı
        bctx.fillStyle = "#7f1d1d";
        bctx.beginPath();
        bctx.roundRect(k2X, k2Y, k2W, k2H, [14, 14, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#fbbf24";
        bctx.lineWidth = 3;
        bctx.stroke();

        // Çift Kanat Ayrımı
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2;
        bctx.beginPath(); bctx.moveTo(k2X + k2W / 2, k2Y); bctx.lineTo(k2X + k2W / 2, k2Y + k2H); bctx.stroke();

        // Kadife Perde Dökümleri
        bctx.fillStyle = "#991b1b";
        bctx.fillRect(k2X + 10, k2Y + 18, (k2W / 2) - 16, k2H - 24);
        bctx.fillRect(k2X + (k2W / 2) + 6, k2Y + 18, (k2W / 2) - 16, k2H - 24);

        // Pirinç Kapı Tokmakları
        bctx.fillStyle = "#facc15";
        bctx.beginPath(); bctx.arc(k2X + (k2W / 2) - 8, k2Y + 54, 4, 0, Math.PI * 2); bctx.fill();
        bctx.beginPath(); bctx.arc(k2X + (k2W / 2) + 8, k2Y + 54, 4, 0, Math.PI * 2); bctx.fill();

        // Işıklı Neon Tabela: "ANA SAHNE & STAND-UP"
        bctx.fillStyle = "#fef08a";
        bctx.font = "900 11px sans-serif";
        bctx.fillText("🎭 ANA SAHNE", k2X + k2W / 2, k2Y + 14);

        // Kırmızı Protokol Halısı
        bctx.fillStyle = "#b91c1c";
        bctx.fillRect(k2X + 16, k2Y + k2H, k2W - 32, 60);
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(k2X + 16, k2Y + k2H, k2W - 32, 60);

        // -------------------------------------------------------------
        // KAPI 3 (SAĞ): 🍿 2.5D SİNEMA SALONU (x: 730..850, y: 40..136)
        // -------------------------------------------------------------
        const k3X = 730, k3Y = 40, k3W = 110, k3H = 96;
        bctx.fillStyle = "#022c22";
        bctx.beginPath();
        bctx.roundRect(k3X, k3Y, k3W, k3H, [10, 10, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#10b981";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        // Sinema Kapı Deseni (Neonlu Mavi-Yeşil Cam)
        bctx.fillStyle = "#064e3b";
        bctx.fillRect(k3X + 8, k3Y + 12, k3W - 16, k3H - 12);
        bctx.strokeStyle = "#34d399";
        bctx.lineWidth = 1;
        bctx.strokeRect(k3X + 14, k3Y + 20, k3W - 28, k3H - 30);

        bctx.fillStyle = "#a7f3d0";
        bctx.font = "bold 9px sans-serif";
        bctx.fillText("🎬 2.5D SİNEMA", k3X + k3W / 2, k3Y + 8);
        bctx.fillStyle = "#6ee7b7";
        bctx.font = "bold 7px sans-serif";
        bctx.fillText("Dev Projeksiyon", k3X + k3W / 2, k3Y + k3H - 8);

        // =====================================================================
        // 4. SOLDA RESEPSİYON & AÇIK MİKROFON KAYIT DEFTERİ MASASI
        // =====================================================================
        const rX = 80, rY = 250, rW = 160, rH = 80;
        // Maun Ahşap Resepsiyon Tezgahı
        const rGrad = bctx.createLinearGradient(rX, rY, rX, rY + rH);
        rGrad.addColorStop(0, "#451a03");
        rGrad.addColorStop(0.5, "#78350f");
        rGrad.addColorStop(1, "#361502");
        bctx.fillStyle = rGrad;
        bctx.beginPath();
        bctx.roundRect(rX, rY, rW, rH, 10);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Masa Üstü Mermer Plaka
        bctx.fillStyle = "#f8fafc";
        bctx.fillRect(rX + 4, rY + 4, rW - 8, 16);
        bctx.strokeStyle = "#cbd5e1";
        bctx.strokeRect(rX + 4, rY + 4, rW - 8, 16);

        // Tabela: "📋 RESEPSİYON (Kayıt Defteri)"
        bctx.fillStyle = "#1e293b";
        bctx.font = "bold 9px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("📋 RESEPSİYON (Kayıt)", rX + rW / 2, rY + 15);

        // Deri Ciltli Kayıt Defteri (Açık Defter)
        bctx.fillStyle = "#fef08a";
        bctx.fillRect(rX + 25, rY + 30, 45, 32);
        bctx.strokeStyle = "#78350f";
        bctx.strokeRect(rX + 25, rY + 30, 45, 32);
        bctx.strokeStyle = "#94a3b8";
        bctx.beginPath(); bctx.moveTo(rX + 47, rY + 30); bctx.lineTo(rX + 47, rY + 62); bctx.stroke();

        // Resepsiyon Zili & Masa Lambası
        bctx.fillStyle = "#facc15";
        bctx.beginPath(); bctx.arc(rX + rW - 35, rY + 45, 6, 0, Math.PI * 2); bctx.fill();
        bctx.fillStyle = "#475569";
        bctx.fillRect(rX + rW - 37, rY + 51, 4, 3);

        bctx.fillStyle = "#fde047";
        bctx.font = "bold 8px sans-serif";
        bctx.fillText("Açık Mikrofon", rX + rW / 2, rY + 68);

        // =====================================================================
        // 5. SAĞDA GİŞE & VIP BİLETÇİ KULÜBESİ (BİLETÇİ BURHAN)
        // =====================================================================
        const gX = 760, gY = 250, gW = 160, gH = 80;
        // Pirinç Camlı Gişe Kulübesi
        bctx.fillStyle = "#0f172a";
        bctx.beginPath();
        bctx.roundRect(gX, gY, gW, gH, 10);
        bctx.fill();
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Cam Bölme & Bilet Delikleri
        bctx.fillStyle = "rgba(56, 189, 248, 0.2)";
        bctx.fillRect(gX + 10, gY + 12, gW - 20, 42);
        bctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        bctx.strokeRect(gX + 10, gY + 12, gW - 20, 42);

        // Konuşma Deliği (Grille)
        bctx.fillStyle = "#facc15";
        bctx.beginPath(); bctx.arc(gX + gW / 2, gY + 32, 6, 0, Math.PI * 2); bctx.fill();

        // Gişe Tabelası
        bctx.fillStyle = "#38bdf8";
        bctx.font = "900 9px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🎟️ GİŞE & REZERVASYON", gX + gW / 2, gY + 8);

        bctx.fillStyle = "#f8fafc";
        bctx.font = "bold 8px sans-serif";
        bctx.fillText("Bilet Satışı & Sahne Kiralama", gX + gW / 2, gY + 68);

        // =====================================================================
        // 6. SOL ALTTA BÜFE & ATIŞTIRMALIK KÖŞESİ (BÜFECİ RIZA)
        // =====================================================================
        const bX = 80, bY = 440, bW = 170, bH = 85;
        bctx.fillStyle = "#1e1b4b";
        bctx.beginPath();
        bctx.roundRect(bX, bY, bW, bH, 10);
        bctx.fill();
        bctx.strokeStyle = "#ec4899";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Kırmızı Beyaz Tenteli Saçak
        for (let i = 0; i < 7; i++) {
            bctx.fillStyle = (i % 2 === 0) ? "#ef4444" : "#ffffff";
            bctx.fillRect(bX + i * 24, bY - 4, 24, 12);
        }

        bctx.fillStyle = "#f472b6";
        bctx.font = "900 9.5px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🍿 SANAT BÜFESİ", bX + bW / 2, bY + 22);

        // Mısır Makinesi & İçecek Dolabı İkonları
        bctx.fillStyle = "#ffffff";
        bctx.font = "16px sans-serif";
        bctx.fillText("🍿 🥤 🌭 🍟", bX + bW / 2, bY + 48);

        bctx.fillStyle = "#cbd5e1";
        bctx.font = "bold 7.5px sans-serif";
        bctx.fillText("Mısır, Kola, Sosisli & Cips", bX + bW / 2, bY + 70);

        // =====================================================================
        // 7. ALT ÇIKIŞ KAPISI: 🚪 CADDE 2'YE ÇIKIŞ
        // =====================================================================
        const exitX = width / 2 - 50, exitY = height - 35, exitW = 100, exitH = 35;
        bctx.fillStyle = "#0f172a";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.strokeStyle = "#94a3b8";
        bctx.lineWidth = 2;
        bctx.strokeRect(exitX, exitY, exitW, exitH);

        bctx.fillStyle = "#f8fafc";
        bctx.font = "bold 10px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("⬇ ÇIKIŞ (CADDE 2)", width / 2, height - 12);
    }

    /**
     * Dinamik Kültür Merkezi Lobi Çevre Çizimi (60 FPS Hover ve Işıklar)
     */
    function drawKulturLobiEnvironment() {
        let bg = bgCache.getCanvas('kultur_merkezi_lobi', canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0);

        const now = Date.now();

        // Hover kontrolleri
        const isReceptionHover = (canvasMouseX >= 70 && canvasMouseX <= 250 && canvasMouseY >= 240 && canvasMouseY <= 340);
        const isGiseHover = (canvasMouseX >= 750 && canvasMouseX <= 930 && canvasMouseY >= 240 && canvasMouseY <= 340);
        const isBufeHover = (canvasMouseX >= 70 && canvasMouseX <= 260 && canvasMouseY >= 430 && canvasMouseY <= 535);
        const isKulisDoorHover = (canvasMouseX >= 140 && canvasMouseX <= 270 && canvasMouseY >= 35 && canvasMouseY <= 140);
        const isSahneDoorHover = (canvasMouseX >= 420 && canvasMouseX <= 580 && canvasMouseY >= 30 && canvasMouseY <= 140);
        const isSinemaDoorHover = (canvasMouseX >= 720 && canvasMouseX <= 850 && canvasMouseY >= 35 && canvasMouseY <= 140);
        const isExitHover = (canvasMouseX >= canvas.width / 2 - 60 && canvasMouseX <= canvas.width / 2 + 60 && canvasMouseY >= canvas.height - 50);

        if (isReceptionHover) {
            hoveredTableId = 'kultur_reception';
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(76, 246, 168, 88);
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("📋 AÇIK MİKROFON KAYIT DEFTERİ (Sıraya Gir)", 160, 238);
            setGameCursor('pointer');
        } else if (isGiseHover) {
            hoveredTableId = 'kultur_gise';
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(756, 246, 168, 88);
            ctx.fillStyle = "#bae6fd";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎟️ GİŞE: Bilet Satın Al & Sahne Kirala", 840, 238);
            setGameCursor('pointer');
        } else if (isBufeHover) {
            hoveredTableId = 'kultur_bufe';
            ctx.strokeStyle = "#ec4899";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(76, 436, 178, 93);
            ctx.fillStyle = "#fbcfe8";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🍿 SANAT BÜFESİ (Mısır, Kola, Sosisli Al)", 165, 428);
            setGameCursor('pointer');
        } else if (isKulisDoorHover) {
            hoveredTableId = 'kultur_door_kulis';
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 3;
            ctx.strokeRect(146, 36, 118, 104);
            ctx.fillStyle = "#f3e8ff";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("💄 VIP KULİS ODASI (Sanatçı Girişi)", 205, 30);
            setGameCursor('pointer');
        } else if (isSahneDoorHover) {
            hoveredTableId = 'kultur_door_sahne';
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 3;
            ctx.strokeRect(426, 31, 148, 109);
            ctx.fillStyle = "#fecaca";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎭 ANA SANAT SAHNESİNE GİR", canvas.width / 2, 25);
            setGameCursor('pointer');
        } else if (isSinemaDoorHover) {
            hoveredTableId = 'kultur_door_sinema';
            ctx.strokeStyle = "#10b981";
            ctx.lineWidth = 3;
            ctx.strokeRect(726, 36, 118, 104);
            ctx.fillStyle = "#d1fae5";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎬 2.5D SİNEMA SALONUNA GİR", 785, 30);
            setGameCursor('pointer');
        } else if (isExitHover) {
            hoveredTableId = 'kultur_door_cadde2';
            setGameCursor('pointer');
        } else {
            if (hoveredTableId && hoveredTableId.startsWith('kultur_')) {
                hoveredTableId = null;
            }
            setGameCursor('default');
        }
    }

    window.renderStaticKulturLobiTo = renderStaticKulturLobiTo;
    window.drawKulturLobiEnvironment = drawKulturLobiEnvironment;
})();

