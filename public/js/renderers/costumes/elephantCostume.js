// public/js/renderers/costumes/elephantCostume.js - 🐘 Fil Kostümü
(function () {
    // 1. 🐘 HEYBETLİ GERÇEKÇİ FİL (costume_elephant) - 2.5D 8 Yönlü
    // =========================================================================
    function drawElephant(ctx, facing, isMoving, walkCycle) {
        const isLeft = (facing === 'left' || facing === 'down-left' || facing === 'up-left');
        const isBack = (facing === 'up' || facing === 'up-left' || facing === 'up-right');
        const isFront = (facing === 'down');
        const dir = isLeft ? -1 : 1;

        ctx.save();
        ctx.scale(dir * 1.35, 1.35);

        // Zemin Gölgesi (Heybetli Geniş Elips)
        ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        const walkL = isMoving ? Math.sin(walkCycle) * 6 : 0;
        const walkR = isMoving ? -Math.sin(walkCycle) * 6 : 0;
        const earFlap = Math.sin(Date.now() / 250) * 0.12;
        const trunkSwing = Math.sin(Date.now() / 320) * 5;

        const hideDark = "#334155";
        const hideBase = "#475569";
        const hideLight = "#64748b";
        const tuskColor = "#fef08a";

        // A) 4 Sütun Ayak (Pillar Legs)
        function drawPillarLeg(lx, ly, swing) {
            ctx.save();
            ctx.translate(lx + swing * 0.8, ly);
            // Bacak Gövdesi
            const legGrad = ctx.createLinearGradient(-6, -18, 6, 0);
            legGrad.addColorStop(0, hideDark);
            legGrad.addColorStop(0.5, hideBase);
            legGrad.addColorStop(1, hideDark);
            ctx.fillStyle = legGrad;
            ctx.beginPath();
            ctx.roundRect(-6, -18, 12, 20, [3, 3, 4, 4]);
            ctx.fill();
            ctx.strokeStyle = "#1e293b";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Tırnaklar (Toenails: 3 adet yarım daire)
            ctx.fillStyle = "#e2e8f0";
            for (let i = -1; i <= 1; i++) {
                ctx.beginPath();
                ctx.arc(i * 3.5, 1, 1.8, Math.PI, 0, false);
                ctx.fill();
            }
            ctx.restore();
        }

        // Arka Bacaklar
        drawPillarLeg(-14, 0, -walkL);
        drawPillarLeg(-4, 0, -walkR);

        // Kuyruk
        if (!isFront) {
            ctx.save();
            ctx.strokeStyle = hideDark;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-18, -16);
            ctx.quadraticCurveTo(-26, -10 + walkL * 0.5, -24, 0);
            ctx.stroke();
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.ellipse(-24, 1, 3, 5, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // B) Devasa Gövde (Muscular Barrel Body)
        const bodyGrad = ctx.createRadialGradient(-2, -22, 6, -2, -22, 24);
        bodyGrad.addColorStop(0, hideLight);
        bodyGrad.addColorStop(0.6, hideBase);
        bodyGrad.addColorStop(1, hideDark);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(-2, -20, 20, 16, -0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Kırışıklık Çizgileri
        ctx.strokeStyle = "rgba(15, 23, 42, 0.35)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-10, -26); ctx.quadraticCurveTo(-6, -24, -2, -26);
        ctx.moveTo(-12, -20); ctx.quadraticCurveTo(-6, -18, 0, -20);
        ctx.stroke();

        // Ön Bacaklar
        drawPillarLeg(8, 0, walkL);
        drawPillarLeg(16, 0, walkR);

        // C) Kafa, Kulaklar, Fildişi ve Hortum
        ctx.save();
        ctx.translate(14, -24);

        if (!isBack) {
            // Arka Kulak
            ctx.fillStyle = "#334155";
            ctx.beginPath();
            ctx.ellipse(-6, -2, 10, 14, -0.3 + earFlap, 0, Math.PI * 2);
            ctx.fill();

            // Kafa Kubbesi
            ctx.fillStyle = hideBase;
            ctx.beginPath();
            ctx.arc(4, -4, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1; ctx.stroke();

            // Ön Kulak (Yelpaze Kulak)
            ctx.save();
            ctx.translate(0, -2);
            ctx.rotate(earFlap);
            ctx.fillStyle = hideBase;
            ctx.beginPath();
            ctx.ellipse(-4, 0, 11, 16, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 1; ctx.stroke();
            ctx.fillStyle = "rgba(253, 164, 175, 0.35)";
            ctx.beginPath();
            ctx.ellipse(-4, 0, 7, 11, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Göz ve Kaş Kırışıklığı
            ctx.fillStyle = "#1e293b";
            ctx.beginPath(); ctx.arc(6, -6, 2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(6.5, -6.5, 0.7, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#1e293b"; ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(6, -8, 3, 0.2, Math.PI - 0.2, true); ctx.stroke();

            // Fildişi Dişler (Ivory Tusks)
            ctx.fillStyle = tuskColor;
            ctx.strokeStyle = "#ca8a04";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(9, 2);
            ctx.quadraticCurveTo(18, 4, 22, -2);
            ctx.quadraticCurveTo(17, 7, 9, 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Kıvrık Prehensil Hortum
            ctx.strokeStyle = hideBase;
            ctx.lineWidth = 5;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(11, 1);
            ctx.quadraticCurveTo(16, 12, 18 + trunkSwing * 0.4, 20);
            ctx.quadraticCurveTo(16 + trunkSwing, 24, 22 + trunkSwing, 21);
            ctx.stroke();

            ctx.strokeStyle = "rgba(15, 23, 42, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(13, 6); ctx.lineTo(16, 7);
            ctx.moveTo(15, 12); ctx.lineTo(18, 13);
            ctx.moveTo(17, 17); ctx.lineTo(20, 18);
            ctx.stroke();
        } else {
            ctx.fillStyle = hideDark;
            ctx.beginPath(); ctx.arc(0, -4, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = hideBase;
            ctx.beginPath(); ctx.ellipse(-12, -2, 10, 15, -0.4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(12, -2, 10, 15, 0.4, 0, Math.PI * 2); ctx.fill();
        }

        ctx.restore();
        ctx.restore();
    }

    // =========================================================================

    const definition = {
        id: 'costume_elephant',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawElephant(ctx, facing, isMoving, walkCycle);
        },
        getNameTagOffset: () => -34
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_elephant'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_elephant', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
