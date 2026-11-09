const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const lines = html.split('\n');

console.log('Total lines in index.html:', lines.length);

const sections = [];
lines.forEach((line, idx) => {
    if (line.includes('<!--') && line.includes('-->') && (line.includes('MODAL') || line.includes('MENÜ') || line.includes('PANEL') || line.includes('CONTAINER'))) {
        sections.push({ line: idx + 1, text: line.trim() });
    }
});

console.log('Main Sections found in index.html:');
sections.forEach(s => console.log(`Line ${s.line.toString().padStart(5, ' ')}: ${s.text}`));

