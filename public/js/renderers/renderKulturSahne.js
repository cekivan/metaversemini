// public/js/renderers/renderKulturSahne.js - Ana Sanat & Stand-Up Sahnesi (2.5D Tiyatro Salonu)
// Spot Işıklar, Dinamik Performans Modları (Stand-up, Müzik, Rap, Talk Show, Şiir), Domates & Gül Efektleri

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    // Domates lekeleri dizisi (sahnede birikir)
    let tomatoSplashes = [];
    // Gül & Altın bahşiş parçacıkları
    let tipParticles = [];

    window.addTomatoSplash = function (x, y) {
        tomatoSplashes.push({
            x: x,
            y: y,
            radius: 8 + Math.random() * 8,
            drips: [
                { dy: 6 + Math.random() * 8, dx: -2 + Math.random() * 4 },
                { dy: 10 + Math.random() * 12, dx: -1 + Math.random() * 2 }
            ],
            createdAt: Date.now()
        });
        if (tomatoSplashes.length > 35) tomatoSplashes.shift();
    };

    window.addTipRoseParticles = function (amount) {
        const count = Math.min(25, 6 + Math.floor(amount / 20));
        for (let i = 0; i < count; i++) {
            tipParticles.push({
                x: 350 + Math.random() * 300,
                y: 420 + Math.random() * 80,
                tx: 470 + Math.random() * 60,
                ty: 210 + Math.random() * 50,
                progress: 0,
                speed: 0.02 + Math.random() * 0.02,
                type: (i % 2 === 0) ? 'rose' : 'gold',
                rot: Math.random() * Math.PI * 2,
                rotSpeed: 0.05 + Math.random() * 0.1
            });
        }
    };

    /**
     * Statik Sahne & Salon Arka Planı (bgCache uyumlu)
     */
    function renderStaticKulturSahneTo(bctx, width, height) {
        bctx.clearRect(0, 0, width, height);

        // 1. GENEL ZEMİN & DUVAR: Loş Tiyatro Kırmızısı & Akustik Ahşap
        bctx.fillStyle = "#09090b";
        bctx.fillRect(0, 0, width, height);

        // Arka Akustik Kumaş Duvar (y: 0..120)
        const wallGrad = bctx.createLinearGradient(0, 0, 0, 120);
        wallGrad.addColorStop(0, "#09090b");
        wallGrad.addColorStop(0.7, "#1c1917");
        wallGrad.addColorStop(1, "#292524");
        bctx.fillStyle = wallGrad;
        bctx.fillRect(0, 0, width, 120);

        // 2. YÜKSELTİLMİŞ MASİF AHŞAP SAHNE (x: 160..840, y: 110..290)
        const stX = 160, stY = 110, stW = 680, stH = 180;

        // Sahne Tabanı (Ceviz Parke Döşeme)
        const woodGrad = bctx.createLinearGradient(stX, stY, stX, stY + stH);
        woodGrad.addColorStop(0, "#451a03");
        woodGrad.addColorStop(0.5, "#78350f");
        woodGrad.addColorStop(1, "#290d02");
        bctx.fillStyle = woodGrad;
        bctx.beginPath();
        bctx.roundRect(stX, stY, stW, stH, 12);
        bctx.fill();
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 3;
        bctx.stroke();

        // Parke Çizgileri
        bctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        bctx.lineWidth = 1;
        for (let py = stY + 16; py < stY + stH; py += 16) {
            bctx.beginPath(); bctx.moveTo(stX + 6, py); bctx.lineTo(stX + stW - 6, py); bctx.stroke();
        }

        // Sahne Ön Eteği & Pirinç Ayak Profili (y: 285..295)
        bctx.fillStyle = "#1c1917";
        bctx.fillRect(stX, stY + stH - 8, stW, 8);
        bctx.fillStyle = "#d97706";
        bctx.fillRect(stX, stY + stH - 2, stW, 2);

        // 3. KADİFE TİYATRO PERDELERİ (SAHNE YANLARI)
        // Sol Perde Katmanları (x: 0..170)
        const solPerde = bctx.createLinearGradient(0, 0, 170, 0);
        solPerde.addColorStop(0, "#450a0a");
        solPerde.addColorStop(0.5, "#991b1b");
        solPerde.addColorStop(1, "#7f1d1d");
        bctx.fillStyle = solPerde;
        bctx.fillRect(0, 0, 170, 310);
        // Perde pileleri
        bctx.strokeStyle = "rgba(0,0,0,0.5)";
        bctx.lineWidth = 2;
        for (let px = 25; px < 170; px += 30) {
            bctx.beginPath(); bctx.moveTo(px, 0); bctx.lineTo(px, 310); bctx.stroke();
        }

        // Sağ Perde Katmanları (x: 830..width)
        const sagPerde = bctx.createLinearGradient(830, 0, width, 0);
        sagPerde.addColorStop(0, "#7f1d1d");
        sagPerde.addColorStop(0.5, "#991b1b");
        sagPerde.addColorStop(1, "#450a0a");
        bctx.fillStyle = sagPerde;
        bctx.fillRect(830, 0, width - 830, 310);
        for (let px = 855; px < width; px += 30) {
            bctx.beginPath(); bctx.moveTo(px, 0); bctx.lineTo(px, 310); bctx.stroke();
        }

        // Üst Perde Saçağı (Bordür)
        bctx.fillStyle = "#b91c1c";
        bctx.fillRect(160, 0, 680, 24);
        bctx.fillStyle = "#facc15";
        bctx.fillRect(160, 22, 680, 3);

        // Sahne Üstü Başlığı
        bctx.fillStyle = "#fef08a";
        bctx.font = "900 11px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🎭 STAND-UP & CANLI SANAT SAHNESİ", width / 2, 16);

        // 4. SAHNE MERKEZİ VINTAGE PİRİNÇ MİKROFON STANDI (x: 500, y: 230)
        const micX = 500, micY = 225;
        // Döküm yuvarlak taban
        bctx.fillStyle = "#d97706";
        bctx.beginPath();
        bctx.ellipse(micX, micY + 18, 12, 4, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "#facc15";
        bctx.lineWidth = 1;
        bctx.stroke();

        // Krom Stand Çubuğu
        bctx.fillStyle = "#e2e8f0";
        bctx.fillRect(micX - 1.5, micY - 14, 3, 32);

        // Vintage Elvis Mikrofon Kafası
        bctx.fillStyle = "#cbd5e1";
        bctx.beginPath();
        bctx.roundRect(micX - 6, micY - 24, 12, 14, 4);
        bctx.fill();
        bctx.strokeStyle = "#94a3b8";
        bctx.lineWidth = 1;
        bctx.stroke();
        // Mikrofon ızgara çizgileri
        bctx.strokeStyle = "#334155";
        for (let my = micY - 21; my <= micY - 12; my += 3) {
            bctx.beginPath(); bctx.moveTo(micX - 4, my); bctx.lineTo(micX + 4, my); bctx.stroke();
        }

        // 5. SOLDA SAHNE KENARI: 📋 AÇIK MİKROFON KAYIT KÜRSÜSÜ (x: 200..250, y: 220..270)
        const kurX = 210, kurY = 225, kurW = 42, kurH = 48;
        bctx.fillStyle = "#451a03";
        bctx.fillRect(kurX, kurY, kurW, kurH);
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 1.5;
        bctx.strokeRect(kurX, kurY, kurW, kurH);

        bctx.fillStyle = "#fef08a";
        bctx.fillRect(kurX + 6, kurY + 8, kurW - 12, 16);
        bctx.fillStyle = "#1e293b";
        bctx.font = "bold 7px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("📋 SIRA", kurX + kurW / 2, kurY + 20);

        // 6. SOL DUVARDA GİZLİ KULİS KAPISI (x: 50..120, y: 190..275)
        const kulX = 50, kulY = 190, kulW = 70, kulH = 85;
        bctx.fillStyle = "#1e1b4b";
        bctx.beginPath();
        bctx.roundRect(kulX, kulY, kulW, kulH, 8);
        bctx.fill();
        bctx.strokeStyle = "#a855f7";
        bctx.lineWidth = 2;
        bctx.stroke();

        bctx.fillStyle = "#f3e8ff";
        bctx.font = "bold 8px sans-serif";
        bctx.fillText("💄 KULİS", kulX + kulW / 2, kulY + 16);
        bctx.fillStyle = "#c084fc";
        bctx.font = "7px sans-serif";
        bctx.fillText("Sanatçı Kapısı", kulX + kulW / 2, kulY + 45);

        // 7. SEYİRCİ KOLTUKLARI (3 KADEMELİ BASAMAK & KIRMIZI KADİFE KOLTUK SIRALARI)
        // Kademe 1: y: 350
        // Kademe 2: y: 420
        // Kademe 3: y: 490
        const seatRows = [
            { y: 350, count: 8, startX: 200, gap: 75 },
            { y: 420, count: 10, startX: 140, gap: 76 },
            { y: 490, count: 12, startX: 80, gap: 74 }
        ];

        seatRows.forEach(row => {
            for (let i = 0; i < row.count; i++) {
                const sx = row.startX + i * row.gap;
                // Orta koridor boşluğu (x: 460..540)
                if (sx >= 450 && sx <= 530) continue;

                // Kadife Koltuk Sırtı & Minderi
                bctx.fillStyle = "#7f1d1d";
                bctx.beginPath();
                bctx.roundRect(sx, row.y, 44, 30, [8, 8, 4, 4]);
                bctx.fill();
                bctx.strokeStyle = "#b91c1c";
                bctx.lineWidth = 1;
                bctx.stroke();

                // Koltuk minderi katmanı
                bctx.fillStyle = "#991b1b";
                bctx.fillRect(sx + 3, row.y + 14, 38, 14);

                // Ahşap Kolçaklar
                bctx.fillStyle = "#451a03";
                bctx.fillRect(sx - 2, row.y + 10, 4, 18);
                bctx.fillRect(sx + 42, row.y + 10, 4, 18);
            }
        });

        // 8. ALT ÇIKIŞ KAPISI: 🚪 FUAYE / LOBİYE DÖNÜŞ (x: 440..560, y: 580..625)
        const exitX = width / 2 - 55, exitY = height - 35, exitW = 110, exitH = 35;
        bctx.fillStyle = "#1e293b";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.strokeStyle = "#f59e0b";
        bctx.lineWidth = 2;
        bctx.strokeRect(exitX, exitY, exitW, exitH);

        bctx.fillStyle = "#fde047";
        bctx.font = "bold 10px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("⬇ ÇIKIŞ (FUAYE)", width / 2, height - 12);
    }

    /**
     * Dinamik Sahne Çevre Çizimi (60 FPS, Spot Işıklar, Mod Efektleri, Domatesler & Güller)
     */
    function drawKulturSahneEnvironment() {
        let bg = bgCache.getCanvas('kultur_merkezi_sahne', canvas.width, canvas.height);
        ctx.drawImage(bg, 0, 0);

        const now = Date.now();
        const mode = (window.currentStageMode || 'standup');

        // =====================================================================
        // 1. DİNAMİK SAHNE MODU AYDINLATMASI & AMBİYANS IŞIKLARI
        // =====================================================================
        if (mode === 'standup') {
            // STAND-UP: Tek sıcak sarı odak spotu sahnede parlar
            const spotGrad = ctx.createRadialGradient(500, 220, 20, 500, 220, 160);
            spotGrad.addColorStop(0, "rgba(254, 240, 138, 0.45)");
            spotGrad.addColorStop(0.6, "rgba(250, 204, 21, 0.18)");
            spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.arc(500, 220, 160, 0, Math.PI * 2);
            ctx.fill();
        } else if (mode === 'music') {
            // AKUSTİK MÜZİK: Mavi ve eflatun loş neon atmosfer
            const pulse = Math.sin(now / 500) * 0.08;
            const musicGrad = ctx.createRadialGradient(500, 220, 30, 500, 220, 240);
            musicGrad.addColorStop(0, `rgba(168, 85, 247, ${0.35 + pulse})`);
            musicGrad.addColorStop(0.5, `rgba(59, 130, 246, ${0.25 + pulse})`);
            musicGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = musicGrad;
            ctx.beginPath();
            ctx.arc(500, 220, 240, 0, Math.PI * 2);
            ctx.fill();

            // Sahnede ahşap akustik müzik taburesi
            ctx.fillStyle = "#78350f";
            ctx.fillRect(455, 235, 22, 4);
            ctx.fillRect(459, 239, 4, 18);
            ctx.fillRect(469, 239, 4, 18);
        } else if (mode === 'rap') {
            // ŞARKI / RAP: Ritmik neon stroboskopik ışıklar
            const strobe = (Math.sin(now / 120) > 0) ? 0.35 : 0.15;
            ctx.fillStyle = `rgba(6, 182, 212, ${strobe})`;
            ctx.fillRect(160, 110, 680, 180);
            ctx.fillStyle = `rgba(236, 72, 153, ${0.25 - strobe * 0.4})`;
            ctx.fillRect(160, 110, 680, 180);
        } else if (mode === 'talkshow') {
            // TALK SHOW / SOHBET: Aydınlık stüdyo ışıkları, ikili berjer koltuk ve sehpa
            ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
            ctx.fillRect(160, 110, 680, 180);

            // Stüdyo Konuk Koltuğu & Sehpa
            ctx.fillStyle = "#1e293b";
            ctx.beginPath(); ctx.roundRect(430, 220, 26, 26, 4); ctx.fill();
            ctx.beginPath(); ctx.roundRect(540, 220, 26, 26, 4); ctx.fill();
            // Ortada sehpa
            ctx.fillStyle = "#78350f";
            ctx.fillRect(485, 230, 30, 14);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(497, 224, 6, 6); // Kahve bardağı
        } else if (mode === 'poetry') {
            // ŞİİR: Amber nostaljik şamdan ışığı ve hafif sis
            const candleGrad = ctx.createRadialGradient(500, 220, 10, 500, 220, 140);
            candleGrad.addColorStop(0, "rgba(245, 158, 11, 0.45)");
            candleGrad.addColorStop(0.7, "rgba(217, 119, 6, 0.15)");
            candleGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = candleGrad;
            ctx.beginPath();
            ctx.arc(500, 220, 140, 0, Math.PI * 2);
            ctx.fill();
        }

        // =====================================================================
        // 2. DOMATES LEKELERİ ÇİZİMİ (FIRLATILAN DOMATESLERİN SAHNEYE SIÇRAMASI)
        // =====================================================================
        for (let i = 0; i < tomatoSplashes.length; i++) {
            const sp = tomatoSplashes[i];
            ctx.fillStyle = "rgba(220, 38, 38, 0.85)";
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
            ctx.fill();

            // Domates çekirdekleri / leke akıntıları
            ctx.fillStyle = "rgba(185, 28, 28, 0.9)";
            for (let d of sp.drips) {
                ctx.beginPath();
                ctx.ellipse(sp.x + d.dx, sp.y + d.dy, 2.5, 5, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // =====================================================================
        // 3. BAHŞİŞ & GÜL FIRLATMA PARÇACIKLARI
        // =====================================================================
        for (let i = tipParticles.length - 1; i >= 0; i--) {
            const p = tipParticles[i];
            p.progress += p.speed;
            p.rot += p.rotSpeed;

            // Eğrisel atış rotası (Bezier benzeri)
            const curX = p.x + (p.tx - p.x) * p.progress;
            const arcY = Math.sin(p.progress * Math.PI) * -65;
            const curY = p.y + (p.ty - p.y) * p.progress + arcY;

            ctx.save();
            ctx.translate(curX, curY);
            ctx.rotate(p.rot);
            if (p.type === 'rose') {
                ctx.font = "16px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("🌹", 0, 0);
            } else {
                ctx.font = "14px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("💰", 0, 0);
            }
            ctx.restore();

            if (p.progress >= 1) {
                tipParticles.splice(i, 1);
            }
        }

        // =====================================================================
        // 4. SEYİRCİ ÇAKMAK / TELEFON IŞIĞI SELİ
        // =====================================================================
        if (window.activeStageLightersCount && window.activeStageLightersCount > 0) {
            const count = Math.min(20, window.activeStageLightersCount * 3);
            for (let i = 0; i < count; i++) {
                const lx = 140 + ((i * 137) % 720);
                const ly = 380 + ((i * 79) % 180);
                const flicker = Math.sin(now / 150 + i) * 2;
                ctx.fillStyle = "rgba(250, 204, 21, 0.6)";
                ctx.beginPath();
                ctx.arc(lx, ly, 3 + flicker * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
                ctx.beginPath();
                ctx.arc(lx, ly, 8 + flicker, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // =====================================================================
        // 5. HOVER KONTROLLERİ
        // =====================================================================
        const isQueueDeskHover = (canvasMouseX >= 200 && canvasMouseX <= 260 && canvasMouseY >= 210 && canvasMouseY <= 280);
        const isKulisDoorHover = (canvasMouseX >= 40 && canvasMouseX <= 130 && canvasMouseY >= 180 && canvasMouseY <= 280);
        const isExitHover = (canvasMouseX >= canvas.width / 2 - 60 && canvasMouseX <= canvas.width / 2 + 60 && canvasMouseY >= canvas.height - 50);

        if (isQueueDeskHover) {
            hoveredTableId = 'sahne_queue_desk';
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(205, 220, 52, 58);
            ctx.fillStyle = "#fef08a";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("📋 AÇIK MİKROFON: Sıraya Gir / Sırayı Gör", 230, 212);
            setGameCursor('pointer');
        } else if (isKulisDoorHover) {
            hoveredTableId = 'sahne_kulis_door';
            ctx.strokeStyle = "#a855f7";
            ctx.lineWidth = 2.5;
            ctx.strokeRect(46, 186, 78, 92);
            ctx.fillStyle = "#f3e8ff";
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("💄 VIP KULİS GİRİŞİ", 85, 178);
            setGameCursor('pointer');
        } else if (isExitHover) {
            hoveredTableId = 'sahne_exit_lobi';
            setGameCursor('pointer');
        } else {
            if (hoveredTableId && hoveredTableId.startsWith('sahne_')) {
                hoveredTableId = null;
            }
            setGameCursor('default');
        }
    }

    window.renderStaticKulturSahneTo = renderStaticKulturSahneTo;
    window.drawKulturSahneEnvironment = drawKulturSahneEnvironment;
})();

