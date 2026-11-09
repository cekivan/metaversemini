// src/handlers/botanicHandler.js
// 🌿 DİNAMİK OYUNCU EKONOMİLİ BOTANİK DÜKKANI & ACIMASIZ TARIM (FARMING) MOTORU

const dataManager = require('../dataManager');
const { addPlayerXP } = require('../utils/levelSystem');

// Test ve üretim süresi çarpanı (Üretim: 1, Hızlı Test: 0.01)
const TIME_MULTIPLIER = 1;

// Her tohum için özel büyüme süreleri (Çiçek süresi = Fide süresinin tam 2 katı!)
const CROP_DURATIONS = {
    'papatya': {
        seedGrowthMs: 1200000 * TIME_MULTIPLIER,   // 20 Dakika (Tohum -> Fide)
        flowerGrowthMs: 2400000 * TIME_MULTIPLIER // 40 Dakika (Fidenin 2 katı!)
    },
    'lale': {
        seedGrowthMs: 1800000 * TIME_MULTIPLIER,   // 30 Dakika (Tohum -> Fide)
        flowerGrowthMs: 3600000 * TIME_MULTIPLIER // 60 Dakika / 1 Saat (Fidenin 2 katı!)
    },
    'gul': {
        seedGrowthMs: 2700000 * TIME_MULTIPLIER,   // 45 Dakika (Tohum -> Fide)
        flowerGrowthMs: 5400000 * TIME_MULTIPLIER // 90 Dakika / 1.5 Saat (Fidenin 2 katı!)
    },
    'sakayik': {
        seedGrowthMs: 1800000 * TIME_MULTIPLIER,   // 30 Dakika (Tohum -> Fide)
        flowerGrowthMs: 5400000 * TIME_MULTIPLIER // 90 Dakika (Fide -> Çiçek, Toplam 120 dk / 2 Saat)
    },
    'lavanta': {
        seedGrowthMs: 3600000 * TIME_MULTIPLIER,   // 60 Dakika / 1 Saat (Tohum -> Fide)
        flowerGrowthMs: 7200000 * TIME_MULTIPLIER // 120 Dakika / 2 Saat (Fidenin 2 katı!)
    },
    'orkide': {
        seedGrowthMs: 5400000 * TIME_MULTIPLIER,   // 90 Dakika / 1.5 Saat (Tohum -> Fide)
        flowerGrowthMs: 10800000 * TIME_MULTIPLIER // 180 Dakika / 3 Saat (Fidenin 2 katı!)
    },
    'aycicegi': {
        seedGrowthMs: 7200000 * TIME_MULTIPLIER,   // 120 Dakika / 2 Saat (Tohum -> Fide)
        flowerGrowthMs: 14400000 * TIME_MULTIPLIER // 240 Dakika / 4 Saat (Fidenin 2 katı!)
    }
};

// Sunucu Otoriteli Zaman Sabitleri
const SAPLING_EXPIRE_MS = 600000 * TIME_MULTIPLIER;    // 10 Dakika Ölüm Riski (Fide Hasat veya Su+Gübre)
const FLOWER_EXPIRE_MS = 900000 * TIME_MULTIPLIER;     // 15 Dakika Ölüm Riski (Çiçek Hasadı)
const CLEANING_DURATION_MS = 30000 * TIME_MULTIPLIER;  // 30 Saniye (Tarla Temizliği)
const CLEANING_COST = 50;                              // 50 TL Temizlik Cezası

