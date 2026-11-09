// src/petManager.js - Mini Metaverse Evcil Hayvan (Pet) Yöneticisi
// Kedi, Köpek ve Fare yoldaşlarının sunucu durumunu, 15 dakikalık sürelerini ve takibini yönetir.

const activeCompanionPets = {};   // username -> petObject
const petExpireTimers = {};       // username -> Timeout
const petTalkIntervals = {};      // username -> Interval

let ioRef = null;
let playersRef = null;
let dataManagerRef = null;

// Evcil Hayvan Özellikleri ve Fiyatları
const PET_CONFIGS = {
    cat: {
        type: 'cat',
        name: 'Kedi',
        price: 2000,
        emoji: '🐱',
        sayings: [
            "Miyavvv! 🐾",
            "Mırrrr... ❤️",
            "Süt var mı acaba? 🥛",
            "Tırmalarım ha! 😼",
            "Beni sevdin mi? ✨",
            "Güneşlenmek çok güzel... ☀️",
            "Miyav! Biraz başımı okşa."
        ]
    },
    dog: {
        type: 'dog',
        name: 'Köpek',
        price: 3000,
        emoji: '🐶',
        sayings: [
            "Hav hav! 🐶",
            "Seni çok seviyorum! ❤️",
            "Kemik nerede? 🦴",
            "Kurt gibi sadığım! 🐕",
            "Birlikte koşalım mı? 🎾",
            "Kuyruğumu yakalayamıyorum!",
            "Hav hav! Hep yanındayım!"
        ]
    },
    mouse: {
        type: 'mouse',
        name: 'Fare',
        price: 1500,
        emoji: '🐭',
        sayings: [
            "Peynirim nerede? 🧀",
            "Cik cik! Delik çok yakın! 🐭",
            "Şaman bir köprü atsana! ⚡",
            "Peyniri kaptım, kaçıyorum! 🧀💨",
            "Transformice hızım yerinde! 🚀",
            "Cik cik! Cebinde peynir var mı?",
            "Kulağımdaki peyniri sakın yeme! 🧀"
        ]
    },
    izbandut: {
        type: 'izbandut',
        name: 'İzbandut Koruma',
        price: 5000,
        emoji: '🕶️',
        scale: 1.10,
        sayings: [
            "Güvendesiniz patron.",
            "Gözüm üzerinizde.",
            "Kimse size yaklaşamaz.",
            "Her şey kontrol altında."
        ]
    },
    doberman: {
        type: 'doberman',
        name: 'Doberman Koruma',
        price: 4000,
        emoji: '🐕‍🦺',
        scale: 1.05,
        durationMs: 4 * 60 * 60 * 1000, // 4 Saat
        sayings: [
            "Grrr... Yanındayım patron.",
            "Hav! Tehlike yok.",
            "Gözüm etrafta, kimse yaklaşamaz.",
            "Sadakatim sonsuz!"
        ]
    }
};

const PET_DURATION_MS = 15 * 60 * 1000; // 15 Dakika

function init(io, players, dataManager) {
    ioRef = io;
    playersRef = players;
    dataManagerRef = dataManager;
}

/**
 * Socket.IO ile istemcilere gönderilmeden önce Timer/Döngüsel referanslardan
 * arındırılmış temiz DTO nesnesi döndürür.
 */
function toPetDTO(pet) {
    if (!pet) return null;
    const cfg = PET_CONFIGS[pet.petType];
    return {
        id: pet.id,
        ownerId: pet.ownerId,
        ownerName: pet.ownerName,
        petType: pet.petType,
        slotIndex: (typeof pet.slotIndex === 'number') ? pet.slotIndex : 0,
        scale: pet.scale || (cfg ? cfg.scale : 1.0) || 1.10,
        emoji: pet.emoji || (cfg ? cfg.emoji : '🐾'),
        name: pet.name,
        room: pet.room,
        x: pet.x,
        y: pet.y,
        facing: pet.facing || 'down',
        speech: pet.speech || null,
        speechUntil: pet.speechUntil || 0,
        expiresAt: pet.expiresAt,
        durationMs: pet.durationMs,
        createdAt: pet.createdAt
    };
}

