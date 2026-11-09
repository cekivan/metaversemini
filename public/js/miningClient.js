// public/js/miningClient.js - 2.5D İzometrik Madencilik, Anti-Bot Refleks Mini-Oyunu, Cabbar Borsası ve Elmas İstemci Motoru

(function () {
    const MINING_SWEET_SPOT_WIDTH = 0.35; // %35 Genişlik (Kolaylaştırılmış Hedef Bölgesi)
    const MINING_CURSOR_SPEED = 0.020;    // Rahat takip edilebilir akıcı kayma hızı

    
    const DEFAULT_NODES = [
        { id: 0, x: 220, y: 220, state: 'ACTIVE', respawnAt: null },
        { id: 1, x: 380, y: 200, state: 'ACTIVE', respawnAt: null },
        { id: 2, x: 560, y: 190, state: 'ACTIVE', respawnAt: null },
        { id: 3, x: 740, y: 210, state: 'ACTIVE', respawnAt: null },
        { id: 4, x: 870, y: 270, state: 'ACTIVE', respawnAt: null },
        { id: 5, x: 190, y: 320, state: 'ACTIVE', respawnAt: null },
        { id: 6, x: 420, y: 340, state: 'ACTIVE', respawnAt: null },
        { id: 7, x: 680, y: 330, state: 'ACTIVE', respawnAt: null },
        { id: 8, x: 880, y: 410, state: 'ACTIVE', respawnAt: null },
        { id: 9, x: 260, y: 460, state: 'ACTIVE', respawnAt: null },
        { id: 10, x: 520, y: 470, state: 'ACTIVE', respawnAt: null },
        { id: 11, x: 750, y: 490, state: 'ACTIVE', respawnAt: null }
    ];

    const state = {
        nodes: [...DEFAULT_NODES],
        ores: { komur: 0, bakir: 0, demir: 0 },
        diamonds: 0,
        pickaxeExpiresAt: null,
        prices: { komur: 15, bakir: 35, demir: 80 },
        pickaxeCost: 200,

        // Anti-Bot Refleks Mini-Oyunu
        strikeCooldownUntil: 0,
        miniGame: {
            active: false,
            nodeId: -1,
            hits: 0,
            maxHits: 1,
            targetStart: 0.40,
            targetWidth: MINING_SWEET_SPOT_WIDTH,
            cursor: 0.0,
            cursorDir: 1,
            stunUntil: 0,
            shakeOffset: 0
        },

        hoveredNodeId: -1,
        particles: [],
        floatingTexts: []
    };

    /**
     * Rastgele Hedef Bölgesi (Sweet Spot: %20 ile %75 arası)
     */
    function randomizeSweetSpot() {
        state.miniGame.targetStart = 0.15 + Math.random() * (0.80 - 0.15 - MINING_SWEET_SPOT_WIDTH);
        state.miniGame.targetWidth = MINING_SWEET_SPOT_WIDTH;
    }

    /**
     * Mini-Oyunu Başlatır
     */
    function startMiniGame(nodeId) {
        // Hatalı Vuruş 3 Saniye Ceza Kontrolü
        if (state.strikeCooldownUntil && Date.now() < state.strikeCooldownUntil) {
            const secLeft = Math.ceil((state.strikeCooldownUntil - Date.now()) / 1000);
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("⏳ Yanlış vurdun! " + secLeft + " sn vurma engeli var.", "error");
            }
            return;
        }

        // Kazma Süre Kontrolü
        if (!state.pickaxeExpiresAt || Date.now() > state.pickaxeExpiresAt) {
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("❌ Kazman yok veya süresi dolmuş! Cabbar'dan yeni bir kazma al.", "error");
            }
            return;
        }

        const node = state.nodes.find(n => n.id === nodeId);
        if (!node || node.state !== 'ACTIVE') {
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("Bu maden kayası şu an aktif değil!", "warning");
            }
            return;
        }

        state.miniGame.active = true;
        state.miniGame.nodeId = nodeId;
        state.miniGame.hits = 0;
        state.miniGame.cursor = 0.1;
        state.miniGame.cursorDir = 1;
        state.miniGame.stunUntil = 0;
        state.miniGame.shakeOffset = 0;
        state.miniGame.openedAt = Date.now();
        randomizeSweetSpot();

        // Karakteri mining eylemine al
        if (typeof socket !== 'undefined' && socket && typeof players !== 'undefined' && players[socket.id]) {
            players[socket.id].action = 'mining';
        }

        if (typeof showFloatingToast === 'function') {
            showFloatingToast("⛏️ Yeşil alana denk getirince [SPACE] veya Sol Tık'a bas!", "info");
        }
    }

    /**
     * Mini-Oyunu Durdurur
     */
    function stopMiniGame() {
        state.miniGame.active = false;
        state.miniGame.nodeId = -1;
        state.miniGame.hits = 0;

        if (typeof socket !== 'undefined' && socket && typeof players !== 'undefined' && players[socket.id]) {
            if (players[socket.id].action === 'mining') {
                players[socket.id].action = null;
            }
        }
    }

    /**
     * Vuruş Denemesi (SPACE veya Tıklama)
     */
    function attemptHit() {
        if (!state.miniGame.active) return false;

        const now = Date.now();
        if (state.strikeCooldownUntil && now < state.strikeCooldownUntil) {
            const secLeft = Math.ceil((state.strikeCooldownUntil - now) / 1000);
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("⏳ Hatalı vuruş engeli! Bekle: " + secLeft + "s", "error");
            }
            return true;
        }

        if (now < state.miniGame.stunUntil) {
            const secLeft = Math.ceil((state.miniGame.stunUntil - now) / 1000);
            if (typeof showFloatingToast === 'function') {
                showFloatingToast(`⏳ Sersemledin! Bekle: ${secLeft}s`, "error");
            }
            return true;
        }

        const mg = state.miniGame;
        const targetEnd = mg.targetStart + mg.targetWidth;

        const node = state.nodes.find(n => n.id === mg.nodeId);
        const nodeX = node ? node.x : 500;
        const nodeY = node ? node.y : 300;

        // İsabet Kontrolü
        if (mg.cursor >= mg.targetStart && mg.cursor <= targetEnd) {
            // 🎯 BAŞARILI VURUŞ (1/1) - TEK VURUŞTA ANINDA DÜŞÜŞ!
            mg.hits = 1;
            spawnSparks(nodeX, nodeY - 10, '#38bdf8', 18);
            addFloatingText(nodeX, nodeY - 35, "⚡ İSABET! KAYA KIRILDI (1/1)", "#38bdf8");

            if (typeof socket !== 'undefined' && socket) {
                socket.emit('mine_node_complete', { nodeId: mg.nodeId });
            }

            stopMiniGame();
        } else {
            // ISKA - 3 Saniye Vurma Engeli (Başkası alabilsin diye mini oyunu kapatır ve 3 sn kilitler)
            const penaltyMs = 3000;
            state.strikeCooldownUntil = now + penaltyMs;
            spawnSparks(nodeX, nodeY - 10, '#ef4444', 10);
            addFloatingText(nodeX, nodeY - 35, "❌ ISKA! 3 SN ENGEL", "#ef4444");
            if (typeof socket !== 'undefined' && socket) {
                socket.emit('mine_node_miss', { nodeId: mg.nodeId });
            }
            if (typeof showFloatingToast === 'function') {
                showFloatingToast("❌ Hatalı vuruş! 3 saniye maden vurma engeli aldın.", "error");
            }
            stopMiniGame();
        }

        return true;
    }

    /**
     * Kıvılcım & Moloz Partikülleri
     */
    function spawnSparks(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            state.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1.2,
                color: color,
                size: 2 + Math.random() * 2.5,
                alpha: 1.0,
                life: 30 + Math.random() * 20
            });
        }
    }

    /**
     * Havada Süzülen Ödül / Durum Metinleri
     */
    function addFloatingText(x, y, text, color) {
        state.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color,
            alpha: 1.0,
            vy: -1.2,
            life: 60
        });
    }

    /**
     * Mini-Refleks Barı Çizimi (Canvas)
     */
    function drawMiniGame(ctx) {
        const mg = state.miniGame;
        if (!mg.active) return;

        const node = state.nodes.find(n => n.id === mg.nodeId);
        if (!node) return;

        // İmleç Hareketi
        const now = Date.now();
        if (now >= mg.stunUntil) {
            mg.cursor += mg.cursorDir * MINING_CURSOR_SPEED;
            if (mg.cursor >= 1.0) {
                mg.cursor = 1.0;
                mg.cursorDir = -1;
            } else if (mg.cursor <= 0.0) {
                mg.cursor = 0.0;
                mg.cursorDir = 1;
            }
        }

        const barW = 140;
        const barH = 16;
        const barX = node.x - barW / 2 + mg.shakeOffset;
        const barY = node.y - 65;

        ctx.save();

        // 1. Bar Arka Planı
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 6);
        ctx.fill();
        ctx.strokeStyle = (now < mg.stunUntil) ? "#ef4444" : "#475569";
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // 2. Yeşil Başarı Bölgesi (Sweet Spot: %18)
        const sweetX = barX + mg.targetStart * barW;
        const sweetW = mg.targetWidth * barW;

        const sweetGrad = ctx.createLinearGradient(sweetX, barY, sweetX + sweetW, barY);
        sweetGrad.addColorStop(0, "#16a34a");
        sweetGrad.addColorStop(0.5, "#22c55e");
        sweetGrad.addColorStop(1, "#16a34a");
        ctx.fillStyle = sweetGrad;
        ctx.beginPath();
        ctx.roundRect(sweetX, barY + 2, sweetW, barH - 4, 3);
        ctx.fill();

        // 3. Vuruş İlerleme Noktaları (Hits: 1/3, 2/3, 3/3)
        const hitText = `VURUŞ: ${mg.hits}/${mg.maxHits}`;
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 8px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(hitText, barX + barW / 2, barY - 6);

        // 4. Beyaz İbre / İmleç (Cursor)
        const curX = barX + mg.cursor * barW;
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 6;
        ctx.fillRect(curX - 2, barY - 2, 4, barH + 4);
        ctx.shadowBlur = 0;

        // Sersemleme Uyarısı
        if (now < mg.stunUntil) {
            const secLeft = Math.ceil((mg.stunUntil - now) / 1000);
            ctx.fillStyle = "#ef4444";
            ctx.font = "bold 8.5px sans-serif";
            ctx.fillText(`⏳ SERSEMLEDİN (${secLeft}s)`, barX + barW / 2, barY + barH + 12);
        } else {
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            ctx.fillStyle = "#38bdf8";
            ctx.font = "bold 7.5px sans-serif";
            ctx.fillText(isTouchDevice ? "DOKUN veya [✋] İLE VUR" : "SOL TIK VEYA [SPACE] İLE VUR", barX + barW / 2, barY + barH + 12);
        }

        ctx.restore();
    }

    /**
     * Efekt ve Partikül Güncelleme & Çizimi
     */
    function drawEffects(ctx) {
        ctx.save();

        // Partiküller
        for (let i = state.particles.length - 1; i >= 0; i--) {
            const p = state.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12; // Yerçekimi
            p.alpha -= (1.0 / p.life);

            if (p.alpha <= 0) {
                state.particles.splice(i, 1);
                continue;
            }

            ctx.fillStyle = p.color;
            ctx.globalAlpha = Math.max(0, p.alpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Havada Süzülen Metinler
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
            const ft = state.floatingTexts[i];
            ft.y += ft.vy;
            ft.alpha -= (1.0 / ft.life);

            if (ft.alpha <= 0) {
                state.floatingTexts.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = Math.max(0, ft.alpha);
            ctx.fillStyle = ft.color;
            ctx.font = "bold 11px sans-serif";
            ctx.textAlign = "center";
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 6;
            ctx.fillText(ft.text, ft.x, ft.y);
            ctx.shadowBlur = 0;
        }

        ctx.restore();
    }

    /**
     * HUD (Üst Bar) Güncellemesi: Elmas ve Kazma Süresi
     */
    function updateHUD() {
        // 1. Elmas Bakiyesi
        const diamondEl = document.getElementById('myDiamonds');
        if (diamondEl) {
            diamondEl.textContent = state.diamonds || 0;
        }

        // 2. Kazma Süre Sayacı
        const badgeEl = document.getElementById('pickaxeTimerBadge');
        const textEl = document.getElementById('pickaxeTimerText');

        if (badgeEl && textEl) {
            const now = Date.now();
            if (state.pickaxeExpiresAt && state.pickaxeExpiresAt > now) {
                const diffMs = state.pickaxeExpiresAt - now;
                const totalSec = Math.floor(diffMs / 1000);
                const mins = Math.floor(totalSec / 60);
                const secs = totalSec % 60;
                const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

                textEl.textContent = formatted;
                badgeEl.style.display = 'inline-flex';
                badgeEl.style.color = '#38bdf8';
                badgeEl.style.borderColor = '#0284c7';
                badgeEl.title = `Madenci Kazması Aktif (Kalan: ${formatted})`;
            } else {
                textEl.textContent = "";
                badgeEl.style.display = 'none';
                badgeEl.title = "";
            }
        }
    }

    /**
     * Maden Borsası & Cabbar Menüsü (Aç / Kapat)
     */
    function openMiningShopModal() {
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('get_mine_state');
        }
        const modal = document.getElementById('miningShopModal');
        if (!modal) return;

        // Fiyatları ve envanteri UI'a bas
        const kCount = state.ores.komur || 0;
        const bCount = state.ores.bakir || 0;
        const dCount = state.ores.demir || 0;

        const kTotal = kCount * state.prices.komur;
        const bTotal = bCount * state.prices.bakir;
        const dTotal = dCount * state.prices.demir;
        const grandTotal = kTotal + bTotal + dTotal;

        document.getElementById('cabbarCoalCount').textContent = kCount;
        document.getElementById('cabbarCopperCount').textContent = bCount;
        document.getElementById('cabbarIronCount').textContent = dCount;

        document.getElementById('cabbarSellAllTotal').textContent = grandTotal;

        // Kazma Durumu ve Buton Kontrolü
        const now = Date.now();
        const pickaxeInfo = document.getElementById('cabbarPickaxeStatus');
        const buyBtn = document.getElementById('cabbarBuyPickaxeBtn');
        const hasActivePickaxe = !!(state.pickaxeExpiresAt && state.pickaxeExpiresAt > now);

        if (pickaxeInfo) {
            if (hasActivePickaxe) {
                const minsLeft = Math.ceil((state.pickaxeExpiresAt - now) / 60000);
                pickaxeInfo.innerHTML = `<span style="color: #22c55e; font-weight: bold;">Aktif (${minsLeft} dk kaldı)</span>`;
            } else {
                pickaxeInfo.innerHTML = `<span style="color: #ef4444; font-weight: bold;">Kazma Yok / Kırıldı</span>`;
            }
        }

        if (buyBtn) {
            if (hasActivePickaxe) {
                const minsLeft = Math.ceil((state.pickaxeExpiresAt - now) / 60000);
                buyBtn.disabled = true;
                buyBtn.style.opacity = '0.65';
                buyBtn.style.cursor = 'not-allowed';
                buyBtn.style.background = '#475569';
                buyBtn.style.boxShadow = 'none';
                buyBtn.innerHTML = `✅ Kazman Var (${minsLeft} dk)`;
            } else {
                buyBtn.disabled = false;
                buyBtn.style.opacity = '1';
                buyBtn.style.cursor = 'pointer';
                buyBtn.style.background = 'linear-gradient(135deg, #0ea5e9, #0284c7)';
                buyBtn.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.35)';
                buyBtn.innerHTML = `Kazma Al (200 TL)`;
            }
        }

        modal.style.display = 'flex';
    }

    function closeMiningShopModal() {
        const modal = document.getElementById('miningShopModal');
        if (modal) modal.style.display = 'none';
    }

    /**
     * Kazma Satın Al Butonu Tıklaması
     */
    function buyPickaxe() {
        const now = Date.now();
        if (state.pickaxeExpiresAt && state.pickaxeExpiresAt > now) {
            const minsLeft = Math.ceil((state.pickaxeExpiresAt - now) / 60000);
            if (typeof showFloatingToast === 'function') {
                showFloatingToast(`⛏️ Zaten aktif bir kazman var! (${minsLeft} dakika kaldı)`, 'warning');
            }
            return;
        }
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('buy_pickaxe');
        }
    }

    /**
     * Belirli Bir Cevheri Sat
     */
    function sellSingleOre(oreType) {
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('sell_ores', { oreType: oreType });
        }
    }

    /**
     * Tüm Cevherleri Sat
     */
    function sellAllOres() {
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('sell_ores', { oreType: 'all' });
        }
    }

    /**
     * Global Elmas Jackpot Bildirim Banner'ı Gösterimi
     */
    function showGlobalDiamondBanner(playerName) {
        const banner = document.getElementById('globalDiamondBanner');
        const nameEl = document.getElementById('diamondJackpotWinner');
        if (banner && nameEl) {
            nameEl.textContent = playerName;
            banner.style.display = 'flex';

            // 8 Saniye sonra otomatik kapat
            setTimeout(() => {
                banner.style.display = 'none';
            }, 8000);
        }

        // Ekranın ortasında kristal havai fişek patlat
        const cx = (typeof canvasWidth !== 'undefined') ? canvasWidth / 2 : 500;
        const cy = (typeof canvasHeight !== 'undefined') ? canvasHeight / 2 : 300;
        spawnSparks(cx, cy, '#38bdf8', 35);
        spawnSparks(cx, cy, '#facc15', 25);
    }

    /**
     * İstemci Başlatıcı & Olay Dinleyicileri
     */
    function init() {
        // Her saniye HUD güncellemesi
        setInterval(updateHUD, 1000);

        // Klavye [SPACE] Dinleyicisi ([E] tuşu main.js içerisindeki triggerMobileInteract -> handleMobileInteract üzerinden tek merkezden yönetilir)
        window.addEventListener('keydown', (e) => {
            if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;

            if (e.code === 'Space') {
                if (state.miniGame.active) {
                    e.preventDefault();
                    attemptHit();
                }
            }
        });

        // Canvas Tıklama & Dokunma Dinleyicisi (Capture fazında çalışarak mobilde karakterin yürüyüp uzaklaşmasını önler)
        const gameCanvas = document.getElementById('gameCanvas');
        if (gameCanvas) {
            gameCanvas.addEventListener('pointerdown', (e) => {
                if (!e.isPrimary) return;
                if (e.pointerType === 'mouse' && e.button !== 0) return;

                if (state.miniGame.active) {
                    if (Date.now() - (state.miniGame.openedAt || 0) < 200) return;
                    if (e.cancelable) e.preventDefault();
                    e.stopPropagation();
                    attemptHit();
                    return;
                }

                if (typeof currentRoom !== 'undefined' && currentRoom === 'mine_cave') {
                    let clickX, clickY;
                    if (typeof window.getCanvasEventCoords === 'function') {
                        const coords = window.getCanvasEventCoords(e);
                        clickX = coords.x;
                        clickY = coords.y;
                    } else {
                        const rect = gameCanvas.getBoundingClientRect();
                        const scaleX = gameCanvas.width / (rect.width || 1);
                        const scaleY = gameCanvas.height / (rect.height || 1);
                        clickX = (e.clientX - rect.left) * scaleX;
                        clickY = (e.clientY - rect.top) * scaleY;
                    }

                    // Cabbar Tıklaması
                    if (Math.hypot(clickX - 180, clickY - 440) < 55) {
                        if (e.cancelable) e.preventDefault();
                        e.stopPropagation();
                        openMiningShopModal();
                        return;
                    }

                    // Maden Kayası Tıklaması
                    const clickedNode = state.nodes.find(n => Math.hypot(clickX - n.x, clickY - n.y) < 44);
                    if (clickedNode && clickedNode.state === 'ACTIVE') {
                        const myPlayer = (typeof players !== 'undefined' && typeof socket !== 'undefined' && socket && players[socket.id]) ? players[socket.id] : null;
                        if (myPlayer && Math.hypot(myPlayer.x - clickedNode.x, myPlayer.y - clickedNode.y) < 85) {
                            if (e.cancelable) e.preventDefault();
                            e.stopPropagation();
                            startMiniGame(clickedNode.id);
                            return;
                        } else if (typeof showFloatingToast === 'function') {
                            showFloatingToast("Kayaya yaklaşınca tekrar dokun veya [✋] butonuna bas!", "info");
                        }
                    }
                }
            }, true);

            // Fare Gezinme (Hover)
            gameCanvas.addEventListener('mousemove', (e) => {
                if (typeof currentRoom !== 'undefined' && currentRoom === 'mine_cave') {
                    const rect = gameCanvas.getBoundingClientRect();
                    const scaleX = gameCanvas.width / rect.width;
                    const scaleY = gameCanvas.height / rect.height;
                    const mx = (e.clientX - rect.left) * scaleX;
                    const my = (e.clientY - rect.top) * scaleY;

                    const hNode = state.nodes.find(n => Math.hypot(mx - n.x, my - n.y) < 40);
                    state.hoveredNodeId = hNode ? hNode.id : -1;
                }
            });
        }

        // Socket Olayları
        if (typeof socket !== 'undefined' && socket) {
            // Giriş Başarılı Paketinde Verileri Al
            socket.on('loginSuccess', (data) => {
                if (data.diamonds !== undefined) state.diamonds = data.diamonds;
                if (data.ores) state.ores = data.ores;
                if (data.pickaxeExpiresAt !== undefined) state.pickaxeExpiresAt = data.pickaxeExpiresAt;
                if (typeof players !== 'undefined' && typeof socket !== 'undefined' && socket && players[socket.id]) {
                    players[socket.id].heldItem = 'kazma';
                }
                if (data.money !== undefined && typeof updateMoneyDisplay === 'function') {
                    updateMoneyDisplay(data.money);
                }
                updateHUD();
                socket.emit('get_mine_state');
            });

            // Maden Durumu Verisi
            socket.on('mine_state_data', (data) => {
                if (data.nodes) state.nodes = data.nodes;
                if (data.ores) state.ores = data.ores;
                if (data.diamonds !== undefined) state.diamonds = data.diamonds;
                if (data.pickaxeExpiresAt !== undefined) state.pickaxeExpiresAt = data.pickaxeExpiresAt;
                if (data.prices) state.prices = data.prices;
                if (data.pickaxeCost) state.pickaxeCost = data.pickaxeCost;
                updateHUD();
            });

            // Maden Kayaları Güncellemesi (Respawn veya Genel Durum)
            socket.on('mine_nodes_update', (data) => {
                if (data.nodes) state.nodes = data.nodes;
            });

            // Tekil Kaya Tükendi
            socket.on('mine_node_depleted', (data) => {
                const node = state.nodes.find(n => n.id === data.nodeId);
                if (node) {
                    node.state = 'DEPLETED';
                    node.respawnAt = data.respawnAt;
                }
                if (state.miniGame.active && state.miniGame.nodeId === data.nodeId) {
                    stopMiniGame();
                    if (typeof showFloatingToast === 'function') {
                        showFloatingToast("⛏️ Bu kaya başka bir madenci tarafından kırıldı!", "warning");
                    }
                }
            });

            // Kazma Satın Alındı
            socket.on('pickaxe_bought', (data) => {
                state.pickaxeExpiresAt = data.pickaxeExpiresAt;
                updateHUD();
                if (document.getElementById('miningShopModal').style.display === 'flex') {
                    openMiningShopModal(); // UI'ı yenile
                }
            });

            // Kazma Süresi Doldu
            socket.on('pickaxe_expired', () => {
                state.pickaxeExpiresAt = null;
                updateHUD();
                stopMiniGame();
            });

            // Kazı Ödülü Geldi
            socket.on('mine_drop_result', (data) => {
                if (data.ores) state.ores = data.ores;
                if (data.diamonds !== undefined) state.diamonds = data.diamonds;
                updateHUD();

                const node = state.nodes.find(n => n.id === data.nodeId);
                const rx = node ? node.x : 500;
                const ry = node ? node.y : 300;

                if (data.isDiamond) {
                    addFloatingText(rx, ry - 30, `💎 +1 ULTRA NADİR ELMAS!`, '#38bdf8');
                    spawnSparks(rx, ry - 20, '#38bdf8', 25);
                } else {
                    addFloatingText(rx, ry - 20, `+1 ${data.dropName}`, data.dropColor || '#e2e8f0');
                    spawnSparks(rx, ry - 15, data.dropColor || '#e2e8f0', 8);
                }
            });

            // Cevherler Satıldı
            socket.on('ores_sold', (data) => {
                if (data.newOres) state.ores = data.newOres;
                updateHUD();
                if (document.getElementById('miningShopModal').style.display === 'flex') {
                    openMiningShopModal(); // UI'ı yenile
                }
            });

            // Global Elmas Anonsu
            socket.on('global_diamond_drop', (data) => {
                showGlobalDiamondBanner(data.playerName);
            });
        }
    }

    // Odaya girildiğinde maden durumunu iste
    window.requestMineState = function () {
        if (typeof socket !== 'undefined' && socket) {
            socket.emit('get_mine_state');
        }
    };

    // Mobil [✋] ve Klavye [E] Etkileşimi İçin Maden Yakınlık ve Vuruş Desteği
    function handleMobileInteract() {
        if (state.miniGame.active) {
            // Mini oyun henüz yeni açıldıysa (ilk basış anı), anında vuruş yapmayı önle (debounce)
            if (Date.now() - (state.miniGame.openedAt || 0) < 250) {
                return true;
            }
            attemptHit();
            return true;
        }
        if (typeof currentRoom !== 'undefined' && currentRoom === 'mine_cave') {
            const myPlayer = (typeof players !== 'undefined' && typeof socket !== 'undefined' && socket && players[socket.id]) ? players[socket.id] : null;
            if (!myPlayer) return false;
            if (Math.hypot(myPlayer.x - 180, myPlayer.y - 440) < 75) {
                openMiningShopModal();
                return true;
            }
            let nearest = null;
            let minD = 88;
            for (const n of state.nodes) {
                if (n.state !== 'ACTIVE') continue;
                const d = Math.hypot(myPlayer.x - n.x, myPlayer.y - n.y);
                if (d < minD) {
                    minD = d;
                    nearest = n;
                }
            }
            if (nearest) {
                startMiniGame(nearest.id);
                return true;
            }
        }
        return false;
    }

    // Global dışa aktarma
    window.miningClient = {
        state,
        get nodes() { return state.nodes; },
        drawMiniGame,
        drawEffects,
        openMiningShopModal,
        closeMiningShopModal,
        buyPickaxe,
        sellSingleOre,
        sellAllOres,
        startMiniGame,
        attemptHit,
        handleMobileInteract,
        init
    };

    // Sayfa yüklendiğinde başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
