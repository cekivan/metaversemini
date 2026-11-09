// src/handlers/mysteryBoxHandler.js - Şanslı Kutu (Mystery Box & Gacha) ve Dinamik Fiyatlı RNG Sistemi
const config = require('../config');
const { checkRateLimit } = require('../utils/securityUtils');
const petManager = require('../petManager');
const defaultDataManager = require('../dataManager');

const CLOTHES_POOL = [
    // Şapkalar
    { cat: 'hats', id: 'bere', name: 'Kırmızı Bere', icon: '🔴' },
    { cat: 'hats', id: 'kasket', name: 'Kıraathane Kasketi', icon: '🧢' },
    { cat: 'hats', id: 'fes', name: 'Osmanlı Fesi', icon: '🏮' },
    { cat: 'hats', id: 'cowboy', name: 'Kovboy Şapkası', icon: '🤠' },
    { cat: 'hats', id: 'korsan', name: 'Korsan Kaptanı', icon: '🏴‍☠️' },
    { cat: 'hats', id: 'sihirbaz', name: 'Sihirbaz Silindiri', icon: '🎩' },
    { cat: 'hats', id: 'kulaklik', name: 'DJ Kulaklığı', icon: '🎧' },
    { cat: 'hats', id: 'beret_pink', name: 'Pembe Fransız Bere', icon: '🌸' },
    { cat: 'hats', id: 'crown', name: 'Prenses Tacı', icon: '👑' },
    { cat: 'hats', id: 'baret_sari', name: 'Sarı Madenci Bareti', icon: '👷' },
    { cat: 'hats', id: 'baret_beyaz', name: 'Beyaz Mühendis Bareti', icon: '⛑️' },
    { cat: 'hats', id: 'baret_turuncu', name: 'Turuncu Formen Bareti', icon: '⛑️' },
    { cat: 'hats', id: 'baret_mavi', name: 'Mavi Teknisyen Bareti', icon: '⛑️' },
    { cat: 'hats', id: 'baret_kirmizi', name: 'Kırmızı İSG Bareti', icon: '⛑️' },
    { cat: 'hats', id: 'baret_yesil', name: 'Yeşil Çevre Bareti', icon: '⛑️' },
    // Saçlar
    { cat: 'hair', id: 'hair_long', name: 'Uzun Düz Saç', icon: '👩' },
    { cat: 'hair', id: 'hair_wavy', name: 'Dalgalı Saç', icon: '💇‍♀️' },
    { cat: 'hair', id: 'hair_ponytail', name: 'At Kuyruğu', icon: '👱‍♀️' },
    { cat: 'hair', id: 'hair_braids', name: 'Örgülü Saç', icon: '👧' },
    { cat: 'hair', id: 'hair_bob', name: 'Küt Kesim Saç', icon: '👩‍🦰' },
    { cat: 'hair', id: 'hair_hijab', name: 'Şık Başörtüsü', icon: '🧕' },
    { cat: 'hair', id: 'hair_blonde_curls', name: 'Altın Bukleli Saç', icon: '👱‍♀️' },
    { cat: 'hair', id: 'hair_bun_chopsticks', name: 'Zarif Topuz & Toka', icon: '🌸' },
    { cat: 'hair', id: 'hair_redhead_wavy', name: 'Kızıl Dalgalı Saç', icon: '👩‍🦰' },
    { cat: 'hair', id: 'hair_pigtails_ribbon', name: 'Kurdeleli Saç', icon: '🎀' },
    { cat: 'hair', id: 'hair_curly_brown', name: 'Kıvırcık Kahve Saç', icon: '👩‍🦱' },
    // Yüz
    { cat: 'faces', id: 'mustache', name: 'Pala Bıyık', icon: '🥸' },
    { cat: 'faces', id: 'sunglasses', name: 'Havalı Gözlük', icon: '🕶️' },
    { cat: 'faces', id: 'beard', name: 'Kirli Sakal', icon: '🧔' },
    // Kıyafet Takımları
    { cat: 'outfits', id: 'outfit_c2_gentleman', name: 'Beyefendi Yelekli Takım', icon: '🤵' },
    { cat: 'outfits', id: 'outfit_c2_street_cool', name: 'Sokak Bomber & Jean', icon: '🧥' },
    { cat: 'outfits', id: 'outfit_c2_casual_polo', name: 'Marin Polo & Chino', icon: '👕' },
    { cat: 'outfits', id: 'outfit_c2_femme_chic', name: 'Pastel Blazer Takım', icon: '💃' },
    { cat: 'outfits', id: 'dress_pink', name: 'Pembe Çiçekli Elbise', icon: '👗' },
    { cat: 'outfits', id: 'dress_black', name: 'Zarif Siyah Gece Elbisesi', icon: '👗' },
    { cat: 'outfits', id: 'dress_red', name: 'Kırmızı Kokteyl Elbisesi', icon: '💃' },
    { cat: 'outfits', id: 'dress_emerald', name: 'Zümrüt Yeşil İpek Elbise', icon: '👗' },
    { cat: 'outfits', id: 'dress_lavender', name: 'Lavanta Bahar Elbisesi', icon: '🌸' },
    { cat: 'outfits', id: 'dress_bridal', name: 'Masalsı Beyaz Gelinlik', icon: '👰' },
    { cat: 'outfits', id: 'outfit_goth', name: 'Gotik Elbise Kombini', icon: '🖤' },
    { cat: 'outfits', id: 'outfit_business', name: 'Pudra Şık Kadın Takımı', icon: '🧥' },
    { cat: 'outfits', id: 'outfit_boho', name: 'Bohem Şifon Elbise', icon: '🌻' },
    { cat: 'outfits', id: 'outfit_sporty', name: 'Pastel Fitness Takımı', icon: '🎽' },
    { cat: 'outfits', id: 'dress_vintage_polka', name: 'Vintage Puantiye Elbise', icon: '💃' },
    { cat: 'outfits', id: 'dress_ocean_blue', name: 'Okyanus Mavisi Elbise', icon: '🌊' },
    { cat: 'outfits', id: 'outfit_turtleneck_skirt', name: 'Krem Balıkçı & Ekose', icon: '🧣' },
    // Tişörtler
    { cat: 'tshirts', id: 'polo', name: 'Beyaz Polo Yaka', icon: '👔' },
    { cat: 'tshirts', id: 'hoodie', name: 'Oversize Hoodie', icon: '🧥' },
    { cat: 'tshirts', id: 'leather', name: 'Klasik Deri Ceket', icon: '🥼' },
    { cat: 'tshirts', id: 'skirt_crop', name: 'Pembe Crop Üst', icon: '👚' },
    { cat: 'tshirts', id: 'skirt_denim', name: 'Kot Ceket & Üst', icon: '🎽' },
    // Pantolonlar
    { cat: 'pants', id: 'pants_classic_black', name: 'Klasik Kumaş Siyah', icon: '👖' },
    { cat: 'pants', id: 'pants_classic_beige', name: 'Klasik Bej Chino', icon: '👖' },
    { cat: 'pants', id: 'pants_classic_cargo_olive', name: 'Zeytin Yeşili Kargo', icon: '👖' },
    { cat: 'pants', id: 'pants_classic_white_skirt', name: 'Beyaz Pileli Etek', icon: '👗' },
    // Ayakkabılar
    { cat: 'shoes', id: 'classic', name: 'Kösele Klasik Ayakkabı', icon: '👞' },
    { cat: 'shoes', id: 'boots', name: 'Kışlık Bot', icon: '🥾' },
    { cat: 'shoes', id: 'heels', name: 'Topuklu Stiletto', icon: '👠' },
    { cat: 'shoes', id: 'heels_gold', name: 'Altın Simli Stiletto', icon: '👠' },
    { cat: 'shoes', id: 'boots_thigh_high', name: 'Diz Üstü Süet Çizme', icon: '👢' },
    { cat: 'shoes', id: 'sandals_gladiator', name: 'Gladyatör Sandalet', icon: '👡' },
    // Saatler
    { cat: 'watches', id: 'watch_gold_rolex', name: 'Altın Prestij Saat', icon: '⌚' },
    { cat: 'watches', id: 'watch_leather_classic', name: 'Deri Kordonlu Saat', icon: '⌚' },
    { cat: 'watches', id: 'watch_cyber_sport', name: 'Neon Spor Saat', icon: '⏱️' }
];

