const http = require('http');
const { spawn } = require('child_process');

async function checkCorrectTarget() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_tgt_' + Date.now();
    const port = 9298;

    const proc = spawn(edgePath, [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-sync',
        `--user-data-dir=${tempUserData}`,
        'http://localhost:3000'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    http.get(`http://127.0.0.1:${port}/json/list`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', async () => {
            const targets = JSON.parse(data);
            const pageTarget = targets.find(t => t.type === 'page' && !t.url.startsWith('edge://'));
            console.log("Selected target:", { title: pageTarget?.title, url: pageTarget?.url });

            const WebSocket = require('c:\\Users\\WIN11\\Desktop\\metaversemini\\node_modules\\ws');
            const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
            await new Promise(r => ws.on('open', r));

            ws.on('message', d => {
                const msg = JSON.parse(d);
                if (msg.id === 1) {
                    console.log("Eval result on page:", msg.result?.result?.value);
                    ws.close();
                    proc.kill();
                }
            });

            ws.send(JSON.stringify({
                id: 1,
                method: 'Runtime.evaluate',
                params: {
                    expression: `({
                        hasClient: !!window.DailyRewardClient,
                        hasModal: !!document.getElementById('dailyRewardModal'),
                        hasCanvas: !!document.getElementById('dailyRewardCanvas')
                    })`,
                    returnByValue: true
                }
            }));
        });
    });
}
checkCorrectTarget();

