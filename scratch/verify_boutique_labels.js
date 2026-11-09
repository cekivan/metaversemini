const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function testBoutiqueVisual() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9245;
    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_boutique',
        'http://localhost:3000'
    ]);

    let isDone = false;
    function cleanup() {
        if (!isDone) {
            isDone = true;
            try { edgeProc.kill('SIGKILL'); } catch (e) {}
        }
    }

    try {
        await new Promise(r => setTimeout(r, 2000));
        const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
        const pageTab = listRes.find(t => t.type === 'page');
        if (!pageTab) throw new Error("CDP sayfası bulunamadı");

        const ws = new WebSocket(pageTab.webSocketDebuggerUrl);

        let id = 1;
        function send(method, params = {}) {
            return new Promise((res, rej) => {
                const curId = id++;
                const onMsg = (msg) => {
                    const data = JSON.parse(msg.toString());
                    if (data.id === curId) {
                        ws.off('message', onMsg);
                        if (data.error) rej(data.error);
                        else res(data.result);
                    }
                };
                ws.on('message', onMsg);
                ws.send(JSON.stringify({ id: curId, method, params }));
            });
        }

        await new Promise((resolve, reject) => {
            ws.on('open', resolve);
            ws.on('error', reject);
        });

        await send('Runtime.enable');
        await send('Page.enable');

        // Wait for page
        await new Promise(r => setTimeout(r, 1500));

        // Login as '123' and switch to pet_shop
        await send('Runtime.evaluate', {
            expression: `(() => {
                window.socket.emit('login', { name: '123', pass: '123' });
            })()`
        });

        await new Promise(r => setTimeout(r, 1500));

        // Switch room to pet_shop and position player near boutique
        await send('Runtime.evaluate', {
            expression: `(() => {
                if (typeof window.closeUpdatesModal === 'function') window.closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
                if (typeof window.changeRoom === 'function') {
                    window.changeRoom('pet_shop');
                } else {
                    window.socket.emit('changeRoom', { newRoom: 'pet_shop' });
                }
                if (window.players && window.myId && window.players[window.myId]) {
                    window.players[window.myId].x = 160;
                    window.players[window.myId].y = 440;
                }
            })()`
        });

        await new Promise(r => setTimeout(r, 1500));

        // Emulate mouse hover over the boutique rack (x: 145, y: 400)
        await send('Runtime.evaluate', {
            expression: `(() => {
                window.canvasMouseX = 145;
                window.canvasMouseY = 400;
            })()`
        });

        await new Promise(r => setTimeout(r, 1000));

        // Take a screenshot of the boutique area closeup
        const shot = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 20, y: 310, width: 280, height: 260, scale: 1 }
        });
        const outPath = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_boutique_labels_cleaned.png';
        fs.writeFileSync(outPath, Buffer.from(shot.data, 'base64'));
        console.log("📸 Ekran görüntüsü kaydedildi:", outPath);

        ws.close();
        cleanup();
        console.log("✅ Butik görsel testi başarıyla tamamlandı.");
    } catch (e) {
        cleanup();
        console.error("❌ Hata:", e);
        process.exit(1);
    }
}

testBoutiqueVisual();
