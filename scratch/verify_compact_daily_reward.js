// scratch/verify_compact_daily_reward.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9310;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_dr3_' + Date.now();

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

        console.log("Tarayıcı bağlandı, giriş yapılıyor...");
        const testUser = "DrTester_" + Math.floor(Math.random() * 89999 + 10000);

        await evalJs(`
            (function() {
                const uIn = document.getElementById('usernameInput');
                const pIn = document.getElementById('passwordInput');
                if (uIn) uIn.value = '${testUser}';
                if (pIn) pIn.value = 'password123';
                if (typeof attemptLogin === 'function') attemptLogin();
            })()
        `);

        await new Promise(r => setTimeout(r, 2500));

        // 1. Durum A: 5. Gün, Unclaimed, 4 Günlük Seri (Kızıl Kor Alevi)
        console.log("1. Test Durumu: 5. Gün Ödülü, Alınmamış, 4 Günlük Seri...");
        await evalJs(`
            (function() {
                const mockStatus = {
                    canClaim: true,
                    currentDay: 4,
                    nextDay: 5,
                    isStreakBroken: false,
                    canFreeze: false,
                    hardReset: false,
                    freezeCost: 10
                };
                window.DailyRewardClient.renderModal(mockStatus);
                window.DailyRewardClient.openModal();
            })()
        `);

        await new Promise(r => setTimeout(r, 1000));

        // Screenshot 1: Unclaimed State
        const snap1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath1 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_daily_reward_compact_unclaimed.png";
        fs.writeFileSync(artifactPath1, Buffer.from(snap1.data, 'base64'));
        console.log("✅ Ekran görüntüsü kaydedildi:", artifactPath1);

        // 2. Durum B: 5. Gün Alındı (Claimed State with Countdown)
        console.log("2. Test Durumu: 5. Gün Ödülü Alındı, 5 Günlük Seri, Canlı Geceyarısı Sayacı...");
        await evalJs(`
            (function() {
                const mockStatus = {
                    canClaim: false,
                    currentDay: 5,
                    nextDay: 6,
                    isStreakBroken: false,
                    canFreeze: false,
                    hardReset: false
                };
                window.DailyRewardClient.renderModal(mockStatus);
            })()
        `);

        await new Promise(r => setTimeout(r, 1000));

        // Screenshot 2: Claimed State
        const snap2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath2 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_daily_reward_compact_claimed.png";
        fs.writeFileSync(artifactPath2, Buffer.from(snap2.data, 'base64'));
        console.log("✅ Ekran görüntüsü kaydedildi:", artifactPath2);

        // 3. Durum C: Seri Alevi Farklı Kademeler (Tier 4: 20 Günlük Buzul Plazma Alevi & Tier 5: 35 Gün Efsanevi Gökkuşağı)
        console.log("3. Test Durumu: 20 Günlük Seri (Mavi Plazma) ve Yarın 3 Hafta Hazinesi...");
        await evalJs(`
            (function() {
                const mockStatus = {
                    canClaim: true,
                    currentDay: 20,
                    nextDay: 21,
                    isStreakBroken: false,
                    canFreeze: false,
                    hardReset: false
                };
                window.DailyRewardClient.renderModal(mockStatus);
            })()
        `);

        await new Promise(r => setTimeout(r, 1000));

        const snap3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath3 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_daily_reward_plasma_flame_milestone.png";
        fs.writeFileSync(artifactPath3, Buffer.from(snap3.data, 'base64'));
        console.log("✅ Ekran görüntüsü kaydedildi:", artifactPath3);

        // 4. Durum D: Can Simidi Senaryosu (Seri bozuldu, kurtarma seçeneği)
        console.log("4. Test Durumu: Seri Kırıldı, Can Simidi Seçeneği...");
        await evalJs(`
            (function() {
                const mockStatus = {
                    canClaim: true,
                    currentDay: 12,
                    nextDay: 13,
                    isStreakBroken: true,
                    canFreeze: true,
                    hardReset: false,
                    freezeCost: 10
                };
                window.DailyRewardClient.renderModal(mockStatus);
            })()
        `);

        await new Promise(r => setTimeout(r, 1000));

        const snap4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath4 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_daily_reward_can_simidi_compact.png";
        fs.writeFileSync(artifactPath4, Buffer.from(snap4.data, 'base64'));
        console.log("✅ Ekran görüntüsü kaydedildi:", artifactPath4);

        console.log("\n🎉 TÜM DOĞRULAMA ADIMLARI BAŞARIYLA TAMAMLANDI!");
        cleanup();
        process.exit(0);
    } catch (e) {
        console.error("❌ Test hatası:", e);
        cleanup();
        process.exit(1);
    }
}

run();

