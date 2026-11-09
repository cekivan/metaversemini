// public/js/wardrobe.js - Gardırop, Kıyafet Kataloğu ve Özelleştirme Arayüzü

var myMoney = 2000;
window.myMoney = myMoney;
var myInventory = {
    hats: ['none', 'bere', 'k2_skater_bucket'],
    hair: ['none', 'hair_k2_fade_pompadour', 'hair_k2_anime_spiky', 'hair_k2_hime_cut', 'hair_curly_brown'],
    faces: ['none'],
    skins: ['#facc15'],
    outfits: ['outfit_c2_gentleman'],
    tshirts: ['#3b82f6', 'k2_cyber_street', 'k2_graffiti_oversize'],
    pants: ['pants_classic_jeans', 'pants_k2_tactical_jogger', 'pants_k2_skater_cargo'],
    shirts: ['#3b82f6', 'k2_cyber_street', 'k2_graffiti_oversize'],
    shoes: ['none', 'sneakers', 'shoes_k2_chunky_sneaker', 'shoes_k2_skate_pro', 'shoes_k2_high_sneakers', 'shoes_k2_nb_runner'],
    watches: ['none'],
    props: ['none', 'k2_energy_drink', 'k2_skateboard']
};
window.myInventory = myInventory;
var myAvatar = {
    model: 'karakter_2',
    hat: 'none',
    hair: 'hair_k2_fade_pompadour',
    face: 'none',
    skinColor: '#ffd1a4',
    color: 'k2_cyber_street',
    shirt: 'k2_cyber_street',
    shirtColor: 'k2_cyber_street',
    pants: 'pants_k2_tactical_jogger',
    pantsColor: 'original',
    outfit: null,
    watch: 'none',
    heldItem: 'none',
    shoes: 'shoes_k2_skate_pro',
    shoesColor: 'original'
};
window.myAvatar = myAvatar;

// Sanalika Stili Tüm Gardırop Renk Paleti (Orijinal + 9 Klasik Canlı Renk)
const WARDROBE_COLOR_OPTIONS = [
    { id: 'original', name: 'Orijinal', hex: 'original', bg: 'linear-gradient(135deg, #f59e0b, #3b82f6)', label: '✨ Orijinal' },
    { id: 'red', name: 'Kırmızı', hex: '#dc2626', bg: '#dc2626', label: '🔴 Kırmızı' },
    { id: 'navy', name: 'Lacivert', hex: '#1e3a8a', bg: '#1e3a8a', label: '🔵 Lacivert' },
    { id: 'blonde', name: 'Sarı', hex: '#facc15', bg: '#facc15', label: '🟡 Sarı' },
    { id: 'green', name: 'Yeşil', hex: '#10b981', bg: '#10b981', label: '🟢 Yeşil' },
    { id: 'blue', name: 'Mavi', hex: '#0284c7', bg: '#0284c7', label: '🔵 Mavi' },
    { id: 'black', name: 'Siyah', hex: '#18181b', bg: '#18181b', label: '⚫ Siyah' },
    { id: 'white', name: 'Beyaz', hex: '#ffffff', bg: '#f8fafc', label: '⚪ Beyaz' },
    { id: 'pink', name: 'Pembe', hex: '#ec4899', bg: '#ec4899', label: '🌸 Pembe' },
    { id: 'purple', name: 'Mor', hex: '#9333ea', bg: '#9333ea', label: '🟣 Mor' },
    { id: 'brown', name: 'Kumral', hex: '#92400e', bg: '#92400e', label: '🟤 Kumral' }
];
const K2_HAIR_COLOR_OPTIONS = WARDROBE_COLOR_OPTIONS;
window.K2_HAIR_COLOR_OPTIONS = WARDROBE_COLOR_OPTIONS;
window.WARDROBE_COLOR_OPTIONS = WARDROBE_COLOR_OPTIONS;

// Eşyaların Tasarlanan Özgün / İlk Orijinal Renkleri ve İsimleri
const ITEM_ORIGINAL_COLORS = {
    // Takım Elbiseler, Elbiseler & Kostümler
    'outfit_k2_tuxedo': { hex: '#18181b', name: 'Siyah' },
    'outfit_k2_street_overcoat': { hex: '#27272a', name: 'Antrasit' },
    'outfit_k2_techwear_bomber': { hex: '#18181b', name: 'Siyah & Turuncu' },
    'outfit_k2_cyber_chic': { hex: '#c084fc', name: 'Pastel Lila' },
    'outfit_k2_kpop_rebel': { hex: '#18181b', name: 'Siyah Deri' },
    'dress_k2_scarlet_gala': { hex: '#dc2626', name: 'Kırmızı' },
    'dress_k2_cyber_street': { hex: '#0ea5e9', name: 'Neon Mavi' },
    'dress_k2_goth_grunge': { hex: '#581c87', name: 'Gotik Mor' },
    'outfit_c2_gentleman': { hex: '#334155', name: 'Slate Lacivert' },
    'outfit_c2_street_cool': { hex: '#0f766e', name: 'Zümrüt Yeşili' },
    'outfit_c2_casual_polo': { hex: '#1e3a8a', name: 'Marin Mavi' },
    'outfit_c2_femme_chic': { hex: '#ec4899', name: 'Pastel Pembe' },
    'outfit_k2_cat': { hex: '#18181b', name: 'Siyah' },
    'costume_invisibility': { hex: '#38bdf8', name: 'Hayalet Mavi' },
    'dress_pink': { hex: '#ec4899', name: 'Pembe' },
    'dress_black': { hex: '#18181b', name: 'Zarif Siyah' },
    'dress_red': { hex: '#e11d48', name: 'Kırmızı' },
    'dress_emerald': { hex: '#059669', name: 'Zümrüt Yeşili' },
    'dress_lavender': { hex: '#c084fc', name: 'Lavanta' },
    'dress_bridal': { hex: '#ffffff', name: 'Kuğu Beyazı' },
    'outfit_goth': { hex: '#581c87', name: 'Gotik Mor' },
    'outfit_business': { hex: '#fb7185', name: 'Pudra' },
    'outfit_boho': { hex: '#ea580c', name: 'Bohem Turuncu' },
    'outfit_sporty': { hex: '#38bdf8', name: 'Pastel Mavi' },
    'dress_vintage_polka': { hex: '#dc2626', name: 'Vintage Kırmızı' },
    'dress_ocean_blue': { hex: '#06b6d4', name: 'Okyanus Mavisi' },
    'outfit_turtleneck_skirt': { hex: '#fef3c7', name: 'Krem' },

    // Tişörtler & Üstler
    'k2_cyber_street': { hex: '#0f172a', name: 'Koyu Grafit' },
    'k2_graffiti_oversize': { hex: '#18181b', name: 'Siyah Grafiti' },
    'top_k2_cyber_crop': { hex: '#06b6d4', name: 'Camgöbeği' },
    'top_k2_grunge_oversize': { hex: '#4c1d95', name: 'Koyu Mor' },
    'top_k2_pastel_hoodie': { hex: '#f472b6', name: 'Açık Pembe' },
    'top_k2_urban_hoodie': { hex: '#18181b', name: 'Mat Siyah' },
    'top_k2_y2k_butterfly_crop': { hex: '#ffffff', name: 'Saf Beyaz' },
    'top_k2_boxy_street_tee': { hex: '#18181b', name: 'Siyah' },
    'top_k2_corset_bustier': { hex: '#f8fafc', name: 'Kırık Beyaz' },
    'top_k2_asymmetric_cutout': { hex: '#0f172a', name: 'Gece Siyahı' },
    // ISG ve Maden Ekipman Renkleri
    'baret_beyaz': { hex: '#f8fafc', name: 'Mühendis Beyazı' },
    'baret_sari': { hex: '#facc15', name: 'Madenci Sarısı' },
    'baret_turuncu': { hex: '#f97316', name: 'Formen Turuncusu' },
    'baret_mavi': { hex: '#0284c7', name: 'Teknisyen Mavisi' },
    'baret_kirmizi': { hex: '#dc2626', name: 'İSG Kırmızısı' },
    'baret_yesil': { hex: '#16a34a', name: 'Çevre Yeşili' },
    'vest_reflector_yellow': { hex: '#84cc16', name: 'Neon Sarı-Yeşil' },
    'vest_reflector_orange': { hex: '#f97316', name: 'Neon Turuncu' },
    'vest_reflector_blue': { hex: '#2563eb', name: 'Saks Mavisi' },
    'vest_reflector_red': { hex: '#dc2626', name: 'İSG Kırmızısı' },
    '#3b82f6': { hex: '#3b82f6', name: 'Mavi' },
    '#ef4444': { hex: '#ef4444', name: 'Kırmızı' },
    '#10b981': { hex: '#10b981', name: 'Yeşil' },
    '#8b5cf6': { hex: '#8b5cf6', name: 'Mor' },
    '#f59e0b': { hex: '#f59e0b', name: 'Turuncu' },
    '#0f172a': { hex: '#0f172a', name: 'Gece Siyahı' },
    'polo': { hex: '#f8fafc', name: 'Beyaz' },
    'hoodie': { hex: '#6366f1', name: 'İndigo' },
    'leather': { hex: '#18181b', name: 'Siyah Deri' },
    'skirt_crop': { hex: '#f43f5e', name: 'Pembe' },
    'skirt_denim': { hex: '#38bdf8', name: 'Açık Kot' },

    // Pantolonlar & Altlar
    'pants_k2_tactical_jogger': { hex: '#1e293b', name: 'Taktik Grafit' },
    'pants_k2_skater_cargo': { hex: '#3f3f46', name: 'Füme Kargo' },
    'pants_k2_cargo_mini': { hex: '#1e293b', name: 'Taktik Grafit' },
    'pants_k2_flared_jeans': { hex: '#1d4ed8', name: 'Mavi Jean' },
    'pants_k2_goth_fishnet': { hex: '#18181b', name: 'Siyah Fileli' },
    'pants_k2_parachute_cargo': { hex: '#d4b996', name: 'Bej Kargo' },
    'pants_k2_wide_leg_denim': { hex: '#0284c7', name: 'Açık Mavi Jean' },
    'pants_k2_low_rise_flare': { hex: '#1e293b', name: 'Koyu Füme' },
    'pants_k2_leather_cargo': { hex: '#18181b', name: 'Mat Siyah Deri' },
    'pants_classic_jeans': { hex: '#2563eb', name: 'Klasik Mavi Jean' },
    'pants_classic_black': { hex: '#1e293b', name: 'Kumaş Siyah' },
    'pants_classic_beige': { hex: '#d4b996', name: 'Bej Chino' },
    'pants_classic_cargo_olive': { hex: '#4d5d3b', name: 'Zeytin Yeşili' },
    'pants_classic_white_skirt': { hex: '#ffffff', name: 'Beyaz Etek' },

    // Şapkalar & Saçlar
    'hair_k2_fade_pompadour': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_anime_spiky': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_twin_tails': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_wavy_shoulder': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_hime_cut': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_ponytail': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_messy_bun': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_curtain_bangs': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_k2_french_bob': { hex: '#26150b', name: 'Doğal Siyah' },
    'hair_long': { hex: '#3e2723', name: 'Koyu Kahve' },
    'hair_wavy': { hex: '#4e342e', name: 'Kahve' },
    'hair_ponytail': { hex: '#3e2723', name: 'Koyu Kahve' },
    'hair_braids': { hex: '#5d4037', name: 'Kahve Örgü' },
    'hair_bob': { hex: '#3e2723', name: 'Koyu Kahve' },
    'hair_hijab': { hex: '#1e293b', name: 'Koyu Lacivert' },
    'hair_blonde_curls': { hex: '#facc15', name: 'Altın Sarı' },
    'hair_bun_chopsticks': { hex: '#3e2723', name: 'Koyu Kahve' },
    'hair_redhead_wavy': { hex: '#dc2626', name: 'Kızıl' },
    'hair_pigtails_ribbon': { hex: '#3e2723', name: 'Koyu Kahve' },
    'hair_curly_brown': { hex: '#92400e', name: 'Kıvırcık Kahve' },
    'bere': { hex: '#dc2626', name: 'Kırmızı' },
    'kasket': { hex: '#475569', name: 'Füme' },
    'fes': { hex: '#b91c1c', name: 'Bordo' },
    'cowboy': { hex: '#78350f', name: 'Deri Kahve' },
    'korsan': { hex: '#18181b', name: 'Siyah' },
    'sihirbaz': { hex: '#18181b', name: 'Siyah' },
    'kulaklik': { hex: '#0ea5e9', name: 'Neon Mavi' },
    'k2_skater_bucket': { hex: '#1e293b', name: 'Füme' },
    'beret_pink': { hex: '#ec4899', name: 'Pembe' },
    'crown': { hex: '#eab308', name: 'Altın' },

    // Yüz & Sakallar
    'beard': { hex: '#26150b', name: 'Doğal Sakal' },
    'viking_beard': { hex: '#26150b', name: 'Doğal Viking Sakalı' },
    'shadow_stubble_scar': { hex: '#26150b', name: 'Doğal Kirli Sakal' },
    'mustache': { hex: '#1e1e1e', name: 'Doğal Siyah' },
    'goth_face_veil': { hex: '#18181b', name: 'Siyah File' },
    'sunglasses': { hex: '#0f172a', name: 'Siyah Cam' },
    'sunglasses_retro': { hex: '#0f172a', name: 'Asetat Siyah' },
    'sunglasses_aviator': { hex: '#0284c7', name: 'Kobalt Mavi' },
    'sunglasses_cateye': { hex: '#b91c1c', name: 'Bordo Kırmızı' },
    'sunglasses_cyber': { hex: '#00f3ff', name: 'Neon Siber Cyan' },
    'sunglasses_lennon': { hex: '#facc15', name: 'Altın Amber' },
    'sunglasses_polar': { hex: '#38bdf8', name: 'Kutup Buz Mavisi' },
    'sunglasses_star': { hex: '#ec4899', name: 'Festival Pembe' },
    'sunglasses_pixel': { hex: '#0f172a', name: 'Thug Life Siyah' },
    'cute_blush_freckles': { hex: '#f472b6', name: 'Doğal Pembe' },
    'goth_eyeliner_heart': { hex: '#18181b', name: 'Siyah Eyeliner' },

    // Ayakkabılar
    'shoes_k2_high_sneakers': { hex: '#dc2626', name: 'Kırmızı' },
    'shoes_k2_nb_runner': { hex: '#64748b', name: 'Miras Grisi' },
    'shoes_k2_chunky_sneaker': { hex: '#ffffff', name: 'Beyaz' },
    'shoes_k2_skate_pro': { hex: '#18181b', name: 'Siyah' },
    'shoes_k2_goth_boots': { hex: '#18181b', name: 'Siyah' },
    'sneakers': { hex: '#ffffff', name: 'Beyaz' },
    'classic': { hex: '#1c1917', name: 'Siyah Kösele' },
    'boots': { hex: '#78350f', name: 'Kahve' },
    'heels': { hex: '#dc2626', name: 'Kırmızı' },
    'heels_gold': { hex: '#facc15', name: 'Altın' },
    'boots_thigh_high': { hex: '#18181b', name: 'Siyah' },
    'sandals_gladiator': { hex: '#78350f', name: 'Kahve' },
    'flats': { hex: '#ec4899', name: 'Pembe' }
};
window.ITEM_ORIGINAL_COLORS = ITEM_ORIGINAL_COLORS;

function getActiveItemOriginalInfo(category) {
    let itemId = null;
    if (typeof previewAvatar !== 'undefined' && previewAvatar) {
        if (category === 'hats') itemId = previewAvatar.hat;
        else if (category === 'hair') itemId = previewAvatar.hair;
        else if (category === 'faces') itemId = previewAvatar.face;
        else if (category === 'outfits') itemId = previewAvatar.outfit || previewAvatar.costume;
        else if (category === 'tshirts' || category === 'shirts') itemId = previewAvatar.shirt || previewAvatar.color;
        else if (category === 'pants') itemId = previewAvatar.pants;
        else if (category === 'shoes') itemId = previewAvatar.shoes;
    }
    if (itemId && ITEM_ORIGINAL_COLORS[itemId]) {
        return ITEM_ORIGINAL_COLORS[itemId];
    }
    if (typeof WARDROBE_CATALOG !== 'undefined') {
        const norm = (category === 'shirts') ? 'tshirts' : category;
        const list = WARDROBE_CATALOG[norm] || [];
        const itemObj = list.find(x => x.id === itemId);
        if (itemObj && itemObj.color && itemObj.color.startsWith('#')) {
            return { hex: itemObj.color, name: itemObj.name || 'Orijinal' };
        }
    }
    return { hex: '#18181b', name: 'Orijinal' };
}
window.getActiveItemOriginalInfo = getActiveItemOriginalInfo;

let selectedWardrobeColor = 'original';
window.selectedWardrobeColor = selectedWardrobeColor;

