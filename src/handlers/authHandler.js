const dataManager = require('../dataManager');
const tableManager = require('../tableManager');
const gameCoordinator = require('../gameCoordinator');
const fatherPetManager = require('../fatherPetManager');
const petManager = require('../petManager');
const { givePlayerHorseWithTimer } = require('./ganyanHandler');
const { calculateLevel, getRequiredTotalXP, getDeltaXP } = require('../utils/levelSystem');

function registerAuthHandlers(io, socket, players, helpers) {
    const { getPlayersInRoom, givePlayerTeaWithTimer, broadcastOnlineCount } = helpers;

    // Ortak Giriş Başarılı İşlemi
    function onLoginSuccess(uData, username, isAdmin) {
        const previousModel = uData.avatar && uData.avatar.model;
        if (!uData.avatar) uData.avatar = {};
        if (!uData.avatar.model) uData.avatar.model = 'karakter_2';
        if (uData.avatar.model === 'karakter_2') {
            const isFem = (uData.gender === 'female');
            if (!uData.avatar.shirt && !uData.avatar.outfit) {
                uData.avatar.shirt = isFem ? 'top_k2_pastel_hoodie' : 'k2_cyber_street';
                uData.avatar.shirtColor = uData.avatar.shirt;
                uData.avatar.color = uData.avatar.shirt;
            }
            if (!uData.avatar.pants && !uData.avatar.outfit) {
                uData.avatar.pants = isFem ? 'pants_k2_cargo_mini' : 'pants_k2_tactical_jogger';
            }
            if (!uData.avatar.shoes) {
                uData.avatar.shoes = isFem ? 'shoes_k2_chunky_sneaker' : 'shoes_k2_skate_pro';
            }
            if (!uData.avatar.hair || uData.avatar.hair === 'none') {
                uData.avatar.hair = isFem ? 'hair_k2_hime_cut' : 'hair_k2_fade_pompadour';
            }
        }
        if (uData.avatar.hat && typeof uData.avatar.hat === 'string' && uData.avatar.hat.startsWith('hair_') && (!uData.avatar.hair || uData.avatar.hair === 'none')) {
            uData.avatar.hair = uData.avatar.hat;
            uData.avatar.hat = 'none';
        }
        if (!uData.avatar.hair) uData.avatar.hair = 'none';
        if (previousModel !== uData.avatar.model) {
            dataManager.savePersistentData();
        }

        let hasValidTea = false;
        if (uData.teaExpiresAt) {
            if (Date.now() >= uData.teaExpiresAt) {
                uData.teaExpiresAt = null;
                if (uData.avatar.heldItem === 'cay') uData.avatar.heldItem = 'none';
                if (uData.propInventory) delete uData.propInventory['props_cay'];
                dataManager.savePersistentData();
            } else {
                hasValidTea = true;
            }
        }

        let hasValidHorse = false;
        let horseRemainingMs = 0;
        if (uData.horseExpiresAt) {
            if (Date.now() >= uData.horseExpiresAt) {
                uData.horseExpiresAt = null;
                dataManager.savePersistentData();
            } else {
                hasValidHorse = true;
                horseRemainingMs = uData.horseExpiresAt - Date.now();
            }
        }

        players[socket.id] = {
            name: username,
            x: 400, y: 280,
            model: uData.avatar.model,
            color: uData.avatar.shirtColor || '#3b82f6',
            shirt: (uData.avatar && uData.avatar.shirt) || (uData.avatar && uData.avatar.shirtColor) || '#3b82f6',
            pants: (uData.avatar && uData.avatar.pants) || 'pants_classic_jeans',
            outfit: (uData.avatar && uData.avatar.outfit) || null,
            skinColor: uData.avatar.skinColor || '#facc15',
            hat: uData.avatar.hat || 'bere',
            hair: uData.avatar.hair || 'none',
            hairColor: (uData.avatar && uData.avatar.hairColor) || null,
            face: uData.avatar.face || 'none',
            heldItem: uData.avatar.heldItem || 'none',
            shoes: uData.avatar.shoes || 'none',
            watch: (uData.avatar && uData.avatar.watch) || 'none',
            costume: (uData.avatar && uData.avatar.costume) || null,
            gender: uData.gender || 'male',
            money: uData.money !== undefined ? uData.money : 1000,
            diamonds: uData.diamonds || 0,
            ores: uData.ores || { komur: 0, bakir: 0, demir: 0 },
            pickaxeExpiresAt: uData.pickaxeExpiresAt || null,
            mood: uData.mood || 'happy',
            msg: "",
            room: "sokak",
            hasTea: hasValidTea,
            hasHorse: hasValidHorse,
            horseExpiresAt: hasValidHorse ? uData.horseExpiresAt : undefined,
            action: hasValidTea ? 'tea' : null,
            isFishing: false,
            hasSwanBoat: false,
            isAdmin: isAdmin || (username && username.toLowerCase() === 'elyesa'),
            isMod: !isAdmin && username && username.toLowerCase() !== 'elyesa' && (uData.role === 'mod' || uData.role === 'moderator' || uData.isMod === true),
            role: (isAdmin || (username && username.toLowerCase() === 'elyesa')) ? 'admin' : ((uData.role === 'mod' || uData.role === 'moderator' || uData.isMod === true) ? 'mod' : 'user'),
            isMuted: !!(uData.muteExpiresAt && Date.now() < uData.muteExpiresAt),
            fishCaughtCount: uData.fishCaughtCount || 0,
            botanicHarvestCount: uData.botanicHarvestCount || 0,
            minedRocksCount: uData.minedRocksCount || 0,
            gamerGamesCount: uData.gamerGamesCount || 0,
            level: (uData.level !== undefined && uData.level !== null) ? Number(uData.level) : calculateLevel(uData.totalXP || 0),
            totalXP: uData.totalXP || 0,
            likes: uData.likes || 0,
            dislikes: uData.dislikes || 0,
            jammerExpiresAt: uData.jammerExpiresAt || 0,
            anonMaskExpiresAt: uData.anonMaskExpiresAt || 0,
            neonRedNickExpiresAt: uData.neonRedNickExpiresAt || 0,
            invisibilityExpiresAt: uData.invisibilityExpiresAt || 0
        };

        const isMod = players[socket.id].isMod;
        const userRole = players[socket.id].role;

        if (hasValidTea) {
            givePlayerTeaWithTimer(socket.id, username, uData.teaExpiresAt - Date.now());
        }

        if (hasValidHorse && typeof givePlayerHorseWithTimer === 'function') {
            givePlayerHorseWithTimer(io, players, socket.id, username, horseRemainingMs, true);
        }

        socket.join("sokak");

        const pLevel = (uData.level !== undefined && uData.level !== null) ? Number(uData.level) : calculateLevel(uData.totalXP || 0);
        const pTotalXP = Number(uData.totalXP) || 0;
        const pBaseXP = getRequiredTotalXP(pLevel);
        const pDeltaXP = (pLevel < 100) ? getDeltaXP(pLevel + 1) : 0;
        const pProgress = Math.max(0, pTotalXP - pBaseXP);

        socket.emit('loginSuccess', {
            money: uData.money,
            diamonds: uData.diamonds || 0,
            avatar: uData.avatar,
            inventory: uData.inventory,
            propInventory: uData.propInventory || {},
            friendRequests: uData.friendRequests || [],
            isAdmin: isAdmin,
            isMod: isMod,
            role: userRole,
            username: username,
            friends: dataManager.getFriendListData(username, players),
            houses: uData.houses || (uData.house ? { [uData.house.type]: uData.house } : {}),
            house: uData.house,
            gender: uData.gender || 'male',
            furnitureInventory: uData.furnitureInventory || [],
            skinSets: uData.skinSets || {},
            isMuted: !!(uData.muteExpiresAt && Date.now() < uData.muteExpiresAt),
            fishCaughtCount: uData.fishCaughtCount || 0,
            botanicHarvestCount: uData.botanicHarvestCount || 0,
            minedRocksCount: uData.minedRocksCount || 0,
            gamerGamesCount: uData.gamerGamesCount || 0,
            level: pLevel,
            totalXP: pTotalXP,
            currentProgress: pProgress,
            targetXP: pDeltaXP,
            likes: uData.likes || 0,
            dislikes: uData.dislikes || 0,
            muteExpiresAt: uData.muteExpiresAt || null,
            muteReason: uData.muteReason || null,
            jammerCount: uData.jammerCount || 0,
            zeusCount: uData.zeusCount || 0,
            mugKnifeCount: uData.mugKnifeCount || (uData.hasMugKnife ? 1 : 0),
            hasMugKnife: !!(uData.hasMugKnife || (uData.mugKnifeCount && uData.mugKnifeCount > 0)),
            bodyguardsEquipped: (uData.bodyguardsEquipped !== undefined) ? uData.bodyguardsEquipped : (uData.bodyguardCount || 0),
            bodyguardCount: uData.bodyguardCount || 0,
            hasDoberman: !!uData.hasDoberman,
            dobermanEquipped: (uData.dobermanEquipped !== false),
            anonMaskExpiresAt: uData.anonMaskExpiresAt || 0,
            anonMaskCount: uData.anonMaskCount || 0
        });

        // Bekleyen seviye atlama ödülleri varsa oyuncuya ilet
        if (Array.isArray(uData.pendingBadgeLevelUps) && uData.pendingBadgeLevelUps.length > 0) {
            uData.pendingBadgeLevelUps.forEach(popup => {
                socket.emit('badgeLevelUp', popup);
            });
            uData.pendingBadgeLevelUps = [];
            dataManager.savePersistentData();
        }

        fatherPetManager.handleLogin(socket, username);
        petManager.handleLogin(socket, username, uData);
        socket.emit('currentPlayers', getPlayersInRoom("sokak"));
        socket.emit('activeFatherPets', fatherPetManager.getPetsInRoom("sokak"));
        socket.emit('activeCompanionPets', petManager.getPetsInRoom("sokak"));
        socket.to("sokak").emit('newPlayer', { id: socket.id, player: players[socket.id] });
        if (typeof broadcastOnlineCount === 'function') broadcastOnlineCount();

        console.log(`${username} oyuna girdi! Bakiye: ${uData.money} TL (Admin: ${isAdmin}, Mod: ${isMod})`);

        // Devam eden oyun kontrolü (Reconnect Teklifi)
        const activeGames = gameCoordinator.getActiveGames();
        let ongoingGame = null;
        for (let tid in activeGames) {
            let g = activeGames[tid];
            if (g && g.disconnectedPlayers) {
                for (let dPid in g.disconnectedPlayers) {
                    if (g.disconnectedPlayers[dPid].name.toLowerCase() === username.toLowerCase()) {
                        ongoingGame = { tableId: tid, game: g };
                        break;
                    }
                }
            }
            if (ongoingGame) break;
        }

        if (ongoingGame) {
            let table = tableManager.getTable(ongoingGame.tableId);
            let tName = table ? table.name : "Masa";
            socket.emit('promptReconnect', { tableId: ongoingGame.tableId, tableName: tName });
        }
    }

    // 1. MEVCUT HESAP İLE GİRİŞ
    socket.on('login', async (data) => {
        if (!data) {
            socket.emit('loginFailed', "Giriş bilgileri eksik!");
            return;
        }

        if (players[socket.id]) {
            socket.emit('loginFailed', "Bu bağlantıda zaten açık bir oturumunuz bulunuyor!");
            return;
        }

        const inputName = dataManager.sanitizeString(data.name || data.username || "Oyuncu", 20, false);
        const pass = typeof data.pass === 'string' ? data.pass.trim() : (typeof data.password === 'string' ? data.password.trim() : "");

        const authResult = await dataManager.loginUser(inputName, pass, players);

        if (!authResult.success) {
            socket.emit('loginFailed', authResult.message || "Giriş başarısız!");
            return;
        }

        const username = authResult.username;
        const uData = authResult.userData;

        // Aktif Ban Kontrolü
        if (uData.banExpiresAt) {
            if (Date.now() < uData.banExpiresAt) {
                let remainingSec = Math.ceil((uData.banExpiresAt - Date.now()) / 1000);
                let remMin = Math.floor(remainingSec / 60);
                let remSec = remainingSec % 60;
                let timeStr = remMin > 0 ? `${remMin} dakika ${remSec} saniye` : `${remSec} saniye`;
                socket.emit('loginFailed', `⛔ Hesabınız geçici olarak uzaklaştırılmıştır (Ban)!\nSebep: ${uData.banReason || 'Yönetici kararı'}\nKalan Süre: ${timeStr}`);
                return;
            } else {
                uData.banExpiresAt = null;
                uData.banReason = null;
                uData.bannedBy = null;
                await dataManager.saveUserData(username, { banExpiresAt: null, banReason: null, bannedBy: null });
            }
        }

        const isAdmin = (uData.role === 'admin' || uData.isAdmin === true);

        onLoginSuccess(uData, username, isAdmin);
    });

    // 2. YENİ HESAP KAYIT (REGISTER)
    socket.on('register', async (data) => {
        if (!data) {
            socket.emit('registerFailed', "Kayıt bilgileri eksik!");
            return;
        }

        if (players[socket.id]) {
            socket.emit('registerFailed', "Bu bağlantıda zaten açık bir oturumunuz bulunuyor!");
            return;
        }

        const inputName = dataManager.sanitizeString(data.name || data.username || "", 20, false);
        const pass = typeof data.pass === 'string' ? data.pass.trim() : (typeof data.password === 'string' ? data.password.trim() : "");
        const chosenGender = (data.gender === 'female') ? 'female' : 'male';

        const regResult = await dataManager.registerUser(inputName, pass, chosenGender);

        if (!regResult.success) {
            socket.emit('registerFailed', regResult.message || "Kayıt başarısız!");
            return;
        }

        const username = regResult.username;
        const uData = regResult.userData;
        const isAdmin = (uData.role === 'admin' || uData.isAdmin === true);

        onLoginSuccess(uData, username, isAdmin);
        socket.emit('systemMessage', `🎉 Hoş geldiniz ${username}! Hesabınız başarıyla oluşturuldu. Başlangıç hediyesi: 1000 TL!`);
    });

    // 3. OYUN İÇİ ŞİFRE DEĞİŞTİRME
    socket.on('changePassword', async (data) => {
        if (!players[socket.id] || !data) return;
        const username = players[socket.id].name;
        const oldPass = typeof data.oldPass === 'string' ? data.oldPass.trim() : "";
        const newPass = typeof data.newPass === 'string' ? data.newPass.trim() : "";

        const result = await dataManager.changeUserPassword(username, oldPass, newPass);

        if (result.success) {
            socket.emit('passwordChangeResult', { success: true, message: result.message });
            socket.emit('systemMessage', result.message);
        } else {
            socket.emit('passwordChangeResult', { success: false, message: result.message });
        }
    });

}

module.exports = { registerAuthHandlers };
