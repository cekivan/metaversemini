const fs = require('fs');
const http = require('http');

async function captureBotanic() {
    try {
        const edgeList = await new Promise((resolve, reject) => {
            http.get('http://127.0.0.1:9222/json', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const target = edgeList.find(t => t.url && t.url.includes('localhost:3000')) || edgeList[0];
        if (!target || !target.webSocketDebuggerUrl) {
            console.log('No webSocketDebuggerUrl found');
            return;
        }

        const WebSocket = require('ws');
        const ws = new WebSocket(target.webSocketDebuggerUrl);

        await new Promise((resolve) => ws.on('open', resolve));

        let id = 1;
        function send(method, params = {}) {
            return new Promise((resolve) => {
                const curId = id++;
                const handler = (msg) => {
                    const data = JSON.parse(msg);
                    if (data.id === curId) {
                        ws.off('message', handler);
                        resolve(data.result);
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id: curId, method, params }));
            });
        }

        console.log('Sending room change to botanic_shop...');
        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    if (typeof changeRoom === 'function') {
                        changeRoom('botanic_shop');
                    }
                })()
            `
        });

        // Wait 1.5 seconds for render
        await new Promise(r => setTimeout(r, 1500));

        const snap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/botanic_current_state.png', Buffer.from(snap.data, 'base64'));
        console.log('Screenshot saved to botanic_current_state.png');

        ws.close();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

captureBotanic();

