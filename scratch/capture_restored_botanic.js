// scratch/capture_restored_botanic.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9289;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_botanic_restored_' + Date.now();

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
            const r = await sendCmd('Runtime.evaluate', {
                expression: expr,
                returnByValue: true,
                awaitPromise: true
            });
            return (r && r.result) ? r.result.value : r;
        }

        async function takeScreenshot(filename) {
            const r = await sendCmd('Page.captureScreenshot', { format: 'png' });
            const buf = Buffer.from(r.data, 'base64');
            const p = path.resolve('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5', filename);
            fs.writeFileSync(p, buf);
            console.log(`Saved screenshot: ${filename} (${buf.length} bytes)`);
            return p;
        }

        await sendCmd('Runtime.enable');
        await sendCmd('Page.enable');
        await sendCmd('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 2000));

        await evalJs(`
            if (window.socket) {
                window.socket.emit('login', { name: '123', pass: '123' });
            }
        `);
        await new Promise(r => setTimeout(r, 2000));

        // Close any popups
        await evalJs(`
            if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
            let um = document.getElementById('updatesModal');
            if (um) um.style.display = 'none';
            let dm = document.getElementById('dialogOverlay');
            if (dm) dm.style.display = 'none';
            let ov = document.querySelectorAll('.modal, .overlay, #shadyShopModal');
            ov.forEach(m => m.style.display = 'none');
        `);

        // Switch to botanic_shop
        await evalJs(`
            if (typeof changeRoom === 'function') changeRoom('botanic_shop');
            else if (window.socket) window.socket.emit('changeRoom', { newRoom: 'botanic_shop' });
            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].x = 500;
                window.players[window.myId].y = 380;
                window.players[window.myId].facing = 'up';
            }
        `);
        await new Promise(r => setTimeout(r, 1500));

        // Take full screenshot
        await takeScreenshot('verified_botanic_restored_overview.png');

        // Zoomed crop around Defne and Rasim
        const defneCrop = await evalJs(`
            (() => {
                const cv = document.getElementById('gameCanvas');
                const cropCv = document.createElement('canvas');
                cropCv.width = 440;
                cropCv.height = 360;
                const cctx = cropCv.getContext('2d');
                cctx.imageSmoothingEnabled = false;

                // Center around Defne (310, 200)
                cctx.drawImage(cv, 310 - 110, 200 - 90, 220, 180, 0, 0, 440, 360);
                return cropCv.toDataURL('image/png');
            })()
        `);
        if (defneCrop) {
            const buf = Buffer.from(defneCrop.replace(/^data:image\/png;base64,/, ''), 'base64');
            fs.writeFileSync(path.resolve('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'verified_botanic_restored_defne.png'), buf);
            console.log('Saved verified_botanic_restored_defne.png');
        }

        const rasimCrop = await evalJs(`
            (() => {
                const cv = document.getElementById('gameCanvas');
                const cropCv = document.createElement('canvas');
                cropCv.width = 440;
                cropCv.height = 360;
                const cctx = cropCv.getContext('2d');
                cctx.imageSmoothingEnabled = false;

                // Center around Rasim (750, 200)
                cctx.drawImage(cv, 750 - 110, 200 - 90, 220, 180, 0, 0, 440, 360);
                return cropCv.toDataURL('image/png');
            })()
        `);
        if (rasimCrop) {
            const buf = Buffer.from(rasimCrop.replace(/^data:image\/png;base64,/, ''), 'base64');
            fs.writeFileSync(path.resolve('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'verified_botanic_restored_rasim.png'), buf);
            console.log('Saved verified_botanic_restored_rasim.png');
        }

        // Test opening Defne supplier modal
        await evalJs(`
            if (typeof openBotanicSupplierModal === 'function') openBotanicSupplierModal();
        `);
        await new Promise(r => setTimeout(r, 600));
        await takeScreenshot('verified_botanic_restored_supplier_modal.png');

        // Close modal and test opening Rasim market modal
        await evalJs(`
            if (typeof closeBotanicSupplierModal === 'function') closeBotanicSupplierModal();
            let sm = document.getElementById('botanicSupplierModal');
            if (sm) sm.style.display = 'none';

            if (typeof openBotanicMarketModal === 'function') openBotanicMarketModal();
        `);
        await new Promise(r => setTimeout(r, 600));
        await takeScreenshot('verified_botanic_restored_market_modal.png');

    } finally {
        cleanup();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
