const fs = require('fs');

const content = fs.readFileSync('public/js/avatarRenderer.js', 'utf8');
const lines = content.split('\n');

const startIdx = lines.findIndex(l => l.includes('function drawHeldItem(targetCtx, pX, pY, heldItem, isPreview'));
const endIdx = lines.findIndex((l, idx) => idx > startIdx && l.includes('// --- 6.1 KLASİK 2 VÜCUT MODELİ'));

console.log('Found drawHeldItem at line', startIdx + 1, 'to line', endIdx);

if (startIdx === -1 || endIdx === -1) {
    console.error('Indices not found!');
    process.exit(1);
}

// Extract held item function body
const heldLines = lines.slice(startIdx, endIdx);
const heldItemCode = heldLines.join('\n');

const heldFileContent = `// public/js/renderers/heldItemsRenderer.js - 8 Açılı El Eşyaları (Held Items & Props) Çizim Motoru
// Modüler Avatar Çizim Sistemi (Metaverse Mini 2026)

(function(global) {
    // Güvenli Yardımcılar (Yükleme sırasından bağımsız tolerans)
    function _safeNormalize(facing) {
        if (typeof normalize8WayFacing === 'function') return normalize8WayFacing(facing);
        if (typeof window !== 'undefined' && typeof window.normalize8WayFacing === 'function') return window.normalize8WayFacing(facing);
        return facing || 'down';
    }

${heldItemCode}

    if (typeof window !== 'undefined') {
        window.drawHeldItem = drawHeldItem;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { drawHeldItem };
    }
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync('public/js/renderers/heldItemsRenderer.js', heldFileContent, 'utf8');
console.log('Created public/js/renderers/heldItemsRenderer.js with', heldLines.length, 'lines.');

// Also in avatarRenderer.js, expose mouth/smoke helpers on window
let updatedAvatar = lines.slice(0, startIdx).join('\n');
updatedAvatar += `\n// --- 6. EL EŞYALARI (Modüler public/js/renderers/heldItemsRenderer.js) ---
// drawHeldItem fonksiyonu modüler olarak heldItemsRenderer.js dosyasına taşınmıştır.
if (typeof window !== 'undefined') {
    window.getAvatarMouthPos = getAvatarMouthPos;
    window.getAvatarSmokingState = getAvatarSmokingState;
    window.drawExhaleSmoke = drawExhaleSmoke;
}

`;
updatedAvatar += lines.slice(endIdx).join('\n');

fs.writeFileSync('public/js/avatarRenderer.js', updatedAvatar, 'utf8');
console.log('Updated public/js/avatarRenderer.js! New length:', updatedAvatar.split('\n').length);

