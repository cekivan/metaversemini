const { spawn } = require('child_process');
const WebSocket = require('ws');

async function test() {
    const p = spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', [
        '--remote-debugging-port=9327',
        '--headless=new',
        '--user-data-dir=C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_reg_' + Date.now(),
        'http://localhost:3000'
    ]);
    await new Promise(r => setTimeout(r, 2000));
    const tabs = await fetch('http://127.0.0.1:9327/json/list').then(r => r.json());
    const ws = new WebSocket(tabs[0].webSocketDebuggerUrl);
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

    const uniqueUname = 'BobHero' + Math.floor(Math.random() * 89999 + 10000);
    const res = await send('Runtime.evaluate', {
        expression: `(() => {
            if (typeof switchAuthTab === 'function') switchAuthTab('register');
            document.getElementById('regUsernameInput').value = '${uniqueUname}';
            document.getElementById('regPasswordInput').value = '123456';
            document.getElementById('regPasswordConfirmInput').value = '123456';
            if (typeof attemptRegister === 'function') attemptRegister();
            return document.getElementById('regError')?.innerText;
        })()`,
        returnByValue: true
    });
    console.log('RegError immediate:', res.result.value);
    await new Promise(r => setTimeout(r, 1500));
    const res2 = await send('Runtime.evaluate', {
        expression: `({
            regError: document.getElementById('regError')?.innerText,
            loginError: document.getElementById('loginError')?.innerText,
            loginDisp: document.getElementById('loginScreen')?.style.display,
            myId: typeof myId !== 'undefined' ? myId : null,
            myUsername: typeof myUsername !== 'undefined' ? myUsername : null
        })`,
        returnByValue: true
    });
    console.log('After 1.5s:', res2.result.value);
    p.kill('SIGKILL');
}
test();

