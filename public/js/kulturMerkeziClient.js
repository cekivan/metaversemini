// public/js/kulturMerkeziClient.js - Kültür Merkezi, Stand-Up, VIP Biletli Gösteri & Seyirci Reaksiyon İstemci Motoru

(function () {
    let clientKulturState = {
        stageMode: 'standup',
        currentPerformer: null,
        queue: [],
        tomatoCount: 0,
        unmutedAudienceMembers: [],
        raisedHands: [],
        lighterCount: 0,
        reservations: []
    };
    window.kulturMerkeziState = clientKulturState;

    function showKulturToast(msg, color = '#f59e0b') {
        try {
            let t = document.createElement('div');
            t.style.cssText = `position:fixed; top:24px; left:50%; transform:translateX(-50%); background:rgba(15,23,42,0.95); border:1.5px solid ${color}; color:#fff; padding:10px 20px; border-radius:10px; font-weight:800; font-size:13px; z-index:999999; box-shadow:0 8px 24px rgba(0,0,0,0.5); pointer-events:none; transition:opacity 0.4s;`;
            t.innerText = msg;
            document.body.appendChild(t);
            setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3500);
        } catch (e) { console.log(msg); }
    }
    window.showKulturToast = showKulturToast;

    let selectedQueueMode = 'standup';
    let selectedQueueDuration = 180;
    let perfTimerInterval = null;

    // --- MODAL AÇMA / KAPAMA FONKSİYONLARI ---

    function openStageQueueModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('stageQueueModal');
        if (modal) modal.style.display = 'flex';
        renderQueueModalUI();
        if (window.socket && window.socket.connected) {
            window.socket.emit('getKulturState');
        }
    }
    window.openStageQueueModal = openStageQueueModal;

    function closeStageQueueModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('stageQueueModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeStageQueueModal = closeStageQueueModal;

    function selectQueueMode(mode) {
        if (window.playSound) window.playSound('uiClick');
        selectedQueueMode = mode;
        document.querySelectorAll('.kultur-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
    }
    window.selectQueueMode = selectQueueMode;

    function selectQueueDuration(sec) {
        if (window.playSound) window.playSound('uiClick');
        selectedQueueDuration = sec;
        const b3 = document.getElementById('queueDur3Min');
        const b5 = document.getElementById('queueDur5Min');
        if (b3 && b5) {
            b3.classList.toggle('active', sec === 180);
            b5.classList.toggle('active', sec === 300);
        }
    }
    window.selectQueueDuration = selectQueueDuration;

    function submitJoinStageQueue() {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('joinStageQueue', {
                mode: selectedQueueMode,
                durationSec: selectedQueueDuration
            });
        }
        closeStageQueueModal();
    }
    window.submitJoinStageQueue = submitJoinStageQueue;

    function submitLeaveStageQueue() {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('leaveStageQueue');
        }
        closeStageQueueModal();
    }
    window.submitLeaveStageQueue = submitLeaveStageQueue;

    // GİŞE MODALI
    function openKulturGiseModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('kulturGiseModal');
        if (modal) modal.style.display = 'flex';
        renderGiseModalUI();
        if (window.socket && window.socket.connected) {
            window.socket.emit('getKulturState');
        }
    }
    window.openKulturGiseModal = openKulturGiseModal;

    function closeKulturGiseModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('kulturGiseModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeKulturGiseModal = closeKulturGiseModal;

    function switchGiseTab(tab) {
        if (window.playSound) window.playSound('uiClick');
        const secTickets = document.getElementById('giseTicketsSection');
        const secBooking = document.getElementById('giseBookingSection');
        const btnTickets = document.getElementById('tabGiseTicketsBtn');
        const btnBooking = document.getElementById('tabGiseBookingBtn');

        if (tab === 'tickets') {
            if (secTickets) secTickets.style.display = 'flex';
            if (secBooking) secBooking.style.display = 'none';
            if (btnTickets) btnTickets.classList.add('active');
            if (btnBooking) btnBooking.classList.remove('active');
        } else {
            if (secTickets) secTickets.style.display = 'none';
            if (secBooking) secBooking.style.display = 'flex';
            if (btnTickets) btnTickets.classList.remove('active');
            if (btnBooking) btnBooking.classList.add('active');
        }
    }
    window.switchGiseTab = switchGiseTab;

    function submitBookVipShow() {
        if (window.playSound) window.playSound('uiClick');
        const titleEl = document.getElementById('bookingShowTitle');
        const timeEl = document.getElementById('bookingShowTime');
        const priceEl = document.getElementById('bookingShowPrice');

        const title = (titleEl ? titleEl.value.trim() : '') || 'Özel Canlı Şov';
        const timeStr = timeEl ? timeEl.value : '21:00';
        const ticketPrice = priceEl ? parseInt(priceEl.value) || 100 : 100;

        if (window.socket && window.socket.connected) {
            window.socket.emit('bookVipShow', {
                title: title,
                timeStr: timeStr,
                ticketPrice: ticketPrice,
                mode: 'standup'
            });
        }
        closeKulturGiseModal();
    }
    window.submitBookVipShow = submitBookVipShow;

    function buyShowTicket(reservationId) {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('buyShowTicket', { reservationId });
        }
    }
    window.buyShowTicket = buyShowTicket;

    // SANAT BÜFESİ MODALI
    function openKulturBufeModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('kulturBufeModal');
        if (modal) modal.style.display = 'flex';
    }
    window.openKulturBufeModal = openKulturBufeModal;

    function closeKulturBufeModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('kulturBufeModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeKulturBufeModal = closeKulturBufeModal;

    function buyBuffetItem(itemId) {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('buyBuffetItem', { itemId });
        }
    }
    window.buyBuffetItem = buyBuffetItem;

    // AFİŞ & BİLLBOARD MODALI
    function openKulturBillboardModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('kulturBillboardModal');
        if (modal) modal.style.display = 'flex';
        renderBillboardModalUI();
        if (window.socket && window.socket.connected) {
            window.socket.emit('getKulturState');
        }
    }
    window.openKulturBillboardModal = openKulturBillboardModal;

    function closeKulturBillboardModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('kulturBillboardModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeKulturBillboardModal = closeKulturBillboardModal;

    // SEYİRCİ REAKSİYON İŞLEMLERİ
    function sendStageTip() {
        const input = document.getElementById('tipAmountInput');
        const amt = Math.max(1, input ? parseInt(input.value) || 50 : 50);
        if (window.socket && window.socket.connected) {
            window.socket.emit('sendStageTip', { amount: amt });
        }
    }
    window.sendStageTip = sendStageTip;

    function throwTomatoAtStage() {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('throwTomato');
        }
    }
    window.throwTomatoAtStage = throwTomatoAtStage;

    function toggleStageLighter() {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('toggleStageLighter');
        }
    }
    window.toggleStageLighter = toggleStageLighter;

    function toggleRaiseHand() {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('toggleRaiseHand');
        }
    }
    window.toggleRaiseHand = toggleRaiseHand;

    // SANATÇI KONTROL İŞLEMLERİ
    function submitLeaveStage() {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('leaveStage');
        }
    }
    window.submitLeaveStage = submitLeaveStage;

    function changePerformerStageMode(mode) {
        if (window.playSound) window.playSound('uiClick');
        if (window.socket && window.socket.connected) {
            window.socket.emit('changeStageMode', { mode });
        }
    }
    window.changePerformerStageMode = changePerformerStageMode;

    function openStageInviteModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('stageInviteModal');
        if (!modal) return;
        modal.style.display = 'flex';

        const list = document.getElementById('stageInvitePlayersList');
        if (!list) return;

        // Sahnedeki diğer çevrimiçi oyuncuları listele
        let curUname = (window.myUsername || (window.players && window.myId && window.players[window.myId]?.name) || '').toLowerCase();
        let options = [];
        if (typeof players !== 'undefined') {
            for (let sid in players) {
                let p = players[sid];
                if (p && p.name && p.name.toLowerCase() !== curUname && (p.room === 'kultur_merkezi_sahne' || p.room === 'kultur_merkezi_kulis' || p.room === 'kultur_merkezi_lobi')) {
                    options.push(p.name);
                }
            }
        }

        if (options.length === 0) {
            list.innerHTML = `<div style="color: #71717a; font-size: 12px; padding: 10px; text-align: center;">Mekanda davet edebileceğiniz başka oyuncu bulunmuyor.</div>`;
            return;
        }

        list.innerHTML = options.map(uname => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.7); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                <span style="font-weight:700; font-size:13px; color:#f8fafc;">${uname}</span>
                <button type="button" onclick="invitePlayerToStage('${uname}')" style="background:#8b5cf6; border:none; border-radius:6px; color:white; padding:4px 10px; font-weight:800; font-size:11px; cursor:pointer;">Sahneye Al</button>
            </div>
        `).join('');
    }
    window.openStageInviteModal = openStageInviteModal;

    function closeStageInviteModal() {
        const modal = document.getElementById('stageInviteModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeStageInviteModal = closeStageInviteModal;

    function invitePlayerToStage(target) {
        if (window.socket && window.socket.connected) {
            window.socket.emit('inviteToStage', { targetUsername: target });
        }
        closeStageInviteModal();
    }
    window.invitePlayerToStage = invitePlayerToStage;

    function openGrantMicModal() {
        if (window.playSound) window.playSound('uiClick');
        const modal = document.getElementById('grantMicModal');
        if (!modal) return;
        modal.style.display = 'flex';

        const list = document.getElementById('grantMicAudienceList');
        if (!list) return;

        let curUname = (window.myUsername || (window.players && window.myId && window.players[window.myId]?.name) || '').toLowerCase();
        let audience = [];
        if (typeof players !== 'undefined') {
            for (let sid in players) {
                let p = players[sid];
                if (p && p.name && p.name.toLowerCase() !== curUname && p.room === 'kultur_merkezi_sahne') {
                    audience.push(p.name);
                }
            }
        }

        if (audience.length === 0) {
            list.innerHTML = `<div style="color: #71717a; font-size: 12px; padding: 10px; text-align: center;">Salonda seyirci bulunmuyor.</div>`;
            return;
        }

        list.innerHTML = audience.map(uname => {
            const hasMic = (clientKulturState.unmutedAudienceMembers || []).includes(uname);
            const isHandRaised = (clientKulturState.raisedHands || []).includes(uname);
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.7); padding:8px 12px; border-radius:8px; border:1px solid rgba(255,255,255,0.08);">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <span style="font-weight:700; font-size:13px; color:#f8fafc;">${uname}</span>
                        ${isHandRaised ? `<span style="background:#f59e0b; color:black; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:4px;">🙋 El Kaldırdı</span>` : ''}
                        ${hasMic ? `<span style="background:#10b981; color:white; font-size:9.5px; font-weight:800; padding:1px 5px; border-radius:4px;">🎤 Mikrofon Açık</span>` : ''}
                    </div>
                    ${hasMic ? `
                        <button type="button" onclick="revokeMicFromPlayer('${uname}')" style="background:#ef4444; border:none; border-radius:6px; color:white; padding:4px 10px; font-weight:800; font-size:11px; cursor:pointer;">Sustur</button>
                    ` : `
                        <button type="button" onclick="grantMicToPlayer('${uname}')" style="background:#0284c7; border:none; border-radius:6px; color:white; padding:4px 10px; font-weight:800; font-size:11px; cursor:pointer;">🎤 Söz Ver</button>
                    `}
                </div>
            `;
        }).join('');
    }
    window.openGrantMicModal = openGrantMicModal;

    function closeGrantMicModal() {
        const modal = document.getElementById('grantMicModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeGrantMicModal = closeGrantMicModal;

    function grantMicToPlayer(target) {
        if (window.socket && window.socket.connected) {
            window.socket.emit('grantAudienceMic', { targetUsername: target });
        }
        closeGrantMicModal();
    }
    window.grantMicToPlayer = grantMicToPlayer;

    function revokeMicFromPlayer(target) {
        if (window.socket && window.socket.connected) {
            window.socket.emit('revokeAudienceMic', { targetUsername: target });
        }
        closeGrantMicModal();
    }
    window.revokeMicFromPlayer = revokeMicFromPlayer;

    // --- UI RENDER YARDIMCILARI ---

    function renderQueueModalUI() {
        const countBadge = document.getElementById('queueCountBadge');
        const perfBadge = document.getElementById('currentPerformerBadge');
        const list = document.getElementById('stageQueueList');
        const btnJoin = document.getElementById('btnJoinStageQueue');
        const btnLeave = document.getElementById('btnLeaveStageQueue');

        if (countBadge) countBadge.innerText = clientKulturState.queue.length;
        if (perfBadge) {
            if (clientKulturState.currentPerformer) {
                perfBadge.innerText = `Sahnede: 🎤 ${clientKulturState.currentPerformer.username} [${clientKulturState.currentPerformer.mode.toUpperCase()}]`;
            } else {
                perfBadge.innerText = 'Sahnede: Boş (İlk Çıkan Sen Ol!)';
            }
        }

        let myUname = (window.myUsername || (window.players && window.myId && window.players[window.myId]?.name) || '').toLowerCase();
        let inQueue = clientKulturState.queue.some(q => q.username.toLowerCase() === myUname);

        if (btnJoin) btnJoin.style.display = inQueue ? 'none' : 'block';
        if (btnLeave) btnLeave.style.display = inQueue ? 'block' : 'none';

        if (list) {
            if (clientKulturState.queue.length === 0) {
                list.innerHTML = `<div style="color: #64748b; text-align: center; padding: 6px;">Şu an sırada kimse yok. İlk sen çık!</div>`;
            } else {
                list.innerHTML = clientKulturState.queue.map((q, idx) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.7); padding:4px 8px; border-radius:6px;">
                        <span style="font-weight:700; color:#f8fafc;">#${idx + 1} ${q.username}</span>
                        <span style="font-size:10px; color:#fbbf24; font-weight:800; background:rgba(0,0,0,0.3); padding:2px 6px; border-radius:4px;">${q.mode.toUpperCase()}</span>
                    </div>
                `).join('');
            }
        }
    }

    function renderGiseModalUI() {
        const list = document.getElementById('giseShowsList');
        if (!list) return;

        if (clientKulturState.reservations.length === 0) {
            list.innerHTML = `<div style="color: #64748b; text-align: center; padding: 12px;">Planlanmış gösteri bulunmuyor.</div>`;
            return;
        }

        list.innerHTML = clientKulturState.reservations.map(res => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.7); border:1.5px solid rgba(56,189,248,0.25); border-radius:12px; padding:10px 14px;">
                <div>
                    <div style="font-size:14px; font-weight:800; color:#ffffff;">${res.title}</div>
                    <div style="font-size:11px; color:#94a3b8; display:flex; gap:8px; margin-top:2px;">
                        <span>Sanatçı: <b style="color:#fde047;">${res.hostUsername}</b></span>
                        <span>Saat: <b>${res.timeStr}</b></span>
                        <span>Satılan: <b style="color:#34d399;">${res.ticketsSold} Bilet</b></span>
                    </div>
                </div>
                <button type="button" onclick="buyShowTicket('${res.id}')" style="background:linear-gradient(135deg, #0284c7, #0369a1); border:none; border-radius:8px; color:white; font-weight:800; font-size:12px; padding:8px 14px; cursor:pointer; box-shadow:0 2px 6px rgba(2,132,199,0.4);">
                    🎟️ Bilet Al (${res.ticketPrice} TL)
                </button>
            </div>
        `).join('');
    }

    function renderBillboardModalUI() {
        const list = document.getElementById('billboardEventsList');
        if (!list) return;

        if (clientKulturState.reservations.length === 0) {
            list.innerHTML = `<div style="color: #64748b; text-align: center; padding: 12px;">Şu an panoda etkinlik ilanı yok.</div>`;
            return;
        }

        list.innerHTML = clientKulturState.reservations.map(res => `
            <div style="background:linear-gradient(135deg, #1e293b, #0f172a); border:1.5px solid #38bdf8; border-radius:12px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:15px; font-weight:900; color:#fde047;">🎭 ${res.title}</div>
                    <div style="font-size:11.5px; color:#cbd5e1; margin-top:3px;">
                        Sanatçı: <b>${res.hostUsername}</b> • Gösteri Saati: <span style="color:#38bdf8; font-weight:800;">${res.timeStr}</span>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:14px; font-weight:900; color:#34d399;">${res.ticketPrice} TL</div>
                    <button type="button" onclick="buyShowTicket('${res.id}'); closeKulturBillboardModal();" style="background:#38bdf8; color:black; font-weight:800; font-size:11px; padding:4px 10px; border:none; border-radius:6px; cursor:pointer; margin-top:4px;">Bilet Al</button>
                </div>
            </div>
        `).join('');
    }

    // --- HUD BARLARI GÜNCELLEME MOTORU ---
    function updateKulturBarsUI() {
        const audienceBar = document.getElementById('kulturStageAudienceBar');
        const performerBar = document.getElementById('kulturPerformerControlBar');

        const inStage = (typeof currentRoom !== 'undefined' && currentRoom === 'kultur_merkezi_sahne');

        if (!inStage) {
            if (audienceBar) audienceBar.style.display = 'none';
            if (performerBar) performerBar.style.display = 'none';
            if (perfTimerInterval) { clearInterval(perfTimerInterval); perfTimerInterval = null; }
            return;
        }

        let myUname = (window.myUsername || (window.players && window.myId && window.players[window.myId]?.name) || '').toLowerCase();
        let isCurrentPerformer = !!(clientKulturState.currentPerformer && clientKulturState.currentPerformer.username.toLowerCase() === myUname);
        let isInvitedGuest = !!(clientKulturState.currentPerformer && (clientKulturState.currentPerformer.invitedGuests || []).some(g => g.toLowerCase() === myUname));

        if (isCurrentPerformer || isInvitedGuest) {
            if (audienceBar) audienceBar.style.display = 'none';
            if (performerBar) performerBar.style.display = 'flex';

            const tomatoDisp = document.getElementById('perfTomatoDisplay');
            if (tomatoDisp) tomatoDisp.innerText = clientKulturState.tomatoCount;

            const modeSelector = document.getElementById('perfModeSelector');
            if (modeSelector && clientKulturState.currentPerformer) {
                modeSelector.value = clientKulturState.currentPerformer.mode || 'standup';
            }

            // Sayaç
            if (!perfTimerInterval && clientKulturState.currentPerformer) {
                perfTimerInterval = setInterval(() => {
                    if (!clientKulturState.currentPerformer) {
                        clearInterval(perfTimerInterval);
                        perfTimerInterval = null;
                        return;
                    }
                    const elapsed = Math.floor((Date.now() - clientKulturState.currentPerformer.startedAt) / 1000);
                    const remaining = Math.max(0, clientKulturState.currentPerformer.durationSec - elapsed);
                    const remMin = Math.floor(remaining / 60);
                    const remSec = remaining % 60;
                    const timerDisp = document.getElementById('perfTimerDisplay');
                    if (timerDisp) {
                        timerDisp.innerText = `${remMin.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
                    }
                }, 1000);
            }
        } else {
            if (audienceBar) audienceBar.style.display = 'flex';
            if (performerBar) performerBar.style.display = 'none';
            if (perfTimerInterval) { clearInterval(perfTimerInterval); perfTimerInterval = null; }
        }
    }
    window.updateKulturBarsUI = updateKulturBarsUI;

    // --- SOKET DİNLEYİCİLERİ ---
    (function initKulturSockets() {
        const s = window.socket || (typeof io !== 'undefined' ? io() : null);
        if (!s) return;

        s.on('kulturStateUpdate', (state) => {
            if (!state) return;
            clientKulturState = state;
            window.kulturMerkeziState = state;
            window.currentStageMode = state.stageMode || 'standup';
            window.activeStageLightersCount = state.lighterCount || 0;
            renderQueueModalUI();
            renderGiseModalUI();
            renderBillboardModalUI();
            updateKulturBarsUI();
        });

        s.on('stageModeChanged', (data) => {
            if (data && data.mode) {
                window.currentStageMode = data.mode;
            }
        });

        s.on('stageTipAnimation', (data) => {
            if (typeof addTipRoseParticles === 'function') {
                addTipRoseParticles(data.amount || 50);
            }
            if (window.playSound) window.playSound('coins');
        });

        s.on('tomatoThrownAnimation', (data) => {
            if (typeof addTomatoSplash === 'function') {
                addTomatoSplash(data.splashX, data.splashY);
            }
            if (window.playSound) window.playSound('squish');
        });

        s.on('stageInvitationReceived', (data) => {
            showKulturToast(`👥 ${data.host} sizi ${data.mode.toUpperCase()} performansı için sahneye davet etti!`, '#a855f7');
        });

        s.on('micGranted', (data) => {
            let myUname = (window.myUsername || (window.players && window.myId && window.players[window.myId]?.name) || '').toLowerCase();
            if (data && data.targetUsername && data.targetUsername.toLowerCase() === myUname) {
                showKulturToast(`🎤 Sanatçı size mikrofon uzattı! Artık salona seslenebilirsiniz.`, '#10b981');
            }
        });

        s.on('performerStarted', (data) => {
            if (!data) return;
            showKulturToast(`🎤 Alkışlar! ${data.username} sahneye çıktı! [${(data.mode || '').toUpperCase()}]`, '#ec4899');
            if (window.playSound) window.playSound('cheer');
        });

        s.on('performerKicked', (data) => {
            if (!data) return;
            showKulturToast(`🚨 ${data.username} seyircilerden 20 domates yiyerek sahneden atıldı!`, '#ef4444');
            if (window.playSound) window.playSound('boo');
        });

        s.on('micRevoked', (data) => {
            if (!data) return;
            let myUname = (window.myUsername || (window.players && window.myId && window.players[window.myId]?.name) || '').toLowerCase();
            if (data.targetUsername && data.targetUsername.toLowerCase() === myUname) {
                showKulturToast(`🔇 Mikrofonunuz geri alındı.`, '#ef4444');
            }
        });

        s.on('billboardUpdated', (newRes) => {
            if (!newRes) return;
            if (clientKulturState && clientKulturState.reservations) {
                clientKulturState.reservations.push(newRes);
                renderBillboardModalUI();
            }
        });

        s.on('playerBuffetEating', (data) => {
            if (!data) return;
            if (window.playSound) window.playSound('tea_sip');
            if (typeof showFloatingToast === 'function' && window.myId === data.id) {
                showFloatingToast(`${data.icon || '🍿'} Büfeden atıştırdınız.`);
            }
        });
    })();

})();
