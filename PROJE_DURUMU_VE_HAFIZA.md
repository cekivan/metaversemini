# METAVERSE MINI — PROJE DEVİR TESLİM & HAFIZA RAPORU
> **Son Güncelleme:** 29 Ekim 2026  
> **Konuşma ID:** `88a664cc-2564-4751-8598-d01e7c82612e`  
> **Amaç:** Yeni bir sohbete başlandığında bu dosyayı referans vererek tüm oyun mimarisini, son yapılan geliştirmeleri ve sıradaki hedefleri tek adımda yapay zekaya aktarmak.

---

## 1. Proje Genel Mimarisi
- **Çekirdek:** Node.js (`server.js`), Socket.io, Vanilla HTML5 Canvas 2D (İzometrik ve Top-down hibrit).
- **Veritabanı:** MongoDB & `data.json` hibrit fallback mimarisi (`src/dataManager.js`).
- **İstemci (Client):** `public/index.html`, stil motoru `public/style.css`, ana oyun döngüsü `public/js/main.js`.
- **Haritalar & Odalar:** Sahil, Cadde, Casino, Nargile Lounge, Market, Emlakçı, Sanalika Caddesi, Star Caddesi, Meydan V2, Dostlar Kıraathanesi, Sahil V2, Müstakil Evler (Housing).

---

## 2. Son Yapılan Kritik Geliştirmeler & Çözülen Sorunlar
- **Ekran Zoomlama & Tıklanan Yere Gitme (Bug Fix):** 
  - `style.css` içindeki `#gameCanvas` üzerinde bulunan `transition` gecikmesi kaldırıldı.
  - `main.js` içine `getCanvasEventCoords(e)` eklendi; `clientWidth`/`clientHeight` ve canvas border payları düşülerek zoom oranından bağımsız %100 hassas tıklama koordinatı sağlandı.
- **Sigara & Duman Dinamiği:** 
  - Karakter 1 ve Karakter 2 için fırt aralığı tam **30 saniye** (`30000 ms`) olarak ayarlandı.
  - Karakter 2 sigarası Karakter 1 gibi yana bakar; üflenen duman rüzgara bağlı olarak yavaşça genişleyip dağılır.
- **Tavla Tahtası Simetrisi:** Oyuncular taş toplamak istedikleri köşeyi (`Sol Alt` / `Sağ Alt`) seçer, sunucu state'i bozulmadan istemcide ters açı render edilir.
- **Aksesuar / Prop İsimleri:** `props_k2_skateboard` (K2 Grafiti Sokak Kaykayı), `props_k2_energy_drink` (K2 Buzlu Enerji İçeceği), gitar vb. Türkçe adlandırıldı.

---

## 3. Karakter 2 (Kız Karakteri / Yeni Avatar) Mimari Kılavuzu
Karakter 2, `public/js/renderers/karakter2Renderer.js` dosyasında tamamen vektörel Canvas 2D ile çizilen 8 yönlü izometrik bir motordur:
- **8 Yön Katmanlama Sistemi (Angles 0..7):**
  - `0`: Güney (Ön), `1`: Güneybatı, `2`: Batı (Sol Profil), `3`: Kuzeybatı, `4`: Kuzey (Arka), `5`: Kuzeydoğu, `6`: Doğu (Sağ Profil), `7`: Güneydoğu.
- **Z-Index Çizim Sırası:**
  1. Arka Katmanlar (Arka saç lüleleri, arkada kalan kol/omuz)
  2. Bacaklar & Ayakkabılar (Yürüme/koşma salınımı)
  3. Gövde & Elbiseler/Kıyafetler (`drawK2Dress`, `drawK2Clothing`)
  4. Boyun, Yüz & Baş (`drawK2Head`, göz kırpma, dudak, burun sızıntısı)
  5. Ön Saç & Aksesuarlar (Kakül, ön bukleler, şapka, gözlük)
  6. Ön Kol, El Pozu & El Eşyası (`drawK2HeldItem`, cepte el veya eşya tutuşu)
- **Canlı Test Ortamı:** `public/test_k2_preview.html` dosyası tarayıcıda açılarak tüm yönler, animasyonlar ve elbiseler anında test edilebilir.

---

## 4. Sıradaki Geliştirme Yol Haritası (Sıradaki Seansın Hedefleri)

### 🎯 Hedef 1: Kız Karakterine Yeni Gardırop İtemleri
- **Kıyafetler & Elbiseler:**
  - Günlük sokak modası (Oversize hoodie, crop-top & kargo pantolon kombinleri).
  - Şık gece / parti elbiseleri (Yırtmaçlı kokteyl elbisesi, askılı yazlık elbise).
  - Ceketler & Kabanlar (Deri ceket, trençkot).
- **Saç Modelleri:**
  - At kuyruğu (Ponytail) — yürüme hareketine duyarlı yaylanma fiziği.
  - Çift örgü veya dağınık topuz (Messy bun).
  - Kısa küt / bob kesim saçlar.
- **Entegrasyon Noktaları:** `public/js/wardrobe.js` kataloğuna ekleme + `karakter2Renderer.js` içinde 8 yön çizim fonksiyonu.

### 🎯 Hedef 2: Kız Avatarında Görsel & Anatomik İyileştirmeler
- **Yüz & İfade Detayları:**
  - Profil açılarında (özellikle 2 ve 6 numaralı yönlerde) burun/çene eğrilerinin daha estetik hale getirilmesi.
  - Göz kırpma döngüsüne ek olarak hafif kafa eğme (idle micro-animations).
