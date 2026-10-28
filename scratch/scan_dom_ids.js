const fs = require('fs');
const path = require('path');

const indexHtml = fs.readFileSync('public/index.html', 'utf8');

// Extract all id="..." from index.html
const idRegex = /id=["']([^"']+)["']/g;
const htmlIds = new Set();
let m;
while ((m = idRegex.exec(indexHtml)) !== null) {
    htmlIds.add(m[1]);
}
console.log('Total IDs found in index.html:', htmlIds.size);

// Scan all JS files in public/js for document.getElementById('...')
const jsFiles = fs.readdirSync('public/js').filter(f => f.endsWith('.js')).map(f => path.join('public/js', f));

// Also include renderers
if (fs.existsSync('public/js/renderers')) {
    fs.readdirSync('public/js/renderers').filter(f => f.endsWith('.js')).forEach(f => jsFiles.push(path.join('public/js/renderers', f)));
}

const missingIds = [];
for (const file of jsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const getElemRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
    let match;
    while ((match = getElemRegex.exec(content)) !== null) {
        const id = match[1];
        if (!htmlIds.has(id)) {
            missingIds.push({ file, id });
        }
    }
}

console.log('Total getElementById calls with IDs not in index.html:', missingIds.length);
const uniqueMissing = {};
missingIds.forEach(item => {
    if (!uniqueMissing[item.id]) uniqueMissing[item.id] = [];
    uniqueMissing[item.id].push(item.file);
});

for (const [id, files] of Object.entries(uniqueMissing)) {
    console.log(`- ID "${id}" in files: ${[...new Set(files)].join(', ')}`);
}
