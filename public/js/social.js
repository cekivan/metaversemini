
// --- ÖZEL YETENEK / SİLAH EŞYALARI SAHİPLİK KONTROLÜ ---
function checkProfileSpecialActionsOwnership() {
    const propInv = (typeof window !== 'undefined' && window.myPropInventory) || {};
    const inv = (typeof window !== 'undefined' && (window.myInventory || (typeof myInventory !== 'undefined' ? myInventory : []))) || [];
    const av = (typeof window !== 'undefined' && (window.myAvatar || (typeof myAvatar !== 'undefined' ? myAvatar : {}))) || {};
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) ? LevelClient.currentLevel : ((typeof window !== 'undefined' && (window.myLevel || window.myPlayerLevel)) || 1);

    const hasZeus = (myLvl >= 4) && (
                    (typeof window !== 'undefined' && window.myZeusCount > 0) ||
                    (propInv['props_zeus_yildirimi'] > 0) ||
                    (Array.isArray(inv) && (inv.includes('props_zeus_yildirimi') || inv.includes('zeus_yildirimi'))) ||
                    (av.heldItem === 'zeus_yildirimi' || av.heldItem === 'zeus_spear' || av.heldItem === 'zeus_simsegi') ||
                    (typeof isItemOwned === 'function' && isItemOwned('props', 'zeus_yildirimi')) ||
                    (typeof window !== 'undefined' && !!window.hasZeusLightning));

    const hasJammer = (myLvl >= 3) && (
                      (typeof window !== 'undefined' && window.myJammerCount > 0) ||
                      (propInv['props_jammer'] > 0) ||
                      (propInv['jammer'] > 0) ||
                      (Array.isArray(inv) && (inv.includes('props_jammer') || inv.includes('jammer'))) ||
                      (typeof isItemOwned === 'function' && (isItemOwned('props', 'jammer') || isItemOwned('props', 'props_jammer'))));

    const hasMugKnife = (myLvl >= 5) && (
                        (typeof window !== 'undefined' && (window.myMugKnifeCount > 0 || !!window.myHasMugKnife)) ||
                        (propInv['props_mug_knife'] > 0) ||
                        (propInv['mug_knife'] > 0) ||
                        (propInv['props_gasp_bicagi'] > 0) ||
                        (propInv['gasp_bicagi'] > 0) ||
                        (Array.isArray(inv) && (inv.includes('props_mug_knife') || inv.includes('mug_knife') || inv.includes('props_gasp_bicagi') || inv.includes('gasp_bicagi'))) ||
                        (typeof isItemOwned === 'function' && (isItemOwned('props', 'mug_knife') || isItemOwned('props', 'props_mug_knife') || isItemOwned('props', 'props_gasp_bicagi'))));

    return { hasZeus, hasJammer, hasMugKnife, myLvl };
}
window.checkProfileSpecialActionsOwnership = checkProfileSpecialActionsOwnership;


function openMyPlayerProfile() {
    let selfP = null;
    if (typeof myId !== 'undefined' && myId && typeof players !== 'undefined' && players && players[myId]) {
        selfP = players[myId];
    }
    const uname = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
    if (!selfP && uname && typeof players !== 'undefined' && players) {
        for (let sid in players) {
            if (players[sid].name && players[sid].name.toLowerCase() === uname.toLowerCase()) {
                selfP = players[sid];
                break;
            }
        }
    }
    if (!selfP && uname) {
        selfP = {
            id: myId || 'my_self_id',
            name: uname,
            room: (typeof currentRoom !== 'undefined' ? currentRoom : 'sokak'),
            avatar: (typeof myAvatar !== 'undefined' ? myAvatar : {}),
            likes: 0,
            dislikes: 0
        };
    }
    if (selfP) {
        openPlayerInteractionModal(selfP.id || myId, selfP);
    }
}
window.openMyPlayerProfile = openMyPlayerProfile;

// public/js/social.js - Sosyal Etkileşim & Arkadaşlık Sistemi
// Modüler Mimari: Oyuncular arası çay ısmarlama, para transferi, eşya hediyesi ve arkadaşlık yönetimi

var socket = window.socket || (typeof socket !== 'undefined' ? socket : null);
window.socket = socket;

let currentInteractingPlayer = null; // { id, name, player }
window.myFriendsList = window.myFriendsList || [];
window.myFriendRequests = window.myFriendRequests || [];

function getFriendUsername(f) {
    if (!f) return '';
    return typeof f === 'string' ? f : (f.username || '');
}

function isUserFriend(targetUsername) {
    if (!targetUsername) return false;
    let list = window.myFriendsList || [];
    let target = targetUsername.toLowerCase().trim();
    return list.some(f => getFriendUsername(f).toLowerCase() === target);
}

// --- 1. OYUNCU ETKİLEŞİM MODALI (Karaktere Tıklandığında Açılır - Sanalika Stili) ---
let interactionFacingIdx = 0;
const INTERACTION_FACINGS = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
const INTERACTION_FACING_LABELS = {
    'down': 'Ön',
    'down-right': 'Sağ Ön',
    'right': 'Sağ Profil',
    'up-right': 'Sağ Arka',
    'up': 'Arka',
    'up-left': 'Sol Arka',
    'left': 'Sol Profil',
    'down-left': 'Sol Ön'
};

function rotateInteractionAvatar(delta) {
    interactionFacingIdx = (interactionFacingIdx + delta + INTERACTION_FACINGS.length) % INTERACTION_FACINGS.length;
    const badge = document.getElementById('interactionFacingBadge');
    const facingKey = INTERACTION_FACINGS[interactionFacingIdx];
    if (badge) badge.innerText = INTERACTION_FACING_LABELS[facingKey] || 'Ön';

    if (typeof currentInteractingPlayer !== 'undefined' && currentInteractingPlayer && currentInteractingPlayer.player) {
        drawInteractingAvatar(currentInteractingPlayer.player, facingKey);
    }
}
window.rotateInteractionAvatar = rotateInteractionAvatar;

function openPlayerInteractionModal(targetId, targetPlayer) {
    if (!targetPlayer && targetId && typeof targetId === 'object') {
        targetPlayer = targetId;
        targetId = targetPlayer.id || 'target_sid';
    }
    if (!targetPlayer) return;
    currentInteractingPlayer = { id: targetId, name: targetPlayer.name, player: targetPlayer };

    const modal = document.getElementById('playerInteractionModal');
    if (!modal) return;

    interactionFacingIdx = 0;
    const badge = document.getElementById('interactionFacingBadge');
    if (badge) badge.innerText = 'Ön';

    const targetName = (targetPlayer.name || '').toLowerCase();
    const isTargetAdmin = !!(targetPlayer.isAdmin || targetPlayer.role === 'admin' || ['yasin', 'maltoroz'].includes(targetName));
    const isTargetMod = !!(targetPlayer.isMod || targetPlayer.role === 'mod' || targetPlayer.role === 'moderator' || ['elyesa'].includes(targetName));

    
    const uname = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
    const isSelf = (targetId === (typeof myId !== 'undefined' ? myId : null) || (uname && targetPlayer.name && uname.toLowerCase() === targetPlayer.name.toLowerCase()));

    // GÖRÜNMEZ OYUNCU PROFİLİ AÇILAMAZ VE TIKLANAMAZ KONTROLÜ
    const isTargetWearingInvis = !!(targetPlayer.outfit === 'costume_invisibility' || targetPlayer.outfit === 'outfit_invisibility' || targetPlayer.costume === 'costume_invisibility');
    const isTargetInvis = !!isTargetWearingInvis;
    if (!isSelf && isTargetInvis) {
        return; // Görünmez oyuncunun profili açılamaz!
    }

    const isTargetAnon = !isSelf && !!(targetPlayer.isAnon || (targetPlayer.anonMaskExpiresAt && targetPlayer.anonMaskExpiresAt > Date.now()));

    const headerEl = document.getElementById('playerInteractionHeader');
    const titleEl = document.getElementById('playerInteractionModalTitle');
    const modalBox = document.getElementById('playerInteractionModalBox');

    if (headerEl) {
        if (isTargetAnon) {
            headerEl.style.background = 'linear-gradient(180deg, #18181b 0%, #09090b 100%)';
            if (modalBox) modalBox.style.boxShadow = '0 24px 60px rgba(0, 0, 0, 0.75), 0 0 0 2px #3f3f46';
        } else if (isTargetAdmin) {
            headerEl.style.background = 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)';
            if (modalBox) modalBox.style.boxShadow = '0 24px 60px rgba(239,68,68,0.35), 0 0 0 2px #ef4444';
        } else if (isTargetMod) {
            headerEl.style.background = 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)';
            if (modalBox) modalBox.style.boxShadow = '0 24px 60px rgba(14,165,233,0.35), 0 0 0 2px #0ea5e9';
        } else {
            headerEl.style.background = 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)';
            if (modalBox) modalBox.style.boxShadow = '0 24px 60px rgba(99,102,241,0.35), 0 0 0 2px #6366f1';
        }
    }

    if (titleEl) {
        if (isTargetAnon) {
            titleEl.innerHTML = '🎭 Kimliği Belirsiz (Hayalet Profil)';
        } else if (isTargetAdmin) {
            titleEl.innerHTML = '👑 Yönetici Profili';
        } else if (isTargetMod) {
            titleEl.innerHTML = '🛡️ Moderatör Profili';
        } else {
            titleEl.innerHTML = isSelf ? '👤 Profilim' : '👤 Oyuncu Profili';
        }
    }

    // Oyuncu Adı, Seviye & Rol Rozetleri (Tek Satır)
    const nameEl = document.getElementById('interactionPlayerName');
    if (nameEl) {
        if (isTargetAnon) {
            nameEl.innerHTML = '<span style="color:#f8fafc; font-weight:800; font-size:15px;">???</span> <span style="font-size:10.5px; background:linear-gradient(135deg, #3f3f46, #18181b); color:#e2e8f0; font-weight:800; padding:2px 8px; border-radius:12px; border:1px solid #52525b; display:inline-flex; align-items:center; gap:3px;">🔒 Gizli Kimlik</span>';
        } else {
            const playerLvl = (targetPlayer.level !== undefined && targetPlayer.level !== null) 
                ? Math.max(1, Number(targetPlayer.level)) 
                : ((isSelf && (window.myLevel || (window.LevelClient && window.LevelClient.currentLevel))) || 1);
            
            const isFemale = (targetPlayer.gender === 'female' || (targetPlayer.avatar && targetPlayer.avatar.gender === 'female'));
            const genderEmoji = isFemale ? '♀️' : '♂️';

            let badgeHtml = '';
            if (isTargetAdmin) {
                badgeHtml = '<span style="font-size:11px; background:linear-gradient(135deg, #ef4444, #dc2626); color:white; font-weight:800; padding:2px 7px; border-radius:6px; box-shadow: 0 1px 4px rgba(239,68,68,0.3); display:inline-flex; align-items:center; gap:2px; flex-shrink:0;">👑 Admin</span>';
            } else if (isTargetMod) {
                badgeHtml = '<span style="font-size:11px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:white; font-weight:800; padding:2px 7px; border-radius:6px; box-shadow: 0 1px 4px rgba(14,165,233,0.3); display:inline-flex; align-items:center; gap:2px; flex-shrink:0;">🛡️ Mod</span>';
            } else {
                const title = (window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') 
                    ? window.LevelClient.getLevelTitle(playerLvl) 
                    : (typeof getLevelTitleHelper === 'function' ? getLevelTitleHelper(playerLvl) : 'Çaylak');
                badgeHtml = '<span style="font-size:11px; background:linear-gradient(135deg, #a855f7, #7e22ce); color:white; font-weight:800; padding:2px 7px; border-radius:6px; box-shadow: 0 1px 4px rgba(168,85,247,0.3); display:inline-flex; align-items:center; gap:2px; flex-shrink:0;">✨ ' + title + '</span>';
            }

            const levelBadgeHtml = '<span style="font-size:10.5px; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; font-weight:900; padding:2px 7px; border-radius:12px; box-shadow: 0 1px 4px rgba(245,158,11,0.4); border: 1px solid #fef3c7; display:inline-flex; align-items:center; gap:3px; flex-shrink:0;"><span>' + genderEmoji + '</span><span>LV ' + playerLvl + '</span></span>';

            nameEl.innerHTML = '<span style="color:#0f172a; max-width:130px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">' + targetPlayer.name + '</span> ' + levelBadgeHtml + ' ' + badgeHtml;
        }
    }

    // CANLI XP İLERLEME ÇUBUĞU (YALNIZCA KİŞİ KENDİ PROFİLİNİ AÇTIĞINDA GÖRÜNÜR)
    const xpContainer = document.getElementById('profileLiveXpContainer');
    if (xpContainer) {
        if (!isSelf) {
            xpContainer.style.display = 'none';
        } else {
            xpContainer.style.display = 'block';
            const curLvl = (targetPlayer.level !== undefined && targetPlayer.level !== null) ? Math.max(1, Number(targetPlayer.level)) : ((window.LevelClient && window.LevelClient.currentLevel !== undefined) ? Math.max(1, Number(window.LevelClient.currentLevel)) : (window.myLevel !== undefined ? Math.max(1, Number(window.myLevel)) : 1));
            const curXP = (targetPlayer.currentProgress !== undefined) ? Number(targetPlayer.currentProgress) : ((window.LevelClient && window.LevelClient.currentProgress !== undefined) ? Number(window.LevelClient.currentProgress) : 0);
            const tgtXP = (targetPlayer.targetXP !== undefined && targetPlayer.targetXP > 0) ? Number(targetPlayer.targetXP) : ((window.LevelClient && window.LevelClient.targetXP !== undefined) ? Number(window.LevelClient.targetXP) : (curLvl === 1 ? 20 : Math.floor(20 * Math.pow(curLvl - 1, 1.42))));
            const pct = tgtXP > 0 ? Math.min(100, Math.max(0, Math.floor((curXP / tgtXP) * 100))) : 100;
            
            const titleEl = document.getElementById('profileLiveXpTitle');
            const textEl = document.getElementById('profileLiveXpText');
            const fillEl = document.getElementById('profileLiveXpFill');
            if (titleEl) titleEl.innerHTML = '<span>⚡</span> Seviye ' + curLvl + ' İlerlemesi';
            if (curLvl >= 100) {
                if (textEl) textEl.textContent = 'Maksimum Seviye (Yaşayan Efsane) %100';
                if (fillEl) fillEl.style.width = '100%';
            } else {
                if (textEl) textEl.textContent = curXP.toLocaleString('tr-TR') + ' / ' + tgtXP.toLocaleString('tr-TR') + ' XP (%' + pct + ')';
                if (fillEl) fillEl.style.width = pct + '%';
            }
        }
    }

    // Ruh Hali (Mood) Gösterimi (10 Farklı Mod = 5 Çift)
    const initialMood = isTargetAnon ? 'none' : (targetPlayer.mood || (targetPlayer.player && targetPlayer.player.mood) || 'none');
    updateProfileMoodUI(initialMood, isSelf);

    // Beğeni / Saygı Durumu
    // Sürüklenebilir pencereyi başlat ve ortala
    initProfileDraggable();
    if (modalBox) {
        const sideTabAllowance = 38;
        const w = (window.innerWidth <= 420) ? Math.min(272, window.innerWidth - 52) : 304;
        const h = (window.innerHeight <= 500) ? 330 : 390;
        if (!modalBox.dataset.hasBeenPositioned || window.innerWidth <= 480 || window.innerHeight <= 500) {
            const cX = Math.max(8, Math.floor((window.innerWidth - (w + sideTabAllowance)) / 2));
            const cY = Math.max(6, Math.floor((window.innerHeight - h) / 2));
            modalBox.style.left = cX + 'px';
            modalBox.style.top = cY + 'px';
            modalBox.style.transform = 'none';
            modalBox.dataset.hasBeenPositioned = 'true';
        } else {
            const curLeft = parseFloat(modalBox.style.left) || 10;
            const curTop = parseFloat(modalBox.style.top) || 10;
            const maxAllowedLeft = Math.max(8, window.innerWidth - w - sideTabAllowance - 6);
            const maxAllowedTop = Math.max(6, window.innerHeight - 60);
            modalBox.style.left = Math.max(8, Math.min(curLeft, maxAllowedLeft)) + 'px';
            modalBox.style.top = Math.max(6, Math.min(curTop, maxAllowedTop)) + 'px';
        }
    }

    // İlk Rozet & Like UI Görüntüleme
    updateRatingButtonsUI(isTargetAnon ? 0 : (targetPlayer.likes || 0), isTargetAnon ? 0 : (targetPlayer.dislikes || 0), null);
    const likeBtn = document.getElementById('interactionLikeBtn');
    const dislikeBtn = document.getElementById('interactionDislikeBtn');
    if (likeBtn && dislikeBtn) {
        likeBtn.style.pointerEvents = (isSelf || isTargetAnon) ? 'none' : 'auto';
        likeBtn.style.opacity = (isSelf || isTargetAnon) ? '0.5' : '1';
        likeBtn.title = isSelf ? 'Aldığın toplam beğeni sayısı' : (isTargetAnon ? 'Gizli profil beğenilemez' : 'Bu oyuncuyu beğen');
        dislikeBtn.style.pointerEvents = (isSelf || isTargetAnon) ? 'none' : 'auto';
        dislikeBtn.style.opacity = (isSelf || isTargetAnon) ? '0.5' : '1';
        dislikeBtn.title = isSelf ? 'Aldığın toplam beğenmeme sayısı' : (isTargetAnon ? 'Gizli profil beğenilemez' : 'Bu oyuncuyu beğenme');
    }
    const sideTabs = document.querySelector('.profile-side-tabs');
    if (sideTabs) {
        if (isSelf) {
            sideTabs.innerHTML = `
                <button onclick="openDressingRoomModal()" class="profile-side-tab" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);" title="👔 Kıyafetlerim (Gardırop)">
                    <span class="tab-icon">👔</span>
                    <span class="tab-tooltip">👔 Kıyafetlerim</span>
                </button>
                <button onclick="openItemInventoryModal()" class="profile-side-tab" style="background: linear-gradient(135deg, #f59e0b, #d97706);" title="🎒 Eşya Çantam">
                    <span class="tab-icon">🎒</span>
                    <span class="tab-tooltip">🎒 Eşya Çantam</span>
                </button>
                <button onclick="openBadgeLevelSystemModal()" class="profile-side-tab" style="background: linear-gradient(135deg, #0284c7, #0369a1);" title="ℹ️ Seviye Sistemi">
                    <span class="tab-icon">ℹ️</span>
                    <span class="tab-tooltip">ℹ️ Seviye Sistemi</span>
                </button>
            `;
        } else {
            // YALNIZCA EŞYAYA SAHİP OLAN OYUNCULARDA GÖZÜKÜR & TEMATİK ANİMASYONLARLA YANIP SÖNER
            const { hasZeus, hasJammer, hasMugKnife } = checkProfileSpecialActionsOwnership();

            let specialActionsHtml = '';
            if (hasJammer) {
                specialActionsHtml += `
                    <button onclick="useJammerOnInteractingPlayer()" class="profile-side-tab tab-jammer animated-jammer" title="📡 Sinyal Kesici (Jammer)">
                        <span class="tab-icon">📡</span>
                        <span class="tab-tooltip">📡 Sinyal Kesici (3 Dk Sustur)</span>
                    </button>
                `;
            }
            if (hasMugKnife) {
                specialActionsHtml += `
                    <button id="profileMugActionBtn" onclick="useMugKnifeOnInteractingPlayer()" class="profile-side-tab tab-mug animated-mug" title="🗡️ Gasp Bıçağı (Max 2.000 TL)">
                        <span class="tab-icon">🗡️</span>
                        <span class="tab-tooltip" id="profileMugTooltip">🗡️ Gasp Bıçağı (Max 2.000 TL)</span>
                    </button>
                `;
            }
            if (hasZeus) {
                specialActionsHtml += `
                    <button onclick="useZeusLightningOnInteractingPlayer()" class="profile-side-tab tab-zeus animated-zeus" title="⚡ Zeus'un Yıldırımı (İlahi Gazap - Günde 3 Kez)">
                        <span class="tab-icon">⚡</span>
                        <span class="tab-tooltip">⚡ Zeus'un Yıldırımı (Çarp & Kül Et!)</span>
                    </button>
                `;
            }

            if (isTargetAnon) {
                // Hayalet Profil: Gizli Fısıldama ve Saldırı Eşyaları (Gasp, Jammer, Zeus) açık, diğerleri kapalı
                sideTabs.innerHTML = `
                    <button onclick="whisperToInteractingPlayer()" class="profile-side-tab tab-whisper" title="💬 Özel Fısılda (Gizli Mesaj)">
                        <span class="tab-icon">💬</span>
                        <span class="tab-tooltip">💬 Özel Fısılda</span>
                    </button>
                    ${specialActionsHtml}
                `;
            } else {
                sideTabs.innerHTML = `
                    <button onclick="sendTeaToInteractingPlayer()" class="profile-side-tab tab-tea" title="☕ Çay Ismarla (10 TL)">
                        <span class="tab-icon">☕</span>
                        <span class="tab-tooltip">☕ Çay Ismarla (10 TL)</span>
                    </button>
                    <button onclick="openSendMoneyModal()" class="profile-side-tab tab-money" title="💸 Para Gönder (Bakiye Transferi)">
                        <span class="tab-icon">💸</span>
                        <span class="tab-tooltip">💸 Para Gönder</span>
                    </button>
                    <button onclick="openGiftItemModal()" class="profile-side-tab tab-gift" title="🎁 Eşya Hediye Et">
                        <span class="tab-icon">🎁</span>
                        <span class="tab-tooltip">🎁 Eşya Hediye Et</span>
                    </button>
                    <button onclick="whisperToInteractingPlayer()" class="profile-side-tab tab-whisper" title="💬 Özel Fısılda (Gizli Mesaj)">
                        <span class="tab-icon">💬</span>
                        <span class="tab-tooltip">💬 Özel Fısılda</span>
                    </button>
                    <button id="interactionFriendBtn" onclick="toggleFriendshipWithInteractingPlayer()" class="profile-side-tab tab-friend" title="👥 Arkadaş Ekle">
                        <span id="interactionFriendIcon" class="tab-icon">👥</span>
                        <span id="interactionFriendTitle" class="tab-tooltip">👥 Arkadaş Ekle</span>
                    </button>
                    ${specialActionsHtml}
                `;
            }
        }
    }
    // Biyografi / Durum Sözü İlk Doldurma
    updateProfileMottoUI(isTargetAnon ? '🎭 Kimliği gizlenmiş gizemli yabancı...' : (targetPlayer.motto || targetPlayer.statusMessage || ''), isSelf);

    renderProfileSquareBadges(isTargetAnon ? { isAnon: true } : (targetPlayer.gameStats || targetPlayer), isSelf);

    // Canlı Sunucu Detaylarını İste
    if (typeof socket !== 'undefined' && socket.connected) {
        socket.emit('getProfileDetails', { targetName: targetPlayer.name, targetId: targetId });
    }

    // Canlı 8 Yönlü Avatar Önizleme Çizimi
    drawInteractingAvatar(targetPlayer, 'down');

    // Arkadaşlık Butonunu Güncelle
    updateFriendshipButtonState(targetPlayer.name);

    modal.style.display = 'flex';
}
window.openPlayerInteractionModal = openPlayerInteractionModal;

