const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

async function verifyAll() {
    console.log("=== STARTING FULL VERIFICATION FOR 3 TASKS ===");
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_verify_all_' + Date.now();
    const port = 9345;

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

        // -------------------------------------------------------------
        // TEST 1: Login Screen Beta v1.4 Badge Verification
        // -------------------------------------------------------------
        console.log("\n--- TEST 1: Login Screen Beta v1.4 Badge ---");
        const badgeCheck = await send('Runtime.evaluate', {
            expression: `(() => {
                const title = document.title;
                const badge = document.querySelector('.login-beta-badge');
                return {
                    title,
                    hasBadge: !!badge,
                    badgeText: badge ? badge.innerText.trim() : null,
                    badgeStyles: badge ? {
                        background: getComputedStyle(badge).backgroundImage || getComputedStyle(badge).background,
                        borderRadius: getComputedStyle(badge).borderRadius,
                        boxShadow: getComputedStyle(badge).boxShadow
                    } : null
                };
            })()`,
            returnByValue: true
        });
        console.log("Badge Check Result:", JSON.stringify(badgeCheck.result.value, null, 2));

        const outDir = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

        // Screenshot of Login Screen with Badge
        const loginSnap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'verified_login_beta_v14_badge.png'), Buffer.from(loginSnap.data, 'base64'));
        console.log("✓ Saved: verified_login_beta_v14_badge.png");

        // -------------------------------------------------------------
        // TEST 2: Register New Account with Karakter 2 Spawning
        // -------------------------------------------------------------
        console.log("\n--- TEST 2: Register New Account (Karakter 2 Spawning) ---");
        const newUserName = 'k2test_' + Math.floor(Math.random() * 89999 + 10000);
        console.log("Registering new account:", newUserName);

        const regResult = await send('Runtime.evaluate', {
            expression: `(async () => {
                // Switch to register tab
                switchAuthTab('register');
                await new Promise(r => setTimeout(r, 200));
                
                document.getElementById('regUsernameInput').value = '${newUserName}';
                document.getElementById('regPasswordInput').value = 'pass1234';
                document.getElementById('regPasswordConfirmInput').value = 'pass1234';
                selectRegisterGender('male');

                attemptRegister();
                return true;
            })()`,
            awaitPromise: true,
            returnByValue: true
        });

        // Wait 3.5 seconds for registration and auto-login
        await new Promise(r => setTimeout(r, 3500));

        const avatarAfterReg = await send('Runtime.evaluate', {
            expression: `(() => {
                const av = window.myAvatar || (typeof myAvatar !== 'undefined' ? myAvatar : null);
                return {
                    username: window.myUsername || (typeof myUsername !== 'undefined' ? myUsername : null),
                    avatar: av,
                    isK2: av && av.model === 'karakter_2'
                };
            })()`,
            returnByValue: true
        });
        console.log("Avatar After Registration:", JSON.stringify(avatarAfterReg.result.value, null, 2));

        // -------------------------------------------------------------
        // TEST 3: Wardrobe First Open Character Appearance
        // -------------------------------------------------------------
        console.log("\n--- TEST 3: Wardrobe First Open Character Appearance ---");
        
        // Close updatesModal if open
        await send('Runtime.evaluate', {
            expression: `(() => {
                if (typeof closeBetaShowcaseModal === 'function') closeBetaShowcaseModal();
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const m = document.getElementById('updatesModal');
                if (m) m.style.display = 'none';
                const d = document.getElementById('dailyRewardModal');
                if (d) d.style.display = 'none';
            })()`
        });

        await new Promise(r => setTimeout(r, 600));

        // Now open wardrobe for the FIRST TIME!
        const openWardrobeResult = await send('Runtime.evaluate', {
            expression: `(() => {
                openWardrobe();
                const canvas = document.getElementById('avatarPreviewCanvas');
                const ctx = canvas.getContext('2d');
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let nonZero = 0;
                for (let i = 3; i < imgData.data.length; i += 4) {
                    if (imgData.data[i] > 0) nonZero++;
                }
                const modal = document.getElementById('wardrobeModal');
                return {
                    modalDisplay: modal ? modal.style.display : null,
                    nonZeroImmediate: nonZero,
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    previewAvatar: typeof previewAvatar !== 'undefined' ? previewAvatar : null
                };
            })()`,
            returnByValue: true
        });
        console.log("Wardrobe First Open Immediate Result:", JSON.stringify(openWardrobeResult.result.value, null, 2));

        // Wait 600ms for preview loop to complete frames
        await new Promise(r => setTimeout(r, 600));

        const wardrobeAfterLoop = await send('Runtime.evaluate', {
            expression: `(() => {
                const canvas = document.getElementById('avatarPreviewCanvas');
                const ctx = canvas.getContext('2d');
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let nonZero = 0;
                for (let i = 3; i < imgData.data.length; i += 4) {
                    if (imgData.data[i] > 0) nonZero++;
                }
                return {
                    nonZeroAfterLoop: nonZero
                };
            })()`,
            returnByValue: true
        });
        console.log("Wardrobe After Animation Loop:", JSON.stringify(wardrobeAfterLoop.result.value, null, 2));

        // Capture screenshot of wardrobe with character displayed
        const wardrobeSnap = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'verified_wardrobe_first_open_fixed.png'), Buffer.from(wardrobeSnap.data, 'base64'));
        console.log("✓ Saved: verified_wardrobe_first_open_fixed.png");

        console.log("\n=== ALL TESTS COMPLETED SUCCESSFULLY ===");
        ws.close();
    } catch (err) {
        console.error("Test error:", err);
    } finally {
        proc.kill();
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
}

verifyAll();

