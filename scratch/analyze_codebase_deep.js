const fs = require('fs');
const path = require('path');

const files = [];

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (ent.name !== 'node_modules' && ent.name !== '.git' && ent.name !== '.gemini' && ent.name !== 'scratch') {
                scanDir(full);
            }
        } else if (ent.name.endsWith('.js') || ent.name.endsWith('.html') || ent.name.endsWith('.css')) {
            const stat = fs.statSync(full);
            const content = fs.readFileSync(full, 'utf8');
            const lines = content.split('\n').length;
            files.push({ path: full, lines, sizeKB: Math.round(stat.size / 1024) });
        }
    }
}

scanDir('src');
scanDir('public');
scanDir('scripts');

files.sort((a, b) => b.lines - a.lines);

console.log('=== TOP 20 LARGEST FILES IN FRONTEND / BACKEND ===');
files.slice(0, 20).forEach(f => {
    console.log(`${f.lines.toString().padStart(5, ' ')} lines (${f.sizeKB.toString().padStart(4, ' ')} KB) -> ${f.path}`);
});

console.log('\n=== BACKEND SRC/ HANDLERS & COORDINATORS ===');
const backendFiles = files.filter(f => f.path.startsWith('src') || f.path === 'server.js');
backendFiles.sort((a, b) => b.lines - a.lines);
backendFiles.forEach(f => {
    console.log(`${f.lines.toString().padStart(5, ' ')} lines (${f.sizeKB.toString().padStart(4, ' ')} KB) -> ${f.path}`);
});