function closePlayerInteractionModal() {
    hideProfileBadgeTooltip(0);
    if (window._profileMugCooldownInterval) {
        clearInterval(window._profileMugCooldownInterval);
        window._profileMugCooldownInterval = null;
    }
    const modal = document.getElementById('playerInteractionModal');
    if (modal) modal.style.display = 'none';
    currentInteractingPlayer = null;
}
window.closePlayerInteractionModal = closePlayerInteractionModal;

function updateProfileMugCooldownUI() {
    const mugBtn = document.getElementById('profileMugActionBtn');
    const mugTooltip = document.getElementById('profileMugTooltip');
    if (!mugBtn) return;

    if (!currentInteractingPlayer || !currentInteractingPlayer.mugCooldownRemMs) {
        mugBtn.style.opacity = '1';
        mugBtn.style.filter = 'none';
        mugBtn.style.cursor = 'pointer';
        if (mugTooltip) mugTooltip.innerHTML = '🗡️ Gasp Bıçağı (Max 2.000 TL)';
        return;
    }

    const elapsed = Date.now() - (currentInteractingPlayer.mugCooldownReceivedAt || Date.now());
    const remMs = Math.max(0, currentInteractingPlayer.mugCooldownRemMs - elapsed);

    if (remMs > 0) {
        const hours = Math.floor(remMs / (3600 * 1000));
        const mins = Math.floor((remMs % (3600 * 1000)) / (60 * 1000));
        const secs = Math.floor((remMs % (60 * 1000)) / 1000);
        const timeStr = hours > 0 ? `${hours} sa ${mins} dk` : `${mins} dk ${secs} sn`;

        mugBtn.style.opacity = '0.62';
        mugBtn.style.filter = 'grayscale(0.75)';
        mugBtn.style.cursor = 'not-allowed';
        if (mugTooltip) {
            mugTooltip.innerHTML = `⏳ 24s Koruma: <b style="color:#fde047;">${timeStr}</b> sonra tekrar gasp edilebilir`;
        }
    } else {
        mugBtn.style.opacity = '1';
        mugBtn.style.filter = 'none';
        mugBtn.style.cursor = 'pointer';
        if (mugTooltip) mugTooltip.innerHTML = '🗡️ Gasp Bıçağı (Max 2.000 TL)';
        if (window._profileMugCooldownInterval) {
            clearInterval(window._profileMugCooldownInterval);
            window._profileMugCooldownInterval = null;
        }
    }
}
window.updateProfileMugCooldownUI = updateProfileMugCooldownUI;