const PROPS_POOL = [
    { cat: 'props', id: 'sigara', name: 'Tüten Sigara', icon: '🚬' }, // 10.000 TL Jackpot
    { cat: 'props', id: 'nargile', name: 'Tüten Nargile', icon: '💨' },
    { cat: 'props', id: 'tespih2', name: 'Çift Katmanlı Tespih', icon: '📿' },
    { cat: 'props', id: 'tespih', name: 'Kehribar Tespih', icon: '📿' },
    { cat: 'props', id: 'gitar', name: 'Akustik Gitar', icon: '🎸' },
    { cat: 'props', id: 'oyuncak_araba', name: 'Küçük Oyuncak Araba', icon: '🚗' },
    { cat: 'props', id: 'kupa', name: 'Şampiyonluk Kupası', icon: '🏆' },
    { cat: 'props', id: 'asagold', name: 'Yıldızlı Büyü Asası', icon: '🪄' },
    { cat: 'props', id: 'kilic', name: 'Orta Çağ Kılıcı', icon: '🗡️' },
    { cat: 'props', id: 'baglama', name: 'Anadolu Bağlaması', icon: '🪕' },
    { cat: 'props', id: 'sirtcantasi', name: 'Gezgin Sırt Çantası', icon: '🎒' },
    { cat: 'props', id: 'olta', name: 'Balıkçı Oltası', icon: '🎣' },
    { cat: 'props', id: 'gazoz', name: 'Nostaljik Gazoz', icon: '🍾' },
    { cat: 'props', id: 'balon', name: 'Uçan Balon', icon: '🎈' },
    { cat: 'props', id: 'kahve', name: 'Közde Türk Kahvesi', icon: '☕' },
    { cat: 'props', id: 'cay', name: 'İnce Belli Çay', icon: '☕' },
    { cat: 'props', id: 'oralet', name: 'Sıcak Kıraathane Oraleti', icon: '🍵' },
    { cat: 'props', id: 'oyuncak_dinozor', name: 'Sevimli Peluş Dinozor', icon: '🦖' },
    { cat: 'props', id: 'su_tabancasi', name: 'Neon Oyuncak Su Tabancası', icon: '🔫' },
    { cat: 'props', id: 'drone', name: 'Uçan Kameralı Mini Drone', icon: '🛸' },
    { cat: 'props', id: 'supurge', name: 'Modern Elektrikli Süpürge', icon: '🧹' },
    { cat: 'props', id: 'turk_bayragi', name: 'Şanlı Türk Bayrağı', icon: '🇹🇷' },
    { cat: 'props', id: 'bayrak_gs', name: 'Galatasaray Taraftar Bayrağı', icon: '🚩' },
    { cat: 'props', id: 'bayrak_fb', name: 'Fenerbahçe Taraftar Bayrağı', icon: '🚩' },
    { cat: 'props', id: 'bayrak_bjk', name: 'Beşiktaş Taraftar Bayrağı', icon: '🚩' },
    { cat: 'props', id: 'bayrak_ts', name: 'Trabzonspor Taraftar Bayrağı', icon: '🚩' }
];

