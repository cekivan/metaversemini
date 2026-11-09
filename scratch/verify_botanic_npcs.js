const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9305;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_botanic_test_' + Date.now();

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

        const http = require('http');
        const tabs = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${cdpPort}/json`, (res) => {
                let d = '';
                res.on('data', chunk => d += chunk);
                res.on('end', () => resolve(JSON.parse(d)));
            }).on('error', reject);
        });

        const gameTab = tabs.find(t => t.url && t.url.includes('localhost:3000')) || tabs[0];
        const ws = new WebSocket(gameTab.webSocketDebuggerUrl);
        await new Promise(r => ws.on('open', r));

        let id = 1;
        function send(method, params = {}) {
            return new Promise((resolve) => {
                const curId = id++;
                const handler = (msg) => {
                    const data = JSON.parse(msg);
                    if (data.id === curId) {
                        ws.off('message', handler);
                        resolve(data.result);
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id: curId, method, params }));
            });
        }

        await send('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 2000));

        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    if (window.socket) {
                        window.socket.emit('login', { name: '123', pass: '123' });
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 2000));

        // Switch to botanic_shop with only Defne speaking
        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const u = document.getElementById('updatesModal');
                    if (u) u.remove();
                    if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                    document.querySelectorAll('.modal, .game-modal, #authModal').forEach(m => m.style.display = 'none');
                    if (typeof changeRoom === 'function') {
                        changeRoom('botanic_shop');
                    }
                    if (typeof triggerBotanicSupplierGreeting === 'function') {
                        triggerBotanicSupplierGreeting();
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1500));

        // 1. Defne speaking
        const snap1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_botanic_defne_speech.png', Buffer.from(snap1.data, 'base64'));
        console.log('1. Saved verified_botanic_defne_speech.png');

        // 2. Clear Defne, trigger Rasim speaking
        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    // Set Defne speech time to way in the past
                    if (typeof triggerBotanicMarketGreeting === 'function') {
                        triggerBotanicMarketGreeting();
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 1500));

        const snap2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_botanic_rasim_speech.png', Buffer.from(snap2.data, 'base64'));
        console.log('2. Saved verified_botanic_rasim_speech.png');

        ws.close();
    } catch (e) {
        console.error('Error:', e);
    } finally {
        cleanup();
    }
}

run();
