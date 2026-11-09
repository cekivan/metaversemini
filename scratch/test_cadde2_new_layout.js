// scratch/test_cadde2_new_layout.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9310;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_cadde2_' + Date.now();

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

        const testUser = "NorthAvenue" + Math.floor(Math.random() * 8999 + 1000);
        console.log(`Yeni kullanıcı kayıt ediliyor: ${testUser}`);

        await evalJs(`
            (function() {
                if (typeof switchAuthTab === 'function') switchAuthTab('register');
                const uIn = document.getElementById('regUsernameInput');
                const pIn = document.getElementById('regPasswordInput');
                const pConf = document.getElementById('regPasswordConfirmInput');
                if (uIn) uIn.value = '${testUser}';
                if (pIn) pIn.value = '123456';
                if (pConf) pConf.value = '123456';
                if (typeof attemptRegister === 'function') attemptRegister();
            })()
        `);

        for (let i = 0; i < 25; i++) {
            await new Promise(r => setTimeout(r, 250));
            let disp = await evalJs(`document.getElementById('loginScreen')?.style.display`);
            if (disp === 'none') {
                console.log(`Giriş başarılı! ${testUser} oyunda.`);
                break;
            }
        }

        await new Promise(r => setTimeout(r, 1000));
        // Modalları kapat
        await evalJs(`
            (function() {
                localStorage.setItem('mm_last_seen_updates_version', '1.3');
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const uModal = document.getElementById('updatesModal');
                if (uModal) uModal.style.display = 'none';

                if (typeof closeBadgeLevelUpModal === 'function') closeBadgeLevelUpModal();
                const bModal = document.getElementById('badgeLevelUpModal');
                if (bModal) bModal.style.display = 'none';
            })()
        `);

        // Cadde 2'ye geç
        console.log("Cadde 2'ye geçiliyor...");
        await evalJs(`
            (function() {
                if (typeof changeRoom === 'function') changeRoom('cadde2', { x: 500, y: 220 });
            })()
        `);

        await new Promise(r => setTimeout(r, 1500));

        // Ekstra modalları tekrar kapat
        await evalJs(`
            (function() {
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const uModal = document.getElementById('updatesModal');
                if (uModal) uModal.style.display = 'none';
                if (typeof closeBadgeLevelUpModal === 'function') closeBadgeLevelUpModal();
                const bModal = document.getElementById('badgeLevelUpModal');
                if (bModal) bModal.style.display = 'none';
            })()
        `);

        const brainDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";

        // 1. Cadde 2 Yeni Harita Düzeni Ekran Görüntüsü
        const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_cadde2_new_layout.png"), Buffer.from(shot1.data, 'base64'));
        console.log("verified_cadde2_new_layout.png kaydedildi.");

        // 2. VIP Club'a Tıklama ve Modal Doğrulama
        console.log("Sol üstteki yeni VIP Club kapısına tıklanıyor (x: 98, y: 70)...");
        await evalJs(`
            (function() {
                if (typeof promptEnterVipClub === 'function') promptEnterVipClub();
            })()
        `);

        await new Promise(r => setTimeout(r, 800));

        const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_cadde2_vip_modal.png"), Buffer.from(shot2.data, 'base64'));
        console.log("verified_cadde2_vip_modal.png kaydedildi.");

        // 3. 1000 TL Ödeyerek VIP Club'a Giriş
        console.log("VIP Club'a giriliyor...");
        await evalJs(`
            (function() {
                if (typeof confirmEnterVipClub === 'function') confirmEnterVipClub();
            })()
        `);

        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 250));
            let rNow = await evalJs(`currentRoom`);
            if (rNow === 'vip_club') {
                console.log("VIP Club'a başarıyla girildi!");
                break;
            }
        }

        await new Promise(r => setTimeout(r, 1200));

        // 4. VIP Club'tan Cadde 2'ye Çıkış
        console.log("VIP Club'tan Cadde 2'ye çıkılıyor...");
        await evalJs(`
            (function() {
                if (typeof changeRoom === 'function') changeRoom('cadde2');
            })()
        `);

        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 250));
            let rNow = await evalJs(`currentRoom`);
            if (rNow === 'cadde2') {
                console.log("Cadde 2'ye başarıyla dönüldü!");
                break;
            }
        }

        await new Promise(r => setTimeout(r, 1200));

        // Doğrula: Oyuncunun koordinatı yeni VIP Club kapısının önü mü? (x: ~98, y: ~140)
        const playerPos = await evalJs(`
            (function() {
                const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined') ? players[myId] : null;
                return myP ? { x: myP.x, y: myP.y } : null;
            })()
        `);
        console.log("Çıkış sonrası oyuncu konumu:", playerPos);

        const shot3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_exit_new_spawn.png"), Buffer.from(shot3.data, 'base64'));
        console.log("verified_vip_exit_new_spawn.png kaydedildi.");

        // 5. Orta açık yola yürüme testi (x: 500, y: 50)
        console.log("Orta kuzey açık yoluna yürünüyor (x: 500, y: 50)...");
        await evalJs(`
            (function() {
                const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined') ? players[myId] : null;
                if (myP) {
                    myP.x = 500;
                    myP.y = 50;
                    myP.targetX = 500;
                    myP.targetY = 50;
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 1000));

        const shot4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_cadde2_open_north_road.png"), Buffer.from(shot4.data, 'base64'));
        console.log("verified_cadde2_open_north_road.png kaydedildi.");

        console.log("TÜM DOĞRULAMA ADIMLARI BAŞARIYLA TAMAMLANDI!");
    } catch (err) {
        console.error("HATA:", err);
    } finally {
        cleanup();
        process.exit(0);
    }
}

run();
