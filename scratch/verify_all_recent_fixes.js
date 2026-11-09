const io = require('socket.io-client');
const http = require('http');
const { spawn } = require('child_process');
const assert = require('assert');
const mysteryBox = require('../src/handlers/mysteryBoxHandler');

async function runAllTests() {
    console.log("=== ADIM 1: Mystery Box & Gacha Birim Testleri ===");

    // Test 1: CLOTHES_POOL bütünlüğü
    assert(Array.isArray(mysteryBox.CLOTHES_POOL), "CLOTHES_POOL dizi olmalı");
    assert(mysteryBox.CLOTHES_POOL.length > 20, "CLOTHES_POOL yeterli eşya içermeli");
    const hoodieItem = mysteryBox.CLOTHES_POOL.find(c => c.id === 'hoodie');
    assert(hoodieItem, "hoodie eşyası bulunmalı");
    assert.strictEqual(hoodieItem.cat, 'tshirts', "hoodie'nin kategorisi 'tshirts' olmalı (Düzeltildi)");
    console.log("  ✅ CLOTHES_POOL ve hoodie kategorisi doğrulandı.");

    // Test 2: PROPS_POOL bütünlüğü
    assert(Array.isArray(mysteryBox.PROPS_POOL), "PROPS_POOL dizi olmalı");
    const sigaraItem = mysteryBox.PROPS_POOL.find(p => p.id === 'sigara');
    assert(sigaraItem, "sigara jackpot eşyası bulunmalı");
    console.log("  ✅ PROPS_POOL ve sigara jackpotu doğrulandı.");

    // Test 3: isClothesOwned doğruluğu
    const dummyUserClothes = {
        inventory: ['tshirts_polo', 'hats_bere'],
        avatar: {
            shirt: 'hoodie', // Gardıropta giyili ama inventory stringinde yok
            pants: 'pants_classic_black',
            shoes: 'boots',
            hair: 'hair_long'
        }
    };
    assert(mysteryBox.isClothesOwned(dummyUserClothes, { cat: 'tshirts', id: 'polo' }), "Polo envanterde var");
    assert(mysteryBox.isClothesOwned(dummyUserClothes, { cat: 'hats', id: 'bere' }), "Bere envanterde var");
    assert(mysteryBox.isClothesOwned(dummyUserClothes, { cat: 'tshirts', id: 'hoodie' }), "Hoodie avatar.shirt'te giyili");
    assert(mysteryBox.isClothesOwned(dummyUserClothes, { cat: 'pants', id: 'pants_classic_black' }), "Pantolon avatar.pants'te giyili");
    assert(mysteryBox.isClothesOwned(dummyUserClothes, { cat: 'shoes', id: 'boots' }), "Bot avatar.shoes'ta giyili");
    assert(mysteryBox.isClothesOwned(dummyUserClothes, { cat: 'hair', id: 'hair_long' }), "Saç avatar.hair'de giyili");
    assert(!mysteryBox.isClothesOwned(dummyUserClothes, { cat: 'outfits', id: 'dress_pink' }), "Sahip olunmayan elbise false dönmeli");
    console.log("  ✅ isClothesOwned tüm karmaşık giyim/avatar katmanlarında doğrulandı.");

    // Test 4: isPropOwned doğruluğu
    const dummyUserProps = {
        propInventory: { 'props_cay': 2 },
        inventory: ['props_nargile'],
        avatar: { heldItem: 'sigara' }
    };
    assert(mysteryBox.isPropOwned(dummyUserProps, { id: 'cay' }), "Çay propInventory'de var");
    assert(mysteryBox.isPropOwned(dummyUserProps, { id: 'nargile' }), "Nargile inventory'de var");
    assert(mysteryBox.isPropOwned(dummyUserProps, { id: 'sigara' }), "Sigara avatar.heldItem'da giyili");
    assert(!mysteryBox.isPropOwned(dummyUserProps, { id: 'balon' }), "Balon sahip olunmayan eşya false dönmeli");
    console.log("  ✅ isPropOwned el eşyası ve avatar tutulan eşya katmanlarında doğrulandı.");

    // Test 5: rollWeightedDynamicItem testi
    let rollTestCount = 100;
    for (let i = 0; i < rollTestCount; i++) {
        let rolledProp = mysteryBox.rollWeightedDynamicItem(mysteryBox.PROPS_POOL);
        assert(rolledProp && rolledProp.id && rolledProp.cost > 0, "Dinamik RNG geçerli bir eşya üretmeli");
    }
    console.log(`  ✅ rollWeightedDynamicItem ${rollTestCount} çekilişte hatasız çalıştı.`);

    console.log("\n=== ADIM 2: Canlı Sunucu Socket Entegrasyon Testi ===");
    const testUsername = '123';
    const socket = io('http://localhost:3000', {
        transports: ['websocket'],
        reconnection: false
    });

    await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Socket bağlantı zaman aşımı")), 5000);

        socket.on('connect', () => {
            console.log("  🔌 Sunucuya bağlandı (ID:", socket.id, ")");
            socket.emit('login', { name: testUsername, pass: '123' });
        });

        socket.on('loginSuccess', (data) => {
            console.log("  🔑 Giriş yapıldı:", testUsername, "Bakiye:", data.money);
            clearTimeout(timeout);
            resolve();
        });

        socket.on('loginFailed', (msg) => {
            console.error("  ❌ LoginFailed:", msg);
            reject(new Error(msg));
        });

        socket.on('gameError', (msg) => {
            console.error("  ❌ GameError:", msg);
        });
    });

    // Props kutusu aç
    const propReward = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Props kutusu açma zaman aşımı")), 4000);
        socket.once('mysteryBoxReward', (res) => {
            clearTimeout(timeout);
            resolve(res);
        });
        socket.emit('openMysteryBox', { type: 'props' });
    });
    console.log("  🎁 El Eşyası Kutusu Ödülü:", propReward.reward.name, "| Nadirlik:", propReward.reward.rarity, "| Değer:", propReward.reward.cost);

    // Clothes kutusu aç
    const clothesReward = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Clothes kutusu açma zaman aşımı")), 4000);
        socket.once('mysteryBoxReward', (res) => {
            clearTimeout(timeout);
            resolve(res);
        });
        socket.emit('openMysteryBox', { type: 'clothes' });
    });
    console.log("  🎁 Kıyafet Kutusu Ödülü:", clothesReward.reward.name, "| Nadirlik:", clothesReward.reward.rarity, "| Değer:", clothesReward.reward.cost);

    // Pet kutusu aç
    const petReward = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Pet kutusu açma zaman aşımı")), 4000);
        socket.once('mysteryBoxReward', (res) => {
            clearTimeout(timeout);
            resolve(res);
        });
        socket.emit('openMysteryBox', { type: 'pet' });
    });
    console.log("  🐾 Pet Kutusu Ödülü:", petReward.reward.name, "| Süre:", petReward.reward.durationMin, "dakika");

    socket.disconnect();
    console.log("  🔌 Test soketi başarıyla kapatıldı.");

    console.log("\n=== ADIM 3: Headless Edge Tarayıcı ve DOM Doğrulaması ===");
    await runBrowserValidation();

    console.log("\n========================================================");
    console.log("🎉 TÜM KOD ANALİZİ VE BUG DÜZELTME TESTLERİ BAŞARIYLA TAMAMLANDI!");
    console.log("========================================================");
}

