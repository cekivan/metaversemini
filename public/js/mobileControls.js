// public/js/mobileControls.js - Mobil Dokunmatik Ekran & 360° Analog Sanal Joystick
// Özellikler: Özelleştirilebilir Ekran Konumu (Default: Sağ Alt), Sürükle-Bırak Taşıma, Anlık Hafıza / LocalStorage Desteği

const MM_JOYSTICK_STORAGE_KEY = 'mm_joystick_settings';

// Varsayılan Joystick Ayarları (Kullanıcı isteğiyle varsayılan: SAĞ ALT)
const DEFAULT_JOYSTICK_SETTINGS = {
    preset: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'custom'
    customX: null,
    customY: null,
    alwaysShow: false
};

let currentJoystickSettings = { ...DEFAULT_JOYSTICK_SETTINGS };
let isJoystickDragModeActive = false;

// Ayarları LocalStorage'dan oku (Veritabanı veya sunucuya yük bindirmez)
function loadJoystickSettings() {
    try {
        let saved = localStorage.getItem(MM_JOYSTICK_STORAGE_KEY);
        if (saved) {
            let parsed = JSON.parse(saved);
            currentJoystickSettings = { ...DEFAULT_JOYSTICK_SETTINGS, ...parsed };
        }
    } catch (e) {
        currentJoystickSettings = { ...DEFAULT_JOYSTICK_SETTINGS };
    }
    return currentJoystickSettings;
}

// Ayarları kaydet (Sadece anlık yerel hafızada)
function saveJoystickSettings(settings) {
    currentJoystickSettings = { ...currentJoystickSettings, ...settings };
    try {
        localStorage.setItem(MM_JOYSTICK_STORAGE_KEY, JSON.stringify(currentJoystickSettings));
    } catch (e) {}
    applyJoystickPosition();
    checkMobileDeviceHUD();
    syncSettingsModalJoystickUI();
}

function checkMobileDeviceHUD() {
    loadJoystickSettings();
    let ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
    let maxTouch = (typeof navigator !== 'undefined' && navigator.maxTouchPoints) ? navigator.maxTouchPoints : 0;
    let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
        (typeof window !== 'undefined' && window.innerWidth <= 860) ||
        (typeof window !== 'undefined' && 'ontouchstart' in window) ||
        (maxTouch > 0);

    let shouldShow = isMobile || currentJoystickSettings.alwaysShow || isJoystickDragModeActive;

    let joy = document.getElementById('mobileControlsOverlay');
    let actionBtn = document.getElementById('mobileActionBtn');

    if (joy) joy.style.display = shouldShow ? 'block' : 'none';
    if (actionBtn) actionBtn.style.display = shouldShow ? 'flex' : 'none';

    if (shouldShow) applyJoystickPosition();
}

// Kumanda Konumunu Ekrana Uygula (Varsayılan: SAĞ ALT)
function applyJoystickPosition() {
    const joy = document.getElementById('mobileControlsOverlay');
    if (!joy) return;

    // Önceki pozisyonlama stillerini sıfırla
    joy.style.top = 'auto';
    joy.style.bottom = 'auto';
    joy.style.left = 'auto';
    joy.style.right = 'auto';

    const s = currentJoystickSettings;

    if (s.preset === 'custom' && s.customX !== null && s.customY !== null) {
        // Kullanıcının serbest sürükleyip bıraktığı özel koordinatlar
        joy.style.left = Math.max(10, Math.min(window.innerWidth - 140, s.customX)) + 'px';
        joy.style.top = Math.max(10, Math.min(window.innerHeight - 140, s.customY)) + 'px';
    } else if (s.preset === 'bottom-left') {
        // Sol Alt
        joy.style.bottom = 'clamp(40px, 10vh, 100px)';
        joy.style.left = 'clamp(16px, 4vw, 40px)';
    } else if (s.preset === 'top-right') {
        // Sağ Üst
        joy.style.top = '85px';
        joy.style.right = 'clamp(16px, 4vw, 40px)';
    } else if (s.preset === 'top-left') {
        // Sol Üst
        joy.style.top = '85px';
        joy.style.left = 'clamp(16px, 4vw, 40px)';
    } else {
        // VARSAYILAN: SAĞ ALT (Bottom-Right)
        joy.style.bottom = 'clamp(40px, 10vh, 100px)';
        joy.style.right = 'clamp(16px, 4vw, 40px)';
    }
}

