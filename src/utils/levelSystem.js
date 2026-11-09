// src/utils/levelSystem.js
// Seviye 1–100 İlerleme Motoru, XP Hesaplama ve Seviye Atlama Ödül Sistemi
const dataManager = require('../dataManager');

const MAX_LEVEL = 100;

/**
 * Belirli bir seviyeye ulaşmak için gereken delta XP miktarını hesaplar.
 * Level 1 başlangıç seviyesidir (0 XP).
 * Level 1 -> 2 geçişi için gereken XP tam 20 XP'dir.
 * Delta XP Formülü (Level >= 3): Math.floor(20 * Math.pow(level - 1, 1.42))
 * @param {number} level - Ulaşılmak istenen hedef seviye (>= 2)
 * @returns {number}
 */
function getDeltaXP(level) {
    if (level <= 1) return 0;
    if (level === 2) return 20;   // 1 -> 2: 20 XP (Kümülatif toplam 20 XP)
    return Math.floor(20 * Math.pow(level - 1, 1.42));
}

/**
 * Belirli bir seviyeye ulaşmak için gereken kümülatif toplam XP'yi döndürür.
 * Seviye 1 başlangıçtır ve 0 XP'dir. Seviye 2 için 20 XP, Seviye 3 için 73 XP'dir.
 * @param {number} level - Hedef seviye (1-100)
 * @returns {number}
 */
function getRequiredTotalXP(level) {
    level = Math.max(1, Math.min(MAX_LEVEL, Number(level) || 1));
    if (level <= 1) return 0;
    let total = 0;
    for (let l = 2; l <= level; l++) {
        total += getDeltaXP(l);
    }
    return total;
}

/**
 * Birikimli toplam XP'ye göre oyuncunun mevcut seviyesini hesaplar (1-100).
 * Tüm oyuncular Seviye 1'den başlar (totalXP = 0 ise Seviye 1).
 * @param {number} totalXP - Toplam kümülatif XP
 * @returns {number}
 */
function calculateLevel(totalXP) {
    totalXP = Math.max(0, Number(totalXP) || 0);

    for (let lvl = MAX_LEVEL; lvl >= 1; lvl--) {
        if (totalXP >= getRequiredTotalXP(lvl)) {
            return lvl;
        }
    }
    return 1;
}

/**
 * Oyuncuya XP ekler, seviye atlama ve ödülleri yönetir.
 * @param {Object} io - Socket.io sunucu örneği
 * @param {Object} players - Sunucu oyuncu haritası
 * @param {string} socketId - Oyuncunun socket kimliği
 * @param {Object} uData - Oyuncunun persistentData user nesnesi
 * @param {number} xpAmount - Eklenecek XP miktarı
 * @param {string} source - XP kazanım kaynağı ('tarim', 'maden', 'balik', 'masa_oyunu', 'blackjack', vb.)
 */
function addPlayerXP(io, players, socketId, uData, xpAmount, source = 'genel') {
    if (!uData) return;
    xpAmount = Number(xpAmount) || 0;
    if (xpAmount <= 0) return;

    if (!players && typeof dataManager !== 'undefined' && dataManager.serverContext) {
        players = dataManager.serverContext.players;
    }
    if (!io && typeof dataManager !== 'undefined' && dataManager.serverContext) {
        io = dataManager.serverContext.io;
    }

    const oldLevel = (uData.level !== undefined && uData.level !== null) ? Number(uData.level) : calculateLevel(Number(uData.totalXP) || 0);
    const minBaseXP = getRequiredTotalXP(oldLevel);
    // Eğer oyuncunun totalXP'si kayıtlı seviyesinin gerektirdiği taban XP'den düşükse, seviyenin tabanından başlat
    const currentBaseXP = Math.max(Number(uData.totalXP) || 0, minBaseXP);
    const newTotalXP = currentBaseXP + xpAmount;
    uData.totalXP = newTotalXP;

    const newLevel = Math.max(oldLevel, Math.min(MAX_LEVEL, calculateLevel(newTotalXP)));
    uData.level = newLevel;

    if (players && socketId && players[socketId]) {
        players[socketId].level = newLevel;
    }

    const socket = (io && io.sockets && io.sockets.sockets) ? io.sockets.sockets.get(socketId) : null;

    // Seviye atlandığında (newLevel > oldLevel)
    if (newLevel > oldLevel) {
        let rewardMoney = 0;
        let rewardDiamonds = 0;
        // Seviye 1 başlangıç seviyesidir ve seviye ödülü yoktur. Seviye ödülleri Seviye 2'den itibaren başlar:
        for (let lvl = Math.max(2, oldLevel + 1); lvl <= newLevel; lvl++) {
            rewardMoney += lvl * 1000;
            rewardDiamonds += lvl * 1;
        }

        uData.money = (Number(uData.money) || 0) + rewardMoney;
        uData.diamonds = (Number(uData.diamonds) || 0) + rewardDiamonds;

        if (players && socketId && players[socketId]) {
            players[socketId].money = uData.money;
            players[socketId].diamonds = uData.diamonds;
        }

        // Oyuncuya 'playerLevelUp' event'i fırlatılır
        if (socket) {
            socket.emit('playerLevelUp', {
                newLevel,
                oldLevel,
                rewardMoney,
                rewardDiamonds,
                currentMoney: uData.money,
                currentDiamonds: uData.diamonds,
                totalXP: newTotalXP,
                source
            });

            // Oyuncuya bakiye senkronizasyonu için 'updateEconomy' event'i fırlatılır
            socket.emit('updateEconomy', {
                money: uData.money,
                diamonds: uData.diamonds
            });

            // Geriye dönük uyumluluk bakiye güncellemesi
            socket.emit('moneyUpdate', uData.money);
            socket.emit('diamondUpdate', uData.diamonds);
        }

        // Mevcut odadaki herkese 'playerLevelBadgeUpdate' event'i fırlatılır
        const playerRoom = (players && socketId && players[socketId] && players[socketId].room) || null;
        if (io) {
            if (playerRoom) {
                io.to(playerRoom).emit('playerLevelBadgeUpdate', {
                    id: socketId,
                    level: newLevel
                });
            } else {
                io.emit('playerLevelBadgeUpdate', {
                    id: socketId,
                    level: newLevel
                });
            }
        }
    }

    // Her XP kazanımında istemciye anlık 'xpGained' event'i fırlatılır:
    // (gained, totalXP, currentLevel, currentProgress: totalXP - curBaseXP, targetXP: deltaXP, source)
    const curBaseXP = getRequiredTotalXP(newLevel);
    const deltaXP = (newLevel < MAX_LEVEL) ? getDeltaXP(newLevel + 1) : 0;
    const currentProgress = newTotalXP - curBaseXP;

    if (socket) {
        socket.emit('xpGained', {
            gained: xpAmount,
            totalXP: newTotalXP,
            currentLevel: newLevel,
            currentProgress: currentProgress,
            targetXP: deltaXP,
            source: source
        });
    }

    if (typeof dataManager !== 'undefined') {
        if (newLevel > oldLevel && typeof dataManager.flushNowSync === 'function') {
            dataManager.flushNowSync();
        } else if (dataManager.savePersistentData) {
            dataManager.savePersistentData();
        }
    }
}

