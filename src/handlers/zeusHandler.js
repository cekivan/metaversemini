// src/handlers/zeusHandler.js - Zeus'un Yıldırımı (İlahi Yıldırım Çarptırma, Göğün Kararması, Çarpılma, Kül Olma & Küllerinden Doğuş)
const dataManager = require('../dataManager');
const petManager = require('../petManager');
const { checkRateLimit } = require('../utils/securityUtils');
const { emitShadyShopStateToSocket } = require('./vipClubHandler');

// Günde en fazla 3 kez kullanılabilir
const MAX_DAILY_STRIKES = 3;
const GATHERING_DURATION_MS = 10000; // 10 saniye gök kararması & dönen fırtına bulutu
const SHOCK_DURATION_MS = 1000;      // 1 saniye iskelet elektrik çarpılması
const ASH_DURATION_MS = 30000;       // 30 saniye kül hali (hareketsiz & sessiz)
const TOTAL_STRIKE_TIME_MS = GATHERING_DURATION_MS + SHOCK_DURATION_MS + ASH_DURATION_MS; // 41.000 ms

function getZeusStrikesToday(userData) {
    const today = new Date().toISOString().slice(0, 10);
    if (!userData.zeusStrikes || userData.zeusStrikes.date !== today) {
        userData.zeusStrikes = { date: today, count: 0 };
    }
    return userData.zeusStrikes;
}