// Preset Seçimi (Sağ Alt, Sol Alt, vb.)
function setJoystickPreset(preset) {
    saveJoystickSettings({ preset: preset });
    if (preset !== 'custom') {
        applyJoystickPosition();
    }
}

// Kumandayı PC / Masaüstünde de Her Zaman Gösterme Ayarı
function setJoystickAlwaysShow(enabled) {
    saveJoystickSettings({ alwaysShow: !!enabled });
}

// --- EKRANDA SERBEST TAŞIMA (SÜRÜKLE & BIRAK) MODU ---
function startJoystickDragMode() {
    isJoystickDragModeActive = true;

    // Ayarlar modalini geçici olarak kapat
    const modal = document.getElementById('settingsModal');
    if (modal) modal.style.display = 'none';

    const joy = document.getElementById('mobileControlsOverlay');
    if (!joy) return;

    joy.style.display = 'block';

    // Joystick'e taşıma modu görsel vurgusu (Parlayan sarı/cyan kesikli çerçeve)
    joy.classList.add('joystick-dragging-mode');
    joy.style.boxShadow = '0 0 25px #facc15, 0 0 45px rgba(250, 204, 21, 0.4)';
    joy.style.border = '2.5px dashed #facc15';
    joy.style.borderRadius = '50%';
    joy.style.cursor = 'grab';

    // Üstte bilgi ve onay paneli oluştur
    let helperBar = document.getElementById('joystickMoveHelperBar');
    if (!helperBar) {
        helperBar = document.createElement('div');
        helperBar.id = 'joystickMoveHelperBar';
        helperBar.style.cssText = `
            position: fixed; top: 16px; left: 50%; transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.95); border: 2px solid #facc15;
            border-radius: 14px; padding: 10px 18px; color: white; z-index: 999999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.8); backdrop-filter: blur(10px);
            display: flex; align-items: center; gap: 14px; font-family: sans-serif;
            animation: popIn 0.2s ease-out;
        `;
        document.body.appendChild(helperBar);
    }

    helperBar.innerHTML = `
        <span style="font-size: 13px; font-weight: 800; color: #facc15; display: flex; align-items: center; gap: 6px;">
            🎯 Kumandayı ekranda istediğin yere sürükle!
        </span>
        <div style="display: flex; gap: 8px;">
            <button onclick="saveJoystickCustomPosition()" style="padding: 6px 14px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer;">✓ Konumu Kaydet</button>
            <button onclick="resetJoystickToDefault()" style="padding: 6px 12px; background: rgba(255,255,255,0.1); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; font-weight: 700; font-size: 11.5px; cursor: pointer;">↺ Sağ Alta Sıfırla</button>
            <button onclick="cancelJoystickDragMode()" style="padding: 6px 10px; background: rgba(239,68,68,0.2); color: #f87171; border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; font-weight: 700; font-size: 11.5px; cursor: pointer;">✕</button>
        </div>
    `;
    helperBar.style.display = 'flex';

    // Sürükleme Olayları (Hem Dokunmatik Hem Mouse)
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialJoyLeft = 0, initialJoyTop = 0;

    const onPointerDown = (e) => {
        isDragging = true;
        joy.style.cursor = 'grabbing';
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;

        let rect = joy.getBoundingClientRect();
        initialJoyLeft = rect.left;
        initialJoyTop = rect.top;

        if (e.cancelable) e.preventDefault();
    };

    const onPointerMove = (e) => {
        if (!isDragging) return;
        let clientX = e.touches ? e.touches[0].clientX : e.clientX;
        let clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let deltaX = clientX - startX;
        let deltaY = clientY - startY;

        let newX = Math.max(10, Math.min(window.innerWidth - 140, initialJoyLeft + deltaX));
        let newY = Math.max(10, Math.min(window.innerHeight - 140, initialJoyTop + deltaY));

        joy.style.left = newX + 'px';
        joy.style.top = newY + 'px';
        joy.style.right = 'auto';
        joy.style.bottom = 'auto';

        if (e.cancelable) e.preventDefault();
    };

    const onPointerUp = () => {
        if (isDragging) {
            isDragging = false;
            joy.style.cursor = 'grab';
        }
    };

    joy._dragDown = onPointerDown;
    joy._dragMove = onPointerMove;
    joy._dragUp = onPointerUp;

    joy.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    joy.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
}

