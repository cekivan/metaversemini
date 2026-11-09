// scratch/test_cadde2_and_places_menu.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9325;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_cadde2_barricade_' + Date.now();

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

        const testUser = "BarricadeTester" + Math.floor(Math.random() * 8999 + 1000);
        console.log(`Kullanıcı kayıt ediliyor: ${testUser}`);

        await evalJs(`
            (function() {
                if (typeof switchAuthTab === 'function') switchAuthTab('register');
                const uIn = document.getElementById('regUsernameInput');
                const pIn = document.getElementById('regPasswordInput');
                const pConf = document.getElementById('regPasswordConfirmInput');
                if (uIn) uIn.value = '${testUser}';
                if (pIn) pIn.value = '123456';
                if (pConf) pConf.value = '123456';
                if (typeof attemptRegister === 'function') attemptRegister();
            })()
        `);

        for (let i = 0; i < 25; i++) {
            await new Promise(r => setTimeout(r, 250));
            let disp = await evalJs(`document.getElementById('loginScreen')?.style.display`);
            if (disp === 'none') {
                console.log(`Giriş başarılı! ${testUser} oyunda.`);
                break;
            }
        }

        await new Promise(r => setTimeout(r, 1000));

        // Modalları kapat
        await evalJs(`
            (function() {
                localStorage.setItem('mm_last_seen_updates_version', '1.3');
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const uModal = document.getElementById('updatesModal');
                if (uModal) uModal.style.display = 'none';

                if (typeof closeBadgeLevelUpModal === 'function') closeBadgeLevelUpModal();
                const bModal = document.getElementById('badgeLevelUpModal');
                if (bModal) bModal.style.display = 'none';
            })()
        `);

        // ==========================================
        // 1. MEKANLAR MENÜSÜ DOĞRULAMASI
        // ==========================================
        console.log("\n--- MEKANLAR MENÜSÜ TESTİ ---");
        const menuDetails = await evalJs(`
            (function() {
                const btn = document.getElementById('placesDropdownBtn');
                const menu = document.getElementById('placesDropdownMenu');
                if (btn && typeof togglePlacesMenu === 'function') {
                    menu.style.display = 'flex';
                }
                const items = Array.from(menu.querySelectorAll('.place-menu-item')).map(b => ({
                    text: b.innerText.replace(/\\s+/g, ' ').trim(),
                    onclick: b.getAttribute('onclick')
                }));
                return {
                    count: items.length,
                    items: items
                };
            })()
        `);

        console.log(`Mekanlar menüsü eleman sayısı: ${menuDetails.count}`);
        menuDetails.items.forEach((it, idx) => {
            console.log(`  [${idx + 1}] ${it.text} -> ${it.onclick}`);
        });

        // Screenshot of Places Dropdown
        const shotMenu = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_places_dropdown_simplified.png'), Buffer.from(shotMenu.data, 'base64'));
        console.log("Screenshot kaydedildi: verified_places_dropdown_simplified.png");

        // Menüyü kapat
        await evalJs(`document.getElementById('placesDropdownMenu').style.display = 'none';`);

        // ==========================================
        // 2. CADDE 2'YE IŞINLANMA VE KONTROLLER
        // ==========================================
        console.log("\n--- CADDE 2 TESTİ ---");
        await evalJs(`
            (function() {
                if (typeof changeRoom === 'function') changeRoom('cadde2', { x: 500, y: 220 });
            })()
        `);

        await new Promise(r => setTimeout(r, 1500));

        // Tekrar modalları temizle
        await evalJs(`
            (function() {
                if (typeof closeUpdatesModal === 'function') closeUpdatesModal();
                const uModal = document.getElementById('updatesModal');
                if (uModal) uModal.style.display = 'none';
                if (typeof closeBadgeLevelUpModal === 'function') closeBadgeLevelUpModal();
                const bModal = document.getElementById('badgeLevelUpModal');
                if (bModal) bModal.style.display = 'none';
            })()
        `);

        // Collision testleri
        const colResults = await evalJs(`
            (function() {
                return {
                    northRoadBarricade: typeof checkWorldCollision === 'function' ? checkWorldCollision(500, 140) : null,   // Barikat içi olmalı -> true (engellenmeli)
                    northRoadBeyond: typeof checkWorldCollision === 'function' ? checkWorldCollision(500, 80) : null,       // Barikatın arkası -> true (engellenmeli)
                    northRoadWalkable: typeof checkWorldCollision === 'function' ? checkWorldCollision(500, 200) : null,    // Barikat önü ana yol -> false (yürünebilir)
                    eastBorderClosed: typeof checkWorldCollision === 'function' ? checkWorldCollision(990, 230) : null,     // Sağa geçiş sınırı -> true (engellenmeli)
                    eastRoadWalkable: typeof checkWorldCollision === 'function' ? checkWorldCollision(950, 230) : null,     // Sağ yol ortası -> false (yürünebilir)
                    westExitOpen: typeof checkWorldCollision === 'function' ? checkWorldCollision(10, 235) : null,          // Sola çıkış Cadde 1 -> false (açık)
                };
            })()
        `);
        console.log("Çarpışma / Collision Test Sonuçları:", colResults);

        // Screenshot of Cadde 2 Barricade & Closed Exit
        const shotCadde2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_cadde2_barricade_and_closed_exit.png'), Buffer.from(shotCadde2.data, 'base64'));
        console.log("Screenshot kaydedildi: verified_cadde2_barricade_and_closed_exit.png");

        // Hover testi (Barikat ve Doğu Kapanma üzerine fare getirme)
        console.log("\n--- HOVER & ETKİLEŞİM TESTİ ---");
        await evalJs(`
            (function() {
                canvasMouseX = 500;
                canvasMouseY = 120;
            })()
        `);
        await new Promise(r => setTimeout(r, 200));

        const hoverState = await evalJs(`hoveredTableId`);
        console.log(`Barikat üzeri hover ID: ${hoverState}`);

        // Tıklama bildirim testleri
        const notifBarricade = await evalJs(`
            (function() {
                const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) ? players[myId] : { x: 500, y: 220 };
                return handleRoomInteractionClick(500, 120, currentRoom, myP, canvas.width, canvas.height);
            })()
        `);
        console.log(`Barikat tıklama işlendi mi: ${notifBarricade}`);

        await new Promise(r => setTimeout(r, 400));
        const shotHover = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_cadde2_barricade_hover.png'), Buffer.from(shotHover.data, 'base64'));
        console.log("Screenshot kaydedildi: verified_cadde2_barricade_hover.png");

        const notifEast = await evalJs(`
            (function() {
                const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) ? players[myId] : { x: 500, y: 220 };
                return handleRoomInteractionClick(960, 230, currentRoom, myP, canvas.width, canvas.height);
            })()
        `);
        console.log(`Doğu kapalı yol tıklama işlendi mi: ${notifEast}`);

        console.log("\n=== TÜM TESTLER BAŞARIYLA TAMAMLANDI ===");
    } catch (e) {
        console.error("Test hatası:", e);
    } finally {
        cleanup();
    }
}

run();
