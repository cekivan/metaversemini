const fs = require('fs');
let s = fs.readFileSync('src/handlers/socialHandler.js', 'utf8');

const targetStr = `        if (!itemKey.startsWith('props_') || itemKey === 'props_none') {
            socket.emit('gameError', "Sadece elde taşınabilen aksesuarlar hediye edilebilir!");
            return;
        }`;

const replacementStr = `        if (!itemKey.startsWith('props_') || itemKey === 'props_none') {
            socket.emit('gameError', "Sadece elde taşınabilen aksesuarlar hediye edilebilir!");
            return;
        }

        const NON_GIFTABLE_ITEMS = [
            'props_pet_izbandut', 'props_izbandut', 'izbandut',
            'props_pet_doberman', 'props_doberman', 'doberman',
            'props_jammer', 'jammer',
            'props_mug_knife', 'props_gasp_bicagi', 'mug_knife',
            'props_zeus_yildirimi', 'zeus_yildirimi'
        ];
        if (NON_GIFTABLE_ITEMS.includes(itemKey) || NON_GIFTABLE_ITEMS.includes(propId)) {
            socket.emit('gameError', "Özel VIP ve Karaborsa eşyaları (Koruma, Doberman, Jammer, Bıçak, Yıldırım) hediye edilemez!");
            return;
        }`;

const normTarget = targetStr.replace(/\r\n/g, '\n');
const normS = s.replace(/\r\n/g, '\n');

if (normS.includes(normTarget)) {
    const isCRLF = s.includes('\r\n');
    const newNorm = normS.replace(normTarget, replacementStr.replace(/\r\n/g, '\n'));
    fs.writeFileSync('src/handlers/socialHandler.js', isCRLF ? newNorm.replace(/\n/g, '\r\n') : newNorm);
    console.log("Successfully patched socialHandler.js!");
} else {
    console.error("Target not found!");
}

