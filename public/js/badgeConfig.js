// public/js/badgeConfig.js - 10 Kademeli Rozet Sistemi ve İlerleme Cetvelleri

const BADGE_TIERS = {
    // 1. Oyunbaz (gamer / gamerGamesCount)
    gamer: [
        { level: 1, min: 1, max: 9, title: "Acemi Oyuncu", glowClass: "", auraName: "", unit: "El" },
        { level: 2, min: 10, max: 24, title: "Masa yancısı", glowClass: "", auraName: "", unit: "El" },
        { level: 3, min: 25, max: 49, title: "Kıdemli Oyuncu", glowClass: "", auraName: "", unit: "El" },
        { level: 4, min: 50, max: 99, title: "Uzman Oyuncu", glowClass: "", auraName: "", unit: "El" },
        { level: 5, min: 100, max: 199, title: "Usta Oyuncu", glowClass: "", auraName: "", unit: "El" },
        { level: 6, min: 200, max: 349, title: "Büyük Usta", glowClass: "badge-glow-bronze", auraName: "🥉 Bronz Parlar", unit: "El" },
        { level: 7, min: 350, max: 599, title: "Racon Kesici", glowClass: "badge-glow-silver", auraName: "🥈 Gümüş Parlar", unit: "El" },
        { level: 8, min: 600, max: 999, title: "Şampiyon", glowClass: "badge-glow-gold", auraName: "🥇 Altın Parlar", unit: "El" },
        { level: 9, min: 1000, max: 1499, title: "Hükümdar", glowClass: "badge-glow-diamond", auraName: "💎 Elmas Parlar", unit: "El" },
        { level: 10, min: 1500, max: 9999999, title: "Oyunbaz", glowClass: "badge-glow-black", auraName: "🖤 Siyah Parlar (Max Tier)", unit: "El" }
    ],

    // 2. Botanik Rozeti (botanic / botanicHarvestCount)
    botanic: [
        { level: 1, min: 1, max: 14, title: "Acemi Bahçıvan", glowClass: "", auraName: "", unit: "Hasat" },
        { level: 2, min: 15, max: 49, title: "Çırak Bahçıvan", glowClass: "", auraName: "", unit: "Hasat" },
        { level: 3, min: 50, max: 99, title: "Kıdemli Bahçıvan", glowClass: "", auraName: "", unit: "Hasat" },
        { level: 4, min: 100, max: 199, title: "Uzman Bahçıvan", glowClass: "", auraName: "", unit: "Hasat" },
        { level: 5, min: 200, max: 399, title: "Usta Bahçıvan", glowClass: "", auraName: "", unit: "Hasat" },
        { level: 6, min: 400, max: 749, title: "Botanik Uzmanı", glowClass: "badge-glow-bronze", auraName: "🥉 Bronz Parlar", unit: "Hasat" },
        { level: 7, min: 750, max: 1249, title: "Çiçek Üstadı", glowClass: "badge-glow-silver", auraName: "🥈 Gümüş Parlar", unit: "Hasat" },
        { level: 8, min: 1250, max: 1999, title: "Botanik Şampiyonu", glowClass: "badge-glow-gold", auraName: "🥇 Altın Parlar", unit: "Hasat" },
        { level: 9, min: 2000, max: 3499, title: "Flora Hükümdarı", glowClass: "badge-glow-diamond", auraName: "💎 Elmas Parlar", unit: "Hasat" },
        { level: 10, min: 3500, max: 9999999, title: "Efsanevi Botanikçi", glowClass: "badge-glow-black", auraName: "🖤 Siyah Parlar (Max Tier)", unit: "Hasat" }
    ],

    // 3. Balıkçılık Rozeti (fishing / fishCaughtCount)
    fishing: [
        { level: 1, min: 1, max: 24, title: "Acemi Balıkçı", glowClass: "", auraName: "", unit: "Balık" },
        { level: 2, min: 25, max: 99, title: "Çırak Balıkçı", glowClass: "", auraName: "", unit: "Balık" },
        { level: 3, min: 100, max: 199, title: "Kıdemli Balıkçı", glowClass: "", auraName: "", unit: "Balık" },
        { level: 4, min: 200, max: 399, title: "Uzman Balıkçı", glowClass: "", auraName: "", unit: "Balık" },
        { level: 5, min: 400, max: 799, title: "Usta Balıkçı", glowClass: "", auraName: "", unit: "Balık" },
        { level: 6, min: 800, max: 1599, title: "Kaptan Balıkçı", glowClass: "badge-glow-bronze", auraName: "🥉 Bronz Parlar", unit: "Balık" },
        { level: 7, min: 1600, max: 3199, title: "Deniz Kurdu", glowClass: "badge-glow-silver", auraName: "🥈 Gümüş Parlar", unit: "Balık" },
        { level: 8, min: 3200, max: 5999, title: "Okyanus Avcısı", glowClass: "badge-glow-gold", auraName: "🥇 Altın Parlar", unit: "Balık" },
        { level: 9, min: 6000, max: 9999, title: "Denizler Hükümdarı", glowClass: "badge-glow-diamond", auraName: "💎 Elmas Parlar", unit: "Balık" },
        { level: 10, min: 10000, max: 9999999, title: "Poseidon'un Varisi", glowClass: "badge-glow-black", auraName: "🖤 Siyah Parlar (Max Tier)", unit: "Balık" }
    ],

    // 4. Madencilik Rozeti (mining / minedRocksCount)
    mining: [
        { level: 1, min: 1, max: 24, title: "Acemi Madenci", glowClass: "", auraName: "", unit: "Kaya" },
        { level: 2, min: 25, max: 99, title: "Çırak Madenci", glowClass: "", auraName: "", unit: "Kaya" },
        { level: 3, min: 100, max: 199, title: "Kıdemli Madenci", glowClass: "", auraName: "", unit: "Kaya" },
        { level: 4, min: 200, max: 399, title: "Uzman Madenci", glowClass: "", auraName: "", unit: "Kaya" },
        { level: 5, min: 400, max: 799, title: "Usta Madenci", glowClass: "", auraName: "", unit: "Kaya" },
        { level: 6, min: 800, max: 1599, title: "Cevher Avcısı", glowClass: "badge-glow-bronze", auraName: "🥉 Bronz Parlar", unit: "Kaya" },
        { level: 7, min: 1600, max: 3199, title: "Derin Kazıcı", glowClass: "badge-glow-silver", auraName: "🥈 Gümüş Parlar", unit: "Kaya" },
        { level: 8, min: 3200, max: 5999, title: "Maden Şampiyonu", glowClass: "badge-glow-gold", auraName: "🥇 Altın Parlar", unit: "Kaya" },
        { level: 9, min: 6000, max: 9999, title: "Yeraltı Hükümdarı", glowClass: "badge-glow-diamond", auraName: "💎 Elmas Parlar", unit: "Kaya" },
        { level: 10, min: 10000, max: 9999999, title: "Efsanevi Kazıcı", glowClass: "badge-glow-black", auraName: "🖤 Siyah Parlar (Max Tier)", unit: "Kaya" }
    ],

    // 5. Metaverse Sakini (resident / 1-100 Oyuncu Seviyesi)
    resident: [
        { level: 1, min: 0, max: 20, title: "Çaylak", glowClass: "", auraName: "", unit: "XP" },
        { level: 2, min: 20, max: 50, title: "Çaylak", glowClass: "", auraName: "", unit: "XP" }
    ]
};

