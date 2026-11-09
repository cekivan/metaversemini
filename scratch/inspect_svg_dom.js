// scratch/inspect_svg_dom.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function test() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const cdpPort = 9294;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_inspect_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'http://localhost:3000/test_adventure_map.html'
    ]);

    await new Promise(r => setTimeout(r, 2000));
    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
    const pageTab = listRes.find(t => t.type === 'page');
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(res => ws.on('open', res));

    let msgId = 1;
    function sendCmd(method, params = {}) {
        return new Promise(res => {
            const id = msgId++;
            const handler = (data) => {
                const parsed = JSON.parse(data);
                if (parsed.id === id) {
                    ws.off('message', handler);
                    res(parsed.result);
                }
            };
            ws.on('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    const res = await sendCmd('Runtime.evaluate', {
        expression: 'document.getElementById("drAvatarPawnGroup").outerHTML',
        returnByValue: true
    });
    console.log('drAvatarPawnGroup outerHTML:');
    console.log(res.result.value);

    edgeProc.kill('SIGKILL');
    fs.rmSync(tempProfile, { recursive: true, force: true });
}
test();

