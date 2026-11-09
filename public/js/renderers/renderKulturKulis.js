// public/js/renderers/renderKulturKulis.js - VIP Kulis & Sanatçı Odası (Backstage)
// Aynalı Makyaj Masaları, Hollywood Ampulleri, Deri Koltuklar & Sahneye Gizli Geçiş Kapısı

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    /**
     * Statik Kulis Arka Planı (bgCache uyumlu)
     */
    function renderStaticKulturKulisTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. ZEMİN: Sıcak Meşe Ağacı Balıksırtı Parke (Herringbone Parquet)
        bctx.fillStyle = "#291b12";
        bctx.fillRect(0, 140, width, height - 140);
        bctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
        bctx.lineWidth = 1;
        for (let y = 140; y < height; y += 30) {
            bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(width, y); bctx.stroke();
        }

        // Bordo Peluş VIP Halı (Odanın Ortasında)
        bctx.fillStyle = "#831843";
        bctx.beginPath();
        bctx.roundRect(250, 220, 500, 240, 16);
        bctx.fill();
        bctx.strokeStyle = "#f472b6";
        bctx.lineWidth = 2;
        bctx.stroke();

        // 2. ARKA DUVAR: Koyu Bordo / Mor Kapitoneli Kadife Duvar (y: 0..140)
        const wallGrad = bctx.createLinearGradient(0, 0, 0, 140);
        wallGrad.addColorStop(0, "#2e1065");
        wallGrad.addColorStop(0.7, "#4c0519");
        wallGrad.addColorStop(1, "#1c1917");
        bctx.fillStyle = wallGrad;
        bctx.fillRect(0, 0, width, 140);

        bctx.fillStyle = "#fde047";
        bctx.font = "900 13px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("💄 SANATÇI VIP KULİS ODASI (BACKSTAGE)", width / 2, 22);

        // =====================================================================
        // 3. HOLLYWOOD AMPULLÜ AYNALI MAKYAJ MASALARI (3 ADET)
        // =====================================================================
        const vanities = [
            { x: 120, y: 40, w: 140, h: 90 },
            { x: 430, y: 40, w: 140, h: 90 },
            { x: 740, y: 40, w: 140, h: 90 }
        ];

        vanities.forEach((v, idx) => {
            // Ayna Camı
            bctx.fillStyle = "#f8fafc";
            bctx.beginPath();
            bctx.roundRect(v.x, v.y, v.w, v.h - 15, 8);
            bctx.fill();
            bctx.strokeStyle = "#facc15";
            bctx.lineWidth = 2;
            bctx.stroke();

            // Ayna Yansıması
            bctx.fillStyle = "rgba(224, 231, 255, 0.6)";
            bctx.fillRect(v.x + 6, v.y + 6, v.w - 12, v.h - 26);

            // Hollywood Ampulleri (Aynanın Etrafında)
            bctx.fillStyle = "#fef08a";
            for (let bx = v.x + 10; bx <= v.x + v.w - 10; bx += 24) {
                bctx.beginPath(); bctx.arc(bx, v.y + 3, 3.5, 0, Math.PI * 2); bctx.fill();
            }
            for (let by = v.y + 12; by <= v.y + v.h - 20; by += 20) {
                bctx.beginPath(); bctx.arc(v.x + 3, by, 3.5, 0, Math.PI * 2); bctx.fill();
                bctx.beginPath(); bctx.arc(v.x + v.w - 3, by, 3.5, 0, Math.PI * 2); bctx.fill();
            }

            // Makyaj Masası Tezgahı
            bctx.fillStyle = "#1e293b";
            bctx.fillRect(v.x - 10, v.y + v.h - 15, v.w + 20, 20);
            bctx.strokeStyle = "#d97706";
            bctx.strokeRect(v.x - 10, v.y + v.h - 15, v.w + 20, 20);

            // Tabure
            bctx.fillStyle = "#ec4899";
            bctx.beginPath(); bctx.ellipse(v.x + v.w / 2, v.y + v.h + 20, 16, 8, 0, 0, Math.PI * 2); bctx.fill();
        });

        // =====================================================================
        // 4. KIYAFET ASKILIKLARI & KOSTÜM STANDI (SOL KÖŞE)
        // =====================================================================
        const kX = 40, kY = 240, kW = 70, kH = 120;
        bctx.fillStyle = "#64748b";
        bctx.fillRect(kX + 4, kY, 4, kH);
        bctx.fillRect(kX + kW - 8, kY, 4, kH);
        bctx.fillRect(kX, kY + 10, kW, 4);
        bctx.fillStyle = "#a855f7";
        bctx.fillRect(kX + 12, kY + 16, 12, 45); // Kostüm 1
        bctx.fillStyle = "#f59e0b";
        bctx.fillRect(kX + 28, kY + 16, 12, 48); // Kostüm 2
        bctx.fillStyle = "#ef4444";
        bctx.fillRect(kX + 44, kY + 16, 12, 42); // Kostüm 3

        // =====================================================================
        // 5. CHESTERFIELD DERİ KANEPE & İKRAM SEHPASI (ORTA SAĞ)
        // =====================================================================
        const cX = 350, cY = 260, cW = 300, cH = 75;
        bctx.fillStyle = "#450a0a";
        bctx.beginPath();
        bctx.roundRect(cX, cY, cW, cH, 12);
        bctx.fill();
        bctx.strokeStyle = "#b91c1c";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Düğme Dikişleri
        bctx.fillStyle = "#facc15";
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 6; col++) {
                bctx.beginPath();
                bctx.arc(cX + 30 + col * 48, cY + 22 + row * 28, 2, 0, Math.PI * 2);
                bctx.fill();
            }
        }

        // İkram Sehpası & Şampanya Kovası
        const sX = 450, sY = 360, sW = 100, sH = 45;
        bctx.fillStyle = "#78350f";
        bctx.beginPath(); bctx.roundRect(sX, sY, sW, sH, 8); bctx.fill();
        bctx.strokeStyle = "#f59e0b"; bctx.stroke();

        bctx.fillStyle = "#cbd5e1";
        bctx.font = "16px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🍾 🥂 🍇", sX + sW / 2, sY + 28);

        // =====================================================================
        // 6. SAĞDA GİZLİ SAHNE GEÇİŞ KAPISI (x: 880..960, y: 190..290)
        // =====================================================================
        const doorX = 890, doorY = 190, doorW = 75, doorH = 100;
        bctx.fillStyle = "#7f1d1d";
        bctx.beginPath();
        bctx.roundRect(doorX, doorY, doorW, doorH, [10, 0, 0, 10]);
        bctx.fill();
        bctx.strokeStyle = "#fbbf24";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        bctx.fillStyle = "#fef08a";
        bctx.font = "bold 9px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🎭 SAHNEYE", doorX + doorW / 2, doorY + 20);
        bctx.fillStyle = "#fed7aa";
        bctx.font = "bold 7px sans-serif";
        bctx.fillText("Çıkış Kapısı", doorX + doorW / 2, doorY + 45);

        // =====================================================================
        // 7. ALT ÇIKIŞ KAPISI: 🚪 FUAYE / LOBİYE ÇIKIŞ
        // =====================================================================
        const exitX = width / 2 - 50, exitY = height - 35, exitW = 100, exitH = 35;
        bctx.fillStyle = "#1e293b";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.strokeStyle = "#a855f7";
        bctx.lineWidth = 2;
        bctx.strokeRect(exitX, exitY, exitW, exitH);

        bctx.fillStyle = "#f3e8ff";
        bctx.font = "bold 10px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("⬇ ÇIKIŞ (FUAYE)", width / 2, height - 12);
    }

    /**
     * Dinamik Kulis Çevre Çizimi (60 FPS Hover)
     */
    function drawKulturKulisEnvironment() {
        let bg = bgCache.getCanvas('kultur_merkezi_kulis', canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0);

        const isSahneDoorHover = (canvasMouseX >= 880 && canvasMouseX <= 970 && canvasMouseY >= 180 && canvasMouseY <= 300);
        const isExitHover = (canvasMouseX >= canvas.width / 2 - 60 && canvasMouseX <= canvas.width / 2 + 60 && canvasMouseY >= canvas.height - 50);

        if (isSahneDoorHover) {
            hoveredTableId = 'kulis_to_sahne';
            ctx.strokeStyle = "#fbbf24";
            ctx.lineWidth = 3;
            ctx.strokeRect(886, 186, 82, 108);
            ctx.fillStyle = "#fde047";
            ctx.font = "bold 12px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("🎭 DOĞRUDAN SAHNEYE ÇIK", 925, 175);
            setGameCursor('pointer');
        } else if (isExitHover) {
            hoveredTableId = 'kulis_exit_lobi';
            setGameCursor('pointer');
        } else {
            if (hoveredTableId && hoveredTableId.startsWith('kulis_')) {
                hoveredTableId = null;
            }
            setGameCursor('default');
        }
    }

    window.renderStaticKulturKulisTo = renderStaticKulturKulisTo;
    window.drawKulturKulisEnvironment = drawKulturKulisEnvironment;
})();

