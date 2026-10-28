const fs = require('fs');

const svgElements = [];
let currentFill = 'none';
let currentStroke = 'none';
let currentLineWidth = 1;
let currentPath = '';

const mockCtx = {
    save: () => {},
    restore: () => {},
    translate: () => {},
    scale: () => {},
    beginPath: () => { currentPath = ''; },
    closePath: () => { currentPath += ' Z'; },
    moveTo: (x, y) => { currentPath += ` M ${x} ${y}`; },
    lineTo: (x, y) => { currentPath += ` L ${x} ${y}`; },
    quadraticCurveTo: (cx, cy, x, y) => { currentPath += ` Q ${cx} ${cy} ${x} ${y}`; },
    bezierCurveTo: (c1x, c1y, c2x, c2y, x, y) => { currentPath += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y}`; },
    arc: (x, y, r, sa, ea, cc) => {
        const steps = 30;
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
        svgElements.push(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${currentFill}" stroke="${currentStroke}" stroke-width="${currentLineWidth}" />`);
    },
    roundRect: (x, y, w, h) => {
        svgElements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${currentFill}" stroke="${currentStroke}" stroke-width="${currentLineWidth}" />`);
    },
    fillRect: (x, y, w, h) => {
        svgElements.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${currentFill}" />`);
    },
    fill: () => {
        if (currentPath) {
            svgElements.push(`<path d="${currentPath}" fill="${currentFill}" />`);
        }
    },
    stroke: () => {
        if (currentPath) {
            svgElements.push(`<path d="${currentPath}" fill="none" stroke="${currentStroke}" stroke-width="${currentLineWidth}" />`);
        }
    }
};

Object.defineProperty(mockCtx, 'fillStyle', {
    get() { return currentFill; },
    set(v) { currentFill = v; }
});
Object.defineProperty(mockCtx, 'strokeStyle', {
    get() { return currentStroke; },
    set(v) { currentStroke = v; }
});
Object.defineProperty(mockCtx, 'lineWidth', {
    get() { return currentLineWidth; },
    set(v) { currentLineWidth = v; }
});

// 1. Draw Neck
mockCtx.fillStyle = '#ffd1a4';
mockCtx.beginPath();
mockCtx.moveTo(-4.8, 6.0);
mockCtx.lineTo(-4.8, 9.8);
mockCtx.lineTo(3.4, 9.8);
mockCtx.quadraticCurveTo(3.2, 7.8, 3.2, 6.0);
mockCtx.closePath();
mockCtx.fill();

// 2. Draw Head Base
mockCtx.fillStyle = '#ffd1a4';
mockCtx.strokeStyle = 'rgba(0,0,0,0.18)';
mockCtx.lineWidth = 0.9;
mockCtx.beginPath();
mockCtx.arc(0, -2.5, 9.8, Math.PI * 0.42, Math.PI * 1.5, false);
mockCtx.lineTo(6.0, -10.5);
mockCtx.quadraticCurveTo(8.4, -6.8, 8.2, -4.2);
mockCtx.lineTo(10.4, -2.0);
mockCtx.lineTo(8.6, -0.6);
mockCtx.quadraticCurveTo(8.4, 1.2, 6.6, 4.6);
mockCtx.quadraticCurveTo(2.5, 6.8, 0, 7.0);
mockCtx.closePath();
mockCtx.fill();
mockCtx.stroke();

// 3. Draw Collar
mockCtx.fillStyle = '#09090b';
mockCtx.roundRect(-1.0, 7.8, 6.0, 1.4);

// 4. Draw NEW PROPOSED WAVY SHOULDER HAIR IN PROFILE
mockCtx.fillStyle = '#26150b';
mockCtx.beginPath();
mockCtx.moveTo(7.2, -6.8);
// Crown dome to back
mockCtx.quadraticCurveTo(5.0, -11.5, 0, -13.6);
mockCtx.quadraticCurveTo(-7.5, -13.5, -11.2, -6.5);
mockCtx.quadraticCurveTo(-12.5, -2.0, -11.5, 2.5);
// Cascading shoulder wave
mockCtx.quadraticCurveTo(-10.8, 6.0, -8.5, 9.5);
mockCtx.quadraticCurveTo(-7.0, 11.0, -4.5, 11.2);
// Bottom wavy hem
mockCtx.quadraticCurveTo(-1.5, 9.8, 0.5, 10.8);
mockCtx.quadraticCurveTo(2.2, 11.2, 3.8, 9.6);
// Front face framing wave
mockCtx.quadraticCurveTo(4.2, 6.5, 3.0, 2.5);
mockCtx.quadraticCurveTo(1.5, -1.0, 3.2, -4.2);
mockCtx.quadraticCurveTo(5.0, -6.0, 7.2, -6.8);
mockCtx.closePath();
mockCtx.fill();

// Hair highlights
mockCtx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
mockCtx.lineWidth = 1.2;
mockCtx.beginPath();
mockCtx.arc(0, -5.5, 7.5, Math.PI * 1.25, Math.PI * 1.75);
mockCtx.moveTo(-4.0, 3.0);
mockCtx.quadraticCurveTo(-6.0, 6.5, -3.5, 9.8);
mockCtx.moveTo(1.5, 2.0);
mockCtx.quadraticCurveTo(2.8, 5.5, 1.8, 8.5);
mockCtx.stroke();

// 5. Draw Face (Eye, Blush, Lip)
mockCtx.fillStyle = '#ffffff';
mockCtx.roundRect(4.2, -4.4, 3.4, 3.6);
mockCtx.fillStyle = '#0f172a';
mockCtx.roundRect(5.0, -4.0, 2.4, 3.0);
mockCtx.fillStyle = '#ffffff';
mockCtx.arc(5.8, -3.2, 0.7, 0, Math.PI * 2);
mockCtx.fill();

// Lash
mockCtx.strokeStyle = '#0f172a';
mockCtx.lineWidth = 0.85;
mockCtx.beginPath();
mockCtx.moveTo(7.4, -4.0);
mockCtx.quadraticCurveTo(8.6, -5.0, 9.2, -5.4);
mockCtx.stroke();

// Blush
mockCtx.fillStyle = 'rgba(244, 114, 182, 0.28)';
mockCtx.ellipse(5.0, 0.4, 2.0, 1.1);

// Lips
mockCtx.strokeStyle = '#e11d48';
mockCtx.lineWidth = 0.85;
mockCtx.beginPath();
mockCtx.moveTo(4.2, 2.1);
mockCtx.quadraticCurveTo(5.6, 2.5, 6.8, 1.9);
mockCtx.stroke();
mockCtx.fillStyle = 'rgba(244, 114, 182, 0.38)';
mockCtx.ellipse(5.4, 2.6, 0.85, 0.45);
mockCtx.fillStyle = 'rgba(255, 255, 255, 0.75)';
mockCtx.ellipse(5.4, 2.5, 0.45, 0.22);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-25 -25 50 50" width="400" height="400" style="background:#0b1120">
${svgElements.join('\n')}
</svg>`;

fs.writeFileSync('scratch/head_profile_fixed.svg', svg);
console.log('Saved scratch/head_profile_fixed.svg successfully!');
