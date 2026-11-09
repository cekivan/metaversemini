/**
 * ============================================================================
 * MINI METAVERSE - VİP CLUB & TEKİNSİZ TEKİN KARABORSA İSTEMCİSİ (CLIENT)
 * ============================================================================
 * Bu dosya VIP Club mekanına giriş, Tekinsiz Tekin karaborsa mağazası arayüzü,
 * seviye kilitleri (Lv 2: VIP Girişi, Lv 3: Jammer & Doberman, Lv 4: Zeus, Lv 5: Gasp & Koruma),
 * elmas para birimi desteği, koruma ve doberman takıp çıkarma (equip/unequip)
 * ve fedai savunma mekanikleri (Gasp Savunması, Jammer Filtresi, Zeus Paratoneri) dinleyicilerini yönetir.
 */

// 1. VIP Club Giriş Modalı
function promptEnterVipClub() {
    // Seviye 2 kontrolü (Giriş için en az Level 2 gerekir)
    const myLvl = (typeof LevelClient !== 'undefined' && LevelClient.currentLevel) || (window.myLevel) || (window.myPlayerLevel) || 1;
    if (myLvl < 2) {
        if (typeof window.showGameError === 'function') {
            window.showGameError(`🚪 VİP Club'a giriş yapabilmek için en az Seviye 2 olmalısınız! (Mevcut Seviyeniz: ${myLvl})`);
        } else if (typeof window.addChatMessage === 'function') {
            window.addChatMessage({ text: `🚪 VİP Club'a giriş için en az Seviye 2 olmalısınız! (Mevcut Seviyen: ${myLvl})`, type: 'system' });
        } else {
            alert(`🚪 VİP Club'a giriş yapabilmek için en az Seviye 2 olmalısınız! (Mevcut Seviyeniz: ${myLvl})`);
        }
        return;
    }

    const modal = document.getElementById('vipClubEntryModal');
    if (!modal) return;
    
    if (modal.style.display === 'flex') return;
    if (window._lastVipPromptTime && Date.now() - window._lastVipPromptTime < 1000) return;
    window._lastVipPromptTime = Date.now();

    if (typeof roomTransitionCooldownUntil !== 'undefined') {
        roomTransitionCooldownUntil = Date.now() + 1500;
    }
    if (typeof targetWalkPos !== 'undefined') targetWalkPos = null;

    const myP = (typeof players !== 'undefined' && typeof myId !== 'undefined' && players[myId]) ? players[myId] : (typeof myAvatar !== 'undefined' ? myAvatar : null);
    if (myP) {
        myP.vx = 0;
        myP.vy = 0;
        myP.isMoving = false;
        myP.targetX = myP.x;
        myP.targetY = myP.y;
        if (typeof currentRoom !== 'undefined' && currentRoom === 'cadde2' && myP.y <= 128) {
            myP.y = 136;
        }
    }

    modal.style.display = 'flex';
}
window.promptEnterVipClub = promptEnterVipClub;

function closeVipClubEntryModal() {
    const modal = document.getElementById('vipClubEntryModal');
    if (modal) modal.style.display = 'none';
    if (typeof roomTransitionCooldownUntil !== 'undefined') {
        roomTransitionCooldownUntil = Date.now() + 1200;
    }
}
window.closeVipClubEntryModal = closeVipClubEntryModal;

function confirmEnterVipClub() {
    closeVipClubEntryModal();
    if (typeof playSound === 'function') {
        playSound('vip_entry');
    }
    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
    if (s && s.connected) {
        s.emit('enterVipClub');
    }
}
window.confirmEnterVipClub = confirmEnterVipClub;

// 2. Tekinsiz Tekin Karaborsa Modalı
function openTekinsizTekinModal() {
    const modal = document.getElementById('tekinsizTekinModal');
    if (!modal) return;
    if (typeof playSound === 'function') playSound('uiClick');
    
    if (typeof initVipClubClientSockets === 'function') initVipClubClientSockets();
    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
    if (s && s.connected) {
        s.emit('getShadyShopState');
    }
    modal.style.display = 'flex';
}
window.openTekinsizTekinModal = openTekinsizTekinModal;

function closeTekinsizTekinModal() {
    const modal = document.getElementById('tekinsizTekinModal');
    if (modal) modal.style.display = 'none';
}
window.closeTekinsizTekinModal = closeTekinsizTekinModal;

function buyShadyItem(itemId) {
    if (typeof playSound === 'function') playSound('uiClick');
    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
    if (s && s.connected) {
        s.emit('buyShadyItem', { itemId });
    }
}
window.buyShadyItem = buyShadyItem;

