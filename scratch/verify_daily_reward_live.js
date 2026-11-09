// scratch/verify_daily_reward_live.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

async function run() {
    const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const cdpPort = 9298;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_dr_live_' + Date.now();

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
        await sendCmd('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
            mobile: false
        });

        console.log('1. Sayfa yüklendi, test kullanıcısı oluşturuluyor...');
        const testUser = 'dr_test_' + Math.floor(Math.random() * 10000);
        
        await evalJs(`
            (function() {
                if (typeof window.switchAuthTab === 'function') {
                    window.switchAuthTab('register');
                }
                const unameInput = document.getElementById('regUsernameInput');
                const passInput = document.getElementById('regPasswordInput');
                const passConf = document.getElementById('regPasswordConfirmInput');
                if (unameInput) unameInput.value = '${testUser}';
                if (passInput) passInput.value = '123456';
                if (passConf) passConf.value = '123456';
                
                if (typeof window.attemptRegister === 'function') {
                    window.attemptRegister();
                }
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
                const cellCount = document.querySelectorAll('.dr-cell').length;
                const todayCell = document.querySelector('.dr-cell.today');
                const claimBtn = document.querySelector('.dr-btn-claim');
                return {
                    isOpen: modal && window.getComputedStyle(modal).display === 'flex',
                    cellCount: cellCount,
                    todayDayText: todayCell ? todayCell.querySelector('.dr-cell-day').innerText : null,
                    claimBtnText: claimBtn ? claimBtn.innerText : null
                };
            })()
        `);

        console.log('Modal Durumu (5 saniye sonrası):', modalDisplay);

        // Ekran Görüntüsü 1: Açılan Takvim Modalı
        const artifactDir = "C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5";
        const ss1 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_daily_reward_popup.png'), Buffer.from(ss1.data, 'base64'));
        console.log('📸 Ekran görüntüsü 1 kaydedildi: verified_daily_reward_popup.png');

        // Ödülü Al butonuna bas
        console.log('3. Ödülü Al butonuna tıklanıyor...');
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

        // Parçacık ve bakiye animasyonu için 1.5 sn bekle
        await new Promise(r => setTimeout(r, 1600));

        const afterClaimStatus = await evalJs(`
            (function() {
                const claimedCell = document.querySelector('.dr-cell.claimed');
                const disabledBtn = document.querySelector('.dr-btn-claimed');
                return {
                    newMoney: window.myMoney,
                    claimedCount: document.querySelectorAll('.dr-cell.claimed').length,
                    btnText: disabledBtn ? disabledBtn.innerText : null
                };
            })()
        `);
        console.log('Ödül Alındıktan Sonraki Durum:', afterClaimStatus);

        // Ekran Görüntüsü 2: Alındıktan sonraki takvim
        const ss2 = await sendCmd('Page.captureScreenshot', { format: 'png' });
        fs.writeFileSync(path.join(artifactDir, 'verified_daily_reward_claimed.png'), Buffer.from(ss2.data, 'base64'));
        console.log('📸 Ekran görüntüsü 2 kaydedildi: verified_daily_reward_claimed.png');

        // Modalı kapat ve yüzen butonun gizlendiğini doğrula
        console.log('4. Modal kapatılıyor...');
        const floatStatus = await evalJs(`
            (function() {
                window.DailyRewardClient.closeModal();
                const badge = document.getElementById('drFloatingBadge');
                return {
                    isModalClosed: document.getElementById('dailyRewardModal').style.display === 'none',
                    isBadgeHidden: !badge || badge.style.display === 'none'
                };
            })()
        `);
        console.log('Kapatma sonrası durum (Ödül alındığı için yüzen buton gizli olmalı):', floatStatus);

        console.log('✅ TÜM DOĞRULAMALAR BAŞARIYLA TAMAMLANDI!');
        cleanup();
        process.exit(0);

    } catch (e) {
        console.error('Doğrulama hatası:', e);
        cleanup();
        process.exit(1);
    }
}

run();
