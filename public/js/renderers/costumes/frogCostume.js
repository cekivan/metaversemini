// public/js/renderers/costumes/frogCostume.js - 🐸 Zıplayan Kurbağa Kostümü
(function () {
    function getFrogJumpState(walkCycle, isMoving) {
        const time = Date.now();
        let hopY = 0;
        let scaleX = 1.0;
        let scaleY = 1.0;
        let isAirborne = false;

        if (isMoving) {
            // Yürürken sürekli yüksek parabolik zıplamalar (Period: 550ms)
            const phase = (time % 550) / 550;
            if (phase < 0.15) {
                // Hazırlık / Çökme (Squash)
                const p = phase / 0.15;
                hopY = 0;
                scaleX = 1.0 + (1 - p) * 0.25;
                scaleY = 1.0 - (1 - p) * 0.22;
            } else if (phase < 0.85) {
                // Havada Parabolik Yay (Apex: -36px)
                const p = (phase - 0.15) / 0.70;
                hopY = -Math.sin(p * Math.PI) * 36;
                scaleX = 0.82;
                scaleY = 1.28;
                isAirborne = true;
            } else {
                // Yere İniş Çarpması (Landing Impact Squash)
                const p = (phase - 0.85) / 0.15;
                hopY = 0;
                scaleX = 1.28 - p * 0.28;
                scaleY = 0.72 + p * 0.28;
            }
        } else {
            // Dururken periyodik ufak zıplama (Her 3.5 saniyede bir)
            const idleCycle = time % 3500;
            if (idleCycle < 450) {
                const p = idleCycle / 450;
                hopY = -Math.sin(p * Math.PI) * 18;
                scaleX = 0.90;
                scaleY = 1.15;
                isAirborne = true;
            }
        }

        return { hopY, scaleX, scaleY, isAirborne };
    }


    // 7. 🐸 GERÇEKTEN ZIPLAYAN KURBAĞA (costume_frog) - Parabolic Hop Physics!
    // =========================================================================
    function drawFrog(ctx, facing, isMoving, walkCycle) {
        const isLeft = (facing === 'left' || facing === 'down-left' || facing === 'up-left');
        const dir = isLeft ? -1 : 1;
        const time = Date.now();

        const js = getFrogJumpState(walkCycle, isMoving);

        ctx.save();
        ctx.translate(0, js.hopY);
        ctx.scale(dir * 1.35 * js.scaleX, 1.35 * js.scaleY);

        // Zemin Gölgesi (Yüksekliğe göre orantılı küçülür)
        const shadowScale = Math.max(0.25, 1.0 + (js.hopY / 45));
        ctx.save();
        ctx.translate(0, -js.hopY);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.35 * shadowScale})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18 * shadowScale, 7 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const frogGreen = "#10b981";
        const frogDark = "#047857";
        const frogCyan = "#06b6d4";
        const frogYellow = "#facc15";

        // GÜÇLÜ ARKA ZIPLAMA BACAKLARI (Powerful Hind Legs)
        ctx.fillStyle = frogDark;
        if (js.isAirborne) {
            // Havada geriye doğru tam gerilmiş bacaklar!
            ctx.beginPath();
            ctx.ellipse(-14, -4, 5, 14, -0.9, 0, Math.PI * 2);
            ctx.ellipse(6, -4, 5, 14, -0.9, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = frogYellow;
            for (let f = -1; f <= 1; f++) {
                ctx.beginPath(); ctx.arc(-20 + f * 3, -1, 2, 0, Math.PI * 2); ctx.fill();
            }
        } else {
            // Yerde katlı zıplama yayları
            ctx.beginPath();
            ctx.ellipse(-10, -7, 6, 10, -0.6, 0, Math.PI * 2);
            ctx.ellipse(10, -7, 6, 10, 0.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = frogYellow;
            ctx.beginPath(); ctx.arc(-14, 0, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(14, 0, 2.5, 0, Math.PI * 2); ctx.fill();
        }

        // Parlak Zümrüt & Turkuaz Gövde
        const bodyGrad = ctx.createRadialGradient(0, -12, 3, 0, -12, 14);
        bodyGrad.addColorStop(0, frogCyan);
        bodyGrad.addColorStop(0.6, frogGreen);
        bodyGrad.addColorStop(1, frogDark);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, -12, 13, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Benekler
        ctx.fillStyle = "#09090b";
        ctx.beginPath();
        ctx.arc(-4, -14, 1.6, 0, Math.PI * 2);
        ctx.arc(4, -15, 1.8, 0, Math.PI * 2);
        ctx.arc(6, -9, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // ŞİŞEN BOĞAZ KESESİ (Pulsating Throat Vocal Sac)
        const sacPulse = Math.sin(time / 200) * 2.2;
        ctx.fillStyle = "rgba(250, 204, 21, 0.7)";
        ctx.beginPath();
        ctx.ellipse(0, -7, 6 + sacPulse, 4 + sacPulse * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Çıkık Kocaman Gözler
        ctx.fillStyle = frogGreen;
        ctx.beginPath();
        ctx.arc(-6, -20, 5.5, 0, Math.PI * 2);
        ctx.arc(6, -20, 5.5, 0, Math.PI * 2);
        ctx.fill();

        // Turuncu-Altın İris & Yatay Yarık Göz Bebekleri
        ctx.fillStyle = "#f97316";
        ctx.beginPath(); ctx.arc(-6, -20, 4.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(6, -20, 4.2, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = "#09090b";
        ctx.fillRect(-8.5, -21, 5, 2);
        ctx.fillRect(3.5, -21, 5, 2);

        // Islak Parlaklık Vurgusu
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.beginPath(); ctx.arc(-7, -22, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(5, -22, 1.5, 0, Math.PI * 2); ctx.fill();

        ctx.restore();
    }

    // =========================================================================

    const definition = {
        id: 'costume_frog',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawFrog(ctx, facing, isMoving, walkCycle);
        },
        getNameTagOffset: (p, isMoving) => {
            const js = getFrogJumpState(0, isMoving);
            return js.hopY - 14;
        }
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_frog'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_frog', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
