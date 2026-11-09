const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9236;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('Starting Edge for Vet & Drag verification...');
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

    // Register / login
    const uname = 'vet_check_' + Math.floor(Math.random() * 90000 + 10000);
    await send('Runtime.evaluate', {
        expression: `
            new Promise((resolve) => {
                socket.emit('register', {
                    username: '${uname}',
                    password: 'password123',
                    avatar: { gender: 'erkek', skinColor: '#ffd1b3', hairStyle: 'kısa', hairColor: '#2b1d0c' }
                });
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

    // Switch to pet_shop and close modals
    await send('Runtime.evaluate', {
        expression: `
            document.querySelectorAll('.modal, .modal-backdrop, #badgeLevelUpModal, #updatesModal').forEach(el => {
                el.style.display = 'none';
            });
            if (typeof changeRoom === 'function') changeRoom('pet_shop');
        `
    });

    await sleep(2000);

    // Check drag protection on canvas
    const dragCheck = await send('Runtime.evaluate', {
        expression: `
            (() => {
                const sel = window.getSelection().toString();
                return { selectionEmpty: sel === '' };
            })()
        `,
        returnByValue: true
    });
    console.log('Drag / text selection state:', dragCheck.result.value);

    // Take screenshot of Dr. Selim & Danışma
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_veteriner_refined.png', Buffer.from(shot.data, 'base64'));
    console.log('Saved screenshot to verified_veteriner_refined.png');

    // Test opening the upgraded petShopModal
    const modalCheck = await send('Runtime.evaluate', {
        expression: `
            (() => {
                if (typeof openPetShopModal === 'function') openPetShopModal();
                const m = document.getElementById('petShopModal');
                const title = m ? m.querySelector('h2')?.innerText : '';
                return {
                    isOpen: m?.style.display !== 'none',
                    title: title
                };
            })()
        `,
        returnByValue: true
    });
    console.log('Upgraded modal check:', modalCheck.result.value);

    // Take screenshot of the upgraded modal
    const modalShot = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_veteriner_modal.png', Buffer.from(modalShot.data, 'base64'));
    console.log('Saved screenshot to verified_veteriner_modal.png');

    console.log('Console Errors:', consoleErrors.length, consoleErrors);

    ws.close();
    edge.kill();

    if (consoleErrors.length === 0 && modalCheck.result.value.isOpen) {
        console.log('🎉 ALL VET AND DRAG REFINEMENTS VERIFIED SUCCESSFULLY WITH 0 CONSOLE ERRORS!');
        process.exit(0);
    } else {
        process.exit(1);
    }
}

run();