function drawInteractingAvatar(player, facing = null) {
    const canvas = document.getElementById('interactionAvatarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!facing) {
        facing = INTERACTION_FACINGS[interactionFacingIdx] || 'down';
    }

    const cX = canvas.width / 2;
    const cY = 82;

    // Zemin Sanalika Mor/Lacivert Elips Gölgesi
    ctx.fillStyle = 'rgba(99, 102, 241, 0.14)';
    ctx.beginPath();
    ctx.ellipse(cX, cY + 16, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(cX, cY + 16, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cX, cY);
    ctx.scale(1.15, 1.15);

    // Avatar veri nesnesini normalize et
    const pAv = player.avatar || {};
    const av = {
        model: player.model || pAv.model || 'classic_2',
        color: player.color || pAv.color || '#3b82f6',
        shirt: player.shirt || pAv.shirt || player.color || pAv.color || '#3b82f6',
        pants: player.pants || pAv.pants || 'pants_classic_jeans',
        outfit: player.outfit || pAv.outfit || null,
        skinColor: player.skinColor || pAv.skinColor || '#facc15',
        hat: player.hat || pAv.hat || 'bere',
        hairColor: player.hairColor || pAv.hairColor || 'original',
        face: player.face || pAv.face || 'none',
        heldItem: player.heldItem || pAv.heldItem || 'none',
        shoes: player.shoes || pAv.shoes || 'sneakers',
        watch: player.watch || pAv.watch || 'none',
        gender: player.gender || pAv.gender || 'male',
        costume: player.costume || pAv.costume || null,
        anonMaskExpiresAt: player.anonMaskExpiresAt || (player.player && player.player.anonMaskExpiresAt) || (window.players && player.id && window.players[player.id] && window.players[player.id].anonMaskExpiresAt) || (player.isAnon ? (Date.now() + 60000) : 0)
    };

    const isK2 = (av.model === 'karakter_2');
    const costumeId = av.costume || (av.outfit && av.outfit.startsWith('costume_') ? av.outfit : null);
    if (typeof AnimalCostumeRenderer !== 'undefined' && AnimalCostumeRenderer.isCostume(costumeId)) {
        AnimalCostumeRenderer.draw(ctx, 0, 0, av, facing, false, false, 0, true);
    } else {
        if (isK2 && typeof Karakter2Renderer !== 'undefined') {
            Karakter2Renderer.draw(ctx, 0, 0, av, facing, false, 0, 0, false, true);
        } else if (typeof drawClassic2Avatar === 'function') {
            drawClassic2Avatar(ctx, 0, 0, av, facing, false, 0, 0, false, true);
        }
    }

    // Canlı 8 Açılı Gizli Kimlik Maskesi Çizimi
    if (av.anonMaskExpiresAt > Date.now() && !costumeId && typeof drawIsometricAnonMask === 'function') {
        drawIsometricAnonMask(ctx, 0, 0, facing, isK2, av);
    }

    ctx.restore();
}
window.drawInteractingAvatar = drawInteractingAvatar;

// --- ROZET SEVİYE SİSTEMİ (12 YUVALI KARE IZGARA & 1 - 10 SEVİYE SİSTEMİ) ---

// 1. Masa ve Mini Oyunlar 10 Seviye Eşikleri (Batak, Okey, Tavla, Bilardo, Satranç, Amiral Battı, XOX, Balık, Standup, Ganyan, Madencilik)
// 1. Oyuncu Rozeti & Mini Oyunlar Seviye Cetveli
// Lv.1: 1-10 El, Lv.2: 11-25 El, Lv.3: 26-50 El, Lv.4: 51-100 El, Lv.5: 101-250 El,
// Lv.6: 251-500 El (Bronz), Lv.7: 501-1000 El (Gümüş), Lv.8: 1001-1500 El (Altın),
// Lv.9: 1000-1499 El (Elmas), Lv.10: 1500+ El (Siyah Parlar / Max Tier)
const UNIVERSAL_GAME_THRESHOLDS = [
    { level: 1, min: 1, max: 9, title: "Acemi", glowClass: "", unit: "El" },
    { level: 2, min: 10, max: 24, title: "Masa yancısı", glowClass: "", unit: "El" },
    { level: 3, min: 25, max: 49, title: "Kıdemli", glowClass: "", unit: "El" },
    { level: 4, min: 50, max: 99, title: "Uzman", glowClass: "", unit: "El" },
    { level: 5, min: 100, max: 199, title: "Usta", glowClass: "", unit: "El" },
    { level: 6, min: 200, max: 349, title: "Büyük Usta", glowClass: "badge-glow-bronze", auraName: "🥉 Bronz Parlar (Metalik)", unit: "El" },
    { level: 7, min: 350, max: 599, title: "Racon Kesici", glowClass: "badge-glow-silver", auraName: "🥈 Gümüş Parlar (Parlak Gümüş)", unit: "El" },
    { level: 8, min: 600, max: 999, title: "Şampiyon", glowClass: "badge-glow-gold", auraName: "🥇 Altın Parlar (Gold)", unit: "El" },
    { level: 9, min: 1000, max: 1499, title: "Hükümdar", glowClass: "badge-glow-diamond", auraName: "💎 Elmas Parlar (Pırlanta)", unit: "El" },
    { level: 10, min: 1500, max: 999999, title: "Oyunbaz", glowClass: "badge-glow-black", auraName: "🖤 Siyah Parlar (Max Tier / Obsidyen)", unit: "El" }
];

// 2. Metaverse Sakini (Kıdem / Gün Sayısı) Eşikleri
const SENIORITY_THRESHOLDS = [
    { level: 1, min: 1, max: 3, title: "Yeni Sakin", glowClass: "", unit: "Gün" },
    { level: 2, min: 4, max: 7, title: "1 Haftalık", glowClass: "", unit: "Gün" },
    { level: 3, min: 8, max: 14, title: "2 Haftalık", glowClass: "", unit: "Gün" },
    { level: 4, min: 15, max: 30, title: "1 Aylık", glowClass: "", unit: "Gün" },
    { level: 5, min: 31, max: 60, title: "2 Aylık", glowClass: "", unit: "Gün" },
    { level: 6, min: 61, max: 90, title: "3 Aylık", glowClass: "badge-glow-bronze", auraName: "🥉 Bronz Parlar", unit: "Gün" },
    { level: 7, min: 91, max: 180, title: "Kıdemli Sakin", glowClass: "badge-glow-silver", auraName: "🥈 Gümüş Parlar", unit: "Gün" },
    { level: 8, min: 181, max: 270, title: "Vatandaş", glowClass: "badge-glow-gold", auraName: "🥇 Altın Parlar", unit: "Gün" },
    { level: 9, min: 271, max: 365, title: "Onursal Sakin", glowClass: "badge-glow-diamond", auraName: "💎 Elmas Parlar", unit: "Gün" },
    { level: 10, min: 366, max: 999999, title: "Metaverse Kurucusu", glowClass: "badge-glow-black", auraName: "🖤 Siyah Parlar (Max Tier)", unit: "Gün" }
];

// 10 Kademeli Rozet Sistemi Konfigürasyonu
const PROFILE_BADGES_CONFIG = [
    { id: 'gamer', name: 'Oyunbaz', shortName: 'Oyunbaz', icon: '🎮', unit: 'El', statKey: 'gamerGamesCount' },
    { id: 'botanic', name: 'Botanik Rozeti', shortName: 'Botanik', icon: '🌿', unit: 'Hasat', statKey: 'botanicHarvestCount' },
    { id: 'fishing', name: 'Balıkçılık', shortName: 'Balıkçılık', icon: '🎣', unit: 'Balık', statKey: 'fishCaughtCount' },
    { id: 'mining', name: 'Madencilik', shortName: 'Madencilik', icon: '⛏️', unit: 'Kaya', statKey: 'minedRocksCount' },
    { id: 'resident', name: 'Metaverse Sakini', shortName: 'Sakin', icon: '⭐', unit: 'XP', type: 'level', statKey: 'currentProgress' }
];

function getProfileBadgeTier(count, type, customUnit = null) {
    if (typeof window !== 'undefined' && typeof window.calculateUniversalBadgeTier === 'function' && window.calculateUniversalBadgeTier !== getProfileBadgeTier && window.BADGE_TIERS) {
        return window.calculateUniversalBadgeTier(count, type, customUnit, false);
    }
    count = Number(count) || 0;
    let tiers = UNIVERSAL_GAME_THRESHOLDS;
    let unit = customUnit || (type === 'seniority' ? "Gün" : "El");
    if (type === 'seniority') {
        tiers = SENIORITY_THRESHOLDS;
    }

    if (count <= 0) {
        return {
            level: 0,
            levelTag: "🔒",
            title: "Henüz Kazanılmadı",
            tierDesc: "Kilitli",
            countText: "0 / " + tiers[0].max,
            currentCount: 0,
            targetCount: tiers[0].min,
            progressPct: 0,
            glowClass: "",
            icon: "",
            auraName: "",
            isLocked: true,
            nextGoalText: "Seviye 1 için 1 " + unit + " gerekli"
        };
    }

    // Seviye 1 - 9
    for (let i = 0; i < tiers.length - 1; i++) {
        const t = tiers[i];
        if (count <= t.max) {
            const range = t.max - (t.min - 1);
            const currentInTier = count - (t.min - 1);
            const pct = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
            const nextTier = tiers[i + 1];
            const neededForNext = (t.max - count + 1);
            return {
                level: t.level,
                levelTag: "Lv. " + t.level,
                title: t.title,
                tierDesc: t.title + " (Lv. " + t.level + ")",
                countText: count + " / " + t.max,
                currentCount: count,
                targetCount: t.max,
                progressPct: pct,
                glowClass: t.glowClass || "",
                auraName: t.auraName || "",
                isLocked: false,
                nextGoalText: "Seviye " + nextTier.level + " (" + nextTier.title + ") için " + neededForNext + " " + unit + " kaldı"
            };
        }
    }

    // Seviye 10 (Maksimum Seviye - Siyah Parlar / Max Tier)
    const maxTier = tiers[tiers.length - 1];
    return {
        level: maxTier.level,
        levelTag: "Lv. 10",
        title: maxTier.title,
        tierDesc: maxTier.title + " (Lv. 10)",
        countText: "Maksimum Seviye",
        currentCount: count,
        targetCount: maxTier.min,
        progressPct: 100,
        glowClass: maxTier.glowClass || "badge-glow-black",
        auraName: maxTier.auraName || "🖤 Siyah Parlar (Max Tier)",
        isLocked: false,
        nextGoalText: "👑 Maksimum Seviyeye Ulaşıldı!"
    };
}

let cachedCurrentBadgeDataList = [];
let activeSelectedBadgeIndex = 0;

function updateProfileMottoUI(mottoText, isSelf) {
    const mottoEl = document.getElementById('interactionPlayerMottoText');
    const editBtn = document.getElementById('editMottoBtn');
    const container = document.getElementById('interactionMottoContainer');

    if (mottoEl) {
        if (mottoText && mottoText.trim()) {
            mottoEl.innerText = '“' + mottoText.trim() + '”';
            mottoEl.style.color = '#1e293b';
        } else {
            mottoEl.innerText = isSelf ? 'Durum sözü eklemek için tıkla...' : 'Henüz bir durum sözü yazılmadı.';
            mottoEl.style.color = '#94a3b8';
        }
    }
    if (editBtn) {
        editBtn.style.display = isSelf ? 'inline-flex' : 'none';
    }
    if (container) {
        if (isSelf) {
            container.style.cursor = 'pointer';
            container.onclick = (e) => {
                if (e.target.id !== 'editMottoBtn') openEditMottoModal();
            };
        } else {
            container.style.cursor = 'default';
            container.onclick = null;
        }
    }
}
window.updateProfileMottoUI = updateProfileMottoUI;

// 10 Farklı Ruh Hali (5 Çift) Konfigürasyonu - Emojisiz & Sade
const PLAYER_MOODS_CONFIG = {
    happy: { id: 'happy', label: 'Mutlu' },
    chill: { id: 'chill', label: 'Keyifli' },
    excited: { id: 'excited', label: 'Heyecanlı' },
    party: { id: 'party', label: 'Parti Modunda' },
    love: { id: 'love', label: 'Aşık' },
    tense: { id: 'tense', label: 'Gergin' },
    sad: { id: 'sad', label: 'Üzgün' },
    sleepy: { id: 'sleepy', label: 'Uykulu' },
    tired: { id: 'tired', label: 'Yorgun' },
    none: { id: 'none', label: '' }
};
window.PLAYER_MOODS_CONFIG = PLAYER_MOODS_CONFIG;

function updateProfileMoodUI(moodId, isSelf) {
    const config = PLAYER_MOODS_CONFIG[moodId] || PLAYER_MOODS_CONFIG.none;
    const labelEl = document.getElementById('interactionMoodLabel');
    const changeBtn = document.getElementById('changeMoodBtn');
    const container = document.getElementById('interactionMoodContainer');

    const isNone = (!moodId || moodId === 'none' || !config.label);

    if (labelEl) {
        labelEl.innerText = isNone ? '' : config.label;
        labelEl.style.color = '#1e293b';
        labelEl.style.fontWeight = '800';
    }

    if (changeBtn) {
        changeBtn.style.display = isSelf ? 'inline-flex' : 'none';
    }

    if (container) {
        if (isSelf) {
            container.style.cursor = 'pointer';
            container.title = isNone ? 'Ruh halinizi belirlemek için tıklayın' : 'Ruh halinizi değiştirmek için tıklayın';
            container.style.display = 'flex';
        } else {
            container.style.cursor = 'default';
            container.title = isNone ? '' : ('Oyuncunun Ruh Hali: ' + config.label);
            container.style.display = 'flex';
        }
    }
}
window.updateProfileMoodUI = updateProfileMoodUI;

function openMoodPickerModal() {
    const uname = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
    const isSelf = (currentInteractingPlayer && currentInteractingPlayer.name && uname && currentInteractingPlayer.name.toLowerCase() === uname.toLowerCase());
    if (!isSelf) return; // Başkasının profilindeyken seçim açılmaz

    const modal = document.getElementById('moodPickerModal');
    if (!modal) return;

    const currentMood = window.myMood || (currentInteractingPlayer && currentInteractingPlayer.player ? currentInteractingPlayer.player.mood : 'none') || 'none';

    document.querySelectorAll('.mood-select-btn').forEach(btn => {
        if (btn.dataset.mood === currentMood) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    modal.style.display = 'flex';
}
window.openMoodPickerModal = openMoodPickerModal;

function closeMoodPickerModal() {
    const modal = document.getElementById('moodPickerModal');
    if (modal) modal.style.display = 'none';
}
window.closeMoodPickerModal = closeMoodPickerModal;

function selectPlayerMood(moodId) {
    if (!PLAYER_MOODS_CONFIG[moodId]) return;

    window.myMood = moodId;
    if (typeof socket !== 'undefined' && socket.connected) {
        socket.emit('updatePlayerMood', { mood: moodId });
    }

    if (currentInteractingPlayer && currentInteractingPlayer.player) {
        currentInteractingPlayer.player.mood = moodId;
    }

    updateProfileMoodUI(moodId, true);
    closeMoodPickerModal();

    const m = PLAYER_MOODS_CONFIG[moodId];
    if (typeof showInGameAlert === 'function') {
        const msg = (moodId === 'none') ? 'Ruh haliniz temizlendi.' : ('Ruh haliniz güncellendi: ' + m.label);
        showInGameAlert(msg, 'Ruh Hali', '✨');
    }
}
window.selectPlayerMood = selectPlayerMood;

function getLevelTitleHelper(level) {
    level = Number(level) || 1;
    if (level >= 100) return 'Yaşayan Efsane';
    if (level >= 86) return 'Duayen';
    if (level >= 61) return 'Şehir Hakimi';
    if (level >= 36) return 'Kıdemli Müdavim';
    if (level >= 16) return 'Esnaf & Zanaatkar';
    return 'Çaylak';
}
window.getLevelTitleHelper = getLevelTitleHelper;

function getConceptALevelBadgeSVG(level, size = 46) {
    level = Math.max(1, Number(level) || 1);
    let tier = 1;
    if (level >= 100) tier = 6;
    else if (level >= 86) tier = 5;
    else if (level >= 61) tier = 4;
    else if (level >= 36) tier = 3;
    else if (level >= 16) tier = 2;
    else tier = 1;

    const strLevel = String(level);
    let fontSize = 21;
    let letterSpacing = "0";
    if (strLevel.length >= 3) {
        fontSize = 15.5;
        letterSpacing = "-0.8";
    } else if (strLevel.length === 2) {
        fontSize = 19;
        letterSpacing = "-0.5";
    }

    const uid = 'c_a_' + tier + '_' + size;
    const laurelLeaves = 
        '<g opacity="0.95">' +
            '<path d="M 8 28 C 4 23, 6 17, 12 15 C 10 19, 11 24, 14 27 Z"/>' +
            '<path d="M 6 36 C 3 31, 6 25, 12 24 C 10 28, 12 33, 15 35 Z"/>' +
            '<path d="M 10 44 C 7 39, 10 34, 16 33 C 14 37, 17 41, 20 43 Z"/>' +
            '<path d="M 46 28 C 50 23, 48 17, 42 15 C 44 19, 43 24, 40 27 Z"/>' +
            '<path d="M 48 36 C 51 31, 48 25, 42 24 C 44 28, 42 33, 39 35 Z"/>' +
            '<path d="M 44 44 C 47 39, 44 34, 38 33 C 40 37, 37 41, 34 43 Z"/>' +
            '<path d="M 22 47 C 25 49, 29 49, 32 47 C 30 44.5, 24 44.5, 22 47 Z"/>' +
        '</g>';

    if (tier === 6) {
        return '<svg viewBox="0 0 54 54" width="' + size + '" height="' + size + '" style="flex-shrink:0; display:block;" class="concept-a-badge-svg tier-6">' +
            '<defs>' +
                '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#e9d5ff"/><stop offset="35%" stop-color="#a855f7"/><stop offset="80%" stop-color="#3b0764"/><stop offset="100%" stop-color="#581c87"/>' +
                '</linearGradient>' +
                '<radialGradient id="core_' + uid + '" cx="40%" cy="35%" r="65%">' +
                    '<stop offset="0%" stop-color="#2e1065"/><stop offset="45%" stop-color="#0f051d"/><stop offset="100%" stop-color="#000000"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<g fill="#c084fc">' + laurelLeaves + '</g>' +
            '<path d="M 22 8 L 24 5 L 27 7 L 30 5 L 32 8 Z" fill="#fbbf24" stroke="#78350f" stroke-width="0.5"/>' +
            '<circle cx="27" cy="25" r="18.5" fill="url(#rim_' + uid + ')" stroke="#c084fc" stroke-width="0.9"/>' +
            '<circle cx="27" cy="25" r="16" fill="none" stroke="#f3e8ff" stroke-width="0.7" stroke-dasharray="1.5, 1.2"/>' +
            '<circle cx="27" cy="25" r="14" fill="url(#core_' + uid + ')" stroke="#7e22ce" stroke-width="0.6"/>' +
            '<path d="M 14 23 A 13.5 13.5 0 0 1 39 21 A 14.5 12 0 0 0 14 23 Z" fill="#ffffff" opacity="0.45"/>' +
            '<text x="27" y="32" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#000000" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
            '<text x="27" y="31" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#facc15" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
        '</svg>';
    } else if (tier === 5) {
        return '<svg viewBox="0 0 54 54" width="' + size + '" height="' + size + '" style="flex-shrink:0; display:block;" class="concept-a-badge-svg tier-5">' +
            '<defs>' +
                '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#7dd3fc"/><stop offset="70%" stop-color="#0284c7"/><stop offset="100%" stop-color="#e0f2fe"/>' +
                '</linearGradient>' +
                '<radialGradient id="core_' + uid + '" cx="40%" cy="35%" r="65%">' +
                    '<stop offset="0%" stop-color="#f0f9ff"/><stop offset="35%" stop-color="#38bdf8"/><stop offset="85%" stop-color="#0c4a6e"/><stop offset="100%" stop-color="#082f49"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<g fill="#38bdf8">' + laurelLeaves + '</g>' +
            '<polygon points="27,5 28,7 30,8 28,9 27,11 26,9 24,8 26,7" fill="#ffffff"/>' +
            '<circle cx="27" cy="25" r="18.5" fill="url(#rim_' + uid + ')" stroke="#0369a1" stroke-width="0.8"/>' +
            '<circle cx="27" cy="25" r="16" fill="none" stroke="#bae6fd" stroke-width="0.7" stroke-dasharray="1.5, 1.2"/>' +
            '<circle cx="27" cy="25" r="14" fill="url(#core_' + uid + ')" stroke="#0284c7" stroke-width="0.6"/>' +
            '<path d="M 14 23 A 13.5 13.5 0 0 1 39 21 A 14.5 12 0 0 0 14 23 Z" fill="#ffffff" opacity="0.6"/>' +
            '<text x="27" y="32" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#082f49" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
            '<text x="27" y="31" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#e0f2fe" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
        '</svg>';
    } else if (tier === 4) {
        return '<svg viewBox="0 0 54 54" width="' + size + '" height="' + size + '" style="flex-shrink:0; display:block;" class="concept-a-badge-svg tier-4">' +
            '<defs>' +
                '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#e2e8f0"/><stop offset="85%" stop-color="#64748b"/><stop offset="100%" stop-color="#f1f5f9"/>' +
                '</linearGradient>' +
                '<radialGradient id="core_' + uid + '" cx="40%" cy="35%" r="65%">' +
                    '<stop offset="0%" stop-color="#ecfdf5"/><stop offset="35%" stop-color="#10b981"/><stop offset="85%" stop-color="#064e3b"/><stop offset="100%" stop-color="#022c22"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<g fill="#10b981">' + laurelLeaves + '</g>' +
            '<circle cx="27" cy="25" r="18.5" fill="url(#rim_' + uid + ')" stroke="#047857" stroke-width="0.8"/>' +
            '<circle cx="27" cy="25" r="16" fill="none" stroke="#a7f3d0" stroke-width="0.7" stroke-dasharray="1.5, 1.2"/>' +
            '<circle cx="27" cy="25" r="14" fill="url(#core_' + uid + ')" stroke="#065f46" stroke-width="0.6"/>' +
            '<path d="M 14 23 A 13.5 13.5 0 0 1 39 21 A 14.5 12 0 0 0 14 23 Z" fill="#ffffff" opacity="0.5"/>' +
            '<text x="27" y="32" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#022c22" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
            '<text x="27" y="31" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#a7f3d0" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
        '</svg>';
    } else if (tier === 3) {
        return '<svg viewBox="0 0 54 54" width="' + size + '" height="' + size + '" style="flex-shrink:0; display:block;" class="concept-a-badge-svg tier-3">' +
            '<defs>' +
                '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#fffbeb"/><stop offset="35%" stop-color="#fbbf24"/><stop offset="85%" stop-color="#b45309"/><stop offset="100%" stop-color="#fef08a"/>' +
                '</linearGradient>' +
                '<radialGradient id="core_' + uid + '" cx="40%" cy="35%" r="65%">' +
                    '<stop offset="0%" stop-color="#ffe4e6"/><stop offset="35%" stop-color="#f43f5e"/><stop offset="85%" stop-color="#881337"/><stop offset="100%" stop-color="#4c0519"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<g fill="#eab308">' + laurelLeaves + '</g>' +
            '<circle cx="11" cy="20" r="1.1" fill="#e11d48"/><circle cx="43" cy="20" r="1.1" fill="#e11d48"/>' +
            '<circle cx="27" cy="25" r="18.5" fill="url(#rim_' + uid + ')" stroke="#78350f" stroke-width="0.8"/>' +
            '<circle cx="27" cy="25" r="16" fill="none" stroke="#fef08a" stroke-width="0.7" stroke-dasharray="1.5, 1.2"/>' +
            '<circle cx="27" cy="25" r="14" fill="url(#core_' + uid + ')" stroke="#9f1239" stroke-width="0.6"/>' +
            '<path d="M 14 23 A 13.5 13.5 0 0 1 39 21 A 14.5 12 0 0 0 14 23 Z" fill="#ffffff" opacity="0.45"/>' +
            '<text x="27" y="32" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#4c0519" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
            '<text x="27" y="31" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#fef08a" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
        '</svg>';
    } else if (tier === 2) {
        return '<svg viewBox="0 0 54 54" width="' + size + '" height="' + size + '" style="flex-shrink:0; display:block;" class="concept-a-badge-svg tier-2">' +
            '<defs>' +
                '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#cbd5e1"/><stop offset="85%" stop-color="#64748b"/><stop offset="100%" stop-color="#f8fafc"/>' +
                '</linearGradient>' +
                '<radialGradient id="core_' + uid + '" cx="40%" cy="35%" r="65%">' +
                    '<stop offset="0%" stop-color="#eff6ff"/><stop offset="35%" stop-color="#93c5fd"/><stop offset="85%" stop-color="#1e40af"/><stop offset="100%" stop-color="#0f172a"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<g fill="#94a3b8">' + laurelLeaves + '</g>' +
            '<circle cx="27" cy="25" r="18.5" fill="url(#rim_' + uid + ')" stroke="#334155" stroke-width="0.8"/>' +
            '<circle cx="27" cy="25" r="16" fill="none" stroke="#f1f5f9" stroke-width="0.7" stroke-dasharray="1.5, 1.2"/>' +
            '<circle cx="27" cy="25" r="14" fill="url(#core_' + uid + ')" stroke="#1e3a8a" stroke-width="0.6"/>' +
            '<path d="M 14 23 A 13.5 13.5 0 0 1 39 21 A 14.5 12 0 0 0 14 23 Z" fill="#ffffff" opacity="0.45"/>' +
            '<text x="27" y="32" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#0f172a" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
            '<text x="27" y="31" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#ffffff" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
        '</svg>';
    } else {
        return '<svg viewBox="0 0 54 54" width="' + size + '" height="' + size + '" style="flex-shrink:0; display:block;" class="concept-a-badge-svg tier-1">' +
            '<defs>' +
                '<linearGradient id="rim_' + uid + '" x1="0%" y1="0%" x2="100%" y2="100%">' +
                    '<stop offset="0%" stop-color="#fef08a"/><stop offset="35%" stop-color="#f59e0b"/><stop offset="85%" stop-color="#b45309"/><stop offset="100%" stop-color="#fef3c7"/>' +
                '</linearGradient>' +
                '<radialGradient id="core_' + uid + '" cx="40%" cy="35%" r="65%">' +
                    '<stop offset="0%" stop-color="#fffbeb"/><stop offset="45%" stop-color="#fef08a"/><stop offset="85%" stop-color="#d97706"/><stop offset="100%" stop-color="#78350f"/>' +
                '</radialGradient>' +
            '</defs>' +
            '<g fill="#d97706">' + laurelLeaves + '</g>' +
            '<circle cx="27" cy="25" r="18.5" fill="url(#rim_' + uid + ')" stroke="#78350f" stroke-width="0.8"/>' +
            '<circle cx="27" cy="25" r="16" fill="none" stroke="#fef3c7" stroke-width="0.7" stroke-dasharray="1.5, 1.2"/>' +
            '<circle cx="27" cy="25" r="14" fill="url(#core_' + uid + ')" stroke="#b45309" stroke-width="0.6"/>' +
            '<path d="M 14 23 A 13.5 13.5 0 0 1 39 21 A 14.5 12 0 0 0 14 23 Z" fill="#ffffff" opacity="0.45"/>' +
            '<text x="27" y="32" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#78350f" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
            '<text x="27" y="31" font-family="\'Inter\', sans-serif" font-size="' + fontSize + '" font-weight="950" fill="#92400e" text-anchor="middle" letter-spacing="' + letterSpacing + '">' + level + '</text>' +
        '</svg>';
    }
}
window.getConceptALevelBadgeSVG = getConceptALevelBadgeSVG;

function getLevelGlowHelper(level) {
    level = Number(level) || 1;
    if (level >= 100) return { glowClass: 'badge-glow-black', auraName: '🖤 Siyah Parlar (Max Seviye)' };
    if (level >= 80) return { glowClass: 'badge-glow-diamond', auraName: '💎 Elmas Parlar' };
    if (level >= 60) return { glowClass: 'badge-glow-gold', auraName: '🥇 Altın Parlar' };
    if (level >= 40) return { glowClass: 'badge-glow-silver', auraName: '🥈 Gümüş Parlar' };
    if (level >= 20) return { glowClass: 'badge-glow-bronze', auraName: '🥉 Bronz Parlar' };
    return { glowClass: '', auraName: '' };
}
window.getLevelGlowHelper = getLevelGlowHelper;

function createBadgeTierFromLevel(level, typeOrBadgeId, customUnit = null) {
    level = Number(level) || 0;
    if (typeOrBadgeId === 'resident' || typeOrBadgeId === 'level') {
        const lvl = Math.max(1, level || 1);
        const title = (window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') 
            ? window.LevelClient.getLevelTitle(lvl) 
            : getLevelTitleHelper(lvl);
        const glow = getLevelGlowHelper(lvl);
        return {
            level: lvl,
            levelTag: "Lv. " + lvl,
            title: title,
            tierDesc: title + " (Lv. " + lvl + ")",
            countText: "Seviye " + lvl,
            progressPct: 100,
            glowClass: glow.glowClass,
            auraName: glow.auraName,
            isLocked: false,
            nextGoalText: ""
        };
    }
    const badgeKey = (typeOrBadgeId === 'fish' ? 'fishing' : (typeOrBadgeId || 'gamer'));
    const tiers = (window.BADGE_TIERS && window.BADGE_TIERS[badgeKey]) || (typeOrBadgeId === 'seniority' ? SENIORITY_THRESHOLDS : UNIVERSAL_GAME_THRESHOLDS);
    let unit = customUnit || ((typeOrBadgeId === 'seniority') ? "Gün" : (tiers[0] && tiers[0].unit) || "El");

    if (level <= 0) {
        return {
            level: 0,
            levelTag: "🔒",
            title: "Henüz Kazanılmadı",
            tierDesc: "Kilitli",
            countText: "-",
            progressPct: 0,
            glowClass: "",
            icon: "",
            auraName: "",
            isLocked: true,
            nextGoalText: ""
        };
    }

    const t = tiers.find(item => item.level === level) || tiers[Math.min(level - 1, tiers.length - 1)];
    return {
        level: t.level,
        levelTag: "Lv. " + t.level,
        title: t.title,
        tierDesc: t.title + " (Lv. " + t.level + ")",
        countText: (level >= 10) ? "Maksimum Seviye" : ("Seviye " + t.level),
        progressPct: 100,
        glowClass: t.glowClass || "",
        auraName: t.auraName || "",
        isLocked: false,
        nextGoalText: ""
    };
}
window.createBadgeTierFromLevel = createBadgeTierFromLevel;

function openEditMottoModal() {
    const modal = document.getElementById('editMottoModal');
    const input = document.getElementById('editMottoInput');
    const counter = document.getElementById('editMottoCharCount');
    if (!modal || !input) return;

    const currentText = (window.myMotto !== undefined) 
        ? window.myMotto 
        : (typeof currentInteractingPlayer !== 'undefined' && currentInteractingPlayer && currentInteractingPlayer.player ? (currentInteractingPlayer.player.motto || currentInteractingPlayer.player.statusMessage || '') : '');
    
    input.value = currentText;
    if (counter) counter.innerText = input.value.length + '/120';

    input.oninput = function() {
        if (counter) counter.innerText = input.value.length + '/120';
    };

    modal.style.display = 'flex';
    setTimeout(() => {
        input.focus();
        input.select();
    }, 50);
}
window.openEditMottoModal = openEditMottoModal;

function closeEditMottoModal() {
    const modal = document.getElementById('editMottoModal');
    if (modal) modal.style.display = 'none';
}
window.closeEditMottoModal = closeEditMottoModal;

function savePlayerMotto() {
    const input = document.getElementById('editMottoInput');
    if (!input) return;
    const motto = (input.value || '').trim().slice(0, 120);

    if (typeof socket !== 'undefined' && socket.connected) {
        socket.emit('updatePlayerMotto', { motto: motto });
    }

    window.myMotto = motto;
    if (currentInteractingPlayer && currentInteractingPlayer.player) {
        currentInteractingPlayer.player.motto = motto;
        currentInteractingPlayer.player.statusMessage = motto;
    }

    updateProfileMottoUI(motto, true);
    closeEditMottoModal();

    if (typeof showInGameAlert === 'function') {
        showInGameAlert('Durum sözünüz başarıyla güncellendi! 💬', 'Profil Güncellendi', '✨');
    }
}
window.savePlayerMotto = savePlayerMotto;

function renderProfileSquareBadges(stats, isSelf = true) {
    const grid = document.getElementById('profileBadgesGrid');
    if (!grid) return;
    stats = stats || {};

    if (stats.isAnon) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; padding: 24px 14px; text-align: center; background: rgba(15, 23, 42, 0.6); border: 1px dashed rgba(255, 255, 255, 0.15); border-radius: 12px; margin-top: 4px;">
                <div style="font-size: 28px; margin-bottom: 6px;">🔒</div>
                <div style="font-weight: 800; font-size: 13.5px; color: #f1f5f9;">Gizli Kimlik Koruması</div>
                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Bu oyuncu maske taktığı için seviye ve rozetleri gizlenmiştir.</div>
            </div>
        `;
        return;
    }

    cachedCurrentBadgeDataList = [];

    // 1. Tüm rozetlerin seviyelerini ve bilgilerini hesapla
    const allComputedBadges = [];
    PROFILE_BADGES_CONFIG.forEach((cfg) => {
        let data;
        if (cfg.id === 'resident' || cfg.type === 'seniority' || cfg.type === 'level') {
            // SEVİYE & METAVERSE SAKİNİ: Sol üstteki 1-100 Level sistemine ve canlı XP'ye bağlıdır!
            if (isSelf) {
                const playerLevel = (stats.level !== undefined && stats.level !== null) ? Number(stats.level) : ((window.LevelClient && window.LevelClient.currentLevel !== undefined) ? Number(window.LevelClient.currentLevel) : (window.myLevel !== undefined ? Number(window.myLevel) : 0));
                const curXP = (stats.currentProgress !== undefined) 
                    ? Number(stats.currentProgress) 
                    : ((window.LevelClient && window.LevelClient.currentProgress !== undefined) ? Number(window.LevelClient.currentProgress) : 0);
                const tgtXP = (stats.targetXP !== undefined && stats.targetXP > 0) 
                    ? Number(stats.targetXP) 
                    : ((window.LevelClient && window.LevelClient.targetXP !== undefined) ? Number(window.LevelClient.targetXP) : (playerLevel === 0 ? 1 : (playerLevel === 1 ? 19 : Math.floor(20 * Math.pow(playerLevel - 1, 1.42)))));
                const totXP = (stats.totalXP !== undefined) ? Number(stats.totalXP) : (window.myTotalXP || 0);
                const progressPct = tgtXP > 0 ? Math.min(100, Math.floor((curXP / tgtXP) * 100)) : 100;
                const title = (window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') 
                    ? window.LevelClient.getLevelTitle(playerLevel) 
                    : getLevelTitleHelper(playerLevel);
                const glow = getLevelGlowHelper(playerLevel);
                const nextGoalText = playerLevel < 100 
                    ? ('Seviye ' + (playerLevel + 1) + ' için ' + Math.max(0, tgtXP - curXP) + ' XP kaldı') 
                    : 'Maksimum Seviyeye Ulaşıldı';

                data = {
                    level: playerLevel,
                    levelTag: "Lv. " + playerLevel,
                    title: title,
                    tierDesc: title + " (Lv. " + playerLevel + ")",
                    count: curXP,
                    currentCount: curXP,
                    targetCount: tgtXP,
                    totalXP: totXP,
                    progressPct: progressPct,
                    unit: 'XP',
                    glowClass: glow.glowClass,
                    auraName: glow.auraName,
                    isLocked: false,
                    isPrivate: false,
                    nextGoalText: nextGoalText
                };
            } else {
                const otherLevel = (stats.level !== undefined && stats.level !== null) ? Number(stats.level) : Number((stats.badgeLevels && (stats.badgeLevels.resident || stats.badgeLevels.level)) || 0);
                const title = (window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') 
                    ? window.LevelClient.getLevelTitle(otherLevel) 
                    : getLevelTitleHelper(otherLevel);
                const glow = getLevelGlowHelper(otherLevel);
                data = {
                    level: otherLevel,
                    levelTag: "Lv. " + otherLevel,
                    title: title,
                    tierDesc: title + " (Lv. " + otherLevel + ")",
                    count: 0,
                    currentCount: 0,
                    targetCount: 0,
                    progressPct: 100,
                    unit: 'XP',
                    glowClass: glow.glowClass,
                    auraName: glow.auraName,
                    isLocked: false,
                    isPrivate: true,
                    nextGoalText: ""
                };
            }
            data.badgeId = cfg.id;
            data.badgeName = cfg.name;
            data.shortName = cfg.shortName;
            data.badgeIcon = cfg.icon;
            data.unit = 'XP';
            allComputedBadges.push(data);
            return;
        } else if (isSelf) {
            // Kendi Profilimiz: Gerçek ham sayılar ve doluluk barı hesaplanır
            let count = 0;
            if (cfg.id === 'gamer') {
                count = Number(stats.gamerGamesCount || (
                    (Number(stats.batakGamesCount) || 0) +
                    (Number(stats.okeyGamesCount) || 0) +
                    (Number(stats.tavlaGamesCount) || 0) +
                    (Number(stats.billiardGamesCount) || 0) +
                    (Number(stats.chessGamesCount) || 0) +
                    (Number(stats.amiralBattiGamesCount) || 0) +
                    (Number(stats.xoxGamesCount) || 0) +
                    (Number(stats.dostKazigiGamesCount) || 0)
                ));
            } else if (cfg.id === 'botanic') {
                count = Number(stats.botanicHarvestCount !== undefined ? stats.botanicHarvestCount : (stats.botanicHarvestPoints || 0));
            } else if (cfg.id === 'mining') {
                count = Number(stats.minedRocksCount !== undefined ? stats.minedRocksCount : (stats.minedCount || 0));
            } else if (cfg.id === 'fishing' || cfg.id === 'fish') {
                count = Number(stats.fishCaughtCount || 0);
            } else if (stats[cfg.statKey] !== undefined) {
                count = Number(stats[cfg.statKey]);
            } else {
                count = Number(stats[cfg.statKey + 'GamesCount'] || stats[cfg.id] || 0);
            }

            data = (typeof window.calculateUniversalBadgeTier === 'function' && window.calculateUniversalBadgeTier !== getProfileBadgeTier)
                ? window.calculateUniversalBadgeTier(count, cfg.id, cfg.unit, false)
                : getProfileBadgeTier(count, cfg.id, cfg.unit);
            data.count = count;
            data.currentCount = count;
            data.isPrivate = false;
        } else {
            // Başka Oyuncunun Profili: Ham sayılar ve barlar GİZLİDİR, sadece Seviye & Unvan
            const level = (stats.badgeLevels && typeof stats.badgeLevels[cfg.id] === 'number')
                ? stats.badgeLevels[cfg.id]
                : (stats.badgeLevels && typeof stats.badgeLevels[cfg.id === 'fishing' ? 'fish' : cfg.id] === 'number'
                    ? stats.badgeLevels[cfg.id === 'fishing' ? 'fish' : cfg.id]
                    : 0);
            data = createBadgeTierFromLevel(level, cfg.id, cfg.unit);
            data.isPrivate = true;
        }

        data.badgeId = cfg.id;
        data.badgeName = cfg.name;
        data.shortName = cfg.shortName;
        data.badgeIcon = cfg.icon;
        data.unit = cfg.unit;
        allComputedBadges.push(data);
    });

    // 2. Seviye / Resident rozetini belirle (Daima 1. yuva / slot 0)
    let residentBadge = allComputedBadges.find(b => b.badgeId === 'resident');
    if (!residentBadge) {
        const lvl = Number(stats.level || (window.LevelClient && window.LevelClient.currentLevel) || window.myLevel || 1);
        const title = (window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') ? window.LevelClient.getLevelTitle(lvl) : getLevelTitleHelper(lvl);
        const glow = getLevelGlowHelper(lvl);
        residentBadge = {
            badgeId: 'resident',
            badgeName: 'Metaverse Sakini',
            shortName: 'Sakin',
            badgeIcon: '⭐',
            level: lvl,
            levelTag: 'Lv. ' + lvl,
            title: title,
            tierDesc: title + " (Lv. " + lvl + ")",
            glowClass: glow.glowClass,
            auraName: glow.auraName,
            isPrivate: !isSelf
        };
    } else if (stats.level && stats.level > residentBadge.level) {
        residentBadge.level = stats.level;
        residentBadge.levelTag = 'Lv. ' + stats.level;
    }

    // 3. Kazanılmış DİĞER rozetleri filtrele (resident hariç ve KESİNLİKLE level > 0)
    // Seviyesi 0 olan (kazanılmamış) rozetler ASLA yuvaya yerleştirilmez!
    const otherEarnedBadges = allComputedBadges.filter(b => b.badgeId !== 'resident' && b.level > 0);

    // 4. Kazanılma sırasına (badgeUnlockOrder) göre sırala
    let rawUnlockOrder = Array.isArray(stats.badgeUnlockOrder) 
        ? stats.badgeUnlockOrder 
        : (currentInteractingPlayer && currentInteractingPlayer.player && Array.isArray(currentInteractingPlayer.player.badgeUnlockOrder) 
            ? currentInteractingPlayer.player.badgeUnlockOrder 
            : []);

    // Normalizasyon: 'fish' -> 'fishing', masa oyunları -> 'gamer'
    const legacyKeys = ['batak', 'okey', 'okey101', 'tavla', 'billiard', 'chess', 'amiral', 'amiralbatti', 'xox', 'dostkazigi'];
    const normalizedUnlockOrder = [];
    rawUnlockOrder.forEach(k => {
        let normalizedKey = k;
        if (k === 'fish') normalizedKey = 'fishing';
        if (legacyKeys.includes(k)) normalizedKey = 'gamer';
        if (!normalizedUnlockOrder.includes(normalizedKey)) {
            normalizedUnlockOrder.push(normalizedKey);
        }
    });

    otherEarnedBadges.sort((a, b) => {
        let idxA = normalizedUnlockOrder.indexOf(a.badgeId);
        let idxB = normalizedUnlockOrder.indexOf(b.badgeId);
        if (idxA === -1) idxA = 999;
        if (idxB === -1) idxB = 999;
        return idxA - idxB;
    });

    // 5. Nihai rozet dizisi: [Seviye/Resident, ...Kazanılma sırasına göre diğer rozetler]
    const finalBadges = [residentBadge, ...otherEarnedBadges];

    cachedCurrentBadgeDataList = finalBadges;

    let html = '';
    const TOTAL_SLOTS = 12;

    // Kazanılan rozetleri sırayla ilk yuvalara koy
    for (let slotIdx = 0; slotIdx < TOTAL_SLOTS; slotIdx++) {
        if (slotIdx < finalBadges.length) {
            const data = finalBadges[slotIdx];
            const isLevelSlot = (data.badgeId === 'resident' || slotIdx === 0);
            const levelClass = isLevelSlot ? 'profile-level-badge-slot' : ('badge-level-' + (data.level <= 10 ? data.level : 10));
            const glowClass = data.glowClass ? data.glowClass : '';
            const isSelected = (slotIdx === activeSelectedBadgeIndex);
            const selectedClass = isSelected ? 'active-selected' : '';

            const squareTitle = data.isPrivate 
                ? (data.badgeName + ': ' + data.title + ' (Lv. ' + data.level + ')')
                : (data.badgeName + ': ' + data.title + ' (Lv. ' + data.level + ') | İlerleme: ' + (data.currentCount !== undefined ? data.currentCount : (data.count || 0)) + ' / ' + (data.targetCount !== undefined ? data.targetCount : data.count) + ' ' + (data.unit || '') + ' (%' + data.progressPct + ')');

            if (isLevelSlot) {
                // KONSEPT A (ALTIN PRESTİJ MADALYONU): Seviye basamaklarına göre dinamik evrimleşen madalyon
                const tierNum = (data.level >= 100) ? 6 : ((data.level >= 86) ? 5 : ((data.level >= 61) ? 4 : ((data.level >= 36) ? 3 : ((data.level >= 16) ? 2 : 1))));
                const tierClass = 'tier-' + tierNum;
                const badgeSvg = (typeof getConceptALevelBadgeSVG === 'function') 
                    ? getConceptALevelBadgeSVG(data.level, 46) 
                    : ('<span class="badge-huge-level-number">' + data.level + '</span>');
                html += '<div class="profile-badge-square profile-level-badge-slot ' + tierClass + ' ' + glowClass + ' ' + selectedClass + '" ' +
                        'id="profileBadgeSquare_' + slotIdx + '" ' +
                        'onclick="selectProfileBadgeSlot(' + slotIdx + ', event)" ' +
                        'onmouseenter="showProfileBadgeTooltip(' + slotIdx + ', this)" ' +
                        'onmouseleave="hideProfileBadgeTooltip()" ' +
                        'title="' + squareTitle + '">' +
                        badgeSvg +
                        '</div>';
            } else {
                html += '<div class="profile-badge-square ' + levelClass + ' ' + glowClass + ' ' + selectedClass + '" ' +
                        'id="profileBadgeSquare_' + slotIdx + '" ' +
                        'onclick="selectProfileBadgeSlot(' + slotIdx + ', event)" ' +
                        'onmouseenter="showProfileBadgeTooltip(' + slotIdx + ', this)" ' +
                        'onmouseleave="hideProfileBadgeTooltip()" ' +
                        'title="' + squareTitle + '">' +
                        '<span class="badge-icon">' + data.badgeIcon + '</span>' +
                        '<span class="badge-level-tag">' + data.levelTag + '</span>' +
                        '</div>';
            }
        } else {
            // Henüz kazanılmamış yuvalar TERTEMİZ KESİK ÇİZGİLİ BOŞ YUVA olarak kalır (gri ikon/kilit yok!)
            html += '<div class="profile-badge-square empty-slot" id="profileBadgeSquare_' + slotIdx + '"></div>';
        }
    }

    grid.innerHTML = html;
}
window.renderProfileSquareBadges = renderProfileSquareBadges;

function selectProfileBadgeSlot(idx, event) {
    if (idx >= cachedCurrentBadgeDataList.length) return;
    activeSelectedBadgeIndex = idx;
    document.querySelectorAll('.profile-badge-square').forEach((el, i) => {
        if (i === idx) el.classList.add('active-selected');
        else el.classList.remove('active-selected');
    });
    const targetEl = document.getElementById('profileBadgeSquare_' + idx);
    if (targetEl) {
        showProfileBadgeTooltip(idx, targetEl, true);
    }
}
window.selectProfileBadgeSlot = selectProfileBadgeSlot;

let badgeTooltipHideTimeout = null;

function showProfileBadgeTooltip(idx, element, isPinned = false) {
    if (badgeTooltipHideTimeout) {
        clearTimeout(badgeTooltipHideTimeout);
        badgeTooltipHideTimeout = null;
    }
    const data = cachedCurrentBadgeDataList[idx];
    if (!data) return;

    let tip = document.getElementById('profileBadgeFloatingTooltip');
    if (!tip) {
        tip = document.createElement('div');
        tip.id = 'profileBadgeFloatingTooltip';
        tip.className = 'profile-badge-floating-tooltip';
        document.body.appendChild(tip);
    }

    let auraHtml = '';
    if (data.auraName) {
        let auraColor = '#a855f7';
        if (data.glowClass === 'badge-glow-bronze') auraColor = '#f59e0b';
        else if (data.glowClass === 'badge-glow-silver') auraColor = '#cbd5e1';
        else if (data.glowClass === 'badge-glow-gold') auraColor = '#facc15';
        else if (data.glowClass === 'badge-glow-diamond') auraColor = '#38bdf8';
        else if (data.glowClass === 'badge-glow-black') auraColor = '#c084fc';
        auraHtml = '<div style="font-size: 9.5px; font-weight: 800; color: ' + auraColor + '; margin-top: 2px;">' + data.auraName + '</div>';
    }

    const iconHtml = (data.badgeId === 'resident')
        ? ((typeof getConceptALevelBadgeSVG === 'function')
            ? getConceptALevelBadgeSVG(data.level, 34)
            : '<div style="width: 32px; height: 32px; min-width: 32px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); border: 2px solid #fef3c7; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 900; color: #ffffff; box-shadow: 0 2px 6px rgba(245,158,11,0.5); flex-shrink: 0;">' + data.level + '</div>')
        : '<div style="font-size: 26px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4)); flex-shrink: 0;">' + data.badgeIcon + '</div>';

    if (data.isPrivate) {
        // BAŞKA OYUNCUNUN PROFİLİ: Ham sayılar, bar ve sayaçlar GİZLİ ("✓ Rozet Kazanıldı" kesinlikle yer almaz)
        // Yalnızca ulaşılan seviye unvanı görünür: Örn: Usta Bahçıvan (Lv. 5)
        const displayLabel = data.title + ' (Lv. ' + data.level + ')';
        tip.innerHTML = 
            '<div style="display: flex; align-items: center; gap: 8px;">' +
                iconHtml +
                '<div style="flex: 1; min-width: 0;">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                        '<span style="font-size: 11px; font-weight: 900; color: #ffffff;">' + data.badgeName + '</span>' +
                        '<span style="font-size: 9.5px; font-weight: 900; padding: 1.5px 6px; border-radius: 4px; background: rgba(255,255,255,0.15); color: #f8fafc;">' + data.levelTag + '</span>' +
                    '</div>' +
                    '<div style="font-size: 11px; color: #38bdf8; font-weight: 800; margin-top: 3px;">' + displayLabel + '</div>' +
                    auraHtml +
                '</div>' +
            '</div>';
    } else {
        // KENDİ PROFİLİMİZ: İlerleme: X / Target (%Y) ilerleme barı
        let barColor = '#6366f1';
        if (data.badgeId === 'resident') {
            barColor = 'linear-gradient(90deg, #f59e0b, #eab308, #22c55e)';
        } else if (data.glowClass === 'badge-glow-black') barColor = 'linear-gradient(90deg, #18181b, #a855f7, #c084fc)';
        else if (data.glowClass === 'badge-glow-diamond') barColor = 'linear-gradient(90deg, #0284c7, #ec4899, #38bdf8)';
        else if (data.glowClass === 'badge-glow-gold') barColor = 'linear-gradient(90deg, #ca8a04, #facc15)';
        else if (data.glowClass === 'badge-glow-silver') barColor = 'linear-gradient(90deg, #475569, #cbd5e1, #f1f5f9)';
        else if (data.glowClass === 'badge-glow-bronze') barColor = 'linear-gradient(90deg, #78350f, #f59e0b)';
        else if (data.level >= 1 && data.level <= 5) {
            const colors = ['', '#10b981', '#0ea5e9', '#6366f1', '#8b5cf6', '#f43f5e'];
            barColor = colors[data.level] || '#6366f1';
        }

        const curVal = data.currentCount !== undefined ? data.currentCount : (data.count || 0);
        const tgtVal = data.targetCount !== undefined ? data.targetCount : (data.countText && data.countText.includes('/') ? data.countText.split('/')[1]?.trim() : curVal);
        const unitStr = data.unit ? (' ' + data.unit) : '';
        const progressFormatted = ((data.level >= 10 && data.badgeId !== 'resident') || (data.badgeId === 'resident' && data.level >= 100))
            ? ('İlerleme: ' + curVal + ' / ' + tgtVal + unitStr + ' (%100)')
            : ('İlerleme: ' + curVal + ' / ' + tgtVal + unitStr + ' (%' + data.progressPct + ')');
        const statusLine = data.title + ' (Lv. ' + data.level + ') | ' + progressFormatted;

        tip.innerHTML = 
            '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">' +
                iconHtml +
                '<div style="flex: 1; min-width: 0;">' +
                    '<div style="display: flex; justify-content: space-between; align-items: center;">' +
                        '<span style="font-size: 11px; font-weight: 900; color: #ffffff;">' + data.badgeName + '</span>' +
                        '<span style="font-size: 9.5px; font-weight: 900; padding: 1.5px 6px; border-radius: 4px; background: rgba(255,255,255,0.15); color: #f8fafc;">' + data.levelTag + '</span>' +
                    '</div>' +
                    '<div style="font-size: 9.5px; color: #e2e8f0; font-weight: 800; margin-top: 1px;">' + statusLine + '</div>' +
                    auraHtml +
                '</div>' +
            '</div>' +
            '<div style="width: 100%; height: 6px; background: rgba(255,255,255,0.15); border-radius: 3px; overflow: hidden; margin: 4px 0;">' +
                '<div style="width: ' + data.progressPct + '%; height: 100%; background: ' + barColor + '; border-radius: 3px; transition: width 0.3s;"></div>' +
            '</div>' +
            '<div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; font-weight: 700;">' +
                '<span style="color: #f1f5f9;">' + curVal + ' / ' + tgtVal + unitStr + '</span>' +
                '<span>%' + data.progressPct + '</span>' +
            '</div>' +
            (data.nextGoalText ? '<div style="font-size: 8.5px; color: #94a3b8; margin-top: 4px; font-style: italic; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 3px;">' + data.nextGoalText + '</div>' : '');
    }

    // Konumlandırma
    const rect = element.getBoundingClientRect();
    tip.style.display = 'block';
    const tipWidth = 220;
    let left = rect.left + (rect.width / 2) - (tipWidth / 2);
    let top = rect.top - tip.offsetHeight - 8;

    if (left < 10) left = 10;
    if (left + tipWidth > window.innerWidth - 10) left = window.innerWidth - tipWidth - 10;
    if (top < 10) {
        top = rect.bottom + 8; // Ekranın altına taşarsa aşağıda göster
    }

    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
}
window.showProfileBadgeTooltip = showProfileBadgeTooltip;

function hideProfileBadgeTooltip(delay = 120) {
    if (badgeTooltipHideTimeout) clearTimeout(badgeTooltipHideTimeout);
    badgeTooltipHideTimeout = setTimeout(() => {
        const tip = document.getElementById('profileBadgeFloatingTooltip');
        if (tip) tip.style.display = 'none';
    }, delay);
}
window.hideProfileBadgeTooltip = hideProfileBadgeTooltip;

// Modal Açma / Kapatma (Seviye Sistemi)
function openBadgeLevelSystemModal() {
    hideProfileBadgeTooltip(0);
    const modal = document.getElementById('badgeLevelSystemModal');
    if (modal) modal.style.display = 'flex';
}
function closeBadgeLevelSystemModal() {
    const modal = document.getElementById('badgeLevelSystemModal');
    if (modal) modal.style.display = 'none';
}
window.openBadgeLevelSystemModal = openBadgeLevelSystemModal;
window.closeBadgeLevelSystemModal = closeBadgeLevelSystemModal;

// --- 🎉 ROZET SEVİYE ATLAMA VE KATLAMALI ÖDÜL SİSTEMİ ---
const badgeLevelUpQueue = [];
let isBadgeLevelUpShowing = false;

function showBadgeLevelUpPopup(data) {
    if (!data) return;
    badgeLevelUpQueue.push(data);
    if (!isBadgeLevelUpShowing) {
        processNextBadgeLevelUp();
    }
}

function processNextBadgeLevelUp() {
    if (badgeLevelUpQueue.length === 0) {
        isBadgeLevelUpShowing = false;
        const modal = document.getElementById('badgeLevelUpModal');
        if (modal) modal.style.display = 'none';
        return;
    }

    isBadgeLevelUpShowing = true;
    const item = badgeLevelUpQueue.shift();

    const modal = document.getElementById('badgeLevelUpModal');
    const iconEl = document.getElementById('badgeLevelUpIcon');
    const numberEl = document.getElementById('badgeLevelUpNumber');
    const titleEl = document.getElementById('badgeLevelUpTitle');
    const rankEl = document.getElementById('badgeLevelUpRank');
    const moneyEl = document.getElementById('badgeLevelUpMoneyText');
    const diamondEl = document.getElementById('badgeLevelUpDiamondText');

    if (iconEl) iconEl.textContent = item.badgeIcon || '🏅';
    if (numberEl) numberEl.textContent = item.level;

    // Kullanıcı kuralı: "Tebrikler Botanik 1. Seviyeye ulaştınız."
    const badgeDisplayName = item.shortName || item.badgeName || 'Rozet';
    if (titleEl) {
        titleEl.textContent = `Tebrikler ${badgeDisplayName} ${item.level}. Seviyeye ulaştınız!`;
    }

    if (rankEl) {
        if (item.rankTitle) {
            rankEl.textContent = `"${item.rankTitle}" Ünvanı ve Rozet Aurası Açıldı`;
            rankEl.style.display = 'inline-block';
        } else {
            rankEl.style.display = 'none';
        }
    }

    if (moneyEl) {
        const m = Number(item.rewardMoney) || 0;
        moneyEl.textContent = `+${m.toLocaleString('tr-TR')} TL`;
    }

    if (diamondEl) {
        const d = Number(item.rewardDiamonds) || 0;
        diamondEl.textContent = `+${d} Elmas`;
    }

    if (modal) {
        modal.style.display = 'flex';
    }

    if (typeof playSound === 'function') {
        try {
            playSound('coins');
        } catch(_) {}
    }
}

function closeBadgeLevelUpModal() {
    const modal = document.getElementById('badgeLevelUpModal');
    if (modal) modal.style.display = 'none';
    setTimeout(() => {
        processNextBadgeLevelUp();
    }, 220);
}
window.closeBadgeLevelUpModal = closeBadgeLevelUpModal;
window.showBadgeLevelUpPopup = showBadgeLevelUpPopup;

if (typeof socket !== 'undefined' && socket) {
    socket.on('badgeLevelUp', (data) => {
        if (data.newMoney !== undefined && typeof updateMoneyDisplay === 'function') {
            updateMoneyDisplay(data.newMoney);
        }
        if (data.newDiamonds !== undefined && typeof updateDiamondDisplay === 'function') {
            updateDiamondDisplay(data.newDiamonds);
        }
        showBadgeLevelUpPopup(data);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
        const m = document.getElementById('badgeLevelUpModal');
        if (m && m.style.display === 'flex') {
            e.preventDefault();
            closeBadgeLevelUpModal();
        }
    }
});

// Geriye Dönük Uyumluluk (Legacy Aliases)
window.renderFishBadge = function(count) {
    renderProfileSquareBadges({ fishCaughtCount: count });
};
window.getFishBadgeTier = function(count) {
    return getProfileBadgeTier(count, 'fish');
};

// --- SÜRÜKLENEBİLİR PROFİL PENCERESİ (makeModalDraggable Entegrasyonu) ---
function initProfileDraggable() {
    if (typeof makeModalDraggable === 'function') {
        makeModalDraggable('playerInteractionModalBox', 'playerInteractionHeader');
    }
}
window.initProfileDraggable = initProfileDraggable;

// --- LIKE / DISLIKE BUTON VE SOCKET ETKİLEŞİMİ ---
function updateRatingButtonsUI(likes, dislikes, userRating) {
    const likeNum = document.getElementById('interactionLikesNum');
    const dislikeNum = document.getElementById('interactionDislikesNum');
    const likeBtn = document.getElementById('interactionLikeBtn');
    const dislikeBtn = document.getElementById('interactionDislikeBtn');

    if (likeNum) likeNum.innerText = (likes !== undefined && likes !== null) ? likes : 0;
    if (dislikeNum) dislikeNum.innerText = (dislikes !== undefined && dislikes !== null) ? dislikes : 0;

    if (likeBtn) {
        if (userRating === 'like') {
            likeBtn.classList.add('active');
        } else {
            likeBtn.classList.remove('active');
        }
    }

    if (dislikeBtn) {
        if (userRating === 'dislike') {
            dislikeBtn.classList.add('active');
        } else {
            dislikeBtn.classList.remove('active');
        }
    }
}
window.updateRatingButtonsUI = updateRatingButtonsUI;

function rateInteractingPlayer(action) {
    if (!currentInteractingPlayer || !action) return;
    if (typeof socket !== 'undefined' && socket.connected) {
        socket.emit('ratePlayer', {
            targetName: currentInteractingPlayer.name,
            action: action
        });
    } else {
        // Çevrimdışı / Local test desteği
        const username = currentInteractingPlayer.name;
        const key = 'meta_player_rate_' + username.toLowerCase();
        let currentRate = localStorage.getItem(key);
        let likes = parseInt(document.getElementById('interactionLikesNum')?.innerText || '0', 10);
        let dislikes = parseInt(document.getElementById('interactionDislikesNum')?.innerText || '0', 10);

        if (currentRate === action) {
            if (action === 'like') likes = Math.max(0, likes - 1);
            if (action === 'dislike') dislikes = Math.max(0, dislikes - 1);
            localStorage.removeItem(key);
            currentRate = null;
        } else if (currentRate && currentRate !== action) {
            if (currentRate === 'like') likes = Math.max(0, likes - 1);
            if (currentRate === 'dislike') dislikes = Math.max(0, dislikes - 1);
            if (action === 'like') likes += 1;
            if (action === 'dislike') dislikes += 1;
            localStorage.setItem(key, action);
            currentRate = action;
        } else {
            if (action === 'like') likes += 1;
            if (action === 'dislike') dislikes += 1;
            localStorage.setItem(key, action);
            currentRate = action;
        }
        updateRatingButtonsUI(likes, dislikes, currentRate);
    }
}
window.rateInteractingPlayer = rateInteractingPlayer;
window.likeInteractingPlayer = function() { rateInteractingPlayer('like'); };


function updatePlayerLikeDisplay(username) {
    const numEl = document.getElementById('interactionLikesNum');
    if (!numEl) return;
    const likesKey = 'meta_player_likes_' + (username || '').toLowerCase();
    let likes = parseInt(localStorage.getItem(likesKey) || '14', 10);
    numEl.innerText = likes;
}
window.updatePlayerLikeDisplay = updatePlayerLikeDisplay;

function likeInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const username = currentInteractingPlayer.name;
    const likesKey = 'meta_player_likes_' + (username || '').toLowerCase();
    let likes = parseInt(localStorage.getItem(likesKey) || '14', 10) + 1;
    localStorage.setItem(likesKey, likes);

    const numEl = document.getElementById('interactionLikesNum');
    if (numEl) numEl.innerText = likes;

    const btn = document.getElementById('interactionLikeBtn');
    if (btn) {
        btn.innerHTML = '❤️ Beğenildi!';
        btn.style.transform = 'scale(1.12)';
        setTimeout(() => {
            btn.innerHTML = '❤️ Beğen';
            btn.style.transform = 'scale(1)';
        }, 900);
    }

    if (typeof showInGameAlert === 'function') {
        showInGameAlert(username + ' kullanıcısına saygı ve beğeni gönderdiniz! ⭐', 'Tebrikler', '❤️');
    }
}
window.likeInteractingPlayer = likeInteractingPlayer;

function whisperToInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const isTargetAnon = !!(currentInteractingPlayer.isAnon || (currentInteractingPlayer.player && currentInteractingPlayer.player.anonMaskExpiresAt > Date.now()));
    const targetQuery = isTargetAnon ? ('@' + currentInteractingPlayer.id) : currentInteractingPlayer.name;
    closePlayerInteractionModal();
    if (typeof whisperToPlayer === 'function') {
        whisperToPlayer(targetQuery);
    }
}
window.whisperToInteractingPlayer = whisperToInteractingPlayer;

function visitInteractingPlayerHouse() {
    if (!currentInteractingPlayer) return;
    const username = currentInteractingPlayer.name;
    closePlayerInteractionModal();
    if (typeof enterHouse === 'function') {
        enterHouse(username);
    }
}
window.visitInteractingPlayerHouse = visitInteractingPlayerHouse;

function updateFriendshipButtonState(targetUsername) {
    const btn = document.getElementById('interactionFriendBtn');
    const titleEl = document.getElementById('interactionFriendTitle');
    const iconEl = document.getElementById('interactionFriendIcon');
    if (!btn) return;

    let isFriend = isUserFriend(targetUsername);
    if (isFriend) {
        if (titleEl) titleEl.innerText = "Arkadaştan Çıkar";
        if (iconEl) iconEl.innerText = "❌";
        btn.title = "Arkadaştan Çıkar";
        btn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
    } else {
        if (titleEl) titleEl.innerText = "Arkadaş Ekle";
        if (iconEl) iconEl.innerText = "👥";
        btn.title = "Arkadaş Ekle";
        btn.style.background = "linear-gradient(135deg, #0ea5e9, #0284c7)";
    }
}
window.updateFriendshipButtonState = updateFriendshipButtonState;

// --- 2. ÇAY ISMARLA (5 TL) ---
function sendTeaToInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    socket.emit('buyTeaForPlayer', { targetId: currentInteractingPlayer.id });
    closePlayerInteractionModal();
}

// --- 2.1 SİNYAL KESİCİ (JAMMER) KULLAN ---
function useJammerOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || window.myLevel || 1;
    if (myLvl < 3) {
        if (window.showGameError) window.showGameError('Sinyal Kesici (Jammer) kullanabilmek için en az Seviye 3 olmalısınız!');
        return;
    }
    const targetName = currentInteractingPlayer.name;
    const isTargetAnon = !!(currentInteractingPlayer.isAnon || (currentInteractingPlayer.player && currentInteractingPlayer.player.anonMaskExpiresAt > Date.now()));
    const displayTarget = isTargetAnon ? "kimliği belirsiz şahıs" : `"${targetName}"`;

    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError('Kendinizde Sinyal Kesici kullanamazsınız!');
        return;
    }
    if (confirm(`📡 ${displayTarget} adlı oyuncuya Sinyal Kesici (Jammer) kullanarak frekansını ve konuşmasını susturmak istiyor musunuz?\n(1 adet Jammer harcanır)`)) {
        socket.emit('useJammerOnPlayer', { targetUsername: targetName, targetSocketId: currentInteractingPlayer.id });
        closePlayerInteractionModal();
    }
}
window.useJammerOnInteractingPlayer = useJammerOnInteractingPlayer;

// --- 2.2 GASP BIÇAĞI KULLAN ---
function useMugKnifeOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || window.myLevel || 1;
    if (myLvl < 5) {
        if (window.showGameError) window.showGameError('Gasp Bıçağı kullanabilmek için en az Seviye 5 olmalısınız!');
        return;
    }
    const targetName = currentInteractingPlayer.name;
    const isTargetAnon = !!(currentInteractingPlayer.isAnon || (currentInteractingPlayer.player && currentInteractingPlayer.player.anonMaskExpiresAt > Date.now()));
    const displayTarget = isTargetAnon ? "kimliği belirsiz şahıs" : `"${targetName}"`;

    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError('Kendinizi gasp edemezsiniz!');
        return;
    }

    // Canlı 24 Saat Soğuma Süresi Kontrolü
    if (currentInteractingPlayer.mugCooldownRemMs) {
        const elapsed = Date.now() - (currentInteractingPlayer.mugCooldownReceivedAt || Date.now());
        const remMs = Math.max(0, currentInteractingPlayer.mugCooldownRemMs - elapsed);
        if (remMs > 0) {
            const remHours = Math.floor(remMs / (3600 * 1000));
            const remMins = Math.ceil((remMs % (3600 * 1000)) / (60 * 1000));
            if (window.showGameError) {
                window.showGameError(`⏳ ${displayTarget} adlı oyuncuyu bugün zaten gasp ettiniz! 24 saat içinde yalnızca 1 kez hedef alabilirsiniz. (Kalan süre: ${remHours} saat ${remMins} dakika).`);
            }
            return;
        }
    }
    if (confirm(`🗡️ ${displayTarget} adlı oyuncuyu gasp etmek istiyor musunuz?\n• Hedef başına günde 1 kez uygulanabilir\n• En fazla 2.000 TL çalınır\n• 1 adet Gasp Bıçağı harcanır`)) {
        socket.emit('useMugKnifeOnPlayer', { targetUsername: targetName, targetSocketId: currentInteractingPlayer.id });
        closePlayerInteractionModal();
    }
}
window.useMugKnifeOnInteractingPlayer = useMugKnifeOnInteractingPlayer;

// --- 2.3 ZEUS'UN YILDIRIMI KULLAN (İLİAHİ GAZAP & KÜL ETME) ---
function useZeusLightningOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || window.myLevel || 1;
    if (myLvl < 4) {
        if (window.showGameError) window.showGameError("Zeus'un İlahi Yıldırımı'nı çağırabilmek için en az Seviye 4 olmalısınız!");
        return;
    }
    const targetName = currentInteractingPlayer.name;
    const isTargetAnon = !!(currentInteractingPlayer.isAnon || (currentInteractingPlayer.player && currentInteractingPlayer.player.anonMaskExpiresAt > Date.now()));
    const displayTarget = isTargetAnon ? "kimliği belirsiz şahıs" : `"${targetName}"`;

    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError("❌ Zeus bile kendi üstüne yıldırım çakmaz!");
        return;
    }
    if (confirm(`⚡ ${displayTarget} adlı oyuncunun üstüne Zeus'un İlahi Yıldırımı'nı çağırmak istiyor musunuz?\n\n• Gökyüzü kararacak ve kara fırtına kopacak\n• İlahi yıldırım çarpıp hedefi 30 saniye kül yığınına dönüştürecek\n• 1 adet Zeus Yıldırımı harcanır`)) {
        socket.emit('castZeusLightning', { targetUsername: targetName, targetSocketId: currentInteractingPlayer.id });
        closePlayerInteractionModal();
    }
}
window.useZeusLightningOnInteractingPlayer = useZeusLightningOnInteractingPlayer;

// --- 3. PARA GÖNDERME MODALI ---
function openSendMoneyModal() {
    if (!currentInteractingPlayer) return;
    const targetName = currentInteractingPlayer.name;
    closePlayerInteractionModal();

    const modal = document.getElementById('sendMoneyModal');
    const targetSpan = document.getElementById('sendMoneyTargetName');
    const input = document.getElementById('sendMoneyAmountInput');

    if (targetSpan) targetSpan.innerText = targetName;
    if (input) {
        input.value = "10";
        input.focus();
    }
    if (modal) modal.style.display = 'flex';
}

function closeSendMoneyModal() {
    const modal = document.getElementById('sendMoneyModal');
    if (modal) modal.style.display = 'none';
}

function confirmSendMoney() {
    const targetSpan = document.getElementById('sendMoneyTargetName');
    const input = document.getElementById('sendMoneyAmountInput');
    if (!targetSpan || !input) return;

    let targetUsername = targetSpan.innerText;
    let amount = parseInt(input.value);

    if (isNaN(amount) || amount <= 0) {
        alert("Lütfen geçerli bir tutar giriniz!");
        return;
    }

    socket.emit('sendMoney', {
        targetUsername: targetUsername,
        amount: amount
    });

    closeSendMoneyModal();
}

// --- 4. EŞYA HEDİYE ETME MODALI ---
function openGiftItemModal() {
    if (!currentInteractingPlayer) return;
    const targetName = currentInteractingPlayer.name;
    closePlayerInteractionModal();

    const modal = document.getElementById('giftItemModal');
    const targetSpan = document.getElementById('giftItemTargetName');
    const list = document.getElementById('giftableItemsList');

    if (targetSpan) targetSpan.innerText = targetName;
    if (list) {
        list.innerHTML = "";
        let propInv = window.myPropInventory || {};
        const NON_GIFTABLE = [
            'props_pet_izbandut', 'props_izbandut', 'izbandut',
            'props_pet_doberman', 'props_doberman', 'doberman',
            'props_jammer', 'jammer',
            'props_mug_knife', 'props_gasp_bicagi', 'mug_knife',
            'props_zeus_yildirimi', 'zeus_yildirimi'
        ];
        let ownedPropKeys = Object.keys(propInv).filter(k => k.startsWith('props_') && k !== 'props_none' && propInv[k] > 0 && !NON_GIFTABLE.includes(k) && !NON_GIFTABLE.includes(k.replace('props_', '')));

        if (ownedPropKeys.length === 0) {
            list.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:20px;">Çantanızda hediye edilebilecek el eşyası bulunmuyor. Gardıroptan veya Eşyalarım çantasından yeni eşyalar alabilirsiniz!</div>`;
        } else {
            ownedPropKeys.forEach(itemKey => {
                let info = getPropInfo(itemKey);
                let count = propInv[itemKey] || 1;
                let card = document.createElement('div');
                card.className = 'gift-item-card';
                card.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.8); padding:10px 14px; border-radius:10px; border:1px solid rgba(255,255,255,0.1); margin-bottom:8px;";
                card.innerHTML = `
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:24px;">${info.emoji}</span>
                        <div>
                            <div style="font-weight:700; color:#f8fafc; font-size:14px; display:flex; align-items:center; gap:6px;">
                                ${info.name}
                                <span style="background:linear-gradient(135deg, #f59e0b, #d97706); color:white; padding:2px 7px; border-radius:10px; font-size:10px; font-weight:800;">x${count} Adet</span>
                            </div>
                            <div style="font-size:11px; color:#94a3b8;">El Aksesuarı</div>
                        </div>
                    </div>
                    <button onclick="confirmGiftItem('${itemKey}')" style="padding:6px 14px; background:linear-gradient(135deg, #ec4899, #db2777); color:white; border:none; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">🎁 Hediye Et</button>
                `;
                list.appendChild(card);
            });
        }
    }

    if (modal) modal.style.display = 'flex';
}

function closeGiftItemModal() {
    const modal = document.getElementById('giftItemModal');
    if (modal) modal.style.display = 'none';
}

function confirmGiftItem(itemKey) {
    const targetSpan = document.getElementById('giftItemTargetName');
    if (!targetSpan) return;
    let targetUsername = targetSpan.innerText;

    if (!confirm(`${targetUsername} oyuncusuna bu eşyayı hediye etmek istediğinizden emin misiniz?`)) return;

    socket.emit('giftPropItem', {
        targetUsername: targetUsername,
        itemKey: itemKey
    });

    closeGiftItemModal();
}

// --- 5. ARKADAŞ EKLEME / ÇIKARMA ---
function toggleFriendshipWithInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    let targetUsername = currentInteractingPlayer.name;
    let isFriend = isUserFriend(targetUsername);

    if (isFriend) {
        if (confirm(`${targetUsername} kullanıcısını arkadaş listenizden çıkarmak istediğinize emin misiniz?`)) {
            socket.emit('removeFriend', { username: targetUsername });
            closePlayerInteractionModal();
        }
    } else {
        socket.emit('sendFriendRequest', { targetUsername: targetUsername });
        closePlayerInteractionModal();
    }
}

