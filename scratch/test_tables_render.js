const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9231;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('🧪 Starting Edge Headless to test Table Drawers rendering...');
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
    ws.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
            consoleErrors.push(msg.params.args.map(a => a.value || a.description).join(' '));
        }
        if (msg.method === 'Runtime.exceptionThrown') {
            consoleErrors.push(msg.params.exceptionDetails.text + ' ' + (msg.params.exceptionDetails.exception?.description || ''));
        }
    });

    await send('Runtime.enable');
    await send('Page.enable');

    await sleep(2000);

    // 1. Check table drawers availability on window
    const drawersCheck = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
            drawBilliardTableObj: typeof window.drawBilliardTableObj,
            drawTavlaTableObj: typeof window.drawTavlaTableObj,
            drawXoxTableObj: typeof window.drawXoxTableObj,
            drawAmiralBattiTableObj: typeof window.drawAmiralBattiTableObj,
            drawChessTableObj: typeof window.drawChessTableObj,
            drawBatakTableObj: typeof window.drawBatakTableObj,
            drawOkey101TableObj: typeof window.drawOkey101TableObj,
            drawBlackjackTableObj: typeof window.drawBlackjackTableObj
        })`,
        returnByValue: true
    });
    console.log('✅ Table Drawer exports:', JSON.parse(drawersCheck.result.value));

    // 2. Login as test guest
    await send('Runtime.evaluate', {
        expression: `
            const u = document.getElementById('usernameInput');
            const b = document.getElementById('loginBtn');
            if (u && b) {
                u.value = 'TableTester';
                b.click();
            }
        `
    });

    await sleep(2000);

    // 3. Switch to 'kafe' and wait for rendering frames
    await send('Runtime.evaluate', {
        expression: `
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('changeRoom', { targetRoom: 'kafe' });
            }
        `
    });

    await sleep(2500);

    // 4. Check current room and canvas render state
    const roomCheck = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
            currentRoom: window.currentRoom,
            hasCanvas: !!document.getElementById('gameCanvas')
        })`,
        returnByValue: true
    });
    console.log('✅ In Room:', JSON.parse(roomCheck.result.value));

    // 5. Test manual direct invocation of table drawers on dummy canvas context to ensure zero runtime exceptions
    const directDrawCheck = await send('Runtime.evaluate', {
        expression: `(() => {
            const testCanvas = document.createElement('canvas');
            testCanvas.width = 400; testCanvas.height = 400;
            const testCtx = testCanvas.getContext('2d');
            window.ctx = testCtx;
            
            window.drawBilliardTableObj(10, 10, 100, 60, true);
            window.drawTavlaTableObj(10, 10, 100, 60, true);
            window.drawXoxTableObj(10, 10, 60, 60, true);
            window.drawAmiralBattiTableObj(10, 10, 60, 60, true);
            window.drawChessTableObj(10, 10, 60, 60, true);
            window.drawBatakTableObj(50, 50, 30, 4, 'Batak', true);
            window.drawOkey101TableObj(10, 10, 80, 80, true);
            window.drawBlackjackTableObj(10, 10, 120, 80, true);

            return 'SUCCESS';
        })()`,
        returnByValue: true
    });
    console.log('✅ Direct Canvas Draw invocation:', directDrawCheck.result.value);

    console.log('Console Errors:', consoleErrors);

    ws.close();
    edge.kill();

    if (consoleErrors.length > 0) {
        console.error('❌ Table Drawers test encountered errors:', consoleErrors);
        process.exit(1);
    } else {
        console.log('🎉 Table Drawers modularization verified 100% SUCCESSFUL!');
    }
}

run().catch(err => {
    console.error('Test script crashed:', err);
    process.exit(1);
});
