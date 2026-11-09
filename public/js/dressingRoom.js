// public/js/dressingRoom.js - Sanalika Stili "Kıyafetlerim" (Kişisel Gardırop & Kombin Odası)

var isDressingRoomOpen = false;
var dressingAvatar = null;
var dressingCategory = 'hats'; // 'hats', 'faces', 'outfits', 'tshirts', 'pants', 'shoes'
var dressingPage = 1;
const DRESSING_PAGE_SIZE = 9; // 3x3 Izgara

const DRESSING_FACING_KEYS = ['down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left'];
const DRESSING_FACING_LABELS = {
    'down': 'Ön',
    'down-right': 'Sağ Ön',
    'right': 'Sağ Profil',
    'up-right': 'Sağ Arka',
    'up': 'Arka',
    'up-left': 'Sol Arka',
    'left': 'Sol Profil',
    'down-left': 'Sol Ön'
};
let dressingFacingIdx = 0;
let dressingFacing = 'down';

const DRESSING_CATEGORIES = {
    hats: { name: 'Şapkalarım', icon: '🧢' },
    faces: { name: 'Yüz & Gözlüklerim', icon: '🕶️' },
    watches: { name: 'Saatlerim', icon: '⌚' },
    outfits: { name: 'Kostüm & Takımlarım', icon: '👗' },
    hair: { name: 'Saç Modellerim', icon: '💇' },
    tshirts: { name: 'Tişört & Üstlerim', icon: '👕' },
    pants: { name: 'Pantolon & Altlarım', icon: '👖' },
    shoes: { name: 'Ayakkabılarım', icon: '👞' }
};

function openDressingRoomModal() {
    isDressingRoomOpen = true;
    dressingAvatar = JSON.parse(JSON.stringify(myAvatar || {}));
    if (!dressingAvatar.gender && typeof getPlayerGender === 'function') {
        dressingAvatar.gender = getPlayerGender();
    }
    if (!dressingAvatar.model) dressingAvatar.model = 'classic_2';
    if (!dressingAvatar.shirt) dressingAvatar.shirt = dressingAvatar.color || '#3b82f6';
    if (!dressingAvatar.pants) dressingAvatar.pants = 'pants_classic_jeans';
    if (!dressingAvatar.shoes) dressingAvatar.shoes = 'sneakers';
    if (!dressingAvatar.hairColor) dressingAvatar.hairColor = 'original';

    dressingFacingIdx = 0;
    dressingFacing = 'down';
    dressingCategory = 'hats';
    dressingPage = 1;

    const modal = document.getElementById('dressingRoomModal');
    if (modal) modal.style.display = 'flex';

    updateDressingModelUI();
    // Kiyafet, tisort, pantolon denerken mevcut yuz halini (biyik, sakal) koru
        if (category !== 'faces') {
            if (!dressingAvatar.face || dressingAvatar.face === 'none') {
                if (myAvatar && myAvatar.face && myAvatar.face !== 'none') {
                    dressingAvatar.face = myAvatar.face;
                    dressingAvatar.faceColor = myAvatar.faceColor || 'original';
                }
            }
        }
        const currentGen = (typeof getPlayerGender === 'function') ? getPlayerGender() : (window.myGender || (myAvatar && myAvatar.gender) || 'male');
        dressingAvatar.gender = currentGen;
        dressingAvatar.isFemale = (currentGen === 'female');
        dressingAvatar.id = (typeof window !== 'undefined' && window.myId) ? window.myId : (typeof myId !== 'undefined' ? myId : 'preview_self');
    
        updateDressingCategoryCounts();
    selectDressingCategory('hats');
    renderDressingAvatar();
}
window.openDressingRoomModal = openDressingRoomModal;

function closeDressingRoomModal() {
    isDressingRoomOpen = false;
    const modal = document.getElementById('dressingRoomModal');
    if (modal) modal.style.display = 'none';
}
window.closeDressingRoomModal = closeDressingRoomModal;

