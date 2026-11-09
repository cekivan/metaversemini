const config = require('../config');
const dataManager = require('../dataManager');
const petManager = require('../petManager');
const { checkRateLimit } = require('../utils/securityUtils');
const { registerMysteryBoxHandlers } = require('./mysteryBoxHandler');

// Kuğu Bisikleti 5 Dakikalık Kiralama Zamanlayıcıları Havuzu
const playerSwanTimers = {};
// Dostlar Kıraathanesi İçecek 3 Dakikalık Elde Tutma Zamanlayıcıları
const playerKiraathaneDrinkTimers = {};
// Tropik Sahil Barı Kokteyl 5 Dakikalık (300sn) Elde Tutma Zamanlayıcıları
const playerCocktailTimers = {};

function registerEconomyHandlers(io, socket, players, helpers) {
    const { playerFishingTimers, playerTeaTimers, givePlayerTeaWithTimer, getAdminOnlineUsers, getAdminSanctionsList, getPlayersInRoom } = helpers;

    // 1. GARDIROR VE KIYAFET SATIN ALMA
    socket.on('buyWardrobeItem', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'buyWardrobe', 5, 2000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        let cat = data.category;
        let normCat = (cat === 'watch' || cat === 'watches') ? 'watches' : ((cat === 'hair' || cat === 'hairs') ? 'hair' : (cat.endsWith('s') ? cat : (cat + 's')));
        let singleCat = (cat === 'watches' || cat === 'watch') ? 'watch' : ((cat === 'hair' || cat === 'hairs') ? 'hair' : (cat.endsWith('s') ? cat.slice(0, -1) : cat));
        let itemId = data.id;

        let itemKey = `${normCat}_${itemId}`;
        let altKey = itemId.startsWith(normCat + '_') ? itemId : null;
        let itemCost = 5;
        if (config.WARDROBE_ITEM_PRICES[itemKey] !== undefined) {
            itemCost = config.WARDROBE_ITEM_PRICES[itemKey];
        } else if (altKey && config.WARDROBE_ITEM_PRICES[altKey] !== undefined) {
            itemCost = config.WARDROBE_ITEM_PRICES[altKey];
            itemKey = altKey;
        } else if (config.WARDROBE_ITEM_PRICES[`hats_${itemId}`] !== undefined) {
            itemCost = config.WARDROBE_ITEM_PRICES[`hats_${itemId}`];
        } else if (config.WARDROBE_ITEM_PRICES[itemId] !== undefined) {
            itemCost = config.WARDROBE_ITEM_PRICES[itemId];
        }
        let isFree = (itemCost === 0 || itemId === 'none' || itemId === 'watch_none' || itemId === '#facc15' || itemId === '#3b82f6' || itemId === 'pants_classic_jeans' || ((singleCat === 'hair' || singleCat === 'hat') && itemId === 'none'));

        if (normCat === 'props' && itemId !== 'none') {
            if (userData.money < itemCost) {
                socket.emit('gameError', `Yetersiz bakiye! Bu eşya ${itemCost} TL. Bakiyeniz: ${userData.money} TL.`);
                return;
            }
            userData.money -= itemCost;
            if (players[socket.id]) players[socket.id].money = userData.money;
            if (!userData.propInventory) userData.propInventory = {};
            userData.propInventory[itemKey] = (userData.propInventory[itemKey] || 0) + 1;

            if (!userData.inventory) userData.inventory = [];
            if (!userData.inventory.includes(itemKey)) userData.inventory.push(itemKey);

            if (itemId === 'cay') {
                givePlayerTeaWithTimer(socket.id, username, 300000);
                dataManager.recordQuestProgress(username, 'drink_tea', 1);
            } else {
                userData.avatar.heldItem = itemId;
                players[socket.id].heldItem = itemId;
            }

            dataManager.savePersistentData();
            socket.emit('moneyUpdate', userData.money);
            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
            io.to(players[socket.id].room).emit('playerAvatarChange', {
                id: socket.id,
                avatar: userData.avatar,
                heldItem: players[socket.id].heldItem
            });
            socket.emit('systemMessage', `✅ 1 adet ${itemId} satın aldın! Çantandaki toplam: ${userData.propInventory[itemKey]} adet.`);
            return;
        }

        // Sanalika Stili Renk Eşleştirmesi ve Normalizasyonu
        const COLOR_MAP = {
            'original': 'original',
            'red': '#dc2626',
            'blonde': '#facc15',
            'green': '#10b981',
            'blue': '#0284c7',
            'navy': '#1e3a8a',
            'black': '#18181b',
            'white': '#ffffff',
            'pink': '#ec4899',
            'purple': '#9333ea',
            'brown': '#92400e',
            '#dc2626': '#dc2626',
            '#facc15': '#facc15',
            '#10b981': '#10b981',
            '#0284c7': '#0284c7',
            '#1e3a8a': '#1e3a8a',
            '#18181b': '#18181b',
            '#ffffff': '#ffffff',
            '#ec4899': '#ec4899',
            '#9333ea': '#9333ea',
            '#92400e': '#92400e'
        };
        const COLOR_TO_ID = {
            'original': 'original',
            'red': 'red',
            '#dc2626': 'red',
            'navy': 'navy',
            '#1e3a8a': 'navy',
            'blonde': 'blonde',
            '#facc15': 'blonde',
            'green': 'green',
            '#10b981': 'green',
            'blue': 'blue',
            '#0284c7': 'blue',
            'black': 'black',
            '#18181b': 'black',
            'white': 'white',
            '#ffffff': 'white',
            'pink': 'pink',
            '#ec4899': 'pink',
            'purple': 'purple',
            '#9333ea': 'purple',
            'brown': 'brown',
            '#92400e': 'brown'
        };

        const rawColor = data.color || (singleCat === 'hat' ? data.hairColor : (singleCat === 'face' ? data.faceColor : null)) || 'original';
        const colorId = COLOR_TO_ID[rawColor] || 'original';
        const colorHex = COLOR_MAP[rawColor] || 'original';

        // Renk varyantı destekleyen giyim kategorileri (props, skins ve kostümler hariç)
        const supportsVariants = !['props', 'skins', 'costumes'].includes(normCat) && !itemId.startsWith('costume_');
        const variantKey = (supportsVariants && colorId !== 'original') ? `${itemKey}__${colorId}` : itemKey;

        let isAlreadyOwned = isFree || (userData.inventory && (
            userData.inventory.includes(variantKey) ||
            userData.inventory.includes(itemKey) ||
            (colorId === 'original' && userData.inventory.includes(itemKey))
        ));

        if (!isAlreadyOwned) {
            if (userData.money < itemCost) {
                socket.emit('gameError', `Yetersiz bakiye! Bu eşya ${itemCost} TL. Bakiyeniz: ${userData.money} TL.`);
                return;
            }
            userData.money -= itemCost;
            if (players[socket.id]) players[socket.id].money = userData.money;
            if (!userData.inventory) userData.inventory = [];
            const keyToPush = (supportsVariants && colorId !== 'original') ? variantKey : itemKey;
            if (!userData.inventory.includes(keyToPush)) userData.inventory.push(keyToPush);
            if (!userData.inventory.includes(itemKey)) userData.inventory.push(itemKey);
        }

        if (singleCat === 'hat') {
            userData.avatar.hat = itemId;
            players[socket.id].hat = itemId;
            userData.avatar.hatColor = colorHex;
            players[socket.id].hatColor = colorHex;
        } else if (singleCat === 'hair') {
            userData.avatar.hair = itemId;
            players[socket.id].hair = itemId;
            userData.avatar.hairColor = colorHex;
            players[socket.id].hairColor = colorHex;
        } else if (singleCat === 'face') {
            userData.avatar.face = itemId;
            players[socket.id].face = itemId;
            userData.avatar.faceColor = colorHex;
            players[socket.id].faceColor = colorHex;
        } else if (singleCat === 'skin') {
            userData.avatar.skinColor = itemId;
            players[socket.id].skinColor = itemId;
        } else if (singleCat === 'outfit') {
            userData.avatar.outfit = itemId;
            userData.avatar.outfitColor = colorHex;
            userData.avatar.shirtColor = colorHex;
            userData.avatar.color = colorHex;
            userData.avatar.shirt = null; // Takım giyildiğinde ayrık tişört çıkar
            userData.avatar.pants = null; // Takım giyildiğinde ayrık pantolon çıkar
            players[socket.id].outfit = itemId;
            players[socket.id].outfitColor = colorHex;
            players[socket.id].color = colorHex;
            players[socket.id].shirt = null;
            players[socket.id].pants = null;
        } else if (singleCat === 'tshirt' || singleCat === 'shirt') {
            userData.avatar.shirt = itemId;
            userData.avatar.shirtColor = colorHex;
            userData.avatar.color = colorHex;
            userData.avatar.outfit = null; // Tişört giyildiğinde takım çıkar
            if (!userData.avatar.pants) {
                userData.avatar.pants = (userData.avatar.model === 'karakter_2' ? 'pants_k2_tactical_jogger' : 'pants_classic_jeans');
            }
            players[socket.id].shirt = itemId;
            players[socket.id].shirtColor = colorHex;
            players[socket.id].color = colorHex;
            players[socket.id].outfit = null;
            players[socket.id].pants = userData.avatar.pants;
        } else if (singleCat === 'pant') {
            userData.avatar.pants = itemId;
            userData.avatar.pantsColor = colorHex;
            userData.avatar.outfit = null; // Pantolon giyildiğinde takım çıkar
            if (!userData.avatar.shirt) {
                userData.avatar.shirt = (userData.avatar.model === 'karakter_2' ? 'k2_cyber_street' : '#3b82f6');
                userData.avatar.shirtColor = userData.avatar.shirt;
                userData.avatar.color = userData.avatar.shirt;
            }
            players[socket.id].pants = itemId;
            players[socket.id].pantsColor = colorHex;
            players[socket.id].outfit = null;
            players[socket.id].shirt = userData.avatar.shirt;
            players[socket.id].color = userData.avatar.color;
        } else if (singleCat === 'shoe') {
            userData.avatar.shoes = itemId;
            userData.avatar.shoesColor = colorHex;
            players[socket.id].shoes = itemId;
            players[socket.id].shoesColor = colorHex;
        } else if (singleCat === 'watch') {
            userData.avatar.watch = itemId;
            players[socket.id].watch = itemId;
        } else if (singleCat === 'costume' || normCat === 'costumes' || (itemId && itemId.startsWith('costume_'))) {
            if (itemId === 'costume_none' || itemId === 'none') {
                userData.avatar.costume = null;
                players[socket.id].costume = null;
            } else {
                userData.avatar.costume = itemId;
                players[socket.id].costume = itemId;
            }
        } else if (singleCat === 'prop' || normCat === 'props') {
            userData.avatar.heldItem = itemId;
            players[socket.id].heldItem = itemId;
            if (itemId === 'none') {
                if (players[socket.id].hasTea) players[socket.id].hasTea = false;
                if (playerTeaTimers && playerTeaTimers[socket.id]) {
                    clearTimeout(playerTeaTimers[socket.id]);
                    delete playerTeaTimers[socket.id];
                }
                userData.teaExpiresAt = null;
                socket.emit('systemMessage', "✋ Elindeki eşyayı bıraktın.");
            }
        }

        dataManager.saveUserData(username);

        socket.emit('moneyUpdate', userData.money);
        socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
        if (normCat === 'props') {
            socket.emit('propInventoryUpdate', userData.propInventory || {});
        }

        let updatedAvatar = userData.avatar;
        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: updatedAvatar,
            model: updatedAvatar.model || 'classic_2',
            hat: updatedAvatar.hat,
            face: updatedAvatar.face,
            skinColor: updatedAvatar.skinColor,
            hairColor: updatedAvatar.hairColor,
            hatColor: updatedAvatar.hatColor,
            faceColor: updatedAvatar.faceColor,
            outfitColor: updatedAvatar.outfitColor,
            shirtColor: updatedAvatar.shirtColor,
            pantsColor: updatedAvatar.pantsColor,
            shoesColor: updatedAvatar.shoesColor,
            color: updatedAvatar.color,
            shirt: updatedAvatar.shirt,
            pants: updatedAvatar.pants,
            outfit: updatedAvatar.outfit,
            heldItem: updatedAvatar.heldItem,
            shoes: updatedAvatar.shoes,
            watch: updatedAvatar.watch,
            costume: updatedAvatar.costume,
            gender: updatedAvatar.gender
        });
    });

    // 1.04 KIYAFETLERİM (SANALİKA DRESSING ROOM - SAHİP OLUNAN KIYAFETLERİ KAYDETME)
    socket.on('saveDressingOutfit', (data) => {
        if (!players[socket.id] || !data || !data.avatar) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData || !userData.avatar) return;

        const newAv = data.avatar;
        if (newAv.model !== undefined) {
            let validModel = (newAv.model === 'karakter_2' || newAv.model === 'character_2') ? 'karakter_2' : 'classic_2';
            userData.avatar.model = validModel;
            players[socket.id].model = validModel;
        }
        if (newAv.hat !== undefined) userData.avatar.hat = newAv.hat;
        if (newAv.hair !== undefined) {
            userData.avatar.hair = newAv.hair;
            players[socket.id].hair = newAv.hair;
        }
        if (newAv.face !== undefined) userData.avatar.face = newAv.face;
        if (newAv.hairColor !== undefined) userData.avatar.hairColor = newAv.hairColor;
        if (newAv.outfit !== undefined && newAv.outfit !== null && newAv.outfit !== 'none') {
            userData.avatar.outfit = newAv.outfit;
            userData.avatar.shirtColor = newAv.outfit;
            userData.avatar.color = newAv.outfit;
            userData.avatar.shirt = null; // Takım giyildiğinde tişört ve pantolon çıkar
            userData.avatar.pants = null;
            players[socket.id].shirt = null;
            players[socket.id].pants = null;
        } else {
            userData.avatar.outfit = null;
            players[socket.id].outfit = null;
            if (newAv.shirt !== undefined) {
                userData.avatar.shirt = newAv.shirt;
                userData.avatar.shirtColor = newAv.shirt;
                userData.avatar.color = newAv.shirt;
            }
            if (newAv.pants !== undefined) userData.avatar.pants = newAv.pants;
        }
        if (newAv.shoes !== undefined) userData.avatar.shoes = newAv.shoes;
        if (newAv.skinColor !== undefined) userData.avatar.skinColor = newAv.skinColor;
        if (newAv.watch !== undefined) userData.avatar.watch = newAv.watch;
        if (newAv.hatColor !== undefined) userData.avatar.hatColor = newAv.hatColor;
        if (newAv.faceColor !== undefined) userData.avatar.faceColor = newAv.faceColor;
        if (newAv.outfitColor !== undefined) userData.avatar.outfitColor = newAv.outfitColor;
        if (newAv.shirtColor !== undefined) userData.avatar.shirtColor = newAv.shirtColor;
        if (newAv.pantsColor !== undefined) userData.avatar.pantsColor = newAv.pantsColor;
        if (newAv.shoesColor !== undefined) userData.avatar.shoesColor = newAv.shoesColor;

        if (newAv.costume !== undefined) {
            userData.avatar.costume = newAv.costume;
            players[socket.id].costume = newAv.costume;
        } else if (newAv.outfit && newAv.outfit.startsWith('costume_') && newAv.outfit !== 'costume_invisibility') {
            userData.avatar.costume = newAv.outfit;
            players[socket.id].costume = newAv.outfit;
        } else {
            userData.avatar.costume = null;
            players[socket.id].costume = null;
        }

        // Görünmezlik kostümü kontrolü: Eğer kostüm çıkarıldıysa görünmezlik anında kaldırılır!
        if (newAv.outfit === 'costume_invisibility' || newAv.costume === 'costume_invisibility') {
            userData.avatar.outfit = 'costume_invisibility';
            players[socket.id].outfit = 'costume_invisibility';
            if (!userData.invisibilityExpiresAt || userData.invisibilityExpiresAt <= Date.now()) {
                userData.invisibilityExpiresAt = Date.now() + (5 * 60 * 60 * 1000);
                players[socket.id].invisibilityExpiresAt = userData.invisibilityExpiresAt;
            }
        } else {
            userData.invisibilityExpiresAt = 0;
            players[socket.id].invisibilityExpiresAt = 0;
        }

        // Player nesnesini senkronize et
        Object.assign(players[socket.id], userData.avatar);

        dataManager.savePersistentData();

        socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: userData.avatar,
            model: userData.avatar.model || 'classic_2',
            hat: userData.avatar.hat,
            hair: userData.avatar.hair,
            face: userData.avatar.face,
            skinColor: userData.avatar.skinColor,
            hairColor: userData.avatar.hairColor,
            color: userData.avatar.color,
            shirt: userData.avatar.shirt,
            pants: userData.avatar.pants,
            outfit: userData.avatar.outfit,
            heldItem: userData.avatar.heldItem,
            shoes: userData.avatar.shoes,
            hatColor: userData.avatar.hatColor,
            faceColor: userData.avatar.faceColor,
            outfitColor: userData.avatar.outfitColor,
            shirtColor: userData.avatar.shirtColor,
            pantsColor: userData.avatar.pantsColor,
            shoesColor: userData.avatar.shoesColor,
            watch: userData.avatar.watch,
            costume: userData.avatar.costume,
            gender: userData.avatar.gender
        });
        socket.emit('systemMessage', "✨ Kıyafet kombinasyonunuz başarıyla kaydedildi!");
    });

    // 1.05 K2 SAÇ RENGİ AYARLAMA (SANALİKA RENK VARYASYONU SİSTEMİ)
    socket.on('setAvatarHairColor', (data) => {
        if (!players[socket.id] || !data || !data.hairColor) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData || !userData.avatar) return;

        userData.avatar.hairColor = data.hairColor;
        players[socket.id].hairColor = data.hairColor;
        dataManager.savePersistentData();

        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: userData.avatar,
            hairColor: data.hairColor
        });
    });

    // 1.1 AVATAR VÜCUT MODELİ (HER ZAMAN KLASİK 2)
    socket.on('setAvatarModel', (data) => {
        if (!players[socket.id]) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        let model = (data && (data.model === 'karakter_2' || data.model === 'character_2')) ? 'karakter_2' : 'classic_2';
        if (!userData.avatar) userData.avatar = {};
        userData.avatar.model = model;
        players[socket.id].model = model;

        dataManager.savePersistentData();

        socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: userData.avatar,
            model: model,
            shirt: userData.avatar.shirt,
            pants: userData.avatar.pants,
            outfit: userData.avatar.outfit,
            watch: userData.avatar.watch
        });
    });

    // 2. KUĞU DENİZ BİSİKLETİ KİRALAMA (5 DAKİKA SÜRE)
    socket.on('rentSwanBoat', () => {
        if (!players[socket.id]) return;
        if (!checkRateLimit(socket, 'rentSwanBoat', 2, 5000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        if (players[socket.id].hasSwanBoat) {
            socket.emit('gameError', "Zaten Kuğu Deniz Bisikleti kiraladınız!");
            return;
        }
        if (players[socket.id].hasHorse) {
            socket.emit('gameError', "⚠️ Binek atındayken Kuğu Deniz Bisikleti kiralayamazsınız! Önce attan inmelisiniz.");
            return;
        }
        if (userData.money < 20) {
            socket.emit('gameError', "Kuğu Deniz Bisikleti kiralamak için 20 TL gerekiyor! Bakiyeniz yetersiz.");
            return;
        }

        userData.money -= 20;
        players[socket.id].money = userData.money;
        players[socket.id].hasSwanBoat = true;
        dataManager.savePersistentData();

        const SWAN_DURATION_SECONDS = 300; // 5 dakika (5 * 60)
        if (playerSwanTimers[socket.id]) {
            clearTimeout(playerSwanTimers[socket.id]);
        }

        playerSwanTimers[socket.id] = setTimeout(() => {
            if (!players[socket.id]) return;
            players[socket.id].hasSwanBoat = false;
            delete playerSwanTimers[socket.id];

            io.to(players[socket.id].room).emit('playerSwanBoatUpdate', { id: socket.id, hasSwanBoat: false });
            socket.emit('swanBoatExpired');
            socket.emit('systemMessage', "🦢 Kuğu bisikleti kiralama süreniz (5 dakika) sona erdi!");

            // Eğer oyuncu denizdeyse, suda mahsur kalmaması için güvenle iskeleye/kumsala al
            if (players[socket.id].room === 'sahil') {
                let px = players[socket.id].x;
                let py = players[socket.id].y;
                let onPier = (px >= 70 && px <= 555 && py >= 150 && py <= 235);
                let onSand = (py >= 370 && px >= 210) || (py >= 260 && px >= 340) || (py >= 180 && px >= 440) || (py >= 120 && px >= 550) || (px >= 640);
                if (!onPier && !onSand) {
                    players[socket.id].x = 420;
                    players[socket.id].y = 350;
                    io.to('sahil').emit('playerMoved', { id: socket.id, x: 420, y: 350 });
                }
            } else if (players[socket.id].room === 'sahilv2') {
                players[socket.id].x = 740;
                players[socket.id].y = 390;
                io.to('sahilv2').emit('playerMoved', { id: socket.id, x: 740, y: 390 });
            }
        }, SWAN_DURATION_SECONDS * 1000);

        socket.emit('moneyUpdate', userData.money);
        socket.emit('swanBoatRented', { duration: SWAN_DURATION_SECONDS });
        io.to(players[socket.id].room).emit('playerSwanBoatUpdate', { id: socket.id, hasSwanBoat: true });
        socket.emit('systemMessage', "🦢 Tebrikler! 20 TL'ye Kuğu Deniz Bisikleti kiraladın. (Süre: 5 Dakika)");
    });

    socket.on('toggle_swan_boat', (data) => {
        if (!players[socket.id]) return;
        const wantMount = !!(data && data.mounted);
        if (wantMount) {
            if (players[socket.id].hasHorse) {
                socket.emit('gameError', "⚠️ Kuğu'ya binmek için önce attan inmelisiniz!");
                return;
            }
            if (!playerSwanTimers[socket.id]) {
                socket.emit('gameError', "⚠️ Kuğu kiralama süreniz bulunmuyor!");
                return;
            }
            players[socket.id].hasSwanBoat = true;
            io.to(players[socket.id].room).emit('playerSwanBoatUpdate', { id: socket.id, hasSwanBoat: true });
        } else {
            players[socket.id].hasSwanBoat = false;
            io.to(players[socket.id].room).emit('playerSwanBoatUpdate', { id: socket.id, hasSwanBoat: false });

            // Eğer oyuncu denizdeyse, suda mahsur kalmaması için güvenle iskeleye/kumsala al
            if (players[socket.id].room === 'sahil') {
                let px = players[socket.id].x;
                let py = players[socket.id].y;
                let onPier = (px >= 70 && px <= 555 && py >= 150 && py <= 235);
                let onSand = (py >= 370 && px >= 210) || (py >= 260 && px >= 340) || (py >= 180 && px >= 440) || (py >= 120 && px >= 550) || (px >= 640);
                if (!onPier && !onSand) {
                    players[socket.id].x = 420;
                    players[socket.id].y = 350;
                    io.to('sahil').emit('playerMoved', { id: socket.id, x: 420, y: 350 });
                }
            } else if (players[socket.id].room === 'sahilv2') {
                players[socket.id].x = 740;
                players[socket.id].y = 390;
                io.to('sahilv2').emit('playerMoved', { id: socket.id, x: 740, y: 390 });
            }
        }
    });

    // 2.1 TROPİK SAHİL KOKTEYL BARI SATIN ALMA
    socket.on('buyCocktail', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'buyCocktail', 5, 2000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const COCKTAILS = {
            'coconut': { name: 'Tropik Hindistan Cevizi Kokteyli', price: 25, icon: '🥥', chatText: 'Buz gibi Tropik Hindistan Cevizi Kokteyli yudumluyorum! 🌴' },
            'pineapple': { name: 'Buzlu Ananaslı Frappé', price: 30, icon: '🍍', chatText: 'Taze Buzlu Ananaslı Frappé harika! 🍍' },
            'mojito': { name: 'Çilekli Sahil Mojito', price: 35, icon: '🍓', chatText: 'Çilekli Sahil Mojito ile serinliyorum! 🍓' },
            'sunset': { name: 'Sunset Horizon (Güneş Batımı)', price: 45, icon: '🍹', chatText: 'Lüks Sunset Horizon kokteyli yudumluyorum! 🌅' },
            'lemonade': { name: 'Buzlu Nane & Limonata', price: 20, icon: '🍋', chatText: 'Buz gibi nane limonatamı yudumluyorum! 🍋' }
        };

        let item = COCKTAILS[data.id];
        if (!item) return;

        if ((userData.money || 0) < item.price) {
            socket.emit('gameError', `Yetersiz bakiye! Bu içecek ${item.price} TL. Bakiyeniz: ${userData.money || 0} TL.`);
            return;
        }

        userData.money = Math.max(0, (userData.money || 0) - item.price);
        players[socket.id].money = userData.money;

        // Oyuncunun eline içeceği ver
        userData.avatar = userData.avatar || {};
        userData.avatar.heldItem = 'cocktail_' + data.id;
        players[socket.id].heldItem = 'cocktail_' + data.id;

        dataManager.savePersistentData();

        // 5 Dakikalık (300 saniye) Geçici İçecek Zamanlayıcısı
        const COCKTAIL_DURATION_MS = 5 * 60 * 1000;
        if (playerCocktailTimers[socket.id]) {
            clearTimeout(playerCocktailTimers[socket.id]);
        }
        playerCocktailTimers[socket.id] = setTimeout(() => {
            if (!players[socket.id]) return;
            delete playerCocktailTimers[socket.id];

            if (players[socket.id].heldItem === 'cocktail_' + data.id) {
                players[socket.id].heldItem = 'none';
                if (userData && userData.avatar) {
                    userData.avatar.heldItem = 'none';
                }
                dataManager.savePersistentData();
                io.to(players[socket.id].room).emit('playerAvatarChange', {
                    id: socket.id,
                    avatar: userData ? userData.avatar : {},
                    heldItem: 'none'
                });
                socket.emit('systemMessage', `🍹 Tropik ${item.name} kokteylinizi keyifle bitirdiniz!`);
            }
        }, COCKTAIL_DURATION_MS);

        socket.emit('moneyUpdate', userData.money);
        socket.emit('cocktailPurchasedSuccess', item);
        socket.emit('systemMessage', `${item.icon} [${item.name}] satın aldınız! Elinizde 5 dakika boyunca ferahlatıcı kokteyliniz duracaktır. (-${item.price} TL)`);

        let room = players[socket.id].room;
        io.to(room).emit('playerAvatarChange', { id: socket.id, avatar: userData.avatar, heldItem: players[socket.id].heldItem });
    });

    // 2.2 DOSTLAR KIRAATHANESİ İÇECEK STANDI (ÇAYCI HÜSEYİN USTA)
    socket.on('buyKiraathaneDrink', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'buyKiraathaneDrink', 5, 2000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const KIRAATHANE_DRINKS = {
            'cay': { name: 'Taze Tavşan Kanı İnce Belli Çay', price: 5, icon: '☕', heldItem: 'cay', chatText: 'Tavşan kanı sıcacık çayımdan bir yudum aldım, afiyet olsun!' },
            'kahve': { name: 'Közde Bol Köpüklü Türk Kahvesi', price: 15, icon: '☕', heldItem: 'kahve', chatText: 'Közde pişmiş bol köpüklü Türk kahvemi yudumluyorum! 😋' },
            'gazoz': { name: 'Nostaljik Şişe Gazoz (Zafer / Niğde)', price: 12, icon: '🧊', heldItem: 'gazoz', chatText: 'Buz gibi nostaljik cam şişe gazozumu içiyorum, ferahlık bu!' },
            'limonata': { name: 'Buzlu Taze Limonata', price: 15, icon: '🍋', heldItem: 'limonata', chatText: 'Taze nane yapraklı buz gibi limonatamı yudumluyorum!' },
            'oralet': { name: 'Sıcak Kuşburnu & Oralet', price: 10, icon: '🍵', heldItem: 'oralet', chatText: 'Kıraathanenin meşhur sıcak oraletini yudumluyorum!' },
            'coconut': { name: 'Tropik Hindistan Cevizi Kokteyli', price: 25, icon: '🥥', heldItem: 'cocktail_coconut', chatText: 'Tropik hindistan cevizi içeceğimi yudumluyorum! 🌴' }
        };

        let item = KIRAATHANE_DRINKS[data.id];
        if (!item) return;

        if ((userData.money || 0) < item.price) {
            socket.emit('gameError', `Yetersiz bakiye! Bu içecek ${item.price} TL. Bakiyeniz: ${userData.money || 0} TL.`);
            return;
        }

        userData.money = Math.max(0, (userData.money || 0) - item.price);
        players[socket.id].money = userData.money;

        userData.avatar = userData.avatar || {};
        userData.avatar.heldItem = item.heldItem;
        players[socket.id].heldItem = item.heldItem;
        players[socket.id].isKiraathaneDrink = true;

        if (item.heldItem === 'cay') {
            givePlayerTeaWithTimer(socket.id, username, 180000);
            dataManager.recordQuestProgress(username, 'drink_tea', 1);
        }

        // Önceki kıraathane içecek zamanlayıcısı varsa temizle
        if (playerKiraathaneDrinkTimers[socket.id]) {
            clearTimeout(playerKiraathaneDrinkTimers[socket.id]);
            delete playerKiraathaneDrinkTimers[socket.id];
        }

        // İçeceği tam 3 dakika (180.000 ms) boyunca elinde tut, süre bitince elinden silinsin
        const DRINK_HOLD_DURATION_MS = 180000;
        playerKiraathaneDrinkTimers[socket.id] = setTimeout(() => {
            delete playerKiraathaneDrinkTimers[socket.id];
            if (!players[socket.id]) return;

            // Eğer oyuncu hala aynı içeceği tutuyorsa elinden al
            if (players[socket.id].heldItem === item.heldItem) {
                players[socket.id].heldItem = 'none';
                players[socket.id].isKiraathaneDrink = false;
                if (item.heldItem === 'cay') players[socket.id].hasTea = false;
                if (userData.avatar) userData.avatar.heldItem = 'none';
                dataManager.savePersistentData();

                let curRoom = players[socket.id].room;
                io.to(curRoom).emit('playerAvatarChange', { 
                    id: socket.id, 
                    avatar: userData.avatar, 
                    heldItem: 'none' 
                });
                socket.emit('kiraathaneDrinkExpired', { id: data.id, name: item.name });
                socket.emit('systemMessage', `☕ [${item.name}] içeceğinizi 3 dakika boyunca afiyetle bitirdiniz, bardağınızı bıraktınız.`);
            }
        }, DRINK_HOLD_DURATION_MS);

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', userData.money);
        socket.emit('kiraathaneDrinkSuccess', item);
        socket.emit('systemMessage', `${item.icon} [${item.name}] satın aldınız! (3 dakika boyunca elinizde olacak) (-${item.price} TL)`);

        let room = players[socket.id].room;
        io.to(room).emit('playerAvatarChange', { id: socket.id, avatar: userData.avatar, heldItem: players[socket.id].heldItem });
    });

    // 4. LİDERLİK TABLOSU
    socket.on('getLeaderboard', () => {
        const isHuman = (name) => name && !name.startsWith('🤖') && !name.startsWith('bot_') && !name.includes('🤖') && !name.toLowerCase().includes('dayı') && !name.toLowerCase().includes('ismail') && !name.toLowerCase().includes('emmi');

        let topBilliard = Object.entries(dataManager.persistentData.leaderboard.billiard || {})
            .filter(([name]) => isHuman(name))
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins).slice(0, 5);

        let topBatak = Object.entries(dataManager.persistentData.leaderboard.batak || {})
            .filter(([name]) => isHuman(name))
            .map(([name, score]) => ({ name, score }))
            .sort((a, b) => b.score - a.score).slice(0, 5);

        let topTavla = Object.entries(dataManager.persistentData.leaderboard.tavla || {})
            .filter(([name]) => isHuman(name))
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins).slice(0, 5);

        let topOkey101 = Object.entries(dataManager.persistentData.leaderboard.okey101 || {})
            .filter(([name]) => isHuman(name))
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins).slice(0, 5);

        let topChess = Object.entries(dataManager.persistentData.leaderboard.chess || {})
            .filter(([name]) => isHuman(name))
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins).slice(0, 5);

        socket.emit('leaderboardData', {
            billiard: topBilliard,
            batak: topBatak,
            tavla: topTavla,
            okey101: topOkey101,
            chess: topChess
        });
    });

    // 6. GÜNLÜK GÖREVLER (DAILY QUESTS)
    socket.on('getDailyQuests', async () => {
        if (!players[socket.id]) return;
        let username = players[socket.id].name;
        let quests = await dataManager.getUserDailyQuests(username);
        socket.emit('dailyQuestsData', quests);
    });

    socket.on('claimDailyQuest', async (questId) => {
        if (!players[socket.id] || !questId) return;
        if (!checkRateLimit(socket, 'claimDailyQuest', 5, 3000)) return;
        let username = players[socket.id].name;
        let res = await dataManager.claimQuestReward(username, questId);
        if (res.success) {
            socket.emit('moneyUpdate', res.newMoney);
            socket.emit('dailyQuestsData', res.quests);
            socket.emit('systemMessage', res.msg);
        } else {
            socket.emit('gameError', res.msg);
        }
    });

    // 7. SKİN SETLERİ (AION 2 PRESET 1 - 2 - 3)
    socket.on('saveSkinSet', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'saveSkinSet', 10, 2000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        let slot = parseInt(data.slot) || 1;
        if (slot < 1 || slot > 3) slot = 1;

        if (!userData.skinSets) userData.skinSets = {};

        // Verilen avatar kombinini ya da kullanıcının mevcut avatarını slot'a kaydet
        let currentAv = data.avatar || userData.avatar;
        userData.skinSets[slot] = {
            model: currentAv.model || 'classic_2',
            hat: currentAv.hat || 'bere',
            hair: currentAv.hair || 'none',
            face: currentAv.face || 'none',
            skinColor: currentAv.skinColor || '#facc15',
            color: currentAv.color || '#3b82f6',
            shirt: currentAv.shirt || currentAv.color || '#3b82f6',
            pants: currentAv.pants || 'pants_classic_jeans',
            outfit: currentAv.outfit || null,
            watch: currentAv.watch || 'none',
            heldItem: currentAv.heldItem || 'none',
            shoes: currentAv.shoes || 'sneakers',
            isSaved: true,
            name: data.name || (slot === 1 ? 'Masa / Racon' : slot === 2 ? 'Sahil / Rahat' : 'Şehir / Özel')
        };

        dataManager.savePersistentData();
        socket.emit('skinSetsUpdate', { skinSets: userData.skinSets, activeSlot: slot });
        socket.emit('systemMessage', `💾 Mevcut kombinin ${slot}. Skin Setine başarıyla kaydedildi!`);
    });

    socket.on('applySkinSet', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'applySkinSet', 10, 1000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        let slot = parseInt(data.slot) || 1;
        if (!userData.skinSets || !userData.skinSets[slot]) {
            socket.emit('gameError', `${slot}. Skin Seti henüz oluşturulmamış! Önce gardıroptan bu sete bir kombin kaydedin.`);
            return;
        }

        let chosenSet = userData.skinSets[slot];
        userData.avatar = {
            ...userData.avatar,
            model: 'classic_2',
            hat: chosenSet.hat || 'bere',
            hair: chosenSet.hair || 'none',
            face: chosenSet.face || 'none',
            skinColor: chosenSet.skinColor || '#facc15',
            color: chosenSet.color || '#3b82f6',
            shirt: chosenSet.shirt || '#3b82f6',
            pants: chosenSet.pants || 'pants_classic_jeans',
            outfit: chosenSet.outfit || null,
            watch: chosenSet.watch || 'none',
            heldItem: chosenSet.heldItem || 'none',
            shoes: chosenSet.shoes || 'sneakers'
        };

        players[socket.id] = {
            ...players[socket.id],
            model: userData.avatar.model,
            hat: userData.avatar.hat,
            hair: userData.avatar.hair,
            face: userData.avatar.face,
            skinColor: userData.avatar.skinColor,
            color: userData.avatar.color,
            shirt: userData.avatar.shirt,
            pants: userData.avatar.pants,
            outfit: userData.avatar.outfit,
            watch: userData.avatar.watch,
            costume: userData.avatar.costume,
            heldItem: userData.avatar.heldItem,
            shoes: userData.avatar.shoes
        };

        dataManager.savePersistentData();

        socket.emit('wardrobeUpdate', {
            avatar: userData.avatar,
            inventory: userData.inventory,
            skinSets: userData.skinSets,
            activeSlot: slot
        });

        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: userData.avatar,
            model: userData.avatar.model,
            hat: userData.avatar.hat,
            face: userData.avatar.face,
            skinColor: userData.avatar.skinColor,
            color: userData.avatar.color,
            shirt: userData.avatar.shirt,
            pants: userData.avatar.pants,
            outfit: userData.avatar.outfit,
            watch: userData.avatar.watch,
            costume: userData.avatar.costume,
            heldItem: userData.avatar.heldItem,
            shoes: userData.avatar.shoes
        });

        socket.emit('systemMessage', `⚡ ${slot}. Skin Seti kuşandın: "${chosenSet.name || ('Set ' + slot)}"`);
    });

    // 8. ŞANSLI KUTU (MYSTERY BOX) MEKANİĞİ (Modüler src/handlers/mysteryBoxHandler.js)
    registerMysteryBoxHandlers(io, socket, players, dataManager);

    socket.on('disconnect', () => {
        if (playerKiraathaneDrinkTimers[socket.id]) {
            clearTimeout(playerKiraathaneDrinkTimers[socket.id]);
            delete playerKiraathaneDrinkTimers[socket.id];
        }
        if (playerCocktailTimers[socket.id]) {
            clearTimeout(playerCocktailTimers[socket.id]);
            delete playerCocktailTimers[socket.id];
        }
    });
}

