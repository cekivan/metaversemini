// scratch/test_all_features.js
const assert = require('assert');
const levelSystem = require('../src/utils/levelSystem');
const badgeConfig = require('../public/js/badgeConfig');
const dataManager = require('../src/dataManager');
const { handleTableGameEndXP } = require('../src/utils/levelSystem');

console.log('--- TEST 1: Level System Math & Functions ---');
assert.strictEqual(levelSystem.MAX_LEVEL, 100);
assert.strictEqual(levelSystem.getDeltaXP(2), 20, 'Level 2 delta must be exactly 20 XP');
assert.strictEqual(levelSystem.getRequiredTotalXP(1), 0, 'Level 1 total required XP must be 0');
assert.strictEqual(levelSystem.getRequiredTotalXP(2), 20, 'Level 2 total required XP must be 20');
assert.strictEqual(levelSystem.calculateLevel(0), 1);
assert.strictEqual(levelSystem.calculateLevel(19), 1);
assert.strictEqual(levelSystem.calculateLevel(20), 2);

console.log('✅ Level system math passed');

console.log('--- TEST 2: addPlayerXP & Level Up Rewards ---');
let emittedEvents = [];
const mockSocket = {
    emit: (ev, data) => {
        emittedEvents.push({ ev, data });
    }
};
const mockIo = {
    sockets: {
        sockets: new Map([['sock_1', mockSocket]])
    },
    to: (r) => ({
        emit: (ev, data) => emittedEvents.push({ ev, data, room: r })
    }),
    emit: (ev, data) => emittedEvents.push({ ev, data })
};

const mockPlayers = {
    'sock_1': { name: 'testuser', money: 0, diamonds: 0, room: 'sokak', level: 1 }
};
const mockUData = {
    username: 'testuser',
    totalXP: 0,
    level: 1,
    money: 1000,
    diamonds: 0
};

// Add 10 XP (no level up)
levelSystem.addPlayerXP(mockIo, mockPlayers, 'sock_1', mockUData, 10, 'tarim');
assert.strictEqual(mockUData.totalXP, 10);
assert.strictEqual(mockUData.level, 1);
assert.strictEqual(mockUData.money, 1000);
assert.strictEqual(emittedEvents.some(e => e.ev === 'xpGained'), true);
assert.strictEqual(emittedEvents.some(e => e.ev === 'playerLevelUp'), false);

// Add 15 XP (total 25 XP -> Level 2 reached!)
// Reward for reaching lvl 2: 2 * 1000 TL = 2000 TL, 2 * 1 Diamond = 2 Diamonds
emittedEvents = [];
levelSystem.addPlayerXP(mockIo, mockPlayers, 'sock_1', mockUData, 15, 'tarim');
assert.strictEqual(mockUData.totalXP, 25);
assert.strictEqual(mockUData.level, 2);
assert.strictEqual(mockUData.money, 3000); // 1000 + 2000
assert.strictEqual(mockUData.diamonds, 2);
const lvlUpEv = emittedEvents.find(e => e.ev === 'playerLevelUp');
assert(lvlUpEv, 'playerLevelUp event must be emitted');
assert.strictEqual(lvlUpEv.data.newLevel, 2);
assert.strictEqual(lvlUpEv.data.rewardMoney, 2000);
assert.strictEqual(lvlUpEv.data.rewardDiamonds, 2);

const econEv = emittedEvents.find(e => e.ev === 'updateEconomy');
assert(econEv, 'updateEconomy event must be emitted');
assert.strictEqual(econEv.data.money, 3000);
assert.strictEqual(econEv.data.diamonds, 2);

const badgeEv = emittedEvents.find(e => e.ev === 'playerLevelBadgeUpdate');
assert(badgeEv, 'playerLevelBadgeUpdate event must be emitted to room');
assert.strictEqual(badgeEv.data.level, 2);

console.log('✅ addPlayerXP and Level Up rewards passed');

console.log('--- TEST 3: Botanic Config & Crop Durations ---');
const botanicHandler = require('../src/handlers/botanicHandler');
// Check sakayik definitions
const fs = require('fs');
const botanicCode = fs.readFileSync('src/handlers/botanicHandler.js', 'utf8');
assert(botanicCode.includes("'props_tohum_sakayik': { name: 'Şakayık Tohumu', price: 400"), 'Sakayik seed price must be 400');
assert(botanicCode.includes("'sakayik': { key: 'props_fide_sakayik', name: 'Şakayık Fidesi', sellPrice: 1800"), 'Sakayik fide sell price must be 1800');
assert(botanicCode.includes("'sakayik': { key: 'props_cicek_sakayik', name: 'Zarif Şakayık', sellPrice: 3600"), 'Sakayik flower sell price must be 3600');
assert(botanicCode.includes("flowerGrowthMs: 5400000"), 'Sakayik flowerGrowthMs must be 90 min (5.400.000 ms)');

