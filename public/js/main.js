// Global Oyuncu Cinsiyeti Yardimcisi
function getPlayerGender(p) {
    if (p && p.gender) return p.gender;
    if (p && p.isFemale !== undefined) return p.isFemale ? 'female' : 'male';
    if (typeof window !== 'undefined') {
        if (window.myGender) return window.myGender;
        if (window.selectedGender) return window.selectedGender;
    }
    if (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.gender) return myAvatar.gender;
    if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId] && players[myId].gender) {
        return players[myId].gender;
    }
    return 'male';
}
window.getPlayerGender = getPlayerGender;

// public/js/main.js - Ana Oyun Orkestratörü, Game Loop & Soket Yöneticisi
// (Modüler mimariye ayrılmıştır: authUI.js, wardrobe.js, avatarRenderer.js, chatBubbles.js, worldRenderer.js, fishing.js, adminPanel.js, mobileControls.js)

// public/js/main.js

var socket = window.socket || (typeof io !== 'undefined' ? io() : null);
window.socket = socket;

// Canvas roundRect Polyfill (Eski Tarayıcı ve Mobil Cihaz Desteği)
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
        if (!radii) radii = 0;
        let r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
        r = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
        this.beginPath();
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
    };
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
window.ctx = ctx;
window.players = players;
window.myId = myId;

var myId = null;
var players = {};
var currentRoom = "sokak";

// WASD Hareket Değişkenleri (Akıcı Yürüyüş)
var keys = { w: false, a: false, s: false, d: false, shift: false };


// --- 1. OTURUM & YÖNETİM DURUM DİNLENMESİ ---
let myUsername = "";

socket.on('loginSuccess', (data) => {
    try { const loginEl = document.getElementById('loginScreen'); if (loginEl) loginEl.style.display = 'none'; } catch(e) {}
    if (socket && socket.id) {
        myId = socket.id;
        window.myId = socket.id;
    }
    if (data) {
        if (data.username) {
            myUsername = data.username;
            window.myUsername = data.username;
        }
        if (data.gender) {
            window.myGender = data.gender;
        }
        if (data.money !== undefined) updateMoneyDisplay(data.money);
        if (data.diamonds !== undefined && typeof updateDiamondDisplay === 'function') updateDiamondDisplay(data.diamonds);
        if (data.inventory) myInventory = data.inventory;
        if (data.avatar) {
            myAvatar = data.avatar;
            if (!myAvatar.gender && (data.gender || window.myGender)) {
                myAvatar.gender = data.gender || window.myGender;
            }
            if (!myAvatar.shoes) myAvatar.shoes = (window.myGender === 'female' ? 'flats' : 'sneakers');
            if (players[myId]) Object.assign(players[myId], myAvatar);
        }
        if (data.friends) {
            window.myFriendsList = data.friends;
            if (typeof renderFriendsListUI === 'function') renderFriendsListUI();
        }
        if (data.propInventory) {
            window.myPropInventory = data.propInventory;
            if (typeof updatePropsCountBadge === 'function') updatePropsCountBadge();
        }
        if (data.jammerCount !== undefined) window.myJammerCount = data.jammerCount;
        if (data.zeusCount !== undefined) window.myZeusCount = data.zeusCount;
        if (data.mugKnifeCount !== undefined) window.myMugKnifeCount = data.mugKnifeCount;
        if (data.hasMugKnife !== undefined) window.myHasMugKnife = data.hasMugKnife;
        if (data.bodyguardsEquipped !== undefined) window.myBodyguardsEquipped = data.bodyguardsEquipped;
        if (data.bodyguardCount !== undefined) window.myBodyguardCount = data.bodyguardCount;
        if (data.hasDoberman !== undefined) window.myHasDoberman = data.hasDoberman;
        if (data.dobermanEquipped !== undefined) window.myDobermanEquipped = data.dobermanEquipped;
        if (data.anonMaskExpiresAt !== undefined) {
            window.myAnonMaskExpiresAt = data.anonMaskExpiresAt;
            if (myAvatar) myAvatar.anonMaskExpiresAt = data.anonMaskExpiresAt;
        }
        if (data.level !== undefined) {
            window.myLevel = data.level;
            window.myTotalXP = data.totalXP;
            if (window.LevelClient && typeof window.LevelClient.initFromLogin === 'function') {
                window.LevelClient.initFromLogin(data);
            }
        }
        if (data.friendRequests) {
            window.myFriendRequests = data.friendRequests;
            if (typeof renderFriendRequestsUI === 'function') renderFriendRequestsUI();
        }
        if (typeof updateFriendshipBadges === 'function') updateFriendshipBadges();
        if (data.houses) {
            window.myHouses = data.houses;
        }
        if (data.house) {
            myHouseData = data.house;
            window.myHouseData = data.house;
        }
        if (data.skinSets) {
            window.mySkinSets = data.skinSets;
            if (typeof updateSkinSetsUI === 'function') updateSkinSetsUI();
        }
        if (data.furnitureInventory) {
            myFurnitureInventory = data.furnitureInventory;
            window.myFurnitureInventory = data.furnitureInventory;
        }
        if (typeof updateHouseEditButtonVisibility === 'function') {
            updateHouseEditButtonVisibility();
        }

        const ADMIN_NAMES = ['yasin', 'maltoroz'];
        const MOD_NAMES = ['elyesa'];
        const isUserAdmin = !!(data.isAdmin || data.role === 'admin' || (data.username && ADMIN_NAMES.includes(data.username.toLowerCase())));
        const isUserMod = !!(data.isMod || data.role === 'mod' || data.role === 'moderator' || (data.username && MOD_NAMES.includes(data.username.toLowerCase())));

        window.currentUserIsAdmin = isUserAdmin;
        window.currentUserIsMod = isUserMod;

        const adminBtn = document.getElementById('adminPanelNavBtn');
        if (adminBtn) {
            if (isUserAdmin) {
                adminBtn.style.display = 'flex';
                adminBtn.innerHTML = '👑 Admin Paneli';
                adminBtn.style.background = 'linear-gradient(135deg, #ef4444, #991b1b)';
                adminBtn.style.boxShadow = '0 4px 12px rgba(239,68,68,0.4)';
            } else if (isUserMod) {
                adminBtn.style.display = 'flex';
                adminBtn.innerHTML = '🛡️ Moderatör Paneli';
                adminBtn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
                adminBtn.style.boxShadow = '0 4px 12px rgba(2,132,199,0.4)';
            }
        }

        // Yeni Güncellemeler (Beta v1.3) Panelini Aç
        setTimeout(() => {
            if (typeof openUpdatesModal === 'function') {
                openUpdatesModal();
            }
        }, 350);

        // 5 Saniye Sonra Günlük Ödül Kontrolü ve Açılışı (Eğer bugünkü ödül alınmamışsa)
        setTimeout(() => {
            if (window.DailyRewardClient && typeof window.DailyRewardClient.checkAndShow === 'function') {
                window.DailyRewardClient.checkAndShow();
            }
        }, 5000);
    }
});

socket.on('moneyUpdate', (money) => {
    const amt = (typeof money === 'object' && money !== null && money.money !== undefined) ? money.money : money;
    const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
    window.myMoney = num;
    window.userMoney = num;
    if (typeof myId !== 'undefined' && players && players[myId]) {
        players[myId].money = num;
    }
    if (typeof updateMoneyDisplay === 'function') {
        updateMoneyDisplay(num);
    } else {
        const uBadge = document.getElementById('userMoneyDisplay');
        if (uBadge) uBadge.innerText = num.toLocaleString('tr-TR');
    }
});

socket.on('diamondUpdate', (diamonds) => {
    const amt = (typeof diamonds === 'object' && diamonds !== null && diamonds.diamonds !== undefined) ? diamonds.diamonds : diamonds;
    const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
    window.myDiamonds = num;
    if (typeof myId !== 'undefined' && players && players[myId]) {
        players[myId].diamonds = num;
    }
    if (typeof updateDiamondDisplay === 'function') {
        updateDiamondDisplay(num);
    } else {
        const dEl = document.getElementById('myDiamonds');
        if (dEl) dEl.innerText = num.toLocaleString('tr-TR');
    }
});

socket.on('playerLevelBadgeUpdate', (data) => {
    if (data && data.id && typeof players !== 'undefined' && players && players[data.id]) {
        players[data.id].level = data.level;
    }
});


// --- 3. SÜRÜKLE BIRAK (DRAGGABLE) İŞLEMLERİ & EVRENSEL YARDIMCI ---
function makeModalDraggable(modal, header, options = {}) {
    const modalEl = typeof modal === 'string' ? document.getElementById(modal) : modal;
    const headerEl = typeof header === 'string' ? document.getElementById(header) : header;
    if (!modalEl || !headerEl || modalEl._draggableInit) return;
    modalEl._draggableInit = true;

    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;
    let hasMoved = false;

    function startDrag(clientX, clientY, target) {
        if (!modalEl) return false;
        if (target && (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.in-game-zoom-ctrl') || target.closest('.game-window-controls') || target.closest('.close-btn'))) {
            return false;
        }
        isDragging = true;
        hasMoved = false;
        startX = clientX;
        startY = clientY;

        const rect = modalEl.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        return true;
    }

    function moveDrag(clientX, clientY) {
        if (!isDragging || !modalEl) return;
        const dist = Math.hypot(clientX - startX, clientY - startY);
        if (dist > 3 && !hasMoved) {
            hasMoved = true;
            modalEl.style.animation = 'none';
            modalEl.style.transform = 'none';
            modalEl.style.margin = '0';
            modalEl.style.left = initialLeft + 'px';
            modalEl.style.top = initialTop + 'px';
        }
        if (!hasMoved) return;

        const dx = clientX - startX;
        const dy = clientY - startY;
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        // Ekran dışına taşmayı engelle (Viewport Clamping)
        const modalW = modalEl.offsetWidth || 400;
        const maxL = Math.max(10, window.innerWidth - 60);
        const minL = Math.min(10, 10 - modalW + 80);
        const maxT = Math.max(10, window.innerHeight - 44);
        newLeft = Math.max(minL, Math.min(newLeft, maxL));
        newTop = Math.max(5, Math.min(newTop, maxT));

        modalEl.style.left = newLeft + 'px';
        modalEl.style.top = newTop + 'px';
        if (modalEl.style.right) modalEl.style.right = 'auto';
    }

    function endDrag() {
        isDragging = false;
        hasMoved = false;
    }

    headerEl.addEventListener('mousedown', (e) => {
        if (startDrag(e.clientX, e.clientY, e.target)) {
            e.preventDefault();
        }
    });
    document.addEventListener('mousemove', (e) => {
        if (isDragging) moveDrag(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', endDrag);

    // Mobil Dokunmatik Desteği
    headerEl.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
            startDrag(e.touches[0].clientX, e.touches[0].clientY, e.target);
        }
    }, { passive: true });
    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches && e.touches.length === 1) {
            if (hasMoved && e.cancelable) e.preventDefault();
            moveDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
}
window.makeModalDraggable = makeModalDraggable;

document.addEventListener('DOMContentLoaded', () => {
    // A) Sohbet Panelini Sürükleme
    makeModalDraggable('sideChatContainer', 'chatHeader');
    // B) Oyun Masasını (Modal) Sürükleme
    makeModalDraggable('gameModal', 'modalHeader');

    // Enter tuşu desteği ve Karakter Sayacı
    const sideInput = document.getElementById('sideChatInput');
    if (sideInput) {
        sideInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = (sideInput.value || '').trim();
                if (val.length > 0) {
                    // Mesaj yazılmış: Gönder, chat panelini açık tut ve imleci chat inputunda tut
                    sendSideChat();
                    setTimeout(() => {
                        sideInput.focus();
                    }, 10);
                } else {
                    // Chat boşken Enter'a basıldı: Chat modundan çık, imleci kaldır ve oyuna dön
                    sideInput.blur();
                    const canvas = document.getElementById('gameCanvas');
                    if (canvas) canvas.focus();
                    window.focus();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                sideInput.blur();
                const canvas = document.getElementById('gameCanvas');
                if (canvas) canvas.focus();
                window.focus();
            }
        });
        sideInput.addEventListener('input', updateChatCharCounter);
    }

    // Yeni Alt Hızlı Chat Input Dinleyicisi (Enter ile gönderme / boş Enter veya Escape ile oyuna dönme)
    const bottomInput = document.getElementById('bottomChatInput');
    if (bottomInput) {
        bottomInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const val = (bottomInput.value || '').trim();
                if (val.length > 0) {
                    if (typeof sendBottomChat === 'function') sendBottomChat();
                    setTimeout(() => {
                        bottomInput.focus();
                    }, 10);
                } else {
                    bottomInput.blur();
                    const canvas = document.getElementById('gameCanvas');
                    if (canvas) canvas.focus();
                    window.focus();
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                bottomInput.blur();
                const canvas = document.getElementById('gameCanvas');
                if (canvas) canvas.focus();
                window.focus();
            }
        });
    }

    const passwordInput = document.getElementById('passwordInput');
    const usernameInput = document.getElementById('usernameInput');
    if (passwordInput) passwordInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });
    if (usernameInput) usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });

    const regUserInput = document.getElementById('regUsernameInput');
    const regPassInput = document.getElementById('regPasswordInput');
    const regPassConfirmInput = document.getElementById('regPasswordConfirmInput');
    if (regUserInput) regUserInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptRegister(); });
    if (regPassInput) regPassInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptRegister(); });
    if (regPassConfirmInput) regPassConfirmInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptRegister(); });

    const cpOld = document.getElementById('cpOldPassword');
    const cpNew = document.getElementById('cpNewPassword');
    const cpConfirm = document.getElementById('cpNewPasswordConfirm');
    if (cpOld) cpOld.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitChangePassword(); });
    if (cpNew) cpNew.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitChangePassword(); });
    if (cpConfirm) cpConfirm.addEventListener('keypress', (e) => { if (e.key === 'Enter') submitChangePassword(); });

    if (!window._isGameLoopRunning) {
        window._isGameLoopRunning = true;
        requestAnimationFrame(gameLoop);
    }

    // Ekran Zoom Kontrollerini Başlat ve Kayıtlı Değeri Yükle
    if (typeof initGameZoom === 'function') {
        initGameZoom();
    }
});

// --- 4. OYUNCU VE ODA BAĞLANTILARI ---
socket.on('currentPlayers', (serverPlayers) => {
    let oldMe = (typeof myId !== 'undefined' && players && players[myId]) ? players[myId] : null;
    players = serverPlayers || {};
    myId = socket.id;
    window.myId = socket.id;
    if (!players[myId] && oldMe) {
        players[myId] = oldMe;
    }
    if (players[myId]) {
        lastEmittedX = players[myId].x;
        lastEmittedY = players[myId].y;
    }
});

socket.on('newPlayer', (data) => { if (data && data.id) players[data.id] = data.player; });
socket.on('playerDisconnected', (id) => {
    if (id === myId) return;
    delete players[id];
    delete activeChatBubbles[id];
    delete activePlayerEmojis[id];
});
socket.on('playerMoved', (data) => {
    if (players[data.id]) {
        if (players[data.id].action === 'sitting' && (data.x !== players[data.id].x || data.y !== players[data.id].y)) {
            players[data.id].action = null;
        }
        if (data.id === myId) {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
        } else {
            players[data.id].targetX = data.x;
            players[data.id].targetY = data.y;
            if (data.isMoving !== undefined) {
                players[data.id].serverMoving = data.isMoving;
            }
            if (data.isSprinting !== undefined) {
                players[data.id].isSprinting = data.isSprinting;
            }
            if (data.facing) {
                players[data.id].facing = data.facing;
            }
            if (players[data.id].x === undefined) {
                players[data.id].x = data.x;
                players[data.id].y = data.y;
            }
        }
    }
});
socket.on('systemMessage', (msg) => { console.log("[Sistem]:", msg); });

socket.on('chatSpamWarning', (data) => {
    const banner = document.getElementById('chatSpamWarningBanner');
    if (banner) {
        banner.style.display = 'block';
        banner.textContent = (data && data.message) ? data.message : "⚠️ Çok hızlı mesaj atıyorsunuz! Lütfen 3 saniye bekleyin.";
        clearTimeout(window._chatSpamTimeout);
        window._chatSpamTimeout = setTimeout(() => {
            banner.style.display = 'none';
        }, ((data && data.cooldownRemaining) || 3) * 1000);
    }
});

socket.on('playerEmojiUpdate', (data) => {
    if (data && data.id && data.emoji) {
        activePlayerEmojis[data.id] = { emoji: data.emoji, start: Date.now() };
    }
});

