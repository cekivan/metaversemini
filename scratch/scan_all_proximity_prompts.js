const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                results = results.concat(walk(filePath));
            }
        } else if (file.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

const allFiles = walk(path.join(__dirname, '..', 'public', 'js'));

const matches = [];
allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    lines.forEach((line, idx) => {
        if (/fillText.*(\[E|\[e|E\s*Tuşu|E'ye Bas|Basınız|Etkileşim)/i.test(line)) {
            matches.push({
                file: path.relative(path.join(__dirname, '..'), file),
                line: idx + 1,
                text: line.trim()
            });
        }
    });
});

console.log(`Found ${matches.length} matches:\n`);
matches.forEach(m => {
    console.log(`${m.file}:${m.line} -> ${m.text}`);
});

