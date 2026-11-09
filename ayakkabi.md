# 👟 K2 Karakter Ayakkabı Tasarım & Orantı Rehberi (`ayakkabi.md`)

Bu rehber; MetaverseMini evreninde **Karakter 2 (K2)** için tasarlanan tüm ayakkabıların (sneakers, botlar, spor ayakkabılar, klasik kunduralar) boyut, oran, katman mimarisi ve görsel derinlik standartlarını belirler.

Gelecekte sisteme eklenecek veya güncellenecek **TÜM ayakkabı modelleri** bu rehberdeki altın oran ve katman kurallarına göre üretilecektir.

---

## 1. Altın Oran Kuralları ve Temel Prensipler

1. **Taban Kalınlığı Kuralı (Midsole < %35):**
   - Taban kalınlığı (midsole + outsole) ayakkabının toplam dikey yüksekliğinin **asla yarısını (%50) geçemez**.
   - Taban dikey alanın **%30 - %35'ini**, üst renkli gövde (deri paneller, bağcıklar, amblemler) ise **%65 - %70'ini** kaplamalıdır.
   - Bu kural, ayakkabının kaba bir platform gibi görünmesini engeller; gerçek bir sokak modası / retro basketbol ayakkabısı (Air Jordan 1, Nike Dunk vb.) estetiği sağlar.

2. **Bacak Anatomisini Koruma Kuralı (`legLen: 12.0px`):**
   - Ayakkabı boğazı ve dili pantolon paçasını örtmez (`y: -1.2 -> 0.0` bandında hafifçe arkadan yükselir).
   - Karakterin bacak boyu (`legLen = 12.0px`) korunur; ayakkabı bacağı kısaltmaz veya paçayı yapay olarak yukarı itmez.
   - Ayakkabı çizim fonksiyonu `ctx.translate(0, legLen)` sonrasında başlar; yani `y = 0` noktası paçanın bittiği zemin seviyesidir.

3. **Ön Görünüm Genişlik Sınırı (`frontW: 7.4px`):**
   - Önden bakışta ayakkabı eni `7.4px` (`sX = -3.7`) olmalıdır.
   - Bu genişlik, klasik kot ve kargo pantolonun paça ribanasıyla tam 1:1 hizada ve tok bir form sağlar. Kesinlikle yayvan veya palet gibi durmaz.

4. **Profil Boyut Standardı (`sW: 12.0px`):**
   - Yandan bakışta ayakkabı uzunluğu tam `12.0px` (`sX = -3.8`) olmalıdır.
   - Topuk geriye doğru `3.8px`, burun ise öne doğru `8.2px` uzanır. Burun ucunda dinamik hafif yukarı kalkıntı (toe spring rocker) bulunur.

---

## 2. Açı Bazlı Boyut ve Koordinat Matrisi

| Görünüm Açısı | Yön Kodu | Genişlik (`sW`) | Başlangıç `sX` | Taban Kalınlığı (`soleH`) | Gövde Yüksekliği | Zemin Teması (`y_bottom`) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Profil (Doğu)** | `right` / `left` (mirror) | `12.0px` | `-3.8` | `1.7px` (Beyaz) + `0.6px` (Siyah) | `3.5px` (Kırmızı/Beyaz) | `y = 6.2` |
| **Ön (Güney)** | `down` | `7.4px` | `-3.7` | `1.8px` (Beyaz) + `0.6px` (Siyah) | `4.3px` (Kırmızı/Siyah) | `y = 6.8` |
| **3/4 Çapraz (G-D)**| `down-right` / `down-left` | `10.6px` | `-3.8` | `1.7px` (Beyaz) + `0.6px` (Siyah) | `3.5px` (Kırmızı/Beyaz) | `y = 6.2` |
| **Arka (Kuzey)** | `up` | `7.4px` | `-3.7` | `1.7px` (Beyaz) + `0.6px` (Siyah) | `3.6px` (Kırmızı) | `y = 6.3` |

> [!NOTE]
> Sol yönler (`left`, `up-left`, `down-left`) motor tarafından `ctx.scale(-1, 1)` ile sağ yönlerden aynalandığı için ayrı bir koordinat yazılmasına gerek yoktur.

---

## 3. Hayati Katman Mimarisi (Çizim Sırası Kuralı)

