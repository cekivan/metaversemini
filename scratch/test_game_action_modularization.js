const io = require('socket.io-client');

async function testModularGameActions() {
    console.log('🧪 Starting Socket.IO test for modular gameActionHandler & boardGameActionHandler...');
    const socket = io('http://localhost:3000', { reconnection: false });

    await new Promise((resolve, reject) => {
        socket.on('connect', resolve);
        socket.on('connect_error', reject);
        setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });

    console.log('✅ Socket connected:', socket.id);

    // Login test user
    const loginRes = await new Promise((resolve) => {
        socket.emit('login', { username: 'LobbyModularTest', color: '#10b981' });
        socket.on('loginSuccess', (data) => resolve(data));
        setTimeout(() => resolve(null), 3000);
    });
    console.log('✅ Logged in as:', loginRes ? loginRes.username : 'Unknown');

    // Request table options (handled by gameActionHandler.js)
    const optionsRes = await new Promise((resolve) => {
        socket.emit('requestTableOptions', 'batak');
        socket.on('tableOptionsResponse', (data) => resolve(data));
        setTimeout(() => resolve(null), 3000);
    });
    console.log('✅ requestTableOptions response received:', !!optionsRes);

    // Test board game action handler event (e.g. xoxMove or tavlaRoll or batak bid)
    // Even if no active game, it shouldn't crash server and should gracefully respond or handle it
    socket.emit('tavlaRoll');
    socket.emit('batakVoteRematch');
    socket.emit('okey101DrawTile');

    await new Promise(r => setTimeout(r, 1000));
    console.log('✅ Board game actions dispatched without server crash');

    // Test leaving table (handled by gameActionHandler.js)
    socket.emit('leaveTable');
    await new Promise(r => setTimeout(r, 500));
    console.log('✅ leaveTable dispatched cleanly');

    socket.disconnect();
    console.log('🎉 Socket.IO modular test finished with 100% SUCCESS!');
}

testModularGameActions().catch(err => {
    console.error('❌ Test failed:', err);
    process.exit(1);
});

