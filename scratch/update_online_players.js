const fs = require('fs');
let code = fs.readFileSync('public/js/onlinePlayers.js', 'utf8');

code = code.replace(/\r\n/g, '\n');

const targetOld = `    list.forEach(p => {
        let isFemale = p.gender === 'female';
        let avatarEmoji = isFemale ? '👧' : '👦';
        let avatarBg = isFemale ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)';`;

const targetNew = `    list.forEach(p => {
        let isFemale = p.gender === 'female';
        let isMasked = !!(p.isAnon || p.username === '???');
        let avatarEmoji = isMasked ? '🎭' : (isFemale ? '👧' : '👦');
        let avatarBg = isMasked 
            ? 'linear-gradient(135deg, #18181b, #09090b)' 
            : (isFemale ? 'linear-gradient(135deg, #ec4899, #be185d)' : 'linear-gradient(135deg, #0ea5e9, #0284c7)');`;

const badgesOld = `        // Rozetler
        let badgesHtml = '';
        if (p.isSelf) {
            badgesHtml += \`<span style="background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #93c5fd; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 8px;">Sen</span>\`;
        }`;

const badgesNew = `        // Rozetler
        let badgesHtml = '';
        if (p.isSelf) {
            badgesHtml += \`<span style="background: rgba(59, 130, 246, 0.25); border: 1px solid #3b82f6; color: #93c5fd; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 8px;">Sen</span>\`;
        }
        if (isMasked && !p.isSelf) {
            badgesHtml += \`<span style="background: linear-gradient(135deg, #3f3f46, #18181b); border: 1px solid #52525b; color: #f1f5f9; font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 8px;">🎭 Gizli Kimlik</span>\`;
        }`;

const whisperOld = `            // Fısılda butonu
            actionsHtml += \`
                <button type="button" onclick="whisperToPlayer('\${p.username}')" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; color: white; padding: 6px 11px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3); transition: transform 0.1s;" title="\${p.username} kullanıcısına özel fısılda">
                    <span>💬</span> Fısılda
                </button>
            \`;

            // Arkadaşlık butonu
            if (!p.isFriend) {`;

const whisperNew = `            // Fısılda butonu (Maskeli ise @id üzerinden hedefler, gerçek adı sızdırmaz)
            const whisperTarget = isMasked ? ('@' + p.id) : p.username;
            actionsHtml += \`
                <button type="button" onclick="whisperToPlayer('\${whisperTarget}')" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; color: white; padding: 6px 11px; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; display: flex; align-items: center; gap: 4px; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3); transition: transform 0.1s;" title="\${isMasked ? 'Maskeli oyuncuya' : p.username + ' kullanıcısına'} özel fısılda">
                    <span>💬</span> Fısılda
                </button>
            \`;

            // Arkadaşlık butonu (Maskeli oyuncu eklenemez)
            if (!isMasked && !p.isFriend) {`;

const houseOld = `            // Evine Git butonu (Eğer evi varsa)
            if (p.house && typeof visitFriendHouse === 'function') {`;

const houseNew = `            // Evine Git butonu (Eğer evi varsa ve maskeli değilse)
            if (!isMasked && p.house && typeof visitFriendHouse === 'function') {`;

if (!code.includes(targetOld)) {
    console.error('targetOld not found!');
    process.exit(1);
}

code = code.replace(targetOld, targetNew);
code = code.replace(badgesOld, badgesNew);
code = code.replace(whisperOld, whisperNew);
code = code.replace(houseOld, houseNew);

fs.writeFileSync('public/js/onlinePlayers.js', code, 'utf8');
console.log('Successfully updated onlinePlayers.js!');

