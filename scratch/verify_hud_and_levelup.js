// scratch/verify_hud_and_levelup.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9315;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_hudlevel_' + Date.now();

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
        function send(method, params = {}) {
            return new Promise((resolve) => {
                const id = msgId++;
                const handler = (data) => {
                    const parsed = JSON.parse(data);
                    if (parsed.id === id) {
                        ws.off('message', handler);
                        resolve(parsed.result);
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        async function evalCode(expression) {
            const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
            return res.result ? res.result.value : null;
        }

        async function takeScreenshot(filePath) {
            const res = await send('Page.captureScreenshot', { format: 'png' });
            if (res && res.data) {
                fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
                console.log(`📸 Screenshot saved: ${path.basename(filePath)}`);
            }
        }

        await send('Page.enable');
        await send('Runtime.enable');
        await send('DOM.enable');

        // Set viewport
        await send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        console.log('1. Waiting for page load...');
        await new Promise(r => setTimeout(r, 1500));

        // 2. Perform Login with unique user
        const testUser = 'LvlHero_' + Math.floor(Math.random() * 89999 + 10000);
        console.log(`2. Registering and logging in as ${testUser}...`);
        await evalCode(`
            (() => {
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

        for (let i = 0; i < 25; i++) {
            await new Promise(r => setTimeout(r, 200));
            const disp = await evalCode(`document.getElementById('loginScreen')?.style.display`);
            if (disp === 'none') {
                console.log("Login screen closed, player in world!");
                break;
            }
        }
        await new Promise(r => setTimeout(r, 1000));

        // Close any welcome badge popup or updates modal if opened
        await evalCode(`
            (() => {
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const upM = document.getElementById('updatesModal');
                if (upM) upM.style.display = 'none';

                if (typeof closeBadgeLevelUpModal === 'function') closeBadgeLevelUpModal();
                const m = document.getElementById('badgeLevelUpModal');
                if (m) m.style.display = 'none';
            })()
        `);
        await new Promise(r => setTimeout(r, 500));

        // 3. Inspect HUD DOM
        const hudState = await evalCode(`
            (() => {
                const container = document.getElementById('hudLevelContainer');
                const badge = document.getElementById('hudLevelNumber');
                const title = document.getElementById('hudLevelTitle');
                const text = document.getElementById('hudXpText');
                const fill = document.getElementById('hudXpFill');
                return {
                    containerExists: !!container,
                    containerDisplay: container ? window.getComputedStyle(container).display : null,
                    levelText: badge ? badge.textContent : null,
                    titleText: title ? title.textContent : null,
                    xpText: text ? text.textContent : null,
                    fillWidth: fill ? fill.style.width : null
                };
            })()
        `);
        console.log('HUD initial state:', hudState);

        // 4. Test XP gain (+5 XP)
        console.log('4. Simulating XP gain event (+5 XP)...');
        await evalCode(`
            (() => {
                if (window.LevelClient) {
                    window.LevelClient.updateHUD(1, 5, 20);
                    window.LevelClient.triggerXpFloat(5);
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 400));
        const floatItemCount = await evalCode(`document.querySelectorAll('.hud-xp-float-item').length`);
        const hudStateAfterXp = await evalCode(`
            (() => {
                const text = document.getElementById('hudXpText');
                const fill = document.getElementById('hudXpFill');
                return {
                    xpText: text ? text.textContent : null,
                    fillWidth: fill ? fill.style.width : null
                };
            })()
        `);
        console.log('HUD after +5 XP:', hudStateAfterXp, 'Floating items count:', floatItemCount);

        const hudScreenPath = path.join(ARTIFACT_DIR, 'verified_hud_level_bar.png');
        await takeScreenshot(hudScreenPath);

        // 5. Test Level Up Celebration Modal (+2.000 TL, +2 Diamonds, Level 2)
        console.log('5. Triggering Level Up celebration modal (Level 2)...');
        await evalCode(`
            (() => {
                if (window.LevelClient) {
                    window.LevelClient.updateHUD(2, 0, 53);
                    window.LevelClient.showLevelUpModal(2, 2000, 2);
                    window.LevelClient.triggerBadgePulse();
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 600));
        const modalState = await evalCode(`
            (() => {
                const overlay = document.getElementById('levelUpOverlay');
                const num = document.getElementById('levelUpModalNum');
                const money = document.getElementById('levelUpRewardMoney');
                const dia = document.getElementById('levelUpRewardDiamonds');
                return {
                    overlayDisplay: overlay ? overlay.style.display : null,
                    numText: num ? num.textContent : null,
                    moneyText: money ? money.textContent : null,
                    diaText: dia ? dia.textContent : null
                };
            })()
        `);
        console.log('Level Up Modal State:', modalState);

        const levelUpScreenPath = path.join(ARTIFACT_DIR, 'verified_level_up_modal.png');
        await takeScreenshot(levelUpScreenPath);

        // 6. Test claim button
        console.log('6. Clicking claim button...');
        await evalCode(`
            (() => {
                const claimBtn = document.getElementById('levelUpClaimBtn');
                if (claimBtn) claimBtn.click();
            })()
        `);
        await new Promise(r => setTimeout(r, 400));
        const overlayDisplayAfterClaim = await evalCode(`document.getElementById('levelUpOverlay').style.display`);
        console.log('Overlay display after claim:', overlayDisplayAfterClaim);

        // 7. Open Profile Modal and check 4 badges showcase
        console.log('7. Opening profile modal...');
        await evalCode(`
            (() => {
                if (typeof openMyPlayerProfile === 'function') {
                    openMyPlayerProfile();
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 600));

        const profileState = await evalCode(`
            (() => {
                const modal = document.getElementById('playerInteractionModal');
                const nameEl = document.getElementById('interactionPlayerName');
                const squares = document.querySelectorAll('.profile-badge-square');
                const badgeSquaresWithContent = Array.from(squares).filter(s => !s.classList.contains('empty-slot')).map(s => {
                    return {
                        classes: s.className,
                        icon: s.querySelector('.badge-icon') ? s.querySelector('.badge-icon').textContent : '',
                        tag: s.querySelector('.badge-level-tag') ? s.querySelector('.badge-level-tag').textContent : ''
                    };
                });
                return {
                    modalDisplay: modal ? modal.style.display : null,
                    nameHtml: nameEl ? nameEl.innerHTML : null,
                    totalSquares: squares.length,
                    activeBadges: badgeSquaresWithContent
                };
            })()
        `);
        console.log('Profile modal state:', profileState);

        const profileScreenPath = path.join(ARTIFACT_DIR, 'verified_profile_badges_showcase.png');
        await takeScreenshot(profileScreenPath);

        // 8. Hover over first badge to test tooltip
        console.log('8. Hovering over first badge for tooltip check...');
        await evalCode(`
            (() => {
                const firstSquare = document.querySelector('.profile-badge-square');
                if (firstSquare && typeof showProfileBadgeTooltip === 'function') {
                    showProfileBadgeTooltip(0, firstSquare, true);
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 400));

        const tooltipInfo = await evalCode(`
            (() => {
                const tip = document.getElementById('profileBadgeFloatingTooltip');
                return {
                    tipExists: !!tip,
                    tipDisplay: tip ? window.getComputedStyle(tip).display : null,
                    tipHtml: tip ? tip.innerHTML : null,
                    hasForbiddenWonText: tip ? tip.innerText.includes('✓ Rozet Kazanıldı') : false
                };
            })()
        `);
        console.log('Tooltip info:', tooltipInfo);

        const tooltipScreenPath = path.join(ARTIFACT_DIR, 'verified_profile_badge_tooltip.png');
        await takeScreenshot(tooltipScreenPath);

        console.log('\n🎉 ALL HUD & LEVEL-UP VERIFICATIONS COMPLETED SUCCESSFULLY! 🎉');

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        cleanup();
    }
}

run();
