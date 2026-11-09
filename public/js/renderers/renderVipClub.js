// public/js/renderers/renderVipClub.js - 2.5D VIP Gece Kulübü, Ritmik Dans Pisti & Tekinsiz Tekin Karaborsa
// 1000x625 Widescreen, 2.5D Tam Ekran Lüks VIP Lounge & Speakeasy Bar

(function (global) {
    const CANV_W = 1000;
    const CANV_H = 625;

    // Tekinsiz Tekin Tezgah Hitbox & Konumu
    const TEKIN_BOOTH = {
        x: 720,
        y: 200,
        w: 230,
        h: 120,
        npcX: 765,
        npcY: 255,
        counterX: 812,
        counterY: 242,
        counterW: 132,
        counterH: 50
    };

    // Tekinsiz Tekin Serseri / Güvenilmez Replikleri (Semihus Aydınus standardı 60 sn döngü)
    const TEKIN_QUOTES = [
        "Şşt, buralarda fazla oyalanma... Aradığın şey bende var.",
        "Temiz mal, sağlam iş. Polise öttürmeyeceksen anlaşırız!",
        "Kralına sorsan beni gösterir. Kasada son parti mallar duruyor.",
        "Fiyatta pazarlık yok yeğenim, karaborsa bu, bakkal değil!",
        "Kimse görmeden halledelim şu işi, her yanda kameralar var...",
        "Kulüpte herkes eğlenirken, asıl ticaret burada döner!",
        "Gözünü dört aç, bana bulaşan iflah olmaz!"
    ];
    let tekinLastQuoteTime = Date.now();

    // Dans Pisti Sınırları
    const DANCE_FLOOR = {
        x: 340,
        y: 250,
        w: 320,
        h: 240
    };

    /**
     * 1. 2.5D ZEMİN DÖŞEMESİ (Obsidian & Mermer Parke)
     */
    function drawVipClubFloor(bctx) {
        // Tüm Zemin (y: 175 .. 625)
        let floorGrad = bctx.createLinearGradient(0, 175, 0, CANV_H);
        floorGrad.addColorStop(0, "#090d16");
        floorGrad.addColorStop(0.5, "#0b0f19");
        floorGrad.addColorStop(1, "#060911");
        bctx.fillStyle = floorGrad;
        bctx.fillRect(0, 175, CANV_W, CANV_H - 175);

        // Koyu Parlak Mermer Karolar (tileW: 50, tileH: 30)
        const tileW = 50;
        const tileH = 30;
        for (let y = 175; y < CANV_H; y += tileH) {
            for (let x = 0; x < CANV_W; x += tileW) {
                let gx = Math.floor(x / tileW);
                let gy = Math.floor((y - 175) / tileH);
                let isAlt = (gx + gy) % 2 === 0;

                bctx.fillStyle = isAlt ? "rgba(15, 23, 42, 0.7)" : "rgba(30, 41, 59, 0.35)";
                bctx.fillRect(x, y, tileW, tileH);

                // İnce derz çizgisi
                bctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
                bctx.lineWidth = 1;
                bctx.strokeRect(x, y, tileW, tileH);
            }
        }
    }

    /**
     * 2. ARKA DUVAR & NEON TABELA & LİKÖR RAFLARI (y: 0 .. 175)
     */
    function drawVipClubBackWall(bctx) {
        // Akustik Ahşap & Koyu Tuğla Duvar
        let wallGrad = bctx.createLinearGradient(0, 0, 0, 175);
        wallGrad.addColorStop(0, "#030712");
        wallGrad.addColorStop(0.7, "#0f172a");
        wallGrad.addColorStop(1, "#1e1b4b");
        bctx.fillStyle = wallGrad;
        bctx.fillRect(0, 0, CANV_W, 175);

        // Dikey Akustik Ahşap Paneller (İnce Ahşap Çıtalar)
        bctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        bctx.lineWidth = 1.2;
        for (let x = 0; x <= CANV_W; x += 16) {
            bctx.beginPath();
            bctx.moveTo(x, 0);
            bctx.lineTo(x, 175);
            bctx.stroke();
        }

        // Altın / Neon Mor Çıta
        bctx.fillStyle = "#8b5cf6";
        bctx.fillRect(0, 172, CANV_W, 3);
        bctx.fillStyle = "#f59e0b";
        bctx.fillRect(0, 170, CANV_W, 1.5);

        // --- MERKEZİ NEON "VIP CLUB" TABELASI ---
        let neonX = 370, neonY = 14, neonW = 260, neonH = 46;
        bctx.save();
        bctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        bctx.beginPath();
        bctx.roundRect(neonX, neonY, neonW, neonH, 10);
        bctx.fill();
        bctx.strokeStyle = "#ec4899";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        // Neon Yazı
        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 20px 'Segoe UI', sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🍷  V I P   C L U B  🍷", 500, neonY + 28);

        bctx.fillStyle = "#cbd5e1";
        bctx.font = "bold 9px 'Segoe UI', sans-serif";
        bctx.fillText("LÜKS GECE KULÜBÜ & YERALTI SPEAKEASY", 500, neonY + 41);
        bctx.restore();

        // --- SAĞ DUVARDA AYDINLATMALI LÜKS LİKÖR & ŞAMPANYA RAFLARI ---
        let shelfX = 690, shelfW = 270;
        for (let r = 0; r < 3; r++) {
            let sy = 80 + r * 30;
            // Cam Raf
            bctx.fillStyle = "rgba(255, 255, 255, 0.25)";
            bctx.fillRect(shelfX, sy, shelfW, 3);
            bctx.fillStyle = "#f59e0b";
            bctx.fillRect(shelfX, sy + 3, shelfW, 1);

            // Renkli Lüks Şişeler (Konyak, Şampanya, Viski)
            const bColors = ["#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#38bdf8", "#ec4899", "#d97706", "#22c55e"];
            for (let b = 0; b < 10; b++) {
                let bx = shelfX + 12 + b * 25;
                bctx.fillStyle = bColors[(b + r) % bColors.length];
                bctx.beginPath();
                bctx.roundRect(bx, sy - 18, 12, 18, [3, 3, 1, 1]);
                bctx.fill();

                // Şişe Boğazı
                bctx.fillStyle = "rgba(255, 255, 255, 0.5)";
                bctx.fillRect(bx + 4, sy - 23, 4, 5);
            }
        }
    }

    /**
     * 3. DJ KABİNİ & HOPARLÖR KOLONLARI (Center Back)
     */
    function drawDjBooth(bctx) {
        let djX = 410, djY = 135, djW = 180, djH = 68;

        // DJ Masası Gövdesi (Siyah Parlak Akrilik)
        let deskGrad = bctx.createLinearGradient(djX, djY, djX + djW, djY);
        deskGrad.addColorStop(0, "#0f172a");
        deskGrad.addColorStop(0.5, "#1e293b");
        deskGrad.addColorStop(1, "#0f172a");
        bctx.fillStyle = deskGrad;
        bctx.beginPath();
        bctx.roundRect(djX, djY, djW, djH, 8);
        bctx.fill();

        // Neon Ön Çıta & VU-Meter Ses Dalgası Efekti
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Ön Panel LED Işıkları
        bctx.fillStyle = "rgba(56, 189, 248, 0.15)";
        bctx.fillRect(djX + 10, djY + 12, djW - 20, 24);

        // LED Equalizer Barları
        const barHeights = [14, 18, 10, 22, 16, 19, 12, 20, 15, 24, 17, 13];
        barHeights.forEach((bh, i) => {
            bctx.fillStyle = (i % 2 === 0) ? "#38bdf8" : "#ec4899";
            bctx.fillRect(djX + 16 + i * 13, djY + 34 - bh, 8, bh);
        });

        // DJ Masası Üzerinde Çift CDJ Pikap ve Mikser
        bctx.fillStyle = "#020617";
        bctx.fillRect(djX + 18, djY - 10, 36, 16); // Sol Pikap
        bctx.fillRect(djX + djW - 54, djY - 10, 36, 16); // Sağ Pikap
        bctx.fillStyle = "#334155";
        bctx.fillRect(djX + 68, djY - 10, 44, 16); // Mikser

        // Dönen Plak Tablaları
        bctx.fillStyle = "#38bdf8";
        bctx.beginPath(); bctx.arc(djX + 36, djY - 2, 7, 0, Math.PI * 2); bctx.fill();
        bctx.fillStyle = "#ec4899";
        bctx.beginPath(); bctx.arc(djX + djW - 36, djY - 2, 7, 0, Math.PI * 2); bctx.fill();

        // DJ Kulaklığı
        bctx.strokeStyle = "#ffffff";
        bctx.lineWidth = 2;
        bctx.beginPath();
        bctx.arc(djX + 90, djY - 4, 8, Math.PI, 0);
        bctx.stroke();

        // SOL VE SAĞ DEV HOPARLÖR KULELERİ (Giant Speakers)
        [365, 595].forEach((spX, idx) => {
            bctx.fillStyle = "#090d16";
            bctx.beginPath();
            bctx.roundRect(spX, 120, 38, 90, 4);
            bctx.fill();
            bctx.strokeStyle = (idx === 0) ? "#38bdf8" : "#ec4899";
            bctx.lineWidth = 1.5;
            bctx.stroke();

            // Woofer Daireleri
            bctx.fillStyle = "#1e293b";
            bctx.beginPath(); bctx.arc(spX + 19, 145, 12, 0, Math.PI * 2); bctx.fill();
            bctx.beginPath(); bctx.arc(spX + 19, 185, 14, 0, Math.PI * 2); bctx.fill();

            // Subwoofer Göbekleri
            bctx.fillStyle = (idx === 0) ? "#38bdf8" : "#ec4899";
            bctx.beginPath(); bctx.arc(spX + 19, 145, 4, 0, Math.PI * 2); bctx.fill();
            bctx.beginPath(); bctx.arc(spX + 19, 185, 5, 0, Math.PI * 2); bctx.fill();
        });
    }

    /**
     * 4. VIP U-LOUNGE (Lüks Chesterfield Loca Koltuk Grubu, Minderler & Kokteyl Masası)
     * Yukarı Doğru Küçültülmüş & Kompaktlaştırılmış (Sol Altta Yeni Koltuklara Ferah Alan Açar)
     */
    function drawVipLounge(bctx) {
        const centerX = 180;

        // 1. VIP Loca Halısı (Kompakt Oval Peluş Kadife Halı)
        bctx.save();
        bctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        bctx.beginPath();
        bctx.ellipse(centerX, 255, 125, 78, 0, 0, Math.PI * 2);
        bctx.fill();

        // Halı Gövdesi
        let rugGrad = bctx.createRadialGradient(centerX, 250, 15, centerX, 250, 115);
        rugGrad.addColorStop(0, "#4c0519");
        rugGrad.addColorStop(0.7, "#881337");
        rugGrad.addColorStop(1, "#3f0713");
        bctx.fillStyle = rugGrad;
        bctx.beginPath();
        bctx.ellipse(centerX, 250, 118, 72, 0, 0, Math.PI * 2);
        bctx.fill();

        // Halı Çift Katmanlı Altın Çerçeve
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2;
        bctx.stroke();
        bctx.strokeStyle = "rgba(254, 240, 138, 0.4)";
        bctx.lineWidth = 0.8;
        bctx.beginPath();
        bctx.ellipse(centerX, 250, 112, 66, 0, 0, Math.PI * 2);
        bctx.stroke();

        // 2. CHESTERFIELD U-SOFA: AHŞAP/ALTIN KAİDE (Kompakt: y: 185..280)
        bctx.fillStyle = "#1e1b4b";
        bctx.beginPath();
        bctx.roundRect(50, 185, 260, 95, [18, 18, 12, 12]);
        bctx.fill();
        bctx.strokeStyle = "#ca8a04";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        // 3. ARKA SIRTLIK (BACKREST - Chesterfield Kapitone Deri)
        let backGrad = bctx.createLinearGradient(0, 182, 0, 226);
        backGrad.addColorStop(0, "#9f1239");
        backGrad.addColorStop(0.5, "#881337");
        backGrad.addColorStop(1, "#4c0519");
        bctx.fillStyle = backGrad;
        bctx.beginPath();
        bctx.roundRect(56, 182, 248, 44, [16, 16, 4, 4]);
        bctx.fill();
        bctx.strokeStyle = "#be123c";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        // Üst Rulo
        bctx.fillStyle = "#be123c";
        bctx.beginPath();
        bctx.roundRect(54, 180, 252, 11, 5);
        bctx.fill();
        bctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        bctx.lineWidth = 0.8;
        bctx.stroke();

        // Arka Chesterfield Kapitone Elmas Dikişleri & Altın Düğmeler
        bctx.strokeStyle = "rgba(76, 5, 25, 0.6)";
        bctx.lineWidth = 1;
        for (let dx = 80; dx <= 280; dx += 28) {
            bctx.beginPath();
            bctx.moveTo(dx, 188);
            bctx.lineTo(dx + 14, 222);
            bctx.stroke();
            bctx.beginPath();
            bctx.moveTo(dx + 14, 188);
            bctx.lineTo(dx, 222);
            bctx.stroke();
        }

        // Düğmeler
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 7; col++) {
                let bx = 88 + col * 26 + (row % 2 === 1 ? 13 : 0);
                let by = 196 + row * 14;
                bctx.fillStyle = "#2a040e";
                bctx.beginPath(); bctx.arc(bx, by + 1, 2.2, 0, Math.PI * 2); bctx.fill();
                bctx.fillStyle = "#facc15";
                bctx.beginPath(); bctx.arc(bx, by, 1.6, 0, Math.PI * 2); bctx.fill();
            }
        }

        // 4. SOL & SAĞ YAN KOLÇAKLAR (Kompakt Chesterfield Kollar)
        // Sol Kolçak
        let armGradL = bctx.createLinearGradient(54, 0, 92, 0);
        armGradL.addColorStop(0, "#be123c");
        armGradL.addColorStop(0.5, "#881337");
        armGradL.addColorStop(1, "#4c0519");
        bctx.fillStyle = armGradL;
        bctx.beginPath();
        bctx.roundRect(54, 186, 38, 90, [14, 4, 10, 14]);
        bctx.fill();
        bctx.strokeStyle = "#e11d48";
        bctx.lineWidth = 1.2;
        bctx.stroke();

        // Sol Kolçak Ön Kıvrım Başlığı
        bctx.fillStyle = "#9f1239";
        bctx.beginPath();
        bctx.ellipse(73, 272, 14, 9, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 1;
        bctx.stroke();

        // Sağ Kolçak
        let armGradR = bctx.createLinearGradient(268, 0, 306, 0);
        armGradR.addColorStop(0, "#4c0519");
        armGradR.addColorStop(0.5, "#881337");
        armGradR.addColorStop(1, "#be123c");
        bctx.fillStyle = armGradR;
        bctx.beginPath();
        bctx.roundRect(268, 186, 38, 90, [4, 14, 14, 10]);
        bctx.fill();
        bctx.strokeStyle = "#e11d48";
        bctx.lineWidth = 1.2;
        bctx.stroke();

        // Sağ Kolçak Ön Kıvrım Başlığı
        bctx.fillStyle = "#9f1239";
        bctx.beginPath();
        bctx.ellipse(287, 272, 14, 9, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 1;
        bctx.stroke();

        // 5. OTURMA MİNDERLERİ
        // A) Arka Bench Minderi (y: 224..252)
        let seatGradBack = bctx.createLinearGradient(0, 224, 0, 252);
        seatGradBack.addColorStop(0, "#9f1239");
        seatGradBack.addColorStop(0.7, "#be123c");
        seatGradBack.addColorStop(1, "#58091e");
        bctx.fillStyle = seatGradBack;
        bctx.beginPath();
        bctx.roundRect(92, 224, 176, 28, 5);
        bctx.fill();
        bctx.strokeStyle = "rgba(250, 204, 21, 0.7)";
        bctx.lineWidth = 1.2;
        bctx.beginPath();
        bctx.moveTo(92, 251);
        bctx.lineTo(268, 251);
        bctx.stroke();

        // B) Sol Koltuk Minderi (x: 92..136, y: 248..278)
        let seatGradL = bctx.createLinearGradient(92, 0, 136, 0);
        seatGradL.addColorStop(0, "#be123c");
        seatGradL.addColorStop(0.7, "#9f1239");
        seatGradL.addColorStop(1, "#6b0c26");
        bctx.fillStyle = seatGradL;
        bctx.beginPath();
        bctx.roundRect(92, 248, 44, 30, [0, 6, 8, 3]);
        bctx.fill();
        bctx.strokeStyle = "rgba(250, 204, 21, 0.7)";
        bctx.lineWidth = 1;
        bctx.stroke();

        // C) Sağ Koltuk Minderi (x: 224..268, y: 248..278)
        let seatGradR = bctx.createLinearGradient(224, 0, 268, 0);
        seatGradR.addColorStop(0, "#6b0c26");
        seatGradR.addColorStop(0.3, "#9f1239");
        seatGradR.addColorStop(1, "#be123c");
        bctx.fillStyle = seatGradR;
        bctx.beginPath();
        bctx.roundRect(224, 248, 44, 30, [6, 0, 3, 8]);
        bctx.fill();
        bctx.strokeStyle = "rgba(250, 204, 21, 0.7)";
        bctx.lineWidth = 1;
        bctx.stroke();

        // 6. VIP KOKTEYL MASASI (ty: 280)
        const tx = centerX, ty = 280;

        bctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        bctx.beginPath();
        bctx.ellipse(tx, ty + 10, 32, 11, 0, 0, Math.PI * 2);
        bctx.fill();

        bctx.fillStyle = "#ca8a04";
        bctx.beginPath();
        bctx.ellipse(tx, ty + 6, 15, 5.5, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.fillStyle = "#854d0e";
        bctx.fillRect(tx - 3, ty - 1, 6, 8);

        // Masanın Üst Tablası
        let tGrad = bctx.createRadialGradient(tx - 5, ty - 3, 3, tx, ty, 28);
        tGrad.addColorStop(0, "rgba(255, 255, 255, 0.6)");
        tGrad.addColorStop(0.3, "rgba(56, 189, 248, 0.35)");
        tGrad.addColorStop(0.8, "rgba(15, 23, 42, 0.85)");
        tGrad.addColorStop(1, "rgba(2, 6, 23, 0.95)");
        bctx.fillStyle = tGrad;
        bctx.beginPath();
        bctx.ellipse(tx, ty, 28, 13, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Şampanya ve Kadehler
        bctx.fillStyle = "#cbd5e1";
        bctx.beginPath();
        bctx.roundRect(tx - 6, ty - 7, 12, 8, 1.5);
        bctx.fill();
        bctx.fillStyle = "#064e3b";
        bctx.fillRect(tx - 2.5, ty - 14, 5, 8);
        bctx.fillStyle = "#facc15";
        bctx.fillRect(tx - 1.5, ty - 17, 3, 4);

        bctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        bctx.fillRect(tx - 16, ty - 4, 3, 6);
        bctx.fillRect(tx + 13, ty - 4, 3, 6);

        // "VIP LOCA" Rozet Yazısı
        bctx.fillStyle = "#facc15";
        bctx.font = "bold 8.5px 'Segoe UI', sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("👑 VIP PREMİUM LOCA", centerX, 312);

        bctx.restore();
    }

    /**
     * 4.2. YENİ SANALİKA İZOMETRİK LOUNGE KANEPE GRUBU (Sol Alt Köşe)
     * 2:1 True Dimetric Sanalika Bej Deri Kanepe, Bordo & Yeşil Kırlentler, Krom Kızak Ayakları
     * Referans görsellere (media_1793984363122) %100 birebir uyumlu
     * Her iki koltuk da salon perspektifine uygun olarak Sağ-Aşağıya (down-right) bakar.
     */
    function drawIsometricSanalikaLounge(bctx) {
        bctx.save();
        const scale = 1.18;

        // 1. SOL İZOMETRİK KANEPE (Yüzü SAĞ-ALTA / down-right Bakan)
        bctx.save();
        bctx.translate(150, 385);
        bctx.scale(-scale, scale);
        drawIsoSofaRight(bctx, 0, 0);
        bctx.restore();

        // 2. SAĞ İZOMETRİK KANEPE (Yüzü SOL-ALTA / down-left Bakan)
        bctx.save();
        bctx.translate(200, 425);
        bctx.scale(scale, scale);
        drawIsoSofaRight(bctx, 0, 0);
        bctx.restore();

        // 3. ORTA KAHVE SEHPASI (İki koltuğun ortasında orantılı büyütülmüş)
        drawIsoCoffeeTable(bctx, 175, 465, scale);

        bctx.restore();
    }

    /**
     * Gerçekçi Sanalika 2:1 Pofuduk İzometrik Koltuk (Sağ-Aşağı Bakan)
     * Özellikler:
     * - Pofuduk yuvarlatılmış kavisler (Bézier rounded beveling)
     * - Gradyanlı deri dokuları (3D hacimli ışık geçişi)
     * - İnce 1px krem dikiş fitilleri (Piping highlights)
     * - Minder bombesi ve Ambient Occlusion yarık gölgeleri
     * - Parlak metalik krom kızak ray ayakları
     */
    function drawIsoSofaRight(ctx, ox, oy) {
        ctx.save();

        // 1. Yumuşak Zemin Temas Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(ox + 42, oy + 32, 48, 18, 0.44, 0, Math.PI * 2);
        ctx.fill();

        // 2. Krom Kızak Ayaklar (Metalik Çift Ray)
        let chromeGrad = ctx.createLinearGradient(ox, oy + 26, ox, oy + 50);
        chromeGrad.addColorStop(0, "#f8fafc");
        chromeGrad.addColorStop(0.5, "#cbd5e1");
        chromeGrad.addColorStop(1, "#475569");

        ctx.strokeStyle = chromeGrad;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";

        // Ön ray
        ctx.beginPath();
        ctx.moveTo(ox + 6, oy + 32);
        ctx.lineTo(ox + 46, oy + 52);
        ctx.stroke();

        // Arka ray
        ctx.beginPath();
        ctx.moveTo(ox + 38, oy + 14);
        ctx.lineTo(ox + 72, oy + 31);
        ctx.stroke();

        // Ayak bağlantı pimleri
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ox + 9, oy + 29); ctx.lineTo(ox + 9, oy + 34);
        ctx.moveTo(ox + 43, oy + 46); ctx.lineTo(ox + 43, oy + 51);
        ctx.moveTo(ox + 41, oy + 12); ctx.lineTo(ox + 41, oy + 16);
        ctx.moveTo(ox + 69, oy + 25); ctx.lineTo(ox + 69, oy + 29);
        ctx.stroke();

        // Renk Paleti (Sanalika Sıcak Deri Tonları)
        const C_LIGHT_TOP = "#ebd6be";
        const C_LIGHT_BOT = "#dcbf9f";
        const C_MID_TOP   = "#cca782";
        const C_MID_BOT   = "#af8763";
        const C_DARK_SIDE = "#956f4d";
        const C_CREVICE   = "rgba(50, 30, 15, 0.55)";
        const C_PIPING    = "rgba(255, 245, 235, 0.75)";

        // 3. Sol Arka Kolçak (Uzak Kolçak)
        ctx.fillStyle = C_DARK_SIDE;
        ctx.beginPath();
        ctx.moveTo(ox + 14, oy + 2);
        ctx.lineTo(ox + 25, oy - 3.5);
        ctx.lineTo(ox + 25, oy + 8);
        ctx.lineTo(ox + 14, oy + 14);
        ctx.closePath();
        ctx.fill();

        // Sol kolçak üst yüzeyi (Kavisli pah)
        let armTopGrad = ctx.createLinearGradient(ox + 14, oy + 2, ox + 35, oy + 2);
        armTopGrad.addColorStop(0, C_LIGHT_TOP);
        armTopGrad.addColorStop(1, C_LIGHT_BOT);
        ctx.fillStyle = armTopGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 14, oy + 2);
        ctx.quadraticCurveTo(ox + 19, oy - 2, ox + 25, oy - 3.5);
        ctx.lineTo(ox + 35, oy + 1.5);
        ctx.quadraticCurveTo(ox + 30, oy + 5, ox + 24, oy + 7);
        ctx.closePath();
        ctx.fill();

        // Sol kolçak ön yüzeyi
        let armFrontGrad = ctx.createLinearGradient(ox + 24, oy + 7, ox + 35, oy + 14);
        armFrontGrad.addColorStop(0, C_MID_TOP);
        armFrontGrad.addColorStop(1, C_MID_BOT);
        ctx.fillStyle = armFrontGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 24, oy + 7);
        ctx.lineTo(ox + 35, oy + 1.5);
        ctx.lineTo(ox + 35, oy + 14);
        ctx.quadraticCurveTo(ox + 30, oy + 18, ox + 24, oy + 19);
        ctx.closePath();
        ctx.fill();

        // 4. Arka Sırtlık (Gövdeye Yaslı Dolgun Sırt)
        let backTopGrad = ctx.createLinearGradient(ox + 25, oy - 4, ox + 65, oy + 16);
        backTopGrad.addColorStop(0, "#f3e3ce");
        backTopGrad.addColorStop(1, "#dfcaa8");
        ctx.fillStyle = backTopGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 25, oy - 3.5);
        ctx.lineTo(ox + 65, oy + 16.5);
        ctx.quadraticCurveTo(ox + 62, oy + 19, ox + 58, oy + 20.5);
        ctx.lineTo(ox + 18, oy + 0.5);
        ctx.quadraticCurveTo(ox + 21, oy - 2, ox + 25, oy - 3.5);
        ctx.closePath();
        ctx.fill();

        // Sırtlık üst kenar ışığı (Dikiş fitili)
        ctx.strokeStyle = C_PIPING;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(ox + 25, oy - 3.5);
        ctx.lineTo(ox + 65, oy + 16.5);
        ctx.stroke();

        // Sırt ön yüzeyi (Deri Yanak)
        let backFrontGrad = ctx.createLinearGradient(ox + 18, oy + 1, ox + 58, oy + 21);
        backFrontGrad.addColorStop(0, C_MID_TOP);
        backFrontGrad.addColorStop(1, C_MID_BOT);
        ctx.fillStyle = backFrontGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 18, oy + 0.5);
        ctx.lineTo(ox + 58, oy + 20.5);
        ctx.lineTo(ox + 58, oy + 30);
        ctx.lineTo(ox + 18, oy + 10);
        ctx.closePath();
        ctx.fill();

        // Sırtlık ortası dikey dikiş yarığı
        ctx.strokeStyle = C_CREVICE;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(ox + 38, oy + 10.5);
        ctx.lineTo(ox + 38, oy + 25);
        ctx.stroke();

        // 5. Kırlentler (Yeşil Kadife Kare & Bordo Silindirik)
        ctx.save();
        // Kırlent gölgesi
        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath(); ctx.ellipse(ox + 32, oy + 17, 7, 3, 0.4, 0, Math.PI * 2); ctx.fill();

        // Yeşil kadife kırlent
        let greenGrad = ctx.createLinearGradient(ox + 23, oy + 2, ox + 35, oy + 18);
        greenGrad.addColorStop(0, "#22c55e");
        greenGrad.addColorStop(0.5, "#15803d");
        greenGrad.addColorStop(1, "#14532d");
        ctx.fillStyle = greenGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 25, oy + 4);
        ctx.quadraticCurveTo(ox + 30, oy + 2, ox + 35, oy + 4.5);
        ctx.quadraticCurveTo(ox + 38, oy + 10, ox + 36, oy + 17);
        ctx.quadraticCurveTo(ox + 30, oy + 19, ox + 25, oy + 17);
        ctx.quadraticCurveTo(ox + 23, oy + 11, ox + 25, oy + 4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#166534"; ctx.lineWidth = 0.8; ctx.stroke();

        // Bordo kadife silindirik kırlent
        let redGrad = ctx.createLinearGradient(ox + 30, oy + 10, ox + 42, oy + 20);
        redGrad.addColorStop(0, "#f43f5e");
        redGrad.addColorStop(0.5, "#be123c");
        redGrad.addColorStop(1, "#881337");
        ctx.fillStyle = redGrad;
        ctx.beginPath();
        ctx.ellipse(ox + 37, oy + 15, 6, 7, 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#4c0519"; ctx.lineWidth = 0.8; ctx.stroke();

        // Kumaş dikiş düğmesi
        ctx.fillStyle = "#ffe4e6";
        ctx.beginPath(); ctx.arc(ox + 36, oy + 14, 1.2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Sırtlık altı temas gölgesi (Ambient Occlusion)
        ctx.strokeStyle = C_CREVICE;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(ox + 17, oy + 10);
        ctx.lineTo(ox + 58, oy + 30.5);
        ctx.stroke();

        // 6. Oturma Minderleri (Pofuduk Bombe & Dikiş Fitilli)
        // Sol Minder
        drawPlumpIsoCushion(ctx, ox + 13, oy + 9, ox + 34, oy + 19.5, ox + 23, oy + 25.5, ox + 2, oy + 15, C_LIGHT_TOP, C_LIGHT_BOT, C_MID_TOP, C_MID_BOT, C_PIPING, C_CREVICE);

        // Sağ Minder
        drawPlumpIsoCushion(ctx, ox + 35, oy + 20, ox + 56, oy + 30.5, ox + 45, oy + 36.5, ox + 24, oy + 26, C_LIGHT_TOP, C_LIGHT_BOT, C_MID_TOP, C_MID_BOT, C_PIPING, C_CREVICE);

        // İki minder arası derin dikiş yarığı
        ctx.strokeStyle = C_CREVICE;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(ox + 34.5, oy + 20);
        ctx.lineTo(ox + 23.5, oy + 32.5);
        ctx.stroke();

        // Koltuk Ön Alt Eteği
        let skirtGrad = ctx.createLinearGradient(ox + 2, oy + 23, ox + 44, oy + 44);
        skirtGrad.addColorStop(0, C_MID_BOT);
        skirtGrad.addColorStop(1, "#835f3e");
        ctx.fillStyle = skirtGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 2, oy + 22.5);
        ctx.lineTo(ox + 44, oy + 43.5);
        ctx.lineTo(ox + 44, oy + 48);
        ctx.lineTo(ox + 2, oy + 27);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 0.6; ctx.stroke();

        // 7. Sağ Ön Kolçak (Bize Yakın Kolçak - Dolgun & Kavisli)
        ctx.fillStyle = C_DARK_SIDE;
        ctx.beginPath();
        ctx.moveTo(ox + 44, oy + 30);
        ctx.lineTo(ox + 55, oy + 24.5);
        ctx.lineTo(ox + 55, oy + 43.5);
        ctx.lineTo(ox + 44, oy + 49);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = C_CREVICE;
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(ox + 44, oy + 30); ctx.lineTo(ox + 44, oy + 49); ctx.stroke();

        let nearArmTopGrad = ctx.createLinearGradient(ox + 44, oy + 30, ox + 66, oy + 30);
        nearArmTopGrad.addColorStop(0, "#f5e6d3");
        nearArmTopGrad.addColorStop(1, "#dfcaa8");
        ctx.fillStyle = nearArmTopGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 44, oy + 30);
        ctx.quadraticCurveTo(ox + 49, oy + 26, ox + 55, oy + 24.5);
        ctx.quadraticCurveTo(ox + 61, oy + 27, ox + 66, oy + 30);
        ctx.quadraticCurveTo(ox + 60, oy + 34, ox + 55, oy + 36);
        ctx.quadraticCurveTo(ox + 49, oy + 33, ox + 44, oy + 30);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = C_PIPING;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(ox + 44, oy + 30);
        ctx.quadraticCurveTo(ox + 49, oy + 26, ox + 55, oy + 24.5);
        ctx.quadraticCurveTo(ox + 61, oy + 27, ox + 66, oy + 30);
        ctx.stroke();

        let nearArmFrontGrad = ctx.createLinearGradient(ox + 55, oy + 36, ox + 66, oy + 45);
        nearArmFrontGrad.addColorStop(0, C_MID_TOP);
        nearArmFrontGrad.addColorStop(1, C_MID_BOT);
        ctx.fillStyle = nearArmFrontGrad;
        ctx.beginPath();
        ctx.moveTo(ox + 55, oy + 36);
        ctx.lineTo(ox + 66, oy + 30);
        ctx.lineTo(ox + 66, oy + 44.5);
        ctx.quadraticCurveTo(ox + 61, oy + 48, ox + 55, oy + 50.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 0.8; ctx.stroke();

        ctx.restore();
    }

    /**
     * Pofuduk İzometrik Koltuk Minderi Çizici (Bombe & Dikiş Fitilli)
     */
    function drawPlumpIsoCushion(ctx, x1, y1, x2, y2, x3, y3, x4, y4, cTop1, cTop2, cFront1, cFront2, cPiping, cCrevice) {
        let topGrad = ctx.createLinearGradient(x4, y4, x2, y2);
        topGrad.addColorStop(0, cTop1);
        topGrad.addColorStop(1, cTop2);
        ctx.fillStyle = topGrad;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo((x1 + x2)/2, (y1 + y2)/2 - 1.5, x2, y2);
        ctx.quadraticCurveTo((x2 + x3)/2 + 1, (y2 + y3)/2, x3, y3);
        ctx.quadraticCurveTo((x3 + x4)/2, (y3 + y4)/2 + 1.5, x4, y4);
        ctx.quadraticCurveTo((x4 + x1)/2 - 1, (y4 + y1)/2, x1, y1);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = cPiping;
        ctx.lineWidth = 0.9;
        ctx.stroke();

        let frontGrad = ctx.createLinearGradient(x4, y4, x3, y3 + 7);
        frontGrad.addColorStop(0, cFront1);
        frontGrad.addColorStop(1, cFront2);
        ctx.fillStyle = frontGrad;
        ctx.beginPath();
        ctx.moveTo(x4, y4);
        ctx.quadraticCurveTo((x4 + x3)/2, (y4 + y3)/2 + 1.2, x3, y3);
        ctx.lineTo(x3, y3 + 6.5);
        ctx.quadraticCurveTo((x3 + x4)/2, (y3 + y4)/2 + 7.5, x4, y4 + 6.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.18)"; ctx.lineWidth = 0.7; ctx.stroke();

        ctx.strokeStyle = cCrevice;
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(x4, y4 + 6.5);
        ctx.lineTo(x3, y3 + 6.5);
        ctx.stroke();
    }

    /**
     * İzometrik 2:1 Koltuk (Sol-Aşağı Bakan)
     */
    function drawIsoSofaLeft(ctx, ox, oy) {
        ctx.save();

        // Zemin Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.moveTo(ox + 8, oy + 18);
        ctx.lineTo(ox - 42, oy - 6);
        ctx.lineTo(ox - 98, oy + 22);
        ctx.lineTo(ox - 48, oy + 46);
        ctx.closePath();
        ctx.fill();

        // Krom Kızak Ayaklar
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(ox - 4, oy + 30);
        ctx.lineTo(ox - 48, oy + 52);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ox - 32, oy + 12);
        ctx.lineTo(ox - 70, oy + 31);
        ctx.stroke();

        // Renkler
        const C_LIGHT = "#e8d5b7";
        const C_MID   = "#cbb092";
        const C_DARK  = "#af9375";
        const C_LINE  = "#8c7255";

        // Sağ Arka Kolçak
        ctx.fillStyle = C_LIGHT;
        ctx.beginPath();
        ctx.moveTo(ox - 14, oy + 2);
        ctx.lineTo(ox - 25, oy - 3.5);
        ctx.lineTo(ox - 35, oy + 1.5);
        ctx.lineTo(ox - 24, oy + 7);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = C_LINE; ctx.lineWidth = 0.8; ctx.stroke();

        ctx.fillStyle = C_DARK;
        ctx.beginPath();
        ctx.moveTo(ox - 24, oy + 7);
        ctx.lineTo(ox - 35, oy + 1.5);
        ctx.lineTo(ox - 35, oy + 14);
        ctx.lineTo(ox - 24, oy + 19);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Arka Sırtlık
        ctx.fillStyle = C_LIGHT;
        ctx.beginPath();
        ctx.moveTo(ox - 25, oy - 3.5);
        ctx.lineTo(ox - 65, oy + 16.5);
        ctx.lineTo(ox - 57, oy + 20);
        ctx.lineTo(ox - 18, oy);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = C_DARK;
        ctx.beginPath();
        ctx.moveTo(ox - 18, oy);
        ctx.lineTo(ox - 65, oy + 16.5);
        ctx.lineTo(ox - 65, oy + 27.5);
        ctx.lineTo(ox - 18, oy + 11);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Kırlentler (Yeşil & Bordo)
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(ox - 24, oy + 3);
        ctx.lineTo(ox - 34, oy + 8);
        ctx.lineTo(ox - 34, oy + 19);
        ctx.lineTo(ox - 24, oy + 14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#166534"; ctx.lineWidth = 0.7; ctx.stroke();
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.moveTo(ox - 24, oy + 3);
        ctx.lineTo(ox - 29, oy + 0.5);
        ctx.lineTo(ox - 39, oy + 5.5);
        ctx.lineTo(ox - 34, oy + 8);
        ctx.closePath(); ctx.fill(); ctx.stroke();

        ctx.fillStyle = "#9f1239";
        ctx.beginPath();
        ctx.ellipse(ox - 36, oy + 14, 5.5, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#881337"; ctx.stroke();
        ctx.fillStyle = "#f43f5e";
        ctx.beginPath(); ctx.arc(ox - 35, oy + 12, 1.8, 0, Math.PI * 2); ctx.fill();

        // Oturma Minderleri
        // 1. Minder (Sağdaki)
        ctx.fillStyle = C_LIGHT;
        ctx.beginPath();
        ctx.moveTo(ox - 13, oy + 10);
        ctx.lineTo(ox - 34, oy + 20.5);
        ctx.lineTo(ox - 23, oy + 26);
        ctx.lineTo(ox - 2, oy + 15.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = C_DARK;
        ctx.beginPath();
        ctx.moveTo(ox - 2, oy + 15.5);
        ctx.lineTo(ox - 23, oy + 26);
        ctx.lineTo(ox - 23, oy + 33);
        ctx.lineTo(ox - 2, oy + 22.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // 2. Minder (Soldaki)
        ctx.fillStyle = C_LIGHT;
        ctx.beginPath();
        ctx.moveTo(ox - 34, oy + 20.5);
        ctx.lineTo(ox - 55, oy + 31);
        ctx.lineTo(ox - 44, oy + 36.5);
        ctx.lineTo(ox - 23, oy + 26);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = C_DARK;
        ctx.beginPath();
        ctx.moveTo(ox - 23, oy + 26);
        ctx.lineTo(ox - 44, oy + 36.5);
        ctx.lineTo(ox - 44, oy + 43.5);
        ctx.lineTo(ox - 23, oy + 33);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Koltuk Ön Alt Eteği
        ctx.fillStyle = C_DARK;
        ctx.beginPath();
        ctx.moveTo(ox - 2, oy + 22.5);
        ctx.lineTo(ox - 44, oy + 43.5);
        ctx.lineTo(ox - 44, oy + 47.5);
        ctx.lineTo(ox - 2, oy + 26.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Sol Ön Kolçak (Bize yakın kolçak)
        ctx.fillStyle = C_LIGHT;
        ctx.beginPath();
        ctx.moveTo(ox - 44, oy + 31);
        ctx.lineTo(ox - 55, oy + 25.5);
        ctx.lineTo(ox - 66, oy + 31);
        ctx.lineTo(ox - 55, oy + 36.5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = C_DARK;
        ctx.beginPath();
        ctx.moveTo(ox - 55, oy + 36.5);
        ctx.lineTo(ox - 66, oy + 31);
        ctx.lineTo(ox - 66, oy + 45.5);
        ctx.lineTo(ox - 55, oy + 51);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.restore();
    }

    /**
     * İzometrik Kompakt Sehpa (Cam & Krom)
     */
    function drawIsoCoffeeTable(ctx, cx, cy, scale = 1.0) {
        ctx.save();
        ctx.translate(cx, cy);
        if (scale !== 1.0) ctx.scale(scale, scale);

        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(0, 10, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cam Üst Yüzey (İzometrik Rhombus)
        ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(18, 1);
        ctx.lineTo(0, 10);
        ctx.lineTo(-18, 1);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Krom Ayak
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(0, 16);
        ctx.stroke();
        ctx.restore();
    }

    /**
     * 4.5. SANALİKA TARZI 2.5D MODERN L-SECTIONAL LOUNGE KANEPE GRUBU (Sağ Taraf)
     * L-Formunda: 3 Minderli Ana Koltuk (Aşağıya Bakan) + 2.5D İzometrik Yan Koltuk (Sola Bakan)
     * Masasız, Halısız (Mermer Zemin Korundu), Çakışmayan Ferah Düzen ve Palmiyeli
     */
    function drawSanalikaLoungeSectional(bctx) {
        bctx.save();

        // ==========================================
        // 1. ANA KOLTUK (Yatay - Aşağıya/Güneye Bakan)
        // ==========================================
        const hX = 710;
        const hY = 385; // Tekin tezgahı ile ferah mesafe
        const hW = 146; // 3 kişilik kompakt genişlik
        const hH = 36;  // Kompakt izometrik derinlik
        const cCount = 3;
        const armW = 9;
        const cW = (hW - armW - 4) / cCount; // ~44.3px minder

        // Doğal yumuşak zemin gölgesi (Halı YOK, mermer zemin korunur)
        bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        bctx.beginPath();
        bctx.roundRect(hX - 3, hY + 4, hW + 6, hH + 5, 5);
        bctx.fill();

        // Taban çıtası
        bctx.fillStyle = "#0f172a";
        bctx.beginPath();
        bctx.roundRect(hX + 2, hY + hH - 3, hW - 4, 5, 2);
        bctx.fill();
        bctx.strokeStyle = "#475569";
        bctx.lineWidth = 0.8;
        bctx.stroke();

        // Sırtlık Üst Şeridi (Kuzey Bevel)
        let topGrad = bctx.createLinearGradient(hX, hY, hX, hY + 5);
        topGrad.addColorStop(0, "#ffffff");
        topGrad.addColorStop(1, "#e2e8f0");
        bctx.fillStyle = topGrad;
        bctx.beginPath();
        bctx.roundRect(hX + 3, hY, hW - 6, 5, [3, 3, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#cbd5e1";
        bctx.lineWidth = 0.8;
        bctx.stroke();

        // 3 Sırtlık Yastığı (12px)
        const backH = 12;
        for (let i = 0; i < cCount; i++) {
            let cx = hX + armW + i * cW;
            let bg = bctx.createLinearGradient(cx, hY + 5, cx, hY + 5 + backH);
            bg.addColorStop(0, "#ffffff");
            bg.addColorStop(0.5, "#f1f5f9");
            bg.addColorStop(1, "#cbd5e1");
            bctx.fillStyle = bg;
            bctx.beginPath();
            bctx.roundRect(cx + 1, hY + 5, cW - 2, backH, 2.5);
            bctx.fill();
            bctx.strokeStyle = "#94a3b8";
            bctx.lineWidth = 0.8;
            bctx.stroke();

            // Dikey Dikiş
            bctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
            bctx.lineWidth = 0.7;
            bctx.beginPath();
            bctx.moveTo(cx + cW / 2, hY + 6);
            bctx.lineTo(cx + cW / 2, hY + 5 + backH - 1);
            bctx.stroke();
        }

        // 3 Oturma Minderi (Aşağı bakan, izometrik dar derinlik)
        const seatY = hY + 17;
        const seatH = 13;
        const dropH = 5;

        for (let i = 0; i < cCount; i++) {
            let cx = hX + armW + i * cW;

            // Üst Yüzey
            let sGrad = bctx.createLinearGradient(cx, seatY, cx, seatY + seatH);
            sGrad.addColorStop(0, "#ffffff");
            sGrad.addColorStop(0.6, "#f8fafc");
            sGrad.addColorStop(1, "#e2e8f0");
            bctx.fillStyle = sGrad;
            bctx.beginPath();
            bctx.roundRect(cx + 1, seatY, cW - 2, seatH, [2, 2, 0, 0]);
            bctx.fill();
            bctx.strokeStyle = "#cbd5e1";
            bctx.lineWidth = 0.8;
            bctx.stroke();

            // Ön Yanak
            let dGrad = bctx.createLinearGradient(cx, seatY + seatH, cx, seatY + seatH + dropH);
            dGrad.addColorStop(0, "#e2e8f0");
            dGrad.addColorStop(1, "#94a3b8");
            bctx.fillStyle = dGrad;
            bctx.beginPath();
            bctx.roundRect(cx + 1, seatY + seatH, cW - 2, dropH, [0, 0, 2.5, 2.5]);
            bctx.fill();
            bctx.strokeStyle = "#64748b";
            bctx.lineWidth = 0.8;
            bctx.stroke();

            // Fitil Dikişi
            bctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
            bctx.lineWidth = 0.8;
            bctx.beginPath();
            bctx.moveTo(cx + 2, seatY + seatH);
            bctx.lineTo(cx + cW - 2, seatY + seatH);
            bctx.stroke();
        }

        // Sol Kolçak
        let armLGrad = bctx.createLinearGradient(hX, hY + 2, hX + armW, hY + 2);
        armLGrad.addColorStop(0, "#ffffff");
        armLGrad.addColorStop(1, "#cbd5e1");
        bctx.fillStyle = armLGrad;
        bctx.beginPath();
        bctx.roundRect(hX, hY + 2, armW, hH - 2, [3, 2, 2, 3]);
        bctx.fill();
        bctx.strokeStyle = "#94a3b8";
        bctx.lineWidth = 0.8;
        bctx.stroke();

        // Bordo Kırlent
        bctx.save();
        bctx.translate(hX + 13, hY + 21);
        bctx.rotate(-0.25);
        let pilGrad = bctx.createRadialGradient(0, 0, 1, 0, 0, 8);
        pilGrad.addColorStop(0, "#f43f5e");
        pilGrad.addColorStop(0.6, "#be123c");
        pilGrad.addColorStop(1, "#881337");
        bctx.fillStyle = pilGrad;
        bctx.beginPath();
        bctx.roundRect(-6, -6, 12, 12, 3);
        bctx.fill();
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 0.8;
        bctx.stroke();
        bctx.fillStyle = "#fef08a";
        bctx.beginPath(); bctx.arc(0, 0, 1.2, 0, Math.PI * 2); bctx.fill();
        bctx.restore();

        // ==============================================================
        // 2. SAĞDAKİ YENİ 2.5D İZOMETRİK KANEPE (SOLA BAKAN)
        // Ana koltuktan daha sağa alındı (çakışma sıfırlandı)
        // Kuşbakışı değil, gerçekçi 2.5D derinlikli kavisli kolçak & minderler
        // ==============================================================
        const vX = hX + hW + 10; // 866 (Daha sağda)
        const vY = hY + 26;      // 411 (Ana koltuğun altından uzanır)
        const vW = 44;           // 2.5D derinlik
        const vH = 110;          // Koltuk dikey boyu
        const vCushCount = 2;
        const vArmH = 12;        // Güney kolçağı
        const vNorthArmH = 10;   // Kuzey kolçağı
        const vSeatAreaH = vH - vArmH - vNorthArmH; // 88px
        const vCushH = vSeatAreaH / vCushCount;     // 44px

        // 1. Zemin Gölgesi (2.5D Güneydoğuya yumuşak gölge)
        bctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        bctx.beginPath();
        bctx.roundRect(vX + 4, vY + 4, vW + 8, vH + 6, 8);
        bctx.fill();

        // 2. Ahşap/Krom Taban
        bctx.fillStyle = "#0f172a";
        bctx.beginPath();
        bctx.roundRect(vX + 6, vY + 4, vW - 8, vH - 6, 3);
        bctx.fill();

        // 3. Masif Sırtlık Gövdesi (Sağ Duvara Yaslı - x: vX + vW - 14 .. vX + vW)
        const backX = vX + vW - 14;
        const backW = 14;

        let backGrad = bctx.createLinearGradient(backX, 0, backX + backW, 0);
        backGrad.addColorStop(0, "#94a3b8");
        backGrad.addColorStop(0.3, "#cbd5e1");
        backGrad.addColorStop(0.8, "#f1f5f9");
        backGrad.addColorStop(1, "#ffffff");
        bctx.fillStyle = backGrad;
        bctx.beginPath();
        bctx.roundRect(backX, vY, backW, vH, [4, 6, 6, 4]);
        bctx.fill();
        bctx.strokeStyle = "#64748b";
        bctx.lineWidth = 0.8;
        bctx.stroke();

        // 4. İki Adet Kabarık Sırtlık Yastığı (Dikiş & Düğmeli)
        for (let i = 0; i < vCushCount; i++) {
            let cy = vY + vNorthArmH + i * vCushH;
            let cGrad = bctx.createLinearGradient(backX, cy, backX + backW, cy);
            cGrad.addColorStop(0, "#64748b");
            cGrad.addColorStop(0.2, "#cbd5e1");
            cGrad.addColorStop(0.7, "#f8fafc");
            cGrad.addColorStop(1, "#ffffff");
            bctx.fillStyle = cGrad;
            bctx.beginPath();
            bctx.roundRect(backX + 1, cy + 2, backW - 2, vCushH - 4, 3);
            bctx.fill();
            bctx.strokeStyle = "#94a3b8";
            bctx.lineWidth = 0.8;
            bctx.stroke();

            // Deri Düğme
            bctx.fillStyle = "#cbd5e1";
            bctx.beginPath();
            bctx.arc(backX + backW / 2, cy + vCushH / 2, 2, 0, Math.PI * 2);
            bctx.fill();
        }

        // 5. 2.5D Oturma Minderleri (Sola / Batıya Bakan)
        const seatW = backX - (vX + 8);
        const dropW = 8;

        for (let i = 0; i < vCushCount; i++) {
            let cy = vY + vNorthArmH + i * vCushH;

            // Minder Oturma Üst Yüzeyi
            let msGrad = bctx.createLinearGradient(vX + dropW, cy, backX, cy);
            msGrad.addColorStop(0, "#ffffff");
            msGrad.addColorStop(0.5, "#f1f5f9");
            msGrad.addColorStop(1, "#cbd5e1");
            bctx.fillStyle = msGrad;
            bctx.beginPath();
            bctx.roundRect(vX + dropW, cy + 1, seatW, vCushH - 2, [0, 2, 2, 0]);
            bctx.fill();
            bctx.strokeStyle = "#cbd5e1";
            bctx.lineWidth = 0.8;
            bctx.stroke();

            // Sol Ön Düşüş Yanağı (2.5D Kalınlık)
            let mdGrad = bctx.createLinearGradient(vX, cy, vX + dropW, cy);
            mdGrad.addColorStop(0, "#64748b");
            mdGrad.addColorStop(0.4, "#94a3b8");
            mdGrad.addColorStop(1, "#e2e8f0");
            bctx.fillStyle = mdGrad;
            bctx.beginPath();
            bctx.roundRect(vX, cy + 1, dropW, vCushH - 2, [3, 0, 0, 3]);
            bctx.fill();
            bctx.strokeStyle = "#475569";
            bctx.lineWidth = 0.8;
            bctx.stroke();

            // Beyaz Dikiş Fitili
            bctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
            bctx.lineWidth = 1;
            bctx.beginPath();
            bctx.moveTo(vX + dropW, cy + 2);
            bctx.lineTo(vX + dropW, cy + vCushH - 2);
            bctx.stroke();
        }

        // 6. KUZEY KOLÇAK (Üst Köşe 2.5D Kolçak)
        let nArmGrad = bctx.createLinearGradient(vX, vY, vX + vW, vY);
        nArmGrad.addColorStop(0, "#cbd5e1");
        nArmGrad.addColorStop(0.5, "#f8fafc");
        nArmGrad.addColorStop(1, "#ffffff");
        bctx.fillStyle = nArmGrad;
        bctx.beginPath();
        bctx.roundRect(vX, vY, vW - 12, vNorthArmH, [4, 4, 2, 2]);
        bctx.fill();
        bctx.strokeStyle = "#94a3b8";
        bctx.lineWidth = 0.8;
        bctx.stroke();

        // 7. GÜNEY KOLÇAK (Ön Uç - Yuvarlak 2.5D Deri Kolçak)
        const sArmY = vY + vH - vArmH;
        let sArmGrad = bctx.createLinearGradient(vX, sArmY, vX, sArmY + vArmH);
        sArmGrad.addColorStop(0, "#ffffff");
        sArmGrad.addColorStop(0.4, "#f1f5f9");
        sArmGrad.addColorStop(1, "#94a3b8");
        bctx.fillStyle = sArmGrad;
        bctx.beginPath();
        bctx.roundRect(vX, sArmY, vW, vArmH, [3, 3, 6, 6]);
        bctx.fill();
        bctx.strokeStyle = "#64748b";
        bctx.lineWidth = 0.8;
        bctx.stroke();

        // Kolçak ön fitili
        bctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        bctx.lineWidth = 0.9;
        bctx.beginPath();
        bctx.moveTo(vX + 2, sArmY + 2);
        bctx.lineTo(vX + vW - 2, sArmY + 2);
        bctx.stroke();

        // ==========================================
        // 3. İÇ MEKAN PALMİYESİ (Sağ Köşede Duvara Dayalı)
        // ==========================================
        const plantX = vX + vW + 16, plantY = vY + 24;
        bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        bctx.beginPath();
        bctx.ellipse(plantX, plantY + 14, 11, 4.5, 0, 0, Math.PI * 2);
        bctx.fill();

        // Saksı
        bctx.fillStyle = "#1e293b";
        bctx.beginPath();
        bctx.moveTo(plantX - 9, plantY);
        bctx.lineTo(plantX + 9, plantY);
        bctx.lineTo(plantX + 6, plantY + 14);
        bctx.lineTo(plantX - 6, plantY + 14);
        bctx.closePath();
        bctx.fill();
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 1;
        bctx.stroke();

        bctx.fillStyle = "#78350f";
        bctx.beginPath(); bctx.ellipse(plantX, plantY, 8, 3, 0, 0, Math.PI * 2); bctx.fill();

        const leaves = [
            { a: -1.0, len: 22, col: "#15803d" },
            { a: -0.7, len: 26, col: "#16a34a" },
            { a: -0.3, len: 24, col: "#22c55e" },
            { a: 0.1, len: 28, col: "#15803d" },
            { a: 0.5, len: 23, col: "#16a34a" },
            { a: 0.9, len: 20, col: "#22c55e" },
            { a: -0.1, len: 28, col: "#4ade80" }
        ];

        leaves.forEach(lf => {
            bctx.save();
            bctx.translate(plantX, plantY - 2);
            bctx.rotate(lf.a);
            bctx.fillStyle = lf.col;
            bctx.beginPath();
            bctx.ellipse(0, -lf.len / 2, 3.5, lf.len / 2, 0, 0, Math.PI * 2);
            bctx.fill();
            bctx.restore();
        });

        bctx.restore();
    }

    /**
     * 5. TEKİNSİZ TEKİN KARABORSA TEZGAHI & MAĞAZASI (Right Area - Semihus Aydınus Masası Standardı)
     */
    function drawShadyCounter(bctx) {
        let bx = TEKIN_BOOTH.counterX || 812;
        let by = TEKIN_BOOTH.counterY || 242;
        let bw = TEKIN_BOOTH.counterW || 132;
        let bh = TEKIN_BOOTH.counterH || 50;

        bctx.save();
        // Tezgah Alt Zemin Gölgesi (Contact Shadow)
        bctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        bctx.beginPath();
        bctx.roundRect(bx - 4, by + bh - 4, bw + 8, 14, 4);
        bctx.fill();

        // Koyu Maun & Siyah Mermer Bar Tezgahı
        let cGrad = bctx.createLinearGradient(bx, by, bx + bw, by);
        cGrad.addColorStop(0, "#18181b");
        cGrad.addColorStop(0.5, "#27272a");
        cGrad.addColorStop(1, "#18181b");
        bctx.fillStyle = cGrad;
        bctx.beginPath();
        bctx.roundRect(bx, by, bw, bh, 6);
        bctx.fill();
        bctx.strokeStyle = "#3f3f46";
        bctx.lineWidth = 1;
        bctx.stroke();

        // Altın Kenar Çıtası & Pirinç Ayak Borusu
        bctx.fillStyle = "#d4af37";
        bctx.fillRect(bx, by, bw, 3.5);
        bctx.fillStyle = "#f59e0b";
        bctx.fillRect(bx + 8, by + bh - 5, bw - 16, 2.5);

        // Tezgah Üstü Karaborsa Eşyaları
        // 1. Kilitli Demir Kasa (Solda)
        bctx.fillStyle = "#334155";
        bctx.beginPath();
        bctx.roundRect(bx + 6, by - 14, 20, 15, 2.5);
        bctx.fill();
        bctx.strokeStyle = "#1e293b";
        bctx.lineWidth = 0.8;
        bctx.stroke();
        // Kasa Pirinç Şifre Kadranı
        bctx.fillStyle = "#f59e0b";
        bctx.beginPath(); bctx.arc(bx + 16, by - 6.5, 2.5, 0, Math.PI * 2); bctx.fill();
        bctx.fillStyle = "#ffffff";
        bctx.fillRect(bx + 15.3, by - 7.2, 1.4, 1.4);

        // 2. Altın Külçeleri & Deste Para
        bctx.fillStyle = "#eab308";
        bctx.fillRect(bx + 30, by - 7, 14, 8);
        bctx.fillStyle = "#ca8a04";
        bctx.fillRect(bx + 33, by - 12, 10, 5);
        // Deste Para (Yeşil & Beyaz Kuşak)
        bctx.fillStyle = "#15803d";
        bctx.fillRect(bx + 46, by - 6, 10, 7);
        bctx.fillStyle = "#f8fafc";
        bctx.fillRect(bx + 49.5, by - 6, 3, 7);

        // 3. Yeşil Zehir / Kimyasal Şişesi (Emerald Venom Vial)
        bctx.fillStyle = "#22c55e";
        bctx.beginPath();
        bctx.roundRect(bx + 60, by - 12, 8, 13, 2);
        bctx.fill();
        bctx.fillStyle = "#78350f";
        bctx.fillRect(bx + 62, by - 15, 4, 3); // Mantar tıpa
        bctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        bctx.fillRect(bx + 61, by - 10, 1.5, 8);

        // 4. Eski Pirinç Hassas Terazi
        bctx.strokeStyle = "#d4af37";
        bctx.lineWidth = 1.2;
        bctx.beginPath();
        bctx.moveTo(bx + 76, by - 1);
        bctx.lineTo(bx + 76, by - 16);
        bctx.moveTo(bx + 70, by - 13);
        bctx.lineTo(bx + 82, by - 13);
        bctx.stroke();
        // Kefeler
        bctx.fillStyle = "#ca8a04";
        bctx.beginPath(); bctx.arc(bx + 70, by - 9, 2.5, 0, Math.PI); bctx.fill();
        bctx.beginPath(); bctx.arc(bx + 82, by - 8, 2.5, 0, Math.PI); bctx.fill();

        // 5. "İTHAL" Ahşap Kaçakçı Sandığı (Sağda)
        bctx.fillStyle = "#78350f";
        bctx.beginPath();
        bctx.roundRect(bx + bw - 32, by - 18, 28, 20, 2);
        bctx.fill();
        bctx.strokeStyle = "#451a03";
        bctx.lineWidth = 1;
        bctx.stroke();
        bctx.fillStyle = "#ef4444";
        bctx.font = "bold 6.5px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("İTHAL", bx + bw - 18, by - 6);

        // 6. Tezgah Ön Tabelası (Kompakt Şık Plaka)
        bctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        bctx.beginPath();
        bctx.roundRect(bx + 12, by + 16, bw - 24, 18, 4);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 1.2;
        bctx.stroke();

        bctx.fillStyle = "#facc15";
        bctx.font = "bold 9px 'Segoe UI', sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🕵️‍♂️ KARABORSA", bx + bw / 2, by + 28.5);
        bctx.restore();
    }

    /**
     * 6. GÜNEY ÇIKIŞ KAPISI (CADDE 2'YE DÖNÜŞ)
     */
    function drawExitPortal(bctx) {
        let exitW = 160, exitH = 34;
        let exitX = (CANV_W - exitW) / 2;
        let exitY = CANV_H - exitH;

        // Kırmızı Halılı Basamaklar
        bctx.fillStyle = "#881337";
        bctx.fillRect(exitX - 15, exitY - 14, exitW + 30, 14);
        bctx.fillStyle = "#9f1239";
        bctx.fillRect(exitX - 5, exitY - 26, exitW + 10, 12);

        // Çıkış Kapı Çerçevesi
        bctx.fillStyle = "rgba(15, 23, 42, 0.96)";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.fillStyle = "#ef4444";
        bctx.fillRect(exitX, exitY, exitW, 3);

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 12px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🚪 CADDE 2'YE ÇIK ⬇", CANV_W / 2, exitY + 22);

        // Altın Bariyer & Kadife Halat Direkleri
        [exitX - 15, exitX + exitW + 15].forEach(dx => {
            bctx.fillStyle = "#d4af37";
            bctx.beginPath(); bctx.arc(dx, exitY - 26, 4, 0, Math.PI * 2); bctx.fill();
            bctx.fillRect(dx - 2, exitY - 26, 4, 26);
        });
    }

    /**
     * STATİK RENDER FONKSİYONU (bgCache)
     */
    function renderStaticVipClubTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. Zemin (Tam Ekran, Ölü Boşluksuz)
        drawVipClubFloor(bctx);

        // 2. Arka Duvar & LED Tabela & Likör Rafları
        drawVipClubBackWall(bctx);

        // 3. DJ Kabini & Hoparlör Kolonları
        drawDjBooth(bctx);

        // 4. VIP U-Lounge (Loca & Sehpa - Kompakt)
        drawVipLounge(bctx);

        // 4.5. Sol Alt Yeni Gerçek İzometrik Sanalika Lounge (Bej Deri Koltuk Grubu)
        drawIsometricSanalikaLounge(bctx);

        // 5. Sanalika 2.5D Lounge Suite (Sağ Taraf Beyaz Deri Köşe Kanepe)
        drawSanalikaLoungeSectional(bctx);

        // 6. Tekinsiz Tekin Bar Tezgahı
        drawShadyCounter(bctx);

        // 7. Güney Çıkış Kapısı
        drawExitPortal(bctx);
    }

    /**
     * Tekinsiz Tekin İçin Özel Karaborsa Konuşma Baloncuğu (Semihus Aydınus Standardı)
     */
    function drawTekinsizTekinSpeechBubble(ctx, x, y, text) {
        ctx.save();
        ctx.font = "bold 10px sans-serif";
        const textWidth = ctx.measureText(text).width;
        const padX = 12;
        const padY = 7;
        const bW = Math.max(130, textWidth + padX * 2);
        const bH = 24;
        const bX = Math.max(10, Math.min(CANV_W - bW - 10, x - bW / 2));
        const bY = y - bH;

        // Balon Arka Planı (Koyu Şık Kart & Amber Çerçeve)
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, bH, 6);
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Balon Kuyruğu (Tekin'in kasketine doğru işaret eden minik üçgen)
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.beginPath();
        ctx.moveTo(x - 5, bY + bH - 0.5);
        ctx.lineTo(x + 5, bY + bH - 0.5);
        ctx.lineTo(x, bY + bH + 6);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x - 5, bY + bH - 0.5);
        ctx.lineTo(x, bY + bH + 6);
        ctx.lineTo(x + 5, bY + bH - 0.5);
        ctx.stroke();

        // Metin
        ctx.fillStyle = "#fef08a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, bX + bW / 2, bY + bH / 2);
        ctx.restore();
    }

    /**
     * TEKİNSİZ TEKİN NPC ÇİZİMİ (2.5D Semihus Aydınus Standardı Tam Model)
     * Güvenilmez, serseri, sokak stili karaborsacı:
     * - Biker combat botları (kalın kauçuk taban, gümüş tokalar)
     * - Serseri kargo pantolon, sarkan gümüş cüzdan zinciri
     * - Siyah hançer/kurukafa baskılı iç tişört, açık biker deri yelek (omuz zımbalı, fermuarlı, geniş klapalı)
     * - Gümüş kolye, sol kolda sokak dövmesi & çivili deri bileklik, sağ elde parıldayan altın karaborsa sikkesi
     * - Kirli sakal, sinsi sağa-sola bakan gözler, kaş üzerinden geçen jilet yarası izi
     * - Alaycı sırıtış, köşeden tüten dumanlı puro, yan yatırılmış serseri kasketi
     * - Semihus Aydınus standardı amber isim etiketi, [E] etkileşim pili ve 60 saniyede bir replik baloncukları
     */
    function drawTekinsizTekinNPC(ctx, npcX, npcY, now, myP, mouseX, mouseY) {
        const scale = 1.25; // Semihus Aydınus standardı %25 büyütme
        const groundY = npcY + 16; // Ayakların yere bastığı zemin temas noktası
        const dist = (myP && typeof myP.x === 'number') ? Math.hypot(myP.x - npcX, myP.y - npcY) : 999;
        const isHover = (mouseX >= npcX - 45 && mouseX <= npcX + 45 && mouseY >= npcY - 70 && mouseY <= npcY + 30);

        ctx.save();
        // Zemin temas noktası referans alınarak %25 büyütme
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
        const breathe = Math.sin(now / 480) * 1.1;
        const glance = Math.sin(now / 850);
        const coinGlint = (Math.sin(now / 320) > 0.65);

        // A) Serseri Biker / Askeri Çöl-Sokak Botları (Chunky Outlaw Lug Boots)
        ctx.fillStyle = "#18181b";
        ctx.fillRect(npcX - 7.5, npcY + 10, 6.5, 7.5);
        ctx.fillRect(npcX + 1.5, npcY + 10, 6.5, 7.5);
        // Kalın Tırtıklı Kauçuk Taban
        ctx.fillStyle = "#27272a";
        ctx.fillRect(npcX - 8, npcY + 14.5, 7.5, 3.2);
        ctx.fillRect(npcX + 1, npcY + 14.5, 7.5, 3.2);
        // Gümüş Tokalar & Metal Bağcık Kuşgözleri
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(npcX - 7.5, npcY + 11.5, 2, 1.2);
        ctx.fillRect(npcX - 3, npcY + 11.5, 2, 1.2);
        ctx.fillRect(npcX + 1.5, npcY + 11.5, 2, 1.2);
        ctx.fillRect(npcX + 6, npcY + 11.5, 2, 1.2);

        // B) Serseri Punk / Kargo Pantolon & Sarkan Cüzdan Zinciri
        ctx.fillStyle = "#1f242d";
        ctx.fillRect(npcX - 8.5, npcY - 1, 7.5, 12);
        ctx.fillRect(npcX + 1, npcY - 1, 7.5, 12);
        // Kargo Yan Cepleri & Dikişler
        ctx.fillStyle = "#181c24";
        ctx.fillRect(npcX - 9, npcY + 3, 2, 5);
        ctx.fillRect(npcX + 7, npcY + 3, 2, 5);
        // Diz Yırtığı / Yaması
        ctx.fillStyle = "#111827";
        ctx.fillRect(npcX - 6.5, npcY + 4, 3.5, 1.8);
        // Çivili Deri Kemer
        ctx.fillStyle = "#09090b";
        ctx.fillRect(npcX - 8.5, npcY - 2.5, 17, 2.5);
        ctx.fillStyle = "#94a3b8";
        [-6, -2, 2, 6].forEach(kx => ctx.fillRect(npcX + kx, npcY - 2, 1.2, 1.5));
        // Sarkan Gümüş Pantolon Zinciri (Hanging Wallet Chain Loop)
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(npcX - 6, npcY - 1);
        ctx.quadraticCurveTo(npcX - 11, npcY + 5, npcX - 7, npcY + 8);
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(npcX - 7.5, npcY + 7.5, 1.2, 1.2);

        // C) Gövde: Siyah Grafik Tişört + Açık Biker Deri Yelek
        // Siyah İç Tişört
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.roundRect(npcX - 9, npcY - 13 + breathe, 18, 14, 3);
        ctx.fill();
        // Göğüste Kızıl Hançer Baskısı
        ctx.fillStyle = "#991b1b";
        ctx.beginPath();
        ctx.moveTo(npcX - 1.5, npcY - 10 + breathe);
        ctx.lineTo(npcX + 1.5, npcY - 10 + breathe);
        ctx.lineTo(npcX, npcY - 4 + breathe);
        ctx.closePath();
        ctx.fill();
        // Açık Biker Deri Yelek Katmanları
        let vestGrad = ctx.createLinearGradient(npcX - 9, npcY - 13, npcX + 9, npcY);
        vestGrad.addColorStop(0, "#27272a");
        vestGrad.addColorStop(0.5, "#3f3f46");
        vestGrad.addColorStop(1, "#18181b");
        ctx.fillStyle = vestGrad;
        ctx.beginPath();
        ctx.roundRect(npcX - 9.5, npcY - 13 + breathe, 6.5, 14, [3, 1, 1, 2]);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(npcX + 3.0, npcY - 13 + breathe, 6.5, 14, [1, 3, 2, 1]);
        ctx.fill();
        // Deri Klapalar (Notched Lapels)
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.moveTo(npcX - 9.5, npcY - 12 + breathe);
        ctx.lineTo(npcX - 4.5, npcY - 8 + breathe);
        ctx.lineTo(npcX - 6.5, npcY - 3 + breathe);
        ctx.lineTo(npcX - 9.5, npcY - 5 + breathe);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(npcX + 9.5, npcY - 12 + breathe);
        ctx.lineTo(npcX + 4.5, npcY - 8 + breathe);
        ctx.lineTo(npcX + 6.5, npcY - 3 + breathe);
        ctx.lineTo(npcX + 9.5, npcY - 5 + breathe);
        ctx.closePath();
        ctx.fill();
        // Omuz Zımbaları / Piramit Perçinler
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(npcX - 8.5, npcY - 13.5 + breathe, 1.8, 1.4);
        ctx.fillRect(npcX - 5.5, npcY - 13.5 + breathe, 1.8, 1.4);
        ctx.fillRect(npcX + 4.0, npcY - 13.5 + breathe, 1.8, 1.4);
        ctx.fillRect(npcX + 7.0, npcY - 13.5 + breathe, 1.8, 1.4);
        // Çapraz Metal Fermuar
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(npcX + 4, npcY - 10 + breathe);
        ctx.lineTo(npcX + 8, npcY - 2 + breathe);
        ctx.stroke();
        // Gümüş Boyun Kolyesi
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.arc(npcX, npcY - 14 + breathe, 4.5, 0.2 * Math.PI, 0.8 * Math.PI);
        ctx.stroke();

        // D) Kollar & Aksesuarlar
        // Sol Kol (Dövmeli, çivili deri bileklikli, kalçada rahat duruş)
        ctx.fillStyle = "#18181b";
        ctx.fillRect(npcX - 11.5, npcY - 12 + breathe, 3.2, 3);
        ctx.fillStyle = "#dfb892";
        ctx.fillRect(npcX - 11.5, npcY - 9 + breathe, 3.2, 7.5);
        // Sokak Dövmesi (Yılan / Hançer Hattı)
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(npcX - 11, npcY - 7 + breathe);
        ctx.lineTo(npcX - 9, npcY - 5 + breathe);
        ctx.lineTo(npcX - 11, npcY - 3 + breathe);
        ctx.stroke();
        // Çivili Siyah Deri Bileklik (Studded Wristband)
        ctx.fillStyle = "#09090b";
        ctx.fillRect(npcX - 11.8, npcY - 2 + breathe, 3.8, 2.2);
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(npcX - 11, npcY - 1.5 + breathe, 1.0, 1.0);
        ctx.fillRect(npcX - 9.2, npcY - 1.5 + breathe, 1.0, 1.0);
        // Sol El & Gümüş Yüzük
        ctx.fillStyle = "#dfb892";
        ctx.beginPath(); ctx.arc(npcX - 10, npcY + 1.5 + breathe, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(npcX - 10.5, npcY + 1 + breathe, 1.2, 1.2);

        // Sağ Kol (Öne doğru hafif uzanmış, elinde parıldayan altın karaborsa sikkesi)
        ctx.fillStyle = "#18181b";
        ctx.fillRect(npcX + 8.5, npcY - 12 + breathe, 3.2, 3);
        ctx.fillStyle = "#dfb892";
        ctx.fillRect(npcX + 8.5, npcY - 9 + breathe, 3.2, 7);
        // Sağ El
        ctx.beginPath(); ctx.arc(npcX + 10, npcY - 2 + breathe, 2.2, 0, Math.PI * 2); ctx.fill();
        // Altın Karaborsa Sikkesi (Glittering Black Market Coin)
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.ellipse(npcX + 12, npcY - 3 + breathe, 2.8, 3.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 0.7;
        ctx.stroke();
        if (coinGlint) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(npcX + 11.5, npcY - 4.5 + breathe, 1.4, 1.4);
        }

        // E) Kafa, Boyun, Kirli Sakal, Çatık Kaş & Yara İzi, Puro & Duman
        ctx.fillStyle = "#dfb892";
        ctx.fillRect(npcX - 3, npcY - 16 + breathe, 6, 4); // Boyun
        ctx.beginPath();
        ctx.arc(npcX, npcY - 20 + breathe, 8.5, 0, Math.PI * 2); // Kafa
        ctx.fill();

        // 3 Günlük Kirli Sakal (Rugged 5 o'clock shadow)
        ctx.fillStyle = "rgba(24, 24, 27, 0.45)";
        ctx.beginPath();
        ctx.ellipse(npcX, npcY - 17.5 + breathe, 7.8, 5.5, 0, 0, Math.PI);
        ctx.fill();

        // Sinsi Sağa-Sola Bakan Gözler (Shifty Glancing Eyes)
        const eyeShift = (glance > 0.3) ? 1.0 : ((glance < -0.3) ? -1.0 : 0);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.ellipse(npcX - 4.2, npcY - 21.5 + breathe, 2.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(npcX + 2.5, npcY - 21.5 + breathe, 2.4, 1.8, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#09090b";
        ctx.beginPath(); ctx.arc(npcX - 4.2 + eyeShift, npcY - 21.5 + breathe, 1.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(npcX + 2.5 + eyeShift, npcY - 21.5 + breathe, 1.1, 0, Math.PI * 2); ctx.fill();

        // Çatık Kaşlar & Sol Kaştaki Çizik Yara İzi (Razor Scar)
        ctx.strokeStyle = "#18181b";
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(npcX + 1.2, npcY - 23.5 + breathe);
        ctx.lineTo(npcX + 5.5, npcY - 24.2 + breathe);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(npcX - 1.2, npcY - 23.5 + breathe);
        ctx.lineTo(npcX - 3.2, npcY - 24.0 + breathe);
        ctx.moveTo(npcX - 4.2, npcY - 24.2 + breathe);
        ctx.lineTo(npcX - 6.2, npcY - 24.5 + breathe);
        ctx.stroke();
        // Yara İzi (Kızıl-Beyaz İyileşmiş Hat)
        ctx.strokeStyle = "#991b1b";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(npcX - 3.7, npcY - 25.5 + breathe);
        ctx.lineTo(npcX - 3.7, npcY - 22.0 + breathe);
        ctx.stroke();

        // Alaycı Yamuk Sırıtış (Crooked Smirk)
        ctx.strokeStyle = "#451a03";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(npcX - 3.5, npcY - 17.0 + breathe);
        ctx.quadraticCurveTo(npcX, npcY - 16.5 + breathe, npcX + 4.0, npcY - 17.8 + breathe);
        ctx.stroke();

        // Yanan Puro & Duman Partikülleri
        ctx.fillStyle = "#78350f";
        ctx.fillRect(npcX + 2.5, npcY - 18.0 + breathe, 7.5, 2.5);
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(npcX + 10.0, npcY - 18.0 + breathe, 2.2, 2.5);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(npcX + 11.5, npcY - 17.6 + breathe, 0.8, 1.7);
        // Tüten Duman Partikülleri
        let sProg1 = (now / 400) % 3;
        let sProg2 = (now / 400 + 1.5) % 3;
        [sProg1, sProg2].forEach((sp, idx) => {
            let alpha = Math.max(0, 0.65 - sp * 0.2);
            let px = npcX + 13 + sp * 3.5 + (idx === 0 ? Math.sin(now / 200) * 1.5 : -1);
            let py = npcY - 20 + breathe - sp * 9;
            let r = 1.8 + sp * 1.4;
            ctx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, r, 0, Math.PI * 2);
            ctx.fill();
        });

        // F) Yan Yatırılmış Serseri Kasketi (Tilted Newsboy Cap)
        // Kasket Altından Çıkan Dağınık Saç Bukleleri
        ctx.fillStyle = "#18181b";
        ctx.fillRect(npcX - 7.5, npcY - 23 + breathe, 2.0, 4.0);
        ctx.fillRect(npcX + 6.0, npcY - 23 + breathe, 2.0, 4.0);
        ctx.fillRect(npcX - 8.2, npcY - 21 + breathe, 1.5, 3.0);
        // Kasket Siperliği (Deri Vizör)
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.ellipse(npcX + 1.5, npcY - 24 + breathe, 12.0, 3.2, 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#09090b";
        ctx.lineWidth = 0.7;
        ctx.stroke();
        // Kasket Kubbesi (Newsboy Wool Crown)
        const capGrad = ctx.createLinearGradient(npcX - 8, npcY - 32 + breathe, npcX + 8, npcY - 23 + breathe);
        capGrad.addColorStop(0, "#3f3f46");
        capGrad.addColorStop(0.5, "#27272a");
        capGrad.addColorStop(1, "#18181b");
        ctx.fillStyle = capGrad;
        ctx.beginPath();
        ctx.ellipse(npcX, npcY - 26 + breathe, 10.5, 6.0, 0.08, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#09090b";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // Tepe Düğmesi
        ctx.fillStyle = "#18181b";
        ctx.beginPath();
        ctx.arc(npcX + 0.5, npcY - 32 + breathe, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // G) İSİM ETİKETİ (Semihus Aydınus standardı: Sadece "Tekinsiz Tekin", emojisiz ve unvansız)
        const tagY = npcY - 54 + breathe;
        ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
        ctx.beginPath();
        ctx.roundRect(npcX - 42, tagY, 84, 16, 5);
        ctx.fill();
        ctx.strokeStyle = isHover ? "#facc15" : "#f59e0b";
        ctx.lineWidth = isHover ? 2.0 : 1.4;
        ctx.stroke();

        ctx.fillStyle = isHover ? "#fef08a" : "#fde68a";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Tekinsiz Tekin", npcX, tagY + 11.5);

        // I) SOHBET / REPLİK BALONCUĞU (Kullanıcı talebi: 60 saniyede bir replik)
        const quoteDuration = 7000;  // 7 saniye ekranda kalma
        const quotePause = 60000;    // 60 saniye (1 dakika) replikler arası bekleme
        const quoteInterval = quoteDuration + quotePause; // 67 saniye toplam döngü
        const elapsed = Math.max(0, now - tekinLastQuoteTime);
        const cycleIndex = Math.floor(elapsed / quoteInterval);
        const timeInCycle = elapsed % quoteInterval;
        let activeQuote = null;
        if (timeInCycle < quoteDuration) {
            activeQuote = TEKIN_QUOTES[cycleIndex % TEKIN_QUOTES.length];
        }

        if (activeQuote) {
            drawTekinsizTekinSpeechBubble(ctx, npcX, tagY - 6, activeQuote);
        }

        ctx.restore();
    }

    /**
     * DİNAMİK VİP CLUB ÇEVRESİ (60 FPS: Ritmik Dans Pisti, Lazerler, Disko Topu & Etkileşimler)
     */
    function drawVipClubEnvironment() {
        if (typeof ctx === 'undefined' || !ctx || typeof canvas === 'undefined' || !canvas) return;

        // 1. Önbellekli Arka Planı Çiz
        if (typeof bgCache !== 'undefined') {
            let bg = bgCache.getCanvas('vip_club', canvas.width, canvas.height);
            ctx.drawImage(bg, 0, 0);
        }

        const now = Date.now();
        const myP = (typeof myId !== 'undefined' && typeof players !== 'undefined') ? players[myId] : null;
        const mouseX = (typeof canvasMouseX !== 'undefined') ? canvasMouseX : -999;
        const mouseY = (typeof canvasMouseY !== 'undefined') ? canvasMouseY : -999;

        // 2. RİTMİK LED IŞIKLI DANS PİSTİ (DANCE FLOOR)
        drawDynamicDanceFloor(ctx, now);

        // 3. DÖNEN DİSKO TOPU & LAZER IŞIKLARI
        drawDiscoBallAndLasers(ctx, now);

        // 4. TEKİNSİZ TEKİN NPC'Sİ (Semihus Aydınus Standardı 2.5D Tam Model)
        drawTekinsizTekinNPC(ctx, TEKIN_BOOTH.npcX, TEKIN_BOOTH.npcY, now, myP, mouseX, mouseY);

        // 5. ETKİLEŞİM PROMPTLARI & HOVER
        drawVipClubInteractionPrompts(ctx, now, myP);
    }

    /**
     * Ritmik LED Zemin Karoları (Dans Pisti)
     */
    function drawDynamicDanceFloor(ctx, now) {
        ctx.save();
        let dx = DANCE_FLOOR.x, dy = DANCE_FLOOR.y, dw = DANCE_FLOOR.w, dh = DANCE_FLOOR.h;

        // Dış Parlak Neon Kenarlık
        ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        ctx.beginPath();
        ctx.roundRect(dx - 6, dy - 6, dw + 12, dh + 12, 10);
        ctx.fill();
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 2;
        ctx.stroke();

        // 8x6 LED Zemin Matrisi
        const cols = 8;
        const rows = 6;
        const cellW = dw / cols;
        const cellH = dh / rows;

        const ledPalettes = [
            "#ec4899", // Neon Pembe
            "#8b5cf6", // Mor
            "#38bdf8", // Cyan
            "#facc15", // Altın Sarı
            "#22c55e", // Yeşil
            "#ef4444"  // Kırmızı
        ];

        let beatPhase = Math.floor(now / 320);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let cellX = dx + c * cellW;
                let cellY = dy + r * cellH;

                let colIdx = (c * 2 + r * 3 + beatPhase) % ledPalettes.length;
                let hex = ledPalettes[colIdx];

                // LED Parlama Efekti
                ctx.fillStyle = hex;
                ctx.globalAlpha = 0.65;
                ctx.fillRect(cellX + 1.5, cellY + 1.5, cellW - 3, cellH - 3);

                // LED İç Beyaz Işıma
                ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
                ctx.fillRect(cellX + cellW * 0.25, cellY + cellH * 0.25, cellW * 0.5, cellH * 0.5);

                ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                ctx.lineWidth = 1;
                ctx.strokeRect(cellX + 1, cellY + 1, cellW - 2, cellH - 2);
            }
        }
        ctx.restore();
    }

    /**
     * Dönen Disko Topu ve Tavandan İnen Lazer Hüzmeleri
     */
    function drawDiscoBallAndLasers(ctx, now) {
        ctx.save();
        let dbX = 500, dbY = 92;

        // Disko Topu Askı Zinciri (Tabelanın altından sarkar)
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dbX, 60);
        ctx.lineTo(dbX, dbY - 14);
        ctx.stroke();

        // Disko Topu Gövdesi
        let ballGrad = ctx.createRadialGradient(dbX - 4, dbY - 4, 2, dbX, dbY, 15);
        ballGrad.addColorStop(0, "#ffffff");
        ballGrad.addColorStop(0.5, "#cbd5e1");
        ballGrad.addColorStop(1, "#475569");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(dbX, dbY, 14, 0, Math.PI * 2);
        ctx.fill();

        // Dönen Yansıma Pırıltıları (Faceted reflections)
        let rot = (now / 1500);
        for (let i = 0; i < 8; i++) {
            let angle = rot + (i * Math.PI / 4);
            let sparkleX = dbX + Math.cos(angle) * 11;
            let sparkleY = dbY + Math.sin(angle) * 11;
            ctx.fillStyle = (i % 2 === 0) ? "#ffffff" : "#fef08a";
            ctx.fillRect(sparkleX - 1.5, sparkleY - 1.5, 3, 3);
        }

        // DİSKO TOPUNDAN DANS PİSTİNE VURAN 2 ADET HAREKETLİ LAZER DEMETİ
        let laser1Angle = Math.sin(now / 450) * 80;
        let laser2Angle = Math.cos(now / 520) * 80;

        // Sol Pembe/Kırmızı Lazer
        ctx.save();
        ctx.fillStyle = "rgba(236, 72, 153, 0.12)";
        ctx.beginPath();
        ctx.moveTo(dbX, dbY);
        ctx.lineTo(430 + laser1Angle, 450);
        ctx.lineTo(465 + laser1Angle, 450);
        ctx.closePath();
        ctx.fill();

        // Sağ Cyan/Mavi Lazer
        ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
        ctx.beginPath();
        ctx.moveTo(dbX, dbY);
        ctx.lineTo(535 + laser2Angle, 450);
        ctx.lineTo(570 + laser2Angle, 450);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    /**
     * Etkileşim Rozetleri ve Hover Bilgilendirmeleri
     */
    function drawVipClubInteractionPrompts(ctx, now, myP) {
        if (!myP) return;

        const pulse = Math.sin(now / 200) * 2;

        // Dans Pistinde Olunduğunda (Yazı kaldırıldı, [E] veya tıklama ile dans etme devam eder)
    }

    /**
     * DUVAR ÇARPIŞMA KONTROLÜ (Collision)
     */
    function checkVipClubCollision(x, y) {
        // Dış Duvar Sınırları
        if (x < 45 || x > 955) return true;
        if (y < 195) return true; // Arka duvar ve DJ kabini üst sınırı
        if (y > 595 && !(x >= 430 && x <= 570)) return true; // Güney çıkış kapısı hariç

        // DJ Kabini Masif Hitbox (x: 400..600, y: 140..215)
        if (x >= 400 && x <= 600 && y >= 140 && y <= 215) return true;

        // VIP Loca Sedir Masif Hitbox (Sol Taraf - Yukarı Küçültülmüş)
        // Arka sedir sırtlığı: x: 50..310, y: 180..225
        if (x >= 50 && x <= 310 && y >= 180 && y <= 225) return true;
        // Sol dış kolçak: x: 50..88, y: 220..275
        if (x >= 50 && x <= 88 && y >= 220 && y <= 275) return true;
        // Sağ dış kolçak: x: 272..310, y: 220..275
        if (x >= 272 && x <= 310 && y >= 220 && y <= 275) return true;
        // Orta Kokteyl Masası: x: 152..208, y: 270..292
        if (x >= 152 && x <= 208 && y >= 270 && y <= 292) return true;

        // Sol Alt Yeni Sanalika İzometrik Koltuk Grubu Hitbox (Büyütülmüş & Karşılıklı)
        // Sol Koltuk Arkalığı (ox: 150, oy: 385, scale: -1.18): x: 65..138, y: 375..398
        if (x >= 65 && x <= 138 && y >= 375 && y <= 398) return true;
        // Sağ Koltuk Arkalığı (ox: 200, oy: 425, scale: 1.18): x: 212..285, y: 415..438
        if (x >= 212 && x <= 285 && y >= 415 && y <= 438) return true;
        // Orta Küçük Sehpa (cx: 175, cy: 465): x: 160..190, y: 455..476
        if (x >= 160 && x <= 190 && y >= 455 && y <= 476) return true;

        // Tekinsiz Tekin ve Karaborsa Tezgahı Masif Hitbox
        // Tezgah: x: 808..948, y: 238..292
        if (x >= 808 && x <= 948 && y >= 238 && y <= 292) return true;
        // Tekin NPC Duruş Alanı: x: 748..782, y: 238..274
        if (x >= 748 && x <= 782 && y >= 238 && y <= 274) return true;

        // Sanalika 2.5D L-Sectional Lounge Masif Hitbox (Sağ Taraf Köşe Kanepe)
        // Palmiye Saksısı (x: 926, y: 435)
        if (x >= 914 && x <= 938 && y >= 425 && y <= 450) return true;
        // Ana Koltuk Arkalığı (x: 706..858, y: 382..400)
        if (x >= 706 && x <= 858 && y >= 382 && y <= 400) return true;
        // Yan Koltuk Sağ Sırtlığı (x: 894..912, y: 408..522)
        if (x >= 894 && x <= 912 && y >= 408 && y <= 522) return true;

        return false;
    }

    /**
     * Tıklama Yönetimi
     */
    function handleVipClubClick(clickX, clickY, p) {
        // 1. Güney Çıkış Kapısına Tıklama
        if (clickX >= 430 && clickX <= 570 && clickY >= 570) {
            if (typeof changeRoom === 'function') changeRoom('cadde2');
            return true;
        }

        // 2. Tekinsiz Tekin veya Tezgahına Tıklama
        if (clickX >= 720 && clickX <= 950 && clickY >= 190 && clickY <= 320) {
            if (typeof openTekinsizTekinModal === 'function') {
                openTekinsizTekinModal();
            }
            return true;
        }

        // 3. Dans Pistine Tıklama
        if (clickX >= DANCE_FLOOR.x && clickX <= DANCE_FLOOR.x + DANCE_FLOOR.w &&
            clickY >= DANCE_FLOOR.y && clickY <= DANCE_FLOOR.y + DANCE_FLOOR.h) {
            if (typeof triggerPlayerAction === 'function') {
                triggerPlayerAction('dance');
            }
            return true;
        }

        return false;
    }

    /**
     * E Tuşu / Mobil Etkileşim
     */
    function handleVipClubMobileInteract(p) {
        if (!p) return false;

        // Çıkış kapısı önündeyse
        if (p.y >= 575 && p.x >= 430 && p.x <= 570) {
            if (typeof changeRoom === 'function') changeRoom('cadde2');
            return true;
        }

        // Tekin'in önündeyse mağazayı aç
        if (Math.hypot(p.x - TEKIN_BOOTH.npcX, p.y - TEKIN_BOOTH.npcY) <= 90 || (p.x >= 720 && p.x <= 840 && p.y >= 240 && p.y <= 330)) {
            if (typeof openTekinsizTekinModal === 'function') {
                openTekinsizTekinModal();
                return true;
            }
        }

        // Dans pistindeyse dans et
        if (p.x >= DANCE_FLOOR.x && p.x <= DANCE_FLOOR.x + DANCE_FLOOR.w &&
            p.y >= DANCE_FLOOR.y && p.y <= DANCE_FLOOR.y + DANCE_FLOOR.h) {
            if (typeof triggerPlayerAction === 'function') {
                triggerPlayerAction('dance');
                return true;
            }
        }

        return false;
    }

    // VIP Club Arka Plan Ön Belleğini Otomatik Yenile
    if (typeof bgCache !== 'undefined' && typeof bgCache.clear === 'function') {
        bgCache.clear('vip_club');
    }

    // Global Dışa Aktarımlar
    global.renderStaticVipClubTo = renderStaticVipClubTo;
    global.drawVipClubEnvironment = drawVipClubEnvironment;
    global.drawTekinsizTekinNPC = drawTekinsizTekinNPC;
    global.drawTekinsizTekinSpeechBubble = drawTekinsizTekinSpeechBubble;
    global.drawShadyCounter = drawShadyCounter;
    global.drawSanalikaLoungeSectional = drawSanalikaLoungeSectional;
    global.drawIsometricSanalikaLounge = drawIsometricSanalikaLounge;
    global.checkVipClubCollision = checkVipClubCollision;
    global.handleVipClubClick = handleVipClubClick;
    global.handleVipClubMobileInteract = handleVipClubMobileInteract;
    global.TEKIN_BOOTH = TEKIN_BOOTH;
    global.TEKIN_QUOTES = TEKIN_QUOTES;
    global.DANCE_FLOOR = DANCE_FLOOR;

})(typeof window !== 'undefined' ? window : this);