function getDynamicPrice(category, id) {
    let normCat = (category === 'watch' || category === 'watches') ? 'watches' : (category.endsWith('s') ? category : (category + 's'));
    let itemKey = `${normCat}_${id}`;
    let altKey = id.startsWith(normCat + '_') ? id : null;
    if (config.WARDROBE_ITEM_PRICES[itemKey] !== undefined) return config.WARDROBE_ITEM_PRICES[itemKey];
    if (altKey && config.WARDROBE_ITEM_PRICES[altKey] !== undefined) return config.WARDROBE_ITEM_PRICES[altKey];
    if (config.WARDROBE_ITEM_PRICES[id] !== undefined) return config.WARDROBE_ITEM_PRICES[id];
    return 150;
}

// Fiyatlara bağlı dinamik ters orantılı RNG algoritması
function rollWeightedDynamicItem(pool) {
    let weighted = pool.map(item => {
        let cost = getDynamicPrice(item.cat, item.id);
        // Ürün fiyatı ne kadar yüksekse çıkma olasılığı o kadar düşük olur
        // Gelecekte fiyatlar ne kadar değişirse değişsin anlık fiyat üzerinden dinamik hesaplanır
        let weight = 1 / Math.pow(Math.max(cost, 50), 0.75);
        // Sigaranın RNG'sini bi tık manuel arttır (3.5 kat ağırlık bonusu)
        if (item.id === 'sigara') {
            weight *= 3.5;
        }
        return { item, cost, weight };
    });

    let total = weighted.reduce((acc, curr) => acc + curr.weight, 0);
    let rand = Math.random() * total;
    let running = 0;

    for (const w of weighted) {
        running += w.weight;
        if (rand <= running) {
            return { ...w.item, cost: w.cost };
        }
    }
    return { ...weighted[0].item, cost: weighted[0].cost };
}