function getActivePets() {
    return activeCompanionPets;
}

function getPetsInRoom(roomName) {
    const list = [];
    const now = Date.now();
    for (const id in activeCompanionPets) {
        const pet = activeCompanionPets[id];
        const isNotExpired = pet.isPermanent || (pet.expiresAt ? pet.expiresAt > now : true);
        if (pet && pet.room === roomName && pet.ownerId && isNotExpired) {
            if (!playersRef || playersRef[pet.ownerId]) {
                list.push(toPetDTO(pet));
            }
        }
    }
    return list;
}

function getPetByOwnerId(ownerId) {
    for (const id in activeCompanionPets) {
        const pet = activeCompanionPets[id];
        if (pet && pet.ownerId === ownerId) {
            return pet;
        }
    }
    return null;
}

function getAllPetsByOwnerId(ownerId) {
    const list = [];
    for (const id in activeCompanionPets) {
        const pet = activeCompanionPets[id];
        if (pet && pet.ownerId === ownerId) {
            list.push(pet);
        }
    }
    return list;
}

function getBodyguardsByUsername(username) {
    if (!username) return [];
    const list = [];
    const now = Date.now();
    const targetUser = username.toLowerCase();
    for (const id in activeCompanionPets) {
        const pet = activeCompanionPets[id];
        const isNotExpired = pet.isPermanent || (pet.expiresAt ? pet.expiresAt > now : true);
        if (pet && pet.ownerName && pet.ownerName.toLowerCase() === targetUser && pet.petType === 'izbandut' && isNotExpired) {
            list.push(pet);
        }
    }
    return list;
}

function getPetByUsername(username) {
    if (!username) return null;
    const targetUser = username.toLowerCase();
    for (const id in activeCompanionPets) {
        const pet = activeCompanionPets[id];
        if (pet && pet.ownerName && pet.ownerName.toLowerCase() === targetUser && pet.petType !== 'izbandut') {
            return pet;
        }
    }
    for (const id in activeCompanionPets) {
        const pet = activeCompanionPets[id];
        if (pet && pet.ownerName && pet.ownerName.toLowerCase() === targetUser) {
            return pet;
        }
    }
    return null;
}

/**
 * VIP İzbandut Koruma Çağırır (Süresiz, biri saldırıp can siperi oluncaya kadar kalır)
 */
function spawnPermanentBodyguard(ownerId, username) {
    if (!playersRef || !playersRef[ownerId]) return null;
    const player = playersRef[ownerId];
    const room = player.room || 'cadde';
    const userGuards = getBodyguardsByUsername(username);
    if (userGuards.length >= 3) {
        return null;
    }

    const usedSlots = userGuards.map(g => g.slotIndex);
    const slotIndex = [0, 1, 2].find(s => !usedSlots.includes(s)) ?? userGuards.length;
    const petId = `pet_izbandut_${ownerId}_s${slotIndex}_${Date.now()}`;
    const petDisplayName = `${username} Koruması #${slotIndex + 1}`;

    // V-Refakat formasyonu başlangıç koordinatları
    let offX = (slotIndex === 0) ? -38 : ((slotIndex === 1) ? 38 : 0);
    let offY = (slotIndex === 2) ? -60 : -10;

    const pet = {
        id: petId,
        ownerId: ownerId,
        ownerName: username,
        petType: 'izbandut',
        slotIndex: slotIndex,
        scale: 1.10,
        emoji: '🕶️',
        name: petDisplayName,
        room: room,
        x: (player.x || 400) + offX,
        y: (player.y || 300) + offY,
        facing: player.facing || 'down',
        createdAt: Date.now(),
        isPermanent: true,
        expiresAt: null,
        durationMs: null,
        speech: null,
        speechUntil: 0
    };

    activeCompanionPets[petId] = pet;
    const petDTO = toPetDTO(pet);

    if (ioRef) {
        if (room) {
            ioRef.to(room).emit('systemMessage', `🕴️ ${username} yanına İzbandut Özel Koruma (#${slotIndex + 1}/3) aldı!`);
            ioRef.to(room).emit('companionPetSpawned', { pet: petDTO });
        }
        ioRef.to(ownerId).emit('companionPetSpawned', { pet: petDTO });
    }

    return pet;
}