- **Yürüyüş & Postür Akıcılığı:**
  - Yürürken kalça ve omuz salınımının kadın anatomisine daha uyumlu zarif bir salınıma kavuşturulması.
  - Ayakta beklemede nefes alış-veriş derinliği.

### 🎯 Hedef 3: Yeni 8 Yönlü İzometrik El Eşyaları (Held Items / Props)
- **Eklenecek Yeni El Eşyaları:**
  - ☕ **Karton Kahve / Bubble Tea:** Yürürken elde hafif sallanan pipetli içecek.
  - 📱 **Akıllı Telefon:** Mesajlaşma veya selfie duruşu (ekrandan hafif ışık vurması).
  - 👜 **Kol / El Çantası:** Yürüyüş ritmiyle salınan lüks çanta.
  - 🍸 **Kokteyl Kadehi:** Casino / Gece kulübüne uygun kadeh.
- **Teknik Kural:** Tüm el eşyaları 8 yönde elin doğru açısıyla tutulmalı, arkaya bakıldığında gövdenin arkasında kalmalı, boştaki sol el ise havalı kargo cep duruşunu korumalıdır.

### 🎯 Hedef 4: Kafe & Oyun Salonu'nun 1000x625 Çözünürlüğünde Yeniden Tasarımı
- **Mevcut 5 Oyun Birebir Korunacak:**
  1. 🎱 **8-Ball Bilardo**
  2. 🎲 **Geleneksel Tavla**
  3. ❌ **XOX Düellosu**
  4. 🚢 **Amiral Battı**
  5. ♟️ **Satranç Masası**
- **1000x625 Geniş Ekran Mimarisi:**
  - Kafe salonu eski 800x500 ebatlarından modern `1000x625` (Meydan V2 ve Sahil V2 ölçeğine) taşınacak.
  - Masalar ferah koridorlarla birbirini sıkıştırmadan yerleşecek, karakterlerin yürüme ve oturma alanları genişleyecek.
- **Atmosfer & Premium Oyun Kulübü Detayları:**
  - **Tematik Halılar:** Bilardo altına zümrüt yeşili/bordo salon keçe halısı, satranç altına dama/mermer kaidesi, tavla altına şark köşesi kilimi.
  - **Sarkıt Spot Aydınlatma:** Masaların üzerine tavandan sarkan loş pirinç sarkıt lambalar ve masaya vuran dairesel yumuşak ışık huzmeleri.
  - **Masa Üstü Mikro Objeler:** Mekanik satranç saati, bilardo tebeşiri & isteka sehpası, tavla çay bardağı ve zarlar.
  - **Sosyal Alanlar:** Masaların çevresinde oturulabilir koltuklar, duvar TV'si ve ahşap retro "Şampiyonlar Panosu".

---

## 5. Oyun İçi Mevcut Sistemler ve Dosya Haritası
1. **Avatar Render Motorları:**
   - `public/js/avatarRenderer.js` (Karakter 1: Klasik erkek/kadın avatar, kıyafetler, saçlar, sigara, çay).
   - `public/js/renderers/karakter2Renderer.js` (Karakter 2: Vektörel izometrik motor, 8 yön, kadın yüz/postür, kıyafetler, zippo sigara, kargo cep pozu).
   - `public/test_k2_preview.html` (Karakter 2 canlı test stüdyosu).
2. **Mini Oyunlar:**
   - Tavla: `public/js/tavla.js`
   - Okey 101: `public/js/okey101.js`
   - Batak: `public/js/batak.js` & `src/coordinators/batakCoordinator.js`
   - Bilardo: `public/js/billiard.js` & `src/coordinators/billiardCoordinator.js`
   - Kumarhane Oyunları: `blackjack.js`, `roulette.js`, `slotMachine.js`, `ganyan.js`
   - Klasik Oyunlar: `chessGameUI.js`, `xoxGame.js`, `amiralBatti.js`, `dostKazigi.js`
3. **Sosyal & Çevre:**
   - Housing (Ev/Dekorasyon): `public/js/housing.js`, `src/handlers/housingHandler.js`
   - Pet Shop & Hayvanlar: `public/js/petShop.js`, `src/petManager.js`, `public/js/fatherPet.js`
   - Sesli Sohbet: `public/js/voiceChat.js`
   - Nargile Lounge: `public/js/nargileLounge.js`
   - Balık Tutma: `public/js/fishing.js`

---

## 6. Yeni Sohbette Devam Ederken Yapılacaklar (Prompt Tavsiyesi)
4 gün sonra yeni sohbet açtığında şu mesajı kopyalayıp yapıştırman yeterlidir:

```text
Merhaba! @PROJE_DURUMU_VE_HAFIZA.md dosyasını incele. 
Metaverse Mini projemizde kaldığımız yerden devam ediyoruz.
Öncelikli hedeflerimiz:
1. Kafe & Oyun Salonu'nu mevcut 5 oyunu (Bilardo, Tavla, XOX, Amiral Battı, Satranç) koruyarak modern 1000x625 çözünürlüğünde premium bir oyun kulübü olarak yeniden tasarlamak.
2. Karakter 2 (kız karakteri) için yeni gardırop itemleri tasarlamak (elbise/saç/kıyafet).
3. Kız karakteri avatarında yüz ve postür iyileştirmeleri yapmak.
4. 8 yönlü izometrik sisteme uygun yeni el eşyaları (kahve, telefon, çanta vb.) eklemek.
Kaldığımız yerden başlayalım!
```
