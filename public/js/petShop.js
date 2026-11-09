// public/js/petShop.js - Sevimli Patiler Pet Shop İstemci ve Evcil Hayvan Çizim Motoru

window.activeCompanionPets = window.activeCompanionPets || {};
window.activePetSpawnEffects = window.activePetSpawnEffects || [];

// 1. PET SHOP MODAL KONTROLLERİ
function openPetShopModal() {
    if (window.playSound) window.playSound('uiClick');

    const modal = document.getElementById('petShopModal');
    if (!modal) return;

    // Bakiye göstergesini güncelle
    const moneyDisplay = document.getElementById('userMoneyDisplay');
    const petMoneyEl = document.getElementById('petShopUserMoney');
    if (petMoneyEl && moneyDisplay) {
        petMoneyEl.innerText = `${moneyDisplay.innerText} TL`;
    }

    // Sunucudan güncel durumu iste
    if (window.socket) {
        window.socket.emit('getPetShopStatus');
    }

    modal.style.display = 'flex';
}
window.openPetShopModal = openPetShopModal;

function closePetShopModal() {
    const modal = document.getElementById('petShopModal');
    if (modal) modal.style.display = 'none';
}
window.closePetShopModal = closePetShopModal;

function requestBuyPet(petType) {
    if (window.playSound) window.playSound('uiClick');

    if (window.socket) {
        window.socket.emit('requestBuyPet', { petType: petType });
    }
}
window.requestBuyPet = requestBuyPet;