function spawnBodyguard(ownerId, username) {
    return spawnPermanentBodyguard(ownerId, username);
}

/**
 * Sadık Doberman Koruma Çağırır (Süresiz, gasp savuşturuncaya kadar kalır)
 */
function spawnPermanentDoberman(ownerId, username) {
    if (!playersRef || !playersRef[ownerId]) return null;
    const player = playersRef[ownerId];
    const room = player.room || 'cadde';

    for (const id in activeCompanionPets) {
        const p = activeCompanionPets[id];
        if (p && p.ownerName === username && p.petType === 'doberman') {
            despawnPet(id, "Doberman yenilendi");
        }
    }

    const cfg = PET_CONFIGS.doberman || { emoji: '🐕‍🦺', scale: 1.05 };
    const petId = `pet_doberman_${ownerId}_${Date.now()}`;
    const petDisplayName = `${username}'in Sadık Dobermanı`;
    const spawnX = (player.x || 400) + 26;
    const spawnY = (player.y || 300) + 6;

    const pet = {
        id: petId,
        ownerId: ownerId,
        ownerName: username,
        petType: 'doberman',
        slotIndex: 0,
        scale: cfg.scale || 1.05,
        emoji: cfg.emoji || '🐕‍🦺',
        name: petDisplayName,
        room: room,
        x: spawnX,
        y: spawnY,
        facing: 'down',
        createdAt: Date.now(),
        isPermanent: true,
        expiresAt: null,
        durationMs: null,
        speech: null,
        speechUntil: 0
    };

    activeCompanionPets[petId] = pet;
    player.activePet = 'doberman';

    const petDTO = toPetDTO(pet);

    if (ioRef) {
        if (room) {
            ioRef.to(room).emit('systemMessage', `🐕‍🦺 ${username} yanına Sadık Doberman'ını aldı!`);
            ioRef.to(room).emit('companionPetSpawned', { pet: petDTO });
        }
        if (ownerId) {
            ioRef.to(ownerId).emit('companionPetSpawned', { pet: petDTO });
        }
    }

    return pet;
}

/**
 * Bir oyuncuya yeni evcil hayvan çağırır
 * (ownerId, petType) veya (ownerId, username, petType) şeklinde çağrılabilir
 */
function spawnPet(ownerId, arg2, arg3) {
    if (!playersRef || !playersRef[ownerId]) return null;
    const player = playersRef[ownerId];
    const username = player.name;
    const room = player.room || 'cadde';

    let petType = arg2;
    if (PET_CONFIGS[arg3]) {
        petType = arg3;
    } else if (PET_CONFIGS[arg2]) {
        petType = arg2;
    }
    if (typeof petType === 'string') petType = petType.toLowerCase().trim();

    if (petType === 'izbandut') {
        return spawnBodyguard(ownerId, username);
    }

    const cfg = PET_CONFIGS[petType];
    if (!cfg) return null;

    // Normal evcil hayvanlar için: Eski normal evcil hayvanı kaldır
    for (const id in activeCompanionPets) {
        const p = activeCompanionPets[id];
        if (p && p.ownerName === username && p.petType !== 'izbandut') {
            despawnPet(id, "Yeni pet alındı");
        }
    }

    const petId = `pet_${petType}_${ownerId}_${Date.now()}`;
    const petDisplayName = `${username}'in ${cfg.name}si`;
    const spawnX = (player.x || 400) + 26;
    const spawnY = (player.y || 300) + 6;
    const petDuration = cfg.durationMs || PET_DURATION_MS;

    const pet = {
        id: petId,
        ownerId: ownerId,
        ownerName: username,
        petType: petType,
        slotIndex: 0,
        scale: cfg.scale || 1.0,
        emoji: cfg.emoji,
        name: petDisplayName,
        room: room,
        x: spawnX,
        y: spawnY,
        facing: 'down',
        createdAt: Date.now(),
        durationMs: petDuration,
        expiresAt: Date.now() + petDuration,
        speech: null,
        speechUntil: 0
    };

    activeCompanionPets[petId] = pet;
    player.activePet = petType;

    const petDTO = toPetDTO(pet);

    if (ioRef) {
        if (room) {
            ioRef.to(room).emit('systemMessage', `🐾 ${username}, sevimli bir ${cfg.name} edindi!`);
            ioRef.to(room).emit('companionPetSpawned', { pet: petDTO });
        }
        if (ownerId) {
            ioRef.to(ownerId).emit('companionPetSpawned', { pet: petDTO });
        }
    }

    petExpireTimers[petId] = setTimeout(() => {
        despawnPet(petId, `${cfg.name} süresi doldu`);
    }, petDuration);

    return pet;
}

