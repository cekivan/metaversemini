// public/js/renderers/renderAvmShops.js - Grand Sahil AVM 6 Özel Dükkan İç Mekan Render Motoru
// (Oyuncuların dükkanın içine girip görevli NPC'ler ile doğrudan karşı karşıya geldiği butik simülasyonu)

(function () {
    const CANV_W = 1000;
    const CANV_H = 625;

    // 6 Dükkanın Genel Yapılandırması
    const SHOPS = {
        avm_magaza_kiyafet: {
            id: 'avm_magaza_kiyafet',
            parentFloor: 'avm_kat1',
            storeName: 'CADDE MODA | Streetwear & Casual',
            themeColor: '#ec4899',
            badgeBg: 'rgba(236, 72, 153, 0.15)',
            floorType: 'rose_oak',
            category: 'tshirts',
            npc: {
                name: 'Selin',
                title: 'Moda Danışmanı',
                quote: 'Hoş geldiniz! En yeni sokak modası ve tişört koleksiyonum burada ✨',
                avatar: {
                    model: 'classic_2',
                    skinColor: '#ffe4e6',
                    isFemale: true,
                    gender: 'female',
                    hat: 'hair_bob',
                    outfit: null,
                    color: '#ec4899',
                    shirt: '#f43f5e',
                    pants: 'pants_k2_denim_flare',
                    shoes: 'sneakers',
                    action: 'idle'
                }
            }
        },
        avm_magaza_sneaker: {
            id: 'avm_magaza_sneaker',
            parentFloor: 'avm_kat1',
            storeName: 'SNEAKER LAB | Ayakkabı Dünyası',
            themeColor: '#0ea5e9',
            badgeBg: 'rgba(14, 165, 233, 0.15)',
            floorType: 'carbon_tile',
            category: 'shoes',
            npc: {
                name: 'Bora',
                title: 'Sneakerhead',
                quote: 'Selam kanka! Özel sneakerlar ve sokak botları vitrinde 👟',
                avatar: {
                    model: 'classic_2',
                    skinColor: '#ffd1a4',
                    gender: 'male',
                    hat: 'k2_skater_bucket',
                    outfit: null,
                    color: '#0284c7',
                    shirt: 'k2_cyber_street',
                    pants: 'pants_k2_skater_cargo',
                    shoes: 'shoes_k2_chunky_sneaker',
                    action: 'idle'
                }
            }
        },
        avm_magaza_sapka: {
            id: 'avm_magaza_sapka',
            parentFloor: 'avm_kat1',
            storeName: 'HEADWEAR CO. | Şapka & Bere Evi',
            themeColor: '#eab308',
            badgeBg: 'rgba(234, 179, 8, 0.15)',
            floorType: 'timber_herringbone',
            category: 'hats',
            npc: {
                name: 'Caner',
                title: 'Şapkacı',
                quote: 'Tarzınıza hava katacak en şık şapkalar ve bereler hazır 🧢',
                avatar: {
                    model: 'classic_2',
                    skinColor: '#fde047',
                    gender: 'male',
                    hat: 'bere',
                    face: 'mustache',
                    outfit: null,
                    color: '#d97706',
                    shirt: '#d97706',
                    pants: 'pants_classic_jeans',
                    shoes: 'sneakers',
                    action: 'idle'
                }
            }
        },
        avm_magaza_takim: {
            id: 'avm_magaza_takim',
            parentFloor: 'avm_kat2',
            storeName: 'SARTORIA MILANO | Özel Dikim Smokin & Gala',
            themeColor: '#a855f7',
            badgeBg: 'rgba(168, 85, 247, 0.15)',
            floorType: 'royal_velvet_mahogany',
            category: 'outfits',
            npc: {
                name: 'Centilmen Marco',
                title: 'Özel Dikim & Smokin Şefi',
                quote: 'Buona sera! En asil İtalyan smokinleri ve gala elbiseleri emrinizde 🤵',
                avatar: {
                    model: 'classic_2',
                    skinColor: '#ffd1a4',
                    gender: 'male',
                    hat: 'kasket',
                    face: 'mustache',
                    outfit: 'outfit_c2_gentleman',
                    color: '#1e1b4b',
                    shoes: 'boots',
                    action: 'idle'
                }
            }
        },
        avm_magaza_saat: {
            id: 'avm_magaza_saat',
            parentFloor: 'avm_kat2',
            storeName: 'CHRONOS HAUTE HORLOGERIE | VIP Saat & Mücevher',
            themeColor: '#38bdf8',
            badgeBg: 'rgba(56, 189, 248, 0.15)',
            floorType: 'sapphire_obsidian',
            category: 'watches',
            npc: {
                name: 'Artin Usta',
                title: 'Saat Üstadı',
                quote: 'Zaman paha biçilemez evlat. Karakter 2 için özel Astral Tourbillon saatimiz geldi ⌚',
                avatar: {
                    model: 'classic_2',
                    skinColor: '#fde047',
                    gender: 'male',
                    hat: 'sihirbaz',
                    face: 'sunglasses',
                    watch: 'watch_k2_tourbillon_astral',
                    outfit: 'outfit_c2_gentleman',
                    color: '#0369a1',
                    shoes: 'boots',
                    action: 'idle'
                }
            }
        },
        avm_magaza_berber: {
            id: 'avm_magaza_berber',
            parentFloor: 'avm_kat2',
            storeName: 'SALON DE PARIS | VIP Kuaför & Berber',
            themeColor: '#ef4444',
            badgeBg: 'rgba(239, 68, 68, 0.15)',
            floorType: 'checkerboard',
            category: 'faces',
            npc: {
                name: 'Kuaför Arda',
                title: 'Baş Stilist & Berber',
                quote: 'Saç ve sakal stiline hava katmaya hazır mısın? Koltuğa buyur 💈',
                avatar: {
                    model: 'classic_2',
                    skinColor: '#ffd1a4',
                    gender: 'male',
                    hat: 'hair_k2_fade_pompadour',
                    face: 'viking_beard',
                    outfit: null,
                    color: '#18181b',
                    shirt: '#18181b',
                    pants: 'pants_classic_black',
                    shoes: 'sneakers',
                    action: 'idle'
                }
            }
        }
    };

    /**
     * Statik Mağaza İç Mekanını Çizen Fonksiyon (bgCache Dostu)
     */
    function renderStaticShopInteriorTo(bctx, shopId, width, height) {
        bctx.clearRect(0, 0, width, height);
        const shop = SHOPS[shopId];
        if (!shop) return;

        // Berber Dükkanı ("Salon De Paris") İçin Özel VIP Mimari Çizim
        if (shopId === 'avm_magaza_berber') {
            drawBarberShopInterior(bctx, shop, width, height);
            return;
        }

        // 1. Zemin Döşemesi (Mağaza Konseptine Özel)
        drawShopFloor(bctx, shop.floorType, width, height);

        // 2. Arka Duvar & LED Mağaza Başlığı (y: 0..120)
        let wallGrad = bctx.createLinearGradient(0, 0, 0, 120);
        wallGrad.addColorStop(0, "#090d16");
        wallGrad.addColorStop(1, "#1e293b");
        bctx.fillStyle = wallGrad;
        bctx.fillRect(0, 0, width, 120);

        // Altın/Neon Vurgu Çıtası
        bctx.fillStyle = shop.themeColor;
        bctx.fillRect(0, 118, width, 4);

        // Mağaza LED Tabelası
        bctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        bctx.beginPath();
        bctx.roundRect(width / 2 - 280, 20, 560, 48, 12);
        bctx.fill();
        bctx.strokeStyle = shop.themeColor;
        bctx.lineWidth = 2.5;
        bctx.stroke();

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 17px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText(shop.storeName, width / 2, 51);

        // 3. Yan Duvarlar & Reyon Rafları
        drawShopRacksAndVitrines(bctx, shop, width, height);

        // 4. MERKEZİ TEZGAH (Banko): x: 360..640, y: 250..305
        drawShopCounter(bctx, shop, width / 2, 280);

        // 5. Güney Çıkış Kapıları (AVM Koridoruna Dönüş)
        let exitW = 140, exitH = 26;
        let exitX = (width - exitW) / 2;
        let exitY = height - exitH;

        bctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.fillStyle = "#38bdf8";
        bctx.fillRect(exitX, exitY, exitW, 3);

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 11px sans-serif";
        bctx.textAlign = "center";
        let exitFloorText = (shop.parentFloor === 'avm_kat1') ? "🚪 AVM ZEMİN KATA DÖN ⬇" : "🚪 AVM 1. KATA DÖN ⬇";
        bctx.fillText(exitFloorText, width / 2, height - 8);

        // Çıkış Paspası
        bctx.fillStyle = "#334155";
        bctx.beginPath();
        bctx.roundRect(exitX + 15, height - 52, exitW - 30, 22, 4);
        bctx.fill();
        bctx.strokeStyle = shop.themeColor;
        bctx.lineWidth = 1.2;
        bctx.stroke();

        bctx.fillStyle = shop.themeColor;
        bctx.font = "bold 8.5px sans-serif";
        bctx.fillText("ÇIKIŞ", width / 2, height - 38);
    }

    /**
     * Mağaza Zemini Çizimi
     */
    function drawShopFloor(bctx, floorType, width, height) {
        if (floorType === 'rose_oak') {
            // Pudra / Açık Pembe Meşe Parke
            let grad = bctx.createLinearGradient(0, 120, 0, height);
            grad.addColorStop(0, "#fdf2f8");
            grad.addColorStop(1, "#fce7f3");
            bctx.fillStyle = grad;
            bctx.fillRect(0, 120, width, height - 120);

            bctx.strokeStyle = "rgba(244, 114, 182, 0.25)";
            bctx.lineWidth = 1;
            for (let y = 120; y <= height; y += 45) {
                bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(width, y); bctx.stroke();
            }
        } else if (floorType === 'carbon_tile') {
            // Koyu Karbon Fayans & Neon Cyan Çizgiler
            bctx.fillStyle = "#0f172a";
            bctx.fillRect(0, 120, width, height - 120);

            bctx.strokeStyle = "rgba(14, 165, 233, 0.2)";
            bctx.lineWidth = 1.2;
            for (let x = 0; x <= width; x += 50) {
                bctx.beginPath(); bctx.moveTo(x, 120); bctx.lineTo(x, height); bctx.stroke();
            }
            for (let y = 120; y <= height; y += 50) {
                bctx.beginPath(); bctx.moveTo(0, y); bctx.lineTo(width, y); bctx.stroke();
            }
        } else if (floorType === 'checkerboard') {
            // Siyah-Beyaz Kuaför Damalı Zemin (Mat Antrasit & Açık Mermer)
            let size = 40;
            for (let y = 120; y < height; y += size) {
                for (let x = 0; x < width; x += size) {
                    let gx = Math.floor(x / size);
                    let gy = Math.floor((y - 120) / size);
                    let isBlack = (gx + gy) % 2 === 0;
                    bctx.fillStyle = isBlack ? "#18181b" : "#f1f5f9";
                    bctx.fillRect(x, y, size, size);

                    // Fayans Derz Çizgileri
                    bctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
                    bctx.lineWidth = 0.8;
                    bctx.strokeRect(x, y, size, size);
                }
            }
        } else if (floorType === 'royal_velvet_mahogany') {
            // Maun Zemin & Kraliyet Kırmızı Kadife Halı
            bctx.fillStyle = "#451a03";
            bctx.fillRect(0, 120, width, height - 120);

            // Merkez Kırmızı Halı
            let carpetGrad = bctx.createLinearGradient(320, 0, 680, 0);
            carpetGrad.addColorStop(0, "#881337");
            carpetGrad.addColorStop(0.5, "#9f1239");
            carpetGrad.addColorStop(1, "#881337");
            bctx.fillStyle = carpetGrad;
            bctx.fillRect(320, 120, 360, height - 120);

            bctx.strokeStyle = "#facc15";
            bctx.lineWidth = 3;
            bctx.beginPath();
            bctx.moveTo(320, 120); bctx.lineTo(320, height);
            bctx.moveTo(680, 120); bctx.lineTo(680, height);
            bctx.stroke();
        } else if (floorType === 'sapphire_obsidian') {
            // Obsidyen & Safir Mermer
            let grad = bctx.createLinearGradient(0, 120, width, height);
            grad.addColorStop(0, "#020617");
            grad.addColorStop(0.5, "#082f49");
            grad.addColorStop(1, "#020617");
            bctx.fillStyle = grad;
            bctx.fillRect(0, 120, width, height - 120);

            bctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
            bctx.lineWidth = 1.5;
            for (let x = 0; x <= width; x += 60) {
                bctx.beginPath(); bctx.moveTo(x, 120); bctx.lineTo(x, height); bctx.stroke();
            }
        } else {
            // Ahşap Balıksırtı
            let grad = bctx.createLinearGradient(0, 120, 0, height);
            grad.addColorStop(0, "#78350f");
            grad.addColorStop(1, "#92400e");
            bctx.fillStyle = grad;
            bctx.fillRect(0, 120, width, height - 120);
        }
    }

    /**
     * Yan Raflar, Askılıklar ve Vitrinler
     */
    function drawShopRacksAndVitrines(bctx, shop, width, height) {
        // Sol Duvar Rafı (x: 40..240, y: 140..460)
        bctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        bctx.beginPath();
        bctx.roundRect(40, 140, 200, 320, 12);
        bctx.fill();
        bctx.strokeStyle = shop.themeColor;
        bctx.lineWidth = 2;
        bctx.stroke();

        // Sol Raf Bölmeleri
        for (let y = 190; y <= 420; y += 65) {
            bctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            bctx.fillRect(50, y, 180, 4);
        }

        bctx.fillStyle = shop.themeColor;
        bctx.font = "bold 11px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("ÖZEL KOLEKSİYON", 140, 168);

        // Sağ Duvar Rafı / Prova Kabini (x: width - 240..width - 40, y: 140..460)
        let rx = width - 240;
        bctx.fillStyle = "rgba(15, 23, 42, 0.85)";
        bctx.beginPath();
        bctx.roundRect(rx, 140, 200, 320, 12);
        bctx.fill();
        bctx.strokeStyle = shop.themeColor;
        bctx.lineWidth = 2;
        bctx.stroke();

        for (let y = 190; y <= 420; y += 65) {
            bctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            bctx.fillRect(rx + 10, y, 180, 4);
        }

        bctx.fillStyle = shop.themeColor;
        bctx.font = "bold 11px sans-serif";
        bctx.fillText("VİTRİN & KABİN", rx + 100, 168);
    }

    /**
     * Merkezi Banko / Tezgah
     */
    function drawShopCounter(bctx, shop, cx, cy) {
        let cw = 280, ch = 52;
        let x = cx - cw / 2;
        let y = cy - ch / 2;

        bctx.save();
        // Tezgah Gövdesi (Lüks Ahşap & Mermer)
        let cGrad = bctx.createLinearGradient(x, 0, x + cw, 0);
        cGrad.addColorStop(0, "#1e293b");
        cGrad.addColorStop(0.5, "#334155");
        cGrad.addColorStop(1, "#1e293b");
        bctx.fillStyle = cGrad;
        bctx.beginPath();
        bctx.roundRect(x, y, cw, ch, 8);
        bctx.fill();

        // Tezgah Üst Tabla (Pirinç & Cam)
        bctx.strokeStyle = shop.themeColor;
        bctx.lineWidth = 3;
        bctx.stroke();

        // Yazar Kasa / Pos Cihazı (Sağda)
        bctx.fillStyle = "#0f172a";
        bctx.beginPath();
        bctx.roundRect(cx + 60, y + 8, 38, 26, 4);
        bctx.fill();
        bctx.fillStyle = "#22c55e";
        bctx.fillRect(cx + 65, y + 14, 28, 8);

        // Butik Alışveriş Çantası (Solda)
        bctx.fillStyle = shop.themeColor;
        bctx.beginPath();
        bctx.roundRect(cx - 95, y + 8, 30, 30, 4);
        bctx.fill();
        bctx.strokeStyle = "#ffffff";
        bctx.lineWidth = 1.5;
        bctx.beginPath();
        bctx.arc(cx - 80, y + 8, 7, Math.PI, 0);
        bctx.stroke();

        // Tezgah Üzerinde Mağaza Logosu
        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 11px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("DANISMA & ODEME", cx, y + 32);
        bctx.restore();
    }

    // =========================================================================
    // SALON DE PARIS | VIP KUAFÖR & BERBER ÖZEL ÇİZİM FONKSİYONLARI
    // =========================================================================

    /**
     * Dönen Nostaljik Berber Direği (Barber Pole)
     */
    function drawBarberPole(ctx, x, y, now) {
        ctx.save();
        // Altın Pirinç Başlıklar
        ctx.fillStyle = "#d4af37";
        ctx.beginPath();
        ctx.arc(x, y - 26, 7, 0, Math.PI * 2);
        ctx.arc(x, y + 26, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#1e293b";
        ctx.fillRect(x - 6, y - 24, 12, 48);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - 5, y - 22, 10, 44);

        let offset = (now / 35) % 20;
        ctx.save();
        ctx.beginPath();
        ctx.rect(x - 5, y - 22, 10, 44);
        ctx.clip();

        for (let i = -24; i < 60; i += 12) {
            let py = y - 22 + i - offset;
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(x - 5, py, 10, 5);
            ctx.fillStyle = "#0284c7";
            ctx.fillRect(x - 5, py + 5, 10, 5);
        }
        ctx.restore();

        // Cam Yansıma & Çerçeve
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.2;
        ctx.strokeRect(x - 5, y - 22, 10, 44);
        ctx.restore();
    }

    /**
     * Berber Aynası ve Mermer İstasyonu
     */
    function drawBarberStation(bctx, cx, stationTitle) {
        let mw = 140, mh = 120;
        let mx = cx - mw / 2, my = 126;

        // 1. Kemerli Dev Berber Aynası (LED Arkadan Aydınlatmalı)
        bctx.save();
        bctx.shadowColor = "rgba(239, 68, 68, 0.35)";
        bctx.shadowBlur = 16;
        bctx.fillStyle = "#d4af37"; // Altın Varak Dış Çerçeve
        bctx.beginPath();
        bctx.roundRect(mx - 4, my - 4, mw + 8, mh + 8, [50, 50, 6, 6]);
        bctx.fill();
        bctx.restore();

        // Ayna Camı & Yansıma
        let mirrorGrad = bctx.createLinearGradient(mx, my, mx + mw, my + mh);
        mirrorGrad.addColorStop(0, "#1e293b");
        mirrorGrad.addColorStop(0.5, "#0f172a");
        mirrorGrad.addColorStop(1, "#1e293b");
        bctx.fillStyle = mirrorGrad;
        bctx.beginPath();
        bctx.roundRect(mx, my, mw, mh, [46, 46, 4, 4]);
        bctx.fill();

        // Ayna Çapraz Işık Yansıması
        bctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        bctx.beginPath();
        bctx.moveTo(mx + 20, my);
        bctx.lineTo(mx + 60, my);
        bctx.lineTo(mx + 10, my + mh);
        bctx.lineTo(mx - 30, my + mh);
        bctx.fill();

        // Ayna Başlık Rozeti
        bctx.fillStyle = "rgba(15, 23, 42, 0.9)";
        bctx.beginPath();
        bctx.roundRect(cx - 55, my + 10, 110, 18, 4);
        bctx.fill();
        bctx.strokeStyle = "#ef4444";
        bctx.lineWidth = 1;
        bctx.stroke();

        bctx.fillStyle = "#f8fafc";
        bctx.font = "bold 8.5px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText(stationTitle, cx, my + 22);

        // 2. İtalyan Mermeri Kuaför Tezgahı (cx: 275..445 veya 555..725)
        let tw = 166, th = 36;
        let tx = cx - tw / 2, ty = 248;

        // Tezgah Gövdesi
        let tGrad = bctx.createLinearGradient(tx, ty, tx + tw, ty);
        tGrad.addColorStop(0, "#090d16");
        tGrad.addColorStop(0.5, "#1e293b");
        tGrad.addColorStop(1, "#090d16");
        bctx.fillStyle = tGrad;
        bctx.beginPath();
        bctx.roundRect(tx, ty, tw, th, 6);
        bctx.fill();

        // Üst Mermer Tabla & Altın Çıta
        bctx.fillStyle = "#d4af37";
        bctx.fillRect(tx, ty, tw, 3);

        // İki Adet Altın Kulplu Çekmece
        bctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        bctx.lineWidth = 1;
        bctx.strokeRect(tx + 12, ty + 8, 64, 20);
        bctx.strokeRect(tx + 90, ty + 8, 64, 20);

        bctx.fillStyle = "#d4af37";
        bctx.beginPath();
        bctx.arc(tx + 44, ty + 18, 2.5, 0, Math.PI * 2);
        bctx.arc(tx + 122, ty + 18, 2.5, 0, Math.PI * 2);
        bctx.fill();

        // 3. Tezgah Üstü Aksesuarlar
        // Krom Fön Makinesi (Solda)
        bctx.fillStyle = "#334155";
        bctx.beginPath();
        bctx.roundRect(tx + 16, ty - 8, 14, 8, 2);
        bctx.fill();
        bctx.fillStyle = "#0f172a";
        bctx.fillRect(tx + 28, ty - 6, 8, 4);

        // Cam Barbicide Dezenfektan Kavanozu (Mavi Sıvı & Makaslar)
        bctx.fillStyle = "rgba(14, 165, 233, 0.7)";
        bctx.beginPath();
        bctx.roundRect(tx + 54, ty - 12, 10, 12, 2);
        bctx.fill();
        bctx.fillStyle = "#cbd5e1"; // Makas kulpları
        bctx.fillRect(tx + 56, ty - 16, 2, 5);
        bctx.fillRect(tx + 60, ty - 16, 2, 5);

        // Parfüm / Sprey Şişesi
        bctx.fillStyle = "#ef4444";
        bctx.beginPath();
        bctx.roundRect(tx + 80, ty - 10, 8, 10, 2);
        bctx.fill();
        bctx.fillStyle = "#d4af37";
        bctx.fillRect(tx + 82, ty - 13, 4, 3);

        // Katlanmış Temiz Beyaz Havlular (Sağda)
        for (let i = 0; i < 3; i++) {
            bctx.fillStyle = "#f8fafc";
            bctx.beginPath();
            bctx.roundRect(tx + 120, ty - 4 - (i * 4), 22, 4, 1.5);
            bctx.fill();
            bctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
            bctx.lineWidth = 0.5;
            bctx.stroke();
        }
    }

    /**
     * Kuaför Arda Karşılama Bankosu
     */
    function drawBarberReceptionCounter(bctx, cx, cy) {
        let cw = 84, ch = 36;
        let x = cx - cw / 2, y = cy - ch / 2;

        bctx.save();
        let grad = bctx.createLinearGradient(x, 0, x + cw, 0);
        grad.addColorStop(0, "#18181b");
        grad.addColorStop(0.5, "#27272a");
        grad.addColorStop(1, "#18181b");
        bctx.fillStyle = grad;
        bctx.beginPath();
        bctx.roundRect(x, y, cw, ch, 6);
        bctx.fill();

        bctx.strokeStyle = "#ef4444";
        bctx.lineWidth = 2;
        bctx.stroke();

        // Altın Masa Zili
        bctx.fillStyle = "#d4af37";
        bctx.beginPath();
        bctx.arc(cx - 20, y + 8, 4, Math.PI, 0);
        bctx.fill();
        bctx.fillRect(cx - 23, y + 8, 6, 2);

        // Randevu Defteri
        bctx.fillStyle = "#f8fafc";
        bctx.fillRect(cx + 6, y + 4, 18, 12);
        bctx.strokeStyle = "#334155";
        bctx.lineWidth = 0.8;
        bctx.strokeRect(cx + 6, y + 4, 18, 12);

        // Ön Tabela
        bctx.fillStyle = "#f8fafc";
        bctx.font = "bold 8px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("DANIŞMA", cx, y + 26);
        bctx.restore();
    }

    /**
     * Sol Yıkama & Şampuan Ünitesi
     */
    function drawBarberWashUnit(bctx, cx, cy) {
        // Duvardaki 3 Katlı Şampuan & Keratin Rafları (x: 55..215, y: 135..195)
        for (let r = 0; r < 3; r++) {
            let ry = 145 + r * 20;
            bctx.fillStyle = "rgba(255, 255, 255, 0.2)";
            bctx.fillRect(55, ry, 155, 2.5);

            // Renkli Şampuan Şişeleri
            const colors = ["#22c55e", "#06b6d4", "#ec4899", "#f59e0b", "#8b5cf6", "#ef4444", "#3b82f6"];
            for (let s = 0; s < 7; s++) {
                bctx.fillStyle = colors[(s + r) % colors.length];
                bctx.beginPath();
                bctx.roundRect(65 + s * 20, ry - 11, 8, 11, 1.5);
                bctx.fill();
            }
        }

        // Yıkama Lavabosu (Siyah Seramik)
        bctx.fillStyle = "#020617";
        bctx.beginPath();
        bctx.ellipse(cx, 235, 28, 16, 0, 0, Math.PI * 2);
        bctx.fill();
        bctx.strokeStyle = "#475569";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        // Boyun Çentiği & Krom Musluk
        bctx.fillStyle = "#334155";
        bctx.fillRect(cx - 7, 246, 14, 5);
        bctx.fillStyle = "#cbd5e1";
        bctx.beginPath();
        bctx.arc(cx, 225, 4, 0, Math.PI * 2);
        bctx.fill();

        // Yatar Deri Yıkama Koltuğu
        bctx.fillStyle = "#1e293b";
        bctx.beginPath();
        bctx.roundRect(cx - 24, 255, 48, 55, 8);
        bctx.fill();
        bctx.strokeStyle = "#334155";
        bctx.lineWidth = 1;
        bctx.stroke();

        bctx.fillStyle = "#64748b";
        bctx.font = "bold 8.5px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("ŞAMPUAN & BAKIM", cx, 325);
    }

    /**
     * Sağ Bekleme Lounge'ı
     */
    function drawBarberLounge(bctx, cx, cy) {
        // Bordo Chesterfield Deri Kanepe (x: 790..940, y: 195..265)
        let sx = cx - 75, sy = 200, sw = 150, sh = 65;
        bctx.fillStyle = "#881337"; // Bordo Deri
        bctx.beginPath();
        bctx.roundRect(sx, sy, sw, sh, 10);
        bctx.fill();

        // Kapitone Düğmeleri
        bctx.fillStyle = "#4c0519";
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 6; col++) {
                bctx.beginPath();
                bctx.arc(sx + 15 + col * 24, sy + 18 + row * 22, 2.5, 0, Math.PI * 2);
                bctx.fill();
            }
        }

        // Cam Dergilik Sehpa
        let tx = cx - 50, ty = 280, tw = 100, th = 30;
        bctx.fillStyle = "rgba(14, 165, 233, 0.25)";
        bctx.beginPath();
        bctx.roundRect(tx, ty, tw, th, 4);
        bctx.fill();
        bctx.strokeStyle = "#d4af37";
        bctx.lineWidth = 1.5;
        bctx.stroke();

        // Dergiler (Vogue / GQ)
        bctx.fillStyle = "#ffffff";
        bctx.fillRect(tx + 14, ty + 6, 22, 16);
        bctx.fillStyle = "#ef4444";
        bctx.fillRect(tx + 46, ty + 8, 22, 16);

        bctx.fillStyle = "#d4af37";
        bctx.font = "bold 8.5px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("VIP BEKLEME SALONU", cx, ty + 46);
    }

    /**
     * Salon De Paris Özel Statik İç Mekan Çizimi
     */
    function drawBarberShopInterior(bctx, shop, width, height) {
        // 1. Zemin: Siyah-Beyaz Kuaför Damalı Zemin
        drawShopFloor(bctx, 'checkerboard', width, height);

        // 2. Arka Duvar & LED Tabela
        let wallGrad = bctx.createLinearGradient(0, 0, 0, 125);
        wallGrad.addColorStop(0, "#090d16");
        wallGrad.addColorStop(1, "#18181b");
        bctx.fillStyle = wallGrad;
        bctx.fillRect(0, 0, width, 125);

        // Kırmızı / Altın LED Çıta
        bctx.fillStyle = "#ef4444";
        bctx.fillRect(0, 122, width, 3);
        bctx.fillStyle = "#d4af37";
        bctx.fillRect(0, 120, width, 1.5);

        // Salon De Paris LED Tabelası
        bctx.fillStyle = "rgba(15, 23, 42, 0.96)";
        bctx.beginPath();
        bctx.roundRect(width / 2 - 290, 18, 580, 52, 12);
        bctx.fill();
        bctx.strokeStyle = "#ef4444";
        bctx.lineWidth = 2.5;
        bctx.stroke();

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 17px 'Segoe UI', sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("💈 SALON DE PARIS | VIP Kuaför & Berber 💈", width / 2, 43);

        bctx.fillStyle = "#cbd5e1";
        bctx.font = "11px 'Segoe UI', sans-serif";
        bctx.fillText("Baş Stilist Arda | Saç Tasarım, Sakal Bakımı & Saç Boyama", width / 2, 60);

        // 3. Sol Berber İstasyonu (x: 360)
        drawBarberStation(bctx, 360, "İSTASYON #1 | MASTER BARBER");

        // 4. Sağ Berber İstasyonu (x: 640)
        drawBarberStation(bctx, 640, "İSTASYON #2 | VIP COLORIST");

        // 5. Kuaför Arda Karşılama & Randevu Bankosu (x: 500, y: 250..284)
        drawBarberReceptionCounter(bctx, 500, 267);

        // 6. Sol Duvar - Yıkama & Şampuan Ünitesi
        drawBarberWashUnit(bctx, 135, 240);

        // 7. Sağ Duvar - VIP Bekleme Lounge'ı
        drawBarberLounge(bctx, 865, 255);

        // 8. Güney Çıkış Kapısı
        let exitW = 140, exitH = 26;
        let exitX = (width - exitW) / 2;
        let exitY = height - exitH;

        bctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        bctx.fillRect(exitX, exitY, exitW, exitH);
        bctx.fillStyle = "#ef4444";
        bctx.fillRect(exitX, exitY, exitW, 3);

        bctx.fillStyle = "#ffffff";
        bctx.font = "bold 11px sans-serif";
        bctx.textAlign = "center";
        bctx.fillText("🚪 AVM 1. KATA DÖN ⬇", width / 2, height - 8);

        // Çıkış Paspası
        bctx.fillStyle = "#1e293b";
        bctx.beginPath();
        bctx.roundRect(exitX + 15, height - 52, exitW - 30, 22, 4);
        bctx.fill();
        bctx.strokeStyle = "#ef4444";
        bctx.lineWidth = 1.2;
        bctx.stroke();

        bctx.fillStyle = "#ef4444";
        bctx.font = "bold 9px sans-serif";
        bctx.fillText("ÇIKIŞ", width / 2, height - 38);
    }

    /**
     * VIP Hidrolik Berber Koltuğu Çizimi
     */
    function drawBarberChair(ctx, cx, cy, now, players) {
        ctx.save();

        // 1. Zemin Gölgesi & Dairesel Krom Hidrolik Taban
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.beginPath();
        ctx.ellipse(cx, cy + 18, 28, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        let baseGrad = ctx.createLinearGradient(cx - 24, 0, cx + 24, 0);
        baseGrad.addColorStop(0, "#94a3b8");
        baseGrad.addColorStop(0.5, "#f8fafc");
        baseGrad.addColorStop(1, "#64748b");
        ctx.fillStyle = baseGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 14, 24, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Dikey Hidrolik Piston
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(cx - 4, cy + 3, 8, 11);

        // Metal Ayak Koyma Pedalı (Footrest)
        ctx.fillStyle = "#475569";
        ctx.fillRect(cx - 18, cy + 12, 36, 4);

        // Koltuk Dolgulu Oturma Minderi (Bordo Deri)
        let seatGrad = ctx.createLinearGradient(cx - 22, 0, cx + 22, 0);
        seatGrad.addColorStop(0, "#881337");
        seatGrad.addColorStop(0.5, "#be123c");
        seatGrad.addColorStop(1, "#881337");
        ctx.fillStyle = seatGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 22, cy - 8, 44, 16, 6);
        ctx.fill();
        ctx.strokeStyle = "#fb7185";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Krom Kolçaklar
        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.roundRect(cx - 25, cy - 14, 5, 18, 2);
        ctx.roundRect(cx + 20, cy - 14, 5, 18, 2);
        ctx.fill();

        // Koltuk Doluluk Kontrolü
        let isOccupied = false;
        if (players) {
            for (let pid in players) {
                let p = players[pid];
                if (p && (p.isSitting || p.sitting) && Math.hypot(p.x - cx, p.y - cy) <= 18) {
                    isOccupied = true;
                    break;
                }
            }
        }

        if (!isOccupied) {
            // Boş Koltuk: Sırtlık ve Baş Dayama Minderi
            let backGrad = ctx.createLinearGradient(cx - 18, 0, cx + 18, 0);
            backGrad.addColorStop(0, "#881337");
            backGrad.addColorStop(0.5, "#e11d48");
            backGrad.addColorStop(1, "#881337");
            ctx.fillStyle = backGrad;
            ctx.beginPath();
            ctx.roundRect(cx - 19, cy - 28, 38, 20, [8, 8, 2, 2]);
            ctx.fill();
            ctx.strokeStyle = "#fb7185";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Baş Dayama
            ctx.fillStyle = "#9f1239";
            ctx.beginPath();
            ctx.roundRect(cx - 11, cy - 35, 22, 8, 3);
            ctx.fill();
        } else {
            // Oturan Oyuncu İçin Boyundan Dökülen Lüks Berber Kesim Pelerini
            ctx.fillStyle = "#881337";
            ctx.beginPath();
            ctx.ellipse(cx, cy + 4, 25, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#e11d48";
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * DİNAMİK MAĞAZA ÇEVRESİ & KARŞI KARŞIYA DURAN GÖREVLİ NPC
     */
    function drawAvmShopEnvironment(shopId) {
        if (typeof ctx === 'undefined' || !ctx || typeof canvas === 'undefined' || !canvas) return;
        const shop = SHOPS[shopId];
        if (!shop) return;

        // 1. Önbellekli Statik Arka Planı Çiz
        if (typeof bgCache !== 'undefined') {
            let bg = bgCache.getCanvas(shopId, canvas.width, canvas.height);
            ctx.drawImage(bg, 0, 0);
        }

        const now = Date.now();
        const myP = (typeof myId !== 'undefined' && typeof players !== 'undefined') ? players[myId] : null;

        // 2. GÖREVLİ NPC: TEZGAHIN ARKASINDA OYUNCUYLA TAM KARŞI KARŞIYA
        let npcArenaY = (shopId === 'avm_magaza_berber') ? 232 : 220;
        drawFacingShopNPC(ctx, shop, 500, npcArenaY, now, myP);

        // 3. Kuaför Dükkanında Dönen Berber Direkleri ve VIP Berber Koltukları
        if (shopId === 'avm_magaza_berber') {
            // Dönen İki Berber Direği (Sol & Sağ Duvarlar)
            drawBarberPole(ctx, 245, 195, now);
            drawBarberPole(ctx, 755, 195, now);

            // 2 Adet VIP Hidrolik Berber Koltuğu (x: 360, y: 380) ve (x: 640, y: 380)
            const allP = (typeof players !== 'undefined') ? players : null;
            drawBarberChair(ctx, 360, 380, now, allP);
            drawBarberChair(ctx, 640, 380, now, allP);
        }
    }

    /**
     * Oyuncuyla Tam Karşı Karşıya Bakan NPC Çizimi
     */
    function drawFacingShopNPC(ctx, shop, x, y, now, myP) {
        ctx.save();
        let npc = shop.npc;

        // 1. Zemin Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(x, y + 14, 15, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. NPC Avatarı: Tam karşıya (DOWN) bakar!
        let breathBob = Math.sin(now / 400) * 0.8;
        let pY = y + breathBob;

        if (typeof drawClassic2Avatar === 'function') {
            drawClassic2Avatar(ctx, x, pY, npc.avatar, 'down', false, 0, 0, false, false);
        } else {
            // Fallback
            if (typeof drawAvatarLegsAndShoes === 'function') drawAvatarLegsAndShoes(ctx, x, pY, 0, npc.avatar.skinColor, npc.avatar.shoes || 'sneakers', false, false, 'down', false, npc.avatar.color);
            if (typeof drawAvatarBodyAndClothes === 'function') drawAvatarBodyAndClothes(ctx, x, pY, npc.avatar.color, npc.avatar.skinColor, 'down', false);
            if (typeof drawAvatarFaceAndEyes === 'function') drawAvatarFaceAndEyes(ctx, x, pY, npc.avatar.face || 'none', 0, 0, 'down');
            if (typeof drawAvatarHairAndHats === 'function') drawAvatarHairAndHats(ctx, x, pY, npc.avatar.hat || 'none', 'down');
        }

        // 3. İsim ve Başlık Rozeti (Nametag)
        let badgeY = pY - 34;
        ctx.fillStyle = "rgba(15, 23, 42, 0.94)";
        ctx.beginPath();
        ctx.roundRect(x - 70, badgeY - 14, 140, 26, 6);
        ctx.fill();
        ctx.strokeStyle = shop.themeColor;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 10.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(npc.name, x, badgeY - 1);

        ctx.fillStyle = shop.themeColor;
        ctx.font = "8.5px sans-serif";
        ctx.fillText(npc.title, x, badgeY + 9);

        // 4. Konuşma Balonu (Her Zaman Aktif & Oyuncuyu Karşılar)
        let bubbleY = badgeY - 32;
        let bPulse = Math.sin(now / 300) * 2;
        ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
        ctx.beginPath();
        ctx.roundRect(x - 170, bubbleY - 14 + bPulse, 340, 28, 8);
        ctx.fill();
        ctx.strokeStyle = shop.themeColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Balon Oku
        ctx.fillStyle = "rgba(15, 23, 42, 0.96)";
        ctx.beginPath();
        ctx.moveTo(x - 6, bubbleY + 14 + bPulse);
        ctx.lineTo(x + 6, bubbleY + 14 + bPulse);
        ctx.lineTo(x, bubbleY + 20 + bPulse);
        ctx.fill();

        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText(`"${npc.quote}"`, x, bubbleY + 3 + bPulse);

        ctx.restore();
    }

    /**
     * Dükkan İçi Çarpışma Kontrolü (Collision) - MEKAN_TASARLAMA_REHBERI fx = x, fy = y + 21
     */
    function checkAvmShopCollision(shopId, x, y) {
        const fx = x;
        const fy = y + 21; // Ayak zemin temas çizgisi

        // Dış Duvar Sınırları
        if (fx < 45 || fx > 955) return true;
        if (fy < 145) return true; // Kuzey duvar süpürgeliği
        if (fy > 615 && !(fx >= 440 && fx <= 560)) return true; // Güney çıkış kapısı hariç

        // Berber Dükkanı Özel Çarpışma Haritası
        if (shopId === 'avm_magaza_berber') {
            // Sol Yıkama & Şampuan Ünitesi (fx: 40..220, fy: 160..360)
            if (fx >= 40 && fx <= 220 && fy >= 160 && fy <= 360) return true;

            // Sağ Bekleme Lounge Kanepe (fx: 780..960, fy: 210..350)
            if (fx >= 780 && fx <= 960 && fy >= 210 && fy <= 350) return true;

            // Kuaför Tezgahları & Arda'nın Karşılama Bankosu (fy: 265..305 bandı)
            if (fy >= 265 && fy <= 305) {
                // İstasyon 1 Tezgahı: fx: 270..450
                if (fx >= 270 && fx <= 450) return true;
                // Karşılama Bankosu: fx: 460..540
                if (fx >= 460 && fx <= 540) return true;
                // İstasyon 2 Tezgahı: fx: 550..730
                if (fx >= 550 && fx <= 730) return true;
            }
            return false;
        }

        // Genel Dükkanlar İçin Standart Reyonlar
        // Sol Reyon Masif Duvarı (fx: 40..240, fy: 160..480)
        if (fx >= 40 && fx <= 240 && fy >= 160 && fy <= 480) return true;

        // Sağ Reyon Masif Duvarı (fx: 760..960, fy: 160..480)
        if (fx >= 760 && fx <= 960 && fy >= 160 && fy <= 480) return true;

        // Merkezi Banko / Tezgah (fx: 355..645, fy: 265..325)
        if (fx >= 355 && fx <= 645 && fy >= 265 && fy <= 325) return true;

        return false;
    }

    /**
     * Dükkan İçi Tıklama Yönetimi
     */
    function handleAvmShopClick(shopId, clickX, clickY, p) {
        const shop = SHOPS[shopId];
        if (!shop) return false;

        // 1. Güney Çıkış Kapısına Tıklama (AVM Koridoruna Geri Dönüş)
        if (clickX >= 440 && clickX <= 560 && clickY >= 560) {
            if (typeof changeRoom === 'function') changeRoom(shop.parentFloor);
            return true;
        }

        // Berber Dükkanı Özel Tıklama Etkileşimleri
        if (shopId === 'avm_magaza_berber') {
            // Koltuk 1 (x: 360, y: 380) Tıklaması
            if (Math.hypot(clickX - 360, clickY - 380) <= 60) {
                if (typeof sitPlayerAt === 'function') sitPlayerAt(360, 380, 'up');
                if (typeof openBarberStudioModal === 'function') openBarberStudioModal();
                return true;
            }

            // Koltuk 2 (x: 640, y: 380) Tıklaması
            if (Math.hypot(clickX - 640, clickY - 380) <= 60) {
                if (typeof sitPlayerAt === 'function') sitPlayerAt(640, 380, 'up');
                if (typeof openBarberStudioModal === 'function') openBarberStudioModal();
                return true;
            }

            // Berber Aynalarına veya Tezgaha Tıklama
            if ((clickX >= 270 && clickX <= 450 && clickY >= 120 && clickY <= 285) ||
                (clickX >= 550 && clickX <= 730 && clickY >= 120 && clickY <= 285)) {
                if (typeof openBarberStudioModal === 'function') openBarberStudioModal();
                return true;
            }

            // Kuaför Arda'ya Tıklama
            if (Math.hypot(clickX - 500, clickY - 240) <= 80) {
                if (typeof openBarberStudioModal === 'function') openBarberStudioModal();
                return true;
            }
        }

        // 2. NPC'ye veya Tezgaha Tıklama (Kataloğu Doğrudan Aç)
        let distNpc = Math.hypot(clickX - 500, clickY - 260);
        if (distNpc <= 110 || (clickX >= 350 && clickX <= 650 && clickY >= 180 && clickY <= 320)) {
            if (typeof openAvmStore === 'function') {
                openAvmStore(shop.category, shop.npc.name.toLowerCase().split(' ')[0]);
            }
            return true;
        }

        return false;
    }

    /**
     * Dükkan İçi Mobil / E Tuşu Etkileşimi
     */
    function handleAvmShopMobileInteract(shopId, p) {
        if (!p) return false;
        const shop = SHOPS[shopId];
        if (!shop) return false;

        // Çıkış kapısı önündeyse çık
        if (p.y >= 570 && p.x >= 440 && p.x <= 560) {
            if (typeof changeRoom === 'function') changeRoom(shop.parentFloor);
            return true;
        }

        // Berber Dükkanı E tuşu / mobil etkileşimi
        if (shopId === 'avm_magaza_berber') {
            let distC1 = Math.hypot(p.x - 360, p.y - 380);
            let distC2 = Math.hypot(p.x - 640, p.y - 380);
            let distNpc = Math.hypot(p.x - 500, p.y - 300);

            if (distC1 <= 70 || distC2 <= 70 || distNpc <= 90 || p.isSitting) {
                if (distC1 <= 70 && typeof sitPlayerAt === 'function' && !p.isSitting) sitPlayerAt(360, 380, 'up');
                else if (distC2 <= 70 && typeof sitPlayerAt === 'function' && !p.isSitting) sitPlayerAt(640, 380, 'up');

                if (typeof openBarberStudioModal === 'function') {
                    openBarberStudioModal();
                    return true;
                }
            }
        }

        // Tezgah önündeyse mağazayı aç
        if (Math.hypot(p.x - 500, p.y - 310) <= 95) {
            if (typeof openAvmStore === 'function') {
                openAvmStore(shop.category, shop.npc.name.toLowerCase().split(' ')[0]);
            }
            return true;
        }

        return false;
    }

    /**
     * Dükkandan Yürüyerek Çıkış Koridoru Denetimi
     */
    function checkAvmShopPortalStep(shopId, p) {
        if (!p) return false;
        const shop = SHOPS[shopId];
        if (!shop) return false;

        // Güney kapısına adım atarsa AVM'ye dön
        if (p.y >= 585 && p.x >= 440 && p.x <= 560) {
            if (typeof changeRoom === 'function') changeRoom(shop.parentFloor);
            return true;
        }

        return false;
    }

    // Global Dışa Aktarımlar
    window.SHOPS = SHOPS;
    window.renderStaticShopInteriorTo = renderStaticShopInteriorTo;
    window.drawAvmShopEnvironment = drawAvmShopEnvironment;
    window.checkAvmShopCollision = checkAvmShopCollision;
    window.handleAvmShopClick = handleAvmShopClick;
    window.handleAvmShopMobileInteract = handleAvmShopMobileInteract;
    window.checkAvmShopPortalStep = checkAvmShopPortalStep;
})();