const WARDROBE_CATALOG = {
    hats: [
        { id: 'none', name: 'Şapka Yok', cost: 0, icon: '🚫', model: 'all' },
        // Klasik & Klasik 2 Şapkalar
        { id: 'bere', name: 'Kırmızı Bere', cost: 200, icon: '🔴', gender: 'male', model: ['classic', 'classic_2'] },
        { id: 'kasket', name: 'Kıraathane Kasketi', cost: 260, icon: '🧢', gender: 'male', model: ['classic', 'classic_2'] },
        { id: 'fes', name: 'Osmanlı Fesi', cost: 320, icon: '🏮', gender: 'male', model: ['classic', 'classic_2'] },
        { id: 'cowboy', name: 'Kovboy Şapkası', cost: 380, icon: '🤠', gender: 'male', model: ['classic', 'classic_2'] },
        { id: 'korsan', name: 'Korsan Kaptanı', cost: 420, icon: '🏴‍☠️', model: ['classic', 'classic_2'] },
        { id: 'sihirbaz', name: 'Sihirbaz Silindiri', cost: 360, icon: '🎩', model: ['classic', 'classic_2'] },
        { id: 'kulaklik', name: 'DJ Kulaklığı', cost: 250, icon: '🎧', model: ['classic', 'classic_2'] },
        { id: 'k2_skater_bucket', name: 'Sokak Kova Şapka', cost: 280, icon: '🧢', model: 'all', description: 'Grafiti sokak stili çift dikişli salaş kova şapka (8 açılı)' },
        { id: 'beret_pink', name: 'Pembe Fransız Bere', cost: 260, icon: '🌸', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'crown', name: 'Prenses Tacı', cost: 480, icon: '👑', gender: 'female', model: ['classic', 'classic_2'] },
        // Şantiye & Kaya Madeni İSG Baretleri (EN 397 Standardı)
        { id: 'baret_beyaz', name: 'Beyaz Mühendis Bareti', cost: 150, icon: '⛑️', model: 'all', gender: 'all', description: 'Mühendis, mimar ve İSG uzmanı beyaz koruyucu güvenlik bareti (Çene bağlı ve tepe kavisli)' },
        { id: 'baret_sari', name: 'Sarı Madenci Bareti', cost: 120, icon: '👷', model: 'all', gender: 'all', description: 'Klasik maden ve şantiye saha işçisi darbe sönümleyici sarı güvenlik bareti' },
        { id: 'baret_turuncu', name: 'Turuncu Formen Bareti', cost: 140, icon: '⛑️', model: 'all', gender: 'all', description: 'Şantiye şefi, formen ve sörveyan yüksek görünürlüklü turuncu baret' },
        { id: 'baret_mavi', name: 'Mavi Teknisyen Bareti', cost: 130, icon: '⛑️', model: 'all', gender: 'all', description: 'Bakım, elektrikçi ve teknik operatör koruyucu emniyet bareti' },
        { id: 'baret_kirmizi', name: 'Kırmızı İSG & Yangın Bareti', cost: 140, icon: '⛑️', model: 'all', gender: 'all', description: 'İş sağlığı ve güvenliği denetçisi ve acil durum amiri kırmızı bareti' },
        { id: 'baret_yesil', name: 'Yeşil Çevre & Güvenlik Bareti', cost: 130, icon: '⛑️', model: 'all', gender: 'all', description: 'Çevre mühendisi ve saha güvenlik görevlisi yeşil koruyucu baret' }
    ],
    hair: [
        { id: 'none', name: 'Saç Modeli Yok', cost: 0, icon: '🚫', model: 'all' },
        // Kadın Saç Modelleri
        { id: 'hair_long', name: 'Uzun Düz Saç', cost: 260, icon: '👩', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_wavy', name: 'Dalgalı Saç', cost: 320, icon: '💇‍♀️', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_ponytail', name: 'At Kuyruğu', cost: 280, icon: '👱‍♀️', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_braids', name: 'Örgülü Saç', cost: 290, icon: '👧', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_bob', name: 'Küt Kesim Saç', cost: 240, icon: '👩‍🦰', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_hijab', name: 'Şık Başörtüsü', cost: 250, icon: '🧕', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_blonde_curls', name: 'Altın Bukleli Uzun Saç', cost: 310, icon: '👱‍♀️', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_bun_chopsticks', name: 'Zarif Topuz & Çiçekli Toka', cost: 290, icon: '🌸', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_redhead_wavy', name: 'Kızıl Dalgalı Romantik Saç', cost: 300, icon: '👩‍🦰', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_pigtails_ribbon', name: 'Kurdeleli İkili Yan Saç', cost: 280, icon: '🎀', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'hair_curly_brown', name: 'Kıvırcık Kahverengi Saç', cost: 290, icon: '👩‍🦱', gender: 'all', model: ['classic', 'classic_2', 'karakter_2'], hasColorVariants: true, description: '8 açılı zengin çikolata tonlarında 3D hacimli bukleli kıvırcık saç' },
        { id: 'hair_k2_twin_tails', name: 'K2 İkili Yandan Kuyruk', cost: 290, icon: '👧', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Renkli neon tokalı, omuzlara inen ikili sokak at kuyruğu' },
        { id: 'hair_k2_wavy_shoulder', name: 'K2 Dalgalı Omuz Saçı', cost: 320, icon: '💇‍♀️', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Yandan ayrımlı, köprücük kemiğine dökülen havalı dalgalı saç' },
        { id: 'hair_k2_hime_cut', name: 'K2 Gotik Düz Perçem Saç (Hime)', cost: 300, icon: '🖤', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Düz alın perçemli, angel-ring parlak ve yanakları çerçeveleyen asil gotik saç' },
        { id: 'hair_k2_fade_pompadour', name: 'K2 Modern Fade Pompadour', cost: 320, icon: '💈', gender: 'male', model: 'karakter_2', hasColorVariants: true, description: 'Yanları degradeli kısa traşlı, üstü hacimli geriye taranmış modern pompadour' },
        { id: 'hair_k2_anime_spiky', name: 'K2 Anime Dikenli Saç', cost: 340, icon: '⚡', gender: 'male', model: 'karakter_2', hasColorVariants: true, description: 'Sivri tutamlı ve havalı manga/anime savaşçı saçı' },
        { id: 'hair_k2_ponytail', name: 'K2 Yüksek At Kuyruğu', cost: 320, icon: '👱‍♀️', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Tepeden toplanmış, sırtına dökülen ve yürürken zarifçe salınan at kuyruğu' },
        { id: 'hair_k2_messy_bun', name: 'K2 Dağınık Sokak Topuzu', cost: 330, icon: '🎀', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Tepede salaş dağınık topuz ve şakaklardan sarkan ince bukleler' },
        { id: 'hair_k2_curtain_bangs', name: 'K2 Estetik Perde Kâküllü Dalgalı', cost: 340, icon: '💇‍♀️', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Yüzü iki yandan çerçeveleyen havalı perde kâküller ve omuzlara dökülen doğal katlı dalgalar' },
        { id: 'hair_k2_french_bob', name: 'K2 Şık Fransız Bob & Kâkül', cost: 330, icon: '💇‍♀️', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Çene hizasında küt kesim modern Fransız bob, düz parlak kâkül ve Paris sokak zarafeti' },
        { id: 'hair_k2_layered_blowout', name: 'K2 Hacimli Uzun Katlı Fön', cost: 360, icon: '💇‍♀️', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Göğse kadar uzanan, ışıltılı ve dolgun fönlü lüks estetik kat kat dökülen saç' },
        { id: 'hair_k2_half_up_braid', name: 'K2 Bohem Yarım Örgülü Taç', cost: 350, icon: '💇‍♀️', gender: 'female', model: 'karakter_2', hasColorVariants: true, description: 'Arkada taç gibi toplanmış zarif bohem örgü, omuzlara ve sırta dökülen dalgalı tutamlar' },
        { id: 'hair_k2_flaming_fire', name: '🔥 Alev Alan Yanan Saç', cost: 650, icon: '🔥', gender: 'all', model: 'karakter_2', hasColorVariants: true, description: 'Sürekli alev alev yanan, göğe doğru ateş dilleri yükselen ve kor kıvılcımları saçan absürt efsanevi alev saç! (Hem Kız Hem Erkek)' }
    ],
    faces: [
        { id: 'none', name: 'Sade', cost: 0, icon: '🙂', model: 'all' },
        { id: 'mustache', name: 'Pala Bıyık', cost: 240, icon: '🥸', gender: 'male', model: 'all' },
        { id: 'sunglasses', name: 'Havalı Gözlük', cost: 300, icon: '🕶️', model: 'all' },
        { id: 'sunglasses_retro', name: 'Sanalika Retro Wayfarer', cost: 50, icon: '🕶️', model: 'all', hasColorVariants: true, description: 'Kalın siyah asetat çerçeve, füme degrade camlar ve gümüş perçinler.' },
        { id: 'sunglasses_aviator', name: 'Matrix Krom Aviator', cost: 75, icon: '🕶️', model: 'all', hasColorVariants: true, description: 'İnce çift köprülü titanyum çerçeve ve yansımalı mavi camlar.' },
        { id: 'sunglasses_cateye', name: 'Vintage Kedi Gözü', cost: 60, icon: '👓', model: 'all', hasColorVariants: true, description: 'Dışa doğru sivrilen retro feminen kedi gözü çerçeve ve zarif altın detaylar.' },
        { id: 'sunglasses_cyber', name: 'Neon Siber Vizör 2077', cost: 100, icon: '🥽', model: 'all', hasColorVariants: true, description: 'Fütüristik tek parça kavisli neon vizör ve siber başlık braketleri.' },
        { id: 'sunglasses_lennon', name: 'John Lennon Yuvarlak', cost: 80, icon: '🧐', model: 'all', hasColorVariants: true, description: 'Kusursuz yuvarlak altın tel çerçeve ve retro vintage camlar.' },
        { id: 'sunglasses_polar', name: 'Buz Mavisi Polarize Sport', cost: 45, icon: '🕶️', model: 'all', hasColorVariants: true, description: 'Dinamik kavisli spor çerçeve ve ayna efektli kutup mavisi polarize camlar.' },
        { id: 'sunglasses_star', name: 'Rockstar Neon Yıldız', cost: 70, icon: '⭐', model: 'all', hasColorVariants: true, description: 'Işıltılı 5 köşeli yıldız çerçeveler ve festival rockstar camları.' },
        { id: 'sunglasses_pixel', name: 'Thug Life 8-Bit Piksel', cost: 90, icon: '🕶️', model: 'all', description: 'Efsanevi basamaklı 8-bit siyah pikselli gözlük ve beyaz parlama noktaları.' },
        { id: 'beard', name: 'Kirli Sakal (Stubble)', cost: 360, icon: '🧔', gender: 'male', model: 'all', description: 'Ağzı açık bırakan, çene ve bıyık hattını saran usta 3 günlük kirli sakal' },
        { id: 'viking_beard', name: 'Örgülü Viking Sakalı', cost: 380, icon: '🧔', gender: 'male', model: 'all', description: 'Ağız çevresinden dolanan bıyık, çeneden inen gür örgü ve 2 altın toka' },
        { id: 'goth_face_veil', name: 'Gotik Fileli Hilme & Peçe', cost: 320, icon: '🕸️', gender: 'female', model: 'all', hasColorVariants: true, description: 'Gözleri ve burnu örten zarif elmas desenli gotik fileli peçe, hilme tülü & kadife gül' },
        { id: 'shadow_stubble_scar', name: 'K2 Çizik Yara İzi & Kirli Sakal', cost: 350, icon: '⚔️', gender: 'male', model: 'karakter_2', description: 'Yanak ve kaş üzerinden geçen karizmatik çizik yara izi ve gölgeli kirli sakal' },
        { id: 'cute_blush_freckles', name: 'K2 Anime Allık & Çiller', cost: 280, icon: '🌸', gender: 'female', model: 'karakter_2', description: 'Yanaklarda tatlı pembe allık kızarıklığı ve burun üstünde sevimli minik çiller' },
        { id: 'goth_eyeliner_heart', name: 'K2 Kedi Gözü Eyeliner & Kalp', cost: 300, icon: '🖤', gender: 'female', model: 'karakter_2', description: 'Keskin siyah kanatlı kedi gözü eyeliner ve sol elmacık kemiğinde minik siyah kalp' }
    ],
    skins: [
        { id: '#facc15', name: 'Klasik Sarı', cost: 0, color: '#facc15', model: 'all' },
        { id: '#ffd1a4', name: 'Açık Ten', cost: 240, color: '#ffd1a4', model: 'all' },
        { id: '#d2996c', name: 'Buğday Ten', cost: 300, color: '#d2996c', model: 'all' },
        { id: '#8d5524', name: 'Esmer Ten', cost: 360, color: '#8d5524', model: 'all' }
    ],
    // 1. KIYAFET / TAKIM (Hem Alt Hem Üst Set)
    outfits: [
        // Klasik 2 Özel Tasarım Setler (Yeni Model için Özel Kombinler)
        { id: 'costume_invisibility', name: 'Görünmezlik Kostümü', cost: 6000, color: '#38bdf8', icon: '👻', isOutfit: true, model: 'all', description: 'Giydiğinizde diğer oyuncular sizi ve nickinizi asla göremez. Sadece siz kendinizi silüet olarak görürsünüz!' },
        { id: 'outfit_c2_gentleman', name: 'Beyefendi Yelekli Takım', cost: 380, color: '#334155', icon: '🤵', isOutfit: true, model: 'classic_2', description: 'Yelekli şık ceket, kravat ve kumaş pantolon' },
        { id: 'outfit_c2_street_cool', name: 'Sokak Stili Bomber & Jean', cost: 340, color: '#0f766e', icon: '🧥', isOutfit: true, model: 'classic_2', description: 'Yeşil bomber ceket, beyaz tişört ve rahat jean' },
        { id: 'outfit_c2_casual_polo', name: 'Marin Çizgili Polo & Chino', cost: 310, color: '#1e3a8a', icon: '👕', isOutfit: true, model: 'classic_2', description: 'Lacivert-beyaz marin polo ve bej chino pantolon' },
        { id: 'outfit_c2_femme_chic', name: 'Zarif Pastel Blazer Takım', cost: 360, color: '#ec4899', icon: '💃', gender: 'female', isOutfit: true, model: 'classic_2', description: 'Pastel pembe şık blazer ceket ve kalem etek' },

        // Klasik & Klasik 2 Kadın Elbiseleri
        { id: 'dress_pink', name: 'Pembe Çiçekli Elbise', cost: 280, color: '#ec4899', icon: '👗', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_black', name: 'Zarif Siyah Gece Elbisesi', cost: 380, color: '#18181b', icon: '👗', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_red', name: 'Kırmızı Kokteyl Elbisesi', cost: 310, color: '#e11d48', icon: '💃', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_emerald', name: 'Zümrüt Yeşil İpek Elbise', cost: 340, color: '#059669', icon: '👗', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_lavender', name: 'Lavanta Bahar Elbisesi', cost: 290, color: '#c084fc', icon: '🌸', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_bridal', name: 'Masalsı Beyaz Gelinlik', cost: 490, color: '#ffffff', icon: '👰', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'outfit_goth', name: 'Gotik Elbise Kombini', cost: 360, color: '#581c87', icon: '🖤', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'outfit_business', name: 'Pudra Şık Kadın Takımı', cost: 330, color: '#fb7185', icon: '🧥', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'outfit_boho', name: 'Bohem Şifon Elbise & Yelek', cost: 280, color: '#ea580c', icon: '🌻', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'outfit_sporty', name: 'Pastel Fitness Takımı', cost: 250, color: '#38bdf8', icon: '🎽', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_vintage_polka', name: 'Vintage Puantiyeli Elbise', cost: 300, color: '#dc2626', icon: '💃', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_ocean_blue', name: 'Okyanus Mavisi Elbise', cost: 270, color: '#06b6d4', icon: '🌊', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'outfit_turtleneck_skirt', name: 'Krem Balıkçı & Ekose Takım', cost: 290, color: '#fef3c7', icon: '🧣', gender: 'female', isOutfit: true, model: ['classic', 'classic_2'] },
        { id: 'dress_k2_cyber_street', name: 'K2 Siber Neon Mini Elbise', cost: 360, color: '#0ea5e9', icon: '👗', gender: 'female', isOutfit: true, model: 'karakter_2', description: 'Neon pembe askılı, siber şeritli ve jartiyer detaylı modern A-kesim mini sokak elbisesi' },
        { id: 'dress_k2_goth_grunge', name: 'K2 Gotik Grunge Elbise', cost: 380, color: '#581c87', icon: '🖤', gender: 'female', isOutfit: true, model: 'karakter_2', description: 'Korse kesimli, gümüş zincirli çift katmanlı gotik pileli sokak elbisesi & choker' },
        { id: 'outfit_k2_tuxedo', name: 'K2 İtalyan Siyah Smokin', cost: 450, color: '#18181b', icon: '🤵', gender: 'male', isOutfit: true, model: 'karakter_2', description: 'Saten sivri yakalı siyah smokin ceket, beyaz gömlek, kırmızı papyon ve kumaş pantolon' },
        { id: 'outfit_k2_street_overcoat', name: 'K2 Sokak Kabanı & Deri Kombin', cost: 420, color: '#27272a', icon: '🧥', gender: 'male', isOutfit: true, model: 'karakter_2', description: 'Uzun antrasit sokak trençkotu, siyah boğazlı triko ve kargo pantolon' },
        { id: 'dress_k2_scarlet_gala', name: 'K2 Yırtmaçlı Kırmızı Gala Elbisesi', cost: 440, color: '#dc2626', icon: '💃', gender: 'female', isOutfit: true, model: 'karakter_2', description: 'Omuzları açık, yandan derin yırtmaçlı ve altın kemer detaylı kırmızı gala elbisesi' },
        { id: 'outfit_k2_kpop_rebel', name: 'K2 K-Pop Rebel Kombini', cost: 430, color: '#7c3aed', icon: '🎸', gender: 'female', isOutfit: true, model: 'karakter_2', description: 'Fermuarlı kısa deri motorcu ceketi, ekose mini etek, file çorap ve beyaz crop top' },
        { id: 'outfit_k2_techwear_bomber', name: 'K2 Tokyo Techwear Bomber & Kargo', cost: 460, color: '#18181b', icon: '🥷', gender: 'male', isOutfit: true, model: 'karakter_2', description: 'Turuncu fermuarlı mat siyah bomber ceket, katmanlı beyaz alt etek, kolda MA-1 pilot etiketi ve taktik kargo jogger' },
        { id: 'outfit_k2_cyber_chic', name: 'K2 Cyber Chic Crop & Plise Takım', cost: 450, color: '#c084fc', icon: '✨', gender: 'female', isOutfit: true, model: 'karakter_2', description: 'Ayrık kolluklu pastel lila büstiyer, gümüş tokalı kemer, çift zincirli katmanlı plise mini etek ve dizüstü tül çorap' },
        { id: 'outfit_k2_cat', name: 'Sevimli Kedi Kostümü', cost: 3200, color: '#18181b', icon: '🐱', isOutfit: true, model: 'all', hasColorVariants: true, description: 'Kulaklı kapüşon, pati eldivenler, çıngıraklı tasma ve sallanan kuyruklu tulum kedi kostümü!' }
    ],
    // 2. TİŞÖRT / ÜST (Sadece Üst)
    tshirts: [
        // Klasik & Klasik 2 Tişörtler ve Üstler
        { id: '#3b82f6', name: 'Mavi Tişört', cost: 0, color: '#3b82f6', icon: '👕', model: ['classic', 'classic_2'] },
        { id: '#ef4444', name: 'Kırmızı Tişört', cost: 100, color: '#ef4444', icon: '👕', model: ['classic', 'classic_2'] },
        { id: '#10b981', name: 'Yeşil Tişört', cost: 100, color: '#10b981', icon: '👕', model: ['classic', 'classic_2'] },
        { id: '#8b5cf6', name: 'Mor Tişört', cost: 100, color: '#8b5cf6', icon: '👕', model: ['classic', 'classic_2'] },
        { id: '#f59e0b', name: 'Turuncu Tişört', cost: 100, color: '#f59e0b', icon: '👕', model: ['classic', 'classic_2'] },
        { id: '#0f172a', name: 'Gece Siyahı Tişört', cost: 100, color: '#0f172a', icon: '👕', model: ['classic', 'classic_2'] },
        { id: 'polo', name: 'Beyaz Polo Yaka', cost: 160, color: '#f8fafc', icon: '👔', model: ['classic', 'classic_2'] },
        { id: 'hoodie', name: 'Oversize Hoodie', cost: 220, color: '#6366f1', icon: '🧥', model: ['classic', 'classic_2'] },
        { id: 'leather', name: 'Klasik Deri Ceket', cost: 350, color: '#18181b', icon: '🥼', model: ['classic', 'classic_2'] },
        { id: 'skirt_crop', name: 'Pembe Crop Üst', cost: 220, color: '#f43f5e', icon: '👚', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'skirt_denim', name: 'Kot Ceket & Üst', cost: 240, color: '#38bdf8', icon: '🎽', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'k2_cyber_street', name: 'K2 Siber Sokak Tişörtü', cost: 240, color: '#0ea5e9', icon: '⚡', model: 'karakter_2', description: 'Neon mavi siber şeritli 8 açılı modern oversize tişört' },
        { id: 'k2_graffiti_oversize', name: 'K2 Grafiti Oversize Tişört', cost: 260, color: '#18181b', icon: '🎨', model: 'karakter_2', description: 'Canlı neon grafiti sprey desenli ve sırt baskılı oversize sokak tişörtü' },
        { id: 'top_k2_cyber_crop', name: 'K2 Siber Neon Crop Top', cost: 260, color: '#06b6d4', icon: '🎽', gender: 'female', model: 'karakter_2', description: 'Göbeği açık, neon mavi & pembe askılı modern siber crop top' },
        { id: 'top_k2_grunge_oversize', name: 'K2 Grunge Düşük Omuz Tişört', cost: 250, color: '#4c1d95', icon: '👚', gender: 'female', model: 'karakter_2', description: 'Tek omzu açıkta bırakan salaş gotik mor sokak tişörtü' },
        { id: 'top_k2_pastel_hoodie', name: 'K2 Pastel Crop Hoodie', cost: 270, color: '#f472b6', icon: '🧥', gender: 'female', model: 'karakter_2', description: 'Kapüşon ipli tatlı pastel pembe kısa sokak hoodisi' },
        { id: 'top_k2_urban_hoodie', name: 'K2 Tokyo Urban Oversize Hoodie', cost: 320, color: '#18181b', icon: '🧥', model: 'karakter_2', hasColorVariants: true, description: 'Dökümlü kanguru cepli, beyaz metalik agletli kordonlu, uzun dökümlü kollu ve ense kapüşonlu premium salaş oversize sokak hoodisi' },
        { id: 'top_k2_y2k_butterfly_crop', name: 'K2 Y2K Kelebek Crop Top', cost: 280, color: '#ffffff', icon: '🦋', gender: 'female', model: 'karakter_2', description: 'Modern Y2K estetiği, göbeği açık beyaz crop top ve ortasında parlayan pembe kelebek motifi' },
        { id: 'top_k2_boxy_street_tee', name: 'K2 Minimalist Boxy Street Tişört', cost: 270, color: '#18181b', icon: '👕', gender: 'female', model: 'karakter_2', description: 'Düşük omuzlu salaş modern boxy kesim siyah sokak tişörtü, minimal beyaz tipografi baskılı' },
        { id: 'top_k2_corset_bustier', name: 'K2 Bağcıklı Korse Büstiyer', cost: 320, color: '#f8fafc', icon: '🤍', gender: 'female', model: 'karakter_2', description: 'Modern balenli korse dikişli, vücuda oturan lüks beyaz büstiyer ve gümüş halkalı bağcıklar' },
        { id: 'top_k2_asymmetric_cutout', name: 'K2 Asimetrik Cutout Sokak Üstü', cost: 290, color: '#0f172a', icon: '🖤', gender: 'female', model: 'karakter_2', description: 'Tek omzu açıkta bırakan, köprücük kemiğinde modern cutout pencereli şık siyah üst' },
        // Şantiye & Kaya Madeni Reflektörlü İş Yelekleri (EN ISO 20471 Standardı)
        { id: 'vest_reflector_yellow', name: 'Neon Sarı Reflektörlü Yelek', cost: 180, color: '#84cc16', icon: '🦺', model: 'all', gender: 'all', description: 'Fosforlu neon sarı-yeşil yüksek görünürlüklü saha yeleği, 3M gümüş reflektör şeritli ve İSG kimlik cepli' },
        { id: 'vest_reflector_orange', name: 'Neon Turuncu Reflektörlü Yelek', cost: 180, color: '#f97316', icon: '🦺', model: 'all', gender: 'all', description: 'Yol ve maden saha emniyet yeleği, parlak neon turuncu ve çift reflektör şeritli' },
        { id: 'vest_reflector_blue', name: 'Mavi Reflektörlü Mühendis Yeleği', cost: 190, color: '#2563eb', icon: '🦺', model: 'all', gender: 'all', description: 'Teknik denetim ve saha mühendisi saks mavisi yelek, çift reflektör şeritli' },
        { id: 'vest_reflector_red', name: 'Kırmızı Reflektörlü İSG Yeleği', cost: 190, color: '#dc2626', icon: '🦺', model: 'all', gender: 'all', description: 'İş sağlığı & güvenlik amiri yetkili yeleği, parlak kırmızı ve yüksek yansıtıcılı' }
    ],
    // 3. PANTOLON / ALT (Sadece Alt)
    pants: [
        // Klasik & Klasik 2 Pantolonlar (Klasik Vücut Oranlarına Özel)
        { id: 'pants_classic_jeans', name: 'Klasik Mavi Jean', cost: 0, color: '#2563eb', icon: '👖', model: ['classic', 'classic_2'], description: 'Rahat kesim klasik mavi kot pantolon' },
        { id: 'pants_classic_black', name: 'Klasik Kumaş Siyah', cost: 190, color: '#1e293b', icon: '👖', model: ['classic', 'classic_2'], description: 'Resmi ve şık siyah kumaş pantolon' },
        { id: 'pants_classic_beige', name: 'Klasik Bej Chino', cost: 170, color: '#d4b996', icon: '👖', model: ['classic', 'classic_2'], description: 'Zarif bej keten chino pantolon' },
        { id: 'pants_classic_cargo_olive', name: 'Zeytin Yeşili Kargo', cost: 200, color: '#4d5d3b', icon: '👖', model: ['classic', 'classic_2'], description: 'Çok cepli rahat zeytin yeşili kargo' },
        { id: 'pants_classic_white_skirt', name: 'Klasik Beyaz Pileli Etek', cost: 210, color: '#ffffff', icon: '👗', gender: 'female', model: ['classic', 'classic_2'], description: 'Zarif beyaz mini pileli etek' },
        { id: 'pants_k2_tactical_jogger', name: 'K2 Taktik Urban Kargo', cost: 220, color: '#334155', icon: '👖', model: 'karakter_2', description: 'Yanları tokalı cepli 8 açılı taktik kargo jogger' },
        { id: 'pants_k2_skater_cargo', name: 'K2 Skater Salaş Kargo', cost: 220, color: '#3f3f46', icon: '👖', model: 'karakter_2', description: 'Diz eskitmeli, gümüş zincirli bol kesim sokak skater kargo pantolonu' },
        { id: 'pants_k2_cargo_mini', name: 'K2 Taktik Kargo Mini Etek', cost: 260, color: '#1e293b', icon: '👗', gender: 'female', model: 'karakter_2', description: 'Metal tokalı kemerli ve yan cepli siyah kargo mini etek' },
        { id: 'pants_k2_flared_jeans', name: 'K2 İspanyol Paça Yüksek Bel Jean', cost: 280, color: '#1d4ed8', icon: '👖', gender: 'female', model: 'karakter_2', description: 'Gümüş zincirli, yüksek belli ve paçaları hafif genişleyen sokak kotu' },
        { id: 'pants_k2_goth_fishnet', name: 'K2 Gotik Yırtık Jean & File', cost: 290, color: '#18181b', icon: '🖤', gender: 'female', model: 'karakter_2', description: 'Yırtık dizlerinden file çorap görünen gotik siyah sokak pantolonu' },
        { id: 'pants_k2_parachute_cargo', name: 'K2 Baggy Paraşüt Kargo', cost: 290, color: '#d4b996', icon: '👖', gender: 'female', model: 'karakter_2', description: 'Geniş paçalı salaş paraşüt kargo pantolon, büzgülü bilekler ve metal tokalı yan cepler' },
        { id: 'pants_k2_wide_leg_denim', name: 'K2 Yüksek Bel Wide-Leg Vintage Jean', cost: 310, color: '#0284c7', icon: '👖', gender: 'female', model: 'karakter_2', description: '90\'lar retro açık mavi yıkamalı yüksek bel bol paça kot pantolon' },
        { id: 'pants_k2_low_rise_flare', name: 'K2 Düşük Bel İspanyol Paça Jean', cost: 300, color: '#1e293b', icon: '👖', gender: 'female', model: 'karakter_2', description: 'Y2K tarzı düşük belli, dizden aşağı zarifçe açılan füme/koyu mavi İspanyol paça jean' },
        { id: 'pants_k2_leather_cargo', name: 'K2 Mat Siyah Deri Kargo', cost: 330, color: '#18181b', icon: '🖤', gender: 'female', model: 'karakter_2', description: 'Karizmatik mat vegan deri sokak pantolonu, fermuarlı cepler ve metal perçinler' }
    ],
    // 4. KOL SAATLERİ (Klasik 2 Özel Koleksiyonu)
    watches: [
        { id: 'none', name: 'Saat Yok', cost: 0, icon: '🚫', model: 'classic_2' },
        { id: 'watch_gold_rolex', name: 'Altın Prestij Saat', cost: 500, icon: '⌚', color: '#facc15', model: 'classic_2', description: 'Lüks altın kaplama kordonlu prestij saati' },
        { id: 'watch_leather_classic', name: 'Deri Kordonlu Klasik Saat', cost: 350, icon: '⌚', color: '#78350f', model: 'classic_2', description: 'Klasik kahverengi deri kordonlu saat' },
        { id: 'watch_cyber_sport', name: 'Neon Spor Kronometre', cost: 420, icon: '⏱️', color: '#06b6d4', model: 'classic_2', description: 'Turkuaz neon dijital ekranlı spor saat' },
        { id: 'watch_k2_tourbillon_astral', name: 'K2 Astral Tourbillon Safir Saat', cost: 680, icon: '✨', color: '#0284c7', model: 'karakter_2', description: 'Safir kristal iskelet gövde, dönen altın tourbillon kafesi ve parlayan astral mavi saniye ibreli lüks şaheser saat.' }
    ],
    shoes: [
        { id: 'none', name: 'Yalınayak', cost: 0, icon: '🦶', model: 'all' },
        { id: 'sneakers', name: 'Spor Sneaker', cost: 180, icon: '👟', model: ['classic', 'classic_2'] },
        { id: 'classic', name: 'Kösele Klasik Ayakkabı', cost: 240, icon: '👞', model: ['classic', 'classic_2'] },
        { id: 'boots', name: 'Kışlık Bot', cost: 280, icon: '🥾', model: ['classic', 'classic_2'] },
        { id: 'heels', name: 'Topuklu Stiletto', cost: 320, icon: '👠', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'heels_gold', name: 'Altın Simli Stiletto', cost: 340, icon: '👠', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'boots_thigh_high', name: 'Diz Üstü Süet Çizme', cost: 350, icon: '👢', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'sandals_gladiator', name: 'İncili Gladyatör Sandalet', cost: 220, icon: '👡', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'flats', name: 'Babet & Düz Ayakkabı', cost: 190, icon: '🥿', gender: 'female', model: ['classic', 'classic_2'] },
        { id: 'shoes_k2_high_sneakers', name: 'Bileklikli Sneakers', cost: 350, icon: '👟', model: 'all', hasColorVariants: true, allowedColors: ['original', 'red', 'navy', 'black'], description: 'Air Jordan 1 tarzı yüksek bileklikli, beyaz panelli, siyah swoosh logolu retro sneakers' },
        { id: 'shoes_k2_nb_runner', name: 'New Balance Retro Runner', cost: 340, icon: '👟', model: 'all', hasColorVariants: true, allowedColors: ['original', 'grey', 'navy', 'green', 'black'], description: 'New Balance 990 / 574 tarzı süet panelli, nefes alan file kumaşlı, ikonik N logolu ve ENCAP tabanlı retro koşu ayakkabısı' },
        { id: 'shoes_k2_chunky_sneaker', name: 'K2 Chunky Platform Sneaker', cost: 200, icon: '👟', model: 'karakter_2', description: 'Kalın beyaz tabanlı neon şeritli 8 açılı sokak sneakerı' },
        { id: 'shoes_k2_skate_pro', name: 'K2 Skater Pro Chunky Sneaker', cost: 200, icon: '🛹', model: 'karakter_2', description: 'Süet burunlu, neon yeşil bağcıklı ve sakız tabanlı kaykay sneakerı' },
        { id: 'shoes_k2_goth_boots', name: 'K2 Gotik Kalın Taban Bot', cost: 280, icon: '👢', gender: 'female', model: 'karakter_2', description: 'Gümüş tokalı ve kalın platform tabanlı gotik sokak botu' }
    ],
    props: [
        { id: 'none', name: 'Boş El', cost: 0, icon: '✋', model: 'all' },
        { id: 'baglama', name: 'Anadolu Bağlaması', cost: 440, icon: '🪕', model: 'all' },
        { id: 'gitar', name: 'Akustik Gitar', cost: 700, icon: '🎸', model: 'all' },
        { id: 'sirtcantasi', name: 'Gezgin Sırt Çantası', cost: 440, icon: '🎒', model: 'all' },
        { id: 'nargile', name: 'Tüten Nargile', cost: 1400, icon: '💨', model: 'all' },
        { id: 'cay', name: 'İnce Belli Çay', cost: 200, icon: '☕', model: 'all' },
        { id: 'oralet', name: 'Sıcak Kıraathane Oraleti', cost: 300, icon: '🍵', model: 'all' },
        { id: 'kahve', name: 'Közde Türk Kahvesi', cost: 220, icon: '☕', model: 'all' },
        { id: 'balon', name: 'Uçan Balon', cost: 240, icon: '🎈', model: 'all' },
        { id: 'gazoz', name: 'Nostaljik Gazoz', cost: 280, icon: '🍾', model: 'all' },
        { id: 'tespih', name: 'Kehribar Tespih', cost: 800, icon: '📿', model: 'all' },
        { id: 'tespih2', name: 'Çift Katmanlı Tespih', cost: 900, icon: '📿', model: 'all' },
        { id: 'olta', name: 'Balıkçı Oltası', cost: 400, icon: '🎣', model: 'all' },
        { id: 'asagold', name: 'Yıldızlı Büyü Asası', cost: 520, icon: '🪄', model: 'all' },
        { id: 'kupa', name: 'Şampiyonluk Kupası', cost: 580, icon: '🏆', model: 'all' },
        { id: 'kilic', name: 'Orta Çağ Kılıcı', cost: 500, icon: '🗡️', model: 'all' },
        { id: 'oyuncak_araba', name: 'Küçük Oyuncak Araba', cost: 600, icon: '🚗', model: 'all' },
        { id: 'sigara', name: 'Tüten Sigara', cost: 10000, icon: '🚬', model: 'all', description: 'Hafif dumanı tüten karizmatik el sigarası.' },
        { id: 'k2_energy_drink', name: 'K2 Buzlu Enerji İçeceği', cost: 150, icon: '⚡', model: 'karakter_2', description: 'Buz gibi neon siber enerji içeceği (8 açılı)' },
        { id: 'k2_skateboard', name: 'K2 Grafiti Sokak Kaykayı', cost: 350, icon: '🛹', model: 'karakter_2', description: 'Ayak altına inen, +%50 hız kazandıran ve itme animasyonlu çift burunlu profesyonel sokak kaykayı!' },
        { id: 'sauron_staff', name: 'Karanlık Lord Sauron Asası (Animasyonlu)', cost: 1200, icon: '👁️', model: 'all', description: 'Alev alev parıldayan Sauron gözlü kara demir asa. Dakikada bir yere vurup zeminde lav çatlakları açar (5 sn kalır)!' },
        { id: 'inferno_katana', name: 'Alevli Ejder Katanası (Animasyonlu)', cost: 950, icon: '🗡️', model: 'all', description: 'Altın ejder kabzalı, namlusundan köz damlayan ve havada alev arkı çizen efsanevi katana!' },
        { id: 'oyuncak_dinozor', name: 'Sevimli Peluş Dinozor', cost: 320, icon: '🦖', model: 'all', description: 'Yeşil sevimli peluş T-Rex dinozor oyuncağı' },
        { id: 'su_tabancasi', name: 'Neon Oyuncak Su Tabancası', cost: 380, icon: '🔫', model: 'all', description: 'Basınçlı su püskürtme animasyonlu neon su tabancası' },
        { id: 'drone', name: 'Uçan Kameralı Mini Drone', cost: 650, icon: '🛸', model: 'all', description: 'Havada asılı süzülen, dönen 4 pervaneli ve yeşil/kırmızı yön LED ışıklı quadcopter drone' },
        { id: 'supurge', name: 'Modern Elektrikli Süpürge', cost: 420, icon: '🧹', model: 'all', description: 'Siklon hazneli, LED ışıklı ve zemin emiş partiküllü elektrikli süpürge' },
        { id: 'turk_bayragi', name: 'Şanlı Türk Bayrağı', cost: 100, icon: '🇹🇷', model: 'all', description: 'Altın alemli ahşap direkte dalgalanan şanlı al bayrak' },
        { id: 'bayrak_gs', name: 'Galatasaray Taraftar Bayrağı', cost: 250, icon: '🚩', model: 'all', description: 'Sarı-kırmızı 4 yıldızlı dalgalanan asil Galatasaray bayrağı' },
        { id: 'bayrak_fb', name: 'Fenerbahçe Taraftar Bayrağı', cost: 250, icon: '🚩', model: 'all', description: 'Sarı-lacivert çubuklu dalgalanan Fenerbahçe bayrağı' },
        { id: 'bayrak_bjk', name: 'Beşiktaş Taraftar Bayrağı', cost: 250, icon: '🚩', model: 'all', description: 'Siyah-beyaz kartal armalı dalgalanan Beşiktaş bayrağı' },
        { id: 'bayrak_ts', name: 'Trabzonspor Taraftar Bayrağı', cost: 250, icon: '🚩', model: 'all', description: 'Bordo-mavi çubuklu dalgalanan Trabzonspor bayrağı' },
        { id: 'zeus_yildirimi', name: "Zeus'un İlahi Yıldırımı", cost: 5000, icon: '⚡', model: 'all', description: 'Eldeyken elektrik enerjisi dönen kudretli Olimpos mızrağı. Günde 3 kez istediğiniz oyuncunun üstüne yıldırımı çarptırıp 30 saniye kül edebilirsiniz!' }
    ],
    costumes: [
        { id: 'costume_zombie_1', name: 'Yürüyen Zombi', cost: 4000, icon: '🧟', model: 'all', description: 'Craftpix zombi sprite seti; beklerken ve yürürken animasyonlu.' },
        { id: 'costume_zombie_2', name: 'Çürümüş Zombi', cost: 4200, icon: '🧟‍♂️', model: 'all', description: 'İkinci zombi görünümü; beklerken ve yürürken animasyonlu.' },
        { id: 'costume_zombie_3', name: 'Yaralı Zombi', cost: 4400, icon: '🧟‍♀️', model: 'all', description: 'Üçüncü zombi görünümü; beklerken ve yürürken animasyonlu.' },
        { id: 'costume_elephant', name: 'Heybetli Gerçekçi Fil', cost: 4500, icon: '🐘', model: 'all', description: 'Devasa gövdesi, kıvrık hortumu, yelpaze kulakları ve fildişi dişleriyle 2.5D gerçek bir fil formu.' },
        { id: 'costume_cockroach', name: 'Silah Çeken Huysuz Hamamböceği', cost: 3800, icon: '🪳', model: 'all', description: 'Cilalı kitin zırhı, uzun antenleri ve arka cebinden silah çıkarıp havaya 3 el ateş eden mafya hamamböceği!' },
        { id: 'costume_bird', name: 'Kartal', cost: 3500, icon: '🦅', model: 'all', description: 'Sekiz yöne uçan kartal; kanat çırpar, süzülür, yön değiştirirken yatar ve hareketsiz kalınca tüner.' },
        { id: 'costume_spider', name: 'Sekiz Bacaklı Karadul', cost: 2900, icon: '🕷️', model: 'all', description: '8 eklemli bacak, kırmızı kum saati desenli gövdesiyle gerçek bir örümcek formu.' },
        { id: 'costume_lion', name: 'Savana Kralı Aslan', cost: 4800, icon: '🦁', model: 'all', description: 'Katmanlı kızıl-altın yelesi, belirgin yüzü ve dört yöne ayrılmış patileriyle izometrik aslan.' },
        { id: 'costume_panda', name: 'Panda', cost: 2600, icon: '🐼', model: 'all', description: '2.5D izometrik 8 yönlü heybetli gövdesi, ağzında taze bambu filizi ve oturduğunda bambu yeme animasyonuyla sevimli panda.' },
        { id: 'costume_frog', name: 'Gerçekten Zıplayan Kurbağa', cost: 3200, icon: '🐸', model: 'all', description: 'Yüksek parabolik zıplamalarla hoplayan, boğaz kesesi atan, vantuzlu parmaklara sahip zehirli kurbağa!' },
        { id: 'costume_trex', name: 'T-Rex', cost: 5000, icon: '🦖', model: 'all', description: '2.5D izometrik 8 yönlü dev Jurassic T-Rex. Güçlü bacakları, savrulan kuyruğu, jilet dişleri ve minik kollarıyla tarih öncesi kralı!' },
        { id: 'costume_anaconda', name: 'Anakonda', cost: 4500, icon: '🐍', model: 'all', description: '2.5D izometrik 8 yönlü dev Amazon anakondası. Yerde S-kıvrımlı dalgalarla sürünür, oturduğunda ise çöreklenip başını kaldırarak tıslar!' },
        { id: 'costume_none', name: 'İnsan Formuna Dön', cost: 0, icon: '❌', model: 'all', description: 'Hayvan kostümünü çıkarıp kendi avatar kıyafetlerinize geri dönün.' }
    ]
};
for (const [category, items] of Object.entries(WARDROBE_CATALOG)) {
    if (category === 'shirts') continue;
    for (const item of items) {
        const priceKey = `${category}_${item.id}`;
        const price = (window.METAVERSE_PRICES && window.METAVERSE_PRICES.WARDROBE_ITEM_PRICES) ? window.METAVERSE_PRICES.WARDROBE_ITEM_PRICES[priceKey] : undefined;
        if (price !== undefined) {
            item.cost = price;
        }
    }
}
WARDROBE_CATALOG.shirts = WARDROBE_CATALOG.tshirts;

var currentWardrobeTab = 'hats';
window.currentWardrobeTab = currentWardrobeTab;
var wardrobeGenderFilter = 'male';
window.wardrobeGenderFilter = wardrobeGenderFilter;
var wardrobePage = 1;
window.wardrobePage = wardrobePage;
var WARDROBE_PAGE_SIZE = 9; // 3x3 Izgara (9 Slot)
window.WARDROBE_PAGE_SIZE = WARDROBE_PAGE_SIZE;
var isWardrobeOpen = false;
window.isWardrobeOpen = isWardrobeOpen;

function getPlayerGender() {
    if (typeof myId !== 'undefined' && typeof players !== 'undefined' && players && players[myId]) {
        if (players[myId].gender) return players[myId].gender;
        if (players[myId].avatar && players[myId].avatar.gender) return players[myId].avatar.gender;
    }
    if (typeof myAvatar !== 'undefined' && myAvatar && myAvatar.gender) {
        return myAvatar.gender;
    }
    if (typeof window !== 'undefined') {
        if (window.myGender) return window.myGender;
        if (window.selectedGender) return window.selectedGender;
        if (window.selectedRegisterGender) return window.selectedRegisterGender;
    }
    return 'male';
}
window.getPlayerGender = getPlayerGender;

function setWardrobeGenderFilter(filter) {
    wardrobeGenderFilter = filter;
    wardrobePage = 1; // Filtre değiştiğinde 1. sayfaya dön
    document.querySelectorAll('.wardrobe-gender-btn').forEach(btn => btn.classList.remove('active'));
    if (filter === 'female') document.getElementById('genderFilterFemale')?.classList.add('active');
    else if (filter === 'male') document.getElementById('genderFilterMale')?.classList.add('active');
    else document.getElementById('genderFilterAll')?.classList.add('active');
    renderWardrobeActiveGrid();
}
window.setWardrobeGenderFilter = setWardrobeGenderFilter;

function changeWardrobePage(delta) {
    if (currentWardrobeTab === 'boxes') return;
    let allItems = WARDROBE_CATALOG[currentWardrobeTab] || [];
    let curModel = (previewAvatar && previewAvatar.model) || (myAvatar && myAvatar.model) || 'classic_2';
    let items = allItems.filter(item => {
        if (!itemMatchesModel(item.model, curModel, item)) return false;
        if (!item.gender || item.gender === 'all') return true;
        if (wardrobeGenderFilter === 'all') return true;
        return item.gender === wardrobeGenderFilter;
    });

    let totalPages = Math.max(1, Math.ceil(items.length / WARDROBE_PAGE_SIZE));
    let newPage = wardrobePage + delta;
    if (newPage < 1) newPage = 1;
    if (newPage > totalPages) newPage = totalPages;

    if (newPage !== wardrobePage) {
        wardrobePage = newPage;
        renderWardrobeActiveGrid();
    }
}
window.changeWardrobePage = changeWardrobePage;

function updateMoneyDisplay(amount) {
    if (typeof EconomyManager !== 'undefined' && typeof EconomyManager.setMoney === 'function') {
        const num = EconomyManager.setMoney(amount);
        myMoney = num;
        return num;
    }
    const amt = (typeof amount === 'object' && amount !== null && amount.money !== undefined) ? amount.money : amount;
    const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
    myMoney = num;
    window.myMoney = num;
    window.userMoney = num;

    if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players && players[myId]) {
        players[myId].money = num;
    }

    const fmtTL = `${num.toLocaleString('tr-TR')} TL`;
    const fmtNum = num.toLocaleString('tr-TR');

    // 1. Ana HUD & Menü Rozetleri
    const uBadge = document.getElementById('userMoneyDisplay');
    if (uBadge) uBadge.innerText = fmtNum;
    const badge = document.getElementById('moneyDisplay');
    if (badge) badge.innerText = fmtNum;
    const wBadge = document.getElementById('wardrobeMoneyDisplay');
    if (wBadge) wBadge.innerText = fmtNum;
    const mBadge = document.getElementById('marketMoneyDisplay');
    if (mBadge) mBadge.innerText = fmtNum;

    // 2. Dükkan & Mağaza Modalları (Botanik, İSG, Optik, Pet Shop, Butik, VIP Tekin)
    const pBadge = document.getElementById('petShopUserMoney');
    if (pBadge) pBadge.innerText = fmtTL;
    const aBadge = document.getElementById('animalBoutiqueUserMoney');
    if (aBadge) aBadge.innerText = fmtTL;
    const bSupBadge = document.getElementById('botanicSupplierBalance');
    if (bSupBadge) bSupBadge.innerText = fmtTL;
    const bMktBadge = document.getElementById('botanicMarketBalance');
    if (bMktBadge) bMktBadge.innerText = fmtTL;
    const isgBadge = document.getElementById('isgShopBalance');
    if (isgBadge) isgBadge.innerText = fmtTL;
    const tekinBadge = document.getElementById('tekinShopUserMoney');
    if (tekinBadge) tekinBadge.innerText = fmtTL;
    const optikBadge = document.getElementById('optika-user-balance');
    if (optikBadge) optikBadge.innerText = fmtTL;
    const adBadge = document.getElementById('adModalUserMoney');
    if (adBadge) adBadge.innerText = fmtNum;
    const barberBadge = document.getElementById('barberShopBalance');
    if (barberBadge) barberBadge.innerText = fmtTL;

    // 3. Kumarhane & Masa Oyunları
    const bjBadge = document.getElementById('bjUserMoney');
    if (bjBadge) bjBadge.innerText = fmtNum;
    const roBadge = document.getElementById('rouletteUserBalance');
    if (roBadge) roBadge.innerText = fmtNum;
    const slotBadge = document.getElementById('slotUserBalance');
    if (slotBadge) slotBadge.innerText = fmtNum;

    // 4. Emlak & Konut
    const hcBadge = document.getElementById('houseConfirmBalance');
    if (hcBadge) hcBadge.innerHTML = `Mevcut Bakiyeniz: <b>${fmtTL}</b>`;
    const lmBadge = document.getElementById('lemonadePlayerBalance');
    if (lmBadge) lmBadge.innerHTML = `Mevcut Bakiyeniz: <b>${fmtTL}</b>`;

    try {
        window.dispatchEvent(new CustomEvent('balanceChanged', { detail: { money: num } }));
    } catch (_) {}
    return num;
}
window.updateMoneyDisplay = updateMoneyDisplay;

function updateDiamondDisplay(amount) {
    if (typeof EconomyManager !== 'undefined' && typeof EconomyManager.setDiamonds === 'function') {
        return EconomyManager.setDiamonds(amount);
    }
    const amt = (typeof amount === 'object' && amount !== null && amount.diamonds !== undefined) ? amount.diamonds : amount;
    const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
    window.myDiamonds = num;
    if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players && players[myId]) {
        players[myId].diamonds = num;
    }
    const fmtNum = num.toLocaleString('tr-TR');
    const dEl = document.getElementById('myDiamonds');
    if (dEl) dEl.innerText = fmtNum;
    const cEl = document.getElementById('diamondBadgeContainer');
    if (cEl) cEl.style.display = 'flex';

    if (window.miningClient && window.miningClient.state) {
        window.miningClient.state.diamonds = num;
    }
    try {
        window.dispatchEvent(new CustomEvent('diamondsChanged', { detail: { diamonds: num } }));
    } catch (_) {}
    return num;
}
window.updateDiamondDisplay = updateDiamondDisplay;

var previewAvatar = {
    model: 'karakter_2',
    gender: (typeof window !== 'undefined' && window.myGender) ? window.myGender : 'male',
    hat: 'none',
    hair: 'hair_k2_fade_pompadour',
    face: 'none',
    skinColor: '#ffd1a4',
    color: 'k2_cyber_street',
    shirt: 'k2_cyber_street',
    shirtColor: 'k2_cyber_street',
    pants: 'pants_k2_tactical_jogger',
    pantsColor: 'original',
    outfit: null,
    watch: 'none',
    heldItem: 'none',
    shoes: 'shoes_k2_skate_pro',
    shoesColor: 'original'
};
window.previewAvatar = previewAvatar;

function itemMatchesModel(itemModel, currentModel, item = null) {
    const isK2User = (currentModel === 'karakter_2' || currentModel === 'character_2');

    // İstisnalar: Görünmezlik pelerini, kostümler, Sokak Kova Şapka ve Bileklikli Sneakers her iki karaktere de aittir
    const isSpecialExemption = item && (
        item.id === 'costume_invisibility' || 
        item.id === 'outfit_invisibility' || 
        item.id === 'k2_skater_bucket' ||
        item.id === 'shoes_k2_high_sneakers' ||
        item.id === 'shoes_k2_nb_runner' ||
        item.id === 'outfit_k2_cat' ||
        item.id === 'hair_curly_brown' ||
        (item.id && item.id.startsWith('costume_'))
    );

    // K1 (Klasik) kullanıcısının gardırobundan "K2" yazan tüm eşyalar kesinlikle kaldırılsın
    if (!isK2User && !isSpecialExemption) {
        if (item && item.name && (item.name.includes('K2') || item.name.includes('k2'))) {
            return false;
        }
        if (itemModel === 'karakter_2' || itemModel === 'character_2') {
            return false;
        }
    }

    // K2 (Eklemli) kullanıcısı için model eşleşmesi
    if (isK2User) {
        if (itemModel === 'karakter_2' || itemModel === 'all') return true;
        if (Array.isArray(itemModel) && itemModel.includes('karakter_2')) return true;
        // Klasik modele özel eşyalar K2'de listelenmesin
        if (itemModel === 'classic' || itemModel === 'classic_2') return false;
        if (Array.isArray(itemModel) && !itemModel.includes('all') && !itemModel.includes('karakter_2')) return false;
        return true;
    }

    // K1 (Klasik) kullanıcısı için model eşleşmesi
    if (!itemModel || itemModel === 'all') return true;
    if (Array.isArray(itemModel)) {
        return itemModel.includes(currentModel) || itemModel.includes('classic') || itemModel.includes('classic_2');
    }
    return itemModel === currentModel || itemModel === 'classic' || itemModel === 'classic_2';
}

function sanitizeAvatarForModel(av, targetModel) {
    if (!av) return;
    targetModel = (targetModel === 'karakter_2' || targetModel === 'character_2') ? 'karakter_2' : 'classic_2';
    if (!av.watch) av.watch = 'none';
    av.model = targetModel;

    // Eğer K1 (Klasik) modeline geçildiyse, K2 özel kıyafetlerini klasik varsayılanlara sıfırla
    if (targetModel !== 'karakter_2') {
        if (av.shirt && (av.shirt.startsWith('top_k2_') || av.shirt === 'k2_cyber_street' || av.shirt === 'k2_graffiti_oversize')) {
            av.shirt = '#3b82f6';
            av.color = '#3b82f6';
        }
        if (av.pants && av.pants.startsWith('pants_k2_')) {
            av.pants = 'pants_classic_jeans';
        }
        if (av.hat && (av.hat.startsWith('hair_k2_') || av.hat === 'hair_k2_flaming_fire')) {
            av.hat = 'none';
        }
        if (av.shoes && av.shoes.startsWith('shoes_k2_') && av.shoes !== 'shoes_k2_high_sneakers' && av.shoes !== 'shoes_k2_nb_runner') {
            av.shoes = 'sneakers';
        }
        if (av.outfit && av.outfit.startsWith('outfit_k2_') && av.outfit !== 'outfit_k2_cat') {
            av.outfit = null;
        }
        if (av.face && (av.face === 'shadow_stubble_scar' || av.face === 'cute_blush_freckles' || av.face === 'goth_eyeliner_heart')) {
            av.face = 'none';
        }
    }
}
window.sanitizeAvatarForModel = sanitizeAvatarForModel;

function selectAvatarBodyModel(modelId) {
    let validModel = (modelId === 'karakter_2' || modelId === 'character_2') ? 'karakter_2' : 'classic_2';
    if (!previewAvatar) previewAvatar = { ...myAvatar };
    previewAvatar.model = validModel;
    myAvatar.model = validModel;
    window.selectedModelId = validModel;

    sanitizeAvatarForModel(previewAvatar, validModel);
    sanitizeAvatarForModel(myAvatar, validModel);

    if (typeof players !== 'undefined' && players[myId]) {
        players[myId].model = validModel;
        Object.assign(players[myId], myAvatar);
    }
    if (typeof socket !== 'undefined' && socket.emit) {
        socket.emit('setAvatarModel', { model: validModel });
    }
    updateModelSelectorUI();
    renderWardrobeUI();
    if (typeof drawAvatarPreview === 'function') drawAvatarPreview();
}
window.selectAvatarBodyModel = selectAvatarBodyModel;

function updateModelSelectorUI() {
    let cur = (previewAvatar && previewAvatar.model) || (myAvatar && myAvatar.model) || 'classic_2';
    let isK2 = (cur === 'karakter_2');
    
    let modelBadge = document.getElementById('currentModelBadge');
    if (modelBadge) {
        if (isK2) {
            modelBadge.innerText = '🌟 Karakter 2 (Eklemli)';
            modelBadge.style.color = '#facc15';
        } else {
            modelBadge.innerText = '🚶 Karakter 1 (Klasik)';
            modelBadge.style.color = '#34d399';
        }
    }

    let btnClassic = document.getElementById('btnModelClassic');
    let btnK2 = document.getElementById('btnModelKarakter2');

    const resetBtn = (btn) => {
        if (!btn) return;
        btn.style.background = 'rgba(30, 41, 59, 0.6)';
        btn.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        btn.style.color = '#94a3b8';
        btn.style.boxShadow = 'none';
    };

    resetBtn(btnClassic);
    resetBtn(btnK2);

    if (isK2 && btnK2) {
        btnK2.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        btnK2.style.border = '1.5px solid #fde68a';
        btnK2.style.color = '#ffffff';
        btnK2.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.4)';
    } else if (btnClassic) {
        btnClassic.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        btnClassic.style.border = '1.5px solid #a7f3d0';
        btnClassic.style.color = '#ffffff';
        btnClassic.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.4)';
    }
}
window.updateModelSelectorUI = updateModelSelectorUI;

function isItemOwned(category, id, colorId = null) {
    if (id === 'none' || id === 'watch_none' || id === '#facc15' || id === '#3b82f6') return true;
    if (id === 'pants_classic_jeans' || id === 'outfit_c2_gentleman' || id === 'k2_cyber_street' || id === 'pants_k2_tactical_jogger' || id === 'hair_k2_anime_spiky' || id === 'hair_k2_hime_cut' || id === 'hair_curly_brown' || id === 'goth_face_veil' || id === 'beard' || id === 'viking_beard') {
        if (!colorId || colorId === 'original') return true;
    }
    let normCat = (category === 'watch' || category === 'watches') ? 'watches' : ((category === 'hair' || category === 'hairs') ? 'hair' : (category.endsWith('s') ? category : (category + 's')));
    let key = `${normCat}_${id}`;
    if (normCat === 'hair') {
        if (id === 'none') return true;
        const activeInv = (typeof window !== 'undefined' && window.myInventory) || myInventory;
        if (Array.isArray(activeInv)) {
            if (activeInv.includes(id) || activeInv.includes(`hair_${id}`) || activeInv.includes(`hats_${id}`) || activeInv.includes(`hairs_${id}`)) return true;
        } else if (activeInv && typeof activeInv === 'object') {
            if (activeInv.hair && activeInv.hair.includes(id)) return true;
            if (activeInv.hats && activeInv.hats.includes(id)) return true;
        }
        if (typeof currentUserData !== 'undefined' && currentUserData && Array.isArray(currentUserData.inventory)) {
            if (currentUserData.inventory.includes(id) || currentUserData.inventory.includes(`hair_${id}`) || currentUserData.inventory.includes(`hats_${id}`) || currentUserData.inventory.includes(`hairs_${id}`)) return true;
        }
    }
    if (normCat === 'props') {
        let propInv = window.myPropInventory || {};
        return (propInv[key] && propInv[key] > 0);
    }
    if (normCat === 'costumes' && (id === 'costume_none' || id === 'none')) return true;
    if (id === 'costume_invisibility' || id === 'invisibility') {
        const uInv = (typeof window !== 'undefined' && window.myInventory) || (typeof myInventory !== 'undefined' && myInventory);
        if (Array.isArray(uInv) && (uInv.includes('costume_invisibility') || uInv.includes('outfits_costume_invisibility') || uInv.includes('costumes_costume_invisibility') || uInv.includes('invisibility'))) return true;
        if (typeof myAvatar !== 'undefined' && myAvatar && (myAvatar.invisibilityExpiresAt > Date.now() || myAvatar.outfit === 'costume_invisibility' || myAvatar.costume === 'costume_invisibility')) return true;
        return true; // Kullanıcı isteği: Kıyafetlerim takım sekmesinde direkt erişilebilir
    }
    // Tüm kostümler için genel sahiplik kontrolü (Takım Elbise sekmesinde ve Kostümler sekmesinde ortak):
    if (id && id.startsWith('costume_')) {
        if (id === 'costume_none') return true;
        const activeInv = (typeof window !== 'undefined' && window.myInventory) || (typeof myInventory !== 'undefined' && myInventory);
        if (Array.isArray(activeInv)) {
            if (activeInv.includes(id) || activeInv.includes(`costumes_${id}`) || activeInv.includes(`outfits_${id}`)) return true;
        } else if (activeInv && typeof activeInv === 'object') {
            if (activeInv.costumes && activeInv.costumes.includes(id)) return true;
            if (activeInv.outfits && activeInv.outfits.includes(id)) return true;
        }
        if (typeof currentUserData !== 'undefined' && currentUserData && Array.isArray(currentUserData.inventory)) {
            if (currentUserData.inventory.includes(id) || currentUserData.inventory.includes(`costumes_${id}`) || currentUserData.inventory.includes(`outfits_${id}`)) return true;
        }
        if (typeof myAvatar !== 'undefined' && myAvatar && (myAvatar.costume === id || myAvatar.outfit === id)) return true;
        return false;
    }
    if (normCat === 'watches' && id === 'none') return true;
    if (normCat === 'shoes' && (id === 'none' || id === 'sneakers' || id === 'flats')) {
        if (!colorId || colorId === 'original') return true;
    }

    const activeInv = (typeof window !== 'undefined' && window.myInventory) || myInventory;
    if (Array.isArray(activeInv)) {
        let altKey = id.startsWith(normCat + '_') ? id : null;
        if (colorId && colorId !== 'original') {
            const variantKey = `${key}__${colorId}`;
            return activeInv.includes(variantKey) || activeInv.includes(key) || activeInv.includes(id);
        } else {
            if (activeInv.includes(key)) return true;
            if (activeInv.includes(`${key}__original`)) return true;
            if (activeInv.includes(id)) return true;
            if (altKey && activeInv.includes(altKey)) return true;
            // Kullanıcı bu ürünün herhangi bir renk varyantına sahipse sahiplik onaylanır
            if (activeInv.some(x => x === key || x === id || x.startsWith(`${key}__`) || (altKey && x.startsWith(`${altKey}__`)))) return true;
        }
    } else if (activeInv && activeInv[normCat]) {
        return activeInv[normCat].includes(id) || activeInv[normCat].includes(key);
    }
    return false;
}

function openWardrobe() {
    // 1. Modalı hemen görünür kıl (Canvas layoutunun ve contextinin sıfır kalmasını önle)
    const modal = document.getElementById('wardrobeModal');
    if (modal) modal.style.display = 'flex';

    isWardrobeOpen = true;
    window.isWardrobeOpen = true;

    // myAvatar güvencesi
    if (!myAvatar || !myAvatar.model) {
        if (typeof window !== 'undefined' && window.myAvatar && window.myAvatar.model) {
            myAvatar = { ...window.myAvatar };
        } else if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) {
            myAvatar = { ...players[myId] };
        }
    }

    const userGen = (typeof getPlayerGender === 'function') ? getPlayerGender() : (window.myGender || (myAvatar && myAvatar.gender) || 'male');
    const isFem = (userGen === 'female');
    if (myAvatar) {
        myAvatar.gender = userGen;
        myAvatar.isFemale = isFem;
        if (!myAvatar.model) myAvatar.model = 'karakter_2';
    }

    previewAvatar = { ...(myAvatar || {}) };
    previewAvatar.gender = userGen;
    previewAvatar.isFemale = isFem;
    previewAvatar.id = (typeof window !== 'undefined' && window.myId) ? window.myId : (typeof myId !== 'undefined' ? myId : 'preview_self');
    if (myAvatar && myAvatar.face) {
        previewAvatar.face = myAvatar.face;
        previewAvatar.faceColor = myAvatar.faceColor || 'original';
    }

    if (!previewAvatar.model) {
        previewAvatar.model = (myAvatar && myAvatar.model) || 'karakter_2';
    }

    // Kıyafetlerin ilk açılışta null gelme durumuna karşı emniyet kalkanı
    if (previewAvatar.model === 'karakter_2') {
        if (!previewAvatar.shirt && !previewAvatar.outfit) {
            previewAvatar.shirt = isFem ? 'top_k2_pastel_hoodie' : 'k2_cyber_street';
            previewAvatar.shirtColor = previewAvatar.shirt;
            previewAvatar.color = previewAvatar.shirt;
        }
        if (!previewAvatar.pants && !previewAvatar.outfit) {
            previewAvatar.pants = isFem ? 'pants_k2_cargo_mini' : 'pants_k2_tactical_jogger';
        }
        if (!previewAvatar.shoes) {
            previewAvatar.shoes = isFem ? 'shoes_k2_chunky_sneaker' : 'shoes_k2_skate_pro';
        }
        if (!previewAvatar.hair || previewAvatar.hair === 'none') {
            previewAvatar.hair = isFem ? 'hair_k2_hime_cut' : 'hair_k2_fade_pompadour';
        }
    } else {
        if (!previewAvatar.shirt && !previewAvatar.outfit) {
            previewAvatar.shirt = previewAvatar.color || (isFem ? 'dress_pink' : '#3b82f6');
            previewAvatar.shirtColor = previewAvatar.shirt;
            previewAvatar.color = previewAvatar.shirt;
        }
        if (!previewAvatar.pants && !previewAvatar.outfit) {
            previewAvatar.pants = isFem ? '#ffd1a4' : 'pants_classic_jeans';
        }
        if (!previewAvatar.shoes) {
            previewAvatar.shoes = isFem ? 'flats' : 'sneakers';
        }
    }

    window.previewAvatar = previewAvatar;
    window.myAvatar = myAvatar;

    // Erkek karakter için default erkek, kadın karakter için default kadın kıyafetleri
    wardrobeGenderFilter = isFem ? 'female' : 'male';
    wardrobePage = 1;
    setWardrobeGenderFilter(wardrobeGenderFilter);

    updateModelSelectorUI();
    renderWardrobeUI();

    // Canvas'ı anında bir kez çizdir
    if (typeof drawAvatarPreview === 'function') {
        drawAvatarPreview();
    }

    const _prevLoop = (typeof avatarPreviewLoop === 'function') ? avatarPreviewLoop : (typeof window.avatarPreviewLoop === 'function' ? window.avatarPreviewLoop : null);
    if (_prevLoop) requestAnimationFrame(_prevLoop);
}

function closeWardrobe() {
    isWardrobeOpen = false;
    window.isWardrobeOpen = false;
    previewAvatar = { ...myAvatar };
    window.previewAvatar = previewAvatar;
    const modal = document.getElementById('wardrobeModal');
    if (modal) modal.style.display = 'none';
}

function switchWardrobeTab(tabName) {
    currentWardrobeTab = tabName;
    wardrobePage = 1; // Sekme değiştiğinde 1. sayfaya dön
    ['tabHats', 'tabHair', 'tabFaces', 'tabSkins', 'tabCostumes', 'tabOutfits', 'tabTshirts', 'tabPants', 'tabShoes', 'tabWatches', 'tabProps', 'tabMysteryBoxes'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });
    if (tabName === 'hats') document.getElementById('tabHats')?.classList.add('active');
    if (tabName === 'hair') document.getElementById('tabHair')?.classList.add('active');
    if (tabName === 'faces') document.getElementById('tabFaces')?.classList.add('active');
    if (tabName === 'skins') document.getElementById('tabSkins')?.classList.add('active');
    if (tabName === 'costumes') document.getElementById('tabCostumes')?.classList.add('active');
    if (tabName === 'outfits') document.getElementById('tabOutfits')?.classList.add('active');
    if (tabName === 'tshirts' || tabName === 'shirts') document.getElementById('tabTshirts')?.classList.add('active');
    if (tabName === 'pants') document.getElementById('tabPants')?.classList.add('active');
    if (tabName === 'shoes') document.getElementById('tabShoes')?.classList.add('active');
    if (tabName === 'watches') document.getElementById('tabWatches')?.classList.add('active');
    if (tabName === 'props') document.getElementById('tabProps')?.classList.add('active');
    if (tabName === 'boxes') document.getElementById('tabMysteryBoxes')?.classList.add('active');

    const genderBar = document.getElementById('wardrobeGenderBar');
    if (genderBar) {
        genderBar.style.display = (tabName === 'boxes') ? 'none' : 'flex';
    }

    // Sekme değiştiğinde renk seçimini otomatik olarak o eşyanın orijinaline sıfırla
    selectedWardrobeColor = 'original';
    window.selectedWardrobeColor = 'original';
    updateWardrobeColorPickerUI();
    renderWardrobeActiveGrid();
}

function previewWardrobeItem(category, id) {
    // Kullanıcı yeni bir eşyaya bastığında önceki renk seçiminden (ör. kırmızı) DEVAM ETMESİN,
    // otomatik olarak daima eşyanın kendi orijinal rengine dönsün!
    selectedWardrobeColor = 'original';
    window.selectedWardrobeColor = 'original';

    if (previewAvatar) {
        if (category === 'hats') {
            previewAvatar.hatColor = 'original';
        } else if (category === 'hair') {
            previewAvatar.hairColor = 'original';
        } else if (category === 'faces') {
            previewAvatar.faceColor = 'original';
        } else if (category === 'outfits') {
            previewAvatar.outfitColor = 'original';
            previewAvatar.costumeColor = 'original';
            previewAvatar.color = 'original';
            previewAvatar.shirtColor = 'original';
            previewAvatar.pantsColor = 'original';
        } else if (category === 'tshirts' || category === 'shirts') {
            previewAvatar.shirtColor = 'original';
            previewAvatar.color = 'original';
            previewAvatar.outfitColor = 'original';
        } else if (category === 'pants') {
            previewAvatar.pantsColor = 'original';
            previewAvatar.outfitColor = 'original';
        } else if (category === 'shoes') {
            previewAvatar.shoesColor = 'original';
        }
    }
    if (category === 'costumes' || (id && id.startsWith('costume_'))) {
        if (id === 'costume_none' || id === 'none') {
            previewAvatar.costume = null;
            if (category === 'outfits') previewAvatar.outfit = null;
        } else {
            previewAvatar.costume = id;
            if (category === 'outfits') previewAvatar.outfit = id;
        }
    } else {
        previewAvatar.costume = null;
        if (category === 'hats') {
            previewAvatar.hat = id;
        }
        else if (category === 'hair') {
            previewAvatar.hair = id;
            if (!previewAvatar.hairColor) {
                previewAvatar.hairColor = 'original';
            }
        }
        else if (category === 'faces') {
            previewAvatar.face = id;
            previewAvatar._selectedFaceCategory = true;
        }
        else if (category === 'skins') previewAvatar.skinColor = id;
        else if (category === 'outfits') {
            previewAvatar.outfit = id;
            previewAvatar.color = id;
            previewAvatar.shirt = null; // Takım hem üstü hem altı kapsar
            previewAvatar.pants = null;
        }
        else if (category === 'tshirts' || category === 'shirts') {
            previewAvatar.shirt = id;
            previewAvatar.color = id;
            previewAvatar.outfit = null; // Tişört seçilince tam takım devreden çıkar
            if (!previewAvatar.pants) {
                previewAvatar.pants = (previewAvatar.model === 'karakter_2' ? 'pants_k2_tactical_jogger' : 'pants_classic_jeans');
            }
        }
        else if (category === 'pants') {
            previewAvatar.pants = id;
            previewAvatar.outfit = null; // Pantolon seçilince tam takım devreden çıkar
            if (!previewAvatar.shirt) {
                previewAvatar.shirt = (previewAvatar.model === 'karakter_2' ? 'k2_cyber_street' : '#3b82f6');
                previewAvatar.color = previewAvatar.shirt;
            }
        }
        else if (category === 'shoes') previewAvatar.shoes = id;
        else if (category === 'watches') previewAvatar.watch = id;
        else if (category === 'props') {
            previewAvatar.heldItem = id;
            if (id === 'sigara') {
                previewAvatar._k2CigLit = false;
                previewAvatar._k2UseLighter = true;
                if (typeof triggerK2SmokeAnimation === 'function') {
                    triggerK2SmokeAnimation(previewAvatar, true);
                }
            }
        }
    }

    // Kıyafet, tişört, pantolon, şapka vb. denerken mevcut yüz halini (bıyık, sakal, makyajsız hal) daima koru!
    if (category !== 'faces') {
        if (!previewAvatar.face || previewAvatar.face === 'none') {
            if (myAvatar && myAvatar.face && myAvatar.face !== 'none') {
                previewAvatar.face = myAvatar.face;
                previewAvatar.faceColor = myAvatar.faceColor || 'original';
            }
        }
    }

    // Kullanıcının kimliğini ve cinsiyetini daima koru (Kıyafet denerken cinsiyet ve yüz asla değişmez)
    const currentGen = (typeof getPlayerGender === 'function') ? getPlayerGender() : (window.myGender || (myAvatar && myAvatar.gender) || 'male');
    previewAvatar.gender = currentGen;
    previewAvatar.isFemale = (currentGen === 'female');
    previewAvatar.id = (typeof window !== 'undefined' && window.myId) ? window.myId : (typeof myId !== 'undefined' ? myId : 'preview_self');

    renderWardrobeUI();
}

function renderWardrobeUI() {
    updateMoneyDisplay(myMoney);

    // Rozetleri ve isimleri güncelle
    const pName = players[myId] ? players[myId].name : "Kivre";
    const nameElem = document.getElementById('previewPlayerName');
    if (nameElem) nameElem.innerText = pName;

    const hatItem = WARDROBE_CATALOG.hats.find(h => h.id === previewAvatar.hat);
    const faceItem = WARDROBE_CATALOG.faces.find(f => f.id === previewAvatar.face);
    const skinItem = WARDROBE_CATALOG.skins.find(s => s.id === previewAvatar.skinColor);
    const outfitItem = (WARDROBE_CATALOG.outfits || []).find(o => o.id === previewAvatar.outfit);
    const tshirtItem = (WARDROBE_CATALOG.tshirts || []).find(t => t.id === (previewAvatar.shirt || previewAvatar.color));
    const pantsItem = (WARDROBE_CATALOG.pants || []).find(p => p.id === previewAvatar.pants);
    const shoeItem = (WARDROBE_CATALOG.shoes || []).find(s => s.id === previewAvatar.shoes);
    const watchItem = (WARDROBE_CATALOG.watches || []).find(w => w.id === previewAvatar.watch);
    const propItem = WARDROBE_CATALOG.props.find(p => p.id === previewAvatar.heldItem);

    const hBadge = document.getElementById('currentHatBadge');
    const fBadge = document.getElementById('currentFaceBadge');
    const sBadge = document.getElementById('currentSkinBadge');
    const outBadge = document.getElementById('currentOutfitBadge');
    const tsBadge = document.getElementById('currentTshirtBadge');
    const ptBadge = document.getElementById('currentPantsBadge');
    const shBadge = document.getElementById('currentShoeBadge');
    const wBadge = document.getElementById('currentWatchBadge');
    const pBadge = document.getElementById('currentPropBadge');

    if (hBadge) hBadge.innerText = hatItem ? `${hatItem.icon} ${hatItem.name}` : 'Yok';
    if (fBadge) fBadge.innerText = faceItem ? `${faceItem.icon} ${faceItem.name}` : 'Sade';
    if (sBadge) sBadge.innerText = skinItem ? skinItem.name : 'Klasik Sarı';
    if (outBadge) outBadge.innerText = outfitItem ? `${outfitItem.icon || '👗'} ${outfitItem.name}` : (previewAvatar.outfit ? previewAvatar.outfit : '-');
    if (tsBadge) tsBadge.innerText = previewAvatar.outfit ? 'Takım Kapsıyor' : (tshirtItem ? `${tshirtItem.icon || '👕'} ${tshirtItem.name}` : (previewAvatar.shirt ? previewAvatar.shirt : '-'));
    if (ptBadge) ptBadge.innerText = previewAvatar.outfit ? 'Takım Kapsıyor' : (pantsItem ? `${pantsItem.icon || '👖'} ${pantsItem.name}` : (previewAvatar.pants ? previewAvatar.pants : '-'));
    if (shBadge) shBadge.innerText = shoeItem ? `${shoeItem.icon} ${shoeItem.name}` : 'Sneaker';
    if (wBadge) wBadge.innerText = watchItem ? `${watchItem.icon || '⌚'} ${watchItem.name}` : 'Yok';
    if (pBadge) pBadge.innerText = propItem ? `${propItem.icon} ${propItem.name}` : 'Boş El';
    updateModelSelectorUI();
    updateK2HairColorPickerUI();
    renderWardrobeActiveGrid();
    if (typeof drawAvatarPreview === 'function') drawAvatarPreview();
}

function renderWardrobeActiveGrid() {
    const grid = document.getElementById('wardrobeActiveGrid');
    if (!grid) return;

    const paginationBar = document.getElementById('wardrobePaginationBar');

    if (currentWardrobeTab === 'boxes') {
        if (paginationBar) paginationBar.style.display = 'none';
        grid.style.display = 'block';
        grid.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:8px; width:100%; padding:2px 0;">
                <div style="font-size:11px; color:#cbd5e1; background:rgba(15,23,42,0.6); padding:6px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
                    🎁 <b>Şanslı Kutu Sistemi:</b> Her kutudan değerli ve nadir eşyalar çıkabilir! Pet kutusunda tüm petler eşit (%33.3) şansa sahipken, diğer kutularda dinamik şans algoritması çalışır.
                </div>

                <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:8px; width:100%;">
                    
                    <!-- 1. KIYAFET KUTUSU -->
                    <div class="wardrobe-item-card" style="background: linear-gradient(145deg, rgba(30, 27, 75, 0.85), rgba(15, 23, 42, 0.95)); border: 1.5px solid #818cf8; border-radius: 10px; padding: 10px 8px; text-align: center; display:flex; flex-direction:column; justify-content:space-between; height: 180px; box-sizing:border-box;">
                        <div>
                            <div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); margin-bottom: 3px;">🎁👗</div>
                            <div style="font-weight: 800; font-size: 13px; color: #c7d2fe;">Kıyafet Kutusu</div>
                            <div style="display:inline-block; font-size: 9px; font-weight: 800; background: rgba(99, 102, 241, 0.3); color: #818cf8; padding: 2px 6px; border-radius: 6px; margin: 2px 0 4px 0; border: 1px solid rgba(99, 102, 241, 0.4);">
                                Tüm Giysiler Dahil
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">
                                Şapkalar, takım elbiseler, tişörtler, pantolonlar ve saatler!
                            </div>
                        </div>
                        <button onclick="openMysteryBox('clothes')" style="width: 100%; padding: 6px; border-radius: 6px; background: linear-gradient(135deg, #6366f1, #4f46e5); border: none; color: white; font-weight: 800; font-size: 11px; cursor: pointer; box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);">
                            🛒 500 TL ile Aç
                        </button>
                    </div>

                    <!-- 2. EL EŞYALARI KUTUSU -->
                    <div class="wardrobe-item-card" style="background: linear-gradient(145deg, rgba(69, 26, 3, 0.85), rgba(15, 23, 42, 0.95)); border: 1.5px solid #f59e0b; border-radius: 10px; padding: 10px 8px; text-align: center; display:flex; flex-direction:column; justify-content:space-between; height: 180px; box-sizing:border-box; position:relative;">
                        <div style="position:absolute; top:-6px; right:6px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-size: 8px; font-weight: 900; padding: 1px 6px; border-radius: 8px; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.5);">
                            🔥 10.000 TL SİGARA!
                        </div>
                        <div>
                            <div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); margin-bottom: 3px;">🎁🚬</div>
                            <div style="font-weight: 800; font-size: 13px; color: #fde68a;">El Eşyaları Kutusu</div>
                            <div style="display:inline-block; font-size: 9px; font-weight: 800; background: rgba(245, 158, 11, 0.3); color: #fbbf24; padding: 2px 6px; border-radius: 6px; margin: 2px 0 4px 0; border: 1px solid rgba(245, 158, 11, 0.4);">
                                Aksesuar & Sigara
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">
                                10.000 TL Tüten Sigara, Nargile, Tespihler ve Gitarlar!
                            </div>
                        </div>
                        <button onclick="openMysteryBox('props')" style="width: 100%; padding: 6px; border-radius: 6px; background: linear-gradient(135deg, #f59e0b, #d97706); border: none; color: white; font-weight: 800; font-size: 11px; cursor: pointer; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);">
                            🛒 1.500 TL ile Aç
                        </button>
                    </div>

                    <!-- 3. PET KUTUSU -->
                    <div class="wardrobe-item-card" style="background: linear-gradient(145deg, rgba(80, 7, 36, 0.85), rgba(15, 23, 42, 0.95)); border: 1.5px solid #ec4899; border-radius: 10px; padding: 10px 8px; text-align: center; display:flex; flex-direction:column; justify-content:space-between; height: 180px; box-sizing:border-box; position:relative;">
                        <div style="position:absolute; top:-6px; right:6px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-size: 8px; font-weight: 900; padding: 1px 6px; border-radius: 8px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.5);">
                            🐾 15 DK SÜRELİ
                        </div>
                        <div>
                            <div style="font-size: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5)); margin-bottom: 3px;">🎁🐾</div>
                            <div style="font-weight: 800; font-size: 13px; color: #fbcfe8;">15 Dk Pet Kutusu</div>
                            <div style="display:inline-block; font-size: 9px; font-weight: 800; background: rgba(236, 72, 153, 0.3); color: #f472b6; padding: 2px 6px; border-radius: 6px; margin: 2px 0 4px 0; border: 1px solid rgba(236, 72, 153, 0.4);">
                                Eşit İhtimal (%33.3)
                            </div>
                            <div style="font-size: 10px; color: #94a3b8; line-height: 1.3;">
                                Sevimli Kedi 🐱, Sadık Köpek 🐶 veya Hızlı Fare 🐭!
                            </div>
                        </div>
                        <button onclick="openMysteryBox('pet')" style="width: 100%; padding: 6px; border-radius: 6px; background: linear-gradient(135deg, #ec4899, #db2777); border: none; color: white; font-weight: 800; font-size: 11px; cursor: pointer; box-shadow: 0 2px 8px rgba(236, 72, 153, 0.4);">
                            🛒 1.750 TL ile Aç
                        </button>
                    </div>

                </div>
            </div>
        `;
        return;
    }

    // Normal giyim eşyaları için 3x3 Izgara ve Sayfalama
    grid.style.display = 'grid';
    if (paginationBar) paginationBar.style.display = 'flex';

    let allItems = WARDROBE_CATALOG[currentWardrobeTab] || [];
    let curModel = (previewAvatar && previewAvatar.model) || (myAvatar && myAvatar.model) || 'classic_2';
    let items = allItems.filter(item => {
        if (!itemMatchesModel(item.model, curModel, item)) {
            return false;
        }
        if (!item.gender || item.gender === 'all') return true;
        if (wardrobeGenderFilter === 'all') return true;
        return item.gender === wardrobeGenderFilter;
    });

    const totalPages = Math.max(1, Math.ceil(items.length / WARDROBE_PAGE_SIZE));
    if (wardrobePage > totalPages) wardrobePage = totalPages;
    if (wardrobePage < 1) wardrobePage = 1;

    // Sayfalama arayüzünü güncelle
    const pageBadge = document.getElementById('wardrobePageBadge');
    const prevBtn = document.getElementById('wardrobePrevPageBtn');
    const nextBtn = document.getElementById('wardrobeNextPageBtn');
    if (pageBadge) pageBadge.innerText = `${wardrobePage} / ${totalPages}`;
    if (prevBtn) {
        prevBtn.style.opacity = wardrobePage <= 1 ? '0.35' : '1';
        prevBtn.style.pointerEvents = wardrobePage <= 1 ? 'none' : 'auto';
    }
    if (nextBtn) {
        nextBtn.style.opacity = wardrobePage >= totalPages ? '0.35' : '1';
        nextBtn.style.pointerEvents = wardrobePage >= totalPages ? 'none' : 'auto';
    }

    const startIdx = (wardrobePage - 1) * WARDROBE_PAGE_SIZE;
    const pageItems = items.slice(startIdx, startIdx + WARDROBE_PAGE_SIZE);

    let html = '';

    for (let slotIdx = 0; slotIdx < WARDROBE_PAGE_SIZE; slotIdx++) {
        if (slotIdx < pageItems.length) {
            const item = pageItems[slotIdx];

            let isEquippedActive = false;
            let isBeingPreviewed = false;

            if (currentWardrobeTab === 'hats') {
                isEquippedActive = (myAvatar.hat === item.id || (!myAvatar.hat && item.id === 'none'));
                isBeingPreviewed = (previewAvatar.hat === item.id || (!previewAvatar.hat && item.id === 'none'));
            } else if (currentWardrobeTab === 'hair') {
                isEquippedActive = (myAvatar.hair === item.id || (!myAvatar.hair && item.id === 'none'));
                isBeingPreviewed = (previewAvatar.hair === item.id || (!previewAvatar.hair && item.id === 'none'));
            } else if (currentWardrobeTab === 'faces') {
                isEquippedActive = (myAvatar.face === item.id);
                isBeingPreviewed = (previewAvatar.face === item.id);
            } else if (currentWardrobeTab === 'skins') {
                isEquippedActive = (myAvatar.skinColor === item.id);
                isBeingPreviewed = (previewAvatar.skinColor === item.id);
            } else if (currentWardrobeTab === 'costumes') {
                isEquippedActive = (myAvatar.costume === item.id || (!myAvatar.costume && item.id === 'costume_none'));
                isBeingPreviewed = (previewAvatar.costume === item.id || (!previewAvatar.costume && item.id === 'costume_none'));
            } else if (currentWardrobeTab === 'outfits') {
                const isCostumeItem = (item.id && item.id.startsWith('costume_'));
                isEquippedActive = (myAvatar.outfit === item.id || (isCostumeItem && myAvatar.costume === item.id));
                isBeingPreviewed = (previewAvatar.outfit === item.id || (isCostumeItem && previewAvatar.costume === item.id));
            } else if (currentWardrobeTab === 'tshirts' || currentWardrobeTab === 'shirts') {
                isEquippedActive = (!myAvatar.outfit && (myAvatar.shirt === item.id || myAvatar.color === item.id));
                isBeingPreviewed = (!previewAvatar.outfit && (previewAvatar.shirt === item.id || previewAvatar.color === item.id));
            } else if (currentWardrobeTab === 'pants') {
                isEquippedActive = (!myAvatar.outfit && myAvatar.pants === item.id);
                isBeingPreviewed = (!previewAvatar.outfit && previewAvatar.pants === item.id);
            } else if (currentWardrobeTab === 'shoes') {
                isEquippedActive = (myAvatar.shoes === item.id);
                isBeingPreviewed = (previewAvatar.shoes === item.id);
            } else if (currentWardrobeTab === 'watches') {
                isEquippedActive = (myAvatar.watch === item.id || (!myAvatar.watch && item.id === 'none'));
                isBeingPreviewed = (previewAvatar.watch === item.id || (!previewAvatar.watch && item.id === 'none'));
            } else if (currentWardrobeTab === 'props') {
                isEquippedActive = (myAvatar.heldItem === item.id || ((!myAvatar.heldItem || myAvatar.heldItem === 'none') && item.id === 'none'));
                isBeingPreviewed = (previewAvatar.heldItem === item.id || ((!previewAvatar.heldItem || previewAvatar.heldItem === 'none') && item.id === 'none'));
            }

            let activeColorHex = 'original';
            const curOpt = WARDROBE_COLOR_OPTIONS.find(o => o.id === selectedWardrobeColor);
            if (curOpt) activeColorHex = curOpt.hex;

            // Renk ve kuşanılmış olma eşleştirmesi
            if (currentWardrobeTab === 'hats') {
                const curCol = myAvatar.hatColor || 'original';
                isEquippedActive = (myAvatar.hat === item.id || (!myAvatar.hat && item.id === 'none')) && (curCol === activeColorHex || (curCol === 'original' && selectedWardrobeColor === 'original'));
            } else if (currentWardrobeTab === 'hair') {
                const curCol = myAvatar.hairColor || 'original';
                isEquippedActive = (myAvatar.hair === item.id || (!myAvatar.hair && item.id === 'none')) && (curCol === activeColorHex || (curCol === 'original' && selectedWardrobeColor === 'original'));
            } else if (currentWardrobeTab === 'faces') {
                const curCol = myAvatar.faceColor || 'original';
                isEquippedActive = (myAvatar.face === item.id) && (curCol === activeColorHex || (curCol === 'original' && selectedWardrobeColor === 'original'));
            } else if (currentWardrobeTab === 'outfits') {
                const curCol = myAvatar.outfitColor || myAvatar.color || 'original';
                const isCostumeItem = (item.id && item.id.startsWith('costume_'));
                isEquippedActive = (myAvatar.outfit === item.id || (isCostumeItem && myAvatar.costume === item.id)) && (curCol === activeColorHex || (curCol === 'original' && selectedWardrobeColor === 'original') || isCostumeItem);
            } else if (currentWardrobeTab === 'tshirts' || currentWardrobeTab === 'shirts') {
                const curCol = myAvatar.shirtColor || myAvatar.color || 'original';
                isEquippedActive = (!myAvatar.outfit && (myAvatar.shirt === item.id || myAvatar.color === item.id)) && (curCol === activeColorHex || (curCol === 'original' && selectedWardrobeColor === 'original'));
            } else if (currentWardrobeTab === 'pants') {
                const curCol = myAvatar.pantsColor || 'original';
                isEquippedActive = (!myAvatar.outfit && myAvatar.pants === item.id) && (curCol === activeColorHex || (curCol === 'original' && selectedWardrobeColor === 'original'));
            } else if (currentWardrobeTab === 'shoes') {
                const curCol = myAvatar.shoesColor || 'original';
                isEquippedActive = (myAvatar.shoes === item.id) && (curCol === activeColorHex || (curCol === 'original' && selectedWardrobeColor === 'original'));
            }

            let owned = isItemOwned(currentWardrobeTab, item.id, selectedWardrobeColor);

            let visualHtml = "";
            if (item.icon) {
                visualHtml = `<div style="font-size:30px; line-height: 1; filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6)); margin-bottom: 2px;">${item.icon}</div>`;
            } else if (item.color) {
                let isRound = currentWardrobeTab === 'skins';
                visualHtml = `<div style="width:26px; height:26px; border-radius:${isRound ? '50%' : '6px'}; background:${item.color}; border:2px solid rgba(255,255,255,0.7); box-shadow:0 3px 6px rgba(0,0,0,0.4); margin-bottom: 2px;"></div>`;
            }

            let buttonHtml = "";
            let propCount = 0;
            if (currentWardrobeTab === 'props' && item.id === 'none') {
                if (isEquippedActive) {
                    buttonHtml = `<button disabled style="width:100%; padding:3.5px 4px; border-radius:5px; background:rgba(56,189,248,0.2); border:1px solid #38bdf8; color:#38bdf8; font-weight:800; font-size:10px; cursor:default;">⭐ Boş El</button>`;
                } else {
                    buttonHtml = `<button onclick="event.stopPropagation(); unequipCurrentProp();" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #10b981, #059669); border:none; color:white; font-weight:800; font-size:10px; cursor:pointer;">✋ Kuşan</button>`;
                }
            } else if (currentWardrobeTab === 'props' && item.id !== 'none') {
                let pKey = `props_${item.id}`;
                propCount = (window.myPropInventory && window.myPropInventory[pKey]) || 0;
                if (isEquippedActive) {
                    buttonHtml = `<button onclick="event.stopPropagation(); if (typeof unequipCurrentProp==='function') unequipCurrentProp();" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #ef4444, #dc2626); border:none; color:white; font-weight:800; font-size:10px; cursor:pointer; box-shadow:0 1px 3px rgba(239,68,68,0.4);" title="Elindeki eşyayı çantana bırak">✕ Çıkar</button>`;
                } else if (propCount > 0) {
                    buttonHtml = `<button onclick="event.stopPropagation(); if (typeof equipPropItem==='function') equipPropItem('${pKey}')" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #10b981, #059669); border:none; color:white; font-weight:800; font-size:10px; cursor:pointer;">🖐️ Eline Al</button>`;
                } else {
                    buttonHtml = `<button onclick="event.stopPropagation(); buyWardrobeItem('props', '${item.id}')" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:white; font-weight:800; font-size:10px; cursor:pointer;">🛒 ${item.cost} TL</button>`;
                }
            } else {
                if (isEquippedActive) {
                    if (currentWardrobeTab === 'costumes' || (item.id && item.id.startsWith('costume_'))) {
                        buttonHtml = `<button onclick="event.stopPropagation(); unequipWardrobeItem('${currentWardrobeTab}', '${item.id}')" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #ef4444, #dc2626); border:none; color:white; font-weight:800; font-size:9.5px; cursor:pointer; box-shadow:0 1px 3px rgba(239,68,68,0.4);" title="Kostümü çıkar ve eski kıyafetlerine dön">✕ Kostümü Çıkar</button>`;
                    } else if (currentWardrobeTab === 'skins') {
                        buttonHtml = `<button disabled style="width:100%; padding:3.5px 4px; border-radius:5px; background:rgba(16,185,129,0.2); border:1px solid #10b981; color:#34d399; font-weight:800; font-size:10px; cursor:default;">⭐ Seçili</button>`;
                    } else {
                        buttonHtml = `<button onclick="event.stopPropagation(); unequipWardrobeItem('${currentWardrobeTab}', '${item.id}')" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #ef4444, #dc2626); border:none; color:white; font-weight:800; font-size:10px; cursor:pointer; box-shadow:0 1px 3px rgba(239,68,68,0.4);" title="Bu eşyayı çıkar ve varsayılana dön">✕ Çıkar</button>`;
                    }
                } else if (owned) {
                    buttonHtml = `<button onclick="event.stopPropagation(); buyWardrobeItem('${currentWardrobeTab}', '${item.id}', '${selectedWardrobeColor}')" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #10b981, #059669); border:none; color:white; font-weight:800; font-size:10px; cursor:pointer;">✅ Kuşan</button>`;
                } else {
                    buttonHtml = `<button onclick="event.stopPropagation(); buyWardrobeItem('${currentWardrobeTab}', '${item.id}', '${selectedWardrobeColor}')" style="width:100%; padding:3.5px 4px; border-radius:5px; background:linear-gradient(135deg, #f59e0b, #d97706); border:none; color:white; font-weight:800; font-size:10px; cursor:pointer;">🛒 ${item.cost} TL</button>`;
                }
            }

            let previewBadge = isBeingPreviewed ? `<div style="font-size:9px; color:#facc15; font-weight:bold; line-height:1;">👀 Deneniyor</div>` : '';
            let countTag = propCount > 0 ? `<span style="background:linear-gradient(135deg, #f59e0b, #d97706); color:white; font-size:9px; font-weight:800; padding:1px 4px; border-radius:6px; margin-left:2px;">x${propCount}</span>` : '';

            // Sanalika Stili 4 Bölümlü Renk Çarkı Rozeti
            let sanalikaBadgeHtml = "";
            const isPropCat = (currentWardrobeTab === 'props');
            const showVariants = !isPropCat && currentWardrobeTab !== 'costumes' && currentWardrobeTab !== 'skins' && item.id !== 'none' && item.id !== 'watch_none' && !item.id.startsWith('costume_');

            if (showVariants) {
                sanalikaBadgeHtml = `
                    <div class="sanalika-quadrant-badge" title="Renk Kombinasyonları Mevcut" style="position: absolute; top: 4px; right: 4px; z-index: 6; pointer-events: none; filter: drop-shadow(0 1px 3px rgba(0,0,0,0.5));">
                        <svg width="16" height="16" viewBox="0 0 24 24" style="display: block;">
                            <defs>
                                <clipPath id="sqBadgeClip_${item.id}">
                                    <circle cx="12" cy="12" r="10" />
                                </clipPath>
                            </defs>
                            <g clip-path="url(#sqBadgeClip_${item.id})">
                                <rect x="0" y="0" width="12" height="12" fill="#ef4444" />
                                <rect x="12" y="0" width="12" height="12" fill="#facc15" />
                                <rect x="0" y="12" width="12" height="12" fill="#10b981" />
                                <rect x="12" y="12" width="12" height="12" fill="#38bdf8" />
                            </g>
                            <line x1="12" y1="2" x2="12" y2="22" stroke="#ffffff" stroke-width="2" />
                            <line x1="2" y1="12" x2="22" y2="12" stroke="#ffffff" stroke-width="2" />
                            <circle cx="12" cy="12" r="10" fill="none" stroke="#ffffff" stroke-width="2" />
                        </svg>
                    </div>
                `;
            }

            html += `
            <div class="wardrobe-item-card ${isEquippedActive ? 'equipped' : ''} ${isBeingPreviewed ? 'previewing' : ''}" 
                 onclick="previewWardrobeItem('${currentWardrobeTab}', '${item.id}')" 
                 title="${item.name}">
                ${sanalikaBadgeHtml}
                ${visualHtml}
                <div style="font-size:10.5px; font-weight:700; color:#f8fafc; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:96%; line-height:1.15;">${item.name} ${countTag}</div>
                ${previewBadge}
                <div style="width:100%;">${buttonHtml}</div>
            </div>`;
        } else {
            // Boş Slot (3x3 ızgarayı sabit tutar)
            html += `
                <div class="wardrobe-empty-slot" style="background: rgba(15, 23, 42, 0.35); border: 1.5px dashed rgba(255,255,255,0.08); border-radius: 10px; display: flex; align-items: center; justify-content: center; height: 102px; box-sizing: border-box;">
                    <span style="color: rgba(255,255,255,0.12); font-size: 16px; font-weight: 800;">-</span>
                </div>
            `;
        }
    }

    grid.innerHTML = html;
}

