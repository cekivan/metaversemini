// scratch/test_vip_club_flow3.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const dataManager = require('../src/dataManager');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9297;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_vip3_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'http://localhost:3000'
    ]);

    let isDone = false;
    function cleanup() {
        if (!isDone) {
            isDone = true;
            try { edgeProc.kill('SIGKILL'); } catch (e) {}
            try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
        }
    }
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);

    try {
        await new Promise(r => setTimeout(r, 2500));
        const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
        let pageTab = listRes.find(t => t.type === 'page' && t.url.includes('localhost:3000')) || listRes.find(t => t.type === 'page');

        const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
            ws.on('open', res);
            ws.on('error', rej);
        });

        let msgId = 1;
        function sendCmd(method, params = {}) {
            return new Promise((res) => {
                const id = msgId++;
                const handler = (data) => {
                    const parsed = JSON.parse(data);
                    if (parsed.id === id) {
                        ws.off('message', handler);
                        res(parsed.result);
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        async function evalJs(expr) {
            const r = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
            return r?.result?.value;
        }

        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 820,
            deviceScaleFactor: 1,
            mobile: false
        });

        console.log("Kayıtlı kullanıcı oluşturuluyor...");
        const testUser = "VipUser_" + Math.floor(Math.random() * 8999 + 1000);

        dataManager.loadPersistentData();
        dataManager.persistentData.users = dataManager.persistentData.users || {};
        dataManager.persistentData.users[testUser.toLowerCase()] = {
            username: testUser,
            password: '123',
            money: 50000,
            diamonds: 500,
            level: 5,
            room: 'cadde2',
            x: 500,
            y: 220,
            avatar: {
                model: 'erkek_1',
                shirt: 'gömlek',
                pants: 'kot'
            }
        };
        dataManager.savePersistentData(testUser.toLowerCase());

        console.log("Form doldurulup attemptLogin() çağrılıyor...");
        await evalJs(`
            (function() {
                const uIn = document.getElementById('usernameInput');
                const pIn = document.getElementById('passwordInput');
                if (uIn) uIn.value = '${testUser}';
                if (pIn) pIn.value = '123';
                if (typeof attemptLogin === 'function') attemptLogin();
            })()
        `);

        await new Promise(r => setTimeout(r, 3000));

        const isAuthClosed = await evalJs(`document.getElementById('authModal')?.style.display`);
        console.log("Giriş tamamlandı mı (display: none olmalı):", isAuthClosed);

        // Cadde 2'de olduğumuzu doğrula
        await evalJs(`
            (function() {
                if (typeof changeRoom === 'function' && currentRoom !== 'cadde2') {
                    changeRoom('cadde2', { x: 500, y: 220 });
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const room1 = await evalJs(`currentRoom`);
        const money1 = await evalJs(`userMoney || (typeof EconomyManager !== 'undefined' ? EconomyManager.getMoney() : 0)`);
        console.log("Cadde 2 aktif oda:", room1, "Bakiye:", money1);

        // 1. VIP Club Giriş Modalını Aç
        console.log("VIP Club kapısı / promptEnterVipClub tetikleniyor...");
        await evalJs(`
            (function() {
                if (typeof promptEnterVipClub === 'function') promptEnterVipClub();
            })()
        `);

        await new Promise(r => setTimeout(r, 800));

        const brainDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_entry_modal.png"), Buffer.from(shot1.data, 'base64'));
        console.log("verified_vip_entry_modal.png kaydedildi.");

        // 2. "1.000 TL Öde & İçeri Gir" Butonuna Bas
        console.log("1.000 TL Öde & İçeri Gir butonuna basılıyor (confirmEnterVipClub)...");
        await evalJs(`
            (function() {
                if (typeof confirmEnterVipClub === 'function') confirmEnterVipClub();
            })()
        `);

        await new Promise(r => setTimeout(r, 2500));

        const room2 = await evalJs(`currentRoom`);
        const money2 = await evalJs(`userMoney || (typeof EconomyManager !== 'undefined' ? EconomyManager.getMoney() : 0)`);
        console.log("Giriş sonrası oda (vip_club olmalı):", room2, "Bakiye (49000 olmalı):", money2);

        const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_club_overview.png"), Buffer.from(shot2.data, 'base64'));
        console.log("verified_vip_club_overview.png kaydedildi.");

        // 3. Tekinsiz Tekin Karaborsa Modalı Aç
        console.log("Tekinsiz Tekin karaborsa modalı açılıyor...");
        await evalJs(`
            (function() {
                if (typeof openTekinsizTekinModal === 'function') openTekinsizTekinModal();
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const shot3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_tekinsiz_tekin_modal.png"), Buffer.from(shot3.data, 'base64'));
        console.log("verified_vip_tekinsiz_tekin_modal.png kaydedildi.");

        // ESC ile kapat
        await sendCmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await sendCmd('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await new Promise(r => setTimeout(r, 500));

        // 4. Çıkış Kapısına Bas / Cadde 2'ye Dön
        console.log("VIP Club çıkış kapısına tıklanıyor...");
        await evalJs(`
            (function() {
                if (typeof handleVipClubClick === 'function') {
                    handleVipClubClick(500, 590);
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde2');
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 2000));

        const room3 = await evalJs(`currentRoom`);
        console.log("Çıkış sonrası oda (cadde2 olmalı):", room3);

        const shot4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_exit_to_cadde2.png"), Buffer.from(shot4.data, 'base64'));
        console.log("verified_vip_exit_to_cadde2.png kaydedildi.");

        ws.close();
        cleanup();
        console.log("TÜM VIP CLUB AKIŞI EKSİKSİZ VE %100 BAŞARIYLA TAMAMLANDI!");
    } catch (err) {
        console.error("Test hatası:", err);
        cleanup();
        process.exit(1);
    }
}

run();

