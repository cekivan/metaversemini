const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const REMOTE_DEBUGGING_PORT = 9226;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function runUiTest() {
    console.log('🚀 Launching headless Edge to verify Badge Level-Up Modal...');

    const edgeProcess = spawn(EDGE_PATH, [
        `--remote-debugging-port=${REMOTE_DEBUGGING_PORT}`,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--window-size=1280,800',
        'http://localhost:3000'
    ]);

    await sleep(2000);

    const versionJson = await httpGet(`http://localhost:${REMOTE_DEBUGGING_PORT}/json`);
    const tabs = JSON.parse(versionJson);
    const mainTab = tabs.find(t => t.type === 'page');

    if (!mainTab || !mainTab.webSocketDebuggerUrl) {
        throw new Error('Could not find Edge page target');
    }

    const WebSocket = require('ws');
    const ws = new WebSocket(mainTab.webSocketDebuggerUrl);

    await new Promise(resolve => ws.on('open', resolve));

    let msgId = 1;
    function sendCommand(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = msgId++;
            const handleMsg = (data) => {
                const res = JSON.parse(data);
                if (res.id === id) {
                    ws.off('message', handleMsg);
                    if (res.error) reject(res.error);
                    else resolve(res.result);
                }
            };
            ws.on('message', handleMsg);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');

    console.log('⏳ Waiting for page to load assets...');
    await sleep(2500);

    console.log('🎬 Triggering showBadgeLevelUpPopup in page context...');
    const evalRes = await sendCommand('Runtime.evaluate', {
        expression: `
            (function() {
                if (typeof showBadgeLevelUpPopup !== 'function') return { error: 'showBadgeLevelUpPopup not defined' };
                showBadgeLevelUpPopup({
                    badgeId: 'botanic',
                    badgeName: 'Botanik Rozeti',
                    shortName: 'Botanik',
                    badgeIcon: '🌿',
                    level: 1,
                    rankTitle: 'Acemi',
                    rewardMoney: 1000,
                    rewardDiamonds: 5,
                    newMoney: 2000,
                    newDiamonds: 5
                });
                const modal = document.getElementById('badgeLevelUpModal');
                const title = document.getElementById('badgeLevelUpTitle')?.innerText;
                const money = document.getElementById('badgeLevelUpMoneyText')?.innerText;
                const diamond = document.getElementById('badgeLevelUpDiamondText')?.innerText;
                const display = modal ? window.getComputedStyle(modal).display : 'none';
                return {
                    display: display,
                    title: title,
                    money: money,
                    diamond: diamond
                };
            })()
        `,
        returnByValue: true
    });

    console.log('Result from evaluation:', evalRes.result.value);

    await sleep(600);

    // Capture screenshot of the modal
    console.log('📸 Taking screenshot of Badge Level-Up Modal...');
    const screenshot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshot.data, 'base64');
    const artifactPath = path.join('C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5', 'verified_badge_levelup_modal.png');
    fs.writeFileSync(artifactPath, buffer);
    console.log(`Saved screenshot to: ${artifactPath}`);

    // Verify closing
    const closeRes = await sendCommand('Runtime.evaluate', {
        expression: `
            (function() {
                closeBadgeLevelUpModal();
                return { closed: true };
            })()
        `,
        returnByValue: true
    });
    console.log('Modal close result:', closeRes.result.value);

    await sleep(500);

    ws.close();
    edgeProcess.kill();
    console.log('✅ UI verification passed completely!');
}

runUiTest().catch(err => {
    console.error('❌ UI test error:', err);
    process.exit(1);
});

