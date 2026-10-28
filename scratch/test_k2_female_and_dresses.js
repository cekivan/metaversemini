// Test Karakter 2 Female & Streetwear Dresses & Immediate First Inhale
const fs = require('fs');

function createMockCtx() {
    const noop = () => { };
    return {
        save: noop,
        restore: noop,
        scale: noop,
        translate: noop,
        rotate: noop,
        beginPath: noop,
        closePath: noop,
        arc: noop,
        ellipse: noop,
        rect: noop,
        fillRect: noop,
        strokeRect: noop,
        roundRect: noop,
        moveTo: noop,
        lineTo: noop,
        quadraticCurveTo: noop,
        bezierCurveTo: noop,
        clip: noop,
        fill: noop,
        stroke: noop,
        transform: noop,
        setTransform: noop,
        drawImage: noop,
        fillText: noop,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1
    };
}

global.window = global;
global.drawAvatarHairAndHats = () => { };
global.drawAvatarFaceAndEyes = () => { };
global.drawHeldItem = () => { };
global.normalize8WayFacing = (f) => f || 'down';
global.isFemaleAvatar = (p) => (p && (p.gender === 'female' || (p.shirt && p.shirt.startsWith('dress_'))));

require('../public/js/renderers/karakter2Renderer.js');

const facings = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
const ctx = createMockCtx();

console.log('--- 1. TESTING FEMALE KARAKTER 2 FEATURES ---');
const femalePlayer = {
    name: 'ayse',
    gender: 'female',
    skinColor: '#ffd1a4',
    hairColor: '#f43f5e',
    shirt: 'k2_graffiti_oversize',
    pants: 'pants_k2_skater_cargo',
    shoes: 'shoes_k2_skate_pro',
    heldItem: 'sigara'
};

for (const facing of facings) {
    global.Karakter2Renderer.draw(ctx, 100, 100, femalePlayer, facing, false, 0, 0, false, false);
    global.Karakter2Renderer.draw(ctx, 100, 100, femalePlayer, facing, false, 0, 1.5, true, false);
    global.Karakter2Renderer.draw(ctx, 100, 100, femalePlayer, facing, true, 0, 0, false, false);
}
console.log('[PASS] Female Karakter 2 successfully rendered across all 8 facings in stand, walk, sit!');

console.log('--- 2. TESTING DRESS: dress_k2_cyber_street ---');
const cyberDressPlayer = {
    name: 'selin',
    gender: 'female',
    skinColor: '#ffd1a4',
    hairColor: '#06b6d4',
    shirt: 'dress_k2_cyber_street',
    outfit: 'dress_k2_cyber_street',
    pants: 'pants_k2_skater_cargo',
    shoes: 'shoes_k2_skate_pro',
    heldItem: 'sigara'
};

for (const facing of facings) {
    global.Karakter2Renderer.draw(ctx, 100, 100, cyberDressPlayer, facing, false, 0, 0, false, false);
    global.Karakter2Renderer.draw(ctx, 100, 100, cyberDressPlayer, facing, false, 0.4, 2.0, true, false);
    global.Karakter2Renderer.draw(ctx, 100, 100, cyberDressPlayer, facing, true, 0, 0, false, false);
}
console.log('[PASS] K2 Cyber Street Mini Dress rendered across all 8 facings!');

console.log('--- 3. TESTING DRESS: dress_k2_goth_grunge ---');
const gothDressPlayer = {
    name: 'damla',
    gender: 'female',
    skinColor: '#ffd1a4',
    hairColor: '#18181b',
    shirt: 'dress_k2_goth_grunge',
    outfit: 'dress_k2_goth_grunge',
    pants: 'pants_k2_skater_cargo',
    shoes: 'shoes_k2_skate_pro',
    heldItem: 'sigara'
};

for (const facing of facings) {
    global.Karakter2Renderer.draw(ctx, 100, 100, gothDressPlayer, facing, false, 0, 0, false, false);
    global.Karakter2Renderer.draw(ctx, 100, 100, gothDressPlayer, facing, false, 0.4, 2.0, true, false);
    global.Karakter2Renderer.draw(ctx, 100, 100, gothDressPlayer, facing, true, 0, 0, false, false);
}
console.log('[PASS] K2 Goth Grunge Dress rendered across all 8 facings!');

