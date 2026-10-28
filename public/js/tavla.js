// public/js/tavla.js - İstemci Tarafı Tavla (Backgammon) Arayüzü (Kullanıcı Tercihine Göre Sağ Alt / Sol Alt Simetrik)

let currentTavlaState = null;
let selectedTavlaPoint = null;
let tavlaValidTargets = [];

// Tavla Toplama Yönü (Orientation): 'sag_alt' (varsayılan Türk tavlası) veya 'sol_alt'
let tavlaOrientation = localStorage.getItem('mm_tavla_orientation') || null;
let tavlaPromptShownForTable = null;

function getTavlaOrientation() {
    return tavlaOrientation || 'sag_alt';
}

function openTavlaOrientationModal(force = false) {
    const modal = document.getElementById('tavlaOrientationModal');
    if (!modal) return;
    if (force || !tavlaOrientation || !localStorage.getItem('mm_tavla_orientation_saved')) {
        modal.style.display = 'flex';
    }
}
window.openTavlaOrientationModal = openTavlaOrientationModal;

function closeTavlaOrientationModal() {
    const modal = document.getElementById('tavlaOrientationModal');
    if (modal) modal.style.display = 'none';
}
window.closeTavlaOrientationModal = closeTavlaOrientationModal;

function setTavlaOrientation(choice) {
    tavlaOrientation = (choice === 'sol_alt') ? 'sol_alt' : 'sag_alt';
    const rememberCheckbox = document.getElementById('tavlaRememberChoice');
    if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('mm_tavla_orientation', tavlaOrientation);
        localStorage.setItem('mm_tavla_orientation_saved', 'true');
    }
    updateTavlaOrientationBadge();
    closeTavlaOrientationModal();
    if (currentTavlaState) {
        renderTavlaBoard(currentTavlaState);
    }
}
window.setTavlaOrientation = setTavlaOrientation;

function toggleTavlaOrientation() {
    let cur = getTavlaOrientation();
    let next = (cur === 'sag_alt') ? 'sol_alt' : 'sag_alt';
    setTavlaOrientation(next);
}
window.toggleTavlaOrientation = toggleTavlaOrientation;

function updateTavlaOrientationBadge() {
    const badge = document.getElementById('tavlaOrientationBadge');
    if (badge) {
        let cur = getTavlaOrientation();
        badge.innerHTML = (cur === 'sag_alt') ? '↘️ Sağ Alt' : '↙️ Sol Alt';
    }
}
window.updateTavlaOrientationBadge = updateTavlaOrientationBadge;

socket.on('tavlaUpdate', (state) => {
    currentTavlaState = state;
    window.currentActiveTableId = state.tableId;
    if (window.setVoiceTable && state.tableId) window.setVoiceTable(state.tableId);
    window.isSpectating = !!state.isSpectator;

    // Masaya ilk oturulduğunda veya tercih henüz kaydedilmediyse kullanıcıya yön sor
    if (!state.isSpectator && tavlaPromptShownForTable !== state.tableId) {
        tavlaPromptShownForTable = state.tableId;
        if (!localStorage.getItem('mm_tavla_orientation_saved')) {
            setTimeout(() => { openTavlaOrientationModal(); }, 150);
        }
    }
    updateTavlaOrientationBadge();

    const specBanner = document.getElementById('spectatorBanner');
    if (specBanner) {
        if (state.isSpectator) {
            specBanner.style.display = 'block';
            let discKeys = Object.keys(state.disconnectedPlayers || {});
            if (discKeys.length > 0) {
                let dPid = discKeys[0];
                let dName = state.disconnectedPlayers[dPid].name;
                specBanner.innerHTML = `👁️ Yancısın | ⚠️ <b>${dName}</b> masadan ayrıldı! <button onclick="takeoverSeat('${state.tableId}', '${dPid}')" style="margin-left:8px; padding:4px 10px; background:#27ae60; color:white; border:none; border-radius:4px; font-weight:bold; cursor:pointer;">💺 Boş Koltuğu Devral (${dName} yerine)</button>`;
            } else {
                specBanner.innerHTML = `👁️ Tavla Masasını İzliyorsun (Yancısın)`;
            }
        } else {
            specBanner.style.display = 'none';
        }
    }

    renderTavlaBoard(state);
});

