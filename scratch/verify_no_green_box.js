const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9228;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('Starting Edge for hover/drag test...');
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
    await sleep(1500);

    // Register / login
    const uname = 'vet_' + Math.floor(Math.random() * 90000 + 10000);
    console.log('Logging in as ' + uname);
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

    console.log('Closing all modals, switching to pet_shop room and positioning mouse at (750, 220)...');
    await send('Runtime.evaluate', {
        expression: `
            document.querySelectorAll('.modal, .modal-backdrop, #badgeLevelUpModal, #updatesModal').forEach(el => {
                el.style.display = 'none';
            });
            if (typeof changeRoom === 'function') {
                changeRoom('pet_shop');
            }
            window.canvasMouseX = 750;
            window.canvasMouseY = 220;
        `
    });

    await sleep(2000);

    const shot = await send('Page.captureScreenshot', { format: 'png' });
    const buf = Buffer.from(shot.data, 'base64');
    fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_no_green_box.png', buf);
    console.log('✅ Screenshot saved to verified_no_green_box.png');

    ws.close();
    edge.kill();
    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
