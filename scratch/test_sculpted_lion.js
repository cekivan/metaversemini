const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

// In this script we'll evaluate a newly sculpted lion drawer in headless Edge and check the preview!
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

    // Zemin Gölgesi (Ground Contact Shadow)
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

    // SCULPTED VOLUMETRIC MANE CLUSTERS (Heybetli, Gerçekçi Bukleler)
    function drawVolumetricMane(cx, cy, scaleX, scaleY, isBack) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scaleX, scaleY);

        // Koyu Derin Gölgeli Arka Katman (Shadow Underlayer)
        ctx.fillStyle = PAL.maneShadow;
        ctx.beginPath();
        ctx.moveTo(0, -17);
        ctx.bezierCurveTo(-14, -18, -20, -10, -21, 0);
        ctx.bezierCurveTo(-22, 10, -16, 20, -5, 23);
        ctx.bezierCurveTo(0, 24, 6, 23, 11, 19);
        ctx.bezierCurveTo(20, 14, 21, 4, 19, -6);
        ctx.bezierCurveTo(17, -15, 10, -17, 0, -17);
        ctx.closePath();
        ctx.fill();

        // Kestane / Kızıl Orta Katman (Auburn Midtone)
        ctx.fillStyle = PAL.maneAuburn;
        ctx.beginPath();
        ctx.moveTo(0, -15);
        ctx.bezierCurveTo(-12, -16, -18, -8, -18, 0);
        ctx.bezierCurveTo(-19, 8, -13, 17, -4, 20);
        ctx.bezierCurveTo(2, 21, 8, 19, 11, 16);
        ctx.bezierCurveTo(18, 12, 18, 2, 16, -6);
        ctx.bezierCurveTo(14, -14, 8, -15, 0, -15);
        ctx.closePath();
        ctx.fill();

        // Altın Bukle Demetleri (Sculpted Golden Locks)
        ctx.fillStyle = PAL.maneGold;
        // Tepe bukleleri
        [-8, -2, 4, 9].forEach((ox, i) => {
            ctx.beginPath();
            ctx.moveTo(ox, -13);
            ctx.quadraticCurveTo(ox - 3, -19 - (i % 2) * 2, ox + 3, -14);
            ctx.fill();
        });
        // Yan bukleler
        [-16, -14, -10].forEach((oy, i) => {
            ctx.beginPath();
            ctx.moveTo(-15, oy);
            ctx.quadraticCurveTo(-23 - (i % 2) * 2, oy + 4, -14, oy + 8);
            ctx.fill();
        });
        [ -12, -6, 2, 10 ].forEach((oy, i) => {
            ctx.beginPath();
            ctx.moveTo(14, oy);
            ctx.quadraticCurveTo(22 + (i % 2) * 2, oy + 4, 13, oy + 8);
            ctx.fill();
        });

        // Işıltılı tüy uçları
        ctx.strokeStyle = PAL.maneGlint;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-6, -14); ctx.lineTo(-8, -17);
        ctx.moveTo(3, -14);  ctx.lineTo(4, -18);
        ctx.moveTo(-16, -4); ctx.lineTo(-21, -2);
        ctx.moveTo(15, -2);  ctx.lineTo(19, 0);
        ctx.stroke();

        ctx.restore();
    }

    // GERÇEKÇİ ASLAN YÜZÜ (Gözler, Bıyıklar, Burun, Çene)
    function drawSculptedFace(fx, fy, viewAngle) {
        ctx.save();
        ctx.translate(fx, fy);

        // Kafa kubbesi
        const skullGrad = ctx.createRadialGradient(0, -3, 2, 0, 0, 11);
        skullGrad.addColorStop(0, PAL.coatHighlight);
        skullGrad.addColorStop(0.6, PAL.coatBase);
        skullGrad.addColorStop(1, PAL.coatShade);
        ctx.fillStyle = skullGrad;
        ctx.beginPath();
        ctx.ellipse(viewAngle * 2, -2, 9.5, 8.5, viewAngle * 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Kulaklar
        [-6.5, 6.5].forEach((ex, idx) => {
            const earX = ex + viewAngle * 1.5;
            const earY = -9.5;
            ctx.fillStyle = PAL.coatDeep;
            ctx.beginPath();
            ctx.arc(earX, earY, 3.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.arc(earX, earY, 1.8, 0, Math.PI * 2);
            ctx.fill();
        });

        // Kaş Çıkıntısı & Burun Köprüsü
        ctx.fillStyle = PAL.coatDeep;
        ctx.beginPath();
        ctx.roundRect(-4.5 + viewAngle * 2, -5.5, 9, 2.0, 1);
        ctx.fill();

        // Gözler (Avcı Kehribar)
        [-3.6, 3.6].forEach((gx, idx) => {
            const eyeX = gx + viewAngle * 2.2;
            const eyeY = -4.0;
            ctx.fillStyle = PAL.eyeRim;
            ctx.beginPath();
            ctx.ellipse(eyeX, eyeY, 2.3, 1.9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyeAmber;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 1.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyePupil;
            ctx.beginPath();
            ctx.arc(eyeX, eyeY, 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PAL.eyeHigh;
            ctx.fillRect(eyeX - 0.3, eyeY - 0.7, 0.6, 0.6);
        });

        // Bıyık Yastıkları & Çene (Muzzle)
        const mX = viewAngle * 2.5;
        const mY = 2.0;

        ctx.fillStyle = PAL.creamLight;
        ctx.beginPath();
        ctx.ellipse(mX - 2.8, mY + 0.5, 3.8, 3.2, -0.1, 0, Math.PI * 2);
        ctx.ellipse(mX + 2.8, mY + 0.5, 3.8, 3.2, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Deri Burun
        ctx.fillStyle = PAL.noseLeather;
        ctx.beginPath();
        ctx.moveTo(mX - 2.2, mY - 1.2);
        ctx.lineTo(mX + 2.2, mY - 1.2);
        ctx.lineTo(mX, mY + 1.2);
        ctx.closePath();
        ctx.fill();

        // Burun delikleri
        ctx.fillStyle = PAL.mouthDark;
        ctx.fillRect(mX - 1.2, mY - 0.4, 0.6, 0.6);
        ctx.fillRect(mX + 0.6, mY - 0.4, 0.6, 0.6);

        // Ağız Çizgisi & Çene Sakalı
        ctx.strokeStyle = PAL.mouthDark;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mX, mY + 1.2);
        ctx.lineTo(mX, mY + 2.8);
        ctx.moveTo(mX - 2.5, mY + 2.5);
        ctx.quadraticCurveTo(mX, mY + 3.2, mX + 2.5, mY + 2.5);
        ctx.stroke();

        // Bıyık Noktaları
        ctx.fillStyle = PAL.coatDark;
        [-4, -2, 2, 4].forEach(px => {
            ctx.fillRect(mX + px, mY + 0.6, 0.5, 0.5);
            ctx.fillRect(mX + px * 0.8, mY + 1.6, 0.5, 0.5);
        });

        // İnce Beyaz Bıyık Telleri
        ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(mX - 4, mY + 1); ctx.lineTo(mX - 11, mY + 0.5);
        ctx.moveTo(mX - 4, mY + 2); ctx.lineTo(mX - 10, mY + 3.5);
        ctx.moveTo(mX + 4, mY + 1); ctx.lineTo(mX + 11, mY + 0.5);
        ctx.moveTo(mX + 4, mY + 2); ctx.lineTo(mX + 10, mY + 3.5);
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // MODLAR: STANDING & MOVING (8 Açılı)
    // =========================================================================
    ctx.translate(0, -stepBob);

    if (isSitting) {
        // OTURMA MODU (Sfinks / Koltuk Duruşu)
        const torsoY = -6 + breath * 2;

        if (view === 'front' || view === 'quarter-front') {
            // Arka kıvrılmış uyluklar
            [-12, 12].forEach(hx => {
                ctx.fillStyle = PAL.coatShade;
                ctx.beginPath();
                ctx.ellipse(hx, 0, 7.5, 5.0, 0, 0, Math.PI * 2);
                ctx.fill();
            });

            // Dik gövde
            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, torsoY, 13, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Krem Göğüs
            ctx.fillStyle = PAL.creamLight;
            ctx.beginPath();
            ctx.ellipse(0, torsoY + 2, 7.0, 9.0, 0, 0, Math.PI * 2);
            ctx.fill();

            // Yere basılı ön patiler
            drawPaw(-6, 2, true, false);
            drawPaw(6, 2, true, false);

            // Heybetli Yele
            const headY = torsoY - 14;
            drawVolumetricMane(0, headY, 1.05, 1.05, false);
            drawSculptedFace(0, headY + 1, view === 'quarter-front' ? 0.35 : 0);

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
        } else if (view === 'side') {
            // Yandan oturma
            ctx.fillStyle = PAL.coatShade;
            ctx.beginPath();
            ctx.ellipse(-12, 0, 9.5, 6.0, -0.1, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PAL.coatBase;
            ctx.beginPath();
            ctx.ellipse(-2, torsoY, 13, 12, 0.1, 0, Math.PI * 2);
            ctx.fill();

            drawPaw(8, 2, true, false);

            const headX = 8;
            const headY = torsoY - 13;
            drawVolumetricMane(headX, headY, 0.95, 1.0, false);
            drawSculptedFace(headX + 2, headY + 1, 0.6);

            // Arkadan uzanan kuyruk
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
            // Arkadan oturma (back / quarter-back)
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
            drawVolumetricMane(0, headY, 1.05, 1.05, true);

            // Kulaklar arkadan
            [-6.5, 6.5].forEach(ex => {
                ctx.fillStyle = PAL.coatDark;
                ctx.beginPath();
                ctx.arc(ex, headY - 8.5, 3.2, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        ctx.restore();
        return;
    }

    // AYAKTA / HAREKETLİ MOD
    const bodyY = -11 + prowlBob;

    if (view === 'side') {
        drawLeg(-14, bodyY + 3, -15, 0, true, true, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);
        drawLeg(11, bodyY + 3, 12, 0, false, true, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawTail(-18, bodyY - 1);

        // Gövde
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

        drawLeg(-14, bodyY + 3, -13, 0, true, false, stride * 0.8, isMoving ? Math.max(0, stride) * 0.6 : 0);
        drawLeg(11, bodyY + 3, 14, 0, false, false, -stride * 0.8, isMoving ? Math.max(0, -stride) * 0.6 : 0);

        const headX = 13;
        const headY = bodyY - 12 + breath * 2;
        drawVolumetricMane(headX, headY, 0.95, 1.02, false);
        drawSculptedFace(headX + 2, headY + 1, 0.65);

    } else if (view === 'quarter-front') {
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
        drawVolumetricMane(headX, headY, 1.0, 1.05, false);
        drawSculptedFace(headX + 1, headY + 1, 0.35);

    } else if (view === 'front') {
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
        drawVolumetricMane(0, headY, 1.1, 1.1, false);
        drawSculptedFace(0, headY + 1, 0);

    } else if (view === 'quarter-back') {
        drawLeg(10, bodyY + 3, 11, 0, false, true, stride * 0.7, isMoving ? Math.max(0, stride) * 0.5 : 0);

        const headX = 8;
        const headY = bodyY - 13 + breath * 2;
        drawVolumetricMane(headX, headY, 0.98, 1.05, true);

        // Kulak arkası
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
        drawLeg(-7, bodyY + 4, -7, 0, false, true, stride * 0.6, isMoving ? Math.max(0, stride) * 0.4 : 0);
        drawLeg(7, bodyY + 4, 7, 0, false, true, -stride * 0.6, isMoving ? Math.max(0, -stride) * 0.4 : 0);

        const headY = bodyY - 14 + breath * 2;
        drawVolumetricMane(0, headY, 1.1, 1.1, true);

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
    const port = 9264;
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

        // Inject new sculpted function and render
        await send('Runtime.evaluate', {
            expression: lionCode
        });

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
                ctx.fillText('🦁 Heybetli Savana Kralı Aslan - 2.5D İzometrik 8 Yönlü Showcase', 20, 30);

                const dirs = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '13px sans-serif';
                ctx.fillText('Hareket / Yürüyüş Modu (8 Yön):', 20, 60);

                dirs.forEach((dir, i) => {
                    ctx.save();
                    const x = 60 + i * 105;
                    const y = 145;
                    ctx.translate(x, y); window.testSculptedLion(ctx, dir, true, i * 0.9, false);
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(dir, x, y + 36);
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
                    ctx.translate(x, y); window.testSculptedLion(ctx, dir, false, 0, true);
                    ctx.fillStyle = '#fde047';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Oturma: ' + dir, x, y + 36);
                    ctx.restore();
                });

                return cvs.toDataURL('image/png');
            })()`,
            returnByValue: true
        });

        if (res && res.result && res.result.value) {
            const base64Data = res.result.value.replace(/^data:image\/png;base64,/, "");
            const outPath = path.join('C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'sculpted_lion_preview.png');
            fs.writeFileSync(outPath, base64Data, 'base64');
            console.log('Saved preview to:', outPath);
        }

        ws.close();
        edge.kill();
        process.exit(0);
    });
}

run().catch(e => { console.error(e); process.exit(1); });
