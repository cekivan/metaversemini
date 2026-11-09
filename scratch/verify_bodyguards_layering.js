// scratch/verify_bodyguards_layering.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9283;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_izbandut_' + Date.now();

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

        // Move to VIP Club to buy bodyguards from Tekinsiz Tekin
        await evalJs(`
            if (typeof changeRoom === 'function') changeRoom('vip_club');
            else if (window.socket) window.socket.emit('changeRoom', { newRoom: 'vip_club' });
        `);
        await new Promise(r => setTimeout(r, 1200));

        // Buy 3 bodyguards
        await evalJs(`
            if (window.socket) {
                window.socket.emit('buyShadyItem', { itemId: 'izbandut' });
            }
        `);
        await new Promise(r => setTimeout(r, 600));

        await evalJs(`
            if (window.socket) {
                window.socket.emit('buyShadyItem', { itemId: 'izbandut' });
            }
        `);
        await new Promise(r => setTimeout(r, 600));

        await evalJs(`
            if (window.socket) {
                window.socket.emit('buyShadyItem', { itemId: 'izbandut' });
            }
        `);
        await new Promise(r => setTimeout(r, 1000));

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

        // Position player in VIP Club dance floor / lounge area facing DOWN
        await evalJs(`
            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].x = 480;
                window.players[window.myId].y = 420;
                window.players[window.myId].facing = 'down';
            }
        `);
        // Wait for bodyguards to catch up and settle into formation
        await new Promise(r => setTimeout(r, 2000));

        const formationData = await evalJs(`
            (() => {
                const me = window.players[window.myId];
                const guards = Object.values(window.activeCompanionPets || {}).filter(p => p && p.petType === 'izbandut' && (p.ownerId === window.myId || p.ownerName === me.name));
                return {
                    player: { x: me.x, y: me.y, facing: me.facing },
                    guardCount: guards.length,
                    guards: guards.map(g => ({
                        slotIndex: g.slotIndex,
                        curX: Math.round(g.curX),
                        curY: Math.round(g.curY),
                        relX: Math.round(g.curX - me.x),
                        relY: Math.round(g.curY - me.y)
                    }))
                };
            })()
        `);
        console.log('Formation data (Facing DOWN):', JSON.stringify(formationData, null, 2));

        // Take full screen shot
        await takeScreenshot('verified_izbandut_rearguard_down.png');

        // Capture high-res 2x zoomed crop around player and 3 bodyguards
        const dataUrl = await evalJs(`
            (() => {
                const cv = document.getElementById('gameCanvas');
                const cropCv = document.createElement('canvas');
                cropCv.width = 500;
                cropCv.height = 420;
                const cctx = cropCv.getContext('2d');
                cctx.imageSmoothingEnabled = false;

                // Center around (480, 400)
                const srcX = 480 - 125;
                const srcY = 400 - 110;
                const srcW = 250;
                const srcH = 220;

                cctx.drawImage(cv, srcX, srcY, srcW, srcH, 0, 0, 500, 420);
                return cropCv.toDataURL('image/png');
            })()
        `);
        if (dataUrl) {
            const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
            const buf = Buffer.from(base64Data, 'base64');
            const p = path.resolve('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'verified_izbandut_layering_closeup.png');
            fs.writeFileSync(p, buf);
            console.log(`Saved zoomed crop: verified_izbandut_layering_closeup.png (${buf.length} bytes)`);
        }

        // Test facing UP
        await evalJs(`
            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].facing = 'up';
            }
        `);
        await new Promise(r => setTimeout(r, 1200));
        await takeScreenshot('verified_izbandut_rearguard_up.png');

        // Test facing LEFT
        await evalJs(`
            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].facing = 'left';
            }
        `);
        await new Promise(r => setTimeout(r, 1200));
        await takeScreenshot('verified_izbandut_rearguard_left.png');

        // Test facing RIGHT
        await evalJs(`
            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].facing = 'right';
            }
        `);
        await new Promise(r => setTimeout(r, 1200));
        await takeScreenshot('verified_izbandut_rearguard_right.png');

        // Reset to DOWN and capture closeup showcase
        await evalJs(`
            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].facing = 'down';
            }
        `);
        await new Promise(r => setTimeout(r, 1200));
        await takeScreenshot('verified_izbandut_rearguard_final_down.png');

    } finally {
        cleanup();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
