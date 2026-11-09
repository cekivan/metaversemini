// scratch/verify_bodyguard_defense.js
const { io } = require('socket.io-client');

const SERVER_URL = 'http://localhost:3000';

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runVerification() {
    console.log("=== 🛡️ KORUMA & DOBERMAN SAVUNMA SİSTEMİ E2E TESTİ ===");

    const adminName = 'test_admin_defense';
    const attackerName = 'Saldirgan_' + Date.now().toString().slice(-4);
    const victimName = 'Patron_' + Date.now().toString().slice(-4);

    const socketAdmin = io(SERVER_URL, { reconnection: false });
    const socketAttacker = io(SERVER_URL, { reconnection: false });
    const socketVictim = io(SERVER_URL, { reconnection: false });

    await Promise.all([
        new Promise(res => socketAdmin.on('connect', res)),
        new Promise(res => socketAttacker.on('connect', res)),
        new Promise(res => socketVictim.on('connect', res))
    ]);
    console.log("✅ Admin, Saldırgan ve Kurban soketleri bağlandı.");

    // Admin Girişi
    await new Promise(resolve => {
        socketAdmin.emit('login', { username: adminName, password: 'password123' });
        socketAdmin.once('loginSuccess', resolve);
    });
    console.log("✅ Admin girişi yapıldı.");

    // Saldırgan Kayıt & Giriş
    await new Promise((resolve, reject) => {
        socketAttacker.emit('register', { username: attackerName, password: 'password123', gender: 'male' });
        socketAttacker.once('loginSuccess', resolve);
        socketAttacker.once('registerFailed', reject);
    });

    // Kurban Kayıt & Giriş
    await new Promise((resolve, reject) => {
        socketVictim.emit('register', { username: victimName, password: 'password123', gender: 'male' });
        socketVictim.once('loginSuccess', resolve);
        socketVictim.once('registerFailed', reject);
    });
    console.log("✅ Saldırgan ve Kurban hesapları kaydedildi ve giriş yapıldı.");

    // Admin ile bakiyelerini 500.000 TL yap
    socketAdmin.emit('adminModifyMoney', { targetUsername: attackerName, amount: 500000, mode: 'set' });
    socketAdmin.emit('adminModifyMoney', { targetUsername: victimName, amount: 500000, mode: 'set' });
    await wait(600);

    // İki oyuncuyu da 'cadde' odasına al
    socketAttacker.emit('changeRoom', 'cadde');
    socketVictim.emit('changeRoom', 'cadde');
    await wait(600);

    // Kurbanın petlerini takip et
    const activePets = {};
    socketVictim.on('companionPetSpawned', (data) => {
        if (data && data.pet) {
            activePets[data.pet.id] = data.pet;
            console.log(`🐾 [PET SPAWNED]: ${data.pet.name} (${data.pet.petType}) ID: ${data.pet.id}`);
        }
    });
    socketVictim.on('companionPetDespawned', (data) => {
        if (data && data.petId) {
            delete activePets[data.petId];
            console.log(`👋 [PET DESPAWNED]: ID: ${data.petId}, sebep: ${data.reason}`);
        }
    });

    // Saldırgana Gasp Bıçağı, Jammer ve Zeus Yıldırımı Satın Al
    console.log("\n--- Saldırgan Teçhizatlandırılıyor ---");
    socketAttacker.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(400);
    socketAttacker.emit('buyShadyItem', { itemId: 'jammer' });
    await wait(400);
    socketAttacker.emit('buyShadyItem', { itemId: 'zeus_yildirimi' });
    await wait(400);

    // Kurbana 3 İzbandut ve 1 Doberman Satın Al
    console.log("\n--- Kurbana 3 İzbandut ve 1 Doberman Satın Alınıyor ---");
    socketVictim.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(500);
    socketVictim.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(500);
    socketVictim.emit('buyShadyItem', { itemId: 'izbandut' });
    await wait(500);
    socketVictim.emit('buyShadyItem', { itemId: 'doberman' });
    await wait(600);

    let guardList = Object.values(activePets).filter(p => p.petType === 'izbandut');
    let dobermanPet = Object.values(activePets).find(p => p.petType === 'doberman');

    console.log(`Aktif İzbandut Sayısı: ${guardList.length}, Doberman: ${dobermanPet ? dobermanPet.name : 'Yok'}`);
    if (guardList.length !== 3 || !dobermanPet) {
        throw new Error(`Korumalar kurulamadı! Guardlar: ${guardList.length}, Doberman: ${!!dobermanPet}`);
    }
    console.log("✅ 3 İzbandut (Slot 0, 1, 2) ve 1 Doberman başarıyla hazırlandı.");

    // ========================================================
    // TEST 1: GASP SAVUNMASI (1. KORUMA FEDA OLUYOR - SLOT 2)
    // ========================================================
    console.log("\n--- TEST 1: Gasp Saldırısı ve İzbandut Savunması (Slot 2 Feda) ---");
    let defendEventReceived = null;

    socketVictim.on('protectorSacrificeMugDefend', (data) => {
        defendEventReceived = data;
        console.log(`🛡️ [DEFEND EVENT]:`, data);
    });

    let attackerError = null;
    socketAttacker.on('gameError', (msg) => {
        attackerError = msg;
        console.log(`⚔️ [ATTACKER ERROR]:`, msg);
    });

    socketAttacker.emit('useMugKnifeOnPlayer', { targetUsername: victimName });
    await wait(800);

    if (!defendEventReceived) {
        throw new Error("❌ HATA: protectorSacrificeMugDefend soket eventi gelmedi!");
    }
    console.log(`✅ Koruma gaspı engelledi! Feda olan: ${defendEventReceived.protectorName}`);

    // 2.5 sn sonra despawn olduğunu doğrula
    console.log("Bekleniyor (2.5 sn konuşma balonu ve ayrılma)...");
    await wait(3000);

    guardList = Object.values(activePets).filter(p => p.petType === 'izbandut');
    console.log(`Kalan İzbandut Sayısı: ${guardList.length}`);
    if (guardList.length !== 2) {
        throw new Error(`❌ HATA: Feda olan izbandut despawn olmadı! Kalan: ${guardList.length}`);
    }
    console.log("✅ Slot 2 İzbandut feda oldu ve despawn edildi. Kalan izbandutlar: 2 adet.");

    // ========================================================
    // TEST 2: ZEUS İLAHİ YILDIRIMI PARATONER SAVUNMASI (SLOT 1 FEDA)
    // ========================================================
    console.log("\n--- TEST 2: Zeus Yıldırımı Paratoner Savunması (Slot 1 Feda) ---");
    let impactReceived = null;
    let ashedReceived = null;
    let scatteredReceived = null;

    socketVictim.on('zeusLightningImpact', (data) => {
        impactReceived = data;
        console.log(`⚡ [ZEUS IMPACT]:`, data);
    });
    socketVictim.on('zeusTargetAshed', (data) => {
        ashedReceived = data;
        console.log(`💀 [ZEUS ASHED]:`, data);
    });
    socketVictim.on('zeusProtectorAshScattered', (data) => {
        scatteredReceived = data;
        console.log(`💨 [ZEUS ASH SCATTERED]:`, data);
    });

    console.log("⚡ Zeus yıldırımı çağrılıyor (10 sn fırtına toplanma fazı)...");
    socketAttacker.emit('castZeusLightning', { targetUsername: victimName });

    // 10.5 saniye bekle (darbe anı)
    await wait(10600);

    if (!impactReceived || !impactReceived.interceptorPet) {
        throw new Error("❌ HATA: zeusLightningImpact interceptorPet ile gelmedi!");
    }
    console.log(`✅ Yıldırım paratoner korumaya çarptı! Çarpılan: ${impactReceived.interceptorPet.name}`);

    // 11.5 saniye bekle (kül olma anı)
    await wait(1200);
    if (!ashedReceived || !ashedReceived.interceptorPet) {
        throw new Error("❌ HATA: zeusTargetAshed interceptorPet ile gelmedi!");
    }
    console.log(`✅ Koruma kül oldu: ${ashedReceived.interceptorPet.name}`);

    // 15. saniye bekle (küllerin toza dönüşüp savrulması)
    await wait(4200);
    if (!scatteredReceived) {
        throw new Error("❌ HATA: zeusProtectorAshScattered gelmedi!");
    }
    console.log(`✅ Korumanın külleri rüzgarda toz gibi savruldu!`);

    await wait(500);
    guardList = Object.values(activePets).filter(p => p.petType === 'izbandut');
    console.log(`Kalan İzbandut Sayısı: ${guardList.length}`);
    if (guardList.length !== 1) {
        throw new Error(`❌ HATA: Slot 1 İzbandut despawn olmadı! Kalan: ${guardList.length}`);
    }
    console.log("✅ Slot 1 İzbandut paratoner olarak feda oldu. Kalan: Slot 0 ve Doberman.");

    // ========================================================
    // TEST 3: JAMMER 15 SANİYE FREKANS FİLTRESİ (SLOT 0 FEDA)
    // ========================================================
    console.log("\n--- TEST 3: Jammer 15 Saniye Frekans Filtresi (Slot 0 Feda) ---");
    let filterStartedReceived = null;
    let burnoutReceived = null;
    let finalJammedState = null;

    socketVictim.on('protectorJammerFilterStarted', (data) => {
        filterStartedReceived = data;
        console.log(`📡 [JAMMER FILTER STARTED]:`, data);
    });
    socketVictim.on('protectorJammerBurnout', (data) => {
        burnoutReceived = data;
        console.log(`💥 [JAMMER BURNOUT]:`, data);
    });
    socketVictim.on('playerJammedState', (data) => {
        finalJammedState = data;
        console.log(`📡 [PLAYER JAMMED STATE]: jammerExpiresAt=${data.jammerExpiresAt}`);
    });

    socketAttacker.emit('useJammerOnPlayer', { targetUsername: victimName });
    await wait(600);

    if (!filterStartedReceived) {
        throw new Error("❌ HATA: protectorJammerFilterStarted eventi gelmedi!");
    }
    console.log(`✅ Koruma frekansı filtrelemeye başladı! Süre: ${filterStartedReceived.durationMs} ms (Normal 180s yerine 15s)`);

    // 15 saniyelik filtrenin tamamlanmasını bekle
    console.log("Frekans çözülüyor, 15 saniye bekleniyor...");
    await wait(15600);

    if (!burnoutReceived) {
        throw new Error("❌ HATA: 15. saniyede protectorJammerBurnout eventi gelmedi!");
    }
    console.log(`✅ 15. saniyede telsiz yandı ve frekans deşifre edildi!`);

    await wait(500);
    guardList = Object.values(activePets).filter(p => p.petType === 'izbandut');
    console.log(`Kalan İzbandut Sayısı: ${guardList.length}`);
    if (guardList.length !== 0) {
        throw new Error(`❌ HATA: Slot 0 İzbandut despawn olmadı! Kalan: ${guardList.length}`);
    }
    console.log("✅ Tüm izbandutlar sırasıyla feda oldu. Sırada sadık dost DOBERMAN var!");

    // ========================================================
    // TEST 4: DOBERMAN CAN SİPERİ SAVUNMASI
    // ========================================================
    console.log("\n--- TEST 4: Doberman Son Can Siperi Savunması ---");
    // Günlük bekleme süresine takılmamak için 2. bir saldırgan hesabı kullanalım
    const attacker2Name = 'Saldirgan2_' + Date.now().toString().slice(-4);
    const socketAttacker2 = io(SERVER_URL, { reconnection: false });
    await new Promise(res => socketAttacker2.on('connect', res));

    await new Promise((resolve, reject) => {
        socketAttacker2.emit('register', { username: attacker2Name, password: 'password123', gender: 'male' });
        socketAttacker2.once('loginSuccess', resolve);
        socketAttacker2.once('registerFailed', reject);
    });

    socketAdmin.emit('adminModifyMoney', { targetUsername: attacker2Name, amount: 100000, mode: 'set' });
    await wait(400);
    socketAttacker2.emit('changeRoom', 'cadde');
    await wait(400);

    socketAttacker2.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(500);

    let dobermanDefendEvent = null;
    socketVictim.on('protectorSacrificeMugDefend', (data) => {
        dobermanDefendEvent = data;
        console.log(`🐕‍🦺 [DOBERMAN DEFEND]:`, data);
    });

    socketAttacker2.emit('useMugKnifeOnPlayer', { targetUsername: victimName });
    await wait(800);

    if (!dobermanDefendEvent || dobermanDefendEvent.protectorType !== 'doberman') {
        throw new Error("❌ HATA: Doberman can siperi olmadı!");
    }
    console.log(`✅ Doberman gaspçıyı püskürttü! Havlayarak kovaladı.`);

    await wait(3000);
    dobermanPet = Object.values(activePets).find(p => p.petType === 'doberman');
    if (dobermanPet) {
        throw new Error("❌ HATA: Doberman despawn olmadı!");
    }
    console.log("✅ Doberman görevini tamamlayıp ayrıldı. Artık oyuncunun hiçbir koruması kalmadı.");

    // ========================================================
    // TEST 5: KORUMASIZ PATRONA GASP (BAŞARILI OLMALI)
    // ========================================================
    console.log("\n--- TEST 5: Korumasız Oyuncuya Gasp (Başarılı Gasp) ---");
    const attacker3Name = 'Saldirgan3_' + Date.now().toString().slice(-4);
    const socketAttacker3 = io(SERVER_URL, { reconnection: false });
    await new Promise(res => socketAttacker3.on('connect', res));

    await new Promise((resolve, reject) => {
        socketAttacker3.emit('register', { username: attacker3Name, password: 'password123', gender: 'male' });
        socketAttacker3.once('loginSuccess', resolve);
        socketAttacker3.once('registerFailed', reject);
    });

    socketAdmin.emit('adminModifyMoney', { targetUsername: attacker3Name, amount: 100000, mode: 'set' });
    await wait(400);
    socketAttacker3.emit('changeRoom', 'cadde');
    await wait(400);

    socketAttacker3.emit('buyShadyItem', { itemId: 'mug_knife' });
    await wait(500);

    let mugSuccessMessage = null;
    socketAttacker3.on('systemMessage', (msg) => {
        if (msg.includes('GASP BAŞARILI')) {
            mugSuccessMessage = msg;
            console.log(`🗡️ [MUG SUCCESS]:`, msg);
        }
    });

    socketAttacker3.emit('useMugKnifeOnPlayer', { targetUsername: victimName });
    await wait(800);

    if (!mugSuccessMessage) {
        throw new Error("❌ HATA: Korumasız kurbana gasp başarılı olmadı!");
    }
    console.log(`✅ Koruma olmadığı için gasp başarılı oldu!`);

    // Temizlik
    socketAdmin.disconnect();
    socketAttacker.disconnect();
    socketAttacker2.disconnect();
    socketAttacker3.disconnect();
    socketVictim.disconnect();

    console.log("\n========================================================");
    console.log("🎉 TÜM 5 TEST EKSİKSİZ VE MÜKEMMEL ŞEKİLDE GEÇTİ!");
    console.log("========================================================");
    process.exit(0);
}

runVerification().catch(err => {
    console.error("❌ TEST BAŞARISIZ OLDU:", err);
    process.exit(1);
});
