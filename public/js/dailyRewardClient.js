// public/js/dailyRewardClient.js - Kompakt Günlük Giriş Ödülü (Taslak 3: Odak Kartı, Değişen Seri Ateşi & Yarın Teaser)
(function () {
    let currentStatus = null;
    let isClaiming = false;
    let rewardParticlesAnimFrame = null;
    let isInitialized = false;
    let autoPopupPending = false;
    let hasAutoPoppedThisSession = false;
    let countdownInterval = null;

    // Web Audio API Zafer / Ödül Çanı Melodisi
    function playRewardChime() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);

                gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.09);
                gain.gain.exponentialRampToValueAtTime(0.28, ctx.currentTime + i * 0.09 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.45);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(ctx.currentTime + i * 0.09);
                osc.stop(ctx.currentTime + i * 0.09 + 0.46);
            });
        } catch (e) {
            console.warn('[DailyReward] Ses çalınamadı:', e);
        }
    }

    // Parçacık Patlama Efekti (Altın Paralar, Parlayan Mavi Elmaslar, Metalik Konfeti & Yıldızlar)
    function spawnRewardParticles() {
        const canvas = document.getElementById('dailyRewardCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Devam eden önceki animasyon döngüsü varsa güvenle iptal et (çift döngü ve donma bug'ını önler)
        if (rewardParticlesAnimFrame) {
            cancelAnimationFrame(rewardParticlesAnimFrame);
            rewardParticlesAnimFrame = null;
        }

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        canvas.width = Math.floor(viewW * dpr);
        canvas.height = Math.floor(viewH * dpr);
        canvas.style.width = viewW + 'px';
        canvas.style.height = viewH + 'px';
        canvas.style.display = 'block';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Patlamanın odak noktası: Ödül Sandığı / Odak Kartı
        let originX = viewW / 2;
        let originY = viewH / 2;
        const chestEl = document.getElementById('drChestIcon') || document.querySelector('.dr-today-card');
        if (chestEl) {
            const rect = chestEl.getBoundingClientRect();
            originX = rect.left + rect.width / 2;
            originY = rect.top + rect.height / 2;
            // Sandığa ve karta kutlama vuruş animasyonu
            chestEl.classList.remove('dr-chest-punch');
            void chestEl.offsetWidth; // Reflow
            chestEl.classList.add('dr-chest-punch');
            setTimeout(() => chestEl.classList.remove('dr-chest-punch'), 750);
        }
        const cardEl = document.querySelector('.dr-today-card');
        if (cardEl) {
            cardEl.classList.remove('dr-card-punch');
            void cardEl.offsetWidth;
            cardEl.classList.add('dr-card-punch');
            setTimeout(() => cardEl.classList.remove('dr-card-punch'), 750);
        }

        const particles = [];

        // 1. Şok Dalgası Halkaları (İlk patlama enerjisi)
        particles.push({
            type: 'shockwave',
            x: originX,
            y: originY,
            rMin: 8,
            rMax: 130,
            color: '#facc15',
            life: 1.0,
            decay: 0.04
        });
        particles.push({
            type: 'shockwave',
            x: originX,
            y: originY,
            rMin: 15,
            rMax: 190,
            color: '#38bdf8',
            life: 1.0,
            decay: 0.03
        });

        // 2. 3D Dönen Altın Paralar (₺)
        const coinCount = 22;
        for (let i = 0; i < coinCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 7 + Math.random() * 10;
            particles.push({
                type: 'coin',
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3.5, // Hafif yukarı eğim
                drag: 0.942,
                gravity: 0.22,
                size: 19 + Math.random() * 8,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.08,
                flipAngle: Math.random() * Math.PI * 2,
                flipSpeed: 0.08 + Math.random() * 0.12,
                life: 1.0,
                decay: 0.009 + Math.random() * 0.004,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.05,
                drift: 0.6
            });
        }

        // 3. Parlayan Fasetli Mavi Elmaslar (💎)
        const diamondCount = 16;
        for (let i = 0; i < diamondCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 6.5 + Math.random() * 9.5;
            particles.push({
                type: 'diamond',
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4,
                drag: 0.945,
                gravity: 0.20,
                size: 17 + Math.random() * 8,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.06,
                flipAngle: Math.random() * Math.PI * 2,
                flipSpeed: 0.07 + Math.random() * 0.1,
                life: 1.0,
                decay: 0.0095 + Math.random() * 0.004,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.04,
                drift: 0.5
            });
        }

        // 4. Renkli Metalik Konfeti Şeritleri
        const confettiColors = ['#10b981', '#ec4899', '#f59e0b', '#06b6d4', '#8b5cf6', '#3b82f6', '#f43f5e', '#fef08a'];
        const confettiCount = 28;
        for (let i = 0; i < confettiCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 8 + Math.random() * 11;
            particles.push({
                type: 'confetti',
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 4.5,
                drag: 0.932,
                gravity: 0.17,
                w: 7 + Math.random() * 5,
                h: 12 + Math.random() * 7,
                color: confettiColors[i % confettiColors.length],
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.09,
                flipAngle: Math.random() * Math.PI * 2,
                flipSpeed: 0.09 + Math.random() * 0.14,
                life: 1.0,
                decay: 0.008 + Math.random() * 0.004,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.07,
                drift: 1.2
            });
        }

        // 5. Işıltılı Altın Yıldız Parıltıları (✨)
        const sparkleCount = 14;
        for (let i = 0; i < sparkleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 4 + Math.random() * 8;
            particles.push({
                type: 'sparkle',
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                drag: 0.92,
                gravity: 0.07,
                size: 11 + Math.random() * 8,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: 0.08,
                life: 1.0,
                decay: 0.015 + Math.random() * 0.008
            });
        }

        function update() {
            ctx.clearRect(0, 0, viewW, viewH);
            let activeCount = 0;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.life <= 0) continue;
                activeCount++;

                // Fizik: Hava Direnci (Drag) + Yerçekimi
                if (p.drag) {
                    p.vx *= p.drag;
                    p.vy *= p.drag;
                }
                if (p.gravity) {
                    p.vy += p.gravity;
                }
                p.x += p.vx || 0;
                p.y += p.vy || 0;

                // Salınım / Aerodinamik Hava Kayması (Drift)
                if (p.wobbleSpeed) {
                    p.wobble += p.wobbleSpeed;
                    p.x += Math.sin(p.wobble) * (p.drift || 0.5);
                }

                if (p.rotationSpeed) p.rotation += p.rotationSpeed;
                if (p.flipSpeed) p.flipAngle += p.flipSpeed;
                p.life -= p.decay;

                // Yumuşak Çıkış Ölçeği (Ömrünün son %25'inde küçülerek kaybolur)
                const fadeScale = p.life < 0.25 ? Math.max(0, p.life / 0.25) : 1;
                const alpha = Math.max(0, Math.min(1, p.life));

                // 1. Şok Dalgası Çizimi
                if (p.type === 'shockwave') {
                    const swProgress = Math.max(0, Math.min(1, 1 - p.life));
                    const currentRadius = p.rMin + (p.rMax - p.rMin) * swProgress;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = p.color;
                    ctx.lineWidth = Math.max(1, 4 * (1 - swProgress));
                    ctx.globalAlpha = alpha * 0.85;
                    ctx.stroke();
                    ctx.restore();
                }
                // 2. 3D Dönen Altın Para Çizimi
                else if (p.type === 'coin') {
                    const scaleX = Math.cos(p.flipAngle);
                    const r = (p.size / 2) * fadeScale;
                    if (r > 0.5) {
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation);
                        ctx.scale(scaleX, 1);
                        ctx.globalAlpha = alpha;

                        const coinGrad = ctx.createLinearGradient(-r, -r, r, r);
                        coinGrad.addColorStop(0, '#fef08a');
                        coinGrad.addColorStop(0.35, '#facc15');
                        coinGrad.addColorStop(0.75, '#eab308');
                        coinGrad.addColorStop(1, '#ca8a04');
                        ctx.fillStyle = coinGrad;
                        ctx.beginPath();
                        ctx.arc(0, 0, r, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.lineWidth = 1.2;
                        ctx.strokeStyle = '#fef9c3';
                        ctx.stroke();

                        if (Math.abs(scaleX) > 0.35) {
                            ctx.beginPath();
                            ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2);
                            ctx.lineWidth = 0.8;
                            ctx.strokeStyle = 'rgba(161, 98, 7, 0.65)';
                            ctx.stroke();

                            ctx.fillStyle = '#854d0e';
                            ctx.font = `bold ${Math.round(r * 0.92)}px sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('₺', 0, 1);
                        }
                        ctx.restore();
                    }
                }
                // 3. Parlayan Fasetli Mavi Elmas Çizimi (Vektörel Mücevher)
                else if (p.type === 'diamond') {
                    const scaleX = Math.cos(p.flipAngle);
                    const s = p.size * fadeScale;
                    if (s > 0.5) {
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation);
                        ctx.scale(scaleX, 1);
                        ctx.globalAlpha = alpha;

                        const w = s * 0.95;
                        const h = s * 0.8;
                        const topW = w * 0.55;
                        const yTop = -h * 0.45;
                        const yMid = -h * 0.08;
                        const yBot = h * 0.55;

                        // Alt Pavyon (Üçgen)
                        const gemGrad = ctx.createLinearGradient(0, yMid, 0, yBot);
                        gemGrad.addColorStop(0, '#38bdf8');
                        gemGrad.addColorStop(1, '#0284c7');
                        ctx.fillStyle = gemGrad;
                        ctx.beginPath();
                        ctx.moveTo(-w / 2, yMid);
                        ctx.lineTo(w / 2, yMid);
                        ctx.lineTo(0, yBot);
                        ctx.closePath();
                        ctx.fill();

                        // Üst Taç (Yamuk)
                        const crownGrad = ctx.createLinearGradient(0, yTop, 0, yMid);
                        crownGrad.addColorStop(0, '#e0f2fe');
                        crownGrad.addColorStop(0.5, '#7dd3fc');
                        crownGrad.addColorStop(1, '#38bdf8');
                        ctx.fillStyle = crownGrad;
                        ctx.beginPath();
                        ctx.moveTo(-topW / 2, yTop);
                        ctx.lineTo(topW / 2, yTop);
                        ctx.lineTo(w / 2, yMid);
                        ctx.lineTo(-w / 2, yMid);
                        ctx.closePath();
                        ctx.fill();

                        // Faset Hatları
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(-topW / 2, yTop);
                        ctx.lineTo(topW / 2, yTop);
                        ctx.moveTo(0, yMid);
                        ctx.lineTo(0, yBot);
                        ctx.moveTo(-topW / 4, yTop);
                        ctx.lineTo(0, yMid);
                        ctx.lineTo(topW / 4, yTop);
                        ctx.stroke();

                        // Işıltı Noktası
                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.arc(-topW / 3, yTop + 2, 1.4, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.restore();
                    }
                }
                // 4. Metalik Konfeti Şeridi Çizimi
                else if (p.type === 'confetti') {
                    const scaleX = Math.cos(p.flipAngle);
                    const w = p.w * fadeScale;
                    const h = p.h * fadeScale;
                    if (w > 0.5 && h > 0.5) {
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation);
                        ctx.scale(scaleX, 1);
                        ctx.globalAlpha = alpha;
                        ctx.fillStyle = p.color;
                        ctx.fillRect(-w / 2, -h / 2, w, h);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                        ctx.fillRect(-w / 2, -h / 2, w * 0.28, h);
                        ctx.restore();
                    }
                }
                // 5. Işıltılı Altın Yıldız Çizimi
                else if (p.type === 'sparkle') {
                    const r = p.size * (p.life < 0.35 ? p.life / 0.35 : 1);
                    if (r > 0.5) {
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate(p.rotation);
                        ctx.globalAlpha = alpha;
                        ctx.fillStyle = '#fef08a';
                        ctx.shadowColor = '#facc15';
                        ctx.shadowBlur = 6;
                        ctx.beginPath();
                        for (let s = 0; s < 4; s++) {
                            const a = (s * Math.PI) / 2;
                            const aMid = a + Math.PI / 4;
                            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                            ctx.lineTo(Math.cos(aMid) * (r * 0.22), Math.sin(aMid) * (r * 0.22));
                        }
                        ctx.closePath();
                        ctx.fill();
                        ctx.restore();
                    }
                }
            }

            if (activeCount > 0) {
                rewardParticlesAnimFrame = requestAnimationFrame(update);
            } else {
                canvas.style.display = 'none';
                ctx.clearRect(0, 0, viewW, viewH);
                rewardParticlesAnimFrame = null;
            }
        }

        rewardParticlesAnimFrame = requestAnimationFrame(update);
    }

    // Türkiye Saati (UTC+3) Geceyarısına Kalan Süre
    function getTimeUntilMidnightTR() {
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const trNow = new Date(utcTime + (3 * 3600000));

        const trTomorrow = new Date(trNow);
        trTomorrow.setDate(trTomorrow.getDate() + 1);
        trTomorrow.setHours(0, 0, 0, 0);

        const diffMs = Math.max(0, trTomorrow.getTime() - trNow.getTime());
        const hours = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        const secs = Math.floor((diffMs % 60000) / 1000);
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // Geri Sayım Canlı Güncelleyici
    function startCountdownTicker() {
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            const timerEl = document.getElementById('drCountdownTimer');
            if (timerEl) {
                timerEl.textContent = getTimeUntilMidnightTR();
            }
        }, 1000);
    }

    function stopCountdownTicker() {
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }

    // 🔥 SERİ ATEŞİ (STREAK) KADEMELİ RENK MOTORU
    function updateStreakBadge(streakCount) {
        const badge = document.getElementById('drStreakBadge');
        const countEl = document.getElementById('drStreakCount');
        if (!badge || !countEl) return;

        countEl.textContent = streakCount;

        // Eski tier sınıflarını temizle
        badge.classList.remove('dr-streak-tier-1', 'dr-streak-tier-2', 'dr-streak-tier-3', 'dr-streak-tier-4', 'dr-streak-tier-5');

        if (streakCount >= 30) {
            badge.classList.add('dr-streak-tier-5');
            badge.title = `${streakCount} Günlük Seri! (Tanrısal / Efsanevi Gökkuşağı Alevi)`;
        } else if (streakCount >= 15) {
            badge.classList.add('dr-streak-tier-4');
            badge.title = `${streakCount} Günlük Seri! (Buzul Plazma Mavi Alev)`;
        } else if (streakCount >= 8) {
            badge.classList.add('dr-streak-tier-3');
            badge.title = `${streakCount} Günlük Seri! (Mistik Mor Alev)`;
        } else if (streakCount >= 4) {
            badge.classList.add('dr-streak-tier-2');
            badge.title = `${streakCount} Günlük Seri! (Kızıl Kor Alevi)`;
        } else {
            badge.classList.add('dr-streak-tier-1');
            badge.title = `${streakCount} Günlük Seri! (Altın Amber Alevi)`;
        }
    }

    // İstemci Soket Başlatıcı
    function initDailyRewardClient() {
        if (isInitialized) return;
        if (!window.socket) {
            setTimeout(initDailyRewardClient, 100);
            return;
        }
        isInitialized = true;

        // 1. Durum Yanıtı
        window.socket.on('dailyReward:status', (status) => {
            currentStatus = status;
            renderModal(status);

            // Eğer 5 saniyelik otomatik açılış bekliyorsa
            if (autoPopupPending) {
                autoPopupPending = false;
                if (status.canClaim && !hasAutoPoppedThisSession) {
                    hasAutoPoppedThisSession = true;
                    openModal();
                }
            }

            updateFloatingBadge();
        });

        // 2. Ödül Başarıyla Alındı
        window.socket.on('dailyReward:claimed', (data) => {
            isClaiming = false;
            playRewardChime();
            spawnRewardParticles();

            // Güncel durumu yenile
            if (currentStatus) {
                currentStatus.canClaim = false;
                currentStatus.currentDay = data.day;
                currentStatus.freezesUsed = data.freezesUsed;
                currentStatus.isStreakBroken = false;
                currentStatus.canFreeze = false;
                renderModal(currentStatus);
            }

            updateFloatingBadge();

            // Sosyal Bildirim Toastı
            if (typeof window.showSocialNotificationToast === 'function') {
                window.showSocialNotificationToast('🎁', 'Günlük Giriş Ödülü', `${data.day}. Gün Ödülü: +${data.rewardMoney.toLocaleString('tr-TR')} TL & +${data.rewardDiamonds} 💎`);
            } else if (typeof window.showFloatingToast === 'function') {
                window.showFloatingToast(`🎁 ${data.day}. Gün Ödülü Alındı: +${data.rewardMoney.toLocaleString('tr-TR')} TL & +${data.rewardDiamonds} 💎`);
            }
        });

        // 3. Hata Bildirimi
        window.socket.on('dailyReward:error', (err) => {
            isClaiming = false;
            const btns = document.querySelectorAll('.dr-btn-claim, .dr-btn-freeze, .dr-btn-reset');
            btns.forEach(b => {
                b.disabled = false;
                b.style.opacity = '1';
                b.style.pointerEvents = 'auto';
            });
            const msg = (err && err.message) ? err.message : 'Bir hata oluştu!';
            if (typeof window.showSocialNotificationToast === 'function') {
                window.showSocialNotificationToast('⚠️', 'Günlük Ödül', msg);
            } else if (typeof window.showFloatingToast === 'function') {
                window.showFloatingToast(`⚠️ ${msg}`);
            } else {
                alert(msg);
            }
        });

        // Oturum değiştiğinde otomatik açılış bayrağını sıfırla
        window.socket.on('loginSuccess', () => {
            hasAutoPoppedThisSession = false;
        });

        // Escape tuşu ile modal kapatma desteği
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modal = document.getElementById('dailyRewardModal');
                if (modal && modal.style.display === 'flex') {
                    closeModal();
                }
            }
        });
    }

    // Floating Badge Göster/Gizle
    function updateFloatingBadge() {
        const badge = document.getElementById('drFloatingBadge');
        if (!badge) return;
        const modal = document.getElementById('dailyRewardModal');
        const isModalOpen = modal && modal.style.display === 'flex';

        if (currentStatus && currentStatus.canClaim && !isModalOpen) {
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    // 5 Saniyelik Otomatik Kontrol (Login sonrası çağrılır)
    function checkAndShow() {
        if (!window.socket) return;
        autoPopupPending = true;
        window.socket.emit('dailyReward:getStatus');
    }

    function openModal() {
        const modal = document.getElementById('dailyRewardModal');
        if (!modal) return;
        modal.style.display = 'flex';
        updateFloatingBadge();

        if (currentStatus) {
            renderModal(currentStatus);
        }
        if (window.socket) {
            window.socket.emit('dailyReward:getStatus');
        }
    }

    function closeModal() {
        const modal = document.getElementById('dailyRewardModal');
        if (modal) modal.style.display = 'none';
        isModalOpen = false;
        stopCountdownTicker();

        // Parçacık animasyonunu güvenle durdur ve tuvali temizle
        if (rewardParticlesAnimFrame) {
            cancelAnimationFrame(rewardParticlesAnimFrame);
            rewardParticlesAnimFrame = null;
        }
        const canvas = document.getElementById('dailyRewardCanvas');
        if (canvas) {
            canvas.style.display = 'none';
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        updateFloatingBadge();
    }

    // Sandık ve Aşama İkon Yardımcısı
    function getChestIconForDay(day) {
        if (day === 30) return '👑';
        if (day === 21) return '🧰';
        if (day === 14) return '📦';
        if (day === 7) return '🎁';
        return '🎁';
    }

    function getMilestoneTitleForDay(day) {
        if (day === 7) return '1. Hafta Kutusu';
        if (day === 14) return '2. Hafta Sandığı';
        if (day === 21) return '3. Hafta Hazinesi';
        if (day === 30) return 'Aylık Efsanevi Kasa';
        return null;
    }

    // KOMPAKT MODALI RENDER ET (TASLAK 3)
    function renderModal(status) {
        if (!status) return;

        // 1. Gün ve Seri Hesaplama
        let todayDay = 1;
        let streakCount = 0;
        let tomorrowDay = 2;

        if (status.canClaim) {
            todayDay = status.hardReset ? 1 : (status.nextDay || 1);
            streakCount = status.currentDay || 0;
            tomorrowDay = (todayDay % 30) + 1;
        } else {
            // Bugün zaten alındı
            todayDay = status.currentDay || 1;
            streakCount = status.currentDay || 1;
            tomorrowDay = status.nextDay || ((todayDay % 30) + 1);
        }

        // Seri Ateşi (Streak) Rozeti Güncelle
        updateStreakBadge(streakCount);

        // 2. Bugünün Ödül Bilgileri
        const todayMoney = todayDay * 500;
        const todayDiamonds = todayDay * 1;
        const todayMilestone = getMilestoneTitleForDay(todayDay);

        const chestEl = document.getElementById('drChestIcon');
        const badgeEl = document.getElementById('drTodayBadge');
        const titleEl = document.getElementById('drTodayTitle');
        const moneyTextEl = document.getElementById('drRewardMoneyText');
        const diamondTextEl = document.getElementById('drRewardDiamondText');

        if (chestEl) chestEl.textContent = getChestIconForDay(todayDay);
        if (badgeEl) badgeEl.textContent = `BUGÜN: ${todayDay}. GÜN`;
        if (titleEl) {
            titleEl.textContent = todayMilestone ? `⭐ ${todayMilestone}` : 'Giriş Hediyesi';
        }
        if (moneyTextEl) moneyTextEl.textContent = `+${todayMoney.toLocaleString('tr-TR')} TL`;
        if (diamondTextEl) diamondTextEl.textContent = `+${todayDiamonds} Elmas`;

        // 3. Aksiyon Alanı (Buton / Alındı Kutusu / Can Simidi)
        const actionContainer = document.getElementById('drActionContainer');
        if (actionContainer) {
            actionContainer.innerHTML = '';

            if (!status.canClaim) {
                // Alındı Kutusu ve Canlı Geceyarısı Sayacı
                actionContainer.innerHTML = `
                    <div class="dr-claimed-box">
                        <div class="dr-claimed-header">✔ Bugünkü Ödülün Alındı!</div>
                        <div class="dr-claimed-timer">
                            <span>⏳ Yeni ödüle kalan:</span>
                            <strong id="drCountdownTimer">${getTimeUntilMidnightTR()}</strong>
                        </div>
                    </div>
                `;
                startCountdownTicker();
            } else if (status.isStreakBroken && status.canFreeze && !status.hardReset) {
                // Seri Bozuldu: Can Simidi Kullanımı
                stopCountdownTicker();
                const freezeCost = status.freezeCost || 10;
                actionContainer.innerHTML = `
                    <div class="dr-action-row">
                        <button class="dr-btn dr-btn-freeze" onclick="window.DailyRewardClient.claim(true)">
                            🛟 Can Simidiyle Seriyi Koru (💎 ${freezeCost} Elmas) • ${todayDay}. Gün
                        </button>
                        <button class="dr-btn dr-btn-reset" onclick="window.DailyRewardClient.claim(false)">
                            🔄 1. Günden Devam Et
                        </button>
                    </div>
                `;
            } else {
                // Normal Ödül Alma Butonu
                stopCountdownTicker();
                actionContainer.innerHTML = `
                    <button class="dr-btn dr-btn-claim" onclick="window.DailyRewardClient.claim(false)">
                        🎁 ${todayDay}. Gün Ödülünü Topla!
                    </button>
                `;
            }
        }

        // 4. Alt Teaser: Yarının Ödülü
        const tomorrowMoney = tomorrowDay * 500;
        const tomorrowDiamonds = tomorrowDay * 1;
        const tomorrowMilestone = getMilestoneTitleForDay(tomorrowDay);

        const tomorrowDayText = document.getElementById('drTomorrowDayText');
        const tomorrowRewardText = document.getElementById('drTomorrowRewardText');
        const tomorrowMilestoneBadge = document.getElementById('drTomorrowMilestoneBadge');

        if (tomorrowDayText) tomorrowDayText.textContent = `${tomorrowDay}. Gün:`;
        if (tomorrowRewardText) tomorrowRewardText.textContent = `+${tomorrowMoney.toLocaleString('tr-TR')} TL & +${tomorrowDiamonds} 💎`;
        if (tomorrowMilestoneBadge) {
            if (tomorrowMilestone) {
                tomorrowMilestoneBadge.style.display = 'inline-block';
                tomorrowMilestoneBadge.textContent = `⭐ ${tomorrowMilestone}`;
            } else {
                tomorrowMilestoneBadge.style.display = 'none';
            }
        }
    }

    // Ödül Talep Etme
    function claim(useFreeze = false) {
        if (!window.socket || isClaiming) return;
        isClaiming = true;

        const btns = document.querySelectorAll('.dr-btn-claim, .dr-btn-freeze, .dr-btn-reset');
        btns.forEach(b => {
            b.disabled = true;
            b.style.opacity = '0.6';
            b.style.pointerEvents = 'none';
        });

        window.socket.emit('dailyReward:claim', { useFreeze: !!useFreeze });
    }

    // Dışarıya Açılan API
    window.DailyRewardClient = {
        init: initDailyRewardClient,
        getStatus: () => currentStatus,
        checkAndShow,
        openModal,
        closeModal,
        renderModal,
        claim,
        updateStreakBadge,
        spawnRewardParticles
    };

    // DOM Hazır Olduğunda Başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDailyRewardClient);
    } else {
        initDailyRewardClient();
    }
})();