Canvas 2D motorunda katmanlar ardışık çizildiği için, **çizim sırası yanlış olursa üstteki parçalar bağcıkları veya logoları örterek bulanıklığa yol açar**. Her açı için aşağıdaki sıra kesinlikle bozulmamalıdır:

### A) Ön Görünüm Çizim Sırası (`facing === 'down'`):
1. **Boğaz / İç Astar (Black Collar Padding):** `roundRect(sX + 0.9, -0.7, frontW - 1.8, 1.4, ...)`
2. **Dil & Logo Etiketi (Tongue & Label):** `roundRect(-1.3, -1.2, 2.6, 1.5, 0.4)`
3. **Bileklik Yan Kanatları (Ankle Flaps):** `roundRect(sX + 0.4, -0.2, frontW - 0.8, 1.8, ...)`
4. **Burun Üstü Beyaz Panel (Toe Box Vamp):** `roundRect(sX + 0.6, 1.1, frontW - 1.2, 2.4, ...)` *(Önce çizilir, böylece bağcıkları örtmez!)*
5. **Kırmızı Burun Çamurluğu (Mudguard Wrap):** `roundRect(sX + 0.2, 2.2, frontW - 0.4, 2.2, ...)` *(Burun ucunu sarar)*
6. **Siyah Deri Eyestay:** `roundRect(-1.5, 0.0, 3.0, 2.4, 0.3)` *(Vamp üzerine biner)*
7. **Saf Beyaz Bağcıklar (4 Sıra Ladder Laces):** `fillRect(-1.1, ly, 2.2, 0.3)` *(Eyestay üzerine çizilir, %100 net görünür!)*
8. **Gövde / Taban Ayrım Çizgisi:** `fillRect(sX - 0.2, 4.3, frontW + 0.4, 0.25)` *(0.25px derinlik kontrastı)*
9. **Beyaz Kauçuk Taban (Midsole - 1.8px):** `roundRect(sX - 0.3, 4.4, frontW + 0.6, 1.8, ...)`
10. **Siyah Dış Taban Lastiği (Outsole - 0.6px):** `roundRect(sX - 0.2, 6.2, frontW + 0.4, 0.6, ...)`

### B) Profil Görünümü Çizim Sırası (`isProfile`):
1. **Boğaz (Black Padded Collar):** `roundRect(sX + 1.2, -0.6, 5.6, 1.3, ...)`
2. **Dil & Nike Air Etiketi:** `roundRect(sX + 3.8, -1.0, 2.2, 1.5, 0.4)`
3. **Kırmızı Bileklik Kanadı & Wings Amblemi:** `roundRect(sX + 0.8, -0.2, 6.0, 1.8, ...)`
4. **Burun Üstü Paneli (Toe Box Vamp):** `roundRect(sX + sW - 3.8, 0.5, 3.0, 1.5, ...)`
5. **Burun Çamurluğu (Mudguard Wrap):** `roundRect(sX + sW - 3.8, 1.4, 3.8, 2.5, ...)`
6. **Kırmızı Topuk Kalkanı (Heel Counter):** `roundRect(sX, 0.4, 3.4, 3.5, ...)`
7. **Yan Beyaz Panel (Quarter Panel):** `fillRect(sX + 3.4, 0.4, sW - 7.2, 3.5)`
8. **Kırmızı Eyestay & Çapraz Bağcıklar:** `roundRect(sX + 3.8, 0.3, 1.8, 2.3, ...)`
9. **Siyah Nike Swoosh:** `moveTo(sX + 1.8, 1.5) -> quadraticCurveTo(...) -> closePath()` *(Quarter panel ve topuk üzerinde parlar, çamurluk altına girmez!)*
10. **Gövde / Taban Ayrım Çizgisi:** `fillRect(sX - 0.2, 3.8, sW + 0.3, 0.25)`
11. **Beyaz Taban (Midsole - 1.7px):** Toe spring kavisli çizim.
12. **Siyah Dış Taban (Outsole - 0.6px):** Lugged zemin lastiği.

---

## 4. Renk Paleti ve Kontrast Standartları