// --- 6. ARKADAŞ LİSTESİ & İSTEKLER MODALI (2 SEKMELİ) ---
let currentFriendsTab = 'friends';

function switchFriendsTab(tab) {
    currentFriendsTab = tab;
    const btnFriends = document.getElementById('tabBtnFriends');
    const btnRequests = document.getElementById('tabBtnRequests');
    const contentFriends = document.getElementById('friendsTabContent');
    const contentRequests = document.getElementById('friendRequestsTabContent');

    if (tab === 'friends') {
        if (btnFriends) {
            btnFriends.style.background = '#10b981';
            btnFriends.style.color = 'white';
        }
        if (btnRequests) {
            btnRequests.style.background = 'rgba(30,41,59,0.8)';
            btnRequests.style.color = '#94a3b8';
        }
        if (contentFriends) contentFriends.style.display = 'block';
        if (contentRequests) contentRequests.style.display = 'none';
        renderFriendsListUI();
    } else {
        if (btnRequests) {
            btnRequests.style.background = '#ef4444';
            btnRequests.style.color = 'white';
        }
        if (btnFriends) {
            btnFriends.style.background = 'rgba(30,41,59,0.8)';
            btnFriends.style.color = '#94a3b8';
        }
        if (contentFriends) contentFriends.style.display = 'none';
        if (contentRequests) contentRequests.style.display = 'block';
        renderFriendRequestsUI();
    }
}