function unequipCurrentProp() {
    if (typeof previewAvatar !== 'undefined' && previewAvatar) {
        previewAvatar.heldItem = 'none';
    }
    if (typeof myAvatar !== 'undefined' && myAvatar) {
        myAvatar.heldItem = 'none';
    }
    if (typeof equipPropItem === 'function') {
        equipPropItem('props_none');
    } else if (typeof socket !== 'undefined' && socket.connected) {
        socket.emit('equipPropItem', { itemKey: 'props_none' });
    }
}
window.unequipCurrentProp = unequipCurrentProp;

function unequipWardrobeItem(category, itemId) {
    if (!myAvatar) return;

    if (category === 'costumes' || (itemId && itemId.startsWith('costume_'))) {
        myAvatar.costume = null;
        if (typeof previewAvatar !== 'undefined' && previewAvatar) previewAvatar.costume = null;
        if (typeof players !== 'undefined' && players[myId]) players[myId].costume = null;
        if (typeof dressingAvatar !== 'undefined' && dressingAvatar) dressingAvatar.costume = null;
        socket.emit('buyWardrobeItem', { category: 'costumes', id: 'costume_none' });
        if (typeof showGameNotification === 'function') showGameNotification('🎭 Kostüm çıkarıldı.');
    } else if (category === 'outfits') {
        const defShirt = (myAvatar.model === 'karakter_2' ? 'k2_cyber_street' : '#3b82f6');
        const defPants = (myAvatar.model === 'karakter_2' ? 'pants_k2_tactical_jogger' : 'pants_classic_jeans');
        myAvatar.outfit = null;
        myAvatar.costume = null;
        myAvatar.shirt = defShirt;
        myAvatar.color = defShirt;
        myAvatar.shirtColor = 'original';
        myAvatar.pants = defPants;
        myAvatar.pantsColor = 'original';
        if (typeof previewAvatar !== 'undefined' && previewAvatar) {
            previewAvatar.outfit = null;
            previewAvatar.costume = null;
            previewAvatar.shirt = defShirt;
            previewAvatar.color = defShirt;
            previewAvatar.shirtColor = 'original';
            previewAvatar.pants = defPants;
            previewAvatar.pantsColor = 'original';
        }
        if (typeof players !== 'undefined' && players[myId]) {
            players[myId].outfit = null;
            players[myId].costume = null;
            players[myId].shirt = defShirt;
            players[myId].color = defShirt;
            players[myId].shirtColor = 'original';
            players[myId].pants = defPants;
            players[myId].pantsColor = 'original';
        }
        socket.emit('saveDressingOutfit', {
            avatar: {
                ...myAvatar,
                outfit: null,
                costume: null,
                shirt: defShirt,
                shirtColor: 'original',
                pants: defPants,
                pantsColor: 'original',
                shoes: myAvatar.shoes || 'sneakers',
                hat: myAvatar.hat || 'none',
                face: myAvatar.face || 'none'
            }
        });
        if (typeof showGameNotification === 'function') showGameNotification('👗 Kıyafet çıkarıldı, varsayılan giysilere dönüldü.');
    } else if (category === 'hats') {
        myAvatar.hat = 'none';
        if (typeof previewAvatar !== 'undefined' && previewAvatar) previewAvatar.hat = 'none';
        if (typeof players !== 'undefined' && players[myId]) players[myId].hat = 'none';
        socket.emit('buyWardrobeItem', { category: 'hats', id: 'none' });
        if (typeof showGameNotification === 'function') showGameNotification('🧢 Şapka çıkarıldı.');
    } else if (category === 'hair') {
        myAvatar.hair = 'none';
        if (typeof previewAvatar !== 'undefined' && previewAvatar) previewAvatar.hair = 'none';
        if (typeof players !== 'undefined' && players[myId]) players[myId].hair = 'none';
        socket.emit('buyWardrobeItem', { category: 'hair', id: 'none' });
        if (typeof showGameNotification === 'function') showGameNotification('💇 Saç modeli çıkarıldı.');
    } else if (category === 'faces') {
        myAvatar.face = 'none';
        if (typeof previewAvatar !== 'undefined' && previewAvatar) previewAvatar.face = 'none';
        if (typeof players !== 'undefined' && players[myId]) players[myId].face = 'none';
        socket.emit('buyWardrobeItem', { category: 'faces', id: 'none' });
        if (typeof showGameNotification === 'function') showGameNotification('🕶️ Yüz aksesuarı çıkarıldı.');
    } else if (category === 'watches') {
        myAvatar.watch = 'none';
        if (typeof previewAvatar !== 'undefined' && previewAvatar) previewAvatar.watch = 'none';
        if (typeof players !== 'undefined' && players[myId]) players[myId].watch = 'none';
        socket.emit('buyWardrobeItem', { category: 'watches', id: 'none' });
        if (typeof showGameNotification === 'function') showGameNotification('⌚ Saat çıkarıldı.');
    } else if (category === 'shoes') {
        const defShoes = (window.myGender === 'female' ? 'flats' : 'sneakers');
        myAvatar.shoes = defShoes;
        if (typeof previewAvatar !== 'undefined' && previewAvatar) previewAvatar.shoes = defShoes;
        if (typeof players !== 'undefined' && players[myId]) players[myId].shoes = defShoes;
        socket.emit('buyWardrobeItem', { category: 'shoes', id: defShoes });
        if (typeof showGameNotification === 'function') showGameNotification('👟 Ayakkabı varsayılana döndürüldü.');
    } else if (category === 'tshirts' || category === 'shirts') {
        const defShirt = (myAvatar.model === 'karakter_2' ? 'k2_cyber_street' : '#3b82f6');
        myAvatar.shirt = defShirt;
        myAvatar.color = defShirt;
        myAvatar.shirtColor = 'original';
        if (typeof previewAvatar !== 'undefined' && previewAvatar) {
            previewAvatar.shirt = defShirt;
            previewAvatar.color = defShirt;
            previewAvatar.shirtColor = 'original';
        }
        if (typeof players !== 'undefined' && players[myId]) {
            players[myId].shirt = defShirt;
            players[myId].color = defShirt;
            players[myId].shirtColor = 'original';
        }
        socket.emit('buyWardrobeItem', { category: 'shirts', id: defShirt });
        if (typeof showGameNotification === 'function') showGameNotification('👕 Tişört varsayılana döndürüldü.');
    } else if (category === 'pants') {
        const defPants = (myAvatar.model === 'karakter_2' ? 'pants_k2_tactical_jogger' : 'pants_classic_jeans');
        myAvatar.pants = defPants;
        myAvatar.pantsColor = 'original';
        if (typeof previewAvatar !== 'undefined' && previewAvatar) {
            previewAvatar.pants = defPants;
            previewAvatar.pantsColor = 'original';
        }
        if (typeof players !== 'undefined' && players[myId]) {
            players[myId].pants = defPants;
            players[myId].pantsColor = 'original';
        }
        socket.emit('buyWardrobeItem', { category: 'pants', id: defPants });
        if (typeof showGameNotification === 'function') showGameNotification('👖 Pantolon varsayılana döndürüldü.');
    } else if (category === 'props') {
        if (typeof unequipCurrentProp === 'function') unequipCurrentProp();
    }

    if (typeof previewAvatar !== 'undefined' && previewAvatar) {
        previewAvatar = { ...myAvatar };
    }
    renderWardrobeActiveGrid();
    if (typeof drawAvatarPreview === 'function') drawAvatarPreview();
    if (typeof renderDressingAvatar === 'function') renderDressingAvatar();
    if (typeof updateDressingCategoryCounts === 'function') updateDressingCategoryCounts();
}
window.unequipWardrobeItem = unequipWardrobeItem;

