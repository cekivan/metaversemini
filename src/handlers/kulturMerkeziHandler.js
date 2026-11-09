// src/handlers/kulturMerkeziHandler.js - Kültür Merkezi, Stand-Up, VIP Biletli Gösteri & Seyirci Reaksiyon Mekanikleri
const dataManager = require('../dataManager');
const { checkRateLimit } = require('../utils/securityUtils');

const BUFFET_ITEMS = {
    popcorn: { id: 'popcorn', name: 'Taze Patlamış Mısır', price: 15, icon: '🍿' },
    cola: { id: 'cola', name: 'Soğuk Kutu Kola', price: 10, icon: '🥤' },
    hotdog: { id: 'hotdog', name: 'Leziz Sosisli Sandviç', price: 25, icon: '🌭' },
    chips: { id: 'chips', name: 'Tırtıklı Patates Cipsi', price: 15, icon: '🍟' }
};

// Global Kültür Merkezi Durumu
const kulturState = {
    stageMode: 'standup', // 'standup' | 'music' | 'rap' | 'talkshow' | 'poetry'
    currentPerformance: null, // { performerId, username, mode, startedAt, durationSec, timerId, invitedGuests: [] }
    queue: [], // [ { socketId, username, mode, durationSec, joinedAt } ]
    tomatoCount: 0, // 0..20 (20 olunca auto-kick)
    unmutedAudienceMembers: [], // Komedyenin söz verdiği seyirciler
    raisedHands: [], // Soru sormak/laf atmak için el kaldıran seyirciler
    activeLighters: new Set(), // Çakmak/telefon ışığı yakanlar
    // 10'ar dakikalık VIP Gösteri Rezervasyonları
    reservations: [
        {
            id: 'res_default_1',
            hostUsername: 'Cem_Yilmaz',
            title: 'Soru & Cevap Stand-Up Gecesi',
            mode: 'standup',
            timeStr: '21:00',
            ticketPrice: 150,
            ticketsSold: 8,
            pool: 1200,
            buyers: []
        },
        {
            id: 'res_default_2',
            hostUsername: 'AcousticTrio',
            title: 'Gece Akustiği & Şiir Dinletisi',
            mode: 'music',
            timeStr: '22:30',
            ticketPrice: 200,
            ticketsSold: 12,
            pool: 2400,
            buyers: []
        }
    ]
};

function getPublicKulturState() {
    return {
        stageMode: kulturState.stageMode,
        hasPerformer: !!kulturState.currentPerformance,
        currentPerformer: kulturState.currentPerformance ? {
            username: kulturState.currentPerformance.username,
            mode: kulturState.currentPerformance.mode,
            startedAt: kulturState.currentPerformance.startedAt,
            durationSec: kulturState.currentPerformance.durationSec,
            invitedGuests: kulturState.currentPerformance.invitedGuests || []
        } : null,
        queue: kulturState.queue.map(q => ({ username: q.username, mode: q.mode })),
        queueLength: kulturState.queue.length,
        tomatoCount: kulturState.tomatoCount,
        unmutedAudienceMembers: kulturState.unmutedAudienceMembers,
        raisedHands: kulturState.raisedHands,
        lighterCount: kulturState.activeLighters.size,
        reservations: kulturState.reservations.map(r => ({
            id: r.id,
            hostUsername: r.hostUsername,
            title: r.title,
            mode: r.mode,
            timeStr: r.timeStr,
            ticketPrice: r.ticketPrice,
            ticketsSold: r.ticketsSold
        }))
    };
}

function broadcastKulturState(io) {
    const pub = getPublicKulturState();
    io.to('kultur_merkezi_sahne').emit('kulturStateUpdate', pub);
    io.to('kultur_merkezi_lobi').emit('kulturStateUpdate', pub);
    io.to('kultur_merkezi_kulis').emit('kulturStateUpdate', pub);
    io.to('cadde2').emit('kulturStateUpdate', pub);
}

