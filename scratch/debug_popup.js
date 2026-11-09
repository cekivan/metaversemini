const WebSocket = require('ws');
const { spawn } = require('child_process');

async function test() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const cdpPort = 9295;
  const tempProfile = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_cdp_dbg_' + Date.now();

  const edgeProc = spawn(edgePath, [
    '--remote-debugging-port=' + cdpPort,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--user-data-dir=' + tempProfile,
    'http://localhost:3000'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:' + cdpPort + '/json/list').then(r => r.json());
  const pageTab = listRes.find(t => t.type === 'page');
  const ws = new WebSocket(pageTab.webSocketDebuggerUrl);
  await new Promise(r => ws.on('open', r));

  let msgId = 1;
  function sendCmd(method, params = {}) {
    return new Promise(res => {
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

  await sendCmd('Runtime.enable');
  ws.on('message', (d) => {
    const p = JSON.parse(d);
    if (p.method === 'Runtime.consoleAPICalled') {
      console.log('CONSOLE:', p.params.type, p.params.args.map(a => a.value || a.description));
    }
  });

  const res = await sendCmd('Runtime.evaluate', {
    expression: `
      (async function() {
        for (let i = 0; i < 50; i++) {
          if (typeof window.switchAuthTab === 'function' && typeof window.attemptRegister === 'function') break;
          await new Promise(r => setTimeout(r, 200));
        }
        if (typeof window.switchAuthTab !== 'function') {
          return { error: 'switchAuthTab still not defined', readyState: document.readyState };
        }
        window.switchAuthTab('register');
        const u = 'dbg_' + Math.floor(Math.random()*100000);
        document.getElementById('regUsernameInput').value = u;
        document.getElementById('regPasswordInput').value = '123456';
        document.getElementById('regPasswordConfirmInput').value = '123456';
        window.attemptRegister();
        await new Promise(r => setTimeout(r, 7000));
        return {
          modalDisplay: document.getElementById('dailyRewardModal') ? document.getElementById('dailyRewardModal').style.display : 'not found',
          computedDisplay: document.getElementById('dailyRewardModal') ? window.getComputedStyle(document.getElementById('dailyRewardModal')).display : 'none',
          dailyStatus: window.DailyRewardClient ? window.DailyRewardClient.getStatus() : 'no client',
          nodesInGroup: document.getElementById('drNodesGroup') ? document.getElementById('drNodesGroup').children.length : 0,
          pawnInGroup: document.getElementById('drAvatarPawnGroup') ? document.getElementById('drAvatarPawnGroup').children.length : 0,
          myId: window.myId,
          myMoney: window.myMoney
        };
      })()
    `,
    returnByValue: true,
    awaitPromise: true
  });

  console.log('Result:', JSON.stringify(res, null, 2));
  edgeProc.kill('SIGKILL');
  process.exit(0);
}
test();
