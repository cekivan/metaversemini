// scratch/diag_edge.js
const { spawn } = require('child_process');
const WebSocket = require('ws');

async function test() {
    const edgeProc = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
        '--remote-debugging-port=9262',
        '--headless=new',
        '--disable-gpu',
        '--user-data-dir=C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_diag',
        'http://localhost:3000'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    const list = await fetch('http://127.0.0.1:9262/json/list').then(r => r.json());
    const tab = list.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
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
            ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression: code, returnByValue: true } }));
        });
    }

    console.log('Page URL:', await evalCode('location.href'));
    console.log('Socket available?', await evalCode('typeof window.socket'));
    console.log('Logging in as 123...');
    await evalCode("window.socket.emit('login', { name: '123', pass: '123' })");
    await new Promise(r => setTimeout(r, 2500));
    console.log('Current room:', await evalCode('window.currentRoom'));
    console.log('IzbandutRenderer:', await evalCode('typeof window.IzbandutRenderer'));
    console.log('handleFarmPlotDirectClick:', await evalCode('typeof window.handleFarmPlotDirectClick'));

    edgeProc.kill('SIGKILL');
}
test().catch(console.error);

