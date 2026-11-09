// public/js/renderers/renderIsometricGardenHouse.js
// İzometrik bahçe, veranda ve 3x3 tarla sahnesi
// 2:1 İzometrik Açı Formülleri: isoX = (x - y), isoY = (x + y) / 2 (tileW: 64, tileH: 32)

(function(window) {
    'use strict';

    // 1. İZOMETRİK GEOMETRİ VE KONFİGÜRASYON
    const ISO_CONFIG = {
        canvasWidth: 1000,
        canvasHeight: 625,

        // Ev Taban Prizması (2:1 İzometrik Köşeler)
        house: {
            apexX: 310,     // Ön Merkez Köşe
            apexY: 260,
            leftLen: 160,   // Sol Cephe Uzunluğu (dx = -160, dy = -80)
            rightLen: 170,  // Sağ Cephe Uzunluğu (dx = +170, dy = -85)
            wallHeight: 85, // Duvar Yüksekliği
            roofRidgeHeight: 52, // Çatı Mahya Yüksekliği
            chimney: { x: 385, y: 35, w: 26, h: 48 }
        },

        // Yükseltilmiş Ahşap Veranda (Porch)
        porch: {
            elevation: 12,  // Yerden yükseklik (px)
            // Veranda Zemin Poligonu (Köşeler)
            vertices: [
                { x: 155, y: 195 }, // Arka Sol
                { x: 310, y: 260 }, // Ev Ön Köşesi
                { x: 475, y: 190 }, // Arka Sağ
                { x: 445, y: 255 }, // Ön Sağ
                { x: 330, y: 315 }, // Ön Apex (Merdiven Başı)
                { x: 195, y: 275 }  // Ön Sol
            ],
            // 3 Basamaklı Merdiven
            stairs: {
                topX: 330, topY: 315,
                botX: 330, botY: 345,
                width: 52
            },
            // Sallanan Sandalye Konumu
            rockingChair: { x: 230, y: 250, sortY: 260 },
            // Fenerler
            lanterns: [
                { x: 195, y: 248 }, // Sol Köşe Direği
                { x: 445, y: 228 }  // Sağ Köşe Direği
            ]
        },

        orchard: [
            { x: 555, y: 145, scale: 0.9 },
            { x: 890, y: 155, scale: 1.05 },
            { x: 530, y: 385, scale: 0.95 }
        ],

        // 3x3 İzometrik Tarla (Farm Grid) - Genişletilmiş & Büyütülmüş (tileW: 88, tileH: 44)
        farm: {
            originX: 735,
            originY: 365,
            tileW: 88,
            tileH: 44,
            borderPadding: 14
        },

        // Bahçe Çiti Sınırları
        fence: {
            west: 35,
            north: 65,
            east: 965,
            south: 590,
            gate: { x1: 35, x2: 120, y1: 535, y2: 605 }
        }
    };

    // 9 Parsellik Tarla Durum Matrisi
    let farmPlotsState = [
        { id: 0, row: 0, col: 0, state: 'tilled', crop: null, stage: 0 },
        { id: 1, row: 0, col: 1, state: 'tilled', crop: null, stage: 0 },
        { id: 2, row: 0, col: 2, state: 'tilled', crop: null, stage: 0 },
        { id: 3, row: 1, col: 0, state: 'tilled', crop: null, stage: 0 },
        { id: 4, row: 1, col: 1, state: 'tilled', crop: null, stage: 0 },
        { id: 5, row: 1, col: 2, state: 'tilled', crop: null, stage: 0 },
        { id: 6, row: 2, col: 0, state: 'tilled', crop: null, stage: 0 },
        { id: 7, row: 2, col: 1, state: 'tilled', crop: null, stage: 0 },
        { id: 8, row: 2, col: 2, state: 'tilled', crop: null, stage: 0 }
    ];

    let hoveredPlotIndex = -1;
    let selectedPlotIndex = -1;
    let smokeParticles = [];
    let lastSmokeSpawn = 0;

    // ==============================================================
    // 2. MATEMATİKSEL İZOMETRİK FONKSİYONLAR
    // ==============================================================

    /**
     * Point-in-Diamond (İzometrik Eşkenar Dörtgen İç Kontrolü)
     */
    function isPointInIsometricDiamond(px, py, cx, cy, tileW, tileH) {
        let dx = Math.abs(px - cx);
        let dy = Math.abs(py - cy);
        return (dx / (tileW / 2) + dy / (tileH / 2)) <= 1.0;
    }

    /**
     * Point-in-Polygon (Genel Çokgen İçi Kontrolü)
     */
    function isPointInPolygon(px, py, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            let xi = poly[i].x, yi = poly[i].y;
            let xj = poly[j].x, yj = poly[j].y;
            let intersect = ((yi > py) !== (yj > py)) &&
                (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }

    /**
     * 3x3 Tarla Parsellerinin Ekran Merkezlerini Hesaplar
     */
    function getFarmPlotCenter(row, col) {
        let ox = ISO_CONFIG.farm.originX;
        let oy = ISO_CONFIG.farm.originY;
        let cx = ox + (col - row) * (ISO_CONFIG.farm.tileW / 2);
        let cy = oy + (col + row) * (ISO_CONFIG.farm.tileH / 2);
        return { cx, cy };
    }

    /**
     * Oyuncunun Verandadaki Yükseklik Ofsetini Hesaplar (-12px yükselti)
     */
    function getGardenHouseElevationOffset(px, py) {
        // 1. Veranda Zemininde mi?
        let onPorch = isPointInPolygon(px, py, ISO_CONFIG.porch.vertices);
        if (onPorch) {
            return ISO_CONFIG.porch.elevation; // -12px yukarı kalkar
        }

        // 2. Merdiven Üzerinde mi? (Yumuşak enterpolasyon)
        let st = ISO_CONFIG.porch.stairs;
        if (px >= st.topX - st.width / 2 && px <= st.topX + st.width / 2 && py >= st.topY && py <= st.botY) {
            let ratio = Math.max(0, Math.min(1, (st.botY - py) / (st.botY - st.topY)));
            return Math.round(ratio * ISO_CONFIG.porch.elevation);
        }

        return 0;
    }
    window.getGardenHouseElevationOffset = getGardenHouseElevationOffset;

    // ==============================================================
    // 3. FİZİK & ÇARPIŞMA (COLLISION) TESTİ
    // ==============================================================

    /**
     * Bahçe ve veranda içindeki geçilemez alanları kontrol eder.
     */
    function isGardenHouseCollision(x, y, pW, pH) {
        pW = pW || 20;
        pH = pH || 10;

        let left = x - pW / 2;
        let right = x + pW / 2;
        let top = y - pH;
        let bottom = y + 2;

        // A) Bahçe Dış Çitleri (Sınırlar)
        let f = ISO_CONFIG.fence;
        const withinGateY = top <= f.gate.y2 && bottom >= f.gate.y1;
        const withinGateX = left <= f.gate.x2 && right >= f.gate.x1;
        // Sol çit (Kapı hariç)
        if (left < f.west) {
            if (!withinGateY) return true;
        }
        // Üst çit
        if (top < f.north) return true;
        // Sağ çit
        if (right > f.east) return true;
        // Alt çit (Kapı sol alttadır)
        if (bottom > f.south) {
            if (!withinGateX) return true;
        }

        // B) Merdiven Alanı (Veranda ile Bahçe Arasında Kesintisiz Geçiş Koridoru)
        let st = ISO_CONFIG.porch.stairs;
        let onStairs = (x >= st.topX - st.width / 2 && x <= st.topX + st.width / 2 && y >= st.topY - 6 && y <= st.botY + 8);
        if (onStairs) {
            return false;
        }

        // C) Elma Ağaçları
        for (const tree of ISO_CONFIG.orchard) {
            const dx = Math.abs(x - tree.x);
            const dy = Math.abs(y - tree.y);
            if (dx < 18 * tree.scale + pW / 2 && dy < 10 + pH && (dx / (18 * tree.scale + pW / 2) + dy / (10 + pH)) < 1.35) {
                return true;
            }
        }

        // D) Veranda Yükseltilmiş Ahşap Zemin & Korkuluk Kontrolü
        const halfWidth = pW / 2;
        const footXs = [x - halfWidth, x, x + halfWidth];
        let onPorch = footXs.some(footX => isPointInPolygon(footX, y, ISO_CONFIG.porch.vertices));
        if (onPorch) {
            for (const footX of footXs) {
                const edgeY = footX < st.topX
                    ? 275 + ((315 - 275) / (330 - 195)) * (footX - 195)
                    : 315 - ((315 - 255) / (445 - 330)) * (footX - 330);
                if (footX >= 195 && footX <= 445 && y + 2 >= edgeY - 6) return true;
            }
            return false;
        }

        // E) Bahçe Çimindeyken Veranda Eteklerine Dışarıdan Çarpma (Merdivensiz Tırmanma Engeli)
        if (!onStairs) {
            for (const footX of footXs) {
                if (footX < 190 || footX > 450 || y < 250 || y > 320) continue;
                let edgeY = (footX < st.topX)
                    ? 275 + ((315 - 275) / (330 - 195)) * (footX - 195)
                    : 315 - ((315 - 255) / (445 - 330)) * (footX - 330);
                if (Math.abs(y - edgeY) <= 8) return true;
            }
        }

        return false;
    }
    window.isGardenHouseCollision = isGardenHouseCollision;

    // ==============================================================
    // 4. ÇİZİM: STATİK ZEMİN & BAHÇE TABANI
    // ==============================================================

    /**
     * Zemin Katmanı: Çim, Taş Patika, Çitler ve Tarla Tabanı
     */
    function renderStaticGardenLawn(ctx, width, height) {
        // 1. İzometrik çim zemini
        let lawnGrad = ctx.createLinearGradient(0, 0, width, height);
        lawnGrad.addColorStop(0, '#15803d');
        lawnGrad.addColorStop(0.5, '#16a34a');
        lawnGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = lawnGrad;
        ctx.fillRect(0, 0, width, height);

        // Çim Izgara Dokusu (Subtle 2:1 Isometric Grass Shimmer)
        ctx.strokeStyle = "rgba(34, 197, 94, 0.12)";
        ctx.lineWidth = 1;
        for (let x = -200; x < width + 400; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x + height * 2, height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - height * 2, height);
            ctx.stroke();
        }

        // Minik Çayır Çiçekleri & Çimen Tutamları
        let flowerColors = ['#fef08a', '#f43f5e', '#a855f7', '#38bdf8', '#ffffff'];
        for (let i = 0; i < 40; i++) {
            let fx = (i * 97 + 45) % (width - 80) + 40;
            let fy = (i * 73 + 30) % (height - 120) + 70;
            // Veranda ve tarla alanında çiçeği pas geç
            if (isPointInPolygon(fx, fy, ISO_CONFIG.porch.vertices)) continue;
            if (fx > 620 && fx < 860 && fy > 340 && fy < 500) continue;

            ctx.fillStyle = flowerColors[i % flowerColors.length];
            ctx.beginPath();
            ctx.arc(fx, fy, 2.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#15803d";
            ctx.fillRect(fx - 0.5, fy + 2, 1, 3);
        }

        // 2. Doğal Arduvaz Taş Patika (Stepping Stones)
        drawSteppingStonesPath(ctx);

        // 3. Arka ve Yan Bahçe Çitleri (North & West/East Back)
        drawPicketFence(ctx, width, height, 'back');

        // 4. Veranda Zemin Tabanı ve Yükseltilmiş Gövde
        drawPorchDeckBase(ctx);

        // 5. 3x3 İzometrik Tarla Tabanı ve Ahşap Bordür
        drawFarmPlotGridBase(ctx);
    }

    /**
     * Kıvrımlı Taş Patika (Doğal arduvaz plakaları)
     */
    function drawSteppingStonesPath(ctx) {
        let stones = [
            // Girişten Merdivene
            { x: 75, y: 565, w: 26, h: 14 },
            { x: 105, y: 535, w: 28, h: 15 },
            { x: 140, y: 500, w: 26, h: 14 },
            { x: 180, y: 465, w: 30, h: 16 },
            { x: 220, y: 430, w: 27, h: 14 },
            { x: 265, y: 395, w: 30, h: 15 },
            { x: 305, y: 360, w: 28, h: 15 },
            { x: 330, y: 330, w: 32, h: 16 }, // Merdiven Önü

            // Patika Kavşağından Büyütülmüş Tarlaya Doğru
            { x: 265, y: 440, w: 28, h: 15 },
            { x: 315, y: 460, w: 27, h: 14 },
            { x: 370, y: 470, w: 30, h: 15 },
            { x: 430, y: 475, w: 32, h: 16 },
            { x: 490, y: 470, w: 28, h: 15 },
            { x: 545, y: 460, w: 30, h: 15 },
            { x: 600, y: 448, w: 32, h: 16 },
            { x: 645, y: 432, w: 30, h: 15 }  // Büyütülmüş Tarla Girişi
        ];

        stones.forEach((st, idx) => {
            // Taş Gölgesi
            ctx.fillStyle = "rgba(21, 128, 61, 0.6)";
            ctx.beginPath();
            ctx.ellipse(st.x + 2, st.y + 2, st.w / 2, st.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Taş Gövdesi
            ctx.fillStyle = idx % 2 === 0 ? "#cbd5e1" : "#94a3b8";
            ctx.beginPath();
            ctx.ellipse(st.x, st.y, st.w / 2, st.h / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Taş Üst Işığı & Doğal Çatlak
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.fillStyle = "#f8fafc";
            ctx.beginPath();
            ctx.ellipse(st.x - 3, st.y - 2, st.w / 3.5, st.h / 3.5, 0, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Beyaz Bahçe Çitleri (Picket Fence)
     */
    function drawPicketFence(ctx, width, height, part) {
        let f = ISO_CONFIG.fence;
        ctx.save();

        if (part === 'back') {
            // Kuzey (Arka) Çit
            drawFenceLine(ctx, f.west, f.north, f.east, f.north);
            // Sol Üst Çit
            drawFenceLine(ctx, f.west, f.north, f.west, 280);
            // Sağ Üst Çit
            drawFenceLine(ctx, f.east, f.north, f.east, 350);
        } else if (part === 'front') {
            // Sol Alt Çit (Kapı boşluğu: 35..120 hariç)
            drawFenceLine(ctx, f.west, 280, f.west, f.gate.y1);
            // Güney (Ön) Çit
            drawFenceLine(ctx, f.gate.x2, f.south, f.east, f.south);
            // Sağ Alt Çit
            drawFenceLine(ctx, f.east, 350, f.east, f.south);

            // Giriş Kapısı Ahşap Kemer Direkleri
            ctx.fillStyle = "#78350f";
            ctx.fillRect(f.gate.x1 - 4, f.gate.y1 - 35, 8, 45);
            ctx.fillRect(f.gate.x2 - 4, f.gate.y1 - 35, 8, 45);
            ctx.fillStyle = "#b45309";
            ctx.fillRect(f.gate.x1 - 6, f.gate.y1 - 40, (f.gate.x2 - f.gate.x1) + 12, 8);

            // Kapı Tabelası
            ctx.fillStyle = "#facc15";
            ctx.font = "bold 9px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🏡 BAHÇE GİRİŞİ", (f.gate.x1 + f.gate.x2) / 2, f.gate.y1 - 44);
        }

        ctx.restore();
    }

    function drawFenceLine(ctx, x1, y1, x2, y2) {
        let dist = Math.hypot(x2 - x1, y2 - y1);
        let count = Math.max(1, Math.floor(dist / 14));
        let dx = (x2 - x1) / count;
        let dy = (y2 - y1) / count;

        // Yatay Kirişler
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1 - 8); ctx.lineTo(x2, y2 - 8);
        ctx.moveTo(x1, y1 - 18); ctx.lineTo(x2, y2 - 18);
        ctx.stroke();

        // Dikey Parmaklıklar
        for (let i = 0; i <= count; i++) {
            let px = x1 + i * dx;
            let py = y1 + i * dy;

            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.moveTo(px - 3, py);
            ctx.lineTo(px - 3, py - 22);
            ctx.lineTo(px, py - 26); // Sivri tepe
            ctx.lineTo(px + 3, py - 22);
            ctx.lineTo(px + 3, py);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }

    function drawAppleTree(ctx, tree) {
        const { x, y, scale } = tree;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.beginPath();
        ctx.ellipse(2, 1, 23, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#713f12';
        ctx.fillRect(-5, -31, 10, 32);
        ctx.fillStyle = '#a16207';
        ctx.fillRect(-3, -29, 3, 26);

        const canopy = [
            { x: -13, y: -39, r: 17 },
            { x: 8, y: -43, r: 19 },
            { x: -2, y: -55, r: 17 },
            { x: 18, y: -34, r: 14 }
        ];
        canopy.forEach((part, index) => {
            const gradient = ctx.createRadialGradient(part.x - 5, part.y - 7, 2, part.x, part.y, part.r);
            gradient.addColorStop(0, index % 2 ? '#86efac' : '#4ade80');
            gradient.addColorStop(1, '#15803d');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(part.x, part.y, part.r, 0, Math.PI * 2);
            ctx.fill();
        });

        [[-15, -43], [2, -55], [15, -38], [-3, -32]].forEach(([appleX, appleY]) => {
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(appleX, appleY, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(appleX - 1, appleY - 4, 1, 2);
        });
        ctx.restore();
    }

    /**
     * Yükseltilmiş Ahşap Veranda Tabanı & 3 Basamak
     */
    function drawPorchDeckBase(ctx) {
        let p = ISO_CONFIG.porch;
        let v = p.vertices;

        ctx.save();

        // 1. Veranda Zemin Gölgesi
        ctx.fillStyle = "rgba(15, 23, 42, 0.35)";
        ctx.beginPath();
        ctx.moveTo(v[0].x, v[0].y + p.elevation);
        ctx.lineTo(v[1].x, v[1].y + p.elevation);
        ctx.lineTo(v[2].x, v[2].y + p.elevation);
        ctx.lineTo(v[3].x, v[3].y + p.elevation + 4);
        ctx.lineTo(v[4].x, v[4].y + p.elevation + 6);
        ctx.lineTo(v[5].x, v[5].y + p.elevation + 4);
        ctx.closePath();
        ctx.fill();

        // 2. Veranda Alt Ahşap Etek (12px Elevation Fascia)
        ctx.fillStyle = "#451a03"; // Koyu masif ahşap kiriş
        // Sol Ön Etek
        ctx.beginPath();
        ctx.moveTo(v[5].x, v[5].y);
        ctx.lineTo(v[4].x, v[4].y);
        ctx.lineTo(v[4].x, v[4].y + p.elevation);
        ctx.lineTo(v[5].x, v[5].y + p.elevation);
        ctx.closePath();
        ctx.fill();
        // Sağ Ön Etek
        ctx.fillStyle = "#2d1102"; // Gölge taraf
        ctx.beginPath();
        ctx.moveTo(v[4].x, v[4].y);
        ctx.lineTo(v[3].x, v[3].y);
        ctx.lineTo(v[3].x, v[3].y + p.elevation);
        ctx.lineTo(v[4].x, v[4].y + p.elevation);
        ctx.closePath();
        ctx.fill();

        // 3. Veranda Ahşap Zemin Yüzeyi
        let deckGrad = ctx.createLinearGradient(v[0].x, v[0].y, v[3].x, v[3].y);
        deckGrad.addColorStop(0, '#92400e');
        deckGrad.addColorStop(0.5, '#b45309');
        deckGrad.addColorStop(1, '#854d0e');

        ctx.fillStyle = deckGrad;
        ctx.beginPath();
        ctx.moveTo(v[0].x, v[0].y);
        ctx.lineTo(v[1].x, v[1].y);
        ctx.lineTo(v[2].x, v[2].y);
        ctx.lineTo(v[3].x, v[3].y);
        ctx.lineTo(v[4].x, v[4].y);
        ctx.lineTo(v[5].x, v[5].y);
        ctx.closePath();
        ctx.fill();

        // Ahşap Tahta Derz Çizgileri (2:1 İzometrik Paralel Plankler)
        ctx.strokeStyle = "#713f12";
        ctx.lineWidth = 1.2;
        for (let offset = -80; offset < 220; offset += 14) {
            ctx.beginPath();
            ctx.moveTo(v[0].x + offset, v[0].y + offset / 2);
            ctx.lineTo(v[0].x + offset + 120, v[0].y + offset / 2 - 60);
            ctx.stroke();
        }

        // 4. Ahşap Merdiven Basamakları (3 Basamak, Her biri 4px Yükselir)
        let st = p.stairs;
        let stepCount = 3;
        let stepH = p.elevation / stepCount; // 4px
        let stepD = (st.botY - st.topY) / stepCount; // 10px

        for (let s = 0; s < stepCount; s++) {
            let sy = st.botY - s * stepD;
            let curElev = s * stepH;

            // Basamak basış yüzeyi
            ctx.fillStyle = s === 2 ? "#b45309" : "#92400e";
            ctx.beginPath();
            ctx.moveTo(st.topX - st.width / 2, sy - curElev);
            ctx.lineTo(st.topX + st.width / 2, sy - curElev);
            ctx.lineTo(st.topX + st.width / 2, sy - curElev - stepD);
            ctx.lineTo(st.topX - st.width / 2, sy - curElev - stepD);
            ctx.closePath();
            ctx.fill();

            // Basamak rıhtı (dikey yüzü)
            ctx.fillStyle = "#451a03";
            ctx.fillRect(st.topX - st.width / 2, sy - curElev, st.width, stepH);
        }

        ctx.restore();
    }

    /**
     * 3x3 İzometrik Tarla Tabanı ve Ahşap Bordür
     */
    
    // ==============================================================
    // 4.5 İZOMETRİK BİTKİ EVRE ÇİZİMLERİ (6 EVRE & CANLI ANİMASYONLAR)
    // ==============================================================

    function drawIsometricCrop(ctx, plot, center) {
        if (!plot || plot.state === 'EMPTY') return;

        ctx.save();
        let cx = center.cx;
        let cy = center.cy;
        let now = Date.now();

        if (plot.state === 'SEED') {
            // Küçük nemli toprak tepeciği
            ctx.fillStyle = "#3e1a05";
            ctx.beginPath();
            ctx.ellipse(cx, cy, 14, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // 4 Adet tohum noktası
            ctx.fillStyle = "#ca8a04";
            let seedDots = [
                { dx: -4, dy: -2 },
                { dx: 3, dy: -1 },
                { dx: -1, dy: 2 },
                { dx: 4, dy: 1 }
            ];
            seedDots.forEach(d => {
                ctx.beginPath();
                ctx.arc(cx + d.dx, cy + d.dy, 1.6, 0, Math.PI * 2);
                ctx.fill();
            });

            // Minik yeşil filiz ucu
            ctx.fillStyle = "#4ade80";
            ctx.beginPath();
            ctx.ellipse(cx, cy - 3, 1.8, 3.2, 0.2, 0, Math.PI * 2);
            ctx.fill();

        } else if (plot.state === 'SAPLING_READY') {
            // Fide hazır (Genç yeşil gövde + 3-4 yaprak)
            ctx.strokeStyle = "#16a34a";
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(cx - 2, cy - 10, cx + 1, cy - 20);
            ctx.stroke();

            // Yapraklar
            ctx.fillStyle = "#22c55e";
            ctx.beginPath();
            ctx.ellipse(cx - 6, cy - 12, 6, 3, -0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#4ade80";
            ctx.beginPath();
            ctx.ellipse(cx + 6, cy - 15, 6.5, 3.2, 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#86efac";
            ctx.beginPath();
            ctx.ellipse(cx + 1, cy - 22, 4, 2.2, 0, 0, Math.PI * 2);
            ctx.fill();

            // 10 Dk Ölüm Riski Uyarısı (< 2 dk ise yanıp sönsün)
            let remSec = Math.max(0, Math.floor(((plot.expiresAt || now) - now) / 1000));
            let isUrgent = remSec < 120;
            let showBlink = !isUrgent || (Math.floor(now / 350) % 2 === 0);

            if (showBlink) {
                ctx.font = "bold 14px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText(isUrgent ? "⚠️" : "💧", cx, cy - 28);
            }

        } else if (plot.state === 'FLOWER_GROWING') {
            // Can suyu verilmiş, büyüyen çiçek (Uzun gövde + tomurcuk + ışıltılar)
            ctx.strokeStyle = "#15803d";
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(cx + 3, cy - 14, cx, cy - 28);
            ctx.stroke();

            // Yan yapraklar
            ctx.fillStyle = "#16a34a";
            ctx.beginPath();
            ctx.ellipse(cx - 7, cy - 14, 7, 3.5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 8, cy - 18, 7, 3.5, 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Çiçek Tomurcuğu
            let budColor = (plot.seedType === 'papatya') ? '#facc15' 
                : ((plot.seedType === 'lale') ? '#ea580c' 
                : ((plot.seedType === 'sakayik') ? '#f472b6'
                : ((plot.seedType === 'lavanta') ? '#8b5cf6' 
                : ((plot.seedType === 'orkide') ? '#a855f7' 
                : ((plot.seedType === 'aycicegi') ? '#eab308' : '#e11d48')))));
            ctx.fillStyle = budColor;
            ctx.beginPath();
            ctx.ellipse(cx, cy - 30, 4.5, 7, 0, 0, Math.PI * 2);
            ctx.fill();

            // Yeşil Çanak Yapraklar
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.arc(cx - 2, cy - 26, 2.2, 0, Math.PI * 2);
            ctx.arc(cx + 2, cy - 26, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Su damlası ışıltıları
            ctx.fillStyle = "rgba(56, 189, 248, 0.85)";
            let sparkleY = cy - 15 + Math.sin(now / 200 + plot.id) * 4;
            ctx.beginPath();
            ctx.arc(cx + 5, sparkleY, 1.8, 0, Math.PI * 2);
            ctx.fill();

        } else if (plot.state === 'FLOWER_READY') {
            // Olgun Çiçek Açtı (Sway rüzgar salınımı: Math.sin(now / 300))
            let sway = Math.sin(now / 300 + plot.id * 1.5) * 3.5;
            let flowerX = cx + sway;
            let flowerY = cy - 32;

            // Güçlü yeşil dal
            ctx.strokeStyle = "#15803d";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(cx + sway * 0.4, cy - 16, flowerX, flowerY + 6);
            ctx.stroke();

            // İki geniş yaprak
            ctx.fillStyle = "#16a34a";
            ctx.beginPath();
            ctx.ellipse(cx - 9 + sway * 0.3, cy - 14, 8, 3.5, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(cx + 9 + sway * 0.5, cy - 18, 8, 3.5, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Çiçek Türüne Göre Taç Yapraklar
            if (plot.seedType === 'papatya') {
                // Beyaz Taç Yapraklı Kır Papatyası
                ctx.fillStyle = "#ffffff";
                for (let a = 0; a < 10; a++) {
                    let rad = a * (Math.PI / 5);
                    ctx.beginPath();
                    ctx.ellipse(flowerX + Math.cos(rad) * 8, flowerY + Math.sin(rad) * 8, 4.5, 2.2, rad, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Parlak Altın Tohumluk
                ctx.fillStyle = "#facc15";
                ctx.beginPath();
                ctx.arc(flowerX, flowerY, 4.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ca8a04";
                ctx.lineWidth = 1;
                ctx.stroke();

            } else if (plot.seedType === 'lale') {
                // Sultan Lalesi (Alev Kırmızısı ve Altın Çizgili Kadeh Formu)
                ctx.fillStyle = "#ea580c";
                ctx.beginPath(); ctx.ellipse(flowerX, flowerY, 7.5, 10, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#dc2626";
                ctx.beginPath(); ctx.ellipse(flowerX - 3, flowerY - 1, 5, 9, -0.2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(flowerX + 3, flowerY - 1, 5, 9, 0.2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#facc15"; // Altın alev ucu
                ctx.beginPath(); ctx.moveTo(flowerX, flowerY + 6); ctx.lineTo(flowerX - 2.5, flowerY - 8); ctx.lineTo(flowerX + 2.5, flowerY - 8); ctx.closePath(); ctx.fill();

            } else if (plot.seedType === 'sakayik') {
                // Romantik Katmerli Pembe Şakayık (Geniş İpeksi Pembe Katmanlar & Altın Polenler)
                ctx.fillStyle = "#fbcfe8"; // Açık pembe dış taç yapraklar
                for (let a = 0; a < 8; a++) {
                    let rad = a * (Math.PI / 4);
                    ctx.beginPath();
                    ctx.ellipse(flowerX + Math.cos(rad) * 9, flowerY + Math.sin(rad) * 9, 6.5, 4.5, rad, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = "#f472b6"; // Orta katman canlı pembe
                for (let a = 0; a < 6; a++) {
                    let rad = a * (Math.PI / 3) + 0.3;
                    ctx.beginPath();
                    ctx.ellipse(flowerX + Math.cos(rad) * 5, flowerY + Math.sin(rad) * 5, 5.0, 3.5, rad, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Katmerli iç merkez
                ctx.fillStyle = "#db2777";
                ctx.beginPath(); ctx.arc(flowerX, flowerY, 4.5, 0, Math.PI * 2); ctx.fill();
                // Altın sarısı polen tanecikleri
                ctx.fillStyle = "#fde047";
                ctx.beginPath(); ctx.arc(flowerX - 1, flowerY - 1, 1.8, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(flowerX + 1.5, flowerY + 0.5, 1.4, 0, Math.PI * 2); ctx.fill();

            } else if (plot.seedType === 'lavanta') {
                // Mis Kokulu Dağ Lavantası (Sıralı Mor Başaklar & Mor Parıltılar)
                ctx.strokeStyle = "#6d28d9";
                ctx.lineWidth = 4.2;
                ctx.beginPath(); ctx.moveTo(flowerX, flowerY + 8); ctx.lineTo(flowerX, flowerY - 14); ctx.stroke();
                // Çiçek kümleri
                ctx.fillStyle = "#8b5cf6";
                for (let i = 0; i < 6; i++) {
                    ctx.beginPath();
                    ctx.ellipse(flowerX - 3, flowerY + 6 - i * 3.5, 3.2, 2.2, -0.3, 0, Math.PI * 2);
                    ctx.ellipse(flowerX + 3, flowerY + 6 - i * 3.5, 3.2, 2.2, 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = "#c084fc";
                ctx.beginPath(); ctx.ellipse(flowerX, flowerY - 15, 3.0, 2.2, 0, 0, Math.PI * 2); ctx.fill();

            } else if (plot.seedType === 'orkide') {
                // Mor Kraliyet Orkidesi
                ctx.fillStyle = "#c084fc";
                ctx.beginPath(); ctx.ellipse(flowerX, flowerY - 8, 6.5, 4.5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(flowerX - 7, flowerY + 2, 6, 4, -0.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(flowerX + 7, flowerY + 2, 6, 4, 0.5, 0, Math.PI * 2); ctx.fill();
                // İç Koyu Mor Labellum
                ctx.fillStyle = "#7e22ce";
                ctx.beginPath(); ctx.arc(flowerX, flowerY + 3, 4.5, 0, Math.PI * 2); ctx.fill();
                // Sarı Göz
                ctx.fillStyle = "#fde047";
                ctx.beginPath(); ctx.arc(flowerX, flowerY + 1, 2, 0, Math.PI * 2); ctx.fill();

            } else if (plot.seedType === 'aycicegi') {
                // Dev Güneş Ayçiçeği (Işıl Işıl Altın Yapraklar & Kahverengi Çekirdek Tablası)
                ctx.fillStyle = "#f59e0b";
                for (let a = 0; a < 14; a++) {
                    let rad = a * (Math.PI / 7);
                    ctx.beginPath();
                    ctx.ellipse(flowerX + Math.cos(rad) * 10, flowerY + Math.sin(rad) * 10, 5.5, 2.8, rad, 0, Math.PI * 2);
                    ctx.fill();
                }
                // Dış Halka
                ctx.fillStyle = "#451a03";
                ctx.beginPath(); ctx.arc(flowerX, flowerY, 6.5, 0, Math.PI * 2); ctx.fill();
                // İç Tohum Spiral Noktaları
                ctx.fillStyle = "#78350f";
                ctx.beginPath(); ctx.arc(flowerX, flowerY, 4.0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ca8a04";
                ctx.beginPath(); ctx.arc(flowerX - 1, flowerY - 1, 1.5, 0, Math.PI * 2); ctx.fill();

            } else {
                // Asil Kırmızı Gül (plot.seedType === 'gul' veya varsayılan)
                ctx.fillStyle = "#b91c1c";
                ctx.beginPath(); ctx.arc(flowerX, flowerY, 9, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#dc2626";
                ctx.beginPath(); ctx.arc(flowerX - 2, flowerY - 2, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(flowerX + 2, flowerY - 1, 5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#7f1d1d";
                ctx.beginPath(); ctx.arc(flowerX, flowerY, 3, 0, Math.PI * 2); ctx.fill();
            }

            // Parıldayan Polen Parçacıkları
            ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
            for (let i = 0; i < 3; i++) {
                let px = flowerX + Math.sin(now / 250 + i * 2) * 12;
                let py = flowerY - 10 + Math.cos(now / 300 + i * 2) * 8;
                ctx.beginPath();
                ctx.arc(px, py, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }

            // 15 Dakika Ölüm Riski: Kalan süre < 3 dk ise yanıp sönen saat ikonu
            let remSec = Math.max(0, Math.floor(((plot.expiresAt || now) - now) / 1000));
            if (remSec < 180 && (Math.floor(now / 400) % 2 === 0)) {
                ctx.font = "bold 13px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("⏱️", flowerX, flowerY - 14);
            }

        } else if (plot.state === 'WITHERED') {
            // YANMIŞ / KURUMUŞ TARLA (Acımasız Tarım)
            ctx.strokeStyle = "#44403c";
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.quadraticCurveTo(cx + 8, cy - 8, cx + 12, cy - 14);
            ctx.stroke();

            ctx.fillStyle = "#292524";
            ctx.beginPath(); ctx.ellipse(cx + 6, cy - 6, 4, 1.8, 0.6, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(cx + 12, cy - 14, 3.5, 1.5, 0.9, 0, Math.PI * 2); ctx.fill();

            let flyX = cx + Math.sin(now / 150) * 8;
            let flyY = cy - 16 + Math.cos(now / 180) * 5;
            ctx.fillStyle = "#18181b";
            ctx.beginPath(); ctx.arc(flyX, flyY, 1.2, 0, Math.PI * 2); ctx.fill();

            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🥀", cx, cy - 22);

        } else if (plot.state === 'CLEANING') {
            // Temizleniyor (30 Saniyelik İlerleme Barı)
            let started = (plot.cleaningEndsAt ? (plot.cleaningEndsAt - 30000) : (plot.stageChangedAt || now));
            let elapsed = Math.max(0, now - started);
            let pct = Math.min(1, Math.max(0, elapsed / 30000));

            ctx.fillStyle = "rgba(180, 130, 80, 0.35)";
            let cloudR = 8 + Math.sin(now / 100) * 2;
            ctx.beginPath();
            ctx.arc(cx, cy - 6, cloudR, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🧹", cx, cy - 16);

            let barW = 32;
            let barH = 5;
            let barX = cx - barW / 2;
            let barY = cy - 26;

            ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, 2.5);
            ctx.fill();

            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW * pct, barH, 2.5);
            ctx.fill();
        }

        ctx.restore();
    }

    function syncIsometricFarmState(plots) {
        if (!plots || !Array.isArray(plots)) return;
        plots.forEach((p, idx) => {
            if (farmPlotsState[idx]) {
                farmPlotsState[idx].state = p.state || 'EMPTY';
                farmPlotsState[idx].seedType = p.seedType || null;
                farmPlotsState[idx].plantedAt = p.plantedAt;
                farmPlotsState[idx].stageChangedAt = p.stageChangedAt;
                farmPlotsState[idx].expiresAt = p.expiresAt;
                farmPlotsState[idx].cleaningEndsAt = p.cleaningEndsAt;
                farmPlotsState[idx].hasWater = p.hasWater;
                farmPlotsState[idx].hasFertilizer = p.hasFertilizer;
            }
        });
    }
    window.syncIsometricFarmState = syncIsometricFarmState;

    function drawFarmPlotGridBase(ctx) {
        let f = ISO_CONFIG.farm;
        ctx.save();

        // 1. Dış Ahşap Bordür (Kalas Çerçeve)
        // 4 Köşe:
        let topCorner = getFarmPlotCenter(0, 0); topCorner.cy -= f.tileH / 2;
        let rightCorner = getFarmPlotCenter(0, 2); rightCorner.cx += f.tileW / 2;
        let bottomCorner = getFarmPlotCenter(2, 2); bottomCorner.cy += f.tileH / 2;
        let leftCorner = getFarmPlotCenter(2, 0); leftCorner.cx -= f.tileW / 2;

        let pad = f.borderPadding;

        // Dış Ahşap Kütük Çerçeve
        ctx.fillStyle = "#532e08"; // Kalın ahşap kalas
        ctx.beginPath();
        ctx.moveTo(topCorner.cx, topCorner.cy - pad);
        ctx.lineTo(rightCorner.cx + pad * 2, rightCorner.cy);
        ctx.lineTo(bottomCorner.cx, bottomCorner.cy + pad);
        ctx.lineTo(leftCorner.cx - pad * 2, leftCorner.cy);
        ctx.closePath();
        ctx.fill();

        // İç Toprak Hendek Zemin
        ctx.fillStyle = "#271202";
        ctx.beginPath();
        ctx.moveTo(topCorner.cx, topCorner.cy - 2);
        ctx.lineTo(rightCorner.cx + 2, rightCorner.cy);
        ctx.lineTo(bottomCorner.cx, bottomCorner.cy + 2);
        ctx.lineTo(leftCorner.cx - 2, leftCorner.cy);
        ctx.closePath();
        ctx.fill();

        // Kalas Çerçeve Kenar Vurgusu & Çiviler
        ctx.strokeStyle = "#78350f";
        ctx.lineWidth = 3;
        ctx.stroke();

        // 2. 9 Adet İzometrik Tarla Slotu (Diamonds)
        farmPlotsState.forEach((plot) => {
            let center = getFarmPlotCenter(plot.row, plot.col);
            let isHovered = (plot.id === hoveredPlotIndex);
            let isSelected = (plot.id === selectedPlotIndex);

            // Eşkenar Dörtgen Parsel Çizimi
            ctx.beginPath();
            ctx.moveTo(center.cx, center.cy - f.tileH / 2);
            ctx.lineTo(center.cx + f.tileW / 2, center.cy);
            ctx.lineTo(center.cx, center.cy + f.tileH / 2);
            ctx.lineTo(center.cx - f.tileW / 2, center.cy);
            ctx.closePath();

            // Sürülmüş Verimli Toprak Rengi
            ctx.fillStyle = isHovered ? "#582a08" : (plot.id % 2 === 0 ? "#451a03" : "#381402");
            ctx.fill();

            // Çapa İzleri (Sürülmüş İzometrik Oluklar / Furrows - Büyütülmüş Parsel Dokusu)
            ctx.strokeStyle = "#271202";
            ctx.lineWidth = 1.35;
            for (let furrow = -14; furrow <= 14; furrow += 7) {
                ctx.beginPath();
                ctx.moveTo(center.cx - 24, center.cy + furrow - 12);
                ctx.lineTo(center.cx + 24, center.cy + furrow + 12);
                ctx.stroke();
            }

            // Parsel Ayrım Bordürü
            ctx.strokeStyle = "rgba(120, 53, 15, 0.4)";
            ctx.lineWidth = 1;
            ctx.stroke();

            // İnteraktif Hover / Seçim Çerçevesi (Point-in-Diamond)
            if (isHovered || isSelected) {
                let glowColor = isSelected ? "#22c55e" : "#facc15";
                ctx.strokeStyle = glowColor;
                ctx.lineWidth = isSelected ? 2.8 : 2.0;
                ctx.shadowColor = glowColor;
                ctx.shadowBlur = 8;
                ctx.stroke();
                ctx.shadowBlur = 0; // Sıfırla
            }
        });

        ctx.restore();
    }

    // ==============================================================
    // 5. ÇİZİM: Y-SORTED ENTITIES (AĞAÇLAR, KORKULUKLAR, SANDALYE)
    // ==============================================================

    /**
     * İzometrik Ev Gövdesi ve Çatı (House Body & Roof)
     * Sort Y: Evin ön taban apex koordinatı (260px)
     */
    function drawIsometricHouseBody(ctx) {
        let h = ISO_CONFIG.house;
        ctx.save();

        let leftX = h.apexX - h.leftLen;
        let leftY = h.apexY - h.leftLen / 2;
        let rightX = h.apexX + h.rightLen;
        let rightY = h.apexY - h.rightLen / 2;
        let backX = leftX + h.rightLen;
        let backY = leftY - h.rightLen / 2;

        let H = h.wallHeight;

        // 1. SOL-ÖN DUVAR (Işık Alan Cephe - Sıcak Krem / Taş Doku)
        let leftWallGrad = ctx.createLinearGradient(leftX, leftY, h.apexX, h.apexY);
        leftWallGrad.addColorStop(0, '#f8fafc');
        leftWallGrad.addColorStop(1, '#e2e8f0');

        ctx.fillStyle = leftWallGrad;
        ctx.beginPath();
        ctx.moveTo(leftX, leftY);
        ctx.lineTo(h.apexX, h.apexY);
        ctx.lineTo(h.apexX, h.apexY - H);
        ctx.lineTo(leftX, leftY - H);
        ctx.closePath();
        ctx.fill();

        // Taş / Ahşap Kaplama Derz Çizgileri
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        ctx.lineWidth = 1;
        for (let l = 16; l < H; l += 14) {
            ctx.beginPath();
            ctx.moveTo(leftX, leftY - l);
            ctx.lineTo(h.apexX, h.apexY - l);
            ctx.stroke();
        }

        // 2. SAĞ-ÖN DUVAR (Gölgede Kalan Cephe - Daha Koyu Ton)
        let rightWallGrad = ctx.createLinearGradient(h.apexX, h.apexY, rightX, rightY);
        rightWallGrad.addColorStop(0, '#cbd5e1');
        rightWallGrad.addColorStop(1, '#94a3b8');

        ctx.fillStyle = rightWallGrad;
        ctx.beginPath();
        ctx.moveTo(h.apexX, h.apexY);
        ctx.lineTo(rightX, rightY);
        ctx.lineTo(rightX, rightY - H);
        ctx.lineTo(h.apexX, h.apexY - H);
        ctx.closePath();
        ctx.fill();

        // Gölge Cephe Çizgileri
        ctx.strokeStyle = "rgba(71, 85, 105, 0.35)";
        ctx.lineWidth = 1;
        for (let l = 16; l < H; l += 14) {
            ctx.beginPath();
            ctx.moveTo(h.apexX, h.apexY - l);
            ctx.lineTo(rightX, rightY - l);
            ctx.stroke();
        }

        // 3. KÖŞE AHŞAP KOLON KİRİŞLERİ (#451a03)
        ctx.fillStyle = "#451a03";
        // Sol Kolon
        ctx.fillRect(leftX - 4, leftY - H, 8, H);
        // Merkez Köşe Kolonu (Apex)
        ctx.fillRect(h.apexX - 4, h.apexY - H, 8, H);
        // Sağ Kolon
        ctx.fillRect(rightX - 4, rightY - H, 8, H);

        // 4. PENCERELER (Sol Cephede 2 Adet Çift Kanatlı & Çiçeklik)
        drawCottageWindow(ctx, 205, 155, true);
        drawCottageWindow(ctx, 265, 185, true);

        // 5. GİRİŞ KAPISI (Sağ Cephede Kemerli Ahşap Kapı)
        drawArchedFrontDoor(ctx, 385, 225);

        // 6. ÜÇGEN ALINLIKLI İZOMETRİK KİREMİT ÇATI
        drawIsometricGableRoof(ctx, leftX, leftY, h.apexX, h.apexY, rightX, rightY, backX, backY, H);

        // 7. TAŞ BACA & ANİMASYONLU BACA DUMANI
        drawStoneChimneyAndSmoke(ctx, h.chimney);

        ctx.restore();
    }

    /**
     * Sıcak Sarı Işıklı Pencereler & Çiçeklik
     */
    function drawCottageWindow(ctx, wx, wy, hasFlowerBox) {
        ctx.save();
        // Ahşap Çerçeve
        ctx.fillStyle = "#331604";
        ctx.fillRect(wx - 14, wy - 30, 28, 32);

        // İç Sıcak Sarı Işık (#fef08a)
        let winGlow = ctx.createRadialGradient(wx, wy - 14, 2, wx, wy - 14, 18);
        winGlow.addColorStop(0, '#fef08a');
        winGlow.addColorStop(1, '#eab308');
        ctx.fillStyle = winGlow;
        ctx.fillRect(wx - 11, wy - 27, 22, 26);

        // Pencere Izgara Çıtaları (Muntins)
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(wx, wy - 27); ctx.lineTo(wx, wy - 1);
        ctx.moveTo(wx - 11, wy - 14); ctx.lineTo(wx + 11, wy - 14);
        ctx.stroke();

        // Pencere Altı Çiçeklik (Window Box)
        if (hasFlowerBox) {
            ctx.fillStyle = "#5c2c16";
            ctx.fillRect(wx - 15, wy - 3, 30, 8);
            ctx.strokeStyle = "#3a1906";
            ctx.strokeRect(wx - 15, wy - 3, 30, 8);

            // Çiçekler
            let fCols = ['#f43f5e', '#fb7185', '#facc15', '#a855f7', '#ffffff'];
            for (let f = 0; f < 6; f++) {
                ctx.fillStyle = fCols[f % fCols.length];
                ctx.beginPath();
                ctx.arc(wx - 12 + f * 5, wy - 4 + (f % 2) * 2, 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    /**
     * Sağ Cephede Kemerli Ahşap Giriş Kapısı
     */
    function drawArchedFrontDoor(ctx, dx, dy) {
        ctx.save();
        // Kemerli Kapı Kasası
        ctx.fillStyle = "#331604";
        ctx.beginPath();
        ctx.moveTo(dx - 14, dy);
        ctx.lineTo(dx - 14, dy - 42);
        ctx.quadraticCurveTo(dx, dy - 56, dx + 14, dy - 42);
        ctx.lineTo(dx + 14, dy);
        ctx.closePath();
        ctx.fill();

        // Masif Ahşap Kapı Kanadı
        ctx.fillStyle = "#854d0e";
        ctx.beginPath();
        ctx.moveTo(dx - 11, dy);
        ctx.lineTo(dx - 11, dy - 39);
        ctx.quadraticCurveTo(dx, dy - 52, dx + 11, dy - 39);
        ctx.lineTo(dx + 11, dy);
        ctx.closePath();
        ctx.fill();

        // Ahşap Paneller
        ctx.strokeStyle = "#582a08";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(dx - 8, dy - 24, 7, 18);
        ctx.strokeRect(dx + 1, dy - 24, 7, 18);

        // Pirinç Kapı Tokmağı
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(dx + 6, dy - 15, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Üçgen Alınlıklı İzometrik Kiremit Çatı
     * 2:1 İzometrik Eğimli Kiremit Çatı (#991b1b / #7f1d1d) ve Sol Alınlık Üçgeni
     */
    function drawIsometricGableRoof(ctx, lx, ly, fx, fy, rx, ry, bx, by, H) {
        ctx.save();
        let ridgeH = ISO_CONFIG.house.roofRidgeHeight || 52;

        // Duvar Üst Köşeleri
        let lTopX = lx, lTopY = ly - H;
        let fTopX = fx, fTopY = fy - H;
        let rTopX = rx, rTopY = ry - H;
        let bTopX = bx, bTopY = by - H;

        // Mahya Tepe Noktaları (Sol Alınlık Tepesi ve Sağ Mahya Bitişi)
        let leftMidX = (lTopX + fTopX) / 2;
        let leftMidY = (lTopY + fTopY) / 2;
        let leftPeakX = leftMidX;
        let leftPeakY = leftMidY - ridgeH;

        let rightVectorX = rx - fx;
        let rightVectorY = ry - fy;
        let rightPeakX = leftPeakX + rightVectorX;
        let rightPeakY = leftPeakY + rightVectorY;

        let ov = 10; // Saçak taşma payı (Overhang)

        // 1. ARKA ÇATI EĞİMİ (Back Slope - Gölgede)
        ctx.fillStyle = "#5a1010";
        ctx.beginPath();
        ctx.moveTo(leftPeakX, leftPeakY);
        ctx.lineTo(rightPeakX, rightPeakY);
        ctx.lineTo(bTopX, bTopY - 4);
        ctx.lineTo(lTopX - ov, lTopY - ov / 2);
        ctx.closePath();
        ctx.fill();

        // 2. SOL ÜÇGEN ALINLIK DUVARI (Left Gable Wall - Işık Alan Krem/Taş Cephe)
        let gableGrad = ctx.createLinearGradient(lTopX, lTopY, fTopX, fTopY);
        gableGrad.addColorStop(0, '#f8fafc');
        gableGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = gableGrad;
        ctx.beginPath();
        ctx.moveTo(lTopX, lTopY);
        ctx.lineTo(leftPeakX, leftPeakY);
        ctx.lineTo(fTopX, fTopY);
        ctx.closePath();
        ctx.fill();

        // Alınlık Ahşap Kafes Kirişleri (Timber Truss #451a03)
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Dikey Destek Kirişi
        ctx.beginPath();
        ctx.moveTo(leftPeakX, leftPeakY);
        ctx.lineTo(leftMidX, leftMidY);
        ctx.stroke();

        // Yuvarlak Sıcak Işıklı Tavan Arası Penceresi (Attic Window)
        let attX = leftMidX;
        let attY = leftMidY - ridgeH * 0.42;
        ctx.fillStyle = "#331604";
        ctx.beginPath();
        ctx.arc(attX, attY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(attX, attY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(attX - 6, attY); ctx.lineTo(attX + 6, attY);
        ctx.moveTo(attX, attY - 6); ctx.lineTo(attX, attY + 6);
        ctx.stroke();

        // 3. ÖN-SAĞ ÇATI YÜZEYİ (Front Terracotta Roof Slope - Ana Kiremit Çatı)
        let frontRoofGrad = ctx.createLinearGradient(leftPeakX, leftPeakY, rTopX + ov, rTopY + ov / 2);
        frontRoofGrad.addColorStop(0, '#b91c1c'); // Sıcak terracotta
        frontRoofGrad.addColorStop(0.5, '#991b1b');
        frontRoofGrad.addColorStop(1, '#7f1d1d'); // İzometrik gölge ucu

        ctx.fillStyle = frontRoofGrad;
        ctx.beginPath();
        ctx.moveTo(leftPeakX, leftPeakY);
        ctx.lineTo(rightPeakX + ov, rightPeakY - ov / 2);
        ctx.lineTo(rTopX + ov, rTopY + ov / 2);
        ctx.lineTo(fTopX + ov, fTopY + ov / 2);
        ctx.closePath();
        ctx.fill();

        // Kiremit Sıraları ve Dokuları (#991b1b ve #7f1d1d)
        let tileSteps = 9;
        ctx.strokeStyle = "rgba(127, 29, 29, 0.65)";
        ctx.lineWidth = 1.8;
        for (let s = 1; s <= tileSteps; s++) {
            let t = s / tileSteps;
            let sx = leftPeakX * (1 - t) + (fTopX + ov) * t;
            let sy = leftPeakY * (1 - t) + (fTopY + ov / 2) * t;
            let ex = (rightPeakX + ov) * (1 - t) + (rTopX + ov) * t;
            let ey = (rightPeakY - ov / 2) * (1 - t) + (rTopY + ov / 2) * t;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(ex, ey);
            ctx.stroke();

            // Kiremit Dilimleri (Scallop Texture)
            ctx.strokeStyle = "rgba(69, 26, 3, 0.35)";
            ctx.lineWidth = 1;
            for (let seg = 0.1; seg < 1; seg += 0.15) {
                let px = sx * (1 - seg) + ex * seg;
                let py = sy * (1 - seg) + ey * seg;
                ctx.beginPath();
                ctx.arc(px, py, 3.5, 0, Math.PI);
                ctx.stroke();
            }
        }

        // 4. ÇATI MAHYA BAŞLIĞI (Ridge Cap Tiles)
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(leftPeakX - 4, leftPeakY - 2);
        ctx.lineTo(rightPeakX + ov + 4, rightPeakY - ov / 2 - 2);
        ctx.stroke();

        // 5. AHŞAP SAÇAK PERVAZLARI (Eaves Fascia Board #451a03)
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 4;
        // Sol Üçgen Saçakları
        ctx.beginPath();
        ctx.moveTo(lTopX - ov, lTopY - ov / 2);
        ctx.lineTo(leftPeakX, leftPeakY);
        ctx.lineTo(fTopX + ov, fTopY + ov / 2);
        ctx.stroke();

        // Ön Alt Saçak Pervazı
        ctx.beginPath();
        ctx.moveTo(fTopX + ov, fTopY + ov / 2);
        ctx.lineTo(rTopX + ov, rTopY + ov / 2);
        ctx.stroke();

        ctx.restore();
    }

    /**
     * Taş Baca ve Yükselen Duman Partikülleri
     */
    function drawStoneChimneyAndSmoke(ctx, ch) {
        ctx.save();

        // Taş Baca Gövdesi (#475569)
        ctx.fillStyle = "#475569";
        ctx.fillRect(ch.x, ch.y, ch.w, ch.h);
        ctx.fillStyle = "#334155";
        ctx.fillRect(ch.x + ch.w / 2, ch.y, ch.w / 2, ch.h); // Gölge taraf

        // Baca Külahı / Beton Başlık
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(ch.x - 3, ch.y - 6, ch.w + 6, 6);

        // Tuğla Derz Çizgileri
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 0.8;
        for (let b = ch.y + 8; b < ch.y + ch.h; b += 8) {
            ctx.beginPath();
            ctx.moveTo(ch.x, b); ctx.lineTo(ch.x + ch.w, b);
            ctx.stroke();
        }

        // Animasyonlu Baca Dumanı (Math.sin ile yükselen şeffaf duman)
        let now = Date.now();
        if (now - lastSmokeSpawn > 240) {
            lastSmokeSpawn = now;
            smokeParticles.push({
                x: ch.x + ch.w / 2,
                y: ch.y - 8,
                r: 3,
                alpha: 0.7,
                drift: (Math.random() - 0.5) * 0.8
            });
        }

        for (let i = smokeParticles.length - 1; i >= 0; i--) {
            let sp = smokeParticles[i];
            sp.y -= 0.65;
            sp.x += sp.drift + Math.sin(now / 500 + i) * 0.45;
            sp.r += 0.14;
            sp.alpha -= 0.007;

            if (sp.alpha <= 0) {
                smokeParticles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = `rgba(241, 245, 249, ${Math.max(0, sp.alpha * 0.65)})`;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.r, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    /**
     * Veranda Ön Korkulukları (Railing)
     * SORT Y: Porch Front Y (285px)
     * Karakter verandadayken önünde render olur ve bacaklarını kapatır!
     */
    function drawPorchFrontRailing(ctx) {
        let p = ISO_CONFIG.porch;
        let v = p.vertices;
        let st = p.stairs;

        ctx.save();

        let railH = 26; // Korkuluk yüksekliği

        // 1. Sol Ön Korkuluk (v[5] -> Merdiven Solu)
        drawRailingSegment(ctx, v[5].x, v[5].y, st.topX - st.width / 2, st.topY, railH);

        // 2. Sağ Ön Korkuluk (Merdiven Sağı -> v[3])
        drawRailingSegment(ctx, st.topX + st.width / 2, st.topY, v[3].x, v[3].y, railH);

        // 3. Fenerler (Lanterns on Posts)
        p.lanterns.forEach(lt => {
            // Direk Başlığı
            ctx.fillStyle = "#331604";
            ctx.fillRect(lt.x - 3, lt.y - railH - 12, 6, 14);

            // Fener Glow Işık Aurası
            let lanternGlow = ctx.createRadialGradient(lt.x, lt.y - railH - 6, 1, lt.x, lt.y - railH - 6, 28);
            lanternGlow.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
            lanternGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
            ctx.fillStyle = lanternGlow;
            ctx.beginPath();
            ctx.arc(lt.x, lt.y - railH - 6, 28, 0, Math.PI * 2);
            ctx.fill();

            // Fener Gövdesi
            ctx.fillStyle = "#1e293b";
            ctx.strokeRect(lt.x - 5, lt.y - railH - 10, 10, 10);
            ctx.fillStyle = "#fef08a";
            ctx.fillRect(lt.x - 4, lt.y - railH - 9, 8, 8);
        });

        ctx.restore();
    }

    function drawRailingSegment(ctx, x1, y1, x2, y2, H) {
        // Üst Tırabzan (Handrail)
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1 - H); ctx.lineTo(x2, y2 - H);
        ctx.stroke();

        // Alt Kiriş (Bottom Rail)
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1 - 4); ctx.lineTo(x2, y2 - 4);
        ctx.stroke();

        // Dikey Parmaklıklar (Balusters)
        let dist = Math.hypot(x2 - x1, y2 - y1);
        let count = Math.floor(dist / 9);
        let dx = (x2 - x1) / count;
        let dy = (y2 - y1) / count;

        ctx.strokeStyle = "#713f12";
        ctx.lineWidth = 2;
        for (let b = 0; b <= count; b++) {
            let bx = x1 + b * dx;
            let by = y1 + b * dy;
            ctx.beginPath();
            ctx.moveTo(bx, by - 4);
            ctx.lineTo(bx, by - H + 2);
            ctx.stroke();
        }

        // Ana Direkler
        ctx.fillStyle = "#331604";
        ctx.fillRect(x1 - 3, y1 - H - 4, 6, H + 6);
        ctx.fillRect(x2 - 3, y2 - H - 4, 6, H + 6);
    }

    /**
     * Sallanan Ahşap Koltuk (Rocking Chair - Sittable)
     */
    function drawRockingChair(ctx, rc) {
        ctx.save();
        let cx = rc.x;
        let cy = rc.y;

        // Sallanma Kavis Ayakları (Rockers)
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy + 6, 18, Math.PI * 0.15, Math.PI * 0.85, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 8, cy + 2, 18, Math.PI * 0.15, Math.PI * 0.85, false);
        ctx.stroke();

        // Oturak Minderi
        ctx.fillStyle = "#b45309";
        ctx.beginPath();
        ctx.roundRect(cx - 10, cy - 10, 20, 12, 3);
        ctx.fill();

        // Sırtlık Çıtaları
        ctx.fillStyle = "#78350f";
        ctx.fillRect(cx - 8, cy - 30, 4, 20);
        ctx.fillRect(cx - 2, cy - 32, 4, 22);
        ctx.fillRect(cx + 4, cy - 30, 4, 20);

        // Kolçaklar
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy - 20); ctx.lineTo(cx - 10, cy - 8);
        ctx.moveTo(cx + 10, cy - 20); ctx.lineTo(cx + 10, cy - 8);
        ctx.stroke();

        ctx.restore();
    }

    // ==============================================================
    // 6. ENTEGRASYON VE ÇOK KATMANLI Y-SORT RENDER DÖNGÜSÜ
    // ==============================================================

    // --- 60 FPS ZERO-GC HAVUZLAMA (OBJECT POOLING) ---
    const _gardenSortQueue = [];
    let _gardenStaticEntities = null;
    const _gardenCropSlots = [];
    const _gardenPlayerSlots = [];
    const _gardenFurnitureSlots = [];

    function _initGardenStaticEntities() {
        if (_gardenStaticEntities) return _gardenStaticEntities;
        _gardenStaticEntities = [];
        for (let i = 0; i < ISO_CONFIG.orchard.length; i++) {
            const tree = ISO_CONFIG.orchard[i];
            _gardenStaticEntities.push({
                type: 'apple_tree',
                sortY: tree.y,
                render: function(ctx) { drawAppleTree(ctx, tree); }
            });
        }
        _gardenStaticEntities.push({
            type: 'rocking_chair',
            sortY: ISO_CONFIG.porch.rockingChair.sortY,
            render: function(ctx) { drawRockingChair(ctx, ISO_CONFIG.porch.rockingChair); }
        });
        _gardenStaticEntities.push({
            type: 'porch_front_railing',
            sortY: ISO_CONFIG.porch.vertices[4].y,
            render: function(ctx) { drawPorchFrontRailing(ctx); }
        });
        _gardenStaticEntities.push({
            type: 'front_fence',
            sortY: ISO_CONFIG.fence.south,
            render: function(ctx, w, h) { drawPicketFence(ctx, w, h, 'front'); }
        });
        return _gardenStaticEntities;
    }

    /**
     * Bahçe ve verandanın çok katmanlı render fonksiyonu
     * (housing.js ve main.js içerisinden çağrılır)
     */
    function drawIsometricGardenHouseEnvironment(ctx) {
        let width = ctx.canvas.width;
        let height = ctx.canvas.height;

        // 1. KATMAN: ÖNBELLEKLİ STATİK ZEMİN & BAHÇE TABANI
        let background = typeof window.bgCache !== 'undefined'
            ? window.bgCache.getCanvas('house_garden', width, height)
            : null;
        if (background) {
            ctx.drawImage(background, 0, 0);
        } else {
            renderStaticGardenLawn(ctx, width, height);
        }

        // 2. KATMAN: Y-SORTING ENTITY KUYRUĞU (Sıfır-Tahsis / Zero-GC Havuzlama)
        // Statik nesneleri önceden hazırlanmış listeden ekle
        const staticList = _initGardenStaticEntities();
        _gardenSortQueue.length = 0;
        for (let i = 0; i < staticList.length; i++) {
            _gardenSortQueue.push(staticList[i]);
        }

        // D2) 9 Tarla Parselindeki Bitkiler (Crops - Havuzlanmış Slotlar)
        for (let i = 0; i < farmPlotsState.length; i++) {
            let plot = farmPlotsState[i];
            let slot = _gardenCropSlots[i];
            if (!slot) {
                slot = {
                    type: 'farm_crop',
                    sortY: 0,
                    plot: null,
                    center: null,
                    render: function(targetCtx) {
                        drawIsometricCrop(targetCtx, this.plot, this.center);
                    }
                };
                _gardenCropSlots[i] = slot;
            }
            let center = getFarmPlotCenter(plot.row, plot.col);
            slot.sortY = center.cy + 2;
            slot.plot = plot;
            slot.center = center;
            _gardenSortQueue.push(slot);
        }

        // E) Odadaki Oyuncular (Players - Havuzlanmış Slotlar)
        if (typeof window.players !== 'undefined') {
            let pIdx = 0;
            for (let id in window.players) {
                let p = window.players[id];
                if (!p) continue;
                let slot = _gardenPlayerSlots[pIdx];
                if (!slot) {
                    slot = {
                        type: 'player',
                        id: null,
                        p: null,
                        sortY: 0,
                        render: function() {
                            if (typeof window.drawAnimatedPlayer === 'function' && this.p) {
                                window.drawAnimatedPlayer(this.p, this.id);
                            }
                        }
                    };
                    _gardenPlayerSlots[pIdx] = slot;
                }
                slot.id = id;
                slot.p = p;
                slot.sortY = p.y;
                _gardenSortQueue.push(slot);
                pIdx++;
            }
        }

        // F) Yerleştirilmiş Mobilyalar (Varsa - Havuzlanmış Slotlar)
        if (typeof window.getCurrentViewingHouse === 'function') {
            let h = window.getCurrentViewingHouse();
            let cR = (typeof currentRoom !== 'undefined' ? currentRoom : (window.currentRoom || '')).toLowerCase();
            if (!h && cR.startsWith('house_ornek_')) {
                let tourT = cR.substring(12) || 'garden';
                h = {
                    owner: 'Örnek Daire',
                    type: tourT,
                    furniture: (typeof window.DEMO_HOUSES !== 'undefined' && window.DEMO_HOUSES[tourT]) ? JSON.parse(JSON.stringify(window.DEMO_HOUSES[tourT])) : [{ id: 'sedir', x: 270, y: 310, rotation: 0 }],
                    isDemo: true
                };
                window.currentViewingHouse = h;
            }
            if (h && h.furniture && h.furniture.length > 0) {
                for (let fIdx = 0; fIdx < h.furniture.length; fIdx++) {
                    let fItem = h.furniture[fIdx];
                    let slot = _gardenFurnitureSlots[fIdx];
                    if (!slot) {
                        slot = {
                            type: 'furniture',
                            fItem: null,
                            fIdx: 0,
                            sortY: 0,
                            render: function(targetCtx) {
                                if (typeof window.drawCustomIsometricFurniture === 'function' && this.fItem) {
                                    let isH = window.isHouseEditMode && (this.fIdx === window.hoveredFurnitureIndex);
                                    let isD = window.isHouseEditMode && (this.fIdx === window.draggedFurnitureIndex);
                                    let isS = window.isHouseEditMode && (this.fIdx === window.selectedFurnitureIndex);
                                    window.drawCustomIsometricFurniture(targetCtx, this.fItem, isH, isD, isS);
                                }
                            }
                        };
                        _gardenFurnitureSlots[fIdx] = slot;
                    }
                    slot.fItem = fItem;
                    slot.fIdx = fIdx;
                    slot.sortY = fItem.y;
                    _gardenSortQueue.push(slot);
                }
            }
        }

        // 3. KUYRUĞU Y-KOORDİNATINA GÖRE SIRALA & ÇİZ (100% 3D DERİNLİK)
        _gardenSortQueue.sort((a, b) => a.sortY - b.sortY);

        for (let i = 0; i < _gardenSortQueue.length; i++) {
            _gardenSortQueue[i].render(ctx, width, height);
        }

        // 4. KATMAN: ETKİLEŞİM & TARLA HOVER TOOLTİP
        drawFarmPlotHoverTooltip(ctx);
    }
    window.drawIsometricGardenHouseEnvironment = drawIsometricGardenHouseEnvironment;

    /**
     * Fare Tarla Üzerindeyse Hover Tooltip Çiz
     */
    function drawFarmPlotHoverTooltip(ctx) {
        if (hoveredPlotIndex < 0) return;
        let plot = farmPlotsState[hoveredPlotIndex];
        if (!plot) return;

        let center = getFarmPlotCenter(plot.row, plot.col);
        ctx.save();

        let durMap = {
            'papatya': { seedMin: 20, flowerMin: 40, name: 'Papatya' },
            'lale': { seedMin: 30, flowerMin: 60, name: 'Lale' },
            'gul': { seedMin: 45, flowerMin: 90, name: 'Gül' },
            'sakayik': { seedMin: 30, flowerMin: 120, name: 'Şakayık' },
            'lavanta': { seedMin: 60, flowerMin: 120, name: 'Lavanta' },
            'orkide': { seedMin: 90, flowerMin: 180, name: 'Orkide' },
            'aycicegi': { seedMin: 120, flowerMin: 240, name: 'Ayçiçeği' }
        };
        let sType = plot.seedType || 'papatya';
        let sInfo = durMap[sType] || durMap['papatya'];

        // Sürükleme durumu kontrolü
        let isDragging = !!(window.draggedFarmingItem);
        let dragItemKey = isDragging ? window.draggedFarmingItem.itemKey : '';

        let tipText = `🌱 Parsel #${plot.id + 1}: Boş Toprak (Tıkla veya Tohum Sürükle)`;
        if (isDragging) {
            if (dragItemKey.startsWith('props_tohum_')) {
                tipText = (plot.state === 'EMPTY') ? `🌱 Buraya Bırak: Tohum Ek!` : `❌ Bu parsel boş değil!`;
            } else if (dragItemKey === 'props_bitki_suyu' || dragItemKey === 'props_organik_gubre') {
                tipText = (plot.state === 'SAPLING_READY') ? `💧 Buraya Bırak: Can Suyu & Gübre Ver!` : `❌ Yalnızca hazır fideye verilebilir!`;
            }
        } else if (plot.state === 'SEED') {
            let totalMs = sInfo.seedMin * 60000;
            let passed = Date.now() - (plot.stageChangedAt || plot.plantedAt || Date.now());
            let remMin = Math.max(1, Math.ceil((totalMs - passed) / 60000));
            tipText = `🌱 Parsel #${plot.id + 1}: ${sInfo.name} Tohumu Büyüyor (~ ${remMin} dk)`;
        } else if (plot.state === 'SAPLING_READY') {
            let remSec = Math.max(0, Math.floor(((plot.expiresAt || Date.now()) - Date.now()) / 1000));
            let mm = Math.floor(remSec / 60), ss = (remSec % 60).toString().padStart(2, '0');
            tipText = `🌿 Parsel #${plot.id + 1}: ${sInfo.name} Fidesi Hazır! (⚠️ ${mm}:${ss} - Hasat / Su+Gübre Sürükle)`;
        } else if (plot.state === 'FLOWER_GROWING') {
            let totalMs = sInfo.flowerMin * 60000;
            let passed = Date.now() - (plot.stageChangedAt || Date.now());
            let remMin = Math.max(1, Math.ceil((totalMs - passed) / 60000));
            tipText = `💧 Parsel #${plot.id + 1}: ${sInfo.name} Çiçek Açıyor (~ ${remMin} dk)`;
        } else if (plot.state === 'FLOWER_READY') {
            let remSec = Math.max(0, Math.floor(((plot.expiresAt || Date.now()) - Date.now()) / 1000));
            let mm = Math.floor(remSec / 60), ss = (remSec % 60).toString().padStart(2, '0');
            tipText = `💐 Parsel #${plot.id + 1}: ${sInfo.name} Çiçek Açtı! (⏱️ ${mm}:${ss} - Tıkla & Hasat Et)`;
        } else if (plot.state === 'WITHERED') {
            tipText = `🥀 Parsel #${plot.id + 1}: Tarla Yandı! (🧹 50 TL ile Temizle)`;
        } else if (plot.state === 'CLEANING') {
            let remSec = Math.max(0, Math.floor(((plot.cleaningEndsAt || Date.now()) - Date.now()) / 1000));
            tipText = `🧹 Parsel #${plot.id + 1}: Temizleniyor (${remSec} sn)`;
        }

        ctx.font = "bold 11px sans-serif";
        let tw = ctx.measureText(tipText).width + 20;

        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.beginPath();
        ctx.roundRect(center.cx - tw / 2, center.cy - 44, tw, 24, 6);
        ctx.fill();

        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.textAlign = "center";
        ctx.fillText(tipText, center.cx, center.cy - 28);

        ctx.restore();
    }

    // ==============================================================
    // 7. FARE & ETKİLEŞİM DİNLEYİCİSİ (POINT-IN-DIAMOND HOVER)
    // ==============================================================

    function handleGardenMouseMove(e) {
        let canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        if (typeof window.currentRoom === 'undefined' || !window.currentRoom.startsWith('house_')) {
            hoveredPlotIndex = -1;
            canvas.style.cursor = 'default';
            return;
        }
        let house = (typeof window.getCurrentViewingHouse === 'function') ? window.getCurrentViewingHouse() : null;
        if (!house || house.type !== 'garden') {
            hoveredPlotIndex = -1;
            canvas.style.cursor = 'default';
            return;
        }

        let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        let mx = (e.clientX - rect.left) * scaleX;
        let my = (e.clientY - rect.top) * scaleY;

        // 9 Tarla Parseli Üzerinde Hover Kontrolü
        let found = -1;
        for (let i = 0; i < farmPlotsState.length; i++) {
            let p = farmPlotsState[i];
            let c = getFarmPlotCenter(p.row, p.col);
            if (isPointInIsometricDiamond(mx, my, c.cx, c.cy, ISO_CONFIG.farm.tileW, ISO_CONFIG.farm.tileH)) {
                found = i;
                break;
            }
        }
        hoveredPlotIndex = found;
        canvas.style.cursor = found !== -1 ? 'pointer' : 'default';
    }

    function handleGardenCanvasClick(e) {
        if (typeof window.currentRoom === 'undefined' || !window.currentRoom.startsWith('house_')) return;
        let house = (typeof window.getCurrentViewingHouse === 'function') ? window.getCurrentViewingHouse() : null;
        if (!house || house.type !== 'garden') return;

        let canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        let rect = canvas.getBoundingClientRect();
        let scaleX = canvas.width / rect.width;
        let scaleY = canvas.height / rect.height;
        let mx = (e.clientX - rect.left) * scaleX;
        let my = (e.clientY - rect.top) * scaleY;

        // Tarla Parseline Tıklandı mı?
        for (let i = 0; i < farmPlotsState.length; i++) {
            let p = farmPlotsState[i];
            let c = getFarmPlotCenter(p.row, p.col);
            if (isPointInIsometricDiamond(mx, my, c.cx, c.cy, ISO_CONFIG.farm.tileW, ISO_CONFIG.farm.tileH)) {
                selectedPlotIndex = i;
                if (typeof window.handleFarmPlotDirectClick === 'function') {
                    window.handleFarmPlotDirectClick(i);
                } else if (typeof window.openFarmPlotActionModal === 'function') {
                    window.openFarmPlotActionModal(i);
                }
                return;
            }
        }

        // Sallanan Sandalyeye Tıklandı mı?
        let rc = ISO_CONFIG.porch.rockingChair;
        let distRc = Math.hypot(mx - rc.x, my - rc.y);
        if (distRc < 30) {
            if (typeof window.myId !== 'undefined' && window.players && window.players[window.myId]) {
                let me = window.players[window.myId];
                let distToPlayer = Math.hypot(me.x - rc.x, me.y - rc.y);
                let sitAction = () => {
                    me.x = rc.x;
                    me.y = rc.y;
                    me.action = 'sitting';
                    if (typeof window.socket !== 'undefined') {
                        window.socket.emit('playerAction', { action: 'sitting' });
                    }
                    if (typeof showFloatingToast === 'function') {
                        showFloatingToast('🪑 Verandadaki sallanan sandalyeye oturdunuz.');
                    }
                };

                if (distToPlayer <= 36) {
                    sitAction();
                } else {
                    // Yakın değilse sandalyeye doğru yürü ve varınca otur
                    if (typeof targetWalkPos !== 'undefined') {
                        targetWalkPos = {
                            x: rc.x,
                            y: rc.y + 4,
                            isSeatTarget: true,
                            onReach: sitAction
                        };
                    } else {
                        sitAction();
                    }
                }
            }
            return;
        }
    }

    function isCurrentlyInGardenHouse() {
        let cr = (typeof window.currentRoom !== 'undefined' && window.currentRoom) 
            ? window.currentRoom 
            : ((typeof currentRoom !== 'undefined') ? currentRoom : '');
        if (!cr || !cr.startsWith('house_')) return false;
        let house = (typeof window.getCurrentViewingHouse === 'function') ? window.getCurrentViewingHouse() : null;
        return (house && house.type === 'garden') || cr.endsWith('_garden') || cr.includes('_garden');
    }
    window.isCurrentlyInGardenHouse = isCurrentlyInGardenHouse;
    window.ISO_CONFIG_GARDEN = ISO_CONFIG;

    // Olay Dinleyicilerini Kaydet
    function attachGardenCanvasListeners() {
        let cv = document.getElementById('gameCanvas');
        if (cv && !cv.__gardenListenersAttached) {
            cv.__gardenListenersAttached = true;
            cv.addEventListener('mousemove', handleGardenMouseMove);
            cv.addEventListener('click', handleGardenCanvasClick);
        }
    }
    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', attachGardenCanvasListeners);
    } else {
        attachGardenCanvasListeners();
    }

    // Statik Render Uyumluluğu
    window.renderStaticGardenHouse = renderStaticGardenLawn;



    function getFarmPlotIndexAtCanvasCoords(mx, my) {
        for (let i = 0; i < farmPlotsState.length; i++) {
            let p = farmPlotsState[i];
            let c = getFarmPlotCenter(p.row, p.col);
            if (isPointInIsometricDiamond(mx, my, c.cx, c.cy, ISO_CONFIG.farm.tileW, ISO_CONFIG.farm.tileH)) {
                return i;
            }
        }
        return -1;
    }
    window.getFarmPlotIndexAtCanvasCoords = getFarmPlotIndexAtCanvasCoords;
    window.farmPlotsState = farmPlotsState;

})(window);