function selectK2HairColor(hex, itemId, event) {
    if (event) event.stopPropagation();

    if (!previewAvatar) previewAvatar = { ...myAvatar };
    if (itemId) {
        if (itemId.startsWith('hair_')) {
            previewAvatar.hair = itemId;
        } else {
            previewAvatar.hat = itemId;
        }
    }
    previewAvatar.hairColor = hex;

    // Eğer item zaten üzerindeyse, sunucuya bildir ve anında senkronize et
    if (myAvatar && (myAvatar.hair === itemId || myAvatar.hat === itemId || (!itemId && myAvatar.hair && myAvatar.hair.startsWith('hair_')))) {
        myAvatar.hairColor = hex;
        if (players[myId]) players[myId].hairColor = hex;
        socket.emit('setAvatarHairColor', { hairColor: hex });
    }

    updateK2HairColorPickerUI();
    renderWardrobeActiveGrid();
    if (typeof drawAvatarPreview === 'function') {
        drawAvatarPreview();
    }
}
window.selectK2HairColor = selectK2HairColor;

function updateWardrobeColorPickerUI() {
    const container = document.getElementById('wardrobeColorPickerContainer');
    if (!container) return;

    const colorEligibleTabs = ['hats', 'faces', 'outfits', 'tshirts', 'shirts', 'pants', 'shoes'];
    if (!colorEligibleTabs.includes(currentWardrobeTab)) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'flex';
    const origInfo = getActiveItemOriginalInfo(currentWardrobeTab);

    // Aktif seçili eşyanın izin verilen özel renk paleti var mı? (Örn: Sadece Kırmızı, Lacivert, Siyah olan Bileklikli Sneakers)
    let allowedColors = null;
    let activeItemId = null;
    if (typeof previewAvatar !== 'undefined' && previewAvatar) {
        if (currentWardrobeTab === 'hats') activeItemId = previewAvatar.hat;
        else if (currentWardrobeTab === 'faces') activeItemId = previewAvatar.face;
        else if (currentWardrobeTab === 'outfits') activeItemId = previewAvatar.outfit || previewAvatar.costume;
        else if (currentWardrobeTab === 'tshirts' || currentWardrobeTab === 'shirts') activeItemId = previewAvatar.shirt || previewAvatar.color;
        else if (currentWardrobeTab === 'pants') activeItemId = previewAvatar.pants;
        else if (currentWardrobeTab === 'shoes') activeItemId = previewAvatar.shoes;
    }
    if (typeof WARDROBE_CATALOG !== 'undefined') {
        const normTab = (currentWardrobeTab === 'shirts') ? 'tshirts' : currentWardrobeTab;
        const catItems = WARDROBE_CATALOG[normTab] || [];
        const found = catItems.find(x => x.id === activeItemId);
        if (found && Array.isArray(found.allowedColors)) {
            allowedColors = found.allowedColors;
        }
    }

    const availableColors = allowedColors
        ? WARDROBE_COLOR_OPTIONS.filter(o => allowedColors.includes(o.id) || allowedColors.includes(o.hex))
        : WARDROBE_COLOR_OPTIONS;

    // Seçili renk bu eşyada izin verilmiyorsa orijinal renge sıfırla
    if (selectedWardrobeColor !== 'original' && !availableColors.some(o => o.id === selectedWardrobeColor || o.hex === selectedWardrobeColor)) {
        selectedWardrobeColor = 'original';
        window.selectedWardrobeColor = 'original';
    }

    const label = document.getElementById('wardrobeActiveColorLabel');
    if (label) {
        if (selectedWardrobeColor === 'original') {
            label.innerText = `✨ Orijinal (${origInfo.name})`;
        } else {
            const activeOpt = availableColors.find(o => o.id === selectedWardrobeColor || o.hex === selectedWardrobeColor) || availableColors[0];
            label.innerText = activeOpt ? activeOpt.label : '';
        }
    }

    const swatchesContainer = document.getElementById('wardrobeColorSwatches');
    if (!swatchesContainer) return;

    swatchesContainer.innerHTML = availableColors.map(opt => {
        const isSelected = (selectedWardrobeColor === opt.id) || (selectedWardrobeColor === opt.hex);
        const activeClass = isSelected
            ? 'border: 2px solid #ffffff; box-shadow: 0 0 8px #38bdf8, inset 0 0 4px rgba(255,255,255,0.8); transform: scale(1.18);'
            : 'border: 1px solid rgba(255,255,255,0.3); opacity: 0.85;';

        let bgStyle = opt.bg;
        let titleText = opt.name;
        let innerHtml = '';
        if (opt.id === 'original') {
            bgStyle = origInfo.hex;
            titleText = `✨ Orijinal (${origInfo.name})`;
            innerHtml = `<span style="font-size: 8px; line-height: 16px; display: flex; align-items: center; justify-content: center; pointer-events: none; filter: drop-shadow(0 0 2px rgba(0,0,0,0.8));">✨</span>`;
        }

        return `
            <div title="${titleText}"
                 onclick="selectWardrobeColor('${opt.id}', '${opt.hex}', event)"
                 style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: ${bgStyle}; cursor: pointer; transition: all 0.15s ease; display: inline-flex; align-items: center; justify-content: center; ${activeClass}">
                ${innerHtml}
            </div>
        `;
    }).join('');
}
window.updateWardrobeColorPickerUI = updateWardrobeColorPickerUI;
window.updateK2HairColorPickerUI = updateWardrobeColorPickerUI;