// 2. SOKET DİNLEYİCİLERİ
(function initPetShopSockets() {
    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
    if (!s) return;

    // Odadaki tüm aktif yoldaşlar listesi geldiğinde
    s.on('activeCompanionPets', (petsList) => {
        if (!Array.isArray(petsList)) return;
        let oldPets = Object.assign({}, window.activeCompanionPets);
        window.activeCompanionPets = {};
        petsList.forEach(pet => {
            if (pet) {
                let key = pet.id || (pet.petType === 'izbandut' ? `${pet.ownerId}_s${pet.slotIndex || 0}` : (pet.ownerId || pet.name));
                let existing = oldPets[key] || (pet.id ? oldPets[pet.id] : null);
                if (existing) {
                    pet.curX = existing.curX !== undefined ? existing.curX : pet.x;
                    pet.curY = existing.curY !== undefined ? existing.curY : pet.y;
                    pet.walkCycle = existing.walkCycle || 0;
                    pet.facing = existing.facing || pet.facing || 'down';
                } else {
                    pet.curX = pet.x;
                    pet.curY = pet.y;
                    pet.walkCycle = 0;
                }
                window.activeCompanionPets[key] = pet;
            }
        });
    });

    // Yeni bir yoldaş odaya girdiğinde / sahiplenildiğinde
    s.on('companionPetSpawned', (data) => {
        if (!data || !data.pet) return;
        const pet = data.pet;
        let key = pet.id || (pet.petType === 'izbandut' ? `${pet.ownerId}_s${pet.slotIndex || 0}` : (pet.ownerId || pet.name));

        // Normal evcil hayvan alındığında eski normal evcil hayvan anahtarlarını temizle (İzbandutlara DOKUNMAZ)
        if (pet.petType !== 'izbandut') {
            for (let k in window.activeCompanionPets) {
                let p = window.activeCompanionPets[k];
                if (p && p.ownerId === pet.ownerId && p.petType !== 'izbandut' && p.id !== pet.id) {
                    delete window.activeCompanionPets[k];
                }
            }
        }

        let existing = window.activeCompanionPets[key];
        if (existing) {
            pet.curX = existing.curX !== undefined ? existing.curX : pet.x;
            pet.curY = existing.curY !== undefined ? existing.curY : pet.y;
            pet.walkCycle = existing.walkCycle || 0;
        } else {
            pet.curX = pet.x;
            pet.curY = pet.y;
            pet.walkCycle = 0;
        }
        window.activeCompanionPets[key] = pet;

        // Kendi evcil hayvanımızsa modalı kapat
        if (typeof myId !== 'undefined' && pet.ownerId === myId && pet.petType !== 'izbandut') {
            closePetShopModal();
        }
    });

    // Yoldaş odadan ayrıldığında veya süresi bittiğinde
    s.on('companionPetDespawned', (data) => {
        if (!data) return;
        if (data.petId && window.activeCompanionPets[data.petId]) {
            delete window.activeCompanionPets[data.petId];
        }
        if (data.ownerId) {
            for (let k in window.activeCompanionPets) {
                let p = window.activeCompanionPets[k];
                if (p && p.ownerId === data.ownerId) {
                    if (!data.petId || p.id === data.petId) {
                        delete window.activeCompanionPets[k];
                    }
                }
            }
        }
    });

    // Yoldaş konuşması (Kullanıcı talebiyle kaldırıldı)
    s.on('companionPetSpeak', (data) => {});

    // Pet süresi dolduğunda
    s.on('companionPetExpired', (data) => {
        if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast('⏳', 'Yoldaşının Süresi Doldu', data.message || 'Evcil hayvanın yuvasına döndü.');
        }
    });

    // Satın alma başarılı yanıtı (YALNIZCA BURADA BİLDİRİM GÖSTER)
    s.on('buyPetSuccess', (data) => {
        closePetShopModal();
        if (window.playSound) window.playSound('win');
        if (data && data.pet) {
            let pet = data.pet;
            let key = pet.id || (pet.petType === 'izbandut' ? `${pet.ownerId}_s${pet.slotIndex || 0}` : (pet.ownerId || pet.name));

            if (pet.petType !== 'izbandut') {
                for (let k in window.activeCompanionPets) {
                    let p = window.activeCompanionPets[k];
                    if (p && p.ownerId === pet.ownerId && p.petType !== 'izbandut' && p.id !== pet.id) {
                        delete window.activeCompanionPets[k];
                    }
                }
            }

            let existing = window.activeCompanionPets[key];
            if (existing) {
                pet.curX = existing.curX !== undefined ? existing.curX : pet.x;
                pet.curY = existing.curY !== undefined ? existing.curY : pet.y;
                pet.walkCycle = existing.walkCycle || 0;
            } else {
                pet.curX = pet.x;
                pet.curY = pet.y;
                pet.walkCycle = 0;
            }
            window.activeCompanionPets[key] = pet;

            // Sadece satın alma anında bildirim çıksın
            if (typeof showSocialNotificationToast === 'function') {
                showSocialNotificationToast('🐾', 'Yeni Yoldaş!', `${pet.name} (${pet.emoji || '🐾'}) artık seninle geziyor!`);
            }
        }
    });

    s.on('petPurchaseSuccess', (data) => {
        if (!data) return;
        s.emit('getPetShopStatus');
        if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast(data.emoji || '🐾', 'Evcil Hayvan Sahiplenildi!', `Tebrikler! ${data.name || ''} artık yanınızda.`);
        }
    });

    s.on('petShopCatalog', (data) => {
        if (data && data.pets) {
            window.petShopCatalogData = data.pets;
        }
    });

    // Pet Shop durum bilgisi geldiğinde
    s.on('petShopStatus', (data) => {
        if (!data) return;
        const noticeEl = document.getElementById('petShopActivePetNotice');
        if (noticeEl) {
            if (data.activePet) {
                const mins = Math.ceil(data.activePet.remainingMs / 60000);
                noticeEl.style.display = 'block';
                noticeEl.innerHTML = `⏳ Şu anda aktif bir yoldaşın var: <b>${data.activePet.name} (${data.activePet.emoji})</b> (${mins} dk kaldı). Yeni bir pet alırsan eskisinin yerini alır.`;
            } else {
                noticeEl.style.display = 'none';
            }
        }
        const moneyEl = document.getElementById('petShopUserMoney');
        if (moneyEl && data.money !== undefined) {
            moneyEl.innerText = `${data.money.toLocaleString()} TL`;
        }
    });
})();


// Pet Animasyon Durumları Enum Yapısı
const PetAnimState = Object.freeze({
    IDLE: 'idle',
    WALK: 'walk',
    SPECIAL_IDLE: 'special_idle'
});
window.PetAnimState = PetAnimState;

// 3. ANİMASYON VE ÇİZİM DÖNGÜSÜ (GAME LOOP HOOK)
function calculatePet8WayFacing(dx, dy) {
    if (typeof window.calculate8WayFacing === 'function') {
        return window.calculate8WayFacing(dx, dy);
    }
    if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) return null;

    const octant = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
    return ['right', 'down-right', 'down', 'down-left', 'left', 'up-left', 'up', 'up-right'][octant];
}

