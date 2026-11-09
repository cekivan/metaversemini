// scratch/test_badge_state.js
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');

async function test() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const cdpPort = 9345;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_badge_' + Date.now();

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

    await new Promise(r => setTimeout(r, 2000));
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
            console.error('JS Exception:', res.exceptionDetails);
        }
        return res && res.result ? res.result.value : null;
    }

    await new Promise(r => setTimeout(r, 1500));

    // Inspect script tags loaded on the page
    const scripts = await evaluate(`
        Array.from(document.querySelectorAll('script')).map(s => s.src).filter(s => s.includes('badge') || s.includes('social'))
    `);
    console.log('Loaded scripts:', scripts);

    // Test renderProfileSquareBadges
    const badgeHtml = await evaluate(`
        (function() {
            window.myUsername = 'testUser';
            const modal = document.getElementById('playerInteractionModal');
            if (modal) modal.style.display = 'flex';
            const modalBox = document.getElementById('playerInteractionModalBox');
            if (modalBox) {
                modalBox.style.position = 'relative';
                modalBox.style.margin = 'auto';
            }
            window.renderProfileSquareBadges({
                level: 1,
                totalXP: 5,
                currentProgress: 5,
                targetXP: 20,
                fishCaughtCount: 1,
                minedRocksCount: 1,
                gamerGamesCount: 0,
                botanicHarvestCount: 0,
                badgeUnlockOrder: ['resident', 'mining', 'fishing']
            }, true);
            const grid = document.getElementById('profileBadgesGrid');
            return grid ? grid.innerHTML : 'no grid';
        })()
    `);
    console.log('Badge HTML:\n', badgeHtml);

    // Now test tooltip for slot 0
    const tipHtml = await evaluate(`
        (function() {
            window.showProfileBadgeTooltip(0, document.getElementById('profileBadgeSquare_0'));
            const tip = document.getElementById('profileBadgeFloatingTooltip');
            return tip ? tip.innerHTML : 'no tip';
        })()
    `);
    console.log('Tooltip HTML for Slot 0:\n', tipHtml);

    // Hide tooltip first to capture clean modal grid
    await evaluate(`window.hideProfileBadgeTooltip(0)`);
    await new Promise(r => setTimeout(r, 200));

    // Capture clean modal with badge grid
    console.log('Capturing clean modal screenshot...');
    const modalBox = await evaluate(`
        (function() {
            const el = document.getElementById('playerInteractionModalBox');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
        })()
    `);

    const cleanRes = await sendCmd('Page.captureScreenshot', {
        format: 'png',
        clip: modalBox ? {
            x: Math.max(0, Math.floor(modalBox.x)),
            y: Math.max(0, Math.floor(modalBox.y)),
            width: Math.ceil(modalBox.width),
            height: Math.ceil(modalBox.height),
            scale: 1
        } : undefined
    });

    if (cleanRes && cleanRes.data) {
        const outClean = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_clean_badge_grid_huge_number.png';
        fs.writeFileSync(outClean, Buffer.from(cleanRes.data, 'base64'));
        console.log('Saved clean modal screenshot to:', outClean);
    }

    // Now show tooltip for slot 0 and capture tooltip specifically
    await evaluate(`
        window.showProfileBadgeTooltip(0, document.getElementById('profileBadgeSquare_0'));
    `);
    await new Promise(r => setTimeout(r, 200));

    const tipRes = await sendCmd('Page.captureScreenshot', {
        format: 'png',
        clip: modalBox ? {
            x: Math.max(0, Math.floor(modalBox.x)),
            y: Math.max(0, Math.floor(modalBox.y)),
            width: Math.ceil(modalBox.width),
            height: Math.ceil(modalBox.height),
            scale: 1
        } : undefined
    });

    if (tipRes && tipRes.data) {
        const outTip = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5\\verified_modal_with_level_tooltip.png';
        fs.writeFileSync(outTip, Buffer.from(tipRes.data, 'base64'));
        console.log('Saved tooltip modal screenshot to:', outTip);
    }

    cleanup();
}
test().catch(console.error);
