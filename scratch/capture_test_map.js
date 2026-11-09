// scratch/capture_test_map.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9295;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_test_map_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        `http://localhost:3000/test_adventure_map.html?t=${Date.now()}`
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
        let pageTab = listRes.find(t => t.type === 'page' && t.url.includes('test_adventure_map.html')) || listRes.find(t => t.type === 'page');

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

        await sendCmd('Page.enable');
        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        await new Promise(r => setTimeout(r, 1200));

        const artifactDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        const ss = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_adventure_map_preview.png'), Buffer.from(ss.data, 'base64'));
        console.log('📸 Ekran görüntüsü kaydedildi: verified_adventure_map_preview.png');

        cleanup();
        process.exit(0);
    } catch (e) {
        console.error(e);
        cleanup();
        process.exit(1);
    }
}

run();
