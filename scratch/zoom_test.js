const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { background: #333; display: flex; gap: 30px; align-items: center; justify-content: center; height: 100vh; margin: 0; }
  .box { text-align: center; color: white; font-family: sans-serif; }
  canvas { background: #f8fafc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
</style>
</head>
<body>
  <div class="box">
    <canvas id="c1" width="300" height="400"></canvas>
    <h3>Profil (Sağ - Right)</h3>
  </div>
  <div class="box">
    <canvas id="c2" width="300" height="400"></canvas>
    <h3>Profil (Sol - Left)</h3>
  </div>
  <div class="box">
    <canvas id="c3" width="300" height="400"></canvas>
    <h3>Ön (Front - Down)</h3>
  </div>
  <div class="box">
    <canvas id="c4" width="300" height="400"></canvas>
    <h3>Arka (Back - Up)</h3>
  </div>

<script src="js/renderers/karakter2Renderer.js"></script>
<script src="js/renderers/k2/k2Fx.js"></script>
<script src="js/renderers/k2/k2Limbs.js"></script>
<script src="js/renderers/k2/k2Torso.js"></script>
<script src="js/renderers/k2/k2Head.js"></script>

<script>
window.onload = function() {
    function drawBig(id, facing) {
        const cv = document.getElementById(id);
        const ctx = cv.getContext('2d');
        ctx.save();
        ctx.translate(cv.width / 2, cv.height / 2 + 35);
        ctx.scale(5.0, 5.0);
        Karakter2Renderer.draw(ctx, 0, 0, {
            model: 'karakter_2',
            gender: 'male',
            skinColor: '#ffd1a4',
            shirtColor: '#0f172a',
            pants: 'pants_classic_jeans',
            shoes: 'sneakers',
            hair: 'hair_k2_anime_spiky',
            hairColor: '#26150b',
            hat: 'baret_beyaz'
        }, facing, false, 0, 0, false, false);
        ctx.restore();
    }
    drawBig('c1', 'right');
    drawBig('c2', 'left');
    drawBig('c3', 'down');
    drawBig('c4', 'up');
};
</script>
</body>
</html>`;

fs.writeFileSync('public/test_big_profile.html', html);
const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const outImg = path.resolve("C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/verified_zoom_profile.png");
const cmd = `"${edgePath}" --headless=new --screenshot="${outImg}" --window-size=1400,600 --virtual-time-budget=2000 "http://localhost:3000/test_big_profile.html?v=${Date.now()}"`;
execSync(cmd, { stdio: 'inherit' });
console.log("High-res zoom saved to:", outImg);