function isPropOwned(userData, item) {
    if (!userData) return false;
    const itemKey = `props_${item.id}`;
    const pInv = userData.propInventory || {};
    const inv = userData.inventory || [];
    if ((pInv[itemKey] && pInv[itemKey] > 0) || (pInv[item.id] && pInv[item.id] > 0)) return true;
    if (inv.includes(itemKey) || inv.includes(item.id)) return true;
    if (userData.heldItem === item.id || userData.heldItem === itemKey) return true;
    if (userData.avatar && (userData.avatar.heldItem === item.id || userData.avatar.heldItem === itemKey)) return true;
    return false;
}

function isClothesOwned(userData, item) {
    if (!userData) return false;
    const normCat = (item.cat === 'watch' || item.cat === 'watches') ? 'watches' : ((item.cat === 'hair' || item.cat === 'hairs') ? 'hair' : (item.cat.endsWith('s') ? item.cat : (item.cat + 's')));
    const itemKey = `${normCat}_${item.id}`;
    const altKey = item.id.startsWith(normCat + '_') ? item.id : null;
    const inv = userData.inventory || [];
    if (inv.includes(itemKey) || (altKey && inv.includes(altKey)) || inv.includes(item.id)) return true;
    if (normCat === 'hair' && (inv.includes(`hats_${item.id}`) || inv.includes(`hairs_${item.id}`))) return true;
    const singleCat = (normCat === 'watches' || normCat === 'watch') ? 'watch' : ((normCat === 'hair' || normCat === 'hairs') ? 'hair' : (normCat.endsWith('s') ? normCat.slice(0, -1) : normCat));
    if (userData.avatar) {
        if (userData.avatar[singleCat] === item.id || userData.avatar[normCat] === item.id) return true;
        if (normCat === 'tshirts' && (userData.avatar.shirt === item.id || userData.avatar.tshirt === item.id)) return true;
        if (normCat === 'pants' && userData.avatar.pants === item.id) return true;
        if (normCat === 'shoes' && userData.avatar.shoes === item.id) return true;
    }
    return false;
}

