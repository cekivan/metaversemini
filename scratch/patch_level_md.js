const fs = require('fs');
let doc = fs.readFileSync('level.md', 'utf8');

// Update Table of Contents
const oldTOC = `5. [Ağ İletişimi (Socket Olayları) ve Veritabanı Şeması](#5-ağ-i̇letişimi-socket-olayları-ve-veritabanı-şeması)
   - [Sunucu & İstemci Socket Paketleri](#sunucu--i̇stemci-socket-paketleri)
   - [Kullanıcı Veritabanı Şeması (User Schema Alanları)](#kullanıcı-veritabanı-şeması-user-schema-alanları)`;

const newTOC = `5. [Ağ İletişimi (Socket Olayları) ve Veritabanı Şeması](#5-ağ-i̇letişimi-socket-olayları-ve-veritabanı-şeması)
   - [Sunucu & İstemci Socket Paketleri](#sunucu--i̇stemci-socket-paketleri)
   - [Kullanıcı Veritabanı Şeması (User Schema Alanları)](#kullanıcı-veritabanı-şeması-user-schema-alanları)
6. [Seviye Kilitleri, Mekan & Karaborsa VIP Açılışları (Level Unlocks)](#6-seviye-kilitleri-mekan--karaborsa-vip-açılışları-level-unlocks)
   - [Seviye Kilitleri Cetveli](#seviye-kilitleri-cetveli)
   - [İzbandut Koruma Slot Ölçeklemesi (Level 5, 10, 20)](#i̇zbandut-koruma-slot-ölçeklemesi-level-5-10-20)
   - [Eşya Kuşanma, Kalıcılık & F5 Koruması (Equip/Unequip)](#eşya-kuşanma-kalıcılık--f5-koruması-equipunequip)
   - [Hediye Edilememe Kuralı (Non-Giftable)](#hediye-edilememe-kuralı-non-giftable)
   - [Tüketim Ekonomisi ve Fiyatlandırma](#tüketim-ekonomisi-ve-fiyatlandırma)`;

doc = doc.replace(oldTOC, newTOC);

