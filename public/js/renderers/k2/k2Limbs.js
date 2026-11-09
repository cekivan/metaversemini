// public/js/renderers/k2/k2Limbs.js - Karakter 2 Kollar, Eller, Bacaklar, Ayakkabılar & Oturma Pozları
(function (global) {
    'use strict';

    class K2Limbs {
        static drawCargoPelvis(ctx, y, cargoColor, pocketColor, strapColor, facing, isFemale, isSkaterPants = false) {
            ctx.save();
            ctx.translate(0, y);
            ctx.fillStyle = cargoColor;

            const isProfile = (facing === 'right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const isBack = (facing === 'up' || facing === 'up-right');

            const pWidth = isFemale ? 13.0 : 14.8;

            if (isProfile) {
                // Profil Kalça (Derinlik 10.2px)
                ctx.beginPath();
                ctx.roundRect(-4.8, -2.5, 9.8, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                // Kemer
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-4.8, -2.5, 9.8, 1.9);
                // Yan Kemer Köprüsü
                ctx.fillStyle = "#64748b";
                ctx.fillRect(0, -2.5, 1.4, 2.2);

            } else if (isDiagonal) {
                // 3/4 Çapraz Kalça
                ctx.beginPath();
                ctx.roundRect(-pWidth * 0.50, -2.5, pWidth, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-pWidth * 0.50, -2.5, pWidth, 1.9);
                // Toka
                ctx.fillStyle = "#94a3b8";
                ctx.fillRect(isBack ? 1.5 : -1.6, -2.5, 2.4, 2.2);

            } else if (isBack) {
                // Tam Sırt Kalça
                ctx.beginPath();
                ctx.roundRect(-pWidth / 2, -2.5, pWidth, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-pWidth / 2, -2.5, pWidth, 1.9);
                // Arka kemer köprüleri
                ctx.fillStyle = cargoColor;
                ctx.fillRect(-3.8, -2.5, 1.4, 2.2);
                ctx.fillRect(2.4, -2.5, 1.4, 2.2);
                ctx.strokeStyle = "rgba(0,0,0,0.25)";
                ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(0, -0.6); ctx.lineTo(0, 2.7); ctx.stroke();

            } else {
                // Tam Ön Kalça
                ctx.beginPath();
                ctx.roundRect(-pWidth / 2, -2.5, pWidth, 5.2, [2.0, 2.0, 1.5, 1.5]);
                ctx.fill();
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-pWidth / 2, -2.5, pWidth, 1.9);
                // Metalik Toka
                ctx.fillStyle = "#94a3b8";
                ctx.fillRect(-1.2, -2.5, 2.6, 2.2);
                ctx.strokeStyle = "rgba(0,0,0,0.28)";
                ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.moveTo(0.1, -0.5); ctx.lineTo(0.1, 2.7); ctx.stroke();
            }

            // Skater Pantolon İçin Gümüş Cüzdan / Pantolon Zinciri
            if (isSkaterPants) {
                ctx.strokeStyle = "#cbd5e1";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(0, -0.6);
                    ctx.quadraticCurveTo(2.4, 2.8, 3.8, 0.4);
                } else if (!isBack) {
                    ctx.moveTo(1.2, -0.6);
                    ctx.quadraticCurveTo(4.2, 3.0, 5.8, 0.2);
                }
                ctx.stroke();
            }

            ctx.restore();
        }

        static drawStreetwearArm(ctx, shoulderX, shoulderY, angle, teeColor, teeAccent, skinColor, isCyberTee, isFar, handPose, smokeState, facing = 'down', isGraffitiTee = false, isFemale = false, isDress = false, isK2CyberDress = false, isK2GothDress = false, isSleeveless = false, watchId = 'none', isK2TechwearBomber = false, isK2CyberChic = false, isK2Tuxedo = false, isK2Overcoat = false, isK2CatCostume = false, isK2UrbanHoodie = false) {
            ctx.save();
            ctx.translate(shoulderX, shoulderY);
            ctx.rotate(angle);

            const isBack = (facing === 'up' || facing === 'up-right');
            const isProfile = (facing === 'right');
            const isRightSide = (shoulderX > 0);
            const bodyDir = isRightSide ? -1 : 1; // Gövdenin bulunduğu yön (iç kol)

            const armW = isFemale ? 4.2 : 5.6;
            const armLen = 12.0;
            const topW = isFemale ? 3.4 : 4.4;
            const wristW = isFemale ? 2.4 : 3.2;
            const wristY = armLen - 0.4;
            const isBareArm = isDress || isSleeveless || isK2CyberChic;
            const sleeveLen = (isK2Tuxedo || isK2Overcoat) ? 10.4 : (isK2TechwearBomber ? 9.8 : (isK2UrbanHoodie ? 10.2 : 6.2)); // Smokin & Trençkot tam uzun kollu

            if (isK2CyberChic) {
                // --- CYBER CHIC AYRIK KOLLUKLAR (Detached Arm Warmers) ---
                // 1. Üst Kol Ten Rengi (Omuzdan dirseğe kadar çıplak zarif kadın kolu)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.arc(0, 0, armW * 0.5, Math.PI, 0, false);
                ctx.quadraticCurveTo(armW * 0.48, 2.5, topW * 0.5, 4.8);
                ctx.lineTo(-topW * 0.5, 4.8);
                ctx.quadraticCurveTo(-armW * 0.48, 2.5, -armW * 0.5, 0);
                ctx.closePath();
                ctx.fill();

                // 2. Ayrık Lila Kolluk (Dirsekten bileğe kadar uzanan pastel lila ribanalı kolluk)
                ctx.fillStyle = "#c084fc";
                ctx.beginPath();
                ctx.moveTo(-topW * 0.52, 4.8);
                ctx.lineTo(topW * 0.52, 4.8);
                ctx.lineTo(wristW * 0.54, wristY);
                ctx.lineTo(-wristW * 0.54, wristY);
                ctx.closePath();
                ctx.fill();

                // Koyu Lila Ribana Üst & Alt Manşet Dikişleri
                ctx.fillStyle = "#9333ea";
                ctx.fillRect(-topW * 0.52, 4.8, topW * 1.04, 0.9);
                ctx.fillRect(-wristW * 0.54, wristY - 0.9, wristW * 1.08, 0.9);

                // Başparmak Boşluğu (Thumbhole Cutout)
                if (!isFar) {
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(bodyDir > 0 ? wristW * 0.2 : -wristW * 0.5, wristY - 2.0, 1.0, 1.4);
                }

            } else if (isBareArm) {
                // 1. PÜRÜZSÜZ KADIN ANATOMİK KOLU (Tek Parça Deltoid Omuz -> Dirsek -> Zarif Bilek)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                // Yuvarlak anatomik omuz başı (deltoid)
                ctx.arc(0, 0, armW * 0.5, Math.PI, 0, false);
                // Dış hat: Omuzdan dirseğe (y: 5.8) ve bileğe (y: wristY) basamaksız yumuşak geçiş
                ctx.quadraticCurveTo(armW * 0.48, 2.8, topW * 0.5, 5.8);
                ctx.lineTo(wristW * 0.5, wristY);
                // Bilek ucu
                ctx.lineTo(-wristW * 0.5, wristY);
                // İç hat: Bilekten dirseğe ve omuz tabanına
                ctx.lineTo(-topW * 0.5, 5.8);
                ctx.quadraticCurveTo(-armW * 0.48, 2.8, -armW * 0.5, 0);
                ctx.closePath();
                ctx.fill();
            } else {
                // 1. T-Shirt Kolu (Düşük omuzlu dökümlü kumaş formu)
                const isK2ReflectorVest = (typeof teeColor === 'string' && (teeColor.startsWith('vest_reflector_') || teeColor.startsWith('tshirts_vest_reflector_') || teeColor.startsWith('shirts_vest_reflector_')));
                const sleeveBaseColor = isK2ReflectorVest ? '#334155' : ((isK2Tuxedo && (!teeColor || teeColor === '#1e293b')) ? '#18181b' : teeColor);
                ctx.fillStyle = sleeveBaseColor;
                ctx.beginPath();
                const innerX = bodyDir * armW / 2;
                const outerX = -bodyDir * armW / 2;
                ctx.moveTo(innerX, -1.2);
                ctx.quadraticCurveTo(0, -1.3, outerX, -0.6); // Düşük omuz dikiş kavisi
                ctx.lineTo(outerX + (bodyDir < 0 ? 0.3 : -0.3), sleeveLen);
                ctx.lineTo(innerX + (bodyDir < 0 ? -0.3 : 0.3), sleeveLen);
                ctx.closePath();
                ctx.fill();

                if (isK2TechwearBomber) {
                    // Bomber Ceket Elastik Ribana Manşeti (Ribbed Bomber Cuff)
                    ctx.fillStyle = "#09090b";
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 1.8, armW + 0.4, 1.8);

                    // MA-1 Pilot Fermuarlı Kol Cebi & Dökümlü Turuncu Uçuş Şeridi (Flight Tag)
                    if (!isFar) {
                        // Koldaki Fermuarlı Taktik Cep
                        ctx.fillStyle = "#27272a";
                        ctx.fillRect(bodyDir > 0 ? armW * 0.1 : -armW * 0.65, 2.4, 2.6, 3.8);
                        ctx.fillStyle = "#cbd5e1"; // Gümüş fermuar dişlisi
                        ctx.fillRect(bodyDir > 0 ? armW * 0.1 + 0.3 : -armW * 0.65 + 0.3, 2.4, 2.0, 0.6);

                        // Dökülen Turuncu Uçuş Şeridi (Orange Ribbon Tag)
                        const ribbonX = bodyDir > 0 ? armW * 0.1 + 1.2 : -armW * 0.65 + 1.2;
                        const ribbonSway = Math.sin(Date.now() / 320) * 0.6;
                        ctx.fillStyle = "#ea580c";
                        ctx.beginPath();
                        ctx.moveTo(ribbonX - 0.5, 3.0);
                        ctx.lineTo(ribbonX + 0.5, 3.0);
                        ctx.lineTo(ribbonX + 0.5 + ribbonSway, 7.8);
                        ctx.lineTo(ribbonX - 0.5 + ribbonSway, 7.8);
                        ctx.closePath();
                        ctx.fill();
                        // Beyaz yazı çizgisi
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(ribbonX - 0.2 + ribbonSway * 0.5, 4.0, 0.4, 2.5);
                    }
                } else if (isCyberTee) {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 1.2, armW + 0.4, 1.0);
                } else if (isGraffitiTee) {
                    ctx.fillStyle = "#ec4899"; // Neon pembe manşet şeridi
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 1.4, armW + 0.4, 0.8);
                    ctx.fillStyle = "#22c55e"; // Neon yeşil alt çizgi
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 0.6, armW + 0.4, 0.6);
                } else if (isK2Tuxedo) {
                    // Siyah Yün Smokin Kolu & Dışa Taşmış Kolalı Beyaz Fransız Manşet & Altın Kol Düğmesi
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 1.2, armW + 0.4, 1.3);
                    if (!isFar) {
                        ctx.fillStyle = "#facc15"; // Altın Kol Düğmesi
                        ctx.fillRect(bodyDir > 0 ? armW * 0.1 : -armW * 0.4, sleeveLen - 0.8, 1.2, 0.9);
                    }
                } else if (isK2UrbanHoodie) {
                    // Oversize Hoodie: Kalın ribanalı manşet ve dirsek kıvrımı
                    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
                    ctx.fillRect(-armW / 2 - 0.2, sleeveLen - 1.8, armW + 0.4, 1.8);
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(-armW / 2 - 0.2, sleeveLen - 1.8); ctx.lineTo(armW / 2 + 0.2, sleeveLen - 1.8);
                    // Dirsek kumaş katlanma çizgisi
                    ctx.moveTo(-armW * 0.35, 5.5); ctx.lineTo(armW * 0.35, 5.8);
                    ctx.stroke();
                } else if (isK2Overcoat) {
                    // Antrasit Trençkot Kol Kayışı & Düğme
                    ctx.fillStyle = "#18181b";
                    ctx.fillRect(-armW / 2 - 0.3, sleeveLen - 2.0, armW + 0.6, 1.4);
                    if (!isFar) {
                        ctx.fillStyle = "#52525b"; // Düğme
                        ctx.fillRect(bodyDir > 0 ? armW * 0.15 : -armW * 0.45, sleeveLen - 1.6, 1.2, 0.9);
                    }
                }

                // Kol ribanası / dikiş
                ctx.strokeStyle = "rgba(0,0,0,0.22)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(-armW / 2 - 0.3, sleeveLen); ctx.lineTo(armW / 2 + 0.3, sleeveLen);
                ctx.stroke();

                // 2. Ön Kol (Kumaş kolun altından çıkan ten)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.moveTo(-topW / 2, sleeveLen - 0.2);
                ctx.lineTo(topW / 2, sleeveLen - 0.2);
                ctx.lineTo(wristW / 2, wristY);
                ctx.lineTo(-wristW / 2, wristY);
                ctx.closePath();
                ctx.fill();
            }

            // Gövdeye bakan iç kol gölgesi (Ambient Occlusion - Kolların gövdeye yapışıklığını kırar)
            const startOcclusionY = isBareArm ? 4.5 : sleeveLen;
            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.beginPath();
            if (bodyDir < 0) {
                // Gövde solda
                ctx.moveTo(-topW / 2, startOcclusionY);
                ctx.lineTo(-topW / 2 + 1.1, startOcclusionY);
                ctx.lineTo(-wristW / 2 + 0.8, wristY);
                ctx.lineTo(-wristW / 2, wristY);
            } else {
                // Gövde sağda
                ctx.moveTo(topW / 2, startOcclusionY);
                ctx.lineTo(topW / 2 - 1.1, startOcclusionY);
                ctx.lineTo(wristW / 2 - 0.8, wristY);
                ctx.lineTo(wristW / 2, wristY);
            }
            ctx.closePath();
            ctx.fill();

            // Elbise Bilek Aksesuarları
            if (isK2CyberDress) {
                ctx.fillStyle = "#0ea5e9";
                ctx.fillRect(-wristW / 2 - 0.4, wristY - 2.2, wristW + 0.8, 1.8);
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-wristW / 2 - 0.4, wristY - 1.2, wristW + 0.8, 0.6);
            } else if (isK2GothDress) {
                ctx.fillStyle = "#09090b";
                ctx.fillRect(-wristW / 2 - 0.4, wristY - 2.2, wristW + 0.8, 1.8);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-0.4, wristY - 1.7, 0.8, 0.8);
            }

            // Bilek eklem çizgisi (Doğal eklem geçişi)
            ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-wristW / 2 + 0.3, wristY);
            ctx.lineTo(wristW / 2 - 0.3, wristY);
            ctx.stroke();

            // Kol Saati (Klasik 2 & Karakter 2 Özel Saati)
            if (watchId && watchId !== 'none' && !isFar) {
                if (typeof drawClassic2Watch === 'function') {
                    drawClassic2Watch(ctx, 0, wristY - 0.8, watchId);
                }
            }

            // 3. El Çizimi (Açıya Duyarlı: Arkadan El Sırtı, Önden Dinlenen El, Profilde Yan El)
            ctx.save();
            ctx.translate(0, wristY + 0.3);
            this.drawHandAtOrigin(ctx, skinColor, handPose, smokeState, facing, isBack, isProfile, bodyDir);
            ctx.restore();

            // Arka kol derinlik gölgesi (Omuzdan parmak ucuna kadar kolun tamamını gölgeler)
            if (isFar) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                ctx.beginPath();
                ctx.roundRect(-armW / 2 - 0.2, -1.2, armW + 0.4, armLen + 3.6, 2);
                ctx.fill();
            }

            
            if (isK2CatCostume) {
                const catPawFn = this.drawCatPawMitten || (typeof Karakter2Renderer !== 'undefined' && Karakter2Renderer.drawCatPawMitten) || (typeof K2Torso !== 'undefined' && K2Torso.drawCatPawMitten);
                if (typeof catPawFn === 'function') {
                    catPawFn.call(this, ctx, armW, wristY, teeColor, isFar, handPose, facing, isBack, isProfile);
                }
            }

            ctx.restore();
        }

        static drawStreetwearSmokingArm(ctx, shoulderX, shoulderY, mouthX, mouthY, liftProgress, teeColor, teeAccent, skinColor, isCyberTee, isGraffitiTee, effFacing, smokeState, isSitting = false, isMoving = false, lighterArmShoulder = null, isSprinting = false) {
            ctx.save();

            // 1. Omuz, Dirsek, Bilek ve Sigara Kinematiği
            let idleElbowX, idleElbowY, idleWristX, idleWristY, idleCigAngle;
            let liftedElbowX, liftedElbowY, liftedWristX, liftedWristY, liftedCigAngle;

            if (effFacing === 'down') {
                // Tam Ön Bakış (Güney) - Kol vücudun dış yanına doğal sarkar, sigara tıpkı Karakter 1 gibi yana (dışarıya) bakar!
                idleElbowX = shoulderX - 1.2;
                idleElbowY = shoulderY + 5.8;
                idleWristX = shoulderX - 2.2;
                idleWristY = shoulderY + 10.8;
                idleCigAngle = 2.88; // ~165° (Bilekten yana/dışarı doğru neredeyse yatay, Karakter 1 gibi karizmatik yana bakar!)

                // Sigara ağızdayken: Sağ el sol göğüsten ağza çıkar
                // Dirsek kaburga yanında doğal durur (omuz kumaşı boyna girmez!)
                liftedElbowX = shoulderX + 2.0;
                liftedElbowY = shoulderY + 6.2;
                liftedWristX = mouthX - 3.6;
                liftedWristY = mouthY + 2.4;
                liftedCigAngle = 2.80; // Ağızdan dışarı sola doğru ~160° açıyla uzanır

            } else if (effFacing === 'down-right') {
                // 3/4 Çapraz Bakış (Güney-Doğu) - Sigara dış yana doğru bakar
                idleElbowX = shoulderX - 1.0;
                idleElbowY = shoulderY + 5.6;
                idleWristX = shoulderX - 1.8;
                idleWristY = shoulderY + 10.6;
                idleCigAngle = 2.78; // ~159° (Yana ve hafif ileri doğru, bacağa değmeden yana bakar)

                liftedElbowX = shoulderX + 1.8;
                liftedElbowY = shoulderY + 5.5;
                liftedWristX = mouthX - 1.2;
                liftedWristY = mouthY + 2.6;
                liftedCigAngle = 0.35; // Yüzün baktığı yöne (sağ ileri) doğru ~20° uzanır

            } else if (effFacing === 'right') {
                // Sağ Yan Profil (Doğu)
                idleElbowX = shoulderX + 1.6;
                idleElbowY = shoulderY + 5.4;
                idleWristX = shoulderX + 2.8;
                idleWristY = shoulderY + 10.4;
                idleCigAngle = 0.28; // ~16° (Sağ profile bakarken yana/öne doğru yatay)

                liftedElbowX = shoulderX + 1.6;
                liftedElbowY = shoulderY + 5.0;
                liftedWristX = mouthX - 1.4;
                liftedWristY = mouthY + 2.8;
                liftedCigAngle = 0.05; // Tam ileriye doğru yatay uzanır

            } else {
                // Diğer Açılar
                idleElbowX = shoulderX - 1.0;
                idleElbowY = shoulderY + 5.8;
                idleWristX = shoulderX - 1.8;
                idleWristY = shoulderY + 10.8;
                idleCigAngle = 2.82; // ~161° (Yana bakar)

                liftedElbowX = shoulderX - 1.0;
                liftedElbowY = shoulderY + 5.2;
                liftedWristX = mouthX - 2.5;
                liftedWristY = mouthY + 2.0;
                liftedCigAngle = 2.5;
            }

            const p = Math.max(0, Math.min(1, liftProgress));
            const easeP = 0.5 - 0.5 * Math.cos(Math.PI * p);

            const elbowX = idleElbowX + (liftedElbowX - idleElbowX) * easeP;
            const elbowY = idleElbowY + (liftedElbowY - idleElbowY) * easeP;
            const wristX = idleWristX + (liftedWristX - idleWristX) * easeP;
            const wristY = idleWristY + (liftedWristY - idleWristY) * easeP;

            // Filtre pozisyonu: Dinlenirken bilekteki elden, fırt anında TAM dudak noktasına (mouthX, mouthY) ulaşır!
            const idleFilterX = idleWristX + Math.cos(idleCigAngle) * 1.5;
            const idleFilterY = idleWristY + Math.sin(idleCigAngle) * 1.5;
            const liftedFilterX = mouthX;
            const liftedFilterY = mouthY;

            const filterX = idleFilterX + (liftedFilterX - idleFilterX) * easeP;
            const filterY = idleFilterY + (liftedFilterY - idleFilterY) * easeP;
            const cigAngle = idleCigAngle + (liftedCigAngle - idleCigAngle) * easeP;

            const armW = 5.6;

            // 2. T-SHIRT KOLU (Omuzdan Dirseğe Kumaş Kol)
            const sDx = elbowX - shoulderX;
            const sDy = elbowY - shoulderY;
            const sleeveAngle = Math.atan2(-sDx, sDy);
            const sleeveDist = Math.hypot(sDx, sDy);

            ctx.save();
            ctx.translate(shoulderX, shoulderY);
            ctx.rotate(sleeveAngle);

            const isVestSleeve = (typeof teeColor === 'string' && teeColor.includes('vest_reflector_'));
            ctx.fillStyle = isVestSleeve ? '#334155' : teeColor;
            ctx.beginPath();
            ctx.roundRect(-armW / 2, -1.2, armW, sleeveDist + 1.0, [2.0, 2.0, 0.8, 0.8]);
            ctx.fill();

            if (isCyberTee) {
                ctx.fillStyle = teeAccent;
                ctx.fillRect(-armW / 2, sleeveDist - 1.2, armW, 1.0);
            } else if (isGraffitiTee) {
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-armW / 2, sleeveDist - 1.4, armW, 0.8);
                ctx.fillStyle = "#22c55e";
                ctx.fillRect(-armW / 2, sleeveDist - 0.6, armW, 0.6);
            }

            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(-armW / 2, sleeveDist);
            ctx.lineTo(armW / 2, sleeveDist);
            ctx.stroke();

            ctx.restore();

            // 3. ÖN KOL (Dirsekten Bileğe Ten)
            const fDx = wristX - elbowX;
            const fDy = wristY - elbowY;
            const forearmAngle = Math.atan2(-fDx, fDy);
            const forearmDist = Math.hypot(fDx, fDy);

            ctx.save();
            ctx.translate(elbowX, elbowY);
            ctx.rotate(forearmAngle);

            const topW = 4.4;
            const wristW = 3.2;

            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.moveTo(-topW / 2, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(-wristW / 2, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.beginPath();
            ctx.moveTo(topW / 2 - 1.0, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(wristW / 2 - 0.8, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "rgba(0, 0, 0, 0.14)";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-wristW / 2, forearmDist);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.stroke();

            ctx.restore();

            // 4. EL (Bilek Üzerinde)
            ctx.save();
            ctx.translate(wristX, wristY);

            // El filtresini işaret ve orta parmak arasında kavrayacak şekilde döner
            const handRot = Math.atan2(filterY - wristY, filterX - wristX);
            ctx.rotate(handRot);

            if (smokeState && smokeState.fingerFlick) {
                ctx.rotate(smokeState.fingerFlick);
            }

            // El Sırtı / Avuç
            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, 1.8, 1.5, 0, 0, Math.PI * 2);
            ctx.fill();

            // Parmaklar (Sigarayı iki parmakla estetik kavrayış)
            const fingerDist = Math.hypot(filterX - wristX, filterY - wristY);
            const reach = Math.min(3.2, Math.max(1.8, fingerDist));
            ctx.beginPath();
            ctx.roundRect(0.2, -1.1, reach, 0.95, 0.45);
            ctx.roundRect(0.2, 0.15, reach * 0.95, 0.95, 0.45);
            ctx.fill();

            // Başparmak
            ctx.beginPath();
            ctx.ellipse(-0.3, 0.7, 0.95, 0.75, 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();

            // 5. SİGARA (Dudaktan Dışarı Havaya Uzanır - Asla Kafanın İçine Girmez!)
            ctx.save();
            ctx.translate(filterX, filterY);
            ctx.rotate(cigAngle);

            const filterLen = 2.4;
            const cigWhiteLen = 5.8;
            const tipDist = filterLen + cigWhiteLen;

            // Filtre (Dudaklara temas eden turuncu filtre)
            ctx.fillStyle = "#d97706";
            ctx.fillRect(0, -0.65, filterLen, 1.3);
            ctx.strokeStyle = "#92400e";
            ctx.lineWidth = 0.3;
            ctx.strokeRect(0, -0.65, filterLen, 1.3);

            // Beyaz Gövde (Dışarıya uzanan gövde)
            ctx.fillStyle = "#f8fafc";
            ctx.fillRect(filterLen, -0.6, cigWhiteLen, 1.2);
            ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
            ctx.lineWidth = 0.3;
            ctx.strokeRect(filterLen, -0.6, cigWhiteLen, 1.2);

            // Kül Ucu
            ctx.fillStyle = "#64748b";
            ctx.beginPath();
            ctx.arc(tipDist, 0, 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Yanan Akkor Köz (Fırt, Zippo alevi VEYA Koşarken Rüzgarda Harlanan Köz)
            const isInhaling = smokeState && smokeState.isInhaling;
            const isLightingFlame = smokeState && smokeState.lighterFlame;
            if (isInhaling || isLightingFlame || isSprinting) {
                const pulse = Math.sin(Date.now() / 75) * 0.35;
                ctx.save();
                ctx.fillStyle = isSprinting ? "#ff5500" : "#ff2200";
                ctx.shadowColor = isSprinting ? "#ff7700" : "#ff3b00";
                const blurSize = (isInhaling ? 14 : (isSprinting ? 12 : 9)) + pulse * 4;
                ctx.shadowBlur = blurSize;
                ctx.beginPath();
                const emberRadius = (isInhaling ? 1.4 : (isSprinting ? 1.25 : 1.1)) + pulse * 0.2;
                ctx.arc(tipDist + 0.3, 0, emberRadius, 0, Math.PI * 2);
                ctx.fill();

                // Beyaz-sarı akkor iç çekirdek
                ctx.fillStyle = isSprinting ? "#fff7ed" : "#ffffff";
                ctx.beginPath();
                ctx.arc(tipDist + 0.3, 0, (isInhaling ? 0.75 : (isSprinting ? 0.65 : 0.55)), 0, Math.PI * 2);
                ctx.fill();

                // Koşarken rüzgardan geriye uçuşan mikro-kıvılcımlar (Wind sparks)
                if (isSprinting && Math.random() < 0.40) {
                    const sparkAngle = (Math.random() - 0.5) * 0.7 + Math.PI; // geriye doğru
                    const sparkDist = 1.6 + Math.random() * 3.8;
                    ctx.fillStyle = "#fdba74";
                    ctx.shadowColor = "#f97316";
                    ctx.shadowBlur = 2;
                    ctx.beginPath();
                    ctx.arc(tipDist + Math.cos(sparkAngle) * sparkDist, Math.sin(sparkAngle) * sparkDist, 0.45, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            } else {
                ctx.fillStyle = "#ef4444";
                ctx.beginPath();
                ctx.arc(tipDist + 0.2, 0, 0.85, 0, Math.PI * 2);
                ctx.fill();

                // Idle Duman Kıvrımı (Yalnızca el ağızda değilken)
                if (easeP < 0.25) {
                    ctx.save();
                    ctx.translate(tipDist + 0.3, 0);
                    ctx.rotate(-cigAngle); // Koordinatı dünya dikeyine çevir (-Y daima yukarı göğe doğru)

                    const idleTime = Date.now() / 320;
                    const windLean = isMoving ? (isSprinting ? -4.5 : -2.5) : 0;
                    ctx.strokeStyle = isMoving ? "rgba(226, 232, 240, 0.26)" : "rgba(226, 232, 240, 0.42)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(
                        Math.sin(idleTime) * 0.8 + windLean * 0.3, -2.5,
                        Math.cos(idleTime * 0.8) * 1.2 + windLean * 0.7, -5.5,
                        Math.sin(idleTime * 1.2) * 1.5 + windLean, -9.0
                    );
                    ctx.stroke();

                    // Minik zarif yükselen tütün dumanı tanesi
                    const tProgress = ((Date.now() / 1200) % 1.0);
                    const pY = -tProgress * 11;
                    const pX = Math.sin(Date.now() / 400) * (1.4 * tProgress) + windLean * tProgress;
                    const pAlpha = (1.0 - tProgress) * 0.38;
                    ctx.fillStyle = `rgba(226, 232, 240, ${pAlpha})`;
                    ctx.beginPath();
                    ctx.arc(pX, pY, 0.8 + tProgress * 1.6, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.restore();
                }
            }

            ctx.restore(); // 5. Sigaranın translate & rotate'i burada biter!

            // 6. ZIPPO / KLASİK METAL ÇAKMAK İLE ATEŞLEME (Sol Kol ile Tutulup Çakılır)
            if (smokeState && smokeState.isLighting) {
                const tipAvatarX = filterX + Math.cos(cigAngle) * tipDist;
                const tipAvatarY = filterY + Math.sin(cigAngle) * tipDist;

                const lShoulderX = lighterArmShoulder ? lighterArmShoulder.x : (effFacing === 'down' ? 9.5 : (effFacing === 'down-right' ? 6.4 : -2.2));
                const lShoulderY = lighterArmShoulder ? lighterArmShoulder.y : (effFacing === 'down-right' ? -7.0 : -6.0);

                K2Limbs.drawStreetwearLighterArm(
                    ctx, lShoulderX, lShoulderY, tipAvatarX, tipAvatarY,
                    smokeState, teeColor, teeAccent, skinColor,
                    isCyberTee, isGraffitiTee, effFacing, isSitting, isMoving
                );
            }

            ctx.restore();
        }

        /**
         * 2.6. Articulated Streetwear Lighter Arm (Zippo Tutan & Sigarayı Yakan Sol Kol)
         * Sol omuzdan dirsek bükülerek Zippo çakmağı sigara kül ucuna ulaştırır.
         * Çakmak kapağı açılır, çarkı çakar, alev ve kıvılcımlarla ucu tutuşturur,
         * ardından kapağı kapatıp kolu cebine doğru indirir.
         */
        static drawStreetwearLighterArm(ctx, shoulderX, shoulderY, targetX, targetY, smokeState, teeColor, teeAccent, skinColor, isCyberTee, isGraffitiTee, effFacing, isSitting = false, isMoving = false) {
            if (!smokeState || !smokeState.isLighting) return;

            const lightElapsed = smokeState.elapsed || 0;

            // 1. Zippo Kolunun Yükselme & İndirme İlerlemesi (0.0 -> 1.0 -> 0.0)
            let liftT = 0;
            let lidOpen = 0;

            if (lightElapsed < 1000) {
                // Cebinden/kalçasından sigara ucuna doğru yükselir (0 -> 1000ms)
                const t = Math.max(0, lightElapsed / 1000);
                liftT = 0.5 - 0.5 * Math.cos(Math.PI * t);
                if (lightElapsed >= 700) {
                    lidOpen = Math.min(1.0, (lightElapsed - 700) / 250); // 700ms'de kapak açılmaya başlar
                }
            } else if (lightElapsed <= 2600) {
                // Sigaranın tam ucunda sabit tutuş & alevle yakma (1000ms -> 2600ms - 1.6 saniye doyurucu alev süresi!)
                liftT = 1.0;
                lidOpen = 1.0;
            } else if (lightElapsed <= 3400) {
                // Kapağı kapatıp kolu aşağı indirme (2600ms -> 3400ms)
                const t = (lightElapsed - 2600) / 800;
                liftT = 0.5 + 0.5 * Math.cos(Math.PI * t);
                lidOpen = Math.max(0, 1.0 - (lightElapsed - 2600) / 150); // Kapak "çıt" diye kapanır (2650ms zippo_close sesiyle tam senkron)
            } else {
                return; // Kol tamamen indi, kargo cep/rahat poz devreye girer
            }

            // 2. Hedef El & Bilek Konumu (Zippo tabanı)
            const lighterTipX = targetX;
            const lighterTipY = targetY + 2.6;

            let idleHandX = shoulderX - 1.2;
            let idleHandY = shoulderY + 11.2;
            if (effFacing === 'down') {
                idleHandX = shoulderX - 1.6;
                idleHandY = shoulderY + 11.0;
            } else if (effFacing === 'down-right') {
                idleHandX = shoulderX - 1.2;
                idleHandY = shoulderY + 10.8;
            } else if (effFacing === 'right') {
                idleHandX = shoulderX + 0.8;
                idleHandY = shoulderY + 10.6;
            }

            const handX = idleHandX + (lighterTipX - idleHandX) * liftT;
            const handY = idleHandY + (lighterTipY - idleHandY) * liftT;

            // 3. Dirsek Kinematiği (Kol içe/ağza bükülürken dirsek doğal dışa yaylanır)
            const midX = (shoulderX + handX) * 0.5;
            const midY = (shoulderY + handY) * 0.5;

            let elbowBendX = 0, elbowBendY = 0;
            if (effFacing === 'down') {
                elbowBendX = 3.2 * liftT;
                elbowBendY = 2.4 * (1.0 - liftT * 0.35);
            } else if (effFacing === 'down-right') {
                elbowBendX = 2.8 * liftT;
                elbowBendY = 2.2 * (1.0 - liftT * 0.35);
            } else if (effFacing === 'right') {
                elbowBendX = -2.6 * liftT;
                elbowBendY = 2.5 * (1.0 - liftT * 0.35);
            } else {
                elbowBendX = -2.0 * liftT;
                elbowBendY = 2.0 * (1.0 - liftT * 0.35);
            }

            const elbowX = midX + elbowBendX;
            const elbowY = midY + elbowBendY;

            // 4. T-SHIRT KOLU (Omuzdan Dirseğe Kumaş Kol)
            const sDx = elbowX - shoulderX;
            const sDy = elbowY - shoulderY;
            const sleeveAngle = Math.atan2(-sDx, sDy);
            const sleeveDist = Math.hypot(sDx, sDy);
            const armW = 5.4;

            ctx.save();
            ctx.translate(shoulderX, shoulderY);
            ctx.rotate(sleeveAngle);

            const isVestSleeve = (typeof teeColor === 'string' && teeColor.includes('vest_reflector_'));
            ctx.fillStyle = isVestSleeve ? '#334155' : teeColor;
            ctx.beginPath();
            ctx.roundRect(-armW / 2, -1.2, armW, sleeveDist + 1.0, [2.0, 2.0, 0.8, 0.8]);
            ctx.fill();

            if (isCyberTee) {
                ctx.fillStyle = teeAccent;
                ctx.fillRect(-armW / 2, sleeveDist - 1.2, armW, 1.0);
            } else if (isGraffitiTee) {
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-armW / 2, sleeveDist - 1.4, armW, 0.8);
                ctx.fillStyle = "#22c55e";
                ctx.fillRect(-armW / 2, sleeveDist - 0.6, armW, 0.6);
            }

            ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(-armW / 2, sleeveDist);
            ctx.lineTo(armW / 2, sleeveDist);
            ctx.stroke();

            ctx.restore();

            // 5. ÖN KOL (Dirsekten Bileğe Ten)
            const fDx = handX - elbowX;
            const fDy = handY - elbowY;
            const forearmAngle = Math.atan2(-fDx, fDy);
            const forearmDist = Math.hypot(fDx, fDy);

            ctx.save();
            ctx.translate(elbowX, elbowY);
            ctx.rotate(forearmAngle);

            const topW = 4.2;
            const wristW = 3.2;

            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.moveTo(-topW / 2, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(-wristW / 2, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
            ctx.beginPath();
            ctx.moveTo(topW / 2 - 0.9, 0);
            ctx.lineTo(topW / 2, 0);
            ctx.lineTo(wristW / 2, forearmDist);
            ctx.lineTo(wristW / 2 - 0.7, forearmDist);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // 6. EL & ZIPPO ÇAKMAK
            ctx.save();
            ctx.translate(handX, handY);

            // A. Çakmağı Tutan El (Avuç İçi & Parmaklar)
            ctx.fillStyle = skinColor;
            ctx.beginPath();
            ctx.ellipse(0, 3.2, 2.2, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.roundRect(-2.4, 1.8, 4.8, 3.2, 1.1);
            ctx.fill();

            // Çarkı çakan başparmak
            ctx.beginPath();
            ctx.ellipse(0.9, 0.5, 0.95, 1.5, 0.40, 0, Math.PI * 2);
            ctx.fill();

            // B. Zippo Krom Metalik Gövdesi
            ctx.fillStyle = "#94a3b8"; // Mat gümüş / krom
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.roundRect(-2.0, 0.4, 4.0, 5.4, [0.6, 0.6, 0.9, 0.9]);
            ctx.fill();
            ctx.stroke();

            // Gövde metalik dikey parıltı çizgisi
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.fillRect(-0.5, 0.6, 0.8, 5.0);

            // C. Açık Zippo Kapağı (Sola doğru menteşeli kapak)
            ctx.save();
            ctx.translate(-2.0, 0.6);
            ctx.rotate(-1.15 * lidOpen); // 0 (kapalı) -> ~66° açık kapak açısı
            ctx.fillStyle = "#cbd5e1";
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 0.45;
            ctx.beginPath();
            ctx.roundRect(-3.0, -1.0, 3.2, 2.0, 0.5);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            // D. Rüzgarlık (Chimney delikli gümüş) & Altın Çark
            ctx.fillStyle = "#64748b";
            ctx.fillRect(-1.3, -1.3, 2.6, 1.7);
            // Chimney havalandırma delikleri
            ctx.fillStyle = "#1e293b";
            [-0.8, 0, 0.8].forEach(hx => {
                ctx.fillRect(hx - 0.25, -0.9, 0.5, 0.9);
            });

            // Altın çakmaktaşı çarkı
            ctx.fillStyle = "#f59e0b";
            ctx.beginPath();
            ctx.arc(1.1, -0.4, 0.75, 0, Math.PI * 2);
            ctx.fill();

            // E. Çakmak Alevi & Kıvılcımlar (smokeState.lighterFlame)
            if (smokeState.lighterFlame) {
                const now = Date.now();
                const flamePulse = Math.sin(now / 50) * 0.4;
                const flameWobble = Math.cos(now / 70) * 0.45;

                // 1. Dış sıcak turuncu alev aurası
                ctx.fillStyle = "rgba(249, 115, 22, 0.90)";
                ctx.shadowColor = "#f59e0b";
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.ellipse(flameWobble * 0.3, -2.8, 1.8 + flamePulse * 0.3, 3.0 + Math.abs(flamePulse) * 0.6, flameWobble * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // 2. İç parlak sarı alev
                ctx.fillStyle = "#fbbf24";
                ctx.beginPath();
                ctx.ellipse(flameWobble * 0.3, -2.6, 1.15, 2.0 + Math.abs(flamePulse) * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();

                // 3. Sıcak beyaz-mavi çekirdek
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.ellipse(0, -1.5, 0.65, 1.1, 0, 0, Math.PI * 2);
                ctx.fill();

                // 4. Çakmak Kıvılcımları ✨
                ctx.fillStyle = "#fef08a";
                [-1.6, 1.2, -0.4, 0.9, 1.6].forEach((sx, idx) => {
                    const sparkY = -3.6 - (idx * 0.9) - Math.abs(flamePulse) * 1.3;
                    const sparkX = sx + Math.sin(now / 38 + idx) * 0.9;
                    ctx.beginPath();
                    ctx.arc(sparkX, sparkY, 0.5, 0, Math.PI * 2);
                    ctx.fill();
                });
            }

            ctx.restore();
        }

        /**
         * El Çizimi (Orjin Noktasında - Bilekten Çıkan Parmaklar & El Sırtı)
         */
        static drawHandAtOrigin(ctx, skinColor, handPose, smokeState, facing = 'down', isBack = false, isProfile = false, bodyDir = -1) {
            ctx.save();
            ctx.fillStyle = skinColor;

            if (handPose === 'pocket') {
                // --- SOKAK STİLİ: EL KARGO CEBİNDE (Hand In Pocket) ---
                const thumbSide = bodyDir; // Gövdeye bakan taraf

                // Cep ağzına giren el sırtı kısmı
                ctx.beginPath();
                ctx.ellipse(0, 0.8, 1.6, 1.1, 0, 0, Math.PI * 2);
                ctx.fill();

                // Cep ağzından dışarıda kalan rahat başparmak
                ctx.beginPath();
                ctx.roundRect(thumbSide * 1.3 - 0.4, 0.4, 0.85, 1.6, 0.4);
                ctx.fill();

                // Kargo cep ağzı kumaş gölgesi (Kumaşın eli örttüğü derinlik çizgisi)
                ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
                ctx.beginPath();
                ctx.moveTo(-1.6, 1.3);
                ctx.quadraticCurveTo(0, 1.8, 1.6, 1.3);
                ctx.lineTo(1.6, 2.5);
                ctx.lineTo(-1.6, 2.5);
                ctx.closePath();
                ctx.fill();

            } else if (handPose === 'hip') {
                // --- ZARİF KADIN ELİ BELDE (Feminine Hand On Hip) ---
                const thumbSide = bodyDir; // Gövdeye bakan taraf
                ctx.beginPath();
                ctx.ellipse(thumbSide * 0.4, 0.7, 1.4, 1.2, -thumbSide * 0.35, 0, Math.PI * 2);
                ctx.fill();

                // Bele yaslanan zarif parmaklar
                ctx.beginPath();
                ctx.roundRect(-thumbSide * 0.6 - 0.4, 0.3, 1.8, 1.2, 0.5);
                ctx.fill();

                // Bel derinlik gölgesi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-1.2, 1.3); ctx.lineTo(1.2, 1.3);
                ctx.stroke();

            } else if (handPose === 'cigarette') {
                // Sigara Tutan El
                ctx.beginPath();
                ctx.ellipse(0, 1.2, 1.8, 1.5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.roundRect(-1.3, 0.4, 1.1, 1.6, 0.5);
                ctx.roundRect(-0.8, 1.0, 0.8, 3.6, 0.4);
                ctx.roundRect(0.2, 1.0, 0.8, 3.8, 0.4);
                ctx.fill();

                // Sigara Çubuğu
                ctx.save();
                ctx.translate(-0.2, 2.6);
                ctx.rotate(0.14);

                // Filtre
                ctx.fillStyle = "#d97706";
                ctx.fillRect(-1.0, -0.9, 2.4, 1.8);
                // Gövde
                ctx.fillStyle = "#f8fafc";
                ctx.fillRect(1.4, -0.8, 6.6, 1.6);

                // Kor / Duman Ucu
                const tipX = 8.0;
                const isInhaling = smokeState && smokeState.isInhaling;
                if (isInhaling) {
                    // Derin nefes çekilirken parlayan akkor köz & sıcak alev halkası
                    const pulse = Math.sin(Date.now() / 85) * 0.3;
                    ctx.save();
                    ctx.fillStyle = "#ff2200";
                    ctx.shadowColor = "#ff3b00";
                    ctx.shadowBlur = 11 + pulse * 4;
                    ctx.beginPath();
                    ctx.arc(tipX + 0.3, 0, 1.4 + pulse * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(tipX + 0.3, 0, 0.75, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    // Dinlenme anı közü (Kızıl-turuncu hafif ışıma)
                    ctx.fillStyle = "#ef4444";
                    ctx.beginPath();
                    ctx.arc(tipX + 0.2, 0, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                    // İnce Doğal Tüten Duman Kıvrımı (Idle Smoke Wisp)
                    if (!smokeState || smokeState.liftProgress < 0.2) {
                        const idleTime = Date.now() / 320;
                        ctx.save();
                        ctx.strokeStyle = "rgba(226, 232, 240, 0.36)";
                        ctx.lineWidth = 0.65;
                        ctx.beginPath();
                        ctx.moveTo(tipX + 0.3, 0);
                        ctx.bezierCurveTo(
                            tipX + 1.2 + Math.sin(idleTime) * 0.8, -1.8,
                            tipX + 0.8 + Math.cos(idleTime * 0.8) * 1.2, -4.2,
                            tipX + 1.8 + Math.sin(idleTime * 1.2) * 1.5, -6.8
                        );
                        ctx.stroke();

                        ctx.strokeStyle = "rgba(241, 245, 249, 0.20)";
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(tipX + 0.5, -2.0);
                        ctx.quadraticCurveTo(
                            tipX + 2.2 + Math.cos(idleTime) * 1.0, -4.5,
                            tipX + 1.2 + Math.sin(idleTime * 0.9) * 1.4, -7.5
                        );
                        ctx.stroke();
                        ctx.restore();
                    }
                }
                ctx.restore();

            } else if (isBack) {
                // --- ARKADAN BAKIŞ: EL SIRTISI (Dorsum of Hand) & PARMAKLARIN DOĞAL KAVİSİ ---
                const thumbSide = bodyDir; // Başparmak gövdeye doğru (içe) bakar

                // 1. El Sırtı Ana Gövdesi (Zarif oval/yumuşak dikdörtgen)
                ctx.beginPath();
                ctx.roundRect(-1.7, 0, 3.4, 2.6, [0.8, 0.8, 1.2, 1.2]);
                ctx.fill();

                // 2. İç kısımdaki Başparmak (Gövdeye doğru kıvrık)
                ctx.beginPath();
                ctx.ellipse(thumbSide * 1.5, 1.4, 0.8, 1.2, thumbSide * 0.2, 0, Math.PI * 2);
                ctx.fill();

                // 3. Parmak Uçları (Arkadan bakıldığında öne kıvrılmış yumuşak tırnak/parmak boğumları)
                ctx.beginPath();
                ctx.roundRect(-1.5, 2.2, 3.0, 1.2, 0.6);
                ctx.fill();

                // 4. Parmak Eklemi Derinlik Çizgisi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(-1.2, 2.1); ctx.lineTo(1.2, 2.1);
                ctx.stroke();

            } else if (isProfile) {
                // --- YAN PROFİL: ZARİF YAN EL (İnce ve Dinamik) ---
                ctx.beginPath();
                ctx.ellipse(0, 1.5, 1.5, 2.2, 0.1, 0, Math.PI * 2);
                ctx.fill();

                // Öne bakan başparmak & işaret parmağı silüeti
                ctx.beginPath();
                ctx.roundRect(-0.8, 1.8, 1.6, 2.0, 0.6);
                ctx.fill();

            } else {
                // --- ÖNDEN / ÇAPRAZDAN BAKIŞ: DOĞAL DİNLENEN AVUÇ/EL ---
                const thumbSide = bodyDir; // Başparmak gövdeye (içe) bakar

                // Avuç İçi & Parmak Tabanı (Gövdeye göre simetrik)
                ctx.beginPath();
                ctx.ellipse(0, 1.2, 1.8, 1.7, 0, 0, Math.PI * 2);
                ctx.fill();

                // İçe dönük doğal başparmak (Gövde tarafında simetrik)
                ctx.beginPath();
                ctx.roundRect(thumbSide * 1.3 - 0.5, 0.6, 1.0, 1.8, 0.5);
                ctx.fill();

                // Bütünleşik doğal parmak grubu (Başparmaktan dışa doğru simetrik dizilim)
                [1.1, 0.4, -0.4, -1.1].forEach((distFromInner, idx) => {
                    const px = thumbSide * distFromInner;
                    const fLen = (idx === 1 || idx === 2) ? 2.3 : 1.9; // Orta ve yüzük parmakları hafif uzun
                    ctx.beginPath();
                    ctx.roundRect(px - 0.35, 1.4, 0.72, fLen, 0.35);
                    ctx.fill();
                });

                // Parmak boğumu ayrım gölgesi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.10)";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-1.1, 2.2); ctx.lineTo(1.1, 2.2);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * Taktik Kargo Bacak & Çok Katmanlı Chunky Platform Sneaker
         */
        static drawCargoLegAndShoe(ctx, hipX, hipY, cargoColor, pocketColor, strapColor, sneakerColor, isK2Shoes, facing, isFar, legAngle = 0, isSkaterPants = false, isSkateShoes = false, isSkirt = false, skinColor = '#ffd1a4', isK2CyberDress = false, isK2GothDress = false, isK2FlaredJeans = false, isK2GothFishnet = false, isK2GothBoots = false, isK2TechwearBomber = false, isK2CyberChic = false, isK2Tuxedo = false, isK2Overcoat = false, isK2ParachuteCargo = false, isK2WideLegDenim = false, isK2LowRiseFlare = false, isK2LeatherCargo = false, isK2CatCostume = false, isK2UrbanHoodie = false, isK2HighSneakers = false, highSneakerAccent = '#dc2626', isK2NbRunner = false, runnerAccent = 'original', isBarefoot = false) {
            ctx.save();
            ctx.translate(hipX, hipY);
            if (legAngle !== 0) {
                ctx.rotate(legAngle);
            }

            const isProfile = (facing === 'right');
            const isBack = (facing === 'up' || facing === 'up-right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const legW = isSkirt ? 4.8 : 6.4;
            const legLen = 12.0;

            if (isSkirt) {
                // 1. ZARİF KADIN BACAKLARI (Slender Bare Legs / Gothic Sheer Stocking)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.moveTo(-legW / 2, 0);
                ctx.lineTo(legW / 2, 0);
                ctx.lineTo(legW / 2 - 0.2, 5.5); // Diz
                ctx.lineTo(legW / 2 - 0.5, legLen - 0.5); // Bilek
                ctx.lineTo(-legW / 2 + 0.5, legLen - 0.5);
                ctx.lineTo(-legW / 2 + 0.2, 5.5);
                ctx.closePath();
                ctx.fill();

                if (isK2GothDress) {
                    // Gotik Siyah Yarı Saydam File / Çorap Katmanı
                    ctx.fillStyle = "rgba(24, 17, 36, 0.30)";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0);
                    ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 - 0.2, 5.5);
                    ctx.lineTo(legW / 2 - 0.5, legLen - 0.5);
                    ctx.lineTo(-legW / 2 + 0.5, legLen - 0.5);
                    ctx.lineTo(-legW / 2 + 0.2, 5.5);
                    ctx.closePath();
                    ctx.fill();

                    // Gotik Üst Bacak Jartiyer Kemeri & Gümüş O-Ring
                    if (!isFar) {
                        ctx.fillStyle = "#09090b";
                        ctx.fillRect(-legW / 2 - 0.2, 2.6, legW + 0.4, 1.4);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.arc(0, 3.3, 0.9, 0, Math.PI * 2);
                        ctx.stroke();
                    }
                } else if (isK2CyberChic) {
                    // Y2K Cyber Chic: Asimetrik Şeffaf Siyah Tül Çorap (Dizüstü Sheer Stocking) & Lila Jartiyer
                    ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 0.1, 3.2);
                    ctx.lineTo(legW / 2 - 0.1, 3.2);
                    ctx.lineTo(legW / 2 - 0.4, legLen - 0.5);
                    ctx.lineTo(-legW / 2 + 0.4, legLen - 0.5);
                    ctx.closePath();
                    ctx.fill();

                    // Lila Jartiyer Bandı & Gümüş O-Ring
                    if (!isFar) {
                        ctx.fillStyle = "#c084fc";
                        ctx.fillRect(-legW / 2 - 0.2, 3.0, legW + 0.4, 1.3);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.arc(0, 3.65, 0.9, 0, Math.PI * 2);
                        ctx.stroke();
                    }

                    // Arkadan Bakışta İnce Çorap Dikişi (Stocking Back Seam)
                    if (isBack) {
                        ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(0, 3.2); ctx.lineTo(0, legLen - 0.5);
                        ctx.stroke();
                    }

                } else if (isK2CyberDress) {
                    // Siber Neon Taktik Jartiyer Bandı & Mini Holster
                    if (!isFar) {
                        ctx.fillStyle = "#ec4899";
                        ctx.fillRect(-legW / 2 - 0.2, 2.6, legW + 0.4, 1.4);
                        ctx.fillStyle = "#0ea5e9";
                        ctx.fillRect(-0.8, 3.0, 1.6, 2.0);
                        ctx.fillStyle = "#facc15";
                        ctx.fillRect(-0.4, 3.4, 0.8, 0.7);
                    }
                }

                // Diz Kapağı Pembemsi Işıma (Soft Knee Blush & Form)
                ctx.fillStyle = "rgba(244, 114, 182, 0.16)";
                ctx.beginPath();
                ctx.ellipse(0, 5.5, 1.4, 0.9, 0, 0, Math.PI * 2);
                ctx.fill();

                // Bilek Ayakkabı Geçişi Dikişi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(-legW / 2 + 0.5, legLen - 0.6);
                ctx.lineTo(legW / 2 - 0.5, legLen - 0.6);
                ctx.stroke();

            } else {
                // 1. Kargo Pantolon Bacağı / İspanyol Paça Kot / Gotik Fileli Kot
                if (isK2FlaredJeans) {
                    // İspanyol Paça Kot (Dizden paçaya doğru genişleyen zarif paça)
                    ctx.fillStyle = "#1d4ed8";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0);
                    ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 + 0.1, 5.5);
                    ctx.lineTo(legW / 2 + 1.2, legLen + 0.5);
                    ctx.lineTo(-legW / 2 - 1.2, legLen + 0.5);
                    ctx.lineTo(-legW / 2 - 0.1, 5.5);
                    ctx.closePath();
                    ctx.fill();

                    // Kot sarı dikiş çizgisi
                    ctx.strokeStyle = "#f59e0b";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0); ctx.lineTo(0, legLen); ctx.stroke();
                } else if (isK2GothFishnet) {
                    // Gotik Siyah Yırtık Jean & File Çorap
                    ctx.fillStyle = "#18181b";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0);
                    ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 + 0.2, 5.5);
                    ctx.lineTo(legW / 2 - 0.2, legLen - 0.5);
                    ctx.lineTo(-legW / 2 + 0.2, legLen - 0.5);
                    ctx.lineTo(-legW / 2 - 0.2, 5.5);
                    ctx.closePath();
                    ctx.fill();

                    // Diz Yırtığı & Altından Görünen File Çorap
                    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
                    ctx.fillRect(-legW * 0.35, 4.4, legW * 0.7, 2.2);
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-legW * 0.3, 4.6); ctx.lineTo(legW * 0.3, 6.4);
                    ctx.moveTo(legW * 0.3, 4.6); ctx.lineTo(-legW * 0.3, 6.4);
                    ctx.stroke();
                } else if (isK2ParachuteCargo) {
                    // Baggy Paraşüt Kargo: Geniş dökümlü paraşüt kumaş, büzgülü bilek
                    ctx.fillStyle = "#d4b996";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 - 0.4, 0); ctx.lineTo(legW / 2 + 0.4, 0);
                    ctx.lineTo(legW / 2 + 1.2, 5.5); ctx.lineTo(legW / 2 + 0.8, legLen - 1.2);
                    ctx.lineTo(-legW / 2 - 0.8, legLen - 1.2); ctx.lineTo(-legW / 2 - 1.2, 5.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#475569";
                    ctx.fillRect(-legW * 0.45, legLen - 1.2, legW * 0.9, 1.2);
                    ctx.fillStyle = "#c5a078";
                    ctx.fillRect(legW / 2 - 0.2, 3.5, 1.8, 4.0);
                } else if (isK2WideLegDenim) {
                    // Vintage Retro Açık Mavi Wide-Leg Kot
                    ctx.fillStyle = "#0284c7";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0); ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 + 0.9, 5.5); ctx.lineTo(legW / 2 + 1.1, legLen + 0.6);
                    ctx.lineTo(-legW / 2 - 1.1, legLen + 0.6); ctx.lineTo(-legW / 2 - 0.9, 5.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "#f59e0b";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, legLen); ctx.stroke();
                } else if (isK2LowRiseFlare) {
                    // Düşük Bel İspanyol Paça Füme Jean
                    ctx.fillStyle = "#1e293b";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0); ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 + 0.2, 5.0); ctx.lineTo(legW / 2 + 1.5, legLen + 0.6);
                    ctx.lineTo(-legW / 2 - 1.5, legLen + 0.6); ctx.lineTo(-legW / 2 - 0.2, 5.0);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath(); ctx.moveTo(-legW / 2, 1.5); ctx.lineTo(legW / 2, 1.5); ctx.stroke();
                } else if (isK2LeatherCargo) {
                    // Mat Siyah Deri Kargo
                    ctx.fillStyle = "#18181b";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2, 0); ctx.lineTo(legW / 2, 0);
                    ctx.lineTo(legW / 2 + 0.4, 5.5); ctx.lineTo(legW / 2, legLen);
                    ctx.lineTo(-legW / 2, legLen); ctx.lineTo(-legW / 2 - 0.4, 5.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.22)";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath(); ctx.moveTo(0, 1.0); ctx.lineTo(0, legLen - 1.0); ctx.stroke();
                    ctx.fillStyle = "#e2e8f0";
                    ctx.fillRect(legW / 2 - 0.8, 4.5, 1.2, 2.5);
                } else {
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    if (isSkaterPants) {
                        // Skater Salaş Geniş Paça (Dizden paçaya daralmayan, bol silüet)
                        ctx.moveTo(-legW / 2, 0);
                        ctx.lineTo(legW / 2, 0);
                        ctx.lineTo(legW / 2 + 0.3, 5.5); // Diz
                        ctx.lineTo(legW / 2 + 0.5, legLen + 0.4); // Dökümlü paça ucu
                        ctx.lineTo(-legW / 2 - 0.5, legLen + 0.4);
                        ctx.lineTo(-legW / 2 - 0.3, 5.5);
                    } else {
                        // Kalçadan dize hafif genişleme, dize kadar 6.6px, bileğe doğru 5.6px toparlanan jogger kalıbı
                        ctx.moveTo(-legW / 2, 0);
                        ctx.lineTo(legW / 2, 0);
                        ctx.lineTo(legW / 2 + 0.2, 5.5); // Diz bombesi
                        ctx.lineTo(legW / 2 - 0.4, legLen - 1.6); // Paçaya doğru incelme
                        ctx.lineTo(-legW / 2 + 0.4, legLen - 1.6);
                        ctx.lineTo(-legW / 2 - 0.2, 5.5);
                    }
                    ctx.closePath();
                    ctx.fill();
                }

                // Taktik Kargo Yan Cebi & Kumaş Hacmi
                if (isK2Tuxedo) {
                    // Smokin Pantolonu Dış Dikiş Saten Şerit & Keskin Ütü Çizgisi
                    ctx.fillStyle = "#27272a";
                    ctx.fillRect(isProfile ? 1.0 : (legW * 0.35), 0, 0.9, legLen - 1.2);
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0); ctx.lineTo(0, legLen - 1.2);
                    ctx.stroke();
                } else if (isK2Overcoat) {
                    // Trençkot Pantolonu Temiz Dikiş
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(0, 0); ctx.lineTo(0, legLen - 1.2);
                    ctx.stroke();
                } else if (isProfile) {
                    // Profil Körüklü Kargo Cep
                    ctx.fillStyle = pocketColor;
                    ctx.beginPath();
                    ctx.roundRect(-1.8, 1.4, 3.6, 5.2, [1.0, 1.0, 1.2, 1.2]);
                    ctx.fill();
                    // Cep kapağı
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    ctx.roundRect(-1.8, 1.4, 3.6, 1.4, [1.0, 1.0, 0, 0]);
                    ctx.fill();
                    // Taktik dokuma askı kayışı & D-Ring / Toka
                    ctx.fillStyle = strapColor;
                    ctx.fillRect(-0.5, 2.3, 1.0, 1.6);
                    ctx.fillStyle = isSkaterPants ? "#cbd5e1" : "#94a3b8"; // Metal D-Halka / Gümüş zincir ucu
                    ctx.fillRect(-0.6, 3.9, 1.2, 0.5);

                } else if (!isBack) {
                    // Ön ve Çapraz Bakışta Dış Kargo Cebi
                    ctx.fillStyle = pocketColor;
                    ctx.beginPath();
                    ctx.roundRect(1.2, 1.4, 2.5, 4.6, 1.0);
                    ctx.fill();
                    // Cep kapağı
                    ctx.fillStyle = cargoColor;
                    ctx.fillRect(1.2, 1.4, 2.5, 1.3);
                    // Mini taktik şerit / neon pembe askı
                    ctx.fillStyle = strapColor;
                    ctx.fillRect(1.9, 2.3, 0.9, 1.2);
                } else {
                    // Arkadan Bakış: Arka Cep Çizgisi
                    ctx.strokeStyle = "rgba(0,0,0,0.22)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.roundRect(-legW / 2 + 1.0, 1.2, legW - 2.0, 2.8, 0.6);
                    ctx.stroke();
                }
                if (isK2WideLegDenim && isBack) {
                    // Kot Arka Cebi (Sarı Kot Dikişi & V-Dikiş)
                    ctx.fillStyle = "#0369a1";
                    ctx.beginPath();
                    ctx.roundRect(-legW / 2 + 0.8, 1.2, legW - 1.6, 3.2, 0.4);
                    ctx.fill();
                    ctx.strokeStyle = "#f59e0b";
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 1.2, 2.2);
                    ctx.lineTo(0, 3.4);
                    ctx.lineTo(legW / 2 - 1.2, 2.2);
                    ctx.stroke();
                } else if (isK2ParachuteCargo && isBack) {
                    ctx.fillStyle = "#b8956c";
                    ctx.fillRect(-legW / 2 + 0.6, 1.4, legW - 1.2, 3.0);
                    ctx.fillStyle = "#475569";
                    ctx.fillRect(-1.0, 3.6, 2.0, 0.8);
                }

                // Kumaş Kırışıklıkları & Katlantı Dikişleri (Folds & Creases)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
                ctx.lineWidth = 0.75;
                if (isBack) {
                    // Diz arkası çukurluğu (Popliteal crease)
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 1.0, 5.8);
                    ctx.quadraticCurveTo(0, 5.2, legW / 2 - 1.0, 5.8);
                    ctx.stroke();
                } else {
                    // Diz ön katlantısı (Çift dikiş hattı)
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 0.8, 5.2);
                    ctx.quadraticCurveTo(0, 5.9, legW / 2 - 0.8, 5.2);
                    ctx.stroke();

                    ctx.strokeStyle = "rgba(0, 0, 0, 0.11)";
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 1.2, 6.4);
                    ctx.quadraticCurveTo(0, 7.0, legW / 2 - 1.2, 6.4);
                    ctx.stroke();

                    // Skater Diz Eskitme / Yırtık Detayı
                    if (isSkaterPants) {
                        ctx.fillStyle = "#18181b"; // İç astar yırtık yarığı
                        ctx.fillRect(-legW / 2 + 1.4, 5.4, legW - 2.8, 1.2);
                        ctx.strokeStyle = "#a1a1aa"; // Beyaz dikiş iplik lifleri
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(-legW / 2 + 2.0, 6.0); ctx.lineTo(-legW / 2 + 3.2, 6.0);
                        ctx.moveTo(legW / 2 - 3.2, 6.0); ctx.lineTo(legW / 2 - 2.0, 6.0);
                        ctx.stroke();
                    }
                }

                if (isSkaterPants) {
                    // --- SKATER SALAŞ DÖKÜMLÜ PAÇA (Baggy Drape Hem over Sneaker) ---
                    const hemW = legW + 1.0; // 7.4px geniş dökümlü paça
                    ctx.fillStyle = cargoColor;
                    ctx.beginPath();
                    ctx.roundRect(-hemW / 2, legLen - 2.2, hemW, 3.0, [0.5, 0.5, 1.2, 1.2]);
                    ctx.fill();

                    // Kumaş yığılma & katlantı gölgesi (Accordion drape fold)
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.32)";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-hemW / 2 + 0.4, legLen - 1.4);
                    ctx.quadraticCurveTo(0, legLen - 0.8, hemW / 2 - 0.4, legLen - 1.4);
                    ctx.stroke();

                    // Paça alt duble dikiş hattı (Double stitch hem)
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-hemW / 2 + 0.6, legLen + 0.4);
                    ctx.lineTo(hemW / 2 - 0.6, legLen + 0.4);
                    ctx.stroke();

                    // Ayakkabı boğazına düşen yumuşak döküm gölgesi (Occlusion)
                    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
                    ctx.fillRect(-hemW / 2 + 0.4, legLen + 0.6, hemW - 0.8, 0.5);

                } else {
                    // Paça üstü kumaş yığılması (Cuff drape fold)
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.16)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(-legW / 2 + 0.8, legLen - 1.9);
                    ctx.lineTo(legW / 2 - 0.8, legLen - 1.9);
                    ctx.stroke();

                    // Jogger Paça Elastik Ribanası (Ribbed Cuff)
                    const cuffW = legW - 0.8;
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(-cuffW / 2, legLen - 1.8, cuffW, 1.8, 0.5);
                    ctx.fill();

                    // Ribana mikro nervür dikişleri
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(-cuffW / 4, legLen - 1.7); ctx.lineTo(-cuffW / 4, legLen - 0.1);
                    ctx.moveTo(cuffW / 4, legLen - 1.7); ctx.lineTo(cuffW / 4, legLen - 0.1);
                    ctx.stroke();
                }
            }

            // 2. Çok Katmanlı Chunky Platform Sneaker / Skater Sneaker / Gotik Platform Bot
            ctx.translate(0, legLen);

            const shoeStartX = isProfile ? -3.8 : (isDiagonal ? -3.6 : -3.3);
            const shoeW = isProfile ? 9.2 : (isDiagonal ? 8.0 : 6.6);

            if (isBarefoot) {
                // YALINAYAK (Zarif Çıplak Ayaklar)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(shoeStartX + 0.5, 0);
                    ctx.lineTo(shoeStartX + shoeW - 1.2, 0);
                    ctx.quadraticCurveTo(shoeStartX + shoeW, 0.8, shoeStartX + shoeW - 0.4, 2.0);
                    ctx.lineTo(shoeStartX + 0.2, 2.0);
                    ctx.quadraticCurveTo(shoeStartX - 0.2, 1.0, shoeStartX + 0.5, 0);
                } else {
                    ctx.roundRect(shoeStartX + 0.4, 0, shoeW - 0.8, 2.0, [0.8, 0.8, 1.0, 1.0]);
                }
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
                ctx.fillRect(isProfile ? shoeStartX + shoeW - 2.2 : shoeStartX + 1.2, 1.4, isProfile ? 1.4 : shoeW - 2.4, 0.5);
                ctx.restore();
                return;
            }

            if (isK2Tuxedo) {
                // İTALYAN FORMAL DERİ KÖSELE AYAKKABI (Polished Black Oxford Dress Shoes)
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(shoeStartX, 0);
                    ctx.lineTo(shoeStartX + shoeW, 0);
                    ctx.quadraticCurveTo(shoeStartX + shoeW + 1.2, 1.2, shoeStartX + shoeW - 0.2, 2.6);
                    ctx.lineTo(shoeStartX - 0.2, 2.6);
                    ctx.lineTo(shoeStartX, 0);
                } else {
                    ctx.roundRect(shoeStartX, 0, shoeW, 2.8, [1.0, 1.0, 1.5, 1.5]);
                }
                ctx.closePath();
                ctx.fill();
                // Deri parlama efekti (Specular shine)
                ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
                ctx.fillRect(shoeStartX + 1.2, 0.4, shoeW * 0.45, 0.8);
                // İnce kösele taban
                ctx.fillStyle = "#18181b";
                ctx.fillRect(shoeStartX, 2.4, shoeW, 0.6);
                ctx.restore();
                return;
            }

            if (isK2HighSneakers) {
                // ============================================================
                // AIR JORDAN 1 RETRO UZUN BİLEKLİKLİ SNEAKERS (Streetwear Boyut)
                // ============================================================
                // - PANTOLON KORUMA SİSTEMİ: Ayakkabı boğazı paçayı kapatmaz (y: -1.2 -> 0.0),
                //   bacak boyu 12.0px tam boyunu korur. Sneaker hacmi ileriye (14.0px) ve
                //   tabana (2.2px kauçuk) doğru heybet kazanır; asla pantolondan yemez!
                // - BEYAZ BÖLÜMLER (#ffffff): Kalın kauçuk taban (midsole), yan gövde paneli
                //   (quarter panel), burun üstü havalandırmalı panel (toe vamp).
                // - SİYAH BÖLÜMLER (#18181b): İkonik swoosh yan logosu, bilek üst dolgusu
                //   (collar padding), siyah yüksek bağcıklar, alt zemin temas lastiği (outsole).
                // - RENK DEĞİŞTİREN VURGU BÖLÜMLERİ (highSneakerAccent: Kırmızı #dc2626, Lacivert #1e3a8a, Siyah #18181b):
                //   Bileklik kanatları (ankle collar flaps & Wings logo), bağcık paneli (eyestay),
                //   arka topuk kalkanı (heel counter), ön burun koruma çamurluğu (mudguard wrap).
                // ============================================================
                const accentCol = highSneakerAccent || '#dc2626';
                const whiteCol = '#ffffff';
                const blackCol = '#18181b';
                const stitchCol = '#e4e4e7';
                const wingsEmblemCol = (accentCol === '#18181b' || accentCol === '#1e3a8a') ? '#f1f5f9' : '#18181b';

                if (isProfile) {
                    // --------------------------------------------------------
                    // A) PROFİL / YAN BAKIŞ (Sıfırdan Ultra-Net Tasarım - 12.0px & İnce Taban)
                    // --------------------------------------------------------
                    const sX = -3.8;
                    const sW = 12.0;
                    const soleH = 1.7;

                    // 1. Boğaz (Black Padded Collar)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 1.2, -0.6, 5.6, 1.3, [0.6, 0.6, 0.2, 0.2]);
                    ctx.fill();

                    // 2. Dil (Padded Tongue) & Nike Air Etiketi
                    ctx.fillStyle = '#f8fafc';
                    ctx.beginPath();
                    ctx.roundRect(sX + 3.8, -1.0, 2.2, 1.5, 0.4);
                    ctx.fill();
                    ctx.fillStyle = accentCol;
                    ctx.fillRect(sX + 4.0, -0.9, 1.8, 0.6);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(sX + 4.4, -0.8, 1.0, 0.3);

                    // 3. Kırmızı Bileklik Deri Kanadı (Ankle Collar Flap)
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.8, -0.2, 6.0, 1.8, [0.6, 0.6, 0.3, 0.3]);
                    ctx.fill();
                    // Kanat Altı Gölge Ayrımı (Netlik Verir)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                    ctx.fillRect(sX + 0.8, 1.4, 6.0, 0.25);

                    // Wings Logosu (Dairesel Amblem & Kanat)
                    ctx.fillStyle = wingsEmblemCol;
                    ctx.beginPath();
                    ctx.arc(sX + 2.5, 0.6, 0.8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(sX + 2.2, 0.5, 0.6, 0.3);

                    // 4. Burun Üstü Paneli (Toe Box Vamp - Beyaz)
                    ctx.fillStyle = '#f8fafc';
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.8, 0.5, 3.0, 1.5, [0.8, 0.8, 0, 0]);
                    ctx.fill();
                    // Burun Mikro Havalandırma Noktaları
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                    ctx.fillRect(sX + sW - 2.8, 0.9, 0.4, 0.4);
                    ctx.fillRect(sX + sW - 1.8, 0.9, 0.4, 0.4);

                    // 5. Burun Ön Koruma Çamurluğu (Büyütülmüş 2.5px Kırmızı Burun)
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.8, 1.4, 3.8, 2.5, [0.8, 1.2, 0.4, 0.3]);
                    ctx.fill();
                    // Burun Ucu Deri Işıltısı (3D Parlama)
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.20)';
                    ctx.fillRect(sX + sW - 1.4, 1.7, 0.7, 1.3);

                    // 6. Kırmızı Topuk Kalkanı (Genişletilmiş 3.5px Kırmızı Topuk)
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX, 0.4, 3.4, 3.5, [0.8, 0.2, 0.2, 0.4]);
                    ctx.fill();
                    // Topuk Ön Kenar Dikiş Çizgisi
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
                    ctx.fillRect(sX + 3.2, 0.4, 0.25, 3.5);

                    // 7. Yan Beyaz Panel (Quarter Panel)
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(sX + 3.4, 0.4, sW - 7.2, 3.5);

                    // 8. Kırmızı Eyestay (Bağcık Kanalı) & Delikler
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 3.8, 0.3, 1.8, 2.3, 0.3);
                    ctx.fill();
                    // Siyah Çapraz Bağcıklar
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(sX + 4.0, 0.5, 1.4, 0.4);
                    ctx.fillRect(sX + 4.0, 1.1, 1.4, 0.4);
                    ctx.fillRect(sX + 4.0, 1.7, 1.4, 0.4);
                    ctx.fillRect(sX + 4.0, 2.2, 1.4, 0.4);

                    // 9. İkonik Siyah Swoosh Logosu (Jilet Gibi Net Kavis - Asla Örtülmez)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.moveTo(sX + 1.8, 1.5);
                    ctx.quadraticCurveTo(sX + 4.4, 3.3, sX + sW - 4.0, 1.4);
                    ctx.lineTo(sX + sW - 3.8, 2.0);
                    ctx.quadraticCurveTo(sX + 4.6, 3.9, sX + 1.8, 2.2);
                    ctx.closePath();
                    ctx.fill();

                    // 10. Gövde/Taban Ayrım Çizgisi (Maksimum Kontrast & Keskinlik)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 3.8, sW + 0.3, 0.25);

                    // 11. İnce Kavisli Beyaz Kauçuk Taban (1.7px Midsole)
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.moveTo(sX - 0.2, 3.9);
                    ctx.lineTo(sX + sW - 3.2, 3.9);
                    ctx.quadraticCurveTo(sX + sW, 3.6, sX + sW + 0.1, 3.2);
                    ctx.lineTo(sX + sW + 0.1, 3.9 + soleH);
                    ctx.quadraticCurveTo(sX + sW - 1.2, 3.9 + soleH + 0.6, sX + sW - 3.2, 3.9 + soleH + 0.6);
                    ctx.lineTo(sX - 0.2, 3.9 + soleH + 0.6);
                    ctx.closePath();
                    ctx.fill();

                    // Taban Dikiş Çizgisi (Foxing Stitch)
                    ctx.strokeStyle = '#d4d4d8';
                    ctx.lineWidth = 0.35;
                    ctx.beginPath();
                    ctx.moveTo(sX, 4.3);
                    ctx.lineTo(sX + sW - 3.0, 4.3);
                    ctx.stroke();

                    // Topukta "AIR" Kabartma İzi
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
                    ctx.fillRect(sX + 0.6, 4.8, 2.0, 0.45);

                    // 12. Siyah Dış Taban Lastiği (Lugged Outsole - 0.6px)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.moveTo(sX, 3.9 + soleH + 0.1);
                    ctx.lineTo(sX + sW - 3.2, 3.9 + soleH + 0.1);
                    ctx.quadraticCurveTo(sX + sW, 3.9 + soleH - 0.3, sX + sW + 0.1, 3.9 + soleH - 0.5);
                    ctx.lineTo(sX + sW + 0.1, 3.9 + soleH + 0.6);
                    ctx.quadraticCurveTo(sX + sW - 1.2, 3.9 + soleH + 0.6, sX + sW - 3.2, 3.9 + soleH + 0.6);
                    ctx.lineTo(sX, 3.9 + soleH + 0.6);
                    ctx.closePath();
                    ctx.fill();

                } else if (isDiagonal) {
                    // --------------------------------------------------------
                    // B) ÇAPRAZ / 3/4 İZOMETRİK BAKIŞ (Sıfırdan Ultra-Net Tasarım - 10.6px)
                    // --------------------------------------------------------
                    const sX = -3.8;
                    const sW = 10.6;
                    const soleH = 1.7;

                    // 1. Boğaz
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 1.0, -0.6, 5.0, 1.3, [0.6, 0.6, 0.2, 0.2]);
                    ctx.fill();

                    // 2. Dil & Logo
                    ctx.fillStyle = '#f8fafc';
                    ctx.beginPath();
                    ctx.roundRect(sX + 3.2, -1.0, 2.0, 1.5, 0.4);
                    ctx.fill();
                    ctx.fillStyle = accentCol;
                    ctx.fillRect(sX + 3.5, -0.9, 1.4, 0.6);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(sX + 3.8, -0.8, 0.8, 0.3);

                    // 3. Bilek Kanat Paneli
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.6, -0.3, 5.4, 1.8, [0.6, 0.6, 0.2, 0.2]);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                    ctx.fillRect(sX + 0.6, 1.3, 5.4, 0.25);

                    // Wings Amblemi
                    ctx.fillStyle = wingsEmblemCol;
                    ctx.beginPath();
                    ctx.arc(sX + 2.0, 0.5, 0.7, 0, Math.PI * 2);
                    ctx.fill();

                    // 4. Burun Üstü Paneli (Toe Box)
                    ctx.fillStyle = '#f8fafc';
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.2, 0.4, 2.8, 1.3, 0.3);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
                    ctx.fillRect(sX + sW - 2.0, 0.7, 0.4, 0.4);

                    // 5. Çamurluk (Büyütülmüş 2.5px Kırmızı Burun)
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.5, 1.4, 3.5, 2.5, 0.4);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                    ctx.fillRect(sX + sW - 1.3, 1.7, 0.7, 1.2);

                    // 6. Gövde Arka Topuk (Kırmızı Deri - 3.5px)
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX, 0.4, 3.2, 3.5, 0.4);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
                    ctx.fillRect(sX + 3.0, 0.4, 0.25, 3.5);

                    // 7. Yan Beyaz Panel (Quarter Panel)
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(sX + 3.0, 0.4, sW - 6.2, 3.5);

                    // 8. Siyah Swoosh (Net Kavis)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.moveTo(sX + 1.8, 1.4);
                    ctx.quadraticCurveTo(sX + 4.2, 3.0, sX + sW - 3.4, 1.4);
                    ctx.lineTo(sX + sW - 3.2, 2.0);
                    ctx.quadraticCurveTo(sX + 4.4, 3.6, sX + 1.8, 2.1);
                    ctx.closePath();
                    ctx.fill();

                    // 9. Gövde/Taban Ayrım Çizgisi
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 3.8, sW + 0.4, 0.25);

                    // 10. İnce Beyaz Taban
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.2, 3.9, sW + 0.4, soleH, 0.4);
                    ctx.fill();
                    ctx.strokeStyle = '#d4d4d8';
                    ctx.lineWidth = 0.35;
                    ctx.beginPath();
                    ctx.moveTo(sX, 4.3);
                    ctx.lineTo(sX + sW - 1.0, 4.3);
                    ctx.stroke();

                    // 11. Dış Taban
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX, 3.9 + soleH, sW, 0.6, [0, 0, 0.6, 0.6]);
                    ctx.fill();

                } else if (isBack) {
                    // --------------------------------------------------------
                    // C) ARKA BAKIŞ (Sıfırdan Ultra-Net Tasarım - 7.4px & İnce Taban)
                    // --------------------------------------------------------
                    const sW = 7.4;
                    const sX = -sW / 2;
                    const soleH = 1.7;

                    // 1. Boğaz
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.8, -0.6, sW - 1.6, 1.3, 0.4);
                    ctx.fill();

                    // 2. Bilek Kanatları
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.4, -0.2, sW - 0.8, 1.8, 0.4);
                    ctx.fill();

                    // 3. Arka Topuk Kalkanı (3.6px Kırmızı Topuk)
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.2, 0.4, sW - 0.4, 3.6, 0.4);
                    ctx.fill();

                    // 4. Arka Dikey Şerit (Omurga)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                    ctx.fillRect(-0.8, -0.8, 1.6, 4.8);
                    ctx.fillStyle = accentCol;
                    ctx.fillRect(-0.6, -0.8, 1.2, 4.8);

                    // 5. Gövde/Taban Ayrım Çizgisi
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 3.9, sW + 0.4, 0.25);

                    // 6. İnce Beyaz Taban
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.2, 4.0, sW + 0.4, soleH, 0.4);
                    ctx.fill();
                    ctx.strokeStyle = '#d4d4d8';
                    ctx.lineWidth = 0.35;
                    ctx.beginPath();
                    ctx.moveTo(sX, 4.4);
                    ctx.lineTo(sX + sW, 4.4);
                    ctx.stroke();

                    // 7. Dış Taban
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX, 4.0 + soleH, sW, 0.6, [0, 0, 0.6, 0.6]);
                    ctx.fill();

                } else {
                    // --------------------------------------------------------
                    // D) ÖN BAKIŞ (Sıfırdan Ultra-Net Tasarım - 7.4px En & İnce Taban)
                    // --------------------------------------------------------
                    const frontW = 7.4;
                    const sX = -frontW / 2;
                    const soleH = 1.8;

                    // 1. Boğaz (Arka Yaka)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.9, -0.7, frontW - 1.8, 1.4, [0.6, 0.6, 0, 0]);
                    ctx.fill();

                    // 2. Dil & Nike Air Etiketi
                    ctx.fillStyle = '#f8fafc';
                    ctx.beginPath();
                    ctx.roundRect(-1.3, -1.2, 2.6, 1.5, 0.4);
                    ctx.fill();
                    ctx.fillStyle = accentCol;
                    ctx.fillRect(-0.9, -1.0, 1.8, 0.6);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-0.5, -0.9, 1.0, 0.3);

                    // 3. Bileklik Yan Kanatları
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.4, -0.2, frontW - 0.8, 1.8, [0.6, 0.6, 0.2, 0.2]);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
                    ctx.fillRect(sX + 0.4, 1.4, frontW - 0.8, 0.25);

                    // 4. Burun Üstü Beyaz Deri Panel (Toe Box Vamp) - Önce Çizilir!
                    ctx.fillStyle = '#f8fafc';
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.6, 1.1, frontW - 1.2, 2.4, [0.8, 0.8, 0.3, 0.3]);
                    ctx.fill();
                    // 4 Adet Lazer Havalandırma Deliği
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                    ctx.fillRect(-0.8, 2.6, 0.4, 0.4);
                    ctx.fillRect(0.4, 2.6, 0.4, 0.4);
                    ctx.fillRect(-0.8, 3.1, 0.4, 0.4);
                    ctx.fillRect(0.4, 3.1, 0.4, 0.4);

                    // 5. BÜYÜTÜLMÜŞ KIRMIZI BURUN ÇAMURLUĞU (2.2px!)
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.2, 2.2, frontW - 0.4, 2.2, [0.7, 0.7, 0.3, 0.3]);
                    ctx.fill();
                    // Üst Dikiş Ayrımı
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
                    ctx.fillRect(sX + 0.6, 2.2, frontW - 1.2, 0.25);
                    // Burun Ön Parıltısı
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
                    ctx.fillRect(-1.2, 3.5, 2.4, 0.6);

                    // 6. Siyah Deri Eyestay (Vamp Üzerine Oturur)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(-1.5, 0.0, 3.0, 2.4, 0.3);
                    ctx.fill();
                    // Bağcık Delikleri (Eyelets)
                    ctx.fillStyle = '#334155';
                    ctx.fillRect(-1.4, 0.35, 0.3, 0.3); ctx.fillRect(1.1, 0.35, 0.3, 0.3);
                    ctx.fillRect(-1.4, 0.85, 0.3, 0.3); ctx.fillRect(1.1, 0.85, 0.3, 0.3);
                    ctx.fillRect(-1.4, 1.35, 0.3, 0.3); ctx.fillRect(1.1, 1.35, 0.3, 0.3);
                    ctx.fillRect(-1.4, 1.85, 0.3, 0.3); ctx.fillRect(1.1, 1.85, 0.3, 0.3);

                    // 7. Saf Beyaz Bağcıklar (4 Sıra Kristal Net Bağcık - Eyestay Üzerine Çizilir!)
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-1.1, 0.35, 2.2, 0.3);
                    ctx.fillRect(-1.1, 0.85, 2.2, 0.3);
                    ctx.fillRect(-1.1, 1.35, 2.2, 0.3);
                    ctx.fillRect(-1.1, 1.85, 2.2, 0.3);

                    // 8. Gövde/Taban Ayrım Çizgisi (Maksimum Keskinlik)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 4.3, frontW + 0.4, 0.25);

                    // 9. BEYAZ KAUÇUK TABAN (1.8px Midsole - Yarısından Az)
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.3, 4.4, frontW + 0.6, soleH, [0.4, 0.4, 0.4, 0.4]);
                    ctx.fill();

                    // Taban Dikiş Çizgisi
                    ctx.strokeStyle = '#d4d4d8';
                    ctx.lineWidth = 0.35;
                    ctx.beginPath();
                    ctx.moveTo(sX - 0.1, 4.7);
                    ctx.lineTo(sX + frontW + 0.1, 4.7);
                    ctx.stroke();

                    // Taban AIR Kabartma İzi
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
                    ctx.fillRect(sX + 0.6, 5.4, frontW - 1.2, 0.4);

                    // 10. SİYAH DIŞ TABAN LASTİĞİ (Outsole - 0.6px)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.2, 6.2, frontW + 0.4, 0.6, [0, 0, 0.6, 0.6]);
                    ctx.fill();
                }

                // Far Leg Shadow (Gölge efekti)
                if (isFar) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                    ctx.beginPath();
                    ctx.roundRect(-legW / 2 - 0.5, -legLen, legW + (isProfile ? 3.4 : 1.0), legLen + 4.2, 2);
                    ctx.fill();
                }                ctx.restore();
                return;
            }

            if (isK2NbRunner) {
                // ============================================================
                // NEW BALANCE 990 / 574 RETRO RUNNER (ayakkabi.md Altın Oran)
                // ============================================================
                // - Taban Kalınlığı: 1.7px Midsole + 0.6px Outsole (< %35 Altın Oran)
                // - Üst Gövde: 3.5px Katmanlı Süet & Nefes Alan File (Mesh)
                // - Düşük Bilek: Low-cut padded runner yaka
                // - İkonik "N" Logosu: 3M reflektif dış kontur & renkli iç dolgu
                // - ENCAP Taban Takviyesi: Arka topukta çift tonlu darbe emici takoz
                // - Ön Genişlik: 7.4px derli toplu ön en, Profil: 12.0px
                // ============================================================
                let suedeMain = '#64748b';    // New Balance Heritage Grey
                let suedeDark = '#475569';    // Koyu süet gölge
                let meshBase = '#cbd5e1';     // Nefes alan file kumaş
                let tpuClipCol = '#94a3b8';   // TPU topuk stabilizatörü
                let nLogoBorder = '#ffffff';  // 3M Reflektif beyaz çerçeve
                let nLogoFill = '#475569';    // N logosu iç dolgu

                const chosenRunnerCol = runnerAccent || '#64748b';
                if (chosenRunnerCol === '#1e3a8a' || chosenRunnerCol === 'navy') {
                    suedeMain = '#1e3a8a';
                    suedeDark = '#1e293b';
                    meshBase = '#93c5fd';
                    nLogoFill = '#1e3a8a';
                } else if (chosenRunnerCol === '#166534' || chosenRunnerCol === 'green') {
                    suedeMain = '#166534';
                    suedeDark = '#14532d';
                    meshBase = '#a7f3d0';
                    nLogoFill = '#166534';
                } else if (chosenRunnerCol === '#18181b' || chosenRunnerCol === 'black') {
                    suedeMain = '#18181b';
                    suedeDark = '#09090b';
                    meshBase = '#3f3f46';
                    nLogoFill = '#27272a';
                } else if (chosenRunnerCol !== '#64748b' && chosenRunnerCol !== 'original' && chosenRunnerCol.startsWith('#')) {
                    suedeMain = chosenRunnerCol;
                    suedeDark = '#334155';
                    nLogoFill = chosenRunnerCol;
                }

                const whiteCol = '#ffffff';
                const blackCol = '#09090b';

                if (isProfile) {
                    // --------------------------------------------------------
                    // A) PROFİL (12.0px & 1.7px Taban - ayakkabi.md Standartı)
                    // --------------------------------------------------------
                    const sX = -3.8;
                    const sW = 12.0;
                    const soleH = 1.7;

                    // 1. Düşük Koşu Boğazı & Astar (Low-Cut Padded Collar)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 1.4, 0.0, 5.0, 1.1, [0.5, 0.5, 0, 0]);
                    ctx.fill();

                    // 2. Dil (Padded Tongue) & NB Etiketi
                    ctx.fillStyle = meshBase;
                    ctx.beginPath();
                    ctx.roundRect(sX + 3.6, -0.7, 2.2, 1.4, 0.3);
                    ctx.fill();
                    ctx.fillStyle = '#dc2626';
                    ctx.fillRect(sX + 3.9, -0.6, 1.6, 0.5);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(sX + 4.2, -0.5, 1.0, 0.3);

                    // 3. File Zemin Panelleri (Breathable Mesh Underlay)
                    ctx.fillStyle = meshBase;
                    ctx.fillRect(sX + 3.4, 0.5, sW - 7.0, 3.4);
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.8, 0.6, 3.0, 1.4, [0.8, 0.8, 0, 0]);
                    ctx.fill();
                    // File mikro perforasyon pikselleri
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
                    ctx.fillRect(sX + sW - 2.8, 1.0, 0.4, 0.4);
                    ctx.fillRect(sX + sW - 1.8, 1.0, 0.4, 0.4);

                    // 4. Koyu Süet Ön Burun Çamurluğu (2.5px)
                    ctx.fillStyle = suedeMain;
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.8, 1.4, 3.8, 2.5, [0.8, 1.2, 0.4, 0.3]);
                    ctx.fill();
                    // 3M Reflektör ucu şeridi
                    ctx.fillStyle = '#f1f5f9';
                    ctx.fillRect(sX + sW - 3.6, 1.6, 0.6, 0.6);

                    // 5. Süet Arka Topuk Kalkanı (3.4px)
                    ctx.fillStyle = suedeMain;
                    ctx.beginPath();
                    ctx.roundRect(sX, 0.5, 3.4, 3.4, [0.8, 0.2, 0.2, 0.4]);
                    ctx.fill();

                    // 6. TPU Topuk Sabitleyici Klipsi (ENCAP Heel Counter Clip)
                    ctx.fillStyle = tpuClipCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.3, 2.4, 2.9, 1.5, [0.3, 0.3, 0.2, 0.2]);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(0,0,0,0.22)';
                    ctx.fillRect(sX + 0.3, 2.4, 2.9, 0.25);

                    // 7. Süet Eyestay & Bağcıklar
                    ctx.fillStyle = suedeDark;
                    ctx.beginPath();
                    ctx.roundRect(sX + 3.8, 0.3, 1.8, 2.3, 0.3);
                    ctx.fill();
                    // Beyaz sporcu koşu bağcıkları (Flat Laces)
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(sX + 4.0, 0.5, 1.4, 0.35);
                    ctx.fillRect(sX + 4.0, 1.1, 1.4, 0.35);
                    ctx.fillRect(sX + 4.0, 1.7, 1.4, 0.35);
                    ctx.fillRect(sX + 4.0, 2.2, 1.4, 0.35);

                    // 8. İKONİK "N" LOGOSU (Reflective 3M Border & Inner Fill)
                    ctx.fillStyle = nLogoBorder;
                    ctx.beginPath();
                    ctx.moveTo(sX + 4.0, 1.2);
                    ctx.lineTo(sX + 4.8, 1.2);
                    ctx.lineTo(sX + 5.9, 2.9);
                    ctx.lineTo(sX + 5.9, 1.2);
                    ctx.lineTo(sX + 6.7, 1.2);
                    ctx.lineTo(sX + 6.7, 3.2);
                    ctx.lineTo(sX + 5.9, 3.2);
                    ctx.lineTo(sX + 4.8, 1.5);
                    ctx.lineTo(sX + 4.8, 3.2);
                    ctx.lineTo(sX + 4.0, 3.2);
                    ctx.closePath();
                    ctx.fill();

                    // İç N dolgusu
                    ctx.fillStyle = nLogoFill;
                    ctx.beginPath();
                    ctx.moveTo(sX + 4.3, 1.4);
                    ctx.lineTo(sX + 4.6, 1.4);
                    ctx.lineTo(sX + 5.9, 2.9);
                    ctx.lineTo(sX + 6.4, 2.9);
                    ctx.lineTo(sX + 6.4, 1.4);
                    ctx.lineTo(sX + 6.1, 1.4);
                    ctx.lineTo(sX + 4.8, 1.8);
                    ctx.lineTo(sX + 4.3, 2.9);
                    ctx.closePath();
                    ctx.fill();

                    // 9. Gövde/Taban Ayrım Çizgisi (0.25px Derinlik)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 3.8, sW + 0.3, 0.25);

                    // 10. Çift Tonlu ENCAP Koşu Tabanı (1.7px Midsole)
                    ctx.fillStyle = whiteCol;
                    ctx.beginPath();
                    ctx.moveTo(sX - 0.2, 3.9);
                    ctx.lineTo(sX + sW - 3.2, 3.9);
                    ctx.quadraticCurveTo(sX + sW, 3.6, sX + sW + 0.1, 3.2);
                    ctx.lineTo(sX + sW + 0.1, 3.9 + soleH);
                    ctx.quadraticCurveTo(sX + sW - 1.2, 3.9 + soleH + 0.6, sX + sW - 3.2, 3.9 + soleH + 0.6);
                    ctx.lineTo(sX - 0.2, 3.9 + soleH + 0.6);
                    ctx.closePath();
                    ctx.fill();

                    // Arka ENCAP topuk takviye bloğu
                    ctx.fillStyle = '#e2e8f0';
                    ctx.fillRect(sX, 3.9, 3.6, 1.3);
                    ctx.fillStyle = 'rgba(0,0,0,0.18)';
                    ctx.fillRect(sX + 0.6, 4.4, 2.2, 0.35);

                    // 11. Siyah Dişli Dış Taban (Lugged Outsole - 0.6px)
                    ctx.fillStyle = blackCol;
                    ctx.beginPath();
                    ctx.moveTo(sX, 3.9 + soleH + 0.1);
                    ctx.lineTo(sX + sW - 3.2, 3.9 + soleH + 0.1);
                    ctx.quadraticCurveTo(sX + sW, 3.9 + soleH - 0.3, sX + sW + 0.1, 3.9 + soleH - 0.5);
                    ctx.lineTo(sX + sW + 0.1, 3.9 + soleH + 0.6);
                    ctx.quadraticCurveTo(sX + sW - 1.2, 3.9 + soleH + 0.6, sX + sW - 3.2, 3.9 + soleH + 0.6);
                    ctx.lineTo(sX, 3.9 + soleH + 0.6);
                    ctx.closePath();
                    ctx.fill();
                    // Ön burun ucu kauçuk tampon (Toe bumper)
                    ctx.fillRect(sX + sW - 0.4, 2.8, 0.5, 1.1);

                } else if (isDiagonal) {
                    // --------------------------------------------------------
                    // B) ÇAPRAZ 3/4 İZOMETRİK (10.6px & 1.7px Taban)
                    // --------------------------------------------------------
                    const sX = -3.8;
                    const sW = 10.6;
                    const soleH = 1.7;

                    // Boğaz
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 1.2, 0.0, 4.4, 1.0, [0.5, 0.5, 0, 0]);
                    ctx.fill();

                    // Dil
                    ctx.fillStyle = meshBase;
                    ctx.beginPath();
                    ctx.roundRect(sX + 3.0, -0.7, 2.0, 1.4, 0.3);
                    ctx.fill();
                    ctx.fillStyle = '#dc2626';
                    ctx.fillRect(sX + 3.3, -0.6, 1.4, 0.5);

                    // File Panel
                    ctx.fillStyle = meshBase;
                    ctx.fillRect(sX + 2.8, 0.5, sW - 5.8, 3.4);
                    // Burun File
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.2, 0.5, 2.8, 1.3, 0.3);
                    ctx.fill();

                    // Süet Burun Çamurluğu
                    ctx.fillStyle = suedeMain;
                    ctx.beginPath();
                    ctx.roundRect(sX + sW - 3.5, 1.4, 3.5, 2.5, 0.4);
                    ctx.fill();
                    ctx.fillStyle = '#f1f5f9';
                    ctx.fillRect(sX + sW - 3.3, 1.5, 0.5, 0.5);

                    // Süet Arka Topuk
                    ctx.fillStyle = suedeMain;
                    ctx.beginPath();
                    ctx.roundRect(sX, 0.6, 3.0, 3.3, 0.4);
                    ctx.fill();

                    // TPU Klips
                    ctx.fillStyle = tpuClipCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.3, 2.4, 2.4, 1.5, 0.3);
                    ctx.fill();

                    // Çapraz "N" Logosu (3D Açılı)
                    ctx.fillStyle = nLogoBorder;
                    ctx.beginPath();
                    ctx.moveTo(sX + 3.4, 1.3);
                    ctx.lineTo(sX + 4.2, 1.3);
                    ctx.lineTo(sX + 5.2, 2.9);
                    ctx.lineTo(sX + 5.2, 1.3);
                    ctx.lineTo(sX + 5.9, 1.3);
                    ctx.lineTo(sX + 5.9, 3.1);
                    ctx.lineTo(sX + 5.2, 3.1);
                    ctx.lineTo(sX + 4.2, 1.6);
                    ctx.lineTo(sX + 4.2, 3.1);
                    ctx.lineTo(sX + 3.4, 3.1);
                    ctx.closePath();
                    ctx.fill();

                    // Gövde/Taban Ayrım
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 3.8, sW + 0.4, 0.25);

                    // ENCAP Taban
                    ctx.fillStyle = whiteCol;
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.2, 3.9, sW + 0.4, soleH, 0.4);
                    ctx.fill();
                    ctx.fillStyle = '#e2e8f0';
                    ctx.fillRect(sX, 3.9, 3.2, 1.3);

                    // Dış Taban
                    ctx.fillStyle = blackCol;
                    ctx.beginPath();
                    ctx.roundRect(sX, 3.9 + soleH, sW, 0.6, [0, 0, 0.6, 0.6]);
                    ctx.fill();

                } else if (isBack) {
                    // --------------------------------------------------------
                    // C) ARKA (7.4px En & TPU Stabilizer Kalkanı)
                    // --------------------------------------------------------
                    const sW = 7.4;
                    const sX = -sW / 2;
                    const soleH = 1.7;

                    // Boğaz & Ense Dolgusu
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 1.0, 0.0, sW - 2.0, 1.1, 0.4);
                    ctx.fill();

                    // 3M Reflektörlü Topuk Paneli
                    ctx.fillStyle = '#f1f5f9';
                    ctx.beginPath();
                    ctx.roundRect(sX + 1.2, 0.8, sW - 2.4, 1.2, 0.3);
                    ctx.fill();
                    // Mini "NB" yazısı
                    ctx.fillStyle = '#dc2626';
                    ctx.fillRect(-0.8, 1.1, 1.6, 0.5);

                    // Süet Topuk Kalkanı
                    ctx.fillStyle = suedeMain;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.2, 1.6, sW - 0.4, 2.3, 0.4);
                    ctx.fill();

                    // TPU Stabilizer Çerçevesi
                    ctx.fillStyle = tpuClipCol;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.4, 2.5, sW - 0.8, 1.4, 0.3);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(0,0,0,0.2)';
                    ctx.fillRect(sX + 0.4, 2.5, sW - 0.8, 0.25);

                    // Gövde/Taban Ayrım
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 3.9, sW + 0.4, 0.25);

                    // ENCAP Taban
                    ctx.fillStyle = '#e2e8f0';
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.2, 4.0, sW + 0.4, soleH, 0.4);
                    ctx.fill();
                    ctx.fillStyle = whiteCol;
                    ctx.fillRect(sX + 0.4, 4.4, sW - 0.8, 0.9);

                    // Dış Taban
                    ctx.fillStyle = blackCol;
                    ctx.beginPath();
                    ctx.roundRect(sX, 4.0 + soleH, sW, 0.6, [0, 0, 0.6, 0.6]);
                    ctx.fill();

                } else {
                    // --------------------------------------------------------
                    // D) ÖN (GÜNEY - 7.4px En & 1.8px Taban)
                    // --------------------------------------------------------
                    const frontW = 7.4;
                    const sX = -frontW / 2;
                    const soleH = 1.8;

                    // 1. Düşük Yaka (Arka Astar)
                    ctx.fillStyle = '#09090b';
                    ctx.beginPath();
                    ctx.roundRect(sX + 1.2, -0.2, frontW - 2.4, 1.2, [0.5, 0.5, 0, 0]);
                    ctx.fill();

                    // 2. Dil & Kırmızı/Beyaz NB Etiketi
                    ctx.fillStyle = meshBase;
                    ctx.beginPath();
                    ctx.roundRect(-1.3, -1.0, 2.6, 1.5, 0.4);
                    ctx.fill();
                    ctx.fillStyle = '#dc2626';
                    ctx.fillRect(-0.9, -0.9, 1.8, 0.6);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-0.5, -0.8, 1.0, 0.3);

                    // 3. Nefes Alan File Burun Paneli (Mesh Vamp) - Önce Çizilir!
                    ctx.fillStyle = meshBase;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.6, 1.1, frontW - 1.2, 2.4, [0.8, 0.8, 0.3, 0.3]);
                    ctx.fill();
                    // 3M Reflektif Ön Çizgi
                    ctx.fillStyle = '#f1f5f9';
                    ctx.fillRect(-0.8, 2.7, 1.6, 0.35);

                    // 4. Süet Ön Burun Çamurluğu (U-Wrap Mudguard - 2.2px)
                    ctx.fillStyle = suedeMain;
                    ctx.beginPath();
                    ctx.roundRect(sX + 0.2, 2.2, frontW - 0.4, 2.2, [0.7, 0.7, 0.3, 0.3]);
                    ctx.fill();
                    // Ön burun kauçuk tırmanış ucu (Toe Bumper)
                    ctx.fillStyle = blackCol;
                    ctx.fillRect(-1.1, 4.0, 2.2, 0.4);

                    // 5. Süet Eyestay Kanalı (Vamp Üzerine Biner)
                    ctx.fillStyle = suedeDark;
                    ctx.beginPath();
                    ctx.roundRect(-1.5, 0.0, 3.0, 2.3, 0.3);
                    ctx.fill();
                    // Kuşgözü delikleri
                    ctx.fillStyle = '#cbd5e1';
                    ctx.fillRect(-1.4, 0.35, 0.3, 0.3); ctx.fillRect(1.1, 0.35, 0.3, 0.3);
                    ctx.fillRect(-1.4, 0.85, 0.3, 0.3); ctx.fillRect(1.1, 0.85, 0.3, 0.3);
                    ctx.fillRect(-1.4, 1.35, 0.3, 0.3); ctx.fillRect(1.1, 1.35, 0.3, 0.3);
                    ctx.fillRect(-1.4, 1.85, 0.3, 0.3); ctx.fillRect(1.1, 1.85, 0.3, 0.3);

                    // 6. 4 Sıra Sporcu Koşu Bağcığı (Crisp Laces)
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(-1.1, 0.35, 2.2, 0.3);
                    ctx.fillRect(-1.1, 0.85, 2.2, 0.3);
                    ctx.fillRect(-1.1, 1.35, 2.2, 0.3);
                    ctx.fillRect(-1.1, 1.85, 2.2, 0.3);

                    // 7. Gövde/Taban Ayrım Çizgisi (0.25px Derinlik)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                    ctx.fillRect(sX - 0.2, 4.3, frontW + 0.4, 0.25);

                    // 8. Çift Tonlu ENCAP Taban (1.8px Midsole)
                    ctx.fillStyle = whiteCol;
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.3, 4.4, frontW + 0.6, soleH, [0.4, 0.4, 0.4, 0.4]);
                    ctx.fill();
                    // Yan ENCAP gri vurgusu
                    ctx.fillStyle = '#e2e8f0';
                    ctx.fillRect(sX - 0.3, 4.4, 1.0, 1.0);
                    ctx.fillRect(sX + frontW - 0.7, 4.4, 1.0, 1.0);

                    // 9. Siyah Dış Taban Lastiği (0.6px)
                    ctx.fillStyle = blackCol;
                    ctx.beginPath();
                    ctx.roundRect(sX - 0.2, 6.2, frontW + 0.4, 0.6, [0, 0, 0.6, 0.6]);
                    ctx.fill();
                }

                // Far Leg Shadow (Gölge efekti)
                if (isFar) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                    ctx.beginPath();
                    ctx.roundRect(-legW / 2 - 0.5, -legLen, legW + (isProfile ? 3.4 : 1.0), legLen + 4.2, 2);
                    ctx.fill();
                }
                ctx.restore();
                return;
            }

            if (isK2GothBoots || isK2CyberChic) {
                // GOTİK KALIN TABAN PLATFORM BOT (Gothic Chunky Creeper Boots)
                const bootShaftW = isProfile ? 5.8 : 5.0;
                // Bot Koncu / Boğazı (Ankle Shaft)
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                ctx.roundRect(-bootShaftW / 2, -2.5, bootShaftW, 3.2, 0.5);
                ctx.fill();

                // Çift Gümüş Metalik Kemer & Toka (Buckle Straps)
                ctx.fillStyle = "#18181b";
                ctx.fillRect(-bootShaftW / 2 - 0.2, -1.8, bootShaftW + 0.4, 0.9);
                ctx.fillRect(-bootShaftW / 2 - 0.2, -0.4, bootShaftW + 0.4, 0.9);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(isProfile ? 1.0 : -0.5, -2.0, 1.2, 1.3);
                ctx.fillRect(isProfile ? 1.0 : -0.5, -0.6, 1.2, 1.3);

                // Bot Gövdesi
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(shoeStartX, 0);
                    ctx.lineTo(shoeStartX + shoeW, 0);
                    ctx.lineTo(shoeStartX + shoeW, 1.6);
                    ctx.lineTo(shoeStartX, 1.6);
                } else {
                    ctx.roundRect(shoeStartX, 0, shoeW, 2.0, [1.0, 1.0, 0.5, 0.5]);
                }
                ctx.closePath();
                ctx.fill();

                // Kalın Platform Taban (3.4px Lugged Platform Sole)
                ctx.fillStyle = "#000000";
                ctx.beginPath();
                const soleStartX = shoeStartX - 0.4;
                const soleW = shoeW + 0.8;
                ctx.roundRect(soleStartX, 1.6, soleW, 2.4, [0.4, 0.4, 0.8, 0.8]);
                ctx.fill();

                // Gümüş Ön Burun Metal Plaka
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(isProfile ? shoeStartX + shoeW - 1.2 : -1.2, 1.8, isProfile ? 1.2 : 2.4, 1.0);

                // Taban Dişleri
                ctx.strokeStyle = "#27272a";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                const lugStep = soleW / 4;
                for (let i = 1; i <= 3; i++) {
                    const lx = soleStartX + i * lugStep;
                    ctx.moveTo(lx, 2.8); ctx.lineTo(lx, 4.0);
                }
                ctx.stroke();

                // Far Leg Shadow
                if (isFar) {
                    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                    ctx.beginPath();
                    ctx.roundRect(-legW / 2 - 0.5, -legLen, legW + (isProfile ? 3.4 : 1.0), legLen + 4.2, 2);
                    ctx.fill();
                }
                ctx.restore();
                return;
            }

            const neonCol = isSkateShoes ? "#d97706" : (isK2Shoes ? "#0ea5e9" : "#0284c7"); // Skate için gum sakız taban, K2 için siber neon

            // A) Sneaker Üst Gövdesi (Upper Body - Katmanlı Deri/Mesh veya Skater Turuncu/Süet)
            ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a"; // Kaykay ayakkabısında canlı turuncu panel
            ctx.beginPath();
            if (isProfile) {
                // Profilde burun yukarı hafif kıvrık dinamik form (toe spring)
                ctx.moveTo(shoeStartX, 0.2); // Topuk üstü
                ctx.lineTo(shoeStartX - 0.3, 1.6); // Topuk arka bombesi
                ctx.lineTo(shoeStartX + shoeW, 1.6); // Burun altı
                ctx.quadraticCurveTo(shoeStartX + shoeW + 0.4, 0.9, shoeStartX + shoeW - 1.2, 0.2); // Kavisli burun ucu
                ctx.lineTo(shoeStartX + 2.2, 0.1); // Boğaz girişi
                ctx.lineTo(shoeStartX, 0.2);
            } else if (isDiagonal) {
                ctx.roundRect(shoeStartX, 0, shoeW, 2.2, [1.4, 2.2, 0.8, 0.8]);
            } else if (isBack) {
                // Arkadan bakışta topuk kalkanı (heel counter)
                ctx.roundRect(shoeStartX, 0, shoeW, 2.2, [1.2, 1.2, 0.8, 0.8]);
            } else {
                // Önden bakış
                ctx.roundRect(shoeStartX, 0, shoeW, 2.2, [1.5, 1.5, 0.8, 0.8]);
            }
            ctx.closePath();
            ctx.fill();

            // Yan Deri/Teknik Panel Katmanı & Süet Burun Koruma
            ctx.fillStyle = isSkateShoes ? "#0f172a" : "#1e293b"; // Skater ayakkabısında siyah süet burun / ollie koruması
            if (isProfile) {
                ctx.beginPath();
                if (isSkateShoes) {
                    // Skater süet burun
                    ctx.roundRect(shoeStartX + shoeW - 3.8, 0.2, 3.8, 1.5, 0.6);
                } else {
                    ctx.roundRect(shoeStartX + 0.8, 0.3, shoeW - 2.8, 1.3, 0.6);
                }
                ctx.fill();
            } else if (!isBack) {
                ctx.beginPath();
                if (isSkateShoes) {
                    ctx.roundRect(shoeStartX + 0.6, 1.1, shoeW - 1.2, 1.1, 0.5);
                } else {
                    ctx.roundRect(shoeStartX + 0.6, 0.3, shoeW - 1.2, 1.2, 0.6);
                }
                ctx.fill();
            }

            // Sneaker Bağcıkları & Dil (Laces & Tongue)
            if (!isBack) {
                ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#e2e8f0"; // Skater için neon yeşil bağcıklar
                ctx.lineWidth = 0.65;
                ctx.beginPath();
                if (isProfile) {
                    // Profilde öne bakan 2 mikro bağcık çizgisi
                    ctx.moveTo(shoeStartX + 3.0, 0.4); ctx.lineTo(shoeStartX + 4.2, 0.9);
                    ctx.moveTo(shoeStartX + 4.4, 0.5); ctx.lineTo(shoeStartX + 5.6, 1.0);
                } else if (isDiagonal) {
                    ctx.moveTo(shoeStartX + 2.0, 0.4); ctx.lineTo(shoeStartX + 3.6, 0.9);
                    ctx.moveTo(shoeStartX + 3.6, 0.4); ctx.lineTo(shoeStartX + 5.2, 0.9);
                } else {
                    // Tam önden yatay bağcıklar
                    ctx.moveTo(shoeStartX + 1.8, 0.5); ctx.lineTo(shoeStartX + shoeW - 1.8, 0.5);
                    ctx.moveTo(shoeStartX + 2.0, 1.1); ctx.lineTo(shoeStartX + shoeW - 2.0, 1.1);
                }
                ctx.stroke();
            } else {
                // Arkadan dikey topuk dikişi & topuk çekme halkası
                ctx.fillStyle = isSkateShoes ? "#ea580c" : "#334155";
                ctx.fillRect(0, 0.2, 0.8, 1.8);
                // Topuk arkası çekme kulağı (Heel pull-tab)
                ctx.fillStyle = isSkateShoes ? "#22c55e" : neonCol;
                ctx.fillRect(-0.4, -0.6, 0.8, 0.9);
            }

            // Profilde Topuk Çekme Kulağı
            if (isProfile) {
                ctx.fillStyle = isSkateShoes ? "#22c55e" : neonCol;
                ctx.fillRect(shoeStartX - 0.4, -0.4, 0.8, 0.9);
            }

            // B) Kalın Heykelsi Chunky Taban (Sculpted Sole)
            ctx.fillStyle = sneakerColor;
            ctx.beginPath();
            const soleStartX = shoeStartX - 0.3;
            const soleW = shoeW + 0.6;
            if (isProfile) {
                // Profilde topukta kalın (2.4px), buruna doğru incelen (1.6px) ve burun ucu kalkık taban
                ctx.moveTo(soleStartX, 1.4);
                ctx.lineTo(soleStartX + soleW, 1.4);
                ctx.lineTo(soleStartX + soleW - 0.2, 2.9); // Burun ucu kalkıklığı
                ctx.lineTo(soleStartX + soleW * 0.45, 3.2); // Taban oyuğu (arch)
                ctx.lineTo(soleStartX, 3.4); // Kalın chunky topuk tabanı
                ctx.closePath();
            } else {
                // Önden / arkadan / çaprazdan zemine doğru genişleyen (flared) stabil taban
                ctx.roundRect(soleStartX, 1.4, soleW, 2.0, [0.6, 0.6, 1.0, 1.0]);
            }
            ctx.fill();

            // C) Cyber Neon / Skater Gum Taban Vurgu Şeridi
            ctx.fillStyle = neonCol;
            if (isProfile) {
                ctx.fillRect(soleStartX + 0.4, 2.2, soleW - 1.2, 0.65);
            } else {
                ctx.fillRect(soleStartX + 0.2, 2.3, soleW - 0.4, 0.65);
            }

            // D) Dişli Dış Taban (Lugged Outsole & Zemin Temas Çizgisi)
            ctx.fillStyle = isSkateShoes ? "#78350f" : "#0f172a"; // Skater için klasik kahverengi sakız taban
            ctx.fillRect(soleStartX + 0.2, 3.2, soleW - 0.4, 0.55);

            // Taban dişleri (Micro tread lugs)
            ctx.strokeStyle = sneakerColor;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            const lugStep = soleW / 4;
            for (let i = 1; i <= 3; i++) {
                const lx = soleStartX + i * lugStep;
                ctx.moveTo(lx, 3.2); ctx.lineTo(lx, 3.75);
            }
            ctx.stroke();

            
            if (isK2CatCostume) {
                const catBootieFn = this.drawCatPawBootie || (typeof Karakter2Renderer !== 'undefined' && Karakter2Renderer.drawCatPawBootie) || (typeof K2Torso !== 'undefined' && K2Torso.drawCatPawBootie);
                if (typeof catBootieFn === 'function') {
                    catBootieFn.call(this, ctx, shoeStartX, shoeW, cargoColor, isProfile, isDiagonal, isBack, isFar);
                }
            }

            // Arka bacak derinlik gölgesi (Far Leg Shadow)
            if (isFar) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                ctx.beginPath();
                ctx.roundRect(-legW / 2 - 0.5, -legLen, legW + (isProfile ? 3.4 : 1.0), legLen + 4.2, 2);
                ctx.fill();
            }

            ctx.restore();
        }

        static drawSittingCargoLegs(ctx, facing, cargoColor, sneakerColor, isK2Shoes, skinColor, isFemale, isSkaterPants = false, isSkateShoes = false, isK2HighSneakers = false, highSneakerAccent = '#dc2626', isK2NbRunner = false, runnerAccent = 'original', isSkirt = false, isK2GothBoots = false, isK2GothFishnet = false, isK2GothDress = false, isK2CyberDress = false, isK2CyberChic = false, isBarefoot = false) {
            ctx.save();
            const legW = isFemale ? 4.8 : 6.2;
            const legFill = isSkirt ? skinColor : cargoColor;
            ctx.fillStyle = legFill;
            const neonCol = isSkateShoes ? "#d97706" : (isK2Shoes ? "#0ea5e9" : "#0284c7");

            if (facing === 'right') {
                // Sağa dönük oturma: Uyluk yatay, kaval dikey
                ctx.beginPath();
                ctx.roundRect(-4.0, 7.0, 13.0, legW, [3, 4, 2, 2]);
                ctx.fill();

                // Dikey bacak (kaval)
                ctx.beginPath();
                ctx.roundRect(4.5, 11.0, legW, 5.8, [1, 1, 1, 1]);
                ctx.fill();

                if (isSkirt) {
                    if (isK2GothDress || isK2GothFishnet) {
                        // Gotik yarı saydam file/çorap
                        ctx.fillStyle = "rgba(24, 17, 36, 0.35)";
                        ctx.beginPath();
                        ctx.roundRect(-4.0, 7.0, 13.0, legW, [3, 4, 2, 2]);
                        ctx.fill();
                        ctx.beginPath();
                        ctx.roundRect(4.5, 11.0, legW, 5.8, [1, 1, 1, 1]);
                        ctx.fill();
                        // Jartiyer halkası
                        ctx.fillStyle = "#09090b";
                        ctx.fillRect(0.5, 7.0, 1.8, legW);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.arc(1.4, 7.0 + legW / 2, 0.9, 0, Math.PI * 2);
                        ctx.stroke();
                    } else if (isK2CyberChic) {
                        // Cyber Chic şeffaf lila çorap
                        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
                        ctx.beginPath();
                        ctx.roundRect(4.5, 11.0, legW, 5.8, [1, 1, 1, 1]);
                        ctx.fill();
                        ctx.fillStyle = "#c084fc";
                        ctx.fillRect(4.5, 10.5, legW, 1.4);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.strokeRect(4.5 + legW / 2 - 0.7, 10.5, 1.4, 1.4);
                    }
                } else {
                    // Skater Diz Eskitme
                    if (isSkaterPants) {
                        ctx.fillStyle = "#18181b";
                        ctx.fillRect(5.5, 10.2, legW - 2.0, 1.2);
                        // Skater salaş dökümlü paça
                        ctx.fillStyle = cargoColor;
                        ctx.beginPath();
                        ctx.roundRect(4.2, 15.2, legW + 0.8, 2.2, [0.4, 0.4, 1.0, 1.0]);
                        ctx.fill();
                        ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(4.6, 16.0); ctx.lineTo(4.6 + legW, 16.0);
                        ctx.stroke();
                    } else {
                        // Paça ribanası
                        ctx.fillStyle = "#0f172a";
                        ctx.beginPath();
                        ctx.roundRect(4.6, 15.6, legW - 0.4, 1.4, 0.4);
                        ctx.fill();
                    }
                }

                if (isBarefoot) {
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.roundRect(4.0, 17.0, 8.2, 2.0, [1.0, 1.6, 0.6, 0.6]);
                    ctx.fill();
                    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
                    ctx.fillRect(8.0, 18.2, 3.6, 0.6);
                } else if (isK2GothBoots || isK2CyberChic) {
                    // Gotik Kalın Taban Bot Profil
                    const bootShaftW = legW + 0.4;
                    ctx.fillStyle = "#09090b";
                    ctx.beginPath();
                    ctx.roundRect(4.3, 14.2, bootShaftW, 3.2, 0.5);
                    ctx.fill();
                    ctx.fillStyle = "#cbd5e1";
                    ctx.fillRect(7.2, 14.8, 1.4, 1.2);
                    ctx.fillStyle = "#09090b";
                    ctx.beginPath();
                    ctx.roundRect(3.8, 17.0, 8.8, 2.0, [1.2, 2.2, 0.6, 0.6]);
                    ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath();
                    ctx.roundRect(3.4, 18.8, 9.4, 2.4, [0.6, 0.6, 0.8, 0.8]);
                    ctx.fill();
                    ctx.fillStyle = "#cbd5e1";
                    ctx.fillRect(11.2, 19.2, 1.2, 1.2);
                } else if (isK2HighSneakers) {
                    const accentCol = highSneakerAccent || '#dc2626';
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(4.2, 14.8, 6.2, 2.4, 0.5);
                    ctx.fill();
                    ctx.fillStyle = '#18181b';
                    ctx.fillRect(4.4, 14.5, 5.8, 0.8);
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(4.0, 17.0, 8.2, 2.0, [1.2, 2.2, 0.6, 0.6]);
                    ctx.fill();
                    ctx.fillStyle = '#18181b';
                    ctx.beginPath();
                    ctx.moveTo(5.0, 17.5); ctx.lineTo(8.0, 18.2); ctx.lineTo(10.5, 17.4);
                    ctx.lineTo(8.2, 18.6); ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = accentCol;
                    ctx.beginPath();
                    ctx.roundRect(8.8, 17.2, 3.4, 1.8, 0.6);
                    ctx.fill();
                    ctx.strokeStyle = '#18181b';
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(6.8, 15.6); ctx.lineTo(8.2, 16.0);
                    ctx.moveTo(7.2, 17.4); ctx.lineTo(8.6, 17.8);
                    ctx.stroke();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.roundRect(3.8, 18.8, 8.8, 1.8, [0.6, 0.6, 0.8, 0.8]);
                    ctx.fill();
                    ctx.fillStyle = '#18181b';
                    ctx.fillRect(4.0, 20.4, 8.4, 0.5);
                } else {
                    ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(4.0, 17.0, 8.2, 2.0, [1.2, 2.2, 0.6, 0.6]);
                    ctx.fill();
                    if (isSkateShoes) {
                        ctx.fillStyle = "#0f172a";
                        ctx.roundRect(8.4, 17.0, 3.8, 1.8, 0.6);
                        ctx.fill();
                    }
                    ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#e2e8f0";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(7.2, 17.4); ctx.lineTo(8.6, 17.8);
                    ctx.moveTo(8.8, 17.4); ctx.lineTo(10.2, 17.8);
                    ctx.stroke();
                    ctx.fillStyle = sneakerColor;
                    ctx.beginPath();
                    ctx.roundRect(3.8, 18.8, 8.8, 1.8, [0.6, 0.6, 0.8, 0.8]);
                    ctx.fill();
                    ctx.fillStyle = neonCol;
                    ctx.fillRect(4.0, 19.6, 8.4, 0.6);
                    ctx.fillStyle = isSkateShoes ? "#78350f" : "#0f172a";
                    ctx.fillRect(4.0, 20.4, 8.4, 0.5);
                }

            } else if (facing === 'down-right') {
                // 3/4 SAĞ-AŞAĞI (İZOMETRİK ÇAPRAZ) OTURMA
                // 1. ARKA BACAK (FAR LEG)
                ctx.save();
                ctx.fillStyle = legFill;
                ctx.beginPath();
                ctx.moveTo(1.0, 5.5);
                ctx.lineTo(7.5, 8.8);
                ctx.lineTo(5.5, 13.5);
                ctx.lineTo(-0.5, 10.2);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
                ctx.beginPath();
                ctx.moveTo(1.0, 5.5); ctx.lineTo(7.5, 8.8); ctx.lineTo(5.5, 13.5); ctx.lineTo(-0.5, 10.2); ctx.closePath();
                ctx.fill();

                // Uzak Kaval
                ctx.fillStyle = legFill;
                ctx.beginPath();
                ctx.roundRect(4.6, 9.8, legW - 0.8, 6.2, [1, 2, 1, 1]);
                ctx.fill();
                ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
                ctx.fill();

                if (!isSkirt) {
                    // Uzak Paça Ribanası
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(4.4, 15.4, legW - 0.4, 1.4, 0.4);
                    ctx.fill();
                }

                // Uzak Ayakkabı
                if (isBarefoot) {
                    ctx.save();
                    ctx.translate(7.0, 17.6);
                    ctx.rotate(0.35);
                    ctx.fillStyle = skinColor;
                    ctx.beginPath(); ctx.ellipse(0, -0.8, 4.0, 2.0, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
                    ctx.fillRect(-2.0, 0.4, 4.0, 0.5);
                    ctx.restore();
                } else if (isK2GothBoots || isK2CyberChic) {
                    ctx.save();
                    ctx.translate(7.0, 17.6);
                    ctx.rotate(0.35);
                    ctx.fillStyle = "#09090b";
                    ctx.beginPath(); ctx.ellipse(0, -1.2, 4.6, 2.2, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath(); ctx.roundRect(-4.4, 0.2, 8.8, 2.2, 0.6); ctx.fill();
                    ctx.fillStyle = "#cbd5e1";
                    ctx.fillRect(1.5, -0.6, 1.6, 1.2);
                    ctx.restore();
                } else if (isK2HighSneakers) {
                    const accentCol = highSneakerAccent || '#dc2626';
                    ctx.save();
                    ctx.translate(7.2, 17.6);
                    ctx.rotate(0.35);
                    ctx.fillStyle = accentCol;
                    ctx.beginPath(); ctx.ellipse(0, -1.0, 4.2, 2.2, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath(); ctx.roundRect(-4.0, 0, 8.0, 1.8, 0.6); ctx.fill();
                    ctx.fillStyle = '#18181b';
                    ctx.fillRect(-3.8, 1.4, 7.6, 0.5);
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.translate(7.0, 17.6);
                    ctx.rotate(0.35);
                    ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                    ctx.beginPath(); ctx.ellipse(0, -1.0, 4.4, 2.2, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = sneakerColor;
                    ctx.beginPath(); ctx.roundRect(-4.2, 0, 8.4, 1.8, 0.6); ctx.fill();
                    ctx.fillStyle = neonCol;
                    ctx.fillRect(-4.0, 0.8, 8.0, 0.5);
                    ctx.fillStyle = "#0f172a";
                    ctx.fillRect(-4.0, 1.4, 8.0, 0.5);
                    ctx.restore();
                }
                ctx.restore();

                // 2. ÖN BACAK (NEAR LEG)
                ctx.fillStyle = legFill;
                ctx.beginPath();
                ctx.moveTo(-5.0, 6.2);
                ctx.lineTo(2.2, 9.8);
                ctx.lineTo(-0.2, 15.0);
                ctx.lineTo(-6.8, 11.2);
                ctx.closePath();
                ctx.fill();

                if (isSkirt) {
                    if (isK2GothDress || isK2GothFishnet) {
                        ctx.fillStyle = "rgba(24, 17, 36, 0.35)";
                        ctx.beginPath();
                        ctx.moveTo(-5.0, 6.2); ctx.lineTo(2.2, 9.8); ctx.lineTo(-0.2, 15.0); ctx.lineTo(-6.8, 11.2); ctx.closePath();
                        ctx.fill();
                    } else if (isK2CyberChic) {
                        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
                        ctx.beginPath();
                        ctx.moveTo(-5.0, 6.2); ctx.lineTo(2.2, 9.8); ctx.lineTo(-0.2, 15.0); ctx.lineTo(-6.8, 11.2); ctx.closePath();
                        ctx.fill();
                    }
                } else {
                    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
                    ctx.beginPath();
                    ctx.moveTo(-4.5, 6.4); ctx.lineTo(2.0, 9.8); ctx.lineTo(1.2, 11.2); ctx.lineTo(-5.0, 7.8); ctx.closePath();
                    ctx.fill();

                    // Kargo Pantolon Yan Cep
                    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
                    ctx.beginPath();
                    ctx.moveTo(-4.0, 8.8); ctx.lineTo(0.5, 11.0); ctx.lineTo(-0.2, 14.2); ctx.lineTo(-4.6, 12.0); ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = "#0f172a";
                    ctx.fillRect(-3.8, 8.6, 4.4, 1.0);
                }

                // Yakın Kaval
                ctx.fillStyle = legFill;
                ctx.beginPath();
                ctx.roundRect(-0.2, 10.6, legW, 6.2, [2, 2, 1, 1]);
                ctx.fill();

                if (isSkirt) {
                    if (isK2GothDress || isK2GothFishnet) {
                        ctx.fillStyle = "rgba(24, 17, 36, 0.35)";
                        ctx.beginPath();
                        ctx.roundRect(-0.2, 10.6, legW, 6.2, [2, 2, 1, 1]);
                        ctx.fill();
                    } else if (isK2CyberChic) {
                        ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
                        ctx.beginPath();
                        ctx.roundRect(-0.2, 10.6, legW, 6.2, [2, 2, 1, 1]);
                        ctx.fill();
                    }
                } else {
                    if (isSkaterPants) {
                        ctx.fillStyle = "#18181b";
                        ctx.fillRect(0.8, 10.2, legW - 1.8, 1.2);
                    }
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(-0.4, 16.2, legW + 0.4, 1.4, 0.4);
                    ctx.fill();
                }

                // Yakın Ayakkabı
                if (isBarefoot) {
                    ctx.save();
                    ctx.translate(2.2, 18.8);
                    ctx.rotate(0.38);
                    ctx.fillStyle = skinColor;
                    ctx.beginPath(); ctx.ellipse(0, -0.8, 4.6, 2.0, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
                    ctx.fillRect(-2.2, 0.4, 4.4, 0.5);
                    ctx.restore();
                } else if (isK2GothBoots || isK2CyberChic) {
                    ctx.save();
                    ctx.translate(2.2, 18.8);
                    ctx.rotate(0.38);
                    ctx.fillStyle = "#09090b";
                    ctx.beginPath(); ctx.ellipse(0, -1.2, 5.2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#000000";
                    ctx.beginPath(); ctx.roundRect(-5.2, 0.8, 10.4, 2.4, [0.8, 0.8, 0.8, 0.8]); ctx.fill();
                    ctx.fillStyle = "#cbd5e1";
                    ctx.fillRect(1.5, -0.6, 1.8, 1.3);
                    ctx.restore();
                } else if (isK2HighSneakers) {
                    const accentCol = highSneakerAccent || '#dc2626';
                    ctx.save();
                    ctx.translate(2.5, 18.8);
                    ctx.rotate(0.38);
                    ctx.fillStyle = accentCol;
                    ctx.beginPath(); ctx.ellipse(0, -1.2, 5.0, 2.4, 0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath(); ctx.roundRect(-4.8, -0.2, 9.6, 2.2, [1.0, 1.6, 0.6, 0.6]); ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath(); ctx.roundRect(-5.0, 1.2, 10.0, 1.8, 0.6); ctx.fill();
                    ctx.fillStyle = '#18181b';
                    ctx.fillRect(-4.8, 2.6, 9.6, 0.6);
                    ctx.restore();
                } else {
                    ctx.save();
                    ctx.translate(2.2, 18.8);
                    ctx.rotate(0.38);
                    ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                    ctx.beginPath(); ctx.ellipse(0, -1.2, 5.2, 2.4, 0, 0, Math.PI * 2); ctx.fill();
                    if (isSkateShoes) {
                        ctx.fillStyle = "#0f172a";
                        ctx.beginPath(); ctx.arc(3.4, -1.0, 2.0, 0, Math.PI * 2); ctx.fill();
                    }
                    ctx.fillStyle = sneakerColor;
                    ctx.beginPath(); ctx.roundRect(-5.2, 0.8, 10.4, 2.0, [0.8, 0.8, 0.8, 0.8]); ctx.fill();
                    ctx.fillStyle = neonCol;
                    ctx.fillRect(-5.0, 1.8, 10.0, 0.6);
                    ctx.fillStyle = isSkateShoes ? "#78350f" : "#0f172a";
                    ctx.fillRect(-5.0, 2.6, 10.0, 0.5);
                    ctx.restore();
                }

            } else {
                // Tam öne oturma (down)
                [-4.8, 4.8].forEach(lx => {
                    ctx.fillStyle = legFill;
                    ctx.beginPath();
                    ctx.roundRect(lx - legW / 2, 7.0, legW, 9.0, [2, 2, 1, 1]);
                    ctx.fill();

                    if (isSkirt) {
                        if (isK2GothDress || isK2GothFishnet) {
                            ctx.fillStyle = "rgba(24, 17, 36, 0.35)";
                            ctx.beginPath();
                            ctx.roundRect(lx - legW / 2, 7.0, legW, 9.0, [2, 2, 1, 1]);
                            ctx.fill();
                        } else if (isK2CyberChic) {
                            ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
                            ctx.beginPath();
                            ctx.roundRect(lx - legW / 2, 7.0, legW, 9.0, [2, 2, 1, 1]);
                            ctx.fill();
                        }
                    } else {
                        if (isSkaterPants) {
                            ctx.fillStyle = "#18181b";
                            ctx.fillRect(lx - legW / 2 + 1.2, 11.5, legW - 2.4, 1.2);
                            ctx.fillStyle = cargoColor;
                            ctx.beginPath();
                            ctx.roundRect(lx - legW / 2 - 0.4, 15.4, legW + 0.8, 2.2, [0.4, 0.4, 1.0, 1.0]);
                            ctx.fill();
                            ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
                            ctx.lineWidth = 0.6;
                            ctx.beginPath();
                            ctx.moveTo(lx - legW / 2, 16.2); ctx.lineTo(lx + legW / 2, 16.2);
                            ctx.stroke();
                        } else {
                            ctx.fillStyle = "#0f172a";
                            ctx.beginPath();
                            ctx.roundRect(lx - legW / 2 + 0.3, 15.8, legW - 0.6, 1.4, 0.4);
                            ctx.fill();
                        }
                    }

                    if (isBarefoot) {
                        ctx.fillStyle = skinColor;
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2, 17.0, legW, 2.0, [1.0, 1.0, 0.6, 0.6]);
                        ctx.fill();
                        ctx.fillStyle = "rgba(0, 0, 0, 0.12)";
                        ctx.fillRect(lx - legW / 2 + 0.6, 18.2, legW - 1.2, 0.5);
                    } else if (isK2GothBoots || isK2CyberChic) {
                        ctx.fillStyle = "#09090b";
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.2, 16.6, legW + 0.4, 2.4, [1.0, 1.0, 0.5, 0.5]);
                        ctx.fill();
                        ctx.fillStyle = "#000000";
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.4, 18.8, legW + 0.8, 2.2, [0.5, 0.5, 0.8, 0.8]);
                        ctx.fill();
                        ctx.fillStyle = "#cbd5e1";
                        ctx.fillRect(lx - 0.7, 16.8, 1.4, 1.2);
                    } else if (isK2HighSneakers) {
                        const accentCol = highSneakerAccent || '#dc2626';
                        ctx.fillStyle = accentCol;
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.2, 15.0, legW + 0.4, 2.2, 0.5);
                        ctx.fill();
                        ctx.fillStyle = '#18181b';
                        ctx.fillRect(lx - legW / 2 + 0.2, 14.6, legW - 0.4, 0.7);
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.2, 17.0, legW + 0.4, 2.0, [1.4, 1.4, 0.6, 0.6]);
                        ctx.fill();
                        ctx.fillStyle = accentCol;
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 + 0.2, 17.8, legW - 0.4, 1.2, 0.4);
                        ctx.fill();
                        ctx.strokeStyle = '#18181b';
                        ctx.lineWidth = 0.65;
                        ctx.beginPath();
                        ctx.moveTo(lx - 1.2, 16.0); ctx.lineTo(lx + 1.2, 16.0);
                        ctx.moveTo(lx - 1.4, 17.4); ctx.lineTo(lx + 1.4, 17.4);
                        ctx.stroke();
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.4, 18.8, legW + 0.8, 1.8, [0.6, 0.6, 0.8, 0.8]);
                        ctx.fill();
                        ctx.fillStyle = '#18181b';
                        ctx.fillRect(lx - legW / 2 - 0.3, 20.4, legW + 0.6, 0.5);
                    } else {
                        ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.2, 17.0, legW + 0.4, 2.0, [1.4, 1.4, 0.6, 0.6]);
                        ctx.fill();
                        ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#e2e8f0";
                        ctx.lineWidth = 0.6;
                        ctx.beginPath();
                        ctx.moveTo(lx - 1.2, 17.5); ctx.lineTo(lx + 1.2, 17.5);
                        ctx.stroke();
                        ctx.fillStyle = sneakerColor;
                        ctx.beginPath();
                        ctx.roundRect(lx - legW / 2 - 0.4, 18.8, legW + 0.8, 1.8, [0.6, 0.6, 0.8, 0.8]);
                        ctx.fill();
                        ctx.fillStyle = neonCol;
                        ctx.fillRect(lx - legW / 2 - 0.3, 19.6, legW + 0.6, 0.6);
                        ctx.fillStyle = isSkateShoes ? "#78350f" : "#0f172a";
                        ctx.fillRect(lx - legW / 2 - 0.3, 20.4, legW + 0.6, 0.5);
                    }
                });
            }

            ctx.restore();
        }

        static drawCrossLeggedFloorCargoLegs(ctx, facing, cargoColor, sneakerColor, isK2Shoes, skinColor, isFemale, isSkaterPants = false, isSkateShoes = false) {
            ctx.save();
            const neonCol = isSkateShoes ? "#d97706" : (isK2Shoes ? "#0ea5e9" : "#0284c7");
            const isRight = (facing === 'right' || facing === 'down-right');
            const isBack = (facing === 'up' || facing === 'up-right' || facing === 'up-left');

            // 0. Genişletilmiş Zemin Gölgesi (Bağdaş kuran bacakların altı)
            ctx.fillStyle = "rgba(15, 23, 42, 0.42)";
            ctx.beginPath();
            ctx.ellipse(0, 18.2, 17.5, 6.2, 0, 0, Math.PI * 2);
            ctx.fill();

            if (isBack) {
                // Arkadan bağdaş kurma: kalça arkası ve iki yana açılan dizler
                ctx.fillStyle = cargoColor;
                ctx.beginPath();
                ctx.roundRect(-14.0, 11.5, 14.5, 6.8, [4, 2, 4, 3]);
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(-0.5, 11.5, 14.5, 6.8, [2, 4, 3, 4]);
                ctx.fill();

                // Orta dikiş ve kumaş kıvrımı
                ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, 10.5); ctx.lineTo(0, 17.5);
                ctx.stroke();

                // İki yanda arkadan görünen sneaker topukları
                [-12.2, 12.2].forEach(sx => {
                    ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(sx - 3.2, 15.2, 6.4, 3.2, 1.2);
                    ctx.fill();
                    ctx.fillStyle = sneakerColor;
                    ctx.fillRect(sx - 3.2, 17.2, 6.4, 1.6);
                    ctx.fillStyle = neonCol;
                    ctx.fillRect(sx - 3.0, 17.8, 6.0, 0.6);
                });
            } else if (isRight) {
                // Sağa 3/4 açılı bağdaş:
                ctx.fillStyle = cargoColor;
                ctx.beginPath();
                ctx.roundRect(-11.0, 11.0, 13.5, 6.5, [4, 3, 3, 4]);
                ctx.fill();

                ctx.beginPath();
                ctx.roundRect(-4.5, 12.2, 16.5, 6.6, [3, 4, 3, 3]);
                ctx.fill();

                // Kargo cepleri
                ctx.fillStyle = "#1e293b";
                ctx.beginPath();
                ctx.roundRect(4.0, 13.0, 4.5, 3.8, 0.8);
                ctx.fill();

                // Sağ sneaker önde yere yatay oturur
                ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                ctx.beginPath();
                ctx.roundRect(8.5, 15.0, 7.8, 2.8, [1.5, 2.0, 0.8, 0.8]);
                ctx.fill();
                ctx.fillStyle = sneakerColor;
                ctx.fillRect(8.2, 16.8, 8.4, 1.6);
                ctx.fillStyle = neonCol;
                ctx.fillRect(8.4, 17.4, 8.0, 0.6);

                // Sol sneaker arkada hafifçe gözükür
                ctx.fillStyle = isSkateShoes ? "#c2410c" : "#09090b";
                ctx.fillRect(-12.0, 14.8, 4.8, 2.4);
                ctx.fillStyle = sneakerColor;
                ctx.fillRect(-12.0, 16.5, 4.8, 1.4);
            } else {
                // TAM ÖNDEN KLASİK BAĞDAŞ KURMA (Lotus / Cross-Legged)
                // 1. Sol Bacak (Alttan çapraz geçer: sol kalçadan sağ dize doğru)
                ctx.fillStyle = cargoColor;
                ctx.save();
                ctx.translate(-5.5, 12.2);
                ctx.rotate(0.18);
                ctx.beginPath();
                ctx.roundRect(-7.5, -3.2, 17.5, 6.8, [3.5, 3.5, 2.5, 2.5]);
                ctx.fill();
                ctx.restore();

                // 2. Sağ Bacak (Üstten çapraz geçer: sağ kalçadan sol dize doğru)
                ctx.save();
                ctx.translate(5.5, 13.0);
                ctx.rotate(-0.18);
                ctx.beginPath();
                ctx.roundRect(-10.0, -3.2, 17.5, 6.8, [3.5, 3.5, 2.5, 2.5]);
                ctx.fill();
                ctx.restore();

                // Kumaş dikiş çizgileri ve derinlik gölgesi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                ctx.lineWidth = 0.9;
                ctx.beginPath();
                ctx.moveTo(-2.5, 11.5);
                ctx.quadraticCurveTo(0, 14.5, 3.5, 16.2);
                ctx.stroke();

                // Kargo cepleri
                [-12.2, 11.2].forEach((px, idx) => {
                    ctx.fillStyle = (idx === 0) ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.18)";
                    ctx.beginPath();
                    ctx.roundRect(px, 12.5, 4.2, 4.0, 0.8);
                    ctx.fill();
                });

                // Skater Diz Eskitme Yırtıkları
                if (isSkaterPants) {
                    ctx.fillStyle = "#18181b";
                    ctx.fillRect(-9.5, 12.8, 4.0, 1.2);
                    ctx.fillRect(5.5, 13.5, 4.0, 1.2);
                }

                // 3. İki yanda zemine oturmuş Chunky Sneaker Ayakkabılar
                // Sol tarafta dışarı bakan sağ ayak ucu / bileği
                ctx.save();
                ctx.translate(-11.5, 15.6);
                ctx.rotate(-0.15);
                ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                ctx.beginPath();
                ctx.roundRect(-3.5, -1.8, 7.5, 3.2, [1.4, 2.0, 0.8, 0.8]);
                ctx.fill();
                ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#f1f5f9";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(-1.5, -0.6); ctx.lineTo(1.5, -0.2);
                ctx.stroke();
                ctx.fillStyle = sneakerColor;
                ctx.fillRect(-3.6, 1.2, 7.8, 1.8);
                ctx.fillStyle = neonCol;
                ctx.fillRect(-3.5, 1.8, 7.6, 0.6);
                ctx.restore();

                // Sağ tarafta dışarı bakan sol ayak ucu / bileği
                ctx.save();
                ctx.translate(11.5, 15.6);
                ctx.rotate(0.15);
                ctx.fillStyle = isSkateShoes ? "#ea580c" : "#0f172a";
                ctx.beginPath();
                ctx.roundRect(-4.0, -1.8, 7.5, 3.2, [2.0, 1.4, 0.8, 0.8]);
                ctx.fill();
                ctx.strokeStyle = isSkateShoes ? "#22c55e" : "#f1f5f9";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(-1.5, -0.2); ctx.lineTo(1.5, -0.6);
                ctx.stroke();
                ctx.fillStyle = sneakerColor;
                ctx.fillRect(-4.2, 1.2, 7.8, 1.8);
                ctx.fillStyle = neonCol;
                ctx.fillRect(-4.1, 1.8, 7.6, 0.6);
                ctx.restore();
            }

            ctx.restore();
        }

        static drawSkateboard(ctx, facing, isMoving, now, isSprinting = false, isLeft = false) {
            ctx.save();
            ctx.translate(0, 17.5); // Ayakların tam altı, zemin seviyesi

            const isBack = (facing === 'up' || facing === 'up-right' || facing === 'up-left');
            const isProfile = (facing === 'right' || facing === 'left');
            const isDiagonal = (facing === 'down-right' || facing === 'down-left' || facing === 'up-right' || facing === 'up-left');

            // 1. Kaykay Zemin Gölgesi (Deck Shadow)
            ctx.fillStyle = "rgba(15, 23, 42, 0.38)";
            ctx.beginPath();
            if (isProfile) {
                ctx.ellipse(0, 2.5, 14.5, 3.2, 0, 0, Math.PI * 2);
            } else if (isDiagonal) {
                ctx.ellipse(0, 2.5, 13.0, 4.2, (isLeft ? 0.35 : -0.35), 0, Math.PI * 2);
            } else {
                ctx.ellipse(0, 2.5, 10.5, 5.5, 0, 0, Math.PI * 2);
            }
            ctx.fill();

            // 2. Hareket Ederken Tekerlek Dönme Hızı & Sürüş Partikülleri
            const wheelSpin = (now / 28) % (Math.PI * 2);
            if (isMoving) {
                const trailX = (isLeft ? 12 : -12);
                ctx.fillStyle = isSprinting ? "#fbbf24" : "rgba(226, 232, 240, 0.45)";
                for (let i = 0; i < 2; i++) {
                    const sparkOffset = (Math.sin(now / 40 + i) * 2.0);
                    ctx.beginPath();
                    ctx.arc(trailX + sparkOffset, 1.8 + i * 0.4, isSprinting ? 0.9 : 1.2, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // 3. Tekerlekler (4 Adet Neon Yeşil Poliüretan 54mm Sokak Tekerleği)
            const wheelCol = "#22c55e"; // Canlı neon yeşil
            const wheelCore = "#15803d";
            const truckCol = "#94a3b8"; // Metalik dingil

            if (isProfile) {
                // YATAY PROFİL GÖRÜNÜM (Sağ / Sol)
                ctx.fillStyle = truckCol;
                ctx.fillRect(-9.5, -0.5, 3.2, 2.4);
                ctx.fillRect(6.5, -0.5, 3.2, 2.4);

                [-8.0, 8.0].forEach(wx => {
                    ctx.save();
                    ctx.translate(wx, 1.5);
                    ctx.rotate(isMoving ? (isLeft ? -wheelSpin : wheelSpin) : 0);
                    ctx.fillStyle = wheelCol;
                    ctx.beginPath();
                    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = wheelCore;
                    ctx.fillRect(-0.6, -0.6, 1.2, 1.2);
                    ctx.restore();
                });

                // Deck (Tahta) - Çift Kicktail Kavisli
                ctx.fillStyle = "#d97706";
                ctx.beginPath();
                ctx.moveTo(-13.5, -2.6);
                ctx.lineTo(-10.5, -1.2);
                ctx.lineTo(10.5, -1.2);
                ctx.lineTo(13.5, -2.6);
                ctx.lineTo(13.5, -0.4);
                ctx.lineTo(10.5, 0.6);
                ctx.lineTo(-10.5, 0.6);
                ctx.lineTo(-13.5, -0.4);
                ctx.closePath();
                ctx.fill();

                // Üst Yüzey: Mat Siyah Zımpara Kağıdı (Grip Tape)
                ctx.fillStyle = "#18181b";
                ctx.beginPath();
                ctx.moveTo(-13.5, -2.6);
                ctx.lineTo(-10.5, -1.2);
                ctx.lineTo(10.5, -1.2);
                ctx.lineTo(13.5, -2.6);
                ctx.lineTo(13.0, -3.2);
                ctx.lineTo(10.2, -1.8);
                ctx.lineTo(-10.2, -1.8);
                ctx.lineTo(-13.0, -3.2);
                ctx.closePath();
                ctx.fill();

                // Neon Turkuaz Grip Çizgisi
                ctx.fillStyle = "#06b6d4";
                ctx.fillRect(-2.5, -1.8, 5.0, 0.6);

            } else {
                // ÖN, ARKA VEYA ÇAPRAZ GÖRÜNÜM (3D Açı)
                const deckRot = isDiagonal ? (isLeft ? 0.38 : -0.38) : 0;
                ctx.save();
                ctx.rotate(deckRot);

                // Metal Dingiller (Trucks)
                ctx.fillStyle = truckCol;
                ctx.fillRect(-7.5, -0.8, 15.0, 1.8);

                // 4 Tekerlek
                const wheelPositions = [
                    { x: -7.5, y: -2.2 }, { x: 7.5, y: -2.2 },
                    { x: -7.5, y: 1.8 }, { x: 7.5, y: 1.8 }
                ];
                wheelPositions.forEach(wp => {
                    ctx.save();
                    ctx.translate(wp.x, wp.y);
                    ctx.fillStyle = wheelCol;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, 1.8, 2.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = wheelCore;
                    ctx.fillRect(-0.4, -0.8, 0.8, 1.6);
                    ctx.restore();
                });

                // Ahşap Gövde Kenarı
                ctx.fillStyle = "#d97706";
                ctx.beginPath();
                ctx.roundRect(-10.5, -4.5, 21.0, 9.0, [4.0, 4.0, 4.0, 4.0]);
                ctx.fill();

                if (isBack) {
                    // Arkadan Bakış: Alttaki Canlı Sokak Grafiti Sanatı Görünür!
                    ctx.fillStyle = "#09090b";
                    ctx.beginPath();
                    ctx.roundRect(-10.0, -4.0, 20.0, 8.0, [3.5, 3.5, 3.5, 3.5]);
                    ctx.fill();

                    // Neon Pembe & Yeşil Grafiti Sprey Fırça Darbeleri
                    ctx.fillStyle = "#ec4899";
                    ctx.beginPath();
                    ctx.moveTo(-7.0, -3.5); ctx.lineTo(4.0, -1.0); ctx.lineTo(2.0, 3.2); ctx.lineTo(-8.5, 1.2);
                    ctx.closePath(); ctx.fill();

                    ctx.fillStyle = "#22c55e";
                    ctx.beginPath();
                    ctx.moveTo(-2.0, -2.5); ctx.lineTo(8.5, -0.5); ctx.lineTo(7.0, 3.5); ctx.lineTo(-1.0, 2.5);
                    ctx.closePath(); ctx.fill();

                    // Sarı Sokak Tag
                    ctx.fillStyle = "#facc15";
                    ctx.fillRect(-3.0, -1.0, 6.0, 1.8);
                } else {
                    // Önden / Çaprazdan Bakış: Siyah Zımpara (Grip Tape) ve Vidalar
                    ctx.fillStyle = "#18181b";
                    ctx.beginPath();
                    ctx.roundRect(-10.0, -4.0, 20.0, 8.0, [3.5, 3.5, 3.5, 3.5]);
                    ctx.fill();

                    // Orta Neon Çizgi (Griptape Cutout)
                    ctx.fillStyle = "#06b6d4";
                    ctx.fillRect(-8.0, -0.5, 16.0, 1.0);

                    // 8 Adet Metalik Vida (Hardware Bolts)
                    ctx.fillStyle = "#cbd5e1";
                    [-6.5, -4.5, 4.5, 6.5].forEach(bx => {
                        ctx.fillRect(bx, -2.6, 1.0, 1.0);
                        ctx.fillRect(bx, 1.6, 1.0, 1.0);
                    });
                }

                ctx.restore();
            }

            ctx.restore();
        }
    }

    global.K2Limbs = K2Limbs;
    global.__k2Modules = global.__k2Modules || [];
    global.__k2Modules.push(K2Limbs);

    function attach(target) {
        Object.getOwnPropertyNames(K2Limbs).forEach(name => {
            if (name !== 'length' && name !== 'name' && name !== 'prototype') {
                target[name] = K2Limbs[name];
            }
        });
    }

    if (global.Karakter2Renderer) {
        attach(global.Karakter2Renderer);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = K2Limbs;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
