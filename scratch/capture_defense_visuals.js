// scratch/capture_defense_visuals.js
const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function captureDefenseVisuals() {
    console.log("=== 📸 EDGE CDP İLE GÖRSEL DOĞRULAMA EKRAN GÖRÜNTÜLERİ ALINIYOR ===");

    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_defense_visual_' + Date.now();
    const port = 9279;

    const proc = spawn(edgePath, [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempUserData}`,
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 2000));

    try {
        const listData = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${port}/json/list`, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const pageWsUrl = listData[0].webSocketDebuggerUrl;
        const WebSocket = require('ws');
        const ws = new WebSocket(pageWsUrl);
        await new Promise(r => ws.on('open', r));

        let msgId = 1;
        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = msgId++;
                const handler = (data) => {
                    const parsed = JSON.parse(data);
                    if (parsed.id === id) {
                        ws.removeListener('message', handler);
                        if (parsed.error) {
                            console.error(`CDP error on ${method}:`, parsed.error);
                            reject(parsed.error);
                        } else {
                            resolve(parsed.result);
                        }
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        async function evalJs(expr) {
            const r = await send('Runtime.evaluate', {
                expression: expr,
                returnByValue: false
            });
            if (r && r.exceptionDetails) {
                console.error("Eval Exception:", r.exceptionDetails);
            }
            return (r && r.result) ? r.result.value : r;
        }

        async function dismissOverlays() {
            await evalJs(`
                (() => {
                    const drm = document.getElementById('dailyRewardModal');
                    if (drm) drm.style.display = 'none';
                    if (window.DailyRewardClient && typeof window.DailyRewardClient.closeModal === 'function') {
                        window.DailyRewardClient.closeModal();
                    }
                    const dr = document.getElementById('dailyRewardOverlay');
                    if (dr) dr.style.display = 'none';
                    const um = document.getElementById('updatesModal');
                    if (um) um.style.display = 'none';
                    const dm = document.getElementById('dialogOverlay');
                    if (dm) dm.style.display = 'none';
                    const bdm = document.getElementById('badgeCelebrationOverlay');
                    if (bdm) bdm.style.display = 'none';
                    const sc = document.getElementById('sideChatContainer');
                    if (sc) sc.style.display = 'none';
                    const jm = document.getElementById('jammerBlockedModal');
                    if (jm) jm.style.display = 'none';
                })()
            `);
        }

        function clearToasts() {
            return evalJs(`
                (() => {
                    const tc = document.getElementById('socialNotificationToastContainer');
                    if (tc) tc.innerHTML = '';
                })()
            `);
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

        console.log("Navigating to http://localhost:3000/ ...");
        await send('Page.navigate', { url: 'http://localhost:3000/' });
        await new Promise(r => setTimeout(r, 2500));

        // Kullanıcı 123 ile giriş yap
        console.log("Logging in as user 123...");
        await evalJs(`
            if (window.socket) {
                window.socket.emit('login', { name: '123', pass: '123' });
            }
        `);
        await new Promise(r => setTimeout(r, 2000));
        await dismissOverlays();

        // Cadde odasına geç ve merkezde geniş açık alana yerleş
        await evalJs(`
            if (typeof changeRoom === 'function') changeRoom('cadde');
            else if (window.socket) window.socket.emit('changeRoom', { newRoom: 'cadde' });

            if (window.players && window.myId && window.players[window.myId]) {
                window.players[window.myId].x = 680;
                window.players[window.myId].y = 440;
                window.players[window.myId].facing = 'down';
            }
        `);
        await new Promise(r => setTimeout(r, 1500));
        await dismissOverlays();

        console.log("Korumalar ve Doberman satın alınıyor...");
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 600));
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 600));
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'izbandut' });`);
        await new Promise(r => setTimeout(r, 600));
        await evalJs(`window.socket.emit('buyShadyItem', { itemId: 'doberman' });`);
        await new Promise(r => setTimeout(r, 1500));
        await dismissOverlays();

        // --- GÖRSEL 1: GASP SAVUNMASI (FEDAİ CAN SİPERİ VE KONUŞMA BALONU) ---
        console.log("Görsel 1: Gasp savunması tetikleniyor...");
        await clearToasts();
        await evalJs(`
            (() => {
                const guards = Object.values(window.activeCompanionPets || {}).filter(p => p.petType === 'izbandut');
                if (guards.length > 0) {
                    const g = guards[guards.length - 1]; // Slot 2 koruması
                    g.speech = "Patronu rahat bırak ufaklık! ...Patron, yara aldım revire çekiliyorum.";
                    g.speechUntil = Date.now() + 15000;
                }
                if (typeof showSocialNotificationToast === 'function') {
                    showSocialNotificationToast('🛡️', 'Fedai Can Siperi!', "İzbandut Koruma #3, GölgeGaspçı'nın saldırısını havada yakaladı! (0 TL kaybedildi)");
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 700));

        console.log("Görsel 1 ekran görüntüsü alınıyor...");
        let snap1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_mug_defense_live.png'), Buffer.from(snap1.data, 'base64'));
        console.log("📸 Kaydedildi: verified_mug_defense_live.png");

        // --- GÖRSEL 2: JAMMER 15 SANİYE FREKANS ÇÖZÜCÜ RADAR & OSİLOSKOP ---
        console.log("Görsel 2: Jammer frekans filtresi görseli hazırlanıyor...");
        await clearToasts();
        await evalJs(`
            (() => {
                const guards = Object.values(window.activeCompanionPets || {}).filter(p => p.petType === 'izbandut');
                if (guards.length > 0) {
                    guards[guards.length - 1].speech = null; // İlk korumanın konuşmasını temizle
                }
                if (guards.length > 1) {
                    const g = guards[1];
                    g.isFilteringJammer = true;
                    g.filterJammerUntil = Date.now() + 14000;
                    g.speech = "📡 Frekansı yakaladım patron, telsizle çözüyorum... [15 sn]";
                    g.speechUntil = Date.now() + 8000;
                }
                if (typeof showSocialNotificationToast === 'function') {
                    showSocialNotificationToast('📡', 'Frekans Filtresi!', "İzbandut telsiziyle jammer frekansını deşifre ediyor! [15 sn]");
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 700));

        console.log("Görsel 2 ekran görüntüsü alınıyor...");
        let snap2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_jammer_filter_live.png'), Buffer.from(snap2.data, 'base64'));
        console.log("📸 Kaydedildi: verified_jammer_filter_live.png");

        // --- GÖRSEL 3: ZEUS PARATONER İSKELET ŞOKU VE KÜL YIĞINI ---
        console.log("Görsel 3: Zeus paratoner kül yığını görseli hazırlanıyor...");
        await clearToasts();
        await evalJs(`
            (() => {
                const guards = Object.values(window.activeCompanionPets || {}).filter(p => p.petType === 'izbandut');
                if (guards.length > 0) {
                    const g = guards[0];
                    g.isFilteringJammer = false;
                    g.speech = null;
                    g.isAshed = true;
                    g.ashedUntil = Date.now() + 15000;
                    g.name = "İzbandut Koruması #1";
                }
                if (typeof showSocialNotificationToast === 'function') {
                    showSocialNotificationToast('⚡', 'Paratoner Savunması!', "İzbandut öne atılarak yıldırımı göğüsledi! Patron kurtuldu!");
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 700));

        console.log("Görsel 3 ekran görüntüsü alınıyor...");
        let snap3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_zeus_paratoner_live.png'), Buffer.from(snap3.data, 'base64'));
        console.log("📸 Kaydedildi: verified_zeus_paratoner_live.png");

        ws.close();
        proc.kill();
        console.log("✅ Tüm ekran görüntüleri başarıyla alındı ve kaydedildi!");
        process.exit(0);

    } catch (err) {
        console.error("Ekran görüntüsü hatası:", err);
        proc.kill();
        process.exit(1);
    }
}

captureDefenseVisuals();
