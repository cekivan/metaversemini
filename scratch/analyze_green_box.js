const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9229;

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
        'about:blank'
    ]);

    await sleep(2000);

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

    const imgPath = 'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.user_uploaded/media_1794156406030_cab3d507.jpg';
    const base64 = fs.readFileSync(imgPath).toString('base64');

    const res = await send('Runtime.evaluate', {
        expression: `
            new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Find green pixels
                    const greenPixels = [];
                    for (let y = 0; y < canvas.height; y++) {
                        for (let x = 0; x < canvas.width; x++) {
                            const idx = (y * canvas.width + x) * 4;
                            const r = imgData.data[idx];
                            const g = imgData.data[idx + 1];
                            const b = imgData.data[idx + 2];
                            // Green detection (vibrant green)
                            if (g > 150 && g > r * 1.4 && g > b * 1.4) {
                                greenPixels.push({ x, y, r, g, b });
                            }
                        }
                    }
                    
                    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
                    for (const p of greenPixels) {
                        if (p.x < minX) minX = p.x;
                        if (p.x > maxX) maxX = p.x;
                        if (p.y < minY) minY = p.y;
                        if (p.y > maxY) maxY = p.y;
                    }

                    resolve({
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        greenCount: greenPixels.length,
                        sample: greenPixels.slice(0, 5),
                        bounds: { minX, maxX, minY, maxY }
                    });
                };
                img.src = 'data:image/jpeg;base64,${base64}';
            })
        `,
        awaitPromise: true,
        returnByValue: true
    });

    console.log('Analysis result:', JSON.stringify(res, null, 2));

    ws.close();
    edge.kill();
    process.exit(0);
}

run();
