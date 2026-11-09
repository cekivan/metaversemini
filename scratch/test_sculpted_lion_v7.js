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

    const stride = isMoving ? Math.sin(cycle * 1.5) * 5.0 : 0;
    const stepBob = isMoving ? Math.abs(Math.sin(cycle * 1.5)) * 1.6 : 0;
    const breath = Math.sin(time / 550) * 0.04;
    const prowlBob = isMoving ? Math.sin(cycle * 3.0) * 0.7 : Math.sin(time / 650) * 0.4;

    const tailCycle = isMoving ? cycle * 1.3 : time / 450;
    const tailSway = Math.sin(tailCycle) * (isMoving ? 6.0 : 2.5);
    const tailTuftSway = Math.cos(tailCycle - 0.4) * (isMoving ? 7.5 : 3.5);

    const PAL = {
        coatHighlight: '#fde047',
        coatBase:      '#f59e0b',
        coatShade:     '#d97706',
        coatDeep:      '#9a3412',
        coatDark:      '#451a03',

        creamLight:    '#fffbeb',
        creamBase:     '#fef3c7',
        creamShade:    '#fde68a',

        maneGlint:     '#fef08a',
        maneGold:      '#f59e0b',
        maneAmber:     '#d97706',
        maneAuburn:    '#b45309',
        maneChestnut:  '#78350f',
        maneShadow:    '#381404',

        eyeAmber:      '#f59e0b',
        eyePupil:      '#0f0502',
        eyeHigh:       '#ffffff',
        eyeRim:        '#1c0a03',

        noseLeather:   '#451a03',
        noseHighlight: '#78350f',
        mouthDark:     '#290e03',
        tonguePink:    '#f43f5e',

        pawPad:        '#451a03',
        clawDark:      '#1c1917'
    };

    ctx.save();
    ctx.scale(mirror * 1.30, 1.30);

    // Zemin Temas Gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.26)";
    ctx.beginPath();
    ctx.ellipse(0, 3, isSitting ? 28 : 26, isSitting ? 12 : 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(0, 0, 0, 0.44)";
    ctx.beginPath();
    ctx.ellipse(0, 2, isSitting ? 16 : 14, isSitting ? 6.5 : 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    function drawPaw(px, py, isFront, isFar) {
        ctx.save();
        ctx.translate(px, py);
        ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
        ctx.beginPath();
        ctx.ellipse(0, 1.0, isFront ? 5.0 : 4.4, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        const baseCol = isFar ? PAL.coatShade : PAL.coatBase;
        const lightCol = isFar ? PAL.coatBase : PAL.coatHighlight;

        const pGrad = ctx.createLinearGradient(0, -3, 0, 2);
        pGrad.addColorStop(0, lightCol);
        pGrad.addColorStop(1, baseCol);
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.ellipse(0, -0.6, isFront ? 4.8 : 4.2, 2.6, 0, 0, Math.PI * 2);
        ctx.fill();

        [-2.8, -0.9, 0.9, 2.8].forEach(ox => {
            ctx.fillStyle = lightCol;
            ctx.beginPath();
            ctx.arc(ox, 0.2, 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.coatDark;
            ctx.fillRect(ox - 0.2, 0.7, 0.4, 0.7);
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

            const tGrad = ctx.createLinearGradient(hipX - 6, hipY, hipX + 6, curPawY);
            tGrad.addColorStop(0, lightCol);
            tGrad.addColorStop(0.5, baseCol);
            tGrad.addColorStop(1, deepCol);

            ctx.fillStyle = tGrad;
            ctx.beginPath();
            ctx.moveTo(hipX - 5.5, hipY);
            ctx.quadraticCurveTo(hipX - 8.5, hockY - 3, hockX - 2.5, hockY);
            ctx.lineTo(curPawX - 2.4, curPawY - 1.2);
            ctx.lineTo(curPawX + 2.8, curPawY - 1.2);
            ctx.quadraticCurveTo(hockX + 3.5, hockY, hipX + 5.0, hipY + 2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = lightCol;
            ctx.beginPath();
            ctx.arc(hockX - 1.0, hockY, 1.5, 0, Math.PI * 2);
            ctx.fill();
        } else {
            const elbowX = (hipX + curPawX) * 0.5;
            const elbowY = (hipY + curPawY) * 0.48;

            const aGrad = ctx.createLinearGradient(hipX - 5, hipY, hipX + 5, curPawY);
            aGrad.addColorStop(0, lightCol);
            aGrad.addColorStop(0.5, baseCol);
            aGrad.addColorStop(1, deepCol);

            ctx.fillStyle = aGrad;
            ctx.beginPath();
            ctx.moveTo(hipX - 4.5, hipY);
            ctx.quadraticCurveTo(elbowX - 3.8, elbowY, curPawX - 2.6, curPawY - 1.2);
            ctx.lineTo(curPawX + 2.8, curPawY - 1.2);
            ctx.quadraticCurveTo(elbowX + 3.8, elbowY, hipX + 4.5, hipY);
            ctx.closePath();
            ctx.fill();
        }

        drawPaw(curPawX, curPawY, !isHind, isFar);
        ctx.restore();
    }

    // Akıcı Kavisli Kuyruk
    function drawTail(rootX, rootY, curveDirection) {
        ctx.save();
        const dir = curveDirection || -1;
        const midX = rootX + dir * (8 + tailSway * 0.4);
        const midY = rootY + 6;
        const tipX = rootX + dir * (15 + tailTuftSway * 0.6);
        const tipY = rootY + 11 + tailSway * 0.6;

        ctx.strokeStyle = PAL.coatShade;
        ctx.lineWidth = 3.6;
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
        ctx.rotate(dir * 0.35 + tailSway * 0.08);

        ctx.fillStyle = PAL.maneShadow;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.6, 8.5, -0.4, 0, Math.PI * 2);
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

    // =========================================================================
    // HEYBETLİ, DOĞAL & ZENGİN ASLAN YELESİ (Organic Sculpted Mane)
    // =========================================================================
    function drawTuftedManeFront(mx, my, scaleX, scaleY) {
        ctx.save();
        ctx.translate(mx, my);
        ctx.scale(scaleX, scaleY);

        // 1. Dış Koyu Astar
        ctx.fillStyle = PAL.maneShadow;
        ctx.beginPath();
        ctx.moveTo(0, -19);
        ctx.quadraticCurveTo(5, -21, 9, -17);
        ctx.quadraticCurveTo(14, -19, 17, -13);
        ctx.quadraticCurveTo(24, -12, 23, -4);
        ctx.quadraticCurveTo(27, 2, 22, 8);
        ctx.quadraticCurveTo(24, 15, 16, 18);
        ctx.quadraticCurveTo(14, 23, 5, 23);
        ctx.quadraticCurveTo(0, 27, -5, 23);
        ctx.quadraticCurveTo(-14, 23, -16, 18);
        ctx.quadraticCurveTo(-24, 15, -22, 8);
        ctx.quadraticCurveTo(-27, 2, -23, -4);
        ctx.quadraticCurveTo(-24, -12, -17, -13);
        ctx.quadraticCurveTo(-14, -19, -9, -17);
        ctx.quadraticCurveTo(-5, -21, 0, -19);
        ctx.closePath();
        ctx.fill();

        // 2. Kehribar / Kızıl / Altın Zengin Gradyan
        const mGrad = ctx.createRadialGradient(-2, -3, 4, 0, 2, 23);
        mGrad.addColorStop(0, PAL.maneGold);
        mGrad.addColorStop(0.45, PAL.maneAmber);
        mGrad.addColorStop(0.8, PAL.maneAuburn);
        mGrad.addColorStop(1, PAL.maneChestnut);
        ctx.fillStyle = mGrad;

        ctx.beginPath();
        ctx.moveTo(0, -17);
        ctx.quadraticCurveTo(4, -19, 8, -15);
        ctx.quadraticCurveTo(12, -17, 15, -11);
        ctx.quadraticCurveTo(21, -10, 20, -3);
        ctx.quadraticCurveTo(23, 2, 19, 7);
        ctx.quadraticCurveTo(21, 13, 14, 16);
        ctx.quadraticCurveTo(12, 20, 4, 20);
        ctx.quadraticCurveTo(0, 24, -4, 20);
        ctx.quadraticCurveTo(-12, 20, -14, 16);
        ctx.quadraticCurveTo(-21, 13, -19, 7);
        ctx.quadraticCurveTo(-23, 2, -20, -3);
        ctx.quadraticCurveTo(-21, -10, -15, -11);
        ctx.quadraticCurveTo(-12, -17, -8, -15);
        ctx.quadraticCurveTo(-4, -19, 0, -17);
        ctx.closePath();
        ctx.fill();

        // 3. Tüy Bukle Hatları
        ctx.strokeStyle = "rgba(254, 240, 138, 0.40)";
        ctx.lineWidth = 1.1;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(-6, -14); ctx.quadraticCurveTo(-14, -11, -15, -3);
        ctx.moveTo(-11, -3); ctx.quadraticCurveTo(-18, 2, -17, 9);
        ctx.moveTo(-9, 7);   ctx.quadraticCurveTo(-13, 13, -8, 17);

        ctx.moveTo(6, -14);  ctx.quadraticCurveTo(14, -11, 15, -3);
        ctx.moveTo(11, -3);  ctx.quadraticCurveTo(18, 2, 17, 9);
        ctx.moveTo(9, 7);    ctx.quadraticCurveTo(13, 13, 8, 17);

        ctx.moveTo(0, 14);   ctx.quadraticCurveTo(0, 19, 0, 23);
        ctx.stroke();

        ctx.restore();
    }

    // YAN PROFİL YELESİ
    function drawTuftedManeSide(mx, my, scaleX, scaleY) {
        ctx.save();
        ctx.translate(mx, my);
        ctx.scale(scaleX, scaleY);

        ctx.fillStyle = PAL.maneShadow;
        ctx.beginPath();
        ctx.moveTo(4, -18);
        ctx.quadraticCurveTo(-7, -20, -15, -12);
        ctx.quadraticCurveTo(-24, -4, -22, 6);
        ctx.quadraticCurveTo(-26, 14, -16, 20);
        ctx.quadraticCurveTo(-6, 24, 3, 21);
        ctx.quadraticCurveTo(11, 16, 12, 8);
        ctx.quadraticCurveTo(16, 0, 12, -8);
        ctx.quadraticCurveTo(10, -16, 4, -18);
        ctx.closePath();
        ctx.fill();

        const mGrad = ctx.createLinearGradient(10, -12, -18, 16);
        mGrad.addColorStop(0, PAL.maneGold);
        mGrad.addColorStop(0.4, PAL.maneAmber);
        mGrad.addColorStop(0.8, PAL.maneAuburn);
        mGrad.addColorStop(1, PAL.maneChestnut);
        ctx.fillStyle = mGrad;

        ctx.beginPath();
        ctx.moveTo(3, -16);
        ctx.quadraticCurveTo(-6, -17, -12, -10);
        ctx.quadraticCurveTo(-19, -3, -18, 5);
        ctx.quadraticCurveTo(-21, 12, -13, 17);
        ctx.quadraticCurveTo(-5, 20, 2, 18);
        ctx.quadraticCurveTo(9, 14, 10, 7);
        ctx.quadraticCurveTo(13, 0, 10, -7);
        ctx.quadraticCurveTo(8, -14, 3, -16);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "rgba(254, 240, 138, 0.40)";
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(0, -12);   ctx.quadraticCurveTo(-10, -9, -13, 0);
        ctx.moveTo(-6, -1);   ctx.quadraticCurveTo(-14, 6, -10, 14);
        ctx.moveTo(-2, 8);    ctx.quadraticCurveTo(2, 14, -1, 18);
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // SEVİMLİ & ASİL ASLAN YÜZÜ
    // =========================================================================
    function drawLionFace(fx, fy, angleOffset) {
        ctx.save();
        ctx.translate(fx, fy);

        // Kulaklar (Yelenin üst iki köşesinden doğal taşan asil kulaklar)
        [-9.5, 9.5].forEach((ex, idx) => {
            const earX = ex + angleOffset * 1.5;
            const earY = -12.5;
            ctx.fillStyle = PAL.coatDeep;
            ctx.beginPath();
            ctx.arc(earX, earY, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.creamBase;
            ctx.beginPath();
            ctx.arc(earX, earY, 2.4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Kafa Kubbesi
        const hGrad = ctx.createRadialGradient(-2, -3, 2, 0, 0, 12);
        hGrad.addColorStop(0, PAL.coatHighlight);
        hGrad.addColorStop(0.6, PAL.coatBase);
        hGrad.addColorStop(1, PAL.coatShade);
        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.ellipse(angleOffset * 1.5, -2, 10.5, 9.5, angleOffset * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Gözler: İri Avcı Gözleri
        const eyeSpacing = 4.2;
        [-eyeSpacing, eyeSpacing].forEach((gx, idx) => {
            const eyeX = gx + angleOffset * 2.0;
            const eyeY = -4.0;

            ctx.fillStyle = PAL.eyeRim;
            ctx.beginPath();
            ctx.ellipse(eyeX, eyeY, 2.8, 2.4, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.eyeAmber;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 2.0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.eyePupil;
            ctx.beginPath();
            ctx.arc(eyeX + (angleOffset > 0 ? 0.3 : (angleOffset < 0 ? -0.3 : 0)), eyeY, 1.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.eyeHigh;
            ctx.beginPath();
            ctx.arc(eyeX - 0.5, eyeY - 0.6, 0.65, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(eyeX + 0.6, eyeY + 0.5, 0.35, 0, Math.PI * 2);
            ctx.fill();
        });

        // Pofuduk Krem Namlu & Bıyık Yastıkları
        const mX = angleOffset * 2.5;
        const mY = 1.8;

        ctx.fillStyle = PAL.creamBase;
        ctx.beginPath();
        ctx.ellipse(mX - 2.8, mY + 0.4, 4.2, 3.2, -0.1, 0, Math.PI * 2);
        ctx.ellipse(mX + 2.8, mY + 0.4, 4.2, 3.2, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Koyu Deri Burun
        ctx.fillStyle = PAL.noseLeather;
        ctx.beginPath();
        ctx.moveTo(mX - 2.4, mY - 1.2);
        ctx.lineTo(mX + 2.4, mY - 1.2);
        ctx.lineTo(mX, mY + 1.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.noseHighlight;
        ctx.fillRect(mX - 1.2, mY - 1.2, 2.4, 0.7);

        // Ağız
        ctx.strokeStyle = PAL.mouthDark;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mX, mY + 1.2);
        ctx.lineTo(mX, mY + 3.0);
        ctx.moveTo(mX - 2.6, mY + 2.6);
        ctx.quadraticCurveTo(mX, mY + 3.4, mX + 2.6, mY + 2.6);
        ctx.stroke();

        // Çene Sakalı
        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.ellipse(mX, mY + 4.8, 2.5, 1.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Bıyık Noktaları
        ctx.fillStyle = PAL.coatDark;
        [-3.8, -2.0, 2.0, 3.8].forEach(bx => {
            ctx.fillRect(mX + bx, mY + 0.6, 0.5, 0.5);
            ctx.fillRect(mX + bx * 0.8, mY + 1.5, 0.5, 0.5);
        });

        // Bıyık Telleri
        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(mX - 4, mY + 0.8); ctx.lineTo(mX - 11, mY + 0.2);
        ctx.moveTo(mX - 4, mY + 1.8); ctx.lineTo(mX - 10, mY + 3.5);
        ctx.moveTo(mX + 4, mY + 0.8); ctx.lineTo(mX + 11, mY + 0.2);
        ctx.moveTo(mX + 4, mY + 1.8); ctx.lineTo(mX + 10, mY + 3.5);
        ctx.stroke();

        ctx.restore();
    }

    // YAN PROFİL BAŞI
    function drawLionHeadSide(hx, hy) {
        ctx.save();
        ctx.translate(hx, hy);

        ctx.fillStyle = PAL.coatDeep;
        ctx.beginPath();
        ctx.arc(-2, -12, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = PAL.creamBase;
        ctx.beginPath();
        ctx.arc(-2, -12, 2.4, 0, Math.PI * 2);
        ctx.fill();

        const hGrad = ctx.createLinearGradient(-6, -10, 12, 6);
        hGrad.addColorStop(0, PAL.coatHighlight);
        hGrad.addColorStop(0.5, PAL.coatBase);
        hGrad.addColorStop(1, PAL.coatDeep);

        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.moveTo(-4, -6);
        ctx.lineTo(2, -8);
        ctx.lineTo(10, -4);
        ctx.quadraticCurveTo(14, -3, 14, 0);
        ctx.lineTo(9, 2);
        ctx.lineTo(3, 1.5);
        ctx.lineTo(8, 4.5);
        ctx.lineTo(1, 5.0);
        ctx.lineTo(-4, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.creamBase;
        ctx.beginPath();
        ctx.ellipse(8, 0.5, 4.8, 3.4, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.noseLeather;
        ctx.beginPath();
        ctx.moveTo(11, -2.5);
        ctx.lineTo(14, -0.2);
        ctx.lineTo(11.5, 1.5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = PAL.eyeRim;
        ctx.beginPath();
        ctx.ellipse(4.5, -3.8, 2.6, 2.2, 0.15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.eyeAmber;
        ctx.beginPath();
        ctx.arc(4.6, -3.8, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.eyePupil;
        ctx.beginPath();
        ctx.arc(4.9, -3.8, 1.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.eyeHigh;
        ctx.beginPath();
        ctx.arc(4.4, -4.3, 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
        ctx.lineWidth = 0.65;
        ctx.beginPath();
        ctx.moveTo(9, 0);  ctx.lineTo(17, -2);
        ctx.moveTo(9, 1);  ctx.lineTo(18, 1);
        ctx.moveTo(9, 2);  ctx.lineTo(16, 4);
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // MOD 1: OTURMA / DİNLENME (Sfinks / Koltuk Duruşu)
    // =========================================================================
    if (isSitting) {
        const torsoY = -6 + breath * 2;

        if (view === 'front') {
            [-12, 12].forEach(hx => {
                ctx.fillStyle = PAL.coatShade;
                ctx.beginPath();
                ctx.ellipse(hx, 0, 8.0, 5.2, 0, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, torsoY, 13.5, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.creamBase;
            ctx.beginPath();
            ctx.ellipse(0, torsoY + 2, 7.5, 9.0, 0, 0, Math.PI * 2);
            ctx.fill();

            drawPaw(-6, 2, true, false);
            drawPaw(6, 2, true, false);

            const headY = torsoY - 14;
            drawTuftedManeFront(0, headY + 3, 1.15, 1.15);
            drawLionFace(0, headY, 0);

            // Sağdan kıvrılan kuyruk
            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            ctx.moveTo(6, 1);
            ctx.quadraticCurveTo(16, 2, 23, 4);
            ctx.stroke();
            ctx.fillStyle = PAL.maneShadow;
            ctx.beginPath();
            ctx.ellipse(24, 4.5, 4.4, 7.5, 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else if (view === 'quarter-front') {
            ctx.fillStyle = PAL.coatShade;
            ctx.beginPath();
            ctx.ellipse(-10, 0, 9.0, 5.8, -0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, torsoY, 13, 12, 0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.creamBase;
            ctx.beginPath();
            ctx.ellipse(2, torsoY + 2, 7.0, 8.5, 0.1, 0, Math.PI * 2);
            ctx.fill();

            drawPaw(2, 2, true, true);
            drawPaw(8, 2, true, false);

            const headX = 6;
            const headY = torsoY - 13;
            drawTuftedManeFront(headX, headY + 3, 1.12, 1.15);
            drawLionFace(headX, headY, 0.35);

            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            ctx.moveTo(-10, 0);
            ctx.quadraticCurveTo(-18, 1, -22, 4);
            ctx.stroke();
            ctx.fillStyle = PAL.maneShadow;
            ctx.beginPath();
            ctx.ellipse(-23, 4.5, 4.4, 7.0, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else if (view === 'side') {
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
            drawTuftedManeSide(headX - 4, headY + 3, 1.05, 1.1);
            drawLionHeadSide(headX, headY);

            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            ctx.moveTo(-14, 0);
            ctx.quadraticCurveTo(-22, 1, -26, 4);
            ctx.stroke();
            ctx.fillStyle = PAL.maneShadow;
            ctx.beginPath();
            ctx.ellipse(-27, 4.5, 4.4, 7.0, -0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

        } else {
            // ARKADAN OTURMA (back / quarter-back)
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
            drawTuftedManeFront(0, headY + 3, 1.15, 1.15);

            // Kulaklar arkadan (Derin kürk rengi)
            [-9.5, 9.5].forEach(ex => {
                ctx.fillStyle = PAL.coatDeep;
                ctx.beginPath();
                ctx.arc(ex, headY - 12.5, 4.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = PAL.coatShade;
                ctx.beginPath();
                ctx.arc(ex, headY - 12.5, 2.4, 0, Math.PI * 2);
                ctx.fill();
            });

            ctx.save();
            ctx.strokeStyle = PAL.coatShade;
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(8, 2, 14, 4);
            ctx.stroke();
            ctx.restore();
        }

        ctx.restore();
        return;
    }

    // =========================================================================
    // MOD 2: AYAKTA & HAREKETLİ (8-Yönlü İzometrik)
    // =========================================================================
    const bodyY = -11 + prowlBob;

    if (view === 'side') {
        // YAN PROFİL (side - right/left)
        drawLeg(-14, bodyY + 3, -15, 0, true, true, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);
        drawLeg(11, bodyY + 3, 12, 0, false, true, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawTail(-18, bodyY - 1, -1);

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
        drawTuftedManeSide(headX - 4, headY + 3, 1.05, 1.1);
        drawLionHeadSide(headX, headY);

    } else if (view === 'quarter-front') {
        // 2.5D ÇEYREK ÖN (quarter-front - down-right/down-left)
        drawLeg(-14, bodyY + 2, -15, 0, true, true, -stride * 0.7, isMoving ? Math.max(0, -stride) * 0.5 : 0);
        drawLeg(4, bodyY + 3, 5, 0, false, true, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);
        drawTail(-18, bodyY, -1);

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
        drawTuftedManeFront(headX, headY + 3, 1.12, 1.15);
        drawLionFace(headX, headY, 0.35);

    } else if (view === 'front') {
        // TAM ÖN (front - down)
        drawLeg(-12, bodyY + 4, -13, 0, true, true, -stride * 0.6, isMoving ? Math.max(0, -stride) * 0.4 : 0);
        drawLeg(12, bodyY + 4, 13, 0, true, true, stride * 0.6, isMoving ? Math.max(0, stride) * 0.4 : 0);
        drawTail(6, bodyY + 4, 1);

        const cg = ctx.createLinearGradient(0, bodyY - 10, 0, bodyY + 10);
        cg.addColorStop(0, PAL.coatHighlight);
        cg.addColorStop(0.5, PAL.coatBase);
        cg.addColorStop(1, PAL.coatDeep);
        ctx.fillStyle = cg;
        ctx.beginPath();
        ctx.ellipse(0, bodyY + 1, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = PAL.creamBase;
        ctx.beginPath();
        ctx.ellipse(0, bodyY + 2, 7.5, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        drawLeg(-8, bodyY + 4, -8, 0, false, false, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);
        drawLeg(8, bodyY + 4, 8, 0, false, false, -stride * 0.7, isMoving ? Math.max(0, -stride) * 0.5 : 0);

        const headY = bodyY - 14 + breath * 2;
        drawTuftedManeFront(0, headY + 3, 1.2, 1.2);
        drawLionFace(0, headY, 0);

    } else if (view === 'quarter-back') {
        // ÇEYREK ARKA (quarter-back - up-right/up-left)
        // Arka bacaklar ve gövde
        drawLeg(-13, bodyY + 3, -14, 0, true, true, -stride * 0.7, isMoving ? Math.max(0, -stride) * 0.5 : 0);
        drawLeg(9, bodyY + 4, 10, 0, false, true, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);

        // Masif Kalça & Sırt
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

        // Yakın bacaklar
        drawLeg(-10, bodyY + 4, -9, 0, true, false, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawLeg(3, bodyY + 4, 5, 0, false, false, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);

        // Kuyruk
        drawTail(-16, bodyY + 1, -1);

        // Kafa & Yele Arkası
        const headX = 8;
        const headY = bodyY - 13 + breath * 2;
        drawTuftedManeFront(headX, headY + 3, 1.1, 1.15);

        [-9.5, 9.5].forEach(ex => {
            ctx.fillStyle = PAL.coatDeep;
            ctx.beginPath();
            ctx.arc(headX + ex * 0.7, headY - 12.0, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.coatShade;
            ctx.beginPath();
            ctx.arc(headX + ex * 0.7, headY - 12.0, 2.4, 0, Math.PI * 2);
            ctx.fill();
        });

    } else { // back
        // TAM ARKA (back - up)
        drawLeg(-7, bodyY + 4, -7, 0, false, true, stride * 0.6, isMoving ? Math.max(0, stride) * 0.4 : 0);
        drawLeg(7, bodyY + 4, 7, 0, false, true, -stride * 0.6, isMoving ? Math.max(0, -stride) * 0.4 : 0);

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
        drawTail(0, bodyY + 2, 1);

        const headY = bodyY - 14 + breath * 2;
        drawTuftedManeFront(0, headY + 3, 1.2, 1.2);

        [-9.5, 9.5].forEach(ex => {
            ctx.fillStyle = PAL.coatDeep;
            ctx.beginPath();
            ctx.arc(ex, headY - 12.5, 4.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.coatShade;
            ctx.beginPath();
            ctx.arc(ex, headY - 12.5, 2.4, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    ctx.restore();
};
`;

async function run() {
    const port = 9270;
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
                ctx.fillText('🦁 Savana Kralı Aslan - 2.5D İzometrik 8 Yönlü Showcase (V7 Final)', 20, 30);

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
            const outPath = path.join('C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'sculpted_lion_preview_v7.png');
            fs.writeFileSync(outPath, base64Data, 'base64');
            console.log('Saved preview to:', outPath);
        }

        ws.close();
        edge.kill();
        process.exit(0);
    });
}

run().catch(e => { console.error(e); process.exit(1); });

