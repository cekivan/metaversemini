// public/js/renderers/costumes/trexCostume.js - 🦖 T-Rex Kostümü (costume_trex)
// 2.5D İzometrik 8 Yönlü Sevimli, Tombul & Sempatik Maskot Dinozor
// Tombul Silüet Korunmuş, Yumuşak Kuyruk Geçişli, Sıfır Dikiş Hatası & Havada Duran Parçasız
(function () {
    'use strict';

    // 8 Yönlü İzometrik Görünüm ve Simetri Haritası
    const POSES = {
        'down': { view: 'front', mirror: 1 },
        'down-right': { view: 'quarter-front', mirror: 1 },
        'right': { view: 'side', mirror: 1 },
        'up-right': { view: 'quarter-back', mirror: 1 },
        'up': { view: 'back', mirror: 1 },
        'up-left': { view: 'quarter-back', mirror: -1 },
        'left': { view: 'side', mirror: -1 },
        'down-left': { view: 'quarter-front', mirror: -1 }
    };

    // Canlı, Sıcak & Sempatik Dinozor Renk Paleti (Tombul Maskot Yeşili)
    const PAL = {
        dorsalHighlight: "#62b535", // Sırtta ve tombul yanaklarda tatlı gün ışığı
        dorsalBase: "#3f8522", // Canlı orman yeşili ana gövde
        dorsalShade: "#285a15", // Gövde altı & bacak gölgeleri
        dorsalDeep: "#153509", // Derin anatomik gölge ve eklem oluğu
        stripeDark: "#1f4611", // Doğal deri kamuflaj tonu (gövdeye gömülü, havada uçuşmayan)

        ventralHighlight: "#fff8db", // Karın paneli üst ışığı
        ventralBase: "#f5e9c6", // Sevimli krem/kum rengi karın paneli
        ventralShade: "#d4c19a", // Karın plakaları arası yumuşak oluk

        scuteSpike: "#1a3c0e", // Omurga boyunca uzanan pullar/dikenler
        scuteHighlight: "#84d455", // Diken uçları ışıltısı

        eyeAmber: "#f59e0b", // İri, parlak, canlı kehribar gözler
        eyePupil: "#09090b", // Dikey sevimli yarık gözbebeği
        eyeHigh: "#ffffff", // Canlı göz parıltısı

        mouthInterior: "#881337", // Koyu kırmızı sevimli ağız içi
        mouthTongue: "#be123c", // Canlı pembe dil
        toothWhite: "#ffffff", // Bembeyaz sevimli dinozor dişleri

        clawDark: "#1c1917", // Keratin pençeler
        clawHighlight: "#44403c"  // Pençe ucu ışıltısı
    };

    /**
     * ANA ÇİZİM GİRİŞİ: drawTrex
     */
    function drawTrex(ctx, facing, isMoving, walkCycle, isSitting) {
        const pose = POSES[facing] || POSES['down'];
        const view = pose.view;
        const mirror = pose.mirror;

        const time = Date.now();
        const cycle = walkCycle || 0;

        // Kinematik Değerler (Tombul Maskot Salınımı)
        const stride = isMoving ? cycle * 1.5 : 0;
        const stepBob = isMoving ? Math.abs(Math.sin(stride)) * 2.0 : 0;
        const breath = Math.sin(time / 520) * 0.04;
        const tailSway = isMoving ? Math.sin(stride - 1.2) * 5.0 : Math.sin(time / 650) * 2.6;
        const armTwitch = isMoving ? Math.sin(stride * 2) * 1.5 : Math.sin(time / 300) * 0.7;
        const jawRoar = (Math.sin(time / 900) > 0.82) ? (Math.sin(time / 900) - 0.82) * 3.5 : 0;

        ctx.save();
        ctx.scale(mirror * 1.30, 1.30);

        // 1. ZEMİN TEMAS GÖLGESİ (Yumuşak & Geniş Grounding)
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.beginPath();
        ctx.ellipse(0, 4, isSitting ? 30 : 26, isSitting ? 13 : 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
        ctx.beginPath();
        ctx.ellipse(0, 3, isSitting ? 17 : 14, isSitting ? 7 : 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. OTURMA / ÇÖMELME MODU (isSitting === true)
        if (isSitting) {
            drawTrexCrouching(ctx, view, time, breath, PAL);
            ctx.restore();
            return;
        }

        // 3. 8-YÖNLÜ İZOMETRİK AYAKTA / HAREKETLİ MOD
        ctx.translate(0, -stepBob);

        switch (view) {
            case 'side':
                drawTrexSide(ctx, isMoving, stride, tailSway, armTwitch, jawRoar, breath, PAL);
                break;
            case 'quarter-front':
                drawTrexQuarterFront(ctx, isMoving, stride, tailSway, armTwitch, jawRoar, breath, PAL);
                break;
            case 'front':
                drawTrexFront(ctx, isMoving, stride, tailSway, armTwitch, jawRoar, breath, PAL);
                break;
            case 'quarter-back':
                drawTrexQuarterBack(ctx, isMoving, stride, tailSway, armTwitch, breath, PAL);
                break;
            case 'back':
                drawTrexBack(ctx, isMoving, stride, tailSway, breath, PAL);
                break;
            default:
                drawTrexQuarterFront(ctx, isMoving, stride, tailSway, armTwitch, jawRoar, breath, PAL);
                break;
        }

        ctx.restore();
    }

    // =========================================================================
    // YARDIMCI ANATOMİK ÇİZİM MOTORLARI
    // =========================================================================

    /**
     * Güçlü & Tombul Dinozor Bacağı
     * (Sert kenar çizgisi kaldırıldı, gövdeyle kaynaşan tombul uyluk + 3 pençeli ayak)
     */
    function drawTrexLeg(ctx, hipX, hipY, swingAngle, isFar, pal) {
        ctx.save();
        ctx.translate(hipX, hipY);
        ctx.rotate(swingAngle * 0.30);

        // Bacak zemin temas gölgesi
        const isPlanted = Math.cos(swingAngle) < 0.2;
        if (isPlanted) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
            ctx.beginPath();
            ctx.ellipse(0, 18, 6.0, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        const shadeBase = isFar ? pal.dorsalShade : pal.dorsalBase;
        const shadeDeep = isFar ? pal.dorsalDeep : pal.dorsalShade;

        // 1. Tombul Kaslı Uyluk (Pofuduk, Yumuşak Doğal Ton Geçişi)
        const thighGrad = ctx.createLinearGradient(0, -6, 0, 10);
        thighGrad.addColorStop(0, isFar ? pal.dorsalBase : pal.dorsalHighlight);
        thighGrad.addColorStop(0.5, shadeBase);
        thighGrad.addColorStop(1, shadeDeep);
        ctx.fillStyle = thighGrad;
        ctx.beginPath();
        ctx.ellipse(0, 2, 7.0, 9.0, -0.10, 0, Math.PI * 2);
        ctx.fill();

        // 2. Güçlü Baldır & İncik
        ctx.fillStyle = shadeBase;
        ctx.beginPath();
        ctx.moveTo(-2.8, 8);
        ctx.lineTo(2.0, 6.5);
        ctx.lineTo(3.0, 13.8);
        ctx.lineTo(-2.0, 14.5);
        ctx.closePath();
        ctx.fill();

        // 3. Ayak Bileği ve 3 Sevimli Tombul Pençe
        ctx.fillStyle = shadeDeep;
        ctx.beginPath();
        ctx.roundRect(-2.4, 13, 4.8, 3.6, 1);
        ctx.fill();

        // 3 Ön Pençe
        [-3.0, 0, 3.0].forEach((tox, idx) => {
            ctx.fillStyle = shadeBase;
            ctx.beginPath();
            ctx.ellipse(tox, 16.5, 1.7, 2.1, 0, 0, Math.PI * 2);
            ctx.fill();

            // Sevimli Keratin Pençe Ucu
            ctx.fillStyle = pal.clawDark;
            ctx.beginPath();
            ctx.moveTo(tox - 0.9, 17.5);
            ctx.lineTo(tox + (idx === 0 ? -1.2 : (idx === 2 ? 1.2 : 0)), 19.8);
            ctx.lineTo(tox + 0.9, 17.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = pal.clawHighlight;
            ctx.fillRect(tox - 0.3, 18, 0.6, 1.2);
        });

        // Arka Mahmuz Tırnağı
        ctx.fillStyle = pal.clawDark;
        ctx.beginPath();
        ctx.moveTo(-0.8, 14);
        ctx.lineTo(-3.0, 15.0);
        ctx.lineTo(-0.8, 15.0);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    /**
     * T-Rex'in İkonik 2 Parmaklı Sevimli Ön Kolu
     */
    function drawTrexArm(ctx, ax, ay, twitch, isFar, pal) {
        ctx.save();
        ctx.translate(ax, ay);
        ctx.rotate(twitch * 0.15);

        const armCol = isFar ? pal.dorsalShade : pal.dorsalBase;

        // Omuz kası
        ctx.fillStyle = armCol;
        ctx.beginPath();
        ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Üst kol ve dirsek
        ctx.strokeStyle = armCol;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(3.8, 2.8);
        ctx.lineTo(6.8, 1.0);
        ctx.stroke();

        // 2 Minik Pençe
        ctx.fillStyle = pal.clawDark;
        ctx.beginPath();
        ctx.moveTo(6.5, 0); ctx.lineTo(8.6, 0.5); ctx.lineTo(6.8, 1.4); ctx.fill();
        ctx.beginPath();
        ctx.moveTo(6.5, 1.4); ctx.lineTo(8.3, 2.6); ctx.lineTo(6.5, 2.6); ctx.fill();

        ctx.restore();
    }

    /**
     * Omurga Sırt Pulları / Dikenleri (Deriye Tam Oturan, Havada Uçuşmayan)
     */
    function drawDorsalSpikes(ctx, points, pal) {
        points.forEach(([sx, sy, h, angle]) => {
            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(angle || 0);

            // Diken gövdesi
            ctx.fillStyle = pal.scuteSpike;
            ctx.beginPath();
            ctx.moveTo(-1.2, 0);
            ctx.lineTo(0, -h);
            ctx.lineTo(1.2, 0);
            ctx.closePath();
            ctx.fill();

            // Tepe ışık çizgisi
            ctx.strokeStyle = pal.scuteHighlight;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(0, -h);
            ctx.lineTo(1.0, 0);
            ctx.stroke();

            ctx.restore();
        });
    }

    // =========================================================================
    // 1. PROFİL GÖRÜNÜM (SIDE: Sağ / Sol)
    // =========================================================================
    function drawTrexSide(ctx, isMoving, stride, tailSway, armTwitch, jawRoar, breath, pal) {
        const stepL = isMoving ? Math.sin(stride) : 0;
        const stepR = isMoving ? Math.sin(stride + Math.PI) : 0;

        // 1. Arka Plandaki Sol Bacak (Far Leg)
        drawTrexLeg(ctx, -2, -6, stepL, true, pal);

        const torsoY = -14 + breath * 3;

        // 2 & 3. TOMBUL GÖVDE VE KUYRUK BİRLEŞİMİ (YUMUŞAK, KESİNTİSİZ & SEVİMLİ GEÇİŞ)
        // Kuyruk ayrı bir külah gibi değil; tombul sırttan ve popodan pofudukça uzanan tek parça form
        ctx.save();

        const tailTipX = -36 + tailSway * 0.4;
        const tailTipY = -11 + Math.cos(stride) * 1.8;

        // Gövde ve Kuyruğu İçine Alan Zengin Hacim Gradyanı
        const bodyGrad = ctx.createLinearGradient(10, torsoY - 14, -30, torsoY + 12);
        bodyGrad.addColorStop(0, pal.dorsalHighlight);
        bodyGrad.addColorStop(0.35, pal.dorsalBase);
        bodyGrad.addColorStop(0.75, pal.dorsalShade);
        bodyGrad.addColorStop(1, pal.dorsalDeep);
        ctx.fillStyle = bodyGrad;

        // Tek bir yumuşak geçişle birleşen tombul popo ve kuyruk
        ctx.beginPath();
        // Sırttan başla
        ctx.moveTo(3, torsoY - 12);
        // Tombul sırttan popoya ve kuyruk üstüne yumuşak kavis
        ctx.quadraticCurveTo(-10, torsoY - 13, -18, -17 + tailSway * 0.15);
        ctx.quadraticCurveTo(-26, -18 + tailSway * 0.25, tailTipX, tailTipY);
        // Tombul yuvarlak kuyruk ucu
        ctx.quadraticCurveTo(tailTipX - 2.5, tailTipY + 2.5, tailTipX, tailTipY + 4.5);
        // Kuyruk altından tombul popo altına dönüş
        ctx.quadraticCurveTo(-22, -4, -6, -4);
        // Göğüs ve tombul karın önü
        ctx.quadraticCurveTo(8, -4, 16, torsoY + 2);
        ctx.quadraticCurveTo(18, torsoY - 6, 12, torsoY - 11);
        ctx.closePath();
        ctx.fill();

        // Tombul Gövde Hacim Parlaması (Yuvarlak & Pofuduk Vurgu)
        const highlightGrad = ctx.createRadialGradient(4, torsoY - 2, 2, 3, torsoY, 15);
        highlightGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
        highlightGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.0)");
        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        ctx.ellipse(3, torsoY, 14.5, 11.5, -0.10, 0, Math.PI * 2);
        ctx.fill();

        // Açık Krem Renkli Sevimli Karın Pulları (Ventral)
        ctx.fillStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.moveTo(0, -4.5);
        ctx.quadraticCurveTo(8, -5.5, 12, -11.5);
        ctx.quadraticCurveTo(6, -1.8, -1, -2.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = pal.ventralHighlight;
        ctx.fillRect(4, -5.0, 4, 1.2);

        // Gövdeye Gömülü Doğal Kamuflaj Çizgileri (Havada uçuşmayan, deri sınırları içinde)
        ctx.fillStyle = pal.stripeDark;
        [
            [-2, torsoY - 10, 6],
            [4, torsoY - 11, 7],
            [10, torsoY - 9, 5]
        ].forEach(([cx, cy, h]) => {
            ctx.beginPath();
            ctx.ellipse(cx, cy + h * 0.5, 1.4, h * 0.5, 0.15, 0, Math.PI * 2);
            ctx.fill();
        });

        // Kuyruk ve Sırt Dikenleri (Kuyruk Salınımına KESİNTİSİZ KİLİTLİ, Sıfır Kopma)
        drawDorsalSpikes(ctx, [
            // Sırttaki dikenler
            [-2, torsoY - 12.5, 3.2, -0.05],
            [4, torsoY - 12.8, 3.4, 0.05],
            [10, torsoY - 10.5, 2.8, 0.18],
            // Kuyruktaki dikenler (tailSway ile birlikte hareket eder, asla havada asılı kalmaz)
            [-10, -17.5 + tailSway * 0.08, 2.8, -0.15],
            [-18, -18.2 + tailSway * 0.18, 2.5, -0.25],
            [-26, -16.0 + tailSway * 0.28, 2.0, -0.38],
            [-32, -12.5 + tailSway * 0.36, 1.4, -0.48]
        ], pal);

        ctx.restore();

        // 4. Boyun ve Sempatik Kafa
        ctx.save();
        const headX = 14;
        const headY = -24 + breath * 2;
        ctx.translate(headX, headY);

        // Kaslı Boyun
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(-6, 8);
        ctx.quadraticCurveTo(-4, -4, 4, -4);
        ctx.lineTo(2, 6);
        ctx.closePath();
        ctx.fill();

        // Üst Kafatası (Cranium & Snout)
        const skullGrad = ctx.createLinearGradient(0, -10, 18, 4);
        skullGrad.addColorStop(0, pal.dorsalHighlight);
        skullGrad.addColorStop(0.5, pal.dorsalBase);
        skullGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = skullGrad;
        ctx.beginPath();
        ctx.moveTo(-4, -4);
        ctx.lineTo(2, -7);
        ctx.lineTo(16, -5); // Burun sırtı
        ctx.quadraticCurveTo(20, -4, 20, 0); // Burun ucu
        ctx.lineTo(10, 1);
        ctx.lineTo(0, 0);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();

        // Kaş Kemeri
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath();
        ctx.roundRect(1, -7.5, 6, 2.5, 1);
        ctx.fill();

        // Sevimli & İri Kehribar Göz
        ctx.fillStyle = pal.eyeAmber;
        ctx.beginPath();
        ctx.arc(4, -4.5, 2.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = pal.eyePupil;
        ctx.fillRect(3.6, -6.2, 0.9, 3.4); // Dikey sevimli yarık
        ctx.fillStyle = pal.eyeHigh;
        ctx.fillRect(4.5, -5.5, 0.7, 0.7); // Işık pırıltısı

        // Burun Deliği
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath();
        ctx.ellipse(17, -2.5, 1.2, 0.8, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Hareketli Alt Çene
        const jawAngle = jawRoar * 0.15;
        ctx.save();
        ctx.translate(-2, 3);
        ctx.rotate(jawAngle);

        // Ağız İçi Kırmızı Doku
        ctx.fillStyle = pal.mouthInterior;
        ctx.beginPath();
        ctx.moveTo(2, -3);
        ctx.lineTo(16, -2);
        ctx.lineTo(14, 2);
        ctx.lineTo(2, 2);
        ctx.closePath();
        ctx.fill();

        // Kaslı Dil
        ctx.fillStyle = pal.mouthTongue;
        ctx.beginPath();
        ctx.ellipse(8, 0, 5, 1.8, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Alt Çene Kemiği
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(17, 0);
        ctx.quadraticCurveTo(18, 4, 15, 5);
        ctx.lineTo(0, 4);
        ctx.closePath();
        ctx.fill();

        // Keskin Beyaz Dişler
        ctx.fillStyle = pal.toothWhite;
        for (let tx = 3; tx <= 16; tx += 2.6) {
            // Alt Dişler
            ctx.beginPath();
            ctx.moveTo(tx, 0);
            ctx.lineTo(tx + 0.9, -2.6);
            ctx.lineTo(tx + 1.8, 0);
            ctx.closePath();
            ctx.fill();
            // Üst Dişler
            ctx.beginPath();
            ctx.moveTo(tx, -3);
            ctx.lineTo(tx + 0.9, -0.6);
            ctx.lineTo(tx + 1.8, -3);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
        ctx.restore();

        // 5. Ön Plandaki Sağ Kol (Near Arm)
        drawTrexArm(ctx, 11, -12, armTwitch, false, pal);

        // 6. Ön Plandaki Sağ Bacak (Near Leg)
        drawTrexLeg(ctx, 4, -4, stepR, false, pal);
    }

    // =========================================================================
    // 2. 3/4 ÖN-SAĞ GÖRÜNÜM (QUARTER-FRONT: Klasik İzometrik Açı)
    // =========================================================================
    function drawTrexQuarterFront(ctx, isMoving, stride, tailSway, armTwitch, jawRoar, breath, pal) {
        const stepL = isMoving ? Math.sin(stride) : 0;
        const stepR = isMoving ? Math.sin(stride + Math.PI) : 0;

        // 1. Arka Sol Bacak
        drawTrexLeg(ctx, -8, -5, stepL, true, pal);

        // 2. Kuyruk (Geriye ve Yana Kıvrılan Pofuduk Denge Kuyruğu)
        ctx.save();
        const tailTipX = -32 + tailSway * 0.35;
        const tailTipY = -14 + Math.cos(stride) * 1.8;
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.moveTo(-6, -17);
        ctx.quadraticCurveTo(-18, -19 + tailSway * 0.15, tailTipX, tailTipY);
        ctx.quadraticCurveTo(tailTipX - 2, tailTipY + 3, tailTipX + 1, tailTipY + 4);
        ctx.quadraticCurveTo(-16, -5, -4, -6);
        ctx.closePath();
        ctx.fill();

        // Kuyruk Dikenleri (TailSway ile hareket eden)
        drawDorsalSpikes(ctx, [
            [-12, -18 + tailSway * 0.1, 2.5, -0.2],
            [-20, -17.5 + tailSway * 0.22, 2.0, -0.3]
        ], pal);
        ctx.restore();

        // 3. Masif & Tombul 3/4 Gövde
        const torsoY = -13 + breath * 3;
        const bodyGrad = ctx.createRadialGradient(2, torsoY - 2, 3, 0, torsoY, 16);
        bodyGrad.addColorStop(0, pal.dorsalHighlight);
        bodyGrad.addColorStop(0.5, pal.dorsalBase);
        bodyGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 15, 12.5, -0.08, 0, Math.PI * 2);
        ctx.fill();

        // Göğüs & Karın Pulları
        ctx.fillStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.moveTo(1, -4);
        ctx.quadraticCurveTo(8, -5, 11, -11);
        ctx.quadraticCurveTo(4, -3, -1, -2);
        ctx.closePath();
        ctx.fill();

        // Sırt Dikenleri (Sırt eğrisine tam oturan)
        drawDorsalSpikes(ctx, [
            [-6, torsoY - 11.5, 3.0, -0.1],
            [0, torsoY - 12.5, 3.2, 0],
            [6, torsoY - 11.8, 2.8, 0.1]
        ], pal);

        // Arka Sol Kol
        drawTrexArm(ctx, 4, -13, -armTwitch, true, pal);

        // 4. 3/4 Açı Kafa ve Çene
        ctx.save();
        const headX = 11;
        const headY = -23 + breath * 2;
        ctx.translate(headX, headY);

        // Boyun
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(-5, 7);
        ctx.lineTo(2, -3);
        ctx.lineTo(7, 3);
        ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();

        // Kafa Kütlesi
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(-3, -3);
        ctx.lineTo(3, -7);
        ctx.lineTo(15, -4);
        ctx.lineTo(17, 2);
        ctx.lineTo(8, 4);
        ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fill();

        // Kaş ve Sarı Göz
        ctx.fillStyle = pal.dorsalDeep;
        ctx.fillRect(2, -7.5, 5.5, 2.5);
        ctx.fillStyle = pal.eyeAmber;
        ctx.beginPath(); ctx.arc(4.5, -4.8, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = pal.eyePupil;
        ctx.fillRect(4.2, -6.4, 0.8, 3.2);
        ctx.fillStyle = pal.eyeHigh;
        ctx.fillRect(5.0, -5.5, 0.6, 0.6);

        // Burun
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath(); ctx.arc(14.5, -2, 1, 0, Math.PI * 2); ctx.fill();

        // Ağız & Dişler
        ctx.fillStyle = pal.mouthInterior;
        ctx.beginPath();
        ctx.moveTo(3, 4); ctx.lineTo(15, 2); ctx.lineTo(13, 5); ctx.lineTo(3, 5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = pal.toothWhite;
        for (let tx = 4; tx <= 14; tx += 2.5) {
            ctx.beginPath(); ctx.moveTo(tx, 4); ctx.lineTo(tx + 0.8, 2.0); ctx.lineTo(tx + 1.6, 4); ctx.fill();
        }

        ctx.restore();

        // 5. Ön Plandaki Sağ Kol
        drawTrexArm(ctx, 8, -10, armTwitch, false, pal);

        // 6. Ön Plandaki Sağ Bacak
        drawTrexLeg(ctx, 4, -3, stepR, false, pal);
    }

    // =========================================================================
    // 3. TAM ÖN GÖRÜNÜM (FRONT: Aşağı / Güney Yönü) - %100 TOMBUL & SEMPATİK
    // =========================================================================
    function drawTrexFront(ctx, isMoving, stride, tailSway, armTwitch, jawRoar, breath, pal) {
        const stepL = isMoving ? Math.sin(stride) : 0;
        const stepR = isMoving ? Math.sin(stride + Math.PI) : 0;

        // 1. Arkada Yana Savrulan Pofuduk Kuyruk Ucu
        ctx.save();
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.ellipse(tailSway * 1.8, -16, 7.5, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. İki Yanda Güçlü & Tombul Bacaklar
        drawTrexLeg(ctx, -10.5, -4, stepL, true, pal);
        drawTrexLeg(ctx, 10.5, -4, stepR, false, pal);

        // 3. TAM TOMBUL ÖN GÖVDE (Birebir Aynı Sempatik Yuvarlak Hacim)
        const torsoY = -14 + breath * 3;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gövde Hacim Parlaması
        const bellyShine = ctx.createRadialGradient(0, torsoY - 2, 2, 0, torsoY, 13);
        bellyShine.addColorStop(0, "rgba(255, 255, 255, 0.12)");
        bellyShine.addColorStop(0.7, "rgba(255, 255, 255, 0.0)");
        ctx.fillStyle = bellyShine;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Geniş Krem Rengi Karın Plakaları (Sevimli Göbek)
        ctx.fillStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY + 2, 7.5, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.ventralShade;
        ctx.lineWidth = 0.8;
        for (let py = -4; py <= 6; py += 3.5) {
            ctx.beginPath();
            ctx.moveTo(-5, torsoY + py);
            ctx.lineTo(5, torsoY + py);
            ctx.stroke();
        }

        // 4. İki Adet Minik Kol (Öne Doğru Açık & Sevimli)
        drawTrexArm(ctx, -6, -11, armTwitch, false, pal);
        ctx.save();
        ctx.scale(-1, 1);
        drawTrexArm(ctx, -6, -11, -armTwitch, false, pal);
        ctx.restore();

        // 5. İleriye Bakan Sempatik Yırtıcı Kafa (Frontal Skull)
        ctx.save();
        const headY = -27 + breath * 2;
        ctx.translate(0, headY);

        // Kafa Kubbesi
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.roundRect(-8, -8, 16, 12, [5, 5, 2, 2]);
        ctx.fill();

        // İki Büyük Sevimli Sarı Göz (İleriye odaklanmış)
        [-5, 5].forEach(ex => {
            ctx.fillStyle = pal.dorsalDeep;
            ctx.fillRect(ex - 2, -7.5, 4, 2);
            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath(); ctx.arc(ex, -4.5, 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(ex - 0.5, -6.2, 1, 3.4);
            ctx.fillStyle = pal.eyeHigh;
            ctx.fillRect(ex + 0.5, -5.2, 0.6, 0.6);
        });

        // Geniş Burun ve İki Burun Deliği
        ctx.fillStyle = pal.dorsalHighlight;
        ctx.fillRect(-4, -1, 8, 4);
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath(); ctx.arc(-2.5, 1.5, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2.5, 1.5, 1, 0, Math.PI * 2); ctx.fill();

        // Ağız ve Diş Dizisi
        ctx.fillStyle = pal.mouthInterior;
        ctx.fillRect(-6, 4, 12, 3);
        ctx.fillStyle = pal.toothWhite;
        for (let tx = -5; tx <= 5; tx += 2.5) {
            ctx.beginPath(); ctx.moveTo(tx, 4); ctx.lineTo(tx + 0.8, 6.5); ctx.lineTo(tx + 1.6, 4); ctx.fill();
            ctx.beginPath(); ctx.moveTo(tx, 7); ctx.lineTo(tx + 0.8, 4.5); ctx.lineTo(tx + 1.6, 7); ctx.fill();
        }

        // Çene Tabanı
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.roundRect(-7, 7, 14, 3, 1);
        ctx.fill();

        ctx.restore();
    }

    // =========================================================================
    // 4. 3/4 ARKA GÖRÜNÜM (QUARTER-BACK: Kuzey-Doğu / Kuzey-Batı)
    // =========================================================================
    function drawTrexQuarterBack(ctx, isMoving, stride, tailSway, armTwitch, breath, pal) {
        const stepL = isMoving ? Math.sin(stride) : 0;
        const stepR = isMoving ? Math.sin(stride + Math.PI) : 0;

        // 1. Arka Plandaki Sol Bacak (Gövdenin arkasında kalır)
        drawTrexLeg(ctx, -7, -5, stepL, true, pal);

        // 2. Önde Kafa Arkası (Uzaklaşan Bakış)
        ctx.save();
        const headX = 9;
        const headY = -24 + breath * 2;
        ctx.translate(headX, headY);
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.roundRect(-4, -7, 12, 10, [4, 4, 2, 2]);
        ctx.fill();
        drawDorsalSpikes(ctx, [[-1, -8, 2.5, 0], [5, -8, 2.5, 0.1]], pal);
        ctx.restore();

        // 3. Masif & Pofuduk Sırt
        const torsoY = -14 + breath * 3;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 15, 12, 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Deriye oturan sırt dikenleri
        drawDorsalSpikes(ctx, [
            [-4, torsoY - 11.5, 3.2, 0],
            [2, torsoY - 12.2, 3.5, 0],
            [8, torsoY - 11.0, 3.0, 0.1]
        ], pal);

        // 4. Pofuduk Denge Kuyruğu (Akıcı ve Yumuşak Kıvrım)
        ctx.save();
        const tailTipX = -34 + tailSway * 0.4;
        const tailTipY = -9 + Math.cos(stride) * 1.8;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(-5, -17);
        ctx.quadraticCurveTo(-16, -18 + tailSway * 0.15, tailTipX, tailTipY);
        ctx.quadraticCurveTo(tailTipX - 2, tailTipY + 2.5, tailTipX + 1, tailTipY + 4);
        ctx.quadraticCurveTo(-15, -4, -3, -6);
        ctx.closePath();
        ctx.fill();

        // Kuyruk Dikenleri
        drawDorsalSpikes(ctx, [
            [-10, -17.5 + tailSway * 0.1, 2.8, -0.2],
            [-18, -17.8 + tailSway * 0.22, 2.5, -0.3],
            [-26, -14.5 + tailSway * 0.32, 2.0, -0.4]
        ], pal);
        ctx.restore();

        // 5. Ön Plandaki Sağ Bacak (Kalçanın yanından doğal basış)
        drawTrexLeg(ctx, 3, -3.5, stepR, false, pal);
    }

    // =========================================================================
    // 5. TAM ARKA GÖRÜNÜM (BACK: Yukarı / Kuzey Yönü) - POFUDUK & SEVİMLİ SIRT
    // =========================================================================
    function drawTrexBack(ctx, isMoving, stride, tailSway, breath, pal) {
        const stepL = isMoving ? Math.sin(stride) : 0;
        const stepR = isMoving ? Math.sin(stride + Math.PI) : 0;

        // 1. Kafa Arkası (İleriye Yönelik)
        ctx.save();
        const headY = -27 + breath * 2;
        ctx.translate(0, headY);
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.roundRect(-7, -7, 14, 10, [5, 5, 2, 2]);
        ctx.fill();
        drawDorsalSpikes(ctx, [[-3, -8, 2.5, 0], [3, -8, 2.5, 0]], pal);
        ctx.restore();

        // 2. İki Bacak (Pelvise dengeli oturtulmuş)
        drawTrexLeg(ctx, -9.5, -4, stepL, true, pal);
        drawTrexLeg(ctx, 9.5, -4, stepR, false, pal);

        // 3. Pofuduk Sırt Kasları & Yuvarlak Popo
        const torsoY = -14 + breath * 3;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Merkezi Omurga Diken Hattı (Yukarıdan aşağı düzgün dizilim)
        drawDorsalSpikes(ctx, [
            [0, torsoY - 11.5, 3.4, 0],
            [0, torsoY - 7.5, 3.2, 0],
            [0, torsoY - 3.5, 3.0, 0],
            [0, torsoY + 1.0, 2.8, 0]
        ], pal);

        // 4. Arkaya Doğru Uzanan Pofuduk Kuyruk (3D Perspektifte Derinlikli)
        ctx.save();
        const tailTipX = tailSway * 1.5;
        const tailTipY = 3.5;

        // Kuyruk gövdesi
        const tailBackGrad = ctx.createLinearGradient(0, torsoY, 0, 5);
        tailBackGrad.addColorStop(0, pal.dorsalBase);
        tailBackGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = tailBackGrad;

        ctx.beginPath();
        ctx.moveTo(-6, torsoY + 3);
        ctx.quadraticCurveTo(-4, 0, tailTipX - 2.5, tailTipY);
        ctx.quadraticCurveTo(tailTipX, tailTipY + 2.5, tailTipX + 2.5, tailTipY);
        ctx.quadraticCurveTo(4, 0, 6, torsoY + 3);
        ctx.closePath();
        ctx.fill();

        // Kuyruk ucu dikeni
        drawDorsalSpikes(ctx, [
            [tailTipX * 0.5, torsoY + 5.5, 2.4, 0],
            [tailTipX, tailTipY - 1.0, 2.0, 0]
        ], pal);
        ctx.restore();
    }

    // =========================================================================
    // 6. SEVİMLİ TOMBUL DİNOZOR OTURMA MODU (SITTING POSE - 8 AÇI DESTEKLİ)
    // =========================================================================

    /**
     * Otururken Yere Düz Basan 3 Pençeli Tombul Pati
     */
    function drawPlantedFoot(ctx, fx, fy, pal) {
        ctx.save();
        ctx.translate(fx, fy);

        // Ayak tabanı / bilek
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, 0, 4.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3 Ön Parmak (Öne düz basar)
        [-3.0, 0, 3.0].forEach((tox, idx) => {
            ctx.fillStyle = pal.dorsalHighlight;
            ctx.beginPath();
            ctx.ellipse(tox, 1.5, 1.5, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Beyaz/keratin pençeler
            ctx.fillStyle = pal.clawDark;
            ctx.beginPath();
            ctx.moveTo(tox - 0.9, 2.5);
            ctx.lineTo(tox + (idx === 0 ? -1.0 : (idx === 2 ? 1.0 : 0)), 5.0);
            ctx.lineTo(tox + 0.9, 2.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = pal.clawHighlight;
            ctx.fillRect(tox - 0.3, 3.0, 0.6, 1.0);
        });
        ctx.restore();
    }

    /**
     * Ana Oturma Girişi: Açısına Göre Karakteristik Oturuş
     */
    function drawTrexCrouching(ctx, view, time, breath, pal) {
        switch (view) {
            case 'front':
                drawSittingFront(ctx, breath, pal);
                break;
            case 'side':
                drawSittingSide(ctx, breath, pal);
                break;
            case 'quarter-front':
                drawSittingQuarterFront(ctx, breath, pal);
                break;
            case 'back':
                drawSittingBack(ctx, breath, pal);
                break;
            case 'quarter-back':
                drawSittingQuarterBack(ctx, breath, pal);
                break;
            default:
                drawSittingFront(ctx, breath, pal);
                break;
        }
    }

    // 1. ÖNE BAKARAK OTURMA (GÜNEY / DOWN): Sevimli Patiler & Krem Göbek
    function drawSittingFront(ctx, breath, pal) {
        // A) Kuyruk arkadan sağa tatlı bir kavisle yere serilmiş
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.quadraticCurveTo(18, 1, 26, 4);
        ctx.quadraticCurveTo(28, 6.5, 25, 7.5);
        ctx.quadraticCurveTo(15, 7, 0, 5);
        ctx.closePath();
        ctx.fill();
        drawDorsalSpikes(ctx, [[16, 2, 2.2, 0.3], [22, 4, 1.8, 0.4]], pal);

        // B) Dik & Tombul Gövde (Poposuna Oturmuş, Dik & Pofuduk)
        const torsoY = -12 + breath * 2;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gövde hacim parlaması
        const shine = ctx.createRadialGradient(0, torsoY - 2, 2, 0, torsoY, 13);
        shine.addColorStop(0, "rgba(255, 255, 255, 0.15)");
        shine.addColorStop(0.7, "rgba(255, 255, 255, 0.0)");
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Krem Karın Paneli (Dik, Gururlu & Pofuduk)
        ctx.fillStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY + 2, 7.5, 9.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.ventralShade;
        ctx.lineWidth = 0.8;
        for (let py = -4; py <= 5; py += 3.2) {
            ctx.beginPath();
            ctx.moveTo(-5, torsoY + py);
            ctx.lineTo(5, torsoY + py);
            ctx.stroke();
        }

        // C) İki Yana Simetrik Toplanmış Tombul Uyluklar
        [-11, 11].forEach((hx, idx) => {
            const thighGrad = ctx.createLinearGradient(hx, -8, hx, 4);
            thighGrad.addColorStop(0, pal.dorsalHighlight);
            thighGrad.addColorStop(0.6, pal.dorsalBase);
            thighGrad.addColorStop(1, pal.dorsalShade);
            ctx.fillStyle = thighGrad;
            ctx.beginPath();
            ctx.ellipse(hx, -2, 6.8, 7.5, idx === 0 ? 0.2 : -0.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // D) Önde Yere Düz Basan 3 Pençeli Patiler (Derli Toplu & Simetrik)
        drawPlantedFoot(ctx, -8.5, 2.5, pal);
        drawPlantedFoot(ctx, 8.5, 2.5, pal);

        // E) Minik Kollar: Göbeğin Üstünde Tatlı Tatlı Dinlenen
        ctx.strokeStyle = pal.dorsalBase;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        // Sol kol
        ctx.beginPath();
        ctx.moveTo(-6, torsoY + 1);
        ctx.lineTo(-3, torsoY + 4);
        ctx.lineTo(-1, torsoY + 3.5);
        ctx.stroke();
        ctx.fillStyle = pal.clawDark;
        ctx.beginPath(); ctx.arc(-0.5, torsoY + 3.5, 0.9, 0, Math.PI * 2); ctx.fill();

        // Sağ kol
        ctx.beginPath();
        ctx.moveTo(6, torsoY + 1);
        ctx.lineTo(3, torsoY + 4);
        ctx.lineTo(1, torsoY + 3.5);
        ctx.stroke();
        ctx.fillStyle = pal.clawDark;
        ctx.beginPath(); ctx.arc(0.5, torsoY + 3.5, 0.9, 0, Math.PI * 2); ctx.fill();

        // F) Dik & Sempatik Kafa
        ctx.save();
        const headY = -25 + breath * 1.5;
        ctx.translate(0, headY);

        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.roundRect(-8, -8, 16, 12, [5, 5, 2, 2]);
        ctx.fill();

        // İki Sarı Göz
        [-5, 5].forEach(ex => {
            ctx.fillStyle = pal.dorsalDeep;
            ctx.fillRect(ex - 2, -7.5, 4, 2);
            ctx.fillStyle = pal.eyeAmber;
            ctx.beginPath(); ctx.arc(ex, -4.5, 2.2, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = pal.eyePupil;
            ctx.fillRect(ex - 0.5, -6.2, 1, 3.4);
            ctx.fillStyle = pal.eyeHigh;
            ctx.fillRect(ex + 0.5, -5.2, 0.6, 0.6);
        });

        // Burun
        ctx.fillStyle = pal.dorsalHighlight;
        ctx.fillRect(-4, -1, 8, 4);
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath(); ctx.arc(-2.5, 1.5, 1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(2.5, 1.5, 1, 0, Math.PI * 2); ctx.fill();

        // Ağız & Dişler
        ctx.fillStyle = pal.mouthInterior;
        ctx.fillRect(-6, 4, 12, 3);
        ctx.fillStyle = pal.toothWhite;
        for (let tx = -5; tx <= 5; tx += 2.5) {
            ctx.beginPath(); ctx.moveTo(tx, 4); ctx.lineTo(tx + 0.8, 6.5); ctx.lineTo(tx + 1.6, 4); ctx.fill();
            ctx.beginPath(); ctx.moveTo(tx, 7); ctx.lineTo(tx + 0.8, 4.5); ctx.lineTo(tx + 1.6, 7); ctx.fill();
        }

        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.roundRect(-7, 7, 14, 3, 1);
        ctx.fill();

        ctx.restore();
    }

    // 2. YAN PROFİLDEN OTURMA (SAĞ / SOL): Bacak, Dik Gövde & Kıvrılan Kuyruk
    function drawSittingSide(ctx, breath, pal) {
        // A) Kuyruk arkadan yere yaslanmış ve ucu hafif yukarı kıvrılmış
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(-6, -4);
        ctx.quadraticCurveTo(-18, -6, -30, 2);
        ctx.quadraticCurveTo(-34, 4, -31, 6.5);
        ctx.quadraticCurveTo(-24, 7, -4, 5);
        ctx.closePath();
        ctx.fill();
        drawDorsalSpikes(ctx, [[-16, -4.5, 2.6, -0.2], [-24, -1.0, 2.2, -0.3], [-29, 3.0, 1.6, -0.4]], pal);

        // B) Dik Tombul Gövde
        const torsoY = -12 + breath * 2;
        const bodyGrad = ctx.createLinearGradient(5, torsoY - 12, -10, 4);
        bodyGrad.addColorStop(0, pal.dorsalHighlight);
        bodyGrad.addColorStop(0.5, pal.dorsalBase);
        bodyGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 12.5, -0.06, 0, Math.PI * 2);
        ctx.fill();

        // Karın Paneli (Krem)
        ctx.fillStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.moveTo(-1, -3);
        ctx.quadraticCurveTo(6, -4, 10, -10);
        ctx.quadraticCurveTo(4, -1, -2, -1);
        ctx.closePath();
        ctx.fill();

        // Sırt Dikenleri
        drawDorsalSpikes(ctx, [[-5, torsoY - 11.5, 3.2, -0.08], [1, torsoY - 12.5, 3.4, 0], [7, torsoY - 11.0, 2.8, 0.12]], pal);

        // C) Katlanmış Uyluk & Öne Basan Pati (Doğal & Pofuduk)
        const thighGrad = ctx.createLinearGradient(0, -8, 0, 8);
        thighGrad.addColorStop(0, pal.dorsalHighlight);
        thighGrad.addColorStop(0.55, pal.dorsalBase);
        thighGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = thighGrad;
        ctx.beginPath();
        ctx.ellipse(2, -1.5, 7.2, 8.0, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Öne uzanan incik ve yere basan pati
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(0, 2);
        ctx.lineTo(6.5, 2);
        ctx.lineTo(7.0, 4.8);
        ctx.lineTo(-1.0, 4.8);
        ctx.closePath();
        ctx.fill();
        drawPlantedFoot(ctx, 5.5, 2.8, pal);

        // D) Minik Kol (Göğüste Dinlenen)
        ctx.strokeStyle = pal.dorsalBase;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(6, torsoY);
        ctx.lineTo(9, torsoY + 3);
        ctx.lineTo(12, torsoY + 2);
        ctx.stroke();
        ctx.fillStyle = pal.clawDark;
        ctx.beginPath(); ctx.arc(12.5, torsoY + 2, 0.9, 0, Math.PI * 2); ctx.fill();

        // E) Dik Kafa (Yan Profil)
        ctx.save();
        const headX = 11;
        const headY = -23 + breath * 1.5;
        ctx.translate(headX, headY);

        // Boyun
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(-5, 7); ctx.lineTo(1, -2); ctx.lineTo(6, 4); ctx.lineTo(0, 8);
        ctx.closePath();
        ctx.fill();

        // Kafa Kütlesi
        const skullGrad = ctx.createLinearGradient(0, -8, 16, 4);
        skullGrad.addColorStop(0, pal.dorsalHighlight);
        skullGrad.addColorStop(0.5, pal.dorsalBase);
        skullGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = skullGrad;
        ctx.beginPath();
        ctx.moveTo(-3, -3); ctx.lineTo(3, -7); ctx.lineTo(16, -4); ctx.lineTo(17, 2);
        ctx.lineTo(8, 4); ctx.lineTo(-3, 4);
        ctx.closePath();
        ctx.fill();

        // Göz & Kaş
        ctx.fillStyle = pal.dorsalDeep; ctx.fillRect(2, -7.5, 5.5, 2.5);
        ctx.fillStyle = pal.eyeAmber; ctx.beginPath(); ctx.arc(4.5, -4.8, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = pal.eyePupil; ctx.fillRect(4.2, -6.4, 0.9, 3.3);
        ctx.fillStyle = pal.eyeHigh; ctx.fillRect(5.0, -5.5, 0.6, 0.6);

        // Burun Deliği
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath(); ctx.arc(15, -1.8, 1.0, 0, Math.PI * 2); ctx.fill();

        // Ağız & Dişler
        ctx.fillStyle = pal.mouthInterior;
        ctx.beginPath(); ctx.moveTo(3, 4); ctx.lineTo(15, 2); ctx.lineTo(13, 5); ctx.lineTo(3, 5); ctx.fill();
        ctx.fillStyle = pal.toothWhite;
        for (let tx = 4; tx <= 14; tx += 2.5) {
            ctx.beginPath(); ctx.moveTo(tx, 4); ctx.lineTo(tx + 0.8, 1.8); ctx.lineTo(tx + 1.6, 4); ctx.fill();
        }

        ctx.restore();
    }

    // 3. TAM ARKA OTURMA (KUZEY / UP): Pofuduk Sırt & Sırt Dikenleri
    function drawSittingBack(ctx, breath, pal) {
        // A) İki Yanda Katlanmış Uyluklar
        [-11, 11].forEach((hx, idx) => {
            const thighGrad = ctx.createLinearGradient(hx, -8, hx, 6);
            thighGrad.addColorStop(0, pal.dorsalBase);
            thighGrad.addColorStop(1, pal.dorsalShade);
            ctx.fillStyle = thighGrad;
            ctx.beginPath();
            ctx.ellipse(hx, -2, 6.5, 7.5, idx === 0 ? 0.2 : -0.2, 0, Math.PI * 2);
            ctx.fill();
        });

        // B) Dik & Pofuduk Sırt
        const torsoY = -12 + breath * 2;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 13, 0, 0, Math.PI * 2);
        ctx.fill();

        // Omurga Dikenleri (Yukarıdan aşağı)
        drawDorsalSpikes(ctx, [
            [0, torsoY - 11.5, 3.4, 0],
            [0, torsoY - 7.5, 3.2, 0],
            [0, torsoY - 3.5, 3.0, 0],
            [0, torsoY + 1.0, 2.8, 0]
        ], pal);

        // C) Yere Yaslanan Pofuduk Kuyruk
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.moveTo(-6, torsoY + 4);
        ctx.quadraticCurveTo(-4, 2, -2, 7);
        ctx.quadraticCurveTo(0, 9, 2, 7);
        ctx.quadraticCurveTo(4, 2, 6, torsoY + 4);
        ctx.closePath();
        ctx.fill();
        drawDorsalSpikes(ctx, [[0, 5, 2.2, 0], [0, 8, 1.6, 0]], pal);

        // D) Kafa Arkası (İleriye Yönelik)
        ctx.save();
        const headY = -25 + breath * 1.5;
        ctx.translate(0, headY);
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.roundRect(-7, -7, 14, 10, [5, 5, 2, 2]);
        ctx.fill();
        drawDorsalSpikes(ctx, [[-3, -8, 2.5, 0], [3, -8, 2.5, 0]], pal);
        ctx.restore();
    }

    // 4. 3/4 ÇAPRAZ ÖN OTURMA (SAĞ-ALT & SOL-ALT: TOMBUL PELUŞ MASKOT OTURUŞU)
    // Göbek asla bacakla örtülmez, ortada geniş ve pofuduk durur.
    // İki iri kehribar gözü ve gülümseyen dişleri görünür, sempatik maskot havası %100 korunur.
    function drawSittingQuarterFront(ctx, breath, pal) {
        // A) Kuyruk (Arkada yere serilmiş ve ucu kıvrılmış tatlı denge kuyruğu)
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.moveTo(-5, -2);
        ctx.quadraticCurveTo(-17, -1, -26, 3);
        ctx.quadraticCurveTo(-28, 5.5, -25, 6.5);
        ctx.quadraticCurveTo(-14, 5.5, -2, 3.5);
        ctx.closePath();
        ctx.fill();
        drawDorsalSpikes(ctx, [[-15, 0.5, 2.0, -0.15], [-22, 2.4, 1.6, -0.25]], pal);

        // B) Sol (Uzak) Uyluk & Pati (Gövdenin sol yanında açık durur)
        const farThighGrad = ctx.createLinearGradient(-9, -8, -9, 4);
        farThighGrad.addColorStop(0, pal.dorsalBase);
        farThighGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = farThighGrad;
        ctx.beginPath();
        ctx.ellipse(-9.5, -2.0, 6.2, 7.2, 0.20, 0, Math.PI * 2);
        ctx.fill();
        drawPlantedFoot(ctx, -8.3, 2.2, pal);

        // C) Dik & Tombul Gövde (Poposuna Oturmuş, Dik & Pofuduk)
        const torsoY = -12 + breath * 2;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14.2, 13.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Gövde hacim parlaması
        const shine = ctx.createRadialGradient(2, torsoY - 2, 2, 0, torsoY, 13.5);
        shine.addColorStop(0, "rgba(255, 255, 255, 0.16)");
        shine.addColorStop(0.7, "rgba(255, 255, 255, 0.0)");
        ctx.fillStyle = shine;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14.2, 13.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // D) Pofuduk Krem Göbek (Geniş, Dik, Tam Ortada & %100 Açıkta - Asla Bacak Örtmez!)
        ctx.fillStyle = pal.ventralBase;
        ctx.beginPath();
        ctx.ellipse(1.2, torsoY + 2, 7.8, 9.8, 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = pal.ventralShade;
        ctx.lineWidth = 0.8;
        for (let py = -4; py <= 6; py += 3.4) {
            ctx.beginPath();
            ctx.moveTo(-4, torsoY + py);
            ctx.lineTo(6.5, torsoY + py);
            ctx.stroke();
        }

        // E) Sağ (Ön) Uyluk & Pati (Gövdenin sağ yanında açılmış, göbeği asla örtmez!)
        const nearThighGrad = ctx.createLinearGradient(10.5, -8, 10.5, 6);
        nearThighGrad.addColorStop(0, pal.dorsalHighlight);
        nearThighGrad.addColorStop(0.55, pal.dorsalBase);
        nearThighGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = nearThighGrad;
        ctx.beginPath();
        ctx.ellipse(10.2, -1.0, 6.8, 7.8, -0.20, 0, Math.PI * 2);
        ctx.fill();
        drawPlantedFoot(ctx, 9.2, 3.6, pal);

        // Sırt Dikenleri
        drawDorsalSpikes(ctx, [
            [-6, torsoY - 12.0, 3.0, -0.1],
            [0, torsoY - 13.0, 3.2, 0],
            [6, torsoY - 11.5, 2.8, 0.1]
        ], pal);

        // F) İki Minik Sevimli Kol: Göbeğin Üstünde Tatlı Tatlı Dinlenen
        ctx.strokeStyle = pal.dorsalBase;
        ctx.lineWidth = 2.4;
        ctx.lineCap = "round";
        // Sol kol
        ctx.beginPath();
        ctx.moveTo(-4.5, torsoY + 1.2);
        ctx.lineTo(-1.5, torsoY + 3.6);
        ctx.lineTo(0.5, torsoY + 3.0);
        ctx.stroke();
        ctx.fillStyle = pal.clawDark;
        ctx.beginPath(); ctx.arc(1.0, torsoY + 3.0, 0.8, 0, Math.PI * 2); ctx.fill();

        // Sağ kol
        ctx.beginPath();
        ctx.moveTo(5.5, torsoY + 1.8);
        ctx.lineTo(3.2, torsoY + 4.6);
        ctx.lineTo(1.5, torsoY + 4.0);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(1.0, torsoY + 4.0, 0.8, 0, Math.PI * 2); ctx.fill();

        // G) 3/4 Açı Sevimli Maskot Kafa (İki Göz Görünür, İleri-Çapraz Canlı Bakış, Gülümseme)
        ctx.save();
        const headX = 4.5;
        const headY = -25 + breath * 1.5;
        ctx.translate(headX, headY);

        // Kafa Kubbesi
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.roundRect(-8, -8, 16.5, 12, [5, 5, 2, 2]);
        ctx.fill();

        // Sol Göz (Perspektifte hafif dar, sevimli)
        ctx.fillStyle = pal.dorsalDeep; ctx.fillRect(-6, -7.5, 4, 2);
        ctx.fillStyle = pal.eyeAmber; ctx.beginPath(); ctx.arc(-4.0, -4.5, 2.1, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = pal.eyePupil; ctx.fillRect(-4.5, -6.0, 0.9, 3.2);
        ctx.fillStyle = pal.eyeHigh; ctx.fillRect(-3.8, -5.3, 0.6, 0.6);

        // Sağ Göz (Öndeki ana kehribar göz)
        ctx.fillStyle = pal.dorsalDeep; ctx.fillRect(2.5, -7.5, 4.5, 2);
        ctx.fillStyle = pal.eyeAmber; ctx.beginPath(); ctx.arc(4.8, -4.5, 2.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = pal.eyePupil; ctx.fillRect(4.4, -6.2, 1.0, 3.4);
        ctx.fillStyle = pal.eyeHigh; ctx.fillRect(5.3, -5.4, 0.7, 0.7);

        // Burun Delikleri
        ctx.fillStyle = pal.dorsalDeep;
        ctx.beginPath(); ctx.arc(-1.0, 0.8, 0.9, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4.0, 0.8, 0.9, 0, Math.PI * 2); ctx.fill();

        // Sevimli Dişler ve Gülümseme
        ctx.fillStyle = pal.mouthInterior;
        ctx.beginPath(); ctx.roundRect(-4.5, 2.2, 12, 4.0, 1); ctx.fill();

        ctx.fillStyle = pal.toothWhite;
        [-3.0, -0.5, 2.0, 4.5].forEach(tx => {
            ctx.beginPath(); ctx.moveTo(tx - 0.9, 2.2); ctx.lineTo(tx, 4.0); ctx.lineTo(tx + 0.9, 2.2); ctx.fill();
        });
        [-1.8, 0.8, 3.3].forEach(bx => {
            ctx.beginPath(); ctx.moveTo(bx - 0.8, 6.2); ctx.lineTo(bx, 4.6); ctx.lineTo(bx + 0.8, 6.2); ctx.fill();
        });

        // Tombul Çene
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath(); ctx.roundRect(-5.0, 5.8, 13, 2.5, 1); ctx.fill();

        ctx.restore();
    }

    // 5. 3/4 ÇAPRAZ SIRT OTURMA
    function drawSittingQuarterBack(ctx, breath, pal) {
        // Sol bacak (arka plan)
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.ellipse(-7, -2, 6.0, 7.0, 0.15, 0, Math.PI * 2);
        ctx.fill();

        // Kuyruk zeminde uzanır
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.moveTo(-5, -4);
        ctx.quadraticCurveTo(-18, -2, -28, 3);
        ctx.quadraticCurveTo(-31, 5.5, -28, 7.0);
        ctx.quadraticCurveTo(-16, 6, -3, 4);
        ctx.closePath();
        ctx.fill();

        // Pofuduk Sırt
        const torsoY = -12 + breath * 2;
        ctx.fillStyle = pal.dorsalBase;
        ctx.beginPath();
        ctx.ellipse(0, torsoY, 14, 12.5, 0.06, 0, Math.PI * 2);
        ctx.fill();

        drawDorsalSpikes(ctx, [[-4, torsoY - 11.5, 3.2, 0], [2, torsoY - 12.2, 3.4, 0], [8, torsoY - 11.0, 3.0, 0.1]], pal);

        // Sağ bacak (ön plan)
        const thighGrad = ctx.createLinearGradient(5, -8, 5, 6);
        thighGrad.addColorStop(0, pal.dorsalHighlight);
        thighGrad.addColorStop(0.6, pal.dorsalBase);
        thighGrad.addColorStop(1, pal.dorsalShade);
        ctx.fillStyle = thighGrad;
        ctx.beginPath();
        ctx.ellipse(5, -1.5, 6.8, 7.5, -0.15, 0, Math.PI * 2);
        ctx.fill();
        drawPlantedFoot(ctx, 5.2, 2.8, pal);

        // Kafa arkası
        ctx.save();
        const headX = 8;
        const headY = -23 + breath * 1.5;
        ctx.translate(headX, headY);
        ctx.fillStyle = pal.dorsalShade;
        ctx.beginPath();
        ctx.roundRect(-4, -7, 12, 10, [4, 4, 2, 2]);
        ctx.fill();
        drawDorsalSpikes(ctx, [[-1, -8, 2.5, 0], [5, -8, 2.5, 0.1]], pal);
        ctx.restore();
    }

    // =========================================================================
    // MODÜL TANIMI VE DIŞA AKTARIM
    // =========================================================================
    const definition = {
        id: 'costume_trex',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawTrex(ctx, facing, isMoving, walkCycle, isSitting);
        },
        getNameTagOffset: () => -34
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_trex'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_trex', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
