const http = require('http');
const { spawn } = require('child_process');

async function checkTargets() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_targets_' + Date.now();
    const port = 9295;

    const proc = spawn(edgePath, [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempUserData}`,
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1500));

    http.get(`http://127.0.0.1:${port}/json/list`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const targets = JSON.parse(data);
            console.log("Targets found:", targets.map(t => ({ type: t.type, title: t.title, url: t.url, ws: t.webSocketDebuggerUrl })));
            proc.kill();
        });
    });
}
checkTargets();

