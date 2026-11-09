const fs = require('fs');
const content = fs.readFileSync('yapilanlar.md', 'utf8');
const lines = content.split('\n');

const sectionMap = {};
let curTitle = null;
let curLines = [];

lines.forEach((l, idx) => {
    if (l.startsWith('## ') || l.startsWith('### ')) {
        if (curTitle) {
            const key = curTitle.trim().toLowerCase();
            if (!sectionMap[key]) sectionMap[key] = [];
            sectionMap[key].push({ title: curTitle, start: idx - curLines.length, lineCount: curLines.length, text: curLines.join('\n') });
        }
        curTitle = l;
        curLines = [];
    } else {
        curLines.push(l);
    }
});
if (curTitle) {
    const key = curTitle.trim().toLowerCase();
    if (!sectionMap[key]) sectionMap[key] = [];
    sectionMap[key].push({ title: curTitle, start: lines.length - curLines.length, lineCount: curLines.length, text: curLines.join('\n') });
}

let duplicateCount = 0;
let wastedLines = 0;
for (const k in sectionMap) {
    if (sectionMap[k].length > 1) {
        duplicateCount++;
        const total = sectionMap[k].reduce((acc, s) => acc + s.lineCount, 0);
        const saved = total - sectionMap[k][0].lineCount;
        wastedLines += saved;
        console.log(`Duplicate found (${sectionMap[k].length}x, saves ${saved} lines): "${sectionMap[k][0].title.slice(0, 70)}" at lines:`, sectionMap[k].map(s => s.start));
    }
}
console.log(`\nTotal duplicate section groups: ${duplicateCount}`);
console.log(`Total wasted lines due to duplicates: ${wastedLines}`);

