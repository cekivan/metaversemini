const fs = require('fs');
const http = require('http');
const path = require('path');
const { spawn } = require('child_process');

async function verifyBetaSinglePage() {
    console.log("Starting Edge for Beta v1.4 single-page summary modal verification...");
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const tempUserData = 'C:\\Users\\WIN11\\AppData\\Local\\Temp\\edge_beta_single_' + Date.now();
    const port = 9278;

    const proc = spawn(edgePath, [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        '--no-first-run',
        '--no-default-browser-check',
        `--user-data-dir=${tempUserData}`,
        'about:blank'
    ]);

    await new Promise(r => setTimeout(r, 1600));

    try {
        const listData = await new Promise((resolve, reject) => {
            http.get(`http://127.0.0.1:${port}/json/list`, res => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            }).on('error', reject);
        });

        const pageWsUrl = listData[0].webSocketDebuggerUrl;
        const WebSocket = require('c:\\Users\\WIN11\\Desktop\\metaversemini\\node_modules\\ws');
        const ws = new WebSocket(pageWsUrl);
        await new Promise(r => ws.on('open', r));

        let msgId = 1;
        function send(method, params = {}) {
            return new Promise((resolve, reject) => {
                const id = msgId++;
                const handler = (data) => {
                    const parsed = JSON.parse(data);
                    if (parsed.id === id) {
                        ws.off('message', handler);
                        if (parsed.error) reject(parsed.error);
                        else resolve(parsed.result);
                    }
                };
                ws.on('message', handler);
                ws.send(JSON.stringify({ id, method, params }));
            });
        }

        await send('Page.enable');
        await send('Runtime.enable');
        await send('DOM.enable');

        await send('Emulation.setDeviceMetricsOverride', {
            width: 1280,
            height: 900,
            deviceScaleFactor: 1,
            mobile: false
        });

        console.log("Navigating to http://localhost:3000...");
        await send('Page.navigate', { url: 'http://localhost:3000' });
        
        // Wait until document.readyState is complete and updatesModal exists
        let ready = false;
        for (let i = 0; i < 20; i++) {
            await new Promise(r => setTimeout(r, 500));
            const check = await send('Runtime.evaluate', {
                expression: `!!document.getElementById('updatesModal')`
            });
            if (check.result && check.result.value === true) {
                ready = true;
                console.log(`DOM ready with updatesModal at attempt ${i + 1}`);
                break;
            }
        }

        if (!ready) {
            throw new Error("updatesModal did not appear in DOM within 10s");
        }

        // Open Beta Showcase Modal
        console.log("Triggering openBetaShowcaseModal()...");
        const openRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const modal = document.getElementById('updatesModal');
                    if (modal) {
                        modal.style.display = 'flex';
                        return { ok: true, msg: "Modal opened via flex" };
                    }
                    return { ok: false, msg: "modal element not found" };
                })()
            `,
            returnByValue: true
        });
        console.log("Open result:", openRes.result.value);

        await new Promise(r => setTimeout(r, 600));

        // Inspect modal structure
        const inspectRes = await send('Runtime.evaluate', {
            expression: `
                (function() {
                    const modal = document.getElementById('updatesModal');
                    const hasTabs = !!document.querySelector('.beta-tabs-nav');
                    const cards = Array.from(document.querySelectorAll('.beta-update-card')).map(c => ({
                        title: c.querySelector('.beta-card-title')?.innerText || '',
                        tag: c.querySelector('.beta-card-tag')?.innerText || '',
                        theme: Array.from(c.classList).filter(cl => cl.startsWith('theme-'))[0] || ''
                    }));
                    const footerBtn = document.querySelector('.beta-btn-start')?.innerText || '';
                    return {
                        isDisplayed: window.getComputedStyle(modal).display,
                        hasTabs,
                        cardCount: cards.length,
                        cards,
                        footerBtn
                    };
                })()
            `,
            returnByValue: true
        });

        console.log("Modal Inspection Summary:", JSON.stringify(inspectRes.result.value, null, 2));

        // Take full screenshot
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        const outDir = 'C:\\Users\\WIN11\\.gemini\\antigravity\\brain\\a42672a4-feaf-4dce-b597-7d8287cb2cc5';
        const outPath = path.join(outDir, 'verified_beta_v14_single_page.png');
        fs.writeFileSync(outPath, Buffer.from(screenshot.data, 'base64'));
        console.log("Saved primary screenshot to:", outPath);

        // Scroll down a bit in .beta-body to capture lower cards & footer
        await send('Runtime.evaluate', {
            expression: `
                const body = document.querySelector('.beta-body');
                if (body) body.scrollTop = 260;
            `
        });
        await new Promise(r => setTimeout(r, 400));
        const screenshotScrolled = await send('Page.captureScreenshot', { format: 'png' });
        const outPathScrolled = path.join(outDir, 'verified_beta_v14_single_page_scrolled.png');
        fs.writeFileSync(outPathScrolled, Buffer.from(screenshotScrolled.data, 'base64'));
        console.log("Saved scrolled screenshot to:", outPathScrolled);

        ws.close();
        console.log("Verification finished successfully!");
    } catch (err) {
        console.error("CDP error:", err);
    } finally {
        proc.kill();
        try {
            fs.rmSync(tempUserData, { recursive: true, force: true });
        } catch (e) {}
    }
}

verifyBetaSinglePage();
