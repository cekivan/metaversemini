// scratch/verify_badge_showcase.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9322;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_badgeshowcase_' + Date.now();

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

        await send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 720,
            deviceScaleFactor: 1,
            mobile: false
        });

        await new Promise(r => setTimeout(r, 2000));

        // 1. Oyuna giriş yap
        console.log("-> Otomatik misafir / test kullanıcısı ile giriliyor...");
        await evalCode(`
            (function() {
                const nameInput = document.getElementById('loginUsername');
                if (nameInput) {
                    nameInput.value = 'RozetUsta_' + Math.floor(Math.random() * 9000 + 1000);
                    const btn = document.getElementById('loginSubmitBtn') || document.querySelector('.login-btn');
                    if (btn) btn.click();
                }
            })()
        `);

        await new Promise(r => setTimeout(r, 2000));

        // Engelleyici bildirimleri / pencereleri kapat
        await evalCode(`
            (function() {
                const um = document.getElementById('updatesModal');
                if (um) um.style.display = 'none';
                const lm = document.getElementById('badgeLevelUpModal');
                if (lm) lm.style.display = 'none';
            })()
        `);

        // 2. Kendi profilimizi zengin istatistiklerle (farklı glow seviyeleri) açalım:
        // Gamer: 1250 (Lv.8 Altın)
        // Botanik: 500 (Lv.6 Bronz)
        // Mining: 2000 (Lv.7 Gümüş)
        // Fishing: 10000 (Lv.10 Siyah Max)
        console.log("-> 10 Kademeli Rozet Vitrini kendi profilimiz için test ediliyor...");
        const ownTestResult = await evalCode(`
            (function() {
                const testPlayer = {
                    id: 'self_test_id',
                    name: (typeof myUsername !== 'undefined' && myUsername) || 'RozetUsta',
                    motto: 'Mini Metaverse 10 Kademeli Rozet Vitrini Testi',
                    gameStats: {
                        gamerGamesCount: 1250,
                        botanicHarvestCount: 500,
                        minedRocksCount: 2000,
                        fishCaughtCount: 10000
                    }
                };
                window.myUsername = testPlayer.name;
                
                openPlayerInteractionModal(testPlayer.id, testPlayer);

                const modal = document.getElementById('playerInteractionModal');
                const grid = document.getElementById('profileBadgesGrid');
                const cards = grid ? Array.from(grid.querySelectorAll('.badge-card')) : [];

                return {
                    modalDisplay: modal ? modal.style.display : null,
                    cardCount: cards.length,
                    cards: cards.map(c => ({
                        className: c.className,
                        name: c.querySelector('.badge-name') ? c.querySelector('.badge-name').innerText : '',
                        subTitle: c.querySelector('.badge-title-sub') ? c.querySelector('.badge-title-sub').innerText : '',
                        tierTag: c.querySelector('.badge-tier-tag') ? c.querySelector('.badge-tier-tag').innerText : '',
                        statText: c.querySelector('.badge-stat-text') ? c.querySelector('.badge-stat-text').innerText : '',
                        hasProgressBar: !!c.querySelector('.badge-progress-bar'),
                        barWidth: c.querySelector('.badge-progress-bar') ? c.querySelector('.badge-progress-bar').style.width : null
                    }))
                };
            })()
        `);

        console.log("Own Profile Test Result:", JSON.stringify(ownTestResult, null, 2));

        await new Promise(r => setTimeout(r, 600));

        // Screenshot 1: Kendi profilimizin 10 Kademeli Rozet Vitrini (Altın, Bronz, Gümüş, Siyah Auralar ile)
        const ownScreenshotPath = path.join(ARTIFACT_DIR, 'verified_profile_badge_showcase_modal.png');
        await takeScreenshot(ownScreenshotPath);

        // 3. Başka bir oyuncunun profili açıldığında (isOwnProfile = false):
        // İlerleme çubukları olmamalı, sadece "Ulaşılan Kademe: Lv. X" olmalı
        console.log("-> Başka oyuncunun profili için test ediliyor...");
        const otherTestResult = await evalCode(`
            (function() {
                const otherPlayer = {
                    id: 'other_test_player_id',
                    name: 'GizemliOyuncu',
                    motto: 'Sadece ulaştığım kademeleri görebilirsin.',
                    gameStats: {
                        batakGamesCount: 15,
                        okeyGamesCount: 20,
                        botanicHarvestPoints: 120,
                        minedCount: 300,
                        fishCount: 450
                    }
                };

                openPlayerInteractionModal(otherPlayer.id, otherPlayer);

                const grid = document.getElementById('profileBadgesGrid');
                const cards = grid ? Array.from(grid.querySelectorAll('.badge-card')) : [];

                return {
                    cardCount: cards.length,
                    cards: cards.map(c => ({
                        className: c.className,
                        name: c.querySelector('.badge-name') ? c.querySelector('.badge-name').innerText : '',
                        subTitle: c.querySelector('.badge-title-sub') ? c.querySelector('.badge-title-sub').innerText : '',
                        tierTag: c.querySelector('.badge-tier-tag') ? c.querySelector('.badge-tier-tag').innerText : '',
                        statText: c.querySelector('.badge-stat-text') ? c.querySelector('.badge-stat-text').innerText : '',
                        hasProgressBar: !!c.querySelector('.badge-progress-bar')
                    }))
                };
            })()
        `);

        console.log("Other Player Profile Test Result:", JSON.stringify(otherTestResult, null, 2));

        await new Promise(r => setTimeout(r, 600));

        // Screenshot 2: Başka oyuncunun profili
        const otherScreenshotPath = path.join(ARTIFACT_DIR, 'verified_other_player_badge_showcase.png');
        await takeScreenshot(otherScreenshotPath);

        // Doğrulamalar:
        if (ownTestResult.cardCount !== 4) {
            throw new Error(`Expected 4 cards for own profile but got ${ownTestResult.cardCount}`);
        }
        if (otherTestResult.cardCount !== 4) {
            throw new Error(`Expected 4 cards for other profile but got ${otherTestResult.cardCount}`);
        }
        // İlerleme çubuğu kontrolü
        if (!ownTestResult.cards.every(c => c.hasProgressBar)) {
            throw new Error("Own profile cards should all have progress bars!");
        }
        if (!otherTestResult.cards.every(c => !c.hasProgressBar)) {
            throw new Error("Other player profile cards should NOT have progress bars!");
        }

        console.log("🎉 ALL CDP VERIFICATION CHECKS PASSED PERFECTLY!");
    } catch (err) {
        console.error("CDP Test failed:", err);
        process.exitCode = 1;
    } finally {
        cleanup();
    }
}

run();

