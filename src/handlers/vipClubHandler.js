// src/handlers/vipClubHandler.js - VİP CLUB, Tekinsiz Tekin Karaborsa Eşyaları & Gasp/Jammer Mekaniği
const dataManager = require('../dataManager');
const petManager = require('../petManager');
const fatherPetManager = require('../fatherPetManager');
const { checkRateLimit } = require('../utils/securityUtils');

const VIP_CLUB_ENTRY_FEE = 0; // Kapı ücreti kaldırıldı (Giriş için Seviye 2 gereklidir)

function getMaxBodyguardsForLevel(level) {
    level = Number(level) || 1;
    if (level >= 40) return 3;
    if (level >= 20) return 2;
    if (level >= 2) return 1;
    return 0;
}

// Tekinsiz Tekin'in Karaborsa Eşya Kataloğu
const SHADY_ITEMS = {
    jammer: {
        id: 'jammer',
        name: 'Sinyal Kesici (Jammer)',
        price: 1500,
        currency: 'money',
        minLevel: 3,
        desc: '1 kullanımlık sinyal kesici. Hedef oyuncunun 3 dakika chate yazmasını ve konuşmasını engeller. (Gereksinim: Seviye 3)',
        icon: '📡',
        isConsumable: true
    },
    anon_mask: {
        id: 'anon_mask',
        name: 'Gizli Kimlik Maskesi',
        price: 3000,
        currency: 'money',
        minLevel: 3,
        desc: '30 dakika boyunca isminizi "???" olarak gizler, konuşmalarınıza dumanlı aura verir ve suç bültenlerinde kimliğinizi saklar. Çantadan takılıp çıkarılabilir. (Gereksinim: Seviye 3)',
        icon: '🎭',
        durationMs: 30 * 60 * 1000,
        isConsumable: true
    },
    izbandut: {
        id: 'izbandut',
        name: 'İzbandut Koruma',
        price: 5000,
        currency: 'money',
        minLevel: 2,
        desc: 'Süresiz mafya fedaisi. Gasp, Zeus yıldırımı ve jammere karşı can siperi olur. Çantadan kuşanılıp çıkarılabilir. (Lv 2: 1, Lv 20: 2, Lv 40: 3 koruma)',
        icon: '🕴️',
        isPet: true
    },
    doberman: {
        type: 'doberman',
        id: 'doberman',
        name: 'Doberman Koruma',
        price: 4000,
        currency: 'money',
        minLevel: 3,
        desc: 'Süresiz koruma köpeği. Gasp teşebbüslerini havada yakalayıp savuşturur. Çantadan kuşanılıp çıkarılabilir. (Gereksinim: Seviye 3)',
        icon: '🐕‍🦺',
        isPet: true
    },
    neon_red_nick: {
        id: 'neon_red_nick',
        name: 'Kırmızı Liste Boyası',
        price: 2500,
        currency: 'money',
        desc: 'Nickinizi 24 saatliğine parlak Neon Kırmızı renge büründürür.',
        icon: '🔴',
        durationMs: 24 * 60 * 60 * 1000
    },
    invisibility: {
        id: 'invisibility',
        name: 'Görünmezlik Kostümü',
        price: 6000,
        currency: 'money',
        desc: '5 saat boyunca haritada neredeyse tamamen saydam/görünmez olursunuz.',
        icon: '👻',
        durationMs: 5 * 60 * 60 * 1000
    },
    mug_knife: {
        id: 'mug_knife',
        name: 'Gasp Bıçağı',
        price: 2,
        currency: 'diamond',
        minLevel: 2,
        desc: '1 kullanımlık gizli sokak bıçağı. Bir oyuncuyu gasp ederek 2.000 TL çalar. Aynı kişi günde en fazla 1 kez gasp edilebilir. (Gereksinim: Seviye 2)',
        icon: '🗡️',
        isConsumable: true
    },
    zeus_yildirimi: {
        id: 'zeus_yildirimi',
        name: "Zeus'un İlahi Yıldırımı",
        price: 2,
        currency: 'diamond',
        minLevel: 2,
        desc: "1 kullanımlık ilahi Olimpos mızrağı. İstediğin oyuncunun üstüne ilahi yıldırımı indirip 30 saniye kül et! (Gereksinim: Seviye 2)",
        icon: '⚡',
        isHeldItem: true,
        isConsumable: true
    }
};

function emitShadyShopStateToSocket(socket, userData, player) {
    if (!socket || !userData) return;
    const myLevel = (player && player.level) || userData.level || 1;
    const maxGuards = getMaxBodyguardsForLevel(myLevel);
    socket.emit('shadyShopState', {
        money: userData.money,
        diamonds: userData.diamonds || 0,
        level: myLevel,
        maxBodyguards: maxGuards,
        bodyguardCount: userData.bodyguardCount || 0,
        bodyguardsEquipped: userData.bodyguardsEquipped || 0,
        hasDoberman: !!userData.hasDoberman,
        dobermanEquipped: !!userData.dobermanEquipped,
        items: SHADY_ITEMS,
        inventory: userData.inventory || [],
        jammerCount: userData.jammerCount || 0,
        zeusCount: userData.zeusCount || 0,
        mugKnifeCount: userData.mugKnifeCount || (userData.hasMugKnife ? 1 : 0),
        hasMugKnife: !!(userData.mugKnifeCount > 0 || userData.hasMugKnife),
        lastMugTime: userData.lastMugTime || 0,
        anonMaskCount: userData.anonMaskCount || 0,
        anonMaskExpiresAt: userData.anonMaskExpiresAt || 0,
        neonRedNickExpiresAt: userData.neonRedNickExpiresAt || 0,
        invisibilityExpiresAt: userData.invisibilityExpiresAt || 0,
        heldItem: userData.avatar?.heldItem || 'none'
    });
}