/**
 * Masa oyunu tamamlandığında XP ve rozet sayacı dağıtımı:
 * - Masada en az 2 gerçek insan yoksa XP ve rozet sayacı İŞLEME ALINMAZ.
 * - Gerçek katılımcıların her biri için uData.gamerGamesCount artırılır.
 * - XP Dağıtımı:
 *   - batak, okey, okey101, dostkazigi: Kazanan 15 XP, Kaybeden 6 XP
 *   - chess, tavla, billiard: Kazanan 8 XP, Kaybeden 4 XP
 *   - xox, amiral: Kazanan 2 XP, Kaybeden 1 XP
 * - addPlayerXP(io, players, socketId, uData, xp, 'masa_oyunu') çağrılır.
 */
function handleTableGameEndXP(io, players, gameType, playerParticipants, winnerIdentifiers = []) {
    if (!playerParticipants || !Array.isArray(playerParticipants) || playerParticipants.length === 0) return;

    if (!players && typeof dataManager !== 'undefined' && dataManager.serverContext) {
        players = dataManager.serverContext.players;
    }
    if (!io && typeof dataManager !== 'undefined' && dataManager.serverContext) {
        io = dataManager.serverContext.io;
    }

    // Bot Kontrolü
    const isBot = (p) => {
        if (!p) return true;
        const pid = typeof p === 'string' ? p : (p.socketId || p.pid || p.id);
        const prof = typeof p === 'object' ? p : null;
        const name = (prof && prof.name) || (players && pid && players[pid] && players[pid].name) || '';
        return !pid || pid.startsWith('bot_') || (prof && prof.isBot) || name.startsWith('🤖') || name.includes('🤖');
    };

    const realHumans = playerParticipants.filter(p => !isBot(p));
    if (realHumans.length < 2) {
        // Masada en az 2 gerçek insan yoksa XP ve rozet sayacı işleme alınmaz!
        return;
    }

    const winners = Array.isArray(winnerIdentifiers) ? winnerIdentifiers : [winnerIdentifiers];

    realHumans.forEach(p => {
        const socketId = typeof p === 'string' ? p : (p.socketId || p.pid || p.id);
        const name = (typeof p === 'object' && p.name) || (players && socketId && players[socketId] && players[socketId].name) || (typeof p === 'string' ? p : '');
        const uKey = dataManager.findUserKey(name) || name;
        const uData = (uKey && dataManager.persistentData.users[uKey]);
        if (!uData) return;

        // Rozet kontrolü ve senkronizasyonu
        if (typeof dataManager.checkAndAwardBadgeLevelUp === 'function') {
            dataManager.checkAndAwardBadgeLevelUp(name, 'gamer');
        }
        if (players && socketId && players[socketId]) {
            players[socketId].gamerGamesCount = uData.gamerGamesCount;
        }

        // Kazanan tespiti
        const isWinner = winners.some(w => {
            if (!w) return false;
            if (typeof w === 'string') {
                return w === socketId || w.toLowerCase() === name.toLowerCase();
            }
            if (typeof w === 'object') {
                return (w.socketId && w.socketId === socketId) || (w.name && w.name.toLowerCase() === name.toLowerCase());
            }
            return false;
        });

        // XP Puanlaması
        let xp = 0;
        const g = (gameType || '').toLowerCase();
        if (['batak', 'okey', 'okey101', 'dostkazigi'].includes(g)) {
            xp = isWinner ? 15 : 6;
        } else if (['chess', 'tavla', 'billiard'].includes(g)) {
            xp = isWinner ? 8 : 4;
        } else if (['xox', 'amiral', 'amiralbatti'].includes(g)) {
            xp = isWinner ? 2 : 1;
        } else {
            xp = isWinner ? 8 : 4;
        }

        addPlayerXP(io, players, socketId, uData, xp, 'masa_oyunu');
    });

    dataManager.savePersistentData();
}

module.exports = {
    MAX_LEVEL,
    getDeltaXP,
    getRequiredTotalXP,
    calculateLevel,
    addPlayerXP,
    handleTableGameEndXP
};
