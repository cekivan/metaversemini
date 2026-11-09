// public/js/renderers/dobermanPetRenderer.js - 🐕‍🦺 2.5D İzometrik 8 Yönlü Doberman Koruma Köpeği
// Tekinsiz Tekin Karaborsa Özel Yoldaşı (Karadul Örümcek & T-Rex Standartlarında Baştan Tasarlandı)
// Özellikler: Atletik kaslı gövde, pas/bakır tan desenleri, çivili deri mafya tasması, dik kulaklar, 8 yönlü izometrik yürüyüş kinematiği.

(function (global) {
    'use strict';

    function normalizeFacing(f) {
        if (!f) return 'down';
        let str = String(f).toLowerCase().replace('_', '-').trim();
        const valid = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
        return valid.includes(str) ? str : 'down';
    }

    /**
     * Doberman Renk Paleti (Obsidian Siyahı & Zengin Maun/Pas Kırmızısı)
     */
    const PALETTE = {
        coatBase:    '#111116', // Ana parlak obsidian siyah kürk
        coatDark:    '#07070a', // Derin gölge / karın altı
        coatHigh:    '#252533', // Kas hacim parlaması
        coatRim:     '#3a3a4d', // Üst kenar ışığı (rimlight)
        
        rustBase:    '#b45309', // Karakteristik Doberman pas/tan rengi
        rustDark:    '#853805', // Pas rengi gölge
        rustLight:   '#d97706', // Pas rengi ışık / vurgu

        collarDark:  '#18181b', // Çivili deri tasma gövdesi
        collarEdge:  '#27272a', 
        spikeMetal:  '#f8fafc', // Krom piramit çiviler
        spikeShadow: '#64748b',
        ringGold:    '#facc15', // Pirinç tasma halkası

        eyeAmber:    '#f59e0b', // Yırtıcı altın kehribar gözler
        eyeGlint:    '#ffffff',
        noseLeather: '#09090b', // Islak siyah burun
        tonguePink:  '#f43f5e'
    };

    /**
     * Doberman Çizim Motoru
     */
    const DobermanPetRenderer = {
        /**
         * Tekil bir Doberman petini çizer
         * @param {CanvasRenderingContext2D} ctx 
         * @param {Object} pet - Pet nesnesi (facing, walkCycle, isMoving, scale vb.)
         * @param {number} x - Merkez zemin X koordinatı
         * @param {number} y - Zemin temas Y koordinatı
         * @param {number} now - Date.now()
         */
        draw(ctx, pet, x, y, now) {
            ctx.save();
            ctx.translate(x, y);

            const scale = (pet.scale || 1.05) * 1.0;
            ctx.scale(scale, scale);

            const facing = normalizeFacing(pet.facing || 'down');
            const poses = {
                'down':        { view: 'front',         mirror: 1 },
                'down-right':  { view: 'quarter-front', mirror: 1 },
                'right':       { view: 'side',          mirror: 1 },
                'up-right':    { view: 'quarter-back',  mirror: 1 },
                'up':          { view: 'back',          mirror: 1 },
                'up-left':     { view: 'quarter-back',  mirror: -1 },
                'left':        { view: 'side',          mirror: -1 },
                'down-left':   { view: 'quarter-front', mirror: -1 }
            };

            const pose = poses[facing] || poses.down;
            const view = pose.view;
            const mirror = pose.mirror;

            // Zaman & Kinematik Değişkenleri
            const time = now || Date.now();
            const breath = Math.sin(time / 450) * 0.035;
            const tailWag = Math.sin(time / 280) * 0.12;

            const isMoving = !!pet.isMoving;
            const walkCycle = pet.walkCycle || 0;
            const stride = isMoving ? walkCycle * 2.2 : 0;

            // Aynalama (Sol yönler için)
            ctx.scale(mirror, 1);

            // 1. ZEMİN GÖLGESİ (Katmanlı Ambient Occlusion - Örümcek Standardı)
            ctx.save();
            ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            ctx.beginPath();
            ctx.ellipse(0, 1.5, 18, 7.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
            ctx.beginPath();
            ctx.ellipse(0, 0.5, 11, 4.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Yürüyüş Çapraz Bacak Kinematiği (Trot Gait)
            // Çift A (Ön Sol & Arka Sağ) vs Çift B (Ön Sağ & Arka Sol)
            const legSwingA = Math.sin(stride) * 5.5;
            const legSwingB = Math.sin(stride + Math.PI) * 5.5;
            const bodyBob = isMoving ? Math.abs(Math.sin(stride * 2)) * 1.6 : Math.sin(time / 450) * 0.6;

            // Çizim Modülleri
            if (view === 'front') {
                this.drawFront(ctx, legSwingA, legSwingB, bodyBob, breath, tailWag);
            } else if (view === 'quarter-front') {
                this.drawQuarterFront(ctx, legSwingA, legSwingB, bodyBob, breath, tailWag);
            } else if (view === 'side') {
                this.drawSide(ctx, legSwingA, legSwingB, bodyBob, breath, tailWag);
            } else if (view === 'quarter-back') {
                this.drawQuarterBack(ctx, legSwingA, legSwingB, bodyBob, breath, tailWag);
            } else if (view === 'back') {
                this.drawBack(ctx, legSwingA, legSwingB, bodyBob, breath, tailWag);
            }

            // Sahibin İsmi / Pet Etiketi
            if (pet.speech && pet.speechUntil && pet.speechUntil > time) {
                this.drawSpeechBubble(ctx, pet.speech);
            }

            ctx.restore();
        },

        // =========================================================================
        // GÖRÜNÜM 1: FRONT (down - Tam Ön Görünüm)
        // =========================================================================
        drawFront(ctx, swingA, swingB, bob, breath, tailWag) {
            ctx.save();
            ctx.translate(0, -bob);

            // A) ARKA BACAKLAR (Gövdenin arkasında yanlara doğru açılmış nöbetçi duruşu)
            [-1, 1].forEach((side, idx) => {
                const s = (idx === 0) ? swingB : swingA;
                ctx.save();
                ctx.fillStyle = PALETTE.coatDark;
                ctx.beginPath();
                ctx.ellipse(side * 11, -8 + s * 0.3, 4, 8, side * 0.12, 0, Math.PI * 2);
                ctx.fill();

                // Arka Patiler
                ctx.fillStyle = PALETTE.rustDark;
                ctx.beginPath();
                ctx.ellipse(side * 11.5, 0 + s * 0.4, 3, 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // B) GÖVDE & DERİN GÖĞÜS (Muscular Brisket)
            ctx.save();
            const chestGrad = ctx.createLinearGradient(0, -22, 0, -4);
            chestGrad.addColorStop(0, PALETTE.coatHigh);
            chestGrad.addColorStop(0.3, PALETTE.coatBase);
            chestGrad.addColorStop(1, PALETTE.coatDark);

            ctx.fillStyle = chestGrad;
            ctx.beginPath();
            ctx.ellipse(0, -13, 9.5 + breath * 4, 11, 0, 0, Math.PI * 2);
            ctx.fill();

            // Göğüsteki İkonik İkiz Pas/Tan Üçgenleri (Dual Rust Chest Patches)
            ctx.fillStyle = PALETTE.rustBase;
            // Sol Üçgen
            ctx.beginPath();
            ctx.moveTo(-7.5, -17);
            ctx.lineTo(-2.2, -14);
            ctx.lineTo(-5.5, -9);
            ctx.closePath();
            ctx.fill();
            // Sağ Üçgen
            ctx.beginPath();
            ctx.moveTo(7.5, -17);
            ctx.lineTo(2.2, -14);
            ctx.lineTo(5.5, -9);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // C) ÖN BACAKLAR (Düz, sütun gibi güçlü atletik bacaklar)
            [-1, 1].forEach((side, idx) => {
                const s = (idx === 0) ? swingA : swingB;
                ctx.save();
                // Bacak Üstü (Siyah)
                ctx.fillStyle = PALETTE.coatBase;
                ctx.beginPath();
                ctx.roundRect(side * 5 - 2, -12, 4, 8 + s * 0.4, 2);
                ctx.fill();

                // Alt Bacak ve Pati (Pas / Tan Rengi)
                ctx.fillStyle = PALETTE.rustBase;
                ctx.beginPath();
                ctx.roundRect(side * 5 - 1.8, -4 + s * 0.4, 3.6, 5, 1.5);
                ctx.fill();

                // Pati Ucu
                ctx.fillStyle = PALETTE.rustLight;
                ctx.beginPath();
                ctx.ellipse(side * 5, 1.5 + s * 0.3, 2.5, 1.6, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // D) BOYUN & ÇİVİLİ DERİ TASMA (Spiked Leather Collar)
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.moveTo(-5.5, -19);
            ctx.lineTo(5.5, -19);
            ctx.lineTo(4.5, -24);
            ctx.lineTo(-4.5, -24);
            ctx.closePath();
            ctx.fill();

            // Tasma Bandı
            ctx.fillStyle = PALETTE.collarDark;
            ctx.strokeStyle = PALETTE.collarEdge;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.roundRect(-6.5, -21.5, 13, 3.2, 1.2);
            ctx.fill();
            ctx.stroke();

            // Metalik Krom Çiviler / Piramitler
            [-4.5, -1.5, 1.5, 4.5].forEach(cx => {
                ctx.fillStyle = PALETTE.spikeMetal;
                ctx.beginPath();
                ctx.moveTo(cx, -23);
                ctx.lineTo(cx - 1.2, -20.5);
                ctx.lineTo(cx + 1.2, -20.5);
                ctx.closePath();
                ctx.fill();
            });

            // Pirinç D-Halkası
            ctx.strokeStyle = PALETTE.ringGold;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.arc(0, -18.5, 1.4, 0, Math.PI);
            ctx.stroke();
            ctx.restore();

            // E) KAFA (Chiseled Wedge Head)
            ctx.save();
            const headY = -28;
            ctx.translate(0, headY);

            // Kafa Tabanı
            const headGrad = ctx.createRadialGradient(0, -3, 2, 0, 0, 9);
            headGrad.addColorStop(0, PALETTE.coatHigh);
            headGrad.addColorStop(0.5, PALETTE.coatBase);
            headGrad.addColorStop(1, PALETTE.coatDark);

            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.ellipse(0, -1, 7.2, 6.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dik Kırpık Kulaklar (Erect Cropped Ears)
            [-1, 1].forEach(side => {
                ctx.save();
                // Kulak Dışı (Siyah)
                ctx.fillStyle = PALETTE.coatBase;
                ctx.strokeStyle = PALETTE.coatDark;
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(side * 4.2, -5.5);
                ctx.lineTo(side * 6.5, -16.5); // Sivri kulak ucu
                ctx.lineTo(side * 1.5, -7.0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Kulak İçi (Koyu Pas / Deri Astar)
                ctx.fillStyle = PALETTE.rustDark;
                ctx.beginPath();
                ctx.moveTo(side * 4.0, -6.5);
                ctx.lineTo(side * 5.8, -14.5);
                ctx.lineTo(side * 2.3, -7.2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            });

            // Namlu / Ağız (Muzzle) & Pas Çene
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.ellipse(0, 2.5, 4.2, 3.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Üst Burun Köprüsü (Siyah Şerit)
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.moveTo(-1.6, -2);
            ctx.lineTo(1.6, -2);
            ctx.lineTo(2.2, 2);
            ctx.lineTo(-2.2, 2);
            ctx.closePath();
            ctx.fill();

            // Burun (Nose)
            ctx.fillStyle = PALETTE.noseLeather;
            ctx.beginPath();
            ctx.ellipse(0, 1.8, 2.0, 1.3, 0, 0, Math.PI * 2);
            ctx.fill();

            // Yırtıcı Altın Kehribar Gözler
            [-1, 1].forEach(side => {
                ctx.save();
                // Göz Yuvası
                ctx.fillStyle = PALETTE.coatDark;
                ctx.beginPath();
                ctx.ellipse(side * 3.5, -2, 2.0, 1.5, side * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // İris (Altın Kehribar)
                ctx.fillStyle = PALETTE.eyeAmber;
                ctx.beginPath();
                ctx.arc(side * 3.5, -2, 1.3, 0, Math.PI * 2);
                ctx.fill();

                // Göz Bebeği
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                ctx.arc(side * 3.5, -2, 0.7, 0, Math.PI * 2);
                ctx.fill();

                // Işıltı Glint
                ctx.fillStyle = PALETTE.eyeGlint;
                ctx.beginPath();
                ctx.arc(side * 3.2, -2.4, 0.4, 0, Math.PI * 2);
                ctx.fill();

                // İkonik Pas Kaş Benekleri (Rust Eyebrow Spots)
                ctx.fillStyle = PALETTE.rustLight;
                ctx.beginPath();
                ctx.ellipse(side * 3.6, -4.5, 1.1, 0.8, side * 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            ctx.restore(); // Head
            ctx.restore(); // Front
        },

        // =========================================================================
        // GÖRÜNÜM 2: QUARTER-FRONT (down-right - 2.5D İzometrik Çapraz Ön Görünüm)
        // =========================================================================
        drawQuarterFront(ctx, swingA, swingB, bob, breath, tailWag) {
            ctx.save();
            ctx.translate(0, -bob);

            // A) DİK KESİK KUYRUK (Docked Tail - Arka Flankta)
            ctx.save();
            ctx.strokeStyle = PALETTE.coatBase;
            ctx.lineWidth = 3.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-11, -17);
            ctx.lineTo(-14 + tailWag * 10, -24);
            ctx.stroke();
            ctx.restore();

            // B) ARKA UZAK BACAK (Far Rear Leg)
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.ellipse(-8 - swingA * 0.4, -9, 4, 7, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustDark;
            ctx.beginPath();
            ctx.ellipse(-9 - swingA * 0.4, 0.5, 2.6, 1.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // C) ÖN UZAK BACAK (Far Front Leg)
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.roundRect(1 - swingB * 0.4, -13, 3.5, 8, 1.8);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustDark;
            ctx.beginPath();
            ctx.roundRect(1.2 - swingB * 0.4, -5, 3.2, 5, 1.2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.ellipse(2.8 - swingB * 0.4, 1.2, 2.4, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // D) GÖVDE (2.5D İzometrik Atletik Silüet - Derin Göğüs & İnce Bel)
            ctx.save();
            const bodyGrad = ctx.createLinearGradient(-14, -20, 10, -5);
            bodyGrad.addColorStop(0, PALETTE.coatBase);
            bodyGrad.addColorStop(0.35, PALETTE.coatHigh);
            bodyGrad.addColorStop(0.7, PALETTE.coatBase);
            bodyGrad.addColorStop(1, PALETTE.coatDark);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-12, -14); // Kalça
            ctx.quadraticCurveTo(-4, -18 - breath * 3, 5, -17); // Sırt çizgisi
            ctx.quadraticCurveTo(11, -12, 8, -5); // Derin göğüs (brisket)
            ctx.quadraticCurveTo(0, -4, -6, -9); // İnce karın (tuck-up)
            ctx.closePath();
            ctx.fill();

            // Göğüs Pas Lekesi
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.moveTo(3, -15);
            ctx.lineTo(8, -12);
            ctx.lineTo(6, -6);
            ctx.lineTo(2, -9);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // E) ARKA YAKIN BACAK (Near Rear Leg - Güçlü Uyluk)
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.ellipse(-7 + swingA * 0.4, -9, 4.8, 8.2, 0.25, 0, Math.PI * 2);
            ctx.fill();

            // Alt bacak & Pati
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.roundRect(-8.5 + swingA * 0.4, -3, 3.4, 4.5, 1.2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustLight;
            ctx.beginPath();
            ctx.ellipse(-6.8 + swingA * 0.4, 2.0, 2.8, 1.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // F) ÖN YAKIN BACAK (Near Front Leg)
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.roundRect(5 + swingB * 0.4, -13, 4.0, 8.5, 2);
            ctx.fill();

            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.roundRect(5.2 + swingB * 0.4, -4.5, 3.6, 5.5, 1.4);
            ctx.fill();

            ctx.fillStyle = PALETTE.rustLight;
            ctx.beginPath();
            ctx.ellipse(7.0 + swingB * 0.4, 2.2, 2.8, 1.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // G) BOYUN & ÇİVİLİ TASMA
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.moveTo(1, -17);
            ctx.lineTo(8, -16);
            ctx.lineTo(9, -24);
            ctx.lineTo(2, -23);
            ctx.closePath();
            ctx.fill();

            // Tasma
            ctx.fillStyle = PALETTE.collarDark;
            ctx.strokeStyle = PALETTE.collarEdge;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.roundRect(1, -22, 10, 3.4, 1.2);
            ctx.fill();
            ctx.stroke();

            // Çiviler
            [3.2, 5.8, 8.4].forEach(cx => {
                ctx.fillStyle = PALETTE.spikeMetal;
                ctx.beginPath();
                ctx.moveTo(cx, -23.8);
                ctx.lineTo(cx - 1.1, -21);
                ctx.lineTo(cx + 1.1, -21);
                ctx.closePath();
                ctx.fill();
            });
            ctx.restore();

            // H) KAFA (Quarter-Front Profile)
            ctx.save();
            ctx.translate(7, -27);

            // Kafa Kubbesi
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, -1, 6.8, 6.2, 0.15, 0, Math.PI * 2);
            ctx.fill();

            // Uzak Kulak
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.moveTo(-2, -5);
            ctx.lineTo(-1, -15.5);
            ctx.lineTo(2, -6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Yakın Kulak
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.strokeStyle = PALETTE.coatDark;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(2.5, -4.5);
            ctx.lineTo(5.5, -16.5);
            ctx.lineTo(0.5, -6.0);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = PALETTE.rustDark;
            ctx.beginPath();
            ctx.moveTo(2.5, -5.5);
            ctx.lineTo(4.8, -14.5);
            ctx.lineTo(1.2, -6.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // Namlu (Muzzle)
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.moveTo(1, -2);
            ctx.lineTo(6.5, 0);
            ctx.lineTo(6.0, 3.5);
            ctx.lineTo(0, 3.0);
            ctx.closePath();
            ctx.fill();

            // Siyah Burun
            ctx.fillStyle = PALETTE.noseLeather;
            ctx.beginPath();
            ctx.ellipse(6.2, 0.8, 1.8, 1.3, 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Göz & Kaş Leke
            ctx.fillStyle = PALETTE.eyeAmber;
            ctx.beginPath();
            ctx.arc(2.2, -2, 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(2.3, -2, 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.eyeGlint;
            ctx.beginPath();
            ctx.arc(2.0, -2.4, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Kaş lekesi
            ctx.fillStyle = PALETTE.rustLight;
            ctx.beginPath();
            ctx.ellipse(2.2, -4.6, 1.2, 0.8, 0.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore(); // Head
            ctx.restore(); // Quarter-Front
        },

        // =========================================================================
        // GÖRÜNÜM 3: SIDE (right - Kusursuz Yan Profil)
        // =========================================================================
        drawSide(ctx, swingA, swingB, bob, breath, tailWag) {
            ctx.save();
            ctx.translate(0, -bob);

            // A) KESİK KUYRUK
            ctx.save();
            ctx.strokeStyle = PALETTE.coatBase;
            ctx.lineWidth = 3.4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-13, -15);
            ctx.lineTo(-17 + tailWag * 12, -23);
            ctx.stroke();
            ctx.restore();

            // B) UZAK ARKA BACAK
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.ellipse(-9 - swingA * 0.6, -7, 4.2, 7.5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustDark;
            ctx.beginPath();
            ctx.ellipse(-10 - swingA * 0.6, 1.0, 2.6, 1.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // C) UZAK ÖN BACAK
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.roundRect(4 - swingB * 0.6, -12, 3.6, 8, 1.8);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustDark;
            ctx.beginPath();
            ctx.roundRect(4.2 - swingB * 0.6, -4, 3.2, 5, 1.2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.ellipse(5.8 - swingB * 0.6, 1.5, 2.4, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // D) GÖVDE & DERİN BRISKET & TUCK-UP
            ctx.save();
            const bodyGrad = ctx.createLinearGradient(-15, -18, 10, -4);
            bodyGrad.addColorStop(0, PALETTE.coatBase);
            bodyGrad.addColorStop(0.3, PALETTE.coatHigh);
            bodyGrad.addColorStop(0.8, PALETTE.coatBase);
            bodyGrad.addColorStop(1, PALETTE.coatDark);

            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.moveTo(-13, -14); // Sağrı
            ctx.quadraticCurveTo(-4, -19 - breath * 3, 6, -17); // Sırt
            ctx.quadraticCurveTo(12, -12, 9, -5); // Derin göğüs
            ctx.quadraticCurveTo(1, -4, -6, -9); // İnce bel (tuck-up)
            ctx.closePath();
            ctx.fill();

            // Göğüs Önü Pas Rengi
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.moveTo(5, -15);
            ctx.lineTo(10, -11);
            ctx.lineTo(8, -5);
            ctx.lineTo(4, -8);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // E) YAKIN ARKA BACAK (Kaslı Uyluk)
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.ellipse(-8 + swingA * 0.6, -8, 5.2, 8.8, 0.28, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.roundRect(-9.8 + swingA * 0.6, -2, 3.6, 5.0, 1.3);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustLight;
            ctx.beginPath();
            ctx.ellipse(-8.0 + swingA * 0.6, 2.2, 3.0, 1.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // F) YAKIN ÖN BACAK
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.roundRect(7 + swingB * 0.6, -12, 4.2, 9.0, 2);
            ctx.fill();

            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.roundRect(7.2 + swingB * 0.6, -3.5, 3.8, 5.8, 1.5);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustLight;
            ctx.beginPath();
            ctx.ellipse(9.2 + swingB * 0.6, 2.4, 3.0, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // G) KASLI BOYUN & ÇİVİLİ TASMA
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.moveTo(2, -17);
            ctx.lineTo(8, -16);
            ctx.lineTo(9.5, -25);
            ctx.lineTo(2.5, -24);
            ctx.closePath();
            ctx.fill();

            // Tasma
            ctx.fillStyle = PALETTE.collarDark;
            ctx.strokeStyle = PALETTE.collarEdge;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.roundRect(2, -23, 8.5, 3.4, 1.2);
            ctx.fill();
            ctx.stroke();

            // Çiviler
            [3.8, 6.2, 8.6].forEach(cx => {
                ctx.fillStyle = PALETTE.spikeMetal;
                ctx.beginPath();
                ctx.moveTo(cx, -24.8);
                ctx.lineTo(cx - 1.1, -22);
                ctx.lineTo(cx + 1.1, -22);
                ctx.closePath();
                ctx.fill();
            });
            ctx.restore();

            // H) YAN KAFA PROFİLİ (Chiseled Wedge Silhouette)
            ctx.save();
            ctx.translate(8, -28);

            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, -1, 6.5, 5.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dik Kırpık Kulak
            ctx.fillStyle = PALETTE.coatBase;
            ctx.strokeStyle = PALETTE.coatDark;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(0.5, -5.0);
            ctx.lineTo(3.2, -17.0);
            ctx.lineTo(-2.2, -6.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = PALETTE.rustDark;
            ctx.beginPath();
            ctx.moveTo(0.5, -6.0);
            ctx.lineTo(2.6, -15.0);
            ctx.lineTo(-1.5, -7.0);
            ctx.closePath();
            ctx.fill();

            // Uzun Burun & Çene
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.lineTo(8.2, 0.5);
            ctx.lineTo(7.5, 3.8);
            ctx.lineTo(-1, 3.2);
            ctx.closePath();
            ctx.fill();

            // Burun Ucu
            ctx.fillStyle = PALETTE.noseLeather;
            ctx.beginPath();
            ctx.ellipse(7.8, 1.2, 1.8, 1.3, 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Göz & Kaş Noktası
            ctx.fillStyle = PALETTE.eyeAmber;
            ctx.beginPath();
            ctx.arc(1.8, -1.8, 1.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#000000";
            ctx.beginPath();
            ctx.arc(2.0, -1.8, 0.7, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.eyeGlint;
            ctx.beginPath();
            ctx.arc(1.6, -2.2, 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = PALETTE.rustLight;
            ctx.beginPath();
            ctx.ellipse(1.8, -4.5, 1.2, 0.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore(); // Head
            ctx.restore(); // Side
        },

        // =========================================================================
        // GÖRÜNÜM 4: QUARTER-BACK (up-right - 2.5D İzometrik Arka Çapraz Görünüm)
        // =========================================================================
        drawQuarterBack(ctx, swingA, swingB, bob, breath, tailWag) {
            ctx.save();
            ctx.translate(0, -bob);

            // A) ÖN UZAK BACAK
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.roundRect(1 - swingB * 0.4, -13, 3.5, 8, 1.8);
            ctx.fill();
            ctx.restore();

            // B) ÖN YAKIN BACAK
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.roundRect(6 + swingB * 0.4, -13, 3.8, 8.5, 1.8);
            ctx.fill();
            ctx.restore();

            // C) GÖVDE & SIRT ÇİZGİSİ
            ctx.save();
            const backGrad = ctx.createLinearGradient(-10, -20, 8, -5);
            backGrad.addColorStop(0, PALETTE.coatBase);
            backGrad.addColorStop(0.5, PALETTE.coatHigh);
            backGrad.addColorStop(1, PALETTE.coatDark);

            ctx.fillStyle = backGrad;
            ctx.beginPath();
            ctx.moveTo(-10, -13);
            ctx.quadraticCurveTo(-2, -18 - breath * 3, 6, -16);
            ctx.quadraticCurveTo(8, -8, 2, -4);
            ctx.quadraticCurveTo(-6, -6, -10, -13);
            ctx.closePath();
            ctx.fill();
            ctx.restore();

            // D) ARKA UZAK BACAK
            ctx.save();
            ctx.fillStyle = PALETTE.coatDark;
            ctx.beginPath();
            ctx.ellipse(-10 - swingA * 0.4, -8, 4.2, 7.5, -0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustDark;
            ctx.beginPath();
            ctx.ellipse(-11 - swingA * 0.4, 1.0, 2.6, 1.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // E) ARKA YAKIN BACAK
            ctx.save();
            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.ellipse(-6 + swingA * 0.4, -7, 5.0, 8.2, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustBase;
            ctx.beginPath();
            ctx.roundRect(-7.5 + swingA * 0.4, -2, 3.4, 4.5, 1.2);
            ctx.fill();
            ctx.fillStyle = PALETTE.rustLight;
            ctx.beginPath();
            ctx.ellipse(-5.8 + swingA * 0.4, 2.0, 2.8, 1.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // F) KESİK KUYRUK
            ctx.save();
            ctx.strokeStyle = PALETTE.coatBase;
            ctx.lineWidth = 3.4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(-9, -15);
            ctx.lineTo(-12 + tailWag * 10, -23);
            ctx.stroke();
            ctx.restore();

            // G) KAFA & KULAKLAR (Arkadan Bakış)
            ctx.save();
            ctx.translate(6, -26);

            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, -1, 6.2, 5.6, 0.1, 0, Math.PI * 2);
            ctx.fill();

            // Kulaklar (Sırt Görünümü)
            [-1, 1].forEach((side, idx) => {
                ctx.fillStyle = (idx === 0) ? PALETTE.coatDark : PALETTE.coatBase;
                ctx.beginPath();
                ctx.moveTo(side * 2.5, -4);
                ctx.lineTo(side * 5.0, -15.5);
                ctx.lineTo(side * 0.5, -5.5);
                ctx.closePath();
                ctx.fill();
            });

            // Tasma Arkası
            ctx.fillStyle = PALETTE.collarDark;
            ctx.beginPath();
            ctx.roundRect(-3, 2, 7, 2.8, 1);
            ctx.fill();
            ctx.restore();

            ctx.restore(); // Quarter-Back
        },

        // =========================================================================
        // GÖRÜNÜM 5: BACK (up - Tam Sırt / Arka Görünüm)
        // =========================================================================
        drawBack(ctx, swingA, swingB, bob, breath, tailWag) {
            ctx.save();
            ctx.translate(0, -bob);

            // A) ÖN BACAKLAR (Arkadan hafifçe görünür)
            [-1, 1].forEach((side, idx) => {
                const s = (idx === 0) ? swingA : swingB;
                ctx.fillStyle = PALETTE.coatDark;
                ctx.beginPath();
                ctx.roundRect(side * 5 - 1.8, -12, 3.6, 9 + s * 0.4, 1.8);
                ctx.fill();
            });

            // B) GÖVDE & SIRT (Geniş Atletik Omuzlar)
            ctx.save();
            const backGrad = ctx.createLinearGradient(0, -22, 0, -4);
            backGrad.addColorStop(0, PALETTE.coatHigh);
            backGrad.addColorStop(0.4, PALETTE.coatBase);
            backGrad.addColorStop(1, PALETTE.coatDark);

            ctx.fillStyle = backGrad;
            ctx.beginPath();
            ctx.ellipse(0, -13, 9.0 + breath * 3, 10.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // C) ARKA BACAKLAR (Kaslı Kalçalar)
            [-1, 1].forEach((side, idx) => {
                const s = (idx === 0) ? swingB : swingA;
                ctx.save();
                ctx.fillStyle = PALETTE.coatBase;
                ctx.beginPath();
                ctx.ellipse(side * 7.5, -7 + s * 0.4, 4.6, 8.2, side * 0.15, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = PALETTE.rustDark;
                ctx.beginPath();
                ctx.roundRect(side * 7.5 - 1.8, -1 + s * 0.4, 3.6, 3.8, 1.2);
                ctx.fill();
                ctx.fillStyle = PALETTE.rustLight;
                ctx.beginPath();
                ctx.ellipse(side * 7.5, 2.0 + s * 0.3, 2.8, 1.7, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // D) DİKMİŞ KESİK KUYRUK
            ctx.save();
            ctx.strokeStyle = PALETTE.coatBase;
            ctx.lineWidth = 3.6;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(tailWag * 12, -25);
            ctx.stroke();
            ctx.restore();

            // E) KAFA & KULAKLAR (Arkadan Görünüm)
            ctx.save();
            ctx.translate(0, -27);

            ctx.fillStyle = PALETTE.coatBase;
            ctx.beginPath();
            ctx.ellipse(0, -1, 6.8, 6.0, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dik Kırpık Kulaklar
            [-1, 1].forEach(side => {
                ctx.fillStyle = PALETTE.coatBase;
                ctx.strokeStyle = PALETTE.coatDark;
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(side * 4.2, -5.0);
                ctx.lineTo(side * 6.5, -16.5);
                ctx.lineTo(side * 1.5, -6.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });

            // Tasma Bandı (Sırt Arkası)
            ctx.fillStyle = PALETTE.collarDark;
            ctx.beginPath();
            ctx.roundRect(-5.5, 2, 11, 2.8, 1);
            ctx.fill();
            ctx.restore();

            ctx.restore(); // Back
        },

        // =========================================================================
        // YARDIMCI: DOBERMAN KONUŞMA / HAVLAMA BALONU
        // =========================================================================
        drawSpeechBubble(ctx, text) {
            ctx.save();
            ctx.font = 'bold 11px sans-serif';
            const metrics = ctx.measureText(text);
            const w = metrics.width + 16;
            const h = 20;
            const bx = -w / 2;
            const by = -52;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.2;

            ctx.beginPath();
            ctx.roundRect(bx, by, w, h, 6);
            ctx.fill();
            ctx.stroke();

            // Balon İbre Oku
            ctx.beginPath();
            ctx.moveTo(-4, by + h);
            ctx.lineTo(0, by + h + 5);
            ctx.lineTo(4, by + h);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, 0, by + h / 2);
            ctx.restore();
        }
    };

    global.DobermanPetRenderer = DobermanPetRenderer;

})(typeof window !== 'undefined' ? window : this);

