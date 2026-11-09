// public/js/renderers/renderCadde2.js - Cadde 2 (3 Yönlü Yol & VİP CLUB Cephesi)
// Sağa, Sola ve Yukarı olmak üzere 3 farklı yol içeren şehir haritası

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    /**
     * Statik Cadde 2 Arka Planı (bgCache uyumlu)
     */
    function renderStaticCadde2To(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        const isNight = (typeof isNightMode !== 'undefined') ? isNightMode : true;

        // 1. Zemin Fonu & Gece Gökyüzü (y: 0..120)
        bctx.fillStyle = isNight ? "#060913" : "#0f172a";
        bctx.fillRect(0, 0, width, height);

        // Yıldızlar & Ay Işıltısı
        bctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        for (let i = 0; i < 35; i++) {
            let sx = (i * 139) % width;
            let sy = (i * 67) % 95;
            bctx.beginPath();
            bctx.arc(sx, sy, (i % 3 === 0) ? 1.5 : 1, 0, Math.PI * 2);
            bctx.fill();
        }

        // 2. ŞEHİR SİLÜETİ & ARKA BİNALAR (Uzak Plan: y: 20..110)
        const buildings = [
            { x: 10, w: 120, h: 90, color: "#111827" },
            { x: 140, w: 90, h: 105, color: "#0f172a" },
            { x: 240, w: 130, h: 80, color: "#1e1b4b" },
            { x: 630, w: 110, h: 95, color: "#111827" },
            { x: 750, w: 120, h: 110, color: "#0f172a" },
            { x: 880, w: 110, h: 85, color: "#1e293b" }
        ];
        buildings.forEach(b => {
            bctx.fillStyle = b.color;
            bctx.fillRect(b.x, 110 - b.h, b.w, b.h);
            bctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
            bctx.lineWidth = 1;
            bctx.strokeRect(b.x, 110 - b.h, b.w, b.h);
            // Minik pencereler
            bctx.fillStyle = "rgba(250, 204, 21, 0.2)";
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if ((r + c + b.x) % 2 === 0) {
                        bctx.fillRect(b.x + 12 + c * 24, 110 - b.h + 12 + r * 20, 10, 10);
                    }
                }
            }
        });

        // 3. ÇİFT KALDIRIMLI ŞEHİR PARSELİ
        // Üst Kaldırım (y: 110..155)
        bctx.fillStyle = isNight ? "#1f2937" : "#374151";
        bctx.fillRect(0, 110, width, 45);
        // Granit karo çizgileri
        bctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        bctx.lineWidth = 1;
        for (let x = 0; x < width; x += 32) {
            bctx.beginPath(); bctx.moveTo(x, 110); bctx.lineTo(x, 155); bctx.stroke();
        }

        // =====================================================================
        // 4. ÜÇ FARKLI YOL MİMARİSİ (SOLA, YUKARI VE SAĞA KAVŞAK / T-JUNCTION)
        // =====================================================================
        const roadY = 155;
        const roadH = 175;
        const roadColor = isNight ? "#181e29" : "#242c3d";

        // A) ANA YATAY BULVAR (Soldan Sağa Kesintisiz: y: 155..330)
        bctx.fillStyle = roadColor;
        bctx.fillRect(0, roadY, width, roadH);

        // B) KUZEY BULVARI / YUKARI ANA YOL (Açık Gelecek Bağlantı Yolu: x: 410..590, y: 0..155)
        // Yukarı doğru uzanan kesintisiz açık bulvar
        bctx.fillStyle = roadColor;
        bctx.fillRect(410, 0, 180, roadY);

        // Kuzey yolunun sol ve sağ granit bordürleri (y: 0'a kadar kesintisiz)
        bctx.fillStyle = isNight ? "#374151" : "#4b5563";
        bctx.fillRect(404, 0, 6, roadY);
        bctx.fillRect(590, 0, 6, roadY);

        // Ana Yol Kenar Bordür Taşları (Granit)
        bctx.fillStyle = isNight ? "#475569" : "#64748b";
        // Sol parça (x: 0..404)
        bctx.fillRect(0, roadY - 5, 404, 5);
        // Sağ parça (x: 596..width)
        bctx.fillRect(596, roadY - 5, width - 596, 5);
        // Alt bordür (kesintisiz)
        bctx.fillRect(0, roadY + roadH, width, 6);

        // Yatay Şerit Çizgileri (Sarı Kesikli Yol Çizgisi)
        bctx.strokeStyle = "#eab308";
        bctx.lineWidth = 3;
        bctx.setLineDash([22, 16]);
        // Sol şerit (x: 0..410)
        bctx.beginPath();
        bctx.moveTo(0, roadY + roadH / 2);
        bctx.lineTo(410, roadY + roadH / 2);
        bctx.stroke();
        // Sağ şerit (x: 590..width)
        bctx.beginPath();
        bctx.moveTo(590, roadY + roadH / 2);
        bctx.lineTo(width, roadY + roadH / 2);
        bctx.stroke();

        // Dikey Yol Şerit Çizgisi (Kuzey yolundaki kesikli sarı çizgi - y: 0'dan bulvara kadar kesintisiz)
        bctx.beginPath();
        bctx.moveTo(500, 0);
        bctx.lineTo(500, roadY + 20);
        bctx.stroke();
        bctx.setLineDash([]); // Sıfırla

        // Yaya Geçidi (Zebra Crosswalk - Kavşak Girişinde)
        bctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        for (let i = 0; i < 6; i++) {
            bctx.fillRect(422 + i * 26, roadY + roadH - 24, 16, 20);
        }

        // =====================================================================
        // 5. KUZEY BULVARI / YUKARI YOL DETAYLARI & İNŞAAT BARİKATI
        // =====================================================================
        // Yol Yüzeyi Yön Oku (Kuzeye Doğru İleri Şerit İşaretleri)
        bctx.save();
        bctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        // Yukarı Yön Oku 1 (y: 45)
        bctx.beginPath();
        bctx.moveTo(500, 32);
        bctx.lineTo(512, 48);
        bctx.lineTo(505, 48);
        bctx.lineTo(505, 62);
        bctx.lineTo(495, 62);
        bctx.lineTo(495, 48);
        bctx.lineTo(488, 48);
        bctx.closePath();
        bctx.fill();
        bctx.restore();

        // Yol Kenarı Yağmur Mazgalı (Kuzey Yolun Kenarında)
        bctx.fillStyle = "#0f172a";
        bctx.fillRect(414, 138, 20, 14);
        bctx.strokeStyle = "#475569";
        bctx.lineWidth = 1;
        bctx.strokeRect(414, 138, 20, 14);
        for (let gx = 417; gx < 432; gx += 4) {
            bctx.beginPath(); bctx.moveTo(gx, 139); bctx.lineTo(gx, 151); bctx.stroke();
        }

        // KUZEY YOLU ÖNÜ İNŞAAT & EMNİYET BARİKATI (2.5D Karayolları Standardı)
        drawNorthRoadBarricade(bctx);

        // =====================================================================
        // 6. SOL CEPHEDEKİ BİNALAR: 🍷 VİP CLUB & 🌿 BOTANİK DÜKKANI
        // =====================================================================
        // A) 🍷 VİP CLUB (Yeraltı Kulübü & Gizli Karaborsa: x: 20..175, y: 12..110)
        const vipX = 20, vipY = 12, vipW = 155, vipH = 98;

        // Ağır Koyu Tuğla & Granit Cephe
        const vipWallGrad = bctx.createLinearGradient(vipX, vipY, vipX, vipY + vipH);
        vipWallGrad.addColorStop(0, "#1c1917");
        vipWallGrad.addColorStop(0.5, "#292524");
        vipWallGrad.addColorStop(1, "#0c0a09");
        bctx.fillStyle = vipWallGrad;
        bctx.beginPath();
        bctx.roundRect(vipX, vipY, vipW, vipH, 8);
        bctx.fill();
        bctx.strokeStyle = "#b45309";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Tuğla Doku Çizgileri
        bctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
        bctx.lineWidth = 1;
        for (let ty = vipY + 6; ty < vipY + vipH - 20; ty += 10) {
            bctx.beginPath(); bctx.moveTo(vipX + 4, ty); bctx.lineTo(vipX + vipW - 4, ty); bctx.stroke();
        }

        // Koyu Kırmızı / Bordo Metal Saçak Tente
        bctx.fillStyle = "#7f1d1d";
        bctx.fillRect(vipX + 12, vipY + 28, vipW - 24, 10);
        bctx.strokeStyle = "#dc2626";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(vipX + 12, vipY + 28, vipW - 24, 10);

        // VİP CLUB NEON TABELASI (Koyu Kırmızı & Altın Parıltılı)
        bctx.fillStyle = "#ef4444";
        bctx.font = "900 12.5px 'Arial Black', sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🍷 V İ P   C L U B", vipX + vipW / 2, vipY + 22);

        // Gizli Ağır Çelik Kapı (x: 69..125, y: 50..108)
        const doorX = vipX + Math.round((vipW - 56) / 2);
        const doorY = vipY + 38;
        const doorW = 56, doorH = 58;

        const doorGrad = bctx.createLinearGradient(doorX, doorY, doorX + doorW, doorY);
        doorGrad.addColorStop(0, "#1f2937");
        doorGrad.addColorStop(0.5, "#111827");
        doorGrad.addColorStop(1, "#1f2937");
        bctx.fillStyle = doorGrad;
        bctx.beginPath();
        bctx.roundRect(doorX, doorY, doorW, doorH, [6, 6, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Kapı Demir Perçinleri (Studs)
        bctx.fillStyle = "#d97706";
        for (let py = doorY + 6; py <= doorY + doorH - 8; py += 12) {
            bctx.beginPath(); bctx.arc(doorX + 6, py, 1.8, 0, Math.PI * 2); bctx.fill();
            bctx.beginPath(); bctx.arc(doorX + doorW - 6, py, 1.8, 0, Math.PI * 2); bctx.fill();
        }

        // Gözetleme Mazgalı (Iron Peephole Grate)
        bctx.fillStyle = "#030712";
        bctx.fillRect(doorX + 16, doorY + 12, 24, 12);
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 1;
        bctx.strokeRect(doorX + 16, doorY + 12, 24, 12);
        // Demir parmaklıklar
        bctx.strokeStyle = "#94a3b8";
        for (let gx = doorX + 21; gx < doorX + 38; gx += 5) {
            bctx.beginPath(); bctx.moveTo(gx, doorY + 12); bctx.lineTo(gx, doorY + 24); bctx.stroke();
        }

        // Kapı Pirinç Tokmağı
        bctx.fillStyle = "#facc15";
        bctx.beginPath(); bctx.arc(doorX + doorW - 12, doorY + 32, 2.5, 0, Math.PI * 2); bctx.fill();

        // Kapı Altındaki "SEVİYE 2+ GİRİŞ" Plakası
        bctx.fillStyle = "#451a03";
        bctx.fillRect(doorX + 4, doorY + 44, doorW - 8, 10);
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 0.8;
        bctx.strokeRect(doorX + 4, doorY + 44, doorW - 8, 10);
        bctx.fillStyle = "#fde047";
        bctx.font = "bold 7.5px sans-serif";
        bctx.fillText("SEVİYE 2+ GİRİŞ", doorX + doorW / 2, doorY + 52);

        // Kapı Önü Kırmızı Protokol Halısı
        bctx.fillStyle = "#991b1b";
        bctx.fillRect(doorX + 6, doorY + doorH, doorW - 12, 14);
        bctx.fillStyle = "rgba(220, 38, 38, 0.4)";
        bctx.beginPath();
        bctx.ellipse(doorX + doorW / 2, doorY + doorH + 10, 24, 6, 0, 0, Math.PI * 2);
        bctx.fill();

        // VIP Giriş Altın Bariyerleri / Babaları (Stanchions)
        bctx.fillStyle = "#f59e0b";
        bctx.fillRect(doorX - 6, doorY + 38, 4, 20);
        bctx.beginPath(); bctx.arc(doorX - 4, doorY + 38, 3.5, 0, Math.PI * 2); bctx.fill();
        bctx.fillRect(doorX + doorW + 2, doorY + 38, 4, 20);
        bctx.beginPath(); bctx.arc(doorX + doorW + 4, doorY + 38, 3.5, 0, Math.PI * 2); bctx.fill();

        // B) 🌿 İZOMETRİK BOTANİK DÜKKANI & CAM SERA CEPHE (x: 190..395)
        const botX = 195, botY = 12, botW = 200, botH = 98;

        // Cam Kubbeli Sera Çatısı
        bctx.fillStyle = isNight ? "#064e3b" : "#047857";
        bctx.beginPath();
        bctx.roundRect(botX, botY, botW, botH, [12, 12, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#10b981";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        // Kemerli Cam Çatı Panelleri
        bctx.fillStyle = "rgba(56, 189, 248, 0.18)";
        bctx.fillRect(botX + 8, botY + 6, botW - 16, 26);
        bctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        bctx.lineWidth = 1;
        for (let gx = botX + 28; gx < botX + botW - 16; gx += 32) {
            bctx.beginPath(); bctx.moveTo(gx, botY + 6); bctx.lineTo(gx, botY + 32); bctx.stroke();
        }

        // Yeşil-Beyaz Çizgili Tente
        for (let i = 0; i < 7; i++) {
            bctx.fillStyle = i % 2 === 0 ? "#16a34a" : "#f8fafc";
            bctx.fillRect(botX + 6 + i * 26.8, botY + 32, 26.8, 12);
        }
        bctx.strokeStyle = "#15803d";
        bctx.strokeRect(botX + 6, botY + 32, botW - 12, 12);

        // Neon Botanik Tabelası
        bctx.fillStyle = "#34d399";
        bctx.font = "900 11px sans-serif";
        bctx.textAlign = "center";
        bctx.shadowColor = "#10b981";
        bctx.shadowBlur = 6;
        bctx.fillText("🌿 BOTANİK & ÇİÇEKÇİ", botX + botW / 2, botY + 24);
        bctx.shadowBlur = 0;

        // Giriş Cam Kapısı (x: 270..330, y: 48..110)
        const botDoorX = botX + 70, botDoorY = botY + 46, botDoorW = 60, botDoorH = 52;
        bctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        bctx.fillRect(botDoorX, botDoorY, botDoorW, botDoorH);
        bctx.strokeStyle = "#22c55e";
        bctx.lineWidth = 2;
        bctx.strokeRect(botDoorX, botDoorY, botDoorW, botDoorH);

        // Çiçek Vitrini & Sarmaşıklar
        bctx.fillStyle = "#facc15";
        bctx.font = "13px sans-serif";
        bctx.fillText("🌹 🌼 🌸", botX + 38, botY + 74);
        bctx.fillText("🌱 🪴 🌾", botX + botW - 38, botY + 74);

        // Kapı Üstü Giriş Butonu
        bctx.fillStyle = "#22c55e";
        bctx.beginPath();
        bctx.roundRect(botDoorX + 6, botDoorY + 32, botDoorW - 12, 14, 4);
        bctx.fill();
        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 8px sans-serif";
        bctx.fillText("GİRİŞ YAP", botDoorX + botDoorW / 2, botDoorY + 42);

        // Kapı Önü Saksı Çiçekleri
        bctx.fillStyle = "#78350f";
        bctx.fillRect(botDoorX - 16, botDoorY + 28, 12, 18);
        bctx.fillRect(botDoorX + botDoorW + 4, botDoorY + 28, 12, 18);
        bctx.fillStyle = "#ef4444";
        bctx.beginPath(); bctx.arc(botDoorX - 10, botDoorY + 24, 6, 0, Math.PI * 2); bctx.fill();
        bctx.fillStyle = "#ec4899";
        bctx.beginPath(); bctx.arc(botDoorX + botDoorW + 10, botDoorY + 24, 6, 0, Math.PI * 2); bctx.fill();

        // =====================================================================
        // 7. SAĞ CEPHEDEKİ BİNA: 🎭 ATATÜRK KÜLTÜR & SANAT MERKEZİ (AKM)
        // =====================================================================
        const kmX = 620, kmY = 10, kmW = 365, kmH = 100;

        // Neoklasik Mermer ve Granit Gövde
        const kmGrad = bctx.createLinearGradient(kmX, kmY, kmX, kmY + kmH);
        kmGrad.addColorStop(0, isNight ? "#1e1b4b" : "#312e81");
        kmGrad.addColorStop(0.5, isNight ? "#0f172a" : "#1e293b");
        kmGrad.addColorStop(1, isNight ? "#020617" : "#0f172a");
        bctx.fillStyle = kmGrad;
        bctx.beginPath();
        bctx.roundRect(kmX, kmY, kmW, kmH, [12, 12, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#e2e8f0";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Çatı Alınlığı (Pediment / Arşitrav) & Altın Bordür
        bctx.fillStyle = "#f8fafc";
        bctx.fillRect(kmX + 10, kmY + 6, kmW - 20, 18);
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(kmX + 10, kmY + 6, kmW - 20, 18);

        // Kültür Merkezi Tabela Yazısı
        bctx.fillStyle = "#1e1b4b";
        bctx.font = "900 12px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🎭 K Ü L T Ü R   M E R K E Z İ", kmX + kmW / 2, kmY + 19);

        // Alt Bant: Slogan / Alt Başlık
        bctx.fillStyle = "#fbbf24";
        bctx.font = "bold 7.5px sans-serif";
        bctx.fillText("STAND-UP • CANLI MÜZİK • TİYATRO • 2.5D SİNEMA", kmX + kmW / 2, kmY + 32);

        // Klasik Sütunlar (Mermer Kolonlar)
        const cols = [kmX + 16, kmX + 128, kmX + 230, kmX + 346];
        cols.forEach(cx => {
            const colGrad = bctx.createLinearGradient(cx, kmY + 34, cx + 12, kmY + 34);
            colGrad.addColorStop(0, "#cbd5e1");
            colGrad.addColorStop(0.5, "#ffffff");
            colGrad.addColorStop(1, "#94a3b8");
            bctx.fillStyle = colGrad;
            bctx.fillRect(cx, kmY + 34, 12, kmH - 34);
            bctx.strokeStyle = "rgba(0,0,0,0.3)";
            bctx.lineWidth = 1;
            bctx.strokeRect(cx, kmY + 34, 12, kmH - 34);
        });

        // 7.1 SOL BÖLÜM: 🎬 İNTERAKTİF AFİŞ & ETKİNLİK PANOSU (BILLBOARD)
        const bbX = kmX + 34, bbY = kmY + 36, bbW = 88, bbH = 60;
        bctx.fillStyle = "#090d16";
        bctx.beginPath();
        bctx.roundRect(bbX, bbY, bbW, bbH, 6);
        bctx.fill();
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 1.8;
        bctx.stroke();

        // Billboard Başlığı
        bctx.fillStyle = "#0284c7";
        bctx.fillRect(bbX, bbY, bbW, 14);
        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 8px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("📢 AFİŞ & ETKİNLİK", bbX + bbW / 2, bbY + 10);

        // Afiş İçeriği (Mini Poster)
        bctx.fillStyle = "#fbbf24";
        bctx.font = "bold 7.5px sans-serif";
        bctx.fillText("🎙️ STAND-UP", bbX + bbW / 2, bbY + 26);
        bctx.fillStyle = "#38bdf8";
        bctx.font = "7px sans-serif";
        bctx.fillText("Canlı Sahne & Şov", bbX + bbW / 2, bbY + 37);
        bctx.fillStyle = "#a855f7";
        bctx.font = "bold 6.5px sans-serif";
        bctx.fillText("TIKLA & İNCELE", bbX + bbW / 2, bbY + 49);

        // 7.2 SAĞ BÖLÜM: 🚪 ANA GİRİŞ KAPISI & ÇİFT KANATLI CAMLI KAPI
        const kmDoorX = kmX + 148, kmDoorY = kmY + 36, kmDoorW = 76, kmDoorH = 64;
        bctx.fillStyle = "#0f172a";
        bctx.beginPath();
        bctx.roundRect(kmDoorX, kmDoorY, kmDoorW, kmDoorH, [8, 8, 0, 0]);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Çift Kanatlı Camlar & Altın Çıtalar
        bctx.fillStyle = "rgba(56, 189, 248, 0.25)";
        bctx.fillRect(kmDoorX + 4, kmDoorY + 6, (kmDoorW - 12) / 2, kmDoorH - 10);
        bctx.fillRect(kmDoorX + (kmDoorW / 2) + 2, kmDoorY + 6, (kmDoorW - 12) / 2, kmDoorH - 10);
        bctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
        bctx.lineWidth = 1;
        bctx.strokeRect(kmDoorX + 4, kmDoorY + 6, (kmDoorW - 12) / 2, kmDoorH - 10);
        bctx.strokeRect(kmDoorX + (kmDoorW / 2) + 2, kmDoorY + 6, (kmDoorW - 12) / 2, kmDoorH - 10);

        // Kapı Kulpları (Pirinç Bar)
        bctx.fillStyle = "#facc15";
        bctx.fillRect(kmDoorX + (kmDoorW / 2) - 4, kmDoorY + 28, 2.5, 14);
        bctx.fillRect(kmDoorX + (kmDoorW / 2) + 1.5, kmDoorY + 28, 2.5, 14);

        // Kapı Üstü Işıklı Tabela
        bctx.fillStyle = "#ef4444";
        bctx.font = "bold 8px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("GİRİŞ", kmDoorX + kmDoorW / 2, kmDoorY - 4);

        // Kırmızı Protokol Halısı (Kapıdan Kaldırıma Uzanan)
        const carpetX = kmDoorX + 8, carpetY = kmDoorY + kmDoorH;
        bctx.fillStyle = "#b91c1c";
        bctx.fillRect(carpetX, carpetY, kmDoorW - 16, 45);
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(carpetX, carpetY, kmDoorW - 16, 45);

        // 7.3 SAĞ KÖŞE: 2.5D SİNEMA VİTRİNİ
        const cineVitX = kmX + 250, cineVitY = kmY + 36, cineVitW = 90, cineVitH = 60;
        bctx.fillStyle = "#1e1b4b";
        bctx.beginPath();
        bctx.roundRect(cineVitX, cineVitY, cineVitW, cineVitH, 6);
        bctx.fill();
        bctx.strokeStyle = "#818cf8";
        bctx.lineWidth = 1.5;
        bctx.stroke();
        bctx.fillStyle = "#e0e7ff";
        bctx.font = "bold 8px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🍿 2.5D SİNEMA", cineVitX + cineVitW / 2, cineVitY + 22);
        bctx.fillStyle = "#94a3b8";
        bctx.font = "7px sans-serif";
        bctx.fillText("Vizyondaki Filmler", cineVitX + cineVitW / 2, cineVitY + 36);
        bctx.fillStyle = "#34d399";
        bctx.font = "bold 7px sans-serif";
        bctx.fillText("Ücretsiz Giriş", cineVitX + cineVitW / 2, cineVitY + 48);

        // =====================================================================
        // 8. ALT PARK & KALDIRIM ALANI (y: 330..625)
        // =====================================================================
        const parkY = 330;
        const parkH = height - parkY;
        bctx.fillStyle = isNight ? "#064e3b" : "#15803d";
        bctx.fillRect(0, parkY, width, parkH);

        // Alt Yürüyüş Yolu (Kaldırım Karoları: y: 330..375)
        bctx.fillStyle = isNight ? "#1f2937" : "#475569";
        bctx.fillRect(0, parkY, width, 45);
        bctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        bctx.lineWidth = 1;
        for (let x = 0; x < width; x += 35) {
            bctx.beginPath(); bctx.moveTo(x, parkY); bctx.lineTo(x, parkY + 45); bctx.stroke();
        }

        // Çim ve Park Detayları (y: 375..625)
        bctx.fillStyle = isNight ? "#064e3b" : "#16a34a";
        bctx.fillRect(0, parkY + 45, width, parkH - 45);

        // Çimlerde Çiçekler
        for (let i = 0; i < 28; i++) {
            let fx = ((i * 127) % (width - 40)) + 20;
            let fy = parkY + 55 + ((i * 73) % (parkH - 75));
            bctx.fillStyle = (i % 2 === 0) ? "#fde047" : "#f472b6";
            bctx.beginPath(); bctx.arc(fx, fy, 2, 0, Math.PI * 2); bctx.fill();
        }

        
        // =====================================================================
        // 8.1 SAĞ ALT KAYA MADENİ MAĞARA GİRİŞİ (mine_cave Portalı)
        // =====================================================================
        const caveX = 890, caveY = 475;
        // Kayalık Dağ Tepeciği & Dış Kaya Kütlesi
        bctx.save();
        bctx.fillStyle = "#1e293b";
        bctx.beginPath();
        bctx.moveTo(caveX - 85, caveY + 80);
        bctx.lineTo(caveX - 70, caveY - 10);
        bctx.lineTo(caveX - 30, caveY - 55);
        bctx.lineTo(caveX + 35, caveY - 60);
        bctx.lineTo(caveX + 80, caveY - 15);
        bctx.lineTo(caveX + 95, caveY + 80);
        bctx.closePath();
        bctx.fill();
        bctx.strokeStyle = "#0f172a";
        bctx.lineWidth = 3;
        bctx.stroke();

        // Kaya Yüzey Fasetleri ve Gölgeleri
        bctx.fillStyle = "#334155";
        bctx.beginPath();
        bctx.moveTo(caveX - 70, caveY - 10);
        bctx.lineTo(caveX - 30, caveY - 55);
        bctx.lineTo(caveX - 10, caveY - 20);
        bctx.lineTo(caveX - 50, caveY + 20);
        bctx.closePath();
        bctx.fill();

        bctx.fillStyle = "#475569";
        bctx.beginPath();
        bctx.moveTo(caveX + 35, caveY - 60);
        bctx.lineTo(caveX + 80, caveY - 15);
        bctx.lineTo(caveX + 45, caveY + 10);
        bctx.lineTo(caveX + 10, caveY - 30);
        bctx.closePath();
        bctx.fill();

        // Mağara Giriş Boşluğu (Karanlık İç Kısım)
        const caveMouth = bctx.createRadialGradient(caveX, caveY + 40, 5, caveX, caveY + 40, 50);
        caveMouth.addColorStop(0, "#000000");
        caveMouth.addColorStop(0.7, "#030712");
        caveMouth.addColorStop(1, "#0f172a");
        bctx.fillStyle = caveMouth;
        bctx.beginPath();
        bctx.arc(caveX, caveY + 35, 42, Math.PI, 0, false);
        bctx.lineTo(caveX + 42, caveY + 80);
        bctx.lineTo(caveX - 42, caveY + 80);
        bctx.closePath();
        bctx.fill();

        // Ahşap Maden Destek Kirişleri (Timber Framing)
        bctx.fillStyle = "#78350f";
        bctx.strokeStyle = "#451a03";
        bctx.lineWidth = 2;
        // Sol Dikme
        bctx.fillRect(caveX - 46, caveY - 5, 12, 85);
        bctx.strokeRect(caveX - 46, caveY - 5, 12, 85);
        // Sağ Dikme
        bctx.fillRect(caveX + 34, caveY - 5, 12, 85);
        bctx.strokeRect(caveX + 34, caveY - 5, 12, 85);
        // Üst Yatay Kiriş
        bctx.fillRect(caveX - 52, caveY - 18, 104, 15);
        bctx.strokeRect(caveX - 52, caveY - 18, 104, 15);

        // Kiriş Demir Perçinleri
        bctx.fillStyle = "#94a3b8";
        bctx.beginPath(); bctx.arc(caveX - 40, caveY - 10, 2, 0, Math.PI * 2); bctx.fill();
        bctx.beginPath(); bctx.arc(caveX + 40, caveY - 10, 2, 0, Math.PI * 2); bctx.fill();

        // Kristal & Parıldayan Cevher Damarları (Kaya Üzerinde)
        bctx.fillStyle = "#38bdf8";
        bctx.shadowColor = "#38bdf8";
        bctx.shadowBlur = 8;
        bctx.beginPath();
        bctx.moveTo(caveX - 60, caveY + 30);
        bctx.lineTo(caveX - 52, caveY + 25);
        bctx.lineTo(caveX - 48, caveY + 35);
        bctx.closePath();
        bctx.fill();

        bctx.fillStyle = "#facc15";
        bctx.shadowColor = "#facc15";
        bctx.beginPath();
        bctx.moveTo(caveX + 55, caveY + 20);
        bctx.lineTo(caveX + 63, caveY + 28);
        bctx.lineTo(caveX + 50, caveY + 35);
        bctx.closePath();
        bctx.fill();
        bctx.shadowBlur = 0;

        // Mağara Tabelası: ⛏️ KAYA MADENİ
        bctx.fillStyle = "#451a03";
        bctx.beginPath();
        bctx.roundRect(caveX - 50, caveY - 45, 100, 22, 5);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        bctx.fillStyle = "#fef08a";
        bctx.font = "bold 9px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("⛏️ KAYA MADENİ", caveX, caveY - 30);

        // Giriş Halısı / Taş Yol
        bctx.fillStyle = "#334155";
        bctx.beginPath();
        bctx.ellipse(caveX, caveY + 78, 36, 8, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.restore();

        // =====================================================================
        // 9. YÖN VE GEÇİŞ LEVHALARI (TÜRKİYE KARAYOLLARI STANDARDI)
        // =====================================================================
        // Sol Çıkış: ⬅ 1. CADDE & MEYDAN
        if (typeof drawSingleTurkishSign === 'function') {
            drawSingleTurkishSign(bctx, 16, 175, "1. CADDE", "left", 235);
        }

        // Sağ Çıkış: DOĞU BULVARI GEÇİCİ OLARAK KAPALI (Trafik Dubaları & Karayolları Kapalı Yol Levhası)
        drawEastRoadClosure(bctx, width, height);

        // Sokak Lambaları & Dinlenme Bankları
        if (typeof drawLampPost === 'function') {
            drawLampPost(bctx, 200, 220);
            drawLampPost(bctx, 800, 220);
            drawLampPost(bctx, 390, 70);
            drawLampPost(bctx, 610, 70);
        }
        if (typeof drawBench === 'function') {
            drawBench(bctx, 280, 225);
            drawBench(bctx, 700, 225);
        }
    }

    /**
     * Kuzey Bulvarı İnşaat & Yol Barikatı (1000x625 Standartlarında 2.5D İzometrik Barikat)
     * Kuzey yolunun (x: 410..590, y: 0..155) girişine kurulmuş çift kademeli ağır şantiye barikatı,
     * reflektörlü "⛔ GİRİLMEZ / YOL ÇALIŞMASI" levhası, flaşörler ve trafik dubaları.
     */
    function drawNorthRoadBarricade(bctx) {
        const barX = 412;
        const barW = 176;

        bctx.save();

        // 1. Zemin Gölgesi (Asfalt üstü kontakt gölgesi)
        bctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        bctx.beginPath();
        bctx.ellipse(500, 154, 88, 7, 0, 0, Math.PI * 2);
        bctx.fill();

        // 2. Ağır Beton Kaideler / Balast Blokları (Jersey Stili 3 Destek Ayağı)
        const bases = [422, 500, 578];
        bases.forEach(bx => {
            // Beton gölge
            bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
            bctx.beginPath();
            bctx.ellipse(bx, 154, 20, 5.5, 0, 0, Math.PI * 2);
            bctx.fill();

            // Beton gövde (Trapezoid)
            bctx.fillStyle = "#334155";
            bctx.beginPath();
            bctx.moveTo(bx - 16, 154);
            bctx.lineTo(bx - 12, 142);
            bctx.lineTo(bx + 12, 142);
            bctx.lineTo(bx + 16, 154);
            bctx.closePath();
            bctx.fill();

            // Beton üst yüzey aydınlığı
            bctx.fillStyle = "#64748b";
            bctx.fillRect(bx - 12, 142, 24, 2.5);

            // Beton sol kenar aydınlığı
            bctx.fillStyle = "#475569";
            bctx.beginPath();
            bctx.moveTo(bx - 16, 154);
            bctx.lineTo(bx - 12, 142);
            bctx.lineTo(bx - 4, 142);
            bctx.lineTo(bx - 6, 154);
            bctx.closePath();
            bctx.fill();

            // Siyah-sarı emniyet çizgileri (Beton kaidede)
            bctx.fillStyle = "#eab308";
            bctx.fillRect(bx - 3, 145, 6, 6);
            bctx.fillStyle = "#0f172a";
            bctx.fillRect(bx + 5, 145, 4, 6);
        });

        // 3. Ağır Çelik Dikey Direkler (Galvanizli Çelik Direkler & A-Frame)
        bases.forEach(bx => {
            // Ana dikey kiriş (y: 96..144)
            bctx.fillStyle = "#1e293b";
            bctx.fillRect(bx - 3.5, 96, 7, 48);
            bctx.fillStyle = "#475569";
            bctx.fillRect(bx - 2, 96, 4, 48);

            // A-Frame Çapraz Destek Kolları (Struts)
            bctx.strokeStyle = "#334155";
            bctx.lineWidth = 2.5;
            bctx.beginPath();
            bctx.moveTo(bx - 12, 148);
            bctx.lineTo(bx, 120);
            bctx.lineTo(bx + 12, 148);
            bctx.stroke();

            // Çelik civatalar / perçinler
            bctx.fillStyle = "#cbd5e1";
            [104, 118, 136].forEach(cy => {
                bctx.beginPath();
                bctx.arc(bx, cy, 1.6, 0, Math.PI * 2);
                bctx.fill();
            });
        });

        // 4. ÇİFT KADEMELİ REFLEKTÖRLÜ İKAZ KİRİŞLERİ (Karayolları Kırmızı-Beyaz Emniyet Kirişleri)
        const boards = [
            { y: 108, h: 14 }, // Üst Kiriş
            { y: 126, h: 14 }  // Alt Kiriş
        ];

        boards.forEach(brd => {
            // Kiriş arkası / derinlik gölgesi
            bctx.fillStyle = "#0f172a";
            bctx.fillRect(barX - 1, brd.y + 1, barW + 2, brd.h + 1);

            // Kiriş ana paneli (Beyaz reflektör taban)
            bctx.save();
            bctx.beginPath();
            bctx.rect(barX, brd.y, barW, brd.h);
            bctx.clip();

            bctx.fillStyle = "#f8fafc";
            bctx.fillRect(barX, brd.y, barW, brd.h);

            // 45 Derece Kırmızı Şeritler (///)
            bctx.fillStyle = "#dc2626";
            const stripeWidth = 14;
            const stripeSpacing = 26;
            for (let sx = barX - brd.h * 1.5; sx < barX + barW + brd.h * 1.5; sx += stripeSpacing) {
                bctx.beginPath();
                bctx.moveTo(sx, brd.y);
                bctx.lineTo(sx + stripeWidth, brd.y);
                bctx.lineTo(sx + stripeWidth - brd.h, brd.y + brd.h);
                bctx.lineTo(sx - brd.h, brd.y + brd.h);
                bctx.closePath();
                bctx.fill();
            }

            // Üst ve alt metalik bordür / çerçeve
            bctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            bctx.fillRect(barX, brd.y + brd.h - 2, barW, 2);
            bctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            bctx.fillRect(barX, brd.y, barW, 1.5);
            bctx.restore();

            // Dış sınır çizgisi
            bctx.strokeStyle = "#7f1d1d";
            bctx.lineWidth = 1;
            bctx.strokeRect(barX, brd.y, barW, brd.h);

            // Uç emniyet takozları
            bctx.fillStyle = "#1e293b";
            bctx.fillRect(barX - 2, brd.y - 1, 4, brd.h + 2);
            bctx.fillRect(barX + barW - 2, brd.y - 1, 4, brd.h + 2);
        });

        // 5. MERKEZİ LEVHA 1: ⛔ GİRİLMEZ (NO ENTRY) KARAYOLLARI LEVHASI (x: 500, y: 94)
        const signCx = 500;
        const signCy = 94;
        const signR = 14;

        // Levha montaj direği
        bctx.fillStyle = "#334155";
        bctx.fillRect(signCx - 2, signCy + signR, 4, 16);

        // Levha gölgesi
        bctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        bctx.beginPath();
        bctx.arc(signCx + 1.5, signCy + 1.5, signR, 0, Math.PI * 2);
        bctx.fill();

        // Levha Dış Beyaz Reflektör Halkası
        bctx.fillStyle = "#ffffff";
        bctx.beginPath();
        bctx.arc(signCx, signCy, signR, 0, Math.PI * 2);
        bctx.fill();

        // Levha İç Kırmızı Disk
        bctx.fillStyle = "#dc2626";
        bctx.beginPath();
        bctx.arc(signCx, signCy, signR - 1.8, 0, Math.PI * 2);
        bctx.fill();

        // Beyaz Yatay Bar
        bctx.fillStyle = "#ffffff";
        bctx.beginPath();
        bctx.roundRect(signCx - 9, signCy - 2.5, 18, 5, 1.2);
        bctx.fill();

        // 6. MERKEZİ LEVHA 2: 🚧 YOL YAPIM ÇALIŞMASI BİLGİ PLAKASI (x: 444..556, y: 113)
        const plateX = 444;
        const plateY = 113;
        const plateW = 112;
        const plateH = 24;

        // Plaka gölgesi
        bctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        bctx.beginPath();
        bctx.roundRect(plateX + 1.5, plateY + 1.5, plateW, plateH, 4);
        bctx.fill();

        // Sarı reflektör gövde (Diamond Grade Yellow)
        bctx.fillStyle = "#facc15";
        bctx.beginPath();
        bctx.roundRect(plateX, plateY, plateW, plateH, 4);
        bctx.fill();
        bctx.strokeStyle = "#1e293b";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        // İç siyah ince çerçeve
        bctx.strokeStyle = "#000000";
        bctx.lineWidth = 0.8;
        bctx.strokeRect(plateX + 2, plateY + 2, plateW - 4, plateH - 4);

        // Levha Yazıları
        bctx.fillStyle = "#0f172a";
        bctx.font = "900 8.5px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🚧 YOL ÇALIŞMASI 🚧", 500, plateY + 10.5);

        bctx.fillStyle = "#78350f";
        bctx.font = "bold 6.8px sans-serif";
        bctx.fillText("GEÇİCİ OLARAK KAPALIDIR", 500, plateY + 19);

        // Plaka köşe montaj vidaları
        bctx.fillStyle = "#475569";
        [[plateX + 4, plateY + 4], [plateX + plateW - 4, plateY + 4],
         [plateX + 4, plateY + plateH - 4], [plateX + plateW - 4, plateY + plateH - 4]].forEach(([vx, vy]) => {
            bctx.beginPath(); bctx.arc(vx, vy, 1, 0, Math.PI * 2); bctx.fill();
        });

        // 7. FLAŞÖRLÜ TEPE İKAZ LAMBALARI (Kaideleri ve Lensleri)
        const lamps = [
            { x: 422, y: 92 },
            { x: 500, y: 74 },
            { x: 578, y: 92 }
        ];

        lamps.forEach(lmp => {
            // Montaj braketi (Siyah metal kovan)
            bctx.fillStyle = "#1e293b";
            bctx.fillRect(lmp.x - 3.5, lmp.y + 4, 7, 5);

            // Sarı/Turuncu ikaz lambası gövdesi
            bctx.fillStyle = "#f59e0b";
            bctx.beginPath();
            bctx.roundRect(lmp.x - 4.5, lmp.y - 4, 9, 8, 2);
            bctx.fill();
            bctx.strokeStyle = "#b45309";
            bctx.lineWidth = 1;
            bctx.stroke();

            // Lamba tepe kubbesi (Amber Lens)
            bctx.fillStyle = "#fef08a";
            bctx.beginPath();
            bctx.arc(lmp.x, lmp.y - 3, 3, Math.PI, 0, false);
            bctx.fill();
        });

        // 8. TRAFİK GÜVENLİK DUBALARI (2.5D Reflektörlü Koniler)
        const cones = [
            { x: 418, y: 153, scale: 0.95 },
            { x: 462, y: 156, scale: 1.0 },
            { x: 538, y: 156, scale: 1.0 },
            { x: 582, y: 153, scale: 0.95 }
        ];

        cones.forEach(c => {
            drawTrafficCone(bctx, c.x, c.y, c.scale);
        });

        bctx.restore();
    }

    /**
     * 2.5D Reflektörlü Trafik Konisi / Dubası
     */
    function drawTrafficCone(ctx, x, y, scale = 1.0) {
        ctx.save();
        const baseW = 14 * scale;
        const baseH = 5 * scale;
        const coneH = 18 * scale;

        // Taban Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(x, y + baseH / 2, baseW * 0.7, baseH * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Kauçuk Siyah Taban (Sekizgen/Dikdörtgen Taban)
        ctx.fillStyle = "#111827";
        ctx.beginPath();
        ctx.roundRect(x - baseW / 2, y - baseH / 2, baseW, baseH, 1.5);
        ctx.fill();
        ctx.strokeStyle = "#374151";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Turuncu Koni Gövdesi
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.moveTo(x - baseW * 0.38, y);
        ctx.lineTo(x - 2 * scale, y - coneH);
        ctx.lineTo(x + 2 * scale, y - coneH);
        ctx.lineTo(x + baseW * 0.38, y);
        ctx.closePath();
        ctx.fill();

        // Koni Beyaz Reflektör Kuşağı
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.moveTo(x - baseW * 0.26, y - coneH * 0.35);
        ctx.lineTo(x - baseW * 0.15, y - coneH * 0.65);
        ctx.lineTo(x + baseW * 0.15, y - coneH * 0.65);
        ctx.lineTo(x + baseW * 0.26, y - coneH * 0.35);
        ctx.closePath();
        ctx.fill();

        // Tepe Tutma Deliği
        ctx.fillStyle = "#c2410c";
        ctx.beginPath();
        ctx.arc(x, y - coneH + 1, 1.5 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    /**
     * Cadde 2 Doğu / Sağ Çıkış Kapanma Görseli
     * Sağa gidiş geçici olarak durdurulduğundan dolayı sınırda trafik dubaları ve Karayolları "YOL KAPALI" levhası
     */
    function drawEastRoadClosure(bctx, width, height) {
        // Karayolları Kapalı Yol Levhası (Direkli)
        if (typeof drawSingleTurkishSign === 'function') {
            drawSingleTurkishSign(bctx, width - 110, 175, "YOL KAPALI", "right", 235);
        }

        // Sağ Ekran Sınırında Sıralı Ağır Trafik Güvenlik Dubaları & Emniyet Şeridi
        const rightX = width - 16;
        const coneYs = [165, 210, 255, 300];

        // Emniyet Şeridi (Kırmızı-Beyaz Barikat Şeridi)
        bctx.save();
        bctx.strokeStyle = "rgba(220, 38, 38, 0.75)";
        bctx.lineWidth = 3;
        bctx.setLineDash([8, 6]);
        bctx.beginPath();
        bctx.moveTo(rightX, coneYs[0] - 12);
        bctx.lineTo(rightX, coneYs[coneYs.length - 1] - 5);
        bctx.stroke();
        bctx.setLineDash([]);
        bctx.restore();

        // Dubaları çiz
        coneYs.forEach(cy => {
            drawTrafficCone(bctx, rightX, cy, 0.95);
        });
    }

    /**
     * Dinamik Cadde 2 Çevre Çizimi (60 FPS, Hover ve Işık Efektleri)
     */
    function drawCadde2Environment() {
        let bg = bgCache.getCanvas('cadde2', canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0);

        const now = Date.now();

        // 1. VIP Club Neon Nabız / Titreşim Işıltısı (Sol Üst Köşe)
        const flicker = (Math.sin(now / 150) * 0.15 + Math.cos(now / 80) * 0.05);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.12 + Math.max(0, flicker)})`;
        ctx.fillRect(20, 12, 155, 42);

        // 2. Buhar Mazgalı Duman Efekti (Kuzey yol kenarı mazgalından tüten gizemli buhar)
        for (let i = 0; i < 3; i++) {
            let offset = ((now / 600) + i * 1.5) % 4.5;
            let alpha = Math.max(0, 1 - (offset / 4.5));
            let sY = 142 - offset * 12;
            let sX = 424 + Math.sin(offset * 2 + i) * 5;
            let r = 4 + offset * 3;
            ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.22})`;
            ctx.beginPath();
            ctx.arc(sX, sY, r, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2.2 Flaşörlü İkaz Lambaları (Kuzey Barikatı) Dinamik Işıltı Efekti
        const beaconPulse = Math.sin(now / 160);
        if (beaconPulse > 0.05) {
            const glowAlpha = Math.max(0, beaconPulse) * 0.55;
            const lamps = [
                { x: 422, y: 92 },
                { x: 500, y: 74 },
                { x: 578, y: 92 }
            ];
            lamps.forEach(lmp => {
                const radGrad = ctx.createRadialGradient(lmp.x, lmp.y, 2, lmp.x, lmp.y, 18);
                radGrad.addColorStop(0, `rgba(254, 240, 138, ${glowAlpha})`);
                radGrad.addColorStop(0.5, `rgba(245, 158, 11, ${glowAlpha * 0.6})`);
                radGrad.addColorStop(1, "rgba(245, 158, 11, 0)");
                ctx.fillStyle = radGrad;
                ctx.beginPath();
                ctx.arc(lmp.x, lmp.y, 18, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // 2.5 SEMİHUS AYDINUS (İSG ŞEFİ & BARET / YELEK DENETİM NOKTASI)
        if (typeof drawSemihusAydinusNpc === 'function') {
            const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) ? players[myId] : (typeof myAvatar !== 'undefined' ? myAvatar : null);
            drawSemihusAydinusNpc(ctx, now, myP, canvasMouseX, canvasMouseY);
        }

        // 3. Hover Etkileşim Bölgeleri
        const isVipClubHover = (canvasMouseX >= 20 && canvasMouseX <= 175 && canvasMouseY >= 20 && canvasMouseY <= 118);
        const isKmDoorHover = (canvasMouseX >= 760 && canvasMouseX <= 850 && canvasMouseY >= 35 && canvasMouseY <= 150);
        const isBillboardHover = (canvasMouseX >= 650 && canvasMouseX <= 745 && canvasMouseY >= 35 && canvasMouseY <= 110);
        const isNorthBarricadeHover = (canvasMouseX >= 405 && canvasMouseX <= 595 && canvasMouseY >= 70 && canvasMouseY <= 165);
        const isLeftExitHover = (canvasMouseX <= 50 && canvasMouseY >= 140 && canvasMouseY <= 330);
        const isRightExitHover = (canvasMouseX >= canvas.width - 65 && canvasMouseY >= 140 && canvasMouseY <= 330);
        const isSemihusHover = (canvasMouseX >= 705 && canvasMouseX <= 805 && canvasMouseY >= 390 && canvasMouseY <= 485) || (Math.hypot(canvasMouseX - 735, canvasMouseY - 460) < 48);

        if (isVipClubHover) {
            hoveredTableId = 'cadde2_vip_club';
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🚪 VİP CLUB (Seviye 2+ Giriş - Tıkla & Gir)", 98, 28);
            setGameCursor('pointer');
        } else if (isKmDoorHover) {
            hoveredTableId = 'cadde2_kultur_merkezi';
            ctx.fillStyle = "#fde047";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎭 KÜLTÜR MERKEZİ (Fuaye & Sanat Sahnesi)", 805, 30);
            setGameCursor('pointer');
        } else if (isBillboardHover) {
            hoveredTableId = 'cadde2_billboard';
            ctx.fillStyle = "#bae6fd";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("📢 ETKİNLİK TAKVİMİ & AFİŞLER", 700, 32);
            setGameCursor('pointer');
        } else if (isNorthBarricadeHover) {
            hoveredTableId = 'cadde2_north_barricade';
            const label = "🚧 YOL ÇALIŞMASI (Kuzey Bulvarı Geçici Olarak Kapalı)";
            ctx.font = "bold 11px sans-serif";
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.beginPath();
            ctx.roundRect(500 - tw / 2 - 8, 48, tw + 16, 20, 6);
            ctx.fill();
            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = "#fde047";
            ctx.textAlign = "center";
            ctx.fillText(label, 500, 62);
            setGameCursor('not-allowed');
        } else if (isLeftExitHover) {
            hoveredTableId = 'cadde2_to_cadde1';
            setGameCursor('pointer');
        } else if (isRightExitHover) {
            hoveredTableId = 'cadde2_to_east';
            const label = "🚧 GEÇİCİ OLARAK KAPALI";
            ctx.font = "bold 11px sans-serif";
            const tw = ctx.measureText(label).width;
            ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
            ctx.beginPath();
            ctx.roundRect(canvas.width - 15 - tw - 12, 146, tw + 14, 20, 6);
            ctx.fill();
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = "#f87171";
            ctx.textAlign = "right";
            ctx.fillText(label, canvas.width - 20, 160);
            setGameCursor('not-allowed');
        } else if (isSemihusHover) {
            hoveredTableId = 'semihus_aydinus_npc';
            setGameCursor('pointer');
        } else {
            if (hoveredTableId === 'cadde2_vip_club' || hoveredTableId === 'cadde2_kultur_merkezi' || hoveredTableId === 'cadde2_billboard' || hoveredTableId === 'cadde2_north_barricade' || hoveredTableId === 'cadde2_to_cadde1' || hoveredTableId === 'cadde2_to_east' || hoveredTableId === 'semihus_aydinus_npc') {
                hoveredTableId = null;
            }
            setGameCursor('default');
        }
    }

    // Global Dışa Aktarımlar
    window.renderStaticCadde2To = renderStaticCadde2To;
    window.drawCadde2Environment = drawCadde2Environment;
})();

