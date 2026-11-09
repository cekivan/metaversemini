const fs = require('fs');
const path = require('path');

// Analyze backend handlers
console.log('--- BACKEND HANDLERS ANALYSIS ---');
const handlerFiles = fs.readdirSync('src/handlers');
let totalLines = 0;
const handlerStats = [];

handlerFiles.forEach(f => {
    const full = path.join('src/handlers', f);
    const code = fs.readFileSync(full, 'utf8');
    const lines = code.split('\n').length;
    totalLines += lines;
    
    // Count socket.on
    const socketOns = (code.match(/socket\.on\(/g) || []).length;
    // Count io.emit / socket.emit
    const socketEmits = (code.match(/\.emit\(/g) || []).length;
    // Check if dataManager is required
    const hasDataManager = code.includes('dataManager');
    
    handlerStats.push({ file: f, lines, socketOns, socketEmits, hasDataManager });
});

handlerStats.sort((a,b) => b.lines - a.lines);
handlerStats.forEach(h => {
    console.log(`${h.file.padEnd(25)}: ${h.lines.toString().padStart(5)} lines | ${h.socketOns.toString().padStart(2)} listeners | ${h.socketEmits.toString().padStart(2)} emits | DM: ${h.hasDataManager}`);
});
console.log(`Total backend handler lines: ${totalLines}`);

