const fs = require('fs');

function createSvgMockCtx() {
    let currentPath = '';
    let currentFill = 'none';
    let currentStroke = 'none';
    let currentLineWidth = 1;
    const elements = [];
    const stateStack = [];

    let currentTransform = { x: 0, y: 0, sx: 1, sy: 1, r: 0 };

    return {
        save: () => {
            stateStack.push({ ...currentTransform, currentFill, currentStroke, currentLineWidth });
        },
        restore: () => {
            if (stateStack.length > 0) {
                const s = stateStack.pop();
                currentTransform = { x: s.x, y: s.y, sx: s.sx, sy: s.sy, r: s.r };
                currentFill = s.currentFill;
                currentStroke = s.currentStroke;
                currentLineWidth = s.currentLineWidth;
            }
        },
        scale: (sx, sy) => {
            currentTransform.sx *= sx;
            currentTransform.sy *= sy;
        },
        translate: (tx, ty) => {
            currentTransform.x += tx * currentTransform.sx;
            currentTransform.y += ty * currentTransform.sy;
        },
        rotate: (rad) => {
            currentTransform.r += rad;
        },
        beginPath: () => { currentPath = ''; },
        closePath: () => { currentPath += ' Z'; },
        moveTo: (x, y) => { currentPath += ` M ${x.toFixed(2)} ${y.toFixed(2)}`; },
        lineTo: (x, y) => { currentPath += ` L ${x.toFixed(2)} ${y.toFixed(2)}`; },
        quadraticCurveTo: (cx, cy, x, y) => { currentPath += ` Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`; },
        bezierCurveTo: (c1x, c1y, c2x, c2y, x, y) => { currentPath += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)} ${c2x.toFixed(2)} ${c2y.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)}`; },
        arc: (x, y, r, sa, ea, cc) => {
            const steps = 24;
            let diff = ea - sa;
            if (diff < 0) diff += Math.PI * 2;
            for (let i = 0; i <= steps; i++) {
                const a = sa + (diff * i) / steps;
                const px = (x + r * Math.cos(a)).toFixed(2);
                const py = (y + r * Math.sin(a)).toFixed(2);
                if (i === 0 && !currentPath) currentPath += ` M ${px} ${py}`;
                else currentPath += ` L ${px} ${py}`;
            }
        },
        ellipse: (x, y, rx, ry) => {
            const transformAttr = `transform="translate(${currentTransform.x.toFixed(2)}, ${currentTransform.y.toFixed(2)}) scale(${currentTransform.sx.toFixed(2)}, ${currentTransform.sy.toFixed(2)}) rotate(${(currentTransform.r * 180 / Math.PI).toFixed(2)})"`;
            elements.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${currentFill}" stroke="${currentStroke}" stroke-width="${currentLineWidth}" ${transformAttr} />`);
        },
        roundRect: (x, y, w, h) => {
            const transformAttr = `transform="translate(${currentTransform.x.toFixed(2)}, ${currentTransform.y.toFixed(2)}) scale(${currentTransform.sx.toFixed(2)}, ${currentTransform.sy.toFixed(2)}) rotate(${(currentTransform.r * 180 / Math.PI).toFixed(2)})"`;
            elements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${currentFill}" stroke="${currentStroke}" stroke-width="${currentLineWidth}" ${transformAttr} />`);
        },
        fillRect: (x, y, w, h) => {
            const transformAttr = `transform="translate(${currentTransform.x.toFixed(2)}, ${currentTransform.y.toFixed(2)}) scale(${currentTransform.sx.toFixed(2)}, ${currentTransform.sy.toFixed(2)}) rotate(${(currentTransform.r * 180 / Math.PI).toFixed(2)})"`;
            elements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${currentFill}" ${transformAttr} />`);
        },
        fill: () => {
            if (currentPath) {
                const transformAttr = `transform="translate(${currentTransform.x.toFixed(2)}, ${currentTransform.y.toFixed(2)}) scale(${currentTransform.sx.toFixed(2)}, ${currentTransform.sy.toFixed(2)}) rotate(${(currentTransform.r * 180 / Math.PI).toFixed(2)})"`;
                elements.push(`<path d="${currentPath}" fill="${currentFill}" ${transformAttr} />`);
            }
        },
        stroke: () => {
            if (currentPath) {
                const transformAttr = `transform="translate(${currentTransform.x.toFixed(2)}, ${currentTransform.y.toFixed(2)}) scale(${currentTransform.sx.toFixed(2)}, ${currentTransform.sy.toFixed(2)}) rotate(${(currentTransform.r * 180 / Math.PI).toFixed(2)})"`;
                elements.push(`<path d="${currentPath}" fill="none" stroke="${currentStroke}" stroke-width="${currentLineWidth}" ${transformAttr} />`);
            }
        },
        clip: () => {},
        drawImage: () => {},
        fillText: () => {},
        getElements: () => elements,
        set fillStyle(v) { currentFill = v; },
        get fillStyle() { return currentFill; },
        set strokeStyle(v) { currentStroke = v; },
        get strokeStyle() { return currentStroke; },
        set lineWidth(v) { currentLineWidth = v; },
        get lineWidth() { return currentLineWidth; }
    };
}

global.window = global;
global.drawAvatarHairAndHats = () => {};
global.drawAvatarFaceAndEyes = () => {};
global.drawHeldItem = () => {};
global.normalize8WayFacing = (f) => f || 'down';
global.isFemaleAvatar = (p) => true;

require('../public/js/renderers/karakter2Renderer.js');

const p = {
    name: 'ayse',
    gender: 'female',
    skinColor: '#ffd1a4',
    hairColor: '#3b2012',
    hat: 'none',
    shirt: 'dress_k2_goth_grunge',
    outfit: 'dress_k2_goth_grunge',
    pants: 'pants_k2_goth_fishnet',
    shoes: 'shoes_k2_goth_boots',
    heldItem: 'none'
};

// Render Right Profile
const ctxRight = createSvgMockCtx();
global.Karakter2Renderer.draw(ctxRight, 100, 100, p, 'right', false, 0, 0, false, false);
const svgRight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400" style="background:#0f172a">
${ctxRight.getElements().join('\n')}
</svg>`;
fs.writeFileSync('scratch/k2_right_profile.svg', svgRight);

// Render Left Profile
const ctxLeft = createSvgMockCtx();
global.Karakter2Renderer.draw(ctxLeft, 100, 100, p, 'left', false, 0, 0, false, false);
const svgLeft = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="400" height="400" style="background:#0f172a">
${ctxLeft.getElements().join('\n')}
</svg>`;
fs.writeFileSync('scratch/k2_left_profile.svg', svgLeft);

console.log('[SUCCESS] Successfully rendered scratch/k2_right_profile.svg and scratch/k2_left_profile.svg');