function startNextPerformance(io, players) {
    if (kulturState.currentPerformance && kulturState.currentPerformance.timerId) {
        clearTimeout(kulturState.currentPerformance.timerId);
    }

    kulturState.tomatoCount = 0;
    kulturState.unmutedAudienceMembers = [];
    kulturState.raisedHands = [];
    kulturState.activeLighters.clear();

    if (kulturState.queue.length === 0) {
        kulturState.currentPerformance = null;
        kulturState.stageMode = 'standup';
        broadcastKulturState(io);
        io.to('kultur_merkezi_sahne').emit('systemMessage', '🎭 Sahne şu anda boş. Sıraya girmek için kürsüdeki Kayıt Defterine tıklayın!');
        return;
    }

    const next = kulturState.queue.shift();
    const durationSec = next.durationSec || 180; // Varsayılan 3 dakika (veya 5 dakika)

    const timerId = setTimeout(() => {
        finishPerformance(io, players, 'time_expired');
    }, durationSec * 1000);

    kulturState.stageMode = next.mode || 'standup';
    kulturState.currentPerformance = {
        performerId: next.socketId,
        username: next.username,
        mode: next.mode,
        startedAt: Date.now(),
        durationSec: durationSec,
        timerId: timerId,
        invitedGuests: []
    };

    // Sahnedekini sahneye taşı (eğer sahne odasındaysa sahne koordinatına al)
    if (players[next.socketId] && players[next.socketId].room === 'kultur_merkezi_sahne') {
        players[next.socketId].x = 500;
        players[next.socketId].y = 230;
        io.to('kultur_merkezi_sahne').emit('playerMoved', {
            id: next.socketId,
            x: 500,
            y: 230
        });
    }

    broadcastKulturState(io);

    io.to('kultur_merkezi_sahne').emit('systemMessage', `🎤 ALKIŞLAR! ${next.username} sahneye çıktı! [Performans: ${next.mode.toUpperCase()}]`);
    io.to('kultur_merkezi_sahne').emit('performerStarted', {
        username: next.username,
        mode: next.mode,
        durationSec: durationSec
    });
}

function finishPerformance(io, players, reason = 'manual') {
    if (!kulturState.currentPerformance) return;

    const perf = kulturState.currentPerformance;
    if (perf.timerId) clearTimeout(perf.timerId);

    const username = perf.username;
    const socketId = perf.performerId;

    if (reason === 'tomatoes_kicked') {
        io.to('kultur_merkezi_sahne').emit('performerKicked', {
            username: username,
            reason: 'Seyircilerden 20 domates yiyerek yuhalandı!'
        });
        io.to('kultur_merkezi_sahne').emit('systemMessage', `🚨 SEFALETE DÖNÜŞ! ${username} seyircilerin tepkisine dayanamadı ve 20 domates yiyerek sahneden atıldı!`);
    } else {
        // Başarılı sahne performansı Stand-Up rozeti için sayılır & seviye ödülü kontrol edilir
        dataManager.recordGamePlayed(username, 'standup', 1);

        if (reason === 'time_expired') {
            io.to('kultur_merkezi_sahne').emit('systemMessage', `⏱️ Süre doldu! ${username} harika performansı için alkışlandı ve sahneden indi.`);
        } else {
            io.to('kultur_merkezi_sahne').emit('systemMessage', `👏 ${username} performansını tamamlayarak sahneden indi.`);
        }
    }

    // Sahnedeki oyuncuyu seyirci koltuklarına veya sahne önüne al
    if (players[socketId] && players[socketId].room === 'kultur_merkezi_sahne') {
        players[socketId].x = 500;
        players[socketId].y = 380;
        io.to('kultur_merkezi_sahne').emit('playerMoved', {
            id: socketId,
            x: 500,
            y: 380
        });
    }

    kulturState.currentPerformance = null;
    startNextPerformance(io, players);
}

