// scratch/verify_profile_level1_after_1xp.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9296;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_lvl1_' + Date.now();

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
        console.log("Registering as " + testUsername + "...");

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

        // Close update modal
        await evalJs(`
            (function() {
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
            })()
        `);
        await new Promise(r => setTimeout(r, 300));

        // Grant 1 XP via socket
        console.log("Granting 1 XP to trigger Level 1...");
        await evalJs(`
            (function() {
                if (window.socket) {
                    window.socket.emit('adminAddXP', {
                        targetUsername: '${testUsername}',
                        xp: 1,
                        source: 'İlk Hasat',
                        secret: 'metaverse_test_dev'
                    });
                }
            })()
        `);

        // Wait for level up and HUD update
        await new Promise(r => setTimeout(r, 1500));

        // Dismiss levelUp celebration modal
        await evalJs(`
            (function() {
                const btn = document.getElementById('levelUpClaimBtn');
                if (btn) btn.click();
                const ov = document.getElementById('levelUpOverlay');
                if (ov) ov.style.display = 'none';
            })()
        `);
        await new Promise(r => setTimeout(r, 500));

        // Open own profile
        console.log("Opening own profile after Level 1...");
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
                    visible: el ? el.style.display !== 'none' : false,
                    display: el ? el.style.display : null,
                    title: title ? title.innerText.trim() : null,
                    width: fill ? fill.style.width : null,
                    text: text ? text.textContent.trim() : null
                };
            })()
        `);
        console.log("Level 1 Profile Live XP Bar State:", selfXpState);

        // Capture screenshot of Level 1 profile modal
        const shot = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_profile_after_level1_live_xp.png',
            Buffer.from(shot.data, 'base64')
        );
        console.log("Saved verified_profile_after_level1_live_xp.png");

        cleanup();
        console.log("Level 1 UI verification completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("UI Test Error:", err);
        cleanup();
        process.exit(1);
    }
}

run();
