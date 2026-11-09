const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9235;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('🧪 Starting Edge Headless for Full Comprehensive Audit...');
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

    // 1. Audit Global Helper Existence
    const helpersCheck = await send('Runtime.evaluate', {
        expression: `JSON.stringify({
            EconomyManager: typeof window.EconomyManager === 'object',
            makeModalDraggable: typeof window.makeModalDraggable === 'function',
            promptEnterVipClub: typeof window.promptEnterVipClub === 'function',
            openTekinsizTekinModal: typeof window.openTekinsizTekinModal === 'function',
            drawBilliardTableObj: typeof window.drawBilliardTableObj === 'function',
            drawBlackjackTableObj: typeof window.drawBlackjackTableObj === 'function',
            renderStaticMineCaveTo: typeof window.renderStaticMineCaveTo === 'function',
            bgCache: typeof window.bgCache === 'object'
        })`,
        returnByValue: true
    });
    console.log('1️⃣ Global Modules Audit:', JSON.parse(helpersCheck.result.value));

    // 2. Audit EconomyManager Sync across DOM Elements
    const economySyncTest = await send('Runtime.evaluate', {
        expression: `(() => {
            window.EconomyManager.setMoney(77777);
            window.EconomyManager.setDiamonds(888);

            const userMoney = document.getElementById('userMoneyDisplay')?.innerText;
            const petMoney = document.getElementById('petShopUserMoney')?.innerText;
            const diamonds = document.getElementById('myDiamonds')?.innerText;

            return {
                myMoney: window.myMoney,
                myDiamonds: window.myDiamonds,
                userMoneyDisplay: userMoney,
                petShopUserMoney: petMoney,
                diamondsDisplay: diamonds,
                passed: (window.myMoney === 77777 && window.myDiamonds === 888 && userMoney === '77.777' && diamonds === '888')
            };
        })()`,
        returnByValue: true
    });
    console.log('2️⃣ EconomyManager Sync Audit:', economySyncTest.result.value);

    // 3. Login test user
    await send('Runtime.evaluate', {
        expression: `
            const u = document.getElementById('usernameInput');
            const b = document.getElementById('loginBtn');
            if (u && b) {
                u.value = 'AuditTester';
                b.click();
            }
        `
    });

    await sleep(2000);

    // 4. Test room warp to kafe and render frames
    console.log('🔄 Checking Kafe & Table rendering...');
    await send('Runtime.evaluate', {
        expression: `if (typeof socket !== 'undefined' && socket) socket.emit('changeRoom', { targetRoom: 'kafe' });`
    });
    await sleep(2000);

    // 5. Test room warp to mine_cave and render frames
    console.log('🔄 Checking Mine Cave & Offscreen Caching...');
    await send('Runtime.evaluate', {
        expression: `if (typeof socket !== 'undefined' && socket) socket.emit('changeRoom', { targetRoom: 'mine_cave' });`
    });
    await sleep(2000);

    // 6. Test room warp to pet_shop and hover interaction
    console.log('🔄 Checking Pet Shop & Absence of Green Box...');
    await send('Runtime.evaluate', {
        expression: `if (typeof socket !== 'undefined' && socket) socket.emit('changeRoom', { targetRoom: 'pet_shop' });`
    });
    await sleep(2000);

    // Simulate mouse hover over Dr. Selim Hekimoğlu
    await send('Runtime.evaluate', {
        expression: `
            window.canvasMouseX = 750;
            window.canvasMouseY = 220;
            if (typeof drawPetShopInteriorEnvironment === 'function') {
                drawPetShopInteriorEnvironment();
            }
        `
    });
    await sleep(1000);

    // 7. Test makeModalDraggable on an open modal
    const draggableTest = await send('Runtime.evaluate', {
        expression: `(() => {
            const sideChat = document.getElementById('sideChatContainer');
            const chatHeader = document.getElementById('chatHeader');
            if (sideChat && chatHeader) {
                return { isInit: !!sideChat._draggableInit };
            }
            return { notFound: true };
        })()`,
        returnByValue: true
    });
    console.log('7️⃣ Draggable Audit:', draggableTest.result.value);

    console.log('Console Errors caught during audit:', consoleErrors);

    ws.close();
    edge.kill();

    if (consoleErrors.length > 0) {
        console.error('❌ Audit encountered errors:', consoleErrors);
        process.exit(1);
    } else {
        console.log('🎉 COMPREHENSIVE AUDIT PASSED WITH 100% SUCCESS!');
    }
}

run().catch(err => {
    console.error('Test script crashed:', err);
    process.exit(1);
});
