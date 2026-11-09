// public/js/roomInteractions.js - Mekan Geçişleri, İnteraktif Objeler ve Kapı/Geçit Kayıt Yöneticisi
// (Spagetti if-else bloklarını ortadan kaldıran, bildirimsel ve yüksek performanslı etkileşim motoru)

(function () {
    const socket = window.socket || (typeof socket !== 'undefined' ? socket : null);

    /**
     * 1. YÜRÜYEREK KORİDOR VE KAPI GEÇİŞLERİ (SEAMLESS WALK PORTALS)
     * Her mekanın kenar sınırları veya kapı koridorları burada tek bir yapıda toplanmıştır.
     */
    const ROOM_WALK_PORTALS = {
        kafe: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ],
        sokak: [
            {
                check: (p, w, h) => p.x <= 20 && p.y >= 180 && p.y <= 330,
                target: 'sahil'
            },
            {
                check: (p, w, h) => p.x >= w - 20 && p.y >= 180 && p.y <= 330,
                target: 'cadde'
            },
            {
                check: (p, w, h) => p.x >= 165 && p.x <= 225 && p.y <= 95,
                target: 'emlakci'
            },
            {
                check: (p, w, h) => p.x >= 370 && p.x <= 430 && p.y <= 95,
                target: 'kafe'
            },
            {
                check: (p, w, h) => p.x >= 640 && p.x <= 700 && p.y <= 95,
                target: 'nargile_cafe'
            },
            {
                check: (p, w, h) => p.x >= 685 && p.x <= 750 && p.y >= 345 && p.y <= 405,
                target: 'market'
            }
        ],
        cadde: [
            {
                check: (p, w, h) => p.x <= 20 && p.y >= 140 && p.y <= 330,
                target: 'sokak'
            },
            {
                check: (p, w, h) => p.x >= w - 20 && p.y >= 140 && p.y <= 330,
                target: 'cadde2'
            },
            {
                check: (p, w, h) => p.x >= 200 && p.x <= 260 && p.y <= 95,
                target: 'ganyan'
            },
            {
                check: (p, w, h) => p.x >= 550 && p.x <= 610 && p.y <= 95,
                target: 'dedenin_yeri'
            },
            {
                check: (p, w, h) => p.x >= 580 && p.x <= 720 && p.y >= 390,
                target: 'dostlar_kiraathanesi'
            },
            {
                check: (p, w, h) => p.x <= 225 && p.y >= 350,
                target: 'pet_shop'
            }
        ],
        pet_shop: [
            {
                check: (p, w, h) => p.y >= h - 45 && p.x >= w / 2 - 80 && p.x <= w / 2 + 80,
                target: 'cadde'
            }
        ],
        cadde2: [
            {
                check: (p, w, h) => p.x <= 20 && p.y >= 140 && p.y <= 330,
                target: 'cadde'
            },
            // Sağa geçiş (sahil_yolu) geçici olarak durduruldu
            {
                check: (p, w, h) => p.x >= 50 && p.x <= 145 && p.y <= 125,
                action: (p) => {
                    const modal = document.getElementById('vipClubEntryModal');
                    if (modal && modal.style.display === 'flex') return;
                    if (typeof window.promptEnterVipClub === 'function') {
                        window.promptEnterVipClub();
                    }
                }
            },
            {
                check: (p, w, h) => p.x >= 760 && p.x <= 850 && p.y <= 115,
                target: 'kultur_merkezi_lobi'
            },
            {
                check: (p, w, h) => p.x >= 250 && p.x <= 350 && p.y <= 115,
                target: 'botanic_shop'
            },
            {
                check: (p, w, h) => {
                    if (p.x >= 840 && p.x <= 960 && p.y >= 430 && p.y <= 550) {
                        if (typeof verifyMineCaveEntrance === 'function' && !verifyMineCaveEntrance(p)) {
                            return false;
                        }
                        return true;
                    }
                    return false;
                },
                target: 'mine_cave'
            }
        ],
        mine_cave: [
            {
                check: (p, w, h) => p.x <= 130 && p.y >= 460 && p.y <= 580,
                target: 'cadde2'
            }
        ],
        botanic_shop: [
            {
                check: (p, w, h) => p.y >= h - 45 && p.x >= w / 2 - 70 && p.x <= w / 2 + 70,
                target: 'cadde2'
            }
        ],
        vip_club: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 60 && p.x <= w / 2 + 60,
                target: 'cadde2'
            }
        ],
        kultur_merkezi_lobi: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 60 && p.x <= w / 2 + 60,
                target: 'cadde2'
            },
            {
                check: (p, w, h) => p.y <= 145 && p.x >= 145 && p.x <= 275,
                target: 'kultur_merkezi_kulis'
            },
            {
                check: (p, w, h) => p.y <= 145 && p.x >= 425 && p.x <= 575,
                target: 'kultur_merkezi_sahne'
            },
            {
                check: (p, w, h) => p.y <= 145 && p.x >= 725 && p.x <= 855,
                target: 'kultur_merkezi_sinema'
            }
        ],
        kultur_merkezi_sahne: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 60 && p.x <= w / 2 + 60,
                target: 'kultur_merkezi_lobi'
            },
            {
                check: (p, w, h) => p.x <= 35 && p.y >= 185 && p.y <= 280,
                target: 'kultur_merkezi_kulis'
            }
        ],
        kultur_merkezi_kulis: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 60 && p.x <= w / 2 + 60,
                target: 'kultur_merkezi_lobi'
            },
            {
                check: (p, w, h) => p.x >= w - 35 && p.y >= 185 && p.y <= 295,
                target: 'kultur_merkezi_sahne'
            }
        ],
        kultur_merkezi_sinema: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 60 && p.x <= w / 2 + 60,
                target: 'kultur_merkezi_lobi'
            }
        ],
        dostlar_kiraathanesi: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 50 && p.x <= w / 2 + 50,
                target: 'cadde'
            }
        ],
        emlakci: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ],
        sahil: [
            {
                check: (p, w, h) => p.x >= w - 20 && p.y >= 180 && p.y <= 360,
                target: 'sokak'
            }
        ],
        nargile_cafe: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ],
        ganyan: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'cadde'
            }
        ],
        dedenin_yeri: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'cadde'
            }
        ],
        market: [
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= w / 2 - 45 && p.x <= w / 2 + 45,
                target: 'sokak'
            }
        ],
        star_caddesi: [
            {
                check: (p, w, h) => p.x <= 35 && p.y >= 320 && p.y <= 440,
                target: 'sokak'
            }
        ],
        meydanv2: [
            {
                check: (p, w, h) => p.x >= w - 30 && p.y >= 260 && p.y <= 400,
                target: 'cadde'
            },
            {
                check: (p, w, h) => p.y >= h - 35 && p.x >= 430 && p.x <= 570,
                target: 'sahil'
            },
            {
                check: (p, w, h) => p.x >= 140 && p.x <= 200 && p.y <= 165,
                target: 'emlakci'
            },
            {
                check: (p, w, h) => p.x >= 350 && p.x <= 415 && p.y <= 165,
                target: 'kafe'
            },
            {
                check: (p, w, h) => p.x >= 610 && p.x <= 675 && p.y <= 165,
                target: 'nargile_cafe'
            },
            {
                check: (p, w, h) => p.x >= 845 && p.x <= 910 && p.y <= 165,
                target: 'market'
            }
        ],
        sahilv2: [
            {
                check: (p, w, h) => p.x >= 920 && p.y >= 540,
                target: 'meydanv2'
            }
        ],
        sahil_yolu: [
            {
                // Doğu: Sokak / Meydan
                check: (p, w, h) => p.x >= w - 30 && p.y >= 180 && p.y <= 360,
                target: 'sokak'
            },
            {
                // Batı: Sahil v1
                check: (p, w, h) => p.x <= 30 && p.y >= 180 && p.y <= 360,
                target: 'sahil'
            },
            {
                // Kuzey: Grand Sahil AVM Giriş Kapısı
                check: (p, w, h) => p.x >= 430 && p.x <= 570 && p.y <= 215,
                target: 'avm_kat1'
            }
        ],
        avm_kat1: [
            {
                // Güney Çıkış: Sahil Yolu Kordon
                check: (p, w, h) => p.y >= h - 45 && p.x >= 410 && p.x <= 590,
                target: 'sahil_yolu'
            },
            {
                // Optik Butiği Kapısı
                check: (p, w, h) => Math.hypot(p.x - 660, p.y - 215) <= 45,
                target: 'optik'
            },
            {
                // Cadde Moda Butiği
                check: (p, w, h) => Math.hypot(p.x - 130, p.y - 280) <= 45,
                target: 'avm_magaza_kiyafet'
            },
            {
                // Headwear Co. Şapka
                check: (p, w, h) => Math.hypot(p.x - 340, p.y - 210) <= 45,
                target: 'avm_magaza_sapka'
            },
            {
                // Sneaker Lab
                check: (p, w, h) => Math.hypot(p.x - 865, p.y - 280) <= 45,
                target: 'avm_magaza_sneaker'
            },
            {
                // Yürüyen Merdiven -> Kat 2
                check: (p, w, h) => Math.hypot(p.x - 500, p.y - 175) <= 40,
                target: 'avm_kat2'
            }
        ],
        avm_kat2: [
            {
                // Yürüyen Merdiven -> Kat 1
                check: (p, w, h) => Math.hypot(p.x - 500, p.y - 175) <= 40,
                target: 'avm_kat1'
            },
            {
                // Sartoria Milano
                check: (p, w, h) => Math.hypot(p.x - 130, p.y - 280) <= 45,
                target: 'avm_magaza_takim'
            },
            {
                // Chronos VIP Saat
                check: (p, w, h) => Math.hypot(p.x - 340, p.y - 210) <= 45,
                target: 'avm_magaza_saat'
            },
            {
                // Salon De Paris VIP Berber
                check: (p, w, h) => Math.hypot(p.x - 865, p.y - 280) <= 45,
                target: 'avm_magaza_berber'
            }
        ],
        optik: [
            {
                // Çıkış Paspası / Eşiği -> AVM Kat 1
                check: (p, w, h) => p.x >= 630 && p.x <= 750 && p.y >= 465 && p.y <= 540,
                target: 'avm_kat1'
            }
        ],
        optika: [
            {
                check: (p, w, h) => p.x >= 630 && p.x <= 750 && p.y >= 465 && p.y <= 540,
                target: 'avm_kat1'
            }
        ]
    };

    /**
     * Oyuncu bir mekan geçiş koridoruna bastı mı kontrol eder.
     * @returns {string|null} Hedef mekan adı veya null
     */
    function checkRoomWalkPortals(p, currentRoom, canvasWidth, canvasHeight) {
        if (!p || !currentRoom) return null;

        // Ev çıkış kapısı
        if (currentRoom.startsWith("house_")) {
            if (p.x <= 55 && p.y >= canvasHeight - 70) {
                if (window.isHouseEditMode) {
                    p.x = 65;
                    p.y = canvasHeight - 75;
                    if (!window._lastHouseEditWarnTime || Date.now() - window._lastHouseEditWarnTime > 2500) {
                        window._lastHouseEditWarnTime = Date.now();
                        if (typeof window.warnHouseEditActive === 'function') window.warnHouseEditActive();
                    }
                    return null;
                }
                if (currentRoom.startsWith("house_ornek_")) {
                    if (typeof exitHouseTour === 'function') exitHouseTour();
                    else if (typeof changeRoom === 'function') changeRoom('emlakci');
                } else {
                    if (typeof changeRoom === 'function') changeRoom('sokak');
                }
                return null;
            }
            return null;
        }

        // AVM Özel Butikleri & Kuaför / Berber Çıkış Portali
        if (currentRoom.startsWith("avm_magaza_")) {
            if (typeof checkAvmShopPortalStep === 'function') {
                checkAvmShopPortalStep(currentRoom, p);
                return null;
            }
        }

        const portals = ROOM_WALK_PORTALS[currentRoom];
        if (!portals) return null;

        for (let i = 0; i < portals.length; i++) {
            if (portals[i].check(p, canvasWidth, canvasHeight)) {
                if (typeof portals[i].action === 'function') {
                    portals[i].action(p);
                    if (typeof roomTransitionCooldownUntil !== 'undefined') {
                        roomTransitionCooldownUntil = Date.now() + 1500;
                    }
                    if (p) {
                        p.vx = 0;
                        p.vy = 0;
                        p.isMoving = false;
                        p.targetX = p.x;
                        p.targetY = p.y;
                    }
                    if (typeof targetWalkPos !== 'undefined') {
                        targetWalkPos = null;
                    }
                    return null;
                }
                return portals[i].target;
            }
        }
        return null;
    }

    /**
     * 2. MEKAN TIKLAMA / DOKUNMA ETKİLEŞİMİ (CLICK & TAP HANDLER)
     * Canvas üzerindeki tıklamaları ilgili mekanın nesnelerine yönlendirir.
     * @returns {boolean} Tıklama bir nesneye isabet ettiyse true
     */
    function handleRoomInteractionClick(clickX, clickY, currentRoom, p, canvasWidth, canvasHeight) {
        if (!currentRoom) return false;

        // --- AVM ÖZEL BUTİKLERİ & VIP KUAFÖR / BERBER ---
        if (currentRoom.startsWith("avm_magaza_")) {
            if (typeof handleAvmShopClick === 'function') {
                if (handleAvmShopClick(currentRoom, clickX, clickY, p)) return true;
            }
        }

        // --- KAFE ---
        if (currentRoom === "kafe") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            // Çay ocağı tezgahı
            if (clickX >= 20 && clickX <= 250 && clickY >= 15 && clickY <= 65) {
                if (typeof triggerPlayerAction === 'function') triggerPlayerAction('tea');
                return true;
            }
            // Masalar
            let tables = (typeof cafeTables !== 'undefined') ? cafeTables : [];
            for (let i = 0; i < tables.length; i++) {
                let obj = tables[i];
                if (clickX >= obj.x && clickX <= obj.x + obj.w && clickY >= obj.y && clickY <= obj.y + obj.h) {
                    if (obj.id === 'blackjack') {
                        if (typeof openBlackjackModal === 'function') openBlackjackModal();
                    } else if (socket) {
                        socket.emit('requestTableOptions', obj.id);
                    } else if (obj.id === 'xox') {
                        if (typeof openXoxModal === 'function') openXoxModal();
                    } else if (obj.id === 'amiral') {
                        if (typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
                    }
                    return true;
                }
            }
            return false;
        }

        // --- GANYAN BAYİİ & HİPODROM ---
        if (currentRoom === "ganyan") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            // TJK Gişesi Kupon Masası
            if (clickX >= 20 && clickX <= 265 && clickY >= 248 && clickY <= 435) {
                if (typeof openGanyanKuponModal === 'function') openGanyanKuponModal();
                return true;
            }
            // At Kiralama / Harası
            if (clickX >= 525 && clickX <= 780 && clickY >= 245 && clickY <= 445) {
                if (typeof openHorseRentalModal === 'function') openHorseRentalModal();
                return true;
            }
            return false;
        }

        // --- SAHİL & PLAJ ---
        if (currentRoom === "sahil") {
            // Çıkış (Sokak Yolu ve Tabela)
            if (clickX >= canvasWidth - 80 && clickY >= 180 && clickY <= 360) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth - 16, 260, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            // Kuğu Deniz Bisikleti
            if (clickX >= 90 && clickX <= 175 && clickY >= 145 && clickY <= 235) {
                if (typeof handleRentSwanBoat === 'function') handleRentSwanBoat();
                return true;
            }
            // Tropik Sahil Barı
            if (clickX >= 645 && clickX <= 785 && clickY >= 385 && clickY <= 475) {
                if (typeof openCocktailBarModal === 'function') openCocktailBarModal();
                return true;
            }
            // Su ve İskele Alanı -> Balık Tutma
            if (clickX < 560 || clickY < 320) {
                if (typeof triggerFishing === 'function') triggerFishing();
                return true;
            }
            return false;
        }

        // --- SOKAK / ŞEHİR MEYDANI ---
        if (currentRoom === "sokak") {
            // Sahile geçiş yolu ve tabelası (Sol)
            if (clickX <= 80 && clickY >= 180 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(16, 255, 'sahil');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sahil');
                }
                return true;
            }
            // Caddeye geçiş yolu ve tabelası (Sağ)
            if (clickX >= canvasWidth - 80 && clickY >= 180 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth - 16, 255, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            // Emlakçı Binası (Sol Üst)
            if (clickX >= 20 && clickX <= 235 && clickY >= 10 && clickY <= 115) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(192, 90, 'emlakci');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('emlakci');
                }
                return true;
            }
            // Kafe Binası (Orta Üst)
            if (clickX >= 260 && clickX <= 540 && clickY >= 10 && clickY <= 115) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(400, 90, 'kafe');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kafe');
                }
                return true;
            }
            // Nargile Kafe Binası (Sağ Üst)
            if (clickX >= 560 && clickX <= 780 && clickY >= 10 && clickY <= 115) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(670, 90, 'nargile_cafe');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('nargile_cafe');
                }
                return true;
            }
            // Konutlar & Apartman Sitesi Girişi
            if (clickX >= 15 && clickX <= 250 && clickY >= 340 && clickY <= 475) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(205, 385, null, () => {
                        if (typeof openHousingPortalModal === 'function') openHousingPortalModal();
                    });
                } else {
                    if (typeof openHousingPortalModal === 'function') openHousingPortalModal();
                }
                return true;
            }
            // Açık Hava Reklam Panosu
            if (clickX >= 270 && clickX <= 530 && clickY >= 335 && clickY <= 470) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            // Mobilya Marketi Binası (Sağ Alt)
            if (clickX >= 550 && clickX <= 780 && clickY >= 335 && clickY <= 470) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(715, 355, 'market');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('market');
                }
                return true;
            }
            return false;
        }

        // --- YENİ CADDE ---
        if (currentRoom === "cadde") {
            // Sokağa / Meydana dönüş yolu (Sol)
            if (clickX <= 80 && clickY >= 140 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(16, 235, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            // Ganyan Bayii & Hipodrom (Sol Üst)
            if (clickX >= 90 && clickX <= 390 && clickY >= 12 && clickY <= 125) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(235, 90, 'ganyan');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('ganyan');
                }
                return true;
            }
            // Dedenin Yeri Casino (Sağ Üst)
            if (clickX >= 440 && clickX <= 740 && clickY >= 12 && clickY <= 125) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(585, 90, 'dedenin_yeri');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('dedenin_yeri');
                }
                return true;
            }
            // Cadde Bulvar Bankı 1 (x: 270..314, y: 220..238)
            if (clickX >= 265 && clickX <= 320 && clickY >= 215 && clickY <= 242) {
                let seatX = clickX < 292 ? 282 : 302;
                if (typeof sitPlayerAt === 'function') {
                    let dist = Math.hypot(p.x - seatX, p.y - 226);
                    if (dist < 75) {
                        sitPlayerAt(seatX, 226, 'down');
                    } else if (typeof navigatePlayerToDoor === 'function') {
                        navigatePlayerToDoor(seatX, 226, null, () => sitPlayerAt(seatX, 226, 'down'));
                    }
                }
                return true;
            }
            // Cadde Bulvar Bankı 2 (x: 440..484, y: 220..238)
            if (clickX >= 435 && clickX <= 490 && clickY >= 215 && clickY <= 242) {
                let seatX = clickX < 462 ? 452 : 472;
                if (typeof sitPlayerAt === 'function') {
                    let dist = Math.hypot(p.x - seatX, p.y - 226);
                    if (dist < 75) {
                        sitPlayerAt(seatX, 226, 'down');
                    } else if (typeof navigatePlayerToDoor === 'function') {
                        navigatePlayerToDoor(seatX, 226, null, () => sitPlayerAt(seatX, 226, 'down'));
                    }
                }
                return true;
            }
            // Cadde Reklam Panosu (Haritanın Ortasına Çekildi: x: 245..495)
            if (clickX >= 245 && clickX <= 495 && clickY >= 335 && clickY <= 470) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            // Pet Shop Kulübesi (Sol Alt: x: 15..225) -> İç Mekana Giriş
            if (clickX >= 15 && clickX <= 225 && clickY >= 335 && clickY <= 470) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(120, 395, 'pet_shop');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('pet_shop');
                }
                return true;
            }
            // Sağ Alt: ☕ DOSTLAR KIRAATHANESİ (İçeri Giriş)
            if (clickX >= 520 && clickX <= 780 && clickY >= 335 && clickY <= 470) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(650, 380, 'dostlar_kiraathanesi');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('dostlar_kiraathanesi');
                }
                return true;
            }
            // Cadde 2'ye geçiş yolu (Sağ)
            if (clickX >= canvasWidth - 80 && clickY >= 140 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth - 16, 235, 'cadde2');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde2');
                }
                return true;
            }
            return false;
        }

        // --- CADDE 2 (3 YÖNLÜ YOL & VIP CLUB SOKAĞI) ---
        if (currentRoom === "cadde2") {
            // Semihus Aydınus (İSG Şefi) Tıklaması (x: 735, y: 460)
            const semihusDist = Math.hypot(clickX - 735, clickY - 460);
            if (semihusDist < 55) {
                if (typeof openIsgSafetyShopModal === 'function') {
                    openIsgSafetyShopModal();
                }
                return true;
            }

            // Maden Mağara Girişi Tıklaması
            const caveDist = Math.hypot(clickX - 900, clickY - 480);
            if (caveDist < 75) {
                if (typeof verifyMineCaveEntrance === 'function' && !verifyMineCaveEntrance(p)) {
                    return true;
                }
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(900, 480, 'mine_cave');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('mine_cave');
                }
                return true;
            }
            // Botanik Dükkanı Kapısı (x: 250..350, y: 35..115)
            if (clickX >= 250 && clickX <= 350 && clickY >= 35 && clickY <= 115) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(295, 135, 'botanic_shop');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('botanic_shop');
                }
                return true;
            }

            // Sola -> Cadde 1
            if (clickX <= 80 && clickY >= 140 && clickY <= 330) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(16, 235, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            // Sağa -> Doğu Sahil Yolu (Şimdilik Durduruldu)
            if (clickX >= canvasWidth - 80 && clickY >= 140 && clickY <= 330) {
                if (typeof showNotification === 'function') {
                    showNotification('🚧 Bu yol şimdilik geçici olarak kapalıdır.', 'warning');
                }
                return true;
            }
            // Kuzey Barikatı Tıklaması (x: 405..595, y: 70..165)
            if (clickX >= 405 && clickX <= 595 && clickY >= 70 && clickY <= 165) {
                if (typeof showNotification === 'function') {
                    showNotification('🚧 Bu yol yapım aşamasındadır ve geçici olarak trafiğe kapatılmıştır.', 'warning');
                }
                return true;
            }
            // Sol Üst -> VİP CLUB Giriş Kapısı (x: 20..175, y: 12..120)
            if (clickX >= 20 && clickX <= 175 && clickY <= 120) {
                if (typeof promptEnterVipClub === 'function') {
                    promptEnterVipClub();
                }
                return true;
            }
            // Sağ Üst -> Kültür Merkezi Giriş Kapısı (x: 760..850, y: 35..150)
            if (clickX >= 760 && clickX <= 850 && clickY <= 150) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(805, 120, 'kultur_merkezi_lobi');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_lobi');
                }
                return true;
            }
            // Sağ Üst -> İnteraktif Afiş & Billboard Panosu (x: 650..745, y: 35..110)
            if (clickX >= 650 && clickX <= 745 && clickY >= 35 && clickY <= 110) {
                if (typeof openKulturBillboardModal === 'function') {
                    openKulturBillboardModal();
                }
                return true;
            }
            return false;
        }

        // --- KÜLTÜR MERKEZİ LOBİ / FUAYE ---
        if (currentRoom === "kultur_merkezi_lobi") {
            // Çıkış kapısı -> Cadde 2
            if (clickX >= canvasWidth / 2 - 60 && clickX <= canvasWidth / 2 + 60 && clickY >= canvasHeight - 60) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde2');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde2');
                }
                return true;
            }
            // Kapı 1: Kulis (Sol)
            if (clickX >= 140 && clickX <= 270 && clickY >= 35 && clickY <= 140) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(205, 120, 'kultur_merkezi_kulis');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_kulis');
                }
                return true;
            }
            // Kapı 2: Ana Sahne (Orta)
            if (clickX >= 420 && clickX <= 580 && clickY >= 30 && clickY <= 140) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, 120, 'kultur_merkezi_sahne');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_sahne');
                }
                return true;
            }
            // Kapı 3: Sinema (Sağ)
            if (clickX >= 720 && clickX <= 850 && clickY >= 35 && clickY <= 140) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(785, 120, 'kultur_merkezi_sinema');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_sinema');
                }
                return true;
            }
            // Resepsiyon Masası (Açık Mikrofon Kayıt Defteri)
            if (clickX >= 70 && clickX <= 250 && clickY >= 240 && clickY <= 340) {
                if (typeof openStageQueueModal === 'function') {
                    openStageQueueModal();
                }
                return true;
            }
            // Gişe & VIP Rezervasyon Kulübesi
            if (clickX >= 750 && clickX <= 930 && clickY >= 240 && clickY <= 340) {
                if (typeof openKulturGiseModal === 'function') {
                    openKulturGiseModal();
                }
                return true;
            }
            // Büfe & Atıştırmalık
            if (clickX >= 70 && clickX <= 260 && clickY >= 430 && clickY <= 535) {
                if (typeof openKulturBufeModal === 'function') {
                    openKulturBufeModal();
                }
                return true;
            }
            return false;
        }

        // --- ANA SANAT & STAND-UP SAHNESİ ---
        if (currentRoom === "kultur_merkezi_sahne") {
            // Çıkış kapısı -> Lobi
            if (clickX >= canvasWidth / 2 - 60 && clickX <= canvasWidth / 2 + 60 && clickY >= canvasHeight - 60) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'kultur_merkezi_lobi');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_lobi');
                }
                return true;
            }
            // Kulis Kapısı (Sol Duvar)
            if (clickX >= 35 && clickX <= 130 && clickY >= 180 && clickY <= 280) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(85, 230, 'kultur_merkezi_kulis');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_kulis');
                }
                return true;
            }
            // Kürsüdeki Kayıt Defteri (Sahne Kenarı)
            if (clickX >= 195 && clickX <= 265 && clickY >= 210 && clickY <= 285) {
                if (typeof openStageQueueModal === 'function') {
                    openStageQueueModal();
                }
                return true;
            }
            return false;
        }

        // --- VIP KULİS ODASI ---
        if (currentRoom === "kultur_merkezi_kulis") {
            // Çıkış kapısı -> Lobi
            if (clickX >= canvasWidth / 2 - 60 && clickX <= canvasWidth / 2 + 60 && clickY >= canvasHeight - 60) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'kultur_merkezi_lobi');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_lobi');
                }
                return true;
            }
            // Sahneye Geçiş Kapısı (Sağ Duvar)
            if (clickX >= 880 && clickX <= 970 && clickY >= 180 && clickY <= 300) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(925, 235, 'kultur_merkezi_sahne');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_sahne');
                }
                return true;
            }
            return false;
        }

        // --- 2.5D SİNEMA SALONU ---
        if (currentRoom === "kultur_merkezi_sinema") {
            // Çıkış kapısı -> Lobi
            if (clickX >= canvasWidth / 2 - 60 && clickX <= canvasWidth / 2 + 60 && clickY >= canvasHeight - 60) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'kultur_merkezi_lobi');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('kultur_merkezi_lobi');
                }
                return true;
            }
            return false;
        }

                // --- BOTANİK DÜKKANI & BİTKİ SERASI ---
        if (currentRoom === "mine_cave") {
            const exitBtnDist = Math.hypot(p.x - 120, p.y - 520);
            if (exitBtnDist < 80) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(100, 520, 'cadde2');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde2');
                }
                return true;
            }
        }
        if (currentRoom === "botanic_shop") {
            // Çıkış kapısı (Cadde 2'ye dönüş)
            if (clickX >= canvasWidth / 2 - 60 && clickX <= canvasWidth / 2 + 60 && clickY >= canvasHeight - 65) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde2');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde2');
                }
                return true;
            }
            // NPC 1: Botanikçi Defne (Tedarikçi) (x: 200..430, y: 150..270)
            if (clickX >= 200 && clickX <= 430 && clickY >= 150 && clickY <= 270) {
                if (typeof openBotanicSupplierModal === 'function') openBotanicSupplierModal();
                return true;
            }
            // NPC 2: Çiçek Tüccarı Rasim (Borsa) (x: 640..870, y: 150..270)
            if (clickX >= 640 && clickX <= 870 && clickY >= 150 && clickY <= 270) {
                if (typeof openBotanicMarketModal === 'function') openBotanicMarketModal();
                return true;
            }
        }

        // --- PET SHOP ---
        if (currentRoom === "pet_shop") {
            // 1. Çıkış Kapısı (Paspas: x: 360..640, y >= 560)
            if (clickY >= 560 && clickX >= 360 && clickX <= 640) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }

            // 2. Kasa Bankosu & Dr. Selim Hekimoğlu (x: 630..965, y: 150..315)
            if (clickX >= 630 && clickX <= 965 && clickY >= 150 && clickY <= 315) {
                if (typeof triggerVeterinerGreeting === 'function') triggerVeterinerGreeting();
                if (typeof openPetShopModal === 'function') openPetShopModal();
                return true;
            }

            // 3. Butik Hayvan Kostüm Standı (Sol Alt: x: 40..255, y: 360..505)
            if (clickX >= 40 && clickX <= 255 && clickY >= 360 && clickY <= 505) {
                if (typeof openAnimalCostumeBoutiqueModal === 'function') openAnimalCostumeBoutiqueModal();
                return true;
            }
        }
        if (currentRoom === "vip_club") {
            if (typeof handleVipClubClick === 'function') {
                if (handleVipClubClick(clickX, clickY, p)) return true;
            }
            // Çıkış merdiveni (Cadde 2'ye dönüş: x: 430..570, y >= canvasHeight - 65)
            if (clickX >= canvasWidth / 2 - 70 && clickX <= canvasWidth / 2 + 70 && clickY >= canvasHeight - 65) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde2');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde2');
                }
                return true;
            }
            // 2.5D Tekinsiz Tekin ve Karaborsa Bar Tezgahı (x: 680..950, y: 190..340)
            if (clickX >= 680 && clickX <= 950 && clickY >= 190 && clickY <= 340) {
                if (typeof openTekinsizTekinModal === 'function') {
                    openTekinsizTekinModal();
                }
                return true;
            }
            return false;
        }

        // --- SAHİL YOLU (GRAND SAHİL AVM GİRİŞİ) ---
        if (currentRoom === "sahil_yolu") {
            // AVM Binasına veya Kapısına Tıklama -> Kat 1'e Gir
            if (clickX >= 320 && clickX <= 680 && clickY <= 235) {
                if (typeof changeRoom === 'function') changeRoom('avm_kat1');
                return true;
            }
            if (typeof handleSahilYoluClick === 'function') {
                if (handleSahilYoluClick(clickX, clickY, p)) return true;
            }
            return false;
        }

        // --- GRAND SAHİL AVM (KAT 1 & KAT 2) ---
        if (currentRoom === "avm_kat1" || currentRoom === "avm_kat2") {
            if (typeof handleAvmMallClick === 'function') {
                if (handleAvmMallClick(clickX, clickY, currentRoom)) return true;
            }
            return false;
        }

        // --- OPTİK (DİORAMA GÖZLÜK BUTİĞİ) ---
        if (currentRoom === "optik" || currentRoom === "optika") {
            if (typeof handleOptikaClick === 'function') {
                if (handleOptikaClick(clickX, clickY, p)) return true;
            }
            return false;
        }

        // --- DOSTLAR KIRAATHANESİ (1000x625 - 4 MASA + STAND + KAPI) ---
        if (currentRoom === "dostlar_kiraathanesi") {
            // Çıkış Kapısı (Alt Orta)
            if (clickX >= canvasWidth / 2 - 50 && clickX <= canvasWidth / 2 + 50 && clickY >= canvasHeight - 75) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            // 1. Batak (4 Kişilik Normal Batak) (cx: 320, cy: 230, r: 65 + etiket)
            let d4Batak = Math.hypot(clickX - 320, clickY - 230);
            if (d4Batak <= 75 || (clickX >= 240 && clickX <= 400 && clickY >= 170 && clickY <= 325)) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'batak4');
                return true;
            }
            // 2. Batak (3 Kişilik Gömmeli Batak) (cx: 320, cy: 440, r: 62 + etiket)
            let d3Batak = Math.hypot(clickX - 320, clickY - 440);
            if (d3Batak <= 75 || (clickX >= 240 && clickX <= 400 && clickY >= 380 && clickY <= 535)) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'batak');
                return true;
            }
            // 3. Dost Kazığı (4 Kişilik Eşli/Tekli) (cx: 720, cy: 230, r: 65 + etiket)
            let d4Dost = Math.hypot(clickX - 720, clickY - 230);
            if (d4Dost <= 75 || (clickX >= 640 && clickX <= 800 && clickY >= 170 && clickY <= 325)) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'dost_kazigi');
                return true;
            }
            // 4. Dost Kazığı (3 Kişilik) (cx: 720, cy: 440, r: 62 + etiket)
            let d3Dost = Math.hypot(clickX - 720, clickY - 440);
            if (d3Dost <= 75 || (clickX >= 640 && clickX <= 800 && clickY >= 380 && clickY <= 535)) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'dost_kazigi_3p');
                return true;
            }
            // Çay Ocağı Tezgahı & Çaycı Hüseyin Usta (Sol Üst: x: 33..195, y: 55..160)
            if (clickX >= 33 && clickX <= 195 && clickY >= 55 && clickY <= 160) {
                if (typeof openKiraathaneBarModal === 'function') {
                    openKiraathaneBarModal();
                } else if (typeof showFloatingToast === 'function') {
                    showFloatingToast("☕ Kıraathane Çay Ocağı: Tavşan kanı taze çay demleniyor!");
                }
                return true;
            }
            return false;
        }

        // --- 1. CADDE (SANALİKA İZOMETRİK HARİTA) ---
        if (currentRoom === "sanalika_cadde") {
            if (typeof handleSanalikaCaddeClick === 'function') {
                let handled = handleSanalikaCaddeClick(clickX, clickY);
                if (handled) return true;
            }
            return false;
        }

        // --- STAR CADDESİ (1000x625 GENİŞ FORMAT) ---
        if (currentRoom === "star_caddesi") {
            if (typeof handleStarCaddesiClick === 'function') {
                let handled = handleStarCaddesiClick(clickX, clickY, p);
                if (handled) return true;
            }
            return false;
        }

        // --- MEYDAN V2 (1000x625 GENİŞ İZOMETRİK HARİTA) ---
        if (currentRoom === "meydanv2") {
            if (typeof handleMeydanV2Click === 'function') {
                let handled = handleMeydanV2Click(clickX, clickY, p);
                if (handled) return true;
            }
            return false;
        }

        // --- SAHİL V2 (1000x625 DİNAMİK SAHİL & KUĞU KİRALAMA) ---
        if (currentRoom === "sahilv2") {
            if (typeof handleSahilV2Click === 'function') {
                let handled = handleSahilV2Click(clickX, clickY, p);
                if (handled) return true;
            }
            return false;
        }

        // --- PRESTİJ GAYRİMENKUL & EMLAK OFİSİ ---
        if (currentRoom === "emlakci") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            if (clickX >= 310 && clickX <= 490 && clickY >= 65 && clickY <= 145) {
                if (typeof openRealEstateModal === 'function') openRealEstateModal();
                return true;
            }
            if (clickX >= 85 && clickX <= 255 && clickY >= 210 && clickY <= 360) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('standart');
                return true;
            }
            if (clickX >= 315 && clickX <= 485 && clickY >= 210 && clickY <= 360) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('garden');
                return true;
            }
            if (clickX >= 545 && clickX <= 715 && clickY >= 210 && clickY <= 360) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('pool');
                return true;
            }
            return false;
        }

        // --- DEDENİN YERİ CASINO ---
        if (currentRoom === "dedenin_yeri") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'cadde');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('cadde');
                }
                return true;
            }
            if (clickX >= 25 && clickX <= 185 && clickY >= 115 && clickY <= 195) {
                if (typeof openSlotModal === 'function') openSlotModal();
                return true;
            }
            if (clickX >= 625 && clickX <= 775 && clickY >= 125 && clickY <= 235) {
                if (typeof openRouletteModal === 'function') openRouletteModal();
                return true;
            }
            if (clickX >= 310 && clickX <= 490 && clickY >= 155 && clickY <= 290) {
                if (typeof openBlackjackModal === 'function') openBlackjackModal();
                return true;
            }
            return false;
        }

        // --- NARGİLE KAFE ---
        if (currentRoom === "nargile_cafe") {
            // Mutfak kapısı
            if (clickX >= canvasWidth - 115 && clickX <= canvasWidth - 10 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof window.showKitchenStaffOnlyNotice === 'function') window.showKitchenStaffOnlyNotice();
                return true;
            }
            // Localar
            if (clickX >= 25 && clickX <= 215 && clickY >= 50 && clickY <= 175) {
                if (typeof window.checkAndOpenNargileMenu === 'function') window.checkAndOpenNargileMenu('lounge_sol');
                return true;
            }
            if (clickX >= 585 && clickX <= 775 && clickY >= 50 && clickY <= 175) {
                if (typeof window.checkAndOpenNargileMenu === 'function') window.checkAndOpenNargileMenu('lounge_sag');
                return true;
            }
            // 101 Masaları
            if (clickX >= 145 && clickX <= 365 && clickY >= 155 && clickY <= 355) {
                if (socket) socket.emit('requestTableOptions', 'okey101_tekli');
                return true;
            }
            if (clickX >= 435 && clickX <= 655 && clickY >= 155 && clickY <= 355) {
                if (socket) socket.emit('requestTableOptions', 'okey101');
                return true;
            }
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 45 && clickX <= canvasWidth / 2 + 45 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 5) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            return false;
        }

        // --- MOBİLYA MARKETİ ---
        if (currentRoom === "market") {
            // Çıkış kapısı
            if (clickX >= canvasWidth / 2 - 40 && clickX <= canvasWidth / 2 + 40 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 10) {
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(canvasWidth / 2, canvasHeight - 25, 'sokak');
                } else if (typeof changeRoom === 'function') {
                    changeRoom('sokak');
                }
                return true;
            }
            if (typeof openFurnitureMarketModal === 'function') {
                openFurnitureMarketModal();
                return true;
            }
            return false;
        }

        // --- OYUNCU EVLERİ (HOUSING) ---
        if (currentRoom.startsWith("house_")) {
            if (typeof getCurrentViewingHouse === 'function') {
                let house = getCurrentViewingHouse();
                if (house && house.furniture) {
                    // Limonata standı
                    let stand = house.furniture.find(f => f.id === 'meyve_arabasi');
                    if (stand && !window.isHouseEditMode) {
                        let cat = (typeof FURNITURE_CATALOG !== 'undefined') ? FURNITURE_CATALOG['meyve_arabasi'] : { w: 78, h: 68 };
                        let hw = (cat.w || 78) / 2 + 12;
                        let hh = (cat.h || 68) / 2 + 12;
                        if (clickX >= stand.x - hw && clickX <= stand.x + hw && clickY >= stand.y - hh && clickY <= stand.y + hh) {
                            if (typeof openLemonadeStandModal === 'function') {
                                openLemonadeStandModal(house);
                                return true;
                            }
                        }
                    }
                    // Vegas Slot Makinesi
                    let slotObj = house.furniture.find(f => f.id === 'slot_machine');
                    if (slotObj && !window.isHouseEditMode) {
                        let cat = (typeof FURNITURE_CATALOG !== 'undefined') ? FURNITURE_CATALOG['slot_machine'] : { w: 58, h: 74 };
                        let hw = (cat.w || 58) / 2 + 12;
                        let hh = (cat.h || 74) / 2 + 12;
                        if (clickX >= slotObj.x - hw && clickX <= slotObj.x + hw && clickY >= slotObj.y - hh && clickY <= slotObj.y + hh) {
                            if (typeof openSlotModal === 'function') {
                                window.currentSlotHouseOwner = house.owner;
                                openSlotModal();
                                return true;
                            }
                        }
                    }
                    // VIP Rulet Masası
                    let rouletteObj = house.furniture.find(f => f.id === 'roulette_table');
                    if (rouletteObj && !window.isHouseEditMode) {
                        let cat = (typeof FURNITURE_CATALOG !== 'undefined') ? FURNITURE_CATALOG['roulette_table'] : { w: 88, h: 64 };
                        let hw = (cat.w || 88) / 2 + 12;
                        let hh = (cat.h || 64) / 2 + 12;
                        if (clickX >= rouletteObj.x - hw && clickX <= rouletteObj.x + hw && clickY >= rouletteObj.y - hh && clickY <= rouletteObj.y + hh) {
                            if (typeof openRouletteModal === 'function') {
                                openRouletteModal();
                                return true;
                            }
                        }
                    }
                }
            }
            // Ev çıkış kapısı
            if (clickX >= 15 && clickX <= 75 && clickY >= canvasHeight - 75 && clickY <= canvasHeight - 10) {
                if (window.isHouseEditMode) {
                    if (typeof warnHouseEditActive === 'function') warnHouseEditActive();
                    return true;
                }
                let targetExit = currentRoom.startsWith("house_ornek_") ? 'emlakci' : 'sokak';
                let exitAction = () => {
                    if (currentRoom.startsWith("house_ornek_")) {
                        if (typeof exitHouseTour === 'function') exitHouseTour();
                        else if (typeof changeRoom === 'function') changeRoom('emlakci');
                    } else {
                        if (typeof changeRoom === 'function') changeRoom('sokak');
                    }
                };
                if (typeof navigatePlayerToDoor === 'function') {
                    navigatePlayerToDoor(45, canvasHeight - 40, targetExit, exitAction);
                } else {
                    exitAction();
                }
                return true;
            }
            return false;
        }

        return false;
    }

    /**
     * 3. YAKINLIK TABANLI "E" TUŞU VE MOBİL ETKİLEŞİM İŞLEYİCİSİ (PROXIMITY INTERACT)
     * Oyuncu bir objeye yakınken 'E' tuşuna bastığında ilgili aksiyonu çalıştırır.
     * @returns {boolean} Etkileşim tetiklendiyse true
     */
    function handleRoomMobileInteract(p, currentRoom, canvasWidth, canvasHeight) {
        if (!p || !currentRoom) return false;

        // --- AVM ÖZEL BUTİKLERİ & VIP KUAFÖR / BERBER ---
        if (currentRoom.startsWith("avm_magaza_")) {
            if (typeof handleAvmShopMobileInteract === 'function') {
                if (handleAvmShopMobileInteract(currentRoom, p)) return true;
            }
        }

        // --- GRAND SAHİL AVM (KAT 1 & KAT 2) ---
        if (currentRoom === "avm_kat1" || currentRoom === "avm_kat2") {
            if (typeof handleAvmMallMobileInteract === 'function') {
                if (handleAvmMallMobileInteract(currentRoom)) return true;
            }
        }

        // --- SAHİL YOLU AVM KAPISI ---
        if (currentRoom === "sahil_yolu") {
            if (p && Math.hypot(p.x - 500, p.y - 180) <= 85) {
                if (typeof changeRoom === 'function') changeRoom('avm_kat1');
                return true;
            }
        }

        // --- OPTİK (DİORAMA GÖZLÜK BUTİĞİ) ---
        if (currentRoom === "optik" || currentRoom === "optika") {
            if (p) {
                if (Math.hypot(p.x - 690, p.y - 505) < 55) {
                    if (typeof changeRoom === 'function') changeRoom('avm_kat1', { x: 660, y: 240 });
                    return true;
                }
                if (typeof openOptikaShopUI === 'function') {
                    openOptikaShopUI();
                    return true;
                }
            }
        }

        // --- CADDE 2 (3 YÖNLÜ BULVAR & İSG KAYA MADENİ KONTROL NOKTASI) ---
        if (currentRoom === "cadde2") {
            // 1. Semihus Aydınus (İSG Şefi & Güvenlik Masası - x: 735, y: 460)
            if (Math.hypot(p.x - 735, p.y - 460) < 95) {
                if (typeof openIsgSafetyShopModal === 'function') {
                    openIsgSafetyShopModal();
                } else if (typeof window !== 'undefined' && typeof window.openIsgSafetyShopModal === 'function') {
                    window.openIsgSafetyShopModal();
                }
                return true;
            }
            // 2. Kaya Madeni Girişi
            if (Math.hypot(p.x - 900, p.y - 480) < 85) {
                let verifier = (typeof verifyMineCaveEntrance === 'function') ? verifyMineCaveEntrance : ((typeof window !== 'undefined') ? window.verifyMineCaveEntrance : null);
                if (typeof verifier === 'function' && !verifier(p)) {
                    return true;
                }
                if (typeof changeRoom === 'function') changeRoom('mine_cave');
                else if (typeof window !== 'undefined' && typeof window.changeRoom === 'function') window.changeRoom('mine_cave');
                return true;
            }
            // 3. Botanik Dükkanı & Sera
            if (Math.hypot(p.x - 300, p.y - 115) < 85 || (p.x >= 240 && p.x <= 360 && p.y <= 130)) {
                if (typeof changeRoom === 'function') changeRoom('botanic_shop');
                return true;
            }
            // 4. VİP Club Girişi (Sol Üst)
            if (Math.hypot(p.x - 98, p.y - 115) < 85 || (p.x >= 40 && p.x <= 160 && p.y <= 130)) {
                if (typeof promptEnterVipClub === 'function') promptEnterVipClub();
                return true;
            }
            // 5. Kültür Merkezi Fuaye / Lobi
            if (Math.hypot(p.x - 805, p.y - 120) < 85 || (p.x >= 750 && p.x <= 860 && p.y <= 135)) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_lobi');
                return true;
            }
            // 6. Sol Kapı: Cadde 1
            if (p.x <= 75 && p.y >= 140 && p.y <= 330) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            // 7. Sağ Kapı: Sahil Yolu (Şimdilik Durduruldu)
            return false;
        }

        // --- KAYA MADENİ MAĞARASI ---
        if (currentRoom === "mine_cave") {
            // Çıkış kapısı (Cadde 2'ye dönüş: sol alt)
            if (Math.hypot(p.x - 120, p.y - 520) < 90 || (p.x <= 135 && p.y >= 460 && p.y <= 580)) {
                if (typeof changeRoom === 'function') changeRoom('cadde2');
                return true;
            }
            // Maden Kazma Etkileşimi (Kaya Damarlarına Yakınsa)
            if (typeof triggerMiningAction === 'function') {
                triggerMiningAction();
                return true;
            }
            return false;
        }

        // --- BOTANİK DÜKKANI & BİTKİ SERASI ---
        if (currentRoom === "botanic_shop") {
            // Çıkış kapısı (Cadde 2'ye dönüş)
            if (p.y >= canvasHeight - 65 && p.x >= canvasWidth / 2 - 70 && p.x <= canvasWidth / 2 + 70) {
                if (typeof changeRoom === 'function') changeRoom('cadde2');
                return true;
            }
            // NPC 1: Botanikçi Defne (Tedarikçi) (x: 200..430, y: 150..270)
            if (Math.hypot(p.x - 315, p.y - 210) < 110) {
                if (typeof openBotanicSupplierModal === 'function') openBotanicSupplierModal();
                return true;
            }
            // NPC 2: Çiçek Tüccarı Rasim (Borsa) (x: 640..870, y: 150..270)
            if (Math.hypot(p.x - 755, p.y - 210) < 110) {
                if (typeof openBotanicMarketModal === 'function') openBotanicMarketModal();
                return true;
            }
            return false;
        }

        // --- KÜLTÜR MERKEZİ LOBİ / FUAYE ---
        if (currentRoom === "kultur_merkezi_lobi") {
            // Çıkış kapısı -> Cadde 2
            if (p.y >= canvasHeight - 65 && p.x >= canvasWidth / 2 - 70 && p.x <= canvasWidth / 2 + 70) {
                if (typeof changeRoom === 'function') changeRoom('cadde2');
                return true;
            }
            // Sol Kapı: Kulis
            if (Math.hypot(p.x - 205, p.y - 90) < 85) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_kulis');
                return true;
            }
            // Orta Kapı: Ana Sahne
            if (Math.hypot(p.x - (canvasWidth / 2), p.y - 85) < 85) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_sahne');
                return true;
            }
            // Sağ Kapı: Sinema
            if (Math.hypot(p.x - 785, p.y - 90) < 85) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_sinema');
                return true;
            }
            // Resepsiyon Masası (Kayıt Defteri)
            if (Math.hypot(p.x - 160, p.y - 290) < 95) {
                if (typeof openStageQueueModal === 'function') openStageQueueModal();
                return true;
            }
            // Gişe & VIP Rezervasyon
            if (Math.hypot(p.x - 840, p.y - 290) < 95) {
                if (typeof openKulturGiseModal === 'function') openKulturGiseModal();
                return true;
            }
            // Büfe & Atıştırmalık
            if (Math.hypot(p.x - 165, p.y - 485) < 95) {
                if (typeof openKulturBufeModal === 'function') openKulturBufeModal();
                return true;
            }
            return false;
        }

        // --- KÜLTÜR MERKEZİ SAHNE, KULİS, SİNEMA ---
        if (currentRoom === "kultur_merkezi_sahne") {
            if (p.y >= canvasHeight - 65 && p.x >= canvasWidth / 2 - 70 && p.x <= canvasWidth / 2 + 70) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_lobi');
                return true;
            }
            if (Math.hypot(p.x - 85, p.y - 230) < 85) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_kulis');
                return true;
            }
            if (Math.hypot(p.x - 230, p.y - 250) < 85) {
                if (typeof openStageQueueModal === 'function') openStageQueueModal();
                return true;
            }
            return false;
        }
        if (currentRoom === "kultur_merkezi_kulis") {
            if (p.y >= canvasHeight - 65 && p.x >= canvasWidth / 2 - 70 && p.x <= canvasWidth / 2 + 70) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_lobi');
                return true;
            }
            if (Math.hypot(p.x - 925, p.y - 235) < 85) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_sahne');
                return true;
            }
            return false;
        }
        if (currentRoom === "kultur_merkezi_sinema") {
            if (p.y >= canvasHeight - 65 && p.x >= canvasWidth / 2 - 70 && p.x <= canvasWidth / 2 + 70) {
                if (typeof changeRoom === 'function') changeRoom('kultur_merkezi_lobi');
                return true;
            }
            return false;
        }

        if (currentRoom === "pet_shop") {
            const isNearExit = p.y >= canvasHeight - 45
                && p.x >= canvasWidth / 2 - 85
                && p.x <= canvasWidth / 2 + 85;
            if (isNearExit) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            const distDoctor = Math.hypot(p.x - 665, p.y - 268);
            const distDesk = Math.hypot(p.x - 840, p.y - 305);
            if (distDoctor < 130 || distDesk < 130) {
                if (typeof triggerVeterinerGreeting === 'function') triggerVeterinerGreeting();
                if (typeof openPetShopModal === 'function') openPetShopModal();
                return true;
            }
            const distBoutique = Math.hypot(p.x - 150, p.y - 440);
            if (distBoutique < 130) {
                if (typeof openAnimalCostumeBoutiqueModal === 'function') openAnimalCostumeBoutiqueModal();
                return true;
            }
            return false;
        }

        if (currentRoom === "kafe") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            if (p.x >= 20 && p.x <= 260 && p.y <= 120) {
                if (typeof triggerPlayerAction === 'function') triggerPlayerAction('tea');
                return true;
            }
            let tables = (typeof cafeTables !== 'undefined') ? cafeTables : [];
            let nearest = null;
            let minDist = 120;
            tables.forEach(t => {
                let cx = t.x + t.w / 2;
                let cy = t.y + t.h / 2;
                let dist = Math.hypot(p.x - cx, p.y - cy);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = t;
                }
            });
            if (nearest) {
                if (nearest.id === 'blackjack') {
                    if (typeof openBlackjackModal === 'function') openBlackjackModal();
                } else if (socket) {
                    socket.emit('requestTableOptions', nearest.id);
                } else if (nearest.id === 'xox') {
                    if (typeof openXoxModal === 'function') openXoxModal();
                } else if (nearest.id === 'amiral') {
                    if (typeof openAmiralBattiModal === 'function') openAmiralBattiModal();
                }
                return true;
            }
            return false;
        }

        if (currentRoom === "ganyan") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            let distTjk = Math.hypot(p.x - 140, p.y - 300);
            let distStable = Math.hypot(p.x - 650, p.y - 350);
            if (distTjk < 120) {
                if (typeof openGanyanKuponModal === 'function') openGanyanKuponModal();
                return true;
            }
            if (distStable < 120) {
                if (typeof openHorseRentalModal === 'function') openHorseRentalModal();
                return true;
            }
            return false;
        }

        if (currentRoom === "nargile_cafe") {
            let distTekli = Math.hypot(p.x - 255, p.y - 242);
            let distEsli = Math.hypot(p.x - 545, p.y - 242);
            if (distTekli < 130) {
                if (socket) socket.emit('requestTableOptions', 'okey101_tekli');
                return true;
            }
            if (distEsli < 130) {
                if (socket) socket.emit('requestTableOptions', 'okey101');
                return true;
            }
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            return false;
        }

        if (currentRoom === "sahil") {
            if (p.x >= canvasWidth - 66 && p.y >= 180 && p.y <= 360) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            let distSwan = Math.hypot(p.x - 135, p.y - 188);
            if (distSwan < 85) {
                if (typeof handleRentSwanBoat === 'function') handleRentSwanBoat();
                return true;
            }
            let distBar = Math.hypot(p.x - 715, p.y - 425);
            if (distBar < 95) {
                if (typeof openCocktailBarModal === 'function') openCocktailBarModal();
                return true;
            }
            if (typeof triggerFishing === 'function') triggerFishing();
            return true;
        }

        if (currentRoom === "sokak") {
            if (p.x <= 66 && p.y >= 180 && p.y <= 330) {
                if (typeof changeRoom === 'function') changeRoom('sahil');
                return true;
            }
            if (p.x >= canvasWidth - 66 && p.y >= 180 && p.y <= 330) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            if (p.x <= 235 && p.y <= 120) {
                if (typeof changeRoom === 'function') changeRoom('emlakci');
                return true;
            }
            if (p.x >= 260 && p.x <= 540 && p.y <= 120) {
                if (typeof changeRoom === 'function') changeRoom('kafe');
                return true;
            }
            if (p.x >= 560 && p.y <= 120) {
                if (typeof changeRoom === 'function') changeRoom('nargile_cafe');
                return true;
            }
            if (p.x <= 250 && p.y >= 335) {
                if (typeof openHousingPortalModal === 'function') openHousingPortalModal();
                return true;
            }
            if (p.x >= 270 && p.x <= 530 && p.y >= 335) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            if (p.x >= 550 && p.y >= 335) {
                if (typeof changeRoom === 'function') changeRoom('market');
                return true;
            }
            return false;
        }

        if (currentRoom === "cadde") {
            if (p.x <= 66 && p.y >= 140 && p.y <= 330) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            if (p.x >= 90 && p.x <= 390 && p.y <= 135) {
                if (typeof changeRoom === 'function') changeRoom('ganyan');
                return true;
            }
            if (p.x >= 440 && p.x <= 740 && p.y <= 135) {
                if (typeof changeRoom === 'function') changeRoom('dedenin_yeri');
                return true;
            }
            if (p.x >= 245 && p.x <= 495 && p.y >= 335) {
                if (typeof openBillboardAdModal === 'function') openBillboardAdModal();
                return true;
            }
            if (p.x <= 225 && p.y >= 330) {
                if (typeof changeRoom === 'function') changeRoom('pet_shop');
                return true;
            }
            if (p.x >= 520 && p.y >= 330) {
                if (typeof changeRoom === 'function') {
                    changeRoom('dostlar_kiraathanesi');
                }
                return true;
            }
            return false;
        }

        if (currentRoom === "star_caddesi") {
            if (typeof handleStarCaddesiMobileInteract === 'function') {
                let handled = handleStarCaddesiMobileInteract(p);
                if (handled) return true;
            }
            return false;
        }

        if (currentRoom === "meydanv2") {
            if (typeof handleMeydanV2MobileInteract === 'function') {
                let handled = handleMeydanV2MobileInteract(p);
                if (handled) return true;
            }
            return false;
        }

        if (currentRoom === "vip_club") {
            if (typeof handleVipClubMobileInteract === 'function') {
                let handled = handleVipClubMobileInteract(p);
                if (handled) return true;
            }
            return false;
        }

        if (currentRoom === "sahilv2") {
            if (typeof handleSahilV2MobileInteract === 'function') {
                let handled = handleSahilV2MobileInteract(p);
                if (handled) return true;
            }
            return false;
        }

        if (currentRoom === "dostlar_kiraathanesi") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            // Çaycı Hüseyin Usta & Çay Ocağı
            if (Math.hypot(p.x - 115, p.y - 145) < 95) {
                if (typeof openKiraathaneBarModal === 'function') openKiraathaneBarModal();
                return true;
            }
            // 1. Batak (4 Kişilik Normal Batak) (cx: 320, cy: 230)
            if (Math.hypot(p.x - 320, p.y - 230) < 100) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'batak4');
                return true;
            }
            // 2. Batak (3 Kişilik Gömmeli Batak) (cx: 320, cy: 440)
            if (Math.hypot(p.x - 320, p.y - 440) < 100) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'batak');
                return true;
            }
            // 3. Dost Kazığı (4 Kişilik) (cx: 720, cy: 230)
            if (Math.hypot(p.x - 720, p.y - 230) < 100) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'dost_kazigi');
                return true;
            }
            // 4. Dost Kazığı (3 Kişilik) (cx: 720, cy: 440)
            if (Math.hypot(p.x - 720, p.y - 440) < 100) {
                let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
                if (sock) sock.emit('requestTableOptions', 'dost_kazigi_3p');
                return true;
            }
            return false;
        }

        if (currentRoom === "emlakci") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            if (Math.hypot(p.x - 400, p.y - 135) < 95) {
                if (typeof openRealEstateModal === 'function') openRealEstateModal();
                return true;
            }
            if (Math.hypot(p.x - 170, p.y - 280) < 95) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('standart');
                return true;
            }
            if (Math.hypot(p.x - 400, p.y - 280) < 95) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('garden');
                return true;
            }
            if (Math.hypot(p.x - 630, p.y - 280) < 95) {
                if (typeof openMaketInspectModal === 'function') openMaketInspectModal('pool');
                return true;
            }
            return false;
        }

        if (currentRoom === "dedenin_yeri") {
            let distExit = Math.hypot(p.x - (canvasWidth / 2), p.y - (canvasHeight - 35));
            if (distExit < 75) {
                if (typeof changeRoom === 'function') changeRoom('cadde');
                return true;
            }
            if (Math.hypot(p.x - 105, p.y - 155) < 120) {
                if (typeof openSlotModal === 'function') openSlotModal();
                return true;
            }
            if (Math.hypot(p.x - 700, p.y - 180) < 120) {
                if (typeof openRouletteModal === 'function') openRouletteModal();
                return true;
            }
            let casinoT = (typeof casinoTables !== 'undefined' && casinoTables[0]) ? casinoTables[0] : { x: 310, y: 155, w: 180, h: 135 };
            let cx = casinoT.x + casinoT.w / 2;
            let cy = casinoT.y + casinoT.h / 2;
            if (Math.hypot(p.x - cx, p.y - cy) < 130) {
                if (typeof openBlackjackModal === 'function') openBlackjackModal();
                return true;
            }
            return false;
        }

        if (currentRoom === "market") {
            if (p.x >= 520 && p.y <= 170) {
                if (typeof openFurnitureMarketModal === 'function') openFurnitureMarketModal();
                return true;
            }
            if (p.y >= canvasHeight - 90) {
                if (typeof changeRoom === 'function') changeRoom('sokak');
                return true;
            }
            return false;
        }

        if (currentRoom.startsWith("house_")) {
            if (typeof getCurrentViewingHouse === 'function') {
                let house = getCurrentViewingHouse();
                if (house && house.furniture) {
                    let stand = house.furniture.find(f => f.id === 'meyve_arabasi');
                    if (stand && Math.hypot(p.x - stand.x, p.y - stand.y) < 110) {
                        if (typeof openLemonadeStandModal === 'function') {
                            openLemonadeStandModal(house);
                            return true;
                        }
                    }
                    let slotObj = house.furniture.find(f => f.id === 'slot_machine');
                    if (slotObj && !window.isHouseEditMode && Math.hypot(p.x - slotObj.x, p.y - slotObj.y) < 110) {
                        if (typeof openSlotModal === 'function') {
                            window.currentSlotHouseOwner = house.owner;
                            openSlotModal();
                            return true;
                        }
                    }
                    let rouletteObj = house.furniture.find(f => f.id === 'roulette_table');
                    if (rouletteObj && !window.isHouseEditMode && Math.hypot(p.x - rouletteObj.x, p.y - rouletteObj.y) < 110) {
                        if (typeof openRouletteModal === 'function') {
                            openRouletteModal();
                            return true;
                        }
                    }
                }
            }
            if (p.x <= 90 && p.y >= canvasHeight - 90) {
                if (window.isHouseEditMode) {
                    if (typeof warnHouseEditActive === 'function') warnHouseEditActive();
                    return true;
                }
                if (currentRoom.startsWith("house_ornek_")) {
                    if (typeof exitHouseTour === 'function') exitHouseTour();
                    else if (typeof changeRoom === 'function') changeRoom('emlakci');
                } else {
                    if (typeof changeRoom === 'function') changeRoom('sokak');
                }
                return true;
            }
            return false;
        }

        return false;
    }

    // Global dışa aktarım
    window.checkRoomWalkPortals = checkRoomWalkPortals;
    window.handleRoomInteractionClick = handleRoomInteractionClick;
    window.handleRoomMobileInteract = handleRoomMobileInteract;
})();
