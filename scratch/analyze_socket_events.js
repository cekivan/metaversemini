// scratch/analyze_socket_events.js
const fs = require('fs');
const path = require('path');

function getFiles(dir, filter = (f) => f.endsWith('.js')) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'brain') {
                results = results.concat(getFiles(full, filter));
            }
        } else if (filter(file)) {
            results.push(full);
        }
    });
    return results;
}

const backendFiles = ['server.js', ...getFiles('src')];
const frontendFiles = [...getFiles('public/js'), 'public/index.html'];

const serverListens = new Set();
const serverEmits = new Set();
const clientListens = new Set();
const clientEmits = new Set();

const emitRegex = /(?:socket|io|targetSocket|playerSocket|s|sock)\.emit\s*\(\s*['"]([^'"]+)['"]/g;
const onRegex = /(?:socket|io|s|sock)\.on\s*\(\s*['"]([^'"]+)['"]/g;

backendFiles.forEach(f => {
    const text = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = emitRegex.exec(text)) !== null) serverEmits.add(m[1]);
    while ((m = onRegex.exec(text)) !== null) serverListens.add(m[1]);
});

frontendFiles.forEach(f => {
    const text = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = emitRegex.exec(text)) !== null) clientEmits.add(m[1]);
    while ((m = onRegex.exec(text)) !== null) clientListens.add(m[1]);
});

console.log('--- Socket Event Summary ---');
console.log('Server Listens:', serverListens.size);
console.log('Server Emits:', serverEmits.size);
console.log('Client Listens:', clientListens.size);
console.log('Client Emits:', clientEmits.size);

// 1. Client emits but server doesn't listen:
const clientEmitsNotHandled = [...clientEmits].filter(e => !serverListens.has(e));
console.log('\n[POTENTIAL BUG] Client emits but Server has NO listener for:', clientEmitsNotHandled);

// 2. Server emits but client doesn't listen:
const serverEmitsNotHandled = [...serverEmits].filter(e => !clientListens.has(e));
console.log('\n[INFO] Server emits but Client has NO listener for:', serverEmitsNotHandled);