// Konumu Kaydet
function saveJoystickCustomPosition() {
    const joy = document.getElementById('mobileControlsOverlay');
    if (joy) {
        let rect = joy.getBoundingClientRect();
        saveJoystickSettings({
            preset: 'custom',
            customX: Math.round(rect.left),
            customY: Math.round(rect.top)
        });
    }
    cleanupJoystickDragMode();
}

// Sağ Alta Sıfırla
function resetJoystickToDefault() {
    saveJoystickSettings({
        preset: 'bottom-right',
        customX: null,
        customY: null
    });
    cleanupJoystickDragMode();
}

// İptal
function cancelJoystickDragMode() {
    loadJoystickSettings();
    applyJoystickPosition();
    cleanupJoystickDragMode();
}

function cleanupJoystickDragMode() {
    isJoystickDragModeActive = false;
    const joy = document.getElementById('mobileControlsOverlay');
    if (joy) {
        joy.classList.remove('joystick-dragging-mode');
        joy.style.boxShadow = '';
        joy.style.border = '';
        joy.style.borderRadius = '';
        joy.style.cursor = '';

        if (joy._dragDown) {
            joy.removeEventListener('mousedown', joy._dragDown);
            window.removeEventListener('mousemove', joy._dragMove);
            window.removeEventListener('mouseup', joy._dragUp);
            joy.removeEventListener('touchstart', joy._dragDown);
            window.removeEventListener('touchmove', joy._dragMove);
            window.removeEventListener('touchend', joy._dragUp);
            joy._dragDown = null;
        }
    }

    const helperBar = document.getElementById('joystickMoveHelperBar');
    if (helperBar) helperBar.style.display = 'none';

    checkMobileDeviceHUD();
    syncSettingsModalJoystickUI();
}

// Ayarlar penceresindeki Joystick UI durumunu senkronize et
function syncSettingsModalJoystickUI() {
    loadJoystickSettings();

    const presets = ['bottom-right', 'bottom-left', 'top-right', 'top-left'];
    presets.forEach(p => {
        const btn = document.getElementById(`joyPresetBtn_${p}`);
        if (btn) {
            if (currentJoystickSettings.preset === p) {
                btn.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8)';
                btn.style.borderColor = '#60a5fa';
                btn.style.color = '#ffffff';
                btn.style.fontWeight = '800';
            } else {
                btn.style.background = 'rgba(15, 23, 42, 0.6)';
                btn.style.borderColor = 'rgba(255,255,255,0.12)';
                btn.style.color = '#94a3b8';
                btn.style.fontWeight = '600';
            }
        }
    });

    const customBtn = document.getElementById('joyPresetBtn_custom');
    if (customBtn) {
        if (currentJoystickSettings.preset === 'custom') {
            customBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
            customBtn.style.borderColor = '#fbbf24';
            customBtn.style.color = '#ffffff';
        } else {
            customBtn.style.background = 'rgba(15, 23, 42, 0.6)';
            customBtn.style.borderColor = 'rgba(255,255,255,0.12)';
            customBtn.style.color = '#94a3b8';
        }
    }

    const alwaysShowChk = document.getElementById('settingJoystickAlwaysShow');
    if (alwaysShowChk) {
        alwaysShowChk.checked = !!currentJoystickSettings.alwaysShow;
    }
}

