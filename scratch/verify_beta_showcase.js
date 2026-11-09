// scratch/verify_beta_showcase.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9312;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_beta14_' + Date.now();

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
        const testUser = "BetaTester_" + Math.floor(Math.random() * 89999 + 10000);

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

        // 1. Beta v1.4 Modalını Aç
        console.log("1. Beta v1.4 Modalını 'level' sekmesiyle aç...");
        await evalJs(`
            (function() {
                if (typeof openBetaShowcaseModal === 'function') {
                    openBetaShowcaseModal('level');
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 1000));

        const snap1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath1 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_beta_v14_level_tab.png";
        fs.writeFileSync(artifactPath1, Buffer.from(snap1.data, 'base64'));
        console.log("✅ Ekran görüntüsü 1 (Level Tab) kaydedildi:", artifactPath1);

        // 2. Madencilik Sekmesine Geç
        console.log("2. Madencilik sekmesine geç...");
        await evalJs(`switchBetaTab('mining');`);
        await new Promise(r => setTimeout(r, 800));

        const snap2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath2 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_beta_v14_mining_tab.png";
        fs.writeFileSync(artifactPath2, Buffer.from(snap2.data, 'base64'));
        console.log("✅ Ekran görüntüsü 2 (Mining Tab) kaydedildi:", artifactPath2);

        // 3. Tarla & Botanik Sekmesine Geç
        console.log("3. Tarla & Botanik sekmesine geç...");
        await evalJs(`switchBetaTab('farming');`);
        await new Promise(r => setTimeout(r, 800));

        const snap3 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath3 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_beta_v14_farming_tab.png";
        fs.writeFileSync(artifactPath3, Buffer.from(snap3.data, 'base64'));
        console.log("✅ Ekran görüntüsü 3 (Farming Tab) kaydedildi:", artifactPath3);

        // 4. VİP & Karaborsa Sekmesine Geç
        console.log("4. VİP & Karaborsa sekmesine geç...");
        await evalJs(`switchBetaTab('vip');`);
        await new Promise(r => setTimeout(r, 800));

        const snap4 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        const artifactPath4 = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_beta_v14_vip_tab.png";
        fs.writeFileSync(artifactPath4, Buffer.from(snap4.data, 'base64'));
        console.log("✅ Ekran görüntüsü 4 (VIP Tab) kaydedildi:", artifactPath4);

        // 5. Kapatma Butonuna Tıkla
        console.log("5. Modal kapatma butonuna tıkla...");
        await evalJs(`closeBetaShowcaseModal();`);
        await new Promise(r => setTimeout(r, 800));

        const isClosed = await evalJs(`document.getElementById('updatesModal')?.style.display === 'none'`);
        console.log("Modal başarıyla kapandı mı:", isClosed);

        if (!isClosed) throw new Error("Modal kapanmadı!");

        console.log("\n🎉 BETA v1.4 TANITIM EKRANI TESTİ %100 BAŞARILI!");
        cleanup();
        process.exit(0);
    } catch (e) {
        console.error("❌ Test hatası:", e);
        cleanup();
        process.exit(1);
    }
}

run();

