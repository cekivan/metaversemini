const fs = require('fs');
let content = fs.readFileSync('yapilanlar.md', 'utf8');

const newEntry = `### ⏰ 20:00 | 🚪 VIP Club Seviye 2 Kilit & Ücretsiz Giriş, Karaborsa Seviye Kilitleri, Tüketilebilir Eşya Ekonomisi ve Fedai Kuşanma/Çıkarma Sistemi
- **Kullanıcı Talebi:**
  - *"vip cluba girebilmek için 2 level olmak gereksin. kapı ücretini kaldırabilirsin. jammer ve doberman için 3, zeusun ilahi yıldırımı için 4 ,gasp bıçağı ve korumalar için 5 level olmak gereksin. başka birisi hediye verse bile bu itemleri kullanamasın. Level 5 te tek koruma alabilsin. Level 10 da 2 koruma alabilsin Level 20 de 3. korumayı da alabilsin. (bunları level md ye not al level atladıkça Açıldı!!! tarzı bi ekranla bunları da eklersin. Level 2 olunca yeni level ödülü pop upı + açılan yenilikler tarzı bi şey tasarla ve oraya vip club açıldı yaz. her level için bunları yapabiliriz. hangi levelde ne açıldığını da level.mdye not al.)"*
  - *"(izbandut ve korumalar hediye verilemez. İzbandut ve korumalar f5 atınca gitmez. ama kişi isterse eşya olarak onları takıp çıkarabilir. eğer eşya olarak olduğu halde izbandut ve korumaları giymemişse kişi soyulabilir, jammerlanabilir veya yıldırıma uğrayabilir. izbandut ve korumalar da eşya gibi gelir çantaya. süreleri yoktur biri saldırıncaya kadar süresiz dururlar. ama başka kişilere hediye edilemezler). sinyal kesicinin 1 adeti ile bir kere sinyal engelleme yapılabilsin sonra o item yok olsun. yani 10 itemin varsa 10 kez kullanabilirsin. zeusun ilahi yıldırımı da aynı şekilde 1 kullanımlık olsun sonra çantadan yok olsun. Ücreti 2 diamond olsun. gasp bıçağıda 1 kullanımlık olsun (1000 tl gaspı 2000 tlye çıkaralım.)( Ekstradan satın alınabilse bile aynı kişiye aynı gün sadece 1 kez kullanılabilir.). ücreti 2 diamond olsun."*

- **1. VIP Club Giriş ve Kapı Ücreti:**
  - VIP Club kapı ücreti (1.000 TL) tamamen kaldırıldı; mekan Seviye 2+ tüm oyunculara **ücretsiz** hale getirildi.
  - Seviye 1 oyuncuların mekana girişi engellendi (\`enterVipClub\` sunucu ve istemcide Seviye 2 denetimi yapar).
  - \`public/index.html\` üzerindeki giriş modalı \`"✨ Giriş Şartı: En Az Seviye 2 (Giriş Ücretsiz!)"\` ve \`"Kulübe Gir (Ücretsiz)"\` butonlarıyla güncellendi.

- **2. Seviye Kilitleri & Kademeli Açılışlar:**
  - **Level 2:** 🚪 VIP Club Girişi Açıldı.
  - **Level 3:** 📡 Sinyal Kesici (Jammer) & 🐕‍🦺 Sadık Doberman açıldı.
  - **Level 4:** ⚡ Zeus'un İlahi Yıldırımı açıldı (2 Elmas).
  - **Level 5:** 🗡️ Gasp Bıçağı (2 Elmas, 2.000 TL gasp) & 🕶️ 1. İzbandut Koruma Slotu açıldı.
  - **Level 10:** 🕶️ 2. İzbandut Koruma Slotu açıldı (Maksimum 2).
  - **Level 20:** 🕶️ 3. İzbandut Koruma Slotu açıldı (Maksimum 3) & 🥉 Bronz Profil Aurası açıldı.
  - \`level.md\` dokümanına Bölüm 6 olarak tüm cetvel, kurallar, fiyatlandırmalar ve mimari detaylar işlendi.

- **3. Seviye Atlama Kutlama Popup'ında Açılan Yenilikler Kartı:**
  - \`public/index.html\` ve \`public/css/hudLevel.css\` içerisine \`#levelUpUnlockedSection\` ve \`#levelUpUnlockedBox\` entegre edildi.
  - \`public/js/levelClient.js\` içinde \`LEVEL_UNLOCKS\` sözlüğü oluşturuldu; seviye atlandığında ilgili basamakta açılan tüm özellikler şık ikonlar, başlıklar ve \`AÇILDI!\` rozetleriyle dinamik olarak sunuldu.

- **4. Kalıcı Koruma & Eşya Olarak Takıp Çıkarma (Equip / Unequip):**
  - İzbandut korumalar ve Sadık Doberman'ın saatlik/günlük süreleri kaldırıldı; birisi saldırıp can siperi oluncaya kadar **süresiz** olarak oyuncunun mülkiyetinde kalır.
  - Sayfa yenilendiğinde (F5 / yeniden bağlanma) \`petManager.handleLogin\` fonksiyonu oyuncunun kuşanılmış korumalarını ve dobermanını otomatik olarak geri bağlar ve spawn eder.
  - Oyuncu Tekinsiz Tekin arayüzünden korumalarını ve dobermanını \`"Dinlenmeye Çek"\` butonuyla çantaya kaldırabilir veya \`"Yanına Çağır"\` ile tekrar kuşanabilir (\`toggleEquipBodyguard\`, \`toggleEquipDoberman\`).
  - **Kuşanılmamış Koruma Zafiyeti:** Oyuncu korumasını dinlenmeye çekmişse, gasp, jammer veya zeus saldırısı karşısında korumasız kalır; saldırı doğrudan oyuncuya isabet eder.

- **5. Tüketilebilir Eşya Ekonomisi ve Fiyatlar:**
  - **Sinyal Kesici (Jammer):** 1 adet = 1 kullanım. Kullanıldığında çantadan 1 adet eksilir. Fiyat: 1.500 TL.
  - **Zeus'un İlahi Yıldırımı:** 1 adet = 1 kullanım. Fiyat: **2 Elmas (💎)**. Çağrıldığında 1 adet eksilir, bittiğinde elden düşer.
  - **Gasp Bıçağı:** 1 adet = 1 kullanım. Fiyat: **2 Elmas (💎)**. Başarılı gaspta çalınan miktar **2.000 TL**'ye çıkarıldı.
  - **Gasp 24 Saat Hedef Limiti:** Aynı oyuncu aynı gün içerisinde birden fazla kez gasp edilemez (\`callerData.muggedTargets\` ile hedef bazında 24 saatlik süre denetlenir).

- **6. Hediye Edilememe Kuralı (Non-Giftable):**
  - \`socialHandler.js\` ve \`public/js/social.js\` içerisinde İzbandut, Doberman, Jammer, Gasp Bıçağı ve Zeus Yıldırımı hediye edilemez eşyalar listesine eklendi.
  - Başka bir yolla seviyesi yetersiz bir oyuncunun eline geçse dahi, sunucu katmanında seviye kontrolleri denetlendiği için yetersiz seviyede asla kullanılamaz.

- **7. Doğrulama ve Testler:**
  - \`scratch/test_vip_level_system_live.js\` ile 8 aşamalı canlı sunucu soket testi çalıştırıldı (Level 1 kilitleri, Level 2 ücretsiz girişi, Level 3 Jammer & Doberman alımı ve kuşanma/çıkarma, Level 4 Zeus 2 elmas alımı, Level 5 Gasp bıçağı 2 elmas alımı, 1 koruma sınırı, hediye engeli, 2.000 TL gasp ve 24 saat hedef soğuma süresi, Level 10 ve 20 koruma slot ölçeklemesi). Tüm testler %100 başarıyla geçti.
  - \`scratch/verify_vip_browser_ui.js\` ile headless Edge tarayıcısında gerçek arayüz test edildi; Level-up "AÇILDI!" kartı, Seviye 2 ücretsiz VIP Club giriş modalı ve Tekinsiz Tekin Elmas/Seviye/Kuşanma butonları içeren karaborsa tezgahı ekran görüntüleriyle doğrulandı.

---
`;

const insertPos = content.indexOf('## 📅 9 Kasım 2026\n\n');
if (insertPos !== -1) {
    const targetIdx = insertPos + '## 📅 9 Kasım 2026\n\n'.length;
    const updated = content.substring(0, targetIdx) + newEntry + '\n' + content.substring(targetIdx);
    fs.writeFileSync('yapilanlar.md', updated);
    console.log("Successfully updated yapilanlar.md!");
} else {
    fs.writeFileSync('yapilanlar.md', newEntry + '\n' + content);
    console.log("Prepended to yapilanlar.md!");
}