function clearKiraathaneDrinkForPlayer(io, players, socketId, silent = false) {
    if (playerKiraathaneDrinkTimers[socketId]) {
        clearTimeout(playerKiraathaneDrinkTimers[socketId]);
        delete playerKiraathaneDrinkTimers[socketId];
    }
    if (!players || !players[socketId]) return;

    let p = players[socketId];
    const KIRAATHANE_HELD_ITEMS = ['cay', 'kahve', 'gazoz', 'limonata', 'kupa', 'cocktail_coconut'];
    let held = p.heldItem;
    let isKiraathaneItem = p.isKiraathaneDrink || KIRAATHANE_HELD_ITEMS.includes(held);

    if (isKiraathaneItem) {
        p.heldItem = 'none';
        p.isKiraathaneDrink = false;
        if (held === 'cay') p.hasTea = false;

        let username = p.name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (userData && userData.avatar) {
            userData.avatar.heldItem = 'none';
        }
        dataManager.savePersistentData();

        let curRoom = p.room;
        if (io) {
            io.to(curRoom).emit('playerAvatarChange', { 
                id: socketId, 
                avatar: userData ? userData.avatar : {}, 
                heldItem: 'none' 
            });
            let sock = io.sockets.sockets.get ? io.sockets.sockets.get(socketId) : null;
            if (sock) {
                sock.emit('kiraathaneDrinkCleared');
                if (!silent) {
                    sock.emit('systemMessage', '☕ Kıraathane içecekleri sadece o mekana özeldir, mekandan çıktığınız için içeceğiniz masada bırakıldı.');
                }
            }
        }
    }
}

module.exports = { registerEconomyHandlers, playerSwanTimers, playerKiraathaneDrinkTimers, clearKiraathaneDrinkForPlayer };
