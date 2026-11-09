// public/js/okey101.js - 101 Okey İstemci Mantığı (Eşli & Tekli Kıraathane & A4 Yazboz)

let okey101Data = null;
let okey101SelectedIds = [];

// Socket Dinleyicisi
socket.on('okey101Update', (data) => {
    if (!data) return;
    if (data.playerInfos && data.playerInfos[socket.id]?.isDisconnected) {
        return; // Masadan ayrılmış oyuncuya modal açma!
    }
    if (!data.isSpectator && data.players && !data.players.includes(socket.id)) {
        return;
    }
    if (typeof currentRoom !== 'undefined' && !['kafe', 'dostlar_kiraathanesi', 'nargile_cafe'].includes(currentRoom)) {
        return;
    }

    okey101Data = data;
    window.currentActiveTableId = data.tableId;

    // Modalleri Aç/Kapat
    const gameModal = document.getElementById('gameModal');
    const okeyArea = document.getElementById('okey101Area');
    const batakArea = document.getElementById('batakArea');
    const billiardArea = document.getElementById('billiardArea');
    const tavlaArea = document.getElementById('tavlaArea');

    if (gameModal) {
        if (gameModal.style.display === 'none' || !gameModal.style.display) {
            gameModal.style.transform = 'translate(-50%, -50%)';
            gameModal.style.left = '50%';
            gameModal.style.top = '50%';
            gameModal.style.animation = '';
        }
        gameModal.style.display = 'flex';
    }
    if (batakArea) batakArea.style.display = 'none';
    if (billiardArea) billiardArea.style.display = 'none';
    if (tavlaArea) tavlaArea.style.display = 'none';
    if (okeyArea) okeyArea.style.display = 'block';

    if (window.setVoiceTable && data.tableId) {
        window.setVoiceTable(data.tableId);
    }

    const tableReactionArea = document.getElementById('tableReactionArea');
    if (tableReactionArea) tableReactionArea.style.display = 'none';

    // Gösterge Açma / Gösterme Butonu Kontrolü (Oyun başında ilk taş çekilmeden önce)
    const revealBtn = document.getElementById('okey101RevealGostergeBtn');
    if (revealBtn) {
        revealBtn.style.display = (data.canRevealGosterge && !data.isSpectator) ? 'inline-block' : 'none';
    }

    if (window.startTurnTimer) window.startTurnTimer(data.turnTimeout || 40);

    // 1. Başlık ve El Bilgisi
    if (window.currentOkey101Round !== data.roundNumber) {
        window.currentOkey101Round = data.roundNumber;
        window.okey101RackSlots = null;
        okey101SelectedIds = [];
        closeYazbozModal();
        closeVictoryOverlay();
    } else if (!data.gameOver) {
        closeVictoryOverlay();
    }

    const headerTitle = document.getElementById('okey101HeaderTitle');
    if (headerTitle) {
        let modeLabel = (data.mode === 'esli') ? "Eşli (2v2)" : "Tekli";
        headerTitle.innerText = `101 Okey (${modeLabel} - Cezalı & Katlamasız)`;
    }

    const roundBadge = document.getElementById('okey101RoundBadge');
    if (roundBadge) roundBadge.innerText = `${data.roundNumber || 1}. El`;

    const statusEl = document.getElementById('okey101Status');
    if (statusEl) {
        if (data.isSpectator) {
            statusEl.innerText = `İzleyicisin (Yancı) - Sıra: ${data.turnPlayerName}`;
            statusEl.style.color = '#38bdf8';
        } else if (data.gameOver) {
            let wName = data.playerInfos[data.winner] ? data.playerInfos[data.winner].name : (data.winner ? "Biri" : "Kimse (Deste Bitti)");
            statusEl.innerText = data.winner ? `El Bitti! Kazanan: ${wName}` : "Deste Bitti! El sona erdi.";
            statusEl.style.color = '#34d399';

            if (!window.celebratedRound || window.celebratedRound !== data.roundNumber) {
                window.celebratedRound = data.roundNumber;
                if (data.winner) {
                    triggerVictoryCelebration(wName, data);
                } else {
                    openYazbozModal();
                }
            }
        } else if (data.myTurn) {
            window.celebratedRound = null;
            if (!data.drawnThisTurn) {
                statusEl.innerText = "SIRA SENDE! Desteden veya solundan taş çek.";
                statusEl.style.color = '#facc15';
            } else if (data.lastDrawnTile && !data.lastDiscardTaken) {
                let dName = getOkeyTileName(data.lastDrawnTile, data.okeyDef);
                statusEl.innerText = `SIRA SENDE! Desteden [${dName}] çektin. El açabilir, işleyebilir veya taş atabilirsin.`;
                statusEl.style.color = '#34d399';
            } else {
                statusEl.innerText = "SIRA SENDE! El açabilir, işleyebilir veya taş atabilirsin.";
                statusEl.style.color = '#34d399';
            }
        } else {
            statusEl.innerText = `Sıra ${data.turnPlayerName} adlı oyuncuda...`;
            statusEl.style.color = '#cbd5e1';
        }
    }

    // 2. Skor Tablosu (4 Oyuncu & Takımlar)
    renderScoreboard(data);

    // 3. Gösterge ve Okey Taşı
    renderIndicators(data);

    // 4. Kalan Deste ve 4 Köşe Atılan Taşlar
    renderDeckAndDiscards(data);

    // 5. Masaya Açılmış Perler (4 Oyuncu Kendi Önüne)
    renderTableOpenedPers(data);

    // 6. Oyuncunun Istakası
    renderPlayerHand(data);

    // 7. A4 Kıraathane Yazboz Çetelesi
    renderYazboz(data);
});

// Masadan Ayrılma Olayı
socket.on('tableLeft', () => {
    if (window.leaveTableVoiceChat) window.leaveTableVoiceChat();
    okey101Data = null;
    window.currentActiveTableId = null;
    const gameModal = document.getElementById('gameModal');
    if (gameModal) {
        gameModal.style.display = 'none';
        gameModal.style.transform = 'translate(-50%, -50%)';
        gameModal.style.left = '50%';
        gameModal.style.top = '50%';
        gameModal.style.animation = '';
    }
    const okeyArea = document.getElementById('okey101Area');
    if (okeyArea) okeyArea.style.display = 'none';
});

// Oyuncu Skor & Ceza Kartları (Takım ve Eş Rozetleri)
function renderScoreboard(data) {
    const sb = document.getElementById('okey101Scoreboard');
    if (!sb) return;

    sb.innerHTML = "";
    data.players.forEach((pid, idx) => {
        let p = data.playerInfos[pid] || { name: "Oyuncu", score: 0, penalties: 0, hasOpened: false, tileCount: 0 };
        let isTurn = (pid === data.players[data.turnIndex]);
        let turnClass = isTurn ? 'turn-pulse' : '';
        let turnBorder = isTurn
            ? 'border: 2px solid #facc15; box-shadow: 0 0 14px rgba(250, 204, 21, 0.7); background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.9));'
            : 'border: 1px solid rgba(255,255,255,0.1); background: rgba(15, 23, 42, 0.85);';

        let openedBadge = p.hasOpened
            ? `<span style="background:linear-gradient(135deg,#059669,#10b981); color:white; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; box-shadow:0 0 6px rgba(16,185,129,0.4);">Açtı</span>`
            : `<span style="background:#475569; color:#cbd5e1; font-size:9px; font-weight:700; padding:2px 6px; border-radius:4px;">Açmadı</span>`;

        let penaltyBadge = p.penalties > 0
            ? `<span style="background:rgba(239,68,68,0.2); border:1px solid #ef4444; color:#fca5a5; font-weight:800; font-size:10px; padding:1px 5px; border-radius:4px;">+${p.penalties} Ceza</span>`
            : '';

        // Eşli Mod Takım Rozetleri
        let teamBadge = "";
        let partnerBadge = "";
        if (data.mode === 'esli') {
            let isTeam1 = (idx === 0 || idx === 2);
            teamBadge = isTeam1
                ? `<span style="background:linear-gradient(135deg,#1d4ed8,#2563eb); color:white; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px; box-shadow:0 0 6px rgba(37,99,235,0.4);">1. Grup</span>`
                : `<span style="background:linear-gradient(135deg,#c2410c,#ea580c); color:white; font-size:9px; font-weight:900; padding:2px 6px; border-radius:4px; box-shadow:0 0 6px rgba(234,88,12,0.4);">2. Grup</span>`;

            if (pid === data.partnerId) {
                partnerBadge = `<span style="color:#38bdf8; font-size:10px; font-weight:bold;">(Ortağın)</span>`;
                if (data.partnerOpened) {
                    partnerBadge += ` <span style="color:#34d399; font-size:10px; font-weight:bold;">✨ Açtı!</span>`;
                }
            }
        }

        let isSelf = (pid === socket.id);
        let namePrefix = isSelf ? "(Sen) " : "";
        let disconnectedHtml = "";
        if (data.disconnectedPlayers && data.disconnectedPlayers[pid]) {
            disconnectedHtml = `
                <div style="margin-top:4px; padding-top:4px; border-top:1px dashed rgba(239,68,68,0.4); display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:#ef4444; font-size:9.5px; font-weight:800;">⚠️ Masadan Ayrıldı</span>
                    <button onclick="okey101AssignBot('${pid}')" style="padding:2px 7px; background:linear-gradient(135deg,#8b5cf6,#6d28d9); color:white; border:none; border-radius:4px; font-size:9.5px; font-weight:bold; cursor:pointer; box-shadow:0 1px 4px rgba(139,92,246,0.4);" title="Boş koltuğa yapay zeka bot ata">🤖 Bota Devret</button>
                </div>
            `;
        } else if (data.isSpectator && p.isBot) {
            disconnectedHtml = `
                <div style="margin-top:4px; padding-top:4px; border-top:1px dashed rgba(139,92,246,0.4); display:flex; justify-content:center;">
                    <button onclick="takeoverSeat('${data.tableId}', '${pid}')" style="width:100%; padding:3px 8px; background:linear-gradient(135deg,#8b5cf6,#6366f1); color:white; border:none; border-radius:5px; font-size:10px; font-weight:bold; cursor:pointer; box-shadow:0 1px 4px rgba(139,92,246,0.4);" title="Bu botun koltuğunu devral">🤖 ${p.name} Yerine Otur</button>
                </div>
            `;
        }

        sb.innerHTML += `
            <div class="${turnClass}" id="okey101PlayerCard_${pid}" style="padding: 8px 10px; border-radius: 9px; ${turnBorder} text-align: left; transition: all 0.2s;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px; gap:4px;">
                    <div style="display:flex; align-items:center; gap:4px; overflow:hidden;">
                        <b style="font-size:12px; color:${p.color || '#fff'}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:85px;">${namePrefix}${p.name}</b>
                        ${partnerBadge}
                    </div>
                    <div style="display:flex; gap:3px;">
                        ${teamBadge}
                        ${openedBadge}
                    </div>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; color:#cbd5e1; margin-top:3px;">
                    <span>Taş: <b style="color:#f8fafc;">${p.tileCount}</b></span>
                    <span>Ceza: <b style="color:#facc15; font-size:12px;">${p.score}</b></span>
                </div>
                ${penaltyBadge ? `<div style="text-align:right; margin-top:3px;">${penaltyBadge}</div>` : ''}
                ${disconnectedHtml}
            </div>
        `;
    });
}

// Gösterge Taşını Çiz (Okey Taşı masaya konmaz, göstergeden anlaşılır)
function renderIndicators(data) {
    const gEl = document.getElementById('okey101GostergeTile');
    if (gEl && data.gosterge) {
        let isFake = data.gosterge.isFakeOkey;
        let colorCls = isFake ? 'sahte' : data.gosterge.color;
        let text = isFake ? '⭐' : data.gosterge.value;
        gEl.className = `okey-tile mini ${colorCls}`;
        gEl.innerHTML = `<span>${text}</span>`;
    }
}

// Deste ve 4 Köşe Yönlü Atılan Taşlar (Sol-Alt, Sağ-Alt, Sağ-Üst, Sol-Üst)
function renderDeckAndDiscards(data) {
    const drawCountEl = document.getElementById('okey101DrawCount');
    if (drawCountEl) drawCountEl.innerText = `Deste: ${data.drawPileCount}`;

    let myPid = socket.id;
    let playersList = data.players || [];
    let myIdx = playersList.indexOf(myPid);
    if (myIdx === -1) myIdx = 0;
    let n = 4;

    let rightIdx = (myIdx + 1) % n;
    let topIdx = (myIdx + 2) % n;
    let leftIdx = (myIdx + 3) % n;

    let rightPid = playersList[rightIdx];
    let topPid = playersList[topIdx];
    let leftPid = playersList[leftIdx];

    let myP = data.playerInfos[myPid];
    let rightP = data.playerInfos[rightPid];
    let topP = data.playerInfos[topPid];
    let leftP = data.playerInfos[leftPid];

    function renderSlotTile(containerId, tile, isHighlight) {
        const el = document.getElementById(containerId);
        if (!el) return;
        if (tile) {
            let isFake = tile.isFakeOkey;
            let colorCls = isFake ? 'sahte' : tile.color;
            let text = isFake ? '⭐' : tile.value;
            let extraGlow = isHighlight ? 'box-shadow: 0 0 12px rgba(56,189,248,0.7);' : '';
            el.innerHTML = `<div class="okey-tile mini ${colorCls}" style="${extraGlow}"><span>${text}</span></div>`;
        } else {
            el.innerHTML = `<span class="slot-empty">Boş</span>`;
        }
    }

    // 1. SOL-ALT: Solundaki oyuncudan sana atılan taş (Alabileceğin taş)
    renderSlotTile('okey101LeftTileContainer', leftP?.lastDiscard, true);
    const takeDiscardBtn = document.getElementById('okey101TakeDiscardBtn');
    if (takeDiscardBtn) {
        let canShowTakeBtn = data.canTakeDiscard && data.myTurn && !data.gameOver && (data.drawPileCount > 0);
        takeDiscardBtn.style.display = canShowTakeBtn ? 'block' : 'none';
        takeDiscardBtn.innerHTML = "🖐️ Taşı Al";
    }

    // 2. SAĞ-ALT: Senin sağındaki oyuncuya attığın taş
    renderSlotTile('okey101RightTileContainer', myP?.lastDiscard, false);

    // 3. SAĞ-ÜST: Sağındaki oyuncunun karşıdaki oyuncuya attığı taş
    renderSlotTile('okey101TopRightTileContainer', rightP?.lastDiscard, false);

    // 4. SOL-ÜST: Karşıdaki oyuncunun solundaki oyuncuya attığı taş
    renderSlotTile('okey101TopLeftTileContainer', topP?.lastDiscard, false);
}

