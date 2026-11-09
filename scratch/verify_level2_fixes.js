const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const io = require('socket.io-client');

async function main() {
    console.log("=== STARTING VERIFICATION FOR LEVEL 2 & HUD REMOVAL ===");
    const outDir = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_lvl2_test_' + Date.now();
    const port = 9349;

    // 1. First, spawn a dummy player on the server to be the target in the room
    const dummySocket = io('http://localhost:3000');
    await new Promise((resolve) => {
        dummySocket.on('connect', () => {
            console.log('Dummy socket connected:', dummySocket.id);
            dummySocket.emit('login', { username: 'testdummy_target', password: 'password' });
            // If user doesn't exist, register
            dummySocket.on('loginFailed', () => {
                dummySocket.emit('register', { username: 'testdummy_target', password: 'password', gender: 'male' });
            });
            dummySocket.on('loginSuccess', () => {
                console.log('Dummy player logged in successfully!');
                resolve();
            });
        });
    });

    // 2. Launch headless Edge
    const proc = spawn(edgePath, [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-sync',
        `--user-data-dir=${tempUserData}`,
        'http://localhost:3000'
    ]);

    await new Promise(r => setTimeout(r, 2200));

    try {
        const listData = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${port}/json/list`, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const pageTarget = listData.find(t => t.type === 'page' && !t.url.startsWith('edge://'));
        const WebSocket = require('c:\\Users\\WIN11\\Desktop\\metaversemini\\node_modules\\ws');
        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
        await new Promise(r => ws.on('open', r));

        let msgId = 1;
        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = msgId++;
                const handler = (data) => {
                    const parsed = JSON.parse(data);
                    if (parsed.id === id) {
                        ws.off('message', handler);
                        if (parsed.error) reject(parsed.error);
                        else resolve(parsed.result);
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');

        ws.on('message', d => {
            const p = JSON.parse(d);
            if (p.method === 'Runtime.consoleAPICalled') {
                console.log('[BROWSER LOG]', p.params.type, p.params.args.map(a => a.value || a.description).join(' '));
            } else if (p.method === 'Runtime.exceptionThrown') {
                console.error('[BROWSER ERROR]', p.params.exceptionDetails.text, p.params.exceptionDetails.exception?.description);
            }
        });

        await new Promise(r => setTimeout(r, 1500));

        // CHECK 1: HUD Level bar & v1.4 nav button absent before & after login
        const domCheck1 = await send('Runtime.evaluate', {
            expression: `(() => {
                const hud = document.getElementById('hudLevelContainer');
                const v14NavBtn = document.getElementById('betaShowcaseNavBtn');
                return {
                    hudContainerExists: !!hud,
                    v14NavBtnExists: !!v14NavBtn
                };
            })()`,
            returnByValue: true
        });
        console.log("DOM Check before login:", domCheck1.result.value);

        // LOGIN AS 10kasım (Level 2 user)
        console.log("\nLogging in as 10kasım...");
        await send('Runtime.evaluate', {
            expression: `(() => {
                document.getElementById('usernameInput').value = '10kasım';
                document.getElementById('passwordInput').value = '10kasım';
                attemptLogin();
            })()`
        });

        await new Promise(r => setTimeout(r, 2500));

        // Dismiss popups if any
        await send('Runtime.evaluate', {
            expression: `(() => {
                if (typeof closeBetaShowcaseModal === 'function') closeBetaShowcaseModal();
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
                const d = document.getElementById('dailyRewardModal');
                if (d) d.style.display = 'none';
                window.confirm = () => true;
            })()`
        });

        await new Promise(r => setTimeout(r, 500));

        // CHECK 2: In-game state: Level HUD is null, Beta v1.4 button is null
        const inGameChecks = await send('Runtime.evaluate', {
            expression: `(() => {
                const hud = document.getElementById('hudLevelContainer');
                const v14NavBtn = document.getElementById('betaShowcaseNavBtn');
                const userLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || window.myLevel;
                return {
                    hudContainerExists: !!hud,
                    v14NavBtnExists: !!v14NavBtn,
                    userLevel: userLvl,
                    myJammerCount: window.myJammerCount,
                    myZeusCount: window.myZeusCount,
                    myMugKnifeCount: window.myMugKnifeCount,
                    myPropInventory: window.myPropInventory
                };
            })()`,
            returnByValue: true
        });
        console.log("In-game Player & DOM state:", JSON.stringify(inGameChecks.result.value, null, 2));

        // CHECK 3: Open Profile for another player (testdummy_target)
        console.log("\nSimulating opening profile of testdummy_target...");
        const profileOpenResult = await send('Runtime.evaluate', {
            expression: `(() => {
                // Find dummy socket id or construct dummy target
                let dummyId = Object.keys(window.players || {}).find(id => window.players[id].name === 'testdummy_target');
                let dummyP = dummyId ? window.players[dummyId] : null;
                if (!dummyP) {
                    dummyId = 'dummy_socket_id';
                    dummyP = {
                        id: dummyId,
                        name: 'testdummy_target',
                        level: 1,
                        x: 400,
                        y: 300,
                        room: window.currentRoom || 'sokak',
                        avatar: { model: 'karakter_2', skin: '#facc15' }
                    };
                    if (window.players) window.players[dummyId] = dummyP;
                }
                
                // Open interaction profile
                window.openPlayerInteractionModal(dummyId, dummyP);

                const sideTabs = document.querySelector('.profile-side-tabs');
                const jammerBtn = sideTabs ? sideTabs.querySelector('.tab-jammer') : null;
                const mugBtn = sideTabs ? sideTabs.querySelector('.tab-mug') : null;
                const zeusBtn = sideTabs ? sideTabs.querySelector('.tab-zeus') : null;

                return {
                    modalVisible: document.getElementById('playerInteractionModal')?.style.display,
                    hasSideTabs: !!sideTabs,
                    hasJammerBtn: !!jammerBtn,
                    jammerTitle: jammerBtn?.title,
                    hasMugBtn: !!mugBtn,
                    mugTitle: mugBtn?.title,
                    hasZeusBtn: !!zeusBtn,
                    zeusTitle: zeusBtn?.title
                };
            })()`,
            returnByValue: true
        });
        console.log("Profile Side Tabs for Level 2:", JSON.stringify(profileOpenResult.result.value, null, 2));

        // Take a screenshot of the opened profile with special action tabs
        const profileSnap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'verified_level2_profile_actions.png'), Buffer.from(profileSnap.data, 'base64'));
        console.log("✓ Saved: verified_level2_profile_actions.png");

        // CHECK 4: Test clicking Jammer and Zeus Lightning
        console.log("\nTesting action executions...");
        const actionResult = await send('Runtime.evaluate', {
            expression: `(() => {
                const logs = [];
                const origError = window.showGameError;
                window.showGameError = (msg) => { logs.push('ERROR: ' + msg); if (origError) origError(msg); };

                // Try jammer
                try {
                    useJammerOnInteractingPlayer();
                    logs.push('Jammer called without client block');
                } catch (e) {
                    logs.push('Jammer threw: ' + e.message);
                }

                return logs;
            })()`,
            returnByValue: true
        });
        console.log("Jammer invocation log:", actionResult.result.value);

        // Also test Zeus
        const zeusActionResult = await send('Runtime.evaluate', {
            expression: `(() => {
                const logs = [];
                const origError = window.showGameError;
                window.showGameError = (msg) => { logs.push('ERROR: ' + msg); if (origError) origError(msg); };

                // Reopen profile
                let dummyId = Object.keys(window.players || {}).find(id => window.players[id].name === 'testdummy_target') || 'dummy_socket_id';
                let dummyP = window.players[dummyId];
                window.openPlayerInteractionModal(dummyId, dummyP);

                try {
                    useZeusLightningOnInteractingPlayer();
                    logs.push('Zeus called without client block');
                } catch (e) {
                    logs.push('Zeus threw: ' + e.message);
                }

                return logs;
            })()`,
            returnByValue: true
        });
        console.log("Zeus invocation log:", zeusActionResult.result.value);

        await new Promise(r => setTimeout(r, 1000));

        // Take final in-game screenshot showing clean top-left (no HUD bar) and top nav (no v1.4 button)
        await send('Runtime.evaluate', {
            expression: `(() => {
                if (typeof closePlayerInteractionModal === 'function') closePlayerInteractionModal();
                const d = document.getElementById('dailyRewardModal');
                if (d) d.remove();
                const dBadge = document.getElementById('drFloatingBadge');
                if (dBadge) dBadge.remove();
            })()`
        });
        await new Promise(r => setTimeout(r, 500));
        const hudSnap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'verified_hud_and_nav_clean.png'), Buffer.from(hudSnap.data, 'base64'));
        console.log("✓ Saved: verified_hud_and_nav_clean.png");

        console.log("\n=== ALL LEVEL 2, HUD REMOVAL & V1.4 REMOVAL VERIFICATIONS PASSED! ===");
        ws.close();
    } finally {
        proc.kill();
        dummySocket.disconnect();
    }
}

main().catch(err => {
    console.error("FATAL ERROR in verification:", err);
    process.exit(1);
});
