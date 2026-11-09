// Yardımcı: Oyuncu Konuşma Baloncuğu Çizici (Görünmez oyuncular dahil tam uyumlu)
function drawPlayerChatBubblesHelper(ctx, id, pX, bubbleY) {
    const bubblesMap = (typeof window !== 'undefined' && window.activeChatBubbles) || (typeof activeChatBubbles !== 'undefined' ? activeChatBubbles : null);
    if (!bubblesMap || !bubblesMap[id] || bubblesMap[id].length === 0) return;
    let bubbles = bubblesMap[id];

    for (let i = bubbles.length - 1; i >= 0; i--) {
        let bObj = bubbles[i];
        let text = bObj.text;

        if (bObj._textWidth === undefined) {
            ctx.font = "12px sans-serif";
            bObj._textWidth = ctx.measureText(text).width;
        }
        let textWidth = bObj._textWidth;
        let boxWidth = Math.max(textWidth + 18, 44);
        let boxHeight = 26;

        let isAllChat = (bObj.channel === 'all');
        let isAnon = !!bObj.isAnon;
        if (!isAnon && typeof players !== 'undefined' && players[id] && players[id].anonMaskExpiresAt > Date.now()) {
            isAnon = true;
        }

        ctx.save();
        if (isAnon) {
            // Maskeli oyuncu dumanlı koyu aura konuşma balonu
            ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
            ctx.shadowBlur = 12;
            ctx.shadowOffsetY = 2;

            // Koyu antrasit-obsidyen degrade
            let darkGrad = ctx.createLinearGradient(pX - boxWidth / 2, bubbleY - boxHeight, pX + boxWidth / 2, bubbleY);
            darkGrad.addColorStop(0, '#18181b');
            darkGrad.addColorStop(1, '#09090b');
            ctx.fillStyle = darkGrad;

            ctx.beginPath();
            ctx.roundRect(pX - boxWidth / 2, bubbleY - boxHeight, boxWidth, boxHeight, 8);
            ctx.fill();

            // Dumanlı çerçeve
            ctx.strokeStyle = '#52525b';
            ctx.lineWidth = 1.6;
            ctx.stroke();

            // Hafif duman/aura ışıltısı
            ctx.fillStyle = 'rgba(168, 85, 247, 0.28)';
            ctx.beginPath();
            ctx.arc(pX - boxWidth / 2 + 5, bubbleY - boxHeight + 4, 2.5, 0, Math.PI * 2);
            ctx.arc(pX + boxWidth / 2 - 6, bubbleY - boxHeight + 5, 2.2, 0, Math.PI * 2);
            ctx.fill();

            if (i === bubbles.length - 1) {
                ctx.fillStyle = '#09090b';
                ctx.beginPath();
                ctx.moveTo(pX - 4, bubbleY);
                ctx.lineTo(pX, bubbleY + 5);
                ctx.lineTo(pX + 4, bubbleY);
                ctx.fill();
            }

            ctx.fillStyle = '#f8fafc';
            ctx.textAlign = "center";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText(text, pX, bubbleY - 8);
        } else {
            ctx.fillStyle = isAllChat ? "#fffbeb" : "#ffffff";
            ctx.beginPath();
            ctx.roundRect(pX - boxWidth / 2, bubbleY - boxHeight, boxWidth, boxHeight, 8);
            ctx.fill();
            ctx.strokeStyle = isAllChat ? "#f59e0b" : "#334155";
            ctx.lineWidth = isAllChat ? 1.8 : 1.5;
            ctx.stroke();

            if (i === bubbles.length - 1) {
                ctx.fillStyle = isAllChat ? "#fffbeb" : "#ffffff";
                ctx.beginPath();
                ctx.moveTo(pX - 4, bubbleY);
                ctx.lineTo(pX, bubbleY + 5);
                ctx.lineTo(pX + 4, bubbleY);
                ctx.fill();
            }

            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "center";
            ctx.font = (bObj.channel === 'whisper_indicator') ? "italic 12px sans-serif" : "12px sans-serif";
            ctx.fillText(text, pX, bubbleY - 8);
        }
        ctx.restore();

        bubbleY -= (boxHeight + 6);
    }
}

// public/js/avatarRenderer.js - Karakter, Kıyafet, Saç, Oturma Pozu ve Aksesuar Çizim Motoru (8 Açılı İzometrik & Gerçekçi Anatomi)

// --- 8 AÇILI İZOMETRİK YÖN YARDIMCISI VE NORMALİZASYON ---
function normalize8WayFacing(facing) {
    if (!facing) return 'down';
    let f = String(facing).toLowerCase().replace('_', '-').trim();
    if (f === 's' || f === 'south' || f === 'down' || f === 'front' || f === 'on') return 'down';
    if (f === 'n' || f === 'north' || f === 'up' || f === 'back' || f === 'arka') return 'up';
    if (f === 'e' || f === 'east' || f === 'right' || f === 'sag') return 'right';
    if (f === 'w' || f === 'west' || f === 'left' || f === 'sol') return 'left';
    if (f === 'se' || f === 'southeast' || f === 'down-right' || f === 'right-down' || f === 'sag-ileri') return 'down-right';
    if (f === 'sw' || f === 'southwest' || f === 'down-left' || f === 'left-down' || f === 'sol-ileri') return 'down-left';
    if (f === 'ne' || f === 'northeast' || f === 'up-right' || f === 'right-up' || f === 'sag-geri') return 'up-right';
    if (f === 'nw' || f === 'northwest' || f === 'up-left' || f === 'left-up' || f === 'sol-geri') return 'up-left';
    return f;
}
if (typeof window !== 'undefined') {
    window.normalize8WayFacing = normalize8WayFacing;
}

// Kadın Anatomisi Tespiti (Bel inceltme, zarif bacaklar ve göğüs hatları için)
function isFemaleAvatar(p, shirtColor, hatType, shoeType) {
    if (p && (p.gender === 'female' || p.isFemale === true)) return true;
    if (p && (p.gender === 'male' || p.isFemale === false)) return false;

    // Kendi karakterimiz ve gardırop/soyunma odası önizlemesi tespiti
    const isSelfAvatar = !p || 
        (typeof window !== 'undefined' && (p === window.previewAvatar || (typeof previewAvatar !== 'undefined' && p === previewAvatar) || (typeof myAvatar !== 'undefined' && p === myAvatar) || (typeof dressingAvatar !== 'undefined' && p === dressingAvatar))) ||
        (typeof window !== 'undefined' && window.myId && p.id === window.myId);

    if (isSelfAvatar) {
        const selfGender = (typeof getPlayerGender === 'function') ? getPlayerGender() : (typeof window !== 'undefined' ? (window.myGender || window.selectedGender) : null);
        if (selfGender === 'male') return false;
        if (selfGender === 'female') return true;
    }

    if (typeof window !== 'undefined') {
        if (window.myGender === 'female' || window.selectedGender === 'female') {
            if (!p || p.id === window.myId) return true;
        }
        if (window.myGender === 'male' || window.selectedGender === 'male') {
            if (!p || p.id === window.myId) return false;
        }
    }
    if (typeof getPlayerGender === 'function') {
        let g = getPlayerGender();
        if (g === 'female' && (!p || p.id === (typeof window !== 'undefined' ? window.myId : null))) return true;
        if (g === 'male' && (!p || p.id === (typeof window !== 'undefined' ? window.myId : null))) return false;
    }
    let col = shirtColor || (p && (p.shirt || p.color || p.outfit)) || '';
    const femaleOutfits = [
        'outfit_c2_femme_chic', 'outfit_goth', 'outfit_business',
        'outfit_boho', 'outfit_sporty', 'outfit_turtleneck_skirt',
        'dress_k2_cyber_street', 'dress_k2_goth_grunge'
    ];
    if (col.startsWith('dress_') || col.startsWith('skirt_') || femaleOutfits.includes(col)) return true;
    let hat = hatType || (p && p.hair) || (p && p.hat) || '';
    const femaleHats = [
        'hair_long', 'hair_wavy', 'hair_ponytail', 'hair_braids', 'hair_bob', 'hair_hijab', 
        'beret_pink', 'crown', 'hair_blonde_curls', 'hair_bun_chopsticks', 'hair_redhead_wavy', 
        'hair_pigtails_ribbon', 'hair_k2_ponytail', 'hair_k2_messy_bun', 
        'hair_k2_curtain_bangs', 'hair_k2_french_bob', 'hair_k2_layered_blowout', 'hair_k2_half_up_braid',
        'hair_k2_twin_tails', 'hair_k2_wavy_shoulder', 'hair_k2_hime_cut'
    ];
    if (femaleHats.includes(hat) || (p && p.hair && femaleHats.includes(p.hair))) return true;
    let shoe = shoeType || (p && p.shoes) || '';
    if (['heels', 'flats', 'heels_gold', 'boots_thigh_high', 'sandals_gladiator'].includes(shoe)) return true;
    return false;
}
if (typeof window !== 'undefined') {
    window.isFemaleAvatar = isFemaleAvatar;
}

// Renk tonlama yardımcısı (Kumaş ışık ve gölge derinliği için sıfır-tahsisli önbellek)
const _colorBrightnessCache = new Map();
function adjustColorBrightness(col, percent) {
    if (!col || !col.startsWith('#')) return col;
    let key = col + percent;
    let cached = _colorBrightnessCache.get(key);
    if (cached !== undefined) return cached;
    let num = parseInt(col.slice(1), 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    let res = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    if (_colorBrightnessCache.size > 500) _colorBrightnessCache.clear();
    _colorBrightnessCache.set(key, res);
    return res;
}

// --- 1. AYAKKABI ÇİZİMİ (8 AÇILI İZOMETRİK TABAN & TOPUK) ---
function drawSingleShoe(targetCtx, x, y, shoeType, skinColor, angle = 0, isCrossed = false, facing = 'down', isFemale = false) {
    targetCtx.save();
    targetCtx.translate(x + 3.5, y + 2.5);
    if (angle !== 0) targetCtx.rotate(angle);
    targetCtx.translate(-(x + 3.5), -(y + 2.5));

    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');

    if (shoeType === 'classic') {
        // Cilalı Kösele Klasik Ayakkabı (Dikişli taban ve ışık parıltısı)
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y, 8, 4.5, [2, 3, 1, 1]);
        targetCtx.fill();
        targetCtx.fillStyle = isBack ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.45)";
        targetCtx.fillRect(x + 2, y + 1, 3, 1);
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(x, y + 3.8, 8, 1);
    } else if (shoeType === 'boots') {
        // Kışlık Deri Bot (Tırtıklı taban & dikişli burun)
        targetCtx.fillStyle = "#78350f";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y - 1, 8, 5.5, 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#1c1917";
        targetCtx.fillRect(x, y + 3.5, 8.5, 2);
        if (isBack) {
            targetCtx.fillStyle = "#451a03";
            targetCtx.fillRect(x + 3, y - 2, 2, 2);
        } else {
            targetCtx.strokeStyle = "rgba(255,255,255,0.2)";
            targetCtx.lineWidth = 0.8;
            targetCtx.strokeRect(x + 1, y, 6, 3);
        }
    } else if (shoeType === 'heels') {
        // Şık Topuklu Stiletto (Zarif kavisli burun ve ince topuk)
        targetCtx.fillStyle = "#e11d48";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 4, y + 2, 4, 2.3, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#9f1239";
        targetCtx.fillRect(x, y + 1.8, 1.4, 4.8);
        targetCtx.fillStyle = "rgba(255,255,255,0.3)";
        targetCtx.fillRect(x + 2.5, y + 1, 2, 0.8);
    } else if (shoeType === 'flats') {
        // Zarif Babet
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 3.5, y + 2, 3.8, 1.9, 0, 0, Math.PI * 2);
        targetCtx.fill();
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(x + 4, y + 1.5, 1.1, 0, Math.PI * 2); targetCtx.fill();
        }
    } else if (shoeType === 'heels_gold') {
        // Altın Simli Abiye Stiletto
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 4, y + 2, 4, 2.3, 0, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 1.8, 1.4, 4.8);
        targetCtx.fillStyle = "#ef4444";
        targetCtx.fillRect(x + 1.5, y + 4.5, 4, 0.8);
    } else if (shoeType === 'boots_thigh_high') {
        // Diz Üstü Süet Çizme (Zarif bacak saran hat)
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.roundRect(x - 0.5, y - 5, 8, 10, [3, 3, 1, 1]);
        targetCtx.fill();
        targetCtx.fillStyle = "#475569";
        targetCtx.fillRect(x + 3.2, y - 5, 0.9, 9);
    } else if (shoeType === 'sandals_gladiator') {
        // İncili Gladyatör Sandalet
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        targetCtx.fillRect(x, y, 7.5, 4);
        targetCtx.fillStyle = "#d97706";
        targetCtx.fillRect(x, y + 3.5, 7.5, 1);
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(x + 2, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(x + 5, y + 1.5, 1, 0, Math.PI * 2); targetCtx.fill();
        }
    } else if (shoeType === 'shoes_k2_high_sneakers') {
        // Air Jordan Tarzı Bileklikli Retro Sneaker (Classic / Classic 2 Uyumlu)
        targetCtx.fillStyle = "#18181b";
        targetCtx.fillRect(x + 1, y - 2, 6, 2);
        targetCtx.fillStyle = "#dc2626";
        targetCtx.fillRect(x + 1, y - 1.5, 6, 2.5);
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y + 2, 8, 2.8, 1);
        targetCtx.fill();
        targetCtx.fillRect(x + 2, y, 4, 2.5);
        targetCtx.fillStyle = "#18181b";
        targetCtx.fillRect(x + 2, y + 0.8, 3.5, 0.8);
        targetCtx.fillRect(x + 4.5, y + 0.2, 1.2, 0.8);
        targetCtx.fillStyle = "#dc2626";
        targetCtx.fillRect(x + 5.5, y + 1, 2.5, 1.5);
    } else if (shoeType === 'none') {
        // Çıplak Ayak
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        targetCtx.beginPath();
        targetCtx.ellipse(x + 3.5, y + 2, 3.5, 2, 0, 0, Math.PI * 2);
        targetCtx.fill();
    } else {
        // Varsayılan: Beyaz Tabanlı Sneaker
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y + 2, 8, 2.8, 1);
        targetCtx.fill();
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath();
        targetCtx.roundRect(x, y, 7.5, 2.8, [2, 2, 0, 0]);
        targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(x + 2, y + 1, 3.5, 1);
    }

    targetCtx.restore();
}

// --- 2. BACAKLAR VE AYAKKABILAR (8 AÇILI İZOMETRİK & KADIN/ERKEK ANATOMİSİ) ---
function drawAvatarLegsAndShoes(targetCtx, pX, pY, legSwing = 0, skinColor = "#ffd1a4", shoeType = "sneakers", isSkirt = false, isSitting = false, facing = "down", isFemale = false, pantsColor = null, legFilter = 'all') {
    let f = normalize8WayFacing(facing);
    let legColor = pantsColor || (isSkirt ? (skinColor || "#ffd1a4") : "#1e293b");
    let shadowColor = "rgba(0, 0, 0, 0.28)";
    let legW = isFemale ? 4.2 : 5; // Kadın karakterlerde daha zarif ve ince bacak kalınlığı

    if (isSitting) {
        targetCtx.save();

        if (f === 'right') {
            // SAĞA DÖNÜK PROFİL OTURMA
            // 1. Far Leg (bizden uzak bacak - sol bacak)
            if (legFilter === 'all' || legFilter === 'far') {
                targetCtx.fillStyle = legColor;
                targetCtx.fillRect(pX - 4, pY + 8, legW, 12);
                drawSingleShoe(targetCtx, pX - 5, pY + 19, shoeType, skinColor, 0, false, f, isFemale);
            }

            // 2. Near Leg (bizden yakın bacak - sağ bacak)
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.roundRect(pX - 5, pY + 6, 12, 6, [3, 4, 2, 2]);
                targetCtx.fill();
                targetCtx.fillRect(pX + 4, pY + 10, legW, 7);
                drawSingleShoe(targetCtx, pX + 4, pY + 16, shoeType, skinColor, 0.22, true, f, isFemale);
            }

        } else if (f === 'left') {
            // SOLA DÖNÜK PROFİL OTURMA
            // 1. Far Leg (bizden uzak bacak - sağ bacak)
            if (legFilter === 'all' || legFilter === 'far') {
                targetCtx.fillStyle = legColor;
                targetCtx.fillRect(pX - 1, pY + 8, legW, 12);
                drawSingleShoe(targetCtx, pX - 2, pY + 19, shoeType, skinColor, 0, false, f, isFemale);
            }

            // 2. Near Leg (bizden yakın bacak - sol bacak)
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.roundRect(pX - 7, pY + 6, 12, 6, [4, 3, 2, 2]);
                targetCtx.fill();
                targetCtx.fillRect(pX - 9, pY + 10, legW, 7);
                drawSingleShoe(targetCtx, pX - 11, pY + 16, shoeType, skinColor, -0.22, true, f, isFemale);
            }

        } else if (f === 'up') {
            // TAM ARKAYA DÖNÜK OTURMA
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = legColor;
                targetCtx.fillRect(pX - 7, pY + 8, legW, 8);
                targetCtx.fillRect(pX + 2, pY + 8, legW, 8);
                targetCtx.fillStyle = "#1e1e1e";
                targetCtx.fillRect(pX - 7, pY + 16, legW, 4);
                targetCtx.fillRect(pX + 2, pY + 16, legW, 4);
            }

        } else if (f === 'down-right') {
            // 3/4 SAĞ İLERİ OTURMA (SANALİKA 2:1 İZOMETRİK ÇAPRAZ OTURUŞ)
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = shadowColor;
                targetCtx.beginPath(); targetCtx.ellipse(pX + 3, pY + 11, 14, 6, 0.38, 0, Math.PI * 2); targetCtx.fill();
            }

            // 1. Far Leg (Uzak Bacak - Sol Bacak)
            if (legFilter === 'all' || legFilter === 'far') {
                targetCtx.fillStyle = legColor;
                // Uyluk (Koltuktan sağ alt çapraza 2:1 açıyla uzanır)
                targetCtx.beginPath();
                targetCtx.moveTo(pX - 5, pY + 5);
                targetCtx.lineTo(pX + 2, pY + 8.5);
                targetCtx.lineTo(pX, pY + 13.5);
                targetCtx.lineTo(pX - 7, pY + 10);
                targetCtx.closePath();
                targetCtx.fill();
                // Kaval Kemiği (Dizden aşağı sarkar)
                targetCtx.beginPath();
                targetCtx.roundRect(pX - 2.5, pY + 9, legW - 0.5, 9, 2);
                targetCtx.fill();
                // Sol Ayakkabı
                drawSingleShoe(targetCtx, pX - 2, pY + 18, shoeType, skinColor, 0.35, false, f, isFemale);
            }

            // 2. Near Leg (Yakın Bacak - Sağ Bacak - Önde ve Belirgin)
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = legColor;
                // Uyluk (Kalçadan sağ alt çapraza doğru dolgun uzanır)
                targetCtx.beginPath();
                targetCtx.moveTo(pX - 1, pY + 5);
                targetCtx.lineTo(pX + 8, pY + 9);
                targetCtx.lineTo(pX + 5, pY + 14.5);
                targetCtx.lineTo(pX - 4, pY + 10.5);
                targetCtx.closePath();
                targetCtx.fill();
                // Kaval Kemiği (Dizden aşağı sarkar)
                targetCtx.beginPath();
                targetCtx.roundRect(pX + 4, pY + 9.5, legW, 9.5, [2, 2, 2, 2]);
                targetCtx.fill();
                // Sağ Ayakkabı (Önde, sağ-aşağı çapraz duruş)
                drawSingleShoe(targetCtx, pX + 5, pY + 18, shoeType, skinColor, 0.45, true, f, isFemale);
            }

        } else if (f === 'down-left') {
            // 3/4 SOL İLERİ OTURMA (SANALİKA 2:1 İZOMETRİK ÇAPRAZ OTURUŞ)
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = shadowColor;
                targetCtx.beginPath(); targetCtx.ellipse(pX - 3, pY + 11, 14, 6, -0.38, 0, Math.PI * 2); targetCtx.fill();
            }

            // 1. Far Leg (Uzak Bacak - Sağ Bacak)
            if (legFilter === 'all' || legFilter === 'far') {
                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.moveTo(pX + 5, pY + 5);
                targetCtx.lineTo(pX - 2, pY + 8.5);
                targetCtx.lineTo(pX, pY + 13.5);
                targetCtx.lineTo(pX + 7, pY + 10);
                targetCtx.closePath();
                targetCtx.fill();
                targetCtx.beginPath();
                targetCtx.roundRect(pX - 2.5, pY + 9, legW - 0.5, 9, 2);
                targetCtx.fill();
                drawSingleShoe(targetCtx, pX - 2, pY + 18, shoeType, skinColor, -0.35, false, f, isFemale);
            }

            // 2. Near Leg (Yakın Bacak - Sol Bacak - Önde ve Belirgin)
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.moveTo(pX + 1, pY + 5);
                targetCtx.lineTo(pX - 8, pY + 9);
                targetCtx.lineTo(pX - 5, pY + 14.5);
                targetCtx.lineTo(pX + 4, pY + 10.5);
                targetCtx.closePath();
                targetCtx.fill();
                targetCtx.beginPath();
                targetCtx.roundRect(pX - 8.5, pY + 9.5, legW, 9.5, [2, 2, 2, 2]);
                targetCtx.fill();
                drawSingleShoe(targetCtx, pX - 9, pY + 18, shoeType, skinColor, -0.45, true, f, isFemale);
            }

        } else if (f === 'up-right') {
            // 3/4 SAĞ GERİ OTURMA
            // Far leg
            if (legFilter === 'all' || legFilter === 'far') {
                targetCtx.fillStyle = legColor;
                targetCtx.fillRect(pX - 6, pY + 8, legW, 8);
            }

            // Near leg
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = legColor;
                targetCtx.fillRect(pX + 1, pY + 7, legW + 1, 9);
                drawSingleShoe(targetCtx, pX + 2, pY + 15, shoeType, skinColor, 0.6, false, f, isFemale);
            }

        } else if (f === 'up-left') {
            // 3/4 SOL GERİ OTURMA
            // Far leg
            if (legFilter === 'all' || legFilter === 'far') {
                targetCtx.fillStyle = legColor;
                targetCtx.fillRect(pX + 1, pY + 8, legW, 8);
            }

            // Near leg
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = legColor;
                targetCtx.fillRect(pX - 7, pY + 7, legW + 1, 9);
                drawSingleShoe(targetCtx, pX - 8, pY + 15, shoeType, skinColor, -0.6, false, f, isFemale);
            }

        } else {
            // TAM ÖNE DÖNÜK OTURMA - ZARİF AYAK AYAK ÜSTÜNE ATMA
            if (legFilter === 'all' || legFilter === 'near') {
                targetCtx.fillStyle = shadowColor;
                targetCtx.beginPath();
                targetCtx.ellipse(pX - 1, pY + 9, 12, 4, 0, 0, Math.PI * 2);
                targetCtx.fill();

                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.roundRect(pX - 9, pY + 7, legW + 1, 8, [2, 2, 0, 0]);
                targetCtx.fill();
                targetCtx.fillRect(pX - 9, pY + 14, legW, 7);
                drawSingleShoe(targetCtx, pX - 10, pY + 20, shoeType, skinColor, 0, false, f, isFemale);

                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.moveTo(pX + 4, pY + 7);
                targetCtx.lineTo(pX - 7, pY + 9);
                targetCtx.quadraticCurveTo(pX - 10, pY + 11, pX - 7, pY + 14);
                targetCtx.lineTo(pX + 1, pY + 12);
                targetCtx.closePath();
                targetCtx.fill();

                targetCtx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                targetCtx.lineWidth = 1;
                targetCtx.beginPath();
                targetCtx.arc(pX - 5, pY + 11, 3.5, Math.PI * 0.6, Math.PI * 1.6);
                targetCtx.stroke();

                targetCtx.fillStyle = legColor;
                targetCtx.beginPath();
                targetCtx.moveTo(pX - 6, pY + 12);
                targetCtx.lineTo(pX + 3, pY + 15);
                targetCtx.lineTo(pX + 2, pY + 19);
                targetCtx.lineTo(pX - 5, pY + 16);
                targetCtx.closePath();
                targetCtx.fill();

                targetCtx.strokeStyle = "rgba(255, 255, 255, 0.22)";
                targetCtx.lineWidth = 1;
                targetCtx.beginPath();
                targetCtx.moveTo(pX - 4, pY + 13);
                targetCtx.lineTo(pX + 2, pY + 16);
                targetCtx.stroke();

                drawSingleShoe(targetCtx, pX + 2, pY + 16, shoeType, skinColor, 0.24, true, f, isFemale);

                if (isSkirt) {
                    targetCtx.fillStyle = legColor;
                    targetCtx.beginPath();
                    targetCtx.roundRect(pX - 11, pY + 6, 22, 6, [3, 3, 5, 5]);
                    targetCtx.fill();
                    targetCtx.strokeStyle = "rgba(0,0,0,0.15)";
                    targetCtx.lineWidth = 0.8;
                    targetCtx.stroke();
                }
            }
        }

        targetCtx.restore();
        return;
    }

    // AYAKTA YÜRÜME / DURMA (8 AÇILI İZOMETRİK & ANATOMİK BACAK VE AYAKKABI)
    targetCtx.save();
    targetCtx.fillStyle = legColor;

    if (f === 'down') {
        // Tam Öne (Güney)
        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillRect(pX - 8, pY + 12 - legSwing, legW, 8 + legSwing);
            targetCtx.fillRect(pX + 3, pY + 12 + legSwing, legW, 8 - legSwing);
            drawSingleShoe(targetCtx, pX - 9, pY + 18 - legSwing, shoeType, skinColor, 0, false, f, isFemale);
            drawSingleShoe(targetCtx, pX + 2, pY + 18 + legSwing, shoeType, skinColor, 0, false, f, isFemale);
        }

    } else if (f === 'up') {
        // Tam Arkaya (Kuzey)
        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillRect(pX - 7, pY + 12 + legSwing, legW, 8 - legSwing);
            targetCtx.fillRect(pX + 2, pY + 12 - legSwing, legW, 8 + legSwing);
            drawSingleShoe(targetCtx, pX - 8, pY + 18 + legSwing, shoeType, skinColor, Math.PI, false, f, isFemale);
            drawSingleShoe(targetCtx, pX + 1, pY + 18 - legSwing, shoeType, skinColor, Math.PI, false, f, isFemale);
        }

    } else if (f === 'right') {
        // Sağa Profil (Doğu)
        let farX = pX - 5 - legSwing * 1.2;
        let nearX = pX - 1 + legSwing * 1.2;
        if (legFilter === 'all' || legFilter === 'far') {
            targetCtx.fillStyle = "rgba(0,0,0,0.2)";
            targetCtx.fillRect(farX, pY + 12, legW, 8);
            drawSingleShoe(targetCtx, farX - 1, pY + 18, shoeType, skinColor, Math.PI * 0.5, false, f, isFemale);
        }

        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(nearX, pY + 12, legW, 8);
            drawSingleShoe(targetCtx, nearX - 1, pY + 18, shoeType, skinColor, Math.PI * 0.5, false, f, isFemale);
        }

    } else if (f === 'left') {
        // Sola Profil (Batı)
        let farX = pX + 0 + legSwing * 1.2;
        let nearX = pX - 4 - legSwing * 1.2;
        if (legFilter === 'all' || legFilter === 'far') {
            targetCtx.fillStyle = "rgba(0,0,0,0.2)";
            targetCtx.fillRect(farX, pY + 12, legW, 8);
            drawSingleShoe(targetCtx, farX - 2, pY + 18, shoeType, skinColor, -Math.PI * 0.5, false, f, isFemale);
        }

        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(nearX, pY + 12, legW, 8);
            drawSingleShoe(targetCtx, nearX - 2, pY + 18, shoeType, skinColor, -Math.PI * 0.5, false, f, isFemale);
        }

    } else if (f === 'down-right') {
        // Sağ İleri (Güneydoğu - 3/4 İzometrik)
        let farX = pX - 8 - legSwing * 0.8;
        let nearX = pX + 1 + legSwing * 0.8;
        if (legFilter === 'all' || legFilter === 'far') {
            targetCtx.fillStyle = "rgba(0,0,0,0.18)";
            targetCtx.fillRect(farX, pY + 12 - legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, farX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, Math.PI * 0.25, false, f, isFemale);
        }

        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(nearX, pY + 12 + legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, nearX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, Math.PI * 0.25, false, f, isFemale);
        }

    } else if (f === 'down-left') {
        // Sol İleri (Güneybatı - 3/4 İzometrik)
        let farX = pX + 3 + legSwing * 0.8;
        let nearX = pX - 6 - legSwing * 0.8;
        if (legFilter === 'all' || legFilter === 'far') {
            targetCtx.fillStyle = "rgba(0,0,0,0.18)";
            targetCtx.fillRect(farX, pY + 12 - legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, farX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.25, false, f, isFemale);
        }

        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillStyle = legColor;
            targetCtx.fillRect(nearX, pY + 12 + legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, nearX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.25, false, f, isFemale);
        }

    } else if (f === 'up-right') {
        // Sağ Geri (Kuzeydoğu - 3/4 İzometrik)
        let farX = pX - 7 - legSwing * 0.8;
        let nearX = pX + 1 + legSwing * 0.8;
        if (legFilter === 'all' || legFilter === 'far') {
            targetCtx.fillRect(farX, pY + 12 + legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, farX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, Math.PI * 0.75, false, f, isFemale);
        }

        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillRect(nearX, pY + 12 - legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, nearX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, Math.PI * 0.75, false, f, isFemale);
        }

    } else if (f === 'up-left') {
        // Sol Geri (Kuzeybatı - 3/4 İzometrik)
        let farX = pX + 2 + legSwing * 0.8;
        let nearX = pX - 6 - legSwing * 0.8;
        if (legFilter === 'all' || legFilter === 'far') {
            targetCtx.fillRect(farX, pY + 12 + legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, farX - 1, pY + 18 + legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.75, false, f, isFemale);
        }

        if (legFilter === 'all' || legFilter === 'near') {
            targetCtx.fillRect(nearX, pY + 12 - legSwing * 0.4, legW, 8);
            drawSingleShoe(targetCtx, nearX - 1, pY + 18 - legSwing * 0.4, shoeType, skinColor, -Math.PI * 0.75, false, f, isFemale);
        }
    }

    targetCtx.restore();
}

