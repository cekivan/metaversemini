const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function testAllEPromptsRemoved() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9246;
    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        '--user-data-dir=C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_profile_no_e',
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

        await new Promise(r => setTimeout(r, 1500));

        // 1. Login as '123'
        await send('Runtime.evaluate', {
            expression: `(() => {
                window.socket.emit('login', { name: '123', pass: '123' });
            })()`
        });

        await new Promise(r => setTimeout(r, 1500));

        // Close updates modal and position player next to a bench in cadde
        await send('Runtime.evaluate', {
            expression: `(() => {
                if (typeof window.closeUpdatesModal === 'function') window.closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
                if (typeof window.changeRoom === 'function') window.changeRoom('cadde');
                if (window.players && window.myId && window.players[window.myId]) {
                    window.players[window.myId].x = 282;
                    window.players[window.myId].y = 232;
                }
            })()`
        });

        await new Promise(r => setTimeout(r, 1200));

        // Test 1: Capture Seat / Bench area
        const shot1 = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 220, y: 140, width: 200, height: 160, scale: 1 }
        });
        const out1 = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_no_e_seat.png';
        fs.writeFileSync(out1, Buffer.from(shot1.data, 'base64'));
        console.log("📸 Test 1 (Bank/Koltuk [E] Otur yok):", out1);

        // Test 2: Switch to vip_club (Dance floor & Tekinsiz Tekin)
        await send('Runtime.evaluate', {
            expression: `(() => {
                if (typeof window.changeRoom === 'function') window.changeRoom('vip_club');
                if (window.players && window.myId && window.players[window.myId]) {
                    window.players[window.myId].x = 500;
                    window.players[window.myId].y = 350; // On dance floor
                }
            })()`
        });

        await new Promise(r => setTimeout(r, 1200));

        const shot2 = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 380, y: 200, width: 240, height: 180, scale: 1 }
        });
        const out2 = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_no_e_dance.png';
        fs.writeFileSync(out2, Buffer.from(shot2.data, 'base64'));
        console.log("📸 Test 2 (Dans Pisti [E] yok):", out2);

        // Test 3: Approach Tekinsiz Tekin (x: 840, y: 290 in vip_club)
        await send('Runtime.evaluate', {
            expression: `(() => {
                if (window.players && window.myId && window.players[window.myId]) {
                    window.players[window.myId].x = 840;
                    window.players[window.myId].y = 295;
                }
            })()`
        });

        await new Promise(r => setTimeout(r, 1200));

        const shot3 = await send('Page.captureScreenshot', {
            format: 'png',
            clip: { x: 740, y: 170, width: 220, height: 190, scale: 1 }
        });
        const out3 = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_no_e_karaborsa.png';
        fs.writeFileSync(out3, Buffer.from(shot3.data, 'base64'));
        console.log("📸 Test 3 (Karaborsa Pazarı [E] yok):", out3);

        ws.close();
        cleanup();
        console.log("✅ Tüm [E] kaldırılma testleri başarıyla tamamlandı.");
    } catch (e) {
        cleanup();
        console.error("❌ Hata:", e);
        process.exit(1);
    }
}

testAllEPromptsRemoved();