function getDressingOwnedItems(category, curModel) {
    const normCat = (category === 'watch' || category === 'watches') ? 'watches' : ((category === 'hair' || category === 'hairs') ? 'hair' : (category.endsWith('s') ? category : (category + 's')));
    const prefix = `${normCat}_`;
    let catalog = (window.WARDROBE_CATALOG && window.WARDROBE_CATALOG[category]) || [];
    
    // TAKIM / ELBİSELER SEKEMESİNE: Hayvan Kostümleri ve Görünmezlik Kostümü Ekle
    if (category === 'outfits') {
        const animalCostumes = (window.WARDROBE_CATALOG && window.WARDROBE_CATALOG.costumes) || [];
        const extraCostumes = [];
        if (!catalog.some(i => i.id === 'costume_invisibility')) {
            extraCostumes.push({
                id: 'costume_invisibility',
                name: 'Görünmezlik Kostümü',
                cost: 6000,
                color: '#38bdf8',
                icon: '👻',
                isOutfit: true,
                model: 'all',
                description: 'Giydiğinizde başkaları sizi ve nickinizi asla göremez. Sadece siz kendinizi silüet olarak görürsünüz!'
            });
        }
        animalCostumes.forEach(c => {
            if (c.id !== 'costume_none' && !catalog.some(i => i.id === c.id)) {
                extraCostumes.push({
                    ...c,
                    isOutfit: true
                });
            }
        });
        catalog = [...catalog, ...extraCostumes];
    }

    const catalogMap = new Map();
    catalog.forEach(item => catalogMap.set(item.id, item));

    const ownedList = [];
    const seenKeys = new Set();

    // 1. Envanterdeki dinamik ve renk varyantlı kayıtları tara (Örn: hats_hair_k2_hime_cut__red veya hair_k2_hime_cut__red)
    let invList = [];
    const sourceInv = (typeof window !== 'undefined' && window.myInventory) || (typeof myInventory !== 'undefined' && myInventory);
    if (sourceInv) {
        if (Array.isArray(sourceInv)) {
            invList = invList.concat(sourceInv);
        } else if (typeof sourceInv === 'object') {
            for (let c in sourceInv) {
                if (Array.isArray(sourceInv[c])) {
                    sourceInv[c].forEach(k => {
                        if (k.startsWith(prefix) || k.includes('__')) invList.push(k);
                        else invList.push(`${c}_${k}`);
                    });
                }
            }
        }
    }
    if (typeof currentUserData !== 'undefined' && currentUserData && Array.isArray(currentUserData.inventory)) {
        invList = invList.concat(currentUserData.inventory);
    }

    invList.forEach(rawKey => {
        let cleanKey = rawKey;
        if (category === 'hair') {
            if (cleanKey.startsWith('hairs_')) cleanKey = cleanKey.slice('hairs_'.length);
            else if (cleanKey.startsWith('hats_hair_')) cleanKey = cleanKey.slice('hats_'.length);
            else if (cleanKey.startsWith('hats_')) cleanKey = cleanKey.slice('hats_'.length);
            else if (cleanKey.startsWith('hair_hair_')) cleanKey = cleanKey.slice('hair_'.length);
        } else if (category === 'hats') {
            if (cleanKey.startsWith('hats_')) cleanKey = cleanKey.slice('hats_'.length);
        } else if (category === 'watches') {
            if (cleanKey.startsWith('watches_watch_')) cleanKey = cleanKey.slice('watches_'.length);
            else if (cleanKey.startsWith('watches_')) cleanKey = cleanKey.slice('watches_'.length);
        } else if (cleanKey.startsWith(prefix)) {
            cleanKey = cleanKey.slice(prefix.length);
        } else if (category === 'outfits' && cleanKey.startsWith('costumes_')) {
            cleanKey = cleanKey.slice('costumes_'.length);
        }
        let baseId = cleanKey;
        let colorId = 'original';

        if (cleanKey.includes('__')) {
            const parts = cleanKey.split('__');
            baseId = parts[0];
            colorId = parts[1] || 'original';
        }

        let catItem = catalogMap.get(baseId);
        if (!catItem && category === 'hair' && catalogMap.has('hair_' + baseId)) {
            baseId = 'hair_' + baseId;
            catItem = catalogMap.get(baseId);
        }
        if (!catItem && category === 'watches' && catalogMap.has('watch_' + baseId)) {
            baseId = 'watch_' + baseId;
            catItem = catalogMap.get(baseId);
        }
        if (!catItem) return;

        // Katı segment filtresi: Saçlar çekmecesinde şapka/baret, Şapkalar çekmecesinde saç olamaz
        if (category === 'hair' && baseId.startsWith('baret_')) return;
        if (category === 'hats' && baseId.startsWith('hair_')) return;

        if (typeof itemMatchesModel === 'function' && !itemMatchesModel(catItem.model, curModel, catItem)) {
            return;
        }

        const uniqueKey = `${baseId}__${colorId}`;
        if (seenKeys.has(uniqueKey)) return;
        seenKeys.add(uniqueKey);

        const colorOpt = (window.WARDROBE_COLOR_OPTIONS || []).find(o => o.id === colorId) || { name: 'Orijinal', hex: 'original', bg: '#f59e0b', label: '✨ Orijinal' };

        ownedList.push({
            ...catItem,
            id: baseId,
            colorId: colorId,
            colorHex: colorOpt.hex,
            colorName: colorOpt.name,
            colorBg: colorOpt.bg,
            inventoryKey: rawKey,
            displayName: colorId !== 'original' ? `${catItem.name} (${colorOpt.name})` : catItem.name
        });
    });

    // 2. Ücretsiz veya başlangıçta varsayılan olan katalog eşyaları (none, bere, default jeans vb.)
    catalog.forEach(catItem => {
        const isOwned = (typeof isItemOwned === 'function' && (isItemOwned(category, catItem.id, 'original') || (category === 'outfits' && isItemOwned('costumes', catItem.id, 'original'))));
        if (isOwned) {
            const uniqueKey = `${catItem.id}__original`;
            if (!seenKeys.has(uniqueKey)) {
                if (typeof itemMatchesModel === 'function' && !itemMatchesModel(catItem.model, curModel, catItem)) {
                    return;
                }
                seenKeys.add(uniqueKey);
                ownedList.push({
                    ...catItem,
                    id: catItem.id,
                    colorId: 'original',
                    colorHex: 'original',
                    colorName: 'Orijinal',
                    colorBg: '#f59e0b',
                    inventoryKey: catItem.id.startsWith('costume_') ? `costumes_${catItem.id}` : `${prefix}${catItem.id}`,
                    displayName: catItem.name
                });
            }
        }
    });

    return ownedList;
}
window.getDressingOwnedItems = getDressingOwnedItems;

