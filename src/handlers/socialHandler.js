const dataManager = require('../dataManager');
const fatherPetManager = require('../fatherPetManager');
const { checkRateLimit } = require('../utils/securityUtils');
const { calculateLevel, getRequiredTotalXP, getDeltaXP } = require('../utils/levelSystem');
const PROP_NAMES = {
    'baglama': 'Oyma Dut Bağlama',
    'gitar': 'Akustik Gitar',
    'sirtcantasi': 'Gezgin Sırt Çantası',
    'nargile': 'Tüten Nargile',
    'cay': 'İnce Belli Çay',
    'oralet': 'Sıcak Kıraathane Oraleti',
    'kahve': 'Közde Türk Kahvesi',
    'balon': 'Uçan Kırmızı Balon',
    'gazoz': 'Nostaljik Şişe Gazoz',
    'tespih': 'Oltu Taşı Tespih',
    'tespih2': 'Çift Katmanlı Tespih',
    'olta': 'Balıkçı Oltası',
    'asagold': 'Altın Başlıklı Asa',
    'kupa': 'Şampiyonluk Kupası',
    'kilic': 'Orta Çağ Kılıcı',
    'oyuncak_araba': 'Küçük Oyuncak Araba',
    'sigara': 'Tüten Sigara',
    'k2_energy_drink': 'K2 Buzlu Enerji İçeceği',
    'k2_skateboard': 'K2 Grafiti Sokak Kaykayı',
    'zeus_yildirimi': "Zeus'un İlahi Yıldırımı"
};

