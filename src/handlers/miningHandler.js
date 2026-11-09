// src/handlers/miningHandler.js - 2.5D İzometrik Maden Haritası, Cevher Kazma & Elmas Jackpot Sunucu Motoru
const dataManager = require('../dataManager');
const { addPlayerXP } = require('../utils/levelSystem');

// 12 Adet Maden Kayası (Ore Nodes) Koordinatları & Durumları
const ORE_NODES = [
    { id: 0, x: 220, y: 220, state: 'ACTIVE', respawnAt: null },
    { id: 1, x: 380, y: 200, state: 'ACTIVE', respawnAt: null },
    { id: 2, x: 560, y: 190, state: 'ACTIVE', respawnAt: null },
    { id: 3, x: 740, y: 210, state: 'ACTIVE', respawnAt: null },
    { id: 4, x: 870, y: 270, state: 'ACTIVE', respawnAt: null },
    { id: 5, x: 190, y: 320, state: 'ACTIVE', respawnAt: null },
    { id: 6, x: 420, y: 340, state: 'ACTIVE', respawnAt: null },
    { id: 7, x: 680, y: 330, state: 'ACTIVE', respawnAt: null },
    { id: 8, x: 880, y: 410, state: 'ACTIVE', respawnAt: null },
    { id: 9, x: 260, y: 460, state: 'ACTIVE', respawnAt: null },
    { id: 10, x: 520, y: 470, state: 'ACTIVE', respawnAt: null },
    { id: 11, x: 750, y: 490, state: 'ACTIVE', respawnAt: null }
];

// Fiyatlandırma ve Süre Sabitleri
const PICKAXE_COST = 200; // 200 TL
const PICKAXE_DURATION_MS = 15 * 60 * 1000; // 15 Dakika (900.000 ms)
const NODE_RESPAWN_MS = 30 * 1000; // 30 Saniye (Hızlı Yenilenme)

const ORE_PRICES = {
    komur: 15,
    bakir: 35,
    demir: 80
};

// Test modunda elmas şansını %50 yapmak için geçici bayrak (Normalde null veya 0)
let DIAMOND_TEST_RATE = null;

let tickInterval = null;

/**
 * Maden Motorunu Başlatır (1 saniyelik respawn kontrol döngüsü)
 */
function startMiningEngine(io) {
    if (tickInterval) return;

    tickInterval = setInterval(() => {
        const now = Date.now();
        let changed = false;

        ORE_NODES.forEach(node => {
            if (node.state === 'DEPLETED' && node.respawnAt && now >= node.respawnAt) {
                node.state = 'ACTIVE';
                node.respawnAt = null;
                changed = true;
            }
        });

        if (changed) {
            io.to('mine_cave').emit('mine_nodes_update', { nodes: ORE_NODES });
        }
    }, 1000);

    console.log('⛏️ [MINING]: Maden motoru başlatıldı (12 cevher kayası aktif).');
}

/**
 * Socket Olaylarını Kaydeder
 */
