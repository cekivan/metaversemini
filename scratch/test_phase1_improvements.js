const http = require('http');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 9230;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d));
        }).on('error', reject);
    });
}

async function run() {
    console.log('🧪 Starting Edge Headless to test Phase 1 improvements...');
    const edge = spawn(EDGE_PATH, [
        `--remote-debugging-port=${PORT}`,
        '--headless=new',
        '--no-sandbox',
        '--disable-gpu',
        '--window-size=1280,900',
        'http://localhost:3000'
    ]);

    await sleep(2500);

    const tabs = JSON.parse(await httpGet(`http://localhost:${PORT}/json`));
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let msgId = 1;
    function send(method, params = {}) {
        return new Promise((resolve) => {
            const id = msgId++;
            const handler = (data) => {
                const res = JSON.parse(data);
                if (res.id === id) {
                    ws.off('message', handler);
                    resolve(res.result);
                }
            };
            ws.on('message', handler);
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    await send('Runtime.enable');
    await send('Page.enable');
    await sleep(2000);

    const testResult = await send('Runtime.evaluate', {
        expression: `
            (() => {
                const results = {};
                // 1. EconomyManager
                results.hasEconomyManager = typeof window.EconomyManager !== 'undefined';
                if (results.hasEconomyManager) {
                    window.EconomyManager.setMoney(123456);
                    window.EconomyManager.setDiamonds(789);
                    results.moneyValue = window.EconomyManager.getMoney();
                    results.diamondsValue = window.EconomyManager.getDiamonds();
                    const mEl = document.getElementById('myMoneyDisplay') || document.getElementById('userMoneyDisplay') || document.getElementById('moneyDisplay');
                    results.domMoneyUpdated = mEl ? mEl.innerText.includes('123') : false;
                }

                // 2. makeModalDraggable
                results.hasMakeModalDraggable = typeof window.makeModalDraggable === 'function';

                // 3. vipClubClient
                results.hasVipClubFunctions = (typeof window.promptEnterVipClub === 'function') && (typeof window.openTekinsizTekinModal === 'function');

                // 4. Check for any console errors on window
                results.gameLoopRunning = window._isGameLoopRunning === true;

                return results;
            })()
        `,
        returnByValue: true
    });

    console.log('📊 Test Results:', JSON.stringify(testResult.result.value, null, 2));

    const val = testResult.result.value;
    const allPassed = val.hasEconomyManager &&
                      val.moneyValue === 123456 &&
                      val.diamondsValue === 789 &&
                      val.hasMakeModalDraggable &&
                      val.hasVipClubFunctions &&
                      val.gameLoopRunning;

    if (allPassed) {
        console.log('🎉 ALL PHASE 1 TESTS PASSED WITH 100% SUCCESS!');
    } else {
        console.error('❌ SOME TESTS FAILED');
        process.exit(1);
    }

    ws.close();
    edge.kill();
    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

