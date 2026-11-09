const fs = require('fs');
const content = fs.readFileSync('yapilanlar.md', 'utf8');
const lines = content.split('\n');

let inCode = false;
let codeLines = 0;
let codeBlocks = 0;
let maxCodeBlock = 0;
let curBlock = 0;

lines.forEach(l => {
    if (l.trim().startsWith('```')) {
        inCode = !inCode;
        if (inCode) codeBlocks++;
        else {
            if (curBlock > maxCodeBlock) maxCodeBlock = curBlock;
            curBlock = 0;
        }
    } else if (inCode) {
        codeLines++;
        curBlock++;
    }
});
console.log('Total code lines:', codeLines, 'in', codeBlocks, 'blocks (Max block lines:', maxCodeBlock, ')');

// Check sections length
const sections = [];
let curSection = { title: 'Header', start: 0, lines: 0 };
lines.forEach((l, idx) => {
    if (l.startsWith('## ') || l.startsWith('### ')) {
        curSection.lines = idx - curSection.start;
        sections.push(curSection);
        curSection = { title: l, start: idx, lines: 0 };
    }
});
curSection.lines = lines.length - curSection.start;
sections.push(curSection);

sections.sort((a, b) => b.lines - a.lines);
console.log('\nTop 20 largest sections by line count:');
sections.slice(0, 20).forEach(s => console.log(s.lines, 'lines: [Line ' + s.start + '] ' + s.title.slice(0, 80)));

