// public/js/renderers/renderKulturSinema.js - 2.5D Sinema Salonu (Grand Cinema)
// Basamaklı Kırmızı Kadife Koltuklar, Zemin LED Kılavuz Çizgileri & Dev Beyaz Projeksiyon Perdesi

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    /**
     * Statik Sinema Salonu Arka Planı (bgCache uyumlu)
     */
    function renderStaticKulturSinemaTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. ZEMİN & DUVARLAR: Koyu Karbon Grisi & Kırmızı Akustik Yalıtım
        bctx.fillStyle = "#05070c";
        bctx.fillRect(0, 0, width, height);

        // 2. DEV BEYAZ SİNEMA PROJEKSİYON PERDESİ (x: 160..840, y: 30..220)
        const scrX = 160, scrY = 30, scrW = 680, scrH = 190;

        // Perde Çerçevesi (Piyano Siyahı & Titanyum Kenarlar)
        bctx.fillStyle = "#09090b";
        bctx.fillRect(scrX - 12, scrY - 12, scrW + 24, scrH + 24);
        bctx.strokeStyle = "#38bdf8";
        bctx.lineWidth = 2;
        bctx.strokeRect(scrX - 12, scrY - 12, scrW + 24, scrH + 24);

        // Beyaz Projeksiyon Bezi
        const scrGrad = bctx.createLinearGradient(scrX, scrY, scrX, scrY + scrH);
        scrGrad.addColorStop(0, "#f8fafc");
        scrGrad.addColorStop(0.5, "#e2e8f0");
        scrGrad.addColorStop(1, "#cbd5e1");
        bctx.fillStyle = scrGrad;
        bctx.fillRect(scrX, scrY, scrW, scrH);

        // Perde Üzerindeki Logo / Demo Fragman Yazısı
        bctx.fillStyle = "#1e1b4b";
        bctx.font = "900 24px 'Arial Black', sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🎬 G R A N D   S İ N E M A", width / 2, scrY + 80);

        bctx.fillStyle = "#4338ca";
        bctx.font = "bold 13px sans-serif";
        bctx.fillText("2.5D İZLEME SALONU & VİZYON GÖSTERİMİ", width / 2, scrY + 110);

        bctx.fillStyle = "#dc2626";
        bctx.font = "bold 11px sans-serif";
        bctx.fillText("🍿 Mısırını Al & Rahatına Bak", width / 2, scrY + 140);

        // Perde Altı Hoparlör / Subwoofer Paneli (y: 220..245)
        bctx.fillStyle = "#111827";
        bctx.fillRect(scrX, scrY + scrH, scrW, 20);
        bctx.strokeStyle = "#475569";
        bctx.lineWidth = 1;
        bctx.strokeRect(scrX, scrY + scrH, scrW, 20);

        // 3. BASAMAKLI KOLTUK SIRALARI (4 KADEME)
        const rows = [
            { y: 280, count: 10, startX: 130, gap: 76 },
            { y: 350, count: 12, startX: 80, gap: 72 },
            { y: 425, count: 12, startX: 80, gap: 72 },
            { y: 500, count: 12, startX: 80, gap: 72 }
        ];

        rows.forEach((r, idx) => {
            // Basamak Zemin Yükseltisi
            bctx.fillStyle = "#0c0a09";
            bctx.fillRect(0, r.y - 10, width, 65);

            // ZEMİN KIRMIZI ŞERİT LED'LERİ (Adım Kılavuz Işığı)
            bctx.fillStyle = "rgba(239, 68, 68, 0.85)";
            bctx.fillRect(0, r.y - 8, width, 2.5);

            for (let i = 0; i < r.count; i++) {
                const cx = r.startX + i * r.gap;
                // Orta koridor geçişi (x: 460..540)
                if (cx >= 450 && cx <= 530) continue;

                // Kırmızı Kadife Sinema Koltuğu
                bctx.fillStyle = "#991b1b";
                bctx.beginPath();
                bctx.roundRect(cx, r.y, 42, 34, [6, 6, 2, 2]);
                bctx.fill();
                bctx.strokeStyle = "#b91c1c";
                bctx.lineWidth = 1;
                bctx.stroke();

                // Koltuk Kafalığı
                bctx.fillStyle = "#b91c1c";
                bctx.fillRect(cx + 6, r.y + 4, 30, 10);

                // Bardaklıklı Kolçaklar
                bctx.fillStyle = "#1e293b";
                bctx.fillRect(cx - 3, r.y + 12, 5, 20);
                bctx.fillRect(cx + 40, r.y + 12, 5, 20);

                // Kolçaktaki Bardak Yuvası
                bctx.fillStyle = "#000000";
                bctx.beginPath(); bctx.arc(cx - 1, r.y + 16, 2, 0, Math.PI * 2); bctx.fill();
                bctx.beginPath(); bctx.arc(cx + 42, r.y + 16, 2, 0, Math.PI * 2); bctx.fill();
            }
        });

        // 4. ALT ÇIKIŞ KAPISI: 🚪 FUAYE / LOBİYE ÇIKIŞ
        const exitX = width / 2 - 50, exitY = height - 35, exitW = 100, exitH = 35;
        bctx.fillStyle = "#1e293b";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.strokeStyle = "#10b981";
        bctx.lineWidth = 2;
        bctx.strokeRect(exitX, exitY, exitW, exitH);

        bctx.fillStyle = "#a7f3d0";
        bctx.font = "bold 10px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("⬇ ÇIKIŞ (FUAYE)", width / 2, height - 12);
    }

    /**
     * Dinamik Sinema Çevre Çizimi (60 FPS, Projeksiyon Işığı Huzmesi ve Hover)
     */
    function drawKulturSinemaEnvironment() {
        let bg = bgCache.getCanvas('kultur_merkezi_sinema', canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0);

        const now = Date.now();

        // 1. Projeksiyon Işık Huzmesi (Arkadan perdeye vuran tozlu mavi-beyaz konik ışık)
        const flicker = Math.sin(now / 80) * 0.03 + Math.cos(now / 140) * 0.02;
        const beamGrad = ctx.createLinearGradient(500, 0, 500, 220);
        beamGrad.addColorStop(0, `rgba(240, 249, 255, ${0.28 + flicker})`);
        beamGrad.addColorStop(0.7, `rgba(56, 189, 248, ${0.12 + flicker})`);
        beamGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(500, 0);
        ctx.lineTo(160, 220);
        ctx.lineTo(840, 220);
        ctx.closePath();
        ctx.fill();

        // 2. Hover Kontrolleri
        const isExitHover = (canvasMouseX >= canvas.width / 2 - 60 && canvasMouseX <= canvas.width / 2 + 60 && canvasMouseY >= canvas.height - 50);

        if (isExitHover) {
            hoveredTableId = 'sinema_exit_lobi';
            setGameCursor('pointer');
        } else {
            if (hoveredTableId === 'sinema_exit_lobi') {
                hoveredTableId = null;
            }
            setGameCursor('default');
        }
    }

    window.renderStaticKulturSinemaTo = renderStaticKulturSinemaTo;
    window.drawKulturSinemaEnvironment = drawKulturSinemaEnvironment;
})();

