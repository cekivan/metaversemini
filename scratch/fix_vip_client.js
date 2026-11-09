const fs = require('fs');
const path = 'public/js/vipClubClient.js';
let content = fs.readFileSync(path, 'utf8');

const targetStart = "        if (it.id === 'jammer') {";
const targetEnd = "        infoBox.appendChild(titleRow);";

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not find delimiters!");
    process.exit(1);
}

const replacement = `        if (it.id === 'jammer') {
            let cnt = state.jammerCount || 0;
            actionBtn.innerText = \`Satın Al (Sahip: \${cnt} Adet)\`;
            actionBtn.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
            actionBtn.style.color = '#ffffff';
            actionBtn.onclick = () => buyShadyItem('jammer');
        } else if (it.id === 'anon_mask') {
            let exp = state.anonMaskExpiresAt || 0;
            if (exp > now) {
                let remMin = Math.ceil((exp - now) / 60000);
                actionBtn.innerText = \`Aktif (\${remMin} dk kaldı)\`;
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#a1a1aa';
            } else {
                actionBtn.innerText = '30 Dakikalığına Tak';
                actionBtn.style.background = 'linear-gradient(135deg, #6366f1, #4f46e5)';
                actionBtn.style.color = '#ffffff';
                actionBtn.onclick = () => buyShadyItem('anon_mask');
            }
        } else if (it.id === 'neon_red_nick') {
            let exp = state.neonRedNickExpiresAt || 0;
            if (exp > now) {
                let remHours = Math.ceil((exp - now) / 3600000);
                actionBtn.innerText = \`Aktif (\${remHours} saat kaldı)\`;
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#a1a1aa';
            } else {
                actionBtn.innerText = '24 Saatliğine Boya';
                actionBtn.style.background = 'linear-gradient(135deg, #ff1744, #d50000)';
                actionBtn.style.color = '#ffffff';
                actionBtn.onclick = () => buyShadyItem('neon_red_nick');
            }
        } else if (it.id === 'invisibility') {
            let exp = state.invisibilityExpiresAt || 0;
            if (exp > now) {
                let remHours = Math.ceil((exp - now) / 3600000);
                actionBtn.innerText = \`Aktif (\${remHours} saat kaldı)\`;
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#a1a1aa';
            } else {
                actionBtn.innerText = '5 Saatliğine Giy';
                actionBtn.style.background = 'linear-gradient(135deg, #a855f7, #7e22ce)';
                actionBtn.style.color = '#ffffff';
                actionBtn.onclick = () => buyShadyItem('invisibility');
            }
        } else if (it.id === 'mug_knife') {
            if (state.hasMugKnife) {
                let lastMug = state.lastMugTime || 0;
                let diff = now - lastMug;
                let ONE_DAY = 24 * 60 * 60 * 1000;
                if (diff < ONE_DAY) {
                    let remH = Math.ceil((ONE_DAY - diff) / 3600000);
                    actionBtn.innerText = \`Sahipsin (Gasp Hazırlanıyor: \${remH}s)\`;
                } else {
                    actionBtn.innerText = \`Sahipsin (Gaspa Hazır!) 🗡️\`;
                }
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#4ade80';
            } else {
                actionBtn.innerText = 'Gasp Bıçağını Satın Al';
                actionBtn.style.background = 'linear-gradient(135deg, #eab308, #ca8a04)';
                actionBtn.style.color = '#000000';
                actionBtn.onclick = () => buyShadyItem('mug_knife');
            }
        } else if (it.id === 'izbandut') {
            let guardCount = 0;
            if (window.activeCompanionPets) {
                let myPlayerId = (typeof myId !== 'undefined') ? myId : (window.myId || null);
                for (let k in window.activeCompanionPets) {
                    let p = window.activeCompanionPets[k];
                    if (p && p.petType === 'izbandut' && (p.ownerId === myPlayerId || (typeof players !== 'undefined' && myPlayerId && players[myPlayerId] && p.ownerName === players[myPlayerId].name))) {
                        guardCount++;
                    }
                }
            }
            if (guardCount >= 3) {
                actionBtn.innerText = 'Maksimum Koruma (3/3 Aktif)';
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#71717a';
                actionBtn.style.cursor = 'not-allowed';
                actionBtn.onclick = null;
            } else {
                actionBtn.innerText = \`Koruma Kirala (\${guardCount}/3)\`;
                actionBtn.style.background = 'linear-gradient(135deg, #eab308, #ca8a04)';
                actionBtn.style.color = '#000000';
                actionBtn.style.cursor = 'pointer';
                actionBtn.onclick = () => buyShadyItem('izbandut');
            }
        } else if (it.id === 'doberman') {
            let hasDoberman = false;
            if (window.activeCompanionPets) {
                let myPlayerId = (typeof myId !== 'undefined') ? myId : (window.myId || null);
                for (let k in window.activeCompanionPets) {
                    let p = window.activeCompanionPets[k];
                    if (p && p.petType === 'doberman' && (p.ownerId === myPlayerId || (typeof players !== 'undefined' && myPlayerId && players[myPlayerId] && p.ownerName === players[myPlayerId].name))) {
                        hasDoberman = true;
                        break;
                    }
                }
            }
            if (hasDoberman) {
                actionBtn.innerText = 'Sadık Doberman Yanında 🐕‍🦺';
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#4ade80';
                actionBtn.style.cursor = 'default';
                actionBtn.onclick = null;
            } else {
                actionBtn.innerText = 'Doberman Kirala & Çağır';
                actionBtn.style.background = 'linear-gradient(135deg, #eab308, #ca8a04)';
                actionBtn.style.color = '#000000';
                actionBtn.style.cursor = 'pointer';
                actionBtn.onclick = () => buyShadyItem('doberman');
            }
        } else {
            actionBtn.innerText = 'Satın Al & Çağır';
            actionBtn.style.background = 'linear-gradient(135deg, #eab308, #ca8a04)';
            actionBtn.style.color = '#000000';
            actionBtn.onclick = () => buyShadyItem(it.id);
        }

        actionBtn.onmouseover = () => { actionBtn.style.transform = 'translateY(-1px)'; };
        actionBtn.onmouseout = () => { actionBtn.style.transform = 'translateY(0)'; };
        actionBtn.onmousedown = () => { actionBtn.style.transform = 'translateY(1px)'; };
        actionBtn.onmouseup = () => { actionBtn.style.transform = 'translateY(-1px)'; };

        `;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync(path, content, 'utf8');
console.log("vipClubClient.js cleanly restored and updated!");

