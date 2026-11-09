const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9230;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('Starting Edge for drag simulation...');
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

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Input.enable').catch(() => {});
    await sleep(1500);

    // Register / login
    const uname = 'vetdrag_' + Math.floor(Math.random() * 90000 + 10000);
    await send('Runtime.evaluate', {
        expression: `
            new Promise((resolve) => {
                socket.emit('register', { username: '${uname}', password: 'password123', avatar: { gender: 'erkek', skinColor: '#ffd1b3', hairStyle: 'kısa', hairColor: '#2b1d0c' } });
                socket.once('loginSuccess', resolve);
                socket.once('registerFailed', () => {
                    socket.emit('login', { username: '${uname}', password: 'password123' });
                    socket.once('loginSuccess', resolve);
                });
            })
        `,
        awaitPromise: true
    });

    await sleep(2000);

    // Switch to pet_shop
    await send('Runtime.evaluate', {
        expression: `
            document.querySelectorAll('.modal, .modal-backdrop, #badgeLevelUpModal, #updatesModal').forEach(el => {
                el.style.display = 'none';
            });
            if (typeof changeRoom === 'function') {
                changeRoom('pet_shop');
            }
        `
    });

    await sleep(2000);

    // Get canvas bounds
    const boxRes = await send('Runtime.evaluate', {
        expression: `
            const c = document.getElementById('gameCanvas');
            const rect = c.getBoundingClientRect();
            ({ x: rect.left, y: rect.top, width: rect.width, height: rect.height })
        `,
        returnByValue: true
    });
    const cBox = boxRes.result.value;
    console.log('Canvas rect:', cBox);

    // Drag from (630, 150) relative to canvas
    // In canvas coordinates, canvas is 1000x625 (wide-screen). Scale to clientX/Y:
    const scaleX = cBox.width / 1000;
    const scaleY = cBox.height / 625;

    const startX = cBox.x + 630 * scaleX;
    const startY = cBox.y + 150 * scaleY;
    const endX = cBox.x + 965 * scaleX;
    const endY = cBox.y + 315 * scaleY;

    console.log('Simulating mouse drag from', { startX, startY }, 'to', { endX, endY });

    // Mouse press
    await send('Input.dispatchMouseEvent', {
        type: 'mousePressed',
        x: startX,
        y: startY,
        button: 'left',
        clickCount: 1
    });
    await sleep(200);

    // Mouse move to intermediate and end while pressed
    await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: (startX + endX) / 2,
        y: (startY + endY) / 2,
        buttons: 1
    });
    await sleep(200);

    await send('Input.dispatchMouseEvent', {
        type: 'mouseMoved',
        x: endX,
        y: endY,
        buttons: 1
    });
    await sleep(300);

    // Capture screenshot while mouse is down / dragged
    const shotDuring = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/drag_during.png', Buffer.from(shotDuring.data, 'base64'));
    console.log('Captured drag_during.png');

    // Mouse release
    await send('Input.dispatchMouseEvent', {
        type: 'mouseReleased',
        x: endX,
        y: endY,
        button: 'left'
    });
    await sleep(300);

    const shotAfter = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/drag_after.png', Buffer.from(shotAfter.data, 'base64'));
    console.log('Captured drag_after.png');

    ws.close();
    edge.kill();
    process.exit(0);
}

run();

