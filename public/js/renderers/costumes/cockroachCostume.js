// public/js/renderers/costumes/cockroachCostume.js - 🪳 Hamamböceği Kostümü
(function () {
    // 2. 🪳 SİLAH ÇEKEN HUYSUZ HAMAMBÖCEĞİ (costume_cockroach)
    // Arka cebinden silah çıkarıp havaya 3 el ateş eden mafya hamamböceği
    // =========================================================================
    function drawCockroach(ctx, facing, isMoving, walkCycle) {
        const isLeft = (facing === 'left' || facing === 'down-left' || facing === 'up-left');
        const dir = isLeft ? -1 : 1;

        ctx.save();
        ctx.scale(dir * 1.25, 1.25);

        // Zemin Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        const time = Date.now();
        const stepL = isMoving ? Math.sin(walkCycle * 1.5) * 7 : 0;
        const stepR = isMoving ? -Math.sin(walkCycle * 1.5) * 7 : 0;
        const antennaWave = Math.sin(time / 160) * 0.12;

        const chitinDark = "#451a03";
        const chitinBase = "#78350f";
        const chitinLight = "#b45309";
        const chitinHighlight = "#f59e0b";

        // ==========================================================
        // SİLAH ÇEKME VE HAVAYA 3 EL ATEŞ ANİMASYON DURUMU (10 sn döngü)
        // ==========================================================
        const gunCycle = time % 10000;
        let isShootingMode = (gunCycle < 3800);
        let gunPhase = isShootingMode ? gunCycle : 0;

        let rightArmAngle = 0.35;
        let gunVisible = false;
        let muzzleFlash = false;
        let flashScale = 1;
        let smokeAlpha = 0;

        if (isShootingMode) {
            if (gunPhase < 800) {
                // 1. Arka cebe uzanma
                rightArmAngle = -0.85 + (gunPhase / 800) * 0.4;
            } else if (gunPhase < 1200) {
                // 2. Silahı çıkarıp havaya kaldırma
                rightArmAngle = -0.45 + ((gunPhase - 800) / 400) * 1.6;
                gunVisible = true;
            } else if (gunPhase < 1500) {
                // 3. 1. ATEŞ! (1200 - 1500ms)
                gunVisible = true;
                if (gunPhase < 1320) {
                    muzzleFlash = true;
                    flashScale = 1.0;
                    rightArmAngle = 1.45; // Recoil
                } else {
                    smokeAlpha = 0.8;
                    rightArmAngle = 1.25;
                }
            } else if (gunPhase < 1800) {
                gunVisible = true;
                rightArmAngle = 1.15;
            } else if (gunPhase < 2100) {
                // 4. 2. ATEŞ! (1800 - 2100ms)
                gunVisible = true;
                if (gunPhase < 1920) {
                    muzzleFlash = true;
                    flashScale = 1.1;
                    rightArmAngle = 1.50; // Recoil
                } else {
                    smokeAlpha = 0.9;
                    rightArmAngle = 1.25;
                }
            } else if (gunPhase < 2400) {
                gunVisible = true;
                rightArmAngle = 1.15;
            } else if (gunPhase < 2700) {
                // 5. 3. ATEŞ! (2400 - 2700ms)
                gunVisible = true;
                if (gunPhase < 2540) {
                    muzzleFlash = true;
                    flashScale = 1.35; // Daha büyük alev
                    rightArmAngle = 1.60;
                } else {
                    smokeAlpha = 1.0;
                    rightArmAngle = 1.25;
                }
            } else if (gunPhase < 3300) {
                // 6. Namluyu üfleme (Blow smoke)
                gunVisible = true;
                rightArmAngle = 0.45;
            } else {
                // 7. Silahı cebe geri koyma
                gunVisible = (gunPhase < 3600);
                rightArmAngle = -0.55;
            }
        }

        // 2 Arka Bacak (Yürüyen Bacaklar)
        ctx.strokeStyle = chitinBase;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-6, -14); ctx.lineTo(-13 + stepL * 0.4, -6); ctx.lineTo(-11 + stepL, 0);
        ctx.moveTo(6, -14); ctx.lineTo(13 + stepR * 0.4, -6); ctx.lineTo(11 + stepR, 0);
        ctx.stroke();

        // Dikenler (Spines)
        ctx.strokeStyle = chitinDark;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-12 + stepL * 0.4, -4); ctx.lineTo(-15 + stepL * 0.4, -5);
        ctx.moveTo(12 + stepR * 0.4, -4); ctx.lineTo(15 + stepR * 0.4, -5);
        ctx.stroke();

        // Elytra (Sırt Kanat Kabuğu & Arka Cep)
        const wingGrad = ctx.createLinearGradient(-10, -40, 12, 0);
        wingGrad.addColorStop(0, chitinDark);
        wingGrad.addColorStop(0.4, chitinBase);
        wingGrad.addColorStop(0.8, chitinLight);
        wingGrad.addColorStop(1, chitinDark);
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.ellipse(-2, -26, 13, 20, 0.08, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = chitinDark; ctx.lineWidth = 1.4; ctx.stroke();

        // Arka Cep (Silah Kılıfı & Cep Detayı)
        ctx.fillStyle = "#1c1917";
        ctx.fillRect(4, -22, 6, 8);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 0.7;
        ctx.strokeRect(4, -22, 6, 8);

        // Speküler Parlaklık Çizgisi
        ctx.strokeStyle = "rgba(245, 158, 11, 0.65)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(2, -40); ctx.quadraticCurveTo(6, -26, 2, -10);
        ctx.stroke();

        // Segmentli Karın Zırhı
        for (let i = 0; i < 5; i++) {
            const y = -14 - i * 5.2;
            const w = 14 - i * 0.8;
            ctx.fillStyle = (i % 2 === 0) ? chitinBase : chitinLight;
            ctx.beginPath();
            ctx.roundRect(-w / 2, y, w, 4.5, 2);
            ctx.fill();
            ctx.strokeStyle = chitinDark; ctx.lineWidth = 0.8; ctx.stroke();
        }

        // Sol Kollar (Huysuzca Göğüste)
        ctx.strokeStyle = chitinLight;
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-6, -34); ctx.lineTo(-11, -28); ctx.lineTo(-4, -26);
        ctx.moveTo(-5, -28); ctx.lineTo(-10, -22); ctx.lineTo(-3, -20);
        ctx.stroke();

        // Sağ Kol (Silah Çeken veya Göğüste Duran)
        ctx.save();
        ctx.translate(6, -32);
        ctx.rotate(rightArmAngle);

        ctx.strokeStyle = chitinLight;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(8, -6);
        ctx.lineTo(14, -2);
        ctx.stroke();

        // ELDEKİ SİLAH (Chrome Revolver)
        if (gunVisible) {
            ctx.save();
            ctx.translate(14, -2);
            ctx.rotate(-0.3);

            // Kabza
            ctx.fillStyle = "#451a03";
            ctx.fillRect(-2, 0, 4, 6);
            // Gövde ve Silindir
            ctx.fillStyle = "#94a3b8";
            ctx.fillRect(-2, -4, 8, 5);
            ctx.fillStyle = "#334155";
            ctx.beginPath(); ctx.arc(2, -1.5, 3, 0, Math.PI * 2); ctx.fill();
            // Namlu (Barrel)
            ctx.fillStyle = "#cbd5e1";
            ctx.fillRect(6, -4, 10, 3.2);
            ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 0.6; ctx.strokeRect(6, -4, 10, 3.2);

            // 💥 NAMLUDAN ÇIKAN ATEŞ PARLAMASI (Muzzle Flash Starburst)
            if (muzzleFlash) {
                ctx.save();
                ctx.translate(17, -2.5);
                ctx.scale(flashScale, flashScale);

                // Dış Turuncu Kıvılcım Yıldızı
                ctx.fillStyle = "#ea580c";
                ctx.beginPath();
                for (let a = 0; a < 8; a++) {
                    const r = (a % 2 === 0) ? 14 : 5;
                    const rad = a * Math.PI / 4;
                    ctx.lineTo(Math.cos(rad) * r, Math.sin(rad) * r);
                }
                ctx.closePath();
                ctx.fill();

                // İç Sarı-Beyaz Çekirdek
                ctx.fillStyle = "#fde047";
                ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();

                ctx.restore();
            }

            // 💨 SİLAH DUMANI (Smoke Puff)
            if (smokeAlpha > 0) {
                ctx.fillStyle = `rgba(226, 232, 240, ${smokeAlpha * 0.75})`;
                ctx.beginPath();
                ctx.arc(20, -6, 5, 0, Math.PI * 2);
                ctx.arc(25, -10, 7, 0, Math.PI * 2);
                ctx.arc(28, -16, 9, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        } else if (!isShootingMode) {
            // Normal duruşta sağ kollar
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(6, 4); ctx.lineTo(2, 6);
            ctx.stroke();
        }
        ctx.restore();

        // Boyun Kalkanı ve Kafa
        ctx.fillStyle = chitinDark;
        ctx.beginPath(); ctx.ellipse(0, -42, 9, 6.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = chitinLight; ctx.lineWidth = 1; ctx.stroke();

        ctx.fillStyle = chitinBase;
        ctx.beginPath(); ctx.ellipse(0, -48, 7, 6, 0, 0, Math.PI * 2); ctx.fill();

        // Huysuz Gözler & Çatık Kaşlar
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.ellipse(-3.2, -49, 2.8, 3.2, -0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(3.2, -49, 2.8, 3.2, 0.15, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "#09090b";
        ctx.beginPath(); ctx.arc(-2.4, -48.6, 1.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2.4, -48.6, 1.4, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = "#451a03"; ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-5.5, -53); ctx.lineTo(-0.8, -50.5); ctx.lineTo(0.8, -50.5); ctx.lineTo(5.5, -53);
        ctx.stroke();

        // Uzun Esnek Antenler
        ctx.strokeStyle = chitinLight; ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-2, -53); ctx.quadraticCurveTo(-14 + antennaWave * 20, -68, -12 + antennaWave * 30, -78);
        ctx.moveTo(2, -53); ctx.quadraticCurveTo(14 - antennaWave * 20, -68, 12 - antennaWave * 30, -78);
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================

    const definition = {
        id: 'costume_cockroach',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawCockroach(ctx, facing, isMoving, walkCycle);
        },
        getNameTagOffset: () => -28
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_cockroach'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_cockroach', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
