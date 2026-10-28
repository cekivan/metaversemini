// Mock canvas context
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
global.isFemaleAvatar = () => false;

require('../public/js/renderers/karakter2Renderer.js');

const facings = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
const p = {
    name: 'test',
    skinColor: '#ffd1a4',
    hairColor: '#26150b',
    shirt: 'k2_cyber_street',
    pants: 'pants_k2_tactical_jogger',
    shoes: 'shoes_k2_chunky_sneaker'
};

const ctx = createMockCtx();

for (const facing of facings) {
    try {
        // Test Standing
        global.Karakter2Renderer.draw(ctx, 100, 100, p, facing, false, 0, 0, false, false);
        // Test Walking with counter-phase swing
        global.Karakter2Renderer.draw(ctx, 100, 100, p, facing, false, 0, 1.57, true, false);
        // Test Sitting
        global.Karakter2Renderer.draw(ctx, 100, 100, p, facing, true, 0, 0, false, false);
        // Test Smoking
        global.Karakter2Renderer.draw(ctx, 100, 100, { ...p, heldItem: 'sigara' }, facing, false, 0, 0, false, false);
        // Test Voice Speaking (Talking Mouth)
        global.Karakter2Renderer.draw(ctx, 100, 100, { ...p, isSpeaking: true }, facing, false, 0, 0, false, false);
        // Test Chat Bubble Talking
        global.activeChatBubbles = { test: [{ text: 'Merhaba!', createdAt: Date.now() }] };
        global.Karakter2Renderer.draw(ctx, 100, 100, { ...p, id: 'test' }, facing, false, 0, 0, false, false);
        // Test Sprinting (Shift ile Koşma)
        global.Karakter2Renderer.draw(ctx, 100, 100, { ...p, isSprinting: true }, facing, false, 0, 3.14, true, false);
        // Test Step cycle touchdown to trigger footstep particle
        global.Karakter2Renderer.draw(ctx, 100, 100, { ...p, isSprinting: true }, facing, false, 0, 6.28, true, false);
        console.log(`[PASS] Facing (standing, walking, sprint, sitting, smoking, voice, chat): ${facing}`);
    } catch (e) {
        console.error(`[FAIL] Facing ${facing}:`, e);
        process.exit(1);
    }
}

// Test Surface Interactions & Particles directly
const surfaces = ['water', 'sand', 'grass', 'solid'];
for (const s of surfaces) {
    if (s === 'water') {
        global.currentRoom = 'sahilv2';
        global.isSahilV2Water = () => true;
    } else if (s === 'sand') {
        global.currentRoom = 'sahil';
        global.isSahilV2Water = () => false;
        global.getBeachShoreX = () => 0;
    } else if (s === 'grass') {
        global.currentRoom = 'bahce';
    } else {
        global.currentRoom = 'sanalika_cadde';
    }

    // Walking footstep
    global.Karakter2Renderer.spawnFootstepParticle(150, 150, 'right', false, false);
    // Sprinting footstep
    global.Karakter2Renderer.spawnFootstepParticle(150, 150, 'right', true, true);
}

// Update and draw particles
global.Karakter2Renderer.updateAndDrawFootstepParticles(ctx);
console.log(`[PASS] Footstep particles test passed (${global.Karakter2Renderer.footstepParticles.length} active particles updated/drawn)`);

// Test Dedicated Smoking System (Option A & B Alternating Cycle)
const smokeP = { ...p, heldItem: 'sigara' };
global.triggerK2SmokeAnimation(smokeP);
console.log(`[PASS] triggerK2SmokeAnimation called. Puff index: ${smokeP._k2SmokePuffIndex}`);

// Simulate time progression through all 4 phases: Lift, Inhale, Lower/Flick, Exhale
const animStart = smokeP._k2SmokeAnimStart;
const testPhases = [
    { name: 'Lift (500ms)', timeOffset: 500 },
    { name: 'Inhale (1500ms)', timeOffset: 1500 },
    { name: 'Lower & Ash Flick (2850ms)', timeOffset: 2850 },
    { name: 'Exhale Option A - Rings (3500ms)', timeOffset: 3500 },
];

for (const phase of testPhases) {
    const fakeNow = animStart + phase.timeOffset;
    const realDateNow = Date.now;
    Date.now = () => fakeNow;
    
    global.Karakter2Renderer.draw(ctx, 100, 100, smokeP, 'right', false, 0, 0, false, false);
    const state = global.Karakter2Renderer.getKarakter2SmokingState(smokeP, false, 100, 100, 'right', false);
    Date.now = realDateNow;
    console.log(`[PASS] Smoke Phase '${phase.name}': style=${state.puffStyle}, lift=${state.liftProgress.toFixed(2)}, inhaling=${state.isInhaling}, exhaling=${state.isExhaling}`);
}

// Test Puff 2 (Option B - Volumetric Cloud)
smokeP._k2SmokeAnimStart = null;
global.triggerK2SmokeAnimation(smokeP);
console.log(`[PASS] Puff 2 triggered. Puff index: ${smokeP._k2SmokePuffIndex}`);
const fakeNowPuff2 = smokeP._k2SmokeAnimStart + 3500;
const realDateNow2 = Date.now;
Date.now = () => fakeNowPuff2;
const state2 = global.Karakter2Renderer.getKarakter2SmokingState(smokeP, false, 100, 100, 'down-right', false);
global.Karakter2Renderer.draw(ctx, 100, 100, smokeP, 'down-right', false, 0, 0, false, false);
Date.now = realDateNow2;
console.log(`[PASS] Puff 2 Exhale: style=${state2.puffStyle} (Expected 'cloud'), exhaling=${state2.isExhaling}`);

if (state2.puffStyle !== 'cloud') {
    console.error(`[FAIL] Expected puffStyle 'cloud' for puff 2, got: ${state2.puffStyle}`);
    process.exit(1);
}

// Test Zippo Lighter Trigger explicitly
smokeP._k2SmokeAnimStart = null;
global.triggerK2SmokeAnimation(smokeP, true);
console.log(`[PASS] Zippo lighting triggered with withLighter=true. _k2UseLighter=${smokeP._k2UseLighter}`);
const zippoNow = smokeP._k2SmokeAnimStart + 1000;
Date.now = () => zippoNow;
const zippoState = global.Karakter2Renderer.getKarakter2SmokingState(smokeP, false, 100, 100, 'right', false);
global.Karakter2Renderer.draw(ctx, 100, 100, smokeP, 'right', false, 0, 0, false, false);
Date.now = realDateNow2;

if (!zippoState.isLighting || !zippoState.lighterFlame) {
    console.error(`[FAIL] Expected isLighting and lighterFlame to be true at 1000ms, got isLighting=${zippoState.isLighting}, flame=${zippoState.lighterFlame}`);
    process.exit(1);
}
console.log(`[PASS] Zippo verified: isLighting=${zippoState.isLighting}, lighterFlame=${zippoState.lighterFlame}`);

console.log('All 8 facings and all states rendered successfully!');

