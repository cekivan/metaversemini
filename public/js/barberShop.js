// public/js/barberShop.js - AVM "Salon De Paris" VIP Kuaför & Berber Stüdyosu İstemci Motoru

(function (global) {
    let isBarberModalOpen = false;
    let barberFacing = 'down'; // 'down', 'right', 'up', 'left'
    let barberActiveTab = 'hair'; // 'hair', 'beard', 'dye'
    let previewAvatar = null;
    let initialAvatar = null;
    let showBarberCape = true;

    // Saç Modelleri Kataloğu
    const BARBER_HAIR_STYLES = [
        { id: 'hair_k2_fade_pompadour', name: 'K2 Modern Fade Pompadour', tag: 'Popüler Erkek', price: 320, icon: '💈' },
        { id: 'hair_k2_anime_spiky', name: 'K2 Anime Dikenli Saç', tag: 'Asi Anime', price: 340, icon: '⚡' },
        { id: 'hair_k2_curtain_bangs', name: 'K2 Estetik Perde Kâkül', tag: 'Trend Kore', price: 340, icon: '💇' },
        { id: 'hair_k2_layered_blowout', name: 'K2 Hacimli Katlı Fön', tag: 'Hacimli Kadın', price: 360, icon: '🌊' },
        { id: 'hair_k2_twin_tails', name: 'K2 İkili Yandan Kuyruk', tag: 'Sevimli Kadın', price: 290, icon: '🎀' },
        { id: 'hair_k2_hime_cut', name: 'K2 Gotik Hime Cut', tag: 'Gotik Düz', price: 300, icon: '🖤' },
        { id: 'hair_k2_french_bob', name: 'K2 Şık Fransız Bob', tag: 'Zarif Bob', price: 330, icon: '🥐' },
        { id: 'hair_k2_ponytail', name: 'K2 Yüksek At Kuyruğu', tag: 'Sportif Kadın', price: 320, icon: '👱‍♀️' },
        { id: 'hair_k2_messy_bun', name: 'K2 Dağınık Sokak Topuzu', tag: 'Bohem Topuz', price: 330, icon: '☕' },
        { id: 'hair_k2_wavy_shoulder', name: 'K2 Dalgalı Omuz Saçı', tag: 'Klasik Dalgalı', price: 320, icon: '✨' },
        { id: 'hair_k2_half_up_braid', name: 'K2 Yarım Örgülü Taç', tag: 'Romantik Örgü', price: 350, icon: '👑' },
        { id: 'hair_k2_flaming_fire', name: '🔥 Alev Alan Yanan Saç', tag: 'Efsanevi VIP', price: 650, icon: '🔥' },
        { id: 'none', name: 'Sıfır Numara / Buzzcut', tag: 'Asker Tıraşı', price: 0, icon: '🪒' },
        { id: 'hair_bob', name: 'Klasik Küt Saç', tag: 'Nostaljik', price: 240, icon: '💇‍♀️' },
        { id: 'hair_long', name: 'Uzun Düz Saç', tag: 'Düz Saç', price: 260, icon: '✨' },
        { id: 'hair_wavy', name: 'Dalgalı Klasik Saç', tag: 'Hacimli', price: 320, icon: '🌊' },
        { id: 'hair_ponytail', name: 'Klasik At Kuyruğu', tag: 'Klasik', price: 280, icon: '👱' },
        { id: 'hair_braids', name: 'Örgülü Saç', tag: 'Örgü', price: 290, icon: '🌾' },
        { id: 'hair_curly_brown', name: 'Kıvırcık Bukleli Saç', tag: 'Kıvırcık', price: 290, icon: '🌀' },
        { id: 'hair_blonde_curls', name: 'Altın Bukleli Uzun Saç', tag: 'Altın Bukle', price: 310, icon: '🌟' }
    ];

    // Sakal, Bıyık & Yüz Stilleri
    const BARBER_BEARD_STYLES = [
        { id: 'none', name: 'Sinekkaydı Tıraş (Temiz Yüz)', tag: 'Sade / Temiz', price: 0, icon: '🪒' },
        { id: 'beard', name: 'Kirli Sakal (3 Günlük)', tag: 'Karizmatik', price: 360, icon: '🧔' },
        { id: 'viking_beard', name: 'Örgülü Viking Sakalı', tag: 'Gür Savaşçı', price: 380, icon: '⚔️' },
        { id: 'mustache', name: 'Pala Bıyık', tag: 'Geleneksel', price: 240, icon: '👨' },
        { id: 'shadow_stubble_scar', name: 'K2 Yara İzi & Kirli Sakal', tag: 'Asi Sokak', price: 350, icon: '⚡' },
        { id: 'cute_blush_freckles', name: 'K2 Anime Allık & Çiller', tag: 'Sevimli', price: 280, icon: '🌸' },
        { id: 'goth_eyeliner_heart', name: 'K2 Kedi Gözü Eyeliner', tag: 'Gotik Kalp', price: 300, icon: '🖤' }
    ];

    // Saç Boyaları (Doğal & VIP Neon Renkler)
    const BARBER_HAIR_DYES = [
        { hex: '#18181b', name: 'Kuzguni Siyah', tag: 'Doğal', price: 50 },
        { hex: '#3f2e21', name: 'Espresso Koyu Kahve', tag: 'Doğal', price: 50 },
        { hex: '#654321', name: 'Sıcak Kestane', tag: 'Doğal', price: 50 },
        { hex: '#8d5524', name: 'Çikolata Kahve', tag: 'Doğal', price: 50 },
        { hex: '#b45309', name: 'Karamel Kumral', tag: 'Doğal', price: 50 },
        { hex: '#d97706', name: 'Bakır Kızıl', tag: 'Doğal', price: 50 },
        { hex: '#eab308', name: 'Altın Sarısı', tag: 'Işıltılı', price: 50 },
        { hex: '#fef08a', name: 'Platin Sarı', tag: 'Açık Sarı', price: 50 },
        { hex: '#94a3b8', name: 'Küllü Gümüş Gri', tag: 'Trend Gri', price: 50 },
        { hex: '#f8fafc', name: 'Buzul Beyazı', tag: 'Platin Beyaz', price: 50 },
        { hex: '#ef4444', name: 'Ateş Kırmızısı', tag: 'VIP Neon', price: 75 },
        { hex: '#ec4899', name: 'Barbie Neon Pembe', tag: 'VIP Neon', price: 75 },
        { hex: '#8b5cf6', name: 'Mistik Mor', tag: 'VIP Neon', price: 75 },
        { hex: '#3b82f6', name: 'Elektrik Mavisi', tag: 'VIP Neon', price: 75 },
        { hex: '#06b6d4', name: 'Turkuaz Cyan', tag: 'VIP Neon', price: 75 },
        { hex: '#10b981', name: 'Zümrüt Yeşili', tag: 'VIP Neon', price: 75 }
    ];

    /**
     * Web Audio API ile Gerçekçi Berber Ses Efektleri (Sıfır Bağımlılık)
     */
    function playBarberSnipSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = window.audioCtx || new AudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;
            // Çift metalik makas kesme çıtırtısı ("şak-şak")
            [0, 0.08, 0.16].forEach((delay, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(3400 - idx * 200, now + delay);
                osc.frequency.exponentialRampToValueAtTime(1200, now + delay + 0.035);
                gain.gain.setValueAtTime(0.25, now + delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.045);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + delay);
                osc.stop(now + delay + 0.05);
            });
        } catch (e) { }
    }

    function playBarberClipperSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = window.audioCtx || new AudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(115, now);
            osc.frequency.linearRampToValueAtTime(130, now + 0.4);
            gain.gain.setValueAtTime(0.14, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.45);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.45);
        } catch (e) { }
    }

    /**
     * Kuaför Arda Toast / Bildirim
     */
    function showBarberToast(msg, isSuccess = true) {
        let old = document.getElementById('barberToastNotice');
        if (old) old.remove();

        let t = document.createElement('div');
        t.id = 'barberToastNotice';
        t.style.cssText = `
            position: fixed;
            top: 24px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.96);
            border: 2px solid ${isSuccess ? '#ef4444' : '#eab308'};
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 20px ${isSuccess ? 'rgba(239, 68, 68, 0.4)' : 'rgba(234, 179, 8, 0.4)'};
            color: #ffffff;
            font-family: 'Segoe UI', -apple-system, sans-serif;
            font-size: 14px;
            font-weight: bold;
            padding: 12px 24px;
            border-radius: 999px;
            z-index: 1000000;
            display: flex;
            align-items: center;
            gap: 10px;
            pointer-events: none;
            animation: barberToastPop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        `;
        t.innerHTML = `<span>💈</span> <span>${msg}</span>`;
        document.body.appendChild(t);

        setTimeout(() => {
            if (t.parentNode) {
                t.style.opacity = '0';
                t.style.transition = 'opacity 0.3s ease';
                setTimeout(() => t.remove(), 300);
            }
        }, 3500);
    }

    /**
     * Envanterde olup olmadığını kontrol et
     */
    function isItemOwned(cat, itemId) {
        if (itemId === 'none') return true;
        const inv = window.myInventory || (typeof myInventory !== 'undefined' ? myInventory : null);
        if (!inv) return false;
        const normCat = (cat.endsWith('s') ? cat : (cat + 's'));
        if (inv[normCat] && Array.isArray(inv[normCat])) {
            return inv[normCat].includes(itemId);
        }
        return false;
    }

    /**
     * Stüdyoyu Aç
     */
    function openBarberStudioModal() {
        const curAv = (typeof myAvatar !== 'undefined' && myAvatar) ? myAvatar : (window.myAvatar || {});
        initialAvatar = JSON.parse(JSON.stringify(curAv));
        previewAvatar = JSON.parse(JSON.stringify(curAv));

        if (!previewAvatar.hair && previewAvatar.hat && previewAvatar.hat.startsWith('hair_')) {
            previewAvatar.hair = previewAvatar.hat;
            previewAvatar.hat = 'none';
        }

        // Eğer saç rengi yoksa varsayılan siyah
        if (!previewAvatar.hairColor) {
            previewAvatar.hairColor = '#18181b';
        }

        barberFacing = 'down';
        barberActiveTab = 'hair';
        isBarberModalOpen = true;

        ensureModalInDOM();
        updateBarberTabsUI();
        renderBarberMirrorPreview();

        let modal = document.getElementById('barberStudioModal');
        if (modal) {
            modal.style.display = 'flex';
        }

        const bEl = document.getElementById('barberShopBalance');
        if (bEl) bEl.innerText = `${(window.myMoney || 0).toLocaleString('tr-TR')} TL`;

        playBarberSnipSound();
    }
    window.openBarberStudioModal = openBarberStudioModal;

    /**
     * Stüdyoyu Kapat
     */
    function closeBarberStudioModal() {
        let modal = document.getElementById('barberStudioModal');
        if (modal) {
            modal.style.display = 'none';
        }
        isBarberModalOpen = false;
    }
    window.closeBarberStudioModal = closeBarberStudioModal;

    /**
     * Modal HTML Enjeksiyonu
     */
    function ensureModalInDOM() {
        if (document.getElementById('barberStudioModal')) return;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes barberToastPop {
                0% { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
                100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
            }
            @keyframes barberPoleSpin {
                0% { background-position: 0 0; }
                100% { background-position: 0 40px; }
            }
            .barber-tab-btn {
                flex: 1;
                padding: 10px 12px;
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #94a3b8;
                font-weight: bold;
                font-size: 13px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }
            .barber-tab-btn:hover {
                background: rgba(51, 65, 85, 0.9);
                color: #ffffff;
            }
            .barber-tab-btn.active {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border-color: #f87171;
                color: #ffffff;
                box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);
            }
            .barber-grid-card {
                background: rgba(30, 41, 59, 0.85);
                border: 1.5px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 10px;
                cursor: pointer;
                transition: all 0.18s ease;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                position: relative;
            }
            .barber-grid-card:hover {
                transform: translateY(-2px);
                border-color: #ef4444;
                background: rgba(51, 65, 85, 0.95);
                box-shadow: 0 6px 18px rgba(0, 0, 0, 0.5);
            }
            .barber-grid-card.selected {
                border-color: #ef4444;
                background: rgba(239, 68, 68, 0.18);
                box-shadow: 0 0 16px rgba(239, 68, 68, 0.4);
            }
            .barber-dye-swatch {
                width: 38px;
                height: 38px;
                border-radius: 8px;
                border: 2px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
                transition: all 0.2s ease;
                position: relative;
            }
            .barber-dye-swatch:hover {
                transform: scale(1.12);
                border-color: #ffffff;
                box-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
            }
            .barber-dye-swatch.selected {
                border: 3px solid #ffffff;
                transform: scale(1.15);
                box-shadow: 0 0 16px #ef4444;
            }
        `;
        document.head.appendChild(style);

        const modalDiv = document.createElement('div');
        modalDiv.id = 'barberStudioModal';
        modalDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(8, 12, 22, 0.88);
            backdrop-filter: blur(8px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            font-family: 'Segoe UI', -apple-system, sans-serif;
            color: #ffffff;
        `;

        modalDiv.innerHTML = `
            <div style="
                width: 880px;
                max-width: 95vw;
                height: 600px;
                max-height: 94vh;
                background: #0f172a;
                border: 2px solid #334155;
                border-radius: 16px;
                box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(239, 68, 68, 0.25);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            ">
                <!-- Üst Başlık Barı -->
                <div style="
                    padding: 14px 20px;
                    background: linear-gradient(90deg, #1e293b, #0f172a);
                    border-bottom: 2px solid #ef4444;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                ">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 24px;">💈</span>
                        <div>
                            <div style="font-size: 17px; font-weight: bold; letter-spacing: 0.5px; color: #f8fafc;">
                                SALON DE PARIS <span style="color: #ef4444; font-size: 13px; font-weight: normal; margin-left: 6px;">| VIP Kuaför & Berber Stüdyosu</span>
                            </div>
                            <div style="font-size: 11.5px; color: #94a3b8;">Baş Stilist Arda ile Saç, Sakal & Boyama Tasarımı</div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="background: rgba(15, 23, 42, 0.85); border: 1.5px solid #f59e0b; border-radius: 10px; padding: 5px 12px; text-align: right;">
                            <div style="font-size: 9px; color: #94a3b8; font-weight: 800;">BAKİYENİZ</div>
                            <div id="barberShopBalance" style="font-size: 14px; font-weight: 900; color: #facc15;">0 TL</div>
                        </div>
                        <button id="closeBarberStudioBtn" style="
                            background: rgba(255, 255, 255, 0.1);
                            border: none;
                            color: #ffffff;
                            font-size: 18px;
                            width: 34px;
                            height: 34px;
                            border-radius: 8px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            transition: background 0.2s;
                        " title="Kapat">✕</button>
                    </div>
                </div>

                <!-- Gövde: Sol Canlı Ayna + Sağ Kontrol & Katalog -->
                <div style="display: flex; flex: 1; overflow: hidden;">
                    <!-- SOL: Kuaför Aynası & 360° Önizleme -->
                    <div style="
                        width: 320px;
                        background: radial-gradient(circle at center, #1e293b 0%, #090d16 100%);
                        border-right: 1.5px solid #334155;
                        padding: 16px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                    ">
                        <!-- Ayna Çerçevesi -->
                        <div style="
                            position: relative;
                            width: 270px;
                            height: 290px;
                            background: #020617;
                            border: 3px solid #ef4444;
                            border-radius: 120px 120px 12px 12px;
                            box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(239, 68, 68, 0.25);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            overflow: hidden;
                        ">
                            <!-- Ayna Yansıma Çizgileri -->
                            <div style="
                                position: absolute;
                                top: -50px;
                                left: -50px;
                                width: 200px;
                                height: 400px;
                                background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 60%);
                                transform: rotate(25deg);
                                pointer-events: none;
                            "></div>
                            <canvas id="barberMirrorCanvas" width="270" height="290"></canvas>
                        </div>

                        <!-- 360° Derece Döndürme Kontrolleri -->
                        <div style="width: 100%; display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; font-weight: bold;">
                                <span>360° BAKIŞ AÇISI</span>
                                <span id="barberFacingLabel" style="color: #ef4444;">Ön Görünüm</span>
                            </div>
                            <div style="display: flex; gap: 6px;">
                                <button id="barberRotLeftBtn" style="
                                    flex: 1; padding: 6px; background: #334155; border: none; color: #fff; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;
                                ">⟲ Sola</button>
                                <button id="barberFacingFrontBtn" style="
                                    flex: 1; padding: 6px; background: #ef4444; border: none; color: #fff; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;
                                ">Ön</button>
                                <button id="barberFacingBackBtn" style="
                                    flex: 1; padding: 6px; background: #334155; border: none; color: #fff; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;
                                ">Arka</button>
                                <button id="barberRotRightBtn" style="
                                    flex: 1; padding: 6px; background: #334155; border: none; color: #fff; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer;
                                ">Sağa ⟳</button>
                            </div>

                            <!-- Pelerin Seçeneği -->
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; padding: 6px 10px; background: rgba(15, 23, 42, 0.6); border-radius: 8px;">
                                <span style="font-size: 11.5px; color: #cbd5e1;">✂️ Kuaför Pelerini:</span>
                                <button id="barberCapeToggleBtn" style="
                                    background: #ef4444; border: none; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer;
                                ">Açık</button>
                            </div>
                        </div>

                        <!-- Seçili Stil Özeti -->
                        <div id="barberSelectedSummary" style="
                            width: 100%;
                            background: rgba(15, 23, 42, 0.9);
                            border: 1px solid #334155;
                            border-radius: 8px;
                            padding: 8px 10px;
                            font-size: 11px;
                            color: #94a3b8;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        ">
                            <div>
                                <div style="color: #cbd5e1; font-weight: bold;" id="summaryHairName">Fade Pompadour</div>
                                <div style="font-size: 10px;" id="summaryBeardName">Sinekkaydı Tıraş</div>
                            </div>
                            <div id="summaryDyeSwatch" style="width: 18px; height: 18px; border-radius: 4px; border: 1.5px solid #fff; background: #18181b;" title="Saç Rengi"></div>
                        </div>
                    </div>

                    <!-- SAĞ: Sekmeler, Katalog ve Onaylama -->
                    <div style="
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        background: #0f172a;
                        padding: 16px;
                        overflow: hidden;
                    ">
                        <!-- Kategori Sekmeleri -->
                        <div style="display: flex; gap: 8px; margin-bottom: 14px;">
                            <button class="barber-tab-btn active" id="tabBtnHair">
                                <span>✂️</span> <span>Saç Modelleri</span>
                            </button>
                            <button class="barber-tab-btn" id="tabBtnBeard">
                                <span>🧔</span> <span>Sakal & Yüz</span>
                            </button>
                            <button class="barber-tab-btn" id="tabBtnDye">
                                <span>🎨</span> <span>Saç Boyama</span>
                            </button>
                        </div>

                        <!-- Liste Alanı (Kaydırılabilir) -->
                        <div id="barberItemsContainer" style="
                            flex: 1;
                            overflow-y: auto;
                            padding-right: 6px;
                        "></div>

                        <!-- Alt Aksiyon & Fiyat Çubuğu -->
                        <div style="
                            margin-top: 14px;
                            padding-top: 12px;
                            border-top: 1.5px solid #334155;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        ">
                            <div>
                                <div style="font-size: 11px; color: #94a3b8;">TOPLAM İŞLEM ÜCRETİ</div>
                                <div id="barberTotalCostDisplay" style="font-size: 20px; font-weight: bold; color: #22c55e;">
                                    Ücretsiz (Sahipsin)
                                </div>
                            </div>
                            <div style="display: flex; gap: 10px;">
                                <button id="barberResetBtn" style="
                                    padding: 10px 16px;
                                    background: #334155;
                                    border: none;
                                    color: #cbd5e1;
                                    font-weight: bold;
                                    font-size: 12.5px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                ">Sıfırla</button>
                                <button id="barberApplyBtn" style="
                                    padding: 10px 24px;
                                    background: linear-gradient(135deg, #ef4444, #b91c1c);
                                    border: none;
                                    color: #ffffff;
                                    font-weight: bold;
                                    font-size: 13.5px;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
                                    display: flex;
                                    align-items: center;
                                    gap: 8px;
                                ">
                                    <span>✂️</span> <span>Yeni Tarzı Uygula</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalDiv);

        // Olay Dinleyicileri
        document.getElementById('closeBarberStudioBtn').addEventListener('click', closeBarberStudioModal);
        document.getElementById('barberCapeToggleBtn').addEventListener('click', () => {
            showBarberCape = !showBarberCape;
            document.getElementById('barberCapeToggleBtn').innerText = showBarberCape ? 'Açık' : 'Kapalı';
            document.getElementById('barberCapeToggleBtn').style.background = showBarberCape ? '#ef4444' : '#64748b';
            renderBarberMirrorPreview();
        });

        // Sekmeler
        document.getElementById('tabBtnHair').addEventListener('click', () => switchBarberTab('hair'));
        document.getElementById('tabBtnBeard').addEventListener('click', () => switchBarberTab('beard'));
        document.getElementById('tabBtnDye').addEventListener('click', () => switchBarberTab('dye'));

        // Yön Kontrolleri
        document.getElementById('barberFacingFrontBtn').addEventListener('click', () => setBarberFacing('down'));
        document.getElementById('barberFacingBackBtn').addEventListener('click', () => setBarberFacing('up'));
        document.getElementById('barberRotLeftBtn').addEventListener('click', () => rotateBarberFacing(-1));
        document.getElementById('barberRotRightBtn').addEventListener('click', () => rotateBarberFacing(1));

        // Sıfırla & Uygula
        document.getElementById('barberResetBtn').addEventListener('click', resetBarberPreview);
        document.getElementById('barberApplyBtn').addEventListener('click', applyBarberStyleToPlayer);
    }

    /**
     * Yön Değiştirme
     */
    const FACINGS = ['down', 'right', 'up', 'left'];
    const FACING_LABELS = {
        'down': 'Ön Görünüm',
        'right': 'Sağ Profil',
        'up': 'Arka Görünüm',
        'left': 'Sol Profil'
    };

    function setBarberFacing(f) {
        barberFacing = f;
        let lbl = document.getElementById('barberFacingLabel');
        if (lbl) lbl.innerText = FACING_LABELS[f] || f;
        renderBarberMirrorPreview();
    }

    function rotateBarberFacing(dir) {
        let idx = FACINGS.indexOf(barberFacing);
        if (idx === -1) idx = 0;
        idx = (idx + dir + FACINGS.length) % FACINGS.length;
        setBarberFacing(FACINGS[idx]);
    }

    /**
     * Sekme Değişimi
     */
    function switchBarberTab(tab) {
        barberActiveTab = tab;
        ['tabBtnHair', 'tabBtnBeard', 'tabBtnDye'].forEach(id => {
            let b = document.getElementById(id);
            if (b) b.classList.remove('active');
        });
        const targetId = tab === 'hair' ? 'tabBtnHair' : (tab === 'beard' ? 'tabBtnBeard' : 'tabBtnDye');
        let activeBtn = document.getElementById(targetId);
        if (activeBtn) activeBtn.classList.add('active');

        updateBarberTabsUI();
    }

    /**
     * Liste İçeriğini Doldur
     */
    function updateBarberTabsUI() {
        const container = document.getElementById('barberItemsContainer');
        if (!container) return;
        container.innerHTML = '';

        if (barberActiveTab === 'hair') {
            // Saç Modelleri Izgarası (2 kolon)
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(2, 1fr)';
            container.style.gap = '10px';

            BARBER_HAIR_STYLES.forEach(item => {
                const currentHair = previewAvatar.hair || (previewAvatar.hat && previewAvatar.hat.startsWith('hair_') ? previewAvatar.hat : 'none');
                const isSelected = (currentHair === item.id);
                const isOwned = isItemOwned('hair', item.id) || isItemOwned('hats', item.id);

                let card = document.createElement('div');
                card.className = `barber-grid-card ${isSelected ? 'selected' : ''}`;
                card.innerHTML = `
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 20px;">${item.icon}</span>
                        <span style="
                            font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;
                            background: rgba(255, 255, 255, 0.1); color: #cbd5e1;
                        ">${item.tag}</span>
                    </div>
                    <div style="font-weight: bold; font-size: 12px; color: #f8fafc; margin-bottom: 4px;">${item.name}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                        <span style="color: ${isOwned ? '#22c55e' : '#f59e0b'}; font-weight: bold;">
                            ${isOwned ? '✅ Sahipsin' : `${item.price} TL`}
                        </span>
                        <span style="color: #ef4444; font-size: 11px; font-weight: bold;">
                            ${isSelected ? 'Seçili' : 'Dene'}
                        </span>
                    </div>
                `;
                card.addEventListener('click', () => {
                    previewAvatar.hair = item.id;
                    if (previewAvatar.hat && previewAvatar.hat.startsWith('hair_')) {
                        previewAvatar.hat = 'none';
                    }
                    playBarberSnipSound();
                    updateBarberTabsUI();
                    renderBarberMirrorPreview();
                });
                container.appendChild(card);
            });
        }
        else if (barberActiveTab === 'beard') {
            // Sakal / Yüz Izgarası (2 kolon)
            container.style.display = 'grid';
            container.style.gridTemplateColumns = 'repeat(2, 1fr)';
            container.style.gap = '10px';

            BARBER_BEARD_STYLES.forEach(item => {
                const isSelected = (previewAvatar.face === item.id);
                const isOwned = isItemOwned('faces', item.id);

                let card = document.createElement('div');
                card.className = `barber-grid-card ${isSelected ? 'selected' : ''}`;
                card.innerHTML = `
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 20px;">${item.icon}</span>
                        <span style="
                            font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;
                            background: rgba(255, 255, 255, 0.1); color: #cbd5e1;
                        ">${item.tag}</span>
                    </div>
                    <div style="font-weight: bold; font-size: 12px; color: #f8fafc; margin-bottom: 4px;">${item.name}</div>
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
                        <span style="color: ${isOwned ? '#22c55e' : '#f59e0b'}; font-weight: bold;">
                            ${isOwned ? '✅ Sahipsin' : `${item.price} TL`}
                        </span>
                        <span style="color: #ef4444; font-size: 11px; font-weight: bold;">
                            ${isSelected ? 'Seçili' : 'Dene'}
                        </span>
                    </div>
                `;
                card.addEventListener('click', () => {
                    previewAvatar.face = item.id;
                    playBarberClipperSound();
                    updateBarberTabsUI();
                    renderBarberMirrorPreview();
                });
                container.appendChild(card);
            });
        }
        else if (barberActiveTab === 'dye') {
            // Saç Boyama & Renk Seçici
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = '14px';

            // 1. Doğal Tonlar
            let natHeader = document.createElement('div');
            natHeader.style.cssText = 'font-size: 12px; font-weight: bold; color: #94a3b8; display: flex; align-items: center; gap: 6px;';
            natHeader.innerHTML = '<span>☕</span> <span>DOĞAL SAÇ TONLARI (50 TL)</span>';
            container.appendChild(natHeader);

            let natGrid = document.createElement('div');
            natGrid.style.cssText = 'display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;';

            BARBER_HAIR_DYES.filter(d => d.tag !== 'VIP Neon').forEach(dye => {
                let isSelected = (previewAvatar.hairColor === dye.hex);
                let btn = document.createElement('div');
                btn.className = `barber-dye-swatch ${isSelected ? 'selected' : ''}`;
                btn.style.background = dye.hex;
                btn.title = `${dye.name} (${dye.price} TL)`;
                btn.innerHTML = isSelected ? '<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; text-shadow: 0 1px 2px #000;">✓</div>' : '';
                btn.addEventListener('click', () => {
                    previewAvatar.hairColor = dye.hex;
                    playBarberSnipSound();
                    updateBarberTabsUI();
                    renderBarberMirrorPreview();
                });
                natGrid.appendChild(btn);
            });
            container.appendChild(natGrid);

            // 2. VIP Neon & Çılgın Renkler
            let neonHeader = document.createElement('div');
            neonHeader.style.cssText = 'font-size: 12px; font-weight: bold; color: #ec4899; display: flex; align-items: center; gap: 6px; margin-top: 6px;';
            neonHeader.innerHTML = '<span>✨</span> <span>VIP ÇILGIN NEON RENKLER (75 TL)</span>';
            container.appendChild(neonHeader);

            let neonGrid = document.createElement('div');
            neonGrid.style.cssText = 'display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px;';

            BARBER_HAIR_DYES.filter(d => d.tag === 'VIP Neon').forEach(dye => {
                let isSelected = (previewAvatar.hairColor === dye.hex);
                let btn = document.createElement('div');
                btn.className = `barber-dye-swatch ${isSelected ? 'selected' : ''}`;
                btn.style.background = dye.hex;
                btn.title = `${dye.name} (${dye.price} TL)`;
                btn.innerHTML = isSelected ? '<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; text-shadow: 0 1px 2px #000;">✓</div>' : '';
                btn.addEventListener('click', () => {
                    previewAvatar.hairColor = dye.hex;
                    playBarberSnipSound();
                    updateBarberTabsUI();
                    renderBarberMirrorPreview();
                });
                neonGrid.appendChild(btn);
            });
            container.appendChild(neonGrid);
        }

        updateCostDisplay();
    }

    /**
     * Toplam Masrafı Hesapla
     */
    function calculateTotalCost() {
        let cost = 0;
        if (!initialAvatar || !previewAvatar) return 0;

        // Saç kontrolü
        let curHair = previewAvatar.hair || (previewAvatar.hat && previewAvatar.hat.startsWith('hair_') ? previewAvatar.hat : 'none');
        let initHair = initialAvatar.hair || (initialAvatar.hat && initialAvatar.hat.startsWith('hair_') ? initialAvatar.hat : 'none');
        if (curHair !== initHair && curHair !== 'none') {
            if (!isItemOwned('hair', curHair) && !isItemOwned('hats', curHair)) {
                let h = BARBER_HAIR_STYLES.find(x => x.id === curHair);
                if (h) cost += h.price;
            }
        }

        // Sakal kontrolü
        if (previewAvatar.face !== initialAvatar.face && previewAvatar.face !== 'none') {
            if (!isItemOwned('faces', previewAvatar.face)) {
                let b = BARBER_BEARD_STYLES.find(x => x.id === previewAvatar.face);
                if (b) cost += b.price;
            }
        }

        // Saç boyası kontrolü
        if (previewAvatar.hairColor !== initialAvatar.hairColor) {
            let dye = BARBER_HAIR_DYES.find(x => x.hex === previewAvatar.hairColor);
            cost += (dye ? dye.price : 50);
        }

        return cost;
    }

    function updateCostDisplay() {
        let cost = calculateTotalCost();
        let el = document.getElementById('barberTotalCostDisplay');
        if (el) {
            if (cost === 0) {
                el.innerText = 'Ücretsiz (Sahipsin)';
                el.style.color = '#22c55e';
            } else {
                el.innerText = `${cost} TL`;
                el.style.color = '#f59e0b';
            }
        }

        // Özet rozeti güncelle
        let curHair = previewAvatar.hair || (previewAvatar.hat && previewAvatar.hat.startsWith('hair_') ? previewAvatar.hat : 'none');
        let hItem = BARBER_HAIR_STYLES.find(x => x.id === curHair);
        let bItem = BARBER_BEARD_STYLES.find(x => x.id === previewAvatar.face);

        let hEl = document.getElementById('summaryHairName');
        if (hEl) hEl.innerText = hItem ? hItem.name : (curHair === 'none' ? 'Sıfır Numara' : curHair);

        let bEl = document.getElementById('summaryBeardName');
        if (bEl) bEl.innerText = bItem ? bItem.name : (previewAvatar.face === 'none' ? 'Sinekkaydı Tıraş' : previewAvatar.face);

        let dEl = document.getElementById('summaryDyeSwatch');
        if (dEl) dEl.style.background = previewAvatar.hairColor || '#18181b';
    }

    /**
     * Aynada Canlı Önizleme Çizimi
     */
    function renderBarberMirrorPreview() {
        const canvas = document.getElementById('barberMirrorCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cX = canvas.width / 2;
        const cY = 175; // Kafa ve büst odaklı merkez

        ctx.save();
        ctx.translate(cX, cY);
        ctx.scale(2.2, 2.2);

        const av = previewAvatar || myAvatar;
        const isK2 = (av && av.model === 'karakter_2');

        // Kuaför Pelerini (Eğer açıksa boyun altına bordo lüks berber kesim örtüsü giydir)
        if (showBarberCape) {
            ctx.save();
            ctx.fillStyle = "#881337"; // Bordo kadife pelerin
            ctx.beginPath();
            ctx.ellipse(0, 16, 26, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#e11d48";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Pelerin boyun yakası
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.roundRect(-8, 3, 16, 4, 2);
            ctx.fill();
            ctx.restore();
        }

        if (isK2 && typeof Karakter2Renderer !== 'undefined') {
            Karakter2Renderer.draw(ctx, 0, 0, av, barberFacing, false, 0, 0, false, true);
        } else if (typeof drawClassic2Avatar === 'function') {
            drawClassic2Avatar(ctx, 0, 0, av, barberFacing, false, 0, 0, false, true);
        }

        ctx.restore();
    }

    /**
     * Sıfırla
     */
    function resetBarberPreview() {
        if (!initialAvatar) return;
        previewAvatar = JSON.parse(JSON.stringify(initialAvatar));
        playBarberSnipSound();
        updateBarberTabsUI();
        renderBarberMirrorPreview();
        showBarberToast("Stil başlangıç haline döndürüldü.");
    }

    /**
     * Yeni Stili Uygula & Server ile Senkronize Et
     */
    function applyBarberStyleToPlayer() {
        if (!previewAvatar) return;
        const cost = calculateTotalCost();

        playBarberSnipSound();
        playBarberClipperSound();

        // 1. Saç Değişimi
        let curHair = previewAvatar.hair || (previewAvatar.hat && previewAvatar.hat.startsWith('hair_') ? previewAvatar.hat : 'none');
        let initHair = initialAvatar.hair || (initialAvatar.hat && initialAvatar.hat.startsWith('hair_') ? initialAvatar.hat : 'none');
        if (curHair !== initHair) {
            if (typeof buyWardrobeItem === 'function') {
                buyWardrobeItem('hair', curHair);
            } else if (window.socket) {
                window.socket.emit('buyWardrobeItem', { category: 'hair', id: curHair });
            }
        }

        // 2. Sakal Değişimi
        if (previewAvatar.face !== initialAvatar.face) {
            if (typeof buyWardrobeItem === 'function') {
                buyWardrobeItem('faces', previewAvatar.face);
            } else if (window.socket) {
                window.socket.emit('buyWardrobeItem', { category: 'faces', id: previewAvatar.face });
            }
        }

        // 3. Saç Boyası Değişimi
        if (previewAvatar.hairColor !== initialAvatar.hairColor) {
            if (window.socket) {
                window.socket.emit('setAvatarHairColor', { hairColor: previewAvatar.hairColor });
            }
            if (typeof myAvatar !== 'undefined' && myAvatar) {
                myAvatar.hairColor = previewAvatar.hairColor;
            }
        }

        // Yerel avatarı güncelle
        if (typeof myAvatar !== 'undefined' && myAvatar) {
            myAvatar.hair = curHair;
            if (myAvatar.hat && myAvatar.hat.startsWith('hair_')) {
                myAvatar.hat = 'none';
            }
            myAvatar.face = previewAvatar.face;
            myAvatar.hairColor = previewAvatar.hairColor;
        }

        showBarberToast("✂️ Harika görünüyorsun! Yeni saç & sakal tarzın başarıyla uygulandı! 💈");

        setTimeout(() => {
            closeBarberStudioModal();
        }, 500);
    }

    // Global Dışa Aktarımlar
    global.BarberShopStudio = {
        open: openBarberStudioModal,
        close: closeBarberStudioModal,
        isOpen: () => isBarberModalOpen
    };

    if (typeof socket !== 'undefined' && socket) {
        socket.on('moneyUpdate', (money) => {
            const amt = (typeof money === 'object' && money !== null && money.money !== undefined) ? money.money : money;
            const num = (typeof amt === 'number') ? amt : (parseInt(amt, 10) || 0);
            window.myMoney = num;
            const bEl = document.getElementById('barberShopBalance');
            if (bEl) bEl.innerText = `${num.toLocaleString('tr-TR')} TL`;
        });
        socket.on('wardrobeUpdate', () => {
            const bEl = document.getElementById('barberShopBalance');
            if (bEl && typeof window.myMoney !== 'undefined') {
                bEl.innerText = `${window.myMoney.toLocaleString('tr-TR')} TL`;
            }
        });
    }

})(typeof window !== 'undefined' ? window : this);

