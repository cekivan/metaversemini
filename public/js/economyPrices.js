(function(root) {
    const PRICE_RULES = {
        clothingMultiplier: 2,
        watchMultiplier: 8,
        houseMultiplier: 3,
        slotMachineMultiplier: 7,
        pokerTableMultiplier: 7,
        lemonadeStandMultiplier: 3,
        handheldItemAddition: 100,
        dailyQuestMultiplier: 3
    };

    const baseWardrobePrices = {
        hats_none: 0, hats_bere: 200, hats_kasket: 260, hats_fes: 320, hats_cowboy: 380,
        hats_korsan: 420, hats_sihirbaz: 360, hats_kulaklik: 250,
        hats_hair_long: 260, hats_hair_wavy: 320, hats_hair_ponytail: 280, hats_hair_braids: 290,
        hats_hair_bob: 240, hats_hair_hijab: 250, hats_beret_pink: 260, hats_crown: 480,
        hats_hair_blonde_curls: 310, hats_hair_bun_chopsticks: 290, hats_hair_redhead_wavy: 300,
        hats_hair_pigtails_ribbon: 280, hats_hair_curly_brown: 290,
        hats_k2_skater_bucket: 280,
        hats_hair_k2_twin_tails: 290, hats_hair_k2_wavy_shoulder: 320, hats_hair_k2_hime_cut: 300,
        hats_hair_k2_fade_pompadour: 320, hats_hair_k2_anime_spiky: 340, hats_hair_k2_ponytail: 320, hats_hair_k2_messy_bun: 330,
        // Saçlar Segmenti (Hair) Fiyatları
        hair_none: 0,
        hair_hair_long: 260, hair_long: 260, hair_hair_wavy: 320, hair_wavy: 320, hair_hair_ponytail: 280, hair_ponytail: 280, hair_hair_braids: 290, hair_braids: 290,
        hair_hair_bob: 240, hair_bob: 240, hair_hair_hijab: 250, hair_hijab: 250,
        hair_hair_blonde_curls: 310, hair_blonde_curls: 310, hair_hair_bun_chopsticks: 290, hair_bun_chopsticks: 290, hair_hair_redhead_wavy: 300, hair_redhead_wavy: 300,
        hair_hair_pigtails_ribbon: 280, hair_pigtails_ribbon: 280, hair_hair_curly_brown: 290, hair_curly_brown: 290,
        hair_hair_k2_twin_tails: 290, hair_k2_twin_tails: 290, hair_hair_k2_wavy_shoulder: 320, hair_k2_wavy_shoulder: 320, hair_hair_k2_hime_cut: 300, hair_k2_hime_cut: 300,
        hair_hair_k2_fade_pompadour: 320, hair_k2_fade_pompadour: 320, hair_hair_k2_anime_spiky: 340, hair_k2_anime_spiky: 340, hair_hair_k2_ponytail: 320, hair_k2_ponytail: 320, hair_hair_k2_messy_bun: 330, hair_k2_messy_bun: 330,
        hair_hair_k2_curtain_bangs: 340, hair_hair_k2_french_bob: 330, hair_hair_k2_layered_blowout: 360, hair_hair_k2_half_up_braid: 350, hair_hair_k2_flaming_fire: 650,
        faces_none: 0, faces_mustache: 240, faces_sunglasses: 300, faces_beard: 360,
        faces_viking_beard: 380, faces_goth_face_veil: 320, faces_shadow_stubble_scar: 350, faces_cute_blush_freckles: 280, faces_goth_eyeliner_heart: 300,
        faces_sunglasses_retro: 50, sunglasses_retro: 50, faces_sunglasses_aviator: 75, sunglasses_aviator: 75, faces_sunglasses_cateye: 60, sunglasses_cateye: 60, faces_sunglasses_cyber: 100, sunglasses_cyber: 100, faces_sunglasses_lennon: 80, sunglasses_lennon: 80, faces_sunglasses_polar: 45, sunglasses_polar: 45, faces_sunglasses_star: 70, sunglasses_star: 70, faces_sunglasses_pixel: 90, sunglasses_pixel: 90,
        // 2.5D İzometrik Hayvan Kostümleri (2.000 TL - 5.000 TL Arası)
        costumes_costume_zombie_1: 4000, costume_zombie_1: 4000,
        costumes_costume_zombie_2: 4200, costume_zombie_2: 4200,
        costumes_costume_zombie_3: 4400, costume_zombie_3: 4400,
        costumes_costume_elephant: 4500, costume_elephant: 4500,
        costumes_costume_cockroach: 3800, costume_cockroach: 3800,
        costumes_costume_bird: 3500, costume_bird: 3500,
        costumes_costume_spider: 2900, costume_spider: 2900,
        costumes_costume_lion: 4800, costume_lion: 4800,
        costumes_costume_panda: 2600, costume_panda: 2600,
        costumes_costume_frog: 3200, costume_frog: 3200,
        costumes_costume_trex: 5000, costume_trex: 5000,
        costumes_costume_anaconda: 4500, costume_anaconda: 4500,
        costumes_costume_none: 0, costume_none: 0,
        'skins_#facc15': 0, 'skins_#ffd1a4': 240, 'skins_#d2996c': 300, 'skins_#8d5524': 360,
        outfits_outfit_c2_gentleman: 380, outfits_c2_gentleman: 380,
        outfits_outfit_c2_street_cool: 340, outfits_c2_street_cool: 340,
        outfits_outfit_c2_casual_polo: 310, outfits_c2_casual_polo: 310,
        outfits_outfit_c2_femme_chic: 360, outfits_c2_femme_chic: 360,
        outfits_outfit_dress_pink: 280, outfits_dress_pink: 280,
        outfits_outfit_dress_black: 380, outfits_dress_black: 380,
        outfits_outfit_dress_red: 310, outfits_dress_red: 310,
        outfits_outfit_dress_bridal: 490, outfits_dress_bridal: 490,
        outfits_outfit_goth: 360, outfits_goth: 360,
        outfits_outfit_business: 330, outfits_business: 330,
        outfits_outfit_boho: 280, outfits_boho: 280,
        outfits_outfit_sporty: 250, outfits_sporty: 250,
        outfits_dress_emerald: 340, outfits_dress_lavender: 290,
        outfits_dress_vintage_polka: 300, outfits_dress_ocean_blue: 270,
        outfits_outfit_turtleneck_skirt: 290, outfits_turtleneck_skirt: 290,
        outfits_dress_k2_cyber_street: 360, outfits_outfit_dress_k2_cyber_street: 360,
        outfits_dress_k2_goth_grunge: 380, outfits_outfit_dress_k2_goth_grunge: 380,
        outfits_outfit_k2_tuxedo: 450, outfits_k2_tuxedo: 450,
        outfits_outfit_k2_street_overcoat: 420, outfits_k2_street_overcoat: 420,
        outfits_dress_k2_scarlet_gala: 440, outfits_outfit_dress_k2_scarlet_gala: 440,
        outfits_outfit_k2_kpop_rebel: 430, outfits_k2_kpop_rebel: 430,
        outfits_outfit_k2_techwear_bomber: 460, outfits_k2_techwear_bomber: 460,
        outfits_outfit_k2_cyber_chic: 450, outfits_k2_cyber_chic: 450,
        outfits_outfit_k2_cat: 3200, outfit_k2_cat: 3200,
        'tshirts_#3b82f6': 0, 'tshirts_#ef4444': 100, 'tshirts_#10b981': 100,
        'tshirts_#8b5cf6': 100, 'tshirts_#f59e0b': 100, 'tshirts_#0f172a': 100,
        tshirts_polo: 160, tshirts_hoodie: 220, tshirts_leather: 350,
        tshirts_skirt_crop: 220, tshirts_skirt_denim: 240,
        tshirts_k2_cyber_street: 240, tshirts_k2_graffiti_oversize: 260,
        tshirts_top_k2_cyber_crop: 260, tshirts_top_k2_grunge_oversize: 250, tshirts_top_k2_pastel_hoodie: 270,
        pants_pants_classic_jeans: 0, pants_classic_jeans: 0,
        pants_pants_classic_black: 190, pants_classic_black: 190,
        pants_pants_classic_beige: 170, pants_classic_beige: 170,
        pants_pants_classic_cargo_olive: 200, pants_classic_cargo_olive: 200,
        pants_pants_classic_white_skirt: 210, pants_classic_white_skirt: 210,
        pants_pants_k2_tactical_jogger: 220, pants_k2_tactical_jogger: 220,
        pants_pants_k2_skater_cargo: 220, pants_k2_skater_cargo: 220,
        pants_pants_k2_cargo_mini: 260, pants_k2_cargo_mini: 260,
        pants_pants_k2_flared_jeans: 280, pants_k2_flared_jeans: 280,
        pants_pants_k2_goth_fishnet: 290, pants_k2_goth_fishnet: 290,
        watches_none: 0, watches_watch_none: 0, watch_none: 0,
        watches_watch_gold_rolex: 500, watch_gold_rolex: 500,
        watches_watch_leather_classic: 350, watch_leather_classic: 350,
        watches_watch_cyber_sport: 420, watch_cyber_sport: 420,
        watches_watch_k2_tourbillon_astral: 680, watch_k2_tourbillon_astral: 680,
        'shirts_#3b82f6': 0, 'shirts_#ef4444': 100, 'shirts_#10b981': 100,
        'shirts_#8b5cf6': 100, 'shirts_#f59e0b': 100, 'shirts_#0f172a': 100,
        shirts_polo: 160, shirts_hoodie: 220, shirts_leather: 350,
        shirts_k2_cyber_street: 240, shirts_k2_graffiti_oversize: 260,
        shirts_top_k2_cyber_crop: 260, shirts_top_k2_grunge_oversize: 250, shirts_top_k2_pastel_hoodie: 270,
        shirts_dress_pink: 280, shirts_dress_black: 380, shirts_dress_red: 310,
        shirts_skirt_crop: 260, shirts_skirt_denim: 240,
        shirts_dress_emerald: 340, shirts_dress_lavender: 290, shirts_dress_bridal: 490,
        shirts_outfit_goth: 360, shirts_outfit_business: 330, shirts_outfit_boho: 280,
        shirts_outfit_sporty: 250, shirts_dress_vintage_polka: 300, shirts_dress_ocean_blue: 270,
        shirts_outfit_turtleneck_skirt: 290,
        shoes_none: 0,
        shoes_sneakers: 180, shoes_classic: 240, shoes_boots: 280, shoes_heels: 320,
        shoes_flats: 190, shoes_heels_gold: 340, shoes_boots_thigh_high: 350, shoes_sandals_gladiator: 220,
        shoes_shoes_k2_chunky_sneaker: 200, shoes_k2_chunky_sneaker: 200,
        shoes_shoes_k2_skate_pro: 200, shoes_k2_skate_pro: 200,
        shoes_shoes_k2_goth_boots: 280, shoes_k2_goth_boots: 280,
        shoes_shoes_k2_high_sneakers: 350, shoes_k2_high_sneakers: 350,
        shoes_shoes_k2_nb_runner: 340, shoes_k2_nb_runner: 340,
        props_none: 0, props_nargile: 700, props_cay: 100, props_oralet: 300, props_kahve: 110, props_balon: 120,
        props_kilic: 250, props_oyuncak_araba: 300, props_gazoz: 140, props_tespih: 400,
        props_tespih2: 450, props_olta: 200, props_baglama: 220, props_asagold: 260,
        props_kupa: 290, props_gitar: 350, props_sirtcantasi: 220, props_sigara: 9900,
        props_k2_energy_drink: 150, props_props_k2_energy_drink: 150,
        props_k2_skateboard: 350, props_props_k2_skateboard: 350,
        props_sauron_staff: 1200, props_props_sauron_staff: 1200,
        props_inferno_katana: 950, props_props_inferno_katana: 950,
        // Yeni El Eşyaları
        props_oyuncak_dinozor: 320, props_props_oyuncak_dinozor: 320,
        props_su_tabancasi: 380, props_props_su_tabancasi: 380,
        props_drone: 650, props_props_drone: 650,
        props_supurge: 420, props_props_supurge: 420,
        props_turk_bayragi: 100, props_props_turk_bayragi: 100,
        props_bayrak_gs: 250, props_props_bayrak_gs: 250,
        props_bayrak_fb: 250, props_props_bayrak_fb: 250,
        props_bayrak_bjk: 250, props_props_bayrak_bjk: 250,
        props_bayrak_ts: 250, props_props_bayrak_ts: 250,
        props_zeus_yildirimi: 5000, props_props_zeus_yildirimi: 5000,
        // Yeni K2 Kız Tişörtler & Üstler
        tshirts_top_k2_urban_hoodie: 320, top_k2_urban_hoodie: 320, shirts_top_k2_urban_hoodie: 320,
        tshirts_top_k2_y2k_butterfly_crop: 280, top_k2_y2k_butterfly_crop: 280,
        tshirts_top_k2_boxy_street_tee: 270, top_k2_boxy_street_tee: 270,
        tshirts_top_k2_corset_bustier: 320, top_k2_corset_bustier: 320,
        tshirts_top_k2_asymmetric_cutout: 290, top_k2_asymmetric_cutout: 290,
        // Yeni K2 Kız Pantolonlar
        pants_pants_k2_parachute_cargo: 290, pants_k2_parachute_cargo: 290,
        pants_pants_k2_wide_leg_denim: 310, pants_k2_wide_leg_denim: 310,
        pants_pants_k2_low_rise_flare: 300, pants_k2_low_rise_flare: 300,
        pants_pants_k2_leather_cargo: 330, pants_k2_leather_cargo: 330,
        // Yeni K2 Saçlar (4 Estetik Kız Saçı + 1 Unisex Yanan Ateş Saç)
        hats_hair_k2_curtain_bangs: 340, hair_k2_curtain_bangs: 340,
        hats_hair_k2_french_bob: 330, hair_k2_french_bob: 330,
        hats_hair_k2_layered_blowout: 360, hair_k2_layered_blowout: 360,
        hats_hair_k2_half_up_braid: 350, hair_k2_half_up_braid: 350,
        hats_hair_k2_flaming_fire: 650, hair_k2_flaming_fire: 650,
        // Görünmezlik Kostümü Fiyat Tanımı
        outfits_costume_invisibility: 3000, costumes_costume_invisibility: 6000, costume_invisibility: 6000,
        // Madenci & İSG Baretleri (Baş Koruma)
        hats_baret_beyaz: 150, baret_beyaz: 150,
        hats_baret_sari: 120, baret_sari: 120,
        hats_baret_turuncu: 140, baret_turuncu: 140,
        hats_baret_mavi: 130, baret_mavi: 130,
        hats_baret_kirmizi: 140, baret_kirmizi: 140,
        hats_baret_yesil: 130, baret_yesil: 130,
        // Reflektörlü İş & Madenci Yelekleri (Gövde Koruma)
        tshirts_vest_reflector_yellow: 180, vest_reflector_yellow: 180,
        tshirts_vest_reflector_orange: 180, vest_reflector_orange: 180,
        tshirts_vest_reflector_blue: 190, vest_reflector_blue: 190,
        tshirts_vest_reflector_red: 190, vest_reflector_red: 190,
        shirts_vest_reflector_yellow: 180,
        shirts_vest_reflector_orange: 180,
        shirts_vest_reflector_blue: 190,
        shirts_vest_reflector_red: 190
    };

    const wardrobeItemPrices = Object.fromEntries(
        Object.entries(baseWardrobePrices).map(([key, price]) => {
            if (key.startsWith('outfits_') || key.startsWith('tshirts_') ||
                key.startsWith('shirts_') || key.startsWith('pants_') || key.startsWith('shoes_')) {
                return [key, price * PRICE_RULES.clothingMultiplier];
            }
            if (key.startsWith('watches_') || key.startsWith('watch_')) {
                return [key, price * PRICE_RULES.watchMultiplier];
            }
            if (key.startsWith('props_') && price > 0) {
                return [key, price + PRICE_RULES.handheldItemAddition];
            }
            return [key, price];
        })
    );

    const baseHousePrices = { standart: 1375, garden: 2750, pool: 4125 };
    const housePrices = Object.fromEntries(
        Object.entries(baseHousePrices).map(([type, price]) => [type, price * PRICE_RULES.houseMultiplier])
    );

    const baseFurniturePrices = {
        bitki: 200, hali: 240, sedir: 280, kitaplik: 320, berjer: 360,
        yemek_masasi: 400, akvaryum: 440, tv: 480, gramofon: 520, somine: 550,
        bilgisayar: 570, arcade: 590, piyano: 600, meyve_arabasi: 490,
        slot_machine: 750, roulette_table: 850
    };
    const furniturePrices = { ...baseFurniturePrices };
    furniturePrices.meyve_arabasi *= PRICE_RULES.lemonadeStandMultiplier;
    furniturePrices.slot_machine *= PRICE_RULES.slotMachineMultiplier;
    furniturePrices.roulette_table *= PRICE_RULES.pokerTableMultiplier;

    const baseDailyQuestRewards = {
        okey101_play: 60, batak_play: 50, tavla_play: 40, drink_tea: 20, go_fishing: 30
    };
    const dailyQuestRewards = Object.fromEntries(
        Object.entries(baseDailyQuestRewards).map(([questId, reward]) => [
            questId,
            reward * PRICE_RULES.dailyQuestMultiplier
        ])
    );

    const priceBook = {
        PRICE_RULES,
        WARDROBE_ITEM_PRICES: wardrobeItemPrices,
        HOUSE_PRICES: housePrices,
        FURNITURE_PRICES: furniturePrices,
        DAILY_QUEST_REWARDS: dailyQuestRewards
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = priceBook;
    }
    if (root) {
        root.METAVERSE_PRICES = priceBook;
    }
})(typeof window !== 'undefined' ? window : globalThis);
