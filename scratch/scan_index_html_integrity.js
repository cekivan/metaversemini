// scratch/scan_index_html_integrity.js
const fs = require('fs');

const html = fs.readFileSync('public/index.html', 'utf8');

// Check duplicate IDs
const idRegex = /id=["']([^"']+)["']/gi;
let match;
const idCounts = {};
while ((match = idRegex.exec(html)) !== null) {
    const id = match[1];
    idCounts[id] = (idCounts[id] || 0) + 1;
}

const duplicates = Object.entries(idCounts).filter(([id, count]) => count > 1);
console.log('Total unique IDs:', Object.keys(idCounts).length);
console.log('Duplicate IDs count:', duplicates.length);
if (duplicates.length > 0) {
    console.log('Duplicates:', duplicates);
}

