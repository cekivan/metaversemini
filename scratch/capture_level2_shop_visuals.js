const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function captureLevel2Visuals() {
    console.log("=== 📸 EDGE CDP İLE SEVİYE 2 EŞYA VE KARABORSA GÖRSEL DOĞRULAMA (V2) ===");

    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_level2_visual_' + Date.now();
    const port = 9288;

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
                returnByValue: true
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
                    if (drm) drm.remove();
                    const dr = document.getElementById('dailyRewardOverlay');
                    if (dr) dr.remove();
                    const fb = document.getElementById('drFloatingBadge');
                    if (fb) fb.remove();
                    const lu = document.getElementById('levelUpOverlay');
                    if (lu) lu.style.display = 'none';
                    const um = document.getElementById('updatesModal');
                    if (um) um.style.display = 'none';
                    const dm = document.getElementById('dialogOverlay');
                    if (dm) dm.style.display = 'none';
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

        const testUser = "Lvl2Hero" + Math.floor(Math.random() * 8999 + 1000);
        console.log(`Kullanıcı oluşturuluyor: ${testUser}`);
        await evalJs(`
            (() => {
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
        await new Promise(r => setTimeout(r, 2000));
        await dismissOverlays();

        // 1. Show Level Up Modal with Level 2 Unlocks
        console.log("1. Rendering Level Up Modal with Level 2 Unlocks...");
        await evalJs(`
            (() => {
                if (window.LevelClient && typeof window.LevelClient.showLevelUpModal === 'function') {
                    window.LevelClient.showLevelUpModal(2, 2000, 2);
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        const shot1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_levelup_level2_unlocks.png'), Buffer.from(shot1.data, 'base64'));
        console.log("✅ verified_levelup_level2_unlocks.png kaydedildi.");

        // Dismiss level up popup
        await evalJs(`document.getElementById('levelUpOverlay').style.display = 'none';`);

        // 2. Open Tekinsiz Tekin Shop at Level 2
        console.log("2. Opening Tekinsiz Tekin Shop at Level 2...");
        await evalJs(`
            (() => {
                if (typeof openTekinsizTekinModal === 'function') {
                    openTekinsizTekinModal();
                }
                if (typeof renderShadyShopUI === 'function') {
                    renderShadyShopUI({
                        level: 2,
                        money: 25000,
                        diamonds: 10,
                        maxBodyguards: 1,
                        bodyguardCount: 0,
                        bodyguardsEquipped: 0,
                        hasDoberman: false,
                        jammerCount: 0,
                        zeusCount: 0,
                        mugKnifeCount: 0,
                        hasMugKnife: false,
                        anonMaskCount: 0,
                        anonMaskExpiresAt: 0,
                        items: (window.SHADY_ITEMS || {
                            jammer: { id: 'jammer', name: 'Sinyal Kesici (Jammer)', price: 1500, currency: 'money', minLevel: 3, icon: '📡' },
                            anon_mask: { id: 'anon_mask', name: 'Gizli Kimlik Maskesi', price: 3000, currency: 'money', minLevel: 3, icon: '🎭' },
                            izbandut: { id: 'izbandut', name: 'İzbandut Koruma', price: 5000, currency: 'money', minLevel: 2, icon: '🕴️' },
                            doberman: { id: 'doberman', name: 'Doberman Koruma', price: 4000, currency: 'money', minLevel: 3, icon: '🐕‍🦺' },
                            mug_knife: { id: 'mug_knife', name: 'Gasp Bıçağı', price: 2, currency: 'diamond', minLevel: 2, icon: '🗡️' },
                            zeus_yildirimi: { id: 'zeus_yildirimi', name: "Zeus'un İlahi Yıldırımı", price: 2, currency: 'diamond', minLevel: 2, icon: '⚡' },
                            neon_red_nick: { id: 'neon_red_nick', name: 'Kırmızı Liste Boyası', price: 2500, currency: 'money', icon: '🔴' },
                            invisibility: { id: 'invisibility', name: 'Görünmezlik Kostümü', price: 6000, currency: 'money', icon: '👻' }
                        })
                    });
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        const shot2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_tekinsiz_tekin_level2_shop.png'), Buffer.from(shot2.data, 'base64'));
        console.log("✅ verified_tekinsiz_tekin_level2_shop.png kaydedildi.");

        console.log("\n🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED! 📸✨");
    } finally {
        try { proc.kill('SIGKILL'); } catch (e) {}
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
}

captureLevel2Visuals().catch(err => {
    console.error("❌ Visual capture failed:", err);
    process.exit(1);
});
