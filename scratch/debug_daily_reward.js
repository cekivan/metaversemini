const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

async function testDailyClient() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_debug_' + Date.now();
    const port = 9290;

    const proc = spawn(edgePath, [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempUserData}`,
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1500));

    try {
        const listData = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${port}/json/list`, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const WebSocket = require('c:\\Users\\WIN11\\Desktop\\metaversemini\\node_modules\\ws');
        const ws = new WebSocket(listData[0].webSocketDebuggerUrl);
        await new Promise(r => ws.on('open', r));

        let msgId = 1;
        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = msgId++;
                const handler = (data) => {
                    const parsed = JSON.parse(data);
                    if (parsed.id === id) {
                        ws.off('message', handler);
                        if (parsed.error) reject(parsed.error);
                        else resolve(parsed.result);
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');
        await send('Log.enable');

        ws.on('message', (d) => {
            const p = JSON.parse(d);
            if (p.method === 'Runtime.consoleAPICalled') {
                console.log('[BROWSER CONSOLE]', p.params.type, p.params.args.map(a => a.value || a.description).join(' '));
            } else if (p.method === 'Runtime.exceptionThrown') {
                console.error('[BROWSER EXCEPTION]', p.params.exceptionDetails.text, p.params.exceptionDetails.exception?.description);
            }
        });

        console.log("Navigating to http://localhost:3000...");
        await send('Page.navigate', { url: 'http://localhost:3000' });

        await new Promise(r => setTimeout(r, 4000));

        const res = await send('Runtime.evaluate', {
            expression: `
                ({
                    hasClient: !!window.DailyRewardClient,
                    clientKeys: window.DailyRewardClient ? Object.keys(window.DailyRewardClient) : [],
                    hasCanvas: !!document.getElementById('dailyRewardCanvas'),
                    hasModal: !!document.getElementById('dailyRewardModal')
                })
            `,
            returnByValue: true
        });

        console.log("Check result:", res.result.value);
        ws.close();
    } catch (e) {
        console.error("Error:", e);
    } finally {
        proc.kill();
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
}

testDailyClient();

