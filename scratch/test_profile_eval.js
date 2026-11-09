const { spawn } = require('child_process');
const WebSocket = require('ws');

async function test() {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const cdpPort = 9325;
    const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_profile_' + Date.now();
    const p = spawn(edgePath, [
        '--remote-debugging-port=' + cdpPort,
        '--headless=new',
        '--user-data-dir=' + tempProfile,
        'http://localhost:3000'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    const tabs = await fetch('http://127.0.0.1:' + cdpPort + '/json/list').then(r => r.json());
    const tab = tabs.find(t => t.url.includes('localhost:3000'));
    const ws = new WebSocket(tab.webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    function send(m, params = {}) {
        return new Promise(res => {
            const curId = id++;
            const h = (d) => {
                const parsed = JSON.parse(d);
                if (parsed.id === curId) { ws.off('message', h); res(parsed.result); }
            };
            ws.on('message', h);
            ws.send(JSON.stringify({ id: curId, method: m, params }));
        });
    }

    async function evalJs(expr) {
        const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
        return r?.result?.value;
    }

    // Register user
    const uname = 'TestUser_' + Math.floor(Math.random() * 89999 + 10000);
    await evalJs(`
        (() => {
            switchAuthTab('register');
            document.getElementById('regUsernameInput').value = '${uname}';
            document.getElementById('regPasswordInput').value = '123456';
            document.getElementById('regPasswordConfirmInput').value = '123456';
            attemptRegister();
        })()
    `);

    await new Promise(r => setTimeout(r, 1200));

    // Now call openMyPlayerProfile and catch error
    const profileRes = await evalJs(`
        (() => {
            try {
                const selfPBefore = (typeof myId !== 'undefined' && myId && typeof players !== 'undefined' && players && players[myId]) ? players[myId] : null;
                const unameBefore = (typeof window.myUsername !== 'undefined' && window.myUsername) ? window.myUsername : (typeof myUsername !== 'undefined' ? myUsername : '');
                const myIdVal = typeof myId !== 'undefined' ? myId : null;
                const playersKeys = typeof players !== 'undefined' ? Object.keys(players) : null;
                const currentRoomVal = typeof currentRoom !== 'undefined' ? currentRoom : null;
                
                openMyPlayerProfile();
                const modal = document.getElementById('playerInteractionModal');
                const grid = document.getElementById('profileBadgesGrid');
                return {
                    success: true,
                    selfPBefore,
                    unameBefore,
                    myIdVal,
                    playersKeys,
                    currentRoomVal,
                    modalDisplay: modal ? modal.style.display : 'no modal',
                    gridChildren: grid ? grid.children.length : 'no grid',
                    gridHtml: grid ? grid.innerHTML.slice(0, 200) : ''
                };
            } catch(e) {
                return { error: e.message, stack: e.stack };
            }
        })()
    `);

    console.log('Profile result:', profileRes);
    p.kill('SIGKILL');
}
test();
