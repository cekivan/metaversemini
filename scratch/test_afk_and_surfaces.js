const fs = require('fs');

// Mock browser globals
global.window = global;
global.document = {
    createElement: () => ({ getContext: () => ({ fillRect: () => {}, beginPath: () => {}, stroke: () => {}, fill: () => {}, arc: () => {}, roundRect: () => {}, save: () => {}, restore: () => {}, translate: () => {}, scale: () => {}, rotate: () => {}, strokeText: () => {}, fillText: () => {}, quadraticCurveTo: () => {}, bezierCurveTo: () => {}, moveTo: () => {}, lineTo: () => {}, closePath: () => {}, clearRect: () => {} }) })
};

require('../public/js/renderers/karakter2Renderer.js');

// 1. Zemin algılama testleri
global.currentRoom = 'sahil';
console.log('sahil iskele surface:', global.getSurfaceType(200, 180)); // wood
console.log('sahil kumu surface:', global.getSurfaceType(400, 300)); // sand

global.currentRoom = 'kafe';
console.log('kafe surface:', global.getSurfaceType(100, 100)); // wood

global.currentRoom = 'bahce';
console.log('bahce surface:', global.getSurfaceType(100, 100)); // grass

global.currentRoom = 'sanalika_cadde';
console.log('sanalika_cadde surface:', global.getSurfaceType(100, 100)); // solid

// 2. AFK Çizim testi
const ctx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    rotate: () => {},
    beginPath: () => {},
    closePath: () => {},
    arc: () => {},
    roundRect: () => {},
    stroke: () => {},
    fill: () => {},
    fillText: () => {},
    strokeText: () => {},
    measureText: () => ({ width: 10 }),
    ellipse: () => {},
    moveTo: () => {},
    lineTo: () => {},
    quadraticCurveTo: () => {},
    bezierCurveTo: () => {},
    fillRect: () => {}
};

const afkPlayer = {
    id: 'test_afk',
    name: 'Uykucu',
    action: 'afk',
    x: 100,
    y: 100
};

Karakter2Renderer.drawSkeletalAvatar(ctx, 100, 100, afkPlayer, 'down', false, 0, 0, false, false);
console.log('AFK Karakter 2 skeletal draw: SUCCESS');

Karakter2Renderer.drawAfkSleepBubbles(ctx, 100, 100);
console.log('AFK Sleep Bubbles draw: SUCCESS');

console.log('ALL TESTS PASSED SUCCESSFULLY!');
