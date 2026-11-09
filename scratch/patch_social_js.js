const fs = require('fs');
let code = fs.readFileSync('public/js/social.js', 'utf8');

// 1. checkProfileSpecialActionsOwnership
const oldCheckOwnership = `function checkProfileSpecialActionsOwnership() {
    const propInv = (typeof window !== 'undefined' && window.myPropInventory) || {};
    const inv = (typeof window !== 'undefined' && (window.myInventory || (typeof myInventory !== 'undefined' ? myInventory : []))) || [];
    const av = (typeof window !== 'undefined' && (window.myAvatar || (typeof myAvatar !== 'undefined' ? myAvatar : {}))) || {};

    const hasZeus = (propInv['props_zeus_yildirimi'] > 0) ||
                    (Array.isArray(inv) && (inv.includes('props_zeus_yildirimi') || inv.includes('zeus_yildirimi'))) ||
                    (av.heldItem === 'zeus_yildirimi' || av.heldItem === 'zeus_spear' || av.heldItem === 'zeus_simsegi') ||
                    (typeof isItemOwned === 'function' && isItemOwned('props', 'zeus_yildirimi')) ||
                    (typeof window !== 'undefined' && !!window.hasZeusLightning);

    const hasJammer = (typeof window !== 'undefined' && window.myJammerCount > 0) ||
                      (propInv['props_jammer'] > 0) ||
                      (propInv['jammer'] > 0) ||
                      (Array.isArray(inv) && (inv.includes('props_jammer') || inv.includes('jammer'))) ||
                      (typeof isItemOwned === 'function' && (isItemOwned('props', 'jammer') || isItemOwned('props', 'props_jammer')));

    const hasMugKnife = (typeof window !== 'undefined' && !!window.myHasMugKnife) ||
                        (propInv['props_mug_knife'] > 0) ||
                        (propInv['mug_knife'] > 0) ||
                        (propInv['props_gasp_bicagi'] > 0) ||
                        (propInv['gasp_bicagi'] > 0) ||
                        (Array.isArray(inv) && (inv.includes('props_mug_knife') || inv.includes('mug_knife') || inv.includes('props_gasp_bicagi') || inv.includes('gasp_bicagi'))) ||
                        (typeof isItemOwned === 'function' && (isItemOwned('props', 'mug_knife') || isItemOwned('props', 'props_mug_knife') || isItemOwned('props', 'props_gasp_bicagi')));

    return { hasZeus, hasJammer, hasMugKnife };
}`;

const newCheckOwnership = `function checkProfileSpecialActionsOwnership() {
    const propInv = (typeof window !== 'undefined' && window.myPropInventory) || {};
    const inv = (typeof window !== 'undefined' && (window.myInventory || (typeof myInventory !== 'undefined' ? myInventory : []))) || [];
    const av = (typeof window !== 'undefined' && (window.myAvatar || (typeof myAvatar !== 'undefined' ? myAvatar : {}))) || {};
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) ? LevelClient.currentLevel : ((typeof window !== 'undefined' && (window.myLevel || window.myPlayerLevel)) || 1);

    const hasZeus = (myLvl >= 4) && (
                    (typeof window !== 'undefined' && window.myZeusCount > 0) ||
                    (propInv['props_zeus_yildirimi'] > 0) ||
                    (Array.isArray(inv) && (inv.includes('props_zeus_yildirimi') || inv.includes('zeus_yildirimi'))) ||
                    (av.heldItem === 'zeus_yildirimi' || av.heldItem === 'zeus_spear' || av.heldItem === 'zeus_simsegi') ||
                    (typeof isItemOwned === 'function' && isItemOwned('props', 'zeus_yildirimi')) ||
                    (typeof window !== 'undefined' && !!window.hasZeusLightning));

    const hasJammer = (myLvl >= 3) && (
                      (typeof window !== 'undefined' && window.myJammerCount > 0) ||
                      (propInv['props_jammer'] > 0) ||
                      (propInv['jammer'] > 0) ||
                      (Array.isArray(inv) && (inv.includes('props_jammer') || inv.includes('jammer'))) ||
                      (typeof isItemOwned === 'function' && (isItemOwned('props', 'jammer') || isItemOwned('props', 'props_jammer'))));

    const hasMugKnife = (myLvl >= 5) && (
                        (typeof window !== 'undefined' && (window.myMugKnifeCount > 0 || !!window.myHasMugKnife)) ||
                        (propInv['props_mug_knife'] > 0) ||
                        (propInv['mug_knife'] > 0) ||
                        (propInv['props_gasp_bicagi'] > 0) ||
                        (propInv['gasp_bicagi'] > 0) ||
                        (Array.isArray(inv) && (inv.includes('props_mug_knife') || inv.includes('mug_knife') || inv.includes('props_gasp_bicagi') || inv.includes('gasp_bicagi'))) ||
                        (typeof isItemOwned === 'function' && (isItemOwned('props', 'mug_knife') || isItemOwned('props', 'props_mug_knife') || isItemOwned('props', 'props_gasp_bicagi'))));

    return { hasZeus, hasJammer, hasMugKnife, myLvl };
}`;

