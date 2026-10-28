const fs = require('fs');
const path = require('path');

function getJsFiles(dir) {
    let results = [];
    for (const f of fs.readdirSync(dir)) {
        if (f === 'node_modules' || f === '.git' || f === 'scratch') continue;
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) results = results.concat(getJsFiles(full));
        else if (f.endsWith('.js')) results.push(full);
    }
    return results;
}

const files = getJsFiles('.');
console.log('Total JS files:', files.length);

// Check 1: find patterns like `players[sid].` or `players[id].` without prior null check
const unsafeAccessPatterns = [];
for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, idx) => {
        // match players[sid].something or players[id].something where sid or id is accessed directly
        if (/players\[(sid|id|targetSocketId|winPid|p)\]\.[a-zA-Z]/.test(line)) {
            // Check if there is an && before or optional chaining ?.
            if (!line.includes('?.') && !line.includes('&& players[')) {
                unsafeAccessPatterns.push({ file, line: idx + 1, content: line.trim() });
            }
        }
    });
}

console.log('Unsafe players[...] accesses found:', unsafeAccessPatterns.length);
unsafeAccessPatterns.slice(0, 30).forEach(u => console.log(`${u.file}:${u.line} -> ${u.content}`));
