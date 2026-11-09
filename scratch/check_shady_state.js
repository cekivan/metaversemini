// scratch/check_shady_state.js
const { spawn } = require('child_process');
const WebSocket = require('ws');

async function test() {
    const edgeProc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
        '--remote-debugging-port=9272',
        '--headless=new',
        '--disable-gpu',
        '--user-data-dir=C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_123',
        'http://localhost:3000'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    const list = await fetch('http://127.0.0.1:9272/json/list').then(r => r.json());
    let pageTab = list.find(t => t.type === 'page' && t.url.includes('localhost:3000')) || list.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    function evalCode(code) {
        return new Promise(res => {
            const id = Math.floor(Math.random() * 99999);
            const onMsg = d => {
                const m = JSON.parse(d);
                if (m.id === id) {
                    ws.off('message', onMsg);
                    res(m.result ? m.result.result.value : m);
                }
            };
            ws.on('message', onMsg);
            ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true, awaitPromise: true } }));
        });
    }

    console.log('Logging in as 123...');
    await evalCode(`
        new Promise(res => {
            window.socket.once('loginSuccess', () => res('ok'));
            window.socket.emit('login', { name: '123', pass: '123' });
            setTimeout(res, 2000);
        })
    `);
    await new Promise(r => setTimeout(r, 1000));
    console.log('Logged in username:', await evalCode('window.myUsername'));
    console.log('Logged in myId:', await evalCode('window.myId'));

    const shopData = await evalCode(`
        new Promise(res => {
            window.socket.once('shadyShopState', s => res(s));
            window.socket.emit('getShadyShopState');
            setTimeout(() => res('timeout'), 2500);
        })
    `);

    console.log('Shady Items in server response:');
    if (typeof shopData === 'object' && shopData !== null) {
        console.log('Item keys:', Object.keys(shopData.items || {}));
        console.log('izbandut item:', shopData.items ? shopData.items.izbandut : null);
        console.log('mafya_purosu item:', shopData.items ? shopData.items.mafya_purosu : undefined);
    } else {
        console.log('Result was:', shopData);
    }

    edgeProc.kill('SIGKILL');
}
test().catch(console.error);
