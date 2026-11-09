// public/js/isgSecurityClient.js - İş Sağlığı ve Güvenliği (İSG) Şefi Semihus Aydınus & Madenci Ekipman Mağazası
(function() {
    'use strict';

    // Semihus Aydınus'un Periyodik İSG Tavsiyeleri ve Uyarı Replikleri
    const ISG_QUOTES = [
        "SIKINTI YOK, BARET VAR BARET!",
        "Baretsiz ve yeleksiz sahaya adım atmak yasaktır!",
        "Önce İş Güvenliği! Baret kafayı, yelek canı korur gençler.",
        "Karanlık madende reflektör hayat kurtarır!",
        "Sıfır kaza hedefimizdir; ekipmanını tam kuşan, güvenle çalış.",
        "İş güvenliği şansa bırakılmaz, tedbirini almadan kazma vurulmaz!",
        "Baretsiz madenci, freni patlamış kamyona benzer!",
        "Her kural bir tecrübenin, her baret bir hayatın eseridir gençler."
    ];

    // İSG Mağazası Ekipman Kataloğu (Gerçek Şantiye & Maden Standartları)
    const ISG_CATALOG = {
        hardHats: [
            { id: 'baret_beyaz', name: 'Beyaz Mühendis Bareti', price: 150, role: 'Mühendis, Mimar, İSG Uzmanı', color: '#f8fafc', icon: '⛑️', desc: 'Darbe sönümleyici polietilen gövde, tepe kavisli ve çene bağlı asil beyaz baret.' },
            { id: 'baret_sari', name: 'Sarı Madenci Bareti', price: 120, role: 'Maden & Saha İşçisi', color: '#facc15', icon: '👷', desc: 'Klasik şantiye ve madenci sarısı, yüksek mukavemetli koruyucu baret.' },
            { id: 'baret_turuncu', name: 'Turuncu Formen Bareti', price: 140, role: 'Formen, Şantiye Şefi, Sörveyan', color: '#f97316', icon: '⛑️', desc: 'Saha denetçileri ve ustabaşılar için yüksek görünürlüklü turuncu baret.' },
            { id: 'baret_mavi', name: 'Mavi Teknisyen Bareti', price: 130, role: 'Elektrikçi, Bakım Operatörü', color: '#0284c7', icon: '⛑️', desc: 'Teknik bakım ve işletme teknisyenleri için dayanıklı mavi emniyet bareti.' },
            { id: 'baret_kirmizi', name: 'Kırmızı İSG & Yangın Bareti', price: 140, role: 'İSG Denetçisi, Yangın & Kalite', color: '#dc2626', icon: '⛑️', desc: 'Acil durum, yangın güvenliği ve saha denetim amirleri için kırmızı baret.' },
            { id: 'baret_yesil', name: 'Yeşil Çevre & Sağlık Bareti', price: 130, role: 'Çevre Mühendisi, Sağlık Görevlisi', color: '#16a34a', icon: '⛑️', desc: 'Saha sağlık ve çevre mühendisleri için özel yeşil koruyucu baret.' }
        ],
        reflectiveVests: [
            { id: 'vest_reflector_yellow', name: 'Neon Sarı Reflektörlü Yelek', price: 180, role: 'EN ISO 20471 Maden & Şantiye', color: '#84cc16', icon: '🦺', desc: 'Floresan neon sarı-yeşil yüksek görünürlük, 3M gümüş reflektör bantlar ve İSG kimlik cepli.' },
            { id: 'vest_reflector_orange', name: 'Neon Turuncu Reflektörlü Yelek', price: 180, role: 'Yol, Altyapı & Maden Sahası', color: '#f97316', icon: '🦺', desc: 'Alacakaranlık ve tozlu tünellerde maksimum görünürlük sağlayan neon turuncu güvenlik yeleği.' },
            { id: 'vest_reflector_blue', name: 'Mavi Reflektörlü Mühendis Yeleği', price: 190, role: 'Saha Mühendisi & Teknik Denetim', color: '#2563eb', icon: '🦺', desc: 'Mühendis ve teknik personel için saks mavisi kumaş, çift reflektör şeritli iş yeleği.' },
            { id: 'vest_reflector_red', name: 'Kırmızı Reflektörlü İSG Yeleği', price: 190, role: 'İSG Amiri & Güvenlik Yetkilisi', color: '#dc2626', icon: '🦺', desc: 'İş sağlığı ve güvenliği şefleri için yetkili kırmızı kumaş ve yüksek yansıtıcılı reflektörler.' }
        ]
    };

    // Semihus Aydınus Canlı Durum Yönetimi
    let semihusQuoteIndex = 0;
    let semihusLastQuoteTime = Date.now();
    let semihusWarningText = null;
    let semihusWarningExpiresAt = 0;
    let activeShopTab = 'hardHats'; // 'hardHats' | 'reflectiveVests'

    /**
     * Oyuncunun Baret ve Reflektörlü Yelek Giyme Durumunu Denetler
     */
    function isPlayerWearingSafetyGear(p) {
        if (!p) return { ok: false, hasHat: false, hasVest: false, hatId: null, vestId: null };

        let hat = p.hat || (p.avatar && p.avatar.hat) || '';
        let shirt = p.shirt || (p.avatar && p.avatar.shirt) || (p.color && (String(p.color).startsWith('vest_reflector_') || String(p.color).startsWith('shirts_vest_reflector_') || String(p.color).startsWith('tshirts_vest_reflector_')) ? p.color : '');
        let outfit = p.outfit || (p.avatar && p.avatar.outfit) || '';

        const hasHat = typeof hat === 'string' && (hat.startsWith('baret_') || hat.startsWith('hats_baret_'));
        const hasVest = (typeof shirt === 'string' && (shirt.startsWith('vest_reflector_') || shirt.startsWith('tshirts_vest_reflector_') || shirt.startsWith('shirts_vest_reflector_'))) ||
                        (typeof outfit === 'string' && (outfit.startsWith('vest_reflector_') || outfit.startsWith('shirts_vest_reflector_') || outfit.startsWith('tshirts_vest_reflector_')));

        return {
            ok: hasHat && hasVest,
            hasHat,
            hasVest,
            hatId: hasHat ? hat : null,
            vestId: hasVest ? (shirt || outfit) : null
        };
    }
    window.isPlayerWearingSafetyGear = isPlayerWearingSafetyGear;

    /**
     * Madene Giriş Yapılmak İstendiğinde Güvenlik Denetimi Yapar
     * Ekipman eksikse girişi engeller ve Semihus Aydınus'u konuşturur!
     */
    function verifyMineCaveEntrance(player) {
        const gear = isPlayerWearingSafetyGear(player);
        if (gear.ok) return true;

        let warningSpeech = "Baretsiz yeleksiz almam gençler!";
        let toastMsg = "⚠️ İş Güvenliği İhlali: Baretsiz ve reflektörlü yeleksiz madene girilemez! Semihus Aydınus'tan ekipman temin etmelisin.";

        if (!gear.hasHat && !gear.hasVest) {
            warningSpeech = "Baretsiz yeleksiz almam gençler!";
            toastMsg = "⚠️ İş Güvenliği: Baretsiz ve yeleksiz madene adım atamazsın! Semihus Aydınus'tan baret ve yelek temin et.";
        } else if (!gear.hasHat) {
            warningSpeech = "Baretsiz almam gençler! Kafana taş düşse ne yapacaksın?";
            toastMsg = "⚠️ İş Güvenliği: Baretsiz madene girilemez! Semihus Aydınus'tan bir baret temin et.";
        } else if (!gear.hasVest) {
            warningSpeech = "Yeleksiz almam gençler! Karanlık madende seni nasıl göreceğiz?";
            toastMsg = "⚠️ İş Güvenliği: Reflektörlü yeleksiz madene girilemez! Semihus Aydınus'tan yelek temin et.";
        }

        // Semihus Aydınus konuşma balonunu tetikle
        triggerSemihusWarning(warningSpeech);

        if (typeof showFloatingToast === 'function') {
            showFloatingToast(toastMsg, 'warning');
        }

        // Oyuncuyu kapı eşiğinden güvenli mesafeye geri it
        if (player) {
            player.x = 750;
            player.y = 475;
            if (typeof window.stopPlayerWalking === 'function') {
                window.stopPlayerWalking();
            } else if (typeof targetWalkPos !== 'undefined') {
                targetWalkPos = null;
            }
        }

        return false;
    }
    window.verifyMineCaveEntrance = verifyMineCaveEntrance;

    /**
     * Semihus Aydınus'un Acil Güvenlik Uyarısı Konuşmasını Başlatır
     */
    function triggerSemihusWarning(text) {
        semihusWarningText = text;
        semihusWarningExpiresAt = Date.now() + 5000;
        semihusLastQuoteTime = Date.now() + 5000; // Normal 1 dakikalık periyodik döngüyü uyarının bitimine ötele
    }
    window.triggerSemihusWarning = triggerSemihusWarning;

    /**
     * Semihus Aydınus 3D Katı Model Çizimi & İSG Kontrol Noktası (Cadde 2)
     */
    function drawSemihusAydinusNpc(ctx, now, myAvatar, mouseX, mouseY) {
        const npcX = 735; // Kullanıcı isteği: 50px sola, 10px yukarı alındı (785 - 50 = 735, 470 - 10 = 460)
        const npcY = 460;
        const scale = 1.25; // Kullanıcı isteği: %20-30 civarında (%25) oyuna tam uygun büyütme
        const groundY = npcY + 16; // Ayakların yere bastığı zemin temas noktası
        const dist = (myAvatar && typeof myAvatar.x === 'number') ? Math.hypot(myAvatar.x - npcX, myAvatar.y - npcY) : 999;
        const isHover = (mouseX >= npcX - 45 && mouseX <= npcX + 75 && mouseY >= npcY - 70 && mouseY <= npcY + 30);

        ctx.save();
        // Zemin temas noktası referans alınarak %25 büyütme (yukarı ve çevreye orantılı büyüme)
        ctx.translate(npcX, groundY);
        ctx.scale(scale, scale);
        ctx.translate(-npcX, -groundY);

        // 1. ÇİFT KATMANLI KONTAK GÖLGELERİ (3D Solid Grounding)
        // A) Yaygın Ortam Gölgesi (Ambient Occlusion)
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.beginPath();
        ctx.ellipse(npcX, npcY + 16, 18, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // B) Masa & Duba Gölgesi
        ctx.beginPath();
        ctx.ellipse(npcX + 32, npcY + 18, 14, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // C) Çekirdek Yere Mıhlama Gölgesi
        ctx.fillStyle = "rgba(0, 0, 0, 0.80)";
        ctx.beginPath();
        ctx.ellipse(npcX, npcY + 15, 11, 4, 0, 0, Math.PI * 2);
        ctx.ellipse(npcX + 32, npcY + 17, 9, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. İSG KONTROL NOKTASI MASASI & TRAFİK DUBASI (Safety Checkpoint Desk)
        const deskX = npcX + 30;
        const deskY = npcY - 6;

        // Masa Gövdesi (Metalik Gri & Sarı-Siyah Güvenlik Şeritleri)
        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(deskX - 12, deskY, 24, 22, 3);
        ctx.fill();
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Çapraz Sarı-Siyah Güvenlik Şeritleri (Hazard Stripes)
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(deskX - 11, deskY + 6, 22, 10, 2);
        ctx.clip();
        ctx.fillStyle = "#facc15";
        ctx.fillRect(deskX - 11, deskY + 6, 22, 10);
        ctx.fillStyle = "#0f172a";
        for (let s = -15; s < 35; s += 7) {
            ctx.beginPath();
            ctx.moveTo(deskX - 11 + s, deskY + 16);
            ctx.lineTo(deskX - 11 + s + 4, deskY + 16);
            ctx.lineTo(deskX - 11 + s + 9, deskY + 6);
            ctx.lineTo(deskX - 11 + s + 5, deskY + 6);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();

        // Masa Üstü İSG Denetim Panosu (Clipboard)
        ctx.fillStyle = "#78350f";
        ctx.fillRect(deskX - 7, deskY - 5, 14, 5);
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(deskX - 5, deskY - 4, 10, 4);

        // Trafik Dubası (Turuncu Reflektörlü Güvenlik Dubası)
        const coneX = npcX + 48;
        const coneY = npcY + 12;
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.moveTo(coneX - 6, coneY);
        ctx.lineTo(coneX, coneY - 14);
        ctx.lineTo(coneX + 6, coneY);
        ctx.closePath();
        ctx.fill();
        // Beyaz Reflektör Bant
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(coneX - 3.5, coneY - 5);
        ctx.lineTo(coneX - 2, coneY - 9);
        ctx.lineTo(coneX + 2, coneY - 9);
        ctx.lineTo(coneX + 3.5, coneY - 5);
        ctx.closePath();
        ctx.fill();
        // Taban Plakası
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(coneX - 7, coneY, 14, 3);

        // 3. SEMİHUS AYDINUS KARAKTER ÇİZİMİ (2.5D İzometrik 8 Yönlü Duruş)
        const breathe = Math.sin(now / 520) * 1.2;

        // A) İş Botları (Çelik Burunlu Ağır Hizmet Botu)
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(npcX - 7, npcY + 10, 6, 7);
        ctx.fillRect(npcX + 2, npcY + 10, 6, 7);
        ctx.fillStyle = "#475569";
        ctx.fillRect(npcX - 7, npcY + 14, 6, 3);
        ctx.fillRect(npcX + 2, npcY + 14, 6, 3);

        // B) Lacivert İş Pantolonu (Reflektör Paçalı)
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(npcX - 8, npcY - 1, 7, 12);
        ctx.fillRect(npcX + 1, npcY - 1, 7, 12);
        // Paça Gümüş Reflektör Şeridi
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(npcX - 8, npcY + 7, 7, 1.5);
        ctx.fillRect(npcX + 1, npcY + 7, 7, 1.5);

        // C) Gövde: Koyu İş Gömleği & Neon Turuncu/Sarı Reflektörlü İSG Şefi Yeleği
        // İç Kömür Gömlek
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.roundRect(npcX - 9, npcY - 13 + breathe, 18, 14, 3);
        ctx.fill();

        // Neon Turuncu Yelek Katmanı
        ctx.fillStyle = "#f97316";
        ctx.beginPath();
        ctx.roundRect(npcX - 8.5, npcY - 12 + breathe, 17, 13, 2);
        ctx.fill();

        // Açık V-Yaka (İç Gömlek Görünümü)
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(npcX - 3.5, npcY - 12 + breathe);
        ctx.lineTo(npcX + 3.5, npcY - 12 + breathe);
        ctx.lineTo(npcX, npcY - 4 + breathe);
        ctx.closePath();
        ctx.fill();

        // Dikey Gümüş Reflektör Omuz Askıları
        ctx.fillStyle = "#f8fafc";
        ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
        ctx.shadowBlur = 4;
        ctx.fillRect(npcX - 6.5, npcY - 12 + breathe, 2.2, 11);
        ctx.fillRect(npcX + 4.3, npcY - 12 + breathe, 2.2, 11);

        // Yatay Gümüş Reflektör Bel Şeritleri
        ctx.fillRect(npcX - 8.5, npcY - 4 + breathe, 17, 1.8);
        ctx.fillRect(npcX - 8.5, npcY + 0.5 + breathe, 17, 1.8);
        ctx.shadowBlur = 0;

        // Sol Göğüs İSG Yetkili Kartı / Telsiz
        ctx.fillStyle = "#16a34a";
        ctx.fillRect(npcX - 6, npcY - 9 + breathe, 3.5, 3.0);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(npcX - 5, npcY - 8.2 + breathe, 1.5, 1.4);

        // D) Kollar & İSG Denetim Panosu (Sağ Elinde Tutar)
        ctx.fillStyle = "#334155";
        // Sol Kol (Yanda Doğal Duruş)
        ctx.fillRect(npcX - 11, npcY - 11 + breathe, 3.2, 10);
        ctx.fillStyle = "#ffd1a4";
        ctx.beginPath(); ctx.arc(npcX - 9.5, npcY + 0 + breathe, 2, 0, Math.PI * 2); ctx.fill();

        // Sağ Kol (İleri Doğru Panoyu Tutar)
        ctx.fillStyle = "#334155";
        ctx.fillRect(npcX + 8, npcY - 11 + breathe, 3.2, 8);
        ctx.fillStyle = "#ffd1a4";
        ctx.beginPath(); ctx.arc(npcX + 9.5, npcY - 2 + breathe, 2, 0, Math.PI * 2); ctx.fill();

        // E) Kafa, Boyun ve İSG Yüz İfadesi
        ctx.fillStyle = "#ffd1a4";
        ctx.fillRect(npcX - 3, npcY - 16 + breathe, 6, 4); // Boyun
        ctx.beginPath();
        ctx.arc(npcX, npcY - 20 + breathe, 8.5, 0, Math.PI * 2); // Kafa
        ctx.fill();

        // Karizmatik Bıyık & Gözler
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(npcX - 4.5, npcY - 22 + breathe, 2.2, 2.2); // Sol Göz
        ctx.fillRect(npcX + 2.3, npcY - 22 + breathe, 2.2, 2.2); // Sağ Göz
        // Bıyık (Gür Güvenlik Şefi Bıyığı)
        ctx.fillStyle = "#451a03";
        ctx.beginPath();
        ctx.roundRect(npcX - 5, npcY - 18 + breathe, 10, 3.2, [2, 2, 1, 1]);
        ctx.fill();

        // Çene Bağı (Baret Askısı)
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(npcX, npcY - 16.5 + breathe, 5.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // F) Beyaz Şef Bareti (EN 397 Standart Mühendis/İSG Şefi Bareti)
        // Baret Siperliği (Visor)
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.ellipse(npcX, npcY - 24 + breathe, 12.5, 3.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Baret Kubbesi (Dome)
        const domeGrad = ctx.createLinearGradient(npcX - 8, npcY - 33 + breathe, npcX + 8, npcY - 23 + breathe);
        domeGrad.addColorStop(0, "#ffffff"); // Işık vuruşu
        domeGrad.addColorStop(0.5, "#f8fafc");
        domeGrad.addColorStop(1, "#94a3b8"); // Gölge derinliği
        ctx.fillStyle = domeGrad;
        ctx.beginPath();
        ctx.arc(npcX, npcY - 26 + breathe, 8.8, Math.PI, 0, false);
        ctx.closePath();
        ctx.fill();

        // Tepe Darbe Kaburgası (Crown Rib)
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(npcX - 1.5, npcY - 34 + breathe, 3.0, 9.5, 1.5);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Ön Yeşil Hilal / İSG Haçı Amblemi
        ctx.fillStyle = "#16a34a";
        ctx.beginPath();
        ctx.arc(npcX, npcY - 25.5 + breathe, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(npcX - 0.6, npcY - 27 + breathe, 1.2, 3.0);
        ctx.fillRect(npcX - 1.5, npcY - 26.1 + breathe, 3.0, 1.2);

        // 4. İSİM ETİKETİ (Yalnızca "Semihus Aydınus", emojisiz ve unvansız - Kafayı kapatmaması için yukarı kaldırıldı)
        const tagY = npcY - 55 + breathe;
        ctx.fillStyle = "rgba(15, 23, 42, 0.90)";
        ctx.beginPath();
        ctx.roundRect(npcX - 44, tagY, 88, 16, 5);
        ctx.fill();
        ctx.strokeStyle = isHover ? "#facc15" : "#22c55e";
        ctx.lineWidth = isHover ? 2.0 : 1.4;
        ctx.stroke();

        ctx.fillStyle = isHover ? "#fef08a" : "#86efac";
        ctx.font = "bold 9.5px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Semihus Aydınus", npcX, tagY + 11.5);

        // 6. SOHBET BALONCUĞU & İSG SÖZLERİ / UYARILARI
        let activeQuote = null;
        let isEmergencyWarning = false;

        if (semihusWarningText && Date.now() < semihusWarningExpiresAt) {
            activeQuote = semihusWarningText;
            isEmergencyWarning = true;
        } else {
            // Periyodik İSG sözleri (Kullanıcı talebi: Öğütlerin arasındaki süre tam 1 dakika / 60 saniye yapıldı)
            const quoteDuration = 7000;  // 7 saniye ekranda kalma ve rahat okunma süresi
            const quotePause = 60000;    // 60 saniye (1 dakika) öğütler arası bekleme süresi
            const quoteInterval = quoteDuration + quotePause; // 67 saniye toplam döngü
            const elapsed = Math.max(0, now - semihusLastQuoteTime);
            const cycleIndex = Math.floor(elapsed / quoteInterval);
            const timeInCycle = elapsed % quoteInterval;

            if (timeInCycle < quoteDuration) {
                activeQuote = ISG_QUOTES[cycleIndex % ISG_QUOTES.length];
            }
        }

        if (activeQuote) {
            drawSemihusSpeechBubble(ctx, npcX, tagY - 6, activeQuote, isEmergencyWarning);
        }

        ctx.restore();
    }
    window.drawSemihusAydinusNpc = drawSemihusAydinusNpc;

    /**
     * Semihus Aydınus İçin Özel İSG Konuşma Baloncuğu
     */
    function drawSemihusSpeechBubble(ctx, x, y, text, isWarning = false) {
        ctx.save();
        ctx.font = "bold 10px sans-serif";
        const textWidth = ctx.measureText(text).width;
        const padX = 12;
        const padY = 7;
        const bW = Math.max(120, textWidth + padX * 2);
        const bH = 24;
        const bX = x - bW / 2;
        const bY = y - bH;

        // Baloncuk Gövdesi
        ctx.fillStyle = isWarning ? "rgba(153, 27, 27, 0.95)" : "rgba(15, 23, 42, 0.94)";
        ctx.beginPath();
        ctx.roundRect(bX, bY, bW, bH, 8);
        ctx.fill();

        ctx.strokeStyle = isWarning ? "#ef4444" : "#f59e0b";
        ctx.lineWidth = isWarning ? 2.0 : 1.5;
        ctx.stroke();

        // Baloncuk Kuyruğu
        ctx.fillStyle = isWarning ? "#991b1b" : "#0f172a";
        ctx.beginPath();
        ctx.moveTo(x - 5, bY + bH);
        ctx.lineTo(x + 5, bY + bH);
        ctx.lineTo(x, bY + bH + 6);
        ctx.closePath();
        ctx.fill();

        // Metin
        ctx.fillStyle = isWarning ? "#fee2e2" : "#fef08a";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, bY + bH / 2);

        ctx.restore();
    }

    // =========================================================================
    // İSG CANLI DENEME KABİNİ & PODYUM AYNASI (FITTING ROOM & MANNEQUIN MIRROR)
    // =========================================================================

    const ISG_PREVIEW_ANGLES = [
        { id: 'down', label: 'Ön (Güney)' },
        { id: 'down-right', label: 'Sağ Ön' },
        { id: 'right', label: 'Sağ Yan (Doğu)' },
        { id: 'up-right', label: 'Sağ Arka' },
        { id: 'up', label: 'Arka (Kuzey)' },
        { id: 'up-left', label: 'Sol Arka' },
        { id: 'left', label: 'Sol Yan (Batı)' },
        { id: 'down-left', label: 'Sol Ön' }
    ];

    const SEMIHUS_TRYON_REACTIONS = {
        baret_beyaz: "Ooo şefim beyaz baret yakışmış! Şantiyeyi ve mühendislik ofisini sen yöneteceksin herhalde!",
        baret_sari: "İşte gerçek madenci ruhu! Sarı baretle madenin tozunu attırırsın gençler.",
        baret_turuncu: "Formenlik yakışır sana! Sahadaki tüm ekipler seni saygıyla dinler.",
        baret_mavi: "Teknik ekibin ve bakımın bel kemiğisin! Mavi baret sahada daima güven verir.",
        baret_kirmizi: "İSG Baş Denetçisi gibi durdun! Acil durum ve yangın güvenliği senden sorulur.",
        baret_yesil: "Çevre ve sağlık mühendisi havası geldi! Madenin can simidi ve doğa dostusun.",
        vest_reflector_yellow: "Neon sarı yelek parıl parıl parlıyor! Karanlık galeride 50 metreden fark edilirsin.",
        vest_reflector_orange: "Turuncu reflektörlü yelek tozlu tünellerde can kurtarır! Çok yerinde bir seçim.",
        vest_reflector_blue: "Saks mavisi mühendis yeleği çok havalı! Saha denetiminde karizma tavan.",
        vest_reflector_red: "Kırmızı İSG yetkili yeleği! Şef Semihus onayını kaptın, herkes sıraya girsin."
    };

    let isgPreviewAvatar = null;
    let isgPreviewFacing = 'down';
    let isgFacingAngleIndex = 0;
    let isgPreviewAnimFrame = null;
    let isgPreviewHat = null;
    let isgPreviewVest = null;
    let isgOriginalHat = null;
    let isgOriginalShirt = null;
    let isgOriginalColor = null;
    let isgOriginalOutfit = null;
    let isgOriginalCostume = null;

    /**
     * Önizleme Tuvali Üzerinde Fare/Dokunmatik ile Sürükleyerek Döndürme
     */
    function setupIsgCanvasDrag() {
        const canvas = document.getElementById('isgPreviewCanvas');
        if (!canvas || canvas.dataset.dragInit) return;
        canvas.dataset.dragInit = 'true';

        let isDragging = false;
        let startX = 0;

        canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diffX = e.clientX - startX;
            if (Math.abs(diffX) > 18) {
                rotateIsgPreview(diffX > 0 ? 1 : -1);
                startX = e.clientX;
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Mobil Dokunmatik Desteği
        canvas.addEventListener('touchstart', (e) => {
            if (e.touches && e.touches.length > 0) {
                isDragging = true;
                startX = e.touches[0].clientX;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDragging || !e.touches || e.touches.length === 0) return;
            const diffX = e.touches[0].clientX - startX;
            if (Math.abs(diffX) > 18) {
                rotateIsgPreview(diffX > 0 ? 1 : -1);
                startX = e.touches[0].clientX;
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    /**
     * Podyumdaki Karakteri 8 Yöne Döndürür
     */
    function rotateIsgPreview(delta) {
        isgFacingAngleIndex = (isgFacingAngleIndex + delta + ISG_PREVIEW_ANGLES.length) % ISG_PREVIEW_ANGLES.length;
        isgPreviewFacing = ISG_PREVIEW_ANGLES[isgFacingAngleIndex].id;
        const badge = document.getElementById('isgFacingBadge');
        if (badge) badge.innerText = ISG_PREVIEW_ANGLES[isgFacingAngleIndex].label;
    }
    window.rotateIsgPreview = rotateIsgPreview;

    /**
     * İSG Güvenlik & Madenci Ekipman Mağazası Modalı Açılışı
     */
    function openIsgSafetyShopModal() {
        const modal = document.getElementById('isgSafetyShopModal');
        if (!modal) return;
        modal.style.display = 'flex';

        // Aktif oyuncuyu ve kıyafetlerini tespit et
        const myPlayer = (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) ? players[myId] : (typeof myAvatar !== 'undefined' ? myAvatar : null);
        const sourceAv = (typeof myAvatar !== 'undefined' && myAvatar) ? myAvatar : myPlayer;

        const currentGen = (typeof getPlayerGender === 'function') ? getPlayerGender() : (window.myGender || (sourceAv && sourceAv.gender) || 'male');
        const currentModel = (sourceAv && (sourceAv.model || sourceAv.characterModel)) || (typeof window !== 'undefined' && window.selectedModelId) || 'classic_2';

        // Önizleme mankenini klonla
        isgPreviewAvatar = { ...(sourceAv || {}) };
        isgPreviewAvatar.gender = currentGen;
        isgPreviewAvatar.isFemale = (currentGen === 'female');
        isgPreviewAvatar.model = (currentModel === 'karakter_2' || currentModel === 'character_2') ? 'karakter_2' : 'classic_2';
        if (!isgPreviewAvatar.id && typeof window !== 'undefined') isgPreviewAvatar.id = window.myId || 'preview_self';

        // Orijinal eşyaları sıfırlama için kaydet
        isgOriginalHat = isgPreviewAvatar.hat || null;
        isgOriginalShirt = isgPreviewAvatar.shirt || null;
        isgOriginalColor = isgPreviewAvatar.color || null;
        isgOriginalOutfit = isgPreviewAvatar.outfit || null;
        isgOriginalCostume = isgPreviewAvatar.costume || null;

        // Halihazırda giyili İSG ekipmanı varsa önizlemeye doğrudan yansıt
        const gear = isPlayerWearingSafetyGear(sourceAv);
        isgPreviewHat = gear.hasHat ? (String(gear.hatId).replace(/^hats_/, '')) : null;
        isgPreviewVest = gear.hasVest ? (String(gear.vestId).replace(/^(shirts_|tshirts_)/, '')) : null;

        if (isgPreviewHat) isgPreviewAvatar.hat = isgPreviewHat;
        if (isgPreviewVest) {
            isgPreviewAvatar.shirt = isgPreviewVest;
            isgPreviewAvatar.color = isgPreviewVest;
        }

        isgPreviewFacing = 'down';
        isgFacingAngleIndex = 0;
        const badge = document.getElementById('isgFacingBadge');
        if (badge) badge.innerText = ISG_PREVIEW_ANGLES[0].label;

        const modelBadge = document.getElementById('isgModelBadge');
        if (modelBadge) {
            const isK2 = isgPreviewAvatar.model === 'karakter_2';
            modelBadge.innerText = (isK2 ? 'Karakter 2 (Chibi-HD)' : 'Karakter 1 (Klasik)') + (isgPreviewAvatar.isFemale ? ' 👩' : ' 👨');
        }

        setupIsgCanvasDrag();
        renderIsgShopUI();
        updateIsgLiveBadgesAndBubble();

        // Canlı podyum animasyon döngüsünü başlat
        if (isgPreviewAnimFrame) cancelAnimationFrame(isgPreviewAnimFrame);
        isgPreviewAnimFrame = requestAnimationFrame(renderIsgPreviewLoop);
    }
    window.openIsgSafetyShopModal = openIsgSafetyShopModal;

    function closeIsgSafetyShopModal() {
        const modal = document.getElementById('isgSafetyShopModal');
        if (modal) modal.style.display = 'none';
        if (isgPreviewAnimFrame) {
            cancelAnimationFrame(isgPreviewAnimFrame);
            isgPreviewAnimFrame = null;
        }
    }
    window.closeIsgSafetyShopModal = closeIsgSafetyShopModal;

    function switchIsgShopTab(tabKey) {
        activeShopTab = tabKey;
        renderIsgShopUI();
    }
    window.switchIsgShopTab = switchIsgShopTab;

    /**
     * Canlı 2.5D Podyum Çizim Döngüsü
     */
    function renderIsgPreviewLoop() {
        const modal = document.getElementById('isgSafetyShopModal');
        if (!modal || modal.style.display === 'none') {
            if (isgPreviewAnimFrame) {
                cancelAnimationFrame(isgPreviewAnimFrame);
                isgPreviewAnimFrame = null;
            }
            return;
        }

        const canvas = document.getElementById('isgPreviewCanvas');
        if (canvas && isgPreviewAvatar) {
            const ctx = canvas.getContext('2d');
            const cX = canvas.width / 2;
            const cY = 135;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Sahne ve Podyum Çizimi (İSG Sarı / Siyah Şeritli & Yansımalı Podyum)
            // A) Ortam Sarı Işık Haleleri (Spotlight)
            const spotGrad = ctx.createRadialGradient(cX, cY + 30, 10, cX, cY + 30, 85);
            spotGrad.addColorStop(0, "rgba(245, 158, 11, 0.28)");
            spotGrad.addColorStop(0.5, "rgba(245, 158, 11, 0.08)");
            spotGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
            ctx.fillStyle = spotGrad;
            ctx.beginPath();
            ctx.ellipse(cX, cY + 30, 90, 32, 0, 0, Math.PI * 2);
            ctx.fill();

            // B) Podyum Dış Kaidesi (3D Metalik Kaide & Güvenlik Deseni)
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.ellipse(cX, cY + 38, 72, 24, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // C) Podyum İç Zemin Diski (Amber Yansıma)
            ctx.fillStyle = "rgba(245, 158, 11, 0.22)";
            ctx.beginPath();
            ctx.ellipse(cX, cY + 35, 60, 18, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(253, 224, 71, 0.7)";
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // D) Karakter Altı Çekirdek Kontak Gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
            ctx.beginPath();
            ctx.ellipse(cX, cY + 36, 26, 9, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Karakter Çizimi (Idle Bobbing & Canlı Nefes)
            const idleBob = Math.sin(Date.now() / 260) * 2.2;
            const cycle = Date.now() / 250;

            ctx.save();
            ctx.translate(cX, cY + idleBob);
            ctx.scale(2.0, 2.0);

            const isK2 = isgPreviewAvatar.model === 'karakter_2';
            if (isK2 && typeof Karakter2Renderer !== 'undefined') {
                Karakter2Renderer.draw(ctx, 0, 0, isgPreviewAvatar, isgPreviewFacing, false, 0, cycle, false, true);
            } else if (typeof drawClassic2Avatar === 'function') {
                drawClassic2Avatar(ctx, 0, 0, isgPreviewAvatar, isgPreviewFacing, false, 0, cycle, false, true);
            }

            ctx.restore();
        }

        isgPreviewAnimFrame = requestAnimationFrame(renderIsgPreviewLoop);
    }

    /**
     * Katalogdan Bir Ekipmanı Deneme Podyumuna Yansıtır
     */
    function previewIsgItem(category, itemId) {
        if (!isgPreviewAvatar) return;

        if (category === 'hats') {
            isgPreviewAvatar.hat = itemId;
            isgPreviewAvatar.hatColor = 'original';
            isgPreviewHat = itemId;
        } else if (category === 'shirts' || category === 'tshirts') {
            isgPreviewAvatar.shirt = itemId;
            isgPreviewAvatar.color = itemId;
            isgPreviewAvatar.shirtColor = 'original';
            isgPreviewAvatar.outfit = null; // Reflektörlü yelek gövdeye giyilir
            isgPreviewVest = itemId;
        }

        updateIsgLiveBadgesAndBubble(itemId);
        renderIsgShopUI();
    }
    window.previewIsgItem = previewIsgItem;

    /**
     * Güvenlik Rozetini, Semihus Repliklerini ve Kombin Butonunu Günceller
     */
    function updateIsgLiveBadgesAndBubble(lastInteractedItemId = null) {
        const liveBadge = document.getElementById('isgLiveStatusBadge');
        const bubbleText = document.getElementById('isgSemihusBubbleText');
        const comboBtn = document.getElementById('btnIsgBuyCombo');

        const hasHat = !!isgPreviewHat;
        const hasVest = !!isgPreviewVest;
        const isComboComplete = hasHat && hasVest;

        // 1. Canlı Güvenlik Durumu Rozeti
        if (liveBadge) {
            if (isComboComplete) {
                liveBadge.innerHTML = '🟢 Madene Giriş İzni: <b>ONAYLANDI</b> (Kombin Tam)';
                liveBadge.style.background = 'rgba(34, 197, 94, 0.2)';
                liveBadge.style.borderColor = '#22c55e';
                liveBadge.style.color = '#86efac';
            } else if (hasHat && !hasVest) {
                liveBadge.innerHTML = '🟡 Baret Var, <b>Reflektörlü Yelek Eksik!</b>';
                liveBadge.style.background = 'rgba(234, 179, 8, 0.2)';
                liveBadge.style.borderColor = '#eab308';
                liveBadge.style.color = '#fef08a';
            } else if (!hasHat && hasVest) {
                liveBadge.innerHTML = '🟡 Yelek Var, <b>Baret Eksik!</b>';
                liveBadge.style.background = 'rgba(234, 179, 8, 0.2)';
                liveBadge.style.borderColor = '#eab308';
                liveBadge.style.color = '#fef08a';
            } else {
                liveBadge.innerHTML = '🔴 <b>Yetersiz Donanım</b> (Giriş Engellendi)';
                liveBadge.style.background = 'rgba(239, 68, 68, 0.2)';
                liveBadge.style.borderColor = '#ef4444';
                liveBadge.style.color = '#fca5a5';
            }
        }

        // 2. Semihus Aydınus Anlık Tepki Baloncuğu
        if (bubbleText) {
            if (isComboComplete) {
                bubbleText.innerHTML = `👏 <b>Harika bir İSG kombini!</b> İşte profesyonel madenci böyle olur gençler! Baret kafayı, yelek canı korur. Madenin kapısı ardına kadar açık!`;
            } else if (lastInteractedItemId && SEMIHUS_TRYON_REACTIONS[lastInteractedItemId]) {
                bubbleText.innerText = SEMIHUS_TRYON_REACTIONS[lastInteractedItemId];
            } else if (hasHat) {
                bubbleText.innerHTML = `Baret tamam ama yeleksiz içeriye alamam gençler! Karanlık madende seni nasıl göreceğiz? Bir de yelek seçip dene.`;
            } else if (hasVest) {
                bubbleText.innerHTML = `Yelek parıl parıl ama baretsiz olmaz gençler! Kafana taş düşse ne yapacaksın? Bir baret de kuşan.`;
            } else {
                bubbleText.innerText = `Baretsiz ve yeleksiz sahaya adım atmak yasaktır! Lütfen bir baret ve yelek seçip dene bakalım gençler.`;
            }
        }

        // 3. Tek Tıkla Kombin Satın Al / Kuşan Butonu
        if (comboBtn) {
            const myInv = (typeof window.myInventory !== 'undefined' && window.myInventory) ? window.myInventory : { hats: [], tshirts: [] };
            const myInvList = Array.isArray(myInv) ? myInv : ((myInv.hats || []).concat(myInv.tshirts || []).concat(myInv.shirts || []));

            let totalCost = 0;
            let unownedCount = 0;

            if (isgPreviewHat) {
                const isOwned = isUserOwningItem('hats', isgPreviewHat, myInvList);
                if (!isOwned) {
                    const item = ISG_CATALOG.hardHats.find(h => h.id === isgPreviewHat);
                    if (item) { totalCost += item.price; unownedCount++; }
                }
            }

            if (isgPreviewVest) {
                const isOwned = isUserOwningItem('shirts', isgPreviewVest, myInvList);
                if (!isOwned) {
                    const item = ISG_CATALOG.reflectiveVests.find(v => v.id === isgPreviewVest);
                    if (item) { totalCost += item.price; unownedCount++; }
                }
            }

            if (!hasHat && !hasVest) {
                comboBtn.innerText = "⚡ Bir Ekipman Seçip Deneyin";
                comboBtn.style.opacity = '0.6';
                comboBtn.style.cursor = 'not-allowed';
            } else if (unownedCount === 0) {
                comboBtn.innerText = "⚡ Bu Kombini Hemen Kuşan & Giy";
                comboBtn.style.opacity = '1';
                comboBtn.style.cursor = 'pointer';
                comboBtn.style.background = 'linear-gradient(135deg, #0284c7, #0369a1)';
            } else {
                comboBtn.innerText = `🛒 Bu Kombini Satın Al & Giy (${totalCost} TL)`;
                comboBtn.style.opacity = '1';
                comboBtn.style.cursor = 'pointer';
                comboBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            }
        }
    }

    /**
     * Denemeyi Sıfırlar ve Oyuncunun Orijinal Kıyafetini Yansıtır
     */
    function resetIsgPreviewOutfit() {
        if (!isgPreviewAvatar) return;
        isgPreviewAvatar.hat = isgOriginalHat;
        isgPreviewAvatar.shirt = isgOriginalShirt;
        isgPreviewAvatar.color = isgOriginalColor;
        isgPreviewAvatar.outfit = isgOriginalOutfit;
        isgPreviewAvatar.costume = isgOriginalCostume;

        isgPreviewHat = null;
        isgPreviewVest = null;

        updateIsgLiveBadgesAndBubble();
        renderIsgShopUI();

        if (typeof showFloatingToast === 'function') {
            showFloatingToast("↺ Deneme sıfırlandı, orijinal kıyafetlerinize dönüldü.", "info");
        }
    }
    window.resetIsgPreviewOutfit = resetIsgPreviewOutfit;

    /**
     * Önizlenen Kombini Satın Alır ve Giyer
     */
    function buyCurrentIsgCombo() {
        if (!isgPreviewHat && !isgPreviewVest) {
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("⚠️ Lütfen önce bir baret veya yelek deneyip seçin!", "warning");
            }
            return;
        }

        if (isgPreviewHat) {
            buyOrEquipIsgItem('hats', isgPreviewHat);
        }
        if (isgPreviewVest) {
            setTimeout(() => {
                buyOrEquipIsgItem('shirts', isgPreviewVest);
            }, 180);
        }

        setTimeout(() => {
            updateIsgLiveBadgesAndBubble();
            renderIsgShopUI();
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("🎉 Harika! Seçtiğin İSG kombini başarıyla kuşanıldı.", "success");
            }
        }, 400);
    }
    window.buyCurrentIsgCombo = buyCurrentIsgCombo;

    /**
     * Mağaza Arayüzünü ve Canlı Karakter Önizlemesini Çizer
     */
    function renderIsgShopUI() {
        const listEl = document.getElementById('isgShopItemsList');
        const balEl = document.getElementById('isgShopBalance');
        const statusBox = document.getElementById('isgSafetyStatusBox');
        if (!listEl) return;

        let myMoney = (typeof window.myMoney !== 'undefined') ? window.myMoney : ((typeof players !== 'undefined' && players[myId]?.money) || 0);
        if (balEl) balEl.innerText = `${myMoney.toLocaleString('tr-TR')} TL`;

        // Oyuncunun mevcut giyili kıyafet ve güvenlik durumu
        const myPlayer = (typeof myId !== 'undefined' && typeof players !== 'undefined' && players[myId]) ? players[myId] : (typeof myAvatar !== 'undefined' ? myAvatar : null);
        const myInv = (typeof window.myInventory !== 'undefined' && window.myInventory) ? window.myInventory : { hats: [], tshirts: [] };
        const myInvList = Array.isArray(myInv) ? myInv : ((myInv.hats || []).concat(myInv.tshirts || []).concat(myInv.shirts || []));

        const gear = isPlayerWearingSafetyGear(myPlayer);

        // Üst Güvenlik Durumu Bildirim Kutusu (Gerçek Sahip Olunan / Giyili Durum)
        if (statusBox) {
            const hatName = gear.hasHat ? getEquippedItemName('hats', gear.hatId) : 'Baret Takılmadı';
            const vestName = gear.hasVest ? getEquippedItemName('tshirts', gear.vestId) : 'Yelek Giyilmedi';

            const statusIcon = gear.ok ? '🟢' : '🔴';
            const statusTitle = gear.ok ? 'Şu Anki Durumunuz: MADENE GİRİŞE UYGUN' : 'Şu Anki Durumunuz: MADENE GİRİŞE UYGUN DEĞİL';
            const statusDesc = gear.ok
                ? 'Üzerinizde geçerli baret ve reflektörlü yelek mevcut. Dilerseniz farklı renk seçeneklerini soldaki aynada deneyebilirsiniz.'
                : 'Baretsiz ve reflektörlü yeleksiz madene giriş kesinlikle yasaktır! Aşağıdan baret ve yelek seçip deneyebilir veya satın alabilirsiniz.';

            statusBox.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 6px;">
                    <div style="font-size: 12.5px; font-weight: 900; color: ${gear.ok ? '#86efac' : '#fca5a5'}; display: flex; align-items: center; gap: 6px;">
                        <span>${statusIcon}</span> ${statusTitle}
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <span style="font-size: 10.5px; padding: 2px 8px; border-radius: 6px; background: ${gear.hasHat ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}; border: 1px solid ${gear.hasHat ? '#22c55e' : '#ef4444'}; color: ${gear.hasHat ? '#86efac' : '#fca5a5'};">
                            ⛑️ ${gear.hasHat ? hatName : 'Baret: Yok'}
                        </span>
                        <span style="font-size: 10.5px; padding: 2px 8px; border-radius: 6px; background: ${gear.hasVest ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}; border: 1px solid ${gear.hasVest ? '#22c55e' : '#ef4444'}; color: ${gear.hasVest ? '#86efac' : '#fca5a5'};">
                            🦺 ${gear.hasVest ? vestName : 'Yelek: Yok'}
                        </span>
                    </div>
                </div>
                <div style="font-size: 11px; color: #cbd5e1; line-height: 1.35;">${statusDesc}</div>
            `;
        }

        // Tab Butonları Vurgusu
        const tabHatBtn = document.getElementById('isgTabHatBtn');
        const tabVestBtn = document.getElementById('isgTabVestBtn');
        if (tabHatBtn) {
            tabHatBtn.style.background = activeShopTab === 'hardHats' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(30, 41, 59, 0.8)';
            tabHatBtn.style.borderColor = activeShopTab === 'hardHats' ? '#fcd34d' : 'rgba(255,255,255,0.1)';
        }
        if (tabVestBtn) {
            tabVestBtn.style.background = activeShopTab === 'reflectiveVests' ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'rgba(30, 41, 59, 0.8)';
            tabVestBtn.style.borderColor = activeShopTab === 'reflectiveVests' ? '#fcd34d' : 'rgba(255,255,255,0.1)';
        }

        const items = ISG_CATALOG[activeShopTab] || [];
        const categoryKey = activeShopTab === 'hardHats' ? 'hats' : 'shirts';

        let html = '';
        items.forEach(item => {
            const isEquipped = (categoryKey === 'hats') ? 
                (gear.hatId === item.id || gear.hatId === `hats_${item.id}`) : 
                (gear.vestId === item.id || gear.vestId === `shirts_${item.id}` || gear.vestId === `tshirts_${item.id}`);
            const isBeingPreviewed = (categoryKey === 'hats') ? (isgPreviewHat === item.id) : (isgPreviewVest === item.id);
            const isOwned = isUserOwningItem(categoryKey, item.id, myInvList);
            const canAfford = myMoney >= item.price;

            let actionBtn = '';
            if (isEquipped) {
                actionBtn = `<button type="button" disabled style="padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 8px; border: 1px solid #22c55e; background: rgba(34,197,94,0.2); color: #86efac; cursor: default;">✅ Giyili</button>`;
            } else if (isOwned) {
                actionBtn = `<button type="button" onclick="event.stopPropagation(); buyOrEquipIsgItem('${categoryKey}', '${item.id}')" style="padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 8px; border: 1px solid #38bdf8; background: linear-gradient(135deg, #0284c7, #0369a1); color: white; cursor: pointer; box-shadow: 0 4px 12px rgba(2,132,199,0.3);">⚡ Hemen Giy</button>`;
            } else {
                actionBtn = `<button type="button" onclick="event.stopPropagation(); buyOrEquipIsgItem('${categoryKey}', '${item.id}')" style="padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 8px; border: none; background: ${canAfford ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#475569'}; color: white; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; box-shadow: ${canAfford ? '0 4px 12px rgba(34,197,94,0.3)' : 'none'};">🛒 Satın Al & Giy</button>`;
            }

            html += `
            <div class="isg-item-card ${isBeingPreviewed ? 'previewing' : ''}" onclick="previewIsgItem('${categoryKey}', '${item.id}')" title="Bu ürünü canlı podyumda denemek için tıklayın">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(245, 158, 11, 0.12); border: 2px solid ${item.color}; display: flex; align-items: center; justify-content: center; font-size: 22px; box-shadow: 0 0 12px ${item.color}40; flex-shrink: 0;">
                        ${item.icon}
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 13.5px; color: #f8fafc; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            ${item.name}
                            <span style="font-size: 10px; background: rgba(245,158,11,0.18); border: 1px solid rgba(245,158,11,0.35); color: #fde047; padding: 1px 6px; border-radius: 5px;">${item.role}</span>
                            ${isBeingPreviewed ? '<span style="font-size: 10px; background: rgba(34,197,94,0.25); border: 1px solid #22c55e; color: #86efac; padding: 1px 6px; border-radius: 5px; font-weight: 800;">👁️ Deneniyor</span>' : ''}
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin: 3px 0;">${item.desc}</div>
                        <div style="font-size: 10.5px; color: ${isOwned ? '#38bdf8' : '#64748b'};">
                            ${isOwned ? '📦 Envanterinizde Mevcut' : '💵 Fiyat: ' + item.price + ' TL'}
                        </div>
                    </div>
                </div>
                <div style="text-align: right; min-width: 130px; flex-shrink: 0;">
                    <div style="font-size: 14px; font-weight: 900; color: #facc15; margin-bottom: 5px;">${item.price} TL</div>
                    ${actionBtn}
                </div>
            </div>`;
        });

        listEl.innerHTML = html;
    }

    function isUserOwningItem(category, itemId, inventory) {
        if (!inventory || !Array.isArray(inventory)) return false;
        const normKey = `${category}_${itemId}`;
        return inventory.includes(normKey) || 
               inventory.includes(itemId) || 
               inventory.includes(`shirts_${itemId}`) || 
               inventory.includes(`tshirts_${itemId}`);
    }

    function getEquippedItemName(category, itemId) {
        if (!itemId) return 'Yok';
        const cleanId = String(itemId).replace(/^(hats_|shirts_|tshirts_)/, '');
        const all = [...ISG_CATALOG.hardHats, ...ISG_CATALOG.reflectiveVests];
        const match = all.find(x => x.id === cleanId || x.id === itemId);
        return match ? match.name : itemId;
    }

    /**
     * İSG Ekipmanı Satın Alır ve Anında Giyer
     */
    function buyOrEquipIsgItem(category, itemId) {
        if (category === 'tshirts') category = 'shirts';
        if (typeof buyWardrobeItem === 'function') {
            buyWardrobeItem(category, itemId, 'original');
        } else {
            let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
            if (sock) sock.emit('buyWardrobeItem', { category, id: itemId, color: 'original' });
        }

        setTimeout(() => {
            renderIsgShopUI();
            updateIsgLiveBadgesAndBubble(itemId);
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("🦺 İSG Ekipmanı kuşanıldı! Güvenlik seviyeniz güncellendi.", "success");
            }
        }, 300);
    }
    window.buyOrEquipIsgItem = buyOrEquipIsgItem;
    window.renderIsgShopUI = renderIsgShopUI;

    // Canlı Bakiye ve Gardırop Güncelleme Dinleyicileri
    if (typeof socket !== 'undefined' && socket) {
        socket.on('moneyUpdate', (money) => {
            const amt = (typeof money === 'object' && money !== null && money.money !== undefined) ? money.money : money;
            const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
            window.myMoney = num;
            const balEl = document.getElementById('isgShopBalance');
            if (balEl) balEl.innerText = `${num.toLocaleString('tr-TR')} TL`;
            if (document.getElementById('isgSafetyShopModal')?.style.display === 'flex') {
                renderIsgShopUI();
            }
        });
        socket.on('wardrobeUpdate', () => {
            if (document.getElementById('isgSafetyShopModal')?.style.display === 'flex') {
                renderIsgShopUI();
            }
        });
    }

    /**
     * Tek Tıkla Standart İş Güvenliği Seti Al & Giy (Sarı Baret + Neon Sarı Yelek)
     */
    function buyStandardSafetyKit() {
        buyOrEquipIsgItem('hats', 'baret_sari');
        setTimeout(() => {
            buyOrEquipIsgItem('shirts', 'vest_reflector_yellow');
        }, 200);
    }
    window.buyStandardSafetyKit = buyStandardSafetyKit;

})();