const ROOM_TRANSITION_SPAWNS = {
    kafe: {
        default: { x: 500, y: 530 }
    },
    sokak: {
        sahil: { x: 85, y: 240 },
        sahil_yolu: { x: 85, y: 250 },
        cadde: { x: 720, y: 240 },
        kafe: { x: 400, y: 125 },
        nargile_cafe: { x: 670, y: 125 },
        market: { x: 730, y: 350 },
        emlakci: { x: 180, y: 130 },
        default: { x: 350, y: 230 }
    },
    cadde: {
        sokak: { x: 80, y: 230 },
        cadde2: { x: 730, y: 230 },
        ganyan: { x: 240, y: 145 },
        dedenin_yeri: { x: 590, y: 145 },
        dostlar_kiraathanesi: { x: 650, y: 380 },
        pet_shop: { x: 120, y: 395 },
        default: { x: 400, y: 230 }
    },
    pet_shop: {
        cadde: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    cadde2: {
        cadde: { x: 70, y: 235 },
        vip_club: { x: 98, y: 140 },
        mine_cave: { x: 880, y: 460 },
        botanic_shop: { x: 320, y: 190 },
        kultur_merkezi_lobi: { x: 780, y: 190 },
        default: { x: 250, y: 235 }
    },
    mine_cave: {
        cadde2: { x: 140, y: 520 },
        default: { x: 140, y: 520 }
    },
    botanic_shop: {
        cadde2: { x: 500, y: 550 },
        default: { x: 500, y: 520 }
    },
    vip_club: {
        cadde2: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    optik: {
        avm_kat1: { x: 670, y: 490 },
        cadde2: { x: 670, y: 490 },
        default: { x: 670, y: 490 }
    },
    optika: {
        avm_kat1: { x: 670, y: 490 },
        cadde2: { x: 670, y: 490 },
        default: { x: 670, y: 490 }
    },
    kultur_merkezi_lobi: {
        cadde2: { x: 500, y: 550 },
        kultur_merkezi_sahne: { x: 500, y: 220 },
        kultur_merkezi_kulis: { x: 230, y: 220 },
        kultur_merkezi_sinema: { x: 770, y: 220 },
        default: { x: 500, y: 550 }
    },
    kultur_merkezi_sahne: {
        kultur_merkezi_lobi: { x: 500, y: 560 },
        kultur_merkezi_kulis: { x: 140, y: 240 },
        default: { x: 500, y: 500 }
    },
    kultur_merkezi_kulis: {
        kultur_merkezi_lobi: { x: 500, y: 550 },
        kultur_merkezi_sahne: { x: 860, y: 240 },
        default: { x: 500, y: 450 }
    },
    kultur_merkezi_sinema: {
        kultur_merkezi_lobi: { x: 500, y: 560 },
        default: { x: 500, y: 520 }
    },
    dostlar_kiraathanesi: {
        cadde: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    emlakci: { default: { x: 400, y: 410 } },
    sahil: {
        sokak: { x: 680, y: 270 },
        sahil_yolu: { x: 680, y: 270 },
        default: { x: 420, y: 350 }
    },
    ganyan: { default: { x: 400, y: 410 } },
    dedenin_yeri: { default: { x: 400, y: 410 } },
    nargile_cafe: { default: { x: 400, y: 390 } },
    market: { default: { x: 400, y: 420 } },
    sanalika_cadde: { default: { x: 750, y: 520 } },
    star_caddesi: {
        sokak: { x: 120, y: 360 },
        default: { x: 500, y: 360 }
    },
    meydanv2: {
        sokak: { x: 500, y: 350 },
        cadde: { x: 920, y: 330 },
        sahil: { x: 500, y: 560 },
        sahil_yolu: { x: 500, y: 560 },
        kafe: { x: 380, y: 195 },
        emlakci: { x: 140, y: 195 },
        nargile_cafe: { x: 640, y: 195 },
        market: { x: 880, y: 195 },
        housing_portal: { x: 180, y: 560 },
        default: { x: 500, y: 350 }
    },
    sahilv2: {
        sahil_yolu: { x: 900, y: 520 },
        default: { x: 500, y: 400 }
    },
    sahil_yolu: {
        sokak: { x: 910, y: 260 },
        sahil: { x: 85, y: 260 },
        meydanv2: { x: 500, y: 70 },
        sahilv2: { x: 880, y: 520 },
        avm_kat1: { x: 500, y: 240 },
        default: { x: 500, y: 260 }
    },
    avm_kat1: {
        sahil_yolu: { x: 500, y: 560 },
        avm_kat2: { x: 620, y: 220 },
        optik: { x: 660, y: 240 },
        optika: { x: 660, y: 240 },
        avm_magaza_kiyafet: { x: 220, y: 280 },
        avm_magaza_sapka: { x: 400, y: 220 },
        avm_magaza_sneaker: { x: 740, y: 280 },
        default: { x: 500, y: 560 }
    },
    avm_kat2: {
        avm_kat1: { x: 620, y: 220 },
        avm_magaza_takim: { x: 220, y: 280 },
        avm_magaza_saat: { x: 400, y: 220 },
        avm_magaza_berber: { x: 740, y: 280 },
        default: { x: 620, y: 220 }
    },
    avm_magaza_kiyafet: { avm_kat1: { x: 500, y: 530 }, default: { x: 500, y: 530 } },
    avm_magaza_sneaker: { avm_kat1: { x: 500, y: 530 }, default: { x: 500, y: 530 } },
    avm_magaza_sapka: { avm_kat1: { x: 500, y: 530 }, default: { x: 500, y: 530 } },
    avm_magaza_takim: { avm_kat2: { x: 500, y: 530 }, default: { x: 500, y: 530 } },
    avm_magaza_saat: { avm_kat2: { x: 500, y: 530 }, default: { x: 500, y: 530 } },
    avm_magaza_berber: { avm_kat2: { x: 500, y: 530 }, default: { x: 500, y: 530 } }
};
let sanalikaCamera = { x: 0, y: 0 };
window.sanalikaCamera = sanalikaCamera;
let roomTransitionCooldownUntil = 0;
let roomTransitionFadeAlpha = 0;

// --- 5. MEKAN DEĞİŞTİRME (Üst Butonlar ve Geçişler) ---
function warnHouseEditActive() {
    if (typeof showSocialNotificationToast === 'function') {
        showSocialNotificationToast('⚠️', 'Ev Düzenleme Açık', 'Lütfen önce ev düzenleme ekranını kapatın.');
    } else {
        alert('Lütfen önce ev düzenleme ekranını kapatın.');
    }
}
window.warnHouseEditActive = warnHouseEditActive;

function changeRoom(newRoom, targetSpawn) {
    if (newRoom === 'mine_cave') {
        const myP = (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) ? players[myId] : (typeof myAvatar !== 'undefined' ? myAvatar : null);
        if (typeof verifyMineCaveEntrance === 'function' && !verifyMineCaveEntrance(myP)) {
            return;
        }
    }
    if (currentRoom && currentRoom.startsWith("house_") && window.isHouseEditMode && newRoom !== currentRoom) {
        warnHouseEditActive();
        return;
    }
    let oldRoom = currentRoom;
    if (!newRoom.startsWith("house_") && typeof stopGramophoneMusic === 'function') {
        stopGramophoneMusic();
    }
    currentRoom = newRoom;
    window.currentRoom = newRoom;
    if (typeof updateRoomAmbienceMusic === 'function') {
        updateRoomAmbienceMusic(newRoom);
    }
    if (typeof window.renderGardenQuickTray === 'function') {
        window.renderGardenQuickTray();
    }
    roomTransitionFadeAlpha = 0.95; // Sinematik mekan geçiş kararması (Fade in)
    // Dinamik Ekran Büyütme (Star Caddesi, Meydan v2, Dostlar Kıraathanesi, Sahil v2: 1000 x 625, Diğerleri: 800 x 500)
    if (canvas) {
        if (newRoom === 'star_caddesi' || newRoom === 'meydanv2' || newRoom === 'dostlar_kiraathanesi' || newRoom === 'sahilv2' || newRoom === 'kafe' || newRoom === 'sahil_yolu' || newRoom === 'cadde2' || newRoom === 'mine_cave' || newRoom === 'vip_club' || newRoom === 'optik' || newRoom === 'optika' || newRoom === 'botanic_shop' || newRoom === 'kultur_merkezi_lobi' || newRoom === 'kultur_merkezi_sahne' || newRoom === 'kultur_merkezi_kulis' || newRoom === 'kultur_merkezi_sinema' || newRoom === 'avm_kat1' || newRoom === 'avm_kat2' || (newRoom && newRoom.startsWith('avm_magaza_')) || (newRoom && newRoom.startsWith('house_')) || newRoom === 'pet_shop') {
            canvas.width = 1000;
            canvas.height = 625;
            canvas.style.aspectRatio = '1000 / 625';
            canvas.classList.add('wide-screen');
            const bottomBar = document.getElementById('gameBottomControlBar');
            if (bottomBar) {
                bottomBar.classList.add('wide-screen');
            }
        } else {
            canvas.width = 800;
            canvas.height = 500;
            canvas.style.aspectRatio = '800 / 500';
            canvas.classList.remove('wide-screen');
            const bottomBar = document.getElementById('gameBottomControlBar');
            if (bottomBar) {
                bottomBar.classList.remove('wide-screen');
            }
        }
        if (typeof applyGameZoom === 'function') {
            applyGameZoom(currentGameZoom, false);
        } else {
            if (typeof updateCanvasRect === 'function') {
                updateCanvasRect();
            }
        }
    }

    if (typeof bgCache !== 'undefined') bgCache.invalidate();

    if (newRoom === 'sanalika_cadde') {
        sanalikaCamera.x = Math.max(0, Math.min(1600 - canvas.width, 750 - canvas.width / 2));
        sanalikaCamera.y = Math.max(0, Math.min(960 - canvas.height, 520 - canvas.height / 2));
    } else {
        sanalikaCamera.x = 0;
        sanalikaCamera.y = 0;
    }
    if (typeof handleRoomChangedVoice === 'function') {
        handleRoomChangedVoice(newRoom);
    }
    // Kuğu Yalnızca Sahilv2 ve Sahil Haritasına Özeldir: Sahilv2'den başka odaya geçildiğinde anında iptal ve despawn edilir
    if (oldRoom === 'sahilv2' && newRoom !== 'sahilv2') {
        if (typeof myId !== 'undefined' && players[myId]) {
            players[myId].hasSwanBoat = false;
        }
        if (swanBoatCountdownInterval) {
            clearInterval(swanBoatCountdownInterval);
            swanBoatCountdownInterval = null;
        }
        swanBoatSecondsLeft = 0;
    } else if (newRoom !== 'sahil' && newRoom !== 'sahilv2') {
        if (typeof myId !== 'undefined' && players[myId]) {
            players[myId].hasSwanBoat = false;
        }
        if (swanBoatCountdownInterval) {
            clearInterval(swanBoatCountdownInterval);
            swanBoatCountdownInterval = null;
        }
        swanBoatSecondsLeft = 0;
    }

    roomTransitionCooldownUntil = Date.now() + 1500;

    if (typeof keys !== 'undefined') {
        keys.w = false;
        keys.a = false;
        keys.s = false;
        keys.d = false;
    }
    targetWalkPos = null;

    if (typeof myId !== 'undefined' && players[myId]) {
        let p = players[myId];
        p.isMoving = false;
        p.action = null;
        let spawnPos = targetSpawn;
        if (!spawnPos) {
            let roomMap = ROOM_TRANSITION_SPAWNS[newRoom];
            if (roomMap) {
                spawnPos = roomMap[oldRoom] || roomMap.default;
            } else if (newRoom.startsWith("house_")) {
                let isGardenRoom = newRoom.endsWith('_garden') || newRoom.includes('_garden') || newRoom === 'house_ornek_garden';
                spawnPos = isGardenRoom ? { x: 330, y: 380 } : { x: 400, y: 400 };
            } else {
                spawnPos = { x: 400, y: 300 };
            }
        }
        if (spawnPos) {
            p.x = spawnPos.x;
            p.y = spawnPos.y;
            lastEmittedX = p.x;
            lastEmittedY = p.y;
            lastEmittedMoving = false;
            socket.emit('playerMovement', { x: p.x, y: p.y, isMoving: false });
        }

        // Baba Peti Varsa Oyuncuyla Beraber Anında Yeni Mekana Geçsin
        if (window.activeFatherPets && window.activeFatherPets[myId]) {
            let myPet = window.activeFatherPets[myId];
            myPet.room = newRoom;
            myPet.x = p.x + 32;
            myPet.y = p.y;
            myPet.isMoving = false;
        }

        // Sevimli Patiler & Korumalar & Doberman Yoldaşları Oyuncuyla Beraber Yeni Mekana Geçsin
        if (window.activeCompanionPets) {
            for (let petKey in window.activeCompanionPets) {
                let myCompPet = window.activeCompanionPets[petKey];
                if (myCompPet && (myCompPet.ownerId === myId || petKey === myId)) {
                    myCompPet.room = newRoom;
                    myCompPet.curX = p.x + 24;
                    myCompPet.curY = p.y + 6;
                    myCompPet.x = p.x + 24;
                    myCompPet.y = p.y + 6;
                    myCompPet.isMoving = false;
                }
            }
        }
        // Kıraathane İçecekleri Sadece O Mekana Özeldir
        if (currentRoom === 'dostlar_kiraathanesi' && newRoom !== 'dostlar_kiraathanesi') {
            if (p.heldItem && p.heldItem !== 'none') {
                p.heldItem = 'none';
            }
            if (typeof showFloatingToast === 'function') {
                showFloatingToast('☕ Kıraathane içeceği mekana özeldir, masada bırakıldı.');
            }
        }

        // Oyun Masalarından Ayrılma: Kafe veya Kıraathaneden çıkan oyuncu masadan temizce ayrılır
        if ((currentRoom === 'kafe' || currentRoom === 'dostlar_kiraathanesi') && newRoom !== currentRoom) {
            if (window.currentActiveTableId) {
                leaveCurrentTable();
            }
        }
    }

    socket.emit('changeRoom', newRoom);
    const fishBtn = document.getElementById('btnFishAction');
    if (fishBtn) fishBtn.style.display = 'none';



    updateSwanBoatButtonUI();

    const editBtn = document.getElementById('btnEditHouseFurniture');
    if (typeof updateHouseEditButtonVisibility === 'function') {
        updateHouseEditButtonVisibility();
    } else if (editBtn) {
        let isMyHouse = (newRoom && myUsername && newRoom === `house_${myUsername}`);
        editBtn.style.display = isMyHouse ? 'flex' : 'none';
    }

    if (typeof updateKulturBarsUI === 'function') {
        updateKulturBarsUI();
    }
}

// 🗺️ MEKANLAR AÇILIR MENÜSÜ KONTROLLERİ
window.togglePlacesMenu = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const menu = document.getElementById('placesDropdownMenu');
    if (menu) {
        const isShown = menu.style.display === 'flex' || menu.classList.contains('active');
        if (isShown) {
            menu.style.display = 'none';
            menu.classList.remove('active');
        } else {
            menu.style.display = 'flex';
            menu.classList.add('active');
        }
        const arrow = document.getElementById('placesArrow');
        if (arrow) arrow.style.transform = (menu.style.display === 'flex') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
};

window.selectPlace = function(place) {
    const menu = document.getElementById('placesDropdownMenu');
    if (menu) {
        menu.style.display = 'none';
        menu.classList.remove('active');
    }
    const arrow = document.getElementById('placesArrow');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (place === 'housing_portal') {
        if (typeof openHousingPortalModal === 'function') openHousingPortalModal();
        return;
    }
    if (typeof changeRoom === 'function') {
        changeRoom(place);
    }
};

// 🔍 EKRAN ZOOM / ÇÖZÜNÜRLÜK KONTROL SİSTEMİ
let currentGameZoom = 100;
try {
    const savedZoom = localStorage.getItem('mm_canvasZoom');
    if (savedZoom) {
        const parsed = parseInt(savedZoom, 10);
        if (!isNaN(parsed) && parsed >= 60 && parsed <= 220) {
            currentGameZoom = parsed;
        }
    }
} catch (e) {}

window.initGameZoom = function() {
    window.applyGameZoom(currentGameZoom, false);
    if (typeof window.applyInGameZoom === 'function') {
        window.applyInGameZoom(currentInGameZoom, false);
    }
};

window.toggleZoomMenu = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const menu = document.getElementById('zoomDropdownMenu');
    if (menu) {
        const isShown = menu.style.display === 'flex' || menu.classList.contains('active');
        if (isShown) {
            menu.style.display = 'none';
            menu.classList.remove('active');
        } else {
            // Mekanlar menüsü açıksa kapat
            const placesMenu = document.getElementById('placesDropdownMenu');
            if (placesMenu) {
                placesMenu.style.display = 'none';
                placesMenu.classList.remove('active');
                const placesArrow = document.getElementById('placesArrow');
                if (placesArrow) placesArrow.style.transform = 'rotate(0deg)';
            }
            menu.style.display = 'flex';
            menu.classList.add('active');
            syncZoomUI();
        }
        const arrow = document.getElementById('zoomArrow');
        if (arrow) arrow.style.transform = (menu.style.display === 'flex') ? 'rotate(180deg)' : 'rotate(0deg)';
    }
};

window.applyGameZoom = function(zoomPercent, save = true) {
    if (typeof zoomPercent === 'number' || typeof zoomPercent === 'string') {
        const num = parseInt(zoomPercent, 10);
        if (!isNaN(num)) {
            currentGameZoom = Math.max(60, Math.min(220, num));
        }
    }
    if (save) {
        try {
            localStorage.setItem('mm_canvasZoom', currentGameZoom);
        } catch (e) {}
    }

    const isGarden = currentRoom && (currentRoom.endsWith('_garden') || currentRoom.includes('_garden') || currentRoom === 'house_ornek_garden');
    const isWide = isGarden || (currentRoom === 'star_caddesi' || currentRoom === 'meydanv2' || currentRoom === 'dostlar_kiraathanesi' || currentRoom === 'sahilv2' || currentRoom === 'kafe' || currentRoom === 'sahil_yolu' || currentRoom === 'cadde2' || currentRoom === 'mine_cave' || (currentRoom && currentRoom.startsWith('kultur_merkezi_')) || currentRoom === 'avm_kat1' || currentRoom === 'avm_kat2' || (currentRoom && currentRoom.startsWith('avm_magaza_')) || currentRoom === 'pet_shop' || currentRoom === 'botanic_shop' || currentRoom === 'vip_club' || currentRoom === 'optik' || currentRoom === 'optika');
    const baseWidth = isWide ? 1000 : 800;
    const baseHeight = isWide ? 625 : 500;
    const scaledWidth = Math.round(baseWidth * (currentGameZoom / 100));
    if (canvas) {
        canvas.style.setProperty('width', scaledWidth + 'px', 'important');
        canvas.style.setProperty('height', 'auto', 'important');
        canvas.style.setProperty('max-width', '98vw');
        canvas.style.setProperty('aspect-ratio', baseWidth + ' / ' + baseHeight);
    }
    const bottomBar = document.getElementById('gameBottomControlBar');
    if (bottomBar) {
        bottomBar.style.setProperty('max-width', scaledWidth + 'px', 'important');
    }

    syncZoomUI();

    if (typeof updateCanvasRect === 'function') {
        updateCanvasRect();
    }
};

window.stepZoom = function(delta) {
    window.applyGameZoom(currentGameZoom + delta);
};

window.handleZoomSliderInput = function(val) {
    window.applyGameZoom(val);
};

window.fitZoomToScreen = function() {
    const isGarden = currentRoom && (currentRoom.endsWith('_garden') || currentRoom.includes('_garden') || currentRoom === 'house_ornek_garden');
    const isWide = isGarden || (currentRoom === 'star_caddesi' || currentRoom === 'meydanv2' || currentRoom === 'dostlar_kiraathanesi' || currentRoom === 'sahilv2' || currentRoom === 'kafe' || currentRoom === 'sahil_yolu' || currentRoom === 'cadde2' || currentRoom === 'mine_cave' || (currentRoom && currentRoom.startsWith('kultur_merkezi_')) || currentRoom === 'avm_kat1' || currentRoom === 'avm_kat2' || (currentRoom && currentRoom.startsWith('avm_magaza_')) || currentRoom === 'pet_shop' || currentRoom === 'botanic_shop' || currentRoom === 'vip_club' || currentRoom === 'optik' || currentRoom === 'optika');
    const baseWidth = isWide ? 1000 : 800;
    const baseHeight = isWide ? 625 : 500;
    const aspect = baseWidth / baseHeight;

    const topNav = document.querySelector('.top-nav');
    const bottomBar = document.getElementById('gameBottomControlBar');
    const topNavH = topNav ? (topNav.offsetHeight + 24) : 74;
    const bottomH = bottomBar ? (bottomBar.offsetHeight + 22) : 58;
    const extraPadding = 36;

    const maxAvailableWidth = window.innerWidth * 0.94;
    const maxAvailableHeight = Math.max(260, window.innerHeight - topNavH - bottomH - extraPadding);

    const widthFromHeight = maxAvailableHeight * aspect;
    const optimalWidth = Math.min(maxAvailableWidth, widthFromHeight);

    let targetZoom = Math.round(((optimalWidth / baseWidth) * 100) * 0.85);
    targetZoom = Math.round(targetZoom / 5) * 5;
    targetZoom = Math.max(60, Math.min(200, targetZoom));

    window.applyGameZoom(targetZoom);
};

function syncZoomUI() {
    const badge = document.getElementById('currentZoomBadge');
    if (badge) badge.textContent = currentGameZoom + '%';

    const stepVal = document.getElementById('zoomStepVal');
    if (stepVal) stepVal.textContent = currentGameZoom + '%';

    const sliderDisplay = document.getElementById('zoomSliderDisplay');
    if (sliderDisplay) sliderDisplay.textContent = currentGameZoom + '%';

    const rangeInput = document.getElementById('zoomRangeSlider');
    if (rangeInput && parseInt(rangeInput.value, 10) !== currentGameZoom) {
        rangeInput.value = currentGameZoom;
    }

    document.querySelectorAll('.zoom-preset-btn').forEach(btn => {
        const val = parseInt(btn.getAttribute('data-zoom'), 10);
        if (val === currentGameZoom) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 🔍 OYUN İÇİ (MODAL) ZOOM SİSTEMİ (Tüm Masa ve Mini Oyunlar)
let currentInGameZoom = 100;
try {
    const savedInGame = localStorage.getItem('mm_inGameZoom');
    if (savedInGame) {
        const val = parseInt(savedInGame, 10);
        if (!isNaN(val) && val >= 70 && val <= 160) {
            currentInGameZoom = val;
        }
    }
} catch (e) {}

window.applyInGameZoom = function(zoomPercent, save = true) {
    if (typeof zoomPercent === 'number' || typeof zoomPercent === 'string') {
        const num = parseInt(zoomPercent, 10);
        if (!isNaN(num)) {
            currentInGameZoom = Math.max(70, Math.min(160, num));
        }
    }
    if (save) {
        try {
            localStorage.setItem('mm_inGameZoom', currentInGameZoom);
        } catch (e) {}
    }

    const scaleVal = currentInGameZoom / 100;

    // A) DIŞ DİALOG PENCERELERİ (MODAL CONTAINERS) DAİMA 1:1 STANDART KALIR:
    // Böylece pencere pozisyonu, başlık çubuğu ve sürükleme koordinatları asla kaymaz / zıplamaz!
    const gameModal = document.getElementById('gameModal');
    if (gameModal) gameModal.style.zoom = '1';

    const amiralContent = document.getElementById('amiralBattiModalContent');
    if (amiralContent) amiralContent.style.zoom = '1';

    const xoxContent = document.getElementById('xoxModalContent');
    if (xoxContent) xoxContent.style.zoom = '1';

    const chessContent = document.getElementById('chessModalContent');
    if (chessContent) chessContent.style.zoom = '1';

    const bjContainer = document.querySelector('.blackjack-table-container');
    if (bjContainer) bjContainer.style.zoom = '1';

    const rouletteContainer = document.querySelector('.roulette-table-container');
    if (rouletteContainer) rouletteContainer.style.zoom = '1';

    // B) ZOOM DEĞERİ YALNIZCA OYUN İÇERİK GÖVDELERİNE (INNER BODY) UYGULANIR:
    // 1. Ana Oyun Masası Gövdesi (Batak, 101 Okey, Amerikan Bilardo, Tavla, Dost Kazığı)
    const gameBody = document.getElementById('gameModalBody');
    if (gameBody) {
        gameBody.style.zoom = scaleVal;
    }

    // 2. Canlı Blackjack 21 Çuha Masası
    const bjBody = document.getElementById('bjModalBody') || document.querySelector('.bj-felt-table');
    if (bjBody) {
        bjBody.style.zoom = scaleVal;
    }

    // 3. VIP Avrupa Ruleti Masası
    const rouletteBody = document.getElementById('rouletteModalBody') || document.querySelector('.roulette-main-area');
    if (rouletteBody) {
        rouletteBody.style.zoom = scaleVal;
    }

    // 4. Dede'nin Şimşek Slotu
    const slotBody = document.getElementById('slotModalBody') || document.querySelector('.slot-body');
    if (slotBody) {
        slotBody.style.zoom = scaleVal;
    }

    // 5. XOX Düello Gövdesi
    const xoxBody = document.getElementById('xoxModalBody');
    if (xoxBody) {
        xoxBody.style.zoom = scaleVal;
    }

    // 6. Amiral Battı Deniz Muharebesi Gövdesi (Radar ve HUD)
    const amiralBody = document.getElementById('amiralModalBody');
    if (amiralBody) {
        amiralBody.style.zoom = scaleVal;
    }

    // 7. Satranç Gövdesi (Tahta ve Saatler)
    const chessBody = document.getElementById('chessModalBody');
    if (chessBody) {
        chessBody.style.zoom = scaleVal;
    }

    // Tüm oyun içi rozetleri güncelle
    document.querySelectorAll('.ig-zoom-badge').forEach(badge => {
        badge.textContent = currentInGameZoom + '%';
    });
};

window.stepInGameZoom = function(delta) {
    window.applyInGameZoom(currentInGameZoom + delta);
};

window.resetInGameZoom = function() {
    window.applyInGameZoom(100);
};

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('placesDropdownMenu');
    const btn = document.getElementById('placesDropdownBtn');
    if (dropdown && (dropdown.style.display === 'flex' || dropdown.classList.contains('active'))) {
        if (!dropdown.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
            dropdown.style.display = 'none';
            dropdown.classList.remove('active');
            const arrow = document.getElementById('placesArrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    }

    const zoomDropdown = document.getElementById('zoomDropdownMenu');
    const zoomBtn = document.getElementById('zoomDropdownBtn');
    if (zoomDropdown && (zoomDropdown.style.display === 'flex' || zoomDropdown.classList.contains('active'))) {
        if (!zoomDropdown.contains(e.target) && e.target !== zoomBtn && !zoomBtn?.contains(e.target)) {
            zoomDropdown.style.display = 'none';
            zoomDropdown.classList.remove('active');
            const arrow = document.getElementById('zoomArrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    }
});

let swanBoatCountdownInterval = null;
let swanBoatSecondsLeft = 0;

function updateSwanBoatButtonUI() {
    const swanBtn = document.getElementById('btnSwanBoatAction');
    if (!swanBtn) return;
    swanBtn.style.display = (currentRoom === 'sahil' || currentRoom === 'sahilv2') ? 'flex' : 'none';
    if (swanBoatSecondsLeft > 0) {
        let m = Math.floor(swanBoatSecondsLeft / 60);
        let s = swanBoatSecondsLeft % 60;
        let timeStr = `${m}:${s < 10 ? '0' : ''}${s}`;
        if (players[myId] && players[myId].hasSwanBoat) {
            swanBtn.innerText = `🦢 Kuğudan İn (${timeStr})`;
            swanBtn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
        } else {
            swanBtn.innerText = `🦢 Kuğu'ya Bin (${timeStr})`;
            swanBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
        }
    } else {
        swanBtn.innerText = "🦢 Kuğu Kirala (20 TL)";
        swanBtn.style.background = "linear-gradient(135deg, #f43f5e, #be123c)";
    }
}

function handleRentSwanBoat() {
    if (swanBoatSecondsLeft > 0) {
        if (players[myId] && players[myId].hasSwanBoat) {
            // Kuğudan in
            socket.emit('toggle_swan_boat', { mounted: false });
            players[myId].hasSwanBoat = false;
            updateSwanBoatButtonUI();
            if (typeof showGanyanToast === 'function') showGanyanToast("🦢 Kuğu deniz bisikletinden indin.");
        } else {
            // Kuğu'ya bin
            if (players[myId] && players[myId].hasHorse) {
                alert("⚠️ Kuğu'ya binmek için önce attan inmelisiniz!");
                return;
            }
            socket.emit('toggle_swan_boat', { mounted: true });
            players[myId].hasSwanBoat = true;
            updateSwanBoatButtonUI();
            if (typeof showGanyanToast === 'function') showGanyanToast("🦢 Kuğu deniz bisikletine bindin!");
        }
    } else {
        // Kirala
        if (players[myId] && players[myId].hasHorse) {
            alert("⚠️ Binek atındayken Kuğu Deniz Bisikleti kiralayamazsınız! Önce attan inmelisiniz.");
            return;
        }
        socket.emit('rentSwanBoat');
    }
}

socket.on('playerSwanBoatUpdate', (data) => {
    if (players[data.id]) {
        players[data.id].hasSwanBoat = data.hasSwanBoat;
        if (data.id === myId) {
            updateSwanBoatButtonUI();
        }
    }
});

socket.on('swanBoatRented', (data) => {
    swanBoatSecondsLeft = (data && data.duration) ? data.duration : 300;
    if (swanBoatCountdownInterval) clearInterval(swanBoatCountdownInterval);
    updateSwanBoatButtonUI();
    swanBoatCountdownInterval = setInterval(() => {
        swanBoatSecondsLeft--;
        if (swanBoatSecondsLeft <= 0) {
            clearInterval(swanBoatCountdownInterval);
            swanBoatCountdownInterval = null;
            if (players[myId]) players[myId].hasSwanBoat = false;
        }
        updateSwanBoatButtonUI();
    }, 1000);
});

socket.on('swanBoatExpired', () => {
    if (swanBoatCountdownInterval) {
        clearInterval(swanBoatCountdownInterval);
        swanBoatCountdownInterval = null;
    }
    swanBoatSecondsLeft = 0;
    if (players[myId]) players[myId].hasSwanBoat = false;
    updateSwanBoatButtonUI();
});

// --- 5.1 & 5.2 & 5.3 MASA SEÇİMİ, LOBİ, RECONNECT, LİDERLİK TABLOSU & GÜNLÜK GÖREVLER ---
// (Modüler mimariye taşınmıştır: public/js/tableLobbyUI.js ve public/js/gameMenusUI.js)


// --- 5.4 GECE / GÜNDÜZ MODU ---
let isNightMode = false;
function toggleNightMode() {
    isNightMode = !isNightMode;
    if (typeof bgCache !== 'undefined') bgCache.invalidate();
    const toast = document.getElementById('reactionToast');
    if (toast) {
        toast.innerText = isNightMode ? "🌙 Gece Modu Açıldı" : "☀️ Gündüz Modu Açıldı";
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2000);
    }
}

// --- 5.5 MASA İÇİ REAKSİYONLAR & TEZAHÜRAT ---
function sendTableReaction(reactionText) {
    if (!window.currentActiveTableId) return;
    if (window.playSound) window.playSound('chatPop');
    socket.emit('tableReaction', { tableId: window.currentActiveTableId, reaction: reactionText });
}

socket.on('showReaction', (data) => {
    if (window.playSound) window.playSound('chatPop');
    const toast = document.getElementById('reactionToast');
    if (toast) {
        toast.innerText = `${data.sender}: ${data.text}`;
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 3000);
    }
});

// --- 5.6 SOSYAL KARAKTER HAREKETLERİ (Çay, Dans, El Salla, Alkış) ---
function triggerPlayerAction(action) {
    socket.emit('playerAction', { action: action });
    if (action === 'tea' && window.playSound) window.playSound('chatPop');
    else if (action === 'clap' && window.playSound) window.playSound('card');
}

function isWearingZombieCostume(player = myAvatar) {
    const costumeId = player && (player.costume || (player.outfit && player.outfit.startsWith('costume_') ? player.outfit : null));
    return typeof ZombieCostumeRenderer !== 'undefined' && ZombieCostumeRenderer.isCostume(costumeId);
}

let lastZombieAttackAt = 0;
function triggerZombieAttack() {
    if (!players[myId] || !isWearingZombieCostume(players[myId])) return;
    const now = Date.now();
    if (now - lastZombieAttackAt < 650) return;
    lastZombieAttackAt = now;
    socket.emit('zombieAttack');
}

socket.on('playerActionUpdate', (data) => {
    if (players[data.id]) {
        players[data.id].action = data.action;
        players[data.id].hasTea = data.hasTea;
    }
});

socket.on('zombieAnimationUpdate', (data) => {
    if (!data || !players[data.id]) return;
    Object.assign(players[data.id], {
        zombieAnimation: data.animation,
        zombieAnimationStartedAt: data.animationStartedAt,
        zombieAnimationUntil: data.animationUntil,
        zombieStunnedUntil: data.stunnedUntil,
        zombieHits: data.hits
    });
    if (data.stunnedUntil > Date.now()) {
        players[data.id].isMoving = false;
        players[data.id].isSprinting = false;
        players[data.id].vx = 0;
        players[data.id].vy = 0;
    }
});

// --- 5.7 TUR SÜRESİ GERİ SAYIM ÇUBUĞU ---
let turnTimerInterval = null;
function startTurnTimer(durationSec) {
    const container = document.getElementById('turnTimerContainer');
    const bar = document.getElementById('turnTimerBar');
    if (!container || !bar) return;

    container.style.display = 'block';
    bar.style.transition = 'none';
    bar.style.width = '100%';
    bar.style.backgroundColor = '#22c55e';
    bar.classList.remove('timer-urgent-pulse');

    if (turnTimerInterval) clearInterval(turnTimerInterval);

    let start = Date.now();
    let totalMs = (durationSec || 30) * 1000;
    let lastTickSec = -1;

    turnTimerInterval = setInterval(() => {
        let elapsed = Date.now() - start;
        let leftMs = Math.max(0, totalMs - elapsed);
        let leftRatio = Math.max(0, leftMs / totalMs);
        let leftSec = Math.ceil(leftMs / 1000);
        bar.style.width = (leftRatio * 100) + '%';

        if (leftSec <= 7 && leftSec > 0) {
            bar.style.backgroundColor = '#ef4444';
            bar.classList.add('timer-urgent-pulse');
            if (leftSec !== lastTickSec) {
                lastTickSec = leftSec;
                if (window.playSound) window.playSound('tick');
            }
        } else if (leftRatio > 0.5) {
            bar.style.backgroundColor = '#22c55e';
            bar.classList.remove('timer-urgent-pulse');
        } else if (leftRatio > 0.25) {
            bar.style.backgroundColor = '#f59e0b';
            bar.classList.remove('timer-urgent-pulse');
        } else {
            bar.style.backgroundColor = '#ef4444';
        }

        if (leftRatio <= 0) {
            bar.classList.remove('timer-urgent-pulse');
            clearInterval(turnTimerInterval);
            turnTimerInterval = null;
        }
    }, 100);
}

// --- 6. OYUN BAŞLATMA VE LOBİ ---
socket.on('startGame', (gameType) => {
    closeTableSelectModal();
    const statusEl = document.getElementById('modalStatus');
    if (statusEl) statusEl.innerText = 'Oyun başladı!';
    if (gameType === 'xox') {
        const gameModal = document.getElementById('gameModal');
        if (gameModal) gameModal.style.display = 'none';
        if (typeof openXoxModal === 'function') openXoxModal();
        return;
    }
    if (gameType === 'amiral') {
        const gameModal = document.getElementById('gameModal');
        if (gameModal) gameModal.style.display = 'none';
        if (typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
        return;
    }

    const modal = document.getElementById('gameModal');
    modal.style.display = 'block';

    // Modalı her açıldığında tekrar ortaya hizala
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.left = '50%';
    modal.style.top = '50%';

    const bArea = document.getElementById('billiardArea');
    const batakArea = document.getElementById('batakArea');
    const tavlaArea = document.getElementById('tavlaArea');
    const dkArea = document.getElementById('dostKazigiArea');
    const okeyArea = document.getElementById('okey101Area');

    if (bArea) bArea.style.display = 'none';
    if (batakArea) batakArea.style.display = 'none';
    if (tavlaArea) tavlaArea.style.display = 'none';
    if (dkArea) dkArea.style.display = 'none';
    if (okeyArea) okeyArea.style.display = 'none';

    if (gameType === 'billiard') {
        if (bArea) bArea.style.display = 'block';
    } else if (gameType === 'batak' || gameType === 'batak4') {
        if (batakArea) batakArea.style.display = 'block';
    } else if (gameType === 'tavla') {
        if (tavlaArea) tavlaArea.style.display = 'block';
    } else if (gameType === 'dost_kazigi' || gameType === 'dost_kazigi_3p') {
        if (dkArea) dkArea.style.display = 'block';
    } else if (gameType === 'okey101' || gameType === 'okey101_tekli') {
        if (okeyArea) okeyArea.style.display = 'block';
    }
    const lobbyBotBtn = document.getElementById('lobbyAddBotBtn');
    if (lobbyBotBtn) lobbyBotBtn.style.display = 'none';
});

socket.on('updateTableLobby', (data) => {
    if (!data) return;
    window.currentActiveTableId = data.tableId;
    window.currentActiveTableBet = data.bet || 0;
    const modal = document.getElementById('gameModal');
    if (modal) {
        modal.style.display = 'block';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.left = '50%';
        modal.style.top = '50%';
    }
    const statusEl = document.getElementById('modalStatus');
    if (statusEl) {
        statusEl.innerText = `Lobi: ${data.name} (${data.count}/${data.min} Oyuncu Bekleniyor)${data.bet > 0 ? ` [Bahis: ${data.bet} TL]` : ''}`;
    }
    const lobbyBotBtn = document.getElementById('lobbyAddBotBtn');
    if (lobbyBotBtn) {
        // Bahisli masalara oyun başında bot eklenemez; yalnızca ücretsiz masalarda görünür
        lobbyBotBtn.style.display = (data.count < data.min && (!data.bet || data.bet === 0)) ? 'inline-block' : 'none';
    }
});

socket.on('gameError', (msg) => {
    const errToast = document.getElementById('errorToast');
    if (errToast) {
        errToast.innerText = msg;
        errToast.style.display = 'block';
        setTimeout(() => { errToast.style.display = 'none'; }, 3500);
    }
    if (typeof showSocialNotificationToast === 'function') {
        showSocialNotificationToast('⚠️', 'Uyarı', msg);
    }
});

function resetAllTableUIs() {
    window.isSpectating = false;
    window.currentActiveTableId = null;
    window.currentActiveTableBet = 0;
    if (window.leaveTableVoiceChat) window.leaveTableVoiceChat();
    const lobbyBotBtn = document.getElementById('lobbyAddBotBtn');
    if (lobbyBotBtn) lobbyBotBtn.style.display = 'none';
    if (turnTimerInterval) { clearInterval(turnTimerInterval); turnTimerInterval = null; }
    const tContainer = document.getElementById('turnTimerContainer');
    if (tContainer) tContainer.style.display = 'none';
    const gModal = document.getElementById('gameModal');
    if (gModal) {
        gModal.style.display = 'none';
        gModal.style.transform = 'translate(-50%, -50%)';
        gModal.style.left = '50%';
        gModal.style.top = '50%';
        gModal.style.animation = '';
    }
    const xoxModal = document.getElementById('xoxModal');
    if (xoxModal) xoxModal.style.display = 'none';
    const amiralModal = document.getElementById('amiralBattiModal');
    if (amiralModal) amiralModal.style.display = 'none';
    const chessModal = document.getElementById('chessModal');
    if (chessModal) chessModal.style.display = 'none';
    const bArea = document.getElementById('billiardArea');
    if (bArea) bArea.style.display = 'none';
    const batakArea = document.getElementById('batakArea');
    if (batakArea) batakArea.style.display = 'none';
    const tavlaArea = document.getElementById('tavlaArea');
    if (tavlaArea) tavlaArea.style.display = 'none';
    const okeyArea = document.getElementById('okey101Area');
    if (okeyArea) okeyArea.style.display = 'none';
    const dkArea = document.getElementById('dostKazigiArea');
    if (dkArea) dkArea.style.display = 'none';
    const banner = document.getElementById('spectatorBanner');
    if (banner) banner.style.display = 'none';
    if (window.closeVoidHandModal) window.closeVoidHandModal();
    const bOverlay = document.getElementById('billiardRematchOverlay');
    if (bOverlay) bOverlay.style.display = 'none';
    const batakYazboz = document.getElementById('batakYazbozModal');
    if (batakYazboz) batakYazboz.style.display = 'none';
    const fundsModal = document.getElementById('insufficientFundsModal');
    if (fundsModal) fundsModal.style.display = 'none';
    const leaveModal = document.getElementById('gameLeaveConfirmModal');
    if (leaveModal) leaveModal.style.display = 'none';
    const tavlaOrientModal = document.getElementById('tavlaOrientationModal');
    if (tavlaOrientModal) tavlaOrientModal.style.display = 'none';
    const dock = document.getElementById('minimizedGameDock');
    if (dock) dock.style.display = 'none';
    window.activeMinimizedGame = null;
}
window.resetAllTableUIs = resetAllTableUIs;

window.activeMinimizedGame = null;

function getOpenGameModal() {
    const xox = document.getElementById('xoxModal');
    if (xox && xox.style.display !== 'none' && xox.style.display !== '') {
        return { id: 'xoxModal', type: 'flex', name: '❌ XOX Düellosu' };
    }
    const amiral = document.getElementById('amiralBattiModal');
    if (amiral && amiral.style.display !== 'none' && amiral.style.display !== '') {
        return { id: 'amiralBattiModal', type: 'flex', name: '⚓ Amiral Battı' };
    }
    const chess = document.getElementById('chessModal');
    if (chess && chess.style.display !== 'none' && chess.style.display !== '') {
        return { id: 'chessModal', type: 'flex', name: '♟️ Satranç' };
    }
    const game = document.getElementById('gameModal');
    if (game && game.style.display !== 'none' && game.style.display !== '') {
        const titleEl = document.getElementById('modalTitle');
        const title = (titleEl && titleEl.innerText) ? titleEl.innerText.trim() : '🎮 Oyun Masası';
        return { id: 'gameModal', type: (game.style.display === 'flex' ? 'flex' : 'block'), name: title };
    }
    return null;
}
window.getOpenGameModal = getOpenGameModal;

function minimizeCurrentGame() {
    const openGame = getOpenGameModal();
    if (!openGame) return;

    window.activeMinimizedGame = openGame;
    const modalEl = document.getElementById(openGame.id);
    if (modalEl) modalEl.style.display = 'none';

    const dock = document.getElementById('minimizedGameDock');
    const dockTitle = document.getElementById('minimizedGameTitle');
    if (dockTitle) dockTitle.innerText = openGame.name;
    if (dock) dock.style.display = 'flex';

    if (typeof showFloatingToast === 'function') {
        showFloatingToast(`🎮 ${openGame.name} alta alındı.`);
    }
}
window.minimizeCurrentGame = minimizeCurrentGame;

function restoreMinimizedGame() {
    const dock = document.getElementById('minimizedGameDock');
    if (dock) dock.style.display = 'none';

    if (window.activeMinimizedGame) {
        const modalEl = document.getElementById(window.activeMinimizedGame.id);
        if (modalEl) {
            modalEl.style.display = window.activeMinimizedGame.type || 'flex';
        }
        window.activeMinimizedGame = null;
    } else {
        const gModal = document.getElementById('gameModal');
        if (gModal && window.currentActiveTableId) {
            gModal.style.display = 'block';
        }
    }
}
window.restoreMinimizedGame = restoreMinimizedGame;

function promptLeaveCurrentGame() {
    const leaveModal = document.getElementById('gameLeaveConfirmModal');
    if (leaveModal) {
        leaveModal.style.display = 'flex';
    }
}
window.promptLeaveCurrentGame = promptLeaveCurrentGame;

function closeLeaveConfirmModal() {
    const leaveModal = document.getElementById('gameLeaveConfirmModal');
    if (leaveModal) {
        leaveModal.style.display = 'none';
    }
}
window.closeLeaveConfirmModal = closeLeaveConfirmModal;

function confirmLeaveCurrentGame() {
    closeLeaveConfirmModal();

    if (window.activeMinimizedGame) {
        const modalEl = document.getElementById(window.activeMinimizedGame.id);
        if (modalEl) modalEl.style.display = 'none';
        window.activeMinimizedGame = null;
    }
    const dock = document.getElementById('minimizedGameDock');
    if (dock) dock.style.display = 'none';

    if (typeof closeXoxModal === 'function') closeXoxModal();
    if (typeof closeAmiralBattiModal === 'function') closeAmiralBattiModal();

    leaveCurrentTable();
}
window.confirmLeaveCurrentGame = confirmLeaveCurrentGame;

function closeTopmostGeneralModal() {
    const isVisible = (id) => {
        const el = document.getElementById(id);
        return el && el.style.display !== 'none' && el.style.display !== '';
    };

    if (isVisible('wardrobeModal')) { if (typeof closeWardrobe === 'function') closeWardrobe(); return true; }
    if (isVisible('itemInventoryModal')) { if (typeof closeItemInventoryModal === 'function') closeItemInventoryModal(); return true; }
    if (isVisible('playerInteractionModal')) { if (typeof closePlayerInteractionModal === 'function') closePlayerInteractionModal(); return true; }
    if (isVisible('sendMoneyModal')) { if (typeof closeSendMoneyModal === 'function') closeSendMoneyModal(); return true; }
    if (isVisible('giftItemModal')) { if (typeof closeGiftItemModal === 'function') closeGiftItemModal(); return true; }
    if (isVisible('onlinePlayersModal')) { if (typeof closeOnlinePlayersModal === 'function') closeOnlinePlayersModal(); return true; }
    if (isVisible('friendsListModal')) { if (typeof closeFriendsListModal === 'function') closeFriendsListModal(); return true; }
    if (isVisible('dailyQuestsModal')) { if (typeof closeDailyQuestsModal === 'function') closeDailyQuestsModal(); return true; }
    if (isVisible('realEstateModal')) { if (typeof closeRealEstateModal === 'function') closeRealEstateModal(); return true; }
    if (isVisible('maketInspectModal')) { if (typeof closeMaketInspectModal === 'function') closeMaketInspectModal(); return true; }
    if (isVisible('houseConfirmModal')) { if (typeof closeHouseConfirmModal === 'function') closeHouseConfirmModal(); return true; }
    if (isVisible('furnitureMarketModal')) { if (typeof closeFurnitureMarketModal === 'function') closeFurnitureMarketModal(); return true; }
    if (isVisible('housingPortalModal')) { if (typeof closeHousingPortalModal === 'function') closeHousingPortalModal(); return true; }
    if (isVisible('tableSelectModal')) { if (typeof closeTableSelectModal === 'function') closeTableSelectModal(); return true; }
    if (isVisible('leaderboardModal')) { if (typeof closeLeaderboardModal === 'function') closeLeaderboardModal(); return true; }
    if (isVisible('petShopModal')) { if (typeof closePetShopModal === 'function') closePetShopModal(); return true; }
    if (isVisible('petNurseryModal')) { if (typeof closePetNurseryModal === 'function') closePetNurseryModal(); return true; }
    if (isVisible('petPolaroidModal')) { if (typeof closePetPolaroidModal === 'function') closePetPolaroidModal(); return true; }
    if (isVisible('petWardrobeModal')) { if (typeof closePetWardrobeModal === 'function') closePetWardrobeModal(); return true; }
    if (isVisible('petVetModal')) { if (typeof closePetVetModal === 'function') closePetVetModal(); return true; }
    if (isVisible('petBreedingModal')) { if (typeof closePetBreedingModal === 'function') closePetBreedingModal(); return true; }
    if (isVisible('petDerbyModal')) { if (typeof closePetDerbyModal === 'function') closePetDerbyModal(); return true; }
    if (isVisible('petGardenModal')) { if (typeof closePetGardenModal === 'function') closePetGardenModal(); return true; }
    if (isVisible('adminPanelModal')) { if (typeof closeAdminPanelModal === 'function') closeAdminPanelModal(); return true; }
    if (isVisible('changePasswordModal')) { if (typeof closeChangePasswordModal === 'function') closeChangePasswordModal(); return true; }
    if (isVisible('settingsModal')) { if (typeof closeSettingsModal === 'function') closeSettingsModal(); return true; }
    if (isVisible('mysteryBoxRewardModal')) { if (typeof closeMysteryBoxRewardModal === 'function') closeMysteryBoxRewardModal(); return true; }
    if (isVisible('ganyanKuponModal')) { if (typeof closeGanyanKuponModal === 'function') closeGanyanKuponModal(); return true; }
    if (isVisible('blackjackModal')) { if (typeof closeBlackjackModal === 'function') closeBlackjackModal(); return true; }
    if (isVisible('rouletteModal')) { if (typeof closeRouletteModal === 'function') closeRouletteModal(); return true; }
    if (isVisible('slotModal')) { if (typeof closeSlotModal === 'function') closeSlotModal(); return true; }
    if (isVisible('kiraathaneBarModal')) { if (typeof closeKiraathaneBarModal === 'function') closeKiraathaneBarModal(); return true; }
    if (isVisible('cocktailBarModal')) { if (typeof closeCocktailBarModal === 'function') closeCocktailBarModal(); return true; }
    if (isVisible('nargileMenuModal')) { if (typeof closeNargileMenuModal === 'function') closeNargileMenuModal(); return true; }
    if (isVisible('nargileCoalsModal')) { if (typeof closeNargileCoalsModal === 'function') closeNargileCoalsModal(); return true; }
    if (isVisible('batakYazbozModal')) { if (typeof closeBatakYazbozModal === 'function') closeBatakYazbozModal(); return true; }
    if (isVisible('okey101YazbozModal')) { if (typeof closeYazbozModal === 'function') closeYazbozModal(); return true; }
    if (isVisible('vipClubEntryModal')) { if (typeof closeVipClubEntryModal === 'function') closeVipClubEntryModal(); return true; }
    if (isVisible('tekinsizTekinModal')) { if (typeof closeTekinsizTekinModal === 'function') closeTekinsizTekinModal(); return true; }

    return false;
}
window.closeTopmostGeneralModal = closeTopmostGeneralModal;

function closeGameModalOnly() {
    minimizeCurrentGame();
}
window.closeGameModalOnly = closeGameModalOnly;

function leaveCurrentTable() {
    if (socket) {
        if (window.currentActiveTableId) {
            socket.emit('closeTable', { tableId: window.currentActiveTableId });
        }
        socket.emit('leaveTable');
    }
    window.currentActiveTableId = null;
    resetAllTableUIs();
    if (typeof showFloatingToast === 'function') {
        showFloatingToast('🚪 Masadan ayrıldınız.');
    }
}
window.leaveCurrentTable = leaveCurrentTable;

socket.on('opponentLeft', (data) => {
    let msg = (data && data.message) ? data.message : "Rakip masadan ayrıldı";
    if (typeof showSocialNotificationToast === 'function') {
        showSocialNotificationToast('⚠️', 'Masa Kapatıldı', msg);
    } else if (typeof showFloatingToast === 'function') {
        showFloatingToast(`⚠️ ${msg}`);
    }
    resetAllTableUIs();
});

socket.on('tableLeft', () => {
    window.currentActiveTableId = null;
    resetAllTableUIs();
});

socket.on('tableClosed', (data) => {
    let closedId = typeof data === 'object' ? data?.tableId : data;
    if (!closedId || (window.currentActiveTableId && window.currentActiveTableId === closedId)) {
        window.currentActiveTableId = null;
        resetAllTableUIs();
    }
    const tableSelectModal = document.getElementById('tableSelectModal');
    if (tableSelectModal && tableSelectModal.style.display === 'flex' && window.currentSelectedBaseType && socket) {
        socket.emit('requestTableOptions', window.currentSelectedBaseType);
    }
});

socket.on('kiraathaneDrinkCleared', () => {
    if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) {
        players[myId].heldItem = 'none';
    }
    if (typeof showFloatingToast === 'function') {
        showFloatingToast('☕ Kıraathane içecekleri sadece o mekana özeldir, masada bırakıldı.');
    }
});

socket.on('insufficientFundsWarning', (data) => {
    const modal = document.getElementById('insufficientFundsModal');
    const msgEl = document.getElementById('insufficientFundsMsg');
    if (msgEl && data && data.message) {
        msgEl.innerText = data.message;
    }
    if (modal) modal.style.display = 'flex';
    if (window.playSound) window.playSound('denied');
});

function closeInsufficientFundsModal() {
    const modal = document.getElementById('insufficientFundsModal');
    if (modal) modal.style.display = 'none';
    leaveCurrentTable();
}
window.closeInsufficientFundsModal = closeInsufficientFundsModal;

function goToFreeTables() {
    const modal = document.getElementById('insufficientFundsModal');
    if (modal) modal.style.display = 'none';
    leaveCurrentTable();
    if (typeof showSocialNotificationToast === 'function') {
        showSocialNotificationToast('🆓', 'Ücretsiz Masalar', 'Masa menüsünden 0 TL bahisli ücretsiz masaları seçebilirsiniz.');
    }
}
window.goToFreeTables = goToFreeTables;


// --- 7. MOUSE VE HOVER TAKİBİ (SIFIR DESYNC VE TAM ZOOM HİZALAMASI) ---
let canvasMouseX = -1, canvasMouseY = -1;
let hoveredTableId = null;
let cachedCanvasRect = null;

function updateCanvasRect() {
    if (canvas) cachedCanvasRect = canvas.getBoundingClientRect();
}
window.updateCanvasRect = updateCanvasRect;
window.addEventListener('resize', updateCanvasRect);
window.addEventListener('scroll', updateCanvasRect, { passive: true });
window.addEventListener('orientationchange', updateCanvasRect);

// Herhangi bir zoom, border veya ölçeklendirmede canvasın tam piksel koordinatını hesaplar (Dokunmatik & Mouse Hibrit)
function getCanvasEventCoords(e) {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    cachedCanvasRect = rect;
    const borderLeft = canvas.clientLeft || 0;
    const borderTop = canvas.clientTop || 0;
    const clientW = canvas.clientWidth || (rect.width - borderLeft * 2);
    const clientH = canvas.clientHeight || (rect.height - borderTop * 2);
    let clientX = e.clientX;
    let clientY = e.clientY;
    if (clientX === undefined && e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (clientX === undefined && e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    }
    clientX = Number(clientX) || 0;
    clientY = Number(clientY) || 0;
    const clickX = ((clientX - rect.left - borderLeft) / (clientW || 1)) * canvas.width;
    const clickY = ((clientY - rect.top - borderTop) / (clientH || 1)) * canvas.height;
    return { x: clickX, y: clickY };
}
window.getCanvasEventCoords = getCanvasEventCoords;

// --- JAMMER VE OYUN İÇİ NON-POPUP BİLDİRİM YÖNETİCİSİ ---
let jammerTimerInterval = null;

function showGameNotificationText(msg, durationMs = 5000) {
    const bar = document.getElementById('gameNotificationTextBar');
    const content = document.getElementById('gameNotificationTextContent');
    if (!bar || !content) return;
    content.innerHTML = msg;
    bar.style.display = 'block';
    bar.style.opacity = '1';
    bar.style.transform = 'translateX(-50%) translateY(0)';
    if (window._gameNotifTimeout) clearTimeout(window._gameNotifTimeout);
    window._gameNotifTimeout = setTimeout(() => {
        bar.style.opacity = '0';
        bar.style.transform = 'translateX(-50%) translateY(-10px)';
        setTimeout(() => { bar.style.display = 'none'; }, 400);
    }, durationMs);
}
window.showGameNotificationText = showGameNotificationText;

function openJammerBlockedModal(expiresAt) {
    window.myJammerExpiresAt = expiresAt;
    const modal = document.getElementById('jammerBlockedModal');
    const timerEl = document.getElementById('jammerCountdownTimer');
    if (!modal) return;
    modal.style.display = 'flex';

    if (jammerTimerInterval) clearInterval(jammerTimerInterval);

    function updateJammerTimer() {
        const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
        const min = Math.floor(remaining / 60);
        const sec = remaining % 60;
        if (timerEl) {
            timerEl.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
        }
        if (remaining <= 0) {
            clearInterval(jammerTimerInterval);
            jammerTimerInterval = null;
            window.myJammerExpiresAt = 0;
            closeJammerBlockedModal();
            showGameNotificationText("✅ Sinyaliniz yeniden bağlandı! Konuşabilir ve mikrofon kullanabilirsiniz.");
        }
    }
    updateJammerTimer();
    jammerTimerInterval = setInterval(updateJammerTimer, 1000);

    // Mikrofonu ve sesli sohbeti derhal sonlandır
    if (typeof leaveTableVoiceChat === 'function') {
        leaveTableVoiceChat();
    }
}
window.openJammerBlockedModal = openJammerBlockedModal;

function closeJammerBlockedModal() {
    if (typeof jammerTimerInterval !== 'undefined' && jammerTimerInterval) {
        clearInterval(jammerTimerInterval);
        jammerTimerInterval = null;
    }
    const modal = document.getElementById('jammerBlockedModal');
    if (modal) modal.style.display = 'none';
}
window.closeJammerBlockedModal = closeJammerBlockedModal;

canvas.addEventListener('mousemove', (e) => {
    let coords = getCanvasEventCoords(e);
    canvasMouseX = coords.x;
    canvasMouseY = coords.y;

    if (currentRoom === 'sahil') {
        let isVendorHover = (canvasMouseX >= 90 && canvasMouseX <= 175 && canvasMouseY >= 145 && canvasMouseY <= 235);
        let isBarHover = (canvasMouseX >= 645 && canvasMouseX <= 785 && canvasMouseY >= 385 && canvasMouseY <= 475);
        let isWaterHover = (canvasMouseX < 560 || canvasMouseY < 320);
        let isExitHover = (canvasMouseX >= canvas.width - 66 && canvasMouseY >= 210 && canvasMouseY <= 310);
        if (isVendorHover || isBarHover || isWaterHover || isExitHover) {
            setGameCursor('pointer');
        } else {
            setGameCursor('default');
        }
    } else if (currentRoom === 'nargile_cafe') {
        let isOverTekli = (canvasMouseX >= 145 && canvasMouseX <= 365 && canvasMouseY >= 160 && canvasMouseY <= 360);
        let isOverEsli = (canvasMouseX >= 435 && canvasMouseX <= 655 && canvasMouseY >= 160 && canvasMouseY <= 360);
        let isOverExit = (canvasMouseX >= canvas.width / 2 - 45 && canvasMouseX <= canvas.width / 2 + 45 && canvasMouseY >= canvas.height - 75 && canvasMouseY <= canvas.height - 5);
        let isOverKitchen = (canvasMouseX >= canvas.width - 115 && canvasMouseX <= canvas.width - 10 && canvasMouseY >= canvas.height - 75 && canvasMouseY <= canvas.height - 5);
        let isOverSolLoca = (canvasMouseX >= 25 && canvasMouseX <= 215 && canvasMouseY >= 50 && canvasMouseY <= 175);
        let isOverSagLoca = (canvasMouseX >= 585 && canvasMouseX <= 775 && canvasMouseY >= 50 && canvasMouseY <= 175);
        if (isOverTekli || isOverEsli || isOverExit || isOverKitchen || isOverSolLoca || isOverSagLoca) {
            setGameCursor('pointer');
        } else {
            setGameCursor('default');
        }
    } else if (currentRoom === 'market') {
        setGameCursor('pointer');
    } else if (currentRoom === 'pet_shop') {
        const isInteractive = (canvasMouseX >= 710 && canvasMouseX <= 965 && canvasMouseY >= 160 && canvasMouseY <= 315)
            || (canvasMouseX >= 40 && canvasMouseX <= 255 && canvasMouseY >= 360 && canvasMouseY <= 505)
            || (canvasMouseX >= 350 && canvasMouseX <= 650 && canvasMouseY >= 570);
        setGameCursor(isInteractive ? 'pointer' : 'default');
    }
});

canvas.addEventListener('mouseleave', () => {
    canvasMouseX = -1;
    canvasMouseY = -1;
    setGameCursor('default');
});

// Kafedeki masaların koordinatları (VIP Ferah Salon & Genişletilmiş Açık Koridor Düzeni)
// (Batak ve Gömmeli Batak masaları Dostlar Kıraathanesi'ne taşınmıştır)
const cafeTables = [
    { id: 'billiard', x: 80, y: 145, w: 175, h: 95, name: '8-Ball Bilardo' },
    { id: 'tavla', x: 110, y: 370, w: 115, h: 82, name: 'Geleneksel Tavla' },
    { id: 'xox', x: 315, y: 180, w: 95, h: 80, name: 'XOX Düellosu' },
    { id: 'amiral', x: 590, y: 180, w: 100, h: 80, name: 'Amiral Battı' },
    { id: 'chess', x: 780, y: 175, w: 110, h: 82, name: 'Satranç Masası' }
];

// Dedenin Yeri Kumarhanesindeki Canlı Masalar
const casinoTables = [
    { id: 'blackjack', x: 310, y: 155, w: 180, h: 135, name: 'Canlı Blackjack 21' }
];

// Akıcı Tap-to-Walk ve Dokunma Efektleri
let targetWalkPos = null;
let tapRipples = [];
let lastCanvasTapTime = 0;

window.stopPlayerWalking = function() {
    targetWalkPos = null;
    if (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) {
        players[myId].isMoving = false;
        players[myId].vx = 0;
        players[myId].vy = 0;
    }
};

// --- 7.5 KOLTUĞA, SANDALYEYE, TABUREYE VE BANKA OTURMA MEKANİĞİ ---
function sitPlayerAt(seatX, seatY, facing = 'down') {
    if (!players[myId]) return;

    // Kullanıcı Talebi: "sandalyeye oturduğumuzda otomatik attan inmiş olalım."
    if (players[myId].hasHorse) {
        if (typeof dismountHorseAutoOnSit === 'function') {
            dismountHorseAutoOnSit();
        }
    }

    myFacing = facing;
    players[myId].x = seatX;
    players[myId].y = seatY;
    players[myId].facing = facing;
    players[myId].action = 'sitting';
    keys.w = false; keys.a = false; keys.s = false; keys.d = false;
    targetWalkPos = null;
    socket.emit('playerMovement', { x: seatX, y: seatY, facing: facing });
    socket.emit('playerAction', { action: 'sitting' });
    if (typeof showFloatingIcon === 'function') {
        showFloatingIcon(myId, '🛋️');
    }

    // Nargile mekanında koltuğa oturunca sunucuya bildir ve menüyü aç
    if (currentRoom === 'nargile_cafe') {
        let tId = null, sIdx = 0;
        // Sol Üst Loca Koltukları (x: 30..220, y: 55..170)
        if (seatX <= 220 && seatY <= 170) {
            tId = 'lounge_sol';
            sIdx = (seatY < 100 ? (seatX < 135 ? 0 : 1) : (seatY < 135 ? 2 : 3));
            socket.emit('nargile_sit_table', { tableId: tId, seatIndex: sIdx });
            if (typeof window.checkAndOpenNargileMenu === 'function') {
                window.checkAndOpenNargileMenu(tId);
            }
        }
        // Sağ Üst Loca Koltukları (x: 585..775, y: 55..170)
        else if (seatX >= 585 && seatY <= 170) {
            tId = 'lounge_sag';
            sIdx = (seatY < 100 ? (seatX < 670 ? 0 : 1) : (seatY < 135 ? 2 : 3));
            socket.emit('nargile_sit_table', { tableId: tId, seatIndex: sIdx });
            if (typeof window.checkAndOpenNargileMenu === 'function') {
                window.checkAndOpenNargileMenu(tId);
            }
        }
        // NOT: 101 Okey masalarına oturunca nargile menüsü AÇILMAZ! 101 masaları sadece oyun içindir.
    }
}

function standUpIfSitting(intendedDir = null) {
    if (!players[myId]) return;
    let p = players[myId];
    if (p.action === 'sitting' || p.action === 'sit_floor') {
        const wasFloor = (p.action === 'sit_floor');
        p.action = null;
        socket.emit('playerAction', { action: 'stand' });
        if (currentRoom === 'nargile_cafe') {
            socket.emit('nargile_stand_table');
        }

        if (wasFloor) return;
        // Koltuktan/sandalyeden kalkarken katı çarpışma kutusunun dışına güvenli adım at
        let stepDist = 32;
        let testDirs = [];
        if (intendedDir === 'up') testDirs = [{ dx: 0, dy: -stepDist }, { dx: 0, dy: stepDist }, { dx: -stepDist, dy: 0 }, { dx: stepDist, dy: 0 }];
        else if (intendedDir === 'left') testDirs = [{ dx: -stepDist, dy: 0 }, { dx: 0, dy: stepDist }, { dx: stepDist, dy: 0 }, { dx: 0, dy: -stepDist }];
        else if (intendedDir === 'right') testDirs = [{ dx: stepDist, dy: 0 }, { dx: 0, dy: stepDist }, { dx: -stepDist, dy: 0 }, { dx: 0, dy: -stepDist }];
        else if (intendedDir === 'down') testDirs = [{ dx: 0, dy: stepDist }, { dx: -stepDist, dy: 0 }, { dx: stepDist, dy: 0 }, { dx: 0, dy: -stepDist }];
        else testDirs = [{ dx: 0, dy: stepDist }, { dx: 0, dy: -stepDist }, { dx: -stepDist, dy: 0 }, { dx: stepDist, dy: 0 }];

        let foundSafe = false;
        for (let td of testDirs) {
            let tx = p.x + td.dx;
            let ty = p.y + td.dy;
            if (!checkWorldCollision(tx, ty)) {
                p.x = tx;
                p.y = ty;
                foundSafe = true;
                break;
            }
        }
        if (!foundSafe) {
            for (let d of [24, 38, 48, 58]) {
                for (let td of testDirs) {
                    let scale = d / stepDist;
                    let tx = Math.round(p.x + td.dx * scale);
                    let ty = Math.round(p.y + td.dy * scale);
                    if (!checkWorldCollision(tx, ty)) {
                        p.x = tx;
                        p.y = ty;
                        foundSafe = true;
                        break;
                    }
                }
                if (foundSafe) break;
            }
        }

        socket.emit('playerMovement', { x: p.x, y: p.y, facing: myFacing });
    }
}

// --- 7.6 YAKINDAKİ KOLTUK, SANDALYE VEYA BANKI TESPİT ETME VE E TUŞU İLE OTURMA ---
// Fonksiyonlar ve koltuk listeleri modüler public/js/seatRegistry.js dosyasında yüksek performanslı ve sıfır-tahsisli olarak çalışır.
// Geriye dönük uyumluluk güvencesi:
var findNearestSittableSeat = (typeof window.findNearestSittableSeat === 'function') 
    ? window.findNearestSittableSeat 
    : function() { return null; };

var checkAndSitOnNearestFurnitureOrChair = (typeof window.checkAndSitOnNearestFurnitureOrChair === 'function') 
    ? window.checkAndSitOnNearestFurnitureOrChair 
    : function() { return false; };


// Eski click fonksiyonu geriye dönük uyumluluk için güvenli no-op / kontrol
function checkAndSitOnFurnitureOrChair(clickX, clickY) {
    return false;
}

function isAnyModalOpen() {
    const modalIds = [
        'gameModal', 'wardrobeModal', 'dressingRoomModal', 'settingsModal',
        'itemInventoryModal', 'playerInteractionModal', 'playerProfileModalBox',
        'petShopModal', 'optikaModal', 'furnitureMarketModal', 'botanicMarketModal',
        'kulturGiseModal', 'kulturBufeModal', 'kulturBillboardModal', 'barberShopModal',
        'housingPortalModal', 'realEstateModal', 'inGameAlertModal'
    ];
    for (let i = 0; i < modalIds.length; i++) {
        const el = document.getElementById(modalIds[i]);
        if (el && el.style.display !== 'none' && el.style.display !== '') return true;
    }
    return false;
}
window.isAnyModalOpen = isAnyModalOpen;

function handleCanvasTapOrClick(clickX, clickY) {
    if (isAnyModalOpen()) return;
    if (window.isFurnitureDragging) return;
    if (window.wasFurnitureDragged) {
        window.wasFurnitureDragged = false;
        return;
    }
    let now = Date.now();
    if (now - lastCanvasTapTime < 140) return;
    lastCanvasTapTime = now;

    // Dünya koordinatlarına çevir (Eğer kamera aktifse)
    let camX = (currentRoom === 'sanalika_cadde' && window.sanalikaCamera) ? window.sanalikaCamera.x : 0;
    let camY = (currentRoom === 'sanalika_cadde' && window.sanalikaCamera) ? window.sanalikaCamera.y : 0;
    let worldX = clickX + camX;
    let worldY = clickY + camY;

    // 1. ÖNCELİK: Başka bir oyuncunun üzerine tıklama kontrolü (Sosyal Etkileşim Menüsü)
    let clickedOtherPlayer = null;
    for (let id in players) {
        if (id === myId) continue;
        let p = players[id];
        let isWearingInvis = !!(p.outfit === 'costume_invisibility' || p.outfit === 'outfit_invisibility' || p.costume === 'costume_invisibility');
        let isInvis = !!isWearingInvis;
        if (isInvis) continue; // Görünmez oyunculara tıklanamaz ve profilleri açılamaz!
        let dist = Math.hypot(worldX - p.x, worldY - p.y);
        if (dist <= 26) {
            clickedOtherPlayer = { id, player: p };
            break;
        }
    }
    if (clickedOtherPlayer) {
        if (typeof openPlayerInteractionModal === 'function') {
            openPlayerInteractionModal(clickedOtherPlayer.id, clickedOtherPlayer.player);
        }
        return;
    }

    // 2. ÖNCELİK: Kendi üzerine tıklama kontrolü (Oturuyorsa ayağa kalk, ayaktaysa profil aç)
    if (players[myId]) {
        let myDist = Math.hypot(worldX - players[myId].x, worldY - players[myId].y);
        if (myDist <= 28) {
            if (players[myId].action === 'sitting' || players[myId].action === 'sit_floor') {
                standUpIfSitting();
            } else {
                if (typeof openMyPlayerProfile === 'function') {
                    openMyPlayerProfile();
                }
            }
            return;
        }
    }

    // 2.5 ÖNCELİK: Sandalye, Bank veya Koltuğa Tıklama Kontrolü (Tıklayarak Gidip Oturma)
    let findSeatFn = (typeof findSeatAtCoordinates === 'function') 
        ? findSeatAtCoordinates 
        : (typeof window.findSeatAtCoordinates === 'function' ? window.findSeatAtCoordinates : null);
    let clickedSeat = findSeatFn ? findSeatFn(worldX, worldY) : null;
    if (clickedSeat && players[myId]) {
        let myP = players[myId];
        // Halihazırda oturuyorsa önce ayağa kalk
        if (myP.action === 'sitting' || myP.action === 'sit_floor') {
            standUpIfSitting();
        }

        let distToSeat = Math.hypot(clickedSeat.x - myP.x, clickedSeat.y - myP.y);
        if (distToSeat <= 30) {
            // Zaten koltuğun hemen dibindeyse doğrudan otur
            sitPlayerAt(clickedSeat.x, clickedSeat.y, clickedSeat.facing);
            if (typeof openGameForSeat === 'function') {
                openGameForSeat(clickedSeat);
            }
            return;
        }

        // Koltuğa doğru yürü ve varınca otur
        targetWalkPos = {
            x: clickedSeat.x,
            y: clickedSeat.y,
            isSeatTarget: true,
            targetSeat: clickedSeat,
            onReach: () => {
                sitPlayerAt(clickedSeat.x, clickedSeat.y, clickedSeat.facing);
                if (typeof openGameForSeat === 'function') {
                    openGameForSeat(clickedSeat);
                }
            }
        };

        if (!tapRipples) tapRipples = [];
        tapRipples.push({ x: clickedSeat.x, y: clickedSeat.y, radius: 4, alpha: 1.0 });
        if (tapRipples.length > 5) tapRipples.shift();
        return;
    }

    // 3. Modüler Mekan Etkileşim Motoru (public/js/roomInteractions.js)
    if (typeof handleRoomInteractionClick === 'function') {
        let handled = handleRoomInteractionClick(worldX, worldY, currentRoom, players[myId], (currentRoom === 'sanalika_cadde' ? 1600 : canvas.width), (currentRoom === 'sanalika_cadde' ? 960 : canvas.height));
        if (handled) return;
    }

    // Geriye Dönük Uyumluluk ve Test Güvencesi:
    // (openXoxModal(), openAmiralBattiModal(), openBlackjackModal() referansları)
    if (currentRoom === 'kafe' && typeof cafeTables !== 'undefined') {
        cafeTables.forEach(obj => {
            if (clickX >= obj.x && clickX <= obj.x + obj.w && clickY >= obj.y && clickY <= obj.y + obj.h + 16) {
                if (obj.id === 'xox' && typeof openXoxModal === 'function') openXoxModal();
                else if (obj.id === 'amiral' && typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
                else if (obj.id === 'blackjack' && typeof openBlackjackModal === 'function') openBlackjackModal();
            }
        });
    }

    // 4. ZEMİNE TIKLAYARAK / DOKUNARAK YÜRÜME (TAP-TO-WALK)
    let clickAllowed = !window.movementSettings || window.movementSettings.clickEnabled !== false;
    if (!clickAllowed) {
        targetWalkPos = null;
        return;
    }

    if (players[myId]) {
        if (players[myId].action === 'sitting' || players[myId].action === 'sit_floor') {
            standUpIfSitting();
        }
        let targetX, targetY;
        if (currentRoom === 'sanalika_cadde') {
            targetX = Math.max(30, Math.min(1570, worldX));
            targetY = Math.max(45, Math.min(925, worldY));
        } else {
            targetX = Math.max(16, Math.min(canvas.width - 16, clickX));
            targetY = Math.max(38, Math.min(canvas.height - 20, clickY));
        }

        targetWalkPos = { x: targetX, y: targetY };
        if (!tapRipples) tapRipples = [];
        tapRipples.push({ x: targetX, y: targetY, radius: 4, alpha: 1.0 });
        if (tapRipples.length > 5) tapRipples.shift();
    }
}

canvas.addEventListener('pointerdown', (e) => {
    if (!e.isPrimary) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (isAnyModalOpen()) return;
    const coords = getCanvasEventCoords(e);
    handleCanvasTapOrClick(coords.x, coords.y);
});

// Tarayıcı yerel sürükleme ve seçim kutucuklarını (drag/select highlight) canvas üzerinde tamamen engelle
canvas.addEventListener('mousedown', (e) => {
    if (e.cancelable && e.button === 0) e.preventDefault();
});
canvas.addEventListener('dragstart', (e) => e.preventDefault());
canvas.addEventListener('selectstart', (e) => e.preventDefault());

// Global sayfa genelinde yeşil/mavi seçim çerçevelerini ve sürükleme hayaletlerini engelle
document.addEventListener('dragstart', (e) => {
    if (!e.target || !e.target.closest || !e.target.closest('[draggable="true"]')) {
        e.preventDefault();
    }
});
document.addEventListener('selectstart', (e) => {
    const tag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (tag !== 'input' && tag !== 'textarea' && !e.target.isContentEditable) {
        e.preventDefault();
    }
});

// Mobil tarayıcılarda canvas üzerinde kaydırma ve çekme (pull-to-refresh / rubber-banding) engeli
canvas.addEventListener('touchstart', (e) => {
    if (e.cancelable) e.preventDefault();
}, { passive: false });

// Mekana / Kapıya / Koridora Tıklayınca Yürüyüp Öyle Geçiş Yapma Motoru
function navigatePlayerToDoor(targetDoorX, targetDoorY, targetRoom, onReachAction) {
    if (typeof myId === 'undefined' || !players[myId]) {
        if (onReachAction) onReachAction();
        else if (targetRoom && typeof changeRoom === 'function') changeRoom(targetRoom);
        return;
    }
    let p = players[myId];
    if (p.action === 'sitting' && typeof standUpIfSitting === 'function') {
        standUpIfSitting();
    }
    let dist = Math.hypot(p.x - targetDoorX, p.y - targetDoorY);
    // Zaten kapının hemen yanındaysa beklemeden geç
    if (dist <= 28) {
        if (onReachAction) onReachAction();
        else if (targetRoom && typeof changeRoom === 'function') changeRoom(targetRoom);
        return;
    }

    targetWalkPos = {
        x: targetDoorX,
        y: targetDoorY,
        targetRoom: targetRoom,
        onReach: onReachAction,
        isVenueDoor: true
    };

    if (!tapRipples) tapRipples = [];
    tapRipples.push({ x: targetDoorX, y: targetDoorY, radius: 4, alpha: 1.0 });
    if (tapRipples.length > 5) tapRipples.shift();
}
window.navigatePlayerToDoor = navigatePlayerToDoor;


// --- 8. WASD VE 8 AÇILI İZOMETRİK YÖN KONTROLLERİ ---
let myFacing = 'down';
let walkCycle = 0;

function calculate8WayFacing(dx, dy) {
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return null;
    let angle = Math.atan2(dy, dx);
    let octant = Math.round(angle / (Math.PI / 4));
    if (octant < 0) octant += 8;
    octant = octant % 8;
    const directions = [
        'right',        // 0: 0 deg (E)   - Sağa
        'down-right',   // 1: 45 deg (SE) - Sağ İleri
        'down',         // 2: 90 deg (S)  - Öne
        'down-left',    // 3: 135 deg (SW) - Sol İleri
        'left',         // 4: 180 deg (W)  - Sola
        'up-left',      // 5: 225 deg (NW) - Sol Geri
        'up',           // 6: 270 deg (N)  - Arkaya
        'up-right'      // 7: 315 deg (NE) - Sağ Geri
    ];
    return directions[octant] || 'down';
}
window.calculate8WayFacing = calculate8WayFacing;

function update8WayFacingFromKeys() {
    let kx = (keys.d ? 1 : 0) - (keys.a ? 1 : 0);
    let ky = (keys.s ? 1 : 0) - (keys.w ? 1 : 0);
    if (kx !== 0 || ky !== 0) {
        let p = (typeof players !== 'undefined') ? players[myId] : null;
        let curModel = (p && p.model) || (typeof myAvatar !== 'undefined' && myAvatar.model) || 'classic_2';
        let isClassic = (curModel === 'classic');
        let isMountedNow = (typeof isMounted !== 'undefined' && isMounted) || (p && p.hasHorse) || (p && p.hasSwanBoat);
        let newFacing;
        if (isClassic && !isMountedNow) {
            // Nostaljik Klasik Model: 8'li dönme yok, sadece 4 ana yön
            if (kx !== 0 && ky === 0) newFacing = kx > 0 ? 'right' : 'left';
            else if (ky !== 0 && kx === 0) newFacing = ky > 0 ? 'down' : 'up';
            else {
                // Çapraz basıldığında klasik nostaljik yön: yatay yön (sağ / sol)
                newFacing = kx > 0 ? 'right' : 'left';
            }
        } else {
            newFacing = calculate8WayFacing(kx, ky);
        }
        if (newFacing) {
            myFacing = newFacing;
            if (p) {
                p.facing = newFacing;
            }
            standUpIfSitting(newFacing);
        }
    }
}

// --- AFK & ETKİLEŞİM TAKİBİ (Minimum 5 Dakika Hareketsizlik / Uyuklama Sistemi) ---
const AFK_IDLE_TIMEOUT_MS = 300000; // 5 dakika (300.000 ms)
let lastUserActivityTime = Date.now();

function recordUserActivity() {
    lastUserActivityTime = Date.now();
    if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) {
        let me = players[myId];
        if (me.action === 'afk') {
            me.action = null;
            if (typeof socket !== 'undefined' && socket && socket.connected) {
                socket.emit('playerAction', { action: 'stand' });
            }
        }
    }
}
window.recordUserActivity = recordUserActivity;

function checkAfkStatus() {
    if (typeof players === 'undefined' || typeof myId === 'undefined' || !players[myId]) return;
    let me = players[myId];
    if (!me.isMoving && me.action !== 'afk' && me.action !== 'sitting' && me.action !== 'dance') {
        if (Date.now() - lastUserActivityTime >= AFK_IDLE_TIMEOUT_MS) {
            me.action = 'afk';
            if (typeof socket !== 'undefined' && socket && socket.connected) {
                socket.emit('playerAction', { action: 'afk' });
            }
        }
    }
}

// Arka plan sekmelerinde de (rAF dursa bile) kesintisiz çalışması için periyodik kontrol (her 3 sn)
setInterval(checkAfkStatus, 3000);

['keydown', 'mousedown', 'touchstart', 'pointerdown'].forEach(evt => {
    window.addEventListener(evt, recordUserActivity, { passive: true });
});

// Alt+Tab veya pencere odak kaybında tuş takılmasını (Sticky Keys) önleme
window.addEventListener('blur', () => {
    keys.w = false;
    keys.a = false;
    keys.s = false;
    keys.d = false;
    keys.shift = false;
    targetWalkPos = null;
});

window.addEventListener('keydown', (e) => {
    // 1. ENTER TUŞU YÖNETİMİ
    if (e.key === 'Enter') {
        // Eğer son 300ms içinde chat'ten çıkılmışsa (boş Enter ile blur), tekrar chat'i açma!
        if (window.lastChatExitTime && (Date.now() - window.lastChatExitTime < 300)) {
            e.preventDefault();
            return;
        }

        // Oyun içi pop-up uyarı modalı açıksa Enter ile kapat
        const inGameAlert = document.getElementById('inGameAlertModal');
        if (inGameAlert && inGameAlert.style.display === 'flex') {
            e.preventDefault();
            if (typeof closeInGameAlert === 'function') closeInGameAlert();
            return;
        }

        // Masadan ayrılma onay modalı açıksa Enter ile onayla
        const leaveConfirmModal = document.getElementById('gameLeaveConfirmModal');
        if (leaveConfirmModal && leaveConfirmModal.style.display === 'flex') {
            e.preventDefault();
            confirmLeaveCurrentGame();
            return;
        }

        // Gardırop açıksa Enter ile Kaydet & Kapat
        const wardrobeModal = document.getElementById('wardrobeModal');
        if (wardrobeModal && wardrobeModal.style.display === 'flex') {
            e.preventDefault();
            if (typeof closeWardrobe === 'function') closeWardrobe();
            return;
        }

        // Şanslı kutu ödül modalı açıksa Enter ile kapat
        const mysteryBox = document.getElementById('mysteryBoxRewardModal');
        if (mysteryBox && mysteryBox.style.display === 'flex') {
            e.preventDefault();
            if (typeof closeMysteryBoxRewardModal === 'function') closeMysteryBoxRewardModal();
            return;
        }

        // Eğer kullanıcı bir yazı inputundaysa normal input davranışını bozma
        let activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || document.activeElement?.isContentEditable) {
            return;
        }

        // Açık tam ekran oyun masası veya kumarhane modalı varsa arka plandaki chat'e odaklanmayı engelle
        if (typeof getOpenGameModal === 'function' && getOpenGameModal()) return;
        const activeFullscreenModal = ['blackjackModal', 'rouletteModal', 'slotModal', 'ganyanKuponModal'].some(id => {
            const el = document.getElementById(id);
            return el && el.style.display !== 'none' && el.style.display !== '';
        });
        if (activeFullscreenModal) return;

        // Oyun modundayken Enter'a basıldı: CHAT'İ AÇ VE ODAKLAN!
        e.preventDefault();
        if (typeof openAndFocusChat === 'function') {
            openAndFocusChat();
        }
        return;
    }

    // 2. ESCAPE (ESC) TUŞU YÖNETİMİ
    if (e.key === 'Escape' || e.key === 'Esc') {
        // Oyun içi pop-up uyarı modalı açıksa Esc ile kapat
        const inGameAlert = document.getElementById('inGameAlertModal');
        if (inGameAlert && inGameAlert.style.display === 'flex') {
            e.preventDefault();
            if (typeof closeInGameAlert === 'function') closeInGameAlert();
            return;
        }

        // Masadan ayrılma onay modalı açıksa Esc ile iptal et / kapat
        const leaveConfirmModal = document.getElementById('gameLeaveConfirmModal');
        if (leaveConfirmModal && leaveConfirmModal.style.display === 'flex') {
            e.preventDefault();
            closeLeaveConfirmModal();
            return;
        }

        // Açık oyun masası/düellosu varsa ESC ile hiçbir şey sormadan oyunu alta al
        const openGame = getOpenGameModal();
        if (openGame) {
            e.preventDefault();
            minimizeCurrentGame();
            return;
        }

        // Açık emote menüsü varsa Esc ile kapat
        const emoteDropdown = document.getElementById('emoteDropdownMenu');
        if (emoteDropdown && emoteDropdown.style.display === 'flex') {
            e.preventDefault();
            emoteDropdown.style.display = 'none';
            const arrow = document.getElementById('emoteMenuArrow');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
            return;
        }

        // Genel pencereler/sekmeler açıksa (gardırop, eşya, vb.) sekmeyi kapat
        let closedAny = closeTopmostGeneralModal();
        if (closedAny) {
            e.preventDefault();
            return;
        }

        // Eğer bir input içerisindeyse odağı kaldır (blur)
        let activeTag = document.activeElement ? document.activeElement.tagName : '';
        if (['INPUT', 'TEXTAREA'].includes(activeTag)) {
            document.activeElement.blur();
            const canvas = document.getElementById('gameCanvas');
            if (canvas) canvas.focus();
            window.focus();
            return;
        }
    }

    let activeTag = document.activeElement ? document.activeElement.tagName : '';
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || document.activeElement?.isContentEditable) return;

    // 'C' Tuşu ile Oyun İçi veya Oyun Dışı Sesli Sohbeti Aç / Kapat / Konuş
    if (e.key === 'c' || e.key === 'C') {
        if (typeof toggleGlobalVoiceChat === 'function') {
            toggleGlobalVoiceChat();
        }
        return;
    }

    // Aktif oyun masası veya tam ekran pencereler açıkken arka planda karakterin yürümesini engelle
    let alertModal = document.getElementById('inGameAlertModal');
    if (alertModal && alertModal.style.display === 'flex') return;
    let gameModal = document.getElementById('gameModal');
    if (gameModal && gameModal.style.display === 'flex') return;
    let wardrobeModal = document.getElementById('wardrobeModal');
    if (wardrobeModal && wardrobeModal.style.display === 'flex') return;
    let ganyanModal = document.getElementById('ganyanKuponModal');
    if (ganyanModal && ganyanModal.style.display === 'flex') return;
    let bjModal = document.getElementById('blackjackModal');
    if (bjModal && bjModal.style.display === 'flex') return;
    let rouletteModal = document.getElementById('rouletteModal');
    if (rouletteModal && rouletteModal.style.display === 'flex') return;
    let slotModal = document.getElementById('slotModal');
    if (slotModal && slotModal.style.display === 'flex') return;
    let petShopMod = document.getElementById('petShopModal');
    if (petShopMod && petShopMod.style.display === 'flex') return;
    let petNursery = document.getElementById('petNurseryModal');
    if (petNursery && petNursery.style.display === 'flex') return;
    let petPolaroid = document.getElementById('petPolaroidModal');
    if (petPolaroid && petPolaroid.style.display === 'flex') return;
    let petWardrobe = document.getElementById('petWardrobeModal');
    if (petWardrobe && petWardrobe.style.display === 'flex') return;
    let petVet = document.getElementById('petVetModal');
    if (petVet && petVet.style.display === 'flex') return;
    let petBreeding = document.getElementById('petBreedingModal');
    if (petBreeding && petBreeding.style.display === 'flex') return;
    let petDerby = document.getElementById('petDerbyModal');
    if (petDerby && petDerby.style.display === 'flex') return;
    let petGarden = document.getElementById('petGardenModal');
    if (petGarden && petGarden.style.display === 'flex') return;

    if (e.key.toLowerCase() === 'f' && isWearingZombieCostume(players[myId])) {
        e.preventDefault();
        if (!e.repeat) triggerZombieAttack();
        return;
    }

    let wasdAllowed = !window.movementSettings || window.movementSettings.wasdEnabled !== false;
    if (wasdAllowed) {
        if (e.key === 'Shift') { keys.shift = true; }
        if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') { keys.w = true; targetWalkPos = null; }
        if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') { keys.a = true; targetWalkPos = null; }
        if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') { keys.s = true; targetWalkPos = null; }
        if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') { keys.d = true; targetWalkPos = null; }
        update8WayFacingFromKeys();
    }

    if (e.key === 'e' || e.key === 'E') {
        if (!e.repeat) triggerMobileInteract();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') keys.shift = false;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') keys.w = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') keys.a = false;
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') keys.s = false;
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') keys.d = false;
    update8WayFacingFromKeys();
});

function setKey(dir, isPressed) {
    let wasdAllowed = !window.movementSettings || window.movementSettings.wasdEnabled !== false;
    if (isPressed && !wasdAllowed) {
        keys[dir] = false;
        return;
    }
    keys[dir] = isPressed;
    update8WayFacingFromKeys();
    if (isPressed) targetWalkPos = null;
}

function handleTouchKey(dir, isPressed, event) {
    if (event && event.cancelable) event.preventDefault();
    if (isPressed && typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(10); } catch (e) { }
    }
    setKey(dir, isPressed);
}

// Mobil Etkileşim ("E" Tuşu) İşlevi
function triggerMobileInteract() {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate(20); } catch (e) { }
    }
    if (window.miningClient && typeof window.miningClient.handleMobileInteract === 'function') {
        if (window.miningClient.handleMobileInteract()) return;
    }
    if (!players[myId]) return;
    let p = players[myId];

    // 1. Zaten oturuyorsa E tuşuna basınca AYAĞA KALK
    if (p.action === 'sitting' || p.action === 'sit_floor') {
        const wasFloor = (p.action === 'sit_floor');
        standUpIfSitting();
        return;
    }

    // 2. Bir koltuk/sandalye/sedir/bank yakınındaysa E tuşu ile OTUR
    if (checkAndSitOnNearestFurnitureOrChair()) {
        return;
    }

    // 3. Modüler Yakınlık Etkileşim Yöneticisi (public/js/roomInteractions.js)
    if (typeof handleRoomMobileInteract === 'function') {
        let handled = handleRoomMobileInteract(p, currentRoom, canvas.width, canvas.height);
        if (handled) return;
    }

    // Geriye Dönük Uyumluluk ve Test Güvencesi:
    if (currentRoom === 'kafe' && typeof cafeTables !== 'undefined') {
        let nearest = null;
        let minDist = 120;
        cafeTables.forEach(t => {
            let cx = t.x + t.w / 2;
            let cy = t.y + t.h / 2;
            let dist = Math.hypot(p.x - cx, p.y - cy);
            if (dist < minDist) { minDist = dist; nearest = t; }
        });
        if (nearest) {
            if (nearest.id === 'xox' && typeof openXoxModal === 'function') openXoxModal();
            else if (nearest.id === 'amiral' && typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
            else if (nearest.id === 'blackjack' && typeof openBlackjackModal === 'function') openBlackjackModal();
        }
    }
}

// Mobil Sanal Kumanda Aç/Kapat Butonu
function toggleMobileDpad() {
    let dpad = document.getElementById('mobileControlsOverlay');
    let actionBtn = document.getElementById('mobileActionBtn');
    if (!dpad) return;
    let isHidden = (dpad.style.display === 'none' || dpad.style.display === '');
    dpad.style.display = isHidden ? 'block' : 'none';
    if (actionBtn) actionBtn.style.display = isHidden ? 'flex' : 'none';
}


// --- 2. ANA OYUN VE ÇİZİM DÖNGÜSÜ (GAME LOOP) ---
// --- 10. ANA OYUN VE ÇİZİM DÖNGÜSÜ (GAME LOOP & AKICI HAREKET SENKRONU) ---
let lastMovementEmitTime = 0;
let lastEmittedX = -9999;
let lastEmittedY = -9999;
let lastEmittedMoving = false;
let lastEmittedSprinting = false;
let lastGameLoopTime = 0;
const MOVEMENT_EMIT_INTERVAL_MS = 38; // ~26 Hz (Ağı şişirmeyen, mükemmel pürüzsüz ağ güncelleme sıklığı)
const _playerSortPool = []; // Sıfır Garbage Collection (GC) derinlik sıralama havuzu
const _entitySortPool = []; // Sıfır Garbage Collection (GC) Oyuncu ve Pet Birleşik Derinlik Havuzu

function gameLoop(timestamp) {
    requestAnimationFrame(gameLoop);
    let now = performance.now();
    let dt = lastGameLoopTime ? Math.min((now - lastGameLoopTime) / 1000, 0.1) : 0.016;
    lastGameLoopTime = now;

    // Kamera Takibi ve Yumuşak Enterpolasyon (Lerp)
    if (currentRoom === 'sanalika_cadde' && players[myId]) {
        let p = players[myId];
        let targetCamX = p.x - canvas.width / 2;
        let targetCamY = p.y - canvas.height / 2;
        targetCamX = Math.max(0, Math.min(1600 - canvas.width, targetCamX));
        targetCamY = Math.max(0, Math.min(960 - canvas.height, targetCamY));
        sanalikaCamera.x += (targetCamX - sanalikaCamera.x) * Math.min(1, 14 * dt);
        sanalikaCamera.y += (targetCamY - sanalikaCamera.y) * Math.min(1, 14 * dt);
    } else {
        sanalikaCamera.x = 0;
        sanalikaCamera.y = 0;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let isCamActive = (currentRoom === 'sanalika_cadde' && (sanalikaCamera.x !== 0 || sanalikaCamera.y !== 0));
    if (isCamActive) {
        ctx.save();
        ctx.translate(-Math.round(sanalikaCamera.x), -Math.round(sanalikaCamera.y));
    }

    // 1. Ortamı Çiz
    if (currentRoom === "kafe") {
        if (typeof drawOyunSalonuEnvironment === 'function') {
            drawOyunSalonuEnvironment();
        } else {
            drawCafeEnvironment();
        }
    } else if (currentRoom === "sahil") {
        drawBeachEnvironment();
    } else if (currentRoom === "nargile_cafe") {
        drawNargileCafeEnvironment();
    } else if (currentRoom === "market") {
        drawMarketEnvironment();
    } else if (currentRoom === "ganyan") {
        if (typeof drawGanyanEnvironment === 'function') drawGanyanEnvironment();
    } else if (currentRoom === "cadde") {
        if (typeof drawCaddeEnvironment === 'function') drawCaddeEnvironment();
    } else if (currentRoom === "dedenin_yeri") {
        if (typeof drawDedeninYeriEnvironment === 'function') drawDedeninYeriEnvironment();
    } else if (currentRoom === "emlakci") {
        if (typeof drawEmlakciEnvironment === 'function') drawEmlakciEnvironment();
    } else if (currentRoom === "dostlar_kiraathanesi") {
        if (typeof drawDostlarKiraathanesiEnvironment === 'function') drawDostlarKiraathanesiEnvironment();
    } else if (currentRoom === "sanalika_cadde") {
        if (typeof drawSanalikaCaddeEnvironment === 'function') drawSanalikaCaddeEnvironment();
    } else if (currentRoom === "star_caddesi") {
        if (typeof drawStarCaddesiEnvironment === 'function') drawStarCaddesiEnvironment();
    } else if (currentRoom === "meydanv2") {
        if (typeof drawMeydanV2Environment === 'function') drawMeydanV2Environment();
    } else if (currentRoom === "sahilv2") {
        if (typeof drawSahilV2Environment === 'function') drawSahilV2Environment();
    } else if (currentRoom === "sahil_yolu") {
        if (typeof drawSahilYoluEnvironment === 'function') drawSahilYoluEnvironment();
    } else if (currentRoom === "cadde2") {
        if (typeof drawCadde2Environment === 'function') drawCadde2Environment();
    } else if (currentRoom === "vip_club") {
        if (typeof drawVipClubEnvironment === 'function') drawVipClubEnvironment();
    } else if (currentRoom === "optika" || currentRoom === "optik") {
        if (typeof drawOptikaEnvironment === 'function') drawOptikaEnvironment(ctx, now);
    } else if (currentRoom === 'mine_cave') {
        if (typeof drawMineCaveEnvironment === 'function') drawMineCaveEnvironment();
    } else if (currentRoom === 'botanic_shop') {
        if (typeof drawBotanicShopEnvironment === 'function') drawBotanicShopEnvironment();
    } else if (currentRoom === 'pet_shop') {
        if (typeof drawPetShopInteriorEnvironment === 'function') drawPetShopInteriorEnvironment();
    } else if (currentRoom === "kultur_merkezi_lobi") {
        if (typeof drawKulturLobiEnvironment === 'function') drawKulturLobiEnvironment();
    } else if (currentRoom === "kultur_merkezi_sahne") {
        if (typeof drawKulturSahneEnvironment === 'function') drawKulturSahneEnvironment();
    } else if (currentRoom === "kultur_merkezi_kulis") {
        if (typeof drawKulturKulisEnvironment === 'function') drawKulturKulisEnvironment();
    } else if (currentRoom === "kultur_merkezi_sinema") {
        if (typeof drawKulturSinemaEnvironment === 'function') drawKulturSinemaEnvironment();
    } else if (currentRoom === "avm_kat1") {
        if (typeof drawAvmMallEnvironment === 'function') drawAvmMallEnvironment('avm_kat1');
    } else if (currentRoom === "avm_kat2") {
        if (typeof drawAvmMallEnvironment === 'function') drawAvmMallEnvironment('avm_kat2');
    } else if (currentRoom && currentRoom.startsWith("avm_magaza_")) {
        if (typeof drawAvmShopEnvironment === 'function') drawAvmShopEnvironment(currentRoom);
    } else if (currentRoom.startsWith("house_")) {
        if (typeof drawHouseEnvironment === 'function') drawHouseEnvironment();
    } else {
        drawStreetEnvironment();
    }

    // 1.1 Tıklayarak Yürüme Efekti (Expanding Tap Ripples FX)
    if (tapRipples && tapRipples.length > 0) {
        ctx.save();
        for (let i = tapRipples.length - 1; i >= 0; i--) {
            let r = tapRipples[i];
            r.radius += 38 * dt;
            r.alpha -= 2.4 * dt;
            if (r.alpha <= 0) {
                tapRipples.splice(i, 1);
                continue;
            }
            // Dış yumuşak cyan aura (Sıfır Gaussian blur maliyeti, %100 GPU dostu 60-120 FPS)
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, r.alpha * 0.35)})`;
            ctx.lineWidth = 4.8;
            ctx.stroke();

            // Orta net cyan halka
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, r.alpha)})`;
            ctx.lineWidth = 2.0;
            ctx.stroke();

            // İç altın sarısı halka
            ctx.beginPath();
            ctx.arc(r.x, r.y, Math.max(1, r.radius * 0.45), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(251, 191, 36, ${Math.max(0, r.alpha * 0.85)})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
        }
        ctx.restore();
    }

    // 2. Kendi Oyuncumuzu Hareket Ettir (Normal hız: 2.6; Atlı hız: 5.2 - Kullanıcı isteği: 2 kat hız)
    if (players[myId]) {
        let isMounted = !!(players[myId] && players[myId].hasHorse);
        let myPet = (typeof window.activeCompanionPets !== 'undefined' && players[myId])
            ? (window.activeCompanionPets[myId] || Object.values(window.activeCompanionPets).find(pet => pet && (pet.ownerId === myId || pet.ownerName === players[myId].name)))
            : null;
        let hasCat = !!(myPet && myPet.petType === 'cat');
        let isSkateboarding = !!(players[myId] && players[myId].heldItem === 'k2_skateboard') && !isMounted && !players[myId].hasSwanBoat && (players[myId].action !== 'sitting') && (players[myId].action !== 'sit_floor');
        let speed = isMounted ? 5.2 : (isSkateboarding ? 3.9 : (hasCat ? 2.6 * 1.3 : 2.6));

        // Kuğu Hız Kuralları (Sahil & Sahil V2): Kumsal/İskele 1x (2.6), Deniz/Su 2x (5.2)
        let isSwanInWater = false;
        if ((currentRoom === 'sahil' || currentRoom === 'sahilv2') && players[myId] && players[myId].hasSwanBoat) {
            if (currentRoom === 'sahilv2' && typeof isSahilV2Water === 'function') {
                isSwanInWater = isSahilV2Water(players[myId].x, players[myId].y);
            } else if (currentRoom === 'sahil') {
                let onPier = (players[myId].x >= 70 && players[myId].x <= 555 && players[myId].y >= 150 && players[myId].y <= 235);
                let shoreX = (typeof getBeachShoreX === 'function') ? getBeachShoreX(players[myId].y) : 300;
                isSwanInWater = (players[myId].x < shoreX && !onPier);
            }
            speed = isSwanInWater ? 5.2 : 2.6;
        }
        let p = players[myId];
        let isMoving = false;
        let moveDx = 0;
        let moveDy = 0;

        let wasdAllowed = !window.movementSettings || window.movementSettings.wasdEnabled !== false;
        let clickAllowed = !window.movementSettings || window.movementSettings.clickEnabled !== false;

        let hasKeyInput = wasdAllowed && (keys.w || keys.s || keys.a || keys.d);

        // Zeus'un Yıldırımı Kül / Çarpılma Hareketsizlik Kilidi
        if (p && (p.isAshed || p.isElectrocuted || (p.ashedUntil && p.ashedUntil > Date.now()))) {
            hasKeyInput = false;
            targetWalkPos = null;
        }
        if (p.zombieStunnedUntil > Date.now()) {
            hasKeyInput = false;
            targetWalkPos = null;
            p.vx = 0;
            p.vy = 0;
        }

        // 2. ADIM: Shift Tuşu ile Koşma (Sprint Dynamics - %42 Hız Artışı)
        let isSprinting = !isMounted && !p.hasSwanBoat && hasKeyInput && !!(keys.shift) && (p.action !== 'sitting' && p.action !== 'sit_floor' && p.action !== 'dance' && !p.isFishing);
        if (isSprinting) {
            speed *= 1.42; // 2.6 -> ~3.70 Hız
        }
        p.isSprinting = isSprinting;

        if (hasKeyInput) {
            targetWalkPos = null; // Klavye yön tuşuna basıldığı an tıklama rotasını iptal et
            if (keys.w) moveDy -= speed;
            if (keys.s) moveDy += speed;
            if (keys.a) moveDx -= speed;
            if (keys.d) moveDx += speed;

            // Çapraz yürüyüş hız normalizasyonu (%41 hız fazlalığını eşitler)
            if (moveDx !== 0 && moveDy !== 0) {
                moveDx *= 0.70710678;
                moveDy *= 0.70710678;
            }
        } else if ((clickAllowed || (targetWalkPos && (targetWalkPos.isVenueDoor || targetWalkPos.isSeatTarget))) && targetWalkPos) {
            let tdx = targetWalkPos.x - p.x;
            let tdy = targetWalkPos.y - p.y;
            let dist = Math.hypot(tdx, tdy);
            let reachLimit = targetWalkPos.isSeatTarget ? 18 : 4.5;
            if (dist < reachLimit) {
                let pendingRoom = targetWalkPos.targetRoom;
                let pendingAction = targetWalkPos.onReach;
                targetWalkPos = null;
                moveDx = 0;
                moveDy = 0;
                p.vx = 0;
                p.vy = 0;
                if (pendingAction) {
                    pendingAction();
                } else if (pendingRoom && typeof changeRoom === 'function') {
                    changeRoom(pendingRoom);
                }
            } else {
                let stepDist = Math.min(speed, dist);
                moveDx = (tdx / dist) * stepDist;
                moveDy = (tdy / dist) * stepDist;
            }
        }

        // Yürüyüş İvmelenmesi / Yumuşatması (Momentum & Velocity Easing)
        if (p.vx === undefined) p.vx = 0;
        if (p.vy === undefined) p.vy = 0;
        const accelFactor = 1 - Math.exp(-24 * dt); // Hızlı, tatmin edici ve organik ivmelenme
        p.vx += (moveDx - p.vx) * accelFactor;
        p.vy += (moveDy - p.vy) * accelFactor;
        if (Math.abs(p.vx) < 0.04 && moveDx === 0) p.vx = 0;
        if (Math.abs(p.vy) < 0.04 && moveDy === 0) p.vy = 0;

        const TARGET_DT = 0.016667;
        const timeScale = Math.min(dt / TARGET_DT, 2.5);

        let activeVx = p.vx;
        let activeVy = p.vy;

        if (Math.abs(activeVx) > 0.01 || Math.abs(activeVy) > 0.01) {
            let curModel = (p && p.model) || (typeof myAvatar !== 'undefined' && myAvatar.model) || 'classic_2';
            let isClassic = (curModel === 'classic');
            let curDir;
            if ((p && p.hasSwanBoat) || isMounted) {
                // Kuğu ve binek atı her zaman 8 yönlü pürüzsüz dönüş kullanır
                curDir = calculate8WayFacing(activeVx, activeVy) || myFacing;
            } else if (isClassic) {
                // Nostaljik klasik model: 8'li dönme yok, 4 ana yön
                if (Math.abs(activeVx) >= Math.abs(activeVy)) {
                    curDir = activeVx > 0 ? 'right' : 'left';
                } else {
                    curDir = activeVy > 0 ? 'down' : 'up';
                }
            } else {
                curDir = calculate8WayFacing(activeVx, activeVy) || myFacing;
            }
            myFacing = curDir;
            if (p) {
                p.facing = curDir;
                p.isMoving = true;
                p.walkCycle = walkCycle;
            }
            standUpIfSitting(curDir);
            isMoving = true;
            recordUserActivity();
            let prevWalkCycle = walkCycle;
            walkCycle += (isMounted ? 0.45 : (isSprinting ? 0.32 : 0.21)) * timeScale;

            // Ritmik doğal adım, at toynak sesi veya su pedalı sesi
            if (Math.floor(walkCycle / Math.PI) !== Math.floor(prevWalkCycle / Math.PI)) {
                if (window.playSound) {
                    if (isMounted) {
                        window.playSound('hoofbeat');
                    } else if (isSwanInWater) {
                        window.playSound('waterPaddle');
                    } else {
                        let surface = 'solid';
                        if (typeof window.getSurfaceType === 'function') {
                            surface = window.getSurfaceType(p.x, p.y);
                        } else if (typeof Karakter2Renderer !== 'undefined' && typeof Karakter2Renderer.getSurfaceType === 'function') {
                            surface = Karakter2Renderer.getSurfaceType(p.x, p.y);
                        }
                        window.playSound('footstep', { surface, isSprinting: !!isSprinting });
                    }
                }
            }

            let nextX = p.x + activeVx * timeScale;
            let nextY = p.y + activeVy * timeScale;

            let colX = checkWorldCollision(nextX, p.y);
            let colY = checkWorldCollision(p.x, nextY);

            // Akıllı Köşe Kayması (Corner Nudging & Sliding)
            // Bir engele (masa, sandalye, duvar köşesi) takıldığında karakterin köşeden yumuşakça sıyrılmasını sağla
            const nudgeScan = 6;
            const nudgeAmount = 1.7 * timeScale;
            if (colX && Math.abs(activeVx) > 0.1) {
                let upOpen = !checkWorldCollision(nextX, p.y - nudgeScan) && !checkWorldCollision(p.x, p.y - nudgeScan);
                let downOpen = !checkWorldCollision(nextX, p.y + nudgeScan) && !checkWorldCollision(p.x, p.y + nudgeScan);
                if (upOpen && !downOpen) {
                    p.y -= nudgeAmount;
                } else if (downOpen && !upOpen) {
                    p.y += nudgeAmount;
                }
            }
            if (colY && Math.abs(activeVy) > 0.1) {
                let leftOpen = !checkWorldCollision(p.x - nudgeScan, nextY) && !checkWorldCollision(p.x - nudgeScan, p.y);
                let rightOpen = !checkWorldCollision(p.x + nudgeScan, nextY) && !checkWorldCollision(p.x + nudgeScan, p.y);
                if (leftOpen && !rightOpen) {
                    p.x -= nudgeAmount;
                } else if (rightOpen && !leftOpen) {
                    p.x += nudgeAmount;
                }
            }

            // Eğer tıklayarak yürüme sırasında tam duvara veya köşeye çarpıp iki eksende de ilerleyemiyorsa rotayı sonlandır
            if (targetWalkPos && colX && colY) {
                if (targetWalkPos.isSeatTarget && targetWalkPos.onReach) {
                    let seatDist = Math.hypot(targetWalkPos.x - p.x, targetWalkPos.y - p.y);
                    if (seatDist <= 48) {
                        let act = targetWalkPos.onReach;
                        targetWalkPos = null;
                        p.vx = 0;
                        p.vy = 0;
                        act();
                    } else {
                        targetWalkPos = null;
                        p.vx = 0;
                        p.vy = 0;
                    }
                } else {
                    targetWalkPos = null;
                    p.vx = 0;
                    p.vy = 0;
                }
            }

            // Eğer oyuncu halihazırda bir mobilya/engel içindeyse (örneğin sandalyeden yeni kalktıysa):
            // Çıkış adımına izin vererek kitlenmeyi tamamen önle
            let isStuckInObstacle = checkWorldCollision(p.x, p.y);
            if (isStuckInObstacle) {
                p.x = nextX;
                p.y = nextY;
            } else {
                if (!colX) p.x = nextX;
                if (!colY) p.y = nextY;
            }
        } else {
            walkCycle = 0; // Durduğunda adım döngüsünü sıfırla (idle netliği)
            if (p) {
                p.isMoving = false;
                p.walkCycle = 0;
            }
        }

        // AFK / Uyuklama Kontrolü (Minimum 5 dakika boyunca hiçbir hareket/etkileşim yapılmadığında)
        checkAfkStatus();

        // Mekanlar Arası Kesintisiz Yürüyerek Geçiş Koridorları (Modüler public/js/roomInteractions.js)
        if (Date.now() >= roomTransitionCooldownUntil) {
            if (typeof checkRoomWalkPortals === 'function') {
                let targetRoom = checkRoomWalkPortals(p, currentRoom, canvas.width, canvas.height);
                if (targetRoom) {
                    targetWalkPos = null;
                    p.vx = 0;
                    p.vy = 0;
                    changeRoom(targetRoom);
                    return;
                }
            }
        }

        let minBoundX = (currentRoom === "sanalika_cadde") ? 30 : ((currentRoom === "sokak" || currentRoom === "cadde") ? 12 : 18);
        let maxBoundX = (currentRoom === "sanalika_cadde") ? 1570 : ((currentRoom === "sokak" || currentRoom === "sahil") ? canvas.width - 12 : canvas.width - 18);
        let minBoundY = (currentRoom === "sanalika_cadde") ? 45 : 38;
        let maxBoundY = (currentRoom === "sanalika_cadde") ? 920 : canvas.height - 20;
        p.x = Math.max(minBoundX, Math.min(maxBoundX, p.x));
        p.y = Math.max(minBoundY, Math.min(maxBoundY, p.y));

        // Ağ Trafiği Throttling & Hassas Sayı Sıkıştırması (Bant Genişliği %40 Tasarruf)
        let posChanged = (Math.abs(p.x - lastEmittedX) > 0.3 || Math.abs(p.y - lastEmittedY) > 0.3);
        let sprintChanged = (p.isSprinting !== lastEmittedSprinting);
        if (isMoving) {
            if ((posChanged || sprintChanged) && (now - lastMovementEmitTime >= MOVEMENT_EMIT_INTERVAL_MS)) {
                lastMovementEmitTime = now;
                lastEmittedX = p.x;
                lastEmittedY = p.y;
                lastEmittedMoving = true;
                lastEmittedSprinting = p.isSprinting;
                let emitX = Math.round(p.x * 10) / 10;
                let emitY = Math.round(p.y * 10) / 10;
                socket.emit('playerMovement', { x: emitX, y: emitY, isMoving: true, isSprinting: p.isSprinting, facing: myFacing });
            }
        } else if (lastEmittedMoving) {
            // Oyuncu yeni durdu! Son net pozisyonu kesinleştirici paket olarak gönder
            lastMovementEmitTime = now;
            lastEmittedX = p.x;
            lastEmittedY = p.y;
            lastEmittedMoving = false;
            lastEmittedSprinting = false;
            let emitX = Math.round(p.x * 10) / 10;
            let emitY = Math.round(p.y * 10) / 10;
            socket.emit('playerMovement', { x: emitX, y: emitY, isMoving: false, isSprinting: false, facing: myFacing });
        }
    }

    // 3. Uzaktaki (Remote) Oyuncuların Yumuşak Delta-Time Lerp Hareketi ve Adım Senkronizasyonu
    let lerpFactor = 1 - Math.exp(-22 * dt); // 60-120Hz monitörlerde pürüzsüz ve mikro-gecikmesiz enterpolasyon
    for (let id in players) {
        if (id !== myId) {
            let p = players[id];
            if (p.targetX !== undefined && p.targetY !== undefined) {
                let dx = p.targetX - p.x;
                let dy = p.targetY - p.y;
                let dist = Math.hypot(dx, dy);
                if (dist > 85 || p.action === 'sitting') {
                    // Işınlanma, kapıdan geçiş veya oturma anında duvarlardan kaymayı engelle
                    p.x = p.targetX;
                    p.y = p.targetY;
                    p.isMoving = (p.serverMoving === true);
                    p.walkCycle = 0;
                } else if (!p.serverMoving && dist <= 2.5) {
                    // Stop Snapping: Oyuncu durdu ve hedef noktaya çok yakın: anında sabitle ve hayalet adımları kes
                    p.x = p.targetX;
                    p.y = p.targetY;
                    p.isMoving = false;
                    p.walkCycle = 0;
                } else if (dist > 0.8) {
                    p.x += dx * lerpFactor;
                    p.y += dy * lerpFactor;
                    p.isMoving = true;
                    p.walkCycle = (p.walkCycle || 0) + ((p.isSprinting ? 24 : 17) * dt);
                    // 2.2 Yön Geçişlerinde Yumuşak Dönüş (Facing Lerp / Turn Smoothing)
                    let isClassic = (p && p.model === 'classic');
                    if (isClassic) {
                        if (Math.abs(dx) >= Math.abs(dy)) {
                            p.facing = dx > 0 ? 'right' : 'left';
                        } else {
                            p.facing = dy > 0 ? 'down' : 'up';
                        }
                    } else {
                        let cur8 = calculate8WayFacing(dx, dy);
                        if (cur8) p.facing = cur8;
                    }
                } else {
                    p.x = p.targetX;
                    p.y = p.targetY;
                    p.isMoving = (p.serverMoving === true);
                    if (!p.isMoving) p.walkCycle = 0;
                }
            }
        }
    }

    // 4. Tüm Oyuncuları Derinlik (Y) Sırasına Göre Çiz (Sıfır-Tahsis / Zero-GC Havuzlama)
    let poolIdx = 0;
    for (let id in players) {
        let pObj = players[id];
        if (pObj) {
            let entry = _playerSortPool[poolIdx];
            if (!entry) {
                entry = { id: id, p: pObj, y: pObj.y || 0, type: 'player' };
                _playerSortPool[poolIdx] = entry;
            } else {
                entry.id = id;
                entry.p = pObj;
                entry.y = pObj.y || 0;
                entry.type = 'player';
            }
            poolIdx++;
        }
    }
    _playerSortPool.length = poolIdx;
    _playerSortPool.sort((a, b) => a.y - b.y);

    // Karakter 2 Ayak İzi, Su Dalgalanması & Anime Adım Tozu (Zemin Efektleri)
    if (typeof Karakter2Renderer !== 'undefined' && typeof Karakter2Renderer.updateAndDrawFootstepParticles === 'function') {
        Karakter2Renderer.updateAndDrawFootstepParticles(ctx);
    }

    // Sauron Asası Lav Çatlakları (5 saniye boyunca zeminde akkor parlar, sonra söner)
    if (typeof Karakter2Renderer !== 'undefined' && typeof Karakter2Renderer.updateAndDrawGroundCracks === 'function') {
        Karakter2Renderer.updateAndDrawGroundCracks(ctx);
    }

    // Companion Pet'lerin (ve İzbandut Korumaların) Konum ve Animasyonlarını Güncelle
    if (typeof updateCompanionPets === 'function') {
        updateCompanionPets(dt);
    }

    // Bahçeli evde, Optik mağazasında veya AVM katlarında oyuncular Y-Sorting derinlik kuyruğuyla çizilir
    let isGardenHouseActive = (typeof isCurrentlyInGardenHouse === 'function' && isCurrentlyInGardenHouse());
    let isOptikActive = (typeof isCurrentlyInOptik === 'function' && isCurrentlyInOptik());
    let isAvmActive = (currentRoom === 'avm_kat1' || currentRoom === 'avm_kat2');
    if (isOptikActive && typeof drawOptikaForegroundAndPlayers === 'function') {
        drawOptikaForegroundAndPlayers(ctx, now, _playerSortPool);
    } else if (isAvmActive && typeof drawAvmMallForegroundAndPlayers === 'function') {
        drawAvmMallForegroundAndPlayers(ctx, now, _playerSortPool, currentRoom);
    } else if (!isGardenHouseActive) {
        // Standart Odalarda (Cadde, VIP Club, Meydan, Botanik vb.) Oyuncu ve Petleri Birleşik Derinlik (Y) Sırasıyla Çiz
        let entIdx = 0;
        for (let i = 0; i < _playerSortPool.length; i++) {
            let item = _playerSortPool[i];
            let ent = _entitySortPool[entIdx];
            if (!ent) {
                ent = { type: 'player', y: item.y || 0, p: item.p, id: item.id, pet: null };
                _entitySortPool[entIdx] = ent;
            } else {
                ent.type = 'player';
                ent.y = item.y || 0;
                ent.p = item.p;
                ent.id = item.id;
                ent.pet = null;
            }
            entIdx++;
        }

        if (window.activeCompanionPets) {
            const curR = (typeof currentRoom !== 'undefined') ? currentRoom : window.currentRoom;
            for (let petId in window.activeCompanionPets) {
                let pet = window.activeCompanionPets[petId];
                if (!pet) continue;
                if (curR && pet.room && pet.room !== curR) continue;
                let petSortY = (typeof pet.curY === 'number') ? pet.curY : (pet.y || 0);
                let ent = _entitySortPool[entIdx];
                if (!ent) {
                    ent = { type: 'pet', y: petSortY, p: null, id: null, pet: pet };
                    _entitySortPool[entIdx] = ent;
                } else {
                    ent.type = 'pet';
                    ent.y = petSortY;
                    ent.p = null;
                    ent.id = null;
                    ent.pet = pet;
                }
                entIdx++;
            }
        }
        _entitySortPool.length = entIdx;
        _entitySortPool.sort((a, b) => a.y - b.y);

        window._companionPetsDrawnInDepthPool = true;
        for (let i = 0; i < _entitySortPool.length; i++) {
            let ent = _entitySortPool[i];
            if (ent.type === 'player' && ent.p) {
                const now = Date.now();
                const hasRecoil = ent.p.recoilUntil && ent.p.recoilUntil > now;
                if (hasRecoil) {
                    ctx.save();
                    const rem = (ent.p.recoilUntil - now) / 500;
                    const rHop = Math.sin(rem * Math.PI);
                    ctx.translate((ent.p.recoilX || 0) * rHop, (ent.p.recoilY || 0) * rHop);
                }
                drawAnimatedPlayer(ent.p, ent.id);
                if (hasRecoil) {
                    ctx.restore();
                }
            } else if (ent.type === 'pet' && ent.pet) {
                if (typeof drawSingleCompanionPet === 'function') {
                    drawSingleCompanionPet(ctx, ent.pet, ent.pet.curX, ent.pet.curY, Date.now());
                }
            }
        }
    }

    if (typeof updateAndRenderFatherPets === 'function') {
        updateAndRenderFatherPets(ctx, dt);
    }

    if (typeof updateAndRenderCompanionPets === 'function') {
        updateAndRenderCompanionPets(ctx, dt);
    }

    // Fedai Can Siperi Savunma Efektleri (Kalkan şok dalgaları, kıvılcımlar ve telsiz dumanı)
    if (typeof window.vipDefenseFx !== 'undefined' && typeof window.vipDefenseFx.draw === 'function') {
        window.vipDefenseFx.draw(ctx, dt);
    }

    // 5. Nargile Cafe Yoğun Ekran Dumanı (20. Fırt Felaketi: Tüm ekranı 5 sn kaplayıp kimseyi göstermez)
    if (currentRoom === 'nargile_cafe' && typeof window.drawNargileScreenSmoke === 'function') {
        window.drawNargileScreenSmoke(ctx);
    }

    // Zeus'un Yıldırımı İlahi Fırtına, Dönen Kara Bulut ve Şimşek Efektleri
    if (typeof ZeusLightningEngine !== 'undefined' && typeof ZeusLightningEngine.drawSkyAndStorm === 'function') {
        ZeusLightningEngine.drawSkyAndStorm(ctx, canvas.width, canvas.height);
    }

    // Kamera koordinat matrisini geri yükle
    if (isCamActive) {
        ctx.restore();
    }

    // 5.1 Sanalika 1. Cadde HUD Sokak İsimliği ve Koordinat Göstergesi
    if (currentRoom === 'sanalika_cadde') {
        ctx.save();
        ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
        ctx.beginPath();
        ctx.roundRect(14, 14, 205, 34, 10);
        ctx.fill();
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("📍 1. CADDE (İzometrik)", 24, 34);

        if (players[myId]) {
            let px = Math.round(players[myId].x);
            let py = Math.round(players[myId].y);
            ctx.fillStyle = "#94a3b8";
            ctx.font = "10px monospace";
            ctx.textAlign = "right";
            ctx.fillText(`${px}, ${py}`, 206, 34);
        }
        ctx.restore();
    }

    // 6. Sinematik Mekan Geçiş Kararması / Açılması (Fade Transition)
    if (roomTransitionFadeAlpha > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(15, 23, 42, ${roomTransitionFadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        roomTransitionFadeAlpha = Math.max(0, roomTransitionFadeAlpha - dt * 4.5);
    }
}

// --- OYUN İÇİ UYARI / BİLGİLENDİRME POP-UP SİSTEMİ (TARAYICI ALERT YERİNE) ---
function showInGameAlert(message, title = 'Bildirim', icon = '⚠️', btnText = 'Tamam', callback = null) {
    const modal = document.getElementById('inGameAlertModal');
    if (!modal) {
        console.warn("inGameAlertModal bulunamadı:", message);
        return;
    }
    const iconEl = document.getElementById('inGameAlertIcon');
    const titleEl = document.getElementById('inGameAlertTitle');
    const msgEl = document.getElementById('inGameAlertMessage');
    const btnEl = document.getElementById('inGameAlertBtn');

    if (iconEl) iconEl.innerText = icon || '⚠️';
    if (titleEl) titleEl.innerText = title || 'Bildirim';
    if (msgEl) {
        msgEl.innerHTML = String(message || '').replace(/\n/g, '<br>');
    }
    if (btnEl) btnEl.innerText = btnText || 'Tamam';

    window._inGameAlertCallback = callback;
    modal.style.display = 'flex';
}
window.showInGameAlert = showInGameAlert;

function closeInGameAlert() {
    const modal = document.getElementById('inGameAlertModal');
    if (modal) modal.style.display = 'none';
    if (typeof window._inGameAlertCallback === 'function') {
        const cb = window._inGameAlertCallback;
        window._inGameAlertCallback = null;
        try { cb(); } catch (err) { console.error(err); }
    }
    const canvas = document.getElementById('gameCanvas');
    if (canvas) canvas.focus();
    window.focus();
}
window.closeInGameAlert = closeInGameAlert;

function openAndFocusChat() {
    const sidePanel = document.getElementById('sideChatContainer');
    const isSideOpen = sidePanel && sidePanel.style.display !== 'none' && !sidePanel.classList.contains('chat-minimized');

    if (isSideOpen) {
        const sideInput = document.getElementById('sideChatInput');
        if (sideInput) sideInput.focus();
    } else {
        const bottomInput = document.getElementById('bottomChatInput');
        if (bottomInput) {
            bottomInput.focus();
        } else {
            const sideInput = document.getElementById('sideChatInput');
            if (sideInput) sideInput.focus();
        }
    }
}
window.openAndFocusChat = openAndFocusChat;

// Tarayıcının varsayılan "localhost:3000 web sitesinin mesajı" kutusunu engelle ve oyun içi pop-up'a yönlendir
window.alert = function (msg) {
    let icon = '⚠️';
    let title = 'Oyun Bildirimi';
    let str = String(msg || '');
    if (str.includes('🐎') || str.toLowerCase().includes('at') || str.toLowerCase().includes('binek') || str.toLowerCase().includes('seyis')) {
        icon = '🐎';
        title = 'Seyis Dursun';
    } else if (str.includes('🦢') || str.toLowerCase().includes('kuğu')) {
        icon = '🦢';
        title = 'Sahil Görevlisi';
    } else if (str.includes('💰') || str.toLowerCase().includes('para') || str.toLowerCase().includes('tl') || str.toLowerCase().includes('bakiye')) {
        icon = '💰';
        title = 'Bakiye Bilgisi';
    }
    showInGameAlert(msg, title, icon);
};

// --- 15. ODA DEĞİŞİMİ & GLOBAL TOAST BİLDİRİMLERİ ---
// (VIP Club ve Tekinsiz Tekin Karaborsa istemci kodları public/js/vipClubClient.js modülüne taşınmıştır)
(function initGlobalRoomAndToastSockets() {
    const s = window.socket || (typeof io !== 'undefined' ? io() : null);
    if (!s) return;

    s.on('roomChanged', (data) => {
        if (!data) return;
        const targetRoom = typeof data === 'string' ? data : (data.room || null);
        const targetSpawn = (typeof data === 'object' && data.spawn) ? data.spawn : null;
        if (!targetRoom) return;
        if (typeof changeRoom === 'function') {
            changeRoom(targetRoom, targetSpawn);
        }
        if (typeof data === 'object' && data.money !== undefined) {
            if (typeof userMoney !== 'undefined') userMoney = data.money;
            let moneyEl = document.getElementById('userMoneyDisplay');
            if (moneyEl) moneyEl.innerText = data.money.toLocaleString('tr-TR');
        }
    });

    s.on('toastNotification', (data) => {
        if (!data) return;
        const msg = typeof data === 'string' ? data : (data.message || data.text || data.title || '');
        if (typeof showFloatingToast === 'function') {
            showFloatingToast(msg);
        } else if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast(data.icon || '🎰', data.title || 'Bildirim', msg);
        }
    });
})();

// --- 📱 MOBİL VIRTUAL KEYBOARD, BATARYA VE UYKU MODU OPTİMİZASYONU ---
if (typeof window !== 'undefined' && window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        const bottomBar = document.getElementById('gameBottomControlBar');
        if (bottomBar) {
            if (keyboardHeight > 140) {
                bottomBar.style.transform = `translateY(-${keyboardHeight - 6}px)`;
                bottomBar.style.zIndex = '15000';
            } else {
                bottomBar.style.transform = '';
                bottomBar.style.zIndex = '';
            }
        }
    });
}

document.addEventListener('focusout', (e) => {
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        setTimeout(() => {
            window.scrollTo(0, 0);
            const bottomBar = document.getElementById('gameBottomControlBar');
            if (bottomBar) {
                bottomBar.style.transform = '';
                bottomBar.style.zIndex = '';
            }
        }, 80);
    }
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) {
            players[myId].isMoving = false;
        }
    } else {
        lastGameLoopTime = performance.now();
        if (typeof window.audioCtx !== 'undefined' && window.audioCtx && window.audioCtx.state === 'suspended') {
            window.audioCtx.resume().catch(() => {});
        }
        if (typeof updateCanvasRect === 'function') updateCanvasRect();
    }
});
