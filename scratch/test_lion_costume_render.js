const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const port = 9271;
    console.log('Spawning headless Edge on port ' + port + '...');
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const edge = spawn(edgePath, [
        `--remote-debugging-port=${port}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        'http://localhost:3000'
    ]);

    let wsUrl = null;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        try {
            const data = await new Promise((resolve, reject) => {
                http.get(`http://127.0.0.1:${port}/json`, (res) => {
                    let body = '';
                    res.on('data', c => body += c);
                    res.on('end', () => resolve(body));
                }).on('error', reject);
            });
            const targets = JSON.parse(data);
            const page = targets.find(t => t.type === 'page' && t.url.includes('localhost:3000'));
            if (page) {
                wsUrl = page.webSocketDebuggerUrl;
                break;
            }
        } catch (_) {}
    }

    if (!wsUrl) {
        console.error('Edge WS URL not found');
        edge.kill();
        process.exit(1);
    }

    const ws = new WebSocket(wsUrl);
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

    ws.on('open', async () => {
        console.log('Connected! Reloading page to ensure fresh lionCostume.js cache...');
        await send('Page.reload', { ignoreCache: true });
        await new Promise(r => setTimeout(r, 2000));

        const res = await send('Runtime.evaluate', {
            expression: `(() => {
                const mod = window.__animalCostumeModules && window.__animalCostumeModules['costume_lion'];
                if (!mod) return { error: 'costume_lion module not found in __animalCostumeModules' };

                const renderer = window.AnimalCostumeRenderer;
                if (!renderer) return { error: 'AnimalCostumeRenderer not found' };

                const registered = renderer.isCostume('costume_lion');

                const cvs = document.createElement('canvas');
                cvs.width = 900;
                cvs.height = 360;
                const ctx = cvs.getContext('2d');
                ctx.fillStyle = '#0f172a';
                ctx.fillRect(0, 0, cvs.width, cvs.height);

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 16px sans-serif';
                ctx.fillText('🦁 Savana Kralı Aslan - 2.5D İzometrik 8 Yönlü Showcase (Doğrulanmış Canlı Modül)', 20, 30);

                const dirs = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
                const p = { costume: 'costume_lion' };

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '13px sans-serif';
                ctx.fillText('Hareket / Yürüyüş Modu (8 Yön):', 20, 60);

                dirs.forEach((dir, i) => {
                    ctx.save();
                    const x = 60 + i * 105;
                    const y = 145;
                    renderer.draw(ctx, x, y, p, dir, false, true, i * 0.9, false);
                    ctx.fillStyle = '#94a3b8';
                    ctx.font = '11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(dir, x, y + 36);
                    ctx.restore();
                });

                ctx.fillStyle = '#cbd5e1';
                ctx.font = '13px sans-serif';
                ctx.fillText('Dinlenme / Oturma Modu (Sfinks & Koltuk Standartları):', 20, 220);

                const sitDirs = ['down', 'down-right', 'right', 'up-right', 'up'];
                sitDirs.forEach((dir, i) => {
                    ctx.save();
                    const x = 90 + i * 170;
                    const y = 295;
                    renderer.draw(ctx, x, y, p, dir, true, false, 0, false);
                    ctx.fillStyle = '#fde047';
                    ctx.font = 'bold 11px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('Oturma: ' + dir, x, y + 36);
                    ctx.restore();
                });

                return {
                    registered,
                    hasMod: true,
                    nameTagOffset: renderer.getNameTagOffset('costume_lion'),
                    dataUrl: cvs.toDataURL('image/png')
                };
            })()`,
            returnByValue: true
        });

        console.log('Result:', res && res.result && res.result.value && {
            registered: res.result.value.registered,
            nameTagOffset: res.result.value.nameTagOffset
        });

        if (res && res.result && res.result.value && res.result.value.dataUrl) {
            const base64Data = res.result.value.dataUrl.replace(/^data:image\/png;base64,/, "");
            const outPath = path.join('C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'verified_lion_costume_showcase.png');
            fs.writeFileSync(outPath, base64Data, 'base64');
            console.log('Saved showcase artifact to:', outPath);
        }

        ws.close();
        edge.kill();
        process.exit(0);
    });
}

run().catch(e => { console.error(e); process.exit(1); });