// --- 3. GÖVDE VE KIYAFETLER (8 AÇILI İZOMETRİK & İNCELTİLMİŞ KADIN BELİ VE GERÇEKÇİ KUMAŞ) ---
function drawAvatarBodyAndClothes(targetCtx, pX, pY, shirtColor = "#3b82f6", skinColor = "#ffd1a4", facing = "down", isFemale = undefined) {
    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');
    let isDiagonal = (f === 'down-right' || f === 'down-left' || f === 'up-right' || f === 'up-left');
    let isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

    if (isFemale === undefined || isFemale === null) {
        isFemale = isFemaleAvatar(null, shirtColor);
    }

    targetCtx.save();
    // Simetri kuralı: Sol açılar sağ açıların pX ekseninde aynalanmışıdır
    if (isLeft) {
        targetCtx.translate(pX, 0);
        targetCtx.scale(-1, 1);
        targetCtx.translate(-pX, 0);
    }

    let effFacing = f;
    if (f === 'left') effFacing = 'right';
    else if (f === 'down-left') effFacing = 'down-right';
    else if (f === 'up-left') effFacing = 'up-right';

    // 0. Gerçekçi Anatomik Boyun (Kafayı ve Gövdeyi Doğal Bağlayan Kavisli Boyun)
    targetCtx.fillStyle = skinColor || "#ffd1a4";
    let neckW = isFemale ? 5.5 : 7.5;
    targetCtx.fillRect(pX - neckW / 2, pY - 13, neckW, 5.5);
    // Boyun altı hafif çene gölgesi
    targetCtx.fillStyle = "rgba(0, 0, 0, 0.14)";
    targetCtx.fillRect(pX - neckW / 2, pY - 13, neckW, 1.8);

    // --- KADIN VEYA ERKEK İÇİN İNCELTİLMİŞ VE KAVİSLİ GÖVDE ÇİZİM YARDIMCISI ---
    function drawShapedTorso(fillCol, strokeCol = null, isCrop = false) {
        targetCtx.fillStyle = fillCol;
        targetCtx.beginPath();

        if (effFacing === 'right') {
            // Profil Görünüm: Göğüs kıvrımı, inceltilmiş zarif bel oyuntusu ve kalça kavisleri
            if (isFemale) {
                targetCtx.moveTo(pX - 4, pY - 10);
                targetCtx.lineTo(pX + 5.5, pY - 7); // Göğüs üstü
                targetCtx.quadraticCurveTo(pX + 7, pY - 3, pX + 4.5, pY); // Göğüs kavisinden ince bele geçiş
                targetCtx.lineTo(pX + 2.5, pY + 2); // İnce bel (Profilde de inceltilmiş)
                targetCtx.quadraticCurveTo(pX + 3.5, pY + 7, pX + 5, isCrop ? pY + 1 : pY + 11); // Kalçaya iniş
                targetCtx.lineTo(pX - 5, isCrop ? pY + 1 : pY + 11);
                targetCtx.quadraticCurveTo(pX - 6, pY + 2, pX - 4, pY - 10); // Sırt kavisi
            } else {
                targetCtx.roundRect(pX - 5, pY - 10, 11, isCrop ? 11 : 21, [3, 3, 2, 2]);
            }
        } else {
            // Ön, 3/4 ve Arka Görünümler: Belin zarif şekilde inceldiği kum saati / atletik silüet
            if (isFemale) {
                // KADIN KARAKTER: İncelen bel (pY civarında genişlik 12px'e iner), omuzlar 16px, kalça 17.5px
                let shoulderL = pX - 8.2;
                let shoulderR = pX + 8.2;
                let waistL = pX - 5.8; // İNCELTİLMİŞ KADIN BELİ SOL
                let waistR = pX + 5.8; // İNCELTİLMİŞ KADIN BELİ SAĞ
                let hipL = pX - 8.8;
                let hipR = pX + 8.8;
                let bottomY = isCrop ? (pY + 1) : (pY + 11);

                if (effFacing === 'down-right' || effFacing === 'up-right') {
                    // 3/4 İzometrik Açı: Sağ taraf dönükken bel oyuntusunun derinleşmesi
                    shoulderL = pX - 7.5; shoulderR = pX + 8.8;
                    waistL = pX - 5.2; waistR = pX + 6.2;
                    hipL = pX - 8.2; hipR = pX + 9.2;
                }

                targetCtx.moveTo(shoulderL, pY - 10);
                targetCtx.quadraticCurveTo(pX - 8.8, pY - 4, waistL, pY + 1); // Sol bel incelmesi
                targetCtx.quadraticCurveTo(pX - 6.2, pY + 6, hipL, bottomY); // Kalçaya kavisli açılma
                targetCtx.lineTo(hipR, bottomY);
                targetCtx.quadraticCurveTo(pX + 6.2, pY + 6, waistR, pY + 1); // Sağ bel kavisli incelmesi
                targetCtx.quadraticCurveTo(pX + 8.8, pY - 4, shoulderR, pY - 10); // Sağ omuza çıkış
            } else {
                // ERKEK KARAKTER: Güçlü omuzlar (20px), hafif V-taper (17px bel)
                targetCtx.roundRect(pX - 10, pY - 10, 20, isCrop ? 11 : 21, [4, 4, 3, 3]);
            }
        }

        targetCtx.closePath();
        targetCtx.fill();

        // Kumaş Işık & Gölgelendirmesi (Ambient Isometric Lighting)
        targetCtx.fillStyle = "rgba(255, 255, 255, 0.12)";
        targetCtx.fillRect(pX - 7, pY - 9, 4, isCrop ? 8 : 16); // Sol omuzdan gelen ışık çizgisi
        targetCtx.fillStyle = "rgba(0, 0, 0, 0.12)";
        targetCtx.fillRect(pX + 3.5, pY - 9, 4, isCrop ? 8 : 16); // Sağ gölge derinliği

        if (strokeCol) {
            targetCtx.strokeStyle = strokeCol;
            targetCtx.lineWidth = 1;
            targetCtx.stroke();
        }
    }

    // --- ÖZEL KIYAFETLER VE ELBİSELER (GERÇEKÇİ KUMAŞ, BEL VE DETAYLAR) ---
    if (shirtColor === 'dress_pink') {
        // Pembe Çiçekli Elbise (İnceltilmiş bel, saten kuşak ve fırfırlı etek)
        drawShapedTorso("#f472b6", "rgba(0,0,0,0.1)");

        // Saten Bel Kuşağı (İnce beli vurgulayan kurdele)
        targetCtx.fillStyle = "#db2777";
        let sashW = isFemale ? 13 : 16;
        targetCtx.roundRect(pX - sashW / 2, pY - 1, sashW, 3, 1);
        targetCtx.fill();

        // Flared A-Line Etek
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath();
        let skirtTopL = pX - (isFemale ? 6.5 : 8.5);
        let skirtTopR = pX + (isFemale ? 6.5 : 8.5);
        targetCtx.moveTo(skirtTopL, pY + 2);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + (isBack ? 15 : 16.5), pX + 14, pY + 14);
        targetCtx.lineTo(skirtTopR, pY + 2);
        targetCtx.closePath();
        targetCtx.fill();

        // Beyaz Dantel Fırfır Hem
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.6);
        // Etek Pile Gölgeleri
        targetCtx.strokeStyle = "rgba(0,0,0,0.14)";
        targetCtx.lineWidth = 0.8;
        [-6, 0, 6].forEach(sx => {
            targetCtx.beginPath(); targetCtx.moveTo(pX + sx * 0.6, pY + 3); targetCtx.lineTo(pX + sx * 1.5, pY + 14); targetCtx.stroke();
        });

        if (isBack) {
            targetCtx.strokeStyle = "#be185d"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX, pY - 8); targetCtx.lineTo(pX, pY + 1); targetCtx.stroke();
        }

    } else if (shirtColor === 'dress_black') {
        // Zarif Gece Elbisesi (İnce bel, parıldayan altın toka ve sırt dekoltesi)
        drawShapedTorso("#18181b", "rgba(255,255,255,0.08)");

        // Etek Kısmı (Dökümlü zarif abiye)
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        let skirtTopL = pX - (isFemale ? 6.5 : 8.5);
        let skirtTopR = pX + (isFemale ? 6.5 : 8.5);
        targetCtx.moveTo(skirtTopL, pY + 2);
        targetCtx.lineTo(pX - 13, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 13, pY + 14);
        targetCtx.lineTo(skirtTopR, pY + 2);
        targetCtx.closePath();
        targetCtx.fill();

        // Altın Metal Kemer & Şık Toka
        let beltW = isFemale ? 13 : 17;
        targetCtx.fillStyle = "#facc15";
        targetCtx.fillRect(pX - beltW / 2, pY, beltW, 2.2);
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(pX - 2, pY - 0.5, 4, 3.2); // Parlak toka
            targetCtx.fillStyle = "#d97706";
            targetCtx.fillRect(pX - 1, pY + 0.5, 2, 1.2);
        } else {
            // Sırtta zarif V-dekolte penceresi
            targetCtx.fillStyle = skinColor || "#ffd1a4";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 5, 3.8, 0, Math.PI * 2); targetCtx.fill();
        }

    } else if (shirtColor === 'dress_red') {
        // Kırmızı Kokteyl Elbisesi (Sweetheart yaka ve inceltilmiş bel)
        drawShapedTorso("#e11d48", "rgba(0,0,0,0.15)");

        if (!isBack) {
            // Sweetheart Yaka Dekolte Hattı
            targetCtx.fillStyle = skinColor || "#ffd1a4";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 5, pY - 10);
            targetCtx.quadraticCurveTo(pX - 2.5, pY - 7, pX, pY - 8.5);
            targetCtx.quadraticCurveTo(pX + 2.5, pY - 7, pX + 5, pY - 10);
            targetCtx.closePath();
            targetCtx.fill();
        }

        // Dökümlü Kokteyl Etek
        targetCtx.fillStyle = "#be123c";
        targetCtx.beginPath();
        let skirtTopL = pX - (isFemale ? 6.5 : 8.5);
        let skirtTopR = pX + (isFemale ? 6.5 : 8.5);
        targetCtx.moveTo(skirtTopL, pY + 2);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(skirtTopR, pY + 2);
        targetCtx.closePath();
        targetCtx.fill();

    } else if (shirtColor === 'skirt_crop') {
        // Beyaz Crop Top + Pileli Pembe Mini Etek & Göbek Teni
        drawShapedTorso("#f8fafc", "rgba(0,0,0,0.1)", true);

        // İnce bel ve açık göbek teni
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        let midriffW = isFemale ? 12 : 16;
        targetCtx.fillRect(pX - midriffW / 2, pY + 1, midriffW, 3.2);
        if (!isBack) {
            // Şirin göbek deliği detayı
            targetCtx.fillStyle = "rgba(180, 83, 9, 0.4)";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 2.5, 0.8, 0, Math.PI * 2); targetCtx.fill();
        }

        // Yüksek Bel Pileli Etek (Tenis eteği)
        targetCtx.fillStyle = "#f43f5e";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 4);
        targetCtx.lineTo(pX - 13, pY + 13);
        targetCtx.lineTo(pX + 13, pY + 13);
        targetCtx.lineTo(pX + sTop, pY + 4);
        targetCtx.closePath();
        targetCtx.fill();

        // Keskin pile gölgeleri
        targetCtx.strokeStyle = "rgba(0,0,0,0.2)"; targetCtx.lineWidth = 0.8;
        [-8, -4, 0, 4, 8].forEach(pxOffset => {
            targetCtx.beginPath(); targetCtx.moveTo(pX + pxOffset * 0.7, pY + 4); targetCtx.lineTo(pX + pxOffset * 1.3, pY + 13); targetCtx.stroke();
        });

    } else if (shirtColor === 'skirt_denim') {
        // Kot Etek & Üst (Fit beyaz bluz ve yüksek bel denim etek)
        drawShapedTorso("#f1f5f9", "rgba(0,0,0,0.08)", true);

        // Denim Etek
        targetCtx.fillStyle = "#2563eb";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 12, pY + 13);
        targetCtx.lineTo(pX + 12, pY + 13);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath();
        targetCtx.fill();

        // Denim Kemer Köprüleri & Bronz Düğme
        targetCtx.fillStyle = "#1d4ed8";
        targetCtx.fillRect(pX - sTop, pY + 1, sTop * 2, 2.2);
        if (!isBack) {
            targetCtx.fillStyle = "#facc15";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 2.2, 1, 0, Math.PI * 2); targetCtx.fill();
        } else {
            // Arka cepler ve sarı dikişler
            targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 0.7;
            targetCtx.strokeRect(pX - 6.5, pY + 4, 3.8, 4);
            targetCtx.strokeRect(pX + 2.7, pY + 4, 3.8, 4);
        }

    } else if (shirtColor === 'dress_emerald') {
        // Zümrüt Yeşil İpek Gece Elbisesi & Altın Kolye
        drawShapedTorso("#059669", "rgba(0,0,0,0.15)");
        if (!isBack) {
            targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 6, pY - 10); targetCtx.lineTo(pX, pY - 6.5); targetCtx.lineTo(pX + 6, pY - 10);
            targetCtx.stroke();
            targetCtx.fillStyle = "#10b981";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 5.5, 1.2, 0, Math.PI * 2); targetCtx.fill();
        }
        targetCtx.fillStyle = "#047857";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 17, pX + 14, pY + 15);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#facc15";
        targetCtx.fillRect(pX - sTop, pY, sTop * 2, 2);

    } else if (shirtColor === 'dress_lavender') {
        // Lavanta Çiçeği Bahar Elbisesi & İnce Askılar
        drawShapedTorso("#c084fc", "rgba(0,0,0,0.1)");
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.fillRect(pX - 6, pY - 10, 1.5, 6);
        targetCtx.fillRect(pX + 4.5, pY - 10, 1.5, 6);
        targetCtx.fillStyle = "#a855f7";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 13, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 13, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 12, pY + 13, 24, 1.5);

    } else if (shirtColor === 'dress_bridal') {
        // Masalsı Beyaz Gelinlik & Balo Elbisesi
        drawShapedTorso("#ffffff", "#e2e8f0");
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 16, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 18, pX + 16, pY + 15);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#e2e8f0"; targetCtx.lineWidth = 1; targetCtx.stroke();
        if (!isBack) {
            targetCtx.fillStyle = "#38bdf8"; targetCtx.fillRect(pX - 1.5, pY, 3, 2.5);
        } else {
            targetCtx.fillStyle = "#cbd5e1";
            for (let b = -8; b <= 6; b += 3) {
                targetCtx.beginPath(); targetCtx.arc(pX, pY + b, 1, 0, Math.PI * 2); targetCtx.fill();
            }
        }

    } else if (shirtColor === 'outfit_goth') {
        // Korseli Gotik Lolita Elbisesi (Bel inceltici korsaj ve mor saten bağcıklar)
        drawShapedTorso("#18181b", "rgba(192, 132, 252, 0.4)");
        targetCtx.strokeStyle = "#c084fc"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 3.5, pY - 8); targetCtx.lineTo(pX + 3.5, pY - 4);
        targetCtx.moveTo(pX + 3.5, pY - 8); targetCtx.lineTo(pX - 3.5, pY - 4);
        targetCtx.moveTo(pX - 3.5, pY - 4); targetCtx.lineTo(pX + 3.5, pY);
        targetCtx.moveTo(pX + 3.5, pY - 4); targetCtx.lineTo(pX - 3.5, pY);
        targetCtx.stroke();
        targetCtx.fillStyle = "#09090b";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        if (!isBack) {
            targetCtx.fillStyle = "#ef4444";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 1, 2, 0, Math.PI * 2); targetCtx.fill();
        }
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.2);

    } else if (shirtColor === 'outfit_business') {
        // Pudra Şık Kadın Takım Elbisesi (Belden oturan blazer & kalem etek)
        drawShapedTorso("#fb7185", "rgba(0,0,0,0.1)");
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(pX - 3, pY - 10, 6, 8); // İç gömlek
            targetCtx.fillStyle = "#facc15";
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 1, 1.5, 0, Math.PI * 2); targetCtx.fill(); // Altın düğme
        }
        targetCtx.fillStyle = "#fda4af";
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.fillRect(pX - sTop, pY + 3, sTop * 2, 9); // Kalem etek

    } else if (shirtColor === 'outfit_boho') {
        // Bohem Şifon Elbise & Yelek
        drawShapedTorso("#ea580c", "rgba(0,0,0,0.15)");
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(pX - 8, pY - 10, 3.5, 12);
        targetCtx.fillRect(pX + 4.5, pY - 10, 3.5, 12);
        if (isBack) targetCtx.fillRect(pX - 8, pY - 10, 16, 12);
        targetCtx.fillStyle = "#c2410c";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 15);
        targetCtx.quadraticCurveTo(pX, pY + 17, pX + 14, pY + 15);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#fde047";
        targetCtx.fillRect(pX - 12, pY + 11, 24, 2);

    } else if (shirtColor === 'outfit_sporty') {
        // Pastel Fitness Takımı & Crop Top
        drawShapedTorso("#38bdf8", "rgba(0,0,0,0.1)", true);
        targetCtx.fillStyle = skinColor || "#ffd1a4";
        let midriffW = isFemale ? 12 : 16;
        targetCtx.fillRect(pX - midriffW / 2, pY + 1, midriffW, 3);
        targetCtx.fillStyle = "#818cf8";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 8.5, pY + 4, 17, 8, [2, 2, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#ffffff";
        targetCtx.fillRect(pX - 8.5, pY + 4, 1.5, 8);
        targetCtx.fillRect(pX + 7, pY + 4, 1.5, 8);

    } else if (shirtColor === 'dress_vintage_polka') {
        // Vintage Puantiyeli Kırmızı Elbise
        drawShapedTorso("#dc2626", "rgba(0,0,0,0.15)");
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath();
        if (!isBack) {
            targetCtx.moveTo(pX - 5, pY - 10); targetCtx.lineTo(pX, pY - 6.5); targetCtx.lineTo(pX + 5, pY - 10);
            targetCtx.lineTo(pX + 7, pY - 10); targetCtx.lineTo(pX - 7, pY - 10);
        } else {
            targetCtx.roundRect(pX - 6, pY - 10, 12, 3, [0, 0, 2, 2]);
        }
        targetCtx.closePath(); targetCtx.fill();

        targetCtx.fillStyle = "#b91c1c";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 15, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 15, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();

        targetCtx.fillStyle = "#ffffff";
        [[-8, 6], [-2, 8], [4, 5], [9, 9], [-11, 11], [-5, 12], [2, 12], [9, 13]].forEach(([dx, dy]) => {
            targetCtx.beginPath(); targetCtx.arc(pX + dx, pY + dy, 1.1, 0, Math.PI * 2); targetCtx.fill();
        });
        targetCtx.fillStyle = "#18181b"; targetCtx.fillRect(pX - sTop, pY, sTop * 2, 2.2);
        if (!isBack) {
            targetCtx.fillStyle = "#e2e8f0"; targetCtx.fillRect(pX - 2, pY - 0.5, 4, 3);
        }

    } else if (shirtColor === 'dress_ocean_blue') {
        // Okyanus Mavisi Yazlık Askılı Elbise
        drawShapedTorso("#06b6d4", "rgba(0,0,0,0.12)");
        targetCtx.fillStyle = "#0891b2";
        targetCtx.fillRect(pX - 6, pY - 10, 1.5, 6);
        targetCtx.fillRect(pX + 4.5, pY - 10, 1.5, 6);
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 1);
        targetCtx.lineTo(pX - 14, pY + 14);
        targetCtx.quadraticCurveTo(pX, pY + 16, pX + 14, pY + 14);
        targetCtx.lineTo(pX + sTop, pY + 1);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.fillRect(pX - 13, pY + 13, 26, 1.2);

    } else if (shirtColor === 'outfit_turtleneck_skirt') {
        // Krem Balıkçı Yaka Kazak & Ekose Tartan Etek
        drawShapedTorso("#fef3c7", "rgba(217, 119, 6, 0.2)");
        targetCtx.fillStyle = "#fde68a";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 5.5, pY - 12, 11, 4, 2); targetCtx.fill();
        targetCtx.fillStyle = "#991b1b";
        targetCtx.beginPath();
        let sTop = isFemale ? 6.5 : 8.5;
        targetCtx.moveTo(pX - sTop, pY + 2);
        targetCtx.lineTo(pX - 13, pY + 13);
        targetCtx.lineTo(pX + 13, pY + 13);
        targetCtx.lineTo(pX + sTop, pY + 2);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "rgba(250, 204, 21, 0.4)"; targetCtx.lineWidth = 1;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 5, pY + 2); targetCtx.lineTo(pX - 7, pY + 13);
        targetCtx.moveTo(pX + 5, pY + 2); targetCtx.lineTo(pX + 7, pY + 13);
        targetCtx.moveTo(pX - 11, pY + 7); targetCtx.lineTo(pX + 11, pY + 7);
        targetCtx.stroke();

    } else if (shirtColor === 'polo') {
        // Polo Yaka (Pike kumaş, 3D yaka kanatları ve düğmeler)
        drawShapedTorso("#f8fafc", "rgba(0,0,0,0.1)");
        if (!isBack) {
            targetCtx.fillStyle = "#3b82f6";
            targetCtx.beginPath();
            let shift = (effFacing === 'right') ? 2.5 : (effFacing === 'down-right') ? 1.5 : 0;
            targetCtx.moveTo(pX - 4.5 + shift, pY - 10);
            targetCtx.lineTo(pX + shift, pY - 3.5);
            targetCtx.lineTo(pX + 4.5 + shift, pY - 10);
            targetCtx.stroke();
            // Düğmeler
            targetCtx.fillStyle = "#94a3b8";
            targetCtx.beginPath(); targetCtx.arc(pX + shift, pY - 7, 0.9, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(pX + shift, pY - 4.5, 0.9, 0, Math.PI * 2); targetCtx.fill();
        } else {
            targetCtx.fillStyle = "#e2e8f0";
            targetCtx.beginPath(); targetCtx.roundRect(pX - 5.5, pY - 11, 11, 3, 1.5); targetCtx.fill();
        }

    } else if (shirtColor === 'hoodie') {
        // Kapüşonlu Sweat (Kalın polar doku, 3D kanguru cep, sarkan ipler ve ribana)
        drawShapedTorso("#6366f1", "rgba(0,0,0,0.15)");
        if (!isBack) {
            targetCtx.fillStyle = "#4f46e5";
            let pShift = (effFacing === 'right') ? 2.5 : (effFacing === 'down-right') ? 1.5 : 0;
            targetCtx.beginPath(); targetCtx.roundRect(pX - 5.5 + pShift, pY + 3, 11, 6, 2); targetCtx.fill();
            // İpler ve uçlarında parıldayan agletler
            targetCtx.strokeStyle = "#ffffff"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2.5 + pShift, pY - 8); targetCtx.lineTo(pX - 2.5 + pShift, pY - 1.5); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2.5 + pShift, pY - 8); targetCtx.lineTo(pX + 2.5 + pShift, pY - 1.5); targetCtx.stroke();
            targetCtx.fillStyle = "#e2e8f0";
            targetCtx.fillRect(pX - 3 + pShift, pY - 1.5, 1.2, 1.8);
            targetCtx.fillRect(pX + 2 + pShift, pY - 1.5, 1.2, 1.8);
        } else {
            targetCtx.fillStyle = "#4f46e5";
            targetCtx.beginPath(); targetCtx.roundRect(pX - 6.5, pY - 9, 13, 9.5, [3, 3, 5, 5]); targetCtx.fill();
            targetCtx.strokeStyle = "#4338ca"; targetCtx.lineWidth = 1; targetCtx.stroke();
        }

    } else if (typeof shirtColor === 'string' && (shirtColor.startsWith('vest_reflector_') || shirtColor.startsWith('tshirts_vest_reflector_') || shirtColor.startsWith('shirts_vest_reflector_'))) {
        // EN ISO 20471 2.5D İzometrik Reflektörlü İş & Madenci Yeleği (Karakter 1 Kadın / Erkek)
        let vestCol = '#84cc16'; // Neon Sarı-Yeşil
        let vestHigh = '#bef264';
        let vestShadow = '#4d7c0f';

        if (shirtColor.includes('orange')) {
            vestCol = '#f97316'; vestHigh = '#fed7aa'; vestShadow = '#c2410c';
        } else if (shirtColor.includes('blue')) {
            vestCol = '#2563eb'; vestHigh = '#93c5fd'; vestShadow = '#1d4ed8';
        } else if (shirtColor.includes('red')) {
            vestCol = '#dc2626'; vestHigh = '#fca5a5'; vestShadow = '#991b1b';
        }

        // 1. İç Ağır İş Gömleği / Tişörtü (Kömür Antrasit #334155)
        drawShapedTorso("#334155", "#1e293b");

        // 2. Reflektörlü Güvenlik Yeleği Dış Katmanı
        targetCtx.fillStyle = vestCol;
        targetCtx.beginPath();
        let topY = pY - 10;
        let botY = pY + 11;

        if (effFacing === 'right') {
            targetCtx.roundRect(pX - 4.5, topY + 1, 9.5, 19, [2, 2, 1, 1]);
        } else {
            let sL = isFemale ? (pX - 8.0) : (pX - 9.5);
            let sR = isFemale ? (pX + 8.0) : (pX + 9.5);
            let wL = isFemale ? (pX - 5.5) : (pX - 8.5);
            let wR = isFemale ? (pX + 5.5) : (pX + 8.5);

            targetCtx.moveTo(sL, topY);
            if (!isBack) {
                targetCtx.lineTo(pX - 3.8, topY);
                targetCtx.lineTo(pX, topY + 8);
                targetCtx.lineTo(pX + 3.8, topY);
            }
            targetCtx.lineTo(sR, topY);
            targetCtx.quadraticCurveTo(sR + 0.5, pY + 1, wR, botY);
            targetCtx.lineTo(wL, botY);
            targetCtx.quadraticCurveTo(sL - 0.5, pY + 1, sL, topY);
        }
        targetCtx.closePath();
        targetCtx.fill();

        // 3. 3M Gümüş Reflektör Güvenlik Şeritleri
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.shadowColor = "rgba(255, 255, 255, 0.5)";
        targetCtx.shadowBlur = 3;

        if (effFacing === 'right') {
            targetCtx.fillRect(pX - 1.5, topY + 1, 2.5, 19);
        } else {
            let leftStrapX = isFemale ? (pX - 6.2) : (pX - 7.5);
            let rightStrapX = isFemale ? (pX + 4.0) : (pX + 5.3);
            targetCtx.fillRect(leftStrapX, topY, 2.2, 21);
            targetCtx.fillRect(rightStrapX, topY, 2.2, 21);
        }

        let bandW = isFemale ? 14 : 19;
        let bandX = pX - bandW / 2;
        if (effFacing === 'right') {
            bandW = 10;
            bandX = pX - 4.5;
        }
        targetCtx.fillRect(bandX, pY + 1, bandW, 1.8);
        targetCtx.fillRect(bandX, pY + 5.5, bandW, 1.8);
        targetCtx.shadowBlur = 0;

        // 4. Ön Fermuar & Sol Göğüs İSG Kimlik Cebi
        if (!isBack && effFacing !== 'right') {
            targetCtx.strokeStyle = "#1e293b";
            targetCtx.lineWidth = 1.0;
            targetCtx.beginPath();
            targetCtx.moveTo(pX, topY + 8);
            targetCtx.lineTo(pX, botY);
            targetCtx.stroke();

            targetCtx.fillStyle = "rgba(15, 23, 42, 0.75)";
            targetCtx.fillRect(pX - 5.8, topY + 3, 3.2, 4.0);
            targetCtx.fillStyle = "#22c55e";
            targetCtx.fillRect(pX - 4.8, topY + 4, 1.2, 2.0);
            targetCtx.fillRect(pX - 5.2, topY + 4.4, 2.0, 1.2);
        }

    } else if (shirtColor === 'leather') {
        // Deri Ceket (Asimetrik gümüş fermuar, motorcu yakaları ve deri parlaklığı)
        drawShapedTorso("#18181b", "rgba(255,255,255,0.1)");
        if (!isBack) {
            targetCtx.strokeStyle = "#cbd5e1"; targetCtx.lineWidth = 1.3;
            let zShift = (effFacing === 'right') ? 2 : (effFacing === 'down-right') ? 1 : 0;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2 + zShift, pY - 9); targetCtx.lineTo(pX + 3 + zShift, pY + 11); targetCtx.stroke();
            // Metalik çıtçıtlar
            targetCtx.fillStyle = "#f8fafc";
            targetCtx.beginPath(); targetCtx.arc(pX - 4 + zShift, pY - 5, 0.9, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(pX + 4 + zShift, pY - 5, 0.9, 0, Math.PI * 2); targetCtx.fill();
        } else {
            targetCtx.strokeStyle = "#334155"; targetCtx.lineWidth = 1;
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 4.5, pY - 9); targetCtx.lineTo(pX - 4.5, pY + 11);
            targetCtx.moveTo(pX + 4.5, pY - 9); targetCtx.lineTo(pX + 4.5, pY + 11);
            targetCtx.stroke();
        }

    } else {
        // Klasik Tişört (Gerçekçi omuz manşetleri, yaka ribanası ve bel kıvrımı)
        let mainCol = shirtColor || "#3b82f6";
        drawShapedTorso(mainCol, "rgba(255,255,255,0.4)");

        if (!isBack) {
            // Yaka Ribanası ve Boyun Açıklığı
            targetCtx.strokeStyle = "rgba(0,0,0,0.2)"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 9, 4, 0, Math.PI); targetCtx.stroke();
            // Kumaş Dikiş ve Katlanma İpuçları
            targetCtx.strokeStyle = "rgba(0,0,0,0.12)"; targetCtx.lineWidth = 0.8;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 5, pY + 3); targetCtx.quadraticCurveTo(pX, pY + 5, pX + 5, pY + 2); targetCtx.stroke();
        } else {
            // Arka ense dikişi
            targetCtx.strokeStyle = "rgba(0,0,0,0.18)"; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 9, 4.5, 0, Math.PI); targetCtx.stroke();
        }
    }

    targetCtx.restore();
}

