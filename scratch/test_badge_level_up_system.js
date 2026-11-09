const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:3000';
const TEST_USER = 'tb_' + Math.floor(Math.random() * 899999 + 100000);
const TEST_PASS = 'P@ssw0rd123!';

async function runTest() {
    console.log(`🚀 Starting Badge Level-Up & Scaling Reward Test for user: ${TEST_USER}`);

    const socket = io(SERVER_URL, {
        transports: ['websocket'],
        forceNew: true
    });

    await new Promise((resolve, reject) => {
        socket.on('connect', () => {
            console.log('✅ Connected to server socket');
            resolve();
        });
        socket.on('connect_error', reject);
    });

    const levelUpEvents = [];
    socket.on('badgeLevelUp', (data) => {
        console.log(`🎉 [SOCKET EVENT: badgeLevelUp]:`, data);
        levelUpEvents.push(data);
    });

    // 1. Register new user
    console.log('📝 Registering test user...');
    await new Promise((resolve, reject) => {
        socket.once('loginSuccess', (uData) => {
            console.log(`✅ Login success! Initial Money: ${uData.money} TL, Initial Diamonds: ${uData.diamonds || 0}`);
            resolve(uData);
        });
        socket.once('registerFailed', (msg) => {
            console.error('❌ Register failed:', msg);
            reject(new Error(msg));
        });
        socket.emit('register', {
            username: TEST_USER,
            password: TEST_PASS,
            gender: 'male',
            avatar: { model: 'classic_2', hat: 'none', hair: 'none' }
        });
    });

    // Wait brief moment for login events (resident badge check)
    await new Promise(r => setTimeout(r, 600));

    console.log(`Events received on login: ${levelUpEvents.length}`);
    const residentEvent = levelUpEvents.find(e => e.badgeId === 'resident');
    if (residentEvent) {
        console.log('⭐ Verified Metaverse Sakini Level 1 on registration:', residentEvent);
        if (residentEvent.level !== 1) throw new Error('Resident level should be 1');
        if (residentEvent.rewardMoney !== 1000) throw new Error('Resident rewardMoney should be 1000');
        if (residentEvent.rewardDiamonds !== 5) throw new Error('Resident rewardDiamonds should be 5');
    }

    // Access backend dataManager directly to simulate game / botanic actions
    const dataManager = require('../src/dataManager');

    // 2. Simulate Botanik 1st point (Level 1 threshold: 1..10)
    console.log('\n🌿 Simulating Botanik harvest: 1 point (Should trigger Level 1 Botanik)...');
    socket.emit('devSimulateBadgeProgress', { badgeKey: 'botanic', amount: 1 });

    await new Promise(r => setTimeout(r, 600));

    const botanicLvl1 = levelUpEvents.find(e => e.badgeId === 'botanic' && e.level === 1);
    if (!botanicLvl1) throw new Error('Botanik Level 1 event not received');
    console.log('Verifying Level 1 Botanik payload:', botanicLvl1);
    if (botanicLvl1.rewardMoney !== 1000) throw new Error(`Wrong rewardMoney: ${botanicLvl1.rewardMoney}`);
    if (botanicLvl1.rewardDiamonds !== 5) throw new Error(`Wrong rewardDiamonds: ${botanicLvl1.rewardDiamonds}`);
    console.log('✅ Level 1 Botanik verified (1000 TL, 5 Diamonds)!');

    // 3. Advance to 11 points (Level 2 threshold: 11..25)
    console.log('\n🌿 Simulating Botanik harvest: +10 points (total 11 -> Level 2 Botanik)...');
    socket.emit('devSimulateBadgeProgress', { badgeKey: 'botanic', amount: 10 });

    await new Promise(r => setTimeout(r, 600));

    const botanicLvl2 = levelUpEvents.find(e => e.badgeId === 'botanic' && e.level === 2);
    if (!botanicLvl2) throw new Error('Botanik Level 2 event not received');
    console.log('Verifying Level 2 Botanik payload:', botanicLvl2);
    if (botanicLvl2.rewardMoney !== 2000) throw new Error(`Wrong rewardMoney: ${botanicLvl2.rewardMoney} (expected 2000)`);
    if (botanicLvl2.rewardDiamonds !== 10) throw new Error(`Wrong rewardDiamonds: ${botanicLvl2.rewardDiamonds} (expected 10)`);
    console.log('✅ Level 2 Botanik verified (2000 TL, 10 Diamonds - 2x scaling)!');

    // 4. Advance to 26 points (Level 3 threshold: 26..50)
    console.log('\n🌿 Simulating Botanik harvest: +15 points (total 26 -> Level 3 Botanik)...');
    socket.emit('devSimulateBadgeProgress', { badgeKey: 'botanic', amount: 15 });

    await new Promise(r => setTimeout(r, 600));

    const botanicLvl3 = levelUpEvents.find(e => e.badgeId === 'botanic' && e.level === 3);
    if (!botanicLvl3) throw new Error('Botanik Level 3 event not received');
    console.log('Verifying Level 3 Botanik payload:', botanicLvl3);
    if (botanicLvl3.rewardMoney !== 3000) throw new Error(`Wrong rewardMoney: ${botanicLvl3.rewardMoney} (expected 3000)`);
    if (botanicLvl3.rewardDiamonds !== 15) throw new Error(`Wrong rewardDiamonds: ${botanicLvl3.rewardDiamonds} (expected 15)`);
    console.log('✅ Level 3 Botanik verified (3000 TL, 15 Diamonds - 3x scaling)!');

    // 5. Test another badge: Gamer badge (Batak/Tavla/Okey) -> 1 game -> Level 1 Gamer!
    console.log('\n🎮 Simulating board game played: 1 Batak game (Level 1 Gamer)...');
    socket.emit('devSimulateBadgeProgress', { badgeKey: 'batak', amount: 1 });

    await new Promise(r => setTimeout(r, 600));

    const gamerLvl1 = levelUpEvents.find(e => e.badgeId === 'gamer' && e.level === 1);
    if (!gamerLvl1) throw new Error('Gamer Level 1 event not received');
    console.log('Verifying Gamer Level 1 payload:', gamerLvl1);
    if (gamerLvl1.rewardMoney !== 1000) throw new Error(`Wrong rewardMoney: ${gamerLvl1.rewardMoney}`);
    if (gamerLvl1.rewardDiamonds !== 5) throw new Error(`Wrong rewardDiamonds: ${gamerLvl1.rewardDiamonds}`);
    console.log('✅ Level 1 Gamer badge verified (1000 TL, 5 Diamonds)!');

    // 6. Verify total user balance in database
    await new Promise(r => setTimeout(r, 2000));
    dataManager.loadPersistentData();
    const userKey = dataManager.findUserKey(TEST_USER);
    const uData = dataManager.persistentData.users[userKey];
    console.log('\n💰 Final User Data in Storage:', {
        money: uData.money,
        diamonds: uData.diamonds,
        claimedBadgeLevels: uData.claimedBadgeLevels
    });

    // Initial 1000 + 1000 (resident 1) + 1000 (botanic 1) + 2000 (botanic 2) + 3000 (botanic 3) + 1000 (gamer 1) = 9000 TL
    if (uData.money !== 9000) {
        throw new Error(`Expected total money 9000 TL, got ${uData.money}`);
    }
    // Diamonds: 0 + 5 (resident 1) + 5 (botanic 1) + 10 (botanic 2) + 15 (botanic 3) + 5 (gamer 1) = 40 Diamonds
    if (uData.diamonds !== 40) {
        throw new Error(`Expected total diamonds 40, got ${uData.diamonds}`);
    }

    console.log('✅ Total money (9000 TL) and diamonds (40 Elmas) 100% verified!');

    // Clean up test user
    delete dataManager.persistentData.users[userKey];
    dataManager.savePersistentData();
    console.log('🧹 Cleaned up test user data.');

    socket.disconnect();
    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!');
    process.exit(0);
}

runTest().catch((err) => {
    console.error('❌ Test Failed:', err);
    process.exit(1);
});
