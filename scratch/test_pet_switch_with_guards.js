// scratch/test_pet_switch_with_guards.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9296;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_sw_' + Date.now();

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

        await sendCmd('Page.enable');
        await sendCmd('Runtime.enable');
        await sendCmd('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 2500));

        await evalJs(`window.socket.emit('login', { name: '123', pass: '123' });`);
        await new Promise(r => setTimeout(r, 2000));

        // 1. Spawn 3 guards
        await evalJs(`
            window.socket.emit('buyShadyItem', { itemId: 'izbandut' });
            window.socket.emit('buyShadyItem', { itemId: 'izbandut' });
            window.socket.emit('buyShadyItem', { itemId: 'izbandut' });
        `);
        await new Promise(r => setTimeout(r, 1500));

        // 2. Buy Cat
        await evalJs(`window.socket.emit('requestBuyPet', { petType: 'cat' });`);
        await new Promise(r => setTimeout(r, 1500));

        let state1 = await evalJs(`Object.values(window.activeCompanionPets || {}).map(p => p.petType)`);
        console.log("State with Cat:", state1);

        // 3. Buy Doberman -> should replace Cat, keep 3 guards
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'doberman' });`);
        await new Promise(r => setTimeout(r, 1500));

        let state2 = await evalJs(`Object.values(window.activeCompanionPets || {}).map(p => p.petType)`);
        console.log("State after buying Doberman:", state2);

        // 4. Buy Dog -> should replace Doberman, keep 3 guards
        await evalJs(`window.socket.emit('requestBuyPet', { petType: 'dog' });`);
        await new Promise(r => setTimeout(r, 1500));

        let state3 = await evalJs(`Object.values(window.activeCompanionPets || {}).map(p => p.petType)`);
        console.log("State after buying Dog:", state3);

        const ok1 = state1.filter(t => t === 'izbandut').length === 3 && state1.includes('cat');
        const ok2 = state2.filter(t => t === 'izbandut').length === 3 && state2.includes('doberman') && !state2.includes('cat');
        const ok3 = state3.filter(t => t === 'izbandut').length === 3 && state3.includes('dog') && !state3.includes('doberman');

        if (ok1 && ok2 && ok3) {
            console.log("SUCCESS: Switching pets preserves 3 bodyguards and properly replaces only companion pet!");
        } else {
            console.error("FAIL: Inconsistent pet states!");
            process.exit(1);
        }

        cleanup();
    } catch (e) {
        console.error("Test failed:", e);
        cleanup();
        process.exit(1);
    }
}

run();

