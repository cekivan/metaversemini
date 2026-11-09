const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function testRealWardrobeOpen() {
    console.log("Starting Edge for real wardrobe open test...");
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_wardrobe_real_' + Date.now();
    const port = 9325;

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
                console.log('[BROWSER CONSOLE]', p.params.type, p.params.args.map(a => a.value || a.description).join(' '));
            } else if (p.method === 'Runtime.exceptionThrown') {
                console.error('[BROWSER EXCEPTION]', p.params.exceptionDetails.text, p.params.exceptionDetails.exception?.description);
            }
        });

        await new Promise(r => setTimeout(r, 1000));

        // Log in with user '123'
        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const u = document.getElementById('usernameInput');
                    const p = document.getElementById('passwordInput');
                    if (u && p) {
                        u.value = '123';
                        p.value = '123';
                        attemptLogin();
                    }
                })()
            `
        });

        await new Promise(r => setTimeout(r, 2200));

        // Close updatesModal and dailyRewardModal if open
        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    if (typeof closeBetaShowcaseModal === 'function') closeBetaShowcaseModal();
                    if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                    const upModal = document.getElementById('updatesModal');
                    if (upModal) upModal.style.display = 'none';
                    const drModal = document.getElementById('dailyRewardModal');
                    if (drModal) drModal.style.display = 'none';
                })()
            `
        });

        await new Promise(r => setTimeout(r, 500));

        // Now open wardrobe
        console.log("Calling openWardrobe()...");
        const openResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    openWardrobe();
                    const canvas = document.getElementById('avatarPreviewCanvas');
                    const ctx = canvas.getContext('2d');
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let nonZero = 0;
                    for (let i = 3; i < imgData.data.length; i += 4) {
                        if (imgData.data[i] > 0) nonZero++;
                    }
                    return {
                        isWardrobeOpen: window.isWardrobeOpen,
                        previewAvatar,
                        myAvatar,
                        nonZeroPixels: nonZero
                    };
                })()
            `,
            returnByValue: true
        });

        console.log("Wardrobe Open Result:", JSON.stringify(openResult.result.value, null, 2));

        await new Promise(r => setTimeout(r, 500));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const outDir = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';
        fs.writeFileSync(path.join(outDir, 'verified_wardrobe_real_view.png'), Buffer.from(screenshot.data, 'base64'));
        console.log("Screenshot saved: verified_wardrobe_real_view.png");

        ws.close();
    } catch (e) {
        console.error("Test error:", e);
    } finally {
        proc.kill();
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
}

testRealWardrobeOpen();