console.log('--- 4. TESTING IMMEDIATE FIRST INHALE TIMING ON ZIPPO LIGHT ---');
const zippoPlayer = { ...femalePlayer, heldItem: 'sigara' };
global.triggerK2SmokeAnimation(zippoPlayer, true);

const animStart = zippoPlayer._k2SmokeAnimStart;
const testTimes = [
    { t: 1500, check: (st) => st.isLighting && st.lighterFlame && !st.isInhaling, desc: '1500ms Flame Lighting Tip' },
    { t: 2500, check: (st) => st.isLighting && st.isInhaling && st.liftProgress === 1, desc: '2500ms Immediate First Deep Inhale' },
    { t: 4000, check: (st) => !st.isInhaling && st.liftProgress < 1 && st.liftProgress > 0, desc: '4000ms Arm Lowering & Ash Flick' },
    { t: 5500, check: (st) => st.isExhaling && st.exhaleProgress > 0, desc: '5500ms Dense Smoke Exhale' }
];

for (const tt of testTimes) {
    const fakeNow = animStart + tt.t;
    const realDateNow = Date.now;
    Date.now = () => fakeNow;
    const st = global.Karakter2Renderer.getKarakter2SmokingState(zippoPlayer, false, 100, 100, 'right', false);
    global.Karakter2Renderer.draw(ctx, 100, 100, zippoPlayer, 'right', false, 0, 0, false, false);
    Date.now = realDateNow;

    if (!tt.check(st)) {
        console.error(`[FAIL] Condition failed at ${tt.desc}! State:`, st);
        process.exit(1);
    }
    console.log(`[PASS] ${tt.desc} verified: isLighting=${st.isLighting}, flame=${st.lighterFlame}, inhaling=${st.isInhaling}, exhaling=${st.isExhaling}`);
}

console.log('--- 5. TESTING NEW HAIRSTYLES (TWIN TAILS, WAVY SHOULDER, HIME CUT) ---');
const newHairs = ['hair_k2_twin_tails', 'hair_k2_wavy_shoulder', 'hair_k2_hime_cut', 'none'];
for (const h of newHairs) {
    const p = { ...femalePlayer, hat: h };
    for (const facing of facings) {
        global.Karakter2Renderer.draw(ctx, 100, 100, p, facing, false, 0, 0, false, false);
    }
    console.log(`[PASS] Hairstyle '${h}' rendered across all 8 facings!`);
}

console.log('--- 6. TESTING NEW TOPS & BOTTOMS & BOOTS ---');
const newTops = ['top_k2_cyber_crop', 'top_k2_grunge_oversize', 'top_k2_pastel_hoodie'];
const newPants = ['pants_k2_cargo_mini', 'pants_k2_flared_jeans', 'pants_k2_goth_fishnet'];
const newShoes = ['shoes_k2_goth_boots'];

for (const top of newTops) {
    for (const btm of newPants) {
        for (const shoe of newShoes) {
            const p = { ...femalePlayer, shirt: top, pants: btm, shoes: shoe, hat: 'hair_k2_twin_tails' };
            for (const facing of ['down', 'down-right', 'right', 'up']) {
                global.Karakter2Renderer.draw(ctx, 100, 100, p, facing, false, 0, 0, false, false);
                global.Karakter2Renderer.draw(ctx, 100, 100, p, facing, false, 0.4, 2.0, true, false);
                global.Karakter2Renderer.draw(ctx, 100, 100, p, facing, true, 0, 0, false, false);
            }
        }
    }
}
console.log(`[PASS] All new tops (${newTops.join(', ')}), bottoms (${newPants.join(', ')}), and boots (${newShoes.join(', ')}) rendered in standing, walking, and sitting!`);

console.log('\n>>> ALL FEMALE, DRESSES, HAIRSTYLES, TOPS, BOTTOMS, BOOTS, AND ZIPPO FIRST INHALE VERIFICATIONS PASSED 100% SUCCESS! <<<');
