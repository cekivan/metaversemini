// MİMARİ VE GÖRSEL STANDARTLAR:
// 1. 2:1 True Dimetric Projeksiyon (26.56° - dx: 2, dy: 1)
// 2. 3D Yüzen Kesit Diorama Kutusu (Floating Architectural Slab Plinth)
// 3. Damarlı İtalyan Antrasit Mermer Zemin & Parlak Cila Yansımaları
// 4. Chevron / Zigzag Turkuaz Duvar Kağıdı, Tavan Pervazları ve Duvar Kesit Kalınlığı
// 5. 3D "OPTIKA" Metalik Logo Rozeti, Duvar Posteleri, Modern Split Klima
// 6. LED Aydınlatmalı Kademeli / Asimetrik Duvar Vitrinleri & Renkli Tasarım Gözlükler
// 7. Kavisli Parlak Beyaz Resepsiyon Bankosu, Monitör, POS Cihazı, Hasır Sepet & Salon Bitkisi
// 8. Optika Kenan NPC'si (Sarı Güneş Gözlüğü, Konuşma Balonu, Gözlük Mağazası Kataloğu)
// 9. Dönen 3 Adet Altıgen Gözlük Kulesi, Kademeli Çift Katlı Cam Teşhir Adası
// 10. Oturulabilir Siyah Deri Barcelona Koltukları (Mies van der Rohe) & Bordo Kadife Puf
// 11. Yuvarlak Giriş Podyum Eşiği & Mavi Kapı Paspası (Giriş/Çıkış Kapısı)