| Malzeme / Bölge | Ana Renk Kodu | Gölge / Dikiş / Ayrım Kodu | Işık / Vurgu (Specular) |
| :--- | :---: | :---: | :---: |
| **Kırmızı Deri (Chicago Red)** | `#dc2626` | `#991b1b` / `rgba(0,0,0,0.22)` | `rgba(255,255,255,0.20)` |
| **Beyaz Deri (Quarter & Vamp)**| `#f8fafc` / `#ffffff` | `#cbd5e1` (Perforasyon delikleri) | `#ffffff` |
| **Siyah Detaylar (Eyestay, Swoosh, Yaka)** | `#09090b` | `#000000` | `#334155` (Delik kenarı) |
| **Beyaz Kauçuk Taban (Midsole)** | `#ffffff` | `rgba(0,0,0,0.35)` (Üst ayrım çizgisi) | `#d4d4d8` (Dikiş izi) |
| **Siyah Dış Taban (Outsole)** | `#09090b` | `#000000` | `rgba(255,255,255,0.15)` (Dişler) |
| **Bağcıklar (Laces)** | `#ffffff` (Saf Beyaz) | Siyah eyestay arkası | Parlak kontrast |

---

## 5. Yeni Ayakkabı Tasarımları İçin Şablonlar

Yeni bir ayakkabı tasarlanırken bu oranlar baz alınarak aşağıdaki modifikasyonlar yapılır:

### Şablon 1: Düşük Bilekli Skater Sneaker (Dunk Low / Vans / Air Force 1 Low)
- **Boğaz ve Bilek Kanadı (`y: -0.6 -> 0.0`):** Kaldırılır veya `y: 0.0 -> 0.6` arasına minik bilek oyuğu olarak çizilir.
- **Topuk Kalkanı:** Yüksekliği `3.5px` yerine `2.4px` olarak tutulur (`y: 1.5 -> 3.9`).
- **Gövde & Taban:** Profilde `sW: 12.0px`, önde `frontW: 7.4px`, taban `soleH: 1.7px` aynen korunur.

### Şablon 2: Gotik Platform / Askeri Yüksek Bot (Combat Boots)
- **Topuk ve Burun:** Tek parça siyah deri (`#18181b` ve `#09090b`).
- **Taban:** Dişli taban (lugged tread) çentikleri `0.8px` derinliğe çıkarılır, taban rengi koyu gri veya siyah yapılır.
- **Metal Kuşgözü (Eyelets):** Bağcık delikleri `#e2e8f0` metalik gümüş rengiyle vurgulanır.

### Şablon 3: Koşu & Spor Ayakkabısı (Air Max / Runner)
- **Taban Topuk Yastığı:** Topuk altındaki taban kısmına `rgba(56, 189, 248, 0.4)` mavi hava kapsülü (Air bubble) penceresi açılır.
- **File Kumaş (Mesh Vamp):** Burun üstü paneline çapraz mikro ızgara çizgileri (`rgba(0,0,0,0.15)`) eklenir.

---

## 6. Örnek Referans Çizim Kodu (`k2Limbs.js`)

