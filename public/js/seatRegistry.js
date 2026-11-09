// public/js/seatRegistry.js - Yüksek Performanslı Oturma, Koltuk/Sandalye Kayıt Defteri ve Sıfır-Tahsisli Arama Motoru

/**
 * Statik mekanlardaki tüm koltuk, sandalye, tabure ve bankların önceden hesaplanmış sabit koordinatları.
 * Trigonometrik hesaplamalar (Math.cos/sin) oyun döngüsü dışında bir defa hesaplanmıştır.
 */
const STATIC_ROOM_SEATS = {
    kafe: [
        // Bar Tabureleri (Sol Üst VIP Çay & Kahve Barı: x: 35..270, y: 18..72)
        { x: 65, y: 86, facing: 'up', label: 'Bar Taburesi' },
        { x: 115, y: 86, facing: 'up', label: 'Bar Taburesi' },
        { x: 165, y: 86, facing: 'up', label: 'Bar Taburesi' },
        { x: 215, y: 86, facing: 'up', label: 'Bar Taburesi' },

        // Tavla Masası Sandalyeleri (x: 110, y: 370, w: 115, h: 82 - cx: 167, cy: 411)
        { x: 167, y: 350, facing: 'down', label: 'Tavla Sandalyesi', game: 'tavla', tableId: 'tavla' },
        { x: 167, y: 472, facing: 'up', label: 'Tavla Sandalyesi', game: 'tavla', tableId: 'tavla' },

        // XOX Masası Sandalyeleri (x: 315, y: 180, w: 95, h: 80 - cx: 362, cy: 220)
        { x: 362, y: 160, facing: 'down', label: 'XOX Sandalyesi', game: 'xox', tableId: 'xox' },
        { x: 362, y: 280, facing: 'up', label: 'XOX Sandalyesi', game: 'xox', tableId: 'xox' },

        // Amiral Battı Masası Sandalyeleri (x: 590, y: 180, w: 100, h: 80 - cx: 640, cy: 220)
        { x: 640, y: 160, facing: 'down', label: 'Amiral Battı Sandalyesi', game: 'amiral', tableId: 'amiral' },
        { x: 640, y: 280, facing: 'up', label: 'Amiral Battı Sandalyesi', game: 'amiral', tableId: 'amiral' },

        // Satranç Masası Sandalyeleri (x: 780, y: 175, w: 110, h: 82 - cx: 835, cy: 216)
        { x: 835, y: 155, facing: 'down', label: 'Satranç Sandalyesi', game: 'chess', tableId: 'chess', seatIndex: 0 },
        { x: 835, y: 277, facing: 'up', label: 'Satranç Sandalyesi', game: 'chess', tableId: 'chess', seatIndex: 1 },

        // Chesterfield Seyirci Lounge Koltuğu (x: 745..935, y: 390..455)
        { x: 790, y: 422, facing: 'down', label: 'Chesterfield Deri Koltuk' },
        { x: 840, y: 422, facing: 'down', label: 'Chesterfield Deri Koltuk' },
        { x: 890, y: 422, facing: 'down', label: 'Chesterfield Deri Koltuk' }
    ],

    sokak: [
        { x: 292, y: 218, facing: 'down', label: 'Meydan Bankı' },
        { x: 512, y: 218, facing: 'down', label: 'Meydan Bankı' }
    ],
    cadde: [
        { x: 282, y: 226, facing: 'down', label: 'Bulvar Bankı (Sol)' },
        { x: 302, y: 226, facing: 'down', label: 'Bulvar Bankı (Sağ)' },
        { x: 452, y: 226, facing: 'down', label: 'Bulvar Bankı (Sol)' },
        { x: 472, y: 226, facing: 'down', label: 'Bulvar Bankı (Sağ)' }
    ],
    emlakci: [
        { x: 55, y: 425, facing: 'right', label: 'Müşteri Kanepe Koltuğu' },
        { x: 400, y: 68, facing: 'down', label: 'Danışman Koltuğu' }
    ],
    dedenin_yeri: [
        // Blackjack Masası Koltukları (E basınca oturur ve Blackjack açılır)
        { x: 364, y: 250, facing: 'up', label: 'Blackjack Koltuğu 1', tableId: 'blackjack', game: 'blackjack', seatIndex: 0 },
        { x: 400, y: 258, facing: 'up', label: 'Blackjack Koltuğu 2', tableId: 'blackjack', game: 'blackjack', seatIndex: 1 },
        { x: 436, y: 250, facing: 'up', label: 'Blackjack Koltuğu 3', tableId: 'blackjack', game: 'blackjack', seatIndex: 2 }
    ],
    market: [
        { x: 135, y: 183, facing: 'down', label: 'Showroom Koltuğu' },
        { x: 640, y: 280, facing: 'down', label: 'Showroom Sediri' },
        { x: 410, y: 392, facing: 'up', label: 'Showroom Sandalyesi' },
        { x: 415, y: 212, facing: 'up', label: 'Showroom Berjeri' }
    ],
    sahil: [
        // Tropik Bar Önü Tabureleri (Oturunca Kokteyl Menüsü Açılır)
        { x: 678, y: 462, facing: 'up', label: 'Tropik Bar Taburesi', game: 'cocktail_bar' },
        { x: 712, y: 462, facing: 'up', label: 'Tropik Bar Taburesi', game: 'cocktail_bar' },
        { x: 746, y: 462, facing: 'up', label: 'Tropik Bar Taburesi', game: 'cocktail_bar' },
        // Plaj Şezlongları
        { x: 600, y: 330, facing: 'right', label: 'Plaj Şezlongu' },
        { x: 606, y: 356, facing: 'right', label: 'Plaj Şezlongu' }
    ],
    sanalika_cadde: [
        // 1. Cadde & Durak Bankları
        { x: 440, y: 585, facing: 'down', label: '10. Cadde Durak Bankı' },
        { x: 520, y: 380, facing: 'down', label: '1. Cadde Bulvar Bankı' },
        { x: 790, y: 335, facing: 'down', label: 'Sonbahar Park Bankı' },
        { x: 910, y: 560, facing: 'left', label: 'Meydan Bankı' },
        // Sahil & Plaj Şezlongları
        { x: 1220, y: 760, facing: 'right', label: '1. Cadde Plaj Şezlongu' },
        { x: 1260, y: 810, facing: 'right', label: '1. Cadde Plaj Şezlongu' },
        { x: 1330, y: 840, facing: 'right', label: '1. Cadde Plaj Şezlongu' }
    ],
    star_caddesi: [
        // Star Bistro Açık Teras Sandalyeleri
        { x: 90, y: 152, facing: 'down', label: 'Bistro Sandalyesi' },
        { x: 90, y: 172, facing: 'up', label: 'Bistro Sandalyesi' },
        { x: 205, y: 152, facing: 'down', label: 'Bistro Sandalyesi' },
        { x: 205, y: 172, facing: 'up', label: 'Bistro Sandalyesi' },
        // Star Park & Süs Havuzu Bankları
        { x: 190, y: 510, facing: 'right', label: 'Star Park Bankı' },
        { x: 395, y: 510, facing: 'left', label: 'Star Park Bankı' },
        // Sahil Şezlongları
        { x: 900, y: 435, facing: 'down', label: 'Plaj Şezlongu' },
        { x: 945, y: 435, facing: 'down', label: 'Plaj Şezlongu' }
    ],
    meydanv2: [
        { x: 235, y: 195, facing: 'down', label: 'Bulvar Park Bankı' },
        { x: 440, y: 285, facing: 'down', label: 'Fıskiye Meydan Bankı' },
        { x: 590, y: 285, facing: 'down', label: 'Billboard Önü Bankı' },
        { x: 360, y: 405, facing: 'up', label: 'Çınar Altı Park Bankı' }
    ],
    sahilv2: [
        // Tropik Bar Önü Tabureleri (Oturunca Kokteyl Menüsü Otomatik Açılır)
        { x: 880, y: 446, facing: 'up', label: 'Tropik Bar Taburesi', game: 'cocktail_bar' },
        { x: 909, y: 446, facing: 'up', label: 'Tropik Bar Taburesi', game: 'cocktail_bar' },
        { x: 938, y: 446, facing: 'up', label: 'Tropik Bar Taburesi', game: 'cocktail_bar' },
        // Ahşap İskele Seyir & Balıkçı Bankları (İskele Ahşap Güverte Üzerinde)
        { x: 186, y: 110, facing: 'down-right', label: 'İskele Seyir Bankı' },
        { x: 356, y: 208, facing: 'down-right', label: 'İskele Balıkçı Bankı' },
        // Kamp Ateşi Ahşap Kütük Koltukları
        { x: 682, y: 486, facing: 'right', label: 'Kamp Ateşi Kütüğü' },
        { x: 746, y: 486, facing: 'left', label: 'Kamp Ateşi Kütüğü' },
        // Kumsal Güneşlenme Havluları
        { x: 585, y: 480, facing: 'down-right', label: 'Güneşlenme Havlusu' },
        { x: 610, y: 470, facing: 'down-right', label: 'Güneşlenme Havlusu' },
        { x: 745, y: 590, facing: 'down-left', label: 'Güneşlenme Havlusu' },
        { x: 772, y: 575, facing: 'down-left', label: 'Güneşlenme Havlusu' },
        { x: 885, y: 210, facing: 'down-left', label: 'Plaj Şemsiye Havlusu' }
    ],
    sahil_yolu: [
        { x: 260, y: 395, facing: 'down', label: 'Kordon Dinlenme Bankı' },
        { x: 420, y: 395, facing: 'down', label: 'Kordon Dinlenme Bankı' },
        { x: 580, y: 395, facing: 'down', label: 'Kordon Dinlenme Bankı' },
        { x: 380, y: 220, facing: 'down', label: 'AVM Giriş Dinlenme Bankı' },
        { x: 620, y: 220, facing: 'down', label: 'AVM Giriş Dinlenme Bankı' }
    ],
    avm_kat1: [
        { x: 370, y: 355, facing: 'right', label: 'Fıskiye Batı Deri Pufu' },
        { x: 630, y: 355, facing: 'left', label: 'Fıskiye Doğu Deri Pufu' },
        { x: 500, y: 265, facing: 'down', label: 'Fıskiye Kuzey Deri Pufu' },
        { x: 500, y: 455, facing: 'up', label: 'Fıskiye Güney Deri Pufu' }
    ],
    avm_kat2: [
        { x: 240, y: 415, facing: 'right', label: 'VIP Lounge Batı Chesterfield Kanepe' },
        { x: 760, y: 415, facing: 'left', label: 'VIP Lounge Doğu Chesterfield Kanepe' },
        { x: 430, y: 480, facing: 'up', label: 'Atrium Seyir Balkonu Batı Koltuğu' },
        { x: 570, y: 480, facing: 'up', label: 'Atrium Seyir Balkonu Doğu Koltuğu' }
    ],
    avm_magaza_kiyafet: [
        { x: 280, y: 380, facing: 'right', label: 'Cadde Moda Kadife Koltuk' },
        { x: 720, y: 380, facing: 'left', label: 'Cadde Moda Kadife Koltuk' }
    ],
    avm_magaza_sneaker: [
        { x: 300, y: 380, facing: 'right', label: 'Sneaker Deneme Pufu' },
        { x: 700, y: 380, facing: 'left', label: 'Sneaker Deneme Pufu' }
    ],
    avm_magaza_sapka: [
        { x: 300, y: 380, facing: 'right', label: 'Şapka Deneme Koltuğu' },
        { x: 700, y: 380, facing: 'left', label: 'Şapka Deneme Koltuğu' }
    ],
    avm_magaza_takim: [
        { x: 280, y: 380, facing: 'right', label: 'Milano Deri Kanepe' },
        { x: 720, y: 380, facing: 'left', label: 'Milano Deri Kanepe' }
    ],
    avm_magaza_saat: [
        { x: 300, y: 380, facing: 'right', label: 'VIP Saatçi Koltuğu' },
        { x: 700, y: 380, facing: 'left', label: 'VIP Saatçi Koltuğu' }
    ],
    avm_magaza_berber: [
        { x: 360, y: 380, facing: 'up', label: 'VIP Kuaför Koltuğu #1', game: 'barber_studio' },
        { x: 640, y: 380, facing: 'up', label: 'VIP Kuaför Koltuğu #2', game: 'barber_studio' }
    ],
    dostlar_kiraathanesi: [
        // 4 Kişilik Normal Batak Masası Sandalyeleri (cx: 320, cy: 230)
        { x: 320, y: 165, facing: 'down', label: 'Batak Masası Sandalyesi (Kuzey)', game: 'batak4', tableId: 'batak4' },
        { x: 320, y: 295, facing: 'up', label: 'Batak Masası Sandalyesi (Güney)', game: 'batak4', tableId: 'batak4' },
        { x: 255, y: 230, facing: 'right', label: 'Batak Masası Sandalyesi (Batı)', game: 'batak4', tableId: 'batak4' },
        { x: 385, y: 230, facing: 'left', label: 'Batak Masası Sandalyesi (Doğu)', game: 'batak4', tableId: 'batak4' },

        // 3 Kişilik Gömmeli Batak Masası Sandalyeleri (cx: 320, cy: 440)
        { x: 320, y: 380, facing: 'down', label: 'Gömmeli Batak Sandalyesi (Kuzey)', game: 'batak', tableId: 'batak' },
        { x: 375, y: 475, facing: 'left', label: 'Gömmeli Batak Sandalyesi (Güneydoğu)', game: 'batak', tableId: 'batak' },
        { x: 265, y: 475, facing: 'right', label: 'Gömmeli Batak Sandalyesi (Güneybatı)', game: 'batak', tableId: 'batak' },

        // 4 Kişilik Klasik Dost Kazığı Masası Sandalyeleri (cx: 720, cy: 230)
        { x: 720, y: 165, facing: 'down', label: 'Dost Kazığı Sandalyesi (Kuzey)', game: 'dost_kazigi', tableId: 'dost_kazigi' },
        { x: 720, y: 295, facing: 'up', label: 'Dost Kazığı Sandalyesi (Güney)', game: 'dost_kazigi', tableId: 'dost_kazigi' },
        { x: 655, y: 230, facing: 'right', label: 'Dost Kazığı Sandalyesi (Batı)', game: 'dost_kazigi', tableId: 'dost_kazigi' },
        { x: 785, y: 230, facing: 'left', label: 'Dost Kazığı Sandalyesi (Doğu)', game: 'dost_kazigi', tableId: 'dost_kazigi' },

        // 3 Kişilik Dost Kazığı Masası Sandalyeleri (cx: 720, cy: 440)
        { x: 720, y: 380, facing: 'down', label: '3 Kişilik Dost Kazığı Sandalyesi (Kuzey)', game: 'dost_kazigi_3p', tableId: 'dost_kazigi_3p' },
        { x: 775, y: 475, facing: 'left', label: '3 Kişilik Dost Kazığı Sandalyesi (Güneydoğu)', game: 'dost_kazigi_3p', tableId: 'dost_kazigi_3p' },
        { x: 665, y: 475, facing: 'right', label: '3 Kişilik Dost Kazığı Sandalyesi (Güneybatı)', game: 'dost_kazigi_3p', tableId: 'dost_kazigi_3p' },

        // Çay Ocağı Tezgah Tabureleri (x: 70, 130, 180, y: 162 - Oturunca İçecek Menüsü Açılır)
        { x: 70, y: 162, facing: 'up', label: 'Kıraathane Taburesi', game: 'kiraathane_bar' },
        { x: 130, y: 162, facing: 'up', label: 'Kıraathane Taburesi', game: 'kiraathane_bar' },
        { x: 180, y: 162, facing: 'up', label: 'Kıraathane Taburesi', game: 'kiraathane_bar' },

        // Sedir Dinlenme Alanı (Sağ Duvar)
        { x: 945, y: 250, facing: 'left', label: 'Kıraathane Sediri' },
        { x: 945, y: 330, facing: 'left', label: 'Kıraathane Sediri' }
    ],

    // =====================================================================
    // ATATÜRK KÜLTÜR MERKEZİ (CADDE 2) - SAHNE, KULİS VE SİNEMA KOLTUKLARI
    // =====================================================================
    kultur_merkezi_sahne: [
        // Sıra 1 (y: 350)
        { x: 221, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 296, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 371, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 446, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 521, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 596, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 671, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 746, y: 365, facing: 'up', label: 'Tiyatro Koltuğu' },

        // Sıra 2 (y: 420)
        { x: 161, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 237, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 313, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 389, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 465, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 541, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 617, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 693, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 769, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 845, y: 435, facing: 'up', label: 'Tiyatro Koltuğu' },

        // Sıra 3 (y: 490)
        { x: 101, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 175, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 249, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 323, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 397, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 471, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 545, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 619, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 693, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 767, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 841, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' },
        { x: 915, y: 505, facing: 'up', label: 'Tiyatro Koltuğu' }
    ],

    kultur_merkezi_kulis: [
        // Chesterfield VIP Deri Koltuk (x: 350..650, y: 260..335)
        { x: 400, y: 295, facing: 'down', label: 'VIP Kulis Koltuğu' },
        { x: 470, y: 295, facing: 'down', label: 'VIP Kulis Koltuğu' },
        { x: 540, y: 295, facing: 'down', label: 'VIP Kulis Koltuğu' },
        { x: 610, y: 295, facing: 'down', label: 'VIP Kulis Koltuğu' },

        // Hollywood Aynalı Makyaj Masası Tabureleri
        { x: 190, y: 150, facing: 'up', label: 'Makyaj Taburesi' },
        { x: 500, y: 150, facing: 'up', label: 'Makyaj Taburesi' },
        { x: 810, y: 150, facing: 'up', label: 'Makyaj Taburesi' }
    ],

    kultur_merkezi_sinema: [
        // Kademe 1 (y: 280)
        { x: 151, y: 295, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 227, y: 295, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 303, y: 295, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 379, y: 295, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 607, y: 295, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 683, y: 295, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 759, y: 295, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 835, y: 295, facing: 'up', label: 'Sinema Koltuğu' },

        // Kademe 2 (y: 350)
        { x: 101, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 173, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 245, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 317, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 389, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 605, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 677, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 749, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 821, y: 365, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 893, y: 365, facing: 'up', label: 'Sinema Koltuğu' },

        // Kademe 3 (y: 425)
        { x: 101, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 173, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 245, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 317, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 389, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 605, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 677, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 749, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 821, y: 440, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 893, y: 440, facing: 'up', label: 'Sinema Koltuğu' },

        // Kademe 4 (y: 500)
        { x: 101, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 173, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 245, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 317, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 389, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 605, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 677, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 749, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 821, y: 515, facing: 'up', label: 'Sinema Koltuğu' },
        { x: 893, y: 515, facing: 'up', label: 'Sinema Koltuğu' }
    ],
    vip_club: [
        // 2.5D VIP Chesterfield U-Loca Koltukları (Sol Üst Taraf - Yukarı Küçültülmüş)
        { x: 145, y: 236, facing: 'down', label: 'VIP Loca Koltuk (Arka-Sol)' },
        { x: 215, y: 236, facing: 'down', label: 'VIP Loca Koltuk (Arka-Sağ)' },
        { x: 112, y: 262, facing: 'right', label: 'VIP Loca Koltuk (Sol)' },
        { x: 248, y: 262, facing: 'left', label: 'VIP Loca Koltuk (Sağ)' },

        // YENİ: 2:1 Gerçek İzometrik Sanalika Bej Koltuk Grubu (Sol Alt Köşe - Büyütülmüş & Karşılıklı)
        // Soldaki koltuk yüzü SAĞ-ALTA (down-right), Sağdaki koltuk yüzü SOL-ALTA (down-left) bakar.
        // 1. Koltuk (Soldaki - Yüzü Sağ-Alta / down-right)
        { x: 123, y: 407, facing: 'down-right', label: 'İzo Sanalika Bej Sol (İç)' },
        { x: 97, y: 420, facing: 'down-right', label: 'İzo Sanalika Bej Sol (Dış)' },
        // 2. Koltuk (Sağdaki - Yüzü Sol-Alta / down-left)
        { x: 227, y: 447, facing: 'down-left', label: 'İzo Sanalika Bej Sağ (İç)' },
        { x: 253, y: 460, facing: 'down-left', label: 'İzo Sanalika Bej Sağ (Dış)' },

        // MEVCUT (Karşılaştırma İçin Korunan): 2.5D Sanalika L-Sectional Lounge Koltukları (Sağ Taraf Beyaz Deri Köşe Kanepe)
        // Ana Koltuk (3 Minder - Güneye / Aşağıya Bakan)
        { x: 741, y: 409, facing: 'down', label: 'Sanalika Lounge (Sol)' },
        { x: 785, y: 409, facing: 'down', label: 'Sanalika Lounge (Orta)' },
        { x: 829, y: 409, facing: 'down', label: 'Sanalika Lounge (Sağ)' },
        // 2.5D İzometrik Yan Koltuk (2 Minder - Batıya / Odanın Soluna Bakan)
        { x: 882, y: 443, facing: 'left', label: 'Sanalika Lounge Yan (Üst)' },
        { x: 882, y: 487, facing: 'left', label: 'Sanalika Lounge Yan (Alt)' }
    ],
    pet_shop: [
        // Müşteri Bekleme Koltuğu (Sittable Sofa)
        { x: 320, y: 430, facing: 'down', label: 'Müşteri Bekleme Koltuğu' },
        { x: 405, y: 430, facing: 'down', label: 'Müşteri Bekleme Koltuğu' },
        { x: 490, y: 430, facing: 'down', label: 'Müşteri Bekleme Koltuğu' }
    ],
    optik: [
        // 2:1 İzometrik Barcelona Deri Koltukları (Mies van der Rohe)
        // Sol Koltuk: Banko sol yanı (x: 285, y: 405, facing: 'down-right')
        { x: 285, y: 405, facing: 'down-right', label: 'Barcelona Koltuk (Sol)' },
        // Sağ Koltuk: Banko sağ yanı (x: 440, y: 385, facing: 'down-left')
        { x: 440, y: 385, facing: 'down-left', label: 'Barcelona Koltuk (Sağ)' },
        // Bordo Kadife Yuvarlak Puf (x: 672, y: 395, facing: 'down-left')
        { x: 672, y: 395, facing: 'down-left', label: 'Bordo Kadife Puf' }
    ],
    optika: [
        // Geriye dönük uyumluluk alias
        { x: 285, y: 405, facing: 'down-right', label: 'Barcelona Koltuk (Sol)' },
        { x: 440, y: 385, facing: 'down-left', label: 'Barcelona Koltuk (Sağ)' },
        { x: 672, y: 395, facing: 'down-left', label: 'Bordo Kadife Puf' }
    ]
};

const MAX_SIT_DIST = 62;
const MAX_SIT_DIST_SQ = MAX_SIT_DIST * MAX_SIT_DIST; // 3844

/**
 * 60 FPS Animasyon Döngüsünde Sıfır-Tahsis (Zero Garbage Collection) çalışan en yakın koltuğu bulma fonksiyonu.
 * Bellekte gereksiz dizi açmaz, sort çalıştırmaz; O(N) tek geçişte minimum kare mesafeyi bulur.
 */
function findNearestSittableSeat() {
    if (typeof players === 'undefined' || typeof myId === 'undefined' || !players[myId]) return null;
    let p = players[myId];
    let room = typeof currentRoom !== 'undefined' ? currentRoom : '';

    // 1. Statik Mekan Koltukları Kontrolü
    let staticSeats = STATIC_ROOM_SEATS[room];
    if (staticSeats) {
        let bestSeat = null;
        let minDistSq = MAX_SIT_DIST_SQ;
        for (let i = 0; i < staticSeats.length; i++) {
            let s = staticSeats[i];
            let dx = p.x - s.x;
            let dy = p.y - s.y;
            let d2 = dx * dx + dy * dy;
            if (d2 < minDistSq) {
                minDistSq = d2;
                bestSeat = s;
            }
        }
        return bestSeat;
    }

    // 2. Dinamik Ev Mobilyaları Kontrolü (house_*)
    if (room.startsWith("house_")) {
        let house = (typeof getCurrentViewingHouse === 'function') ? getCurrentViewingHouse() : null;
        if (!house || !house.furniture || house.furniture.length === 0) return null;

        let catTable = window.FURNITURE_CATALOG || {};
        let bestSeat = null;
        let minDistSq = MAX_SIT_DIST_SQ;

        for (let i = 0; i < house.furniture.length; i++) {
            let item = house.furniture[i];
            let cat = catTable[item.id] || { w: 60, h: 50 };
            let rot = (((item.rotation !== undefined ? item.rotation : item.rot) || 0) % 4 + 4) % 4;
            let isTransposed = (rot === 1 || rot === 3);
            let effW = isTransposed ? cat.h : cat.w;
            let effH = isTransposed ? cat.w : cat.h;
            let left = item.x - effW / 2;
            let right = item.x + effW / 2;
            let top = item.y - effH / 2;
            let bottom = item.y + effH / 2;

            let sitX = item.x;
            let sitY = item.y;
            let facing = 'down';
            let label = 'Mobilya';

            if (item.id === 'sedir') {
                if (rot === 0) {
                    sitX = Math.max(left + 16, Math.min(right - 16, p.x));
                    sitY = Math.round(item.y - 2);
                    facing = 'down';
                } else if (rot === 1) {
                    sitX = Math.round(item.x + 8);
                    sitY = Math.max(top + 16, Math.min(bottom - 16, p.y));
                    facing = 'right';
                } else if (rot === 2) {
                    sitX = Math.max(left + 16, Math.min(right - 16, p.x));
                    sitY = Math.round(item.y + 12);
                    facing = 'up';
                } else if (rot === 3) {
                    sitX = Math.round(item.x - 8);
                    sitY = Math.max(top + 16, Math.min(bottom - 16, p.y));
                    facing = 'left';
                }
                label = 'Sedir';
            } else if (item.id === 'berjer') {
                let dirs = ['down', 'right', 'up', 'left'];
                facing = dirs[rot];
                label = 'Berjer';
            } else if (item.id === 'bilgisayar') {
                let dirs = ['up', 'left', 'down', 'right'];
                let offX = [0, 16, 0, -16][rot];
                let offY = [16, 0, -16, 0][rot];
                sitX = item.x + offX;
                sitY = item.y + offY;
                facing = dirs[rot];
                label = 'Çalışma Koltuğu';
            } else if (item.id === 'piyano') {
                sitX = item.x;
                sitY = item.y + 18;
                facing = 'up';
                label = 'Piyano Taburesi';
            } else if (item.id === 'yemek_masasi') {
                let isTop = (p.y < item.y);
                sitX = p.x < item.x ? item.x - 20 : item.x + 20;
                sitY = isTop ? item.y - 18 : item.y + 18;
                facing = isTop ? 'down' : 'up';
                label = 'Yemek Sandalyesi';
            } else {
                continue;
            }

            let dx = p.x - sitX;
            let dy = p.y - sitY;
            let d2 = dx * dx + dy * dy;
            if (d2 < minDistSq) {
                minDistSq = d2;
                bestSeat = { x: sitX, y: sitY, facing: facing, label: label, dist: Math.sqrt(d2) };
            }
        }
        return bestSeat;
    }

    return null;
}

/**
 * Koltuğa oturulduğunda ilgili oyun ekranını/menüsünü otomatik olarak açar.
 */
function openGameForSeat(seat) {
    if (!seat) return;
    let gameType = seat.game || seat.tableId;
    if (!gameType) return;

    if (gameType === 'blackjack') {
        if (typeof openBlackjackModal === 'function') {
            openBlackjackModal();
            let timerFn = (typeof setTimeout !== 'undefined') ? setTimeout : (typeof window !== 'undefined' ? window.setTimeout : null);
            if (timerFn && seat.seatIndex !== undefined && window.socket) {
                timerFn(() => {
                    if (typeof bjTakeSeat === 'function') bjTakeSeat(seat.seatIndex);
                    else if (window.socket) window.socket.emit('blackjack_sit', { seatIndex: seat.seatIndex });
                }, 150);
            }
        }
    } else if (gameType === 'xox') {
        if (typeof openXoxModal === 'function') openXoxModal();
    } else if (gameType === 'amiral') {
        if (typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
    } else if (gameType === 'batak' || gameType === 'batak4' || gameType === 'tavla' || gameType === 'chess' || gameType === 'okey101' || gameType === 'okey101_tekli' || gameType === 'billiard' || gameType === 'dost_kazigi' || gameType === 'dost_kazigi_3p') {
        if (window.socket) {
            window.socket.emit('requestTableOptions', gameType);
        }
    } else if (gameType === 'cocktail_bar') {
        if (typeof openCocktailBarModal === 'function') {
            openCocktailBarModal();
        }
    } else if (gameType === 'kiraathane_bar') {
        if (typeof openKiraathaneBarModal === 'function') {
            openKiraathaneBarModal();
        }
    } else if (gameType === 'barber_studio') {
        if (typeof openBarberStudioModal === 'function') {
            openBarberStudioModal();
        }
    }
}
window.openGameForSeat = openGameForSeat;

/**
 * Tıklanan koordinata (worldX, worldY) en yakın sandalye, koltuk, tabure veya bankı bulur.
 * @param {number} worldX Tıklanan dünya X koordinatı
 * @param {number} worldY Tıklanan dünya Y koordinatı
 * @param {number} maxRadius Maksimum tıklama toleransı (varsayılan 36px)
 * @returns {object|null} Bulunan koltuk nesnesi veya null
 */
function findSeatAtCoordinates(worldX, worldY, maxRadius = 36) {
    let room = typeof currentRoom !== 'undefined' ? currentRoom : '';

    // 1. Statik Mekan Koltukları / Sandalyeleri / Bankları
    let staticSeats = STATIC_ROOM_SEATS[room];
    if (staticSeats && staticSeats.length > 0) {
        let bestSeat = null;
        let minDistSq = maxRadius * maxRadius;
        for (let i = 0; i < staticSeats.length; i++) {
            let s = staticSeats[i];
            let dx = worldX - s.x;
            let dy = worldY - s.y;
            let d2 = dx * dx + dy * dy;
            if (d2 < minDistSq) {
                minDistSq = d2;
                bestSeat = s;
            }
        }
        if (bestSeat) return bestSeat;
    }

    // 2. Dinamik Ev Mobilyaları (house_*)
    if (room && room.startsWith("house_")) {
        let house = (typeof getCurrentViewingHouse === 'function') ? getCurrentViewingHouse() : null;
        if (!house || !house.furniture || house.furniture.length === 0) return null;

        let catTable = window.FURNITURE_CATALOG || {};
        let bestSeat = null;
        let minDistSq = maxRadius * maxRadius;

        for (let i = 0; i < house.furniture.length; i++) {
            let item = house.furniture[i];
            let cat = catTable[item.id] || { w: 60, h: 50 };
            let rot = (((item.rotation !== undefined ? item.rotation : item.rot) || 0) % 4 + 4) % 4;
            let isIso = (cat.isIsometric || item.id === 'sedir');
            let isTransposed = !isIso && (rot === 1 || rot === 3);
            let effW = isTransposed ? cat.h : cat.w;
            let effH = isTransposed ? cat.w : (isIso ? (cat.isoH || 64) : cat.h);
            let left = item.x - effW / 2;
            let right = item.x + effW / 2;
            let top = item.y - effH / 2;
            let bottom = item.y + effH / 2;

            let isInside = (worldX >= left - 8 && worldX <= right + 8 && worldY >= top - 8 && worldY <= bottom + 8);

            let sitX = item.x;
            let sitY = item.y;
            let facing = 'down';
            let label = 'Mobilya';

            if (item.id === 'sedir') {
                if (rot === 0) {
                    let t = Math.max(-0.7, Math.min(0.7, ((worldX - item.x) + (worldY - item.y) * 2) / 48));
                    sitX = Math.round(item.x + t * 20);
                    sitY = Math.round(item.y + 4 + t * 10);
                    facing = 'down-right';
                } else if (rot === 1) {
                    let t = Math.max(-0.7, Math.min(0.7, ((worldX - item.x) - (worldY - item.y) * 2) / 48));
                    sitX = Math.round(item.x + t * 20);
                    sitY = Math.round(item.y + 4 - t * 10);
                    facing = 'down-left';
                } else if (rot === 2) {
                    let t = Math.max(-0.7, Math.min(0.7, ((worldX - item.x) + (worldY - item.y) * 2) / 48));
                    sitX = Math.round(item.x + t * 20);
                    sitY = Math.round(item.y - 4 + t * 10);
                    facing = 'up-left';
                } else if (rot === 3) {
                    let t = Math.max(-0.7, Math.min(0.7, ((worldX - item.x) - (worldY - item.y) * 2) / 48));
                    sitX = Math.round(item.x + t * 20);
                    sitY = Math.round(item.y - 4 - t * 10);
                    facing = 'up-right';
                }
                label = 'Otantik Şark Sediri';
            } else if (item.id === 'berjer') {
                let dirs = ['down', 'right', 'up', 'left'];
                facing = dirs[rot];
                label = 'Berjer';
            } else if (item.id === 'bilgisayar') {
                let dirs = ['up', 'left', 'down', 'right'];
                let offX = [0, 16, 0, -16][rot];
                let offY = [16, 0, -16, 0][rot];
                sitX = item.x + offX;
                sitY = item.y + offY;
                facing = dirs[rot];
                label = 'Çalışma Koltuğu';
            } else if (item.id === 'piyano') {
                sitX = item.x;
                sitY = item.y + 18;
                facing = 'up';
                label = 'Piyano Taburesi';
            } else if (item.id === 'yemek_masasi') {
                let isTop = (worldY < item.y);
                sitX = worldX < item.x ? item.x - 20 : item.x + 20;
                sitY = isTop ? item.y - 18 : item.y + 18;
                facing = isTop ? 'down' : 'up';
                label = 'Yemek Sandalyesi';
            } else {
                continue;
            }

            if (isInside) {
                return { x: sitX, y: sitY, facing: facing, label: label };
            }

            let dx = worldX - sitX;
            let dy = worldY - sitY;
            let d2 = dx * dx + dy * dy;
            if (d2 < minDistSq) {
                minDistSq = d2;
                bestSeat = { x: sitX, y: sitY, facing: facing, label: label };
            }
        }
        if (bestSeat) return bestSeat;
    }

    return null;
}

/**
 * Oyuncuyu tespit edilen en yakın koltuğa oturtur ve oyun masasıysa ekranını açar.
 * @returns {boolean} Oturma gerçekleştiyse true
 */
function checkAndSitOnNearestFurnitureOrChair() {
    let seat = findNearestSittableSeat();
    if (seat && typeof sitPlayerAt === 'function') {
        sitPlayerAt(seat.x, seat.y, seat.facing);
        openGameForSeat(seat);
        return true;
    }
    return false;
}

// Global Erişim İçin window Nesnesine Kaydet
window.STATIC_ROOM_SEATS = STATIC_ROOM_SEATS;
window.findNearestSittableSeat = findNearestSittableSeat;
window.findSeatAtCoordinates = findSeatAtCoordinates;
window.checkAndSitOnNearestFurnitureOrChair = checkAndSitOnNearestFurnitureOrChair;
