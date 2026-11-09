// scratch/test_badge_order_and_titles.js
const assert = require('assert');
const dataManager = require('../src/dataManager');

console.log('--- 1. Testing Oyunbaz Naming & Titles in dataManager ---');
assert.strictEqual(dataManager.BADGE_CONFIG.gamer.name, 'Oyunbaz');
assert.strictEqual(dataManager.BADGE_CONFIG.gamer.shortName, 'Oyunbaz');

const gamerTiers = dataManager.BADGE_TIER_TABLES.gamer;
assert.strictEqual(gamerTiers.find(t => t.level === 2).title, 'Masa yancısı');
assert.strictEqual(gamerTiers.find(t => t.level === 7).title, 'Racon Kesici');
assert.strictEqual(gamerTiers.find(t => t.level === 10).title, 'Oyunbaz');
console.log('✅ dataManager Oyunbaz titles verified!');

console.log('--- 2. Testing badgeUnlockOrder in dataManager.recordGamePlayed ---');
const testUser = 'unit_tester_order_' + Date.now();
dataManager.persistentData.users[testUser] = {
    name: testUser,
    totalXP: 0,
    money: 1000,
    diamonds: 0,
    minedRocksCount: 0,
    fishCaughtCount: 0,
    gamerGamesCount: 0,
    botanicHarvestCount: 0
};

// Player mines first
dataManager.recordGamePlayed(testUser, 'mining');
assert.deepStrictEqual(dataManager.persistentData.users[testUser].badgeUnlockOrder, ['resident', 'mining']);

// Player fishes second
dataManager.recordGamePlayed(testUser, 'fish');
assert.deepStrictEqual(dataManager.persistentData.users[testUser].badgeUnlockOrder, ['resident', 'mining', 'fishing']);

// Player plays batak third
dataManager.recordGamePlayed(testUser, 'batak');
assert.deepStrictEqual(dataManager.persistentData.users[testUser].badgeUnlockOrder, ['resident', 'mining', 'fishing', 'gamer']);
console.log('✅ dataManager badgeUnlockOrder recording & normalization verified!');

console.log('--- 3. Testing Frontend badgeConfig.js ---');
const fs = require('fs');
const badgeConfigCode = fs.readFileSync('public/js/badgeConfig.js', 'utf8');
const vm = require('vm');
const sandbox = { window: {}, socket: { on: () => {}, emit: () => {} } };
vm.createContext(sandbox);
vm.runInContext(badgeConfigCode + '; window.BADGE_TIERS = BADGE_TIERS; window.BADGE_CONFIG = BADGE_CONFIG; window.calculateUniversalBadgeTier = calculateUniversalBadgeTier;', sandbox);

const feGamerTiers = sandbox.window.BADGE_TIERS.gamer;
assert.strictEqual(feGamerTiers.find(t => t.level === 2).title, 'Masa yancısı');
assert.strictEqual(feGamerTiers.find(t => t.level === 7).title, 'Racon Kesici');
assert.strictEqual(feGamerTiers.find(t => t.level === 10).title, 'Oyunbaz');

const feGamerCfg = sandbox.window.BADGE_CONFIG.find(c => c.id === 'gamer');
assert.strictEqual(feGamerCfg.name, 'Oyunbaz');
assert.strictEqual(feGamerCfg.shortName, 'Oyunbaz');
console.log('✅ Frontend badgeConfig.js Oyunbaz titles verified!');

console.log('--- 4. Testing Frontend social.js renderProfileSquareBadges sorting ---');
// Mock DOM
let renderedHtml = '';
sandbox.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (id === 'profileBadgesGrid') {
            return {
                set innerHTML(val) { renderedHtml = val; }
            };
        }
        return null;
    }
};

const socialCode = fs.readFileSync('public/js/social.js', 'utf8');
vm.runInContext(socialCode, sandbox);

// Case A: User's exact scenario from screenshot:
// Mining count = 16, Fish count = 1, Gamer count = 0, Botanic count = 0
// badgeUnlockOrder = ['resident', 'fish', 'mining'] (or ['resident', 'mining', 'fish'])
sandbox.renderProfileSquareBadges({
    seniorityDays: 1,
    minedRocksCount: 16,
    fishCaughtCount: 1,
    gamerGamesCount: 0,
    botanicHarvestCount: 0,
    badgeUnlockOrder: ['resident', 'mining', 'fish']
}, true);

// Check cachedCurrentBadgeDataList:
// Should have: resident, mining, fishing. (gamer and botanic with level 0 must NOT be in the list!)
const badgeList = vm.runInContext('cachedCurrentBadgeDataList', sandbox);
console.log('Generated badge list:', badgeList.map(b => `${b.badgeId} (Lv. ${b.level})`));
assert.strictEqual(badgeList.length, 3, 'Only 3 earned badges should be in the list');
assert.strictEqual(badgeList[0].badgeId, 'resident', 'Slot 1 must always be resident/level');
assert.strictEqual(badgeList[1].badgeId, 'mining', 'Slot 2 must be mining (earned first)');
assert.strictEqual(badgeList[2].badgeId, 'fishing', 'Slot 3 must be fishing (earned second)');

