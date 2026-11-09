/**
 * public/js/levelClient.js
 * Mini Metaverse - Seviye 1–100 İlerleme, Sol Üst HUD & Kutlama UI Motoru
 */
(function () {
  const LEVEL_UNLOCKS = {
    2: [
      { icon: '🚪', name: 'VİP Club Kapıları Açıldı!', desc: 'Cadde 2\'deki gizli yeraltı kulübüne ücretsiz giriş hakkı kazandın!' },
      { icon: '📡', name: 'Sinyal Kesici (Jammer)', desc: 'Karaborsadan jammer alıp hedefin telsiz ve konuşma frekansını susturabilirsin!' },
      { icon: '🗡️', name: 'Gasp Bıçağı', desc: 'Yakın mesafeden 2.000 TL soygun yapabilme imkanı! (2 Elmas)' },
      { icon: '⚡', name: "Zeus'un İlahi Yıldırımı", desc: 'Gökyüzünden yıldırımla hedefi çarparak 30 saniye kül yığınına dönüştür! (2 Elmas)' },
      { icon: '🕶️', name: '1. İzbandut Özel Koruma', desc: 'Seni tüm gasp ve saldırılardan can siperi olarak koruyan ilk özel koruma hakkı!' }
    ],
    3: [
      { icon: '🐕‍🦺', name: 'Sadık Doberman', desc: 'Gaspa karşı seni koruyan ve yanından ayrılmayan özel bekçi köpeği!' },
      { icon: '🎭', name: 'Gizli Kimlik Maskesi', desc: '30 dakika boyunca ismini gizler ve konuşmalarına dumanlı aura katar!' }
    ],
    5: [
      { icon: '⭐', name: 'Usta Oyuncu Statüsü', desc: 'Sanalika sokaklarında kıdemli oyuncu unvanı ve özel ayrıcalıklar!' }
    ],
    20: [
      { icon: '🕶️', name: '2. İzbandut Özel Koruma', desc: 'Yanına 2. özel korumanı alma hakkı açıldı! Çifte savunma gücü!' },
      { icon: '🥉', name: 'Bronz Profil Aurası', desc: 'Profilinde ve isminin etrafında ışıldayan asil bronz aura çerçevesi!' }
    ],
    40: [
      { icon: '🕶️', name: '3. İzbandut Koruma (MAKSİMUM)', desc: '3. ve son korumanı alarak 3\'lü ordu kurma hakkı! Maksimum güvenlik!' }
    ],
    50: [
      { icon: '🥇', name: 'Altın Profil Aurası', desc: 'Seçkin altın aura ve usta rozet vitrini!' }
    ],
    75: [
      { icon: '💎', name: 'Zümrüt Elmas Aurası', desc: 'Göz kamaştırıcı zümrüt pırlanta aura ışıltısı!' }
    ],
    100: [
      { icon: '👑', name: 'Mitolojik Şampiyon Aurası & MAX Rozet', desc: 'Metaverse evreninin mutlak hükümdarı ve zirvesi!' }
    ]
  };
  window.LEVEL_UNLOCKS = LEVEL_UNLOCKS;

  const LevelClient = {
    currentLevel: 1,
    currentProgress: 0,
    targetXP: 20,
    isSocketBound: false,

    init() {
      this.cacheDOM();
      this.bindEvents();
      this.bindSocketEvents();
    },

    cacheDOM() {
      this.containerEl = document.getElementById('hudLevelContainer');
      this.badgeNum = document.getElementById('hudLevelNumber');
      this.badgeEl = document.getElementById('hudLevelBadge');
      this.titleEl = document.getElementById('hudLevelTitle');
      this.textEl = document.getElementById('hudXpText');
      this.fillEl = document.getElementById('hudXpFill');
      this.floatContainer = document.getElementById('hudXpFloatContainer');

      this.overlay = document.getElementById('levelUpOverlay');
      this.modalNum = document.getElementById('levelUpModalNum');
      this.modalMoney = document.getElementById('levelUpRewardMoney');
      this.modalDiamonds = document.getElementById('levelUpRewardDiamonds');
      this.claimBtn = document.getElementById('levelUpClaimBtn');
      this.unlockedSection = document.getElementById('levelUpUnlockedSection');
      this.unlockedBox = document.getElementById('levelUpUnlockedBox');
    },

    bindEvents() {
      if (this.claimBtn) {
        this.claimBtn.addEventListener('click', () => {
          this.hideLevelUpModal();
        });
      }

      if (this.containerEl) {
        this.containerEl.addEventListener('click', () => {
          if (typeof window.openMyPlayerProfile === 'function') {
            window.openMyPlayerProfile();
          } else if (typeof window.openBadgeLevelSystemModal === 'function') {
            window.openBadgeLevelSystemModal();
          }
        });
      }

      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) {
            this.hideLevelUpModal();
          }
        });
      }
    },

    bindSocketEvents() {
      if (this.isSocketBound) return;

      const sock = window.socket;
      if (!sock) {
        // Socket henüz hazır değilse kısa aralıklarla tekrar dene
        setTimeout(() => this.bindSocketEvents(), 150);
        return;
      }

      this.isSocketBound = true;

      sock.on('xpGained', (data) => {
        if (!data) return;
        this.updateHUD(data.currentLevel, data.currentProgress, data.targetXP);
        if (data.gained) {
          this.triggerXpFloat(data.gained);
        }
        if (typeof window.updateProfileBadgesLive === 'function') {
          window.updateProfileBadgesLive(data);
        }
      });

      sock.on('playerLevelUp', (data) => {
        if (!data) return;
        this.showLevelUpModal(data.newLevel, data.rewardMoney, data.rewardDiamonds);
        this.triggerBadgePulse();
        if (typeof window.updateProfileBadgesLive === 'function') {
          window.updateProfileBadgesLive({ currentLevel: data.newLevel });
        }
        // Web Audio retro level-up fanfare sesi
        if (typeof window.playLevelUpSound === 'function') {
          window.playLevelUpSound();
        } else if (typeof window.playSound === 'function') {
          window.playSound('win');
        }
      });

      sock.on('loginSuccess', (data) => {
        if (data && data.level !== undefined) {
          this.initFromLogin(data);
        }
      });
    },

    initFromLogin(data) {
      if (!data) return;
      const lvl = (data.level !== undefined && data.level !== null) ? Math.max(1, Number(data.level)) : 1;
      const progress = (data.currentProgress !== undefined) ? Number(data.currentProgress) : 0;
      const target = (data.targetXP !== undefined && data.targetXP > 0) ? Number(data.targetXP) : (lvl === 1 ? 20 : Math.floor(20 * Math.pow(lvl - 1, 1.42)));
      this.updateHUD(lvl, progress, target);
    },

    updateHUD(level, progress, target) {
      this.currentLevel = (level !== undefined && level !== null) ? Math.max(1, Number(level)) : 1;
      this.currentProgress = progress !== undefined ? Number(progress) : 0;
      this.targetXP = target || (this.currentLevel === 1 ? 20 : Math.floor(20 * Math.pow(this.currentLevel - 1, 1.42)));

      if (!this.badgeNum) this.cacheDOM();

      if (this.badgeNum) this.badgeNum.textContent = this.currentLevel;
      if (this.titleEl) this.titleEl.textContent = this.getLevelTitle(this.currentLevel);

      if (this.currentLevel >= 100) {
        if (this.textEl) this.textEl.textContent = 'Maksimum Seviye (MAX)';
        if (this.fillEl) this.fillEl.style.width = '100%';
      } else {
        if (this.textEl) this.textEl.textContent = `${this.currentProgress.toLocaleString('tr-TR')} / ${this.targetXP.toLocaleString('tr-TR')} XP`;
        const percent = (this.targetXP > 0) ? Math.min(100, Math.max(0, (this.currentProgress / this.targetXP) * 100)) : 100;
        if (this.fillEl) {
          this.fillEl.style.width = `${percent.toFixed(1)}%`;
        }
      }
    },

    triggerXpFloat(amount) {
      if (!this.floatContainer) this.cacheDOM();
      if (!this.floatContainer || !amount) return;

      const floatEl = document.createElement('div');
      floatEl.className = 'hud-xp-float-item';
      floatEl.textContent = `+${amount} XP`;
      
      // Çoklu art arda vuruşlarda üst üste binmemesi için hafif rastgele ofset
      const jitterX = Math.floor(Math.random() * 18);
      floatEl.style.left = `${jitterX}px`;

      this.floatContainer.appendChild(floatEl);

      setTimeout(() => {
        if (floatEl && floatEl.parentNode) {
          floatEl.parentNode.removeChild(floatEl);
        }
      }, 1300);
    },

    triggerBadgePulse() {
      if (!this.badgeEl) this.cacheDOM();
      if (!this.badgeEl) return;
      this.badgeEl.style.transform = 'scale(1.3) rotate(8deg)';
      setTimeout(() => {
        if (this.badgeEl) {
          this.badgeEl.style.transform = 'scale(1) rotate(0deg)';
        }
      }, 350);
    },

    showLevelUpModal(newLevel, money, diamonds) {
      if (!this.overlay) this.cacheDOM();

      if (this.modalNum) this.modalNum.textContent = newLevel;
      if (this.modalMoney) this.modalMoney.textContent = `+${(money || 0).toLocaleString('tr-TR')} TL`;
      if (this.modalDiamonds) this.modalDiamonds.textContent = `+${diamonds || 0} Elmas`;

      const lvlNum = Number(newLevel);
      const unlocks = LEVEL_UNLOCKS[lvlNum] || null;

      if (!this.unlockedSection || !this.unlockedBox) this.cacheDOM();

      if (this.unlockedSection && this.unlockedBox) {
        if (unlocks && unlocks.length > 0) {
          this.unlockedBox.innerHTML = '';
          unlocks.forEach(u => {
            const itemEl = document.createElement('div');
            itemEl.className = 'level-up-unlocked-item';
            itemEl.innerHTML = `
              <div class="unlocked-item-icon">${u.icon}</div>
              <div class="unlocked-item-info">
                <div class="unlocked-item-name">
                  <span>${u.name}</span>
                  <span class="unlocked-item-tag">AÇILDI!</span>
                </div>
                <div class="unlocked-item-desc">${u.desc}</div>
              </div>
            `;
            this.unlockedBox.appendChild(itemEl);
          });
          this.unlockedSection.style.display = 'block';
        } else {
          this.unlockedSection.style.display = 'none';
          this.unlockedBox.innerHTML = '';
        }
      }

      if (this.overlay) {
        this.overlay.style.display = 'flex';
      }
    },

    hideLevelUpModal() {
      if (!this.overlay) this.cacheDOM();
      if (this.overlay) {
        this.overlay.style.display = 'none';
      }
    },

    getLevelTitle(level) {
      if (level >= 100) return 'Yaşayan Efsane';
      if (level >= 86) return 'Duayen';
      if (level >= 61) return 'Şehir Hakimi';
      if (level >= 36) return 'Kıdemli Müdavim';
      if (level >= 16) return 'Esnaf & Zanaatkar';
      return 'Çaylak';
    }
  };

  window.LevelClient = LevelClient;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => LevelClient.init());
  } else {
    LevelClient.init();
  }
})();

