# Yeni Mekân Tasarlama Rehberi

Bu rehber, oyuna yeni bir mekân eklerken veya mevcut bir mekânı baştan tasarlarken izlenecek süreci anlatır. Petshop izometrik mekânını yeniden kurarken kullandığımız yaklaşım temel alınmıştır: **önce çalışan ve okunaklı bir mekân kabuğu, sonra onaylanan tasarıma uygun detaylar.**

## Temel ilkeler

- Önce mekânın işlevini, görünüşünü ve oyun içindeki davranışını netleştir; hemen dekor çizmeye başlama.
- Görsel çizim, oyuncu hareketi, çarpışma ve kapı geçişleri aynı koordinat sistemine göre çalışmalı.
- Büyük bir görsel/yön değişikliğinde önce boş mekânı göster ve geri bildirim al. Kullanıcı mekân kabuğunu beğenmeden mobilya ve dekor ekleme.
- Oyunu çalıştırarak doğrula. Kodun sözdiziminin doğru olması, mekânın ekranda doğru göründüğünü tek başına kanıtlamaz.
- Değişiklikleri küçük ve ilgili tut; başka mekânların davranışını etkilemediğini kontrol et.
- **3D Katı Model ve Derinlik Kuralı:** Mekândaki mobilya ve eşyaları düz 2D resim olarak değil, derinliği, eni ve boyu olan 3 boyutlu katı kütleler (Solid Models) olarak tasarla. Karakterin ayakları mobilyanın tabanına çarpmalı, içinden geçmemeli; derinlik sıralaması zemin ekvatoruna göre yapılmalı ve tabanlar çift katmanlı kontak gölgeleriyle yere sabitlenmelidir.

## Adım adım iş akışı

### 1. İsteği ve kapsamı anla

Tasarım başlamadan önce şu noktaları belirle:

- Mekân ne için kullanılacak? Mağaza, ev, salon, dış alan vb.
- Oyuncu nereden girecek ve nasıl çıkacak?
- Mekân düz 2D mi, 2.5D mi, izometrik mi olacak?
- İlk teslim yalnızca boş mimari mi, yoksa mobilya ve etkileşimler de isteniyor mu?
- Oyun alanının mevcut genişlik/yüksekliği veya oyuncu yerleşimi değişebilir mi?

Tarz ya da kapsam birden fazla makul seçeneğe açıksa, tasarım kararını uygulamadan önce seçenekleri kullanıcıya sun. Örneğin, petshop için önce “sıcak mahalle butiği mi, modern premium mağaza mı?” yönünü netleştirdik.

### 2. Mevcut mekân sistemini incele

Kod değiştirmeden önce:

1. Mekânın oda anahtarını ve geçiş noktalarını bul.
2. Oyunun o oda için kullandığı Canvas boyutlarını kontrol et. Geniş odalar genellikle `1000x625` boyutundadır; gerçek boyutu koddan doğrula.
3. Odanın çizim döngüsünü ve statik arka plan çizim akışını incele.
4. `checkWorldCollision` içindeki sınırları ve varsa mekâna özel engelleri bul.
5. `roomInteractions.js` içindeki tıklama, yürüme kapısı, klavye etkileşimi ve çıkış davranışlarını bul.
6. `index.html` içindeki ilgili script yüklemelerini ve önbellek sürümlerini kontrol et.
7. Projede benzer oda veya renderer varsa onu örnek al; aynı işi yapan ikinci bir sistem yazma.

Bir alanı tasarlamadan önce tüm bağlantılı yüzeyleri not et: **render, Canvas ölçüsü, çarpışma, giriş/çıkış, etkileşim ve script yükleme**.

### 3. Önce mekân kabuğunu çiz

İlk görsel sürümde yalnızca şunları çiz:

- Arka plan ve odanın dış silueti
- Zemin düzlemi
- Duvarlar ve duvar-zemin birleşimi
- Giriş açıklığı/eşiği
- Hacmi anlatan temel ışık ve gölge

