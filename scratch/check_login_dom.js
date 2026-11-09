const { spawn } = require('child_process');
const WebSocket = require('ws');

async function test() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const cdpPort = 9322;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_diag_' + Date.now();
    const p = spawn(edgePath, [
        '--remote-debugging-port=' + cdpPort,
        '--headless=new',
        '--user-data-dir=' + tempProfile,
        'http://localhost:3000'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    const tabs = await fetch('http://127.0.0.1:' + cdpPort + '/json/list').then(r => r.json());
    const tab = tabs.find(t => t.url.includes('localhost:3000'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    function send(m, params = {}) {
        return new Promise(res => {
            const curId = id++;
            const h = (d) => {
                const parsed = JSON.parse(d);
                if (parsed.id === curId) { ws.off('message', h); res(parsed.result); }
            };
            ws.on('message', h);
            ws.send(JSON.stringify({ id: curId, method: m, params }));
        });
    }

    const res = await send('Runtime.evaluate', {
        expression: `(() => {
            return {
                inputs: Array.from(document.querySelectorAll("#loginScreen input")).map(i => ({id: i.id, type: i.type, placeholder: i.placeholder})),
                buttons: Array.from(document.querySelectorAll("#loginScreen button")).map(b => ({id: b.id, text: b.innerText, onclick: b.getAttribute('onclick')}))
            };
        })()`,
        returnByValue: true
    });
    console.log('Login screen elements:', JSON.stringify(res.result.value, null, 2));
    p.kill('SIGKILL');
}
test();

