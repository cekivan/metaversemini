// scratch/capture_changelog_tab.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9313;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_changelog_' + Date.now();

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

        await evalJs(`
            (function() {
                const uIn = document.getElementById('usernameInput');
                const pIn = document.getElementById('passwordInput');
                if (uIn) uIn.value = 'BetaTester_Changelog';
                if (pIn) pIn.value = 'password123';
                if (typeof attemptLogin === 'function') attemptLogin();
            })()
        `);

        await new Promise(r => setTimeout(r, 2500));

        await evalJs(`
            openBetaShowcaseModal('changelog');
        `);
        await new Promise(r => setTimeout(r, 800));

        const snap5 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath5 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_beta_v14_changelog_tab.png";
        fs.writeFileSync(artifactPath5, Buffer.from(snap5.data, 'base64'));
        console.log("✅ Ekran görüntüsü 5 (Changelog Tab) kaydedildi:", artifactPath5);

        cleanup();
        process.exit(0);
    } catch (e) {
        console.error(e);
        cleanup();
        process.exit(1);
    }
}
run();