function registerVipClubHandlers(io, socket, players, helpers) {
    // 1. VİP CLUB GİRİŞİ (SEVİYE 2 GEREKSİNİMİ & ÜCRETSİZ GEÇİŞ)
    socket.on('enterVipClub', () => {
        if (!players[socket.id]) return;
        if (!checkRateLimit(socket, 'enterVipClub', 3, 2000)) return;

        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const playerLevel = players[socket.id].level || (userData.level || 1);
        if (playerLevel < 2) {
            socket.emit('gameError', '🔒 VİP CLUB\'a girebilmek için en az 2. Seviye (Level 2) olmalısınız!');
            return;
        }

        socket.emit('systemMessage', `🚪 VİP CLUB'a giriş yaptınız. Mekanın tadını çıkarın!`);

        // Oyuncuyu VİP Club odasına taşı
        const oldRoom = players[socket.id].room;
        const newRoom = 'vip_club';

        socket.leave(oldRoom);
        socket.join(newRoom);
        players[socket.id].room = newRoom;
        players[socket.id].x = 500;
        players[socket.id].y = 530;

        io.to(oldRoom).emit('playerDisconnected', socket.id);
        socket.emit('roomChanged', {
            room: newRoom,
            spawn: { x: 500, y: 530 },
            money: userData.money
        });

        // Yoldaşları ve korumaları VIP Club'a taşı
        if (typeof fatherPetManager.handleRoomChange === 'function') {
            fatherPetManager.handleRoomChange(socket.id, oldRoom, newRoom);
        }
        if (typeof petManager.handleRoomChange === 'function') {
            petManager.handleRoomChange(socket.id, oldRoom, newRoom);
        }

        // Çevredeki oyuncuları ve petleri bildir (Obje formatında dictionary)
        const roomPlayers = (helpers && typeof helpers.getPlayersInRoom === 'function')
            ? helpers.getPlayersInRoom(newRoom)
            : (() => {
                const rp = {};
                for (let sid in players) {
                    if (players[sid] && players[sid].room === newRoom) rp[sid] = players[sid];
                }
                return rp;
            })();

        socket.emit('currentPlayers', roomPlayers);
        if (typeof fatherPetManager.getPetsInRoom === 'function') {
            socket.emit('activeFatherPets', fatherPetManager.getPetsInRoom(newRoom));
        }
        if (typeof petManager.getPetsInRoom === 'function') {
            socket.emit('activeCompanionPets', petManager.getPetsInRoom(newRoom));
        }
        socket.to(newRoom).emit('newPlayer', { id: socket.id, player: players[socket.id] });
    });

    // 2. TEKİNSİZ TEKİN KARABORSA DURUMUNU ALMA
    socket.on('getShadyShopState', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        emitShadyShopStateToSocket(socket, userData, players[socket.id]);
    });

    // 3. TEKİNSİZ TEKİN'DEN KARABORSA EŞYASI SATIN ALMA
    socket.on('buyShadyItem', (data) => {
        if (!players[socket.id] || !data || !data.itemId) return;
        if (!checkRateLimit(socket, 'buyShadyItem', 15, 2000)) return;

        const itemId = data.itemId;
        const item = SHADY_ITEMS[itemId];
        if (!item) {
            socket.emit('gameError', 'Böyle bir karaborsa eşyası bulunamadı!');
            return;
        }

        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const callerLevel = players[socket.id].level || (userData.level || 1);
        if (item.minLevel && callerLevel < item.minLevel) {
            socket.emit('gameError', `🔒 Bu eşyayı satın alabilmek için en az Seviye ${item.minLevel} olmalısınız! (Mevcut Seviyeniz: ${callerLevel})`);
            return;
        }

        // Satın alma öncesi seviye ve slot kontrolleri
        if (itemId === 'izbandut') {
            const maxGuards = getMaxBodyguardsForLevel(callerLevel);
            const owned = userData.bodyguardCount || 0;
            if (owned >= maxGuards) {
                let nextInfo = (callerLevel < 20) ? '2. koruma yuvası Seviye 20\'de açılır.' :
                               (callerLevel < 40) ? '3. koruma yuvası Seviye 40\'ta açılır.' :
                               'Maksimum 3 koruma sınırına ulaştınız.';
                socket.emit('gameError', `⚠️ Seviye ${callerLevel} için koruma limitiniz doldu (${owned}/${maxGuards})! ${nextInfo}`);
                return;
            }
        } else if (itemId === 'doberman' && userData.hasDoberman) {
            socket.emit('gameError', `⚠️ Zaten bir Doberman korumasına sahipsiniz!`);
            return;
        }

        // Bakiye ve Para Birimi Kontrolü
        if (item.currency === 'diamond') {
            const curDiamonds = Number(userData.diamonds) || 0;
            if (curDiamonds < item.price) {
                socket.emit('gameError', `❌ Yetersiz Elmas! "${item.name}" ${item.price} Elmas gerektirir. Mevcut elmasınız: ${curDiamonds} 💎.`);
                return;
            }
            userData.diamonds = curDiamonds - item.price;
            if (players[socket.id]) players[socket.id].diamonds = userData.diamonds;
            socket.emit('diamondUpdate', userData.diamonds);
        } else {
            const curMoney = Number(userData.money) || 0;
            if (curMoney < item.price) {
                socket.emit('gameError', `❌ Yetersiz bakiye! "${item.name}" ${item.price.toLocaleString('tr-TR')} TL. Mevcut paranız: ${curMoney.toLocaleString('tr-TR')} TL.`);
                return;
            }
            userData.money = curMoney - item.price;
            if (players[socket.id]) players[socket.id].money = userData.money;
            socket.emit('moneyUpdate', userData.money);
        }

        if (!userData.inventory) userData.inventory = [];
        const now = Date.now();
        userData.propInventory = userData.propInventory || {};

        if (itemId === 'jammer') {
            userData.jammerCount = (userData.jammerCount || 0) + 1;
            userData.propInventory['props_jammer'] = userData.jammerCount;
            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('systemMessage', `📡 Sinyal Kesici (Jammer) satın alındı! Toplam adet: ${userData.jammerCount}. İstediğiniz oyuncunun profilinden kullanabilirsiniz.`);
        } else if (itemId === 'anon_mask') {
            userData.anonMaskCount = (userData.anonMaskCount || 0) + 1;
            const duration = 30 * 60 * 1000;
            userData.anonMaskExpiresAt = (userData.anonMaskExpiresAt && userData.anonMaskExpiresAt > now)
                ? (userData.anonMaskExpiresAt + duration)
                : (now + duration);

            players[socket.id].anonMaskExpiresAt = userData.anonMaskExpiresAt;

            userData.propInventory = userData.propInventory || {};
            userData.propInventory['anon_mask'] = userData.anonMaskCount;
            userData.propInventory['props_anon_mask'] = userData.anonMaskCount;
            if (!userData.inventory.includes('props_anon_mask')) {
                userData.inventory.push('props_anon_mask');
            }

            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('anonMaskStatusUpdate', {
                isMasked: true,
                remainingSec: Math.floor((userData.anonMaskExpiresAt - now) / 1000)
            });
            io.to(players[socket.id].room).emit('playerShadyUpdate', {
                id: socket.id,
                anonMaskExpiresAt: userData.anonMaskExpiresAt
            });

            const remMin = Math.ceil((userData.anonMaskExpiresAt - now) / 60000);
            socket.emit('systemMessage', `🎭 Gizli Kimlik Maskesi satın alındı ve hemen takıldı! ${remMin} dakika boyunca isminiz '???' olacak, konuşmalarınız dumanlı aura yayacak ve suç bültenlerinde kimliğiniz gizlenecektir. İstediğiniz an tezgahtan veya çantadan çıkarabilirsiniz.`);
        } else if (itemId === 'neon_red_nick') {
            userData.neonRedNickExpiresAt = now + item.durationMs;
            players[socket.id].neonRedNickExpiresAt = userData.neonRedNickExpiresAt;
            io.to(players[socket.id].room).emit('playerShadyUpdate', {
                id: socket.id,
                neonRedNickExpiresAt: userData.neonRedNickExpiresAt
            });
            socket.emit('systemMessage', `🔴 Kırmızı Liste Boyası sürüldü! 24 saat boyunca nickiniz parlayan Neon Kırmızı olacak.`);
        } else if (itemId === 'invisibility') {
            userData.invisibilityExpiresAt = now + item.durationMs;
            players[socket.id].invisibilityExpiresAt = userData.invisibilityExpiresAt;
            if (!userData.inventory) userData.inventory = [];
            if (!userData.inventory.includes('outfits_costume_invisibility')) {
                userData.inventory.push('outfits_costume_invisibility');
            }
            if (!userData.inventory.includes('costume_invisibility')) {
                userData.inventory.push('costume_invisibility');
            }
            dataManager.savePersistentData();
            socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
            io.to(players[socket.id].room).emit('playerShadyUpdate', {
                id: socket.id,
                invisibilityExpiresAt: userData.invisibilityExpiresAt
            });
            socket.emit('systemMessage', `👻 Görünmezlik Kostümü gardırobundaki "Takım/Elbiseler" sekmesine eklendi ve 5 saatlik aktif güç kazandın!`);
        } else if (itemId === 'zeus_yildirimi') {
            userData.zeusCount = (userData.zeusCount || 0) + 1;
            const propKey = 'props_zeus_yildirimi';
            if (!userData.inventory.includes(propKey)) {
                userData.inventory.push(propKey);
            }
            userData.propInventory[propKey] = userData.zeusCount;
            socket.emit('propInventoryUpdate', userData.propInventory);
            if (!userData.avatar) userData.avatar = {};
            userData.avatar.heldItem = itemId;
            players[socket.id].avatar = userData.avatar;
            players[socket.id].heldItem = itemId;
            io.to(players[socket.id].room).emit('playerHeldItemUpdate', {
                id: socket.id,
                heldItem: itemId
            });
            socket.emit('systemMessage', `⚡ Zeus'un İlahi Yıldırımı satın alındı (-2 💎)! Toplam adet: ${userData.zeusCount}. (1 kullanımlık ilahi güç).`);
        } else if (itemId === 'izbandut') {
            userData.bodyguardCount = (userData.bodyguardCount || 0) + 1;
            const maxGuards = getMaxBodyguardsForLevel(callerLevel);
            if ((userData.bodyguardsEquipped || 0) < maxGuards) {
                userData.bodyguardsEquipped = (userData.bodyguardsEquipped || 0) + 1;
                if (typeof petManager.spawnPermanentBodyguard === 'function') {
                    petManager.spawnPermanentBodyguard(socket.id, username);
                } else {
                    petManager.spawnBodyguard(socket.id, username);
                }
            }
            const petPropKey = 'props_izbandut';
            userData.propInventory[petPropKey] = userData.bodyguardCount;
            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('systemMessage', `🕴️ İzbandut Koruma çantanıza eklendi ve göreve başladı! (Sahip: ${userData.bodyguardCount}/${maxGuards}, Aktif: ${userData.bodyguardsEquipped})`);
        } else if (itemId === 'doberman') {
            userData.hasDoberman = true;
            userData.dobermanEquipped = true;
            if (typeof petManager.spawnPermanentDoberman === 'function') {
                petManager.spawnPermanentDoberman(socket.id, username);
            } else {
                petManager.spawnPet(socket.id, itemId);
            }
            const petPropKey = 'props_doberman';
            userData.propInventory[petPropKey] = 1;
            userData.propInventory['props_pet_doberman'] = 1;
            if (!userData.inventory.includes(petPropKey)) {
                userData.inventory.push(petPropKey);
            }
            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('systemMessage', `🐕‍🦺 Sadık Doberman satın alındı ve göreve başladı!`);
        } else if (itemId === 'mug_knife') {
            userData.mugKnifeCount = (userData.mugKnifeCount || 0) + 1;
            userData.hasMugKnife = true;
            if (!userData.inventory.includes('props_mug_knife')) {
                userData.inventory.push('props_mug_knife');
            }
            userData.propInventory['props_gasp_bicagi'] = userData.mugKnifeCount;
            userData.propInventory['props_mug_knife'] = userData.mugKnifeCount;
            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('systemMessage', `🗡️ Gasp Bıçağı satın alındı (-2 💎)! Toplam adet: ${userData.mugKnifeCount}. (1 kullanımlık, 2.000 TL'ye kadar soygun).`);
        }

        dataManager.savePersistentData(username);
        emitShadyShopStateToSocket(socket, userData, players[socket.id]);
    });

    // 3.1 İZBANDUT FEDAİ KUŞANMA / ÇIKARMA (EQUIP / UNEQUIP TOGGLE)
    socket.on('toggleEquipBodyguard', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const playerLevel = players[socket.id].level || (userData.level || 1);
        if (playerLevel < 2) {
            socket.emit('gameError', '🔒 İzbandut koruma kuşanabilmek için en az Seviye 2 olmalısınız!');
            return;
        }

        const maxGuards = getMaxBodyguardsForLevel(playerLevel);
        const owned = userData.bodyguardCount || 0;

        if (owned <= 0) {
            socket.emit('gameError', '❌ Çantanızda İzbandut koruma bulunmuyor!');
            return;
        }

        const currentlyEquipped = (userData.bodyguardsEquipped || 0) > 0;
        if (currentlyEquipped) {
            // Unequip all guards
            userData.bodyguardsEquipped = 0;
            const currentActiveGuards = petManager.getBodyguardsByUsername(username);
            currentActiveGuards.forEach(g => {
                petManager.despawnPet(g.id, "Sahibi dinlenmeye çekti");
            });
            socket.emit('systemMessage', '🕴️ Korumalarınız dinlenmeye çekildi ve çantaya alındı. (Şu anda korumasız durumdasınız!)');
        } else {
            // Equip up to maxGuards
            const toEquip = Math.min(owned, maxGuards);
            userData.bodyguardsEquipped = toEquip;
            const currentActiveGuards = petManager.getBodyguardsByUsername(username);
            currentActiveGuards.forEach(g => petManager.despawnPet(g.id, "Yeniden düzenleme"));

            for (let i = 0; i < toEquip; i++) {
                if (typeof petManager.spawnPermanentBodyguard === 'function') {
                    petManager.spawnPermanentBodyguard(socket.id, username);
                } else {
                    petManager.spawnBodyguard(socket.id, username);
                }
            }
            socket.emit('systemMessage', `🕴️ ${toEquip} adet İzbandut korumanız göreve başladı!`);
        }

        dataManager.savePersistentData(username);
        socket.emit('bodyguardEquipStatus', {
            equippedCount: userData.bodyguardsEquipped,
            totalCount: owned
        });
        socket.emit('propInventoryUpdate', userData.propInventory || {});
        emitShadyShopStateToSocket(socket, userData, players[socket.id]);
    });

    // 3.2 DOBERMAN KUŞANMA / ÇIKARMA (EQUIP / UNEQUIP TOGGLE)
    socket.on('toggleEquipDoberman', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const playerLevel = players[socket.id].level || (userData.level || 1);
        if (playerLevel < 3) {
            socket.emit('gameError', '🔒 Doberman korumayı kuşanabilmek için en az Seviye 3 olmalısınız!');
            return;
        }

        if (!userData.hasDoberman) {
            socket.emit('gameError', '❌ Çantanızda Doberman bulunmuyor!');
            return;
        }

        if (userData.dobermanEquipped) {
            // Unequip
            userData.dobermanEquipped = false;
            const companionPet = petManager.getPetByUsername(username);
            if (companionPet && companionPet.petType === 'doberman') {
                petManager.despawnPet(companionPet.id, "Sahibi dinlenmeye çekti");
            }
            socket.emit('systemMessage', '🐕‍🦺 Sadık Doberman dinlenmeye çekildi ve çantaya alındı. (Korumasızsınız!)');
        } else {
            // Equip
            userData.dobermanEquipped = true;
            if (typeof petManager.spawnPermanentDoberman === 'function') {
                petManager.spawnPermanentDoberman(socket.id, username);
            } else {
                petManager.spawnPet(socket.id, 'doberman');
            }
            socket.emit('systemMessage', '🐕‍🦺 Sadık Doberman göreve başladı, yanınızda!');
        }

        dataManager.savePersistentData(username);
        socket.emit('dobermanEquipStatus', {
            equipped: userData.dobermanEquipped,
            hasDoberman: !!userData.hasDoberman
        });
        socket.emit('propInventoryUpdate', userData.propInventory || {});
        emitShadyShopStateToSocket(socket, userData, players[socket.id]);
    });

    // 3.3 GİZLİ KİMLİK MASKESİ KUŞANMA (USE ANON MASK - 30 DAKİKA)
    socket.on('useAnonMask', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const callerLevel = players[socket.id].level || (userData.level || 1);
        if (callerLevel < 3) {
            socket.emit('gameError', '🔒 Gizli Kimlik Maskesi\'ni kuşanabilmek için en az Seviye 3 olmalısınız!');
            return;
        }

        const now = Date.now();
        const hasPausedTime = (userData.anonMaskRemainingMs && userData.anonMaskRemainingMs > 0);
        const count = userData.anonMaskCount || 0;

        if (!hasPausedTime && count <= 0) {
            socket.emit('gameError', '❌ Çantanızda Gizli Kimlik Maskesi kalmadı! Tekinsiz Tekin\'den satın alabilirsiniz (3.000 TL).');
            return;
        }

        if (hasPausedTime) {
            // Önceden çıkarılmış maskenin duraklatılmış kalan süresini geri yükle
            userData.anonMaskExpiresAt = now + userData.anonMaskRemainingMs;
            delete userData.anonMaskRemainingMs;
        } else {
            // 1 adet tüket ve 30 dakika süre başlat
            userData.anonMaskCount = Math.max(0, count - 1);
            const duration = 30 * 60 * 1000;
            userData.anonMaskExpiresAt = (userData.anonMaskExpiresAt && userData.anonMaskExpiresAt > now)
                ? (userData.anonMaskExpiresAt + duration)
                : (now + duration);
        }

        userData.propInventory = userData.propInventory || {};
        if ((userData.anonMaskCount || 0) <= 0 && (!userData.anonMaskRemainingMs || userData.anonMaskRemainingMs <= 0)) {
            userData.propInventory['anon_mask'] = 1;
            userData.propInventory['props_anon_mask'] = 1;
        } else {
            userData.propInventory['anon_mask'] = userData.anonMaskCount || 1;
            userData.propInventory['props_anon_mask'] = userData.anonMaskCount || 1;
        }

        players[socket.id].anonMaskExpiresAt = userData.anonMaskExpiresAt;
        dataManager.savePersistentData(username);

        socket.emit('propInventoryUpdate', userData.propInventory);
        socket.emit('anonMaskStatusUpdate', {
            isMasked: true,
            remainingSec: Math.floor((userData.anonMaskExpiresAt - now) / 1000)
        });
        io.to(players[socket.id].room).emit('playerShadyUpdate', {
            id: socket.id,
            anonMaskExpiresAt: userData.anonMaskExpiresAt
        });

        const remMin = Math.ceil((userData.anonMaskExpiresAt - now) / 60000);
        socket.emit('systemMessage', `🎭 Gizli Kimlik Maskesi takıldı! ${remMin} dakika boyunca isminiz '???' olacak, konuşmalarınız dumanlı aura yayacak ve suç bültenlerinde kimliğiniz gizlenecektir.`);
        emitShadyShopStateToSocket(socket, userData, players[socket.id]);
    });

    // 3.4 GİZLİ KİMLİK MASKESİ ÇIKARMA (REMOVE ANON MASK)
    socket.on('removeAnonMask', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const now = Date.now();
        if (!userData.anonMaskExpiresAt || userData.anonMaskExpiresAt <= now) {
            socket.emit('gameError', 'Zaten maske takmıyorsunuz!');
            return;
        }

        // Kalan süreyi dondur ve sakla (Böylece çıkarınca süresi heba olmaz)
        const remainingMs = userData.anonMaskExpiresAt - now;
        userData.anonMaskRemainingMs = Math.max(0, remainingMs);
        userData.anonMaskExpiresAt = 0;
        players[socket.id].anonMaskExpiresAt = 0;

        userData.propInventory = userData.propInventory || {};
        userData.propInventory['anon_mask'] = userData.anonMaskCount || 1;
        userData.propInventory['props_anon_mask'] = userData.anonMaskCount || 1;

        socket.emit('propInventoryUpdate', userData.propInventory);
        socket.emit('anonMaskStatusUpdate', {
            isMasked: false,
            remainingSec: Math.floor(userData.anonMaskRemainingMs / 1000)
        });
        dataManager.savePersistentData(username);

        io.to(players[socket.id].room).emit('playerShadyUpdate', {
            id: socket.id,
            anonMaskExpiresAt: 0
        });

        socket.emit('systemMessage', `🎭 Maskenizi çıkardınız. Kalan ${Math.ceil(userData.anonMaskRemainingMs / 60000)} dakikanız saklandı. Gerçek kimliğinize (${username}) döndünüz.`);
        emitShadyShopStateToSocket(socket, userData, players[socket.id]);
    });

    // 4. SİNYAL KESİCİ (JAMMER) KULLANMA
    socket.on('useJammerOnPlayer', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        if (!checkRateLimit(socket, 'useJammer', 10, 2000)) return;

        const callerName = players[socket.id].name;
        const callerKey = (dataManager.findUserKey ? dataManager.findUserKey(callerName) : null) || callerName;
        const callerData = dataManager.persistentData.users[callerKey];

        const callerLevel = players[socket.id].level || (callerData?.level || 1);
        if (callerLevel < 3) {
            socket.emit('gameError', '🔒 Sinyal Kesici (Jammer)\'ı kullanabilmek için en az Seviye 3 olmalısınız!');
            return;
        }

        if (!callerData || !callerData.jammerCount || callerData.jammerCount <= 0) {
            socket.emit('gameError', '❌ Üzerinizde Sinyal Kesici (Jammer) kalmadı! Tekinsiz Tekin\'den satın alabilirsiniz.');
            return;
        }

        const targetUsername = data.targetUsername;
        const targetKey = (dataManager.findUserKey ? dataManager.findUserKey(targetUsername) : null) || targetUsername;
        const targetData = dataManager.persistentData.users[targetKey];

        if (!targetData) {
            socket.emit('gameError', '❌ Hedef oyuncu bulunamadı.');
            return;
        }

        // Çevrimiçi soketini bul
        const targetSocketId = Object.keys(players).find(sid => {
            return players[sid] && players[sid].name && players[sid].name.toLowerCase() === targetKey.toLowerCase();
        });

        if (!targetSocketId) {
            socket.emit('gameError', `❌ ${targetUsername} şu anda çevrimdışı!`);
            return;
        }

        const callerIsAnon = !!((players[socket.id] && players[socket.id].anonMaskExpiresAt && players[socket.id].anonMaskExpiresAt > Date.now()) || (callerData && callerData.anonMaskExpiresAt && callerData.anonMaskExpiresAt > Date.now()));
        const targetIsAnon = !!((players[targetSocketId] && players[targetSocketId].anonMaskExpiresAt && players[targetSocketId].anonMaskExpiresAt > Date.now()) || (targetData && targetData.anonMaskExpiresAt && targetData.anonMaskExpiresAt > Date.now()));
        const callerDisplayName = callerIsAnon ? "Maskeli bir şahıs" : callerName;
        const targetDisplayNameJammer = targetIsAnon ? "kimliği belirsiz şahsın" : `${targetUsername}'nin`;

        // 1. Hedefin Koruma veya Dobermanı Var mı Kontrol Et (Frekans Filtreleme Kalkanı)
        const guards = (typeof petManager.getBodyguardsByUsername === 'function') ? petManager.getBodyguardsByUsername(targetUsername) : [];
        const companionPet = (typeof petManager.getPetByUsername === 'function') ? petManager.getPetByUsername(targetUsername) : null;
        let sacrificeProtector = null;
        const availableGuards = guards.filter(g => !g.isFilteringJammer && !g.isSacrificing);
        if (availableGuards && availableGuards.length > 0) {
            sacrificeProtector = availableGuards.sort((a, b) => (b.slotIndex || 0) - (a.slotIndex || 0))[0];
        } else if (companionPet && companionPet.petType === 'doberman' && !companionPet.isFilteringJammer && !companionPet.isSacrificing) {
            sacrificeProtector = companionPet;
        }

        const isFiltered = !!sacrificeProtector;
        if (sacrificeProtector) {
            sacrificeProtector.isFilteringJammer = true;
        }
        // Normalde 3 dakika (180 sn), koruma frekansı filtrelerse sadece 15 saniye!
        const jammerDuration = isFiltered ? (15 * 1000) : (3 * 60 * 1000);
        const expiresAt = Date.now() + jammerDuration;

        targetData.jammerExpiresAt = expiresAt;
        if (players[targetSocketId]) {
            players[targetSocketId].jammerExpiresAt = expiresAt;
        }

        // Kullananın jammer adedini düş (1 kullanımlık)
        callerData.jammerCount = Math.max(0, (callerData.jammerCount || 1) - 1);
        callerData.propInventory = callerData.propInventory || {};
        callerData.propInventory['props_jammer'] = callerData.jammerCount;
        if (callerData.jammerCount <= 0) {
            callerData.inventory = (callerData.inventory || []).filter(k => k !== 'props_jammer' && k !== 'jammer');
        }
        socket.emit('propInventoryUpdate', callerData.propInventory);

        dataManager.savePersistentData(callerName);
        dataManager.savePersistentData(targetUsername);

        // Odaya ve oyuna yayınla
        const targetRoom = players[targetSocketId]?.room || players[socket.id].room;
        io.emit('playerJammedState', {
            id: targetSocketId,
            name: targetKey,
            jammerExpiresAt: expiresAt
        });

        // Sesli sohbet bağlantısını sustur
        try {
            const { cleanupSocketVoice } = require('./voiceHandler');
            cleanupSocketVoice({ id: targetSocketId, leave: () => {} });
        } catch (e) {
            console.error("cleanupSocketVoice error:", e);
        }

        if (isFiltered) {
            // FEDAİ FREKANS FİLTRELEME AKIŞI
            const protectorIdToDespawn = sacrificeProtector.id;
            const protectorNameToDespawn = sacrificeProtector.name;
            const protectorType = sacrificeProtector.petType;

            io.to(targetRoom).emit('protectorJammerFilterStarted', {
                protectorId: protectorIdToDespawn,
                protectorName: protectorNameToDespawn,
                protectorType: protectorType,
                targetId: targetSocketId,
                targetName: targetUsername,
                callerName: callerName,
                durationMs: 15000
            });

            io.to(targetRoom).emit('chatUpdate', {
                id: 'system',
                name: '📡 FREKANS FİLTRESİ',
                room: targetRoom,
                msg: `📡⚡ ${callerName}, ${targetUsername}'a Jammer attı! Ancak ${protectorNameToDespawn} telsizini çıkarıp frekansı çözmeye başladı! [15 sn]`,
                channel: 'room'
            });

            socket.emit('systemMessage', `📡⚠️ Jammer çalıştırıldı fakat hedefin koruması (${protectorNameToDespawn}) telsizle sinyali filtrelemeye başladı! Jammer 15 saniyede kırılacak!`);
            io.to(targetSocketId).emit('systemMessage', `🛡️📡 Jammer saldırısı! ${protectorNameToDespawn} telsizini açarak frekansı filtreliyor! 15 saniye içinde sinyal kurtarılacak!`);

            io.to(targetSocketId).emit('youWereJammed', {
                callerName: callerName,
                expiresAt: expiresAt,
                durationMs: 15000,
                message: `${protectorNameToDespawn} jammer frekansını deşifre ediyor! 15 saniye sonra sinyal açılacak.`
            });

            // 15. Saniyede Sinyalin Açılması ve Cihazın Yanması
            setTimeout(() => {
                const curTargetData = dataManager.persistentData.users[targetKey];
                if (curTargetData) {
                    curTargetData.jammerExpiresAt = 0;
                    if (protectorType === 'izbandut') {
                        curTargetData.bodyguardsEquipped = Math.max(0, (curTargetData.bodyguardsEquipped || 1) - 1);
                        curTargetData.bodyguardCount = Math.max(0, (curTargetData.bodyguardCount || 1) - 1);
                        curTargetData.propInventory = curTargetData.propInventory || {};
                        if (curTargetData.bodyguardCount <= 0) {
                            delete curTargetData.propInventory['props_izbandut'];
                        } else {
                            curTargetData.propInventory['props_izbandut'] = curTargetData.bodyguardCount;
                        }
                    } else if (protectorType === 'doberman') {
                        curTargetData.hasDoberman = false;
                        curTargetData.dobermanEquipped = false;
                        if (curTargetData.propInventory) {
                            delete curTargetData.propInventory['props_doberman'];
                            delete curTargetData.propInventory['props_pet_doberman'];
                        }
                        if (curTargetData.inventory) {
                            curTargetData.inventory = curTargetData.inventory.filter(i => i !== 'props_doberman' && i !== 'props_pet_doberman');
                        }
                    }
                    dataManager.savePersistentData(targetUsername);
                }
                const curSocketId = Object.keys(players).find(sid => {
                    return players[sid] && players[sid].name && players[sid].name.toLowerCase() === targetKey.toLowerCase();
                }) || targetSocketId;

                if (curSocketId && curTargetData) {
                    io.to(curSocketId).emit('propInventoryUpdate', curTargetData.propInventory || {});
                    const victimSock = io.sockets.sockets.get(curSocketId);
                    if (victimSock) {
                        emitShadyShopStateToSocket(victimSock, curTargetData, players[curSocketId]);
                    }
                }

                if (players[curSocketId]) {
                    players[curSocketId].jammerExpiresAt = 0;
                }
                io.emit('playerJammedState', {
                    id: curSocketId,
                    name: targetKey,
                    jammerExpiresAt: 0
                });

                io.to(targetRoom).emit('protectorJammerBurnout', {
                    protectorId: protectorIdToDespawn,
                    targetId: curSocketId,
                    targetName: targetUsername
                });

                io.to(curSocketId).emit('systemMessage', `📡✅ Frekans çözüldü! ${protectorNameToDespawn} jammer sinyalini kırdı ve seni kurtardı! Ancak telsiz aşırı yükten yandı ve fedai görevden ayrıldı.`);
                const targetDisplayNameKurtuldu = targetIsAnon ? "kimliği belirsiz şahsın" : `${targetUsername}'ın`;
                io.to(targetRoom).emit('chatUpdate', {
                    id: 'system',
                    name: '📡 FREKANS ÇÖZÜLDÜ',
                    room: targetRoom,
                    msg: `📡💥 ${targetDisplayNameKurtuldu} fedaisi 15 saniyede ${callerIsAnon ? "maskeli şahsın jammerını" : "jammerı"} etkisiz hale getirdi! Aşırı yükten yanan telsiziyle görevden ayrıldı.`,
                    channel: 'room'
                });

                petManager.despawnPet(protectorIdToDespawn, "Jammer frekansını çözdü ve telsizi yandı");
            }, 15000);

        } else {
            // Normal 180 sn jammer bildirimi
            const jammerNoticeText = `${callerDisplayName}, ${targetDisplayNameJammer} jammerla sinyalini kesti.`;
            io.emit('playerJammedNotification', {
                callerName: callerDisplayName,
                targetName: targetIsAnon ? "???" : targetUsername,
                text: jammerNoticeText,
                room: targetRoom
            });

            io.to(targetSocketId).emit('youWereJammed', {
                callerName: callerDisplayName,
                expiresAt: expiresAt,
                durationMs: jammerDuration,
                message: callerIsAnon ? 'Maskeli bir şahıs üstünde jammer kullandı ve 3 dakika boyunca sinyalini kesti.' : `${callerName} üstünde jammer kullandı ve 3 dakika boyunca sinyalini kesti.`
            });

            socket.emit('systemMessage', `✅ Sinyal Kesici başarıyla çalıştırıldı! ${targetKey} 3 dakika boyunca chate yazı yazamayacak ve kafasında "Sinyal Yok" ikonu yanacak.`);
            io.to(targetSocketId).emit('systemMessage', `📡❌ DİKKAT: Üzerinizde Sinyal Kesici (Jammer) kullanıldı! Frekansınız bloke edildi, 3 dakika boyunca konuşamaz ve fısıldayamazsınız.`);
        }

        emitShadyShopStateToSocket(socket, callerData, players[socket.id]);
    });

    // 5. GASP BIÇAĞI KULLANMA (1 KULLANIMLIK, MAX 2000 TL, HEDEF BAŞINA 24 SAAT LİMİTİ)
    socket.on('useMugKnifeOnPlayer', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        if (!checkRateLimit(socket, 'useMugKnife', 10, 2000)) return;

        const callerName = players[socket.id].name;
        const callerKey = (dataManager.findUserKey ? dataManager.findUserKey(callerName) : null) || callerName;
        const callerData = dataManager.persistentData.users[callerKey];

        const callerLevel = players[socket.id].level || (callerData?.level || 1);
        if (callerLevel < 2) {
            socket.emit('gameError', '🔒 Gasp Bıçağı\'nı kullanabilmek için en az Seviye 2 olmalısınız!');
            return;
        }

        const currentKnives = (callerData?.mugKnifeCount !== undefined) ? callerData.mugKnifeCount : (callerData?.hasMugKnife ? 1 : 0);
        if (!callerData || currentKnives <= 0) {
            socket.emit('gameError', '❌ Gasp Bıçağınız kalmadı! VİP CLUB\'da Tekinsiz Tekin\'den satın alabilirsiniz (2 💎).');
            return;
        }

        const targetUsername = data.targetUsername;
        if (targetUsername.toLowerCase() === callerName.toLowerCase()) {
            socket.emit('gameError', '❌ Kendinizi gasp edemezsiniz!');
            return;
        }

        const targetKey = (dataManager.findUserKey ? dataManager.findUserKey(targetUsername) : null) || targetUsername;
        const targetData = dataManager.persistentData.users[targetKey];

        if (!targetData) {
            socket.emit('gameError', '❌ Hedef oyuncu bulunamadı.');
            return;
        }

        // Aynı kişiye günde (24 saatte) sadece 1 kez kullanılabilir kuralı
        callerData.muggedTargets = callerData.muggedTargets || {};
        const lastMugOnTarget = callerData.muggedTargets[targetKey.toLowerCase()] || 0;
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const timePassedTarget = Date.now() - lastMugOnTarget;

        if (timePassedTarget < ONE_DAY_MS) {
            const remMs = ONE_DAY_MS - timePassedTarget;
            const remHours = Math.floor(remMs / (60 * 60 * 1000));
            const remMins = Math.ceil((remMs % (60 * 60 * 1000)) / (60 * 1000));
            socket.emit('gameError', `⏳ "${targetKey}" adlı oyuncuyu bugün zaten gasp ettiniz! Aynı kişiyi 24 saat içinde yalnızca 1 kez hedef alabilirsiniz. (Kalan süre: ${remHours} saat ${remMins} dakika).`);
            return;
        }

        // Çevrimiçi soketi ve aynı oda kontrolü
        const targetSocketId = Object.keys(players).find(sid => {
            return players[sid] && players[sid].name && players[sid].name.toLowerCase() === targetKey.toLowerCase();
        });

        if (!targetSocketId) {
            socket.emit('gameError', `❌ ${targetUsername} şu anda çevrimdışı!`);
            return;
        }

        const callerIsAnon = !!((players[socket.id] && players[socket.id].anonMaskExpiresAt && players[socket.id].anonMaskExpiresAt > Date.now()) || (callerData && callerData.anonMaskExpiresAt && callerData.anonMaskExpiresAt > Date.now()));
        const targetIsAnon = !!((players[targetSocketId] && players[targetSocketId].anonMaskExpiresAt && players[targetSocketId].anonMaskExpiresAt > Date.now()) || (targetData && targetData.anonMaskExpiresAt && targetData.anonMaskExpiresAt > Date.now()));
        const callerDisplayName = callerIsAnon ? "Maskeli bir şahıs" : callerName;
        const targetDisplayNameJammer = targetIsAnon ? "kimliği belirsiz şahsın" : `${targetUsername}'nin`;

        const callerRoom = players[socket.id].room;
        const targetRoom = players[targetSocketId].room;

        if (callerRoom !== targetRoom) {
            socket.emit('gameError', `❌ Hedef oyuncu ile aynı mekanda olmalısınız!`);
            return;
        }

        // Bıçağı tüket (1 kullanımlık eşya kuralı)
        callerData.mugKnifeCount = Math.max(0, currentKnives - 1);
        callerData.hasMugKnife = callerData.mugKnifeCount > 0;
        callerData.propInventory = callerData.propInventory || {};
        callerData.propInventory['props_gasp_bicagi'] = callerData.mugKnifeCount;
        callerData.propInventory['props_mug_knife'] = callerData.mugKnifeCount;
        if (callerData.mugKnifeCount <= 0) {
            callerData.inventory = (callerData.inventory || []).filter(k => k !== 'props_mug_knife' && k !== 'props_gasp_bicagi');
        }
        callerData.muggedTargets[targetKey.toLowerCase()] = Date.now();
        callerData.lastMugTime = Date.now();
        dataManager.savePersistentData(callerName);
        socket.emit('propInventoryUpdate', callerData.propInventory);

        // 1. Hedefin Koruma veya Dobermanı Var mı Kontrol Et! (Can Siperi Savunması)
        // Eğer eşya olarak olduğu halde giyilmemişse (unequipped) hedef soyulabilir!
        const guards = (typeof petManager.getBodyguardsByUsername === 'function') ? petManager.getBodyguardsByUsername(targetUsername) : [];
        const companionPet = (typeof petManager.getPetByUsername === 'function') ? petManager.getPetByUsername(targetUsername) : null;
        let sacrificeProtector = null;
        const availableGuards = guards.filter(g => !g.isSacrificing);
        if (availableGuards && availableGuards.length > 0) {
            // Sıralama: En yüksek slot önce gider (Slot 2 -> Slot 1 -> Slot 0)
            sacrificeProtector = availableGuards.sort((a, b) => (b.slotIndex || 0) - (a.slotIndex || 0))[0];
        } else if (companionPet && companionPet.petType === 'doberman' && !companionPet.isSacrificing) {
            // Fedailer bittiyse son can siperi Doberman!
            sacrificeProtector = companionPet;
        }

        if (sacrificeProtector) {
            sacrificeProtector.isSacrificing = true;
            // GASP ENGELLENDİ! Kurban 0 TL kaybeder, saldırganın 1 bıçağı ve günlük hedef hakkı yanar.
            const protectorName = sacrificeProtector.name;
            const protectorId = sacrificeProtector.id;
            const protectorType = sacrificeProtector.petType;

            // Kurbanın çantasından fedaiyi/Dobermanı düş
            if (protectorType === 'izbandut') {
                targetData.bodyguardsEquipped = Math.max(0, (targetData.bodyguardsEquipped || 1) - 1);
                targetData.bodyguardCount = Math.max(0, (targetData.bodyguardCount || 1) - 1);
                targetData.propInventory = targetData.propInventory || {};
                if (targetData.bodyguardCount <= 0) {
                    delete targetData.propInventory['props_izbandut'];
                } else {
                    targetData.propInventory['props_izbandut'] = targetData.bodyguardCount;
                }
            } else if (protectorType === 'doberman') {
                targetData.hasDoberman = false;
                targetData.dobermanEquipped = false;
                if (targetData.propInventory) {
                    delete targetData.propInventory['props_doberman'];
                    delete targetData.propInventory['props_pet_doberman'];
                }
                if (targetData.inventory) {
                    targetData.inventory = targetData.inventory.filter(i => i !== 'props_doberman' && i !== 'props_pet_doberman');
                }
            }
            dataManager.savePersistentData(targetUsername);

            io.to(targetSocketId).emit('propInventoryUpdate', targetData.propInventory || {});
            const targetSock = io.sockets.sockets.get(targetSocketId);
            if (targetSock) {
                emitShadyShopStateToSocket(targetSock, targetData, players[targetSocketId]);
            }

            // Bildirimler
            const targetDisplayNameGasp = targetIsAnon ? "kimliği belirsiz şahsı" : `${targetKey}'ı`;
            socket.emit('gameError', `❌ GASP BAŞARISIZ! ${targetDisplayNameGasp} koruması (${protectorName}) saldırını havada yakaladı ve püskürttü!`);
            socket.emit('systemMessage', `🛡️❌ GASP ENGELLENDİ! Hedefin koruması darbeyi göğüsledi, elin boş döndün! (Gasp bıçağın kırıldı ve kullanıldı)`);
            io.to(targetSocketId).emit('systemMessage', `🛡️💥 GASP ENGELLENDİ! ${protectorName} kendini feda ederek ${callerDisplayName}'in gasp saldırısını püskürttü! (0 TL kaybettiniz)`);

            // Odaya dramatik fedai anonsu
            io.to(callerRoom).emit('chatUpdate', {
                id: 'system',
                name: '🛡️ FEDAİ SAVUNMASI',
                room: callerRoom,
                msg: callerIsAnon
                    ? `🛡️💥 Maskeli bir şahıs az önce ${targetDisplayNameGasp} gasp etmeye çalıştı ancak ${protectorName} araya girerek saldırıyı püskürttü! Fedai görevini tamamlayıp ayrıldı.`
                    : `🛡️💥 ${callerName}, ${targetDisplayNameGasp} gasp etmeye çalıştı ancak ${protectorName} araya girerek saldırıyı püskürttü! Fedai görevini tamamlayıp ayrıldı.`,
                channel: 'room'
            });

            // İstemci görsel animasyonu (konuşma balonu, kalkan ışıltısı ve fade-out)
            io.to(callerRoom).emit('protectorSacrificeMugDefend', {
                protectorId: protectorId,
                protectorName: protectorName,
                protectorType: protectorType,
                targetId: targetSocketId,
                targetName: targetIsAnon ? "???" : targetKey,
                callerName: callerDisplayName
            });

            // Fedaiyi haritadan kaldır (2.5 sn konuşma ve savunma animasyonu sonrasında mekandan ayrılır)
            setTimeout(() => {
                petManager.despawnPet(protectorId, "Gasp savunmasında feda oldu");
            }, 2500);

            emitShadyShopStateToSocket(socket, callerData, players[socket.id]);
            return;
        }

        // Çalınacak miktar: max 2.000 TL, hedefte 2000'den az varsa olan para
        const targetCurrentMoney = Math.max(0, targetData.money || 0);
        const stolenAmount = Math.min(2000, targetCurrentMoney);

        console.log(`🗡️ [MUGGING]: caller=${callerName} (${callerRoom}), target=${targetUsername} (${targetRoom}), stolen=${stolenAmount} TL`);
        // Para transferi
        targetData.money -= stolenAmount;
        callerData.money += stolenAmount;
        if (players[socket.id]) players[socket.id].money = callerData.money;
        if (players[targetSocketId]) players[targetSocketId].money = targetData.money;

        dataManager.savePersistentData(callerName);
        dataManager.savePersistentData(targetUsername);

        // İstemcilere para bildirimleri
        socket.emit('moneyUpdate', callerData.money);
        io.to(targetSocketId).emit('moneyUpdate', targetData.money);

        // Bildirimler & Ses/Uyarı Efektleri
        const targetDisplayNameGasp = targetIsAnon ? "kimliği belirsiz şahsın" : `${targetKey}'ın`;
        const victimTargetNotice = targetIsAnon ? "kimliği belirsiz şahsı" : `${targetKey}'ı`;

        socket.emit('systemMessage', `🗡️💥 GASP BAŞARILI! ${targetDisplayNameGasp} yolunu kestiniz ve cebindeki ${stolenAmount.toLocaleString('tr-TR')} TL'yi aldınız! (Gasp Bıçağınız kullanıldı)`);
        io.to(targetSocketId).emit('systemMessage', `🚨 SOKAKTA GASP EDİLDİNİZ! ${callerDisplayName} Gasp Bıçağı ile yolunuzu keserek sizden ${stolenAmount.toLocaleString('tr-TR')} TL çaldı!`);

        // Odaya dramatik duyuru
        // Kullanıcı şartı: "Maskeli bir şahıs az önce [kurban]'ı gasp etti ve kaçtı. yazsın."
        io.to(callerRoom).emit('chatUpdate', {
            id: 'system',
            name: '🚨 KARANLIK SOKAKLAR',
            room: callerRoom,
            msg: callerIsAnon
                ? `🚨 Maskeli bir şahıs az önce ${victimTargetNotice} gasp etti ve kaçtı!`
                : `⚠️ ${callerName}, ${victimTargetNotice} arkasından sessizce yaklaşarak ${stolenAmount.toLocaleString('tr-TR')} TL gasp etti!`,
            channel: 'room'
        });

        emitShadyShopStateToSocket(socket, callerData, players[socket.id]);
    });
}

module.exports = {
    registerVipClubHandlers,
    SHADY_ITEMS,
    VIP_CLUB_ENTRY_FEE,
    emitShadyShopStateToSocket
};
