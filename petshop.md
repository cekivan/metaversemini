# 🐾 Pet Shop Mekanı & Evcil Hayvan Sistemi

Bu belge, **Pet Shop** mekanının ve evcil hayvan sisteminin güncel durumunu özetler.

---

## 🏛️ Mekan Mimarisi & Donatılar (`pet_shop` - 1000 x 625)

1. **🐠 Tropikal Mercan Akvaryumu & Zemin Su Işık Kırılmaları (Sol Duvar):**
   * Masif ahşap alt dolap, turkuaz akrilik cam su tankı, mercanlar, animasyonlu yüzen balıklar (Nemo, Tang, Angel) ve yükselen hava kabarcıkları.
   * **Dinamik Caustics (Su Güneş Işığı Kırılmaları):** Akvaryumun altındaki ahşap parke zemin üzerinde dalgalanan ışıltılı turkuaz su yansımaları ve yumuşak ışık kırılma şeritleri.

2. **🐶 2.5D Lüks Yavru Köpek & Kedi Oyun Bahçesi (Merkez Zemin - cx: 405, cy: 315):**
   * İskandinav meşe parke üzerinde perspektif zemin gölgesi ve pastel leylak/krem peluş oyun matı.
   * Çevresinde 8 adet turned beyaz ahşap dikme, pirinç küre finial başlıklar ve 360° şeffaf akrilik güvenlik korkulukları.
   * İçinde konforlu donut köpek yatağı, kuyruk sallayan altın yavru köpek, mavi yün yumağına pati atan beyaz yavru kedi ve yuvarlanan kırmızı kauçuk top.
   * Karakter çevresinde 360° serbestçe yürüyebilir (kusursuz Y-derinlik sıralaması ve elips çarpışma kontrolü).

3. **👩‍⚕️ Arka Duvar Lüks Pati Kliniği & Vet. Pamuk Abla Danışma Bankosu (Sağ Üst Duvar):**
   * **Arka Duvar Klinik Donatısı:**
     - Işıklı 3D akrilik neon tabela: `"🐾 PATİ KLİNİK & DANIŞMA"`.
     - İki adet altın varak çerçeveli, kırmızı balmumu mühürlü resmi Veterinerlik Fakültesi Onur Diploması ve Klinik Ruhsatı.
     - LED spot aydınlatmalı, 2 raflı cam kapaklı gömme ilaç/aşı vitrini: Renkli aşı flakonları (kuduz, karma, lösemi), steril şırınga, vitamin damlalıkları ve multivitamin şişesi.
   * **Modern İskandinav Resepsiyon Bankosu:**
     - Dikey akustik meşe çıtalı lüks ahşap ön panel, fırçalanmış pirinç süpürgelik ve İtalyan Carrara beyaz mermer tezgah.
     - Masaüstü: İnce veteriner monitörü (nabız/EKG ekranı), ahşap sahiplenme panosu (`clipboard`), pirinç resepsiyon zili, saksıda sukulent ve cam ödül kavanozu.
     - Banko arkasında beyaz önlüklü, stetoskoplu, göz kırpma animasyonlu veteriner Dr. Pamuk Abla NPC (`👩‍⚕️ Vet. Pamuk Abla [E]`).
     - Tıklandığında veya [E] tuşuna basıldığında sahiplenme menüsü (`openPetShopModal`) açılır.

4. **🌿 Dev Monstera & Dijital Evcil Hayvan Tartısı (Sağ Alt Köşe - Boşalan Alanda):**
   * Dikey yivli lüks seramik saksıda çok katmanlı, havadar, delikli yapraklara sahip tropikal Monstera Deliciosa (deve tabanı) salon bitkisi.
   * Yanında veteriner kontrolü için ultra ince paslanmaz çelik dijital evcil hayvan tartısı (`"🐾 0.00 KG"` parlak mavi LED göstergesi ve kauçuk pati emniyet pedi).

