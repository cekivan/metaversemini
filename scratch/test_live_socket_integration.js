// scratch/test_live_socket_integration.js
const io = require('socket.io-client');

async function testLive() {
    console.log('Connecting to live server at http://localhost:3000...');
    const socket = io('http://localhost:3000', {
        transports: ['websocket'],
        reconnection: false
    });

    await new Promise((resolve, reject) => {
        socket.on('connect', () => {
            console.log('✅ Connected to socket server! ID:', socket.id);
            resolve();
        });
        socket.on('connect_error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    const testUser = 'LevelUser' + Math.floor(Math.random() * 89999 + 10000);
    console.log('Registering user:', testUser);

    await new Promise((resolve, reject) => {
        socket.on('loginSuccess', (data) => {
            console.log('✅ Login successful! User level:', data.level, 'Money:', data.money, 'Diamonds:', data.diamonds);
            resolve();
        });
        socket.on('registerFailed', (err) => {
            console.error('Register failed:', err);
            reject(new Error(err));
        });
        socket.on('loginFailed', (err) => {
            console.error('Login failed:', err);
            reject(new Error(err));
        });
        socket.emit('register', { username: testUser, password: 'Password123!', gender: 'male' });
    });

    // Test Mining
    console.log('Testing mining state...');
    await new Promise((resolve) => {
        socket.on('mine_state_data', (state) => {
            console.log('✅ Received mine_state_data. Active nodes:', state.nodes.length);
            resolve();
        });
        socket.emit('get_mine_state');
    });

    // Test XP Events
    let xpGainedReceived = false;
    let levelUpReceived = false;
    socket.on('xpGained', (data) => {
        console.log('⭐ xpGained event received:', data);
        xpGainedReceived = true;
    });
    socket.on('playerLevelUp', (data) => {
        console.log('🎉 playerLevelUp event received:', data);
        levelUpReceived = true;
    });

    // Buy pickaxe and test complete
    console.log('Buying pickaxe...');
    await new Promise((resolve) => {
        socket.on('pickaxe_bought', (res) => {
            console.log('✅ Pickaxe bought! Expires at:', res.pickaxeExpiresAt);
            resolve();
        });
        socket.emit('buy_pickaxe');
    });

    console.log('Simulating mining hit on node 0...');
    socket.emit('mine_node_complete', { nodeId: 0 });

    await new Promise(r => setTimeout(r, 1000));

    console.log('xpGained received?', xpGainedReceived ? '✅ YES' : '❌ NO');

    socket.disconnect();
    console.log('Test completed successfully.');
    process.exit(0);
}

testLive().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
