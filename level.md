# 🌟 MINİ METAVERSE: SEVİYE & ROZET XP SİSTEMİ DOKÜMANTASYONU (`level.md`)

Bu doküman, Mini Metaverse oyun motorundaki **Karakter Seviyesi (Level 1–100)** ile **Uzmanlık Rozetleri (Kademe 1–10)** sistemlerinin matematiksel formüllerini, XP kazanım kaynaklarını, kademe eşiklerini, unvanlarını, görsel efektlerini ve ödül mekanizmalarını tüm detaylarıyla açıklamaktadır.

---

## 📑 İÇİNDEKİLER
1. [Sistem Mimarisi ve Genel Bakış](#1-sistem-mimarisi-ve-genel-bakış)
2. [Karakter Seviye Sistemi (Level 1–100)](#2-karakter-seviye-sistemi-level-1100)
   - [Matematiksel XP Formülü](#matematiksel-xp-formülü)
   - [Seviye Basamakları ve Gereken XP Cetveli](#seviye-basamakları-ve-gereken-xp-cetveli)
   - [XP Kazanım Kaynakları ve Puan Tablosu](#xp-kazanım-kaynakları-ve-puan-tablosu)
   - [Seviye Atlama Ödülleri](#seviye-atlama-ödülleri)
   - [Seviye Unvanları ve Auratik Parlama Kademeleri](#seviye-unvanları-ve-auratik-parlama-kademeleri)
3. [Uzmanlık & Disiplin Rozetleri (Kademe 1–10)](#3-uzmanlık--disiplin-rozetleri-kademe-110)
   - [1. 🎮 Oyunbaz (Masa ve Mini Oyunlar)](#1--oyunbaz-masa-ve-mini-oyunlar)
   - [2. 🌿 Botanik Rozeti (Tarım & Hasat)](#2--botanik-rozeti-tarım--hasat)
   - [3. 🎣 Balıkçılık Rozeti (Deniz & Avcılık)](#3--balıkçılık-rozeti-deniz--avcılık)
   - [4. ⛏️ Madencilik Rozeti (Cevher & Kaya Kırma)](#4-️-madencilik-rozeti-cevher--kaya-kırma)
   - [5. ⭐ Metaverse Sakini (Profil 1. Yuva)](#5--metaverse-sakini-profil-1-yuva)
   - [Rozet Seviye Atlama Ödül Katlama Sistemi](#rozet-seviye-atlama-ödül-katlama-sistemi)
   - [Rozet Parlama Efektleri (Glow & Aura)](#rozet-parlama-efektleri-glow--aura)
4. [Profil Rozet Vitrini Gösterim Kuralları](#4-profil-rozet-vitrini-gösterim-kuralları)
5. [Ağ İletişimi (Socket Olayları) ve Veritabanı Şeması](#5-ağ-iletişimi-socket-olayları-ve-veritabanı-şeması)

---

## 1. Sistem Mimarisi ve Genel Bakış

Mini Metaverse bünyesinde iki adet bağımsız ancak birbiriyle entegre çalışan ilerleme motoru bulunur:

```
                                  [ OYUNCU AKTİVİTELERİ ]
                    ┌────────────────────────┼────────────────────────┐
                    ▼                        ▼                        ▼
           [ Tarım & Botanik ]      [ Maden & Balıkçılık ]      [ Masa Oyunları ]
                    │                        │                        │
        ┌───────────┴──────────┐  ┌──────────┴──────────┐  ┌──────────┴──────────┐
        ▼                      ▼  ▼                      ▼  ▼                      ▼
  Hasat Sayacı            Anlık XP  Kaya / Balık       Anlık XP  Oyun El Sayacı     Anlık XP
        │                      │         │               │         │               │
        ▼                      └─────────┼───────────────┼─────────┘               │
[ BOTANİK ROZETİ ]                       ▼               ▼                         ▼
   (Kademe 1-10)                 [ MADEN & BALIK ]   [ OYUNBAZ ]         [ KARAKTER SEVİYESİ ]
                                   (Kademe 1-10)    (Kademe 1-10)            (Level 1-100)
                                                                                   │
                                                                           ┌───────┴───────┐
                                                                           ▼               ▼
                                                                      Sol Üst HUD    Profil 1. Yuva
                                                                    (Yeşil Bar &   (Kocaman Sayı &
                                                                     Float +XP)     Canlı İlerleme)
```

1. **Karakter Seviyesi (Level 1–100):** 
   - Tüm oyun aktivitelerinden kazanılan kümülatif **XP (Deneyim Puanı)** ile beslenir.
   - Sol üstteki HUD arayüzünde yeşil ilerleme barı ve seviye kutucuğuyla temsil edilir.
   - Profil penceresinde **1. Yuvada** ortada yer alan **Kocaman Sayı** olarak gösterilir.
2. **Disiplin Rozetleri (Kademe 1–10):**
   - Her daldaki spesifik eylem sayısına (oynanan el, kırılan kaya, tutulan balık, toplanan hasat) bağlıdır.
   - Oyuncunun profiline **kazanılma sırasına göre** 12 yuvalı vitrinde dizilir.

---

## 2. Karakter Seviye Sistemi (Level 1–100)

### Matematiksel XP Formülü
Oyun motoru, seviyeler ilerledikçe artan üstel bir zorluk eğrisi kullanır (`src/utils/levelSystem.js`):

* **Delta XP Formülü (Bir Sonraki Seviyeye Geçiş İçin Gereken XP):**
  $$\text{DeltaXP}(n) = \begin{cases} 20, & n = 2 \text{ (Seviye 1 } \to \text{ 2)} \\ \lfloor 20 \times (n - 1)^{1.42} \rfloor, & 3 \le n \le 100 \end{cases}$$

* **Kümülatif Toplam XP (Seviye $L$'ye Ulaşmak İçin Sıfırdan Gereken Toplam XP):**
  $$\text{TotalXP}(L) = \sum_{n=2}^{L} \text{DeltaXP}(n) \quad (L \ge 2, \quad \text{TotalXP}(1) = 0)$$

> [!NOTE]
> Tüm oyuncular oyuna **Seviye 1** ve **0 XP** ile başlar. Seviye 1 başlangıç seviyesi olduğu için seviye atlama ödülü verilmez; yeni kayıt olan her oyuncu 1.000 TL başlangıç harçlığıyla başlar. Seviye atlama ödülleri **Seviye 2**'ye ulaşıldığında başlar (+2.000 TL ve +2 Elmas).
> 
> *(Önemli Kural: Seviye 1'de ödül verilmeme kuralı **yalnızca Karakter Seviyesi** için geçerlidir. 4 Uzmanlık Rozeti — Oyunbaz, Botanik, Balıkçılık, Madencilik — 1. seviyelerine ulaşıldığında +1.000 TL ve +5 Elmas ödülünü vermeye eksiksiz devam eder).*

---

### Seviye Basamakları ve Gereken XP Cetveli

Aşağıdaki tabloda Seviye 1'den 100'e kadar olan kilit basamaklar ve XP gereksinimleri yer almaktadır:

| Seviye (Level) | O Seviyeyi Geçmek İçin Gereken Delta XP | Sıfırdan Ulaşmak İçin Kümülatif Toplam XP | Unvan | Auratik Parlama Efekti |
| :---: | :---: | :---: | :---: | :---: |
| **Lv. 1** *(Başlangıç)* | 20 XP *(Lv. 2 için)* | 0 XP | Çaylak | *Yok* |
| **Lv. 2** | 53 XP | 20 XP | Çaylak | *Yok* |
| **Lv. 3** | 95 XP | 73 XP | Çaylak | *Yok* |
| **Lv. 4** | 143 XP | 168 XP | Çaylak | *Yok* |
| **Lv. 5** | 196 XP | 311 XP | Çaylak | *Yok* |
| **Lv. 6** | 254 XP | 507 XP | Çaylak | *Yok* |
| **Lv. 7** | 317 XP | 761 XP | Çaylak | *Yok* |
| **Lv. 8** | 383 XP | 1.078 XP | Çaylak | *Yok* |
| **Lv. 9** | 452 XP | 1.461 XP | Çaylak | *Yok* |
| **Lv. 10** | 525 XP | 1.913 XP | Çaylak | *Yok* |
| **Lv. 15** | 933 XP | 5.333 XP | Çaylak | *Yok* |
| **Lv. 16** | 1.023 XP | 6.266 XP | **Esnaf & Zanaatkar** | *Yok* |
| **Lv. 20** | 1.408 XP | 10.930 XP | Esnaf & Zanaatkar | 🥉 **Bronz Parlar** |
| **Lv. 25** | 1.932 XP | 18.995 XP | Esnaf & Zanaatkar | 🥉 Bronz Parlar |
| **Lv. 30** | 2.502 XP | 29.779 XP | Esnaf & Zanaatkar | 🥉 Bronz Parlar |
| **Lv. 36** | 3.242 XP | 46.541 XP | **Kıdemli Müdavim** | 🥉 Bronz Parlar |
| **Lv. 40** | 3.772 XP | 60.368 XP | Kıdemli Müdavim | 🥈 **Gümüş Parlar** |
| **Lv. 50** | 5.201 XP | 104.240 XP | Kıdemli Müdavim | 🥈 Gümüş Parlar |
| **Lv. 60** | 6.757 XP | 162.724 XP | Kıdemli Müdavim | 🥇 **Altın Parlar** |
| **Lv. 61** | 6.918 XP | 169.481 XP | **Şehir Hakimi** | 🥇 Altın Parlar |
| **Lv. 70** | 8.431 XP | 236.997 XP | Şehir Hakimi | 🥇 Altın Parlar |
| **Lv. 80** | 10.207 XP | 328.127 XP | Şehir Hakimi | 💎 **Elmas Parlar** |
| **Lv. 86** | 11.326 XP | 391.439 XP | **Duayen** | 💎 Elmas Parlar |
| **Lv. 90** | 12.083 XP | 437.095 XP | Duayen | 💎 Elmas Parlar |
| **Lv. 100** | *Maksimum* | 564.810 XP | **Yaşayan Efsane** | 🖤 **Siyah Parlar (Max)** |

---

### XP Kazanım Kaynakları ve Puan Tablosu

Oyuncular Mini Metaverse içerisindeki farklı meslek ve aktivitelerden aşağıdaki kural ve miktarlara göre doğrudan XP kazanır:

| Kategori | Yapılan Aktivite | Kazanılan XP | Koşul / Kural Notu |
| :--- | :--- | :---: | :--- |
| 🌿 **Tarım (Botanik)** | Papatya, Lale, Gül (Fide Hasadı) | **+2 XP** | Parsel `SAPLING_READY` iken hasat edilirse |
| 🌿 **Tarım (Botanik)** | Şakayık, Lavanta, Orkide, Ayçiçeği (Fide) | **+4 XP** | Değerli tohumların fide hasadı |
| 🌸 **Tarım (Botanik)** | Papatya, Lale, Gül (Çiçek Hasadı) | **+4 XP** | Parsel `FLOWER_READY` iken hasat edilirse |
| 🌸 **Tarım (Botanik)** | Şakayık, Lavanta, Orkide, Ayçiçeği (Çiçek) | **+6 XP** | Yüksek kademe olgun çiçek hasadı |
| ⛏️ **Madencilik** | Maden Kayasını Tamamen Kırma | **+3 XP** | Refleks çubuğu ile kaya parçalandığında verilir |
| 🎣 **Balıkçılık** | Olta İle Balık/Hazine Tutma | **+1 XP** | Denizden çıkan her başarılı av için verilir |
| 🃏 **Casino / Blackjack**| Tamamlanan Blackjack Eli | **+1 XP** | Her tamamlanan el sonunda oyuncuya verilir |
| 🎴 **Büyük Masa Oyunları**| Batak, Okey, 101, Dost Kazığı (Kazanan) | **+15 XP** | Masada **en az 2 gerçek insan** olmalıdır |
| 🎴 **Büyük Masa Oyunları**| Batak, Okey, 101, Dost Kazığı (Kaybeden) | **+6 XP** | Masada **en az 2 gerçek insan** olmalıdır |
| ♟️ **Strateji Masaları** | Satranç, Tavla, Bilardo (Kazanan) | **+8 XP** | Masada **en az 2 gerçek insan** olmalıdır |
| ♟️ **Strateji Masaları** | Satranç, Tavla, Bilardo (Kaybeden) | **+4 XP** | Masada **en az 2 gerçek insan** olmalıdır |
| ❌ **Hızlı Mini Oyunlar** | XOX, Amiral Battı (Kazanan) | **+2 XP** | Masada **en az 2 gerçek insan** olmalıdır |
| ❌ **Hızlı Mini Oyunlar** | XOX, Amiral Battı (Kaybeden) | **+1 XP** | Masada **en az 2 gerçek insan** olmalıdır |

> [!NOTE]
> **Anti-Bot / Suistimal Koruması:** Masa oyunlarında masada bot haricinde en az 2 gerçek insan oyuncu bulunmadığı takdirde seviye XP'si ve rozet sayacı **kesinlikle işletilmez**.

---

### Seviye Atlama Ödülleri

Karakter Seviyesi (Level) her arttığında oyuncu otomatik olarak artan bir **TL ve Elmas** ödülü kazanır:

$$\text{Kazanılan Para} = \text{Yeni Seviye} \times 1.000\text{ TL}$$
$$\text{Kazanılan Elmas} = \text{Yeni Seviye} \times 1\text{ Elmas}$$

* **Seviye 2:** +2.000 TL & +2 Elmas
* **Seviye 3:** +3.000 TL & +3 Elmas
* **Seviye 10:** +10.000 TL & +10 Elmas
* **Seviye 50:** +50.000 TL & +50 Elmas
* **Seviye 100:** +100.000 TL & +100 Elmas

> Birden fazla seviye birden atlandığında aradaki tüm seviyelerin ödülleri kümülatif olarak toplanıp tek seferde hesaba yansıtılır ve kutlama penceresi (`levelUpOverlay`) açılır.

---

### Seviye Unvanları ve Auratik Parlama Kademeleri

Karakter seviyesi yükseldikçe sol üst HUD ve profildeki 1. yuva unvan ve parıltı kazanır:

* **Unvan Kademeleri:**
  - **Seviye 1 – 15:** `Çaylak`
  - **Seviye 16 – 35:** `Esnaf & Zanaatkar`
  - **Seviye 36 – 60:** `Kıdemli Müdavim`
  - **Seviye 61 – 85:** `Şehir Hakimi`
  - **Seviye 86 – 99:** `Duayen`
  - **Seviye 100:** `Yaşayan Efsane`

* **Aura / Glow Parlama Kademeleri (`getLevelGlowHelper`):**
  - **Seviye 1 – 19:** Parlama Yok
  - **Seviye 20 – 39:** 🥉 **Bronz Parlar** (`badge-glow-bronze`)
  - **Seviye 40 – 59:** 🥈 **Gümüş Parlar** (`badge-glow-silver`)
  - **Seviye 60 – 79:** 🥇 **Altın Parlar** (`badge-glow-gold`)
  - **Seviye 80 – 99:** 💎 **Elmas Parlar** (`badge-glow-diamond`)
  - **Seviye 100:** 🖤 **Siyah Parlar (Obsidyen / Max Seviye)** (`badge-glow-black`)

---

## 3. Uzmanlık & Disiplin Rozetleri (Kademe 1–10)

Mini Metaverse profilinde 4 ana mesleki uzmanlık rozeti ve 1 adet Seviye rozeti bulunur. Her uzmanlık rozeti **10 kademeden** oluşur.

---

### 1. 🎮 Oyunbaz (Masa ve Mini Oyunlar)
* **Veritabanı Sayacı:** `gamerGamesCount` (Batak, Okey, 101, Tavla, Bilardo, Satranç, XOX, Amiral Battı, Dost Kazığı el toplamı)
* **Ölçüm Birimi:** El

| Kademe | Gereken El Sayısı | Unvan | Auratik Parlama |
| :---: | :---: | :---: | :---: |
| **Lv. 1** | 1 – 9 El | Acemi Oyuncu | *Yok* |
| **Lv. 2** | 10 – 24 El | **Masa yancısı** | *Yok* |
| **Lv. 3** | 25 – 49 El | Kıdemli Oyuncu | *Yok* |
| **Lv. 4** | 50 – 99 El | Uzman Oyuncu | *Yok* |
| **Lv. 5** | 100 – 199 El | Usta Oyuncu | *Yok* |
| **Lv. 6** | 200 – 349 El | Büyük Usta | 🥉 **Bronz Parlar** |
| **Lv. 7** | 350 – 599 El | **Racon Kesici** | 🥈 **Gümüş Parlar** |
| **Lv. 8** | 600 – 999 El | Şampiyon | 🥇 **Altın Parlar** |
| **Lv. 9** | 1.000 – 1.499 El | Hükümdar | 💎 **Elmas Parlar** |
| **Lv. 10** | 1.500+ El | **Oyunbaz** | 🖤 **Siyah Parlar (Max)** |

---

### 2. 🌿 Botanik Rozeti (Tarım & Hasat)
* **Veritabanı Sayacı:** `botanicHarvestCount`
* **Ölçüm Birimi:** Hasat

| Kademe | Gereken Hasat | Unvan | Auratik Parlama |
| :---: | :---: | :---: | :---: |
| **Lv. 1** | 1 – 14 Hasat | Acemi Bahçıvan | *Yok* |
| **Lv. 2** | 15 – 49 Hasat | Çırak Bahçıvan | *Yok* |
| **Lv. 3** | 50 – 99 Hasat | Kıdemli Bahçıvan | *Yok* |
| **Lv. 4** | 100 – 199 Hasat | Uzman Bahçıvan | *Yok* |
| **Lv. 5** | 200 – 399 Hasat | Usta Bahçıvan | *Yok* |
| **Lv. 6** | 400 – 749 Hasat | Botanik Uzmanı | 🥉 **Bronz Parlar** |
| **Lv. 7** | 750 – 1.249 Hasat | Çiçek Üstadı | 🥈 **Gümüş Parlar** |
| **Lv. 8** | 1.250 – 1.999 Hasat | Botanik Şampiyonu | 🥇 **Altın Parlar** |
| **Lv. 9** | 2.000 – 3.499 Hasat | Flora Hükümdarı | 💎 **Elmas Parlar** |
| **Lv. 10** | 3.500+ Hasat | Efsanevi Botanikçi | 🖤 **Siyah Parlar (Max)** |

---

### 3. 🎣 Balıkçılık Rozeti (Deniz & Avcılık)
* **Veritabanı Sayacı:** `fishCaughtCount`
* **Ölçüm Birimi:** Balık

| Kademe | Gereken Av Sayısı | Unvan | Auratik Parlama |
| :---: | :---: | :---: | :---: |
| **Lv. 1** | 1 – 24 Balık | Acemi Balıkçı | *Yok* |
| **Lv. 2** | 25 – 99 Balık | Çırak Balıkçı | *Yok* |
| **Lv. 3** | 100 – 199 Balık | Kıdemli Balıkçı | *Yok* |
| **Lv. 4** | 200 – 399 Balık | Uzman Balıkçı | *Yok* |
| **Lv. 5** | 400 – 799 Balık | Usta Balıkçı | *Yok* |
| **Lv. 6** | 800 – 1.599 Balık | Kaptan Balıkçı | 🥉 **Bronz Parlar** |
| **Lv. 7** | 1.600 – 3.199 Balık | Deniz Kurdu | 🥈 **Gümüş Parlar** |
| **Lv. 8** | 3.200 – 5.999 Balık | Okyanus Avcısı | 🥇 **Altın Parlar** |
| **Lv. 9** | 6.000 – 9.999 Balık | Denizler Hükümdarı | 💎 **Elmas Parlar** |
| **Lv. 10** | 10.000+ Balık | Poseidon'un Varisi | 🖤 **Siyah Parlar (Max)** |

---

### 4. ⛏️ Madencilik Rozeti (Cevher & Kaya Kırma)
* **Veritabanı Sayacı:** `minedRocksCount`
* **Ölçüm Birimi:** Kaya

| Kademe | Gereken Kaya | Unvan | Auratik Parlama |
| :---: | :---: | :---: | :---: |
| **Lv. 1** | 1 – 24 Kaya | Acemi Madenci | *Yok* |
| **Lv. 2** | 25 – 99 Kaya | Çırak Madenci | *Yok* |
| **Lv. 3** | 100 – 199 Kaya | Kıdemli Madenci | *Yok* |
| **Lv. 4** | 200 – 399 Kaya | Uzman Madenci | *Yok* |
| **Lv. 5** | 400 – 799 Kaya | Usta Madenci | *Yok* |
| **Lv. 6** | 800 – 1.599 Kaya | Cevher Avcısı | 🥉 **Bronz Parlar** |
| **Lv. 7** | 1.600 – 3.199 Kaya | Derin Kazıcı | 🥈 **Gümüş Parlar** |
| **Lv. 8** | 3.200 – 5.999 Kaya | Maden Şampiyonu | 🥇 **Altın Parlar** |
| **Lv. 9** | 6.000 – 9.999 Kaya | Yeraltı Hükümdarı | 💎 **Elmas Parlar** |
| **Lv. 10** | 10.000+ Kaya | Efsanevi Kazıcı | 🖤 **Siyah Parlar (Max)** |

---

### 5. ⭐ Metaverse Sakini (Profil 1. Yuva)
* **İlişkili Değer:** Karakter Seviyesi (`level` 1–100) & Canlı XP (`currentProgress` / `targetXP`)
* **Konumu:** Profil modalındaki **1. Yuva (Slot 0)**
* **Tasarımı:** Ortada doğrudan **Kocaman Sayı** (Örn: `1`, `14`, `100`). Altında gereksiz küçük "Lv. 1" etiketi bulunmaz.
* **Hover Tooltip:** Canlı XP ilerleme çubuğu, anlık yüzde ve bir sonraki seviyeye kalan XP miktarı.

---

### Rozet Seviye Atlama Ödül Katlama Sistemi

Herhangi bir uzmanlık rozetinde yeni bir kademeye ulaşıldığında (`src/dataManager.js:checkAndAwardBadgeLevelUp`) katlamalı ödül dağıtılır:

$$\text{Kazanılan Para} = \text{Kademe} \times 1.000\text{ TL}$$
$$\text{Kazanılan Elmas} = \text{Kademe} \times 5\text{ Elmas}$$

| Ulaşılan Kademe | Nakit Para Ödülü | Elmas Ödülü |
| :---: | :---: | :---: |
| **1. Kademe** | +1.000 TL | +5 Elmas |
| **2. Kademe** | +2.000 TL | +10 Elmas |
| **3. Kademe** | +3.000 TL | +15 Elmas |
| **4. Kademe** | +4.000 TL | +20 Elmas |
| **5. Kademe** | +5.000 TL | +25 Elmas |
| **6. Kademe (Bronz)** | +6.000 TL | +30 Elmas |
| **7. Kademe (Gümüş)** | +7.000 TL | +35 Elmas |
| **8. Kademe (Altın)** | +8.000 TL | +40 Elmas |
| **9. Kademe (Elmas)** | +9.000 TL | +45 Elmas |
| **10. Kademe (Siyah)** | +10.000 TL | +50 Elmas |

> [!TIP]
> Bir oyuncu bir rozeti 1'den 10'a kadar tamamladığında toplamda **55.000 TL** ve **275 Elmas** sadece o rozetten kazanır. 4 ana rozet tamamlandığında bu ödül **220.000 TL** ve **1.100 Elmas** tutarına ulaşır!

---

### Rozet Parlama Efektleri (Glow & Aura)

6. Kademeden itibaren rozet kartları ve yuvaları özel CSS animasyonlu auralar kazanır (`public/css/badgeShowcase.css`):

* **Lv. 6 (Bronz):** Kehribar-bronz metalik parlama (`glow-bronze` / `badge-glow-bronze`).
* **Lv. 7 (Gümüş):** Parlak platin gümüş parlama (`glow-silver` / `badge-glow-silver`).
* **Lv. 8 (Altın):** Zengin altın ışıltısı (`glow-gold` / `badge-glow-gold`).
* **Lv. 9 (Elmas):** Buz mavisi & elmas pırlanta kristali (`glow-diamond` / `badge-glow-diamond`).
* **Lv. 10 (Siyah / Obsidyen):** Max Tier gizemli siyah gövde, mor neon aura ve duman dalgası (`glow-black` / `badge-glow-black`).

---

## 4. Profil Rozet Vitrini Gösterim Kuralları

Oyuncu profil modalı açıldığında (`public/js/social.js:renderProfileSquareBadges`):

1. **Sabit 1. Yuva (Karakter Seviyesi):** 
   - 1. Yuva daima oyuncunun Karakter Seviyesine ayrılmıştır.
   - Kocaman sayı ile gösterilir.
2. **Kazanılma Sırası Sıralaması (`badgeUnlockOrder`):**
   - Karakter Seviyesi haricindeki diğer rozetler, oyuncunun oyunda o rozeti ilk kazandığı tarihe (`badgeUnlockOrder` dizisine) göre kronolojik olarak yuvalara yerleşir.
3. **Kilitli Rozetlerin Gizlenmesi (Temiz Vitrin Kuralı):**
   - Henüz kazanılmamış (`level === 0`) rozetler yuvaları işgal etmez.
   - Vitrinde sadece kazanılmış rozetler yer alır; kalan yuvalar şık kesikli çizgili boş yuva olarak bekler.
4. **Başkalarının Profilini Ziyaret Ederken Gizlilik Kuralı:**
   - Bir başka oyuncunun profili açıldığında o oyuncunun ham aktivite sayıları (kaç balık tuttuğu, kaç kaya kırdığı) veya ilerleme çubukları gizlenir.
   - Sadece ulaştığı **Seviye ve Unvan** (Örn: *Kaptan Balıkçı Lv. 6*) gösterilir.

---

## 5. Ağ İletişimi (Socket Olayları) ve Veritabanı Şeması

### Sunucu & İstemci Socket Paketleri

* `xpGained`:
  - Sunucudan istemciye her XP kazanımında fırlatılır.
  - Payload: `{ gained: 3, totalXP: 145, currentLevel: 3, currentProgress: 72, targetXP: 95, source: 'maden' }`
  - İstemcide sol üst HUD barını günceller, anlık yeşil `+3 XP` float animasyonunu tetikler.
* `playerLevelUp`:
  - Seviye atlandığında fırlatılır.
  - Payload: `{ newLevel: 2, oldLevel: 1, rewardMoney: 2000, rewardDiamonds: 2, totalXP: 20, source: 'maden' }`
  - İstemcide sesli retro kutlama modalını (`levelUpOverlay`) açar.
* `badgeLevelUp`:
  - Uzmanlık rozetinde yeni bir kademe atlandığında fırlatılır.
  - Payload: `{ badgeId: 'gamer', badgeName: 'Oyunbaz', level: 2, rankTitle: 'Masa yancısı', rewardMoney: 2000, rewardDiamonds: 10 }`
  - İstemcide rozet kutlama modalını (`badgeLevelUpModal`) açar.
* `playerLevelBadgeUpdate`:
  - Odadaki tüm oyunculara yayınlanır; avatarın üstündeki seviye etiketini anında yeniler.

---

### Kullanıcı Veritabanı Şeması (User Schema Alanları)

```json
{
  "level": 1,
  "totalXP": 0,
  "money": 1000,
  "diamonds": 0,
  "gamerGamesCount": 0,
  "botanicHarvestCount": 0,
  "fishCaughtCount": 0,
  "minedRocksCount": 0,
  "claimedBadgeLevels": {
    "gamer": [],
    "botanic": [],
    "fish": [],
    "mining": []
  },
  "badgeUnlockOrder": ["resident"]
}
```


---

## 6. Seviye Kilitleri, Mekan & Karaborsa VIP Açılışları (Level Unlocks)

Oyuncunun seviyesi (Level 1–100) yalnızca statü ve rozetleri değil; aynı zamanda özel mekanların, karaborsa teçhizatlarının ve koruma birimlerinin erişimini kontrol eder. Oyuncu seviye atladığında tebrik modalında **"YENİ ÖZELLİKLER AÇILDI!"** kartı belirir.

### Seviye Kilitleri Cetveli

| Seviye | Açılan Yenilik / Teçhizat | Kategori | Açıklama & Şartlar |
| :---: | :--- | :---: | :--- |
| **Level 2** | 🚪 **VİP Club (Yeraltı Kulübü)** | Mekan | Cadde 2'deki gizli kulübe kapı ücreti ödemeden **tamamen ücretsiz** giriş hakkı açılır. |
| **Level 2** | 🗡️ **Gasp Bıçağı** | Saldırı Silahı | Yakın mesafeden hedefi soyarak **2.000 TL** nakit gasp eder (1 Kullanımlık - 2 Elmas - Hedef başına günde 1 kez). |
| **Level 2** | ⚡ **Zeus'un İlahi Yıldırımı** | İlahi Silah | Gökyüzünden yıldırımla hedefi çarpıp iskeletini çıkarır ve 30 sn kül yığınına çevirir (1 Kullanımlık - 2 Elmas). |
| **Level 2** | 🕶️ **1. İzbandut Koruma Slotu** | Özel Fedai | En fazla 1 adet özel izbandut koruma tutma ve savunma hakkı açılır (Süresiz, can siperi olana kadar). |
| **Level 3** | 📡 **Sinyal Kesici (Jammer)** | Taktik Eşya | Hedefin telsiz/chat ve hareketini geçici olarak bozar (1 Kullanımlık - 1.500 TL). |
| **Level 3** | 🐕‍🦺 **Sadık Doberman** | Özel Pet / Koruma | Gasp girişimlerine karşı can siperi olan ve düşmanı ısıran sadık koruma köpeği. |
| **Level 3** | 🎭 **Gizli Kimlik Maskesi** | Taktik Eşya | 30 dakika boyunca ismini gizler ("???"), konuşmalarına dumanlı koyu aura verir ve suç bültenlerinde kimliğini saklar. |
| **Level 20** | 🕶️ **2. İzbandut Koruma Slotu** | Özel Fedai | 2. İzbandut korumayı kiralama ve aynı anda sahada çift koruma ile gezebilme hakkı açılır. |
| **Level 20** | 🥉 **Bronz Profil Aurası** | Statü & Aura | Profil modalında ve karakter başlığında parıldayan asil bronz çerçeve. |
| **Level 40** | 🕶️ **3. İzbandut Koruma (MAX)** | Özel Fedai | 3. ve son koruma slotu açılır. Maksimum 3 koruma aynı anda hizmet verebilir. |
| **Level 50** | 🥇 **Altın Usta Aurası** | Statü & Aura | Göz alıcı altın aura ve usta vitrin tasarımı. |
| **Level 75** | 💎 **Zümrüt Elmas Aurası** | Statü & Aura | Nadir zümrüt elmas parlaklığı ve prestij rozeti. |
| **Level 100** | 👑 **Mitolojik Şampiyon & MAX** | Nihai Zirve | Metaverse evreninin en yüksek mertebesi, efsanevi mitolojik taç. |

---

### İzbandut Koruma Slot Ölçeklemesi (Level 2, 20, 40)

İzbandut Korumalar rastgele ve sınırsız kiralanamaz. Karakterin tecrübesine ve seviyesine göre kademeli olarak açılır:
- **Level 1:** 0 Koruma (Erişim kilitli).
- **Level 2 – 19:** **Maksimum 1 Koruma**.
- **Level 20 – 39:** **Maksimum 2 Koruma**.
- **Level 40 – 100:** **Maksimum 3 Koruma (Kapasite Tavanı)**.

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

---

*Belge Sürümü: v1.0.0 — Tarih: 9 Kasım 2026*  
*Mini Metaverse Geliştirme Ekibi Resmi Referans Dokümanıdır.*

