// scratch/verify_profile_ui_self_vs_other.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9297;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_' + Date.now();

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
        console.log("Registering as " + testUsername + " via actual UI form...");

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

        // Wait for login and HUD
        await new Promise(r => setTimeout(r, 2000));

        const loggedInUser = await evalJs(`window.myUsername`);
        console.log("Logged in user:", loggedInUser);

        // Close any onboarding/updates modal
        await evalJs(`
            (function() {
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
            })()
        `);
        await new Promise(r => setTimeout(r, 300));

        // Click "Profilim" nav button
        console.log("Clicking 'Profilim' nav button...");
        await evalJs(`
            (function() {
                const btn = document.getElementById('myProfileNavBtn');
                if (btn) btn.click();
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const selfXpState = await evalJs(`
            (function() {
                const el = document.getElementById('profileLiveXpContainer');
                const fill = document.getElementById('profileLiveXpFill');
                const text = document.getElementById('profileLiveXpText');
                const title = document.getElementById('profileLiveXpTitle');
                return {
                    visible: el ? (el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none') : false,
                    display: el ? el.style.display : null,
                    title: title ? title.innerText.trim() : null,
                    width: fill ? fill.style.width : null,
                    text: text ? text.textContent.trim() : null
                };
            })()
        `);
        console.log("Self Profile Live XP Bar State:", selfXpState);

        // Capture screenshot of own profile modal
        const selfShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_profile_self_live_xp.png',
            Buffer.from(selfShot.data, 'base64')
        );
        console.log("Saved verified_profile_self_live_xp.png");

        // Now simulate opening another user's profile
        console.log("Opening another user's profile...");
        await evalJs(`
            (function() {
                const otherPlayer = {
                    id: 'other_sock_id',
                    name: 'Meltem_99',
                    gender: 'female',
                    level: 5,
                    avatar: { model: 'karakter_2', gender: 'female' }
                };
                if (typeof openPlayerInteractionModal === 'function') {
                    openPlayerInteractionModal('other_sock_id', otherPlayer);
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 1200));

        const otherXpState = await evalJs(`
            (function() {
                const el = document.getElementById('profileLiveXpContainer');
                return {
                    visible: el ? (el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none') : false,
                    display: el ? el.style.display : null
                };
            })()
        `);
        console.log("Other Player Profile Live XP Bar State:", otherXpState);

        // Capture screenshot of other's profile modal
        const otherShot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_profile_other_hidden_xp.png',
            Buffer.from(otherShot.data, 'base64')
        );
        console.log("Saved verified_profile_other_hidden_xp.png");

        cleanup();
        console.log("UI verification completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("UI Test Error:", err);
        cleanup();
        process.exit(1);
    }
}

run();