function selectWardrobeColor(colorId, colorHex, event) {
    if (event && event.stopPropagation) event.stopPropagation();
    selectedWardrobeColor = colorId;
    window.selectedWardrobeColor = colorId;

    if (!previewAvatar) previewAvatar = { ...myAvatar };

    const effectiveCol = (colorId === 'original') ? 'original' : colorHex;

    if (currentWardrobeTab === 'hats') {
        previewAvatar.hatColor = effectiveCol;
    } else if (currentWardrobeTab === 'hair') {
        previewAvatar.hairColor = effectiveCol;
    } else if (currentWardrobeTab === 'faces') {
        previewAvatar.faceColor = effectiveCol;
    } else if (currentWardrobeTab === 'outfits') {
        previewAvatar.outfitColor = effectiveCol;
        previewAvatar.color = effectiveCol;
    } else if (currentWardrobeTab === 'tshirts' || currentWardrobeTab === 'shirts') {
        previewAvatar.shirtColor = effectiveCol;
        previewAvatar.color = effectiveCol;
    } else if (currentWardrobeTab === 'pants') {
        previewAvatar.pantsColor = effectiveCol;
    } else if (currentWardrobeTab === 'shoes') {
        previewAvatar.shoesColor = effectiveCol;
    }

    if (typeof drawAvatarPreview === 'function') drawAvatarPreview();
    updateWardrobeColorPickerUI();
    renderWardrobeActiveGrid();
}
window.selectWardrobeColor = selectWardrobeColor;
window.selectK2HairColor = selectWardrobeColor;

