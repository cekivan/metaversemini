// scratch/test_fixed_k2_hats.js
const fs = require('fs');

// We will inject the new hat implementations into a test version of k2Head or inside test_hats_all.html to verify visually!
const hatRenderersJs = `
// --- YENİ 8 AÇILI VE SAÇ KIRPMALI K2 ŞAPKA MOTORU ---
Karakter2Renderer.drawSkaterBucketHat = function(ctx, facing, isBack, isProfile, p = null) {
    ctx.save();
    const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');
    
    const hairColor = (p && p.hairColor && p.hairColor !== 'original' && p.hairColor.startsWith('#')) ? p.hairColor : "#26150b";
    let customHatCol = (p && p.hatColor && p.hatColor !== 'original' && p.hatColor.startsWith('#')) ? p.hatColor : null;
    const crownColor = customHatCol || "#27272a";
    const brimColor = customHatCol ? "rgba(0, 0, 0, 0.28)" : "#18181b";

    if (isProfile) {
        ctx.save();
        if (dirSign < 0) ctx.scale(-1, 1);

        // 0. Ense & Kulak Saçı (Doğal katman)
        ctx.fillStyle = hairColor;
        ctx.beginPath();
        ctx.roundRect(-9.8, -1.5, 5.0, 7.5, [0, 0, 3, 3]);
        ctx.fill();
        ctx.fillRect(0.2, -4.5, 1.4, 3.2);

        // 1. Kova Kubbesi (Crown) - Kafayı arkadan öne tam saran kütle (x: -11.0 -> 7.5, y: -16.8 -> -7.5)
        ctx.fillStyle = crownColor;
        ctx.beginPath();
        ctx.moveTo(7.5, -7.5);
        ctx.lineTo(6.5, -16.5);
        ctx.quadraticCurveTo(0, -17.5, -7.5, -17.0);
        ctx.lineTo(-11.0, -16.0);
        ctx.lineTo(-11.2, -6.0);
        ctx.closePath();
        ctx.fill();

        // Tepe Dikiş Şeridi
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(-10.2, -12.5);
        ctx.lineTo(6.8, -12.5);
        ctx.stroke();

        // 2. Kova Siperliği (Brim) - Önde ve arkada kavisli salaş kenar (x: -12.5 -> 11.5)
        ctx.fillStyle = brimColor;
        ctx.beginPath();
        ctx.moveTo(-12.4, -4.5);
        ctx.quadraticCurveTo(-2.5, -7.5, 7.5, -7.0);
        ctx.lineTo(11.5, -6.2);
        ctx.quadraticCurveTo(12.0, -5.2, 10.5, -4.8);
        ctx.quadraticCurveTo(-2.5, -5.5, -12.4, -3.2);
        ctx.closePath();
        ctx.fill();

        // Siperlik dikiş çizgisi
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(-11.5, -4.0);
        ctx.quadraticCurveTo(-2.5, -6.5, 10.5, -5.5);
        ctx.stroke();

        // 3. Ön Neon Pembe Grafiti Yama
        if (!isBack) {
            ctx.fillStyle = "#ec4899";
            ctx.beginPath();
            ctx.roundRect(3.5, -14.5, 4.5, 3.0, 0.6);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(4.5, -13.6, 2.5, 1.1);
        }

        ctx.restore();

    } else if (isDiagonal) {
        // Çapraz Açı (3/4)
        ctx.fillStyle = brimColor;
        ctx.beginPath();
        ctx.ellipse(dirSign * 0.8, -7.0, 13.5, 3.4, dirSign * 0.06, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = crownColor;
        ctx.beginPath();
        ctx.roundRect(-dirSign * 0.4 - 8.8, -17.0, 17.6, 9.6, [5.0, 5.0, 1.5, 1.5]);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(-dirSign * 0.4 - 8.0, -12.5);
        ctx.lineTo(-dirSign * 0.4 + 8.0, -12.5);
        ctx.stroke();

        if (!isBack) {
            const patchX = dirSign * 4.0;
            ctx.fillStyle = "#ec4899";
            ctx.beginPath();
            ctx.roundRect(patchX - 2.2, -14.5, 4.4, 3.0, 0.6);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(patchX - 1.2, -13.6, 2.4, 1.1);
        }

    } else {
        // Tam Ön ve Tam Sırt
        ctx.fillStyle = brimColor;
        ctx.beginPath();
        ctx.ellipse(0, -7.0, 13.5, 3.4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = crownColor;
        ctx.beginPath();
        ctx.roundRect(-8.8, -17.0, 17.6, 9.6, [5.0, 5.0, 1.5, 1.5]);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(-8.0, -12.5);
        ctx.lineTo(8.0, -12.5);
        ctx.stroke();

        if (!isBack) {
            ctx.fillStyle = "#ec4899";
            ctx.beginPath();
            ctx.roundRect(-2.2, -14.5, 4.4, 3.0, 0.6);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-1.2, -13.6, 2.4, 1.1);
        }
    }
    ctx.restore();
};

Karakter2Renderer.drawK2Bere = function(ctx, facing, isBack, isProfile, p = null, isPink = false) {
    ctx.save();
    const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');
    
    let baseCol = isPink ? "#f472b6" : "#e11d48";
    let highCol = isPink ? "#fbcfe8" : "#fb7185";
    let shadowCol = isPink ? "#db2777" : "#9f1239";
    let bandCol = isPink ? "#be185d" : "#881337";

    if (p && p.hatColor && p.hatColor !== 'original' && p.hatColor.startsWith('#')) {
        baseCol = p.hatColor;
        highCol = "rgba(255, 255, 255, 0.35)";
        shadowCol = "rgba(0, 0, 0, 0.3)";
        bandCol = "rgba(0, 0, 0, 0.4)";
    }

    if (isProfile) {
        ctx.save();
        if (dirSign < 0) ctx.scale(-1, 1);

        // Bere Ana Gövdesi (Sarkık, dolgun yün bere kalıbı)
        const bereGrad = ctx.createLinearGradient(-10, -18, 8, -4);
        bereGrad.addColorStop(0, highCol);
        bereGrad.addColorStop(0.4, baseCol);
        bereGrad.addColorStop(1, shadowCol);

        ctx.fillStyle = bereGrad;
        ctx.beginPath();
        ctx.moveTo(7.5, -5.5);
        ctx.quadraticCurveTo(6.0, -13.5, 0, -17.2);
        ctx.quadraticCurveTo(-7.0, -17.5, -12.2, -12.5);
        ctx.quadraticCurveTo(-13.5, -7.0, -11.5, -1.8);
        ctx.quadraticCurveTo(-2.5, -5.5, 7.5, -5.5);
        ctx.closePath();
        ctx.fill();

        // Ribana / Etek Lastik Şeridi
        ctx.strokeStyle = bandCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(-11.5, -1.8);
        ctx.quadraticCurveTo(-2.5, -5.5, 7.5, -5.5);
        ctx.stroke();

        // Ponpon (Kırmızı Bere için) veya Fransız sapı (Pembe bere için)
        if (!isPink) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(-8.5, -16.5, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
            ctx.lineWidth = 0.6;
            ctx.stroke();
        } else {
            ctx.fillStyle = bandCol;
            ctx.fillRect(-2.0, -18.2, 1.8, 2.5);
        }

        ctx.restore();

    } else if (isDiagonal) {
        // Çapraz Açı
        ctx.fillStyle = baseCol;
        ctx.beginPath();
        ctx.ellipse(-dirSign * 0.8, -7.5, 11.8, 9.6, -dirSign * 0.08, Math.PI, 0, false);
        ctx.lineTo(-dirSign * 0.8 + (dirSign > 0 ? 11.8 : -11.8), -6.0);
        ctx.lineTo(-dirSign * 0.8 - (dirSign > 0 ? 11.8 : -11.8), -5.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = bandCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(dirSign * 0.5, -6.5, 12.0, 3.0, dirSign * 0.05, 0, Math.PI * 2);
        ctx.stroke();

        if (!isPink) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(-dirSign * 4.0, -16.5, 3.2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = bandCol;
            ctx.fillRect(-dirSign * 1.5, -18.0, 1.8, 2.2);
        }

    } else {
        // Tam Ön ve Tam Sırt
        ctx.fillStyle = baseCol;
        ctx.beginPath();
        ctx.ellipse(0, -7.5, 11.2, 9.6, 0, Math.PI, 0, false);
        ctx.lineTo(11.2, -6.0);
        ctx.lineTo(-11.2, -6.0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = bandCol;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, -6.5, 12.0, 3.0, 0, 0, Math.PI * 2);
        ctx.stroke();

        if (!isPink) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, -17.2, 3.4, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = bandCol;
            ctx.fillRect(-0.8, -18.2, 1.6, 2.2);
        }
    }
    ctx.restore();
};

Karakter2Renderer.drawK2Kasket = function(ctx, facing, isBack, isProfile, p = null) {
    ctx.save();
    const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

    const capCol = "#334155";
    const capDark = "#1e293b";
    const capHigh = "#64748b";

    if (isProfile) {
        ctx.save();
        if (dirSign < 0) ctx.scale(-1, 1);

        // Kasket Kubbesi (Öne doğru basık 8 parça form)
        ctx.fillStyle = capCol;
        ctx.beginPath();
        ctx.moveTo(7.5, -5.5);
        ctx.quadraticCurveTo(6.0, -13.0, 0, -16.2);
        ctx.quadraticCurveTo(-6.5, -16.5, -11.5, -11.5);
        ctx.quadraticCurveTo(-12.5, -6.0, -11.0, -1.8);
        ctx.quadraticCurveTo(-2.5, -5.5, 7.5, -5.5);
        ctx.closePath();
        ctx.fill();

        // Sert Kavisli Ön Siperlik
        ctx.fillStyle = capDark;
        ctx.beginPath();
        ctx.moveTo(6.5, -5.8);
        ctx.quadraticCurveTo(9.5, -5.8, 12.0, -4.8);
        ctx.quadraticCurveTo(11.0, -3.8, 7.0, -4.2);
        ctx.closePath();
        ctx.fill();

        // Tepe Düğmesi
        ctx.fillStyle = capHigh;
        ctx.beginPath();
        ctx.arc(-1.5, -16.0, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    } else if (isDiagonal) {
        // Çapraz Açı
        ctx.fillStyle = capDark;
        ctx.beginPath();
        ctx.ellipse(dirSign * 3.5, -5.8, 10.5, 3.2, dirSign * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = capCol;
        ctx.beginPath();
        ctx.ellipse(-dirSign * 0.4, -7.5, 11.2, 9.2, 0, Math.PI, 0, false);
        ctx.lineTo(-dirSign * 0.4 + (dirSign > 0 ? 11.2 : -11.2), -5.8);
        ctx.lineTo(-dirSign * 0.4 - (dirSign > 0 ? 11.2 : -11.2), -5.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = capHigh;
        ctx.beginPath();
        ctx.arc(-dirSign * 0.5, -16.2, 1.6, 0, Math.PI * 2);
        ctx.fill();

    } else {
        // Tam Ön ve Tam Sırt
        if (!isBack) {
            ctx.fillStyle = capDark;
            ctx.beginPath();
            ctx.ellipse(0, -5.8, 11.5, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = capCol;
        ctx.beginPath();
        ctx.ellipse(0, -7.5, 10.8, 9.2, 0, Math.PI, 0, false);
        ctx.lineTo(10.8, -5.8);
        ctx.lineTo(-10.8, -5.8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = capHigh;
        ctx.beginPath();
        ctx.arc(0, -16.4, 1.6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
};

Karakter2Renderer.drawK2Cowboy = function(ctx, facing, isBack, isProfile, p = null) {
    ctx.save();
    const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

    const hatCol = "#78350f";
    const hatBand = "#f59e0b";
    const hatDark = "#451a03";

    if (isProfile) {
        ctx.save();
        if (dirSign < 0) ctx.scale(-1, 1);

        // Kavisli Geniş Kovboy Siperliği
        ctx.fillStyle = hatCol;
        ctx.beginPath();
        ctx.moveTo(-13.5, -3.2);
        ctx.quadraticCurveTo(-3.0, -7.5, 8.0, -7.0);
        ctx.lineTo(14.0, -5.8);
        ctx.quadraticCurveTo(14.5, -4.5, 12.5, -4.2);
        ctx.quadraticCurveTo(-2.5, -5.2, -13.5, -2.0);
        ctx.closePath();
        ctx.fill();

        // Oluklu Kovboy Tacı (Cattleman Crease Crown)
        ctx.fillStyle = hatCol;
        ctx.beginPath();
        ctx.moveTo(6.5, -7.0);
        ctx.lineTo(5.0, -17.5);
        ctx.quadraticCurveTo(0, -18.8, -4.5, -17.8);
        ctx.lineTo(-9.8, -17.0);
        ctx.lineTo(-10.5, -5.5);
        ctx.closePath();
        ctx.fill();

        // Kemer Bandı
        ctx.fillStyle = hatBand;
        ctx.fillRect(-10.2, -7.8, 16.8, 1.8);

        ctx.restore();

    } else if (isDiagonal) {
        // Çapraz
        ctx.fillStyle = hatCol;
        ctx.beginPath();
        ctx.ellipse(dirSign * 0.8, -6.5, 15.5, 4.0, dirSign * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = hatDark;
        ctx.beginPath();
        ctx.roundRect(-dirSign * 0.4 - 7.5, -17.5, 15.0, 10.5, [4, 4, 1, 1]);
        ctx.fill();

        ctx.fillStyle = hatBand;
        ctx.fillRect(-dirSign * 0.4 - 7.5, -7.5, 15.0, 1.8);

    } else {
        // Tam Ön ve Tam Sırt: Yanları kıvrık geniş kovboy siperliği
        ctx.fillStyle = hatCol;
        ctx.beginPath();
        ctx.ellipse(0, -6.5, 15.5, 4.0, 0, 0, Math.PI * 2);
        ctx.fill();

        // Taç
        ctx.fillStyle = hatDark;
        ctx.beginPath();
        ctx.roundRect(-7.5, -17.5, 15.0, 10.5, [4, 4, 1, 1]);
        ctx.fill();

        // Taç orta çukuru (crease)
        ctx.strokeStyle = "rgba(0,0,0,0.3)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, -17.5);
        ctx.lineTo(0, -11.5);
        ctx.stroke();

        ctx.fillStyle = hatBand;
        ctx.fillRect(-7.5, -7.5, 15.0, 1.8);
    }
    ctx.restore();
};

Karakter2Renderer.drawK2Fes = function(ctx, facing, isBack, isProfile, p = null) {
    ctx.save();
    const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

    const fesCol = "#991b1b";
    const fesDark = "#7f1d1d";
    const tasselCol = "#0f172a";

    if (isProfile) {
        ctx.save();
        if (dirSign < 0) ctx.scale(-1, 1);

        // Fes Gövdesi (Kesik koni)
        ctx.fillStyle = fesCol;
        ctx.beginPath();
        ctx.moveTo(7.2, -6.0);
        ctx.lineTo(5.0, -17.5);
        ctx.lineTo(-7.0, -17.5);
        ctx.lineTo(-10.2, -2.5);
        ctx.quadraticCurveTo(-2.5, -5.5, 7.2, -6.0);
        ctx.closePath();
        ctx.fill();

        // Üst Düğme ve Püskül
        ctx.fillStyle = tasselCol;
        ctx.beginPath();
        ctx.arc(-1.0, -17.5, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Arkaya sarkan siyah püskül
        ctx.strokeStyle = tasselCol;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-1.0, -17.5);
        ctx.quadraticCurveTo(-5.5, -15.0, -8.5, -8.0);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(-8.5, -8.0, 2.0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    } else if (isDiagonal) {
        ctx.fillStyle = fesCol;
        ctx.beginPath();
        ctx.moveTo(-dirSign * 0.4 + 7.0, -6.0);
        ctx.lineTo(-dirSign * 0.4 + 5.2, -17.5);
        ctx.lineTo(-dirSign * 0.4 - 5.2, -17.5);
        ctx.lineTo(-dirSign * 0.4 - 7.0, -6.0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = tasselCol;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(-dirSign * 0.4, -17.5);
        ctx.quadraticCurveTo(-dirSign * 4.5, -15.0, -dirSign * 7.5, -9.0);
        ctx.stroke();
        ctx.fillStyle = tasselCol;
        ctx.beginPath();
        ctx.arc(-dirSign * 7.5, -9.0, 2.0, 0, Math.PI * 2);
        ctx.fill();

    } else {
        ctx.fillStyle = fesCol;
        ctx.beginPath();
        ctx.moveTo(7.2, -6.0);
        ctx.lineTo(5.2, -17.5);
        ctx.lineTo(-5.2, -17.5);
        ctx.lineTo(-7.2, -6.0);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = tasselCol;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, -17.5);
        ctx.quadraticCurveTo(4.5, -14.0, 7.5, -8.0);
        ctx.stroke();
        ctx.fillStyle = tasselCol;
        ctx.beginPath();
        ctx.arc(7.5, -8.0, 2.0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
};

Karakter2Renderer.drawK2Korsan = function(ctx, facing, isBack, isProfile, p = null) {
    ctx.save();
    const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

    const feltCol = "#18181b";
    const goldTrim = "#eab308";

    if (isProfile) {
        ctx.save();
        if (dirSign < 0) ctx.scale(-1, 1);

        // 3 Köşeli Korsan Şapkası (Tricorne)
        ctx.fillStyle = feltCol;
        ctx.beginPath();
        ctx.moveTo(-13.0, -2.5);
        ctx.lineTo(-10.5, -16.5);
        ctx.lineTo(1.0, -14.0);
        ctx.lineTo(12.5, -8.5);
        ctx.lineTo(7.5, -5.5);
        ctx.quadraticCurveTo(-2.5, -5.5, -13.0, -2.5);
        ctx.closePath();
        ctx.fill();

        // Altın Sırma Kenar
        ctx.strokeStyle = goldTrim;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-13.0, -2.5);
        ctx.lineTo(-10.5, -16.5);
        ctx.lineTo(1.0, -14.0);
        ctx.lineTo(12.5, -8.5);
        ctx.stroke();

        ctx.restore();

    } else if (isDiagonal) {
        ctx.fillStyle = feltCol;
        ctx.beginPath();
        ctx.moveTo(-13.5, -5.5);
        ctx.lineTo(-7.5, -17.0);
        ctx.lineTo(0, -13.5);
        ctx.lineTo(8.5, -16.5);
        ctx.lineTo(13.5, -5.5);
        ctx.quadraticCurveTo(0, -7.5, -13.5, -5.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = goldTrim;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-13.5, -5.5);
        ctx.lineTo(-7.5, -17.0);
        ctx.lineTo(0, -13.5);
        ctx.lineTo(8.5, -16.5);
        ctx.lineTo(13.5, -5.5);
        ctx.stroke();

    } else {
        ctx.fillStyle = feltCol;
        ctx.beginPath();
        ctx.moveTo(-13.5, -5.5);
        ctx.lineTo(-7.0, -17.0);
        ctx.lineTo(0, -13.5);
        ctx.lineTo(7.0, -17.0);
        ctx.lineTo(13.5, -5.5);
        ctx.quadraticCurveTo(0, -7.5, -13.5, -5.5);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = goldTrim;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(-13.5, -5.5);
        ctx.lineTo(-7.0, -17.0);
        ctx.lineTo(0, -13.5);
        ctx.lineTo(7.0, -17.0);
        ctx.lineTo(13.5, -5.5);
        ctx.stroke();

        if (!isBack) {
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(0, -9.5, 2.0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
};

Karakter2Renderer.drawK2Crown = function(ctx, facing, isBack, isProfile, p = null) {
    ctx.save();
    const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

    const gold = "#f59e0b";
    const ruby = "#ef4444";

    if (isProfile) {
        ctx.save();
        if (dirSign < 0) ctx.scale(-1, 1);

        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.moveTo(7.5, -7.5);
        ctx.lineTo(6.5, -14.0);
        ctx.lineTo(3.5, -9.5);
        ctx.lineTo(0, -14.5);
        ctx.lineTo(-3.5, -10.0);
        ctx.lineTo(-7.5, -14.0);
        ctx.lineTo(-8.5, -7.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = ruby;
        ctx.beginPath();
        ctx.arc(0, -14.5, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

    } else {
        ctx.fillStyle = gold;
        ctx.beginPath();
        ctx.moveTo(-7.5, -7.5);
        ctx.lineTo(-7.0, -14.0);
        ctx.lineTo(-3.5, -10.0);
        ctx.lineTo(0, -15.0);
        ctx.lineTo(3.5, -10.0);
        ctx.lineTo(7.0, -14.0);
        ctx.lineTo(7.5, -7.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = ruby;
        ctx.beginPath();
        ctx.arc(0, -15.0, 1.2, 0, Math.PI * 2);
        ctx.arc(-7.0, -14.0, 1.0, 0, Math.PI * 2);
        ctx.arc(7.0, -14.0, 1.0, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
};

// --- EVRENSEL VE KUSURSUZ ŞAPKA SAÇ KIRPMA MASKESİ (applyHatHairClipping) ---
Karakter2Renderer.applyHatHairClipping = function(ctx, facing, isBack, isProfile, dirSign, hatType) {
    if (!hatType || hatType === 'none') return;
    const isCrown = (hatType === 'crown');
    if (isCrown) {
        // Taç açık başlıktır, sadece tepeye aşırı fırlayan sivrilikleri yumuşatır
        ctx.beginPath();
        ctx.rect(-35, -16.0, 70, 60);
        ctx.clip();
        return;
    }

    const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

    ctx.beginPath();

    if (isProfile) {
        const s = dirSign;
        // Profil: Ön alın/kaş noktasından başlar
        ctx.moveTo(s * 11.5, -4.5);
        // Ön kubbe kavisi
        ctx.quadraticCurveTo(s * 7.0, -12.0, s * 1.0, -16.5);
        // Tepe noktası
        ctx.lineTo(s * -2.0, -17.2);
        // Arka kafa kavisi: kafatasını (x: -9.8) ve şapkayı (x: -11.8) tam içine alır
        ctx.bezierCurveTo(s * -7.5, -17.0, s * -11.8, -11.5, s * -11.8, -1.8);
        // Ense başlangıç noktası (şapkanın arka alt eteği)
        ctx.lineTo(s * -12.2, -0.6);

        // Şapka altındaki serbest doğal saç bölgesi (ense, omuz, sırt, saç dökümleri)
        ctx.lineTo(s * -35, -0.6);
        ctx.lineTo(s * -35, 45);
        ctx.lineTo(s * 35, 45);
        ctx.lineTo(s * 35, -4.5);
        ctx.closePath();
        ctx.clip();
        return;

    } else if (isDiagonal) {
        // Çapraz Açı (3/4)
        const domeCenterX = -dirSign * 0.4;
        const domeCenterY = -7.5;
        const domeRx = 11.4;
        const domeRy = 9.5;
        ctx.ellipse(domeCenterX, domeCenterY, domeRx, domeRy, 0, Math.PI, 0, false);
        const vRight = dirSign * 1.0 + 13.2;
        const vLeft = dirSign * 1.0 - 13.2;
        ctx.lineTo(vRight, -5.5);
        ctx.lineTo(vRight, -1.0);
        ctx.lineTo(35, 2.0);
        ctx.lineTo(35, 45);
        ctx.lineTo(-35, 45);
        ctx.lineTo(-35, 2.0);
        ctx.lineTo(vLeft, -1.0);
        ctx.lineTo(vLeft, -5.5);
        ctx.closePath();
        ctx.clip();
        return;

    } else if (isBack) {
        // Tam Sırt
        ctx.ellipse(0, -7.2, 10.8, 9.6, 0, Math.PI, 0, false);
        const vRx = 13.0;
        ctx.lineTo(vRx, -4.5);
        ctx.lineTo(vRx, -1.0);
        ctx.lineTo(35, 3.0);
        ctx.lineTo(35, 45);
        ctx.lineTo(-35, 45);
        ctx.lineTo(-35, 3.0);
        ctx.lineTo(-vRx, -1.0);
        ctx.lineTo(-vRx, -4.5);
        ctx.closePath();
        ctx.clip();
        return;

    } else {
        // Tam Ön
        ctx.ellipse(0, -7.5, 10.6, 9.6, 0, Math.PI, 0, false);
        const vRx = 13.0;
        ctx.lineTo(vRx, -4.5);
        ctx.lineTo(vRx, -1.0);
        ctx.lineTo(35, 3.0);
        ctx.lineTo(35, 45);
        ctx.lineTo(-35, 45);
        ctx.lineTo(-35, 3.0);
        ctx.lineTo(-vRx, -1.0);
        ctx.lineTo(-vRx, -4.5);
        ctx.closePath();
        ctx.clip();
        return;
    }
};
`;

console.log("Hat renderers prototype prepared.");