```javascript
// Örnek: Modern Streetwear Yüksek Sneaker (Air Jordan 1)
const accentCol = highSneakerAccent || '#dc2626';
const whiteCol = '#ffffff';
const blackCol = '#09090b';

if (isProfile) {
    const sX = -3.8, sW = 12.0, soleH = 1.7;

    // 1. Yaka & Dil
    ctx.fillStyle = blackCol;
    ctx.roundRect(sX + 1.2, -0.6, 5.6, 1.3, [0.6, 0.6, 0.2, 0.2]); ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.roundRect(sX + 3.8, -1.0, 2.2, 1.5, 0.4); ctx.fill();

    // 2. Burun Vamp & Kırmızı Çamurluk
    ctx.fillStyle = '#f8fafc';
    ctx.roundRect(sX + sW - 3.8, 0.5, 3.0, 1.5, [0.8, 0.8, 0, 0]); ctx.fill();
    ctx.fillStyle = accentCol;
    ctx.roundRect(sX + sW - 3.8, 1.4, 3.8, 2.5, [0.8, 1.2, 0.4, 0.3]); ctx.fill();

    // 3. Topuk Kalkanı & Quarter Panel
    ctx.fillStyle = accentCol;
    ctx.roundRect(sX, 0.4, 3.4, 3.5, [0.8, 0.2, 0.2, 0.4]); ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(sX + 3.4, 0.4, sW - 7.2, 3.5);

    // 4. Eyestay & Siyah Bağcıklar
    ctx.fillStyle = accentCol;
    ctx.roundRect(sX + 3.8, 0.3, 1.8, 2.3, 0.3); ctx.fill();
    ctx.fillStyle = blackCol;
    for (let ly = 0.5; ly <= 2.2; ly += 0.6) {
        ctx.fillRect(sX + 4.0, ly, 1.4, 0.4);
    }

    // 5. Keskin Siyah Swoosh
    ctx.fillStyle = blackCol;
    ctx.beginPath();
    ctx.moveTo(sX + 1.8, 1.5);
    ctx.quadraticCurveTo(sX + 4.4, 3.3, sX + sW - 4.0, 1.4);
    ctx.lineTo(sX + sW - 3.8, 2.0);
    ctx.quadraticCurveTo(sX + 4.6, 3.9, sX + 1.8, 2.2);
    ctx.closePath(); ctx.fill();

    // 6. Taban Ayrım Çizgisi, Midsole & Outsole
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.fillRect(sX - 0.2, 3.8, sW + 0.3, 0.25);
    ctx.fillStyle = whiteCol;
    ctx.beginPath();
    ctx.moveTo(sX - 0.2, 3.9); ctx.lineTo(sX + sW - 3.2, 3.9);
    ctx.quadraticCurveTo(sX + sW, 3.6, sX + sW + 0.1, 3.2);
    ctx.lineTo(sX + sW + 0.1, 3.9 + soleH);
    ctx.quadraticCurveTo(sX + sW - 1.2, 3.9 + soleH + 0.6, sX + sW - 3.2, 3.9 + soleH + 0.6);
    ctx.lineTo(sX - 0.2, 3.9 + soleH + 0.6); ctx.fill();
    ctx.fillStyle = blackCol;
    ctx.fillRect(sX, 3.9 + soleH + 0.1, sW, 0.6);
}
```

---

## 7. Kontrol Listesi (Yeni Ayakkabı Eklerken)

- [ ] Ayakkabı tabanı (midsole) dikey yüksekliğin **%35'inden az** mı?
- [ ] Ön görünüm eni **7.4px** sınırına sadık kalıyor mu?
- [ ] Bacak boyu (`legLen: 12.0px`) ve pantolon paçası korunuyor mu?
- [ ] Ön görünümde burun üstü ve çamurluk, **bağcıkların ve eyestay'in arkasında** mı çiziliyor?
- [ ] Profilde Swoosh veya logo, gövde panelinin üstünde parlayıp **çamurluk altında ezilmiyor** mu?
- [ ] Gövde ile beyaz taban arasında **0.25px derinlikli kontrast ayrım çizgisi** var mı?
- [ ] 4 ana açı (`down`, `down-right`, `right`, `up`) birbirleriyle 360 derece senkronize mi?

---

## 8. Örnek Model 2: New Balance 990 / 574 Retro Koşu Ayakkabısı (`shoes_k2_nb_runner`)

- **Karakter:** Düşük bilekli, katmanlı süet + nefes alan file (mesh), ikonik reflektif yan "N" amblemi, TPU topuk dengeleyici çerçeve (heel clip) ve çift tonlu ENCAP koşu tabanı.
- **Renk Seçenekleri:**
  - `original` / `grey`: New Balance Miras Grisi (`#64748b` süet, `#cbd5e1` file panel)
  - `navy`: Klasik Gece Mavisi (`#1e3a8a`)
  - `green`: Orman Yeşili (`#166534`)
  - `black`: Mat Siyah (`#18181b`)
- **İmza Detayları:**
  1. **İkonik 3M "N" Amblemi:** Beyaz 3M reflektör kontur üzerine kontrast dolgu ile karakterize edilir; çapraz açıda perspektif eğim alır.
  2. **TPU Topuk Klipsi:** Topuk arkasında stabilite sağlayan açık gri (`#94a3b8`) aerodinamik destek çerçevesi.
  3. **ENCAP İki Tonlu Taban:** Ön kısımda beyaz EVA yastıklama (`#ffffff`), arka topuk altında kemik/gri stabilite takozu (`#e2e8f0`) ve siyah kauçuk dış taban tırtıkları.
  4. **Ön Burun Tamponu:** Koşu ayakkabısı karakteristiği olarak dış kauçuk taban ucunun burun derisinin üzerine hafifçe kıvrılması.