const section6 = `
---

## 6. Seviye Kilitleri, Mekan & Karaborsa VIP Açılışları (Level Unlocks)

Oyuncunun seviyesi (Level 1–100) yalnızca statü ve rozetleri değil; aynı zamanda özel mekanların, karaborsa teçhizatlarının ve koruma birimlerinin erişimini kontrol eder. Oyuncu seviye atladığında tebrik modalında **"YENİ ÖZELLİKLER AÇILDI!"** kartı belirir.

### Seviye Kilitleri Cetveli

| Seviye | Açılan Yenilik / Teçhizat | Kategori | Açıklama & Şartlar |
| :---: | :--- | :---: | :--- |
| **Level 2** | 🚪 **VİP Club (Yeraltı Kulübü)** | Mekan | Cadde 2'deki gizli kulübe kapı ücreti ödemeden **tamamen ücretsiz** giriş hakkı açılır. |
| **Level 3** | 📡 **Sinyal Kesici (Jammer)** | Taktik Eşya | Hedefin telsiz/chat ve hareketini geçici olarak bozar (1 Kullanımlık - 1.500 TL). |
| **Level 3** | 🐕‍🦺 **Sadık Doberman** | Özel Pet / Koruma | Gasp girişimlerine karşı can siperi olan ve düşmanı ısıran sadık koruma köpeği. |
| **Level 4** | ⚡ **Zeus'un İlahi Yıldırımı** | İlahi Silah | Gökyüzünden yıldırımla hedefi çarpıp iskeletini çıkarır ve 30 sn kül yığınına çevirir (1 Kullanımlık - 2 Elmas). |
| **Level 5** | 🗡️ **Gasp Bıçağı** | Saldırı Silahı | Yakın mesafeden hedefi soyarak **2.000 TL** nakit gasp eder (1 Kullanımlık - 2 Elmas - Hedef başına günde 1 kez). |
| **Level 5** | 🕶️ **1. İzbandut Koruma Slotu** | Özel Fedai | En fazla 1 adet özel izbandut koruma tutma ve savunma hakkı açılır. |
| **Level 10** | 🕶️ **2. İzbandut Koruma Slotu** | Özel Fedai | 2. İzbandut korumayı kiralama ve aynı anda sahada çift koruma ile gezebilme hakkı. |
| **Level 20** | 🕶️ **3. İzbandut Koruma (MAX)** | Özel Fedai | 3. ve son koruma slotu açılır. Maksimum 3 koruma aynı anda hizmet verebilir. |
| **Level 20** | 🥉 **Bronz Profil Aurası** | Statü & Aura | Profil modalında ve karakter başlığında parıldayan asil bronz çerçeve. |
| **Level 35** | 🥈 **Gümüş Şampiyon Aurası** | Statü & Aura | Parlak gümüş şampiyonluk ışığı ve kademe başlığı. |
| **Level 50** | 🥇 **Altın Usta Aurası** | Statü & Aura | Göz alıcı altın aura ve usta vitrin tasarımı. |
| **Level 75** | 💎 **Zümrüt Elmas Aurası** | Statü & Aura | Nadir zümrüt elmas parlaklığı ve prestij rozeti. |
| **Level 100** | 👑 **Mitolojik Şampiyon & MAX** | Nihai Zirve | Metaverse evreninin en yüksek mertebesi, efsanevi mitolojik taç. |

---

### İzbandut Koruma Slot Ölçeklemesi (Level 5, 10, 20)

İzbandut Korumalar rastgele ve sınırsız kiralanamaz. Karakterin tecrübesine ve seviyesine göre kademeli olarak açılır:
- **Level 1 – 4:** 0 Koruma (Erişim kilitli).
- **Level 5 – 9:** **Maksimum 1 Koruma**.
- **Level 10 – 19:** **Maksimum 2 Koruma**.
- **Level 20 – 100:** **Maksimum 3 Koruma (Kapasite Tavanı)**.

---

### Eşya Kuşanma, Kalıcılık & F5 Koruması (Equip/Unequip)

1. **Kalıcılık (Süresiz & F5 Kaybı Yok):**
   - Satın alınan İzbandut korumalar ve Sadık Doberman'ın **saatlik/günlük bir süresi yoktur**. Biri oyuncuya saldırıp koruma can siperi oluncaya kadar süresiz olarak oyuncunun mülkiyetinde kalır.
   - Sayfa yenilendiğinde (F5 / Tarayıcı kapatıp açma) veya sunucu yeniden başladığında kuşanılmış korumalar ve petler **kaybolmaz**, oyuncu giriş yapar yapmaz otomatik olarak tekrar yanında belirir.
2. **Çantadan Takıp Çıkarma (Equip / Unequip):**
   - Oyuncu dilediği an Tekinsiz Tekin'in arayüzünden korumalarını veya dobermanını **"Dinlenmeye Çek"** seçeneğiyle çantaya kaldırabilir veya **"Yanına Çağır"** ile tekrar kuşanabilir.
3. **Kuşanılmamış Teçhizat Koruması Yoktur:**
   - **Kritik Kural:** Eğer oyuncunun çantasında koruması veya dobermanı olmasına rağmen eşya olarak **kuşanmamışsa (dinlenmeye çekilmişse)**, oyuncu gasp saldırılarına, jammer susturmasına veya Zeus yıldırımlarına karşı tamamen **korumasızdır**; saldırılar doğrudan oyuncunun kendisine isabet eder!

---

### Hediye Edilememe Kuralı (Non-Giftable)

- VIP ve karaborsa eşyaları (**İzbandut Korumalar, Sadık Doberman, Sinyal Kesici Jammer, Gasp Bıçağı, Zeus'un İlahi Yıldırımı**) başka oyunculara hediye edilemez (giftPropItem hem sunucuda hem istemcide kilitlidir).
- Sistem açığı veya yönetimsel yolla seviyesi yetersiz bir oyuncunun eline bu eşyalar geçse dahi, **seviye kilitleri sunucu katmanında denetlendiği için** gerekli seviyeye ulaşmadan bu eşyalar asla kullanılamaz.

---

### Tüketim Ekonomisi ve Fiyatlandırma

| Eşya | Fiyatı / Para Birimi | Kullanım Hak Sayısı | Tüketim & Yenilenme Kuralı |
| :--- | :---: | :---: | :--- |
| **Sinyal Kesici (Jammer)** | 1.500 TL | 1 Kullanımlık / Adet | 1 kullanımda 1 adet eşya çantadan tamamen yok olur. 10 adet satın alınırsa 10 kez kullanılabilir. |
| **Zeus'un İlahi Yıldırımı** | **2 Elmas (💎)** | 1 Kullanımlık / Adet | 1 yıldırım çağrıldığında eşya çantadan silinir. Gökyüzü kabarır ve hedefi 30 saniye kül eder. |
| **Gasp Bıçağı** | **2 Elmas (💎)** | 1 Kullanımlık / Adet | 1 gasp hamlesinde harcanır. Başarılı gaspta **2.000 TL** çalar. **Aynı hedefe günde en fazla 1 kez kullanılabilir.** |
| **Sadık Doberman** | 15.000 TL | Can Siperi Olana Kadar | Süresizdir. Gasp saldırısını bertaraf ettiğinde can siperi olur ve revire çekilir. |
| **İzbandut Koruma** | 10.000 TL | Can Siperi Olana Kadar | Süresizdir. Gasp, Jammer veya Zeus saldırısını üstlenip feda olduğunda yok olur. |
`;

const insertIndex = doc.lastIndexOf('---');
if (insertIndex !== -1) {
    const finalDoc = doc.substring(0, insertIndex) + section6 + '\n' + doc.substring(insertIndex);
    fs.writeFileSync('level.md', finalDoc);
    console.log("Successfully updated level.md with Section 6!");
} else {
    fs.writeFileSync('level.md', doc + '\n' + section6);
    console.log("Appended Section 6 to level.md!");
}
