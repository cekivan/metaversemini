// scratch/verify_freeze_ui.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9297;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_freeze_ui_' + Date.now();

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
            if (res && res.exceptionDetails) {
                console.error('JS Exception:', res.exceptionDetails);
            }
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

        const artifactDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";

        console.log('0. DailyRewardClient yüklenmesi bekleniyor...');
        await evalJs(`
            new Promise((res) => {
                const iv = setInterval(() => {
                    if (window.DailyRewardClient && window.socket) {
                        clearInterval(iv);
                        res();
                    }
                }, 100);
            })
        `);

        // 1. Can Simidi Teklif Ekranı (1 veya 2 gün kaçırılmış)
        console.log('1. Can Simidi UI test ediliyor...');
        await evalJs(`
            (function() {
                const rewards = [];
                for (let i = 1; i <= 30; i++) {
                    rewards.push({
                        day: i,
                        money: i * 500,
                        diamonds: i * 1,
                        isMilestone: (i === 7 || i === 14 || i === 21 || i === 30)
                    });
                }
                const mockStatus = {
                    canClaim: true,
                    isStreakBroken: true,
                    canFreeze: true,
                    freezeCost: 10,
                    nextDay: 18,
                    currentDay: 17,
                    missedDays: 1,
                    freezesUsed: 0,
                    hardReset: false,
                    rewards: rewards
                };
                window.DailyRewardClient.openModal();
                window.DailyRewardClient.renderModal(mockStatus);
            })()
        `);
        await new Promise(r => setTimeout(r, 600));
        const ss1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_daily_reward_freeze_offer.png'), Buffer.from(ss1.data, 'base64'));
        console.log('📸 Ekran görüntüsü kaydedildi: verified_daily_reward_freeze_offer.png');

        // 2. Hak Yandı Ekranı (3 gün girmedi -> hardReset)
        console.log('2. Hak Yandı UI test ediliyor...');
        await evalJs(`
            (function() {
                const rewards = [];
                for (let i = 1; i <= 30; i++) {
                    rewards.push({
                        day: i,
                        money: i * 500,
                        diamonds: i * 1,
                        isMilestone: (i === 7 || i === 14 || i === 21 || i === 30)
                    });
                }
                const mockStatus = {
                    canClaim: true,
                    isStreakBroken: true,
                    canFreeze: false,
                    freezeCost: 0,
                    nextDay: 1,
                    currentDay: 22,
                    missedDays: 3,
                    freezesUsed: 0,
                    hardReset: true,
                    rewards: rewards
                };
                window.DailyRewardClient.openModal();
                window.DailyRewardClient.renderModal(mockStatus);
            })()
        `);
        await new Promise(r => setTimeout(r, 600));
        const ss2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_daily_reward_hard_reset.png'), Buffer.from(ss2.data, 'base64'));
        console.log('📸 Ekran görüntüsü kaydedildi: verified_daily_reward_hard_reset.png');

        cleanup();
        process.exit(0);
    } catch (e) {
        console.error(e);
        cleanup();
        process.exit(1);
    }
}

run();
