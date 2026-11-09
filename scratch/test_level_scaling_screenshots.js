// scratch/test_level_scaling_screenshots.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9332;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_level_scale_' + Date.now();

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

        async function evaluate(expr) {
            const res = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
            return res && res.result ? res.result.value : null;
        }

        await new Promise(r => setTimeout(r, 2000));

        // Test 1: Level 14
        console.log('Testing Level 14...');
        await evaluate(`
            (function() {
                const modal = document.getElementById('playerInteractionModal');
                if (modal) modal.style.display = 'flex';
                
                window.renderProfileSquareBadges({
                    level: 14,
                    totalXP: 1200,
                    currentProgress: 180,
                    targetXP: 250,
                    minedRocksCount: 45,
                    fishCaughtCount: 30,
                    gamerGamesCount: 15,
                    botanicHarvestCount: 0,
                    badgeUnlockOrder: ['resident', 'gamer', 'fishing', 'mining']
                }, true);
            })()
        `);

        await new Promise(r => setTimeout(r, 600));
        const ss14 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_profile_level_14.png', Buffer.from(ss14.data, 'base64'));

        // Test 2: Level 100 (Max Tier)
        console.log('Testing Level 100 (Max Tier)...');
        await evaluate(`
            (function() {
                window.renderProfileSquareBadges({
                    level: 100,
                    totalXP: 999999,
                    currentProgress: 999999,
                    targetXP: 999999,
                    minedRocksCount: 10000,
                    fishCaughtCount: 50000,
                    gamerGamesCount: 1500,
                    botanicHarvestCount: 3500,
                    badgeUnlockOrder: ['resident', 'gamer', 'fishing', 'mining', 'botanic']
                }, true);
            })()
        `);

        await new Promise(r => setTimeout(r, 600));
        const ss100 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_profile_level_100.png', Buffer.from(ss100.data, 'base64'));

        ws.close();
        cleanup();
        console.log('Scale tests completed!');
    } catch (err) {
        console.error(err);
        cleanup();
        process.exit(1);
    }
}

run();

