// scratch/verify_all_requires.js
const fs = require('fs');
const path = require('path');

function getFiles(dir, exts = ['.js']) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') results = results.concat(getFiles(full, exts));
        } else if (exts.includes(path.extname(file))) {
            results.push(full);
        }
    });
    return results;
}

const backendFiles = ['server.js', ...getFiles('src')];
let brokenRequires = [];

backendFiles.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    const reqRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    let match;
    while ((match = reqRegex.exec(content)) !== null) {
        const reqPath = match[1];
        if (reqPath.startsWith('.')) {
            const resolved = path.resolve(path.dirname(f), reqPath);
            let exists = fs.existsSync(resolved) || fs.existsSync(resolved + '.js') || fs.existsSync(path.join(resolved, 'index.js')) || fs.existsSync(resolved + '.json');
            if (!exists) {
                brokenRequires.push({ file: f, require: reqPath, resolved });
            }
        } else {
            // Node module check
            try {
                require.resolve(reqPath, { paths: [path.dirname(f)] });
            } catch (e) {
                brokenRequires.push({ file: f, require: reqPath, error: e.message });
            }
        }
    }
});

console.log('Total files checked:', backendFiles.length);
console.log('Broken requires count:', brokenRequires.length);
if (brokenRequires.length > 0) {
    console.log(JSON.stringify(brokenRequires, null, 2));
}

