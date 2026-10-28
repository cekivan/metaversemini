/**
 * horseMountRenderer.js - Şahlanan Canlı Dörtnal Kraliyet Binek Atı Motoru
 * 
 * MODEL:
 * - 4 bacağı bağımsız koşan, rüzgarda dalgalanan örgülü yelesi ve kuyruğu olan,
 *   altın taçlı alınlık zırhı (chanfron), göğüs madalyonu ve altın sırmalı
 *   kırmızı şabrack'lı kraliyet binek atı.
 * 
 * ÖZELLİKLER:
 * - 8 Yön Desteği: down, down-left, down-right, left, right, up-left, up-right, up
 * - Y vektörüne göre zıtlanan (scale(-1, 1)) kusursuz sağ/sol yön uyumu
 * - Dörtnal Zıplama Salınımı (Gallop Bob & Dynamic Tilt)
 * - Zemin Kontakt Gölgesi ve Yönlü Koşu Tozu Efekti
 */

(function (global) {
    'use strict';

    // KRALİYET PALETİ
    const HORSE_PALETTE = {
        coatMain: '#8b4513',          // Zengin sıcak doru kestane kürk
        coatLight: '#a0522d',         // Sırt ve omuz aydınlığı
        coatDark: '#5c2c16',          // Gövde altı kas gölgesi
        coatBelly: '#6d3419',         // Karın bölgesi
        mane: '#18120e',              // Koyu siyah/çikolata örgülü yele
        maneGold: '#facc15',          // Yele örgülerindeki altın yüzükler/boncuklar
        crownGold: '#f59e0b',         // Alındaki altın taç zırh plakası
        crownGlint: '#fef08a',        // Taç parıltısı
        chestMedallion: '#e2e8f0',    // Göğüsteki gümüş madalyon
        chestGold: '#f59e0b',         // Madalyon altın çerçeve
        tail: '#140e0a',              // Akıcı koyu kuyruk
        hoof: '#1e293b',              // Sert siyah toynak
        hoofLight: '#334155',         // Toynak parıltısı
        saddlePad: '#b91c1c',         // Zengin kırmızı kraliyet şabrack'ı
        saddlePadGold: '#facc15',     // Şabrack altın sırmalı nakış bordürü
        saddleLeather: '#3e2213',     // Koyu deri eyer
        saddleDark: '#261409',        // Eyer derinlik gölgesi
        stirrupIron: '#cbd5e1',       // Metal üzengi demiri
        bridleLeather: '#1e140d',     // Deri yular kayışları
        bridleBit: '#94a3b8',         // Metal gem halkası
        eye: '#0f172a',               // Canlı siyah göz
        eyeGlint: '#ffffff',          // Göz ışıltısı
        muzzle: '#4a2512',            // Burun ve çene tonu
        nostril: '#1c0c05'            // Burun deliği
    };

    const DIRECTIONS = [
        'down',
        'down-left',
        'down-right',
        'left',
        'right',
        'up-left',
        'up-right',
        'up'
    ];

    class HorseMountRenderer {
        static normalizeDirection(dir) {
            if (!dir) return 'down';
            let d = String(dir).toLowerCase().replace('_', '-').trim();
            if (DIRECTIONS.includes(d)) return d;
            if (d === 's' || d === 'south') return 'down';
            if (d === 'n' || d === 'north') return 'up';
            if (d === 'e' || d === 'east') return 'right';
            if (d === 'w' || d === 'west') return 'left';
            if (d === 'se' || d === 'southeast') return 'down-right';
            if (d === 'sw' || d === 'southwest') return 'down-left';
            if (d === 'ne' || d === 'northeast') return 'up-right';
            if (d === 'nw' || d === 'northwest') return 'up-left';
            return 'down';
        }

        /**
         * Zemin Kontakt Gölgesi ve Yönlü Koşu Tozu
         */
        static drawGroundShadow(ctx, isMoving, walkCycle, rawDir = 'down') {
            ctx.save();
            let dir = this.normalizeDirection(rawDir);
            let shadowScale = isMoving ? 1.0 + Math.sin(walkCycle * 2) * 0.12 : 1.0;
            ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            ctx.beginPath();
            let isDiag = (dir === 'down-left' || dir === 'down-right');
            let isBackDiag = (dir === 'up-left' || dir === 'up-right');
            let tilt = isDiag ? 0.35 : (isBackDiag ? -0.35 : 0);
            if (dir === 'down-left' || dir === 'up-left') tilt = -tilt;
            ctx.ellipse(0, 22, 26 * shadowScale, (isDiag ? 11 : 9) * shadowScale, tilt, 0, Math.PI * 2);
            ctx.fill();

            // Koşarken arkadan savrulan hafif toz zerrecikleri (Yöne göre arkaya doğru savrulur)
            if (isMoving) {
                ctx.fillStyle = "rgba(217, 119, 6, 0.35)";
                let isFacingLeft = (dir === 'left' || dir === 'down-left' || dir === 'up-left');
                let dirMult = isFacingLeft ? 1 : -1;
                for (let i = 0; i < 3; i++) {
                    let puffPhase = (walkCycle * 1.5 + i * 2.1) % (Math.PI * 2);
                    let puffX = dirMult * (18 + i * 6) + Math.cos(puffPhase) * 4;
                    let puffY = 20 + Math.sin(puffPhase) * 3;
                    let r = Math.max(1, 3.5 - i);
                    ctx.beginPath();
                    ctx.arc(puffX, puffY, r, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        }

        /**
         * KATMAN 1: ATIN ARKA BÖLÜMÜ (Gövde, arka bacaklar, kuyruk, eyer)
         * Oyuncunun arkasında kalan kısım
         */
        static drawHorseBase(ctx, rawDir, isMoving, walkCycle) {
            const dir = this.normalizeDirection(rawDir);
            ctx.save();

            // Sola giderken Y eksenine göre zıtla (scale(-1, 1)), Sağa giderken normal çiz
            let flip = (dir === 'left' || dir === 'down-left' || dir === 'up-left');
            if (flip) ctx.scale(-1, 1);

            let p = HORSE_PALETTE;
            let gallopBob = isMoving ? Math.sin(walkCycle * 2) * 2.8 : Math.sin(Date.now() / 400) * 0.8;
            ctx.translate(0, gallopBob);

            // Bacak Salınımları (4 bacaklı doğal dörtnal / tırıs salınımı)
            let fL = isMoving ? Math.sin(walkCycle * 1.8) * 9 : 0;
            let fR = isMoving ? -Math.sin(walkCycle * 1.8) * 9 : 0;
            let bL = isMoving ? Math.cos(walkCycle * 1.8) * 8 : 0;
            let bR = isMoving ? -Math.cos(walkCycle * 1.8) * 8 : 0;

            if (dir === 'down') {
                // TAM GÜNEY (Önden görünüm)
                this.drawLeg(ctx, -10, 6, -6, 21, p.coatDark, p.hoof, false);
                this.drawLeg(ctx, 10, 6, 6, 21, p.coatDark, p.hoof, false);

                // Gövde Arkası / Göğüs
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(0, 4, 18, 14, 0, 0, Math.PI * 2);
                ctx.fill();

                // Altın Sırmalı Kırmızı Şabrack
                ctx.fillStyle = p.saddlePad;
                ctx.beginPath();
                ctx.roundRect(-15, -4, 30, 8, 3);
                ctx.fill();
                ctx.strokeStyle = p.saddlePadGold;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.fillStyle = p.saddleLeather;
                ctx.beginPath();
                ctx.roundRect(-12, -6, 24, 7, 3);
                ctx.fill();

                // Ön Bacaklar
                this.drawLeg(ctx, -9, 8, -9 + fL * 0.4, 23, p.coatMain, p.hoof, true);
                this.drawLeg(ctx, 9, 8, 9 + fR * 0.4, 23, p.coatMain, p.hoof, true);

            } else if (dir === 'up') {
                // TAM KUZEY (Arkadan görünüm)
                this.drawLeg(ctx, -8, 6, -8, 22, p.coatDark, p.hoof, false);
                this.drawLeg(ctx, 8, 6, 8, 22, p.coatDark, p.hoof, false);

                // Dolgun Sağrı / Kalça
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(0, 4, 19, 15, 0, 0, Math.PI * 2);
                ctx.fill();

                // Dalgalanan Kuyruk (Arka tam merkezde)
                let tailWag = isMoving ? Math.sin(walkCycle * 2.2) * 6 : Math.sin(Date.now() / 320) * 2.5;
                ctx.fillStyle = p.tail;
                ctx.beginPath();
                ctx.moveTo(-4, 4);
                ctx.quadraticCurveTo(-7 + tailWag, 18, -2 + tailWag, 28);
                ctx.quadraticCurveTo(6 + tailWag, 20, 4, 4);
                ctx.closePath();
                ctx.fill();

                // Eyer ve Altın Bordür
                ctx.fillStyle = p.saddlePad;
                ctx.beginPath();
                ctx.roundRect(-14, -5, 28, 8, 3);
                ctx.fill();
                ctx.strokeStyle = p.saddlePadGold;
                ctx.lineWidth = 1.2;
                ctx.stroke();

                ctx.fillStyle = p.saddleLeather;
                ctx.beginPath();
                ctx.roundRect(-11, -7, 22, 7, 3);
                ctx.fill();

                // Arka Bacaklar
                this.drawLeg(ctx, -12, 8, -12 + bL * 0.5, 24, p.coatMain, p.hoof, true);
                this.drawLeg(ctx, 12, 8, 12 + bR * 0.5, 24, p.coatMain, p.hoof, true);

                // Kafa & Kulaklar arkadan görünür
                this.drawHorseHeadAndNeck(ctx, dir, isMoving, walkCycle);

            } else if (dir === 'up-left' || dir === 'up-right') {
                // 3/4 KUZEYDOĞU / KUZEYBATI ARKA İZOMETRİK (Sol Üst & Sağ Üst)
                // Gerçek 2.5D İzometrik Derinlik (Arka Görünüm):
                // En uzaktaki ayaklar yukarıda (y: 13..17), En yakındaki ayaklar aşağıda (y: 21..27)!

                // 1. Uzak Bacaklar (En uzakta basan sol bacaklar)
                // Uzak Ön Bacak (Sol Ön - Omuzdan ileriye uzanan)
                this.drawLeg(ctx, 13, -5, 17 + fR * 0.85, 13, p.coatDark, p.hoof, false);
                // Uzak Arka Bacak (Sol Arka - Arkaya itiş yapan)
                this.drawLeg(ctx, -15, 2, -18 + bR * 0.85, 17, p.coatDark, p.hoof, false);

                // 2. İzometrik Eğimli Gövde (Sol-alttan sağ-üste doğru yükselen omurga çizgisi)
                ctx.save();
                ctx.translate(0, 1);
                ctx.rotate(-0.30);

                // Gövde Alt Kas / Karın Bölgesi
                ctx.fillStyle = p.coatDark;
                ctx.beginPath();
                ctx.ellipse(1, 5, 21, 9, 0, 0, Math.PI);
                ctx.fill();

                // Ana Gövde Torso
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(1, 0, 22, 13.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Sırt Aydınlığı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.ellipse(1, -5, 18, 5, 0, 0, Math.PI);
                ctx.fill();
                ctx.restore();

                // 3. Dolgun Kaslı Kalça / Sağrı (3/4 Arka Görünümde İki Kavisli Bombe)
                // Uzak sağrı bombesi
                ctx.fillStyle = p.coatDark;
                ctx.beginPath();
                ctx.ellipse(-14, 3, 11, 10, -0.15, 0, Math.PI * 2);
                ctx.fill();

                // Yakın sağrı bombesi (Ana hacim)
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(-10, 5, 12, 11.5, 0.22, 0, Math.PI * 2);
                ctx.fill();

                // Kalça ışık kavisi
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.ellipse(-10, 2, 9, 5.5, 0.20, 0, Math.PI);
                ctx.fill();

                // 4. Dalgalı İpek Kuyruk (Kalça sokumundan geriye ve aşağıya doğru savrulan)
                let tailWag = isMoving ? Math.sin(walkCycle * 2.2) * 6.5 : Math.sin(Date.now() / 320) * 2.2;
                ctx.fillStyle = p.tail;
                ctx.beginPath();
                ctx.moveTo(-17, 1);
                ctx.quadraticCurveTo(-28 + tailWag, 10, -25 + tailWag, 27);
                ctx.quadraticCurveTo(-14 + tailWag, 18, -12, 5);
                ctx.closePath();
                ctx.fill();

                // Kuyruk ışıltısı
                ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-16, 2);
                ctx.quadraticCurveTo(-25 + tailWag, 12, -22 + tailWag, 24);
                ctx.stroke();

                // 5. İzometrik Açılı Kraliyet Şabrack'ı ve Eyeri (Arkadan 3/4 Görünüm)
                ctx.save();
                ctx.translate(0, 0);
                ctx.rotate(-0.16);

                // Kırmızı Kadife Şabrack
                ctx.fillStyle = p.saddlePad;
                ctx.beginPath();
                ctx.roundRect(-8, -4, 18, 11, [4, 4, 3, 3]);
                ctx.fill();
                ctx.strokeStyle = p.saddlePadGold;
                ctx.lineWidth = 1.3;
                ctx.stroke();

                // Altın köşe püskülleri
                ctx.fillStyle = p.saddlePadGold;
                ctx.beginPath();
                ctx.arc(-7, 5, 1.8, 0, Math.PI * 2);
                ctx.arc(8, 5, 1.8, 0, Math.PI * 2);
                ctx.fill();

                // Deri Eyer (Arkadan kavisli cantle)
                ctx.fillStyle = p.saddleLeather;
                ctx.beginPath();
                ctx.roundRect(-6, -6, 14, 8, [3, 3, 2, 2]);
                ctx.fill();
                ctx.restore();

                // 6. Ön Omuz ve Cidago Kas Grubu
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(11, -3, 8.5, 9.5, -0.30, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.ellipse(11, -5, 6.5, 5.5, -0.30, 0, Math.PI);
                ctx.fill();

                // 7. Yakın Bacaklar (Ön Planda ve En Aşağıda Basan Ayaklar)
                // Yakın Ön Bacak (Öne fırlayan güçlü ön bacak)
                this.drawLeg(ctx, 11, 0, 15 + fL * 0.9, 21, p.coatMain, p.hoof, true);
                // Yakın Arka Bacak (En yakında ve en aşağıda basan güçlü arka bacak)
                this.drawLeg(ctx, -7, 8, -9 + bL * 0.9, 27, p.coatMain, p.hoof, true);

                // 8. Boyun ve Kafa (Arka perspektifte ileri-sağ-üste uzanır)
                this.drawHorseHeadAndNeck(ctx, dir, isMoving, walkCycle);

            } else if (dir === 'down-left' || dir === 'down-right') {
                // 3/4 GÜNEYDOĞU / GÜNEYBATI ÖN İZOMETRİK (Sol Alt & Sağ Alt)
                // Gerçek 2.5D İzometrik Derinlik:
                // Arka ayaklar yukarıda/arkada (y: 15), Ön ayaklar derin aşağıda/önde (y: 28)!

                // 1. Uzak Arka Bacak (Sol Arka - En yukarıda/arkada basan bacak)
                this.drawLeg(ctx, -16, 0, -18 + bR * 0.8, 15, p.coatDark, p.hoof, false);
                // 2. Uzak Ön Bacak (Sol Ön - Orta derinlikte basan bacak)
                this.drawLeg(ctx, 3, 4, 4 + fR * 0.8, 21, p.coatDark, p.hoof, false);

                // 3. İzometrik Eğimli Gövde (Omurga çizgisi sol-yukarıdan sağ-aşağıya ~24 derece meyilli)
                ctx.save();
                ctx.translate(-1, 4);
                ctx.rotate(0.38);

                // Gövde Alt Kas / Karın Gölgesi
                ctx.fillStyle = p.coatDark;
                ctx.beginPath();
                ctx.ellipse(0, 5, 20, 8, 0, 0, Math.PI);
                ctx.fill();

                // Ana Gövde Torso
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(0, 0, 21, 13, 0, 0, Math.PI * 2);
                ctx.fill();

                // Sırt Aydınlığı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.ellipse(0, -5, 17, 5, 0, 0, Math.PI);
                ctx.fill();
                ctx.restore();

                // 4. Dolgun Kalça / Sağrı (Sol-Yukarıda 3D bombe)
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(-13, 0, 11, 10, -0.15, 0, Math.PI * 2);
                ctx.fill();

                // Kalça ışık kavisi
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.ellipse(-13, -3, 8, 4.5, -0.2, 0, Math.PI);
                ctx.fill();

                // 5. Dalgalı İpek Kuyruk (Sol-üst kalçadan arkaya savrulan)
                let tailWag = isMoving ? Math.sin(walkCycle * 2) * 6.5 : Math.sin(Date.now() / 320) * 2.2;
                ctx.fillStyle = p.tail;
                ctx.beginPath();
                ctx.moveTo(-19, -4);
                ctx.quadraticCurveTo(-29 + tailWag, 2, -26 + tailWag, 20);
                ctx.quadraticCurveTo(-15 + tailWag, 14, -14, 2);
                ctx.closePath();
                ctx.fill();

                // Kuyruk ışıltısı
                ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(-18, -3);
                ctx.quadraticCurveTo(-25 + tailWag, 5, -23 + tailWag, 18);
                ctx.stroke();

                // 6. İzometrik Açılı Kraliyet Şabrack'ı ve Eyeri
                ctx.save();
                ctx.translate(-1, 0);
                ctx.rotate(0.20);

                // Kırmızı Şabrack
                ctx.fillStyle = p.saddlePad;
                ctx.beginPath();
                ctx.roundRect(-8, -4, 18, 11, [4, 4, 3, 3]);
                ctx.fill();
                ctx.strokeStyle = p.saddlePadGold;
                ctx.lineWidth = 1.3;
                ctx.stroke();

                // Köşe altın püskülleri
                ctx.fillStyle = p.saddlePadGold;
                ctx.beginPath();
                ctx.arc(-7, 5, 1.8, 0, Math.PI * 2);
                ctx.arc(8, 5, 1.8, 0, Math.PI * 2);
                ctx.fill();

                // Deri Eyer
                ctx.fillStyle = p.saddleLeather;
                ctx.beginPath();
                ctx.roundRect(-6, -6, 14, 8, 3);
                ctx.fill();
                ctx.restore();

                // 7. Yakın Bacaklar (Ön Planda ve En Aşağıda Basan Ayaklar)
                // Yakın Arka Bacak (Güçlü baldır ve toynak)
                this.drawLeg(ctx, -8, 5, -10 + bL * 0.9, 23, p.coatMain, p.hoof, true);
                // Yakın Ön Bacak (Öne fırlayan, en önde ve en aşağıda basan)
                this.drawLeg(ctx, 11, 8, 13 + fL * 0.9, 28, p.coatMain, p.hoof, true);

            } else {
                // TAM YAN PROFİL (left, right - 90 Derece Saf Profil)
                this.drawLeg(ctx, -14, 5, -16 + bR, 22, p.coatDark, p.hoof, false);
                this.drawLeg(ctx, 8, 6, 10 + fR, 22, p.coatDark, p.hoof, false);

                // Gövde
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(-2, 4, 23, 12.5, 0.05, 0, Math.PI * 2);
                ctx.fill();

                // Sırt Işıltısı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.ellipse(-2, 0, 19, 5.5, 0.05, 0, Math.PI);
                ctx.fill();

                // Dalgalı Kuyruk
                let tailWag = isMoving ? Math.sin(walkCycle * 2) * 6 : Math.sin(Date.now() / 320) * 2;
                ctx.fillStyle = p.tail;
                ctx.beginPath();
                ctx.moveTo(-21, 1);
                ctx.quadraticCurveTo(-31 + tailWag, 10, -26 + tailWag, 25);
                ctx.quadraticCurveTo(-17 + tailWag, 16, -17, 5);
                ctx.closePath();
                ctx.fill();

                // Altın Sırmalı Kırmızı Kraliyet Şabrack'ı
                ctx.fillStyle = p.saddlePad;
                ctx.beginPath();
                ctx.roundRect(-9, -4, 18, 10, 3);
                ctx.fill();
                ctx.strokeStyle = p.saddlePadGold;
                ctx.lineWidth = 1.3;
                ctx.stroke();

                // Deri Eyer
                ctx.fillStyle = p.saddleLeather;
                ctx.beginPath();
                ctx.roundRect(-7, -6, 15, 8, 3);
                ctx.fill();

                // Yakın Bacaklar
                this.drawLeg(ctx, -9, 8, -10 + bL, 24, p.coatMain, p.hoof, true);
                this.drawLeg(ctx, 13, 8, 14 + fL, 24, p.coatMain, p.hoof, true);
            }

            ctx.restore();
        }

        /**
         * KATMAN 2: ATIN ÖN BÖLÜMÜ (Baş, boyun, altın taç, göğüslük madalyonu, üzengi)
         * Oyuncunun önünde duran kısım
         */
        static drawHorseFront(ctx, rawDir, isMoving, walkCycle) {
            const dir = this.normalizeDirection(rawDir);
            ctx.save();

            // Sola giderken Y eksenine göre zıtla (scale(-1, 1)), Sağa giderken normal çiz
            let flip = (dir === 'left' || dir === 'down-left' || dir === 'up-left');
            if (flip) ctx.scale(-1, 1);

            let gallopBob = isMoving ? Math.sin(walkCycle * 2) * 2.8 : Math.sin(Date.now() / 400) * 0.8;
            ctx.translate(0, gallopBob);

            let p = HORSE_PALETTE;

            // Üzengi Kayışı ve Metal Üzengi Demiri
            ctx.strokeStyle = p.bridleLeather;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(-1, -2);
            ctx.lineTo(-2, 10);
            ctx.stroke();

            ctx.strokeStyle = p.stirrupIron;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(-2, 11, 2.5, 0, Math.PI);
            ctx.stroke();

            // Eğer öne veya yanlara bakıyorsa baş, boyun, altın taç ve zırh madalyonu çizilir!
            if (dir !== 'up' && dir !== 'up-left' && dir !== 'up-right') {
                this.drawHorseHeadAndNeck(ctx, dir, isMoving, walkCycle);
            } else if (dir === 'up-left' || dir === 'up-right') {
                // Binicinin önünde kalan sağ dizgin kayışı
                ctx.strokeStyle = p.bridleLeather;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(0, -1);
                ctx.quadraticCurveTo(9, -8, 25, -23);
                ctx.stroke();
            }

            ctx.restore();
        }

        // Geriye dönük uyumluluk takma adları
        static drawVectorHorseBase(ctx, dir, isMoving, walkCycle) {
            return this.drawHorseBase(ctx, dir, isMoving, walkCycle);
        }

        static drawVectorHorseFront(ctx, dir, isMoving, walkCycle) {
            return this.drawHorseFront(ctx, dir, isMoving, walkCycle);
        }

        /**
         * Bacak ve Toynak Çizici
         */
        static drawLeg(ctx, topX, topY, botX, botY, coatCol, hoofCol, isFront) {
            ctx.save();
            let midX = (topX + botX) / 2 + (isFront ? 1.5 : -1.5);
            let midY = (topY + botY) / 2;

            ctx.strokeStyle = coatCol;
            ctx.lineWidth = 4.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(topX, topY);
            ctx.lineTo(midX, midY);
            ctx.lineTo(botX, botY - 3);
            ctx.stroke();

            ctx.fillStyle = hoofCol;
            ctx.beginPath();
            ctx.roundRect(botX - 2.5, botY - 3, 5, 4, [1, 1, 0, 0]);
            ctx.fill();

            ctx.restore();
        }

        /**
         * Baş, Boyun, Altın Taçlı Alınlık Zırhı, Madalyon ve Örgülü Yele
         */
        static drawHorseHeadAndNeck(ctx, dir, isMoving, walkCycle) {
            let p = HORSE_PALETTE;
            let headBob = isMoving ? Math.sin(walkCycle * 2 + 0.5) * 1.8 : Math.sin(Date.now() / 400) * 0.5;

            ctx.save();
            ctx.translate(0, headBob);

            if (dir === 'down') {
                // TAM ÖNDEN GÖRÜNÜM
                // Boyun
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(-6, 2);
                ctx.lineTo(-7, -12);
                ctx.lineTo(7, -12);
                ctx.lineTo(6, 2);
                ctx.closePath();
                ctx.fill();

                // Göğüs Kayışı ve Altın Kraliyet Madalyonu
                ctx.strokeStyle = p.bridleLeather;
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(-11, 4);
                ctx.quadraticCurveTo(0, 8, 11, 4);
                ctx.stroke();

                // Altın Madalyon
                ctx.fillStyle = p.chestGold;
                ctx.beginPath();
                ctx.arc(0, 6.5, 3.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = p.chestMedallion;
                ctx.beginPath();
                ctx.arc(0, 6.5, 2.0, 0, Math.PI * 2);
                ctx.fill();

                // Örgülü Siyah Rasta Yele
                ctx.fillStyle = p.mane;
                ctx.beginPath();
                ctx.ellipse(-3, -12, 3, 7, -0.2, 0, Math.PI * 2);
                ctx.ellipse(3, -12, 3, 7, 0.2, 0, Math.PI * 2);
                ctx.fill();

                // Yele Altın Boncukları
                ctx.fillStyle = p.maneGold;
                ctx.fillRect(-4.5, -9, 2.8, 1.5);
                ctx.fillRect(1.7, -9, 2.8, 1.5);

                // Kulaklar
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(-6, -18); ctx.lineTo(-4, -28); ctx.lineTo(-1, -19); ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(6, -18); ctx.lineTo(4, -28); ctx.lineTo(1, -19); ctx.closePath(); ctx.fill();

                // Kafa
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(0, -17, 7.5, 9, 0, 0, Math.PI * 2);
                ctx.fill();

                // ALTIN TAÇLI ALINLIK ZIRHI (CHANFRON)
                ctx.fillStyle = p.crownGold;
                ctx.beginPath();
                ctx.moveTo(-3, -22);
                ctx.lineTo(3, -22);
                ctx.lineTo(3.5, -17);
                ctx.lineTo(0, -15);
                ctx.lineTo(-3.5, -17);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = p.crownGlint;
                ctx.lineWidth = 0.8;
                ctx.stroke();

                // Burun / Muzzle
                ctx.fillStyle = p.muzzle;
                ctx.beginPath();
                ctx.ellipse(0, -11, 5.5, 4.5, 0, 0, Math.PI * 2);
                ctx.fill();

                // Burun Delikleri
                ctx.fillStyle = p.nostril;
                ctx.beginPath();
                ctx.arc(-2.2, -11, 1.1, 0, Math.PI * 2);
                ctx.arc(2.2, -11, 1.1, 0, Math.PI * 2);
                ctx.fill();

                // İri Canlı Gözler
                ctx.fillStyle = p.eye;
                ctx.beginPath();
                ctx.arc(-4.5, -18, 2.0, 0, Math.PI * 2);
                ctx.arc(4.5, -18, 2.0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p.eyeGlint;
                ctx.beginPath();
                ctx.arc(-4.9, -18.5, 0.8, 0, Math.PI * 2);
                ctx.arc(4.1, -18.5, 0.8, 0, Math.PI * 2);
                ctx.fill();

            } else if (dir === 'up') {
                // TAM ARKADAN GÖRÜNÜM
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(-5, -2); ctx.lineTo(-6, -14); ctx.lineTo(6, -14); ctx.lineTo(5, -2);
                ctx.closePath(); ctx.fill();

                // Örgülü siyah yele (arkadan boylu boyunca dökülen)
                ctx.fillStyle = p.mane;
                ctx.beginPath();
                ctx.moveTo(-2, -2); ctx.lineTo(-4, -18); ctx.lineTo(4, -18); ctx.lineTo(2, -2);
                ctx.closePath(); ctx.fill();

                // Altın yüzük klipsleri
                ctx.fillStyle = p.maneGold;
                ctx.fillRect(-2.5, -8, 5, 1.6);
                ctx.fillRect(-2.2, -13, 4.4, 1.6);

                // Kulaklar (arkadan)
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(-6, -16); ctx.lineTo(-4, -26); ctx.lineTo(-2, -17); ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(6, -16); ctx.lineTo(4, -26); ctx.lineTo(2, -17); ctx.closePath(); ctx.fill();

            } else if (dir === 'up-left' || dir === 'up-right') {
                // 3/4 KUZEYDOĞU / KUZEYBATI ARKA İZOMETRİK (Sol Üst & Sağ Üst)
                // Kafa ve boyun ileriye-sağa doğru uzanır, asil 3D izometrik arka perspektif!

                let neckBaseX = 10, neckBaseY = -4;

                // 1. KAVİSLİ ŞAHLANAN BOYUN (Arkadan Görünen Asil Kavis)
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 3, neckBaseY + 1);
                ctx.quadraticCurveTo(neckBaseX + 4, neckBaseY - 8, neckBaseX + 9, neckBaseY - 17);
                ctx.lineTo(neckBaseX + 17, neckBaseY - 13);
                ctx.quadraticCurveTo(neckBaseX + 12, neckBaseY - 2, neckBaseX + 5, neckBaseY + 6);
                ctx.closePath();
                ctx.fill();

                // Boyun sırt çizgisi aydınlığı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 1, neckBaseY - 1);
                ctx.quadraticCurveTo(neckBaseX + 5, neckBaseY - 8, neckBaseX + 10, neckBaseY - 16);
                ctx.lineTo(neckBaseX + 13, neckBaseY - 14);
                ctx.quadraticCurveTo(neckBaseX + 8, neckBaseY - 4, neckBaseX + 3, neckBaseY + 3);
                ctx.closePath();
                ctx.fill();

                // 2. ÖRGÜLÜ RASTA YELE VE ALTIN KLİPSLER
                let maneSway = isMoving ? Math.sin(walkCycle * 2) * 2.8 : Math.sin(Date.now() / 300) * 1.2;
                ctx.fillStyle = p.mane;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 3, neckBaseY);
                ctx.quadraticCurveTo(neckBaseX - maneSway, neckBaseY - 9, neckBaseX + 7, neckBaseY - 20);
                ctx.lineTo(neckBaseX + 12, neckBaseY - 18);
                ctx.quadraticCurveTo(neckBaseX + 6, neckBaseY - 7, neckBaseX + 1, neckBaseY + 2);
                ctx.closePath();
                ctx.fill();

                // Altın Rasta Klipsleri
                ctx.fillStyle = p.maneGold;
                ctx.fillRect(neckBaseX - 1, neckBaseY - 5, 3, 1.5);
                ctx.fillRect(neckBaseX + 2, neckBaseY - 11, 3, 1.5);
                ctx.fillRect(neckBaseX + 5, neckBaseY - 17, 3, 1.5);

                // 3. 3/4 ARKADAN GÖRÜNEN ASİL AT BAŞI
                let headX = neckBaseX + 11, headY = neckBaseY - 15;

                // Kafa kemiği ve yanak bombesi
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(headX, headY, 7.5, 6.2, -0.38, 0, Math.PI * 2);
                ctx.fill();

                // İleriye uzanan burun/ağız (sağ-üst siluet)
                ctx.fillStyle = p.muzzle;
                ctx.beginPath();
                ctx.ellipse(headX + 6.5, headY - 5.5, 4.8, 3.8, -0.38, 0, Math.PI * 2);
                ctx.fill();

                // Burun deliği kıvrımı
                ctx.fillStyle = p.nostril;
                ctx.beginPath();
                ctx.arc(headX + 9.5, headY - 6.5, 1.0, 0, Math.PI * 2);
                ctx.fill();

                // KULAKLAR (3/4 arkadan ileriye dikilmiş her iki kulak)
                // Uzak Kulak (Sol Kulak)
                ctx.fillStyle = p.coatDark;
                ctx.beginPath();
                ctx.moveTo(headX + 3, headY - 5);
                ctx.lineTo(headX + 6, headY - 17);
                ctx.lineTo(headX + 8.5, headY - 6);
                ctx.closePath();
                ctx.fill();

                // Yakın Kulak (Sağ Kulak)
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(headX - 1, headY - 5);
                ctx.lineTo(headX + 1, headY - 17);
                ctx.lineTo(headX + 4, headY - 6);
                ctx.closePath();
                ctx.fill();

                // Kulak içi ve kontur parıltısı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.moveTo(headX + 0.2, headY - 5.5);
                ctx.lineTo(headX + 1.2, headY - 14);
                ctx.lineTo(headX + 2.8, headY - 6.5);
                ctx.closePath();
                ctx.fill();

                // Altın Taç / Alın Zırhı Kenarı (Arkadan parıldayan altın taç çizgisi)
                ctx.strokeStyle = p.crownGold;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.arc(headX + 2.5, headY - 6.5, 3.2, -1.2, 0.8);
                ctx.stroke();

                ctx.fillStyle = p.crownGlint;
                ctx.beginPath();
                ctx.arc(headX + 4.0, headY - 7.5, 1.1, 0, Math.PI * 2);
                ctx.fill();

                // Deri Dizginler (Eyere/biniciye doğru giden)
                ctx.strokeStyle = p.bridleLeather;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(0, -2);
                ctx.quadraticCurveTo(headX - 2, headY + 2, headX + 5, headY - 4);
                ctx.stroke();
            } else if (dir === 'down-left' || dir === 'down-right') {
                // 3/4 GÜNEYDOĞU / GÜNEYBATI ÖN İZOMETRİK (Sol Alt & Sağ Alt)
                // Kafa ve boyun öne-aşağıya doğru uzanır, 3D izometrik perspektif!

                // 1. GENİŞ ÖN GÖĞÜS (Aşağı-Sağa Açılı Kaslı Göğüs)
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(8, 7, 9, 10.5, 0.40, 0, Math.PI * 2);
                ctx.fill();

                // Göğüs aydınlığı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.ellipse(8.5, 5, 6.5, 7, 0.40, 0, Math.PI * 2);
                ctx.fill();

                // 2. GÖĞÜSLÜK KAYIŞI VE MERKEZDEKİ KRALİYET MADALYONU
                ctx.strokeStyle = p.bridleLeather;
                ctx.lineWidth = 2.4;
                ctx.beginPath();
                ctx.moveTo(1, 5);
                ctx.quadraticCurveTo(8, 10, 15, 8);
                ctx.stroke();

                // Altın Kraliyet Madalyonu (Göğsün tam ortasında parıldayan)
                ctx.fillStyle = p.chestGold;
                ctx.beginPath();
                ctx.arc(8.5, 8, 3.7, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = p.chestMedallion;
                ctx.beginPath();
                ctx.arc(8.5, 8, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(7.8, 7.2, 0.8, 0, Math.PI * 2);
                ctx.fill();

                // 3. KAVİSLİ ŞAHLANAN BOYUN (Öne ve Aşağıya Doğru Uzanan Asil Kavis)
                let neckBaseX = 8, neckBaseY = 3;
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 3, neckBaseY);
                ctx.quadraticCurveTo(neckBaseX + 3, neckBaseY - 8, neckBaseX + 6, neckBaseY - 14);
                ctx.lineTo(neckBaseX + 13, neckBaseY - 10);
                ctx.quadraticCurveTo(neckBaseX + 9, neckBaseY + 1, neckBaseX + 5, neckBaseY + 7);
                ctx.closePath();
                ctx.fill();

                // Boyun kası aydınlığı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.moveTo(neckBaseX + 1, neckBaseY - 2);
                ctx.quadraticCurveTo(neckBaseX + 5, neckBaseY - 7, neckBaseX + 9, neckBaseY - 11);
                ctx.lineTo(neckBaseX + 11, neckBaseY - 9);
                ctx.quadraticCurveTo(neckBaseX + 7, neckBaseY - 1, neckBaseX + 4, neckBaseY + 4);
                ctx.closePath();
                ctx.fill();

                // 4. ÖRGÜLÜ RASTA YELE VE ALTIN KLİPSLER
                let maneSway = isMoving ? Math.sin(walkCycle * 2) * 2.8 : Math.sin(Date.now() / 300) * 1.2;
                ctx.fillStyle = p.mane;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 3, neckBaseY - 1);
                ctx.quadraticCurveTo(neckBaseX + 1 - maneSway, neckBaseY - 7, neckBaseX + 5, neckBaseY - 16);
                ctx.lineTo(neckBaseX + 9, neckBaseY - 14);
                ctx.quadraticCurveTo(neckBaseX + 4, neckBaseY - 5, neckBaseX + 1, neckBaseY + 2);
                ctx.closePath();
                ctx.fill();

                // Altın Rasta Klipsleri
                ctx.fillStyle = p.maneGold;
                ctx.fillRect(neckBaseX - 1, neckBaseY - 4, 3, 1.5);
                ctx.fillRect(neckBaseX + 1, neckBaseY - 9, 3, 1.5);
                ctx.fillRect(neckBaseX + 4, neckBaseY - 14, 3, 1.5);

                // 5. 3/4 İZOMETRİK AÇILI AT BAŞI (Öne-Aşağıya Doğru Bakan Asil Baş)
                let headX = neckBaseX + 9, headY = neckBaseY - 10;

                // Kafa / Şakak & Yanak Bombesi
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(headX, headY, 7.5, 6.5, 0.48, 0, Math.PI * 2);
                ctx.fill();

                // KULAKLAR (3/4 perspektifte iki kulak)
                // Uzak Kulak (Arka/Sol kulak)
                ctx.fillStyle = p.coatDark;
                ctx.beginPath();
                ctx.moveTo(headX - 4, headY - 4);
                ctx.lineTo(headX - 3, headY - 14);
                ctx.lineTo(headX - 0.5, headY - 5);
                ctx.closePath();
                ctx.fill();

                // Yakın Kulak (Ön/Sağ kulak - Dik ve canlı)
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(headX - 1, headY - 4);
                ctx.lineTo(headX + 2, headY - 15);
                ctx.lineTo(headX + 4.5, headY - 5);
                ctx.closePath();
                ctx.fill();

                // Kulak içi aydınlığı
                ctx.fillStyle = p.coatLight;
                ctx.beginPath();
                ctx.moveTo(headX + 0.2, headY - 5);
                ctx.lineTo(headX + 1.8, headY - 13);
                ctx.lineTo(headX + 3.2, headY - 6);
                ctx.closePath();
                ctx.fill();

                // 3/4 AÇILI BURUN VE AĞIZ (Muzzle - Öne ve Aşağıya Uzanan)
                ctx.fillStyle = p.muzzle;
                ctx.beginPath();
                ctx.ellipse(headX + 6.5, headY + 5.5, 5.5, 4.2, 0.48, 0, Math.PI * 2);
                ctx.fill();

                // BURUN DELİKLERİ (3/4 açıyla her ikisi de çizilir)
                ctx.fillStyle = p.nostril;
                ctx.beginPath();
                // Yakın burun deliği (daha belirgin ve aşağıda)
                ctx.ellipse(headX + 8.5, headY + 6.0, 1.3, 0.9, 0.45, 0, Math.PI * 2);
                // Uzak burun deliği (açılı ve hafif yukarıda)
                ctx.ellipse(headX + 5.8, headY + 4.0, 1.0, 0.7, 0.45, 0, Math.PI * 2);
                ctx.fill();

                // GÖZLER (3/4 perspektifte iki canlı göz)
                // 1. Yakın Göz (İri, Derin ve Canlı)
                ctx.fillStyle = p.eye;
                ctx.beginPath();
                ctx.arc(headX + 1.8, headY - 0.8, 2.4, 0, Math.PI * 2);
                ctx.fill();

                // Yakın Göz Işıltıları (Kraliyet Işıltısı)
                ctx.fillStyle = p.eyeGlint;
                ctx.beginPath();
                ctx.arc(headX + 1.3, headY - 1.5, 0.9, 0, Math.PI * 2);
                ctx.arc(headX + 2.7, headY - 0.3, 0.45, 0, Math.PI * 2);
                ctx.fill();

                // 2. Uzak Göz (Kaş sırtından 3/4 açıyla görünen ikinci göz)
                ctx.fillStyle = p.eye;
                ctx.beginPath();
                ctx.arc(headX - 2.2, headY - 3.8, 1.6, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p.eyeGlint;
                ctx.beginPath();
                ctx.arc(headX - 2.5, headY - 4.2, 0.6, 0, Math.PI * 2);
                ctx.fill();

                // 6. ALTIN TAÇLI ALINLIK ZIRHI (CHANFRON - 3/4 AÇILI!)
                ctx.fillStyle = p.crownGold;
                ctx.beginPath();
                ctx.moveTo(headX - 1, headY - 7.5);
                ctx.lineTo(headX + 4.5, headY - 5.5);
                ctx.lineTo(headX + 3.0, headY - 0.5);
                ctx.lineTo(headX - 1.8, headY - 2.2);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = p.crownGlint;
                ctx.lineWidth = 0.9;
                ctx.stroke();

                // Taç parıltı taşı
                ctx.fillStyle = p.crownGlint;
                ctx.beginPath();
                ctx.arc(headX + 1.0, headY - 4.0, 1.1, 0, Math.PI * 2);
                ctx.fill();

                // 7. DERİ YULAR, GEM HALKASI VE DİZGİNLER
                // Gem Halkası
                ctx.fillStyle = p.bridleBit;
                ctx.beginPath();
                ctx.arc(headX + 4.5, headY + 5, 1.6, 0, Math.PI * 2);
                ctx.fill();

                // Baş Deri Kayışı
                ctx.strokeStyle = p.bridleLeather;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(headX + 4.5, headY + 5);
                ctx.lineTo(headX, headY - 4);
                ctx.stroke();

                // Dizgin Kayışı (Biniciye/Eyere doğru uzanan)
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(headX + 4.5, headY + 5);
                ctx.quadraticCurveTo(headX - 3, headY + 10, -1, 0);
                ctx.stroke();

            } else {
                // TAM YAN PROFİL (left, right - 90 Derece Saf Profil)
                let neckBaseX = 10, neckBaseY = 2;

                // 1. BOYUN
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 3, neckBaseY);
                ctx.quadraticCurveTo(neckBaseX + 6, neckBaseY - 12, neckBaseX + 9, neckBaseY - 20);
                ctx.lineTo(neckBaseX + 17, neckBaseY - 16);
                ctx.quadraticCurveTo(neckBaseX + 12, neckBaseY - 6, neckBaseX + 6, neckBaseY + 2);
                ctx.closePath();
                ctx.fill();

                // 2. GÖĞÜS KAYIŞI VE KRALİYET MADALYONU
                ctx.strokeStyle = p.bridleLeather;
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 1, neckBaseY + 4);
                ctx.lineTo(neckBaseX + 10, neckBaseY + 7);
                ctx.stroke();

                // Göğüs Kalkan Madalyonu
                ctx.fillStyle = p.chestGold;
                ctx.beginPath();
                ctx.arc(neckBaseX + 5, neckBaseY + 5.5, 3.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = p.chestMedallion;
                ctx.beginPath();
                ctx.arc(neckBaseX + 5, neckBaseY + 5.5, 1.8, 0, Math.PI * 2);
                ctx.fill();

                // 3. ÖRGÜLÜ RASTA YELE VE ALTIN KLİPSLER
                let maneSway = isMoving ? Math.sin(walkCycle * 2) * 2.5 : Math.sin(Date.now() / 300) * 1;
                ctx.fillStyle = p.mane;
                ctx.beginPath();
                ctx.moveTo(neckBaseX - 3, neckBaseY - 2);
                ctx.quadraticCurveTo(neckBaseX + 2 - maneSway, neckBaseY - 10, neckBaseX + 6, neckBaseY - 22);
                ctx.lineTo(neckBaseX + 10, neckBaseY - 21);
                ctx.quadraticCurveTo(neckBaseX + 5, neckBaseY - 10, neckBaseX + 2, neckBaseY);
                ctx.closePath();
                ctx.fill();

                // Altın Rasta Klipsleri
                ctx.fillStyle = p.maneGold;
                ctx.fillRect(neckBaseX - 1, neckBaseY - 6, 3, 1.6);
                ctx.fillRect(neckBaseX + 2, neckBaseY - 12, 3, 1.6);
                ctx.fillRect(neckBaseX + 5, neckBaseY - 18, 3, 1.6);

                // 4. AT BAŞI
                let headX = neckBaseX + 14, headY = neckBaseY - 19;
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.ellipse(headX, headY, 7.5, 6.5, 0.35, 0, Math.PI * 2);
                ctx.fill();

                // 5. ALTIN TAÇLI ALINLIK ZIRHI (CHANFRON)
                ctx.fillStyle = p.crownGold;
                ctx.beginPath();
                ctx.moveTo(headX + 1, headY - 8);
                ctx.lineTo(headX + 6, headY - 6);
                ctx.lineTo(headX + 4, headY - 1);
                ctx.lineTo(headX - 1, headY - 3);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = p.crownGlint;
                ctx.lineWidth = 0.8;
                ctx.stroke();

                // Kulaklar
                ctx.fillStyle = p.coatMain;
                ctx.beginPath();
                ctx.moveTo(headX - 3, headY - 4); ctx.lineTo(headX - 2, headY - 14); ctx.lineTo(headX + 2, headY - 5);
                ctx.closePath(); ctx.fill();

                // Burun ve Ağız
                ctx.fillStyle = p.muzzle;
                ctx.beginPath();
                ctx.ellipse(headX + 8, headY + 5, 5, 4.2, 0.35, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p.nostril;
                ctx.beginPath();
                ctx.arc(headX + 10, headY + 5, 1.2, 0, Math.PI * 2);
                ctx.fill();

                // İri Canlı Göz
                ctx.fillStyle = p.eye;
                ctx.beginPath();
                ctx.arc(headX + 1.5, headY - 1.5, 2.3, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = p.eyeGlint;
                ctx.beginPath();
                ctx.arc(headX + 1.0, headY - 2.2, 0.9, 0, Math.PI * 2);
                ctx.arc(headX + 2.4, headY - 1.0, 0.45, 0, Math.PI * 2);
                ctx.fill();

                // Deri Yular ve Dizgin
                ctx.strokeStyle = p.bridleLeather;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(headX + 5, headY + 4);
                ctx.quadraticCurveTo(headX - 4, headY + 12, 0, -2);
                ctx.stroke();
            }

            ctx.restore();
        }

        static draw(ctx, options = {}) {
            const {
                direction = 'down',
                isMoving = false,
                scale = 1.0,
                walkCycle = 0
            } = options;

            const dir = this.normalizeDirection(direction);

            ctx.save();
            ctx.scale(scale, scale);

            this.drawGroundShadow(ctx, isMoving, walkCycle, dir);
            this.drawHorseBase(ctx, dir, isMoving, walkCycle);
            this.drawHorseHeadAndNeck(ctx, dir, isMoving, walkCycle);

            ctx.restore();
        }
    }

    global.HorseMountRenderer = HorseMountRenderer;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