// 2. useJammerOnInteractingPlayer
const oldUseJammer = `function useJammerOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const targetName = currentInteractingPlayer.name;
    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError('Kendinizde Sinyal Kesici kullanamazsınız!');
        return;
    }
    if (confirm(\`📡 "\${targetName}" adlı oyuncuya Sinyal Kesici (Jammer) kullanarak 3 dakika boyunca susturmak istiyor musunuz?\`)) {
        socket.emit('useJammerOnPlayer', { targetUsername: targetName });
        closePlayerInteractionModal();
    }
}`;

const newUseJammer = `function useJammerOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || window.myLevel || 1;
    if (myLvl < 3) {
        if (window.showGameError) window.showGameError('Sinyal Kesici (Jammer) kullanabilmek için en az Seviye 3 olmalısınız!');
        return;
    }
    const targetName = currentInteractingPlayer.name;
    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError('Kendinizde Sinyal Kesici kullanamazsınız!');
        return;
    }
    if (confirm(\`📡 "\${targetName}" adlı oyuncuya Sinyal Kesici (Jammer) kullanarak frekansını ve konuşmasını susturmak istiyor musunuz?\\n(1 adet Jammer harcanır)\`)) {
        socket.emit('useJammerOnPlayer', { targetUsername: targetName });
        closePlayerInteractionModal();
    }
}`;

// 3. useMugKnifeOnInteractingPlayer
const oldUseMug = `function useMugKnifeOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const targetName = currentInteractingPlayer.name;
    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError('Kendinizi gasp edemezsiniz!');
        return;
    }
    if (confirm(\`🗡️ "\${targetName}" adlı oyuncuyu gasp etmek istiyor musunuz? (Günde 1 kez, en fazla 1000 TL çalınır)\`)) {
        socket.emit('useMugKnifeOnPlayer', { targetUsername: targetName });
        closePlayerInteractionModal();
    }
}`;

const newUseMug = `function useMugKnifeOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || window.myLevel || 1;
    if (myLvl < 5) {
        if (window.showGameError) window.showGameError('Gasp Bıçağı kullanabilmek için en az Seviye 5 olmalısınız!');
        return;
    }
    const targetName = currentInteractingPlayer.name;
    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError('Kendinizi gasp edemezsiniz!');
        return;
    }
    if (confirm(\`🗡️ "\${targetName}" adlı oyuncuyu gasp etmek istiyor musunuz?\\n• Hedef başına günde 1 kez uygulanabilir\\n• En fazla 2.000 TL çalınır\\n• 1 adet Gasp Bıçağı harcanır\`)) {
        socket.emit('useMugKnifeOnPlayer', { targetUsername: targetName });
        closePlayerInteractionModal();
    }
}`;

// 4. useZeusLightningOnInteractingPlayer
const oldUseZeus = `function useZeusLightningOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const targetName = currentInteractingPlayer.name;
    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError("❌ Zeus bile kendi üstüne yıldırım çakmaz!");
        return;
    }
    if (confirm(\`⚡ "\${targetName}" adlı oyuncunun üstüne Zeus'un Yıldırımı'nı çağırıp kül etmek istiyor musunuz?\\n\\n• 10 saniye boyunca gökyüzü kararacak ve dönen kara fırtına bulutu belirecek.\\n• 1 saniye boyunca ilahi yıldırım çarpıp iskeleti gözükecek.\\n• 30 saniye boyunca kül yığını halinde donup konuşamayacak!\\n• (Günde en fazla 3 hak)\`)) {
        socket.emit('castZeusLightning', { targetUsername: targetName });
        closePlayerInteractionModal();
    }
}`;

