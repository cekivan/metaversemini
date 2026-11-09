const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function test() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\test_k2_wardrobe_' + Date.now();
    const port = 9335;

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
        const list = await new Promise(resolve => http.get(`http://127.0.0.1:${port}/json/list`, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
        }));
        const pageTarget = list.find(t => t.type === 'page' && !t.url.startsWith('edge://'));
        const WebSocket = require('c:\\Users\\WIN11\\Desktop\\metaversemini\\node_modules\\ws');
        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
        await new Promise(r => ws.on('open', r));

        ws.on('message', d => {
            const p = JSON.parse(d);
            if (p.method === 'Runtime.consoleAPICalled') {
                console.log('[CONSOLE]', p.params.type, p.params.args.map(a => a.value || a.description).join(' '));
            } else if (p.method === 'Runtime.exceptionThrown') {
                console.error('[EXCEPTION]', p.params.exceptionDetails.text, p.params.exceptionDetails.exception?.description);
            }
        });

        let msgId = 1;
        function send(m, p = {}) {
            return new Promise(res => {
                const id = msgId++;
                const h = d => {
                    const msg = JSON.parse(d);
                    if (msg.id === id) { ws.off('message', h); res(msg.result); }
                };
                ws.on('message', h);
                ws.send(JSON.stringify({ id, method: m, params: p }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');
        await new Promise(r => setTimeout(r, 1200));

        // Close updatesModal
        await send('Runtime.evaluate', {
            expression: `
                const u = document.getElementById('updatesModal');
                if (u) u.style.display = 'none';
            `
        });

        const res = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    myAvatar = {
                        model: 'karakter_2',
                        hat: 'none',
                        hair: 'hair_k2_fade_pompadour',
                        face: 'none',
                        skinColor: '#ffd1a4',
                        shirt: 'k2_cyber_street',
                        pants: 'pants_k2_tactical_jogger',
                        shoes: 'shoes_k2_skate_pro',
                        heldItem: 'none'
                    };
                    openWardrobe();
                    const canvas = document.getElementById('avatarPreviewCanvas');
                    const ctx = canvas.getContext('2d');
                    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    let nonZero = 0;
                    for (let i = 3; i < imgData.data.length; i += 4) {
                        if (imgData.data[i] > 0) nonZero++;
                    }
                    return { nonZero, previewAvatar };
                })()
            `,
            returnByValue: true
        });
        console.log('Result for K2 in wardrobe:', JSON.stringify(res.result?.value, null, 2));

        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const outDir = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';
        fs.writeFileSync(path.join(outDir, 'verified_wardrobe_k2_view.png'), Buffer.from(screenshot.data, 'base64'));
        console.log("Screenshot saved: verified_wardrobe_k2_view.png");

        ws.close();
    } catch(e) {
        console.error("Test error:", e);
    } finally {
        proc.kill();
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
}
test();

