const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
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

    const uname = 'clicktest_' + Math.floor(Math.random() * 90000 + 10000);
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

    const testRes = await send('Runtime.evaluate', {
        expression: `
            const pBefore = { x: players[myId].x, y: players[myId].y };
            handleCanvasTapOrClick(450, 300);
            const targetPos = window.targetWalkPos;
            ({ pBefore, targetPos })
        `,
        returnByValue: true
    });

    console.log('Tap test result:', testRes.result.value);

    ws.close();
    edge.kill();
    process.exit(0);
}

run();

