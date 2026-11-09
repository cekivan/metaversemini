// public/js/badgeView.js - Mini Metaverse 10 Kademeli Profil Rozet Vitrini İstemci Modülü

(function () {
  const BADGE_DEFINITIONS = [
    { key: 'gamer', name: 'Oyunbaz', icon: '🎮', field: 'gamerGamesCount' },
    { key: 'botanic', name: 'Botanik Rozeti', icon: '🌿', field: 'botanicHarvestCount' },
    { key: 'fishing', name: 'Balıkçılık', icon: '🎣', field: 'fishCaughtCount' },
    { key: 'mining', name: 'Madencilik', icon: '⛏️', field: 'minedRocksCount' }
  ];

  function getBadgeDetails(badgeKey, count, isOwnProfile) {
    if (typeof window.calculateUniversalBadgeTier === 'function') {
      const tier = window.calculateUniversalBadgeTier(count, badgeKey, null, !isOwnProfile);
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
    return {
      level: 1,
      title: 'Acemi',
      target: 10,
      progressPercent: 0,
      glow: '',
      current: count,
      tierDesc: 'Acemi (Lv. 1)',
      isLocked: false
    };
  }

  window.getBadgeDetails = window.getBadgeDetails || getBadgeDetails;

  function extractStatCount(userData, def) {
    if (!userData) return 0;
    if (def.key === 'gamer') {
      if (userData.gamerGamesCount !== undefined && userData.gamerGamesCount !== null) {
        return Number(userData.gamerGamesCount) || 0;
      }
      return (Number(userData.batakGamesCount) || 0) +
             (Number(userData.okeyGamesCount) || 0) +
             (Number(userData.tavlaGamesCount) || 0) +
             (Number(userData.billiardGamesCount) || 0) +
             (Number(userData.chessGamesCount) || 0) +
             (Number(userData.amiralBattiGamesCount) || 0) +
             (Number(userData.xoxGamesCount) || 0) +
             (Number(userData.dostKazigiGamesCount) || 0);
    }
    if (def.key === 'botanic') {
      return Number(userData.botanicHarvestCount !== undefined ? userData.botanicHarvestCount : (userData.botanicHarvestPoints || 0)) || 0;
    }
    if (def.key === 'fishing') {
      return Number(userData.fishCaughtCount !== undefined ? userData.fishCaughtCount : (userData.fishCount || 0)) || 0;
    }
    if (def.key === 'mining') {
      return Number(userData.minedRocksCount !== undefined ? userData.minedRocksCount : (userData.minedCount || 0)) || 0;
    }
    return Number(userData[def.field]) || 0;
  }

  function renderProfileBadges(targetUserData, isOwnProfile) {
    if (typeof window.renderProfileSquareBadges === 'function') {
      return window.renderProfileSquareBadges(targetUserData, isOwnProfile);
    }
    const container = document.getElementById('profileBadgesGrid');
    if (!container || !window.getBadgeDetails) return;

    container.innerHTML = '';

    BADGE_DEFINITIONS.forEach(def => {
      const count = extractStatCount(targetUserData, def);
      let details = window.getBadgeDetails(def.key, count, isOwnProfile);

      // Yabancı profil ise ve ham sayılar gizli gönderildiyse, sunucunun badgeLevels haritasından kademeyi al
      if (!isOwnProfile && (!count || count <= 0) && targetUserData && targetUserData.badgeLevels) {
        const bl = targetUserData.badgeLevels;
        const bLevel = Number(bl[def.key] || (def.key === 'fishing' ? (bl.fishing || bl.fish) : 0)) || 0;
        if (bLevel > 0 && typeof window.BADGE_TIERS !== 'undefined') {
          const tiers = window.BADGE_TIERS[def.key] || [];
          const tierObj = tiers.find(t => t.level === bLevel) || tiers[bLevel - 1];
          if (tierObj) {
            const glowMap = { 6: 'bronze', 7: 'silver', 8: 'gold', 9: 'diamond', 10: 'black' };
            details = {
              level: bLevel,
              title: tierObj.title,
              target: tierObj.max || tierObj.min,
              progressPercent: 100,
              glow: glowMap[bLevel] || '',
              current: tierObj.min,
              tierDesc: tierObj.title + ' (Lv. ' + bLevel + ')',
              isLocked: false
            };
          }
        }
      }

      if (!details) return;

      const glowClass = details.glow ? `glow-${details.glow}` : '';
      const isMax = details.level === 10;

      const card = document.createElement('div');
      card.className = `badge-card ${glowClass}`.trim();
      card.title = `${def.name} - ${details.title} (Lv. ${details.level})${details.glow ? ' [' + details.glow.toUpperCase() + ' PARLAMA]' : ''}`;

      let progressHTML = '';
      if (isOwnProfile) {
        progressHTML = `
          <div class="badge-track">
            <div class="badge-progress-bar" style="width: ${details.progressPercent}%;"></div>
          </div>
          <div class="badge-stat-text">
            ${isMax ? 'Maksimum Kademeye Ulaşıldı' : `İlerleme: ${count} / ${details.target} (%${details.progressPercent})`}
          </div>
        `;
      } else {
        progressHTML = `
          <div class="badge-stat-text" style="margin-top: 6px; color: #94a3b8;">
            Ulaşılan Kademe: Lv. ${details.level}
          </div>
        `;
      }

      card.innerHTML = `
        <div class="badge-icon-box">
          ${def.icon}
          <span class="badge-tier-tag">L${details.level}</span>
        </div>
        <div class="badge-info">
          <span class="badge-name">${def.name}</span>
          <span class="badge-title-sub">${details.title}</span>
          ${progressHTML}
        </div>
      `;

      container.appendChild(card);
    });
  }

  window.renderProfileBadges = renderProfileBadges;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BADGE_DEFINITIONS, renderProfileBadges, getBadgeDetails, extractStatCount };
  }
})();