function renderTavlaBoard(state) {
    const statusEl = document.getElementById('tavlaStatus');
    const rollBtn = document.getElementById('tavlaRollBtn');
    const diceDisplay = document.getElementById('tavlaDiceDisplay');
    const boardEl = document.getElementById('tavlaBoard');

    if (!boardEl) return;

    let myPid = socket.id;
    let myColor = state.playerColors ? state.playerColors[myPid] : null;
    let currentPid = state.players[state.turnIndex];
    let isMyTurn = !state.isSpectator && (currentPid === myPid);

    // 1. Durum Metni & Zar Butonu
    if (state.gameOver) {
        let isWinner = (state.winner === myPid);
        let winText = state.isSpectator ? "Maç Bitti!" : (isWinner ? "🏆 TEBRİKLER KAZANDIN! (+20 TL Kazandın)" : "KAYBETTİN!");
        statusEl.innerHTML = `<span style="color:#f1c40f; font-weight:800; font-size:17px;">${winText}</span>`;
        if (rollBtn) rollBtn.style.display = 'none';
    } else if (state.isSpectator) {
        let turnName = state.playerProfiles[currentPid]?.name || "Biri";
        statusEl.innerHTML = `<span style="color:#38bdf8;">👁️ Yancısın | Sıra: <b>${turnName}</b></span>`;
        if (rollBtn) rollBtn.style.display = 'none';
    } else {
        let colorName = myColor === 'white' ? "⚪ Beyaz Taşlar" : "⚫ Siyah Taşlar";
        if (isMyTurn) {
            if (!state.hasRolled) {
                statusEl.innerHTML = `<span style="color:#2ecc71; font-weight:bold;">SIRA SENDE (${colorName})! Zarları atın.</span>`;
                if (rollBtn) {
                    rollBtn.style.display = 'inline-block';
                    rollBtn.disabled = false;
                    rollBtn.innerText = '🎲 Zar At';
                    rollBtn.style.opacity = '1';
                }
            } else if (state.noMoves) {
                // Hamle yapılamayan durum bildirimi
                let diceText = state.dice.join(' - ');
                statusEl.innerHTML = `<span style="color:#f87171; font-weight:bold;">🎲 [${diceText}] atıldı fakat oynanacak geçerli hamle yok! Sıra rakibe devrediliyor...</span>`;
                if (rollBtn) rollBtn.style.display = 'none';
            } else {
                let movesText = state.remainingMoves.join(', ');
                statusEl.innerHTML = `<span style="color:#facc15; font-weight:bold;">Taşınızı seçip oynayın! Kalan hamleler: [${movesText}]</span>`;
                if (rollBtn) rollBtn.style.display = 'none';
            }
        } else {
            let oppName = state.playerProfiles[currentPid]?.name || "Rakip";
            if (state.noMoves) {
                let diceText = state.dice.join(' - ');
                statusEl.innerHTML = `<span style="color:#f87171; font-weight:bold;">🎲 ${oppName} [${diceText}] attı fakat hamlesi yok, sıra sana geçiyor...</span>`;
            } else {
                statusEl.innerHTML = `<span style="color:#e2e8f0;">Sıra <b>${oppName}</b> adlı oyuncuda (${myColor === 'white' ? '⚪ Beyaz' : '⚫ Siyah'})...</span>`;
            }
            if (rollBtn) rollBtn.style.display = 'none';
        }
    }

    // 2. Zar Gösterimi
    if (diceDisplay) {
        if (state.dice && state.dice.length === 2) {
            let d1 = state.dice[0];
            let d2 = state.dice[1];
            diceDisplay.innerHTML = `
                <div class="dice-box">${getDiceDotHtml(d1)}</div>
                <div class="dice-box">${getDiceDotHtml(d2)}</div>
            `;
        } else {
            diceDisplay.innerHTML = `<span style="color:#94a3b8; font-size:13px; font-style:italic;">Zar bekleniyor</span>`;
        }
    }

    // 3. Tahtayı Çiz
    drawTavlaBoardHTML(state, myColor, isMyTurn);
}

function getDiceDotHtml(val) {
    let pips = {
        1: '<span class="pip center"></span>',
        2: '<span class="pip top-left"></span><span class="pip bot-right"></span>',
        3: '<span class="pip top-left"></span><span class="pip center"></span><span class="pip bot-right"></span>',
        4: '<span class="pip top-left"></span><span class="pip top-right"></span><span class="pip bot-left"></span><span class="pip bot-right"></span>',
        5: '<span class="pip top-left"></span><span class="pip top-right"></span><span class="pip center"></span><span class="pip bot-left"></span><span class="pip bot-right"></span>',
        6: '<span class="pip top-left"></span><span class="pip top-right"></span><span class="pip mid-left"></span><span class="pip mid-right"></span><span class="pip bot-left"></span><span class="pip bot-right"></span>'
    };
    return pips[val] || val;
}

