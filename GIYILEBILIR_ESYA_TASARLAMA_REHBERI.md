# Giyilebilir ve Tutulabilir Eşya Tasarlama Rehberi

Bu rehber; MetaverseMini evreninde tasarlanan veya yenilenen **tüm giyilebilir kıyafetler, hayvan/dönüşüm kostümleri, sırt aksesuarları (kanatlar, pelerinler), başlıklar ve elde tutulan eşyaların (silahlar, asalar, aletler)** görsel ve teknik standartlarını belirler.

> [!IMPORTANT]
> **Kalıcı Kural:** Bu rehber oluşturulduktan sonra, kullanıcı *"izometrik ve 8 yönlü baştan çizebilir misin"* demesine gerek kalmaksızın, sisteme eklenen veya güncellenen **HER eşya ve kostüm doğrudan bu rehberdeki 2.5D izometrik 8 yönlü standartlara göre üretilecektir.**

---

## 1. Temel İlkeler ve Görsel Felsefe

1. **Düz 2D Çizim Kesinlikle Yasaktır:** Düz, tek boyutlu, kağıt bebek gibi duran veya perspektifsiz çizimler oyunun derinlik hissini bozar. Her eşyanın kütlesi, kalınlığı, ışık alan yüzeyleri ve gölgede kalan kıvrımları olmalıdır.
2. **Tam 8 Yönlü İzometrik Perspektif:** Oyuncu 8 yöne dönebilir (`down`, `down-right`, `right`, `up-right`, `up`, `up-left`, `left`, `down-left`). Eşyalar bu yönlerin tamamında derinliği doğru yansıtmalıdır.
3. **Karakter2 HD Standartlarına Tam Uyum:** Karakterin taban alanı `(0, 0)`, gövde yüksekliği `~50-62 px`, omuz genişliği ve el tutma noktaları referans alınır. Kostüm karakterin yerini alıyorsa, isim etiketi yüksekliği (`getNameTagOffset`) ve göz hizası bu orana göre ayarlanmalıdır.
4. **Katmanlı Derinlik (Z-Sorting):** Uzaktaki uzuvlar/kanatlar arkada, gövde ortada, yakındaki uzuvlar/kanatlar ve elde tutulan nesneler ön planda çizilmelidir.
5. **İzometrik Işık Kaynağı:** Işık kaynağı daima **Sol-Üstten (~135° açı)** gelir. Sol ve üst yüzeyler parlak/aydınlık, sağ ve alt yüzeyler gölgelidir.
6. **Canlı Kinematik & Animasyon:** Hareketsizken nefes alma, hafif süzülme veya mikro kımıldamalar; hareket halindeyken adım/kanat döngüsü (`walkCycle`) ve dönüş yatışları (`banking`) uygulanmalıdır.

---

## 2. 8 Yönlü İzometrik Açı Matrisi

Çizim motorunda yönler aşağıdaki 5 temel geometrik görünüm ve aynalama (`mirror: ±1`) matrisi ile yönetilir:

```
                  [up] (Tam Arka)
                   ▲
     [up-left]     │     [up-right]
(Arka-Çeyrek Sol)  │  (Arka-Çeyrek Sağ)
         ◄─────────┼─────────►
    [left]         │        [right]
 (Profil Sol)      │      (Profil Sağ)
     [down-left]   │    [down-right]
 (Ön-Çeyrek Sol)   │  (Ön-Çeyrek Sağ - 2.5D Asıl Açı)
                   ▼
                 [down] (Tam Ön)
```

| Yön Kodu | Geometrik Görünüm | Aynalama (`mirror`) | Görsel Öncelikler ve Derinlik |
| :--- | :--- | :---: | :--- |
| `down` | `front` (Tam Ön) | `1` | İki yana dengeli açılım, göğüs zırhı/tüyleri, dik ve heybetli duruş, simetrik ayak/pençeler. |
| `down-right` | `quarter-front` (Ön-Çeyrek) | `1` | **2.5D derinliğin en güçlü hissedildiği açı.** Gövde 3/4 dönük; yakın kanat/kol geniş ve katmanlı; uzak kanat gövdenin arkasında; kafa ve bakışlar ileri-çapraza odaklı. |
| `right` | `profile` (Tam Yan) | `1` | Aerodinamik kütle; öne doğru göğüs kavisi; arkaya uzanan kuyruk veya pelerin; tam yan siluet. |
| `up-right` | `quarter-back` (Arka-Çeyrek)| `1` | Sırt kütlesi, omuz tüyleri/zırh plakaları, kanatların üst kısımları; baş arkadan hafif görünür. |
| `up` | `back` (Tam Arka) | `1` | Geniş sırt örtüsü, kanat sırtı veya pelerin; kuyruk üstü tüyleri; kafa arkadan ense görünümünde. |
| `up-left` | `quarter-back` | `-1` | `up-right` açısının `ctx.scale(-1, 1)` ile sol yönlü aynalanması. |
| `left` | `profile` | `-1` | `right` açısının `ctx.scale(-1, 1)` ile sol yönlü aynalanması. |
| `down-left` | `quarter-front` | `-1` | `down-right` açısının `ctx.scale(-1, 1)` ile sol yönlü aynalanması. |