Bu aşamada mobilya, tabela, ürün, NPC, bitki veya dekor ekleme. Önce mekânın oranını, perspektifini, yönünü ve karakterin üzerinde rahatça yürüyebileceği alanı doğrula. Petshopta eski sahneyi tamamen kaldırıp boş izometrik kabuğu tek başına göstermemiz bu adımdı.

#### İzometrik çizim notları

- 2:1 izometrik izdüşümde bir düzlemdeki iki eksenin ekrandaki yönleri çaprazdır. Basit bir model olarak `screenX = originX + (u - v) * tileWidth/2`, `screenY = originY + (u + v) * tileHeight/2` kullanılabilir.
- `tileWidth / tileHeight` oranını, oda köşelerini ve zemin ızgarasını aynı projeksiyonla üret. Farklı oranları karıştırmak zemini eğik veya perspektifi tutarsız gösterir.
- Zemin eşkenar dörtgeninin dört köşesi, duvar taban çizgileri ve yürüme sınırı aynı oda geometrisini temsil etmelidir.
- İzometrik görünüş için yalnızca düz bir dikdörtgen zemine çapraz çizgiler eklemek yeterli değildir; duvar, zemin ve derinlik kenarları birlikte bir hacim oluşturmalıdır.

### 4. Görsel ölçeği ve kadrajı ayarla

Mekân ekranda küçük kalıyorsa veya kenarların görünmesi istenmiyorsa, ölçeği ve konumu kontrollü biçimde değiştir:

- Önce mevcut görünümü tarayıcı ekran görüntüsüyle kaydet.
- Ölçek ve kaydırma değerlerini açık sabitler olarak tut; örneğin oda ölçeği ve dikey kaydırma.
- `ctx.save()` / `ctx.restore()` arasında transform uygula; Canvas'ın kalan çizimlerine taşmasını engelle.
- Üst duvarın ekrandan taşması isteniyorsa, giriş tarafını ve yürünebilir zeminin yeterli bölümünü kadrajda bırak.
- Ölçeği büyüttüğünde aynı dönüşümü çarpışma sınırına da uygula. Görüntüyü büyütüp eski sınırları bırakma.

### 5. Yürünebilir alanı ve çarpışmayı eşleştir

Çarpışmayı görselden ayrı bir tahmin olarak değil, mekân geometrisinin parçası olarak ele al:

1. Oyuncunun geçebileceği zemin alanını belirle.
2. Duvarların arkasını ve oda dışını engelle.
3. Kapı/eşik için gerekiyorsa kontrollü bir açıklık tanımla.
4. Renderer ölçek/kaydırma kullanıyorsa collision aynı dönüşümün tersini veya aynı ekran koordinatlı sınırı kullanmalı.
5. Sınırın içinden, kenarından ve dışından test noktaları seç.

İzometrik bir elmas zeminin içini kontrol etmek için normalize edilmiş bir nokta testi kullanılabilir:

```js
Math.abs(x - centerX) / radiusX
    + Math.abs(y - centerY) / radiusY <= 1
```

Bu yaklaşım ancak `centerX`, `centerY`, `radiusX` ve `radiusY` çizilen zeminle aynı transformu temsil ediyorsa doğrudur. Odanın farklı şekli varsa sınır formülünü o şekle göre kur.

### 6. Giriş ve çıkış akışını doğrula

- Kapı açıklığı çizimde görünür ve oyuncunun yaklaşabileceği yerde olmalı.
- Odaya gelişte sunucunun/oda geçişinin verdiği spawn noktası yürünebilir zeminin içinde kalmalı.
- Yürüyerek geçiş, tıklama veya klavye ile geçiş mevcutsa hepsini ayrı ayrı kontrol et.
- Kapıdaki çarpışma istisnası yalnızca gerekli açıklıkta çalışmalı; tüm alt/yan sınırı yanlışlıkla açma.
- Boş kabuk aşamasında mobilya/NPC etkileşimi yoksa eski görünmez etkileşim alanlarını kaldır veya kapsam dışında bırak.

