const fs = require('fs');
let code = fs.readFileSync('public/js/levelClient.js', 'utf8');

const levelUnlocksConst = `  const LEVEL_UNLOCKS = {
    2: [
      { icon: '🚪', name: 'VİP Club Kapıları Açıldı!', desc: 'Cadde 2\\'deki gizli yeraltı kulübüne ücretsiz giriş hakkı kazandın!' }
    ],
    3: [
      { icon: '📡', name: 'Sinyal Kesici (Jammer)', desc: 'Karaborsadan jammer alıp hedefin telsiz ve konuşma frekansını susturabilirsin!' },
      { icon: '🐕‍🦺', name: 'Sadık Doberman', desc: 'Gaspa karşı seni koruyan ve yanından ayrılmayan özel bekçi köpeği!' }
    ],
    4: [
      { icon: '⚡', name: "Zeus'un İlahi Yıldırımı", desc: 'Gökyüzünden yıldırımla hedefi çarparak 30 saniye kül yığınına dönüştür! (2 Elmas)' }
    ],
    5: [
      { icon: '🗡️', name: 'Gasp Bıçağı', desc: 'Yakın mesafeden 2.000 TL soygun yapabilme imkanı! (2 Elmas)' },
      { icon: '🕶️', name: '1. İzbandut Özel Koruma', desc: 'Seni tüm gasp ve saldırılardan can siperi olarak koruyan ilk özel koruma hakkı!' }
    ],
    10: [
      { icon: '🕶️', name: '2. İzbandut Özel Koruma', desc: 'Yanına 2. özel korumanı alma hakkı açıldı! Çifte savunma gücü!' }
    ],
    20: [
      { icon: '🕶️', name: '3. İzbandut Koruma (MAKSİMUM)', desc: '3. ve son korumanı alarak 3\\'lü ordu kurma hakkı! Maksimum güvenlik!' },
      { icon: '🥉', name: 'Bronz Profil Aurası', desc: 'Profilinde ve isminin etrafında ışıldayan asil bronz aura çerçevesi!' }
    ],
    35: [
      { icon: '🥈', name: 'Gümüş Profil Aurası', desc: 'Profilinde ışıldayan asil gümüş şampiyon aurası!' }
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

  const LevelClient = {`;

code = code.replace('  const LevelClient = {', levelUnlocksConst);

const oldCacheDOM = `      this.modalDiamonds = document.getElementById('levelUpRewardDiamonds');
      this.claimBtn = document.getElementById('levelUpClaimBtn');`;

const newCacheDOM = `      this.modalDiamonds = document.getElementById('levelUpRewardDiamonds');
      this.claimBtn = document.getElementById('levelUpClaimBtn');
      this.unlockedSection = document.getElementById('levelUpUnlockedSection');
      this.unlockedBox = document.getElementById('levelUpUnlockedBox');`;

code = code.replace(oldCacheDOM, newCacheDOM);

const oldShowModal = `    showLevelUpModal(newLevel, money, diamonds) {
      if (!this.overlay) this.cacheDOM();

      if (this.modalNum) this.modalNum.textContent = newLevel;
      if (this.modalMoney) this.modalMoney.textContent = \`+\${(money || 0).toLocaleString('tr-TR')} TL\`;
      if (this.modalDiamonds) this.modalDiamonds.textContent = \`+\${diamonds || 0} Elmas\`;

      if (this.overlay) {
        this.overlay.style.display = 'flex';
      }
    },`;

const newShowModal = `    showLevelUpModal(newLevel, money, diamonds) {
      if (!this.overlay) this.cacheDOM();

      if (this.modalNum) this.modalNum.textContent = newLevel;
      if (this.modalMoney) this.modalMoney.textContent = \`+\${(money || 0).toLocaleString('tr-TR')} TL\`;
      if (this.modalDiamonds) this.modalDiamonds.textContent = \`+\${diamonds || 0} Elmas\`;

      const lvlNum = Number(newLevel);
      const unlocks = LEVEL_UNLOCKS[lvlNum] || null;

      if (!this.unlockedSection || !this.unlockedBox) this.cacheDOM();

      if (this.unlockedSection && this.unlockedBox) {
        if (unlocks && unlocks.length > 0) {
          this.unlockedBox.innerHTML = '';
          unlocks.forEach(u => {
            const itemEl = document.createElement('div');
            itemEl.className = 'level-up-unlocked-item';
            itemEl.innerHTML = \`
              <div class="unlocked-item-icon">\${u.icon}</div>
              <div class="unlocked-item-info">
                <div class="unlocked-item-name">
                  <span>\${u.name}</span>
                  <span class="unlocked-item-tag">AÇILDI!</span>
                </div>
                <div class="unlocked-item-desc">\${u.desc}</div>
              </div>
            \`;
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
    },`;

code = code.replace(oldShowModal, newShowModal);

fs.writeFileSync('public/js/levelClient.js', code);
console.log('Successfully patched public/js/levelClient.js!');

