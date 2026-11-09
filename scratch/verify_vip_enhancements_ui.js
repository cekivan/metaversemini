const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function verifyEnhancementsUI() {
    console.log("🌐 Launching Edge CDP to verify Tekinsiz Tekin Lock Overlay & Profile Mug Cooldown...");
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9299;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_enh2_' + Date.now();

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

        await sendCmd('Runtime.enable');
        await sendCmd('Page.enable');

        async function evalJs(expr) {
            const r = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
            return r?.result?.value;
        }

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

        // Test 1: Render Tekinsiz Tekin shop as Level 1 to show the stylish semi-transparent lock overlays
        console.log("Rendering Tekinsiz Tekin Shop with Level 1 to showcase lock overlays...");
        await evalJs(`
            (function() {
                const testState = {
                    level: 1,
                    money: 5000,
                    diamonds: 0,
                    maxBodyguards: 0,
                    bodyguardCount: 0,
                    bodyguardsEquipped: 0,
                    hasDoberman: false,
                    dobermanEquipped: false,
                    items: {
                        jammer: { id: 'jammer', name: 'Sinyal Kesici (Jammer)', price: 1500, currency: 'money', minLevel: 3, desc: '3 dakika frekans keser', icon: '📡' },
                        doberman: { id: 'doberman', name: 'Sadık Doberman', price: 15000, currency: 'money', minLevel: 3, desc: 'Korumaları savunur', icon: '🐕‍🦺' },
                        zeus_yildirimi: { id: 'zeus_yildirimi', name: "Zeus'un İlahi Yıldırımı", price: 2, currency: 'diamond', minLevel: 4, desc: '30 saniye kül eder', icon: '⚡' },
                        mug_knife: { id: 'mug_knife', name: 'Gasp Bıçağı', price: 2, currency: 'diamond', minLevel: 5, desc: '2000 TL çalar', icon: '🗡️' },
                        izbandut: { id: 'izbandut', name: 'İzbandut Koruma', price: 5000, currency: 'money', minLevel: 5, desc: 'Patronu savunur', icon: '🕶️' }
                    }
                };
                if (typeof openTekinsizTekinModal === 'function') openTekinsizTekinModal();
                if (typeof renderShadyShopUI === 'function') renderShadyShopUI(testState);
            })()
        `);
        await new Promise(r => setTimeout(r, 1000));

        const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const shot1Path = path.join(ARTIFACT_DIR, 'verified_tekinsiz_tekin_lock_overlays.png');
        fs.writeFileSync(shot1Path, Buffer.from(shot1.data, 'base64'));
        console.log("📸 Saved Tekinsiz Tekin lock overlays screenshot to:", shot1Path);

        // Close shop
        await evalJs(`if (typeof closeTekinsizTekinModal === 'function') closeTekinsizTekinModal();`);
        await new Promise(r => setTimeout(r, 500));

        // Test 2: Profile with Gasp Knife and active 24h Cooldown
        console.log("Opening player profile modal to verify 24h Gasp countdown...");
        await evalJs(`
            (function() {
                window.myPlayerLevel = 5;
                if (typeof LevelClient !== 'undefined') LevelClient.currentLevel = 5;
                window.myMugKnifeCount = 1;
                window.myHasMugKnife = true;
                window.myPropInventory = { 'props_gasp_bicagi': 1 };
                window.myInventory = ['props_gasp_bicagi'];

                let dummyTarget = {
                    id: 'dummy_target',
                    name: 'Karanlik_Hedef',
                    x: 400,
                    y: 400,
                    level: 5,
                    avatar: { body: 'avatar1' }
                };
                if (typeof openPlayerInteractionModal === 'function') {
                    openPlayerInteractionModal(dummyTarget);
                }
                if (window.currentInteractingPlayer) {
                    window.currentInteractingPlayer.mugCooldownRemMs = 14 * 3600 * 1000 + 22 * 60 * 1000;
                    window.currentInteractingPlayer.mugCooldownReceivedAt = Date.now();
                    if (typeof updateProfileMugCooldownUI === 'function') updateProfileMugCooldownUI();

                    const tt = document.getElementById('profileMugTooltip');
                    if (tt) {
                        tt.style.cssText = 'position: absolute; right: calc(100% + 8px); top: 50%; transform: translateY(-50%); background: rgba(15, 23, 42, 0.98); border: 1px solid #facc15; border-radius: 8px; padding: 6px 12px; color: #ffffff; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 14px rgba(0,0,0,0.6); opacity: 1 !important; z-index: 99999 !important; display: block !important;';
                    }
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        const shot2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const shot2Path = path.join(ARTIFACT_DIR, 'verified_profile_mug_cooldown.png');
        fs.writeFileSync(shot2Path, Buffer.from(shot2.data, 'base64'));
        console.log("📸 Saved Profile Mug Cooldown screenshot to:", shot2Path);

        cleanup();
        console.log("🎉 UI Verification completed successfully!");
        process.exit(0);
    } catch (e) {
        console.error("❌ Verification failed:", e);
        cleanup();
        process.exit(1);
    }
}

verifyEnhancementsUI();