### 7. Boş kabuğu gözle incele ve onay al

Boş mekânı gerçek oyun Canvas ölçüsünde tarayıcıda göster. Şunlara bak:

- İlk bakışta oda mı, düz bir resim mi gibi okunuyor?
- Perspektif, duvar yüksekliği ve zemin oranı tutarlı mı?
- Giriş yönü anlaşılıyor mu?
- Kenarlar kadraj dışında kalırken karakterlerin yürüyüş alanı yeterli mi?
- Çok koyu arka plan, tekrar eden karo veya aşırı kalın çizgiler dikkati dağıtıyor mu?
- Oyuncu sprite'ı zeminde doğru yerde ve doğru ölçekte görünüyor mu?

Ekran görüntüsünü kullanıcıya gösterip temel mekân kabuğunu onaylat. Gerekirse ölçek, renk, zemin ve duvar oranını bu aşamada düzelt. Onaydan önce dekor katmanına geçme.

### 8. Malzeme, mimari detay ve ışığı ekle

Boş mekân onaylandıktan sonra dekor eklemeden önce temel görsel dili güçlendir:

- **Zemin:** Tekrarlı dama görünümü yerine mekânın tarzına uygun döşeme seç. Ahşapta şaşırtmalı tahtalar, taşta farklı boyutlu plakalar gibi gerçek malzeme düzeni kullan.
- **Duvar:** Süpürgelik, panel, köşe çıtası ve üst kenar profiliyle duvar-zemin birleşimini tanımla.
- **Işık:** Tek bir baskın ışık yönü seç. Duvar tonları ve zemin gölgesi bu yönle tutarlı olsun.
- **Derinlik:** Odanın altındaki gölge zemini çevresine yumuşak dağıt; oda havada asılı bir platform gibi görünmesin.
- **Giriş:** Eşik veya döşeme değişikliğiyle girişi belirt; yürünebilir alanı kapatma.

Her detayın hacmi ve malzeme hissini desteklemesini sağla. Yalnızca boşluğu doldurmak için desen veya dekor ekleme.

### 9. Mobilya, NPC ve etkileşimleri katmanla

Mekân kabuğu onaylandıktan sonra işlevlere göre dekorasyonu ekle:

1. Oyuncunun ana yürüyüş rotasını belirle ve boş tut.
2. Büyük/kütlesel öğeleri yerleştir, ardından küçük dekorları ekle.
3. Nesnelerin çizim sırasını derinliğe göre kur; oyuncu nesnenin önüne/arkasına doğru geçebilmeli.
4. Görsel nesne sınırlarını çarpışma sınırlarıyla eşleştir.
5. Etkileşim alanlarını görünen NPC/tezgâh/kapının bulunduğu yere bağla.
6. Oyuncu, mobilya, kapı ve etkileşim alanlarının çakışmadığını test et.

Her nesneye çarpışma vermek gerekmez: halı veya dekoratif işaret yürünebilir olabilir; masa, duvar veya büyük teşhir alanı engel olabilir. Görsel tasarım ile oyun davranışı aynı kararı vermeli.

### 10. Uygulamayı ve kontrolleri tamamla

- Kod tabanındaki renderer adlandırma ve yükleme düzenini izle.
- Statik arka plan ve hareketli/animasyonlu öğeleri mevcut oda çizim akışına uygun ayır.
- Canvas context ve boyutlarını mevcut yardımcıların sağladığı şekilde kullan.
- İlgili dosya değiştiğinde `index.html` script cache-busting sürümünü güncelle.
- Dokümantasyon değişikliği gerekiyorsa ilgili rehber veya proje notunu güncelle; alakasız dokümanları değiştirme.

### 11. Test et ve teslim et

En az şu doğrulamaları yap:

