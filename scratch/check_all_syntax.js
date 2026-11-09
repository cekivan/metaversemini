const fs = require('fs');
const path = require('path');
const vm = require('vm');

let errorCount = 0;
let fileCount = 0;

function checkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            if (ent.name !== 'node_modules' && ent.name !== '.git' && ent.name !== '.gemini') {
                checkDir(full);
            }
        } else if (ent.name.endsWith('.js')) {
            fileCount++;
            try {
                const code = fs.readFileSync(full, 'utf8');
                new vm.Script(code);
            } catch (err) {
                errorCount++;
                console.error('❌ SYNTAX ERROR in file:', full);
                console.error(err.message);
            }
        }
    }
}

console.log('🔍 Checking syntax of all JS files across project...');
checkDir('src');
checkDir('public/js');
checkDir('.');
console.log(`\nChecked ${fileCount} JS files. Errors found: ${errorCount}`);
if (errorCount === 0) {
    console.log('✅ ALL JavaScript files have VALID SYNTAX!');
} else {
    process.exit(1);
}
