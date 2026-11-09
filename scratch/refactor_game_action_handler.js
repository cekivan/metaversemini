const fs = require('fs');
const vm = require('vm');

const filePath = 'src/handlers/gameActionHandler.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add import
const importMarker = "const { checkRateLimit } = require('../utils/securityUtils');";
const newImport = `const { checkRateLimit } = require('../utils/securityUtils');\nconst { registerBoardGameActionHandlers } = require('./boardGameActionHandler');`;

if (!content.includes(importMarker)) {
    console.error('Import marker not found!');
    process.exit(1);
}
content = content.replace(importMarker, newImport);

// 2. Cut lines 559 to 959
const cutStart = '    // 7. BATAK DİNLEYİCİLERİ';
const cutEnd = '    socket.on(\'assignBotToVacantSeat\', (data) => {';

const idxStart = content.indexOf(cutStart);
const idxEnd = content.indexOf(cutEnd);

console.log('Cut range:', { idxStart, idxEnd });
if (idxStart === -1 || idxEnd === -1) {
    console.error('Cut boundaries not found!');
    process.exit(1);
}

const delegation = `    // 7. MASA OYUNLARI HAMLELERİ (src/handlers/boardGameActionHandler.js)
    // Batak, Dost Kazığı, Bilardo, Tavla, XOX, Amiral Battı, Satranç, 101 Okey
    registerBoardGameActionHandlers(io, socket, players);\n\n`;

content = content.slice(0, idxStart) + delegation + content.slice(idxEnd);

// Validate
new vm.Script(content);
console.log('VM Script passed! Writing file...');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully refactored', filePath);

