// public/js/renderers/renderAvmMall.js - Grand Sahil AVM (2.5D İzometrik Sanalika Mimarisi)
// MEKAN_TASARLAMA_REHBERI.md Standartlarına Tam Uyumlu 3D Katı Model (Solid Modeling) ve Derinlik (Y-Sorting) Mimarisi.
// 1000x625 Çözünürlük, 2:1 İzometrik İzdüşüm, Çift Katmanlı Kontak Gölgeleri, Sıfır Kırpılmalı Zemin Ekvatoru (Center-Equator Y-Sorting).

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    // Asansör Konumu
    const ELEVATOR_POS = {
        x: 935,
        y: 280,
        yBase: 340,
        w: 75,
        h: 140,
        doorX: 935,
        doorY: 330
    };

    // Yürüyen Merdiven Konumu (Kat 1 <-> Kat 2 Arası)
    const ESCALATOR_POS = {
        x: 450,
        y: 110,
        yBase: 175,
        w: 100,
        h: 65,
        doorX: 500,
        doorY: 175
    };

    // Kat 1 Giriş Kiosk Konumu
    const KIOSK_POS = {
        x: 500,
        y: 495,
        yBase: 525,
        radius: 26
    };

    // Dükkan Kapıları ve Hedef İç Mekanlar (İzometrik Koordinatlar)
    const STORE_DOORS = {
        avm_kat1: [
            {
                id: 'avm_magaza_kiyafet',
                name: 'Cadde Moda Butiği',
                doorX: 130,
                doorY: 280,
                color: '#ec4899',
                icon: '👗',
                npcName: 'Selin (Moda Danışmanı)'
            },
            {
                id: 'avm_magaza_sapka',
                name: 'Headwear Co. Şapkacı',
                doorX: 340,
                doorY: 210,
                color: '#eab308',
                icon: '🧢',
                npcName: 'Caner (Şapkacı)'
            },
            {
                id: 'optik',
                name: 'Optik Gözlük Butiği',
                doorX: 660,
                doorY: 210,
                color: '#38bdf8',
                icon: '🕶️',
                npcName: 'Optik Kenan'
            },
            {
                id: 'avm_magaza_sneaker',
                name: 'Sneaker Lab Dünyası',
                doorX: 865,
                doorY: 280,
                color: '#0ea5e9',
                icon: '👟',
                npcName: 'Bora (Sneakerhead)'
            }
        ],
        avm_kat2: [
            {
                id: 'avm_magaza_takim',
                name: 'Sartoria Milano',
                doorX: 130,
                doorY: 280,
                color: '#a855f7',
                icon: '🤵',
                npcName: 'Centilmen Marco'
            },
            {
                id: 'avm_magaza_saat',
                name: 'Chronos VIP Saatçi',
                doorX: 340,
                doorY: 210,
                color: '#38bdf8',
                icon: '⌚',
                npcName: 'Artin Usta'
            },
            {
                id: 'avm_magaza_berber',
                name: 'Salon De Paris VIP Berber',
                doorX: 865,
                doorY: 280,
                color: '#ef4444',
                icon: '💈',
                npcName: 'Kuaför Arda'
            }
        ]
    };

    // AVM NPC Tanımları
    const AVM_NPCS = {
        selin: {
            id: 'selin', name: 'Selin', title: 'Moda Danışmanı', floor: 'avm_kat1',
            storeName: 'Cadde Moda Butiği', category: 'tshirts',
            quote: 'Hoş geldiniz! En taze sokak modası ve tişörtler burada!'
        },
        bora: {
            id: 'bora', name: 'Bora', title: 'Sneakerhead', floor: 'avm_kat1',
            storeName: 'Sneaker Lab Dünyası', category: 'shoes',
            quote: 'Selam kanka! Özel sneakerlar ve sokak botları burada!'
        },
        caner: {
            id: 'caner', name: 'Caner', title: 'Şapkacı', floor: 'avm_kat1',
            storeName: 'Headwear Co. Şapka & Bere', category: 'hats',
            quote: 'Tarzınıza hava katacak en şık şapkalar hazır!'
        },
        kenan: {
            id: 'kenan', name: 'Optik Kenan', title: 'Gözlük Danışmanı', floor: 'avm_kat1',
            storeName: 'Optik Gözlük Butiği', category: 'glasses',
            quote: 'Lüks gözlük koleksiyonumuzla bakışlarınıza tarz katın!'
        },
        marco: {
            id: 'marco', name: 'Centilmen Marco', title: 'Özel Dikim Şefi', floor: 'avm_kat2',
            storeName: 'Sartoria Milano', category: 'outfits',
            quote: 'İtalyan zarafeti ve asil smokinler için doğru adrestesiniz.'
        },
        artin: {
            id: 'artin', name: 'Artin Usta', title: 'Saat Üstadı', floor: 'avm_kat2',
            storeName: 'Chronos VIP Saatçi', category: 'watches',
            quote: 'Zaman paha biçilemez evlat. Karakter 2 için özel Astral Tourbillon saatimiz geldi!'
        },
        arda: {
            id: 'arda', name: 'Kuaför Arda', title: 'Baş Stilist & Berber', floor: 'avm_kat2',
            storeName: 'Salon De Paris VIP Berber', category: 'hats',
            quote: 'Saç ve sakal stiline hava katmaya hazır mısın? Koltuğa buyur!'
        }
    };

    /**
     * Gardırop Filtresi
     */
    window.openAvmStore = function (category, npcId) {
        const npc = AVM_NPCS[npcId];
        if (typeof openWardrobe === 'function') {
            openWardrobe();
            if (typeof switchWardrobeTab === 'function') switchWardrobeTab(category);
            if (npc && typeof showFloatingToast === 'function') showFloatingToast(`${npc.name}: "${npc.quote}"`);
        }
    };

    // =========================================================================
    // 1. STATİK RENDER: 2.5D İZOMETRİK MİMARİ & DOKULAR (bgCache İle Önbelleğe Alınır)
    // =========================================================================

    /**
     * Arka Plan, Tavan & Çelik-Cam Kubbe (Skylight)
     */
    function drawAtriumSkyAndCeiling(ctx, width, height) {
        // Tüm tuvali sıcak obsidian / lüks lacivert tonla doldur
        let bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, "#050811");
        bgGrad.addColorStop(0.3, "#0b1222");
        bgGrad.addColorStop(1, "#080c16");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Yıldızlı Atriyum Kubbesi (y: 0..68)
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        const stars = [
            { x: 80, y: 22 }, { x: 220, y: 15 }, { x: 360, y: 32 },
            { x: 500, y: 18 }, { x: 640, y: 28 }, { x: 780, y: 16 }, { x: 920, y: 26 }
        ];
        stars.forEach(st => {
            ctx.beginPath();
            ctx.arc(st.x, st.y, 1.4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Çelik Kubbe Kafesi & Geometrik Kirişler
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        for (let x = 60; x <= 940; x += 110) {
            ctx.moveTo(x, 0);
            ctx.lineTo(500, 68);
            ctx.lineTo(x + 55, 0);
        }
        ctx.stroke();

        // Tavan Altın Friz Bordürü
        let frieze = ctx.createLinearGradient(0, 62, 0, 70);
        frieze.addColorStop(0, "#d4af37");
        frieze.addColorStop(0.5, "#fef08a");
        frieze.addColorStop(1, "#b45309");
        ctx.fillStyle = frieze;
        ctx.fillRect(0, 62, width, 7);

        // Gizli LED Aydınlatma Işıltısı (Cove Lighting)
        let coveGrad = ctx.createLinearGradient(0, 69, 0, 95);
        coveGrad.addColorStop(0, "rgba(254, 240, 138, 0.28)");
        coveGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
        ctx.fillStyle = coveGrad;
        ctx.fillRect(0, 69, width, 26);
    }

    /**
     * Kat 1: 2.5D İzometrik Elmas Mermer Zemin (Carrara & Gold Inlay)
     */
    function drawIsometricMarbleFloor(ctx, width, height) {
        ctx.save();

        // Zemin Poligonu: Sol duvardan sağ duvara tam oturur
        ctx.beginPath();
        ctx.moveTo(0, 320);
        ctx.lineTo(500, 150);
        ctx.lineTo(1000, 320);
        ctx.lineTo(1000, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.clip();

        // Mermer Ana Tonu (Sıcak Fildişi Carrara)
        let baseGrad = ctx.createLinearGradient(0, 150, 0, height);
        baseGrad.addColorStop(0, "#e4dcd0");
        baseGrad.addColorStop(0.3, "#f6f3eb");
        baseGrad.addColorStop(0.7, "#fcfbf8");
        baseGrad.addColorStop(1, "#eee6d9");
        ctx.fillStyle = baseGrad;
        ctx.fillRect(0, 150, width, height - 150);

        // İzometrik Elmas Izgara (Tüm Zemini 625px'e Kadar Eksiksiz Kaplar - 2:1 Oranı)
        const step = 46;
        ctx.lineWidth = 1;

        // Çapraz 1 (Sol-Üstten Sağ-Alta)
        ctx.strokeStyle = "rgba(185, 165, 140, 0.40)";
        for (let k = -width * 1.5; k <= width * 2; k += step) {
            ctx.beginPath();
            ctx.moveTo(k, 100);
            ctx.lineTo(k + 1400, 100 + 700);
            ctx.stroke();
        }

        // Çapraz 2 (Sağ-Üstten Sol-Alta)
        for (let k = -width * 1.5; k <= width * 2; k += step) {
            ctx.beginPath();
            ctx.moveTo(k, 100);
            ctx.lineTo(k - 1400, 100 + 700);
            ctx.stroke();
        }

        // Merkez Koridor Altın Yolu (Golden Chevron Inlay Runner)
        let centerGrad = ctx.createLinearGradient(410, 0, 590, 0);
        centerGrad.addColorStop(0, "rgba(212, 175, 55, 0.08)");
        centerGrad.addColorStop(0.5, "rgba(212, 175, 55, 0.22)");
        centerGrad.addColorStop(1, "rgba(212, 175, 55, 0.08)");
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.moveTo(490, 150);
        ctx.lineTo(510, 150);
        ctx.lineTo(620, height);
        ctx.lineTo(380, height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(212, 175, 55, 0.55)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(490, 150); ctx.lineTo(380, height);
        ctx.moveTo(510, 150); ctx.lineTo(620, height);
        ctx.stroke();

        // Duvar Dipleri Ambient Occlusion (Doğal Duvar Temas Gölgesi)
        let shadowL = ctx.createLinearGradient(0, 320, 180, 260);
        shadowL.addColorStop(0, "rgba(25, 20, 15, 0.45)");
        shadowL.addColorStop(1, "rgba(25, 20, 15, 0)");
        ctx.fillStyle = shadowL;
        ctx.beginPath();
        ctx.moveTo(0, 320);
        ctx.lineTo(500, 150);
        ctx.lineTo(500, 205);
        ctx.lineTo(0, 375);
        ctx.closePath();
        ctx.fill();

        let shadowR = ctx.createLinearGradient(1000, 320, 820, 260);
        shadowR.addColorStop(0, "rgba(25, 20, 15, 0.45)");
        shadowR.addColorStop(1, "rgba(25, 20, 15, 0)");
        ctx.fillStyle = shadowR;
        ctx.beginPath();
        ctx.moveTo(500, 150);
        ctx.lineTo(1000, 320);
        ctx.lineTo(1000, 375);
        ctx.lineTo(500, 205);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * Kat 2: Sanalika Klakk Tarzı Balıksırtı Ahşap Parke & Kraliyet Kırmızı Halısı
     */
    function drawIsometricParquetFloor(ctx, width, height) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 320);
        ctx.lineTo(500, 150);
        ctx.lineTo(1000, 320);
        ctx.lineTo(1000, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.clip();

        // Sıcak Meşe/Ceviz Parke
        let woodGrad = ctx.createLinearGradient(0, 150, 0, height);
        woodGrad.addColorStop(0, "#361b0c");
        woodGrad.addColorStop(0.5, "#572d13");
        woodGrad.addColorStop(1, "#3c1e0c");
        ctx.fillStyle = woodGrad;
        ctx.fillRect(0, 150, width, height - 150);

        // Balıksırtı Derzler
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.lineWidth = 1.2;
        for (let y = 150; y <= height; y += 22) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
        for (let x = -width; x <= width * 2; x += 44) {
            ctx.beginPath(); ctx.moveTo(x, 150); ctx.lineTo(x + 140, height); ctx.stroke();
        }

        // Merkez Kırmızı Kadife Halı Runner'ı
        ctx.fillStyle = "#881337";
        ctx.beginPath();
        ctx.moveTo(420, 180);
        ctx.lineTo(580, 180);
        ctx.lineTo(730, height);
        ctx.lineTo(270, height);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 2.5D Açılı Mimari Duvarlar (Tavandan Zemine Kesintisiz)
     */
    function drawIsometricWalls(ctx) {
        // Sol Açılı Duvar: (0, 320) -> (500, 150)
        let wallL = ctx.createLinearGradient(0, 320, 500, 150);
        wallL.addColorStop(0, "#d5c5a8");
        wallL.addColorStop(0.5, "#ece3cf");
        wallL.addColorStop(1, "#c5b394");
        ctx.fillStyle = wallL;

        ctx.beginPath();
        ctx.moveTo(0, 68);
        ctx.lineTo(500, 68);
        ctx.lineTo(500, 150);
        ctx.lineTo(0, 320);
        ctx.closePath();
        ctx.fill();

        // Sol Süpürgelik
        ctx.strokeStyle = "#c5a059";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(0, 320);
        ctx.lineTo(500, 150);
        ctx.stroke();

        // Sağ Açılı Duvar: (500, 150) -> (1000, 320)
        let wallR = ctx.createLinearGradient(500, 150, 1000, 320);
        wallR.addColorStop(0, "#c5b394");
        wallR.addColorStop(0.5, "#ece3cf");
        wallR.addColorStop(1, "#d5c5a8");
        ctx.fillStyle = wallR;

        ctx.beginPath();
        ctx.moveTo(500, 68);
        ctx.lineTo(1000, 68);
        ctx.lineTo(1000, 320);
        ctx.lineTo(500, 150);
        ctx.closePath();
        ctx.fill();

        // Sağ Süpürgelik
        ctx.strokeStyle = "#c5a059";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(500, 150);
        ctx.lineTo(1000, 320);
        ctx.stroke();

        // Merkez Kilit Taşı Sütunu (Keystone Pilaster)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(494, 65, 12, 88);
        ctx.strokeStyle = "#c5a059";
        ctx.lineWidth = 2;
        ctx.strokeRect(494, 65, 12, 88);
    }

    /**
     * 2.5D AÇILI MAĞAZA CEPHESİ (DUVARA TAM PARALEL PARALELKENAR)
     * Sol duvarda: slope = -0.34
     * Sağ duvarda: slope = +0.34
     */
    function drawAngledStoreFacade(ctx, x1, x2, wallSide, opt) {
        ctx.save();
        const slope = (wallSide === 'left') ? -0.34 : 0.34;
        const baseOffset = (wallSide === 'left') ? 320 : (150 - 500 * 0.34);

        let y1 = baseOffset + slope * x1 - 10;
        let y2 = baseOffset + slope * x2 - 10;
        let h = opt.h || 110;

        // 1. Ana Cephe Paneli (Açılı Paralelkenar)
        ctx.fillStyle = opt.bgColor || "#0f172a";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x2, y2 - h);
        ctx.lineTo(x1, y1 - h);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = opt.trimColor || "#d4af37";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 2. Parıldayan Neon Tabela Kutusu (Üstte Açılı Şerit)
        let marH = 26;
        let my1 = y1 - h + 6;
        let my2 = y2 - h + 6;
        ctx.fillStyle = "#020617";
        ctx.beginPath();
        ctx.moveTo(x1 + 6, my1);
        ctx.lineTo(x2 - 6, my2);
        ctx.lineTo(x2 - 6, my2 + marH);
        ctx.lineTo(x1 + 6, my1 + marH);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = opt.trimColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tabela Metni (Açılı Dönüşüm ile Duvara Yapışık)
        ctx.save();
        let midX = (x1 + x2) / 2;
        let midY = (my1 + my2) / 2 + 18;
        let rot = Math.atan(slope);
        ctx.translate(midX, midY);
        ctx.rotate(rot);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(opt.title, 0, 0);
        ctx.restore();

        // 3. Açılı Cam Vitrin (Display Showcase)
        let vx1 = x1 + 10, vx2 = x2 - 10;
        let vy1 = y1 - 8, vy2 = y2 - 8;
        let vh = h - 48;

        ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
        ctx.beginPath();
        ctx.moveTo(vx1, vy1);
        ctx.lineTo(vx2, vy2);
        ctx.lineTo(vx2, vy2 - vh);
        ctx.lineTo(vx1, vy1 - vh);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Vitrin İçi Spot Parıltısı
        let vmidX = (vx1 + vx2) / 2;
        let vmidY = (vy1 + vy2) / 2 - vh / 2;
        let spotGrad = ctx.createRadialGradient(vmidX, vmidY - 10, 2, vmidX, vmidY, (vx2 - vx1) / 2);
        spotGrad.addColorStop(0, opt.spotColor || "rgba(255, 255, 255, 0.35)");
        spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = spotGrad;
        ctx.fill();

        // Vitrin İçi Manken / İkon
        ctx.save();
        ctx.translate(vmidX, vmidY + 12);
        ctx.rotate(rot);
        ctx.font = "24px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(opt.icon || "👗", 0, 0);
        ctx.restore();

        // Cam Yansıma Çizgisi
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vx1 + 15, vy1 - 10);
        ctx.lineTo(vx2 - 15, vy2 - vh + 10);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * STATİK KAT 1 ÇİZİMİ (bgCache İle Önbelleklenir)
     * Mobilyalar Y-Sorting ile dinamik çizilir, arka plan mimarisi ve cepheler burada çizilir.
     */
    function renderStaticAvmKat1To(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. Tavan ve Cam Kubbe
        drawAtriumSkyAndCeiling(bctx, width, height);

        // 2. 2.5D İzometrik Elmas Mermer Zemin
        drawIsometricMarbleFloor(bctx, width, height);

        // 3. 2.5D Açılı Mimari Duvarlar
        drawIsometricWalls(bctx);

        // 4. KAT 1 AÇILI BUTİK CEPHELERİ (Paralelkenar Perspektifi)
        // 4.1 Cadde Moda Butiği (Sol Açılı Duvar: x: 40..220)
        drawAngledStoreFacade(bctx, 40, 220, 'left', {
            title: "👗 CADDE MODA",
            trimColor: "#ec4899",
            spotColor: "rgba(244, 114, 182, 0.45)",
            icon: "👗",
            bgColor: "#1e1b4b",
            h: 110
        });

        // 4.2 Headwear Co. Şapkacı (Sol Açılı Duvar: x: 250..430)
        drawAngledStoreFacade(bctx, 250, 430, 'left', {
            title: "🧢 HEADWEAR CO.",
            trimColor: "#eab308",
            spotColor: "rgba(250, 204, 21, 0.45)",
            icon: "🧢",
            bgColor: "#291d0e",
            h: 95
        });

        // 4.3 Optik Gözlük Butiği (Sağ Açılı Duvar: x: 570..750)
        drawAngledStoreFacade(bctx, 570, 750, 'right', {
            title: "🕶️ OPTİK",
            trimColor: "#38bdf8",
            spotColor: "rgba(56, 189, 248, 0.55)",
            icon: "🕶️",
            bgColor: "#042f2e",
            h: 95
        });

        // 4.4 Sneaker Lab Dünyası (Sağ Açılı Duvar: x: 770..950)
        drawAngledStoreFacade(bctx, 770, 950, 'right', {
            title: "👞 SNEAKER LAB",
            trimColor: "#0ea5e9",
            spotColor: "rgba(56, 189, 248, 0.45)",
            icon: "👟",
            bgColor: "#082f49",
            h: 110
        });

        // 5. Güney Çıkış Kapıları (Sahil Yolu'na Açılan Fotoselli Cam Kapı)
        let exitW = 180, exitH = 26;
        let exitX = (width - exitW) / 2;
        let exitY = height - exitH;

        bctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.fillStyle = "#22c55e";
        bctx.fillRect(exitX, exitY, exitW, 3);

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 11px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🌴 SAHİL YOLU & KORDON ÇIKIŞI ⬇", width / 2, height - 8);

        // Çıkış Halısı
        bctx.fillStyle = "#1e293b";
        bctx.beginPath();
        bctx.roundRect(exitX + 20, height - 52, exitW - 40, 22, 6);
        bctx.fill();
        bctx.strokeStyle = "#22c55e";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        bctx.fillStyle = "#4ade80";
        bctx.font = "bold 9px sans-serif";
        bctx.fillText("KORDON ÇIKIŞI", width / 2, height - 38);
    }

    /**
     * STATİK KAT 2 ÇİZİMİ (bgCache İle Önbelleklenir)
     * Atrium Boşluğu ve Alt Kat Görüntüsü
     */
    function renderStaticAvmKat2To(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. Tavan ve Cam Kubbe
        drawAtriumSkyAndCeiling(bctx, width, height);

        // 2. Balıksırtı Ahşap Parke & Kırmızı Halı
        drawIsometricParquetFloor(bctx, width, height);

        // 3. 2.5D Açılı Mimari Duvarlar
        drawIsometricWalls(bctx);

        // 4. MERKEZ ATRIUM AÇIKLIĞI (ZEMİN KATI GÖREN BÜYÜK ELİPTİK VOID)
        let atX = 500, atY = 390, atRx = 175, atRy = 78;

        // Atrium Boşluğu İçindeki Zemin Kat Görüntüsü
        bctx.save();
        bctx.beginPath();
        bctx.ellipse(atX, atY, atRx, atRy, 0, 0, Math.PI * 2);
        bctx.clip();

        // Aşağıdaki zemin kat mermeri
        bctx.fillStyle = "#e2e8f0";
        bctx.fillRect(atX - atRx, atY - atRy, atRx * 2, atRy * 2);

        // Aşağıdaki mermer derzler
        bctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
        bctx.lineWidth = 1;
        for (let x = atX - atRx; x <= atX + atRx; x += 30) {
            bctx.beginPath(); bctx.moveTo(x, atY - atRy); bctx.lineTo(x, atY + atRy); bctx.stroke();
        }

        // Aşağıdaki fıskiye minyatür görüntüsü & su ışıltısı
        bctx.fillStyle = "rgba(56, 189, 248, 0.35)";
        bctx.beginPath();
        bctx.ellipse(atX, atY, 60, 24, 0, 0, Math.PI * 2);
        bctx.fill();

        bctx.fillStyle = "rgba(255, 255, 255, 0.6)";
        bctx.beginPath();
        bctx.arc(atX, atY, 8, 0, Math.PI * 2);
        bctx.fill();

        // Derinlik gölgesi (Slab edge thickness shadow)
        let voidEdgeGrad = ctxRadialEdge(bctx, atX, atY, atRx, atRy);
        bctx.fillStyle = voidEdgeGrad;
        bctx.fill();

        bctx.restore();

        // 5. KAT 2 VIP AÇILI BUTİK CEPHELERİ
        // 5.1 Sartoria Milano (Sol: x: 40..220)
        drawAngledStoreFacade(bctx, 40, 220, 'left', {
            title: "🤵 SARTORIA MILANO",
            trimColor: "#a855f7",
            spotColor: "rgba(192, 132, 252, 0.45)",
            icon: "🤵",
            bgColor: "#3b0764",
            h: 110
        });

        // 5.2 Chronos VIP Saatçi (Arka-Sol: x: 250..430)
        drawAngledStoreFacade(bctx, 250, 430, 'left', {
            title: "⌚ CHRONOS VIP SAAT",
            trimColor: "#38bdf8",
            spotColor: "rgba(56, 189, 248, 0.45)",
            icon: "⌚",
            bgColor: "#0c4a6e",
            h: 95
        });

        // 5.3 Salon De Paris VIP Berber (Sağ: x: 770..950)
        drawAngledStoreFacade(bctx, 770, 950, 'right', {
            title: "💈 SALON DE PARIS",
            trimColor: "#ef4444",
            spotColor: "rgba(248, 113, 113, 0.45)",
            icon: "💈",
            bgColor: "#450a0a",
            h: 110
        });
    }

    function ctxRadialEdge(ctx, cx, cy, rx, ry) {
        let g = ctx.createRadialGradient(cx, cy, rx * 0.7, cx, cy, rx);
        g.addColorStop(0, "rgba(0, 0, 0, 0)");
        g.addColorStop(0.85, "rgba(0, 0, 0, 0.35)");
        g.addColorStop(1, "rgba(0, 0, 0, 0.75)");
        return g;
    }

    // =========================================================================
    // 2. 3D KATI MODELLER (SOLID MODELS) & ÇİFT KATMANLI KONTAK GÖLGELERİ
    // =========================================================================

    /**
     * Çift Katmanlı Yere Mıhlama Kontak Gölgesi Yardımcısı
     */
    function drawDualContactShadow(ctx, cx, cyBase, radiusX, radiusY) {
        // 1. Zemin Yaygın Yumuşak Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase, radiusX + 5, radiusY + 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Yere Mıhlama Masif Kontak Gölgesi (Derinlik Çizgisi)
        ctx.fillStyle = "rgba(0, 0, 0, 0.82)";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase, Math.max(2, radiusX - 3), Math.max(2, radiusY - 2), 0, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * 3D Yivli Mermer Corinthian Sütun (Tavana ve Zemine Tam Oturan Katı Kütle)
     * Taban Merkezi: (x, botY)
     */
    function draw3DCorinthianColumn(ctx, x, topY, botY) {
        ctx.save();
        const colW = 22;

        // Çift Katmanlı Kontak Gölgesi
        drawDualContactShadow(ctx, x, botY, 16, 7);

        // Altın/Mermer Basamaklı Kaide (Plinth)
        ctx.fillStyle = "#c5a059";
        ctx.fillRect(x - colW / 2 - 5, botY - 11, colW + 10, 11);
        ctx.strokeStyle = "#854d0e";
        ctx.lineWidth = 1;
        ctx.strokeRect(x - colW / 2 - 5, botY - 11, colW + 10, 11);

        // Yivli Mermer Gövde (3D Silindirik Gradient: Sol aydınlık, merkez nötr, sağ gölgeli)
        let colGrad = ctx.createLinearGradient(x - colW / 2, 0, x + colW / 2, 0);
        colGrad.addColorStop(0, "#f8fafc");
        colGrad.addColorStop(0.25, "#ffffff");
        colGrad.addColorStop(0.7, "#cbd5e1");
        colGrad.addColorStop(1, "#475569");
        ctx.fillStyle = colGrad;
        ctx.fillRect(x - colW / 2, topY, colW, botY - topY - 11);

        // Yiv Çizgileri
        ctx.strokeStyle = "rgba(100, 116, 139, 0.50)";
        ctx.lineWidth = 1;
        for (let i = -7; i <= 7; i += 3.5) {
            ctx.beginPath();
            ctx.moveTo(x + i, topY);
            ctx.lineTo(x + i, botY - 11);
            ctx.stroke();
        }

        // Üst Altın Başlık (Capital)
        ctx.fillStyle = "#c5a059";
        ctx.fillRect(x - colW / 2 - 6, topY, colW + 12, 11);
        ctx.strokeStyle = "#fef08a";
        ctx.strokeRect(x - colW / 2 - 6, topY, colW + 12, 11);

        ctx.restore();
    }

    /**
     * 3D Yürüyen Merdiven (Escalator with 3D Truss & Handrails)
     */
    function draw3DEscalator(ctx, x, y, w, h) {
        ctx.save();

        // Zemin Kontak Gölgesi
        drawDualContactShadow(ctx, x + w / 2, y + h + 8, w / 2 + 10, 10);

        // Gövde Çelik Karkas
        let escGrad = ctx.createLinearGradient(x, y + h, x + w, y);
        escGrad.addColorStop(0, "#1e293b");
        escGrad.addColorStop(0.5, "#334155");
        escGrad.addColorStop(1, "#475569");
        ctx.fillStyle = escGrad;

        ctx.beginPath();
        ctx.moveTo(x, y + h);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x + w + 26, y + 10);
        ctx.lineTo(x + 26, y + h + 10);
        ctx.closePath();
        ctx.fill();

        // Cam Yan Korkuluk
        ctx.fillStyle = "rgba(56, 189, 248, 0.28)";
        ctx.beginPath();
        ctx.moveTo(x, y + h - 20);
        ctx.lineTo(x + w, y - 20);
        ctx.lineTo(x + w, y);
        ctx.lineTo(x, y + h);
        ctx.closePath();
        ctx.fill();

        // Altın/Sarı Küpeşte
        ctx.strokeStyle = "#eab308";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x, y + h - 20);
        ctx.lineTo(x + w, y - 20);
        ctx.stroke();

        // Basamaklar
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        for (let i = 0; i <= 7; i++) {
            let t = i / 7;
            let bx = x + t * w;
            let by = (y + h) - t * h;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + 20, by + 6);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * 3D Silindirik Panoramik Cam Asansör (Glass Capsule Elevator)
     */
    function draw3DGlassElevator(ctx, x, y, floorNum) {
        ctx.save();

        // Taban Kontak Gölgesi
        drawDualContactShadow(ctx, x, y + 68, 38, 14);

        // Dış Şaft Silindiri
        let shaftGrad = ctx.createLinearGradient(x - 38, 0, x + 38, 0);
        shaftGrad.addColorStop(0, "#090d16");
        shaftGrad.addColorStop(0.3, "#334155");
        shaftGrad.addColorStop(0.7, "#1e293b");
        shaftGrad.addColorStop(1, "#090d16");
        ctx.fillStyle = shaftGrad;

        ctx.beginPath();
        ctx.roundRect(x - 36, y - 70, 72, 140, 16);
        ctx.fill();

        ctx.strokeStyle = "#d4af37";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Cam Kabin
        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.fillRect(x - 28, y - 55, 56, 110);

        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y - 55); ctx.lineTo(x, y + 55);
        ctx.stroke();

        // Kat Göstergesi
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.roundRect(x - 22, y - 62, 44, 20, 4);
        ctx.fill();
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#22c55e";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(floorNum === 1 ? "[ 1 ▲ ]" : "[ 2 ▼ ]", x, y - 48);

        ctx.restore();
    }

    /**
     * 3D Kentia Palmiyesi (Mermer Saksıda İç Mekan Bitkisi)
     */
    function drawKentiaPalm(ctx, x, yBase) {
        ctx.save();

        // Taban Kontak Gölgesi
        drawDualContactShadow(ctx, x, yBase, 18, 8);

        // Mermer Saksı Gövdesi
        let urnGrad = ctx.createLinearGradient(x - 14, 0, x + 14, 0);
        urnGrad.addColorStop(0, "#f8fafc");
        urnGrad.addColorStop(0.4, "#ffffff");
        urnGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = urnGrad;

        ctx.beginPath();
        ctx.moveTo(x - 14, yBase - 26);
        ctx.lineTo(x + 14, yBase - 26);
        ctx.lineTo(x + 10, yBase);
        ctx.lineTo(x - 10, yBase);
        ctx.closePath();
        ctx.fill();

        // Altın Çember Şerit
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(x - 13, yBase - 15, 26, 4);

        // Kavisli Palmiye Dalları
        ctx.strokeStyle = "#15803d";
        ctx.lineWidth = 2.5;
        const leaves = [
            { ex: x - 30, ey: yBase - 52 },
            { ex: x - 16, ey: yBase - 64 },
            { ex: x, ey: yBase - 68 },
            { ex: x + 16, ey: yBase - 64 },
            { ex: x + 30, ey: yBase - 52 }
        ];
        leaves.forEach(l => {
            ctx.beginPath();
            ctx.moveTo(x, yBase - 26);
            ctx.quadraticCurveTo(x + (l.ex - x) * 0.4, yBase - 54, l.ex, l.ey);
            ctx.stroke();

            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.ellipse(l.ex, l.ey, 4.5, 9, 0.4, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    /**
     * 3D Katmanlı Kristal Mermer Fıskiye (Grand Tiered Fountain)
     * Taban Merkezi: (cx, cyBase) = (500, 370)
     */
    function drawGrandTieredFountain(ctx, cx, cyBase, now) {
        ctx.save();
        now = now || Date.now();

        // 1. Çift Katmanlı Yere Mıhlama Kontak Gölgesi (154x62)
        drawDualContactShadow(ctx, cx, cyBase, 76, 36);

        // 2. Mermer Dış Havuz Gövdesi (136x54)
        let basinGrad = ctx.createLinearGradient(cx - 70, 0, cx + 70, 0);
        basinGrad.addColorStop(0, "#cbd5e1");
        basinGrad.addColorStop(0.3, "#ffffff");
        basinGrad.addColorStop(0.7, "#cbd5e1");
        basinGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = basinGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cyBase, 70, 32, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#c5a059";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // 3. İç Turkuaz Su Yüzeyi (116x44)
        let waterGrad = ctx.createRadialGradient(cx, cyBase, 5, cx, cyBase, 60);
        waterGrad.addColorStop(0, "#38bdf8");
        waterGrad.addColorStop(0.6, "#0284c7");
        waterGrad.addColorStop(1, "#0369a1");
        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cyBase, 58, 25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Su Dalgalanma Halkaları
        for (let i = 0; i < 3; i++) {
            let r = ((now / 25 + i * 20) % 55);
            let alpha = Math.max(0, 1 - r / 55) * 0.45;
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.ellipse(cx, cyBase, r, r * 0.42, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 4. Orta Mermer Kaide & İkinci Çanak
        // Kaide Ayak
        ctx.fillStyle = "#c5a059";
        ctx.fillRect(cx - 7, cyBase - 24, 14, 20);

        // Orta Çanak (52x19)
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase - 24, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#c5a059";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Orta Çanak İçi Su
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase - 24, 22, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Taşan İnce Su Tülleri (Cascading Veils)
        ctx.strokeStyle = "rgba(224, 242, 254, 0.65)";
        ctx.lineWidth = 1.5;
        const veilPoints = [-20, -10, 0, 10, 20];
        veilPoints.forEach(vx => {
            ctx.beginPath();
            ctx.moveTo(cx + vx, cyBase - 24);
            ctx.quadraticCurveTo(cx + vx * 1.3, cyBase - 12, cx + vx * 1.5, cyBase + 6);
            ctx.stroke();
        });

        // 5. Üst Altın Fıskiye Lülesi
        ctx.fillStyle = "#eab308";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase - 38, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Püsküren Su Damlacıkları
        for (let j = 0; j < 14; j++) {
            let angle = (j / 14) * Math.PI * 2 + (now / 1400);
            let sprayDist = Math.sin(now / 180 + j) * 8 + 18;
            let sx = cx + Math.cos(angle) * sprayDist;
            let sy = (cyBase - 38) + Math.sin(angle) * sprayDist * 0.42;

            ctx.fillStyle = "rgba(224, 242, 254, 0.9)";
            ctx.beginPath();
            ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * 3D Masif Dairesel Kapitone Deri Puf (Circular Leather Ottoman)
     * Taban Merkezi: (cx, cyBase)
     */
    function drawCircularOttoman(ctx, cx, cyBase) {
        ctx.save();

        // Çift Katmanlı Yere Mıhlama Kontak Gölgesi
        drawDualContactShadow(ctx, cx, cyBase, 22, 11);

        // Alt Pirinç Plinth Kaidesi
        ctx.fillStyle = "#c5a059";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase, 19, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Silindirik Deri Gövde (Cognac Deri)
        let leatherH = 14;
        let bodyGrad = ctx.createLinearGradient(cx - 19, 0, cx + 19, 0);
        bodyGrad.addColorStop(0, "#451a03");
        bodyGrad.addColorStop(0.35, "#78350f");
        bodyGrad.addColorStop(0.7, "#92400e");
        bodyGrad.addColorStop(1, "#451a03");
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.moveTo(cx - 19, cyBase);
        ctx.lineTo(cx + 19, cyBase);
        ctx.lineTo(cx + 19, cyBase - leatherH);
        ctx.lineTo(cx - 19, cyBase - leatherH);
        ctx.closePath();
        ctx.fill();

        // Üst Deri Minder Yüzeyi
        let topGrad = ctx.createRadialGradient(cx, cyBase - leatherH, 2, cx, cyBase - leatherH, 19);
        topGrad.addColorStop(0, "#b45309");
        topGrad.addColorStop(0.6, "#78350f");
        topGrad.addColorStop(1, "#451a03");
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cyBase - leatherH, 19, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Kapitone Düğme ve Dikiş Çizgileri
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(cx, cyBase - leatherH, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * 3D Dokunmatik Bilgilendirme Kiosku (Directory Kiosk)
     * Taban Merkezi: (cx, cyBase) = (500, 525)
     */
    function drawDirectoryKiosk(ctx, cx, cyBase, now) {
        ctx.save();
        now = now || Date.now();

        // Çift Katmanlı Kontak Gölgesi
        drawDualContactShadow(ctx, cx, cyBase, 16, 8);

        // Çelik Taban Plakası
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Dikey Ayak
        ctx.fillStyle = "#334155";
        ctx.fillRect(cx - 4, cyBase - 26, 8, 24);

        // Dokunmatik Ekran Gövdesi (Açılı Cam Panel)
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.roundRect(cx - 16, cyBase - 52, 32, 26, 4);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ekran İkonu
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ℹ️", cx, cyBase - 35);

        ctx.restore();
    }

    /**
     * Kat 2: 3D Mezzanine Balustrade (Arka ve Ön Korkuluk Parçaları)
     * Atrium Void Merkezi: (500, 390), rx: 175, ry: 78
     */
    function drawMezzanineBalustrade(ctx, cx, cy, rx, ry, side) {
        ctx.save();
        // side: 'back' (Kuzey yarım yay: y <= cy) veya 'front' (Güney yarım yay: y >= cy)
        let startAngle = (side === 'back') ? Math.PI : 0;
        let endAngle = (side === 'back') ? (Math.PI * 2) : Math.PI;

        // Dikmeler (Baluster Posts)
        const step = Math.PI / 12;
        for (let a = startAngle; a <= endAngle; a += step) {
            let px = cx + Math.cos(a) * rx;
            let py = cy + Math.sin(a) * ry;

            ctx.strokeStyle = "#d4af37";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py - 18);
            ctx.stroke();
        }

        // Cam Panel Şeridi
        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 9, rx, ry, 0, startAngle, endAngle);
        ctx.stroke();

        // Üst Pirinç El Küpeştesi (Handrail)
        ctx.strokeStyle = "#fef08a";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 18, rx, ry, 0, startAngle, endAngle);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Kat 2: 3D VIP Chesterfield Deri Kanepe
     * Taban Merkezi: (cx, cyBase)
     */
    function drawChesterfieldSofa(ctx, cx, cyBase) {
        ctx.save();

        // Çift Katmanlı Kontak Gölgesi
        drawDualContactShadow(ctx, cx, cyBase, 32, 14);

        // Masif Ahşap Baza
        ctx.fillStyle = "#1e1b4b";
        ctx.fillRect(cx - 28, cyBase - 18, 56, 18);

        // Oxblood / Bordo Chesterfield Deri Gövde
        let sofaGrad = ctx.createLinearGradient(cx - 28, 0, cx + 28, 0);
        sofaGrad.addColorStop(0, "#4c0519");
        sofaGrad.addColorStop(0.5, "#881337");
        sofaGrad.addColorStop(1, "#4c0519");
        ctx.fillStyle = sofaGrad;

        // Sırtlık ve Kolçaklar
        ctx.beginPath();
        ctx.roundRect(cx - 28, cyBase - 36, 56, 26, 6);
        ctx.fill();
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Deri Oturma Minderi
        ctx.fillStyle = "#9f1239";
        ctx.beginPath();
        ctx.ellipse(cx, cyBase - 10, 24, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pirinç Döşeme Çivileri
        ctx.fillStyle = "#fbbf24";
        for (let i = -20; i <= 20; i += 10) {
            ctx.beginPath();
            ctx.arc(cx + i, cyBase - 28, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Kat 2: Chronos VIP Saat Standı
     * Taban Merkezi: (cx, cyBase) = (340, 220)
     */
    function drawChronosDisplayTower(ctx, cx, cyBase, now) {
        ctx.save();
        now = now || Date.now();

        // Çift Katmanlı Kontak Gölgesi
        drawDualContactShadow(ctx, cx, cyBase, 16, 8);

        // Pirinç Kaide
        ctx.fillStyle = "#d4af37";
        ctx.fillRect(cx - 10, cyBase - 16, 20, 16);

        // Cam Vitrin Fanusu
        ctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        ctx.beginPath();
        ctx.roundRect(cx - 12, cyBase - 42, 24, 26, 4);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dönen Astral Saat Mekanizması
        let angle = now / 600;
        ctx.save();
        ctx.translate(cx, cyBase - 29);
        ctx.rotate(angle);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();

        ctx.restore();
    }

    /**
     * Kat 2: Dönen Klasik Kuaför Direği (Barber Pole Stand)
     * Taban Merkezi: (cx, cyBase) = (760, 220)
     */
    function drawBarberPoleStand(ctx, cx, cyBase, now) {
        ctx.save();
        now = now || Date.now();

        // Çift Katmanlı Kontak Gölgesi
        drawDualContactShadow(ctx, cx, cyBase, 14, 7);

        // Alt ve Üst Pirinç Toplar
        ctx.fillStyle = "#d4af37";
        ctx.beginPath();
        ctx.arc(cx, cyBase - 42, 5, 0, Math.PI * 2);
        ctx.arc(cx, cyBase - 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // Cam Silindir Gövde
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(cx - 5, cyBase - 40, 10, 38);

        let offset = (now / 35) % 18;
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - 5, cyBase - 40, 10, 38);
        ctx.clip();

        for (let i = -20; i < 50; i += 12) {
            let py = (cyBase - 40) + i - offset;
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(cx - 5, py, 10, 5);
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(cx - 5, py + 5, 10, 5);
        }
        ctx.restore();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.strokeRect(cx - 5, cyBase - 40, 10, 38);
        ctx.restore();
    }

    // =========================================================================
    // 3. ZERO-GC SIFIR KIRPILMALI Y-SORTING DERİNLİK MOTORU
    // (Center-Equator Y-Sorting Engine: sortY = yBase)
    // =========================================================================

    // Kat 1 Statik Mobilyaları Havuzu (Önceden Tahsis Edilmiş)
    const _avmKat1StaticFurniture = [
        // Sütunlar (sortY: botY)
        { type: 'col_1', sortY: 240, draw: (c) => draw3DCorinthianColumn(c, 235, 75, 240) },
        { type: 'col_2', sortY: 172, draw: (c) => draw3DCorinthianColumn(c, 440, 75, 172) },
        { type: 'col_3', sortY: 172, draw: (c) => draw3DCorinthianColumn(c, 560, 75, 172) },
        { type: 'col_4', sortY: 240, draw: (c) => draw3DCorinthianColumn(c, 765, 75, 240) },

        // Yürüyen Merdiven (sortY: 175)
        { type: 'escalator', sortY: 175, draw: (c) => draw3DEscalator(c, ESCALATOR_POS.x, ESCALATOR_POS.y, ESCALATOR_POS.w, ESCALATOR_POS.h) },

        // Asansör (sortY: 340)
        { type: 'elevator', sortY: 340, draw: (c) => draw3DGlassElevator(c, ELEVATOR_POS.x, ELEVATOR_POS.y, 1) },

        // Palmiyeler (sortY: 380)
        { type: 'palm_l', sortY: 380, draw: (c) => drawKentiaPalm(c, 35, 380) },
        { type: 'palm_r', sortY: 380, draw: (c) => drawKentiaPalm(c, 965, 380) },

        // 4 Adet Dairesel Deri Puf (Fıskiye Çevresi)
        { type: 'ottoman_north', sortY: 275, draw: (c) => drawCircularOttoman(c, 500, 275) },
        { type: 'ottoman_west',  sortY: 365, draw: (c) => drawCircularOttoman(c, 370, 365) },
        { type: 'ottoman_east',  sortY: 365, draw: (c) => drawCircularOttoman(c, 630, 365) },
        { type: 'ottoman_south', sortY: 465, draw: (c) => drawCircularOttoman(c, 500, 465) },

        // Büyük Katmanlı Mermer Fıskiye (sortY: 370)
        { type: 'fountain', sortY: 370, draw: (c, t) => drawGrandTieredFountain(c, 500, 370, t) },

        // Dokunmatik Bilgilendirme Kiosku (sortY: 525)
        { type: 'kiosk', sortY: 525, draw: (c, t) => drawDirectoryKiosk(c, KIOSK_POS.x, KIOSK_POS.yBase, t) }
    ];

    // Kat 2 Statik Mobilyaları Havuzu (Önceden Tahsis Edilmiş)
    const _avmKat2StaticFurniture = [
        // Sütunlar (Kat 2)
        { type: 'col_1', sortY: 240, draw: (c) => draw3DCorinthianColumn(c, 235, 75, 240) },
        { type: 'col_2', sortY: 172, draw: (c) => draw3DCorinthianColumn(c, 440, 75, 172) },
        { type: 'col_3', sortY: 172, draw: (c) => draw3DCorinthianColumn(c, 560, 75, 172) },
        { type: 'col_4', sortY: 240, draw: (c) => draw3DCorinthianColumn(c, 765, 75, 240) },

        // Yürüyen Merdiven İniş
        { type: 'escalator', sortY: 175, draw: (c) => draw3DEscalator(c, ESCALATOR_POS.x, ESCALATOR_POS.y, ESCALATOR_POS.w, ESCALATOR_POS.h) },

        // Asansör (Kat 2)
        { type: 'elevator', sortY: 340, draw: (c) => draw3DGlassElevator(c, ELEVATOR_POS.x, ELEVATOR_POS.y, 2) },

        // Palmiyeler
        { type: 'palm_l', sortY: 380, draw: (c) => drawKentiaPalm(c, 35, 380) },
        { type: 'palm_r', sortY: 380, draw: (c) => drawKentiaPalm(c, 965, 380) },

        // Chronos Saat Standı & Berber Direği
        { type: 'chronos_stand', sortY: 220, draw: (c, t) => drawChronosDisplayTower(c, 340, 220, t) },
        { type: 'barber_stand',  sortY: 220, draw: (c, t) => drawBarberPoleStand(c, 760, 220, t) },

        // Mezzanine Korkuluğu (Kuzey Yarım Yay: sortY: 312 - Oyuncu arkasındayken derinlik kusursuz)
        { type: 'mezzanine_back', sortY: 312, draw: (c) => drawMezzanineBalustrade(c, 500, 390, 175, 78, 'back') },

        // Mezzanine Korkuluğu (Güney Yarım Yay: sortY: 468 - Oyuncu balkondan aşağı bakarken korkuluk bacaklarını kapatır)
        { type: 'mezzanine_front', sortY: 468, draw: (c) => drawMezzanineBalustrade(c, 500, 390, 175, 78, 'front') },

        // VIP Chesterfield Deri Kanepeler
        { type: 'sofa_west', sortY: 425, draw: (c) => drawChesterfieldSofa(c, 240, 425) },
        { type: 'sofa_east', sortY: 425, draw: (c) => drawChesterfieldSofa(c, 760, 425) }
    ];

    const _avmSortQueue = [];
    const _avmPlayerSlots = [];

    /**
     * OYUNCULAR VE MOBİLYALAR İÇİN MERKEZ-EKVATOR DERİNLİK SIRALAMA MOTORU
     * main.js:3020'den doğrudan çağrılır.
     */
    function drawAvmMallForegroundAndPlayers(ctx, now, playerSortPool, floor) {
        if (!ctx) return;
        now = now || Date.now();
        floor = floor || 'avm_kat1';

        _avmSortQueue.length = 0;

        // 1. Odaya Özgü Statik Mobilyaları Ekle (Sıfır Tahsis)
        const furnitureList = (floor === 'avm_kat2') ? _avmKat2StaticFurniture : _avmKat1StaticFurniture;
        for (let i = 0; i < furnitureList.length; i++) {
            _avmSortQueue.push(furnitureList[i]);
        }

        // 2. Oyuncuları Ekle (sortY: p.y + 21, oturuyorsa sortY - 6)
        let slotIdx = 0;
        let pool = (playerSortPool && Array.isArray(playerSortPool) && playerSortPool.length > 0) ? playerSortPool : null;
        if (pool) {
            for (let i = 0; i < pool.length; i++) {
                let item = pool[i];
                if (!item || !item.p) continue;
                let playerBaseY = item.y !== undefined ? item.y : item.p.y;
                let sortY = playerBaseY + 21;
                if (item.p.action === 'sitting' || item.p.isSitting) sortY -= 6;

                let slot = _avmPlayerSlots[slotIdx];
                if (!slot) {
                    slot = {
                        type: 'player',
                        sortY: 0,
                        p: null,
                        id: null,
                        draw: function (c) {
                            let drawFn = (typeof drawAnimatedPlayer === 'function')
                                ? drawAnimatedPlayer
                                : (window.drawAnimatedPlayer || null);
                            if (drawFn && this.p) drawFn(this.p, this.id);
                        }
                    };
                    _avmPlayerSlots[slotIdx] = slot;
                }
                slot.sortY = sortY;
                slot.p = item.p;
                slot.id = item.id;
                _avmSortQueue.push(slot);
                slotIdx++;
            }
        } else if (typeof window.players !== 'undefined') {
            for (let id in window.players) {
                let p = window.players[id];
                if (!p) continue;
                let sortY = p.y + 21;
                if (p.action === 'sitting' || p.isSitting) sortY -= 6;

                let slot = _avmPlayerSlots[slotIdx];
                if (!slot) {
                    slot = {
                        type: 'player',
                        sortY: 0,
                        p: null,
                        id: null,
                        draw: function (c) {
                            let drawFn = (typeof drawAnimatedPlayer === 'function')
                                ? drawAnimatedPlayer
                                : (window.drawAnimatedPlayer || null);
                            if (drawFn && this.p) drawFn(this.p, this.id);
                        }
                    };
                    _avmPlayerSlots[slotIdx] = slot;
                }
                slot.sortY = sortY;
                slot.p = p;
                slot.id = id;
                _avmSortQueue.push(slot);
                slotIdx++;
            }
        }

        // 3. Sıralama: Küçükten Büyüğe (Zemin Ekvatoruna Göre)
        _avmSortQueue.sort((a, b) => a.sortY - b.sortY);

        // 4. Çizim: Derinliğe Göre Sırayla Render
        for (let i = 0; i < _avmSortQueue.length; i++) {
            _avmSortQueue[i].draw(ctx, now);
        }

        // 5. En Ön Katman: UI Rozetleri & Etkileşim İpuçları
        const myP = (typeof myId !== 'undefined' && typeof players !== 'undefined') ? players[myId] : null;
        if (floor === 'avm_kat1') {
            drawDirectoryKioskPrompt(ctx, KIOSK_POS.x, KIOSK_POS.yBase, now, myP);
        }
        drawStoreDoors(ctx, floor, now, myP);
        drawElevatorPrompt(ctx, ELEVATOR_POS.doorX, ELEVATOR_POS.doorY, floor, now, myP);
        drawEscalatorPrompt(ctx, ESCALATOR_POS.doorX, ESCALATOR_POS.doorY, floor, now, myP);
    }

    /**
     * Kat Ortak Dinamik Çizim Motoru (Arka Plan ve Zemin Efektleri)
     * main.js:2621'den çağrılır (Oyuncular öncesi arka plan).
     */
    function drawAvmMallEnvironment(floor) {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Önbellekteki Statik Kat Arka Planını Çiz
        if (typeof bgCache !== 'undefined' && bgCache.getCanvas) {
            let bg = bgCache.getCanvas(floor, canvas.width, canvas.height);
            ctx.drawImage(bg, 0, 0);
        }

        const now = Date.now();
        if (floor === 'avm_kat2') {
            // Kristal Avizeler
            drawChandeliers(ctx, now);
        }
    }

    /**
     * Kiosk Etkileşim Rozeti
     */
    function drawDirectoryKioskPrompt(ctx, x, yBase, now, myP) {
        let dist = myP ? Math.hypot(myP.x - x, myP.y - yBase) : 999;
        let isNear = dist <= 65;
        if (!isNear) return;

        let pulse = Math.sin(now / 250) * 2;
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.beginPath();
        ctx.roundRect(x - 85, yBase - 82 + pulse, 170, 26, 6);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ℹ️ DİJİTAL AVM REHBERİ", x, yBase - 68 + pulse);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "9px sans-serif";
        ctx.fillText("[Tıkla]", x, yBase - 58 + pulse);
        ctx.restore();
    }

    /**
     * Kristal Avizeler ve Işık Konileri
     */
    function drawChandeliers(ctx, now) {
        const chandeliers = [{ x: 340, y: 140 }, { x: 660, y: 140 }];
        chandeliers.forEach(ch => {
            ctx.save();
            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(ch.x, 70);
            ctx.lineTo(ch.x, ch.y);
            ctx.stroke();

            let swing = Math.sin(now / 800 + ch.x) * 2;
            let cx = ch.x + swing;
            ctx.fillStyle = "#facc15";
            ctx.beginPath();
            ctx.ellipse(cx, ch.y, 14, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            for (let k = -10; k <= 10; k += 5) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.beginPath();
                ctx.moveTo(cx + k, ch.y);
                ctx.lineTo(cx + k + 1, ch.y + 12);
                ctx.lineTo(cx + k - 1, ch.y + 12);
                ctx.fill();
            }

            let haloGrad = ctx.createRadialGradient(cx, ch.y + 6, 2, cx, ch.y + 6, 26);
            haloGrad.addColorStop(0, "rgba(254, 240, 138, 0.45)");
            haloGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
            ctx.fillStyle = haloGrad;
            ctx.beginPath();
            ctx.arc(cx, ch.y + 6, 26, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    /**
     * Kat Dükkan Giriş Kapıları & Etkileşim İpuçları
     */
    function drawStoreDoors(ctx, floor, now, myP) {
        const doors = STORE_DOORS[floor] || [];
        doors.forEach(d => {
            let dist = myP ? Math.hypot(myP.x - d.doorX, myP.y - d.doorY) : 999;
            let isNear = dist <= 75;
            let pulse = Math.sin(now / 220) * 2;

            ctx.save();

            ctx.fillStyle = isNear ? "rgba(56, 189, 248, 0.28)" : "rgba(15, 23, 42, 0.25)";
            ctx.beginPath();
            ctx.ellipse(d.doorX, d.doorY, 32 + (isNear ? pulse : 0), 14 + (isNear ? pulse * 0.4 : 0), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = isNear ? (d.color || "#38bdf8") : "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = isNear ? 2 : 1;
            ctx.stroke();

            ctx.fillStyle = isNear ? "#ffffff" : "#cbd5e1";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(d.icon || "🚪", d.doorX, d.doorY + 4);

            if (isNear) {
                let badgeY = d.doorY - 38 + pulse;
                ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
                ctx.beginPath();
                ctx.roundRect(d.doorX - 85, badgeY, 170, 28, 6);
                ctx.fill();
                ctx.strokeStyle = d.color || "#38bdf8";
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
                ctx.beginPath();
                ctx.moveTo(d.doorX - 6, badgeY + 28);
                ctx.lineTo(d.doorX + 6, badgeY + 28);
                ctx.lineTo(d.doorX, badgeY + 34);
                ctx.fill();

                ctx.fillStyle = d.color || "#38bdf8";
                ctx.font = "bold 11px sans-serif";
                ctx.fillText("🚪 " + d.name, d.doorX, badgeY + 13);

                ctx.fillStyle = "#94a3b8";
                ctx.font = "9px sans-serif";
                ctx.fillText("[Tıkla veya İlerle]", d.doorX, badgeY + 24);
            }

            ctx.restore();
        });
    }

    /**
     * Asansör Etkileşim Rozeti
     */
    function drawElevatorPrompt(ctx, x, y, floor, now, myP) {
        let dist = myP ? Math.hypot(myP.x - x, myP.y - y) : 999;
        let isNear = dist <= 75;
        let pulse = Math.sin(now / 200) * 2;

        ctx.save();
        ctx.fillStyle = isNear ? "rgba(34, 197, 94, 0.28)" : "rgba(15, 23, 42, 0.25)";
        ctx.beginPath();
        ctx.ellipse(x, y, 28 + (isNear ? pulse : 0), 12 + (isNear ? pulse * 0.4 : 0), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isNear ? "#22c55e" : "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = isNear ? 2 : 1;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🛗", x, y + 4);

        if (isNear) {
            let bY = y - 40 + pulse;
            ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
            ctx.beginPath();
            ctx.roundRect(x - 70, bY, 140, 26, 6);
            ctx.fill();
            ctx.strokeStyle = "#22c55e";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.fillStyle = "#22c55e";
            ctx.font = "bold 10px sans-serif";
            ctx.fillText("🛗 CAM ASANSÖR", x, bY + 12);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "9px sans-serif";
            ctx.fillText("[Tıkla veya Adım At]", x, bY + 22);
        }
        ctx.restore();
    }

    /**
     * Yürüyen Merdiven Etkileşim Rozeti
     */
    function drawEscalatorPrompt(ctx, x, y, floor, now, myP) {
        let dist = myP ? Math.hypot(myP.x - x, myP.y - y) : 999;
        let isNear = dist <= 65;
        let pulse = Math.sin(now / 240) * 2;

        if (isNear) {
            ctx.save();
            let bY = y - 36 + pulse;
            ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
            ctx.beginPath();
            ctx.roundRect(x - 70, bY, 140, 26, 6);
            ctx.fill();
            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            let targetText = (floor === 'avm_kat1') ? "⬆ 1. KATA ÇIK" : "⬇ ZEMİN KATA İN";
            ctx.fillStyle = "#eab308";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(targetText, x, bY + 12);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "9px sans-serif";
            ctx.fillText("[Tıkla veya Adım At]", x, bY + 22);
            ctx.restore();
        }
    }

    // =========================================================================
    // 4. ÇARPIŞMALAR (MINKOWSKI SOLID MODEL & DIAGONAL WALL GEOMETRY)
    // Karakter Ayak Temas İzdüşümü: fx = x, fy = y + 21
    // =========================================================================

    /**
     * Kat 1 Çarpışma Kontrolü
     */
    function checkAvmKat1Collision(x, y) {
        const fx = x;
        const fy = y + 21; // Ayak zemin temas çizgisi

        // 1. Dış Çerçeve Sınırları
        if (fx < 35 || fx > 965 || fy < 160 || fy > 610) {
            // Güney Çıkış Fotoselli Kapı Açıklığı: x: 410..590, fy > 610 serbest
            if (fx >= 410 && fx <= 590 && fy >= 605 && fy <= 635) return false;
            return true;
        }

        // 2. 2.5D Açılı Duvarlar (Diagonal Walls)
        // Sol Duvar: (0, 320) -> (500, 150) => y = 320 - 0.34 * x
        if (fx < 500) {
            let wallY = 320 - 0.34 * fx;
            // Dükkan kapı giriş eşik toleransları
            let isNearShop1 = (fx >= 90 && fx <= 170 && fy >= 260 && fy <= 300); // Cadde Moda
            let isNearShop2 = (fx >= 300 && fx <= 380 && fy >= 190 && fy <= 230); // Şapkacı
            if (!isNearShop1 && !isNearShop2 && fy < wallY) return true;
        } else {
            // Sağ Duvar: (500, 150) -> (1000, 320) => y = 150 + 0.34 * (x - 500)
            let wallY = 150 + 0.34 * (fx - 500);
            let isNearShop3 = (fx >= 620 && fx <= 700 && fy >= 190 && fy <= 230); // Optik
            let isNearShop4 = (fx >= 825 && fx <= 905 && fy >= 260 && fy <= 300); // Sneaker Lab
            if (!isNearShop3 && !isNearShop4 && fy < wallY) return true;
        }

        // 3. Büyük Katmanlı Mermer Fıskiye (Minkowski Elipsi: cx: 500, cyBase: 370, rx: 76, ry: 36)
        if ((Math.pow(fx - 500, 2) / (76 * 76) + Math.pow(fy - 370, 2) / (36 * 36)) <= 1.0) {
            return true;
        }

        // 4. 4 Dairesel Deri Puf (Minkowski Elipsi: rx: 23, ry: 12)
        const ottomans = [
            { cx: 500, cy: 275 },
            { cx: 370, cy: 365 },
            { cx: 630, cy: 365 },
            { cx: 500, cy: 465 }
        ];
        for (let i = 0; i < ottomans.length; i++) {
            let o = ottomans[i];
            if ((Math.pow(fx - o.cx, 2) / (23 * 23) + Math.pow(fy - o.cy, 2) / (12 * 12)) <= 1.0) {
                return true;
            }
        }

        // 5. Bilgilendirme Kiosku (Minkowski Elipsi: cx: 500, cy: 525, rx: 18, ry: 9)
        if ((Math.pow(fx - 500, 2) / (18 * 18) + Math.pow(fy - 525, 2) / (9 * 9)) <= 1.0) {
            return true;
        }

        // 6. 4 Corinthian Sütun (Minkowski Elipsi: rx: 16, ry: 9)
        const cols = [
            { cx: 235, cy: 240 },
            { cx: 440, cy: 172 },
            { cx: 560, cy: 172 },
            { cx: 765, cy: 240 }
        ];
        for (let i = 0; i < cols.length; i++) {
            let c = cols[i];
            if ((Math.pow(fx - c.cx, 2) / (16 * 16) + Math.pow(fy - c.cy, 2) / (9 * 9)) <= 1.0) {
                return true;
            }
        }

        // 7. Panoramik Cam Asansör Şaftı (Minkowski: cx: 935, cy: 340, rx: 34, ry: 18)
        if ((Math.pow(fx - 935, 2) / (34 * 34) + Math.pow(fy - 335, 2) / (18 * 18)) <= 1.0) {
            return true;
        }

        // 8. Palmiyeler (Minkowski: rx: 18, ry: 10)
        if ((Math.pow(fx - 35, 2) / (18 * 18) + Math.pow(fy - 380, 2) / (10 * 10)) <= 1.0) return true;
        if ((Math.pow(fx - 965, 2) / (18 * 18) + Math.pow(fy - 380, 2) / (10 * 10)) <= 1.0) return true;

        return false;
    }

    /**
     * Kat 2 Çarpışma Kontrolü
     */
    function checkAvmKat2Collision(x, y) {
        const fx = x;
        const fy = y + 21; // Ayak zemin temas çizgisi

        // 1. Dış Çerçeve Sınırları
        if (fx < 35 || fx > 965 || fy < 160 || fy > 605) return true;

        // 2. 2.5D Açılı Duvarlar
        if (fx < 500) {
            let wallY = 320 - 0.34 * fx;
            let isNearShop1 = (fx >= 90 && fx <= 170 && fy >= 260 && fy <= 300); // Sartoria Milano
            let isNearShop2 = (fx >= 300 && fx <= 380 && fy >= 190 && fy <= 230); // Chronos Saat
            if (!isNearShop1 && !isNearShop2 && fy < wallY) return true;
        } else {
            let wallY = 150 + 0.34 * (fx - 500);
            let isNearShop3 = (fx >= 825 && fx <= 905 && fy >= 260 && fy <= 300); // Kuaför Arda
            if (!isNearShop3 && fy < wallY) return true;
        }

        // 3. Merkez Mezzanine Atrium Açıklığı / Void (Minkowski Elipsi: cx: 500, cy: 390, rx: 183, ry: 85)
        // Karakterler korkuluğun içine düşemez, etrafında akıcı bir şekilde dolanırlar.
        if ((Math.pow(fx - 500, 2) / (183 * 183) + Math.pow(fy - 390, 2) / (85 * 85)) <= 1.0) {
            return true;
        }

        // 4. VIP Chesterfield Kanepeler (cx: 240, cy: 425 ve cx: 760, cy: 425 - rx: 32, ry: 15)
        if ((Math.pow(fx - 240, 2) / (32 * 32) + Math.pow(fy - 425, 2) / (15 * 15)) <= 1.0) return true;
        if ((Math.pow(fx - 760, 2) / (32 * 32) + Math.pow(fy - 425, 2) / (15 * 15)) <= 1.0) return true;

        // 5. Saat Standı & Berber Direği (Minkowski: rx: 16, ry: 9)
        if ((Math.pow(fx - 340, 2) / (16 * 16) + Math.pow(fy - 220, 2) / (9 * 9)) <= 1.0) return true;
        if ((Math.pow(fx - 760, 2) / (16 * 16) + Math.pow(fy - 220, 2) / (9 * 9)) <= 1.0) return true;

        // 6. Sütunlar
        const cols = [
            { cx: 235, cy: 240 },
            { cx: 440, cy: 172 },
            { cx: 560, cy: 172 },
            { cx: 765, cy: 240 }
        ];
        for (let i = 0; i < cols.length; i++) {
            let c = cols[i];
            if ((Math.pow(fx - c.cx, 2) / (16 * 16) + Math.pow(fy - c.cy, 2) / (9 * 9)) <= 1.0) {
                return true;
            }
        }

        // 7. Asansör Şaftı
        if ((Math.pow(fx - 935, 2) / (34 * 34) + Math.pow(fy - 335, 2) / (18 * 18)) <= 1.0) {
            return true;
        }

        // 8. Palmiyeler
        if ((Math.pow(fx - 35, 2) / (18 * 18) + Math.pow(fy - 380, 2) / (10 * 10)) <= 1.0) return true;
        if ((Math.pow(fx - 965, 2) / (18 * 18) + Math.pow(fy - 380, 2) / (10 * 10)) <= 1.0) return true;

        return false;
    }

    // =========================================================================
    // 5. TIKLAMALAR, MOBİL ETKİLEŞİM VE PORTAL GEÇİŞLERİ
    // =========================================================================

    /**
     * Tıklama Yöneticisi
     */
    function handleAvmMallClick(clickX, clickY, curRoom) {
        let distElev = Math.hypot(clickX - ELEVATOR_POS.doorX, clickY - ELEVATOR_POS.doorY);
        if (distElev <= 60) {
            window.openAvmElevatorModal();
            return true;
        }

        let distEsc = Math.hypot(clickX - ESCALATOR_POS.doorX, clickY - ESCALATOR_POS.doorY);
        if (distEsc <= 55) {
            let targetFloor = (curRoom === 'avm_kat1') ? 'avm_kat2' : 'avm_kat1';
            if (typeof changeRoom === 'function') changeRoom(targetFloor);
            return true;
        }

        if (curRoom === 'avm_kat1') {
            let distKiosk = Math.hypot(clickX - KIOSK_POS.x, clickY - KIOSK_POS.yBase);
            if (distKiosk <= KIOSK_POS.radius + 25) {
                window.openAvmDirectoryModal();
                return true;
            }

            // Güney Çıkış Fotoselli Kapı
            if (clickX >= 410 && clickX <= 590 && clickY >= 570) {
                if (typeof changeRoom === 'function') changeRoom('sahil_yolu');
                return true;
            }
        }

        let doors = STORE_DOORS[curRoom] || [];
        for (let d of doors) {
            let distDoor = Math.hypot(clickX - d.doorX, clickY - d.doorY);
            if (distDoor <= 60) {
                if (typeof changeRoom === 'function') changeRoom(d.id);
                return true;
            }
        }

        return false;
    }

    /**
     * Mobil / E Tuşu Etkileşimleri
     */
    function handleAvmMallMobileInteract(curRoom) {
        const myP = (typeof myId !== 'undefined' && typeof players !== 'undefined') ? players[myId] : null;
        if (!myP) return false;

        if (Math.hypot(myP.x - ELEVATOR_POS.doorX, myP.y - ELEVATOR_POS.doorY) <= 75) {
            window.openAvmElevatorModal();
            return true;
        }

        if (Math.hypot(myP.x - ESCALATOR_POS.doorX, myP.y - ESCALATOR_POS.doorY) <= 65) {
            let targetFloor = (curRoom === 'avm_kat1') ? 'avm_kat2' : 'avm_kat1';
            if (typeof changeRoom === 'function') changeRoom(targetFloor);
            return true;
        }

        if (curRoom === 'avm_kat1' && Math.hypot(myP.x - KIOSK_POS.x, myP.y - KIOSK_POS.yBase) <= 65) {
            window.openAvmDirectoryModal();
            return true;
        }

        let doors = STORE_DOORS[curRoom] || [];
        for (let d of doors) {
            if (Math.hypot(myP.x - d.doorX, myP.y - d.doorY) <= 75) {
                if (typeof changeRoom === 'function') changeRoom(d.id);
                return true;
            }
        }

        return false;
    }

    /**
     * Yürüyerek Portal Adımlama
     */
    function checkAvmMallPortalStep(p) {
        if (!p) return false;
        const curRoom = (typeof currentRoom !== 'undefined') ? currentRoom : 'avm_kat1';

        // Kat 1'den Sahil Yolu'na Yürüyerek Çıkış
        if (curRoom === 'avm_kat1' && p.y >= 580 && p.x >= 410 && p.x <= 590) {
            if (typeof changeRoom === 'function') changeRoom('sahil_yolu');
            return true;
        }

        // Yürüyen Merdivene Adım Atma
        if (Math.hypot(p.x - ESCALATOR_POS.doorX, p.y - ESCALATOR_POS.doorY) <= 35) {
            let targetFloor = (curRoom === 'avm_kat1') ? 'avm_kat2' : 'avm_kat1';
            if (typeof changeRoom === 'function') changeRoom(targetFloor);
            return true;
        }

        // Dükkan Kapılarına Adım Atma
        let doors = STORE_DOORS[curRoom] || [];
        for (let d of doors) {
            if (Math.hypot(p.x - d.doorX, p.y - d.doorY) <= 45) {
                if (typeof changeRoom === 'function') changeRoom(d.id);
                return true;
            }
        }

        return false;
    }

    /**
     * Asansör Seyahati
     */
    window.travelAvmElevator = function (targetFloor) {
        if (typeof changeRoom === 'function') {
            changeRoom(targetFloor);
            window.closeAvmElevatorModal();
            if (typeof showFloatingToast === 'function') {
                let floorName = (targetFloor === 'avm_kat1') ? 'Zemin Kat (Atriyum & Butikler)' : '1. Kat (VIP Asma Kat Galerisi)';
                showFloatingToast(`🛗 Asansör: ${floorName}'a ulaştınız!`);
            }
        }
    };

    /**
     * Modallar
     */
    window.openAvmDirectoryModal = function () {
        const modal = document.getElementById('avmDirectoryModal');
        if (modal) modal.style.display = 'flex';
    };

    window.closeAvmDirectoryModal = function () {
        const modal = document.getElementById('avmDirectoryModal');
        if (modal) modal.style.display = 'none';
    };

    window.openAvmElevatorModal = function () {
        const modal = document.getElementById('avmElevatorModal');
        if (modal) modal.style.display = 'flex';
    };

    window.closeAvmElevatorModal = function () {
        const modal = document.getElementById('avmElevatorModal');
        if (modal) modal.style.display = 'none';
    };

    // Dışa Aktarımlar
    window.renderStaticAvmKat1To = renderStaticAvmKat1To;
    window.renderStaticAvmKat2To = renderStaticAvmKat2To;
    window.drawAvmMallEnvironment = drawAvmMallEnvironment;
    window.drawAvmMallForegroundAndPlayers = drawAvmMallForegroundAndPlayers;
    window.checkAvmKat1Collision = checkAvmKat1Collision;
    window.checkAvmKat2Collision = checkAvmKat2Collision;
    window.checkAvmMallCollision = function (x, y, floor) { return floor === 'avm_kat2' ? checkAvmKat2Collision(x, y) : checkAvmKat1Collision(x, y); };
    window.handleAvmMallClick = handleAvmMallClick;
    window.handleAvmMallMobileInteract = handleAvmMallMobileInteract;
    window.checkAvmMallPortalStep = checkAvmMallPortalStep;
    window.AVM_NPCS = AVM_NPCS;
})();