// --- 4. ŞAPKALAR VE SAÇ MODELLERİ (8 AÇILI İZOMETRİK TÜM SAÇLAR VE ŞAPKALAR) ---
function drawAvatarHairAndHats(targetCtx, pX, pY, hatType = "none", facing = "down") {
    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');
    let isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

    targetCtx.save();
    if (isLeft) {
        targetCtx.translate(pX, 0);
        targetCtx.scale(-1, 1);
        targetCtx.translate(-pX, 0);
    }

    let effFacing = f;
    if (f === 'left') effFacing = 'right';
    else if (f === 'down-left') effFacing = 'down-right';
    else if (f === 'up-left') effFacing = 'up-right';

    if (hatType === 'bere') {
        // Kırmızı Bere & Ponpon
        targetCtx.fillStyle = "#e11d48";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 24, 8, Math.PI, 0); targetCtx.fill();
        let pomX = (effFacing === 'right') ? pX - 4 : (effFacing === 'down-right') ? pX + 2 : pX;
        let pomY = (effFacing === 'right') ? pY - 26 : pY - 26;
        targetCtx.fillStyle = "#ffffff";
        targetCtx.beginPath(); targetCtx.arc(pomX, pomY, 3, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'fes') {
        // Osmanlı Fesi
        targetCtx.fillStyle = "#991b1b";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 7, pY - 20); targetCtx.lineTo(-5 + pX, pY - 30);
        targetCtx.lineTo(5 + pX, pY - 30); targetCtx.lineTo(7 + pX, pY - 20);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#0f172a"; targetCtx.lineWidth = 1.5;
        let tEnd = (effFacing === 'right') ? -4 : (effFacing === 'up') ? 0 : 8;
        targetCtx.beginPath(); targetCtx.moveTo(pX, pY - 30); targetCtx.quadraticCurveTo(pX + tEnd * 0.8, pY - 28, pX + tEnd, pY - 21); targetCtx.stroke();
        targetCtx.fillStyle = "#0f172a"; targetCtx.beginPath(); targetCtx.arc(pX + tEnd, pY - 21, 2, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'kasket') {
        // Kasket (8 Açılı Siperlik)
        targetCtx.fillStyle = "#334155";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 23, 9, Math.PI, 0); targetCtx.fill();
        let vDir = (effFacing === 'right') ? 6 : (effFacing === 'down-right') ? 4 : (effFacing === 'up') ? 0 : 0;
        let vWidth = (effFacing === 'up') ? 6 : 9;
        targetCtx.fillStyle = "#1e293b";
        targetCtx.beginPath(); targetCtx.ellipse(pX + vDir, pY - 23, vWidth, 3, 0, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#64748b";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 26, 2, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'k2_skater_bucket') {
        // K2 Sokak Kova Şapka (Bucket Hat)
        const bShiftX = (effFacing === 'right') ? 2 : (effFacing === 'down-right' ? 1.5 : (effFacing === 'up' ? 0 : 0));
        // Kumaş gövde
        targetCtx.fillStyle = "#27272a";
        targetCtx.beginPath();
        targetCtx.roundRect(pX - 7.5 + bShiftX * 0.4, pY - 32, 15, 9, [4, 4, 1, 1]);
        targetCtx.fill();

        // Kova siperliği (Geniş salaş kavis)
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath();
        targetCtx.ellipse(pX + bShiftX, pY - 23, 12.5, 3.8, 0, 0, Math.PI * 2);
        targetCtx.fill();

        // Siperlik dikiş çizgisi
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        targetCtx.lineWidth = 0.8;
        targetCtx.beginPath();
        targetCtx.arc(pX + bShiftX, pY - 23, 10.5, 0.1 * Math.PI, 0.9 * Math.PI);
        targetCtx.stroke();

        // Ön neon pembe grafiti logo etiketi
        if (!isBack) {
            targetCtx.fillStyle = "#ec4899";
            targetCtx.fillRect(pX - 2.0 + bShiftX, pY - 28.5, 4.0, 3.0);
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(pX - 1.2 + bShiftX, pY - 27.5, 2.4, 1.0);
        }

    } else if (hatType === 'cowboy') {
        // Kovboy Şapkası
        targetCtx.fillStyle = "#78350f";
        let brimTilt = (effFacing === 'right') ? 0.2 : (effFacing === 'down-right') ? 0.1 : 0;
        targetCtx.beginPath(); targetCtx.ellipse(pX, pY - 22, 14, 4, brimTilt, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.roundRect(pX - 6, pY - 31, 12, 10, [4, 4, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#f59e0b"; targetCtx.fillRect(pX - 6, pY - 23, 12, 2);

    } else if (hatType === 'hair_long') {
        // Uzun Düz Saç
        targetCtx.fillStyle = "#451a03";
        if (isBack) {
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 10, pY - 22, 20, 30, [8, 8, 4, 4]);
            targetCtx.fill();
        } else {
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 9, pY - 20); targetCtx.quadraticCurveTo(pX - 13, pY - 2, pX - 10, pY + 8);
            targetCtx.lineTo(pX - 6, pY + 8); targetCtx.quadraticCurveTo(pX - 7, pY - 2, pX - 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();

            targetCtx.beginPath();
            targetCtx.moveTo(pX + 9, pY - 20); targetCtx.quadraticCurveTo(pX + 13, pY - 2, pX + 10, pY + 8);
            targetCtx.lineTo(pX + 6, pY + 8); targetCtx.quadraticCurveTo(pX + 7, pY - 2, pX + 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();

            targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 9, pY - 21); targetCtx.quadraticCurveTo(pX - 2, pY - 17, pX, pY - 22);
            targetCtx.quadraticCurveTo(pX + 3, pY - 17, pX + 9, pY - 21);
            targetCtx.lineTo(pX + 8, pY - 24); targetCtx.lineTo(pX - 8, pY - 24);
            targetCtx.closePath(); targetCtx.fill();
        }

    } else if (hatType === 'hair_wavy') {
        // Dalgalı Saç
        targetCtx.fillStyle = "#78350f";
        if (isBack) {
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 11, pY - 22, 22, 28, [8, 8, 5, 5]);
            targetCtx.fill();
        } else {
            targetCtx.beginPath();
            targetCtx.arc(pX - 10, pY - 12, 4, 0, Math.PI * 2);
            targetCtx.arc(pX - 11, pY - 5, 4.5, 0, Math.PI * 2);
            targetCtx.arc(pX - 9, pY + 3, 4, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.beginPath();
            targetCtx.arc(pX + 10, pY - 12, 4, 0, Math.PI * 2);
            targetCtx.arc(pX + 11, pY - 5, 4.5, 0, Math.PI * 2);
            targetCtx.arc(pX + 9, pY + 3, 4, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        }

    } else if (hatType === 'hair_ponytail') {
        // At Kuyruğu Saç
        targetCtx.fillStyle = "#292524";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        let ptX = (effFacing === 'right') ? pX - 7 : (effFacing === 'up') ? pX : pX + 8;
        let ptY = pY - 25;
        targetCtx.fillStyle = "#ec4899";
        targetCtx.beginPath(); targetCtx.arc(ptX, ptY, 3, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#292524";
        targetCtx.beginPath();
        targetCtx.moveTo(ptX, ptY);
        targetCtx.quadraticCurveTo(ptX + ((effFacing === 'right') ? -10 : 8), ptY + 6, ptX + ((effFacing === 'right') ? -5 : 5), ptY + 16);
        targetCtx.quadraticCurveTo(ptX + 2, ptY + 8, ptX, ptY + 2);
        targetCtx.closePath(); targetCtx.fill();

    } else if (hatType === 'hair_braids') {
        // İki Yandan Örgülü Saç
        targetCtx.fillStyle = "#b45309";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        [-1, 1].forEach(side => {
            let bx = pX + side * 10;
            targetCtx.fillStyle = "#b45309";
            targetCtx.beginPath(); targetCtx.arc(bx, pY - 12, 3, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(bx, pY - 7, 2.7, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(bx, pY - 2, 2.4, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#38bdf8";
            targetCtx.beginPath(); targetCtx.arc(bx, pY + 1, 2, 0, Math.PI * 2); targetCtx.fill();
        });

    } else if (hatType === 'hair_bob') {
        // Küt Kesim Bob Saç
        targetCtx.fillStyle = "#1e1b4b";
        targetCtx.beginPath();
        targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.85, Math.PI * 2.15);
        targetCtx.lineTo(pX + 10, pY - 10);
        targetCtx.lineTo(pX - 10, pY - 10);
        targetCtx.closePath(); targetCtx.fill();

    } else if (hatType === 'hair_hijab') {
        // Şık Başörtüsü
        targetCtx.fillStyle = "#0284c7";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11.5, Math.PI * 0.85, Math.PI * 2.15); targetCtx.fill();
        targetCtx.fillStyle = "#38bdf8";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 11, pY - 14);
        targetCtx.quadraticCurveTo(pX - 13, pY - 2, pX - 9, pY + 5);
        targetCtx.lineTo(pX + 9, pY + 5);
        targetCtx.quadraticCurveTo(pX + 13, pY - 2, pX + 11, pY - 14);
        targetCtx.closePath(); targetCtx.fill();

    } else if (hatType === 'beret_pink') {
        // Pembe Fransız Bere
        targetCtx.fillStyle = "#f472b6";
        targetCtx.beginPath(); targetCtx.ellipse(pX - 1, pY - 24, 11, 5, -0.2, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(pX + 1, pY - 27, 2, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'crown') {
        // Prenses Altın Tacı
        targetCtx.fillStyle = "#f59e0b";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 7, pY - 23);
        targetCtx.lineTo(pX - 7, pY - 29);
        targetCtx.lineTo(pX - 3, pY - 25);
        targetCtx.lineTo(pX, pY - 31);
        targetCtx.lineTo(pX + 3, pY - 25);
        targetCtx.lineTo(pX + 7, pY - 29);
        targetCtx.lineTo(pX + 7, pY - 23);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.fillStyle = "#ef4444"; targetCtx.fillRect(pX - 1, pY - 29, 2, 2);
        targetCtx.fillStyle = "#38bdf8"; targetCtx.fillRect(pX - 6, pY - 27, 1.5, 1.5);
        targetCtx.fillRect(pX + 4.5, pY - 27, 1.5, 1.5);

    } else if (hatType === 'hair_blonde_curls') {
        // Altın Bukleli Uzun Saç
        targetCtx.fillStyle = "#eab308";
        [-1, 1].forEach(side => {
            let cx = pX + side * 10;
            targetCtx.beginPath();
            targetCtx.arc(cx, pY - 14, 4, 0, Math.PI * 2);
            targetCtx.arc(cx + side * 1, pY - 7, 4.5, 0, Math.PI * 2);
            targetCtx.arc(cx, pY, 4, 0, Math.PI * 2);
            targetCtx.arc(cx - side * 1, pY + 7, 3.5, 0, Math.PI * 2);
            targetCtx.fill();
        });
        targetCtx.fillStyle = "#facc15";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        if (isBack) {
            targetCtx.fillRect(pX - 10, pY - 19, 20, 24);
        }

    } else if (hatType === 'hair_bun_chopsticks') {
        // Zarif Topuz & Çiçekli Toka
        targetCtx.fillStyle = "#1c1917";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 26, 6.5, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        targetCtx.strokeStyle = "#facc15"; targetCtx.lineWidth = 1.5;
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 9, pY - 23); targetCtx.lineTo(pX + 9, pY - 29);
        targetCtx.stroke();
        targetCtx.fillStyle = "#f472b6";
        targetCtx.beginPath(); targetCtx.arc(pX + 6, pY - 27, 3, 0, Math.PI * 2); targetCtx.fill();

    } else if (hatType === 'hair_redhead_wavy') {
        // Kızıl Dalgalı Romantik Saç
        targetCtx.fillStyle = "#c2410c";
        if (isBack) {
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 11, pY - 22, 22, 28, 6);
            targetCtx.fill();
        } else {
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 9, pY - 20); targetCtx.quadraticCurveTo(pX - 14, pY - 4, pX - 11, pY + 7);
            targetCtx.lineTo(pX - 6, pY + 7); targetCtx.quadraticCurveTo(pX - 8, pY - 4, pX - 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();
            targetCtx.beginPath();
            targetCtx.moveTo(pX + 9, pY - 20); targetCtx.quadraticCurveTo(pX + 15, pY - 2, pX + 12, pY + 9);
            targetCtx.lineTo(pX + 6, pY + 9); targetCtx.quadraticCurveTo(pX + 8, pY - 2, pX + 5, pY - 14);
            targetCtx.closePath(); targetCtx.fill();
            targetCtx.fillStyle = "#ea580c";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 11, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        }

    } else if (hatType === 'hair_pigtails_ribbon') {
        // Kurdeleli İkili Yan Saç
        targetCtx.fillStyle = "#78350f";
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 19, 10.5, Math.PI * 0.95, Math.PI * 2.05); targetCtx.fill();
        [-1, 1].forEach(side => {
            let px = pX + side * 9;
            targetCtx.fillStyle = "#ec4899";
            targetCtx.beginPath(); targetCtx.arc(px, pY - 21, 2.5, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillStyle = "#78350f";
            targetCtx.beginPath();
            targetCtx.moveTo(px, pY - 21);
            targetCtx.quadraticCurveTo(px + side * 6, pY - 14, px + side * 4, pY - 4);
            targetCtx.quadraticCurveTo(px + side * 2, pY - 14, px, pY - 21);
            targetCtx.closePath(); targetCtx.fill();
        });

    } else if (hatType === 'hair_curly_brown' || hatType === 'hats_hair_curly_brown' || (typeof hatType === 'string' && (hatType.startsWith('hair_curly_brown') || hatType.startsWith('hats_hair_curly_brown')))) {
        // 8 Yönlü Orijinal Kıvırcık Kahverengi Saç
        const hairCol = 'original';
        const isProf = (effFacing === 'right' || effFacing === 'left');
        const dSign = (effFacing === 'right' || effFacing === 'down-right' || effFacing === 'up-right') ? 1 : -1;
        if (typeof K2Head !== 'undefined' && typeof K2Head.drawK2CurlyBrown === 'function') {
            K2Head.drawK2CurlyBrown(targetCtx, pX, pY, effFacing, isBack, isProf, dSign, hairCol);
        } else if (typeof Karakter2Renderer !== 'undefined' && typeof Karakter2Renderer.drawK2CurlyBrown === 'function') {
            Karakter2Renderer.drawK2CurlyBrown(targetCtx, pX, pY, effFacing, isBack, isProf, dSign, hairCol);
        }

    } else if (hatType === 'korsan') {
        // Korsan Kaptanı Şapkası
        targetCtx.fillStyle = "#0f172a";
        targetCtx.beginPath();
        targetCtx.moveTo(pX - 15, pY - 21);
        targetCtx.quadraticCurveTo(pX - 8, pY - 33, pX, pY - 35);
        targetCtx.quadraticCurveTo(pX + 8, pY - 33, pX + 15, pY - 21);
        targetCtx.quadraticCurveTo(pX, pY - 24, pX - 15, pY - 21);
        targetCtx.closePath(); targetCtx.fill();
        targetCtx.strokeStyle = "#f59e0b"; targetCtx.lineWidth = 1.5; targetCtx.stroke();
        if (!isBack) {
            targetCtx.fillStyle = "#ffffff";
            targetCtx.beginPath(); targetCtx.arc(pX, pY - 28, 2.5, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.fillRect(pX - 3.5, pY - 25.5, 7, 1.2);
        }

    } else if (hatType === 'sihirbaz') {
        // Sihirbaz Silindiri
        targetCtx.fillStyle = "#09090b";
        targetCtx.beginPath(); targetCtx.ellipse(pX, pY - 22, 13, 3.8, 0, 0, Math.PI * 2); targetCtx.fill();
        targetCtx.fillStyle = "#18181b";
        targetCtx.beginPath(); targetCtx.roundRect(pX - 7, pY - 37, 14, 16, [2, 2, 0, 0]); targetCtx.fill();
        targetCtx.fillStyle = "#9333ea";
        targetCtx.fillRect(pX - 7, pY - 25, 14, 3);
        if (!isBack) {
            targetCtx.fillStyle = "#facc15"; targetCtx.fillRect(pX - 2, pY - 25.5, 4, 4);
        }

    } else if (hatType === 'kulaklik') {
        // DJ Kulaklığı
        targetCtx.strokeStyle = "#334155"; targetCtx.lineWidth = 3;
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 18, 11, Math.PI * 1.05, Math.PI * 1.95); targetCtx.stroke();
        [-1, 1].forEach(side => {
            let cx = pX + side * 11;
            let cy = pY - 18;
            targetCtx.fillStyle = "#06b6d4";
            targetCtx.beginPath(); targetCtx.ellipse(cx, cy, 3, 5, 0, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = "#0891b2"; targetCtx.lineWidth = 1; targetCtx.stroke();
        });

    } else if (typeof hatType === 'string' && (hatType.startsWith('baret_') || hatType.startsWith('hats_baret_'))) {
        // EN 397 Standart 2.5D İzometrik 8 Yönlü Madenci / Şantiye Bareti (Karakter 1 & Klasik 2)
        // Kafayı önden arkaya tamamen içine alan, profilde kafanın arkasını ve alnı açıkta bırakmayan anatomik kalıp.
        const isFem = (typeof isFemaleAvatar === 'function') ? isFemaleAvatar(null, null, hatType) : false;
        let baretCol = '#facc15'; // Sarı (İşçi/Madenci)
        let baretHigh = '#fef08a';
        let baretShadow = '#ca8a04';
        let baretCrest = '#eab308';
        let visorColor = '#eab308';

        if (hatType.includes('beyaz')) {
            baretCol = '#f8fafc'; baretHigh = '#ffffff'; baretShadow = '#94a3b8'; baretCrest = '#e2e8f0'; visorColor = '#cbd5e1';
        } else if (hatType.includes('turuncu')) {
            baretCol = '#f97316'; baretHigh = '#fed7aa'; baretShadow = '#c2410c'; baretCrest = '#fb923c'; visorColor = '#ea580c';
        } else if (hatType.includes('mavi')) {
            baretCol = '#0284c7'; baretHigh = '#7dd3fc'; baretShadow = '#0369a1'; baretCrest = '#38bdf8'; visorColor = '#0284c7';
        } else if (hatType.includes('kirmizi')) {
            baretCol = '#dc2626'; baretHigh = '#fca5a5'; baretShadow = '#991b1b'; baretCrest = '#ef4444'; visorColor = '#b91c1c';
        } else if (hatType.includes('yesil')) {
            baretCol = '#16a34a'; baretHigh = '#86efac'; baretShadow = '#15803d'; baretCrest = '#22c55e'; visorColor = '#15803d';
        }

        const isProf = (effFacing === 'right' || effFacing === 'left');
        const dirSign = (effFacing === 'right' || effFacing === 'down-right' || effFacing === 'up-right') ? 1 : -1;
        const isDiag = (effFacing === 'down-right' || effFacing === 'up-right' || effFacing === 'down-left' || effFacing === 'up-left');

        targetCtx.save();
        targetCtx.translate(pX, pY - 15.5);

        // 0. Baret Altından Çıkan Doğal Ense ve Favori Saç Hatları (Kafada yapay kutu olmadan)
        targetCtx.fillStyle = "#451a03";
        if (isProf) {
            targetCtx.save();
            if (dirSign < 0) targetCtx.scale(-1, 1);
            if (isFem) {
                targetCtx.beginPath();
                targetCtx.roundRect(-9.5, -1.0, 5.0, 7.5, [0, 0, 3, 3]);
                targetCtx.fill();
            }
            targetCtx.fillRect(0.2, -4.2, 1.4, 3.2);
            targetCtx.beginPath();
            targetCtx.moveTo(-9.0, -1.2);
            targetCtx.quadraticCurveTo(-8.2, 2.0, -5.5, 3.8);
            targetCtx.lineTo(-7.2, 3.8);
            targetCtx.quadraticCurveTo(-9.6, 1.5, -9.8, -1.2);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.restore();
        } else if (isDiag) {
            if (isFem) {
                targetCtx.beginPath();
                targetCtx.roundRect(-dirSign * 8.0, 0, 6.0, 6.5, [0, 0, 3, 3]);
                targetCtx.fill();
            }
            targetCtx.fillRect(-dirSign * 6.5, -5.2, 1.6, 3.2);
            targetCtx.fillRect(dirSign * 5.0, -5.2, 1.6, 3.2);
        } else if (!isBack) {
            if (isFem) {
                targetCtx.fillRect(-7.5, -4.0, 2.2, 8.5);
                targetCtx.fillRect(5.3, -4.0, 2.2, 8.5);
            } else {
                targetCtx.fillRect(-7.2, -5.2, 1.6, 3.2);
                targetCtx.fillRect(5.6, -5.2, 1.6, 3.2);
            }
        } else {
            targetCtx.beginPath();
            targetCtx.roundRect(-6.5, 0.5, 13.0, isFem ? 6.5 : 3.5, [0, 0, 3, 3]);
            targetCtx.fill();
        }

        // 1. Yan Profil Açısı: Kafanın tamamını önden arkaya saran anatomik kask formu
        if (isProf) {
            targetCtx.save();
            if (dirSign < 0) targetCtx.scale(-1, 1);

            // A) 3D Kask Kubbesi (Impact Dome)
            const domeGrad = targetCtx.createLinearGradient(-10, -18, 8, -4);
            domeGrad.addColorStop(0, baretHigh);
            domeGrad.addColorStop(0.35, baretCol);
            domeGrad.addColorStop(1, baretShadow);

            targetCtx.fillStyle = domeGrad;
            targetCtx.strokeStyle = baretShadow;
            targetCtx.lineWidth = 0.8;

            targetCtx.beginPath();
            targetCtx.moveTo(8.0, -5.2);
            targetCtx.bezierCurveTo(6.0, -12.5, 2.0, -16.8, -2.0, -16.8);
            targetCtx.bezierCurveTo(-7.5, -16.8, -11.8, -11.5, -11.8, -2.5);
            targetCtx.lineTo(-11.8, -1.8);
            targetCtx.quadraticCurveTo(-2.5, -5.8, 8.0, -5.2);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();

            // Kubbe Alt Hacim Gölgesi
            const underGrad = targetCtx.createLinearGradient(0, -16, 0, -2);
            underGrad.addColorStop(0, "rgba(255,255,255,0.22)");
            underGrad.addColorStop(0.7, "rgba(0,0,0,0)");
            underGrad.addColorStop(1, "rgba(202, 138, 4, 0.4)");
            targetCtx.fillStyle = underGrad;
            targetCtx.beginPath();
            targetCtx.moveTo(8.0, -5.2);
            targetCtx.bezierCurveTo(6.0, -12.5, 2.0, -16.8, -2.0, -16.8);
            targetCtx.bezierCurveTo(-7.5, -16.8, -11.8, -11.5, -11.8, -2.5);
            targetCtx.lineTo(-11.8, -1.8);
            targetCtx.quadraticCurveTo(-2.5, -5.8, 8.0, -5.2);
            targetCtx.closePath();
            targetCtx.fill();

            // B) Baret Siperliği (360° Koruyucu Kenar & Ön Vizör / Peak)
            const visorGrad = targetCtx.createLinearGradient(-11, -2, 12, -4);
            visorGrad.addColorStop(0, baretShadow);
            visorGrad.addColorStop(0.5, baretCol);
            visorGrad.addColorStop(1, baretHigh);

            targetCtx.fillStyle = visorGrad;
            targetCtx.strokeStyle = baretShadow;
            targetCtx.lineWidth = 0.75;

            targetCtx.beginPath();
            targetCtx.moveTo(-12.4, -1.6);
            targetCtx.quadraticCurveTo(-2.5, -5.8, 7.8, -5.2);
            targetCtx.quadraticCurveTo(10.5, -5.0, 12.2, -4.5);
            targetCtx.quadraticCurveTo(12.6, -3.8, 11.8, -3.4);
            targetCtx.quadraticCurveTo(9.5, -3.8, 7.2, -4.2);
            targetCtx.quadraticCurveTo(-2.5, -4.8, -12.4, -0.6);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();

            // C) Tepe Darbe Kaburgası (Crown Rib)
            targetCtx.fillStyle = baretHigh;
            targetCtx.strokeStyle = baretShadow;
            targetCtx.lineWidth = 0.6;
            targetCtx.beginPath();
            targetCtx.moveTo(4.5, -12.2);
            targetCtx.bezierCurveTo(1.5, -17.8, -2.5, -17.8, -5.8, -15.5);
            targetCtx.lineTo(-5.4, -14.6);
            targetCtx.bezierCurveTo(-2.5, -16.8, 1.2, -16.8, 4.0, -11.6);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();

            // D) Ön Reflektör Şerit / İSG Yeşil Haç Amblemi
            targetCtx.save();
            targetCtx.translate(6.6, -9.2);
            targetCtx.rotate(0.24);
            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(-2.2, -1.5, 4.4, 2.8);
            targetCtx.fillStyle = "#16a34a";
            targetCtx.fillRect(-0.6, -1.2, 1.2, 2.2);
            targetCtx.fillRect(-1.6, -0.7, 3.2, 1.2);
            targetCtx.restore();

            targetCtx.restore();

        } else if (isDiag) {
            // 2. Çapraz Açı (3/4 Görünüm)
            targetCtx.fillStyle = visorColor;
            targetCtx.strokeStyle = baretShadow;
            targetCtx.lineWidth = 0.75;
            targetCtx.beginPath();
            targetCtx.ellipse(dirSign * 1.0, -6.5, 13.8, 3.4, dirSign * 0.06, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.stroke();

            const domeGrad = targetCtx.createLinearGradient(-dirSign * 8, -17, dirSign * 8, -6);
            domeGrad.addColorStop(0, baretHigh);
            domeGrad.addColorStop(0.4, baretCol);
            domeGrad.addColorStop(1, baretShadow);
            targetCtx.fillStyle = domeGrad;
            targetCtx.beginPath();
            targetCtx.ellipse(-dirSign * 0.4, -7.5, 11.4, 9.4, 0, Math.PI, 0, false);
            targetCtx.lineTo(-dirSign * 0.4 + (dirSign > 0 ? 11.4 : -11.4), -6.2);
            targetCtx.lineTo(-dirSign * 0.4 - (dirSign > 0 ? 11.4 : -11.4), -5.8);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();

            targetCtx.fillStyle = baretHigh;
            targetCtx.beginPath();
            targetCtx.roundRect(dirSign * 0.6 - 1.5, -17.2, 3.0, 9.2, 1.2);
            targetCtx.fill();
            targetCtx.stroke();

            if (!isBack) {
                const embX = dirSign * 4.2;
                targetCtx.fillStyle = "#ffffff";
                targetCtx.fillRect(embX - 2.2, -11.2, 4.4, 2.6);
                targetCtx.fillStyle = "#16a34a";
                targetCtx.fillRect(embX - 0.6, -10.8, 1.2, 1.8);
                targetCtx.fillRect(embX - 1.5, -10.3, 3.0, 0.8);
            }

        } else if (isBack) {
            // 3. Tam Sırt Görünümü
            targetCtx.fillStyle = visorColor;
            targetCtx.strokeStyle = baretShadow;
            targetCtx.lineWidth = 0.75;
            targetCtx.beginPath();
            targetCtx.ellipse(0, -6.2, 13.5, 3.2, 0, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.stroke();

            const domeGrad = targetCtx.createLinearGradient(0, -17, 0, -5);
            domeGrad.addColorStop(0, baretHigh);
            domeGrad.addColorStop(0.45, baretCol);
            domeGrad.addColorStop(1, baretShadow);
            targetCtx.fillStyle = domeGrad;
            targetCtx.beginPath();
            targetCtx.ellipse(0, -7.2, 10.6, 9.4, 0, Math.PI, 0, false);
            targetCtx.lineTo(10.6, -5.8);
            targetCtx.lineTo(-10.6, -5.8);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();

            targetCtx.fillStyle = baretHigh;
            targetCtx.beginPath();
            targetCtx.roundRect(-1.5, -17.0, 3.0, 9.5, 1.2);
            targetCtx.fill();
            targetCtx.stroke();

        } else {
            // 4. Tam Ön Görünüm: Orijinal kusursuz genişlik ve form korunur
            targetCtx.fillStyle = visorColor;
            targetCtx.strokeStyle = baretShadow;
            targetCtx.lineWidth = 0.75;
            targetCtx.beginPath();
            targetCtx.ellipse(0, -6.5, 13.5, 3.2, 0, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.stroke();

            const domeGrad = targetCtx.createLinearGradient(0, -17, 0, -5);
            domeGrad.addColorStop(0, baretHigh);
            domeGrad.addColorStop(0.45, baretCol);
            domeGrad.addColorStop(1, baretShadow);
            targetCtx.fillStyle = domeGrad;
            targetCtx.beginPath();
            targetCtx.ellipse(0, -7.5, 10.4, 9.4, 0, Math.PI, 0, false);
            targetCtx.lineTo(10.4, -6.0);
            targetCtx.lineTo(-10.4, -6.0);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();

            targetCtx.fillStyle = baretHigh;
            targetCtx.beginPath();
            targetCtx.roundRect(-1.5, -17.2, 3.0, 9.4, 1.2);
            targetCtx.fill();
            targetCtx.stroke();

            targetCtx.fillStyle = "#ffffff";
            targetCtx.fillRect(-2.2, -11.2, 4.4, 2.6);
            targetCtx.fillStyle = "#16a34a";
            targetCtx.fillRect(-0.6, -10.8, 1.2, 1.8);
            targetCtx.fillRect(-1.5, -10.3, 3.0, 0.8);
        }

        targetCtx.restore();

    } else {
        // Sade Kısa Saç
        targetCtx.strokeStyle = "#451a03"; targetCtx.lineWidth = 2.5;
        targetCtx.beginPath(); targetCtx.arc(pX, pY - 23, 8, Math.PI * 1.15, Math.PI * 1.85); targetCtx.stroke();
        if (isBack) {
            targetCtx.fillStyle = "#451a03";
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 7, pY - 22, 14, 6, [2, 2, 4, 4]);
            targetCtx.fill();
        }
    }

    targetCtx.restore();
}

// --- 5. GÖZLER VE YÜZ AKSESUARLARI (8 AÇILI İZOMETRİK GÖZ, SUNGASSES, SAKAL, BIYIK) ---
function drawClassicBeardAndFaceAccessories(targetCtx, pX, pY, f, faceType, p) {
    if (!faceType || faceType === 'none' || faceType === 'sunglasses' || faceType.startsWith('sunglasses_') || faceType === 'mustache') return;
    
    // Sakal ve Yüz Aksesuarları Renk Desteği (Yüz aksesuarları ve sakal/bıyık SADECE faceColor ile belirlenir)
    const customFacialHairCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;
    const isWearingGlasses = (faceType === 'sunglasses' || (faceType && faceType.startsWith('sunglasses_')));
    const customFaceAccessoryCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;

    if (faceType === 'beard') {
        const stubbleCol = customFacialHairCol ? customFacialHairCol : "rgba(35, 26, 18, 0.65)";
        targetCtx.save();
        targetCtx.fillStyle = stubbleCol;
        targetCtx.strokeStyle = stubbleCol;

        if (f === 'right') {
            targetCtx.beginPath();
            targetCtx.moveTo(pX + 1.5, pY - 14.5);
            targetCtx.lineTo(pX + 6.5, pY - 13.5);
            targetCtx.quadraticCurveTo(pX + 7.5, pY - 9.5, pX + 4.5, pY - 8.5);
            targetCtx.lineTo(pX + 1.5, pY - 9.5);
            targetCtx.closePath();
            targetCtx.fill();
        } else if (f === 'left') {
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 1.5, pY - 14.5);
            targetCtx.lineTo(pX - 6.5, pY - 13.5);
            targetCtx.quadraticCurveTo(pX - 7.5, pY - 9.5, pX - 4.5, pY - 8.5);
            targetCtx.lineTo(pX - 1.5, pY - 9.5);
            targetCtx.closePath();
            targetCtx.fill();
        } else {
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 6, pY - 14.5);
            targetCtx.quadraticCurveTo(pX - 3, pY - 15.5, pX - 1, pY - 14.5);
            targetCtx.lineTo(pX - 2.5, pY - 13.5);
            targetCtx.quadraticCurveTo(pX - 4.5, pY - 14.0, pX - 6, pY - 14.5);
            targetCtx.moveTo(pX + 6, pY - 14.5);
            targetCtx.quadraticCurveTo(pX + 3, pY - 15.5, pX + 1, pY - 14.5);
            targetCtx.lineTo(pX + 2.5, pY - 13.5);
            targetCtx.quadraticCurveTo(pX + 4.5, pY - 14.0, pX + 6, pY - 14.5);
            targetCtx.fill();

            targetCtx.beginPath();
            targetCtx.moveTo(pX - 7, pY - 14.5);
            targetCtx.quadraticCurveTo(pX - 7.5, pY - 10, pX - 3.5, pY - 8.5);
            targetCtx.quadraticCurveTo(pX, pY - 7.5, pX + 3.5, pY - 8.5);
            targetCtx.quadraticCurveTo(pX + 7.5, pY - 10, pX + 7, pY - 14.5);
            targetCtx.lineTo(pX + 5, pY - 13);
            targetCtx.quadraticCurveTo(pX + 5.5, pY - 10.5, pX + 2.5, pY - 9.8);
            targetCtx.quadraticCurveTo(pX, pY - 9.2, pX - 2.5, pY - 9.8);
            targetCtx.quadraticCurveTo(pX - 5.5, pY - 10.5, pX - 5, pY - 13);
            targetCtx.closePath();
            targetCtx.fill();
        }
        targetCtx.restore();

    } else if (faceType === 'viking_beard') {
        const beardCol = customFacialHairCol ? customFacialHairCol : "#92400e";
        targetCtx.save();
        targetCtx.fillStyle = beardCol;
        targetCtx.strokeStyle = "#451a03";
        targetCtx.lineWidth = 0.8;

        targetCtx.beginPath();
        targetCtx.moveTo(pX - 7, pY - 14.5);
        targetCtx.quadraticCurveTo(pX - 2, pY - 16, pX - 0.5, pY - 14);
        targetCtx.lineTo(pX - 0.5, pY - 13.2);
        targetCtx.quadraticCurveTo(pX - 3, pY - 14.2, pX - 6.5, pY - 13.2);
        targetCtx.closePath();
        targetCtx.fill();

        targetCtx.beginPath();
        targetCtx.moveTo(pX + 7, pY - 14.5);
        targetCtx.quadraticCurveTo(pX + 2, pY - 16, pX + 0.5, pY - 14);
        targetCtx.lineTo(pX + 0.5, pY - 13.2);
        targetCtx.quadraticCurveTo(pX + 3, pY - 14.2, pX + 6.5, pY - 13.2);
        targetCtx.closePath();
        targetCtx.fill();

        targetCtx.beginPath();
        targetCtx.moveTo(pX - 5.5, pY - 10);
        targetCtx.quadraticCurveTo(pX - 6, pY - 5, pX - 3.5, pY - 1);
        targetCtx.lineTo(pX, pY + 3);
        targetCtx.lineTo(pX + 3.5, pY - 1);
        targetCtx.quadraticCurveTo(pX + 6, pY - 5, pX + 5.5, pY - 10);
        targetCtx.quadraticCurveTo(pX, pY - 9, pX - 5.5, pY - 10);
        targetCtx.closePath();
        targetCtx.fill();
        targetCtx.stroke();

        targetCtx.fillStyle = "#f59e0b";
        targetCtx.strokeStyle = "#b45309";
        targetCtx.lineWidth = 0.6;
        targetCtx.fillRect(pX - 2.5, pY - 1.5, 5, 2.2);
        targetCtx.strokeRect(pX - 2.5, pY - 1.5, 5, 2.2);

        targetCtx.restore();

    } else if (faceType === 'goth_face_veil') {
        let veilCol = "rgba(15, 23, 42, 0.40)";
        if (customFaceAccessoryCol) {
            if (customFaceAccessoryCol.startsWith('#')) {
                let r = 15, g = 23, b = 42;
                if (customFaceAccessoryCol.length === 7) {
                    r = parseInt(customFaceAccessoryCol.substring(1, 3), 16);
                    g = parseInt(customFaceAccessoryCol.substring(3, 5), 16);
                    b = parseInt(customFaceAccessoryCol.substring(5, 7), 16);
                }
                veilCol = "rgba(" + r + ", " + g + ", " + b + ", 0.40)";
            } else if (customFaceAccessoryCol.startsWith('rgba')) {
                veilCol = customFaceAccessoryCol;
            }
        }
        targetCtx.save();
        targetCtx.fillStyle = veilCol;
        targetCtx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        targetCtx.lineWidth = 0.55;

        // Tül elips alanı (Yüzü asla tamamen kapatmaz, şeffaftır)
        targetCtx.beginPath();
        targetCtx.ellipse(pX, pY - 17, 7.5, 4.5, 0, 0, Math.PI * 2);
        targetCtx.fill();

        // Minik file baklava desenleri
        targetCtx.beginPath();
        for (let vx = -5; vx <= 5; vx += 2.5) {
            targetCtx.moveTo(pX + vx, pY - 21);
            targetCtx.lineTo(pX + vx + 1.5, pY - 13);
            targetCtx.moveTo(pX + vx + 1.5, pY - 21);
            targetCtx.lineTo(pX + vx, pY - 13);
        }
        targetCtx.stroke();

        // Kenar dantel incileri
        targetCtx.fillStyle = "#f8fafc";
        for (let vx = -6; vx <= 6; vx += 3) {
            targetCtx.beginPath();
            targetCtx.arc(pX + vx, pY - 12.8, 0.55, 0, Math.PI * 2);
            targetCtx.fill();
        }

        // Kadife Gotik Gül
        targetCtx.fillStyle = "#9f1239";
        targetCtx.beginPath();
        targetCtx.arc(pX - 5.5, pY - 18.5, 1.4, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#4c0519";
        targetCtx.beginPath();
        targetCtx.arc(pX - 5.5, pY - 18.5, 0.7, 0, Math.PI * 2);
        targetCtx.fill();

        targetCtx.restore();
    }
}


// --- 5.0 KLASİK AVATAR ÖZEL GÖZLÜK TASARIMLARI (8 MODEL & 8 AÇI) ---
function drawClassicEyewear(targetCtx, pX, pY, eyeOffsetX, eyeOffsetY, f, faceType, p) {
    if (!faceType || faceType === 'none') return;
    targetCtx.save();
    const customCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;
    const isProfileR = (f === 'right');
    const isProfileL = (f === 'left');
    const isDiagR = (f === 'down-right');
    const isDiagL = (f === 'down-left');
    const isFront = (!isProfileR && !isProfileL && !isDiagR && !isDiagL);

    // 1. Sanalika Retro Wayfarer (Kalın Asetat Siyah Çerçeve & Füme Degrade Cam)
    if (faceType === 'sunglasses' || faceType === 'sunglasses_retro') {
        const frameCol = customCol || '#0f172a';
        targetCtx.fillStyle = frameCol;
        if (isProfileR) {
            targetCtx.fillRect(pX + 2, pY - 21, 6, 4.5);
            targetCtx.strokeStyle = frameCol; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2, pY - 19); targetCtx.lineTo(pX - 5, pY - 18); targetCtx.stroke();
            targetCtx.fillStyle = 'rgba(255,255,255,0.7)'; targetCtx.fillRect(pX + 4, pY - 20, 1.5, 1.5);
        } else if (isProfileL) {
            targetCtx.fillRect(pX - 8, pY - 21, 6, 4.5);
            targetCtx.strokeStyle = frameCol; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2, pY - 19); targetCtx.lineTo(pX + 5, pY - 18); targetCtx.stroke();
            targetCtx.fillStyle = 'rgba(255,255,255,0.7)'; targetCtx.fillRect(pX - 6, pY - 20, 1.5, 1.5);
        } else if (isDiagR) {
            targetCtx.fillRect(pX - 3, pY - 21, 5, 4.5);
            targetCtx.fillRect(pX + 3.5, pY - 21, 5, 4.5);
            targetCtx.strokeStyle = frameCol; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2, pY - 19); targetCtx.lineTo(pX + 3.5, pY - 19); targetCtx.stroke();
            targetCtx.fillStyle = 'rgba(255,255,255,0.7)'; targetCtx.fillRect(pX + 5, pY - 20, 1.5, 1.5);
        } else if (isDiagL) {
            targetCtx.fillRect(pX - 8.5, pY - 21, 5, 4.5);
            targetCtx.fillRect(pX - 2, pY - 21, 5, 4.5);
            targetCtx.strokeStyle = frameCol; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 3.5, pY - 19); targetCtx.lineTo(pX - 2, pY - 19); targetCtx.stroke();
            targetCtx.fillStyle = 'rgba(255,255,255,0.7)'; targetCtx.fillRect(pX - 7.5, pY - 20, 1.5, 1.5);
        } else {
            targetCtx.fillRect(pX - 6 + eyeOffsetX, pY - 21 + eyeOffsetY, 5, 4.5);
            targetCtx.fillRect(pX + 1 + eyeOffsetX, pY - 21 + eyeOffsetY, 5, 4.5);
            targetCtx.strokeStyle = frameCol; targetCtx.lineWidth = 1;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1 + eyeOffsetX, pY - 19 + eyeOffsetY); targetCtx.lineTo(pX + 1 + eyeOffsetX, pY - 19 + eyeOffsetY); targetCtx.stroke();
            targetCtx.fillStyle = 'rgba(255,255,255,0.7)';
            targetCtx.fillRect(pX - 5 + eyeOffsetX, pY - 20 + eyeOffsetY, 1.5, 1.5);
            targetCtx.fillRect(pX + 2 + eyeOffsetX, pY - 20 + eyeOffsetY, 1.5, 1.5);
        }
    }
    // 2. Matrix Krom Aviator (İnce Çift Köprülü Titanyum & Kobalt Ayna Cam)
    else if (faceType === 'sunglasses_aviator') {
        const frameCol = '#cbd5e1';
        const lensCol = customCol || '#0284c7';
        targetCtx.lineWidth = 0.9;
        if (isProfileR) {
            targetCtx.fillStyle = lensCol;
            targetCtx.beginPath(); targetCtx.ellipse(pX + 4.8, pY - 18.5, 3.2, 2.6, 0.1, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = frameCol; targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2, pY - 19.5); targetCtx.lineTo(pX - 5, pY - 18); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 4, pY - 20, 1.2, 1.2);
        } else if (isProfileL) {
            targetCtx.fillStyle = lensCol;
            targetCtx.beginPath(); targetCtx.ellipse(pX - 4.8, pY - 18.5, 3.2, 2.6, -0.1, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.strokeStyle = frameCol; targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2, pY - 19.5); targetCtx.lineTo(pX + 5, pY - 18); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 5.5, pY - 20, 1.2, 1.2);
        } else if (isDiagR) {
            targetCtx.fillStyle = lensCol; targetCtx.strokeStyle = frameCol;
            targetCtx.beginPath(); targetCtx.ellipse(pX - 0.5, pY - 18.5, 2.5, 2.4, 0, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.ellipse(pX + 6, pY - 18.5, 2.6, 2.4, 0, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2, pY - 19.5); targetCtx.lineTo(pX + 3.4, pY - 19.5); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 1.8, pY - 21.0); targetCtx.lineTo(pX + 3.6, pY - 21.0); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 5.2, pY - 20, 1.2, 1.2);
        } else if (isDiagL) {
            targetCtx.fillStyle = lensCol; targetCtx.strokeStyle = frameCol;
            targetCtx.beginPath(); targetCtx.ellipse(pX - 6, pY - 18.5, 2.6, 2.4, 0, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.ellipse(pX + 0.5, pY - 18.5, 2.5, 2.4, 0, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX - 3.4, pY - 19.5); targetCtx.lineTo(pX - 2, pY - 19.5); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX - 3.6, pY - 21.0); targetCtx.lineTo(pX - 1.8, pY - 21.0); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 6.8, pY - 20, 1.2, 1.2);
        } else {
            targetCtx.fillStyle = lensCol; targetCtx.strokeStyle = frameCol;
            targetCtx.beginPath(); targetCtx.ellipse(pX - 3.5 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 2.8, 2.5, 0, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.ellipse(pX + 3.5 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 2.8, 2.5, 0, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1 + eyeOffsetX, pY - 19.5 + eyeOffsetY); targetCtx.lineTo(pX + 1 + eyeOffsetX, pY - 19.5 + eyeOffsetY); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1.5 + eyeOffsetX, pY - 21.2 + eyeOffsetY); targetCtx.lineTo(pX + 1.5 + eyeOffsetX, pY - 21.2 + eyeOffsetY); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff';
            targetCtx.fillRect(pX - 4.5 + eyeOffsetX, pY - 20 + eyeOffsetY, 1.2, 1.2);
            targetCtx.fillRect(pX + 2.5 + eyeOffsetX, pY - 20 + eyeOffsetY, 1.2, 1.2);
        }
    }
    // 3. Vintage Kedi Gözü (Sivri Kanatlı Bordo Çerçeve & Altın Perçin)
    else if (faceType === 'sunglasses_cateye') {
        const frameCol = customCol || '#991b1b';
        targetCtx.fillStyle = frameCol;
        if (isProfileR) {
            targetCtx.beginPath(); targetCtx.moveTo(pX + 1.5, pY - 17); targetCtx.lineTo(pX + 8.5, pY - 22); targetCtx.lineTo(pX + 7, pY - 16.5); targetCtx.closePath(); targetCtx.fill();
            targetCtx.fillStyle = '#facc15'; targetCtx.fillRect(pX + 8, pY - 22, 1, 1);
        } else if (isProfileL) {
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1.5, pY - 17); targetCtx.lineTo(pX - 8.5, pY - 22); targetCtx.lineTo(pX - 7, pY - 16.5); targetCtx.closePath(); targetCtx.fill();
            targetCtx.fillStyle = '#facc15'; targetCtx.fillRect(pX - 9, pY - 22, 1, 1);
        } else if (isDiagR) {
            targetCtx.beginPath(); targetCtx.moveTo(pX - 3.5, pY - 17.5); targetCtx.lineTo(pX + 1.5, pY - 17.5); targetCtx.lineTo(pX + 1, pY - 21); targetCtx.lineTo(pX - 4, pY - 21.5); targetCtx.closePath(); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2.5, pY - 17.5); targetCtx.lineTo(pX + 8, pY - 17.5); targetCtx.lineTo(pX + 9.5, pY - 22.5); targetCtx.lineTo(pX + 2, pY - 21.2); targetCtx.closePath(); targetCtx.fill();
            targetCtx.fillStyle = '#facc15'; targetCtx.fillRect(pX + 9, pY - 22.5, 1, 1);
        } else if (isDiagL) {
            targetCtx.beginPath(); targetCtx.moveTo(pX - 8, pY - 17.5); targetCtx.lineTo(pX - 2.5, pY - 17.5); targetCtx.lineTo(pX - 2, pY - 21.2); targetCtx.lineTo(pX - 9.5, pY - 22.5); targetCtx.closePath(); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1.5, pY - 17.5); targetCtx.lineTo(pX + 3.5, pY - 17.5); targetCtx.lineTo(pX + 4, pY - 21.5); targetCtx.lineTo(pX - 1, pY - 21); targetCtx.closePath(); targetCtx.fill();
            targetCtx.fillStyle = '#facc15'; targetCtx.fillRect(pX - 10, pY - 22.5, 1, 1);
        } else {
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1 + eyeOffsetX, pY - 17.5 + eyeOffsetY); targetCtx.lineTo(pX - 6 + eyeOffsetX, pY - 17.5 + eyeOffsetY); targetCtx.lineTo(pX - 8.5 + eyeOffsetX, pY - 22.5 + eyeOffsetY); targetCtx.lineTo(pX - 1 + eyeOffsetX, pY - 21 + eyeOffsetY); targetCtx.closePath(); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 1 + eyeOffsetX, pY - 17.5 + eyeOffsetY); targetCtx.lineTo(pX + 6 + eyeOffsetX, pY - 17.5 + eyeOffsetY); targetCtx.lineTo(pX + 8.5 + eyeOffsetX, pY - 22.5 + eyeOffsetY); targetCtx.lineTo(pX + 1 + eyeOffsetX, pY - 21 + eyeOffsetY); targetCtx.closePath(); targetCtx.fill();
            targetCtx.fillStyle = '#facc15';
            targetCtx.fillRect(pX - 8.5 + eyeOffsetX, pY - 22.5 + eyeOffsetY, 1, 1);
            targetCtx.fillRect(pX + 7.5 + eyeOffsetX, pY - 22.5 + eyeOffsetY, 1, 1);
        }
    }
    // 4. Neon Siber Vizör 2077 (Tek Parça Kavisli Cyan Vizör & Siber Çizgi)
    else if (faceType === 'sunglasses_cyber') {
        const neonCol = customCol || '#00f3ff';
        targetCtx.fillStyle = neonCol;
        targetCtx.shadowColor = neonCol; targetCtx.shadowBlur = 4;
        if (isProfileR) {
            targetCtx.fillRect(pX + 1.5, pY - 21, 7.5, 4.5);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 2, pY - 19.5, 6.5, 1);
            targetCtx.fillStyle = '#1e293b'; targetCtx.fillRect(pX - 1, pY - 20, 2.5, 3);
        } else if (isProfileL) {
            targetCtx.fillRect(pX - 9, pY - 21, 7.5, 4.5);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 8.5, pY - 19.5, 6.5, 1);
            targetCtx.fillStyle = '#1e293b'; targetCtx.fillRect(pX - 1.5, pY - 20, 2.5, 3);
        } else if (isDiagR) {
            targetCtx.fillRect(pX - 3.5, pY - 21, 12, 4.5);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 3, pY - 19.5, 11, 1);
            targetCtx.fillStyle = '#1e293b'; targetCtx.fillRect(pX + 7.5, pY - 20.5, 2, 3.5);
        } else if (isDiagL) {
            targetCtx.fillRect(pX - 8.5, pY - 21, 12, 4.5);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 8, pY - 19.5, 11, 1);
            targetCtx.fillStyle = '#1e293b'; targetCtx.fillRect(pX - 9.5, pY - 20.5, 2, 3.5);
        } else {
            targetCtx.fillRect(pX - 7.5 + eyeOffsetX, pY - 21 + eyeOffsetY, 15, 4.5);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 7 + eyeOffsetX, pY - 19.5 + eyeOffsetY, 14, 1);
            targetCtx.fillStyle = '#1e293b';
            targetCtx.fillRect(pX - 8.5 + eyeOffsetX, pY - 20.5 + eyeOffsetY, 1.8, 3.5);
            targetCtx.fillRect(pX + 6.7 + eyeOffsetX, pY - 20.5 + eyeOffsetY, 1.8, 3.5);
        }
        targetCtx.shadowBlur = 0;
    }
    // 5. John Lennon Yuvarlak (Kusursuz Yuvarlak Altın Tel & Amber Cam)
    else if (faceType === 'sunglasses_lennon') {
        const wireCol = '#facc15';
        const glassCol = customCol || '#78350f';
        targetCtx.lineWidth = 1; targetCtx.strokeStyle = wireCol; targetCtx.fillStyle = glassCol;
        if (isProfileR) {
            targetCtx.beginPath(); targetCtx.arc(pX + 4.5, pY - 18.5, 2.8, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX + 2, pY - 18.5); targetCtx.lineTo(pX - 5, pY - 18); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 4, pY - 20, 1, 1);
        } else if (isProfileL) {
            targetCtx.beginPath(); targetCtx.arc(pX - 4.5, pY - 18.5, 2.8, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.moveTo(pX - 2, pY - 18.5); targetCtx.lineTo(pX + 5, pY - 18); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 5, pY - 20, 1, 1);
        } else if (isDiagR) {
            targetCtx.beginPath(); targetCtx.arc(pX - 0.5, pY - 18.5, 2.5, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.arc(pX + 5.5, pY - 18.5, 2.6, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.arc(pX + 2.5, pY - 19.5, 1.2, Math.PI, 0); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 5, pY - 20, 1, 1);
        } else if (isDiagL) {
            targetCtx.beginPath(); targetCtx.arc(pX - 5.5, pY - 18.5, 2.6, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.arc(pX + 0.5, pY - 18.5, 2.5, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.arc(pX - 2.5, pY - 19.5, 1.2, Math.PI, 0); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 6, pY - 20, 1, 1);
        } else {
            targetCtx.beginPath(); targetCtx.arc(pX - 3.5 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 2.8, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.arc(pX + 3.5 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 2.8, 0, Math.PI * 2); targetCtx.fill(); targetCtx.stroke();
            targetCtx.beginPath(); targetCtx.arc(pX + eyeOffsetX, pY - 19.5 + eyeOffsetY, 1.2, Math.PI, 0); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff';
            targetCtx.fillRect(pX - 4.2 + eyeOffsetX, pY - 20 + eyeOffsetY, 1, 1);
            targetCtx.fillRect(pX + 2.8 + eyeOffsetX, pY - 20 + eyeOffsetY, 1, 1);
        }
    }
    // 6. Buz Mavisi Polarize Plaj (Dinamik Spor Çerçeve & Ayna Degrade)
    else if (faceType === 'sunglasses_polar') {
        const polarCol = customCol || '#38bdf8';
        targetCtx.fillStyle = polarCol;
        if (isProfileR) {
            targetCtx.beginPath(); targetCtx.moveTo(pX + 1.5, pY - 21.5); targetCtx.lineTo(pX + 8.5, pY - 19.5); targetCtx.lineTo(pX + 7, pY - 17); targetCtx.lineTo(pX + 1.5, pY - 17.5); targetCtx.closePath(); targetCtx.fill();
            targetCtx.strokeStyle = '#0284c7'; targetCtx.lineWidth = 0.8; targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 4.5, pY - 20, 1.5, 1.2);
        } else if (isProfileL) {
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1.5, pY - 21.5); targetCtx.lineTo(pX - 8.5, pY - 19.5); targetCtx.lineTo(pX - 7, pY - 17); targetCtx.lineTo(pX - 1.5, pY - 17.5); targetCtx.closePath(); targetCtx.fill();
            targetCtx.strokeStyle = '#0284c7'; targetCtx.lineWidth = 0.8; targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 6, pY - 20, 1.5, 1.2);
        } else if (isDiagR) {
            targetCtx.fillRect(pX - 3.5, pY - 21.2, 5.2, 4.2);
            targetCtx.fillRect(pX + 3.0, pY - 21.2, 5.8, 4.2);
            targetCtx.strokeStyle = '#0284c7'; targetCtx.lineWidth = 0.8;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 4, pY - 21.5); targetCtx.lineTo(pX + 9, pY - 21.5); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 5, pY - 20.2, 1.5, 1.2);
        } else if (isDiagL) {
            targetCtx.fillRect(pX - 8.8, pY - 21.2, 5.8, 4.2);
            targetCtx.fillRect(pX - 1.7, pY - 21.2, 5.2, 4.2);
            targetCtx.strokeStyle = '#0284c7'; targetCtx.lineWidth = 0.8;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 9, pY - 21.5); targetCtx.lineTo(pX + 4, pY - 21.5); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 6.5, pY - 20.2, 1.5, 1.2);
        } else {
            targetCtx.fillRect(pX - 6.5 + eyeOffsetX, pY - 21.2 + eyeOffsetY, 5.5, 4.2);
            targetCtx.fillRect(pX + 1.0 + eyeOffsetX, pY - 21.2 + eyeOffsetY, 5.5, 4.2);
            targetCtx.strokeStyle = '#0284c7'; targetCtx.lineWidth = 0.8;
            targetCtx.beginPath(); targetCtx.moveTo(pX - 7.5 + eyeOffsetX, pY - 21.5 + eyeOffsetY); targetCtx.lineTo(pX + 7.5 + eyeOffsetX, pY - 21.5 + eyeOffsetY); targetCtx.stroke();
            targetCtx.fillStyle = '#ffffff';
            targetCtx.fillRect(pX - 5 + eyeOffsetX, pY - 20.2 + eyeOffsetY, 1.5, 1.2);
            targetCtx.fillRect(pX + 2.5 + eyeOffsetX, pY - 20.2 + eyeOffsetY, 1.5, 1.2);
        }
    }
    // 7. Rockstar Neon Yıldız (Yıldız Şekilli Pembe Festival Gözlüğü)
    else if (faceType === 'sunglasses_star') {
        const starCol = customCol || '#ec4899';
        function drawStar(cx, cy, spikes, outerRadius, innerRadius) {
            let rot = Math.PI / 2 * 3;
            let x = cx, y = cy;
            let step = Math.PI / spikes;
            targetCtx.beginPath();
            targetCtx.moveTo(cx, cy - outerRadius);
            for (let i = 0; i < spikes; i++) {
                x = cx + Math.cos(rot) * outerRadius;
                y = cy + Math.sin(rot) * outerRadius;
                targetCtx.lineTo(x, y);
                rot += step;
                x = cx + Math.cos(rot) * innerRadius;
                y = cy + Math.sin(rot) * innerRadius;
                targetCtx.lineTo(x, y);
                rot += step;
            }
            targetCtx.lineTo(cx, cy - outerRadius);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();
        }
        targetCtx.fillStyle = starCol; targetCtx.strokeStyle = '#fbcfe8'; targetCtx.lineWidth = 0.8;
        if (isProfileR) {
            drawStar(pX + 4.5, pY - 18.5, 5, 3.8, 1.8);
        } else if (isProfileL) {
            drawStar(pX - 4.5, pY - 18.5, 5, 3.8, 1.8);
        } else if (isDiagR) {
            drawStar(pX - 0.5, pY - 18.5, 5, 3.2, 1.5);
            drawStar(pX + 5.5, pY - 18.5, 5, 3.8, 1.8);
        } else if (isDiagL) {
            drawStar(pX - 5.5, pY - 18.5, 5, 3.8, 1.8);
            drawStar(pX + 0.5, pY - 18.5, 5, 3.2, 1.5);
        } else {
            drawStar(pX - 3.5 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 5, 3.6, 1.7);
            drawStar(pX + 3.5 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 5, 3.6, 1.7);
            targetCtx.beginPath(); targetCtx.moveTo(pX - 1 + eyeOffsetX, pY - 18.5 + eyeOffsetY); targetCtx.lineTo(pX + 1 + eyeOffsetX, pY - 18.5 + eyeOffsetY); targetCtx.stroke();
        }
    }
    // 8. Thug Life 8-Bit Piksel (Basamaklı Pikselli Siyah Gözlük & Beyaz Glint)
    else if (faceType === 'sunglasses_pixel') {
        targetCtx.fillStyle = '#09090b';
        if (isProfileR) {
            targetCtx.fillRect(pX + 2, pY - 21, 6, 2);
            targetCtx.fillRect(pX + 3, pY - 19, 5, 2);
            targetCtx.fillRect(pX + 4, pY - 17, 3, 1.5);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 3, pY - 21, 1.5, 1.5); targetCtx.fillRect(pX + 4.5, pY - 19, 1.5, 1.5);
        } else if (isProfileL) {
            targetCtx.fillRect(pX - 8, pY - 21, 6, 2);
            targetCtx.fillRect(pX - 8, pY - 19, 5, 2);
            targetCtx.fillRect(pX - 7, pY - 17, 3, 1.5);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 4.5, pY - 21, 1.5, 1.5); targetCtx.fillRect(pX - 6, pY - 19, 1.5, 1.5);
        } else if (isDiagR) {
            targetCtx.fillRect(pX - 3, pY - 21, 5, 2); targetCtx.fillRect(pX - 2.5, pY - 19, 4, 2);
            targetCtx.fillRect(pX + 3.5, pY - 21, 5, 2); targetCtx.fillRect(pX + 4, pY - 19, 4.5, 2); targetCtx.fillRect(pX + 5, pY - 17, 3, 1.5);
            targetCtx.fillRect(pX + 2, pY - 20, 1.5, 1);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX + 4.5, pY - 21, 1.5, 1.5); targetCtx.fillRect(pX + 6, pY - 19, 1.5, 1.5);
        } else if (isDiagL) {
            targetCtx.fillRect(pX - 8.5, pY - 21, 5, 2); targetCtx.fillRect(pX - 8.5, pY - 19, 4.5, 2); targetCtx.fillRect(pX - 8, pY - 17, 3, 1.5);
            targetCtx.fillRect(pX - 2, pY - 21, 5, 2); targetCtx.fillRect(pX - 1.5, pY - 19, 4, 2);
            targetCtx.fillRect(pX - 3.5, pY - 20, 1.5, 1);
            targetCtx.fillStyle = '#ffffff'; targetCtx.fillRect(pX - 6, pY - 21, 1.5, 1.5); targetCtx.fillRect(pX - 7.5, pY - 19, 1.5, 1.5);
        } else {
            targetCtx.fillRect(pX - 6.5 + eyeOffsetX, pY - 21 + eyeOffsetY, 5.5, 2);
            targetCtx.fillRect(pX - 6 + eyeOffsetX, pY - 19 + eyeOffsetY, 4.5, 2);
            targetCtx.fillRect(pX - 5 + eyeOffsetX, pY - 17 + eyeOffsetY, 3, 1.5);
            targetCtx.fillRect(pX + 1 + eyeOffsetX, pY - 21 + eyeOffsetY, 5.5, 2);
            targetCtx.fillRect(pX + 1.5 + eyeOffsetX, pY - 19 + eyeOffsetY, 4.5, 2);
            targetCtx.fillRect(pX + 2 + eyeOffsetX, pY - 17 + eyeOffsetY, 3, 1.5);
            targetCtx.fillRect(pX - 1 + eyeOffsetX, pY - 20 + eyeOffsetY, 2, 1);
            targetCtx.fillStyle = '#ffffff';
            targetCtx.fillRect(pX - 5.5 + eyeOffsetX, pY - 21 + eyeOffsetY, 1.5, 1.5);
            targetCtx.fillRect(pX - 4 + eyeOffsetX, pY - 19 + eyeOffsetY, 1.5, 1.5);
            targetCtx.fillRect(pX + 2 + eyeOffsetX, pY - 21 + eyeOffsetY, 1.5, 1.5);
            targetCtx.fillRect(pX + 3.5 + eyeOffsetX, pY - 19 + eyeOffsetY, 1.5, 1.5);
        }
    }
    targetCtx.restore();
}

