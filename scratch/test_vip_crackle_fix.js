// scratch/test_vip_crackle_fix.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9320;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_crackle_' + Date.now();

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

        const testUser = "CrackleFix" + Math.floor(Math.random() * 8999 + 1000);
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
                if (typeof changeRoom === 'function') changeRoom('cadde2', { x: 300, y: 220 });
            })()
        `);

        await new Promise(r => setTimeout(r, 1500));

        // Ses çağrı sayacını ve logunu ekle
        await evalJs(`
            (function() {
                window._playSoundCalls = [];
                const origPlaySound = window.playSound;
                window.playSound = function(type, param) {
                    window._playSoundCalls.push({ type, time: Date.now() });
                    if (typeof origPlaySound === 'function') origPlaySound(type, param);
                };
            })()
        `);

        console.log("Oyuncu VIP Club kapısına (x: 98, y: 115) doğru yürütülüyor...");
        await evalJs(`
            (function() {
                const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined') ? players[myId] : null;
                if (myP) {
                    myP.x = 98;
                    myP.y = 120;
                    myP.targetX = 98;
                    myP.targetY = 110;
                    myP.isMoving = true;
                }
            })()
        `);

        // 1 saniye bekle - bu sürede eski kodda 60 kez promptEnterVipClub ve uiClick çalışıyordu!
        await new Promise(r => setTimeout(r, 1000));

        const testResults = await evalJs(`
            (function() {
                const modal = document.getElementById('vipClubEntryModal');
                const isModalOpen = modal && modal.style.display === 'flex';
                const uiClickCount = window._playSoundCalls.filter(c => c.type === 'uiClick').length;
                const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined') ? players[myId] : null;
                return {
                    isModalOpen,
                    uiClickCount,
                    totalCalls: window._playSoundCalls.length,
                    playerX: myP ? myP.x : null,
                    playerY: myP ? myP.y : null,
                    isMoving: myP ? myP.isMoving : null
                };
            })()
        `);

        console.log("Doğrulama Sonuçları:", testResults);

        const brainDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(brainDir, "verified_vip_clean_modal_no_crackle.png"), Buffer.from(shot1.data, 'base64'));
        console.log("verified_vip_clean_modal_no_crackle.png kaydedildi.");

        if (testResults.uiClickCount === 0 && testResults.isModalOpen && !testResults.isMoving) {
            console.log("MÜKEMMEL! Modal açılışında 0 uiClick çağrıldı, cızırtı/gürültü tamamen yok edildi ve hareket durduruldu!");
        } else {
            console.warn("UYARI: Beklenmeyen durum:", testResults);
        }

    } catch (err) {
        console.error("HATA:", err);
    } finally {
        cleanup();
        process.exit(0);
    }
}

run();

