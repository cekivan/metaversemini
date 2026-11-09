const fs = require('fs');
const path = require('path');

console.log("🔍 Scanning codebase for missing DOM elements and potential reference bugs...");

const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Extract all id="..." from index.html
const htmlIds = new Set();
const idRegex = /id=["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(indexHtml)) !== null) {
    htmlIds.add(m[1]);
}
console.log(`Found ${htmlIds.size} unique IDs in index.html.`);

// Scan all JS files in public/js
const jsFiles = [];
function findJs(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) {
            findJs(fp);
        } else if (f.endsWith('.js')) {
            jsFiles.push(fp);
        }
    }
}
findJs('public/js');

console.log(`Scanning ${jsFiles.length} client JS files...`);

const missingIdRefs = [];
const getElemRegex = /document\.getElementById\(\s*['"`]([^'"`]+)['"`]\s*\)/g;

for (const f of jsFiles) {
    const code = fs.readFileSync(f, 'utf8');
    let match;
    while ((match = getElemRegex.exec(code)) !== null) {
        const id = match[1];
        // Ignore dynamically generated or template-like IDs
        if (id.includes('${') || id.includes('+')) continue;
        if (!htmlIds.has(id)) {
            missingIdRefs.push({ file: f, id });
        }
    }
}

// Group missing IDs by id
const missingGrouped = {};
missingIdRefs.forEach(r => {
    if (!missingGrouped[r.id]) missingGrouped[r.id] = [];
    missingGrouped[r.id].push(path.basename(r.file));
});

console.log(`\n📋 Missing DOM IDs referenced in JS (${Object.keys(missingGrouped).length} unique):`);
for (const id in missingGrouped) {
    const files = [...new Set(missingGrouped[id])].join(', ');
    console.log(`- #${id} (in: ${files})`);
}