// Fiyat Konfigürasyonu (En ucuz çiçek 1000 TL, süreye göre artan katmanlar)
const BOTANIC_PRICES = {
    supplies: {
        'props_tohum_papatya': { name: 'Papatya Tohumu', price: 100, type: 'seed', seedType: 'papatya', growthMin: 20 },
        'props_tohum_lale': { name: 'Lale Tohumu', price: 150, type: 'seed', seedType: 'lale', growthMin: 30 },
        'props_tohum_gul': { name: 'Gül Tohumu', price: 250, type: 'seed', seedType: 'gul', growthMin: 45 },
        'props_tohum_sakayik': { name: 'Şakayık Tohumu', price: 400, type: 'seed', seedType: 'sakayik', growthMin: 30 },
        'props_tohum_lavanta': { name: 'Lavanta Tohumu', price: 400, type: 'seed', seedType: 'lavanta', growthMin: 60 },
        'props_tohum_orkide': { name: 'Orkide Tohumu', price: 600, type: 'seed', seedType: 'orkide', growthMin: 90 },
        'props_tohum_aycicegi': { name: 'Ayçiçeği Tohumu', price: 1000, type: 'seed', seedType: 'aycicegi', growthMin: 120 },
        'props_bitki_suyu': { name: 'Özel Bitki Suyu', price: 50, type: 'water' },
        'props_organik_gubre': { name: 'Organik Gübre', price: 100, type: 'fertilizer' }
    },
    crops: {
        fide: {
            'papatya': { key: 'props_fide_papatya', name: 'Papatya Fidesi', sellPrice: 500 },
            'lale': { key: 'props_fide_lale', name: 'Lale Fidesi', sellPrice: 750 },
            'gul': { key: 'props_fide_gul', name: 'Gül Fidesi', sellPrice: 1100 },
            'sakayik': { key: 'props_fide_sakayik', name: 'Şakayık Fidesi', sellPrice: 1800 },
            'lavanta': { key: 'props_fide_lavanta', name: 'Lavanta Fidesi', sellPrice: 1750 },
            'orkide': { key: 'props_fide_orkide', name: 'Orkide Fidesi', sellPrice: 2750 },
            'aycicegi': { key: 'props_fide_aycicegi', name: 'Ayçiçeği Fidesi', sellPrice: 4750 }
        },
        flower: {
            'papatya': { key: 'props_cicek_papatya', name: 'Kır Papatyası', sellPrice: 1000, marketBuyPrice: 1300 },
            'lale': { key: 'props_cicek_lale', name: 'Sultan Lalesi', sellPrice: 1500, marketBuyPrice: 1950 },
            'gul': { key: 'props_cicek_gul', name: 'Kırmızı Gül', sellPrice: 2200, marketBuyPrice: 2850 },
            'sakayik': { key: 'props_cicek_sakayik', name: 'Zarif Şakayık', sellPrice: 3600, marketBuyPrice: 4700 },
            'lavanta': { key: 'props_cicek_lavanta', name: 'Dağ Lavantası', sellPrice: 3500, marketBuyPrice: 4500 },
            'orkide': { key: 'props_cicek_orkide', name: 'Mor Orkide', sellPrice: 5500, marketBuyPrice: 7100 },
            'aycicegi': { key: 'props_cicek_aycicegi', name: 'Güneş Ayçiçeği', sellPrice: 9500, marketBuyPrice: 12000 }
        }
    }
};

// Botanik Rozeti Hasat Puanları
// Papatya, Lale, Gül, Şakayık: Fide 1, Çiçek 2
// Lavanta: Fide 2, Çiçek 3
// Orkide, Ayçiçeği: Fide 2, Çiçek 4
const BOTANIC_BADGE_POINTS = {
    'papatya': { fide: 1, flower: 2 },
    'lale': { fide: 1, flower: 2 },
    'gul': { fide: 1, flower: 2 },
    'sakayik': { fide: 1, flower: 2 },
    'lavanta': { fide: 2, flower: 3 },
    'orkide': { fide: 2, flower: 4 },
    'aycicegi': { fide: 2, flower: 4 }
};

let ioInstance = null;
let tickTimer = null;

/**
 * 9'lu Boş Tarla Başlangıç Şablonu
 */
function createDefaultFarmPlots() {
    let plots = [];
    for (let i = 0; i < 9; i++) {
        plots.push({
            plotIndex: i,
            state: 'EMPTY', // EMPTY | SEED | SAPLING_READY | FLOWER_GROWING | FLOWER_READY | WITHERED | CLEANING
            seedType: null, // "gul" | "papatya" | "orkide"
            plantedAt: null,
            stageChangedAt: null,
            expiresAt: null,
            cleaningEndsAt: null,
            hasWater: false,
            hasFertilizer: false
        });
    }
    return plots;
}

