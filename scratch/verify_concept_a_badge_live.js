// scratch/verify_concept_a_badge_live.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9299;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_concept_a_live_' + Date.now();

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
            const r = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
            return r?.result?.value;
        }

        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 820,
            deviceScaleFactor: 1,
            mobile: false
        });

        const testUsername = 'test_' + Math.floor(1000 + Math.random() * 9000);
        console.log("Registering test user: " + testUsername);

        await evalJs(`
            (function() {
                if (typeof switchAuthTab === 'function') switchAuthTab('register');
                const regU = document.getElementById('regUsernameInput');
                const regP = document.getElementById('regPasswordInput');
                const regPC = document.getElementById('regPasswordConfirmInput');
                if (regU) regU.value = '${testUsername}';
                if (regP) regP.value = 'Password123!';
                if (regPC) regPC.value = 'Password123!';
                if (typeof attemptRegister === 'function') attemptRegister();
            })()
        `);

        await new Promise(r => setTimeout(r, 2000));

        // Dismiss updates
        await evalJs(`
            (function() {
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
            })()
        `);
        await new Promise(r => setTimeout(r, 300));

        // 1. Open own profile (Lv 1 - Çaylak)
        console.log("Opening own profile (Lv 1)...");
        await evalJs(`
            (function() {
                const btn = document.getElementById('myProfileNavBtn');
                if (btn) btn.click();
            })()
        `);
        await new Promise(r => setTimeout(r, 1200));

        const lv1SlotInfo = await evalJs(`
            (function() {
                const slot0 = document.getElementById('profileBadgeSquare_0');
                const svg = slot0 ? slot0.querySelector('svg') : null;
                const tip = document.getElementById('profileBadgeFloatingTooltip');
                // Trigger hover
                if (slot0 && typeof showProfileBadgeTooltip === 'function') {
                    showProfileBadgeTooltip(0, slot0, true);
                }
                const tipEl = document.getElementById('profileBadgeFloatingTooltip');
                return {
                    slotClasses: slot0 ? slot0.className : null,
                    hasSvg: !!svg,
                    svgClass: svg ? svg.getAttribute('class') : null,
                    tooltipText: tipEl ? tipEl.innerText.trim() : null,
                    tooltipHtml: tipEl ? tipEl.innerHTML : null
                };
            })()
        `);
        console.log("Level 1 Slot Info:", lv1SlotInfo);

        // Screenshot Lv 1 profile
        const shot1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_concept_a_profile_lv1.png',
            Buffer.from(shot1.data, 'base64')
        );
        console.log("Saved verified_concept_a_profile_lv1.png");

        // 2. Open another player at Level 50 (Müdavim)
        console.log("Opening Level 50 player profile...");
        await evalJs(`
            (function() {
                const lv50Player = {
                    id: 'veteran_50_sid',
                    name: 'KadirUsta',
                    gender: 'male',
                    level: 50,
                    role: 'player',
                    avatar: { model: 'karakter_2', gender: 'male' },
                    gameStats: {
                        level: 50,
                        currentProgress: 3450,
                        targetXP: 5201,
                        gamerGamesCount: 400,
                        fishCaughtCount: 500,
                        minedRocksCount: 850
                    }
                };
                if (typeof openPlayerInteractionModal === 'function') {
                    openPlayerInteractionModal('veteran_50_sid', lv50Player);
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 1200));

        const lv50SlotInfo = await evalJs(`
            (function() {
                const slot0 = document.getElementById('profileBadgeSquare_0');
                const svg = slot0 ? slot0.querySelector('svg') : null;
                if (slot0 && typeof showProfileBadgeTooltip === 'function') {
                    showProfileBadgeTooltip(0, slot0, true);
                }
                const tipEl = document.getElementById('profileBadgeFloatingTooltip');
                return {
                    slotClasses: slot0 ? slot0.className : null,
                    hasSvg: !!svg,
                    svgClass: svg ? svg.getAttribute('class') : null,
                    tooltipText: tipEl ? tipEl.innerText.trim() : null
                };
            })()
        `);
        console.log("Level 50 Slot Info:", lv50SlotInfo);

        const shot50 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_concept_a_profile_lv50.png',
            Buffer.from(shot50.data, 'base64')
        );
        console.log("Saved verified_concept_a_profile_lv50.png");

        // 3. Open Level 100 Yaşayan Efsane player profile
        console.log("Opening Level 100 Yaşayan Efsane player profile...");
        await evalJs(`
            (function() {
                const lv100Player = {
                    id: 'legend_100_sid',
                    name: 'MetinBey',
                    gender: 'male',
                    level: 100,
                    role: 'admin',
                    isAdmin: true,
                    avatar: { model: 'karakter_2', gender: 'male' },
                    gameStats: {
                        level: 100,
                        currentProgress: 564810,
                        targetXP: 564810,
                        gamerGamesCount: 1600,
                        fishCaughtCount: 11000,
                        minedRocksCount: 12000
                    }
                };
                if (typeof openPlayerInteractionModal === 'function') {
                    openPlayerInteractionModal('legend_100_sid', lv100Player);
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 1200));

        const lv100SlotInfo = await evalJs(`
            (function() {
                const slot0 = document.getElementById('profileBadgeSquare_0');
                const svg = slot0 ? slot0.querySelector('svg') : null;
                if (slot0 && typeof showProfileBadgeTooltip === 'function') {
                    showProfileBadgeTooltip(0, slot0, true);
                }
                const tipEl = document.getElementById('profileBadgeFloatingTooltip');
                const titleFromHelper = (typeof getLevelTitleHelper === 'function') ? getLevelTitleHelper(100) : null;
                const titleFromClient = (window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') ? window.LevelClient.getLevelTitle(100) : null;
                return {
                    slotClasses: slot0 ? slot0.className : null,
                    hasSvg: !!svg,
                    svgClass: svg ? svg.getAttribute('class') : null,
                    tooltipText: tipEl ? tipEl.innerText.trim() : null,
                    titleFromHelper: titleFromHelper,
                    titleFromClient: titleFromClient
                };
            })()
        `);
        console.log("Level 100 Slot Info:", lv100SlotInfo);

        const shot100 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(
            'C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_concept_a_profile_lv100.png',
            Buffer.from(shot100.data, 'base64')
        );
        console.log("Saved verified_concept_a_profile_lv100.png");

    } finally {
        cleanup();
    }
}

run().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});

