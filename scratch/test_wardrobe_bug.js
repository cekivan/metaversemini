const http = require('http');
const { spawn } = require('child_process');

async function testWardrobeFirstOpen() {
    console.log("Testing wardrobe first open bug...");
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_wardrobe_test_' + Date.now();
    const port = 9310;

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

    await new Promise(r => setTimeout(r, 2200));

    try {
        const listData = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${port}/json/list`, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const pageTarget = listData.find(t => t.type === 'page' && !t.url.startsWith('edge://'));
        const WebSocket = require('c:\\Users\\WIN11\\Desktop\\metaversemini\\node_modules\\ws');
        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
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

        ws.on('message', d => {
            const p = JSON.parse(d);
            if (p.method === 'Runtime.consoleAPICalled') {
                console.log('[CONSOLE]', p.params.type, p.params.args.map(a => a.value || a.description).join(' '));
            } else if (p.method === 'Runtime.exceptionThrown') {
                console.error('[EXCEPTION]', p.params.exceptionDetails.text, p.params.exceptionDetails.exception?.description);
            }
        });

        await new Promise(r => setTimeout(r, 1000));

        // Attempt to call openWardrobe() for the first time
        console.log("Calling openWardrobe()...");
        const openRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    try {
                        if (typeof openWardrobe === 'function') {
                            openWardrobe();
                        } else if (typeof window.openWardrobe === 'function') {
                            window.openWardrobe();
                        }
                        const canvas = document.getElementById('avatarPreviewCanvas');
                        const ctx = canvas ? canvas.getContext('2d') : null;
                        let nonZeroPixels = 0;
                        if (ctx) {
                            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            for (let i = 3; i < imgData.data.length; i += 4) {
                                if (imgData.data[i] > 0) nonZeroPixels++;
                            }
                        }
                        return {
                            isWardrobeOpen: typeof isWardrobeOpen !== 'undefined' ? isWardrobeOpen : null,
                            windowIsWardrobeOpen: window.isWardrobeOpen,
                            hasPreviewAvatar: typeof previewAvatar !== 'undefined' && !!previewAvatar,
                            previewAvatar: typeof previewAvatar !== 'undefined' ? previewAvatar : null,
                            myAvatar: typeof myAvatar !== 'undefined' ? myAvatar : null,
                            hasCanvas: !!canvas,
                            canvasW: canvas?.width,
                            canvasH: canvas?.height,
                            nonZeroPixels
                        };
                    } catch(err) {
                        return { error: err.message, stack: err.stack };
                    }
                })()
            `,
            returnByValue: true
        });

        console.log("Open Wardrobe Result:", JSON.stringify(openRes.result.value, null, 2));

        ws.close();
    } catch (e) {
        console.error("Test error:", e);
    } finally {
        proc.kill();
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
}

testWardrobeFirstOpen();

