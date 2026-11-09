const fs = require('fs');
const content = fs.readFileSync('yapilanlar.md', 'utf8');

// Let's inspect unique sections from top to bottom
const lines = content.split('\n');
console.log("Analyzing sections...");

// Let's check sections after 6700
console.log("Line 6700-7500 preview:");
lines.slice(6700, 6750).forEach((l, i) => console.log(6700 + i + ': ' + l.slice(0, 80)));

