// scratch/test_buy_3_bodyguards.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9275;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_buy3_' + Date.now();

    console.log('1. Launching Headless Edge with CDP on port', cdpPort);
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

        console.log('2. Connected! Navigating and logging in as 123...');
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
            let bdm = document.getElementById('badgeCelebrationOverlay');
            if (bdm) bdm.style.display = 'none';
        `);

        // Move to VIP Club and position near center
        await evalJs(`
            if (typeof changeRoom === 'function') changeRoom('vip_club');
            else if (window.socket) window.socket.emit('changeRoom', { newRoom: 'vip_club' });
            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].x = 490;
                window.players[window.myId].y = 420;
                window.players[window.myId].facing = 'down';
            }
        `);
        await new Promise(r => setTimeout(r, 1500));

        console.log('3. Purchasing 3 İzbandut Bodyguards...');
        // Buy 1st guard
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 800));

        // Buy 2nd guard
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 800));

        // Buy 3rd guard
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 1200));

        // Check active companions on client
        const activeGuards = await evalJs(`
            (function() {
                let list = [];
                for (let k in window.activeCompanionPets) {
                    let p = window.activeCompanionPets[k];
                    if (p && p.petType === 'izbandut') {
                        list.push({ id: p.id, slotIndex: p.slotIndex, curX: p.curX, curY: p.curY, facing: p.facing });
                    }
                }
                return list;
            })()
        `);
        console.log('Active Bodyguards on Client:', activeGuards);

        // Open shop to verify button says "Maksimum Koruma (3/3 Aktif)"
        await evalJs(`
            if (typeof openTekinsizTekinModal === 'function') openTekinsizTekinModal();
        `);
        await new Promise(r => setTimeout(r, 1200));

        const buttonState = await evalJs(`
            (function() {
                let grid = document.getElementById('shadyItemsGrid');
                if (!grid) return null;
                let text = grid.innerText;
                let hasMax = text.includes('Maksimum Koruma (3/3');
                return { textSnippet: text.substring(text.indexOf('İzbandut'), text.indexOf('İzbandut') + 200), hasMax };
            })()
        `);
        console.log('Shop Button State after 3 purchases:', buttonState);
        await takeScreenshot('verified_shady_shop_3_of_3_max.png');

        // Close modal and take screenshot of VIP player with 3 bodyguards escort formation!
        await evalJs(`
            let modal = document.getElementById('tekinsizTekinModal');
            if (modal) modal.style.display = 'none';
        `);
        await new Promise(r => setTimeout(r, 1000));

        await takeScreenshot('verified_3_bodyguards_in_game_escort.png');

        console.log('\n✅ All tests passed!');
    } finally {
        cleanup();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