function drawAvatarFaceAndEyes(targetCtx, pX, pY, faceType = "none", eyeOffsetX = 0, eyeOffsetY = 0, facing = "down", isAfk = false, p = null) {
    let f = normalize8WayFacing(facing);
    if (f === 'up' || f === 'up-right' || f === 'up-left') {
        return;
    }

    targetCtx.save();
    const customFacialHairCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;
    const isWearingGlasses = (faceType === 'sunglasses' || (typeof faceType === 'string' && faceType.startsWith('sunglasses_')));
    if (f === 'right') {
        if (isAfk && !isWearingGlasses) {
            targetCtx.strokeStyle = "#0f172a";
            targetCtx.lineWidth = 1.3;
            targetCtx.lineCap = "round";
            targetCtx.beginPath();
            targetCtx.arc(pX + 5.2, pY - 18.5, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
        } else {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX + 4, pY - 20, 2.5, 3);
        }
        if (isWearingGlasses) {
            drawClassicEyewear(targetCtx, pX, pY, 0, 0, f, faceType, p);
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = customFacialHairCol || "#1e1e1e";
            targetCtx.beginPath(); targetCtx.ellipse(pX + 4, pY - 14, 4, 1.5, 0.2, 0, Math.PI * 2); targetCtx.fill();
        }

    } else if (f === 'left') {
        if (isAfk && !isWearingGlasses) {
            targetCtx.strokeStyle = "#0f172a";
            targetCtx.lineWidth = 1.3;
            targetCtx.lineCap = "round";
            targetCtx.beginPath();
            targetCtx.arc(pX - 5.2, pY - 18.5, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
        } else {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 6.5, pY - 20, 2.5, 3);
        }
        if (isWearingGlasses) {
            drawClassicEyewear(targetCtx, pX, pY, 0, 0, f, faceType, p);
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = customFacialHairCol || "#1e1e1e";
            targetCtx.beginPath(); targetCtx.ellipse(pX - 4, pY - 14, 4, 1.5, -0.2, 0, Math.PI * 2); targetCtx.fill();
        }

    } else if (f === 'down-right') {
        if (isAfk && !isWearingGlasses) {
            targetCtx.strokeStyle = "#0f172a";
            targetCtx.lineWidth = 1.3;
            targetCtx.lineCap = "round";
            targetCtx.beginPath();
            targetCtx.arc(pX + 0.2, pY - 18.5, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
            targetCtx.beginPath();
            targetCtx.arc(pX + 6.2, pY - 18.5, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
        } else {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 1, pY - 20, 2.5, 3);
            targetCtx.fillRect(pX + 5, pY - 20, 2.5, 3);
        }
        if (isWearingGlasses) {
            drawClassicEyewear(targetCtx, pX, pY, 0, 0, f, faceType, p);
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = customFacialHairCol || "#1e1e1e";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 3, pY - 14); targetCtx.quadraticCurveTo(pX + 2, pY - 12, pX + 8, pY - 14);
            targetCtx.quadraticCurveTo(pX + 2, pY - 16, pX - 3, pY - 14); targetCtx.fill();
        }

    } else if (f === 'down-left') {
        if (isAfk && !isWearingGlasses) {
            targetCtx.strokeStyle = "#0f172a";
            targetCtx.lineWidth = 1.3;
            targetCtx.lineCap = "round";
            targetCtx.beginPath();
            targetCtx.arc(pX - 6.2, pY - 18.5, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
            targetCtx.beginPath();
            targetCtx.arc(pX - 0.2, pY - 18.5, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
        } else {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 7.5, pY - 20, 2.5, 3);
            targetCtx.fillRect(pX - 1.5, pY - 20, 2.5, 3);
        }
        if (isWearingGlasses) {
            drawClassicEyewear(targetCtx, pX, pY, 0, 0, f, faceType, p);
        } else if (faceType === 'mustache') {
            targetCtx.fillStyle = customFacialHairCol || "#1e1e1e";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 8, pY - 14); targetCtx.quadraticCurveTo(pX - 2, pY - 12, pX + 3, pY - 14);
            targetCtx.quadraticCurveTo(pX - 2, pY - 16, pX - 8, pY - 14); targetCtx.fill();
        }

    } else {
        // Tam Öne Dönük
        if (isAfk && !isWearingGlasses) {
            targetCtx.strokeStyle = "#0f172a";
            targetCtx.lineWidth = 1.3;
            targetCtx.lineCap = "round";
            targetCtx.beginPath();
            targetCtx.arc(pX - 2.8 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
            targetCtx.beginPath();
            targetCtx.arc(pX + 3.2 + eyeOffsetX, pY - 18.5 + eyeOffsetY, 1.4, 0.18 * Math.PI, 0.82 * Math.PI);
            targetCtx.stroke();
        } else {
            targetCtx.fillStyle = "#0f172a";
            targetCtx.fillRect(pX - 4 + eyeOffsetX, pY - 20 + eyeOffsetY, 2.5, 3);
            targetCtx.fillRect(pX + 2 + eyeOffsetX, pY - 20 + eyeOffsetY, 2.5, 3);
        }

        if (faceType === 'mustache') {
            targetCtx.fillStyle = customFacialHairCol || "#1e1e1e";
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 6, pY - 14);
            targetCtx.quadraticCurveTo(pX, pY - 12, pX + 6, pY - 14);
            targetCtx.quadraticCurveTo(pX, pY - 16, pX - 6, pY - 14);
            targetCtx.fill();
        } else if (isWearingGlasses) {
            drawClassicEyewear(targetCtx, pX, pY, eyeOffsetX, eyeOffsetY, f, faceType, p);
        }
    }

    // Sakal ve Yüz Aksesuarları Çizimi (Ağzı asla kapatmaz, yüz hatlarına oturur)
    drawClassicBeardAndFaceAccessories(targetCtx, pX, pY, f, faceType, p);

    targetCtx.restore();
}

