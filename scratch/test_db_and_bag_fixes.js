const io = require('socket.io-client');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function createClient(username) {
    return new Promise((resolve, reject) => {
        const socket = io(SERVER_URL, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            socket.emit('register', {
                username: username,
                password: 'password123',
                gender: 'male'
            });
        });

        socket.on('loginSuccess', (data) => {
            resolve({ socket, data });
        });

        socket.on('registerFailed', (err) => {
            reject(new Error('Register failed for ' + username + ': ' + err));
        });

        socket.on('connect_error', (err) => {
            reject(err);
        });

        setTimeout(() => {
            reject(new Error('Login/Register timeout for ' + username));
        }, 6000);
    });
}

async function runTests() {
    console.log('--- TEST BAŞLIYOR: DB ve Çanta / Mekanik Doğrulama ---');
    const uSoyguncu = 'soyguncu_' + Math.floor(Math.random() * 89999 + 10000);
    const uKurban = 'kurban_' + Math.floor(Math.random() * 89999 + 10000);

    const c1 = await createClient(uSoyguncu);
    const c2 = await createClient(uKurban);

    console.log('✅ Her iki kullanıcı başarıyla kayıt olup giriş yaptı:', uSoyguncu, uKurban);

    // Bakiye, Elmas ve XP verelim (Dev secret ile)
    c1.socket.emit('adminModifyMoney', { secret: 'metaverse_test_dev', targetUsername: uSoyguncu, amount: 5000, mode: 'set' });
    c1.socket.emit('adminModifyDiamonds', { secret: 'metaverse_test_dev', targetUsername: uSoyguncu, amount: 50, mode: 'set' });
    c1.socket.emit('adminAddXP', { secret: 'metaverse_test_dev', targetUsername: uSoyguncu, xp: 1000 });

    c2.socket.emit('adminModifyMoney', { secret: 'metaverse_test_dev', targetUsername: uKurban, amount: 10000, mode: 'set' });
    c2.socket.emit('adminModifyDiamonds', { secret: 'metaverse_test_dev', targetUsername: uKurban, amount: 50, mode: 'set' });
    c2.socket.emit('adminAddXP', { secret: 'metaverse_test_dev', targetUsername: uKurban, xp: 1000 });

    await wait(1000);
    console.log('✅ Her iki kullanıcıya Bakiye, Elmas ve Seviye 5+ XP tanımlandı.');

    // Her iki oyuncuyu da aynı odaya (cadde) alalım
    c1.socket.emit('changeRoom', { room: 'cadde', x: 400, y: 300 });
    c2.socket.emit('changeRoom', { room: 'cadde', x: 450, y: 300 });
    await wait(600);

    // --- TEST 1: Anon Mask Satın Alma & Envanter & Süre ---
    console.log('\n--- TEST 1: Gizli Kimlik Maskesi Satın Alımı & DB Kaydı ---');
    let maskInventoryReceived = null;
    let shadyShopReceived = null;
    let roomShadyUpdateReceived = null;

    c1.socket.on('propInventoryUpdate', (inv) => {
        maskInventoryReceived = inv;
    });

    c1.socket.on('shadyShopState', (state) => {
        shadyShopReceived = state;
    });

    c2.socket.on('playerShadyUpdate', (update) => {
        roomShadyUpdateReceived = update;
    });

    c1.socket.emit('buyShadyItem', { itemId: 'anon_mask' });
    await wait(1000);

    const maskCount = (maskInventoryReceived && (maskInventoryReceived['props_anon_mask']?.count || maskInventoryReceived['props_anon_mask'])) || 0;
    if (maskCount >= 1 && shadyShopReceived && shadyShopReceived.anonMaskCount >= 1) {
        console.log(`✅ TEST 1.1 BAŞARILI: Maske satın alındı ve çantada props_anon_mask count: ${maskCount}`);
    } else {
        throw new Error('TEST 1.1 BAŞARISIZ: Maske envanterde görünmüyor! ' + JSON.stringify(maskInventoryReceived));
    }

    if (shadyShopReceived.anonMaskExpiresAt > Date.now()) {
        console.log(`✅ TEST 1.2 BAŞARILI: Maske satın alındığı an otomatik kuşanıldı! Bitiş: ${new Date(shadyShopReceived.anonMaskExpiresAt).toLocaleTimeString()}`);
    } else {
        throw new Error('TEST 1.2 BAŞARISIZ: Maske otomatik kuşanılmadı! ' + JSON.stringify(shadyShopReceived));
    }

    // --- TEST 2: Maskeyi Çıkarma ve Tekrar Takma ---
    console.log('\n--- TEST 2: Maskeyi Çıkarma ve Tekrar Takma ---');
    let maskStatusReceived = null;
    c1.socket.on('anonMaskStatusUpdate', (res) => {
        maskStatusReceived = res;
    });

    c1.socket.emit('removeAnonMask');
    await wait(800);

    if (maskStatusReceived && maskStatusReceived.isMasked === false) {
        console.log('✅ TEST 2.1 BAŞARILI: Maske çıkarıldı (isMasked: false).');
    } else {
        throw new Error('TEST 2.1 BAŞARISIZ: Maske çıkarılamadı! ' + JSON.stringify(maskStatusReceived));
    }

    maskStatusReceived = null;
    c1.socket.emit('useAnonMask');
    await wait(800);

    if (maskStatusReceived && maskStatusReceived.isMasked === true && maskStatusReceived.remainingSec > 0) {
        console.log(`✅ TEST 2.2 BAŞARILI: Maske tekrar takıldı (isMasked: true, kalan: ${maskStatusReceived.remainingSec}s).`);
    } else {
        throw new Error('TEST 2.2 BAŞARISIZ: Maske tekrar takılamadı!');
    }

    // --- TEST 3: Koruma (İzbandut) ve Doberman Satın Alımı & Kuşanma / Çıkarma ---
    console.log('\n--- TEST 3: Koruma & Doberman Satın Alma ve Kuşanma ---');
    let guardEquipUpdate = null;
    c2.socket.on('bodyguardEquipStatus', (res) => {
        guardEquipUpdate = res;
    });

    let dobermanEquipUpdate = null;
    c2.socket.on('dobermanEquipStatus', (res) => {
        dobermanEquipUpdate = res;
    });

    c2.socket.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(800);
    c2.socket.emit('buyShadyItem', { itemId: 'doberman' });
    await wait(800);

    // Kurban korumasını dinlenmeye çeksin (toggleEquipBodyguard)
    c2.socket.emit('toggleEquipBodyguard');
    await wait(800);

    if (guardEquipUpdate && guardEquipUpdate.equippedCount === 0) {
        console.log('✅ TEST 3.1 BAŞARILI: Koruma dinlenmeye çekildi (equippedCount: 0).');
    } else {
        throw new Error('TEST 3.1 BAŞARISIZ: Koruma dinlenmeye çekilemedi! ' + JSON.stringify(guardEquipUpdate));
    }

    // Tekrar aktif etsin
    c2.socket.emit('toggleEquipBodyguard');
    await wait(800);

    if (guardEquipUpdate && guardEquipUpdate.equippedCount >= 1) {
        console.log(`✅ TEST 3.2 BAŞARILI: Koruma tekrar göreve çağrıldı (equippedCount: ${guardEquipUpdate.equippedCount}).`);
    } else {
        throw new Error('TEST 3.2 BAŞARISIZ: Koruma göreve çağrılamadı! ' + JSON.stringify(guardEquipUpdate));
    }

    // Doberman dinlenmeye çekilsin ve geri çağrılsın
    c2.socket.emit('toggleEquipDoberman');
    await wait(800);
    if (dobermanEquipUpdate && dobermanEquipUpdate.equipped === false) {
        console.log('✅ TEST 3.3 BAŞARILI: Doberman dinlenmeye çekildi (equipped: false).');
    } else {
        throw new Error('TEST 3.3 BAŞARISIZ: Doberman dinlenmeye çekilemedi!');
    }

    c2.socket.emit('toggleEquipDoberman');
    await wait(800);
    if (dobermanEquipUpdate && dobermanEquipUpdate.equipped === true) {
        console.log('✅ TEST 3.4 BAŞARILI: Doberman tekrar yanımıza çağrıldı (equipped: true).');
    } else {
        throw new Error('TEST 3.4 BAŞARISIZ: Doberman tekrar göreve çağrılamadı!');
    }

    // --- TEST 4: Çantadan Elde Taşınan Eşya Olarak Kuşanma Engeli ---
    console.log('\n--- TEST 4: İzbandut ve Doberman HeldItem Engeli ---');
    let propEquipError = null;
    c2.socket.on('gameError', (msg) => {
        propEquipError = msg;
    });

    c2.socket.emit('equipPropItem', { itemKey: 'props_izbandut' });
    await wait(800);
    console.log('İzbandut elde kuşanılmaya çalışıldığında dönen mesaj:', propEquipError);
    if (propEquipError && (propEquipError.includes('koruma') || propEquipError.includes('aksesuarı'))) {
        console.log('✅ TEST 4 BAŞARILI: İzbandut elde taşınan eşya olarak takılamaz kuralı devrede.');
    } else {
        throw new Error('TEST 4 BAŞARISIZ: İzbandut elde kuşanma uyarısı vermedi!');
    }

    // --- TEST 5: Gasp Bıçağı Satın Alma & Korumalı Gasp Testi ---
    console.log('\n--- TEST 5: Gasp Bıçağı & Korumalı Gasp Testi ---');
    c1.socket.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(800);

    let mugNotification = null;
    c1.socket.on('notification', (msg) => {
        mugNotification = msg;
    });
    c1.socket.on('systemMessage', (msg) => {
        if (!mugNotification && (msg.includes('gasp') || msg.includes('koruma'))) mugNotification = msg;
    });

    // Kurbanın koruması varken soyguncu gasp etmeye çalışsın
    c1.socket.emit('useMugKnifeOnPlayer', { targetUsername: uKurban });
    await wait(1200);

    console.log(`Gasp Bildirimi: ${mugNotification}`);
    if (mugNotification && (mugNotification.includes('koruması') || mugNotification.includes('engelledi') || mugNotification.includes('İzbandut'))) {
        console.log('✅ TEST 5.1 BAŞARILI: Koruma saldırıyı püskürttü ve gasp engellendi!');
    } else {
        throw new Error('TEST 5.1 BAŞARISIZ: Koruma soygunu engellemedi! Notif: ' + mugNotification);
    }

    // --- TEST 6: Savunmasız Gasp ve Kalıcı Bakiye Kaydı ---
    console.log('\n--- TEST 6: Savunmasız Kurban Gaspı ve DB Kaydı ---');
    // Soyguncuya 1 bıçak daha alalım
    c1.socket.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(800);

    // Yeni savunmasız bir kurban oluşturalım
    const uKurban2 = 'kurban2_' + Math.floor(Math.random() * 89999 + 10000);
    const c3 = await createClient(uKurban2);
    c1.socket.emit('adminModifyMoney', { secret: 'metaverse_test_dev', targetUsername: uKurban2, amount: 8000, mode: 'set' });
    c3.socket.emit('changeRoom', { room: 'cadde', x: 460, y: 310 });
    await wait(800);

    let kurban2Money = null;
    let soyguncuMoney = null;
    c3.socket.on('moneyUpdate', (m) => { kurban2Money = m; });
    c1.socket.on('moneyUpdate', (m) => { soyguncuMoney = m; });

    let mugSuccessNotif = null;
    c1.socket.on('systemMessage', (msg) => {
        if (msg.includes('gasp') || msg.includes('TL')) mugSuccessNotif = msg;
    });

    console.log(`Kurban 2 (${uKurban2}) gasp ediliyor...`);
    c1.socket.emit('useMugKnifeOnPlayer', { targetUsername: uKurban2 });
    await wait(1500);

    console.log(`Gasp Bildirimi: ${mugSuccessNotif}`);
    console.log(`Kurban 2 Bakiye: ${kurban2Money} TL (Başlangıç: 8000 TL -> Beklenen: 6000 TL)`);
    console.log(`Soyguncu Bakiye: ${soyguncuMoney} TL`);

    if (kurban2Money === 6000) {
        console.log('✅ TEST 6.1 BAŞARILI: Savunmasız kurbandan tam 2.000 TL eksildi.');
    } else {
        throw new Error('TEST 6.1 BAŞARISIZ: Kurbandan para eksilmedi! Kurban2 para: ' + kurban2Money);
    }

    // Disk / data.json kontrolü
    await wait(2500); // disk backup debounce
    const dataJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../data.json'), 'utf8'));
    const diskVictim = dataJson.users[uKurban2.toLowerCase()];
    const diskMugger = dataJson.users[uSoyguncu.toLowerCase()];

    console.log('\n--- TEST 7: Disk ve DB Kalıcılık Doğrulaması ---');
    console.log('Diskte Kurban2 Bakiye:', diskVictim?.money);
    console.log('Diskte Soyguncu Bakiye:', diskMugger?.money);
    console.log('Diskte Soyguncu anonMaskCount:', diskMugger?.anonMaskCount);
    console.log('Diskte Soyguncu anonMaskExpiresAt:', diskMugger?.anonMaskExpiresAt);

    if (diskVictim && diskVictim.money === 6000) {
        console.log('✅ TEST 7.1 BAŞARILI: Kurbanın düşen bakiyesi diskte kalıcı olarak saklandı.');
    } else {
        throw new Error('TEST 7.1 BAŞARISIZ: Kurbanın bakiyesi diskte güncellenmedi!');
    }

    if (diskMugger && diskMugger.anonMaskCount >= 1 && diskMugger.anonMaskExpiresAt > Date.now()) {
        console.log('✅ TEST 7.2 BAŞARILI: Maske adet ve bitiş süresi diskte eksiksiz kaydedildi.');
    } else {
        throw new Error('TEST 7.2 BAŞARISIZ: Soyguncu maske verileri diskte eksik!');
    }

    // Temizlik: Test kullanıcılarını diskten silelim
    delete dataJson.users[uKurban.toLowerCase()];
    delete dataJson.users[uKurban2.toLowerCase()];
    delete dataJson.users[uSoyguncu.toLowerCase()];
    fs.writeFileSync(path.join(__dirname, '../data.json'), JSON.stringify(dataJson, null, 2), 'utf8');
    console.log('🧹 Test verileri data.json dosyasından temizlendi.');

    c1.socket.disconnect();
    c2.socket.disconnect();
    c3.socket.disconnect();

    console.log('\n🎉 TÜM TESTLER %100 BAŞARIYLA TAMAMLANDI!');
    process.exit(0);
}

runTests().catch(err => {
    console.error('❌ HATA:', err);
    process.exit(1);
});
