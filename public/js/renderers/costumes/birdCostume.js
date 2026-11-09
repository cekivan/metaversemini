// public/js/renderers/costumes/birdCostume.js - 🦅 Şahane Kartal / Kuş Kostümü
(function () {
    const birdStates = Object.create(null);
    let lastBirdStatePruneAt = 0;

    function isCostume(costumeId) {
        if (!costumeId) return false;
        let clean = String(costumeId).replace('costumes_', '').replace('outfits_', '');
        return ANIMAL_COSTUME_IDS.includes(clean);
    }

    function getCleanCostumeId(costumeId) {
        if (!costumeId) return null;
        return String(costumeId).replace('costumes_', '').replace('outfits_', '');
    }

    function getPlayerKey(p) {
        return (p && (p.id || p.name || p.username)) || 'self';
    }

    function getBirdState(p, now) {
        const key = getPlayerKey(p);
        let state = birdStates[key];
        if (!state) {
            state = birdStates[key] = {
                lastMoveAt: now,
                lastUpdateAt: now,
                lastSeenAt: now,
                perchProgress: 0,
                wasMoving: false,
                takeoffFromPerch: false,
                nextGlideAt: now + 1900,
                glideUntil: 0,
                takeoffStartedAt: 0,
                nextBlinkAt: now + 2800,
                blinkStartedAt: 0,
                nextRuffleAt: now + 7200,
                ruffleUntil: 0,
                nextLookAt: now + 900,
                lookStartedAt: 0,
                lookUntil: 0,
                lookDirection: 0,
                nearbyLookDirection: 0,
                nearbyLookTarget: 0,
                lastNearbyCheckAt: 0,
                facing: null,
                facingChangedAt: 0,
                turnBank: 0
            };
        }
        state.lastSeenAt = now;
        if (now - lastBirdStatePruneAt >= 60000) {
            for (const playerKey in birdStates) {
                if (now - birdStates[playerKey].lastSeenAt > 300000) delete birdStates[playerKey];
            }
            lastBirdStatePruneAt = now;
        }
        return state;
    }

    // Kuş irtifa hesabı (Uçuş vs Tünek)
    function getBirdAltitude(p, isMoving, isPreview) {
        if (isPreview) return 18 + Math.sin(Date.now() / 180) * 3;
        const now = Date.now();
        const key = getPlayerKey(p);
        const state = getBirdState(p, now);
        if (isMoving) state.lastMoveAt = now;

        const shouldPerch = !isMoving && now - state.lastMoveAt >= 1500;
        const elapsed = Math.max(0, now - state.lastUpdateAt);
        const transitionDuration = shouldPerch ? 420 : 260;
        const progressDelta = elapsed / transitionDuration;
        state.perchProgress = Math.max(0, Math.min(1, state.perchProgress + (shouldPerch ? progressDelta : -progressDelta)));

        if (isMoving && !state.wasMoving) {
            state.takeoffStartedAt = now;
            state.takeoffFromPerch = state.perchProgress > 0.5;
            state.glideUntil = 0;
            state.nextGlideAt = now + 1700;
        }
        if (isMoving && now >= state.nextGlideAt && now >= state.glideUntil) {
            state.glideUntil = now + 620;
            state.nextGlideAt = state.glideUntil + 1700 + ((now + String(key).length * 137) % 850);
        }
        if (now >= state.nextBlinkAt) {
            state.blinkStartedAt = now;
            state.nextBlinkAt = now + 2600 + ((now + String(key).length * 89) % 2600);
        }
        if (now >= state.nextRuffleAt) {
            state.ruffleUntil = now + 520;
            state.nextRuffleAt = now + 6800 + ((now + String(key).length * 211) % 4400);
        }
        if (now >= state.nextLookAt && state.perchProgress > 0.75) {
            state.lookStartedAt = now;
            state.lookDirection = ((now + String(key).length) % 2 ? 1 : -1) * 0.2;
            state.lookUntil = now + 520;
            state.nextLookAt = now + 2200 + ((now + String(key).length * 61) % 3000);
        }
        if (now - state.lastNearbyCheckAt >= 250 && state.perchProgress > 0.75) {
            state.lastNearbyCheckAt = now;
            let nearestDistanceSquared = 110 * 110;
            let nearbyDirection = 0;
            if (typeof players !== 'undefined' && players && p && Number.isFinite(p.x) && Number.isFinite(p.y)) {
                for (const otherId in players) {
                    const other = players[otherId];
                    if (!other || other === p || otherId === String(key) || !Number.isFinite(other.x) || !Number.isFinite(other.y)) continue;
                    const dx = other.x - p.x;
                    const dy = other.y - p.y;
                    const distanceSquared = dx * dx + dy * dy;
                    if (distanceSquared < nearestDistanceSquared) {
                        nearestDistanceSquared = distanceSquared;
                        nearbyDirection = Math.sign(dx) * 0.2;
                    }
                }
            }
            state.nearbyLookTarget = nearbyDirection;
        } else if (state.perchProgress <= 0.75) {
            state.nearbyLookTarget = 0;
        }
        state.nearbyLookDirection += (state.nearbyLookTarget - state.nearbyLookDirection) * Math.min(1, elapsed / 220);
        state.wasMoving = isMoving;
        state.lastUpdateAt = now;

        const flightAltitude = isMoving
            ? 28 + Math.sin(now / 140) * 4
            : 24 + Math.sin(now / 200) * 3;
        const takeoffProgress = Math.max(0, Math.min(1, (now - state.takeoffStartedAt) / 380));
        const heightProgress = state.takeoffFromPerch || state.perchProgress > 0
            ? 1 - state.perchProgress
            : (takeoffProgress < 1 ? 0.55 + takeoffProgress * 0.45 : 1);
        if (takeoffProgress >= 1) state.takeoffFromPerch = false;
        return flightAltitude * heightProgress;
    }

    // Gerçekçi Parabolik Kurbağa Zıplama Fiziği (High Parabolic Jump & Squash/Stretch)

    // 3. 🦅 2.5D İZOMETRİK 8 YÖNLÜ ŞAHANE KARTAL (costume_bird)
    // 3 Seviyeli Kanat Telekleri, Beyaz Kraliyet Başı & Altın Kanca Gaga
    // =========================================================================
    function drawBird(ctx, p, facing, isMoving, isPreview, walkCycle) {
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

        const time = Date.now();
        const alt = getBirdAltitude(p, isMoving, isPreview);
        const birdState = isPreview ? null : getBirdState(p, time);
        const perchProgress = birdState ? birdState.perchProgress : (isMoving ? 0 : 1);
        const isPerched = perchProgress >= 0.95;

        // Dönüşlerde Aerodinamik Yatış (Banking Roll)
        let turnBank = 0;
        if (isMoving && !isPreview && birdState) {
            const directions = ['up', 'up-right', 'right', 'down-right', 'down', 'down-left', 'left', 'up-left'];
            const curDir = directions.indexOf(facing);
            if (birdState.facing !== null && birdState.facing !== facing && curDir >= 0) {
                const prevDir = directions.indexOf(birdState.facing);
                if (prevDir >= 0) {
                    const turn = (curDir - prevDir + directions.length) % directions.length;
                    birdState.turnBank = turn === 4 ? 0 : (turn < 4 ? 1 : -1);
                    birdState.facingChangedAt = time;
                }
            }
            birdState.facing = facing;
            turnBank = birdState.turnBank * Math.max(0, 1 - (time - birdState.facingChangedAt) / 320) * 0.14;
        }

        // Kinematik & Animasyon Değerleri
        const isGliding = !!(isMoving && birdState && time < birdState.glideUntil);
        const flapCycle = isMoving && !isGliding ? Math.sin(time / 145) : (isGliding ? 0.15 : 0);
        const breath = Math.sin(time / 480) * 0.035 * perchProgress;
        const perchBob = Math.sin(time / 520) * 0.65 * perchProgress;
        const flightBob = isMoving && !isGliding ? Math.abs(Math.sin(time / 145)) * 0.75 : 0;

        // Kafa Çevirme & Göz Kırpma (Vigilant Head Scanning)
        let headTurn = 0;
        if (birdState && perchProgress > 0.6) {
            const idleTurn = time < birdState.lookUntil ? birdState.lookDirection : 0;
            const lookElapsed = time - birdState.lookStartedAt;
            const lookRemaining = birdState.lookUntil - time;
            const idleBlend = time < birdState.lookUntil ? Math.max(0, Math.min(1, lookElapsed / 120, lookRemaining / 120)) : 0;
            headTurn = (birdState.nearbyLookDirection || idleTurn * idleBlend) * perchProgress * mirror;
        }
        const blinkAmount = birdState && time - birdState.blinkStartedAt < 140 ? Math.sin((time - birdState.blinkStartedAt) / 140 * Math.PI) : 0;
        const eyeOpen = 1 - blinkAmount * 0.92;

        // Renk Paleti (İmparatorluk Altın / Ak Başlı Kel Kartal)
        const cDarkPlumage = "#1a120b";
        const cBasePlumage = "#362215";
        const cLightPlumage = "#523623";
        const cGoldHighlight = "#8c5e3a";
        const cGoldSheen = "#b37c4d";

        const cWhiteHigh = "#ffffff";
        const cWhiteBase = "#f4f0e6";
        const cWhiteShadow = "#cfc4b2";
        const cWhiteCrevice = "#9a8d79";

        const cBeakGold = "#f59e0b";
        const cBeakHigh = "#fbbf24";
        const cBeakDark = "#b45309";
        const cCere = "#78350f";

        const cEyeIris = "#facc15";
        const cEyePupil = "#09090b";
        const cTalonGold = "#eab308";
        const cTalonClaw = "#18181b";

        // ---------------------------------------------------------------------
        // 1. ZEMİN GÖLGESİ (Ambient Occlusion & Contact Shadow)
        // ---------------------------------------------------------------------
        ctx.save();
        const shadowScale = Math.max(0.38, 1 - (alt / 72));
        const shadowAlpha = isMoving ? (0.30 * shadowScale) : (0.42 * (1 - perchProgress * 0.15));

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha * 0.35})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 36 * shadowScale, 15 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha * 0.65})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, 22 * shadowScale, 9 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();

        if (isPerched) {
            ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
            ctx.beginPath();
            ctx.ellipse(-6, 0, 6.5, 3.2, 0, 0, Math.PI * 2);
            ctx.ellipse(6, 0, 6.5, 3.2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // ---------------------------------------------------------------------
        // 2. KARTAL ANA KOORDİNAT SİSTEMİ
        // ---------------------------------------------------------------------
        ctx.save();
        ctx.translate(0, -alt);
        ctx.rotate(turnBank);
        ctx.translate(0, perchBob - flightBob);
        ctx.scale(mirror * 1.25, 1.25);

        // ---------------------------------------------------------------------
        // YARDIMCI: 2.5D KANAT ÇİZİMİ (Spread Wing / Folded Perch Wing)
        // ---------------------------------------------------------------------
        function drawEagleWing(side, isForeground, wingAngle) {
            ctx.save();
            ctx.scale(side, 1);

            if (!isPerched) {
                // UÇUŞ KANADI: 3 Kademeli ve 5 Parmak Uçuş Teleği
                ctx.translate(4, -18);
                ctx.rotate(wingAngle);

                const wingGrad = ctx.createLinearGradient(0, -26, 54, 16);
                wingGrad.addColorStop(0, isForeground ? cLightPlumage : cBasePlumage);
                wingGrad.addColorStop(0.55, isForeground ? cBasePlumage : cDarkPlumage);
                wingGrad.addColorStop(1, cDarkPlumage);

                ctx.fillStyle = wingGrad;
                ctx.strokeStyle = cDarkPlumage;
                ctx.lineWidth = 1.0;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(14, -18, 38, -25);
                // 5 Adet Ayrık Parmak Telek
                ctx.quadraticCurveTo(48, -26, 56, -20); // 1. En uzun parmak
                ctx.lineTo(47, -14);
                ctx.lineTo(57, -13); // 2. Parmak
                ctx.lineTo(47, -7);
                ctx.lineTo(55, -5);  // 3. Parmak
                ctx.lineTo(45, 0);
                ctx.lineTo(51, 3);   // 4. Parmak
                ctx.lineTo(41, 7);
                ctx.lineTo(46, 10);  // 5. Parmak
                ctx.lineTo(34, 12);
                ctx.quadraticCurveTo(16, 12, 2, 6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Tüy Ayrım Çizgileri
                ctx.strokeStyle = isForeground ? cGoldHighlight : cBasePlumage;
                ctx.lineWidth = 0.8;
                for (let f = 0; f < 6; f++) {
                    const px = 10 + f * 4.5;
                    ctx.beginPath();
                    ctx.moveTo(6 + f * 2, 4);
                    ctx.quadraticCurveTo(px + 8, -6, 52 - f * 2.2, -18 + f * 3.5);
                    ctx.stroke();
                }

                // Omuz ve Üst Örtü Tüyleri (Covert Mantle)
                const covertGrad = ctx.createLinearGradient(4, -10, 28, 6);
                covertGrad.addColorStop(0, isForeground ? cGoldSheen : cGoldHighlight);
                covertGrad.addColorStop(0.5, isForeground ? cGoldHighlight : cLightPlumage);
                covertGrad.addColorStop(1, cDarkPlumage);
                ctx.fillStyle = covertGrad;
                ctx.beginPath();
                ctx.ellipse(19, -4, 18, 7, -0.22, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = cDarkPlumage;
                ctx.lineWidth = 0.8;
                ctx.stroke();

            } else {
                // TÜNEMİŞ KANAT: Gövdeye Muntazam Katlanmış Asil Kanat
                ctx.translate(6, -16);
                ctx.rotate(0.32);

                const foldedGrad = ctx.createLinearGradient(0, -10, 16, 26);
                foldedGrad.addColorStop(0, isForeground ? cGoldSheen : cGoldHighlight);
                foldedGrad.addColorStop(0.4, isForeground ? cLightPlumage : cBasePlumage);
                foldedGrad.addColorStop(1, cDarkPlumage);

                ctx.fillStyle = foldedGrad;
                ctx.strokeStyle = cDarkPlumage;
                ctx.lineWidth = 1.0;

                ctx.beginPath();
                ctx.moveTo(0, -6);
                ctx.quadraticCurveTo(14, -8, 17, 4);
                ctx.quadraticCurveTo(18, 16, 11, 28);
                ctx.lineTo(8, 23);
                ctx.lineTo(8, 27);
                ctx.lineTo(5, 22);
                ctx.quadraticCurveTo(0, 14, -2, 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Katmanlı Kapak Tüyleri
                ctx.fillStyle = isForeground ? cGoldHighlight : cLightPlumage;
                for (let c = 0; c < 3; c++) {
                    ctx.beginPath();
                    ctx.ellipse(7 + c * 2, -1 + c * 5, 6 - c * 0.8, 3, 0.25, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.restore();
        }

        // ---------------------------------------------------------------------
        // YARDIMCI: SAF BEYAZ KATMANLI KUYRUK YELPAZESİ (Tail Fan)
        // ---------------------------------------------------------------------
        function drawEagleTail(viewType) {
            ctx.save();
            ctx.translate(0, -10);

            const tailGrad = ctx.createLinearGradient(0, -6, 0, 22);
            tailGrad.addColorStop(0, cWhiteBase);
            tailGrad.addColorStop(0.7, cWhiteHigh);
            tailGrad.addColorStop(1, cWhiteShadow);

            ctx.fillStyle = tailGrad;
            ctx.strokeStyle = cWhiteCrevice;
            ctx.lineWidth = 0.8;

            if (viewType === 'side') {
                ctx.beginPath();
                ctx.moveTo(-4, 0);
                ctx.quadraticCurveTo(-16, 8, -26, 15);
                ctx.lineTo(-21, 19);
                ctx.lineTo(-27, 21);
                ctx.lineTo(-19, 23);
                ctx.quadraticCurveTo(-10, 16, -2, 7);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (viewType === 'quarter-front' || viewType === 'quarter-back') {
                ctx.beginPath();
                ctx.moveTo(-3, 0);
                ctx.quadraticCurveTo(-14, 10, -22, 22);
                ctx.lineTo(-16, 23);
                ctx.lineTo(-18, 25);
                ctx.lineTo(-10, 26);
                ctx.lineTo(-10, 27);
                ctx.lineTo(-3, 27);
                ctx.quadraticCurveTo(3, 16, 5, 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(-5, 0);
                ctx.quadraticCurveTo(-14, 12, -16, 24);
                ctx.lineTo(-10, 25);
                ctx.lineTo(-6, 26);
                ctx.lineTo(0, 27);
                ctx.lineTo(6, 26);
                ctx.lineTo(10, 25);
                ctx.lineTo(16, 24);
                ctx.quadraticCurveTo(14, 12, 5, 0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            ctx.strokeStyle = cWhiteShadow;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(-8, 24);
            ctx.moveTo(0, 0); ctx.lineTo(0, 26);
            ctx.moveTo(0, 0); ctx.lineTo(8, 24);
            ctx.stroke();

            ctx.restore();
        }

        // ---------------------------------------------------------------------
        // YARDIMCI: ALTIN PENÇELER VE BACAKLAR (Talons)
        // ---------------------------------------------------------------------
        function drawEagleTalons(perched, isFrontView) {
            ctx.save();
            const footY = perched ? -2 : -6;
            const footSpacing = isFrontView ? 7 : 5;

            [-1, 1].forEach(side => {
                if (view === 'side' && side === -1) return;

                const fx = side * footSpacing;

                // Bacak Tüyleri (Feathered Trousers)
                ctx.fillStyle = cLightPlumage;
                ctx.beginPath();
                ctx.ellipse(fx, footY - 8, 4.5, 6, side * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // Bacak ve Parmaklar (Golden Yellow Tarsus)
                ctx.strokeStyle = cBeakGold;
                ctx.lineWidth = 2.0;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                ctx.beginPath();
                ctx.moveTo(fx, footY - 5);
                ctx.lineTo(fx, footY - 1);
                ctx.lineTo(fx - 4, footY + 1.5);
                ctx.moveTo(fx, footY - 1);
                ctx.lineTo(fx, footY + 2);
                ctx.moveTo(fx, footY - 1);
                ctx.lineTo(fx + 4, footY + 1.5);
                ctx.stroke();

                // Obsidian Siyahı Keskin Tırnaklar
                ctx.fillStyle = cTalonClaw;
                [-4, 0, 4].forEach(tx => {
                    ctx.beginPath();
                    ctx.arc(fx + tx, footY + (tx === 0 ? 2.5 : 2), 1.2, 0, Math.PI * 2);
                    ctx.fill();
                });
            });

            ctx.restore();
        }

        // ---------------------------------------------------------------------
        // YARDIMCI: BEYAZ KARTAL BAŞI, GÖZ & ÇENGEL GAGA
        // ---------------------------------------------------------------------
        function drawEagleHead(headX, headY, angleOffset) {
            ctx.save();
            ctx.translate(headX, headY);
            ctx.rotate(angleOffset + headTurn);

            // Ense ve Boyun Tüyleri (Nape & Crest Frill)
            const headGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, 14);
            headGrad.addColorStop(0, cWhiteHigh);
            headGrad.addColorStop(0.65, cWhiteBase);
            headGrad.addColorStop(1, cWhiteShadow);

            ctx.fillStyle = headGrad;
            ctx.strokeStyle = cWhiteCrevice;
            ctx.lineWidth = 0.8;

            ctx.beginPath();
            ctx.moveTo(-6, -8);
            ctx.quadraticCurveTo(-14, -10, -18, -4);
            ctx.lineTo(-12, -2);
            ctx.lineTo(-19, 1);
            ctx.lineTo(-12, 3);
            ctx.quadraticCurveTo(-8, 12, 2, 10);
            ctx.quadraticCurveTo(10, 6, 9, -3);
            ctx.quadraticCurveTo(4, -10, -6, -8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Tüy Dokuları
            ctx.strokeStyle = cWhiteShadow;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-4, -6); ctx.lineTo(-13, -4);
            ctx.moveTo(-3, -2); ctx.lineTo(-14, 0);
            ctx.moveTo(-2, 2);  ctx.lineTo(-11, 4);
            ctx.stroke();

            if (view !== 'back') {
                const isFrontal = (view === 'front');
                const isSide = (view === 'side');
                const eyeX = isFrontal ? 4 : (isSide ? 3 : 4);
                const eyeY = -2;

                // Kaş Çıkıntısı (Supraorbital Ridge)
                ctx.strokeStyle = "#473427";
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(eyeX - 4, eyeY - 3);
                ctx.lineTo(eyeX + 3.5, eyeY - 2.5);
                ctx.stroke();

                // Göz (Altın Amber Iris & Siyah Gözbebeği)
                ctx.fillStyle = cEyeIris;
                ctx.beginPath();
                ctx.ellipse(eyeX, eyeY, 2.5, Math.max(0.2, 2.5 * eyeOpen), 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = cEyePupil;
                ctx.beginPath();
                ctx.ellipse(eyeX + 0.3, eyeY, 1.3, Math.max(0.15, 1.3 * eyeOpen), 0, 0, Math.PI * 2);
                ctx.fill();

                if (eyeOpen > 0.4) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(eyeX + 0.8, eyeY - 0.7, 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (isFrontal) {
                    const eyeX2 = -4;
                    ctx.strokeStyle = "#473427";
                    ctx.lineWidth = 1.3;
                    ctx.beginPath();
                    ctx.moveTo(eyeX2 + 4, eyeY - 3);
                    ctx.lineTo(eyeX2 - 3.5, eyeY - 2.5);
                    ctx.stroke();

                    ctx.fillStyle = cEyeIris;
                    ctx.beginPath();
                    ctx.ellipse(eyeX2, eyeY, 2.5, Math.max(0.2, 2.5 * eyeOpen), 0, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = cEyePupil;
                    ctx.beginPath();
                    ctx.ellipse(eyeX2 - 0.3, eyeY, 1.3, Math.max(0.15, 1.3 * eyeOpen), 0, 0, Math.PI * 2);
                    ctx.fill();

                    if (eyeOpen > 0.4) {
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(eyeX2 - 0.8, eyeY - 0.7, 0.6, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }

                // Altın Kavisli Keskin Çengel Gaga
                ctx.save();
                if (isFrontal) {
                    ctx.translate(0, 1);
                    const beakGrad = ctx.createLinearGradient(-3, 0, 3, 10);
                    beakGrad.addColorStop(0, cBeakHigh);
                    beakGrad.addColorStop(0.5, cBeakGold);
                    beakGrad.addColorStop(1, cBeakDark);
                    ctx.fillStyle = beakGrad;
                    ctx.strokeStyle = cBeakDark;
                    ctx.lineWidth = 0.9;

                    ctx.beginPath();
                    ctx.moveTo(-4, -1);
                    ctx.quadraticCurveTo(0, -3, 4, -1);
                    ctx.lineTo(3.5, 4);
                    ctx.quadraticCurveTo(0, 11, -3.5, 4);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    ctx.fillStyle = cCere;
                    ctx.beginPath();
                    ctx.ellipse(-1.5, 0, 0.7, 1.2, 0, 0, Math.PI * 2);
                    ctx.ellipse(1.5, 0, 0.7, 1.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.translate(7, 0);
                    const beakGrad = ctx.createLinearGradient(0, -4, 12, 10);
                    beakGrad.addColorStop(0, cBeakHigh);
                    beakGrad.addColorStop(0.4, cBeakGold);
                    beakGrad.addColorStop(1, cBeakDark);
                    ctx.fillStyle = beakGrad;
                    ctx.strokeStyle = cBeakDark;
                    ctx.lineWidth = 0.9;

                    ctx.beginPath();
                    ctx.moveTo(0, -4);
                    ctx.quadraticCurveTo(6, -6, 11, -2);
                    ctx.quadraticCurveTo(15, 3, 9, 10);
                    ctx.quadraticCurveTo(8, 5, 4, 3);
                    ctx.lineTo(0, 4);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();

                    ctx.strokeStyle = cBeakDark;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(0, 2);
                    ctx.quadraticCurveTo(6, 2, 10, 5);
                    ctx.stroke();

                    ctx.fillStyle = cCere;
                    ctx.beginPath();
                    ctx.ellipse(2.5, -2, 1.5, 1, 0.3, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            ctx.restore();
        }

        // ---------------------------------------------------------------------
        // 3. 2.5D İZOMETRİK DERİNLİK SIRALAMASI VE GÖRÜNÜM KATMANLARI
        // ---------------------------------------------------------------------
        const wingStroke = flapCycle * 0.45;

        if (view === 'front') {
            drawEagleTail('front');
            drawEagleWing(-1, false, -wingStroke);
            drawEagleWing(1, true, wingStroke);

            const bodyGrad = ctx.createRadialGradient(-3, -12, 4, 0, -10, 18);
            bodyGrad.addColorStop(0, cLightPlumage);
            bodyGrad.addColorStop(0.55, cBasePlumage);
            bodyGrad.addColorStop(1, cDarkPlumage);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(0, -10, 14 * (1 + breath), 16, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = cGoldHighlight;
            ctx.lineWidth = 0.8;
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.moveTo(-5 + i * 3, -14 + i * 2);
                ctx.lineTo(-3 + i * 3, -10 + i * 2);
                ctx.lineTo(-1 + i * 3, -14 + i * 2);
                ctx.stroke();
            }

            drawEagleTalons(isPerched, true);
            drawEagleHead(0, -26, 0);

        } else if (view === 'quarter-front') {
            drawEagleWing(-1, false, -wingStroke * 0.8);
            drawEagleTail('quarter-front');

            const bodyGrad = ctx.createLinearGradient(-12, -22, 12, 2);
            bodyGrad.addColorStop(0, cGoldSheen);
            bodyGrad.addColorStop(0.4, cLightPlumage);
            bodyGrad.addColorStop(0.8, cBasePlumage);
            bodyGrad.addColorStop(1, cDarkPlumage);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(1, -12, 13 * (1 + breath), 16, 0.18, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = cGoldHighlight;
            for (let s = 0; s < 3; s++) {
                ctx.beginPath();
                ctx.ellipse(-3 + s * 3.5, -16 + s * 3, 5, 2.5, 0.25, 0, Math.PI * 2);
                ctx.fill();
            }

            drawEagleTalons(isPerched, false);
            drawEagleWing(1, true, wingStroke);
            drawEagleHead(6, -26, 0.08);

        } else if (view === 'side') {
            drawEagleWing(-1, false, -wingStroke * 0.7);
            drawEagleTail('side');

            const bodyGrad = ctx.createLinearGradient(-10, -20, 10, 4);
            bodyGrad.addColorStop(0, cLightPlumage);
            bodyGrad.addColorStop(0.5, cBasePlumage);
            bodyGrad.addColorStop(1, cDarkPlumage);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(0, -11, 14 * (1 + breath), 13, -0.15, 0, Math.PI * 2);
            ctx.fill();

            drawEagleTalons(isPerched, false);
            drawEagleWing(1, true, wingStroke);
            drawEagleHead(8, -24, 0);

        } else if (view === 'quarter-back') {
            drawEagleHead(4, -25, -0.1);
            drawEagleWing(-1, false, -wingStroke * 0.8);

            const bodyGrad = ctx.createLinearGradient(-10, -22, 10, 2);
            bodyGrad.addColorStop(0, cLightPlumage);
            bodyGrad.addColorStop(0.5, cBasePlumage);
            bodyGrad.addColorStop(1, cDarkPlumage);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(0, -12, 13 * (1 + breath), 15, -0.12, 0, Math.PI * 2);
            ctx.fill();

            drawEagleTail('quarter-back');
            if (!isPerched) drawEagleTalons(false, false);
            drawEagleWing(1, true, wingStroke);

        } else if (view === 'back') {
            drawEagleHead(0, -26, 0);

            const bodyGrad = ctx.createRadialGradient(0, -14, 2, 0, -10, 16);
            bodyGrad.addColorStop(0, cLightPlumage);
            bodyGrad.addColorStop(0.6, cBasePlumage);
            bodyGrad.addColorStop(1, cDarkPlumage);
            ctx.fillStyle = bodyGrad;
            ctx.beginPath();
            ctx.ellipse(0, -11, 14 * (1 + breath), 16, 0, 0, Math.PI * 2);
            ctx.fill();

            drawEagleTail('back');
            drawEagleWing(-1, false, -wingStroke);
            drawEagleWing(1, true, wingStroke);
            if (!isPerched) drawEagleTalons(false, true);
        }

        ctx.restore();
    }


    const definition = {
        id: 'costume_bird',
        draw: (ctx, p, facing, isSitting, isMoving, walkCycle, isPreview) => {
            drawBird(ctx, p, facing, isMoving, isPreview, walkCycle);
        },
        getNameTagOffset: (p, isMoving) => {
            const alt = getBirdAltitude(p, isMoving, false);
            return -alt - 18;
        }
    };

    if (typeof window !== 'undefined') {
        window.__animalCostumeModules = window.__animalCostumeModules || {};
        window.__animalCostumeModules['costume_bird'] = definition;
        if (window.AnimalCostumeRenderer && typeof window.AnimalCostumeRenderer.register === 'function') {
            window.AnimalCostumeRenderer.register('costume_bird', definition);
        }
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition;
    }
})();