function buyWardrobeItem(category, id, colorId = null) {
    const colId = colorId || selectedWardrobeColor || 'original';
    const colorOpt = WARDROBE_COLOR_OPTIONS.find(o => o.id === colId || o.hex === colId) || { id: 'original', hex: 'original' };
    const payload = { 
        category: category, 
        id: id,
        color: colorOpt.id,
        colorHex: colorOpt.hex
    };
    if (category === 'hats') {
        payload.hatColor = colorOpt.hex;
    } else if (category === 'hair') {
        payload.hairColor = colorOpt.hex;
    } else if (category === 'faces') {
        payload.faceColor = colorOpt.hex;
    }
    socket.emit('buyWardrobeItem', payload);
}

socket.on('wardrobeUpdate', (data) => {
    if (data.inventory) {
        myInventory = data.inventory;
        window.myInventory = data.inventory;
    }
    if (data.skinSets) {
        mySkinSets = { ...mySkinSets, ...data.skinSets };
        window.mySkinSets = mySkinSets;
    }
    if (data.activeSlot) {
        currentSkinSlot = data.activeSlot;
        window.currentSkinSlot = currentSkinSlot;
    }
    if (data.avatar) {
        const prevHeld = myAvatar ? myAvatar.heldItem : null;
        myAvatar = data.avatar;
        if (!myAvatar.gender && (window.myGender || typeof getPlayerGender === 'function')) {
            myAvatar.gender = window.myGender || getPlayerGender();
        }
        if (!myAvatar.shoes) myAvatar.shoes = (window.myGender === 'female' ? 'flats' : 'sneakers');
        if (data.avatar.model) {
            myAvatar.model = (data.avatar.model === 'karakter_2' || data.avatar.model === 'character_2') ? 'karakter_2' : 'classic_2';
        } else if (!myAvatar.model) {
            myAvatar.model = 'classic_2';
        }
        if (myAvatar.outfit) {
            myAvatar.shirt = null;
            myAvatar.pants = null;
        } else {
            if (!myAvatar.shirt) myAvatar.shirt = myAvatar.color || '#3b82f6';
            if (!myAvatar.pants) myAvatar.pants = 'pants_classic_jeans';
        }
        if (!myAvatar.watch) myAvatar.watch = 'none';
        if (data.avatar.hair !== undefined) myAvatar.hair = data.avatar.hair;
        if (data.avatar.hairColor !== undefined) {
            myAvatar.hairColor = data.avatar.hairColor;
        }
        if (myAvatar.heldItem === 'sigara' && prevHeld !== 'sigara') {
            myAvatar._k2CigLit = false;
            myAvatar._k2UseLighter = true;
            if (typeof triggerK2SmokeAnimation === 'function') {
                triggerK2SmokeAnimation(myAvatar, true);
            }
        }
        previewAvatar = { ...myAvatar };
        if (players[myId]) Object.assign(players[myId], myAvatar);
    }
    updateSkinSetsUI();
    updateModelSelectorUI();
    renderWardrobeUI();
});