function openFriendsListModal() {
    socket.emit('getFriendsList');
    renderFriendsListUI();
    renderFriendRequestsUI();
    const modal = document.getElementById('friendsListModal');
    if (modal) modal.style.display = 'flex';
    switchFriendsTab('friends');
}

function closeFriendsListModal() {
    const modal = document.getElementById('friendsListModal');
    if (modal) modal.style.display = 'none';
}

function updateFriendshipBadges() {
    let fCount = (window.myFriendsList || []).length;
    let rCount = (window.myFriendRequests || []).length;

    const fNavBadge = document.getElementById('friendsCountBadge');
    if (fNavBadge) fNavBadge.innerText = fCount;

    const fTabBadge = document.getElementById('friendsCountTabBadge');
    if (fTabBadge) fTabBadge.innerText = fCount;

    const reqNavBadge = document.getElementById('friendRequestsBadge');
    if (reqNavBadge) {
        reqNavBadge.innerText = rCount;
        reqNavBadge.style.display = rCount > 0 ? 'inline-block' : 'none';
    }

    const reqTabBadge = document.getElementById('requestsCountTabBadge');
    if (reqTabBadge) reqTabBadge.innerText = rCount;
}

function renderFriendsListUI(friends) {
    if (friends !== undefined) {
        window.myFriendsList = friends || [];
    }
    updateFriendshipBadges();

    const container = document.getElementById('friendsListContainer');
    if (!container) return;
    container.innerHTML = "";

    let list = window.myFriendsList || [];
    if (list.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:#94a3b8; padding:30px 15px;">
                <div style="font-size:36px; margin-bottom:8px;">👥</div>
                <div style="font-weight:700; color:#e2e8f0; font-size:15px;">Henüz hiç arkadaşın yok!</div>
                <div style="font-size:12px; margin-top:4px;">Oyundaki diğer oyuncuların üstüne tıklayarak veya yukarıdaki kutudan kullanıcı adını yazarak arkadaş ekleyebilirsin.</div>
            </div>
        `;
        return;
    }

    let roomNames = { 'sokak': '🌳 Meydan', 'cadde': '🛣️ Cadde', 'dedenin_yeri': '⚡ Dedenin Yeri', 'emlakci': '🏢 Emlak Ofisi', 'kafe': '☕ Kafe', 'sahil': '🏖️ Sahil', 'nargile_cafe': '💨 Nargile Cafe', 'market': '🛒 Market', 'ganyan': '🏇 Ganyan Bayii', 'sanalika_cadde': '🏙️ 1. Cadde' };

    list.forEach(f => {
        let uName = getFriendUsername(f);
        let isOnline = typeof f === 'object' && f ? !!f.isOnline : false;
        let room = typeof f === 'object' && f ? f.room : null;
        let house = typeof f === 'object' && f ? f.house : null;

        let loc = isOnline ? (roomNames[room] || room || 'Oyunda') : 'Çevrimdışı';
        if (isOnline && room && room.startsWith('house_')) {
            loc = `🏠 ${room.replace('house_', '')}'in Evi`;
        }

        let houseBadge = house ? `🏠 ${house.type === 'pool' ? 'Havuzlu Villa' : house.type === 'garden' ? 'Bahçeli Ev' : 'Standart Daire'}` : 'Evsiz';

        let row = document.createElement('div');
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.7); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);";
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:12px; height:12px; border-radius:50%; background:${isOnline ? '#22c55e' : '#64748b'}; box-shadow:${isOnline ? '0 0 8px #22c55e' : 'none'};"></div>
                <div>
                    <div style="font-weight:800; color:#f8fafc; font-size:15px; display:flex; align-items:center; gap:8px;">
                        ${uName}
                        <span style="font-size:10px; font-weight:700; padding:2px 8px; border-radius:12px; background:rgba(255,255,255,0.1); color:#38bdf8;">${houseBadge}</span>
                    </div>
                    <div style="font-size:12px; color:${isOnline ? '#86efac' : '#94a3b8'}; margin-top:2px;">
                        ${isOnline ? `🟢 ${loc}` : '⚪ Çevrimdışı'}
                    </div>
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                ${house ? `<button onclick="visitFriendHouse('${uName}', '${house.type || ''}')" style="padding:7px 12px; background:linear-gradient(135deg, #0ea5e9, #0284c7); color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px; display:flex; align-items:center; gap:4px;">🏠 Evine Git</button>` : ''}
                <button onclick="removeFriendFromList('${uName}')" style="padding:7px 10px; background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.3); border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px;" title="Arkadaşlıktan Çıkar">✕</button>
            </div>
        `;
        container.appendChild(row);
    });
}

function renderFriendRequestsUI(requests) {
    if (requests !== undefined) {
        window.myFriendRequests = requests || [];
    }
    updateFriendshipBadges();

    const container = document.getElementById('friendRequestsListContainer');
    if (!container) return;
    container.innerHTML = "";

    let reqList = window.myFriendRequests || [];
    if (reqList.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; color:#94a3b8; padding:35px 15px;">
                <div style="font-size:36px; margin-bottom:8px;">📭</div>
                <div style="font-weight:700; color:#e2e8f0; font-size:15px;">Bekleyen İstek Yok!</div>
                <div style="font-size:12px; margin-top:4px;">Yeni bir arkadaşlık isteği aldığınızda burada listelenecektir.</div>
            </div>
        `;
        return;
    }

    reqList.forEach(reqUser => {
        let uName = typeof reqUser === 'string' ? reqUser : (reqUser.username || reqUser.from || 'Biri');
        let row = document.createElement('div');
        row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.7); padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.08);";
        row.innerHTML = `
            <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg, #3b82f6, #1d4ed8); display:flex; align-items:center; justify-content:center; font-size:18px;">👤</div>
                <div>
                    <div style="font-weight:800; color:#f8fafc; font-size:15px;">${uName}</div>
                    <div style="font-size:12px; color:#38bdf8; margin-top:2px;">Sana arkadaşlık isteği gönderdi</div>
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                <button onclick="acceptIncomingFriendRequest('${uName}')" style="padding:8px 14px; background:linear-gradient(135deg, #10b981, #059669); color:white; border:none; border-radius:8px; font-weight:800; cursor:pointer; font-size:12px; box-shadow:0 2px 8px rgba(16,185,129,0.3);">✅ Kabul Et</button>
                <button onclick="declineIncomingFriendRequest('${uName}')" style="padding:8px 12px; background:rgba(239,68,68,0.2); color:#f87171; border:1px solid rgba(239,68,68,0.3); border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px;">❌ Reddet</button>
            </div>
        `;
        container.appendChild(row);
    });
}

