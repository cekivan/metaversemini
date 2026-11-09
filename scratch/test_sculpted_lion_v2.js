const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const lionCode = `
window.testSculptedLion = function(ctx, facing, isMoving, walkCycle, isSitting) {
    const POSES = {
        'down':        { view: 'front',         mirror: 1 },
        'down-right':  { view: 'quarter-front', mirror: 1 },
        'right':       { view: 'side',          mirror: 1 },
        'up-right':    { view: 'quarter-back',  mirror: 1 },
        'up':          { view: 'back',          mirror: 1 },
        'up-left':     { view: 'quarter-back',  mirror: -1 },
        'left':        { view: 'side',          mirror: -1 },
        'down-left':   { view: 'quarter-front', mirror: -1 }
    };

    const pose = POSES[facing] || POSES['down'];
    const view = pose.view;
    const mirror = pose.mirror;

    const time = Date.now();
    const cycle = walkCycle || 0;

    const stride = isMoving ? Math.sin(cycle * 1.5) * 5.5 : 0;
    const stepBob = isMoving ? Math.abs(Math.sin(cycle * 1.5)) * 1.8 : 0;
    const breath = Math.sin(time / 550) * 0.04;
    const prowlBob = isMoving ? Math.sin(cycle * 3.0) * 0.8 : Math.sin(time / 650) * 0.5;

    const tailCycle = isMoving ? cycle * 1.3 : time / 450;
    const tailSway = Math.sin(tailCycle) * (isMoving ? 6.5 : 2.8);
    const tailTuftSway = Math.cos(tailCycle - 0.4) * (isMoving ? 8.5 : 4.0);

    const PAL = {
        coatSunlit:    '#fef08a',
        coatHighlight: '#facc15',
        coatBase:      '#d97706',
        coatShade:     '#b45309',
        coatDeep:      '#78350f',
        coatDark:      '#451a03',

        creamLight:    '#fffbeb',
        creamBase:     '#fef9c3',
        creamShade:    '#fde047',

        maneGlint:     '#fef08a',
        maneGold:      '#f59e0b',
        maneAmber:     '#d97706',
        maneAuburn:    '#9a3412',
        maneUmber:     '#7c2d12',
        maneDeep:      '#451a03',
        maneShadow:    '#270e04',

        eyeAmber:      '#f59e0b',
        eyePupil:      '#180a02',
        eyeHigh:       '#ffffff',
        eyeRim:        '#1a0b04',

        noseLeather:   '#2a1207',
        whiskerPad:    '#fef9c3',
        mouthDark:     '#180802',
        tonguePink:    '#e11d48',
        toothWhite:    '#ffffff',

        pawPad:        '#2e1305',
        clawDark:      '#1c1917',
        clawHighlight: '#44403c'
    };

    ctx.save();
    ctx.scale(mirror * 1.30, 1.30);

    // Contact Shadows
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, 3, isSitting ? 28 : 26, isSitting ? 12 : 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0, 0, 0, 0.46)";
    ctx.beginPath();
    ctx.ellipse(0, 2, isSitting ? 17 : 14, isSitting ? 6.5 : 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    function drawPaw(px, py, isFront, isFar) {
        ctx.save();
        ctx.translate(px, py);
        ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
        ctx.beginPath();
        ctx.ellipse(0, 1.2, isFront ? 5.2 : 4.6, 2.0, 0, 0, Math.PI * 2);
        ctx.fill();

        const baseCol = isFar ? PAL.coatShade : PAL.coatBase;
        const lightCol = isFar ? PAL.coatBase : PAL.coatHighlight;

        const pawGrad = ctx.createLinearGradient(0, -3, 0, 2);
        pawGrad.addColorStop(0, lightCol);
        pawGrad.addColorStop(1, baseCol);
        ctx.fillStyle = pawGrad;
        ctx.beginPath();
        ctx.ellipse(0, -0.5, isFront ? 4.8 : 4.2, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();

        [-3.0, -1.0, 1.0, 3.0].forEach(ox => {
            ctx.fillStyle = lightCol;
            ctx.beginPath();
            ctx.arc(ox, 0.2, 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.coatDark;
            ctx.fillRect(ox - 0.25, 0.7, 0.5, 0.8);
        });
        ctx.restore();
    }

    function drawLeg(hipX, hipY, pawX, pawY, isHind, isFar, swing, lift) {
        ctx.save();
        const curPawX = pawX + swing;
        const curPawY = pawY - lift;
        const baseCol = isFar ? PAL.coatShade : PAL.coatBase;
        const lightCol = isFar ? PAL.coatBase : PAL.coatHighlight;
        const deepCol = isFar ? PAL.coatDark : PAL.coatDeep;

        if (isHind) {
            const hockX = hipX - (hipX < curPawX ? 3.5 : 2.0);
            const hockY = (hipY + curPawY) * 0.52;
            const thighGrad = ctx.createLinearGradient(hipX - 6, hipY, hipX + 6, curPawY);
            thighGrad.addColorStop(0, lightCol);
            thighGrad.addColorStop(0.5, baseCol);
            thighGrad.addColorStop(1, deepCol);

            ctx.fillStyle = thighGrad;
            ctx.beginPath();
            ctx.moveTo(hipX - 5.5, hipY);
            ctx.quadraticCurveTo(hipX - 8.5, hockY - 3, hockX - 2.5, hockY);
            ctx.lineTo(curPawX - 2.5, curPawY - 1.2);
            ctx.lineTo(curPawX + 3.0, curPawY - 1.2);
            ctx.quadraticCurveTo(hockX + 3.5, hockY, hipX + 5.0, hipY + 2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = lightCol;
            ctx.beginPath();
            ctx.arc(hockX - 1.0, hockY, 1.6, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const elbowX = (hipX + curPawX) * 0.5;
            const elbowY = (hipY + curPawY) * 0.48;
            const armGrad = ctx.createLinearGradient(hipX - 5, hipY, hipX + 5, curPawY);
            armGrad.addColorStop(0, lightCol);
            armGrad.addColorStop(0.5, baseCol);
            armGrad.addColorStop(1, deepCol);

            ctx.fillStyle = armGrad;
            ctx.beginPath();
            ctx.moveTo(hipX - 4.5, hipY);
            ctx.quadraticCurveTo(elbowX - 3.8, elbowY, curPawX - 2.8, curPawY - 1.2);
            ctx.lineTo(curPawX + 3.0, curPawY - 1.2);
            ctx.quadraticCurveTo(elbowX + 3.8, elbowY, hipX + 4.5, hipY);
            ctx.closePath();
            ctx.fill();
        }

        drawPaw(curPawX, curPawY, !isHind, isFar);
        ctx.restore();
    }

    function drawTail(rootX, rootY) {
        ctx.save();
        const tipX = rootX - 16 + tailTuftSway;
        const tipY = rootY + 11 + tailSway;
        const midX = rootX - 10 + tailSway * 0.6;
        const midY = rootY + 3;

        ctx.strokeStyle = PAL.coatShade;
        ctx.lineWidth = 3.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();

        ctx.strokeStyle = PAL.coatHighlight;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(rootX, rootY);
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();

        ctx.save();
        ctx.translate(tipX, tipY);
        ctx.rotate(0.35 + tailSway * 0.08);
        ctx.fillStyle = PAL.maneDeep;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.5, 8.5, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.maneAuburn;
        ctx.beginPath();
        ctx.ellipse(0.5, -0.5, 3.2, 6.2, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.maneGold;
        ctx.beginPath();
        ctx.ellipse(1.0, -1.0, 1.8, 3.8, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        ctx.restore();
    }

    // Yele Katmanı Çizici (Mane Backdrop / Ruff)
    function drawManeRuff(mx, my, scaleX, scaleY, isProfile) {
        ctx.save();
        ctx.translate(mx, my);
        ctx.scale(scaleX, scaleY);

        // Koyu Gölge Katmanı
        ctx.fillStyle = PAL.maneShadow;
        ctx.beginPath();
        ctx.moveTo(0, -16);
        ctx.bezierCurveTo(-14, -18, -19, -8, -19, 0);
        ctx.bezierCurveTo(-20, 10, -15, 18, -3, 21);
        ctx.bezierCurveTo(4, 22, 12, 19, 16, 14);
        ctx.bezierCurveTo(20, 8, 19, -4, 15, -12);
        ctx.bezierCurveTo(11, -17, 5, -17, 0, -16);
        ctx.closePath();
        ctx.fill();

        // Kestane / Kızıl Orta Katman
        ctx.fillStyle = PAL.maneAuburn;
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.bezierCurveTo(-12, -15, -16, -6, -16, 0);
        ctx.bezierCurveTo(-17, 8, -12, 15, -2, 18);
        ctx.bezierCurveTo(4, 19, 10, 16, 14, 12);
        ctx.bezierCurveTo(17, 6, 16, -3, 13, -10);
        ctx.bezierCurveTo(9, -14, 4, -14, 0, -14);
        ctx.closePath();
        ctx.fill();

        // Altın Saçak Bukleleri
        ctx.fillStyle = PAL.maneGold;
        const tufts = isProfile ? 
            [[-12, -8], [-14, 0], [-12, 8], [-4, 16], [4, 14], [10, 8]] :
            [[-12, -8], [-15, 0], [-13, 8], [-4, 17], [4, 17], [13, 8], [15, 0], [12, -8]];

        tufts.forEach(([tx, ty]) => {
            ctx.beginPath();
            ctx.ellipse(tx, ty, 3.8, 5.5, Math.atan2(ty, tx), 0, Math.PI * 2);
            ctx.fill();
        });

        // Üst ışıltılı bukleler
        ctx.fillStyle = PAL.maneGlint;
        [[-8, -12], [0, -14], [8, -12]].forEach(([tx, ty]) => {
            ctx.beginPath();
            ctx.ellipse(tx, ty, 2.5, 4.0, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    // =========================================================================
    // 5 AYRI GÖRÜNÜM AÇISI (SIDE, QUARTER-FRONT, FRONT, QUARTER-BACK, BACK)
    // =========================================================================

    if (isSitting) {
        // ------------------------- SITTING -------------------------
        const torsoY = -6 + breath * 2;

        if (view === 'front') {
            // Tam Ön Oturma: Asil Sfinks Duruşu
            // İki uyluk kıvrılmış
            [-12, 12].forEach(hx => {
                ctx.fillStyle = PAL.coatShade;
                ctx.beginPath();
                ctx.ellipse(hx, 0, 8.0, 5.2, 0, 0, Math.PI * 2);
                ctx.fill();
            });

            // Dik gövde
            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, torsoY, 13.5, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Krem göğüs
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.ellipse(0, torsoY + 2, 7.2, 9.0, 0, 0, Math.PI * 2);
            ctx.fill();

            // Ön patiler
            drawPaw(-6, 2, true, false);
            drawPaw(6, 2, true, false);

            // Yele ve Kafa
            const headY = torsoY - 14;
            drawManeRuff(0, headY + 3, 1.15, 1.15, false);

            // Baş
            ctx.fillStyle = PAL.coatHighlight;
            ctx.beginPath();
            ctx.ellipse(0, headY - 1, 10, 8.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Kulaklar
            [-7.5, 7.5].forEach(ex => {
                ctx.fillStyle = PAL.coatDeep;
                ctx.beginPath();
                ctx.arc(ex, headY - 8.5, 3.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = PAL.creamLight;
                ctx.beginPath();
                ctx.arc(ex, headY - 8.5, 1.8, 0, Math.PI * 2);
                ctx.fill();
            });

            // Gözler
            [-4.2, 4.2].forEach(gx => {
                ctx.fillStyle = PAL.eyeRim;
                ctx.beginPath();
                ctx.ellipse(gx, headY - 2.5, 2.2, 1.8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = PAL.eyeAmber;
                ctx.beginPath();
                ctx.arc(gx, headY - 2.5, 1.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = PAL.eyePupil;
                ctx.beginPath();
                ctx.arc(gx, headY - 2.5, 0.7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = PAL.eyeHigh;
                ctx.fillRect(gx - 0.3, headY - 3.1, 0.5, 0.5);
            });

            // Krem Namlu & Burun
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.ellipse(-2.8, headY + 2.8, 3.8, 3.0, -0.1, 0, Math.PI * 2);
            ctx.ellipse(2.8, headY + 2.8, 3.8, 3.0, 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.noseLeather;
            ctx.beginPath();
            ctx.moveTo(-2.2, headY + 1.0);
            ctx.lineTo(2.2, headY + 1.0);
            ctx.lineTo(0, headY + 3.0);
            ctx.closePath();
            ctx.fill();

            // Çene Sakalı
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.ellipse(0, headY + 5.5, 2.8, 2.0, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sağdan kıvrılan kuyruk
            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.4;
            ctx.beginPath();
            ctx.moveTo(6, 1);
            ctx.quadraticCurveTo(16, 2, 23, 4);
            ctx.stroke();
            ctx.fillStyle = PAL.maneDeep;
            ctx.beginPath();
            ctx.ellipse(24, 4.5, 4.2, 7.5, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else if (view === 'quarter-front') {
            // 3/4 Oturma (Koltuk Standartı!)
            // Arka kıvrılmış uyluk
            ctx.fillStyle = PAL.coatShade;
            ctx.beginPath();
            ctx.ellipse(-10, 0, 9.0, 5.8, -0.1, 0, Math.PI * 2);
            ctx.fill();

            // Gövde
            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, torsoY, 13, 12, 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Krem göğüs
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.ellipse(2, torsoY + 2, 7.0, 8.5, 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Ön patiler
            drawPaw(2, 2, true, true);
            drawPaw(8, 2, true, false);

            const headX = 6;
            const headY = torsoY - 13;
            drawManeRuff(headX, headY + 3, 1.1, 1.1, false);

            // Baş
            ctx.fillStyle = PAL.coatHighlight;
            ctx.beginPath();
            ctx.ellipse(headX + 1, headY - 1, 9.8, 8.5, 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Kulaklar
            ctx.fillStyle = PAL.coatDeep;
            ctx.beginPath();
            ctx.arc(headX - 4, headY - 8, 3.0, 0, Math.PI * 2);
            ctx.arc(headX + 5, headY - 8.5, 3.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.arc(headX + 5, headY - 8.5, 1.9, 0, Math.PI * 2);
            ctx.fill();

            // Yüz detayları (3/4 perspektif)
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.ellipse(headX + 4.0, headY + 2.5, 4.8, 3.6, 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.noseLeather;
            ctx.beginPath();
            ctx.moveTo(headX + 3.5, headY + 0.5);
            ctx.lineTo(headX + 6.5, headY + 1.2);
            ctx.lineTo(headX + 4.2, headY + 2.5);
            ctx.closePath();
            ctx.fill();

            // Gözler
            ctx.fillStyle = PAL.eyeRim;
            ctx.beginPath();
            ctx.ellipse(headX + 3.8, headY - 2.6, 2.3, 1.8, 0.05, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyeAmber;
            ctx.beginPath();
            ctx.arc(headX + 3.8, headY - 2.6, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyePupil;
            ctx.beginPath();
            ctx.arc(headX + 3.9, headY - 2.6, 0.75, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyeHigh;
            ctx.fillRect(headX + 3.7, headY - 3.2, 0.5, 0.5);

            // Uzak göz
            ctx.fillStyle = PAL.eyeRim;
            ctx.beginPath();
            ctx.arc(headX - 1.8, headY - 2.8, 1.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyeAmber;
            ctx.beginPath();
            ctx.arc(headX - 1.8, headY - 2.8, 1.0, 0, Math.PI * 2);
            ctx.fill();

            // Kuyruk
            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.4;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.quadraticCurveTo(-18, 1, -22, 4);
            ctx.stroke();
            ctx.fillStyle = PAL.maneDeep;
            ctx.beginPath();
            ctx.ellipse(-23, 4.5, 4.2, 7.0, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else if (view === 'side') {
            // Yandan Oturma
            ctx.fillStyle = PAL.coatShade;
            ctx.beginPath();
            ctx.ellipse(-12, 0, 10, 6.0, -0.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(-2, torsoY, 13, 12, 0.15, 0, Math.PI * 2);
            ctx.fill();

            drawPaw(8, 2, true, false);

            const headX = 9;
            const headY = torsoY - 13;
            drawManeRuff(headX, headY + 3, 1.05, 1.1, true);

            // Baş Yan Profil
            ctx.fillStyle = PAL.coatHighlight;
            ctx.beginPath();
            ctx.moveTo(headX - 3, headY - 5);
            ctx.lineTo(headX + 3, headY - 7);
            ctx.lineTo(headX + 11, headY - 3);
            ctx.quadraticCurveTo(headX + 14, headY - 2, headX + 14, headY + 1);
            ctx.lineTo(headX + 9, headY + 3);
            ctx.lineTo(headX + 3, headY + 2);
            ctx.lineTo(headX + 8, headY + 5);
            ctx.lineTo(headX + 1, headY + 5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.ellipse(headX + 8, headY + 1, 4.5, 3.0, 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.noseLeather;
            ctx.beginPath();
            ctx.moveTo(headX + 11, headY - 2);
            ctx.lineTo(headX + 14, headY + 0.5);
            ctx.lineTo(headX + 11.5, headY + 1.8);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = PAL.eyeAmber;
            ctx.beginPath();
            ctx.arc(headX + 5, headY - 3.2, 1.5, 0, Math.PI * 2);
            ctx.fill();

            // Kulak
            ctx.fillStyle = PAL.coatDeep;
            ctx.beginPath();
            ctx.arc(headX - 1, headY - 8.5, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Kuyruk
            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.4;
            ctx.beginPath();
            ctx.moveTo(-14, 0);
            ctx.quadraticCurveTo(-22, 1, -26, 4);
            ctx.stroke();
            ctx.fillStyle = PAL.maneDeep;
            ctx.beginPath();
            ctx.ellipse(-27, 4.5, 4.2, 7.0, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else {
            // Arkadan Oturma (back / quarter-back)
            ctx.fillStyle = PAL.coatDeep;
            [-11, 11].forEach(hx => {
                ctx.beginPath();
                ctx.ellipse(hx, 0, 7.5, 5.0, 0, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, torsoY, 13, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            const headY = torsoY - 14;
            drawManeRuff(0, headY + 3, 1.15, 1.15, false);

            [-6.5, 6.5].forEach(ex => {
                ctx.fillStyle = PAL.coatDark;
                ctx.beginPath();
                ctx.arc(ex, headY - 8.5, 3.2, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.4;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(8, 2, 14, 4);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
        return;
    }

    // ------------------------- STANDING & MOVING -------------------------
    const bodyY = -11 + prowlBob;

    if (view === 'side') {
        // YAN PROFİL
        drawLeg(-14, bodyY + 3, -15, 0, true, true, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);
        drawLeg(11, bodyY + 3, 12, 0, false, true, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawTail(-18, bodyY - 1);

        const tg = ctx.createLinearGradient(-18, bodyY - 10, 14, bodyY + 8);
        tg.addColorStop(0, PAL.coatBase);
        tg.addColorStop(0.3, PAL.coatHighlight);
        tg.addColorStop(0.7, PAL.coatBase);
        tg.addColorStop(1, PAL.coatDeep);
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.moveTo(-18, bodyY - 2);
        ctx.quadraticCurveTo(-14, bodyY - 10, -2, bodyY - 8);
        ctx.quadraticCurveTo(8, bodyY - 9, 14, bodyY - 1);
        ctx.quadraticCurveTo(16, bodyY + 7, 10, bodyY + 8);
        ctx.quadraticCurveTo(0, bodyY + 8, -6, bodyY + 3);
        ctx.quadraticCurveTo(-14, bodyY + 7, -18, bodyY + 3);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.creamBase;
        ctx.beginPath();
        ctx.moveTo(8, bodyY + 7.5);
        ctx.quadraticCurveTo(0, bodyY + 7.5, -6, bodyY + 3);
        ctx.quadraticCurveTo(0, bodyY + 4, 8, bodyY + 7.5);
        ctx.fill();

        drawLeg(-14, bodyY + 3, -13, 0, true, false, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawLeg(11, bodyY + 3, 14, 0, false, false, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);

        const headX = 13;
        const headY = bodyY - 12 + breath * 2;
        drawManeRuff(headX, headY + 3, 1.05, 1.1, true);

        // Kafa Yan Profil
        ctx.fillStyle = PAL.coatHighlight;
        ctx.beginPath();
        ctx.moveTo(headX - 3, headY - 5);
        ctx.lineTo(headX + 3, headY - 7);
        ctx.lineTo(headX + 11, headY - 3);
        ctx.quadraticCurveTo(headX + 14, headY - 2, headX + 14, headY + 1);
        ctx.lineTo(headX + 9, headY + 3);
        ctx.lineTo(headX + 3, headY + 2);
        ctx.lineTo(headX + 8, headY + 5);
        ctx.lineTo(headX + 1, headY + 5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.ellipse(headX + 8, headY + 1, 4.5, 3.0, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.noseLeather;
        ctx.beginPath();
        ctx.moveTo(headX + 11, headY - 2);
        ctx.lineTo(headX + 14, headY + 0.5);
        ctx.lineTo(headX + 11.5, headY + 1.8);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.eyeAmber;
        ctx.beginPath();
        ctx.arc(headX + 5, headY - 3.2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.coatDeep;
        ctx.beginPath();
        ctx.arc(headX - 1, headY - 8.5, 3.2, 0, Math.PI * 2);
        ctx.fill();

    } else if (view === 'quarter-front') {
        // 2.5D ÇEYREK ÖN (ASIL AÇI)
        drawLeg(-14, bodyY + 2, -15, 0, true, true, -stride * 0.7, isMoving ? Math.max(0, -stride) * 0.5 : 0);
        drawLeg(4, bodyY + 3, 5, 0, false, true, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);
        drawTail(-18, bodyY);

        const tg = ctx.createLinearGradient(-18, bodyY - 10, 12, bodyY + 8);
        tg.addColorStop(0, PAL.coatBase);
        tg.addColorStop(0.3, PAL.coatHighlight);
        tg.addColorStop(0.7, PAL.coatBase);
        tg.addColorStop(1, PAL.coatDeep);
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.moveTo(-18, bodyY - 2);
        ctx.quadraticCurveTo(-12, bodyY - 11, 2, bodyY - 9);
        ctx.quadraticCurveTo(12, bodyY - 8, 14, bodyY);
        ctx.quadraticCurveTo(14, bodyY + 8, 4, bodyY + 8);
        ctx.quadraticCurveTo(-6, bodyY + 7, -12, bodyY + 4);
        ctx.quadraticCurveTo(-16, bodyY + 5, -18, bodyY + 1);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.creamBase;
        ctx.beginPath();
        ctx.moveTo(2, bodyY + 7);
        ctx.quadraticCurveTo(-4, bodyY + 7, -10, bodyY + 4);
        ctx.quadraticCurveTo(-4, bodyY + 4.5, 2, bodyY + 7);
        ctx.fill();

        drawLeg(-10, bodyY + 4, -9, 0, true, false, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawLeg(10, bodyY + 4, 12, 0, false, false, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);

        const headX = 9;
        const headY = bodyY - 13 + breath * 2;
        drawManeRuff(headX, headY + 3, 1.12, 1.15, false);

        // Kafa (3/4 Açılı)
        ctx.fillStyle = PAL.coatHighlight;
        ctx.beginPath();
        ctx.ellipse(headX + 1, headY - 1, 9.8, 8.5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.coatDeep;
        ctx.beginPath();
        ctx.arc(headX - 4, headY - 8, 3.0, 0, Math.PI * 2);
        ctx.arc(headX + 5, headY - 8.5, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.arc(headX + 5, headY - 8.5, 1.9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.ellipse(headX + 4.0, headY + 2.5, 4.8, 3.6, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.noseLeather;
        ctx.beginPath();
        ctx.moveTo(headX + 3.5, headY + 0.5);
        ctx.lineTo(headX + 6.5, headY + 1.2);
        ctx.lineTo(headX + 4.2, headY + 2.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.eyeRim;
        ctx.beginPath();
        ctx.ellipse(headX + 3.8, headY - 2.6, 2.3, 1.8, 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.eyeAmber;
        ctx.beginPath();
        ctx.arc(headX + 3.8, headY - 2.6, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.eyePupil;
        ctx.beginPath();
        ctx.arc(headX + 3.9, headY - 2.6, 0.75, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.eyeHigh;
        ctx.fillRect(headX + 3.7, headY - 3.2, 0.5, 0.5);

        ctx.fillStyle = PAL.eyeRim;
        ctx.beginPath();
        ctx.arc(headX - 1.8, headY - 2.8, 1.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.eyeAmber;
        ctx.beginPath();
        ctx.arc(headX - 1.8, headY - 2.8, 1.0, 0, Math.PI * 2);
        ctx.fill();

    } else if (view === 'front') {
        // TAM ÖN
        drawLeg(-12, bodyY + 4, -13, 0, true, true, -stride * 0.6, isMoving ? Math.max(0, -stride) * 0.4 : 0);
        drawLeg(12, bodyY + 4, 13, 0, true, true, stride * 0.6, isMoving ? Math.max(0, stride) * 0.4 : 0);
        drawTail(6, bodyY + 4);

        const cg = ctx.createLinearGradient(0, bodyY - 10, 0, bodyY + 10);
        cg.addColorStop(0, PAL.coatHighlight);
        cg.addColorStop(0.5, PAL.coatBase);
        cg.addColorStop(1, PAL.coatDeep);
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.ellipse(0, bodyY + 1, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.ellipse(0, bodyY + 2, 7.5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        drawLeg(-8, bodyY + 4, -8, 0, false, false, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);
        drawLeg(8, bodyY + 4, 8, 0, false, false, -stride * 0.7, isMoving ? Math.max(0, -stride) * 0.5 : 0);

        const headY = bodyY - 14 + breath * 2;
        drawManeRuff(0, headY + 3, 1.2, 1.2, false);

        ctx.fillStyle = PAL.coatHighlight;
        ctx.beginPath();
        ctx.ellipse(0, headY - 1, 10, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();

        [-7.5, 7.5].forEach(ex => {
            ctx.fillStyle = PAL.coatDeep;
            ctx.beginPath();
            ctx.arc(ex, headY - 8.5, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.arc(ex, headY - 8.5, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        [-4.2, 4.2].forEach(gx => {
            ctx.fillStyle = PAL.eyeRim;
            ctx.beginPath();
            ctx.ellipse(gx, headY - 2.5, 2.2, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyeAmber;
            ctx.beginPath();
            ctx.arc(gx, headY - 2.5, 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyePupil;
            ctx.beginPath();
            ctx.arc(gx, headY - 2.5, 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyeHigh;
            ctx.fillRect(gx - 0.3, headY - 3.1, 0.5, 0.5);
        });

        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.ellipse(-2.8, headY + 2.8, 3.8, 3.0, -0.1, 0, Math.PI * 2);
        ctx.ellipse(2.8, headY + 2.8, 3.8, 3.0, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.noseLeather;
        ctx.beginPath();
        ctx.moveTo(-2.2, headY + 1.0);
        ctx.lineTo(2.2, headY + 1.0);
        ctx.lineTo(0, headY + 3.0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.ellipse(0, headY + 5.5, 2.8, 2.0, 0, 0, Math.PI * 2);
        ctx.fill();

    } else if (view === 'quarter-back') {
        // ÇEYREK ARKA
        drawLeg(10, bodyY + 3, 11, 0, false, true, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);

        const headX = 8;
        const headY = bodyY - 13 + breath * 2;
        drawManeRuff(headX, headY + 3, 1.1, 1.15, true);

        ctx.fillStyle = PAL.coatDark;
        ctx.beginPath();
        ctx.arc(headX - 5, headY - 8.5, 3.2, 0, Math.PI * 2);
        ctx.arc(headX + 4, headY - 9, 3.4, 0, Math.PI * 2);
        ctx.fill();

        const tg = ctx.createLinearGradient(-18, bodyY - 10, 10, bodyY + 8);
        tg.addColorStop(0, PAL.coatBase);
        tg.addColorStop(0.3, PAL.coatHighlight);
        tg.addColorStop(1, PAL.coatDeep);
        ctx.fillStyle = tg;
        ctx.beginPath();
        ctx.moveTo(-18, bodyY - 2);
        ctx.quadraticCurveTo(-12, bodyY - 11, 2, bodyY - 9);
        ctx.quadraticCurveTo(10, bodyY - 8, 12, bodyY);
        ctx.quadraticCurveTo(10, bodyY + 8, 2, bodyY + 7);
        ctx.quadraticCurveTo(-6, bodyY + 6, -14, bodyY + 4);
        ctx.quadraticCurveTo(-18, bodyY + 3, -18, bodyY - 2);
        ctx.closePath();
        ctx.fill();

        drawLeg(-10, bodyY + 4, -9, 0, true, false, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawLeg(4, bodyY + 4, 6, 0, false, false, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);
        drawTail(-17, bodyY);

    } else { // back
        // TAM ARKA
        drawLeg(-7, bodyY + 4, -7, 0, false, true, stride * 0.6, isMoving ? Math.max(0, stride) * 0.4 : 0);
        drawLeg(7, bodyY + 4, 7, 0, false, true, -stride * 0.6, isMoving ? Math.max(0, -stride) * 0.4 : 0);

        const headY = bodyY - 14 + breath * 2;
        drawManeRuff(0, headY + 3, 1.2, 1.2, false);

        [-6.5, 6.5].forEach(ex => {
            ctx.fillStyle = PAL.coatDark;
            ctx.beginPath();
            ctx.arc(ex, headY - 8.5, 3.2, 0, Math.PI * 2);
            ctx.fill();
        });

        const bg = ctx.createLinearGradient(0, bodyY - 10, 0, bodyY + 8);
        bg.addColorStop(0, PAL.coatHighlight);
        bg.addColorStop(0.5, PAL.coatBase);
        bg.addColorStop(1, PAL.coatDeep);
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.ellipse(0, bodyY + 2, 13.5, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        drawLeg(-10, bodyY + 4, -10, 0, true, false, -stride * 0.7, isMoving ? Math.max(0, -stride) * 0.5 : 0);
        drawLeg(10, bodyY + 4, 10, 0, true, false, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);
        drawTail(0, bodyY + 2);
    }

    ctx.restore();
};
`;