// 4 Ayrı Bölgeye Oyuncu Perlerini Çiz (Herkes Kendi Önüne Açar)
function renderTableOpenedPers(data) {
    let myPid = socket.id;
    let playersList = data.players || [];
    let myIdx = playersList.indexOf(myPid);
    if (myIdx === -1) myIdx = 0;
    let n = 4;

    let rightIdx = (myIdx + 1) % n;
    let topIdx = (myIdx + 2) % n;
    let leftIdx = (myIdx + 3) % n;

    let rightPid = playersList[rightIdx];
    let topPid = playersList[topIdx];
    let leftPid = playersList[leftIdx];

    let myP = data.playerInfos[myPid];
    let rightP = data.playerInfos[rightPid];
    let topP = data.playerInfos[topPid];
    let leftP = data.playerInfos[leftPid];

    let allPers = (data.tableOpenedPers || []).map((per, originalIndex) => ({ per, originalIndex }));
    let topPers = allPers.filter(item => item.per.ownerId === topPid);
    let leftPers = allPers.filter(item => item.per.ownerId === leftPid);
    let rightPers = allPers.filter(item => item.per.ownerId === rightPid);
    let myPers = allPers.filter(item => item.per.ownerId === myPid);

    let canProcess = data.myTurn && data.drawnThisTurn && !!data.playerInfos[socket.id]?.hasOpened;

    function renderZonePersList(containerId, persList, emptyMsg) {
        const container = document.getElementById(containerId);
        if (!container) return 0;

        if (!persList || persList.length === 0) {
            container.innerHTML = `<div class="zone-empty-text">${emptyMsg}</div>`;
            return 0;
        }

        container.innerHTML = "";
        let totalZoneScore = 0;

        persList.forEach(({ per, originalIndex }) => {
            let hasOkeyInPer = false;
            let seriInfo = (per.type !== 'cift') ? resolveSeries(per.tiles, data.okeyDef) : null;
            let displayTiles = (per.type === 'cift')
                ? sortPairTiles(per.tiles, data.okeyDef, data.gosterge)
                : (seriInfo ? seriInfo.sortedTiles : sortPerTiles(per.tiles, per.type, data.okeyDef));

            let perSum = (per.type === 'cift')
                ? getPairScore(displayTiles, data.okeyDef)
                : getPerScore(displayTiles, data.okeyDef);

            let tilesHtml = displayTiles.map((t, tIdx) => {
                let isOkey = isRealOkey(t, data.okeyDef);
                if (isOkey) hasOkeyInPer = true;
                let colorCls = t.isFakeOkey ? 'sahte' : t.color;
                let okeyCls = isOkey ? 'gold-border' : '';
                let text = t.isFakeOkey ? '⭐' : (isOkey ? `👑${t.value}` : t.value);
                let slotValHint = (isOkey && seriInfo && seriInfo.req && seriInfo.req[tIdx])
                    ? ` title="Okey (${seriInfo.req[tIdx]} yerine işliyor)"`
                    : '';
                return `<div class="okey-tile mini ${colorCls} ${okeyCls}"${slotValHint}><span>${text}</span></div>`;
            }).join('');

            totalZoneScore += perSum;

            let actionButtons = "";
            if (canProcess) {
                let addBtns = `
                    <button onclick="okey101AddSelectedToPer(${originalIndex}, 'start')" style="padding:2px 5px; font-size:9px; background:linear-gradient(135deg,#0284c7,#0369a1); color:white; border:none; border-radius:4px; font-weight:800; cursor:pointer;" title="Seçili taşı perin başına ekle">◀</button>
                    <button onclick="okey101AddSelectedToPer(${originalIndex}, 'end')" style="padding:2px 5px; font-size:9px; background:linear-gradient(135deg,#0284c7,#0369a1); color:white; border:none; border-radius:4px; font-weight:800; cursor:pointer;" title="Seçili taşı perin sonuna ekle">▶</button>
                `;

                let takeOkeyBtn = "";
                if (hasOkeyInPer && per.type !== 'cift') {
                    takeOkeyBtn = `
                        <button onclick="okey101TakeOkeyFromPer(${originalIndex})" style="padding:2px 6px; font-size:9px; background:linear-gradient(135deg,#f59e0b,#d97706); color:white; border:none; border-radius:4px; cursor:pointer; font-weight:900;" title="Masadaki Okey'i al (Rakibe +101 Ceza)">👑 Al</button>
                    `;
                }

                actionButtons = `
                    <div style="display:flex; flex-direction:column; gap:2px; margin-left:4px;">
                        <div style="display:flex; gap:2px;">${addBtns}</div>
                        ${takeOkeyBtn}
                    </div>
                `;
            }

            let perTypeBadge = per.type === 'cift'
                ? `<span style="font-size:8.5px; background:rgba(245,158,11,0.2); color:#fbbf24; border:1px solid rgba(245,158,11,0.4); padding:1px 4px; border-radius:3px; font-weight:800;">Çift</span>`
                : `<span style="font-size:8.5px; background:rgba(56,189,248,0.2); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:1px 4px; border-radius:3px; font-weight:800;">${perSum}p</span>`;

            container.innerHTML += `
                <div id="openPer_${originalIndex}" 
                     class="okey-open-per-group" 
                     style="padding: 3px 5px; margin-right: 4px; margin-bottom: 4px; cursor: pointer;"
                     ondragover="okey101PerDragOver(event, ${originalIndex})"
                     ondragleave="okey101PerDragLeave(event, ${originalIndex})"
                     ondrop="okey101PerDrop(event, ${originalIndex})"
                     onclick="okey101PerClick(event, ${originalIndex})"
                     title="Taşı bu pere sürükleyip bırakarak (veya seçip tıklayarak) işleyebilirsiniz">
                    <div style="display:flex; align-items:center; margin-right:3px;">
                        ${perTypeBadge}
                    </div>
                    <div style="display:flex; gap:1px; align-items:center;">${tilesHtml}</div>
                    ${actionButtons}
                </div>
            `;
        });

        return totalZoneScore;
    }

    // 1. ÜST (KARŞI) BÖLGE
    let topScore = renderZonePersList('okey101TopOpenedPersList', topPers, "Henüz el açmadı.");
    const topNameEl = document.getElementById('okey101TopZoneName');
    const topBadgeEl = document.getElementById('okey101TopZoneBadge');
    const topScoreEl = document.getElementById('okey101TopZoneScore');
    const topTeamEl = document.getElementById('okey101TopZoneTeam');
    if (topNameEl) topNameEl.innerText = topP ? topP.name : "-";
    if (topTeamEl) {
        topTeamEl.innerHTML = (topPid === data.partnerId) ? `<span style="color:#60a5fa; font-size:10px;">(Ortağın)</span>` : '';
    }
    if (topBadgeEl) {
        topBadgeEl.className = topP?.hasOpened ? "zone-badge opened" : "zone-badge unopened";
        topBadgeEl.innerText = topP?.hasOpened ? "Açtı" : "Açmadı";
    }
    if (topScoreEl) {
        topScoreEl.innerText = topP?.hasOpened ? `Toplam: ${topScore} Puan` : '';
    }

    // 2. SOL BÖLGE
    renderZonePersList('okey101LeftOpenedPersList', leftPers, "Henüz el açmadı.");
    const leftNameEl = document.getElementById('okey101LeftZoneName');
    const leftBadgeEl = document.getElementById('okey101LeftZoneBadge');
    if (leftNameEl) leftNameEl.innerText = leftP ? leftP.name : "Sol";
    if (leftBadgeEl) {
        leftBadgeEl.className = leftP?.hasOpened ? "zone-badge opened" : "zone-badge unopened";
        leftBadgeEl.innerText = leftP?.hasOpened ? "Açtı" : "Açmadı";
    }

    // 3. SAĞ BÖLGE
    renderZonePersList('okey101RightOpenedPersList', rightPers, "Henüz el açmadı.");
    const rightNameEl = document.getElementById('okey101RightZoneName');
    const rightBadgeEl = document.getElementById('okey101RightZoneBadge');
    if (rightNameEl) rightNameEl.innerText = rightP ? rightP.name : "Sağ";
    if (rightBadgeEl) {
        rightBadgeEl.className = rightP?.hasOpened ? "zone-badge opened" : "zone-badge unopened";
        rightBadgeEl.innerText = rightP?.hasOpened ? "Açtı" : "Açmadı";
    }

    // 4. ALT (BENİM) BÖLGEM
    let myScore = renderZonePersList('okey101BottomOpenedPersList', myPers, "Henüz el açmadın (En az 101 puan veya 5 çift gereklidir).");
    const myNameEl = document.getElementById('okey101MyZoneName');
    const myBadgeEl = document.getElementById('okey101MyZoneBadge');
    const myScoreEl = document.getElementById('okey101MyZoneScore');
    if (myNameEl) myNameEl.innerText = myP ? myP.name : "Sen";
    if (myBadgeEl) {
        myBadgeEl.className = myP?.hasOpened ? "zone-badge opened" : "zone-badge unopened";
        myBadgeEl.innerText = myP?.hasOpened ? "Açtın" : "Açmadın";
    }
    if (myScoreEl) {
        myScoreEl.innerText = myP?.hasOpened ? `Toplam: ${myScore} Puan` : '';
    }
}

// Masadaki Okey'i Geri Alma Aksiyonu
function okey101TakeOkeyFromPer(perIndex) {
    if (!okey101Data || !okey101Data.myTurn) return;
    if (okey101SelectedIds.length !== 1) {
        alert("Masadaki Okey'i almak için lütfen ıstakanızdan Okey'in yerine geçecek tam 1 taşı seçin!");
        return;
    }
    let tileId = okey101SelectedIds[0];
    okey101SelectedIds = [];
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101TakeOkey', { perIndex: perIndex, tileId: tileId });
}

// Sürükle ve Bırak ile Istaka Taşlarını Dizebilme (30 Yuvalı 2 Raflı Sistem)
let okey101DraggedId = null;
let okey101DraggedSlotIdx = null;

function okey101DragStart(e, tileId, slotIdx) {
    if (e.stopPropagation) e.stopPropagation();
    okey101DraggedId = tileId;
    okey101DraggedSlotIdx = slotIdx;

    const tileEl = e.currentTarget || (e.target && e.target.closest ? e.target.closest('.okey-tile') : e.target);
    if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', tileId);

        if (tileEl && e.dataTransfer.setDragImage) {
            // Tamamen izole sadece bu taşı temsil eden temiz bir klon oluşturuyoruz (tüm ıstaka kutusunun sürüklenmesini önler)
            const ghost = tileEl.cloneNode(true);
            ghost.id = 'okey_drag_ghost_clone';
            ghost.style.position = 'fixed';
            ghost.style.top = '-9999px';
            ghost.style.left = '-9999px';
            ghost.style.zIndex = '999999';
            ghost.style.pointerEvents = 'none';
            ghost.style.transform = 'none';
            ghost.style.transition = 'none';
            ghost.style.margin = '0';
            ghost.style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
            ghost.style.opacity = '0.95';
            document.body.appendChild(ghost);

            const rect = tileEl.getBoundingClientRect();
            const offsetX = (rect.width ? rect.width / 2 : 20);
            const offsetY = (rect.height ? rect.height / 2 : 26);

            try {
                e.dataTransfer.setDragImage(ghost, offsetX, offsetY);
            } catch (err) {
                console.warn('setDragImage error:', err);
            }

            setTimeout(() => {
                if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
            }, 0);
        }
    }

    if (tileEl) {
        setTimeout(() => {
            if (okey101DraggedId) tileEl.style.opacity = '0.35';
        }, 0);
    }
}
window.okey101DragStart = okey101DragStart;

function okey101SlotDragOver(e, slotIdx) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const el = document.getElementById(`okeySlot_${slotIdx}`);
    if (el) el.classList.add('drag-over');
}
window.okey101SlotDragOver = okey101SlotDragOver;

function okey101SlotDragLeave(e, slotIdx) {
    const el = document.getElementById(`okeySlot_${slotIdx}`);
    if (el) el.classList.remove('drag-over');
}
window.okey101SlotDragLeave = okey101SlotDragLeave;

function okey101SlotDrop(e, targetSlotIdx) {
    e.preventDefault();
    const el = document.getElementById(`okeySlot_${targetSlotIdx}`);
    if (el) el.classList.remove('drag-over');

    if (!window.okey101RackSlots) return;
    if (okey101DraggedSlotIdx === null || okey101DraggedSlotIdx === targetSlotIdx) {
        okey101DraggedId = null;
        okey101DraggedSlotIdx = null;
        return;
    }

    let fromIdx = okey101DraggedSlotIdx;
    let toIdx = targetSlotIdx;

    let sourceTileId = window.okey101RackSlots[fromIdx];
    let targetTileId = window.okey101RackSlots[toIdx];

    // İki yuva arasındaki taşı taşı veya takas et
    window.okey101RackSlots[toIdx] = sourceTileId;
    window.okey101RackSlots[fromIdx] = targetTileId;

    if (window.playSound) window.playSound('okeyTile');
    okey101DraggedId = null;
    okey101DraggedSlotIdx = null;
    renderPlayerHand(okey101Data);
}
window.okey101SlotDrop = okey101SlotDrop;

// Boş Yuvaya Tıklayarak Taşı Taşıma (Tek Tıkla Taşı Boşluğa veya Sağa Gönderme)
function okey101EmptySlotClick(slotIdx) {
    if (!okey101Data || !window.okey101RackSlots) return;

    // Eğer ıstakada tam 1 taş seçilmişse, o taşı doğrudan tıklanan boş yuvaya taşı!
    if (okey101SelectedIds.length === 1) {
        let selTileId = okey101SelectedIds[0];
        let fromIdx = window.okey101RackSlots.indexOf(selTileId);
        if (fromIdx !== -1 && fromIdx !== slotIdx) {
            window.okey101RackSlots[fromIdx] = null;
            window.okey101RackSlots[slotIdx] = selTileId;
            if (window.playSound) window.playSound('okeyTile');
            renderPlayerHand(okey101Data);
        }
    }
}
window.okey101EmptySlotClick = okey101EmptySlotClick;

// Masadaki Per Üzerine Taş Sürükleme ve Bırakma (İşleme)
function okey101PerDragOver(e, perIndex) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    const el = document.getElementById(`openPer_${perIndex}`);
    if (el) el.classList.add('per-drag-over');
}
window.okey101PerDragOver = okey101PerDragOver;

function okey101PerDragLeave(e, perIndex) {
    const el = document.getElementById(`openPer_${perIndex}`);
    if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) {
        el.classList.remove('per-drag-over');
    }
}
window.okey101PerDragLeave = okey101PerDragLeave;

function okey101PerDrop(e, perIndex) {
    e.preventDefault();
    const el = document.getElementById(`openPer_${perIndex}`);
    if (el) el.classList.remove('per-drag-over');

    if (!okey101Data) return;

    if (!okey101Data.myTurn) {
        alert("Sıra sizde değilken masaya taş işleyemezsiniz!");
        return;
    }
    if (!okey101Data.drawnThisTurn) {
        alert("Taş işlemeden önce desteden veya solunuzdan taş çekmelisiniz!");
        return;
    }
    let myInfo = okey101Data.playerInfos && okey101Data.playerInfos[socket.id];
    if (!myInfo || !myInfo.hasOpened) {
        alert("⚠️ Masaya taş işleyebilmek için önce kendi elinizi açmış (en az 101 puan veya 5 çift) olmanız gerekir!");
        return;
    }

    let tileId = okey101DraggedId || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
    if (!tileId) return;

    // İmleç perin sol yarısında mı sağ yarısında mı bırakıldı?
    let position = 'end';
    if (el) {
        let rect = el.getBoundingClientRect();
        let midX = rect.left + rect.width / 2;
        if (e.clientX < midX) {
            position = 'start';
        }
    }

    okey101DraggedId = null;
    okey101DraggedSlotIdx = null;

    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101AddTileToPer', {
        tileIds: [tileId],
        tileId: tileId,
        targetPerIndex: perIndex,
        position: position
    });
}
window.okey101PerDrop = okey101PerDrop;

