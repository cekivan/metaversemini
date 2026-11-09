const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const regex = /id="([a-zA-Z0-9]+Modal)"/g;
let match;
const modals = [];
while ((match = regex.exec(html)) !== null) {
    modals.push(match[1]);
}

console.log('Total Modals found in index.html:', modals.length);
console.log('Unique Modals:', new Set(modals).size);

// Check if any modal IDs are duplicated
const counts = {};
modals.forEach(m => counts[m] = (counts[m] || 0) + 1);
const duplicates = Object.entries(counts).filter(([k, v]) => v > 1);
if (duplicates.length > 0) {
    console.log('⚠️ Duplicated Modal IDs:', duplicates);
} else {
    console.log('✅ All Modal IDs are unique!');
}

// Print lines where modals start and end
const lines = html.split('\n');
console.log(`Total HTML lines: ${lines.length}`);

