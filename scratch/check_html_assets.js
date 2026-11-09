const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('public/index.html', 'utf8');

// Find all script src
const scriptSrcs = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
// Find all link href
const linkHrefs = [...html.matchAll(/<link[^>]+href=["']([^"']+)["']/g)].map(m => m[1]);

let missing = 0;
console.log('--- Checking Scripts (' + scriptSrcs.length + ') ---');
for (const s of scriptSrcs) {
    if (s.startsWith('http://') || s.startsWith('https://')) continue;
    const clean = s.split('?')[0].replace(/^\//, '');
    const full = path.join('public', clean);
    if (!fs.existsSync(full)) {
        console.error('❌ Missing script file:', s, '->', full);
        missing++;
    }
}

console.log('--- Checking Stylesheets (' + linkHrefs.length + ') ---');
for (const l of linkHrefs) {
    if (l.startsWith('http://') || l.startsWith('https://')) continue;
    const clean = l.split('?')[0].replace(/^\//, '');
    const full = path.join('public', clean);
    if (!fs.existsSync(full)) {
        console.error('❌ Missing link file:', l, '->', full);
        missing++;
    }
}

if (missing === 0) {
    console.log('✅ All local scripts and stylesheets referenced in index.html exist!');
} else {
    console.error('Total missing references:', missing);
    process.exit(1);
}

