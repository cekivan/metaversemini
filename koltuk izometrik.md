# 🛋️ Sanalika Tarzı 2:1 İzometrik Pofuduk Koltuk Tasarım ve Yapım Kılavuzu

Bu doküman, Metaverse Mini VIP Club'da kullanılan Sanalika tarzı 2:1 gerçek izometrik (dimetric) pofuduk deri koltuk grubunun tüm matematiksel modellemesini, HTML5 Canvas 2D çizim mimarisini, katman sırasını, yönlendirme (mirroring) tekniklerini ve karakter oturma entegrasyonunu detaylandırmaktadır.

---

## 📐 1. İzometrik Mimari ve Tasarım Prensipleri

Sanalika ve klasik Flash tabanlı 2.5D izometrik sanal dünyalarda derinlik hissi **2:1 Dimetrik Projeksiyon** (her 2 yatay piksel için 1 dikey piksel, yaklaşık $26.56^\circ$) ile sağlanır.

### Temel Özellikler
1. **Pofuduk Bézier Hatları (Bézier Fillet / Bevel):** Koltuk köşeleri ve minder kenarları sert düz çizgiler yerine `quadraticCurveTo` ve dışa doğru bombeli kavislerle çizilir.
2. **Deri Işık Gradyanları (Linear Gradients):** Üst yüzeylerde açık bej-krem tonlar, yan ve ön yüzeylerde orta ton kahverengi-bej, gölgede kalan alanlarda koyu deri tonları kullanılır.
3. **Dikiş Fitili ve Işık Hattı (Piping):** Sırtlık, kolçaklar ve minderlerin etrafına 1px ince krem (`rgba(255, 245, 235, 0.75)`) deri dikiş fitili çekilerek hacim vurgulanır.
4. **Ambient Occlusion (Yarık Gölgeleri):** İki minder arasına, sırtlık altına ve kolçak içlerine koyu kahve temas yarıkları (`rgba(50, 30, 15, 0.55)`) eklenerek mobilya tek parça bütünsel bir görünüm kazanır.
5. **Krom Ray Ayaklar:** Metalik parlak çelik ayaklar ve zemine oturan yumuşak eliptik gölge.
6. **Kırlentler (Yastıklar):** Biri yeşil kadife kare, diğeri ortasında dikiş düğmesi bulunan silindirik bordo kırlent.

---

## 🎨 2. Renk Paleti

```javascript
const C_LIGHT_TOP = "#ebd6be";             // Üst yüzey açık krem deri
const C_LIGHT_BOT = "#dcbf9f";             // Üst yüzey ışık geçiş tonu
const C_MID_TOP   = "#cca782";             // Ön/yan yüzey orta ton
const C_MID_BOT   = "#af8763";             // Ön/yan yüzey alt ton
const C_DARK_SIDE = "#956f4d";             // Derin gölge / iç yanak tonu
const C_CREVICE   = "rgba(50, 30, 15, 0.55)"; // Ambient occlusion yarık gölgesi
const C_PIPING    = "rgba(255, 245, 235, 0.75)"; // 1px dikiş fitil ışığı
```

---

## 🪜 3. Çizim Katmanları (Rendering Pipeline & Z-Index)

Koltuk, arka plandan ön plana doğru 8 ayrı katman halinde çizilir:

```
[Katman 1] Zemin Temas Gölgesi (Soft Elliptic Drop Shadow)
    └── [Katman 2] Krom Kızak Ray Ayaklar & Pimler (Metalik Çift Ray)
        └── [Katman 3] Uzak / Arka Kolçak (Far Armrest)
            └── [Katman 4] Arka Sırtlık & Dikiş Fitili (Backrest & Piping)
                └── [Katman 5] Kırlentler (Yeşil Kadife & Bordo Düğmeli Kırlent)
                    └── [Katman 6] Pofuduk Oturma Minderleri (İç & Dış Minderler)
                        └── [Katman 7] Koltuk Ön Alt Eteği (Front Skirt)
                            └── [Katman 8] Yakın / Ön Kolçak (Near Armrest)
```

---

## 🔄 4. Çift Yön Oryantasyonu ve Karşılıklı V-Lounge Düzeni

Tek bir `drawIsoSofaRight(ctx, ox, oy)` çekirdek fonksiyonu ile her iki yöne bakan koltuklar kusursuz simetriyle üretilir:

