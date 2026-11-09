const fs = require('fs');
const filePath = 'public/js/worldRenderer.js';
let content = fs.readFileSync(filePath, 'utf8');

const target = "    } else if (room === 'vip_club') {\r\n        if (typeof renderStaticVipClubTo === 'function') {\r\n            renderStaticVipClubTo(bctx, width, height);\r\n        }\r\n";
const insertion = "    } else if (room === 'mine_cave') {\r\n        if (typeof renderStaticMineCaveTo === 'function') {\r\n            renderStaticMineCaveTo(bctx, width, height);\r\n        }\r\n";

if (!content.includes(target)) {
    console.error('Target not found!');
    process.exit(1);
}

content = content.replace(target, target + insertion);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully added mine_cave to renderStaticRoomTo');