function registerKulturMerkeziHandlers(io, socket, players, helpers) {
    // 1. Durum Alma
    socket.on('getKulturState', () => {
        socket.emit('kulturStateUpdate', getPublicKulturState());
    });

    // 2. Sahne Sırasına Girme (Open Mic Kayıt Defteri)
    socket.on('joinStageQueue', (data) => {
        if (!players[socket.id]) return;
        if (!checkRateLimit(socket, 'joinStageQueue', 3, 2000)) return;

        const username = players[socket.id].name;
        const mode = (data && ['standup', 'music', 'rap', 'talkshow', 'poetry'].includes(data.mode)) ? data.mode : 'standup';
        const durationSec = (data && (data.durationSec === 300 || data.durationSec === 180)) ? data.durationSec : 180;

        // Halihazırda sahnede mi?
        if (kulturState.currentPerformance && kulturState.currentPerformance.username.toLowerCase() === username.toLowerCase()) {
            socket.emit('gameError', 'Zaten şu anda sahnedesiniz!');
            return;
        }

        // Zaten sırada mı?
        const alreadyInQueue = kulturState.queue.some(q => q.username.toLowerCase() === username.toLowerCase());
        if (alreadyInQueue) {
            socket.emit('gameError', 'Zaten sahne sırasındasınız!');
            return;
        }

        kulturState.queue.push({
            socketId: socket.id,
            username: username,
            mode: mode,
            durationSec: durationSec,
            joinedAt: Date.now()
        });

        socket.emit('systemMessage', `📋 Açık Mikrofon Kayıt Defterine yazıldınız! Sıranız: ${kulturState.queue.length}. [${mode.toUpperCase()} - ${durationSec / 60} Dk]`);

        // Eğer sahne boşsa hemen başlat
        if (!kulturState.currentPerformance) {
            startNextPerformance(io, players);
        } else {
            broadcastKulturState(io);
        }
    });

    // 3. Sıradan Çıkma
    socket.on('leaveStageQueue', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const idx = kulturState.queue.findIndex(q => q.username.toLowerCase() === username.toLowerCase());
        if (idx !== -1) {
            kulturState.queue.splice(idx, 1);
            socket.emit('systemMessage', '❌ Sahne sırasından ayrıldınız.');
            broadcastKulturState(io);
        }
    });

    // 4. Sahneden İnme (Manuel)
    socket.on('leaveStage', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        if (kulturState.currentPerformance && kulturState.currentPerformance.username.toLowerCase() === username.toLowerCase()) {
            finishPerformance(io, players, 'manual');
        }
    });

    // 5. Sahne Modunu Değiştirme (Işık & Ambiyans)
    socket.on('changeStageMode', (data) => {
        if (!players[socket.id] || !data || !data.mode) return;
        const username = players[socket.id].name;
        if (!kulturState.currentPerformance || kulturState.currentPerformance.username.toLowerCase() !== username.toLowerCase()) {
            socket.emit('gameError', 'Yalnızca sahnedeki sanatçı sahne modunu değiştirebilir!');
            return;
        }
        if (['standup', 'music', 'rap', 'talkshow', 'poetry'].includes(data.mode)) {
            kulturState.stageMode = data.mode;
            kulturState.currentPerformance.mode = data.mode;
            broadcastKulturState(io);
            io.to('kultur_merkezi_sahne').emit('stageModeChanged', { mode: data.mode });
            io.to('kultur_merkezi_sahne').emit('systemMessage', `💡 Sahne ambiyansı ve ışıkları "${data.mode.toUpperCase()}" moduna uyarlandı!`);
        }
    });

    // 6. Sahneye Arkadaş/Konuk Davet Etme (Çoklu Sahne / Grup)
    socket.on('inviteToStage', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        const callerName = players[socket.id].name;
        if (!kulturState.currentPerformance || kulturState.currentPerformance.username.toLowerCase() !== callerName.toLowerCase()) {
            socket.emit('gameError', 'Yalnızca sahnedeki sanatçı sahneye konuk davet edebilir!');
            return;
        }

        const targetUser = data.targetUsername;
        if (kulturState.currentPerformance.invitedGuests.includes(targetUser)) {
            socket.emit('gameError', 'Bu oyuncu zaten sahnede davetli!');
            return;
        }
        if (kulturState.currentPerformance.invitedGuests.length >= 3) {
            socket.emit('gameError', 'Sahnede en fazla 3 konuk bulunabilir!');
            return;
        }

        // Hedef oyuncunun soketini bul
        const targetSid = Object.keys(players).find(sid => players[sid]?.name?.toLowerCase() === targetUser.toLowerCase());
        if (!targetSid) {
            socket.emit('gameError', `${targetUser} şu anda çevrimdışı!`);
            return;
        }

        kulturState.currentPerformance.invitedGuests.push(targetUser);
        broadcastKulturState(io);

        io.to(targetSid).emit('stageInvitationReceived', { host: callerName, mode: kulturState.stageMode });
        io.to('kultur_merkezi_sahne').emit('systemMessage', `👥 ${callerName}, ${targetUser}'ı sahneye davet etti!`);
    });

    // 7. Mikrofon Uzatma (Söz Ver / Roast Mantığı)
    socket.on('grantAudienceMic', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        const callerName = players[socket.id].name;
        if (!kulturState.currentPerformance || kulturState.currentPerformance.username.toLowerCase() !== callerName.toLowerCase()) {
            socket.emit('gameError', 'Yalnızca sahnedeki kişi mikrofon uzatabilir!');
            return;
        }

        const target = data.targetUsername;
        if (!kulturState.unmutedAudienceMembers.includes(target)) {
            kulturState.unmutedAudienceMembers.push(target);
        }

        // El kaldıranlar listesinden çıkar
        const hIdx = kulturState.raisedHands.indexOf(target);
        if (hIdx !== -1) kulturState.raisedHands.splice(hIdx, 1);

        broadcastKulturState(io);
        io.to('kultur_merkezi_sahne').emit('micGranted', { targetUsername: target, grantedBy: callerName });
        io.to('kultur_merkezi_sahne').emit('systemMessage', `🎤 SÖZ HAKKI! ${callerName}, seyircilerden ${target}'a mikrofon uzattı! Artık salona seslenebilir.`);
    });

    // 8. Seyirci Mikrofonunu Geri Alma (Sustur)
    socket.on('revokeAudienceMic', (data) => {
        if (!players[socket.id] || !data || !data.targetUsername) return;
        const callerName = players[socket.id].name;
        if (!kulturState.currentPerformance || kulturState.currentPerformance.username.toLowerCase() !== callerName.toLowerCase()) {
            socket.emit('gameError', 'Yalnızca sahnedeki kişi mikrofonu geri alabilir!');
            return;
        }

        const target = data.targetUsername;
        const idx = kulturState.unmutedAudienceMembers.indexOf(target);
        if (idx !== -1) {
            kulturState.unmutedAudienceMembers.splice(idx, 1);
            broadcastKulturState(io);
            io.to('kultur_merkezi_sahne').emit('micRevoked', { targetUsername: target });
            io.to('kultur_merkezi_sahne').emit('systemMessage', `🔇 ${callerName}, ${target}'ın mikrofonunu geri aldı ve susturdu.`);
        }
    });

    // 9. Bahşiş & Gül Fırlatma
    socket.on('sendStageTip', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'sendStageTip', 4, 2000)) return;

        const tipAmount = Math.max(1, parseInt(data.amount) || 10);
        if (!kulturState.currentPerformance) {
            socket.emit('gameError', 'Sahnede şu an kimse yok, bahşiş atılamaz!');
            return;
        }

        const senderName = players[socket.id].name;
        const targetPerformerName = kulturState.currentPerformance.username;
        if (senderName.toLowerCase() === targetPerformerName.toLowerCase()) {
            socket.emit('gameError', 'Kendinize bahşiş atamazsınız!');
            return;
        }

        const sKey = (dataManager.findUserKey ? dataManager.findUserKey(senderName) : null) || senderName;
        const senderData = dataManager.persistentData.users[sKey];
        if (!senderData || senderData.money < tipAmount) {
            socket.emit('gameError', `❌ Yetersiz bakiye! Bahşiş için ${tipAmount} TL gerekiyor.`);
            return;
        }

        const tKey = (dataManager.findUserKey ? dataManager.findUserKey(targetPerformerName) : null) || targetPerformerName;
        const targetData = dataManager.persistentData.users[tKey];
        if (!targetData) return;

        // Para transferi
        senderData.money -= tipAmount;
        targetData.money = (targetData.money || 0) + tipAmount;
        if (players[socket.id]) players[socket.id].money = senderData.money;

        const perfSid = kulturState.currentPerformance.performerId;
        if (players[perfSid]) players[perfSid].money = targetData.money;

        dataManager.savePersistentData(senderName);
        dataManager.savePersistentData(targetPerformerName);

        socket.emit('moneyUpdate', senderData.money);
        if (perfSid) io.to(perfSid).emit('moneyUpdate', targetData.money);

        // Sahneye gül & altın fırlatma animasyonu
        io.to('kultur_merkezi_sahne').emit('stageTipAnimation', {
            sender: senderName,
            performer: targetPerformerName,
            amount: tipAmount
        });

        io.to('kultur_merkezi_sahne').emit('systemMessage', `🌹💰 ${senderName}, sahnedeki ${targetPerformerName}'a ${tipAmount} TL bahşiş ve kırmızı güller fırlattı!`);
    });

    // 10. Yuhala & Domates Atma (20 Domateste Auto-Kick)
    socket.on('throwTomato', () => {
        if (!players[socket.id]) return;
        if (!checkRateLimit(socket, 'throwTomato', 3, 1000)) return;

        if (!kulturState.currentPerformance) {
            socket.emit('gameError', 'Sahnede kimse yok, domates fırlatamazsınız!');
            return;
        }

        const senderName = players[socket.id].name;
        const performerName = kulturState.currentPerformance.username;

        if (senderName.toLowerCase() === performerName.toLowerCase()) {
            socket.emit('gameError', 'Kendinize domates atamazsınız!');
            return;
        }

        kulturState.tomatoCount = (kulturState.tomatoCount || 0) + 1;

        // Domates sıçrama konumu (sahne üzerinde rastgele)
        const splashX = 420 + Math.random() * 160;
        const splashY = 200 + Math.random() * 60;

        io.to('kultur_merkezi_sahne').emit('tomatoThrownAnimation', {
            sender: senderName,
            splashX: splashX,
            splashY: splashY,
            tomatoCount: kulturState.tomatoCount
        });

        if (kulturState.tomatoCount >= 20) {
            finishPerformance(io, players, 'tomatoes_kicked');
        } else {
            broadcastKulturState(io);
        }
    });

    // 11. Çakmak / Telefon Işığı Yakma
    socket.on('toggleStageLighter', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        if (kulturState.activeLighters.has(username)) {
            kulturState.activeLighters.delete(username);
        } else {
            kulturState.activeLighters.add(username);
        }
        broadcastKulturState(io);
    });

    // 12. El Kaldırma
    socket.on('toggleRaiseHand', () => {
        if (!players[socket.id]) return;
        const username = players[socket.id].name;
        const idx = kulturState.raisedHands.indexOf(username);
        if (idx !== -1) {
            kulturState.raisedHands.splice(idx, 1);
        } else {
            kulturState.raisedHands.push(username);
            if (kulturState.currentPerformance && kulturState.currentPerformance.performerId) {
                io.to(kulturState.currentPerformance.performerId).emit('systemMessage', `🙋 ${username} söz hakkı istemek için el kaldırdı!`);
            }
        }
        broadcastKulturState(io);
    });

    // 13. Büfe Atıştırmalık Satın Alma
    socket.on('buyBuffetItem', (data) => {
        if (!players[socket.id] || !data || !data.itemId) return;
        if (!checkRateLimit(socket, 'buyBuffetItem', 4, 2000)) return;

        const item = BUFFET_ITEMS[data.itemId];
        if (!item) {
            socket.emit('gameError', 'Büfede böyle bir yiyecek bulunamadı!');
            return;
        }

        const username = players[socket.id].name;
        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData || userData.money < item.price) {
            socket.emit('gameError', `❌ Yetersiz bakiye! "${item.name}" ${item.price} TL.`);
            return;
        }

        userData.money -= item.price;
        if (players[socket.id]) players[socket.id].money = userData.money;

        if (!userData.inventory) userData.inventory = [];
        const invKey = `buffet_${item.id}`;
        if (!userData.inventory.includes(invKey)) userData.inventory.push(invKey);

        if (!userData.propInventory) userData.propInventory = {};
        const propKey = `props_${item.id === 'cola' ? 'kola' : item.id}`;
        userData.propInventory[propKey] = (userData.propInventory[propKey] || 0) + 1;
        socket.emit('propInventoryUpdate', userData.propInventory);

        dataManager.savePersistentData(username);
        socket.emit('moneyUpdate', userData.money);

        socket.emit('systemMessage', `🍿 Büfeden ${item.name} aldınız! Afiyet olsun.`);
        io.to(players[socket.id].room).emit('playerBuffetEating', {
            id: socket.id,
            itemId: item.id,
            icon: item.icon
        });
    });

    // 14. VIP Biletli Gösteri Rezervasyonu (Sanatçılar İçin)
    socket.on('bookVipShow', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'bookVipShow', 3, 2000)) return;

        const username = players[socket.id].name;
        const title = dataManager.sanitizeString(data.title || `${username} ile Canlı Performans`, 40, false);
        const mode = ['standup', 'music', 'rap', 'talkshow', 'poetry'].includes(data.mode) ? data.mode : 'standup';
        const timeStr = data.timeStr || '23:00';
        const ticketPrice = Math.min(500, Math.max(1, parseInt(data.ticketPrice) || 100));

        const newRes = {
            id: 'res_' + Date.now(),
            hostUsername: username,
            title: title,
            mode: mode,
            timeStr: timeStr,
            ticketPrice: ticketPrice,
            ticketsSold: 0,
            pool: 0,
            buyers: []
        };

        kulturState.reservations.push(newRes);
        broadcastKulturState(io);

        socket.emit('systemMessage', `🎟️ Gösteriniz "${title}" saat ${timeStr} için rezerve edildi! Bilet fiyatı: ${ticketPrice} TL.`);
        io.to('cadde2').emit('billboardUpdated', newRes);
    });

    // 15. VIP Gösteri Bileti Satın Alma
    socket.on('buyShowTicket', (data) => {
        if (!players[socket.id] || !data || !data.reservationId) return;
        if (!checkRateLimit(socket, 'buyShowTicket', 3, 2000)) return;

        const res = kulturState.reservations.find(r => r.id === data.reservationId);
        if (!res) {
            socket.emit('gameError', 'Böyle bir gösteri rezervasyonu bulunamadı!');
            return;
        }

        const username = players[socket.id].name;
        if (res.buyers.includes(username)) {
            socket.emit('gameError', 'Bu gösterinin biletini zaten satın aldınız!');
            return;
        }

        const uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        const userData = dataManager.persistentData.users[uKey];
        if (!userData || userData.money < res.ticketPrice) {
            socket.emit('gameError', `❌ Yetersiz bakiye! Gösteri bileti ${res.ticketPrice} TL.`);
            return;
        }

        userData.money -= res.ticketPrice;
        if (players[socket.id]) players[socket.id].money = userData.money;

        res.buyers.push(username);
        res.ticketsSold += 1;
        res.pool = (res.pool || 0) + res.ticketPrice;

        dataManager.savePersistentData(username);
        socket.emit('moneyUpdate', userData.money);

        socket.emit('systemMessage', `🎟️ "${res.title}" için VIP bilet satın aldınız! Giriş kapısından geçebilirsiniz.`);
        broadcastKulturState(io);
    });

    // 16. Oyuncu Bağlantısı Koptuğunda
    socket.on('disconnect', () => {
        if (players[socket.id]) {
            const username = players[socket.id].name;
            // Sıradaysa çıkar
            const qIdx = kulturState.queue.findIndex(q => q.socketId === socket.id);
            if (qIdx !== -1) kulturState.queue.splice(qIdx, 1);

            // Sahnedeyse bitir
            if (kulturState.currentPerformance && kulturState.currentPerformance.performerId === socket.id) {
                finishPerformance(io, players, 'disconnect');
            }

            kulturState.activeLighters.delete(username);
            const rIdx = kulturState.raisedHands.indexOf(username);
            if (rIdx !== -1) kulturState.raisedHands.splice(rIdx, 1);
            const mIdx = kulturState.unmutedAudienceMembers.indexOf(username);
            if (mIdx !== -1) kulturState.unmutedAudienceMembers.splice(mIdx, 1);
        }
    });
}

module.exports = {
    registerKulturMerkeziHandlers,
    kulturState,
    BUFFET_ITEMS,
    getPublicKulturState
};

