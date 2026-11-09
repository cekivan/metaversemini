// public/js/botanicClient.js
// 🌿 BOTANİK DÜKKANI, CANLI BORSA, ACIMASIZ TARIM & SÜRÜKLE-BIRAK (DRAG & DROP) SİSTEMİ

(function (window) {
    'use strict';

    // Global Durum Havuzu
    window.userFarmPlots = [];
    window.currentFarmOwner = null;
    window.botanicMarketData = null;
    window.selectedPlotActionIndex = null;
    window.draggedFarmingItem = null; // { itemKey, name, emoji, type }

    let activeMerchantTab = 'sell'; // 'sell' veya 'buy'

    // 6 Çiçek Türü Sabit Bilgileri
    const BOTANIC_CATALOG = {
        seeds: [
            { key: 'props_tohum_papatya', type: 'papatya', name: 'Papatya Tohumu', emoji: '🌱', price: 100, fideMin: 20, cicekMin: 40, desc: '20 dk fide, 40 dk çiçek. Hızlı ve güvenli başlangıç.' },
            { key: 'props_tohum_lale', type: 'lale', name: 'Lale Tohumu', emoji: '🌱', price: 150, fideMin: 30, cicekMin: 60, desc: '30 dk fide, 60 dk (1 sa) çiçek. Asil sultan lalesi.' },
            { key: 'props_tohum_gul', type: 'gul', name: 'Gül Tohumu', emoji: '🌱', price: 250, fideMin: 45, cicekMin: 90, desc: '45 dk fide, 90 dk (1.5 sa) çiçek. Kadife kırmızı gül.' },
            { key: 'props_tohum_sakayik', type: 'sakayik', name: 'Şakayık Tohumu', emoji: '🌱', price: 400, fideMin: 30, cicekMin: 90, desc: '30 dk fide, 90 dk (Toplam 2 sa) çiçek. Katmerli pembe şakayık.' },
            { key: 'props_tohum_lavanta', type: 'lavanta', name: 'Lavanta Tohumu', emoji: '🌱', price: 400, fideMin: 60, cicekMin: 120, desc: '60 dk (1 sa) fide, 120 dk (2 sa) çiçek. Mis kokulu dağ lavantası.' },
            { key: 'props_tohum_orkide', type: 'orkide', name: 'Orkide Tohumu', emoji: '🌱', price: 600, fideMin: 90, cicekMin: 180, desc: '90 dk (1.5 sa) fide, 180 dk (3 sa) çiçek. Büyüleyici mor orkide.' },
            { key: 'props_tohum_aycicegi', type: 'aycicegi', name: 'Ayçiçeği Tohumu', emoji: '🌱', price: 1000, fideMin: 120, cicekMin: 240, desc: '120 dk (2 sa) fide, 240 dk (4 sa) çiçek. Dev altın güneş ayçiçeği.' }
        ],
        supplies: [
            { key: 'props_bitki_suyu', name: 'Özel Bitki Suyu', emoji: '💧', price: 50, desc: 'Fidenin çiçeğe dönüşmesi için gereken can suyu (1 adet).' },
            { key: 'props_organik_gubre', name: 'Organik Gübre', emoji: '🧪', price: 100, desc: 'Fidenin çiçeğe dönüşmesi için gereken organik mineral gübre (1 adet).' }
        ],
        crops: [
            // Papatya
            { fideKey: 'props_fide_papatya', cicekKey: 'props_cicek_papatya', type: 'papatya', fideName: 'Papatya Fidesi', cicekName: 'Kır Papatyası', fidePrice: 500, cicekPrice: 1000, marketBuyPrice: 1300, emoji: '🌼' },
            // Lale
            { fideKey: 'props_fide_lale', cicekKey: 'props_cicek_lale', type: 'lale', fideName: 'Lale Fidesi', cicekName: 'Sultan Lalesi', fidePrice: 750, cicekPrice: 1500, marketBuyPrice: 1950, emoji: '🌷' },
            // Gül
            { fideKey: 'props_fide_gul', cicekKey: 'props_cicek_gul', type: 'gul', fideName: 'Gül Fidesi', cicekName: 'Kırmızı Gül', fidePrice: 1100, cicekPrice: 2200, marketBuyPrice: 2850, emoji: '🌹' },
            // Şakayık
            { fideKey: 'props_fide_sakayik', cicekKey: 'props_cicek_sakayik', type: 'sakayik', fideName: 'Şakayık Fidesi', cicekName: 'Zarif Şakayık', fidePrice: 1800, cicekPrice: 3600, marketBuyPrice: 4700, emoji: '🌸' },
            // Lavanta
            { fideKey: 'props_fide_lavanta', cicekKey: 'props_cicek_lavanta', type: 'lavanta', fideName: 'Lavanta Fidesi', cicekName: 'Dağ Lavantası', fidePrice: 1750, cicekPrice: 3500, marketBuyPrice: 4500, emoji: '🪻' },
            // Orkide
            { fideKey: 'props_fide_orkide', cicekKey: 'props_cicek_orkide', type: 'orkide', fideName: 'Orkide Fidesi', cicekName: 'Mor Orkide', fidePrice: 2750, cicekPrice: 5500, marketBuyPrice: 7100, emoji: '🌸' },
            // Ayçiçeği
            { fideKey: 'props_fide_aycicegi', cicekKey: 'props_cicek_aycicegi', type: 'aycicegi', fideName: 'Ayçiçeği Fidesi', cicekName: 'Güneş Ayçiçeği', fidePrice: 4750, cicekPrice: 9500, marketBuyPrice: 12000, emoji: '🌻' }
        ]
    };

    /**
     * 1. BOTANİKÇİ DEFNE (TEDARİKÇİ) MODALI
     */
    function openBotanicSupplierModal() {
        const modal = document.getElementById('botanicSupplierModal');
        if (!modal) return;
        modal.style.display = 'flex';
        renderBotanicSupplierUI();

        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('get_botanic_market_data');
    }
    window.openBotanicSupplierModal = openBotanicSupplierModal;

    function closeBotanicSupplierModal() {
        const modal = document.getElementById('botanicSupplierModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeBotanicSupplierModal = closeBotanicSupplierModal;

    function renderBotanicSupplierUI() {
        const container = document.getElementById('botanicSupplierItemsList');
        if (!container) return;

        let myMoney = (typeof window.myMoney !== 'undefined') ? window.myMoney : ((typeof players !== 'undefined' && players[myId]?.money) || 0);
        let propInv = window.myPropInventory || {};

        let allItems = [...BOTANIC_CATALOG.seeds, ...BOTANIC_CATALOG.supplies];

        let html = '';
        allItems.forEach(item => {
            let userCount = propInv[item.key] || 0;
            let canAfford = myMoney >= item.price;

            let timeBadge = item.fideMin ? `<span style="font-size: 10px; background: rgba(56,189,248,0.2); border: 1px solid rgba(56,189,248,0.4); color: #7dd3fc; padding: 1px 6px; border-radius: 6px; margin-left: 6px;">⏱️ ${item.fideMin} dk</span>` : '';

            html += `
            <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(34, 197, 94, 0.15); border: 1px solid #22c55e; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                        ${item.emoji}
                    </div>
                    <div>
                        <div style="font-weight: 800; font-size: 14px; color: #f8fafc; display: flex; align-items: center;">
                            ${item.name} ${timeBadge}
                        </div>
                        <div style="font-size: 11px; color: #94a3b8; margin: 2px 0;">${item.desc}</div>
                        <div style="font-size: 11px; color: #64748b;">Çantanızda: <b style="color: #38bdf8;">${userCount} Adet</b></div>
                    </div>
                </div>
                <div style="text-align: right; min-width: 120px;">
                    <div style="font-size: 15px; font-weight: 900; color: #facc15; margin-bottom: 5px;">${item.price} TL</div>
                    <button type="button" onclick="buySupplierItem('${item.key}', 1)" style="padding: 6px 14px; font-size: 12px; font-weight: 800; border-radius: 8px; border: none; background: ${canAfford ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#475569'}; color: white; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; box-shadow: ${canAfford ? '0 4px 12px rgba(34,197,94,0.3)' : 'none'};">
                        🛒 Satın Al
                    </button>
                </div>
            </div>`;
        });

        container.innerHTML = html;
        const balEl = document.getElementById('botanicSupplierBalance');
        if (balEl) balEl.innerText = `${myMoney.toLocaleString('tr-TR')} TL`;
    }
    window.renderBotanicSupplierUI = renderBotanicSupplierUI;

    function buySupplierItem(itemKey, qty) {
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('botanic_buy_supply', { itemKey, quantity: qty });
    }
    window.buySupplierItem = buySupplierItem;

    /**
     * 2. ÇİÇEK TÜCCARI RASİM (BORSA) MODALI
     */
    function openBotanicMarketModal() {
        const modal = document.getElementById('botanicMarketModal');
        if (!modal) return;
        modal.style.display = 'flex';
        renderBotanicMarketUI();

        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('get_botanic_market_data');
    }
    window.openBotanicMarketModal = openBotanicMarketModal;

    function closeBotanicMarketModal() {
        const modal = document.getElementById('botanicMarketModal');
        if (modal) modal.style.display = 'none';
    }
    window.closeBotanicMarketModal = closeBotanicMarketModal;

    function switchBotanicMarketTab(tab) {
        activeMerchantTab = tab;
        const tabBtnSell = document.getElementById('tabBotanicSell');
        const tabBtnBuy = document.getElementById('tabBotanicBuy');

        if (tab === 'sell') {
            if (tabBtnSell) { tabBtnSell.style.background = '#eab308'; tabBtnSell.style.color = '#000'; }
            if (tabBtnBuy) { tabBtnBuy.style.background = 'transparent'; tabBtnBuy.style.color = '#94a3b8'; }
        } else {
            if (tabBtnBuy) { tabBtnBuy.style.background = '#ec4899'; tabBtnBuy.style.color = '#fff'; }
            if (tabBtnSell) { tabBtnSell.style.background = 'transparent'; tabBtnSell.style.color = '#94a3b8'; }
        }
        renderBotanicMarketUI();
    }
    window.switchBotanicMarketTab = switchBotanicMarketTab;

    function renderBotanicMarketUI() {
        const contentContainer = document.getElementById('botanicMarketTabContent');
        if (!contentContainer) return;

        let myMoney = (typeof window.myMoney !== 'undefined') ? window.myMoney : ((typeof players !== 'undefined' && players[myId]?.money) || 0);
        let propInv = window.myPropInventory || {};
        let stock = (window.botanicMarketData && window.botanicMarketData.stock) ? window.botanicMarketData.stock : { papatya: 20, lale: 20, gul: 20, lavanta: 20, orkide: 20, aycicegi: 20 };

        // SEKME 1: [FİDE / ÇİÇEK SAT] (Oyuncu Arzı)
        if (activeMerchantTab === 'sell') {
            let html = '<div style="font-size: 12px; color: #cbd5e1; margin-bottom: 10px;">🌱 Ürettiğiniz fideleri temel fiyattan, olgun çiçekleri ise fidenin <b>tam 2 katı fiyattan</b> satabilirsiniz. Çiçek satışları borsa stoğunu artırır!</div>';

            let hasAny = false;
            BOTANIC_CATALOG.crops.forEach(crop => {
                let fideCount = propInv[crop.fideKey] || 0;
                let cicekCount = propInv[crop.cicekKey] || 0;
                if (fideCount > 0 || cicekCount > 0) hasAny = true;

                // Fide Kartı
                html += `
                <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 22px;">🌿</span>
                        <div>
                            <div style="font-weight: 800; font-size: 13px; color: #f8fafc;">${crop.fideName}</div>
                            <div style="font-size: 11px; color: #64748b;">Çantanızda: <b style="color: ${fideCount > 0 ? '#4ade80' : '#ef4444'};">${fideCount} Adet</b></div>
                        </div>
                    </div>
                    <div style="text-align: right; min-width: 110px;">
                        <div style="font-size: 14px; font-weight: 900; color: #4ade80; margin-bottom: 4px;">+${crop.fidePrice} TL</div>
                        <button type="button" onclick="sellCropToMerchant('${crop.type}', false, 1)" style="padding: 5px 12px; font-size: 11px; font-weight: 800; border-radius: 6px; border: none; background: ${fideCount > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : '#334155'}; color: white; cursor: ${fideCount > 0 ? 'pointer' : 'not-allowed'};" ${fideCount > 0 ? '' : 'disabled'}>
                            Sat
                        </button>
                    </div>
                </div>`;

                // Çiçek Kartı (2 Katı Fiyat)
                html += `
                <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(234, 179, 8, 0.25); border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">${crop.emoji}</span>
                        <div>
                            <div style="font-weight: 900; font-size: 13.5px; color: #fef08a;">${crop.cicekName} <span style="font-size: 10px; background: rgba(234,179,8,0.2); color: #facc15; padding: 1px 5px; border-radius: 4px; font-weight: 700;">2x Fiyat</span></div>
                            <div style="font-size: 11px; color: #64748b;">Çantanızda: <b style="color: ${cicekCount > 0 ? '#4ade80' : '#ef4444'};">${cicekCount} Adet</b></div>
                        </div>
                    </div>
                    <div style="text-align: right; min-width: 110px;">
                        <div style="font-size: 15px; font-weight: 900; color: #facc15; margin-bottom: 4px;">+${crop.cicekPrice} TL</div>
                        <button type="button" onclick="sellCropToMerchant('${crop.type}', true, 1)" style="padding: 5px 12px; font-size: 11px; font-weight: 800; border-radius: 6px; border: none; background: ${cicekCount > 0 ? 'linear-gradient(135deg, #eab308, #ca8a04)' : '#334155'}; color: ${cicekCount > 0 ? '#000' : '#94a3b8'}; cursor: ${cicekCount > 0 ? 'pointer' : 'not-allowed'};" ${cicekCount > 0 ? '' : 'disabled'}>
                            Çiçeği Sat
                        </button>
                    </div>
                </div>`;
            });

            if (!hasAny) {
                html += `
                <div style="padding: 16px; border-radius: 12px; background: rgba(234, 179, 8, 0.08); border: 1px dashed rgba(234, 179, 8, 0.3); text-align: center; color: #fef08a; font-size: 12px; line-height: 1.5;">
                    ℹ️ Çantanızda satılacak fide veya çiçek bulunmuyor. Bahçenizdeki tarlada tohum ekip büyütün!
                </div>`;
            }

            contentContainer.innerHTML = html;

        } else {
            // SEKME 2: [ÇİÇEK SATIN AL & KITLIK MEKANİĞİ]
            let html = '<div style="font-size: 12px; color: #cbd5e1; margin-bottom: 10px;">📊 <b>Kıtlık Borsası:</b> Sistem kendiliğinden çiçek üretmez! Sadece oyuncuların tarlalarında yetiştirip sattığı çiçekler borsaya girer.</div>';

            BOTANIC_CATALOG.crops.forEach(crop => {
                let curStock = stock[crop.type] || 0;
                let isOutOfStock = (curStock <= 0);
                let canAfford = (myMoney >= crop.marketBuyPrice);

                html += `
                <div style="background: rgba(15, 23, 42, 0.75); border: 1px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255,255,255,0.1)'}; border-radius: 14px; padding: 12px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(236, 72, 153, 0.15); border: 1px solid #ec4899; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            ${crop.emoji}
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 14px; color: #f8fafc;">${crop.cicekName}</div>
                            <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px;">
                                <span style="font-size: 11px; color: #64748b;">Borsa Stoğu:</span>
                                ${isOutOfStock 
                                    ? '<span style="background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; color: #fca5a5; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">⚠️ STOKTA YOK - ÜRETİCİ KITLIĞI VAR!</span>' 
                                    : `<span style="background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; color: #86efac; font-size: 11px; font-weight: 800; padding: 2px 6px; border-radius: 6px;">${curStock} Adet Mevcut</span>`}
                            </div>
                        </div>
                    </div>
                    <div style="text-align: right; min-width: 120px;">
                        <div style="font-size: 15px; font-weight: 900; color: #facc15; margin-bottom: 5px;">${crop.marketBuyPrice} TL</div>
                        <button type="button" onclick="buyFlowerFromMarket('${crop.type}', 1)" style="padding: 6px 14px; font-size: 12px; font-weight: 800; border-radius: 8px; border: none; background: ${(!isOutOfStock && canAfford) ? 'linear-gradient(135deg, #ec4899, #db2777)' : '#334155'}; color: white; cursor: ${(!isOutOfStock && canAfford) ? 'pointer' : 'not-allowed'};" ${isOutOfStock ? 'disabled' : ''}>
                            ${isOutOfStock ? '🔒 Kıtlık Var' : '🛒 Satın Al'}
                        </button>
                    </div>
                </div>`;
            });

            contentContainer.innerHTML = html;
        }

        const balEl = document.getElementById('botanicMarketBalance');
        if (balEl) balEl.innerText = `${myMoney.toLocaleString('tr-TR')} TL`;
    }
    window.renderBotanicMarketUI = renderBotanicMarketUI;

    function sellCropToMerchant(cropType, isFlower, qty) {
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('botanic_sell_crop', { cropType, isFlower, quantity: qty });
    }
    window.sellCropToMerchant = sellCropToMerchant;

    function buyFlowerFromMarket(flowerType, qty) {
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('botanic_buy_flower', { flowerType, quantity: qty });
    }
    window.buyFlowerFromMarket = buyFlowerFromMarket;

    /**
     * 3. TARLA PARSELİ DOĞRUDAN ETKİLEŞİM MOTORU (POP-UP OLMADAN DİREKT İŞLEM)
     */
    function handleFarmPlotDirectClick(plotIndex) {
        let plots = window.userFarmPlots || [];
        let plot = plots[plotIndex] || { plotIndex, state: 'EMPTY' };
        let propInv = window.myPropInventory || {};
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (!sock) return;

        let myMoney = (typeof window.myMoney !== 'undefined') ? window.myMoney : ((typeof players !== 'undefined' && players[window.myId]?.money) || 0);

        function showDirectToast(msg, type = 'info') {
            if (typeof showFloatingToast === 'function') {
                showFloatingToast(msg);
            } else if (typeof showGameNotification === 'function') {
                showGameNotification(msg, type);
            }
        }

        // A) WITHERED (Kurudu / Yandı) -> 50 TL öde ve doğrudan temizle
        if (plot.state === 'WITHERED') {
            if (myMoney >= 50) {
                executeCleanPlot(plotIndex);
                showDirectToast('🧹 50 TL ödendi, tarla temizleniyor... (30 Sn)', 'success');
            } else {
                showDirectToast('❌ Tarlayı temizlemek için 50 TL gerekir!', 'error');
            }
            return;
        }

        // B) FLOWER_READY (Çiçek Açtı) -> Doğrudan Hasat Et!
        if (plot.state === 'FLOWER_READY') {
            executeHarvestPlot(plotIndex);
            let cropInfo = BOTANIC_CATALOG.crops.find(c => c.type === plot.seedType) || BOTANIC_CATALOG.crops[0];
            showDirectToast(`💐 ${cropInfo.cicekName} hasat edildi! (+${cropInfo.cicekPrice} TL)`, 'success');
            return;
        }

        // C) SAPLING_READY (Fide Hazır) -> Su & Gübre varsa can suyu ver, yoksa fideyi hasat et!
        if (plot.state === 'SAPLING_READY') {
            let waterCount = propInv['props_bitki_suyu'] || 0;
            let fertCount = propInv['props_organik_gubre'] || 0;
            if (waterCount >= 1 && fertCount >= 1) {
                executeWaterAndFertilize(plotIndex);
                showDirectToast('💧 Can suyu ve gübre verildi! Çiçek açmaya başladı ✨', 'success');
            } else {
                executeHarvestPlot(plotIndex);
                showDirectToast('🌿 Genç fide hasat edilerek çantanıza alındı!', 'success');
            }
            return;
        }

        // D) EMPTY (Boş Parsel) -> Seçili tohum varsa ek, yoksa çantadakini otomatik ek
        if (plot.state === 'EMPTY') {
            let selectedItem = window.selectedFarmingTrayItem;
            if (selectedItem && selectedItem.startsWith('props_tohum_') && (propInv[selectedItem] || 0) > 0) {
                let seedType = selectedItem.replace('props_tohum_', '');
                executePlantSeed(plotIndex, seedType);
                let sInfo = BOTANIC_CATALOG.seeds.find(s => s.type === seedType);
                showDirectToast(`🌱 ${sInfo ? sInfo.name : 'Tohum'} ekildi!`, 'success');
                return;
            }

            // Çantada tohum var mı kontrol et
            let availableSeed = BOTANIC_CATALOG.seeds.find(s => (propInv[s.key] || 0) > 0);
            if (availableSeed) {
                executePlantSeed(plotIndex, availableSeed.type);
                showDirectToast(`🌱 ${availableSeed.name} toprağa ekildi!`, 'success');
                return;
            }

            showDirectToast('🌾 Parsel ekime hazır. Botanik Dükkanı\'ndan tohum alabilirsiniz.', 'info');
            return;
        }

        // E) SEED (Tohum Toprakta Filizleniyor)
        if (plot.state === 'SEED') {
            let sInfo = BOTANIC_CATALOG.seeds.find(s => s.type === plot.seedType) || BOTANIC_CATALOG.seeds[0];
            let totalMs = (sInfo.fideMin || 30) * 60000;
            let passed = Date.now() - (plot.stageChangedAt || plot.plantedAt || Date.now());
            let remainMin = Math.max(1, Math.ceil(Math.max(0, totalMs - passed) / 60000));
            showDirectToast(`🌱 ${sInfo.name} filizleniyor... (~${remainMin} dk)`, 'info');
            return;
        }

        // F) FLOWER_GROWING (Çiçek Açıyor)
        if (plot.state === 'FLOWER_GROWING') {
            let sInfo = BOTANIC_CATALOG.seeds.find(s => s.type === plot.seedType) || BOTANIC_CATALOG.seeds[0];
            let totalMs = (sInfo.cicekMin || 60) * 60000;
            let passed = Date.now() - (plot.stageChangedAt || Date.now());
            let remainMin = Math.max(1, Math.ceil(Math.max(0, totalMs - passed) / 60000));
            showDirectToast(`🌸 ${sInfo.name.replace('Tohumu', '').trim()} çiçek açıyor... (~${remainMin} dk)`, 'info');
            return;
        }

        // G) CLEANING (Temizleniyor)
        if (plot.state === 'CLEANING') {
            let remainSec = Math.max(1, Math.ceil(Math.max(0, (plot.cleaningEndsAt || Date.now()) - Date.now()) / 1000));
            showDirectToast(`🧹 Tarla temizleniyor... (~${remainSec} sn)`, 'info');
            return;
        }
    }
    window.handleFarmPlotDirectClick = handleFarmPlotDirectClick;

    function openFarmPlotActionModal(plotIndex) {
        handleFarmPlotDirectClick(plotIndex);
    }
    window.openFarmPlotActionModal = openFarmPlotActionModal;

    function closeFarmPlotActionModal() {
        window.selectedPlotActionIndex = null;
    }
    window.closeFarmPlotActionModal = closeFarmPlotActionModal;

    function renderFarmPlotActionUI() {
        // Modal kaldırıldı, doğrudan etkileşim aktif.
    }

    function executePlantSeed(plotIndex, seedType) {
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('plant_seed', { plotIndex, seedType });
        closeFarmPlotActionModal();
    }
    window.executePlantSeed = executePlantSeed;

    function executeWaterAndFertilize(plotIndex) {
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('water_and_fertilize', { plotIndex });
        closeFarmPlotActionModal();
    }
    window.executeWaterAndFertilize = executeWaterAndFertilize;

    function executeHarvestPlot(plotIndex) {
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('harvest_plot', { plotIndex });
        closeFarmPlotActionModal();
    }
    window.executeHarvestPlot = executeHarvestPlot;

    function executeCleanPlot(plotIndex) {
        let sock = window.socket || (typeof socket !== 'undefined' ? socket : null);
        if (sock) sock.emit('clean_withered_plot', { plotIndex });
        closeFarmPlotActionModal();
    }
    window.executeCleanPlot = executeCleanPlot;

    /**
     * 4. SÜRÜKLE & BIRAK (DRAG & DROP) TARIM MOTORU
     */
    let dragGhostEl = null;

    function createDragGhost(text, emoji) {
        if (!dragGhostEl) {
            dragGhostEl = document.createElement('div');
            dragGhostEl.id = 'farmingDragGhost';
            dragGhostEl.style.cssText = 'position: fixed; pointer-events: none; z-index: 10099; padding: 6px 12px; border-radius: 12px; background: rgba(15,23,42,0.92); border: 1.5px solid #22c55e; color: white; font-weight: 800; font-size: 12px; display: none; align-items: center; gap: 6px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); transform: translate(-50%, -120%); backdrop-filter: blur(6px);';
            document.body.appendChild(dragGhostEl);
        }
        dragGhostEl.innerHTML = `<span>${emoji}</span> <span>${text}</span>`;
        dragGhostEl.style.display = 'flex';
    }

    function updateDragGhostPos(x, y) {
        if (dragGhostEl && dragGhostEl.style.display !== 'none') {
            dragGhostEl.style.left = `${x}px`;
            dragGhostEl.style.top = `${y}px`;
        }
    }

    function removeDragGhost() {
        if (dragGhostEl) {
            dragGhostEl.style.display = 'none';
        }
    }

    let pendingFarmingTouch = null;
    let lastFarmingTouchTime = 0;

    function handleFarmingItemDragStart(e, itemKey) {
        let count = (window.myPropInventory && window.myPropInventory[itemKey]) || 0;
        if (count <= 0) {
            if (e && e.preventDefault) e.preventDefault();
            return;
        }
        let info = (typeof getPropInfo === 'function') ? getPropInfo(itemKey) : { name: itemKey, emoji: '🌱' };
        window.draggedFarmingItem = { itemKey, name: info.name, emoji: info.emoji };
        if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', itemKey);
            e.dataTransfer.effectAllowed = 'copy';
        }
        createDragGhost(info.name, info.emoji);
    }
    window.handleFarmingItemDragStart = handleFarmingItemDragStart;

    function handleFarmingItemDragEnd(e) {
        removeDragGhost();
        window.draggedFarmingItem = null;
        pendingFarmingTouch = null;
        if (typeof window.hoveredPlotIndex !== 'undefined') window.hoveredPlotIndex = -1;
    }
    window.handleFarmingItemDragEnd = handleFarmingItemDragEnd;

    function handleFarmingItemMouseDown(e, itemKey) {
        if (Date.now() - lastFarmingTouchTime < 650) return;
        let count = (window.myPropInventory && window.myPropInventory[itemKey]) || 0;
        if (count <= 0) return;
        let info = (typeof getPropInfo === 'function') ? getPropInfo(itemKey) : { name: itemKey, emoji: '🌱' };
        window.draggedFarmingItem = { itemKey, name: info.name, emoji: info.emoji };
        createDragGhost(info.name, info.emoji);
        updateDragGhostPos(e.clientX, e.clientY);
    }
    window.handleFarmingItemMouseDown = handleFarmingItemMouseDown;

    function handleFarmingItemTouchStart(e, itemKey) {
        lastFarmingTouchTime = Date.now();
        if (!e.touches || !e.touches[0]) return;
        let count = (window.myPropInventory && window.myPropInventory[itemKey]) || 0;
        if (count <= 0) return;
        let info = (typeof getPropInfo === 'function') ? getPropInfo(itemKey) : { name: itemKey, emoji: '🌱' };
        pendingFarmingTouch = {
            itemKey,
            name: info.name,
            emoji: info.emoji,
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY
        };
    }
    window.handleFarmingItemTouchStart = handleFarmingItemTouchStart;

    function toggleSelectFarmingTrayItem(itemKey) {
        let propInv = window.myPropInventory || {};
        if ((propInv[itemKey] || 0) <= 0) {
            window.selectedFarmingTrayItem = null;
        } else {
            window.selectedFarmingTrayItem = (window.selectedFarmingTrayItem === itemKey) ? null : itemKey;
        }
        renderGardenQuickTray();
    }
    window.toggleSelectFarmingTrayItem = toggleSelectFarmingTrayItem;

    function getPlotIndexFromViewportPoint(clientX, clientY) {
        let canvas = document.getElementById('gameCanvas');
        if (!canvas || typeof window.getFarmPlotIndexAtCanvasCoords !== 'function') return -1;
        let rect = canvas.getBoundingClientRect();
        if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) return -1;
        let mx, my;
        if (typeof window.getCanvasEventCoords === 'function') {
            let coords = window.getCanvasEventCoords({ clientX, clientY });
            mx = coords.x;
            my = coords.y;
        } else {
            let scaleX = canvas.width / (rect.width || 1);
            let scaleY = canvas.height / (rect.height || 1);
            mx = (clientX - rect.left) * scaleX;
            my = (clientY - rect.top) * scaleY;
        }
        return window.getFarmPlotIndexAtCanvasCoords(mx, my);
    }

    // Canvas ve Pencere Etkileşim Dinleyicileri
    function initFarmingDragAndDropListeners() {
        window.addEventListener('mousemove', (e) => {
            if (!window.draggedFarmingItem) return;
            updateDragGhostPos(e.clientX, e.clientY);

            let plotIdx = getPlotIndexFromViewportPoint(e.clientX, e.clientY);
            if (plotIdx !== -1) {
                window.hoveredPlotIndex = plotIdx;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (!window.draggedFarmingItem || window.draggedFarmingItem.isTouch) return;

            let plotIdx = getPlotIndexFromViewportPoint(e.clientX, e.clientY);
            if (plotIdx !== -1) {
                applyFarmingItemToTargetPlot(plotIdx, window.draggedFarmingItem.itemKey);
            }

            handleFarmingItemDragEnd();
        });

        // Dokunmatik (Mobil / Tablet) Sürükle & Bırak Dinleyicileri
        window.addEventListener('touchmove', (e) => {
            if (!e.touches || !e.touches[0]) return;
            let t = e.touches[0];

            if (!window.draggedFarmingItem && pendingFarmingTouch) {
                let dx = t.clientX - pendingFarmingTouch.startX;
                let dy = t.clientY - pendingFarmingTouch.startY;
                // Bahçıvan çantasını yatay kaydırmaya izin ver: belirgin dikey sürükleme veya geniş hareket varsa taşıma başlat
                let isTrayHorizontalScroll = Math.abs(dx) > Math.abs(dy) * 1.35 && Math.abs(dy) < 18;
                if (!isTrayHorizontalScroll && Math.hypot(dx, dy) > 10) {
                    window.draggedFarmingItem = {
                        itemKey: pendingFarmingTouch.itemKey,
                        name: pendingFarmingTouch.name,
                        emoji: pendingFarmingTouch.emoji,
                        isTouch: true
                    };
                    createDragGhost(pendingFarmingTouch.name, pendingFarmingTouch.emoji);
                    pendingFarmingTouch = null;
                }
            }

            if (!window.draggedFarmingItem || !window.draggedFarmingItem.isTouch) return;
            if (e.cancelable) e.preventDefault();
            updateDragGhostPos(t.clientX, t.clientY);

            let plotIdx = getPlotIndexFromViewportPoint(t.clientX, t.clientY);
            window.hoveredPlotIndex = plotIdx;
        }, { passive: false });

        window.addEventListener('touchend', (e) => {
            pendingFarmingTouch = null;
            if (!window.draggedFarmingItem) return;
            let t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
            if (t) {
                let plotIdx = getPlotIndexFromViewportPoint(t.clientX, t.clientY);
                if (plotIdx !== -1) {
                    applyFarmingItemToTargetPlot(plotIdx, window.draggedFarmingItem.itemKey);
                    window.selectedFarmingTrayItem = null;
                }
            }
            handleFarmingItemDragEnd();
        });

        window.addEventListener('touchcancel', () => {
            pendingFarmingTouch = null;
            if (window.draggedFarmingItem) handleFarmingItemDragEnd();
        });

        // HTML5 Native Dragover & Drop
        let canvas = document.getElementById('gameCanvas');
        if (canvas) {
            // Mobil için "Seç ve Tarlaya Dokun" kolaylığı
            canvas.addEventListener('pointerdown', (e) => {
                if (!e.isPrimary || !window.selectedFarmingTrayItem) return;
                let propInv = window.myPropInventory || {};
                if ((propInv[window.selectedFarmingTrayItem] || 0) <= 0) {
                    window.selectedFarmingTrayItem = null;
                    renderGardenQuickTray();
                    return;
                }
                let plotIdx = getPlotIndexFromViewportPoint(e.clientX, e.clientY);
                if (plotIdx !== -1) {
                    e.preventDefault();
                    e.stopPropagation();
                    applyFarmingItemToTargetPlot(plotIdx, window.selectedFarmingTrayItem);
                }
            }, true);

            canvas.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
                let rect = canvas.getBoundingClientRect();
                let scaleX = canvas.width / rect.width;
                let scaleY = canvas.height / rect.height;
                let mx = (e.clientX - rect.left) * scaleX;
                let my = (e.clientY - rect.top) * scaleY;

                if (typeof window.getFarmPlotIndexAtCanvasCoords === 'function') {
                    let plotIdx = window.getFarmPlotIndexAtCanvasCoords(mx, my);
                    if (plotIdx !== -1) {
                        window.hoveredPlotIndex = plotIdx;
                    }
                }
                updateDragGhostPos(e.clientX, e.clientY);
            });

            canvas.addEventListener('drop', (e) => {
                e.preventDefault();
                let itemKey = e.dataTransfer ? e.dataTransfer.getData('text/plain') : (window.draggedFarmingItem?.itemKey);
                if (!itemKey && window.draggedFarmingItem) itemKey = window.draggedFarmingItem.itemKey;
                if (!itemKey) return;

                let rect = canvas.getBoundingClientRect();
                let scaleX = canvas.width / rect.width;
                let scaleY = canvas.height / rect.height;
                let mx = (e.clientX - rect.left) * scaleX;
                let my = (e.clientY - rect.top) * scaleY;

                if (typeof window.getFarmPlotIndexAtCanvasCoords === 'function') {
                    let plotIdx = window.getFarmPlotIndexAtCanvasCoords(mx, my);
                    if (plotIdx !== -1) {
                        applyFarmingItemToTargetPlot(plotIdx, itemKey);
                    }
                }
                handleFarmingItemDragEnd();
            });
        }
    }

    function applyFarmingItemToTargetPlot(plotIndex, itemKey) {
        let plots = window.userFarmPlots || [];
        let plot = plots[plotIndex];
        if (!plot) return;

        // Tohum Ekimi
        if (itemKey.startsWith('props_tohum_')) {
            let seedType = itemKey.replace('props_tohum_', '');
            if (plot.state === 'EMPTY') {
                executePlantSeed(plotIndex, seedType);
            } else {
                if (typeof showGameNotification === 'function') {
                    showGameNotification('❌ Bu parsel boş değil!', 'error');
                }
            }
        }
        // Su veya Gübre Verme
        else if (itemKey === 'props_bitki_suyu' || itemKey === 'props_organik_gubre') {
            if (plot.state === 'SAPLING_READY') {
                executeWaterAndFertilize(plotIndex);
            } else {
                if (typeof showGameNotification === 'function') {
                    showGameNotification('❌ Yalnızca hazır fide aşamasındaki tarlaya su ve gübre verilebilir!', 'error');
                }
            }
        }
    }
    window.applyFarmingItemToTargetPlot = applyFarmingItemToTargetPlot;

    /**
     * 5. BAHÇIVAN HIZLI ÇANTASI / TRAY (HUD)
     */
    function renderGardenQuickTray() {
        let isGarden = false;
        if (typeof window.currentRoom !== 'undefined') {
            if (window.currentRoom.startsWith('house_')) {
                let house = (typeof window.getCurrentViewingHouse === 'function') ? window.getCurrentViewingHouse() : null;
                if (house && house.type === 'garden') isGarden = true;
                if (window.currentRoom.includes('garden')) isGarden = true;
            }
        }

        let tray = document.getElementById('gardenQuickFarmingTray');
        if (!isGarden) {
            if (tray) tray.style.display = 'none';
            if (window.selectedFarmingTrayItem) window.selectedFarmingTrayItem = null;
            if (window.draggedFarmingItem || pendingFarmingTouch) handleFarmingItemDragEnd();
            return;
        }

        // Aktif bir dokunma veya sürükleme sırasında DOM sıfırlayıp parmak hedefini koparma
        if (window.draggedFarmingItem || pendingFarmingTouch) {
            return;
        }

        if (!tray) {
            tray = document.createElement('div');
            tray.id = 'gardenQuickFarmingTray';
            tray.style.cssText = 'position: fixed; bottom: 85px; right: 20px; background: rgba(15,23,42,0.92); backdrop-filter: blur(10px); border: 2px solid #22c55e; border-radius: 20px; padding: 10px 14px; z-index: 10050; display: flex; flex-direction: column; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); max-width: 320px;';
            document.body.appendChild(tray);
        }
        tray.style.display = 'flex';

        let propInv = window.myPropInventory || {};

        let farmItems = [
            ...BOTANIC_CATALOG.seeds,
            ...BOTANIC_CATALOG.supplies
        ];

        let selectedKey = window.selectedFarmingTrayItem || null;
        if (selectedKey && (propInv[selectedKey] || 0) <= 0) {
            window.selectedFarmingTrayItem = null;
            selectedKey = null;
        }
        let helperSubtitle = selectedKey
            ? `<span style="color:#4ade80; font-weight:800;">✓ Seçili: Tarlaya dokun!</span>`
            : `Sürükle veya Seç & Dokun`;

        let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; gap: 8px;">
            <div style="font-size: 12px; font-weight: 900; color: #86efac; display: flex; align-items: center; gap: 6px;">
                <span>🌱</span> <span>Bahçıvan Çantası</span>
            </div>
            <div style="font-size: 10px; color: #94a3b8;">${helperSubtitle}</div>
        </div>
        <div class="garden-tray-scroll" style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px; -webkit-overflow-scrolling: touch;">`;

        let hasAnyItem = false;
        farmItems.forEach(item => {
            let count = propInv[item.key] || 0;
            if (count > 0) hasAnyItem = true;
            let isSel = (selectedKey === item.key && count > 0);
            let borderStyle = isSel ? '2px solid #facc15' : `1.5px solid ${count > 0 ? '#22c55e' : '#475569'}`;
            let shadowStyle = isSel ? 'box-shadow: 0 0 12px rgba(250,204,21,0.75); transform: scale(1.06);' : '';

            html += `
            <div draggable="${count > 0 ? 'true' : 'false'}" 
                 ondragstart="window.handleFarmingItemDragStart(event, '${item.key}')" 
                 ondragend="window.handleFarmingItemDragEnd(event)" 
                 onmousedown="window.handleFarmingItemMouseDown(event, '${item.key}')"
                 ontouchstart="window.handleFarmingItemTouchStart(event, '${item.key}')"
                 onclick="window.toggleSelectFarmingTrayItem('${item.key}')"
                 title="${item.name} (x${count}) - Tarlaya Sürükleyin veya Seçip Tarlaya Dokunun" 
                 style="position: relative; width: 44px; height: 44px; flex-shrink: 0; border-radius: 10px; background: ${isSel ? 'rgba(250,204,21,0.22)' : (count > 0 ? 'rgba(34,197,94,0.18)' : 'rgba(30,41,59,0.5)')}; border: ${borderStyle}; ${shadowStyle} display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: ${count > 0 ? 'grab' : 'not-allowed'}; user-select: none; touch-action: pan-x;">
                ${item.emoji}
                ${count > 0 ? `<span style="position: absolute; bottom: 2px; right: 3px; font-size: 9px; font-weight: 900; background: #22c55e; color: #000; border-radius: 4px; padding: 0 3px;">x${count}</span>` : ''}
            </div>`;
        });

        if (!hasAnyItem) {
            html += `<div style="font-size: 11px; color: #94a3b8; padding: 4px;">Çantanızda tohum veya su/gübre yok.</div>`;
        }

        html += `</div>`;
        if (tray._lastRenderedHtml !== html) {
            const oldScrollEl = tray.querySelector('.garden-tray-scroll');
            const prevScrollLeft = oldScrollEl ? oldScrollEl.scrollLeft : 0;
            tray.innerHTML = html;
            tray._lastRenderedHtml = html;
            const newScrollEl = tray.querySelector('.garden-tray-scroll');
            if (newScrollEl && prevScrollLeft > 0) {
                newScrollEl.scrollLeft = prevScrollLeft;
            }
        }
    }
    window.renderGardenQuickTray = renderGardenQuickTray;

    /**
     * 6. SOKET DİNLEYİCİLERİ
     */
    if (typeof socket !== 'undefined') {
        socket.on('farmPlotsData', (data) => {
            if (!data) return;
            window.userFarmPlots = data.plots || [];
            window.currentFarmOwner = data.owner;
            if (typeof window.syncIsometricFarmState === 'function') {
                window.syncIsometricFarmState(data.plots);
            }
            renderGardenQuickTray();
        });

        socket.on('farmPlotsUpdate', (data) => {
            if (!data) return;
            let currentViewing = (typeof window.getCurrentViewingHouse === 'function') ? window.getCurrentViewingHouse() : null;
            let myName = (typeof players !== 'undefined' && players[myId]?.name) ? players[myId].name : '';

            if ((currentViewing && currentViewing.owner === data.owner) || data.owner === myName) {
                window.userFarmPlots = data.plots || [];
                window.currentFarmOwner = data.owner;
                if (typeof window.syncIsometricFarmState === 'function') {
                    window.syncIsometricFarmState(data.plots);
                }
                renderGardenQuickTray();
            }
        });

        socket.on('botanicMarketData', (data) => {
            window.botanicMarketData = data;
            if (document.getElementById('botanicSupplierModal')?.style.display === 'flex') {
                renderBotanicSupplierUI();
            }
            if (document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                renderBotanicMarketUI();
            }
        });

        socket.on('botanicMarketStockUpdate', (stock) => {
            if (!window.botanicMarketData) window.botanicMarketData = {};
            window.botanicMarketData.stock = stock;
            if (document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                renderBotanicMarketUI();
            }
        });

        socket.on('moneyUpdate', (money) => {
            const amt = (typeof money === 'object' && money !== null && money.money !== undefined) ? money.money : money;
            const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
            window.myMoney = num;
            const bSup = document.getElementById('botanicSupplierBalance');
            if (bSup) bSup.innerText = `${num.toLocaleString('tr-TR')} TL`;
            const bMkt = document.getElementById('botanicMarketBalance');
            if (bMkt) bMkt.innerText = `${num.toLocaleString('tr-TR')} TL`;

            if (document.getElementById('botanicSupplierModal')?.style.display === 'flex') {
                renderBotanicSupplierUI();
            }
            if (document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                renderBotanicMarketUI();
            }
        });

        socket.on('farmActionSuccess', (data) => {
            if (typeof playSound === 'function') playSound('coin');
            renderGardenQuickTray();
            if (document.getElementById('botanicSupplierModal')?.style.display === 'flex') {
                renderBotanicSupplierUI();
            }
            if (document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                renderBotanicMarketUI();
            }
        });

        socket.on('botanicBuySuccess', (data) => {
            if (typeof playSound === 'function') playSound('coin');
            if (typeof showFloatingToast === 'function') {
                showFloatingToast(`🌿 Botanik alışverişi başarılı!`);
            }
            renderGardenQuickTray();
            if (document.getElementById('botanicSupplierModal')?.style.display === 'flex') {
                renderBotanicSupplierUI();
            }
            if (document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                renderBotanicMarketUI();
            }
        });

        socket.on('botanicSellSuccess', (data) => {
            if (typeof playSound === 'function') playSound('coin');
            if (typeof showFloatingToast === 'function') {
                showFloatingToast(`💰 Mahsul başarıyla satıldı! (+${data.earn || 0} TL)`);
            }
            renderGardenQuickTray();
            if (document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                renderBotanicMarketUI();
            }
        });

        socket.on('propInventoryUpdate', (inv) => {
            window.myPropInventory = inv || {};
            renderGardenQuickTray();
            if (document.getElementById('botanicSupplierModal')?.style.display === 'flex') {
                renderBotanicSupplierUI();
            }
            if (document.getElementById('botanicMarketModal')?.style.display === 'flex') {
                renderBotanicMarketUI();
            }
        });
    }

    // Başlangıçta sürükle-bırak dinleyicilerini kur
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFarmingDragAndDropListeners);
    } else {
        initFarmingDragAndDropListeners();
    }

    // Her 3 saniyede bir Bahçıvan Çantası durumunu kontrol et
    setInterval(renderGardenQuickTray, 3000);

})(window);
