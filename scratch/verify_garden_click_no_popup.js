// scratch/verify_garden_click_no_popup.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9292;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_garden_' + Date.now();

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
        await new Promise(r => setTimeout(r, 2000));
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
        `);

        // Test clicking a withered plot directly (the exact scenario from user's image)
        const clickResult = await evalJs(`
            (function() {
                // Mock a withered plot (like in user screenshot)
                window.userFarmPlots = [
                    { plotIndex: 0, state: 'WITHERED' }
                ];
                
                // Directly call handleFarmPlotDirectClick(0)
                window.handleFarmPlotDirectClick(0);

                return {
                    modalInDOM: !!document.getElementById('farmPlotActionModal'),
                    toastActive: !!document.querySelector('.game-toast, #floatingToastContainer, .toast-notification, div[style*="border-radius"]')
                };
            })()
        `);
        console.log('Direct click on withered plot result:', clickResult);

        await new Promise(r => setTimeout(r, 500));
        await takeScreenshot('verified_farm_plot_click_no_modal.png');

    } finally {
        cleanup();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