// Joystick Dokunmatik ve Analog Kontrol Takibi
function initMobileDpadTracking() {
    const joy = document.getElementById('mobileControlsOverlay');
    const base = document.getElementById('joystickBase');
    const knob = document.getElementById('joystickKnob');
    if (!joy || !base || !knob) return;

    let touchId = null;
    const maxRadius = 42;

    function handleTouchMove(clientX, clientY) {
        if (isJoystickDragModeActive) return; // Taşıma modundayken analog yürütme yapma
        if (typeof targetWalkPos !== 'undefined') targetWalkPos = null;

        let rect = base.getBoundingClientRect();
        let centerX = rect.left + rect.width / 2;
        let centerY = rect.top + rect.height / 2;
        let dx = clientX - centerX;
        let dy = clientY - centerY;
        let dist = Math.hypot(dx, dy);

        let angle = Math.atan2(dy, dx);
        let clampedDist = Math.min(dist, maxRadius);
        let knobX = Math.cos(angle) * clampedDist;
        let knobY = Math.sin(angle) * clampedDist;

        knob.classList.remove('returning');
        knob.style.transform = `translate(${knobX}px, ${knobY}px)`;
        base.classList.add('active');

        // Ölü bölge (deadzone)
        if (dist < 10) {
            if (typeof keys !== 'undefined') {
                keys.w = false; keys.a = false; keys.s = false; keys.d = false; keys.shift = false;
            }
            return;
        }

        if (typeof standUpIfSitting === 'function') {
            standUpIfSitting();
        }

        let nx = Math.cos(angle);
        let ny = Math.sin(angle);

        if (typeof keys !== 'undefined') {
            keys.d = (nx > 0.35);
            keys.a = (nx < -0.35);
            keys.s = (ny > 0.35);
            keys.w = (ny < -0.35);
            keys.shift = (dist >= maxRadius * 0.88); // Joystick sonuna kadar itildiğinde koşma
        }

        if (typeof calculate8WayFacing === 'function') {
            let f = calculate8WayFacing(nx, ny);
            if (f && typeof myFacing !== 'undefined') myFacing = f;
        } else {
            if (Math.abs(nx) > Math.abs(ny)) {
                if (typeof myFacing !== 'undefined') myFacing = nx > 0 ? 'right' : 'left';
            } else {
                if (typeof myFacing !== 'undefined') myFacing = ny > 0 ? 'down' : 'up';
            }
        }
    }

    function resetJoystick() {
        touchId = null;
        knob.classList.add('returning');
        knob.style.transform = 'translate(0px, 0px)';
        base.classList.remove('active');
        if (typeof keys !== 'undefined') {
            keys.w = false;
            keys.a = false;
            keys.s = false;
            keys.d = false;
            keys.shift = false;
        }
    }

    joy.addEventListener('touchstart', (e) => {
        if (isJoystickDragModeActive) return;
        if (e.changedTouches.length > 0) {
            let t = e.changedTouches[0];
            touchId = t.identifier;
            handleTouchMove(t.clientX, t.clientY);
        }
    }, { passive: false });

    joy.addEventListener('touchmove', (e) => {
        if (isJoystickDragModeActive) return;
        if (e.cancelable) e.preventDefault();
        for (let i = 0; i < e.changedTouches.length; i++) {
            let t = e.changedTouches[i];
            if (t.identifier === touchId) {
                handleTouchMove(t.clientX, t.clientY);
                break;
            }
        }
    }, { passive: false });

    const endTouch = (e) => {
        if (isJoystickDragModeActive) return;
        for (let i = 0; i < e.changedTouches.length; i++) {
            if (e.changedTouches[i].identifier === touchId) {
                resetJoystick();
                break;
            }
        }
    };

    joy.addEventListener('touchend', endTouch);
    joy.addEventListener('touchcancel', endTouch);
}

// Global olarak erişilebilir yap
window.checkMobileDeviceHUD = checkMobileDeviceHUD;
window.applyJoystickPosition = applyJoystickPosition;
window.updateMobileControlsPosition = applyJoystickPosition;
window.setJoystickPreset = setJoystickPreset;
window.setJoystickAlwaysShow = setJoystickAlwaysShow;
window.startJoystickDragMode = startJoystickDragMode;
window.saveJoystickCustomPosition = saveJoystickCustomPosition;
window.resetJoystickToDefault = resetJoystickToDefault;
window.cancelJoystickDragMode = cancelJoystickDragMode;
window.syncSettingsModalJoystickUI = syncSettingsModalJoystickUI;

// Pencere Boyutu ve Döndürme Dinleyicileri
window.addEventListener('resize', () => {
    checkMobileDeviceHUD();
    applyJoystickPosition();
    if (typeof bgCache !== 'undefined') bgCache.invalidate();
});
window.addEventListener('orientationchange', () => {
    checkMobileDeviceHUD();
    applyJoystickPosition();
    if (typeof bgCache !== 'undefined') bgCache.invalidate();
});

document.addEventListener('DOMContentLoaded', () => {
    loadJoystickSettings();
    checkMobileDeviceHUD();
    initMobileDpadTracking();
    applyJoystickPosition();
});
setTimeout(() => {
    loadJoystickSettings();
    checkMobileDeviceHUD();
    initMobileDpadTracking();
    applyJoystickPosition();
}, 400);