- Değişen JavaScript dosyalarında `node --check`.
- İlgili diff için `git diff --check`.
- Uygulamayı `http://localhost:3000/` gibi proje sunucusu üzerinden aç; `file://` kullanımı Socket.IO ve kök dizinli asset'leri bozabilir.
- Odayı gerçek oyun döngüsünde açıp boş kabuğu ve oyuncu sprite'ını görüntüle.
- Zeminin merkezini, kenarını, duvar arkasını, oda dışını ve kapı açıklığını collision ile kontrol et.
- Odaya giriş, oda içinde yürüme ve çıkış davranışlarını dene.
- Değişiklikten önce/sonra ekran görüntüsü al; özellikle ölçek veya geometri değiştiyse görsel sonucu mutlaka incele.
- Kullanıcıya neyin değiştiğini ve hangi kontrollerin yapıldığını kısa şekilde bildir; doğrulanmayan akışı doğrulanmış gibi sunma.


## Ev Mobilyaları ve Mekân Eşyaları İçin 3D Katı Model (Solid Modeling) ve Derinlik (Y-Sorting) Standardı

Optik mağazası ve ev mobilyalarında mükemmelleştirilen bu standart; bundan sonra tasarlanacak **tüm ev mobilyaları, mağaza dekorasyonları, standlar, tezgahlar ve harita eşyaları** için bağlayıcı temel kuraldır.

---

### 1. 3D Katı Model Mantığı (Solid Volume)

Bir mobilya veya eşya tasarlanırken:
- Yalnızca ekranda duran 2D düz bir görsel (illüstrasyon) gibi **düşünülmez**.
- Gerçek dünyada derinliği, eni, yüksekliği ve taban oturma alanı olan **3 boyutlu katı bir cisim** olarak modellenir.
- Karakter eşyanın içine giremez; eşyaya çarptığında karakterin **ayakları** eşyanın zemin tabanına çarpmalı ve doğal bir şekilde eşyanın kavisli sınırından etrafına doğru dolanmalıdır.

---

### 2. Karakter Ayak Temas İzdüşümü (`fx = x, fy = y + 21`)

HTML5 Canvas 2D çiziminde karakterlerin dünya koordinatları `(x, y)` göbek/merkez hizasındadır.
Ancak karakterin zeminle temas ettiği ve mobilyalara çarptığı nokta **ayak tabanıdır**:

```javascript
// Karakterin dünyadaki gerçek ayak basma noktası:
const fx = x;
const fy = y + 21; // Ayak zemin temas çizgisi
```

Tüm eşya ve mobilya çarpışma kontrollerinde (`checkRoomCollision`) test noktası mutlaka `(fx, fy)` olmalıdır.

---

### 3. Minkowski Taban Genişlemesi (Minkowski Sum & Silindirik/Eliptik Hacim)

Karakter oyunda tek bir piksel noktası değildir; ayak tabanı yaklaşık `14x7 px` boyutunda 2:1 izometrik bir elipstir.
Bu nedenle mobilyanın zemindeki masif taban yarıçapına karakterin ayak yarıçapı eklenerek **Minkowski Çarpışma Geometrisi** oluşturulur:

$R_{collX} = R_{baseX} + 7\text{px}$
$R_{collY} = R_{baseY} + 3.5\text{px} \quad (2:1 \text{ İzometrik Oran})$

**Sonuç:**
- Karakter mobilyanın dibine kadar yürüyebilir.
- Ayakları mobilyanın taban dairesini asla delip içine geçmez.
- Mobilyanın yuvarlak/kavisli formu boyunca akıcı bir şekilde etrafından dolanır (sliding collision).

---

### 4. Geometrik Mobilya Tiplerine Göre Çarpışma Formülleri

#### A. Dairesel ve Silindirik Mobilyalar (Standlar, Yuvarlak Masalar, Puflar, Saksılar)
İzometrik elips denklemi kullanılır. Taban merkezi `(cx, cyBase)` ve Minkowski yarıçapları `(rx, ry)`:

