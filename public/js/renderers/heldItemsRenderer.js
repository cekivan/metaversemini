// public/js/renderers/heldItemsRenderer.js - 8 Açılı El Eşyaları (Held Items & Props) Çizim Motoru
// Modüler Avatar Çizim Sistemi (Metaverse Mini 2026)

(function(global) {
    // Güvenli Yardımcılar (Yükleme sırasından bağımsız tolerans)
    function _safeNormalize(facing) {
        if (typeof normalize8WayFacing === 'function') return normalize8WayFacing(facing);
        if (typeof window !== 'undefined' && typeof window.normalize8WayFacing === 'function') return window.normalize8WayFacing(facing);
        return facing || 'down';
    }

    function _safeGetSmokingState(p, isPreview) {
        if (typeof getAvatarSmokingState === 'function') return getAvatarSmokingState(p, isPreview);
        if (typeof window !== 'undefined' && typeof window.getAvatarSmokingState === 'function') return window.getAvatarSmokingState(p, isPreview);
        return null;
    }

    function _safeGetMouthPos(pX, pY, facing, model) {
        if (typeof getAvatarMouthPos === 'function') return getAvatarMouthPos(pX, pY, facing, model);
        if (typeof window !== 'undefined' && typeof window.getAvatarMouthPos === 'function') return window.getAvatarMouthPos(pX, pY, facing, model);
        return { x: pX, y: pY - 14 };
    }

    function _safeDrawExhaleSmoke(ctx, pX, pY, facing, model, progress) {
        if (typeof drawExhaleSmoke === 'function') return drawExhaleSmoke(ctx, pX, pY, facing, model, progress);
        if (typeof window !== 'undefined' && typeof window.drawExhaleSmoke === 'function') return window.drawExhaleSmoke(ctx, pX, pY, facing, model, progress);
    }

function drawHeldItem(targetCtx, pX, pY, heldItem, isPreview = false, facing = 'down', _unused = false, model = 'classic_2', p = null) {
    if (!heldItem || heldItem === 'none') return;

    let f = _safeNormalize(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');
    let isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

    targetCtx.save();

    // Dinamik El Pozisyonu Çapaları (Klasik 2 vs Klasik Chibi)
    let handX, handY;
    if (model === 'classic_2') {
        // Klasik 2 Modeline (Sabit El Pozisyonu) Tam Milimetrik Senkron El Koordinatları
        if (f === 'down') {
            handX = pX + 9.0; handY = pY + 6.2;
        } else if (f === 'down-right') {
            handX = pX + 7.0; handY = pY + 7.2;
        } else if (f === 'right') {
            handX = pX + 2.0; handY = pY + 6.2;
        } else if (f === 'up-right') {
            handX = pX + 5.0; handY = pY + 6.2;
        } else if (f === 'up') {
            handX = pX + 8.0; handY = pY + 6.2;
        } else if (f === 'up-left') {
            handX = pX - 5.0; handY = pY + 6.2;
        } else if (f === 'left') {
            handX = pX - 2.0; handY = pY + 6.2;
        } else if (f === 'down-left') {
            handX = pX - 7.0; handY = pY + 7.2;
        } else {
            handX = pX + 9.0; handY = pY + 6.2;
        }
    } else {
        if (f === 'down') {
            handX = pX + (isPreview ? 12 : 11); handY = pY + 2;
        } else if (f === 'down-right') {
            handX = pX + 13; handY = pY + 4;
        } else if (f === 'right') {
            handX = pX + 12; handY = pY + 1;
        } else if (f === 'up-right') {
            handX = pX + 8; handY = pY - 3;
        } else if (f === 'up') {
            handX = pX + 8; handY = pY - 2;
        } else if (f === 'up-left') {
            handX = pX - 8; handY = pY - 3;
        } else if (f === 'left') {
            handX = pX - 12; handY = pY + 1;
        } else if (f === 'down-left') {
            handX = pX - 13; handY = pY + 4;
        } else {
            handX = pX + 11; handY = pY + 2;
        }
    }

    // Sigara İçme / Duman Çekme Mekaniği: Eli ağza doğru yumuşakça götür
    let smokeState = (heldItem === 'sigara') ? _safeGetSmokingState(p, isPreview) : null;
    if (smokeState && smokeState.liftProgress > 0) {
        let mouth = _safeGetMouthPos(pX, pY, f, model);
        handX = handX + (mouth.x - handX) * smokeState.liftProgress;
        handY = handY + (mouth.y - handY) * smokeState.liftProgress;
    }

    // 1. GEZGİN SIRT ÇANTASI
    if (heldItem === 'sirtcantasi') {
        let scale = isPreview ? 1.1 : 0.95;
        let bpYOffset = -2;

        if (f === 'up') {
            let bpX = pX;
            let bpY = pY + bpYOffset;
            targetCtx.fillStyle = "#854d0e";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 7 * scale, bpY - 8 * scale, 14 * scale, 18 * scale, 4); targetCtx.fill();
            targetCtx.strokeStyle = "#532e08"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#a16207";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 7.5 * scale, bpY - 9 * scale, 15 * scale, 8 * scale, [4, 4, 1, 1]); targetCtx.fill();
            [-3 * scale, 3 * scale].forEach(sx => {
                targetCtx.fillStyle = "#451a03"; targetCtx.fillRect(bpX + sx - 1, bpY - 9 * scale, 2, 14 * scale);
                targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(bpX + sx - 1.5, bpY - 2 * scale, 3, 2.5);
            });
            targetCtx.fillStyle = "#713f12";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 5 * scale, bpY + 2 * scale, 10 * scale, 7 * scale, 2); targetCtx.fill();
            targetCtx.strokeStyle = "#451a03"; targetCtx.lineWidth = 1.5;
            targetCtx.beginPath(); targetCtx.arc(bpX, bpY - 9 * scale, 3 * scale, Math.PI, 0); targetCtx.stroke();

        } else if (f === 'up-right' || f === 'up-left') {
            let bpX = (f === 'up-right') ? (pX - 3.5 * scale) : (pX + 3.5 * scale);
            let bpY = pY + bpYOffset - 1;
            targetCtx.fillStyle = "#854d0e";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 6 * scale, bpY - 8 * scale, 12 * scale, 17 * scale, 4); targetCtx.fill();
            targetCtx.strokeStyle = "#532e08"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#a16207";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 6.5 * scale, bpY - 9 * scale, 13 * scale, 7 * scale, 3); targetCtx.fill();
            targetCtx.fillStyle = "#451a03"; targetCtx.fillRect(bpX - 1, bpY - 9 * scale, 2, 14 * scale);
            targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(bpX - 1.5, bpY - 2 * scale, 3, 2.5);

        } else if (f === 'right' || f === 'left') {
            let bpX = (f === 'right') ? (pX - 9) : (pX + 9);
            let bpY = pY + bpYOffset;
            targetCtx.fillStyle = "#854d0e";
            targetCtx.beginPath(); targetCtx.roundRect(bpX - 4 * scale, bpY - 7 * scale, 8 * scale, 16 * scale, 3); targetCtx.fill();
            targetCtx.strokeStyle = "#532e08"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#a16207"; targetCtx.fillRect(bpX - 2 * scale, bpY - 3 * scale, 5 * scale, 6 * scale);
            targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(bpX - 4 * scale, bpY); targetCtx.lineTo(bpX + 4 * scale, bpY); targetCtx.stroke();

        } else {
            // Önden görünüm omuz askıları (Omuz başlarından bele doğru oturur)
            let strapShift = 7;
            let strapTopY = pY - 9;
            let strapHeight = 14;
            targetCtx.fillStyle = "#854d0e";
            targetCtx.fillRect(pX - strapShift, strapTopY, 2.4, strapHeight);
            targetCtx.fillRect(pX + strapShift - 2.4, strapTopY, 2.4, strapHeight);
            targetCtx.fillStyle = "#451a03";
            targetCtx.fillRect(pX - strapShift, pY - 3, strapShift * 2, 1.8);
            targetCtx.fillStyle = "#facc15";
            targetCtx.fillRect(pX - 1.2, pY - 3.5, 2.4, 2.8);
        }

        targetCtx.restore();
        return;
    }

    // 2. NOSTALJİK AKUSTİK GİTAR
    if (heldItem === 'gitar') {
        let scale = isPreview ? 1.15 : 1.0;

        if (isBack) {
            targetCtx.translate(pX + 1.5, pY);
            let gAngle = (f === 'up-right') ? 0.55 : (f === 'up-left') ? -0.55 : 0.45;
            targetCtx.rotate(gAngle);

            targetCtx.strokeStyle = "#451a03"; targetCtx.lineWidth = 2.0;
            targetCtx.beginPath(); targetCtx.moveTo(-11 * scale, -13 * scale); targetCtx.lineTo(11 * scale, 13 * scale); targetCtx.stroke();

            targetCtx.fillStyle = "#9a3412";
            targetCtx.beginPath(); targetCtx.ellipse(0, 4 * scale, 8 * scale, 11 * scale, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1.2; targetCtx.stroke();
            targetCtx.fillStyle = "#78350f";
            targetCtx.fillRect(-2 * scale, -22 * scale, 4 * scale, 16 * scale);

        } else {
            let gAnchorX = handX;
            let gAnchorY = handY;
            targetCtx.translate(gAnchorX, gAnchorY);
            let gRot = (isLeft) ? 0.55 : -0.55;
            targetCtx.rotate(gRot);

            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.ellipse(0, 8 * scale, 8.5 * scale, 10.5 * scale, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.ellipse(0, 0, 6.5 * scale, 6.5 * scale, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1.0; targetCtx.stroke();

            targetCtx.fillStyle = "#1e1b4b";
            targetCtx.beginPath(); targetCtx.arc(0, 2.5 * scale, 2.8 * scale, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#fde047"; targetCtx.lineWidth = 0.8; targetCtx.stroke();

            targetCtx.fillStyle = "#78350f"; targetCtx.fillRect(-1.8 * scale, -20 * scale, 3.6 * scale, 20 * scale);
            targetCtx.fillStyle = "#b45309"; targetCtx.fillRect(-2.5 * scale, -24 * scale, 5 * scale, 5 * scale);
            targetCtx.strokeStyle = "rgba(255, 255, 255, 0.8)"; targetCtx.lineWidth = 0.6;
            targetCtx.beginPath();
            targetCtx.moveTo(-1, 9 * scale); targetCtx.lineTo(-1, -22 * scale);
            targetCtx.moveTo(1, 9 * scale); targetCtx.lineTo(1, -22 * scale);
            targetCtx.stroke();
        }

        targetCtx.restore();
        return;
    }

    // 3. ANADOLU BAĞLAMASI / SAZ
    if (heldItem === 'baglama') {
        // KLASİK CHİBİ MODEL İÇİN UYUMLU BAĞLAMA ÇİZİMİ
        let bodyW = isPreview ? 8.5 : 7.5;
        let bodyH = isPreview ? 12 : 11;
        let neckH = isPreview ? 20 : 18;

        if (isBack) {
            targetCtx.translate(pX, pY);
            let sAngle = (f === 'up-right') ? 0.45 : (f === 'up-left') ? -0.45 : 0.40;
            targetCtx.rotate(sAngle);

            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1.8;
            targetCtx.beginPath(); targetCtx.moveTo(-9, -11); targetCtx.lineTo(9, 11); targetCtx.stroke();

            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.ellipse(0, 4, bodyW, bodyH, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1; targetCtx.stroke();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 2.6;
            targetCtx.beginPath(); targetCtx.moveTo(0, -bodyH + 5); targetCtx.lineTo(0, -neckH); targetCtx.stroke();

        } else {
            targetCtx.translate(handX, handY);
            let rot = isLeft ? 0.50 : -0.50;
            targetCtx.rotate(rot);

            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.ellipse(0, 4, bodyW, bodyH, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 1; targetCtx.stroke();

            targetCtx.fillStyle = "#451a03";
            targetCtx.beginPath(); targetCtx.arc(0, 4, isPreview ? 2.5 : 2.0, 0, Math.PI * 2); targetCtx.fill();

            targetCtx.strokeStyle = "#78350f"; targetCtx.lineWidth = 2.4;
            targetCtx.beginPath(); targetCtx.moveTo(0, -bodyH + 5); targetCtx.lineTo(0, -neckH); targetCtx.stroke();
            targetCtx.fillStyle = "#f8fafc"; targetCtx.fillRect(-2.5, -neckH - 3, 5, 3.5);

            targetCtx.strokeStyle = "rgba(255,255,255,0.8)"; targetCtx.lineWidth = 0.6;
            targetCtx.beginPath();
            targetCtx.moveTo(-0.8, 8); targetCtx.lineTo(-0.8, -neckH);
            targetCtx.moveTo(0.8, 8); targetCtx.lineTo(0.8, -neckH);
            targetCtx.stroke();
        }

        targetCtx.restore();
        return;
    }

    // 4. BALIKÇI OLTASI
    if (heldItem === 'olta') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);

        let rodAngle = 0.35;
        if (f === 'right') rodAngle = 0.45;
        else if (f === 'left') rodAngle = -0.45;
        else if (f === 'up') rodAngle = 0.28;
        else if (f === 'up-right') rodAngle = 0.38;
        else if (f === 'up-left') rodAngle = -0.38;
        else if (f === 'down-right') rodAngle = 0.40;
        else if (f === 'down-left') rodAngle = -0.40;
        else if (f === 'down') rodAngle = 0.35;

        targetCtx.rotate(rodAngle);
        targetCtx.fillStyle = "#d97706"; targetCtx.fillRect(-1.5, -2, 3, 9); // Mantar sap
        targetCtx.fillStyle = "#64748b"; targetCtx.fillRect(-2.5, 3, 5, 3.5); // Makine
        targetCtx.strokeStyle = "#1e293b"; targetCtx.lineWidth = 1.8;
        let rodLen = isPreview ? -28 : -26;
        targetCtx.beginPath(); targetCtx.moveTo(0, -2); targetCtx.lineTo(0, rodLen); targetCtx.stroke();
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.75)"; targetCtx.lineWidth = 0.8;
        targetCtx.beginPath();
        targetCtx.moveTo(0, rodLen);
        targetCtx.lineTo(isLeft ? -5 : 5, -8);
        targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 5. KEHRİBAR TESPİH
    if (heldItem === 'tespih') {
        let swing = Math.sin(Date.now() / 170) * 0.30;
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);
        targetCtx.rotate(swing);

        targetCtx.strokeStyle = "#b45309"; targetCtx.lineWidth = 0.6; targetCtx.fillStyle = "#f59e0b";
        let beadRadius = 1.6;
        let ringR = 4.8;
        for (let i = 0; i < 9; i++) {
            let angle = (i * 2 * Math.PI) / 9;
            let bx = Math.cos(angle) * ringR;
            let by = Math.sin(angle) * ringR + 5;
            targetCtx.beginPath(); targetCtx.arc(bx, by, beadRadius, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
        }
        targetCtx.strokeStyle = "#94a3b8"; targetCtx.lineWidth = 1.0;
        targetCtx.beginPath();
        targetCtx.moveTo(0, ringR + 5 + beadRadius);
        targetCtx.lineTo(0, ringR + 11);
        targetCtx.stroke();
        targetCtx.fillStyle = "#cbd5e1";
        targetCtx.beginPath(); targetCtx.arc(0, ringR + 12, 1.5, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.restore();
        return;
    }
    // 5b. ÇİFT KATMANLI TESPİH 2
    if (heldItem === 'tespih2') {
        let swing = Math.sin(Date.now() / 120) * 0.45; // Hızlı ve dinamik kehribar salınımı
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);
        targetCtx.rotate(swing);

        targetCtx.strokeStyle = "#b45309"; targetCtx.lineWidth = 0.6; targetCtx.fillStyle = "#f59e0b";
        let beadRadius = 1.6;
        let ringR = 4.8;
        // Dış katman kehribar taneleri
        for (let i = 0; i < 9; i++) {
            let angle = (i * 2 * Math.PI) / 9;
            let bx = Math.cos(angle) * ringR;
            let by = Math.sin(angle) * ringR + 5;
            targetCtx.beginPath(); targetCtx.arc(bx, by, beadRadius, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            // İç katman parlak gümüş/inci taneleri
            targetCtx.beginPath(); targetCtx.arc(bx, by, beadRadius * 0.55, 0, Math.PI * 2); targetCtx.fillStyle = "#f8fafc"; targetCtx.fill();
            targetCtx.fillStyle = "#f59e0b";
        }
        // Gümüş imame & püskül
        targetCtx.strokeStyle = "#cbd5e1"; targetCtx.lineWidth = 1.0;
        targetCtx.beginPath();
        targetCtx.moveTo(0, ringR + 5 + beadRadius);
        targetCtx.lineTo(0, ringR + 11);
        targetCtx.stroke();
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.beginPath(); targetCtx.arc(0, ringR + 12, 1.7, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.restore();
        return;
    }

    // 6. UÇAN KIRMIZI BALON
    if (heldItem === 'balon') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);

        let balloonSway = Math.sin(Date.now() / 320) * 3.8;
        let stringEndX = balloonSway;
        let stringEndY = isPreview ? -36 : -32;

        // İp
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.85)"; targetCtx.lineWidth = 1.0;
        targetCtx.beginPath();
        targetCtx.moveTo(0, 0);
        targetCtx.quadraticCurveTo(balloonSway * 0.4, stringEndY * 0.5, stringEndX, stringEndY);
        targetCtx.stroke();

        let bW = isPreview ? 9 : 8;
        let bH = isPreview ? 12 : 10;
        // Balon gövdesi
        targetCtx.fillStyle = "#ef4444";
        targetCtx.beginPath(); targetCtx.ellipse(stringEndX, stringEndY - bH, bW, bH, 0, 0, Math.PI * 2); targetCtx.fill();

        // Düğüm
        targetCtx.fillStyle = "#b91c1c";
        targetCtx.beginPath();
        targetCtx.moveTo(stringEndX - 2, stringEndY);
        targetCtx.lineTo(stringEndX + 2, stringEndY);
        targetCtx.lineTo(stringEndX, stringEndY - 2.5);
        targetCtx.closePath(); targetCtx.fill();

        // Işık yansıması (Parlaklık)
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.65)";
        targetCtx.beginPath();
        targetCtx.ellipse(stringEndX - bW * 0.35, stringEndY - bH * 1.35, bW * 0.3, bH * 0.35, -0.2, 0, Math.PI * 2);
        targetCtx.fill();

        targetCtx.restore();
        return;
    }

    // 12. KILIÇ (Orta Çağ Şövalye Kılıcı)
    if (heldItem === 'kilic') {
        targetCtx.translate(handX, handY);
        let rot = isLeft ? -0.25 : 0.25;
        if (isBack) rot += (isLeft ? 0.35 : -0.35);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);
        targetCtx.rotate(rot);

        // Deri kabza
        targetCtx.fillStyle = "#475569";
        targetCtx.fillRect(-1.0, -7, 2.0, 7);
        // Altın topuz (Pommel)
        targetCtx.fillStyle = "#eab308";
        targetCtx.beginPath(); targetCtx.arc(0, 0.5, 1.6, 0, Math.PI * 2); targetCtx.fill();
        // Altın balçak (Crossguard)
        targetCtx.fillStyle = "#facc15";
        targetCtx.fillRect(-4.5, -8, 9, 2.0);
        targetCtx.strokeStyle = "#ca8a04"; targetCtx.lineWidth = 0.6; targetCtx.strokeRect(-4.5, -8, 9, 2.0);
        // Çelik namlu (Blade)
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.beginPath();
        targetCtx.moveTo(-2.2, -8);
        targetCtx.lineTo(-1.8, -22);
        targetCtx.lineTo(0, -25);
        targetCtx.lineTo(1.8, -22);
        targetCtx.lineTo(2.2, -8);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.strokeStyle = "#94a3b8"; targetCtx.lineWidth = 0.7; targetCtx.stroke();
        // Namlu ortası oluk (Fuller)
        targetCtx.strokeStyle = "#cbd5e1"; targetCtx.lineWidth = 0.8;
        targetCtx.beginPath(); targetCtx.moveTo(0, -9); targetCtx.lineTo(0, -21); targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 13. OYUNCAK ARABA (Spor Araba)
    if (heldItem === 'oyuncak_araba') {
        targetCtx.translate(handX, handY);
        let rotCar = isLeft ? -0.25 : 0.25;
        if (isBack) rotCar += (isLeft ? 0.35 : -0.35);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.90 : 1.0);
        targetCtx.scale(scale, scale);
        targetCtx.rotate(rotCar);

        // Kırmızı araba gövdesi
        targetCtx.fillStyle = "#dc2626";
        targetCtx.beginPath(); targetCtx.roundRect(-5.5, -3, 11, 5.5, 1.8); targetCtx.fill();
        targetCtx.strokeStyle = "#991b1b"; targetCtx.lineWidth = 0.6; targetCtx.stroke();
        // Tavan & Camlar
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.beginPath(); targetCtx.roundRect(-3.0, -5.5, 6, 3.2, [1.5, 1.5, 0.5, 0.5]); targetCtx.fill();
        targetCtx.strokeStyle = "#0284c7"; targetCtx.lineWidth = 0.5; targetCtx.stroke();
        // Ön Farlar
        targetCtx.fillStyle = "#fef08a";
        let frontX = isLeft ? -5.5 : 4.5;
        targetCtx.fillRect(frontX, -1.5, 1.2, 1.4);
        // Tekerlekler
        targetCtx.fillStyle = "#1e293b";
        targetCtx.beginPath(); targetCtx.arc(-3.8, 2.5, 1.6, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(3.8, 2.5, 1.6, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.beginPath(); targetCtx.arc(-3.8, 2.5, 0.7, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(3.8, 2.5, 0.7, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.restore();
        return;
    }

    // 7. İNCE BELLİ ÇAY BARDAĞI
    if (heldItem === 'cay') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);

        // Altın/kırmızı porselen çay tabağı
        targetCtx.fillStyle = "#ef4444";
        targetCtx.beginPath(); targetCtx.ellipse(0, 3.8, 4.5, 1.4, 0, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 0.8; targetCtx.stroke();

        // İnce belli kıvrımlı cam bardak silueti
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.45)";
        targetCtx.beginPath();
        targetCtx.moveTo(-2.4, -4.5);
        targetCtx.lineTo(2.4, -4.5);
        targetCtx.quadraticCurveTo(1.2, -0.5, 2.2, 3.2);
        targetCtx.lineTo(-2.2, 3.2);
        targetCtx.quadraticCurveTo(-1.2, -0.5, -2.4, -4.5);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.8)"; targetCtx.lineWidth = 0.6; targetCtx.stroke();

        // Tavşan kanı taze demli çay
        targetCtx.fillStyle = "#b91c1c";
        targetCtx.beginPath();
        targetCtx.moveTo(-1.8, -1.5);
        targetCtx.lineTo(1.8, -1.5);
        targetCtx.quadraticCurveTo(1.0, 0.5, 1.8, 2.8);
        targetCtx.lineTo(-1.8, 2.8);
        targetCtx.quadraticCurveTo(-1.0, 0.5, -1.8, -1.5);
        targetCtx.closePath();
        targetCtx.fill();

        // Bardaktan yükselen narin sıcak buhar
        let steamY = -7 - ((Date.now() / 40) % 8);
        targetCtx.strokeStyle = "rgba(255,255,255,0.65)"; targetCtx.lineWidth = 0.8;
        targetCtx.beginPath(); targetCtx.moveTo(-0.5, steamY + 4); targetCtx.quadraticCurveTo(isLeft ? -1.5 : 1.5, steamY + 2, 0, steamY); targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 7.1 SICAK ORALET KUPASI
    if (heldItem === 'oralet') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);

        targetCtx.fillStyle = '#b45309';
        targetCtx.beginPath();
        targetCtx.ellipse(0, 4, 5.2, 1.5, 0, 0, Math.PI * 2);
        targetCtx.fill();

        targetCtx.fillStyle = '#fff7ed';
        targetCtx.beginPath();
        targetCtx.roundRect(-3.4, -4.2, 6.8, 7.5, [1.2, 1.2, 2.2, 2.2]);
        targetCtx.fill();
        targetCtx.strokeStyle = '#c2410c';
        targetCtx.lineWidth = 0.8;
        targetCtx.stroke();

        targetCtx.fillStyle = '#ea580c';
        targetCtx.beginPath();
        targetCtx.ellipse(0, -3.8, 3.15, 1.1, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.strokeStyle = '#ffedd5';
        targetCtx.lineWidth = 0.55;
        targetCtx.beginPath();
        targetCtx.ellipse(0, -4.1, 2.3, 0.55, 0, Math.PI, Math.PI * 2);
        targetCtx.stroke();

        const handleX = isLeft ? -4 : 4;
        targetCtx.strokeStyle = '#fff7ed';
        targetCtx.lineWidth = 1.2;
        targetCtx.beginPath();
        targetCtx.arc(handleX, -0.5, 2.0, isLeft ? Math.PI * 0.5 : -Math.PI * 0.5, isLeft ? Math.PI * 1.5 : Math.PI * 0.5);
        targetCtx.stroke();
        targetCtx.strokeStyle = '#c2410c';
        targetCtx.lineWidth = 0.55;
        targetCtx.beginPath();
        targetCtx.arc(handleX, -0.5, 2.0, isLeft ? Math.PI * 0.5 : -Math.PI * 0.5, isLeft ? Math.PI * 1.5 : Math.PI * 0.5);
        targetCtx.stroke();

        targetCtx.fillStyle = '#f97316';
        targetCtx.beginPath();
        targetCtx.arc(0, -0.4, 0.8, 0, Math.PI * 2);
        targetCtx.fill();

        let steamY = -7 - ((Date.now() / 48) % 7);
        targetCtx.strokeStyle = 'rgba(255, 237, 213, 0.8)';
        targetCtx.lineWidth = 0.8;
        targetCtx.beginPath();
        targetCtx.moveTo(-1.8, steamY + 3);
        targetCtx.quadraticCurveTo(isLeft ? -3 : -0.5, steamY + 1.5, -1.3, steamY);
        targetCtx.moveTo(1.2, steamY + 4);
        targetCtx.quadraticCurveTo(isLeft ? 0 : 2.8, steamY + 2, 1.6, steamY - 1);
        targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 7.1. TÜTEN SİGARA (10.000 TL Özel Karizmatik El Eşyası & Periyodik Duman Çekme/Üfleme)
    if (heldItem === 'sigara') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.95 : 1.0);
        targetCtx.scale(scale, scale);

        // Parmakların arasından hafif yukarı/öne doğru karizmatik açı
        let rot = isLeft ? -0.35 : 0.35;
        if (isBack) rot = isLeft ? 0.30 : -0.30;
        if (smokeState && smokeState.liftProgress > 0) {
            let targetRot = isLeft ? -0.15 : 0.15;
            rot = rot + (targetRot - rot) * smokeState.liftProgress;
        }
        targetCtx.rotate(rot);

        let dir = isLeft ? -1 : 1;

        // 1. Sigara Filtresi (Turuncu/Kahve filtre kağıdı)
        targetCtx.fillStyle = "#d97706";
        targetCtx.beginPath();
        targetCtx.roundRect(dir > 0 ? -3 : 0, -1.2, 3, 2.4, 0.5);
        targetCtx.fill();
        targetCtx.strokeStyle = "#92400e";
        targetCtx.lineWidth = 0.4;
        targetCtx.stroke();

        // 2. Sigara Gövdesi (Beyaz kaliteli tütün kağıdı)
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.beginPath();
        targetCtx.roundRect(dir > 0 ? 0 : -8, -1.1, 8, 2.2, [0, 0.5, 0.5, 0]);
        targetCtx.fill();
        targetCtx.strokeStyle = "rgba(148, 163, 184, 0.6)";
        targetCtx.lineWidth = 0.4;
        targetCtx.stroke();

        // 3. Sigaranın Ucu ve Külü (Hafif gri kül çizgisi)
        let tipX = dir > 0 ? 8 : -8;
        targetCtx.fillStyle = "#64748b";
        targetCtx.beginPath();
        targetCtx.arc(tipX, 0, 1.1, 0, Math.PI * 2);
        targetCtx.fill();

        // 4. Yanan Kor Köz (Nefes alan canlı kızıllık / Nefes çekerken parlayan akkor)
        let pulse = (Math.sin(Date.now() / 280) + 1) * 0.5; // 0..1
        let isInhaling = (smokeState && smokeState.isInhaling);

        if (isInhaling) {
            // İçeri derin nefes çekilirken köz akkor alev gibi parlar!
            let inhalePulse = (Math.sin(Date.now() / 90) + 1) * 0.5;
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath();
            targetCtx.arc(tipX + (dir > 0 ? 0.4 : -0.4), 0, 1.4 + inhalePulse * 0.3, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.save();
            targetCtx.shadowColor = "#ff2200";
            targetCtx.shadowBlur = 12 + inhalePulse * 4;
            targetCtx.fillStyle = "rgba(255, 45, 0, 0.95)";
            targetCtx.beginPath();
            targetCtx.arc(tipX + (dir > 0 ? 0.4 : -0.4), 0, 1.2, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.restore();
        } else {
            targetCtx.fillStyle = pulse > 0.6 ? "#ff3700" : "#f97316";
            targetCtx.beginPath();
            targetCtx.arc(tipX + (dir > 0 ? 0.4 : -0.4), 0, 0.9 + pulse * 0.3, 0, Math.PI * 2);
            targetCtx.fill();

            // Kor közün etrafındaki hafif sıcak ışıma (radial glow)
            targetCtx.save();
            targetCtx.shadowColor = "#ff4500";
            targetCtx.shadowBlur = 4 + pulse * 3;
            targetCtx.fillStyle = "rgba(255, 69, 0, 0.8)";
            targetCtx.beginPath();
            targetCtx.arc(tipX + (dir > 0 ? 0.4 : -0.4), 0, 0.6, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.restore();
        }

        // 5. Hafif Tüten Duman Partikülleri (Nefes çekmiyorken uçtan tüter)
        if (!isInhaling) {
            targetCtx.save();
            targetCtx.translate(tipX, 0);
            targetCtx.rotate(-rot);

            let now = Date.now();
            for (let i = 0; i < 4; i++) {
                let progress = ((now / 1100) + (i * 0.25)) % 1.0;
                let smokeY = -progress * 15;
                let wave = Math.sin((now / 350) + i * 1.5) * (2.2 * progress);
                let smokeX = wave + (dir > 0 ? 1 : -1) * (progress * 2);
                let smokeRadius = 0.9 + (progress * 2.6);
                let alpha = Math.sin(progress * Math.PI) * 0.32;

                targetCtx.fillStyle = `rgba(226, 232, 240, ${alpha})`;
                targetCtx.beginPath();
                targetCtx.arc(smokeX, smokeY, smokeRadius, 0, Math.PI * 2);
                targetCtx.fill();
            }
            targetCtx.restore();
        }

        targetCtx.restore();

        // 6. Duman Üfleme (Exhale) Efekti - Ağızdan çıkan duman halkaları ve bulutlar
        if (smokeState && smokeState.isExhaling) {
            _safeDrawExhaleSmoke(targetCtx, pX, pY, facing, model, smokeState.exhaleProgress);
        }

        return;
    }

    // 7.2. K2 SİBER ENERJİ İÇECEĞİ (Neon Mavi / Siber Kutu İçecek)
    if (heldItem === 'k2_energy_drink') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.82 : (model === 'classic_2' ? 0.95 : 1.0);
        targetCtx.scale(scale, scale);
        let rot = isLeft ? -0.18 : 0.18;
        if (isBack) rot = isLeft ? 0.14 : -0.14;
        targetCtx.rotate(rot);

        // Kutu metalik gövde
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath();
        targetCtx.roundRect(-2.6, -5.5, 5.2, 10.5, [1.5, 1.5, 1.2, 1.2]);
        targetCtx.fill();
        targetCtx.strokeStyle = "#0369a1";
        targetCtx.lineWidth = 0.6;
        targetCtx.stroke();

        // Neon Mavi & Cyan Siber Enerji Şeridi
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.fillRect(-2.6, -2.5, 5.2, 4.5);

        // Parlayan Şimşek / Yıldırım Simgesi ⚡
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.moveTo(0.5, -2.0);
        targetCtx.lineTo(-1.2, 0);
        targetCtx.lineTo(0.2, 0);
        targetCtx.lineTo(-0.5, 1.8);
        targetCtx.lineTo(1.2, -0.2);
        targetCtx.lineTo(-0.2, -0.2);
        targetCtx.closePath();
        targetCtx.fill();

        // Üst gümüş kapak ve açma halkası (Pull-tab)
        targetCtx.fillStyle = "#e2e8f0";
        targetCtx.beginPath();
        targetCtx.ellipse(0, -5.5, 2.5, 0.9, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.strokeStyle = "#94a3b8";
        targetCtx.lineWidth = 0.5;
        targetCtx.stroke();

        // Soğuk buz pırıltısı
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
        targetCtx.fillRect(-1.8, -4.5, 0.8, 6.0);

        targetCtx.restore();
        return;
    }

    // 7.3. K2 GRAFİTİ SOKAK KAYKAYI (Skateboard)
    if (heldItem === 'k2_skateboard') {
        const isMounted = p && p.hasHorse;
        const isRidingSwan = p && p.hasSwanBoat;
        const isSitting = p && (p.action === 'sitting' || p.action === 'sit_floor');
        if (!isMounted && !isRidingSwan && !isSitting) {
            targetCtx.restore();
            return;
        }
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.90 : (model === 'classic_2' ? 1.05 : 1.0);
        targetCtx.scale(scale, scale);
        let rot = isLeft ? -0.22 : 0.22;
        if (isBack) rot = isLeft ? 0.18 : -0.18;
        targetCtx.rotate(rot);

        // Kaykay Tahtası (Deck): Uzunluk 22px, Genişlik 6.4px (Çift Kavisli Kicktail)
        const deckW = 6.4;
        const deckH = 22.0;

        // Katmanlı ahşap kenar çizgisi (7-ply maple)
        targetCtx.fillStyle = "#d97706";
        targetCtx.beginPath();
        targetCtx.roundRect(-deckW / 2 - 0.3, -deckH / 2, deckW + 0.6, deckH, [2.5, 2.5, 2.5, 2.5]);
        targetCtx.fill();

        if (isBack) {
            // ARKADAN BAKIŞ: Kaykayın alt grafiti yüzeyi sergilenir
            targetCtx.fillStyle = "#18181b"; // Mat antrasit zemin
            targetCtx.beginPath();
            targetCtx.roundRect(-deckW / 2, -deckH / 2 + 0.3, deckW, deckH - 0.6, [2.2, 2.2, 2.2, 2.2]);
            targetCtx.fill();

            // Neon Pembe & Yeşil Grafiti Sprey Deseni
            targetCtx.fillStyle = "#ec4899";
            targetCtx.beginPath();
            targetCtx.moveTo(-deckW / 2, -4); targetCtx.lineTo(deckW / 2, -1);
            targetCtx.lineTo(deckW / 2, 6); targetCtx.lineTo(-deckW / 2, 3);
            targetCtx.closePath(); targetCtx.fill();

            targetCtx.fillStyle = "#22c55e";
            targetCtx.beginPath();
            targetCtx.moveTo(-deckW / 2, 2); targetCtx.lineTo(deckW / 2, 5);
            targetCtx.lineTo(deckW / 2, 8); targetCtx.lineTo(-deckW / 2, 6);
            targetCtx.closePath(); targetCtx.fill();

            // Sarı Grafiti Tag
            targetCtx.fillStyle = "#facc15";
            targetCtx.fillRect(-1.6, -1.5, 3.2, 1.2);
            targetCtx.fillRect(-1.6, 1.5, 3.2, 1.2);

            // Metalik Dingiller (Trucks) & Vidalar
            targetCtx.fillStyle = "#94a3b8";
            targetCtx.fillRect(-deckW / 2 - 0.8, -deckH / 2 + 3.8, deckW + 1.6, 1.6);
            targetCtx.fillRect(-deckW / 2 - 0.8, deckH / 2 - 5.4, deckW + 1.6, 1.6);

            // 4 Neon Yeşil Kaykay Tekerleği
            targetCtx.fillStyle = "#a3e635";
            targetCtx.fillRect(-deckW / 2 - 1.8, -deckH / 2 + 3.2, 1.4, 2.8);
            targetCtx.fillRect(deckW / 2 + 0.4, -deckH / 2 + 3.2, 1.4, 2.8);
            targetCtx.fillRect(-deckW / 2 - 1.8, deckH / 2 - 6.0, 1.4, 2.8);
            targetCtx.fillRect(deckW / 2 + 0.4, deckH / 2 - 6.0, 1.4, 2.8);

        } else {
            // ÖNDEN BAKIŞ: Siyah Zımpara (Grip Tape) ve ortadan geçen neon turuncu çizgi
            targetCtx.fillStyle = "#1e293b";
            targetCtx.beginPath();
            targetCtx.roundRect(-deckW / 2, -deckH / 2 + 0.3, deckW, deckH - 0.6, [2.2, 2.2, 2.2, 2.2]);
            targetCtx.fill();

            // Zımpara orta neon turuncu çizgisi
            targetCtx.fillStyle = "#ea580c";
            targetCtx.fillRect(-0.4, -deckH / 2 + 2, 0.8, deckH - 4);

            // Gümüş Deste Vidaları (Hardware)
            targetCtx.fillStyle = "#e2e8f0";
            targetCtx.fillRect(-1.8, -deckH / 2 + 3.8, 0.8, 0.8);
            targetCtx.fillRect(1.0, -deckH / 2 + 3.8, 0.8, 0.8);
            targetCtx.fillRect(-1.8, deckH / 2 - 4.6, 0.8, 0.8);
            targetCtx.fillRect(1.0, deckH / 2 - 4.6, 0.8, 0.8);

            // Kenarlardan görünen tekerlek profilleri
            targetCtx.fillStyle = "#a3e635";
            targetCtx.fillRect(-deckW / 2 - 1.2, -deckH / 2 + 3.4, 1.0, 2.4);
            targetCtx.fillRect(deckW / 2 + 0.2, -deckH / 2 + 3.4, 1.0, 2.4);
            targetCtx.fillRect(-deckW / 2 - 1.2, deckH / 2 - 5.8, 1.0, 2.4);
            targetCtx.fillRect(deckW / 2 + 0.2, deckH / 2 - 5.8, 1.0, 2.4);
        }

        targetCtx.restore();
        return;
    }

    // 8. NOSTALJİK YEŞİL CAM GAZOZ
    if (heldItem === 'gazoz') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);
        let rot = isLeft ? -0.16 : 0.16;
        if (isBack) rot = isLeft ? 0.14 : -0.14;
        targetCtx.rotate(rot);

        targetCtx.fillStyle = "#16a34a";
        targetCtx.beginPath(); targetCtx.roundRect(-2.2, -3, 4.4, 8.5, 2); targetCtx.fill();
        targetCtx.fillStyle = "#15803d"; targetCtx.fillRect(-1.2, -7.5, 2.4, 4.5); // Şişe boynu
        targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(-1.8, -9, 3.6, 1.4); // Taç kapak
        targetCtx.fillStyle = "#ffffff"; targetCtx.fillRect(-1.8, -0.5, 3.6, 3.5); // Etiket
        targetCtx.strokeStyle = "#14532d"; targetCtx.lineWidth = 0.5; targetCtx.strokeRect(-2.2, -3, 4.4, 8.5);

        targetCtx.restore();
        return;
    }

    // 9. KÖZDE TÜRK KAHVESİ
    if (heldItem === 'kahve') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);

        // Altın tepsi / fincan tabağı
        targetCtx.fillStyle = "#ca8a04";
        targetCtx.beginPath(); targetCtx.ellipse(0, 3.5, 5.8, 1.8, 0, 0, Math.PI * 2); targetCtx.fill();
        // Beyaz porselen fincan
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.roundRect(-3.2, -3.5, 6.4, 6.0, 2); targetCtx.fill();
        targetCtx.strokeStyle = "#d97706"; targetCtx.lineWidth = 0.8; targetCtx.stroke();
        // Bol köpük
        targetCtx.fillStyle = "#451a03"; targetCtx.fillRect(-2.5, -2.5, 5.0, 1.8);
        // Altın kulp (Kulp dışa doğru yönlenir)
        let handleX = isLeft ? -3.8 : 3.8;
        let handleStartAngle = isLeft ? Math.PI * 0.5 : -Math.PI * 0.5;
        let handleEndAngle = isLeft ? Math.PI * 1.5 : Math.PI * 0.5;
        targetCtx.strokeStyle = "#ca8a04"; targetCtx.lineWidth = 1.0;
        targetCtx.beginPath(); targetCtx.arc(handleX, -0.5, 1.8, handleStartAngle, handleEndAngle); targetCtx.stroke();
        // Kahve dumanı
        let steamY = -6 - ((Date.now() / 40) % 8);
        targetCtx.strokeStyle = "rgba(255,255,255,0.65)"; targetCtx.lineWidth = 0.8;
        targetCtx.beginPath(); targetCtx.moveTo(-1, steamY + 4); targetCtx.quadraticCurveTo(isLeft ? -2 : 2, steamY + 2, 0, steamY); targetCtx.stroke();

        targetCtx.restore();
        return;
    }

    // 10. ŞAMPİYONLUK ALTIN KUPASI
    if (heldItem === 'kupa') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);

        // Siyah mermer kaide
        targetCtx.fillStyle = "#1e293b"; targetCtx.fillRect(-4.0, 2.5, 8.0, 2.5);
        // Altın boyun
        targetCtx.fillStyle = "#eab308"; targetCtx.fillRect(-1.4, -0.5, 2.8, 3.0);
        // Kupa gövdesi
        let cupW = 5.2;
        let cupH = 6.8;
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.moveTo(-cupW, -cupH); targetCtx.lineTo(cupW, -cupH);
        targetCtx.lineTo(cupW * 0.5, -0.5); targetCtx.lineTo(-cupW * 0.5, -0.5);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#b45309"; targetCtx.lineWidth = 0.8; targetCtx.stroke();
        // Kulplar
        targetCtx.strokeStyle = "#ca8a04"; targetCtx.lineWidth = 1.2;
        targetCtx.beginPath(); targetCtx.arc(-cupW - 1.0, -cupH * 0.5, 2.4, Math.PI * 0.5, Math.PI * 1.5); targetCtx.stroke();
        targetCtx.beginPath(); targetCtx.arc(cupW + 1.0, -cupH * 0.5, 2.4, -Math.PI * 0.5, Math.PI * 0.5); targetCtx.stroke();
        // Işıltı
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.75)";
        targetCtx.beginPath(); targetCtx.arc(-1.6, -cupH * 0.6, 1.2, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.restore();
        return;
    }

    // 11. YILDIZLI BÜYÜ ASASI (ASAGOLD)
    if (heldItem === 'asagold') {
        let now = Date.now();
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);
        let aRot = isLeft ? 0.25 : -0.25;
        if (isBack) aRot = isLeft ? 0.18 : -0.18;
        targetCtx.rotate(aRot);

        let staffH = isPreview ? 32 : 27;
        targetCtx.strokeStyle = "#d97706"; targetCtx.lineWidth = isPreview ? 3.5 : 2.8;
        targetCtx.beginPath(); targetCtx.moveTo(0, 5); targetCtx.lineTo(0, -staffH); targetCtx.stroke();

        let starGlow = Math.sin(now / 140) * 0.2 + 0.8;
        targetCtx.fillStyle = `rgba(56, 189, 248, ${starGlow})`;
        targetCtx.beginPath(); targetCtx.arc(0, -staffH, isPreview ? 6.5 : 5.5, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(0, -staffH, isPreview ? 3 : 2.5, 0, Math.PI * 2); targetCtx.fill();

        for (let s = 0; s < 3; s++) {
            let sAngle = (now / 200) + (s * (Math.PI * 2 / 3));
            let sDist = isPreview ? 9 : 7.5;
            let spX = Math.cos(sAngle) * sDist;
            let spY = -staffH + Math.sin(sAngle) * sDist;
            targetCtx.fillStyle = "#facc15";
            targetCtx.beginPath(); targetCtx.arc(spX, spY, 1.2, 0, Math.PI * 2); targetCtx.fill();
        }

        targetCtx.restore();
        return;
    }

    // 12. GELENEKSEL DUMANLI NARGİLE
    if (heldItem === 'nargile') {
        let now = Date.now();
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        let nX = (model === 'classic_2' ? (pX + (isLeft ? -11 : 11)) : (handX + (isLeft ? -7 : 7)));
        let nY = (model === 'classic_2' ? (pY + 18.0) : (handY + (isPreview ? 12 : 10)));
        let vaseR = (isPreview ? 8.5 : 7) * scale;

        // Zemin gölgesi
        targetCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
        targetCtx.beginPath(); targetCtx.ellipse(nX, nY + 1.5, vaseR * 1.1, vaseR * 0.45, 0, 0, Math.PI * 2); targetCtx.fill();

        // Cam ser/şişe gövdesi
        targetCtx.fillStyle = "rgba(14, 165, 233, 0.55)";
        targetCtx.beginPath(); targetCtx.arc(nX, nY - vaseR * 0.7, vaseR, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.75)"; targetCtx.lineWidth = 1.0; targetCtx.stroke();

        let stemTopY = (nY - vaseR * 0.7) - ((isPreview ? 24 : 20) * scale);
        targetCtx.strokeStyle = "#eab308"; targetCtx.lineWidth = (isPreview ? 3 : 2.5) * scale;
        targetCtx.beginPath(); targetCtx.moveTo(nX, nY - vaseR * 1.5); targetCtx.lineTo(nX, stemTopY); targetCtx.stroke();

        targetCtx.fillStyle = "#ca8a04";
        targetCtx.beginPath(); targetCtx.ellipse(nX, stemTopY, (isPreview ? 8.5 : 7) * scale, (isPreview ? 2.8 : 2.2) * scale, 0, 0, Math.PI * 2); targetCtx.fill();

        let headH = (isPreview ? 6.5 : 5.5) * scale;
        targetCtx.fillStyle = "#9a3412";
        targetCtx.fillRect(nX - (isPreview ? 4 : 3.5) * scale, stemTopY - headH, (isPreview ? 8 : 7) * scale, headH);

        let coalGlow = Math.sin(now / 150) * 0.25 + 0.75;
        targetCtx.fillStyle = `rgba(239, 68, 68, ${coalGlow})`;
        targetCtx.beginPath(); targetCtx.arc(nX - 1.2 * scale, stemTopY - headH - 1, 1.5 * scale, 0, Math.PI * 2); targetCtx.fill();

        // Hortum bağlantısı (şişenin üst boğazından ele doğru zarif kavisle yükselir)
        targetCtx.strokeStyle = "#991b1b"; targetCtx.lineWidth = (isPreview ? 2.2 : 1.8) * scale;
        targetCtx.beginPath();
        let hoseStartX = nX - (isLeft ? -vaseR * 0.6 : vaseR * 0.6);
        let hoseStartY = nY - vaseR * 1.2;
        targetCtx.moveTo(hoseStartX, hoseStartY);
        targetCtx.quadraticCurveTo(nX + (isLeft ? -3 : 3), (hoseStartY + handY) / 2 + 3, handX, handY);
        targetCtx.stroke();

        // Elde tutulan altın marpuç
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(handX, handY, (isPreview ? 3 : 2.5) * scale, 0, Math.PI * 2); targetCtx.fill();

        // Közden yükselen duman bulutları
        for (let i = 0; i < 4; i++) {
            let cycle = ((now / (650 + i * 160)) + (i * 0.25)) % 1;
            let smX = nX + Math.sin((now / 260) + i * 1.5) * (2.0 + cycle * 4);
            let smY = (stemTopY - headH - 3) - (cycle * ((isPreview ? 28 : 22) * scale));
            let smR = (2.2 + cycle * 6.0) * scale;
            let smA = Math.sin(cycle * Math.PI) * 0.40;
            targetCtx.fillStyle = `rgba(241, 245, 249, ${smA})`;
            targetCtx.beginPath(); targetCtx.arc(smX, smY, smR, 0, Math.PI * 2); targetCtx.fill();
        }

        targetCtx.restore();
        return;
    }

    // 13. LİMONATA & SAHİL KOKTEYLLERİ
    if (heldItem === 'limonata' || heldItem === 'lemonade' || heldItem.startsWith('cocktail_')) {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.92 : 1.0);
        targetCtx.scale(scale, scale);
        let rot = isLeft ? -0.12 : 0.12;
        if (isBack) rot = isLeft ? 0.10 : -0.10;
        targetCtx.rotate(rot);

        let cType = (heldItem === 'limonata' || heldItem === 'lemonade') ? 'lemonade' : heldItem.replace('cocktail_', '');

        if (cType === 'coconut') {
            targetCtx.fillStyle = "#5c3317";
            targetCtx.beginPath(); targetCtx.arc(0, 0.5, isPreview ? 6.5 : 5.5, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#38200f"; targetCtx.lineWidth = 1; targetCtx.stroke();
            targetCtx.fillStyle = "#f8fafc";
            targetCtx.beginPath(); targetCtx.ellipse(0, -2.5, isPreview ? 4.5 : 3.8, isPreview ? 2.2 : 1.8, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#ef4444"; targetCtx.lineWidth = 1.2;
            targetCtx.beginPath(); targetCtx.moveTo(0, -2.5); targetCtx.lineTo(3.5, -8.5); targetCtx.stroke();
            targetCtx.fillStyle = "#ec4899";
            targetCtx.beginPath(); targetCtx.arc(-2, -4.5, 2.5, Math.PI, 0); targetCtx.fill();
        } else {
            let liquidColor = "#facc15";
            let strawColor = "#10b981";
            let fruitColor = "#eab308";

            if (cType === 'pineapple') {
                liquidColor = "#f59e0b"; strawColor = "#3b82f6"; fruitColor = "#facc15";
            } else if (cType === 'mojito') {
                liquidColor = "#f43f5e"; strawColor = "#22c55e"; fruitColor = "#84cc16";
            } else if (cType === 'sunset') {
                liquidColor = "#f97316"; strawColor = "#a855f7"; fruitColor = "#dc2626";
            }

            let gW = isPreview ? 4.5 : 3.8;
            let gH = isPreview ? 9 : 7.5;
            targetCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
            targetCtx.beginPath();
            targetCtx.moveTo(-gW, -gH);
            targetCtx.lineTo(gW, -gH);
            targetCtx.lineTo(gW * 0.7, 2);
            targetCtx.lineTo(-gW * 0.7, 2);
            targetCtx.closePath(); targetCtx.fill();
            targetCtx.strokeStyle = "rgba(255, 255, 255, 0.85)"; targetCtx.lineWidth = 0.8; targetCtx.stroke();

            targetCtx.fillStyle = liquidColor;
            targetCtx.beginPath();
            targetCtx.moveTo(-gW * 0.9, -gH + 2);
            targetCtx.lineTo(gW * 0.9, -gH + 2);
            targetCtx.lineTo(gW * 0.65, 1.2);
            targetCtx.lineTo(-gW * 0.65, 1.2);
            targetCtx.closePath(); targetCtx.fill();

            // Pipet
            targetCtx.strokeStyle = strawColor; targetCtx.lineWidth = 1.0;
            targetCtx.beginPath();
            targetCtx.moveTo(0.5, 0);
            targetCtx.lineTo(1.8, -gH - 3);
            targetCtx.stroke();

            // Meyve dilimi
            targetCtx.fillStyle = fruitColor;
            targetCtx.beginPath();
            targetCtx.arc(-gW * 0.6, -gH, 1.8, 0, Math.PI * 2);
            targetCtx.fill();
        }

        targetCtx.restore();
        return;
    }

    // 14. BÜFE ATIŞTIRMALIKLARI (PATLAMIŞ MISIR, KOLA, SOSİSLİ, CİPS)
    if (heldItem === 'popcorn' || heldItem === 'kola' || heldItem === 'hotdog' || heldItem === 'chips') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.95 : 1.0);
        targetCtx.scale(scale, scale);

        if (heldItem === 'popcorn') {
            // Kırmızı-Beyaz Çizgili Mısır Kovası
            targetCtx.fillStyle = "#ef4444";
            targetCtx.beginPath();
            targetCtx.moveTo(-4, -6); targetCtx.lineTo(4, -6);
            targetCtx.lineTo(3, 2); targetCtx.lineTo(-3, 2);
            targetCtx.closePath(); targetCtx.fill();
            // Beyaz şeritler
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(-1.2, -6, 2.4, 7.5);
            // Tepedeki kabarık patlamış mısırlar
            targetCtx.fillStyle = "#fef08a";
            [-3, -1, 1, 3].forEach(px => {
                targetCtx.beginPath();
                targetCtx.arc(px, -7, 1.8, 0, Math.PI * 2);
                targetCtx.fill();
            });
            targetCtx.fillStyle = "#fde047";
            targetCtx.beginPath(); targetCtx.arc(0, -8.2, 1.6, 0, Math.PI * 2); targetCtx.fill();
        } else if (heldItem === 'kola') {
            // Kırmızı Kutu Kola
            targetCtx.fillStyle = "#dc2626";
            targetCtx.beginPath();
            targetCtx.roundRect(-2.8, -7, 5.6, 9.5, 1.5);
            targetCtx.fill();
            // Metal kapak
            targetCtx.fillStyle = "#cbd5e1";
            targetCtx.fillRect(-2.5, -7.5, 5, 1.2);
            // Beyaz dalga logosu
            targetCtx.strokeStyle = "#ffffff";
            targetCtx.lineWidth = 0.8;
            targetCtx.beginPath();
            targetCtx.moveTo(-2, -3); targetCtx.quadraticCurveTo(0, -1.5, 2, -3);
            targetCtx.stroke();
        } else if (heldItem === 'hotdog') {
            // Sosisli Sandviç
            targetCtx.fillStyle = "#d97706"; // Ekmek
            targetCtx.beginPath();
            targetCtx.ellipse(0, -1, 5.5, 2.8, -0.15, 0, Math.PI * 2);
            targetCtx.fill();
            // Kırmızı Sosis
            targetCtx.fillStyle = "#b91c1c";
            targetCtx.beginPath();
            targetCtx.ellipse(0, -1.8, 6.2, 1.6, -0.15, 0, Math.PI * 2);
            targetCtx.fill();
            // Hardal zig-zag
            targetCtx.strokeStyle = "#facc15";
            targetCtx.lineWidth = 0.9;
            targetCtx.beginPath();
            targetCtx.moveTo(-4, -1.8);
            targetCtx.lineTo(-2, -2.5); targetCtx.lineTo(0, -1.5); targetCtx.lineTo(2, -2.5); targetCtx.lineTo(4, -1.8);
            targetCtx.stroke();
        } else if (heldItem === 'chips') {
            // Cips Paketi
            targetCtx.fillStyle = "#3b82f6";
            targetCtx.beginPath();
            targetCtx.roundRect(-3.5, -6.5, 7, 9, 1);
            targetCtx.fill();
            targetCtx.fillStyle = "#facc15";
            targetCtx.fillRect(-2.5, -3, 5, 2.5);
        }

        targetCtx.restore();
        return;
    }

    // 10.4 CANLI ÇİÇEKLER (GÜL, PAPATYA, ORKİDE - 8 YÖNLÜ EL EŞYALARI)
    if (heldItem === 'cicek_gul' || heldItem === 'cicek_papatya' || heldItem === 'cicek_orkide' || heldItem === 'cicek_lale' || heldItem === 'cicek_lavanta' || heldItem === 'cicek_aycicegi' || heldItem === 'cicek_sakayik') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.95 : 1.0);
        targetCtx.scale(scale, scale);

        // Sap ve Canlı Yeşil Yaprak
        targetCtx.strokeStyle = "#16a34a";
        targetCtx.lineWidth = 1.8;
        targetCtx.beginPath();
        targetCtx.moveTo(0, 3);
        targetCtx.lineTo(2, -9);
        targetCtx.stroke();

        // Minik Yaprak
        targetCtx.fillStyle = "#22c55e";
        targetCtx.beginPath();
        targetCtx.ellipse(3, -3, 3, 1.5, 0.4, 0, Math.PI * 2);
        targetCtx.fill();

        if (heldItem === 'cicek_gul') {
            // Asil Kırmızı Kadife Gül
            targetCtx.fillStyle = "#dc2626";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 5.5, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#ef4444";
            targetCtx.beginPath();
            targetCtx.arc(1, -13, 3.5, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#991b1b";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 2.0, 0, Math.PI * 2);
            targetCtx.fill();

        } else if (heldItem === 'cicek_papatya') {
            // Beyaz Taç Yapraklı Kır Papatyası
            targetCtx.fillStyle = "#ffffff";
            for (let a = 0; a < 8; a++) {
                let rad = a * (Math.PI / 4);
                targetCtx.beginPath();
                targetCtx.ellipse(2 + Math.cos(rad) * 3.8, -12 + Math.sin(rad) * 3.8, 2.2, 1.2, rad, 0, Math.PI * 2);
                targetCtx.fill();
            }
            // Sarı Orta Tohumluk
            targetCtx.fillStyle = "#facc15";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 2.5, 0, Math.PI * 2);
            targetCtx.fill();

        } else if (heldItem === 'cicek_orkide') {
            // Büyüleyici Mor Kraliyet Orkidesi
            targetCtx.fillStyle = "#c084fc";
            targetCtx.beginPath();
            targetCtx.ellipse(2, -15, 3.5, 2.0, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.beginPath();
            targetCtx.ellipse(-1, -11, 3.0, 2.0, -0.6, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.beginPath();
            targetCtx.ellipse(5, -11, 3.0, 2.0, 0.6, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#7e22ce";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 2.2, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#fde047";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 1.0, 0, Math.PI * 2);
            targetCtx.fill();

        } else if (heldItem === 'cicek_lale') {
            // Asil Sultan Lalesi (Kadeh Formunda Kırmızı-Altın Taç Yapraklar)
            targetCtx.fillStyle = "#dc2626";
            targetCtx.beginPath();
            targetCtx.ellipse(2, -12, 4.5, 6.0, 0, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#b91c1c";
            targetCtx.beginPath();
            targetCtx.ellipse(0, -12.5, 3.0, 5.2, -0.2, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#facc15"; // Altın Alev Deseni
            targetCtx.beginPath();
            targetCtx.moveTo(2, -7);
            targetCtx.lineTo(0.5, -13.5);
            targetCtx.lineTo(3.5, -13.5);
            targetCtx.closePath();
            targetCtx.fill();

        } else if (heldItem === 'cicek_lavanta') {
            // Mis Kokulu Dağ Lavantası (Sıralı Mor Başaklar)
            targetCtx.strokeStyle = "#7c3aed";
            targetCtx.lineWidth = 3.2;
            targetCtx.beginPath();
            targetCtx.moveTo(2, -6);
            targetCtx.lineTo(2, -17);
            targetCtx.stroke();

            targetCtx.fillStyle = "#a855f7";
            for (let i = 0; i < 5; i++) {
                targetCtx.beginPath();
                targetCtx.arc(0.5, -7 - i * 2.2, 1.8, 0, Math.PI * 2);
                targetCtx.arc(3.5, -7 - i * 2.2, 1.8, 0, Math.PI * 2);
                targetCtx.fill();
            }

            targetCtx.fillStyle = "#c084fc";
            targetCtx.beginPath();
            targetCtx.arc(2, -18, 1.6, 0, Math.PI * 2);
            targetCtx.fill();

        } else if (heldItem === 'cicek_sakayik') {
            // Katmerli Pembe Şakayık (Geniş İpeksi Pembe Katmanlar & Altın Polenler)
            targetCtx.fillStyle = "#fbcfe8";
            for (let a = 0; a < 8; a++) {
                let rad = a * (Math.PI / 4);
                targetCtx.beginPath();
                targetCtx.ellipse(2 + Math.cos(rad) * 4.2, -12 + Math.sin(rad) * 4.2, 3.2, 2.0, rad, 0, Math.PI * 2);
                targetCtx.fill();
            }
            targetCtx.fillStyle = "#f472b6";
            for (let a = 0; a < 6; a++) {
                let rad = a * (Math.PI / 3) + 0.3;
                targetCtx.beginPath();
                targetCtx.ellipse(2 + Math.cos(rad) * 2.2, -12 + Math.sin(rad) * 2.2, 2.4, 1.6, rad, 0, Math.PI * 2);
                targetCtx.fill();
            }
            targetCtx.fillStyle = "#db2777";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 2.2, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#fde047";
            targetCtx.beginPath();
            targetCtx.arc(1.5, -12.5, 1.0, 0, Math.PI * 2);
            targetCtx.fill();

        } else if (heldItem === 'cicek_aycicegi') {
            // Dev Güneş Ayçiçeği (Altın Işın Yapraklar & Kahverengi Tohum Tablası)
            targetCtx.fillStyle = "#f59e0b";
            for (let a = 0; a < 10; a++) {
                let rad = a * (Math.PI / 5);
                targetCtx.beginPath();
                targetCtx.ellipse(2 + Math.cos(rad) * 4.8, -12 + Math.sin(rad) * 4.8, 3.2, 1.5, rad, 0, Math.PI * 2);
                targetCtx.fill();
            }

            targetCtx.fillStyle = "#451a03";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 3.2, 0, Math.PI * 2);
            targetCtx.fill();

            targetCtx.fillStyle = "#78350f";
            targetCtx.beginPath();
            targetCtx.arc(2, -12, 1.6, 0, Math.PI * 2);
            targetCtx.fill();
        }

        targetCtx.restore();
        return;
    }

    // -------------------------------------------------------------
    // 16. 8-YÖNLÜ İZOMETRİK KAZMA (kazma) & VURUŞ ANİMASYONU
    // -------------------------------------------------------------
    if (heldItem === 'kazma') {
        targetCtx.translate(handX, handY);

        let isMining = (p && p.action === 'mining');
        let swingRot = 0;
        if (isMining) {
            let phase = (Date.now() % 400) / 400;
            swingRot = (phase < 0.35) ? (phase / 0.35) * 1.35 : (1 - (phase - 0.35) / 0.65) * 1.35;
        }

        // Kazma boşta tutulurken yüzü/ağzı kapatmayacak şekilde yana doğru açılı (0.85 rad) tutulur, maden vurulurken dinamik savrulur
        let baseRot = isMining ? 0.40 : 0.85;
        let rot = isLeft ? (-baseRot - (isMining ? swingRot : 0)) : (baseRot + (isMining ? swingRot : 0));
        if (isBack) rot += (isLeft ? 0.25 : -0.25);

        let scale = isBack ? 0.85 : (model === 'classic_2' ? 0.95 : 1.0);
        targetCtx.scale(scale, scale);
        targetCtx.rotate(rot);

        // A) Sağlam Meşe/Kestane Ahşap Sap
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(-1.5, -24, 3, 27);
        targetCtx.strokeStyle = "#451a03";
        targetCtx.lineWidth = 0.6;
        targetCtx.strokeRect(-1.5, -24, 3, 27);

        // Sap Tutma Bandajı (Leather Grip Wrap)
        targetCtx.fillStyle = "#92400e";
        targetCtx.fillRect(-1.5, -3, 3, 6);

        // B) Kavisli Çelik / Dövme Demir Kazma Başı (Curved Pickaxe Head)
        targetCtx.save();
        targetCtx.translate(0, -22);

        // Çelik Merkez Yakası ve Perçin
        targetCtx.fillStyle = "#475569";
        targetCtx.fillRect(-3.5, -3, 7, 6);
        targetCtx.strokeStyle = "#1e293b";
        targetCtx.lineWidth = 0.7;
        targetCtx.strokeRect(-3.5, -3, 7, 6);
        targetCtx.fillStyle = "#cbd5e1";
        targetCtx.beginPath(); targetCtx.arc(0, 0, 1.2, 0, Math.PI * 2); targetCtx.fill();

        // Sol Kavisli Sivri Uç (Sol Kazma Pençesi)
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.beginPath();
        targetCtx.moveTo(-3, -2);
        targetCtx.quadraticCurveTo(-10, -3, -16, 3);
        targetCtx.lineTo(-14, 5.5);
        targetCtx.quadraticCurveTo(-8, 1, -3, 2);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.strokeStyle = "#475569";
        targetCtx.lineWidth = 0.6;
        targetCtx.stroke();

        // Sağ Kavisli Sivri Uç (Sağ Kazma Pençesi)
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.beginPath();
        targetCtx.moveTo(3, -2);
        targetCtx.quadraticCurveTo(10, -3, 16, 3);
        targetCtx.lineTo(14, 5.5);
        targetCtx.quadraticCurveTo(8, 1, 3, 2);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.strokeStyle = "#475569";
        targetCtx.lineWidth = 0.6;
        targetCtx.stroke();

        // Parlak Çelik Sivri Uçlar (Gleaming Pick Points)
        targetCtx.fillStyle = "#e2e8f0";
        targetCtx.beginPath(); targetCtx.arc(-15.5, 4.2, 1.4, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(15.5, 4.2, 1.4, 0, Math.PI * 2); targetCtx.fill();

        targetCtx.restore();

        targetCtx.restore();
        return;
    }

    // -------------------------------------------------------------
    // YENİ EL EŞYALARI (DİNOZOR, SU TABANCASI, DRONE, SÜPÜRGE, TÜRK & 4 BÜYÜKLERİN BAYRAKLARI)
    // -------------------------------------------------------------
    if (heldItem === 'oyuncak_dinozor') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.88 : (model === 'classic_2' ? 1.05 : 1.15);
        targetCtx.scale(isLeft ? -scale : scale, scale);
        
        let rot = (isBack ? 0.12 : -0.15) + Math.sin(Date.now() / 320) * 0.08;
        targetCtx.rotate(rot);

        // Sevimli Yeşil T-Rex Peluş Oyuncak (8-Yönlü 2.5D Derinlik)
        targetCtx.save();
        if (isBack) {
            // ARKA GÖRÜNÜM (Sırt Dikenleri, Ense, Kıvrık Kuyruk ve Bacaklar)
            // Kuyruk
            targetCtx.fillStyle = "#16a34a";
            targetCtx.beginPath();
            targetCtx.moveTo(-3, 5);
            targetCtx.quadraticCurveTo(-10, 9, -12, 14);
            targetCtx.quadraticCurveTo(-6, 11, 0, 7);
            targetCtx.closePath();
            targetCtx.fill();

            // Sırt ve Gövde
            targetCtx.fillStyle = "#22c55e";
            targetCtx.beginPath();
            targetCtx.ellipse(0, 3, 6.5, 8.5, 0.1, 0, Math.PI * 2);
            targetCtx.fill();

            // Bacaklar
            targetCtx.fillStyle = "#15803d";
            targetCtx.beginPath(); targetCtx.ellipse(-3.5, 10, 2.5, 3.5, -0.1, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.ellipse(3.5, 10, 2.5, 3.5, 0.1, 0, Math.PI * 2); targetCtx.fill();

            // Kafa (Arkadan Yuvarlak Baş)
            targetCtx.fillStyle = "#22c55e";
            targetCtx.beginPath();
            targetCtx.ellipse(0, -5.5, 5.5, 6.2, 0, 0, Math.PI * 2);
            targetCtx.fill();

            // Sırt boyunca uzanan parlak turuncu dikenler (Omurga)
            targetCtx.fillStyle = "#f97316";
            [-10, -7, -4, -1, 2, 5].forEach(sy => {
                targetCtx.beginPath();
                targetCtx.moveTo(0, sy - 1.5);
                targetCtx.lineTo(2.5, sy);
                targetCtx.lineTo(0, sy + 1.5);
                targetCtx.closePath();
                targetCtx.fill();
            });

            // Sevimli dikiş izi
            targetCtx.strokeStyle = "rgba(0,0,0,0.18)";
            targetCtx.lineWidth = 0.6;
            targetCtx.beginPath();
            targetCtx.moveTo(0, -9); targetCtx.lineTo(0, 8);
            targetCtx.stroke();
        } else {
            // ÖN VE PROFİL GÖRÜNÜM
            // Kuyruk
            targetCtx.fillStyle = "#16a34a";
            targetCtx.beginPath();
            targetCtx.moveTo(-4, 4);
            targetCtx.quadraticCurveTo(-11, 8, -13, 14);
            targetCtx.quadraticCurveTo(-7, 10, -1, 7);
            targetCtx.closePath();
            targetCtx.fill();

            // Gövde & Karın
            targetCtx.fillStyle = "#22c55e";
            targetCtx.beginPath();
            targetCtx.ellipse(0, 3, 6, 8, -0.2, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.fillStyle = "#bbf7d0"; // Açık fıstık yeşili göbek
            targetCtx.beginPath();
            targetCtx.ellipse(2, 4, 3.2, 5.5, -0.2, 0, Math.PI * 2);
            targetCtx.fill();

            // Sırt Dikenleri (Turuncu/Sarı Dikenler)
            targetCtx.fillStyle = "#f97316";
            [-4, -1, 2].forEach(sy => {
                targetCtx.beginPath();
                targetCtx.moveTo(-5.5, sy);
                targetCtx.lineTo(-9, sy - 2);
                targetCtx.lineTo(-5, sy - 3.5);
                targetCtx.closePath();
                targetCtx.fill();
            });

            // Bacaklar & Mini Ayaklar
            targetCtx.fillStyle = "#15803d";
            targetCtx.beginPath(); targetCtx.ellipse(-2, 10, 2.5, 3.5, 0.2, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.ellipse(3, 10, 2.5, 3.5, 0.2, 0, Math.PI * 2); targetCtx.fill();

            // Kafa (T-Rex Profil Kafası)
            targetCtx.fillStyle = "#22c55e";
            targetCtx.beginPath();
            targetCtx.roundRect(-2, -8, 11, 8, [4, 6, 4, 3]);
            targetCtx.fill();

            // Sevimli İri Göz
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(2.5, -5.5, 2.2, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#0f172a";
            targetCtx.beginPath(); targetCtx.arc(3.2, -5.5, 1.2, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(3.8, -6.0, 0.5, 0, Math.PI * 2); targetCtx.fill();

            // Minik T-Rex Ön Kolları
            targetCtx.fillStyle = "#16a34a";
            targetCtx.beginPath(); targetCtx.ellipse(4, 2, 1.5, 3, 0.8, 0, Math.PI * 2); targetCtx.fill();
        }

        targetCtx.restore();
        targetCtx.restore();
        return;
    }

    if (heldItem === 'su_tabancasi') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.9 : (model === 'classic_2' ? 1.0 : 1.1);
        targetCtx.scale(isLeft ? -scale : scale, scale);

        // 8-Yönlü Gerçekçi 2.5D İzometrik Namlu Açısı
        let rot = -0.15;
        if (f === 'down') rot = 0.35;
        else if (f === 'down-right') rot = 0.15;
        else if (f === 'right') rot = -0.05;
        else if (f === 'up-right') rot = -0.42;
        else if (f === 'up') rot = -0.65;
        else if (f === 'up-left') rot = -0.42;
        else if (f === 'left') rot = -0.05;
        else if (f === 'down-left') rot = 0.15;

        targetCtx.rotate(rot);

        targetCtx.save();
        // A) Su Tabancası Gövdesi (Neon Mavi / Camgöbeği)
        targetCtx.fillStyle = "#06b6d4";
        targetCtx.beginPath();
        targetCtx.roundRect(0, -6, 15, 6, 2);
        targetCtx.fill();
        targetCtx.strokeStyle = "#0891b2";
        targetCtx.lineWidth = 0.8;
        targetCtx.stroke();

        // Kabza (Tutma Yeri)
        targetCtx.fillStyle = "#0e7490";
        targetCtx.beginPath();
        targetCtx.moveTo(2, 0);
        targetCtx.lineTo(6, 0);
        targetCtx.lineTo(4, 9);
        targetCtx.lineTo(0, 9);
        targetCtx.closePath();
        targetCtx.fill();

        // Tetik & Tetik Korkuluğu
        targetCtx.strokeStyle = "#f97316";
        targetCtx.lineWidth = 1;
        targetCtx.beginPath(); targetCtx.arc(5, 3, 2.5, Math.PI * 0.2, Math.PI * 1.5); targetCtx.stroke();
        targetCtx.fillStyle = "#f97316";
        targetCtx.fillRect(4.5, 1.5, 1.5, 2.5);

        // Şeffaf Yeşil/Sarı Su Basınç Deposu
        targetCtx.fillStyle = "rgba(132, 204, 22, 0.85)";
        targetCtx.beginPath();
        targetCtx.roundRect(1, -11, 10, 5, 2.5);
        targetCtx.fill();
        targetCtx.strokeStyle = "#4d7c0f";
        targetCtx.lineWidth = 0.7;
        targetCtx.stroke();
        // Depo içindeki su seviyesi dalgası
        targetCtx.fillStyle = "rgba(56, 189, 248, 0.75)";
        targetCtx.fillRect(2, -9, 8, 2.5);

        // Turuncu Geniş Namlu Ucu
        targetCtx.fillStyle = "#ea580c";
        targetCtx.fillRect(15, -5.5, 3.5, 5);

        // B) CANLI BASINÇLI SU PÜSKÜRTME ANİMASYONU 💧💦
        const waterNow = Date.now();
        const shootPulse = (waterNow % 420) / 420;
        targetCtx.save();
        targetCtx.translate(18.5, -3);

        for (let i = 0; i < 4; i++) {
            let pProgress = (shootPulse + i * 0.25) % 1.0;
            let streamDist = 5 + pProgress * 32;
            let streamDropY = Math.pow(pProgress, 1.7) * 7.0;
            let dropSize = (1 - pProgress * 0.45) * 2.3;

            // Parlak Mavi / Turkuaz Su Damlası
            targetCtx.fillStyle = (i % 2 === 0) ? "#38bdf8" : "#67e8f9";
            targetCtx.beginPath();
            targetCtx.arc(streamDist, streamDropY, dropSize, 0, Math.PI * 2);
            targetCtx.fill();

            // İnce Su Sıçraması Yay İzi
            targetCtx.strokeStyle = "rgba(125, 211, 252, " + (0.85 - pProgress * 0.7) + ")";
            targetCtx.lineWidth = 1.3 - pProgress * 0.8;
            targetCtx.beginPath();
            targetCtx.moveTo(streamDist - 6, streamDropY - 0.4);
            targetCtx.lineTo(streamDist, streamDropY);
            targetCtx.stroke();
        }

        // Namludan çıkan mikro sıçrama zerrecikleri
        if (shootPulse < 0.4) {
            targetCtx.fillStyle = "#e0f2fe";
            targetCtx.beginPath(); targetCtx.arc(3, -2, 1.3, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(4, 2, 1.0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(7, 0, 0.8, 0, Math.PI * 2); targetCtx.fill();
        }
        targetCtx.restore();

        targetCtx.restore();
        targetCtx.restore();
        return;
    }

    if (heldItem === 'drone') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.95 : (model === 'classic_2' ? 1.05 : 1.15);
        targetCtx.scale(isLeft ? -scale : scale, scale);

        // 8 Yönlü Aerodinamik Hover ve İvmelenme Eğimi
        const hoverY = -14 + Math.sin(Date.now() / 240) * 3.2;
        let hoverTilt = Math.sin(Date.now() / 400) * 0.08;
        if (f === 'right' || f === 'down-right') hoverTilt += 0.08;
        if (f === 'left' || f === 'down-left') hoverTilt -= 0.08;

        targetCtx.save();
        targetCtx.translate(0, hoverY);
        targetCtx.rotate(hoverTilt);

        // 4 Kol (Karbon Fiber Kollar)
        targetCtx.strokeStyle = "#334155";
        targetCtx.lineWidth = 2.4;
        targetCtx.beginPath();
        targetCtx.moveTo(-11, -7); targetCtx.lineTo(11, 7);
        targetCtx.moveTo(-11, 7); targetCtx.lineTo(11, -7);
        targetCtx.stroke();

        // 4 Motor & Dönen Pervaneler (8 Yöne Göre Gerçekçi LED Yönü)
        const propRot = (Date.now() / 25) % (Math.PI * 2);
        const isFacingSouth = (f === 'down' || f === 'down-right' || f === 'down-left');
        const armCoords = [
            { x: -11, y: -7, isFront: !isFacingSouth },
            { x: 11, y: -7, isFront: !isFacingSouth },
            { x: -11, y: 7, isFront: isFacingSouth },
            { x: 11, y: 7, isFront: isFacingSouth }
        ];

        armCoords.forEach((ac, idx) => {
            // Motor Göbeği
            targetCtx.fillStyle = "#1e293b";
            targetCtx.beginPath(); targetCtx.arc(ac.x, ac.y, 2.5, 0, Math.PI * 2); targetCtx.fill();

            // Yön LED'i (Önde Yeşil Navigasyon, Arkada Kırmızı Uyarı LED'i)
            const isBlink = !ac.isFront ? ((Date.now() % 500) < 260) : true;
            const ledColor = ac.isFront ? '#22c55e' : '#ef4444';
            targetCtx.fillStyle = isBlink ? ledColor : "rgba(0,0,0,0.35)";
            targetCtx.beginPath(); targetCtx.arc(ac.x, ac.y + 1.8, 1.3, 0, Math.PI * 2); targetCtx.fill();

            // Dönen Yarı Saydam Pervane Halkası & Kanatları
            targetCtx.save();
            targetCtx.translate(ac.x, ac.y);
            targetCtx.strokeStyle = "rgba(226, 232, 240, 0.65)";
            targetCtx.lineWidth = 0.9;
            targetCtx.beginPath(); targetCtx.ellipse(0, 0, 5.5, 2.8, 0, 0, Math.PI * 2); targetCtx.stroke();

            // Hızlı Pervane Çizgileri
            targetCtx.rotate(propRot + idx);
            targetCtx.strokeStyle = "rgba(255, 255, 255, 0.85)";
            targetCtx.lineWidth = 1.1;
            targetCtx.beginPath(); targetCtx.moveTo(-5.5, 0); targetCtx.lineTo(5.5, 0); targetCtx.stroke();
            targetCtx.restore();
        });

        // Merkez Drone Gövdesi (Mat Beyaz & Siber Siyah Çizgili)
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.beginPath();
        targetCtx.roundRect(-6, -5, 12, 10, 4);
        targetCtx.fill();
        targetCtx.strokeStyle = "#0ea5e9";
        targetCtx.lineWidth = 1;
        targetCtx.stroke();

        if (isBack) {
            // Arkadan Görünüm: Batarya Haznesi & Mavi Telemetri Işığı
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(-3.5, -2.5, 7.0, 5.0);
            targetCtx.fillStyle = "#38bdf8";
            targetCtx.fillRect(-2.0, -1.0, 4.0, 1.4);
        } else {
            // Önden Görünüm: 4K Gimbal Kamera Lensi
            targetCtx.fillStyle = "#0f172a";
            targetCtx.beginPath(); targetCtx.arc(0, 3.5, 2.4, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#38bdf8";
            targetCtx.beginPath(); targetCtx.arc(0.5, 3.2, 1.1, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(0.8, 2.8, 0.4, 0, Math.PI * 2); targetCtx.fill();
        }

        // Drone Altı Zemin İletişim / Yansıma Işığı
        targetCtx.fillStyle = "rgba(56, 189, 248, 0.28)";
        targetCtx.beginPath();
        targetCtx.ellipse(0, 16, 7, 2, 0, 0, Math.PI * 2);
        targetCtx.fill();

        targetCtx.restore();
        targetCtx.restore();
        return;
    }

    if (heldItem === 'supurge') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.88 : (model === 'classic_2' ? 0.95 : 1.05);
        targetCtx.scale(isLeft ? -scale : scale, scale);

        // 8-Yönlü Zemin ve Boru Açısı (Önde yere basar, arkada ileriye uzanır)
        let rot = isBack ? -0.35 : -0.20;
        targetCtx.rotate(rot);

        targetCtx.save();
        // A) El Tutamağı & Siklon Motor Haznesi (Kırmızı Metalik)
        targetCtx.fillStyle = "#dc2626";
        targetCtx.beginPath();
        targetCtx.roundRect(-4, -12, 8, 13, 3);
        targetCtx.fill();
        targetCtx.strokeStyle = "#991b1b";
        targetCtx.lineWidth = 0.8;
        targetCtx.stroke();

        // Şeffaf Toz Haznesi
        targetCtx.fillStyle = "rgba(148, 163, 184, 0.55)";
        targetCtx.fillRect(-3, -7, 6, 6);
        targetCtx.fillStyle = "#facc15"; // Siklon filtresi
        targetCtx.beginPath(); targetCtx.arc(0, -4, 1.8, 0, Math.PI * 2); targetCtx.fill();

        // Tutma Sapı (Handle)
        targetCtx.strokeStyle = "#1e293b";
        targetCtx.lineWidth = 2.0;
        targetCtx.beginPath();
        targetCtx.moveTo(0, -12);
        targetCtx.lineTo(0, -16);
        targetCtx.lineTo(5, -16);
        targetCtx.stroke();

        // B) Teleskopik Metalik Alüminyum Emiş Borusu
        const nozzleX = isBack ? 6 : 4;
        const nozzleY = isBack ? 16 : 22;

        targetCtx.strokeStyle = "#94a3b8";
        targetCtx.lineWidth = 2.6;
        targetCtx.beginPath();
        targetCtx.moveTo(0, 1);
        targetCtx.lineTo(nozzleX, nozzleY);
        targetCtx.stroke();
        targetCtx.strokeStyle = "#e2e8f0"; // Parlama çizgisi
        targetCtx.lineWidth = 0.9;
        targetCtx.beginPath();
        targetCtx.moveTo(0, 1); targetCtx.lineTo(nozzleX, nozzleY);
        targetCtx.stroke();

        // C) Zemine Basan Süpürge Emiş Başlığı (Nozzle)
        targetCtx.save();
        targetCtx.translate(nozzleX, nozzleY);
        targetCtx.fillStyle = "#1e293b";
        targetCtx.beginPath();
        targetCtx.roundRect(-9, -2, 18, 5, 2);
        targetCtx.fill();
        targetCtx.strokeStyle = "#475569";
        targetCtx.lineWidth = 0.8;
        targetCtx.stroke();

        // Ön LED Işık Çizgisi
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.fillRect(-7, 1.2, 14, 1.2);

        // Zemindeki Hava & Toz Emiş Partikülleri
        const sPhase = (Date.now() % 350) / 350;
        targetCtx.strokeStyle = "rgba(255, 255, 255, " + (0.7 - sPhase * 0.6) + ")";
        targetCtx.lineWidth = 0.8;
        targetCtx.beginPath();
        targetCtx.moveTo(-8 - (1 - sPhase) * 4, 3);
        targetCtx.lineTo(-8, 2);
        targetCtx.moveTo(8 + (1 - sPhase) * 4, 3);
        targetCtx.lineTo(8, 2);
        targetCtx.stroke();

        targetCtx.restore();
        targetCtx.restore();

        targetCtx.restore();
        return;
    }

    // BAYRAKLAR: TÜRK BAYRAĞI & 4 BÜYÜKLER (GS, FB, BJK, TS)
    if (heldItem === 'turk_bayragi' || heldItem === 'bayrak_gs' || heldItem === 'bayrak_fb' || heldItem === 'bayrak_bjk' || heldItem === 'bayrak_ts') {
        targetCtx.translate(handX, handY);
        let scale = isBack ? 0.9 : (model === 'classic_2' ? 1.05 : 1.15);
        targetCtx.scale(isLeft ? -scale : scale, scale);
        
        let rot = isBack ? 0.20 : -0.15;
        targetCtx.rotate(rot);

        targetCtx.save();
        // A) Parlak Ahşap & Altın Tepelikli Bayrak Gönder Direği
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(-1.5, -28, 3, 38);
        targetCtx.strokeStyle = "#451a03";
        targetCtx.lineWidth = 0.6;
        targetCtx.strokeRect(-1.5, -28, 3, 38);

        // Altın Alem Tepeliği
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(0, -29, 2.8, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#fde047";
        targetCtx.beginPath(); targetCtx.arc(-0.7, -29.7, 1.0, 0, Math.PI * 2); targetCtx.fill();

        // B) RÜZGARDA CANLI DALGALANAN BAYRAK KUMAŞI
        const waveTime = Date.now() / 200;
        const w1 = Math.sin(waveTime) * 2.8;
        const w2 = Math.cos(waveTime * 1.2) * 2.2;
        const flagW = 26;
        const flagH = 17;

        targetCtx.save();
        targetCtx.translate(1.5, -27);

        // Bayrak Kumaş Formu (Dalgalı Bez Poligonu)
        targetCtx.beginPath();
        targetCtx.moveTo(0, 0);
        targetCtx.bezierCurveTo(flagW * 0.35, w1, flagW * 0.7, w2, flagW, w1 * 0.5);
        targetCtx.lineTo(flagW, flagH + w1 * 0.5);
        targetCtx.bezierCurveTo(flagW * 0.7, flagH + w2, flagW * 0.35, flagH + w1, 0, flagH);
        targetCtx.closePath();

        if (heldItem === 'turk_bayragi') {
            // ŞANLI AL BAYRAK
            targetCtx.fillStyle = "#e11d48";
            targetCtx.fill();
            targetCtx.strokeStyle = "rgba(0,0,0,0.15)";
            targetCtx.lineWidth = 0.8;
            targetCtx.stroke();

            // Beyaz Hilal ve Yıldız
            targetCtx.save();
            targetCtx.translate(flagW * 0.38 + w1 * 0.25, flagH * 0.5 + w2 * 0.25);
            // Dış Beyaz Daire
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(0, 0, 4.2, 0, Math.PI * 2); targetCtx.fill();
            // İç Kırmızı Daire (Hilal Kesimi)
            targetCtx.fillStyle = "#e11d48";
            targetCtx.beginPath(); targetCtx.arc(1.3, 0, 3.4, 0, Math.PI * 2); targetCtx.fill();

            // Beyaz Yıldız
            targetCtx.fillStyle = "#ffffff";
            targetCtx.translate(4.6, 0);
            targetCtx.beginPath();
            for (let i = 0; i < 5; i++) {
                let a1 = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                let a2 = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
                let r1 = 1.8;
                let r2 = 0.8;
                targetCtx.lineTo(Math.cos(a1) * r1, Math.sin(a1) * r1);
                targetCtx.lineTo(Math.cos(a2) * r2, Math.sin(a2) * r2);
            }
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.restore();

        } else if (heldItem === 'bayrak_gs') {
            // GALATASARAY (Sarı & Kırmızı Parçalı)
            targetCtx.fillStyle = "#b91c1c"; // Kırmızı zemin
            targetCtx.fill();
            targetCtx.save();
            targetCtx.clip();
            // Sarı Şeritler / Parçalı
            targetCtx.fillStyle = "#facc15";
            targetCtx.fillRect(0, 0, flagW, flagH * 0.5);
            targetCtx.restore();
            targetCtx.strokeStyle = "rgba(0,0,0,0.18)";
            targetCtx.lineWidth = 0.8;
            targetCtx.stroke();

            // GS Yazı / Yıldızlar
            targetCtx.fillStyle = "#ffffff";
            targetCtx.font = "bold 7px sans-serif";
            targetCtx.textAlign = "center";
            targetCtx.fillText("GS", flagW * 0.5 + w1 * 0.2, flagH * 0.65 + w2 * 0.2);
            targetCtx.fillStyle = "#facc15";
            targetCtx.font = "bold 5.5px sans-serif";
            targetCtx.fillText("⭐⭐⭐⭐", flagW * 0.5 + w1 * 0.2, flagH * 0.25 + w2 * 0.2);

        } else if (heldItem === 'bayrak_fb') {
            // FENERBAHÇE (Sarı & Lacivert Çubuklu)
            targetCtx.fillStyle = "#1e3a8a"; // Lacivert zemin
            targetCtx.fill();
            targetCtx.save();
            targetCtx.clip();
            // Sarı Çubuklar
            targetCtx.fillStyle = "#facc15";
            targetCtx.fillRect(0, flagH * 0.22, flagW, flagH * 0.26);
            targetCtx.fillRect(0, flagH * 0.72, flagW, flagH * 0.28);
            targetCtx.restore();
            targetCtx.strokeStyle = "rgba(0,0,0,0.18)";
            targetCtx.lineWidth = 0.8;
            targetCtx.stroke();

            // FB Yazı / Kanarya
            targetCtx.fillStyle = "#ffffff";
            targetCtx.font = "bold 7px sans-serif";
            targetCtx.textAlign = "center";
            targetCtx.fillText("FB", flagW * 0.5 + w1 * 0.2, flagH * 0.65 + w2 * 0.2);

        } else if (heldItem === 'bayrak_bjk') {
            // BEŞİKTAŞ (Siyah & Beyaz Çubuklu)
            targetCtx.fillStyle = "#0f172a"; // Siyah zemin
            targetCtx.fill();
            targetCtx.save();
            targetCtx.clip();
            // Beyaz Çubuklar
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(0, flagH * 0.24, flagW, flagH * 0.26);
            targetCtx.fillRect(0, flagH * 0.74, flagW, flagH * 0.26);
            targetCtx.restore();
            targetCtx.strokeStyle = "rgba(0,0,0,0.18)";
            targetCtx.lineWidth = 0.8;
            targetCtx.stroke();

            // Kırmızı Bayrak Rozeti & BJK Yazı
            targetCtx.fillStyle = "#ef4444";
            targetCtx.fillRect(flagW * 0.35 + w1 * 0.2, flagH * 0.32 + w2 * 0.2, 7, 5);
            targetCtx.fillStyle = "#ffffff";
            targetCtx.font = "bold 6.5px sans-serif";
            targetCtx.textAlign = "center";
            targetCtx.fillText("BJK", flagW * 0.5 + w1 * 0.2, flagH * 0.75 + w2 * 0.2);

        } else if (heldItem === 'bayrak_ts') {
            // TRABZONSPOR (Bordo & Mavi Çubuklu)
            targetCtx.fillStyle = "#831843"; // Bordo zemin
            targetCtx.fill();
            targetCtx.save();
            targetCtx.clip();
            // Mavi Çubuklar
            targetCtx.fillStyle = "#0284c7";
            targetCtx.fillRect(0, flagH * 0.24, flagW, flagH * 0.26);
            targetCtx.fillRect(0, flagH * 0.74, flagW, flagH * 0.26);
            targetCtx.restore();
            targetCtx.strokeStyle = "rgba(0,0,0,0.18)";
            targetCtx.lineWidth = 0.8;
            targetCtx.stroke();

            // TS Yazı
            targetCtx.fillStyle = "#ffffff";
            targetCtx.font = "bold 7px sans-serif";
            targetCtx.textAlign = "center";
            targetCtx.fillText("TS", flagW * 0.5 + w1 * 0.2, flagH * 0.65 + w2 * 0.2);
        }

        targetCtx.restore(); // flag offset
        targetCtx.restore(); // main bayrak
        targetCtx.restore();
        return;
    }

    // ==========================================
    // ZEUS'UN ŞİMŞEĞİ (ZEUS'S THUNDERBOLT - OLYMPIAN GOLDEN JAVELIN)
    // ==========================================
    if (heldItem === 'zeus_yildirimi' || heldItem === 'zeus_spear' || heldItem === 'zeus_simsegi') {
        if (typeof ZeusThunderboltRenderer !== 'undefined' && typeof ZeusThunderboltRenderer.drawThunderboltHeld === 'function') {
            ZeusThunderboltRenderer.drawThunderboltHeld(targetCtx, handX, handY, isPreview, facing, model, p);
        }
        targetCtx.restore();
        return;
    }

    targetCtx.restore();
}



    if (typeof window !== 'undefined') {
        window.drawHeldItem = drawHeldItem;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { drawHeldItem };
    }
})(typeof window !== 'undefined' ? window : globalThis);
