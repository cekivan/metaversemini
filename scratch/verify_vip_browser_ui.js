const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function runBrowserVerification() {
    console.log("🌐 Starting Browser UI Verification (Level Up & VIP Karaborsa)...");
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9298;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_vipui_' + Date.now();

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

        // 1. Log in with 'yasin'
        console.log("Logging in as yasin...");
        await evalJs(`
            (function() {
                const uIn = document.getElementById('usernameInput');
                const pIn = document.getElementById('passwordInput');
                if (uIn) uIn.value = 'yasin';
                if (pIn) pIn.value = '123';
                if (typeof attemptLogin === 'function') attemptLogin();
            })()
        `);

        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 250));
            let disp = await evalJs(`document.getElementById('loginScreen')?.style.display`);
            if (disp === 'none') break;
        }
        await new Promise(r => setTimeout(r, 1000));

        // 2. Trigger Level Up UI to test Level 2 unlock display
        console.log("Testing Level Up UI (Level 2 with VIP Club unlock)...");
        await evalJs(`
            (function() {
                if (typeof LevelClient !== 'undefined' && typeof LevelClient.showLevelUpModal === 'function') {
                    LevelClient.showLevelUpModal(2, 2000, 2);
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 600));

        const levelUpShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const levelUpPath = path.join(ARTIFACT_DIR, 'verified_levelup_unlocks_live.png');
        fs.writeFileSync(levelUpPath, Buffer.from(levelUpShot.data, 'base64'));
        console.log("📸 Saved Level 2 Up screenshot:", levelUpPath);

        // Hide level up modal
        await evalJs(`
            (function() {
                if (typeof LevelClient !== 'undefined' && typeof LevelClient.hideLevelUpModal === 'function') {
                    LevelClient.hideLevelUpModal();
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 400));

        // 3. Test VIP Club Entry Modal (Free entry, Level 2+ required)
        console.log("Testing VIP Club Entry Modal (as Level 2 player)...");
        await evalJs(`
            (function() {
                if (typeof LevelClient !== 'undefined') LevelClient.currentLevel = 2;
                window.myPlayerLevel = 2;
                if (typeof promptEnterVipClub === 'function') {
                    promptEnterVipClub();
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 600));

        const vipModalShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const vipModalPath = path.join(ARTIFACT_DIR, 'verified_vip_entry_free_modal.png');
        fs.writeFileSync(vipModalPath, Buffer.from(vipModalShot.data, 'base64'));
        console.log("📸 Saved VIP Entry Modal screenshot:", vipModalPath);

        // Close VIP entry modal
        await evalJs(`
            (function() {
                if (typeof closeVipClubEntryModal === 'function') {
                    closeVipClubEntryModal();
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 400));

        // 4. Test Tekinsiz Tekin Karaborsa Shop UI
        console.log("Testing Tekinsiz Tekin Shop Modal (Diamond prices, Level locks, Equip buttons)...");
        await evalJs(`
            (function() {
                // Close any alert modal if open
                const alertM = document.getElementById('gameAlertModal');
                if (alertM) alertM.style.display = 'none';

                const sampleState = {
                    money: 8808739,
                    diamonds: 24,
                    level: 5,
                    jammerCount: 3,
                    zeusCount: 1,
                    mugKnifeCount: 2,
                    hasMugKnife: true,
                    bodyguardCount: 1,
                    bodyguardsEquipped: 1,
                    maxBodyguards: 1,
                    hasDoberman: true,
                    dobermanEquipped: true,
                    items: {
                        jammer: { id: 'jammer', name: 'Sinyal Kesici (Jammer)', price: 1500, currency: 'money', minLevel: 3, icon: '📡', desc: '1 kullanımlık frekans ve konuşma kesici.' },
                        doberman: { id: 'doberman', name: 'Sadık Doberman', price: 15000, currency: 'money', minLevel: 3, icon: '🐕‍🦺', desc: 'Seni gaspa karşı korur ve saldırganı kovalar.' },
                        zeus_yildirimi: { id: 'zeus_yildirimi', name: "Zeus'un İlahi Yıldırımı", price: 2, currency: 'diamond', minLevel: 4, icon: '⚡', desc: '1 kullanımlık ilahi kozmik yıldırım (2 💎).' },
                        mug_knife: { id: 'mug_knife', name: 'Gasp Bıçağı', price: 2, currency: 'diamond', minLevel: 5, icon: '🗡️', desc: '1 kullanımlık soygun bıçağı (2 💎, 2.000 TL gasp).' },
                        izbandut: { id: 'izbandut', name: 'İzbandut Özel Koruma', price: 10000, currency: 'money', minLevel: 5, icon: '🕶️', desc: 'Can siperi olan fedai (Lv 5: 1, Lv 10: 2, Lv 20: 3).' },
                        anon_mask: { id: 'anon_mask', name: 'Gizli Kimlik Maskesi', price: 2500, currency: 'money', minLevel: 1, icon: '🎭', desc: '30 dk kimliği gizler.' }
                    }
                };
                if (typeof renderShadyShopUI === 'function') {
                    renderShadyShopUI(sampleState);
                }
                const modal = document.getElementById('tekinsizTekinModal');
                if (modal) modal.style.display = 'flex';
            })()
        `);
        await new Promise(r => setTimeout(r, 600));

        const tekinShopShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const tekinShopPath = path.join(ARTIFACT_DIR, 'verified_tekinsiz_tekin_shop_live.png');
        fs.writeFileSync(tekinShopPath, Buffer.from(tekinShopShot.data, 'base64'));
        console.log("📸 Saved Tekinsiz Tekin Shop screenshot:", tekinShopPath);

        console.log("✅ All Browser UI verification screenshots captured successfully!");
        cleanup();
        process.exit(0);
    } catch (e) {
        console.error("Browser UI verification error:", e);
        cleanup();
        process.exit(1);
    }
}

runBrowserVerification();
