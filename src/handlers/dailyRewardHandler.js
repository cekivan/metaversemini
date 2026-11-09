// src/handlers/dailyRewardHandler.js - 30 Günlük Günlük Giriş Ödülü ve Can Simidi Sistemi
const dataManager = require('../dataManager');
const { checkRateLimit } = require('../utils/securityUtils');

// 30 Günlük Ödül Tablosu: Gün N -> N * 500 TL & N * 1 Elmas
const DAILY_REWARDS = [];
for (let i = 1; i <= 30; i++) {
    DAILY_REWARDS.push({
        day: i,
        money: i * 500,
        diamonds: i * 1,
        isMilestone: (i === 7 || i === 14 || i === 21 || i === 30),
        milestoneTitle: i === 7 ? '1. Hafta Kutusu' :
                        i === 14 ? '2. Hafta Sandığı' :
                        i === 21 ? '3. Hafta Hazinesi' :
                        i === 30 ? 'Aylık Efsanevi Kasa' : null
    });
}

function getTodayDateStr() {
    // Türkiye saati (UTC+3)
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(new Date());
}

function getDayDiff(dateStr1, dateStr2) {
    if (!dateStr1 || !dateStr2) return null;
    const d1 = new Date(dateStr1 + 'T00:00:00Z');
    const d2 = new Date(dateStr2 + 'T00:00:00Z');
    return Math.round((d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24));
}

function getUserRewardStatus(uData) {
    const today = getTodayDateStr();
    if (!uData.dailyReward) {
        uData.dailyReward = {
            currentDay: 0,
            lastClaimDate: null,
            freezesUsed: 0,
            totalClaims: 0
        };
    }
    const dr = uData.dailyReward;
    if (typeof dr.currentDay !== 'number') dr.currentDay = 0;
    if (typeof dr.freezesUsed !== 'number') dr.freezesUsed = 0;
    if (typeof dr.totalClaims !== 'number') dr.totalClaims = 0;

    let canClaim = false;
    let isStreakBroken = false;
    let canFreeze = false;
    let freezeCost = 0;
    let nextDay = 1;
    let missedDays = 0;
    let hardReset = false; // 3 gün veya daha fazla girmediğinde hak yanar

    if (!dr.lastClaimDate) {
        // Yeni oyuncu / hiç ödül almamış: 1. Gün doğrudan hazır
        canClaim = true;
        nextDay = 1;
    } else {
        const diff = getDayDiff(today, dr.lastClaimDate);
        if (diff <= 0) {
            // Bugün zaten ödülünü aldı (veya saat farkı)
            canClaim = false;
            nextDay = (dr.currentDay % 30) + 1;
        } else if (diff === 1) {
            // Dün alındı, aralıksız seri (streak) devam ediyor
            canClaim = true;
            nextDay = (dr.currentDay % 30) + 1;
        } else {
            // diff >= 2: En az 1 gün kaçırıldı
            missedDays = Math.max(1, diff - 1);
            if (missedDays >= 3) {
                // Kullanıcı kuralı: 3 gün girmediyse can simidi hakkı yanar, 1. seviyeden başlar
                hardReset = true;
                isStreakBroken = true;
                canClaim = true;
                nextDay = 1;
            } else {
                // 1 veya 2 gün kaçırıldı (missedDays === 1 || missedDays === 2)
                if (dr.freezesUsed < 2) {
                    isStreakBroken = true;
                    canFreeze = true;
                    canClaim = true; // Bugün ödül alınabilir (can simidiyle veya sıfırlayarak)
                    // 1. kullanım 10 Elmas, 2. kullanım 20 Elmas
                    freezeCost = (dr.freezesUsed === 0) ? 10 : 20;
                    nextDay = (dr.currentDay % 30) + 1;
                } else {
                    // 2 can simidi hakkı da dolmuş
                    hardReset = true;
                    isStreakBroken = true;
                    canClaim = true;
                    nextDay = 1;
                }
            }
        }
    }

    return {
        today,
        currentDay: dr.currentDay,
        lastClaimDate: dr.lastClaimDate,
        freezesUsed: dr.freezesUsed,
        maxFreezes: 2,
        totalClaims: dr.totalClaims,
        canClaim,
        isStreakBroken,
        canFreeze,
        freezeCost,
        nextDay,
        missedDays,
        hardReset,
        rewards: DAILY_REWARDS,
        userDiamonds: Number(uData.diamonds) || 0,
        userMoney: Number(uData.money) || 0
    };
}

