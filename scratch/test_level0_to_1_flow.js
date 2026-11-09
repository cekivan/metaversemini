// scratch/test_level0_to_1_flow.js
const io = require('socket.io-client');

const SOCKET_URL = 'http://localhost:3000';

async function runTest() {
    console.log('--- Starting Level 0 -> 1 Flow Test ---');
    const username = 't_c_' + Math.floor(1000 + Math.random() * 9000);
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

    // Wait a brief moment to catch any spurious event emissions
    await new Promise(r => setTimeout(r, 600));

    console.log('\n--- 1. Checking Initial Registration State ---');
    console.log('Level at registration:', loginData.level);
    console.log('TotalXP at registration:', loginData.totalXP);
    console.log('TargetXP at registration:', loginData.targetXP);
    console.log('CurrentProgress at registration:', loginData.currentProgress);
    console.log('playerLevelUp events received:', playerLevelUpEvents.length);
    console.log('badgeLevelUp events received:', badgeLevelUpEvents.length);

    if (playerLevelUpEvents.length > 0) {
        throw new Error('FAIL: playerLevelUp was received on registration!');
    }
    if (badgeLevelUpEvents.length > 0) {
        throw new Error('FAIL: badgeLevelUp was received on registration!');
    }
    if (loginData.level !== 0) {
        throw new Error('FAIL: Expected initial level to be 0, got ' + loginData.level);
    }
    if (loginData.totalXP !== 0) {
        throw new Error('FAIL: Expected initial totalXP to be 0, got ' + loginData.totalXP);
    }
    if (loginData.targetXP !== 1) {
        throw new Error('FAIL: Expected initial targetXP to be 1, got ' + loginData.targetXP);
    }
    console.log('✅ Initial registration check PASSED! Level 0, 0 XP, targetXP=1, 0 notification popups.');

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
    console.log('- isSelf:', profileSelf.isSelf);

    if (profileSelf.level !== 0) {
        throw new Error('FAIL: Expected profileSelf level to be 0, got ' + profileSelf.level);
    }
    if (profileSelf.targetXP !== 1) {
        throw new Error('FAIL: Expected profileSelf targetXP to be 1 for Level 0 -> 1, got ' + profileSelf.targetXP);
    }
    console.log('✅ Profile Self check PASSED! Level is 0, Target XP is 1.');

    // 3. Earn 1 XP via live socket event (Level 0 -> Level 1 transition)
    console.log('\n--- 3. Adding 1 XP to trigger Level 0 -> 1 live via socket ---');
    const levelUpPromise = new Promise((resolve) => {
        socket.once('playerLevelUp', resolve);
    });

    socket.emit('adminAddXP', {
        targetUsername: username,
        xp: 1,
        source: 'Ilk Adim',
        secret: 'metaverse_test_dev'
    });

    const levelUpData = await levelUpPromise;
    console.log('Level Up Event received:', levelUpData);

    if (levelUpData.oldLevel !== 0 || levelUpData.newLevel !== 1) {
        throw new Error(`FAIL: Expected transition 0 -> 1, got ${levelUpData.oldLevel} -> ${levelUpData.newLevel}`);
    }
    if (levelUpData.rewardMoney !== 1000 || levelUpData.rewardDiamonds !== 1) {
        throw new Error(`FAIL: Expected 1000 TL and 1 diamond, got ${levelUpData.rewardMoney} TL, ${levelUpData.rewardDiamonds} diamonds`);
    }
    console.log('✅ Level up event PASSED! Transitioned from Level 0 to Level 1, received 1.000 TL and 1 Elmas.');

    // 4. Request profile details again after reaching Level 1
    console.log('\n--- 4. Checking Profile Details After Level 1 ---');
    const profileAfterLvl1 = await new Promise((resolve) => {
        socket.once('profileDetailsResult', resolve);
        socket.emit('getProfileDetails', { targetName: username });
    });

    console.log('Profile After Level 1:');
    console.log('- level:', profileAfterLvl1.level);
    console.log('- currentProgress:', profileAfterLvl1.currentProgress);
    console.log('- targetXP:', profileAfterLvl1.targetXP);
    console.log('- totalXP:', profileAfterLvl1.totalXP);

    if (profileAfterLvl1.level !== 1) {
        throw new Error('FAIL: Expected profile level to be 1, got ' + profileAfterLvl1.level);
    }
    if (profileAfterLvl1.targetXP !== 19) {
        throw new Error('FAIL: Expected targetXP to be 19 for Level 1 -> 2, got ' + profileAfterLvl1.targetXP);
    }
    if (profileAfterLvl1.currentProgress !== 0) {
        throw new Error('FAIL: Expected currentProgress to be 0 at start of Level 1, got ' + profileAfterLvl1.currentProgress);
    }
    console.log('✅ Post-Level 1 profile PASSED! Target XP is 19 towards Level 2.');

    // 5. Check from another user's perspective (viewer)
    console.log('\n--- 5. Checking Viewer Perspective ---');
    const viewerSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnection: false
    });
    const viewerName = 'v_' + Math.floor(1000 + Math.random() * 9000);
    await new Promise((resolve) => {
        viewerSocket.on('connect', resolve);
    });
    await new Promise((resolve) => {
        viewerSocket.once('loginSuccess', resolve);
        viewerSocket.emit('register', {
            username: viewerName,
            pass: password,
            gender: 'female',
            avatar: { head: 1, body: 1 }
        });
    });

    const profileViewedByOther = await new Promise((resolve) => {
        viewerSocket.once('profileDetailsResult', resolve);
        viewerSocket.emit('getProfileDetails', { targetName: username });
    });

    console.log('Viewed by other:');
    console.log('- targetName:', profileViewedByOther.targetName);
    console.log('- isSelf:', profileViewedByOther.isSelf);
    console.log('- userStats present:', !!profileViewedByOther.userStats);

    if (profileViewedByOther.isSelf !== false) {
        throw new Error('FAIL: isSelf should be false when viewing another user');
    }
    if (profileViewedByOther.userStats !== null && profileViewedByOther.userStats !== undefined) {
        throw new Error('FAIL: userStats must be hidden/null for other viewers!');
    }
    console.log('✅ Viewer perspective PASSED! isSelf is false and userStats is null.');

    socket.disconnect();
    viewerSocket.disconnect();

    console.log('\n🎉 ALL 5 E2E TESTS PASSED PERFECTLY! 🎉');
    process.exit(0);
}

runTest().catch((err) => {
    console.error('TEST ERROR:', err);
    process.exit(1);
});