async function run() {
    const port = 9265;
    console.log('Spawning headless Edge on port ' + port + '...');
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const edge = spawn(edgePath, [
        `--remote-debugging-port=${port}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        'http://localhost:3000'
    ]);

    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        try {
            const data = await new Promise((resolve, reject) => {
                http.get(`http://127.0.0.1:${port}/json`, (res) => {
                    let body = '';
                    res.on('data', c => body += c);
                    res.on('end', () => resolve(body));
                }).on('error', reject);
            });
            const targets = JSON.parse(data);
            const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
            if (page) {
                wsUrl = page.webSocketDebuggerUrl;
                break;
            }
        } catch (_) {}
    }

    if (!wsUrl) {
        console.error('Edge WS URL not found');
        edge.kill();
        process.exit(1);
    }

    const ws = new WebSocket(wsUrl);
    let id = 1;
    function send(method, params = {}) {
        return new Promise((resolve) => {
            const curId = id++;
            const handler = (msg) => {
                const data = JSON.parse(msg);
                if (data.id === curId) {
                    ws.off('message', handler);
                    resolve(data.result);
                }
            };
            ws.on('message', handler);
            ws.send(JSON.stringify({ id: curId, method, params }));
        });
    }

    ws.on('open', async () => {
        await new Promise(r => setTimeout(r, 1500));

        await send('Runtime.evaluate', { expression: lionCode });

        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const cvs = document.createElement('canvas');
                cvs.width = 900;
                cvs.height = 360;
                const ctx = cvs.getContext('2d');
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, cvs.width, cvs.height);

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('🦁 Savana Kralı Aslan - 2.5D İzometrik 8 Yönlü Showcase (V2)', 20, 30);

                const dirs = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '13px sans-serif';
                ctx.fillText('Hareket / Yürüyüş Modu (8 Yön):', 20, 60);

                dirs.forEach((dir, i) => {
                    ctx.save();
                    const x = 60 + i * 105;
                    const y = 145;
                    ctx.translate(x, y);
                    window.testSculptedLion(ctx, dir, true, i * 0.9, false);
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(dir, 0, 36);
                    ctx.restore();
                });

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '13px sans-serif';
                ctx.fillText('Dinlenme / Oturma Modu (Sfinks & Koltuk Standartları):', 20, 220);

                const sitDirs = ['down', 'down-right', 'right', 'up-right', 'up'];
                sitDirs.forEach((dir, i) => {
                    ctx.save();
                    const x = 90 + i * 170;
                    const y = 295;
                    ctx.translate(x, y);
                    window.testSculptedLion(ctx, dir, false, 0, true);
                    ctx.fillStyle = '#fde047';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Oturma: ' + dir, 0, 36);
                    ctx.restore();
                });

                return cvs.toDataURL('image/png');
            })()`,
            returnByValue: true
        });

        if (res && res.result && res.result.value) {
            const base64Data = res.result.value.replace(/^data:image\/png;base64,/, "");
            const outPath = path.join('C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'sculpted_lion_preview_v2.png');
            fs.writeFileSync(outPath, base64Data, 'base64');
            console.log('Saved preview to:', outPath);
        }

        ws.close();
        edge.kill();
        process.exit(0);
    });
}

run().catch(e => { console.error(e); process.exit(1); });

