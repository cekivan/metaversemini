const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function getJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file === 'node_modules' || file === '.git' || file === 'scratch') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results = results.concat(getJsFiles(fullPath));
        } else if (file.endsWith('.js')) {
            results.push(fullPath);
        }
    }
    return results;
}

const files = getJsFiles('.');
console.log(`Found ${files.length} JS files to check syntax.`);

let errors = 0;
for (const file of files) {
    const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (res.status !== 0) {
        console.error(`SYNTAX ERROR in ${file}:`);
        console.error(res.stderr || res.stdout);
        errors++;
    }
}

if (errors === 0) {
    console.log('All files passed node --check syntax successfully.');
} else {
    console.log(`Found ${errors} syntax errors.`);
}
