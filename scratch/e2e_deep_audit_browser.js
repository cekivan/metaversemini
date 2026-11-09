// scratch/e2e_deep_audit_browser.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function auditBrowser() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const cdpPort = 9360;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_audit_' + Date.now();

    const edgeProc = spawn(edgePath, [
        `--remote-debugging-port=${cdpPort}`,
        '--headless=new',
        '--disable-gpu',
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempProfile}`,
        'http://localhost:3000'
    ]);

    function cleanup() {
        try { edgeProc.kill('SIGKILL'); } catch (e) {}
        try { fs.rmSync(tempProfile, { recursive: true, force: true }); } catch (e) {}
    }
    process.on('exit', cleanup);

    await new Promise(r => setTimeout(r, 2500));
    const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`).then(r => r.json());
    let pageTab = listRes.find(t => t.type === 'page' && t.url.includes('localhost:3000')) || listRes[0];
    const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
    await new Promise(res => ws.on('open', res));

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

    async function evaluate(expr) {
        const res = await sendCmd('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        if (res && res.exceptionDetails) {
            console.error('Browser Exception Details:', res.exceptionDetails);
        }
        return res && res.result ? res.result.value : null;
    }

    const consoleLogs = [];
    const consoleErrors = [];

    // Enable console & runtime events
    await sendCmd('Console.enable');
    await sendCmd('Runtime.enable');
    await sendCmd('Log.enable');

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            if (msg.method === 'Runtime.consoleAPICalled') {
                const type = msg.params.type;
                const text = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
                if (type === 'error') {
                    consoleErrors.push({ type, text });
                } else {
                    consoleLogs.push({ type, text });
                }
            } else if (msg.method === 'Runtime.exceptionThrown') {
                consoleErrors.push({ type: 'EXCEPTION', text: msg.params.exceptionDetails.text, details: msg.params.exceptionDetails });
            }
        } catch (e) {}
    });

    console.log('Waiting for initial page scripts to initialize...');
    await new Promise(r => setTimeout(r, 2000));

    // 1. Check all costumes registered in AnimalCostumeRenderer
    const registeredCostumes = await evaluate(`
        (function() {
            if (typeof AnimalCostumeRenderer !== 'undefined' && AnimalCostumeRenderer.getAllRegisteredIds) {
                return AnimalCostumeRenderer.getAllRegisteredIds();
            }
            if (window.__animalCostumeModules) {
                return Object.keys(window.__animalCostumeModules);
            }
            return [];
        })()
    `);
    console.log('Registered Animal Costumes:', registeredCostumes);

    // 2. Check LevelClient status
    const levelClientStatus = await evaluate(`
        (function() {
            if (typeof window.LevelClient !== 'undefined') {
                return {
                    initialized: true,
                    currentLevel: window.LevelClient.currentLevel,
                    currentProgress: window.LevelClient.currentProgress,
                    targetXP: window.LevelClient.targetXP,
                    title: window.LevelClient.getLevelTitle(window.LevelClient.currentLevel)
                };
            }
            return { initialized: false };
        })()
    `);
    console.log('LevelClient Status:', levelClientStatus);

    // 3. Test Registration / Login as Audit User
    const testUsername = 'auditer_' + Math.floor(Math.random() * 90000 + 10000);
    console.log('Registering/logging in as:', testUsername);
    const loginResult = await evaluate(`
        new Promise((resolve) => {
            const socket = window.socket;
            if (!socket) return resolve({ success: false, reason: 'no_socket' });
            
            socket.emit('register', { name: '${testUsername}', pass: '123456', gender: 'male' });
            
            const timer = setTimeout(() => resolve({ success: false, reason: 'timeout' }), 4000);
            
            socket.once('loginSuccess', (data) => {
                clearTimeout(timer);
                resolve({ success: true, data });
            });
            socket.once('registerFailed', (err) => {
                clearTimeout(timer);
                resolve({ success: false, reason: err });
            });
        })
    `);
    console.log('Register/Login Result:', loginResult ? loginResult.success : 'failed');

    await new Promise(r => setTimeout(r, 1000));

    // 4. Test opening Profile Modal
    console.log('Testing Profile Modal open...');
    const profileModalRes = await evaluate(`
        (function() {
            if (typeof openMyPlayerProfile === 'function') {
                openMyPlayerProfile();
                const modal = document.getElementById('playerInteractionModal');
                const isVisible = modal && modal.style.display !== 'none';
                const grid = document.getElementById('profileBadgesGrid');
                const slot0 = document.getElementById('profileBadgeSquare_0');
                const numEl = slot0 ? slot0.querySelector('.badge-huge-level-number') : null;
                return {
                    modalVisible: isVisible,
                    slotCount: grid ? grid.children.length : 0,
                    slot0Number: numEl ? numEl.textContent.trim() : null,
                    slot0Class: slot0 ? slot0.className : null
                };
            }
            return { error: 'openMyPlayerProfile not found' };
        })()
    `);
    console.log('Profile Modal Result:', profileModalRes);

    // 5. Test Profile Badge Tooltip for Slot 0
    console.log('Testing Profile Badge Tooltip for Slot 0...');
    const tipRes = await evaluate(`
        (function() {
            const slot0 = document.getElementById('profileBadgeSquare_0');
            if (slot0 && typeof showProfileBadgeTooltip === 'function') {
                showProfileBadgeTooltip(0, slot0);
                const tip = document.getElementById('profileBadgeFloatingTooltip');
                const isVisible = tip && tip.style.display !== 'none';
                return {
                    tipVisible: isVisible,
                    tipText: tip ? tip.innerText : null
                };
            }
            return { error: 'showProfileBadgeTooltip or slot0 not found' };
        })()
    `);
    console.log('Tooltip Result:\n', tipRes);

    // 6. Test opening Level System Info Modal
    console.log('Testing Badge Level System Modal open...');
    const levelModalRes = await evaluate(`
        (function() {
            if (typeof openBadgeLevelSystemModal === 'function') {
                openBadgeLevelSystemModal();
                const modal = document.getElementById('badgeLevelSystemModal');
                return { modalVisible: modal && modal.style.display !== 'none' };
            }
            return { error: 'openBadgeLevelSystemModal not found' };
        })()
    `);
    console.log('Level System Modal Result:', levelModalRes);

    // 7. Test Wardrobe Modal
    console.log('Testing Wardrobe Modal open...');
    const wardrobeRes = await evaluate(`
        (function() {
            if (typeof openWardrobe === 'function') {
                openWardrobe();
                const modal = document.getElementById('wardrobeModal');
                return { modalVisible: modal && modal.style.display !== 'none' };
            }
            return { error: 'openWardrobe not found' };
        })()
    `);
    console.log('Wardrobe Result:', wardrobeRes);

    // 8. Test Item Inventory Modal
    console.log('Testing Item Inventory Modal open...');
    const itemInvRes = await evaluate(`
        (function() {
            if (typeof openItemInventoryModal === 'function') {
                openItemInventoryModal();
                const modal = document.getElementById('itemInventoryModal');
                return { modalVisible: modal && modal.style.display !== 'none' };
            }
            return { error: 'openItemInventoryModal not found' };
        })()
    `);
    console.log('Item Inventory Result:', itemInvRes);

    // 9. Test Pet Shop Modal
    console.log('Testing Pet Shop Modal open...');
    const petShopRes = await evaluate(`
        (function() {
            if (typeof openPetShopModal === 'function') {
                openPetShopModal();
                const modal = document.getElementById('petShopModal');
                return { modalVisible: modal && modal.style.display !== 'none' };
            }
            return { error: 'openPetShopModal not found' };
        })()
    `);
    console.log('Pet Shop Result:', petShopRes);

    // 10. Test Mining Shop Modal
    console.log('Testing Mining Shop Modal open...');
    const miningRes = await evaluate(`
        (function() {
            if (window.miningClient && typeof window.miningClient.openMiningShopModal === 'function') {
                window.miningClient.openMiningShopModal();
                const modal = document.getElementById('miningShopModal');
                return { modalVisible: modal && modal.style.display !== 'none' };
            }
            return { error: 'miningClient.openMiningShopModal not found' };
        })()
    `);
    console.log('Mining Shop Result:', miningRes);

    // 11. Test Botanic Supplier & Market Modals
    console.log('Testing Botanic Modals open...');
    const botanicRes = await evaluate(`
        (function() {
            let supplierOk = false;
            let marketOk = false;
            if (typeof openBotanicSupplierModal === 'function') {
                openBotanicSupplierModal();
                const m1 = document.getElementById('botanicSupplierModal');
                supplierOk = m1 && m1.style.display !== 'none';
            }
            if (typeof openBotanicMarketModal === 'function') {
                openBotanicMarketModal();
                const m2 = document.getElementById('botanicMarketModal');
                marketOk = m2 && m2.style.display !== 'none';
            }
            return { supplierModal: supplierOk, marketModal: marketOk };
        })()
    `);
    console.log('Botanic Result:', botanicRes);

    // 12. Check for any console errors during this whole sequence!
    await new Promise(r => setTimeout(r, 1000));
    console.log('\n--- Console Errors Encountered (' + consoleErrors.length + ') ---');
    if (consoleErrors.length > 0) {
        console.log(JSON.stringify(consoleErrors, null, 2));
    } else {
        console.log('Zero (0) console errors encountered during all modal interactions!');
    }

    cleanup();
}

auditBrowser().catch(err => {
    console.error('Audit failed with error:', err);
    process.exit(1);
});