function registerZeusHandlers(io, socket, players, helpers) {
    // 1. Zeus Yıldırımı Durumunu Sorgulama
    socket.on('getZeusState', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        const strikesToday = getZeusStrikesToday(userData);
        socket.emit('zeusStateUpdate', {
            dailyCount: strikesToday.count,
            dailyMax: MAX_DAILY_STRIKES,
            strikesLeft: Math.max(0, MAX_DAILY_STRIKES - strikesToday.count),
            hasItem: (userData.avatar?.heldItem === 'zeus_yildirimi') || (userData.inventory && userData.inventory.includes('props_zeus_yildirimi'))
        });
    });

    // 2. İlahi Yıldırım Çarptırma (castZeusLightning)
    socket.on('castZeusLightning', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        if (!checkRateLimit(socket, 'castZeusLightning', 5, 2000)) return;

        const callerName = players[socket.id].name;
        const callerKey = (dataManager.findUserKey ? dataManager.findUserKey(callerName) : null) || callerName;
        const callerData = dataManager.persistentData.users[callerKey];
        if (!callerData) return;

        // Seviye Kontrolü (En az Seviye 2)
        const callerLevel = players[socket.id].level || (callerData.level || 1);
        if (callerLevel < 2) {
            socket.emit('gameError', '🔒 Zeus\'un İlahi Yıldırımı\'nı kullanabilmek için en az Seviye 2 olmalısınız!');
            return;
        }

        // Eşya ve Adet Kontrolü (1 Kullanımlık Eşya)
        const currentZeusCount = (callerData.zeusCount !== undefined) ? callerData.zeusCount : ((callerData.propInventory && callerData.propInventory['props_zeus_yildirimi']) || 0);
        if (currentZeusCount <= 0 && (!callerData.inventory || !callerData.inventory.includes('props_zeus_yildirimi'))) {
            socket.emit('gameError', "❌ Zeus'un İlahi Yıldırımı kalmadı! VİP CLUB'da Tekinsiz Tekin'den satın alabilirsiniz (2 💎).");
            return;
        }

        const isHoldingZeus = (callerData.avatar?.heldItem === 'zeus_yildirimi') || (players[socket.id].avatar?.heldItem === 'zeus_yildirimi') || (currentZeusCount > 0);
        if (!isHoldingZeus) {
            socket.emit('gameError', "❌ Zeus'un Yıldırımı elinizde kuşanılı değil! Gardıroptan veya Eşya Çantanızdan elinize almalısınız.");
            return;
        }

        const targetUsername = data.targetUsername;
        if (targetUsername.toLowerCase() === callerName.toLowerCase()) {
            socket.emit('gameError', '❌ Zeus bile kendi üstüne yıldırım çakmaz! Başka bir oyuncu seçmelisiniz.');
            return;
        }

        const targetKey = (dataManager.findUserKey ? dataManager.findUserKey(targetUsername) : null) || targetUsername;
        const targetData = dataManager.persistentData.users[targetKey];
        if (!targetData) {
            socket.emit('gameError', '❌ Hedef oyuncu bulunamadı.');
            return;
        }

        // Hedef Soketi & Aynı Oda Kontrolü
        const targetSocketId = Object.keys(players).find(sid => {
            return players[sid] && players[sid].name && players[sid].name.toLowerCase() === targetKey.toLowerCase();
        });

        if (!targetSocketId) {
            socket.emit('gameError', `❌ ${targetUsername} şu anda çevrimdışı!`);
            return;
        }

        const callerRoom = players[socket.id].room;
        const targetRoom = players[targetSocketId].room;
        if (callerRoom !== targetRoom) {
            socket.emit('gameError', '❌ Hedef oyuncu ile aynı mekanda olmalısınız!');
            return;
        }

        const targetPlayer = players[targetSocketId];
        const now = Date.now();

        // Hedef zaten kül veya çarpılma aşamasında mı?
        if (targetPlayer.isAshed || (targetPlayer.ashedUntil && targetPlayer.ashedUntil > now)) {
            socket.emit('gameError', `❌ ${targetUsername} zaten yıldırımla çarpılmış ve kül halinde!`);
            return;
        }

        // 1 Adet Zeus Yıldırımı Tüketimi (1 Kullanımlık Eşya)
        callerData.zeusCount = Math.max(0, currentZeusCount - 1);
        callerData.propInventory = callerData.propInventory || {};
        callerData.propInventory['props_zeus_yildirimi'] = callerData.zeusCount;
        if (callerData.zeusCount <= 0) {
            callerData.inventory = (callerData.inventory || []).filter(k => k !== 'props_zeus_yildirimi');
            if (callerData.avatar && callerData.avatar.heldItem === 'zeus_yildirimi') {
                callerData.avatar.heldItem = 'none';
                players[socket.id].heldItem = 'none';
            }
        }
        dataManager.savePersistentData(callerName);
        socket.emit('propInventoryUpdate', callerData.propInventory);

        const strikeId = 'zeus_' + now + '_' + Math.random().toString(36).slice(2, 6);
        const startTime = now;
        const ashedUntil = startTime + TOTAL_STRIKE_TIME_MS;

        const callerIsAnon = !!((players[socket.id] && players[socket.id].anonMaskExpiresAt && players[socket.id].anonMaskExpiresAt > Date.now()) || (callerData && callerData.anonMaskExpiresAt && callerData.anonMaskExpiresAt > Date.now()));
        const targetIsAnon = !!((players[targetSocketId] && players[targetSocketId].anonMaskExpiresAt && players[targetSocketId].anonMaskExpiresAt > Date.now()) || (targetData && targetData.anonMaskExpiresAt && targetData.anonMaskExpiresAt > Date.now()));

        const casterDisplayName = callerIsAnon ? "Maskeli bir şahıs" : callerName;
        const targetDisplayName = targetIsAnon ? "kimliği belirsiz şahsın" : `${targetUsername}'ın`;
        const targetDisplayNamePatron = targetIsAnon ? "kimliği belirsiz şahıs" : targetUsername;

        // Hedef oyuncunun sunucu üzerindeki kilitlenme zamanı
        targetPlayer.strikeInProgress = true;
        targetPlayer.isAshed = false;
        targetPlayer.ashedUntil = ashedUntil;

        console.log(`⚡ [ZEUS STRIKE]: Caster=${callerName}, Target=${targetUsername}, Room=${callerRoom}, StrikeId=${strikeId}`);

        // A) AŞAMA 1: Fırtına Başlangıcı (10 Saniyelik Kademe Kademe Gök Kararması & Dönen Siyah Bulut)
        io.to(callerRoom).emit('zeusLightningStrikeStart', {
            strikeId,
            casterId: socket.id,
            casterName: casterDisplayName,
            targetId: targetSocketId,
            targetName: targetIsAnon ? "???" : targetUsername,
            targetX: targetPlayer.x,
            targetY: targetPlayer.y,
            startTime: startTime,
            gatheringMs: GATHERING_DURATION_MS
        });

        // Odaya dramatik anons
        io.to(callerRoom).emit('chatUpdate', {
            id: 'system',
            name: '⚡ OLİMPOS GAZABI',
            room: callerRoom,
            msg: `⚡ ${casterDisplayName}, göğe Zeus'un Yıldırımı'nı kaldırdı! Gökyüzü kararıyor, ${targetDisplayName} tepesinde uğursuz kara fırtına bulutları dönmeye başladı!`,
            channel: 'room'
        });

        socket.emit('zeusStateUpdate', {
            dailyCount: strikesToday.count,
            dailyMax: MAX_DAILY_STRIKES,
            strikesLeft: Math.max(0, MAX_DAILY_STRIKES - strikesToday.count),
            hasItem: true
        });

        // B) AŞAMA 2: 10. Saniyede Yıldırım Çarpması (1 Saniye İskelet Şoku)
        setTimeout(() => {
            if (!players[targetSocketId] || players[targetSocketId].room !== callerRoom) {
                if (players[targetSocketId]) {
                    players[targetSocketId].strikeInProgress = false;
                }
                return;
            }

            // Koruma & Doberman Paratoner Kontrolü (Tam çarpma anındaki güncel fedai durumu)
            const guards = (typeof petManager.getBodyguardsByUsername === 'function') ? petManager.getBodyguardsByUsername(targetUsername) : [];
            const companionPet = (typeof petManager.getPetByUsername === 'function') ? petManager.getPetByUsername(targetUsername) : null;
            let sacrificeProtector = null;
            const availableGuards = guards.filter(g => !g.isSacrificing);
            if (availableGuards && availableGuards.length > 0) {
                // Fedai sıralaması: En yüksek slot önce gider (Slot 2 -> Slot 1 -> Slot 0)
                sacrificeProtector = availableGuards.sort((a, b) => (b.slotIndex || 0) - (a.slotIndex || 0))[0];
            } else if (companionPet && companionPet.petType === 'doberman' && !companionPet.isSacrificing) {
                // En son kale Doberman!
                sacrificeProtector = companionPet;
            }

            if (sacrificeProtector) {
                sacrificeProtector.isSacrificing = true;
                // PARATONER SAVUNMASI: Yıldırım fedaiye saplanır! Patron KURTULUR!
                if (players[targetSocketId]) {
                    players[targetSocketId].strikeInProgress = false;
                    players[targetSocketId].strikeIntercepted = true;
                    players[targetSocketId].isElectrocuted = false;
                    players[targetSocketId].isAshed = false;
                }

                const protectorInfo = {
                    id: sacrificeProtector.id,
                    name: sacrificeProtector.name,
                    petType: sacrificeProtector.petType,
                    x: sacrificeProtector.x,
                    y: sacrificeProtector.y
                };

                io.to(callerRoom).emit('zeusLightningImpact', {
                    strikeId,
                    targetId: targetSocketId,
                    targetName: targetUsername,
                    impactTime: Date.now(),
                    interceptorPet: protectorInfo
                });

                io.to(callerRoom).emit('chatUpdate', {
                    id: 'system',
                    name: '⚡ PARATONER SAVUNMASI',
                    room: callerRoom,
                    msg: `⚡💥 PATRON ÇEKİL! ${protectorInfo.name} paratoner gibi öne atılarak Zeus'un ilahi şimşeğini göğüsledi! Patron ${targetDisplayNamePatron} kurtuldu!`,
                    channel: 'room'
                });

                io.to(targetSocketId).emit('systemMessage', `🛡️⚡ İLAHİ KALKAN! ${protectorInfo.name} paratoner gibi öne atılarak Zeus'un yıldırımını üstüne çekti ve seni mutlak kül olmaktan kurtardı!`);

                // 1 Saniye sonra (11. sn): Koruma Kül Olur
                setTimeout(() => {
                    io.to(callerRoom).emit('zeusTargetAshed', {
                        strikeId,
                        targetId: targetSocketId,
                        targetName: targetUsername,
                        interceptorPet: protectorInfo,
                        durationMs: 4000
                    });

                    // 4 Saniye sonra (15. sn): Küller toz gibi savrulur ve fedai görevden ayrılır
                    setTimeout(() => {
                        io.to(callerRoom).emit('zeusProtectorAshScattered', {
                            strikeId,
                            petId: protectorInfo.id,
                            x: protectorInfo.x,
                            y: protectorInfo.y
                        });

                        io.to(callerRoom).emit('chatUpdate', {
                            id: 'system',
                            name: '💨 KÜLLER SAVRULDU',
                            room: callerRoom,
                            msg: `💨 ${protectorInfo.name}'ın külleri rüzgarda toz gibi savrulup yok oldu... Patronu için canını verdi!`,
                            channel: 'room'
                        });

                        petManager.despawnPet(protectorInfo.id, "Zeus yıldırımıyla kül oldu ve toza dönüştü");

                        // Kurbanın çantasından fedaiyi/Dobermanı düş
                        if (targetData) {
                            if (protectorInfo.petType === 'izbandut') {
                                targetData.bodyguardsEquipped = Math.max(0, (targetData.bodyguardsEquipped || 1) - 1);
                                targetData.bodyguardCount = Math.max(0, (targetData.bodyguardCount || 1) - 1);
                                targetData.propInventory = targetData.propInventory || {};
                                if (targetData.bodyguardCount <= 0) {
                                    delete targetData.propInventory['props_izbandut'];
                                } else {
                                    targetData.propInventory['props_izbandut'] = targetData.bodyguardCount;
                                }
                            } else if (protectorInfo.petType === 'doberman') {
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
                            if (targetSock && typeof emitShadyShopStateToSocket === 'function') {
                                emitShadyShopStateToSocket(targetSock, targetData, players[targetSocketId]);
                            }
                        }
                    }, 4000);

                }, SHOCK_DURATION_MS);

                return; // Erken çıkış: Patron asla kül olmaz, diriliş gerekmez!
            }

            // Normal Akış (Koruma Yoksa Doğrudan Patron Çarpılır)
            players[targetSocketId].isElectrocuted = true;
            players[targetSocketId].isMoving = false;
            players[targetSocketId].vx = 0;
            players[targetSocketId].vy = 0;

            io.to(callerRoom).emit('zeusLightningImpact', {
                strikeId,
                targetId: targetSocketId,
                targetName: targetUsername,
                impactTime: Date.now()
            });

        }, GATHERING_DURATION_MS);

        // C) AŞAMA 3: 11. Saniyede Kül Olma (30 Saniye Boyunca Hareketsiz ve Konuşamaz Kül Yığını)
        setTimeout(() => {
            if (players[targetSocketId] && players[targetSocketId].strikeIntercepted) {
                // Paratoner fedai darbeyi göğüsledi; hedef patron asla kül olmaz!
                return;
            }

            if (players[targetSocketId]) {
                players[targetSocketId].isElectrocuted = false;
                players[targetSocketId].isAshed = true;
                players[targetSocketId].isMoving = false;
                players[targetSocketId].vx = 0;
                players[targetSocketId].vy = 0;
            }
            if (targetData) {
                targetData.isAshed = true;
                targetData.ashedUntil = ashedUntil;
                dataManager.savePersistentData(targetUsername);
            }

            io.to(callerRoom).emit('zeusTargetAshed', {
                strikeId,
                targetId: targetSocketId,
                targetName: targetUsername,
                ashedUntil: ashedUntil,
                durationMs: ASH_DURATION_MS
            });

            io.to(callerRoom).emit('chatUpdate', {
                id: 'system',
                name: '💀 ÇARPILDI & KÜL OLDU',
                room: callerRoom,
                msg: `⚡💥 ${targetDisplayNamePatron} ilahi yıldırımla çarpıldı! İskeleti alevler içinde titredi ve bir kül yığınına dönüştü! 30 saniye hareket edemez ve konuşamaz!`,
                channel: 'room'
            });

        }, GATHERING_DURATION_MS + SHOCK_DURATION_MS);

        // D) AŞAMA 4: 41. Saniyede Küllerinden Yeniden Doğuş (Phoenix Rebirth)
        setTimeout(() => {
            if (players[targetSocketId] && players[targetSocketId].strikeIntercepted) {
                delete players[targetSocketId].strikeIntercepted;
                return;
            }

            if (players[targetSocketId]) {
                players[targetSocketId].isElectrocuted = false;
                players[targetSocketId].isAshed = false;
                players[targetSocketId].ashedUntil = 0;
                players[targetSocketId].strikeInProgress = false;
            }
            if (targetData) {
                targetData.isAshed = false;
                targetData.ashedUntil = 0;
                dataManager.savePersistentData(targetUsername);
            }

            io.to(callerRoom).emit('zeusTargetRebirth', {
                strikeId,
                targetId: targetSocketId,
                targetName: targetUsername
            });

            io.to(callerRoom).emit('chatUpdate', {
                id: 'system',
                name: '🔥 KÜLLERİNDEN DOĞUŞ',
                room: callerRoom,
                msg: `✨ Anka kuşu gibi parlayan ${targetDisplayNamePatron}, altın ışıklar saçarak küllerinden yeniden doğdu ve sapasağlam ayağa kalktı!`,
                channel: 'room'
            });

        }, TOTAL_STRIKE_TIME_MS);
    });
}

module.exports = {
    registerZeusHandlers,
    MAX_DAILY_STRIKES,
    GATHERING_DURATION_MS,
    SHOCK_DURATION_MS,
    ASH_DURATION_MS
};