/**
 * Kullanıcının Tarla Verilerini Getir / Yoksa Oluştur
 */
function getUserFarmPlots(uData) {
    if (!uData.farmPlots || !Array.isArray(uData.farmPlots) || uData.farmPlots.length !== 9) {
        uData.farmPlots = createDefaultFarmPlots();
        dataManager.savePersistentData();
    }
    return uData.farmPlots;
}

/**
 * Global Botanik Borsası Stok Nesnesi
 */
function getBotanicMarketStock() {
    if (!dataManager.persistentData.botanicMarketStock) {
        dataManager.persistentData.botanicMarketStock = { papatya: 20, lale: 20, gul: 20, sakayik: 20, lavanta: 20, orkide: 20, aycicegi: 20 };
        dataManager.savePersistentData();
    }
    if (dataManager.persistentData.botanicMarketStock.sakayik === undefined) {
        dataManager.persistentData.botanicMarketStock.sakayik = 20;
    }
    return dataManager.persistentData.botanicMarketStock;
}

/**
 * 1 Saniyelik Sunucu Otoriteli Durum Makinesi Döngüsü (State Machine Tick)
 */
function startBotanicEngine(io) {
    ioInstance = io;
    if (tickTimer) clearInterval(tickTimer);

    tickTimer = setInterval(() => {
        let now = Date.now();
        let anyPlotChanged = false;
        let users = dataManager.persistentData.users || {};

        for (let username in users) {
            let uData = users[username];
            if (!uData || !uData.farmPlots) continue;

            let userDirty = false;
            let plots = uData.farmPlots;

            plots.forEach(plot => {
                // A) AŞAMA 1: TOHUM BÜYÜMESİ (SEED -> SAPLING_READY)
                if (plot.state === 'SEED') {
                    let seedDur = (CROP_DURATIONS[plot.seedType] || CROP_DURATIONS['papatya']).seedGrowthMs;
                    if (now >= (plot.stageChangedAt || plot.plantedAt || now) + seedDur) {
                        plot.state = 'SAPLING_READY';
                        plot.stageChangedAt = now;
                        plot.expiresAt = now + SAPLING_EXPIRE_MS; // 10 Dakika Ölüm Riski
                        userDirty = true;
                    }
                }
                // B) AŞAMA 2: FİDE YANMA KONTROLÜ (SAPLING_READY -> WITHERED)
                else if (plot.state === 'SAPLING_READY') {
                    if (plot.expiresAt && now >= plot.expiresAt) {
                        plot.state = 'WITHERED';
                        plot.expiresAt = null;
                        userDirty = true;
                    }
                }
                // C) AŞAMA 3: ÇİÇEK BÜYÜMESİ (FLOWER_GROWING -> FLOWER_READY)
                else if (plot.state === 'FLOWER_GROWING') {
                    let flowerDur = (CROP_DURATIONS[plot.seedType] || CROP_DURATIONS['papatya']).flowerGrowthMs;
                    if (now >= (plot.stageChangedAt || now) + flowerDur) {
                        plot.state = 'FLOWER_READY';
                        plot.stageChangedAt = now;
                        plot.expiresAt = now + FLOWER_EXPIRE_MS; // 15 Dakika Ölüm Riski
                        userDirty = true;
                    }
                }
                // D) AŞAMA 4: ÇİÇEK SOLMA/YANMA KONTROLÜ (FLOWER_READY -> WITHERED)
                else if (plot.state === 'FLOWER_READY') {
                    if (plot.expiresAt && now >= plot.expiresAt) {
                        plot.state = 'WITHERED';
                        plot.expiresAt = null;
                        userDirty = true;
                    }
                }
                // E) AŞAMA 5: CEZALI TEMİZLİK BİTİŞİ (CLEANING -> EMPTY)
                else if (plot.state === 'CLEANING') {
                    if (plot.cleaningEndsAt && now >= plot.cleaningEndsAt) {
                        plot.state = 'EMPTY';
                        plot.seedType = null;
                        plot.plantedAt = null;
                        plot.stageChangedAt = null;
                        plot.expiresAt = null;
                        plot.cleaningEndsAt = null;
                        plot.hasWater = false;
                        plot.hasFertilizer = false;
                        userDirty = true;
                    }
                }
            });

            if (userDirty) {
                anyPlotChanged = true;
                // Çevrimiçi ise doğrudan veya odadaki herkese bildir
                if (ioInstance) {
                    ioInstance.emit('farmPlotsUpdate', {
                        owner: username,
                        plots: plots,
                        now: now
                    });
                }
            }
        }

        if (anyPlotChanged) {
            dataManager.savePersistentData();
        }
    }, 1000);

    console.log(`🌿 [BOTANİK]: Acımasız Tarım Motoru başlatıldı (Zaman Çarpanı: ${TIME_MULTIPLIER}x).`);
}

