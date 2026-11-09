// scratch/verify_single_line_profile_ui.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9295;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_single_line_' + Date.now();

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

        const testUsername = 'oyuncu_' + Math.floor(1000 + Math.random() * 9000);
        console.log("Registering as " + testUsername + " (male)...");

        await evalJs(`
            (function() {
                if (typeof switchAuthTab === 'function') switchAuthTab('register');
                const regU = document.getElementById('regUsernameInput');
                const regP = document.getElementById('regPasswordInput');
                const regPC = document.getElementById('regPasswordConfirmInput');
                if (regU) regU.value = '${testUsername}';
                if (regP) regP.value = 'Password123!';
                if (regPC) regPC.value = 'Password123!';
                if (typeof attemptRegister === 'function') attemptRegister();
            })()
        `);

        // Wait for login
        await new Promise(r => setTimeout(r, 2000));

        // Dismiss update modal
        await evalJs(`
            (function() {
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
            })()
        `);
        await new Promise(r => setTimeout(r, 300));

        // 1. Open own profile
        console.log("Opening own profile...");
        await evalJs(`
            (function() {
                const btn = document.getElementById('myProfileNavBtn');
                if (btn) btn.click();
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const selfHeaderInfo = await evalJs(`
            (function() {
                const nameEl = document.getElementById('interactionPlayerName');
                const xpEl = document.getElementById('profileLiveXpContainer');
                const xpText = document.getElementById('profileLiveXpText');
                const modelBadge = document.getElementById('interactionModelBadge');
                return {
                    nameHtml: nameEl ? nameEl.innerHTML : null,
                    nameText: nameEl ? nameEl.innerText.trim() : null,
                    hasModelBadge: !!modelBadge,
                    xpVisible: xpEl ? (xpEl.style.display !== 'none') : false,
                    xpText: xpText ? xpText.textContent.trim() : null
                };
            })()
        `);
        console.log("Self Profile Header Info:", selfHeaderInfo);

        // Capture screenshot of own single-line profile
        const selfShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_single_line_self_profile.png',
            Buffer.from(selfShot.data, 'base64')
        );
        console.log("Saved verified_single_line_self_profile.png");

        // 2. Open an Admin player's profile (viewing another user who is Admin)
        console.log("Opening Admin player's profile (viewing someone else)...");
        await evalJs(`
            (function() {
                const adminPlayer = {
                    id: 'admin_test_sid',
                    name: 'yasin',
                    gender: 'male',
                    level: 1,
                    role: 'admin',
                    isAdmin: true,
                    avatar: { model: 'karakter_2', gender: 'male' }
                };
                if (typeof openPlayerInteractionModal === 'function') {
                    openPlayerInteractionModal('admin_test_sid', adminPlayer);
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const adminHeaderInfo = await evalJs(`
            (function() {
                const nameEl = document.getElementById('interactionPlayerName');
                const xpEl = document.getElementById('profileLiveXpContainer');
                return {
                    nameHtml: nameEl ? nameEl.innerHTML : null,
                    nameText: nameEl ? nameEl.innerText.trim() : null,
                    xpVisible: xpEl ? (xpEl.style.display !== 'none') : false
                };
            })()
        `);
        console.log("Admin Profile Header Info:", adminHeaderInfo);

        // Capture screenshot of viewing Admin profile
        const adminShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_single_line_admin_profile.png',
            Buffer.from(adminShot.data, 'base64')
        );
        console.log("Saved verified_single_line_admin_profile.png");

        // 3. Open a Female Mod player's profile
        console.log("Opening Female Mod player's profile...");
        await evalJs(`
            (function() {
                const modPlayer = {
                    id: 'mod_test_sid',
                    name: 'elyesa',
                    gender: 'female',
                    level: 10,
                    role: 'mod',
                    isMod: true,
                    avatar: { model: 'karakter_2', gender: 'female' }
                };
                if (typeof openPlayerInteractionModal === 'function') {
                    openPlayerInteractionModal('mod_test_sid', modPlayer);
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const modHeaderInfo = await evalJs(`
            (function() {
                const nameEl = document.getElementById('interactionPlayerName');
                const xpEl = document.getElementById('profileLiveXpContainer');
                return {
                    nameHtml: nameEl ? nameEl.innerHTML : null,
                    nameText: nameEl ? nameEl.innerText.trim() : null,
                    xpVisible: xpEl ? (xpEl.style.display !== 'none') : false
                };
            })()
        `);
        console.log("Mod Profile Header Info:", modHeaderInfo);

        // Capture screenshot of viewing Female Mod profile
        const modShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_single_line_mod_female_profile.png',
            Buffer.from(modShot.data, 'base64')
        );
        console.log("Saved verified_single_line_mod_female_profile.png");

        cleanup();
        console.log("Single line UI tests completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("UI Test Error:", err);
        cleanup();
        process.exit(1);
    }
}

run();