/**
 * Petin rastgele konuşması (Kullanıcı talebiyle kaldırıldı)
 */
function triggerRandomPetTalk(username) {
    return;
}

/**
 * Peti haritadan kaldırır
 */
function despawnPet(key, reason = "") {
    let pet = activeCompanionPets[key];
    if (!pet) {
        for (const id in activeCompanionPets) {
            if (activeCompanionPets[id].id === key || activeCompanionPets[id].ownerName === key || activeCompanionPets[id].ownerId === key) {
                pet = activeCompanionPets[id];
                break;
            }
        }
    }
    if (!pet) return;

    const petId = pet.id;
    if (petTalkIntervals[petId]) {
        clearInterval(petTalkIntervals[petId]);
        delete petTalkIntervals[petId];
    }
    if (petExpireTimers[petId]) {
        clearTimeout(petExpireTimers[petId]);
        delete petExpireTimers[petId];
    }

    if (ioRef && pet.room) {
        ioRef.to(pet.room).emit('companionPetDespawned', {
            petId: pet.id,
            ownerId: pet.ownerId,
            reason: reason
        });
    }

    if (playersRef && pet.ownerId && playersRef[pet.ownerId] && pet.petType !== 'izbandut') {
        delete playersRef[pet.ownerId].activePet;
    }

    delete activeCompanionPets[petId];
}

/**
 * Oyuncu oda değiştirdiğinde tüm yoldaşları ve korumaları da onunla beraber gider
 */
function handleRoomChange(ownerId, oldRoom, newRoom) {
    const pets = getAllPetsByOwnerId(ownerId);
    if (!pets || pets.length === 0) return;

    pets.forEach(pet => {
        if (ioRef && oldRoom && oldRoom !== newRoom) {
            ioRef.to(oldRoom).emit('companionPetDespawned', {
                petId: pet.id,
                ownerId: ownerId,
                reason: 'room_change'
            });
        }

        pet.room = newRoom;
        const player = playersRef ? playersRef[ownerId] : null;
        if (player) {
            let offX = 0, offY = 0;
            if (pet.petType === 'izbandut') {
                let slot = pet.slotIndex || 0;
                offX = (slot === 0) ? -34 : ((slot === 1) ? 34 : 0);
                offY = (slot === 2) ? -28 : -10;
            } else {
                offX = 24;
                offY = 6;
            }
            pet.x = player.x + offX;
            pet.y = player.y + offY;
        }

        if (ioRef && newRoom) {
            ioRef.to(newRoom).emit('companionPetSpawned', {
                pet: toPetDTO(pet)
            });
        }
    });
}

/**
 * Sahip yürüdükçe pet ve koruma koordinatlarını günceller
 */
function updateOwnerPosition(ownerId, x, y) {
    const pets = getAllPetsByOwnerId(ownerId);
    if (!pets || pets.length === 0) return;

    pets.forEach(pet => {
        let offX = 0, offY = 0;
        if (pet.petType === 'izbandut') {
            let slot = pet.slotIndex || 0;
            offX = (slot === 0) ? -34 : ((slot === 1) ? 34 : 0);
            offY = (slot === 2) ? -28 : -10;
        } else {
            offX = 24;
            offY = 6;
        }
        pet.x = x + offX;
        pet.y = y + offY;
    });
}

