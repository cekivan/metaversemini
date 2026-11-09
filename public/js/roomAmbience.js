// public/js/roomAmbience.js - Kısık Caz & Lounge Mekan Ambiyans Müziği Motoru
// Mekanlar:
// 1. Optik Butiği (optik / optika): Kısık Lüks Caz / Rhodes Lounge (66 BPM)
// 2. 101 Kafe & Kıraathane (kafe / dostlar_kiraathanesi): Nostaljik Sıcak Kafe / Akustik Tını (78 BPM)
// 3. Kumarhane (dedenin_yeri): Sofistike Ritmik Kumarhane Cazı & Walking Bass (104 BPM)
// 4. VIP Cafe (vip_club): Derin Lüks Chill Deep House / Velvet Lounge (114 BPM)

(function (window) {
    'use strict';

    // Ses Düzeyi ve Durum
    let isMuted = (typeof localStorage !== 'undefined' && localStorage.getItem('mm_roomAmbienceMuted') === 'true');
    let currentTrackName = null;
    let schedulerTimer = null;
    let nextNoteTime = 0;
    let currentStep = 0;

    // Web Audio Düğümleri
    let masterAmbienceGain = null;
    let masterFilter = null;
    const BASE_GAIN = 0.13; // Kısık, ortamı boğmayan şık arka plan seviyesi

    function getAudioCtx() {
        if (typeof window !== 'undefined' && window.audioCtx) return window.audioCtx;
        if (typeof audioCtx !== 'undefined' && audioCtx) return audioCtx;
        if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
            try {
                window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                return window.audioCtx;
            } catch (e) {}
        }
        return null;
    }

    function initAudioNodes() {
        const ctx = getAudioCtx();
        if (!ctx || masterAmbienceGain) return;

        try {
            masterFilter = ctx.createBiquadFilter();
            masterFilter.type = 'lowpass';
            masterFilter.frequency.setValueAtTime(2600, ctx.currentTime);

            masterAmbienceGain = ctx.createGain();
            const initVol = isMuted ? 0 : BASE_GAIN;
            masterAmbienceGain.gain.setValueAtTime(initVol, ctx.currentTime);

            masterFilter.connect(masterAmbienceGain);

            // Ana müzik gain düğümüne veya doğrudan hoparlöre bağla
            if (typeof window.musicGainNode !== 'undefined' && window.musicGainNode) {
                masterAmbienceGain.connect(window.musicGainNode);
            } else if (typeof musicGainNode !== 'undefined' && musicGainNode) {
                masterAmbienceGain.connect(musicGainNode);
            } else {
                masterAmbienceGain.connect(ctx.destination);
            }
        } catch (e) {
            console.warn('[RoomAmbience] Audio init uyarısı:', e);
        }
    }

    // --- ENSTRÜMAN SENTEZLEYİCİLERİ ---

    // 1. Sıcak Rhodes / Electric Piano Tınısı (Sine + Triangle + Tremolo + Velvet Release)
    function playRhodesChord(ctx, freqs, time, duration = 2.4, gainLevel = 0.08) {
        if (isMuted) return;
        freqs.forEach((freq, idx) => {
            let osc = ctx.createOscillator();
            let osc2 = ctx.createOscillator();
            let g = ctx.createGain();
            let filter = ctx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1200 + idx * 150, time);
            filter.frequency.exponentialRampToValueAtTime(450, time + duration);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(freq * 2, time); // 2. harmonik parıltı

            // Hafif stereo/idx gecikmesi ve yumuşak tuşe sönümlemesi
            let noteVol = (gainLevel / freqs.length) * (idx === 0 ? 1.2 : 0.95);
            g.gain.setValueAtTime(0.0001, time);
            g.gain.linearRampToValueAtTime(noteVol, time + 0.04);
            g.gain.exponentialRampToValueAtTime(noteVol * 0.45, time + 0.6);
            g.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            osc.connect(filter);
            osc2.connect(filter);
            filter.connect(g);
            g.connect(masterFilter);

            osc.start(time);
            osc2.start(time);
            osc.stop(time + duration + 0.05);
            osc2.stop(time + duration + 0.05);
        });
    }

    // 2. Akustik Upright / Kontrbas Tınısı (Tok Rezonanslı Sine + Pitch Drop)
    function playUprightBass(ctx, freq, time, duration = 0.65, gainLevel = 0.16) {
        if (isMuted) return;
        let osc = ctx.createOscillator();
        let g = ctx.createGain();
        let filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, time);
        filter.frequency.exponentialRampToValueAtTime(140, time + duration);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 1.015, time);
        osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);

        g.gain.setValueAtTime(0.001, time);
        g.gain.linearRampToValueAtTime(gainLevel, time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(g);
        g.connect(masterFilter);

        osc.start(time);
        osc.stop(time + duration + 0.02);
    }

    // 3. Fırça Caz Zili & Lo-Fi Snare (Soft Filtered Noise Pulse - DC Crackle Korumalı)
    function playBrushPercussion(ctx, time, duration = 0.08, gainLevel = 0.04, isCymbal = false) {
        if (isMuted) return;
        let bufferSize = Math.floor(ctx.sampleRate * duration);
        let buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * (isCymbal ? 0.45 : 0.25)));
        }

        let noise = ctx.createBufferSource();
        noise.buffer = buffer;

        let filter = ctx.createBiquadFilter();
        // Cızırtıyı ve beyaz gürültü patlamasını önlemek için lüks bandpass filtreleme
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(isCymbal ? 3200 : 1400, time);
        filter.Q.setValueAtTime(isCymbal ? 1.1 : 1.6, time);

        let g = ctx.createGain();
        // Ani DC atlaması yerine 6ms ultra yumuşak rampa ile sıfır cızırtı
        g.gain.setValueAtTime(0.0001, time);
        g.gain.linearRampToValueAtTime(gainLevel, time + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        noise.connect(filter);
        filter.connect(g);
        g.connect(masterFilter);

        noise.start(time);
        noise.stop(time + duration + 0.01);
    }

    // 4. Nostaljik Sıcak Telli / Akustik Mızrap (Pluck Strings)
    function playAcousticPluck(ctx, freq, time, duration = 0.7, gainLevel = 0.10) {
        if (isMuted) return;
        let osc = ctx.createOscillator();
        let g = ctx.createGain();
        let filter = ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.8, time);
        filter.frequency.exponentialRampToValueAtTime(freq * 0.9, time + duration);
        filter.Q.setValueAtTime(3.2, time);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        g.gain.setValueAtTime(0.001, time);
        g.gain.linearRampToValueAtTime(gainLevel, time + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(g);
        g.connect(masterFilter);

        osc.start(time);
        osc.stop(time + duration + 0.02);
    }

    // 5. Vibrafon Caz Stab (Crisp Jazz Chime & Bell)
    function playVibraphoneStab(ctx, freqs, time, duration = 0.9, gainLevel = 0.07) {
        if (isMuted) return;
        freqs.forEach((freq, i) => {
            let osc = ctx.createOscillator();
            let g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            let v = (gainLevel / freqs.length) * (1 - i * 0.1);
            g.gain.setValueAtTime(0.001, time);
            g.gain.linearRampToValueAtTime(v, time + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0001, time + duration);

            osc.connect(g);
            g.connect(masterFilter);
            osc.start(time);
            osc.stop(time + duration + 0.02);
        });
    }

    // --- 4 AYRI MEKAN MÜZİK PARÇASI SKORLARI ---

    // 1. OPTİK BUTİĞİ (Kısık Caz / Lüks Rhodes Lounge - 66 BPM, 16 Adımlık 4 Bar Döngüsü)
    // Akorlar: Dm9 -> G13 -> Cmaj9 -> Am9 / A7b13
    const TRACK_OPTIK_JAZZ = {
        name: 'optik_jazz',
        label: '🕶️ Optik Butik Caz Lounge',
        bpm: 66,
        stepDuration: (60 / 66) / 2, // 8'lik nota adımı (~0.454s)
        totalSteps: 16,
        renderStep: function (ctx, step, time) {
            // Rhodes Akorları (Her 4 adımda bir zengin caz akoru)
            if (step === 0) {
                // Dm9
                playRhodesChord(ctx, [146.83, 174.61, 220.00, 261.63, 329.63], time, 3.4, 0.09);
                playUprightBass(ctx, 73.42, time, 0.8, 0.15); // D2
            } else if (step === 4) {
                // G13
                playRhodesChord(ctx, [196.00, 246.94, 293.66, 329.63, 392.00], time, 3.4, 0.09);
                playUprightBass(ctx, 98.00, time, 0.8, 0.15); // G2
            } else if (step === 8) {
                // Cmaj9
                playRhodesChord(ctx, [130.81, 164.81, 196.00, 246.94, 293.66], time, 3.4, 0.09);
                playUprightBass(ctx, 65.41, time, 0.8, 0.15); // C2
            } else if (step === 12) {
                // Am9 / A7b13
                playRhodesChord(ctx, [110.00, 174.61, 220.00, 261.63, 329.63], time, 3.4, 0.09);
                playUprightBass(ctx, 110.00, time, 0.8, 0.15); // A2
            }

            // Bas Yürüyüş Geçişleri (Walking Bass Passing Notes)
            if (step === 2) playUprightBass(ctx, 110.00, time, 0.5, 0.11); // A2
            if (step === 6) playUprightBass(ctx, 123.47, time, 0.5, 0.11); // B2
            if (step === 10) playUprightBass(ctx, 82.41, time, 0.5, 0.11); // E2
            if (step === 14) playUprightBass(ctx, 123.47, time, 0.5, 0.11); // B2

            // Kısık fırça vuruşu (Soft Brush Snare on beats 2 & 4 -> steps 2, 6, 10, 14)
            if (step % 4 === 2) {
                playBrushPercussion(ctx, time, 0.09, 0.035, false);
            }
            // Çok hafif arka plan ride zili
            if (step % 2 === 0) {
                playBrushPercussion(ctx, time, 0.06, 0.015, true);
            }
        }
    };

    // 2. 101 KAFE & KIRAATHANE (Nostaljik Sıcak Kafe & Akustik Tını - 78 BPM, 16 Adım)
    // Nihavend / Sıcak Akustik Melodi & Ud/Gitar Tınısı
    const TRACK_KAFE_NOSTALGIA = {
        name: 'kafe_nostalgia',
        label: '☕ 101 Kafe & Kıraathane Nostaljisi',
        bpm: 78,
        stepDuration: (60 / 78) / 2, // ~0.384s
        totalSteps: 16,
        melodyNotes: [
            293.66, 0, 329.63, 349.23,  // D4, -, E4, F4
            392.00, 440.00, 392.00, 349.23, // G4, A4, G4, F4
            329.63, 349.23, 293.66, 0,  // E4, F4, D4, -
            261.63, 293.66, 220.00, 293.66  // C4, D4, A3, D4
        ],
        bassNotes: [
            146.83, 0, 0, 146.83,
            196.00, 0, 0, 196.00,
            146.83, 0, 0, 146.83,
            110.00, 0, 130.81, 146.83
        ],
        renderStep: function (ctx, step, time) {
            let note = this.melodyNotes[step];
            if (note > 0) {
                playAcousticPluck(ctx, note, time, 0.55, 0.08);
            }

            let bass = this.bassNotes[step];
            if (bass > 0) {
                playUprightBass(ctx, bass * 0.5, time, 0.6, 0.12);
            }

            // Sıcak ahşap masa tıkırtısı (Warm Wood Tap)
            if (step === 0 || step === 8) {
                playBrushPercussion(ctx, time, 0.05, 0.025, false);
            }
            if (step === 4 || step === 12) {
                playBrushPercussion(ctx, time, 0.07, 0.020, false);
            }
        }
    };

    // 3. KUMARHANE (Sofistike Ritmik Kumarhane Cazı & Swung Walking Bass - 104 BPM, 16 Adım)
    const TRACK_CASINO_GROOVE = {
        name: 'casino_groove',
        label: '🎰 Dedenin Yeri Kumarhane Cazı',
        bpm: 104,
        stepDuration: (60 / 104) / 2, // ~0.288s
        totalSteps: 16,
        bassWalk: [
            130.81, 164.81, 174.61, 185.00, // C3, E3, F3, F#3
            196.00, 233.08, 246.94, 261.63, // G3, Bb3, B3, C4
            261.63, 233.08, 196.00, 174.61, // C4, Bb3, G3, F3
            164.81, 146.83, 138.59, 130.81  // E3, D3, C#3, C3
        ],
        renderStep: function (ctx, step, time) {
            // Canlı Walking Bass her adımda
            let bFreq = this.bassWalk[step];
            playUprightBass(ctx, bFreq * 0.5, time, 0.32, 0.15);

            // Vibrafon Caz Vuruşları (Syncopated Stabs on beats 2 & 4)
            if (step === 3) {
                playVibraphoneStab(ctx, [329.63, 392.00, 523.25], time, 0.7, 0.06); // Em
            } else if (step === 7) {
                playVibraphoneStab(ctx, [349.23, 440.00, 523.25], time, 0.7, 0.06); // F
            } else if (step === 11) {
                playVibraphoneStab(ctx, [392.00, 493.88, 587.33], time, 0.7, 0.06); // G
            } else if (step === 15) {
                playVibraphoneStab(ctx, [261.63, 329.63, 392.00], time, 0.7, 0.06); // C
            }

            // Swung Jazz Ride Zil
            if (step % 2 === 0 || step % 4 === 3) {
                playBrushPercussion(ctx, time, 0.06, 0.022, true);
            }
        }
    };

    // 4. VIP CAFE & SPEAKEASY (Derin Lüks Chill Deep House / Lounge - 114 BPM, 16 Adım)
    const TRACK_VIP_LOUNGE = {
        name: 'vip_lounge',
        label: '🍸 VIP Speakeasy Chill Lounge',
        bpm: 114,
        stepDuration: (60 / 114) / 2, // ~0.263s
        totalSteps: 16,
        renderStep: function (ctx, step, time) {
            // Kadife Analog Filtreli Synth Pad (Her 4 adımda)
            if (step === 0) {
                // Fm9
                playRhodesChord(ctx, [174.61, 207.65, 261.63, 311.13, 349.23], time, 2.8, 0.08);
            } else if (step === 4) {
                // Abmaj7
                playRhodesChord(ctx, [207.65, 261.63, 311.13, 392.00], time, 2.8, 0.08);
            } else if (step === 8) {
                // Bbm9
                playRhodesChord(ctx, [116.54, 174.61, 233.08, 277.18, 349.23], time, 2.8, 0.08);
            } else if (step === 12) {
                // C7alt
                playRhodesChord(ctx, [130.81, 164.81, 196.00, 233.08, 293.66], time, 2.8, 0.08);
            }

            // Derin Sub Bass Darbesi (Offbeat Chill Pulse)
            if (step === 2 || step === 6 || step === 10 || step === 14) {
                playUprightBass(ctx, 43.65, time, 0.45, 0.17); // F1 Sub
            }

            // Kısık Lounge Shaker / Rimshot (Step 0'da asla çalmaz, mekana girişte tertemiz kadife Rhodes tınısı başlar)
            if (step !== 0 && step % 2 === 0) {
                playBrushPercussion(ctx, time, 0.04, 0.014, true);
            }
            if (step === 4 || step === 12) {
                playBrushPercussion(ctx, time, 0.05, 0.022, false);
            }
        }
    };

    const ROOM_TRACK_MAP = {
        'optik': TRACK_OPTIK_JAZZ,
        'optika': TRACK_OPTIK_JAZZ,
        'kafe': TRACK_KAFE_NOSTALGIA,
        'dostlar_kiraathanesi': TRACK_KAFE_NOSTALGIA,
        'dedenin_yeri': TRACK_CASINO_GROOVE,
        'vip_club': TRACK_VIP_LOUNGE
    };

    // --- ZAMANLAYICI VE DÖNGÜ YÖNETİCİSİ ---

    function scheduleMusic() {
        const ctx = getAudioCtx();
        if (!ctx) return;

        let activeTrack = ROOM_TRACK_MAP[currentTrackName];
        if (!activeTrack) return;

        // Sekme arka planda kaldığında veya gecikmelerde ses patlamasını ve UI donmasını engelle
        if (nextNoteTime < ctx.currentTime) {
            nextNoteTime = ctx.currentTime + 0.04;
        }

        // Gelecek 0.25 saniyelik aralığı önceden zamanla (Sample-accurate lookahead)
        while (nextNoteTime < ctx.currentTime + 0.25) {
            try {
                activeTrack.renderStep(ctx, currentStep, nextNoteTime);
            } catch (err) {
                console.warn('[RoomAmbience] Nota çalma hatası:', err);
            }

            nextNoteTime += activeTrack.stepDuration;
            currentStep = (currentStep + 1) % activeTrack.totalSteps;
        }
    }

    function startTrack(trackName) {
        initAudioNodes();
        const ctx = getAudioCtx();
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        currentTrackName = trackName;
        currentStep = 0;
        nextNoteTime = ctx.currentTime + 0.12;

        if (schedulerTimer) clearInterval(schedulerTimer);
        schedulerTimer = setInterval(scheduleMusic, 80);

        // Pürüzsüz Fade-In (Geçişte ses yavaşça yükselir, sıfır tıklama / DC patlaması)
        if (masterAmbienceGain) {
            const targetGain = isMuted ? 0 : BASE_GAIN;
            masterAmbienceGain.gain.cancelScheduledValues(ctx.currentTime);
            masterAmbienceGain.gain.setValueAtTime(0.0001, ctx.currentTime);
            masterAmbienceGain.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 1.2);
        }

        updateToggleUI();
    }

    function stopTrack(fadeDuration = 0.8) {
        const ctx = getAudioCtx();
        if (masterAmbienceGain && ctx) {
            masterAmbienceGain.gain.cancelScheduledValues(ctx.currentTime);
            masterAmbienceGain.gain.linearRampToValueAtTime(0, ctx.currentTime + fadeDuration);
        }

        setTimeout(() => {
            if (schedulerTimer) {
                clearInterval(schedulerTimer);
                schedulerTimer = null;
            }
            currentTrackName = null;
            updateToggleUI();
        }, fadeDuration * 1000);
    }

    function onRoomChange(newRoom) {
        if (!newRoom) return;
        const targetTrack = ROOM_TRACK_MAP[newRoom];

        if (targetTrack) {
            if (currentTrackName === newRoom) return; // Zaten çalıyor
            if (currentTrackName) {
                // Başka bir mekandan geçiş: Yumuşak geçiş
                stopTrack(0.4);
                setTimeout(() => startTrack(newRoom), 450);
            } else {
                startTrack(newRoom);
            }
        } else {
            // Müziksiz mekana geçiş
            if (currentTrackName) {
                stopTrack(0.8);
            }
        }
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('mm_roomAmbienceMuted', isMuted ? 'true' : 'false');
        }

        const ctx = getAudioCtx();
        if (masterAmbienceGain && ctx) {
            const target = isMuted ? 0 : BASE_GAIN;
            masterAmbienceGain.gain.cancelScheduledValues(ctx.currentTime);
            masterAmbienceGain.gain.linearRampToValueAtTime(target, ctx.currentTime + 0.2);
        }

        updateToggleUI();

        if (typeof window.showGameNotification === 'function') {
            window.showGameNotification(isMuted ? '🔇 Mekan Müziği Sessize Alındı' : '🎵 Mekan Müziği Açıldı');
        }
    }

    // --- ŞIK, ETKİLEŞİMLİ EKRAN ÜSTÜ MÜZİK KONTROLÜ (HUD FLOATING PILL) ---
    function updateToggleUI() {
        let pill = document.getElementById('room-music-pill');
        const activeTrack = ROOM_TRACK_MAP[currentTrackName];

        if (!activeTrack) {
            if (pill) pill.style.display = 'none';
            return;
        }

        if (!pill) {
            pill = document.createElement('div');
            pill.id = 'room-music-pill';
            pill.style.cssText = `
                position: fixed;
                top: 14px;
                right: 24px;
                background: rgba(15, 23, 42, 0.90);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(56, 189, 248, 0.4);
                border-radius: 20px;
                padding: 6px 14px;
                color: #e2e8f0;
                font-family: 'Segoe UI', Tahoma, sans-serif;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                z-index: 10001;
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.5);
                transition: all 0.2s ease;
                user-select: none;
            `;
            pill.title = 'Mekan Ambiyans Müziğini Aç / Kapat (Opsiyonel)';
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMute();
            });
            document.body.appendChild(pill);
        }

        pill.style.display = 'flex';
        if (isMuted) {
            pill.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            pill.innerHTML = `
                <span style="font-size: 14px;">🔇</span>
                <span style="color: #94a3b8;">${activeTrack.label} (Kapalı)</span>
            `;
        } else {
            pill.style.borderColor = 'rgba(56, 189, 248, 0.6)';
            pill.innerHTML = `
                <span style="font-size: 14px; animation: pulse 2s infinite;">🎵</span>
                <span style="color: #38bdf8; font-weight: 600;">${activeTrack.label}</span>
                <span style="font-size: 10px; background: rgba(56, 189, 248, 0.2); color: #7dd3fc; padding: 2px 6px; border-radius: 10px;">Açık</span>
            `;
        }
    }

    // Kullanıcı ilk etkileşiminde AudioContext'i canlandır
    const unlockListener = () => {
        const ctx = getAudioCtx();
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
        const cRoom = (typeof window.currentRoom !== 'undefined' ? window.currentRoom : (typeof currentRoom !== 'undefined' ? currentRoom : null));
        if (cRoom && ROOM_TRACK_MAP[cRoom] && !currentTrackName) {
            onRoomChange(cRoom);
        }
    };
    ['click', 'keydown', 'touchstart'].forEach(evt => window.addEventListener(evt, unlockListener, { once: true, passive: true }));

    // Global Dışa Aktarımlar
    window.roomAmbience = {
        onRoomChange: onRoomChange,
        toggleMute: toggleMute,
        startTrack: startTrack,
        stopTrack: stopTrack,
        isMuted: () => isMuted
    };
    window.updateRoomAmbienceMusic = onRoomChange;

})(typeof window !== 'undefined' ? window : this);
