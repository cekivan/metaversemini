// scratch/capture_concept_a_evolution.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9298;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_concept_a_evo_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'http://localhost:3000/preview_concept_a_evolution.html'
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
        let pageTab = listRes.find(t => t.type === 'page' && t.url.includes('preview_concept_a_evolution.html')) || listRes.find(t => t.type === 'page');

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
        await sendCmd('Page.navigate', { url: 'http://localhost:3000/preview_concept_a_evolution.html' });
        await new Promise(r => setTimeout(r, 2000));

        // Set device metrics
        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1150,
            height: 1250,
            deviceScaleFactor: 1,
            mobile: false
        });
        await new Promise(r => setTimeout(r, 1000));

        // Full page screenshot
        const r = await sendCmd('Page.captureScreenshot', {
            format: 'png',
            captureBeyondViewport: true
        });

        const buf = Buffer.from(r.data, 'base64');
        const outPath = path.resolve('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'verified_concept_a_evolution.png');
        fs.writeFileSync(outPath, buf);
        console.log(`Saved screenshot: verified_concept_a_evolution.png (${buf.length} bytes) to ${outPath}`);

    } finally {
        cleanup();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