console.log('✅ Botanic config passed');

console.log('--- TEST 4: Table Game Bot Control & XP Scoring ---');
// Scenario A: 1 Human + 1 Bot -> Should NOT award XP or badge
dataManager.persistentData.users['testuser'] = mockUData;
const botPlayers = [
    { socketId: 'sock_1', name: 'testuser', isBot: false },
    { socketId: 'bot_1', name: '🤖 Bot Ali', isBot: true }
];
const oldGamerCount = mockUData.gamerGamesCount || 0;
const oldTotalXP = mockUData.totalXP;
handleTableGameEndXP(mockIo, mockPlayers, 'tavla', botPlayers, ['sock_1']);
assert.strictEqual(mockUData.gamerGamesCount || 0, oldGamerCount, 'With <2 humans, gamerGamesCount must not increase');
assert.strictEqual(mockUData.totalXP, oldTotalXP, 'With <2 humans, XP must not be awarded');

// Scenario B: 2 Humans -> Batak: Winner 15 XP, Loser 6 XP
const user2Data = { totalXP: 0, level: 1, money: 500, diamonds: 0 };
dataManager.persistentData.users['human2'] = user2Data;
const mockSocket2 = { emit: () => {} };
mockIo.sockets.sockets.set('sock_2', mockSocket2);
mockPlayers['sock_2'] = { name: 'human2', money: 500, diamonds: 0, level: 1, room: 'sokak' };

const twoHumans = [
    { socketId: 'sock_1', name: 'testuser', isBot: false },
    { socketId: 'sock_2', name: 'human2', isBot: false }
];
handleTableGameEndXP(mockIo, mockPlayers, 'batak', twoHumans, ['sock_1']); // testuser wins
assert.strictEqual(mockUData.gamerGamesCount, 1, 'testuser gamerGamesCount should increment');
assert.strictEqual(user2Data.gamerGamesCount, 1, 'human2 gamerGamesCount should increment');
assert.strictEqual(mockUData.totalXP, oldTotalXP + 15, 'Winner of batak should get 15 XP');
assert.strictEqual(user2Data.totalXP, 6, 'Loser of batak should get 6 XP');

console.log('✅ Table games bot control and XP scoring passed');

console.log('--- TEST 5: Badge Tiers Config ---');
const gamerTiers = badgeConfig.BADGE_TIERS.gamer;
assert.strictEqual(gamerTiers[0].max, 10);
assert.strictEqual(gamerTiers[1].min, 11);
assert.strictEqual(gamerTiers[1].max, 25);
assert.strictEqual(gamerTiers[4].max, 250);
assert.strictEqual(gamerTiers[5].min, 251); // Bronz
assert.strictEqual(gamerTiers[9].min, 2501); // Siyah

const botanicTiers = badgeConfig.BADGE_TIERS.botanic;
assert.strictEqual(botanicTiers[0].max, 14);
assert.strictEqual(botanicTiers[1].min, 15);
assert.strictEqual(botanicTiers[4].max, 399);
assert.strictEqual(botanicTiers[5].min, 400); // Bronz
assert.strictEqual(botanicTiers[9].min, 3500); // Siyah

const fishingTiers = badgeConfig.BADGE_TIERS.fishing;
assert.strictEqual(fishingTiers[0].max, 24);
assert.strictEqual(fishingTiers[1].min, 25);
assert.strictEqual(fishingTiers[4].max, 799);
assert.strictEqual(fishingTiers[5].min, 800); // Bronz
assert.strictEqual(fishingTiers[9].min, 10000); // Siyah

const miningTiers = badgeConfig.BADGE_TIERS.mining;
assert.strictEqual(miningTiers[0].max, 24);
assert.strictEqual(miningTiers[1].min, 25);
assert.strictEqual(miningTiers[4].max, 799);
assert.strictEqual(miningTiers[5].min, 800); // Bronz
assert.strictEqual(miningTiers[9].min, 10000); // Siyah

// Test calculateUniversalBadgeTier
const resSelf = badgeConfig.calculateUniversalBadgeTier(150, 'botanic', 'Hasat', false);
assert.strictEqual(resSelf.level, 4);
assert.strictEqual(resSelf.title, 'Uzman Bahçıvan');
assert(resSelf.progressPct >= 0 && resSelf.progressPct <= 100);

const resOther = badgeConfig.calculateUniversalBadgeTier(150, 'botanic', 'Hasat', true);
assert.strictEqual(resOther.level, 4);
assert.strictEqual(resOther.isPrivate, true);

console.log('✅ Badge tiers configuration verified');
console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉\n');

