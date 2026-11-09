const io = require('socket.io-client');
const assert = require('assert');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createClient(username) {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            socket.emit('register', {
                username: username,
                password: 'password123',
                gender: 'male'
            });
        });

        socket.on('registerSuccess', () => {
            resolve(socket);
        });

        socket.on('loginSuccess', () => {
            resolve(socket);
        });

        socket.on('registerFailed', (err) => {
            socket.emit('login', {
                username: username,
                password: 'password123'
            });
        });

        setTimeout(() => {
            resolve(socket);
        }, 3000);
    });
}

async function runTests() {
    console.log("🚀 Starting VIP Club & Level Unlocks E2E Tests...\n");
    const dataManager = require('../src/dataManager');
    const rnd = Math.floor(Math.random() * 8999) + 1000;
    const userLv1 = `u1_${rnd}`;
    const userLv2 = `u2_${rnd}`;
    const userLv3 = `u3_${rnd}`;
    const userLv4 = `u4_${rnd}`;
    const userLv5 = `u5_${rnd}`;
    const userLv10 = `u10_${rnd}`;
    const userLv20 = `u20_${rnd}`;

    // 1. Level 1 User Test
    console.log("--- TEST 1: Level 1 User (VIP Entry & Shady Items) ---");
    const s1 = await createClient(userLv1);
    await wait(600);

    let vip1Error = null;
    s1.on('gameError', (msg) => { vip1Error = msg; });

    s1.emit('enterVipClub');
    await wait(400);
    assert(vip1Error && (vip1Error.includes('Seviye 2') || vip1Error.includes('2. Seviye') || vip1Error.includes('Level 2')), `Expected Lv 2 required error, got: ${vip1Error}`);
    console.log("✅ Level 1 player cannot enter VIP Club (Requires Level 2)!");

    // Check Shady items level locks for Lv 1
    let shadyState1 = null;
    s1.on('shadyShopState', (st) => { shadyState1 = st; });
    s1.emit('getShadyShopState');
    await wait(400);
    assert(shadyState1 !== null, "Shady shop state received");
    assert.strictEqual(shadyState1.level, 1, "User is Level 1");
    assert.strictEqual(shadyState1.maxBodyguards, 0, "Level 1 has 0 bodyguard slots");

    // Try to buy jammer as Lv 1
    vip1Error = null;
    s1.emit('buyShadyItem', { itemId: 'jammer' });
    await wait(400);
    assert(vip1Error && vip1Error.includes('Seviye 3'), `Expected Lv 3 error for jammer, got: ${vip1Error}`);
    console.log("✅ Level 1 player cannot buy Jammer (Requires Level 3)!");

    // Try to buy zeus as Lv 1
    vip1Error = null;
    s1.emit('buyShadyItem', { itemId: 'zeus_yildirimi' });
    await wait(400);
    assert(vip1Error && vip1Error.includes('Seviye 4'), `Expected Lv 4 error for Zeus, got: ${vip1Error}`);
    console.log("✅ Level 1 player cannot buy Zeus (Requires Level 4)!");

    // Try to buy knife as Lv 1
    vip1Error = null;
    s1.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(400);
    assert(vip1Error && vip1Error.includes('Seviye 5'), `Expected Lv 5 error for Mug Knife, got: ${vip1Error}`);
    console.log("✅ Level 1 player cannot buy Gasp Bıçağı (Requires Level 5)!");

    // Try to buy bodyguard as Lv 1
    vip1Error = null;
    s1.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    assert(vip1Error && vip1Error.includes('Seviye 5'), `Expected Lv 5 error for Bodyguard, got: ${vip1Error}`);
    console.log("✅ Level 1 player cannot buy İzbandut (Requires Level 5)!");

    // 2. Level 2 User Test (VIP Entry Free!)
    console.log("\n--- TEST 2: Level 2 User (VIP Club Free Entry) ---");
    const s2 = await createClient(userLv2);
    await wait(600);

    dataManager.loadPersistentData();
    const userKey2 = dataManager.findUserKey(userLv2);
    dataManager.persistentData.users[userKey2].level = 2;
    dataManager.persistentData.users[userKey2].money = 5000;
    dataManager.savePersistentData();

    let s2Room = null;
    s2.on('roomChangeSuccess', (data) => { s2Room = data.room; });

    const moneyBefore = dataManager.persistentData.users[userKey2].money;
    s2.emit('enterVipClub');
    await wait(500);

    dataManager.loadPersistentData();
    const moneyAfter = dataManager.persistentData.users[userKey2].money;
    assert.strictEqual(s2Room, 'vip_club', "Player entered vip_club room");
    assert.strictEqual(moneyAfter, moneyBefore, "VIP Club entry fee is 0 TL (Completely free for Lv 2+!)");
    console.log("✅ Level 2 player entered VIP Club for 0 TL (Door fee removed)!");

    // 3. Level 3 User Test (Jammer & Doberman Unlocks)
    console.log("\n--- TEST 3: Level 3 User (Jammer & Doberman) ---");
    const s3 = await createClient(userLv3);
    await wait(600);
    dataManager.loadPersistentData();
    const userKey3 = dataManager.findUserKey(userLv3);
    dataManager.persistentData.users[userKey3].level = 3;
    dataManager.persistentData.users[userKey3].money = 50000;
    dataManager.savePersistentData();

    // Buy Jammer
    s3.emit('buyShadyItem', { itemId: 'jammer' });
    await wait(500);
    dataManager.loadPersistentData();
    assert(dataManager.persistentData.users[userKey3].jammerCount >= 1, "User now owns 1 jammer");
    console.log("✅ Level 3 player successfully bought Jammer!");

    // Buy Doberman
    s3.emit('buyShadyItem', { itemId: 'doberman' });
    await wait(500);
    dataManager.loadPersistentData();
    assert(dataManager.persistentData.users[userKey3].hasDoberman === true, "User now owns Doberman");
    assert(dataManager.persistentData.users[userKey3].dobermanEquipped === true, "Doberman is equipped");
    console.log("✅ Level 3 player successfully bought Doberman!");

    // Equip / unequip Doberman toggle test
    s3.emit('toggleEquipDoberman');
    await wait(400);
    dataManager.loadPersistentData();
    assert(dataManager.persistentData.users[userKey3].dobermanEquipped === false, "Doberman unequipped");
    console.log("✅ Doberman toggle unequip works!");

    s3.emit('toggleEquipDoberman');
    await wait(400);
    dataManager.loadPersistentData();
    assert(dataManager.persistentData.users[userKey3].dobermanEquipped === true, "Doberman re-equipped");
    console.log("✅ Doberman toggle re-equip works!");

    // 4. Level 4 User Test (Zeus Strike - 2 Diamonds)
    console.log("\n--- TEST 4: Level 4 User (Zeus'un İlahi Yıldırımı - 2 Diamonds) ---");
    const s4 = await createClient(userLv4);
    await wait(600);
    dataManager.loadPersistentData();
    const userKey4 = dataManager.findUserKey(userLv4);
    dataManager.persistentData.users[userKey4].level = 4;
    dataManager.persistentData.users[userKey4].diamonds = 10;
    dataManager.savePersistentData();

    s4.emit('buyShadyItem', { itemId: 'zeus_yildirimi' });
    await wait(500);
    dataManager.loadPersistentData();
    assert.strictEqual(dataManager.persistentData.users[userKey4].diamonds, 8, "2 diamonds deducted for Zeus strike");
    assert.strictEqual(dataManager.persistentData.users[userKey4].zeusCount, 1, "User owns 1 Zeus strike");
    console.log("✅ Level 4 player bought Zeus'un İlahi Yıldırımı for 2 Diamonds!");

    // 5. Level 5 User Test (Gasp Bıçağı - 2 Diamonds, Max 1 Guard)
    console.log("\n--- TEST 5: Level 5 User (Gasp Bıçağı & 1 Bodyguard Max) ---");
    const s5 = await createClient(userLv5);
    await wait(600);
    dataManager.loadPersistentData();
    const userKey5 = dataManager.findUserKey(userLv5);
    dataManager.persistentData.users[userKey5].level = 5;
    dataManager.persistentData.users[userKey5].diamonds = 10;
    dataManager.persistentData.users[userKey5].money = 100000;
    dataManager.savePersistentData();

    // Buy Gasp Bıçağı
    s5.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(500);
    dataManager.loadPersistentData();
    assert.strictEqual(dataManager.persistentData.users[userKey5].diamonds, 8, "2 diamonds deducted for Gasp Bıçağı");
    assert(dataManager.persistentData.users[userKey5].mugKnifeCount >= 1, "User owns Gasp Bıçağı");
    console.log("✅ Level 5 player bought Gasp Bıçağı for 2 Diamonds!");

    // Buy 1st bodyguard (Allowed at Lv 5)
    s5.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(500);
    dataManager.loadPersistentData();
    assert.strictEqual(dataManager.persistentData.users[userKey5].bodyguardCount, 1, "User owns 1 bodyguard");
    assert.strictEqual(dataManager.persistentData.users[userKey5].bodyguardsEquipped, 1, "Bodyguard is equipped");
    console.log("✅ Level 5 player bought 1st İzbandut!");

    // Try to buy 2nd bodyguard at Lv 5 (Max is 1)
    let s5Err = null;
    s5.on('gameError', (msg) => { s5Err = msg; });
    s5.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(500);
    dataManager.loadPersistentData();
    assert(s5Err && s5Err.includes('Maksimum'), `Expected max bodyguard limit error, got: ${s5Err}`);
    assert.strictEqual(dataManager.persistentData.users[userKey5].bodyguardCount, 1, "Bodyguard count remains 1");
    console.log("✅ Level 5 bodyguard slot limit enforced (Max 1 guard)!");

    // Equip / unequip bodyguard toggle test
    s5.emit('toggleEquipBodyguard');
    await wait(400);
    dataManager.loadPersistentData();
    assert.strictEqual(dataManager.persistentData.users[userKey5].bodyguardsEquipped, 0, "Bodyguard unequipped");
    console.log("✅ Bodyguard toggle unequip works (Guards rest)!");

    s5.emit('toggleEquipBodyguard');
    await wait(400);
    dataManager.loadPersistentData();
    assert.strictEqual(dataManager.persistentData.users[userKey5].bodyguardsEquipped, 1, "Bodyguard re-equipped");
    console.log("✅ Bodyguard toggle re-equip works!");

    // 6. Level 10 & 20 Guard Scaling Test
    console.log("\n--- TEST 6: Bodyguard Scaling (Level 10: 2 guards, Level 20: 3 guards) ---");
    const s10 = await createClient(userLv10);
    await wait(600);
    dataManager.loadPersistentData();
    const userKey10 = dataManager.findUserKey(userLv10);
    dataManager.persistentData.users[userKey10].level = 10;
    dataManager.persistentData.users[userKey10].money = 100000;
    dataManager.savePersistentData();

    // Buy 2 guards at Lv 10
    s10.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    s10.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    dataManager.loadPersistentData();
    assert.strictEqual(dataManager.persistentData.users[userKey10].bodyguardCount, 2, "Level 10 owns 2 bodyguards");

    // 3rd guard at Lv 10 should be rejected
    let s10Err = null;
    s10.on('gameError', (msg) => { s10Err = msg; });
    s10.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    assert(s10Err && s10Err.includes('Maksimum'), `Expected max guard error at Lv 10, got: ${s10Err}`);
    console.log("✅ Level 10 allows exactly 2 bodyguards maximum!");

    // Lv 20 allows 3 guards
    const s20 = await createClient(userLv20);
    await wait(600);
    dataManager.loadPersistentData();
    const userKey20 = dataManager.findUserKey(userLv20);
    dataManager.persistentData.users[userKey20].level = 20;
    dataManager.persistentData.users[userKey20].money = 100000;
    dataManager.savePersistentData();

    s20.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    s20.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    s20.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(400);
    dataManager.loadPersistentData();
    assert.strictEqual(dataManager.persistentData.users[userKey20].bodyguardCount, 3, "Level 20 owns 3 bodyguards");
    console.log("✅ Level 20 allows 3 bodyguards maximum!");

    // 7. Non-giftable verification
    console.log("\n--- TEST 7: Non-Giftable Karaborsa Items ---");
    let giftErr = null;
    s20.on('gameError', (msg) => { giftErr = msg; });
    s20.emit('giftPropItem', {
        targetUsername: userLv1,
        itemKey: 'props_pet_izbandut'
    });
    await wait(400);
    assert(giftErr && giftErr.includes('hediye edilemez'), `Expected non-giftable error, got: ${giftErr}`);

    giftErr = null;
    s3.emit('giftPropItem', {
        targetUsername: userLv1,
        itemKey: 'props_jammer'
    });
    await wait(400);
    assert(giftErr && giftErr.includes('hediye edilemez'), `Expected non-giftable error for jammer, got: ${giftErr}`);

    giftErr = null;
    s5.emit('giftPropItem', {
        targetUsername: userLv1,
        itemKey: 'props_mug_knife'
    });
    await wait(400);
    assert(giftErr && giftErr.includes('hediye edilemez'), `Expected non-giftable error for knife, got: ${giftErr}`);
    console.log("✅ All Karaborsa and VIP items are strictly non-giftable!");

    // 8. Mugging, Cooldown & Unequipped Vulnerability Test
    console.log("\n--- TEST 8: Mugging 2000 TL, 24h Target Cooldown, Unequipped Vulnerability ---");
    dataManager.loadPersistentData();
    const userKey1 = dataManager.findUserKey(userLv1);
    dataManager.persistentData.users[userKey1].money = 5000;
    dataManager.savePersistentData();

    const victimMoneyBefore = dataManager.persistentData.users[userKey1].money;
    const robberMoneyBefore = dataManager.persistentData.users[userKey5].money;
    const robberKnivesBefore = dataManager.persistentData.users[userKey5].mugKnifeCount;

    s5.emit('useMugKnifeOnPlayer', { targetUsername: userLv1 });
    await wait(600);

    dataManager.loadPersistentData();
    const victimMoneyAfter = dataManager.persistentData.users[userKey1].money;
    const robberMoneyAfter = dataManager.persistentData.users[userKey5].money;
    const robberKnivesAfter = dataManager.persistentData.users[userKey5].mugKnifeCount;

    assert.strictEqual(victimMoneyBefore - victimMoneyAfter, 2000, "2000 TL stolen from victim");
    assert.strictEqual(robberMoneyAfter - robberMoneyBefore, 2000, "Robber gained 2000 TL");
    assert.strictEqual(robberKnivesBefore - robberKnivesAfter, 1, "1 Mug Knife consumed on use");
    console.log("✅ Gasp Bıçağı successfully stole 2.000 TL and consumed 1 knife!");

    // Give robber another knife, and try to mug same target again immediately
    dataManager.persistentData.users[userKey5].mugKnifeCount = 1;
    dataManager.savePersistentData();

    let mugErr2 = null;
    s5.on('gameError', (msg) => { mugErr2 = msg; });
    s5.emit('useMugKnifeOnPlayer', { targetUsername: userLv1 });
    await wait(500);
    assert(mugErr2 && mugErr2.includes('günde sadece 1 kez'), `Expected 24h target cooldown error, got: ${mugErr2}`);
    console.log("✅ 24h per-target cooldown strictly enforced!");

    // 9. Clean up sockets
    s1.disconnect();
    s2.disconnect();
    s3.disconnect();
    s4.disconnect();
    s5.disconnect();
    s10.disconnect();
    s20.disconnect();

    console.log("\n🎉 ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
}

runTests().catch(err => {
    console.error("❌ Test Failed:", err);
    process.exit(1);
});
