const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

const ARTIFACT_DIR = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';

async function captureAnonVisuals() {
    console.log("=== 📸 EDGE CDP İLE GİZLİ KİMLİK MASKESİ GÖRSEL DOĞRULAMA (V3) ===");

    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_anon_visual_' + Date.now();
    const port = 9286;

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
                    if (lu) lu.remove();
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

        // Register fresh user
        const testUser = "MaskHero" + Math.floor(Math.random() * 8999 + 1000);
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

        await new Promise(r => setTimeout(r, 2500));
        await dismissOverlays();

        // -------------------------------------------------------------
        // SHOT 1: 8-WAY ISOMETRIC ANON MASK SHOWCASE CANVAS
        // -------------------------------------------------------------
        console.log("1. Creating 8-Way Isometric Mask Showcase...");
        await evalJs(`
            (() => {
                let showcase = document.getElementById('anonMask8WayCanvas');
                if (!showcase) {
                    showcase = document.createElement('canvas');
                    showcase.id = 'anonMask8WayCanvas';
                    showcase.width = 1040;
                    showcase.height = 420;
                    showcase.style.position = 'fixed';
                    showcase.style.top = '60px';
                    showcase.style.left = '120px';
                    showcase.style.zIndex = '99999';
                    showcase.style.borderRadius = '16px';
                    showcase.style.boxShadow = '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(139,92,246,0.3)';
                    showcase.style.border = '2px solid rgba(139,92,246,0.5)';
                    document.body.appendChild(showcase);
                }
                const ctx = showcase.getContext('2d');
                const grad = ctx.createLinearGradient(0, 0, 1040, 420);
                grad.addColorStop(0, '#090a0f');
                grad.addColorStop(0.5, '#12131c');
                grad.addColorStop(1, '#0b0c14');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 1040, 420);

                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;
                for (let x = 0; x < 1040; x += 40) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 420); ctx.stroke();
                }
                for (let y = 0; y < 420; y += 40) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1040, y); ctx.stroke();
                }

                ctx.fillStyle = '#f8fafc';
                ctx.font = 'bold 20px "Segoe UI", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🎭 GİZLİ KİMLİK MASKESİ — 8 AÇILI İZOMETRİK VE HAYALET TASARIM', 520, 38);

                ctx.font = '13px "Segoe UI", sans-serif';
                ctx.fillStyle = '#a1a1aa';
                ctx.fillText('Obsidiyen Mat Gövde • Badem Göz Yarıkları • Çelik Tokalı Arka Deri Kayış • K1 & K2 Uyumlu', 520, 62);

                const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
                const dirNames = ['GÜNEY (Ön)', 'G-DOĞU (3/4)', 'DOĞU (Profil)', 'K-DOĞU (3/4 Arka)', 'KUZEY (Arka)', 'K-BATI (3/4 Arka)', 'BATI (Profil)', 'G-BATI (3/4)'];

                directions.forEach((dir, idx) => {
                    const cx = 85 + idx * 124;
                    const cy = 230;

                    ctx.beginPath();
                    ctx.ellipse(cx, cy + 52, 44, 16, 0, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
                    ctx.fill();
                    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    ctx.font = 'bold 11px "Segoe UI", sans-serif';
                    ctx.fillStyle = '#c084fc';
                    ctx.textAlign = 'center';
                    ctx.fillText(dirNames[idx], cx, cy + 90);

                    ctx.font = '10px monospace';
                    ctx.fillStyle = '#71717a';
                    ctx.fillText(dir, cx, cy + 105);

                    const isFem = (idx % 2 === 1);
                    const dummyPlayer = {
                        name: '???',
                        gender: isFem ? 'female' : 'male',
                        model: 'classic_2',
                        skinColor: '#ffd1a4',
                        shirtColor: isFem ? '#ec4899' : '#3b82f6',
                        shoes: isFem ? 'flats' : 'sneakers',
                        heldItem: 'none',
                        hat: 'none',
                        hair: isFem ? 'none' : 'hair_short',
                        facing: dir,
                        anonMaskExpiresAt: Date.now() + 1800000
                    };

                    ctx.save();
                    ctx.translate(cx, cy);
                    ctx.scale(2.3, 2.3);
                    if (typeof window.drawClassic2Avatar === 'function') {
                        window.drawClassic2Avatar(ctx, 0, 0, dummyPlayer, dir, false, 0, 0, false, true);
                    }
                    if (typeof window.drawIsometricAnonMask === 'function') {
                        window.drawIsometricAnonMask(ctx, 0, 0, dir, false, dummyPlayer);
                    }
                    ctx.restore();
                });
            })()
        `);
        await new Promise(r => setTimeout(r, 600));

        const shot1 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_anon_mask_8way_showcase.png'), Buffer.from(shot1.data, 'base64'));
        console.log("✅ verified_anon_mask_8way_showcase.png kaydedildi.");

        // Remove 8-way canvas
        await evalJs(`document.getElementById('anonMask8WayCanvas')?.remove()`);

        // -------------------------------------------------------------
        // SHOT 2: SMOKY AURA CHAT BUBBLE
        // -------------------------------------------------------------
        console.log("2. Testing Smoky Aura Speech Bubble...");
        await evalJs(`
            (() => {
                const allKeys = Object.keys(window.players || {});
                const pId = allKeys[0] || window.myId || (window.socket && window.socket.id);
                console.log('Player ID for chat bubble:', pId, 'allKeys:', allKeys);
                if (window.myAvatar) {
                    window.myAvatar.anonMaskExpiresAt = Date.now() + 1800000;
                    window.myAnonMaskExpiresAt = Date.now() + 1800000;
                }
                if (pId && window.players && window.players[pId]) {
                    window.players[pId].anonMaskExpiresAt = Date.now() + 1800000;
                }
                if (!window.activeChatBubbles) window.activeChatBubbles = {};
                const bubbleObj = {
                    text: 'Gölgeler arasındayım... Kimliğimi asla öğrenemezsin!',
                    name: '???',
                    isAnon: true,
                    channel: 'room',
                    createdAt: Date.now()
                };
                if (pId) window.activeChatBubbles[pId] = [bubbleObj];
                if (window.myId) window.activeChatBubbles[window.myId] = [bubbleObj];
                if (window.socket && window.socket.id) window.activeChatBubbles[window.socket.id] = [bubbleObj];
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        const shot2 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_anon_smoky_chat_bubble.png'), Buffer.from(shot2.data, 'base64'));
        console.log("✅ verified_anon_smoky_chat_bubble.png kaydedildi.");

        // -------------------------------------------------------------
        // SHOT 3: WHISPER INDICATOR
        // -------------------------------------------------------------
        console.log("3. Testing Whisper Indicator Bubble...");
        await evalJs(`
            (() => {
                const allKeys = Object.keys(window.players || {});
                const pId = allKeys[0] || window.myId || (window.socket && window.socket.id);
                const whisperObj = {
                    text: '🤫 Ahmet\\'e fısıldıyor...',
                    name: '???',
                    isAnon: true,
                    channel: 'whisper_indicator',
                    createdAt: Date.now()
                };
                if (pId) window.activeChatBubbles[pId] = [whisperObj];
                if (window.myId) window.activeChatBubbles[window.myId] = [whisperObj];
                if (window.socket && window.socket.id) window.activeChatBubbles[window.socket.id] = [whisperObj];
            })()
        `);
        await new Promise(r => setTimeout(r, 600));

        const shot3 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_whisper_indicators.png'), Buffer.from(shot3.data, 'base64'));
        console.log("✅ verified_whisper_indicators.png kaydedildi.");

        // Clear bubbles
        await evalJs(`(() => {
            const allKeys = Object.keys(window.players || {});
            const pId = allKeys[0] || window.myId || (window.socket && window.socket.id);
            if (window.activeChatBubbles) {
                if (pId) window.activeChatBubbles[pId] = [];
                if (window.myId) window.activeChatBubbles[window.myId] = [];
            }
        })()`);

        // -------------------------------------------------------------
        // SHOT 4: HAYALET PROFIL MODAL (GHOST PROFILE)
        // -------------------------------------------------------------
        console.log("4. Testing Hayalet Profil (Ghost Profile) Interaction Modal...");
        await dismissOverlays();
        await evalJs(`
            (() => {
                const targetPlayer = {
                    name: '???',
                    id: 'target_anon_sid',
                    isAnon: true,
                    anonMaskExpiresAt: Date.now() + 1800000,
                    skinColor: '#ffd1a4',
                    shirtColor: '#3b82f6',
                    shoes: 'sneakers',
                    facing: 'down',
                    gender: 'male',
                    model: 'classic_2'
                };
                if (typeof openPlayerInteractionModal === 'function') {
                    openPlayerInteractionModal('target_anon_sid', targetPlayer);
                }
                if (typeof handleProfileDetailsResult === 'function') {
                    handleProfileDetailsResult({
                        isAnon: true,
                        targetName: '???',
                        level: '🔒 Gizli',
                        totalXP: 0,
                        motto: '🎭 Kimliği gizlenmiş gizemli yabancı...',
                        badgeUnlockOrder: [],
                        gameStats: null
                    });
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 1000));

        const shot4 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_hayalet_profil_modal.png'), Buffer.from(shot4.data, 'base64'));
        console.log("✅ verified_hayalet_profil_modal.png kaydedildi.");

        // Close interaction modal
        await evalJs(`
            (() => {
                const pim = document.getElementById('playerInteractionModal');
                if (pim) pim.style.display = 'none';
            })()
        `);

        // -------------------------------------------------------------
        // SHOT 5: TEKİNSİZ TEKİN SHOP UI WITH ANON MASK (LEVEL 5 UNLOCKED)
        // -------------------------------------------------------------
        console.log("5. Testing Tekinsiz Tekin Shop UI with Anon Mask (Level 5)...");
        await dismissOverlays();
        await evalJs(`
            (() => {
                if (window.socket) {
                    window.socket.emit('adminAddXP', { targetUsername: '${testUser}', xp: 1200, secret: 'metaverse_test_dev' });
                    window.socket.emit('adminModifyMoney', { targetUsername: '${testUser}', amount: 50000, mode: 'set', secret: 'metaverse_test_dev' });
                    window.socket.emit('adminModifyDiamonds', { targetUsername: '${testUser}', amount: 20, mode: 'set', secret: 'metaverse_test_dev' });
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        await evalJs(`
            (() => {
                if (typeof openTekinsizTekinModal === 'function') {
                    openTekinsizTekinModal();
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        // Let's also purchase or simulate mask in bag
        await evalJs(`
            (() => {
                if (window.socket) {
                    window.socket.emit('buyShadyItem', { itemId: 'anon_mask' });
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 800));

        const shot5 = await send('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(ARTIFACT_DIR, 'verified_tekinsiz_tekin_mask_shop.png'), Buffer.from(shot5.data, 'base64'));
        console.log("✅ verified_tekinsiz_tekin_mask_shop.png kaydedildi.");

        console.log("\n🎉 ALL SCREENSHOTS SUCCESSFULLY CAPTURED & SAVED! 📸✨");
    } finally {
        try { proc.kill('SIGKILL'); } catch (e) {}
        try { fs.rmSync(tempUserData, { recursive: true, force: true }); } catch (e) {}
    }
}

captureAnonVisuals().catch(err => {
    console.error("❌ Visual capture failed:", err);
    process.exit(1);
});