(function (window) {
    'use strict';

    const CANV_W = 1000;
    const CANV_H = 625;

    // Diorama Kutu Geometrisi (2:1 İzometrik Koordinatlar)
    const DIORAMA = {
        topCornerX: 500,
        topCornerY: 85,
        wallH: 170,
        spanX: 350,
        spanY: 175,
        slabH: 18,
        wallThick: 8,
        get leftWallTop() { return { x: this.topCornerX - this.spanX, y: this.topCornerY + this.spanY }; },     // (150, 260)
        get rightWallTop() { return { x: this.topCornerX + this.spanX, y: this.topCornerY + this.spanY }; },    // (850, 260)
        get floorBack() { return { x: this.topCornerX, y: this.topCornerY + this.wallH }; },                     // (500, 255)
        get floorLeft() { return { x: this.topCornerX - this.spanX, y: this.topCornerY + this.spanY + this.wallH }; }, // (150, 430)
        get floorRight() { return { x: this.topCornerX + this.spanX, y: this.topCornerY + this.spanY + this.wallH }; },// (850, 430)
        get floorFront() { return { x: this.topCornerX, y: this.floorLeft.y + this.spanY }; }                    // (500, 605)
    };

    // Optika Kenan NPC Tanımı (Kavisli Banko Arkasında x: 347, y: 356)
    const OPTIKA_KENAN = {
        x: 347,
        y: 356,
        deskX: 352,
        deskY: 376,
        name: "Optik Kenan",
        title: "Gözlük Danışmanı",
        quote: "Karlı havada güneş gözlüğü ile gezerim :) En havalı modeller burada!"
    };

    // Oturulabilir Barcelona Koltukları ve Bordo Puf
    const OPTIKA_SEATS = [
        { id: 'optika_chair_left', x: 285, y: 405, facing: 'down-right', label: 'Barcelona Deri Koltuk (Sol)' },
        { id: 'optika_chair_right', x: 440, y: 385, facing: 'down-left', label: 'Barcelona Deri Koltuk (Sağ)' },
        { id: 'optika_pouf', x: 672, y: 395, facing: 'down-left', label: 'Bordo Kadife Puf' }
    ];

    /**
     * 1. STATİK OPTİKA MAĞAZASI ÇİZİMİ (bgCache Uyumlu)
     */
    function renderStaticOptikaTo(bctx, width, height) {
        width = width || CANV_W;
        height = height || CANV_H;
        bctx.clearRect(0, 0, width, height);

        // 1.1. Arka Plan Derin Uzay & Vignette (Odayı Öne Çıkaran Karanlık)
        let bgGrad = bctx.createRadialGradient(500, 312, 100, 500, 312, 580);
        bgGrad.addColorStop(0, '#0a0d18');
        bgGrad.addColorStop(0.65, '#05070e');
        bgGrad.addColorStop(1, '#000000');
        bctx.fillStyle = bgGrad;
        bctx.fillRect(0, 0, width, height);

        // 1.2. Diorama Altı Havada Asılı Zemin Gölgesi (Floating Drop Shadow)
        bctx.save();
        let shadowGrad = bctx.createRadialGradient(500, 614, 40, 500, 614, 380);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
        shadowGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.45)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        bctx.fillStyle = shadowGrad;
        bctx.beginPath();
        bctx.ellipse(500, 614, 390, 55, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.restore();

        // 1.3. 3D Zemin Plakası Kesiti (Floating Slab Plinth / Kaide)
        drawDioramaFloorSlab(bctx);

        // 1.4. Lüks Damarlı Antrasit İtalyan Mermer Zemin & Pirinç Derzler
        drawDioramaMarbleFloor(bctx);

        // 1.4.1. Lüks Tavan Ray Spotlarından Mermer Zemine Vuran Işık Havuzları (Floor Spotlight Pools)
        drawFloorSpotlightPools(bctx);

        // 1.5. Sol Duvar (2:1 Açı, Chevron Duvar Kağıdı, Tavan Pervazı)
        drawLeftWall(bctx);

        // 1.6. Sağ Duvar (2:1 Açı, Chevron Duvar Kağıdı, Tavan Pervazı)
        drawRightWall(bctx);

        // 1.6.1. Duvar Eteği Gizli LED Süpürgelik Aydınlatması (Baseboard Cove Lighting)
        drawWallBaseboardCoveLighting(bctx);

        // 1.7. 3D Kesit Duvar Kalınlığı Üst Çerçevesi (Wall Cut Caps)
        drawWallCutThickness(bctx);

        // 1.7.1. Tavan Ray Spot Armatürleri (Ceiling Track Lighting)
        drawCeilingTrackLighting(bctx);

        // 1.8. Giriş Eşiği & Mavi Kapı Paspası
        drawEntranceThreshold(bctx);

        // 1.9. Sol Duvar Nesneleri (3D Optika Logosu, Poster, LED Vitrin)
        drawLeftWallObjects(bctx);

        // 1.10. Sağ Duvar Nesneleri (Klima, Büyük 4 Raflı Vitrin, Poster 2)
        drawRightWallObjects(bctx);

        // 1.11. Zemin Mobilyaları ve Standlar Dinamik Y-Sorting Kuyruğunda (drawOptikaForegroundAndPlayers)
        // çizilir, böylece oyuncularla aralarındaki 2.5D derinlik ve örtme ilişkisi kusursuz çalışır.
    }

    /**
     * 3D Zemin Plakası Kesit Kaidesi
     */
    function drawDioramaFloorSlab(ctx) {
        ctx.save();
        const fL = DIORAMA.floorLeft;
        const fR = DIORAMA.floorRight;
        const fF = DIORAMA.floorFront;
        const sH = DIORAMA.slabH;

        // Sol Ön Yüz (Işıklı Açık Gri Beton/Mermer Kesiti)
        let leftSlabGrad = ctx.createLinearGradient(fL.x, fL.y, fF.x, fF.y);
        leftSlabGrad.addColorStop(0, '#94a3b8');
        leftSlabGrad.addColorStop(0.5, '#cbd5e1');
        leftSlabGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = leftSlabGrad;
        ctx.beginPath();
        ctx.moveTo(fL.x, fL.y);
        ctx.lineTo(fF.x, fF.y);
        ctx.lineTo(fF.x, fF.y + sH);
        ctx.lineTo(fL.x, fL.y + sH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Sağ Ön Yüz (Gölgeli Antrasit Kesit)
        let rightSlabGrad = ctx.createLinearGradient(fF.x, fF.y, fR.x, fR.y);
        rightSlabGrad.addColorStop(0, '#475569');
        rightSlabGrad.addColorStop(0.7, '#334155');
        rightSlabGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = rightSlabGrad;
        ctx.beginPath();
        ctx.moveTo(fF.x, fF.y);
        ctx.lineTo(fR.x, fR.y);
        ctx.lineTo(fR.x, fR.y + sH);
        ctx.lineTo(fF.x, fF.y + sH);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Plaka Üst Işık Pah Çizgisi
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(fL.x, fL.y);
        ctx.lineTo(fF.x, fF.y);
        ctx.lineTo(fR.x, fR.y);
        ctx.stroke();

        // Alt Zemin Temas Gölgesi
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(fL.x, fL.y + sH);
        ctx.lineTo(fF.x, fF.y + sH);
        ctx.lineTo(fR.x, fR.y + sH);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * 3D Kesit Duvar Kalınlığı (Diorama Box Cut Caps)
     */
    function drawWallCutThickness(ctx) {
        ctx.save();
        const tC = { x: DIORAMA.topCornerX, y: DIORAMA.topCornerY };
        const lWT = DIORAMA.leftWallTop;
        const rWT = DIORAMA.rightWallTop;
        const fL = DIORAMA.floorLeft;
        const fR = DIORAMA.floorRight;
        const wT = DIORAMA.wallThick;

        // Sol Duvar Dış Dikey Kesiti
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.moveTo(lWT.x, lWT.y);
        ctx.lineTo(lWT.x - wT, lWT.y - wT * 0.5);
        ctx.lineTo(fL.x - wT, fL.y - wT * 0.5);
        ctx.lineTo(fL.x, fL.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 1; ctx.stroke();

        // Sağ Duvar Dış Dikey Kesiti
        ctx.fillStyle = "#475569";
        ctx.beginPath();
        ctx.moveTo(rWT.x, rWT.y);
        ctx.lineTo(rWT.x + wT, rWT.y - wT * 0.5);
        ctx.lineTo(fR.x + wT, fR.y - wT * 0.5);
        ctx.lineTo(fR.x, fR.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1; ctx.stroke();

        // Sol Duvar Üst Kenar Pervazı (Wall Top Cap)
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.moveTo(tC.x, tC.y);
        ctx.lineTo(tC.x - wT, tC.y - wT);
        ctx.lineTo(lWT.x - wT, lWT.y - wT * 0.5);
        ctx.lineTo(lWT.x, lWT.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1; ctx.stroke();

        // Sağ Duvar Üst Kenar Pervazı (Wall Top Cap)
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.moveTo(tC.x, tC.y);
        ctx.lineTo(tC.x - wT, tC.y - wT);
        ctx.lineTo(rWT.x + wT, rWT.y - wT * 0.5);
        ctx.lineTo(rWT.x, rWT.y);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1; ctx.stroke();

        ctx.restore();
    }

    /**
     * Damarlı Antrasit İtalyan Mermer Zemin
     */
    /**
     * Damarlı Antrasit İtalyan Mermer Zemin (Sanalika Yüksek Kontrastlı Mermer Dokusu)
     */
    /**
     * Lüks İtalyan Nero Marquina Siyah Mermer Zemin (Doğal Organik Damar & Cila Dokusu)
     */
    function drawDioramaMarbleFloor(ctx) {
        ctx.save();
        const fB = DIORAMA.floorBack;
        const fL = DIORAMA.floorLeft;
        const fR = DIORAMA.floorRight;
        const fF = DIORAMA.floorFront;

        // 2:1 İzometrik Eşkenar Dörtgen Zemin Maskesi
        ctx.beginPath();
        ctx.moveTo(fB.x, fB.y);
        ctx.lineTo(fR.x, fR.y);
        ctx.lineTo(fF.x, fF.y);
        ctx.lineTo(fL.x, fL.y);
        ctx.closePath();
        ctx.clip();

        // 1. Zemin Taban Koyu Antrasit Gradyan
        let baseGrad = ctx.createLinearGradient(fB.x, fB.y, fF.x, fF.y);
        baseGrad.addColorStop(0, '#1c2433');
        baseGrad.addColorStop(0.35, '#121824');
        baseGrad.addColorStop(0.7, '#18212f');
        baseGrad.addColorStop(1, '#0c111a');
        ctx.fillStyle = baseGrad;
        ctx.fill();

        // 2. Dumanlı Mermer Bulutları & Mineral Katmanları (Smoky Marble Patches)
        const cloudPatches = [
            { x: 310, y: 340, rx: 140, ry: 50, rot: 0.45, a: 0.18 },
            { x: 440, y: 310, rx: 130, ry: 45, rot: -0.35, a: 0.16 },
            { x: 590, y: 330, rx: 150, ry: 55, rot: 0.5, a: 0.18 },
            { x: 730, y: 380, rx: 130, ry: 45, rot: -0.4, a: 0.20 },
            { x: 260, y: 440, rx: 160, ry: 60, rot: -0.5, a: 0.22 },
            { x: 410, y: 430, rx: 170, ry: 65, rot: 0.35, a: 0.24 },
            { x: 550, y: 440, rx: 150, ry: 55, rot: -0.45, a: 0.22 },
            { x: 680, y: 470, rx: 140, ry: 50, rot: 0.4, a: 0.22 },
            { x: 360, y: 520, rx: 150, ry: 55, rot: 0.5, a: 0.20 },
            { x: 500, y: 520, rx: 180, ry: 70, rot: -0.35, a: 0.25 },
            { x: 630, y: 540, rx: 130, ry: 48, rot: 0.35, a: 0.18 },
            { x: 500, y: 380, rx: 200, ry: 80, rot: -0.2, a: 0.22 }
        ];

        cloudPatches.forEach(c => {
            let radG = ctx.createRadialGradient(c.x, c.y, 5, c.x, c.y, c.rx);
            radG.addColorStop(0, `rgba(241, 245, 249, ${c.a * 1.5})`);
            radG.addColorStop(0.35, `rgba(203, 213, 225, ${c.a})`);
            radG.addColorStop(0.7, `rgba(148, 163, 184, ${c.a * 0.4})`);
            radG.addColorStop(1, "rgba(148, 163, 184, 0)");
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rot);
            ctx.scale(1, c.ry / c.rx);
            ctx.fillStyle = radG;
            ctx.beginPath();
            ctx.arc(0, 0, c.rx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 5. Lüks İtalyan Mermer Pirinç / Altın Derz Çıtaları (Brass Inlay Grid - 2:1 Parametrik)
        const gridDivs = 6; // 6x6 Lüks Büyük Mermer Plaka Ağı
        ctx.save();
        ctx.lineCap = "round";

        // 5.1. Alt Katman: Sıcak Pirinç Gölgesi (Gömme Derz Derinliği)
        ctx.strokeStyle = "rgba(180, 83, 9, 0.32)";
        ctx.lineWidth = 2.0;
        for (let i = 1; i < gridDivs; i++) {
            let u = i / gridDivs;
            // U Aksı Çizgisi (Sol duvardan sağ ön kenara)
            let x1 = fB.x - 350 * u, y1 = fB.y + 175 * u;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + 350, y1 + 175); ctx.stroke();
            // V Aksı Çizgisi (Sağ duvardan sol ön kenara)
            let x2 = fB.x + 350 * u, y2 = fB.y + 175 * u;
            ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 350, y2 + 175); ctx.stroke();
        }

        // 5.2. Üst Katman: Metalik Pirinç / Altın Parıltı Çıtası
        ctx.strokeStyle = "rgba(245, 158, 11, 0.48)";
        ctx.lineWidth = 0.9;
        for (let i = 1; i < gridDivs; i++) {
            let u = i / gridDivs;
            let x1 = fB.x - 350 * u, y1 = fB.y + 175 * u;
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + 350, y1 + 175); ctx.stroke();
            let x2 = fB.x + 350 * u, y2 = fB.y + 175 * u;
            ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 350, y2 + 175); ctx.stroke();
        }

        // 5.3. Pirinç Çıta Kesişim Rozetleri / Noktaları (Brass Studs at Intersections)
        for (let i = 1; i < gridDivs; i++) {
            for (let j = 1; j < gridDivs; j++) {
                let u = i / gridDivs;
                let v = j / gridDivs;
                let ix = 500 + 350 * (v - u);
                let iy = 255 + 175 * (u + v);
                ctx.fillStyle = "rgba(251, 191, 36, 0.75)";
                ctx.beginPath();
                ctx.arc(ix, iy, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();

        // 6. Parlak Cila Specular Işık Şeritleri
        let specGrad1 = ctx.createLinearGradient(200, 270, 650, 550);
        specGrad1.addColorStop(0, "rgba(255, 255, 255, 0.18)");
        specGrad1.addColorStop(0.35, "rgba(255, 255, 255, 0.03)");
        specGrad1.addColorStop(0.7, "rgba(255, 255, 255, 0.14)");
        specGrad1.addColorStop(1, "rgba(255, 255, 255, 0.02)");
        ctx.fillStyle = specGrad1;
        ctx.fillRect(140, 250, 720, 360);

        ctx.restore();
    }

    function drawLeftWall(ctx) {
        ctx.save();
        const tC = { x: DIORAMA.topCornerX, y: DIORAMA.topCornerY };
        const lWT = DIORAMA.leftWallTop;
        const fL = DIORAMA.floorLeft;
        const fB = DIORAMA.floorBack;

        // Duvar Poligonu
        ctx.beginPath();
        ctx.moveTo(tC.x, tC.y);
        ctx.lineTo(lWT.x, lWT.y);
        ctx.lineTo(fL.x, fL.y);
        ctx.lineTo(fB.x, fB.y);
        ctx.closePath();
        ctx.clip();

        // Turkuaz / Petrol Yeşili Ana Gradyan
        let wallGrad = ctx.createLinearGradient(tC.x, tC.y, fL.x, fL.y);
        wallGrad.addColorStop(0, '#0e7490');
        wallGrad.addColorStop(0.4, '#0891b2');
        wallGrad.addColorStop(0.8, '#0e7490');
        wallGrad.addColorStop(1, '#155e75');
        ctx.fillStyle = wallGrad;
        ctx.fill();

        // Chevron / Zigzag Duvar Deseni
        ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
        ctx.lineWidth = 1.5;
        for (let y = -60; y <= 450; y += 20) {
            ctx.beginPath();
            for (let x = 120; x <= 520; x += 32) {
                let isoY = y + (500 - x) * 0.5;
                ctx.moveTo(x, isoY);
                ctx.lineTo(x + 16, isoY - 7);
                ctx.lineTo(x + 32, isoY);
            }
            ctx.stroke();
        }

        // Tavan Yakını Ortam Karartması
        let topShade = ctx.createLinearGradient(0, 85, 0, 210);
        topShade.addColorStop(0, "rgba(0, 0, 0, 0.3)");
        topShade.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = topShade;
        ctx.fillRect(140, 80, 380, 210);

        ctx.restore();

        // Tavan Çıtası (Crown Molding - Beyaz Pervaz)
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tC.x, tC.y);
        ctx.lineTo(lWT.x, lWT.y);
        ctx.stroke();

        // Süpürgelik (Baseboard - Beyaz Etek)
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(fB.x, fB.y);
        ctx.lineTo(fL.x, fL.y);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fB.x, fB.y + 2);
        ctx.lineTo(fL.x, fL.y + 2);
        ctx.stroke();
    }

    /**
     * Sağ Duvar (2:1 Açı, Chevron Duvar Kağıdı)
     */
    function drawRightWall(ctx) {
        ctx.save();
        const tC = { x: DIORAMA.topCornerX, y: DIORAMA.topCornerY };
        const rWT = DIORAMA.rightWallTop;
        const fR = DIORAMA.floorRight;
        const fB = DIORAMA.floorBack;

        // Duvar Poligonu
        ctx.beginPath();
        ctx.moveTo(tC.x, tC.y);
        ctx.lineTo(rWT.x, rWT.y);
        ctx.lineTo(fR.x, fR.y);
        ctx.lineTo(fB.x, fB.y);
        ctx.closePath();
        ctx.clip();

        // Sağ Duvar Hafif Gölgeli Turkuaz Gradyan
        let wallGrad = ctx.createLinearGradient(tC.x, tC.y, fR.x, fR.y);
        wallGrad.addColorStop(0, '#0c657d');
        wallGrad.addColorStop(0.5, '#0e7490');
        wallGrad.addColorStop(1, '#164e63');
        ctx.fillStyle = wallGrad;
        ctx.fill();

        // Chevron Zigzag Deseni
        ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
        ctx.lineWidth = 1.5;
        for (let y = -60; y <= 450; y += 20) {
            ctx.beginPath();
            for (let x = 480; x <= 880; x += 32) {
                let isoY = y + (x - 500) * 0.5;
                ctx.moveTo(x, isoY);
                ctx.lineTo(x + 16, isoY - 7);
                ctx.lineTo(x + 32, isoY);
            }
            ctx.stroke();
        }

        ctx.restore();

        // Tavan Çıtası
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(tC.x, tC.y);
        ctx.lineTo(rWT.x, rWT.y);
        ctx.stroke();

        // Süpürgelik
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(fB.x, fB.y);
        ctx.lineTo(fR.x, fR.y);
        ctx.stroke();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(fB.x, fB.y + 2);
        ctx.lineTo(fR.x, fR.y + 2);
        ctx.stroke();

        // Arka Köşe Birleşim Çizgisi & Gölgelendirmesi (Corner Crevice)
        let cornerGrad = ctx.createLinearGradient(tC.x - 6, 0, tC.x + 6, 0);
        cornerGrad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
        cornerGrad.addColorStop(0.5, "rgba(0, 0, 0, 0.7)");
        cornerGrad.addColorStop(1, "rgba(0, 0, 0, 0.2)");
        ctx.fillStyle = cornerGrad;
        ctx.fillRect(tC.x - 3, tC.y, 6, DIORAMA.wallH);
    }

    /**
     * Giriş Eşiği & Mavi Kapı Paspası
     */
    function drawEntranceThreshold(ctx) {
        ctx.save();
        const ex = 690, ey = 505;

        // Yuvarlak Podyum Eşik Basamağı (3D Step)
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(ex, ey + 18, 50, 17, 0, 0, Math.PI * 2);
        ctx.fill();

        // Basamak Dikey Kenarı
        ctx.fillStyle = "#94a3b8";
        ctx.beginPath();
        ctx.ellipse(ex, ey + 11, 46, 15, 0, 0, Math.PI);
        ctx.lineTo(ex - 46, ey);
        ctx.ellipse(ex, ey, 46, 15, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.stroke();

        // Basamak Üst Yüzeyi (Beyaz/Açık Gri Mermer)
        let stepTopGrad = ctx.createLinearGradient(ex - 46, ey, ex + 46, ey);
        stepTopGrad.addColorStop(0, '#ffffff');
        stepTopGrad.addColorStop(0.7, '#e2e8f0');
        stepTopGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = stepTopGrad;
        ctx.beginPath();
        ctx.ellipse(ex, ey, 46, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Mavi / Turkuaz Kapı Paspası (Dikdörtgen/İzometrik Mat)
        ctx.save();
        ctx.translate(ex - 12, ey - 2);
        ctx.rotate(-0.15);
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.roundRect(-22, -9, 44, 18, 3);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // Paspas çizgili kabartma dokusu
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.0;
        for (let i = -16; i <= 16; i += 5) {
            ctx.beginPath();
            ctx.moveTo(i, -6);
            ctx.lineTo(i, 6);
            ctx.stroke();
        }
        ctx.restore();

        ctx.restore();
    }

    /**
     * Sol Duvar Nesneleri (3D Optika Logosu, Poster 1, Asimetrik LED Vitrin)
     */
    function drawLeftWallObjects(ctx) {
        ctx.save();

        // 1. 3D "OPTIKA" MAĞAZA LOGO ROZETİ (x: 270, y: 160)
        ctx.save();
        ctx.translate(270, 160);
        ctx.transform(1, -0.5, 0, 1, 0, 0);

        // Duvara vuran gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.roundRect(-42, -18, 94, 40, 7);
        ctx.fill();

        // Rozet Ana Gövde (Metalik Çerçeve & Koyu Zemin)
        let badgeGrad = ctx.createLinearGradient(-45, -22, 45, 14);
        badgeGrad.addColorStop(0, '#334155');
        badgeGrad.addColorStop(0.5, '#1e293b');
        badgeGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = badgeGrad;
        ctx.beginPath();
        ctx.roundRect(-45, -22, 90, 36, 7);
        ctx.fill();

        // Parlak Gümüş Kenarlık
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2.6;
        ctx.stroke();

        // İnce Mavi Neon İç Hat
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.roundRect(-41, -19, 82, 30, 4);
        ctx.stroke();

        // "OPTIKA" Tipografisi
        ctx.fillStyle = "#ffffff";
        ctx.font = "900 18px 'Segoe UI', Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("OPTİK", 2, -4);

        // Minik şık altın güneş gözlüğü silüeti
        drawDetailedSunglasses(ctx, 2, 7, 'wayfarer', '#f59e0b', 'rgba(245, 158, 11, 0.85)', 0.8);

        ctx.restore();

        // 2. SOL MODA POSTERİ (x: 185, y: 275)
        ctx.save();
        ctx.translate(185, 275);
        ctx.transform(1, -0.5, 0, 1, 0, 0);

        // Poster Çerçeve Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(-28, -40, 60, 84);

        // Siyah Parlak Çerçeve
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-30, -42, 60, 84);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-30, -42, 60, 84);

        // Poster Resmi (Canlı Moda İllüstrasyonu)
        let posterGrad = ctx.createLinearGradient(-26, -38, 26, 38);
        posterGrad.addColorStop(0, '#f43f5e');
        posterGrad.addColorStop(0.5, '#fb923c');
        posterGrad.addColorStop(1, '#6366f1');
        ctx.fillStyle = posterGrad;
        ctx.fillRect(-26, -38, 52, 76);

        // Poster karakter kafaları
        ctx.fillStyle = "#fef08a";
        ctx.beginPath(); ctx.arc(-8, -12, 11, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(10, 4, 12, 0, Math.PI * 2); ctx.fill();
        // Güneş gözlükleri
        drawDetailedSunglasses(ctx, -8, -12, 'aviator', '#0f172a', 'rgba(15, 23, 42, 0.95)', 0.7);
        drawDetailedSunglasses(ctx, 10, 4, 'cateye', '#ffffff', 'rgba(236, 72, 153, 0.9)', 0.75);

        // Poster alt yazısı
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 7px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("NEW COLLECTION", 0, 30);
        ctx.restore();

        // 3. ASİMETRİK BEYAZ LED'Lİ DUVAR VİTRİNİ (x: 350, y: 220)
        drawLeftAsymmetricShelf(ctx, 350, 220);

        ctx.restore();
    }

    /**
     * Sol Duvar Asimetrik Kademeli Beyaz LED Vitrini
     */
    /**
     * Sol Duvar Asimetrik Kademeli Beyaz LED Vitrini (Sanalika Basamaklı L-Formu)
     */
    function drawLeftAsymmetricShelf(ctx, ox, oy) {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.transform(1, -0.5, 0, 1, 0, 0);

        // Basamaklı Gövde Poligonu (Sol taraf daha alçak, sağ taraf yukarı uzanır)
        // Duvara vuran koyu gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.moveTo(-52, -18);
        ctx.lineTo(-6, -18);
        ctx.lineTo(-6, -42);
        ctx.lineTo(52, -42);
        ctx.lineTo(52, 38);
        ctx.lineTo(-52, 38);
        ctx.closePath();
        ctx.fill();

        // Beyaz Kutu Dış Çerçeve
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-54, -20);
        ctx.lineTo(-8, -20);
        ctx.lineTo(-8, -44);
        ctx.lineTo(50, -44);
        ctx.lineTo(50, 36);
        ctx.lineTo(-54, 36);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Sıcak Altın Sarı LED Niche Aydınlatması
        let ledGrad = ctx.createLinearGradient(0, -40, 0, 34);
        ledGrad.addColorStop(0, "rgba(254, 240, 138, 0.85)");
        ledGrad.addColorStop(0.5, "rgba(253, 224, 71, 0.45)");
        ledGrad.addColorStop(1, "rgba(255, 255, 255, 0.95)");
        ctx.fillStyle = ledGrad;
        ctx.beginPath();
        ctx.moveTo(-48, -14);
        ctx.lineTo(-12, -14);
        ctx.lineTo(-12, -38);
        ctx.lineTo(44, -38);
        ctx.lineTo(44, 30);
        ctx.lineTo(-48, 30);
        ctx.closePath();
        ctx.fill();

        // Cam Raflar
        ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
        ctx.lineWidth = 2.0;
        // Alt uzun raf
        ctx.beginPath(); ctx.moveTo(-48, 8); ctx.lineTo(44, 8); ctx.stroke();
        // Sağ üst raf
        ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(44, -16); ctx.stroke();

        // Raflardaki Seçkin Tasarım Gözlükler (Kalın Çerçeve & Renkli Camlar)
        // Sağ üst bölme
        drawDetailedSunglasses(ctx, 16, -26, 'aviator', '#0284c7', 'rgba(2, 132, 199, 0.9)', 0.95);
        // Sol orta
        drawDetailedSunglasses(ctx, -30, 0, 'wayfarer', '#dc2626', 'rgba(220, 38, 38, 0.9)', 0.95);
        // Sağ orta
        drawDetailedSunglasses(ctx, 16, -4, 'cateye', '#16a34a', 'rgba(22, 163, 74, 0.9)', 0.95);
        // Alt sıra
        drawDetailedSunglasses(ctx, -30, 20, 'round', '#ea580c', 'rgba(234, 88, 12, 0.9)', 0.95);
        drawDetailedSunglasses(ctx, 16, 20, 'visor', '#0f172a', 'rgba(15, 23, 42, 0.95)', 0.95);

        ctx.restore();
    }

    /**
     * Sağ Duvar Nesneleri (Klima, Büyük 4 Raflı Vitrin, Poster 2)
     */
    /**
     * Sağ Duvar Nesneleri (Klima, Kademeli L-Vitrin, Büyük 4 Raflı Vitrin, Poster 2)
     */
    function drawRightWallObjects(ctx) {
        ctx.save();

        // 1. MODERN İNVERTER DUVAR KLİMASI (x: 550, y: 155)
        ctx.save();
        ctx.translate(550, 155);
        ctx.transform(1, 0.5, 0, 1, 0, 0);

        // Duvar gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.roundRect(-28, -12, 64, 30, 5);
        ctx.fill();

        // Metalik Gümüş / Beyaz Gövde
        let acGrad = ctx.createLinearGradient(-30, -15, -30, 15);
        acGrad.addColorStop(0, '#ffffff');
        acGrad.addColorStop(0.5, '#e2e8f0');
        acGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = acGrad;
        ctx.beginPath();
        ctx.roundRect(-30, -15, 62, 28, 5);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Hava Üfleme Izgarası (Louver)
        ctx.fillStyle = "#334155";
        ctx.fillRect(-26, 7, 54, 3);
        // Yeşil Güç LED'i
        ctx.fillStyle = "#22c55e";
        ctx.beginPath(); ctx.arc(22, 0, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // 2. KADEMELİ L-FORMU ÜST VİTRİN (x: 605, y: 205 - Sanalika Basamaklı Vitrin)
        ctx.save();
        ctx.translate(605, 205);
        ctx.transform(1, 0.5, 0, 1, 0, 0);

        // Arka Gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.moveTo(-38, -36);
        ctx.lineTo(8, -36);
        ctx.lineTo(8, -12);
        ctx.lineTo(38, -12);
        ctx.lineTo(38, 28);
        ctx.lineTo(-38, 28);
        ctx.closePath();
        ctx.fill();

        // Beyaz Kutu Gövde
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(-40, -38);
        ctx.lineTo(6, -38);
        ctx.lineTo(6, -14);
        ctx.lineTo(36, -14);
        ctx.lineTo(36, 26);
        ctx.lineTo(-40, 26);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.8; ctx.stroke();

        // Sıcak LED Işığı
        let topLed = ctx.createLinearGradient(0, -35, 0, 25);
        topLed.addColorStop(0, "rgba(254, 240, 138, 0.85)");
        topLed.addColorStop(0.5, "rgba(253, 224, 71, 0.45)");
        topLed.addColorStop(1, "rgba(255, 255, 255, 0.95)");
        ctx.fillStyle = topLed;
        ctx.beginPath();
        ctx.moveTo(-36, -34);
        ctx.lineTo(2, -34);
        ctx.lineTo(2, -10);
        ctx.lineTo(32, -10);
        ctx.lineTo(32, 22);
        ctx.lineTo(-36, 22);
        ctx.closePath();
        ctx.fill();

        // Cam Raf
        ctx.strokeStyle = "rgba(56, 189, 248, 0.85)"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(-36, 4); ctx.lineTo(32, 4); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-36, -16); ctx.lineTo(2, -16); ctx.stroke();

        // Raftaki Gözlükler
        drawDetailedSunglasses(ctx, -18, -24, 'wayfarer', '#dc2626', 'rgba(220,38,38,0.9)', 0.9);
        drawDetailedSunglasses(ctx, -18, -6, 'aviator', '#0284c7', 'rgba(2,132,199,0.9)', 0.9);
        drawDetailedSunglasses(ctx, 18, 4, 'cateye', '#16a34a', 'rgba(22,163,74,0.9)', 0.9);
        drawDetailedSunglasses(ctx, -18, 14, 'round', '#f59e0b', 'rgba(245,158,11,0.9)', 0.9);
        ctx.restore();

        // 3. BÜYÜK 4 RAFLI ANA GÖZLÜK VİTRİNİ (x: 745, y: 290)
        ctx.save();
        ctx.translate(745, 290);
        ctx.transform(1, 0.5, 0, 1, 0, 0);

        // Duvar gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.beginPath();
        ctx.roundRect(-42, -58, 90, 124, 7);
        ctx.fill();

        // Beyaz Kutu Dolap
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(-45, -60, 92, 124, 7);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // İç Sıcak LED Aydınlatma
        let mainLedGrad = ctx.createLinearGradient(0, -55, 0, 55);
        mainLedGrad.addColorStop(0, "rgba(254, 240, 138, 0.75)");
        mainLedGrad.addColorStop(0.5, "rgba(253, 224, 71, 0.35)");
        mainLedGrad.addColorStop(1, "rgba(255, 255, 255, 0.95)");
        ctx.fillStyle = mainLedGrad;
        ctx.beginPath();
        ctx.roundRect(-40, -55, 82, 114, 5);
        ctx.fill();

        // 4 Sıra Cam Raf
        ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
        ctx.lineWidth = 1.8;
        [-28, 0, 28].forEach(ry => {
            ctx.beginPath();
            ctx.moveTo(-40, ry);
            ctx.lineTo(42, ry);
            ctx.stroke();
        });

        // 4 Sıra Zengin Tasarım Gözlük Teşhiri
        const glassesStyles = [
            { left: { s: 'wayfarer', c: '#e11d48' }, right: { s: 'aviator', c: '#0284c7' } },
            { left: { s: 'round', c: '#f59e0b' }, right: { s: 'cateye', c: '#10b981' } },
            { left: { s: 'visor', c: '#8b5cf6' }, right: { s: 'wayfarer', c: '#0f172a' } },
            { left: { s: 'cateye', c: '#d97706' }, right: { s: 'aviator', c: '#ec4899' } }
        ];
        [-42, -14, 14, 42].forEach((gy, idx) => {
            const pair = glassesStyles[idx];
            drawDetailedSunglasses(ctx, -20, gy, pair.left.s, pair.left.c, pair.left.c, 0.9);
            drawDetailedSunglasses(ctx, 22, gy, pair.right.s, pair.right.c, pair.right.c, 0.9);
        });

        ctx.restore();

        // 4. SAĞ MODA POSTERİ (x: 830, y: 360)
        ctx.save();
        ctx.translate(830, 360);
        ctx.transform(1, 0.5, 0, 1, 0, 0);

        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.fillRect(-24, -34, 50, 72);

        ctx.fillStyle = "#0f172a";
        ctx.fillRect(-26, -36, 52, 74);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-26, -36, 52, 74);

        // Sarışın Havalı Gözlüklü Kız Posteri
        let poster2Grad = ctx.createLinearGradient(-22, -32, 22, 32);
        poster2Grad.addColorStop(0, '#ec4899');
        poster2Grad.addColorStop(1, '#3b82f6');
        ctx.fillStyle = poster2Grad;
        ctx.fillRect(-22, -32, 44, 66);

        // Saç & Çehre
        ctx.fillStyle = "#fde047";
        ctx.beginPath(); ctx.arc(0, -8, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath(); ctx.arc(0, -6, 9, 0, Math.PI * 2); ctx.fill();
        drawDetailedSunglasses(ctx, 0, -6, 'wayfarer', '#0f172a', 'rgba(15, 23, 42, 0.95)', 0.75);

        ctx.restore();

        ctx.restore();
    }

    function drawFloorFurniture(ctx) {
        ctx.save();

        // 1. KAVİSLİ BEYAZ RESEPSİYON BANKOSU & TEZGAHI (x: 352, y: 376)
        drawCurvedReceptionDesk(ctx, OPTIKA_KENAN.deskX, OPTIKA_KENAN.deskY);

        // 2. BORDO SAKSIDAKİ DEKORATİF BİTKİ (x: 435, y: 305)
        drawPottedPlant(ctx, 435, 305);

        // 3. DÖNEN ALTIGEN GÖZLÜK STANDLARI
        drawHexagonalTower(ctx, 480, 275, 0.95); // Arka kule
        drawHexagonalTower(ctx, 430, 492, 1.1);  // Sol kule (masanın önünü açmak için sağa çekildi)
        drawHexagonalTower(ctx, 770, 430, 1.1);  // Sağ kule (A-tabela yerine taşınan 1. kule)

        // 4. KADEMELİ CAM ÖN TEŞHİR ADASI (x: 540, y: 515)
        drawTieredGlassIsland(ctx, 540, 515);

        // 5. DANIŞMA VE DENEME MASASI + BORDO PUF (x: 640, y: 375)
        drawVanityConsultationTable(ctx, 640, 375);

        // 6. BARCELONA DERİ VE KROM KOLTUKLARI (Mies van der Rohe)
        // Sol Koltuk: Banko sol yanı (x: 285, y: 405)
        drawBarcelonaChair(ctx, OPTIKA_SEATS[0].x, OPTIKA_SEATS[0].y, 'down-right');
        // Sağ Koltuk: Banko sağ yanı (x: 440, y: 385)
        drawBarcelonaChair(ctx, OPTIKA_SEATS[1].x, OPTIKA_SEATS[1].y, 'down-left');

        ctx.restore();
    }


    /**
     * Lüks Tavan Ray Spotlarından Mermer Zemine Vuran Işık Havuzları (Floor Spotlight Pools)
     */
    function drawFloorSpotlightPools(ctx) {
        ctx.save();
        const spots = [
            // Resepsiyon Bankosu & Danışma Alanı (Sıcak Altın/Krem Işık Konisi)
            { x: 352, y: 395, rx: 95, ry: 45, col: '254, 243, 199', alpha: 0.22 },
            // Sağ Dönen Altıgen Kule (Stand 1 - A-Tabela Yeri)
            { x: 770, y: 435, rx: 56, ry: 27, col: '254, 243, 199', alpha: 0.25 },
            // Sol Ön Dönen Altıgen Kule (Stand 2)
            { x: 430, y: 495, rx: 56, ry: 27, col: '254, 243, 199', alpha: 0.25 },
            // Arka Dönen Altıgen Kule (Stand 3)
            { x: 480, y: 280, rx: 48, ry: 23, col: '254, 243, 199', alpha: 0.22 },
            // Kademeli Cam Teşhir Adası (Kristal Mavi / Beyaz Parlama Havuzu)
            { x: 540, y: 520, rx: 68, ry: 32, col: '224, 242, 254', alpha: 0.26 },
            // Danışma ve Deneme Masası
            { x: 635, y: 385, rx: 60, ry: 29, col: '254, 243, 199', alpha: 0.22 }
        ];

        spots.forEach(s => {
            let grad = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.rx);
            grad.addColorStop(0, `rgba(${s.col}, ${s.alpha})`);
            grad.addColorStop(0.45, `rgba(${s.col}, ${s.alpha * 0.55})`);
            grad.addColorStop(0.8, `rgba(${s.col}, ${s.alpha * 0.15})`);
            grad.addColorStop(1, `rgba(${s.col}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    /**
     * Duvar Eteği Gizli LED Süpürgelik Aydınlatması (Cove / Baseboard Ambient LED)
     */
    function drawWallBaseboardCoveLighting(ctx) {
        ctx.save();
        const fB = DIORAMA.floorBack;
        const fL = DIORAMA.floorLeft;
        const fR = DIORAMA.floorRight;

        // 1. Sol Duvar Eteği (fB: 500, 255 -> fL: 150, 430)
        // Geniş yumuşak amber halesi
        ctx.strokeStyle = "rgba(253, 230, 138, 0.16)";
        ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(fB.x, fB.y); ctx.lineTo(fL.x, fL.y); ctx.stroke();

        // Orta sıcak LED ışıması
        ctx.strokeStyle = "rgba(251, 191, 36, 0.38)";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(fB.x, fB.y); ctx.lineTo(fL.x, fL.y); ctx.stroke();

        // Parlak çekirdek
        ctx.strokeStyle = "rgba(254, 249, 195, 0.85)";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(fB.x, fB.y); ctx.lineTo(fL.x, fL.y); ctx.stroke();

        // 2. Sağ Duvar Eteği (fB: 500, 255 -> fR: 850, 430)
        ctx.strokeStyle = "rgba(253, 230, 138, 0.16)";
        ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(fB.x, fB.y); ctx.lineTo(fR.x, fR.y); ctx.stroke();

        ctx.strokeStyle = "rgba(251, 191, 36, 0.38)";
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(fB.x, fB.y); ctx.lineTo(fR.x, fR.y); ctx.stroke();

        ctx.strokeStyle = "rgba(254, 249, 195, 0.85)";
        ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(fB.x, fB.y); ctx.lineTo(fR.x, fR.y); ctx.stroke();

        ctx.restore();
    }

    /**
     * Tavan Ray Spot Armatürleri (Ceiling Track Lighting)
     */
    function drawCeilingTrackLighting(ctx) {
        ctx.save();
        const tC = { x: DIORAMA.topCornerX, y: DIORAMA.topCornerY };
        const lWT = DIORAMA.leftWallTop;
        const rWT = DIORAMA.rightWallTop;

        // 1. Sol Tavan Rayı (tC -> lWT yönünde 18px aşağıda)
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(tC.x - 12, tC.y + 16);
        ctx.lineTo(lWT.x + 25, lWT.y + 16);
        ctx.stroke();

        // Pirinç Ray Şeridi
        ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(tC.x - 12, tC.y + 18);
        ctx.lineTo(lWT.x + 25, lWT.y + 18);
        ctx.stroke();

        // Sol Ray Üzerindeki 3 Spot Projektör
        const leftSpots = [0.25, 0.55, 0.82];
        leftSpots.forEach(t => {
            let sx = (tC.x - 12) + ((lWT.x + 25) - (tC.x - 12)) * t;
            let sy = (tC.y + 16) + ((lWT.y + 16) - (tC.y + 16)) * t;

            // Spot Mafsalı (Pirinç)
            ctx.fillStyle = "#d97706";
            ctx.fillRect(sx - 2, sy - 2, 4, 4);

            // Silindirik Spot Gövdesi (Aşağıya/İçeriye eğimli)
            ctx.save();
            ctx.translate(sx, sy + 3);
            ctx.rotate(0.35); // İçeriye doğru açı
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-3, 0, 6, 11);
            ctx.fillStyle = "#f59e0b"; // Altın bilezik
            ctx.fillRect(-3, 9, 6, 2);
            // Parlak LED Lens
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.ellipse(0, 11, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        // 2. Sağ Tavan Rayı (tC -> rWT yönünde 18px aşağıda)
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(tC.x + 12, tC.y + 16);
        ctx.lineTo(rWT.x - 25, rWT.y + 16);
        ctx.stroke();

        // Pirinç Ray Şeridi
        ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(tC.x + 12, tC.y + 18);
        ctx.lineTo(rWT.x - 25, rWT.y + 18);
        ctx.stroke();

        // Sağ Ray Üzerindeki 3 Spot Projektör
        const rightSpots = [0.25, 0.55, 0.82];
        rightSpots.forEach(t => {
            let sx = (tC.x + 12) + ((rWT.x - 25) - (tC.x + 12)) * t;
            let sy = (tC.y + 16) + ((rWT.y + 16) - (tC.y + 16)) * t;

            ctx.fillStyle = "#d97706";
            ctx.fillRect(sx - 2, sy - 2, 4, 4);

            ctx.save();
            ctx.translate(sx, sy + 3);
            ctx.rotate(-0.35); // İçeriye doğru açı
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(-3, 0, 6, 11);
            ctx.fillStyle = "#f59e0b";
            ctx.fillRect(-3, 9, 6, 2);
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.ellipse(0, 11, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        ctx.restore();
    }

    /**
     * Kavisli Beyaz Resepsiyon Bankosu
     */
    function drawCurvedReceptionDesk(ctx, dx, dy) {
        ctx.save();

        // 1. Zemin Yaygın Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(dx + 5, dy + 22, 58, 22, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // 2. Yere Mıhlama Kontak Gölgesi (Banko Zemin Baza Teması)
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath();
        ctx.ellipse(dx - 5, dy + 33, 50, 14, 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Banko Ön Eteği (Kavisli Beyaz & Gölgeli Alt Yüzey)
        let skirtGrad = ctx.createLinearGradient(dx - 52, dy, dx + 52, dy + 25);
        skirtGrad.addColorStop(0, '#f8fafc');
        skirtGrad.addColorStop(0.5, '#e2e8f0');
        skirtGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = skirtGrad;
        ctx.beginPath();
        ctx.moveTo(dx - 52, dy);
        ctx.quadraticCurveTo(dx - 10, dy + 35, dx + 52, dy + 18);
        ctx.lineTo(dx + 52, dy + 28);
        ctx.quadraticCurveTo(dx - 10, dy + 45, dx - 52, dy + 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        ctx.stroke();

        // Krom Baza Şeridi
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(dx - 52, dy + 9);
        ctx.quadraticCurveTo(dx - 10, dy + 44, dx + 52, dy + 27);
        ctx.stroke();

        // Banko Üst Tabla (Bézier Kavisli Oval Parlak Beyaz Tabla)
        let deskTopGrad = ctx.createLinearGradient(dx - 52, dy - 15, dx + 52, dy + 18);
        deskTopGrad.addColorStop(0, '#ffffff');
        deskTopGrad.addColorStop(0.7, '#f1f5f9');
        deskTopGrad.addColorStop(1, '#cbd5e1');
        ctx.fillStyle = deskTopGrad;
        ctx.beginPath();
        ctx.moveTo(dx - 52, dy);
        ctx.quadraticCurveTo(dx - 10, dy - 18, dx + 52, dy + 5);
        ctx.quadraticCurveTo(dx + 56, dy + 12, dx + 52, dy + 18);
        ctx.quadraticCurveTo(dx - 10, dy + 35, dx - 52, dy);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Üzerindeki İnce Monitör & POS Cihazı
        // Monitör
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(dx + 5, dy - 14, 18, 14);
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1.0; ctx.strokeRect(dx + 5, dy - 14, 18, 14);
        ctx.fillStyle = "#cbd5e1"; ctx.fillRect(dx + 13, dy, 2, 4);
        // Monitör ekran içi grafik
        ctx.fillStyle = "#0284c7"; ctx.fillRect(dx + 7, dy - 12, 14, 10);
        ctx.fillStyle = "#facc15"; ctx.fillRect(dx + 9, dy - 8, 10, 2);

        // Klavye / POS Terminali
        ctx.fillStyle = "#334155";
        ctx.beginPath(); ctx.ellipse(dx + 13, dy + 7, 8, 3.5, 0.2, 0, Math.PI * 2); ctx.fill();

        // 3. Masada Lüks Seramik Vazoda Beyaz Orkide (Minimalist Dekor)
        const vx = dx - 38, vy = dy - 6;
        // Mini vazo gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath(); ctx.ellipse(vx, vy + 4, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
        // Beyaz silindirik porselen vazo
        let vaseGrad = ctx.createLinearGradient(vx - 3, vy, vx + 3, vy);
        vaseGrad.addColorStop(0, '#f8fafc');
        vaseGrad.addColorStop(0.6, '#e2e8f0');
        vaseGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = vaseGrad;
        ctx.fillRect(vx - 3, vy - 6, 6, 9);
        // İnce yeşil orkide sapı
        ctx.strokeStyle = "#15803d";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(vx, vy - 6);
        ctx.quadraticCurveTo(vx - 2, vy - 16, vx - 1, vy - 24);
        ctx.stroke();
        // Zarif beyaz orkide çiçekleri (3 taç yaprak)
        const flowers = [{ x: vx - 2, y: vy - 15 }, { x: vx - 1, y: vy - 20 }, { x: vx - 1, y: vy - 25 }];
        flowers.forEach(fl => {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.ellipse(fl.x, fl.y, 3, 2.2, 0.3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#facc15"; // Sarı polen merkezi
            ctx.beginPath(); ctx.arc(fl.x, fl.y, 0.8, 0, Math.PI * 2); ctx.fill();
        });

        // 4. Tavandan Banko Üzerine İnen Minimalist Pirinç Sarkıt Lambalar (Pendant Lights)
        const pendants = [
            { x: dx - 20, yBase: dy - 55, ceilingY: 145 },
            { x: dx + 26, yBase: dy - 42, ceilingY: 168 }
        ];

        pendants.forEach(pd => {
            // İnce altın tel
            ctx.strokeStyle = "rgba(217, 119, 6, 0.75)";
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(pd.x, pd.ceilingY);
            ctx.lineTo(pd.x, pd.yBase - 16);
            ctx.stroke();

            // Pirinç Silindir Gövde (Minimalist Tube)
            let tubeGrad = ctx.createLinearGradient(pd.x - 2.5, pd.yBase - 16, pd.x + 2.5, pd.yBase);
            tubeGrad.addColorStop(0, '#f59e0b');
            tubeGrad.addColorStop(0.5, '#fbbf24');
            tubeGrad.addColorStop(1, '#b45309');
            ctx.fillStyle = tubeGrad;
            ctx.fillRect(pd.x - 2.5, pd.yBase - 16, 5, 16);

            // Alt Işık Halkası
            ctx.fillStyle = "#fef08a";
            ctx.beginPath(); ctx.ellipse(pd.x, pd.yBase, 2.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();

            // Aşağıya Masa Üstüne Vuran Sıcak Işık Huzmesi
            let beamGrad = ctx.createLinearGradient(pd.x, pd.yBase, pd.x, dy);
            beamGrad.addColorStop(0, "rgba(254, 240, 138, 0.35)");
            beamGrad.addColorStop(0.6, "rgba(254, 240, 138, 0.12)");
            beamGrad.addColorStop(1, "rgba(254, 240, 138, 0)");
            ctx.fillStyle = beamGrad;
            ctx.beginPath();
            ctx.moveTo(pd.x - 2.5, pd.yBase);
            ctx.lineTo(pd.x + 2.5, pd.yBase);
            ctx.lineTo(pd.x + 18, dy + 2);
            ctx.lineTo(pd.x - 18, dy + 2);
            ctx.closePath();
            ctx.fill();
        });

        ctx.restore();
    }

    /**
     * Hasır Sepet
     */
    function drawWickerBasket(ctx, bx, by) {
        ctx.save();
        // 1. Zemin Yaygın Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath(); ctx.ellipse(bx, by + 10, 11, 5, 0, 0, Math.PI * 2); ctx.fill();
        // 2. Yere Mıhlama Kontak Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath(); ctx.ellipse(bx, by + 10, 7, 3, 0, 0, Math.PI * 2); ctx.fill();

        let wickerGrad = ctx.createLinearGradient(bx - 8, by - 6, bx + 8, by + 10);
        wickerGrad.addColorStop(0, '#d97706');
        wickerGrad.addColorStop(0.5, '#b45309');
        wickerGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = wickerGrad;
        ctx.beginPath();
        ctx.ellipse(bx, by + 8, 8, 4, 0, 0, Math.PI);
        ctx.lineTo(bx - 10, by - 4);
        ctx.ellipse(bx, by - 4, 10, 5, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(254, 243, 199, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(bx, by + 2, 9, 0.2, Math.PI - 0.2);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Bordo Saksıdaki Tropik Salon Bitkisi
     */
    function drawPottedPlant(ctx, px, py) {
        ctx.save();
        // 1. Zemin Yaygın Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath(); ctx.ellipse(px, py + 14, 14, 6, 0, 0, Math.PI * 2); ctx.fill();
        // 2. Yere Mıhlama Kontak Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath(); ctx.ellipse(px, py + 14, 9, 3.5, 0, 0, Math.PI * 2); ctx.fill();

        // Bordo Parlak Kübik Saksı
        ctx.fillStyle = "#881337";
        ctx.beginPath();
        ctx.moveTo(px - 11, py); ctx.lineTo(px + 11, py - 4); ctx.lineTo(px + 9, py + 11); ctx.lineTo(px - 9, py + 15);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#be123c"; ctx.lineWidth = 1.2; ctx.stroke();

        // Tropik Geniş Palmiye / Eğrelti Yaprakları
        const leafAngles = [-0.65, -0.25, 0.25, 0.7, -1.0, 1.1];
        leafAngles.forEach((ang) => {
            ctx.save();
            ctx.translate(px, py - 2);
            ctx.rotate(ang);
            let leafGrad = ctx.createLinearGradient(0, 0, 0, -28);
            leafGrad.addColorStop(0, '#064e3b');
            leafGrad.addColorStop(0.6, '#047857');
            leafGrad.addColorStop(1, '#10b981');
            ctx.fillStyle = leafGrad;
            ctx.beginPath();
            ctx.ellipse(0, -15, 6, 16, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,255,255,0.2)";
            ctx.lineWidth = 0.6;
            ctx.stroke();
            ctx.restore();
        });
        ctx.restore();
    }

    /**
     * Dönen Altıgen Gözlük Standı Kulesi
     */
    function drawHexagonalTower(ctx, tx, ty, scale = 1.0) {
        ctx.save();
        ctx.translate(tx, ty);
        if (scale !== 1.0) ctx.scale(scale, scale);

        // 1. Zemin Derinlik & Yaygın Gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath(); ctx.ellipse(0, 16, 20, 10, 0, 0, Math.PI * 2); ctx.fill();

        // 2. Yere Mıhlama Kontak Gölgesi (Zemine Tam Temas Ambient Occlusion)
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath(); ctx.ellipse(0, 20, 16, 6, 0, 0, Math.PI * 2); ctx.fill();

        // 3D Metalik Krom Silindirik Baza (Pedestal Rim)
        ctx.fillStyle = "#64748b"; // Taban alt derinlik gölgesi
        ctx.beginPath();
        ctx.moveTo(-15, 12);
        ctx.quadraticCurveTo(0, 19, 15, 12);
        ctx.lineTo(15, 15.5);
        ctx.quadraticCurveTo(0, 22.5, -15, 15.5);
        ctx.closePath();
        ctx.fill();

        // Üst Parlak Krom Plaka
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath(); ctx.ellipse(0, 12, 15, 7, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.0; ctx.stroke();

        // Beyaz Altıgen Prizma Gövde
        // Sol Yüz (Işıklı Açık Gri)
        ctx.fillStyle = "#f1f5f9";
        ctx.beginPath();
        ctx.moveTo(-13, 8); ctx.lineTo(0, 14); ctx.lineTo(0, -44); ctx.lineTo(-13, -50);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 0.8; ctx.stroke();

        // Sağ Yüz (Işıklı Beyaz)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, 14); ctx.lineTo(13, 8); ctx.lineTo(13, -50); ctx.lineTo(0, -44);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"; ctx.lineWidth = 0.8; ctx.stroke();

        // Üst Ayna Kapağı
        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.moveTo(0, -44); ctx.lineTo(13, -50); ctx.lineTo(0, -56); ctx.lineTo(-13, -50);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.stroke();

        // Yüzeylerde Sıralı Renkli Gözlükler
        [-36, -24, -12, 0].forEach((gy, idx) => {
            let col1 = ['#e11d48', '#0ea5e9', '#10b981', '#f59e0b'][idx];
            let col2 = ['#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][idx];
            drawDetailedSunglasses(ctx, -6, gy, 'wayfarer', col1, col1, 0.7);
            drawDetailedSunglasses(ctx, 6, gy + 3, 'aviator', col2, col2, 0.7);
        });

        ctx.restore();
    }

    /**
     * Kademeli Cam Ön Teşhir Masası (Blue Tiered Glass Table)
     */
    function drawTieredGlassIsland(ctx, gx, gy) {
        ctx.save();
        // 1. Zemin Yaygın Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath(); ctx.ellipse(gx, gy + 15, 38, 17, 0.1, 0, Math.PI * 2); ctx.fill();
        // 2. Krom Ayak Kontak Gölgeleri (Yere Mıhlama)
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.beginPath(); ctx.ellipse(gx - 28, gy + 15, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(gx + 28, gy + 15, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(gx, gy + 19, 4, 2, 0, 0, Math.PI * 2); ctx.fill();

        // Krom Ayaklar
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(gx - 28, gy + 4); ctx.lineTo(gx - 28, gy + 15);
        ctx.moveTo(gx + 28, gy + 4); ctx.lineTo(gx + 28, gy + 15);
        ctx.moveTo(gx, gy + 10); ctx.lineTo(gx, gy + 19);
        ctx.stroke();

        // Alt Cam Katman (İzometrik Cam Karo)
        ctx.fillStyle = "rgba(56, 189, 248, 0.45)";
        ctx.beginPath();
        ctx.moveTo(gx, gy - 10); ctx.lineTo(gx + 34, gy + 4); ctx.lineTo(gx, gy + 16); ctx.lineTo(gx - 34, gy + 4);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.4; ctx.stroke();

        // Üst Cam Katman (Daha Küçük Yükseltilmiş Podyum)
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath(); ctx.ellipse(gx, gy - 2, 8, 4, 0, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "rgba(56, 189, 248, 0.65)";
        ctx.beginPath();
        ctx.moveTo(gx, gy - 18); ctx.lineTo(gx + 22, gy - 9); ctx.lineTo(gx, gy); ctx.lineTo(gx - 22, gy - 9);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.4; ctx.stroke();

        // Tepe Ahşap Tabela & Gözlük Yuvaları
        ctx.fillStyle = "#78350f";
        ctx.fillRect(gx - 12, gy - 27, 24, 7);
        ctx.fillStyle = "#facc15"; ctx.font = "bold 5px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("OPTİK", gx, gy - 22);

        // Masadaki Popüler Gözlükler
        drawDetailedSunglasses(ctx, gx - 14, gy + 4, 'wayfarer', '#dc2626', '#dc2626', 0.8);
        drawDetailedSunglasses(ctx, gx + 14, gy + 4, 'aviator', '#0f172a', '#0f172a', 0.8);
        drawDetailedSunglasses(ctx, gx, gy - 9, 'cateye', '#22c55e', '#22c55e', 0.8);

        ctx.restore();
    }

    /**
     * Danışma & Deneme Masası + Bordo Puf
     */
    function drawVanityConsultationTable(ctx, vx, vy) {
        ctx.save();

        // 1. Oval Cam Masa Yaygın Gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath(); ctx.ellipse(vx, vy + 13, 40, 17, 0.2, 0, Math.PI * 2); ctx.fill();
        // Krom Ayak Kontak Gölgeleri (Yere Mıhlama)
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.beginPath(); ctx.ellipse(vx - 24, vy + 16, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(vx + 24, vy + 16, 4, 2, 0, 0, Math.PI * 2); ctx.fill();

        // Krom Ayaklar
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(vx - 24, vy + 5); ctx.lineTo(vx - 24, vy + 16);
        ctx.moveTo(vx + 24, vy + 5); ctx.lineTo(vx + 24, vy + 16);
        ctx.stroke();

        // Cam Yüzey
        ctx.fillStyle = "rgba(56, 189, 248, 0.42)";
        ctx.beginPath();
        ctx.ellipse(vx, vy, 38, 15, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Masa Üstü Döner El Aynası (Vanity Mirror)
        ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(vx + 8, vy); ctx.lineTo(vx + 8, vy - 11); ctx.stroke();
        ctx.fillStyle = "rgba(224, 242, 254, 0.9)";
        ctx.beginPath(); ctx.ellipse(vx + 8, vy - 17, 7, 9, 0.1, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 1.4; ctx.stroke();

        // Masa üstü minik gözlük
        drawDetailedSunglasses(ctx, vx - 10, vy - 2, 'wayfarer', '#ea580c', '#ea580c', 0.75);

        // 2. Bordo Kadife Puf (OPTIKA_SEATS[2] x: 672, y: 395)
        const pufX = OPTIKA_SEATS[2].x, pufY = OPTIKA_SEATS[2].y;
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath(); ctx.ellipse(pufX, pufY + 9, 16, 8, 0, 0, Math.PI * 2); ctx.fill();
        // Puf Yere Mıhlama Kontak Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        ctx.beginPath(); ctx.ellipse(pufX, pufY + 8, 12, 5, 0, 0, Math.PI * 2); ctx.fill();

        // Altın Metalik Baza Çemberi
        ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.ellipse(pufX, pufY + 7, 13, 6, 0, 0, Math.PI * 2); ctx.stroke();

        // Kadife Puf Silindirik Gövde
        let pufGrad = ctx.createLinearGradient(pufX - 14, pufY - 10, pufX + 14, pufY + 6);
        pufGrad.addColorStop(0, '#be123c');
        pufGrad.addColorStop(0.5, '#9f1239');
        pufGrad.addColorStop(1, '#4c0519');
        ctx.fillStyle = pufGrad;
        ctx.beginPath();
        ctx.ellipse(pufX, pufY + 5, 13, 6.5, 0, 0, Math.PI);
        ctx.lineTo(pufX - 13, pufY - 4);
        ctx.ellipse(pufX, pufY - 4, 13, 6.5, 0, Math.PI, 0, true);
        ctx.closePath();
        ctx.fill();

        // Kadife Üst Bombe Yüzey
        let pufTopGrad = ctx.createLinearGradient(pufX - 13, pufY - 8, pufX + 13, pufY - 2);
        pufTopGrad.addColorStop(0, '#fb7185');
        pufTopGrad.addColorStop(1, '#be123c');
        ctx.fillStyle = pufTopGrad;
        ctx.beginPath();
        ctx.ellipse(pufX, pufY - 4, 13, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#fda4af"; ctx.lineWidth = 0.9; ctx.stroke();

        // Puf dikiş düğmesi
        ctx.fillStyle = "#4c0519";
        ctx.beginPath(); ctx.arc(pufX, pufY - 4, 1.4, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    /**
     * Barcelona Koltuğu (Mies van der Rohe Siyah Kapitone Deri & Krom X-Ray Ayak)
     */
    function drawBarcelonaChair(ctx, cx, cy, facing = 'down-right') {
        ctx.save();
        ctx.translate(cx, cy);
        if (facing === 'down-left') {
            ctx.scale(-1, 1);
        }

        // 1. Zemin Yaygın Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(2, 15, 24, 10, 0.2, 0, Math.PI * 2);
        ctx.fill();
        // 2. Krom Ayak Kontak Gölgeleri (Yere Mıhlama)
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.beginPath(); ctx.ellipse(-15, 15, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(14, 16.5, 4, 2, 0, 0, Math.PI * 2); ctx.fill();

        // 2. Krom X-Ayaklar (Mies van der Rohe Çift Kavisli Metal Ayaklar)
        ctx.strokeStyle = "#f8fafc";
        ctx.lineWidth = 2.6;
        ctx.lineCap = "round";
        // Ön bacak kavisi
        ctx.beginPath();
        ctx.moveTo(-16, 2);
        ctx.quadraticCurveTo(-6, 17, 15, 16);
        ctx.stroke();
        // Arka bacak kavisi
        ctx.beginPath();
        ctx.moveTo(13, 2);
        ctx.quadraticCurveTo(1, 17, -15, 14);
        ctx.stroke();

        // 3. Eğimli Kapitone Sırtlık (Tufted Backrest)
        let backGrad = ctx.createLinearGradient(-18, -20, 14, 0);
        backGrad.addColorStop(0, '#334155');
        backGrad.addColorStop(0.5, '#1e293b');
        backGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = backGrad;
        ctx.beginPath();
        ctx.roundRect(-18, -26, 20, 24, 4);
        ctx.fill();
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.0; ctx.stroke();

        // Sırt Kapitone Çapraz Dikişleri
        ctx.strokeStyle = "rgba(0, 0, 0, 0.65)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(-18, -20); ctx.lineTo(-2, -8);
        ctx.moveTo(-18, -10); ctx.lineTo(-2, -22);
        ctx.stroke();
        // Kapitone düğmeleri
        ctx.fillStyle = "#020617";
        ctx.beginPath(); ctx.arc(-10, -15, 1.4, 0, Math.PI * 2); ctx.fill();

        // 4. Kalın Kapitone Oturma Minderi (Seat Cushion)
        let seatGrad = ctx.createLinearGradient(-16, 0, 18, 12);
        seatGrad.addColorStop(0, '#334155');
        seatGrad.addColorStop(0.4, '#1e293b');
        seatGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = seatGrad;
        ctx.beginPath();
        ctx.roundRect(-16, -2, 28, 12, [4, 5, 4, 3]);
        ctx.fill();
        ctx.strokeStyle = "#475569"; ctx.lineWidth = 1.0; ctx.stroke();

        // Koltuk Ön Eteği
        ctx.fillStyle = "#020617";
        ctx.fillRect(-16, 6, 28, 4);

        // Minder Kapitone Dikiş Çizgisi
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(-5, 0); ctx.lineTo(-5, 8);
        ctx.moveTo(7, 0); ctx.lineTo(7, 8);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Kaldırım Tipi A-Tabela (A-Frame Sidewalk Signboard)
     */
    function drawASignboard(ctx, ax, ay) {
        ctx.save();
        // 1. Yaygın Gölge
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath(); ctx.ellipse(ax, ay + 12, 15, 7, 0.2, 0, Math.PI * 2); ctx.fill();
        // 2. Ahşap Ayak Kontak Gölgeleri (Yere Mıhlama)
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.beginPath(); ctx.ellipse(ax - 10, ay + 12, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(ax + 10, ay + 10, 3, 1.5, 0, 0, Math.PI * 2); ctx.fill();

        // Ahşap Ayaklar
        ctx.strokeStyle = "#78350f"; ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(ax - 10, ay + 12); ctx.lineTo(ax, ay - 15); ctx.lineTo(ax + 10, ay + 10);
        ctx.stroke();

        // Siyah Yazı Tahtası
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.moveTo(ax - 9, ay + 8); ctx.lineTo(ax - 2, ay - 13); ctx.lineTo(ax + 9, ay - 9); ctx.lineTo(ax + 4, ay + 6);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = "#d97706"; ctx.lineWidth = 1.2; ctx.stroke();

        // Tebeşir Yazıları
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 6px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("OPTİK", ax, ay - 4);
        ctx.fillStyle = "#ffffff";
        ctx.font = "5px sans-serif";
        ctx.fillText("%50 İNDİRİM", ax, ay + 2);

        ctx.restore();
    }

    /**
     * YÜKSEK DETAYLI TASARIM GÖZLÜK ÇİZİCİ
     * Frame: wayfarer, aviator, cateye, round, visor
     */
    function drawDetailedSunglasses(ctx, x, y, style = 'wayfarer', frameColor = '#0f172a', lensColor = 'rgba(2, 132, 199, 0.85)', scale = 1.0) {
        ctx.save();
        ctx.translate(x, y);
        if (scale !== 1.0) ctx.scale(scale, scale);

        ctx.strokeStyle = frameColor;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        if (style === 'aviator') {
            // Damla Model Pilot Gözlüğü
            ctx.fillStyle = lensColor;
            // Sol Damla
            ctx.beginPath();
            ctx.moveTo(-8, -4); ctx.lineTo(-2, -4);
            ctx.quadraticCurveTo(-1, 3, -5, 4);
            ctx.quadraticCurveTo(-9, 3, -8, -4);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            // Sağ Damla
            ctx.beginPath();
            ctx.moveTo(2, -4); ctx.lineTo(8, -4);
            ctx.quadraticCurveTo(9, 3, 5, 4);
            ctx.quadraticCurveTo(1, 3, 2, -4);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            // Çift Üst Kaş Barı
            ctx.beginPath();
            ctx.moveTo(-8, -5); ctx.lineTo(8, -5);
            ctx.moveTo(-2, -3); ctx.lineTo(2, -3);
            ctx.stroke();
        } else if (style === 'cateye') {
            // Kedi Gözü Vintage
            ctx.fillStyle = lensColor;
            // Sol Kanat
            ctx.beginPath();
            ctx.moveTo(-10, -5); ctx.lineTo(-2, -3); ctx.lineTo(-4, 3); ctx.lineTo(-8, 2);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            // Sağ Kanat
            ctx.beginPath();
            ctx.moveTo(10, -5); ctx.lineTo(2, -3); ctx.lineTo(4, 3); ctx.lineTo(8, 2);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            // Orta Köprü
            ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(2, -2); ctx.stroke();
        } else if (style === 'round') {
            // John Lennon Yuvarlak Tel Çerçeve
            ctx.fillStyle = lensColor;
            ctx.beginPath(); ctx.arc(-5, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc(5, 0, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(-1, -1); ctx.lineTo(1, -1); ctx.stroke();
        } else if (style === 'visor') {
            // Fütüristik Tek Parça Neon Vizör
            ctx.fillStyle = lensColor;
            ctx.beginPath();
            ctx.roundRect(-9, -3.5, 18, 7, 2);
            ctx.fill(); ctx.stroke();
            // Neon Işık Hattı
            ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(-7, -0.5); ctx.lineTo(7, -0.5); ctx.stroke();
        } else {
            // Klasik Kalın Çerçeve Wayfarer
            ctx.fillStyle = lensColor;
            // Sol Cam
            ctx.beginPath();
            ctx.roundRect(-8, -4, 6, 6, [2, 1, 2, 2]);
            ctx.fill(); ctx.stroke();
            // Sağ Cam
            ctx.beginPath();
            ctx.roundRect(2, -4, 6, 6, [1, 2, 2, 2]);
            ctx.fill(); ctx.stroke();
            // Orta Köprü
            ctx.beginPath(); ctx.moveTo(-2, -2); ctx.lineTo(2, -2); ctx.stroke();
            // Yan Kulakçıklar
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(-8, -3); ctx.lineTo(-11, -4);
            ctx.moveTo(8, -3); ctx.lineTo(11, -4);
            ctx.stroke();
        }

        // Cam Parlama Çizgisi ✨
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-6, -2); ctx.lineTo(-4, 0);
        ctx.moveTo(4, -2); ctx.lineTo(6, 0);
        ctx.stroke();

        ctx.restore();
    }

    function isCurrentlyInOptik() {
        let cr = (typeof window.currentRoom !== 'undefined' && window.currentRoom) 
            ? window.currentRoom 
            : ((typeof currentRoom !== 'undefined') ? currentRoom : '');
        return (cr === 'optik' || cr === 'optika');
    }

    /**
     * 2. STATİK DİORAMA ARKA PLANI (main.js 2567 çağrısı)
     */
    function drawOptikaEnvironment(ctx, now) {
        if (!ctx) return;
        now = now || Date.now();

        // 1. Zemin ve Statik Diorama Odasını Tuvale Çiz (Önbellekli / Doğrudan)
        if (typeof bgCache !== 'undefined' && typeof canvas !== 'undefined' && canvas) {
            let bgKey = (typeof currentRoom !== 'undefined' && currentRoom === 'optik') ? 'optik' : 'optika';
            let bg = bgCache.getCanvas(bgKey, canvas.width, canvas.height);
            ctx.drawImage(bg, 0, 0);
        } else if (typeof canvas !== 'undefined' && canvas) {
            renderStaticOptikaTo(ctx, canvas.width, canvas.height);
        }
    }

    /**
     * 2.1. DİNAMİK Y-SORTING DERİNLİK KUYRUĞU (Mobilyalar + Kenan + Oyuncular)
     * 2.5D İzometrik Derinlik: Karakter standın arkasına geçtiğinde stand karakteri örter;
     * önüne geçtiğinde ise karakter standın önünde görünür.
     * Kenan bankonun arkasındadır; banko Kenan'ın alt gövdesini kapatır.
     * (main.js 2980 çağrısı)
     */
    // Sıfır Garbage Collection (Zero-GC) Statik Mobilya Kuyruğu ve Dinamik Havuz
    const _optikaStaticFurniture = [
        { type: 'reception_desk', sortY: 420, draw: (c) => drawCurvedReceptionDesk(c, OPTIKA_KENAN.deskX, OPTIKA_KENAN.deskY) },
        { type: 'potted_plant', sortY: 318, draw: (c) => drawPottedPlant(c, 435, 305) },
        { type: 'hex_tower_back', sortY: 288, draw: (c) => drawHexagonalTower(c, 480, 275, 0.95) },
        { type: 'hex_tower_left', sortY: 508, draw: (c) => drawHexagonalTower(c, 430, 492, 1.1) },
        { type: 'hex_tower_right', sortY: 446, draw: (c) => drawHexagonalTower(c, 770, 430, 1.1) },
        { type: 'glass_island', sortY: 530, draw: (c) => drawTieredGlassIsland(c, 540, 515) },
        { type: 'vanity_table', sortY: 388, draw: (c) => drawVanityConsultationTable(c, 640, 375) },
        { type: 'chair_left', sortY: 419, draw: (c) => drawBarcelonaChair(c, OPTIKA_SEATS[0].x, OPTIKA_SEATS[0].y, 'down-right') },
        { type: 'chair_right', sortY: 399, draw: (c) => drawBarcelonaChair(c, OPTIKA_SEATS[1].x, OPTIKA_SEATS[1].y, 'down-left') }
    ];
    const _optikaSortQueue = [];
    const _optikaPlayerSlots = [];
    const _optikaKenanSlot = {
        type: 'npc_kenan',
        sortY: 377,
        draw: (c, time) => drawOptikaKenanNPC(c, OPTIKA_KENAN.x, OPTIKA_KENAN.y, time)
    };

    function drawOptikaForegroundAndPlayers(ctx, now, playerSortPool) {
        if (!ctx) return;
        now = now || Date.now();

        _optikaSortQueue.length = 0;

        // 1. Statik Mobilyaları Havuzdan Ekle (Sıfır Tahsis)
        for (let i = 0; i < _optikaStaticFurniture.length; i++) {
            _optikaSortQueue.push(_optikaStaticFurniture[i]);
        }

        // 2. Optik Kenan NPC (Sıfır Tahsis)
        _optikaSortQueue.push(_optikaKenanSlot);

        // 3. OYUNCULAR (Players - Reusable Slots ile Sıfır-GC Derinlik Sıralaması)
        let slotIdx = 0;
        let pool = (playerSortPool && Array.isArray(playerSortPool) && playerSortPool.length > 0) ? playerSortPool : null;
        if (pool) {
            for (let i = 0; i < pool.length; i++) {
                let item = pool[i];
                if (!item || !item.p) continue;
                let playerBaseY = item.y !== undefined ? item.y : item.p.y;
                let sortY = playerBaseY + 21;
                if (item.p.action === 'sitting' || item.p.isSitting) sortY -= 6;

                let slot = _optikaPlayerSlots[slotIdx];
                if (!slot) {
                    slot = {
                        type: 'player',
                        sortY: 0,
                        p: null,
                        id: null,
                        draw: function(c) {
                            let drawFn = (typeof drawAnimatedPlayer === 'function') 
                                ? drawAnimatedPlayer 
                                : (window.drawAnimatedPlayer || null);
                            if (drawFn && this.p) drawFn(this.p, this.id);
                        }
                    };
                    _optikaPlayerSlots[slotIdx] = slot;
                }
                slot.sortY = sortY;
                slot.p = item.p;
                slot.id = item.id;
                _optikaSortQueue.push(slot);
                slotIdx++;
            }
        } else if (typeof window.players !== 'undefined') {
            for (let id in window.players) {
                let p = window.players[id];
                if (!p) continue;
                let sortY = p.y + 21;
                if (p.action === 'sitting' || p.isSitting) sortY -= 6;

                let slot = _optikaPlayerSlots[slotIdx];
                if (!slot) {
                    slot = {
                        type: 'player',
                        sortY: 0,
                        p: null,
                        id: null,
                        draw: function(c) {
                            let drawFn = (typeof drawAnimatedPlayer === 'function') 
                                ? drawAnimatedPlayer 
                                : (window.drawAnimatedPlayer || null);
                            if (drawFn && this.p) drawFn(this.p, this.id);
                        }
                    };
                    _optikaPlayerSlots[slotIdx] = slot;
                }
                slot.sortY = sortY;
                slot.p = p;
                slot.id = id;
                _optikaSortQueue.push(slot);
                slotIdx++;
            }
        }

        // 4. KUYRUĞU Y-KOORDİNATINA GÖRE SIRALA (2.5D KUSURSUZ DERİNLİK)
        _optikaSortQueue.sort((a, b) => a.sortY - b.sortY);

        // 5. TÜM NESNELERİ VE OYUNCULARI DERİNLİK SIRASIYLA ÇİZ
        for (let i = 0; i < _optikaSortQueue.length; i++) {
            _optikaSortQueue[i].draw(ctx, now);
        }

        // 6. EN ÜST KATMAN: ETKİLEŞİM İPUÇLARI & SANALİKA MAVİ KONUŞMA BALONU
        drawOptikaInteractionPrompts(ctx, now);
    }

    /**
     * Optika Kenan NPC Çizimi
     */
    function drawOptikaKenanNPC(ctx, nx, ny, now) {
        ctx.save();
        const breathY = Math.sin(now / 500) * 1.0;

        // Gövde (Mavi Klasik Gömlek & Kravat)
        ctx.fillStyle = "#2563eb";
        ctx.beginPath();
        ctx.roundRect(nx - 9, ny - 16 + breathY, 18, 19, 3);
        ctx.fill();

        // Beyaz Yaka
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(nx - 6, ny - 16 + breathY);
        ctx.lineTo(nx, ny - 10 + breathY);
        ctx.lineTo(nx + 6, ny - 16 + breathY);
        ctx.closePath();
        ctx.fill();

        // Sarı / Altın Kravat
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(nx - 2, ny - 10 + breathY);
        ctx.lineTo(nx + 2, ny - 10 + breathY);
        ctx.lineTo(nx + 2.5, ny - 2 + breathY);
        ctx.lineTo(nx, ny + 1 + breathY);
        ctx.lineTo(nx - 2.5, ny - 2 + breathY);
        ctx.closePath();
        ctx.fill();

        // Kafa Tabanı
        ctx.fillStyle = "#fed7aa";
        ctx.beginPath();
        ctx.arc(nx, ny - 24 + breathY, 9, 0, Math.PI * 2);
        ctx.fill();

        // Havalı Kahverengi Dikenli Saçlar
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(nx, ny - 26 + breathY, 9.5, Math.PI, Math.PI * 2);
        ctx.lineTo(nx + 9.5, ny - 24 + breathY);
        ctx.lineTo(nx + 7.5, ny - 22 + breathY);
        ctx.lineTo(nx - 7.5, ny - 22 + breathY);
        ctx.lineTo(nx - 9.5, ny - 24 + breathY);
        ctx.closePath();
        ctx.fill();

        // Meşhur Sarı Camlı Altın Çerçeveli Güneş Gözlüğü (Kenan'ın İmzası!)
        drawDetailedSunglasses(ctx, nx, ny - 24 + breathY, 'wayfarer', '#d97706', 'rgba(250, 204, 21, 0.95)', 1.05);

        // Gülümseme
        ctx.strokeStyle = "#854d0e";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(nx, ny - 19 + breathY, 2.8, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // İsimlik & Rozet
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.roundRect(nx - 36, ny - 45 + breathY, 72, 17, 4);
        ctx.fill();
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 1; ctx.stroke();

        ctx.fillStyle = "#facc15";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Optik Kenan", nx, ny - 36 + breathY);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "8px sans-serif";
        ctx.fillText("Gözlük Danışmanı", nx, ny - 47 + breathY);

        ctx.restore();
    }

    /**
     * Etkileşim İpuçları (Interaction Prompts & Sanalika Speech Bubbles)
     */
    /**
     * Etkileşim İpuçları (Sanalika Açık Mavi Konuşma Balonu & E Tuşu)
     */
    function drawOptikaInteractionPrompts(ctx, now) {
        ctx.save();
        const myP = (typeof myId !== 'undefined' && typeof players !== 'undefined') ? players[myId] : null;
        const distKenan = myP ? Math.hypot(myP.x - OPTIKA_KENAN.x, myP.y - OPTIKA_KENAN.y) : 60;

        // Kenan'a yakınken konuşma balonu açılır
        if (distKenan < 150) {
            const bx = OPTIKA_KENAN.x + 35, by = OPTIKA_KENAN.y - 82;
            ctx.save();

            // Sanalika İmzalı Turkuaz/Mavi Konuşma Balonu
            ctx.fillStyle = "#e0f2fe";
            ctx.beginPath();
            ctx.roundRect(bx - 105, by - 26, 210, 42, 9);
            ctx.fill();
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 2.2;
            ctx.stroke();

            // Balon kuyruğu (Kenan'ın başına doğru uzanır)
            ctx.fillStyle = "#e0f2fe";
            ctx.beginPath();
            ctx.moveTo(bx - 30, by + 16);
            ctx.lineTo(bx - 16, by + 16);
            ctx.lineTo(bx - 36, by + 28);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#0284c7";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(bx - 30, by + 16); ctx.lineTo(bx - 36, by + 28); ctx.lineTo(bx - 16, by + 16);
            ctx.stroke();

            // Balon metni
            ctx.fillStyle = "#dc2626";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("Optik Kenan:", bx - 95, by - 9);

            ctx.fillStyle = "#0f172a";
            ctx.font = "11px sans-serif";
            ctx.fillText("Karlı havada güneş gözlüğü", bx - 16, by - 9);
            ctx.fillText("ile gezerim :) En havalı modeller burada!", bx - 95, by + 8);

            // E Tuşu Butonu
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.roundRect(bx - 60, by + 28, 120, 20, 5);
            ctx.fill();
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 1.2; ctx.stroke();
            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🕶️ Kataloğu Aç", bx, by + 42);

            ctx.restore();
        }

        ctx.restore();
    }

    function checkOptikaCollision(x, y) {
        // ========================================================
        // 3D KATI MODEL FİZİĞİ: AYAK İZDÜŞÜMLÜ MİNKOWSKİ GEOMETRİSİ
        // Karakterin dünyadaki gerçek ayak basma noktası:
        // fx = x (yatay merkez), fy = y + 21 (ayak tabanı)
        // ========================================================
        const fx = x;
        const fy = y + 21;

        // 1. Diorama Zemin Dışına Çıkış Yasağı (2:1 Eşkenar Dörtgen Sınırları)
        const fL = DIORAMA.floorLeft;
        const fR = DIORAMA.floorRight;
        const fB = DIORAMA.floorBack;
        const fF = DIORAMA.floorFront;

        // Eşik Çıkış Kapısı (x: 630..750, fy: 480..570 - Tam Paspas Alanı)
        const isNearDoor = (fx >= 630 && fx <= 750 && fy >= 480 && fy <= 570);
        if (isNearDoor) return false;

        // Sol Arka Duvar Sınırı (fB: 500, 255 -> fL: 150, 430)
        if (fy < -0.5 * (fx - fB.x) + fB.y + 12) return true;

        // Sağ Arka Duvar Sınırı (fB: 500, 255 -> fR: 850, 430)
        if (fy < 0.5 * (fx - fB.x) + fB.y + 12) return true;

        // Sol Ön Zemin Kenarı (fL: 150, 430 -> fF: 500, 605)
        if (fy > 0.5 * (fx - fL.x) + fL.y - 8) return true;

        // Sağ Ön Zemin Kenarı (fR: 850, 430 -> fF: 500, 605)
        if (!isNearDoor && fy > -0.5 * (fx - fR.x) + fR.y - 8) return true;

        // ========================================================
        // 2. 3D KATI MODELLER (AYAK İZDÜŞÜMLÜ MASİF ÇARPIŞMA ENGELLERİ)
        // ========================================================

        // A) Resepsiyon Bankosu Masif Tabanı (fx: 292..414, fy: 366..422)
        if (fx >= 292 && fx <= 414 && fy >= 366 && fy <= 422) return true;
        // Banko içi kabin (Optik Kenan'ın arkası koruma alanı)
        if (fx >= 307 && fx <= 377 && fy >= 341 && fy <= 371) return true;

        // B) DÖNEN ALTIGEN GÖZLÜK KULELERİ (3D İZOMETRİK SİLİNDİRİK KATI MODELLER)
        // 1. Sağ Altıgen Kule (Taşınan 1. Kule - A-Tabela Yeri: tx: 770, ty: 430, scale: 1.1)
        // Taban merkezi: (770, 446), Minkowski silindir hacmi: rx: 24, ry: 12 (Ön: 458, Arka: 434)
        if ((Math.pow(fx - 770, 2) / (24 * 24) + Math.pow(fy - 446, 2) / (12 * 12)) <= 1.0) return true;

        // 2. Sol Ön Altıgen Kule (Masanın önünü açmak için sağa çekilmiş: tx: 430, ty: 492, scale: 1.1)
        // Taban merkezi: (430, 508), Minkowski silindir hacmi: rx: 24, ry: 12 (Ön: 520, Arka: 496)
        if ((Math.pow(fx - 430, 2) / (24 * 24) + Math.pow(fy - 508, 2) / (12 * 12)) <= 1.0) return true;

        // 3. Arka Altıgen Kule (tx: 480, ty: 275, scale: 0.95)
        // Taban merkezi: (480, 288), Minkowski silindir hacmi: rx: 21, ry: 10.5 (Ön: 298.5, Arka: 277.5)
        if ((Math.pow(fx - 480, 2) / (21 * 21) + Math.pow(fy - 288, 2) / (10.5 * 10.5)) <= 1.0) return true;

        // C) Kademeli Cam Ön Teşhir Adası (Merkez: 540, 530, rx: 36, ry: 17)
        if ((Math.pow(fx - 540, 2) / (36 * 36) + Math.pow(fy - 530, 2) / (17 * 17)) <= 1.0) return true;

        // D) Danışma ve Deneme Masası (Merkez: 635, 388, rx: 36, ry: 17)
        if ((Math.pow(fx - 635, 2) / (36 * 36) + Math.pow(fy - 388, 2) / (17 * 17)) <= 1.0) return true;

        // E) Bordo Kadife Puf (Merkez: 672, 400, rx: 19, ry: 10)
        if ((Math.pow(fx - 672, 2) / (19 * 19) + Math.pow(fy - 400, 2) / (10 * 10)) <= 1.0) return true;

        // G) Bordo Saksı Bitkisi (Merkez: 435, 318, rx: 16, ry: 8)
        if ((Math.pow(fx - 435, 2) / (16 * 16) + Math.pow(fy - 318, 2) / (8 * 8)) <= 1.0) return true;

        // H) Barcelona Koltukları
        // Sol koltuk (Masanın solunda: x: 285, y: 405 -> Taban: fx: 265..305, fy: 409..431)
        if (fx >= 265 && fx <= 305 && fy >= 409 && fy <= 431) return true;
        // Sağ koltuk (Masanın sağında: x: 440, y: 385 -> Taban: fx: 420..460, fy: 389..411)
        if (fx >= 420 && fx <= 460 && fy >= 389 && fy <= 411) return true;



        return false;
    }


    function handleOptikaClick(x, y) {
        // 1. Kenan NPC'sine veya bankoya tıklandı mı?
        if (Math.hypot(x - OPTIKA_KENAN.x, y - OPTIKA_KENAN.y) < 45 || Math.hypot(x - OPTIKA_KENAN.deskX, y - OPTIKA_KENAN.deskY) < 45) {
            openOptikaShopUI();
            return true;
        }

        // 2. Gözlük Standlarına veya Cam Teşhir Adasına tıklandı mı? (Kataloğu Aç)
        const isClickOnTower = (cx, cy, tx, ty) => Math.abs(cx - tx) <= 30 && cy >= (ty - 105) && cy <= (ty + 22);
        if (isClickOnTower(x, y, 480, 275) || isClickOnTower(x, y, 430, 492) || isClickOnTower(x, y, 770, 430) || Math.hypot(x - 540, y - 515) < 45 || Math.hypot(x - 640, y - 375) < 45) {
            openOptikaShopUI();
            return true;
        }

        // 3. Barcelona koltuklarına veya pufe tıklandı mı? (Oturma)
        for (let seat of OPTIKA_SEATS) {
            if (Math.hypot(x - seat.x, y - seat.y) < 26) {
                if (typeof window.walkToAndSit === 'function') {
                    window.walkToAndSit(seat);
                    return true;
                } else if (typeof window.sitOnSpecificSeat === 'function') {
                    window.sitOnSpecificSeat(seat);
                    return true;
                } else if (typeof window.requestSitOnSeat === 'function') {
                    window.requestSitOnSeat(seat);
                    return true;
                }
            }
        }

        // 4. Çıkış Kapısı Eşiğine tıklandı mı?
        if (Math.hypot(x - 690, y - 505) < 38) {
            if (typeof changeRoom === 'function') {
                changeRoom('avm_kat1', { x: 660, y: 240 });
                return true;
            }
        }

        return false;
    }

    /**
     * 5. OPTİKA GÖZLÜK MAĞAZASI MODALI (Eyewear Store UI)
     */
    
    /**
     * 5. OPTİKA GÖZLÜK BUTİĞİ — CANLI 360° DENEME SALONU (LIVE TRY-ON EXPERIENCE)
     */
    function openOptikaShopUI() {
        let existingModal = document.getElementById('optika-shop-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // 8 Özel Tasarım Model Kataloğu
        const EYEWEAR_COLLECTION = [
            {
                id: 'sunglasses_retro',
                name: 'Sanalika Retro Wayfarer',
                sub: 'Klasik kalın asetat siyah çerçeve & füme degrade cam',
                price: 50,
                color: '#0f172a',
                icon: '🕶️',
                badge: 'KLASİK İKONİK'
            },
            {
                id: 'sunglasses_aviator',
                name: 'Matrix Krom Aviator',
                sub: 'İnce çift köprülü titanyum çerçeve & kobalt mavi ayna cam',
                price: 75,
                color: '#0284c7',
                icon: '🕶️',
                badge: 'PREMIUM TİTANYUM'
            },
            {
                id: 'sunglasses_cateye',
                name: 'Vintage Kedi Gözü',
                sub: 'Sivri kanatlı bordo çerçeve, altın perçin & pembe degrade cam',
                price: 60,
                color: '#dc2626',
                icon: '👓',
                badge: 'FEMİNEN VINTAGE'
            },
            {
                id: 'sunglasses_cyber',
                name: 'Neon Siber Vizör 2077',
                sub: 'Fütüristik tek parça kavisli vizör, elektrik mavisi parlama',
                price: 100,
                color: '#00f3ff',
                icon: '🥽',
                badge: 'FÜTÜRİSTİK 2077'
            },
            {
                id: 'sunglasses_lennon',
                name: 'John Lennon Yuvarlak',
                sub: 'Kusursuz yuvarlak altın tel çerçeve & amber vintage cam',
                price: 80,
                color: '#facc15',
                icon: '🧐',
                badge: 'RETRO AKUSTİK'
            },
            {
                id: 'sunglasses_polar',
                name: 'Buz Mavisi Polarize Sport',
                sub: 'Aerodinamik kavisli spor çerçeve & polarize ayna lens',
                price: 45,
                color: '#38bdf8',
                icon: '🕶️',
                badge: 'POLARİZE SPOR'
            },
            {
                id: 'sunglasses_star',
                name: 'Rockstar Neon Yıldız',
                sub: '5 köşeli parlak yıldız çerçeveler & festival pembe camlar',
                price: 70,
                color: '#ec4899',
                icon: '⭐',
                badge: 'FESTİVAL ROCKSTAR'
            },
            {
                id: 'sunglasses_pixel',
                name: 'Thug Life 8-Bit Piksel',
                sub: 'Basamaklı pikselli siyah bloklar & beyaz glint yansımaları',
                price: 90,
                color: '#0f172a',
                icon: '🕶️',
                badge: 'EFSANEVİ 8-BIT'
            }
        ];

        // Başlangıç Seçimi: Karakterin mevcut gözlüğü veya ilk model
        let currentEquipped = (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.face) ? myAvatar.face : 'none';
        let selectedItem = EYEWEAR_COLLECTION.find(g => g.id === currentEquipped) || EYEWEAR_COLLECTION[0];

        // 360° Açı Yönetimi: 8 Açı Döngüsü
        const ANGLES = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
        const ANGLE_LABELS = {
            'down': 'Tam Ön (Front)',
            'down-right': '3/4 Ön Sağ (Diagonal)',
            'right': 'Sağ Profil (Right)',
            'up-right': '3/4 Arka Sağ',
            'up': 'Tam Arka (Back)',
            'up-left': '3/4 Arka Sol',
            'left': 'Sol Profil (Left)',
            'down-left': '3/4 Ön Sol (Diagonal)'
        };
        let angleIdx = 0; // 'down' (Ön)
        let isBustZoom = true; // Yüz / Büst yakın çekimi varsayılan

        const modal = document.createElement('div');
        modal.id = 'optika-shop-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 860px;
            max-width: 96vw;
            height: 560px;
            max-height: 94vh;
            background: linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%);
            border: 1px solid rgba(56, 189, 248, 0.4);
            border-radius: 16px;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(56, 189, 248, 0.25);
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            user-select: none;
        `;

        // Kullanıcının Mevcut Bakiyesi ve Envanteri (Varyant & Bütünlük Korumalı)
        const userMoney = (typeof window.money !== 'undefined' ? window.money : (typeof myMoney !== 'undefined' ? myMoney : 1000));
        function isItemOwned(itemId) {
            const match = (list) => Array.isArray(list) && list.some(x => 
                x === itemId || 
                x === 'faces_' + itemId || 
                x.startsWith('faces_' + itemId + '__') || 
                x.startsWith(itemId + '__')
            );
            let inv = (typeof window.myInventory !== 'undefined' && window.myInventory) || (typeof inventory !== 'undefined' ? inventory : []);
            if (match(inv)) return true;
            if (typeof userData !== 'undefined' && userData && match(userData.inventory)) return true;
            return false;
        }

        modal.innerHTML = `
            <!-- Üst Başlık Barı -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.25);">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #0284c7, #38bdf8); display: flex; align-items: center; justify-content: center; font-size: 20px; box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);">🕶️</div>
                    <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <h3 style="margin: 0; color: #facc15; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">OPTİK BUTİK — CANLI DENEME SALONU</h3>
                            <span style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-size: 10px; font-weight: bold; padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.3);">360° LIVE TRY-ON</span>
                        </div>
                        <p style="margin: 2px 0 0; color: #94a3b8; font-size: 11px;">Optik Kenan Özel Koleksiyonu • Canlı Manken Üzerinde Anında Dene & Gardırobuna Ekle</p>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 14px;">
                    <div style="background: rgba(250, 204, 21, 0.12); border: 1px solid rgba(250, 204, 21, 0.35); padding: 5px 12px; border-radius: 20px; font-size: 12px; color: #facc15; font-weight: bold; display: flex; align-items: center; gap: 6px;">
                        <span>💰 Bakiye:</span>
                        <span id="optika-user-balance">${userMoney} TL</span>
                    </div>
                    <button id="optika-close-btn" style="background: rgba(255,255,255,0.08); border: none; color: #94a3b8; font-size: 18px; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">✕</button>
                </div>
            </div>

            <!-- Ana Çift Sütunlu Gövde -->
            <div style="display: flex; flex: 1; overflow: hidden;">
                
                <!-- SOL SÜTUN: 360° CANLI MANKEN / AVATAR ÖNİZLEME PODYUMU -->
                <div style="width: 320px; border-right: 1px solid rgba(255,255,255,0.1); background: radial-gradient(circle at 50% 40%, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 1) 100%); display: flex; flex-direction: column; align-items: center; padding: 14px; box-sizing: border-box; position: relative;">
                    
                    <!-- Zoom Modu & Açı Başlığı -->
                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 8px;">
                        <span id="optika-angle-label" style="font-size: 11px; color: #38bdf8; font-weight: 600; background: rgba(56, 189, 248, 0.1); padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.2);">${ANGLE_LABELS[ANGLES[angleIdx]]}</span>
                        <button id="optika-zoom-toggle" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #cbd5e1; font-size: 11px; padding: 3px 8px; border-radius: 6px; cursor: pointer;">🔍 Büst / Yüz</button>
                    </div>

                    <!-- Canlı Avatar Tuvali -->
                    <div style="position: relative; width: 280px; height: 260px; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                        <canvas id="optikaTryonCanvas" width="280" height="260" style="display: block;"></canvas>
                        
                        <!-- Tuval Üzeri Döndürme Ok Butonları -->
                        <button id="optika-rot-left" title="Sola Döndür (Sol Ok)" style="position: absolute; left: 6px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">⟲</button>
                        <button id="optika-rot-right" title="Sağa Döndür (Sağ Ok)" style="position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border-radius: 50%; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(56, 189, 248, 0.4); color: #38bdf8; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">⟳</button>
                    </div>

                    <!-- Hızlı Açı Hapları -->
                    <div style="display: flex; gap: 4px; margin-top: 8px; width: 100%; justify-content: center;">
                        <button class="optika-angle-btn" data-angle="0" style="flex: 1; padding: 4px; font-size: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 4px; cursor: pointer;">Ön</button>
                        <button class="optika-angle-btn" data-angle="1" style="flex: 1; padding: 4px; font-size: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 4px; cursor: pointer;">3/4 Sağ</button>
                        <button class="optika-angle-btn" data-angle="2" style="flex: 1; padding: 4px; font-size: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 4px; cursor: pointer;">Sağ Profil</button>
                        <button class="optika-angle-btn" data-angle="6" style="flex: 1; padding: 4px; font-size: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 4px; cursor: pointer;">Sol Profil</button>
                        <button class="optika-angle-btn" data-angle="4" style="flex: 1; padding: 4px; font-size: 10px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 4px; cursor: pointer;">Arka</button>
                    </div>

                    <!-- Canlı Seçim Bilgisi & Eylem Butonu -->
                    <div style="margin-top: 10px; width: 100%; display: flex; flex-direction: column; gap: 6px;">
                        <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 6px 10px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Denenen Model</div>
                            <div id="optika-preview-title" style="font-size: 13px; font-weight: bold; color: #facc15; margin-top: 2px;">${selectedItem.name}</div>
                        </div>

                        <button id="optika-action-btn" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #0284c7, #2563eb); border: none; border-radius: 8px; color: #ffffff; font-weight: bold; font-size: 13px; cursor: pointer; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px;">
                            <span>🛒 Satın Al & Gardıroba Ekle (${selectedItem.price} TL)</span>
                        </button>

                        <button id="optika-unequip-btn" style="width: 100%; padding: 6px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; color: #94a3b8; font-size: 11px; cursor: pointer; transition: all 0.2s;">
                            ❌ Gözlüğü Çıkar (Orijinal Hal)
                        </button>
                    </div>
                </div>

                <!-- SAĞ SÜTUN: GÖZLÜK KATALOĞU (8 TASARIM MODEL) -->
                <div style="flex: 1; display: flex; flex-direction: column; background: rgba(15, 23, 42, 0.5); overflow: hidden;">
                    
                    <div style="padding: 10px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">KOLEKSİYON LİSTESİ (8 ÖZEL MODEL)</span>
                        <span style="font-size: 11px; color: #38bdf8;">Tıkla & Anında Canlı Dene</span>
                    </div>

                    <div id="optika-catalog-grid" style="flex: 1; overflow-y: auto; padding: 12px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; align-content: start;">
                        <!-- Modeller Dinamik Olarak Buraya Eklenir -->
                    </div>

                    <!-- Alt Bilgilendirme -->
                    <div style="padding: 10px 16px; background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.08); font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 14px;">💡</span>
                        <span>Satın aldığınız gözlükler kalıcı olarak <b>Gardırobunuza</b> eklenir. Evinizden veya menüden dilediğiniz zaman tekrar takabilirsiniz.</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // --- SAĞ SÜTUN KATALOG KARTLARINI ÇİZDİRME ---
        const grid = document.getElementById('optika-catalog-grid');
        function renderCatalogItems() {
            grid.innerHTML = '';
            EYEWEAR_COLLECTION.forEach(item => {
                const isSelected = (selectedItem.id === item.id);
                const isOwned = isItemOwned(item.id);
                const isEquipped = (currentEquipped === item.id);

                const card = document.createElement('div');
                card.className = 'optika-catalog-card';
                card.style.cssText = `
                    background: ${isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)'};
                    border: 1px solid ${isSelected ? '#38bdf8' : (isOwned ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)')};
                    border-radius: 10px;
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                `;

                let statusBadge = '';
                if (isEquipped) {
                    statusBadge = '<span style="position: absolute; top: 8px; right: 8px; background: #0284c7; color: #fff; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">GİYİLİYOR</span>';
                } else if (isOwned) {
                    statusBadge = '<span style="position: absolute; top: 8px; right: 8px; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">SAHİPSİN</span>';
                }

                card.innerHTML = `
                    ${statusBadge}
                    <div style="display: flex; gap: 10px; align-items: flex-start;">
                        <div style="width: 44px; height: 44px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; font-size: 24px; border: 1px solid rgba(255,255,255,0.1);">
                            ${item.icon}
                        </div>
                        <div style="flex: 1; padding-right: 40px;">
                            <div style="font-size: 9px; color: #38bdf8; font-weight: bold; text-transform: uppercase;">${item.badge}</div>
                            <div style="font-size: 13px; font-weight: bold; color: #f8fafc; margin-top: 1px;">${item.name}</div>
                            <div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px; line-height: 1.3;">${item.sub}</div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06);">
                        <span style="font-size: 13px; font-weight: 800; color: #facc15;">${item.price} TL</span>
                        <div style="display: flex; gap: 6px;">
                            <button class="optika-btn-try" style="padding: 4px 8px; font-size: 11px; background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; border-radius: 5px; cursor: pointer; font-weight: 600;">👁️ Dene</button>
                            <button class="optika-btn-buy" style="padding: 4px 10px; font-size: 11px; background: ${isOwned ? '#059669' : '#2563eb'}; border: none; color: #ffffff; border-radius: 5px; cursor: pointer; font-weight: bold;">${isOwned ? 'Tak' : 'Al'}</button>
                        </div>
                    </div>
                `;

                // Tıklandığında Canlı Dene
                card.addEventListener('click', () => {
                    selectEyewear(item);
                });

                card.querySelector('.optika-btn-try').addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectEyewear(item);
                });

                card.querySelector('.optika-btn-buy').addEventListener('click', (e) => {
                    e.stopPropagation();
                    selectEyewear(item);
                    executePurchaseOrEquip(item);
                });

                grid.appendChild(card);
            });
        }

        function selectEyewear(item) {
            selectedItem = item;
            document.getElementById('optika-preview-title').innerText = item.name;

            const isOwned = isItemOwned(item.id);
            const actBtn = document.getElementById('optika-action-btn');
            if (isOwned) {
                actBtn.innerHTML = '<span>👕 Zaten Gardırobunuzda — Hemen Tak</span>';
                actBtn.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            } else {
                actBtn.innerHTML = `<span>🛒 Satın Al & Gardıroba Ekle (${item.price} TL)</span>`;
                actBtn.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
            }

            renderCatalogItems();
        }

        // Satın Alma ve Kuşanma Mantığı
        function executePurchaseOrEquip(item) {
            const isOwned = isItemOwned(item.id);

            // 1. Sunucuya Satın Alma ve Kayıt Emri
            if (typeof socket !== 'undefined' && socket && socket.emit) {
                socket.emit('buyWardrobeItem', {
                    category: 'faces',
                    id: item.id,
                    color: item.color,
                    faceColor: item.color
                });
            }

            // 2. Yerel Karakter State'lerini Anında Güncelle
            currentEquipped = item.id;
            if (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) {
                players[myId].face = item.id;
                players[myId].faceColor = item.color;
            }
            if (typeof myAvatar !== 'undefined' && myAvatar) {
                myAvatar.face = item.id;
                myAvatar.faceColor = item.color;
            }

            // 3. Yerel Envantere Ekle (Anında UI güncellensin - Dizi ve Nesne Uyumlu)
            let invKey = 'faces_' + item.id;
            if (typeof window.myInventory !== 'undefined' && window.myInventory) {
                if (Array.isArray(window.myInventory)) {
                    if (!window.myInventory.includes(invKey)) window.myInventory.push(invKey);
                } else if (typeof window.myInventory === 'object') {
                    if (!window.myInventory.faces) window.myInventory.faces = [];
                    if (!window.myInventory.faces.includes(item.id)) window.myInventory.faces.push(item.id);
                }
            }
            if (typeof myInventory !== 'undefined' && myInventory) {
                if (Array.isArray(myInventory)) {
                    if (!myInventory.includes(invKey)) myInventory.push(invKey);
                } else if (typeof myInventory === 'object') {
                    if (!myInventory.faces) myInventory.faces = [];
                    if (!myInventory.faces.includes(item.id)) myInventory.faces.push(item.id);
                }
            }
            if (typeof userData !== 'undefined' && userData && userData.inventory) {
                if (Array.isArray(userData.inventory) && !userData.inventory.includes(invKey)) {
                    userData.inventory.push(invKey);
                }
            }

            // Bildirim
            if (typeof window.showGameNotification === 'function') {
                if (isOwned) {
                    window.showGameNotification(`🕶️ ${item.name} takıldı!`);
                } else {
                    window.showGameNotification(`✨ ${item.name} satın alındı ve gardırobunuza eklendi!`);
                }
            }

            selectEyewear(item);
        }

        // Aksiyon butonu tıklama
        document.getElementById('optika-action-btn').addEventListener('click', () => {
            if (selectedItem) {
                executePurchaseOrEquip(selectedItem);
            }
        });

        // Gözlüğü Çıkar Butonu
        document.getElementById('optika-unequip-btn').addEventListener('click', () => {
            currentEquipped = 'none';
            if (typeof socket !== 'undefined' && socket && socket.emit) {
                socket.emit('buyWardrobeItem', { category: 'faces', id: 'none' });
            }
            if (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) {
                players[myId].face = 'none';
                players[myId].faceColor = 'original';
            }
            if (typeof myAvatar !== 'undefined' && myAvatar) {
                myAvatar.face = 'none';
                myAvatar.faceColor = 'original';
            }
            if (typeof window.showGameNotification === 'function') {
                window.showGameNotification('🕶️ Gözlük çıkarıldı.');
            }
            renderCatalogItems();
        });

        // 360° Döndürme Olayları
        function setAngle(newIdx) {
            angleIdx = (newIdx + ANGLES.length) % ANGLES.length;
            const f = ANGLES[angleIdx];
            document.getElementById('optika-angle-label').innerText = ANGLE_LABELS[f];
        }

        document.getElementById('optika-rot-left').addEventListener('click', () => setAngle(angleIdx - 1));
        document.getElementById('optika-rot-right').addEventListener('click', () => setAngle(angleIdx + 1));

        modal.querySelectorAll('.optika-angle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                let targetA = parseInt(btn.getAttribute('data-angle'), 10);
                setAngle(targetA);
            });
        });

        // Zoom Modu Toggle
        const zoomBtn = document.getElementById('optika-zoom-toggle');
        zoomBtn.addEventListener('click', () => {
            isBustZoom = !isBustZoom;
            zoomBtn.innerText = isBustZoom ? '🔍 Büst / Yüz' : '🧍 Tam Boy';
        });

        // Klavye Ok Tuşları ile Döndürme
        const keyHandler = (e) => {
            if (e.key === 'ArrowLeft') {
                setAngle(angleIdx - 1);
            } else if (e.key === 'ArrowRight') {
                setAngle(angleIdx + 1);
            } else if (e.key === 'Escape') {
                closeModal();
            }
        };
        window.addEventListener('keydown', keyHandler);

        // --- 360° CANLI MANKEN ÇİZİM DÖNGÜSÜ (requestAnimationFrame) ---
        const tryCanvas = document.getElementById('optikaTryonCanvas');
        const tctx = tryCanvas ? tryCanvas.getContext('2d') : null;
        let animFrameId = null;

        function renderTryonMannequin() {
            if (!document.getElementById('optika-shop-modal')) {
                window.removeEventListener('keydown', keyHandler);
                return;
            }

            if (tctx && tryCanvas) {
                tctx.clearRect(0, 0, tryCanvas.width, tryCanvas.height);
                const cX = tryCanvas.width / 2;
                const cY = tryCanvas.height / 2;

                // 1. Işıltılı Mağaza Podyumu / Teşhir Halkası
                tctx.save();
                let pulse = Math.sin(Date.now() / 320) * 2;
                if (!isBustZoom) {
                    tctx.fillStyle = 'rgba(56, 189, 248, 0.09)';
                    tctx.beginPath();
                    tctx.ellipse(cX, cY + 55, 65, 18, 0, 0, Math.PI * 2);
                    tctx.fill();

                    tctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
                    tctx.lineWidth = 1.5;
                    tctx.stroke();

                    tctx.fillStyle = 'rgba(250, 204, 21, 0.12)';
                    tctx.beginPath();
                    tctx.ellipse(cX, cY + 55, 42, 12, 0, 0, Math.PI * 2);
                    tctx.fill();
                } else {
                    let grad = tctx.createRadialGradient(cX, cY - 15, 20, cX, cY - 15, 85);
                    grad.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
                    grad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                    tctx.fillStyle = grad;
                    tctx.beginPath();
                    tctx.arc(cX, cY - 15, 85, 0, Math.PI * 2);
                    tctx.fill();
                }
                tctx.restore();

                // 2. Canlı Avatar Objesini Hazırla
                let baseAv = (typeof myAvatar !== 'undefined' && myAvatar) ? myAvatar : {};
                let activeAv = Object.assign({}, baseAv);
                
                // Seçilen gözlüğü giydir
                activeAv.face = selectedItem ? selectedItem.id : 'none';
                activeAv.faceColor = selectedItem ? selectedItem.color : 'original';

                const facing = ANGLES[angleIdx];
                const cycle = Date.now() / 250;
                const isK2 = (activeAv.model === 'karakter_2' || (typeof window !== 'undefined' && window.selectedModelId === 'karakter_2'));

                tctx.save();
                if (isBustZoom) {
                    // Büst / Yüz Yakın Çekim Modu (Kamerayı kafaya ve gözlüğe odaklar)
                    tctx.translate(cX, cY + 52);
                    tctx.scale(3.4, 3.4);
                } else {
                    // Tam Boy Manken Modu
                    tctx.translate(cX, cY + 20);
                    tctx.scale(1.65, 1.65);
                }

                // Hafif nefes alma salınımı
                let idleBob = Math.sin(Date.now() / 300) * 1.2;
                tctx.translate(0, idleBob);

                // Ayak tabanı yumuşak gölgesi
                tctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                tctx.beginPath();
                tctx.ellipse(0, 22, 12, 5, 0, 0, Math.PI * 2);
                tctx.fill();

                // Çizim Motorunu Çağır
                if (isK2 && typeof Karakter2Renderer !== 'undefined') {
                    Karakter2Renderer.draw(tctx, 0, 0, activeAv, facing, false, 0, cycle, false, true);
                } else if (typeof drawClassic2Avatar === 'function') {
                    drawClassic2Avatar(tctx, 0, 0, activeAv, facing, false, 0, cycle, false, true);
                }
                tctx.restore();
            }

            animFrameId = requestAnimationFrame(renderTryonMannequin);
        }

        function closeModal() {
            if (animFrameId) cancelAnimationFrame(animFrameId);
            window.removeEventListener('keydown', keyHandler);
            modal.remove();
        }

        document.getElementById('optika-close-btn').addEventListener('click', closeModal);

        // Başlat
        renderCatalogItems();
        selectEyewear(selectedItem);
        animFrameId = requestAnimationFrame(renderTryonMannequin);
    }

    window.renderStaticOptikaTo = renderStaticOptikaTo;
    window.drawOptikaEnvironment = drawOptikaEnvironment;
    window.drawOptikaForegroundAndPlayers = drawOptikaForegroundAndPlayers;
    window.isCurrentlyInOptik = isCurrentlyInOptik;
    window.checkOptikaCollision = checkOptikaCollision;
    window.handleOptikaClick = handleOptikaClick;
    window.openOptikaShopUI = openOptikaShopUI;
    window.OPTIKA_SEATS = OPTIKA_SEATS;
    window.OPTIKA_KENAN = OPTIKA_KENAN;

    // Canlı Bakiye Güncellemesi (Optik Butiği)
    if (typeof socket !== 'undefined' && socket) {
        socket.on('moneyUpdate', (money) => {
            const amt = (typeof money === 'object' && money !== null && money.money !== undefined) ? money.money : money;
            const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
            window.myMoney = num;
            const balEl = document.getElementById('optika-user-balance');
            if (balEl) balEl.innerText = `${num.toLocaleString('tr-TR')} TL`;
        });
        socket.on('wardrobeUpdate', () => {
            const balEl = document.getElementById('optika-user-balance');
            if (balEl && typeof window.myMoney !== 'undefined') {
                balEl.innerText = `${window.myMoney.toLocaleString('tr-TR')} TL`;
            }
        });
    }
    // Optik takma adları
    window.renderStaticOptikTo = renderStaticOptikaTo;
    window.drawOptikEnvironment = drawOptikaEnvironment;
    window.drawOptikForegroundAndPlayers = drawOptikaForegroundAndPlayers;
    window.checkOptikCollision = checkOptikaCollision;
    window.handleOptikClick = handleOptikaClick;

})(typeof window !== 'undefined' ? window : this);
