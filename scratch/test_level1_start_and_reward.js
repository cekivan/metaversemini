// scratch/test_level1_start_and_reward.js
const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3000';

async function runTest() {
    console.log('--- Starting Level 1 Start & Level 2 Reward Test ---');
    const username = 't_lvl1_' + Math.floor(1000 + Math.random() * 9000);
    const password = 'Password123!';

    const socket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: false
    });

    let playerLevelUpEvents = [];
    let badgeLevelUpEvents = [];
    let xpGainedEvents = [];

    socket.on('playerLevelUp', (data) => {
        console.log('RECEIVED playerLevelUp:', data);
        playerLevelUpEvents.push(data);
    });

    socket.on('badgeLevelUp', (data) => {
        console.log('RECEIVED badgeLevelUp:', data);
        badgeLevelUpEvents.push(data);
    });

    socket.on('xpGained', (data) => {
        console.log('RECEIVED xpGained:', data);
        xpGainedEvents.push(data);
    });

    await new Promise((resolve, reject) => {
        socket.on('connect', () => {
            console.log('Connected to socket server.');
            resolve();
        });
        socket.on('connect_error', reject);
    });

    // 1. Register new user
    console.log('Registering user:', username);
    const loginData = await new Promise((resolve, reject) => {
        socket.once('loginSuccess', resolve);
        socket.once('registerFailed', (err) => reject(new Error(err)));
        socket.emit('register', {
            username: username,
            pass: password,
            gender: 'male',
            avatar: { head: 1, body: 1 }
        });
    });

    console.log('Registered successfully! Received loginSuccess.');
    await new Promise(r => setTimeout(r, 600));

    console.log('\n--- 1. Checking Initial Registration State ---');
    console.log('Level at registration:', loginData.level);
    console.log('TotalXP at registration:', loginData.totalXP);
    console.log('TargetXP at registration:', loginData.targetXP);
    console.log('CurrentProgress at registration:', loginData.currentProgress);
    console.log('Starting money:', loginData.money);
    console.log('Starting diamonds:', loginData.diamonds);
    console.log('playerLevelUp events received:', playerLevelUpEvents.length);
    console.log('badgeLevelUp events received:', badgeLevelUpEvents.length);

    if (playerLevelUpEvents.length > 0) {
        throw new Error('FAIL: playerLevelUp was received on registration!');
    }
    if (badgeLevelUpEvents.length > 0) {
        throw new Error('FAIL: badgeLevelUp was received on registration!');
    }
    if (loginData.level !== 1) {
        throw new Error('FAIL: Expected initial level to be 1, got ' + loginData.level);
    }
    if (loginData.totalXP !== 0) {
        throw new Error('FAIL: Expected initial totalXP to be 0, got ' + loginData.totalXP);
    }
    if (loginData.targetXP !== 20) {
        throw new Error('FAIL: Expected initial targetXP to be 20 for Level 1 -> 2, got ' + loginData.targetXP);
    }
    if (loginData.money !== 1000) {
        throw new Error('FAIL: Expected starting money to be 1000 TL, got ' + loginData.money);
    }
    console.log('✅ Initial registration check PASSED! Level 1, 0 XP, targetXP=20, 1.000 TL, 0 spam popups.');

    // 2. Request profile details (self)
    console.log('\n--- 2. Checking getProfileDetails for Self ---');
    const profileSelf = await new Promise((resolve) => {
        socket.once('profileDetailsResult', resolve);
        socket.emit('getProfileDetails', { targetName: username });
    });

    console.log('Profile Self Result:');
    console.log('- level:', profileSelf.level);
    console.log('- currentProgress:', profileSelf.currentProgress);
    console.log('- targetXP:', profileSelf.targetXP);
    console.log('- totalXP:', profileSelf.totalXP);

    if (profileSelf.level !== 1) {
        throw new Error('FAIL: Expected profileSelf level to be 1, got ' + profileSelf.level);
    }
    if (profileSelf.targetXP !== 20) {
        throw new Error('FAIL: Expected profileSelf targetXP to be 20, got ' + profileSelf.targetXP);
    }
    console.log('✅ Profile Self check PASSED! Level is 1, Target XP is 20.');

    // 3. Earn 5 XP (still Level 1, no levelup)
    console.log('\n--- 3. Adding 5 XP (Progress test) ---');
    socket.emit('adminAddXP', {
        targetUsername: username,
        xp: 5,
        source: 'Mini Oyun',
        secret: 'metaverse_test_dev'
    });
    await new Promise(r => setTimeout(r, 600));

    if (playerLevelUpEvents.length > 0) {
        throw new Error('FAIL: Player should not level up with 5 XP at Level 1');
    }
    console.log('✅ Gained 5 XP without premature level up.');

    // 4. Earn 15 more XP to reach 20 XP total -> triggers Level 2!
    console.log('\n--- 4. Adding 15 XP to reach 20 XP and trigger Level 2 ---');
    const levelUpPromise = new Promise((resolve) => {
        socket.once('playerLevelUp', resolve);
    });

    socket.emit('adminAddXP', {
        targetUsername: username,
        xp: 15,
        source: 'Masa Oyunu',
        secret: 'metaverse_test_dev'
    });

    const lvl2Data = await levelUpPromise;
    console.log('Level 2 Event received:', lvl2Data);

    if (lvl2Data.oldLevel !== 1 || lvl2Data.newLevel !== 2) {
        throw new Error(`FAIL: Expected transition 1 -> 2, got ${lvl2Data.oldLevel} -> ${lvl2Data.newLevel}`);
    }
    if (lvl2Data.rewardMoney !== 2000 || lvl2Data.rewardDiamonds !== 2) {
        throw new Error(`FAIL: Expected 2000 TL and 2 diamonds for Level 2 reward, got ${lvl2Data.rewardMoney} TL, ${lvl2Data.rewardDiamonds} diamonds`);
    }
    if (lvl2Data.currentMoney !== 3000) {
        throw new Error(`FAIL: Expected total money to be 3000 TL (1000 start + 2000 reward), got ${lvl2Data.currentMoney}`);
    }
    console.log('✅ Level 2 promotion PASSED! Rewarded 2.000 TL and 2 Diamonds as expected.');

    // 5. Check profile after reaching Level 2
    console.log('\n--- 5. Checking Profile After Level 2 ---');
    const profileAfterLvl2 = await new Promise((resolve) => {
        socket.once('profileDetailsResult', resolve);
        socket.emit('getProfileDetails', { targetName: username });
    });

    console.log('Profile After Level 2:');
    console.log('- level:', profileAfterLvl2.level);
    console.log('- currentProgress:', profileAfterLvl2.currentProgress);
    console.log('- targetXP:', profileAfterLvl2.targetXP);
    console.log('- totalXP:', profileAfterLvl2.totalXP);

    if (profileAfterLvl2.level !== 2) {
        throw new Error('FAIL: Expected profile level to be 2, got ' + profileAfterLvl2.level);
    }
    if (profileAfterLvl2.targetXP !== 53) {
        throw new Error('FAIL: Expected targetXP to be 53 for Level 2 -> 3, got ' + profileAfterLvl2.targetXP);
    }
    console.log('✅ Profile after Level 2 PASSED! Target XP is 53.');

    // 6. Test Specialty Badge (e.g. Fishing badge Level 1 reward)
    console.log('\n--- 6. Testing Specialty Badge Level 1 Reward ---');
    const dataManager = require('../src/dataManager');
    const badgeUpPromise = new Promise((resolve) => {
        socket.once('badgeLevelUp', resolve);
    });

    // Simulate catching 1 fish
    dataManager.recordGamePlayed(username, 'fish', 1);

    const badgeData = await badgeUpPromise;
    console.log('Specialty Badge Level 1 Event received:', badgeData);

    if (badgeData.badgeId !== 'fishing' && badgeData.badgeId !== 'fish') {
        throw new Error('FAIL: Expected fishing badge event');
    }
    if (badgeData.newLevel !== 1) {
        throw new Error('FAIL: Expected badge level 1, got ' + badgeData.newLevel);
    }
    if (badgeData.rewardMoney !== 1000 || badgeData.rewardDiamonds !== 5) {
        throw new Error(`FAIL: Specialty badge Level 1 must award 1000 TL and 5 diamonds! Got: ${badgeData.rewardMoney} TL, ${badgeData.rewardDiamonds} diamonds`);
    }
    console.log('✅ Specialty Badge Level 1 test PASSED! 1.000 TL and 5 Diamonds awarded.');

    socket.disconnect();
    console.log('\n🎉 ALL 6 BACKEND & SYSTEM TESTS PASSED 100%! 🎉');
    process.exit(0);
}

runTest().catch((err) => {
    console.error('TEST ERROR:', err);
    process.exit(1);
});

