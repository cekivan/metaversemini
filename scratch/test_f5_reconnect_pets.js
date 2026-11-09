const io = require('socket.io-client');
const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function connectAndRegister(username) {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL, { transports: ['websocket'], forceNew: true });
        socket.on('connect', () => {
            socket.emit('register', { username, password: 'password123', gender: 'male' });
        });
        socket.on('loginSuccess', (data) => resolve({ socket, data }));
        socket.on('connect_error', reject);
        setTimeout(() => reject(new Error('Timeout for ' + username)), 5000);
    });
}

function connectAndLogin(username) {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL, { transports: ['websocket'], forceNew: true });
        socket.on('connect', () => {
            socket.emit('login', { username, password: 'password123' });
        });
        socket.on('loginSuccess', (data) => resolve({ socket, data }));
        socket.on('connect_error', reject);
        setTimeout(() => reject(new Error('Timeout for ' + username)), 5000);
    });
}

async function run() {
    console.log('--- RECONNECT / F5 PET RESTORE TEST ---');
    const uTest = 'pet_tester_' + Math.floor(Math.random() * 89999 + 10000);
    
    // 1. Kayıt ol ve giriş yap
    const c1 = await connectAndRegister(uTest);
    console.log('1. Kayıt başarılı:', uTest);

    // Seviye ve Para ver
    c1.socket.emit('adminModifyMoney', { secret: 'metaverse_test_dev', targetUsername: uTest, amount: 20000, mode: 'set' });
    c1.socket.emit('adminAddXP', { secret: 'metaverse_test_dev', targetUsername: uTest, xp: 1000 });
    await wait(600);

    // İzbandut ve Doberman al
    c1.socket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(600);
    c1.socket.emit('buyShadyItem', { itemId: 'doberman' });
    await wait(600);

    console.log('2. İzbandut ve Doberman alındı. Soket bağlantısı kesiliyor (F5 Simülasyonu)...');
    c1.socket.disconnect();
    await wait(1000);

    // 3. Tekrar bağlan (F5 sonrası login)
    console.log('3. F5 sonrası tekrar login olunuyor...');
    const c2 = await connectAndLogin(uTest);
    const loginData = c2.data;

    console.log('LoginSuccess Paket Verileri:');
    console.log('- bodyguardsEquipped:', loginData.bodyguardsEquipped);
    console.log('- bodyguardCount:', loginData.bodyguardCount);
    console.log('- hasDoberman:', loginData.hasDoberman);
    console.log('- dobermanEquipped:', loginData.dobermanEquipped);

    if (loginData.bodyguardCount === 1 && loginData.bodyguardsEquipped === 1 && loginData.hasDoberman === true && loginData.dobermanEquipped === true) {
        console.log('✅ RECONNECT TESTİ BAŞARILI: F5 sonrasında tüm koruma ve Doberman bilgileri eksiksiz geri yüklendi!');
    } else {
        throw new Error('RECONNECT TESTİ BAŞARISIZ! Veriler tam yüklenemedi.');
    }

    c2.socket.disconnect();
    process.exit(0);
}

run().catch(err => {
    console.error('❌ HATA:', err);
    process.exit(1);
});