function getPropDisplayName(propId) {
    if (!propId) return '';
    let cleanId = propId.replace('props_', '');
    if (PROP_NAMES[cleanId]) return PROP_NAMES[cleanId];
    return cleanId.replace(/^k2_/, 'K2 ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function isZombiePlayer(player) {
    if (!player) return false;
    const costumeId = player.costume || (player.outfit && player.outfit.startsWith('costume_') ? player.outfit : null);
    return /^costume_zombie_[1-3]$/.test(costumeId || '');
}

function registerSocialHandlers(io, socket, players, helpers) {
    const { givePlayerTeaWithTimer, playerTeaTimers, getPlayerDetailedLocation } = helpers;

    // 1. SOHBET MESAJI (50 KARAKTER LİMİTİ & SPAM KORUMASI: 1 SN'DE 3 MESAJ -> 3 SN BEKLEME)
    socket.chatTimestamps = [];
    socket.chatCooldownUntil = 0;

    socket.on('chatMessage', (data) => {
        if (!players[socket.id] || !data) return;

        let rawMsg = typeof data === 'string' ? data : (typeof data.msg === 'string' ? data.msg : '');
        let targetChannel = (typeof data === 'object' && data.channel) ? data.channel : 'room';

        rawMsg = (rawMsg || '').trim();
        if (!rawMsg) return;

        // Slash command kısayolları: /all, /g, /genel => Evrensel Genel Chat; /oda, /o, /room => Oda Sohbeti
        if (rawMsg.startsWith('/all ') || rawMsg.startsWith('/g ') || rawMsg.startsWith('/genel ')) {
            targetChannel = 'all';
            rawMsg = rawMsg.replace(/^\/(all|g|genel)\s+/, '').trim();
        } else if (rawMsg.startsWith('/oda ') || rawMsg.startsWith('/o ') || rawMsg.startsWith('/room ')) {
            targetChannel = 'room';
            rawMsg = rawMsg.replace(/^\/(oda|o|room)\s+/, '').trim();
        }

        if (!rawMsg) return;

        let senderName = players[socket.id].name;
        let senderKey = (dataManager.findUserKey ? dataManager.findUserKey(senderName) : null) || senderName;
        let uData = dataManager.persistentData.users[senderKey];

        // Zeus Yıldırımı Kül Olma Susturma Kontrolü (30 sn hareket ve konuşma engeli)
        const ashedExp = (players[socket.id] && players[socket.id].ashedUntil) || 0;
        if (players[socket.id] && (players[socket.id].isAshed || players[socket.id].isElectrocuted) && ashedExp > Date.now()) {
            let remainingSec = Math.ceil((ashedExp - Date.now()) / 1000);
            socket.emit('chatSpamWarning', {
                message: "⚡💀 Zeus'un Yıldırımıyla çarpılıp kül oldun! Küllerinden doğana kadar konuşamazsın (" + remainingSec + " sn).",
                cooldownRemaining: Math.min(remainingSec, 5)
            });
            return;
        }

        // Jammer (Sinyal Kesici) Susturma Kontrolü (3 dakika boyunca konuşamaz)
        const jammerExp = (players[socket.id] && players[socket.id].jammerExpiresAt) || (uData && uData.jammerExpiresAt) || 0;
        if (jammerExp > Date.now()) {
            let remainingSec = Math.ceil((jammerExp - Date.now()) / 1000);
            let remMin = Math.floor(remainingSec / 60);
            let remSec = remainingSec % 60;
            let timeStr = remMin > 0 ? `${remMin} dk ${remSec} sn` : `${remSec} sn`;
            socket.emit('chatSpamWarning', {
                message: `📡❌ Sinyaliniz kesildi! Jammer etkisi altındasınız, konuşamazsınız (${timeStr}).`,
                cooldownRemaining: Math.min(remainingSec, 5)
            });
            return;
        }

        if (uData && uData.muteExpiresAt) {
            if (Date.now() < uData.muteExpiresAt) {
                let remainingSec = Math.ceil((uData.muteExpiresAt - Date.now()) / 1000);
                let remMin = Math.floor(remainingSec / 60);
                let remSec = remainingSec % 60;
                let timeStr = remMin > 0 ? `${remMin} dakika ${remSec} saniye` : `${remSec} saniye`;
                socket.emit('chatSpamWarning', {
                    message: `🔇 Susturuldunuz! Sebep: ${uData.muteReason || 'Yönetici'}. Kalan süre: ${timeStr}`,
                    cooldownRemaining: Math.min(remMin * 60 + remSec, 5)
                });
                return;
            } else {
                uData.muteExpiresAt = null;
                uData.muteReason = null;
                uData.mutedBy = null;
                dataManager.savePersistentData();
                players[socket.id].isMuted = false;
            }
        }

        const now = Date.now();
        if (socket.chatCooldownUntil && now < socket.chatCooldownUntil) {
            let remain = Math.ceil((socket.chatCooldownUntil - now) / 1000);
            socket.emit('chatSpamWarning', { waitSeconds: remain });
            return;
        }

        socket.chatTimestamps = (socket.chatTimestamps || []).filter(t => now - t < 1000);
        if (socket.chatTimestamps.length >= 3) {
            socket.chatCooldownUntil = now + 3000;
            socket.emit('chatSpamWarning', { waitSeconds: 3 });
            socket.emit('systemMessage', "⚠️ Çok hızlı mesaj gönderiyorsunuz! Lütfen 3 saniye bekleyin.");
            return;
        }
        socket.chatTimestamps.push(now);

        let cleanMsg = dataManager.sanitizeString(rawMsg, 50); // Maksimum 50 karakter
        let senderRoom = players[socket.id].room;

        // Fısıltı / Özel Mesaj Desteği: /w <nick> <mesaj>, /pm <nick> <mesaj>, /fisilda <nick> <mesaj>
        let whisperMatch = cleanMsg.match(/^\/(?:w|pm|fisilda|msg)\s+([^\s]+)\s+(.+)$/i);
        if (whisperMatch) {
            let targetNick = whisperMatch[1].trim();
            let privText = whisperMatch[2].trim();
            if (privText) {
                let targetSid = null;
                // 1. @sid veya direkt sid ile fısıldama desteği
                let cleanSid = targetNick.startsWith('@') ? targetNick.slice(1) : targetNick;
                if (players[cleanSid]) {
                    targetSid = cleanSid;
                }
                // 2. '???' veya 'maskeli' yazılmışsa odadaki maskeli oyuncuyu hedef al
                if (!targetSid && (targetNick === '???' || targetNick.toLowerCase() === 'maskeli')) {
                    for (let sid in players) {
                        if (sid !== socket.id && players[sid]?.room === senderRoom) {
                            let pMasked = !!(players[sid].anonMaskExpiresAt && players[sid].anonMaskExpiresAt > Date.now());
                            if (pMasked) {
                                targetSid = sid;
                                break;
                            }
                        }
                    }
                }
                // 3. Normal kullanıcı adı eşleşmesi
                if (!targetSid) {
                    for (let sid in players) {
                        if (players[sid]?.name && players[sid].name.toLowerCase() === targetNick.toLowerCase()) {
                            targetSid = sid;
                            break;
                        }
                    }
                }
                if (targetSid) {
                    let targetRealName = players[targetSid].name;
                    const senderIsAnon = !!((players[socket.id] && players[socket.id].anonMaskExpiresAt && players[socket.id].anonMaskExpiresAt > Date.now()) || (uData && uData.anonMaskExpiresAt && uData.anonMaskExpiresAt > Date.now()));
                    const targetUKey = (dataManager.findUserKey ? dataManager.findUserKey(targetRealName) : null) || targetRealName;
                    const targetUData = dataManager.persistentData.users[targetUKey];
                    const targetIsAnon = !!((players[targetSid] && players[targetSid].anonMaskExpiresAt && players[targetSid].anonMaskExpiresAt > Date.now()) || (targetUData && targetUData.anonMaskExpiresAt && targetUData.anonMaskExpiresAt > Date.now()));

                    const senderDisplayName = senderIsAnon ? "???" : senderName;
                    const targetDisplayNameForSender = targetIsAnon ? "Kimliği belirsiz şahıs" : targetRealName;

                    // Gönderene göster
                    socket.emit('chatUpdate', {
                        id: socket.id,
                        name: `🔒 [Fısıltı -> ${targetDisplayNameForSender}]`,
                        room: senderRoom,
                        msg: privText,
                        channel: 'whisper'
                    });
                    // Alıcıya ilet
                    if (targetSid !== socket.id) {
                        io.to(targetSid).emit('chatUpdate', {
                            id: socket.id,
                            name: `🔒 [${senderDisplayName} fısıldadı]`,
                            room: players[targetSid].room,
                            msg: privText,
                            channel: 'whisper'
                        });
                    }

                    // Odadaki diğer herkes (ve gönderen) için konuşma baloncuğu göstergesi:
                    // Kullanıcı talebi:
                    // "bu arada x kişisi y kişisine fısıldarken diğerleri oyunda y kişisine fısıldıyor olarak görsün konuşma balonlarını.
                    // aynı şekilde maskeli şahısa fısıldarken kimliği belirsiz şahısa fısıldıyor desin o baloncuk normal gözüksün
                    // maskeli x e fısıldarken X'e fısıldıyor yazsın ve o baloncuk aynı az önce de dediğin gibi hafif koyu bi aurada olsun."
                    function getTurkishDativeSuffix(name) {
                        if (!name) return "'e";
                        const vowels = "aeıioöuüAEIİOÖUÜ";
                        const backVowels = "aıouAIOU";
                        let lastVowel = 'e';
                        for (let i = name.length - 1; i >= 0; i--) {
                            if (vowels.includes(name[i])) {
                                lastVowel = name[i];
                                break;
                            }
                        }
                        return backVowels.includes(lastVowel) ? "'a" : "'e";
                    }

                    const bubbleTargetLabel = targetIsAnon ? "kimliği belirsiz şahısa" : `${targetRealName}${getTurkishDativeSuffix(targetRealName)}`;
                    const whisperBubbleText = `🤫 ${bubbleTargetLabel} fısıldıyor...`;

                    io.to(senderRoom).emit('chatWhisperIndicator', {
                        id: socket.id,
                        senderName: senderDisplayName,
                        targetName: targetDisplayNameForSender,
                        bubbleText: whisperBubbleText,
                        isAnon: senderIsAnon
                    });
                    return;
                } else {
                    socket.emit('systemMessage', `⚠️ ${targetNick} adlı oyuncu şu anda oyunda bulunamadı.`);
                    return;
                }
            }
        }

        // 🧔‍♂️ /baba Komutu: TÜM KULLANICILAR İÇİN "Babayı Tuttu" (Baba Yoldaş Çağırma)
        if (cleanMsg.toLowerCase() === '/baba') {
            fatherPetManager.spawnFatherPet(socket.id);
            socket.emit('systemMessage', "✨ Baban yanında belirdi! 'Babayı tuttun!' 🧔‍♂️");
            return;
        }

        // Geliştirici / Test Kısayolu: /testbaba (Yalnızca Admin)
        if (cleanMsg === '/testbaba' && players[socket.id]?.isAdmin) {
            players[socket.id].pendingFatherChoice = true;
            socket.emit('fatherCaughtPrompt', {
                title: "Denizden Baban Çıktı!",
                proverb: "Denizden babam çıksa yerim...",
                description: "Oltana takılan şey bir balık değil... Baban! Ne yapmak istersin?",
                eatReward: 300,
                playerGender: players[socket.id].gender || 'male'
            });
            return;
        }

        players[socket.id].msg = cleanMsg;

        const isAnon = !!((players[socket.id] && players[socket.id].anonMaskExpiresAt && players[socket.id].anonMaskExpiresAt > Date.now()) || (uData && uData.anonMaskExpiresAt && uData.anonMaskExpiresAt > Date.now()));
        const isNeonRed = !!((players[socket.id] && players[socket.id].neonRedNickExpiresAt && players[socket.id].neonRedNickExpiresAt > Date.now()) || (uData && uData.neonRedNickExpiresAt && uData.neonRedNickExpiresAt > Date.now()));
        const chatDisplayName = isAnon ? "???" : senderName;

        if (targetChannel === 'all' || targetChannel === 'global') {
            // TÜM EVRENE (ALL CHAT / GLOBAL) YAYINLA
            io.emit('chatUpdate', {
                id: socket.id,
                name: chatDisplayName,
                room: senderRoom,
                msg: cleanMsg,
                channel: 'all',
                isAnon: isAnon,
                isNeonRed: isNeonRed
            });
        } else {
            // YALNIZCA ODAYA (ROOM CHAT) YAYINLA
            io.to(senderRoom).emit('chatUpdate', {
                id: socket.id,
                name: chatDisplayName,
                room: senderRoom,
                msg: cleanMsg,
                channel: 'room',
                isAnon: isAnon,
                isNeonRed: isNeonRed
            });
        }

        setTimeout(() => {
            if (players[socket.id] && players[socket.id].msg === cleanMsg) {
                players[socket.id].msg = "";
            }
        }, 5000);
    });

    // 1.1 HIZLI EMOJİ BALONCUĞU TEPKİSİ
    socket.on('playerEmoji', (emoji) => {
        if (!players[socket.id] || !emoji) return;
        if (players[socket.id].isAshed || players[socket.id].isElectrocuted) return;
        if (!checkRateLimit(socket, 'playerEmoji', 5, 2000)) return;
        const validEmojis = ['😂', '😡', '❤️', '👋', '🎉', '😎', '☕', '🔥'];
        if (!validEmojis.includes(emoji)) return;
        io.to(players[socket.id].room).emit('playerEmojiUpdate', {
            id: socket.id,
            emoji: emoji
        });
    });

    // 2. SOSYAL EYLEMLER (EL SALLAMA, DANS, ALKIŞ, ÇAY İÇME, OTURMA)
    socket.on('playerAction', (actionData) => {
        if (!players[socket.id]) return;
        if (players[socket.id].isAshed || players[socket.id].isElectrocuted) return;
        if (!checkRateLimit(socket, 'playerAction', 8, 2000)) return;

        if (!actionData || !actionData.action || actionData.action === 'stand') {
            players[socket.id].action = null;
            io.to(players[socket.id].room).emit('playerActionUpdate', {
                id: socket.id,
                action: null,
                hasTea: players[socket.id].hasTea
            });
            return;
        }

        players[socket.id].action = actionData.action;
        if (actionData.action === 'tea') {
            let username = players[socket.id].name;
            let userData = dataManager.persistentData.users[username];
            if (userData) {
                if (userData.money < 10) {
                    socket.emit('gameError', "Çay 10 TL! Yetersiz bakiye.");
                    return;
                }
                userData.money -= 10;
                dataManager.savePersistentData();
                socket.emit('moneyUpdate', userData.money);
            }
            givePlayerTeaWithTimer(socket.id, username, 300000);
            socket.emit('systemMessage', "☕ Çay Ocağı'ndan taze tavşan kanı çay aldın (-10 TL). Afiyet olsun! (5 dakika elinde)");
            return;
        }

        io.to(players[socket.id].room).emit('playerActionUpdate', {
            id: socket.id,
            action: actionData.action,
            hasTea: players[socket.id].hasTea
        });

        // 'tea', 'sitting' ve 'afk' dışındaki eylemler (dans, el sallama, alkış) 3.5 sn sonra normale döner
        if (actionData.action !== 'tea' && actionData.action !== 'sitting' && actionData.action !== 'afk') {
            setTimeout(() => {
                if (players[socket.id] && players[socket.id].action === actionData.action) {
                    players[socket.id].action = null;
                    io.to(players[socket.id].room).emit('playerActionUpdate', { id: socket.id, action: null, hasTea: players[socket.id].hasTea });
                }
            }, 3500);
        }
    });

    socket.on('zombieAttack', () => {
        const attacker = players[socket.id];
        const now = Date.now();
        if (!attacker || !isZombiePlayer(attacker) || attacker.zombieStunnedUntil > now) return;
        if (now - (attacker.lastZombieAttackAt || 0) < 650) return;
        attacker.lastZombieAttackAt = now;
        attacker.zombieAnimation = 'attack';
        attacker.zombieAnimationStartedAt = now;
        attacker.zombieAnimationUntil = now + 700;

        let targetId = null;
        let nearestDistance = 58;
        for (const [candidateId, candidate] of Object.entries(players)) {
            if (candidateId === socket.id || !candidate || candidate.room !== attacker.room || !isZombiePlayer(candidate)) continue;
            if (candidate.zombieStunnedUntil > now) continue;
            const distance = Math.hypot((candidate.x || 0) - (attacker.x || 0), (candidate.y || 0) - (attacker.y || 0));
            if (distance <= nearestDistance) {
                nearestDistance = distance;
                targetId = candidateId;
            }
        }

        if (targetId) {
            const target = players[targetId];
            if (target.zombieStunnedUntil && target.zombieStunnedUntil <= now) target.zombieHits = 0;
            target.zombieHits = (target.zombieHits || 0) + 1;
            target.zombieAnimation = 'hurt';
            target.zombieAnimationStartedAt = now;
            target.zombieAnimationUntil = now + 675;
            if (target.zombieHits >= 5) {
                target.zombieStunnedUntil = now + 15000;
                target.isMoving = false;
                target.isSprinting = false;
                target.vx = 0;
                target.vy = 0;
            }
            io.to(attacker.room).emit('zombieAnimationUpdate', {
                id: targetId,
                animation: target.zombieAnimation,
                animationStartedAt: target.zombieAnimationStartedAt,
                animationUntil: target.zombieAnimationUntil,
                stunnedUntil: target.zombieStunnedUntil || 0,
                hits: target.zombieHits
            });
            if (target.zombieStunnedUntil > now) {
                io.to(attacker.room).emit('playerMoved', {
                    id: targetId,
                    x: target.x,
                    y: target.y,
                    isMoving: false,
                    isSprinting: false,
                    facing: target.facing || 'down'
                });
            }
        }

        io.to(attacker.room).emit('zombieAnimationUpdate', {
            id: socket.id,
            animation: 'attack',
            animationStartedAt: attacker.zombieAnimationStartedAt,
            animationUntil: attacker.zombieAnimationUntil,
            stunnedUntil: attacker.zombieStunnedUntil || 0,
            hits: attacker.zombieHits || 0
        });
    });

    // 3. ÇAY ISMARLAMA
    socket.on('buyTeaForPlayer', (data) => {
        if (!players[socket.id] || !data || !data.targetId) return;
        if (!checkRateLimit(socket, 'buyTea', 3, 2000)) return;
        let sender = players[socket.id];
        let target = players[data.targetId];
        if (!target) return;

        let senderData = dataManager.persistentData.users[sender.name];
        if (!senderData || senderData.money < 10) {
            socket.emit('gameError', "Çay ısmarlamak için en az 10 TL gerekiyor! Bakiyeniz yetersiz.");
            return;
        }

        senderData.money -= 10;
        sender.money = senderData.money;
        dataManager.savePersistentData();

        socket.emit('moneyUpdate', senderData.money);
        givePlayerTeaWithTimer(data.targetId, target.name, 300000);

        io.to(data.targetId).emit('teaGiftReceived', { from: sender.name });
        io.to(data.targetId).emit('systemMessage', `☕ ${sender.name} sana sıcacık tavşan kanı bir çay ısmarladı! (5 dakika elinde).`);
        socket.emit('systemMessage', `☕ ${target.name} oyuncusuna çay ısmarladın (-10 TL).`);
    });

    // 4. PARA TRANSFERİ
    socket.on('sendMoney', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        if (!checkRateLimit(socket, 'sendMoney', 3, 2000)) return;
        let sender = players[socket.id];
        let senderKey = (dataManager.findUserKey ? dataManager.findUserKey(sender.name) : null) || sender.name;
        let senderData = dataManager.persistentData.users[senderKey];
        let targetUser = dataManager.sanitizeString(data.targetUsername, 30);
        let amount = dataManager.sanitizeAmount(data.amount, 1, 100000000);

        if (amount === null) {
            socket.emit('gameError', "Geçerli bir para miktarı giriniz!");
            return;
        }
        if (sender.name.toLowerCase() === targetUser.toLowerCase()) {
            socket.emit('gameError', "Kendinize para gönderemezsiniz!");
            return;
        }
        if (!senderData || senderData.money < amount) {
            socket.emit('gameError', `Yetersiz bakiye! Bakiyeniz: ${senderData?.money || 0} TL.`);
            return;
        }

        let targetKey = dataManager.findUserKey(targetUser);
        if (!targetKey || !dataManager.persistentData.users[targetKey]) {
            socket.emit('gameError', "Böyle bir oyuncu bulunamadı!");
            return;
        }

        senderData.money -= amount;
        sender.money = senderData.money;
        dataManager.persistentData.users[targetKey].money = (dataManager.persistentData.users[targetKey].money || 0) + amount;
        dataManager.savePersistentData();

        socket.emit('moneyUpdate', senderData.money);
        socket.emit('systemMessage', `💸 ${targetKey} kullanıcısına ${amount} TL gönderdin.`);

        for (let sid in players) {
            if (players[sid]?.name && players[sid].name.toLowerCase() === targetKey.toLowerCase()) {
                players[sid].money = dataManager.persistentData.users[targetKey].money;
                io.to(sid).emit('moneyUpdate', players[sid].money);
                io.to(sid).emit('moneyGiftReceived', { from: sender.name, amount: amount });
                io.to(sid).emit('systemMessage', `💸 ${sender.name} sana ${amount} TL gönderdi! (Yeni Bakiyen: ${players[sid].money} TL)`);
            }
        }
    });

    // 5. EŞYA KUŞANMA (EQUIP PROP)
    socket.on('equipPropItem', (data) => {
        if (!players[socket.id] || !data) return;
        let itemKey = data.itemKey || data.propId || data.propKey || '';
        if (!itemKey) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;
        let propId = itemKey.replace('props_', '');

        if (propId === 'izbandut' || propId === 'pet_izbandut') {
            socket.emit('gameError', 'İzbandut koruma el aksesuarı değildir, çantanızdan veya Tekin\'den çağırabilirsiniz!');
            return;
        }
        if (propId === 'doberman' || propId === 'pet_doberman') {
            socket.emit('gameError', 'Doberman el aksesuarı değildir, çantanızdan veya Tekin\'den çağırabilirsiniz!');
            return;
        }
        if (propId === 'anon_mask') {
            socket.emit('gameError', 'Maskeyi takıp çıkarmak için çantadaki maske ikonuna tıklayın!');
            return;
        }

        if (itemKey === 'props_none' || propId === 'none') {
            userData.avatar.heldItem = 'none';
            players[socket.id].heldItem = 'none';
            if (players[socket.id].hasTea) players[socket.id].hasTea = false;
            if (playerTeaTimers && playerTeaTimers[socket.id]) {
                clearTimeout(playerTeaTimers[socket.id]);
                delete playerTeaTimers[socket.id];
            }
            userData.teaExpiresAt = null;
            socket.emit('systemMessage', "✋ Elindeki eşyayı bıraktın.");
        } else {
            // Eğer oyuncu zaten bu eşyayı elinde tutuyorsa, doğrudan elden bırakılır
            if (userData.avatar.heldItem === propId) {
                userData.avatar.heldItem = 'none';
                players[socket.id].heldItem = 'none';
                if (players[socket.id].hasTea) players[socket.id].hasTea = false;
                if (playerTeaTimers && playerTeaTimers[socket.id]) {
                    clearTimeout(playerTeaTimers[socket.id]);
                    delete playerTeaTimers[socket.id];
                }
                userData.teaExpiresAt = null;
                socket.emit('systemMessage', `✋ ${getPropDisplayName(propId)} eşyasını çantana kaldırdın.`);
            } else {
                if (!userData.propInventory || !userData.propInventory[itemKey] || userData.propInventory[itemKey] <= 0) {
                    socket.emit('gameError', "Bu eşyaya çantanızda sahip değilsiniz!");
                    return;
                }
                if (propId === 'cay') {
                    givePlayerTeaWithTimer(socket.id, username, 300000);
                    socket.emit('systemMessage', "☕ Çayını eline aldın! (5 dakika süreli)");
                    return;
                }
                userData.avatar.heldItem = propId;
                players[socket.id].heldItem = propId;
                socket.emit('systemMessage', `🖐️ ${getPropDisplayName(propId)} eşyasını eline aldın.`);
            }
        }
        dataManager.savePersistentData();
        socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });
        socket.emit('propInventoryUpdate', userData.propInventory || {});
        io.to(players[socket.id].room).emit('playerAvatarChange', {
            id: socket.id,
            avatar: userData.avatar,
            heldItem: players[socket.id].heldItem
        });
    });

    // 6. EŞYA HEDİYE ETME (GIFT PROP)
    socket.on('giftPropItem', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername || !data.itemKey) return;
        if (!checkRateLimit(socket, 'giftProp', 3, 2000)) return;
        let sender = players[socket.id];
        let senderData = dataManager.persistentData.users[sender.name];
        let targetUser = dataManager.sanitizeString(data.targetUsername, 30);
        let itemKey = data.itemKey;
        let propId = itemKey.replace('props_', '');
        let propDisplayName = getPropDisplayName(propId);

        if (!itemKey.startsWith('props_') || itemKey === 'props_none') {
            socket.emit('gameError', "Sadece elde taşınabilen aksesuarlar hediye edilebilir!");
            return;
        }

        const NON_GIFTABLE_ITEMS = [
            'props_pet_izbandut', 'props_izbandut', 'izbandut',
            'props_pet_doberman', 'props_doberman', 'doberman',
            'props_jammer', 'jammer',
            'props_mug_knife', 'props_gasp_bicagi', 'mug_knife',
            'props_zeus_yildirimi', 'zeus_yildirimi',
            'props_anon_mask', 'anon_mask'
        ];
        if (NON_GIFTABLE_ITEMS.includes(itemKey) || NON_GIFTABLE_ITEMS.includes(propId)) {
            socket.emit('gameError', "Özel VIP ve Karaborsa eşyaları (Koruma, Doberman, Jammer, Bıçak, Yıldırım, Maske) hediye edilemez!");
            return;
        }
        if (!senderData.propInventory || !senderData.propInventory[itemKey] || senderData.propInventory[itemKey] <= 0) {
            socket.emit('gameError', "Bu eşyaya çantanızda sahip değilsiniz!");
            return;
        }
        let targetKey = dataManager.findUserKey(targetUser);
        if (!targetKey || !dataManager.persistentData.users[targetKey]) {
            socket.emit('gameError', "Kullanıcı bulunamadı!");
            return;
        }

        senderData.propInventory[itemKey] -= 1;
        let remaining = senderData.propInventory[itemKey];
        if (remaining <= 0) {
            delete senderData.propInventory[itemKey];
            senderData.inventory = senderData.inventory.filter(k => k !== itemKey);
            if (senderData.avatar.heldItem === propId) {
                senderData.avatar.heldItem = 'none';
                sender.heldItem = 'none';
            }
        }

        let targetData = dataManager.persistentData.users[targetKey];
        if (!targetData.propInventory) targetData.propInventory = {};
        targetData.propInventory[itemKey] = (targetData.propInventory[itemKey] || 0) + 1;
        if (!targetData.inventory) targetData.inventory = [];
        if (!targetData.inventory.includes(itemKey)) targetData.inventory.push(itemKey);

        dataManager.savePersistentData();

        socket.emit('propInventoryUpdate', senderData.propInventory);
        socket.emit('wardrobeUpdate', { avatar: senderData.avatar, inventory: senderData.inventory });
        io.to(sender.room).emit('playerAvatarChange', { id: socket.id, avatar: senderData.avatar, heldItem: sender.heldItem });
        socket.emit('systemMessage', `🎁 ${targetKey} oyuncusuna 1 adet ${propDisplayName} hediye ettiniz!`);

        for (let sid in players) {
            if (players[sid]?.name && players[sid].name.toLowerCase() === targetKey.toLowerCase()) {
                io.to(sid).emit('propInventoryUpdate', targetData.propInventory);
                io.to(sid).emit('wardrobeUpdate', { avatar: targetData.avatar, inventory: targetData.inventory });
                io.to(sid).emit('propGiftReceived', { from: sender.name, itemKey: itemKey });
                io.to(sid).emit('systemMessage', `🎁 ${sender.name} sana 1 adet ${propDisplayName} hediye etti!`);
            }
        }
    });

    // 7. ARKADAŞLIK İSTEĞİ GÖNDERME
    socket.on('sendFriendRequest', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        if (!checkRateLimit(socket, 'friendReq', 4, 3000)) return;
        let sender = players[socket.id];
        let senderKey = dataManager.findUserKey(sender.name) || sender.name;
        let senderData = dataManager.persistentData.users[senderKey];
        let targetUser = (data.targetUsername || "").trim();

        if (senderKey.toLowerCase() === targetUser.toLowerCase()) {
            socket.emit('gameError', "Kendinizi arkadaş olarak ekleyemezsiniz!");
            return;
        }

        let targetKey = dataManager.findUserKey(targetUser);
        if (!targetKey) {
            socket.emit('gameError', "Böyle bir kullanıcı bulunamadı!");
            return;
        }
        let targetData = dataManager.persistentData.users[targetKey];

        if (!senderData.friends) senderData.friends = [];
        if (senderData.friends.some(f => f.toLowerCase() === targetKey.toLowerCase())) {
            socket.emit('gameError', `${targetKey} zaten arkadaş listenizde!`);
            return;
        }

        if (!targetData.friendRequests) targetData.friendRequests = [];
        if (targetData.friendRequests.some(r => r.toLowerCase() === senderKey.toLowerCase())) {
            socket.emit('gameError', `${targetKey} kullanıcısına zaten bekleyen bir arkadaşlık isteğiniz var!`);
            return;
        }

        if (senderData.friendRequests && senderData.friendRequests.some(r => r.toLowerCase() === targetKey.toLowerCase())) {
            senderData.friendRequests = senderData.friendRequests.filter(r => r.toLowerCase() !== targetKey.toLowerCase());
            targetData.friendRequests = targetData.friendRequests.filter(r => r.toLowerCase() !== senderKey.toLowerCase());

            if (!senderData.friends) senderData.friends = [];
            if (!targetData.friends) targetData.friends = [];
            if (!senderData.friends.some(f => f.toLowerCase() === targetKey.toLowerCase())) senderData.friends.push(targetKey);
            if (!targetData.friends.some(f => f.toLowerCase() === senderKey.toLowerCase())) targetData.friends.push(senderKey);

            dataManager.savePersistentData();

            socket.emit('systemMessage', `👥 ${targetKey} ile karşılıklı istek gönderdiğiniz için otomatik arkadaş oldunuz!`);
            socket.emit('friendListUpdate', dataManager.getFriendListData(senderKey, players));
            socket.emit('friendRequestsUpdate', senderData.friendRequests || []);

            for (let sid in players) {
                if (players[sid]?.name && players[sid].name.toLowerCase() === targetKey.toLowerCase()) {
                    io.to(sid).emit('systemMessage', `👥 ${senderKey} arkadaşlık teklifinizi onayladı! Artık arkadaşsınız.`);
                    io.to(sid).emit('friendListUpdate', dataManager.getFriendListData(targetKey, players));
                    io.to(sid).emit('friendRequestsUpdate', targetData.friendRequests || []);
                }
            }
            return;
        }

        targetData.friendRequests.push(senderKey);
        dataManager.savePersistentData();

        socket.emit('systemMessage', `👥 ${targetKey} oyuncusuna arkadaşlık isteği gönderildi.`);

        for (let sid in players) {
            if (players[sid]?.name && players[sid].name.toLowerCase() === targetKey.toLowerCase()) {
                io.to(sid).emit('friendRequestsUpdate', targetData.friendRequests);
                io.to(sid).emit('friendRequestReceived', { fromUsername: senderKey });
                io.to(sid).emit('systemMessage', `👥 ${senderKey} sana arkadaşlık isteği gönderdi!`);
            }
        }
    });

    // 8. ARKADAŞLIK İSTEĞİNE YANIT VERME
    socket.on('respondFriendRequest', (data) => {
        if (!players[socket.id] || !data || !data.fromUsername) return;
        let responder = players[socket.id];
        let responderKey = dataManager.findUserKey(responder.name) || responder.name;
        let responderData = dataManager.persistentData.users[responderKey];
        let fromUser = (data.fromUsername || "").trim();

        let fromKey = dataManager.findUserKey(fromUser);
        if (!fromKey) return;
        let fromData = dataManager.persistentData.users[fromKey];

        if (responderData.friendRequests) {
            responderData.friendRequests = responderData.friendRequests.filter(u => u.toLowerCase() !== fromKey.toLowerCase());
        }
        if (fromData.friendRequests) {
            fromData.friendRequests = fromData.friendRequests.filter(u => u.toLowerCase() !== responderKey.toLowerCase());
        }

        if (data.accept) {
            if (!responderData.friends) responderData.friends = [];
            if (!fromData.friends) fromData.friends = [];

            if (!responderData.friends.some(f => f.toLowerCase() === fromKey.toLowerCase())) responderData.friends.push(fromKey);
            if (!fromData.friends.some(f => f.toLowerCase() === responderKey.toLowerCase())) fromData.friends.push(responderKey);

            dataManager.savePersistentData();

            socket.emit('systemMessage', `👥 ${fromKey} ile artık arkadaşsınız!`);
            socket.emit('friendListUpdate', dataManager.getFriendListData(responderKey, players));
            socket.emit('friendRequestsUpdate', responderData.friendRequests || []);

            for (let sid in players) {
                if (players[sid]?.name && players[sid].name.toLowerCase() === fromKey.toLowerCase()) {
                    io.to(sid).emit('systemMessage', `👥 ${responderKey} arkadaşlık isteğini kabul etti! Artık arkadaşsınız.`);
                    io.to(sid).emit('friendListUpdate', dataManager.getFriendListData(fromKey, players));
                    io.to(sid).emit('friendRequestsUpdate', fromData.friendRequests || []);
                }
            }
        } else {
            dataManager.savePersistentData();
            socket.emit('friendRequestsUpdate', responderData.friendRequests || []);
            socket.emit('systemMessage', `ℹ️ ${fromKey} kullanıcısının arkadaşlık isteğini sildiniz.`);
        }
    });

    // 9. ARKADAŞ SİLME
    socket.on('removeFriend', (data) => {
        if (!players[socket.id] || !data || !data.username) return;
        let username = players[socket.id].name;
        let userKey = dataManager.findUserKey(username) || username;
        let targetKey = dataManager.findUserKey((data.username || "").trim());
        if (!targetKey) return;

        let uData = dataManager.persistentData.users[userKey];
        let tData = dataManager.persistentData.users[targetKey];

        if (uData && uData.friends) {
            uData.friends = uData.friends.filter(f => f.toLowerCase() !== targetKey.toLowerCase());
        }
        if (tData && tData.friends) {
            tData.friends = tData.friends.filter(f => f.toLowerCase() !== userKey.toLowerCase());
        }
        dataManager.savePersistentData();

        socket.emit('friendListUpdate', dataManager.getFriendListData(userKey, players));
        socket.emit('systemMessage', `👥 ${targetKey} arkadaş listenizden çıkarıldı.`);

        for (let sid in players) {
            if (players[sid]?.name && players[sid].name.toLowerCase() === targetKey.toLowerCase()) {
                io.to(sid).emit('friendListUpdate', dataManager.getFriendListData(targetKey, players));
                io.to(sid).emit('systemMessage', `ℹ️ ${userKey} seni arkadaş listesinden çıkardı.`);
            }
        }
    });

    // 10. ARKADAŞ LİSTESİ SORGULAMA
    socket.on('getFriendsList', () => {
        if (!players[socket.id]) return;
        let username = players[socket.id].name;
        let uKey = dataManager.findUserKey(username) || username;
        let uData = dataManager.persistentData.users[uKey];
        socket.emit('friendListUpdate', dataManager.getFriendListData(uKey, players));
        socket.emit('friendRequestsUpdate', uData?.friendRequests || []);
    });

    // 11. ÇEVRİMİÇİ OYUNCULARI LİSTELEME
    socket.on('getOnlinePlayers', () => {
        if (!players[socket.id]) return;

        let requester = players[socket.id];
        let requesterName = requester.name;
        let requesterKey = (dataManager.findUserKey ? dataManager.findUserKey(requesterName) : null) || requesterName;
        let requesterData = dataManager.persistentData.users[requesterKey] || {};
        let requesterFriends = Array.isArray(requesterData.friends) 
            ? requesterData.friends.map(f => (typeof f === 'string' ? f : (f.name || f.username || '')).toLowerCase()) 
            : [];

        let list = [];
        for (let sid in players) {
            let p = players[sid];
            if (!p || !p.name) continue;
            // Botları çevrimiçi oyuncu listesinden tamamen hariç tut
            if (sid.startsWith('bot_') || p.isBot || p.name.startsWith('🤖')) continue;

            let pKey = (dataManager.findUserKey ? dataManager.findUserKey(p.name) : null) || p.name;
            let uData = dataManager.persistentData.users[pKey] || {};
            let rawLoc = (typeof getPlayerDetailedLocation === 'function') 
                ? getPlayerDetailedLocation(sid, p) 
                : (p.room || 'sokak');

            let friendlyLoc = (rawLoc || '').replace(/\s*\(X:\s*-?\d+,\s*Y:\s*-?\d+\)/gi, '').trim();

            let isSelf = (sid === socket.id);
            let isFriend = requesterFriends.includes(p.name.toLowerCase());
            const isMasked = !!((p.anonMaskExpiresAt && p.anonMaskExpiresAt > Date.now()) || (uData.anonMaskExpiresAt && uData.anonMaskExpiresAt > Date.now()));

            if (isMasked && !isSelf) {
                // Gizli Kimlik Maskesi: Diğer oyuncuların listesinde ad '???', unvan ve lokasyon gizli
                list.push({
                    id: sid,
                    username: '???',
                    isAnon: true,
                    gender: p.gender || uData.gender || 'male',
                    room: p.room || 'sokak',
                    location: '🎭 Gizli Lokasyon',
                    isAdmin: false,
                    isMod: false,
                    role: 'anon',
                    isVip: false,
                    isFishing: false,
                    hasTea: false,
                    isSelf: false,
                    isFriend: false,
                    money: 0,
                    house: null
                });
            } else {
                list.push({
                    id: sid,
                    username: p.name,
                    isAnon: isMasked,
                    gender: p.gender || uData.gender || 'male',
                    room: p.room || 'sokak',
                    location: friendlyLoc || '🌳 Meydan',
                    isAdmin: !!(p.isAdmin || (p.name && p.name.toLowerCase() === 'elyesa')),
                    isMod: !p.isAdmin && p.name && p.name.toLowerCase() !== 'elyesa' && (p.isMod || p.role === 'mod' || p.role === 'moderator'),
                    role: p.role || ((p.isAdmin || (p.name && p.name.toLowerCase() === 'elyesa')) ? 'admin' : (p.isMod ? 'mod' : 'user')),
                    isVip: !!(uData.isVip || (p.money && p.money >= 50000)),
                    isFishing: !!p.isFishing,
                    hasTea: !!p.hasTea,
                    isSelf: isSelf,
                    isFriend: isFriend,
                    money: p.money || 0,
                    house: uData.house || (uData.houses ? Object.values(uData.houses)[0] : null)
                });
            }
        }

        list.sort((a, b) => {
            if (a.isSelf) return -1;
            if (b.isSelf) return 1;
            if (a.isFriend && !b.isFriend) return -1;
            if (!a.isFriend && b.isFriend) return 1;
            return a.username.localeCompare(b.username, 'tr');
        });

        socket.emit('onlinePlayersListUpdate', {
            total: list.length,
            players: list
        });
    });

    // 12. OYUNCU PROFİL DETAYLARI SORGULAMA (BEĞENİ, ROZET & İSTATİSTİKLER)
    socket.on('getProfileDetails', (data) => {
        if (!players[socket.id] || !data) return;
        let targetName = (data.targetName || "").trim();
        let targetSid = data.targetId || null;

        // Hedef soket veya isim üzerinden hedef oyuncuyu çözümle
        let targetSocketPlayer = null;
        if (targetSid && players[targetSid]) {
            targetSocketPlayer = players[targetSid];
            if (!targetName || targetName === '???') {
                targetName = targetSocketPlayer.name;
            }
        } else if (targetName && targetName !== '???') {
            for (let sid in players) {
                if (players[sid]?.name && players[sid].name.toLowerCase() === targetName.toLowerCase()) {
                    targetSocketPlayer = players[sid];
                    targetSid = sid;
                    break;
                }
            }
        }

        const tKey = (dataManager.findUserKey ? dataManager.findUserKey(targetName) : null) || targetName;
        const tData = dataManager.persistentData.users[tKey];
        if (!tData && !targetSocketPlayer) return;

        const callerName = players[socket.id].name;
        const callerKey = (dataManager.findUserKey ? dataManager.findUserKey(callerName) : null) || callerName;
        const isSelf = (callerKey.toLowerCase() === (tKey ? tKey.toLowerCase() : ''));

        // Hayalet Profil Modu: Hedef oyuncu maskeliyse ve bakan kişi kendisi değilse, tüm kimlik ve istatistikleri gizle
        const isTargetMasked = !!((targetSocketPlayer && targetSocketPlayer.anonMaskExpiresAt && targetSocketPlayer.anonMaskExpiresAt > Date.now()) || (tData && tData.anonMaskExpiresAt && tData.anonMaskExpiresAt > Date.now()));

        if (isTargetMasked && !isSelf) {
            socket.emit('profileDetailsResult', {
                targetName: '???',
                targetId: targetSid,
                isSelf: false,
                isAnon: true,
                level: '🔒 Gizli',
                totalXP: 0,
                currentProgress: 0,
                targetXP: 0,
                likes: 0,
                dislikes: 0,
                userRating: null,
                motto: '🎭 Kimliği gizlenmiş gizemli yabancı...',
                mood: 'none',
                badgeUnlockOrder: [],
                badgeLevels: {},
                gameStats: null,
                mugCooldownRemMs: 0
            });
            return;
        }

        const userRating = (tData && tData.ratings && tData.ratings[callerKey.toLowerCase()]) || null;

        const createdTime = (tData && tData.createdAt) || (Date.now() - 24 * 60 * 60 * 1000);
        const seniorityDays = Math.max(1, Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24)));

        // 1. Ortak Oyuncu Rozeti (Gamer) havuzunu hesapla veya birleştir
        let gamerGames = Number(tData && tData.gamerGamesCount);
        if (isNaN(gamerGames)) {
            gamerGames = (Number(tData?.batakGamesCount) || 0) +
                         (Number(tData?.okeyGamesCount) || 0) +
                         (Number(tData?.tavlaGamesCount) || 0) +
                         (Number(tData?.billiardGamesCount) || 0) +
                         (Number(tData?.chessGamesCount) || 0) +
                         (Number(tData?.amiralBattiGamesCount) || 0) +
                         (Number(tData?.xoxGamesCount) || 0) +
                         (Number(tData?.dostKazigiGamesCount) || 0);
            if (tData) tData.gamerGamesCount = gamerGames;
        }

        // Kilit açma sırasını derle (eski masa oyunu anahtarlarını 'gamer' altında tekilleştir)
        const legacyBoardKeys = ['gamer', 'batak', 'okey', 'okey101', 'tavla', 'billiard', 'chess', 'amiral', 'amiralbatti', 'xox', 'dostkazigi'];
        let unlockOrder = [];
        let gamerAdded = false;

        const rawUnlockOrder = Array.isArray(tData.badgeUnlockOrder) ? tData.badgeUnlockOrder : [];
        rawUnlockOrder.forEach(k => {
            let normalizedK = k;
            if (k === 'fish') normalizedK = 'fishing';
            if (legacyBoardKeys.includes(k) || k === 'gamer') {
                if (!gamerAdded) {
                    unlockOrder.push('gamer');
                    gamerAdded = true;
                }
            } else {
                if (!unlockOrder.includes(normalizedK)) {
                    unlockOrder.push(normalizedK);
                }
            }
        });

        if (!unlockOrder.includes('resident')) {
            unlockOrder.unshift('resident');
        }
        if (gamerGames > 0 && !unlockOrder.includes('gamer')) {
            unlockOrder.push('gamer');
        }

        const statChecks = [
            { k: 'fishing', val: tData.fishCaughtCount },
            { k: 'standup', val: tData.standupCount },
            { k: 'ganyan', val: tData.ganyanBetsCount },
            { k: 'mining', val: (tData.minedRocksCount !== undefined ? tData.minedRocksCount : (tData.minedCount || tData.mining || 0)) },
            { k: 'botanic', val: (tData.botanicHarvestCount !== undefined ? tData.botanicHarvestCount : (tData.botanicHarvestPoints || 0)) }
        ];
        statChecks.forEach(s => {
            if (s.val && s.val > 0 && !unlockOrder.includes(s.k)) {
                unlockOrder.push(s.k);
            }
        });
        tData.badgeUnlockOrder = unlockOrder;

        // 3. Yeni Seviye ve Barem Cetveli (Oyunbaz Rozeti)
        // 1-9: Lv1, 10-24: Lv2, 25-49: Lv3, 50-99: Lv4, 100-199: Lv5,
        // 200-349: Lv6, 350-599: Lv7, 600-999: Lv8, 1000-1499: Lv9, 1500+: Lv10 (Max Tier)
        function getUniversalTier(cnt) {
            cnt = Number(cnt) || 0;
            if (cnt <= 0) return 0;
            if (typeof dataManager !== 'undefined' && dataManager.calculateBadgeTier) {
                return dataManager.calculateBadgeTier(cnt, false, 'gamer');
            }
            if (cnt < 10) return 1;
            if (cnt < 25) return 2;
            if (cnt < 50) return 3;
            if (cnt < 100) return 4;
            if (cnt < 200) return 5;
            if (cnt < 350) return 6;
            if (cnt < 600) return 7;
            if (cnt < 1000) return 8;
            if (cnt < 1500) return 9;
            return 10;
        }

        function getSeniorityTier(days) {
            days = Number(days) || 0;
            if (days <= 0) return 0;
            if (days <= 3) return 1;
            if (days <= 7) return 2;
            if (days <= 14) return 3;
            if (days <= 30) return 4;
            if (days <= 60) return 5;
            if (days <= 90) return 6;
            if (days <= 180) return 7;
            if (days <= 270) return 8;
            if (days <= 365) return 9;
            return 10;
        }

        const resolvedLevel = Math.max(1, (tData.level !== undefined && tData.level !== null) ? Number(tData.level) : (calculateLevel ? calculateLevel(tData.totalXP || 0) : 1));
        const totalXP = Number(tData.totalXP) || 0;
        const curBaseXP = (typeof getRequiredTotalXP === 'function') ? getRequiredTotalXP(resolvedLevel) : 0;
        const targetXP = (resolvedLevel < 100) ? ((typeof getDeltaXP === 'function') ? getDeltaXP(resolvedLevel + 1) : 20) : 0;
        const currentProgress = Math.max(0, totalXP - curBaseXP);

        const badgeLevels = {
            gamer: getUniversalTier(gamerGames),
            fish: getUniversalTier(tData.fishCaughtCount),
            fishing: getUniversalTier(tData.fishCaughtCount),
            standup: getUniversalTier(tData.standupCount),
            ganyan: getUniversalTier(tData.ganyanBetsCount),
            mining: getUniversalTier(tData.minedRocksCount !== undefined ? tData.minedRocksCount : (tData.minedCount || tData.mining || 0)),
            botanic: getUniversalTier(tData.botanicHarvestCount !== undefined ? tData.botanicHarvestCount : (tData.botanicHarvestPoints || 0)),
            resident: resolvedLevel,
            level: resolvedLevel,
            // Geriye dönük uyumluluk takma adları
            batak: getUniversalTier(gamerGames),
            okey: getUniversalTier(gamerGames),
            tavla: getUniversalTier(gamerGames),
            billiard: getUniversalTier(gamerGames),
            chess: getUniversalTier(gamerGames),
            amiral: getUniversalTier(gamerGames),
            xox: getUniversalTier(gamerGames)
        };

        // Kendi profilimiz ise ham sayılar (gameStats) gönderilir, başka oyuncu ise ham sayılar gizlenir (null)
        const userStatsForSelf = isSelf ? {
            gamerGamesCount: gamerGames,
            fishCaughtCount: Number(tData.fishCaughtCount || 0),
            standupCount: Number(tData.standupCount || 0),
            ganyanBetsCount: Number(tData.ganyanBetsCount || 0),
            minedRocksCount: Number(tData.minedRocksCount !== undefined ? tData.minedRocksCount : (tData.minedCount || 0)),
            minedCount: Number(tData.minedCount || tData.mining || 0),
            botanicHarvestCount: Number(tData.botanicHarvestCount !== undefined ? tData.botanicHarvestCount : (tData.botanicHarvestPoints || 0)),
            botanicHarvestPoints: Number(tData.botanicHarvestPoints || 0),
            seniorityDays: seniorityDays,
            level: resolvedLevel,
            totalXP: totalXP,
            currentProgress: currentProgress,
            targetXP: targetXP
        } : null;

        // Hedef oyuncuya son 24 saat içinde gasp yapılmış mı kontrol et (Madde 3 Soğuma Sayacı)
        let mugCooldownRemMs = 0;
        const callerData = dataManager.persistentData.users[callerKey];
        if (callerData && callerData.muggedTargets) {
            const lastMug = callerData.muggedTargets[targetName.toLowerCase()] || 0;
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;
            const diff = Date.now() - lastMug;
            if (diff < ONE_DAY_MS) {
                mugCooldownRemMs = ONE_DAY_MS - diff;
            }
        }

        socket.emit('profileDetailsResult', {
            targetName: targetName,
            isSelf: isSelf,
            level: resolvedLevel,
            totalXP: totalXP,
            currentProgress: currentProgress,
            targetXP: targetXP,
            likes: tData.likes || 0,
            dislikes: tData.dislikes || 0,
            userRating: userRating,
            motto: tData.motto || tData.statusMessage || "",
            mood: tData.mood || 'none',
            badgeUnlockOrder: unlockOrder,
            badgeLevels: badgeLevels,
            gameStats: userStatsForSelf,
            mugCooldownRemMs: mugCooldownRemMs
        });
    });

    // 12.1 OYUNCU DURUM SÖZÜ (MOTTO / BİYOGRAFİ) GÜNCELLEME
    socket.on('updatePlayerMotto', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'updatePlayerMotto', 6, 3000)) return;

        const callerName = players[socket.id].name;
        const callerKey = (dataManager.findUserKey ? dataManager.findUserKey(callerName) : null) || callerName;
        const uData = dataManager.persistentData.users[callerKey];
        if (!uData) return;

        let motto = (typeof data.motto === 'string') ? data.motto.trim().slice(0, 120) : "";
        if (dataManager.sanitizeString) {
            motto = dataManager.sanitizeString(motto);
        }
        uData.motto = motto;
        uData.statusMessage = motto;

        if (players[socket.id]) {
            players[socket.id].motto = motto;
            players[socket.id].statusMessage = motto;
        }

        dataManager.savePersistentData();

        socket.emit('playerMottoUpdated', { username: callerName, motto: motto });
        io.emit('playerMottoChanged', { username: callerName, motto: motto });
    });

    // 12.2 OYUNCU RUH HALİ (MOOD) GÜNCELLEME (10 Farklı Ruh Hali Modu = 5 Çift)
    socket.on('updatePlayerMood', (data) => {
        if (!players[socket.id] || !data || !data.mood) return;
        if (!checkRateLimit(socket, 'updatePlayerMood', 8, 2000)) return;

        const callerName = players[socket.id].name;
        const callerKey = (dataManager.findUserKey ? dataManager.findUserKey(callerName) : null) || callerName;
        const uData = dataManager.persistentData.users[callerKey];
        if (!uData) return;

        const validMoods = ['happy', 'chill', 'excited', 'party', 'love', 'tense', 'sad', 'sleepy', 'tired', 'none'];
        const mood = validMoods.includes(data.mood) ? data.mood : 'none';

        uData.mood = mood;
        if (players[socket.id]) {
            players[socket.id].mood = mood;
        }

        dataManager.savePersistentData();

        socket.emit('playerMoodUpdated', { username: callerName, mood: mood });
        io.emit('playerMoodChanged', { username: callerName, mood: mood });
    });

    // 13. OYUNCUYA BEĞENİ VEYA BEĞENMEME VERME (ratePlayer)
    socket.on('ratePlayer', async (data) => {
        if (!players[socket.id] || !data || !data.targetName || !data.action) return;
        if (!checkRateLimit(socket, 'ratePlayer', 5, 2000)) return;

        const callerName = players[socket.id].name;
        const callerKey = (dataManager.findUserKey ? dataManager.findUserKey(callerName) : null) || callerName;
        const targetName = (data.targetName || "").trim();
        const tKey = (dataManager.findUserKey ? dataManager.findUserKey(targetName) : null) || targetName;

        // Kendi kendini oylama engeli
        if (callerKey.toLowerCase() === tKey.toLowerCase()) {
            socket.emit('gameError', "Kendinizi oylayamazsınız!");
            return;
        }

        const tData = dataManager.persistentData.users[tKey];
        if (!tData) return;

        if (!tData.ratings) tData.ratings = {};
        if (typeof tData.likes !== 'number') tData.likes = 0;
        if (typeof tData.dislikes !== 'number') tData.dislikes = 0;

        const currentRate = tData.ratings[callerKey.toLowerCase()] || null;
        const action = data.action; // 'like' or 'dislike'

        if (currentRate === action) {
            // Aynı butona tekrar basarsa oyu geri çeker
            if (action === 'like') tData.likes = Math.max(0, tData.likes - 1);
            if (action === 'dislike') tData.dislikes = Math.max(0, tData.dislikes - 1);
            delete tData.ratings[callerKey.toLowerCase()];
        } else if (currentRate && currentRate !== action) {
            // Zıt oya geçerse (örn: dislike iken like yaparsa)
            if (currentRate === 'like') tData.likes = Math.max(0, tData.likes - 1);
            if (currentRate === 'dislike') tData.dislikes = Math.max(0, tData.dislikes - 1);
            if (action === 'like') tData.likes += 1;
            if (action === 'dislike') tData.dislikes += 1;
            tData.ratings[callerKey.toLowerCase()] = action;
        } else {
            // İlk kez oy veriyorsa
            if (action === 'like') tData.likes += 1;
            if (action === 'dislike') tData.dislikes += 1;
            tData.ratings[callerKey.toLowerCase()] = action;
        }

        await dataManager.saveUserData(tKey, {
            likes: tData.likes,
            dislikes: tData.dislikes,
            ratings: tData.ratings
        });

        const newRating = tData.ratings[callerKey.toLowerCase()] || null;
        socket.emit('playerRatingResult', {
            targetName: targetName,
            likes: tData.likes,
            dislikes: tData.dislikes,
            userRating: newRating
        });

        // Tüm odaya güncel beğeni sayısını yayınla
        io.emit('playerRatingUpdated', {
            targetName: targetName,
            likes: tData.likes,
            dislikes: tData.dislikes
        });
    });
}

module.exports = { registerSocialHandlers };
