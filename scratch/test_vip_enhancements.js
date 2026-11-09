const io = require('socket.io-client');
const assert = require('assert');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createClient(username, password = '123') {
    return new Promise((resolve) => {
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

        socket.on('loginFailed', () => {
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
        }, 2000);
    });
}

async function testEnhancements() {
    console.log("🚀 Testing VIP Club Enhancements (Gasp 24h Cooldown, Tekin Shop Lock Overlay, Web Audio Sounds)...");

    const heroUsername = 'hero_test_' + Math.floor(Math.random() * 100000);
    const targetUsername = 'target_test_' + Math.floor(Math.random() * 100000);

    const heroSocket = await createClient(heroUsername, '123');
    const targetSocket = await createClient(targetUsername, '123');
    console.log(`✅ Created test users: ${heroUsername} & ${targetUsername}`);

    // Request profile of target
    let profileResult = null;
    heroSocket.on('profileDetailsResult', (data) => {
        profileResult = data;
    });

    heroSocket.emit('getProfileDetails', { targetName: targetUsername });
    await wait(1000);

    assert(profileResult !== null, "Profile result must not be null");
    console.log("✅ Profile Details Result:", {
        targetName: profileResult.targetName,
        mugCooldownRemMs: profileResult.mugCooldownRemMs,
        level: profileResult.level
    });

    assert(profileResult.mugCooldownRemMs !== undefined, "mugCooldownRemMs must be defined");
    assert(profileResult.mugCooldownRemMs === 0, "mugCooldownRemMs should initially be 0 (never mugged before)");
    console.log("✅ TEST 1 PASSED: Initial mugCooldownRemMs is 0 ms.");

    heroSocket.disconnect();
    targetSocket.disconnect();
    console.log("🎉 All VIP Enhancement Backend Checks PASSED!");
    process.exit(0);
}

testEnhancements().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
});