/**
 * Oyuncu yeniden bağlandığında süresi bitmemiş petlerini ve korumalarını geri bağlar
 */
function handleLogin(socket, username, uData = null) {
    if (!username) return;
    const now = Date.now();
    const targetUser = username.toLowerCase();
    for (const petId in activeCompanionPets) {
        const pet = activeCompanionPets[petId];
        if (pet && pet.ownerName && pet.ownerName.toLowerCase() === targetUser && (pet.isPermanent || (pet.expiresAt ? pet.expiresAt > now : true))) {
            pet.ownerId = socket.id;
            const player = playersRef ? playersRef[socket.id] : null;
            if (player) {
                pet.room = player.room || 'cadde';
                let offX = 0, offY = 0;
                if (pet.petType === 'izbandut') {
                    let slot = pet.slotIndex || 0;
                    offX = (slot === 0) ? -38 : ((slot === 1) ? 38 : 0);
                    offY = (slot === 2) ? -60 : -10;
                } else {
                    offX = 24;
                    offY = 14;
                }
                pet.x = player.x + offX;
                pet.y = player.y + offY;
            }
            socket.emit('companionPetSpawned', { pet: toPetDTO(pet) });
            if (ioRef && pet.room) {
                ioRef.to(pet.room).emit('companionPetSpawned', { pet: toPetDTO(pet) });
            }
        }
    }

    // Persistent eşyalar (sunucu yeniden başlasa veya f5 atılsa bile uData'dan kuşanılmışları geri getirir)
    if (uData) {
        const equippedVal = (uData.bodyguardsEquipped !== undefined) ? uData.bodyguardsEquipped : (uData.bodyguardCount || 0);
        const targetGuards = Math.min(equippedVal, uData.bodyguardCount || 0);
        const curGuards = getBodyguardsByUsername(username);
        const neededGuards = targetGuards - curGuards.length;
        for (let i = 0; i < neededGuards; i++) {
            spawnPermanentBodyguard(socket.id, username);
        }

        if (uData.hasDoberman && uData.dobermanEquipped !== false) {
            let hasDob = false;
            for (const pid in activeCompanionPets) {
                const p = activeCompanionPets[pid];
                if (p && p.ownerName && p.ownerName.toLowerCase() === targetUser && p.petType === 'doberman') {
                    hasDob = true;
                    break;
                }
            }
            if (!hasDob) {
                spawnPermanentDoberman(socket.id, username);
            }
        }
    }
}

/**
 * Oyuncu ayrıldığında
 */
function handleDisconnect(ownerId) {
    const pets = getAllPetsByOwnerId(ownerId);
    if (!pets || pets.length === 0) return;

    const now = Date.now();
    pets.forEach(pet => {
        if (ioRef && pet.room) {
            ioRef.to(pet.room).emit('companionPetDespawned', {
                petId: pet.id,
                ownerId: ownerId,
                reason: 'Oyuncu ayrıldı'
            });
        }
        // Eğer petin/korumanın süresi henüz bitmediyse veya kalıcıysa aktif hafızada tut,
        // sadece socket bağlantısını sıfırla; oyuncu tekrar bağlandığında petini geri alır!
        if (pet.isPermanent || (pet.expiresAt && pet.expiresAt > now)) {
            pet.ownerId = null;
        } else {
            delete activeCompanionPets[pet.id];
            if (petExpireTimers[pet.id]) {
                clearTimeout(petExpireTimers[pet.id]);
                delete petExpireTimers[pet.id];
            }
        }
    });
}

module.exports = {
    PET_CONFIGS,
    PET_DURATION_MS,
    init,
    toPetDTO,
    getActivePets,
    getPetsInRoom,
    getPetByOwnerId,
    getAllPetsByOwnerId,
    getBodyguardsByUsername,
    getPetByUsername,
    spawnBodyguard,
    spawnPermanentBodyguard,
    spawnPermanentDoberman,
    spawnPet,
    despawnPet,
    handleRoomChange,
    updateOwnerPosition,
    handleLogin,
    handleDisconnect
};
