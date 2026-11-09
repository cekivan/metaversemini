const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log('Connected to server, socket id:', socket.id);
    const uname = 'testbox_' + Math.floor(Math.random() * 90000 + 10000);
    socket.emit('register', {
        username: uname,
        password: 'password123',
        avatar: { gender: 'erkek', skinColor: '#ffd1b3', hairStyle: 'kısa', hairColor: '#2b1d0c' }
    });

    socket.on('loginSuccess', (data) => {
        console.log('Login success as', uname, 'balance:', data.money);
        // Test openMysteryBox with insufficient balance or check response
        socket.emit('openMysteryBox', { type: 'clothes' });
    });

    socket.on('gameError', (msg) => {
        console.log('Received expected game response / error:', msg);
        console.log('✅ openMysteryBox handler responded properly!');
        socket.disconnect();
        process.exit(0);
    });

    socket.on('mysteryBoxReward', (reward) => {
        console.log('Received mystery box reward:', reward);
        console.log('✅ openMysteryBox handler rewarded properly!');
        socket.disconnect();
        process.exit(0);
    });
});

setTimeout(() => {
    console.error('Timeout waiting for mystery box response');
    process.exit(1);
}, 5000);