socket.on('playerAvatarChange', (data) => {
    let av = data.avatar || {};
    av = {
        model: (data.model === 'karakter_2' || (data.avatar && data.avatar.model === 'karakter_2')) ? 'karakter_2' : 'classic_2',
        hat: data.hat !== undefined ? data.hat : (data.avatar && data.avatar.hat !== undefined ? data.avatar.hat : 'none'),
        hair: data.hair || (data.avatar && data.avatar.hair) || 'none',
        face: data.face !== undefined ? data.face : (data.avatar && data.avatar.face !== undefined ? data.avatar.face : 'none'),
        skinColor: data.skinColor || (data.avatar && data.avatar.skinColor) || '#facc15',
        color: data.color || (data.avatar && data.avatar.color) || '#3b82f6',
        shirt: data.shirt || (data.avatar && (data.avatar.shirt || data.avatar.color)) || '#3b82f6',
        pants: data.pants || (data.avatar && data.avatar.pants) || 'pants_classic_jeans',
        outfit: (data.outfit !== undefined ? data.outfit : (data.avatar && data.avatar.outfit)) || null,
        watch: data.watch || (data.avatar && data.avatar.watch) || 'none',
        heldItem: data.heldItem || (data.avatar && data.avatar.heldItem) || 'none',
        shoes: data.shoes || (data.avatar && data.avatar.shoes) || 'sneakers'
    };
    av.model = (data.avatar && (data.avatar.model === 'karakter_2' || data.avatar.model === 'character_2')) ? 'karakter_2' : (data.model === 'karakter_2' ? 'karakter_2' : (av.model || 'classic_2'));
    if (!av.shirt) av.shirt = av.color || '#3b82f6';
    if (!av.pants) av.pants = 'pants_classic_jeans';
    if (!av.watch) av.watch = data.watch || 'none';
    if (data.hairColor !== undefined) {
        av.hairColor = data.hairColor;
    } else if (data.avatar && data.avatar.hairColor !== undefined) {
        av.hairColor = data.avatar.hairColor;
    }
    if (data.hatColor !== undefined) av.hatColor = data.hatColor;
    if (data.faceColor !== undefined) av.faceColor = data.faceColor;
    if (data.outfitColor !== undefined) av.outfitColor = data.outfitColor;
    if (data.shirtColor !== undefined) av.shirtColor = data.shirtColor;
    if (data.pantsColor !== undefined) av.pantsColor = data.pantsColor;
    if (data.shoesColor !== undefined) av.shoesColor = data.shoesColor;
    if (data.costume !== undefined) av.costume = data.costume;
    else if (data.avatar && data.avatar.costume !== undefined) av.costume = data.avatar.costume;

    if (players[data.id]) {
        const prevHeld = players[data.id].heldItem;
        Object.assign(players[data.id], av);
        if (av.heldItem === 'sigara' && prevHeld !== 'sigara') {
            players[data.id]._k2CigLit = false;
            players[data.id]._k2UseLighter = true;
            if (typeof triggerK2SmokeAnimation === 'function') {
                triggerK2SmokeAnimation(players[data.id], true);
            }
        }
    }
    if (data.id === myId) {
        const prevMyHeld = myAvatar ? myAvatar.heldItem : null;
        myAvatar = { ...myAvatar, ...av };
        if (!myAvatar.gender && (window.myGender || typeof getPlayerGender === 'function')) {
            myAvatar.gender = window.myGender || getPlayerGender();
        }
        previewAvatar = { ...myAvatar };
        if (av.heldItem === 'sigara' && prevMyHeld !== 'sigara') {
            myAvatar._k2CigLit = false;
            myAvatar._k2UseLighter = true;
            if (typeof triggerK2SmokeAnimation === 'function') {
                triggerK2SmokeAnimation(myAvatar, true);
            }
        }
        renderWardrobeUI();
    }
});