function drawTavlaBoardHTML(state, myColor, isMyTurn) {
    const boardEl = document.getElementById('tavlaBoard');
    if (!boardEl) return;

    let viewColor = (state.isSpectator || !myColor) ? 'white' : myColor;
    let oppColor = viewColor === 'white' ? 'black' : 'white';

    let orientation = getTavlaOrientation();
    let isSagAlt = (orientation === 'sag_alt');

    // Tavla Yolculuk Rotası (Kullanıcının Tercihine Göre Simetrik Düzen):
    let topSlotsLeft, topSlotsRight, bottomSlotsLeft, bottomSlotsRight;

    if (isSagAlt) {
        // ↘️ SAĞ ALT TOPLAMA (Saat Yönünde İlerleyiş - Geleneksel Türk Tavlası):
        // Sol Üst (13..18) -> Sağ Üst / Rakip Evi (19..24)
        // Sol Alt / Kendi Dış Alanı (12..7) -> Sağ Alt / Kendi Evimiz (6..1) -> Sağ Tepsiye Toplama
        topSlotsLeft = [13, 14, 15, 16, 17, 18];
        topSlotsRight = [19, 20, 21, 22, 23, 24];
        bottomSlotsLeft = [12, 11, 10, 9, 8, 7];
        bottomSlotsRight = [6, 5, 4, 3, 2, 1];
    } else {
        // ↙️ SOL ALT TOPLAMA (Saat Yönünün Tersinde İlerleyiş):
        // Sol Üst / Rakip Evi (24..19) -> Sağ Üst / Rakip Dış (18..13)
        // Sağ Alt / Kendi Dış Alanı (7..12) -> Sol Alt / Kendi Evimiz (1..6) -> Sol Tepsiye Toplama
        topSlotsLeft = [24, 23, 22, 21, 20, 19];
        topSlotsRight = [18, 17, 16, 15, 14, 13];
        bottomSlotsLeft = [1, 2, 3, 4, 5, 6];
        bottomSlotsRight = [7, 8, 9, 10, 11, 12];
    }

    let canBearOffNow = !state.isSpectator && tavlaValidTargets.some(t => t.target === 'off');

    // Toplama Tepsileri
    let myBorne = state.borneOff[viewColor] || 0;
    let oppBorne = state.borneOff[oppColor] || 0;
    let myBorneTitle = viewColor === 'white' ? '⚪ Beyaz Toplanan' : '⚫ Siyah Toplanan';
    let oppBorneTitle = oppColor === 'white' ? '⚪ Beyaz Toplanan' : '⚫ Siyah Toplanan';

    // Kırık Taşlar
    let myBar = state.bar[viewColor] || 0;
    let oppBar = state.bar[oppColor] || 0;
    let myBarTitle = viewColor === 'white' ? '⚪ Kırık (Beyaz)' : '⚫ Kırık (Siyah)';
    let oppBarTitle = oppColor === 'white' ? '⚪ Kırık (Beyaz)' : '⚫ Kırık (Siyah)';

    function renderPointHTML(slotNum, isTop) {
        // Ekrandaki 1-24 slot numarasından sunucu kapı indeksine dönüşüm
        let serverPoint = (viewColor === 'black') ? (25 - slotNum) : slotNum;
        let pt = state.board[serverPoint];
        let isSelected = (selectedTavlaPoint === serverPoint);
        let isValidTarget = tavlaValidTargets.some(t => t.target === serverPoint);

        // Klasik ahşap tavla üçgen deseni (koyu/açık dönüşümlü)
        let isDark = (slotNum % 2 === 0);
        let triangleColorClass = isDark ? "tri-dark" : "tri-light";

        let isHome = (slotNum >= 1 && slotNum <= 6);
        let isOppHome = (slotNum >= 19 && slotNum <= 24);

        if (isTop) {
            return `<div class="tavla-point top-point ${triangleColorClass} ${isOppHome ? 'home-point-top' : ''} ${isSelected ? 'selected-point' : ''} ${isValidTarget ? 'target-point' : ''}" onclick="handleTavlaPointClick(${serverPoint})">
                <span class="point-num point-num-top">${slotNum}</span>
                <div class="point-checkers-top">
                    ${renderCheckers(pt.player, pt.count, isSelected)}
                </div>
            </div>`;
        } else {
            return `<div class="tavla-point bot-point ${triangleColorClass} ${isHome ? 'home-point-bot' : ''} ${isSelected ? 'selected-point' : ''} ${isValidTarget ? 'target-point' : ''}" onclick="handleTavlaPointClick(${serverPoint})">
                <div class="point-checkers-bot">
                    ${renderCheckers(pt.player, pt.count, isSelected)}
                </div>
                <span class="point-num point-num-bot">${slotNum}</span>
            </div>`;
        }
    }

    let borneHtml = `
        <div class="tavla-borne-area">
            <!-- Üst Tepsi: Rakip Toplanan -->
            <div class="tavla-borne-box borne-opp">
                <div class="borne-box-title">${oppBorneTitle}</div>
                <div class="borne-box-count"><b>${oppBorne}</b> / 15</div>
                <div class="borne-checkers-stack">
                    ${renderBorneCheckers(oppColor, oppBorne)}
                </div>
            </div>

            <div class="borne-divider"></div>

            <!-- Alt Tepsi: Benim Toplanan -->
            <div class="tavla-borne-box borne-my ${canBearOffNow ? 'target-point' : ''}" onclick="handleTavlaPointClick('off')">
                ${canBearOffNow ? '<div class="collect-btn-badge">Buraya Topla!</div>' : ''}
                <div class="borne-checkers-stack">
                    ${renderBorneCheckers(viewColor, myBorne)}
                </div>
                <div class="borne-box-count"><b>${myBorne}</b> / 15</div>
                <div class="borne-box-title">${myBorneTitle}</div>
            </div>
        </div>
    `;

    let barHtml = `
        <div class="tavla-bar" onclick="handleTavlaPointClick('bar')">
            <!-- Üst Kısım: Rakip Kırık -->
            <div class="bar-section bar-top">
                <div class="bar-sec-title">${oppBarTitle}</div>
                <div class="bar-checkers">
                    ${renderCheckers(oppColor, oppBar, false)}
                </div>
            </div>
            <div class="bar-divider"><span>BAR</span></div>
            <!-- Alt Kısım: Benim Kırık -->
            <div class="bar-section bar-bot ${selectedTavlaPoint === 'bar' ? 'selected-point' : ''}">
                <div class="bar-checkers">
                    ${renderCheckers(viewColor, myBar, selectedTavlaPoint === 'bar')}
                </div>
                <div class="bar-sec-title">${myBarTitle}</div>
            </div>
        </div>
    `;

    let fieldsHtml = `
        <div class="tavla-fields">
            <!-- Üst Sıra -->
            <div class="tavla-row top-row">
                <div class="tavla-quadrant quad-top-left ${!isSagAlt ? 'opp-home-quadrant' : ''}">
                    ${topSlotsLeft.map(s => renderPointHTML(s, true)).join('')}
                </div>
                <div class="tavla-vertical-divider"></div>
                <div class="tavla-quadrant quad-top-right ${isSagAlt ? 'opp-home-quadrant' : ''}">
                    ${topSlotsRight.map(s => renderPointHTML(s, true)).join('')}
                </div>
            </div>

            <!-- Yatay Ahşap İntarsiya Şeridi -->
            <div class="tavla-middle-divider">
                <div class="middle-line"></div>
            </div>

            <!-- Alt Sıra -->
            <div class="tavla-row bot-row">
                <div class="tavla-quadrant quad-bot-left ${!isSagAlt ? 'home-quadrant' : ''}">
                    ${bottomSlotsLeft.map(s => renderPointHTML(s, false)).join('')}
                </div>
                <div class="tavla-vertical-divider"></div>
                <div class="tavla-quadrant quad-bot-right ${isSagAlt ? 'home-quadrant' : ''}">
                    ${bottomSlotsRight.map(s => renderPointHTML(s, false)).join('')}
                </div>
            </div>
        </div>
    `;

    // SİMETRİK YERLEŞİM:
    // Sağ Alt seçildiyse: Solda Kırık Taşlar (Bar), Ortada Tahta, Sağda Toplama Tepsisi (Borne)
    // Sol Alt seçildiyse: Solda Toplama Tepsisi (Borne), Ortada Tahta, Sağda Kırık Taşlar (Bar)
    let html = `<div class="tavla-container ${isSagAlt ? 'tavla-layout-sag' : 'tavla-layout-sol'}">
        ${isSagAlt ? barHtml : borneHtml}
        ${fieldsHtml}
        ${isSagAlt ? borneHtml : barHtml}
    </div>`;

    boardEl.innerHTML = html;
}

