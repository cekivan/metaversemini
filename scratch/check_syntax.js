const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let count = 0;
function checkDir(dir) {
    const list = fs.readdirSync(dir);
    for (const f of list) {
        if (f === 'node_modules' || f === '.git' || f === '.gemini' || f === 'scratch') continue;
        const full = path.join(dir, f);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            checkDir(full);
        } else if (f.endsWith('.js')) {
            count++;
            try {
                execSync(`node --check "${full}"`);
            } catch (e) {
                console.error("Syntax Error in:", full);
                process.exit(1);
            }
        }
    }
}

checkDir('.');
console.log(`Success: Checked ${count} JS files without any syntax errors!`);