// --- 8 AÇILI AVATAR ÖNİZLEME DÖNDÜRME SİSTEMİ ---
const PREVIEW_FACING_ANGLES = [
    { key: 'down', label: 'Ön (Güney)' },
    { key: 'down-right', label: 'Sağ İleri' },
    { key: 'right', label: 'Sağ Profil' },
    { key: 'up-right', label: 'Sağ Geri' },
    { key: 'up', label: 'Tam Arka' },
    { key: 'up-left', label: 'Sol Geri' },
    { key: 'left', label: 'Sol Profil' },
    { key: 'down-left', label: 'Sol İleri' }
];
const PREVIEW_FACING_ANGLES_4WAY = [
    { key: 'down', label: 'Ön (Nostaljik)' },
    { key: 'right', label: 'Sağ Profil' },
    { key: 'up', label: 'Tam Arka' },
    { key: 'left', label: 'Sol Profil' }
];
window.previewFacing = 'down';

function rotateAvatarPreview(delta) {
    let curModel = (previewAvatar && previewAvatar.model) || (myAvatar && myAvatar.model) || 'classic_2';
    let isClassic = (curModel === 'classic');
    let anglesList = isClassic ? PREVIEW_FACING_ANGLES_4WAY : PREVIEW_FACING_ANGLES;

    let curIdx = anglesList.findIndex(a => a.key === (window.previewFacing || 'down'));
    if (curIdx === -1) curIdx = 0;
    let nextIdx = (curIdx + delta + anglesList.length) % anglesList.length;
    window.previewFacing = anglesList[nextIdx].key;
    let badge = document.getElementById('previewFacingBadge');
    if (badge) badge.innerText = anglesList[nextIdx].label;
    if (typeof drawAvatarPreview === 'function') drawAvatarPreview();
}
window.rotateAvatarPreview = rotateAvatarPreview;

(function setupPreviewCanvasDrag() {
    function initDrag() {
        let canvas = document.getElementById('avatarPreviewCanvas');
        if (!canvas) return;
        let isDragging = false;
        let startX = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            canvas.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let diffX = e.clientX - startX;
            if (Math.abs(diffX) > 22) {
                rotateAvatarPreview(diffX > 0 ? 1 : -1);
                startX = e.clientX;
            }
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                canvas.style.cursor = 'grab';
            }
        });
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', initDrag);
    } else {
        initDrag();
    }
})();

// --- AION 2 TARZI SKİN SETLERİ (PRESET 1 - 2 - 3) VE ŞANSLI KUTU SİSTEMİ ---
let currentSkinSlot = 1;
window.currentSkinSlot = 1;
let mySkinSets = {
    1: { name: 'Racon' },
    2: { name: 'Sahil' },
    3: { name: 'Şık' }
};
window.mySkinSets = mySkinSets;

function selectSkinSetSlot(slot) {
    slot = parseInt(slot) || 1;
    currentSkinSlot = slot;
    window.currentSkinSlot = slot;
    updateSkinSetsUI();

    let saved = mySkinSets && mySkinSets[slot];
    let isSlotSaved = saved && (saved.isSaved || saved.hat || saved.shirt || saved.model);
    if (isSlotSaved) {
        socket.emit('applySkinSet', { slot: slot });
        if (typeof previewAvatar !== 'undefined') {
            previewAvatar = {
                ...previewAvatar,
                model: 'classic_2',
                hat: saved.hat || 'bere',
                hair: saved.hair || 'none',
                face: saved.face || 'none',
                skinColor: saved.skinColor || '#facc15',
                color: saved.color || '#3b82f6',
                shirt: saved.shirt || '#3b82f6',
                pants: saved.pants || 'pants_classic_jeans',
                outfit: saved.outfit || null,
                watch: saved.watch || 'none',
                heldItem: saved.heldItem || 'none',
                shoes: saved.shoes || 'sneakers'
            };
            if (typeof renderAvatarPreview === 'function') renderAvatarPreview();
        }
    } else {
        if (typeof showFloatingToast === 'function') {
            showFloatingToast(`ℹ️ ${slot}. Set henüz boş. Kombinini yapıp "Sete Kaydet"e bas!`);
        } else if (typeof showFloatingText === 'function') {
            showFloatingText(`ℹ️ ${slot}. Set henüz boş. Kombinini yapıp "Sete Kaydet"e bas!`, '#38bdf8');
        }
    }
}
window.selectSkinSetSlot = selectSkinSetSlot;

function saveCurrentSkinSet() {
    let slot = currentSkinSlot || 1;
    let avToSave = previewAvatar ? { ...previewAvatar } : { ...myAvatar };
    let defaultNames = { 1: 'Racon', 2: 'Sahil', 3: 'Şık' };
    let setName = (mySkinSets && mySkinSets[slot] && mySkinSets[slot].name) || defaultNames[slot] || ('Set ' + slot);

    let setPayload = {
        model: 'classic_2',
        hat: avToSave.hat || 'bere',
        hair: avToSave.hair || 'none',
        face: avToSave.face || 'none',
        skinColor: avToSave.skinColor || '#facc15',
        color: avToSave.color || '#3b82f6',
        shirt: avToSave.outfit ? null : (avToSave.shirt || avToSave.color || '#3b82f6'),
        pants: avToSave.outfit ? null : (avToSave.pants || 'pants_classic_jeans'),
        outfit: avToSave.outfit || null,
        watch: avToSave.watch || 'none',
        heldItem: avToSave.heldItem || 'none',
        shoes: avToSave.shoes || 'sneakers',
        name: setName,
        isSaved: true
    };

    socket.emit('saveSkinSet', {
        slot: slot,
        avatar: setPayload,
        name: setName
    });

    if (!mySkinSets) mySkinSets = {};
    mySkinSets[slot] = setPayload;
    window.mySkinSets = mySkinSets;
    updateSkinSetsUI();

    if (typeof showSocialNotificationToast === 'function') {
        showSocialNotificationToast('💾', `${slot}. Skin Seti Kaydedildi`, `${setName} kombinin başarıyla saklandı.`);
    } else if (typeof showFloatingToast === 'function') {
        showFloatingToast(`💾 ${slot}. Set başarıyla kaydedildi!`);
    }
}
window.saveCurrentSkinSet = saveCurrentSkinSet;

function updateSkinSetsUI() {
    [1, 2, 3].forEach(slot => {
        let btn = document.getElementById(`skinSetSlot${slot}`);
        if (!btn) return;
        let isActive = (currentSkinSlot === slot);
        let saved = mySkinSets && mySkinSets[slot];
        let hasData = saved && (saved.isSaved || saved.hat || saved.shirt || saved.model);

        if (isActive) {
            btn.style.borderColor = '#facc15';
            btn.style.background = 'linear-gradient(135deg, rgba(250, 204, 21, 0.4), rgba(202, 138, 4, 0.4))';
            btn.style.color = '#fef08a';
            btn.style.boxShadow = '0 0 12px rgba(250, 204, 21, 0.5)';
            btn.innerHTML = `${slot} ${hasData ? '⭐' : ''}`;
        } else {
            btn.style.borderColor = hasData ? '#38bdf8' : 'rgba(255,255,255,0.15)';
            btn.style.background = hasData ? 'rgba(14, 165, 233, 0.18)' : 'rgba(30, 41, 59, 0.6)';
            btn.style.color = hasData ? '#7dd3fc' : '#94a3b8';
            btn.style.boxShadow = 'none';
            btn.innerHTML = `${slot} ${hasData ? '✓' : ''}`;
        }
    });
}
window.updateSkinSetsUI = updateSkinSetsUI;

// --- ŞANSLI KUTU SATIN ALMA VE ÖDÜL KONTROLÜ ---
let lastBoxReward = null;

function openMysteryBox(type) {
    if (!socket || !socket.emit) return;
    socket.emit('openMysteryBox', { type: type });
}
window.openMysteryBox = openMysteryBox;

socket.on('skinSetsUpdate', (data) => {
    if (data.skinSets) {
        mySkinSets = { ...mySkinSets, ...data.skinSets };
        window.mySkinSets = mySkinSets;
    }
    if (data.activeSlot) {
        currentSkinSlot = data.activeSlot;
        window.currentSkinSlot = currentSkinSlot;
    }
    updateSkinSetsUI();
});

socket.on('loginSuccess', (data) => {
    if (data && data.avatar) {
        myAvatar = { ...(myAvatar || {}), ...data.avatar };
        if (!myAvatar.gender && (data.gender || window.myGender)) {
            myAvatar.gender = data.gender || window.myGender;
        }
        if (myAvatar.model === 'karakter_2') {
            const isFem = (myAvatar.gender === 'female');
            if (!myAvatar.shirt && !myAvatar.outfit) {
                myAvatar.shirt = isFem ? 'top_k2_pastel_hoodie' : 'k2_cyber_street';
                myAvatar.shirtColor = myAvatar.shirt;
                myAvatar.color = myAvatar.shirt;
            }
            if (!myAvatar.pants && !myAvatar.outfit) {
                myAvatar.pants = isFem ? 'pants_k2_cargo_mini' : 'pants_k2_tactical_jogger';
            }
            if (!myAvatar.shoes) {
                myAvatar.shoes = isFem ? 'shoes_k2_chunky_sneaker' : 'shoes_k2_skate_pro';
            }
            if (!myAvatar.hair || myAvatar.hair === 'none') {
                myAvatar.hair = isFem ? 'hair_k2_hime_cut' : 'hair_k2_fade_pompadour';
            }
        }
        window.myAvatar = myAvatar;
        previewAvatar = { ...myAvatar };
        window.previewAvatar = previewAvatar;
    }
    if (data && data.skinSets) {
        mySkinSets = { ...mySkinSets, ...data.skinSets };
        window.mySkinSets = mySkinSets;
        updateSkinSetsUI();
    }
});

socket.on('skinSetsUpdate', (data) => {
    if (data && data.skinSets) {
        mySkinSets = data.skinSets;
        window.mySkinSets = mySkinSets;
        if (data.activeSlot !== undefined) {
            currentSkinSlot = data.activeSlot;
        }
        updateSkinSetsUI();
    }
});

socket.on('mysteryBoxReward', (data) => {
    lastBoxReward = data.reward;
    const modal = document.getElementById('mysteryBoxRewardModal');
    if (!modal) return;

    const r = data.reward;
    const titleElem = document.getElementById('mbrBoxTitle');
    const badgeElem = document.getElementById('mbrRarityBadge');
    const iconElem = document.getElementById('mbrItemIcon');
    const nameElem = document.getElementById('mbrItemName');
    const costElem = document.getElementById('mbrItemCost');
    const noticeElem = document.getElementById('mbrNoticeText');
    const equipBtn = document.getElementById('mbrEquipBtn');

    if (titleElem) {
        titleElem.innerText = data.boxType === 'pet' ? '🐾 ŞANSLI PET ÇIKTI!' : (data.boxType === 'props' ? '🖐️ EL EŞYASI KAZANDIN!' : '👗 KIYAFET KAZANDIN!');
    }

    if (badgeElem) {
        badgeElem.innerText = r.rarity || 'Nadir';
        if (r.isJackpot || r.cost >= 5000) {
            badgeElem.style.background = 'linear-gradient(135deg, #ef4444, #b91c1c)';
            badgeElem.innerText = '🔥 EFSANEVİ JACKPOT!';
        } else if (r.rarity === 'Efsanevi' || r.isPet) {
            badgeElem.style.background = 'linear-gradient(135deg, #ec4899, #8b5cf6)';
        } else {
            badgeElem.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
        }
    }

    if (iconElem) iconElem.innerText = r.icon || '🎁';
    if (nameElem) nameElem.innerText = r.name || 'Özel Eşya';
    if (costElem) costElem.innerText = (r.cost || 0).toLocaleString() + ' TL';

    if (noticeElem) {
        if (r.isPet) {
            noticeElem.innerHTML = '🐾 <b>15 Dakika</b> boyunca yanından ayrılmayacak ve seninle gezecek!';
            if (equipBtn) equipBtn.style.display = 'none';
        } else {
            noticeElem.innerHTML = r.alreadyOwned ? '💡 Bu eşyaya zaten sahiptin, gardırobunda mevcut!' : '🎉 Envanterine başarıyla eklendi!';
            if (equipBtn) {
                equipBtn.style.display = 'block';
                equipBtn.innerText = '⚡ Hemen Kuşan';
            }
        }
    }

    modal.style.display = 'flex';
    renderWardrobeUI();
});

function equipRewardFromBox() {
    if (!lastBoxReward) {
        closeMysteryBoxRewardModal();
        return;
    }
    const r = lastBoxReward;
    if (r.category && r.id) {
        buyWardrobeItem(r.category, r.id);
    }
    closeMysteryBoxRewardModal();
}
window.equipRewardFromBox = equipRewardFromBox;

function closeMysteryBoxRewardModal() {
    const modal = document.getElementById('mysteryBoxRewardModal');
    if (modal) modal.style.display = 'none';
    lastBoxReward = null;
}
window.closeMysteryBoxRewardModal = closeMysteryBoxRewardModal;

window.isItemOwned = isItemOwned;
window.itemMatchesModel = itemMatchesModel;
window.WARDROBE_CATALOG = WARDROBE_CATALOG;

function selectWardrobeItemColor(category, colorHex, itemId, evt) {
    if (evt && evt.stopPropagation) evt.stopPropagation();
    if (!previewAvatar) previewAvatar = { ...myAvatar };

    const matchOpt = WARDROBE_COLOR_OPTIONS.find(o => o.hex === colorHex || o.id === colorHex);
    if (matchOpt) {
        selectedWardrobeColor = matchOpt.id;
        window.selectedWardrobeColor = matchOpt.id;
    }

    if (category === 'hair') {
        previewAvatar.hairColor = colorHex;
        if (myAvatar) {
            myAvatar.hairColor = colorHex;
            if (typeof players !== 'undefined' && players[myId]) players[myId].hairColor = colorHex;
            if (typeof socket !== 'undefined' && socket.emit) socket.emit('setAvatarHairColor', { hairColor: colorHex });
        }
    } else if (category === 'hats') {
        previewAvatar.hatColor = colorHex;
    } else if (category === 'faces') {
        previewAvatar.faceColor = colorHex;
    } else if (category === 'outfits') {
        previewAvatar.outfitColor = colorHex;
        previewAvatar.color = colorHex;
    } else if (category === 'tshirts' || category === 'shirts') {
        previewAvatar.shirtColor = colorHex;
        previewAvatar.color = colorHex;
    } else if (category === 'pants') {
        previewAvatar.pantsColor = colorHex;
    } else if (category === 'shoes') {
        previewAvatar.shoesColor = colorHex;
    }

    if (typeof drawAvatarPreview === 'function') drawAvatarPreview();
    renderWardrobeUI();
    if (typeof updateK2HairColorPickerUI === 'function') updateK2HairColorPickerUI();
}
window.selectWardrobeItemColor = selectWardrobeItemColor;