function runBrowserValidation() {
    return new Promise((resolve, reject) => {
        const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
        const cdpPort = 9244;
        const edgeProc = spawn(edgePath, [
            `--remote-debugging-port=${cdpPort}`,
            '--headless=new',
            '--disable-gpu',
            '--no-first-run',
            '--no-default-browser-check',
            '--user-data-dir=C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_verify_all',
            'http://localhost:3000'
        ]);

        let isDone = false;
        function cleanup() {
            if (!isDone) {
                isDone = true;
                try { edgeProc.kill('SIGKILL'); } catch (e) {}
            }
        }

        setTimeout(async () => {
            try {
                // List tabs
                const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
                const pageTab = listRes.find(t => t.type === 'page');
                if (!pageTab) throw new Error("CDP sayfası bulunamadı");

                const WebSocket = require('ws');
                const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

                let id = 1;
                function send(method, params = {}) {
                    return new Promise((res, rej) => {
                        const curId = id++;
                        const onMsg = (msg) => {
                            const data = JSON.parse(msg.toString());
                            if (data.id === curId) {
                                ws.off('message', onMsg);
                                if (data.error) rej(data.error);
                                else res(data.result);
                            }
                        };
                        ws.on('message', onMsg);
                        ws.send(JSON.stringify({ id: curId, method, params }));
                    });
                }

                ws.on('open', async () => {
                    await send('Runtime.enable');
                    await send('Console.enable');

                    const consoleErrors = [];
                    ws.on('message', (msg) => {
                        const data = JSON.parse(msg.toString());
                        if (data.method === 'Console.messageAdded' && data.params.message.level === 'error') {
                            consoleErrors.push(data.params.message.text);
                        }
                    });

                    // Wait 2s for page scripts
                    await new Promise(r => setTimeout(r, 2000));

                    // Evaluate client-side symbols
                    const evalRes = await send('Runtime.evaluate', {
                        expression: `(() => {
                            return {
                                hasDrawHeldItem: typeof window.drawHeldItem === 'function',
                                hasSafeDrawHeldItem: typeof _safeDrawHeldItem === 'function',
                                hasVeterinerGreeting: typeof window.triggerVeterinerGreeting === 'function',
                                hasOpenPetShopModal: typeof window.openPetShopModal === 'function',
                                hasMakeModalDraggable: typeof window.makeModalDraggable === 'function',
                                hasInitProfileDraggable: typeof window.initProfileDraggable === 'function',
                                hasInitBagDraggable: typeof window.initBagDraggable === 'function',
                                petShopModalTitle: document.querySelector('#petShopModal h2')?.innerText || '',
                                bodyUserSelect: window.getComputedStyle(document.body).userSelect || window.getComputedStyle(document.body).webkitUserSelect
                            };
                        })()`,
                        returnByValue: true
                    });

                    const val = (evalRes && evalRes.result) ? evalRes.result.value : (evalRes ? evalRes.value : null);
                    console.log("  🌐 İstemci Sembolleri ve Durum:", JSON.stringify(val, null, 2));

                    assert(val, "Runtime.evaluate bir değer döndürmeli");
                    assert(val.hasDrawHeldItem, "window.drawHeldItem fonksiyonu tanımlı olmalı");
                    assert(val.hasVeterinerGreeting, "triggerVeterinerGreeting fonksiyonu tanımlı olmalı");
                    assert(val.hasOpenPetShopModal, "openPetShopModal fonksiyonu tanımlı olmalı");
                    assert(val.hasMakeModalDraggable, "makeModalDraggable fonksiyonu tanımlı olmalı");
                    assert(val.hasInitProfileDraggable, "initProfileDraggable fonksiyonu tanımlı olmalı");
                    assert(val.hasInitBagDraggable, "initBagDraggable fonksiyonu tanımlı olmalı");
                    assert(val.petShopModalTitle.includes("Hekimoğlu"), "Veteriner klinik başlığı güncellenmiş olmalı");

                    console.log("  🛡️ Konsol Hata Sayısı:", consoleErrors.length);
                    if (consoleErrors.length > 0) {
                        console.warn("  ⚠️ Konsol Hataları:", consoleErrors);
                    }

                    ws.close();
                    cleanup();
                    resolve();
                });
            } catch (err) {
                cleanup();
                reject(err);
            }
        }, 1500);
    });
}

runAllTests().catch(err => {
    console.error("❌ TEST BAŞARISIZ:", err);
    process.exit(1);
});