function registerMysteryBoxHandlers(io, socket, players, dataManager = defaultDataManager) {
    socket.on('openMysteryBox', (data) => {
        if (!players[socket.id] || !data) return;
        if (!checkRateLimit(socket, 'openMysteryBox', 5, 2000)) return;
        let username = players[socket.id].name;
        let uKey = (dataManager.findUserKey ? dataManager.findUserKey(username) : null) || username;
        let userData = dataManager.persistentData.users[uKey];
        if (!userData) return;

        let boxType = data.type; // 'clothes', 'props', 'pet'
        const BOX_COSTS = config.MYSTERY_BOX_PRICES || { clothes: 500, props: 1500, pet: 1750 };
        const boxCost = BOX_COSTS[boxType];

        if (!boxCost) {
            socket.emit('gameError', 'Geçersiz kutu tipi!');
            return;
        }

        if (userData.money < boxCost) {
            socket.emit('gameError', `Yetersiz bakiye! Bu kutu ${boxCost.toLocaleString()} TL. Mevcut bakiyeniz: ${userData.money.toLocaleString()} TL.`);
            return;
        }

        // Parayı tahsil et
        userData.money -= boxCost;
        players[socket.id].money = userData.money;

        if (boxType === 'pet') {
            // 3. Pet Kutusu: 1750 TL, tüm petler eşit ihtimalle (%33.33)
            const petOptions = [
                { type: 'cat', name: 'Sevimli Kedi', emoji: '🐱', desc: '15 dakika boyunca yanından ayrılmaz' },
                { type: 'dog', name: 'Sadık Köpek', emoji: '🐶', desc: '15 dakika boyunca yanından ayrılmaz' },
                { type: 'mouse', name: 'Hızlı Fare', emoji: '🐭', desc: '15 dakika boyunca yanından ayrılmaz' }
            ];
            const chosenPet = petOptions[Math.floor(Math.random() * petOptions.length)];

            // Pet'i 15 dakikalığına doğur
            const newPet = petManager.spawnPet(socket.id, username, chosenPet.type);

            dataManager.savePersistentData();
            socket.emit('moneyUpdate', userData.money);
            socket.emit('mysteryBoxReward', {
                boxType: 'pet',
                boxCost: boxCost,
                reward: {
                    type: chosenPet.type,
                    name: chosenPet.name,
                    icon: chosenPet.emoji,
                    cost: 2500,
                    isPet: true,
                    durationMin: 15,
                    rarity: 'Efsanevi Yoldaş'
                }
            });

            socket.emit('systemMessage', `🎁 Şanslı Pet Kutusunu açtın! Tebrikler, 15 dakikalık ${chosenPet.name} (${chosenPet.emoji}) kazandın!`);
            io.to(players[socket.id].room).emit('systemMessage', `✨ ${username} Şanslı Pet Kutusundan 15 dakikalık ${chosenPet.name} çıkardı! 🐾`);
            return;
        }

        if (boxType === 'props') {
            // 2. El Eşyaları Kutusu: 1500 TL (ZATEN SAHİP OLUNAN EŞYALAR ÇIKMAZ)
            let unownedProps = PROPS_POOL.filter(p => !isPropOwned(userData, p));

            if (unownedProps.length === 0) {
                // Oyuncu tüm el eşyalarına zaten sahip! Parayı iade et
                userData.money += boxCost;
                players[socket.id].money = userData.money;
                dataManager.savePersistentData();
                socket.emit('moneyUpdate', userData.money);
                socket.emit('gameError', 'Tebrikler! Oyundaki tüm el eşyalarına zaten sahipsiniz!');
                return;
            }

            let chosen = rollWeightedDynamicItem(unownedProps);
            let itemKey = `props_${chosen.id}`;

            if (!userData.propInventory) userData.propInventory = {};
            userData.propInventory[itemKey] = (userData.propInventory[itemKey] || 0) + 1;

            if (!userData.inventory) userData.inventory = [];
            if (!userData.inventory.includes(itemKey)) userData.inventory.push(itemKey);

            dataManager.savePersistentData();
            socket.emit('moneyUpdate', userData.money);
            socket.emit('propInventoryUpdate', userData.propInventory);
            socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });

            let rarity = chosen.cost >= 5000 ? 'Efsanevi Jackpot' : (chosen.cost >= 400 ? 'Nadir' : 'Yaygın');

            socket.emit('mysteryBoxReward', {
                boxType: 'props',
                boxCost: boxCost,
                reward: {
                    category: 'props',
                    id: chosen.id,
                    name: chosen.name,
                    icon: chosen.icon,
                    cost: chosen.cost,
                    rarity: rarity,
                    isJackpot: chosen.id === 'sigara',
                    alreadyOwned: false
                }
            });

            if (chosen.id === 'sigara') {
                io.to(players[socket.id].room).emit('systemMessage', `🔥 JACKPOT! ${username} Şanslı Kutudan 10.000 TL değerinde TÜTEN SİGARA (🚬) çıkardı! 🎉`);
            } else {
                socket.emit('systemMessage', `🎁 Şanslı El Eşyası Kutusunu açtın! Kazandığın: ${chosen.name} (${chosen.icon}) - Değeri: ${chosen.cost.toLocaleString()} TL.`);
            }
            return;
        }

        if (boxType === 'clothes') {
            // 1. Kıyafet Kutusu: 500 TL (ZATEN SAHİP OLUNAN KIYAFETLER ÇIKMAZ)
            let unownedClothes = CLOTHES_POOL.filter(item => !isClothesOwned(userData, item));

            if (unownedClothes.length === 0) {
                // Oyuncu tüm kıyafet modellerine zaten sahip! Parayı iade et
                userData.money += boxCost;
                players[socket.id].money = userData.money;
                dataManager.savePersistentData();
                socket.emit('moneyUpdate', userData.money);
                socket.emit('gameError', 'Tebrikler! Oyundaki tüm kıyafet modellerine zaten sahipsiniz!');
                return;
            }

            let chosen = rollWeightedDynamicItem(unownedClothes);
            let normCat = (chosen.cat === 'watch' || chosen.cat === 'watches') ? 'watches' : ((chosen.cat === 'hair' || chosen.cat === 'hairs') ? 'hair' : (chosen.cat.endsWith('s') ? chosen.cat : (chosen.cat + 's')));
            let itemKey = `${normCat}_${chosen.id}`;

            if (!userData.inventory) userData.inventory = [];
            if (!userData.inventory.includes(itemKey)) {
                userData.inventory.push(itemKey);
            }

            dataManager.savePersistentData();
            socket.emit('moneyUpdate', userData.money);
            socket.emit('wardrobeUpdate', { avatar: userData.avatar, inventory: userData.inventory });

            let rarity = chosen.cost >= 400 ? 'Efsanevi' : (chosen.cost >= 250 ? 'Nadir' : 'Klasik');

            socket.emit('mysteryBoxReward', {
                boxType: 'clothes',
                boxCost: boxCost,
                reward: {
                    category: chosen.cat,
                    id: chosen.id,
                    name: chosen.name,
                    icon: chosen.icon,
                    cost: chosen.cost,
                    rarity: rarity,
                    alreadyOwned: false
                }
            });

            socket.emit('systemMessage', `🎁 Şanslı Kıyafet Kutusunu açtın! Kazandığın: ${chosen.name} (${chosen.icon}) - Değeri: ${chosen.cost.toLocaleString()} TL.`);
            return;
        }
    });
}

module.exports = {
    registerMysteryBoxHandlers,
    CLOTHES_POOL,
    PROPS_POOL,
    getDynamicPrice,
    rollWeightedDynamicItem,
    isPropOwned,
    isClothesOwned
};