function updateDressingCategoryCounts() {
    const curModel = (dressingAvatar && dressingAvatar.model) || (myAvatar && myAvatar.model) || 'classic_2';
    const hasOutfit = !!(dressingAvatar && dressingAvatar.outfit && dressingAvatar.outfit !== 'none');
    
    for (let cat in DRESSING_CATEGORIES) {
        const ownedItems = getDressingOwnedItems(cat, curModel);
        const countEl = document.getElementById(`dressingCount_${cat}`);
        if (countEl) {
            if (hasOutfit && (cat === 'tshirts' || cat === 'pants')) {
                countEl.innerHTML = `<span style="color: #9333ea; font-size: 8px; font-weight: 900;">(Takımda)</span>`;
            } else {
                countEl.innerText = `x${ownedItems.length}`;
            }
        }
    }
}
window.updateDressingCategoryCounts = updateDressingCategoryCounts;

function selectDressingCategory(cat) {
    dressingCategory = cat;
    dressingPage = 1;

    // Kategori butonlarında aktif stil güncellemesi
    document.querySelectorAll('.dressing-cat-slot').forEach(el => {
        el.style.border = '1.5px solid #e2e8f0';
        el.style.background = '#f8fafc';
        el.style.boxShadow = 'none';
    });
    const activeSlot = document.getElementById(`dressingSlot_${cat}`);
    if (activeSlot) {
        activeSlot.style.border = '2px solid #9333ea';
        activeSlot.style.background = 'rgba(147, 51, 234, 0.08)';
        activeSlot.style.boxShadow = '0 0 8px rgba(147, 51, 234, 0.35)';
    }

    // Yönelim & Sayfa Açılış Yönü Ayarı:
    // Soldaki butonlar (hats, faces, watches, outfits) için ızgara SOLDA açılır (row-reverse);
    // Sağdaki butonlar (hair, tshirts, pants, shoes) için ızgara SAĞDA açılır (row).
    const isLeftCat = ['hats', 'faces', 'watches', 'outfits'].includes(cat);
    const modalBody = document.getElementById('dressingModalBody');
    const mirrorPanel = document.getElementById('dressingMirrorPanel');
    const gridPanel = document.getElementById('dressingGridPanel');

    if (modalBody) {
        if (isLeftCat) {
            modalBody.style.flexDirection = 'row-reverse';
            if (mirrorPanel) {
                mirrorPanel.style.borderRight = 'none';
                mirrorPanel.style.borderLeft = '1.5px solid #f1f5f9';
            }
            if (gridPanel) {
                gridPanel.style.animation = 'none';
                void gridPanel.offsetHeight; // Reflow tetikle
                gridPanel.style.animation = 'dressingSlideFromLeft 0.18s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        } else {
            modalBody.style.flexDirection = 'row';
            if (mirrorPanel) {
                mirrorPanel.style.borderLeft = 'none';
                mirrorPanel.style.borderRight = '1.5px solid #f1f5f9';
            }
            if (gridPanel) {
                gridPanel.style.animation = 'none';
                void gridPanel.offsetHeight; // Reflow tetikle
                gridPanel.style.animation = 'dressingSlideFromRight 0.18s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        }
    }

    // Başlık güncelle
    const info = DRESSING_CATEGORIES[cat] || { name: 'Kıyafetlerim', icon: '👗' };
    const titleEl = document.getElementById('dressingCategoryTitle');
    if (titleEl) titleEl.innerText = `${info.icon} ${info.name}`;

    renderDressingCategoryUI();
}
window.selectDressingCategory = selectDressingCategory;

function renderDressingCategoryUI() {
    const grid = document.getElementById('dressingItemsGrid');
    if (!grid) return;

    const curModel = (dressingAvatar && dressingAvatar.model) || (myAvatar && myAvatar.model) || 'classic_2';
    const ownedItems = getDressingOwnedItems(dressingCategory, curModel);

    const badgeEl = document.getElementById('dressingCategoryOwnedBadge');
    if (badgeEl) badgeEl.innerText = `${ownedItems.length} Eşya`;

    const totalPages = Math.max(1, Math.ceil(ownedItems.length / DRESSING_PAGE_SIZE));
    if (dressingPage > totalPages) dressingPage = totalPages;
    if (dressingPage < 1) dressingPage = 1;

    const pageText = document.getElementById('dressingPageText');
    if (pageText) pageText.innerText = `${dressingPage} / ${totalPages}`;

    const startIdx = (dressingPage - 1) * DRESSING_PAGE_SIZE;
    const pageItems = ownedItems.slice(startIdx, startIdx + DRESSING_PAGE_SIZE);

    let html = '';

    for (let i = 0; i < DRESSING_PAGE_SIZE; i++) {
        if (i < pageItems.length) {
            const item = pageItems[i];
            let isEquipped = false;

            if (dressingCategory === 'hats') {
                const curCol = dressingAvatar.hatColor || 'original';
                isEquipped = (dressingAvatar.hat === item.id || (!dressingAvatar.hat && item.id === 'none')) && (curCol === item.colorHex || (curCol === 'original' && item.colorId === 'original'));
            } else if (dressingCategory === 'hair') {
                const curCol = dressingAvatar.hairColor || 'original';
                isEquipped = (dressingAvatar.hair === item.id || (!dressingAvatar.hair && item.id === 'none')) && (curCol === item.colorHex || (curCol === 'original' && item.colorId === 'original'));
            } else if (dressingCategory === 'faces') {
                const curCol = dressingAvatar.faceColor || 'original';
                isEquipped = (dressingAvatar.face === item.id) && (curCol === item.colorHex || (curCol === 'original' && item.colorId === 'original'));
            } else if (dressingCategory === 'watches') {
                isEquipped = (dressingAvatar.watch === item.id || (!dressingAvatar.watch && item.id === 'none'));
            } else if (dressingCategory === 'outfits') {
                const curCol = dressingAvatar.outfitColor || dressingAvatar.color || 'original';
                if (item.id === 'costume_invisibility') {
                    isEquipped = (dressingAvatar.outfit === 'costume_invisibility' || dressingAvatar.costume === 'costume_invisibility');
                } else if (item.id && item.id.startsWith('costume_')) {
                    isEquipped = (dressingAvatar.costume === item.id || dressingAvatar.outfit === item.id);
                } else {
                    isEquipped = (dressingAvatar.outfit === item.id) && (curCol === item.colorHex || (curCol === 'original' && item.colorId === 'original'));
                }
            } else if (dressingCategory === 'tshirts') {
                const curCol = dressingAvatar.shirtColor || dressingAvatar.color || 'original';
                isEquipped = (!dressingAvatar.outfit && (dressingAvatar.shirt === item.id || dressingAvatar.color === item.id)) && (curCol === item.colorHex || (curCol === 'original' && item.colorId === 'original'));
            } else if (dressingCategory === 'pants') {
                const curCol = dressingAvatar.pantsColor || 'original';
                isEquipped = (!dressingAvatar.outfit && dressingAvatar.pants === item.id) && (curCol === item.colorHex || (curCol === 'original' && item.colorId === 'original'));
            } else if (dressingCategory === 'shoes') {
                const curCol = dressingAvatar.shoesColor || 'original';
                isEquipped = (dressingAvatar.shoes === item.id) && (curCol === item.colorHex || (curCol === 'original' && item.colorId === 'original'));
            }

            let visual = '';
            if (item.icon) {
                visual = `<div style="font-size: 26px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">${item.icon}</div>`;
            } else if (item.color) {
                visual = `<div style="width: 28px; height: 28px; border-radius: 6px; background: ${item.color}; border: 1.5px solid rgba(0,0,0,0.15);"></div>`;
            }

            // Satın alınan renk rozeti (Ayrı eşya olarak rengini gösterir)
            let colorBadge = '';
            if (item.colorId && item.colorId !== 'original') {
                colorBadge = `
                    <div style="position: absolute; top: 3px; left: 3px; z-index: 5; display: flex; align-items: center; gap: 3px; background: rgba(15,23,42,0.85); padding: 1px 4px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.3); pointer-events: none;">
                        <span style="width: 7px; height: 7px; border-radius: 50%; background: ${item.colorBg}; display: inline-block; border: 1px solid #fff;"></span>
                        <span style="font-size: 7.5px; font-weight: 800; color: #f8fafc;">${item.colorName}</span>
                    </div>
                `;
            }

            // Kuşanılmışsa kırmızı '✕' çıkarma butonu
            let unequipBadge = '';
            if (isEquipped && item.id !== 'none' && item.id !== 'costume_none') {
                unequipBadge = `
                    <button type="button" 
                            title="Çıkar"
                            onclick="event.stopPropagation(); unequipDressingItem('${dressingCategory}', '${item.id}');"
                            style="position: absolute; top: 3px; right: 3px; z-index: 6; width: 16px; height: 16px; border-radius: 50%; background: #ef4444; color: white; border: 1.5px solid #ffffff; font-weight: 900; font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">
                        ✕
                    </button>
                `;
            }

            const activeCardStyle = isEquipped
                ? 'background: #ede9fe; border: 2px solid #9333ea; box-shadow: inset 0 0 6px rgba(147, 51, 234, 0.2);'
                : 'background: #ffffff; border: 1px solid #e2e8f0;';

            const equippedRedLine = isEquipped
                ? `<div style="position: absolute; bottom: 5px; width: 55%; height: 2px; background: #ef4444; border-radius: 1px;"></div>`
                : '';

            html += `
                <div class="dressing-item-slot" 
                     onclick="equipDressingItem('${dressingCategory}', '${item.id}', '${item.colorHex}', '${item.colorId}')"
                     title="${item.displayName}"
                     style="aspect-ratio: 1; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; position: relative; padding: 4px; transition: all 0.15s; ${activeCardStyle}">
                    ${colorBadge}
                    ${unequipBadge}
                    ${visual}
                    ${equippedRedLine}
                    <div style="font-size: 9px; font-weight: 700; color: #334155; text-align: center; margin-top: 2px; width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        ${item.displayName}
                    </div>
                </div>
            `;
        } else {
            // Boş Sanalika kutusu
            html += `
                <div style="aspect-ratio: 1; border-radius: 10px; background: #ffffff; border: 1.5px dashed #e2e8f0; display: flex; align-items: center; justify-content: center;">
                </div>
            `;
        }
    }

    grid.innerHTML = html;
}
window.renderDressingCategoryUI = renderDressingCategoryUI;

function equipDressingItem(category, id, colorHex = 'original', colorId = 'original') {
    if (!dressingAvatar) return;

    if (category === 'hats') {
        dressingAvatar.hat = id;
        dressingAvatar.hatColor = colorHex;
    } else if (category === 'hair') {
        dressingAvatar.hair = id;
        dressingAvatar.hairColor = colorHex;
    } else if (category === 'faces') {
        dressingAvatar.face = id;
        dressingAvatar.faceColor = colorHex;
    } else if (category === 'watches') {
        dressingAvatar.watch = id;
    } else if (category === 'outfits') {
        // Eğer zaten bu kostüm veya görünmezlik kostümü kuşanılmışsa: ÇIKAR (toggle unequip)!
        let isAlready = false;
        if (id === 'costume_invisibility' || id === 'invisibility') {
            isAlready = (dressingAvatar.outfit === 'costume_invisibility' || dressingAvatar.costume === 'costume_invisibility');
        } else if (id && id.startsWith('costume_')) {
            isAlready = (dressingAvatar.costume === id || dressingAvatar.outfit === id);
        } else {
            isAlready = (dressingAvatar.outfit === id);
        }

        if (isAlready || id === 'costume_none') {
            unequipDressingItem('outfits', id);
            return;
        }

        // TAKIM HEM ÜSTÜ HEM ALTI KAPSAR: Ayrık Tişört ve Pantolon seçimleri çıkarılır
        dressingAvatar.outfit = id;
        dressingAvatar.outfitColor = colorHex;
        dressingAvatar.shirtColor = colorHex;
        dressingAvatar.color = colorHex;
        dressingAvatar.shirt = null;
        dressingAvatar.pants = null;

        if (id === 'costume_invisibility' || id === 'invisibility') {
            dressingAvatar.costume = null;
            dressingAvatar.outfit = 'costume_invisibility';
        } else if (id && id.startsWith('costume_') && id !== 'costume_none') {
            dressingAvatar.costume = id;
            dressingAvatar.outfit = id;
        } else {
            dressingAvatar.costume = null;
        }
    } else if (category === 'tshirts') {
        dressingAvatar.costume = null;
        dressingAvatar.outfit = null;
        dressingAvatar.outfit = null;
        dressingAvatar.shirt = id;
        dressingAvatar.shirtColor = colorHex;
        dressingAvatar.color = colorHex;
        if (!dressingAvatar.pants) {
            dressingAvatar.pants = (dressingAvatar.model === 'karakter_2' ? 'pants_k2_tactical_jogger' : 'pants_classic_jeans');
        }
    } else if (category === 'pants') {
        dressingAvatar.outfit = null;
        dressingAvatar.pants = id;
        dressingAvatar.pantsColor = colorHex;
        if (!dressingAvatar.shirt) {
            dressingAvatar.shirt = (dressingAvatar.model === 'karakter_2' ? 'k2_cyber_street' : '#3b82f6');
            dressingAvatar.shirtColor = dressingAvatar.shirt;
            dressingAvatar.color = dressingAvatar.shirt;
        }
    } else if (category === 'shoes') {
        dressingAvatar.shoes = id;
        dressingAvatar.shoesColor = colorHex;
    }

    updateDressingCategoryCounts();
    renderDressingCategoryUI();
    renderDressingAvatar();
}
window.equipDressingItem = equipDressingItem;

function unequipDressingItem(category, id) {
    if (!dressingAvatar) return;

    if (category === 'hats') {
        dressingAvatar.hat = 'none';
        dressingAvatar.hatColor = 'original';
    } else if (category === 'hair') {
        dressingAvatar.hair = 'none';
        dressingAvatar.hairColor = 'original';
    } else if (category === 'faces') {
        dressingAvatar.face = 'none';
        dressingAvatar.faceColor = 'original';
    } else if (category === 'watches') {
        dressingAvatar.watch = 'none';
    } else if (category === 'outfits') {
        // Takım ve kostüm çıkarılınca standart tişört ve pantolon geri giyilir
        dressingAvatar.outfit = null;
        dressingAvatar.costume = null;
        dressingAvatar.outfitColor = 'original';
        const isFem = (dressingAvatar.isFemale || dressingAvatar.gender === 'female');
        dressingAvatar.shirt = (dressingAvatar.model === 'karakter_2' ? (isFem ? 'top_k2_cyber_crop' : 'k2_cyber_street') : (isFem ? '#ec4899' : '#3b82f6'));
        dressingAvatar.color = dressingAvatar.shirt;
        dressingAvatar.shirtColor = 'original';
        dressingAvatar.pants = (dressingAvatar.model === 'karakter_2' ? (isFem ? 'pants_k2_cargo_mini' : 'pants_k2_tactical_jogger') : 'pants_classic_jeans');
        dressingAvatar.pantsColor = 'original';
    } else if (category === 'tshirts') {
        dressingAvatar.shirt = (dressingAvatar.model === 'karakter_2' ? 'k2_cyber_street' : '#3b82f6');
        dressingAvatar.color = dressingAvatar.shirt;
        dressingAvatar.shirtColor = 'original';
    } else if (category === 'pants') {
        dressingAvatar.pants = (dressingAvatar.model === 'karakter_2' ? 'pants_k2_tactical_jogger' : 'pants_classic_jeans');
        dressingAvatar.pantsColor = 'original';
    } else if (category === 'shoes') {
        dressingAvatar.shoes = 'none';
        dressingAvatar.shoesColor = 'original';
    }

    updateDressingCategoryCounts();
    renderDressingCategoryUI();
    renderDressingAvatar();
}
window.unequipDressingItem = unequipDressingItem;

function changeDressingPage(delta) {
    const curModel = (dressingAvatar && dressingAvatar.model) || (myAvatar && myAvatar.model) || 'classic_2';
    const ownedItems = getDressingOwnedItems(dressingCategory, curModel);

    const totalPages = Math.max(1, Math.ceil(ownedItems.length / DRESSING_PAGE_SIZE));
    dressingPage = Math.max(1, Math.min(totalPages, dressingPage + delta));
    renderDressingCategoryUI();
}
window.changeDressingPage = changeDressingPage;

function rotateDressingAvatar(delta) {
    dressingFacingIdx = (dressingFacingIdx + delta + DRESSING_FACING_KEYS.length) % DRESSING_FACING_KEYS.length;
    dressingFacing = DRESSING_FACING_KEYS[dressingFacingIdx];

    const badge = document.getElementById('dressingAngleBadge');
    if (badge) badge.innerText = DRESSING_FACING_LABELS[dressingFacing] || 'Ön';

    renderDressingAvatar();
}
window.rotateDressingAvatar = rotateDressingAvatar;

function renderDressingAvatar() {
    const canvas = document.getElementById('dressingAvatarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cX = canvas.width / 2;
    const cY = 125;

    // Zemin hafif Sanalika elips gölgesi
    ctx.fillStyle = 'rgba(147, 51, 234, 0.12)';
    ctx.beginPath();
    ctx.ellipse(cX, cY + 22, 44, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cX, cY + 22, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cX, cY);
    ctx.scale(1.7, 1.7);

    const av = dressingAvatar || myAvatar;
    const isWearingInvis = !!(av && (av.outfit === 'costume_invisibility' || av.costume === 'costume_invisibility'));
    const costumeId = av && (av.costume || (av.outfit && av.outfit.startsWith('costume_') && av.outfit !== 'costume_invisibility' ? av.outfit : null));

    if (isWearingInvis) {
        ctx.save();
        ctx.globalAlpha = 0.38;
        ctx.shadowColor = "rgba(56, 189, 248, 0.85)";
        ctx.shadowBlur = 10;
        const isK2 = (av && av.model === 'karakter_2');
        if (isK2 && typeof Karakter2Renderer !== 'undefined') {
            Karakter2Renderer.draw(ctx, 0, 0, av, dressingFacing, false, 0, 0, false, true);
        } else if (typeof drawClassic2Avatar === 'function') {
            drawClassic2Avatar(ctx, 0, 0, av, dressingFacing, false, 0, 0, false, true);
        }
        ctx.restore();
    } else if (typeof AnimalCostumeRenderer !== 'undefined' && AnimalCostumeRenderer.isCostume(costumeId)) {
        AnimalCostumeRenderer.draw(ctx, 0, 0, av, dressingFacing, false, false, 0, true);
    } else if (typeof ZombieCostumeRenderer !== 'undefined' && ZombieCostumeRenderer.isCostume(costumeId)) {
        ZombieCostumeRenderer.draw(ctx, 0, 0, av, dressingFacing, false, false, 0, true);
    } else {
        const isK2 = (av && av.model === 'karakter_2');
        if (isK2 && typeof Karakter2Renderer !== 'undefined') {
            Karakter2Renderer.draw(ctx, 0, 0, av, dressingFacing, false, 0, 0, false, true);
        } else if (typeof drawClassic2Avatar === 'function') {
            drawClassic2Avatar(ctx, 0, 0, av, dressingFacing, false, 0, 0, false, true);
        }
    }

    ctx.restore();
}
window.renderDressingAvatar = renderDressingAvatar;

function saveAndApplyDressingOutfit() {
    if (!dressingAvatar) return;

    try {
        // Model ve kıyafet kombinasyonunu sunucuya kaydet
        if (typeof socket !== 'undefined' && socket.emit) {
            socket.emit('setAvatarModel', { model: dressingAvatar.model });
            socket.emit('saveDressingOutfit', { avatar: dressingAvatar });
        }

        // Görünmezlik kostümü çıkarıldıysa görünmezlik süresini sıfırla
        if (dressingAvatar.outfit !== 'costume_invisibility' && dressingAvatar.costume !== 'costume_invisibility') {
            dressingAvatar.invisibilityExpiresAt = 0;
            if (typeof myAvatar !== 'undefined') myAvatar.invisibilityExpiresAt = 0;
            if (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) {
                players[myId].invisibilityExpiresAt = 0;
            }
        }

        // Client tarafında anında güncelle
        myAvatar = { ...myAvatar, ...dressingAvatar };
        if (typeof window.previewAvatar !== 'undefined') {
            window.previewAvatar = { ...myAvatar };
        }
        if (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) {
            players[myId].model = dressingAvatar.model;
            players[myId].face = dressingAvatar.face;
            players[myId].hat = dressingAvatar.hat;
            players[myId].hair = dressingAvatar.hair;
            players[myId].watch = dressingAvatar.watch;
            players[myId].shirt = dressingAvatar.shirt;
            players[myId].pants = dressingAvatar.pants;
            players[myId].shoes = dressingAvatar.shoes;
            players[myId].outfit = dressingAvatar.outfit;
            players[myId].costume = dressingAvatar.costume;
            Object.assign(players[myId], myAvatar);
            if (players[myId].avatar) {
                Object.assign(players[myId].avatar, myAvatar);
            }
        }

        if (typeof updateModelSelectorUI === 'function') {
            try { updateModelSelectorUI(); } catch (e) { console.warn(e); }
        }
        if (typeof renderWardrobeUI === 'function') {
            try { renderWardrobeUI(); } catch (e) { console.warn(e); }
        }
        if (typeof drawAvatarPreview === 'function') {
            try { drawAvatarPreview(); } catch (e) { console.warn(e); }
        }
    } catch (outerErr) {
        console.error('Error during saveAndApplyDressingOutfit:', outerErr);
    } finally {
        closeDressingRoomModal();
    }
}
window.saveAndApplyDressingOutfit = saveAndApplyDressingOutfit;


function updateDressingModelUI() {
    const curModel = (dressingAvatar && dressingAvatar.model) || 'classic_2';
    const isK2 = (curModel === 'karakter_2');
    const btn1 = document.getElementById('dressingBtnModel1');
    const btn2 = document.getElementById('dressingBtnModel2');

    const resetBtn = (btn) => {
        if (!btn) return;
        btn.style.background = 'transparent';
        btn.style.color = '#64748b';
        btn.style.boxShadow = 'none';
    };

    resetBtn(btn1);
    resetBtn(btn2);

    if (isK2 && btn2) {
        btn2.style.background = 'linear-gradient(135deg, #a855f7, #7e22ce)';
        btn2.style.color = '#ffffff';
        btn2.style.boxShadow = '0 2px 6px rgba(126, 34, 206, 0.4)';
    } else if (btn1) {
        btn1.style.background = 'linear-gradient(135deg, #38bdf8, #0284c7)';
        btn1.style.color = '#ffffff';
        btn1.style.boxShadow = '0 2px 6px rgba(2, 132, 199, 0.4)';
    }
}
window.updateDressingModelUI = updateDressingModelUI;

function switchDressingModel(modelId) {
    if (!dressingAvatar) return;
    const validModel = (modelId === 'karakter_2' || modelId === 'character_2') ? 'karakter_2' : 'classic_2';
    if (dressingAvatar.model === validModel) return;

    dressingAvatar.model = validModel;

    if (validModel === 'karakter_2') {
        const isFem = (dressingAvatar.isFemale || dressingAvatar.gender === 'female');
        if (!dressingAvatar.hairColor) dressingAvatar.hairColor = 'original';
        if (!dressingAvatar.hat || dressingAvatar.hat === 'none' || dressingAvatar.hat === 'bere') {
            dressingAvatar.hat = isFem ? 'hair_k2_wavy_shoulder' : 'hair_k2_anime_spiky';
        }
        if (dressingAvatar.outfit === 'outfit_c2_gentleman') {
            dressingAvatar.outfit = null;
        }
        if (!dressingAvatar.outfit) {
            if (!dressingAvatar.shirt || dressingAvatar.shirt === '#3b82f6' || dressingAvatar.shirt === '#ec4899') {
                dressingAvatar.shirt = isFem ? 'top_k2_cyber_crop' : 'k2_cyber_street';
                dressingAvatar.color = dressingAvatar.shirt;
            }
            if (!dressingAvatar.pants || dressingAvatar.pants === 'pants_classic_jeans') {
                dressingAvatar.pants = isFem ? 'pants_k2_cargo_mini' : 'pants_k2_tactical_jogger';
            }
        }
    } else {
        if (dressingAvatar.hat && dressingAvatar.hat.startsWith('hair_k2_')) {
            dressingAvatar.hat = 'bere';
        }
        if (!dressingAvatar.outfit) {
            if (dressingAvatar.shirt && dressingAvatar.shirt.startsWith('k2_')) {
                dressingAvatar.shirt = '#3b82f6';
                dressingAvatar.color = '#3b82f6';
            }
            if (dressingAvatar.pants && dressingAvatar.pants.startsWith('pants_k2_')) {
                dressingAvatar.pants = 'pants_classic_jeans';
            }
        }
    }

    updateDressingModelUI();
    updateDressingCategoryCounts();
    renderDressingCategoryUI();
    renderDressingAvatar();
}
window.switchDressingModel = switchDressingModel;

// Renk seçimi yalnızca satın alırken (Gardırop) yapılır; Kıyafetlerim sekmesinde her renk ayrı eşyadır.

