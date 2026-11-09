const fs = require('fs');
const content = fs.readFileSync('yapilanlar.md', 'utf8');
const lines = content.split('\n');

console.log("Line 9600-10082 preview headings:");
lines.slice(9600).forEach((l, i) => {
    if (l.startsWith('#')) {
        console.log((9600 + i) + ': ' + l.slice(0, 80));
    }
});