```javascript
// 3D İzometrik Silindirik Katı Model (Elips Denklemi)
if ((Math.pow(fx - cx, 2) / (rx * rx) + Math.pow(fy - cyBase, 2) / (ry * ry)) <= 1.0) {
    return true; // Katı cisim engeli
}
```

*Örnek:* Optik altıgen kule (scale: 1.1, taban merkezi: 430, 508, Minkowski yarıçapları: rx: 24, ry: 12).

#### B. Köşeli ve Dikdörtgen Mobilyalar (Koltuklar, Dolaplar, Çalışma Masaları)
Eksenel zemin basma kutusu (AABB) veya izometrik poligon:

```javascript
// Masif Koltuk Tabanı
if (fx >= xMin && fx <= xMax && fy >= yMin && fy <= yMax) {
    return true;
}
```

#### C. Kavisli ve Özel Bankolar (Resepsiyon Masası, Bar Tezgahı)
Masif tezgah gövdesi + tezgah arkasında personel koruma kabini şeklinde ayrılır.

---

### 5. Sıfır Kırpılma (Z-Fighting) Sağlayan Zemin Ekvatoru Derinlik Standardı (Center-Equator Y-Sorting)

2.5D derinlik sıralamasında en sık yapılan hata, objenin `sortY` değerini tepesine (`y`) veya tabanın en alt ucuna (`y + H`) vermektir. Bu hata karakterin objenin arkasında veya önünde garip şekilde kırpılmasına sebep olur.

#### Altın Kural:
Bir mobilyanın render kuyruğundaki sıralama anahtarı (`sortY`), mobilyanın **zemine temas ettiği taban elipsinin tam merkez $y$ koordinatına ($y_{base}$)** eşitlenir!

```javascript
renderQueue.push({
    type: 'hex_tower',
    sortY: 508, // Taban elipsinin tam merkez ekvatoru (yBase)
    draw: () => drawHexagonalTower(ctx, 430, 492, 1.1)
});
```

Oyuncuların `sortY` değeri ise `p.y + 21` (ayak seviyesi)'dir (koltukta oturuyorsa `sortY - 6`).

#### Otomatik Derinlik Davranışı:
1. **Karakter Mobilyanın Arkasındayken (`fy < yBase`):**
   - `sortY_player < sortY_mobilya` olur.
   - Karakter mobilyadan **önce** çizilir; mobilya karakterin bacaklarını ve gövdesini kapatır. Karakterin başı mobilyanın arkasından doğal şekilde görünür.
2. **Karakter Mobilyanın Önündeyken (`fy > yBase`):**
   - `sortY_player > sortY_mobilya` olur.
   - Karakter mobilyadan **sonra** çizilir; karakterin ayakları ve gövdesi mobilyanın üzerine biner.
3. Karakter mobilyanın etrafında dönerken hiçbir titreme, atlama veya katman kırpılması yaşanmaz.

---

### 6. Yere Mıhlama & Çift Katmanlı Kontak Gölgesi (Contact Ambient Occlusion)

Eşyaların zeminde uçuyor veya kayıyor gibi görünmesini engelleyen çift katmanlı gölge standardı:

1. **Katman 1 - Geniş Yaygın Zemin Gölgesi:**
   - Opaklık: `rgba(0, 0, 0, 0.35 - 0.45)`
   - Yumuşak, objenin tabanından biraz daha geniş elips.
2. **Katman 2 - Yere Mıhlama Kontak Gölgesi (Contact Occlusion):**
   - Opaklık: `rgba(0, 0, 0, 0.75 - 0.85)`
   - Tam taban jantının / ayakların zemine bastığı ince ve koyu elips. Mobilyayı zemine adeta kaynaklar.

```javascript
// 1. Zemin Yaygın Gölgesi
ctx.fillStyle = "rgba(0, 0, 0, 0.40)";
ctx.beginPath();
ctx.ellipse(x, yBase, radiusX + 4, radiusY + 2, 0, 0, Math.PI * 2);
ctx.fill();

// 2. Yere Mıhlama Kontak Gölgesi (Zemin Baza Teması)
ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
ctx.beginPath();
ctx.ellipse(x, yBase, radiusX - 2, radiusY - 2, 0, 0, Math.PI * 2);
ctx.fill();
```

