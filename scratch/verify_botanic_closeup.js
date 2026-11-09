const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9300;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_botanic_closeup_' + Date.now();

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
        await new Promise(r => setTimeout(r, 2500));

        const http = require('http');
        const tabs = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${cdpPort}/json`, (res) => {
                let d = '';
                res.on('data', chunk => d += chunk);
                res.on('end', () => resolve(JSON.parse(d)));
            }).on('error', reject);
        });

        const gameTab = tabs.find(t => t.url && t.url.includes('localhost:3000')) || tabs[0];
        const ws = new WebSocket(gameTab.webSocketDebuggerUrl);
        await new Promise(r => ws.on('open', r));

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

        await send('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 2000));

        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    if (window.socket) {
                        window.socket.emit('login', { name: '123', pass: '123' });
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 2000));

        await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const u = document.getElementById('updatesModal');
                    if (u) u.remove();
                    if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                    document.querySelectorAll('.modal, .game-modal, #authModal').forEach(m => m.style.display = 'none');
                    if (typeof changeRoom === 'function') {
                        changeRoom('botanic_shop');
                    }
                })()
            `
        });
        await new Promise(r => setTimeout(r, 2000));

        const zoomResult = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    try {
                        const offCanvas = document.createElement('canvas');
                        offCanvas.width = 1000;
                        offCanvas.height = 540;
                        const octx = offCanvas.getContext('2d');

                        // Dark greenhouse conservatory background
                        let grad = octx.createLinearGradient(0, 0, 1000, 540);
                        grad.addColorStop(0, '#064e3b');
                        grad.addColorStop(0.5, '#0f172a');
                        grad.addColorStop(1, '#022c22');
                        octx.fillStyle = grad;
                        octx.fillRect(0, 0, 1000, 540);

                        // Grid pattern
                        octx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                        for (let x = 0; x < 1000; x += 40) {
                            octx.beginPath(); octx.moveTo(x, 0); octx.lineTo(x, 540); octx.stroke();
                        }
                        for (let y = 0; y < 540; y += 40) {
                            octx.beginPath(); octx.moveTo(0, y); octx.lineTo(1000, y); octx.stroke();
                        }

                        // Header
                        octx.fillStyle = '#facc15';
                        octx.font = 'bold 22px sans-serif';
                        octx.textAlign = 'center';
                        octx.fillText("🌿 BOTANİK NPC STANDARDI (2.5D Semihus Aydınus & Dr. Selim Hekimoğlu)", 500, 38);

                        octx.fillStyle = '#94a3b8';
                        octx.font = '12px sans-serif';
                        octx.fillText("Geniş Hasır Şapka • Önlük • Fide • Sulama Kabı • Köstekli Saat • Papyon • Burma Bıyık • Terazi", 500, 58);

                        // Card 1: Botanikçi Defne
                        octx.fillStyle = 'rgba(15, 23, 42, 0.7)';
                        octx.beginPath();
                        octx.roundRect(40, 80, 440, 430, 16);
                        octx.fill();
                        octx.strokeStyle = '#10b981';
                        octx.lineWidth = 2;
                        octx.stroke();

                        octx.fillStyle = '#10b981';
                        octx.font = 'bold 16px sans-serif';
                        octx.fillText("🌱 BOTANİKÇİ DEFNE (Tedarikçi)", 260, 115);

                        // Draw Defne (Zoom 2.8x)
                        octx.save();
                        octx.translate(260, 310);
                        octx.scale(2.8, 2.8);
                        octx.translate(-310, -220);
                        window.drawBotanistDefneNPC(octx, 310, 220, Date.now(), null, 310, 220);
                        octx.restore();

                        // Card 2: Çiçek Tüccarı Rasim
                        octx.fillStyle = 'rgba(15, 23, 42, 0.7)';
                        octx.beginPath();
                        octx.roundRect(520, 80, 440, 430, 16);
                        octx.fill();
                        octx.strokeStyle = '#f59e0b';
                        octx.lineWidth = 2;
                        octx.stroke();

                        octx.fillStyle = '#f59e0b';
                        octx.font = 'bold 16px sans-serif';
                        octx.fillText("💐 ÇİÇEK TÜCCARI RASİM (Borsa)", 740, 115);

                        // Draw Rasim (Zoom 2.8x)
                        octx.save();
                        octx.translate(740, 310);
                        octx.scale(2.8, 2.8);
                        octx.translate(-750, -220);
                        window.drawMerchantRasimNPC(octx, 750, 220, Date.now(), null, 750, 220);
                        octx.restore();

                        return offCanvas.toDataURL('image/png').split(',')[1];
                    } catch (err) {
                        return 'ERROR: ' + err.stack;
                    }
                })()
            `
        });

        const b64 = zoomResult?.result?.value;
        if (b64 && !b64.startsWith('ERROR')) {
            fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_botanic_npcs_showcase.png', Buffer.from(b64, 'base64'));
            console.log('SUCCESS! Saved verified_botanic_npcs_showcase.png (bytes:', b64.length, ')');
        } else {
            console.error('Failed to get image data:', b64 || zoomResult);
        }

        ws.close();
    } catch (e) {
        console.error('Error:', e);
    } finally {
        cleanup();
    }
}

run();
