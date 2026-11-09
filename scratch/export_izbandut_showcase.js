// scratch/export_izbandut_showcase.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9288;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_showcase_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'http://localhost:3000'
    ]);

    let isDone = false;
    function cleanup() {
        if (!isDone) {
            isDone = true;
            try { edgeProc.kill('SIGKILL'); } catch (e) {}
            try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
        }
    }
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);

    try {
        await new Promise(r => setTimeout(r, 2000));
        const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
        let pageTab = listRes.find(t => t.type === 'page' && t.url.includes('localhost:3000')) || listRes.find(t => t.type === 'page');

        const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
        await new Promise((res, rej) => {
            ws.on('open', res);
            ws.on('error', rej);
        });

        let msgId = 1;
        function sendCmd(method, params = {}) {
            return new Promise((res) => {
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

        async function evalJs(expr) {
            const r = await sendCmd('Runtime.evaluate', {
                expression: expr,
                returnByValue: true,
                awaitPromise: true
            });
            if (r && r.exceptionDetails) {
                console.error('JS Exception:', r.exceptionDetails);
            }
            return (r && r.result) ? r.result.value : r;
        }

        await sendCmd('Runtime.enable');
        await sendCmd('Page.enable');
        await sendCmd('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 2500));

        await evalJs(`
            if (window.socket) {
                window.socket.emit('login', { name: '123', pass: '123' });
            }
        `);
        await new Promise(r => setTimeout(r, 2500));

        // Create an offscreen / overlay canvas and draw a high-res showcase of Izbandut
        const pngBase64 = await evalJs(`
            (function() {
                if (!window.IzbandutRenderer) return null;

                const c = document.createElement('canvas');
                c.width = 960;
                c.height = 480;
                const ctx = c.getContext('2d');

                // Gradient background (VIP luxury dark lounge theme)
                const grad = ctx.createLinearGradient(0, 0, 960, 480);
                grad.addColorStop(0, '#090d16');
                grad.addColorStop(0.5, '#0f172a');
                grad.addColorStop(1, '#020617');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 960, 480);

                // Luxury gold frame
                ctx.strokeStyle = '#eab308';
                ctx.lineWidth = 3;
                ctx.strokeRect(16, 16, 928, 448);

                ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
                ctx.lineWidth = 1;
                ctx.strokeRect(22, 22, 916, 436);

                // Title header
                ctx.fillStyle = '#facc15';
                ctx.font = 'bold 22px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('🕶️ YENİ İZBANDUT KORUMA (VIP Karakter Fedaisi)', 40, 56);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '13px sans-serif';
                ctx.fillText('Siyah Takım Elbise • Güneş Gözlüğü • Spiral Akustik Kulaklık • %10 Daha Büyük Heybetli Kaslı Yapı • 8 Yönlü İzometrik Model', 40, 80);

                const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
                const now = Date.now();

                // 1. Row: 8 Isometric Directions Showcase (Scale x1.8 for crystal clarity)
                directions.forEach((dir, idx) => {
                    let cx = 75 + idx * 108;
                    let cy = 195;

                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.scale(1.8, 1.8);
                    window.IzbandutRenderer.draw(ctx, {
                        petType: 'izbandut',
                        facing: dir,
                        isMoving: (idx % 2 === 1),
                        walkCycle: idx * 1.1,
                        slotIndex: idx % 3
                    }, 0, 0, now);
                    ctx.restore();

                    // Direction label pill
                    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
                    ctx.beginPath();
                    ctx.roundRect(cx - 40, cy + 42, 80, 20, 6);
                    ctx.fill();
                    ctx.strokeStyle = '#475569';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    ctx.fillStyle = '#e2e8f0';
                    ctx.font = 'bold 11px monospace';
                    ctx.textAlign = 'center';
                    ctx.fillText(dir, cx, cy + 56);
                });

                // 2. Section: Multi-Bodyguard 3-Escort Formation Showcase
                ctx.fillStyle = '#38bdf8';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('🛡️ 3 KORUMALI V-REFAKAT FORMASYONU (Aynı Anda En Fazla 3 Koruma Satın Alınabilir):', 40, 310);

                ctx.fillStyle = '#94a3b8';
                ctx.font = '12px sans-serif';
                ctx.fillText('Tekinsiz Tekin Karaborsa Tezgahı üzerinden 3 korumaya kadar kiralanabilir. VIP oyuncuyu arkadan ve kanatlardan sararak korur.', 40, 330);

                // Draw V-Formation (Scale x1.6)
                const vBaseX = 640;
                const vBaseY = 385;

                // Bodyguard 1 (Left flank)
                ctx.save();
                ctx.translate(vBaseX - 70, vBaseY);
                ctx.scale(1.5, 1.5);
                window.IzbandutRenderer.draw(ctx, { petType: 'izbandut', facing: 'down', slotIndex: 0 }, 0, 0, now);
                ctx.restore();

                // Bodyguard 2 (Right flank)
                ctx.save();
                ctx.translate(vBaseX + 70, vBaseY);
                ctx.scale(1.5, 1.5);
                window.IzbandutRenderer.draw(ctx, { petType: 'izbandut', facing: 'down', slotIndex: 1 }, 0, 0, now);
                ctx.restore();

                // Bodyguard 3 (Center rear guard)
                ctx.save();
                ctx.translate(vBaseX, vBaseY - 45);
                ctx.scale(1.5, 1.5);
                window.IzbandutRenderer.draw(ctx, { petType: 'izbandut', facing: 'down', slotIndex: 2 }, 0, 0, now);
                ctx.restore();

                // VIP Player Avatar Center
                ctx.save();
                ctx.translate(vBaseX, vBaseY);
                ctx.fillStyle = '#22c55e';
                ctx.beginPath();
                ctx.arc(0, 0, 18, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('VIP', 0, 0);

                // Label below player
                ctx.fillStyle = '#4ade80';
                ctx.font = 'bold 10.5px sans-serif';
                ctx.fillText('VIP Oyuncu', 0, 26);
                ctx.restore();

                // Feature Highlights List on left
                const features = [
                    '✓ %10 Daha Büyük Kaslı Silüet (Scale: 1.10)',
                    '✓ Gece Siyahı Özel Dikim Takım Elbise & Beyaz Gömlek',
                    '✓ Siyah İpek Kravat & Altın Kravat İğnesi',
                    '✓ Matrix / VIP Siyah Güneş Gözlüğü (Yansıma Efektli)',
                    '✓ Gizli Servis Şeffaf Spiral Akustik Kulaklık',
                    '✓ Dinamik Bacak & Kol Yürüme Salınımı ve Nefes Animasyonu',
                    '✓ 3 Koruma V-Formasyonlu Refakat Takibi'
                ];
                ctx.font = '12px sans-serif';
                ctx.textAlign = 'left';
                features.forEach((feat, i) => {
                    ctx.fillStyle = (i % 2 === 0) ? '#fef08a' : '#f8fafc';
                    ctx.fillText(feat, 40, 360 + i * 15);
                });

                return c.toDataURL('image/png').split(',')[1];
            })()
        `);

        if (pngBase64) {
            const buf = Buffer.from(pngBase64, 'base64');
            const outPath = path.resolve('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'verified_izbandut_showcase.png');
            fs.writeFileSync(outPath, buf);
            console.log(`Saved Izbandut Showcase: ${outPath} (${buf.length} bytes)`);
        } else {
            console.error('Failed to generate showcase canvas');
        }

    } finally {
        cleanup();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
