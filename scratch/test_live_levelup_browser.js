// scratch/test_live_levelup_browser.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function testLevelUp() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const cdpPort = 9365;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_lvl_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'http://localhost:3000'
    ]);

    function cleanup() {
        try { edgeProc.kill('SIGKILL'); } catch (e) {}
        try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
    }
    process.on('exit', cleanup);

    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
    let pageTab = listRes.find(t => t.type === 'page' && t.url.includes('localhost:3000')) || listRes[0];
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(res => ws.on('open', res));

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

    await new Promise(r => setTimeout(r, 1500));

    // Register user
    const testUser = 'levelup_tester_' + Math.floor(Math.random() * 90000 + 10000);
    console.log('Registering user:', testUser);
    const regRes = await evaluate(`
        new Promise((resolve) => {
            window.socket.emit('register', { name: '${testUser}', pass: '123456', gender: 'male' });
            window.socket.once('loginSuccess', (d) => resolve({ ok: true, d }));
            setTimeout(() => resolve({ ok: false }), 4000);
        })
    `);
    console.log('Registered successfully:', regRes.ok);

    await new Promise(r => setTimeout(r, 1000));

    // Initial HUD check
    const hudInitial = await evaluate(`
        ({
            badge: document.getElementById('hudLevelNumber')?.textContent,
            xpText: document.getElementById('hudXpText')?.textContent,
            fillWidth: document.getElementById('hudXpFill')?.style.width
        })
    `);
    console.log('Initial HUD:', hudInitial);

    // Simulate gaining 10 XP
    console.log('Simulating +10 XP gained...');
    await evaluate(`
        window.socket.emit('test_dev_add_xp', 10);
    `);
    // Or trigger via client LevelClient event
    await evaluate(`
        (function() {
            // Trigger socket event on client to test HUD and profile live updating
            window.LevelClient.updateHUD(1, 10, 20);
            if (typeof window.updateProfileBadgesLive === 'function') {
                window.updateProfileBadgesLive({ currentLevel: 1, currentProgress: 10, targetXP: 20 });
            }
        })()
    `);

    const hudMid = await evaluate(`
        ({
            badge: document.getElementById('hudLevelNumber')?.textContent,
            xpText: document.getElementById('hudXpText')?.textContent,
            fillWidth: document.getElementById('hudXpFill')?.style.width
        })
    `);
    console.log('HUD after +10 XP (50% progress):', hudMid);

    // Simulate leveling up to Level 2
    console.log('Simulating Level Up to Level 2 (20/20 XP)...');
    await evaluate(`
        (function() {
            window.LevelClient.showLevelUpModal(2, 2000, 2);
            window.LevelClient.updateHUD(2, 0, 26);
            if (typeof window.updateProfileBadgesLive === 'function') {
                window.updateProfileBadgesLive({ currentLevel: 2, currentProgress: 0, targetXP: 26 });
            }
        })()
    `);

    const levelUpModalStatus = await evaluate(`
        (function() {
            const overlay = document.getElementById('levelUpOverlay');
            return {
                visible: overlay && overlay.style.display !== 'none',
                modalNum: document.getElementById('levelUpModalNum')?.textContent,
                rewardMoney: document.getElementById('levelUpRewardMoney')?.textContent,
                rewardDiamonds: document.getElementById('levelUpRewardDiamonds')?.textContent,
                hudBadgeNow: document.getElementById('hudLevelNumber')?.textContent
            };
        })()
    `);
    console.log('Level Up Celebration Modal Status:', levelUpModalStatus);

    cleanup();
}

testLevelUp().catch(console.error);