| Koltuk | Konum (`ox, oy`) | Ölçekleme (`ctx.scale`) | Baktığı Yön | Oturan Karakter Yönü |
| :--- | :--- | :--- | :--- | :--- |
| **Soldaki Koltuk** | `(150, 385)` | `scale(-1.18, 1.18)` | **Sağ-Alta (`down-right`)** | `down-right` |
| **Sağdaki Koltuk** | `(200, 425)` | `scale(1.18, 1.18)` | **Sol-Alta (`down-left`)** | `down-left` |
| **Orta Cam Sehpa** | `(175, 465)` | `scale(1.18, 1.18)` | Merkez | - |

- **Soldaki Koltuk:** `ctx.scale(-scale, scale)` ile yatayda aynalanarak ön eteği ve minderleri **Sağ-Alta (İçe/Sehpaya)** bakar.
- **Sağdaki Koltuk:** `ctx.scale(scale, scale)` ile ön eteği ve minderleri **Sol-Alta (İçe/Sehpaya)** bakar.
- Her iki koltuk da birbirine ve ortadaki sehpaya dönük samimi bir VIP V-Lounge takımını oluşturur.

---

## 💺 5. Koltuk Minder Merkezleri & Oturma Entegrasyonu (`seatRegistry.js`)

Karakterlerin minder üzerinde kenara kaymadan tam ortalı oturması için hesaplanan dünya koordinatları:

```javascript
// public/js/seatRegistry.js
vip_club: [
    // 1. Koltuk (Soldaki - Yüzü Sağ-Alta / down-right)
    { x: 123, y: 407, facing: 'down-right', label: 'İzo Sanalika Bej Sol (İç)' },
    { x: 97,  y: 420, facing: 'down-right', label: 'İzo Sanalika Bej Sol (Dış)' },

    // 2. Koltuk (Sağdaki - Yüzü Sol-Alta / down-left)
    { x: 227, y: 447, facing: 'down-left',  label: 'İzo Sanalika Bej Sağ (İç)' },
    { x: 253, y: 460, facing: 'down-left',  label: 'İzo Sanalika Bej Sağ (Dış)' }
]
```

---

## 🛑 6. Fiziksel Çarpışma Sınırları (`checkVipClubCollision`)

Oyuncuların koltukların arkasından geçerken sırtlığa takılması ve koltukların önüne gelip rahatça oturabilmesi için uygulanan hitbox sınırları:

```javascript
// public/js/renderers/renderVipClub.js
// Sol Koltuk Arkalığı (ox: 150, oy: 385, scale: -1.18):
if (x >= 65 && x <= 138 && y >= 375 && y <= 398) return true;

// Sağ Koltuk Arkalığı (ox: 200, oy: 425, scale: 1.18):
if (x >= 212 && x <= 285 && y >= 415 && y <= 438) return true;

// Orta Küçük Sehpa (cx: 175, cy: 465):
if (x >= 160 && x <= 190 && y >= 455 && y <= 476) return true;
```

---

## 💻 7. Eksiksiz Canvas 2D Kaynak Kodu

