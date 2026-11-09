const fs = require('fs');
const path = require('path');

console.log("🔍 Scanning socket events between server and client...");

const serverEmits = new Set();
const serverListens = new Set();
const clientEmits = new Set();
const clientListens = new Set();

function scanDir(dir, isServer) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fp = path.join(dir, f);
        const stat = fs.statSync(fp);
        if (stat.isDirectory()) {
            if (f === 'node_modules' || f === '.git' || f === 'scratch') continue;
            scanDir(fp, isServer);
        } else if (f.endsWith('.js')) {
            const code = fs.readFileSync(fp, 'utf8');
            
            // matches socket.emit('event', ...) or io.emit('event', ...) or io.to(...).emit('event', ...)
            const emitRegex = /(?:socket|io|targetSocket|staffSocket|callerSocket)\s*(?:\.to\([^)]+\))*\.emit\(\s*['"`]([^'"`]+)['"`]/g;
            let m;
            while ((m = emitRegex.exec(code)) !== null) {
                if (isServer) serverEmits.add(m[1]);
                else clientEmits.add(m[1]);
            }

            // matches socket.on('event', ...)
            const onRegex = /socket\.on\(\s*['"`]([^'"`]+)['"`]/g;
            while ((m = onRegex.exec(code)) !== null) {
                if (isServer) serverListens.add(m[1]);
                else clientListens.add(m[1]);
            }
        }
    }
}

scanDir('src', true);
if (fs.existsSync('server.js')) {
    const srvCode = fs.readFileSync('server.js', 'utf8');
    const emitRegex = /(?:socket|io)\s*(?:\.to\([^)]+\))*\.emit\(\s*['"`]([^'"`]+)['"`]/g;
    let m;
    while ((m = emitRegex.exec(srvCode)) !== null) serverEmits.add(m[1]);
    const onRegex = /socket\.on\(\s*['"`]([^'"`]+)['"`]/g;
    while ((m = onRegex.exec(srvCode)) !== null) serverListens.add(m[1]);
}

scanDir('public/js', false);

console.log(`Server emits: ${serverEmits.size}, listens: ${serverListens.size}`);
console.log(`Client emits: ${clientEmits.size}, listens: ${clientListens.size}`);

// Client emits that server never listens to
const unhandledClientEmits = [];
for (const e of clientEmits) {
    if (!serverListens.has(e)) {
        unhandledClientEmits.push(e);
    }
}

console.log("\n⚠️ Client emits not listened by Server:");
unhandledClientEmits.forEach(e => console.log(`- ${e}`));

// Server emits that client never listens to
const unhandledServerEmits = [];
for (const e of serverEmits) {
    if (!clientListens.has(e)) {
        unhandledServerEmits.push(e);
    }
}

console.log("\nℹ️ Server emits not listened by Client (first 25):");
unhandledServerEmits.slice(0, 25).forEach(e => console.log(`- ${e}`));

