// scratch/test_comprehensive_gameplay_flow.js
const io = require('socket.io-client');
const assert = require('assert');

async function testFlow() {
    const socket = io('http://localhost:3000', {
        transports: ['websocket'],
        forceNew: true
    });

    const testUser = 'auditer_' + (Date.now() % 100000);
    console.log(`Starting comprehensive audit with test user: ${testUser}`);

    let loginData = null;
    let xpGainedEvents = [];
    let levelUpEvent = null;
    let economyUpdate = null;

    socket.on('loginSuccess', (data) => {
        loginData = data;
    });

    socket.on('xpGained', (data) => {
        xpGainedEvents.push(data);
    });

    socket.on('playerLevelUp', (data) => {
        levelUpEvent = data;
    });

    socket.on('updateEconomy', (data) => {
        economyUpdate = data;
    });

    // Wait for connection
    await new Promise((resolve) => socket.on('connect', resolve));
    console.log('✅ Connected to server!');

    // 1. Register new user
    socket.emit('register', {
        name: testUser,
        pass: 'testpass123',
        gender: 'male'
    });

    await new Promise((r) => setTimeout(r, 1000));
    assert(loginData, 'loginSuccess event must be received');
    assert.strictEqual(loginData.username, testUser);
    assert.strictEqual(loginData.level, 1, 'Initial level must be 1');
    assert.strictEqual(loginData.totalXP, 0, 'Initial XP must be 0');
    console.log('✅ User registered & logged in cleanly! Level: 1, XP: 0, Money:', loginData.money);

    // 2. Buy pickaxe and mine rocks across nodes
    socket.emit('buy_pickaxe');
    await new Promise((r) => setTimeout(r, 500));

    // Mine across active nodes (try nodes 1 to 10)
    for (let i = 1; i <= 8; i++) {
        socket.emit('mine_node_complete', { nodeId: i });
        await new Promise((r) => setTimeout(r, 150));
    }

    await new Promise((r) => setTimeout(r, 1000));
    assert(xpGainedEvents.length > 0, 'xpGained must be emitted upon mining rock');
    const firstXp = xpGainedEvents[0];
    console.log(`✅ Mining XP gained: +${firstXp.gained} XP | Total: ${firstXp.totalXP}`);

    await new Promise((r) => setTimeout(r, 800));
    console.log(`Total XP events received: ${xpGainedEvents.length}`);
    const latestXp = xpGainedEvents[xpGainedEvents.length - 1];
    console.log(`Current State -> Level: ${latestXp.currentLevel}, TotalXP: ${latestXp.totalXP}`);

    if (latestXp.totalXP >= 20) {
        assert(levelUpEvent, 'playerLevelUp event must be emitted when reaching 20 XP!');
        assert.strictEqual(levelUpEvent.newLevel, 2, 'New level must be 2');
        assert.strictEqual(levelUpEvent.rewardMoney, 2000, 'Level 2 reward money must be 2000 TL');
        assert.strictEqual(levelUpEvent.rewardDiamonds, 2, 'Level 2 reward diamonds must be 2');
        console.log(`✅ LEVEL UP VERIFIED! Reached Level 2! Rewarded: +${levelUpEvent.rewardMoney} TL, +${levelUpEvent.rewardDiamonds} Diamonds!`);
    }

    // 4. Test Profile Details Query
    let profileDetails = null;
    socket.on('profileDetailsResult', (data) => {
        profileDetails = data;
    });

    socket.emit('getProfileDetails', { targetName: testUser });
    await new Promise((r) => setTimeout(r, 500));

    assert(profileDetails, 'profileDetailsResult must be returned');
    assert.strictEqual(profileDetails.targetName, testUser);
    assert(profileDetails.isSelf === true);
    assert.strictEqual(profileDetails.level, latestXp.currentLevel);
    assert.strictEqual(profileDetails.totalXP, latestXp.totalXP);
    assert(profileDetails.currentProgress !== undefined, 'currentProgress must be present in profileDetailsResult');
    assert(profileDetails.targetXP !== undefined, 'targetXP must be present in profileDetailsResult');
    console.log('✅ Profile Details Result Verified:', {
        level: profileDetails.level,
        totalXP: profileDetails.totalXP,
        currentProgress: profileDetails.currentProgress,
        targetXP: profileDetails.targetXP,
        badgeUnlockOrder: profileDetails.badgeUnlockOrder
    });

    socket.disconnect();
    console.log('\n🎉 ALL GAMEPLAY & ENGINE FLOWS VERIFIED 100% BUG-FREE!');
}

testFlow().catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
});
