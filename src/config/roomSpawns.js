// src/config/roomSpawns.js - Modüler Mekan Geçiş, Doğuş Koordinatları ve Örnek Ev Sistem Yapılandırması

/**
 * Mekanlar arası geçişte oyuncuların odaya giriş pozisyonları.
 * [HedefMekan][GeldigiMekan] -> { x, y }
 */
const ROOM_SPAWN_MAP = {
    kafe: {
        default: { x: 500, y: 530 }
    },
    sokak: {
        sahil: { x: 85, y: 250 },
        sahil_yolu: { x: 85, y: 250 }, // Sahil Yolu'ndan Meydan v1'e batıdan giriş
        cadde: { x: 720, y: 240 },
        kafe: { x: 400, y: 125 },
        nargile_cafe: { x: 670, y: 125 },
        market: { x: 730, y: 350 },
        emlakci: { x: 180, y: 125 },
        default: { x: 350, y: 230 }
    },
    cadde: {
        sokak: { x: 80, y: 230 },
        cadde2: { x: 730, y: 230 },
        ganyan: { x: 210, y: 145 },
        dedenin_yeri: { x: 585, y: 145 },
        dostlar_kiraathanesi: { x: 650, y: 380 },
        pet_shop: { x: 120, y: 395 }, // Pet Shop iç mekanından çıkınca dükkan önünde doğar
        default: { x: 400, y: 230 }
    },
    pet_shop: {
        cadde: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    cadde2: {
        cadde: { x: 70, y: 235 },
        vip_club: { x: 98, y: 140 },
        mine_cave: { x: 880, y: 460 },
        botanic_shop: { x: 320, y: 190 },
        kultur_merkezi_lobi: { x: 780, y: 190 },
        default: { x: 250, y: 235 }
    },
    mine_cave: {
        cadde2: { x: 140, y: 520 },
        default: { x: 140, y: 520 }
    },
    botanic_shop: {
        cadde2: { x: 500, y: 550 },
        default: { x: 500, y: 520 }
    },
    vip_club: {
        cadde2: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    optik: {
        cadde2: { x: 670, y: 490 },
        avm_kat1: { x: 670, y: 490 },
        default: { x: 670, y: 490 }
    },
    optika: {
        cadde2: { x: 670, y: 490 },
        avm_kat1: { x: 670, y: 490 },
        default: { x: 670, y: 490 }
    },
    kultur_merkezi_lobi: {
        cadde2: { x: 500, y: 550 },
        kultur_merkezi_sahne: { x: 500, y: 220 },
        kultur_merkezi_kulis: { x: 230, y: 220 },
        kultur_merkezi_sinema: { x: 770, y: 220 },
        default: { x: 500, y: 550 }
    },
    kultur_merkezi_sahne: {
        kultur_merkezi_lobi: { x: 500, y: 560 },
        kultur_merkezi_kulis: { x: 140, y: 240 },
        default: { x: 500, y: 500 }
    },
    kultur_merkezi_kulis: {
        kultur_merkezi_lobi: { x: 500, y: 550 },
        kultur_merkezi_sahne: { x: 860, y: 240 },
        default: { x: 500, y: 450 }
    },
    kultur_merkezi_sinema: {
        kultur_merkezi_lobi: { x: 500, y: 560 },
        default: { x: 500, y: 520 }
    },
    dostlar_kiraathanesi: {
        cadde: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    emlakci: {
        default: { x: 400, y: 410 }
    },
    sahil: {
        sokak: { x: 680, y: 270 },
        sahil_yolu: { x: 680, y: 270 }, // Sahil Yolu'ndan Sahil v1'e doğudan giriş
        default: { x: 420, y: 350 }
    },
    ganyan: {
        default: { x: 400, y: 410 }
    },
    dedenin_yeri: {
        default: { x: 400, y: 410 }
    },
    nargile_cafe: {
        default: { x: 400, y: 390 }
    },
    market: {
        default: { x: 400, y: 420 }
    },
    sanalika_cadde: {
        default: { x: 750, y: 520 }
    },
    star_caddesi: {
        sokak: { x: 120, y: 360 },
        default: { x: 500, y: 360 }
    },
    meydanv2: {
        sokak: { x: 500, y: 350 },
        cadde: { x: 920, y: 330 },
        sahil: { x: 500, y: 560 },
        kafe: { x: 380, y: 195 },
        emlakci: { x: 140, y: 195 },
        nargile_cafe: { x: 640, y: 195 },
        market: { x: 880, y: 195 },
        housing_portal: { x: 180, y: 560 },
        sahilv2: { x: 500, y: 560 },
        sahil_yolu: { x: 500, y: 560 },
        default: { x: 500, y: 350 }
    },
    sahilv2: {
        sokak: { x: 920, y: 550 },
        meydanv2: { x: 920, y: 550 },
        sahil_yolu: { x: 920, y: 550 },
        cadde: { x: 920, y: 550 },
        sahil: { x: 740, y: 390 },
        default: { x: 740, y: 390 }
    },
    sahil_yolu: {
        sokak: { x: 910, y: 260 }, // Meydan v1'den girişte doğu tarafta doğar
        sahil: { x: 85, y: 260 },  // Sahil v1'den girişte batı kumsal tarafta doğar
        meydanv2: { x: 500, y: 70 },
        sahilv2: { x: 880, y: 520 },
        avm_kat1: { x: 500, y: 250 },
        default: { x: 500, y: 260 }
    },
    avm_kat1: {
        sahil_yolu: { x: 500, y: 560 },
        avm_kat2: { x: 620, y: 220 },
        optik: { x: 660, y: 240 },
        optika: { x: 660, y: 240 },
        avm_magaza_kiyafet: { x: 220, y: 280 },
        avm_magaza_sapka: { x: 400, y: 220 },
        avm_magaza_sneaker: { x: 740, y: 280 },
        default: { x: 500, y: 560 }
    },
    avm_kat2: {
        avm_kat1: { x: 620, y: 220 },
        avm_magaza_takim: { x: 220, y: 280 },
        avm_magaza_saat: { x: 400, y: 220 },
        avm_magaza_berber: { x: 740, y: 280 },
        default: { x: 620, y: 220 }
    },

    // 6 ÖZEL AVM DÜKKAN İÇ MEKANLARI
    avm_magaza_kiyafet: {
        avm_kat1: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    avm_magaza_sneaker: {
        avm_kat1: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    avm_magaza_sapka: {
        avm_kat1: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    avm_magaza_takim: {
        avm_kat2: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    avm_magaza_saat: {
        avm_kat2: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    },
    avm_magaza_berber: {
        avm_kat2: { x: 500, y: 530 },
        default: { x: 500, y: 530 }
    }
};

/**
 * Emlakçı Örnek Daire Gezisi (Showroom Demo Turu) için hazır döşeli mobilya yerleşimleri.
 */
const DEMO_HOUSES = {
    standart: [
        { id: 'hali', x: 400, y: 290, rot: 0 },
        { id: 'tv', x: 400, y: 160, rot: 0 },
        { id: 'berjer', x: 280, y: 280, rot: 0 },
        { id: 'somine', x: 650, y: 165, rot: 0 },
        { id: 'bitki', x: 120, y: 165, rot: 0 }
    ],
    garden: [
        { id: 'sedir', x: 260, y: 315, rot: 0, rotation: 0 },
        { id: 'bitki', x: 185, y: 260, rot: 0, rotation: 0 },
        { id: 'bitki', x: 450, y: 240, rot: 0, rotation: 0 }
    ],
    pool: [
        { id: 'hali', x: 400, y: 300, rot: 0 },
        { id: 'piyano', x: 670, y: 200, rot: 0 },
        { id: 'bilgisayar', x: 150, y: 180, rot: 0 },
        { id: 'somine', x: 400, y: 160, rot: 0 },
        { id: 'berjer', x: 280, y: 300, rot: 0 },
        { id: 'berjer', x: 520, y: 300, rot: 2 }
    ]
};

/**
 * Verilen mekan geçişi için oyuncunun doğuş (spawn) koordinatlarını hesaplar.
 * @param {string} newRoom - Geçilmek istenen yeni mekan adı
 * @param {string} oldRoom - Ayrılan önceki mekan adı
 * @returns {{ x: number, y: number }}
 */
function getRoomSpawn(newRoom, oldRoom) {
    if (newRoom && newRoom.startsWith("house_")) {
        let isGarden = newRoom.endsWith('_garden') || newRoom.includes('_garden') || newRoom === 'house_ornek_garden';
        return isGarden ? { x: 330, y: 380 } : { x: 400, y: 400 };
    }
    const targetRoomConfig = ROOM_SPAWN_MAP[newRoom];
    if (!targetRoomConfig) {
        return { x: 400, y: 300 };
    }
    if (oldRoom && targetRoomConfig[oldRoom]) {
        return { ...targetRoomConfig[oldRoom] };
    }
    return { ...targetRoomConfig.default };
}

/**
 * İstenen ev tipine göre örnek daire mobilya dizilimini döndürür.
 * @param {string} demoType 
 * @returns {Array<object>}
 */
function getDemoHouseConfig(demoType) {
    return DEMO_HOUSES[demoType] || DEMO_HOUSES.standart;
}

module.exports = {
    ROOM_SPAWN_MAP,
    DEMO_HOUSES,
    getRoomSpawn,
    getDemoHouseConfig
};
