// scratch/test_badges_unit.js
const assert = require('assert');

// Simulate DOM for testing badgeView.js in Node
global.window = global;
global.document = {
    getElementById: function(id) {
        if (id === 'profileBadgesGrid') {
            return mockContainer;
        }
        return null;
    }
};

const appendedCards = [];
const mockContainer = {
    innerHTML: '',
    appendChild: function(child) {
        appendedCards.push(child);
    }
};

global.document.createElement = function(tag) {
    return {
        tag: tag,
        className: '',
        title: '',
        innerHTML: ''
    };
};

// Load badgeConfig and badgeView
const { BADGE_TIERS, BADGE_CONFIG, calculateUniversalBadgeTier, getBadgeDetails } = require('../public/js/badgeConfig.js');
global.BADGE_TIERS = BADGE_TIERS;
global.BADGE_CONFIG = BADGE_CONFIG;
global.calculateUniversalBadgeTier = calculateUniversalBadgeTier;
global.getBadgeDetails = getBadgeDetails;

const { renderProfileBadges } = require('../public/js/badgeView.js');

console.log("=== 1. BADGE TIERS & GLOW TEST ===");
const tiersTest = [
    { key: 'gamer', count: 5, expectedLevel: 1, expectedGlow: '' },
    { key: 'gamer', count: 300, expectedLevel: 6, expectedGlow: 'bronze' },
    { key: 'gamer', count: 600, expectedLevel: 7, expectedGlow: 'silver' },
    { key: 'gamer', count: 1200, expectedLevel: 8, expectedGlow: 'gold' },
    { key: 'gamer', count: 1800, expectedLevel: 9, expectedGlow: 'diamond' },
    { key: 'gamer', count: 3000, expectedLevel: 10, expectedGlow: 'black' },
    { key: 'botanic', count: 20, expectedLevel: 2, expectedGlow: '' },
    { key: 'botanic', count: 500, expectedLevel: 6, expectedGlow: 'bronze' },
    { key: 'fishing', count: 10000, expectedLevel: 10, expectedGlow: 'black' },
    { key: 'mining', count: 1800, expectedLevel: 7, expectedGlow: 'silver' }
];

tiersTest.forEach(t => {
    const details = getBadgeDetails(t.key, t.count, true);
    console.log(`[${t.key}] count=${t.count} -> Lv.${details.level} (${details.title}), glow='${details.glow}'`);
    assert.strictEqual(details.level, t.expectedLevel, `Expected level ${t.expectedLevel} but got ${details.level}`);
    assert.strictEqual(details.glow, t.expectedGlow, `Expected glow ${t.expectedGlow} but got ${details.glow}`);
});
console.log("-> Tier calculation passed!");

console.log("\n=== 2. RENDER PROFILE BADGES (OWN PROFILE) ===");
appendedCards.length = 0;
const testUserDataOwn = {
    gamerGamesCount: 1200,
    botanicHarvestCount: 45,
    fishCaughtCount: 15,
    minedRocksCount: 850
};
renderProfileBadges(testUserDataOwn, true);

assert.strictEqual(appendedCards.length, 4, "Should render 4 cards");
appendedCards.forEach((c, i) => {
    console.log(`Card ${i+1}: class='${c.className}'`);
    console.log(`  HTML: ${c.innerHTML.trim().replace(/\s+/g, ' ')}`);
    assert.ok(!c.innerHTML.includes('Rozet Kazanıldı'), "Should NOT include 'Rozet Kazanıldı'");
    assert.ok(c.innerHTML.includes('badge-progress-bar'), "Own profile should include progress bar");
    assert.ok(c.innerHTML.includes('badge-icon-box'), "Should include icon box");
});
console.log("-> Own profile render passed!");

console.log("\n=== 3. RENDER PROFILE BADGES (OTHER PLAYER PROFILE) ===");
appendedCards.length = 0;
const testUserDataOther = {
    batakGamesCount: 10,
    okeyGamesCount: 15,
    botanicHarvestPoints: 50,
    fishCount: 80,
    minedCount: 120
};
renderProfileBadges(testUserDataOther, false);

assert.strictEqual(appendedCards.length, 4, "Should render 4 cards with fallbacks");
appendedCards.forEach((c, i) => {
    console.log(`Card ${i+1} (Other): class='${c.className}'`);
    console.log(`  HTML: ${c.innerHTML.trim().replace(/\s+/g, ' ')}`);
    assert.ok(!c.innerHTML.includes('Rozet Kazanıldı'), "Should NOT include 'Rozet Kazanıldı'");
    assert.ok(!c.innerHTML.includes('badge-progress-bar'), "Other profile should NOT include progress bar");
    assert.ok(c.innerHTML.includes('Ulaşılan Kademe'), "Other profile should include 'Ulaşılan Kademe'");
});
console.log("-> Other player profile render passed!");

console.log("\n ALL UNIT TESTS PASSED SUCCESSFULLY! ");

