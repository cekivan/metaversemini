// public/js/renderers/renderOyunSalonu.js - VIP Oyun Kulübü & Lounge (1000x625 - Seçenek A: 2.5D Hacimli & Gerçekçi Mimari)
// 5 Büyük Masa Oyunu: 8-Ball Bilardo, Geleneksel Tavla, XOX Düellosu, Amiral Battı, Büyük Usta Satranç
// Mimari Detaylar: 2.5D Ayaklı & Etekli Hacimli Masalar, Yükseltilmiş VIP Podyumu, L-Bar & Işıklı Arka Bar Vitrini, Chesterfield Lounge

(function () {
    /**
     * 1. 1000x625 STATİK ARKA PLAN ÇİZİMİ (bgCache içine önbelleğe alınır)
     */
    function renderStaticOyunSalonuTo(bctx, width, height) {
        // A) ZEMİN: Zengin Ahşap Parke (Ceviz & Meşe)
        let floorGrad = bctx.createLinearGradient(0, 95, 0, height);
        floorGrad.addColorStop(0, "#23130a");
        floorGrad.addColorStop(0.5, "#2c170d");
        floorGrad.addColorStop(1, "#1a0b05");
        bctx.fillStyle = floorGrad;
        bctx.fillRect(0, 95, width, height - 95);

        // Ahşap Parke Plank Derz Çizgileri
        bctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
        bctx.lineWidth = 1;
        for (let y = 95; y < height; y += 26) {
            bctx.beginPath();
            bctx.moveTo(0, y);
            bctx.lineTo(width, y);
            bctx.stroke();

            let offset = (Math.floor(y / 26) % 2 === 0) ? 0 : 55;
            for (let x = offset; x < width; x += 110) {
                bctx.beginPath();
                bctx.moveTo(x, y);
                bctx.lineTo(x, y + 26);
                bctx.stroke();
            }
        }

        // B) PERSPEKTİFLİ SOL VE SAĞ YAN DUVARLAR (Odaya 2.5D Kutu / Derinlik Hissi Verir)
        // Sol Yan Duvar (x: 0..22)
        let leftWallGrad = bctx.createLinearGradient(0, 0, 22, 0);
        leftWallGrad.addColorStop(0, "#0e0502");
        leftWallGrad.addColorStop(1, "#1e0e06");
        bctx.fillStyle = leftWallGrad;
        bctx.fillRect(0, 0, 22, height);
        bctx.strokeStyle = "rgba(0,0,0,0.45)";
        bctx.lineWidth = 1.5;
        bctx.beginPath(); bctx.moveTo(22, 0); bctx.lineTo(22, height); bctx.stroke();
        // Sol Süpürgelik
        bctx.fillStyle = "#361608";
        bctx.fillRect(0, height - 12, 22, 12);

        // Sağ Yan Duvar (x: 978..1000)
        let rightWallGrad = bctx.createLinearGradient(978, 0, 1000, 0);
        rightWallGrad.addColorStop(0, "#1e0e06");
        rightWallGrad.addColorStop(1, "#0e0502");
        bctx.fillStyle = rightWallGrad;
        bctx.fillRect(978, 0, 22, height);
        bctx.strokeStyle = "rgba(0,0,0,0.45)";
        bctx.lineWidth = 1.5;
        bctx.beginPath(); bctx.moveTo(978, 0); bctx.lineTo(978, height); bctx.stroke();
        // Sağ Süpürgelik
        bctx.fillStyle = "#361608";
        bctx.fillRect(978, height - 12, 22, 12);

        // C) ÜST ARKA DUVAR (Wainscoting Ahşap Lambri Kaplama & Yüksek Tavan)
        let wallGrad = bctx.createLinearGradient(0, 0, 0, 95);
        wallGrad.addColorStop(0, "#140a04");
        wallGrad.addColorStop(1, "#261309");
        bctx.fillStyle = wallGrad;
        bctx.fillRect(22, 0, width - 44, 95);

        // Duvar Lambri Ahşap Pervazları
        bctx.strokeStyle = "rgba(217, 119, 6, 0.22)";
        bctx.lineWidth = 1.5;
        for (let px = 30; px < width - 40; px += 85) {
            bctx.strokeRect(px, 14, 72, 68);
        }

        // Pirinç Korniş Çıtası & Zemin Ayrımı
        bctx.fillStyle = "#78350f";
        bctx.fillRect(22, 92, width - 44, 5);
        bctx.fillStyle = "#f59e0b";
        bctx.fillRect(22, 94, width - 44, 2);

        // Duvarın Zemine Düşen Yumuşak Ortam Gölgesi (Ambient Occlusion)
        let wallShadow = bctx.createLinearGradient(0, 96, 0, 140);
        wallShadow.addColorStop(0, "rgba(0, 0, 0, 0.6)");
        wallShadow.addColorStop(1, "rgba(0, 0, 0, 0)");
        bctx.fillStyle = wallShadow;
        bctx.fillRect(22, 96, width - 44, 44);

        // D) ARKA DUVARDA MASİF AHŞAP PİLASTER KOLONLAR (3D Mimari Derinlik)
        // 4 Kolon: x: 270, x: 415, x: 575, x: 720
        [270, 415, 575, 720].forEach(cx => {
            // Kolon Gölgesi
            bctx.fillStyle = "rgba(0,0,0,0.4)";
            bctx.fillRect(cx - 3, 0, 24, 98);

            // Kolon Gövdesi
            let colGrad = bctx.createLinearGradient(cx, 0, cx + 18, 0);
            colGrad.addColorStop(0, "#361608");
            colGrad.addColorStop(0.5, "#5c2c16");
            colGrad.addColorStop(1, "#270f03");
            bctx.fillStyle = colGrad;
            bctx.fillRect(cx, 0, 18, 95);

            // Kolon Başlığı & Kaidesi (Pirinç/Altın Detaylı)
            bctx.fillStyle = "#ca8a04";
            bctx.fillRect(cx - 2, 8, 22, 4);
            bctx.fillRect(cx - 2, 88, 22, 5);
            bctx.strokeStyle = "#78350f";
            bctx.lineWidth = 1;
            bctx.strokeRect(cx, 0, 18, 95);
        });

        // E) PANORAMİK KEMERLİ PENCERELER (Kolonların Arasında: Sol x: 295..405, Sağ x: 600..710)
        [[298, 12, 107, 68], [603, 12, 107, 68]].forEach(([wx, wy, ww, wh]) => {
            bctx.fillStyle = "rgba(0,0,0,0.6)";
            bctx.beginPath();
            bctx.roundRect(wx - 2, wy - 2, ww + 4, wh + 4, [20, 20, 4, 4]);
            bctx.fill();

            let skyGrad = bctx.createLinearGradient(wx, wy, wx, wy + wh);
            skyGrad.addColorStop(0, "#38bdf8");
            skyGrad.addColorStop(0.65, "#bae6fd");
            skyGrad.addColorStop(1, "#86efac");
            bctx.fillStyle = skyGrad;
            bctx.beginPath();
            bctx.roundRect(wx, wy, ww, wh, [18, 18, 2, 2]);
            bctx.fill();

            // Meydan Ağaçları
            bctx.fillStyle = "#15803d";
            bctx.beginPath();
            bctx.arc(wx + 26, wy + wh - 6, 20, 0, Math.PI * 2);
            bctx.arc(wx + 56, wy + wh - 12, 26, 0, Math.PI * 2);
            bctx.arc(wx + 86, wy + wh - 6, 18, 0, Math.PI * 2);
            bctx.fill();
            bctx.fillStyle = "#22c55e";
            bctx.beginPath();
            bctx.arc(wx + 54, wy + wh - 16, 18, 0, Math.PI * 2);
            bctx.fill();

            // Bulutlar
            bctx.fillStyle = "rgba(255, 255, 255, 0.75)";
            bctx.beginPath();
            bctx.arc(wx + 34, wy + 20, 9, 0, Math.PI * 2);
            bctx.arc(wx + 48, wy + 18, 13, 0, Math.PI * 2);
            bctx.arc(wx + 64, wy + 20, 8, 0, Math.PI * 2);
            bctx.fill();

            // Ahşap Kemer Çerçevesi
            bctx.strokeStyle = "#451a03";
            bctx.lineWidth = 3;
            bctx.beginPath();
            bctx.roundRect(wx, wy, ww, wh, [18, 18, 2, 2]);
            bctx.stroke();

            // Muntin Bölmeler
            bctx.strokeStyle = "rgba(69, 26, 3, 0.9)";
            bctx.lineWidth = 1.8;
            bctx.beginPath();
            bctx.moveTo(wx + ww / 2, wy);
            bctx.lineTo(wx + ww / 2, wy + wh);
            bctx.moveTo(wx, wy + wh * 0.55);
            bctx.lineTo(wx + ww, wy + wh * 0.55);
            bctx.stroke();

            // Güneş Cam Parıltısı
            bctx.fillStyle = "rgba(255, 255, 255, 0.22)";
            bctx.beginPath();
            bctx.moveTo(wx + 12, wy + 2);
            bctx.lineTo(wx + 40, wy + 2);
            bctx.lineTo(wx + 18, wy + wh - 2);
            bctx.lineTo(wx + 2, wy + wh - 2);
            bctx.closePath();
            bctx.fill();

            // Volumetrik Güneş Huzmeleri
            let sunRay = bctx.createLinearGradient(wx + ww / 2, 95, wx + ww / 2 - 35, 260);
            sunRay.addColorStop(0, "rgba(254, 240, 138, 0.16)");
            sunRay.addColorStop(1, "rgba(254, 240, 138, 0.0)");
            bctx.fillStyle = sunRay;
            bctx.beginPath();
            bctx.moveTo(wx + 10, 96);
            bctx.lineTo(wx + ww - 10, 96);
            bctx.lineTo(wx + ww + 45, 260);
            bctx.lineTo(wx - 35, 260);
            bctx.closePath();
            bctx.fill();
        });

        // F) ŞAMPİYONLAR KULÜBÜ ŞEREF PANOSU (Sağ Üst Duvarda: x: 745..885, y: 16..78)
        bctx.fillStyle = "rgba(0,0,0,0.5)";
        bctx.beginPath();
        bctx.roundRect(747, 18, 140, 62, 8);
        bctx.fill();

        let boardGrad = bctx.createLinearGradient(745, 16, 745, 78);
        boardGrad.addColorStop(0, "#451a03");
        boardGrad.addColorStop(1, "#270f03");
        bctx.fillStyle = boardGrad;
        bctx.beginPath();
        bctx.roundRect(745, 16, 140, 62, 8);
        bctx.fill();
        bctx.strokeStyle = "#ca8a04";
        bctx.lineWidth = 2;
        bctx.stroke();

        bctx.strokeStyle = "rgba(254, 240, 138, 0.5)";
        bctx.lineWidth = 1;
        bctx.strokeRect(751, 22, 128, 50);

        bctx.fillStyle = "#facc15";
        bctx.font = "bold 10px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🏆 ŞAMPİYONLAR KULÜBÜ", 815, 38);
        bctx.fillStyle = "#fef08a";
        bctx.font = "8px sans-serif";
        bctx.fillText("METAVERSE OYUN LİGİ", 815, 52);
        bctx.fillStyle = "#94a3b8";
        bctx.fillText("★ BİLARDO • SATRANÇ • TAVLA ★", 815, 64);

        // G) MERKEZİ PROTOKOL VE YÜRÜYÜŞ KORİDORU HALISI (Kapıdan TV'ye)
        let hallRunnerGrad = bctx.createLinearGradient(440, 95, 560, 95);
        hallRunnerGrad.addColorStop(0, "#1e3a2f");
        hallRunnerGrad.addColorStop(0.5, "#2d5a49");
        hallRunnerGrad.addColorStop(1, "#1e3a2f");
        bctx.fillStyle = hallRunnerGrad;
        bctx.fillRect(440, 95, 120, height - 165);

        bctx.strokeStyle = "rgba(234, 179, 8, 0.5)";
        bctx.lineWidth = 2;
        bctx.strokeRect(440, 95, 120, height - 165);
        bctx.strokeStyle = "rgba(254, 240, 138, 0.25)";
        bctx.lineWidth = 1;
        bctx.strokeRect(446, 100, 108, height - 175);

        // H) YÜKSELTİLMİŞ VIP BİLARDO PODYUMU (Sol Kanat: Kot Farkı & Merdiven Basamakları)
        // Podyum: x: 50, y: 120, w: 235, h: 148
        // Podyumun Yere Düşen Ağır 3D Gölgesi
        bctx.fillStyle = "rgba(0, 0, 0, 0.55)";
        bctx.beginPath();
        bctx.roundRect(54, 126, 235, 148, 8);
        bctx.fill();

        // Podyum 3D Ahşap Etek / Yükseklik Yüzü (Riser: 16px yükseklik)
        bctx.fillStyle = "#270f03";
        bctx.beginPath();
        bctx.roundRect(50, 130, 235, 140, 8);
        bctx.fill();
        bctx.strokeStyle = "#ca8a04";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        // Podyum Üst Ahşap Platformu (Mezzanine Floor)
        let podiumTopGrad = bctx.createLinearGradient(50, 120, 285, 260);
        podiumTopGrad.addColorStop(0, "#451a03");
        podiumTopGrad.addColorStop(0.5, "#5c2c16");
        podiumTopGrad.addColorStop(1, "#361608");
        bctx.fillStyle = podiumTopGrad;
        bctx.beginPath();
        bctx.roundRect(50, 120, 235, 138, 8);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Podyum Kenar Pirinç Korkuluk Babaları (Brass Balusters & Velvet Rope)
        [
            [54, 124], [280, 124], [54, 252], [280, 252]
        ].forEach(([bx, by]) => {
            bctx.fillStyle = "#ca8a04";
            bctx.beginPath(); bctx.arc(bx, by, 4.5, 0, Math.PI * 2); bctx.fill();
            bctx.strokeStyle = "#fef08a"; bctx.lineWidth = 1; bctx.stroke();
        });

        // Podyum Basamakları (Ön ve Sağ tarafta kademe basamağı)
        bctx.fillStyle = "#f59e0b";
        bctx.fillRect(285, 175, 4, 40); // Sağ basamak altın burun çıtası
        bctx.fillStyle = "#361608";
        bctx.fillRect(285, 177, 8, 36);

        // Podyum Üzeri Zümrüt Yeşili Ağır Keçe Halı
        let carpetBilliard = bctx.createLinearGradient(60, 128, 275, 250);
        carpetBilliard.addColorStop(0, "#064e3b");
        carpetBilliard.addColorStop(0.5, "#047857");
        carpetBilliard.addColorStop(1, "#064e3b");
        bctx.fillStyle = carpetBilliard;
        bctx.beginPath();
        bctx.roundRect(60, 128, 215, 122, 6);
        bctx.fill();
        bctx.strokeStyle = "rgba(254, 240, 138, 0.4)";
        bctx.lineWidth = 1;
        bctx.strokeRect(66, 134, 203, 110);

        // I) TAVLA KİLİMİ (Sol Alt Kanat: x: 75, y: 345, w: 185, h: 145)
        bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        bctx.beginPath();
        bctx.roundRect(79, 349, 185, 145, 10);
        bctx.fill();

        bctx.fillStyle = "#831843"; // Bordo Uşak Kilimi
        bctx.beginPath();
        bctx.roundRect(75, 345, 185, 145, 10);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        bctx.strokeStyle = "rgba(254, 240, 138, 0.35)";
        bctx.lineWidth = 1.2;
        bctx.strokeRect(83, 353, 169, 129);
        for (let kx = 95; kx <= 235; kx += 35) {
            bctx.strokeRect(kx, 359, 24, 16);
            bctx.strokeRect(kx, 461, 24, 16);
        }

        // J) SATRANÇ DAMA KAİDESİ (Sağ Kanat: x: 740, y: 145, w: 190, h: 155)
        bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        bctx.beginPath();
        bctx.roundRect(744, 149, 190, 155, 12);
        bctx.fill();

        bctx.fillStyle = "#0f172a";
        bctx.beginPath();
        bctx.roundRect(740, 145, 190, 155, 12);
        bctx.fill();
        bctx.strokeStyle = "#ca8a04";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 7; col++) {
                if ((row + col) % 2 === 0) {
                    bctx.fillStyle = "rgba(248, 250, 252, 0.12)";
                    bctx.fillRect(746 + col * 25.5, 151 + row * 23.5, 25.5, 23.5);
                }
            }
        }
        bctx.strokeStyle = "rgba(254, 240, 138, 0.4)";
        bctx.lineWidth = 1;
        bctx.strokeRect(746, 151, 178, 143);

        // K) XOX VE AMİRAL KAİDELERİ
        // XOX Bistro Halısı (cx: 362, cy: 220)
        bctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        bctx.beginPath();
        bctx.ellipse(364, 224, 75, 68, 0, 0, Math.PI * 2);
        bctx.fill();

        let xoxCarpetGrad = bctx.createRadialGradient(362, 220, 10, 362, 220, 75);
        xoxCarpetGrad.addColorStop(0, "#1e1b4b");
        xoxCarpetGrad.addColorStop(0.85, "#312e81");
        xoxCarpetGrad.addColorStop(1, "#1e1b4b");
        bctx.fillStyle = xoxCarpetGrad;
        bctx.beginPath();
        bctx.ellipse(362, 220, 75, 68, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Amiral Donanma Kaidesi (cx: 640, cy: 220)
        bctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        bctx.beginPath();
        bctx.ellipse(642, 224, 75, 68, 0, 0, Math.PI * 2);
        bctx.fill();

        let amiralCarpetGrad = bctx.createRadialGradient(640, 220, 10, 640, 220, 75);
        amiralCarpetGrad.addColorStop(0, "#082f49");
        amiralCarpetGrad.addColorStop(0.85, "#0c4a6e");
        amiralCarpetGrad.addColorStop(1, "#082f49");
        bctx.fillStyle = amiralCarpetGrad;
        bctx.beginPath();
        bctx.ellipse(640, 220, 75, 68, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "#0284c7";
        bctx.lineWidth = 2;
        bctx.stroke();

        // L) IŞIKLI ARKA BAR VİTRİNİ & L-ŞEKLİNDE 2.5D MERMER TEZGAH (Sol Üst: x: 35..275, y: 14..84)
        // 1. Duvardaki Arka Bar Vitrini (Kemerli Antika Ayna & Işıklı Şişe Rafları)
        bctx.fillStyle = "#1e0b02";
        bctx.fillRect(45, 14, 215, 60);

        // Kemerli Ayna (x: 110..185, y: 14..68)
        let mirrorGrad = bctx.createLinearGradient(110, 14, 185, 68);
        mirrorGrad.addColorStop(0, "#334155");
        mirrorGrad.addColorStop(0.5, "#64748b");
        mirrorGrad.addColorStop(1, "#1e293b");
        bctx.fillStyle = mirrorGrad;
        bctx.beginPath();
        bctx.roundRect(110, 14, 75, 54, [16, 16, 2, 2]);
        bctx.fill();
        bctx.strokeStyle = "#ca8a04";
        bctx.lineWidth = 2;
        bctx.stroke();

        // 3 Katlı Işıklı Cam Raflar & Renkli Şişeler
        [28, 44, 60].forEach(ry => {
            bctx.fillStyle = "rgba(56, 189, 248, 0.4)";
            bctx.fillRect(48, ry, 208, 2.5); // Cam raf
            bctx.fillStyle = "rgba(255, 255, 255, 0.6)";
            bctx.fillRect(48, ry, 208, 1);

            // Renkli Şişeler (Yeşil, Kehribar, Yakut, Safir)
            let colors = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];
            for (let bx = 52; bx <= 245; bx += 14) {
                if (bx >= 115 && bx <= 180 && ry < 55) continue; // Aynanın önünü ferah bırak
                let c = colors[(bx + ry) % colors.length];
                bctx.fillStyle = c;
                bctx.fillRect(bx, ry - 11, 6, 11);
                bctx.fillStyle = "#fef08a";
                bctx.fillRect(bx + 1.5, ry - 14, 3, 3); // Kapak
            }
        });

        // 2. 2.5D L-Şeklinde Ön Bar Tezgahı
        // Tezgahın Yere Düşen Ağır Kontak Gölgesi
        bctx.fillStyle = "rgba(0,0,0,0.55)";
        bctx.fillRect(38, 76, 236, 12);

        // Tezgah 3D Masif Maun Ön Cephesi (Fluted Wood Apron: 24px yükseklik)
        let barFrontGrad = bctx.createLinearGradient(35, 48, 35, 78);
        barFrontGrad.addColorStop(0, "#451a03");
        barFrontGrad.addColorStop(0.5, "#2c1004");
        barFrontGrad.addColorStop(1, "#180802");
        bctx.fillStyle = barFrontGrad;
        bctx.fillRect(35, 48, 235, 28);
        bctx.strokeStyle = "#78350f";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(35, 48, 235, 28);

        // Parlak Pirinç Ayak Basma Borusu (Brass Foot Rail at y: 74)
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 3;
        bctx.beginPath();
        bctx.moveTo(38, 74);
        bctx.lineTo(267, 74);
        bctx.stroke();
        // Pirinç Ayak Destekleri
        [50, 105, 165, 225, 260].forEach(fx => {
            bctx.fillStyle = "#ca8a04";
            bctx.fillRect(fx - 2, 72, 4, 6);
        });

        // İtalyan Carrara Mermer Üst Tabla (14px kalınlığında 2.5D mermer)
        let marbleGrad = bctx.createLinearGradient(35, 22, 35, 50);
        marbleGrad.addColorStop(0, "#f8fafc");
        marbleGrad.addColorStop(0.7, "#e2e8f0");
        marbleGrad.addColorStop(1, "#94a3b8");
        bctx.fillStyle = marbleGrad;
        bctx.beginPath();
        bctx.roundRect(33, 22, 239, 28, 6);
        bctx.fill();
        bctx.strokeStyle = "#cbd5e1";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        // Mermer Ön Etek Pah Çizgisi (Bevel)
        bctx.fillStyle = "#64748b";
        bctx.fillRect(35, 47, 235, 3);

        // Bar Üstü Bakır Semaver & Çelik Espresso Makinesi
        bctx.fillStyle = "#b45309";
        bctx.beginPath();
        bctx.roundRect(46, 24, 24, 22, 4);
        bctx.fill();
        bctx.fillStyle = "#facc15";
        bctx.fillRect(53, 20, 10, 4);

        bctx.fillStyle = "#475569";
        bctx.beginPath();
        bctx.roundRect(82, 24, 28, 22, 4);
        bctx.fill();
        bctx.fillStyle = "#94a3b8";
        bctx.fillRect(86, 26, 18, 5);

        // İnce Belli Çay Bardakları
        [[120, 32], [134, 32]].forEach(([cx, cy]) => {
            bctx.fillStyle = "#ef4444";
            bctx.fillRect(cx, cy, 8, 11);
            bctx.fillStyle = "#fef08a";
            bctx.fillRect(cx - 2, cy + 11, 12, 2);
        });

        // Bar Tabelası
        bctx.fillStyle = "#451a03";
        bctx.font = "bold 11px sans-serif";
        bctx.textAlign = "left";
        bctx.fillText("☕ VIP Çay & Kahve Barı (10 TL) - Tıkla", 152, 41);

        // 4 Adet 2.5D Döner Bar Taburesi (x: 65, 115, 165, 215, y: 86)
        [65, 115, 165, 215].forEach(sx => {
            // Yere düşen gölge
            bctx.fillStyle = "rgba(0,0,0,0.35)";
            bctx.beginPath(); bctx.ellipse(sx, 92, 10, 5, 0, 0, Math.PI * 2); bctx.fill();

            // Krom / Pirinç Dikey Sütun Ayak
            bctx.fillStyle = "#ca8a04";
            bctx.fillRect(sx - 2, 78, 4, 14);

            // Dairesel Ayak Tabanı
            bctx.fillStyle = "#facc15";
            bctx.beginPath(); bctx.ellipse(sx, 91, 7, 3, 0, 0, Math.PI * 2); bctx.fill();

            // Deri Dolgulu 2.5D Minder (Kalınlık: 7px)
            bctx.fillStyle = "#78350f"; // Yan etek
            bctx.beginPath(); bctx.ellipse(sx, 78, 10, 5, 0, 0, Math.PI * 2); bctx.fill();

            let seatGrad = bctx.createRadialGradient(sx, 74, 1, sx, 74, 9);
            seatGrad.addColorStop(0, "#d97706");
            seatGrad.addColorStop(1, "#92400e");
            bctx.fillStyle = seatGrad;
            bctx.beginPath(); bctx.ellipse(sx, 74, 10, 5, 0, 0, Math.PI * 2); bctx.fill();
            bctx.strokeStyle = "#451a03"; bctx.lineWidth = 1; bctx.stroke();
        });

        // M) 2.5D CHESTERFIELD DERİ SEYİRCİ LOUNGE'I (Sağ Alt: x: 745..935, y: 390..455)
        // 4 Masif Ahşap Topuz Ayak (Bun Feet) Zemine Basar
        [
            [755, 452], [925, 452], [755, 412], [925, 412]
        ].forEach(([fx, fy]) => {
            bctx.fillStyle = "rgba(0,0,0,0.4)";
            bctx.beginPath(); bctx.ellipse(fx, fy + 4, 6, 3, 0, 0, Math.PI * 2); bctx.fill();
            bctx.fillStyle = "#270f03";
            bctx.beginPath(); bctx.arc(fx, fy, 4, 0, Math.PI * 2); bctx.fill();
        });

        // Koltuk Yere Düşen Ana Kontak Gölgesi
        bctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        bctx.beginPath();
        bctx.roundRect(749, 396, 190, 62, 14);
        bctx.fill();

        // 3D Koltuk Gövdesi & Kalın Ön Etek
        let sofaBaseGrad = bctx.createLinearGradient(745, 390, 745, 454);
        sofaBaseGrad.addColorStop(0, "#451a03");
        sofaBaseGrad.addColorStop(0.5, "#78350f");
        sofaBaseGrad.addColorStop(1, "#2c1004");
        bctx.fillStyle = sofaBaseGrad;
        bctx.beginPath();
        bctx.roundRect(745, 390, 190, 64, 14);
        bctx.fill();
        bctx.strokeStyle = "#1e0b02";
        bctx.lineWidth = 2;
        bctx.stroke();

        // 2.5D Kıvrımlı Kolçaklar (Scrolled Arms)
        [745, 915].forEach(ax => {
            let armGrad = bctx.createRadialGradient(ax + 10, 420, 2, ax + 10, 420, 14);
            armGrad.addColorStop(0, "#92400e");
            armGrad.addColorStop(1, "#361608");
            bctx.fillStyle = armGrad;
            bctx.beginPath();
            bctx.roundRect(ax, 392, 20, 60, 10);
            bctx.fill();
            bctx.strokeStyle = "#1e0b02"; bctx.lineWidth = 1; bctx.stroke();
        });

        // Kapitone Düğmeler ve Derinlik Gölgeleri
        bctx.fillStyle = "#1e0b02";
        for (let bx = 775; bx <= 905; bx += 22) {
            for (let by = 405; by <= 435; by += 15) {
                bctx.beginPath(); bctx.arc(bx, by, 2.5, 0, Math.PI * 2); bctx.fill();
            }
        }

        // Chesterfield Ön Masif Sehpa (4 Tornalı Ayaklı 2.5D Ahşap Sehpa)
        // 4 Ayak
        [
            [795, 492], [880, 492], [795, 470], [880, 470]
        ].forEach(([tx, ty]) => {
            bctx.fillStyle = "rgba(0,0,0,0.3)";
            bctx.beginPath(); bctx.ellipse(tx, ty + 2, 4, 2, 0, 0, Math.PI * 2); bctx.fill();
            bctx.fillStyle = "#270f03";
            bctx.fillRect(tx - 2, ty - 5, 4, 6);
        });

        bctx.fillStyle = "#5c2c16";
        bctx.beginPath(); bctx.roundRect(790, 465, 94, 26, 6); bctx.fill();
        bctx.strokeStyle = "#ca8a04"; bctx.lineWidth = 1; bctx.stroke();

        bctx.fillStyle = "#f8fafc";
        bctx.fillRect(800, 470, 22, 14); // Satranç Dergisi
        bctx.fillStyle = "#ef4444";
        bctx.beginPath(); bctx.arc(840, 477, 4, 0, Math.PI * 2); bctx.fill(); // Kahve fincanı

        // N) GİRİŞ KAPISI VE DEKORATİF BİTKİLER (Alt Ortada)
        [[380, 550], [620, 550]].forEach(([px, py]) => {
            bctx.fillStyle = "rgba(0,0,0,0.35)";
            bctx.beginPath(); bctx.ellipse(px, py + 16, 16, 8, 0, 0, Math.PI * 2); bctx.fill();

            bctx.fillStyle = "#9a3412";
            bctx.beginPath();
            bctx.moveTo(px - 14, py + 2);
            bctx.lineTo(px + 14, py + 2);
            bctx.lineTo(px + 10, py + 20);
            bctx.lineTo(px - 10, py + 20);
            bctx.closePath();
            bctx.fill();
            bctx.strokeStyle = "#c2410c";
            bctx.lineWidth = 1.2;
            bctx.stroke();

            bctx.fillStyle = "#7c2d12";
            bctx.beginPath(); bctx.ellipse(px, py + 2, 14, 4, 0, 0, Math.PI * 2); bctx.fill();

            bctx.fillStyle = "#15803d";
            bctx.beginPath(); bctx.ellipse(px - 9, py - 6, 9, 16, -0.4, 0, Math.PI * 2); bctx.fill();
            bctx.beginPath(); bctx.ellipse(px + 9, py - 6, 9, 16, 0.4, 0, Math.PI * 2); bctx.fill();
            bctx.fillStyle = "#22c55e";
            bctx.beginPath(); bctx.ellipse(px, py - 12, 8, 18, 0, 0, Math.PI * 2); bctx.fill();
            bctx.fillStyle = "#86efac";
            bctx.beginPath(); bctx.arc(px, py - 6, 3, 0, Math.PI * 2); bctx.fill();
        });

        // Çıkış Kapısı
        if (typeof drawExitDoor === 'function') {
            drawExitDoor(bctx, width / 2 - 40, height - 65, "🚪 MEYDAN", 80, 60);
        }
    }

    /**
     * 2. DİNAMİK ORTAM ÇİZİMİ (Her karede animasyonlar, hover efektleri ve 2.5D masalar)
     */
    function drawOyunSalonuEnvironment() {
        let cache = (typeof bgCache !== 'undefined' ? bgCache : (window.bgCache || null));
        if (cache) {
            let bg = cache.getCanvas('kafe', canvas.width, canvas.height);
            ctx.drawImage(bg, 0, 0);
        }

        // Bar Hover
        let isTeaHover = (canvasMouseX >= 35 && canvasMouseX <= 275 && canvasMouseY >= 18 && canvasMouseY <= 76);
        if (isTeaHover) {
            hoveredTableId = 'tea';
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 3;
            ctx.strokeRect(33, 20, 241, 58);

            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "left";
            ctx.fillText("☕ VIP Çay & Kahve Barı (10 TL) - Tıkla ve Al", 152, 41);
        } else {
            hoveredTableId = null;
        }

        // Kapı Hover
        let isExitDoorHover = (canvasMouseX >= canvas.width / 2 - 50 && canvasMouseX <= canvas.width / 2 + 50 && canvasMouseY >= canvas.height - 75 && canvasMouseY <= canvas.height - 5);
        if (isExitDoorHover) {
            ctx.strokeStyle = "#38bdf8";
            ctx.lineWidth = 3;
            ctx.strokeRect(canvas.width / 2 - 42, canvas.height - 67, 84, 64);
        }

        // Buhar Animasyonu
        let steamAnimY = 16 - ((Date.now() / 60) % 12);
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(58, steamAnimY + 6);
        ctx.quadraticCurveTo(63, steamAnimY + 3, 59, steamAnimY);
        ctx.stroke();

        // Duvar TV'si
        if (typeof drawVenueTV === 'function') {
            drawVenueTV(ctx, 440, 12, 120, 66);
        }

        // 5 BÜYÜK MASAYI ÇİZ (2.5D Volumetrik Fonksiyonlar)
        if (typeof cafeTables !== 'undefined') {
            cafeTables.forEach(t => {
                let isHover = (canvasMouseX >= t.x && canvasMouseX <= t.x + t.w && canvasMouseY >= t.y && canvasMouseY <= t.y + t.h + 16);
                if (isHover) hoveredTableId = t.id;

                if (t.id === 'billiard') {
                    drawBilliardTable1000(t.x, t.y, t.w, t.h, isHover);
                } else if (t.id === 'tavla') {
                    drawTavlaTable1000(t.x, t.y, t.w, t.h, isHover);
                } else if (t.id === 'xox') {
                    drawXoxTable1000(t.x, t.y, t.w, t.h, isHover);
                } else if (t.id === 'amiral') {
                    drawAmiralBattiTable1000(t.x, t.y, t.w, t.h, isHover);
                } else if (t.id === 'chess') {
                    drawChessTable1000(t.x, t.y, t.w, t.h, isHover);
                }
            });
        }

        setGameCursor((hoveredTableId || isExitDoorHover) ? 'pointer' : 'default');
    }

    /**
     * 3. 2.5D BİLARDO MASASI ÇİZİMİ (4 Masif Oymalı Bacak, 18px Kalın Ön Etek, 3D Çuha & Pirinç Cepler)
     */
    function drawBilliardTable1000(x, y, w, h, isHover) {
        ctx.save();

        let apronH = 18; // Ön maun etek kalınlığı

        // 1. 4 MASİF OYMALI ASLAN AYAK (Carved Wooden Legs - Zemine Basar)
        // Ayakların Yere Bastığı Noktalar: Arka sol/sağ ve Ön sol/sağ
        let legs = [
            { lx: x + 20, ly: y + 20, isBack: true },
            { lx: x + w - 20, ly: y + 20, isBack: true },
            { lx: x + 22, ly: y + h + apronH - 4, isBack: false },
            { lx: x + w - 22, ly: y + h + apronH - 4, isBack: false }
        ];

        legs.forEach(leg => {
            // Yere düşen kontak gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.beginPath();
            ctx.ellipse(leg.lx, leg.ly + 4, 9, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Ahşap Oymalı Bacak Gövdesi
            let legGrad = ctx.createLinearGradient(leg.lx - 6, leg.ly - 18, leg.lx + 6, leg.ly);
            legGrad.addColorStop(0, "#451a03");
            legGrad.addColorStop(0.5, "#78350f");
            legGrad.addColorStop(1, "#270f03");
            ctx.fillStyle = legGrad;
            ctx.beginPath();
            ctx.roundRect(leg.lx - 6, leg.ly - 18, 12, 20, 3);
            ctx.fill();
            ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 1; ctx.stroke();
        });

        // 2. Masa Altı Zemin ve Boşluk Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 16, w - 20, h, 8);
        ctx.fill();

        // 3. Masif Ahşap Ön ve Yan Etek (3D Apron: x, y + h, w, apronH)
        let apronGrad = ctx.createLinearGradient(x, y + h - 4, x, y + h + apronH);
        apronGrad.addColorStop(0, "#5c2c16");
        apronGrad.addColorStop(0.4, "#78350f");
        apronGrad.addColorStop(1, "#270f03");
        ctx.fillStyle = apronGrad;
        ctx.beginPath();
        ctx.roundRect(x, y + h - 6, w, apronH + 6, [0, 0, 10, 10]);
        ctx.fill();
        ctx.strokeStyle = isHover ? "#facc15" : "#361608";
        ctx.lineWidth = isHover ? 2.5 : 1.5;
        ctx.stroke();

        // Apron Üzeri Pirinç Çıta Süslemesi
        ctx.strokeStyle = "rgba(250, 204, 21, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 15, y + h + apronH / 2);
        ctx.lineTo(x + w - 15, y + h + apronH / 2);
        ctx.stroke();

        // 4. Masanın Üst Tablası (Hover Efekti ile)
        if (isHover) {
            ctx.strokeStyle = "rgba(250, 204, 21, 0.55)";
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 12);
            ctx.stroke();
        }

        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 12);
        ctx.fill();
        ctx.strokeStyle = isHover ? "#facc15" : "#78350f";
        ctx.lineWidth = isHover ? 2.5 : 2;
        ctx.stroke();

        // 5. 2.5D Zümrüt Yeşili İtalyan Çuha (Ön Bant Kalın, Arka Bant İnce)
        let feltGrad = ctx.createLinearGradient(x, y, x, y + h);
        feltGrad.addColorStop(0, "#047857");
        feltGrad.addColorStop(0.5, "#059669");
        feltGrad.addColorStop(1, "#047857");
        ctx.fillStyle = feltGrad;
        ctx.beginPath();
        ctx.roundRect(x + 13, y + 10, w - 26, h - 22, 6);
        ctx.fill();

        // 6. Pirinç Döküm Köşe Takviyeleri ve Derinlikli Delikler
        let pockets = [
            { px: x + 14, py: y + 11 }, { px: x + w / 2, py: y + 10 }, { px: x + w - 14, py: y + 11 },
            { px: x + 14, py: y + h - 13 }, { px: x + w / 2, py: y + h - 11 }, { px: x + w - 14, py: y + h - 13 }
        ];
        pockets.forEach(p => {
            // Pirinç plaka
            ctx.fillStyle = "#ca8a04";
            ctx.beginPath(); ctx.arc(p.px, p.py, 7.5, 0, Math.PI * 2); ctx.fill();
            // Deri iç oyuk (Koyu derinlik)
            ctx.fillStyle = "#020617";
            ctx.beginPath(); ctx.arc(p.px, p.py, 5.5, 0, Math.PI * 2); ctx.fill();
        });

        // 7. 3D Küre Gölgeli Beyaz Vuruş Topu
        let cueBallX = x + Math.round(w * 0.28), cueBallY = y + h / 2 - 1;
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath(); ctx.ellipse(cueBallX + 1, cueBallY + 4, 4.5, 2.5, 0, 0, Math.PI * 2); ctx.fill();
        let cueGrad = ctx.createRadialGradient(cueBallX - 1, cueBallY - 1, 1, cueBallX, cueBallY, 5);
        cueGrad.addColorStop(0, "#ffffff");
        cueGrad.addColorStop(0.8, "#e2e8f0");
        cueGrad.addColorStop(1, "#94a3b8");
        ctx.fillStyle = cueGrad;
        ctx.beginPath(); ctx.arc(cueBallX, cueBallY, 5, 0, Math.PI * 2); ctx.fill();

        // 8. Üçgen Dizili Renkli Bilardo Topları
        let rackX = x + Math.round(w * 0.74), rackY = y + h / 2 - 1;
        let ballColors = ["#dc2626", "#000000", "#f59e0b", "#2563eb", "#7c3aed"];
        ballColors.forEach((color, idx) => {
            let bx = rackX + (idx % 2) * 8;
            let by = rackY + (idx - 2) * 5;
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath(); ctx.ellipse(bx + 1, by + 3.5, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
            let bGrad = ctx.createRadialGradient(bx - 1, by - 1, 1, bx, by, 4.5);
            bGrad.addColorStop(0, "#ffffff");
            bGrad.addColorStop(0.3, color);
            bGrad.addColorStop(1, "#0f172a");
            ctx.fillStyle = bGrad;
            ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, Math.PI * 2); ctx.fill();
        });

        // 9. Çapraz Masif Vernikli Ahşap İsteka
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(x + 20, y + h - 18);
        ctx.lineTo(x + w - 30, y + 16);
        ctx.stroke();

        // Tebeşir Küpü
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(x + w - 24, y + h - 20, 6, 6);

        // 10. Tavan Sarkıt Çift Pirinç Lamba
        [x + w * 0.35, x + w * 0.65].forEach(lampX => {
            ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(lampX, y - 45); ctx.lineTo(lampX, y - 10); ctx.stroke();
            ctx.fillStyle = "#ca8a04";
            ctx.beginPath();
            ctx.moveTo(lampX - 12, y - 10);
            ctx.lineTo(lampX + 12, y - 10);
            ctx.lineTo(lampX + 18, y);
            ctx.lineTo(lampX - 18, y);
            ctx.closePath();
            ctx.fill();
        });

        // Başlık Rozeti
        ctx.fillStyle = isHover ? "#facc15" : "#ffffff";
        ctx.font = "bold 13px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎱 8-Ball Bilardo", x + w / 2, y + h + apronH + 18);
        if (isHover) {
            ctx.fillStyle = "#38bdf8";
            ctx.font = "11px sans-serif";
            ctx.fillText("(Tıkla ve Katıl / İzle)", x + w / 2, y + h + apronH + 32);
        }
        ctx.restore();
    }

    /**
     * 4. 2.5D GELENEKSEL TAVLA MASASI (4 Tornalı Ayak, 14px Ön Etek, 2.5D Sandalyeler, Zarlar & Çay)
     */
    function drawTavlaTable1000(x, y, w, h, isHover) {
        ctx.save();
        let apronH = 14;

        // 1. 4 Masif Ahşap Ayak
        let legs = [
            { lx: x + 14, ly: y + 16 }, { lx: x + w - 14, ly: y + 16 },
            { lx: x + 16, ly: y + h + apronH - 4 }, { lx: x + w - 16, ly: y + h + apronH - 4 }
        ];
        legs.forEach(leg => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.beginPath(); ctx.ellipse(leg.lx, leg.ly + 3, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#361608";
            ctx.fillRect(leg.lx - 4, leg.ly - 14, 8, 16);
        });

        // 2. Ön Ahşap Etek (Apron)
        let apronGrad = ctx.createLinearGradient(x, y + h - 4, x, y + h + apronH);
        apronGrad.addColorStop(0, "#5c2c16");
        apronGrad.addColorStop(1, "#270f03");
        ctx.fillStyle = apronGrad;
        ctx.beginPath();
        ctx.roundRect(x, y + h - 5, w, apronH + 5, [0, 0, 8, 8]);
        ctx.fill();
        ctx.strokeStyle = isHover ? "#f59e0b" : "#451a03";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Masanın Üst Tablası
        if (isHover) {
            ctx.strokeStyle = "rgba(245, 158, 11, 0.55)";
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 10); ctx.stroke();
        }

        ctx.fillStyle = "#451a03";
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
        ctx.strokeStyle = isHover ? "#f59e0b" : "#78350f";
        ctx.lineWidth = isHover ? 2.5 : 2; ctx.stroke();

        // 4. İç Tahta Alanı (Sedef / Ahşap)
        let boardGrad = ctx.createLinearGradient(x, y, x, y + h);
        boardGrad.addColorStop(0, "#d97706");
        boardGrad.addColorStop(1, "#b45309");
        ctx.fillStyle = boardGrad;
        ctx.beginPath(); ctx.roundRect(x + 8, y + 6, w - 16, h - 12, 4); ctx.fill();

        // Orta Kiriş
        ctx.fillStyle = "#451a03";
        ctx.fillRect(x + w / 2 - 4, y + 6, 8, h - 12);

        // Sivri Dişler / Üçgenler
        let triW = (w - 24) / 12;
        for (let i = 0; i < 12; i++) {
            let tx = x + 10 + i * triW + (i >= 6 ? 4 : 0);
            ctx.fillStyle = (i % 2 === 0) ? "#991b1b" : "#fef3c7";
            ctx.beginPath();
            ctx.moveTo(tx, y + 6); ctx.lineTo(tx + triW, y + 6); ctx.lineTo(tx + triW / 2, y + 6 + 24);
            ctx.closePath(); ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tx, y + h - 6); ctx.lineTo(tx + triW, y + h - 6); ctx.lineTo(tx + triW / 2, y + h - 30);
            ctx.closePath(); ctx.fill();
        }

        // Pullar
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = "#f8fafc";
            ctx.beginPath(); ctx.arc(x + 16, y + 12 + i * 8, 4, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#1e293b";
            ctx.beginPath(); ctx.arc(x + w - 16, y + h - 12 - i * 8, 4, 0, Math.PI * 2); ctx.fill();
        }

        // Atılmış Minik Zarlar (6 ve 5)
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x + w / 2 - 14, y + h / 2 - 5, 10, 10);
        ctx.fillRect(x + w / 2 + 4, y + h / 2 - 5, 10, 10);
        ctx.fillStyle = "#000000";
        ctx.beginPath(); ctx.arc(x + w / 2 - 9, y + h / 2, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(x + w / 2 + 9, y + h / 2, 1.5, 0, Math.PI * 2); ctx.fill();

        // Çay Bardağı
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(x + w - 10, y + 8, 5, 8);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(x + w - 11, y + 16, 7, 2);

        // Tavan Sarkıt Pirinç Lamba
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + w / 2, y - 40); ctx.lineTo(x + w / 2, y - 8); ctx.stroke();
        ctx.fillStyle = "#ca8a04";
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 12, y - 8); ctx.lineTo(x + w / 2 + 12, y - 8);
        ctx.lineTo(x + w / 2 + 16, y); ctx.lineTo(x + w / 2 - 16, y);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = isHover ? "#facc15" : "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🎲 Geleneksel Tavla", x + w / 2, y + h + apronH + 16);
        if (isHover) {
            ctx.fillStyle = "#38bdf8";
            ctx.font = "10px sans-serif";
            ctx.fillText("(Tıkla ve Katıl / İzle)", x + w / 2, y + h + apronH + 28);
        }
        ctx.restore();
    }

    /**
     * 5. 2.5D XOX BİSTRO MASASI (Pirinç Merkezi Tulip Ayak, 12px Ön Etek, 3D Neon Izgara)
     */
    function drawXoxTable1000(x, y, w, h, isHover) {
        ctx.save();
        let apronH = 12;

        // 1. Döküm Pirinç Merkezi Ayak ve Taban (Tulip Pedestal Base)
        let cx = x + w / 2, cy = y + h + apronH - 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath(); ctx.ellipse(cx, cy + 3, 16, 6, 0, 0, Math.PI * 2); ctx.fill();

        // Dairesel Taban
        ctx.fillStyle = "#ca8a04";
        ctx.beginPath(); ctx.ellipse(cx, cy, 14, 5, 0, 0, Math.PI * 2); ctx.fill();

        // Dikey Pirinç Sütun
        ctx.fillStyle = "#facc15";
        ctx.fillRect(cx - 4, y + h - 8, 8, apronH + 6);

        // 2. Bistro Masası Ön Eteği
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.roundRect(x, y + h - 5, w, apronH + 5, [0, 0, 8, 8]);
        ctx.fill();
        ctx.strokeStyle = isHover ? "#38bdf8" : "#334155";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. Üst Tabla
        if (isHover) {
            ctx.strokeStyle = "rgba(56, 189, 248, 0.55)";
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 10); ctx.stroke();
        }

        let tableGrad = ctx.createLinearGradient(x, y, x, y + h);
        tableGrad.addColorStop(0, "#1e293b");
        tableGrad.addColorStop(1, "#0f172a");
        ctx.fillStyle = tableGrad;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
        ctx.strokeStyle = isHover ? "#38bdf8" : "#475569";
        ctx.lineWidth = isHover ? 2.5 : 1.5; ctx.stroke();

        // 3x3 Neon Izgara
        let cellW = (w - 28) / 3;
        let cellH = (h - 22) / 3;
        ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
        ctx.lineWidth = 1.5;
        for (let c = 1; c <= 2; c++) {
            ctx.beginPath();
            ctx.moveTo(x + 14 + c * cellW, y + 10); ctx.lineTo(x + 14 + c * cellW, y + h - 10); ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + 14, y + 10 + c * cellH); ctx.lineTo(x + w - 14, y + 10 + c * cellH); ctx.stroke();
        }

        // X ve O Taşları
        ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(x + 18, y + 16); ctx.lineTo(x + 18 + cellW - 10, y + 16 + cellH - 10);
        ctx.moveTo(x + 18 + cellW - 10, y + 16); ctx.lineTo(x + 18, y + 16 + cellH - 10);
        ctx.stroke();

        ctx.strokeStyle = "#f97316"; ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.arc(x + 14 + cellW * 1.5, y + 10 + cellH * 1.5, Math.min(cellW, cellH) * 0.35, 0, Math.PI * 2);
        ctx.stroke();

        // Tavan Sarkıt Lamba
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + w / 2, y - 35); ctx.lineTo(x + w / 2, y - 6); ctx.stroke();
        ctx.fillStyle = "#0284c7";
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 10, y - 6); ctx.lineTo(x + w / 2 + 10, y - 6);
        ctx.lineTo(x + w / 2 + 14, y); ctx.lineTo(x + w / 2 - 14, y);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = isHover ? "#38bdf8" : "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("❌ XOX Düellosu", x + w / 2, y + h + apronH + 16);
        if (isHover) {
            ctx.fillStyle = "#facc15";
            ctx.font = "10px sans-serif";
            ctx.fillText("(Hızlı Zeka Maçı)", x + w / 2, y + h + apronH + 28);
        }
        ctx.restore();
    }

    /**
     * 6. 2.5D AMİRAL BATTI MASASI (4 Çelik Bacak, 14px Donanma Eteği, İkili Radar & Pusula)
     */
    function drawAmiralBattiTable1000(x, y, w, h, isHover) {
        ctx.save();
        let apronH = 14;

        // 4 Çelik Bacak
        let legs = [
            { lx: x + 14, ly: y + 16 }, { lx: x + w - 14, ly: y + 16 },
            { lx: x + 16, ly: y + h + apronH - 4 }, { lx: x + w - 16, ly: y + h + apronH - 4 }
        ];
        legs.forEach(leg => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.beginPath(); ctx.ellipse(leg.lx, leg.ly + 3, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#082f49";
            ctx.fillRect(leg.lx - 3.5, leg.ly - 14, 7, 16);
            ctx.fillStyle = "#ca8a04";
            ctx.fillRect(leg.lx - 4, leg.ly - 2, 8, 3); // Pirinç pabuç
        });

        // Ön Etek
        ctx.fillStyle = "#082f49";
        ctx.beginPath(); ctx.roundRect(x, y + h - 5, w, apronH + 5, [0, 0, 8, 8]); ctx.fill();
        ctx.strokeStyle = isHover ? "#38bdf8" : "#0369a1";
        ctx.lineWidth = 1.5; ctx.stroke();

        // Üst Tabla
        if (isHover) {
            ctx.strokeStyle = "rgba(14, 165, 233, 0.55)";
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 10); ctx.stroke();
        }

        let deskGrad = ctx.createLinearGradient(x, y, x, y + h);
        deskGrad.addColorStop(0, "#0c4a6e");
        deskGrad.addColorStop(1, "#082f49");
        ctx.fillStyle = deskGrad;
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
        ctx.strokeStyle = isHover ? "#38bdf8" : "#0284c7";
        ctx.lineWidth = isHover ? 2.5 : 1.5; ctx.stroke();

        // İkili Taktik Radar Ekranı
        let gridW = (w - 30) / 2;
        let gridH = h - 22;
        [x + 10, x + 10 + gridW + 10].forEach(gx => {
            ctx.fillStyle = "#021727";
            ctx.beginPath(); ctx.roundRect(gx, y + 10, gridW, gridH, 4); ctx.fill();
            ctx.strokeStyle = "#0369a1"; ctx.lineWidth = 1; ctx.stroke();

            ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
            for (let c = 1; c <= 3; c++) {
                ctx.beginPath();
                ctx.moveTo(gx + c * (gridW / 4), y + 10); ctx.lineTo(gx + c * (gridW / 4), y + 10 + gridH); ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(gx, y + 10 + c * (gridH / 4)); ctx.lineTo(gx + gridW, y + 10 + c * (gridH / 4)); ctx.stroke();
            }
        });

        // Savaş Gemisi & İsabet Pimi
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(x + 15, y + 20, 18, 6);
        ctx.fillStyle = "#ef4444";
        ctx.beginPath(); ctx.arc(x + 24, y + 23, 2.5, 0, Math.PI * 2); ctx.fill();

        // Pirinç Pusula
        ctx.fillStyle = "#ca8a04";
        ctx.beginPath(); ctx.arc(x + w - 8, y + 10, 4, 0, Math.PI * 2); ctx.fill();

        // Tavan Sarkıt Lamba
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + w / 2, y - 35); ctx.lineTo(x + w / 2, y - 6); ctx.stroke();
        ctx.fillStyle = "#0369a1";
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 12, y - 6); ctx.lineTo(x + w / 2 + 12, y - 6);
        ctx.lineTo(x + w / 2 + 16, y); ctx.lineTo(x + w / 2 - 16, y);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = isHover ? "#38bdf8" : "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🚢 Amiral Battı", x + w / 2, y + h + apronH + 16);
        if (isHover) {
            ctx.fillStyle = "#facc15";
            ctx.font = "10px sans-serif";
            ctx.fillText("(Deniz Harp Düellosu)", x + w / 2, y + h + apronH + 28);
        }
        ctx.restore();
    }

    /**
     * 7. 2.5D BÜYÜK USTA SATRANÇ MASASI (4 Tornalı Ayak, 14px Ahşap Etek, Analog Saat & Berjerler)
     */
    function drawChessTable1000(x, y, w, h, isHover) {
        ctx.save();
        let apronH = 14;

        // 4 Tornalı Ceviz Ayak
        let legs = [
            { lx: x + 14, ly: y + 16 }, { lx: x + w - 14, ly: y + 16 },
            { lx: x + 16, ly: y + h + apronH - 4 }, { lx: x + w - 16, ly: y + h + apronH - 4 }
        ];
        legs.forEach(leg => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
            ctx.beginPath(); ctx.ellipse(leg.lx, leg.ly + 3, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#361608";
            ctx.fillRect(leg.lx - 4, leg.ly - 14, 8, 16);
            ctx.fillStyle = "#ca8a04";
            ctx.fillRect(leg.lx - 4, leg.ly - 2, 8, 3);
        });

        // Ön Etek
        let apronGrad = ctx.createLinearGradient(x, y + h - 4, x, y + h + apronH);
        apronGrad.addColorStop(0, "#5c2c16");
        apronGrad.addColorStop(1, "#270f03");
        ctx.fillStyle = apronGrad;
        ctx.beginPath(); ctx.roundRect(x, y + h - 5, w, apronH + 5, [0, 0, 8, 8]); ctx.fill();
        ctx.strokeStyle = isHover ? "#facc15" : "#451a03";
        ctx.lineWidth = 1.5; ctx.stroke();

        // Üst Tabla
        if (isHover) {
            ctx.strokeStyle = "rgba(250, 204, 21, 0.55)";
            ctx.lineWidth = 5;
            ctx.beginPath(); ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 10); ctx.stroke();
        }

        ctx.fillStyle = "#451a03";
        ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.fill();
        ctx.strokeStyle = isHover ? "#facc15" : "#78350f";
        ctx.lineWidth = isHover ? 2.8 : 2; ctx.stroke();

        // 8x8 Satranç Tahtası
        let sqSize = (h - 18) / 8;
        let boardStartX = x + 12;
        let boardStartY = y + 8;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                ctx.fillStyle = ((r + c) % 2 === 0) ? "#fef3c7" : "#78350f";
                ctx.fillRect(boardStartX + c * sqSize, boardStartY + r * sqSize, sqSize, sqSize);
            }
        }
        ctx.strokeStyle = "#270f03";
        ctx.lineWidth = 1;
        ctx.strokeRect(boardStartX, boardStartY, sqSize * 8, sqSize * 8);

        // Satranç Taşları Siluetleri
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(boardStartX + sqSize * 3.5, boardStartY + sqSize * 6.5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(boardStartX + sqSize * 4.5, boardStartY + sqSize * 4.5, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.beginPath(); ctx.arc(boardStartX + sqSize * 3.5, boardStartY + sqSize * 1.5, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(boardStartX + sqSize * 2.5, boardStartY + sqSize * 2.5, 2.5, 0, Math.PI * 2); ctx.fill();

        // Masanın Sağ Kenarında 2.5D Çift Butonlu Analog Satranç Saati
        let clockX = x + w - 24, clockY = y + h / 2 - 12;
        ctx.fillStyle = "#5c2c16";
        ctx.beginPath(); ctx.roundRect(clockX, clockY, 18, 24, 3); ctx.fill();
        ctx.strokeStyle = "#ca8a04"; ctx.lineWidth = 1; ctx.stroke();
        // İki Kadran
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath(); ctx.arc(clockX + 9, clockY + 6, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(clockX + 9, clockY + 18, 4, 0, Math.PI * 2); ctx.fill();
        // Üst Butonlar
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(clockX + 4, clockY - 3, 3, 3);
        ctx.fillRect(clockX + 11, clockY - 1, 3, 2);

        // Tavan Sarkıt Kütüphane / Banker Lambası
        ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x + w / 2, y - 40); ctx.lineTo(x + w / 2, y - 8); ctx.stroke();
        ctx.fillStyle = "#15803d";
        ctx.beginPath();
        ctx.moveTo(x + w / 2 - 14, y - 8); ctx.lineTo(x + w / 2 + 14, y - 8);
        ctx.lineTo(x + w / 2 + 18, y); ctx.lineTo(x + w / 2 - 18, y);
        ctx.closePath(); ctx.fill();

        ctx.fillStyle = isHover ? "#facc15" : "#ffffff";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("♟️ Satranç Masası", x + w / 2, y + h + apronH + 16);
        if (isHover) {
            ctx.fillStyle = "#38bdf8";
            ctx.font = "10px sans-serif";
            ctx.fillText("(Büyük Usta Düellosu)", x + w / 2, y + h + apronH + 28);
        }
        ctx.restore();
    }

    // Global Dışa Aktarımlar
    window.renderStaticOyunSalonuTo = renderStaticOyunSalonuTo;
    window.drawOyunSalonuEnvironment = drawOyunSalonuEnvironment;
    window.drawBilliardTable1000 = drawBilliardTable1000;
    window.drawTavlaTable1000 = drawTavlaTable1000;
    window.drawXoxTable1000 = drawXoxTable1000;
    window.drawAmiralBattiTable1000 = drawAmiralBattiTable1000;
    window.drawChessTable1000 = drawChessTable1000;
})();
