// src/handlers/fishingHandler.js - Sahil ve Deniz Balıkçılık & "Denizden Babam Çıktı" Mini Oyunu
const config = require('../config');
const dataManager = require('../dataManager');
const petManager = require('../petManager');
const fatherPetManager = require('../fatherPetManager');
const { checkRateLimit } = require('../utils/securityUtils');
const { addPlayerXP } = require('../utils/levelSystem');

function registerFishingHandlers(io, socket, players, helpers) {
    const { playerFishingTimers } = helpers;

    // 1. SAHİL & SAHİL V2 BALIK TUTMA
    socket.on('startFishing', () => {
        if (!players[socket.id]) return;
        let room = players[socket.id].room;
        if (room !== 'sahil' && room !== 'sahilv2') return;
        if (!checkRateLimit(socket, 'startFishing', 3, 4000)) return;
        if (players[socket.id].isFishing) {
            socket.emit('gameError', "Zaten oltan denizde! Balığın vurmasını bekle...");
            return;
        }

        // Sahil v2 için su/iskele/kumsal konumu kontrolü
        if (room === 'sahilv2') {
            let px = players[socket.id].x;
            let py = players[socket.id].y;
            let hasSwan = !!players[socket.id].hasSwanBoat;
            // İskele kontrolü (y ≈ 6 + 0.576 * x)
            let onPier = (px >= 0 && px <= 675 && Math.abs(py - (6 + 0.576 * px)) <= 32);
            // Kıyı şeridi
            let shoreX = (py <= 120 ? 790 - (py/120)*35 : (py <= 240 ? 755 - ((py-120)/120)*115 : (py <= 360 ? 640 - ((py-240)/120)*155 : (py <= 480 ? 485 - ((py-360)/120)*170 : 315 - ((py-480)/145)*165))));
            let nearWater = (px <= shoreX + 45);

            if (!hasSwan && !onPier && !nearWater) {
                socket.emit('gameError', "Oltanı suya atabilmek için deniz kenarına, iskeleye gitmeli veya kuğu bisikleti kiralamalısın!");
                return;
            }
        }

        players[socket.id].isFishing = true;
        io.to(room).emit('playerFishingState', { id: socket.id, isFishing: true });
        socket.emit('fishingStarted', { duration: 10 });

        if (playerFishingTimers[socket.id]) clearTimeout(playerFishingTimers[socket.id]);

        playerFishingTimers[socket.id] = setTimeout(() => {
            if (!players[socket.id] || !players[socket.id].isFishing) return;
            players[socket.id].isFishing = false;
            delete playerFishingTimers[socket.id];

            let currentLootTable = players[socket.id].hasSwanBoat 
                ? config.SWAN_BOAT_LOOT_TABLE 
                : config.FISH_LOOT_TABLE;

            let totalWeight = currentLootTable.reduce((sum, item) => sum + item.weight, 0);
            let rand = Math.random() * totalWeight;
            let chosen = currentLootTable[0];
            let acc = 0;
            for (let item of currentLootTable) {
                acc += item.weight;
                if (rand <= acc) {
                    chosen = item;
                    break;
                }
            }

            let uName = players[socket.id].name;
            const uKey = (dataManager.findUserKey ? dataManager.findUserKey(uName) : null) || uName;

            // Denizden çıkan her şey (balık, hazine, baba) balık rozeti ve seviye XP'si için sayılır
            let uData = dataManager.persistentData.users[uKey];
            if (uData) {
                addPlayerXP(io, players, socket.id, uData, 1, 'balik');
            }
            dataManager.recordGamePlayed(uKey, 'fish', 1);
            if (uData && players[socket.id]) {
                players[socket.id].fishCaughtCount = uData.fishCaughtCount;
            }

            // Çok nadir "Denizden babam çıktı" deyimi kontrolü
            if (chosen.id === 'baban') {
                if (uData) dataManager.saveUserData(uName);
                dataManager.recordQuestProgress(uName, 'go_fishing', 1);
                io.to(room).emit('playerFishingState', { id: socket.id, isFishing: false });
                players[socket.id].pendingFatherChoice = true;
                socket.emit('fatherCaughtPrompt', {
                    title: "Denizden Baban Çıktı!",
                    proverb: "Denizden babam çıksa yerim...",
                    description: "Oltana takılan şey bir balık değil... Baban! Ne yapmak istersin?",
                    eatReward: 300,
                    playerGender: players[socket.id].gender || 'male'
                });
                return;
            }

            let earned = chosen.value;
            let activePet = (typeof petManager !== 'undefined') ? (petManager.getPetByUsername(uName) || petManager.getPetByOwnerId(socket.id)) : null;
            let hasDogBonus = !!(activePet && activePet.petType === 'dog');
            if (hasDogBonus && earned > 0) {
                earned = Math.round(earned * 1.5);
            }

            if (uData) {
                uData.money = (uData.money || 0) + earned;
                players[socket.id].money = uData.money;
                dataManager.saveUserData(uName);
                dataManager.recordQuestProgress(uName, 'go_fishing', 1);
                socket.emit('moneyUpdate', players[socket.id].money);
            }

            socket.emit('fishingResult', {
                loot: chosen,
                earned: earned,
                dogBonus: hasDogBonus,
                money: players[socket.id].money
            });

            io.to(room).emit('playerFishingState', { id: socket.id, isFishing: false });

            if (['levrek', 'ahtapot', 'inci', 'mercan', 'hazine'].includes(chosen.id)) {
                io.to(room).emit('systemMessage', `🎣 VAY CANINA! ${uName} denizden ${chosen.emoji} ${chosen.name} tuttu! (+${earned} TL${hasDogBonus ? ' 🐶 x1.5 Köpek Bonusu!' : ''})`);
            }
        }, 10000);
    });

    // 2. "Denizden Baban Çıktı" Seçim Olayı
    socket.on('fatherChoice', (data) => {
        if (!players[socket.id]) return;
        const choice = (data && data.choice) ? data.choice : 'spare';
        fatherPetManager.handleFatherChoice(socket, choice);
    });

    // 3. Balık Tutmayı İptal Etme
    socket.on('cancelFishing', () => {
        if (players[socket.id] && players[socket.id].isFishing) {
            players[socket.id].isFishing = false;
            if (playerFishingTimers[socket.id]) {
                clearTimeout(playerFishingTimers[socket.id]);
                delete playerFishingTimers[socket.id];
            }
            let r = players[socket.id].room;
            if (r) {
                io.to(r).emit('playerFishingState', { id: socket.id, isFishing: false });
            }
        }
    });
}

module.exports = {
    registerFishingHandlers
};

