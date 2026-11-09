// scratch/test_live_huge_level_badge.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9331;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_level_' + Date.now();

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

        console.log('Connected to Edge CDP! Waiting for page load...');
        await new Promise(r => setTimeout(r, 2000));

        // Open profile modal with active stats:
        // Level 1 with 16 / 20 XP (%80), Mined 16 rocks, Fish 1, badgeUnlockOrder: ['resident', 'mining', 'fish']
        console.log('Rendering profile with Level 1 (16/20 XP), Mining 16, Fish 1...');
        await evaluate(`
            (function() {
                const modal = document.getElementById('playerInteractionModal');
                if (modal) modal.style.display = 'flex';
                
                window.renderProfileSquareBadges({
                    level: 1,
                    totalXP: 16,
                    currentProgress: 16,
                    targetXP: 20,
                    minedRocksCount: 16,
                    fishCaughtCount: 1,
                    gamerGamesCount: 0,
                    botanicHarvestCount: 0,
                    badgeUnlockOrder: ['resident', 'mining', 'fish']
                }, true);
            })()
        `);

        await new Promise(r => setTimeout(r, 800));

        // Inspect Slot 1 in DOM
        const slot1Info = await evaluate(`
            (function() {
                const sq0 = document.getElementById('profileBadgeSquare_0');
                if (!sq0) return { error: 'profileBadgeSquare_0 not found' };
                const isLevelSlot = sq0.classList.contains('profile-level-badge-slot');
                const hugeNumberEl = sq0.querySelector('.badge-huge-level-number');
                const levelTagEl = sq0.querySelector('.badge-level-tag');
                const iconEl = sq0.querySelector('.badge-icon');
                return {
                    isLevelSlot,
                    hugeNumberText: hugeNumberEl ? hugeNumberEl.textContent : null,
                    hasLevelTag: !!levelTagEl,
                    hasIcon: !!iconEl,
                    className: sq0.className
                };
            })()
        `);
        console.log('Slot 1 Inspection:', slot1Info);

        // Take screenshot of the profile modal
        const ss1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_profile_huge_level_number.png', Buffer.from(ss1.data, 'base64'));
        console.log('Saved screenshot: verified_profile_huge_level_number.png');

        // Trigger hover on Slot 1 to display tooltip
        console.log('Triggering hover on Slot 1 (profileBadgeSquare_0)...');
        await evaluate(`
            (function() {
                const sq0 = document.getElementById('profileBadgeSquare_0');
                if (sq0 && typeof window.showProfileBadgeTooltip === 'function') {
                    window.showProfileBadgeTooltip(0, sq0, true);
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 500));

        const tooltipInfo = await evaluate(`
            (function() {
                const tip = document.getElementById('profileBadgeFloatingTooltip');
                if (!tip) return { error: 'tooltip not found' };
                return {
                    display: tip.style.display,
                    innerText: tip.innerText
                };
            })()
        `);
        console.log('Tooltip Info on Slot 1:', tooltipInfo);

        // Take screenshot of the tooltip on Slot 1
        const ss2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_profile_huge_level_tooltip.png', Buffer.from(ss2.data, 'base64'));
        console.log('Saved screenshot: verified_profile_huge_level_tooltip.png');

        // Test Live Update: player gains 4 XP and reaches Level 2
        console.log('Testing live XP gain and level up to Level 2...');
        await evaluate(`
            (function() {
                if (typeof window.updateProfileBadgesLive === 'function') {
                    window.updateProfileBadgesLive({
                        currentLevel: 2,
                        currentProgress: 5,
                        targetXP: 25
                    });
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 500));
        const liveSlot1 = await evaluate(`
            (function() {
                const sq0 = document.getElementById('profileBadgeSquare_0');
                const hugeNumberEl = sq0?.querySelector('.badge-huge-level-number');
                return {
                    hugeNumberText: hugeNumberEl ? hugeNumberEl.textContent : null
                };
            })()
        `);
        console.log('Live Update Result for Slot 1:', liveSlot1);

        ws.close();
        cleanup();
        console.log('All live tests completed successfully!');
    } catch (err) {
        console.error('Test error:', err);
        cleanup();
        process.exit(1);
    }
}

run();

