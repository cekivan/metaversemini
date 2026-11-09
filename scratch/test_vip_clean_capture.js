// scratch/test_vip_clean_capture.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9300;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_cleanvip_' + Date.now();

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

        const testUser = "VipAgent" + Math.floor(Math.random() * 8999 + 1000);
        console.log(`Yeni kullanıcı kayıt ediliyor: ${testUser}`);

        // Kayıt formu doldurulup attemptRegister çağrılıyor
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

        // loginScreen kapandı mı bekle
        for (let i = 0; i < 25; i++) {
            await new Promise(r => setTimeout(r, 250));
            let disp = await evalJs(`document.getElementById('loginScreen')?.style.display`);
            if (disp === 'none') {
                console.log(`Giriş başarılı! ${testUser} oyunda.`);
                break;
            }
        }

        // Karşılama ve Seviye Modallarını Kapat
        await new Promise(r => setTimeout(r, 1000));
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

        // 1. VIP Club Giriş Modalını Aç
        console.log("promptEnterVipClub açılıyor...");
        await evalJs(`
            (function() {
                if (typeof promptEnterVipClub === 'function') promptEnterVipClub();
            })()
        `);

        await new Promise(r => setTimeout(r, 800));

        const brainDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_entry_modal.png"), Buffer.from(shot1.data, 'base64'));

        // 2. "1.000 TL Öde & İçeri Gir" Butonuna Bas
        console.log("confirmEnterVipClub çağrılıyor...");
        await evalJs(`
            (function() {
                if (typeof confirmEnterVipClub === 'function') confirmEnterVipClub();
            })()
        `);

        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 250));
            let rNow = await evalJs(`currentRoom`);
            if (rNow === 'vip_club') {
                console.log("VIP Club'a girildi!");
                break;
            }
        }

        await new Promise(r => setTimeout(r, 2000));

        // Modalları kapat
        await evalJs(`
            (function() {
                if (typeof closeBadgeLevelUpModal === 'function') closeBadgeLevelUpModal();
                const bModal = document.getElementById('badgeLevelUpModal');
                if (bModal) bModal.style.display = 'none';

                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const uModal = document.getElementById('updatesModal');
                if (uModal) uModal.style.display = 'none';
            })()
        `);

        // VIP Club iç mekanı screenshot
        const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_club_overview.png"), Buffer.from(shot2.data, 'base64'));
        console.log("verified_vip_club_overview.png temiz olarak kaydedildi.");

        // 3. Tekinsiz Tekin Karaborsa Modalı Aç
        console.log("Tekinsiz Tekin karaborsa tezgahı açılıyor...");
        await evalJs(`
            (function() {
                if (typeof openTekinsizTekinModal === 'function') openTekinsizTekinModal();
            })()
        `);

        await new Promise(r => setTimeout(r, 1500));

        const shot3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_tekinsiz_tekin_modal.png"), Buffer.from(shot3.data, 'base64'));
        console.log("verified_vip_tekinsiz_tekin_modal.png kaydedildi.");

        // Modalı kapat
        await evalJs(`
            (function() {
                if (typeof closeTekinsizTekinModal === 'function') closeTekinsizTekinModal();
            })()
        `);
        await new Promise(r => setTimeout(r, 500));

        // 4. Cadde 2'ye Çıkış
        console.log("Cadde 2'ye çıkılıyor...");
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

        const shot4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_exit_to_cadde2.png"), Buffer.from(shot4.data, 'base64'));
        console.log("verified_vip_exit_to_cadde2.png kaydedildi.");

        ws.close();
        cleanup();
        console.log("TEMİZ EKRAN GÖRÜNTÜLERİ ALINDI!");
    } catch (err) {
        console.error("Hata:", err);
        cleanup();
        process.exit(1);
    }
}

run();