// Seçili Taşı Masadaki Pere Tıklayarak İşleme Alternatifi
function okey101PerClick(e, perIndex) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    if (!okey101Data || !okey101Data.myTurn) return;
    if (okey101SelectedIds.length === 0) return;

    if (!okey101Data.drawnThisTurn) {
        alert("Taş işlemeden önce desteden veya solunuzdan taş çekmelisiniz!");
        return;
    }
    let myInfo = okey101Data.playerInfos && okey101Data.playerInfos[socket.id];
    if (!myInfo || !myInfo.hasOpened) {
        alert("⚠️ Masaya taş işleyebilmek için önce kendi elinizi açmış olmanız gerekir!");
        return;
    }

    let el = document.getElementById(`openPer_${perIndex}`);
    let position = 'end';
    if (el) {
        let rect = el.getBoundingClientRect();
        let midX = rect.left + rect.width / 2;
        if (e.clientX < midX) position = 'start';
    }

    let tileIds = [...okey101SelectedIds];
    okey101SelectedIds = [];
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101AddTileToPer', {
        tileIds: tileIds,
        tileId: tileIds[0],
        targetPerIndex: perIndex,
        position: position
    });
}
window.okey101PerClick = okey101PerClick;

function _cleanupOkeyTouchGhost() {
    if (!_okeyTouchDrag) return;
    if (_okeyTouchDrag.sourceEl) _okeyTouchDrag.sourceEl.style.opacity = '';
    if (_okeyTouchDrag.ghostEl && _okeyTouchDrag.ghostEl.parentNode) {
        _okeyTouchDrag.ghostEl.parentNode.removeChild(_okeyTouchDrag.ghostEl);
    }
    _okeyTouchDrag = null;
}

function okey101DragEnd(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    _cleanupOkeyTouchGhost();
    okey101DraggedId = null;
    okey101DraggedSlotIdx = null;
    document.querySelectorAll('.okey-rack-slot .okey-tile').forEach(el => {
        el.style.opacity = '';
    });
    document.querySelectorAll('.per-drag-over').forEach(el => el.classList.remove('per-drag-over'));
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    document.querySelectorAll('.discard-drag-over').forEach(el => el.classList.remove('discard-drag-over'));
    document.querySelectorAll('.discard-btn-drag-over').forEach(el => el.classList.remove('discard-btn-drag-over'));

    const clone = document.getElementById('okey_drag_ghost_clone');
    if (clone && clone.parentNode) clone.parentNode.removeChild(clone);
}
window.okey101DragEnd = okey101DragEnd;

// 📱 MOBİL DOKUNMATİK TAŞ SÜRÜKLEME & BIRAKMA MOTORU (iOS & Android Uyumlu)
let _okeyTouchDrag = null;
window._okeySuppressClickUntil = 0;

function okey101TileTouchStart(e, tileId, slotIdx) {
    _cleanupOkeyTouchGhost();
    if (!e.touches || e.touches.length !== 1) return;
    const t = e.touches[0];
    _okeyTouchDrag = {
        tileId: tileId,
        slotIdx: slotIdx,
        startX: t.clientX,
        startY: t.clientY,
        dragging: false,
        sourceEl: e.currentTarget,
        ghostEl: null
    };
}
window.okey101TileTouchStart = okey101TileTouchStart;

window.addEventListener('touchmove', (e) => {
    if (!_okeyTouchDrag || !e.touches || !e.touches[0]) return;
    const t = e.touches[0];
    const dist = Math.hypot(t.clientX - _okeyTouchDrag.startX, t.clientY - _okeyTouchDrag.startY);

    if (!_okeyTouchDrag.dragging && dist > 8) {
        _okeyTouchDrag.dragging = true;
        okey101DraggedId = _okeyTouchDrag.tileId;
        okey101DraggedSlotIdx = _okeyTouchDrag.slotIdx;

        if (_okeyTouchDrag.sourceEl) {
            const ghost = _okeyTouchDrag.sourceEl.cloneNode(true);
            ghost.style.position = 'fixed';
            ghost.style.zIndex = '999999';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '0.94';
            ghost.style.margin = '0';
            ghost.style.transform = 'translate(-50%, -85%) scale(1.12)';
            ghost.style.boxShadow = '0 12px 26px rgba(0,0,0,0.65)';
            ghost.style.transition = 'none';
            document.body.appendChild(ghost);
            _okeyTouchDrag.ghostEl = ghost;
            _okeyTouchDrag.sourceEl.style.opacity = '0.35';
        }
    }

    if (_okeyTouchDrag.dragging) {
        if (e.cancelable) e.preventDefault();
        if (_okeyTouchDrag.ghostEl) {
            _okeyTouchDrag.ghostEl.style.left = t.clientX + 'px';
            _okeyTouchDrag.ghostEl.style.top = t.clientY + 'px';
        }

        document.querySelectorAll('.per-drag-over').forEach(el => el.classList.remove('per-drag-over'));
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        document.querySelectorAll('.discard-drag-over').forEach(el => el.classList.remove('discard-drag-over'));
        document.querySelectorAll('.discard-btn-drag-over').forEach(el => el.classList.remove('discard-btn-drag-over'));

        const under = document.elementFromPoint(t.clientX, t.clientY);
        if (under) {
            const slotEl = under.closest('.okey-rack-slot');
            const perEl = under.closest('[id^="openPer_"]');
            const discSlotEl = under.closest('#okey101RightDiscardSlot');
            const discBtnEl = under.closest('#okey101DiscardBtn');
            if (slotEl) slotEl.classList.add('drag-over');
            else if (perEl) perEl.classList.add('per-drag-over');
            else if (discSlotEl || discBtnEl) {
                const ds = document.getElementById('okey101RightDiscardSlot');
                const db = document.getElementById('okey101DiscardBtn');
                if (ds) ds.classList.add('discard-drag-over');
                if (db) db.classList.add('discard-btn-drag-over');
            }
        }
    }
}, { passive: false });

function _finishOkeyTouchDrag(e, isCancel) {
    if (!_okeyTouchDrag) return;
    const state = _okeyTouchDrag;
    _okeyTouchDrag = null;

    if (state.sourceEl) state.sourceEl.style.opacity = '';
    if (state.ghostEl && state.ghostEl.parentNode) {
        state.ghostEl.parentNode.removeChild(state.ghostEl);
    }

    if (state.dragging && !isCancel) {
        window._okeySuppressClickUntil = Date.now() + 360;
        const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
        if (t) {
            const under = document.elementFromPoint(t.clientX, t.clientY);
            if (under) {
                const slotEl = under.closest('.okey-rack-slot');
                const perEl = under.closest('[id^="openPer_"]');
                const discEl = under.closest('#okey101RightDiscardSlot') || under.closest('#okey101DiscardBtn');

                if (slotEl && slotEl.id && slotEl.id.startsWith('okeySlot_')) {
                    const targetIdx = parseInt(slotEl.id.replace('okeySlot_', ''), 10);
                    if (!isNaN(targetIdx)) {
                        okey101SlotDrop({ preventDefault: function () {} }, targetIdx);
                    }
                } else if (perEl && perEl.id && perEl.id.startsWith('openPer_')) {
                    const perIdx = parseInt(perEl.id.replace('openPer_', ''), 10);
                    if (!isNaN(perIdx)) {
                        okey101PerDrop({ preventDefault: function () {}, clientX: t.clientX }, perIdx);
                    }
                } else if (discEl) {
                    okey101DiscardDrop({ preventDefault: function () {} });
                }
            }
        }
    }

    if (state.dragging) {
        okey101DragEnd();
    }
}

window.addEventListener('touchend', (e) => _finishOkeyTouchDrag(e, false));
window.addEventListener('touchcancel', (e) => _finishOkeyTouchDrag(e, true));

// 🗑️ TAŞ ATMA FONKSİYONU (Hem buton hem sürükle-bırak için ortak)
function okey101DiscardTile(tileId) {
    if (!okey101Data) return;
    if (!okey101Data.myTurn) {
        alert("Sıra sizde değilken taş atamazsınız!");
        return;
    }
    if (!okey101Data.drawnThisTurn) {
        alert("Taş atmadan önce desteden veya solunuzdan taş çekmelisiniz!");
        return;
    }

    // Yandan taş alındıysa el açılmadan veya masaya işlenmeden taş atılamaz
    if (okey101Data.lastDiscardTaken) {
        let hasOpened = okey101Data.playerInfos && okey101Data.playerInfos[socket.id]?.hasOpened;
        if (!hasOpened) {
            alert("⚠️ Yandan taş aldığınızda elinizi açmak (en az 101 puan veya 5 çift) ve bu taşı perlerinizde kullanmak zorundasınız!\n\nEl açmadan taş atamazsınız. Eğer elinizi açamıyorsanız 'Taşı Geri Bırak' butonuna basarak desteden çekebilirsiniz.");
            return;
        } else {
            alert("⚠️ Yandan aldığınız taşı masadaki bir pere işlemek veya per/çift olarak indirmek zorundasınız!\n\nMasaya işlemeden taş atamazsınız. Eğer işleyemiyorsanız 'Taşı Geri Bırak' butonuna basarak desteden çekebilirsiniz.");
            return;
        }
    }

    okey101SelectedIds = [];
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101DiscardTile', tileId);
}
window.okey101DiscardTile = okey101DiscardTile;

// Sürükle ve Bırak ile Taş Atma Dinleyicileri (Sağ Köşe Yuvası & Buton)
function okey101DiscardDragOver(e) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
    const el = document.getElementById('okey101RightDiscardSlot');
    if (el) el.classList.add('discard-drag-over');
    const btn = document.getElementById('okey101DiscardBtn');
    if (btn) btn.classList.add('discard-btn-drag-over');
}
window.okey101DiscardDragOver = okey101DiscardDragOver;

function okey101DiscardDragLeave(e) {
    const el = document.getElementById('okey101RightDiscardSlot');
    if (el && (!e.relatedTarget || !el.contains(e.relatedTarget))) {
        el.classList.remove('discard-drag-over');
    }
    const btn = document.getElementById('okey101DiscardBtn');
    if (btn && (!e.relatedTarget || !btn.contains(e.relatedTarget))) {
        btn.classList.remove('discard-btn-drag-over');
    }
}
window.okey101DiscardDragLeave = okey101DiscardDragLeave;

function okey101DiscardDrop(e) {
    e.preventDefault();
    const el = document.getElementById('okey101RightDiscardSlot');
    if (el) el.classList.remove('discard-drag-over');
    const btn = document.getElementById('okey101DiscardBtn');
    if (btn) btn.classList.remove('discard-btn-drag-over');
    let tileId = okey101DraggedId || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
    okey101DraggedId = null;
    okey101DraggedSlotIdx = null;

    if (tileId) {
        okey101DiscardTile(tileId);
    }
}
window.okey101DiscardDrop = okey101DiscardDrop;

// Seçimi Sıfırlama / Temizleme
function okey101ClearSelection() {
    okey101SelectedIds = [];
    if (okey101Data) renderPlayerHand(okey101Data);
}
window.okey101ClearSelection = okey101ClearSelection;

