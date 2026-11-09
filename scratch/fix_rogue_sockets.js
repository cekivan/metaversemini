const fs = require('fs');

const files = [
    'public/js/amiralBatti.js',
    'public/js/chessGameUI.js',
    'public/js/gameMenusUI.js',
    'public/js/ganyan.js',
    'public/js/housing.js',
    'public/js/kiraathaneBar.js',
    'public/js/petShop.js',
    'public/js/roomInteractions.js',
    'public/js/social.js',
    'public/js/tableLobbyUI.js',
    'public/js/xoxGame.js'
];

let replacedCount = 0;

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');
    const target = "window.socket || (typeof io !== 'undefined' ? io() : null)";
    const replacement = "window.socket || (typeof socket !== 'undefined' ? socket : null)";
    if (content.includes(target)) {
        content = content.replaceAll(target, replacement);
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Replaced in ${f}`);
        replacedCount++;
    }
});

console.log(`Total files updated: ${replacedCount}`);

