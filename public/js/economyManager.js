/**
 * ============================================================================
 * MINI METAVERSE - MERKEZİ BAKİYE & EKONOMİ YÖNETİCİSİ (ECONOMY MANAGER)
 * ============================================================================
 * Tüm TL ve Elmas güncellemelerini, DOM göstergelerini ve açık dükkan arayüzlerini
 * tek bir güvenli noktadan senkronize eder. Desenkronizasyonu (desync) sıfırlar.
 */

(function(root) {
    const EconomyManager = {
        getMoney() {
            return (typeof window !== 'undefined' && typeof window.myMoney === 'number') ? window.myMoney : 0;
        },

        getDiamonds() {
            return (typeof window !== 'undefined' && typeof window.myDiamonds === 'number') ? window.myDiamonds : 0;
        },

        setMoney(amount) {
            const amt = (typeof amount === 'object' && amount !== null && amount.money !== undefined) ? amount.money : amount;
            const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);

            if (typeof window !== 'undefined') {
                window.myMoney = num;
                window.userMoney = num;
            }

            if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players && players[myId]) {
                players[myId].money = num;
            }

            this.updateMoneyDOM(num);
            return num;
        },

        setDiamonds(amount) {
            const amt = (typeof amount === 'object' && amount !== null && amount.diamonds !== undefined) ? amount.diamonds : amount;
            const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);

            if (typeof window !== 'undefined') {
                window.myDiamonds = num;
            }

            if (typeof players !== 'undefined' && typeof myId !== 'undefined' && players && players[myId]) {
                players[myId].diamonds = num;
            }

            this.updateDiamondsDOM(num);
            return num;
        },

        updateMoneyDOM(num) {
            const fmtTL = `${num.toLocaleString('tr-TR')} TL`;
            const fmtNum = num.toLocaleString('tr-TR');

            // 1. Ana HUD & Menü Rozetleri
            const uBadge = document.getElementById('userMoneyDisplay');
            if (uBadge) uBadge.innerText = fmtNum;
            const badge = document.getElementById('moneyDisplay');
            if (badge) badge.innerText = fmtNum;
            const wBadge = document.getElementById('wardrobeMoneyDisplay');
            if (wBadge) wBadge.innerText = fmtNum;
            const mBadge = document.getElementById('marketMoneyDisplay');
            if (mBadge) mBadge.innerText = fmtNum;

            // 2. Dükkan & Mağaza Modalları
            const pBadge = document.getElementById('petShopUserMoney');
            if (pBadge) pBadge.innerText = fmtTL;
            const aBadge = document.getElementById('animalBoutiqueUserMoney');
            if (aBadge) aBadge.innerText = fmtTL;
            const bSupBadge = document.getElementById('botanicSupplierBalance');
            if (bSupBadge) bSupBadge.innerText = fmtTL;
            const bMktBadge = document.getElementById('botanicMarketBalance');
            if (bMktBadge) bMktBadge.innerText = fmtTL;
            const isgBadge = document.getElementById('isgShopBalance');
            if (isgBadge) isgBadge.innerText = fmtTL;
            const tekinBadge = document.getElementById('tekinShopUserMoney');
            if (tekinBadge) tekinBadge.innerText = fmtTL;
            const optikBadge = document.getElementById('optika-user-balance');
            if (optikBadge) optikBadge.innerText = fmtTL;
            const adBadge = document.getElementById('adModalUserMoney');
            if (adBadge) adBadge.innerText = fmtNum;
            const barberBadge = document.getElementById('barberShopBalance');
            if (barberBadge) barberBadge.innerText = fmtTL;

            // 3. Kumarhane & Masa Oyunları
            const bjBadge = document.getElementById('bjUserMoney');
            if (bjBadge) bjBadge.innerText = fmtNum;
            const roBadge = document.getElementById('rouletteUserBalance');
            if (roBadge) roBadge.innerText = fmtNum;
            const slotBadge = document.getElementById('slotUserBalance');
            if (slotBadge) slotBadge.innerText = fmtNum;

            // 4. Emlak & Konut
            const hcBadge = document.getElementById('houseConfirmBalance');
            if (hcBadge) hcBadge.innerHTML = `Mevcut Bakiyeniz: <b>${fmtTL}</b>`;
            const lmBadge = document.getElementById('lemonadePlayerBalance');
            if (lmBadge) lmBadge.innerHTML = `Mevcut Bakiyeniz: <b>${fmtTL}</b>`;

            // 5. Açık olan dükkan arayüzlerini anlık yeniden çizdir
            try {
                if (typeof renderBotanicSupplierUI === 'function' && document.getElementById('botanicSupplierModal')?.style.display === 'flex') {
                    renderBotanicSupplierUI();
                }
                if (typeof renderBotanicMarketUI === 'function' && document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                    renderBotanicMarketUI();
                }
                if (typeof renderIsgShopUI === 'function' && document.getElementById('isgSafetyShopModal')?.style.display === 'flex') {
                    renderIsgShopUI();
                }
            } catch (_) {}

            try {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('balanceChanged', { detail: { money: num } }));
                }
            } catch (_) {}
        },

        updateDiamondsDOM(num) {
            const fmtNum = num.toLocaleString('tr-TR');
            const dEl = document.getElementById('myDiamonds');
            if (dEl) dEl.innerText = fmtNum;
            const cEl = document.getElementById('diamondBadgeContainer');
            if (cEl) cEl.style.display = 'flex';

            if (typeof window !== 'undefined' && window.miningClient && window.miningClient.state) {
                window.miningClient.state.diamonds = num;
            }

            try {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('diamondsChanged', { detail: { diamonds: num } }));
                }
            } catch (_) {}
        },

        initSockets() {
            const s = (typeof window !== 'undefined' && window.socket) ? window.socket : (typeof socket !== 'undefined' ? socket : null);
            if (!s || s._economySocketsInitialized) return;
            s._economySocketsInitialized = true;

            s.on('moneyUpdate', (money) => {
                EconomyManager.setMoney(money);
            });

            s.on('diamondUpdate', (diamonds) => {
                EconomyManager.setDiamonds(diamonds);
            });

            s.on('balanceUpdate', (data) => {
                if (!data) return;
                if (data.money !== undefined) EconomyManager.setMoney(data.money);
                if (data.diamonds !== undefined) EconomyManager.setDiamonds(data.diamonds);
            });

            s.on('updateEconomy', (data) => {
                if (!data) return;
                if (data.money !== undefined) EconomyManager.setMoney(data.money);
                if (data.diamonds !== undefined) EconomyManager.setDiamonds(data.diamonds);
            });
        }
    };

    // Global erişim ve geriye dönük tam uyumluluk (backward compatibility)
    if (root) {
        root.EconomyManager = EconomyManager;
        root.updateMoneyDisplay = function(amt) { return EconomyManager.setMoney(amt); };
        root.updateDiamondDisplay = function(amt) { return EconomyManager.setDiamonds(amt); };
    }

    // Soket dinleyicilerini otomatik bağla
    if (typeof window !== 'undefined') {
        if (window.socket) {
            EconomyManager.initSockets();
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => EconomyManager.initSockets(), 400);
            });
        }
    }
})(typeof window !== 'undefined' ? window : globalThis);