---

## 3. Kategori Bazlı Tasarım Şablonları

### A. Hayvan ve Dönüşüm Kostümleri (Örn. Kartal, Karadul, Aslan)
- **Zemin Temas Gölgesi (Contact Shadow):** `(0, 0)` noktasında veya uçuyorsa zemin düzleminde 2:1 oranında katmanlı elips gölge (`rgba(0,0,0,0.3)` ve çekirdekte `rgba(0,0,0,0.5)`). Uçuş irtifası arttıkça gölge yumuşar ve hafif küçülür.
- **Kas & Kütle:** Karikatürize sıska çizgiler yerine, güçlü göğüs, omuz ve bacak kütleleri.
- **Doku & Tüy Katmanları:** Düz tek renk dolgu yerine, en az 3 katmanlı tüy/pul/deri örtüsü (Koyu astar -> Ana gövde gradyanı -> Üst örtü vurguları).
- **Yüz ve Bakış:** Avcı hayvanlarda (kartal, aslan vb.) kaş çıkıntısı (supraorbital ridge), derin yuvalı keskin gözler ve malzeme parlaklığı taşıyan gaga/dişler.

### B. Sırt Eşyaları (Kanatlar, Pelerinler, Sırt Çantaları, Sırt Kalkanları)
- **Katman Sıralaması (Depth Sorting):**
  - Oyuncu `up`, `up-left`, `up-right` (arkaya) bakarken: Sırt eşyası **en önde (karakterin üstüne)** çizilir.
  - Oyuncu `down`, `down-left`, `down-right` (öne) bakarken: Sırt eşyası **en arkada (karakterin arkasına)** çizilir. Kanatlar genişse uçları omuzların iki yanından taşarak görünür.
- **Rüzgar & Dalgalanma:** Yürürken karakterin hızına göre hafif geriye yatma ve sinüzoidal kumaş/tüy salınımı (`Math.sin(time / 200)`).

### C. Elde Tutulan Eşyalar (Silahlar, Asalar, Oltalar, Kazmalar, Bayraklar)
- **El Tutuş Koordinatları:** Karakter2'nin aktif el pozisyonuna tam kenetlenir (`x: ±12, y: -22`).
- **Perspektif Açısı:** Eşyanın sapı ve namlusu/ucu izometrik 30° / 45° eksende uzanır. Düz 90° dik veya yatay durmaz.
- **Işık Kırılması:** Metal veya kristal silahlarda üst kenar boyunca beyaz/parlak specular çizgi çekilir.

### D. Başlıklar, Kasklar ve Şapkalar (Baret, Kova Şapka, Bere, Kasket, Kovboy, Fes, Korsan, vb.)
- **Kafatasını Tam Kucaklama Zorunluluğu (Anatomik Kalıp):**
  - Karakter 2 kafatası merkezi `(0, -2.5)`, yarıçapı `r = 9.8 px`, ense arka sınırı `x = -9.8`, alın ön sınırı `x = +8.2`'dir.
  - Sığ, kafanın sadece tepesine oturan veya kafanın arkasını açıkta bırakan dar şapka kalıpları **KESİNLİKLE YASAKTIR**.
  - **Fes (Osmanlı Fesi):** Taban genişliği `x: -10.0` ila `+10.0` (20 px), tepe genişliği `x: -8.2` ila `+8.2` (16.4 px), yükseklik `y: -17.5` ila `-5.8` olmalıdır. Minyatür/tuzluk gibi küçük fese asla izin verilmez.
  - **Kovboy Şapkası:** Tac kubbesi en az 20 px genişliğinde (`x: -10.0` ila `+10.0`), tepe yüksekliği `y: -18.2`'de olmalı ve ortada `-15.2` derinliğinde kovboy oluğu bulunmalıdır. Kıvrık siperlik genişliği ise 34 px (`x: -17.0` ila `+17.0`) olmalıdır.
  - **Korsan Kaptanı (Tricorne):** Tepe üçgen zirvesi `y: -18.8`'e kadar yükselmeli (saçın `y: -17.5` boyunu aşmalıdır), yan köşeler `x: ±14.5, y: -11.5`'e kıvrılmalı, arka açıda kafa arkası kubbesi (`ellipse 11.2, 9.6`) tam örtülmelidir.
- **Saç Taşmasını %100 Önleme Kuralı (Katı Cisim Prensibi):**
  - Şapkalar ve baretler katı cisimlerdir; kumaş veya kask yüzeyini delip dışarı saç çıkamaz.
  - Saç modeli ne kadar vahşi, uzun veya sivri olursa olsun (`hair_k2_anime_spiky`, `hair_k2_messy_bun`, `hair_k2_fade_pompadour`, `hair_k2_flaming_fire` vb.), şapkanın kapattığı kubbe ve tepe yüzeylerinden dışarı tek bir piksel dahi taşamaz.
