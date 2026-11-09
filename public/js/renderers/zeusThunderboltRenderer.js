// public/js/renderers/zeusThunderboltRenderer.js
// ⚡ ZEUS'UN ŞİMŞEĞİ (ZEUS'S THUNDERBOLT - OLYMPIAN GOLDEN JAVELIN)
// Thor: Love & Thunder / Klasik Mitolojik Çift Taraflı Zikzak Altın Şimşek Mızrağı
// %100 8-Yönlü (8D) İzometrik 2.5D Derinlik, Çift Yüzlü 3D Pah/Eğim (Beveled Ridge),
// İlahi Altın & Mavi Elektrik Arkları, Karakter 1, 2 ve 3 Eklemli El Entegrasyonu.

(function (window) {
    'use strict';

    /**
     * Zeus'un İlahi Altın Şimşeği Silah Çizim Motoru
     * @param {CanvasRenderingContext2D} ctx - Çizim bağlamı
     * @param {number} x - Merkez X
     * @param {number} y - Merkez Y
     * @param {number} scale - Ölçek (Standart elde: 1.0 - 1.25, Önizleme/VFX: 1.5 - 2.5)
     * @param {number} angle - Dönme açısı (Radyan)
     * @param {string} facing - 8 yön ('down', 'down-right', 'right', 'up-right', 'up', 'up-left', 'left', 'down-left')
     * @param {object} options - Ek efekt ayarları { showAura: true, showArcs: true, glowIntensity: 1.0, isBackView: false }
     */
    function drawGoldenThunderbolt(ctx, x, y, scale = 1.0, angle = 0, facing = 'down', options = {}) {
        if (!ctx) return;

        const now = Date.now();
        const showAura = options.showAura !== false;
        const showArcs = options.showArcs !== false;
        const glow = options.glowIntensity || 1.0;

        // 8 Yöne göre perspektif ve derinlik açıları
        const f = (typeof normalize8WayFacing === 'function') ? normalize8WayFacing(facing) : (facing || 'down');
        const isBack = (f === 'up' || f === 'up-right' || f === 'up-left') || options.isBackView;
        const isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(scale, scale);

        // 1. İLAHİ OLİMPOS ALTIN AURASI & IŞIMA HALKASI (Divine Golden Bloom)
        if (showAura) {
            const auraPulse = (Math.sin(now / 140) + 1) * 0.5;
            const auraRadius = 26 + auraPulse * 6;

            // Dış Altın & Turkuaz Elektrik Aurası
            const auraGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, auraRadius);
            auraGrad.addColorStop(0, `rgba(254, 240, 138, ${0.65 * glow})`);
            auraGrad.addColorStop(0.35, `rgba(250, 204, 21, ${0.45 * glow})`);
            auraGrad.addColorStop(0.7, `rgba(56, 189, 248, ${0.25 * glow})`);
            auraGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');

            ctx.save();
            ctx.fillStyle = auraGrad;
            ctx.beginPath();
            ctx.ellipse(0, 0, 14, 38, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Kabza çevresinde dönen mikroskopik elektrik enerji halkası
            const ringRot = (now * 0.004);
            ctx.save();
            ctx.rotate(ringRot);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.8 * glow})`;
            ctx.lineWidth = 1.2;
            ctx.shadowColor = '#38bdf8';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.ellipse(0, 0, 11, 4.5, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Halka üstünde dönen 2 minik plazma kıvılcımı
            for (let k = 0; k < 2; k++) {
                const ka = ringRot * 2 + k * Math.PI;
                const kx = Math.cos(ka) * 11;
                const ky = Math.sin(ka) * 4.5;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(kx, ky, 1.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        // ==============================================================
        // 2. MONOLİTİK ALTIN ŞİMŞEK GÖVDESİ & 3D PAH/EĞİM (BEVELED RIDGES)
        // Thor: Love and Thunder monolitik tek parça çift yönlü altın şimşek
        // Toplam Boy: 72px (-36'dan +36'ya)
        // ==============================================================

        // Işık kaynağı: Üst-Sol (Sol yüzey parlak, Sağ yüzey gölgeli)
        // Arka bakışta (isBack) gölge ve ışık yönü terslenir
        const lightGrad = ctx.createLinearGradient(-10, -36, 10, 36);
        if (!isBack) {
            lightGrad.addColorStop(0, '#ffffff'); // Uçta tepe specular beyazı
            lightGrad.addColorStop(0.12, '#fef08a'); // Parlak Olimpos sarısı
            lightGrad.addColorStop(0.45, '#facc15'); // Saf altın
            lightGrad.addColorStop(0.75, '#eab308'); // Islak altın
            lightGrad.addColorStop(1, '#ca8a04'); // Zengin kehribar altın
        } else {
            lightGrad.addColorStop(0, '#fde047');
            lightGrad.addColorStop(0.5, '#eab308');
            lightGrad.addColorStop(1, '#b45309');
        }

        const shadowGrad = ctx.createLinearGradient(-10, -36, 10, 36);
        if (!isBack) {
            shadowGrad.addColorStop(0, '#ca8a04');
            shadowGrad.addColorStop(0.3, '#a16207'); // Sıcak bronz-altın gölge
            shadowGrad.addColorStop(0.65, '#854d0e'); // Derin pah gölgesi
            shadowGrad.addColorStop(1, '#78350f'); // Altın gölge tabanı
        } else {
            shadowGrad.addColorStop(0, '#854d0e');
            shadowGrad.addColorStop(0.5, '#713f12');
            shadowGrad.addColorStop(1, '#451a03');
        }

        // A) SOL / IŞIKLI YÜZEY (Left / Light Facet)
        ctx.save();
        ctx.fillStyle = lightGrad;
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        // Üst İğne Ucu
        ctx.moveTo(0, -36);
        // Sol Üst Bıçak Kenarı
        ctx.lineTo(-2.2, -16.5);
        // Sol Üst Kabza Girişi
        ctx.lineTo(-2.0, -9.5);
        // Sol Kabza Şaft Kenarı
        ctx.lineTo(-2.0, 9.5);
        // Alt Zikzak: Sola Çıkıntı (Dış Köşe)
        ctx.lineTo(-8.5, 12.8);
        // Alt Zikzak Dış Dirsek
        ctx.lineTo(-8.5, 14.5);
        // Alt Zikzak İçe Kırılım
        ctx.lineTo(-1.2, 16.5);
        // Alt İğne Ucu
        ctx.lineTo(0, 36);

        // Omurga Hattı Üzerinden Geri Dönüş (Ridge Return Path)
        ctx.lineTo(0, 16.8);
        ctx.lineTo(-6.8, 13.8);
        ctx.lineTo(0, 9.5);
        ctx.lineTo(0, -9.5);
        ctx.lineTo(6.8, -13.8);
        ctx.lineTo(0, -16.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // B) SAĞ / GÖLGELİ YÜZEY (Right / Shadow Facet)
        ctx.save();
        ctx.fillStyle = shadowGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        // Üst İğne Ucu
        ctx.moveTo(0, -36);
        // Üst Zikzak İçe Kırılım Kenarı
        ctx.lineTo(1.2, -16.5);
        // Üst Zikzak Dış Dirsek
        ctx.lineTo(8.5, -14.5);
        // Üst Zikzak: Sağa Çıkıntı (Dış Köşe)
        ctx.lineTo(8.5, -12.8);
        // Sağ Üst Kabza Girişi
        ctx.lineTo(2.0, -9.5);
        // Sağ Kabza Şaft Kenarı
        ctx.lineTo(2.0, 9.5);
        // Sağ Alt Bıçak Kenarı
        ctx.lineTo(2.2, 16.5);
        // Alt İğne Ucu
        ctx.lineTo(0, 36);

        // Omurga Hattı Üzerinden Geri Dönüş (Ridge Return Path)
        ctx.lineTo(0, 16.8);
        ctx.lineTo(-6.8, 13.8);
        ctx.lineTo(0, 9.5);
        ctx.lineTo(0, -9.5);
        ctx.lineTo(6.8, -13.8);
        ctx.lineTo(0, -16.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // C) 3D KESKİN OMURGA PARILTI HATTI (Sharp Specular Spine Ridge)
        // 3D modeldeki keskin merkez çizgisi
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 0.9;
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(0, -35.5);
        ctx.lineTo(0, -16.8);
        ctx.lineTo(6.8, -13.8);
        ctx.lineTo(0, -9.5);
        ctx.lineTo(0, 9.5);
        ctx.lineTo(-6.8, 13.8);
        ctx.lineTo(0, 16.8);
        ctx.lineTo(0, 35.5);
        ctx.stroke();
        ctx.restore();

        // D) KABZA TUTUŞ BOĞUMLARI (Grip Rings & Greek Meander Grooves)
        // Elin kavradığı orta şaft üzerinde 3 adet mikro altın bilezik
        const gripY = [-5, 0, 5];
        gripY.forEach(gy => {
            ctx.save();
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(-2.2, gy - 0.7, 4.4, 1.4);
            ctx.strokeStyle = '#854d0e';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(-2.2, gy - 0.7, 4.4, 1.4);
            ctx.restore();
        });

        // ==============================================================
        // 3. CANLI ELEKTRİK ARKLARI, KIVILCIMLAR & PARILTI GLINT EFEKTLERİ
        // ==============================================================
        if (showArcs) {
            // Şimşek uçlarında ve dirseklerinde titreyen canlı elektrik arkları
            const arcJitter = Math.sin(now * 0.04);
            if (arcJitter > -0.2) {
                ctx.save();
                ctx.strokeStyle = '#38bdf8';
                ctx.lineWidth = 1.3;
                ctx.shadowColor = '#0ea5e9';
                ctx.shadowBlur = 7;

                // Üst İğne Arkı
                ctx.beginPath();
                ctx.moveTo(0, -36);
                ctx.lineTo(-2 + Math.sin(now * 0.05) * 3, -41);
                ctx.lineTo(2 + Math.cos(now * 0.06) * 3, -46);
                ctx.stroke();

                // Alt İğne Arkı
                ctx.beginPath();
                ctx.moveTo(0, 36);
                ctx.lineTo(2 + Math.cos(now * 0.05) * 3, 41);
                ctx.lineTo(-2 + Math.sin(now * 0.06) * 3, 46);
                ctx.stroke();

                // Dirsek Kıvılcımları
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(8.5, -13.5);
                ctx.lineTo(12 + Math.sin(now * 0.07) * 2, -15);
                ctx.moveTo(-8.5, 13.5);
                ctx.lineTo(-12 + Math.cos(now * 0.07) * 2, 15);
                ctx.stroke();

                ctx.restore();
            }

            // Uçlarda 4-Kollu Yıldız Glint Parlaması (Periyodik Yıldız Işıltısı)
            const glintAlpha = (Math.sin(now / 160) + 1) * 0.5;
            if (glintAlpha > 0.3) {
                ctx.save();
                ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha * glow})`;
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 6;

                // Üst Uç Glint
                ctx.beginPath();
                ctx.arc(0, -36, 1.4, 0, Math.PI * 2);
                ctx.fill();
                // 4-Point Star
                ctx.fillRect(-3, -36.5, 6, 1);
                ctx.fillRect(-0.5, -39, 1, 6);

                // Alt Uç Glint
                ctx.beginPath();
                ctx.arc(0, 36, 1.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(-3, 35.5, 6, 1);
                ctx.fillRect(-0.5, 33, 1, 6);

                ctx.restore();
            }
        }

        ctx.restore();
    }

    /**
     * Elde Taşınan Eşya Olarak Zeus Şimşeği Çizimi (drawHeldItem Entegrasyonu)
     */
    function drawThunderboltHeld(ctx, handX, handY, isPreview = false, facing = 'down', model = 'classic_2', p = null) {
        if (!ctx) return;

        const f = (typeof normalize8WayFacing === 'function') ? normalize8WayFacing(facing) : (facing || 'down');
        const isBack = (f === 'up' || f === 'up-right' || f === 'up-left');
        const isLeft = (f === 'left' || f === 'down-left' || f === 'up-left');

        // 8 Yöne Göre İzometrik Tutuş Açısı ve Eğimi
        let angle = -0.42; // Standart eğim (~-24 derece)
        let scale = 1.05;

        if (f === 'up') {
            angle = -0.15; // Dik sırt duruşu
        } else if (f === 'up-right' || f === 'up-left') {
            angle = -0.28;
        } else if (f === 'right' || f === 'left') {
            angle = -0.52; // Fırlatmaya hazır dinamik profil açısı (~-30 derece)
            scale = 1.1;
        } else if (f === 'down-right' || f === 'down-left') {
            angle = -0.38; // 2.5D İzometrik 3/4 bakış
        } else if (f === 'down') {
            angle = -0.40; // Ön çapraz gövde tutuşu
        }

        if (isPreview) {
            angle = -0.45;
            scale = 1.18;
        }

        // Sol yönlerde simetri aynalama
        let drawAngle = angle;
        if (!isPreview && isLeft) {
            drawAngle = -angle;
        }

        ctx.save();
        ctx.translate(handX, handY);

        if (!isPreview && isLeft) {
            ctx.scale(-1, 1);
        }

        drawGoldenThunderbolt(ctx, 0, 0, scale, angle, f, {
            showAura: true,
            showArcs: true,
            glowIntensity: 1.0,
            isBackView: isBack
        });

        ctx.restore();
    }

    // Dışa aktar
    window.ZeusThunderboltRenderer = {
        drawGoldenThunderbolt: drawGoldenThunderbolt,
        drawThunderboltHeld: drawThunderboltHeld
    };

})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));

