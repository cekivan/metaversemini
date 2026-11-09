const fs = require('fs');

let content = fs.readFileSync('src/handlers/economyHandler.js', 'utf8');

// 1. Add import
if (!content.includes("require('./mysteryBoxHandler')")) {
    content = content.replace(
        "const { checkRateLimit } = require('../utils/securityUtils');",
        "const { checkRateLimit } = require('../utils/securityUtils');\nconst { registerMysteryBoxHandlers } = require('./mysteryBoxHandler');"
    );
}

// 2. Replace lines 852-1175
const startPattern = "    // 8. ŞANSLI KUTU (MYSTERY BOX) MEKANİĞİ & DİNAMİK FİYATA BAĞLI RNG ALGORİTMASI";
const endPattern = "    socket.on('disconnect', () => {";

const startIndex = content.indexOf(startPattern);
const endIndex = content.indexOf(endPattern);

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find start or end pattern!');
    process.exit(1);
}

const replacement = "    // 8. ŞANSLI KUTU (MYSTERY BOX) MEKANİĞİ (Modüler src/handlers/mysteryBoxHandler.js)\n    registerMysteryBoxHandlers(io, socket, players, dataManager);\n\n";

content = content.slice(0, startIndex) + replacement + content.slice(endIndex);

fs.writeFileSync('src/handlers/economyHandler.js', content, 'utf8');
console.log('Successfully updated src/handlers/economyHandler.js!');

