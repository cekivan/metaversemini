const fs = require('fs');
const path = require('path');

console.log("🔍 Checking for unsafe chained calls on document.getElementById...");

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

const unsafeChainedRegex = /document\.getElementById\(\s*['"`]([^'"`]+)['"`]\s*\)\.([a-zA-Z0-9_$]+)/g;

const findings = [];

for (const f of jsFiles) {
    const code = fs.readFileSync(f, 'utf8');
    const lines = code.split('\n');
    lines.forEach((line, lineIdx) => {
        let match;
        while ((match = unsafeChainedRegex.exec(line)) !== null) {
            findings.push({
                file: path.relative('.', f),
                line: lineIdx + 1,
                id: match[1],
                prop: match[2],
                code: line.trim()
            });
        }
    });
}

console.log(`Found ${findings.length} unsafe chained document.getElementById calls:`);
findings.forEach(f => {
    console.log(`${f.file}:${f.line} -> document.getElementById('${f.id}').${f.prop}`);
});

