// Test Decoupled Smoke Particles and SFX triggers
function createMockCtx() {
    const noop = () => { };
    return {
        save: noop, restore: noop, scale: noop, translate: noop, rotate: noop,
        beginPath: noop, closePath: noop, arc: noop, ellipse: noop, rect: noop,
        fillRect: noop, strokeRect: noop, roundRect: noop, moveTo: noop, lineTo: noop,
        quadraticCurveTo: noop, bezierCurveTo: noop, clip: noop, fill: noop, stroke: noop,
        transform: noop, setTransform: noop, drawImage: noop, fillText: noop,
        fillStyle: '', strokeStyle: '', lineWidth: 1
    };
}

global.window = global;
global.drawAvatarHairAndHats = () => { };
global.drawAvatarFaceAndEyes = () => { };
global.drawHeldItem = () => { };
global.normalize8WayFacing = (f) => f || 'down';
global.isFemaleAvatar = () => false;

// Mock Web Audio Context & playSound
const soundsPlayed = [];
global.playSound = function (type, param) {
    soundsPlayed.push({ type, time: Date.now() });
};

require('../public/js/renderers/karakter2Renderer.js');

const ctx = createMockCtx();
const player = {
    name: 'test_smoker',
    x: 100,
    y: 100,
    skinColor: '#ffd1a4',
    hairColor: '#26150b',
    shirt: 'k2_cyber_street',
    pants: 'pants_k2_tactical_jogger',
    shoes: 'shoes_k2_chunky_sneaker',
    heldItem: 'sigara'
};

// 1. Test SFX Triggers with Zippo
console.log('--- Testing Zippo & Smoke SFX Triggers ---');
global.triggerK2SmokeAnimation(player, true);

const animStart = player._k2SmokeAnimStart;

// Step through keyframes of 7.8s Zippo ritual (direct inhale after lighting)
const keyframes = [
    { name: 'Zippo Open (750ms)', time: 750, expectedSfx: 'zippo_open' },
    { name: 'Zippo Strike (1100ms)', time: 1100, expectedSfx: 'zippo_strike' },
    { name: 'Inhale Crackle (2300ms - Right After Lighting)', time: 2300, expectedSfx: 'tobacco_inhale' },
    { name: 'Zippo Close (2700ms)', time: 2700, expectedSfx: 'zippo_close' },
    { name: 'Exhale Whisper (5200ms)', time: 5200, expectedSfx: 'smoke_exhale' },
];

for (const k of keyframes) {
    const fakeNow = animStart + k.time;
    const realDateNow = Date.now;
    Date.now = () => fakeNow;

    global.Karakter2Renderer.draw(ctx, 100, 100, player, 'right', false, 0, 0, false, false);
    Date.now = realDateNow;

    const played = soundsPlayed.some(s => s.type === k.expectedSfx);
    if (!played) {
        console.error(`[FAIL] Expected sound '${k.expectedSfx}' at ${k.name}`);
        process.exit(1);
    }
    console.log(`[PASS] SFX played successfully: ${k.expectedSfx} at ${k.name}`);
}

// 2. Test Decoupled World-Space Smoke Particles
console.log('\n--- Testing Decoupled World-Space Smoke Particles ---');
// At 5200ms, player is facing 'right' at x=100 and blowing smoke rings
const exhaleTime = animStart + 5200;
Date.now = () => exhaleTime;
global.Karakter2Renderer.draw(ctx, 100, 100, player, 'right', false, 0, 0, false, false);

const particles = player._k2Smoke;
if (!particles || particles.length === 0) {
    console.error('[FAIL] Expected smoke particles in player._k2Smoke!');
    process.exit(1);
}

const firstRing = particles[0];
console.log(`[PASS] Smoke ring emitted: type=${firstRing.type}, worldX=${firstRing.worldX.toFixed(1)}, rot=${firstRing.rot}, vx=${firstRing.vx.toFixed(2)}, vy=${firstRing.vy.toFixed(2)}`);

if (firstRing.vx <= 0 || firstRing.rot <= 0) {
    console.error(`[FAIL] Expected ring emitted to the right (vx > 0, rot > 0), got vx=${firstRing.vx}, rot=${firstRing.rot}`);
    process.exit(1);
}

// NOW: PLAYER TURNS 180 DEGREES TO THE LEFT AND WALKS TO x=150!
console.log('\n--- Testing Player Turning & Walking (Decoupling Verification) ---');
const savedRot = firstRing.rot;
const savedVx = firstRing.vx;
const initialWorldX = firstRing.worldX;
const initialWorldY = firstRing.worldY;

player.x = 150; // Player moved 50 pixels away!
const stepTime = exhaleTime + 200;
Date.now = () => stepTime;

// Draw facing 'left'!
global.Karakter2Renderer.draw(ctx, 150, 100, player, 'left', false, 0, 1.57, true, false);

// Verify the ring DID NOT flip, DID NOT turn left, and DID NOT jump 50px with the player!
console.log(`[PASS] After player turned left and moved:`);
console.log(`       Ring rot: ${firstRing.rot} (Expected original ${savedRot})`);
console.log(`       Ring vx: ${firstRing.vx.toFixed(2)} (Expected positive ${savedVx.toFixed(2)})`);
console.log(`       Ring worldX: ${firstRing.worldX.toFixed(1)} (Drifted from ${initialWorldX.toFixed(1)}, NOT snapped to player at 150)`);
console.log(`       Ring worldY: ${firstRing.worldY.toFixed(1)} (Risen upwards from ${initialWorldY.toFixed(1)})`);

if (firstRing.rot !== savedRot) {
    console.error(`[FAIL] Ring rot changed when player turned! Expected ${savedRot}, got ${firstRing.rot}`);
    process.exit(1);
}
if (firstRing.vx <= 0) {
    console.error(`[FAIL] Ring vx reversed when player turned left! Expected positive vx.`);
    process.exit(1);
}
if (Math.abs(firstRing.worldX - 150) < 10) {
    console.error(`[FAIL] Ring moved along with player to 150 instead of staying in the world!`);
    process.exit(1);
}
if (firstRing.worldY >= initialWorldY) {
    console.error(`[FAIL] Ring did not rise upwards in the air!`);
    process.exit(1);
}

console.log('\n[ALL TESTS PASSED] Decoupled world-space smoke and procedural SFX are 100% verified!');