const newUseZeus = `function useZeusLightningOnInteractingPlayer() {
    if (!currentInteractingPlayer) return;
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || window.myLevel || 1;
    if (myLvl < 4) {
        if (window.showGameError) window.showGameError("Zeus'un İlahi Yıldırımı'nı çağırabilmek için en az Seviye 4 olmalısınız!");
        return;
    }
    const targetName = currentInteractingPlayer.name;
    if (typeof myId !== 'undefined' && currentInteractingPlayer.id === myId) {
        if (window.showGameError) window.showGameError("❌ Zeus bile kendi üstüne yıldırım çakmaz!");
        return;
    }
    if (confirm(\`⚡ "\${targetName}" adlı oyuncunun üstüne Zeus'un İlahi Yıldırımı'nı çağırmak istiyor musunuz?\\n\\n• Gökyüzü kararacak ve kara fırtına kopacak\\n• İlahi yıldırım çarpıp hedefi 30 saniye kül yığınına dönüştürecek\\n• 1 adet Zeus Yıldırımı harcanır\`)) {
        socket.emit('castZeusLightning', { targetUsername: targetName });
        closePlayerInteractionModal();
    }
}`;

// 5. openGiftItemModal: filter out non-giftable props
const oldGiftFilter = `        let propInv = window.myPropInventory || {};
        let ownedPropKeys = Object.keys(propInv).filter(k => k.startsWith('props_') && k !== 'props_none' && propInv[k] > 0);`;

const newGiftFilter = `        let propInv = window.myPropInventory || {};
        const NON_GIFTABLE = [
            'props_pet_izbandut', 'props_izbandut', 'izbandut',
            'props_pet_doberman', 'props_doberman', 'doberman',
            'props_jammer', 'jammer',
            'props_mug_knife', 'props_gasp_bicagi', 'mug_knife',
            'props_zeus_yildirimi', 'zeus_yildirimi'
        ];
        let ownedPropKeys = Object.keys(propInv).filter(k => k.startsWith('props_') && k !== 'props_none' && propInv[k] > 0 && !NON_GIFTABLE.includes(k) && !NON_GIFTABLE.includes(k.replace('props_', '')));`;

const isCRLF = code.includes('\r\n');
const normCode = code.replace(/\r\n/g, '\n');

let updated = normCode;

if (normCode.includes(oldCheckOwnership.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldCheckOwnership.replace(/\r\n/g, '\n'), newCheckOwnership.replace(/\r\n/g, '\n'));
    console.log("1. checkProfileSpecialActionsOwnership patched!");
} else {
    console.error("1. checkProfileSpecialActionsOwnership NOT found!");
}

if (normCode.includes(oldUseJammer.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldUseJammer.replace(/\r\n/g, '\n'), newUseJammer.replace(/\r\n/g, '\n'));
    console.log("2. useJammerOnInteractingPlayer patched!");
} else {
    console.error("2. useJammerOnInteractingPlayer NOT found!");
}

if (normCode.includes(oldUseMug.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldUseMug.replace(/\r\n/g, '\n'), newUseMug.replace(/\r\n/g, '\n'));
    console.log("3. useMugKnifeOnInteractingPlayer patched!");
} else {
    console.error("3. useMugKnifeOnInteractingPlayer NOT found!");
}

if (normCode.includes(oldUseZeus.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldUseZeus.replace(/\r\n/g, '\n'), newUseZeus.replace(/\r\n/g, '\n'));
    console.log("4. useZeusLightningOnInteractingPlayer patched!");
} else {
    console.error("4. useZeusLightningOnInteractingPlayer NOT found!");
}

if (normCode.includes(oldGiftFilter.replace(/\r\n/g, '\n'))) {
    updated = updated.replace(oldGiftFilter.replace(/\r\n/g, '\n'), newGiftFilter.replace(/\r\n/g, '\n'));
    console.log("5. openGiftItemModal patched!");
} else {
    console.error("5. openGiftItemModal NOT found!");
}

fs.writeFileSync('public/js/social.js', isCRLF ? updated.replace(/\n/g, '\r\n') : updated);
console.log("Done updating public/js/social.js!");

