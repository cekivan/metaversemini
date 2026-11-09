// public/js/renderers/renderMineCave.js - 2.5D İzometrik Maden Haritası (mine_cave) Canvas Çizim Motoru
// 12 Maden Kayası, Maden Tüccarı Cabbar NPC, Ahşap Kirişler, Meşaleler ve Raylar

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    // Meşalelerin Duvar Koordinatları
    const TORCHES = [
        { x: 120, y: 130 },
        { x: 300, y: 115 },
        { x: 500, y: 110 },
        { x: 700, y: 115 },
        { x: 880, y: 130 },
        { x: 200, y: 260 },
        { x: 820, y: 250 }
    ];

    // Ahşap Destek Kirişleri (Mine Timber Trusses)
    const TIMBER_TRUSSES = [
        { x: 260, y: 110, w: 22, h: 420 },
        { x: 500, y: 105, w: 22, h: 440 },
        { x: 740, y: 110, w: 22, h: 420 }
    ];

    /**
     * Maden Mağarası Zemin ve Statik Çevre Çizimi
     */
    function drawMineCaveStaticBackground(ctx) {
        // 1. Zemin Fonu: Derin Bazalt Kaya & Karanlık Mağara Atmosferi
        ctx.fillStyle = "#090d16";
        ctx.fillRect(0, 0, CANV_W, CANV_H);

        // Zemin İzometrik Kaya Karo Dokusu
        const tileSize = 40;
        ctx.lineWidth = 1;
        for (let y = 110; y < CANV_H; y += 28) {
            for (let x = 0; x < CANV_W; x += 55) {
                const shift = ((y / 28) % 2 === 0) ? 0 : 27;
                const rx = x + shift;
                ctx.fillStyle = ((x + y) % 3 === 0) ? "#0f172a" : "#1e293b";
                ctx.fillRect(rx, y, 52, 26);
                ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                ctx.strokeRect(rx, y, 52, 26);

                // Kaya yüzey çatlakları
                if ((x * y) % 7 === 0) {
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
                    ctx.beginPath();
                    ctx.moveTo(rx + 8, y + 6);
                    ctx.lineTo(rx + 24, y + 18);
                    ctx.stroke();
                }
            }
        }

        // 2. Tavandaki Sarkıtlar ve Üst Kaya Kütleleri (y: 0..120)
        ctx.fillStyle = "#0b0f19";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(CANV_W, 0);
        ctx.lineTo(CANV_W, 90);

        // Sarkıt uçları
        for (let sx = CANV_W; sx >= 0; sx -= 45) {
            const h = 75 + Math.sin(sx * 0.05) * 35;
            ctx.lineTo(sx - 20, h);
            ctx.lineTo(sx - 45, 60);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 3. Maden Rayları (Minecart Tracks: Ortadan Kıvrılan Çift Ray)
        drawMineTracks(ctx);

        // 4. Dekoratif Maden Vagonu (Minecart)
        drawDecorativeMinecart(ctx, 430, 275);
    }

    /**
     * Maden Raylarını Çizer (y: 270..330 ekseninde)
     */
    function drawMineTracks(ctx) {
        ctx.save();
        // Ahşap Traversler (Ties)
        ctx.fillStyle = "#451a03";
        ctx.strokeStyle = "#271102";
        ctx.lineWidth = 1;
        for (let tx = 60; tx < CANV_W - 60; tx += 30) {
            const ty = 280 + Math.sin(tx * 0.006) * 20;
            ctx.save();
            ctx.translate(tx, ty);
            ctx.rotate(0.06);
            ctx.fillRect(-6, -18, 12, 36);
            ctx.strokeRect(-6, -18, 12, 36);
            ctx.restore();
        }

        // Çelik Ray Çubukları (İki Paralel Ray)
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 3.5;
        // Üst Ray
        ctx.beginPath();
        for (let rx = 50; rx <= CANV_W - 50; rx += 20) {
            const ry = 268 + Math.sin(rx * 0.006) * 20;
            if (rx === 50) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
        }
        ctx.stroke();

        // Alt Ray
        ctx.beginPath();
        for (let rx = 50; rx <= CANV_W - 50; rx += 20) {
            const ry = 292 + Math.sin(rx * 0.006) * 20;
            if (rx === 50) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
        }
        ctx.stroke();

        // Çelik Parıltı Çizgisi
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let rx = 50; rx <= CANV_W - 50; rx += 20) {
            const ry = 267 + Math.sin(rx * 0.006) * 20;
            if (rx === 50) ctx.moveTo(rx, ry);
            else ctx.lineTo(rx, ry);
        }
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Dekoratif Dolu Maden Vagonu Çizer
     */
    function drawDecorativeMinecart(ctx, cartX, cartY) {
        ctx.save();
        // Vagon Tekerlekleri
        ctx.fillStyle = "#1e293b";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cartX - 22, cartY + 14, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(cartX + 22, cartY + 14, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Demir Vagon Gövdesi
        const cartGrad = ctx.createLinearGradient(cartX - 35, cartY - 20, cartX + 35, cartY + 12);
        cartGrad.addColorStop(0, "#475569");
        cartGrad.addColorStop(0.5, "#334155");
        cartGrad.addColorStop(1, "#1e293b");
        ctx.fillStyle = cartGrad;
        ctx.beginPath();
        ctx.moveTo(cartX - 36, cartY - 18);
        ctx.lineTo(cartX + 36, cartY - 18);
        ctx.lineTo(cartX + 28, cartY + 12);
        ctx.lineTo(cartX - 28, cartY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.stroke();

        // İçindeki Işıldayan Cevher Yığını (Kömür, Bakır, Kristal)
        ctx.fillStyle = "#1e1e1e";
        ctx.beginPath(); ctx.arc(cartX - 16, cartY - 20, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fb923c"; // Bakır
        ctx.beginPath(); ctx.arc(cartX, cartY - 22, 11, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#38bdf8"; // Elmas kristali
        ctx.beginPath(); ctx.arc(cartX + 16, cartY - 21, 9, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    /**
     * Titreşen Duvar Meşaleleri (Flickering Torches with Warm Radial Glow)
     */
    function drawTorches(ctx) {
        const time = Date.now();
        const flicker = Math.sin(time / 140) * 0.08 + Math.cos(time / 85) * 0.05;

        TORCHES.forEach((t, idx) => {
            ctx.save();
            // Sıcak Turuncu Radyal Işık Halesi
            const glowRadius = 55 + Math.sin(time / 120 + idx) * 8;
            const glow = ctx.createRadialGradient(t.x, t.y, 4, t.x, t.y, glowRadius);
            glow.addColorStop(0, `rgba(251, 146, 60, ${0.45 + flicker})`);
            glow.addColorStop(0.5, `rgba(245, 158, 11, ${0.20 + flicker * 0.5})`);
            glow.addColorStop(1, "rgba(251, 146, 60, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(t.x, t.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();

            // Ahşap / Demir Meşale Sapı
            ctx.fillStyle = "#78350f";
            ctx.fillRect(t.x - 3, t.y, 6, 20);
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1;
            ctx.strokeRect(t.x - 3, t.y, 6, 20);

            // Demir Halka
            ctx.fillStyle = "#475569";
            ctx.fillRect(t.x - 5, t.y + 4, 10, 4);

            // Alev Çekirdeği
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath();
            ctx.moveTo(t.x - 5, t.y + 2);
            ctx.lineTo(t.x + 5, t.y + 2);
            ctx.lineTo(t.x, t.y - 12 - (flicker * 15));
            ctx.closePath();
            ctx.fill();

            // Sıcak İç Alev
            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(t.x, t.y - 1, 3.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    /**
     * Ahşap Maden Destek Kirişleri (Timber Trusses)
     */
    function drawTimberTrusses(ctx) {
        ctx.save();
        TIMBER_TRUSSES.forEach(beam => {
            // Sol ve Sağ Kolonlar
            ctx.fillStyle = "#5c2b09";
            ctx.fillRect(beam.x - 14, beam.y, 14, 60);
            ctx.fillRect(beam.x + beam.w, beam.y, 14, 60);

            // Üst Yatay Kiriş
            ctx.fillStyle = "#78350f";
            ctx.fillRect(beam.x - 20, beam.y, beam.w + 40, 16);
            ctx.strokeStyle = "#381804";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(beam.x - 20, beam.y, beam.w + 40, 16);

            // Demir Bağlantı Plakaları ve Perçinler
            ctx.fillStyle = "#334155";
            ctx.fillRect(beam.x - 12, beam.y + 2, 8, 12);
            ctx.fillRect(beam.x + beam.w + 4, beam.y + 2, 8, 12);
        });
        ctx.restore();
    }

    /**
     * Maden Tüccarı NPC'sini Çizer: CevherAlıcı Cabbar
     * Konum: x: 180, y: 440
     */
    function drawCabbarNPC(ctx) {
        const x = 180, y = 440;
        ctx.save();

        // 1. Karakter Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(x, y + 16, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Madenci Baretinin Fener Işığı (İleriye Doğu Vuran Koni)
        const time = Date.now();
        const beamPulse = Math.sin(time / 200) * 0.05;
        const beamGrad = ctx.createRadialGradient(x, y - 48, 4, x + 35, y - 42, 75);
        beamGrad.addColorStop(0, `rgba(254, 240, 138, ${0.75 + beamPulse})`);
        beamGrad.addColorStop(0.6, `rgba(253, 224, 71, ${0.25 + beamPulse})`);
        beamGrad.addColorStop(1, "rgba(253, 224, 71, 0)");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(x + 2, y - 48);
        ctx.lineTo(x + 95, y - 75);
        ctx.lineTo(x + 95, y - 10);
        ctx.closePath();
        ctx.fill();

        // 3. Ağır Madenci Botları
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(x - 12, y + 6, 10, 12);
        ctx.fillRect(x + 2, y + 6, 10, 12);

        // 4. Turuncu Madenci Tulumu & Pantolon
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.roundRect(x - 14, y - 24, 28, 32, 4);
        ctx.fill();
        ctx.strokeStyle = "#9a3412";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Gri Reflektif Şeritler (Yansıtıcı Güvenlik Şeridi)
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(x - 13, y - 12, 26, 4);
        ctx.fillRect(x - 13, y + 2, 26, 3);

        // Kemer ve Takım Çantası
        ctx.fillStyle = "#451a03";
        ctx.fillRect(x - 14, y - 2, 28, 5);
        ctx.fillStyle = "#78350f";
        ctx.fillRect(x + 8, y - 3, 8, 9); // Yan alet çantası

        // Kollar ve İş Eldivenleri
        ctx.fillStyle = "#c2410c";
        ctx.fillRect(x - 18, y - 22, 6, 18);
        ctx.fillRect(x + 12, y - 22, 6, 18);
        ctx.fillStyle = "#78350f"; // Deri eldiven
        ctx.beginPath(); ctx.arc(x - 15, y - 4, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 15, y - 4, 4, 0, Math.PI * 2); ctx.fill();

        // 5. Kafa, Sakal ve Yüz
        ctx.fillStyle = "#fed7aa"; // Ten rengi
        ctx.beginPath();
        ctx.arc(x, y - 35, 12, 0, Math.PI * 2);
        ctx.fill();

        // Gür Kırçıllı Sakal
        ctx.fillStyle = "#64748b";
        ctx.beginPath();
        ctx.arc(x, y - 33, 11, 0, Math.PI);
        ctx.lineTo(x, y - 20);
        ctx.closePath();
        ctx.fill();

        // Gözler
        ctx.fillStyle = "#1e293b";
        ctx.beginPath(); ctx.arc(x - 4, y - 37, 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + 4, y - 37, 1.8, 0, Math.PI * 2); ctx.fill();

        // 6. Sarı Madenci Bareti (Hard Hat)
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(x, y - 45, 14, Math.PI, 0, false);
        ctx.lineTo(x + 16, y - 43);
        ctx.lineTo(x - 16, y - 43);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Baret Siperliği
        ctx.fillStyle = "#eab308";
        ctx.fillRect(x - 17, y - 44, 34, 4);

        // Baret Üstündeki Işıklı Fener
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x - 4, y - 50, 8, 6);
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(x, y - 47, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 7. Cabbar İsim ve Tıklama Rozeti
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(x - 70, y - 72, 140, 20, 6);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#fde047";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⛏️ CevherAlıcı Cabbar", x, y - 58);

        ctx.restore();
    }

    /**
     * Tek Bir Maden Kayanı Çizer (ACTIVE veya DEPLETED)
     */
    function drawSingleOreNode(ctx, node, isHovered, isNear) {
        const x = node.x;
        const y = node.y;
        const isActive = (node.state === 'ACTIVE');

        ctx.save();

        if (isActive) {
            // -------------------------------------------------------------
            // AKTİF MADEN KAYASI (3D İzometrik Kristalli Kütle)
            // -------------------------------------------------------------
            const time = Date.now();
            const pulse = Math.sin(time / 300 + node.id) * 3;

            // Zemin Gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.ellipse(x, y + 16, 32, 14, 0, 0, Math.PI * 2);
            ctx.fill();

            // Seçili / Yakında ise Alt Işık Halkası
            if (isHovered || isNear) {
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.ellipse(x, y + 16, 36, 16, 0, 0, Math.PI * 2);
                ctx.stroke();
            }

            // Ana Kaya Gövdesi (Köşeli Çokgen)
            const rockGrad = ctx.createLinearGradient(x - 30, y - 30, x + 30, y + 15);
            rockGrad.addColorStop(0, "#475569");
            rockGrad.addColorStop(0.5, "#334155");
            rockGrad.addColorStop(1, "#1e293b");
            ctx.fillStyle = rockGrad;

            ctx.beginPath();
            ctx.moveTo(x - 30, y + 12);
            ctx.lineTo(x - 32, y - 8);
            ctx.lineTo(x - 16, y - 28);
            ctx.lineTo(x + 14, y - 32);
            ctx.lineTo(x + 32, y - 10);
            ctx.lineTo(x + 28, y + 14);
            ctx.lineTo(x, y + 20);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 2;
            ctx.stroke();

            // Kaya Faset Çizgileri ve Işık Alan Yüzeyler
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.beginPath();
            ctx.moveTo(x - 16, y - 28);
            ctx.lineTo(x + 14, y - 32);
            ctx.lineTo(x + 6, y - 8);
            ctx.lineTo(x - 12, y - 6);
            ctx.closePath();
            ctx.fill();

            // Parıldayan Cevher Damarları (Damar Çatlakları: Bakır, Demir, Kristal)
            const veinColor = (node.id % 3 === 0) ? "#38bdf8" : ((node.id % 3 === 1) ? "#fb923c" : "#e2e8f0");
            ctx.fillStyle = veinColor;
            ctx.shadowColor = veinColor;
            ctx.shadowBlur = 8 + pulse;

            // Damar 1
            ctx.beginPath();
            ctx.moveTo(x - 14, y - 12);
            ctx.lineTo(x - 6, y - 4);
            ctx.lineTo(x - 10, y + 4);
            ctx.lineTo(x - 4, y + 8);
            ctx.lineTo(x - 6, y + 10);
            ctx.lineTo(x - 14, y + 4);
            ctx.closePath();
            ctx.fill();

            // Damar 2
            ctx.beginPath();
            ctx.moveTo(x + 8, y - 16);
            ctx.lineTo(x + 18, y - 8);
            ctx.lineTo(x + 12, y + 2);
            ctx.lineTo(x + 20, y + 6);
            ctx.lineTo(x + 16, y + 8);
            ctx.lineTo(x + 6, y - 4);
            ctx.closePath();
            ctx.fill();

            ctx.shadowBlur = 0; // Gölgeyi sıfırla

            // Kristal Pırıltı Kıvılcımı
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(x - 6, y - 4, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Üst Etiket
            if (isHovered || isNear) {
                ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
                ctx.beginPath();
                ctx.roundRect(x - 45, y - 48, 90, 18, 5);
                ctx.fill();
                ctx.strokeStyle = "#38bdf8";
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.fillStyle = "#38bdf8";
                ctx.font = "bold 8.5px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("⛏️ Maden Kayası", x, y - 36);
            }
        } else {
            // -------------------------------------------------------------
            // TÜKENMİŞ MADEN KAYASI (DEPLETED: Kırılmış Düz Taş Yığını)
            // -------------------------------------------------------------
            // Zemin Gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            ctx.beginPath();
            ctx.ellipse(x, y + 10, 26, 8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Kırılmış Taş Yığını
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.moveTo(x - 24, y + 8);
            ctx.lineTo(x - 18, y - 2);
            ctx.lineTo(x - 6, y - 6);
            ctx.lineTo(x + 12, y - 4);
            ctx.lineTo(x + 24, y + 8);
            ctx.lineTo(x, y + 12);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Moloz Parçacıkları
            ctx.fillStyle = "#334155";
            ctx.fillRect(x - 14, y + 2, 6, 4);
            ctx.fillRect(x + 4, y, 7, 5);
            ctx.fillRect(x - 4, y + 5, 5, 4);

            // Geri Sayım Sayacı Rozeti (Respawn Countdown)
            const remainingSec = Math.max(0, Math.ceil(((node.respawnAt || 0) - Date.now()) / 1000));
            ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
            ctx.beginPath();
            ctx.roundRect(x - 44, y - 26, 88, 17, 5);
            ctx.fill();
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "#94a3b8";
            ctx.font = "bold 8px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`⏳ Yenileniyor: ${remainingSec}s`, x, y - 15);
        }

        ctx.restore();
    }

    /**
     * Çıkış Kapısı (Cadde 2'ye Dönüş Portalı: x: 100, y: 530)
     */
    function drawExitPortal(ctx) {
        const x = 110, y = 530;
        ctx.save();

        // Dışarıdan Sızan Gün Işığı / Sokak Işıltısı
        const lightGrad = ctx.createRadialGradient(x, y, 8, x, y, 65);
        lightGrad.addColorStop(0, "rgba(56, 189, 248, 0.45)");
        lightGrad.addColorStop(0.5, "rgba(56, 189, 248, 0.15)");
        lightGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = lightGrad;
        ctx.beginPath();
        ctx.arc(x, y, 65, 0, Math.PI * 2);
        ctx.fill();

        // Çıkış Ahşap Tabelası
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.roundRect(x - 45, y - 30, 90, 24, 6);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("⬅ Cadde 2'ye Dön", x, y - 15);

        ctx.restore();
    }

    /**
     * STATİK MADEN MAĞARASI ÇİZİMİ (bgCache Uyumlu)
     */
    function renderStaticMineCaveTo(bctx, width, height) {
        width = width || CANV_W;
        height = height || CANV_H;
        bctx.clearRect(0, 0, width, height);

        // 1. Statik Zemin, Kaya Dokusu, Sarkıtlar, Raylar ve Vagon
        drawMineCaveStaticBackground(bctx);

        // 2. Ahşap Destek Kirişleri
        drawTimberTrusses(bctx);

        // 3. Çıkış Portalı & Tabelası
        drawExitPortal(bctx);
    }

    /**
     * ANA ÇEVRE VE Y-SORTING MOTORU (drawMineCaveEnvironment)
     */
    // Sıfır Garbage Collection (Zero-GC) Havuzları
    const _mineSortQueue = [];
    const _mineNodeSlots = [];
    const _cabbarSlot = {
        sortY: 460,
        draw: (ctx) => drawCabbarNPC(ctx)
    };

    function drawMineCaveEnvironment() {
        if (typeof ctx === 'undefined' || !ctx) return;

        // 1. Önbellekli Arka Planı Çiz (Offscreen bgCache)
        if (typeof bgCache !== 'undefined') {
            let bg = bgCache.getCanvas('mine_cave', CANV_W, CANV_H);
            ctx.drawImage(bg, 0, 0);
        } else {
            renderStaticMineCaveTo(ctx, CANV_W, CANV_H);
        }

        // 2. Canlı Titreşen Duvar Meşaleleri
        drawTorches(ctx);

        // 3. Y-Sorting Render Kuyruğu (Zero-GC Sıfır-Tahsisli Havuzlama)
        _mineSortQueue.length = 0;
        _mineSortQueue.push(_cabbarSlot);

        const nodes = (window.miningClient && window.miningClient.nodes) ? window.miningClient.nodes : (window.MINE_NODES_CACHE || []);
        const myPlayer = (typeof players !== 'undefined' && typeof socket !== 'undefined' && socket && players[socket.id]) ? players[socket.id] : null;

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            const isNear = myPlayer ? (Math.hypot(myPlayer.x - node.x, myPlayer.y - node.y) < 75) : false;
            const isHovered = (window.miningClient && window.miningClient.hoveredNodeId === node.id);

            let slot = _mineNodeSlots[i];
            if (!slot) {
                slot = {
                    sortY: 0,
                    node: null,
                    isHovered: false,
                    isNear: false,
                    draw: function(c) {
                        drawSingleOreNode(c, this.node, this.isHovered, this.isNear);
                    }
                };
                _mineNodeSlots[i] = slot;
            }
            slot.sortY = node.y + 25;
            slot.node = node;
            slot.isHovered = isHovered;
            slot.isNear = isNear;
            _mineSortQueue.push(slot);
        }

        // Kuyruktaki nesneleri Y eksenine göre sırala ve çiz
        _mineSortQueue.sort((a, b) => a.sortY - b.sortY);
        for (let i = 0; i < _mineSortQueue.length; i++) {
            _mineSortQueue[i].draw(ctx);
        }

        // 5. Madencilik Refleks Mini-Oyunu (Skill-Check UI) aktifse çiz
        if (window.miningClient && typeof window.miningClient.drawMiniGame === 'function') {
            window.miningClient.drawMiniGame(ctx);
        }

        // 6. Uçuşan Cevher ve Efekt Metinleri (Floating Drop Texts & Particles)
        if (window.miningClient && typeof window.miningClient.drawEffects === 'function') {
            window.miningClient.drawEffects(ctx);
        }
    }

    // Global nesneye aktar
    window.renderStaticMineCaveTo = renderStaticMineCaveTo;
    window.drawMineCaveEnvironment = drawMineCaveEnvironment;
    window.drawCabbarNPC = drawCabbarNPC;
    window.drawSingleOreNode = drawSingleOreNode;
})();