- **Şapka-Duyarlı Evrensel Kırpma Maskesi (`applyHatHairClipping`):**
  - Şapka takıldığında saç çiziminden hemen önce `ctx.save()` ve `applyHatHairClipping(ctx, facing, isBack, isProfile, dirSign, hatType)` kırpma maskesi (`ctx.clip()`) çalıştırılır.
  - **Kırpma Mantığı:**
    1. **Şapkanın Üst Zarfı (Hat Silhouette Envelope):** Şapkanın alt eteğinin üzerinde kalan bölgede (`y < -5.8`) saçlar o şapkanın katı gövde sınırına kilitlenir. Fes, Kovboy veya Korsan şapkasının dışına taşan yan/tepe sivrilikleri (%100) tıraşlanır.
    2. **Alt Serbest Bölge (Doğal Saç Akışı):** Şapkanın alt eteğinden itibaren (`y >= -5.8`), maske tüm genişliğe (`x: -35` ila `+35`, `y: 45`e kadar) tamamen açılır.
    3. **Asla Kel Yapma (No Bald Effect):** Şapka takıldığında alın perçemleri, kulak önü favorileri, ense saçları, omuz bukleleri, atkuyruğu ve örgüler şapkanın altından doğal bir şekilde dökülmeye devam eder.
- **8 Açılı İzometrik Şapka Standartları:**
  - **Profil (`right` / `left`):** Siperlik öne doğru hafif eğimli kavis çizer, arka etek enseye oturur, logo/yama veya fiyongun profil açısı doğru aktarılır.
  - **Çapraz (`down-right`, `up-right` vb.):** 3/4 açılı elips siperlik ve derinlikli kubbe kütlesi.
  - **Tam Ön (`down`):** Kaşların tam üstünde, alındaki saç köklerini örten ancak gözleri ve yüz ifadesini kapatmayan hizada.
  - **Tam Sırt (`up`):** Şapkanın arka eteği ense köküne oturur, arka dikişler ve ense saçları dengeli görünür.

---

## 4. Renk, Aydınlatma ve Malzeme Paleti Kuralları

1. **Hiçbir Zaman Saf Siyah (`#000000`) Kullanma:** En karanlık gölgelerde bile hafif tonlu siyahlar tercih edilir (örn. koyu tüylerde `#1a120b`, zırhta `#0f172a`).
2. **Degradeler (Linear & Radial Gradients):** Düz dolgu (`ctx.fillStyle = '#...'`) yerine her zaman kütle hissi veren gradyanlar kullanılır:
   ```javascript
   const grad = ctx.createLinearGradient(x - w, y - h, x + w, y + h);
   grad.addColorStop(0, highlightColor); // Sol-üst ışık
   grad.addColorStop(0.5, baseColor);    // Orta ton
   grad.addColorStop(1, shadowColor);    // Sağ-alt gölge
   ```
3. **Kontur Çizgileri:** Sert siyah 2px çizgiler yerine, malzemenin kendi renginin %30 daha koyu tonuyla ince (`0.8px - 1.2px`) temizleme konturu çekilir.

---

## 5. Doğrulama ve Tamamlanma Kontrol Listesi

Yeni bir giyilebilir/tutulabilir eşya tamamlandığında şu testler yapılmalıdır:

- [ ] 8 yönün tamamında (`down`, `down-right`, `right`, `up-right`, `up`, `up-left`, `left`, `down-left`) görsel denendi mi?
- [ ] 2.5D derinlik ve hacim hissi var mı? Düz 2D gibi duran bölge kaldı mı?
- [ ] Işık kaynağı sol-üst açıya sadık mı?
- [ ] Karakter yürürken adım ritmiyle (`walkCycle`) senkronize salınıyor veya hareket ediyor mu?
- [ ] Dururken (`idle`) doğal nefes alma veya mikro kımıldama mevcut mu?
- [ ] Zemin gölgesi koordinatları ve boyutu karakterin altıyla tam örtüşüyor mu?
- [ ] İsim etiketi ve sohbet baloncuğu eşyanın üstüne binmeden doğru mesafede (`getNameTagOffset`) duruyor mu?
- [ ] **Şapka / Başlık Kontrolü:** Şapka veya baretin kapattığı yerlerden (özellikle profil ve sırt açılarda tepe veya arkadan) saç fırlaması engellendi mi?
- [ ] **Kırpma & Doğallık:** Şapka altındaki ense, omuz dökümleri ve favoriler korunuyor mu (kel kalma - bald effect hatası yok mu)?
- [ ] `node --check` ile sözdizimi doğrulandı mı?
- [ ] Tarayıcıda gerçek sunucu üzerinden canlı olarak izlendi mi?