// Eş anlamlı ID takma adları
BADGE_TIERS.fish = BADGE_TIERS.fishing;

const BADGE_CONFIG = [
    { id: 'gamer', name: 'Oyunbaz', shortName: 'Oyunbaz', icon: '🎮', statKey: 'gamerGamesCount', unit: 'El' },
    { id: 'botanic', name: 'Botanik Rozeti', shortName: 'Botanik', icon: '🌿', statKey: 'botanicHarvestCount', fallbackStatKey: 'botanicHarvestPoints', unit: 'Hasat' },
    { id: 'fishing', name: 'Balıkçılık', shortName: 'Balıkçılık', icon: '🎣', statKey: 'fishCaughtCount', unit: 'Balık' },
    { id: 'mining', name: 'Madencilik', shortName: 'Madencilik', icon: '⛏️', statKey: 'minedRocksCount', fallbackStatKey: 'minedCount', unit: 'Kaya' },
    { id: 'resident', name: 'Metaverse Sakini', shortName: 'Sakin', icon: '⭐', unit: 'XP', type: 'level', statKey: 'currentProgress' }
];

/**
 * Rozet kademesini ve ilerleme oranını hesaplar
 * @param {number} count - İlgili istatistik sayısı
 * @param {string} badgeIdOrType - 'gamer', 'botanic', 'fishing', 'mining', 'resident' vb.
 * @param {string} customUnit - Özel birim (örn: 'El', 'Hasat')
 * @param {boolean} isPrivate - Başkasının profili mi?
 */
