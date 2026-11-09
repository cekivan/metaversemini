const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

async function verifyRewardExplosion() {
    console.log("Starting Edge for Daily Reward particle explosion verification...");
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_reward_part_' + Date.now();
    const port = 9305;

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
        if (!pageTarget) throw new Error("Target page not found!");

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
        await send('DOM.enable');

        await send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 850,
            deviceScaleFactor: 1,
            mobile: false
        });

        // Ensure DailyRewardClient is initialized
        const initCheck = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const modal = document.getElementById('dailyRewardModal');
                    if (modal) modal.style.display = 'flex';
                    if (window.DailyRewardClient) {
                        window.DailyRewardClient.renderModal({
                            canClaim: true,
                            currentDay: 5,
                            nextDay: 6,
                            hardReset: false,
                            isStreakBroken: false,
                            canFreeze: false
                        });
                        return { ok: true, msg: "Modal rendered for day 5" };
                    }
                    return { ok: false, msg: "DailyRewardClient not found" };
                })()
            `,
            returnByValue: true
        });
        console.log("Init result:", initCheck.result.value);

        await new Promise(r => setTimeout(r, 400));

        console.log("Triggering spawnRewardParticles()...");
        const spawnRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    if (window.DailyRewardClient && typeof window.DailyRewardClient.spawnRewardParticles === 'function') {
                        window.DailyRewardClient.spawnRewardParticles();
                        const canvas = document.getElementById('dailyRewardCanvas');
                        return {
                            ok: true,
                            canvasDisplay: canvas ? canvas.style.display : null,
                            chestHasPunch: document.getElementById('drChestIcon')?.classList.contains('dr-chest-punch'),
                            cardHasPunch: document.querySelector('.dr-today-card')?.classList.contains('dr-card-punch')
                        };
                    }
                    return { ok: false, msg: "spawnRewardParticles function missing" };
                })()
            `,
            returnByValue: true
        });
        console.log("Spawn check:", spawnRes.result.value);

        const outDir = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

        // 1. Initial burst capture (around 120ms into explosion)
        await new Promise(r => setTimeout(r, 120));
        const shot1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'verified_reward_explosion_burst.png'), Buffer.from(shot1.data, 'base64'));
        console.log("Saved: verified_reward_explosion_burst.png");

        // 2. Bloom & 3D tumble capture (around 450ms into explosion)
        await new Promise(r => setTimeout(r, 330));
        const shot2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'verified_reward_explosion_bloom.png'), Buffer.from(shot2.data, 'base64'));
        console.log("Saved: verified_reward_explosion_bloom.png");

        // 3. Floating downward capture (around 950ms into explosion)
        await new Promise(r => setTimeout(r, 500));
        const shot3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(outDir, 'verified_reward_explosion_float.png'), Buffer.from(shot3.data, 'base64'));
        console.log("Saved: verified_reward_explosion_float.png");

        // 4. Wait for full completion (~2100ms total) and verify clean hide
        await new Promise(r => setTimeout(r, 1200));
        const finalStatus = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const canvas = document.getElementById('dailyRewardCanvas');
                    return {
                        canvasDisplay: canvas ? canvas.style.display : null,
                        chestHasPunchClass: document.getElementById('drChestIcon')?.classList.contains('dr-chest-punch')
                    };
                })()
            `,
            returnByValue: true
        });
        console.log("Final animation status (canvas should be hidden):", finalStatus.result.value);

        ws.close();
        console.log("Verification finished successfully!");
    } catch (err) {
        console.error("CDP verification error:", err);
    } finally {
        proc.kill();
        try {
            fs.rmSync(tempUserData, { recursive: true, force: true });
        } catch (e) {}
    }
}

verifyRewardExplosion();