function acceptIncomingFriendRequest(fromUsername) {
    socket.emit('respondFriendRequest', { fromUsername: fromUsername, accept: true });
}

function declineIncomingFriendRequest(fromUsername) {
    socket.emit('respondFriendRequest', { fromUsername: fromUsername, accept: false });
}

function sendFriendRequestByInput() {
    const input = document.getElementById('addFriendUsernameInput');
    if (!input) return;
    let username = input.value.trim();
    if (!username) {
        alert("Lütfen bir kullanıcı adı girin!");
        return;
    }
    socket.emit('sendFriendRequest', { targetUsername: username });
    input.value = "";
}

function removeFriendFromList(username) {
    if (confirm(`${username} kullanıcısını arkadaş listenizden çıkarmak istediğinize emin misiniz?`)) {
        socket.emit('removeFriend', { username: username });
    }
}

function visitFriendHouse(ownerUsername, houseType) {
    closeFriendsListModal();
    if (typeof enterHouse === 'function') {
        enterHouse(ownerUsername, houseType);
    } else {
        let roomName = houseType ? `house_${ownerUsername}_${houseType}` : `house_${ownerUsername}`;
        changeRoom(roomName);
    }
}

// --- 7. EŞYA & AKSESUAR ÇANTASI (ENVANTER PAKETİ) ---
const ALL_PROPS_INFO = {
    'props_nargile': { id: 'nargile', name: 'Otantik Dumanlı Nargile', cost: 1400, emoji: '💨', desc: 'Duman halkaları çıkarır.' },
    'props_cay': { id: 'cay', name: 'Tavşan Kanı İnce Belli Çay', cost: 200, emoji: '☕', desc: '5 dakika boyunca elinizde kalır.' },
    'props_oralet': { id: 'oralet', name: 'Sıcak Kıraathane Oraleti', cost: 400, emoji: '🍵', desc: 'Buharı tüten sıcak oralet kupası.' },
    'props_kahve': { id: 'kahve', name: 'Közde Türk Kahvesi', cost: 220, emoji: '☕', desc: 'Bol köpüklü közde kahve.' },
    'props_balon': { id: 'balon', name: 'Uçan Kırmızı Balon', cost: 240, emoji: '🎈', desc: 'Hafifçe göğe doğru dalgalanır.' },
    'props_gazoz': { id: 'gazoz', name: 'Nostaljik Şişe Gazoz', cost: 280, emoji: '🍾', desc: 'Buz gibi serinletici lezzet.' },
    'props_tespih': { id: 'tespih', name: 'Oltu Taşı Tespih', cost: 800, emoji: '📿', desc: 'Gümüş püsküllü kehribar tespih.' },
    'props_tespih2': { id: 'tespih2', name: 'Çift Katmanlı Tespih', cost: 900, emoji: '📿', desc: 'İki katmanlı parıltılı tespih, daha hızlı salınım.' },
    'props_olta': { id: 'olta', name: 'Balıkçı Oltası', cost: 400, emoji: '🎣', desc: 'Balık tutarken prestij kazandırır.' },
    'props_baglama': { id: 'baglama', name: 'Oyma Dut Bağlama', cost: 440, emoji: '🪕', desc: 'Anadolu türkülerine eşlik eder.' },
    'props_gitar': { id: 'gitar', name: 'Akustik Gitar', cost: 700, emoji: '🎸', desc: 'Sırtında veya elinde taşınır.' },
    'props_sirtcantasi': { id: 'sirtcantasi', name: 'Gezgin Sırt Çantası', cost: 440, emoji: '🎒', desc: 'Her an yanında.' },
    'props_asagold': { id: 'asagold', name: 'Altın Başlıklı Asa', cost: 520, emoji: '🪄', desc: 'Gösterişli ve asil bir duruş sağlar.' },
    'props_kupa': { id: 'kupa', name: 'Şampiyonluk Kupası', cost: 580, emoji: '🏆', desc: 'Masaların fatihine yakışır altın kupa.' },
    'props_kilic': { id: 'kilic', name: 'Orta Çağ Kılıcı', cost: 500, emoji: '🗡️', desc: 'Güçlü bir yakın dövüş silahı.' },
    'props_oyuncak_araba': { id: 'oyuncak_araba', name: 'Küçük Oyuncak Araba', cost: 600, emoji: '🚗', desc: 'Eğlenceli bir oyuncak araba.' },
    'props_sigara': { id: 'sigara', name: 'Tüten Sigara', cost: 10000, emoji: '🚬', desc: 'Hafif dumanı tüten karizmatik el sigarası.' },
    'props_k2_energy_drink': { id: 'k2_energy_drink', name: 'K2 Buzlu Enerji İçeceği', cost: 150, emoji: '⚡', desc: 'Buz gibi neon siber enerji içeceği (8 açılı).' },
    'props_k2_skateboard': { id: 'k2_skateboard', name: 'K2 Grafiti Sokak Kaykayı', cost: 350, emoji: '🛹', desc: 'Ayak altına inen, +%50 hız kazandıran ve itme animasyonlu profesyonel sokak kaykayı!' },
    'props_popcorn': { id: 'popcorn', name: 'Taze Patlamış Mısır', cost: 15, emoji: '🍿', desc: 'Sıcak ve çıtır sinema patlamış mısırı.' },
    'props_kola': { id: 'kola', name: 'Buzlu Kutu Kola', cost: 10, emoji: '🥤', desc: 'Buz gibi serinletici gazlı kola.' },
    'props_hotdog': { id: 'hotdog', name: 'Sosisli Sandviç', cost: 25, emoji: '🌭', desc: 'Hardallı ketçaplı leziz sosisli sandviç.' },
    'props_chips': { id: 'chips', name: 'Tırtıklı Patates Cipsi', cost: 15, emoji: '🍟', desc: 'Tuzlu ve çıtır çıtır patates cipsi.' },
    'props_jammer': { id: 'jammer', name: 'Sinyal Kesici (Jammer)', cost: 500, emoji: '📡', desc: 'Hedef oyuncunun chate yazmasını 3 dk engeller.' },
    'props_gasp_bicagi': { id: 'gasp_bicagi', name: 'Gasp Bıçağı', cost: 2000, emoji: '🗡️', desc: 'Günde 1 kez oyuncudan 2.000 TL gasbeder.' },
    'props_mug_knife': { id: 'gasp_bicagi', name: 'Gasp Bıçağı', cost: 2000, emoji: '🗡️', desc: 'Günde 1 kez oyuncudan 2.000 TL gasbeder.' },
    'props_zeus_yildirimi': { id: 'zeus_yildirimi', name: "Zeus'un İlahi Yıldırımı", cost: 2, emoji: '⚡', desc: '1 kullanımlık ilahi Olimpos mızrağı. İstediğin oyuncunun üstüne ilahi yıldırımı indirip 30 saniye kül et!' },
    'props_izbandut': { id: 'izbandut', name: 'İzbandut Koruma', cost: 5000, emoji: '🕴️', desc: 'Mafya fedaisi. Gasp, Zeus yıldırımı ve jammere karşı can siperi olur. Çantadan kuşanılıp dinlenmeye çekilebilir.' },
    'props_doberman': { id: 'doberman', name: 'Doberman Koruma', cost: 4000, emoji: '🐕‍🦺', desc: 'Sadık koruma köpeği. Gasp teşebbüslerini havada püskürtür. Çantadan kuşanılıp dinlenmeye çekilebilir.' },
    'props_pet_doberman': { id: 'doberman', name: 'Doberman Koruma', cost: 4000, emoji: '🐕‍🦺', desc: 'Sadık koruma köpeği. Gasp teşebbüslerini havada püskürtür. Çantadan kuşanılıp dinlenmeye çekilebilir.' },
    'props_anon_mask': { id: 'anon_mask', name: 'Gizli Kimlik Maskesi', cost: 3000, emoji: '🎭', desc: '30 dakika boyunca profilini hayalete dönüştürür, konuşma balonlarına dumanlı aura katar ve kimliğini gizler.' },
    'anon_mask': { id: 'anon_mask', name: 'Gizli Kimlik Maskesi', cost: 3000, emoji: '🎭', desc: '30 dakika boyunca profilini hayalete dönüştürür, konuşma balonlarına dumanlı aura katar ve kimliğini gizler.' },
    // Botanik Çiçekler & Tohumlar
    'props_tohum_papatya': { id: 'tohum_papatya', name: 'Papatya Tohumu', cost: 100, emoji: '🌼', desc: 'Tarlaya ekilebilir papatya tohumu.' },
    'props_tohum_lale': { id: 'tohum_lale', name: 'Lale Tohumu', cost: 150, emoji: '🌷', desc: 'Tarlaya ekilebilir sultan lalesi tohumu.' },
    'props_tohum_gul': { id: 'tohum_gul', name: 'Gül Tohumu', cost: 250, emoji: '🌹', desc: 'Tarlaya ekilebilir kadife gül tohumu.' },
    'props_tohum_sakayik': { id: 'tohum_sakayik', name: 'Şakayık Tohumu', cost: 400, emoji: '🌸', desc: 'Tarlaya ekilebilir zarif şakayık tohumu.' },
    'props_tohum_lavanta': { id: 'tohum_lavanta', name: 'Lavanta Tohumu', cost: 400, emoji: '🪻', desc: 'Tarlaya ekilebilir dağ lavantası tohumu.' },
    'props_tohum_orkide': { id: 'tohum_orkide', name: 'Orkide Tohumu', cost: 600, emoji: '🌺', desc: 'Tarlaya ekilebilir kraliyet orkidesi tohumu.' },
    'props_tohum_aycicegi': { id: 'tohum_aycicegi', name: 'Ayçiçeği Tohumu', cost: 1000, emoji: '🌻', desc: 'Tarlaya ekilebilir dev ayçiçeği tohumu.' },
    'props_cicek_papatya': { id: 'cicek_papatya', name: 'Taze Papatya', cost: 140, emoji: '🌼', desc: 'Mis kokulu taze kır papatyası.' },
    'props_cicek_lale': { id: 'cicek_lale', name: 'Sultan Lalesi', cost: 210, emoji: '🌷', desc: 'Canlı renkli Osmanlı lalesi.' },
    'props_cicek_gul': { id: 'cicek_gul', name: 'Kırmızı Gül', cost: 350, emoji: '🌹', desc: 'Romantik kadife kırmızı gül.' },
    'props_cicek_sakayik': { id: 'cicek_sakayik', name: 'Zarif Şakayık', cost: 280, emoji: '🌸', desc: 'Katmerli pembe zarif şakayık.' },
    'props_cicek_lavanta': { id: 'cicek_lavanta', name: 'Dağ Lavantası', cost: 560, emoji: '🪻', desc: 'Ferahlatıcı mor lavanta buketi.' },
    'props_cicek_orkide': { id: 'cicek_orkide', name: 'Kraliyet Orkidesi', cost: 840, emoji: '🌺', desc: 'Nadir bulunan mor orkide çiçeği.' },
    'props_cicek_aycicegi': { id: 'cicek_aycicegi', name: 'Altın Ayçiçeği', cost: 1400, emoji: '🌻', desc: 'Güneşe bakan dev ayçiçeği.' },
    'props_bitki_suyu': { id: 'bitki_suyu', name: 'Bitki Besin Suyu', cost: 50, emoji: '🧪', desc: 'Bitkileri canlandıran özel iksir.' },
    // Madenler & Cevherler
    'props_ore_komur': { id: 'ore_komur', name: 'Kömür Cevheri', cost: 15, emoji: '🪨', desc: 'Madenden çıkarılan yanıcı siyah taş.' },
    'props_ore_bakir': { id: 'ore_bakir', name: 'Bakır Cevheri', cost: 35, emoji: '🥉', desc: 'İşlenebilir turuncu metal cevheri.' },
    'props_ore_demir': { id: 'ore_demir', name: 'Demir Cevheri', cost: 80, emoji: '🪙', desc: 'Ağır ve dayanıklı sanayi madeni.' },
    'props_kazma': { id: 'kazma', name: 'Madenci Kazması', cost: 200, emoji: '⛏️', desc: 'Kayaları kırmak için sağlam çelik kazma.' },
    'props_pet_pitbull': { id: 'pet_pitbull', name: 'Koruma Köpeği (Pitbull)', cost: 3000, emoji: '🐕', desc: 'Peşinizden gelen sadık ve heybetli koruma köpeği.' },
    'props_pet_izbandut': { id: 'pet_izbandut', name: 'İzbandut Koruma', cost: 5000, emoji: '🕶️', desc: 'Siyah takım elbiseli devasa özel koruma.' },
    // --- BOTANİK & TARIM SİSTEMİ İTEMLERİ (6 ÇİÇEK SETİ - EN UCUZ ÇİÇEK 1000 TL) ---
    // 1. Papatya (20 Dk Fide -> 40 Dk Çiçek)
    'props_tohum_papatya': { id: 'tohum_papatya', name: 'Papatya Tohumu', cost: 100, emoji: '🌱', desc: '20 dakikada fideye dönüşen taze kır papatyası tohumu.' },
    'props_fide_papatya': { id: 'fide_papatya', name: 'Papatya Fidesi', cost: 500, emoji: '🌿', desc: 'Hasat edilmiş genç papatya fidesi.' },
    'props_cicek_papatya': { id: 'cicek_papatya', name: 'Kır Papatyası', cost: 1000, emoji: '🌼', desc: 'Doğal taze kır papatyası. Elde taşınabilir ve 1000 TL\'ye satılır.' },
    // 2. Lale (30 Dk Fide -> 60 Dk Çiçek)
    'props_tohum_lale': { id: 'tohum_lale', name: 'Lale Tohumu', cost: 150, emoji: '🌱', desc: '30 dakikada fideye dönüşen zarif sultan lalesi tohumu.' },
    'props_fide_lale': { id: 'fide_lale', name: 'Lale Fidesi', cost: 750, emoji: '🌿', desc: 'Hasat edilmiş genç sultan lalesi fidesi.' },
    'props_cicek_lale': { id: 'cicek_lale', name: 'Sultan Lalesi', cost: 1500, emoji: '🌷', desc: 'Asil kırmızı-altın sultan lalesi. Elde taşınabilir ve 1500 TL\'ye satılır.' },
    // 3. Gül (45 Dk Fide -> 90 Dk Çiçek)
    'props_tohum_gul': { id: 'tohum_gul', name: 'Gül Tohumu', cost: 250, emoji: '🌱', desc: '45 dakikada fideye dönüşen asil kadife gül tohumu.' },
    'props_fide_gul': { id: 'fide_gul', name: 'Gül Fidesi', cost: 1100, emoji: '🌿', desc: 'Hasat edilmiş genç gül fidesi.' },
    'props_cicek_gul': { id: 'cicek_gul', name: 'Kırmızı Gül', cost: 2200, emoji: '🌹', desc: 'Olgun taze kırmızı gül. Elde taşınabilir ve 2200 TL\'ye satılır.' },
    // 4. Şakayık (30 Dk Fide -> 90 Dk Çiçek | Toplam 120 Dk / 2 Saat)
    'props_tohum_sakayik': { id: 'tohum_sakayik', name: 'Şakayık Tohumu', cost: 400, emoji: '🌱', desc: '30 dakikada fideye dönüşen katmerli zarif şakayık tohumu.' },
    'props_fide_sakayik': { id: 'fide_sakayik', name: 'Şakayık Fidesi', cost: 1800, emoji: '🌿', desc: 'Hasat edilmiş genç şakayık fidesi.' },
    'props_cicek_sakayik': { id: 'cicek_sakayik', name: 'Zarif Şakayık', cost: 3600, emoji: '🌸', desc: 'Katmerli pembe zarif şakayık. Elde taşınabilir ve 3600 TL\'ye satılır.' },
    // 5. Lavanta (60 Dk Fide -> 120 Dk Çiçek)
    'props_tohum_lavanta': { id: 'tohum_lavanta', name: 'Lavanta Tohumu', cost: 400, emoji: '🌱', desc: '60 dakikada fideye dönüşen mis kokulu dağ lavantası tohumu.' },
    'props_fide_lavanta': { id: 'fide_lavanta', name: 'Lavanta Fidesi', cost: 1750, emoji: '🌿', desc: 'Hasat edilmiş genç dağ lavantası fidesi.' },
    'props_cicek_lavanta': { id: 'cicek_lavanta', name: 'Dağ Lavantası', cost: 3500, emoji: '🪻', desc: 'Huzur veren mor dağ lavantası. Elde taşınabilir ve 3500 TL\'ye satılır.' },
    // 5. Orkide (90 Dk Fide -> 180 Dk Çiçek)
    'props_tohum_orkide': { id: 'tohum_orkide', name: 'Orkide Tohumu', cost: 600, emoji: '🌱', desc: '90 dakikada fideye dönüşen büyüleyici kraliyet orkidesi tohumu.' },
    'props_fide_orkide': { id: 'fide_orkide', name: 'Orkide Fidesi', cost: 2750, emoji: '🌿', desc: 'Hasat edilmiş genç mor orkide fidesi.' },
    'props_cicek_orkide': { id: 'cicek_orkide', name: 'Mor Kraliyet Orkidesi', cost: 5500, emoji: '🌸', desc: 'Nadir mor kraliyet orkidesi. Elde taşınabilir ve 5500 TL\'ye satılır.' },
    // 6. Ayçiçeği (120 Dk Fide -> 240 Dk Çiçek - En Değerli)
    'props_tohum_aycicegi': { id: 'tohum_aycicegi', name: 'Ayçiçeği Tohumu', cost: 1000, emoji: '🌱', desc: '120 dakikada fideye dönüşen dev altın ayçiçeği tohumu.' },
    'props_fide_aycicegi': { id: 'fide_aycicegi', name: 'Ayçiçeği Fidesi', cost: 4750, emoji: '🌿', desc: 'Hasat edilmiş genç güneş ayçiçeği fidesi.' },
    'props_cicek_aycicegi': { id: 'cicek_aycicegi', name: 'Güneş Ayçiçeği', cost: 9500, emoji: '🌻', desc: 'Işıl ışıl parıldayan dev güneş ayçiçeği. Elde taşınabilir ve 9500 TL\'ye satılır.' },
    // Sulama ve Gübre
    'props_bitki_suyu': { id: 'bitki_suyu', name: 'Özel Bitki Suyu', cost: 50, emoji: '💧', desc: 'Fidenin çiçeğe dönüşmesi için gerekli can suyu.' },
    'props_organik_gubre': { id: 'organik_gubre', name: 'Organik Gübre', cost: 100, emoji: '🧪', desc: 'Fidenin çiçeğe dönüşmesi için gerekli mineral gübre.' },
    // --- YENİ EL EŞYALARI (DİNOZOR, SU TABANCASI, DRONE, SÜPÜRGE, BAYRAKLAR) ---
    'props_oyuncak_dinozor': { id: 'oyuncak_dinozor', name: 'Sevimli Peluş Dinozor', cost: 320, emoji: '🦖', desc: 'Yeşil sevimli peluş T-Rex dinozor.' },
    'props_su_tabancasi': { id: 'su_tabancasi', name: 'Neon Oyuncak Su Tabancası', cost: 380, emoji: '🔫', desc: 'Basınçlı su püskürtme animasyonlu neon su tabancası.' },
    'props_drone': { id: 'drone', name: 'Uçan Kameralı Mini Drone', cost: 650, emoji: '🛸', desc: 'Havada asılı süzülen, dönen pervaneli ve LED ışıklı quadcopter drone.' },
    'props_supurge': { id: 'supurge', name: 'Modern Elektrikli Süpürge', cost: 420, emoji: '🧹', desc: 'Siklon hazneli, LED ışıklı ve zemin emiş partiküllü elektrikli süpürge.' },
    'props_turk_bayragi': { id: 'turk_bayragi', name: 'Şanlı Türk Bayrağı', cost: 100, emoji: '🇹🇷', desc: 'Altın alemli ahşap direkte dalgalanan şanlı al bayrak.' },
    'props_bayrak_gs': { id: 'bayrak_gs', name: 'Galatasaray Taraftar Bayrağı', cost: 250, emoji: '🚩', desc: 'Sarı-kırmızı 4 yıldızlı dalgalanan asil GS bayrağı.' },
    'props_bayrak_fb': { id: 'bayrak_fb', name: 'Fenerbahçe Taraftar Bayrağı', cost: 250, emoji: '🚩', desc: 'Sarı-lacivert çubuklu dalgalanan FB bayrağı.' },
    'props_bayrak_bjk': { id: 'bayrak_bjk', name: 'Beşiktaş Taraftar Bayrağı', cost: 250, emoji: '🚩', desc: 'Siyah-beyaz kartal armalı dalgalanan BJK bayrağı.' },
    'props_bayrak_ts': { id: 'bayrak_ts', name: 'Trabzonspor Taraftar Bayrağı', cost: 250, emoji: '🚩', desc: 'Bordo-mavi çubuklu dalgalanan TS bayrağı.' }
};

