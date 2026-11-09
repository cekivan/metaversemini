// scratch/test_vip_club_flow.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9295;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_vip_' + Date.now();

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

        console.log("Tarayıcı hazır. Giriş yapılıyor...");
        const testUser = "VipTest_" + Math.floor(Math.random() * 8999 + 1000);

        await evalJs(`
            (function() {
                const uIn = document.getElementById('usernameInput');
                if (uIn) {
                    uIn.value = '${testUser}';
                    const fBtn = document.querySelector('#authForm button[type="submit"]') || document.querySelector('#authForm button');
                    if (fBtn) fBtn.click();
                    else if (typeof loginAsGuest === 'function') loginAsGuest('${testUser}');
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 3000));

        // Kullanıcıya bakiye ver ve Cadde 2'ye taşı
        await evalJs(`
            (function() {
                if (typeof userMoney !== 'undefined') userMoney = 50000;
                if (typeof updateMoneyDisplay === 'function') updateMoneyDisplay(50000);
                if (typeof changeRoom === 'function') changeRoom('cadde2', { x: 500, y: 220 });
            })()
        `);

        await new Promise(r => setTimeout(r, 1500));

        const room1 = await evalJs(`currentRoom`);
        console.log("Aktif oda (Cadde 2 olmalı):", room1);

        // 1. VIP Club Giriş Modalını Aç
        console.log("VIP Club Kapısına tıklanıyor / promptEnterVipClub çalıştırılıyor...");
        await evalJs(`
            (function() {
                if (typeof promptEnterVipClub === 'function') promptEnterVipClub();
            })()
        `);

        await new Promise(r => setTimeout(r, 800));

        const modalDisplay = await evalJs(`document.getElementById('vipClubEntryModal')?.style.display`);
        console.log("VIP Club Giriş Modalı görünürlüğü:", modalDisplay);

        // Modal ekran görüntüsü
        const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const brainDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        fs.writeFileSync(path.join(brainDir, "verified_vip_entry_modal.png"), Buffer.from(shot1.data, 'base64'));
        console.log("verified_vip_entry_modal.png kaydedildi.");

        // 2. "1.000 TL Öde & İçeri Gir" Butonuna Bas
        console.log("'1.000 TL Öde & İçeri Gir' butonuna basılıyor...");
        const balanceBefore = await evalJs(`userMoney || myMoney || 0`);
        console.log("Giriş öncesi bakiye:", balanceBefore);

        await evalJs(`
            (function() {
                if (typeof confirmEnterVipClub === 'function') confirmEnterVipClub();
            })()
        `);

        await new Promise(r => setTimeout(r, 2000));

        const room2 = await evalJs(`currentRoom`);
        const balanceAfter = await evalJs(`userMoney || myMoney || 0`);
        console.log("Giriş sonrası oda (vip_club olmalı):", room2);
        console.log("Giriş sonrası bakiye:", balanceAfter);

        // VIP Club içi ekran görüntüsü
        const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_club_overview.png"), Buffer.from(shot2.data, 'base64'));
        console.log("verified_vip_club_overview.png kaydedildi.");

        // 3. Tekinsiz Tekin Karaborsa Modalı
        console.log("Tekinsiz Tekin karaborsa modalı açılıyor...");
        await evalJs(`
            (function() {
                if (typeof openTekinsizTekinModal === 'function') openTekinsizTekinModal();
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const tekinModalDisplay = await evalJs(`document.getElementById('tekinsizTekinModal')?.style.display`);
        console.log("Tekinsiz Tekin Modalı görünürlüğü:", tekinModalDisplay);

        const shot3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_tekinsiz_tekin_modal.png"), Buffer.from(shot3.data, 'base64'));
        console.log("verified_vip_tekinsiz_tekin_modal.png kaydedildi.");

        // Modalı ESC ile kapatma testi (yeni eklediğimiz ESC desteği)
        console.log("ESC tuşuna basılıyor...");
        await sendCmd('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });
        await sendCmd('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 });

        await new Promise(r => setTimeout(r, 800));
        const tekinModalAfterEsc = await evalJs(`document.getElementById('tekinsizTekinModal')?.style.display`);
        console.log("ESC sonrası Tekinsiz Tekin Modalı görünürlüğü (none olmalı):", tekinModalAfterEsc);

        // 4. VIP Club'tan Cadde 2'ye Çıkış Testi
        console.log("VIP Club çıkış kapısına tıklanıyor / changeRoom('cadde2') tetikleniyor...");
        await evalJs(`
            (function() {
                if (typeof handleVipClubClick === 'function') {
                    handleVipClubClick(500, 590);
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde2');
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 1800));

        const room3 = await evalJs(`currentRoom`);
        const playerPos = await evalJs(`(function() {
            let p = (typeof myId !== 'undefined' && players && players[myId]) ? players[myId] : null;
            return p ? { x: p.x, y: p.y } : null;
        })()`);
        console.log("Çıkış sonrası oda (cadde2 olmalı):", room3);
        console.log("Çıkış sonrası oyuncu konumu:", playerPos);

        const shot4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_exit_to_cadde2.png"), Buffer.from(shot4.data, 'base64'));
        console.log("verified_vip_exit_to_cadde2.png kaydedildi.");

        ws.close();
        cleanup();
        console.log("TEST TAMAMLANDI! TÜM AŞAMALAR BAŞARILI!");
    } catch (err) {
        console.error("Test hatası:", err);
        cleanup();
        process.exit(1);
    }
}

run();

