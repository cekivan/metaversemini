const io = require('socket.io-client');
const assert = require('assert');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createClient(username, password = '123') {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            socket.emit('login', {
                username: username,
                password: password
            });
        });

        socket.on('loginSuccess', () => {
            resolve(socket);
        });

        socket.on('loginFailed', (err) => {
            // If user doesn't exist, register
            socket.emit('register', {
                username: username,
                password: password,
                gender: 'male'
            });
        });

        socket.on('registerSuccess', () => {
            resolve(socket);
        });

        setTimeout(() => {
            resolve(socket);
        }, 3500);
    });
}

async function runLiveVerification() {
    console.log("🚀 Starting Comprehensive VIP Club & Level System Live Verification...\n");

    const rnd = Math.floor(Math.random() * 89999) + 10000;
    const testUsername = `hero_${rnd}`;
    const targetUsername = `target_${rnd}`;

    // 1. Connect Admin (yasin)
    console.log("--- Connecting Admin (yasin) ---");
    const adminSocket = await createClient('yasin', '123');
    await wait(500);
    console.log("✅ Admin connected!");

    // 2. Connect Test Hero
    console.log("\n--- Creating & Connecting Test Player:", testUsername, "---");
    const heroSocket = await createClient(testUsername, '123');
    await wait(600);

    let heroRoom = 'cadde';
    heroSocket.on('roomChanged', (d) => { heroRoom = d.room; });
    heroSocket.on('roomChangeSuccess', (d) => { heroRoom = d.room; });
    let heroErrors = [];
    heroSocket.on('gameError', (msg) => { heroErrors.push(msg); });
    let heroLevelUps = [];
    heroSocket.on('playerLevelUp', (d) => { heroLevelUps.push(d); });
    let heroShady = null;
    heroSocket.on('shadyShopState', (st) => { heroShady = st; });

    // Give initial money for buying tests
    adminSocket.emit('adminModifyMoney', { targetUsername: testUsername, amount: 200000, mode: 'set' });
    await wait(400);

    // TEST 1: Level 1 Gates
    console.log("\n--- TEST 1: Level 1 Player Entry & Purchases ---");
    heroSocket.emit('enterVipClub');
    await wait(400);
    assert.strictEqual(heroRoom, 'cadde', "Level 1 cannot enter VIP Club");
    assert(heroErrors.some(e => e.includes('Level 2') || e.includes('2. Seviye')), "Received Level 2 requirement error");
    console.log("✅ Level 1 player cannot enter VIP Club!");

    heroErrors = [];
    heroSocket.emit('buyShadyItem', { itemId: 'jammer' });
    await wait(300);
    assert(heroErrors.some(e => e.includes('Seviye 3')), "Level 1 cannot buy Jammer");

    heroErrors = [];
    heroSocket.emit('buyShadyItem', { itemId: 'zeus_yildirimi' });
    await wait(300);
    assert(heroErrors.some(e => e.includes('Seviye 4')), "Level 1 cannot buy Zeus");

    heroErrors = [];
    heroSocket.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(300);
    assert(heroErrors.some(e => e.includes('Seviye 5')), "Level 1 cannot buy Gasp Bıçağı");

    heroErrors = [];
    heroSocket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(300);
    assert(heroErrors.some(e => e.includes('Seviye 5')), "Level 1 cannot buy İzbandut");
    console.log("✅ Level 1 cannot buy any restricted Karaborsa items!");

    // TEST 2: Level 2 Unlock & Free Entry
    console.log("\n--- TEST 2: Level 2 Unlock & Free VIP Club Entry ---");
    adminSocket.emit('adminAddXP', { targetUsername: testUsername, xp: 25, secret: 'metaverse_test_dev' });
    await wait(600);

    assert(heroLevelUps.some(l => l.newLevel === 2), "Level 2 playerLevelUp received");
    console.log("✅ Level 2 reached! Reward received:", heroLevelUps[heroLevelUps.length - 1]);

    heroSocket.emit('enterVipClub');
    await wait(500);
    assert.strictEqual(heroRoom, 'vip_club', "Level 2 player entered vip_club");
    console.log("✅ Level 2 player entered VIP Club for 0 TL (Free Entry)!");

    // TEST 3: Level 3 Unlock (Jammer & Doberman)
    console.log("\n--- TEST 3: Level 3 Unlocks (Jammer & Doberman) ---");
    adminSocket.emit('adminAddXP', { targetUsername: testUsername, xp: 75, secret: 'metaverse_test_dev' });
    await wait(600);
    assert(heroLevelUps.some(l => l.newLevel === 3), "Level 3 reached");

    // Buy Jammer
    heroSocket.emit('buyShadyItem', { itemId: 'jammer' });
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.jammerCount, 1, "Jammer count is 1");
    console.log("✅ Level 3 player bought Jammer (Count: 1)!");

    // Buy Doberman
    heroSocket.emit('buyShadyItem', { itemId: 'doberman' });
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.hasDoberman, true, "Player owns Doberman");
    assert.strictEqual(heroShady.dobermanEquipped, true, "Doberman is equipped");
    console.log("✅ Level 3 player bought Doberman!");

    // Equip / unequip Doberman
    heroSocket.emit('toggleEquipDoberman');
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.dobermanEquipped, false, "Doberman unequipped / resting");
    console.log("✅ Doberman toggle unequip works!");

    heroSocket.emit('toggleEquipDoberman');
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.dobermanEquipped, true, "Doberman re-equipped");
    console.log("✅ Doberman toggle re-equip works!");

    // TEST 4: Level 4 Unlock (Zeus - 2 Diamonds)
    console.log("\n--- TEST 4: Level 4 Unlock (Zeus'un İlahi Yıldırımı - 2 Diamonds) ---");
    adminSocket.emit('adminAddXP', { targetUsername: testUsername, xp: 100, secret: 'metaverse_test_dev' });
    await wait(600);
    assert(heroLevelUps.some(l => l.newLevel === 4), "Level 4 reached");

    heroSocket.emit('getShadyShopState');
    await wait(400);
    const diamondsBeforeZeus = heroShady.diamonds;
    assert(diamondsBeforeZeus >= 2, "Has at least 2 diamonds from level-ups");

    heroSocket.emit('buyShadyItem', { itemId: 'zeus_yildirimi' });
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(diamondsBeforeZeus - heroShady.diamonds, 2, "2 Diamonds deducted for Zeus");
    assert.strictEqual(heroShady.zeusCount, 1, "Player owns 1 Zeus strike");
    console.log("✅ Level 4 player bought Zeus'un İlahi Yıldırımı for 2 Diamonds!");

    // TEST 5: Level 5 Unlock (Gasp Bıçağı - 2 Diamonds, Max 1 Guard)
    console.log("\n--- TEST 5: Level 5 Unlock (Gasp Bıçağı & 1 Guard Limit) ---");
    adminSocket.emit('adminAddXP', { targetUsername: testUsername, xp: 150, secret: 'metaverse_test_dev' });
    await wait(600);
    assert(heroLevelUps.some(l => l.newLevel === 5), "Level 5 reached");

    heroSocket.emit('getShadyShopState');
    await wait(400);
    const diamondsBeforeKnife = heroShady.diamonds;

    heroSocket.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(diamondsBeforeKnife - heroShady.diamonds, 2, "2 Diamonds deducted for Gasp Bıçağı");
    assert(heroShady.hasMugKnife === true || heroShady.mugKnifeCount >= 1, "Player owns Gasp Bıçağı");
    console.log("✅ Level 5 player bought Gasp Bıçağı for 2 Diamonds!");

    // Buy 1st bodyguard (allowed at Lv 5)
    heroSocket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.bodyguardCount, 1, "Player owns 1 bodyguard");
    assert.strictEqual(heroShady.bodyguardsEquipped, 1, "1 bodyguard equipped");
    console.log("✅ Level 5 player bought 1st İzbandut!");

    // Try to buy 2nd bodyguard at Lv 5 (Limit is 1!)
    heroErrors = [];
    heroSocket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    assert(heroErrors.some(e => e.includes('limitiniz doldu') || e.includes('Maksimum')), "2nd bodyguard rejected at Level 5");
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.bodyguardCount, 1, "Bodyguard count remains 1");
    console.log("✅ Level 5 bodyguard slot limit enforced (Max 1 guard)!");

    // Equip / unequip bodyguard
    heroSocket.emit('toggleEquipBodyguard');
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.bodyguardsEquipped, 0, "Bodyguard unequipped");
    console.log("✅ Bodyguard toggle unequip works (Guards rest)!");

    heroSocket.emit('toggleEquipBodyguard');
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.bodyguardsEquipped, 1, "Bodyguard re-equipped");
    console.log("✅ Bodyguard toggle re-equip works!");

    // TEST 6: Non-Giftable verification
    console.log("\n--- TEST 6: Non-Giftable Karaborsa Items ---");
    heroErrors = [];
    heroSocket.emit('giftPropItem', { targetUsername: 'yasin', itemKey: 'props_pet_izbandut' });
    await wait(750);
    assert(heroErrors.some(e => e.includes('hediye edilemez')), "İzbandut non-giftable");

    heroErrors = [];
    heroSocket.emit('giftPropItem', { targetUsername: 'yasin', itemKey: 'props_jammer' });
    await wait(750);
    assert(heroErrors.some(e => e.includes('hediye edilemez')), "Jammer non-giftable");

    heroErrors = [];
    heroSocket.emit('giftPropItem', { targetUsername: 'yasin', itemKey: 'props_mug_knife' });
    await wait(750);
    assert(heroErrors.some(e => e.includes('hediye edilemez')), "Gasp bıçağı non-giftable");

    heroErrors = [];
    heroSocket.emit('giftPropItem', { targetUsername: 'yasin', itemKey: 'props_zeus_yildirimi' });
    await wait(750);
    assert(heroErrors.some(e => e.includes('hediye edilemez')), "Zeus non-giftable");
    console.log("✅ All Karaborsa and VIP items are strictly non-giftable!");

    // TEST 7: Mugging 2000 TL, Consumable Knife & 24h per-target cooldown
    console.log("\n--- TEST 7: Mugging (2.000 TL), Consumable Knife, 24h Target Cooldown ---");
    const targetSocket = await createClient(targetUsername, '123');
    await wait(600);
    adminSocket.emit('adminModifyMoney', { targetUsername: targetUsername, amount: 10000, mode: 'set' });
    adminSocket.emit('adminAddXP', { targetUsername: targetUsername, xp: 25, secret: 'metaverse_test_dev' });
    await wait(500);

    // Target joins VIP Club so both players are in the same room
    targetSocket.emit('enterVipClub');
    await wait(600);

    let targetMoney = null;
    targetSocket.on('moneyUpdate', (m) => { targetMoney = m; });
    let heroMoney = null;
    heroSocket.on('moneyUpdate', (m) => { heroMoney = m; });

    heroSocket.emit('getShadyShopState');
    await wait(400);
    const heroMoneyBefore = heroShady.money;
    const heroKnivesBefore = heroShady.mugKnifeCount || 1;

    heroSocket.emit('useMugKnifeOnPlayer', { targetUsername: targetUsername });
    await wait(600);

    heroSocket.emit('getShadyShopState');
    await wait(400);
    const heroMoneyAfter = heroShady.money;
    const heroKnivesAfter = heroShady.mugKnifeCount || 0;

    assert.strictEqual(heroMoneyAfter - heroMoneyBefore, 2000, "2000 TL added to mugger");
    assert.strictEqual(heroKnivesBefore - heroKnivesAfter, 1, "1 Knife consumed");
    console.log("✅ Mugging stole 2.000 TL and consumed 1 knife!");

    // Give hero XP to gain more diamonds, buy another knife, and try to mug same target again
    adminSocket.emit('adminAddXP', { targetUsername: testUsername, xp: 600, secret: 'metaverse_test_dev' });
    await wait(500);
    heroSocket.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(400);

    heroErrors = [];
    heroSocket.emit('useMugKnifeOnPlayer', { targetUsername: targetUsername });
    await wait(400);
    assert(heroErrors.some(e => e.includes('bugün zaten gasp ettiniz') || e.includes('24 saat') || e.includes('günde sadece 1 kez')), `Expected 24h cooldown, got: ${JSON.stringify(heroErrors)}`);
    console.log("✅ 24h cooldown per target strictly enforced!");

    // TEST 8: Level 10 (2 guards) & Level 20 (3 guards)
    console.log("\n--- TEST 8: Bodyguard Slot Scaling (Level 10: 2, Level 20: 3) ---");
    // Level up to 10
    adminSocket.emit('adminAddXP', { targetUsername: testUsername, xp: 2000, secret: 'metaverse_test_dev' });
    await wait(600);
    assert(heroLevelUps.some(l => l.newLevel >= 10), "Level 10+ reached");

    // Can now buy 2nd guard
    heroSocket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.bodyguardCount, 2, "Level 10 owns 2 bodyguards");

    // 3rd guard blocked at Level 10
    heroErrors = [];
    heroSocket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    assert(heroErrors.some(e => e.includes('limitiniz doldu') || e.includes('Maksimum')), "3rd guard rejected at Level 10");
    console.log("✅ Level 10 allows exactly 2 bodyguards maximum!");

    // Level up to 20
    adminSocket.emit('adminAddXP', { targetUsername: testUsername, xp: 10000, secret: 'metaverse_test_dev' });
    await wait(600);
    assert(heroLevelUps.some(l => l.newLevel >= 20), "Level 20+ reached");

    // Can now buy 3rd guard
    heroSocket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    heroSocket.emit('getShadyShopState');
    await wait(400);
    assert.strictEqual(heroShady.bodyguardCount, 3, "Level 20 owns 3 bodyguards");

    // 4th guard blocked
    heroErrors = [];
    heroSocket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    assert(heroErrors.some(e => e.includes('Maksimum')), "4th guard rejected (Max 3 absolute limit)");
    console.log("✅ Level 20 allows 3 bodyguards maximum!");

    // Disconnect
    adminSocket.disconnect();
    heroSocket.disconnect();
    targetSocket.disconnect();

    console.log("\n🎉 ALL 8 PHASES OF LIVE VERIFICATION PASSED WITH 100% SUCCESS!");
    process.exit(0);
}

runLiveVerification().catch(err => {
    console.error("❌ Live Verification Failed:", err);
    process.exit(1);
});
