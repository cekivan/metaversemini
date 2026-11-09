const fs = require('fs');
const path = require('path');

// 1. Analyze index.html modals
const html = fs.readFileSync('public/index.html', 'utf8');
const htmlLines = html.split('\n');
const modals = [];
htmlLines.forEach((l, i) => {
    const m = l.match(/id=["']([a-zA-Z0-9_-]*(Modal|Panel|Overlay|Popup|Window|Menu|Bar|View|UI))[a-zA-Z0-9_-]*["']/i);
    if (m) {
        modals.push({ line: i + 1, id: m[1] });
    }
});
console.log('--- INDEX.HTML MODALS & OVERLAYS (' + modals.length + ' found) ---');
modals.slice(0, 30).forEach(m => console.log(`Line ${m.line}: #${m.id}`));

// 2. Global variables in window across public/js
console.log('\n--- GLOBAL WINDOW EXPORTS ANALYSIS ---');
const windowGlobals = {};
function scanGlobals(dir) {
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) scanGlobals(full);
        else if (f.endsWith('.js')) {
            const content = fs.readFileSync(full, 'utf8');
            const matches = content.matchAll(/window\.([a-zA-Z0-9_$]+)\s*=/g);
            for (const m of matches) {
                const name = m[1];
                if (!windowGlobals[name]) windowGlobals[name] = [];
                windowGlobals[name].push(full);
            }
        }
    }
}
scanGlobals('public/js');
const totalGlobals = Object.keys(windowGlobals).length;
console.log(`Total unique window.* global properties: ${totalGlobals}`);

// Find duplicate assignments
const duplicates = Object.entries(windowGlobals).filter(([k, v]) => v.length > 1);
console.log(`Globals assigned in multiple files (${duplicates.length}):`);
duplicates.slice(0, 15).forEach(([k, v]) => {
    console.log(`  window.${k} assigned in: ${v.join(', ')}`);
});

// 3. CSS duplication and size
console.log('\n--- CSS FILES ANALYSIS ---');
fs.readdirSync('public/css').forEach(f => {
    const full = path.join('public/css', f);
    const s = fs.statSync(full);
    const lines = fs.readFileSync(full, 'utf8').split('\n').length;
    console.log(`  ${f.padEnd(20)}: ${lines.toString().padStart(5)} lines | ${(s.size / 1024).toFixed(1)} KB`);
});

// 4. Dead / Unused files check
console.log('\n--- DEAD OR REDUNDANT SCRIPT CANDIDATES ---');
const loadedScripts = new Set();
htmlLines.forEach(l => {
    const sm = l.match(/<script\s+src=["']([^"']+)["']/i);
    if (sm) {
        let clean = sm[1].split('?')[0].replace(/^\//, '');
        if (clean.startsWith('public/')) clean = clean.substring(7);
        loadedScripts.add(clean);
    }
});

function checkAllScripts(dir) {
    for (const f of fs.readdirSync(dir)) {
        const full = path.join(dir, f);
        if (fs.statSync(full).isDirectory()) checkAllScripts(full);
        else if (f.endsWith('.js')) {
            const rel = path.relative('public', full).replace(/\\/g, '/');
            if (!loadedScripts.has(rel) && !rel.includes('scratch')) {
                console.log(`  NOT loaded in index.html: public/${rel}`);
            }
        }
    }
}
checkAllScripts('public/js');

