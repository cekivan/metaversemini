const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9233;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('🚀 Starting Edge for Wave 2 End-to-End Verification...');
    const edge = spawn(EDGE_PATH, [
        `--remote-debugging-port=${PORT}`,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--window-size=1280,900',
        'http://localhost:3000'
    ]);

    await sleep(2500);

    const tabs = JSON.parse(await httpGet(`http://localhost:${PORT}/json`));
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    function send(method, params = {}) {
        return new Promise((resolve) => {
            const id = msgId++;
            const handler = (data) => {
                const res = JSON.parse(data);
                if (res.id === id) {
                    ws.off('message', handler);
                    resolve(res.result);
                }
            };
            ws.on('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    const consoleErrors = [];
    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
                consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
            }
            if (msg.method === 'Runtime.exceptionThrown') {
                consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
            }
        } catch (e) {}
    });

    await send('Runtime.enable');
    await send('Page.enable');
    await sleep(1500);

    // 1. Check drawHeldItem and normalize8WayFacing in browser
    const globalsRes = await send('Runtime.evaluate', {
        expression: `
            ({
                hasDrawHeldItem: typeof window.drawHeldItem === 'function',
                hasNormalizeFacing: typeof window.normalize8WayFacing === 'function',
                hasMakeModalDraggable: typeof window.makeModalDraggable === 'function',
                hasEconomyHandler: typeof window.buyWardrobeItem === 'function' || typeof window.socket !== 'undefined'
            })
        `,
        returnByValue: true
    });
    console.log('1. Globals Check:', globalsRes.result.value);

    // 2. Perform mock drawing test with drawHeldItem
    const drawTestRes = await send('Runtime.evaluate', {
        expression: `
            (() => {
                const c = document.createElement('canvas');
                c.width = 200;
                c.height = 200;
                const ctx = c.getContext('2d');
                const testP = {
                    x: 100, y: 100,
                    heldItem: 'sigara',
                    facing: 'down',
                    model: 'classic_2',
                    gender: 'male',
                    skinColor: '#ffd1b3'
                };

                // Draw sigara
                window.drawHeldItem(ctx, 100, 100, 'sigara', true, 'down', false, 'classic_2', testP);
                // Draw nargile
                window.drawHeldItem(ctx, 100, 100, 'nargile', true, 'right', false, 'classic_2', testP);
                // Draw gitar
                window.drawHeldItem(ctx, 100, 100, 'gitar', true, 'down-right', false, 'classic_2', testP);
                // Draw asagold
                window.drawHeldItem(ctx, 100, 100, 'asagold', true, 'left', false, 'classic_2', testP);

                const data = ctx.getImageData(0, 0, 200, 200);
                let drawnPixels = 0;
                for (let i = 3; i < data.data.length; i += 4) {
                    if (data.data[i] > 0) drawnPixels++;
                }
                return { success: drawnPixels > 0, drawnPixels };
            })()
        `,
        returnByValue: true
    });
    console.log('2. drawHeldItem Canvas Render Test:', drawTestRes.result.value);

    // 3. Register & Login test
    const uname = 'w2user_' + Math.floor(Math.random() * 90000 + 10000);
    const loginRes = await send('Runtime.evaluate', {
        expression: `
            new Promise((resolve) => {
                socket.emit('register', {
                    username: '${uname}',
                    password: 'password123',
                    avatar: { gender: 'erkek', skinColor: '#ffd1b3', hairStyle: 'kısa', hairColor: '#2b1d0c' }
                });
                socket.once('loginSuccess', (data) => resolve({ ok: true, data }));
                socket.once('registerFailed', () => resolve({ ok: false }));
            })
        `,
        awaitPromise: true,
        returnByValue: true
    });
    console.log('3. Login Test Result:', loginRes.result.value);

    // 4. Test social modal draggable
    const dragTestRes = await send('Runtime.evaluate', {
        expression: `
            (() => {
                if (typeof openItemInventoryModal === 'function') openItemInventoryModal();
                const card = document.getElementById('itemInventoryModalCard');
                return {
                    cardExists: !!card,
                    cardInit: !!card?._draggableInit
                };
            })()
        `,
        returnByValue: true
    });
    console.log('4. Modal Draggable Initialization Test:', dragTestRes.result.value);

    await sleep(1000);

    console.log('5. Console Errors Logged:', consoleErrors.length, consoleErrors);

    ws.close();
    edge.kill();

    if (globalsRes.result.value.hasDrawHeldItem &&
        globalsRes.result.value.hasNormalizeFacing &&
        drawTestRes.result.value.success &&
        loginRes.result.value.ok &&
        consoleErrors.length === 0) {
        console.log('🎉 ALL WAVE 2 VERIFICATIONS PASSED WITH 0 CONSOLE ERRORS!');
        process.exit(0);
    } else {
        console.error('❌ Verification failed');
        process.exit(1);
    }
}

run();