// Ensure rendered HTML has 3 earned badges and 9 empty slots
const totalSlots = (renderedHtml.match(/class="[^"]*profile-badge-square[^"]*"/g) || []).length;
const emptySlots = (renderedHtml.match(/class="[^"]*empty-slot[^"]*"/g) || []).length;
const filledSlots = totalSlots - emptySlots;
console.log(`Rendered HTML: ${totalSlots} total slots -> ${filledSlots} active badge slots, ${emptySlots} empty slots`);
assert.strictEqual(totalSlots, 12, 'Must have exactly 12 slots total');
assert.strictEqual(filledSlots, 3, 'Must have exactly 3 filled badge squares');
assert.strictEqual(emptySlots, 9, 'Must have exactly 9 empty dashed squares');

console.log('--- 4.1 Testing Slot 1 Huge Level Number & XP Progression ---');
// Slot 1 must be profile-level-badge-slot with badge-huge-level-number
assert(renderedHtml.includes('profile-level-badge-slot'), 'Slot 1 must have class profile-level-badge-slot');
assert(renderedHtml.includes('badge-huge-level-number'), 'Slot 1 must contain badge-huge-level-number');
// Check that Slot 1 has NO badge-level-tag underneath
const slot1Html = renderedHtml.split('profileBadgeSquare_0')[1].split('profileBadgeSquare_1')[0];
assert(!slot1Html.includes('badge-level-tag'), 'Slot 1 must NOT contain badge-level-tag!');
assert(slot1Html.includes('<span class="badge-huge-level-number '), 'Slot 1 must have badge-huge-level-number');

// Check XP progression on resident badge
assert.strictEqual(badgeList[0].unit, 'XP', 'Resident badge unit must be XP');
console.log(`Slot 1: Level ${badgeList[0].level} (${badgeList[0].title}), Progress: ${badgeList[0].count} / ${badgeList[0].targetCount} ${badgeList[0].unit} (%${badgeList[0].progressPct})`);
console.log('✅ Slot 1 Huge Level Number and Live XP progression verified!');

// Case B: Testing Oyunbaz thresholds for all levels (user requested numbers)
const expectedTiers = [
    { count: 1, level: 1, title: 'Acemi Oyuncu' },
    { count: 9, level: 1, title: 'Acemi Oyuncu' },
    { count: 10, level: 2, title: 'Masa yancısı' },
    { count: 24, level: 2, title: 'Masa yancısı' },
    { count: 25, level: 3, title: 'Kıdemli Oyuncu' },
    { count: 49, level: 3, title: 'Kıdemli Oyuncu' },
    { count: 50, level: 4, title: 'Uzman Oyuncu' },
    { count: 99, level: 4, title: 'Uzman Oyuncu' },
    { count: 100, level: 5, title: 'Usta Oyuncu' },
    { count: 199, level: 5, title: 'Usta Oyuncu' },
    { count: 200, level: 6, title: 'Büyük Usta', glow: 'badge-glow-bronze' },
    { count: 349, level: 6, title: 'Büyük Usta', glow: 'badge-glow-bronze' },
    { count: 350, level: 7, title: 'Racon Kesici', glow: 'badge-glow-silver' },
    { count: 599, level: 7, title: 'Racon Kesici', glow: 'badge-glow-silver' },
    { count: 600, level: 8, title: 'Şampiyon', glow: 'badge-glow-gold' },
    { count: 999, level: 8, title: 'Şampiyon', glow: 'badge-glow-gold' },
    { count: 1000, level: 9, title: 'Hükümdar', glow: 'badge-glow-diamond' },
    { count: 1499, level: 9, title: 'Hükümdar', glow: 'badge-glow-diamond' },
    { count: 1500, level: 10, title: 'Oyunbaz', glow: 'badge-glow-black' },
    { count: 5000, level: 10, title: 'Oyunbaz', glow: 'badge-glow-black' }
];

expectedTiers.forEach(testCase => {
    const t = sandbox.window.calculateUniversalBadgeTier(testCase.count, 'gamer');
    assert.strictEqual(t.level, testCase.level, `Count ${testCase.count} should be Level ${testCase.level}, got ${t.level}`);
    assert.strictEqual(t.title, testCase.title, `Count ${testCase.count} should have title ${testCase.title}, got ${t.title}`);
    if (testCase.glow) {
        assert.strictEqual(t.glowClass, testCase.glow, `Count ${testCase.count} should have glow ${testCase.glow}`);
    }
});
console.log('✅ All 10 Oyunbaz tiers with exact requested numbers verified successfully!');

console.log('✅ ALL UNIT TESTS PASSED PERFECTLY!');