function getPropInfo(itemKey) {
    if (ALL_PROPS_INFO[itemKey]) {
        return ALL_PROPS_INFO[itemKey];
    }
    let propId = itemKey ? itemKey.replace('props_', '') : '';
    if (typeof WARDROBE_CATALOG !== 'undefined' && WARDROBE_CATALOG.props) {
        let found = WARDROBE_CATALOG.props.find(p => p.id === propId);
        if (found) {
            return {
                id: found.id,
                name: found.name,
                cost: found.cost || 0,
                emoji: found.icon || '🖐️',
                desc: found.description || 'El Aksesuarı'
            };
        }
    }
    let cleanName = propId.replace(/^k2_/, 'K2 ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return { id: propId, name: cleanName, cost: 0, emoji: '🖐️', desc: 'El Aksesuarı' };
}
window.getPropInfo = getPropInfo;

let isItemInventoryOpen = false;
let bagPage = 1;
const BAG_PAGE_SIZE = 15; // 5x3 Izgara
let bagFilter = 'all'; // 'all', 'foods', 'tools', 'pets'
let bagSearchQuery = '';
let bagHoveredItemKey = null;

// --- EŞYA ÇANTASI TAŞIMA VE ORTALAMA YÖNETİCİSİ (makeModalDraggable Entegrasyonu) ---
function initBagDraggable() {
    if (typeof makeModalDraggable === 'function') {
        makeModalDraggable('itemInventoryModalCard', 'itemInventoryHeader');
    }
}
window.initBagDraggable = initBagDraggable;

function resetItemInventoryPosition() {
    const card = document.getElementById('itemInventoryModalCard');
    if (!card) return;
    const w = card.offsetWidth || Math.min(350, window.innerWidth - 16);
    const h = card.offsetHeight || 440;
    const cX = Math.max(5, Math.floor((window.innerWidth - w) / 2));
    const cY = Math.max(5, Math.floor((window.innerHeight - h) / 2));
    card.style.position = 'fixed';
    card.style.left = cX + 'px';
    card.style.top = cY + 'px';
    card.style.right = 'auto';
    card.style.bottom = 'auto';
    card.style.transform = 'none';
}
window.resetItemInventoryPosition = resetItemInventoryPosition;

function openItemInventoryModal() {
    isItemInventoryOpen = true;
    bagPage = 1;
    bagSearchQuery = '';
    const searchInput = document.getElementById('sanalikaBagSearch');
    if (searchInput) searchInput.value = '';
    renderItemInventoryUI();
    const modal = document.getElementById('itemInventoryModal');
    if (modal) modal.style.display = 'flex';
    initBagDraggable();
    resetItemInventoryPosition();
}
window.openItemInventoryModal = openItemInventoryModal;

function closeItemInventoryModal() {
    isItemInventoryOpen = false;
    const modal = document.getElementById('itemInventoryModal');
    if (modal) modal.style.display = 'none';
    resetItemInventoryPosition();
}
window.closeItemInventoryModal = closeItemInventoryModal;

function setBagFilter(filter) {
    bagFilter = filter;
    bagPage = 1;
    document.querySelectorAll('.sanalika-bag-tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#ffffff';
        btn.style.border = '1.5px solid #cbd5e1';
        btn.style.color = '#475569';
        btn.style.boxShadow = 'none';
    });
    const activeBtn = document.querySelector('button[onclick="setBagFilter(\'' + filter + '\')"]');
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        activeBtn.style.border = '1.5px solid #b45309';
        activeBtn.style.color = '#ffffff';
        activeBtn.style.boxShadow = '0 1px 3px rgba(0,0,0,0.15)';
    }
    renderItemInventoryUI();
}
window.setBagFilter = setBagFilter;

function handleBagSearch(val) {
    bagSearchQuery = (val || '').toLowerCase().trim();
    bagPage = 1;
    renderItemInventoryUI();
}
window.handleBagSearch = handleBagSearch;

function clearBagSearch() {
    bagSearchQuery = '';
    const searchInput = document.getElementById('sanalikaBagSearch');
    if (searchInput) searchInput.value = '';
    renderItemInventoryUI();
}
window.clearBagSearch = clearBagSearch;

function changeBagPage(delta) {
    bagPage += delta;
    renderItemInventoryUI();
}
window.changeBagPage = changeBagPage;

function updatePropsCountBadge() {
    let propInv = window.myPropInventory || {};
    let totalCount = 0;
    for (let k in propInv) {
        if (k.startsWith('props_') && k !== 'props_none' && k !== 'props_ore_elmas') {
            totalCount += (propInv[k] || 0);
        }
    }
    const badge = document.getElementById('myPropsCountBadge');
    if (badge) badge.innerText = totalCount;
    const capBadge = document.getElementById('bagCapacityBadge');
    if (capBadge) capBadge.innerText = totalCount + ' / 15 Eşya';
}

function previewBagItem(itemKey) {
    bagHoveredItemKey = itemKey;
    const pEmoji = document.getElementById('bagPreviewEmoji');
    const pName = document.getElementById('bagPreviewName');
    const pDesc = document.getElementById('bagPreviewDesc');
    const pBadge = document.getElementById('bagPreviewActionBadge');
    if (!pEmoji || !pName || !pDesc) return;

    if (!itemKey) {
        // Şu an elde tutulanı göster
        let curHeld = (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.heldItem && myAvatar.heldItem !== 'none') ? myAvatar.heldItem : null;
        if (curHeld) {
            let info = getPropInfo('props_' + curHeld);
            pEmoji.innerText = info.emoji || '🖐️';
            pName.innerText = info.name;
            pDesc.innerText = '🖐️ Şu an elinde taşınıyor. Bırakmak için tıkla.';
            if (pBadge) {
                pBadge.innerText = '🖐️ Elinde';
                pBadge.style.color = '#15803d';
                pBadge.style.background = '#dcfce7';
                pBadge.style.borderColor = '#86efac';
            }
        } else {
            pEmoji.innerText = '🖐️';
            pName.innerText = 'Bir eşyaya tıkla veya eline al';
            pDesc.innerText = 'Elinde tutmak istediğin eşyayı seç.';
            if (pBadge) {
                pBadge.innerText = 'Seçim Yap';
                pBadge.style.color = '#d97706';
                pBadge.style.background = '#fef3c7';
                pBadge.style.borderColor = '#fde68a';
            }
        }
        return;
    }

    const info = getPropInfo(itemKey);
    const isMask = (info.id === 'anon_mask');
    const isMaskActive = isMask && ((typeof myAvatar !== 'undefined' && myAvatar && myAvatar.anonMaskExpiresAt > Date.now()) || (typeof window.myAnonMaskExpiresAt !== 'undefined' && window.myAnonMaskExpiresAt > Date.now()));
    const isHeld = (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.heldItem === info.id);
    pEmoji.innerText = info.emoji || '🖐️';
    pName.innerText = info.name;
    pDesc.innerText = info.desc || 'El Aksesuarı';

    if (pBadge) {
        if (isMask) {
            if (isMaskActive) {
                pBadge.innerText = '🎭 Maskeyi Çıkar';
                pBadge.style.color = '#dc2626';
                pBadge.style.background = '#fee2e2';
                pBadge.style.borderColor = '#fca5a5';
            } else {
                pBadge.innerText = '🎭 Maskeyi Tak (30 Dk)';
                pBadge.style.color = '#15803d';
                pBadge.style.background = '#dcfce7';
                pBadge.style.borderColor = '#86efac';
            }
        } else if (isHeld) {
            pBadge.innerText = '🖐️ Elinde (Bırak)';
            pBadge.style.color = '#dc2626';
            pBadge.style.background = '#fee2e2';
            pBadge.style.borderColor = '#fca5a5';
        } else {
            pBadge.innerText = '🖐️ Eline Al';
            pBadge.style.color = '#0284c7';
            pBadge.style.background = '#e0f2fe';
            pBadge.style.borderColor = '#bae6fd';
        }
    }
}
window.previewBagItem = previewBagItem;

function renderItemInventoryUI() {
    let propInv = window.myPropInventory || {};

    // Maden Envanterini Çantaya Senkronize Et
    if (typeof window !== 'undefined' && window.miningClient && window.miningClient.state) {
        const ores = window.miningClient.state.ores;
        if (ores) {
            if (ores.komur > 0) propInv['props_ore_komur'] = ores.komur;
            if (ores.bakir > 0) propInv['props_ore_bakir'] = ores.bakir;
            if (ores.demir > 0) propInv['props_ore_demir'] = ores.demir;
        }
        if (window.miningClient.state.pickaxeExpiresAt && window.miningClient.state.pickaxeExpiresAt > Date.now()) {
            propInv['props_kazma'] = 1;
        }
    }

    updatePropsCountBadge();

    // 1. Sanalika Kompakt 4x3 Izgara Render
    const sanalikaGrid = document.getElementById('sanalikaBagGrid');
    if (sanalikaGrid) {
        // Çantada en az 1 adet bulunan eşyalar
        let ownedKeys = Object.keys(propInv).filter(k => k.startsWith('props_') && k !== 'props_none' && k !== 'props_ore_elmas' && propInv[k] > 0);

        // Filtreleme (Tümü, Yiyecek, Botanik, Petler, Madenler)
        let filteredKeys = ownedKeys.filter(k => {
            let info = getPropInfo(k);
            if (bagSearchQuery && !info.name.toLowerCase().includes(bagSearchQuery)) {
                return false;
            }
            const keyLower = k.toLowerCase();
            const idLower = (info.id || '').toLowerCase();
            const nameLower = (info.name || '').toLowerCase();

            // 1. Yiyecek & İçecek
            const isFood = (keyLower.includes('cay') || keyLower.includes('oralet') || keyLower.includes('kahve') || keyLower.includes('gazoz') || keyLower.includes('kola') || keyLower.includes('popcorn') || keyLower.includes('hotdog') || keyLower.includes('chips') || keyLower.includes('energy_drink'));

            // 2. Botanik (Tohumlar, Çiçekler, Bitkiler, Gübre vb.)
            const isBotanic = (keyLower.includes('tohum') || keyLower.includes('cicek') || keyLower.includes('papatya') || keyLower.includes('lale') || keyLower.includes('gul') || keyLower.includes('lavanta') || keyLower.includes('orkide') || keyLower.includes('aycicegi') || keyLower.includes('bitki_suyu') || keyLower.includes('gubre') || nameLower.includes('tohum') || nameLower.includes('çiçek') || nameLower.includes('bitki') || nameLower.includes('gül') || nameLower.includes('lale') || nameLower.includes('papatya'));

            // 3. Petler (Evcil Hayvanlar, Korumalar)
            const isPet = (keyLower.includes('pet') || keyLower.includes('dog') || keyLower.includes('cat') || keyLower.includes('pitbull') || keyLower.includes('doberman') || keyLower.includes('izbandut') || keyLower.includes('horse') || keyLower.includes('baba'));

            // 4. Madenler (Cevherler, Elmas, Kazma vb.)
            const isMining = (keyLower.includes('komur') || keyLower.includes('bakir') || keyLower.includes('demir') || keyLower.includes('elmas') || keyLower.includes('diamond') || keyLower.includes('kazma') || keyLower.includes('kulce') || keyLower.includes('ore') || nameLower.includes('kömür') || nameLower.includes('bakır') || nameLower.includes('demir') || nameLower.includes('elmas') || nameLower.includes('kazma') || nameLower.includes('cevher'));

            if (bagFilter === 'foods') {
                return isFood;
            } else if (bagFilter === 'botanic') {
                return isBotanic;
            } else if (bagFilter === 'pets') {
                return isPet;
            } else if (bagFilter === 'mining') {
                return isMining;
            }
            return true;
        });

        const totalPages = Math.max(1, Math.ceil(filteredKeys.length / BAG_PAGE_SIZE));
        if (bagPage > totalPages) bagPage = totalPages;
        if (bagPage < 1) bagPage = 1;

        const pageText = document.getElementById('sanalikaBagPageText');
        if (pageText) pageText.innerText = bagPage + ' / ' + totalPages;

        const startIdx = (bagPage - 1) * BAG_PAGE_SIZE;
        const pageKeys = filteredKeys.slice(startIdx, startIdx + BAG_PAGE_SIZE);

        let html = '';
        for (let i = 0; i < BAG_PAGE_SIZE; i++) {
            if (i < pageKeys.length) {
                const itemKey = pageKeys[i];
                const info = getPropInfo(itemKey);
                const count = propInv[itemKey] || 0;
                const isMask = (info.id === 'anon_mask');
                const isMaskActive = isMask && ((typeof myAvatar !== 'undefined' && myAvatar && myAvatar.anonMaskExpiresAt > Date.now()) || (typeof window.myAnonMaskExpiresAt !== 'undefined' && window.myAnonMaskExpiresAt > Date.now()));
                
                const isGuard = (info.id === 'izbandut' || info.id === 'pet_izbandut');
                const isGuardActive = isGuard && ((window.myBodyguardsEquipped || 0) > 0);

                const isDoberman = (info.id === 'doberman' || info.id === 'pet_doberman');
                const isDobermanActive = isDoberman && (window.myDobermanEquipped !== false && window.myHasDoberman);

                const isHeld = (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.heldItem === info.id);
                const isItemActive = (isHeld || isMaskActive || isGuardActive || isDobermanActive);

                const activeStyle = isItemActive
                    ? 'background: #fef3c7; border: 2px solid #f59e0b; box-shadow: 0 0 10px rgba(245, 158, 11, 0.45); transform: translateY(-1px);'
                    : 'background: #ffffff; border: 1.5px solid #e2e8f0;';

                let inHandBadge = '';
                if (isMaskActive) {
                    inHandBadge = '<div style="position: absolute; top: 2px; left: 2px; font-size: 7px; font-weight: 900; background: #6366f1; color: #ffffff; padding: 1px 3px; border-radius: 3px; line-height: 1.1; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">🎭 TAKILI</div>';
                } else if (isGuard) {
                    inHandBadge = isGuardActive
                        ? '<div style="position: absolute; top: 2px; left: 2px; font-size: 7px; font-weight: 900; background: #10b981; color: #ffffff; padding: 1px 3px; border-radius: 3px; line-height: 1.1; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">🕴️ AKTİF</div>'
                        : '<div style="position: absolute; top: 2px; left: 2px; font-size: 7px; font-weight: 900; background: #64748b; color: #ffffff; padding: 1px 3px; border-radius: 3px; line-height: 1.1; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">💤 DİNLENMEDE</div>';
                } else if (isDoberman) {
                    inHandBadge = isDobermanActive
                        ? '<div style="position: absolute; top: 2px; left: 2px; font-size: 7px; font-weight: 900; background: #10b981; color: #ffffff; padding: 1px 3px; border-radius: 3px; line-height: 1.1; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">🐕‍🦺 AKTİF</div>'
                        : '<div style="position: absolute; top: 2px; left: 2px; font-size: 7px; font-weight: 900; background: #64748b; color: #ffffff; padding: 1px 3px; border-radius: 3px; line-height: 1.1; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">💤 DİNLENMEDE</div>';
                } else if (isHeld) {
                    inHandBadge = '<div style="position: absolute; top: 2px; left: 2px; font-size: 7px; font-weight: 900; background: #f59e0b; color: #1e1e1e; padding: 1px 3px; border-radius: 3px; line-height: 1.1; box-shadow: 0 1px 2px rgba(0,0,0,0.2);">🖐️ ELİNDE</div>';
                }

                const redBar = isItemActive
                    ? '<div style="width: 70%; height: 2px; background: #ef4444; border-radius: 1px; margin-top: 1px;"></div>'
                    : '<div style="width: 75%; height: 3px; background: transparent; margin-top: 2px;"></div>';

                const isFarmItem = (itemKey.startsWith('props_tohum_') || itemKey === 'props_bitki_suyu' || itemKey === 'props_organik_gubre');
                const dragAttrs = isFarmItem ? 'draggable="true" ondragstart="if(window.handleFarmingItemDragStart)window.handleFarmingItemDragStart(event,\'' + itemKey + '\')" ondragend="if(window.handleFarmingItemDragEnd)window.handleFarmingItemDragEnd(event)" onmousedown="if(window.handleFarmingItemMouseDown)window.handleFarmingItemMouseDown(event,\'' + itemKey + '\')" ontouchstart="if(window.handleFarmingItemTouchStart)window.handleFarmingItemTouchStart(event,\'' + itemKey + '\')" data-farm-item="' + itemKey + '" ' : '';
                const dragHint = isFarmItem ? '<span title="Tarlaya sürükleyip bırakabilirsiniz!" style="position: absolute; top: 3px; right: 3px; font-size: 8px; opacity: 0.75;">🎯</span>' : '';

                let clickAction = '';
                if (isMask) {
                    clickAction = isMaskActive ? "if(window.socket)socket.emit('removeAnonMask');" : "if(window.socket)socket.emit('useAnonMask');";
                } else if (isGuard) {
                    clickAction = "if(typeof toggleEquipBodyguard==='function')toggleEquipBodyguard();else if(window.socket)socket.emit('toggleEquipBodyguard');";
                } else if (isDoberman) {
                    clickAction = "if(typeof toggleEquipDoberman==='function')toggleEquipDoberman();else if(window.socket)socket.emit('toggleEquipDoberman');";
                } else {
                    clickAction = (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.heldItem === info.id) ? "unequipCurrentProp();" : "equipPropItem('" + itemKey + "');";
                }

                html += '<div class="sanalika-bag-slot" ' + dragAttrs +
                    'onclick="' + clickAction + ' renderItemInventoryUI(); previewBagItem(\'' + itemKey + '\');" ' +
                    'onmouseenter="previewBagItem(\'' + itemKey + '\')" ' +
                    'onmouseleave="previewBagItem(null)" ' +
                    'title="' + info.name + ' (x' + count + ')" ' +
                    'style="aspect-ratio: 1; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; padding: 2px; transition: all 0.15s ease; ' + activeStyle + '">' +
                    dragHint +
                    inHandBadge +
                    '<div style="font-size: 21px; line-height: 1; filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));">' + info.emoji + '</div>' +
                    redBar +
                    (count > 1 ? '<span style="position: absolute; bottom: 2px; right: 2px; font-size: 8px; font-weight: 800; color: #1e293b; background: rgba(255,255,255,0.92); padding: 0 3px; border-radius: 3px; border: 1px solid rgba(0,0,0,0.15); box-shadow: 0 1px 2px rgba(0,0,0,0.1);">x' + count + '</span>' : '') +
                    '</div>';
            } else {
                // Boş Sanalika Çanta Yuvası (Recessed Vault Slot)
                html += '<div style="aspect-ratio: 1; border-radius: 8px; background: rgba(241, 245, 249, 0.7); border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 1px 2px rgba(0,0,0,0.03);">' +
                    '<span style="color: #cbd5e1; font-size: 11px; font-weight: 800;">+</span>' +
                    '</div>';
            }
        }
        sanalikaGrid.innerHTML = html;
        previewBagItem(null);
        return;
    }

    // Geriye dönük uyumluluk (eski liste varsa)
    const list = document.getElementById('itemInventoryList');
    if (!list) return;
    list.innerHTML = "";
    let allKeys = new Set([
        ...Object.keys(ALL_PROPS_INFO),
        ...Object.keys(propInv).filter(k => k.startsWith('props_') && k !== 'props_none' && k !== 'props_ore_elmas')
    ]);
    for (let itemKey of allKeys) {
        let info = getPropInfo(itemKey);
        let count = propInv[itemKey] || 0;
        let isHeld = (myAvatar && myAvatar.heldItem === info.id);
        let card = document.createElement('div');
        card.style.cssText = `background: rgba(30,41,59,0.7); border: 1px solid ${isHeld ? '#38bdf8' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px;`;
        let statusBadge = isHeld ? '<span style="color:#38bdf8;">🖐️ Elinde</span>' : '';
        let countBadge = count > 0 ? `<span style="color:#fbbf24;">x${count}</span>` : '';
        card.innerHTML = `<div style="display:flex; justify-content:space-between;"><span>${info.emoji} ${info.name} ${countBadge}</span>${statusBadge}</div>`;
        list.appendChild(card);
    }
}

