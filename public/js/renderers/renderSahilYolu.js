// public/js/renderers/renderSahilYolu.js - Sahil Yolu (Meydan v1 ile Sahil v1 Arasındaki Soft Geçiş Kordonu & Grand Sahil AVM Girişi)
(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    // Geçiş Noktaları
    const AVM_ENTRANCE = {
        x: 500,
        y: 200,
        w: 100,
        h: 40,
        targetRoom: 'avm_kat1'
    };

    const MEYDAN_V1_EXIT = {
        x: 960,
        y: 260,
        targetRoom: 'sokak'
    };

    const SAHIL_V1_EXIT = {
        x: 40,
        y: 260,
        targetRoom: 'sahil'
    };

    /**
     * Statik Sahil Yolu Arka Planını Çizen Fonksiyon (bgCache Dostu)
     */
    function renderStaticSahilYoluTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. Zemin Katmanları:
        // Doğu (Meydan v1 Sokak) -> Şehir Taş Döşemesi & Asfalt
        // Batı (Sahil v1 Plaj) -> Soft Kum & Kıyı Geçişi

        // 1.1 Genel Çim & Park Zemin Fonu
        let baseGrassGrad = bctx.createLinearGradient(0, 0, width, 0);
        baseGrassGrad.addColorStop(0, "#fde047"); // Batıda kumsal tonu
        baseGrassGrad.addColorStop(0.35, "#86efac"); // Soft çim-kum geçişi
        baseGrassGrad.addColorStop(1, "#22c55e"); // Doğuda canlı şehir parkı çimi
        bctx.fillStyle = baseGrassGrad;
        bctx.fillRect(0, 0, width, height);

        // 1.2 YATAY BAĞLANTI BULVARI (Meydan v1'den Sahil v1'e Geçiş Yolu: y: 210..340)
        // Yol Genişliği: y: 210'dan y: 340'a (130px genişlik - ferah ve akıcı)
        let roadGrad = bctx.createLinearGradient(0, 0, width, 0);
        roadGrad.addColorStop(0, "#fef08a");   // Batıda (Sahil v1 girişi) altın plaj kumu
        roadGrad.addColorStop(0.2, "#e2e8f0"); // Kordon granit geçişi
        roadGrad.addColorStop(0.65, "#64748b"); // Orta meydan asfaltı
        roadGrad.addColorStop(1, "#475569");   // Doğuda (Meydan v1 girişi) şehir yolu asfaltı
        bctx.fillStyle = roadGrad;
        bctx.fillRect(0, 210, width, 130);

        // Yol Bordür Çizgileri
        bctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        bctx.fillRect(180, 210, width - 180, 3);
        bctx.fillRect(180, 337, width - 180, 3);

        // Doğu Girişi (Meydan v1 / Sokak) Kesik Kesik Yol Çizgileri
        bctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        for (let x = 450; x < width - 20; x += 36) {
            bctx.fillRect(x, 272, 20, 5);
        }

        // 1.3 Kordon Parke Taş Döşeme Deseni (Orta Bölge)
        bctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        bctx.lineWidth = 1;
        for (let x = 200; x <= 850; x += 40) {
            bctx.beginPath();
            bctx.moveTo(x, 210);
            bctx.lineTo(x, 340);
            bctx.stroke();
        }

        // 1.4 Batı Plaj Kumsal Soft Dokusu (x: 0..240)
        let sandNoiseGrad = bctx.createRadialGradient(80, 275, 10, 80, 275, 180);
        sandNoiseGrad.addColorStop(0, "#fef08a");
        sandNoiseGrad.addColorStop(0.7, "#fde047");
        sandNoiseGrad.addColorStop(1, "rgba(253, 224, 71, 0)");
        bctx.fillStyle = sandNoiseGrad;
        bctx.fillRect(0, 160, 260, 240);

        // Kumsal İçi Ahşap Yürüyüş Yolu (Sahil v1'e Yumuşak Geçiş Rampa Tahtaları)
        for (let x = 10; x <= 160; x += 18) {
            bctx.fillStyle = "#b45309";
            bctx.beginPath();
            bctx.roundRect(x, 235, 12, 80, 2);
            bctx.fill();
            bctx.fillStyle = "#78350f";
            bctx.fillRect(x + 2, 237, 2, 76);
        }

        // 2. KUZEY BÖLGE: GRAND SAHİL AVM GÖRKEMLİ DIŞ CEPHESİ (x: 350..650, y: 15..215)
        let mallW = 340;
        let mallX = (width - mallW) / 2; // 330..670
        let mallY = 15;
        let mallH = 195;

        // AVM Arka Gövde & Modern Titanyum Cephe
        let facadeGrad = bctx.createLinearGradient(mallX, 0, mallX + mallW, 0);
        facadeGrad.addColorStop(0, "#0f172a");
        facadeGrad.addColorStop(0.5, "#1e293b");
        facadeGrad.addColorStop(1, "#0f172a");
        bctx.fillStyle = facadeGrad;
        bctx.beginPath();
        bctx.roundRect(mallX, mallY, mallW, mallH, 16);
        bctx.fill();

        // Neon Çerçeve (Cyan & Gold Glow)
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 3;
        bctx.stroke();

        // AVM Tabela Marquee Kutusu
        bctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        bctx.beginPath();
        bctx.roundRect(mallX + 25, mallY + 12, mallW - 50, 42, 8);
        bctx.fill();
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 2;
        bctx.stroke();

        bctx.fillStyle = "#facc15";
        bctx.font = "bold 15px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🛍️ GRAND SAHİL AVM 🛍️", width / 2, mallY + 38);

        // AVM 2 Katlı Renkli Vitrin Pencereleri
        // Sol Vitrin (Kıyafet & Moda)
        bctx.fillStyle = "rgba(236, 72, 153, 0.15)";
        bctx.fillRect(mallX + 25, mallY + 65, 80, 85);
        bctx.strokeStyle = "#ec4899";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(mallX + 25, mallY + 65, 80, 85);

        // Sol Vitrin Mankeni
        bctx.fillStyle = "#ec4899";
        bctx.beginPath();
        bctx.arc(mallX + 65, mallY + 85, 8, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillRect(mallX + 60, mallY + 95, 10, 32);

        // Sağ Vitrin (Smokin & Saat)
        bctx.fillStyle = "rgba(56, 189, 248, 0.15)";
        bctx.fillRect(mallX + mallW - 105, mallY + 65, 80, 85);
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(mallX + mallW - 105, mallY + 65, 80, 85);

        // Sağ Vitrin Mankeni
        bctx.fillStyle = "#38bdf8";
        bctx.beginPath();
        bctx.arc(mallX + mallW - 65, mallY + 85, 8, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillRect(mallX + mallW - 70, mallY + 95, 10, 32);

        // AVM Otomatik Fotoselli Cam Giriş Kapısı (x: 450..550, y: 140..210)
        let doorX = 450, doorY = 145, doorW = 100, doorH = 65;
        let glassGrad = bctx.createLinearGradient(doorX, 0, doorX + doorW, 0);
        glassGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
        glassGrad.addColorStop(0.5, "rgba(224, 242, 254, 0.8)");
        glassGrad.addColorStop(1, "rgba(56, 189, 248, 0.45)");
        bctx.fillStyle = glassGrad;
        bctx.fillRect(doorX, doorY, doorW, doorH);

        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 2.5;
        bctx.strokeRect(doorX, doorY, doorW, doorH);

        // Kapı Bölme Çizgisi
        bctx.strokeStyle = "#ffffff";
        bctx.lineWidth = 1.5;
        bctx.beginPath();
        bctx.moveTo(width / 2, doorY);
        bctx.lineTo(width / 2, doorY + doorH);
        bctx.stroke();

        // Giriş Tabelası
        bctx.fillStyle = "#ef4444";
        bctx.beginPath();
        bctx.roundRect(doorX + 10, doorY + doorH - 18, doorW - 20, 18, 4);
        bctx.fill();
        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 10px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("AVM GİRİŞİ", width / 2, doorY + doorH - 5);

        // Giriş Palmiyeleri
        drawMallPalmPlanter(bctx, mallX - 35, mallY + 120);
        drawMallPalmPlanter(bctx, mallX + mallW + 15, mallY + 120);

        // 3. GÜNEY BÖLGE: SAHİL KORDONU SEYİR TERASI & DENİZ (y: 390..625)
        // 3.1 Kıyı Kordonu Granit Zemin Yolu
        let promenadeGrad = bctx.createLinearGradient(0, 340, 0, height);
        promenadeGrad.addColorStop(0, "#f1f5f9");
        promenadeGrad.addColorStop(0.3, "#e2e8f0");
        promenadeGrad.addColorStop(1, "#cbd5e1");
        bctx.fillStyle = promenadeGrad;
        bctx.fillRect(0, 340, width, height - 340);

        // Kordon Korkulukları & Deniz Hattı
        // Alt Kısım: Berrak Turkuaz Deniz (y: 530..625)
        let seaGrad = bctx.createLinearGradient(0, 530, 0, height);
        seaGrad.addColorStop(0, "#0284c7");
        seaGrad.addColorStop(0.5, "#0369a1");
        seaGrad.addColorStop(1, "#075985");
        bctx.fillStyle = seaGrad;
        bctx.fillRect(0, 530, width, height - 530);

        // Deniz Kordon Bordürü
        bctx.fillStyle = "#ffffff";
        bctx.fillRect(0, 526, width, 5);

        // Kordon Paslanmaz Çelik Korkuluk Direkleri
        bctx.strokeStyle = "#94a3b8";
        bctx.lineWidth = 2;
        for (let rx = 30; rx < width; rx += 45) {
            bctx.beginPath();
            bctx.moveTo(rx, 510);
            bctx.lineTo(rx, 528);
            bctx.stroke();
        }
        bctx.strokeStyle = "#cbd5e1";
        bctx.lineWidth = 2.5;
        bctx.beginPath();
        bctx.moveTo(0, 510);
        bctx.lineTo(width, 510);
        bctx.stroke();

        // 4. SABİT DEKORLAR & TABELALAR
        // 4.1 Doğu Tabelası: Meydan v1'e Yönlendirici Levha
        drawDirectionSign(bctx, 920, 185, "MEYDAN (MERKEZ) ➔", "#38bdf8", true);

        // 4.2 Batı Tabelası: Sahil v1'e Yönlendirici Levha
        drawDirectionSign(bctx, 80, 185, "⬅ SAHİL & PLAJ", "#facc15", false);

        // 4.3 Dondurmacı Arabası (Memo Dondurma)
        drawIceCreamCart(bctx, 160, 375);

        // 4.4 Kordon Dinlenme Bankları
        drawPromenadeBench(bctx, 360, 420);
        drawPromenadeBench(bctx, 640, 420);
        drawPromenadeBench(bctx, 840, 420);

        // 4.5 Kordon Sokak Lambaları
        drawPromenadeStreetLamp(bctx, 270, 370);
        drawPromenadeStreetLamp(bctx, 730, 370);
    }

    /**
     * Dondurmacı Memo Arabası
     */
    function drawIceCreamCart(bctx, x, y) {
        bctx.save();
        bctx.fillStyle = "#0284c7";
        bctx.beginPath();
        bctx.roundRect(x, y, 55, 38, 6);
        bctx.fill();
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        bctx.fillStyle = "#facc15";
        bctx.font = "bold 8px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("DONDURMA", x + 27, y + 22);

        // Tente
        for (let i = 0; i < 5; i++) {
            bctx.fillStyle = i % 2 === 0 ? "#ef4444" : "#ffffff";
            bctx.fillRect(x + i * 11, y - 12, 11, 12);
        }

        // Tekerlekler
        bctx.fillStyle = "#0f172a";
        bctx.beginPath();
        bctx.arc(x + 12, y + 38, 7, 0, Math.PI * 2);
        bctx.arc(x + 43, y + 38, 7, 0, Math.PI * 2);
        bctx.fill();
        bctx.restore();
    }

    /**
     * Yön Tabelası Çizimi
     */
    function drawDirectionSign(bctx, x, y, text, color, isEast) {
        bctx.save();
        // Direk
        bctx.fillStyle = "#475569";
        bctx.fillRect(x - 2, y, 4, 30);

        // Levha
        let w = 120, h = 24;
        let lx = isEast ? (x - w + 10) : (x - 10);
        bctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        bctx.beginPath();
        bctx.roundRect(lx, y - 18, w, h, 6);
        bctx.fill();
        bctx.strokeStyle = color;
        bctx.lineWidth = 1.8;
        bctx.stroke();

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 9.5px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText(text, lx + w / 2, y - 3);
        bctx.restore();
    }

    /**
     * Palmiye Saksısı
     */
    function drawMallPalmPlanter(bctx, x, y) {
        bctx.save();
        bctx.fillStyle = "#ffffff";
        bctx.beginPath();
        bctx.roundRect(x, y + 20, 24, 22, 4);
        bctx.fill();
        bctx.strokeStyle = "#cbd5e1";
        bctx.lineWidth = 1;
        bctx.stroke();

        bctx.fillStyle = "#78350f";
        bctx.fillRect(x + 10, y - 5, 4, 25);

        bctx.fillStyle = "#16a34a";
        bctx.beginPath();
        bctx.ellipse(x + 12, y - 8, 18, 7, -0.3, 0, Math.PI * 2);
        bctx.ellipse(x + 12, y - 8, 18, 7, 0.3, 0, Math.PI * 2);
        bctx.fill();
        bctx.restore();
    }

    /**
     * Kordon Dinlenme Bankı
     */
    function drawPromenadeBench(bctx, x, y) {
        bctx.save();
        bctx.fillStyle = "#b45309";
        bctx.beginPath();
        bctx.roundRect(x - 28, y - 8, 56, 12, 3);
        bctx.fill();
        bctx.fillStyle = "#475569";
        bctx.fillRect(x - 24, y + 4, 6, 12);
        bctx.fillRect(x + 18, y + 4, 6, 12);
        bctx.restore();
    }

    /**
     * Kordon Sokak Lambası
     */
    function drawPromenadeStreetLamp(bctx, x, y) {
        bctx.save();
        bctx.fillStyle = "#1e293b";
        bctx.fillRect(x - 2, y - 45, 4, 45);
        bctx.fillStyle = "#facc15";
        bctx.beginPath();
        bctx.arc(x, y - 48, 6, 0, Math.PI * 2);
        bctx.fill();

        // Işık Halesi
        let halo = bctx.createRadialGradient(x, y - 48, 2, x, y - 48, 22);
        halo.addColorStop(0, "rgba(254, 240, 138, 0.5)");
        halo.addColorStop(1, "rgba(254, 240, 138, 0)");
        bctx.fillStyle = halo;
        bctx.beginPath();
        bctx.arc(x, y - 48, 22, 0, Math.PI * 2);
        bctx.fill();
        bctx.restore();
    }

    /**
     * DİNAMİK ÇEVRE ÇİZİMİ (Deniz Dalga Köpükleri, Canlı Işıklar & Rozetler)
     */
    function drawSahilYoluEnvironment() {
        if (typeof canvas === 'undefined' || !canvas || typeof ctx === 'undefined' || !ctx) return;
        const width = canvas.width;
        const height = canvas.height;

        let bg = bgCache.getCanvas('sahil_yolu', width, height);
        ctx.drawImage(bg, 0, 0);

        const now = Date.now();

        // 1. Canlı Deniz Dalgaları & Köpük Animasyonu (Güney Deniz Hattında: y: 530..625)
        ctx.save();
        for (let i = 0; i < 4; i++) {
            let waveSpeed = (now / 600 + i * 1.6);
            let waveY = 540 + i * 22 + Math.sin(waveSpeed) * 4;
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 - i * 0.08})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(0, waveY);
            for (let x = 0; x <= width; x += 30) {
                let cy = waveY + Math.sin((x / 40) + waveSpeed) * 3;
                ctx.lineTo(x, cy);
            }
            ctx.stroke();
        }
        ctx.restore();

        // 2. Oyuncu Pozisyonuna Göre Dinamik Kapı ve Geçiş İpuçları
        const myP = (typeof myId !== 'undefined' && typeof players !== 'undefined') ? players[myId] : null;
        if (!myP) return;

        // AVM Kapısı Yakınında
        let distAvm = Math.hypot(myP.x - AVM_ENTRANCE.x, myP.y - AVM_ENTRANCE.y);
        if (distAvm <= 75) {
            let pulse = Math.sin(now / 180) * 2;
            ctx.save();
            ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
            ctx.beginPath();
            ctx.roundRect(AVM_ENTRANCE.x - 75, AVM_ENTRANCE.y - 48 + pulse, 150, 26, 6);
            ctx.fill();
            ctx.strokeStyle = "#facc15";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = "#facc15";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🛍️ Grand Sahil AVM'ye Gir", AVM_ENTRANCE.x, AVM_ENTRANCE.y - 32 + pulse);
            ctx.restore();
        }

        // Meydan v1 Çıkışı Yakınında (Doğu)
        if (myP.x >= 920 && myP.y >= 200 && myP.y <= 320) {
            drawExitHintBadge(ctx, 940, 230, "Meydan (Merkez) [➔]", "#38bdf8", now);
        }

        // Sahil v1 Çıkışı Yakınında (Batı)
        if (myP.x <= 80 && myP.y >= 200 && myP.y <= 320) {
            drawExitHintBadge(ctx, 60, 230, "Sahil & Plaj [⬅]", "#facc15", now);
        }
    }

    function drawExitHintBadge(ctx, x, y, text, color, now) {
        ctx.save();
        let pulse = Math.sin(now / 180) * 2;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.beginPath();
        ctx.roundRect(x - 65, y - 14 + pulse, 130, 26, 6);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text, x, y + 3 + pulse);
        ctx.restore();
    }

    /**
     * Sahil Yolu Çarpışma Kontrolü (Collision)
     */
    function checkSahilYoluCollision(x, y) {
        // Doğu Çıkışı: Meydan v1'e geçiş açık (x >= 970, y: 195..335)
        if (x >= 970 && y >= 195 && y <= 335) return false;

        // Batı Çıkışı: Sahil v1'e geçiş açık (x <= 30, y: 195..335)
        if (x <= 30 && y >= 195 && y <= 335) return false;

        // Dış Sınırlar
        if (x < 25 || x > 975) return true;
        if (y < 195 && !(x >= 420 && x <= 580 && y >= 145)) return true; // Kuzey sınır (AVM kapısı hariç)
        if (y > 515) return true; // Güney deniz sınırına düşülemez

        // AVM Binası Masif Duvarları
        if (x >= 320 && x <= 680 && y < 205) {
            // Sadece AVM giriş kapısı aralığı açık (x: 420..580, y >= 145)
            if (x >= 420 && x <= 580 && y >= 145) return false;
            return true;
        }

        // Dondurmacı Arabası (x: 155..220, y: 370..415)
        if (x >= 155 && x <= 220 && y >= 370 && y <= 415) return true;

        // Banklar
        if (x >= 330 && x <= 390 && y >= 415 && y <= 435) return true;
        if (x >= 610 && x <= 670 && y >= 415 && y <= 435) return true;
        if (x >= 810 && x <= 870 && y >= 415 && y <= 435) return true;

        return false;
    }

    /**
     * Sahil Yolu Tıklama Yönetimi
     */
    function handleSahilYoluClick(clickX, clickY, p) {
        // 1. AVM Binası veya Kapısına Tıklama
        let distAvm = Math.hypot(clickX - AVM_ENTRANCE.x, clickY - AVM_ENTRANCE.y);
        if (distAvm <= 85 || (clickX >= 320 && clickX <= 680 && clickY <= 235)) {
            if (typeof changeRoom === 'function') changeRoom('avm_kat1');
            return true;
        }

        // 2. Doğu Tabelası / Meydan v1 Çıkışına Tıklama
        if (clickX >= 910 && clickY >= 170 && clickY <= 340) {
            if (typeof changeRoom === 'function') changeRoom('sokak');
            return true;
        }

        // 3. Batı Tabelası / Sahil v1 Çıkışına Tıklama
        if (clickX <= 90 && clickY >= 170 && clickY <= 340) {
            if (typeof changeRoom === 'function') changeRoom('sahil');
            return true;
        }

        return false;
    }

    /**
     * Yürüyerek Koridor Geçiş Denetimi
     */
    function checkSahilYoluPortalStep(p) {
        if (!p) return false;

        // Doğuya yürürse Meydan v1'e (sokak) geç
        if (p.x >= 975 && p.y >= 195 && p.y <= 340) {
            if (typeof changeRoom === 'function') changeRoom('sokak');
            return true;
        }

        // Batıya yürürse Sahil v1'e (sahil) geç
        if (p.x <= 28 && p.y >= 195 && p.y <= 340) {
            if (typeof changeRoom === 'function') changeRoom('sahil');
            return true;
        }

        // AVM Kapısına adım atarsa Kat 1'e gir
        if (p.x >= 420 && p.x <= 580 && p.y <= 215) {
            if (typeof changeRoom === 'function') changeRoom('avm_kat1');
            return true;
        }

        return false;
    }

    // Global Dışa Aktarımlar
    window.renderStaticSahilYoluTo = renderStaticSahilYoluTo;
    window.drawSahilYoluEnvironment = drawSahilYoluEnvironment;
    window.checkSahilYoluCollision = checkSahilYoluCollision;
    window.handleSahilYoluClick = handleSahilYoluClick;
    window.checkSahilYoluPortalStep = checkSahilYoluPortalStep;
})();
