const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function checkConsoleErrors() {
    console.log("🌐 Launching Edge to monitor all browser console logs/errors...");
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9297;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_console_' + Date.now();

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

        const consoleMessages = [];
        const pageErrors = [];

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

        ws.on('message', (data) => {
            const parsed = JSON.parse(data);
            if (parsed.method === 'Console.messageAdded') {
                consoleMessages.push(parsed.params.message);
            } else if (parsed.method === 'Runtime.consoleAPICalled') {
                consoleMessages.push(parsed.params);
            } else if (parsed.method === 'Runtime.exceptionThrown') {
                pageErrors.push(parsed.params.exceptionDetails);
            }
        });

        await sendCmd('Console.enable');
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

        // Test walking
        await evalJs(`
            (function() {
                if (typeof myAvatar !== 'undefined' && myAvatar) {
                    myAvatar.targetX = 450;
                    myAvatar.targetY = 320;
                    myAvatar.isMoving = true;
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        // Test opening wardrobe
        await evalJs(`
            (function() {
                if (typeof openWardrobeModal === 'function') openWardrobeModal();
            })()
        `);
        await new Promise(r => setTimeout(r, 500));

        // Close wardrobe
        await evalJs(`
            (function() {
                if (typeof closeWardrobeModal === 'function') closeWardrobeModal();
            })()
        `);
        await new Promise(r => setTimeout(r, 300));

        // Test opening daily rewards
        await evalJs(`
            (function() {
                if (typeof openDailyRewardModal === 'function') openDailyRewardModal();
            })()
        `);
        await new Promise(r => setTimeout(r, 500));

        // Close daily rewards
        await evalJs(`
            (function() {
                if (typeof closeDailyRewardModal === 'function') closeDailyRewardModal();
            })()
        `);
        await new Promise(r => setTimeout(r, 300));

        // Transition to cadde2
        await evalJs(`
            (function() {
                if (typeof changeRoom === 'function') changeRoom('cadde2', { x: 500, y: 220 });
            })()
        `);
        await new Promise(r => setTimeout(r, 1000));

        // Check for any uncaught exceptions
        console.log("\n================ REPORT ================");
        console.log(`Uncaught Page Exceptions: ${pageErrors.length}`);
        if (pageErrors.length > 0) {
            pageErrors.forEach(err => {
                console.error("❌ Exception:", err.text, err.exception?.description || err.exception?.value || '');
            });
        } else {
            console.log("✅ 0 Uncaught page exceptions during active gameplay & UI opening!");
        }

        const severeErrors = consoleMessages.filter(m => m.level === 'error' || m.type === 'error');
        console.log(`Severe Console Errors: ${severeErrors.length}`);
        if (severeErrors.length > 0) {
            severeErrors.forEach(e => {
                console.error("⚠️ Console Error:", e.text || e.args?.map(a => a.value || a.description).join(' '));
            });
        } else {
            console.log("✅ 0 Console errors logged!");
        }

        cleanup();
        process.exit(pageErrors.length > 0 ? 1 : 0);
    } catch (e) {
        console.error("Audit error:", e);
        cleanup();
        process.exit(1);
    }
}

checkConsoleErrors();
