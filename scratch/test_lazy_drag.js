const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9234;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    const edge = spawn(EDGE_PATH, ['--remote-debugging-port=' + PORT, '--headless=new', '--no-sandbox', '--disable-gpu', 'http://localhost:3000']);
    await sleep(2500);
    const tabs = JSON.parse(await httpGet('http://localhost:' + PORT + '/json'));
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    function send(method, params = {}) {
        return new Promise((resolve) => {
            const id = msgId++;
            const handler = (data) => {
                const res = JSON.parse(data);
                if (res.id === id) { ws.off('message', handler); resolve(res.result); }
            };
            ws.on('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2500);
    const res = await send('Runtime.evaluate', {
        expression: `
            (() => {
                if (typeof openItemInventoryModal === 'function') openItemInventoryModal();
                const card = document.getElementById('itemInventoryModalCard');
                return { cardOpen: !!card, cardInit: !!card?._draggableInit };
            })()
        `,
        returnByValue: true
    });
    console.log('Lazy draggable init on modal open:', res.result.value);
    ws.close();
    edge.kill();
    process.exit(0);
}
run();