Aşağıdaki kod parçası [renderVipClub.js](file:///c:/Users/WIN11/Desktop/metaversemini/public/js/renderers/renderVipClub.js) içindeki gerçek üretim kodudur:

```javascript
/**
 * 2:1 Gerçek Sanalika İzometrik Lounge Takımı (Sol Alt Köşe)
 */
function drawIsometricSanalikaLounge(bctx) {
    bctx.save();
    const scale = 1.18;

    // 1. SOL İZOMETRİK KANEPE (Yüzü SAĞ-ALTA / down-right Bakan)
    bctx.save();
    bctx.translate(150, 385);
    bctx.scale(-scale, scale);
    drawIsoSofaRight(bctx, 0, 0);
    bctx.restore();

    // 2. SAĞ İZOMETRİK KANEPE (Yüzü SOL-ALTA / down-left Bakan)
    bctx.save();
    bctx.translate(200, 425);
    bctx.scale(scale, scale);
    drawIsoSofaRight(bctx, 0, 0);
    bctx.restore();

    // 3. ORTA KAHVE SEHPASI (İki koltuğun ortasında orantılı büyütülmüş)
    drawIsoCoffeeTable(bctx, 175, 465, scale);

    bctx.restore();
}

/**
 * Pofuduk İzometrik Koltuk Çekirdek Çizici
 */
function drawIsoSofaRight(ctx, ox, oy) {
    ctx.save();

    // 1. Yumuşak Zemin Temas Gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(ox + 42, oy + 32, 48, 18, 0.44, 0, Math.PI * 2);
    ctx.fill();

    // 2. Krom Kızak Ayaklar (Metalik Çift Ray)
    let chromeGrad = ctx.createLinearGradient(ox, oy + 26, ox, oy + 50);
    chromeGrad.addColorStop(0, "#f8fafc");
    chromeGrad.addColorStop(0.5, "#cbd5e1");
    chromeGrad.addColorStop(1, "#475569");

    ctx.strokeStyle = chromeGrad;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";

    // Ön ray
    ctx.beginPath();
    ctx.moveTo(ox + 6, oy + 32);
    ctx.lineTo(ox + 46, oy + 52);
    ctx.stroke();

    // Arka ray
    ctx.beginPath();
    ctx.moveTo(ox + 38, oy + 14);
    ctx.lineTo(ox + 72, oy + 31);
    ctx.stroke();

    // Ayak bağlantı pimleri
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(ox + 9, oy + 29); ctx.lineTo(ox + 9, oy + 34);
    ctx.moveTo(ox + 43, oy + 46); ctx.lineTo(ox + 43, oy + 51);
    ctx.moveTo(ox + 41, oy + 12); ctx.lineTo(ox + 41, oy + 16);
    ctx.moveTo(ox + 69, oy + 25); ctx.lineTo(ox + 69, oy + 29);
    ctx.stroke();

    // Renk Paleti (Sanalika Sıcak Deri Tonları)
    const C_LIGHT_TOP = "#ebd6be";
    const C_LIGHT_BOT = "#dcbf9f";
    const C_MID_TOP   = "#cca782";
    const C_MID_BOT   = "#af8763";
    const C_DARK_SIDE = "#956f4d";
    const C_CREVICE   = "rgba(50, 30, 15, 0.55)";
    const C_PIPING    = "rgba(255, 245, 235, 0.75)";

    // 3. Sol Arka Kolçak (Uzak Kolçak)
    ctx.fillStyle = C_DARK_SIDE;
    ctx.beginPath();
    ctx.moveTo(ox + 14, oy + 2);
    ctx.lineTo(ox + 25, oy - 3.5);
    ctx.lineTo(ox + 25, oy + 8);
    ctx.lineTo(ox + 14, oy + 14);
    ctx.closePath();
    ctx.fill();

    // Sol kolçak üst yüzeyi (Kavisli pah)
    let armTopGrad = ctx.createLinearGradient(ox + 14, oy + 2, ox + 35, oy + 2);
    armTopGrad.addColorStop(0, C_LIGHT_TOP);
    armTopGrad.addColorStop(1, C_LIGHT_BOT);
    ctx.fillStyle = armTopGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 14, oy + 2);
    ctx.quadraticCurveTo(ox + 19, oy - 2, ox + 25, oy - 3.5);
    ctx.lineTo(ox + 35, oy + 1.5);
    ctx.quadraticCurveTo(ox + 30, oy + 5, ox + 24, oy + 7);
    ctx.closePath();
    ctx.fill();

    // Sol kolçak ön yüzeyi
    let armFrontGrad = ctx.createLinearGradient(ox + 24, oy + 7, ox + 35, oy + 14);
    armFrontGrad.addColorStop(0, C_MID_TOP);
    armFrontGrad.addColorStop(1, C_MID_BOT);
    ctx.fillStyle = armFrontGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 24, oy + 7);
    ctx.lineTo(ox + 35, oy + 1.5);
    ctx.lineTo(ox + 35, oy + 14);
    ctx.quadraticCurveTo(ox + 30, oy + 18, ox + 24, oy + 19);
    ctx.closePath();
    ctx.fill();

    // 4. Arka Sırtlık (Gövdeye Yaslı Dolgun Sırt)
    let backTopGrad = ctx.createLinearGradient(ox + 25, oy - 4, ox + 65, oy + 16);
    backTopGrad.addColorStop(0, "#f3e3ce");
    backTopGrad.addColorStop(1, "#dfcaa8");
    ctx.fillStyle = backTopGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 25, oy - 3.5);
    ctx.lineTo(ox + 65, oy + 16.5);
    ctx.quadraticCurveTo(ox + 62, oy + 19, ox + 58, oy + 20.5);
    ctx.lineTo(ox + 18, oy + 0.5);
    ctx.quadraticCurveTo(ox + 21, oy - 2, ox + 25, oy - 3.5);
    ctx.closePath();
    ctx.fill();

    // Sırtlık üst kenar dikiş fitili
    ctx.strokeStyle = C_PIPING;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(ox + 25, oy - 3.5);
    ctx.lineTo(ox + 65, oy + 16.5);
    ctx.stroke();

    // Sırt ön yüzeyi (Deri Yanak)
    let backFrontGrad = ctx.createLinearGradient(ox + 18, oy + 1, ox + 58, oy + 21);
    backFrontGrad.addColorStop(0, C_MID_TOP);
    backFrontGrad.addColorStop(1, C_MID_BOT);
    ctx.fillStyle = backFrontGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 18, oy + 0.5);
    ctx.lineTo(ox + 58, oy + 20.5);
    ctx.lineTo(ox + 58, oy + 30);
    ctx.lineTo(ox + 18, oy + 10);
    ctx.closePath();
    ctx.fill();

    // Sırtlık ortası dikey dikiş yarığı
    ctx.strokeStyle = C_CREVICE;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(ox + 38, oy + 10.5);
    ctx.lineTo(ox + 38, oy + 25);
    ctx.stroke();

    // 5. Kırlentler (Yeşil Kadife Kare & Bordo Silindirik)
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(ox + 32, oy + 17, 7, 3, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Yeşil Kırlent
    let greenGrad = ctx.createLinearGradient(ox + 23, oy + 2, ox + 35, oy + 18);
    greenGrad.addColorStop(0, "#22c55e");
    greenGrad.addColorStop(0.5, "#15803d");
    greenGrad.addColorStop(1, "#14532d");
    ctx.fillStyle = greenGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 25, oy + 4);
    ctx.quadraticCurveTo(ox + 30, oy + 2, ox + 35, oy + 4.5);
    ctx.quadraticCurveTo(ox + 38, oy + 10, ox + 36, oy + 17);
    ctx.quadraticCurveTo(ox + 30, oy + 19, ox + 25, oy + 17);
    ctx.quadraticCurveTo(ox + 23, oy + 11, ox + 25, oy + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#166534";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Bordo Silindirik Kırlent
    let redGrad = ctx.createLinearGradient(ox + 30, oy + 8, ox + 42, oy + 22);
    redGrad.addColorStop(0, "#e11d48");
    redGrad.addColorStop(0.5, "#9f1239");
    redGrad.addColorStop(1, "#4c0519");
    ctx.fillStyle = redGrad;
    ctx.beginPath();
    ctx.ellipse(ox + 36, oy + 14, 5.5, 6.5, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#881337";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // Kumaş dikiş düğmesi
    ctx.fillStyle = "#ffe4e6";
    ctx.beginPath();
    ctx.arc(ox + 36, oy + 14, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Sırtlık altı temas gölgesi (Ambient Occlusion)
    ctx.strokeStyle = C_CREVICE;
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(ox + 17, oy + 10);
    ctx.lineTo(ox + 58, oy + 30.5);
    ctx.stroke();

    // 6. Oturma Minderleri (Pofuduk Bombe & Dikiş Fitilli)
    // Sol Minder
    drawPlumpIsoCushion(ctx, ox + 13, oy + 9, ox + 34, oy + 19.5, ox + 23, oy + 25.5, ox + 2, oy + 15, C_LIGHT_TOP, C_LIGHT_BOT, C_MID_TOP, C_MID_BOT, C_PIPING, C_CREVICE);

    // Sağ Minder
    drawPlumpIsoCushion(ctx, ox + 35, oy + 20, ox + 56, oy + 30.5, ox + 45, oy + 36.5, ox + 24, oy + 26, C_LIGHT_TOP, C_LIGHT_BOT, C_MID_TOP, C_MID_BOT, C_PIPING, C_CREVICE);

    // İki minder arası derin dikiş yarığı
    ctx.strokeStyle = C_CREVICE;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(ox + 34.5, oy + 20);
    ctx.lineTo(ox + 23.5, oy + 32.5);
    ctx.stroke();

    // Koltuk Ön Alt Eteği
    let skirtGrad = ctx.createLinearGradient(ox + 2, oy + 23, ox + 44, oy + 44);
    skirtGrad.addColorStop(0, C_MID_BOT);
    skirtGrad.addColorStop(1, "#835f3e");
    ctx.fillStyle = skirtGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 2, oy + 22.5);
    ctx.lineTo(ox + 44, oy + 43.5);
    ctx.lineTo(ox + 44, oy + 48);
    ctx.lineTo(ox + 2, oy + 27);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 7. Sağ Ön Kolçak (Bize Yakın Kolçak - Dolgun & Kavisli)
    ctx.fillStyle = C_DARK_SIDE;
    ctx.beginPath();
    ctx.moveTo(ox + 44, oy + 30);
    ctx.lineTo(ox + 55, oy + 24.5);
    ctx.lineTo(ox + 55, oy + 43.5);
    ctx.lineTo(ox + 44, oy + 49);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = C_CREVICE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ox + 44, oy + 30);
    ctx.lineTo(ox + 44, oy + 49);
    ctx.stroke();

    let nearArmTopGrad = ctx.createLinearGradient(ox + 44, oy + 30, ox + 66, oy + 30);
    nearArmTopGrad.addColorStop(0, "#f5e6d3");
    nearArmTopGrad.addColorStop(1, "#dfcaa8");
    ctx.fillStyle = nearArmTopGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 44, oy + 30);
    ctx.quadraticCurveTo(ox + 49, oy + 26, ox + 55, oy + 24.5);
    ctx.quadraticCurveTo(ox + 61, oy + 27, ox + 66, oy + 30);
    ctx.quadraticCurveTo(ox + 60, oy + 34, ox + 55, oy + 36);
    ctx.quadraticCurveTo(ox + 49, oy + 33, ox + 44, oy + 30);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = C_PIPING;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(ox + 44, oy + 30);
    ctx.quadraticCurveTo(ox + 49, oy + 26, ox + 55, oy + 24.5);
    ctx.quadraticCurveTo(ox + 61, oy + 27, ox + 66, oy + 30);
    ctx.stroke();

    let nearArmFrontGrad = ctx.createLinearGradient(ox + 55, oy + 36, ox + 66, oy + 45);
    nearArmFrontGrad.addColorStop(0, C_MID_TOP);
    nearArmFrontGrad.addColorStop(1, C_MID_BOT);
    ctx.fillStyle = nearArmFrontGrad;
    ctx.beginPath();
    ctx.moveTo(ox + 55, oy + 36);
    ctx.lineTo(ox + 66, oy + 30);
    ctx.lineTo(ox + 66, oy + 44.5);
    ctx.quadraticCurveTo(ox + 61, oy + 48, ox + 55, oy + 50.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
}

/**
 * Pofuduk Koltuk Minderi Çizici (Bombe & Dikiş Fitilli)
 */
function drawPlumpIsoCushion(ctx, x1, y1, x2, y2, x3, y3, x4, y4, cTop1, cTop2, cFront1, cFront2, cPiping, cCrevice) {
    let topGrad = ctx.createLinearGradient(x4, y4, x2, y2);
    topGrad.addColorStop(0, cTop1);
    topGrad.addColorStop(1, cTop2);
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2)/2, (y1 + y2)/2 - 1.5, x2, y2);
    ctx.quadraticCurveTo((x2 + x3)/2 + 1, (y2 + y3)/2, x3, y3);
    ctx.quadraticCurveTo((x3 + x4)/2, (y3 + y4)/2 + 1.5, x4, y4);
    ctx.quadraticCurveTo((x4 + x1)/2 - 1, (y4 + y1)/2, x1, y1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = cPiping;
    ctx.lineWidth = 0.9;
    ctx.stroke();

    let frontGrad = ctx.createLinearGradient(x4, y4, x3, y3 + 7);
    frontGrad.addColorStop(0, cFront1);
    frontGrad.addColorStop(1, cFront2);
    ctx.fillStyle = frontGrad;
    ctx.beginPath();
    ctx.moveTo(x4, y4);
    ctx.quadraticCurveTo((x4 + x3)/2, (y4 + y3)/2 + 1.2, x3, y3);
    ctx.lineTo(x3, y3 + 6.5);
    ctx.quadraticCurveTo((x3 + x4)/2, (y3 + y4)/2 + 7.5, x4, y4 + 6.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 0.7;
    ctx.stroke();

    ctx.strokeStyle = cCrevice;
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(x4, y4 + 6.5);
    ctx.lineTo(x3, y3 + 6.5);
    ctx.stroke();
}

/**
 * İzometrik Kompakt Cam & Krom Sehpa
 */
function drawIsoCoffeeTable(ctx, cx, cy, scale = 1.0) {
    ctx.save();
    ctx.translate(cx, cy);
    if (scale !== 1.0) ctx.scale(scale, scale);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(0, 10, 20, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cam Üst Yüzey (İzometrik Eşkenar Dörtgen)
    ctx.fillStyle = "rgba(56, 189, 248, 0.35)";
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(18, 1);
    ctx.lineTo(0, 10);
    ctx.lineTo(-18, 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Krom Ayak
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.lineTo(0, 16);
    ctx.stroke();
    ctx.restore();
}
```