---

### 7. Dolaşım ve Ergonomi Standartları

- **Geçiş Koridorları:** Eşyalar arasında en az `40 - 50 px` net yürüme boşluğu bırakılmalıdır.
- **Oturma Entegrasyonu (`seatRegistry.js`):**
  - Koltukların oturma noktaları minder merkezine hizalanır.
  - Karakter yönü (`facing: 'down-left' | 'down-right'`) odadaki odak noktasına (masa, TV, danışma) dönük olmalıdır.
  - Oturan karakter için `sortY` değeri 6 px yukarı çekilerek koltuk minderiyle kusursuz derinlik sağlanır.

## Yeni oda için tamamlanma kontrol listesi

- [ ] Oda kimliği, amacı, ölçüsü ve görsel yönü netleştirildi.
- [ ] Mevcut renderer, collision, portal, spawn ve script akışı incelendi.
- [ ] Önce yalnızca boş mimari kabuk oluşturuldu.
- [ ] Perspektif ve zemin geometrisi tutarlı.
- [ ] Görsel transform ve collision aynı ölçü/konuma sahip.
- [ ] Giriş ve çıkış çizimde ve oynanışta çalışıyor.
- [ ] Temel kabuk kullanıcıya gösterilip geri bildirimle düzeltildi.
- [ ] Malzeme, ışık ve mimari detaylar mobilyadan önce tamamlandı.
- [ ] Mobilya ve eşyalar 3D katı model olarak tasarlandı (ayak izdüşümlü `fx = x, fy = y + 21`).
- [ ] Silindirik/dairesel eşyalar Minkowski taban elips formülüyle (`rx, ry`) modellendi.
- [ ] Tüm mobilyaların derinlik sıralama anahtarı (`sortY`) zemin taban elips merkezine (`yBase`) eşitlendi.
- [ ] Mobilya tabanlarında çift katmanlı yere mıhlama kontak gölgesi (`rgba(0, 0, 0, 0.8)`) uygulandı.
- [ ] Mobilyalar arasında en az 40-50 px avatar yürüme koridoru sağlandı.
- [ ] Oturulabilir mobilyalar `seatRegistry.js` ile entegre edildi ve oturuş derinlik dengesi (`sortY - 6`) test edildi.
- [ ] Gerçek sunucu üzerinden tarayıcı ve hareket kontrolleri yapıldı.
- [ ] Syntax, diff ve cache-busting kontrolleri tamamlandı.


---

## 8. ALTIN KURAL: YENİ VE REVİZE EDİLECEK TÜM NPC TASARIM STANDARDI (Semihus Aydınus, Dr. Selim Hekimoğlu & VIP Club Standardı)

Kullanıcının kesin talimatı gereği, oyundaki tüm yeni NPC'ler ve revize edilecek mevcut NPC'ler **Semihus Aydınus (İSG Şefi), Dr. Selim Hekimoğlu (Veteriner) ve VIP Club (Tekinsiz Tekin)** tasarım diline tam uyumlu olarak üretilmelidir. Düz 2D çöp adam, basit dikdörtgen veya gövdesi kesik NPC yapılması kesinlikle yasaktır.

### Temel Prensipler:

1. **Boyut, Heybet ve Ölçekleme (`scale: 1.25 - 1.30`):**
   - NPC'ler normal oyuncu karakterlerinden belirgin şekilde daha heybetli, karizmatik ve görünür olmalıdır.
   - Büyütme mutlaka ayak temas noktası (`groundY = npcY + 16`) merkez alınarak uygulanmalıdır:
     ```javascript
     ctx.save();
     ctx.translate(npcX, groundY);
     ctx.scale(1.25, 1.25);
     ctx.translate(-npcX, -groundY);
     ```
   - Böylece karakter havada büyümez, zemindeki ayak tabanından yukarı doğru orantılı uzar.

