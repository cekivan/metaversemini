const io = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function registerClient(username, password) {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            socket.emit('register', {
                name: username,
                pass: password,
                gender: 'male'
            });
        });

        socket.on('loginSuccess', () => {
            resolve(socket);
        });

        socket.on('registerFailed', (err) => {
            reject(new Error(`Register failed for ${username}: ${err}`));
        });

        setTimeout(() => {
            reject(new Error(`Timeout registering ${username}`));
        }, 5000);
    });
}

async function runTests() {
    console.log('🚀 Starting Level 2 Requirements & Auto-Equip Mask Test...');
    const rnd = Math.floor(Math.random() * 89999 + 10000);
    const nameLevel2 = 'uLvl2_' + rnd;
    const nameLevel1 = 'uLvl1_' + rnd;
    const nameVictim = 'uVictim_' + rnd;

    const socketLvl2 = await registerClient(nameLevel2, 'pass123');
    const socketLvl1 = await registerClient(nameLevel1, 'pass123');
    const socketVictim = await registerClient(nameVictim, 'pass123');
    console.log(`✅ Logged in Lvl2 (${nameLevel2}), Lvl1 (${nameLevel1}), Victim (${nameVictim})`);

    // Give Lvl2: Level 2 (25 XP), 50.000 TL, 20 Diamonds
    socketLvl2.emit('adminAddXP', { targetUsername: nameLevel2, xp: 25, secret: 'metaverse_test_dev' });
    socketLvl2.emit('adminModifyMoney', { targetUsername: nameLevel2, amount: 50000, mode: 'set', secret: 'metaverse_test_dev' });
    socketLvl2.emit('adminModifyDiamonds', { targetUsername: nameLevel2, amount: 20, mode: 'set', secret: 'metaverse_test_dev' });

    // Give Lvl1: 50.000 TL, 20 Diamonds (0 XP, remains Level 1)
    socketLvl1.emit('adminModifyMoney', { targetUsername: nameLevel1, amount: 50000, mode: 'set', secret: 'metaverse_test_dev' });
    socketLvl1.emit('adminModifyDiamonds', { targetUsername: nameLevel1, amount: 20, mode: 'set', secret: 'metaverse_test_dev' });

    await wait(600);

    // All players move to vip_club
    socketLvl2.emit('changeRoom', { room: 'vip_club' });
    socketLvl1.emit('changeRoom', { room: 'vip_club' });
    socketVictim.emit('changeRoom', { room: 'vip_club' });
    await wait(600);

    // =========================================================================
    // TEST 1: Level 1 Player cannot buy Level 2 items (Izbandut, Mug Knife, Zeus)
    // =========================================================================
    console.log('\n--- 1. Testing Level 1 Restrictions ---');
    const errPromise1 = new Promise(resolve => socketLvl1.once('gameError', resolve));
    socketLvl1.emit('buyShadyItem', { itemId: 'izbandut' });
    const err1 = await errPromise1;
    console.log('Level 1 buying Izbandut got:', err1);
    if (!err1.includes('Seviye 2')) throw new Error('Level 1 should require Level 2 for Izbandut!');
    console.log('✅ Level 1 blocked from buying Izbandut!');

    const errPromise2 = new Promise(resolve => socketLvl1.once('gameError', resolve));
    socketLvl1.emit('buyShadyItem', { itemId: 'mug_knife' });
    const err2 = await errPromise2;
    console.log('Level 1 buying Mug Knife got:', err2);
    if (!err2.includes('Seviye 2')) throw new Error('Level 1 should require Level 2 for Mug Knife!');
    console.log('✅ Level 1 blocked from buying Mug Knife!');

    const errPromise3 = new Promise(resolve => socketLvl1.once('gameError', resolve));
    socketLvl1.emit('buyShadyItem', { itemId: 'zeus_yildirimi' });
    const err3 = await errPromise3;
    console.log('Level 1 buying Zeus got:', err3);
    if (!err3.includes('Seviye 2')) throw new Error('Level 1 should require Level 2 for Zeus!');
    console.log('✅ Level 1 blocked from buying Zeus!');

    // =========================================================================
    // TEST 2: Level 2 Player CAN buy Izbandut, Mug Knife, Zeus
    // =========================================================================
    console.log('\n--- 2. Testing Level 2 Purchases ---');
    // Buy Izbandut
    const shadyState1 = await new Promise(resolve => {
        socketLvl2.once('shadyShopState', resolve);
        socketLvl2.emit('buyShadyItem', { itemId: 'izbandut' });
    });
    console.log(`Lvl2 bought Izbandut: bodyguardCount = ${shadyState1.bodyguardCount}, max = ${shadyState1.maxBodyguards}`);
    if (shadyState1.bodyguardCount !== 1) throw new Error('Expected 1 bodyguard!');
    if (shadyState1.maxBodyguards !== 1) throw new Error('Expected maxBodyguards == 1 for Level 2!');
    console.log('✅ Level 2 successfully bought 1st bodyguard (max: 1)!');

    // Trying to buy 2nd bodyguard at Level 2 must fail!
    const errPromise4 = new Promise(resolve => socketLvl2.once('gameError', resolve));
    socketLvl2.emit('buyShadyItem', { itemId: 'izbandut' });
    const err4 = await errPromise4;
    console.log('Lvl2 buying 2nd bodyguard got:', err4);
    if (!err4.includes('limitiniz doldu') || !err4.includes('Seviye 20')) {
        throw new Error('Expected message indicating 2nd bodyguard unlocks at Level 20!');
    }
    console.log('✅ Level 2 blocked from 2nd bodyguard (properly informs next unlock at Level 20)!');

    // Buy Mug Knife at Level 2
    const shadyState2 = await new Promise(resolve => {
        socketLvl2.once('shadyShopState', resolve);
        socketLvl2.emit('buyShadyItem', { itemId: 'mug_knife' });
    });
    console.log(`Lvl2 bought Mug Knife: mugKnifeCount = ${shadyState2.mugKnifeCount}`);
    if (shadyState2.mugKnifeCount < 1) throw new Error('Expected mugKnifeCount >= 1');
    console.log('✅ Level 2 successfully bought Gasp Bıçağı (2 💎)!');

    // Buy Zeus at Level 2
    const shadyState3 = await new Promise(resolve => {
        socketLvl2.once('shadyShopState', resolve);
        socketLvl2.emit('buyShadyItem', { itemId: 'zeus_yildirimi' });
    });
    console.log(`Lvl2 bought Zeus: zeusCount = ${shadyState3.zeusCount}`);
    if (shadyState3.zeusCount < 1) throw new Error('Expected zeusCount >= 1');
    console.log('✅ Level 2 successfully bought Zeus\'un İlahi Yıldırımı (2 💎)!');

    // =========================================================================
    // TEST 3: Level 20 Guard Scaling (Can have 2 guards, not 3)
    // =========================================================================
    console.log('\n--- 3. Testing Level 20 Bodyguard Scaling (2 Guards) ---');
    socketLvl2.emit('adminAddXP', { targetUsername: nameLevel2, xp: 12000, secret: 'metaverse_test_dev' });
    await wait(600);

    // Buy 2nd guard at Level 20+
    const shadyStateLvl20 = await new Promise(resolve => {
        socketLvl2.once('shadyShopState', resolve);
        socketLvl2.emit('buyShadyItem', { itemId: 'izbandut' });
    });
    console.log(`Lvl20 bought 2nd Izbandut: count = ${shadyStateLvl20.bodyguardCount}, max = ${shadyStateLvl20.maxBodyguards}`);
    if (shadyStateLvl20.bodyguardCount !== 2) throw new Error('Expected 2 bodyguards at Level 20!');
    if (shadyStateLvl20.maxBodyguards !== 2) throw new Error('Expected maxBodyguards == 2 at Level 20!');
    console.log('✅ Level 20 successfully bought 2nd bodyguard (max: 2)!');

    // Trying to buy 3rd guard at Level 20 must fail and state Level 40 is required!
    const errPromise5 = new Promise(resolve => socketLvl2.once('gameError', resolve));
    socketLvl2.emit('buyShadyItem', { itemId: 'izbandut' });
    const err5 = await errPromise5;
    console.log('Lvl20 buying 3rd bodyguard got:', err5);
    if (!err5.includes('limitiniz doldu') || !err5.includes('Seviye 40')) {
        throw new Error('Expected message indicating 3rd bodyguard unlocks at Level 40!');
    }
    console.log('✅ Level 20 blocked from 3rd bodyguard (properly informs next unlock at Level 40)!');

    // =========================================================================
    // TEST 4: Level 40 Guard Scaling (Can have 3 guards)
    // =========================================================================
    console.log('\n--- 4. Testing Level 40 Bodyguard Scaling (3 Guards) ---');
    socketLvl2.emit('adminAddXP', { targetUsername: nameLevel2, xp: 65000, secret: 'metaverse_test_dev' });
    await wait(600);

    const shadyStateLvl40 = await new Promise(resolve => {
        socketLvl2.once('shadyShopState', resolve);
        socketLvl2.emit('buyShadyItem', { itemId: 'izbandut' });
    });
    console.log(`Lvl40 bought 3rd Izbandut: count = ${shadyStateLvl40.bodyguardCount}, max = ${shadyStateLvl40.maxBodyguards}`);
    if (shadyStateLvl40.bodyguardCount !== 3) throw new Error('Expected 3 bodyguards at Level 40!');
    if (shadyStateLvl40.maxBodyguards !== 3) throw new Error('Expected maxBodyguards == 3 at Level 40!');
    console.log('✅ Level 40 successfully bought 3rd bodyguard (max: 3)!');

    // =========================================================================
    // TEST 5: Auto-Equip Mask on Purchase & Early Removal
    // =========================================================================
    console.log('\n--- 5. Testing Anon Mask Auto-Equip on Purchase ---');
    const shadyStateMask = await new Promise(resolve => {
        socketLvl2.once('shadyShopState', resolve);
        socketLvl2.emit('buyShadyItem', { itemId: 'anon_mask' });
    });
    console.log(`Shady Shop State after buy: anonMaskExpiresAt = ${shadyStateMask.anonMaskExpiresAt}`);
    const now = Date.now();
    if (shadyStateMask.anonMaskExpiresAt <= now) {
        throw new Error('Mask should be IMMEDIATELY equipped on purchase!');
    }
    console.log('✅ Mask immediately equipped on purchase (30 min timer started automatically)!');

    // Remove mask early
    console.log('Testing early removal of mask...');
    const shadyStateMaskRemoved = await new Promise(resolve => {
        socketLvl2.once('shadyShopState', resolve);
        socketLvl2.emit('removeAnonMask');
    });
    console.log(`Shady Shop State after removal: anonMaskExpiresAt = ${shadyStateMaskRemoved.anonMaskExpiresAt}`);
    if (shadyStateMaskRemoved.anonMaskExpiresAt !== 0) {
        throw new Error('Expected anonMaskExpiresAt == 0 after removeAnonMask!');
    }
    console.log('✅ Mask removed early successfully, identity restored!');

    console.log('\n🎉 ALL LEVEL 2, LEVEL 20/40 SCALING & AUTO-EQUIP MASK TESTS PASSED! 🛡️⚡🎭');
    socketLvl2.disconnect();
    socketLvl1.disconnect();
    socketVictim.disconnect();
    process.exit(0);
}

runTests().catch(err => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
});
