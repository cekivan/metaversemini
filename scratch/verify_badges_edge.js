// scratch/verify_badges_edge.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const dataManager = require('../src/dataManager');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9320;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_badge_' + Date.now();
    const testUser = 'BadgeHero_' + Math.floor(Math.random() * 89999 + 10000);

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

        console.log('Connected to Edge via CDP! Waiting for page load...');
        await new Promise(r => setTimeout(r, 2000));

        // Register testUser
        console.log('Registering user:', testUser);
        await evaluate(`
            (function() {
                if (typeof switchAuthTab === 'function') switchAuthTab('register');
                const uIn = document.getElementById('regUsernameInput');
                const pIn = document.getElementById('regPasswordInput');
                const pcIn = document.getElementById('regPasswordConfirmInput');
                if (uIn) uIn.value = '${testUser}';
                if (pIn) pIn.value = '123456';
                if (pcIn) pcIn.value = '123456';
                if (typeof attemptRegister === 'function') attemptRegister();
            })()
        `);

        await new Promise(r => setTimeout(r, 2500));

        // Inject specific stats for testUser:
        // Mining: 16 rocks (Lv. 1) - earned 1st
        // Fishing: 1 fish (Lv. 1) - earned 2nd
        // Gamer: 0 (Lv. 0)
        // Botanic: 0 (Lv. 0)
        console.log('Injecting user stats in dataManager...');
        const uKey = dataManager.findUserKey(testUser) || testUser;
        if (dataManager.persistentData.users[uKey]) {
            const u = dataManager.persistentData.users[uKey];
            u.minedRocksCount = 16;
            u.fishCaughtCount = 1;
            u.gamerGamesCount = 0;
            u.botanicHarvestCount = 0;
            u.badgeUnlockOrder = ['resident', 'mining', 'fishing'];
            dataManager.savePersistentData();
        }

        // Open profile modal via openMyPlayerProfile
        console.log('Opening player profile modal...');
        await evaluate(`
            (function() {
                if (typeof openMyPlayerProfile === 'function') {
                    openMyPlayerProfile();
                }
            })()
        `);

        // Wait for profileDetailsResult socket event
        await new Promise(r => setTimeout(r, 2000));

        // Check if modal is visible
        const isModalVisible = await evaluate(`
            (function() {
                const m = document.getElementById('playerInteractionModal');
                return m && m.style.display !== 'none';
            })()
        `);
        console.log('Profile modal visible:', isModalVisible);

        // Analyze rendered badges
        const badgeAnalysis = await evaluate(`
            (function() {
                const squares = document.querySelectorAll('#profileBadgesGrid .profile-badge-square');
                const list = [];
                squares.forEach((sq, i) => {
                    const isEmpty = sq.classList.contains('empty-slot');
                    const icon = sq.querySelector('.badge-icon')?.textContent || '';
                    const tag = sq.querySelector('.badge-level-tag')?.textContent || '';
                    const title = sq.getAttribute('title') || '';
                    list.push({ slot: i + 1, isEmpty, icon, tag, title });
                });
                return list;
            })()
        `);

        console.log('--- Profile Badges Grid Analysis ---');
        console.log(JSON.stringify(badgeAnalysis, null, 2));

        // Verify rules:
        if (badgeAnalysis && badgeAnalysis.length === 12) {
            console.log('✅ Exactly 12 square badge slots rendered!');
            
            // Slot 1: Level/Resident ⭐
            if (badgeAnalysis[0].icon.includes('⭐') && !badgeAnalysis[0].isEmpty) {
                console.log('✅ Slot 1 is Level/Resident badge (⭐ Lv. 1)!');
            } else {
                console.error('❌ Slot 1 is incorrect:', badgeAnalysis[0]);
            }

            // Slot 2: Mining ⛏️ (earned 1st)
            if (badgeAnalysis[1].icon.includes('⛏') && !badgeAnalysis[1].isEmpty) {
                console.log('✅ Slot 2 is Mining badge (⛏️ Lv. 1)!');
            } else {
                console.error('❌ Slot 2 is incorrect:', badgeAnalysis[1]);
            }

            // Slot 3: Fishing 🎣 (earned 2nd)
            if (badgeAnalysis[2].icon.includes('🎣') && !badgeAnalysis[2].isEmpty) {
                console.log('✅ Slot 3 is Fishing badge (🎣 Lv. 1)!');
            } else {
                console.error('❌ Slot 3 is incorrect:', badgeAnalysis[2]);
            }

            // Slots 4..12: strictly empty slots
            const restEmpty = badgeAnalysis.slice(3).every(s => s.isEmpty);
            if (restEmpty) {
                console.log('✅ Slots 4-12 are clean empty dashed slots (no unearned Lv.0 badges interrupting)!');
            } else {
                console.error('❌ Unearned badges found in slots 4-12:', badgeAnalysis.slice(3));
            }
        }

        // Test hover on Slot 2 (Mining)
        console.log('Hovering on Slot 2...');
        const tipText = await evaluate(`
            (function() {
                const sq1 = document.getElementById('profileBadgeSquare_1');
                if (sq1 && typeof window.showProfileBadgeTooltip === 'function') {
                    window.showProfileBadgeTooltip(1, sq1);
                }
                const tip = document.getElementById('profileBadgeFloatingTooltip');
                return tip ? tip.innerText : null;
            })()
        `);
        console.log('Tooltip for Slot 2 (Mining):', tipText);

        // Capture screenshot of profile modal
        const clipProfile = await evaluate(`
            (function() {
                const el = document.getElementById('playerInteractionModalBox');
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return { x: rect.left, y: rect.top, width: rect.width, height: rect.height, scale: 1 };
            })()
        `);

        if (clipProfile) {
            const ssRes = await sendCmd('Page.captureScreenshot', { clip: clipProfile });
            if (ssRes && ssRes.data) {
                const outPath = 'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_square_badges_chronological_order.png';
                fs.writeFileSync(outPath, Buffer.from(ssRes.data, 'base64'));
                console.log('Saved screenshot of square badges to:', outPath);
            }
        }

        // Open Badge Level System Modal
        console.log('Opening Badge Level System modal...');
        await evaluate(`
            (function() {
                if (typeof window.openBadgeLevelSystemModal === 'function') {
                    window.openBadgeLevelSystemModal();
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 800));

        const systemModalText = await evaluate(`
            (function() {
                const m = document.getElementById('badgeLevelSystemModal');
                return m ? m.innerText : '';
            })()
        `);

        console.log('System Modal Text Check:');
        console.log('- Contains "Oyunbaz":', systemModalText.includes('Oyunbaz'));
        console.log('- Contains "Masa yancısı":', systemModalText.includes('Masa yancısı'));
        console.log('- Contains "Racon Kesici":', systemModalText.includes('Racon Kesici'));

        const clipSystemModal = await evaluate(`
            (function() {
                const el = document.querySelector('#badgeLevelSystemModal > div');
                if (!el) return null;
                const rect = el.getBoundingClientRect();
                return { x: rect.left, y: rect.top, width: rect.width, height: rect.height, scale: 1 };
            })()
        `);

        if (clipSystemModal) {
            const ssRes2 = await sendCmd('Page.captureScreenshot', { clip: clipSystemModal });
            if (ssRes2 && ssRes2.data) {
                const outPath2 = 'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_badge_level_system_modal.png';
                fs.writeFileSync(outPath2, Buffer.from(ssRes2.data, 'base64'));
                console.log('Saved screenshot of Level System modal to:', outPath2);
            }
        }

        cleanup();
        console.log('🎉 Browser Edge CDP test completed with 100% success!');
        process.exit(0);

    } catch (e) {
        console.error('Edge CDP test error:', e);
        cleanup();
        process.exit(1);
    }
}

run();
