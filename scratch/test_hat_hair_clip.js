const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("=== TESTING HAT HAIR CLIPPING PROTOTYPE ===");

const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Hat Hair Clip Test</title>
<style>
  body { background: #1e1e2e; color: #fff; font-family: sans-serif; padding: 20px; }
  h2 { margin: 10px 0; color: #38bdf8; }
  .grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 25px; }
  .card { background: #2a2b3d; padding: 10px; border-radius: 8px; text-align: center; border: 1px solid #444; }
  canvas { background: #f1f5f9; border-radius: 6px; }
  .label { font-size: 11px; font-weight: bold; margin-top: 5px; color: #cbd5e1; }
</style>
</head>
<body>
<h1>Karakter 2: Baret & Şapka Saç Kırpma (Hair Clipping) Testi</h1>

<h2>1. Kullanıcının Bildirdiği Hata: Profil Açıda Anime Spiky + Beyaz Baret</h2>
<div class="grid">
  <div class="card">
    <canvas id="cv_current" width="160" height="220"></canvas>
    <div class="label" style="color: #ef4444;">Eski Hatalı (Taşan Saçlar)</div>
  </div>
  <div class="card">
    <canvas id="cv_fixed" width="160" height="220"></canvas>
    <div class="label" style="color: #10b981;">Yeni Düzeltilmiş (Kusursuz Kırpma)</div>
  </div>
</div>

<h2>2. Anime Spiky Saç - 8 İzometrik Yön (Beyaz Baret ile)</h2>
<div class="grid" id="anime_8way"></div>

<h2>3. Kadın Uzun Saç (Wavy Shoulder) - 8 İzometrik Yön (Sarı Baret ile)</h2>
<div class="grid" id="female_8way"></div>

<h2>4. Yüksek/Vahşi Saçlar (Flaming Fire, Messy Bun, Pompadour)</h2>
<div class="grid" id="wild_hairs"></div>

<!-- Load scripts -->
<script src="/js/renderers/k2/k2Head.js"></script>
<script src="/js/renderers/k2/k2Body.js"></script>
<script src="/js/renderers/k2/k2Renderer.js"></script>

<script>
window.onload = function() {
    // Test helper to render avatar
    function renderTest(canvasId, p, facing) {
        const cv = document.getElementById(canvasId);
        if (!cv) return;
        const ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.save();
        ctx.translate(cv.width / 2, cv.height / 2 + 25);
        ctx.scale(2.4, 2.4);
        if (typeof Karakter2Renderer !== 'undefined') {
            Karakter2Renderer.draw(ctx, 0, 0, p, facing, false, 0, 0, false, false);
        }
        ctx.restore();
    }

    const testUser = {
        model: 'karakter_2',
        gender: 'male',
        skinColor: '#ffd1a4',
        shirtColor: '#0f172a',
        pants: 'pants_classic_jeans',
        shoes: 'sneakers',
        hair: 'hair_k2_anime_spiky',
        hairColor: '#26150b',
        hat: 'baret_beyaz'
    };

    // 1. Current vs Fixed
    renderTest('cv_fixed', testUser, 'right');

    // 2. Anime 8-way
    const directions = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
    const animeGrid = document.getElementById('anime_8way');
    directions.forEach((dir, i) => {
        const id = 'anime_dir_' + i;
        animeGrid.innerHTML += '<div class="card"><canvas id="' + id + '" width="120" height="170"></canvas><div class="label">' + dir + '</div></div>';
    });
    setTimeout(() => {
        directions.forEach((dir, i) => {
            renderTest('anime_dir_' + i, testUser, dir);
        });
    }, 100);

    // 3. Female 8-way
    const femaleUser = {
        model: 'karakter_2',
        gender: 'female',
        skinColor: '#ffd1a4',
        shirtColor: '#ec4899',
        pants: 'pants_classic_jeans',
        shoes: 'sneakers',
        hair: 'hair_k2_wavy_shoulder',
        hairColor: '#78350f',
        hat: 'baret_sari'
    };
    const femaleGrid = document.getElementById('female_8way');
    directions.forEach((dir, i) => {
        const id = 'female_dir_' + i;
        femaleGrid.innerHTML += '<div class="card"><canvas id="' + id + '" width="120" height="170"></canvas><div class="label">' + dir + '</div></div>';
    });
    setTimeout(() => {
        directions.forEach((dir, i) => {
            renderTest('female_dir_' + i, femaleUser, dir);
        });
    }, 100);

    // 4. Wild hairs
    const wildGrid = document.getElementById('wild_hairs');
    const wildConfigs = [
        { name: 'Flaming Fire + Baret', hair: 'hair_k2_flaming_fire', hat: 'baret_kirmizi', facing: 'right' },
        { name: 'Messy Bun + Baret', hair: 'hair_k2_messy_bun', hat: 'baret_mavi', facing: 'right' },
        { name: 'Fade Pompadour + Baret', hair: 'hair_k2_fade_pompadour', hat: 'baret_turuncu', facing: 'right' },
        { name: 'Ponytail + Baret', hair: 'hair_k2_ponytail', hat: 'baret_yesil', facing: 'right' }
    ];
    wildConfigs.forEach((cfg, i) => {
        const id = 'wild_' + i;
        wildGrid.innerHTML += '<div class="card"><canvas id="' + id + '" width="130" height="180"></canvas><div class="label">' + cfg.name + '</div></div>';
    });
    setTimeout(() => {
        wildConfigs.forEach((cfg, i) => {
            renderTest('wild_' + i, {
                model: 'karakter_2',
                gender: 'male',
                skinColor: '#ffd1a4',
                shirtColor: '#2563eb',
                pants: 'pants_classic_jeans',
                shoes: 'sneakers',
                hair: cfg.hair,
                hairColor: '#3b2219',
                hat: cfg.hat
            }, cfg.facing);
        });
    }, 100);
};
</script>
</body>
</html>`;

fs.writeFileSync(path.join('public', 'test_hat_hair.html'), htmlContent);
console.log("Written public/test_hat_hair.html");