function toggleEquipBodyguard() {
    if (typeof playSound === 'function') playSound('uiClick');
    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
    if (s && s.connected) {
        s.emit('toggleEquipBodyguard');
    }
}
window.toggleEquipBodyguard = toggleEquipBodyguard;

function toggleEquipDoberman() {
    if (typeof playSound === 'function') playSound('uiClick');
    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
    if (s && s.connected) {
        s.emit('toggleEquipDoberman');
    }
}
window.toggleEquipDoberman = toggleEquipDoberman;

// 3. Karaborsa Ürünlerini Listeleme ve UI Güncelleme
function renderShadyShopUI(state) {
    if (!state) return;
    const userLevel = Number(state.level) || 1;
    if (state.jammerCount !== undefined) window.myJammerCount = state.jammerCount;
    if (state.hasMugKnife !== undefined) window.myHasMugKnife = state.hasMugKnife;
    if (state.mugKnifeCount !== undefined) window.myMugKnifeCount = state.mugKnifeCount;
    if (state.zeusCount !== undefined) window.myZeusCount = state.zeusCount;
    if (state.bodyguardCount !== undefined) window.myBodyguardCount = state.bodyguardCount;
    if (state.bodyguardsEquipped !== undefined) window.myBodyguardsEquipped = state.bodyguardsEquipped;
    if (state.maxBodyguards !== undefined) window.myMaxBodyguards = state.maxBodyguards;
    if (state.hasDoberman !== undefined) window.myHasDoberman = state.hasDoberman;
    if (state.dobermanEquipped !== undefined) window.myDobermanEquipped = state.dobermanEquipped;
    if (state.level !== undefined) window.myPlayerLevel = state.level;

    const moneyEl = document.getElementById('tekinShopUserMoney');
    if (moneyEl && state.money !== undefined) {
        moneyEl.innerText = `${state.money.toLocaleString('tr-TR')} TL`;
    }
    const diamondEl = document.getElementById('tekinShopUserDiamonds');
    if (diamondEl && state.diamonds !== undefined) {
        diamondEl.innerText = `${state.diamonds.toLocaleString('tr-TR')} 💎`;
    }
    const levelEl = document.getElementById('tekinShopUserLevel');
    if (levelEl && state.level !== undefined) {
        levelEl.innerText = `Lv ${state.level}`;
    }

    const grid = document.getElementById('shadyItemsGrid');
    if (!grid || !state.items) return;

    const now = Date.now();
    grid.innerHTML = '';

    for (let key in state.items) {
        let it = state.items[key];
        const isLevelLocked = (state.level < (it.minLevel || 1));

        let card = document.createElement('div');
        card.style.cssText = 'background: rgba(24, 24, 27, 0.95); border: 1.5px solid #3f3f46; border-radius: 16px; padding: 14px 16px; display: flex; gap: 14px; align-items: center; transition: all 0.2s; position: relative; overflow: hidden;';
        if (isLevelLocked) {
            card.style.opacity = '0.78';
            card.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        } else {
            card.onmouseover = () => { card.style.borderColor = '#eab308'; card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 6px 20px rgba(234, 179, 8, 0.15)'; };
            card.onmouseout = () => { card.style.borderColor = '#3f3f46'; card.style.transform = 'translateY(0)'; card.style.boxShadow = 'none'; };
        }

        let iconBox = document.createElement('div');
        iconBox.style.cssText = 'width: 50px; height: 50px; border-radius: 14px; background: rgba(39, 39, 42, 0.9); border: 1px solid rgba(234, 179, 8, 0.3); display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0;';
        iconBox.innerText = it.icon || '📦';

        let infoBox = document.createElement('div');
        infoBox.style.cssText = 'flex: 1; min-width: 0;';

        let titleRow = document.createElement('div');
        titleRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px; gap: 6px;';

        let titleLeft = document.createElement('div');
        titleLeft.style.cssText = 'display: flex; align-items: center; gap: 6px; min-width: 0;';

        let titleEl = document.createElement('div');
        titleEl.style.cssText = 'font-size: 13.5px; font-weight: 800; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;';
        titleEl.innerText = it.name;
        titleLeft.appendChild(titleEl);

        if (it.minLevel && it.minLevel > 1) {
            let lvlBadge = document.createElement('span');
            lvlBadge.style.cssText = `font-size: 10px; font-weight: 800; color: ${isLevelLocked ? '#f87171' : '#4ade80'}; background: rgba(0,0,0,0.5); padding: 2px 6px; border-radius: 6px; border: 1px solid ${isLevelLocked ? 'rgba(239,68,68,0.4)' : 'rgba(34,197,94,0.4)'}; flex-shrink: 0;`;
            lvlBadge.innerText = `Lv ${it.minLevel}+`;
            titleLeft.appendChild(lvlBadge);
        }

        let priceEl = document.createElement('div');
        if (it.currency === 'diamond') {
            priceEl.style.cssText = 'font-size: 12.5px; font-weight: 900; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(56, 189, 248, 0.35); flex-shrink: 0;';
            priceEl.innerText = `${it.price} 💎`;
        } else {
            priceEl.style.cssText = 'font-size: 12.5px; font-weight: 900; color: #facc15; background: rgba(234, 179, 8, 0.15); padding: 2px 7px; border-radius: 6px; border: 1px solid rgba(234, 179, 8, 0.3); flex-shrink: 0;';
            priceEl.innerText = `${it.price.toLocaleString('tr-TR')} TL`;
        }

        titleRow.appendChild(titleLeft);
        titleRow.appendChild(priceEl);

        let descEl = document.createElement('div');
        descEl.style.cssText = 'font-size: 11px; color: #a1a1aa; line-height: 1.4; margin-bottom: 8px;';
        descEl.innerText = it.desc;

        let actionArea = document.createElement('div');
        actionArea.style.cssText = 'display: flex; flex-direction: column; gap: 6px; width: 100%;';

        // 🔒 Seviyesi Yetmeyen Eşyalara Şık Yarı Saydam Siyah Katman ve Rozet (Madde 4)
        if (isLevelLocked) {
            let lockOverlay = document.createElement('div');
            lockOverlay.style.cssText = 'position: absolute; inset: 0; background: rgba(10, 10, 15, 0.85); backdrop-filter: blur(2.5px); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; gap: 6px; border-radius: 16px; cursor: not-allowed;';
            lockOverlay.innerHTML = `
                <div style="font-size: 26px; filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8));">🔒</div>
                <div style="font-size: 12.5px; font-weight: 900; color: #facc15; background: rgba(0,0,0,0.72); padding: 5px 16px; border-radius: 999px; border: 1.5px solid rgba(234, 179, 8, 0.55); letter-spacing: 0.5px; box-shadow: 0 4px 14px rgba(0,0,0,0.6);">
                    🔒 SEVİYE ${it.minLevel} GEREKLİ
                </div>
                <div style="font-size: 10.5px; color: #94a3b8; font-weight: 600;">Mevcut Seviyeniz: ${userLevel}</div>
            `;
            lockOverlay.onclick = (e) => {
                e.stopPropagation();
                if (typeof window.showGameError === 'function') {
                    window.showGameError(`🔒 Bu eşyayı satın alabilmek için en az Seviye ${it.minLevel} olmalısınız! (Mevcut Seviyeniz: ${userLevel})`);
                }
            };
            card.appendChild(lockOverlay);

            let lockBtn = document.createElement('button');
            lockBtn.type = 'button';
            lockBtn.style.cssText = 'padding: 7px 14px; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 11.5px; font-weight: 800; cursor: not-allowed; width: 100%; background: #27272a; color: #f87171;';
            lockBtn.innerText = `🔒 Kilitli (Seviye ${it.minLevel} Gerekir)`;
            actionArea.appendChild(lockBtn);
        } else if (it.id === 'jammer') {
            let cnt = state.jammerCount || 0;
            let actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%; background: linear-gradient(135deg, #ef4444, #b91c1c); color: #ffffff;';
            actionBtn.innerText = `Satın Al (Sahip: ${cnt} Adet - 1 Kullanımlık)`;
            actionBtn.onclick = () => buyShadyItem('jammer');
            actionArea.appendChild(actionBtn);
        } else if (it.id === 'zeus_yildirimi') {
            let cnt = state.zeusCount || 0;
            let actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%; background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff;';
            actionBtn.innerText = `Satın Al (Sahip: ${cnt} Adet - 2 💎 / 1 Kullanımlık)`;
            actionBtn.onclick = () => buyShadyItem('zeus_yildirimi');
            actionArea.appendChild(actionBtn);
        } else if (it.id === 'mug_knife') {
            let cnt = state.mugKnifeCount || (state.hasMugKnife ? 1 : 0);
            let actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%; background: linear-gradient(135deg, #d97706, #b45309); color: #ffffff;';
            actionBtn.innerText = `Satın Al (Sahip: ${cnt} Adet - 2 💎 / 2.000 TL Gasp)`;
            actionBtn.onclick = () => buyShadyItem('mug_knife');
            actionArea.appendChild(actionBtn);
        } else if (it.id === 'izbandut') {
            const maxGuards = state.maxBodyguards || 0;
            const ownedGuards = state.bodyguardCount || 0;
            const equippedGuards = state.bodyguardsEquipped || 0;

            if (ownedGuards > 0) {
                // Kuşan / Çıkar Butonu
                let equipBtn = document.createElement('button');
                equipBtn.type = 'button';
                equipBtn.style.cssText = 'padding: 6px 12px; border-radius: 8px; border: none; font-size: 11px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%;';
                if (equippedGuards > 0) {
                    equipBtn.innerText = `🕶️ Korumaları Dinlenmeye Çek (${equippedGuards}/${ownedGuards} Yanında)`;
                    equipBtn.style.background = '#3f3f46';
                    equipBtn.style.color = '#f87171';
                } else {
                    equipBtn.innerText = `🕶️ Korumaları Yanına Çağır (${ownedGuards} Çantada Hazır)`;
                    equipBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    equipBtn.style.color = '#ffffff';
                }
                equipBtn.onclick = () => toggleEquipBodyguard();
                actionArea.appendChild(equipBtn);

                // Yeni koruma satın alma butonu (Slot sınırı aşılmadıysa)
                if (ownedGuards < maxGuards) {
                    let buyBtn = document.createElement('button');
                    buyBtn.type = 'button';
                    buyBtn.style.cssText = 'padding: 5px 12px; border-radius: 8px; border: 1px solid #eab308; font-size: 11px; font-weight: 800; cursor: pointer; width: 100%; background: rgba(234,179,8,0.15); color: #facc15;';
                    buyBtn.innerText = `+ Yeni Koruma Satın Al (${ownedGuards}/${maxGuards} Hak)`;
                    buyBtn.onclick = () => buyShadyItem('izbandut');
                    actionArea.appendChild(buyBtn);
                } else {
                    let maxTag = document.createElement('div');
                    maxTag.style.cssText = 'font-size: 10px; color: #94a3b8; text-align: center; font-style: italic;';
                    maxTag.innerText = `Maksimum koruma sınırına ulaşıldı (${ownedGuards}/${maxGuards})`;
                    actionArea.appendChild(maxTag);
                }
            } else {
                let buyBtn = document.createElement('button');
                buyBtn.type = 'button';
                buyBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%; background: linear-gradient(135deg, #eab308, #ca8a04); color: #000000;';
                buyBtn.innerText = `Koruma Kirala (Maks: ${maxGuards} Hak)`;
                buyBtn.onclick = () => buyShadyItem('izbandut');
                actionArea.appendChild(buyBtn);
            }
        } else if (it.id === 'doberman') {
            if (state.hasDoberman) {
                let equipBtn = document.createElement('button');
                equipBtn.type = 'button';
                equipBtn.style.cssText = 'padding: 6px 12px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%;';
                if (state.dobermanEquipped) {
                    equipBtn.innerText = "🐕‍🦺 Dobermanı Dinlenmeye Çek (Yanında)";
                    equipBtn.style.background = '#3f3f46';
                    equipBtn.style.color = '#f87171';
                } else {
                    equipBtn.innerText = "🐕‍🦺 Dobermanı Yanına Çağır (Kuşan)";
                    equipBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    equipBtn.style.color = '#ffffff';
                }
                equipBtn.onclick = () => toggleEquipDoberman();
                actionArea.appendChild(equipBtn);
            } else {
                let buyBtn = document.createElement('button');
                buyBtn.type = 'button';
                buyBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%; background: linear-gradient(135deg, #eab308, #ca8a04); color: #000000;';
                buyBtn.innerText = 'Doberman Kirala & Çağır (15.000 TL)';
                buyBtn.onclick = () => buyShadyItem('doberman');
                actionArea.appendChild(buyBtn);
            }
        } else if (it.id === 'anon_mask') {
            let exp = state.anonMaskExpiresAt || 0;
            let count = state.anonMaskCount || 0;
            let isActive = exp > now;

            // Çanta ve Durum Göstergesi
            let infoDiv = document.createElement('div');
            infoDiv.style.cssText = 'display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; font-size:11px; font-weight:700; color:#cbd5e1;';
            infoDiv.innerHTML = `
                <span>🎒 Çantada: <b style="color:#fde047;">${count} Adet</b></span>
                <span>${isActive ? `<span style="color:#34d399; font-weight:800; display:inline-flex; align-items:center; gap:3px;">● Aktif (${Math.ceil((exp - now)/60000)} dk)</span>` : '<span style="color:#94a3b8;">○ Takılı Değil</span>'}</span>
            `;
            actionArea.appendChild(infoDiv);

            let btnRow = document.createElement('div');
            btnRow.style.cssText = 'display:flex; gap:6px; width:100%;';

            // Aktifse Maskeyi Çıkar
            if (isActive) {
                let removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.style.cssText = 'flex:1; padding:6px 10px; border-radius:8px; border:1px solid #ef4444; font-size:11px; font-weight:800; cursor:pointer; background:rgba(239, 68, 68, 0.2); color:#fca5a5; transition:all 0.15s;';
                removeBtn.innerText = '🎭 Maskeyi Çıkar';
                removeBtn.onclick = () => {
                    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
                    if (s) s.emit('removeAnonMask');
                };
                btnRow.appendChild(removeBtn);
            } else if (count > 0) {
                // Çantada varsa Maskeyi Tak
                let useBtn = document.createElement('button');
                useBtn.type = 'button';
                useBtn.style.cssText = 'flex:1; padding:6px 10px; border-radius:8px; border:none; font-size:11px; font-weight:800; cursor:pointer; background:linear-gradient(135deg, #10b981, #059669); color:#ffffff; transition:all 0.15s;';
                useBtn.innerText = '🎭 Maskeyi Tak (30 Dk)';
                useBtn.onclick = () => {
                    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
                    if (s) s.emit('useAnonMask');
                };
                btnRow.appendChild(useBtn);
            }

            // Satın Alma Butonu (Her zaman veya ek stok için)
            let buyBtn = document.createElement('button');
            buyBtn.type = 'button';
            buyBtn.style.cssText = 'flex:1; padding:6px 10px; border-radius:8px; border:none; font-size:11px; font-weight:800; cursor:pointer; background:linear-gradient(135deg, #6366f1, #4f46e5); color:#ffffff; transition:all 0.15s;';
            buyBtn.innerText = count > 0 ? '+1 Satın Al (3.000 TL)' : 'Satın Al (3.000 TL)';
            buyBtn.onclick = () => buyShadyItem('anon_mask');
            btnRow.appendChild(buyBtn);

            actionArea.appendChild(btnRow);
        } else if (it.id === 'neon_red_nick') {
            let exp = state.neonRedNickExpiresAt || 0;
            let actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%;';
            if (exp > now) {
                let remHours = Math.ceil((exp - now) / 3600000);
                actionBtn.innerText = `Aktif (${remHours} saat kaldı)`;
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#a1a1aa';
            } else {
                actionBtn.innerText = '24 Saatliğine Boya';
                actionBtn.style.background = 'linear-gradient(135deg, #ff1744, #d50000)';
                actionBtn.style.color = '#ffffff';
                actionBtn.onclick = () => buyShadyItem('neon_red_nick');
            }
            actionArea.appendChild(actionBtn);
        } else if (it.id === 'invisibility') {
            let exp = state.invisibilityExpiresAt || 0;
            let actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%;';
            if (exp > now) {
                let remHours = Math.ceil((exp - now) / 3600000);
                actionBtn.innerText = `Aktif (${remHours} saat kaldı)`;
                actionBtn.style.background = '#27272a';
                actionBtn.style.color = '#a1a1aa';
            } else {
                actionBtn.innerText = '5 Saatliğine Giy';
                actionBtn.style.background = 'linear-gradient(135deg, #a855f7, #7e22ce)';
                actionBtn.style.color = '#ffffff';
                actionBtn.onclick = () => buyShadyItem('invisibility');
            }
            actionArea.appendChild(actionBtn);
        } else {
            let actionBtn = document.createElement('button');
            actionBtn.type = 'button';
            actionBtn.style.cssText = 'padding: 6px 14px; border-radius: 8px; border: none; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; width: 100%; background: linear-gradient(135deg, #eab308, #ca8a04); color: #000000;';
            actionBtn.innerText = 'Satın Al';
            actionBtn.onclick = () => buyShadyItem(it.id);
            actionArea.appendChild(actionBtn);
        }

        infoBox.appendChild(titleRow);
        infoBox.appendChild(descEl);
        infoBox.appendChild(actionArea);

        card.appendChild(iconBox);
        card.appendChild(infoBox);

        grid.appendChild(card);
    }
}
window.renderShadyShopUI = renderShadyShopUI;

// 4. Soket Dinleyicilerini Başlatma
function initVipClubClientSockets() {
    const s = window.socket || (typeof socket !== 'undefined' ? socket : null);
    if (!s || s._vipClubSocketsInitialized) return;
    s._vipClubSocketsInitialized = true;

    s.on('shadyShopState', (state) => {
        renderShadyShopUI(state);
        if (state.bodyguardsEquipped !== undefined) window.myBodyguardsEquipped = state.bodyguardsEquipped;
        if (state.dobermanEquipped !== undefined) window.myDobermanEquipped = state.dobermanEquipped;
        if (state.hasDoberman !== undefined) window.myHasDoberman = state.hasDoberman;
        if (state.anonMaskExpiresAt !== undefined) window.myAnonMaskExpiresAt = state.anonMaskExpiresAt;
        if (typeof renderItemInventoryUI === 'function') renderItemInventoryUI();
    });

    s.on('bodyguardEquipStatus', (data) => {
        if (!data) return;
        window.myBodyguardsEquipped = data.equippedCount || 0;
        if (typeof renderItemInventoryUI === 'function') renderItemInventoryUI();
    });

    s.on('dobermanEquipStatus', (data) => {
        if (!data) return;
        window.myDobermanEquipped = !!data.equipped;
        if (typeof renderItemInventoryUI === 'function') renderItemInventoryUI();
    });

    s.on('playerShadyUpdate', (data) => {
        if (!data || !data.id || typeof players === 'undefined') return;
        if (players[data.id]) {
            if (data.anonMaskExpiresAt !== undefined) players[data.id].anonMaskExpiresAt = data.anonMaskExpiresAt;
            if (data.neonRedNickExpiresAt !== undefined) players[data.id].neonRedNickExpiresAt = data.neonRedNickExpiresAt;
            if (data.invisibilityExpiresAt !== undefined) players[data.id].invisibilityExpiresAt = data.invisibilityExpiresAt;
        }
        let myPlayerId = (typeof myId !== 'undefined') ? myId : (window.myId || null);
        if (myPlayerId && data.id === myPlayerId) {
            if (data.anonMaskExpiresAt !== undefined) {
                window.myAnonMaskExpiresAt = data.anonMaskExpiresAt;
                if (typeof myAvatar !== 'undefined' && myAvatar) {
                    myAvatar.anonMaskExpiresAt = data.anonMaskExpiresAt;
                }
            }
        }
    });

    s.on('playerJammedState', (data) => {
        if (!data || !data.id || typeof players === 'undefined') return;
        if (players[data.id]) {
            players[data.id].jammerExpiresAt = data.jammerExpiresAt;
        }
        let myPlayerId = (typeof myId !== 'undefined') ? myId : (window.myId || null);
        let isSelf = (myPlayerId && data.id === myPlayerId) || (myPlayerId && players[myPlayerId] && data.name && data.name.toLowerCase() === players[myPlayerId].name.toLowerCase());
        if (isSelf) {
            window.myJammerExpiresAt = data.jammerExpiresAt;
            if (data.jammerExpiresAt > 0) {
                if (typeof openJammerBlockedModal === 'function') openJammerBlockedModal(data.jammerExpiresAt);
            } else {
                window.myJammerExpiresAt = 0;
                if (typeof closeJammerBlockedModal === 'function') {
                    closeJammerBlockedModal();
                } else {
                    let jm = document.getElementById('jammerBlockedModal');
                    if (jm) jm.style.display = 'none';
                }
            }
        }
    });

    s.on('youWereJammed', (data) => {
        if (!data || !data.expiresAt) return;
        window.myJammerExpiresAt = data.expiresAt;
        if (typeof openJammerBlockedModal === 'function') openJammerBlockedModal(data.expiresAt);
    });

    s.on('playerJammedNotification', (data) => {
        if (!data) return;
        let notifText = data.text || `${data.callerName}, ${data.targetName}'nin jammerla sinyalini kesti.`;
        if (typeof showGameNotificationText === 'function') {
            showGameNotificationText(`📡 ${notifText}`);
        }

        if (typeof appendChatMessageToHistory === 'function') {
            appendChatMessageToHistory({
                name: '📡 BİLDİRİM',
                msg: notifText,
                channel: 'room',
                isSystem: true
            });
        }
    });

    // --- CAN SİPERİ SAVUNMA GÖRSEL EFEKTLERİ & PARTİKÜL MOTORU (Madde 2) ---
    window.vipDefenseFx = {
        smokeParticles: [],
        shieldSparks: [],
        shieldRings: [],

        spawnBurnoutSmokePuff(x, y) {
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 8 + Math.random() * 24;
                this.smokeParticles.push({
                    x: x + (Math.random() - 0.5) * 12,
                    y: y - 22 + (Math.random() - 0.5) * 8,
                    vx: Math.cos(angle) * speed * 0.5,
                    vy: -18 - Math.random() * 32,
                    radius: 6 + Math.random() * 8,
                    maxRadius: 24 + Math.random() * 12,
                    alpha: 0.8 + Math.random() * 0.18,
                    life: 0,
                    maxLife: 1300 + Math.random() * 500,
                    color: Math.random() > 0.4 ? 'rgba(165, 165, 175,' : 'rgba(125, 125, 135,'
                });
            }
        },

        spawnShieldDeflectSparks(x, y) {
            this.shieldRings.push({
                x: x,
                y: y - 28,
                radius: 8,
                maxRadius: 65,
                alpha: 1.0,
                life: 0,
                maxLife: 420
            });

            for (let i = 0; i < 24; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 35 + Math.random() * 85;
                this.shieldSparks.push({
                    x: x,
                    y: y - 28,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    radius: 2 + Math.random() * 2.5,
                    alpha: 1.0,
                    life: 0,
                    maxLife: 400 + Math.random() * 300,
                    color: Math.random() > 0.3 ? '#facc15' : '#38bdf8'
                });
            }
        },

        draw(ctx, dt) {
            dt = dt || 0.016;

            // 1. Kalkan Şok Dalgaları
            for (let i = this.shieldRings.length - 1; i >= 0; i--) {
                const r = this.shieldRings[i];
                r.life += dt * 1000;
                const progress = r.life / r.maxLife;
                if (progress >= 1) {
                    this.shieldRings.splice(i, 1);
                    continue;
                }
                const curRadius = r.radius + (r.maxRadius - r.radius) * Math.sin(progress * Math.PI / 2);
                const curAlpha = 1 - progress;

                ctx.save();
                ctx.beginPath();
                ctx.arc(r.x, r.y, curRadius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(250, 204, 21, ${curAlpha * 0.9})`;
                ctx.lineWidth = 3.5 * (1 - progress);
                ctx.shadowColor = '#facc15';
                ctx.shadowBlur = 14;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(r.x, r.y, curRadius * 0.7, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(56, 189, 248, ${curAlpha * 0.7})`;
                ctx.lineWidth = 2 * (1 - progress);
                ctx.stroke();
                ctx.restore();
            }

            // 2. Kalkan Kıvılcımları
            for (let i = this.shieldSparks.length - 1; i >= 0; i--) {
                const p = this.shieldSparks[i];
                p.life += dt * 1000;
                const progress = p.life / p.maxLife;
                if (progress >= 1) {
                    this.shieldSparks.splice(i, 1);
                    continue;
                }
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy += 65 * dt;
                const curAlpha = 1 - progress;

                ctx.save();
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius * (1 - progress * 0.5), 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = curAlpha;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.fill();
                ctx.restore();
            }

            // 3. Telsiz Yanma Duman Bulutları
            for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
                const sp = this.smokeParticles[i];
                sp.life += dt * 1000;
                const progress = sp.life / sp.maxLife;
                if (progress >= 1) {
                    this.smokeParticles.splice(i, 1);
                    continue;
                }
                sp.x += sp.vx * dt;
                sp.y += sp.vy * dt;
                const curR = sp.radius + (sp.maxRadius - sp.radius) * progress;
                const curAlpha = sp.alpha * (1 - progress);

                ctx.save();
                ctx.beginPath();
                ctx.arc(sp.x, sp.y, curR, 0, Math.PI * 2);
                ctx.fillStyle = `${sp.color} ${curAlpha})`;
                ctx.fill();
                ctx.restore();
            }
        }
    };

    // --- FEDAİ SAVUNMASI SOKETLERİ (GASP BLOKLAMA, JAMMER FİLTRESİ, PARATONER) ---
    s.on('protectorSacrificeMugDefend', (data) => {
        if (!data) return;

        let pet = (window.activeCompanionPets && data.protectorId) ? window.activeCompanionPets[data.protectorId] : null;
        let petType = (pet && pet.petType) || data.protectorType || 'izbandut';

        // Ses ve Görsel Efektler (Madde 2 & Madde 7)
        if (petType === 'doberman') {
            if (window.playSound) {
                window.playSound('doberman_growl');
                setTimeout(() => { if (window.playSound) window.playSound('doberman_bark'); }, 170);
            }
            // Doberman saldırgana doğru atılma (lunge) hamlesi yapar
            if (pet && typeof players !== 'undefined') {
                let callerP = Object.values(players).find(p => p && p.name && p.name.toLowerCase() === (data.callerName || '').toLowerCase());
                if (callerP) {
                    let dx = callerP.x - pet.x;
                    let dy = callerP.y - pet.y;
                    let dist = Math.hypot(dx, dy) || 1;
                    pet.lungeOffsetX = (dx / dist) * 36;
                    pet.lungeOffsetY = (dy / dist) * 36;
                    pet.lungeUntil = Date.now() + 650;
                }
            }
        } else {
            if (window.playSound) window.playSound('shield_clang');
            if (pet && window.vipDefenseFx) {
                window.vipDefenseFx.spawnShieldDeflectSparks(pet.curX || pet.x, pet.curY || pet.y);
            }
        }

        // Saldırganın darbe geri tepmesi (stagger / knockback)
        if (typeof players !== 'undefined') {
            let callerP = Object.values(players).find(p => p && p.name && p.name.toLowerCase() === (data.callerName || '').toLowerCase());
            if (callerP) {
                let px = pet ? pet.x : callerP.x;
                let py = pet ? pet.y : callerP.y;
                let kdx = callerP.x - px;
                let kdy = callerP.y - py;
                let dist = Math.hypot(kdx, kdy) || 1;
                callerP.recoilX = (kdx / dist) * 26;
                callerP.recoilY = (kdy / dist) * 26;
                callerP.recoilUntil = Date.now() + 500;
            }
        }

        // Hedef petin kafasında fedai konuşma balonu çıkar
        if (pet) {
            let quote = (pet.petType === 'doberman') ? "HAV! GRRR! 🐾 Saldırganı kovaladım!" : "Patronu rahat bırak ufaklık! ...Patron, yara aldım revire çekiliyorum.";
            pet.speech = quote;
            pet.speechUntil = Date.now() + 3500;
        }

        if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast('🛡️', 'Fedai Can Siperi!', `${data.protectorName || 'Fedai'}, ${data.callerName}'in gasp saldırısını önledi!`);
        }
    });

    s.on('protectorJammerFilterStarted', (data) => {
        if (!data) return;
        if (window.playSound) window.playSound('radio_static');

        if (window.activeCompanionPets && data.protectorId && window.activeCompanionPets[data.protectorId]) {
            let pet = window.activeCompanionPets[data.protectorId];
            pet.isFilteringJammer = true;
            pet.filterJammerUntil = Date.now() + (data.durationMs || 15000);
            pet.speech = "📡 Frekansı yakaladım patron, telsizle çözüyorum... [15 sn]";
            pet.speechUntil = Date.now() + 4000;
        }

        if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast('📡', 'Frekans Filtresi!', `${data.protectorName || 'Fedai'} jammer sinyalini çözmeye başladı! [15 sn]`);
        }
    });

    s.on('protectorJammerBurnout', (data) => {
        if (!data) return;
        if (window.playSound) window.playSound('radio_burnout');

        if (window.activeCompanionPets && data.protectorId && window.activeCompanionPets[data.protectorId]) {
            let pet = window.activeCompanionPets[data.protectorId];
            pet.speech = "Frekansı çözdüm patron, telsiz yandı!";
            pet.speechUntil = Date.now() + 3000;
            if (window.vipDefenseFx) {
                window.vipDefenseFx.spawnBurnoutSmokePuff(pet.curX || pet.x, pet.curY || pet.y);
            }
        }

        window.myJammerExpiresAt = 0;
        if (typeof closeJammerBlockedModal === 'function') {
            closeJammerBlockedModal();
        } else {
            let jm = document.getElementById('jammerBlockedModal');
            if (jm) jm.style.display = 'none';
        }

        if (typeof showSocialNotificationToast === 'function') {
            showSocialNotificationToast('📡✅', 'Sinyal Açıldı!', 'Fedaimiz telsiziyle jammer frekansını deşifre etti ve seni kurtardı!');
        }
    });

    s.on('playerHeldItemUpdate', (data) => {
        if (!data || !data.id || typeof players === 'undefined' || !players[data.id]) return;
        if (!players[data.id].avatar) players[data.id].avatar = {};
        players[data.id].avatar.heldItem = data.heldItem;
        players[data.id].heldItem = data.heldItem;
    });
}
window.initVipClubClientSockets = initVipClubClientSockets;

if (typeof socket !== 'undefined' && socket) {
    initVipClubClientSockets();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initVipClubClientSockets, 500);
    });
}
