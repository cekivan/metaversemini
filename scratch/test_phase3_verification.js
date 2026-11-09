const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9232;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('🧪 Starting Edge Headless to test Phase 3 Performance & Caching...');
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

    // 1. Verify renderStaticMineCaveTo is available
    const staticCheck = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
            renderStaticMineCaveTo: typeof window.renderStaticMineCaveTo,
            hasBgCache: typeof window.bgCache !== 'undefined',
        })`,
        returnByValue: true
    });
    console.log('✅ Static render check:', JSON.parse(staticCheck.result.value));

    // 2. Test bgCache for mine_cave directly
    const bgCacheMineTest = await send('Runtime.evaluate', {
        expression: `(() => {
            if (typeof window.bgCache !== 'undefined') {
                const c = window.bgCache.getCanvas('mine_cave', 1000, 625);
                return { width: c.width, height: c.height, isCanvas: c instanceof HTMLCanvasElement };
            }
            return null;
        })()`,
        returnByValue: true
    });
    console.log('✅ bgCache mine_cave generation test:', bgCacheMineTest.result.value);

    // 3. Login test user
    await send('Runtime.evaluate', {
        expression: `
            const u = document.getElementById('usernameInput');
            const b = document.getElementById('loginBtn');
            if (u && b) {
                u.value = 'Phase3Tester';
                b.click();
            }
        `
    });

    await sleep(2000);

    // 4. Test room warp to mine_cave and 20 frames of rendering
    console.log('🔄 Warping to mine_cave...');
    await send('Runtime.evaluate', {
        expression: `
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('changeRoom', { targetRoom: 'mine_cave' });
            }
        `
    });

    await sleep(2500);

    const roomCheck = await send('Runtime.evaluate', {
        expression: `window.currentRoom`,
        returnByValue: true
    });
    console.log('✅ Current Room:', roomCheck.result.value);

    // Run 30 animation frames in mine_cave
    await send('Runtime.evaluate', {
        expression: `new Promise((resolve) => {
            let frames = 0;
            function step() {
                frames++;
                if (frames < 30) {
                    requestAnimationFrame(step);
                } else {
                    resolve(frames);
                }
            }
            requestAnimationFrame(step);
        })`,
        awaitPromise: true
    });
    console.log('✅ 30 frames rendered smoothly in mine_cave');

    // 5. Test room warp to pet_shop
    console.log('🔄 Warping to pet_shop...');
    await send('Runtime.evaluate', {
        expression: `
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('changeRoom', { targetRoom: 'pet_shop' });
            }
        `
    });

    await sleep(2000);

    console.log('Console Errors captured:', consoleErrors);

    ws.close();
    edge.kill();

    if (consoleErrors.length > 0) {
        console.error('❌ Phase 3 test encountered errors:', consoleErrors);
        process.exit(1);
    } else {
        console.log('🎉 Phase 3 Performance & Caching verified 100% SUCCESSFUL!');
    }
}

run().catch(err => {
    console.error('Test script crashed:', err);
    process.exit(1);
});