/**
 * Socket Olay Dinleyicileri
 */
function registerBotanicHandlers(io, socket, players, helpers) {

    // 1. TARLA BİLGİSİNİ SORGULA
    socket.on('get_farm_plots', (data) => {
        let p = players[socket.id];
        if (!p) return;

        let targetOwner = (data && data.owner) ? data.owner : p.name;
        let uKey = dataManager.findUserKey(targetOwner) || targetOwner;
        let uData = dataManager.persistentData.users[uKey];

        if (!uData) {
            socket.emit('farmPlotsData', { owner: targetOwner, plots: createDefaultFarmPlots(), now: Date.now() });
            return;
        }

        let plots = getUserFarmPlots(uData);
        socket.emit('farmPlotsData', {
            owner: targetOwner,
            plots: plots,
            now: Date.now(),
            timeMultiplier: TIME_MULTIPLIER
        });
    });

    // 2. TOHUM EKİMİ (EMPTY -> SEED)
    socket.on('plant_seed', (data) => {
        let p = players[socket.id];
        if (!p || !data) return;

        let plotIndex = parseInt(data.plotIndex, 10);
        let seedType = String(data.seedType || '').toLowerCase(); // "gul" | "papatya" | "orkide"

        if (isNaN(plotIndex) || plotIndex < 0 || plotIndex > 8) {
            socket.emit('gameError', "Geçersiz tarla parseli!");
            return;
        }
        const ALLOWED_SEEDS = ['papatya', 'lale', 'gul', 'sakayik', 'lavanta', 'orkide', 'aycicegi'];
        if (!ALLOWED_SEEDS.includes(seedType)) {
            socket.emit('gameError', "Geçersiz tohum türü!");
            return;
        }

        let uKey = dataManager.findUserKey(p.name) || p.name;
        let uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        let plots = getUserFarmPlots(uData);
        let targetPlot = plots[plotIndex];

        if (targetPlot.state !== 'EMPTY') {
            socket.emit('gameError', "Bu parsel boş değil! Önce mevcut bitkiyi hasat edin veya temizleyin.");
            return;
        }

        let seedPropKey = `props_tohum_${seedType}`;
        let userSeeds = (uData.propInventory && uData.propInventory[seedPropKey]) || 0;
        if (userSeeds < 1) {
            socket.emit('gameError', `Çantanızda ${BOTANIC_PRICES.supplies[seedPropKey]?.name || 'tohum'} kalmamış! Botanik Dükkanından satın alabilirsiniz.`);
            return;
        }

        // Tohumu tüket
        uData.propInventory[seedPropKey] -= 1;
        if (uData.propInventory[seedPropKey] <= 0) {
            delete uData.propInventory[seedPropKey];
        }

        // Parseli Ek
        let now = Date.now();
        targetPlot.state = 'SEED';
        targetPlot.seedType = seedType;
        targetPlot.plantedAt = now;
        targetPlot.stageChangedAt = now;
        targetPlot.expiresAt = null;
        targetPlot.cleaningEndsAt = null;
        targetPlot.hasWater = false;
        targetPlot.hasFertilizer = false;

        dataManager.savePersistentData();

        socket.emit('propInventoryUpdate', uData.propInventory);
        io.emit('farmPlotsUpdate', { owner: p.name, plots: plots, now: now });
        socket.emit('systemMessage', `🌱 Parsel #${plotIndex + 1}'e ${seedType.toUpperCase()} tohumu başarıyla ekildi! (1 Saat sonra fide olacak)`);
        socket.emit('farmActionSuccess', { type: 'plant', plotIndex: plotIndex, seedType: seedType });
    });

    // 3. SU VE GÜBRE VERME (SAPLING_READY -> FLOWER_GROWING)
    socket.on('water_and_fertilize', (data) => {
        let p = players[socket.id];
        if (!p || !data) return;

        let plotIndex = parseInt(data.plotIndex, 10);
        if (isNaN(plotIndex) || plotIndex < 0 || plotIndex > 8) return;

        let uKey = dataManager.findUserKey(p.name) || p.name;
        let uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        let plots = getUserFarmPlots(uData);
        let targetPlot = plots[plotIndex];

        if (targetPlot.state !== 'SAPLING_READY') {
            socket.emit('gameError', "Yalnızca fide aşamasındaki tarlaya su ve gübre verilebilir!");
            return;
        }

        let waterCount = (uData.propInventory && uData.propInventory['props_bitki_suyu']) || 0;
        let fertCount = (uData.propInventory && uData.propInventory['props_organik_gubre']) || 0;

        if (waterCount < 1 || fertCount < 1) {
            socket.emit('gameError', "💧+🌿 Fideyi çiçeğe dönüştürmek için çantanızda 1 adet Özel Bitki Suyu ve 1 adet Organik Gübre olmalıdır!");
            return;
        }

        // Malzemeleri tüket
        uData.propInventory['props_bitki_suyu'] -= 1;
        if (uData.propInventory['props_bitki_suyu'] <= 0) delete uData.propInventory['props_bitki_suyu'];

        uData.propInventory['props_organik_gubre'] -= 1;
        if (uData.propInventory['props_organik_gubre'] <= 0) delete uData.propInventory['props_organik_gubre'];

        // Durumu Çiçek Büyümesine geçir
        let now = Date.now();
        targetPlot.state = 'FLOWER_GROWING';
        targetPlot.hasWater = true;
        targetPlot.hasFertilizer = true;
        targetPlot.stageChangedAt = now;
        targetPlot.expiresAt = null;

        dataManager.savePersistentData();

        socket.emit('propInventoryUpdate', uData.propInventory);
        io.emit('farmPlotsUpdate', { owner: p.name, plots: plots, now: now });
        socket.emit('systemMessage', `💧🌿 Parsel #${plotIndex + 1}'deki fideye can suyu ve gübre verildi! Çiçek açmaya başladı (2 Saat sürecek).`);
        socket.emit('farmActionSuccess', { type: 'water_fertilize', plotIndex: plotIndex });
    });

    // 4. HASAT ETME (FİDE veya ÇİÇEK HASADI)
    socket.on('harvest_plot', (data) => {
        let p = players[socket.id];
        if (!p || !data) return;

        let plotIndex = parseInt(data.plotIndex, 10);
        if (isNaN(plotIndex) || plotIndex < 0 || plotIndex > 8) return;

        let uKey = dataManager.findUserKey(p.name) || p.name;
        let uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        let plots = getUserFarmPlots(uData);
        let targetPlot = plots[plotIndex];
        let seedType = targetPlot.seedType || 'gul';

        if (!uData.propInventory) uData.propInventory = {};

        // A) Fide Hasadı
        if (targetPlot.state === 'SAPLING_READY') {
            let fideKey = `props_fide_${seedType}`;
            uData.propInventory[fideKey] = (uData.propInventory[fideKey] || 0) + 1;

            // Parseli temizle
            targetPlot.state = 'EMPTY';
            targetPlot.seedType = null;
            targetPlot.plantedAt = null;
            targetPlot.stageChangedAt = null;
            targetPlot.expiresAt = null;
            targetPlot.hasWater = false;
            targetPlot.hasFertilizer = false;

            // Botanik Rozeti Puanı & Hasat Sayacı Ekle
            uData.botanicHarvestCount = (uData.botanicHarvestCount || 0) + 1;
            let fidePts = (BOTANIC_BADGE_POINTS[seedType] && BOTANIC_BADGE_POINTS[seedType].fide) || 1;
            uData.botanicHarvestPoints = (uData.botanicHarvestPoints || 0) + fidePts;
            dataManager.checkAndAwardBadgeLevelUp(p.name, 'botanic');

            // Seviye XP Dağıtımı (Fide: papatya, lale, gul -> 2 XP | sakayik, lavanta, orkide, aycicegi -> 4 XP)
            const fideXP = ['papatya', 'lale', 'gul'].includes(seedType) ? 2 : 4;
            addPlayerXP(io, players, socket.id, uData, fideXP, 'tarim');

            dataManager.savePersistentData();

            socket.emit('propInventoryUpdate', uData.propInventory);
            io.emit('farmPlotsUpdate', { owner: p.name, plots: plots, now: Date.now() });
            socket.emit('systemMessage', `🌿 Parsel #${plotIndex + 1}'den 1 adet ${seedType.toUpperCase()} FİDESİ hasat edildi! Eşya Çantanıza eklendi.`);
            socket.emit('farmActionSuccess', { type: 'harvest_fide', plotIndex: plotIndex, seedType: seedType });
            return;
        }

        // B) Olgun Çiçek Hasadı
        if (targetPlot.state === 'FLOWER_READY') {
            let flowerKey = `props_cicek_${seedType}`;
            uData.propInventory[flowerKey] = (uData.propInventory[flowerKey] || 0) + 1;

            // Parseli temizle
            targetPlot.state = 'EMPTY';
            targetPlot.seedType = null;
            targetPlot.plantedAt = null;
            targetPlot.stageChangedAt = null;
            targetPlot.expiresAt = null;
            targetPlot.hasWater = false;
            targetPlot.hasFertilizer = false;

            // Botanik Rozeti Puanı & Hasat Sayacı Ekle (Arka planda sessizce kaydedilir)
            uData.botanicHarvestCount = (uData.botanicHarvestCount || 0) + 1;
            let flowerPts = (BOTANIC_BADGE_POINTS[seedType] && BOTANIC_BADGE_POINTS[seedType].flower) || 2;
            uData.botanicHarvestPoints = (uData.botanicHarvestPoints || 0) + flowerPts;
            dataManager.checkAndAwardBadgeLevelUp(p.name, 'botanic');

            // Seviye XP Dağıtımı (Çiçek: papatya, lale, gul -> 4 XP | sakayik, lavanta, orkide, aycicegi -> 6 XP)
            const flowerXP = ['papatya', 'lale', 'gul'].includes(seedType) ? 4 : 6;
            addPlayerXP(io, players, socket.id, uData, flowerXP, 'tarim');

            dataManager.savePersistentData();

            socket.emit('propInventoryUpdate', uData.propInventory);
            io.emit('farmPlotsUpdate', { owner: p.name, plots: plots, now: Date.now() });
            socket.emit('systemMessage', `🌸 Parsel #${plotIndex + 1}'den muhteşem bir ${seedType.toUpperCase()} ÇİÇEĞİ hasat edildi! Çantanızdan elinize alabilir veya Tüccara satabilirsiniz.`);
            socket.emit('farmActionSuccess', { type: 'harvest_flower', plotIndex: plotIndex, seedType: seedType });
            return;
        }

        socket.emit('gameError', "Bu parsel henüz hasat edilmeye hazır değil!");
    });

    // 5. YANAN TARLAYI CEZAYLA TEMİZLEME (WITHERED -> CLEANING -> EMPTY)
    socket.on('clean_withered_plot', (data) => {
        let p = players[socket.id];
        if (!p || !data) return;

        let plotIndex = parseInt(data.plotIndex, 10);
        if (isNaN(plotIndex) || plotIndex < 0 || plotIndex > 8) return;

        let uKey = dataManager.findUserKey(p.name) || p.name;
        let uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        let plots = getUserFarmPlots(uData);
        let targetPlot = plots[plotIndex];

        if (targetPlot.state !== 'WITHERED') {
            socket.emit('gameError', "Yalnızca kurumuş veya yanmış tarlalar temizlik gerektirir!");
            return;
        }

        let userMoney = Number(uData.money) || 0;
        if (userMoney < CLEANING_COST) {
            socket.emit('gameError', `❌ Yanan tarlayı temizlemek için ${CLEANING_COST} TL gereklidir. Bakiyeniz yetersiz!`);
            return;
        }

        // 50 TL Ceza Kesintisi
        uData.money = userMoney - CLEANING_COST;
        p.money = uData.money;

        let now = Date.now();
        targetPlot.state = 'CLEANING';
        targetPlot.cleaningEndsAt = now + CLEANING_DURATION_MS; // 30 Saniye

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', uData.money);
        io.emit('farmPlotsUpdate', { owner: p.name, plots: plots, now: now });
        socket.emit('systemMessage', `🧹 50 TL temizlik bedeli ödendi! Parsel #${plotIndex + 1} temizleniyor (30 saniye sürer)...`);
        socket.emit('farmActionSuccess', { type: 'clean_started', plotIndex: plotIndex });
    });

    // 6. BOTANİK MARKET VERİLERİ (NPC 1 & NPC 2)
    socket.on('get_botanic_market_data', () => {
        let stock = getBotanicMarketStock();
        socket.emit('botanicMarketData', {
            prices: BOTANIC_PRICES,
            durations: CROP_DURATIONS,
            stock: stock,
            timeMultiplier: TIME_MULTIPLIER
        });
    });

    // 7. NPC 1 - TEDARİKÇİ DEFNE'DEN MALZEME ALMA
    socket.on('botanic_buy_supply', (data) => {
        let p = players[socket.id];
        if (!p || !data) return;

        let itemKey = String(data.itemKey || '').trim();
        let qty = Math.max(1, Math.min(50, parseInt(data.quantity || 1, 10)));

        let itemInfo = BOTANIC_PRICES.supplies[itemKey];
        if (!itemInfo) {
            socket.emit('gameError', "Geçersiz tedarik malzemesi!");
            return;
        }

        let totalCost = itemInfo.price * qty;
        let uKey = dataManager.findUserKey(p.name) || p.name;
        let uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        let userMoney = Number(uData.money) || 0;
        if (userMoney < totalCost) {
            socket.emit('gameError', `❌ Yetersiz bakiye! ${qty} adet ${itemInfo.name} için ${totalCost} TL gereklidir.`);
            return;
        }

        uData.money = userMoney - totalCost;
        p.money = uData.money;

        if (!uData.propInventory) uData.propInventory = {};
        uData.propInventory[itemKey] = (uData.propInventory[itemKey] || 0) + qty;

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', uData.money);
        socket.emit('propInventoryUpdate', uData.propInventory);
        socket.emit('systemMessage', `🌿 Botanikçi Defne'den ${qty} adet ${itemInfo.name} satın aldınız (-${totalCost} TL).`);
        socket.emit('botanicBuySuccess', { itemKey, qty, totalCost });
    });

    // 8. NPC 2 - ÇİÇEK TÜCCARI RASİM'E FİDE VEYA ÇİÇEK SATMA (OYUNCU ARZI)
    socket.on('botanic_sell_crop', (data) => {
        let p = players[socket.id];
        if (!p || !data) return;

        let cropType = String(data.cropType || '').toLowerCase(); // "gul" | "papatya" | "orkide"
        let isFlower = !!data.isFlower;
        let qty = Math.max(1, Math.min(50, parseInt(data.quantity || 1, 10)));

        let cropTable = isFlower ? BOTANIC_PRICES.crops.flower[cropType] : BOTANIC_PRICES.crops.fide[cropType];
        if (!cropTable) {
            socket.emit('gameError', "Geçersiz ürün!");
            return;
        }

        let itemKey = cropTable.key;
        let uKey = dataManager.findUserKey(p.name) || p.name;
        let uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        let userCount = (uData.propInventory && uData.propInventory[itemKey]) || 0;
        if (userCount < qty) {
            socket.emit('gameError', `❌ Çantanızda satmak için yeterli ${cropTable.name} yok! (Mevcut: ${userCount})`);
            return;
        }

        // Envanterden düş
        uData.propInventory[itemKey] -= qty;
        if (uData.propInventory[itemKey] <= 0) delete uData.propInventory[itemKey];

        // Parayı ver
        let earn = cropTable.sellPrice * qty;
        uData.money = (Number(uData.money) || 0) + earn;
        p.money = uData.money;

        // EĞER ÇİÇEK İSE OYUNCU BORSA STOKLARINI ARTIR! (Kıtlık Ekonomisi)
        let stock = getBotanicMarketStock();
        if (isFlower) {
            stock[cropType] = (stock[cropType] || 0) + qty;
        }

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', uData.money);
        socket.emit('propInventoryUpdate', uData.propInventory);
        io.emit('botanicMarketStockUpdate', stock);
        socket.emit('systemMessage', `💰 Çiçek Tüccarı Rasim'e ${qty} adet ${cropTable.name} sattınız (+${earn} TL).`);
        socket.emit('botanicSellSuccess', { cropType, isFlower, qty, earn });
    });

    // 9. NPC 2 - OYUNCU BORSASI STOĞUNDAN ÇİÇEK SATIN ALMA
    socket.on('botanic_buy_flower', (data) => {
        let p = players[socket.id];
        if (!p || !data) return;

        let flowerType = String(data.flowerType || '').toLowerCase(); // "gul" | "papatya" | "orkide"
        let qty = Math.max(1, Math.min(20, parseInt(data.quantity || 1, 10)));

        let flowerInfo = BOTANIC_PRICES.crops.flower[flowerType];
        if (!flowerInfo) {
            socket.emit('gameError', "Geçersiz çiçek türü!");
            return;
        }

        let stock = getBotanicMarketStock();
        let curStock = stock[flowerType] || 0;

        if (curStock < qty) {
            socket.emit('gameError', `⚠️ STOKTA YOK - ÜRETİCİ KITLIĞI VAR! (${flowerInfo.name} mevcut stok: ${curStock})`);
            return;
        }

        let totalCost = flowerInfo.marketBuyPrice * qty;
        let uKey = dataManager.findUserKey(p.name) || p.name;
        let uData = dataManager.persistentData.users[uKey];
        if (!uData) return;

        let userMoney = Number(uData.money) || 0;
        if (userMoney < totalCost) {
            socket.emit('gameError', `❌ Yetersiz bakiye! ${qty} adet ${flowerInfo.name} için ${totalCost} TL gereklidir.`);
            return;
        }

        // Parayı al, çiçeği ver, stoğu eksilt
        uData.money = userMoney - totalCost;
        p.money = uData.money;

        stock[flowerType] -= qty;

        let itemKey = flowerInfo.key;
        if (!uData.propInventory) uData.propInventory = {};
        uData.propInventory[itemKey] = (uData.propInventory[itemKey] || 0) + qty;

        dataManager.savePersistentData();

        socket.emit('moneyUpdate', uData.money);
        socket.emit('propInventoryUpdate', uData.propInventory);
        io.emit('botanicMarketStockUpdate', stock);
        socket.emit('systemMessage', `💐 Çiçek Tüccarı'ndan ${qty} adet ${flowerInfo.name} satın aldınız (-${totalCost} TL). Elinizde tutabilir veya hediye edebilirsiniz!`);
        socket.emit('botanicBuySuccess', { flowerType, qty, totalCost });
    });
}

module.exports = {
    TIME_MULTIPLIER,
    CROP_DURATIONS,
    BOTANIC_PRICES,
    startBotanicEngine,
    registerBotanicHandlers,
    getBotanicMarketStock,
    getUserFarmPlots
};

