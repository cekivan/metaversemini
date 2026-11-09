// scratch/verify_floating_badge.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9296;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_float_badge_' + Date.now();

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
            const res = await sendCmd('Runtime.evaluate', {
                expression: expr,
                returnByValue: true,
                awaitPromise: true
            });
            return res ? res.result ? res.result.value : undefined : undefined;
        }

        await sendCmd('Page.enable');
        await sendCmd('DOM.enable');
        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        const testUser = 'dr_float_' + Math.floor(Math.random() * 10000);
        await evalJs(`
            (function() {
                if (typeof window.switchAuthTab === 'function') window.switchAuthTab('register');
                document.getElementById('regUsernameInput').value = '${testUser}';
                document.getElementById('regPasswordInput').value = '123456';
                document.getElementById('regPasswordConfirmInput').value = '123456';
                if (typeof window.attemptRegister === 'function') window.attemptRegister();
            })()
        `);

        // Bekle 5.5 saniye
        await new Promise(r => setTimeout(r, 5800));

        // Modalı kapat
        console.log('Modal kapatılıyor, yüzen buton görünmeli...');
        await evalJs(`
            if (typeof window.closeUpdatesModal === 'function') window.closeUpdatesModal();
            window.DailyRewardClient.closeModal();
        `);

        await new Promise(r => setTimeout(r, 600));

        const badgeInfo = await evalJs(`
            (function() {
                const badge = document.getElementById('drFloatingBadge');
                return {
                    exists: !!badge,
                    display: badge ? window.getComputedStyle(badge).display : null,
                    text: badge ? badge.innerText : null
                };
            })()
        `);
        console.log('Floating Badge Durumu:', badgeInfo);

        const artifactDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        const ss = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_daily_reward_floating_badge.png'), Buffer.from(ss.data, 'base64'));
        console.log('📸 Ekran görüntüsü kaydedildi: verified_daily_reward_floating_badge.png');

        cleanup();
        process.exit(0);
    } catch (e) {
        console.error(e);
        cleanup();
        process.exit(1);
    }
}

run();