// --- 5.9 SİGARA İÇME & DUMAN ÜFLEME MEKANİĞİ MOTORU (40s - 2dk RNG DÖNGÜSÜ) ---
function getAvatarMouthPos(pX, pY, facing = 'down', model = 'classic_2') {
    let f = normalize8WayFacing(facing);
    let mY = pY - 13.8;
    let mX = pX;
    if (f === 'right') mX = pX + 4.5;
    else if (f === 'down-right') mX = pX + 3.0;
    else if (f === 'left') mX = pX - 4.5;
    else if (f === 'down-left') mX = pX - 3.0;
    else if (f === 'up-right') mX = pX + 2.5;
    else if (f === 'up-left') mX = pX - 2.5;
    else if (f === 'up') mX = pX;
    return { x: mX, y: mY };
}

function getAvatarSmokingState(p, isPreview = false) {
    if (!p) return null;
    let heldItem = p.heldItem || (p.hasTea ? 'cay' : 'none');
    if (heldItem !== 'sigara') {
        p._smokeAnimStart = null;
        return null;
    }

    let now = Date.now();
    if (!p._nextSmokeTime) {
        // Dümdüz 30 saniye bekleme süresi
        let delay = isPreview ? 8000 : 30000;
        p._nextSmokeTime = now + delay;
    }

    if (now >= p._nextSmokeTime && !p._smokeAnimStart) {
        p._smokeAnimStart = now;
    }

    if (!p._smokeAnimStart) return null;

    let elapsed = now - p._smokeAnimStart;
    let totalDuration = 4200; // 4.2 saniye toplam animasyon süresi

    if (elapsed >= totalDuration) {
        p._smokeAnimStart = null;
        p._nextSmokeTime = now + (isPreview ? 8000 : 30000);
        return null;
    }

    let liftProgress = 0;
    if (elapsed < 900) {
        // 1. Faz: Sigarayı ağza götürme (0 -> 1)
        let t = elapsed / 900;
        liftProgress = 0.5 - 0.5 * Math.cos(Math.PI * t);
    } else if (elapsed < 2000) {
        // 2. Faz: Ağızda tutma & derin nefes çekme (köz alevlenir)
        liftProgress = 1.0;
    } else if (elapsed < 2800) {
        // 3. Faz: Kolu yavaşça eski yerine indirme (1 -> 0)
        let t = (elapsed - 2000) / 800;
        liftProgress = 0.5 + 0.5 * Math.cos(Math.PI * t);
    } else {
        liftProgress = 0;
    }

    let isInhaling = (elapsed >= 900 && elapsed < 2000);
    let isExhaling = (elapsed >= 2100 && elapsed < 4200);
    let exhaleProgress = isExhaling ? (elapsed - 2100) / 2100 : 0;

    return {
        active: true,
        elapsed,
        liftProgress,
        isInhaling,
        isExhaling,
        exhaleProgress
    };
}

