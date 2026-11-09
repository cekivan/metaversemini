const fs = require('fs');
let doc = fs.readFileSync('PROJE_DURUMU_VE_HAFIZA.md', 'utf8');

const targetHeading = `### 🛡️ 9 Kasım 2026 | VIP Koruma & Sadık Doberman 3 Kademeli Can Siperi Savunma Sistemi & Kapsamlı Sistem Bug Fixes`;

const newSection = `### 🚪 9 Kasım 2026 | VIP Club Seviye 2 Kilit & Ücretsiz Giriş, Karaborsa Seviye Kilitleri, Tüketilebilir Eşya Ekonomisi ve Fedai Kuşanma/Çıkarma
1. **VIP Club Seviye 2 Kilit ve Ücretsiz Giriş:**
   - VIP Club'a giriş için Seviye 2 şartı getirildi (\`enterVipClub\` sunucu ve istemcide denetlenir).
   - 1.000 TL kapı ücreti tamamen kaldırıldı; Seviye 2+ tüm üyelere giriş ücretsiz yapıldı.
2. **Kademeli Seviye Kilitleri & Açılan Özellikler (\`level.md\` Bölüm 6):**
   - **Level 2:** VIP Club Girişi Açıldı (Ücretsiz).
   - **Level 3:** Sinyal Kesici Jammer & Sadık Doberman.
   - **Level 4:** Zeus'un İlahi Yıldırımı (2 Elmas).
   - **Level 5:** Gasp Bıçağı (2 Elmas, 2.000 TL soygun) & 1. İzbandut Koruma Slotu (Maksimum 1).
   - **Level 10:** 2. İzbandut Koruma Slotu (Maksimum 2).
   - **Level 20:** 3. İzbandut Koruma Slotu (Maksimum 3) & Bronz Profil Aurası.
3. **Seviye Atlama Kutlama Popup'ında Açılan Yenilikler Kartı:**
   - \`#levelUpUnlockedSection\` ve \`#levelUpUnlockedBox\` ile her basamakta açılan özellikler dinamik olarak kutlama ekranında listelenir (\`verified_levelup_unlocks_live.png\`).
4. **Korumaların Kalıcılığı & Eşya Olarak Takıp Çıkarma (Equip / Unequip):**
   - Korumalar ve Doberman süresizdir, saldırıda feda olana kadar çantada kalır. F5 atınca kaybolmaz.
   - Çantadan takılıp çıkarılabilir. Çantada olup da kuşanılmamışsa oyuncu korumasız kalır.
5. **Tüketim Kuralları & 24 Saat Gasp Limiti:**
   - Jammer, Zeus ve Gasp Bıçağı 1 kullanımlıktır ve kullanıldığında yok olur.
   - Aynı hedefe günde en fazla 1 kez gasp uygulanabilir (24 saat hedef bazlı soğuma).
6. **Hediye Yasağı (Non-Giftable):**
   - İzbandut, Doberman, Jammer, Bıçak ve Yıldırım kesinlikle başkasına hediye edilemez.

` + targetHeading;

doc = doc.replace(targetHeading, newSection);
fs.writeFileSync('PROJE_DURUMU_VE_HAFIZA.md', doc);
console.log('Successfully updated PROJE_DURUMU_VE_HAFIZA.md!');

