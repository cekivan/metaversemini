// scratch/verify_doberman_and_bodyguards.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9294;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_dob_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'about:blank'
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
        let pageTab = listRes.find(t => t.type === 'page');

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

        async function captureScreenshot(filename) {
            const res = await sendCmd('Page.captureScreenshot', { format: 'png' });
            if (res && res.data) {
                const buffer = Buffer.from(res.data, 'base64');
                const outPath = path.join(ARTIFACT_DIR, filename);
                fs.writeFileSync(outPath, buffer);
                console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);
                return outPath;
            }
        }

        async function dismissAllOverlays() {
            await evalJs(`
                if (window.DailyRewardClient && typeof window.DailyRewardClient.closeModal === 'function') {
                    window.DailyRewardClient.closeModal();
                }
                let dr = document.getElementById('dailyRewardOverlay');
                if (dr) dr.style.display = 'none';
                let um = document.getElementById('updatesModal');
                if (um) um.style.display = 'none';
                let dm = document.getElementById('dialogOverlay');
                if (dm) dm.style.display = 'none';
                let bdm = document.getElementById('badgeCelebrationOverlay');
                if (bdm) bdm.style.display = 'none';
                let sc = document.getElementById('sideChatContainer');
                if (sc) sc.style.display = 'none';
            `);
        }

        await sendCmd('Page.enable');
        await sendCmd('Runtime.enable');
        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        // 1. DOBERMAN 8-WAY PREVIEW
        console.log("1. Navigating to test_doberman_preview.html...");
        await sendCmd('Page.navigate', { url: 'http://localhost:3000/test_doberman_preview.html' });
        await new Promise(r => setTimeout(r, 2500));
        await captureScreenshot('verified_doberman_8way_preview.png');

        // 2. LIVE GAMEPLAY: BODYGUARDS + DOBERMAN COEXISTENCE
        console.log("2. Navigating to live game http://localhost:3000 ...");
        await sendCmd('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 2500));

        console.log("Logging in as user 123...");
        await evalJs(`
            if (window.socket) {
                window.socket.emit('login', { name: '123', pass: '123' });
            }
        `);
        await new Promise(r => setTimeout(r, 2000));

        // Transport to vip_club
        await evalJs(`
            if (typeof changeRoom === 'function') changeRoom('vip_club');
            else if (window.socket) window.socket.emit('changeRoom', { newRoom: 'vip_club' });

            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].x = 500;
                window.players[window.myId].y = 420;
                window.players[window.myId].facing = 'down';
            }
        `);
        await new Promise(r => setTimeout(r, 1500));

        console.log("3. Purchasing 3 İzbandut Bodyguards and 1 Doberman Companion Pet...");
        // Buy 3 İzbanduts
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 600));
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 600));
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 600));

        // Buy 1 Doberman
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'doberman' });`);
        await new Promise(r => setTimeout(r, 1200));

        // Check active pets
        const petSummary = await evalJs(`
            (function() {
                let list = [];
                for (let k in window.activeCompanionPets) {
                    let p = window.activeCompanionPets[k];
                    if (p) {
                        list.push({
                            id: p.id,
                            petType: p.petType,
                            name: p.name,
                            slotIndex: p.slotIndex,
                            curX: Math.round(p.curX),
                            curY: Math.round(p.curY),
                            facing: p.facing
                        });
                    }
                }
                return list;
            })()
        `);
        console.log("Active Pets on Client:", JSON.stringify(petSummary, null, 2));

        // Wait out the 5s timer if needed and dismiss overlays
        await new Promise(r => setTimeout(r, 4000));
        await dismissAllOverlays();

        // Simulate walking so trot kinematics & follow formations update smoothly
        console.log("4. Moving player to test formation...");
        await evalJs(`
            (function() {
                if (typeof players !== 'undefined' && players[myId]) {
                    const p = players[myId];
                    p.x = 480;
                    p.y = 380;
                    p.facing = 'down';
                    p.isMoving = true;
                    if (window.socket) window.socket.emit('playerMovement', { x: p.x, y: p.y, isMoving: true, facing: 'down' });
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 1200));

        await evalJs(`
            (function() {
                if (typeof players !== 'undefined' && players[myId]) {
                    const p = players[myId];
                    p.isMoving = false;
                    if (window.socket) window.socket.emit('playerMovement', { x: p.x, y: p.y, isMoving: false, facing: 'down' });
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 1000));
        await dismissAllOverlays();

        await captureScreenshot('verified_doberman_with_bodyguards_live.png');

        // Test room transition: change room to cadde
        console.log("5. Testing room change transition...");
        await evalJs(`
            if (typeof changeRoom === 'function') changeRoom('cadde');
            else if (window.socket) window.socket.emit('changeRoom', { newRoom: 'cadde' });
        `);
        await new Promise(r => setTimeout(r, 2000));
        await dismissAllOverlays();

        const petsAfterRoomChange = await evalJs(`
            (function() {
                let list = [];
                for (let k in window.activeCompanionPets) {
                    let p = window.activeCompanionPets[k];
                    if (p) {
                        list.push({
                            id: p.id,
                            petType: p.petType,
                            room: p.room,
                            curX: Math.round(p.curX),
                            curY: Math.round(p.curY)
                        });
                    }
                }
                return list;
            })()
        `);
        console.log("Pets after transition to cadde:", JSON.stringify(petsAfterRoomChange, null, 2));
        await captureScreenshot('verified_doberman_and_guards_cadde.png');

        console.log("Verification finished successfully!");
        cleanup();
    } catch (e) {
        console.error("Verification failed:", e);
        cleanup();
        process.exit(1);
    }
}

run();