function calculateUniversalBadgeTier(count, badgeIdOrType, customUnit = null, isPrivate = false) {
    count = Number(count) || 0;
    const badgeKey = (badgeIdOrType === 'fish' ? 'fishing' : (badgeIdOrType || 'gamer'));
    const tiers = BADGE_TIERS[badgeKey] || BADGE_TIERS.gamer;
    const unit = customUnit || (tiers[0] && tiers[0].unit) || 'Adet';

    // SEVİYE & METAVERSE SAKİNİ: Sol üstteki 1-100 Level sistemine ve canlı XP'ye bağlıdır!
    if (badgeKey === 'resident' || badgeIdOrType === 'resident' || badgeIdOrType === 'level') {
        const hasWin = (typeof window !== 'undefined');
        const lvl = (count !== undefined && count !== null) 
            ? Math.max(1, Number(count)) 
            : (hasWin && window.LevelClient && window.LevelClient.currentLevel !== undefined 
                ? Math.max(1, Number(window.LevelClient.currentLevel)) 
                : (hasWin && window.myLevel !== undefined ? Math.max(1, Number(window.myLevel)) : 1));

        const title = (hasWin && window.LevelClient && typeof window.LevelClient.getLevelTitle === 'function') 
            ? window.LevelClient.getLevelTitle(lvl) 
            : (typeof getLevelTitleHelper === 'function' 
                ? getLevelTitleHelper(lvl) 
                : (lvl >= 100 ? 'Yaşayan Efsane' : (lvl >= 86 ? 'Duayen' : (lvl >= 61 ? 'Şehir Hakimi' : (lvl >= 36 ? 'Kıdemli Müdavim' : (lvl >= 16 ? 'Esnaf & Zanaatkar' : 'Çaylak'))))));

        const curXP = (hasWin && window.LevelClient && window.LevelClient.currentProgress !== undefined) 
            ? Number(window.LevelClient.currentProgress) 
            : 0;
        const tgtXP = (hasWin && window.LevelClient && window.LevelClient.targetXP !== undefined && window.LevelClient.targetXP > 0) 
            ? Number(window.LevelClient.targetXP) 
            : (lvl === 1 ? 20 : Math.floor(20 * Math.pow(lvl - 1, 1.42)));
        const pct = tgtXP > 0 ? Math.min(100, Math.floor((curXP / tgtXP) * 100)) : 100;

        let glowClass = "";
        let auraName = "";
        if (lvl >= 100) { glowClass = "badge-glow-black"; auraName = "🖤 Siyah Parlar (Max Tier)"; }
        else if (lvl >= 86) { glowClass = "badge-glow-diamond"; auraName = "💎 Elmas Parlar"; }
        else if (lvl >= 61) { glowClass = "badge-glow-gold"; auraName = "🥇 Altın Parlar"; }
        else if (lvl >= 36) { glowClass = "badge-glow-silver"; auraName = "🥈 Gümüş Parlar"; }
        else if (lvl >= 16) { glowClass = "badge-glow-bronze"; auraName = "🥉 Bronz Parlar"; }

        return {
            level: lvl,
            levelTag: "Lv. " + lvl,
            title: title,
            tierDesc: title + " (Lv. " + lvl + ")",
            countText: lvl >= 100 ? "Maksimum Seviye" : (curXP + " / " + tgtXP + " XP"),
            targetCount: tgtXP,
            currentCount: curXP,
            progressPct: lvl >= 100 ? 100 : pct,
            glowClass: glowClass,
            auraName: auraName,
            isLocked: false,
            isPrivate: isPrivate,
            nextGoalText: lvl < 100 ? ("Seviye " + (lvl + 1) + " için " + Math.max(0, tgtXP - curXP) + " XP kaldı") : "👑 Yaşayan Efsane (Maksimum Seviye)"
        };
    }

    if (count <= 0) {
        return {
            level: 0,
            levelTag: "Lv. 0",
            title: "Başlangıç",
            tierDesc: "Başlangıç (Lv. 0)",
            countText: "0 / " + tiers[0].min,
            targetCount: tiers[0].min,
            currentCount: 0,
            progressPct: 0,
            glowClass: "",
            auraName: "",
            isLocked: true,
            isPrivate: isPrivate,
            nextGoalText: "Seviye 1 için " + tiers[0].min + " " + unit + " gerekli"
        };
    }

    // Seviye 1 - 9
    for (let i = 0; i < tiers.length - 1; i++) {
        const t = tiers[i];
        if (count <= t.max) {
            const range = t.max - (t.min - 1);
            const currentInTier = count - (t.min - 1);
            const pct = Math.min(100, Math.max(0, Math.round((currentInTier / range) * 100)));
            const nextTier = tiers[i + 1];
            const neededForNext = (t.max - count + 1);
            const targetCount = t.max;
            return {
                level: t.level,
                levelTag: "Lv. " + t.level,
                title: t.title,
                tierDesc: t.title + " (Lv. " + t.level + ")",
                countText: count + " / " + targetCount,
                targetCount: targetCount,
                currentCount: count,
                progressPct: pct,
                glowClass: t.glowClass || "",
                auraName: t.auraName || "",
                isLocked: false,
                isPrivate: isPrivate,
                nextGoalText: "Seviye " + nextTier.level + " (" + nextTier.title + ") için " + neededForNext + " " + unit + " kaldı"
            };
        }
    }

    // Seviye 10 (Maksimum Seviye)
    const maxTier = tiers[tiers.length - 1];
    return {
        level: maxTier.level,
        levelTag: "Lv. 10",
        title: maxTier.title,
        tierDesc: maxTier.title + " (Lv. 10)",
        countText: "Maksimum Seviye",
        targetCount: maxTier.min,
        currentCount: count,
        progressPct: 100,
        glowClass: maxTier.glowClass || "badge-glow-black",
        auraName: maxTier.auraName || "🖤 Siyah Parlar (Max Tier)",
        isLocked: false,
        isPrivate: isPrivate,
        nextGoalText: "👑 Maksimum Seviyeye Ulaşıldı!"
    };
}

function getBadgeDetails(badgeKey, count, isOwnProfile) {
    const tier = calculateUniversalBadgeTier(count, badgeKey, null, !isOwnProfile);
    const glowMap = { 6: 'bronze', 7: 'silver', 8: 'gold', 9: 'diamond', 10: 'black' };
    return {
        level: tier.level,
        title: tier.title,
        target: tier.targetCount,
        progressPercent: tier.progressPct,
        glow: glowMap[tier.level] || '',
        current: count,
        tierDesc: tier.tierDesc,
        isLocked: tier.isLocked
    };
}

if (typeof window !== 'undefined') {
    window.BADGE_TIERS = BADGE_TIERS;
    window.BADGE_CONFIG = BADGE_CONFIG;
    window.calculateUniversalBadgeTier = calculateUniversalBadgeTier;
    window.getBadgeDetails = getBadgeDetails;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        BADGE_TIERS,
        BADGE_CONFIG,
        calculateUniversalBadgeTier,
        getBadgeDetails
    };
}