function renderCheckers(player, count, isSelected) {
    if (!player || count <= 0) return "";
    let colorClass = player === 'white' ? 'checker-white' : 'checker-black';
    let countBadge = count > 5 ? `<span class="checker-count-badge">${count}</span>` : '';
    let visibleCount = Math.min(count, 5);

    let html = "";
    for (let i = 0; i < visibleCount; i++) {
        let isTopChecker = (i === visibleCount - 1);
        let selectedClass = (isSelected && isTopChecker) ? 'checker-selected' : '';
        html += `<div class="tavla-checker ${colorClass} ${selectedClass}">
            ${isTopChecker && count > 5 ? countBadge : ''}
        </div>`;
    }
    return html;
}

function renderBorneCheckers(player, count) {
    if (!count || count <= 0) return `<div class="empty-borne-hint">Boş</div>`;
    let colorClass = player === 'white' ? 'checker-white' : 'checker-black';
    let visible = Math.min(count, 6);
    let html = "";
    for (let i = 0; i < visible; i++) {
        html += `<div class="borne-checker-chip ${colorClass}"></div>`;
    }
    return html;
}

function handleTavlaRoll() {
    if (!currentTavlaState) return;
    const rollBtn = document.getElementById('tavlaRollBtn');
    if (rollBtn) {
        rollBtn.disabled = true;
        rollBtn.innerText = "🎲 Atılıyor...";
        rollBtn.style.opacity = '0.5';
    }
    if (window.playSound) window.playSound('chatPop');
    socket.emit('tavlaRoll');
}