function equipPropItem(itemKey) {
    let propId = itemKey.replace('props_', '');
    if (propId === 'anon_mask') {
        const isMaskActive = ((typeof myAvatar !== 'undefined' && myAvatar && myAvatar.anonMaskExpiresAt > Date.now()) || (typeof window.myAnonMaskExpiresAt !== 'undefined' && window.myAnonMaskExpiresAt > Date.now()));
        if (typeof socket !== 'undefined' && socket.connected) {
            if (isMaskActive) {
                socket.emit('removeAnonMask');
            } else {
                socket.emit('useAnonMask');
            }
        }
        return;
    }
    if (propId === 'izbandut' || propId === 'pet_izbandut') {
        if (typeof toggleEquipBodyguard === 'function') {
            toggleEquipBodyguard();
        } else if (typeof socket !== 'undefined' && socket.connected) {
            socket.emit('toggleEquipBodyguard');
        }
        return;
    }
    if (propId === 'doberman' || propId === 'pet_doberman') {
        if (typeof toggleEquipDoberman === 'function') {
            toggleEquipDoberman();
        } else if (typeof socket !== 'undefined' && socket.connected) {
            socket.emit('toggleEquipDoberman');
        }
        return;
    }
    socket.emit('equipPropItem', { itemKey: itemKey });
    if (propId === 'sigara') {
        if (typeof myAvatar !== 'undefined' && myAvatar) {
            myAvatar.heldItem = 'sigara';
            myAvatar._k2CigLit = false;
            myAvatar._k2UseLighter = true;
            if (typeof triggerK2SmokeAnimation === 'function') {
                triggerK2SmokeAnimation(myAvatar, true);
            }
        }
        if (typeof previewAvatar !== 'undefined' && previewAvatar) {
            previewAvatar.heldItem = 'sigara';
            previewAvatar._k2CigLit = false;
            previewAvatar._k2UseLighter = true;
            if (typeof triggerK2SmokeAnimation === 'function') {
                triggerK2SmokeAnimation(previewAvatar, true);
            }
        }
    }
}

function buyPropFromBag(propId) {
    socket.emit('buyWardrobeItem', { category: 'props', id: propId });
}

function openGiftItemPickerDirect(itemKey) {
    let target = prompt("Bu eşyayı kime hediye etmek istiyorsunuz? (Kullanıcı adını yazın):");
    if (!target || !target.trim()) return;
    target = target.trim();
    if (!confirm(`${target} kullanıcısına 1 adet bu eşyayı hediye etmek istediğinizden emin misiniz?`)) return;
    socket.emit('giftPropItem', {
        targetUsername: target,
        itemKey: itemKey
    });
}

// --- 8. BİLDİRİM TOASTLARI (ÇAY, PARA, ARKADAŞLIK TEKLİFİ) ---
let activeFriendRequestFrom = null;

function showFriendRequestToast(fromUsername) {
    activeFriendRequestFrom = fromUsername;
    const toast = document.getElementById('friendRequestToast');
    const nameEl = document.getElementById('friendRequestFromName');
    if (nameEl) nameEl.innerText = fromUsername;
    if (toast) toast.style.display = 'flex';
}

function acceptFriendRequest() {
    if (activeFriendRequestFrom) {
        socket.emit('respondFriendRequest', { fromUsername: activeFriendRequestFrom, accept: true });
        activeFriendRequestFrom = null;
    }
    const toast = document.getElementById('friendRequestToast');
    if (toast) toast.style.display = 'none';
}

function declineFriendRequest() {
    if (activeFriendRequestFrom) {
        socket.emit('respondFriendRequest', { fromUsername: activeFriendRequestFrom, accept: false });
        activeFriendRequestFrom = null;
    }
    const toast = document.getElementById('friendRequestToast');
    if (toast) toast.style.display = 'none';
}

function showSocialNotificationToast(icon, title, message) {
    const container = document.getElementById('socialNotificationToastContainer');
    if (!container) return;

    let toast = document.createElement('div');
    toast.className = 'social-toast-popup';
    toast.style.cssText = "background: rgba(15, 23, 42, 0.95); border: 2px solid #38bdf8; border-radius: 12px; padding: 12px 18px; color: white; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); backdrop-filter: blur(8px); animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); margin-bottom: 10px; max-width: 320px;";
    toast.innerHTML = `
        <span style="font-size: 26px;">${icon}</span>
        <div>
            <div style="font-weight: 800; font-size: 13px; color: #facc15;">${title}</div>
            <div style="font-size: 12px; color: #cbd5e1; margin-top: 2px;">${message}</div>
        </div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 4500);
}
window.showSocialNotificationToast = showSocialNotificationToast;

function showFloatingToast(message) {
    if (typeof showSocialNotificationToast === 'function') {
        showSocialNotificationToast('💬', 'Bildirim', message);
    }
}
window.showFloatingToast = showFloatingToast;

// --- 9. SOCKET DİNLEYİCİLERİ (SOSYAL ETKİLEŞİM) ---
if (typeof socket !== 'undefined' && socket) {
    socket.on('toast', (data) => {
        let msg = typeof data === 'string' ? data : (data && data.text ? data.text : '');
        let icon = (data && data.type === 'error') ? '⚠️' : ((data && data.type === 'success') ? '✅' : '⛏️');
        showSocialNotificationToast(icon, 'Maden', msg);
    });

    socket.on('zeusStateUpdate', (data) => {
        window.zeusState = data;
        if (data && typeof data.hasItem === 'boolean') {
            window.hasZeusLightning = data.hasItem;
        }
    });

    socket.on('friendRequestReceived', (data) => {
        showFriendRequestToast(data.fromUsername);
        if (!window.myFriendRequests) window.myFriendRequests = [];
        let from = data.fromUsername;
        if (!window.myFriendRequests.some(r => (typeof r === 'string' ? r : r.username).toLowerCase() === from.toLowerCase())) {
            window.myFriendRequests.push(from);
        }
        updateFriendshipBadges();
        if (currentFriendsTab === 'requests') renderFriendRequestsUI();
    });

    socket.on('friendRequestsUpdate', (requests) => {
        window.myFriendRequests = requests || [];
        updateFriendshipBadges();
        if (currentFriendsTab === 'requests') renderFriendRequestsUI();
    });

    socket.on('friendListUpdate', (friends) => {
        window.myFriendsList = friends || [];
        renderFriendsListUI(friends);
        if (currentInteractingPlayer) {
            updateFriendshipButtonState(currentInteractingPlayer.name);
        }
    });

    socket.on('propInventoryUpdate', (propInv) => {
        window.myPropInventory = propInv || {};
        updatePropsCountBadge();
        if (isItemInventoryOpen) renderItemInventoryUI();
        if (typeof renderWardrobeUI === 'function') renderWardrobeUI();
    });

    socket.on('teaGiftReceived', (data) => {
        showSocialNotificationToast('☕', 'Çay İkramı!', `${data.from} sana tavşan kanı bir çay ısmarladı! (5 dakika elinde).`);
    });

    socket.on('teaTimerStarted', (data) => {
        showSocialNotificationToast('☕', 'Tavşan Kanı Çay!', 'Çayını aldın, 5 dakika boyunca elinde kalacak. Afiyet olsun!');
    });

    socket.on('teaExpired', () => {
        showSocialNotificationToast('☕', 'Çay Bitti!', '5 dakikalık süre doldu, çay bardağın alındı.');
    });

    socket.on('moneyGiftReceived', (data) => {
        showSocialNotificationToast('💸', 'Para Transferi!', `${data.from} hesabına ${data.amount} TL gönderdi!`);
    });

    socket.on('propGiftReceived', (data) => {
        showSocialNotificationToast('🎁', 'Eşya Hediyesi!', `${data.from} sana yeni bir el eşyası hediye etti! Çantana eklendi.`);
    });
}


// Socket Profil ve Beğeni Olay Dinleyicileri
if (typeof socket !== 'undefined') {
    socket.on('profileDetailsResult', (data) => {
        if (!currentInteractingPlayer || !data) return;
        const isTargetMatch = (data.targetName && currentInteractingPlayer.name && currentInteractingPlayer.name.toLowerCase() === data.targetName.toLowerCase()) || (data.targetId && currentInteractingPlayer.id === data.targetId) || (data.isAnon && (currentInteractingPlayer.name === '???' || currentInteractingPlayer.isAnon));
        if (isTargetMatch) {
            const uname = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
            const isSelf = !!data.isSelf;

            if (data.isAnon && !isSelf) {
                updateRatingButtonsUI(0, 0, null);
                updateProfileMottoUI(data.motto || '🎭 Kimliği gizlenmiş gizemli yabancı...', false);
                updateProfileMoodUI('none', false);
                renderProfileSquareBadges({ isAnon: true }, false);
                const xpContainer = document.getElementById('profileLiveXpContainer');
                if (xpContainer) xpContainer.style.display = 'none';
                return;
            }

            updateRatingButtonsUI(data.likes, data.dislikes, data.userRating);
            
            // Motto güncelle
            if (data.motto !== undefined) {
                updateProfileMottoUI(data.motto, isSelf);
                if (isSelf) window.myMotto = data.motto;
            }

            // Ruh Hali (Mood) güncelle
            if (data.mood) {
                updateProfileMoodUI(data.mood, isSelf);
                if (isSelf) window.myMood = data.mood;
            }

            // Rozetleri render et (Level daima 1. yuva, sonrakiler kazanılma sırasıyla)
            const statsObj = Object.assign({}, data.gameStats || {}, {
                level: data.level,
                totalXP: data.totalXP,
                currentProgress: data.currentProgress !== undefined ? data.currentProgress : (data.gameStats && data.gameStats.currentProgress),
                targetXP: data.targetXP !== undefined ? data.targetXP : (data.gameStats && data.gameStats.targetXP),
                badgeUnlockOrder: data.badgeUnlockOrder || (data.gameStats && data.gameStats.badgeUnlockOrder),
                badgeLevels: data.badgeLevels
            });
            renderProfileSquareBadges(statsObj, isSelf);

            // Canlı XP Barını güncelle (YALNIZCA KİŞİ KENDİ PROFİLİNİ AÇTIĞINDA GÖRÜNÜR)
            const xpContainer = document.getElementById('profileLiveXpContainer');
            if (xpContainer) {
                if (!isSelf) {
                    xpContainer.style.display = 'none';
                } else {
                    xpContainer.style.display = 'block';
                    const lvl = (statsObj.level !== undefined && statsObj.level !== null) ? Math.max(1, Number(statsObj.level)) : 1;
                    const cur = (statsObj.currentProgress !== undefined) ? Number(statsObj.currentProgress) : 0;
                    const tgt = (statsObj.targetXP !== undefined && statsObj.targetXP > 0) ? Number(statsObj.targetXP) : (lvl === 1 ? 20 : Math.floor(20 * Math.pow(lvl - 1, 1.42)));
                    const pct = tgt > 0 ? Math.min(100, Math.max(0, Math.floor((cur / tgt) * 100))) : 100;
                    const tEl = document.getElementById('profileLiveXpTitle');
                    const txtEl = document.getElementById('profileLiveXpText');
                    const fEl = document.getElementById('profileLiveXpFill');
                    if (tEl) tEl.innerHTML = '<span>⚡</span> Seviye ' + lvl + ' İlerlemesi';
                    if (txtEl) txtEl.textContent = cur.toLocaleString('tr-TR') + ' / ' + tgt.toLocaleString('tr-TR') + ' XP (%' + pct + ')';
                    if (fEl) fEl.style.width = pct + '%';
                }
            }

            // Hedefe yönelik 24 saat gasp soğuma sayacı (Madde 3)
            if (data.mugCooldownRemMs !== undefined) {
                currentInteractingPlayer.mugCooldownRemMs = data.mugCooldownRemMs;
                currentInteractingPlayer.mugCooldownReceivedAt = Date.now();
                updateProfileMugCooldownUI();
                if (window._profileMugCooldownInterval) {
                    clearInterval(window._profileMugCooldownInterval);
                    window._profileMugCooldownInterval = null;
                }
                if (data.mugCooldownRemMs > 0) {
                    window._profileMugCooldownInterval = setInterval(updateProfileMugCooldownUI, 1000);
                }
            }
        }
    });

    function updateProfileBadgesLive(xpData) {
        if (!xpData) return;
        const modal = document.getElementById('playerInteractionModal');
        if (!modal || modal.style.display === 'none') return;
        if (!currentInteractingPlayer) return;
        const uname = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
        const isSelf = (uname && currentInteractingPlayer.name && uname.toLowerCase() === currentInteractingPlayer.name.toLowerCase());
        if (!isSelf) return;

        if (cachedCurrentBadgeDataList && cachedCurrentBadgeDataList.length > 0) {
            const residentBadge = cachedCurrentBadgeDataList.find(b => b.badgeId === 'resident');
            if (residentBadge) {
                const lvl = xpData.currentLevel || xpData.level || residentBadge.level;
                residentBadge.level = lvl;
                residentBadge.levelTag = 'Lv. ' + lvl;
                if (xpData.currentProgress !== undefined) {
                    residentBadge.count = Number(xpData.currentProgress);
                    residentBadge.currentCount = Number(xpData.currentProgress);
                }
                if (xpData.targetXP !== undefined) {
                    residentBadge.targetCount = Number(xpData.targetXP);
                }
                residentBadge.progressPct = residentBadge.targetCount > 0 ? Math.min(100, Math.floor((residentBadge.currentCount / residentBadge.targetCount) * 100)) : 100;
                residentBadge.title = (window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') ? window.LevelClient.getLevelTitle(lvl) : (typeof getLevelTitleHelper === 'function' ? getLevelTitleHelper(lvl) : residentBadge.title);
                residentBadge.nextGoalText = lvl < 100 ? ('Seviye ' + (lvl + 1) + ' için ' + Math.max(0, residentBadge.targetCount - residentBadge.currentCount) + ' XP kaldı') : 'Maksimum Seviyeye Ulaşıldı';

                const slotEl = document.getElementById('profileBadgeSquare_0');
                if (slotEl) {
                    const numEl = slotEl.querySelector('.badge-huge-level-number');
                    if (numEl) {
                        numEl.textContent = lvl;
                        if (String(lvl).length >= 3) numEl.classList.add('digits-3');
                        else numEl.classList.remove('digits-3');
                    }
                }

                // Canlı XP Barını da anında güncelle
                const xpContainer = document.getElementById('profileLiveXpContainer');
                if (xpContainer && isSelf) {
                    const tEl = document.getElementById('profileLiveXpTitle');
                    const txtEl = document.getElementById('profileLiveXpText');
                    const fEl = document.getElementById('profileLiveXpFill');
                    if (tEl) tEl.innerHTML = '<span>⚡</span> Seviye ' + lvl + ' İlerlemesi';
                    if (txtEl) txtEl.textContent = residentBadge.currentCount.toLocaleString('tr-TR') + ' / ' + residentBadge.targetCount.toLocaleString('tr-TR') + ' XP (%' + residentBadge.progressPct + ')';
                    if (fEl) fEl.style.width = residentBadge.progressPct + '%';
                }
            }
        }
    }
    window.updateProfileBadgesLive = updateProfileBadgesLive;

    socket.on('playerMottoUpdated', (data) => {
        if (data && data.motto !== undefined) {
            window.myMotto = data.motto;
        }
    });

    socket.on('playerMottoChanged', (data) => {
        if (!data || !data.username) return;
        if (currentInteractingPlayer && currentInteractingPlayer.name.toLowerCase() === data.username.toLowerCase()) {
            const uname = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
            const isSelf = (uname && currentInteractingPlayer.name && uname.toLowerCase() === currentInteractingPlayer.name.toLowerCase());
            updateProfileMottoUI(data.motto, isSelf);
        }
    });

    socket.on('playerMoodUpdated', (data) => {
        if (data && data.mood) {
            window.myMood = data.mood;
        }
    });

    socket.on('playerMoodChanged', (data) => {
        if (!data || !data.username) return;
        if (currentInteractingPlayer && currentInteractingPlayer.name.toLowerCase() === data.username.toLowerCase()) {
            const uname = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
            const isSelf = (uname && currentInteractingPlayer.name && uname.toLowerCase() === currentInteractingPlayer.name.toLowerCase());
            updateProfileMoodUI(data.mood, isSelf);
        }
    });

    socket.on('playerRatingResult', (data) => {
        if (!currentInteractingPlayer || !data || !data.targetName) return;
        if (currentInteractingPlayer.name.toLowerCase() === data.targetName.toLowerCase()) {
            updateRatingButtonsUI(data.likes, data.dislikes, data.userRating);
        }
    });

    socket.on('playerRatingUpdated', (data) => {
        if (!currentInteractingPlayer || !data || !data.targetName) return;
        if (currentInteractingPlayer.name.toLowerCase() === data.targetName.toLowerCase()) {
            const likeNum = document.getElementById('interactionLikesNum');
            const dislikeNum = document.getElementById('interactionDislikesNum');
            if (likeNum && data.likes !== undefined) likeNum.innerText = data.likes;
            if (dislikeNum && data.dislikes !== undefined) dislikeNum.innerText = data.dislikes;
        }
    });
}
