const { execSync } = require('child_process');
const path = require('path');

const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outImg = path.resolve("C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_hair_clipping_fixed.png");
const url = "http://localhost:3000/test_hat_hair.html?v=" + Date.now();

console.log("Capturing screenshot of:", url);
const cmd = `"${edgePath}" --headless=new --screenshot="${outImg}" --window-size=1200,1050 --virtual-time-budget=2500 "${url}"`;
try {
    execSync(cmd, { stdio: 'inherit' });
    console.log("Screenshot successfully saved to:", outImg);
} catch (err) {
    console.error("Capture failed:", err.message);
}
