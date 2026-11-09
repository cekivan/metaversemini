

### 🏅 30. Sol Üst HUD Seviye Göstergesi, Dinamik XP İlerleme Barı, Kutlama Popup'ı ve Rozet Vitrini
- **Kullanıcı Talebi:**
  - *"Projeye sol üst HUD seviye göstergesini, dinamik XP ilerleme barını, anlık float (+XP) animasyonunu ve seviye atlandığında para/elmas ödüllerini gösteren kutlama popup'ını entegre et. ... geri kalan kısımları hallet."*
- **Mimari ve Kod Değişiklikleri:**
  1. **Sol Üst HUD Göstergesi (`public/css/hudLevel.css` & `public/index.html`):**
     - `#hudLevelContainer`: Sol üstte sabit (`position: fixed; top: 16px; left: 16px; z-index: 1000`), dairesel altın seviye rozeti (`LV X`), unvanı (`Çaylak`, `Kıdemli Müdavim`, `Duayen` vb.), sayısal XP metni (`X / Target XP`) ve neon yeşil dolum barını barındırır.
     - Masaüstü görünümünde (`@media (min-width: 1024px)`) `.top-nav` için `margin-left: max(242px, calc(50vw - 490px))` kuralı tanımlanarak üst menü öğeleriyle sıfır çakışma (zero overlap) sağlandı.
     - Tıklandığında oyuncunun profil kartını doğrudan açar.
  2. **Anlık Float (+XP) Animasyonu (`.hud-xp-float-item`):**
     - Her XP kazanımında HUD'ın altından yeşil ışıltılı `+X XP` etiketi fırlar ve 1.3 saniye içinde yukarı süzülerek kaybolur.
  3. **Seviye Atlama Kutlama Popup'ı (`#levelUpOverlay`):**
     - Seviye atlandığında tüm ekranı koyu buzlu camla kaplar.
     - Ortada nefes alan altın aura, büyük seviye numarası, kazanılan nakit (+2.000 TL) ve elmas (+2 Elmas) kartları ile "HARİKA, DEVAM ET" onay butonu yer alır.
  4. **Retro Web Audio Fanfarı (`public/js/audio.js`):**
     - Harici ses dosyası gerektirmeden Web Audio API osilatörleri ile polifonik retro RPG zafer melodisi (`playSound('levelUp')`) çalınır.
  5. **Profil Rozet Vitrini & Rekürsiyon Düzeltmesi (`public/js/social.js`):**
     - `social.js` içerisindeki `calculateUniversalBadgeTier` fonksiyonundaki özyinelemeli `Maximum call stack size exceeded` çökmesi giderildi.
     - Kendi profilinde 5 ana rozetin (`Masa Kurdu`, `Botanik`, `Balıkçılık`, `Madencilik`, `Metaverse Sakini`) 0 seviyede olsa dahi ilerleme barı ve hedefleriyle listelenmesi sağlandı.
     - Oyuncu adının yanına `LV X` seviye rozeti eklendi.
     - Tooltip'lerde "✓ Rozet Kazanıldı" yazısı olmadan `İlerleme: X / Target (%Y)` kuralı korundu.
- **Doğrulama & Görsel Kanıtlar:**
  - `verified_hud_level_bar.png`: Sol üst HUD barı, seviye göstergesi, yeşil dolum ve +5 XP uçan bildirimi.
  - `verified_level_up_modal.png`: Seviye 2 kutlama modalı, +2.000 TL ve +2 Elmas ödülleri.
  - `verified_profile_badges_showcase.png`: Profil modalında LV 1 rozeti ve 5 ana rozetin vitrin görünümü.
  - `verified_profile_badge_tooltip.png`: Temiz rozet ilerleme barı ve unvan açıklaması.

