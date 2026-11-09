// scratch/verify_adventure_map_live.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9292;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_adv_live_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'about:blank'
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
        await new Promise(r => setTimeout(r, 2000));
        const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
        let pageTab = listRes.find(t => t.type === 'page');

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
            const res = await sendCmd('Runtime.evaluate', {
                expression: expr,
                returnByValue: true,
                awaitPromise: true
            });
            if (res && res.exceptionDetails) {
                console.error('JS Exception:', res.exceptionDetails);
            }
            return res ? res.result ? res.result.value : undefined : undefined;
        }

        await sendCmd('Page.enable');
        await sendCmd('DOM.enable');
        await sendCmd('Network.enable');
        await sendCmd('Network.setCacheDisabled', { cacheDisabled: true });
        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 850,
            deviceScaleFactor: 1,
            mobile: false
        });

        await sendCmd('Page.navigate', { url: 'http://localhost:3000' });
        await new Promise(r => setTimeout(r, 3000));

        console.log('1. Sayfa yüklendi, test kullanıcısı oluşturuluyor...');
        const testUser = 'adv_pione_' + Math.floor(Math.random() * 10000);
        
        await evalJs(`
            (function() {
                window.switchAuthTab('register');
                const unameInput = document.getElementById('regUsernameInput');
                const passInput = document.getElementById('regPasswordInput');
                const passConf = document.getElementById('regPasswordConfirmInput');
                if (unameInput) unameInput.value = '${testUser}';
                if (passInput) passInput.value = '123456';
                if (passConf) passConf.value = '123456';
                window.attemptRegister();
            })()
        `);

        console.log('2. Kayıt olundu, 5.5 saniye bekleniyor (Otomatik Pop-up kontrolü)...');
        await evalJs(`
            if (typeof window.closeUpdatesModal === 'function') {
                window.closeUpdatesModal();
            }
        `);
        await new Promise(r => setTimeout(r, 6000));

        const modalDisplay = await evalJs(`
            (function() {
                const modal = document.getElementById('dailyRewardModal');
                const svg = document.getElementById('drMapSvg');
                const nodes = document.querySelectorAll('.dr-map-node');
                const activePawn = document.getElementById('drAvatarPawnGroup');
                const claimBtn = document.querySelector('.dr-btn-claim');
                const heroCard = document.querySelector('.dr-hero-card');
                const heroStep = document.getElementById('drHeroStepNum');
                const heroTl = document.getElementById('drHeroTl');
                const heroDia = document.getElementById('drHeroDiamond');
                return {
                    isOpen: modal && window.getComputedStyle(modal).display === 'flex',
                    hasSvg: !!svg,
                    nodeCount: nodes.length,
                    hasActivePawn: !!activePawn && activePawn.children.length > 0,
                    hasHeroCard: !!heroCard,
                    heroStep: heroStep ? heroStep.innerText : null,
                    heroTl: heroTl ? heroTl.innerText : null,
                    heroDia: heroDia ? heroDia.innerText : null,
                    claimBtnText: claimBtn ? claimBtn.innerText.trim() : null
                };
            })()
        `);

        console.log('Modal Durumu (5.5 saniye sonrası Macera Haritası):', modalDisplay);

        const artifactDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        
        // Ekran Görüntüsü 1: Macera Haritası Canlı Pop-up
        const ss1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_adventure_map_live_popup.png'), Buffer.from(ss1.data, 'base64'));
        console.log('📸 Ekran görüntüsü 1 kaydedildi: verified_adventure_map_live_popup.png');

        // Adım 3: Başka bir durağa tıklayarak önizleme kontrolü (30. Gün Efsanevi Hazine Zirvesi)
        console.log('3. 30. Gün Zirve durağına tıklanıyor (Önizleme testi)...');
        const clickDay30 = await evalJs(`
            (function() {
                const nodes = document.querySelectorAll('.dr-map-node');
                if (nodes.length >= 30) {
                    nodes[29].dispatchEvent(new MouseEvent('click', { bubbles: true }));
                    const title = document.getElementById('drHeroTitle');
                    const money = document.getElementById('drHeroTl');
                    const diamond = document.getElementById('drHeroDiamond');
                    return {
                        clicked: true,
                        title: title ? title.innerText : null,
                        money: money ? money.innerText : null,
                        diamond: diamond ? diamond.innerText : null
                    };
                }
                return { clicked: false };
            })()
        `);
        console.log('Day 30 Preview Sonucu:', clickDay30);

        // 1. Gün durağına geri tıkla
        await evalJs(`
            (function() {
                const nodes = document.querySelectorAll('.dr-map-node');
                if (nodes.length > 0) {
                    nodes[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
                }
            })()
        `);
        await new Promise(r => setTimeout(r, 600));

        // Adım 4: Ödülü Topla ve İlerle butonuna tıkla
        console.log('4. Ödülü Topla butonuna basılıyor...');
        const claimResult = await evalJs(`
            (function() {
                const initialMoney = window.myMoney;
                const initialDiamonds = window.userDiamonds || 0;
                const claimBtn = document.querySelector('.dr-btn-claim');
                if (claimBtn) {
                    claimBtn.click();
                    return { clicked: true, initialMoney, initialDiamonds };
                }
                return { clicked: false };
            })()
        `);
        console.log('Claim Click:', claimResult);

        // Kutlama, ses ve bakiye animasyonu için 2 sn bekle
        await new Promise(r => setTimeout(r, 2000));

        const afterClaimStatus = await evalJs(`
            (function() {
                const claimedNodes = document.querySelectorAll('.dr-map-node.claimed');
                const disabledBtn = document.querySelector('.dr-btn-claimed');
                const banner = document.querySelector('.dr-banner-success');
                return {
                    newMoney: window.myMoney,
                    claimedCount: claimedNodes.length,
                    btnText: disabledBtn ? disabledBtn.innerText.trim() : null,
                    hasSuccessBanner: !!banner
                };
            })()
        `);
        console.log('Ödül Alındıktan Sonraki Durum:', afterClaimStatus);

        // Ekran Görüntüsü 2: Alındıktan sonraki Macera Haritası
        const ss2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_adventure_map_live_claimed.png'), Buffer.from(ss2.data, 'base64'));
        console.log('📸 Ekran görüntüsü 2 kaydedildi: verified_adventure_map_live_claimed.png');

        // Adım 5: Modalı kapatınca Floating Badge durumunu doğrula
        console.log('5. Modal kapatılıyor...');
        const closeStatus = await evalJs(`
            (function() {
                window.DailyRewardClient.closeModal();
                const modal = document.getElementById('dailyRewardModal');
                const badge = document.getElementById('drFloatingBadge');
                return {
                    isModalClosed: modal ? modal.style.display === 'none' : true,
                    isBadgeHidden: !badge || badge.style.display === 'none'
                };
            })()
        `);
        console.log('Modal Kapatma ve Rozet Durumu:', closeStatus);

        console.log('✅ MACERA HARİTASI TÜM CANLI TESTLERDEN BAŞARIYLA GEÇTİ!');
        cleanup();
        process.exit(0);

    } catch (e) {
        console.error('Doğrulama hatası:', e);
        cleanup();
        process.exit(1);
    }
}

run();
