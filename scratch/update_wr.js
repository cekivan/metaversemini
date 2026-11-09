const fs = require('fs');
let code = fs.readFileSync('public/js/worldRenderer.js', 'utf8');

const target = `    } else if (currentRoom === "cadde2") {
        // Sola (Cadde 1), Sağa (Doğu Sahil Yolu), Yukarı (VİP CLUB) ve Sağ Üst (Kültür Merkezi) geçişler açık!
        if (x < 14 && !(y >= 140 && y <= 330)) return true;
        if (x > canvas.width - 14 && !(y >= 140 && y <= 330)) return true;
        if (y < 95 && !(x >= 460 && x <= 540) && !(x >= 760 && x <= 840)) return true;
        if (y > canvas.height - 20) return true;`;

const replacement = `    } else if (currentRoom === "cadde2") {
        // Sola (Cadde 1), Sağa (Doğu Sahil Yolu) geçişler açık
        if (x < 14 && !(y >= 140 && y <= 330)) return true;
        if (x > canvas.width - 14 && !(y >= 140 && y <= 330)) return true;
        if (y > canvas.height - 20) return true;
        // Kuzey Bulvarı (x: 410..590) açık yol: Yeni harita bağlantısı için yukarı doğru yürünebilir (y < 15 durdurur)
        if (x >= 410 && x <= 590) {
            if (y < 15) return true;
        } else {
            // Bina cepheleri (Sol VIP Club: 15..185, Botanik: 185..405, Kültür Merkezi: 605..995)
            const isVipDoor = (x >= 65 && x <= 130 && y >= 100);
            const isBotanicDoor = (x >= 260 && x <= 335 && y >= 100);
            const isKmDoor = (x >= 760 && x <= 850 && y >= 95);
            if (y < 110 && !isVipDoor && !isBotanicDoor && !isKmDoor) return true;
        }`;

// Normalize line breaks for matching
const normCode = code.replace(/\r\n/g, '\n');
const normTarget = target.replace(/\r\n/g, '\n');
const normReplacement = replacement.replace(/\r\n/g, '\n');

if (normCode.includes(normTarget)) {
    const updated = normCode.replace(normTarget, normReplacement);
    fs.writeFileSync('public/js/worldRenderer.js', updated, 'utf8');
    console.log('SUCCESS: worldRenderer.js updated successfully!');
} else {
    console.error('ERROR: Target block not found in worldRenderer.js');
}