function handleTavlaPointClick(pointIndex) {
    if (!currentTavlaState || window.isSpectating) return;

    let myPid = socket.id;
    let currentPid = currentTavlaState.players[currentTavlaState.turnIndex];
    if (currentPid !== myPid || !currentTavlaState.hasRolled || currentTavlaState.noMoves) return;

    // Eğer zaten bir taş seçiliyse ve geçerli bir hedef noktaya tıklandıysa
    if (selectedTavlaPoint !== null) {
        let matchingMove = tavlaValidTargets.find(t => t.target === pointIndex);
        if (matchingMove) {
            // Hamleyi gönder!
            if (window.playSound) window.playSound('card');
            socket.emit('tavlaMove', {
                fromPoint: selectedTavlaPoint,
                toPoint: pointIndex,
                usedDie: matchingMove.die
            });
            selectedTavlaPoint = null;
            tavlaValidTargets = [];
            return;
        }

        // Seçili taşa tekrar tıklanırsa ve toplama hamlesi varsa doğrudan topla
        if (selectedTavlaPoint === pointIndex) {
            let offMove = tavlaValidTargets.find(t => t.target === 'off');
            if (offMove) {
                if (window.playSound) window.playSound('card');
                socket.emit('tavlaMove', {
                    fromPoint: selectedTavlaPoint,
                    toPoint: 'off',
                    usedDie: offMove.die
                });
                selectedTavlaPoint = null;
                tavlaValidTargets = [];
                return;
            }
        }
    }

    // Yeni taş seçimi
    let myColor = currentTavlaState.playerColors[myPid];
    if (pointIndex === 'off') return;

    if (pointIndex === 'bar') {
        if (currentTavlaState.bar[myColor] > 0) {
            selectedTavlaPoint = 'bar';
            requestTavlaValidMoves('bar');
        }
        return;
    }

    // Kırık taş varken normal kapılardan taş seçilemez
    if (currentTavlaState.bar[myColor] > 0) {
        const errToast = document.getElementById('errorToast');
        if (errToast) {
            errToast.innerText = "Önce kırık taşınızı oyuna sokmalısınız!";
            errToast.style.display = 'block';
            setTimeout(() => { errToast.style.display = 'none'; }, 2500);
        }
        return;
    }

    let pt = currentTavlaState.board[pointIndex];
    if (pt && pt.player === myColor && pt.count > 0) {
        selectedTavlaPoint = pointIndex;
        requestTavlaValidMoves(pointIndex);
    } else {
        selectedTavlaPoint = null;
        tavlaValidTargets = [];
        renderTavlaBoard(currentTavlaState);
    }
}

function requestTavlaValidMoves(fromPoint) {
    socket.emit('getTavlaValidMoves', { fromPoint: fromPoint });
}

socket.on('tavlaValidMovesResponse', (data) => {
    tavlaValidTargets = data.moves || [];
    if (currentTavlaState) {
        renderTavlaBoard(currentTavlaState);
    }
});
