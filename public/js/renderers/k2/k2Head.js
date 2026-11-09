// public/js/renderers/k2/k2Head.js - Karakter 2 Kafa, Boyun, Şapka, Saç Modelleri, Sakallar & İfadeler
(function (global) {
    'use strict';

    class K2Head {
        static drawSkeletalNeck(ctx, p, facing, isBack, isProfile, skinColor, isFemale = false) {
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const topW = isFemale ? 4.6 : 5.6;     // Çene altında toparlanan zarif boğaz genişliği
            const bottomW = isFemale ? 6.6 : 7.8;  // Omuz ve trapeze doğru genişleyen organik trapez tabanı

            ctx.save();
            ctx.fillStyle = skinColor;

            if (isProfile) {
                // Yan Profil Anatomik Boyun (Kafa arkası, ense ve sırtı tek parça bağlayan form)
                const nBackX = -dirSign * 4.8;  // Kafa arkası ve sırt omurgası ile kesintisiz hizalı ense hattı
                const nFrontX = dirSign * 3.2;  // Çene altından köprücük kemiğine inen boğaz hattı
                ctx.beginPath();
                ctx.moveTo(nBackX, 6.0);
                ctx.lineTo(nBackX, 9.8);
                ctx.lineTo(nFrontX + dirSign * 0.2, 9.8);
                ctx.quadraticCurveTo(nFrontX - dirSign * 0.2, 7.8, nFrontX, 6.0);
                ctx.closePath();
                ctx.fill();

            } else if (isBack) {
                // Tam Sırt & 3/4 Sırt (Ense - Organik Trapez Yayılımı)
                const shiftX = (facing === 'up-right' || facing === 'up-left') ? (dirSign * 0.5) : 0;
                ctx.beginPath();
                ctx.moveTo(shiftX - topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX - topW / 2 - 0.2, 7.8, shiftX - bottomW / 2, 9.8);
                ctx.lineTo(shiftX + bottomW / 2, 9.8);
                ctx.quadraticCurveTo(shiftX + topW / 2 + 0.2, 7.8, shiftX + topW / 2, 6.0);
                ctx.closePath();
                ctx.fill();

                // Ense omurga çukurluğu (Vertebral furrow)
                ctx.fillStyle = "rgba(15, 23, 42, 0.10)";
                ctx.beginPath();
                ctx.roundRect(shiftX - 0.5, 6.4, 1.0, 3.2, 0.5);
                ctx.fill();

            } else {
                // Tam Ön & 3/4 Ön (Boğaz & Çene Altı - Organik Trapez Boyun Kasları)
                const shiftX = (facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0;
                ctx.beginPath();
                ctx.moveTo(shiftX - topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX - topW / 2 - 0.2, 7.8, shiftX - bottomW / 2, 9.8);
                ctx.lineTo(shiftX + bottomW / 2, 9.8);
                ctx.quadraticCurveTo(shiftX + topW / 2 + 0.2, 7.8, shiftX + topW / 2, 6.0);
                ctx.closePath();
                ctx.fill();

                // Yan boyun / sternokleidomastoid derinlik gölgesi (Organik silindirik derinlik)
                ctx.fillStyle = "rgba(180, 83, 9, 0.14)";
                ctx.beginPath();
                ctx.moveTo(shiftX - topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX - topW / 2 - 0.2, 7.8, shiftX - bottomW / 2, 9.8);
                ctx.lineTo(shiftX - bottomW / 2 + 1.1, 9.8);
                ctx.quadraticCurveTo(shiftX - topW / 2 + 0.5, 7.8, shiftX - topW / 2 + 0.6, 6.0);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(shiftX + topW / 2, 6.0);
                ctx.quadraticCurveTo(shiftX + topW / 2 + 0.2, 7.8, shiftX + bottomW / 2, 9.8);
                ctx.lineTo(shiftX + bottomW / 2 - 1.1, 9.8);
                ctx.quadraticCurveTo(shiftX + topW / 2 - 0.5, 7.8, shiftX + topW / 2 - 0.6, 6.0);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * 1.5. Çene Altı & Boyun Derinlik Gölgesi (Ambient Occlusion)
         * Çenenin boyun silindirine düşürdüğü yumuşak anatomik gölge katmanı
         */
        static drawChinNeckOcclusionShadow(ctx, p, facing, isBack, isProfile, isFemale = false) {
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const topW = isFemale ? 4.6 : 5.6;
            const bottomW = isFemale ? 6.6 : 7.8;

            ctx.save();

            if (isProfile) {
                // Yan Profil Çene Altı Gölgesi (Submental Ambient Occlusion)
                const nBackX = -dirSign * 4.8;
                const nFrontX = dirSign * 3.2;
                const minX = Math.min(nBackX, nFrontX);
                const spanW = Math.abs(nFrontX - nBackX);

                ctx.beginPath();
                ctx.rect(minX, 5.8, spanW, 2.6);
                if (typeof ctx.clip === 'function') ctx.clip();

                // 1. Çene altı derinlik gölgesi (Mandibular crease)
                ctx.fillStyle = "rgba(180, 83, 9, 0.28)";
                ctx.beginPath();
                ctx.moveTo(nFrontX, 6.0);
                ctx.lineTo(nFrontX + dirSign * 0.1, 7.6);
                ctx.lineTo(nBackX + dirSign * 1.6, 7.6);
                ctx.lineTo(nBackX + dirSign * 1.6, 6.0);
                ctx.closePath();
                ctx.fill();

                // 2. Çene kemiği temas çizgisi (Jawline contact shadow)
                ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                ctx.beginPath();
                ctx.moveTo(nFrontX, 6.0);
                ctx.lineTo(nFrontX - dirSign * 0.2, 6.8);
                ctx.lineTo(nBackX + dirSign * 1.8, 6.8);
                ctx.lineTo(nBackX + dirSign * 1.8, 6.0);
                ctx.closePath();
                ctx.fill();

                // 3. Kulak arkası & ense başlangıç yumuşak gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.16)";
                ctx.fillRect(nBackX, 6.0, 2.0, 1.4);

            } else if (isBack) {
                // Sırt & 3/4 Sırt Ense Saç Altı Gölgesi
                const shiftX = (facing === 'up-right' || facing === 'up-left') ? (dirSign * 0.5) : 0;
                ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                ctx.beginPath();
                ctx.roundRect(shiftX - bottomW / 2 + 0.3, 6.0, bottomW - 0.6, 1.4, [0, 0, 0.6, 0.6]);
                ctx.fill();

            } else {
                // Tam Ön ve 3/4 Ön Çene Altı Yay Gölgesi (Ambient Occlusion)
                const shiftX = (facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0;

                // Yalnızca boyun genişliği içine maskele
                ctx.beginPath();
                ctx.rect(shiftX - bottomW / 2 - 0.5, 6.0, bottomW + 1.0, 3.2);
                if (typeof ctx.clip === 'function') ctx.clip();

                // 1. Yumuşak Sıcak Çene Altı Gölgesi (Melanin Ambient Occlusion)
                ctx.fillStyle = "rgba(180, 83, 9, 0.32)";
                ctx.beginPath();
                ctx.ellipse(shiftX, 6.9, topW * 0.60, 1.4, 0, 0, Math.PI);
                ctx.fill();

                // 2. Çene Hat Temas Çizgisi (Contact Crease Shadow)
                ctx.fillStyle = "rgba(15, 23, 42, 0.20)";
                ctx.beginPath();
                ctx.ellipse(shiftX, 6.7, topW * 0.52, 0.7, 0, 0, Math.PI);
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * 1.4. Streetwear Mock-Neck Boyunluk (Yükseltilmiş Dik Yaka Payı)
         * T-shirt kumaşının boyun dibini saran ribana dik yaka formu.
         * Boyun ile omuz/gövde arasında anatomik ve estetik bir köprü kurar.
         */
        static drawMockNeckCollar(ctx, p, facing, isBack, isProfile, teeColor, teeAccent, isFemale = false, isGraffitiTee = false, isCyberTee = false, isDress = false, isK2CyberDress = false, isK2GothDress = false, isK2UrbanHoodie = false) {
            if (p && (p.outfit === 'outfit_k2_cat' || p.outfit === 'outfits_outfit_k2_cat')) return;
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const bottomW = isFemale ? 6.6 : 7.8;
            const collarW = bottomW + 0.6; // Organik trapez boyun tabanını tam saran yaka payı

            ctx.save();

            if (isK2GothDress) {
                // GOTİK KADIFE CHOKER & GÜMÜŞ KOLYE UCU
                const shiftX = isProfile ? (dirSign * 2.0) : ((facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0);
                ctx.fillStyle = "#09090b"; // Siyah kadife choker
                ctx.beginPath();
                ctx.roundRect(shiftX - collarW * 0.42, 7.8, collarW * 0.84, 1.4, 0.4);
                ctx.fill();

                if (!isBack) {
                    // Gümüş metal haç / halka kolye ucu
                    ctx.fillStyle = "#cbd5e1";
                    ctx.beginPath();
                    ctx.arc(shiftX, 8.8, 0.7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(shiftX - 0.3, 8.8, 0.6, 1.2);
                }
                ctx.restore();
                return;
            } else if (isK2CyberDress) {
                // SİBER NEON CHOKER & CYAN LED
                const shiftX = isProfile ? (dirSign * 2.0) : ((facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0);
                ctx.fillStyle = "#0f172a";
                ctx.beginPath();
                ctx.roundRect(shiftX - collarW * 0.44, 7.8, collarW * 0.88, 1.4, 0.4);
                ctx.fill();

                if (!isBack) {
                    // Parlayan cyan LED gösterge
                    ctx.fillStyle = "#0ea5e9";
                    ctx.shadowColor = "#38bdf8";
                    ctx.shadowBlur = 4;
                    ctx.fillRect(shiftX - 1.2, 8.1, 2.4, 0.8);
                }
                ctx.restore();
                return;
            } else if (isDress) {
                // Standart Kolsuz Elbise: Yaka Yok (Doğal Dekolte Boyun)
                ctx.restore();
                return;
            }

            if (isProfile) {
                // Yan Profil Dik Yaka (Ense ve gıdı eğimiyle uyumlu sokak mock-neck silüeti)
                const cBackX = -dirSign * 5.0;  // Ense arkasını ve sırtı tam kavrar
                const cFrontX = dirSign * 3.6;  // Ön köprücük kemiğini tam kavrar
                const minX = Math.min(cBackX, cFrontX);
                const spanW = Math.abs(cFrontX - cBackX);

                // 1. Ana Mock-Neck Yaka Kumaşı
                ctx.fillStyle = teeColor;
                ctx.beginPath();
                ctx.moveTo(cBackX, 7.7);
                ctx.quadraticCurveTo(0, 8.0, cFrontX, 8.2);
                ctx.lineTo(cFrontX + dirSign * 0.3, 10.0);
                ctx.lineTo(cBackX - dirSign * 0.2, 10.0);
                ctx.closePath();
                ctx.fill();

                // 2. Çift Dikişli Ribana Yaka Kenarı (Ribbed Hem Highlight)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(cBackX, 7.7);
                ctx.quadraticCurveTo(0, 8.0, cFrontX, 8.2);
                ctx.stroke();

                // 3. Boyun Tenine Düşen Mikro Temas Gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.22)";
                ctx.beginPath();
                ctx.moveTo(cBackX + dirSign * 0.2, 7.4);
                ctx.lineTo(cFrontX - dirSign * 0.2, 7.9);
                ctx.lineTo(cFrontX, 8.2);
                ctx.lineTo(cBackX, 7.7);
                ctx.closePath();
                ctx.fill();

                // Cyber T-shirt için neon dikiş mikro-detayı
                if (isCyberTee) {
                    ctx.strokeStyle = "rgba(14, 165, 233, 0.50)";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(minX + spanW * 0.3, 9.2);
                    ctx.lineTo(minX + spanW * 0.7, 9.2);
                    ctx.stroke();
                }

            } else if (isBack) {
                // Tam Sırt & 3/4 Sırt Ense Yakası (Ense dibini saran dik ribana bandı)
                const shiftX = (facing === 'up-right' || facing === 'up-left') ? (dirSign * 0.5) : 0;

                // 1. Ana Mock-Neck Yaka Kumaşı
                ctx.fillStyle = teeColor;
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2, 8.1);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX + collarW / 2, 8.1);
                ctx.lineTo(shiftX + collarW / 2 + 0.3, 10.0);
                ctx.lineTo(shiftX - collarW / 2 - 0.3, 10.0);
                ctx.closePath();
                ctx.fill();

                // 2. Ribana Çift Dikiş Kenarı
                ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2 + 0.3, 8.1);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX + collarW / 2 - 0.3, 8.1);
                ctx.stroke();

                // 3. Ense Tenine Düşen Mikro Temas Gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.20)";
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2 + 0.4, 8.1);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX + collarW / 2 - 0.4, 8.1);
                ctx.lineTo(shiftX + collarW / 2 - 0.4, 7.5);
                ctx.quadraticCurveTo(shiftX, 7.1, shiftX - collarW / 2 + 0.4, 7.5);
                ctx.closePath();
                ctx.fill();

            } else {
                // Tam Ön & 3/4 Ön Boğaz Yakası (Ön boyun dibini saran streetwear mock-neck)
                const shiftX = (facing === 'down-right' || facing === 'down-left') ? (dirSign * 0.6) : 0;

                // 1. Ana Mock-Neck Yaka Kumaşı
                ctx.fillStyle = teeColor;
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2, 7.9);
                ctx.quadraticCurveTo(shiftX, 8.2, shiftX + collarW / 2, 7.9);
                ctx.lineTo(shiftX + collarW / 2 + 0.3, 10.0);
                ctx.lineTo(shiftX - collarW / 2 - 0.3, 10.0);
                ctx.closePath();
                ctx.fill();

                // 2. Ribana Çift Dikiş Kenarı (Streetwear Rib Hem)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                if (isK2UrbanHoodie) {
                    // Kapüşon kordon giriş delikleri (Gümüş metalik halkalar)
                    ctx.fillStyle = "#cbd5e1";
                    ctx.beginPath();
                    ctx.arc(shiftX - 1.8, 8.8, 0.65, 0, Math.PI * 2);
                    ctx.arc(shiftX + 1.8, 8.8, 0.65, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.arc(shiftX - 1.8, 8.8, 0.32, 0, Math.PI * 2);
                    ctx.arc(shiftX + 1.8, 8.8, 0.32, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.moveTo(shiftX - collarW / 2 + 0.3, 7.9);
                ctx.quadraticCurveTo(shiftX, 8.2, shiftX + collarW / 2 - 0.3, 7.9);
                ctx.stroke();

                // 3. Boğaz Tenine Düşen Mikro Temas Gölgesi
                ctx.fillStyle = "rgba(15, 23, 42, 0.18)";
                ctx.beginPath();
                ctx.moveTo(shiftX - collarW / 2 + 0.4, 7.9);
                ctx.quadraticCurveTo(shiftX, 8.2, shiftX + collarW / 2 - 0.4, 7.9);
                ctx.lineTo(shiftX + collarW / 2 - 0.4, 7.4);
                ctx.quadraticCurveTo(shiftX, 7.7, shiftX - collarW / 2 + 0.4, 7.4);
                ctx.closePath();
                ctx.fill();

                // Cyber T-shirt için neon dikiş mikro-detayı
                if (isCyberTee) {
                    ctx.strokeStyle = "rgba(14, 165, 233, 0.50)";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(shiftX - 2.0, 9.2);
                    ctx.lineTo(shiftX + 2.0, 9.2);
                    ctx.stroke();
                }
            }

            ctx.restore();
        }

        /**
         * Kafa, Saç ve Canlı Yüz (Blinking, Farkındalık & Konuşma Destekli)
         */
        static drawStreetwearHead(ctx, headX, headY, p, facing, isBack, isProfile, skinColor, blinkProgress = 0, lookShiftX = 0, lookShiftY = 0, isTalking = false, teeColor = null, teeAccent = null, isGraffitiTee = false, isCyberTee = false, smokeState = null) {
            ctx.save();
            ctx.translate(headX, headY);

            // T-shirt renk ve stil fallback koruması
            if (!teeColor) {
                const isGraff = (p && (p.shirt === 'k2_graffiti_oversize' || p.color === 'k2_graffiti_oversize'));
                const isCyber = (p && (p.shirt === 'cyber_tactical' || p.color === 'cyber_tactical'));
                teeColor = isGraff ? '#18181b' : (isCyber ? '#0f172a' : ((p && p.shirt && p.shirt !== 'none') ? p.shirt : ((p && p.color) || '#3b82f6')));
                teeAccent = isGraff ? '#ec4899' : (isCyber ? '#0ea5e9' : '#38bdf8');
                isGraffitiTee = isGraff;
                isCyberTee = isCyber;
            }

            // 0. Anatomik Boyun (Kafayı ve Gövdeyi Doğal Bağlayan Kavisli Boyun - 1.2px)
            const outfitId = (p && (p.outfit || p.color)) || '';
            const isK2CyberDress = (outfitId === 'dress_k2_cyber_street' || (p && p.shirt === 'dress_k2_cyber_street'));
            const isK2GothDress = (outfitId === 'dress_k2_goth_grunge' || (p && p.shirt === 'dress_k2_goth_grunge'));
            const isDress = isK2CyberDress || isK2GothDress || (typeof outfitId === 'string' && outfitId.startsWith('dress_'));
            const isSelf = !p || 
                (typeof window !== 'undefined' && (p === window.previewAvatar || (typeof previewAvatar !== 'undefined' && p === previewAvatar) || (typeof myAvatar !== 'undefined' && p === myAvatar) || (typeof dressingAvatar !== 'undefined' && p === dressingAvatar))) ||
                (typeof window !== 'undefined' && (window.myId && p.id === window.myId));
            const selfGender = isSelf ? ((typeof getPlayerGender === 'function') ? getPlayerGender(p) : (typeof window !== 'undefined' ? (window.myGender || window.selectedGender) : null)) : null;

            const pGender = (p && (p.gender || (p.avatar && p.avatar.gender))) || selfGender;
            const pIsFemale = (p && (p.isFemale !== undefined ? p.isFemale : (p.avatar && p.avatar.isFemale !== undefined ? p.avatar.isFemale : undefined)));

            const isExplicitMale = pGender === 'male' || pIsFemale === false;
            let isFemale = false;
            if (isExplicitMale) {
                isFemale = false;
            } else if (pGender === 'female' || pIsFemale === true) {
                isFemale = true;
            } else if (typeof isFemaleAvatar === 'function') {
                isFemale = isFemaleAvatar(p, p.color, p.hat, p.shoes);
            } else {
                isFemale = isDress || (p && p.shirt && (p.shirt.includes('crop') || p.shirt.includes('dress') || p.shirt.includes('pastel') || p.shirt.includes('corset') || p.shirt.includes('asymm'))) || (p && p.pants && (p.pants.includes('mini') || p.pants.includes('flared') || p.pants.includes('fishnet') || p.pants.includes('flare') || p.pants.includes('wide_leg')));
            }
            this.drawSkeletalNeck(ctx, p, facing, isBack, isProfile, skinColor, isFemale);

            // 1. Kafa Tabanı & Kulaklar
            this.drawSkeletalHead(ctx, p, facing, isBack, isProfile, skinColor);

            // 1.4. Streetwear Mock-Neck Boyunluk / Gotik Choker / Siber Yaka
            const _k2ShirtId = (p && (p.shirt || p.color)) || '';
            const _isK2Hoodie = (_k2ShirtId === 'top_k2_urban_hoodie' || _k2ShirtId === 'tshirts_top_k2_urban_hoodie' || _k2ShirtId === 'top_k2_hoodie' || _k2ShirtId === 'tshirts_top_k2_hoodie');
            this.drawMockNeckCollar(ctx, p, facing, isBack, isProfile, teeColor, teeAccent, isFemale, isGraffitiTee, isCyberTee, isDress, isK2CyberDress, isK2GothDress, _isK2Hoodie);

            // 2. Doğal Kavisli Saç / Şapka
            this.drawSkeletalHair(ctx, p, facing, isBack, isProfile, isFemale);

            // 3. Canlı Yüz & Göz Kırpma (Blinking, Idle Look-Around & Talking Mouth)
            if (!isBack) {
                this.drawSkeletalFace(ctx, p, facing, isProfile, blinkProgress, lookShiftX, lookShiftY, isTalking, smokeState, isFemale);
            }

            // 4. K2 Kedi Kostümü Kapüşonu, 3D Kulaklar, Sevimli Burun ve Bıyıklar
            const isK2CatOutfit = (outfitId === 'outfit_k2_cat' || outfitId === 'outfits_outfit_k2_cat' || (p && (p.costume === 'costume_cat' || p.costume === 'outfit_k2_cat')));
            if (isK2CatOutfit) {
                const catHoodCol = (p && p.outfitColor && p.outfitColor.startsWith('#')) ? p.outfitColor : ((p && p.color && p.color.startsWith('#')) ? p.color : '#232326');
                const catHoodFn = this.drawCatHood || (typeof Karakter2Renderer !== 'undefined' && Karakter2Renderer.drawCatHood) || (typeof K2Torso !== 'undefined' && K2Torso.drawCatHood);
                if (typeof catHoodFn === 'function') {
                    catHoodFn.call(this, ctx, p, facing, isBack, isProfile, skinColor, catHoodCol);
                }
            }

            ctx.restore();
        }

        /**
         * Modüler Kafa Tabanı Çizimi (Kulaklar, Burun Çıkıntısı, Hacim Gölgelendirmesi)
         */
        static drawSkeletalHead(ctx, p, facing, isBack, isProfile, skinColor) {
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

            ctx.fillStyle = skinColor;
            ctx.strokeStyle = "rgba(0,0,0,0.18)";
            ctx.lineWidth = 0.8;

            // 1. Kulaklar (Kıkırdak Derinliğiyle)
            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Yan profilde kulak
                const earX = -2.4;
                const earY = -2.5;
                ctx.beginPath();
                ctx.ellipse(earX, earY, 2.2, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Kulak içi kıkırdak kıvrımı
                ctx.strokeStyle = "rgba(0,0,0,0.15)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.arc(earX, earY, 1.2, -Math.PI * 0.4, Math.PI * 0.7);
                ctx.stroke();

                ctx.restore();

            } else if (facing === 'down' || isBack) {
                // Ön ve arka bakışta iki yanda kulaklar
                [-9.2, 9.2].forEach(ex => {
                    ctx.beginPath();
                    ctx.ellipse(ex, -2.5, 2.1, 3.1, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Kıkırdak
                    ctx.strokeStyle = "rgba(0,0,0,0.14)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.arc(ex, -2.5, 1.1, 0, Math.PI * 2);
                    ctx.stroke();
                });

            } else {
                // Çapraz açılarda yakın kulak
                const nearEarX = -dirSign * 8.4;
                ctx.beginPath();
                ctx.ellipse(nearEarX, -2.5, 2.1, 2.9, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = "rgba(0,0,0,0.14)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.arc(nearEarX, -2.5, 1.1, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 2. Anatomik-Chibi Kafa & Çene Silüeti (Daire yerine organik hat)
            ctx.fillStyle = skinColor;
            ctx.strokeStyle = "rgba(0,0,0,0.18)";
            ctx.lineWidth = 0.9;
            ctx.beginPath();

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Yan Profil: Yuvarlak arka kafatası, hafif alın kavisi, kalkık burun, dudak ve yuvarlak çene
                ctx.arc(0, -2.5, 9.8, Math.PI * 0.42, Math.PI * 1.5, false);
                ctx.lineTo(6.0, -10.5);
                ctx.quadraticCurveTo(8.4, -6.8, 8.2, -4.2);
                // Burun ucu
                ctx.lineTo(10.4, -2.0);
                ctx.lineTo(8.6, -0.6);
                // Dudak & Çene
                ctx.quadraticCurveTo(8.4, 1.2, 6.6, 4.6);
                ctx.quadraticCurveTo(2.5, 6.8, 0, 7.0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();

            } else if (isDiagonal) {
                // 3/4 Çapraz: Üst kubbe, elmacık kemiği kavisi ve hafif asimetrik U-çene
                ctx.arc(0, -2.5, 9.8, Math.PI * 0.96, Math.PI * 0.04, false);
                ctx.quadraticCurveTo(9.6, 2.2, 5.0, 6.2);
                ctx.quadraticCurveTo(dirSign * 1.2, 7.2, -4.0, 6.2);
                ctx.quadraticCurveTo(-9.6, 2.0, -9.8, -2.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

            } else {
                // Tam Ön ve Tam Sırt: Üst geniş kubbe, dolgun yanaklar ve zarif U-çene
                ctx.arc(0, -2.5, 9.8, Math.PI, 0, false);
                ctx.quadraticCurveTo(9.6, 2.2, 4.4, 6.2);
                ctx.quadraticCurveTo(0, 7.2, -4.4, 6.2);
                ctx.quadraticCurveTo(-9.6, 2.2, -9.8, -2.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }

            // 4. Tepe Ortam Işığı Yansıması
            ctx.fillStyle = "rgba(255,255,255,0.15)";
            ctx.beginPath();
            ctx.ellipse(-2.5, -8.5, 4.0, 1.8, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // 5. Yanaklarda Tatlı Sıcaklık (Chibi Soft Blush)
            if (!isBack) {
                ctx.fillStyle = "rgba(244, 114, 182, 0.16)";
                ctx.beginPath();
                if (isProfile) {
                    ctx.ellipse(dirSign * 4.6, 0.4, 2.6, 1.3, dirSign * 0.1, 0, Math.PI * 2);
                } else if (isDiagonal) {
                    ctx.ellipse(dirSign * 5.2, 0.4, 2.5, 1.3, dirSign * 0.1, 0, Math.PI * 2);
                    ctx.ellipse(-dirSign * 1.8, 0.3, 2.0, 1.1, -dirSign * 0.1, 0, Math.PI * 2);
                } else {
                    ctx.ellipse(-5.0, 0.4, 2.4, 1.3, -0.08, 0, Math.PI * 2);
                    ctx.ellipse(5.0, 0.4, 2.4, 1.3, 0.08, 0, Math.PI * 2);
                }
                ctx.fill();
            }
        }

        /**
         * K2 Skater Kova Şapka (Bucket Hat - 8 Açılı Salaş Kumaş Başlık)
         */
        static drawSkaterBucketHat(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');
            
            const hairColor = (p && p.hairColor && p.hairColor !== 'original' && p.hairColor.startsWith('#')) ? p.hairColor : "#26150b";
            let customHatCol = (p && p.hatColor && p.hatColor !== 'original' && p.hatColor.startsWith('#')) ? p.hatColor : null;
            const crownColor = customHatCol || "#27272a";
            const brimColor = customHatCol ? "rgba(0, 0, 0, 0.28)" : "#18181b";

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // 0. Ense & Kulak Saçı (Doğal katman)
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.roundRect(-9.8, -1.5, 5.0, 7.5, [0, 0, 3, 3]);
                ctx.fill();
                ctx.fillRect(0.2, -4.5, 1.4, 3.2);

                // 1. Kova Kubbesi (Crown) - Kafayı arkadan öne tam saran kütle (x: -11.0 -> 7.5, y: -16.8 -> -7.5)
                ctx.fillStyle = crownColor;
                ctx.beginPath();
                ctx.moveTo(7.5, -7.5);
                ctx.lineTo(6.5, -16.5);
                ctx.quadraticCurveTo(0, -17.5, -7.5, -17.0);
                ctx.lineTo(-11.0, -16.0);
                ctx.lineTo(-11.2, -6.0);
                ctx.closePath();
                ctx.fill();

                // Tepe Dikiş Şeridi
                ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.moveTo(-10.2, -12.5);
                ctx.lineTo(6.8, -12.5);
                ctx.stroke();

                // 2. Kova Siperliği (Brim) - Önde ve arkada kavisli salaş kenar (x: -12.5 -> 11.5)
                ctx.fillStyle = brimColor;
                ctx.beginPath();
                ctx.moveTo(-12.4, -4.5);
                ctx.quadraticCurveTo(-2.5, -7.5, 7.5, -7.0);
                ctx.lineTo(11.5, -6.2);
                ctx.quadraticCurveTo(12.0, -5.2, 10.5, -4.8);
                ctx.quadraticCurveTo(-2.5, -5.5, -12.4, -3.2);
                ctx.closePath();
                ctx.fill();

                // Siperlik dikiş çizgisi
                ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
                ctx.lineWidth = 0.65;
                ctx.beginPath();
                ctx.moveTo(-11.5, -4.0);
                ctx.quadraticCurveTo(-2.5, -6.5, 10.5, -5.5);
                ctx.stroke();

                // 3. Ön Neon Pembe Grafiti Yama
                if (!isBack) {
                    ctx.fillStyle = "#ec4899";
                    ctx.beginPath();
                    ctx.roundRect(3.5, -14.5, 4.5, 3.0, 0.6);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(4.5, -13.6, 2.5, 1.1);
                }

                ctx.restore();

            } else if (isDiagonal) {
                // Çapraz Açı (3/4)
                ctx.fillStyle = brimColor;
                ctx.beginPath();
                ctx.ellipse(dirSign * 0.8, -7.0, 13.5, 3.4, dirSign * 0.06, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = crownColor;
                ctx.beginPath();
                ctx.roundRect(-dirSign * 0.4 - 8.8, -17.0, 17.6, 9.6, [5.0, 5.0, 1.5, 1.5]);
                ctx.fill();

                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.moveTo(-dirSign * 0.4 - 8.0, -12.5);
                ctx.lineTo(-dirSign * 0.4 + 8.0, -12.5);
                ctx.stroke();

                if (!isBack) {
                    const patchX = dirSign * 4.0;
                    ctx.fillStyle = "#ec4899";
                    ctx.beginPath();
                    ctx.roundRect(patchX - 2.2, -14.5, 4.4, 3.0, 0.6);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(patchX - 1.2, -13.6, 2.4, 1.1);
                }

            } else {
                // Tam Ön ve Tam Sırt
                ctx.fillStyle = brimColor;
                ctx.beginPath();
                ctx.ellipse(0, -7.0, 13.5, 3.4, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = crownColor;
                ctx.beginPath();
                ctx.roundRect(-8.8, -17.0, 17.6, 9.6, [5.0, 5.0, 1.5, 1.5]);
                ctx.fill();

                ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.moveTo(-8.0, -12.5);
                ctx.lineTo(8.0, -12.5);
                ctx.stroke();

                if (!isBack) {
                    ctx.fillStyle = "#ec4899";
                    ctx.beginPath();
                    ctx.roundRect(-2.2, -14.5, 4.4, 3.0, 0.6);
                    ctx.fill();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(-1.2, -13.6, 2.4, 1.1);
                }
            }
            ctx.restore();
        }

        /**
         * K2 Bere & Pembe Fransız Bere (8 Açılı Yün Başlık)
         */
        static drawK2Bere(ctx, facing, isBack, isProfile, p = null, isPink = false) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');
            
            let baseCol = isPink ? "#f472b6" : "#e11d48";
            let highCol = isPink ? "#fbcfe8" : "#fb7185";
            let shadowCol = isPink ? "#db2777" : "#9f1239";
            let bandCol = isPink ? "#be185d" : "#881337";

            if (p && p.hatColor && p.hatColor !== 'original' && p.hatColor.startsWith('#')) {
                baseCol = p.hatColor;
                highCol = "rgba(255, 255, 255, 0.35)";
                shadowCol = "rgba(0, 0, 0, 0.3)";
                bandCol = "rgba(0, 0, 0, 0.4)";
            }

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                const bereGrad = ctx.createLinearGradient(-10, -18, 8, -4);
                bereGrad.addColorStop(0, highCol);
                bereGrad.addColorStop(0.4, baseCol);
                bereGrad.addColorStop(1, shadowCol);

                ctx.fillStyle = bereGrad;
                ctx.beginPath();
                ctx.moveTo(7.5, -5.5);
                ctx.quadraticCurveTo(6.0, -13.5, 0, -17.2);
                ctx.quadraticCurveTo(-7.0, -17.5, -12.2, -12.5);
                ctx.quadraticCurveTo(-13.5, -7.0, -11.5, -1.8);
                ctx.quadraticCurveTo(-2.5, -5.5, 7.5, -5.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = bandCol;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.moveTo(-11.5, -1.8);
                ctx.quadraticCurveTo(-2.5, -5.5, 7.5, -5.5);
                ctx.stroke();

                if (!isPink) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(-8.5, -16.5, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.15)";
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                } else {
                    ctx.fillStyle = bandCol;
                    ctx.fillRect(-2.0, -18.2, 1.8, 2.5);
                }

                ctx.restore();

            } else if (isDiagonal) {
                ctx.fillStyle = baseCol;
                ctx.beginPath();
                ctx.ellipse(-dirSign * 0.8, -7.5, 11.8, 9.6, -dirSign * 0.08, Math.PI, 0, false);
                ctx.lineTo(-dirSign * 0.8 + (dirSign > 0 ? 11.8 : -11.8), -6.0);
                ctx.lineTo(-dirSign * 0.8 - (dirSign > 0 ? 11.8 : -11.8), -5.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = bandCol;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.ellipse(dirSign * 0.5, -6.5, 12.0, 3.0, dirSign * 0.05, 0, Math.PI * 2);
                ctx.stroke();

                if (!isPink) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(-dirSign * 4.0, -16.5, 3.2, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = bandCol;
                    ctx.fillRect(-dirSign * 1.5, -18.0, 1.8, 2.2);
                }

            } else {
                ctx.fillStyle = baseCol;
                ctx.beginPath();
                ctx.ellipse(0, -7.5, 11.2, 9.6, 0, Math.PI, 0, false);
                ctx.lineTo(11.2, -6.0);
                ctx.lineTo(-11.2, -6.0);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = bandCol;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.ellipse(0, -6.5, 12.0, 3.0, 0, 0, Math.PI * 2);
                ctx.stroke();

                if (!isPink) {
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(0, -17.2, 3.4, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.fillStyle = bandCol;
                    ctx.fillRect(-0.8, -18.2, 1.6, 2.2);
                }
            }
            ctx.restore();
        }

        /**
         * K2 Kıraathane Kasketi (Flat Cap / Newsboy Cap)
         */
        static drawK2Kasket(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const capCol = "#334155";
            const capDark = "#1e293b";
            const capHigh = "#64748b";

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                ctx.fillStyle = capCol;
                ctx.beginPath();
                ctx.moveTo(7.5, -5.5);
                ctx.quadraticCurveTo(6.0, -13.0, 0, -16.2);
                ctx.quadraticCurveTo(-6.5, -16.5, -11.5, -11.5);
                ctx.quadraticCurveTo(-12.5, -6.0, -11.0, -1.8);
                ctx.quadraticCurveTo(-2.5, -5.5, 7.5, -5.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = capDark;
                ctx.beginPath();
                ctx.moveTo(6.5, -5.8);
                ctx.quadraticCurveTo(9.5, -5.8, 12.0, -4.8);
                ctx.quadraticCurveTo(11.0, -3.8, 7.0, -4.2);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = capHigh;
                ctx.beginPath();
                ctx.arc(-1.5, -16.0, 1.5, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

            } else if (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left') {
                ctx.fillStyle = capDark;
                ctx.beginPath();
                ctx.ellipse(dirSign * 3.5, -5.8, 10.5, 3.2, dirSign * 0.1, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = capCol;
                ctx.beginPath();
                ctx.ellipse(-dirSign * 0.4, -7.5, 11.2, 9.2, 0, Math.PI, 0, false);
                ctx.lineTo(-dirSign * 0.4 + (dirSign > 0 ? 11.2 : -11.2), -5.8);
                ctx.lineTo(-dirSign * 0.4 - (dirSign > 0 ? 11.2 : -11.2), -5.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = capHigh;
                ctx.beginPath();
                ctx.arc(-dirSign * 0.5, -16.2, 1.6, 0, Math.PI * 2);
                ctx.fill();

            } else {
                if (!isBack) {
                    ctx.fillStyle = capDark;
                    ctx.beginPath();
                    ctx.ellipse(0, -5.8, 11.5, 3.2, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.fillStyle = capCol;
                ctx.beginPath();
                ctx.ellipse(0, -7.5, 10.8, 9.2, 0, Math.PI, 0, false);
                ctx.lineTo(10.8, -5.8);
                ctx.lineTo(-10.8, -5.8);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = capHigh;
                ctx.beginPath();
                ctx.arc(0, -16.4, 1.6, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        /**
         * K2 Kovboy Şapkası (Cowboy Hat) - Heybetli kubbe & geniş kıvrık siperlik
         */
        static drawK2Cowboy(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const hatCol = "#78350f";
            const hatDark = "#451a03";
            const hatHigh = "#92400e";
            const hatBand = "#18181b";
            const buckleCol = "#f59e0b";

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // 1. Tac Kubbesi (Crown)
                const crownGrad = ctx.createLinearGradient(7, -18, -10, -6);
                crownGrad.addColorStop(0, hatHigh);
                crownGrad.addColorStop(0.5, hatCol);
                crownGrad.addColorStop(1, hatDark);

                ctx.fillStyle = crownGrad;
                ctx.strokeStyle = hatDark;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(7.5, -6.5);
                ctx.lineTo(5.5, -18.2);
                ctx.quadraticCurveTo(-1.5, -15.5, -9.2, -18.2);
                ctx.lineTo(-10.5, -3.5);
                ctx.quadraticCurveTo(-2.5, -6.0, 7.5, -6.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Deri Kemer
                ctx.fillStyle = hatBand;
                ctx.beginPath();
                ctx.moveTo(-10.2, -5.2);
                ctx.quadraticCurveTo(-2.5, -7.5, 7.5, -8.0);
                ctx.lineTo(7.5, -6.2);
                ctx.quadraticCurveTo(-2.5, -5.7, -10.2, -3.5);
                ctx.closePath();
                ctx.fill();

                // 2. Kıvrık Geniş Siperlik (Brim)
                const brimGrad = ctx.createLinearGradient(-14, -6, 15, -4);
                brimGrad.addColorStop(0, hatDark);
                brimGrad.addColorStop(0.5, hatCol);
                brimGrad.addColorStop(1, hatHigh);

                ctx.fillStyle = brimGrad;
                ctx.strokeStyle = hatDark;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(-14.5, -4.0);
                ctx.quadraticCurveTo(-3.0, -7.8, 8.0, -7.0);
                ctx.lineTo(15.0, -5.0);
                ctx.quadraticCurveTo(15.5, -3.5, 13.5, -3.2);
                ctx.quadraticCurveTo(-2.5, -4.8, -14.5, -2.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.restore();

            } else if (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left') {
                const cx = -dirSign * 0.4;

                // 1. Arka Siperlik
                ctx.fillStyle = hatDark;
                ctx.beginPath();
                ctx.ellipse(cx, -6.5, 16.0, 4.0, dirSign * 0.08, 0, Math.PI * 2);
                ctx.fill();

                // 2. Kubbe (Crown)
                const crownGrad = ctx.createLinearGradient(cx - 10, -18, cx + 10, -6);
                crownGrad.addColorStop(0, hatHigh);
                crownGrad.addColorStop(0.5, hatCol);
                crownGrad.addColorStop(1, hatDark);
                ctx.fillStyle = crownGrad;
                ctx.strokeStyle = hatDark;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(cx - 9.8, -6.2);
                ctx.lineTo(cx - 9.0, -18.2);
                ctx.quadraticCurveTo(cx, -15.5, cx + 9.0, -18.2);
                ctx.lineTo(cx + 9.8, -6.2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Deri Kemer & Toka
                ctx.fillStyle = hatBand;
                ctx.fillRect(cx - 9.8, -7.8, 19.6, 2.0);
                ctx.fillStyle = buckleCol;
                ctx.fillRect(cx + dirSign * 1.5 - 1.5, -8.3, 3.0, 3.0);

                // 3. Ön Siperlik Kıvrımı
                ctx.fillStyle = hatCol;
                ctx.strokeStyle = hatDark;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.ellipse(cx, -6.0, 16.0, 3.5, dirSign * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

            } else {
                // Tam Ön veya Tam Arka
                // 1. Arka Siperlik
                ctx.fillStyle = hatDark;
                ctx.beginPath();
                ctx.ellipse(0, -6.5, 16.5, 4.0, 0, 0, Math.PI * 2);
                ctx.fill();

                // 2. Kubbe (Crown) - Ortada çukur (crease)
                const crownGrad = ctx.createLinearGradient(-10, -18, 10, -6);
                crownGrad.addColorStop(0, hatDark);
                crownGrad.addColorStop(0.5, hatCol);
                crownGrad.addColorStop(1, hatHigh);
                ctx.fillStyle = crownGrad;
                ctx.strokeStyle = hatDark;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(-10.0, -6.2);
                ctx.lineTo(-9.2, -18.2);
                ctx.quadraticCurveTo(0, -15.2, 9.2, -18.2);
                ctx.lineTo(10.0, -6.2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Oluk Çizgisi
                ctx.strokeStyle = "rgba(0,0,0,0.35)";
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(0, -17.5);
                ctx.lineTo(0, -10.0);
                ctx.stroke();

                // Deri Kemer & Toka
                ctx.fillStyle = hatBand;
                ctx.fillRect(-10.0, -7.8, 20.0, 2.0);
                if (!isBack) {
                    ctx.fillStyle = buckleCol;
                    ctx.fillRect(-1.8, -8.5, 3.6, 3.4);
                    ctx.fillStyle = hatBand;
                    ctx.fillRect(-0.9, -7.6, 1.8, 1.6);
                }

                // 3. Ön Siperlik
                ctx.fillStyle = hatCol;
                ctx.strokeStyle = hatDark;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.ellipse(0, -5.8, 16.5, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            }
            ctx.restore();
        }

        /**
         * K2 Osmanlı Fesi (Fez) - Orijinal, heybetli boyutlar & zengin kadife formu
         */
        static drawK2Fes(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const tasselCol = "#09090b";

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Kadife Gövde Gradyanı (Önden arkaya ışık)
                const fesGrad = ctx.createLinearGradient(9, -6, -12, -4);
                fesGrad.addColorStop(0, "#dc2626");
                fesGrad.addColorStop(0.35, "#991b1b");
                fesGrad.addColorStop(1, "#7f1d1d");

                ctx.fillStyle = fesGrad;
                ctx.strokeStyle = "#581212";
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(9.8, -5.5);
                ctx.lineTo(7.6, -18.8);
                ctx.lineTo(-9.8, -18.8);
                ctx.lineTo(-12.4, -3.2);
                ctx.quadraticCurveTo(-1.0, -6.8, 9.8, -5.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Üst Düzlük Vurgusu
                ctx.fillStyle = "rgba(255,255,255,0.18)";
                ctx.beginPath();
                ctx.ellipse(-1.1, -18.8, 8.7, 1.6, 0, 0, Math.PI * 2);
                ctx.fill();

                // Tepe Düğmesi
                ctx.fillStyle = "#b45309";
                ctx.beginPath();
                ctx.arc(-1.1, -18.8, 1.6, 0, Math.PI * 2);
                ctx.fill();

                // Siyah İpek Püskül Kordonu
                ctx.strokeStyle = tasselCol;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(-1.1, -18.8);
                ctx.quadraticCurveTo(-6.8, -17.0, -11.0, -9.0);
                ctx.stroke();

                // Püskül Demeti
                ctx.fillStyle = tasselCol;
                ctx.beginPath();
                ctx.moveTo(-11.0, -9.0);
                ctx.lineTo(-13.5, -2.5);
                ctx.lineTo(-9.0, -2.5);
                ctx.closePath();
                ctx.fill();

                // Püskül Pirinç Halkası
                ctx.fillStyle = "#facc15";
                ctx.fillRect(-11.8, -9.4, 2.0, 1.4);

                ctx.restore();

            } else if (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left') {
                // Çapraz Açı
                const cx = -dirSign * 0.4;
                const fesGrad = ctx.createLinearGradient(cx - 12, -12, cx + 12, -12);
                fesGrad.addColorStop(0, "#7f1d1d");
                fesGrad.addColorStop(0.35, "#b91c1c");
                fesGrad.addColorStop(0.65, "#dc2626");
                fesGrad.addColorStop(1, "#7f1d1d");

                ctx.fillStyle = fesGrad;
                ctx.strokeStyle = "#581212";
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(cx - 12.2, -5.8);
                ctx.lineTo(cx - 9.8, -18.8);
                ctx.lineTo(cx + 9.8, -18.8);
                ctx.lineTo(cx + 12.2, -5.8);
                ctx.quadraticCurveTo(cx, -4.6, cx - 12.2, -5.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Tepe Düzlüğü
                ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.beginPath();
                ctx.ellipse(cx, -18.8, 9.8, 1.9, 0, 0, Math.PI * 2);
                ctx.fill();

                // Tepe Düğmesi
                ctx.fillStyle = "#b45309";
                ctx.beginPath();
                ctx.arc(cx, -18.8, 1.6, 0, Math.PI * 2);
                ctx.fill();

                // Püskül (Arkaya/Yana salınır)
                ctx.strokeStyle = tasselCol;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(cx, -18.8);
                ctx.quadraticCurveTo(cx - dirSign * 5.5, -16.5, cx - dirSign * 10.5, -9.5);
                ctx.stroke();

                ctx.fillStyle = tasselCol;
                ctx.beginPath();
                ctx.moveTo(cx - dirSign * 10.5, -9.5);
                ctx.lineTo(cx - dirSign * 13.0, -3.0);
                ctx.lineTo(cx - dirSign * 8.5, -3.0);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = "#facc15";
                ctx.fillRect(cx - dirSign * 11.4, -9.8, 2.0, 1.4);

            } else if (isBack) {
                // Tam Sırt Görünümü
                const fesGrad = ctx.createLinearGradient(-12, -12, 12, -12);
                fesGrad.addColorStop(0, "#7f1d1d");
                fesGrad.addColorStop(0.5, "#991b1b");
                fesGrad.addColorStop(1, "#7f1d1d");

                ctx.fillStyle = fesGrad;
                ctx.strokeStyle = "#581212";
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(-12.4, -5.5);
                ctx.lineTo(-9.8, -18.8);
                ctx.lineTo(9.8, -18.8);
                ctx.lineTo(12.4, -5.5);
                ctx.quadraticCurveTo(0, -4.5, -12.4, -5.5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Tepe Düğmesi
                ctx.fillStyle = "#b45309";
                ctx.beginPath();
                ctx.arc(0, -18.8, 1.6, 0, Math.PI * 2);
                ctx.fill();

                // Sırttan sarkan püskül
                ctx.strokeStyle = tasselCol;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(0, -18.8);
                ctx.quadraticCurveTo(4.2, -15.5, 6.8, -8.5);
                ctx.stroke();

                ctx.fillStyle = tasselCol;
                ctx.beginPath();
                ctx.moveTo(6.8, -8.5);
                ctx.lineTo(4.5, -2.5);
                ctx.lineTo(9.2, -2.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = "#facc15";
                ctx.fillRect(5.8, -8.9, 2.0, 1.4);

            } else {
                // Tam Ön Görünüm
                const fesGrad = ctx.createLinearGradient(-12, -12, 12, -12);
                fesGrad.addColorStop(0, "#7f1d1d");
                fesGrad.addColorStop(0.25, "#b91c1c");
                fesGrad.addColorStop(0.5, "#dc2626");
                fesGrad.addColorStop(0.75, "#b91c1c");
                fesGrad.addColorStop(1, "#7f1d1d");

                ctx.fillStyle = fesGrad;
                ctx.strokeStyle = "#581212";
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(-12.4, -5.8);
                ctx.lineTo(-9.8, -18.8);
                ctx.lineTo(9.8, -18.8);
                ctx.lineTo(12.4, -5.8);
                ctx.quadraticCurveTo(0, -4.6, -12.4, -5.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Üst Düzlük
                ctx.fillStyle = "rgba(255,255,255,0.2)";
                ctx.beginPath();
                ctx.ellipse(0, -18.8, 9.8, 1.9, 0, 0, Math.PI * 2);
                ctx.fill();

                // Tepe Düğmesi
                ctx.fillStyle = "#b45309";
                ctx.beginPath();
                ctx.arc(0, -18.8, 1.6, 0, Math.PI * 2);
                ctx.fill();

                // Yana dökülen püskül kordonu
                ctx.strokeStyle = tasselCol;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(0, -18.8);
                ctx.quadraticCurveTo(6.5, -15.5, 10.5, -8.5);
                ctx.stroke();

                // Püskül püskülü
                ctx.fillStyle = tasselCol;
                ctx.beginPath();
                ctx.moveTo(10.5, -8.5);
                ctx.lineTo(8.2, -2.5);
                ctx.lineTo(12.8, -2.5);
                ctx.closePath();
                ctx.fill();

                // Pirinç Klips
                ctx.fillStyle = "#facc15";
                ctx.fillRect(9.5, -8.9, 2.0, 1.4);
            }
            ctx.restore();
        }

        /**
         * K2 Korsan Kaptanı Şapkası (Tricorne) - Heybetli altın sırmalı 3 köşeli şapka
         */
        static drawK2Korsan(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const feltCol = "#18181b";
            const feltDark = "#09090b";
            const goldTrim = "#eab308";

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Profilde Başı 100% saran Tricorne
                ctx.fillStyle = feltCol;
                ctx.strokeStyle = feltDark;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(9.5, -6.0);
                ctx.lineTo(11.5, -8.5);
                ctx.lineTo(6.5, -14.5);
                ctx.lineTo(-1.5, -18.8); // Tepe noktası: saçtan yüksek!
                ctx.lineTo(-10.5, -17.0);
                ctx.lineTo(-12.8, -4.5);
                ctx.quadraticCurveTo(-2.0, -6.5, 9.5, -6.0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Altın Sırma Kenar
                ctx.strokeStyle = goldTrim;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(9.5, -6.0);
                ctx.lineTo(11.5, -8.5);
                ctx.lineTo(6.5, -14.5);
                ctx.lineTo(-1.5, -18.8);
                ctx.lineTo(-10.5, -17.0);
                ctx.lineTo(-12.8, -4.5);
                ctx.stroke();

                // Yan Kaptan Kokartı / Rozeti
                ctx.fillStyle = "#dc2626";
                ctx.beginPath();
                ctx.arc(-1.5, -11.0, 2.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = goldTrim;
                ctx.beginPath();
                ctx.arc(-1.5, -11.0, 1.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

            } else if (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left') {
                const cx = -dirSign * 0.4;

                // Arka Kubbe
                ctx.fillStyle = feltDark;
                ctx.beginPath();
                ctx.ellipse(cx, -7.5, 11.2, 9.6, 0, Math.PI, 0, false);
                ctx.fill();

                // Tricorne Ön Kanatları
                ctx.fillStyle = feltCol;
                ctx.strokeStyle = feltDark;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(cx - 14.5, -6.0);
                ctx.lineTo(cx - 14.0, -12.5);
                ctx.lineTo(cx, -18.8);
                ctx.lineTo(cx + 14.0, -12.5);
                ctx.lineTo(cx + 14.5, -6.0);
                ctx.quadraticCurveTo(cx, -7.5, cx - 14.5, -6.0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Altın Sırma
                ctx.strokeStyle = goldTrim;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(cx - 14.5, -6.0);
                ctx.lineTo(cx - 14.0, -12.5);
                ctx.lineTo(cx, -18.8);
                ctx.lineTo(cx + 14.0, -12.5);
                ctx.lineTo(cx + 14.5, -6.0);
                ctx.stroke();

                if (!isBack) {
                    ctx.fillStyle = goldTrim;
                    ctx.beginPath();
                    ctx.arc(cx, -12.0, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else if (isBack) {
                // Tam Sırt Görünümü: Arka kafatası kubbesi + arka kanatlar
                ctx.fillStyle = feltDark;
                ctx.beginPath();
                ctx.ellipse(0, -7.5, 11.2, 9.6, 0, Math.PI, 0, false);
                ctx.fill();

                ctx.fillStyle = feltCol;
                ctx.strokeStyle = goldTrim;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(-14.5, -6.0);
                ctx.lineTo(-14.0, -12.5);
                ctx.lineTo(0, -18.8);
                ctx.lineTo(14.0, -12.5);
                ctx.lineTo(14.5, -6.0);
                ctx.stroke();

            } else {
                // Tam Ön Görünüm
                ctx.fillStyle = feltDark;
                ctx.beginPath();
                ctx.ellipse(0, -7.5, 11.0, 9.6, 0, Math.PI, 0, false);
                ctx.fill();

                ctx.fillStyle = feltCol;
                ctx.strokeStyle = feltDark;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-14.5, -6.0);
                ctx.lineTo(-14.0, -12.5);
                ctx.lineTo(0, -18.8);
                ctx.lineTo(14.0, -12.5);
                ctx.lineTo(14.5, -6.0);
                ctx.quadraticCurveTo(0, -7.5, -14.5, -6.0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Altın Sırma
                ctx.strokeStyle = goldTrim;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(-14.5, -6.0);
                ctx.lineTo(-14.0, -12.5);
                ctx.lineTo(0, -18.8);
                ctx.lineTo(14.0, -12.5);
                ctx.lineTo(14.5, -6.0);
                ctx.stroke();

                // Kuru Kafa / Kaptan Arması
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(0, -12.5, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#000000";
                ctx.fillRect(-1.0, -11.0, 2.0, 1.2);
            }
            ctx.restore();
        }

        /**
         * K2 Prenses Tacı (Crown)
         */
        static drawK2Crown(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const gold = "#f59e0b";
            const ruby = "#ef4444";

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                ctx.fillStyle = gold;
                ctx.beginPath();
                ctx.moveTo(7.5, -7.5);
                ctx.lineTo(6.5, -14.0);
                ctx.lineTo(3.5, -9.5);
                ctx.lineTo(0, -14.5);
                ctx.lineTo(-3.5, -10.0);
                ctx.lineTo(-7.5, -14.0);
                ctx.lineTo(-8.5, -7.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = ruby;
                ctx.beginPath();
                ctx.arc(0, -14.5, 1.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();

            } else {
                ctx.fillStyle = gold;
                ctx.beginPath();
                ctx.moveTo(-7.5, -7.5);
                ctx.lineTo(-7.0, -14.0);
                ctx.lineTo(-3.5, -10.0);
                ctx.lineTo(0, -15.0);
                ctx.lineTo(3.5, -10.0);
                ctx.lineTo(7.0, -14.0);
                ctx.lineTo(7.5, -7.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = ruby;
                ctx.beginPath();
                ctx.arc(0, -15.0, 1.2, 0, Math.PI * 2);
                ctx.arc(-7.0, -14.0, 1.0, 0, Math.PI * 2);
                ctx.arc(7.0, -14.0, 1.0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        /**
         * K2 Sihirbaz Silindiri (Top Hat)
         */
        static drawK2Sihirbaz(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const silkCol = "#18181b";
            const ribbonCol = "#b91c1c";

            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                ctx.fillStyle = silkCol;
                ctx.beginPath();
                ctx.ellipse(-1.5, -6.5, 13.5, 2.5, 0.05, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(6.5, -6.5);
                ctx.lineTo(5.5, -22.5);
                ctx.lineTo(-8.5, -22.5);
                ctx.lineTo(-9.5, -6.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = ribbonCol;
                ctx.fillRect(-9.5, -9.0, 16.0, 2.5);

                ctx.restore();

            } else {
                ctx.fillStyle = silkCol;
                ctx.beginPath();
                ctx.ellipse(0, -6.5, 14.0, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(7.5, -6.5);
                ctx.lineTo(6.5, -22.5);
                ctx.lineTo(-6.5, -22.5);
                ctx.lineTo(-7.5, -6.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = ribbonCol;
                ctx.fillRect(-7.5, -9.0, 15.0, 2.5);
            }
            ctx.restore();
        }

        /**
         * K2 DJ Kulaklığı (Headphones)
         */
        static drawK2Kulaklik(ctx, facing, isBack, isProfile, p = null) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const padCol = "#09090b";
            const accentCol = "#06b6d4";

            ctx.strokeStyle = padCol;
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.arc(0, -4.5, 11.5, Math.PI * 1.1, Math.PI * 1.9, false);
            ctx.stroke();

            ctx.fillStyle = accentCol;
            if (isProfile) {
                ctx.beginPath();
                ctx.ellipse(dirSign * 0.5, -2.5, 3.5, 5.0, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = padCol;
                ctx.lineWidth = 1.0;
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.ellipse(-9.5, -2.5, 2.8, 5.0, 0, 0, Math.PI * 2);
                ctx.ellipse(9.5, -2.5, 2.8, 5.0, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = padCol;
                ctx.lineWidth = 1.0;
                ctx.stroke();
            }
            ctx.restore();
        }


        static drawConstructionHardhat(ctx, facing, isBack, isProfile, p = null, hatType = 'baret_sari', isFemale = false) {
            ctx.save();
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

            const hairColor = (p && p.hairColor && p.hairColor !== 'original' && p.hairColor.startsWith('#')) ? p.hairColor : "#26150b";
            let customHatCol = (p && p.hatColor && p.hatColor !== 'original' && p.hatColor.startsWith('#')) ? p.hatColor : null;

            let baretCol = '#facc15'; // Sarı (İşçi/Madenci)
            let baretHigh = '#fef08a';
            let baretShadow = '#ca8a04';
            let baretCrest = '#eab308';
            let visorColor = '#eab308';

            if (hatType.includes('beyaz')) {
                baretCol = '#f8fafc'; baretHigh = '#ffffff'; baretShadow = '#94a3b8'; baretCrest = '#e2e8f0'; visorColor = '#cbd5e1';
            } else if (hatType.includes('turuncu')) {
                baretCol = '#f97316'; baretHigh = '#fed7aa'; baretShadow = '#c2410c'; baretCrest = '#fb923c'; visorColor = '#ea580c';
            } else if (hatType.includes('mavi')) {
                baretCol = '#0284c7'; baretHigh = '#7dd3fc'; baretShadow = '#0369a1'; baretCrest = '#38bdf8'; visorColor = '#0284c7';
            } else if (hatType.includes('kirmizi')) {
                baretCol = '#dc2626'; baretHigh = '#fca5a5'; baretShadow = '#991b1b'; baretCrest = '#ef4444'; visorColor = '#b91c1c';
            } else if (hatType.includes('yesil')) {
                baretCol = '#16a34a'; baretHigh = '#86efac'; baretShadow = '#15803d'; baretCrest = '#22c55e'; visorColor = '#15803d';
            }

            if (customHatCol) {
                baretCol = customHatCol;
                visorColor = customHatCol;
            }

            // 1. Yan Profil Açısı: Kafanın tamamını önden arkaya saran anatomik kask formu
            if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // A) 3D Kask Kubbesi (Impact Dome - Üst ve arka kafatası koruması)
                const domeGrad = ctx.createLinearGradient(-10, -18, 8, -4);
                domeGrad.addColorStop(0, baretHigh);
                domeGrad.addColorStop(0.35, baretCol);
                domeGrad.addColorStop(1, baretShadow);

                ctx.fillStyle = domeGrad;
                ctx.strokeStyle = baretShadow;
                ctx.lineWidth = 0.8;

                ctx.beginPath();
                ctx.moveTo(8.0, -5.2);
                // Üst kubbe kavisi: Alından tepeye, tepeden enseye kafayı 100% içine alan kavis
                ctx.bezierCurveTo(6.0, -12.5, 2.0, -16.8, -2.0, -16.8);
                ctx.bezierCurveTo(-7.5, -16.8, -11.8, -11.5, -11.8, -2.5);
                // Ense koruma eteği (kafa arkasını tamamen kapatır)
                ctx.lineTo(-11.8, -1.8);
                // Alt kenar çizgisi (kulak üstünden geçerek alına bağlanır)
                ctx.quadraticCurveTo(-2.5, -5.8, 8.0, -5.2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Kubbe Alt Hacim Gölgesi
                const underGrad = ctx.createLinearGradient(0, -16, 0, -2);
                underGrad.addColorStop(0, "rgba(255,255,255,0.22)");
                underGrad.addColorStop(0.7, "rgba(0,0,0,0)");
                underGrad.addColorStop(1, "rgba(202, 138, 4, 0.4)");
                ctx.fillStyle = underGrad;
                ctx.beginPath();
                ctx.moveTo(8.0, -5.2);
                ctx.bezierCurveTo(6.0, -12.5, 2.0, -16.8, -2.0, -16.8);
                ctx.bezierCurveTo(-7.5, -16.8, -11.8, -11.5, -11.8, -2.5);
                ctx.lineTo(-11.8, -1.8);
                ctx.quadraticCurveTo(-2.5, -5.8, 8.0, -5.2);
                ctx.closePath();
                ctx.fill();

                // B) Baret Siperliği (360° Koruyucu Kenar & Ön Vizör / Peak)
                const visorGrad = ctx.createLinearGradient(-11, -2, 12, -4);
                visorGrad.addColorStop(0, baretShadow);
                visorGrad.addColorStop(0.5, baretCol);
                visorGrad.addColorStop(1, baretHigh);

                ctx.fillStyle = visorGrad;
                ctx.strokeStyle = baretShadow;
                ctx.lineWidth = 0.75;

                ctx.beginPath();
                ctx.moveTo(-12.4, -1.6);
                ctx.quadraticCurveTo(-2.5, -5.8, 7.8, -5.2);
                ctx.quadraticCurveTo(10.5, -5.0, 12.2, -4.5);
                ctx.quadraticCurveTo(12.6, -3.8, 11.8, -3.4);
                ctx.quadraticCurveTo(9.5, -3.8, 7.2, -4.2);
                ctx.quadraticCurveTo(-2.5, -4.8, -12.4, -0.6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // C) Tepe Darbe Kaburgası (Crown Rib - Aerodinamik kavis)
                ctx.fillStyle = baretHigh;
                ctx.strokeStyle = baretShadow;
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(4.5, -12.2);
                ctx.bezierCurveTo(1.5, -17.8, -2.5, -17.8, -5.8, -15.5);
                ctx.lineTo(-5.4, -14.6);
                ctx.bezierCurveTo(-2.5, -16.8, 1.2, -16.8, 4.0, -11.6);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // D) Ön Reflektör Şerit / İSG Yeşil Haç Amblemi
                ctx.save();
                ctx.translate(6.6, -9.2);
                ctx.rotate(0.24);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-2.2, -1.5, 4.4, 2.8);
                ctx.fillStyle = "#16a34a";
                ctx.fillRect(-0.6, -1.2, 1.2, 2.2);
                ctx.fillRect(-1.6, -0.7, 3.2, 1.2);
                ctx.restore();

                ctx.restore();

            } else if (isDiagonal) {
                // 2. Çapraz Açı (3/4 Görünüm)
                ctx.fillStyle = visorColor;
                ctx.strokeStyle = baretShadow;
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.ellipse(dirSign * 1.0, -6.5, 13.8, 3.4, dirSign * 0.06, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                const domeGrad = ctx.createLinearGradient(-dirSign * 8, -17, dirSign * 8, -6);
                domeGrad.addColorStop(0, baretHigh);
                domeGrad.addColorStop(0.4, baretCol);
                domeGrad.addColorStop(1, baretShadow);
                ctx.fillStyle = domeGrad;
                ctx.beginPath();
                ctx.ellipse(-dirSign * 0.4, -7.5, 11.4, 9.4, 0, Math.PI, 0, false);
                ctx.lineTo(-dirSign * 0.4 + (dirSign > 0 ? 11.4 : -11.4), -6.2);
                ctx.lineTo(-dirSign * 0.4 - (dirSign > 0 ? 11.4 : -11.4), -5.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = baretHigh;
                ctx.beginPath();
                ctx.roundRect(dirSign * 0.6 - 1.5, -17.2, 3.0, 9.2, 1.2);
                ctx.fill();
                ctx.stroke();

                if (!isBack) {
                    const embX = dirSign * 4.2;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(embX - 2.2, -11.2, 4.4, 2.6);
                    ctx.fillStyle = "#16a34a";
                    ctx.fillRect(embX - 0.6, -10.8, 1.2, 1.8);
                    ctx.fillRect(embX - 1.5, -10.3, 3.0, 0.8);
                }

            } else if (isBack) {
                // 3. Tam Sırt Görünümü
                ctx.fillStyle = visorColor;
                ctx.strokeStyle = baretShadow;
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.ellipse(0, -6.2, 13.5, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                const domeGrad = ctx.createLinearGradient(0, -17, 0, -5);
                domeGrad.addColorStop(0, baretHigh);
                domeGrad.addColorStop(0.45, baretCol);
                domeGrad.addColorStop(1, baretShadow);
                ctx.fillStyle = domeGrad;
                ctx.beginPath();
                ctx.ellipse(0, -7.2, 10.6, 9.4, 0, Math.PI, 0, false);
                ctx.lineTo(10.6, -5.8);
                ctx.lineTo(-10.6, -5.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = baretHigh;
                ctx.beginPath();
                ctx.roundRect(-1.5, -17.0, 3.0, 9.5, 1.2);
                ctx.fill();
                ctx.stroke();

            } else {
                // 4. Tam Ön Görünüm: Orijinal kusursuz genişlik ve form korunur
                ctx.fillStyle = visorColor;
                ctx.strokeStyle = baretShadow;
                ctx.lineWidth = 0.75;
                ctx.beginPath();
                ctx.ellipse(0, -6.5, 13.5, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                const domeGrad = ctx.createLinearGradient(0, -17, 0, -5);
                domeGrad.addColorStop(0, baretHigh);
                domeGrad.addColorStop(0.45, baretCol);
                domeGrad.addColorStop(1, baretShadow);
                ctx.fillStyle = domeGrad;
                ctx.beginPath();
                ctx.ellipse(0, -7.5, 10.4, 9.4, 0, Math.PI, 0, false);
                ctx.lineTo(10.4, -6.0);
                ctx.lineTo(-10.4, -6.0);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = baretHigh;
                ctx.beginPath();
                ctx.roundRect(-1.5, -17.2, 3.0, 9.4, 1.2);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-2.2, -11.2, 4.4, 2.6);
                ctx.fillStyle = "#16a34a";
                ctx.fillRect(-0.6, -10.8, 1.2, 1.8);
                ctx.fillRect(-1.5, -10.3, 3.0, 0.8);
            }

            ctx.restore();
        }

        /**
         * 8 Yönlü Kask & Şapka Saç Kırpma Matrisi (Hat Hair Clipping Matrix)
         * Kask/şapka takıldığında tepe ve siperlik dışına hiçbir saç pikselinin taşmamasını,
         * ancak siperlik altındaki alın perçemleri, kulak, ense ve omuz saçlarının
         * %100 doğal şekilde akmasını sağlayan anatomik kırpma maskesi.
         */
        /**
         * Kask ve Şapka Saç Kırpma Maskesi (Universal Anatomical Hair Clipping Mask)
         * Şapkanın ve baretin kapattığı kubbe, tepe ve arka kısımdan hiçbir saç teli taşamaz.
         * Ense, omuzlar, sırt, ponytail ve uzun dökümler ise doğal akışıyla %100 korunur.
         */
        static applyHatHairClipping(ctx, facing, isBack, isProfile, dirSign, hatType) {
            if (!hatType || hatType === 'none' || hatType === 'kulaklik') return;
            const cleanHat = typeof hatType === 'string' ? hatType.replace(/^hats_/, '') : '';

            if (cleanHat === 'crown') {
                // Taç açık başlıktır; sadece taçtan daha yüksek fırlayan aşırı sivri uçları sınırlar
                ctx.beginPath();
                ctx.rect(-35, -12.5, 70, 55);
                ctx.clip();
                return;
            }

            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');
            const isSihirbaz = (cleanHat === 'sihirbaz');

            ctx.beginPath();

            if (cleanHat === 'fes') {
                // FES: Kusursuz oturan heybetli Osmanlı fesi silüeti
                if (isProfile) {
                    const s = dirSign;
                    ctx.moveTo(s * 10.0, -5.5);
                    ctx.lineTo(s * 7.8, -19.0);
                    ctx.lineTo(s * -10.0, -19.0);
                    ctx.lineTo(s * -12.5, -3.2);
                    ctx.lineTo(s * -12.5, 0);
                    // Alt serbest bölge
                    ctx.lineTo(s * -35, 1.0);
                    ctx.lineTo(s * -35, 45);
                    ctx.lineTo(s * 35, 45);
                    ctx.lineTo(s * 35, 1.0);
                    ctx.lineTo(s * 10.0, 0);
                } else {
                    const cx = isDiagonal ? -dirSign * 0.4 : 0;
                    ctx.moveTo(cx - 12.5, -5.8);
                    ctx.lineTo(cx - 10.0, -19.0);
                    ctx.lineTo(cx + 10.0, -19.0);
                    ctx.lineTo(cx + 12.5, -5.8);
                    ctx.lineTo(cx + 12.5, -1.0);
                    // Alt serbest bölge
                    ctx.lineTo(35, 1.5);
                    ctx.lineTo(35, 45);
                    ctx.lineTo(-35, 45);
                    ctx.lineTo(-35, 1.5);
                    ctx.lineTo(cx - 12.5, -1.0);
                }
                ctx.closePath();
                ctx.clip();
                return;
            }

            if (cleanHat === 'cowboy') {
                // KOVBOY: Geniş siperlik ve heybetli tac
                if (isProfile) {
                    const s = dirSign;
                    ctx.moveTo(s * 15.0, -4.5);
                    ctx.lineTo(s * 5.8, -19.0);
                    ctx.lineTo(s * -9.5, -19.0);
                    ctx.lineTo(s * -14.5, -3.5);
                    ctx.lineTo(s * -14.5, -0.5);
                    // Alt serbest bölge
                    ctx.lineTo(s * -35, 1.0);
                    ctx.lineTo(s * -35, 45);
                    ctx.lineTo(s * 35, 45);
                    ctx.lineTo(s * 35, 1.0);
                    ctx.lineTo(s * 15.0, -0.5);
                } else {
                    const cx = isDiagonal ? -dirSign * 0.4 : 0;
                    ctx.moveTo(cx - 16.5, -5.0);
                    ctx.lineTo(cx - 9.5, -19.0);
                    ctx.lineTo(cx + 9.5, -19.0);
                    ctx.lineTo(cx + 16.5, -5.0);
                    ctx.lineTo(cx + 16.5, -1.5);
                    // Alt serbest bölge
                    ctx.lineTo(35, 1.5);
                    ctx.lineTo(35, 45);
                    ctx.lineTo(-35, 45);
                    ctx.lineTo(-35, 1.5);
                    ctx.lineTo(cx - 16.5, -1.5);
                }
                ctx.closePath();
                ctx.clip();
                return;
            }

            if (cleanHat === 'korsan') {
                // KORSAN: Tricorne tepe ve kanatları
                if (isProfile) {
                    const s = dirSign;
                    ctx.moveTo(s * 10.5, -5.5);
                    ctx.lineTo(s * -1.5, -19.0);
                    ctx.lineTo(s * -13.5, -4.5);
                    ctx.lineTo(s * -13.5, -0.5);
                    // Alt serbest bölge
                    ctx.lineTo(s * -35, 1.0);
                    ctx.lineTo(s * -35, 45);
                    ctx.lineTo(s * 35, 45);
                    ctx.lineTo(s * 35, 1.0);
                    ctx.lineTo(s * 10.5, -0.5);
                } else {
                    const cx = isDiagonal ? -dirSign * 0.4 : 0;
                    ctx.moveTo(cx - 15.0, -5.5);
                    ctx.lineTo(cx - 14.0, -13.0);
                    ctx.lineTo(cx, -19.0);
                    ctx.lineTo(cx + 14.0, -13.0);
                    ctx.lineTo(cx + 15.0, -5.5);
                    ctx.lineTo(cx + 14.0, -1.5);
                    // Alt serbest bölge
                    ctx.lineTo(35, 1.5);
                    ctx.lineTo(35, 45);
                    ctx.lineTo(-35, 45);
                    ctx.lineTo(-35, 1.5);
                    ctx.lineTo(cx - 14.0, -1.5);
                }
                ctx.closePath();
                ctx.clip();
                return;
            }

            // DİĞER BAŞLIKLAR (Baret, Kova Şapka, Bere, Kasket, Sihirbaz):
            const topPeakY = isSihirbaz ? -24.5 : -18.0;
            if (isProfile) {
                const s = dirSign;
                ctx.moveTo(s * 9.0, -5.0);
                ctx.quadraticCurveTo(s * 6.0, -13.0, s * 0, topPeakY);
                ctx.bezierCurveTo(s * -6.5, topPeakY, s * -11.8, -12.0, s * -11.8, -2.5);
                ctx.lineTo(s * -12.2, -0.6);
                // Alt serbest bölge
                ctx.lineTo(s * -35, -0.6);
                ctx.lineTo(s * -35, 45);
                ctx.lineTo(s * 35, 45);
                ctx.lineTo(s * 35, -5.0);
                ctx.closePath();
                ctx.clip();
                return;
            } else {
                const domeRx = isSihirbaz ? 9.5 : 11.5;
                const domeRy = isSihirbaz ? 15.0 : 10.0;
                const domeCenterY = isSihirbaz ? -12.0 : -7.5;
                ctx.ellipse(0, domeCenterY, domeRx, domeRy, 0, Math.PI, 0, false);
                const vRx = 13.5;
                ctx.lineTo(vRx, -5.5);
                ctx.lineTo(vRx, -1.0);
                ctx.lineTo(35, 2.0);
                ctx.lineTo(35, 45);
                ctx.lineTo(-35, 45);
                ctx.lineTo(-35, 2.0);
                ctx.lineTo(-vRx, -1.0);
                ctx.lineTo(-vRx, -5.5);
                ctx.closePath();
                ctx.clip();
                return;
            }
        }

        static drawSkeletalHair(ctx, p, facing, isBack, isProfile, isFemale = false) {
            if (p && (p.outfit === 'outfit_k2_cat' || p.outfit === 'outfits_outfit_k2_cat')) return;

            let hatType = (p && (p.hat || (p.avatar && p.avatar.hat))) || 'none';
            let hairType = (p && (p.hair || (p.avatar && p.avatar.hair))) || 'none';

            // Geriye dönük uyumluluk: Eski kayıtlarda saç p.hat içinde kayıtlıysa ve p.hair boşsa
            if (typeof hatType === 'string' && hatType.startsWith('hair_') && hairType === 'none') {
                hairType = hatType;
                hatType = 'none';
            }

            const isBaret = typeof hatType === 'string' && (hatType.startsWith('baret_') || hatType.startsWith('hats_baret_'));
            const hairColor = (p && p.hairColor && p.hairColor !== 'original' && p.hairColor.startsWith('#')) ? p.hairColor : ((p && p.hatColor && p.hatColor !== 'original' && p.hatColor.startsWith('#')) ? p.hatColor : ((p && p.color && p.color.startsWith('#')) ? p.color : "#26150b"));
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isDiagonal = (facing === 'down-right' || facing === 'up-right' || facing === 'down-left' || facing === 'up-left');

            const hasHat = typeof hatType === 'string' && hatType !== 'none';

            // Kask veya Şapka takılıyken: Saçların şapka/baret dışına taşmasını %100 engelleyen anatomik maske.
            // Alt kısımdaki saçlar (ense, omuz, sırt, yanlar, perçemler) doğal akmaya devam eder.
            if (hasHat) {
                ctx.save();
                this.applyHatHairClipping(ctx, facing, isBack, isProfile, dirSign, hatType);
            }

            const isK2FlamingFire = (hairType === 'hair_k2_flaming_fire' || hairType === 'hats_hair_k2_flaming_fire');
            const isK2FadePompadour = (hairType === 'hair_k2_fade_pompadour' || hairType === 'hats_hair_k2_fade_pompadour');
            const isK2AnimeSpiky = (hairType === 'hair_k2_anime_spiky' || hairType === 'hats_hair_k2_anime_spiky');
            const isK2TwinTails = (hairType === 'hair_k2_twin_tails' || hairType === 'hats_hair_k2_twin_tails');
            const isK2Ponytail = (hairType === 'hair_k2_ponytail' || hairType === 'hats_hair_k2_ponytail');
            const isK2MessyBun = (hairType === 'hair_k2_messy_bun' || hairType === 'hats_hair_k2_messy_bun');
            const isK2CurtainBangs = (hairType === 'hair_k2_curtain_bangs' || hairType === 'hats_hair_k2_curtain_bangs');
            const isK2FrenchBob = (hairType === 'hair_k2_french_bob' || hairType === 'hats_hair_k2_french_bob');
            const isK2LayeredBlowout = (hairType === 'hair_k2_layered_blowout' || hairType === 'hats_hair_k2_layered_blowout');
            const isK2HalfUpBraid = (hairType === 'hair_k2_half_up_braid' || hairType === 'hats_hair_k2_half_up_braid');
            const isK2WavyShoulder = (hairType === 'hair_k2_wavy_shoulder' || hairType === 'hats_hair_k2_wavy_shoulder');
            const isK2HimeCut = (hairType === 'hair_k2_hime_cut' || hairType === 'hats_hair_k2_hime_cut');
            const isK2CurlyBrown = (hairType === 'hair_curly_brown' || hairType === 'hats_hair_curly_brown' || (typeof hairType === 'string' && (hairType.startsWith('hair_curly_brown') || hairType.startsWith('hats_hair_curly_brown'))));
            const isDefaultFemaleHair = (isFemale && (hairType === 'none' || !hairType || hairType === ''));

            let hairDrawn = false;
            if (isK2FlamingFire) {
                this.drawK2FlamingFire(ctx, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2FadePompadour) {
                this.drawK2FadePompadour(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2AnimeSpiky) {
                this.drawK2AnimeSpiky(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2TwinTails) {
                this.drawK2TwinTails(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2Ponytail) {
                this.drawK2Ponytail(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2MessyBun) {
                this.drawK2MessyBun(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2CurtainBangs) {
                this.drawK2CurtainBangs(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2FrenchBob) {
                this.drawK2FrenchBob(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2LayeredBlowout) {
                this.drawK2LayeredBlowout(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2HalfUpBraid) {
                this.drawK2HalfUpBraid(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2WavyShoulder || isDefaultFemaleHair) {
                this.drawK2WavyShoulder(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2HimeCut) {
                this.drawK2HimeCut(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (isK2CurlyBrown) {
                this.drawK2CurlyBrown(ctx, hairColor, facing, isBack, isProfile, dirSign);
                hairDrawn = true;
            } else if (hairType !== 'none' && typeof drawAvatarHairAndHats === 'function') {
                drawAvatarHairAndHats(ctx, 0, 15.5, hairType, facing);
                hairDrawn = true;
            }

            if (!hairDrawn && !isFemale) {
                // Erkek Kısa Skater Saçı (Buzz Fade)
                const highlightColor = "rgba(255,255,255,0.12)";

                ctx.save();
                ctx.fillStyle = hairColor;

                if (isBack) {
                    ctx.beginPath();
                    ctx.arc(0, -3.2, 10.3, Math.PI * 0.88, Math.PI * 0.12, false);
                    ctx.quadraticCurveTo(8.5, 3.0, 5.0, 4.8);
                    ctx.lineTo(-5.0, 4.8);
                    ctx.quadraticCurveTo(-8.5, 3.0, -9.8, -1.8);
                    ctx.closePath();
                    ctx.fill();

                    ctx.fillStyle = "rgba(0,0,0,0.22)";
                    ctx.beginPath();
                    ctx.roundRect(-4.5, 2.8, 9.0, 2.0, [0, 0, 2, 2]);
                    ctx.fill();

                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(0, -5.0, 7.8, Math.PI * 1.15, Math.PI * 1.85);
                    ctx.stroke();

                } else if (isProfile) {
                    ctx.beginPath();
                    ctx.arc(0, -3.2, 10.3, Math.PI * 0.65, Math.PI * 1.85, false);
                    ctx.lineTo(dirSign * 6.5, -7.5);
                    ctx.quadraticCurveTo(dirSign * 2.0, -8.0, 0, -6.5);
                    ctx.lineTo(-dirSign * 1.2, -1.5);
                    ctx.lineTo(-dirSign * 3.5, -2.5);
                    ctx.quadraticCurveTo(-dirSign * 6.0, 1.5, -dirSign * 4.0, 4.2);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(0, -5.0, 7.5, Math.PI * 1.25, Math.PI * 1.75);
                    ctx.stroke();

                } else {
                    const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

                    ctx.beginPath();
                    ctx.arc(0, -3.2, 10.3, Math.PI * 0.95, Math.PI * 2.05, false);
                    ctx.quadraticCurveTo(8.5, -3.0, 7.5 + fShift * 0.4, -6.0);
                    ctx.quadraticCurveTo(3.0 + fShift, -4.5, fShift, -6.8);
                    ctx.quadraticCurveTo(-3.0 + fShift, -4.5, -7.5 + fShift * 0.4, -6.0);
                    ctx.quadraticCurveTo(-8.5, -3.0, -9.8, -1.8);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(fShift * 0.5, -5.5, 7.5, Math.PI * 1.2, Math.PI * 1.8);
                    ctx.stroke();
                }

                ctx.restore();
            }

            if (hasHat) {
                ctx.restore();
            }

            // 2. Şapkalar / Baretler saç üzerine katmanlanır (Gerçekçi Layering)
            const cleanHat = typeof hatType === 'string' ? hatType.replace(/^hats_/, '') : '';

            if (isBaret) {
                this.drawConstructionHardhat(ctx, facing, isBack, isProfile, p, hatType, isFemale);
            } else if (cleanHat === 'k2_skater_bucket') {
                this.drawSkaterBucketHat(ctx, facing, isBack, isProfile, p);
            } else if (cleanHat === 'bere') {
                this.drawK2Bere(ctx, facing, isBack, isProfile, p, false);
            } else if (cleanHat === 'beret_pink') {
                this.drawK2Bere(ctx, facing, isBack, isProfile, p, true);
            } else if (cleanHat === 'kasket') {
                this.drawK2Kasket(ctx, facing, isBack, isProfile, p);
            } else if (cleanHat === 'cowboy') {
                this.drawK2Cowboy(ctx, facing, isBack, isProfile, p);
            } else if (cleanHat === 'fes') {
                this.drawK2Fes(ctx, facing, isBack, isProfile, p);
            } else if (cleanHat === 'korsan') {
                this.drawK2Korsan(ctx, facing, isBack, isProfile, p);
            } else if (cleanHat === 'crown') {
                this.drawK2Crown(ctx, facing, isBack, isProfile, p);
            } else if (cleanHat === 'sihirbaz') {
                this.drawK2Sihirbaz(ctx, facing, isBack, isProfile, p);
            } else if (cleanHat === 'kulaklik') {
                this.drawK2Kulaklik(ctx, facing, isBack, isProfile, p);
            } else if (hatType !== 'none' && typeof drawAvatarHairAndHats === 'function') {
                drawAvatarHairAndHats(ctx, 0, 15.5, hatType, facing);
            }
        }
    

        /**
         * K2 Twin Tails (İkiz Örgü / İkiz Atkuyruğu - Sevimli Chibi Twintails & Kurdeleler)
         */
        static drawK2TwinTails(ctx, hairColor, facing, isBack, isProfile, dirSign) {
            const highlightColor = "rgba(255, 255, 255, 0.26)";
            const shadowColor = "rgba(0, 0, 0, 0.25)";
            const ribbonColor = "#ec4899";
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            ctx.save();
            ctx.fillStyle = hairColor;

            if (isBack) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.88, Math.PI * 0.12, false);
                ctx.quadraticCurveTo(8.5, 3.0, 5.0, 5.2);
                ctx.lineTo(-5.0, 5.2);
                ctx.quadraticCurveTo(-8.5, 3.0, -9.8, -1.8);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = shadowColor;
                ctx.lineWidth = 0.9;
                ctx.beginPath();
                ctx.moveTo(0, -12.5);
                ctx.lineTo(0, 4.5);
                ctx.stroke();

                [-1, 1].forEach(side => {
                    const tx = side * 8.2;
                    const ty = -3.5;
                    ctx.fillStyle = hairColor;
                    ctx.beginPath();
                    ctx.moveTo(tx - side * 1.5, ty);
                    ctx.bezierCurveTo(side * 12.5, 0.5, side * 13.5, 6.0, side * 9.5, 11.5);
                    ctx.bezierCurveTo(side * 10.5, 6.5, side * 9.2, 1.5, tx + side * 1.5, ty);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.moveTo(tx, ty + 1.0);
                    ctx.bezierCurveTo(side * 11.8, 1.5, side * 12.2, 5.5, side * 9.5, 10.5);
                    ctx.stroke();

                    ctx.fillStyle = ribbonColor;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 1.4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(tx - 1.2, ty + 0.8, 0.8, 2.2);
                    ctx.fillRect(tx + 0.4, ty + 0.8, 0.8, 2.2);
                });

            } else if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // 1. Arka At Kuyruğu (Derinlik Gölgesi)
                ctx.fillStyle = shadowColor;
                ctx.beginPath();
                ctx.moveTo(-6.5, -3.0);
                ctx.bezierCurveTo(-10.5, 1.0, -10.8, 6.0, -7.5, 10.0);
                ctx.bezierCurveTo(-8.2, 6.0, -7.2, 1.5, -5.5, -3.0);
                ctx.fill();

                // 2. Kafa Tabanı Saçı (Kafatasını ve enseyi tam kapatan saç kütlesi)
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.moveTo(7.2, -6.8);
                ctx.quadraticCurveTo(5.0, -11.5, 0, -13.5);
                ctx.quadraticCurveTo(-7.5, -13.4, -11.0, -6.5);
                ctx.quadraticCurveTo(-11.8, -1.0, -10.5, 3.5);
                ctx.quadraticCurveTo(-8.5, 6.0, -5.5, 6.5);
                ctx.quadraticCurveTo(-2.0, 5.0, -0.5, 2.5);
                ctx.quadraticCurveTo(1.5, -1.0, 3.2, -4.2);
                ctx.quadraticCurveTo(5.0, -6.0, 7.2, -6.8);
                ctx.closePath();
                ctx.fill();

                // 3. Ön At Kuyruğu
                const nearTx = -3.0;
                const nearTy = -3.5;
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.moveTo(nearTx - 1.5, nearTy);
                ctx.bezierCurveTo(-8.0, 1.0, -6.5, 7.5, -1.5, 12.0);
                ctx.bezierCurveTo(-4.2, 7.0, -5.0, 1.5, nearTx + 1.5, nearTy);
                ctx.closePath();
                ctx.fill();

                // Işıltı
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(nearTx, nearTy + 1.0);
                ctx.bezierCurveTo(-6.8, 1.5, -5.5, 7.0, -1.8, 11.0);
                ctx.stroke();

                // Kurdele
                ctx.fillStyle = ribbonColor;
                ctx.beginPath();
                ctx.arc(nearTx, nearTy, 1.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(nearTx - 0.8, nearTy + 0.8, 1.6, 2.4);

                ctx.restore();

            } else {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.95, Math.PI * 2.05, false);
                ctx.quadraticCurveTo(8.8, -2.5, 8.0 + fShift * 0.4, -4.5);
                ctx.quadraticCurveTo(5.0 + fShift, -3.5, 3.2 + fShift, -5.0);
                ctx.quadraticCurveTo(1.0 + fShift, -3.2, -0.5 + fShift, -5.2);
                ctx.quadraticCurveTo(-2.8 + fShift, -3.5, -4.8 + fShift, -5.0);
                ctx.quadraticCurveTo(-7.5 + fShift, -3.5, -8.2 + fShift * 0.4, -4.5);
                ctx.quadraticCurveTo(-9.2, -2.5, -10.2, -1.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.arc(fShift * 0.4, -5.8, 7.6, Math.PI * 1.2, Math.PI * 1.8);
                ctx.stroke();

                [-1, 1].forEach(side => {
                    const tx = side * 8.6 + fShift * 0.3;
                    const ty = -3.2;

                    ctx.fillStyle = shadowColor;
                    ctx.beginPath();
                    ctx.ellipse(tx + side * 1.2, ty + 3.0, 1.8, 3.8, side * 0.25, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = hairColor;
                    ctx.beginPath();
                    ctx.moveTo(tx - side * 1.4, ty);
                    ctx.bezierCurveTo(side * 12.2 + fShift * 0.4, 1.5, side * 12.8 + fShift * 0.4, 6.5, side * 8.8 + fShift * 0.2, 11.2);
                    ctx.bezierCurveTo(side * 10.2 + fShift * 0.3, 6.5, side * 9.6 + fShift * 0.3, 1.5, tx + side * 1.4, ty);
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = highlightColor;
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.moveTo(tx, ty + 1.2);
                    ctx.bezierCurveTo(side * 11.4 + fShift * 0.4, 2.0, side * 11.8 + fShift * 0.4, 6.0, side * 9.0 + fShift * 0.2, 10.2);
                    ctx.stroke();

                    ctx.fillStyle = ribbonColor;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillRect(tx - 0.7, ty + 0.8, 1.4, 2.2);
                });
            }

            ctx.restore();
        }

        /**
         * K2 Wavy Shoulder (Omuz Hizası Dalgalı Katlı Kadın Saçı - Doğal Tebessüm & Zarafet)
         */
        static drawK2WavyShoulder(ctx, hairColor, facing, isBack, isProfile, dirSign) {
            const highlightColor = "rgba(255, 255, 255, 0.24)";
            const shadowColor = "rgba(0, 0, 0, 0.22)";
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            ctx.save();
            ctx.fillStyle = hairColor;

            if (isBack) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.5, Math.PI * 0.85, Math.PI * 0.15, false);
                ctx.bezierCurveTo(9.8, 2.0, 10.8, 6.5, 8.5, 9.8);
                ctx.quadraticCurveTo(5.0, 8.5, 2.0, 9.5);
                ctx.quadraticCurveTo(-2.0, 8.5, -5.0, 9.5);
                ctx.bezierCurveTo(-8.5, 9.8, -10.8, 6.5, -9.8, 2.0);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = shadowColor;
                ctx.beginPath();
                ctx.ellipse(0, 6.2, 6.0, 1.8, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.0, 7.6, Math.PI * 1.15, Math.PI * 1.85);
                ctx.moveTo(-5.5, 3.5); ctx.quadraticCurveTo(-7.0, 6.0, -6.0, 8.5);
                ctx.moveTo(5.5, 3.5); ctx.quadraticCurveTo(7.0, 6.0, 6.0, 8.5);
                ctx.stroke();

            } else if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Kafatası kubbesini, enseyi ve boyun arkasını tamamen örten kusursuz dalgalı saç silüeti
                ctx.beginPath();
                ctx.moveTo(7.2, -6.8);
                // Tepe kubbesi ve arka kafatası yayılımı
                ctx.quadraticCurveTo(5.0, -11.5, 0, -13.6);
                ctx.quadraticCurveTo(-7.5, -13.5, -11.2, -6.5);
                ctx.quadraticCurveTo(-12.5, -2.0, -11.5, 2.5);
                // Omuza dökülen dalgalı hacim (kafatasını ve enseyi %100 sarar)
                ctx.quadraticCurveTo(-10.8, 6.0, -8.5, 9.5);
                ctx.quadraticCurveTo(-7.0, 11.0, -4.5, 11.2);
                // Omuz üstü dalgalı alt hat
                ctx.quadraticCurveTo(-1.5, 9.8, 0.5, 10.8);
                ctx.quadraticCurveTo(2.2, 11.2, 3.8, 9.6);
                // Yüzü ve çeneyi çerçeveleyen ön lüle
                ctx.quadraticCurveTo(4.2, 6.5, 3.0, 2.5);
                ctx.quadraticCurveTo(1.5, -1.0, 3.2, -4.2);
                ctx.quadraticCurveTo(5.0, -6.0, 7.2, -6.8);
                ctx.closePath();
                ctx.fill();

                // Işıltı ve saç teli çizgileri
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.5, 7.5, Math.PI * 1.25, Math.PI * 1.75);
                ctx.moveTo(-4.0, 3.0);
                ctx.quadraticCurveTo(-6.0, 6.5, -3.5, 9.8);
                ctx.moveTo(1.5, 2.0);
                ctx.quadraticCurveTo(2.8, 5.5, 1.8, 8.5);
                ctx.stroke();

                ctx.restore();

            } else {
                ctx.fillStyle = shadowColor;
                [-1, 1].forEach(side => {
                    ctx.beginPath();
                    ctx.ellipse(side * 8.6 + fShift * 0.4, 4.0, 2.2, 5.5, side * 0.12, 0, Math.PI * 2);
                    ctx.fill();
                });

                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.5, Math.PI * 0.95, Math.PI * 2.05, false);
                ctx.bezierCurveTo(9.6, -1.0, 10.8 + fShift * 0.4, 4.0, 8.5 + fShift * 0.3, 9.5);
                ctx.quadraticCurveTo(7.2 + fShift * 0.3, 7.5, 6.2 + fShift * 0.2, 3.5);
                ctx.quadraticCurveTo(4.5 + fShift, -1.5, 1.8 + fShift, -4.5);
                ctx.quadraticCurveTo(0 + fShift, -3.2, -1.8 + fShift, -4.5);
                ctx.quadraticCurveTo(-4.5 + fShift, -1.5, -6.2 + fShift * 0.2, 3.5);
                ctx.quadraticCurveTo(-7.2 + fShift * 0.3, 7.5, -8.5 + fShift * 0.3, 9.5);
                ctx.bezierCurveTo(-10.8 + fShift * 0.4, 4.0, -9.6, -1.0, -10.4, -2.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.arc(fShift * 0.4, -5.6, 7.6, Math.PI * 1.2, Math.PI * 1.8);
                ctx.moveTo(-8.0 + fShift * 0.3, 1.0);
                ctx.quadraticCurveTo(-9.2 + fShift * 0.4, 4.5, -7.5 + fShift * 0.3, 8.5);
                ctx.moveTo(8.0 + fShift * 0.3, 1.0);
                ctx.quadraticCurveTo(9.2 + fShift * 0.4, 4.5, 7.5 + fShift * 0.3, 8.5);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * K2 Hime Cut (Geleneksel Düz Kahkül, Yanak Hizasında Keskin Yan Bukleler & Uzun Düz Saç)
         */
        static drawK2HimeCut(ctx, hairColor, facing, isBack, isProfile, dirSign) {
            const highlightColor = "rgba(255, 255, 255, 0.28)";
            const shadowColor = "rgba(0, 0, 0, 0.28)";
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            ctx.save();
            ctx.fillStyle = hairColor;

            if (isBack) {
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.88, Math.PI * 0.12, false);
                ctx.lineTo(9.5, 12.5);
                ctx.lineTo(-9.5, 12.5);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = shadowColor;
                ctx.fillRect(-9.5, 11.5, 19.0, 1.0);

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(0, -5.0, 7.6, Math.PI * 1.15, Math.PI * 1.85);
                ctx.moveTo(-7.0, 4.0); ctx.lineTo(-7.0, 10.5);
                ctx.moveTo(7.0, 4.0); ctx.lineTo(7.0, 10.5);
                ctx.stroke();

            } else if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                // Arka Düz Uzun Saç Kütlesi (Sırt boyunca dökülen düz saç)
                ctx.fillStyle = shadowColor;
                ctx.beginPath();
                ctx.moveTo(-2.0, 4.0);
                ctx.lineTo(-2.0, 13.5);
                ctx.lineTo(-9.8, 13.5);
                ctx.lineTo(-9.8, 4.0);
                ctx.closePath();
                ctx.fill();

                // Kafa Tabanı, Düz Ön Kâkül & Hime Yan Buklesi (Kafatasını ve enseyi %100 kapatır)
                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.moveTo(7.2, -6.8);
                // Tepe kubbesi
                ctx.quadraticCurveTo(5.0, -11.5, 0, -13.5);
                ctx.quadraticCurveTo(-7.5, -13.4, -11.2, -6.5);
                ctx.quadraticCurveTo(-12.0, -1.0, -11.0, 4.0);
                ctx.lineTo(-9.5, 13.5);
                ctx.lineTo(-4.5, 13.5);
                ctx.lineTo(-4.5, 3.5);
                // İmza Hime Yan Buklesi (Çene hizasında küt kesim)
                ctx.lineTo(3.2, 3.5);
                ctx.lineTo(3.2, -3.8);
                ctx.quadraticCurveTo(5.0, -6.0, 7.2, -6.8);
                ctx.closePath();
                ctx.fill();

                // Vurgu Çizgileri
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(0, -5.5, 7.5, Math.PI * 1.22, Math.PI * 1.78);
                ctx.moveTo(-7.0, 3.0);
                ctx.lineTo(-7.0, 12.0);
                ctx.moveTo(1.8, -1.0);
                ctx.lineTo(1.8, 3.0);
                ctx.stroke();

                ctx.restore();

            } else {
                ctx.fillStyle = shadowColor;
                ctx.fillRect(-9.8, -1.0, 19.6, 13.5);

                ctx.fillStyle = hairColor;
                ctx.beginPath();
                ctx.arc(0, -3.2, 10.4, Math.PI * 0.95, Math.PI * 2.05, false);
                ctx.lineTo(9.8 + fShift * 0.3, -2.0);
                ctx.lineTo(9.8 + fShift * 0.3, 2.2);
                ctx.lineTo(7.4 + fShift * 0.3, 2.2);
                ctx.lineTo(7.4 + fShift * 0.3, -4.6);
                ctx.lineTo(-7.4 + fShift * 0.3, -4.6);
                ctx.lineTo(-7.4 + fShift * 0.3, 2.2);
                ctx.lineTo(-9.8 + fShift * 0.3, 2.2);
                ctx.lineTo(-9.8 + fShift * 0.3, -2.0);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.arc(fShift * 0.4, -5.6, 7.6, Math.PI * 1.2, Math.PI * 1.8);
                ctx.moveTo(-8.6 + fShift * 0.3, -2.0); ctx.lineTo(-8.6 + fShift * 0.3, 1.8);
                ctx.moveTo(8.6 + fShift * 0.3, -2.0); ctx.lineTo(8.6 + fShift * 0.3, 1.8);
                ctx.stroke();

                ctx.fillStyle = shadowColor;
                ctx.fillRect(-7.4 + fShift * 0.3, -4.8, 14.8, 0.6);
            }

            ctx.restore();
        }


        static drawK2FadePompadour(ctx, hairColor, facing, isBack, isProfile, dirSign) {
        const highlightColor = "rgba(255, 255, 255, 0.22)";
        const shadowColor = "rgba(0, 0, 0, 0.28)";

        ctx.save();
        ctx.fillStyle = hairColor;

        if (isBack) {
            // Arka Açı: Ense Fade & Üst Taraklı Pompadour Hacmi
            ctx.beginPath();
            ctx.arc(0, -5.0, 9.8, Math.PI * 0.90, Math.PI * 0.10, false);
            ctx.quadraticCurveTo(8.5, 1.0, 5.0, 3.5);
            ctx.lineTo(-5.0, 3.5);
            ctx.quadraticCurveTo(-8.5, 1.0, -9.5, -2.5);
            ctx.closePath();
            ctx.fill();

            // Ense Fade Gradyanı (Temiz Kare Traş Çizgisi)
            ctx.fillStyle = "rgba(0,0,0,0.25)";
            ctx.beginPath();
            ctx.roundRect(-4.2, 1.8, 8.4, 2.2, [0, 0, 2, 2]);
            ctx.fill();

            // Tepe Pompadour Hacim Çizgileri
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, -7.5, 7.0, Math.PI * 1.15, Math.PI * 1.85);
            ctx.moveTo(-3.5, -2.0); ctx.quadraticCurveTo(-1.5, -7.5, -0.5, -13.0);
            ctx.moveTo(3.5, -2.0); ctx.quadraticCurveTo(1.5, -7.5, 0.5, -13.0);
            ctx.stroke();

        } else if (isProfile) {
            ctx.save();
            if (dirSign < 0) ctx.scale(-1, 1);

            // Yan Fade Gölgesi
            ctx.fillStyle = shadowColor;
            ctx.beginPath();
            ctx.moveTo(4.0, -4.5);
            ctx.quadraticCurveTo(0, -6.0, -7.5, -3.5);
            ctx.quadraticCurveTo(-10.0, 0, -8.0, 3.5);
            ctx.quadraticCurveTo(-4.0, 4.5, -1.0, 2.0);
            ctx.closePath();
            ctx.fill();

            // Üst Pompadour Kabarık Dalga (Önden yükselip arkaya süzülen dalga)
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.moveTo(7.0, -5.5);
            // Alından yukarı doğru fırlayan hacimli pompadour kavisli tepesi
            ctx.quadraticCurveTo(10.5, -11.5, 6.0, -16.8);
            ctx.quadraticCurveTo(0.5, -17.5, -6.5, -15.0);
            ctx.quadraticCurveTo(-11.5, -10.5, -10.8, -1.0);
            ctx.quadraticCurveTo(-11.2, 2.5, -9.0, 4.5);
            ctx.quadraticCurveTo(-6.5, 5.0, -5.0, 3.0);
            // Yan favori geçişi
            ctx.quadraticCurveTo(-1.5, -2.0, 2.0, -3.5);
            ctx.quadraticCurveTo(5.5, -4.0, 7.0, -5.5);
            ctx.closePath();
            ctx.fill();

            // Işıltı & Tarak Dalgası Vurgusu
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(6.0, -10.5);
            ctx.quadraticCurveTo(3.5, -15.0, -2.5, -15.5);
            ctx.quadraticCurveTo(-7.5, -13.5, -9.0, -8.5);
            ctx.stroke();

            ctx.restore();

        } else {
            // Tam Ön & 3/4 Ön: Alından yukarı doğru yükselen kabarık asimetrik dalga
            const shiftX = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            // 1. Yan Traş / Fade Tabanı
            ctx.fillStyle = shadowColor;
            ctx.beginPath();
            ctx.ellipse(-8.2 + shiftX * 0.4, -3.0, 2.2, 4.0, 0, 0, Math.PI * 2);
            ctx.ellipse(8.2 + shiftX * 0.4, -3.0, 2.2, 4.0, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Ana Pompadour Kütlesi (Alından göğe yükselen asimetrik tepe)
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.moveTo(-8.5 + shiftX * 0.3, -4.5);
            ctx.quadraticCurveTo(-10.2 + shiftX * 0.3, -12.5, -4.5 + shiftX, -16.8);
            ctx.quadraticCurveTo(0 + shiftX, -17.8, 5.0 + shiftX, -16.5);
            ctx.quadraticCurveTo(10.5 + shiftX * 0.3, -13.0, 8.5 + shiftX * 0.3, -4.5);
            // Alın üstü kavisli taranış (hafif sağa/sola meyilli modern ayrım)
            ctx.quadraticCurveTo(4.0 + shiftX, -7.5, 0 + shiftX, -6.8);
            ctx.quadraticCurveTo(-4.0 + shiftX, -7.5, -8.5 + shiftX * 0.3, -4.5);
            ctx.closePath();
            ctx.fill();

            // 3. Pompadour Fön Vurguları ✨
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(-4.0 + shiftX, -14.8);
            ctx.quadraticCurveTo(0 + shiftX, -16.2, 4.5 + shiftX, -14.5);
            ctx.moveTo(-1.0 + shiftX, -8.5);
            ctx.quadraticCurveTo(1.5 + shiftX, -12.5, 2.0 + shiftX, -15.5);
            ctx.stroke();
        }

        ctx.restore();
    }

        static drawK2AnimeSpiky(ctx, hairColor, facing, isBack, isProfile, dirSign) {
            const highlightColor = "rgba(255, 255, 255, 0.32)";
            const shadowColor = "rgba(0, 0, 0, 0.28)";
            const fShift = (facing === 'down-right') ? 2.5 : (facing === 'down-left' ? -2.5 : 0);

            ctx.save();
            ctx.fillStyle = hairColor;

            const isDiagBack = (facing === 'up-right' || facing === 'up-left');
            const bShift = isDiagBack ? -1.6 : 0;

            if (isBack) {
                // Arkadan dışa doğru fırlayan çok katmanlı sivri tutamlar (8 açılı 3D derinlik)
                ctx.save();
                if (bShift !== 0) ctx.translate(bShift, 0);
                ctx.beginPath();
                ctx.moveTo(-10.5, -2.0);
                ctx.lineTo(-13.5, -6.5);
                ctx.lineTo(-8.5, -8.0);
                ctx.lineTo(-10.0, -14.5);
                ctx.lineTo(-4.0, -12.5);
                ctx.lineTo(0, -17.5);
                ctx.lineTo(4.0, -12.5);
                ctx.lineTo(10.0, -14.5);
                ctx.lineTo(8.5, -8.0);
                ctx.lineTo(13.5, -6.5);
                ctx.lineTo(10.5, -2.0);
                ctx.lineTo(7.5, 4.0);
                ctx.lineTo(-7.5, 4.0);
                ctx.closePath();
                ctx.fill();

                // Katman Vurguları
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(0, -15.5); ctx.lineTo(0, -5.0);
                ctx.moveTo(-5.5, -11.0); ctx.lineTo(-2.0, -3.0);
                ctx.moveTo(5.5, -11.0); ctx.lineTo(2.0, -3.0);
                ctx.stroke();
                ctx.restore();

            } else if (isProfile) {
                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                ctx.beginPath();
                ctx.moveTo(8.2, -6.5);
                ctx.lineTo(11.5, -9.5);
                ctx.lineTo(6.5, -11.5);
                ctx.lineTo(8.5, -16.5);
                ctx.lineTo(1.5, -15.0);
                ctx.lineTo(-2.5, -18.2);
                ctx.lineTo(-6.5, -13.5);
                ctx.lineTo(-12.5, -12.5);
                ctx.lineTo(-10.0, -7.0);
                ctx.lineTo(-13.5, -3.5);
                ctx.lineTo(-8.5, 1.5);
                ctx.lineTo(-3.5, 4.0);
                ctx.lineTo(-2.0, -2.0);
                ctx.lineTo(3.5, -4.5);
                ctx.lineTo(8.2, -6.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.moveTo(4.5, -9.0); ctx.lineTo(-1.5, -13.5);
                ctx.moveTo(-2.5, -6.0); ctx.lineTo(-7.5, -9.5);
                ctx.stroke();

                ctx.restore();

            } else {
                // Ön Bakış: Alna inen anime perçemleri ve yukarı fırlayan sivri taç tutamları
                ctx.beginPath();
                ctx.moveTo(-11.5, -3.5);
                ctx.lineTo(-13.5, -8.5);
                ctx.lineTo(-8.5, -10.5);
                ctx.lineTo(-9.5, -17.0);
                ctx.lineTo(-3.5, -14.5);
                ctx.lineTo(0 + fShift * 0.4, -18.5);
                ctx.lineTo(3.5, -14.5);
                ctx.lineTo(9.5, -17.0);
                ctx.lineTo(8.5, -10.5);
                ctx.lineTo(13.5, -8.5);
                ctx.lineTo(11.5, -3.5);
                // Alın perçemleri
                ctx.lineTo(7.5 + fShift, -4.0);
                ctx.lineTo(4.5 + fShift, -7.5);
                ctx.lineTo(1.5 + fShift, -3.5);
                ctx.lineTo(-1.5 + fShift, -7.5);
                ctx.lineTo(-4.5 + fShift, -4.0);
                ctx.lineTo(-7.5 + fShift, -7.5);
                ctx.closePath();
                ctx.fill();

                // Işıltılı Vurgu Çizgileri
                ctx.strokeStyle = highlightColor;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(0 + fShift * 0.4, -16.5); ctx.lineTo(0, -9.0);
                ctx.moveTo(-6.5, -12.0); ctx.lineTo(-3.5, -7.0);
                ctx.moveTo(6.5, -12.0); ctx.lineTo(3.5, -7.0);
                ctx.stroke();
            }

            ctx.restore();
        }

        static drawK2Ponytail(ctx, hairColor, facing, isBack, isProfile, dirSign) {
        const highlightColor = "rgba(255, 255, 255, 0.26)";
        const shadowColor = "rgba(0, 0, 0, 0.24)";
        const ribbonColor = "#f472b6"; // Şık neon pembe toka

        ctx.save();
        ctx.fillStyle = hairColor;

        if (isBack) {
            // Arka Açı: Yukarı gergin taranmış kafatası + tepede toka + sırta inen uzun at kuyruğu
            ctx.beginPath();
            ctx.arc(0, -3.5, 10.0, Math.PI * 0.88, Math.PI * 0.12, false);
            ctx.quadraticCurveTo(8.0, 1.0, 5.0, 3.5);
            ctx.lineTo(-5.0, 3.5);
            ctx.quadraticCurveTo(-8.0, 1.0, -9.5, -2.5);
            ctx.closePath();
            ctx.fill();

            // Tepede Toka (y = -10.5)
            ctx.fillStyle = ribbonColor;
            ctx.beginPath();
            ctx.arc(0, -10.5, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Sırta İnen Uzun Dolgun At Kuyruğu
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.moveTo(-2.2, -10.5);
            ctx.bezierCurveTo(-6.5, -5.0, -7.5, 4.0, -4.0, 12.5);
            ctx.quadraticCurveTo(0, 14.5, 3.5, 12.5);
            ctx.bezierCurveTo(6.5, 4.0, 5.5, -5.0, 2.2, -10.5);
            ctx.closePath();
            ctx.fill();

            // At Kuyruğu Işıltısı
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -9.0);
            ctx.quadraticCurveTo(-3.5, 2.0, 0, 12.5);
            ctx.stroke();

        } else if (isProfile) {
            ctx.save();
            if (dirSign < 0) ctx.scale(-1, 1);

            // Baş Kubbesi (Geriye doğru toplanan saç kütlesi)
            ctx.beginPath();
            ctx.moveTo(6.5, -5.5);
            ctx.quadraticCurveTo(4.5, -11.0, -1.0, -13.0);
            ctx.quadraticCurveTo(-7.5, -12.5, -10.5, -5.5);
            ctx.quadraticCurveTo(-11.2, 0.5, -9.0, 3.5);
            ctx.quadraticCurveTo(-6.0, 4.5, -3.5, 2.0);
            ctx.quadraticCurveTo(0.5, -2.0, 4.0, -3.5);
            ctx.closePath();
            ctx.fill();

            // Toka (Arka üstte: x = -5.0, y = -10.5)
            ctx.fillStyle = ribbonColor;
            ctx.beginPath();
            ctx.arc(-5.0, -10.5, 2.2, 0, Math.PI * 2);
            ctx.fill();

            // Arkaya ve aşağıya doğru geniş S-kavisiyle dökülen uzun at kuyruğu
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.moveTo(-5.0, -9.0);
            ctx.bezierCurveTo(-12.5, -4.0, -14.0, 5.0, -8.0, 13.5);
            ctx.quadraticCurveTo(-5.5, 14.5, -4.0, 12.0);
            ctx.bezierCurveTo(-8.5, 5.0, -8.0, -4.0, -3.5, -11.5);
            ctx.closePath();
            ctx.fill();

            // Alından sarkan ince minik tutam
            ctx.strokeStyle = hairColor;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(6.5, -4.5); ctx.quadraticCurveTo(8.0, 0, 7.0, 3.5);
            ctx.stroke();

            // Işıltı
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(-5.5, -8.5); ctx.quadraticCurveTo(-11.0, 2.0, -6.5, 12.0);
            ctx.stroke();

            ctx.restore();

        } else {
            // Ön Açı: Geriye gergin toplanmış şık saç + arkadan omzun üstünden hafif sarkan uç
            const shiftX = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            // Baş Kubbesi
            ctx.beginPath();
            ctx.arc(shiftX * 0.3, -4.0, 10.0, Math.PI * 0.88, Math.PI * 0.12, false);
            ctx.quadraticCurveTo(8.5, -5.5, 6.5, -4.5);
            ctx.quadraticCurveTo(0, -6.8, -6.5, -4.5);
            ctx.closePath();
            ctx.fill();

            // Tepede hafifçe görünen toka tepesi
            ctx.fillStyle = ribbonColor;
            ctx.beginPath();
            ctx.arc(shiftX * 0.5, -11.5, 2.0, 0, Math.PI * 2);
            ctx.fill();

            // Omuz üzerinden öne sarkan dalgalı at kuyruğu ucu
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            const px = 7.5 + shiftX * 0.4;
            ctx.moveTo(px, -3.0);
            ctx.bezierCurveTo(px + 4.5, 2.0, px + 4.0, 8.5, px + 1.0, 12.5);
            ctx.quadraticCurveTo(px - 1.5, 12.5, px - 1.0, 9.5);
            ctx.bezierCurveTo(px + 1.0, 6.0, px + 0.5, 1.0, px - 2.0, -3.0);
            ctx.closePath();
            ctx.fill();

            // Şakaklardan sarkan ince zarif tutamlar
            ctx.strokeStyle = hairColor;
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(-7.5 + shiftX * 0.3, -4.0); ctx.quadraticCurveTo(-8.5, 0, -7.0, 4.0);
            ctx.moveTo(7.5 + shiftX * 0.3, -4.0); ctx.quadraticCurveTo(8.5, 0, 7.0, 4.0);
            ctx.stroke();

            // Işıltı
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(shiftX * 0.3, -6.0, 7.5, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();
        }

        ctx.restore();
    }

        static drawK2MessyBun(ctx, hairColor, facing, isBack, isProfile, dirSign) {
        const highlightColor = "rgba(255, 255, 255, 0.24)";
        const shadowColor = "rgba(0, 0, 0, 0.24)";
        const scrunchieCol = "#a855f7"; // Mor sokak scrunchie tokası

        ctx.save();
        ctx.fillStyle = hairColor;

        const bunY = -14.5;

        if (isBack) {
            // Baş Kubbesi
            ctx.beginPath();
            ctx.arc(0, -3.5, 10.0, Math.PI * 0.88, Math.PI * 0.12, false);
            ctx.quadraticCurveTo(8.0, 1.0, 5.0, 3.5);
            ctx.lineTo(-5.0, 3.5);
            ctx.quadraticCurveTo(-8.0, 1.0, -9.5, -2.5);
            ctx.closePath();
            ctx.fill();

            // Scrunchie Toka
            ctx.fillStyle = scrunchieCol;
            ctx.beginPath();
            ctx.ellipse(0, -11.5, 4.2, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dağınık Topuz (Tombul topuz + minik fırlayan tutamlar)
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.arc(0, bunY, 5.2, 0, Math.PI * 2);
            ctx.arc(-2.5, bunY - 1.5, 3.2, 0, Math.PI * 2);
            ctx.arc(2.5, bunY - 1.0, 3.4, 0, Math.PI * 2);
            ctx.fill();

            // Topuz Dokusu
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.arc(0, bunY, 3.8, Math.PI * 0.8, Math.PI * 1.8);
            ctx.arc(1.0, bunY, 2.5, Math.PI * 0.2, Math.PI * 1.2);
            ctx.stroke();

        } else if (isProfile) {
            ctx.save();
            if (dirSign < 0) ctx.scale(-1, 1);

            // Baş Kubbesi
            ctx.beginPath();
            ctx.moveTo(6.5, -5.5);
            ctx.quadraticCurveTo(4.5, -11.0, -1.0, -13.0);
            ctx.quadraticCurveTo(-7.5, -12.5, -10.5, -5.5);
            ctx.quadraticCurveTo(-11.2, 0.5, -9.0, 3.5);
            ctx.quadraticCurveTo(-6.0, 4.5, -3.5, 2.0);
            ctx.quadraticCurveTo(0.5, -2.0, 4.0, -3.5);
            ctx.closePath();
            ctx.fill();

            // Scrunchie Toka
            ctx.fillStyle = scrunchieCol;
            ctx.beginPath();
            ctx.ellipse(-1.5, -11.8, 3.8, 1.8, -0.2, 0, Math.PI * 2);
            ctx.fill();

            // Dağınık Topuz
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.arc(-2.0, bunY, 5.0, 0, Math.PI * 2);
            ctx.arc(-4.0, bunY - 1.2, 3.0, 0, Math.PI * 2);
            ctx.arc(0.5, bunY - 1.0, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Şakaktan sarkan zarif ince bukle
            ctx.strokeStyle = hairColor;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(4.5, -3.5);
            ctx.bezierCurveTo(7.5, 1.0, 4.5, 5.5, 6.0, 8.5);
            ctx.stroke();

            ctx.restore();

        } else {
            // Ön Açı: Tepede belirgin dağınık topuz + yüzü çerçeveleyen şakak bukleleri
            const shiftX = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            // Baş Kubbesi & Alın Çizgisi
            ctx.beginPath();
            ctx.arc(shiftX * 0.3, -4.0, 10.0, Math.PI * 0.88, Math.PI * 0.12, false);
            ctx.quadraticCurveTo(8.5, -5.5, 6.5, -4.5);
            ctx.quadraticCurveTo(0, -6.8, -6.5, -4.5);
            ctx.closePath();
            ctx.fill();

            // Scrunchie Toka
            ctx.fillStyle = scrunchieCol;
            ctx.beginPath();
            ctx.ellipse(shiftX * 0.5, -11.8, 4.0, 1.8, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dağınık Topuz
            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.arc(shiftX * 0.5, bunY, 5.2, 0, Math.PI * 2);
            ctx.arc(shiftX * 0.5 - 2.2, bunY - 1.0, 3.2, 0, Math.PI * 2);
            ctx.arc(shiftX * 0.5 + 2.2, bunY - 1.0, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Şakaklardan iki yana sarkan romantik bukleler
            ctx.strokeStyle = hairColor;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(-7.0 + shiftX * 0.3, -4.0);
            ctx.bezierCurveTo(-9.0, 1.0, -6.5, 5.0, -8.0, 8.5);
            ctx.moveTo(7.0 + shiftX * 0.3, -4.0);
            ctx.bezierCurveTo(9.0, 1.0, 6.5, 5.0, 8.0, 8.5);
            ctx.stroke();

            // Vurgular
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.arc(shiftX * 0.5, bunY, 3.6, Math.PI * 0.8, Math.PI * 1.6);
            ctx.stroke();
        }

        ctx.restore();
    }

        static drawK2CurtainBangs(ctx, hairColor, facing, isBack, isProfile, dirSign) {
        const highlightColor = "rgba(255, 255, 255, 0.28)";
        const shadowColor = "rgba(0, 0, 0, 0.22)";

        ctx.save();
        ctx.fillStyle = hairColor;

        if (isBack) {
            ctx.beginPath();
            ctx.arc(0, -3.2, 10.5, Math.PI * 0.85, Math.PI * 0.15, false);
            ctx.bezierCurveTo(10.5, 2.0, 11.5, 7.5, 9.0, 12.5);
            ctx.quadraticCurveTo(5.0, 10.5, 1.5, 12.0);
            ctx.quadraticCurveTo(-1.5, 10.5, -5.0, 12.0);
            ctx.bezierCurveTo(-11.5, 7.5, -10.5, 2.0, -9.8, -3.2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, -5.0, 7.6, Math.PI * 1.15, Math.PI * 1.85);
            ctx.moveTo(-6.5, 3.0); ctx.quadraticCurveTo(-8.5, 7.0, -6.5, 11.0);
            ctx.moveTo(6.5, 3.0); ctx.quadraticCurveTo(8.5, 7.0, 6.5, 11.0);
            ctx.stroke();

        } else if (isProfile) {
            ctx.save();
            if (dirSign < 0) ctx.scale(-1, 1);

            ctx.beginPath();
            ctx.moveTo(7.2, -6.8);
            ctx.quadraticCurveTo(5.0, -11.5, 0, -13.6);
            ctx.quadraticCurveTo(-7.5, -13.5, -11.5, -6.5);
            ctx.quadraticCurveTo(-12.8, -1.0, -11.8, 3.5);
            ctx.quadraticCurveTo(-11.0, 7.5, -8.0, 12.5);
            ctx.quadraticCurveTo(-6.0, 13.5, -3.5, 12.0);
            ctx.quadraticCurveTo(-1.0, 12.5, 1.5, 11.0);
            ctx.quadraticCurveTo(3.5, 8.5, 3.2, 3.5);
            ctx.quadraticCurveTo(4.5, -1.5, 7.5, -4.5);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(6.0, -5.5); ctx.quadraticCurveTo(8.0, -1.0, 5.5, 3.0);
            ctx.stroke();

            ctx.restore();

        } else {
            // Ön Açı: Ortadan ayrılan perde kâkül + omuzlara dökülen dalgalar (Yüz, gözler, ağız, çene %100 açık)
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            // 1. Dış Silüet & Omuz Dalgaları (Tek parça, yüzün dışından dolaşır)
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -4.0, 10.6, Math.PI * 0.95, Math.PI * 2.05, false);
            // Sağ omuz dalgası (dış hat)
            ctx.bezierCurveTo(10.5, 2.0, 11.5 + fShift * 0.4, 7.5, 9.2 + fShift * 0.3, 12.5);
            // Sağ dalga alt ucu
            ctx.quadraticCurveTo(7.2 + fShift * 0.3, 11.0, 6.2 + fShift * 0.2, 5.5);
            // Sağ şakak / yanak dışı
            ctx.quadraticCurveTo(5.8 + fShift * 0.3, 0.5, 6.5 + fShift * 0.3, -4.5);
            // Alın ortası perde kâkül ayrımı (Kaşların üstünde biter: y = -7.5)
            ctx.quadraticCurveTo(2.8 + fShift * 0.5, -6.8, 0 + fShift * 0.5, -7.5);
            ctx.quadraticCurveTo(-2.8 + fShift * 0.5, -6.8, -6.5 + fShift * 0.3, -4.5);
            // Sol şakak / yanak dışı
            ctx.quadraticCurveTo(-5.8 + fShift * 0.3, 0.5, -6.2 + fShift * 0.2, 5.5);
            // Sol dalga alt ucu
            ctx.quadraticCurveTo(-7.2 + fShift * 0.3, 11.0, -9.2 + fShift * 0.3, 12.5);
            // Sol omuz dalgası (dış hat)
            ctx.bezierCurveTo(-11.5 + fShift * 0.4, 7.5, -10.5, 2.0, -10.5, -2.2);
            ctx.closePath();
            ctx.fill();

            // 2. Zarif Perde Kâkül Çerçevesi (Yüzü çerçeveleyen hafif fön kıvrımları)
            ctx.beginPath();
            ctx.moveTo(0 + fShift * 0.5, -7.5);
            ctx.quadraticCurveTo(3.2 + fShift * 0.5, -6.8, 5.8 + fShift * 0.4, -4.8);
            ctx.quadraticCurveTo(6.6 + fShift * 0.3, -2.0, 6.0 + fShift * 0.3, 0.5);
            ctx.quadraticCurveTo(5.2 + fShift * 0.3, -1.8, 4.2 + fShift * 0.4, -4.2);
            ctx.quadraticCurveTo(2.2 + fShift * 0.5, -6.5, 0 + fShift * 0.5, -7.5);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0 + fShift * 0.5, -7.5);
            ctx.quadraticCurveTo(-3.2 + fShift * 0.5, -6.8, -5.8 + fShift * 0.4, -4.8);
            ctx.quadraticCurveTo(-6.6 + fShift * 0.3, -2.0, -6.0 + fShift * 0.3, 0.5);
            ctx.quadraticCurveTo(-5.2 + fShift * 0.3, -1.8, -4.2 + fShift * 0.4, -4.2);
            ctx.quadraticCurveTo(-2.2 + fShift * 0.5, -6.5, 0 + fShift * 0.5, -7.5);
            ctx.closePath();
            ctx.fill();

            // Angel-Ring Işıltısı ✨
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -5.6, 7.8, Math.PI * 1.18, Math.PI * 1.82);
            ctx.moveTo(-7.8 + fShift * 0.3, 3.5); ctx.quadraticCurveTo(-9.2 + fShift * 0.4, 7.5, -7.0 + fShift * 0.3, 11.5);
            ctx.moveTo(7.8 + fShift * 0.3, 3.5); ctx.quadraticCurveTo(9.2 + fShift * 0.4, 7.5, 7.0 + fShift * 0.3, 11.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    static drawK2FrenchBob(ctx, hairColor, facing, isBack, isProfile, dirSign) {
        const highlightColor = "rgba(255, 255, 255, 0.28)";
        const shadowColor = "rgba(0, 0, 0, 0.22)";

        ctx.save();
        ctx.fillStyle = hairColor;

        if (isBack) {
            ctx.beginPath();
            ctx.arc(0, -3.2, 10.5, Math.PI * 0.88, Math.PI * 0.12, false);
            ctx.bezierCurveTo(9.5, 1.0, 9.8, 4.5, 7.5, 6.5);
            ctx.lineTo(-7.5, 6.5);
            ctx.bezierCurveTo(-9.8, 4.5, -9.5, 1.0, -9.8, -3.2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = shadowColor;
            ctx.fillRect(-7.5, 4.8, 15.0, 1.7);

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(0, -5.0, 7.8, Math.PI * 1.15, Math.PI * 1.85);
            ctx.stroke();

        } else if (isProfile) {
            ctx.save();
            if (dirSign < 0) ctx.scale(-1, 1);

            ctx.beginPath();
            ctx.moveTo(7.0, -5.5);
            ctx.quadraticCurveTo(5.0, -11.5, 0, -13.5);
            ctx.quadraticCurveTo(-7.5, -13.2, -11.0, -6.0);
            ctx.quadraticCurveTo(-12.0, 0.5, -9.5, 5.5);
            ctx.lineTo(-2.0, 6.0);
            ctx.quadraticCurveTo(3.5, 6.8, 5.5, 4.0);
            ctx.lineTo(6.5, -2.5);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = hairColor;
            ctx.beginPath();
            ctx.moveTo(7.0, -5.5); ctx.lineTo(8.5, -2.5); ctx.lineTo(6.0, -1.8);
            ctx.closePath(); ctx.fill();

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(0, -6.5, 7.2, Math.PI * 1.2, Math.PI * 1.8);
            ctx.stroke();

            ctx.restore();

        } else {
            // Ön Açı: Pürüzsüz küt bob + kaş hizasında düz Fransız kâkülü (Yüz ve çene %100 açık)
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            // 1. Ana Bob Silüeti (Yanakların yanından çene hizasına iner)
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -4.0, 10.5, Math.PI * 0.95, Math.PI * 2.05, false);
            // Sağ Bob Dış Hat
            ctx.bezierCurveTo(10.2, 0.5, 9.8 + fShift * 0.3, 3.5, 8.2 + fShift * 0.3, 5.5);
            // Sağ Küt Bitiş Kenarı
            ctx.lineTo(6.0 + fShift * 0.2, 5.5);
            // Sağ Yanak İçi
            ctx.quadraticCurveTo(5.5 + fShift * 0.2, 2.0, 6.2 + fShift * 0.2, -4.5);
            // Alın üstü kâkül tavanına bağlan
            ctx.lineTo(-6.2 + fShift * 0.2, -4.5);
            // Sol Yanak İçi
            ctx.quadraticCurveTo(-5.5 + fShift * 0.2, 2.0, -6.0 + fShift * 0.2, 5.5);
            // Sol Küt Bitiş Kenarı
            ctx.lineTo(-8.2 + fShift * 0.3, 5.5);
            // Sol Bob Dış Hat
            ctx.bezierCurveTo(-9.8 + fShift * 0.3, 3.5, -10.2, 0.5, -10.4, -2.2);
            ctx.closePath();
            ctx.fill();

            // 2. Alında Düz Fransız Kâkülü (Kaşların üstünde biter: y = -6.2, gözleri asla kapatmaz!)
            ctx.beginPath();
            ctx.moveTo(-6.2 + fShift * 0.2, -7.5);
            ctx.quadraticCurveTo(0 + fShift * 0.4, -8.0, 6.2 + fShift * 0.2, -7.5);
            ctx.lineTo(6.0 + fShift * 0.2, -6.2);
            ctx.quadraticCurveTo(0 + fShift * 0.4, -5.9, -6.0 + fShift * 0.2, -6.2);
            ctx.closePath();
            ctx.fill();

            // Kâkül alt gölgesi
            ctx.fillStyle = shadowColor;
            ctx.fillRect(-5.8 + fShift * 0.2, -6.1, 11.6, 0.5);

            // Salon parlaklığı ✨
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -6.2, 7.6, Math.PI * 1.2, Math.PI * 1.8);
            ctx.moveTo(-8.0 + fShift * 0.3, 0); ctx.lineTo(-7.0 + fShift * 0.3, 4.5);
            ctx.moveTo(8.0 + fShift * 0.3, 0); ctx.lineTo(7.0 + fShift * 0.3, 4.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    static drawK2LayeredBlowout(ctx, hairColor, facing, isBack, isProfile, dirSign) {
        const highlightColor = "rgba(255, 255, 255, 0.28)";
        const shadowColor = "rgba(0, 0, 0, 0.25)";

        ctx.save();
        ctx.fillStyle = hairColor;

        if (isBack) {
            ctx.beginPath();
            ctx.arc(0, -3.2, 10.6, Math.PI * 0.85, Math.PI * 0.15, false);
            ctx.bezierCurveTo(11.5, 3.0, 12.5, 9.0, 10.0, 15.5);
            ctx.quadraticCurveTo(5.5, 13.5, 1.5, 15.0);
            ctx.quadraticCurveTo(-1.5, 13.5, -5.5, 15.0);
            ctx.bezierCurveTo(-12.5, 9.0, -11.5, 3.0, -10.0, -3.2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(0, -5.0, 7.8, Math.PI * 1.15, Math.PI * 1.85);
            ctx.moveTo(-7.5, 4.0); ctx.quadraticCurveTo(-9.5, 9.5, -7.0, 14.5);
            ctx.moveTo(7.5, 4.0); ctx.quadraticCurveTo(9.5, 9.5, 7.0, 14.5);
            ctx.stroke();

        } else if (isProfile) {
            ctx.save();
            if (dirSign < 0) ctx.scale(-1, 1);

            ctx.beginPath();
            ctx.moveTo(7.2, -6.8);
            ctx.quadraticCurveTo(5.0, -11.5, 0, -13.6);
            ctx.quadraticCurveTo(-7.5, -13.5, -11.5, -6.5);
            ctx.quadraticCurveTo(-13.0, 0, -12.0, 5.0);
            ctx.quadraticCurveTo(-11.5, 10.5, -8.5, 15.5);
            ctx.quadraticCurveTo(-5.5, 16.2, -2.5, 14.5);
            ctx.quadraticCurveTo(1.0, 15.0, 3.8, 12.5);
            ctx.quadraticCurveTo(5.0, 8.5, 4.0, 2.5);
            ctx.quadraticCurveTo(2.0, -1.0, 3.5, -4.5);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(4.0, 1.0); ctx.quadraticCurveTo(6.5, 7.0, 3.0, 13.0);
            ctx.stroke();

            ctx.restore();

        } else {
            // Ön Açı: Omuzlara dökülen lüks kat kat fön dalgaları (Yüz, ağız, çene %100 açık)
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            // 1. Ana Hacim & Kat Kat Dalgalar
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -4.2, 11.0, Math.PI * 0.95, Math.PI * 2.05, false);
            // Sağ Katlar (Dış Hat)
            ctx.bezierCurveTo(11.2, 1.0, 12.2 + fShift * 0.4, 7.0, 9.6 + fShift * 0.3, 14.8);
            // Sağ Kat Alt Kıvrımı
            ctx.quadraticCurveTo(7.5 + fShift * 0.3, 13.0, 6.2 + fShift * 0.2, 7.5);
            // Sağ Yanak Dışı
            ctx.quadraticCurveTo(5.5 + fShift * 0.3, 2.0, 6.2 + fShift * 0.2, -4.5);
            // Alın Üstü Yandan Ayrım (Kaşların üstünde kalır)
            ctx.quadraticCurveTo(1.5 + fShift * 0.4, -6.8, -1.0 + fShift * 0.4, -7.5);
            ctx.quadraticCurveTo(-4.0 + fShift * 0.3, -6.8, -6.2 + fShift * 0.2, -4.5);
            // Sol Yanak Dışı
            ctx.quadraticCurveTo(-5.5 + fShift * 0.3, 2.0, -6.2 + fShift * 0.2, 7.5);
            // Sol Kat Alt Kıvrımı
            ctx.quadraticCurveTo(-7.5 + fShift * 0.3, 13.0, -9.6 + fShift * 0.3, 14.8);
            // Sol Katlar (Dış Hat)
            ctx.bezierCurveTo(-12.2 + fShift * 0.4, 7.0, -11.2, 1.0, -10.8, -2.2);
            ctx.closePath();
            ctx.fill();

            // 2. Alın Üstü Yandan Ayrılmış Hacimli Fön Tutamı
            ctx.beginPath();
            ctx.moveTo(-6.2 + fShift * 0.2, -6.5);
            ctx.quadraticCurveTo(-1.0 + fShift * 0.4, -8.6, 6.2 + fShift * 0.2, -6.8);
            ctx.quadraticCurveTo(3.5 + fShift * 0.4, -5.6, -0.5 + fShift * 0.4, -6.2);
            ctx.quadraticCurveTo(-3.8 + fShift * 0.3, -5.8, -6.2 + fShift * 0.2, -6.5);
            ctx.closePath();
            ctx.fill();

            // Kat Parıltıları ✨
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -5.8, 8.0, Math.PI * 1.15, Math.PI * 1.85);
            ctx.moveTo(-7.8 + fShift * 0.3, 4.0); ctx.quadraticCurveTo(-9.5 + fShift * 0.4, 9.0, -7.0 + fShift * 0.3, 13.5);
            ctx.moveTo(7.8 + fShift * 0.3, 4.0); ctx.quadraticCurveTo(9.5 + fShift * 0.4, 9.0, 7.0 + fShift * 0.3, 13.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    static drawK2HalfUpBraid(ctx, hairColor, facing, isBack, isProfile, dirSign) {
        const highlightColor = "rgba(255, 255, 255, 0.28)";
        const shadowColor = "rgba(0, 0, 0, 0.22)";
        const pearlColor = "#fef08a"; // İnci toka

        ctx.save();
        ctx.fillStyle = hairColor;

        if (isBack) {
            ctx.beginPath();
            ctx.arc(0, -3.2, 10.5, Math.PI * 0.85, Math.PI * 0.15, false);
            ctx.bezierCurveTo(10.5, 3.0, 11.2, 8.0, 8.5, 13.0);
            ctx.quadraticCurveTo(0, 14.5, -8.5, 13.0);
            ctx.bezierCurveTo(-11.2, 8.0, -10.5, 3.0, -9.8, -3.2);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
            ctx.fillRect(-7.5, -3.2, 15.0, 3.2);

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.2;
            for (let bx = -6.0; bx <= 6.0; bx += 2.5) {
                ctx.beginPath();
                ctx.moveTo(bx - 1.0, -3.0); ctx.lineTo(bx + 1.0, 0);
                ctx.moveTo(bx + 1.0, -3.0); ctx.lineTo(bx - 1.0, 0);
                ctx.stroke();
            }

            ctx.fillStyle = pearlColor;
            ctx.beginPath();
            ctx.arc(0, -1.5, 1.4, 0, Math.PI * 2);
            ctx.fill();

        } else if (isProfile) {
            ctx.save();
            if (dirSign < 0) ctx.scale(-1, 1);

            ctx.beginPath();
            ctx.moveTo(7.2, -6.8);
            ctx.quadraticCurveTo(5.0, -11.5, 0, -13.6);
            ctx.quadraticCurveTo(-7.5, -13.5, -11.5, -6.5);
            ctx.quadraticCurveTo(-12.5, 0.5, -10.5, 6.0);
            ctx.quadraticCurveTo(-8.5, 11.5, -5.0, 13.0);
            ctx.quadraticCurveTo(-1.5, 12.0, 1.5, 10.5);
            ctx.quadraticCurveTo(3.5, 7.5, 2.8, 2.5);
            ctx.quadraticCurveTo(1.5, -1.0, 3.5, -4.5);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(3.5, -4.5); ctx.quadraticCurveTo(-2.0, -3.0, -7.5, -2.0);
            ctx.stroke();

            ctx.restore();

        } else {
            // Ön Açı: Geriye taranmış saç + başta örgülü taç + omuzlara dökülen romantik dalgalar (ÇENE/AĞIZ %100 AÇIK!)
            const fShift = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

            // 1. Baş Kubbesi ve Omuz Dalgaları (Yüzü asla kapatmaz)
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -4.0, 10.6, Math.PI * 0.95, Math.PI * 2.05, false);
            // Sağ omuz dalgaları (dış hat)
            ctx.bezierCurveTo(10.2, 0.5, 11.2 + fShift * 0.4, 6.0, 8.8 + fShift * 0.3, 12.5);
            // Sağ dalga alt ucu
            ctx.quadraticCurveTo(6.8 + fShift * 0.3, 10.5, 5.8 + fShift * 0.2, 5.0);
            // Sağ şakak / kulak arkası (saç geriye toplanmış)
            ctx.quadraticCurveTo(5.0 + fShift * 0.3, 0.5, 5.5 + fShift * 0.2, -4.5);
            // Alın üstü temiz geriye toplanma çizgisi (Alın tamamen açık)
            ctx.quadraticCurveTo(0 + fShift * 0.4, -6.8, -5.5 + fShift * 0.2, -4.5);
            // Sol şakak / kulak arkası
            ctx.quadraticCurveTo(-5.0 + fShift * 0.3, 0.5, -5.8 + fShift * 0.2, 5.0);
            // Sol dalga alt ucu
            ctx.quadraticCurveTo(-6.8 + fShift * 0.3, 10.5, -8.8 + fShift * 0.3, 12.5);
            // Sol omuz dalgaları (dış hat)
            ctx.bezierCurveTo(-11.2 + fShift * 0.4, 6.0, -10.2, 0.5, -10.4, -2.2);
            ctx.closePath();
            ctx.fill();

            // 2. Başın Üstünden Geçen Zarif Örgülü Taç Şeridi (y = -7.5 to -5.5)
            ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.arc(fShift * 0.3, -3.8, 8.4, Math.PI * 1.25, Math.PI * 1.75);
            ctx.stroke();

            // Örgü Baklaları
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.1;
            for (let a = Math.PI * 1.28; a <= Math.PI * 1.72; a += 0.08) {
                const bx = fShift * 0.3 + Math.cos(a) * 8.4;
                const by = -3.8 + Math.sin(a) * 8.4;
                ctx.beginPath();
                ctx.moveTo(bx - 0.9, by - 0.9); ctx.lineTo(bx + 0.9, by + 0.9);
                ctx.stroke();
            }

            // İnci Parıltıları ✨
            ctx.fillStyle = pearlColor;
            [-3.6, 0, 3.6].forEach(px => {
                ctx.beginPath();
                ctx.arc(px + fShift * 0.3, -7.8, 1.0, 0, Math.PI * 2);
                ctx.fill();
            });

            // Dalga ışıltıları
            ctx.strokeStyle = highlightColor;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(-7.5 + fShift * 0.3, 3.5); ctx.quadraticCurveTo(-8.8 + fShift * 0.4, 7.5, -6.8 + fShift * 0.3, 11.5);
            ctx.moveTo(7.5 + fShift * 0.3, 3.5); ctx.quadraticCurveTo(8.8 + fShift * 0.4, 7.5, 6.8 + fShift * 0.3, 11.5);
            ctx.stroke();
        }

        ctx.restore();
    }

    /**
     * Kıvırcık Kahverengi Saç (Orijinal Sanalika Çiziminin 8 Yöne Birebir Korunmuş Hali)
     * Orijinal renkler: #451a03 (koyu çikolata), #78350f (sıcak kahve), #92400e (ışık parlaklığı).
     * Orijinal bukle kuleleri, kabarık tepe kubbesi ve alın perçem bukleleri korunarak 8 yöne uyarlanmıştır.
     */
    static drawK2CurlyBrown(targetCtx, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        let pX = 0, pY = 18;
        let hairColor = "original", facing = "down", isBack = false, isProfile = false, dirSign = 1;

        if (typeof arg2 === "number") {
            // avatarRenderer çağrısı: (targetCtx, pX, pY, facing, isBack, isProfile, dirSign, customColor)
            pX = arg2;
            pY = arg3;
            facing = arg4 || "down";
            isBack = !!arg5;
            isProfile = !!arg6;
            dirSign = arg7 || 1;
            hairColor = arg8 || "original";
        } else {
            // k2Head çağrısı: (ctx, hairColor, facing, isBack, isProfile, dirSign)
            pX = 0;
            pY = 14.8;
            hairColor = arg2 || "original";
            facing = arg3 || "down";
            isBack = !!arg4;
            isProfile = !!arg5;
            dirSign = arg6 || 1;
        }

        let baseBrown = "#451a03"; // Koyu çikolata taban
        let midBrown = "#78350f";  // Sıcak kahve hacim
        let lightBrown = "#92400e"; // Güneş ışığı ışıltısı

        if (hairColor && hairColor !== "original" && hairColor.startsWith("#") && hairColor !== "#92400e" && hairColor !== "#26150b") {
            baseBrown = (typeof adjustColorBrightness === "function") ? adjustColorBrightness(hairColor, -25) : baseBrown;
            midBrown = hairColor;
            lightBrown = (typeof adjustColorBrightness === "function") ? adjustColorBrightness(hairColor, 25) : lightBrown;
        }

        targetCtx.save();

        // Sol yönlerde simetri aynalaması (left, down-left, up-left)
        const isMirrored = (facing === "left" || facing === "down-left" || facing === "up-left");
        if (isMirrored) {
            targetCtx.translate(pX, 0);
            targetCtx.scale(-1, 1);
            targetCtx.translate(-pX, 0);
        }

        if (facing === "up") {
            // --- 1. TAM ARKA (Orijinal isBack çiziminin birebir kendisi) ---
            targetCtx.fillStyle = baseBrown;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 12, pY - 28, 24, 32, 8);
            targetCtx.fill();

            // Tepe saç kubbesi (arka açıda da kafa tepesini dolgun kapatır)
            targetCtx.fillStyle = midBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX, pY - 20, 11.5, Math.PI * 0.92, Math.PI * 2.08);
            targetCtx.fill();

            // Kıvırcık bukle dokuları (arka)
            targetCtx.fillStyle = midBrown;
            [
                [-8, -18, 4.5], [0, -20, 5], [8, -18, 4.5],
                [-9, -10, 4], [-3, -11, 4.5], [4, -10, 4], [9, -9, 3.8],
                [-7, -2, 4.2], [0, -3, 4.8], [7, -2, 4.2],
                [-5, 3, 3.5], [2, 4, 3.8]
            ].forEach(([cx, cy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(pX + cx, pY + cy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Parlama vurguları
            targetCtx.fillStyle = lightBrown;
            [-5, 2, 6].forEach(sx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + sx, pY - 14, 2.5, 0, Math.PI * 2);
                targetCtx.fill();
            });

        } else if (facing === "up-right" || facing === "up-left") {
            // --- 2. ARKA ÇEYREK (Orijinal arka buklelerin 3/4 perspektiflenmiş hali) ---
            targetCtx.fillStyle = baseBrown;
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 10, pY - 28, 23, 32, 8);
            targetCtx.fill();

            // Tepe saç kubbesi (kabarık tepe)
            targetCtx.fillStyle = midBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX + 1, pY - 20, 11.5, Math.PI * 0.92, Math.PI * 2.08);
            targetCtx.fill();

            // Bukle kütlesi
            targetCtx.fillStyle = midBrown;
            [
                [-6, -18, 4.5], [2, -20, 5], [9, -17, 4.5],
                [-7, -10, 4], [-1, -11, 4.5], [6, -10, 4.2], [11, -8, 3.8],
                [-5, -2, 4.2], [2, -3, 4.8], [8, -1, 4.2],
                [-3, 4, 3.5], [4, 5, 3.8]
            ].forEach(([cx, cy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(pX + cx, pY + cy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Parlama vurguları
            targetCtx.fillStyle = lightBrown;
            [-3, 4, 8].forEach(sx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + sx, pY - 13, 2.3, 0, Math.PI * 2);
                targetCtx.fill();
            });

        } else if (facing === "right" || facing === "left") {
            // --- 3. PROFİL (Orijinal kule bukleleri enseye ve sağ omza toplanmış, kulak açık) ---
            targetCtx.fillStyle = baseBrown;
            // Başın arkası ve ense kıvırcık pelerini
            targetCtx.beginPath();
            targetCtx.roundRect(pX - 9, pY - 26, 14, 30, 6);
            targetCtx.fill();

            // Tepe saç kubbesi (profilde kafanın üstünü saran kabarık kubbe)
            targetCtx.fillStyle = midBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX - 1.5, pY - 20, 11.5, Math.PI * 0.92, Math.PI * 2.08);
            targetCtx.fill();

            // Ense ve tepe bukleleri
            targetCtx.fillStyle = midBrown;
            [
                [-6, -17, 4.5], [-2, -19, 4.8], [3, -18, 4.2],
                [-7, -11, 4.2], [-2, -12, 4.5], [4, -10, 3.8],
                [-5, -4, 4.0], [0, -3, 4.2], [5, -2, 3.6],
                [-3, 3, 3.5], [2, 4, 3.5]
            ].forEach(([cx, cy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(pX + cx, pY + cy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Ön bukle dökümü (sağ omuz üstü - zarif omuz hizası)
            let bx = pX + 5;
            targetCtx.fillStyle = baseBrown;
            [
                [0, -14, 4.5],
                [1, -8, 4.5],
                [0, -1.5, 4.2],
                [0.5, 2.2, 3.4]
            ].forEach(([ox, oy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(bx + ox, pY + oy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Şakak / Alın minik buklesi
            targetCtx.fillStyle = baseBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX + 5, pY - 19, 2.6, 0, Math.PI * 2);
            targetCtx.fill();

            // Parlamalar
            targetCtx.fillStyle = lightBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX - 1, pY - 14, 2.0, 0, Math.PI * 2);
            targetCtx.arc(bx + 1, pY - 8, 1.8, 0, Math.PI * 2);
            targetCtx.fill();

        } else if (facing === "down-right" || facing === "down-left") {
            // --- 4. ÖN ÇEYREK (Orijinal önden çizimin 3/4 açılı derinlik kazanmış hali) ---
            targetCtx.fillStyle = baseBrown;

            // Uzak Omuz (Sol) Bukleleri (Daha geride ve hafif dar - omuz hizası accık kısaltıldı)
            let farX = pX - 9;
            [
                [0, -17, 4.5],
                [-1, -11, 4.5],
                [-0.5, -5, 4.2],
                [0, -0.5, 3.6],
                [-0.4, 2.0, 2.8]
            ].forEach(([ox, oy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(farX + ox, pY + oy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Yakın Omuz (Sağ) Bukleleri (Ön planda, dolgun - accık kısaltıldı)
            let nearX = pX + 9;
            [
                [0, -18, 5],
                [1.5, -12, 5],
                [0.5, -6, 4.8],
                [-0.5, -1.0, 4.4],
                [0.3, 1.8, 3.5]
            ].forEach(([ox, oy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(nearX + ox, pY + oy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Yakın omuz katmanları
            targetCtx.fillStyle = midBrown;
            [
                [0.5, -15, 3.8],
                [1.8, -9, 3.8],
                [0, -3.5, 3.5],
                [0.5, 0.5, 2.8]
            ].forEach(([ox, oy, r]) => {
                targetCtx.beginPath();
                targetCtx.arc(nearX + ox, pY + oy, r, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Tepe saç kubbesi
            targetCtx.fillStyle = midBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX + 1, pY - 20, 11.5, Math.PI * 0.92, Math.PI * 2.08);
            targetCtx.fill();

            // Alındaki tatlı kıvırcık kakül / perçem bukleleri
            targetCtx.fillStyle = baseBrown;
            [-4, 0, 4, 7].forEach(kx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + kx, pY - 20, 2.8, 0, Math.PI * 2);
                targetCtx.fill();
            });
            targetCtx.fillStyle = lightBrown;
            [-2, 3].forEach(kx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + kx, pY - 22, 1.6, 0, Math.PI * 2);
                targetCtx.fill();
            });
            targetCtx.beginPath();
            targetCtx.arc(nearX + 0.5, pY - 12, 1.8, 0, Math.PI * 2);
            targetCtx.fill();

        } else {
            // --- 5. TAM ÖN (down) - ORİJİNAL ÇİZİMİN %100 BİREBİR KENDİSİ! ---
            targetCtx.fillStyle = baseBrown;
            // Sol ve sağ omuzlara dökülen bukle kuleleri (Önden görünüm accık kısaltıldı)
            [-1, 1].forEach(side => {
                let bx = pX + side * 10;
                targetCtx.fillStyle = baseBrown;
                [
                    [0, -18, 5],
                    [side * 1.5, -12, 5],
                    [side * 0.5, -6, 4.8],
                    [-side * 0.4, -1.0, 4.4],
                    [side * 0.2, 1.8, 3.5]
                ].forEach(([ox, oy, r]) => {
                    targetCtx.beginPath();
                    targetCtx.arc(bx + ox, pY + oy, r, 0, Math.PI * 2);
                    targetCtx.fill();
                });

                // Bukle katmanları ve gölgelendirmeleri
                targetCtx.fillStyle = midBrown;
                [
                    [side * 0.5, -15, 3.8],
                    [side * 1.8, -9, 3.8],
                    [0, -3.5, 3.5],
                    [side * 0.4, 0.5, 2.8]
                ].forEach(([ox, oy, r]) => {
                    targetCtx.beginPath();
                    targetCtx.arc(bx + ox, pY + oy, r, 0, Math.PI * 2);
                    targetCtx.fill();
                });

                // Işıltı noktacıkları
                targetCtx.fillStyle = lightBrown;
                targetCtx.beginPath();
                targetCtx.arc(bx + side * 0.5, pY - 12, 1.8, 0, Math.PI * 2);
                targetCtx.fill();
            });

            // Tepe saç kubbesi (Kıvırcık kabarık tepe)
            targetCtx.fillStyle = midBrown;
            targetCtx.beginPath();
            targetCtx.arc(pX, pY - 20, 11.5, Math.PI * 0.92, Math.PI * 2.08);
            targetCtx.fill();

            // Alındaki tatlı kıvırcık kakül / perçem bukleleri
            targetCtx.fillStyle = baseBrown;
            [-5, -1, 3, 6].forEach(kx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + kx, pY - 20, 3, 0, Math.PI * 2);
                targetCtx.fill();
            });
            targetCtx.fillStyle = lightBrown;
            [-3, 2].forEach(kx => {
                targetCtx.beginPath();
                targetCtx.arc(pX + kx, pY - 22, 1.6, 0, Math.PI * 2);
                targetCtx.fill();
            });
        }

        targetCtx.restore();
    }
    static drawK2FlamingFire(ctx, facing, isBack, isProfile, dirSign) {
        ctx.save();

        const t = Date.now() / 140;
        const shiftX = (facing === 'down-right') ? 2.0 : (facing === 'down-left' ? -2.0 : 0);

        // 0. Çevresel Sıcaklık Işıltısı (Radial Heat Glow Aura)
        const auraGrad = ctx.createRadialGradient(shiftX * 0.4, -9.0, 4.0, shiftX * 0.4, -12.0, 22.0);
        auraGrad.addColorStop(0, "rgba(251, 191, 36, 0.45)");
        auraGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.22)");
        auraGrad.addColorStop(1, "rgba(220, 38, 38, 0)");
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(shiftX * 0.4, -12.0, 22.0, 0, Math.PI * 2);
        ctx.fill();

        // Alev dilleri dalgalanma ofsetleri
        const f1 = Math.sin(t) * 1.8;
        const f2 = Math.cos(t * 1.3) * 2.2;
        const f3 = Math.sin(t * 0.9 + 1.2) * 1.6;
        const f4 = Math.cos(t * 1.1 + 2.0) * 2.0;

        // 1. KATMAN: Dış Alev & Kor Kızılı (Deep Ember Crimson & Orange)
        ctx.fillStyle = "#ea580c";
        ctx.beginPath();
        ctx.moveTo(-8.5 + shiftX * 0.3, -4.0);
        // Sol alev dili
        ctx.quadraticCurveTo(-11.5 + f1, -11.0, -8.0 + f2, -18.5);
        ctx.quadraticCurveTo(-5.5 + f3, -13.0, -4.0, -11.5);
        // Merkez yüksek tepe alevi
        ctx.quadraticCurveTo(-2.0 + f2, -19.5, 0 + shiftX * 0.5 + f1, -23.5);
        ctx.quadraticCurveTo(2.5 + f3, -18.5, 4.0, -11.5);
        // Sağ alev dili
        ctx.quadraticCurveTo(7.5 + f4, -13.0, 9.5 + f2, -17.5);
        ctx.quadraticCurveTo(11.5 + f1, -10.0, 8.5 + shiftX * 0.3, -4.0);
        ctx.closePath();
        ctx.fill();

        // 2. KATMAN: Orta Alev & Sıcak Altın Amber (#facc15 -> #f59e0b)
        ctx.fillStyle = "#f59e0b";
        ctx.beginPath();
        ctx.moveTo(-6.5 + shiftX * 0.3, -5.0);
        ctx.quadraticCurveTo(-8.5 + f2 * 0.7, -10.0, -6.0 + f1 * 0.7, -15.5);
        ctx.quadraticCurveTo(-4.0, -11.5, -2.5, -10.0);
        ctx.quadraticCurveTo(-1.0 + f3 * 0.7, -16.5, 0 + shiftX * 0.5 + f2 * 0.7, -19.5);
        ctx.quadraticCurveTo(1.8, -15.5, 2.5, -10.0);
        ctx.quadraticCurveTo(5.5 + f1 * 0.7, -11.5, 7.0 + f3 * 0.7, -14.5);
        ctx.quadraticCurveTo(8.5, -9.0, 6.5 + shiftX * 0.3, -5.0);
        ctx.closePath();
        ctx.fill();

        // 3. KATMAN: Akkor Çekirdek & Beyaz Parlama (#ffffff / #fef08a)
        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.moveTo(-4.0 + shiftX * 0.4, -6.0);
        ctx.quadraticCurveTo(-4.5 + f3 * 0.4, -10.0, -2.5 + f2 * 0.4, -13.0);
        ctx.quadraticCurveTo(-1.0, -10.5, 0 + shiftX * 0.5 + f1 * 0.4, -15.0);
        ctx.quadraticCurveTo(1.5, -10.5, 3.0 + f4 * 0.4, -12.5);
        ctx.quadraticCurveTo(4.0, -9.0, 4.0 + shiftX * 0.4, -6.0);
        ctx.closePath();
        ctx.fill();

        // 4. Havada Süzülen Canlı Kıvılcım Parçacıkları ✨
        const sparkY1 = -24.0 - ((t * 8) % 12);
        const sparkX1 = shiftX * 0.5 + Math.sin(t * 2) * 4.0;
        const sparkY2 = -20.0 - (((t * 8) + 6) % 14);
        const sparkX2 = -3.5 + Math.cos(t * 2.5) * 3.0;
        const sparkY3 = -22.0 - (((t * 8) + 3) % 11);
        const sparkX3 = 4.0 + Math.sin(t * 1.8 + 1) * 3.5;

        ctx.fillStyle = "#fef08a";
        ctx.beginPath();
        ctx.arc(sparkX1, sparkY1, 0.9, 0, Math.PI * 2);
        ctx.arc(sparkX2, sparkY2, 0.75, 0, Math.PI * 2);
        ctx.arc(sparkX3, sparkY3, 0.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

        /**
         * Canlı Yüz Çizimi (Gözbebeği, Işıltı, Kaş, Tebessüm ve Göz Kırpma)
         */
        static drawK2KirliSakal(ctx, p, facing, isProfile, dirSign) {
            const customCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;
            const stubbleColor = customCol ? customCol : "rgba(35, 26, 18, 0.65)";

            ctx.save();
            ctx.fillStyle = stubbleColor;

            if (isProfile) {
                const sX = dirSign * 4.2;
                // 1. Profil Çene Hattı & Mandible
                ctx.beginPath();
                ctx.moveTo(dirSign * 0.5, 1.2);
                ctx.lineTo(sX + dirSign * 1.8, 2.8);
                ctx.quadraticCurveTo(sX + dirSign * 2.2, 5.2, sX - dirSign * 0.5, 6.2);
                ctx.lineTo(dirSign * 0.2, 5.2);
                ctx.closePath();
                ctx.fill();

                // 2. Profil Bıyık (Dudak üstü ince çizgi, ağız açık)
                ctx.beginPath();
                ctx.moveTo(sX - dirSign * 1.5, 0.6);
                ctx.quadraticCurveTo(sX + dirSign * 1.2, 0.8, sX + dirSign * 1.8, 1.4);
                ctx.lineTo(sX + dirSign * 0.8, 1.6);
                ctx.quadraticCurveTo(sX - dirSign * 0.2, 1.1, sX - dirSign * 1.5, 0.9);
                ctx.closePath();
                ctx.fill();

                // 3. Soul Patch
                ctx.beginPath();
                ctx.ellipse(sX + dirSign * 0.6, 4.0, 1.5, 1.0, 0, 0, Math.PI * 2);
                ctx.fill();

            } else if (facing === 'down') {
                // Tam Ön Bakış (Mükemmel Sanalika Çene Geometrisi)
                // 1. Bıyık Kanatları (Ağzın ÜSTÜNDE, ortası açık ince stilist bıyık)
                ctx.beginPath();
                ctx.moveTo(-0.6, 0.7);
                ctx.quadraticCurveTo(-2.8, 0.6, -5.2, 1.4);
                ctx.lineTo(-4.8, 1.8);
                ctx.quadraticCurveTo(-2.6, 1.2, -0.6, 1.0);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(0.6, 0.7);
                ctx.quadraticCurveTo(2.8, 0.6, 5.2, 1.4);
                ctx.lineTo(4.8, 1.8);
                ctx.quadraticCurveTo(2.6, 1.2, 0.6, 1.0);
                ctx.closePath();
                ctx.fill();

                // 2. Dudak Altı Çukur / Soul Patch (Ağız altı)
                ctx.beginPath();
                ctx.moveTo(-1.1, 3.6);
                ctx.lineTo(1.1, 3.6);
                ctx.lineTo(0.7, 4.4);
                ctx.lineTo(-0.7, 4.4);
                ctx.closePath();
                ctx.fill();

                // 3. Çene Hattı ve Yanak Stubble Bandı
                ctx.beginPath();
                ctx.moveTo(-6.8, 2.2);
                ctx.quadraticCurveTo(-5.5, 4.8, 0, 6.2);
                ctx.quadraticCurveTo(5.5, 4.8, 6.8, 2.2);
                ctx.quadraticCurveTo(5.8, 5.6, 0, 7.0);
                ctx.quadraticCurveTo(-5.8, 5.6, -6.8, 2.2);
                ctx.closePath();
                ctx.fill();

                // 4. Çene Ucu Gölgeli Doku
                ctx.beginPath();
                ctx.ellipse(0, 5.4, 2.8, 1.4, 0, 0, Math.PI * 2);
                ctx.fill();

            } else {
                // Çapraz Açılar (down-right / down-left)
                const dShift = dirSign * 1.5;
                ctx.beginPath();
                ctx.moveTo(-dirSign * 0.4 + dShift, 0.7);
                ctx.quadraticCurveTo(dirSign * 2.2 + dShift, 0.6, dirSign * 5.0 + dShift, 1.5);
                ctx.lineTo(dirSign * 4.6 + dShift, 1.9);
                ctx.quadraticCurveTo(dirSign * 2.0 + dShift, 1.1, -dirSign * 0.4 + dShift, 1.0);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.ellipse(dShift * 0.6, 3.8, 1.2, 0.9, dirSign * 0.15, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(-dirSign * 5.5 + dShift, 2.0);
                ctx.quadraticCurveTo(-dirSign * 3.0 + dShift, 4.8, dShift, 6.2);
                ctx.quadraticCurveTo(dirSign * 4.5 + dShift, 5.2, dirSign * 6.5 + dShift, 2.4);
                ctx.quadraticCurveTo(dirSign * 5.0 + dShift, 6.0, dShift, 6.9);
                ctx.quadraticCurveTo(-dirSign * 4.0 + dShift, 5.6, -dirSign * 5.5 + dShift, 2.0);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        static drawK2VikingSakal(ctx, p, facing, isProfile, dirSign) {
            const customCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;
            const beardColor = customCol ? customCol : "#26150b";
            const shadowColor = "rgba(0, 0, 0, 0.35)";

            ctx.save();
            ctx.fillStyle = beardColor;

            if (isProfile) {
                const bX = dirSign * 4.6;
                // 1. Profil Bıyık: Ağzın üstünden kavisle yanağa iner (Ağız açık)
                ctx.beginPath();
                ctx.moveTo(bX - dirSign * 1.8, 0.6);
                ctx.quadraticCurveTo(bX + dirSign * 1.5, 0.7, bX + dirSign * 2.4, 2.2);
                ctx.lineTo(bX + dirSign * 1.4, 2.4);
                ctx.quadraticCurveTo(bX + dirSign * 0.4, 1.4, bX - dirSign * 1.8, 1.1);
                ctx.closePath();
                ctx.fill();

                // 2. Çeneden Başlayan Kalın Örgü (Ağzın altından başlar - y = 3.4)
                ctx.beginPath();
                ctx.moveTo(bX - dirSign * 1.5, 3.4);
                ctx.quadraticCurveTo(bX + dirSign * 2.2, 3.6, bX + dirSign * 1.2, 11.5);
                ctx.lineTo(bX - dirSign * 0.4, 11.5);
                ctx.quadraticCurveTo(bX - dirSign * 0.8, 6.0, bX - dirSign * 1.5, 3.4);
                ctx.closePath();
                ctx.fill();

                // Altın / Bronz Viking Tokaları
                ctx.fillStyle = "#f59e0b";
                ctx.fillRect(bX - dirSign * 0.6, 5.2, dirSign * 2.4, 1.4);
                ctx.fillRect(bX - dirSign * 0.2, 8.5, dirSign * 1.8, 1.2);
                ctx.fillStyle = "rgba(255,255,255,0.7)";
                ctx.fillRect(bX + dirSign * 0.2, 5.4, 0.8, 1.0);

            } else if (facing === 'down') {
                // Tam Ön Bakış
                // 1. Ağız Çevresinden Dolan Barbar Bıyık (Dudaklar TAMAMEN AÇIKTA)
                ctx.beginPath();
                ctx.moveTo(-1.0, 0.6);
                ctx.quadraticCurveTo(-3.2, 0.8, -5.5, 2.5);
                ctx.lineTo(-4.6, 2.8);
                ctx.quadraticCurveTo(-2.8, 1.5, -1.0, 1.2);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(1.0, 0.6);
                ctx.quadraticCurveTo(3.2, 0.8, 5.5, 2.5);
                ctx.lineTo(4.6, 2.8);
                ctx.quadraticCurveTo(2.8, 1.5, 1.0, 1.2);
                ctx.closePath();
                ctx.fill();

                // 2. Çeneden Başlayan Gür Örgü Sakal (y = 3.4)
                ctx.beginPath();
                ctx.moveTo(-3.5, 3.4);
                ctx.lineTo(-2.2, 11.5);
                ctx.lineTo(0, 12.5);
                ctx.lineTo(2.2, 11.5);
                ctx.lineTo(3.5, 3.4);
                ctx.closePath();
                ctx.fill();

                // Örgü Katman Dokusu (Chevron Braids)
                ctx.strokeStyle = shadowColor;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-2.8, 4.2); ctx.lineTo(0, 5.2); ctx.lineTo(2.8, 4.2);
                ctx.moveTo(-2.2, 7.0); ctx.lineTo(0, 8.0); ctx.lineTo(2.2, 7.0);
                ctx.moveTo(-1.6, 10.0); ctx.lineTo(0, 10.8); ctx.lineTo(1.6, 10.0);
                ctx.stroke();

                // 3. İki Adet Altın / Bronz Viking Sakal Tokası
                ctx.fillStyle = "#f59e0b";
                ctx.fillRect(-2.8, 5.2, 5.6, 1.5);
                ctx.fillStyle = "#b45309";
                ctx.fillRect(-2.8, 6.5, 5.6, 0.3);
                ctx.fillStyle = "rgba(255,255,255,0.75)";
                ctx.fillRect(-0.6, 5.3, 1.2, 1.3);

                ctx.fillStyle = "#f59e0b";
                ctx.fillRect(-2.0, 8.5, 4.0, 1.4);
                ctx.fillStyle = "#b45309";
                ctx.fillRect(-2.0, 9.7, 4.0, 0.3);
                ctx.fillStyle = "rgba(255,255,255,0.75)";
                ctx.fillRect(-0.4, 8.6, 0.8, 1.2);

            } else {
                // Çapraz Açılar
                const bX = dirSign * 2.0;
                ctx.beginPath();
                ctx.moveTo(bX - dirSign * 1.2, 0.6);
                ctx.quadraticCurveTo(bX + dirSign * 2.5, 0.8, bX + dirSign * 4.8, 2.6);
                ctx.lineTo(bX + dirSign * 4.0, 2.9);
                ctx.quadraticCurveTo(bX + dirSign * 2.0, 1.5, bX - dirSign * 1.2, 1.2);
                ctx.closePath();
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(bX - dirSign * 2.8, 3.4);
                ctx.lineTo(bX - dirSign * 1.6, 11.5);
                ctx.lineTo(bX + dirSign * 0.8, 12.2);
                ctx.lineTo(bX + dirSign * 2.8, 11.2);
                ctx.lineTo(bX + dirSign * 3.2, 3.4);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = "#f59e0b";
                ctx.fillRect(bX - dirSign * 2.0, 5.2, 4.8, 1.5);
                ctx.fillRect(bX - dirSign * 1.2, 8.5, 3.6, 1.4);
                ctx.fillStyle = "rgba(255,255,255,0.75)";
                ctx.fillRect(bX, 5.3, 1.0, 1.3);
            }

            ctx.restore();
        }

        static drawK2GothFaceVeil(ctx, p, facing, isProfile, dirSign) {
            const customCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;
            const veilBase = customCol ? customCol : "#0f172a";

            ctx.save();

            // 1. Yarı Şeffaf Gotik Tül / Peçe Gövdesi
            ctx.fillStyle = "rgba(15, 23, 42, 0.38)";
            if (isProfile) {
                ctx.beginPath();
                ctx.moveTo(dirSign * 1.0, -7.0);
                ctx.quadraticCurveTo(dirSign * 8.0, -7.0, dirSign * 7.5, -1.0);
                ctx.quadraticCurveTo(dirSign * 5.0, 0.5, dirSign * 0.5, 0.0);
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.moveTo(-7.8, -7.0);
                ctx.lineTo(7.8, -7.0);
                ctx.quadraticCurveTo(8.2, -1.5, 6.5, 0.2);
                ctx.quadraticCurveTo(0, 1.2, -6.5, 0.2);
                ctx.quadraticCurveTo(-8.2, -1.5, -7.8, -7.0);
                ctx.closePath();
                ctx.fill();
            }

            // 2. Gotik Elmas File / Hilme Çapraz Çizgileri
            ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            if (!isProfile) {
                for (let gx = -7; gx <= 7; gx += 3.5) {
                    ctx.moveTo(gx - 2, -6.8); ctx.lineTo(gx + 3, -0.5);
                    ctx.moveTo(gx + 2, -6.8); ctx.lineTo(gx - 3, -0.5);
                }
            } else {
                for (let gx = 0; gx <= 8; gx += 2.8) {
                    ctx.moveTo(dirSign * gx, -6.8); ctx.lineTo(dirSign * (gx + 3), -0.5);
                    ctx.moveTo(dirSign * (gx + 3), -6.8); ctx.lineTo(dirSign * gx, -0.5);
                }
            }
            ctx.stroke();

            // 3. Dantel Scalloped Kenar Bordürü
            ctx.strokeStyle = veilBase;
            ctx.lineWidth = 1.0;
            ctx.stroke();

            // 4. Şakakta Gotik Minik Siyah Gül & Kadife Fiyonk Tokası
            const roseX = isProfile ? dirSign * 2.0 : -6.5;
            const roseY = -6.0;
            ctx.fillStyle = "#18181b";
            ctx.beginPath(); ctx.arc(roseX, roseY, 1.8, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#881337";
            ctx.beginPath(); ctx.arc(roseX, roseY, 0.9, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "rgba(255,255,255,0.6)";
            ctx.beginPath(); ctx.arc(roseX - 0.4, roseY - 0.4, 0.35, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        }

        
        /**
         * 🕶️ KARAKTER 2 ÖZEL GÖZLÜK TASARIMLARI (8 MODEL & TÜM AÇILAR)
         */
        static drawK2Eyewear(ctx, p, facing, isProfile, dirSign, faceType, customCol) {
            ctx.save();
            const isFront = (facing === 'down');

            // 1. Sanalika Retro Wayfarer
            if (faceType === 'sunglasses' || faceType === 'sunglasses_retro') {
                const frameCol = customCol || '#0f172a';
                ctx.fillStyle = frameCol;
                if (isProfile) {
                    ctx.beginPath(); ctx.roundRect(dirSign * 2.5, -5.5, 7.5, 5.0, 1.5); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(dirSign * 3.5, -4.5, 2.0, 1.8);
                } else if (isFront) {
                    [-4.4, 4.4].forEach(gx => {
                        ctx.beginPath(); ctx.roundRect(gx - 3.2, -5.5, 6.4, 5.2, 1.5); ctx.fill();
                        ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(gx - 2.0, -4.5, 1.8, 1.8);
                        ctx.fillStyle = frameCol;
                    });
                    ctx.strokeStyle = frameCol; ctx.lineWidth = 1.4;
                    ctx.beginPath(); ctx.moveTo(-1.2, -3.2); ctx.lineTo(1.2, -3.2); ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.roundRect(dirSign * 1.5, -5.5, 7.0, 5.2, 1.5);
                    ctx.roundRect(-dirSign * 3.8, -5.2, 4.8, 4.8, 1.2);
                    ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillRect(dirSign * 2.8, -4.5, 2.0, 1.8);
                }
            }
            // 2. Matrix Krom Aviator (Krom Titanyum Çift Köprü & Mavi Cam)
            else if (faceType === 'sunglasses_aviator') {
                const frameCol = '#cbd5e1';
                const lensCol = customCol || '#0284c7';
                ctx.lineWidth = 1.1;
                if (isProfile) {
                    ctx.fillStyle = lensCol; ctx.strokeStyle = frameCol;
                    ctx.beginPath(); ctx.ellipse(dirSign * 6.0, -2.8, 3.8, 3.0, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 4.8, -4.2, 1.6, 1.6);
                } else if (isFront) {
                    [-4.4, 4.4].forEach(gx => {
                        ctx.fillStyle = lensCol; ctx.strokeStyle = frameCol;
                        ctx.beginPath(); ctx.ellipse(gx, -2.8, 3.5, 3.0, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                        ctx.fillStyle = '#ffffff'; ctx.fillRect(gx - 1.8, -4.2, 1.5, 1.5);
                    });
                    ctx.strokeStyle = frameCol; ctx.lineWidth = 1.1;
                    ctx.beginPath(); ctx.moveTo(-1.5, -2.8); ctx.lineTo(1.5, -2.8); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(-2.2, -5.0); ctx.lineTo(2.2, -5.0); ctx.stroke();
                } else {
                    ctx.fillStyle = lensCol; ctx.strokeStyle = frameCol;
                    ctx.beginPath(); ctx.ellipse(dirSign * 4.8, -2.8, 3.6, 3.0, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.ellipse(-dirSign * 1.8, -2.8, 2.8, 2.8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(dirSign * 1.0, -2.8); ctx.lineTo(dirSign * 2.2, -2.8); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(dirSign * 0.5, -5.0); ctx.lineTo(dirSign * 2.5, -5.0); ctx.stroke();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 4.0, -4.2, 1.6, 1.6);
                }
            }
            // 3. Vintage Kedi Gözü (Sivri Kanatlı Bordo Çerçeve & Altın Detay)
            else if (faceType === 'sunglasses_cateye') {
                const frameCol = customCol || '#991b1b';
                ctx.fillStyle = frameCol;
                if (isProfile) {
                    ctx.beginPath(); ctx.moveTo(dirSign * 2.5, -1.0); ctx.lineTo(dirSign * 10.5, -6.5); ctx.lineTo(dirSign * 8.5, 0.5); ctx.closePath(); ctx.fill();
                    ctx.fillStyle = '#facc15'; ctx.fillRect(dirSign * 9.5, -6.5, 1.2, 1.2);
                } else if (isFront) {
                    // Sol kanat
                    ctx.beginPath(); ctx.moveTo(-1.2, -1.5); ctx.lineTo(-8.5, -6.5); ctx.lineTo(-7.5, 0.5); ctx.lineTo(-1.2, -0.2); ctx.closePath(); ctx.fill();
                    // Sağ kanat
                    ctx.beginPath(); ctx.moveTo(1.2, -1.5); ctx.lineTo(8.5, -6.5); ctx.lineTo(7.5, 0.5); ctx.lineTo(1.2, -0.2); ctx.closePath(); ctx.fill();
                    ctx.fillStyle = '#facc15';
                    ctx.fillRect(-8.5, -6.5, 1.2, 1.2);
                    ctx.fillRect(7.5, -6.5, 1.2, 1.2);
                } else {
                    ctx.beginPath(); ctx.moveTo(dirSign * 1.0, -1.5); ctx.lineTo(dirSign * 9.5, -6.5); ctx.lineTo(dirSign * 8.0, 0.5); ctx.closePath(); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(-dirSign * 0.5, -1.5); ctx.lineTo(-dirSign * 4.5, -5.5); ctx.lineTo(-dirSign * 3.8, 0.2); ctx.closePath(); ctx.fill();
                    ctx.fillStyle = '#facc15'; ctx.fillRect(dirSign * 8.5, -6.5, 1.2, 1.2);
                }
            }
            // 4. Neon Siber Vizör 2077 (Fütüristik Kavisli Cyan Vizör & Siber Tarama Çizgisi)
            else if (faceType === 'sunglasses_cyber') {
                const neonCol = customCol || '#00f3ff';
                ctx.fillStyle = neonCol;
                ctx.shadowColor = neonCol; ctx.shadowBlur = 5;
                if (isProfile) {
                    ctx.fillRect(dirSign * 2.0, -5.5, 9.5, 5.2);
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 2.5, -3.2, 8.5, 1.2);
                    ctx.fillStyle = '#1e293b'; ctx.fillRect(0, -4.5, 2.5, 3.5);
                } else if (isFront) {
                    ctx.beginPath(); ctx.roundRect(-8.5, -5.5, 17.0, 5.4, 1.8); ctx.fill();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(-8.0, -3.2, 16.0, 1.2);
                    ctx.fillStyle = '#1e293b';
                    ctx.fillRect(-9.8, -4.5, 2.0, 3.5); ctx.fillRect(7.8, -4.5, 2.0, 3.5);
                } else {
                    ctx.beginPath(); ctx.roundRect(-dirSign * 3.5, -5.5, 12.5, 5.4, 1.8); ctx.fill();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(-dirSign * 3.0, -3.2, 11.5, 1.2);
                    ctx.fillStyle = '#1e293b'; ctx.fillRect(dirSign * 8.5, -4.5, 2.0, 3.5);
                }
                ctx.shadowBlur = 0;
            }
            // 5. John Lennon Yuvarlak (Yuvarlak Altın Tel & Amber Cam)
            else if (faceType === 'sunglasses_lennon') {
                const wireCol = '#facc15';
                const glassCol = customCol || '#78350f';
                ctx.lineWidth = 1.2; ctx.strokeStyle = wireCol; ctx.fillStyle = glassCol;
                if (isProfile) {
                    ctx.beginPath(); ctx.arc(dirSign * 5.8, -2.8, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 4.8, -4.5, 1.4, 1.4);
                } else if (isFront) {
                    [-4.4, 4.4].forEach(gx => {
                        ctx.beginPath(); ctx.arc(gx, -2.8, 3.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                        ctx.fillStyle = '#ffffff'; ctx.fillRect(gx - 1.5, -4.5, 1.4, 1.4);
                        ctx.fillStyle = glassCol;
                    });
                    ctx.strokeStyle = wireCol; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.arc(0, -3.5, 1.5, Math.PI, 0); ctx.stroke();
                } else {
                    ctx.beginPath(); ctx.arc(dirSign * 4.6, -2.8, 3.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.arc(-dirSign * 1.6, -2.8, 2.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                    ctx.beginPath(); ctx.arc(dirSign * 1.5, -3.5, 1.5, Math.PI, 0); ctx.stroke();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 4.0, -4.5, 1.4, 1.4);
                }
            }
            // 6. Buz Mavisi Polarize Plaj (Dinamik Spor Çerçeve & Ayna Polarize)
            else if (faceType === 'sunglasses_polar') {
                const polarCol = customCol || '#38bdf8';
                ctx.fillStyle = polarCol;
                if (isProfile) {
                    ctx.beginPath(); ctx.moveTo(dirSign * 2.0, -6.0); ctx.lineTo(dirSign * 10.5, -4.0); ctx.lineTo(dirSign * 8.5, 0.0); ctx.lineTo(dirSign * 2.0, -1.0); ctx.closePath(); ctx.fill();
                    ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.0; ctx.stroke();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 5.0, -4.2, 2.0, 1.4);
                } else if (isFront) {
                    [-4.4, 4.4].forEach(gx => {
                        ctx.beginPath(); ctx.roundRect(gx - 3.4, -5.6, 6.8, 4.8, 1.2); ctx.fill();
                        ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.0; ctx.stroke();
                        ctx.fillStyle = '#ffffff'; ctx.fillRect(gx - 2.0, -4.5, 1.8, 1.4);
                        ctx.fillStyle = polarCol;
                    });
                    ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.2;
                    ctx.beginPath(); ctx.moveTo(-8.0, -5.8); ctx.lineTo(8.0, -5.8); ctx.stroke();
                } else {
                    ctx.beginPath(); ctx.roundRect(dirSign * 1.2, -5.6, 7.5, 4.8, 1.2); ctx.fill();
                    ctx.beginPath(); ctx.roundRect(-dirSign * 3.8, -5.2, 4.6, 4.4, 1.2); ctx.fill();
                    ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 1.0; ctx.stroke();
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 3.0, -4.5, 1.8, 1.4);
                }
            }
            // 7. Rockstar Neon Yıldız (Yıldız Şekilli Magenta Festival Gözlüğü)
            else if (faceType === 'sunglasses_star') {
                const starCol = customCol || '#ec4899';
                function drawK2Star(cx, cy, spikes, outerRadius, innerRadius) {
                    let rot = Math.PI / 2 * 3;
                    let x = cx, y = cy;
                    let step = Math.PI / spikes;
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - outerRadius);
                    for (let i = 0; i < spikes; i++) {
                        x = cx + Math.cos(rot) * outerRadius;
                        y = cy + Math.sin(rot) * outerRadius;
                        ctx.lineTo(x, y);
                        rot += step;
                        x = cx + Math.cos(rot) * innerRadius;
                        y = cy + Math.sin(rot) * innerRadius;
                        ctx.lineTo(x, y);
                        rot += step;
                    }
                    ctx.lineTo(cx, cy - outerRadius);
                    ctx.closePath();
                    ctx.fill();
                    ctx.stroke();
                }
                ctx.fillStyle = starCol; ctx.strokeStyle = '#fbcfe8'; ctx.lineWidth = 1.0;
                if (isProfile) {
                    drawK2Star(dirSign * 6.0, -2.8, 5, 4.6, 2.2);
                } else if (isFront) {
                    drawK2Star(-4.4, -2.8, 5, 4.4, 2.1);
                    drawK2Star(4.4, -2.8, 5, 4.4, 2.1);
                    ctx.beginPath(); ctx.moveTo(-1.0, -2.8); ctx.lineTo(1.0, -2.8); ctx.stroke();
                } else {
                    drawK2Star(dirSign * 4.8, -2.8, 5, 4.4, 2.1);
                    drawK2Star(-dirSign * 1.5, -2.8, 5, 3.4, 1.6);
                }
            }
            // 8. Thug Life 8-Bit Piksel (Basamaklı Pikselli Siyah Bloklar & Beyaz Glint)
            else if (faceType === 'sunglasses_pixel') {
                ctx.fillStyle = '#09090b';
                if (isProfile) {
                    ctx.fillRect(dirSign * 2.5, -5.5, 7.5, 2.0);
                    ctx.fillRect(dirSign * 3.5, -3.5, 6.5, 2.0);
                    ctx.fillRect(dirSign * 4.5, -1.5, 4.5, 1.8);
                    ctx.fillStyle = '#ffffff'; ctx.fillRect(dirSign * 3.5, -5.5, 1.8, 1.8); ctx.fillRect(dirSign * 5.5, -3.5, 1.8, 1.8);
                } else if (isFront) {
                    [-4.4, 4.4].forEach(gx => {
                        ctx.fillStyle = '#09090b';
                        ctx.fillRect(gx - 3.4, -5.5, 6.8, 2.0);
                        ctx.fillRect(gx - 2.5, -3.5, 5.5, 2.0);
                        ctx.fillRect(gx - 1.5, -1.5, 3.5, 1.8);
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(gx - 2.2, -5.5, 1.8, 1.8);
                        ctx.fillRect(gx, -3.5, 1.8, 1.8);
                    });
                    ctx.fillStyle = '#09090b'; ctx.fillRect(-1.5, -4.5, 3.0, 1.5);
                } else {
                    ctx.fillStyle = '#09090b';
                    ctx.fillRect(dirSign * 1.5, -5.5, 7.5, 2.0);
                    ctx.fillRect(dirSign * 2.5, -3.5, 6.5, 2.0);
                    ctx.fillRect(dirSign * 3.5, -1.5, 4.5, 1.8);
                    ctx.fillRect(-dirSign * 3.8, -5.2, 5.0, 2.0);
                    ctx.fillRect(-dirSign * 3.2, -3.2, 4.0, 1.8);
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(dirSign * 2.8, -5.5, 1.8, 1.8);
                    ctx.fillRect(dirSign * 4.8, -3.5, 1.8, 1.8);
                }
            }
            ctx.restore();
        }

        static drawSkeletalFace(ctx, p, facing, isProfile, blinkProgress = 0, lookShiftX = 0, lookShiftY = 0, isTalking = false, smokeState = null, isFemale = false) {
            const isSelf = !p || 
                (typeof window !== 'undefined' && (p === window.previewAvatar || (typeof previewAvatar !== 'undefined' && p === previewAvatar) || (typeof myAvatar !== 'undefined' && p === myAvatar) || (typeof dressingAvatar !== 'undefined' && p === dressingAvatar))) ||
                (typeof window !== 'undefined' && (window.myId && p.id === window.myId));
            const selfGender = isSelf ? ((typeof getPlayerGender === 'function') ? getPlayerGender(p) : (typeof window !== 'undefined' ? (window.myGender || window.selectedGender) : null)) : null;

            const pGen = (p && (p.gender || (p.avatar && p.avatar.gender))) || selfGender;
            const pIsFem = (p && (p.isFemale !== undefined ? p.isFemale : (p.avatar && p.avatar.isFemale !== undefined ? p.avatar.isFemale : undefined)));

            const isExplicitMale = pGen === 'male' || pIsFem === false;
            if (isExplicitMale) {
                isFemale = false;
            } else if (pGen === 'female' || pIsFem === true) {
                isFemale = true;
            } else {
                isFemale = isFemale || (p && (p.isFemale || p.gender === 'female' || (p.avatar && (p.avatar.isFemale || p.avatar.gender === 'female')) || (typeof isFemaleAvatar === 'function' && isFemaleAvatar(p, p.color, p.hat, p.shoes))));
            }
            const faceType = p.face || 'none';
            const dirSign = (facing === 'right' || facing === 'down-right' || facing === 'up-right') ? 1 : -1;
            const isAfk = (p && p.action === 'afk');
            const isBlinkClosed = (!isAfk && blinkProgress > 0.72);
            const isInhaling = (smokeState && smokeState.isInhaling);
            const isExhaling = (smokeState && smokeState.isExhaling);
            const chillEyeScaleY = isInhaling ? 0.38 : (isExhaling ? (0.60 + Math.min(1.0, smokeState.exhaleProgress * 1.4) * 0.40) : 1.0);
            const eyeScaleY = Math.max(0.08, (1.0 - blinkProgress * 0.92) * chillEyeScaleY);
            const browOffsetY = isAfk ? 0.8 : (isInhaling ? 0.55 : (blinkProgress * 0.65));
            const now = Date.now();
            const talkMouthOpen = isTalking ? Math.max(0, Math.sin(now / 105) * 0.65 + Math.sin(now / 175) * 0.35) : 0;

            ctx.save();

            if (isProfile) {
                // --- YAN PROFİL ---
                const eyeX = dirSign * 4.6;
                const eyeY = -3.2;

                // Kaş (Göz kırparken veya uyurken hafifçe aşağı yaylanır)
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                if (isFemale) {
                    // Kadın için zarif, kavisli ince kaş
                    ctx.roundRect(eyeX - 1.0, eyeY - 3.6 + browOffsetY, 3.4, 0.75, 0.4);
                } else {
                    ctx.roundRect(eyeX - 1.2, eyeY - 3.8 + browOffsetY, 3.8, 1.1, 0.5);
                }
                ctx.fill();

                if (isAfk) {
                    // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡) - Pürüzsüz & sade dinlenme
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.arc(eyeX + 1.2, eyeY + 0.3, 1.8, 0.18 * Math.PI, 0.82 * Math.PI);
                    ctx.stroke();

                    // Kadın için kapalı göz kirpiği
                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        ctx.moveTo(eyeX + 1.2 + dirSign * 1.4, eyeY + 0.3);
                        ctx.quadraticCurveTo(eyeX + 1.2 + dirSign * 2.2, eyeY - 0.2, eyeX + 1.2 + dirSign * 2.6, eyeY - 0.6);
                        ctx.stroke();
                    }

                } else if (isBlinkClosed) {
                    // Normal uyanıkken göz kırpma çizgisi
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(eyeX + 1.2, eyeY, 1.8, Math.PI * 1.15, Math.PI * 1.85);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        ctx.moveTo(eyeX + 1.2 + dirSign * 1.4, eyeY);
                        ctx.quadraticCurveTo(eyeX + 1.2 + dirSign * 2.2, eyeY - 0.5, eyeX + 1.2 + dirSign * 2.6, eyeY - 0.8);
                        ctx.stroke();
                    }
                } else {
                    // Normal açık göz (Göz Akı & İris)
                    ctx.save();
                    ctx.translate(eyeX + 1.2, eyeY + 0.6);
                    ctx.scale(1.0, eyeScaleY);
                    ctx.translate(-(eyeX + 1.2), -(eyeY + 0.6));

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(eyeX - 0.4, eyeY - 1.2, 3.4, 3.6, 1.2);
                    ctx.fill();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(eyeX + (dirSign > 0 ? 0.4 : -0.2) + (lookShiftX * 0.4), eyeY - 0.8 + lookShiftY, 2.4, 3.0, 1.0);
                    ctx.fill();

                    // Canlılık katan beyaz parlama noktası ✨
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(eyeX + 1.2 + (lookShiftX * 0.4), eyeY + lookShiftY, 0.7, 0, Math.PI * 2);
                    ctx.fill();

                    // Kadın için kıvrık kuyruklu dış kirpik
                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        const lashCornerX = eyeX + (dirSign > 0 ? 2.8 : -0.2);
                        ctx.moveTo(lashCornerX, eyeY - 0.8);
                        ctx.quadraticCurveTo(lashCornerX + dirSign * 1.2, eyeY - 1.8, lashCornerX + dirSign * 1.8, eyeY - 2.2);
                        ctx.stroke();
                    }

                    ctx.restore();
                }

                // Kadın Yan Profil Allık (Cheek Blush & Highlight)
                if (isFemale) {
                    ctx.fillStyle = "rgba(244, 114, 182, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(eyeX + dirSign * 0.4, eyeY + 3.2, 2.0, 1.1, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                    ctx.beginPath();
                    ctx.arc(eyeX + dirSign * 0.4 + 0.4, eyeY + 2.8, 0.4, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Ağız / Konuşma / Sigara Durumları
                const isHoldingOrInhalingProfile = (smokeState && (smokeState.isInhaling || smokeState.liftProgress > 0.35));
                const isExhalingProfile = (smokeState && smokeState.isExhaling && smokeState.exhaleProgress < 0.95);

                if (isExhalingProfile) {
                    // DUMAN ÜFLERKEN: Karizmatik, zarif ve hafif büzülmüş "O" üfleme ağzı
                    const p = smokeState.exhaleProgress;
                    const pulse = Math.sin(p * Math.PI);
                    const openW = 0.95 + pulse * 0.35;
                    const openH = 0.85 + pulse * 0.40;

                    // Dış dudak
                    ctx.fillStyle = "#854d0e";
                    ctx.beginPath();
                    ctx.ellipse(dirSign * 5.6, 2.4, openW + 0.35, openH + 0.35, dirSign * 0.15, 0, Math.PI * 2);
                    ctx.fill();

                    // İç koyu boşluk
                    ctx.fillStyle = "#2d060e";
                    ctx.beginPath();
                    ctx.ellipse(dirSign * 5.6, 2.4, openW, openH, dirSign * 0.15, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isHoldingOrInhalingProfile) {
                    // SİGARA İÇERKEN: Dudaklar sigara filtresini sarar (sıkı, nötr, karizmatik dudak)
                    ctx.strokeStyle = "#854d0e";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(dirSign * 4.2, 2.2);
                    ctx.lineTo(dirSign * 6.8, 2.2);
                    ctx.stroke();

                    // Filtre tutuş koyuluğu
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    ctx.arc(dirSign * 5.6, 2.2, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isTalking && talkMouthOpen > 0.18) {
                    const openH = talkMouthOpen * 1.8;
                    ctx.fillStyle = "#881337";
                    ctx.strokeStyle = "#854d0e";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(dirSign * 5.6, 2.4, 1.6, openH, (dirSign > 0 ? 0.15 : -0.15), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Minik diş parıltısı
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(dirSign * 4.9, 2.4 - openH * 0.75, 1.4, Math.min(1.0, openH * 0.7), 0.3);
                    ctx.fill();
                } else {
                    if (isFemale) {
                        // Zarif kadın profili tebessüm ve cupid's bow dudak dolgunluğu
                        ctx.strokeStyle = "#e11d48";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 4.2, 2.0);
                            ctx.lineTo(dirSign * 6.5, 2.0);
                        } else {
                            ctx.moveTo(dirSign * 4.2, 2.1);
                            ctx.quadraticCurveTo(dirSign * 5.6, 2.5, dirSign * 6.8, 1.9);
                        }
                        ctx.stroke();

                        // Alt dudak yumuşak dolgunluk tonu
                        ctx.fillStyle = "rgba(244, 114, 182, 0.38)";
                        ctx.beginPath();
                        ctx.ellipse(dirSign * 5.4, 2.6, 0.85, 0.45, dirSign * 0.1, 0, Math.PI * 2);
                        ctx.fill();

                        // Parlak lip gloss ışıltısı ✨
                        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                        ctx.beginPath();
                        ctx.ellipse(dirSign * 5.4, 2.5, 0.45, 0.22, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Erkek doğal dinlenme / tebessüm kıvrımı
                        ctx.strokeStyle = "#854d0e";
                        ctx.lineWidth = 0.9;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 4.2, 2.0);
                            ctx.lineTo(dirSign * 6.5, 2.0);
                        } else {
                            ctx.moveTo(dirSign * 4.0, 2.2);
                            ctx.quadraticCurveTo(dirSign * 6.0, 2.8, dirSign * 7.2, 1.8);
                        }
                        ctx.stroke();
                    }
                }

            } else if (facing === 'down') {
                // --- TAM ÖN GÖRÜNÜM ---
                [-4.2, 4.2].forEach(eyeX => {
                    // Kaşlar (Hafif yaylanma veya uyku rahatlaması)
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    if (isFemale) {
                        // Kadın için zarif kavisli ince kaş
                        ctx.roundRect(eyeX - 1.5, -6.8 + browOffsetY, 3.0, 0.75, 0.4);
                    } else {
                        ctx.roundRect(eyeX - 1.6, -7.0 + browOffsetY, 3.4, 1.1, 0.5);
                    }
                    ctx.fill();

                    if (isAfk) {
                        // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡ ◡) - Pürüzsüz & sade dinlenme
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 1.4;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.arc(eyeX, -2.8, 1.9, 0.18 * Math.PI, 0.82 * Math.PI);
                        ctx.stroke();

                        if (isFemale) {
                            const lashSign = eyeX > 0 ? 1 : -1;
                            ctx.strokeStyle = "#0f172a";
                            ctx.lineWidth = 0.85;
                            ctx.lineCap = "round";
                            ctx.beginPath();
                            ctx.moveTo(eyeX + lashSign * 1.6, -2.5);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.6, -3.2, eyeX + lashSign * 3.2, -4.0);
                            ctx.stroke();
                        }

                    } else if (isBlinkClosed) {
                        // Normal uyanıkken göz kırpma çizgisi
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 1.4;
                        ctx.beginPath();
                        ctx.arc(eyeX, -3.2, 1.8, Math.PI * 1.15, Math.PI * 1.85);
                        ctx.stroke();

                        if (isFemale) {
                            const lashSign = eyeX > 0 ? 1 : -1;
                            ctx.strokeStyle = "#0f172a";
                            ctx.lineWidth = 0.85;
                            ctx.lineCap = "round";
                            ctx.beginPath();
                            ctx.moveTo(eyeX + lashSign * 1.6, -2.8);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.6, -3.6, eyeX + lashSign * 3.2, -4.2);
                            ctx.stroke();
                        }
                    } else {
                        // Normal açık göz
                        ctx.save();
                        ctx.translate(eyeX, -2.3);
                        ctx.scale(1.0, eyeScaleY);
                        ctx.translate(-eyeX, 2.3);

                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.roundRect(eyeX - 1.8, -4.2, 3.6, 3.8, 1.2);
                        ctx.fill();

                        ctx.fillStyle = "#0f172a";
                        ctx.beginPath();
                        ctx.roundRect(eyeX - 1.2 + lookShiftX, -3.8 + lookShiftY, 2.4, 3.0, 1.0);
                        ctx.fill();

                        // Beyaz Işıltı Noktası ✨
                        ctx.fillStyle = "#ffffff";
                        ctx.beginPath();
                        ctx.arc(eyeX - 0.2 + lookShiftX, -3.0 + lookShiftY, 0.75, 0, Math.PI * 2);
                        ctx.fill();

                        // Kadın için kıvrık yukarı doğru çift kirpik
                        if (isFemale) {
                            const lashSign = eyeX > 0 ? 1 : -1;
                            ctx.strokeStyle = "#0f172a";
                            ctx.lineWidth = 0.85;
                            ctx.lineCap = "round";
                            ctx.beginPath();
                            ctx.moveTo(eyeX + lashSign * 1.6, -3.8);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.8, -4.8, eyeX + lashSign * 3.4, -5.2);
                            ctx.moveTo(eyeX + lashSign * 1.2, -4.0);
                            ctx.quadraticCurveTo(eyeX + lashSign * 2.0, -5.2, eyeX + lashSign * 2.4, -5.8);
                            ctx.stroke();
                        }

                        ctx.restore();
                    }
                });

                // Kadın Yanak Allığı & Işıltı Noktaları (Cheek Blush & Sparkles)
                if (isFemale) {
                    [-4.6, 4.6].forEach(bx => {
                        ctx.fillStyle = "rgba(244, 114, 182, 0.28)";
                        ctx.beginPath();
                        ctx.ellipse(bx, 0.6, 2.2, 1.2, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                        ctx.beginPath();
                        ctx.arc(bx + (bx > 0 ? 0.4 : -0.4), 0.2, 0.45, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }

                // Minik 3D Chibi Burun Ucu & Hacim Gölgesi (Soft Chibi Nose Shadow)
                ctx.fillStyle = "rgba(180, 83, 9, 0.24)";
                ctx.beginPath();
                ctx.ellipse(lookShiftX * 0.35, -0.4 + lookShiftY * 0.2, 1.0, 0.7, 0, 0, Math.PI * 2);
                ctx.fill();

                // Minik burun ucu ışık pırıltısı
                ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
                ctx.beginPath();
                ctx.arc(lookShiftX * 0.35 - 0.2, -0.6 + lookShiftY * 0.2, 0.4, 0, Math.PI * 2);
                ctx.fill();

                // Ağız / Konuşma / Sigara Durumları
                const isHoldingOrInhalingFront = (smokeState && (smokeState.isInhaling || smokeState.liftProgress > 0.35));
                const isExhalingFront = (smokeState && smokeState.isExhaling && smokeState.exhaleProgress < 0.95);

                if (isExhalingFront) {
                    // DUMAN ÜFLERKEN: Karizmatik, zarif ve hafif büzülmüş "O" üfleme ağzı
                    const p = smokeState.exhaleProgress;
                    const pulse = Math.sin(p * Math.PI);
                    const openW = 1.1 + pulse * 0.35;
                    const openH = 0.9 + pulse * 0.35;

                    // 1. Dış dudak konturu
                    ctx.fillStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.beginPath();
                    ctx.ellipse(0, 2.3, openW + 0.35, openH + 0.35, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // 2. İç koyu ağız boşluğu
                    ctx.fillStyle = "#2d060e";
                    ctx.beginPath();
                    ctx.ellipse(0, 2.3, openW, openH, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // 3. Alt dudak ince ışık pırıltısı
                    ctx.fillStyle = "rgba(244, 114, 182, 0.35)";
                    ctx.beginPath();
                    ctx.ellipse(0, 2.3 + openH + 0.25, openW * 0.6, 0.45, 0, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isHoldingOrInhalingFront) {
                    // SİGARA İÇERKEN: Dudaklar sigara filtresini sarar (sıkı, nötr, karizmatik dudak)
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(-1.8, 2.2);
                    ctx.lineTo(1.8, 2.2);
                    ctx.stroke();

                    // Filtre tutuş koyuluğu (ortada)
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    ctx.arc(0, 2.2, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                    // Alt dudak gölgesi
                    ctx.fillStyle = "rgba(180, 83, 9, 0.22)";
                    ctx.beginPath();
                    ctx.ellipse(0, 3.1, 1.4, 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isTalking && talkMouthOpen > 0.18) {
                    const openW = 1.8 + talkMouthOpen * 1.3;
                    const openH = 1.0 + talkMouthOpen * 1.5;
                    ctx.fillStyle = "#881337";
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(0, 2.2, openW, openH, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Minik üst diş çizgisi
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(-openW * 0.65, 2.2 - openH * 0.85, openW * 1.3, Math.min(1.0, openH * 0.6), 0.3);
                    ctx.fill();
                } else {
                    if (isFemale) {
                        // Zarif kadınsı tebessüm ve cupid's bow dudak hattı
                        ctx.strokeStyle = "#e11d48";
                        ctx.lineWidth = 0.9;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(-1.6, 1.8);
                            ctx.lineTo(1.6, 1.8);
                        } else {
                            ctx.moveTo(-1.8, 2.0);
                            ctx.quadraticCurveTo(-0.9, 1.65, 0, 1.95);
                            ctx.quadraticCurveTo(0.9, 1.65, 1.8, 2.0);
                        }
                        ctx.stroke();

                        // Alt dudak yumuşak dolgunluk tonu (soft pink wash)
                        ctx.fillStyle = "rgba(244, 114, 182, 0.42)";
                        ctx.beginPath();
                        ctx.ellipse(0, 2.7, 1.4, 0.75, 0, 0, Math.PI * 2);
                        ctx.fill();

                        // Parlak lip gloss ışıltısı ✨
                        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                        ctx.beginPath();
                        ctx.ellipse(0.3, 2.6, 0.55, 0.25, -0.1, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Erkek dinlenme / tebessüm
                        ctx.strokeStyle = "#854d0e";
                        ctx.lineWidth = 1.0;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(-1.6, 1.8);
                            ctx.lineTo(1.6, 1.8);
                        } else {
                            ctx.arc(0, 1.2, 2.3, 0.25, Math.PI - 0.25);
                        }
                        ctx.stroke();
                    }
                }

            } else {
                // --- ÇAPRAZ İZOMETRİK (down-right / down-left) ---
                const nearEyeX = -dirSign * 1.8;
                const farEyeX = dirSign * 4.4;

                // Yakın Kaş & Göz
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                if (isFemale) {
                    ctx.roundRect(nearEyeX - 1.6, -6.8 + browOffsetY, 3.2, 0.75, 0.4);
                } else {
                    ctx.roundRect(nearEyeX - 1.8, -7.0 + browOffsetY, 3.6, 1.1, 0.5);
                }
                ctx.fill();

                if (isAfk) {
                    // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡) - Yakın Göz
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.arc(nearEyeX, -2.8, 1.9, 0.18 * Math.PI, 0.82 * Math.PI);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(nearEyeX - dirSign * 1.5, -2.5);
                        ctx.quadraticCurveTo(nearEyeX - dirSign * 2.5, -3.2, nearEyeX - dirSign * 3.0, -3.8);
                        ctx.stroke();
                    }

                } else if (isBlinkClosed) {
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.arc(nearEyeX, -3.2, 1.8, Math.PI * 1.15, Math.PI * 1.85);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(nearEyeX - dirSign * 1.5, -2.8);
                        ctx.quadraticCurveTo(nearEyeX - dirSign * 2.5, -3.6, nearEyeX - dirSign * 3.0, -4.2);
                        ctx.stroke();
                    }
                } else {
                    ctx.save();
                    ctx.translate(nearEyeX, -2.3);
                    ctx.scale(1.0, eyeScaleY);
                    ctx.translate(-nearEyeX, 2.3);

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(nearEyeX - 1.8, -4.2, 3.6, 3.8, 1.2);
                    ctx.fill();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(nearEyeX - 1.2 + (lookShiftX * 0.8), -3.8 + lookShiftY, 2.4, 3.0, 1.0);
                    ctx.fill();

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(nearEyeX - 0.2 + (lookShiftX * 0.8), -3.0 + lookShiftY, 0.75, 0, Math.PI * 2);
                    ctx.fill();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.85;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(nearEyeX - dirSign * 1.6, -3.8);
                        ctx.quadraticCurveTo(nearEyeX - dirSign * 2.6, -4.8, nearEyeX - dirSign * 3.2, -5.2);
                        ctx.stroke();
                    }

                    ctx.restore();
                }

                // Uzak Kaş & Göz
                ctx.fillStyle = "#1e1e1e";
                ctx.beginPath();
                if (isFemale) {
                    ctx.roundRect(farEyeX - 1.0, -6.6 + browOffsetY, 2.4, 0.70, 0.4);
                } else {
                    ctx.roundRect(farEyeX - 1.2, -6.8 + browOffsetY, 2.8, 1.0, 0.5);
                }
                ctx.fill();

                if (isAfk) {
                    // HUZURLU AŞAĞI KAVİSLİ KAPALI GÖZ (◡) - Uzak Göz
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.3;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.arc(farEyeX, -2.7, 1.5, 0.18 * Math.PI, 0.82 * Math.PI);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.8;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(farEyeX + dirSign * 1.2, -2.4);
                        ctx.quadraticCurveTo(farEyeX + dirSign * 2.0, -3.0, farEyeX + dirSign * 2.4, -3.5);
                        ctx.stroke();
                    }

                } else if (isBlinkClosed) {
                    ctx.strokeStyle = "#0f172a";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.arc(farEyeX, -3.0, 1.5, Math.PI * 1.15, Math.PI * 1.85);
                    ctx.stroke();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.8;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(farEyeX + dirSign * 1.2, -2.7);
                        ctx.quadraticCurveTo(farEyeX + dirSign * 2.0, -3.4, farEyeX + dirSign * 2.4, -3.9);
                        ctx.stroke();
                    }
                } else {
                    ctx.save();
                    ctx.translate(farEyeX, -2.2);
                    ctx.scale(1.0, eyeScaleY);
                    ctx.translate(-farEyeX, 2.2);

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(farEyeX - 1.2, -4.0, 2.6, 3.6, 1.0);
                    ctx.fill();

                    ctx.fillStyle = "#0f172a";
                    ctx.beginPath();
                    ctx.roundRect(farEyeX - 0.8 + (lookShiftX * 0.6), -3.6 + lookShiftY, 1.8, 2.8, 0.8);
                    ctx.fill();

                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(farEyeX + (lookShiftX * 0.6), -2.8 + lookShiftY, 0.6, 0, Math.PI * 2);
                    ctx.fill();

                    if (isFemale) {
                        ctx.strokeStyle = "#0f172a";
                        ctx.lineWidth = 0.8;
                        ctx.lineCap = "round";
                        ctx.beginPath();
                        ctx.moveTo(farEyeX + dirSign * 1.2, -3.6);
                        ctx.quadraticCurveTo(farEyeX + dirSign * 2.0, -4.4, farEyeX + dirSign * 2.4, -4.8);
                        ctx.stroke();
                    }

                    ctx.restore();
                }

                // Kadın Yanak Allığı (Çapraz Bakış)
                if (isFemale) {
                    ctx.fillStyle = "rgba(244, 114, 182, 0.28)";
                    ctx.beginPath();
                    ctx.ellipse(nearEyeX, 0.6, 2.2, 1.2, 0, 0, Math.PI * 2);
                    ctx.ellipse(farEyeX, 0.8, 1.8, 1.0, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
                    ctx.beginPath();
                    ctx.arc(nearEyeX + 0.4, 0.2, 0.45, 0, Math.PI * 2);
                    ctx.arc(farEyeX + 0.3, 0.4, 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }

                // 3/4 Minik Chibi Burun Ucu & Köprüsü
                const noseX = dirSign * 1.6 + lookShiftX * 0.35;
                const noseY = -0.4 + lookShiftY * 0.2;
                ctx.fillStyle = "rgba(180, 83, 9, 0.26)";
                ctx.beginPath();
                ctx.ellipse(noseX, noseY, 1.1, 0.75, dirSign * 0.15, 0, Math.PI * 2);
                ctx.fill();

                // Burun köprü ışığı
                ctx.fillStyle = "rgba(255, 255, 255, 0.20)";
                ctx.beginPath();
                ctx.arc(noseX - dirSign * 0.2, noseY - 0.2, 0.45, 0, Math.PI * 2);
                ctx.fill();

                // Ağız / Konuşma / Sigara Durumları
                const mouthCenterX = dirSign * 1.8;
                const isHoldingOrInhalingDiag = (smokeState && (smokeState.isInhaling || smokeState.liftProgress > 0.35));
                const isExhalingDiag = (smokeState && smokeState.isExhaling && smokeState.exhaleProgress < 0.95);

                if (isExhalingDiag) {
                    // DUMAN ÜFLERKEN: Karizmatik, zarif ve hafif büzülmüş "O" üfleme ağzı
                    const p = smokeState.exhaleProgress;
                    const pulse = Math.sin(p * Math.PI);
                    const openW = 1.05 + pulse * 0.35;
                    const openH = 0.85 + pulse * 0.35;

                    ctx.fillStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.beginPath();
                    ctx.ellipse(mouthCenterX, 2.5, openW + 0.35, openH + 0.35, (dirSign > 0 ? 0.08 : -0.08), 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#2d060e";
                    ctx.beginPath();
                    ctx.ellipse(mouthCenterX, 2.5, openW, openH, (dirSign > 0 ? 0.08 : -0.08), 0, Math.PI * 2);
                    ctx.fill();

                } else if (isHoldingOrInhalingDiag) {
                    // SİGARA İÇERKEN: Dudaklar sigara filtresini sarar (sıkı, nötr, karizmatik dudak)
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(mouthCenterX - 1.6, 2.4);
                    ctx.lineTo(mouthCenterX + 1.6, 2.4);
                    ctx.stroke();

                    // Filtre tutuş noktası
                    ctx.fillStyle = "#1e1e1e";
                    ctx.beginPath();
                    ctx.arc(mouthCenterX, 2.4, 0.9, 0, Math.PI * 2);
                    ctx.fill();

                } else if (isTalking && talkMouthOpen > 0.18) {
                    const openW = 1.7 + talkMouthOpen * 1.1;
                    const openH = 0.9 + talkMouthOpen * 1.4;
                    ctx.fillStyle = "#881337";
                    ctx.strokeStyle = isFemale ? "#be185d" : "#854d0e";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.ellipse(mouthCenterX, 2.5, openW, openH, (dirSign > 0 ? 0.08 : -0.08), 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();

                    // Minik üst diş çizgisi
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.roundRect(mouthCenterX - openW * 0.6, 2.5 - openH * 0.85, openW * 1.2, Math.min(0.9, openH * 0.6), 0.3);
                    ctx.fill();
                } else {
                    if (isFemale) {
                        // Zarif kadınsı çapraz tebessüm
                        ctx.strokeStyle = "#e11d48";
                        ctx.lineWidth = 0.85;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 0.8, 2.1);
                            ctx.lineTo(dirSign * 2.6, 2.1);
                        } else {
                            ctx.moveTo(dirSign * 0.5, 2.2);
                            ctx.quadraticCurveTo(dirSign * 1.8, 2.6, dirSign * 3.0, 2.0);
                        }
                        ctx.stroke();

                        // Alt dudak dolgunluğu & gloss
                        ctx.fillStyle = "rgba(244, 114, 182, 0.38)";
                        ctx.beginPath();
                        ctx.ellipse(mouthCenterX, 2.8, 1.1, 0.55, dirSign * 0.1, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
                        ctx.beginPath();
                        ctx.ellipse(mouthCenterX + 0.2, 2.7, 0.5, 0.25, 0, 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        // Erkek ağız dinlenme / tebessüm
                        ctx.strokeStyle = "#854d0e";
                        ctx.lineWidth = 1.0;
                        ctx.beginPath();
                        if (isAfk) {
                            ctx.moveTo(dirSign * 0.6, 2.0);
                            ctx.lineTo(dirSign * 2.8, 2.0);
                        } else {
                            ctx.moveTo(dirSign * 0.2, 2.4);
                            ctx.quadraticCurveTo(dirSign * 1.8, 3.0, dirSign * 3.4, 1.8);
                        }
                        ctx.stroke();
                    }
                }
            }

            // Aksesuarlar (Gözlük, Bıyık, Sakal, Viking Sakalı, Çizik Yara İzi, Allık & Çiller, Eyeliner & Kalp, Gotik Peçe)
            const customFacialHairCol = (p && p.faceColor && p.faceColor !== 'original') ? p.faceColor : null;

            if (faceType === 'sunglasses' || (faceType && faceType.startsWith('sunglasses_'))) {
                this.drawK2Eyewear(ctx, p, facing, isProfile, dirSign, faceType, customFacialHairCol);
            } else if (!isFemale && faceType === 'mustache') {
                ctx.fillStyle = customFacialHairCol || "#1e1e1e";
                ctx.beginPath();
                ctx.ellipse(isProfile ? dirSign * 5.0 : 0, 1.2, isProfile ? 3.2 : 5.5, 1.5, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (!isFemale && faceType === 'beard') {
                this.drawK2KirliSakal(ctx, p, facing, isProfile, dirSign);
            } else if (!isFemale && faceType === 'viking_beard') {
                this.drawK2VikingSakal(ctx, p, facing, isProfile, dirSign);
            } else if (faceType === 'goth_face_veil') {
                this.drawK2GothFaceVeil(ctx, p, facing, isProfile, dirSign);
            } else if (!isFemale && (faceType === 'shadow_stubble_scar' || faceType === 'scar')) {
                // 2. K2 Çizik Yara İzi & Gelişmiş Kirli Sakal
                this.drawK2KirliSakal(ctx, p, facing, isProfile, dirSign);

                // Çizik Yara İzi (Kaş üzerinden elmacık kemiğine çapraz çizik)
                const scarX = isProfile ? dirSign * 4.0 : -3.5;
                ctx.strokeStyle = "#991b1b"; // Kızıl yara dokusu
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(scarX - 1.0, -6.5);
                ctx.lineTo(scarX + 1.5, -1.5);
                ctx.stroke();
                // Yara İzi İyileşmiş Beyaz Kenar Vurgusu
                ctx.strokeStyle = "rgba(254, 226, 226, 0.65)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(scarX - 0.7, -6.5);
                ctx.lineTo(scarX + 1.8, -1.5);
                ctx.stroke();

            } else if (faceType === 'cute_blush_freckles') {
                // 3. K2 Anime Allık & Çiller (Kız / Unisex): Yanaklarda pembe allık & burun üstü çiller
                ctx.fillStyle = "rgba(244, 63, 94, 0.38)";
                if (isProfile) {
                    ctx.beginPath();
                    ctx.ellipse(dirSign * 3.8, 0.5, 3.2, 1.8, 0, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    [-4.5, 4.5].forEach(bx => {
                        ctx.beginPath();
                        ctx.ellipse(bx, 0.5, 3.0, 1.6, 0, 0, Math.PI * 2);
                        ctx.fill();
                    });
                }
                // Çiller (Freckles)
                ctx.fillStyle = "#854d0e";
                const dots = isProfile ? [[dirSign * 3.2, 0], [dirSign * 4.2, 0.8], [dirSign * 2.5, -0.4]] : [[-4.0, 0.2], [-3.2, 0.8], [4.0, 0.2], [3.2, 0.8], [0, -0.2], [-1.2, 0.4], [1.2, 0.4]];
                dots.forEach(([dx, dy]) => {
                    ctx.beginPath();
                    ctx.arc(dx, dy, 0.45, 0, Math.PI * 2);
                    ctx.fill();
                });

            } else if (faceType === 'goth_eyeliner_heart') {
                // 4. K2 Kedi Gözü Eyeliner & Kalp (Kız / Unisex): Kanatlı eyeliner ve elmacıkta minik kalp
                ctx.fillStyle = "#09090b";
                ctx.strokeStyle = "#09090b";
                ctx.lineWidth = 1.0;
                if (isProfile) {
                    // Kanatlı eyeliner kuyruğu
                    ctx.beginPath();
                    ctx.moveTo(dirSign * 5.2, -3.2);
                    ctx.lineTo(dirSign * 7.5, -4.8);
                    ctx.stroke();
                    // Kalp güzellik beni
                    ctx.beginPath();
                    ctx.arc(dirSign * 4.0, 0.2, 0.8, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    [-1, 1].forEach(side => {
                        ctx.beginPath();
                        ctx.moveTo(side * 5.5, -3.2);
                        ctx.lineTo(side * 7.8, -4.8);
                        ctx.stroke();
                    });
                    // Sol elmacıkta minik tatlı siyah kalp
                    ctx.beginPath();
                    ctx.arc(-4.2, 0.2, 0.75, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            
            ctx.restore();
        }
    }

    global.K2Head = K2Head;
    global.__k2Modules = global.__k2Modules || [];
    global.__k2Modules.push(K2Head);

    function attach(target) {
        Object.getOwnPropertyNames(K2Head).forEach(name => {
            if (name !== 'length' && name !== 'name' && name !== 'prototype') {
                target[name] = K2Head[name];
            }
        });
    }

    if (global.Karakter2Renderer) {
        attach(global.Karakter2Renderer);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = K2Head;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