function drawExhaleSmoke(ctx, pX, pY, facing, model, progress) {
    let mouth = getAvatarMouthPos(pX, pY, facing, model);
    let f = normalize8WayFacing(facing);
    let isBack = (f === 'up' || f === 'up-right' || f === 'up-left');

    ctx.save();

    // 1. Ağızda hafif "O" şeklinde üfleme ifadesi (eğer arkası dönük değilse)
    if (!isBack && progress < 0.8) {
        ctx.fillStyle = "rgba(40, 25, 20, 0.75)";
        ctx.beginPath();
        ctx.ellipse(mouth.x, mouth.y, 1.2, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 2. 3 Dalga Halinde Genişleyen ve Yükselen Zarif Duman Bulutları / Halkaları
    let puffOffsets = [0.0, 0.22, 0.45];
    for (let i = 0; i < puffOffsets.length; i++) {
        let offset = puffOffsets[i];
        if (progress < offset) continue;

        let pLocal = (progress - offset) / (1.0 - offset);
        if (pLocal < 0 || pLocal > 1) continue;

        // Yöne göre üfleme yönü
        let dirX = 0, dirY = 0;
        if (f === 'right') { dirX = 1.0; dirY = -0.3; }
        else if (f === 'down-right') { dirX = 0.8; dirY = 0.15; }
        else if (f === 'down') { dirX = (i % 2 === 0 ? 0.3 : -0.3); dirY = 0.4; }
        else if (f === 'down-left') { dirX = -0.8; dirY = 0.15; }
        else if (f === 'left') { dirX = -1.0; dirY = -0.3; }
        else if (f === 'up-right') { dirX = 0.7; dirY = -0.7; }
        else if (f === 'up-left') { dirX = -0.7; dirY = -0.7; }
        else if (f === 'up') { dirX = (i % 2 === 0 ? 0.25 : -0.25); dirY = -0.8; }

        let dist = pLocal * 26.0;
        let rise = pLocal * 18.0;
        let wave = Math.sin(pLocal * 5.0 + i * 1.8) * 2.5;

        let puffX = mouth.x + (dirX * dist) + wave;
        let puffY = mouth.y + (dirY * dist * 0.35) - rise;
        let radius = 2.0 + pLocal * 7.5;

        // Opasite: Başta hızla yoğunlaşır, sonra havada yavaşça dağılır
        let alpha = Math.sin(pLocal * Math.PI) * 0.58;

        // Dış yumuşak duman sisi
        ctx.fillStyle = `rgba(226, 232, 240, ${alpha * 0.45})`;
        ctx.beginPath();
        ctx.arc(puffX, puffY, radius * 1.35, 0, Math.PI * 2);
        ctx.fill();

        // Ana duman gövdesi
        ctx.fillStyle = `rgba(241, 245, 249, ${alpha})`;
        ctx.beginPath();
        ctx.arc(puffX, puffY, radius, 0, Math.PI * 2);
        ctx.fill();

        // 2. dalgada karizmatik duman halkası (smoke ring)
        if (i === 1 && pLocal > 0.15 && pLocal < 0.85) {
            let ringAlpha = Math.sin((pLocal - 0.15) / 0.7 * Math.PI) * 0.65;
            ctx.strokeStyle = `rgba(255, 255, 255, ${ringAlpha})`;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.ellipse(puffX, puffY, radius * 0.95, radius * 0.5, dirX * 0.35, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    ctx.restore();
}

// Konsoldan veya testlerden anında sigara dumanı animasyonunu tetikleme fonksiyonu
window.triggerSmokeAnimation = function (targetPlayer) {
    let p = targetPlayer || (typeof myAvatar !== 'undefined' ? myAvatar : null);
    if (!p) return;
    p._smokeAnimStart = Date.now();
    p._nextSmokeTime = Date.now() + 4200 + 40000 + Math.random() * 80000;
};

// --- 6. EL EŞYALARI (8 AÇILI TÜM EL EŞYALARI VE SIRTKAPLAMA) ---
// --- 6. EL EŞYALARI (Modüler public/js/renderers/heldItemsRenderer.js) ---
// drawHeldItem fonksiyonu modüler olarak heldItemsRenderer.js dosyasına taşınmıştır.
if (typeof window !== 'undefined') {
    window.getAvatarMouthPos = getAvatarMouthPos;
    window.getAvatarSmokingState = getAvatarSmokingState;
    window.drawExhaleSmoke = drawExhaleSmoke;
}

function _safeDrawHeldItem(targetCtx, pX, pY, heldItem, isPreview, facing, unused, model, p) {
    if (typeof drawHeldItem === 'function') {
        drawHeldItem(targetCtx, pX, pY, heldItem, isPreview, facing, unused, model, p);
    } else if (typeof window !== 'undefined' && typeof window.drawHeldItem === 'function') {
        window.drawHeldItem(targetCtx, pX, pY, heldItem, isPreview, facing, unused, model, p);
    }
}

    // --- 6.1 KLASİK 2 VÜCUT MODELİ (GELİŞMİŞ KLASİK AVATAR, 8 YÖNLÜ SALINAN KOLLAR & SAATLER & ÖZEL SETLER) ---

function getClassic2SleeveStyle(p, isFemale) {
    let out = p.outfit;
    let col = p.shirt || p.color || '#3b82f6';
    let skin = p.skinColor || "#ffd1a4";
    const customOutfitCol = (p && ((p.outfitColor && p.outfitColor !== 'original' && p.outfitColor !== 'none' && p.outfitColor.startsWith('#')) ? p.outfitColor : ((p.costumeColor && p.costumeColor !== 'original' && p.costumeColor !== 'none' && p.costumeColor.startsWith('#')) ? p.costumeColor : null))) || null;

    if (col && (col.startsWith('vest_reflector_') || col.startsWith('tshirts_vest_reflector_') || col.startsWith('shirts_vest_reflector_'))) {
        return { color: '#334155', cuffColor: '#1e293b', isShort: true, is3Quarter: false };
    }
    if (out === 'outfit_c2_gentleman') {
        return { color: customOutfitCol || '#334155', cuffColor: '#f8fafc', isShort: false, is3Quarter: false };
    }
    if (out === 'outfit_c2_street_cool') {
        return { color: customOutfitCol || '#0f766e', cuffColor: '#115e59', isShort: false, is3Quarter: false };
    }
    if (out === 'outfit_c2_casual_polo') {
        return { color: customOutfitCol || '#1e3a8a', cuffColor: null, isShort: true, is3Quarter: false };
    }
    if (out === 'outfit_c2_femme_chic') {
        return { color: customOutfitCol || '#ec4899', cuffColor: null, isShort: false, is3Quarter: true };
    }

    if (out && out.startsWith('dress_')) {
        if (out === 'dress_pink') return { color: '#f472b6', cuffColor: null, isShort: true, is3Quarter: false };
        if (out === 'dress_black') return { color: '#18181b', cuffColor: null, isShort: false, is3Quarter: true };
        if (out === 'dress_red') return { color: skin, cuffColor: null, isShort: true, is3Quarter: false };
        if (out === 'dress_emerald') return { color: '#059669', cuffColor: null, isShort: false, is3Quarter: false };
        if (out === 'dress_lavender') return { color: '#c084fc', cuffColor: null, isShort: true, is3Quarter: false };
        if (out === 'dress_bridal') return { color: '#ffffff', cuffColor: null, isShort: false, is3Quarter: false };
        return { color: skin, cuffColor: null, isShort: true, is3Quarter: false };
    }

    if (col === 'hoodie') return { color: '#6366f1', cuffColor: '#4f46e5', isShort: false, is3Quarter: false };
    if (col === 'leather') return { color: '#18181b', cuffColor: '#27272a', isShort: false, is3Quarter: false };
    if (col === 'polo') return { color: '#f8fafc', cuffColor: null, isShort: true, is3Quarter: false };
    if (col === 'skirt_crop') return { color: skin, cuffColor: null, isShort: true, is3Quarter: false };
    if (col === 'skirt_denim') return { color: '#38bdf8', cuffColor: null, isShort: true, is3Quarter: false };

    let shirtCol = (col && col.startsWith('#')) ? col : '#3b82f6';
    return { color: shirtCol, cuffColor: null, isShort: true, is3Quarter: false };
}

function drawClassic2Watch(targetCtx, wx, wy, watchId) {
    if (!watchId || watchId === 'none') return;
    targetCtx.save();
    if (watchId === 'watch_gold_rolex') {
        // Altın Prestij Saat: Parlak altın kordon, altın kasa, beyaz kadran
        targetCtx.fillStyle = "#ca8a04";
        targetCtx.fillRect(wx - 2.8, wy - 1.2, 5.6, 2.4);
        targetCtx.fillStyle = "#facc15";
        targetCtx.fillRect(wx - 2.8, wy - 0.7, 5.6, 1.4);
        targetCtx.fillStyle = "#fef08a";
        targetCtx.beginPath();
        targetCtx.arc(wx, wy, 1.8, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#1e293b";
        targetCtx.beginPath();
        targetCtx.arc(wx, wy, 0.8, 0, Math.PI * 2);
        targetCtx.fill();
    } else if (watchId === 'watch_leather_classic') {
        // Deri Kordonlu Klasik Saat: Kahverengi kordon, gümüş kasa, beyaz kadran
        targetCtx.fillStyle = "#78350f";
        targetCtx.fillRect(wx - 2.6, wy - 1.2, 5.2, 2.4);
        targetCtx.fillStyle = "#94a3b8";
        targetCtx.beginPath();
        targetCtx.arc(wx, wy, 1.8, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#f8fafc";
        targetCtx.beginPath();
        targetCtx.arc(wx, wy, 1.1, 0, Math.PI * 2);
        targetCtx.fill();
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(wx - 0.4, wy - 0.4, 0.8, 0.8);
    } else if (watchId === 'watch_cyber_sport') {
        // Neon Spor Kronometre: Koyu gövde, neon siyan dijital gösterge
        targetCtx.fillStyle = "#0f172a";
        targetCtx.fillRect(wx - 2.8, wy - 1.4, 5.6, 2.8);
        targetCtx.fillStyle = "#06b6d4";
        targetCtx.beginPath();
        targetCtx.roundRect(wx - 2.2, wy - 1.2, 4.4, 2.4, 0.8);
        targetCtx.fill();
        targetCtx.fillStyle = "#22d3ee";
        targetCtx.fillRect(wx - 1.6, wy - 0.7, 3.2, 1.4);
    }
    targetCtx.restore();
}

function drawClassic2Arm(targetCtx, shoulderX, shoulderY, angle, isLeftArm, isFarArm, sleeveStyle, skinColor, watchId, isSitting) {
    targetCtx.save();
    targetCtx.translate(shoulderX, shoulderY);
    if (isSitting) {
        let sitAngle = isLeftArm ? 0.32 : -0.32;
        targetCtx.rotate(sitAngle);
    } else {
        targetCtx.rotate(angle);
    }

    let armLength = 11.0;
    let armW = 3.8;
    let sleeveLength = sleeveStyle.isShort ? 4.8 : (sleeveStyle.is3Quarter ? 7.2 : 9.2);

    // 1. Üst Kol & Kol Giysisi
    targetCtx.fillStyle = sleeveStyle.color;
    targetCtx.beginPath();
    targetCtx.roundRect(-armW / 2, 0, armW, sleeveLength, [2, 2, 1, 1]);
    targetCtx.fill();
    targetCtx.strokeStyle = "rgba(0,0,0,0.12)";
    targetCtx.lineWidth = 0.6;
    targetCtx.stroke();

    // Kol manşeti detayı
    if (sleeveStyle.cuffColor) {
        targetCtx.fillStyle = sleeveStyle.cuffColor;
        targetCtx.fillRect(-armW / 2, sleeveLength - 1.4, armW, 1.4);
    }

    // 2. Ön Kol (Ten rengi)
    if (sleeveLength < armLength) {
        targetCtx.fillStyle = skinColor;
        targetCtx.beginPath();
        targetCtx.roundRect(-armW / 2 + 0.4, sleeveLength - 0.4, armW - 0.8, armLength - sleeveLength + 0.4, 1.2);
        targetCtx.fill();
    }

    // 3. Kol Saati (Sol kolda ve bilek hizasında)
    if (isLeftArm && watchId && watchId !== 'none') {
        let wristY = armLength - 1.0;
        drawClassic2Watch(targetCtx, 0, wristY, watchId);
    }

    // 4. El (Doğal yuvarlak el)
    let handY = armLength + 1.2;
    targetCtx.fillStyle = skinColor;
    targetCtx.beginPath();
    targetCtx.arc(0, handY, 2.2, 0, Math.PI * 2);
    targetCtx.fill();

    // Arka kol hafif gölgesi
    if (isFarArm) {
        targetCtx.fillStyle = "rgba(0, 0, 0, 0.22)";
        targetCtx.beginPath();
        targetCtx.roundRect(-armW / 2, 0, armW, handY + 2.2, 2);
        targetCtx.fill();
    }

    targetCtx.restore();
}

function drawClassic2Torso(targetCtx, pX, pY, p, facing, isFemale) {
    let skinColor = p.skinColor || '#ffd1a4';
    let out = p.outfit;
    const customOutfitCol = (p && ((p.outfitColor && p.outfitColor !== 'original' && p.outfitColor !== 'none' && p.outfitColor.startsWith('#')) ? p.outfitColor : ((p.costumeColor && p.costumeColor !== 'original' && p.costumeColor !== 'none' && p.costumeColor.startsWith('#')) ? p.costumeColor : null))) || null;

    // Boyun
    targetCtx.fillStyle = skinColor;
    targetCtx.fillRect(pX - 3.5, pY - 13, 7, 5.5);
    targetCtx.fillStyle = "rgba(0,0,0,0.12)";
    targetCtx.fillRect(pX - 3.5, pY - 13, 7, 1.6);

    let isBack = (facing === 'up' || facing === 'up-right' || facing === 'up-left');

    if (out === 'outfit_c2_gentleman') {
        targetCtx.save();
        // Ceket gövdesi
        targetCtx.fillStyle = customOutfitCol || '#334155';
        targetCtx.beginPath();
        targetCtx.roundRect(pX - 8, pY - 8, 16, 18, [3, 3, 2, 2]);
        targetCtx.fill();
        targetCtx.strokeStyle = "rgba(0,0,0,0.2)";
        targetCtx.lineWidth = 1;
        targetCtx.stroke();

        if (!isBack) {
            // Beyaz gömlek V yaka
            targetCtx.fillStyle = '#f8fafc';
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 3.5, pY - 8);
            targetCtx.lineTo(pX + 3.5, pY - 8);
            targetCtx.lineTo(pX, pY + 2);
            targetCtx.closePath();
            targetCtx.fill();

            // Kırmızı ipek kravat
            targetCtx.fillStyle = '#991b1b';
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 1.2, pY - 7);
            targetCtx.lineTo(pX + 1.2, pY - 7);
            targetCtx.lineTo(pX + 1.6, pY + 4);
            targetCtx.lineTo(pX, pY + 6.5);
            targetCtx.lineTo(pX - 1.6, pY + 4);
            targetCtx.closePath();
            targetCtx.fill();

            // Yelek / Ceket düğmeleri
            targetCtx.fillStyle = '#1e293b';
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 4, 1.1, 0, Math.PI * 2); targetCtx.fill();
            targetCtx.beginPath(); targetCtx.arc(pX, pY + 7, 1.1, 0, Math.PI * 2); targetCtx.fill();
        }
        targetCtx.restore();
    } else if (out === 'outfit_c2_street_cool') {
        targetCtx.save();
        // Koyu zümrüt bomber ceket
        targetCtx.fillStyle = (typeof customOutfitCol !== 'undefined' && customOutfitCol) ? customOutfitCol : '#0f766e';
        targetCtx.beginPath();
        targetCtx.roundRect(pX - 8.5, pY - 8, 17, 18, [3, 3, 3, 3]);
        targetCtx.fill();

        if (!isBack) {
            // İç beyaz tişört
            targetCtx.fillStyle = '#f8fafc';
            targetCtx.fillRect(pX - 2.8, pY - 8, 5.6, 15);

            // Fermuar hattı
            targetCtx.strokeStyle = '#cbd5e1';
            targetCtx.lineWidth = 1.0;
            targetCtx.beginPath();
            targetCtx.moveTo(pX, pY - 6);
            targetCtx.lineTo(pX, pY + 7);
            targetCtx.stroke();
        }

        // Bomber yakası ve etek lastiği
        targetCtx.fillStyle = '#115e59';
        targetCtx.fillRect(pX - 7, pY - 9, 14, 2);
        targetCtx.fillRect(pX - 8.5, pY + 8, 17, 2.5);
        targetCtx.restore();
    } else if (out === 'outfit_c2_casual_polo') {
        targetCtx.save();
        // Marin polo mavi gövde
        targetCtx.fillStyle = (typeof customOutfitCol !== 'undefined' && customOutfitCol) ? customOutfitCol : '#1e3a8a';
        targetCtx.beginPath();
        targetCtx.roundRect(pX - 8, pY - 8, 16, 18, [3, 3, 2, 2]);
        targetCtx.fill();

        // Beyaz yatay çizgiler
        targetCtx.fillStyle = '#f8fafc';
        targetCtx.fillRect(pX - 8, pY - 3, 16, 2.2);
        targetCtx.fillRect(pX - 8, pY + 2.5, 16, 2.2);
        targetCtx.fillRect(pX - 8, pY + 7, 16, 2.2);

        if (!isBack) {
            // Beyaz polo yaka
            targetCtx.fillStyle = '#f8fafc';
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 5, pY - 9);
            targetCtx.lineTo(pX, pY - 5);
            targetCtx.lineTo(pX + 5, pY - 9);
            targetCtx.lineTo(pX + 3.5, pY - 4);
            targetCtx.lineTo(pX - 3.5, pY - 4);
            targetCtx.closePath();
            targetCtx.fill();
        }
        targetCtx.restore();
    } else if (out === 'outfit_c2_femme_chic') {
        targetCtx.save();
        // Pastel pembe blazer ceket
        targetCtx.fillStyle = (typeof customOutfitCol !== 'undefined' && customOutfitCol) ? customOutfitCol : '#ec4899';
        targetCtx.beginPath();
        targetCtx.roundRect(pX - 7.5, pY - 8, 15, 15, [3, 3, 2, 2]);
        targetCtx.fill();

        if (!isBack) {
            // İpeksi beyaz iç bluz
            targetCtx.fillStyle = '#fff1f2';
            targetCtx.beginPath();
            targetCtx.moveTo(pX - 3.5, pY - 8);
            targetCtx.lineTo(pX + 3.5, pY - 8);
            targetCtx.lineTo(pX, pY + 1);
            targetCtx.closePath();
            targetCtx.fill();

            // İnce altın kolye
            targetCtx.strokeStyle = '#facc15';
            targetCtx.lineWidth = 1.0;
            targetCtx.beginPath();
            targetCtx.arc(pX, pY - 5.5, 2.4, 0, Math.PI);
            targetCtx.stroke();
        }

        // Kalem etek üst kısmı
        targetCtx.fillStyle = '#db2777';
        targetCtx.fillRect(pX - 6.5, pY + 7, 13, 4);
        targetCtx.restore();
    } else {
        // Standart tişört / elbise gövdesi
        drawAvatarBodyAndClothes(targetCtx, pX, pY, p.outfit || p.shirt || p.color, p.skinColor, facing, isFemale);
    }
}

function drawClassic2Avatar(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, isPreview, legFilter = 'all') {
    facing = normalize8WayFacing(facing || 'down');
    let isFemale = isFemaleAvatar(p, p.color, p.hat, p.shoes);
    let skinColor = p.skinColor || "#ffd1a4";
    let watchId = p.watch || 'none';
    let sleeveStyle = getClassic2SleeveStyle(p, isFemale);

    // Pantolon ve bacak rengi çözümü
    let isSkirt = false;
    let pantsColor = '#2563eb';
    let out = p.outfit;
    if (out === 'outfit_c2_gentleman') {
        pantsColor = '#1e293b';
    } else if (out === 'outfit_c2_street_cool') {
        pantsColor = '#1d4ed8';
    } else if (out === 'outfit_c2_casual_polo') {
        pantsColor = '#d4b996';
    } else if (out === 'outfit_c2_femme_chic') {
        pantsColor = '#db2777';
        isSkirt = true;
    } else if (out && out.startsWith('dress_')) {
        isSkirt = true;
        pantsColor = skinColor;
    } else if (p.pants) {
        if (p.pants === 'pants_classic_jeans') pantsColor = '#2563eb';
        else if (p.pants === 'pants_classic_black') pantsColor = '#1e293b';
        else if (p.pants === 'pants_classic_beige') pantsColor = '#d4b996';
        else if (p.pants === 'pants_classic_cargo_olive') pantsColor = '#4d5d3b';
        else if (p.pants === 'pants_classic_white_skirt') { pantsColor = '#ffffff'; isSkirt = true; }
    }

    // 8 Yönlü Yürüme Salınımı (Bacakların tersine senkronize doğal salınım)
    let hasHeldItem = (p.heldItem && p.heldItem !== 'none') || p.hasTea;
    let armSwingAngle = 0;
    if (hasHeldItem) {
        armSwingAngle = 0; // El eşyası varken kollar sabit
    } else if (isSitting) {
        armSwingAngle = 0;
    } else if (isMoving) {
        armSwingAngle = Math.sin(playerWalkCycle || 0) * 0.42;
    } else if (isPreview) {
        armSwingAngle = Math.sin(Date.now() / 400) * 0.16; // Önizlemede tatlı bir kol salınımı
    } else {
        armSwingAngle = Math.sin(Date.now() / 650) * 0.04; // Beklerken hafif nefes mikro-salınımı
    }

    // Açıya göre omuz koordinatları ve kol katmanlaması
    let farArm = null;
    let nearArm = null;

    if (facing === 'down') {
        // Tam Öne (Güney): Her iki kol gövdenin yanında
        nearArm = [
            { sx: pX - 9, sy: pY - 6, angle: -armSwingAngle, isLeft: true, isFar: false },
            { sx: pX + 9, sy: pY - 6, angle: armSwingAngle, isLeft: false, isFar: false }
        ];
    } else if (facing === 'up') {
        // Tam Arka (Kuzey)
        farArm = [
            { sx: pX + 8, sy: pY - 6, angle: armSwingAngle, isLeft: true, isFar: true },
            { sx: pX - 8, sy: pY - 6, angle: -armSwingAngle, isLeft: false, isFar: true }
        ];
    } else if (facing === 'right') {
        // Sağ Profil
        farArm = [{ sx: pX - 2, sy: pY - 6, angle: -armSwingAngle * 1.2, isLeft: true, isFar: true }];
        nearArm = [{ sx: pX + 1, sy: pY - 6, angle: armSwingAngle * 1.2, isLeft: false, isFar: false }];
    } else if (facing === 'left') {
        // Sol Profil (Saatli sol kol önde!)
        farArm = [{ sx: pX + 2, sy: pY - 6, angle: armSwingAngle * 1.2, isLeft: false, isFar: true }];
        nearArm = [{ sx: pX - 1, sy: pY - 6, angle: -armSwingAngle * 1.2, isLeft: true, isFar: false }];
    } else if (facing === 'down-right') {
        // 3/4 Sağ İleri
        farArm = [{ sx: pX - 6, sy: pY - 7, angle: -armSwingAngle * 0.9, isLeft: true, isFar: true }];
        nearArm = [{ sx: pX + 7, sy: pY - 5, angle: armSwingAngle * 0.9, isLeft: false, isFar: false }];
    } else if (facing === 'down-left') {
        // 3/4 Sol İleri (Saatli sol kol önde!)
        farArm = [{ sx: pX + 6, sy: pY - 7, angle: armSwingAngle * 0.9, isLeft: false, isFar: true }];
        nearArm = [{ sx: pX - 7, sy: pY - 5, angle: -armSwingAngle * 0.9, isLeft: true, isFar: false }];
    } else if (facing === 'up-right') {
        // 3/4 Sağ Geri
        farArm = [
            { sx: pX - 7, sy: pY - 6, angle: armSwingAngle * 0.8, isLeft: true, isFar: true },
            { sx: pX + 5, sy: pY - 6, angle: -armSwingAngle * 0.8, isLeft: false, isFar: true }
        ];
    } else if (facing === 'up-left') {
        // 3/4 Sol Geri
        farArm = [
            { sx: pX + 7, sy: pY - 6, angle: -armSwingAngle * 0.8, isLeft: false, isFar: true },
            { sx: pX - 5, sy: pY - 6, angle: armSwingAngle * 0.8, isLeft: true, isFar: true }
        ];
    }

    let heldItem = p.heldItem || (p.hasTea ? 'cay' : 'none');
    let isBack = (facing === 'up' || facing === 'up-right' || facing === 'up-left');
    let isBackAccessory = (heldItem === 'sirtcantasi' || heldItem === 'gitar' || heldItem === 'baglama');
    let drawItemUnder = isBack && !isBackAccessory && (heldItem && heldItem !== 'none');

    // Sigara İçme / Duman Çekme Mekaniği Kol Açısı
    let smokeState = (heldItem === 'sigara') ? getAvatarSmokingState(p, isPreview) : null;
    if (smokeState && smokeState.liftProgress > 0 && heldItem === 'sigara') {
        let rightArm = (nearArm && nearArm.find(a => !a.isLeft)) || (farArm && farArm.find(a => !a.isLeft));
        if (rightArm) {
            let mouth = getAvatarMouthPos(pX, pY, facing, 'classic_2');
            let dx = mouth.x - rightArm.sx;
            let dy = mouth.y - rightArm.sy;
            let targetAngle = Math.atan2(dx, dy);
            rightArm.angle = rightArm.angle + (targetAngle - rightArm.angle) * smokeState.liftProgress;
        }
    }

    // 1. Arka plandaki (Far) kolların çizimi
    if (farArm) {
        farArm.forEach(arm => {
            drawClassic2Arm(ctx, arm.sx, arm.sy, arm.angle, arm.isLeft, arm.isFar, sleeveStyle, skinColor, watchId, isSitting);
        });
    }

    // 1.5. Karakter arkasını döndüğünde (Kuzey, Kuzey-Doğu, Kuzey-Batı), el eşyaları vücudun arkasında kalır!
    // Böylece gövde ve bacaklar eşyanın önünü kapatır, sadece salınan ve dışa taşan kısımları görünür.
    if (drawItemUnder) {
        _safeDrawHeldItem(ctx, pX, pY, heldItem, isPreview, facing, false, 'classic_2', p);
    }

    // 2. Bacaklar & Ayakkabılar (Kadın/Erkek Anatomisiyle)
    drawAvatarLegsAndShoes(ctx, pX, pY, legSwing, skinColor, p.shoes, isSkirt, isSitting, facing, isFemale, pantsColor, legFilter);

    // 3. Gövde & Kıyafet / Özel Takım Seti
    drawClassic2Torso(ctx, pX, pY, p, facing, isFemale);

    // 4. Ön plandaki (Near) kolların çizimi
    if (nearArm) {
        nearArm.forEach(arm => {
            drawClassic2Arm(ctx, arm.sx, arm.sy, arm.angle, arm.isLeft, arm.isFar, sleeveStyle, skinColor, watchId, isSitting);
        });
    }

    let headNodY = (p.action === 'afk') ? ((Math.sin(Date.now() / 1150) * 0.5 + 0.5) * 1.5) : 0;

    // 5. Kafa
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(pX, pY - 18 + headNodY, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 6. Şapkalar & Saç Modelleri
    let hairType = (p && p.hair) || 'none';
    let hatType = (p && p.hat) || 'none';
    if (typeof hatType === 'string' && hatType.startsWith('hair_') && hairType === 'none') {
        hairType = hatType;
        hatType = 'none';
    }
    if (hairType && hairType !== 'none') {
        drawAvatarHairAndHats(ctx, pX, pY + headNodY, hairType, facing);
    }
    if (hatType && hatType !== 'none') {
        drawAvatarHairAndHats(ctx, pX, pY + headNodY, hatType, facing);
    }

    // 7. Gözler ve Yüz Aksesuarları
    let eyeOffsetX = 0, eyeOffsetY = 0;
    if (facing === 'left' || facing === 'down-left') eyeOffsetX = -2.5;
    else if (facing === 'right' || facing === 'down-right') eyeOffsetX = 2.5;
    if (facing === 'up' || facing === 'up-left' || facing === 'up-right') eyeOffsetY = -2;
    else eyeOffsetY = 1;
    drawAvatarFaceAndEyes(ctx, pX, pY + headNodY, p.face || 'none', eyeOffsetX, eyeOffsetY, facing, (p.action === 'afk'), p);

    // 8. Ön ve yan açılarda (veya sırtta taşınan eşyalarda) eşya gövdenin önünde çizilir
    if (!drawItemUnder && heldItem && heldItem !== 'none') {
        _safeDrawHeldItem(ctx, pX, pY, heldItem, isPreview, facing, false, 'classic_2', p);
    } else if (drawItemUnder && smokeState && smokeState.isExhaling) {
        drawExhaleSmoke(ctx, pX, pY, facing, 'classic_2', smokeState.exhaleProgress);
    }
}

// --- 7. GARDIROP ÖNİZLEME DÖNGÜSÜ ---
function avatarPreviewLoop() {
    if (!isWardrobeOpen) return;
    drawAvatarPreview();
    requestAnimationFrame(avatarPreviewLoop);
}
window.avatarPreviewLoop = avatarPreviewLoop;
window.drawAvatarPreview = drawAvatarPreview;

let _cachedPreviewCanvas = null;
let _cachedPreviewCtx = null;

function drawAvatarPreview() {
    if (!_cachedPreviewCanvas) {
        _cachedPreviewCanvas = document.getElementById('avatarPreviewCanvas');
        if (_cachedPreviewCanvas) _cachedPreviewCtx = _cachedPreviewCanvas.getContext('2d');
    }
    if (!_cachedPreviewCanvas || !_cachedPreviewCtx) return;
    const previewCanvas = _cachedPreviewCanvas;
    const pCtx = _cachedPreviewCtx;
    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

    let cX = previewCanvas.width / 2;
    let cY = 116;

    pCtx.fillStyle = "rgba(56, 189, 248, 0.12)";
    pCtx.beginPath();
    pCtx.ellipse(cX, cY + 20, 52, 16, 0, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.strokeStyle = "rgba(56, 189, 248, 0.4)";
    pCtx.lineWidth = 1.5;
    pCtx.stroke();

    pCtx.fillStyle = "rgba(56, 189, 248, 0.25)";
    pCtx.beginPath();
    pCtx.ellipse(cX, cY + 20, 34, 10, 0, 0, Math.PI * 2);
    pCtx.fill();

    let idleBob = Math.sin(Date.now() / 260) * 2.5;

    pCtx.save();
    pCtx.translate(cX, cY + idleBob);
    pCtx.scale(1.9, 1.9);

    pCtx.fillStyle = "rgba(0, 0, 0, 0.35)";
    pCtx.beginPath();
    pCtx.ellipse(0, 22, 12, 5, 0, 0, Math.PI * 2);
    pCtx.fill();

    let activeAv = (isWardrobeOpen && previewAvatar) ? previewAvatar : myAvatar;
    if (activeAv) {
        const userGen = (typeof getPlayerGender === 'function') ? getPlayerGender() : (typeof window !== 'undefined' ? (window.myGender || 'male') : 'male');
        if (!activeAv.gender) activeAv.gender = userGen;
        activeAv.isFemale = (userGen === 'female');
        if (!activeAv.id && typeof window !== 'undefined') activeAv.id = window.myId || 'preview_self';
        if ((!activeAv.face || activeAv.face === 'none') && myAvatar && myAvatar.face && myAvatar.face !== 'none' && (!previewAvatar || previewAvatar._selectedFaceCategory !== true)) {
            activeAv.face = myAvatar.face;
            activeAv.faceColor = myAvatar.faceColor || 'original';
        }
    }
    let isDressOrSkirt = (activeAv.color && (activeAv.color.startsWith('dress_') || activeAv.color.startsWith('skirt_')));
    let isFemale = isFemaleAvatar(activeAv, activeAv.color, activeAv.hat, activeAv.shoes);
    let facing = (typeof window !== 'undefined' && window.previewFacing) ? window.previewFacing : 'down';

    let previewCycle = Date.now() / 250;
    let isK2Preview = (activeAv.model === 'karakter_2' || (typeof window !== 'undefined' && window.selectedModelId === 'karakter_2'));
    let costumeId = activeAv.costume || (activeAv.outfit && activeAv.outfit.startsWith('costume_') ? activeAv.outfit : null);
    let isZombieCostumeActive = (typeof ZombieCostumeRenderer !== 'undefined' && ZombieCostumeRenderer.isCostume(costumeId));
    let isCostumeActive = isZombieCostumeActive || (typeof AnimalCostumeRenderer !== 'undefined' && AnimalCostumeRenderer.isCostume(costumeId));
    if (isZombieCostumeActive) {
        ZombieCostumeRenderer.draw(pCtx, 0, 0, activeAv, facing, false, false, previewCycle, true);
    } else if (isCostumeActive) {
        AnimalCostumeRenderer.draw(pCtx, 0, 0, activeAv, facing, false, false, previewCycle, true);
    } else if (isK2Preview && typeof Karakter2Renderer !== 'undefined') {
        Karakter2Renderer.draw(pCtx, 0, 0, activeAv, facing, false, 0, previewCycle, false, true);
    } else {
        drawClassic2Avatar(pCtx, 0, 0, activeAv, facing, false, 0, previewCycle, false, true);
    }
    pCtx.restore();
    return;
}

function drawAvatarFarLegMounted(ctx, pX, pY, p, facing, legSwing) {
    let isFemale = isFemaleAvatar(p, p.color, p.hat, p.shoes);
    let skinColor = p.skinColor || "#ffd1a4";
    let isSkirt = false;
    let pantsColor = '#2563eb';
    let out = p.outfit;
    if (out === 'outfit_c2_gentleman') {
        pantsColor = '#1e293b';
    } else if (out === 'outfit_c2_street_cool') {
        pantsColor = '#1d4ed8';
    } else if (out === 'outfit_c2_casual_polo') {
        pantsColor = '#d4b996';
    } else if (out === 'outfit_c2_femme_chic') {
        pantsColor = '#db2777';
        isSkirt = true;
    } else if (out && out.startsWith('dress_')) {
        isSkirt = true;
        pantsColor = skinColor;
    } else if (p.pants) {
        if (p.pants === 'pants_classic_jeans') pantsColor = '#2563eb';
        else if (p.pants === 'pants_classic_black') pantsColor = '#1e293b';
        else if (p.pants === 'pants_classic_beige') pantsColor = '#d4b996';
        else if (p.pants === 'pants_classic_cargo_olive') pantsColor = '#4d5d3b';
        else if (p.pants === 'pants_classic_white_skirt') { pantsColor = '#ffffff'; isSkirt = true; }
    }

    drawAvatarLegsAndShoes(ctx, pX, pY, legSwing, skinColor, p.shoes, isSkirt, true, facing, isFemale, pantsColor, 'far');
}

// --- 8. ANİMASYONLU VE ÇOK OYUNCULU OYUNCU ÇİZİM MOTORU ---
function drawAnimatedPlayer(p, id) {
    let isMounted = !!p.hasHorse;
    let isRidingSwan = (typeof currentRoom !== 'undefined' && (currentRoom === 'sahil' || currentRoom === 'sahilv2') && p.hasSwanBoat);
    let isSitting = (p.action === 'sitting' || p.action === 'sit_floor' || isRidingSwan || isMounted);
    let isSelf = (typeof myId !== 'undefined' && id === myId);
    let playerWalkCycle = isSelf ? (typeof walkCycle !== 'undefined' ? walkCycle : (p.walkCycle || 0)) : (p.walkCycle || 0);
    let isMoving = isSelf ? (!!p.isMoving || (typeof keys !== 'undefined' && (keys.w || keys.a || keys.s || keys.d)) || Math.abs(p.vx || 0) > 0.05 || Math.abs(p.vy || 0) > 0.05) : !!p.isMoving;
    if (isSitting && !isRidingSwan && !isMounted) isMoving = false;
    let bob = (isMoving && !isSitting) ? Math.sin(playerWalkCycle) * 2.5 : 0;
    let legSwing = (isMoving && !isSitting) ? Math.sin(playerWalkCycle) * 5 : 0;

    let inWater = false;
    if (typeof currentRoom !== 'undefined') {
        if (currentRoom === 'sahilv2' && typeof isSahilV2Water === 'function') {
            inWater = isSahilV2Water(p.x, p.y);
        } else if (currentRoom === 'sahil') {
            let onPier = (p.x >= 70 && p.x <= 555 && p.y >= 150 && p.y <= 235);
            let shoreX = (typeof getBeachShoreX === 'function') ? getBeachShoreX(p.y) : 300;
            inWater = (p.x < shoreX && !onPier);
        }
    }
    let swanBob = (isRidingSwan && inWater) ? Math.sin(Date.now() / 320) * 2.2 : 0;
    let gallopBob = isMounted ? (isMoving ? Math.sin(playerWalkCycle * 2) * 2.8 : Math.sin(Date.now() / 400) * 0.8) : 0;

    let pX = p.x;
    let isGardenHouse = typeof isCurrentlyInGardenHouse === 'function' && isCurrentlyInGardenHouse();
    let elevOffset = isGardenHouse && typeof getGardenHouseElevationOffset === 'function'
        ? getGardenHouseElevationOffset(p.x, p.y)
        : 0;
    let pY = p.y + (isSitting && !isRidingSwan && !isMounted ? (p.action === 'sit_floor' ? 6.5 : 7) : (isRidingSwan ? -3 + swanBob : (isMounted ? -10 + gallopBob : bob))) - elevOffset;
    let isK2 = (p.model === 'karakter_2' || (isSelf && typeof myAvatar !== 'undefined' && myAvatar && myAvatar.model === 'karakter_2') || (p.outfit === 'outfit_k2_cat' || p.outfit === 'outfits_outfit_k2_cat'));
    let costumeId = p.costume || (p.outfit && p.outfit.startsWith('costume_') ? p.outfit : null);
    let isZombieCostumeActive = (typeof ZombieCostumeRenderer !== 'undefined' && ZombieCostumeRenderer.isCostume(costumeId));
    let isCostumeActive = isZombieCostumeActive || (typeof AnimalCostumeRenderer !== 'undefined' && AnimalCostumeRenderer.isCostume(costumeId));

    let isDancing = (p.action === 'dance');
    let isK2Pre = (p.model === 'karakter_2' || (isSelf && typeof myAvatar !== 'undefined' && myAvatar && myAvatar.model === 'karakter_2'));
    let danceTilt = (isDancing && !isK2Pre) ? Math.sin(Date.now() / 140) * 0.15 : 0;

    ctx.save();

    // --- ZEUS'UN YILDIRIMI: ÇARPILMA (İSKELET) & KÜL OLMA (KÜL YIĞINI) ---
    const isShocked = !!(p.isElectrocuted);
    const isAshed = !!(p.isAshed || (p.ashedUntil && p.ashedUntil > Date.now()));
    if (isShocked && typeof ZeusLightningEngine !== 'undefined') {
        ZeusLightningEngine.drawElectrocutedSkeleton(ctx, pX, pY, p);
        ctx.restore();
        return;
    }
    if (isAshed && typeof ZeusLightningEngine !== 'undefined') {
        ZeusLightningEngine.drawAshPile(ctx, pX, pY, p);
        ctx.restore();
        return;
    }

    if (isDancing && !isK2Pre) {
        ctx.translate(pX, pY);
        ctx.rotate(danceTilt);
        ctx.translate(-pX, -pY);
    }

    let isWearingInvisCostume = !!(p.outfit === 'costume_invisibility' || p.outfit === 'outfit_invisibility' || p.costume === 'costume_invisibility');
    let isInvisible = !!isWearingInvisCostume;
    let pushedAlpha = false;

    if (isInvisible) {
        if (!isSelf) {
            // BAŞKA OYUNCULAR İÇİN: Karakter ve gölgesi %100 silinir (0% opaklık).
            // ANCAK: Görünmez olan kişi konuştuğunda konuşma baloncuğu tam yerinde görünür!
            if (typeof activeChatBubbles !== 'undefined' && activeChatBubbles[id] && activeChatBubbles[id].length > 0) {
                ctx.save();
                ctx.globalAlpha = 1.0;
                drawPlayerChatBubblesHelper(ctx, id, pX, pY - 60);
                ctx.restore();
            }
            ctx.restore();
            return;
        }
        // GÖRÜNMEZLİK KOSTÜMÜNÜ GİYEN KİŞİ KENDİSİNİ SİLÜET OLARAK GÖRÜR:
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.shadowColor = "rgba(56, 189, 248, 0.85)";
        ctx.shadowBlur = 10;
        pushedAlpha = true;
    }

    // K2 and animal costumes draw their own ground shadows alongside their models.
    if (!isInvisible && !isRidingSwan && !isMounted && !isK2 && !isCostumeActive) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.beginPath();
        ctx.ellipse(pX, pY + (isSitting ? 16 : 22), isSitting ? 14 : 12, isSitting ? 5.5 : 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Klasik Model (K1) Sokak Kaykayı Ulaşım Aracı
    if (!isInvisible && !isRidingSwan && !isMounted && !isK2 && !isSitting && p.heldItem === 'k2_skateboard' && typeof Karakter2Renderer !== 'undefined' && typeof Karakter2Renderer.drawSkateboard === 'function') {
        ctx.save();
        ctx.translate(pX, pY + 3.0);
        Karakter2Renderer.drawSkateboard(ctx, facing, isMoving, Date.now(), !!p.isSprinting, (facing === 'left' || facing === 'down-left' || facing === 'up-left'));
        ctx.restore();
    }

    const model = 'classic_2';
    let rawFacing = isSelf ? (typeof myFacing !== 'undefined' ? myFacing : (p.facing || 'down')) : (p.facing || 'down');
    let facing = normalize8WayFacing(rawFacing);
    let isFemale = isFemaleAvatar(p, p.color, p.hat, p.shoes);

    // BİNEK ATI - Katman 1: Gövde, Arka Bacaklar, Kuyruk ve Eyer (Karakterin arkasında çizilir)
    if (isMounted && typeof HorseMountRenderer !== 'undefined') {
        drawAvatarFarLegMounted(ctx, pX, pY, p, facing, legSwing);

        ctx.save();
        ctx.translate(pX, p.y + 12);
        ctx.scale(1.15, 1.15);
        if (!isInvisible) {
            HorseMountRenderer.drawGroundShadow(ctx, isMoving, playerWalkCycle, facing);
        }
        HorseMountRenderer.drawHorseBase(ctx, facing, isMoving, playerWalkCycle);
        ctx.restore();
    }

    // Kuğu Deniz Bisikleti - Katman 1: Tekne Tabanı, Su Dalgaları ve Koltuklar
    if (isRidingSwan && typeof SwanBoatRenderer !== 'undefined') {
        ctx.save();
        ctx.translate(pX, p.y + 6 + swanBob);
        ctx.scale(1.15, 1.15);
        if (inWater) {
            SwanBoatRenderer.drawWaterEffects(ctx, isMoving, Date.now());
        } else if (!isInvisible) {
            SwanBoatRenderer.drawGroundShadow(ctx);
        }
        SwanBoatRenderer.drawBoatBase(ctx, facing, isMoving, Date.now());
        ctx.restore();
    }

    if (isZombieCostumeActive) {
        ZombieCostumeRenderer.draw(ctx, pX, pY, p, facing, isSitting, isMoving, playerWalkCycle, false);
    } else if (isCostumeActive) {
        AnimalCostumeRenderer.draw(ctx, pX, pY, p, facing, isSitting, isMoving, playerWalkCycle, false);
    } else if (isK2 && typeof Karakter2Renderer !== 'undefined') {
        if (!p.id && id) p.id = id;
        Karakter2Renderer.draw(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, false, isMounted ? 'near' : 'all');
    } else {
        drawClassic2Avatar(ctx, pX, pY, p, facing, isSitting, legSwing, playerWalkCycle, isMoving, false, isMounted ? 'near' : 'all');
    }

    // Anonim Maske (Gizli Kimlik Maskesi Çizimi - 8 Açılı 2.5D İzometrik)
    let isAnon = (p.anonMaskExpiresAt && p.anonMaskExpiresAt > Date.now());
    if (isAnon && !isCostumeActive && typeof drawIsometricAnonMask === 'function') {
        drawIsometricAnonMask(ctx, pX, pY, facing, isK2, p);
    }

    if (pushedAlpha) {
        ctx.restore();
    }

    // 7. Elde Taşınan Eşyalar & Balık Tutma
    if (p.isFishing) {
        ctx.save();
        let rodDirX = (facing === 'left' || facing === 'down-left' || facing === 'up-left') ? -1 : 1;
        let fishHandX = pX + rodDirX * 10;
        let fishHandY = pY + 2;
        let rodBend = Math.sin(Date.now() / 240) * 2;
        let tipX = fishHandX + rodDirX * 26;
        let tipY = fishHandY - 18 + rodBend;

        ctx.strokeStyle = "#334155"; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(fishHandX, fishHandY);
        ctx.quadraticCurveTo(fishHandX + rodDirX * 13, fishHandY - 14, tipX, tipY);
        ctx.stroke();

        ctx.fillStyle = "#f59e0b";
        ctx.beginPath(); ctx.arc(fishHandX + rodDirX * 4, fishHandY, 3, 0, Math.PI * 2); ctx.fill();

        let floatTargetX = tipX + rodDirX * 16;
        let floatTargetY = tipY + 40;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(tipX, tipY); ctx.lineTo(floatTargetX, floatTargetY); ctx.stroke();

        let bobberAnim = Math.sin(Date.now() / 180) * 2;
        ctx.fillStyle = "#ef4444";
        ctx.beginPath(); ctx.arc(floatTargetX, floatTargetY + bobberAnim, 3.5, Math.PI, 0); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(floatTargetX, floatTargetY + bobberAnim, 3.5, 0, Math.PI); ctx.fill();

        let rippleR = ((Date.now() / 35) % 14) + 2;
        let rippleAlpha = 1 - (rippleR / 16);
        ctx.strokeStyle = `rgba(255, 255, 255, ${rippleAlpha * 0.7})`; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(floatTargetX, floatTargetY + 3, rippleR, rippleR * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    } else {
        if (!isK2 && p && p.model && p.model !== 'classic_2') {
            let activeHeld = p.heldItem || (p.hasTea ? 'cay' : 'none');
            _safeDrawHeldItem(ctx, pX, pY, activeHeld, false, facing, false, 'classic', p);
        }
    }

    // Karakter 1 (Klasik) için eski overlay emotelar (Karakter 2 kendi eklemli kollarıyla yapar!)
    if (!isK2) {
        // 8. El Sallama Animasyonu
        if (p.action === 'wave') {
            let waveArmAngle = Math.sin(Date.now() / 90) * 0.4 - 0.7;
            ctx.save();
            ctx.translate(pX + 10, pY - 5);
            ctx.rotate(waveArmAngle);
            ctx.fillStyle = p.color;
            ctx.fillRect(0, -12, 4, 12);
            ctx.fillStyle = "#facc15";
            ctx.beginPath(); ctx.arc(2, -14, 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        // 9. Alkış Animasyonu
        if (p.action === 'clap') {
            let clapOffset = Math.abs(Math.sin(Date.now() / 80)) * 4;
            ctx.fillStyle = "#facc15";
            ctx.beginPath(); ctx.arc(pX - 4 + clapOffset, pY + 2, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(pX + 4 - clapOffset, pY + 2, 3, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#facc15";
            ctx.font = "10px sans-serif";
            ctx.fillText("✨", pX + 8, pY);
        }

        // 10. Dans Eden Nota Simgeleri
        if (isDancing) {
            let noteY = pY - 44 - ((Date.now() / 50) % 12);
            ctx.fillStyle = "#ec4899";
            ctx.font = "bold 12px sans-serif";
            ctx.fillText("♪ ♫", pX + 10, noteY);
        }

        // 10.5 AFK / Uyuklama Süzülen Zzz Efekti 💤
        if (p.action === 'afk') {
            if (typeof Karakter2Renderer !== 'undefined' && typeof Karakter2Renderer.drawAfkSleepBubbles === 'function') {
                Karakter2Renderer.drawAfkSleepBubbles(ctx, pX, pY);
            }
        }
    }

    ctx.restore();

    // 10.0 BİNEK ATI - Katman 2: Baş, Boyun, Kulaklar, Yele, Dizginler ve Üzengi (Karakterin önünde çizilir)
    if (p.hasHorse && typeof HorseMountRenderer !== 'undefined') {
        ctx.save();
        ctx.translate(pX, p.y + 12);
        ctx.scale(1.15, 1.15);
        HorseMountRenderer.drawHorseFront(ctx, facing, isMoving, playerWalkCycle);
        ctx.restore();
    }

    // 10.1 KUĞU DENİZ BİSİKLETİ (ÖN KATMAN: Kuğu Boynu, Gaga, Direksiyon ve Ön Pruva)
    if (isRidingSwan && typeof SwanBoatRenderer !== 'undefined') {
        ctx.save();
        ctx.translate(pX, p.y + 6 + swanBob);
        ctx.scale(1.15, 1.15);
        SwanBoatRenderer.drawBoatFront(ctx, facing, isMoving, Date.now());
        ctx.restore();
    }

    // 10.2 NARGİLE DUMAN EFEKTİ
    if (p.heldItem === 'nargile' || (typeof currentRoom !== 'undefined' && currentRoom === 'nargile_cafe')) {
        let smokeTime = Date.now();
        for (let i = 0; i < 3; i++) {
            let offsetTime = (smokeTime / 450 + i * 2) % 6;
            let smokeAlpha = Math.max(0, 1 - (offsetTime / 6));
            let smokeY = pY - 28 - (offsetTime * 8);
            let smokeX = pX + Math.sin(offsetTime * 1.5 + i) * 6;
            let smokeR = 3 + offsetTime * 2.2;

            ctx.fillStyle = `rgba(240, 240, 255, ${smokeAlpha * 0.45})`;
            ctx.beginPath(); ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2); ctx.fill();
        }
    }

    // 11. OYUNCU İSMİ ROZETİ (K2 1px aşağı, K1 aynı saç-isim aralığıyla dengelendi)
    const isAnonNick = !!(p.anonMaskExpiresAt && p.anonMaskExpiresAt > Date.now());
    const isNeonRed = !!(p.neonRedNickExpiresAt && p.neonRedNickExpiresAt > Date.now());
    const isJammed = !!(p.jammerExpiresAt && p.jammerExpiresAt > Date.now());

    let effDisplayName = isAnonNick ? "???" : (p.name || '');

    ctx.font = "bold 11px sans-serif";
    let nameWidth = ctx.measureText(effDisplayName).width;

    let costumeOffset = 0;
    if (isZombieCostumeActive && typeof ZombieCostumeRenderer !== 'undefined') {
        costumeOffset = ZombieCostumeRenderer.getNameTagOffset(costumeId);
    } else if (isCostumeActive && typeof AnimalCostumeRenderer !== 'undefined') {
        costumeOffset = AnimalCostumeRenderer.getNameTagOffset(costumeId, p, isMoving);
    }
    let nameBoxY = (isK2 ? (pY - 55) : (pY - 50)) + costumeOffset;
    let nameTextY = (isK2 ? (pY - 43) : (pY - 38)) + costumeOffset;

    ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
    ctx.beginPath();
    ctx.roundRect(pX - nameWidth / 2 - 6, nameBoxY, nameWidth + 12, 16, 6);
    ctx.fill();

    if (isNeonRed) {
        ctx.strokeStyle = "#ff1744";
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    ctx.save();
    if (isNeonRed) {
        ctx.fillStyle = "#ff1744";
        ctx.shadowColor = "#ff1744";
        ctx.shadowBlur = 9;
    } else {
        ctx.fillStyle = isSelf ? "#38bdf8" : "#ffffff";
    }
    ctx.textAlign = "center";
    let finalDisplayName = (isInvisible && isSelf) ? (effDisplayName + " (Görünmez)") : effDisplayName;
    ctx.fillText(finalDisplayName, pX, nameTextY);
    ctx.restore();

    // Sinyal Yok (Jammer) Rozeti
    if (isJammed) {
        let jammerPulse = Math.sin(Date.now() / 180) * 1.5;
        let jTagY = nameBoxY - 18 + jammerPulse;
        let jText = "📡❌ Sinyal Yok";
        ctx.save();
        ctx.font = "bold 9.5px sans-serif";
        let jW = ctx.measureText(jText).width + 10;
        ctx.fillStyle = "rgba(185, 28, 28, 0.92)";
        ctx.beginPath();
        ctx.roundRect(pX - jW / 2, jTagY, jW, 15, 5);
        ctx.fill();
        ctx.strokeStyle = "#fca5a5"; ctx.lineWidth = 1.2; ctx.stroke();
        ctx.fillStyle = "#ffffff"; ctx.textAlign = "center";
        ctx.fillText(jText, pX, jTagY + 11);
        ctx.restore();
    }

    // 11.1 Oturma İpucu (Kullanıcı talebiyle kaldırıldı - [E] tuşu veya tıklama çalışmaya devam eder)

    // 11.2 Canlı Sesli Konuşma Göstergesi
    if (p.isSpeaking) {
        ctx.save();
        ctx.strokeStyle = "#10b981"; ctx.lineWidth = 2.5;
        ctx.beginPath();
        let pulseRadius = 24 + Math.sin(Date.now() / 150) * 3;
        ctx.arc(pX, pY - 14, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "12px sans-serif";
        ctx.fillText("🎙️", pX + nameWidth / 2 + 12, nameTextY);
        ctx.restore();
    }

    // 12. Konuşma Baloncukları
    drawPlayerChatBubblesHelper(ctx, id, pX, nameBoxY - 10);

    // 13. Hızlı Emoji Tepkileri
    if (typeof activePlayerEmojis !== 'undefined' && activePlayerEmojis[id]) {
        let emojiData = activePlayerEmojis[id];
        let elapsed = Date.now() - emojiData.start;
        if (elapsed < 3000) {
            let progress = elapsed / 3000;
            let alpha = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;
            let floatY = (nameBoxY - 12) - (progress * 28);
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
            ctx.beginPath();
            ctx.arc(pX, floatY, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#cbd5e1"; ctx.lineWidth = 1.5; ctx.stroke();
            ctx.font = "18px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(emojiData.emoji, pX, floatY + 1);
            ctx.restore();
        } else {
            delete activePlayerEmojis[id];
        }
    }
}

// --- 14. 8 AÇILI 2.5D İZOMETRİK GİZLİ KİMLİK MASKESİ ÇİZİM MOTORU ---
function drawIsometricAnonMask(ctx, pX, pY, facing, isK2, p) {
    if (!ctx) return;
    facing = (typeof normalize8WayFacing === 'function') ? normalize8WayFacing(facing || 'down') : (facing || 'down');
    
    // Kafa merkez koordinatları (K2 ve K1 kafalarının dikey anatomisi)
    let headCenterY = isK2 ? (pY - 24) : (pY - 20);
    let headCenterX = pX;

    // Oturma veya yürüme kafa salınımı telafisi
    if (p && p.isSitting) {
        headCenterY += isK2 ? 5 : 4;
    } else if (p && p.isMoving && typeof playerWalkCycle !== 'undefined') {
        headCenterY += Math.sin(playerWalkCycle) * 1.2;
    }

    ctx.save();
    
    // Malzeme ve Renk Paleti
    const maskObsidian = "#09090b";
    const maskBorder = "#3f3f46";
    const strapLeather = "#18181b";
    const strapBorder = "#27272a";
    const buckleSilver = "#cbd5e1";
    const buckleShadow = "#64748b";
    const eyeCutoutBg = "#020617";
    const specularWhite = "rgba(255, 255, 255, 0.92)";

    const mX = headCenterX;
    const mY = headCenterY;

    if (facing === 'down') {
        // --- 1. ÖN (DOWN) - Klasik Venedik / Kara Domino Maske ---
        // Şakaklardan arkaya doğru uzanan deri bağ uçları
        ctx.fillStyle = strapLeather;
        ctx.fillRect(mX - 9.5, mY - 3, 2, 2.5);
        ctx.fillRect(mX + 7.5, mY - 3, 2, 2.5);

        // Ana Maske Gövdesi (Kavisli obsidian gövde)
        ctx.fillStyle = maskObsidian;
        ctx.strokeStyle = maskBorder;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(mX - 8.5, mY - 4.5);
        ctx.quadraticCurveTo(mX - 4, mY - 5.5, mX, mY - 2.5);
        ctx.quadraticCurveTo(mX + 4, mY - 5.5, mX + 8.5, mY - 4.5);
        ctx.quadraticCurveTo(mX + 8.5, mY + 2.5, mX + 5, mY + 3.5);
        ctx.quadraticCurveTo(mX + 1.5, mY + 0.8, mX, mY + 1.8);
        ctx.quadraticCurveTo(mX - 1.5, mY + 0.8, mX - 5, mY + 3.5);
        ctx.quadraticCurveTo(mX - 8.5, mY + 2.5, mX - 8.5, mY - 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Üst kaş hattı parıltısı
        ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(mX - 7.5, mY - 3.8);
        ctx.lineTo(mX - 2, mY - 3);
        ctx.moveTo(mX + 2, mY - 3);
        ctx.lineTo(mX + 7.5, mY - 3.8);
        ctx.stroke();

        // Sol Göz Boşluğu ve Işıltı
        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX - 4.2, mY - 1.2, 2.2, 1.4, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX - 4.8, mY - 1.8, 1.2, 1);

        // Sağ Göz Boşluğu ve Işıltı
        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX + 4.2, mY - 1.2, 2.2, 1.4, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX + 3.8, mY - 1.8, 1.2, 1);

    } else if (facing === 'down-right') {
        // --- 2. ÇAPRAZ ÖN SAĞ (DOWN-RIGHT) - 3/4 İzometrik Perspektif ---
        ctx.fillStyle = strapLeather;
        ctx.fillRect(mX - 7.5, mY - 3, 1.8, 2);

        ctx.fillStyle = maskObsidian;
        ctx.strokeStyle = maskBorder;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(mX - 6.5, mY - 4);
        ctx.quadraticCurveTo(mX - 2, mY - 4.8, mX + 1, mY - 2.5);
        ctx.quadraticCurveTo(mX + 5, mY - 5.5, mX + 9, mY - 3.8);
        ctx.quadraticCurveTo(mX + 9, mY + 2.5, mX + 5.5, mY + 3.5);
        ctx.quadraticCurveTo(mX + 2, mY + 1.2, mX + 0.5, mY + 2);
        ctx.quadraticCurveTo(mX - 3, mY + 1, mX - 5.5, mY + 2.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = strapLeather;
        ctx.fillRect(mX + 8, mY - 2.8, 2.5, 2.2);

        // Sol Göz (Perspektif daralması)
        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX - 2.8, mY - 1.2, 1.6, 1.3, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX - 3.2, mY - 1.8, 1, 1);

        // Sağ Göz (Geniş ve net)
        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX + 4.5, mY - 1.2, 2.3, 1.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX + 4.2, mY - 1.8, 1.3, 1);

    } else if (facing === 'down-left') {
        // --- 3. ÇAPRAZ ÖN SOL (DOWN-LEFT) - 3/4 Aynalanmış ---
        ctx.fillStyle = strapLeather;
        ctx.fillRect(mX + 5.7, mY - 3, 1.8, 2);

        ctx.fillStyle = maskObsidian;
        ctx.strokeStyle = maskBorder;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(mX + 6.5, mY - 4);
        ctx.quadraticCurveTo(mX + 2, mY - 4.8, mX - 1, mY - 2.5);
        ctx.quadraticCurveTo(mX - 5, mY - 5.5, mX - 9, mY - 3.8);
        ctx.quadraticCurveTo(mX - 9, mY + 2.5, mX - 5.5, mY + 3.5);
        ctx.quadraticCurveTo(mX - 2, mY + 1.2, mX - 0.5, mY + 2);
        ctx.quadraticCurveTo(mX + 3, mY + 1, mX + 5.5, mY + 2.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = strapLeather;
        ctx.fillRect(mX - 10.5, mY - 2.8, 2.5, 2.2);

        // Sağ Göz
        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX + 2.8, mY - 1.2, 1.6, 1.3, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX + 2.2, mY - 1.8, 1, 1);

        // Sol Göz
        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX - 4.5, mY - 1.2, 2.3, 1.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX - 5.5, mY - 1.8, 1.3, 1);

    } else if (facing === 'right') {
        // --- 4. SAĞ PROFİL (RIGHT) ---
        ctx.fillStyle = strapLeather;
        ctx.fillRect(mX - 7, mY - 2.5, 10, 2.4);
        ctx.strokeStyle = strapBorder;
        ctx.strokeRect(mX - 7, mY - 2.5, 10, 2.4);

        // Küçük gümüş toka / perçin
        ctx.fillStyle = buckleSilver;
        ctx.fillRect(mX - 3, mY - 3, 2, 3.4);

        ctx.fillStyle = maskObsidian;
        ctx.strokeStyle = maskBorder;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(mX + 3, mY - 4.5);
        ctx.lineTo(mX + 7.5, mY - 2.5);
        ctx.quadraticCurveTo(mX + 8, mY + 0.5, mX + 6.5, mY + 2.5);
        ctx.lineTo(mX + 3, mY + 3);
        ctx.quadraticCurveTo(mX + 1.5, mY - 0.5, mX + 3, mY - 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX + 4.8, mY - 1, 1.8, 1.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX + 4.5, mY - 1.6, 1.1, 0.9);

    } else if (facing === 'left') {
        // --- 5. SOL PROFİL (LEFT) ---
        ctx.fillStyle = strapLeather;
        ctx.fillRect(mX - 3, mY - 2.5, 10, 2.4);
        ctx.strokeStyle = strapBorder;
        ctx.strokeRect(mX - 3, mY - 2.5, 10, 2.4);

        ctx.fillStyle = buckleSilver;
        ctx.fillRect(mX + 1, mY - 3, 2, 3.4);

        ctx.fillStyle = maskObsidian;
        ctx.strokeStyle = maskBorder;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(mX - 3, mY - 4.5);
        ctx.lineTo(mX - 7.5, mY - 2.5);
        ctx.quadraticCurveTo(mX - 8, mY + 0.5, mX - 6.5, mY + 2.5);
        ctx.lineTo(mX - 3, mY + 3);
        ctx.quadraticCurveTo(mX - 1.5, mY - 0.5, mX - 3, mY - 4.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = eyeCutoutBg;
        ctx.beginPath();
        ctx.ellipse(mX - 4.8, mY - 1, 1.8, 1.2, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = specularWhite;
        ctx.fillRect(mX - 5.6, mY - 1.6, 1.1, 0.9);

    } else if (facing === 'up-right') {
        // --- 6. ÇAPRAZ ARKA SAĞ (UP-RIGHT) ---
        ctx.fillStyle = maskObsidian;
        ctx.beginPath();
        ctx.moveTo(mX + 6.5, mY - 2.5);
        ctx.lineTo(mX + 7.8, mY - 1);
        ctx.lineTo(mX + 6.8, mY + 1.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = strapLeather;
        ctx.strokeStyle = strapBorder;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mX - 6, mY - 1.5);
        ctx.lineTo(mX + 6.8, mY - 2.8);
        ctx.lineTo(mX + 6.8, mY - 0.4);
        ctx.lineTo(mX - 6, mY + 0.9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gümüş Toka
        ctx.fillStyle = buckleSilver;
        ctx.fillRect(mX - 1, mY - 2.8, 3, 3.8);
        ctx.fillStyle = buckleShadow;
        ctx.fillRect(mX, mY - 1.8, 1, 1.8);

    } else if (facing === 'up-left') {
        // --- 7. ÇAPRAZ ARKA SOL (UP-LEFT) ---
        ctx.fillStyle = maskObsidian;
        ctx.beginPath();
        ctx.moveTo(mX - 6.5, mY - 2.5);
        ctx.lineTo(mX - 7.8, mY - 1);
        ctx.lineTo(mX - 6.8, mY + 1.2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = strapLeather;
        ctx.strokeStyle = strapBorder;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mX + 6, mY - 1.5);
        ctx.lineTo(mX - 6.8, mY - 2.8);
        ctx.lineTo(mX - 6.8, mY - 0.4);
        ctx.lineTo(mX + 6, mY + 0.9);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Gümüş Toka
        ctx.fillStyle = buckleSilver;
        ctx.fillRect(mX - 2, mY - 2.8, 3, 3.8);
        ctx.fillStyle = buckleShadow;
        ctx.fillRect(mX - 1, mY - 1.8, 1, 1.8);

    } else if (facing === 'up') {
        // --- 8. TAM ARKA (UP) - Sırttan Görünüm ---
        ctx.fillStyle = strapLeather;
        ctx.strokeStyle = strapBorder;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.roundRect(mX - 8, mY - 2.2, 16, 2.6, 1);
        ctx.fill();
        ctx.stroke();

        // Dikiş çizgisi detayı
        ctx.fillStyle = "#3f3f46";
        ctx.fillRect(mX - 6, mY - 2.6, 2, 0.5);
        ctx.fillRect(mX + 4, mY - 2.6, 2, 0.5);

        // Ortada Çelik / Gümüş Ayar Tokası
        ctx.fillStyle = buckleSilver;
        ctx.fillRect(mX - 2.2, mY - 3.4, 4.4, 5);
        ctx.fillStyle = buckleShadow;
        ctx.fillRect(mX - 1, mY - 2.2, 2, 2.6);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(mX - 0.4, mY - 2.2, 0.8, 2.6);
    }

    ctx.restore();
}
window.drawIsometricAnonMask = drawIsometricAnonMask;
window.drawAnimatedPlayer = drawAnimatedPlayer;
window.drawClassic2Avatar = drawClassic2Avatar;