// Masaya Uygun Pere Otomatik Taş İşleme Butonu
function okey101SubmitAutoProcess() {
    if (!okey101Data || !okey101Data.myTurn) return;

    if (!okey101Data.drawnThisTurn) {
        alert("Taş işlemeden önce desteden veya solunuzdan taş çekmelisiniz!");
        return;
    }
    let myInfo = okey101Data.playerInfos && okey101Data.playerInfos[socket.id];
    if (!myInfo || !myInfo.hasOpened) {
        alert("⚠️ Masaya taş işleyebilmek için önce kendi elinizi açmış (en az 101 puan veya 5 çift) olmanız gerekir!");
        return;
    }

    if (okey101SelectedIds.length === 0) {
        alert("Lütfen masadaki perlere işlemek için ıstakanızdan en az 1 taş seçin (veya taşı doğrudan masadaki pere sürükleyin)!");
        return;
    }

    let hand = okey101Data.hand || [];
    let selectedTiles = hand.filter(t => okey101SelectedIds.includes(t.id));
    if (selectedTiles.length === 0) return;

    let pers = okey101Data.tableOpenedPers || [];
    if (pers.length === 0) {
        alert("Masada henüz açılmış bir per grubu bulunmuyor!");
        return;
    }

    let matchedPerIdx = -1;
    let matchedPos = 'end';
    let okeyDef = okey101Data.okeyDef;

    for (let pIdx = 0; pIdx < pers.length; pIdx++) {
        let targetPer = pers[pIdx];
        if (targetPer.type === 'cift') continue;

        let isSeri = targetPer.type === 'seri' || (!targetPer.type && isValidSeries(targetPer.tiles, okeyDef));
        let isGrup = targetPer.type === 'grup' || (!targetPer.type && isValidGroup(targetPer.tiles, okeyDef));

        if (isSeri) {
            let asc = [...selectedTiles].sort((a, b) => a.value - b.value);
            let desc = [...selectedTiles].sort((a, b) => b.value - a.value);
            let cands = [asc, desc];

            let found = false;
            for (let pos of ['end', 'start']) {
                for (let cand of cands) {
                    let comb = (pos === 'start') ? [...cand, ...targetPer.tiles] : [...targetPer.tiles, ...cand];
                    if (isValidSeries(comb, okeyDef)) {
                        matchedPerIdx = pIdx;
                        matchedPos = pos;
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
            if (found) break;
        }

        if (isGrup) {
            let comb = [...targetPer.tiles, ...selectedTiles];
            if (isValidGroup(comb, okeyDef)) {
                matchedPerIdx = pIdx;
                matchedPos = 'end';
                break;
            }
        }
    }

    if (matchedPerIdx === -1) {
        alert("Seçtiğiniz taş(lar) masadaki hiçbir per grubuna uymuyor! İstediğiniz perin üzerine tıklayarak da deneyebilirsiniz.");
        return;
    }

    let tileIds = [...okey101SelectedIds];
    okey101SelectedIds = [];
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101AddTileToPer', {
        tileIds: tileIds,
        tileId: tileIds[0],
        targetPerIndex: matchedPerIdx,
        position: matchedPos
    });
}
window.okey101SubmitAutoProcess = okey101SubmitAutoProcess;

// Taş Adı ve Rengini Formatla
function getOkeyTileName(tile, okeyDef) {
    if (!tile) return "";
    let colorNameMap = { 'kirmizi': 'Kırmızı', 'siyah': 'Siyah', 'mavi': 'Mavi', 'sari': 'Sarı', 'sahte': 'Sahte Okey' };
    let cName = colorNameMap[tile.color] || tile.color;
    if (tile.isFakeOkey) return "Sahte Okey ⭐";
    let isOkey = (okeyDef && tile.color === okeyDef.color && tile.value === okeyDef.value);
    if (isOkey) return `${cName} ${tile.value} 👑 (OKEY!)`;
    return `${cName} ${tile.value}`;
}

function okey101SelectDrawnTile() {
    if (!okey101Data || !okey101Data.lastDrawnTileId) return;
    let tid = okey101Data.lastDrawnTileId;
    if (!okey101SelectedIds.includes(tid)) {
        okey101SelectedIds.push(tid);
    }
    renderPlayerHand(okey101Data);
}
window.okey101SelectDrawnTile = okey101SelectDrawnTile;

// =========================================================================
// 🀄 101 OKEY KURAL MOTORU VE OTOMATİK PER SAYMA (KİLİTLENME YOK - %100 ESNEK)
// =========================================================================

function isRealOkey(tile, okeyDef) {
    if (!tile || !okeyDef || tile.isFakeOkey) return false;
    return tile.color === okeyDef.color && tile.value === okeyDef.value;
}

function getEffectiveTile(tile, okeyDef) {
    if (!tile) return null;
    if (tile.isFakeOkey) {
        return {
            id: tile.id,
            color: okeyDef ? okeyDef.color : 'sahte',
            value: okeyDef ? okeyDef.value : 0,
            isFakeOkey: true,
            isOkey: false
        };
    }
    let isOkey = isRealOkey(tile, okeyDef);
    return {
        id: tile.id,
        color: tile.color,
        value: tile.value,
        isFakeOkey: false,
        isOkey: isOkey
    };
}

const OKEY101_COLORS = ['kirmizi', 'siyah', 'mavi', 'sari'];

// Sıralı Per Çözümleyici: Istakada karışık dizilmiş olsa bile en yüksek puanlı geçerli seriyi bulur ve taşları sıralar
function resolveSeries(tiles, okeyDef) {
    if (!tiles || tiles.length < 3 || tiles.length > 13) return null;

    let nonOkeys = [];
    let okeys = [];
    for (let t of tiles) {
        if (!t) return null;
        if (isRealOkey(t, okeyDef)) okeys.push(t);
        else nonOkeys.push(t);
    }

    let n = tiles.length;
    if (nonOkeys.length === 0) {
        let req = [];
        let start = Math.max(1, 14 - n);
        for (let i = 0; i < n; i++) req.push(start + i);
        return {
            sortedTiles: [...tiles],
            req: req,
            score: req.reduce((a, b) => a + b, 0)
        };
    }

    let baseColor = nonOkeys[0].isFakeOkey ? (okeyDef ? okeyDef.color : nonOkeys[0].color) : nonOkeys[0].color;
    let nonOkeyVals = [];
    let seenVals = new Set();

    for (let t of nonOkeys) {
        let effColor = t.isFakeOkey ? (okeyDef ? okeyDef.color : t.color) : t.color;
        if (effColor !== baseColor) return null;
        let effVal = t.isFakeOkey ? (okeyDef ? okeyDef.value : t.value) : t.value;
        if (seenVals.has(effVal)) return null;
        seenVals.add(effVal);
        nonOkeyVals.push(effVal);
    }

    let okeyCount = okeys.length;
    let bestReq = null;
    let bestScore = -1;

    // 101 Okey'de 12-13-1 peri YOKTUR! Seriler en fazla 13'e kadar uzayabilir (örn: 10-11-12-13).
    for (let startVal = 1; startVal <= 13 - n + 1; startVal++) {
        let req = [];
        for (let i = 0; i < n; i++) {
            req.push(startVal + i);
        }

        let tempReq = [...req];
        let matched = true;
        for (let val of nonOkeyVals) {
            let idx = tempReq.indexOf(val);
            if (idx === -1) {
                matched = false;
                break;
            }
            tempReq.splice(idx, 1);
        }
        if (matched && tempReq.length === okeyCount) {
            let sum = req.reduce((a, b) => a + b, 0);
            if (sum > bestScore) {
                bestScore = sum;
                bestReq = req;
            }
        }
    }

    if (!bestReq) return null;

    let sortedTiles = [];
    let nonOkeyPool = [...nonOkeys];
    let okeyPool = [...okeys];

    for (let v of bestReq) {
        let foundIdx = nonOkeyPool.findIndex(t => {
            let val = t.isFakeOkey ? (okeyDef ? okeyDef.value : t.value) : t.value;
            return val === v;
        });
        if (foundIdx !== -1) {
            sortedTiles.push(nonOkeyPool.splice(foundIdx, 1)[0]);
        } else if (okeyPool.length > 0) {
            sortedTiles.push(okeyPool.shift());
        }
    }
    if (nonOkeyPool.length > 0) sortedTiles.push(...nonOkeyPool);
    if (okeyPool.length > 0) sortedTiles.push(...okeyPool);

    return {
        sortedTiles: sortedTiles,
        req: bestReq,
        score: bestScore
    };
}

// Sıralı Per Kontrolü (Aynı Renk, Ardışık: 4-5-6 veya 10-11-12-13 (101 de 12-13-1 yoktur), Okey Joker Olarak Kullanılır)
function isValidSeries(tiles, okeyDef) {
    return resolveSeries(tiles, okeyDef) !== null;
}

// Grup Per Kontrolü (Aynı Sayı, Farklı Renkler: 7-7-7 gibi 3 veya 4 taş)
function isValidGroup(tiles, okeyDef) {
    if (!tiles || tiles.length < 3 || tiles.length > 4) return false;

    let nonOkey = tiles.filter(t => !isRealOkey(t, okeyDef));
    if (nonOkey.length === 0) return true;

    let baseVal = nonOkey[0].isFakeOkey ? (okeyDef ? okeyDef.value : nonOkey[0].value) : nonOkey[0].value;
    let colorsUsed = new Set();

    for (let t of nonOkey) {
        let effVal = t.isFakeOkey ? (okeyDef ? okeyDef.value : t.value) : t.value;
        let effCol = t.isFakeOkey ? (okeyDef ? okeyDef.color : t.color) : t.color;
        if (effVal !== baseVal) return false;
        if (colorsUsed.has(effCol)) return false;
        colorsUsed.add(effCol);
    }

    return true;
}

function sortGroupTiles(tiles, okeyDef) {
    if (!tiles || tiles.length === 0) return [];
    let nonOkeys = [];
    let okeys = [];
    for (let t of tiles) {
        if (isRealOkey(t, okeyDef)) okeys.push(t);
        else nonOkeys.push(t);
    }
    nonOkeys.sort((a, b) => {
        let colA = a.isFakeOkey ? (okeyDef ? okeyDef.color : a.color) : a.color;
        let colB = b.isFakeOkey ? (okeyDef ? okeyDef.color : b.color) : b.color;
        return OKEY101_COLORS.indexOf(colA) - OKEY101_COLORS.indexOf(colB);
    });
    return [...nonOkeys, ...okeys];
}

function sortPairTiles(tiles, okeyDef, gostergeTile = null) {
    if (!tiles || tiles.length <= 1) return tiles ? [...tiles] : [];
    let [t1, t2] = tiles;
    let o1 = isRealOkey(t1, okeyDef);
    let o2 = isRealOkey(t2, okeyDef);
    if (o1 && !o2) return [t2, t1];
    if (!o1 && o2) return [t1, t2];
    if (gostergeTile) {
        let g1 = !t1.isFakeOkey && t1.color === gostergeTile.color && t1.value === gostergeTile.value;
        let g2 = !t2.isFakeOkey && t2.color === gostergeTile.color && t2.value === gostergeTile.value;
        if (g1 && !g2) return [t2, t1];
    }
    return [t1, t2];
}

function getPairScore(tiles, okeyDef) {
    if (!tiles || tiles.length === 0) return 0;
    if (tiles.length === 1) {
        let eff = getEffectiveTile(tiles[0], okeyDef);
        return (eff ? eff.value : 0) * 2;
    }
    let nonOkey = tiles.find(t => !isRealOkey(t, okeyDef));
    if (nonOkey) {
        let eff = getEffectiveTile(nonOkey, okeyDef);
        return (eff ? eff.value : 0) * 2;
    }
    return (okeyDef ? okeyDef.value : 10) * 2;
}

function classifyAndSortPer(tiles, okeyDef) {
    if (!tiles || tiles.length < 3) return null;
    let seriRes = resolveSeries(tiles, okeyDef);
    let grupValid = isValidGroup(tiles, okeyDef);
    if (!seriRes && !grupValid) return null;

    let grupScore = -1;
    if (grupValid) {
        let nonOkey = tiles.find(t => !isRealOkey(t, okeyDef));
        let val = nonOkey ? (nonOkey.isFakeOkey ? (okeyDef ? okeyDef.value : 10) : nonOkey.value) : 13;
        grupScore = val * tiles.length;
    }

    if (seriRes && (!grupValid || seriRes.score >= grupScore)) {
        return {
            type: 'seri',
            sortedTiles: seriRes.sortedTiles,
            req: seriRes.req,
            score: seriRes.score
        };
    }
    return {
        type: 'grup',
        sortedTiles: sortGroupTiles(tiles, okeyDef),
        score: grupScore
    };
}

function sortPerTiles(tiles, type, okeyDef) {
    if (!tiles || tiles.length === 0) return [];
    if (type === 'cift') return sortPairTiles(tiles, okeyDef);
    if (type === 'seri') {
        let res = resolveSeries(tiles, okeyDef);
        if (res) return res.sortedTiles;
    }
    if (type === 'grup' && isValidGroup(tiles, okeyDef)) {
        return sortGroupTiles(tiles, okeyDef);
    }
    let classified = classifyAndSortPer(tiles, okeyDef);
    return classified ? classified.sortedTiles : [...tiles];
}

// Çift Kontrolü (Aynı Renk ve Sayı 2 Taş)
function isValidPair(tileA, tileB, okeyDef, gostergeTile = null) {
    if (!tileA || !tileB) return false;
    let effA = getEffectiveTile(tileA, okeyDef);
    let effB = getEffectiveTile(tileB, okeyDef);
    if (!effA || !effB) return false;

    if (effA.isOkey || effB.isOkey) return true;

    if (gostergeTile) {
        let isGostA = !tileA.isFakeOkey && tileA.color === gostergeTile.color && tileA.value === gostergeTile.value;
        let isGostB = !tileB.isFakeOkey && tileB.color === gostergeTile.color && tileB.value === gostergeTile.value;
        if (isGostA || isGostB) return true;
    }

    return effA.color === effB.color && effA.value === effB.value;
}

// Per Puanı Hesaplama
function getPerScore(tiles, okeyDef) {
    let classified = classifyAndSortPer(tiles, okeyDef);
    if (classified) return classified.score;

    let score = 0;
    (tiles || []).forEach(t => {
        let eff = getEffectiveTile(t, okeyDef);
        score += eff ? eff.value : 0;
    });
    return score;
}

// Karışık Seçilmiş Çoklu Per Çözümleyici (En Yüksek Puanlı Ayrıştırma)
function findValidPartitionClient(tiles, okeyDef) {
    if (!tiles || tiles.length < 3) return null;

    function getCombinations(arr, k) {
        if (k === 0) return [[]];
        if (arr.length < k) return [];
        let result = [];
        function helper(start, combo) {
            if (combo.length === k) {
                result.push([...combo]);
                return;
            }
            for (let i = start; i <= arr.length - (k - combo.length); i++) {
                combo.push(arr[i]);
                helper(i + 1, combo);
                combo.pop();
            }
        }
        helper(0, []);
        return result;
    }

    let orderedInput = [...tiles].sort((a, b) => {
        let oa = isRealOkey(a, okeyDef) ? 1 : 0;
        let ob = isRealOkey(b, okeyDef) ? 1 : 0;
        return oa - ob;
    });

    let memo = new Map();

    function search(remaining) {
        if (remaining.length === 0) return { pers: [], score: 0 };
        if (remaining.length < 3) return null;

        let key = remaining.map(t => t.id).sort().join(',');
        if (memo.has(key)) return memo.get(key);

        let head = remaining[0];
        let tail = remaining.slice(1);
        if (isRealOkey(head, okeyDef)) {
            let classified = classifyAndSortPer(remaining, okeyDef);
            let bestOkey = classified ? { pers: [classified], score: classified.score } : null;
            memo.set(key, bestOkey);
            return bestOkey;
        }

        let headColor = head.isFakeOkey ? (okeyDef ? okeyDef.color : head.color) : head.color;
        let headVal = head.isFakeOkey ? (okeyDef ? okeyDef.value : head.value) : head.value;
        let best = null;

        let seriPool = tail.filter(t => {
            if (isRealOkey(t, okeyDef)) return true;
            let c = t.isFakeOkey ? (okeyDef ? okeyDef.color : t.color) : t.color;
            return c === headColor;
        });

        let maxSeriSize = Math.min(13, 1 + seriPool.length);
        for (let size = maxSeriSize; size >= 3; size--) {
            let combs = getCombinations(seriPool, size - 1);
            for (let c of combs) {
                let cand = [head, ...c];
                let seriRes = resolveSeries(cand, okeyDef);
                if (seriRes) {
                    let usedSet = new Set(cand.map(t => t.id));
                    let rest = tail.filter(t => !usedSet.has(t.id));
                    let sub = search(rest);
                    if (sub !== null) {
                        let total = seriRes.score + sub.score;
                        if (!best || total > best.score) {
                            best = {
                                pers: [{ type: 'seri', sortedTiles: seriRes.sortedTiles, score: seriRes.score }, ...sub.pers],
                                score: total
                            };
                        }
                    }
                }
            }
        }

        let grupPool = tail.filter(t => {
            if (isRealOkey(t, okeyDef)) return true;
            let v = t.isFakeOkey ? (okeyDef ? okeyDef.value : t.value) : t.value;
            return v === headVal;
        });

        let maxGrupSize = Math.min(4, 1 + grupPool.length);
        for (let size = 3; size <= maxGrupSize; size++) {
            let combs = getCombinations(grupPool, size - 1);
            for (let c of combs) {
                let cand = [head, ...c];
                if (isValidGroup(cand, okeyDef)) {
                    let gScore = headVal * cand.length;
                    let usedSet = new Set(cand.map(t => t.id));
                    let rest = tail.filter(t => !usedSet.has(t.id));
                    let sub = search(rest);
                    if (sub !== null) {
                        let total = gScore + sub.score;
                        if (!best || total > best.score) {
                            best = {
                                pers: [{ type: 'grup', sortedTiles: sortGroupTiles(cand, okeyDef), score: gScore }, ...sub.pers],
                                score: total
                            };
                        }
                    }
                }
            }
        }

        memo.set(key, best);
        return best;
    }

    return search(orderedInput);
}

// Elle Seçilen Taşların Geçerli Per(ler) Oluşturup Oluşturmadığını Çözümle
function evaluateSelectedPers(selectedTiles, okeyDef) {
    if (!selectedTiles || selectedTiles.length < 3) return { valid: false, pers: [], score: 0 };
    let single = classifyAndSortPer(selectedTiles, okeyDef);
    if (single) {
        return { valid: true, pers: [single], score: single.score };
    }
    if (selectedTiles.length >= 6) {
        let part = findValidPartitionClient(selectedTiles, okeyDef);
        if (part && part.pers.length >= 2) {
            return { valid: true, pers: part.pers, score: part.score };
        }
    }
    return { valid: false, pers: [], score: 0 };
}

// Raf Üzerindeki Bitişik Yuvaları Ayrıştırma
function getContiguousRuns(startIdx, endIdx, currentHandMap) {
    let runs = [];
    let currentRun = [];
    for (let i = startIdx; i <= endIdx; i++) {
        let tid = window.okey101RackSlots ? window.okey101RackSlots[i] : null;
        let tile = tid ? currentHandMap[tid] : null;
        if (tile) {
            currentRun.push({ slotIdx: i, tile: tile });
        } else {
            if (currentRun.length > 0) {
                runs.push(currentRun);
                currentRun = [];
            }
        }
    }
    if (currentRun.length > 0) {
        runs.push(currentRun);
    }
    return runs;
}

// Bitişik Bir Taş Kümesindeki Geçerli Perleri Bul (Karışık sıra & iç içe aynı renk seriler dahil!)
function findPersInRun(run, okeyDef) {
    let tiles = run.map(x => x.tile);
    let n = tiles.length;
    if (n < 3) return [];

    function runSliceDP(items) {
        let lenN = items.length;
        let memo = {};
        function parse(startIndex) {
            if (startIndex >= lenN - 2) return { pers: [], score: 0 };
            if (memo[startIndex]) return memo[startIndex];

            let bestResult = { pers: [], score: 0 };

            let skipResult = parse(startIndex + 1);
            if (skipResult.score > bestResult.score) {
                bestResult = skipResult;
            }

            for (let len = 3; len <= lenN - startIndex; len++) {
                let subItems = items.slice(startIndex, startIndex + len);
                let sliceTiles = subItems.map(x => x.tile);
                let classified = classifyAndSortPer(sliceTiles, okeyDef);
                if (classified) {
                    let subResult = parse(startIndex + len);
                    let totalScore = classified.score + subResult.score;
                    if (totalScore > bestResult.score) {
                        bestResult = {
                            pers: [
                                {
                                    type: classified.type,
                                    tiles: classified.sortedTiles,
                                    slotIndices: subItems.map(x => x.slotIdx),
                                    score: classified.score
                                },
                                ...subResult.pers
                            ],
                            score: totalScore
                        };
                    }
                }
            }

            memo[startIndex] = bestResult;
            return bestResult;
        }
        return parse(0);
    }

    let bestResult = runSliceDP(run);
    let usedCount = bestResult.pers.reduce((acc, p) => acc + p.tiles.length, 0);

    // 2. Durum: Kümedeki TÜM taşlar birden fazla pere eksiksiz bölünebiliyorsa (örn. karışık iki per yan yana: [8,9,9,10,10,11])
    if (usedCount < n && n >= 6 && n <= 14) {
        let slotMap = {};
        run.forEach(item => { slotMap[item.tile.id] = item.slotIdx; });
        let fullPart = findValidPartitionClient(tiles, okeyDef);
        if (fullPart && fullPart.score > bestResult.score) {
            bestResult = {
                pers: fullPart.pers.map(p => ({
                    type: p.type,
                    tiles: p.sortedTiles,
                    slotIndices: p.sortedTiles.map(t => slotMap[t.id]),
                    score: p.score
                })),
                score: fullPart.score
            };
            usedCount = n;
        }
    }

    // 3. Durum: Aynı renk taşlar bir arada karışık veya çift kopyalı dizildiyse (örn. [9, 8, 9, 10])
    if (usedCount < n && n >= 4 && n <= 13) {
        let nonOkeyItems = run.filter(x => !isRealOkey(x.tile, okeyDef));
        if (nonOkeyItems.length > 0) {
            let baseCol = nonOkeyItems[0].tile.isFakeOkey
                ? (okeyDef ? okeyDef.color : nonOkeyItems[0].tile.color)
                : nonOkeyItems[0].tile.color;
            let allSameColor = nonOkeyItems.every(x => {
                let c = x.tile.isFakeOkey ? (okeyDef ? okeyDef.color : x.tile.color) : x.tile.color;
                return c === baseCol;
            });
            if (allSameColor) {
                let seenVals = new Set();
                let dedupItems = [];
                let okeyItems = run.filter(x => isRealOkey(x.tile, okeyDef));
                let sortedNonOkey = [...nonOkeyItems].sort((a, b) => {
                    let va = a.tile.isFakeOkey ? (okeyDef ? okeyDef.value : a.tile.value) : a.tile.value;
                    let vb = b.tile.isFakeOkey ? (okeyDef ? okeyDef.value : b.tile.value) : b.tile.value;
                    return va - vb;
                });
                for (let item of sortedNonOkey) {
                    let v = item.tile.isFakeOkey ? (okeyDef ? okeyDef.value : item.tile.value) : item.tile.value;
                    if (!seenVals.has(v)) {
                        seenVals.add(v);
                        dedupItems.push(item);
                    }
                }
                let candRes = runSliceDP([...dedupItems, ...okeyItems]);
                if (candRes.score > bestResult.score) {
                    bestResult = candRes;
                }
            }
        }
    }

    return bestResult.pers;
}

// Bitişik Bir Taş Kümesindeki Geçerli Çiftleri Bul
function findPairsInRun(run, okeyDef, gostergeTile, usedSlotIndices) {
    let pairs = [];
    for (let i = 0; i < run.length - 1; i++) {
        let item1 = run[i];
        let item2 = run[i + 1];
        if (usedSlotIndices.has(item1.slotIdx) || usedSlotIndices.has(item2.slotIdx)) continue;
        if (isValidPair(item1.tile, item2.tile, okeyDef, gostergeTile)) {
            pairs.push({
                tiles: [item1.tile, item2.tile],
                slotIndices: [item1.slotIdx, item2.slotIdx]
            });
            usedSlotIndices.add(item1.slotIdx);
            usedSlotIndices.add(item2.slotIdx);
            i++;
        }
    }
    return pairs;
}

// Tüm Istakadaki Geçerli Perleri ve Çiftleri Otomatik Tespit Et
function detectRackPers(data) {
    if (!data || !window.okey101RackSlots) {
        return { pers: [], pairs: [], totalScore: 0, perTileIds: new Set(), pairTileIds: new Set() };
    }

    let hand = data.hand || [];
    let currentHandMap = {};
    hand.forEach(t => currentHandMap[t.id] = t);

    let okeyDef = data.okeyDef;
    let gosterge = data.gosterge;

    let runs = [
        ...getContiguousRuns(0, 14, currentHandMap),
        ...getContiguousRuns(15, 29, currentHandMap)
    ];

    let detectedPers = [];
    let detectedPairs = [];
    let perTileIds = new Set();
    let pairTileIds = new Set();
    let totalScore = 0;

    // 1. Seri ve Grup Perlerini Tespit Et
    runs.forEach(run => {
        let pers = findPersInRun(run, okeyDef);
        pers.forEach(p => {
            detectedPers.push(p);
            totalScore += p.score;
            p.tiles.forEach(t => perTileIds.add(t.id));
        });
    });

    // 2. Çiftleri Tespit Et (Per içinde kullanılmamış taşlardan)
    let usedPairSlots = new Set();
    runs.forEach(run => {
        let unusedRun = run.filter(item => !perTileIds.has(item.tile.id));
        let pairs = findPairsInRun(unusedRun, okeyDef, gosterge, usedPairSlots);
        pairs.forEach(p => {
            detectedPairs.push(p);
            p.tiles.forEach(t => pairTileIds.add(t.id));
        });
    });

    // 3. Masaya Gösterilmiş Gösterge Varsa (Tek Başına 1 Çift Olarak Dahil Et)
    if (data.revealedGosterge && data.revealedGosterge[socket.id]) {
        let gId = data.revealedGosterge[socket.id];
        let gTile = currentHandMap[gId];
        if (gTile && !pairTileIds.has(gId)) {
            detectedPairs.push({
                type: 'pair',
                isGostergePair: true,
                tiles: [gTile]
            });
            pairTileIds.add(gId);
        }
    }

    return {
        pers: detectedPers,
        pairs: detectedPairs,
        totalScore: totalScore,
        perTileIds: perTileIds,
        pairTileIds: pairTileIds
    };
}
window.detectRackPers = detectRackPers;

// Oyuncunun Istakası (30 Yuvalı, 2 Raflı Gerçek Ahşap Oluk Sistemi & Otomatik Per Tanıma)
function renderPlayerHand(data) {
    const rack = document.getElementById('okey101PlayerHandRack');
    const tileCountEl = document.getElementById('okey101TileCount');
    if (!rack) return;

    let hand = data.hand || [];
    if (tileCountEl) tileCountEl.innerText = hand.length;

    let currentHandMap = {};
    hand.forEach(t => currentHandMap[t.id] = t);

    // 30 yuvalı ıstaka durumunu başlat (15 üst raf, 15 alt raf)
    if (!window.okey101RackSlots || window.okey101RackSlots.length !== 30) {
        window.okey101RackSlots = new Array(30).fill(null);
        hand.forEach((t, i) => {
            if (i < 30) window.okey101RackSlots[i] = t.id;
        });
    }

    // Masaya açılmış, işlenmiş veya atılmış taşları yuvalardan temizle
    for (let i = 0; i < 30; i++) {
        let tid = window.okey101RackSlots[i];
        if (tid && !currentHandMap[tid]) {
            window.okey101RackSlots[i] = null;
        }
    }

    // Henüz yuvaya yerleşmemiş yeni taşları yerleştir
    let unplacedTiles = hand.filter(t => !window.okey101RackSlots.includes(t.id));
    unplacedTiles.forEach(tile => {
        let targetSlot = -1;
        if (data.lastDrawnTileId && tile.id === data.lastDrawnTileId && window.okey101RackSlots[14] === null) {
            targetSlot = 14;
        } else {
            targetSlot = window.okey101RackSlots.indexOf(null);
        }
        if (targetSlot !== -1) {
            window.okey101RackSlots[targetSlot] = tile.id;
        }
    });

    // Otomatik Per ve Çift Tespiti (Kilitlenme yok, serbestçe bozulabilir)
    let detected = detectRackPers(data);
    window.okey101Detected = detected;

    // Yandan taş alındıysa uyarı banner'ını göster
    const warnEl = document.getElementById('okey101DiscardWarning');
    if (warnEl) {
        warnEl.style.display = (data.lastDiscardTaken && data.myTurn) ? 'flex' : 'none';
    }

    // Desteden taş çekildiyse bildirim bannerını göster
    const drawnNotifEl = document.getElementById('okey101DrawnNotification');
    const drawnTileNameEl = document.getElementById('okey101DrawnTileName');
    if (drawnNotifEl) {
        if (data.lastDrawnTile && data.lastDrawnTileId && data.myTurn && !data.lastDiscardTaken) {
            drawnNotifEl.style.display = 'flex';
            if (drawnTileNameEl) {
                drawnTileNameEl.innerText = getOkeyTileName(data.lastDrawnTile, data.okeyDef);
            }
        } else {
            drawnNotifEl.style.display = 'none';
        }
    }

    // 2 Rafı (Üst Raf: 0-14, Alt Raf: 15-29) Render Eden Fonksiyon
    function renderShelf(startIdx, endIdx) {
        let html = "";
        for (let idx = startIdx; idx <= endIdx; idx++) {
            let tileId = window.okey101RackSlots[idx];
            let tile = tileId ? currentHandMap[tileId] : null;

            if (!tile) {
                // BOŞ YUVA (Ahşap oluk çentiği)
                html += `
                    <div id="okeySlot_${idx}" 
                         class="okey-rack-slot empty"
                         ondragover="okey101SlotDragOver(event, ${idx})"
                         ondragleave="okey101SlotDragLeave(event, ${idx})"
                         ondrop="okey101SlotDrop(event, ${idx})"
                         onclick="okey101EmptySlotClick(${idx})"
                         title="Boş yuva (Seçili taşı buraya koymak için tıklayın veya sürükleyin)">
                    </div>
                `;
            } else {
                // DOLU YUVA (Taş içeren yuva)
                let isOkey = (data.okeyDef && !tile.isFakeOkey && tile.color === data.okeyDef.color && tile.value === data.okeyDef.value);
                let isRevealedGosterge = (data.revealedGosterge && data.revealedGosterge[socket.id] === tile.id);
                let isSelected = okey101SelectedIds.includes(tile.id);
                let isTaken = (data.takenDiscardTileId && tile.id === data.takenDiscardTileId);
                let isDrawn = (data.lastDrawnTileId && tile.id === data.lastDrawnTileId && !isTaken && data.myTurn);

                let isInPer = detected.perTileIds.has(tile.id);
                let isInPair = !isInPer && detected.pairTileIds.has(tile.id);
                let perCls = isInPer ? 'in-per' : (isInPair ? 'in-pair' : '');

                let colorCls = tile.isFakeOkey ? 'sahte' : tile.color;
                let okeyCls = isOkey ? 'gold-border' : (isRevealedGosterge ? 'gold-border' : '');
                let drawnCls = isDrawn ? 'drawn-tile' : '';
                let selectCls = isSelected ? 'selected' : '';
                let text = tile.isFakeOkey ? '⭐' : (isOkey ? `👑${tile.value}` : tile.value);
                let extraStyle = isTaken
                    ? 'border: 2px solid #38bdf8; box-shadow: 0 0 12px rgba(56, 189, 248, 0.9); position: relative;'
                    : (isRevealedGosterge ? 'border: 2px solid #facc15; box-shadow: 0 0 14px rgba(250,204,21,0.9); position: relative;' : 'position: relative;');

                let badgeHtml = "";
                if (isRevealedGosterge) {
                    badgeHtml += '<div style="position:absolute; top:-7px; left:-5px; background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; font-size:8px; font-weight:900; padding:1px 4px; border-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,0.6); z-index:5;">⭐ GÖSTERGE</div>';
                }
                if (isTaken) {
                    badgeHtml += '<div style="position:absolute; top:-7px; right:-5px; background:#0284c7; color:white; font-size:8px; font-weight:800; padding:1px 4px; border-radius:4px; box-shadow:0 1px 4px rgba(0,0,0,0.5);">Yandan</div>';
                } else if (isDrawn) {
                    badgeHtml += '<div class="tile-badge-drawn">🀄 YENİ</div>';
                }

                let perStatus = isInPer ? ' [Geçerli Per ✓]' : (isInPair ? ' [Geçerli Çift 👥]' : '');
                let gostergeStatus = isRevealedGosterge ? ' [Gösterilmiş Gösterge ⭐ (Tek Başına Çift)]' : '';
                let tileTitle = (isTaken
                    ? 'Yandan aldığınız taş (Açmak şarttır)'
                    : (isDrawn ? 'Desteden yeni çektiğiniz taş!' : 'Istaka taşı')) + perStatus + gostergeStatus + ' - Çift tıklayarak diğer rafa hızlıca aktarabilir, sürükleyebilir veya tıklayarak seçebilirsiniz.';

                html += `
                    <div id="okeySlot_${idx}" 
                         class="okey-rack-slot occupied"
                         ondragover="okey101SlotDragOver(event, ${idx})"
                         ondragleave="okey101SlotDragLeave(event, ${idx})"
                         ondrop="okey101SlotDrop(event, ${idx})">
                        <div class="okey-tile ${colorCls} ${okeyCls} ${drawnCls} ${selectCls} ${perCls}" 
                             style="${extraStyle}"
                             draggable="true"
                             ondragstart="okey101DragStart(event, '${tile.id}', ${idx})"
                             ondragend="okey101DragEnd(event)"
                             ontouchstart="okey101TileTouchStart(event, '${tile.id}', ${idx})"
                             onclick="okey101ToggleSelect('${tile.id}')"
                             ondblclick="okey101QuickMoveTile('${tile.id}', ${idx})"
                             oncontextmenu="event.preventDefault(); okey101QuickMoveTile('${tile.id}', ${idx});"
                             title="${tileTitle}">
                            ${badgeHtml}
                            <span>${text}</span>
                        </div>
                    </div>
                `;
            }
        }
        return html;
    }

    rack.innerHTML = `
        <div class="okey-rack-shelf top-shelf">
            ${renderShelf(0, 14)}
        </div>
        <div class="okey-rack-shelf-divider"></div>
        <div class="okey-rack-shelf bottom-shelf">
            ${renderShelf(15, 29)}
        </div>
    `;

    // Buton etiketlerini ve durumlarını duruma göre dinamik ayarla
    let myInfo = data.playerInfos && data.playerInfos[socket.id];
    let isAlreadyOpened = myInfo && myInfo.hasOpened;
    let openedType = myInfo?.openedType;

    const openHandBtn = document.getElementById('okey101OpenHandBtn');
    const openPairsBtn = document.getElementById('okey101OpenPairsBtn');

    if (openHandBtn) {
        if (!isAlreadyOpened) {
            openHandBtn.style.display = 'inline-block';
            openHandBtn.innerText = "✨ El Aç (101)";
        } else if (openedType === 'seri') {
            openHandBtn.style.display = 'inline-block';
            openHandBtn.innerText = "✨ Per İndir";
        } else {
            // Çift açmış oyuncu yeni seri per indiremez
            openHandBtn.style.display = 'none';
        }
    }

    if (openPairsBtn) {
        let hasAnyCiftOnTable = Object.values(data.playerInfos || {}).some(p => p.openedType === 'cift');
        if (!isAlreadyOpened) {
            openPairsBtn.style.display = 'inline-block';
            openPairsBtn.innerText = "👥 Çift Aç";
        } else if (openedType === 'cift') {
            openPairsBtn.style.display = 'inline-block';
            openPairsBtn.innerText = "👥 Çift İndir";
        } else if (openedType === 'seri' && hasAnyCiftOnTable) {
            openPairsBtn.style.display = 'inline-block';
            openPairsBtn.innerText = "👥 Çift İşle";
        } else {
            openPairsBtn.style.display = 'none';
        }
    }

    const processBtn = document.getElementById('okey101ProcessBtn');
    if (processBtn) {
        let canProcess = data.myTurn && data.drawnThisTurn && isAlreadyOpened && (data.tableOpenedPers && data.tableOpenedPers.length > 0);
        processBtn.style.display = canProcess ? 'inline-block' : 'none';
    }

    const discardBtn = document.getElementById('okey101DiscardBtn');
    if (discardBtn) {
        if (okey101SelectedIds.length === 1) {
            discardBtn.innerText = "🗑️ Seçili Taşı At";
            discardBtn.style.boxShadow = "0 0 14px rgba(239,68,68,0.85)";
        } else {
            discardBtn.innerText = "🗑️ Taş At";
            discardBtn.style.boxShadow = "0 2px 8px rgba(239,68,68,0.4)";
        }
    }

    updateSelectedScore();
}

// Taş Seçme / Kaldırma
function okey101ToggleSelect(tileId) {
    if (window._okeySuppressClickUntil && Date.now() < window._okeySuppressClickUntil) return;
    if (okey101SelectedIds.includes(tileId)) {
        okey101SelectedIds = okey101SelectedIds.filter(id => id !== tileId);
    } else {
        okey101SelectedIds.push(tileId);
    }
    if (okey101Data) renderPlayerHand(okey101Data);
}

// Seçilen Taşların ve Istakadaki Perlerin Puanını Canlı Göster
function updateSelectedScore() {
    const scoreDisp = document.getElementById('okey101SelectedScoreDisplay');
    if (!scoreDisp || !okey101Data) return;

    let hand = okey101Data.hand || [];
    let detected = window.okey101Detected || detectRackPers(okey101Data);
    let myInfo = okey101Data.playerInfos && okey101Data.playerInfos[socket.id];
    let isAlreadyOpened = myInfo && myInfo.hasOpened;
    let openedType = myInfo?.openedType;

    const openHandBtn = document.getElementById('okey101OpenHandBtn');
    const openPairsBtn = document.getElementById('okey101OpenPairsBtn');

    // 1. Durum: Kullanıcı elle taş seçmişse (okey101SelectedIds > 0)
    if (okey101SelectedIds.length > 0) {
        let selectedTiles = okey101SelectedIds.map(id => hand.find(t => t.id === id)).filter(Boolean);
        let evalRes = evaluateSelectedPers(selectedTiles, okey101Data.okeyDef);
        let rawSum = 0;
        selectedTiles.forEach(t => {
            let eff = getEffectiveTile(t, okey101Data.okeyDef);
            rawSum += eff ? eff.value : 0;
        });
        let sum = evalRes.valid ? evalRes.score : rawSum;

        let clearBtnHtml = `<button onclick="event.stopPropagation(); okey101ClearSelection()" style="background:#ef4444; color:white; border:none; padding:1px 6px; border-radius:4px; font-size:10px; font-weight:bold; cursor:pointer; margin-left:6px;" title="Tüm seçili taşları kaldır">✖ Temizle</button>`;

        if (isAlreadyOpened) {
            scoreDisp.className = evalRes.valid ? "score-pill-valid" : "score-pill-normal";
            let perNote = evalRes.valid ? ` (${evalRes.pers.length} Geçerli Per ✓)` : ` (${selectedTiles.length} Taş)`;
            scoreDisp.innerHTML = `👉 Seçilen: <b>${sum} Puan</b>${perNote} | 🀄 Istaka: <b>${detected.totalScore} P</b>${clearBtnHtml}`;
        } else if (evalRes.valid && sum >= 180) {
            scoreDisp.className = "score-pill-valid";
            scoreDisp.innerHTML = `👑 Seçilen: <b>${sum} Puan</b> (${evalRes.pers.length} Per - 180+ Sağlandı! 2 Siler! ⭐⭐)${clearBtnHtml}`;
        } else if (evalRes.valid && sum >= 150) {
            scoreDisp.className = "score-pill-valid";
            scoreDisp.innerHTML = `🌟 Seçilen: <b>${sum} Puan</b> (${evalRes.pers.length} Per - 150+ Sağlandı! 1 Siler! ⭐)${clearBtnHtml}`;
        } else if (evalRes.valid && sum >= 101) {
            scoreDisp.className = "score-pill-valid";
            scoreDisp.innerHTML = `✨ Seçilen: <b>${sum} Puan</b> (${evalRes.pers.length} Per - 101 Sağlandı! Açılabilir)${clearBtnHtml}`;
        } else {
            scoreDisp.className = "score-pill-normal";
            let statusNote = evalRes.valid ? `${evalRes.pers.length} Geçerli Per` : `${selectedTiles.length} Taş`;
            scoreDisp.innerHTML = `👉 Seçilen: <b>${sum} / 101 Puan</b> (${statusNote}) | 🀄 Istaka: <b>${detected.totalScore} P</b>${clearBtnHtml}`;
        }
    } else {
        // 2. Durum: Kullanıcı elle taş seçmemişse OTOMATİK ISTAKA PER PUANINI GÖSTER
        let sum = detected.totalScore;
        let perCount = detected.pers.length;
        let pairCount = detected.pairs.length;

        if (isAlreadyOpened) {
            if (openedType === 'cift') {
                scoreDisp.className = pairCount > 0 ? "score-pill-valid" : "score-pill-normal";
                scoreDisp.innerHTML = `👥 Istaka Çiftleri: <b>${pairCount} Çift</b> ${pairCount > 0 ? "(Tek tıkla masaya indirebilirsiniz)" : ""}`;
            } else {
                scoreDisp.className = sum > 0 ? "score-pill-valid" : "score-pill-normal";
                scoreDisp.innerHTML = `🀄 Istaka Perleri: <b>${sum} Puan</b> (${perCount} Per) ${sum > 0 ? "(Tek tıkla masaya indirebilirsiniz)" : ""}`;
            }
        } else if (sum >= 180) {
            scoreDisp.className = "score-pill-valid";
            scoreDisp.innerHTML = `👑 Istaka Perleri: <b>${sum} Puan</b> (${perCount} Per - 180+ Sağlandı! 2 Siler! ⭐⭐ Tek tıkla aç!)`;
        } else if (sum >= 150) {
            scoreDisp.className = "score-pill-valid";
            scoreDisp.innerHTML = `🌟 Istaka Perleri: <b>${sum} Puan</b> (${perCount} Per - 150+ Sağlandı! 1 Siler! ⭐ Tek tıkla aç!)`;
        } else if (sum >= 101) {
            scoreDisp.className = "score-pill-valid";
            scoreDisp.innerHTML = `✨ Istaka Perleri: <b>${sum} Puan</b> (${perCount} Per - 101 Sağlandı! 🟢 Tek tıkla el aç!)`;
        } else if (pairCount >= 5) {
            scoreDisp.className = "score-pill-valid";
            scoreDisp.innerHTML = `👥 Istaka Çiftleri: <b>${pairCount} Çift</b> (Çift Açmaya Hazır! 🟢 Tek tıkla el aç!)`;
        } else if (sum > 0) {
            scoreDisp.className = "score-pill-normal";
            scoreDisp.innerHTML = `🀄 Istaka Perleri: <b>${sum} / 101 Puan</b> (${101 - sum} puan eksik • ${perCount} Per)`;
        } else if (pairCount > 0) {
            scoreDisp.className = "score-pill-normal";
            scoreDisp.innerHTML = `👥 Istaka Çiftleri: <b>${pairCount} / 5 Çift</b> (${5 - pairCount} çift eksik)`;
        } else {
            scoreDisp.className = "score-pill-normal";
            scoreDisp.innerHTML = `🀄 Istaka: <b>0 Puan</b> (Per yapmak için sayıları yan yana dizin)`;
        }
    }

    // El Açma butonuna hazır olduğunu belirten parlama efekti ekle/kaldır
    if (openHandBtn) {
        let isReadyToOpen = (!isAlreadyOpened && detected.totalScore >= 101 && okey101Data.myTurn) ||
            (isAlreadyOpened && openedType === 'seri' && detected.pers.length > 0 && okey101Data.myTurn);
        if (isReadyToOpen && okey101SelectedIds.length === 0) {
            openHandBtn.classList.add('btn-ready-to-open');
            openHandBtn.title = "Istakanızdaki tüm geçerli perleri tek tıkla masaya açar!";
        } else {
            openHandBtn.classList.remove('btn-ready-to-open');
            openHandBtn.title = "";
        }
    }

    if (openPairsBtn) {
        let isReadyPairs = (!isAlreadyOpened && detected.pairs.length >= 5 && okey101Data.myTurn) ||
            (isAlreadyOpened && detected.pairs.length > 0 && okey101Data.myTurn);
        if (isReadyPairs && okey101SelectedIds.length === 0) {
            openPairsBtn.classList.add('btn-ready-to-open');
            openPairsBtn.title = "Istakanızdaki tüm çiftleri tek tıkla masaya açar!";
        } else {
            openPairsBtn.classList.remove('btn-ready-to-open');
            openPairsBtn.title = "";
        }
    }
}

// Aksiyonlar
function okey101DrawFromDeck() {
    if (!okey101Data || !okey101Data.myTurn) return;
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101DrawTile');
}

function okey101TakeDiscard() {
    if (!okey101Data || !okey101Data.myTurn) return;
    if (okey101Data.drawPileCount <= 0) {
        alert("Destedeki taşlar bittiği için yandan taş alınamaz!");
        return;
    }
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101TakeDiscard');
}

function okey101ReturnDiscard() {
    if (!okey101Data || !okey101Data.myTurn) return;
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101ReturnDiscard');
}
window.okey101ReturnDiscard = okey101ReturnDiscard;

function okey101SubmitDiscard() {
    if (!okey101Data || !okey101Data.myTurn) return;

    if (okey101SelectedIds.length === 0) {
        alert("Lütfen atmak istediğiniz 1 taşı seçin veya taşı sağdaki Taş At alanına sürükleyip bırakın!");
        return;
    }
    if (okey101SelectedIds.length > 1) {
        alert("Birden fazla taş seçili! Lütfen sadece atmak istediğiniz 1 taşı seçin veya taşı doğrudan sağdaki alana sürükleyip bırakın.");
        return;
    }
    let tileId = okey101SelectedIds[0];
    okey101DiscardTile(tileId);
}

// ✨ El Aç (101 Puan veya Per İndirme) - Tek Tıkla Otomatik Açma Desteği
function okey101SubmitOpenHand() {
    if (!okey101Data || !okey101Data.myTurn) return;

    let myInfo = okey101Data.playerInfos && okey101Data.playerInfos[socket.id];
    let isAlreadyOpened = myInfo && myInfo.hasOpened;
    let detected = window.okey101Detected || detectRackPers(okey101Data);

    let persToOpen = [];

    // Durum 1: Kullanıcı manuel olarak taş seçtiyse (Karışık seçilse bile perlere ayır ve sıralı indir!)
    if (okey101SelectedIds.length >= 3) {
        let hand = okey101Data.hand || [];
        let selectedTiles = okey101SelectedIds.map(id => hand.find(t => t.id === id)).filter(Boolean);
        let evalRes = evaluateSelectedPers(selectedTiles, okey101Data.okeyDef);
        if (!evalRes.valid) {
            alert("Seçtiğiniz taşlar geçerli bir seri veya grup per oluşturmuyor!\n\nLütfen aynı renkten ardışık sayıları (örn: 8-9-10) veya farklı renklerden aynı sayıları (örn: 13-13-13) seçin ya da seçimi temizleyip ıstaka perlerini tek tıkla açın.");
            return;
        }
        if (!isAlreadyOpened && evalRes.score < 101) {
            alert(`Seçtiğiniz perlerin toplamı ${evalRes.score} puan.\n\nİlk el açılışı için en az 101 puan gereklidir! (${101 - evalRes.score} puan daha gerekli)`);
            return;
        }
        if (okey101Data.lastDiscardTaken && okey101Data.takenDiscardTileId) {
            let hasTakenTile = selectedTiles.some(t => t.id === okey101Data.takenDiscardTileId);
            if (!hasTakenTile) {
                alert("⚠️ Yandan aldığınız taşı açacağınız perlerin içine dahil etmek zorundasınız!");
                return;
            }
        }
        persToOpen = evalRes.pers.map(p => ({
            tileIds: p.sortedTiles.map(t => t.id)
        }));
    }
    // Durum 2: Kullanıcı tek tek seçmedi, ıstakada tespit edilen perleri tek tıkla aç!
    else {
        if (!detected.pers || detected.pers.length === 0) {
            alert("Istakanızda geçerli bir per bulunamadı!\n\nPer oluşturmak için sayıları ıstakada yan yana dizin (örnek: 4-5-6 veya 7-7-7) veya açmak istediğiniz taşlara tıklayarak seçin.");
            return;
        }

        if (!isAlreadyOpened && detected.totalScore < 101) {
            alert(`Istakanızdaki perlerin toplamı ${detected.totalScore} puan.\n\nİlk el açılışı için en az 101 puan gereklidir! (${101 - detected.totalScore} puan daha gerekli)`);
            return;
        }

        // Yandan taş alındıysa perlerde yer alması zorunludur
        if (okey101Data.lastDiscardTaken && okey101Data.takenDiscardTileId) {
            let hasTakenTile = detected.pers.some(p => p.tiles.some(t => t.id === okey101Data.takenDiscardTileId));
            if (!hasTakenTile) {
                alert("⚠️ Yandan aldığınız taşı açacağınız perlerin içine dahil etmek zorundasınız!\n\nLütfen yandan aldığınız taşı ıstakanızdaki perlerden birine bitişik yerleştirin.");
                return;
            }
        }

        persToOpen = detected.pers.map(p => ({
            tileIds: p.tiles.map(t => t.id)
        }));
    }

    let payload = {
        pers: persToOpen
    };

    okey101SelectedIds = [];
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101OpenHand', payload);
}

// 👥 Çift Aç / Çift İndir - Tek Tıkla Otomatik Açma Desteği
function okey101SubmitOpenPairs() {
    if (!okey101Data || !okey101Data.myTurn) return;
    let myInfo = okey101Data.playerInfos && okey101Data.playerInfos[socket.id];
    let isAlreadyOpened = myInfo && myInfo.hasOpened;
    let detected = window.okey101Detected || detectRackPers(okey101Data);

    let pairs = [];

    // Durum 1: Elle seçim yapıldıysa (Gösterilmiş gösterge tek taş çift sayılır)
    if (okey101SelectedIds.length >= 1) {
        let selected = [...okey101SelectedIds];
        let revealedGostergeId = okey101Data.myRevealedGostergeTileId;
        let hasGostergeInSelection = revealedGostergeId && selected.includes(revealedGostergeId);

        let normalTileIds = hasGostergeInSelection ? selected.filter(id => id !== revealedGostergeId) : selected;
        let totalPairsCount = (hasGostergeInSelection ? 1 : 0) + Math.floor(normalTileIds.length / 2);

        if (!isAlreadyOpened && totalPairsCount < 5) {
            alert(`İlk çift açılışı için en az 5 çift gereklidir! (Seçilen çift sayısı: ${totalPairsCount})`);
            return;
        }
        if (normalTileIds.length % 2 !== 0) {
            alert("Lütfen çiftlerinizi ikişerli tam çiftler halinde seçiniz!");
            return;
        }

        if (hasGostergeInSelection) {
            pairs.push([revealedGostergeId]);
        }
        for (let i = 0; i < normalTileIds.length; i += 2) {
            pairs.push([normalTileIds[i], normalTileIds[i + 1]]);
        }
    }
    // Durum 2: Otomatik ıstaka çiftleri tek tıkla aç
    else {
        if (!detected.pairs || detected.pairs.length === 0) {
            alert("Istakanızda çift bulunamadı!\n\nÇift oluşturmak için aynı renk ve sayıdaki taşları yan yana koyun.");
            return;
        }

        if (!isAlreadyOpened && detected.pairs.length < 5) {
            alert(`Istakanızda ${detected.pairs.length} çift bulundu.\n\nİlk çift açılışı için en az 5 çift gereklidir! (${5 - detected.pairs.length} çift daha gerekli)`);
            return;
        }

        if (okey101Data.lastDiscardTaken && okey101Data.takenDiscardTileId) {
            let hasTakenTile = detected.pairs.some(p => p.tiles.some(t => t.id === okey101Data.takenDiscardTileId));
            if (!hasTakenTile) {
                alert("⚠️ Yandan aldığınız taşı açacağınız çiftlerin içine dahil etmek zorundasınız!");
                return;
            }
        }

        pairs = detected.pairs.map(p => p.isGostergePair ? [p.tiles[0].id] : sortPairTiles(p.tiles, okey101Data.okeyDef, okey101Data.gosterge).map(t => t.id));
    }

    okey101SelectedIds = [];
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101OpenHand', { type: 'cift', pairs: pairs });
}

function okey101AddSelectedToPer(perIndex, position) {
    if (!okey101Data || !okey101Data.myTurn) return;
    if (okey101SelectedIds.length === 0) {
        alert("Masaya işlemek için elinizden en az 1 taş seçin!");
        return;
    }
    let tileIds = [...okey101SelectedIds];
    okey101SelectedIds = [];
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101AddTileToPer', { tileIds: tileIds, tileId: tileIds[0], targetPerIndex: perIndex, position: position });
}

// Otomatik Seri Dizme (Çift Kopyaların Seriyi Bozmasını Önler, Sahte Okey'i Yerine Kurgular ve Grupları Ayırır)
function okey101SortSeries() {
    if (!okey101Data || !okey101Data.hand) return;
    let okeyDef = okey101Data.okeyDef;
    let hand = [...okey101Data.hand];
    const colorOrder = { 'kirmizi': 1, 'siyah': 2, 'mavi': 3, 'sari': 4 };

    let realOkeys = hand.filter(t => isRealOkey(t, okeyDef));
    let pool = hand.filter(t => !isRealOkey(t, okeyDef));

    function effCol(t) { return t.isFakeOkey ? (okeyDef ? okeyDef.color : 'sari') : t.color; }
    function effVal(t) { return t.isFakeOkey ? (okeyDef ? okeyDef.value : 0) : t.value; }

    let groups = [];
    let leftovers = [];

    // 1) Her renkten temiz ardışık serileri (3+ taş, çift kopyalar seriyi bölmeden!) çıkar
    for (let col of OKEY101_COLORS) {
        let colTiles = pool.filter(t => effCol(t) === col).sort((a, b) => effVal(a) - effVal(b));
        while (colTiles.length > 0) {
            let distinct = [];
            let seen = new Set();
            for (let t of colTiles) {
                let v = effVal(t);
                if (!seen.has(v)) {
                    seen.add(v);
                    distinct.push(t);
                }
            }
            // En uzun ardışık zinciri bul (12-13-1 hariç)
            let extractedAny = false;
            let i = 0;
            while (i < distinct.length) {
                let chain = [distinct[i]];
                let j = i + 1;
                while (j < distinct.length && effVal(distinct[j]) === effVal(chain[chain.length - 1]) + 1) {
                    chain.push(distinct[j]);
                    j++;
                }
                // 101 Okey'de 12-13-1 serisi yoktur, seri en fazla 13'te biter
                if (chain.length >= 3) {
                    groups.push(chain);
                    let usedIds = new Set(chain.map(x => x.id));
                    colTiles = colTiles.filter(x => !usedIds.has(x.id));
                    extractedAny = true;
                    break;
                }
                i = j;
            }
            if (!extractedAny) {
                leftovers.push(...colTiles);
                break;
            }
        }
    }

    // 2) Kalan taşlardan 3 veya 4'lü aynı sayı farklı renk gruplarını (örn: 13-13-13) çıkar
    for (let v = 13; v >= 1; v--) {
        while (true) {
            let sameVal = leftovers.filter(t => effVal(t) === v);
            let byCol = new Map();
            for (let t of sameVal) {
                let c = effCol(t);
                if (!byCol.has(c)) byCol.set(c, t);
            }
            if (byCol.size >= 3) {
                let grp = Array.from(byCol.values());
                groups.push(sortGroupTiles(grp, okeyDef));
                let usedIds = new Set(grp.map(x => x.id));
                leftovers = leftovers.filter(x => !usedIds.has(x.id));
            } else {
                break;
            }
        }
    }

    // 3) Kalan tekil/ikili taşları renk ve sayı sırasıyla grupla
    leftovers.sort((a, b) => {
        let ca = colorOrder[effCol(a)] || 9;
        let cb = colorOrder[effCol(b)] || 9;
        if (ca !== cb) return ca - cb;
        return effVal(a) - effVal(b);
    });
    let cur = [];
    for (let t of leftovers) {
        if (cur.length === 0) {
            cur.push(t);
        } else {
            let last = cur[cur.length - 1];
            if (effCol(t) === effCol(last) && effVal(t) === effVal(last) + 1) {
                cur.push(t);
            } else {
                groups.push(cur);
                cur = [t];
            }
        }
    }
    if (cur.length > 0) groups.push(cur);
    if (realOkeys.length > 0) groups.push(realOkeys);

    let newSlots = new Array(30).fill(null);
    let slotIdx = 0;

    groups.forEach((group) => {
        // Eğer bu grup üst rafa (ilk 15 yuvaya) sığmıyorsa alt rafa (15. yuvaya) geç
        if (slotIdx < 15 && (slotIdx + group.length) > 15) {
            slotIdx = 15;
        }
        group.forEach(tile => {
            if (slotIdx < 30) {
                newSlots[slotIdx] = tile.id;
                slotIdx++;
            }
        });
        // Gruplar arasına 1 boşluk koy (raf taşmadığı sürece)
        if (slotIdx < 14 || (slotIdx >= 15 && slotIdx < 29)) {
            slotIdx++;
        }
    });

    window.okey101RackSlots = newSlots;
    if (window.playSound) window.playSound('okeyTile');
    renderPlayerHand(okey101Data);
}

// Otomatik Çift Dizme (Çiftler Arasında 1 Yuva Boşluk Bırakarak Dizer)
function okey101SortPairs() {
    if (!okey101Data || !okey101Data.hand) return;
    let hand = [...okey101Data.hand];
    hand.sort((a, b) => {
        if (a.value !== b.value) return a.value - b.value;
        return a.color.localeCompare(b.color);
    });

    let pairs = [];
    let singles = [];
    let used = new Set();

    for (let i = 0; i < hand.length; i++) {
        if (used.has(hand[i].id)) continue;
        let matchIdx = -1;
        for (let j = i + 1; j < hand.length; j++) {
            if (!used.has(hand[j].id) && hand[i].color === hand[j].color && hand[i].value === hand[j].value) {
                matchIdx = j;
                break;
            }
        }
        if (matchIdx !== -1) {
            pairs.push([hand[i], hand[matchIdx]]);
            used.add(hand[i].id);
            used.add(hand[matchIdx].id);
        } else {
            singles.push(hand[i]);
            used.add(hand[i].id);
        }
    }

    let newSlots = new Array(30).fill(null);
    let slotIdx = 0;

    pairs.forEach(pair => {
        if (slotIdx < 15 && (slotIdx + 2) > 15) {
            slotIdx = 15;
        }
        if (slotIdx + 1 < 30) {
            newSlots[slotIdx] = pair[0].id;
            newSlots[slotIdx + 1] = pair[1].id;
            slotIdx += 2;
            if (slotIdx < 14 || (slotIdx >= 15 && slotIdx < 29)) {
                slotIdx++; // 1 boşluk bırak
            }
        }
    });

    singles.forEach(tile => {
        if (slotIdx >= 30) {
            let firstEmpty = newSlots.indexOf(null);
            if (firstEmpty !== -1) newSlots[firstEmpty] = tile.id;
        } else {
            newSlots[slotIdx] = tile.id;
            slotIdx++;
        }
    });

    window.okey101RackSlots = newSlots;
    if (window.playSound) window.playSound('okeyTile');
    renderPlayerHand(okey101Data);
}

// ==========================================================
// 📋 A4 KIRAATHANE YAZBOZU (ÇETELİSİ) FONKSİYONLARI
// ==========================================================
function renderYazboz(data) {
    if (!data) return;
    const y = data.yazboz;
    if (!y) return;

    // Mod ve El Bilgisi
    const modeBadge = document.getElementById('yazbozModeBadge');
    if (modeBadge) {
        modeBadge.innerText = (data.mode === 'esli') ? "Eşli (2v2) Katlamasız & Cezalı" : "Tekli (Bireysel)";
        modeBadge.style.color = (data.mode === 'esli') ? "#1d4ed8" : "#0f766e";
    }

    const roundText = document.getElementById('yazbozRoundText');
    if (roundText) roundText.innerText = `${data.roundNumber || 1}. El`;

    const gridEl = document.querySelector('.yazboz-cross-grid');
    if (!gridEl) return;

    if (data.mode === 'tekli') {
        gridEl.style.display = 'grid';
        gridEl.style.gridTemplateColumns = 'repeat(4, 1fr)';
        let pIds = data.players || [];

        // 1. Satır: 4 Oyuncu Başlığı
        let colsHeader = pIds.map((pid, idx) => {
            let pName = data.playerInfos[pid] ? data.playerInfos[pid].name : `Oyuncu ${idx + 1}`;
            return `<div class="yazboz-team-header" style="background:#f0fdf4; color:#15803d; border-right:${idx < 3 ? '2px solid #1c1917' : 'none'}; padding:8px 4px;">
                <div style="font-weight:900; font-size:12px;">👤 ${idx + 1}. OYUNCU</div>
                <div style="font-size:11px; font-weight:normal; opacity:0.9; margin-top:2px; word-break:break-all;">${pName}</div>
            </div>`;
        }).join('');

        let secTitle1 = `<div class="yazboz-section-title" style="grid-column: span 4;">📝 ÜST TARAF: Elde Kalan Sayıların Cezaları</div>`;

        // 2. Satır: Üst Hücreler (El Cezaları)
        let colsTop = pIds.map((pid, idx) => {
            let pData = (y.players && y.players[pid]) ? y.players[pid] : { topRounds: [] };
            let topList = pData.topRounds || [];
            let content = topList.length > 0
                ? topList.map(r => {
                    let cls = r.score < 0 ? "yazboz-row-siler" : "yazboz-row-penalty";
                    return `<div class="yazboz-row-item"><span style="color:#475569;">${r.text.split(':')[0]}:</span> <b class="${cls}">${r.text.split(':')[1] || r.score}</b></div>`;
                }).join('')
                : `<div style="color:#a8a29e; font-style:italic;">Henüz el bitmedi...</div>`;
            return `<div class="yazboz-cell" style="border-right:${idx < 3 ? '2px solid #1c1917' : 'none'};">${content}</div>`;
        }).join('');

        // 3. Satır: Üst Toplamlar
        let colsTopSum = pIds.map((pid, idx) => {
            let pData = (y.players && y.players[pid]) ? y.players[pid] : { topRounds: [] };
            let sum = (pData.topRounds || []).reduce((s, r) => s + r.score, 0);
            return `<div class="yazboz-subtotal-item" style="border-right:${idx < 3 ? '2px solid #1c1917' : 'none'}; justify-content:center; gap:4px;">
                <span>Toplam:</span> <b>${sum}</b>
            </div>`;
        }).join('');
        let subtotalBar1 = `<div class="yazboz-subtotal-bar" style="grid-column: span 4; display:grid; grid-template-columns:repeat(4, 1fr);">${colsTopSum}</div>`;

        let secTitle2 = `<div class="yazboz-section-title divider-plus" style="grid-column: span 4;">➕ ALT TARAF: Yenilen Cezalar (+101) ve Silerler</div>`;

        // 4. Satır: Alt Hücreler
        let colsBottom = pIds.map((pid, idx) => {
            let pData = (y.players && y.players[pid]) ? y.players[pid] : { bottomPenalties: [], bottomSilers: [] };
            let pens = pData.bottomPenalties || [];
            let sils = pData.bottomSilers || [];
            let itemsHtml = [];
            pens.forEach(p => itemsHtml.push(`<div class="yazboz-row-item"><span style="color:#64748b;">${p.round}. El:</span> <b class="yazboz-row-penalty">${p.text}</b></div>`));
            sils.forEach(s => itemsHtml.push(`<div class="yazboz-row-item"><span style="color:#64748b;">${s.round}. El:</span> <b class="yazboz-row-siler">${s.text}</b></div>`));
            let content = itemsHtml.length > 0 ? itemsHtml.join('') : `<div style="color:#a8a29e; font-style:italic;">Ceza veya siler yok.</div>`;
            return `<div class="yazboz-cell" style="border-right:${idx < 3 ? '2px solid #1c1917' : 'none'};">${content}</div>`;
        }).join('');

        // 5. Satır: Alt Toplamlar
        let colsBottomSum = pIds.map((pid, idx) => {
            let pData = (y.players && y.players[pid]) ? y.players[pid] : { bottomPenalties: [], bottomSilers: [] };
            let penSum = (pData.bottomPenalties || []).reduce((s, p) => s + p.score, 0);
            let silSum = (pData.bottomSilers || []).reduce((s, sil) => s + Math.abs(sil.score), 0);
            let net = penSum - silSum;
            return `<div class="yazboz-subtotal-item" style="border-right:${idx < 3 ? '2px solid #1c1917' : 'none'}; justify-content:center; gap:4px; font-size:10px;">
                <span>Net:</span> <b>${net}</b>
            </div>`;
        }).join('');
        let subtotalBar2 = `<div class="yazboz-subtotal-bar" style="grid-column: span 4; display:grid; grid-template-columns:repeat(4, 1fr);">${colsBottomSum}</div>`;

        // 6. Satır: Grand Footer (Toplam Skorlar)
        let totals = pIds.map(pid => {
            let pData = (y.players && y.players[pid]) ? y.players[pid] : null;
            let val = (pData && pData.totalScore !== undefined) ? pData.totalScore : (data.scores?.[pid] || 0);
            return { pid, val };
        });
        let minScore = Math.min(...totals.map(t => t.val));

        let colsFooter = totals.map((t, idx) => {
            let isLeading = t.val === minScore;
            return `<div class="yazboz-grand-item" style="border-right:${idx < 3 ? '2px solid #78716c' : 'none'}; padding:8px 4px;">
                <span style="font-size:10px; opacity:0.8;">${idx + 1}. OYUNCU</span>
                <span style="font-size:16px; color:#38bdf8;">${t.val} Puan</span>
                ${isLeading ? '<span style="font-size:11px; color:#22c55e;">🏆 Önde</span>' : ''}
            </div>`;
        }).join('');
        let grandFooter = `<div class="yazboz-grand-footer" style="grid-column: span 4; display:grid; grid-template-columns:repeat(4, 1fr);">${colsFooter}</div>`;

        gridEl.innerHTML = colsHeader + secTitle1 + colsTop + subtotalBar1 + secTitle2 + colsBottom + subtotalBar2 + grandFooter;
    } else {
        // Eşli Mod - 2 Sütun
        gridEl.style.display = 'grid';
        gridEl.style.gridTemplateColumns = '1fr 1fr';

        let t1Players = [data.players[0], data.players[2]];
        let t2Players = [data.players[1], data.players[3]];

        let t1Names = t1Players.map(pid => data.playerInfos[pid] ? data.playerInfos[pid].name : "Oyuncu").join(' & ');
        let t2Names = t2Players.map(pid => data.playerInfos[pid] ? data.playerInfos[pid].name : "Oyuncu").join(' & ');

        let t1Top = (y.team1 && y.team1.topRounds) ? y.team1.topRounds : [];
        let t2Top = (y.team2 && y.team2.topRounds) ? y.team2.topRounds : [];
        let t1TopSum = t1Top.reduce((sum, r) => sum + r.score, 0);
        let t2TopSum = t2Top.reduce((sum, r) => sum + r.score, 0);

        let t1TopHtml = t1Top.length > 0
            ? t1Top.map(r => {
                let cls = r.score < 0 ? "yazboz-row-siler" : "yazboz-row-penalty";
                return `<div class="yazboz-row-item"><span style="color:#475569;">${r.text.split(':')[0]}:</span> <b class="${cls}">${r.text.split(':')[1] || r.score}</b></div>`;
            }).join('')
            : `<div style="color:#a8a29e; font-style:italic;">Henüz el bitmedi...</div>`;

        let t2TopHtml = t2Top.length > 0
            ? t2Top.map(r => {
                let cls = r.score < 0 ? "yazboz-row-siler" : "yazboz-row-penalty";
                return `<div class="yazboz-row-item"><span style="color:#475569;">${r.text.split(':')[0]}:</span> <b class="${cls}">${r.text.split(':')[1] || r.score}</b></div>`;
            }).join('')
            : `<div style="color:#a8a29e; font-style:italic;">Henüz el bitmedi...</div>`;

        let t1Pens = (y.team1 && y.team1.bottomPenalties) ? y.team1.bottomPenalties : [];
        let t1Sils = (y.team1 && y.team1.bottomSilers) ? y.team1.bottomSilers : [];
        let t2Pens = (y.team2 && y.team2.bottomPenalties) ? y.team2.bottomPenalties : [];
        let t2Sils = (y.team2 && y.team2.bottomSilers) ? y.team2.bottomSilers : [];

        let t1PenSum = t1Pens.reduce((sum, p) => sum + p.score, 0);
        let t1SilSum = t1Sils.reduce((sum, s) => sum + Math.abs(s.score), 0);
        let t2PenSum = t2Pens.reduce((sum, p) => sum + p.score, 0);
        let t2SilSum = t2Sils.reduce((sum, s) => sum + Math.abs(s.score), 0);

        let t1BotNet = t1PenSum - t1SilSum;
        let t2BotNet = t2PenSum - t2SilSum;

        let t1BotHtml = [];
        t1Pens.forEach(p => t1BotHtml.push(`<div class="yazboz-row-item"><span style="color:#64748b;">${p.round}. El:</span> <b class="yazboz-row-penalty">${p.text}</b></div>`));
        t1Sils.forEach(s => t1BotHtml.push(`<div class="yazboz-row-item"><span style="color:#64748b;">${s.round}. El:</span> <b class="yazboz-row-siler">${s.text}</b></div>`));
        let t1BotContent = t1BotHtml.length > 0 ? t1BotHtml.join('') : `<div style="color:#a8a29e; font-style:italic;">Ceza veya siler yok.</div>`;

        let t2BotHtml = [];
        t2Pens.forEach(p => t2BotHtml.push(`<div class="yazboz-row-item"><span style="color:#64748b;">${p.round}. El:</span> <b class="yazboz-row-penalty">${p.text}</b></div>`));
        t2Sils.forEach(s => t2BotHtml.push(`<div class="yazboz-row-item"><span style="color:#64748b;">${s.round}. El:</span> <b class="yazboz-row-siler">${s.text}</b></div>`));
        let t2BotContent = t2BotHtml.length > 0 ? t2BotHtml.join('') : `<div style="color:#a8a29e; font-style:italic;">Ceza veya siler yok.</div>`;

        let totalT1 = (y.team1 && y.team1.totalScore !== undefined) ? y.team1.totalScore : (t1TopSum + t1BotNet);
        let totalT2 = (y.team2 && y.team2.totalScore !== undefined) ? y.team2.totalScore : (t2TopSum + t2BotNet);
        let leader1 = totalT1 < totalT2 ? " 🏆 (Önde)" : "";
        let leader2 = totalT2 < totalT1 ? " 🏆 (Önde)" : "";

        gridEl.innerHTML = `
            <div class="yazboz-team-header team-1" id="yazbozTeam1Title">
                🔵 1. GRUP (1 & 3)
                <div style="font-size:11px; font-weight:normal; opacity:0.9;" id="yazbozTeam1Players">${t1Names}</div>
            </div>
            <div class="yazboz-team-header team-2" id="yazbozTeam2Title">
                🟠 2. GRUP (2 & 4)
                <div style="font-size:11px; font-weight:normal; opacity:0.9;" id="yazbozTeam2Players">${t2Names}</div>
            </div>
            <div class="yazboz-section-title">📝 ÜST TARAF: Elde Kalan Sayıların Cezaları</div>
            <div class="yazboz-cell team-1" id="yazbozTopTeam1">${t1TopHtml}</div>
            <div class="yazboz-cell team-2" id="yazbozTopTeam2">${t2TopHtml}</div>
            <div class="yazboz-subtotal-bar">
                <div class="yazboz-subtotal-item team-1">
                    <span>Üst El Toplamı:</span>
                    <b id="yazbozTopSumTeam1">${t1TopSum} Puan</b>
                </div>
                <div class="yazboz-subtotal-item team-2">
                    <span>Üst El Toplamı:</span>
                    <b id="yazbozTopSumTeam2">${t2TopSum} Puan</b>
                </div>
            </div>
            <div class="yazboz-section-title divider-plus">➕ ALT TARAF: Yenilen Cezalar (+101) ve Silerler</div>
            <div class="yazboz-cell team-1" id="yazbozBottomTeam1">${t1BotContent}</div>
            <div class="yazboz-cell team-2" id="yazbozBottomTeam2">${t2BotContent}</div>
            <div class="yazboz-subtotal-bar">
                <div class="yazboz-subtotal-item team-1">
                    <span>Alt Ceza/Siler:</span>
                    <b id="yazbozBottomSumTeam1">${t1PenSum > 0 ? '+' + t1PenSum : '0'} / ${t1SilSum > 0 ? '-' + t1SilSum : '0'} = ${t1BotNet}</b>
                </div>
                <div class="yazboz-subtotal-item team-2">
                    <span>Alt Ceza/Siler:</span>
                    <b id="yazbozBottomSumTeam2">${t2PenSum > 0 ? '+' + t2PenSum : '0'} / ${t2SilSum > 0 ? '-' + t2SilSum : '0'} = ${t2BotNet}</b>
                </div>
            </div>
            <div class="yazboz-grand-footer">
                <div class="yazboz-grand-item team-1">
                    <span style="font-size:11px; opacity:0.8;">1. GRUP TOPLAM CEZA</span>
                    <span style="font-size:20px; color:#60a5fa;" id="yazbozTotalScoreTeam1">${totalT1} Puan${leader1 ? `<span style="font-size:12px; color:#22c55e;">${leader1}</span>` : ''}</span>
                </div>
                <div class="yazboz-grand-item team-2">
                    <span style="font-size:11px; opacity:0.8;">2. GRUP TOPLAM CEZA</span>
                    <span style="font-size:20px; color:#fb923c;" id="yazbozTotalScoreTeam2">${totalT2} Puan${leader2 ? `<span style="font-size:12px; color:#22c55e;">${leader2}</span>` : ''}</span>
                </div>
            </div>
        `;
    }

    // Oyun Bittiğinde Sonraki El Butonu ve Otomatik Açılma
    const nextBtn = document.getElementById('yazbozNextRoundBtn');
    if (nextBtn) {
        nextBtn.style.display = data.gameOver ? 'inline-block' : 'none';
        nextBtn.innerText = (data.roundNumber >= 11) ? "🏆 Yeni Oyuna Başla" : "⏩ Sonraki Ele Geç";
    }

    const modal = document.getElementById('okey101YazbozModal');
    if (data.gameOver && modal && modal.style.display !== 'flex') {
        openYazbozModal();
    }
}

function toggleYazbozModal() {
    const modal = document.getElementById('okey101YazbozModal');
    if (!modal) return;
    if (modal.style.display === 'flex') {
        modal.style.display = 'none';
    } else {
        openYazbozModal();
    }
}

function openYazbozModal() {
    const modal = document.getElementById('okey101YazbozModal');
    if (modal) modal.style.display = 'flex';
    if (okey101Data) renderYazboz(okey101Data);
}

function closeYazbozModal() {
    const modal = document.getElementById('okey101YazbozModal');
    if (modal) modal.style.display = 'none';
}

function okey101NextRound() {
    if (window.playSound) window.playSound('okeyTile');
    socket.emit('okey101NextRound');
    closeYazbozModal();
    closeVictoryOverlay();
}

// 🀄 TAŞA ÇİFT TIKLAMA / SAĞ TIKLAMA İLE HIZLI TAŞIMA (Üst <-> Alt Raf)
function okey101QuickMoveTile(tileId, currentSlotIdx) {
    if (!window.okey101RackSlots) return;
    let targetSlot = -1;
    if (currentSlotIdx < 15) {
        // Üst raftaysa -> Alt raftaki (15-29) ilk boş yuvaya aktar
        for (let i = 15; i < 30; i++) {
            if (window.okey101RackSlots[i] === null) { targetSlot = i; break; }
        }
    } else {
        // Alt raftaysa -> Üst raftaki (0-14) ilk boş yuvaya aktar
        for (let i = 0; i < 15; i++) {
            if (window.okey101RackSlots[i] === null) { targetSlot = i; break; }
        }
    }
    // Karşı rafta boşluk yoksa genel ilk boşluğu bul
    if (targetSlot === -1) {
        targetSlot = window.okey101RackSlots.indexOf(null);
    }
    if (targetSlot !== -1 && targetSlot !== currentSlotIdx) {
        window.okey101RackSlots[currentSlotIdx] = null;
        window.okey101RackSlots[targetSlot] = tileId;
        if (window.playSound) window.playSound('okeyTile');
        if (okey101Data) renderPlayerHand(okey101Data);
    }
}
window.okey101QuickMoveTile = okey101QuickMoveTile;

// 🤖 BOŞALAN / AYRILAN KOLTUĞA YAPAY ZEKA BOTU ATAMA
function okey101AssignBot(pid) {
    socket.emit('assignBotToVacantSeat', { targetPlayerId: pid });
}
window.okey101AssignBot = okey101AssignBot;

// 📢 GÖSTERGEYİ MASAYA GÖSTERME (Çifte giderken tek taşla çift sayılabilmesi için)
function okey101RevealGosterge() {
    if (!okey101Data) return;
    socket.emit('okey101RevealGosterge');
}
window.okey101RevealGosterge = okey101RevealGosterge;

// Gösterge Masaya Gösterildiğinde Ortak Bildirim
socket.on('okey101GostergeRevealed', (payload) => {
    let banner = document.getElementById('gostergeRevealBanner');
    if (banner) {
        banner.innerHTML = `📢 <b>${payload.playerName}</b> elindeki Göstergeyi (<b style="color:#fde047;">${payload.tile.color.toUpperCase()} ${payload.tile.value}</b>) masaya gösterdi! <span style="font-size:12px; opacity:0.9;">(Çifte giderken tek taşla çift sayılacak)</span>`;
        banner.classList.add('show');
        if (window.playSound) window.playSound('coin');
        setTimeout(() => {
            banner.classList.remove('show');
        }, 5500);
    }
});

// 🏆 ZAFER KUTLAMASI & KONFETİ ŞÖLENİ
function triggerVictoryCelebration(winnerName, data) {
    let overlay = document.getElementById('victoryOverlay');
    let canvas = document.getElementById('victoryConfettiCanvas');
    if (window.playSound) window.playSound('fanfare');

    // 1. Konfeti Parçacık Yağmuru
    if (canvas) {
        canvas.style.display = 'block';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        let ctx = canvas.getContext('2d');
        let particles = [];
        let colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e', '#facc15'];
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                r: Math.random() * 6 + 4,
                d: Math.random() * 10 + 5,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.floor(Math.random() * 10) - 10,
                tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
                tiltAngle: 0
            });
        }

        let animationFrameId;
        let startTime = Date.now();
        function drawConfetti() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 1.5;
                p.x += Math.sin(p.d);
                p.tilt = Math.sin(p.tiltAngle) * 15;

                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();

                if (p.y > canvas.height) {
                    p.x = Math.random() * canvas.width;
                    p.y = -20;
                }
            }
            if (Date.now() - startTime < 5000) {
                animationFrameId = requestAnimationFrame(drawConfetti);
            } else {
                cancelAnimationFrame(animationFrameId);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.style.display = 'none';
            }
        }
        drawConfetti();
    }

    // 2. Zafer Tebrik Ekranı
    if (overlay) {
        let winInfoText = "✨ Eli Başarıyla Bitirdi! (-101 Puan)";
        let winnerPid = data.winner;
        let pInfo = data.playerInfos ? data.playerInfos[winnerPid] : null;
        let isCift = pInfo && pInfo.openedType === 'cift';
        if (isCift) winInfoText = "👥 5 Çift Açarak Bitirdi! (-202 Puan)";

        overlay.innerHTML = `
            <div class="victory-card">
                <div style="font-size: 52px; margin-bottom: 8px;">🏆</div>
                <h2 style="font-size: 24px; font-weight: 900; color: #facc15; margin: 0 0 8px 0; text-shadow: 0 0 15px rgba(250,204,21,0.6);">
                    TEBRİKLER ${winnerName.toUpperCase()}!
                </h2>
                <div style="font-size: 14px; font-weight: 800; color: #38bdf8; margin-bottom: 22px;">
                    ${winInfoText}
                </div>
                <div style="display: flex; justify-content: center; gap: 10px;">
                    <button onclick="closeVictoryAndOpenYazboz()" style="padding: 10px 22px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 9px; font-size: 13.5px; font-weight: 900; cursor: pointer; box-shadow: 0 4px 15px rgba(245,158,11,0.5);">
                        📋 Yazbozu İncele
                    </button>
                    <button onclick="closeVictoryOverlay()" style="padding: 10px 18px; background: #334155; color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 9px; font-size: 13px; font-weight: bold; cursor: pointer;">
                        Kapat
                    </button>
                </div>
            </div>
        `;
        overlay.style.display = 'flex';
    }
}
window.triggerVictoryCelebration = triggerVictoryCelebration;

function closeVictoryOverlay() {
    let overlay = document.getElementById('victoryOverlay');
    if (overlay) overlay.style.display = 'none';
    let canvas = document.getElementById('victoryConfettiCanvas');
    if (canvas) canvas.style.display = 'none';
}
window.closeVictoryOverlay = closeVictoryOverlay;

function closeVictoryAndOpenYazboz() {
    closeVictoryOverlay();
    openYazbozModal();
}
window.closeVictoryAndOpenYazboz = closeVictoryAndOpenYazboz;