function registerDailyRewardHandlers(io, socket, players, helpers) {
    // 1. Durum Sorgulama
    socket.on('dailyReward:getStatus', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name || players[socket.id].username;
        if (!username) return;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        const status = getUserRewardStatus(uData);
        socket.emit('dailyReward:status', status);
    });

    // 2. Ödülü Talep Etme
    socket.on('dailyReward:claim', async (data) => {
        if (!players[socket.id]) return;
        if (!checkRateLimit(socket, 'dailyRewardClaim', 3, 2000)) return;

        const username = players[socket.id].name || players[socket.id].username;
        if (!username) return;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        const status = getUserRewardStatus(uData);
        const today = status.today;

        // Zaten alınmış mı kontrolü
        if (!status.canClaim) {
            socket.emit('dailyReward:error', { message: 'Bugünkü günlük ödülünüzü zaten aldınız! Yeni ödül yarın saat 00:00\'da.' });
            return;
        }

        let targetDay = 1;

        if (status.isStreakBroken) {
            const wantFreeze = !!(data && data.useFreeze);
            if (wantFreeze) {
                if (!status.canFreeze || status.hardReset) {
                    socket.emit('dailyReward:error', { message: 'Can simidi hakkınız bulunmuyor veya 3 gün girmediğiniz için süresi doldu!' });
                    return;
                }
                const curDiamonds = Number(uData.diamonds) || 0;
                if (curDiamonds < status.freezeCost) {
                    socket.emit('dailyReward:error', { message: `Yetersiz elmas! Can Simidi ile seriyi kurtarmak için ${status.freezeCost} Elmas gerekiyor (Mevcut: ${curDiamonds} 💎).` });
                    return;
                }

                // Elması düş ve can simidini tüket
                uData.diamonds = curDiamonds - status.freezeCost;
                uData.dailyReward.freezesUsed = (uData.dailyReward.freezesUsed || 0) + 1;
                targetDay = status.nextDay;
            } else {
                // Kullanıcı sıfırlamayı seçti veya hakkı yandı
                targetDay = 1;
            }
        } else {
            // Normal aralıksız giriş
            targetDay = status.nextDay;
        }

        if (targetDay < 1 || targetDay > 30) targetDay = 1;

        const rewardMoney = targetDay * 500;
        const rewardDiamonds = targetDay * 1;

        // Bakiye artışı
        uData.money = (Number(uData.money) || 0) + rewardMoney;
        uData.diamonds = (Number(uData.diamonds) || 0) + rewardDiamonds;

        if (players[socket.id]) {
            players[socket.id].money = uData.money;
            players[socket.id].diamonds = uData.diamonds;
        }

        // dailyReward state güncellemesi
        uData.dailyReward.currentDay = targetDay;
        uData.dailyReward.lastClaimDate = today;
        uData.dailyReward.totalClaims = (uData.dailyReward.totalClaims || 0) + 1;

        // 30. gün tamamlandığında döngü başa dönecek, can simidi hakları da yenilenir
        if (targetDay === 30) {
            uData.dailyReward.freezesUsed = 0;
        }

        // Veritabanına kaydet
        await dataManager.saveUserData(uKey, {
            money: uData.money,
            diamonds: uData.diamonds,
            dailyReward: uData.dailyReward
        });

        // İstemciye güncelleme ve başarı olaylarını fırlat
        socket.emit('moneyUpdate', uData.money);
        socket.emit('diamondUpdate', uData.diamonds);

        socket.emit('dailyReward:claimed', {
            success: true,
            day: targetDay,
            rewardMoney,
            rewardDiamonds,
            newMoney: uData.money,
            newDiamonds: uData.diamonds,
            freezesUsed: uData.dailyReward.freezesUsed,
            currentDay: targetDay,
            today
        });

        socket.emit('systemMessage', `🎁 TEBRİKLER! ${targetDay}. Gün Ödülünüzü aldınız: +${rewardMoney.toLocaleString('tr-TR')} TL & +${rewardDiamonds} Elmas!`);
    });
}

module.exports = {
    DAILY_REWARDS,
    getTodayDateStr,
    getDayDiff,
    getUserRewardStatus,
    registerDailyRewardHandlers
};