2. **Baştan Aşağıya %100 Tam Vücut Görünürlüğü (No Cut-off):**
   - NPC'ler asla yüksek bir bankonun, masanın veya kutunun arkasına gömülüp bacakları/vücudu gizlenmemelidir.
   - Karakter bankonun/masanın yanında, önünde veya açık servis alanında **ayakkabısından şapkasına kadar baştan ayağa eksiksiz görünmelidir** (Pet Shop'ta Dr. Selim'in banko solunda durması, VIP Club'ta Tekin'in bar solunda durması, Botanik'te Defne ve Rasim'in açık servis alanında durması gibi).

3. **Çift Katmanlı 3D Zemin Kontak Gölgesi:**
   - **Yaygın Ortam Gölgesi (Ambient Occlusion):** `rgba(0, 0, 0, 0.35)` ile `18x7` elips.
   - **Çekirdek Yere Mıhlama Gölgesi:** `rgba(0, 0, 0, 0.78)` ile `11x4` elips.

4. **Mesleğe ve Mekana Özel Zengin Kostüm & Aksesuar Anatomisi:**
   - **Ayakkabılar/Botlar:** Taban kauçuk katmanı, dikişler, tokalar, metal kuşgözleri (ör. bahçıvan botları, cerrah sabo terlikleri, tüccar Oxford köseleleri, işçi çelik burun botları).
   - **Pantolon/Tulum:** Çift kat diz yamaları, dikiş çizgileri, kargo cepler, kemer veya sarkan zincirler.
   - **Çok Katmanlı Üst Giyim:** İç gömlek/tişört + dış önlük/yelek/ceket/forma, klapalar, yakalıklar, askılar, bronz/altın tokalar, yaka rozetleri veya taze çiçek butonyeri.
   - **Elde Taşınan Canlı Aksesuarlar:** Boş el yerine mutlaka mesleki bir alet veya canlı nesne tutulmalıdır (ör. Defne'de parıldayan fide saksısı ve pirinç sulama kabı; Rasim'de sipariş defteri ve pirinç terazi; Dr. Selim'de clipboard ve köpek bisküvisi; Tekin'de altın karaborsa sikkesi; Semihus'ta İSG denetim panosu).

5. **Dinamik Mikro Animasyonlar:**
   - Ritmik göğüs nefes alma (`breathe = Math.sin(now / 480) * 1.1`).
   - Göz kırpma (`isBlinking = ((now % 4200) < 170)`).
   - Gözbebeği yön takibi / etrafı süzme (`eyeShift = Math.sin(now / 900)`).
   - Aksesuar / gözlük lensi / bitki parıltısı (`glint`).

6. **Karakteristik Sohbet ve Replik Baloncuğu:**
   - Mekana ve karaktere özgü samimi, esprili ve bilgilendirici en az 7-9 replik tanımlanmalıdır.
   - Replik balonu 7 saniye ekranda kalır, periyodik olarak döner.
   - Mekanda birden fazla NPC varsa (ör. Botanik'te Defne & Rasim), replik döngülerine faz farkı (30 sn) verilir ve balon koordinatları kenarlara kilitlenerek asla çakışma yaşanmaz.
   - NPC'ye tıklandığında anında selamlama repliği (`trigger...Greeting()`) tetiklenir.

7. **Lüks İsim Etiketi & Hover Efekti:**
   - Yuvarlatılmış koyu şık kart (`rgba(15, 23, 42, 0.94)`), karaktere özel tematik bordür (zümrüt yeşili, amber sarısı, emniyet sarısı vb.).
   - Fare üzerine geldiğinde bordür ve metin parıldar, imleç `pointer` olur.

8. **Asla Yakınlıkta [E] Harfi Çıkmaz:**
   - Nesne ve NPC yanına gelindiğinde çıkan `[E]` etkileşim balonları yasaktır. Tıklama ile doğrudan ilgili mağaza/diyalog modalı açılır.