function drawJammerFilteringEffect(ctx, pet, x, y, now) {
    ctx.save();
    // 1. Zeminde genişleyen frekans/radar dalgaları (Cyan/Mavi halkalar)
    const waveProgress = (now % 1200) / 1200;
    const waveR = 12 + waveProgress * 36;
    const waveAlpha = (1 - waveProgress) * 0.8;
    ctx.strokeStyle = `rgba(56, 189, 248, ${waveAlpha})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(x, y + 8, waveR, waveR * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();

    const wave2 = ((now + 600) % 1200) / 1200;
    const wave2R = 12 + wave2 * 36;
    const wave2Alpha = (1 - wave2) * 0.8;
    ctx.strokeStyle = `rgba(34, 211, 238, ${wave2Alpha})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(x, y + 8, wave2R, wave2R * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Petin Üzerinde Frekans Çözücü Cihaz ve Osiloskop Dalgası
    const bubbleY = y - (pet.petType === 'izbandut' ? 76 : 56);
    const remainingMs = Math.max(0, (pet.filterJammerUntil || 0) - now);
    const remSec = Math.ceil(remainingMs / 1000);
    const label = `📡 Frekans Çözülüyor... [${remSec}s]`;

    ctx.font = 'bold 11px Inter, sans-serif';
    const textWidth = ctx.measureText(label).width;
    const boxW = textWidth + 24;
    const boxH = 26;

    // Kutu Arka Planı
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#0ea5e9';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, bubbleY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Osiloskop / Frekans Sinyal Çizgisi (Yeşil-Mavi sinüs dalgası)
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const waveStartX = x - boxW / 2 + 8;
    const waveEndX = x + boxW / 2 - 8;
    const waveMidY = bubbleY + 20;
    for (let wx = waveStartX; wx <= waveEndX; wx += 3) {
        let wy = waveMidY + Math.sin((wx * 0.25) + (now * 0.015)) * 3;
        if (wx === waveStartX) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    // Metin
    ctx.fillStyle = '#f0fdf4';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x, bubbleY + 9);

    ctx.restore();
}

function drawPetSpeechBubbleIfNeeded(ctx, pet, x, y, now) {
    if (!pet.speech || !pet.speechUntil || pet.speechUntil <= now) return;

    ctx.save();
    const bubbleY = y - (pet.petType === 'izbandut' ? 82 : 58);
    const msg = pet.speech;

    ctx.font = 'bold 11.5px Inter, sans-serif';
    const textWidth = ctx.measureText(msg).width;
    const boxW = Math.max(80, textWidth + 18);
    const boxH = 24;

    ctx.fillStyle = 'rgba(24, 24, 27, 0.95)';
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(234, 179, 8, 0.4)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, bubbleY - boxH, boxW, boxH, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Konuşma balonu ucu (aşağı doğru üçgen)
    ctx.fillStyle = 'rgba(24, 24, 27, 0.95)';
    ctx.beginPath();
    ctx.moveTo(x - 5, bubbleY);
    ctx.lineTo(x + 5, bubbleY);
    ctx.lineTo(x, bubbleY + 6);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fef08a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(msg, x, bubbleY - boxH / 2);
    ctx.restore();
}

function drawSingleCompanionPet(ctx, pet, x, y, now) {
    ctx.save();

    // Can Siperi Atılma / Hamle Ofseti (Doberman & Fedai Lunge Offset)
    if (pet.lungeUntil && pet.lungeUntil > now) {
        const remaining = pet.lungeUntil - now;
        const progress = Math.max(0, Math.min(1, remaining / 650));
        const hop = Math.sin(progress * Math.PI);
        x += (pet.lungeOffsetX || 0) * hop;
        y += (pet.lungeOffsetY || 0) * hop;
    }

    // 1. Zeus Yıldırımı: Elektrik Çarpması ve Kül Olma Durumları (İzbandut & Doberman Paratoner Savunması)
    if (pet.isAshed && window.ZeusLightningEngine) {
        window.ZeusLightningEngine.drawAshPile(ctx, x, y, pet);
        ctx.restore();
        return;
    }
    if (pet.isElectrocuted && window.ZeusLightningEngine) {
        window.ZeusLightningEngine.drawElectrocutedSkeleton(ctx, x, y, pet);
        ctx.restore();
        return;
    }

    // Özel 8 Yönlü İzbandut Koruma Render Motoru
    if (pet.petType === 'izbandut' && window.IzbandutRenderer) {
        window.IzbandutRenderer.draw(ctx, pet, x, y, now);
        if (pet.isFilteringJammer) {
            drawJammerFilteringEffect(ctx, pet, x, y, now);
        }
        drawPetSpeechBubbleIfNeeded(ctx, pet, x, y, now);
        ctx.restore();
        return;
    }

    // Özel 8 Yönlü Doberman Koruma Köpeği Render Motoru (Tekinsiz Tekin Karaborsa Yoldaşı)
    if (pet.petType === 'doberman' && window.DobermanPetRenderer) {
        window.DobermanPetRenderer.draw(ctx, pet, x, y, now);
        if (pet.isFilteringJammer) {
            drawJammerFilteringEffect(ctx, pet, x, y, now);
        }
        drawPetSpeechBubbleIfNeeded(ctx, pet, x, y, now);
        ctx.restore();
        return;
    }

    const hasDetailedRenderer = ['mouse', 'cat', 'dog'].includes(pet.petType) && window.TfmMouseRenderer;
    if (hasDetailedRenderer) {
        ctx.save();
        ctx.translate(x, y);

        let animToPlay = PetAnimState.IDLE;
        let frameToPlay = 0;

        if (pet.animState === PetAnimState.SPECIAL_IDLE) {
            animToPlay = 'special_idle';
            const elapsed = Math.max(0, now - (pet.specialIdleStart || now));
            const duration = pet.specialIdleDuration || 2500;
            const progress = Math.min(0.999, elapsed / duration);
            frameToPlay = Math.floor(progress * 4);
        } else if (pet.isMoving || pet.animState === PetAnimState.WALK) {
            animToPlay = 'walk';
            frameToPlay = Math.floor(pet.walkCycle || 0) % 4;
        } else {
            animToPlay = 'idle';
            // Kedi dururken arkasını dönüp dönüp durmasın, sabit kalsın (frame 0).
            // Sadece animasyona (special_idle veya walk) girince hareket etsin.
            if (pet.petType === 'cat') {
                frameToPlay = 0;
            } else {
                frameToPlay = Math.floor(now / 450) % 4;
            }
        }

        window.TfmMouseRenderer.draw(ctx, {
            direction: pet.facing || 'down',
            animation: animToPlay,
            frame: frameToPlay,
            scale: pet.petType === 'mouse' ? 0.80 : 0.75,
            showShadow: true,
            species: pet.petType
        });
        ctx.restore();
    } else {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '30px sans-serif';
        ctx.fillText(pet.emoji || '🐾', x, y - 12);
    }

    drawPetSpeechBubbleIfNeeded(ctx, pet, x, y, now);
    ctx.restore();
}

function updateCompanionPets(dt) {
    if (!window.activeCompanionPets) return;
    const now = Date.now();
    const curR = (typeof currentRoom !== 'undefined') ? currentRoom : window.currentRoom;

    for (const id in window.activeCompanionPets) {
        const pet = window.activeCompanionPets[id];
        if (!pet) continue;

        // Sahibinin konumunu bul
        let owner = null;
        if (typeof players !== 'undefined') {
            owner = players[pet.ownerId];
        }
        if (owner && owner.room) {
            pet.room = owner.room;
        }

        // Yalnızca şu anki odadaysa güncelle
        if (curR && pet.room && pet.room !== curR) continue;

        if (pet.curX === undefined) pet.curX = pet.x || 400;
        if (pet.curY === undefined) pet.curY = pet.y || 400;
        if (!pet.animState) pet.animState = PetAnimState.IDLE;

        // Karakterin ayak hizası ve dip dibe girmeyecek şekilde konumu
        let targetX = pet.x;
        let targetY = pet.y;
        let ownerIsMoving = false;

        if (owner) {
            if (pet.petType === 'izbandut') {
                // İzbandut Çoklu Koruma V-Refakat Formasyonu (En fazla 3 koruma)
                // Oyuncu daima önde liderdir. Korumalar arkasında ve kanatlarında refakat eder.
                // Ortadaki İzbandut (slot 2) oyuncunun tam arkasında ve daha yukarıda yükselir;
                // böylece oyuncunun üstüne binmez, arkasında koruyucu bir kalkan gibi yükselir.
                let slot = (typeof pet.slotIndex === 'number') ? pet.slotIndex : 0;
                let f = owner.facing || 'down';
                let ox = 0, oy = 0;

                if (f === 'down' || f === 'down-right' || f === 'down-left') {
                    // Aşağı bakarken: Oyuncu önde, korumalar arkasında
                    // Ortadaki koruma en arkada ve daha yukarıda (kullanıcı talebi: daha yukarı taşı ortadaki izbandutu)
                    if (slot === 0) { ox = -38; oy = -10; }
                    else if (slot === 1) { ox = 38; oy = -10; }
                    else { ox = 0; oy = -60; } // Ortadaki İzbandut tam arkada ve belirgin şekilde daha yukarıda
                } else if (f === 'up' || f === 'up-right' || f === 'up-left') {
                    // Yukarı bakarken: Oyuncu yukarı doğru öncü yürür, korumalar arkasında (ekranda aşağıda) refakat eder
                    if (slot === 0) { ox = -38; oy = 10; }
                    else if (slot === 1) { ox = 38; oy = 10; }
                    else { ox = 0; oy = 60; } // Ortadaki İzbandut arkasında refakat eder
                } else if (f === 'left') {
                    // Sola bakarken: Oyuncu solda önde, korumalar sağda arkasında
                    if (slot === 0) { ox = 26; oy = -24; }
                    else if (slot === 1) { ox = 26; oy = 24; }
                    else { ox = 52; oy = 0; } // Ortadaki İzbandut arkada
                } else if (f === 'right') {
                    // Sağa bakarken: Oyuncu sağda önde, korumalar solda arkasında
                    if (slot === 0) { ox = -26; oy = -24; }
                    else if (slot === 1) { ox = -26; oy = 24; }
                    else { ox = -52; oy = 0; } // Ortadaki İzbandut arkada
                }

                targetX = owner.x + ox;
                targetY = owner.y + oy;
            } else {
                // Sahibin aktif koruması (İzbandut) var mı kontrol et
                let hasGuards = false;
                if (window.activeCompanionPets) {
                    for (let k in window.activeCompanionPets) {
                        let op = window.activeCompanionPets[k];
                        if (op && op.ownerId === pet.ownerId && op.petType === 'izbandut') {
                            hasGuards = true;
                            break;
                        }
                    }
                }

                let f = owner.facing || 'down';
                if (hasGuards) {
                    // Korumalar varken Doberman veya Pet ön-kanat refakat pozisyonuna geçer
                    // Böylece arkadaki veya kanatlardaki İzbandut korumalarıyla ASLA çakışmaz/üst üste binmez!
                    let ox = 22, oy = 18;
                    if (f === 'down' || f === 'down-right' || f === 'down-left') {
                        ox = 22; oy = 18;
                    } else if (f === 'up' || f === 'up-right' || f === 'up-left') {
                        ox = 22; oy = -18;
                    } else if (f === 'left') {
                        ox = -24; oy = 14;
                    } else if (f === 'right') {
                        ox = 24; oy = 14;
                    }
                    targetX = owner.x + ox;
                    targetY = owner.y + oy;
                } else {
                    let isFacingLeft = (f === 'left' || f === 'up-left' || f === 'down-left');
                    let offsetSide = isFacingLeft ? 32 : -32;
                    let offsetY = 14; // Karakterin ayakkabılarının zemin temas seviyesi
                    targetX = owner.x + offsetSide;
                    targetY = owner.y + offsetY;
                }
            }

            // Karakterin yürüyüş tespiti (hangi yöne yürürse yürüsün)
            if (owner.isMoving || owner.moving || owner.serverMoving) {
                ownerIsMoving = true;
            } else if (pet.ownerId === (typeof myId !== 'undefined' ? myId : null)) {
                if (typeof keys !== 'undefined' && (keys.w || keys.a || keys.s || keys.d || keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight)) {
                    ownerIsMoving = true;
                } else if (Math.abs(owner.vx || 0) > 0.08 || Math.abs(owner.vy || 0) > 0.08) {
                    ownerIsMoving = true;
                }
            }
        }

        let dx = targetX - pet.curX;
        let dy = targetY - pet.curY;
        let dist = Math.hypot(dx, dy);

        // Petin yürüme durumu: Karakter hangi yöne yürürse yürüsün pet hemen yürümeye başlar
        if (dist > 300) {
            // Oda değişimi veya ışınlanma durumunda anında hedefe gel
            pet.curX = targetX;
            pet.curY = targetY;
            pet.isMoving = false;
            pet.animState = PetAnimState.IDLE;
            pet.specialIdleStart = 0;
            pet.idleTimer = 0;
        } else if (ownerIsMoving || dist > 3.0) {
            // Karakter hareket ediyorsa veya pet hedef noktasına doğru yürüyorsa
            pet.isMoving = true;
            pet.animState = PetAnimState.WALK;
            pet.specialIdleStart = 0; // Eğer özel pati animasyonundaysa anında kes
            pet.idleTimer = 0;

            let followSpeed = ownerIsMoving ? Math.min(1, 14 * dt) : Math.min(1, 12 * dt);
            pet.curX += dx * followSpeed;
            pet.curY += dy * followSpeed;
            pet.walkCycle = (pet.walkCycle || 0) + (14 * dt);

            // 8 Yönlü Yön Hesabı
            if (dist > 2.0) {
                let newDir = calculatePet8WayFacing(dx, dy);
                if (newDir) {
                    pet.facing = newDir;
                    pet.direction = newDir;
                }
            } else if (owner && owner.facing) {
                pet.facing = owner.facing;
                pet.direction = owner.facing;
            }
        } else {
            // Karakter ve pet tamamen durdu (sabit duruş)
            pet.curX = targetX;
            pet.curY = targetY;
            pet.isMoving = false;
            pet.walkCycle = 0;

            // Kedi dururken sürekli arkasını dönmesin, yönünü korusun
            if (pet.petType !== 'cat') {
                if (owner && owner.facing) {
                    pet.facing = owner.facing;
                    pet.direction = owner.facing;
                }
            } else {
                // Kedi için: Dururken arkaya dönmesin
                if (owner && owner.facing && owner.facing !== 'up') {
                    pet.facing = owner.facing;
                    pet.direction = owner.facing;
                }
            }

            // Kediye Özel 25 Saniyelik Bekleme (Special Idle) Mantığı
            if (pet.petType === 'cat') {
                if (pet.animState === PetAnimState.SPECIAL_IDLE) {
                    const elapsed = now - (pet.specialIdleStart || now);
                    const duration = pet.specialIdleDuration || 2500;
                    if (elapsed >= duration) {
                        // Pati animasyonu (2.5 sn) tamamlandıktan sonra tekrar sabit durma moduna döner
                        pet.animState = PetAnimState.IDLE;
                        pet.idleTimer = 0;
                        pet.specialIdleStart = 0;
                    }
                } else {
                    pet.animState = PetAnimState.IDLE;
                    pet.idleTimer = (pet.idleTimer || 0) + (dt * 1000);
                    if (pet.idleTimer >= 25000) { // 25 saniye
                        pet.animState = PetAnimState.SPECIAL_IDLE;
                        pet.specialIdleStart = now;
                        pet.specialIdleDuration = 2500;
                        pet.idleTimer = 0;
                    }
                }
            } else {
                pet.animState = PetAnimState.IDLE;
                pet.idleTimer = 0;
            }
        }
    }
}

function updateAndRenderCompanionPets(ctx, dt) {
    updateCompanionPets(dt);
    if (window._companionPetsDrawnInDepthPool) {
        window._companionPetsDrawnInDepthPool = false;
        return;
    }
    if (!window.activeCompanionPets) return;
    const now = Date.now();
    const curR = (typeof currentRoom !== 'undefined') ? currentRoom : window.currentRoom;
    for (const id in window.activeCompanionPets) {
        const pet = window.activeCompanionPets[id];
        if (!pet) continue;
        if (curR && pet.room && pet.room !== curR) continue;
        drawSingleCompanionPet(ctx, pet, pet.curX, pet.curY, now);
    }
}

window.drawSingleCompanionPet = drawSingleCompanionPet;
window.updateCompanionPets = updateCompanionPets;
window.updateAndRenderCompanionPets = updateAndRenderCompanionPets;
