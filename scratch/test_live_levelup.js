// scratch/test_live_levelup.js
const io = require('socket.io-client');
const levelSystem = require('../src/utils/levelSystem');
const dataManager = require('../src/dataManager');

async function testLevelUp() {
    const socket = io('http://localhost:3000', {
        transports: ['websocket'],
        reconnection: false
    });

    await new Promise((resolve, reject) => {
        socket.on('connect', resolve);
        socket.on('connect_error', reject);
    });

    const testUser = 'LvlUpUser' + Math.floor(Math.random() * 89999 + 10000);
    console.log('Registering user for Level Up test:', testUser);

    await new Promise((resolve) => {
        socket.on('loginSuccess', (data) => {
            console.log('✅ Registered & Logged in as:', testUser);
            resolve();
        });
        socket.emit('register', { username: testUser, password: 'Password123!', gender: 'female' });
    });

    let levelUpData = null;
    let econData = null;
    let badgeUpdateData = null;

    socket.on('playerLevelUp', (data) => {
        console.log('🎉 [EVENT playerLevelUp]:', data);
        levelUpData = data;
    });

    socket.on('updateEconomy', (data) => {
        console.log('💰 [EVENT updateEconomy]:', data);
        econData = data;
    });

    socket.on('playerLevelBadgeUpdate', (data) => {
        console.log('🏷️ [EVENT playerLevelBadgeUpdate]:', data);
        badgeUpdateData = data;
    });

    // Simulate gaining 25 XP (enough to reach Level 2, which requires 20 XP)
    const uKey = dataManager.findUserKey(testUser);
    const uData = dataManager.persistentData.users[uKey];
    console.log('Current user data before XP:', { money: uData.money, diamonds: uData.diamonds, level: uData.level, totalXP: uData.totalXP });

    console.log('Adding 25 XP via levelSystem.addPlayerXP...');
    // We get io instance from dataManager.serverContext
    const srvContext = dataManager.serverContext;
    levelSystem.addPlayerXP(srvContext.io, srvContext.players, socket.id, uData, 25, 'tarim');

    await new Promise(r => setTimeout(r, 600));

    if (levelUpData && levelUpData.newLevel === 2) {
        console.log('✅ Level 2 reached! Rewards: Money =', levelUpData.rewardMoney, 'Diamonds =', levelUpData.rewardDiamonds);
    } else {
        console.error('❌ Level up data not as expected:', levelUpData);
        process.exit(1);
    }

    if (econData && econData.money === 3000 && econData.diamonds === 2) {
        console.log('✅ Economy updated! 1000 base + 2000 reward = 3000 TL, 2 Diamonds');
    } else {
        console.error('❌ Economy data not as expected:', econData);
        process.exit(1);
    }

    if (badgeUpdateData && badgeUpdateData.level === 2 && badgeUpdateData.id === socket.id) {
        console.log('✅ playerLevelBadgeUpdate verified!');
    } else {
        console.error('❌ playerLevelBadgeUpdate not received properly:', badgeUpdateData);
        process.exit(1);
    }

    socket.disconnect();
    console.log('\n🏆 ALL LEVEL SYSTEM LIVE INTEGRATION CHECKS PASSED!\n');
    process.exit(0);
}

testLevelUp().catch(err => {
    console.error('Level up test error:', err);
    process.exit(1);
});