5. **👗 Butik Hayvan Kostüm Standı & Canlı Gardırop Deneme Kabini (Sol Alt):**
   * Masif meşe alt tabla, pirinç/siyah metal askılık dikmeleri, tepe finial küreleri ve askıda asılı 4 özel hayvan kostümü (Panda, Aslan, Dinozor, Kartal).
   * Alt tablada katlanmış peluş panda başlığı, pati terlikleri ve kurdeleli butik kutusu.
   * Üst kemerde ışıklı `🐾 HAYVAN KOSTÜM BUTİĞİ` tabelası ve interaktif `👗 BUTİK [E]` rozeti.
   * **Gardırop Tipi Canlı Karakter Önizleme Sistemi:**
     - Tıklandığında veya [E] tuşuna basıldığında 2 sütunlu lüks butik modalı açılır.
     - **Sol Sütun:** 8 yöne dönebilen interaktif canlı karakter podyumu (`boutiqueAvatarPreviewCanvas`). `↶ Sol` ve `↷ Sağ` butonları veya fareyle podyumu sürükleyerek karakteri 360° döndürebilme. Canlı animasyon adımları, anlık kuşanılmış/deneniyor durumu (`👀 Deneniyor: ...`), `Orijinal Halime Dön` ve `Kostümü Çıkar` butonları.
     - **Sağ Sütun:** 9 Hayvan Kostümünden oluşan 3x3 kart vitrini (Zombi kostümleri hariç):
       - 🐼 **Panda Kostümü:** 2.600 TL
       - 🦁 **Savana Kralı Aslan:** 4.800 TL
       - 🐘 **Heybetli Gerçekçi Fil:** 4.500 TL
       - 🐸 **Zıplayan Kurbağa:** 3.200 TL
       - 🦖 **Yırtıcı T-Rex Dinozor:** 5.000 TL
       - 🦅 **Göklerin Kartalı:** 3.500 TL
       - 🕷️ **Sekiz Bacaklı Karadul:** 2.900 TL
       - 🐍 **Amazon Anakondası:** 4.500 TL
       - 🪳 **Huysuz Mafya Hamamböceği:** 3.800 TL
     - Herhangi bir karta tıklandığında sol podyumdaki karakterde o kostüm anında canlı denenir ve kart neon mor bordürle parlar.

6. **🛋️ İskandinav Müşteri Bekleme Koltuğu & Kahve Sehpası (Merkez Alt):**
   * Sıcak krem/oatmeal bukle kumaş kaplı, dikey fitilli kavisli İskandinav kanepe (3 kişilik oturulabilir).
   * Dekoratif güneş sarısı örgü yastık ve mercan pati nakışlı kadife yastık.
   * Sol minderde mışıl mışıl kıvrılıp uyuyan nefes alan sevimli bal rengi yavru köpek ve süzülen `Zzz` baloncukları.
   * Önünde yuvarlak masif meşe kahve sehpası, "Pati & Dost" pet dergisi ve tüten sıcak buharlı seramik kahve kupası.

7. **🏬 Arka Duvar Butik Mama & Bakım Rafı:**
   * Masif meşe taç çıtalı 3 katlı butik vitrin rafı.
   * Üst Kat: Kavisli gövdeli, lezzet şeritli ve pati/kemik/balık mühürlü 10 çeşit gurme mama paketi.
   * Orta Kat: Mantar tıpalı cam ödül kavanozları (kemik, yıldız bisküviler), renkli eczacı tipi vitamin şişeleri ve dental çiğneme çubukları sepeti.
   * Alt Kat: Peluş sarı ördek, kırmızı kemik yastık, örgülü çekiştirme halatı, şampuan pompaları, ahşap tüy fırçası ve çiftli paslanmaz mama kapları.

8. **🕰️ Üst Duvar & Tavan Atmosfer Detayları:**
   * **Retro Kit-Cat Sarkaçlı Duvar Saati:** Sol üst duvarda büyük beyaz gözleri sağa-sola bakan, kuyruğu sarkaç gibi sallanan, beyaz papyonlu klasik vintage Kit-Cat saati.
   * **Tavandan Sarkan Makrome Saksılar:** Örgülü pamuk ipler, ahşap boncuklar, terracota saksı ve aşağı sarkan canlı sarmaşık/yapraklar.
   * **Giriş Paspası:** Alt çıkış kapısında altın saçaklı, çift altın bordürlü `"🐾 HOŞ GELDİNİZ • SEVİMLİ PATİLER &bullet; ÇIKIŞ"` karşılama paspası.

---

## 🐾 Aktif Evcil Hayvanlar (Yoldaşlar)

Pet Shop bünyesinde sahiplenilebilen 3 temel evcil hayvan:

| Yoldaş | İsim | Kiralama Ücreti | Süre | Özellik |
| :--- | :--- | :--- | :--- | :--- |
| 🐱 | **Sevimli Kedi** | 2.000 TL | 15 Dakika | ⚡ 1.3x Yürüyüş Hızı |
| 🐶 | **Sadık Köpek** | 3.000 TL | 15 Dakika | 🎣 1.5x Balık Parası |
| 🐭 | **Hızlı Fare** | 1.500 TL | 15 Dakika | 🧀 Sevimli Yoldaş |

*Not: Kiralık yoldaşlar 15 dakika boyunca sahibini tüm mekanlarda takip eder.*
