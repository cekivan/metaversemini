const io = require('socket.io-client');
const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function testClaim() {
    console.log('--- TEST: Kompakt Günlük Ödül Soket Akışı ---');
    const uTest = 'dr_live_' + Date.now();

    const socket = io(SERVER_URL, { transports: ['websocket'], forceNew: true });
    
    await new Promise((res, rej) => {
        socket.on('connect', () => {
            socket.emit('register', { username: uTest, password: 'password123', gender: 'male' });
        });
        socket.on('loginSuccess', res);
        socket.on('registerFailed', rej);
        setTimeout(() => rej(new Error('Timeout')), 5000);
    });

    console.log('1. Kayıt ve giriş başarılı:', uTest);

    // Durum iste
    let initialStatus = null;
    socket.emit('dailyReward:getStatus');
    await new Promise((res) => {
        socket.on('dailyReward:status', (st) => {
            initialStatus = st;
            res();
        });
    });

    console.log('2. İlk Durum -> canClaim:', initialStatus.canClaim, 'nextDay:', initialStatus.nextDay);

    // Ödülü talep et
    let claimResult = null;
    socket.emit('dailyReward:claim', { useFreeze: false });
    await new Promise((res, rej) => {
        socket.on('dailyReward:claimed', (data) => {
            claimResult = data;
            res();
        });
        socket.on('dailyReward:error', rej);
        setTimeout(() => rej(new Error('Claim timeout')), 5000);
    });

    console.log('3. Ödül Alındı -> Gün:', claimResult.day, 'TL:', claimResult.rewardMoney, 'Elmas:', claimResult.rewardDiamonds);

    // İkinci kez talep etmeye çalış (Engellenmeli)
    let doubleClaimBlocked = false;
    socket.emit('dailyReward:claim', { useFreeze: false });
    await new Promise((res) => {
        socket.on('dailyReward:error', (err) => {
            console.log('4. İkinci talep beklendiği gibi engellendi:', err.message);
            doubleClaimBlocked = true;
            res();
        });
        setTimeout(res, 2000);
    });

    if (claimResult.day === 1 && claimResult.rewardMoney === 500 && doubleClaimBlocked) {
        console.log('✅ CANLI SOKET VE VERİ TABANI TESTİ %100 BAŞARILI!');
    } else {
        throw new Error('Test başarısız!');
    }

    socket.disconnect();
    process.exit(0);
}

testClaim().catch(e => {
    console.error('❌ Hata:', e);
    process.exit(1);
});