function registerMiningHandlers(io, socket, players, helpers) {
    // 1. Maden Durumu ve Oyuncu Maden Bilgilerini Getir
    socket.on('get_mine_state', () => {
        const p = players[socket.id];
        if (!p) return;

        const username = p.username || p.name;
        const uKey = dataManager.findUserKey(username);
        const uData = (uKey && dataManager.persistentData.users[uKey]) || {};

        const userOres = uData.ores || p.ores || { komur: 0, bakir: 0, demir: 0 };
        const userDiamonds = (uData.diamonds !== undefined) ? uData.diamonds : (p.diamonds || 0);
        const userPickaxe = (uData.pickaxeExpiresAt !== undefined) ? uData.pickaxeExpiresAt : (p.pickaxeExpiresAt || null);

        socket.emit('mine_state_data', {
            nodes: ORE_NODES,
            ores: userOres,
            diamonds: userDiamonds,
            pickaxeExpiresAt: userPickaxe,
            prices: ORE_PRICES,
            pickaxeCost: PICKAXE_COST
        });
    });

    // 2. Maden Tüccarı Cabbar'dan Kazma Satın Alma (200 TL -> 15 Dakika)
    socket.on('buy_pickaxe', () => {
        const p = players[socket.id];
        console.log('⛏️ [DEBUG buy_pickaxe]: socket.id =', socket.id, 'p =', p ? { name: p.name, username: p.username, money: p.money } : 'null');
        if (!p) return;

        const username = p.username || p.name;
        const uKey = dataManager.findUserKey(username);
        const uData = (uKey && dataManager.persistentData.users[uKey]) || {};

        // Zaten geçerli ve aktif bir kazması var mı kontrolü (Çifte alımı engelle)
        const activeExpiresAt = (uData.pickaxeExpiresAt !== undefined) ? uData.pickaxeExpiresAt : p.pickaxeExpiresAt;
        if (activeExpiresAt && activeExpiresAt > Date.now()) {
            const minsLeft = Math.ceil((activeExpiresAt - Date.now()) / 60000);
            socket.emit('toast', { text: `⛏️ Zaten aktif bir madenci kazman var! (${minsLeft} dakika kaldı)`, type: 'warning' });
            return;
        }

        const currentMoney = (uData.money !== undefined) ? uData.money : (p.money || 0);
        if (currentMoney < PICKAXE_COST) {
            socket.emit('toast', { text: `❌ Kazma almak için ${PICKAXE_COST} TL gereklidir!`, type: 'error' });
            return;
        }

        const newMoney = currentMoney - PICKAXE_COST;
        const expiresAt = Date.now() + PICKAXE_DURATION_MS;

        // Bellekte güncelle
        p.money = newMoney;
        p.pickaxeExpiresAt = expiresAt;
        p.heldItem = 'kazma';

        if (uData.avatar) {
            uData.avatar.heldItem = 'kazma';
        }

        // Veritabanına kaydet
        dataManager.saveUserData(username, {
            money: newMoney,
            pickaxeExpiresAt: expiresAt,
            avatar: uData.avatar
        });

        // İstemciye ve odaya bildir
        socket.emit('moneyUpdate', newMoney);
        socket.emit('pickaxe_bought', {
            pickaxeExpiresAt: expiresAt,
            money: newMoney,
            heldItem: 'kazma'
        });
        socket.emit('toast', { text: '⛏️ 15 Dakikalık Madenci Kazması satın alındı! Kuşandın.', type: 'success' });

        // Karakter görünümünü güncelle
        io.to(p.room || 'sokak').emit('playerAvatarChange', {
            id: socket.id,
            heldItem: 'kazma',
            avatar: uData.avatar
        });
    });

    // 3. Mini-Refleks Oyunu Tamamlandı (mine_node_complete)
    // Yanlış vuruş bildirimi (3 saniye engel)
    socket.on('mine_node_miss', () => {
        socket.strikeCooldownUntil = Date.now() + 3000;
    });

    socket.on('mine_node_complete', (data) => {
        const p = players[socket.id];
        if (!p) return;

        if (socket.strikeCooldownUntil && Date.now() < socket.strikeCooldownUntil) {
            socket.emit('toast', { text: '⏳ Yanlış vurduğun için 3 sn cezalısın, vuramazsın!', type: 'error' });
            return;
        }

        const nodeId = (data && typeof data.nodeId === 'number') ? data.nodeId : -1;
        const node = ORE_NODES.find(n => n.id === nodeId);
        if (!node) {
            socket.emit('toast', { text: 'Geçersiz maden kayası!', type: 'error' });
            return;
        }

        const username = p.username || p.name;
        const uKey = dataManager.findUserKey(username);
        const uData = (uKey && dataManager.persistentData.users[uKey]) || {};

        // 15 Dakikalık Kazma Süre Doğrulaması
        const pickaxeExpiresAt = (uData.pickaxeExpiresAt !== undefined) ? uData.pickaxeExpiresAt : (p.pickaxeExpiresAt || null);
        if (!pickaxeExpiresAt || Date.now() > pickaxeExpiresAt) {
            p.pickaxeExpiresAt = null;
            if (uData) {
                uData.pickaxeExpiresAt = null;
                if (uData.avatar) uData.avatar.heldItem = 'none';
            }
            if (p.heldItem === 'kazma') p.heldItem = 'none';
            dataManager.saveUserData(username, { pickaxeExpiresAt: null, avatar: uData ? uData.avatar : undefined });
            io.to(p.room || 'sokak').emit('playerAvatarChange', {
                id: socket.id,
                heldItem: 'none',
                avatar: uData ? uData.avatar : undefined
            });
            socket.emit('toast', { text: '❌ Kazman kırıldı veya süresi doldu! Cabbar\'dan yeni kazma al.', type: 'error' });
            socket.emit('pickaxe_expired', {});
            return;
        }

        // Kaya durumu doğrulaması
        if (node.state !== 'ACTIVE') {
            socket.emit('toast', { text: 'Bu kaya şu anda tükenmiş durumda, yeniden doğmasını bekle!', type: 'warning' });
            return;
        }

        // Kayayı 120 saniyeliğine DEPLETED durumuna al
        node.state = 'DEPLETED';
        node.respawnAt = Date.now() + NODE_RESPAWN_MS;

        // Odaya tükenme bildirimini gönder
        io.to('mine_cave').emit('mine_node_depleted', {
            nodeId: node.id,
            respawnAt: node.respawnAt
        });

        // ZAR ATMA (DROP RATE MANTIĞI)
        // %55.0 -> Kömür (0 - 55.00)
        // %30.0 -> Bakır (55.00 - 85.00)
        // %14.8 -> Demir (85.00 - 99.80)
        // %0.2 -> 💎 ELMAS (99.80 - 100.00 | Binde 2 Ultra Nadir Jackpot)
        const userOres = uData.ores || p.ores || { komur: 0, bakir: 0, demir: 0 };
        let userDiamonds = (uData.diamonds !== undefined) ? uData.diamonds : (p.diamonds || 0);

        let dropType = 'komur';
        let dropName = 'Kömür';
        let dropIcon = '🪨';
        let dropColor = '#94a3b8';
        let isDiamond = false;

        const roll = Math.random() * 100;

        // Test modunda veya zar sonucu elmas çıkarsa
        if (DIAMOND_TEST_RATE !== null && Math.random() < DIAMOND_TEST_RATE) {
            isDiamond = true;
        } else if (roll >= 99.80) {
            isDiamond = true;
        } else if (roll >= 85.00) {
            dropType = 'demir';
            dropName = 'Demir Cevheri';
            dropIcon = '⬜';
            dropColor = '#e2e8f0';
        } else if (roll >= 55.00) {
            dropType = 'bakir';
            dropName = 'Bakır Cevheri';
            dropIcon = '🟧';
            dropColor = '#fb923c';
        } else {
            dropType = 'komur';
            dropName = 'Kömür';
            dropIcon = '🪨';
            dropColor = '#94a3b8';
        }

        // Kaya tamamen kırıldı: Kaya sayacını artır, maden rozetini işle ve 3 XP ödülü ver
        addPlayerXP(io, players, socket.id, uData, 3, 'maden');
        dataManager.recordGamePlayed(username, 'mining', 1);
        p.minedRocksCount = uData.minedRocksCount;

        if (isDiamond) {
            dropType = 'diamond';
            dropName = '💎 ULTRA NADİR ELMAS';
            dropIcon = '💎';
            dropColor = '#38bdf8';
            userDiamonds += 1;
            p.diamonds = userDiamonds;
            uData.diamonds = userDiamonds;

            dataManager.saveUserData(username, { diamonds: userDiamonds, minedRocksCount: uData.minedRocksCount });
            socket.emit('diamondUpdate', userDiamonds);

            // TÜM BAĞLI OYUNCULARA GLOBAL JACKPOT BİLDİRİMİ!
            io.emit('global_diamond_drop', {
                playerName: p.username || username,
                nodeId: node.id
            });

            // Global Chat & Server Duyurusu
            const announcement = `💎 TEBRİKLER! ${p.username || username} madende kaya kırarak 1 adet ULTRA NADİR ELMAS çıkardı!`;
            io.emit('systemMessage', announcement);
            io.emit('chatMessage', {
                author: 'SİSTEM',
                text: announcement,
                color: '#38bdf8',
                badge: '💎',
                time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            });
        } else {
            userOres[dropType] = (userOres[dropType] || 0) + 1;
            p.ores = userOres;
            uData.ores = userOres;
            p.minedCount = uData.minedCount;

            dataManager.saveUserData(username, { ores: userOres, minedCount: uData.minedCount, minedRocksCount: uData.minedRocksCount });
        }

        // Madencilik yapan oyuncuya ödül detayı gönder
        socket.emit('mine_drop_result', {
            nodeId: node.id,
            dropType: dropType,
            dropName: dropName,
            dropIcon: dropIcon,
            dropColor: dropColor,
            isDiamond: isDiamond,
            ores: userOres,
            diamonds: userDiamonds
        });
    });

    // 4. Cevherleri Satma (Tekli veya Tümünü Sat)
    socket.on('sell_ores', (data) => {
        const p = players[socket.id];
        if (!p) return;

        const oreType = (data && data.oreType) ? data.oreType : 'all';
        const username = p.username || p.name;
        const uKey = dataManager.findUserKey(username);
        const uData = (uKey && dataManager.persistentData.users[uKey]) || {};

        const userOres = uData.ores || p.ores || { komur: 0, bakir: 0, demir: 0 };
        let currentMoney = (uData.money !== undefined) ? uData.money : (p.money || 0);

        let earned = 0;
        let soldSummary = [];

        if (oreType === 'all') {
            const kCount = userOres.komur || 0;
            const bCount = userOres.bakir || 0;
            const dCount = userOres.demir || 0;

            earned += kCount * ORE_PRICES.komur;
            earned += bCount * ORE_PRICES.bakir;
            earned += dCount * ORE_PRICES.demir;

            if (kCount > 0) soldSummary.push(`${kCount} Kömür`);
            if (bCount > 0) soldSummary.push(`${bCount} Bakır`);
            if (dCount > 0) soldSummary.push(`${dCount} Demir`);

            userOres.komur = 0;
            userOres.bakir = 0;
            userOres.demir = 0;
        } else if (ORE_PRICES[oreType]) {
            const count = userOres[oreType] || 0;
            earned += count * ORE_PRICES[oreType];
            if (count > 0) soldSummary.push(`${count} ${oreType.toUpperCase()}`);
            userOres[oreType] = 0;
        }

        if (earned <= 0) {
            socket.emit('toast', { text: 'Satılacak cevher bulunamadı!', type: 'info' });
            return;
        }

        currentMoney += earned;
        p.money = currentMoney;
        p.ores = userOres;
        uData.money = currentMoney;
        uData.ores = userOres;

        dataManager.saveUserData(username, {
            money: currentMoney,
            ores: userOres
        });

        socket.emit('moneyUpdate', currentMoney);
        socket.emit('ores_sold', {
            earned: earned,
            newMoney: currentMoney,
            newOres: userOres
        });
        socket.emit('toast', {
            text: `💰 Cevherler satıldı! +${earned} TL kazandın (${soldSummary.join(', ')})`,
            type: 'success'
        });
    });

    // Test Helper: Elmas test oranını ayarla (Yalnızca testler için)
    socket.on('dev_set_diamond_test_rate', (data) => {
        if (data && typeof data.rate === 'number') {
            DIAMOND_TEST_RATE = data.rate;
            socket.emit('toast', { text: `💎 Elmas test oranı: %${(data.rate * 100).toFixed(1)} olarak ayarlandı!`, type: 'info' });
        } else {
            DIAMOND_TEST_RATE = null;
            socket.emit('toast', { text: '💎 Elmas test oranı sıfırlandı (Normal %0.2).', type: 'info' });
        }
    });
}

module.exports = {
    startMiningEngine,
    registerMiningHandlers,
    ORE_NODES,
    ORE_PRICES,
    PICKAXE_COST,
    PICKAXE_DURATION_MS,
    setDiamondTestRate: (rate) => { DIAMOND_TEST_RATE = rate; }
};
