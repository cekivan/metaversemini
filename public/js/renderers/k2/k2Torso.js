// public/js/renderers/k2/k2Torso.js - Karakter 2 Gövde, Streetwear T-Shirt, Elbise/Etek & Kedi Kostümü Detayları
(function (global) {
    'use strict';

    class K2Torso {
        static drawDressSkirt(ctx, y, facing, isK2CyberDress = false, isK2GothDress = false, skirtColor = '#0ea5e9', isK2CargoMini = false, isK2ScarletGala = false, isK2KpopRebel = false, isK2CyberChic = false) {
            ctx.save();
            ctx.translate(0, y);

            const isProfile = (facing === 'right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const isBack = (facing === 'up' || facing === 'up-right');

            const waistW = 12.0;
            const hemW = isProfile ? 10.5 : 17.5;
            const skirtLen = 8.5;

            if (isK2CargoMini) {
                // TAKTİK URBAN KARGO MİNİ ETEK
                ctx.fillStyle = "#1e293b"; // Koyu taktik grafit
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 2.5);
                    ctx.lineTo(-hemW * 0.42, skirtLen - 2.5);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(-hemW / 2, skirtLen - 2.5);
                }
                ctx.closePath();
                ctx.fill();

                // Etek Pilileri
                ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                [-3.5, 0, 3.5].forEach(px => {
                    ctx.moveTo(px * 0.6, -1.0);
                    ctx.lineTo(px * 1.1, skirtLen - 2.5);
                });
                ctx.stroke();

                // Taktik Kemer & Metalik Toka
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 2.0);
                ctx.fillStyle = "#cbd5e1"; // Gümüş toka
                ctx.fillRect(-1.4, -2.5, 2.8, 2.0);

                // Yan Kargo Flap Cep & Gümüş Perçin
                if (!isBack) {
                    ctx.fillStyle = "#334155";
                    ctx.fillRect(isProfile ? 1.0 : -waistW * 0.42, 0.5, 3.2, 3.8);
                    ctx.fillStyle = "#cbd5e1";
                    ctx.beginPath();
                    ctx.arc(isProfile ? 2.6 : -waistW * 0.42 + 1.6, 1.8, 0.45, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else if (isK2CyberDress) {
                // SİBER NEON A-LINE MİNİ ETEK
                ctx.fillStyle = "#0f172a"; // Koyu taktik zemin
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 2.5);
                    ctx.lineTo(-hemW * 0.42, skirtLen - 2.5);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(-hemW / 2, skirtLen - 2.5);
                }
                ctx.closePath();
                ctx.fill();

                // Neon Mavi & Pembe Asimetrik Bindirme Katmanı
                ctx.fillStyle = skirtColor;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.2, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 3.2);
                    ctx.lineTo(-waistW * 0.1, skirtLen - 4.5);
                } else if (!isBack) {
                    ctx.moveTo(-waistW * 0.1, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.8);
                    ctx.lineTo(-waistW * 0.2, skirtLen - 4.0);
                } else {
                    ctx.moveTo(-waistW * 0.3, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(-waistW * 0.3, skirtLen - 2.5);
                }
                ctx.closePath();
                ctx.fill();

                // Neon Pembe Etek Ucu Şeridi
                ctx.strokeStyle = "#ec4899";
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-hemW * 0.42, skirtLen - 2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 2.5);
                } else {
                    ctx.moveTo(-hemW / 2, skirtLen - 2.5);
                    ctx.lineTo(hemW / 2, skirtLen - 2.5);
                }
                ctx.stroke();

                // Taktik Kemer & Toka
                ctx.fillStyle = "#1e293b";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 2.0);
                ctx.fillStyle = "#ec4899";
                ctx.fillRect(-1.5, -2.5, 3.0, 2.0);

            } else if (isK2GothDress) {
                // GOTİK GRUNGE PİLELİ ÇİFT KATMANLI ETEK
                // Alt katman: Koyu bordo/mor (#3b0764)
                ctx.fillStyle = "#3b0764";
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.35, -2.5);
                    ctx.lineTo(waistW * 0.35, -2.5);
                    ctx.lineTo(hemW * 0.52, skirtLen - 1.8);
                    ctx.lineTo(-hemW * 0.45, skirtLen - 1.8);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2 + 0.8, skirtLen - 1.8);
                    ctx.lineTo(-hemW / 2 - 0.8, skirtLen - 1.8);
                }
                ctx.closePath();
                ctx.fill();

                // Üst Katman: Derin Gotik Mor/Siyah (#181124)
                ctx.fillStyle = "#181124";
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.46, skirtLen - 3.5);
                    ctx.lineTo(-hemW * 0.40, skirtLen - 3.5);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2 - 0.6, skirtLen - 3.5);
                    ctx.lineTo(-hemW / 2 + 0.6, skirtLen - 3.5);
                }
                ctx.closePath();
                ctx.fill();

                // Pile Dikişleri (Pleats)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                const pleatSteps = isProfile ? [-2.0, 0, 2.0] : [-5.0, -2.5, 0, 2.5, 5.0];
                pleatSteps.forEach(px => {
                    ctx.moveTo(px * 0.7, -1.0);
                    ctx.lineTo(px * 1.1, skirtLen - 3.5);
                });
                ctx.stroke();

                // Sallanan Gümüş Metal Zincir (Silver Grunge Chain)
                ctx.strokeStyle = "#cbd5e1";
                ctx.lineWidth = 0.9;
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-1.0, -1.0);
                    ctx.quadraticCurveTo(1.5, 3.2, 3.8, 0.8);
                } else if (!isBack) {
                    ctx.moveTo(-3.2, -1.0);
                    ctx.quadraticCurveTo(0, 3.5, 4.2, -0.6);
                }
                ctx.stroke();

                // Korse Taban Kemeri & Gümüş Kuşgözü/Toka
                ctx.fillStyle = "#09090b";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 2.2);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-1.2, -2.5, 2.4, 2.2);

            } else if (isK2ScarletGala) {
                // K2 YIRTMAÇLI KIRMIZI GALA ELBİSESİ (Zarif, Yandan Derin Yırtmaçlı Gece Elbisesi)
                ctx.fillStyle = "#dc2626"; // Parlak carmine kırmızısı
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.52, skirtLen + 2.5);
                    ctx.lineTo(-hemW * 0.40, skirtLen + 2.5);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2 + 1.2, skirtLen + 2.5);
                    ctx.lineTo(-hemW / 2 - 1.2, skirtLen + 2.5);
                }
                ctx.closePath();
                ctx.fill();

                // Yandan Derin Yırtmaç (Side Slit - Bacağı Gösteren Kavisli Açıklık)
                if (!isBack) {
                    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(isProfile ? 1.0 : waistW * 0.2, 0);
                    ctx.lineTo(isProfile ? hemW * 0.35 : hemW * 0.32, skirtLen + 2.5);
                    ctx.stroke();

                    // Yırtmaç kenarında altın dikiş süslemesi
                    ctx.strokeStyle = "#facc15";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(isProfile ? 1.5 : waistW * 0.22, 0);
                    ctx.lineTo(isProfile ? hemW * 0.38 : hemW * 0.34, skirtLen + 2.5);
                    ctx.stroke();
                }

                // Altın Bel Zinciri / Kemer
                ctx.fillStyle = "#eab308";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 1.4);
                ctx.fillStyle = "#fef08a";
                ctx.beginPath();
                ctx.arc(0, -1.8, 1.2, 0, Math.PI * 2);
                ctx.fill();

            } else if (isK2KpopRebel) {
                // K2 K-POP REBEL ETEK (Mor-Siyah Ekose Pileli Punk Mini Etek & Zincir)
                ctx.fillStyle = "#581c87"; // Koyu gotik mor
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.32, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.46, skirtLen - 3.2);
                    ctx.lineTo(-hemW * 0.40, skirtLen - 3.2);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2 - 0.5, skirtLen - 3.2);
                    ctx.lineTo(-hemW / 2 + 0.5, skirtLen - 3.2);
                }
                ctx.closePath();
                ctx.fill();

                // İskoç Ekose Çizgileri (Black & Royal Purple Tartan Grid)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                [-4, -1, 2, 5].forEach(px => {
                    ctx.moveTo(px * 0.7, -2.0); ctx.lineTo(px * 1.0, skirtLen - 3.2);
                });
                ctx.stroke();

                ctx.strokeStyle = "rgba(192, 132, 252, 0.5)"; // Lavanta neon ekose çizgisi
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(-waistW / 2, 1.5); ctx.lineTo(waistW / 2, 1.5);
                ctx.stroke();

                // Gümüş Carabiner Tokalı Siyah Deri Kemer
                ctx.fillStyle = "#18181b";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 1.8);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-1.4, -2.5, 2.8, 1.8);

                // Sallanan Gümüş Punk Zinciri
                if (!isBack) {
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-2.5, -1.0);
                    ctx.quadraticCurveTo(0, 3.2, 3.5, -0.8);
                    ctx.stroke();
                }

            } else if (isK2CyberChic) {
                // K2 CYBER CHIC ETEK (Gece Moru / Obsidyen Katmanlı Plise Mini Etek & Çift Gümüş Zincir)
                ctx.fillStyle = "#1e1b4b"; // Gece moru plise kumaş
                ctx.beginPath();
                if (isProfile) {
                    ctx.moveTo(-waistW * 0.30, -2.5);
                    ctx.lineTo(waistW * 0.32, -2.5);
                    ctx.lineTo(hemW * 0.48, skirtLen - 2.8);
                    ctx.lineTo(-hemW * 0.38, skirtLen - 2.8);
                } else {
                    ctx.moveTo(-waistW / 2, -2.5);
                    ctx.lineTo(waistW / 2, -2.5);
                    ctx.lineTo(hemW / 2 - 0.2, skirtLen - 2.8);
                    ctx.lineTo(-hemW / 2 + 0.2, skirtLen - 2.8);
                }
                ctx.closePath();
                ctx.fill();

                // Plise Kıvrımları (Pleat Shadows)
                ctx.strokeStyle = "rgba(0, 0, 0, 0.40)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                [-4, -1.5, 1.5, 4].forEach(px => {
                    ctx.moveTo(px * 0.7, -2.0); ctx.lineTo(px * 1.05, skirtLen - 2.8);
                });
                ctx.stroke();

                // Çift Sıra Gümüş Delikli Deri Kemer (Double Grommet Belt)
                ctx.fillStyle = "#09090b";
                ctx.fillRect(-waistW / 2, -2.5, waistW, 2.0);
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-2.2, -2.5, 1.8, 1.8);
                ctx.fillRect(0.6, -2.5, 1.8, 1.8);

                // Kalçadan Sarkan Çift Gümüş Zincir (Dangling Double Silver Chain)
                if (!isBack) {
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    // Üst ince zincir
                    ctx.moveTo(-2.2, -1.0);
                    ctx.quadraticCurveTo(0.5, 2.5, 3.8, -0.8);
                    // Alt dökümlü zincir
                    ctx.moveTo(-1.6, -0.8);
                    ctx.quadraticCurveTo(1.2, 4.2, 4.4, -0.5);
                    ctx.stroke();
                }

            } else {
                // Klasik Kadın Elbisesi Eteği Fallback
                ctx.fillStyle = skirtColor;
                ctx.beginPath();
                ctx.moveTo(-waistW / 2, -2.5);
                ctx.lineTo(waistW / 2, -2.5);
                ctx.lineTo(hemW / 2, skirtLen - 2.5);
                ctx.lineTo(-hemW / 2, skirtLen - 2.5);
                ctx.closePath();
                ctx.fill();
            }

            ctx.restore();
        }

        /**
         * EN ISO 20471 2.5D İZOMETRİK REFLEKTÖRLÜ İSG VE MADENCİ YELEĞİ (K2 8-WAY)
         */
        static drawK2ReflectiveVestOverlay(ctx, teeColor, facing, isFemale, chestW, waistW, isProfile, isDiagonal, isBack) {
            let vestBase = '#84cc16'; // Neon Sarı-Yeşil (EN ISO 20471 standardı)
            let vestHigh = '#bef264';
            let vestShadow = '#4d7c0f';

            const colStr = String(teeColor || '').toLowerCase();
            if (colStr.includes('orange') || colStr.includes('turuncu')) {
                vestBase = '#f97316'; vestHigh = '#fed7aa'; vestShadow = '#c2410c';
            } else if (colStr.includes('blue') || colStr.includes('mavi')) {
                vestBase = '#2563eb'; vestHigh = '#93c5fd'; vestShadow = '#1d4ed8';
            } else if (colStr.includes('red') || colStr.includes('kirmizi')) {
                vestBase = '#dc2626'; vestHigh = '#fca5a5'; vestShadow = '#991b1b';
            }

            ctx.save();

            if (isProfile) {
                // 1. YAN PROFİL (Doğu - Sağ / Batı - Sol)
                const pGrad = ctx.createLinearGradient(-4.2, -8.0, 5.0, 4.5);
                pGrad.addColorStop(0, vestHigh);
                pGrad.addColorStop(0.5, vestBase);
                pGrad.addColorStop(1, vestShadow);
                ctx.fillStyle = pGrad;

                ctx.beginPath();
                ctx.moveTo(3.0, -8.5);
                ctx.lineTo(0.5, -8.5);
                ctx.quadraticCurveTo(-2.8, -8.5, -4.6, -7.8);
                ctx.lineTo(-4.6, 4.4);
                ctx.lineTo(5.2, 4.4);
                ctx.lineTo(6.0, -5.0);
                ctx.quadraticCurveTo(5.8, -6.8, 3.0, -8.5);
                ctx.closePath();
                ctx.fill();

                // Kol altı oyuntusu (Koyu astar iş gömleğini gösterir)
                ctx.fillStyle = "#334155";
                ctx.beginPath();
                ctx.ellipse(0.2, -4.8, 2.0, 3.2, 0, 0, Math.PI * 2);
                ctx.fill();

                // 3M Gümüş Reflektör Bantlar
                ctx.fillStyle = "#f8fafc";
                ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
                ctx.shadowBlur = 3;
                ctx.fillRect(-0.8, -8.5, 2.0, 3.0);
                ctx.fillRect(-4.5, -1.8, 10.0, 1.7);
                ctx.fillRect(-4.5, 1.6, 9.8, 1.7);
                ctx.shadowBlur = 0;

                // Yan Dikiş Biyesi
                ctx.strokeStyle = "rgba(15, 23, 42, 0.4)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0.2, -1.8); ctx.lineTo(0.2, 4.4);
                ctx.stroke();

            } else if (isDiagonal && isBack) {
                // 2. 3/4 ARKA ÇEYREK (Kuzey-Doğu / Kuzey-Batı)
                const bGrad = ctx.createLinearGradient(-chestW * 0.44, -8.5, chestW * 0.54, 4.5);
                bGrad.addColorStop(0, vestHigh);
                bGrad.addColorStop(0.5, vestBase);
                bGrad.addColorStop(1, vestShadow);
                ctx.fillStyle = bGrad;

                ctx.beginPath();
                ctx.moveTo(-chestW * 0.44 + 0.6, -6.8);
                ctx.lineTo(-2.6, -8.5);
                ctx.lineTo(4.2, -8.5);
                ctx.lineTo(chestW * 0.54 - 0.6, -7.0);
                ctx.lineTo(chestW * 0.54, -5.2);
                ctx.lineTo(waistW * 0.54, 4.4);
                ctx.lineTo(-waistW * 0.44, 4.4);
                ctx.lineTo(-chestW * 0.44, -5.2);
                ctx.closePath();
                ctx.fill();

                // 3M Gümüş Reflektör Bantlar
                ctx.fillStyle = "#f8fafc";
                ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
                ctx.shadowBlur = 3;
                ctx.fillRect(-2.2, -8.5, 1.9, 12.8);
                ctx.fillRect(2.2, -8.5, 2.1, 12.8);

                const leftW = -waistW * 0.44;
                const totalW = waistW * 0.98;
                ctx.fillRect(leftW, -2.0, totalW, 1.7);
                ctx.fillRect(leftW, 1.5, totalW, 1.7);
                ctx.shadowBlur = 0;

                // Trapez Dikişi
                ctx.strokeStyle = "rgba(15, 23, 42, 0.35)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-2.6, -8.5); ctx.quadraticCurveTo(0.8, -8.0, 4.2, -8.5);
                ctx.stroke();

            } else if (isDiagonal && !isBack) {
                // 3. 3/4 ÖN ÇEYREK (Güney-Doğu / Güney-Batı - 2.5D Asıl Açı)
                const fGrad = ctx.createLinearGradient(-chestW * 0.52, -8.5, chestW * 0.46, 4.5);
                fGrad.addColorStop(0, vestHigh);
                fGrad.addColorStop(0.5, vestBase);
                fGrad.addColorStop(1, vestShadow);
                ctx.fillStyle = fGrad;

                // Açık V-Yaka Ön Yelek Formu
                ctx.beginPath();
                ctx.moveTo(-chestW * 0.52 + 0.6, -6.8);
                ctx.lineTo(-4.4, -8.5);
                // Derin V-Yaka Kesimi
                ctx.lineTo(-2.2, -8.5);
                ctx.lineTo(-0.6, -1.0);
                ctx.lineTo(1.8, -8.5);
                ctx.lineTo(3.4, -8.5);
                ctx.lineTo(chestW * 0.46 - 0.6, -7.0);
                ctx.lineTo(chestW * 0.46, -5.2);
                ctx.lineTo(waistW * 0.46, 4.4);
                ctx.lineTo(-waistW * 0.52, 4.4);
                ctx.lineTo(-chestW * 0.52, -5.2);
                ctx.closePath();
                ctx.fill();

                // 3M Gümüş Reflektör Bantlar
                ctx.fillStyle = "#f8fafc";
                ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
                ctx.shadowBlur = 3;
                ctx.fillRect(-3.6, -8.5, 1.9, 12.8);
                ctx.fillRect(1.8, -8.5, 2.1, 12.8);

                const leftW = -waistW * 0.52;
                const totalW = waistW * 0.98;
                ctx.fillRect(leftW, -2.0, totalW, 1.7);
                ctx.fillRect(leftW, 1.5, totalW, 1.7);
                ctx.shadowBlur = 0;

                // Orta Fermuar Hattı
                ctx.strokeStyle = "#0f172a";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(-0.6, -1.0);
                ctx.lineTo(-0.6, 4.4);
                ctx.stroke();

                // Sol Göğüs Şeffaf İSG Yaka Kartı Cebi
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-4.5, -4.5, 2.8, 3.4);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-4.2, -4.2, 2.2, 2.8);
                ctx.fillStyle = "#22c55e"; // İSG Yeşil Artısı (+)
                ctx.fillRect(-3.4, -3.4, 0.6, 1.4);
                ctx.fillRect(-3.8, -3.0, 1.4, 0.6);

                // Sağ Göğüs Telsiz / Mandallı Klips
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(2.4, -6.0, 1.6, 2.2);
                ctx.fillStyle = "#38bdf8";
                ctx.fillRect(2.7, -5.6, 1.0, 0.6);

            } else if (isBack) {
                // 4. TAM ARKA (Kuzey - Tam Sırt)
                const bGrad = ctx.createLinearGradient(-chestW / 2, -8.5, chestW / 2, 4.5);
                bGrad.addColorStop(0, vestHigh);
                bGrad.addColorStop(0.5, vestBase);
                bGrad.addColorStop(1, vestShadow);
                ctx.fillStyle = bGrad;

                ctx.beginPath();
                ctx.moveTo(-chestW / 2 + 0.6, -6.9);
                ctx.lineTo(-4.2, -8.5);
                ctx.quadraticCurveTo(0, -8.0, 4.2, -8.5);
                ctx.lineTo(chestW / 2 - 0.6, -6.9);
                ctx.lineTo(chestW / 2, -5.2);
                ctx.lineTo(waistW / 2, 4.4);
                ctx.lineTo(-waistW / 2, 4.4);
                ctx.lineTo(-chestW / 2, -5.2);
                ctx.closePath();
                ctx.fill();

                // 3M Gümüş Reflektör Bantlar
                ctx.fillStyle = "#f8fafc";
                ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
                ctx.shadowBlur = 3;

                const strapOffset = isFemale ? 3.4 : 4.4;
                ctx.fillRect(-strapOffset - 1.0, -8.5, 2.1, 12.8);
                ctx.fillRect(strapOffset - 1.1, -8.5, 2.1, 12.8);

                ctx.fillRect(-waistW / 2, -2.2, waistW, 1.7);
                ctx.fillRect(-waistW / 2, 1.4, waistW, 1.7);
                ctx.shadowBlur = 0;

                ctx.strokeStyle = "rgba(15, 23, 42, 0.35)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-4.2, -8.5); ctx.quadraticCurveTo(0, -8.0, 4.2, -8.5);
                ctx.stroke();

            } else {
                // 5. TAM ÖN (Güney - Tam Göğüs)
                const fGrad = ctx.createLinearGradient(-chestW / 2, -8.5, chestW / 2, 4.5);
                fGrad.addColorStop(0, vestHigh);
                fGrad.addColorStop(0.5, vestBase);
                fGrad.addColorStop(1, vestShadow);
                ctx.fillStyle = fGrad;

                ctx.beginPath();
                ctx.moveTo(-chestW / 2 + 0.6, -6.9);
                ctx.lineTo(-4.2, -8.5);
                // Ön Derin V-Yaka
                ctx.lineTo(-2.6, -8.5);
                ctx.lineTo(0, -1.0);
                ctx.lineTo(2.6, -8.5);
                ctx.lineTo(4.2, -8.5);
                ctx.lineTo(chestW / 2 - 0.6, -6.9);
                ctx.lineTo(chestW / 2, -5.2);
                if (isFemale) {
                    ctx.quadraticCurveTo(waistW * 0.44, 0, waistW / 2, 4.4);
                    ctx.lineTo(-waistW / 2, 4.4);
                    ctx.quadraticCurveTo(-waistW * 0.44, 0, -chestW / 2, -5.2);
                } else {
                    ctx.lineTo(waistW / 2, 4.4);
                    ctx.lineTo(-waistW / 2, 4.4);
                    ctx.lineTo(-chestW / 2, -5.2);
                }
                ctx.closePath();
                ctx.fill();

                // 3M Gümüş Reflektör Bantlar
                ctx.fillStyle = "#f8fafc";
                ctx.shadowColor = "rgba(255, 255, 255, 0.65)";
                ctx.shadowBlur = 3;

                const strapOffset = isFemale ? 3.4 : 4.4;
                ctx.fillRect(-strapOffset - 1.0, -8.5, 2.1, 12.8);
                ctx.fillRect(strapOffset - 1.1, -8.5, 2.1, 12.8);

                ctx.fillRect(-waistW / 2, -2.2, waistW, 1.7);
                ctx.fillRect(-waistW / 2, 1.4, waistW, 1.7);
                ctx.shadowBlur = 0;

                // Merkez Fermuar Hattı
                ctx.strokeStyle = "#0f172a";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(0, -1.0);
                ctx.lineTo(0, 4.4);
                ctx.stroke();

                // Fermuar Tutacağı
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-0.6, -0.8, 1.2, 1.4);

                // Sol Göğüs Şeffaf İSG Kartı Cebi
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(-strapOffset - 2.0, -4.8, 2.8, 3.4);
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(-strapOffset - 1.7, -4.5, 2.2, 2.8);
                ctx.fillStyle = "#22c55e"; // İSG Yeşil Artı (+)
                ctx.fillRect(-strapOffset - 0.9, -3.8, 0.6, 1.4);
                ctx.fillRect(-strapOffset - 1.3, -3.4, 1.4, 0.6);

                // Sağ Göğüs Telsiz / Taktik Klips
                ctx.fillStyle = "#0f172a";
                ctx.fillRect(strapOffset + 0.5, -6.5, 1.8, 2.4);
                ctx.fillStyle = "#38bdf8";
                ctx.fillRect(strapOffset + 0.9, -6.1, 1.0, 0.7);
            }

            ctx.restore();
        }

        static drawStreetwearTorso(ctx, y, teeColor, teeAccent, isCyberTee, facing, isFemale, breathScaleX = 1.0, isGraffitiTee = false, isDress = false, isK2CyberDress = false, isK2GothDress = false, isK2CyberCrop = false, isK2GrungeOversize = false, isK2PastelHoodie = false, skinColor = '#ffd1a4', isK2Tuxedo = false, isK2Overcoat = false, isK2ScarletGala = false, isK2KpopRebel = false, isK2TechwearBomber = false, isK2CyberChic = false, isK2Y2KCrop = false, isK2BoxyTee = false, isK2CorsetBustier = false, isK2AsymmCutout = false, isK2CatCostume = false, isK2UrbanHoodie = false) {
            ctx.save();
            ctx.translate(0, y);
            if (breathScaleX !== 1.0) {
                ctx.scale(breathScaleX, 1.0);
            }
            const isK2ReflectorVest = (typeof teeColor === 'string' && (teeColor.includes('vest_reflector_')));
            if (isK2ReflectorVest) {
                ctx.fillStyle = "#334155"; // Kömür Antrasit İş Gömleği
            } else if (isK2CyberDress) {
                ctx.fillStyle = (teeColor && teeColor !== '#0ea5e9') ? teeColor : "#0f172a";
            } else if (isK2GothDress) {
                ctx.fillStyle = (teeColor && teeColor !== '#581c87') ? teeColor : "#181124";
            } else {
                ctx.fillStyle = teeColor;
            }

            const isProfile = (facing === 'right');
            const isDiagonal = (facing === 'down-right' || facing === 'up-right');
            const isBack = (facing === 'up' || facing === 'up-right');

            const chestW = isFemale ? 15.6 : 19.8;
            const waistW = isFemale ? 11.2 : 15.2;

            ctx.beginPath();

            if (isProfile) {
                // YAN PROFİL (Dolgun, doğal 3D gövde & omuz eğimi)
                ctx.moveTo(-4.6, 4.5);
                ctx.lineTo(5.4, 4.5);
                ctx.lineTo(6.2, -5.2);
                ctx.quadraticCurveTo(6.0, -7.0, 3.2, -8.5); // Ön köprücük kemiği / yaka eğimi
                ctx.lineTo(0.5, -8.5);
                ctx.quadraticCurveTo(-2.8, -8.5, -4.8, -7.8); // Ense ve sırt trapez eğimi (yaka tabanıyla pürüzsüz birleşir)
                ctx.quadraticCurveTo(-5.2, -6.5, -4.8, -5.2);
                ctx.closePath();
                ctx.fill();

                // Omuz Dikişi & Göğüs Çizgisi
                ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(3.2, -8.5); ctx.lineTo(1.8, -6.5); ctx.stroke();

                ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, -8.5); ctx.lineTo(0, 4.5); ctx.stroke();

                if (isK2CyberDress) {
                    // Yan profil neon pembe omuz askısı & siber panel
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(1.2, -8.5, 1.8, 3.5);
                    ctx.fillStyle = "#0ea5e9";
                    ctx.fillRect(3.8, -5.5, 1.4, 7.5);
                } else if (isK2GothDress) {
                    // Yan profil gotik korse dikişi & mor panel
                    ctx.fillStyle = "#581c87";
                    ctx.fillRect(1.5, -5.0, 2.5, 9.0);
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(3.5, -4.0); ctx.lineTo(3.5, 3.5);
                    ctx.stroke();
                } else if (isCyberTee) {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(3.8, -6.5, 1.2, 8.5); // Göğüs ön çizgisi
                } else if (isGraffitiTee) {
                    // Yan profil neon sprey lekesi
                    ctx.fillStyle = "#ec4899";
                    ctx.beginPath(); ctx.arc(3.0, -2.5, 2.0, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#22c55e";
                    ctx.beginPath(); ctx.arc(2.0, 0.8, 1.6, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#facc15";
                    ctx.fillRect(3.6, -4.5, 1.2, 7.0);
                } else if (isK2ReflectorVest) {
                    this.drawK2ReflectiveVestOverlay(ctx, teeColor, facing, isFemale, chestW, waistW, true, false, false);
                } else if (isK2CyberCrop) {
                    // Profil Cyber Crop: Açık göbek ve neon pembe askı
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(-4.6, 1.2, 10.0, 3.5);
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(1.5, -8.5, 1.6, 4.0);
                } else if (isK2GrungeOversize) {
                    // Profil Grunge Oversize: Düşük omuz dekoltesi
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.moveTo(0.5, -8.5); ctx.lineTo(3.2, -8.5); ctx.lineTo(2.5, -5.0); ctx.lineTo(0.5, -5.5);
                    ctx.closePath();
                    ctx.fill();
                } else if (isK2PastelHoodie) {
                    // Profil Pastel Crop Hoodie: Kapüşon kordonu ve açık bel
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(2.8, -7.0); ctx.lineTo(3.2, -2.5);
                    ctx.stroke();
                    ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
                    ctx.beginPath();
                    ctx.moveTo(-3.5, -8.0); ctx.quadraticCurveTo(-5.5, -5.0, -3.8, -2.5); ctx.lineTo(-2.8, -2.5);
                    ctx.closePath();
                    ctx.fill();
                } else if (isK2Y2KCrop) {
                    // Profil Y2K Crop Top: Açık göbek & yan kelebek kanadı
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(-4.6, 1.2, 10.0, 3.5);
                    ctx.fillStyle = "#f472b6";
                    ctx.fillRect(1.5, -2.8, 2.5, 1.5);
                } else if (isK2UrbanHoodie) {
                    // Profil Kanguru Cep Çıkıntısı
                    ctx.fillStyle = "rgba(0, 0, 0, 0.22)";
                    ctx.beginPath();
                    ctx.moveTo(3.6, -0.6);
                    ctx.quadraticCurveTo(5.8, 1.4, 4.4, 3.4);
                    ctx.lineTo(2.8, 3.4);
                    ctx.closePath();
                    ctx.fill();

                    // Profil Önden Sarkan Kapüşon Kordonu
                    ctx.strokeStyle = "#f8fafc";
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    ctx.moveTo(3.2, -7.0);
                    ctx.quadraticCurveTo(4.2, -4.0, 3.5, -0.8);
                    ctx.stroke();
                    ctx.fillStyle = "#e2e8f0";
                    ctx.fillRect(3.1, -0.9, 0.8, 1.4);

                    // Profil Sırtta Katlanmış Kukuleta (Folded Hood Silhouette)
                    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
                    ctx.beginPath();
                    ctx.moveTo(-3.5, -8.0);
                    ctx.quadraticCurveTo(-6.0, -5.0, -3.8, -2.5);
                    ctx.lineTo(-2.8, -2.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(-3.5, -8.0);
                    ctx.quadraticCurveTo(-6.0, -5.0, -3.8, -2.5);
                    ctx.stroke();
                } else if (isK2BoxyTee) {
                    // Profil Boxy Street Tişört: Düşük omuz dikişi
                    ctx.strokeStyle = "rgba(255,255,255,0.25)";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath(); ctx.moveTo(0, 2.0); ctx.lineTo(0, 4.5); ctx.stroke();
                } else if (isK2CorsetBustier) {
                    // Profil Korse: Kavisli balen dikişleri
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(1.2, -7.5); ctx.lineTo(1.5, 4.0);
                    ctx.moveTo(-1.8, -7.5); ctx.lineTo(-1.5, 4.0);
                    ctx.stroke();
                } else if (isK2AsymmCutout) {
                    // Profil Asimetrik: Omuz dekoltesi
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.moveTo(0.5, -8.5); ctx.lineTo(3.2, -8.5); ctx.lineTo(2.5, -5.0); ctx.lineTo(0.5, -5.5);
                    ctx.closePath();
                    ctx.fill();
                }
            } else if (isDiagonal) {
                // 3/4 İZOMETRİK ÇAPRAZ GÖVDE
                if (isBack) {
                    // 3/4 Sırt (Doğal omuz eğimi & trapez hattı)
                    ctx.moveTo(-waistW * 0.44, 4.5);
                    ctx.lineTo(waistW * 0.54, 4.5);
                    ctx.lineTo(chestW * 0.54, -5.2);
                    ctx.quadraticCurveTo(chestW * 0.54, -6.8, chestW * 0.54 - 0.6, -7.0);
                    ctx.lineTo(4.2, -8.5);
                    ctx.lineTo(-2.6, -8.5);
                    ctx.lineTo(-chestW * 0.44 + 0.6, -6.8);
                    ctx.quadraticCurveTo(-chestW * 0.44, -6.8, -chestW * 0.44, -5.2);
                    ctx.closePath();
                    ctx.fill();

                    // 3/4 Ense Mock-Neck Taban Dikişi
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                    ctx.lineWidth = 1.1;
                    ctx.beginPath();
                    ctx.moveTo(-2.6, -8.5);
                    ctx.quadraticCurveTo(0.8, -8.0, 4.2, -8.5);
                    ctx.stroke();

                    // Sırt 02 Numarası veya Grafiti Tag
                    if (isCyberTee) {
                        ctx.fillStyle = teeAccent;
                        ctx.fillRect(-3.0, -4.5, 9.5, 1.6);
                        ctx.fillStyle = "#38bdf8";
                        ctx.font = "bold 6px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("02", 1.8, 2.0);
                    } else if (isGraffitiTee) {
                        ctx.fillStyle = "#22c55e";
                        ctx.fillRect(-2.5, -4.0, 8.5, 2.0);
                        ctx.fillStyle = "#ec4899";
                        ctx.font = "bold 5px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("SK8", 1.8, 1.5);
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath(); ctx.arc(4.5, 0.5, 0.8, 0, Math.PI * 2); ctx.fill();
                    } else if (isK2CyberCrop) {
                        // 3/4 Sırt Cyber Crop: Bel açıkta ve pembe askı arkası
                        ctx.fillStyle = skinColor;
                        ctx.fillRect(-waistW * 0.44 - 0.2, 1.2, (waistW * 0.98) + 0.4, 3.5);
                        ctx.fillStyle = "#ec4899";
                        ctx.fillRect(-1.5, -8.5, 1.4, 4.0);
                    } else if (isK2GrungeOversize) {
                        // 3/4 Sırt Grunge: Sol omuz açıkta ten
                        ctx.fillStyle = skinColor;
                        ctx.beginPath();
                        ctx.moveTo(-chestW * 0.44 + 0.6, -6.8);
                        ctx.lineTo(-2.6, -8.5);
                        ctx.lineTo(-1.0, -5.5);
                        ctx.lineTo(-chestW * 0.44 + 1.2, -4.5);
                        ctx.closePath();
                        ctx.fill();
                    } else if (isK2PastelHoodie) {
                        // 3/4 Sırt Pastel Hoodie: Katlanmış kapüşon arkası
                        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
                        ctx.beginPath();
                        ctx.moveTo(-2.0, -8.0); ctx.quadraticCurveTo(0.8, -4.5, 3.5, -8.0);
                        ctx.closePath();
                        ctx.fill();
                    } else if (isK2Y2KCrop) {
                        // 3/4 Sırt Y2K Crop: Bel açıkta
                        ctx.fillStyle = skinColor;
                        ctx.fillRect(-waistW * 0.44 - 0.2, 1.2, (waistW * 0.98) + 0.4, 3.5);
                    } else if (isK2BoxyTee) {
                        ctx.fillStyle = "rgba(255,255,255,0.22)";
                        ctx.fillRect(-1.0, -5.5, 4.5, 1.0);
                    } else if (isK2CorsetBustier) {
                        // 3/4 Sırt Korse: Bağcık dikişleri
                        ctx.strokeStyle = "#94a3b8";
                        ctx.lineWidth = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(-0.5, -6.0); ctx.lineTo(2.5, -3.0);
                        ctx.moveTo(2.5, -6.0); ctx.lineTo(-0.5, -3.0);
                        ctx.moveTo(-0.5, -2.5); ctx.lineTo(2.5, 0.5);
                        ctx.moveTo(2.5, -2.5); ctx.lineTo(-0.5, 0.5);
                        ctx.stroke();
                    } else if (isK2AsymmCutout) {
                        // 3/4 Sırt Asimetrik: Sol kürek kemiğine saran dekolte
                        ctx.fillStyle = skinColor;
                        ctx.beginPath();
                        ctx.moveTo(-chestW * 0.44 + 1.0, -6.8);
                        ctx.quadraticCurveTo(-1.0, -8.5, 1.0, -5.0);
                        ctx.quadraticCurveTo(-1.5, -4.0, -chestW * 0.44 + 1.0, -4.5);
                        ctx.closePath();
                        ctx.fill();
                    } else if (isK2ReflectorVest) {
                        this.drawK2ReflectiveVestOverlay(ctx, teeColor, facing, isFemale, chestW, waistW, false, true, true);
                    } else {
                        ctx.fillStyle = teeAccent;
                        ctx.fillRect(-3.0, -4.5, 9.5, 1.6);
                    }
                } else {
                    // 3/4 Ön Göğüs (Doğal omuz eğimi & trapez hattı)
                    ctx.moveTo(-waistW * 0.52, 4.5);
                    ctx.lineTo(waistW * 0.46, 4.5);
                    ctx.lineTo(chestW * 0.46, -5.2);
                    ctx.quadraticCurveTo(chestW * 0.46, -6.8, chestW * 0.46 - 0.6, -7.0);
                    ctx.lineTo(3.4, -8.5);
                    ctx.lineTo(-4.4, -8.5);
                    ctx.lineTo(-chestW * 0.52 + 0.6, -6.8);
                    ctx.quadraticCurveTo(-chestW * 0.52, -6.8, -chestW * 0.52, -5.2);
                    ctx.closePath();
                    ctx.fill();

                    // 3/4 Streetwear Mock-Neck Taban Dikişi
                    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                    ctx.lineWidth = 1.1;
                    ctx.beginPath();
                    ctx.moveTo(-4.4, -8.5);
                    ctx.quadraticCurveTo(-0.5, -7.5, 3.4, -8.5);
                    ctx.stroke();

                    // Minimalist Taktik Göğüs Cebi (Kadın modelleri ve kadın crop/elbise/korse hariç)
                    const skipTacticalPocket = isFemale || isDress || isK2CyberDress || isK2GothDress || isK2CyberCrop || isK2GrungeOversize || isK2PastelHoodie || isK2Y2KCrop || isK2CorsetBustier || isK2AsymmCutout;
                    if (!skipTacticalPocket) {
                        ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
                        ctx.fillRect(-3.6, -5.5, 4.8, 5.2);
                        ctx.fillStyle = teeAccent;
                        ctx.fillRect(-3.6, -5.5, 4.8, 1.0);
                    }

                    if (isK2CyberCrop) {
                        // 3/4 Ön Göğüs Cyber Crop: Neon pembe askılar & açık göbek
                        ctx.fillStyle = "#ec4899";
                        ctx.fillRect(-3.2, -8.5, 1.3, 5.0);
                        ctx.fillRect(1.5, -8.5, 1.3, 5.0);
                        ctx.fillStyle = skinColor;
                        ctx.fillRect(-waistW * 0.52 - 0.2, 0.8, (waistW * 0.98) + 0.4, 3.8);
                        ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
                        ctx.beginPath(); ctx.arc(-0.5, 2.6, 0.45, 0, Math.PI * 2); ctx.fill();
                    } else if (isK2GrungeOversize) {
                        // 3/4 Ön Göğüs Grunge: Sol omuz açıkta ten
                        ctx.fillStyle = skinColor;
                        ctx.beginPath();
                        ctx.moveTo(-chestW * 0.52, -6.5);
                        ctx.lineTo(-0.8, -8.5);
                        ctx.lineTo(-0.8, -4.5);
                        ctx.lineTo(-chestW * 0.52, -4.0);
                        ctx.closePath();
                        ctx.fill();
                        ctx.fillStyle = "#181124";
                        ctx.fillRect(-2.0, 3.2, 4.5, 1.4);
                    } else if (isK2PastelHoodie) {
                        // 3/4 Ön Göğüs Pastel Hoodie: Beyaz kapüşon ipleri
                        ctx.strokeStyle = "#ffffff";
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(-1.2, -7.5); ctx.lineTo(-1.4, -2.5);
                        ctx.moveTo(1.2, -7.5); ctx.lineTo(1.4, -2.5);
                        ctx.stroke();
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(-waistW * 0.52, 3.2, waistW * 0.98, 1.2);
                    } else if (isK2CyberDress) {
                        ctx.fillStyle = "#ec4899";
                        ctx.fillRect(-3.6, -8.5, 1.5, 5.0);
                        ctx.fillRect(1.8, -8.5, 1.5, 5.0);
                        ctx.fillStyle = "#0ea5e9";
                        ctx.fillRect(-1.5, -4.0, 3.8, 6.5);
                    } else if (isK2GothDress) {
                        ctx.fillStyle = "#581c87";
                        ctx.fillRect(-2.2, -4.5, 4.4, 7.5);
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(-1.8, -3.5); ctx.lineTo(1.8, -1.5);
                        ctx.moveTo(1.8, -3.5); ctx.lineTo(-1.8, -1.5);
                        ctx.moveTo(-1.6, -1.5); ctx.lineTo(1.6, 1.0);
                        ctx.stroke();
                    } else if (isCyberTee) {
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath();
                        ctx.moveTo(-1.2, -4.0); ctx.lineTo(-2.2, -2.5); ctx.lineTo(-1.3, -2.5);
                        ctx.lineTo(-2.0, -1.0); ctx.lineTo(-0.4, -2.7); ctx.lineTo(-1.3, -2.7);
                        ctx.closePath(); ctx.fill();
                    } else if (isGraffitiTee) {
                        // 3/4 Grafiti Sprey Sıçraması
                        ctx.fillStyle = "#ec4899";
                        ctx.beginPath(); ctx.arc(-1.2, -2.5, 2.2, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#22c55e";
                        ctx.beginPath(); ctx.arc(1.0, -1.0, 1.7, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath(); ctx.arc(-2.6, -0.6, 1.1, 0, Math.PI * 2); ctx.fill();
                    } else if (isK2Y2KCrop) {
                        // 3/4 Ön Göğüs Y2K Crop: Açık bel ve pembe kelebek motifi
                        ctx.fillStyle = skinColor;
                        ctx.fillRect(-waistW * 0.52 - 0.2, 0.8, (waistW * 0.98) + 0.4, 3.8);
                        ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
                        ctx.beginPath(); ctx.arc(-0.5, 2.6, 0.45, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#ec4899";
                        ctx.beginPath(); ctx.ellipse(-1.8, -2.2, 1.5, 1.8, -0.3, 0, Math.PI * 2); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(1.0, -2.2, 1.1, 1.6, 0.3, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#f472b6";
                        ctx.beginPath(); ctx.arc(-0.4, -2.2, 0.65, 0, Math.PI * 2); ctx.fill();
                    } else if (isK2BoxyTee) {
                        ctx.fillStyle = "#f8fafc";
                        ctx.fillRect(-2.5, -3.5, 5.0, 1.2);
                        ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
                        ctx.fillRect(-waistW * 0.52, 3.2, waistW * 0.98, 1.0);
                    } else if (isK2CorsetBustier) {
                        ctx.strokeStyle = "#cbd5e1";
                        ctx.lineWidth = 0.8;
                        ctx.beginPath();
                        ctx.moveTo(-2.5, -8.0); ctx.lineTo(-1.8, 4.0);
                        ctx.moveTo(2.5, -8.0); ctx.lineTo(1.8, 4.0);
                        ctx.stroke();
                        ctx.strokeStyle = "#94a3b8";
                        ctx.lineWidth = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(-1.5, -4.5); ctx.lineTo(1.5, -2.0);
                        ctx.moveTo(1.5, -4.5); ctx.lineTo(-1.5, -2.0);
                        ctx.stroke();
                    } else if (isK2AsymmCutout) {
                        ctx.fillStyle = skinColor;
                        ctx.beginPath();
                        ctx.moveTo(-chestW * 0.52 + 1.2, -7.2);
                        ctx.quadraticCurveTo(-1.5, -8.5, 0, -4.8);
                        ctx.quadraticCurveTo(-2.5, -3.8, -chestW * 0.52 + 1.2, -4.2);
                        ctx.closePath();
                        ctx.fill();
                    } else if (isK2ReflectorVest) {
                        this.drawK2ReflectiveVestOverlay(ctx, teeColor, facing, isFemale, chestW, waistW, false, true, false);
                    }
                }

            } else if (isBack) {
                // TAM SIRT (Kuzey - Doğal trapez eğimi & yuvarlatılmış omuz başları)
                ctx.moveTo(-waistW / 2, 4.5);
                ctx.lineTo(waistW / 2, 4.5);
                ctx.lineTo(chestW / 2, -5.2);
                ctx.quadraticCurveTo(chestW / 2, -6.8, chestW / 2 - 0.6, -6.9);
                ctx.lineTo(4.2, -8.5);
                ctx.lineTo(-4.2, -8.5);
                ctx.lineTo(-chestW / 2 + 0.6, -6.9);
                ctx.quadraticCurveTo(-chestW / 2, -6.8, -chestW / 2, -5.2);
                ctx.closePath();
                ctx.fill();

                // Ense Mock-Neck Taban Dikişi
                ctx.strokeStyle = "rgba(255, 255, 255, 0.26)";
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(-4.2, -8.5);
                ctx.quadraticCurveTo(0, -8.0, 4.2, -8.5);
                ctx.stroke();

                // Dikiş
                ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(-7.5, -6.0); ctx.lineTo(7.5, -6.0);
                ctx.moveTo(0, -6.0); ctx.lineTo(0, 4.5);
                ctx.stroke();

                if (isK2CyberDress) {
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(-4.5, -8.5, 1.6, 6.5);
                    ctx.fillRect(2.9, -8.5, 1.6, 6.5);
                    ctx.fillStyle = "#0ea5e9";
                    ctx.fillRect(-2.0, -3.0, 4.0, 5.5);
                } else if (isK2GothDress) {
                    ctx.fillStyle = "#581c87";
                    ctx.fillRect(-3.0, -5.0, 6.0, 8.5);
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(-2.0, -4.0); ctx.lineTo(2.0, -1.5);
                    ctx.moveTo(2.0, -4.0); ctx.lineTo(-2.0, -1.5);
                    ctx.stroke();
                } else if (isCyberTee) {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(-5.5, -4.5, 11.0, 1.6);
                    ctx.fillStyle = "#38bdf8";
                    ctx.font = "bold 6px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("02", 0, 2.0);
                } else if (isGraffitiTee) {
                    // Devasa neon yeşil sprey aurası
                    ctx.fillStyle = "#22c55e";
                    ctx.beginPath();
                    ctx.ellipse(0, -1.5, 6.4, 3.8, 0, 0, Math.PI * 2);
                    ctx.fill();

                    // "SKATE" Kalın Grafiti Sokak Tag'i (Drop shadow ile temiz ve okunaklı)
                    ctx.fillStyle = "#0f172a";
                    ctx.font = "900 6.5px 'Impact', sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("SKATE", 0.6, 1.1); // Drop shadow
                    ctx.fillStyle = "#f43f5e";
                    ctx.fillText("SKATE", 0, 0.6);   // Canlı neon pembe ana tag

                    // Parlayan sarı sprey sıçramaları (Bağımsız damlacıklar - çokgen hatası yok)
                    ctx.fillStyle = "#facc15";
                    [[-4.5, -3.2, 0.9], [4.2, -2.8, 1.0], [3.0, 2.5, 0.8]].forEach(([dx, dy, dr]) => {
                        ctx.beginPath();
                        ctx.arc(dx, dy, dr, 0, Math.PI * 2);
                        ctx.fill();
                    });
                } else if (isK2Y2KCrop) {
                    // Tam Sırt Y2K Crop: Bel açıkta ve sırt kavisleri
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(-waistW / 2 - 0.2, 1.2, waistW + 0.4, 3.5);
                } else if (isK2BoxyTee) {
                    // Tam Sırt Boxy Street: Minimal boyun altı sokak logosu
                    ctx.fillStyle = "rgba(255,255,255,0.22)";
                    ctx.fillRect(-2.5, -6.2, 5.0, 1.0);
                } else if (isK2CorsetBustier) {
                    // Tam Sırt Korse: Arkadan çapraz saten bağcıklar
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-2.5, -6.5); ctx.lineTo(2.5, -3.5);
                    ctx.moveTo(2.5, -6.5); ctx.lineTo(-2.5, -3.5);
                    ctx.moveTo(-2.5, -3.0); ctx.lineTo(2.5, 0);
                    ctx.moveTo(2.5, -3.0); ctx.lineTo(-2.5, 0);
                    ctx.stroke();
                } else if (isK2AsymmCutout) {
                    // Tam Sırt Asimetrik Cutout: Sol omuz arkası dekolte ten
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.moveTo(-chestW / 2 + 1.2, -6.9);
                    ctx.quadraticCurveTo(-1.5, -8.5, 0, -5.2);
                    ctx.quadraticCurveTo(-2.5, -4.2, -chestW / 2 + 1.2, -4.8);
                    ctx.closePath();
                    ctx.fill();
                } else if (isK2ReflectorVest) {
                    this.drawK2ReflectiveVestOverlay(ctx, teeColor, facing, isFemale, chestW, waistW, false, false, true);
                } else {
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(-5.5, -4.5, 11.0, 1.6);
                }

            } else {
                // TAM ÖN GÖĞÜS (Güney - Doğal trapez eğimi & düşük omuz kavisleri)
                if (isFemale) {
                    // Kum Saati Korse & Bel Oyuntusu
                    ctx.moveTo(-waistW / 2, 4.5);
                    ctx.quadraticCurveTo(0, 4.8, waistW / 2, 4.5);
                    ctx.quadraticCurveTo(waistW * 0.44, 0, chestW / 2, -5.2);
                    ctx.quadraticCurveTo(chestW / 2, -6.8, chestW / 2 - 0.6, -6.9);
                    ctx.lineTo(3.6, -8.5);
                    ctx.lineTo(-3.6, -8.5);
                    ctx.lineTo(-chestW / 2 + 0.6, -6.9);
                    ctx.quadraticCurveTo(-chestW / 2, -6.8, -chestW / 2, -5.2);
                    ctx.quadraticCurveTo(-waistW * 0.44, 0, -waistW / 2, 4.5);
                } else {
                    ctx.moveTo(-waistW / 2, 4.5);
                    ctx.quadraticCurveTo(0, 4.9, waistW / 2, 4.5); // Dökümlü sokak alt etek ucu
                    ctx.lineTo(chestW / 2, -5.2);
                    ctx.quadraticCurveTo(chestW / 2, -6.8, chestW / 2 - 0.6, -6.9); // Sağ omuz başı
                    ctx.lineTo(4.2, -8.5); // Sağ trapez eğimi
                    ctx.lineTo(-4.2, -8.5); // Yaka hattı
                    ctx.lineTo(-chestW / 2 + 0.6, -6.9); // Sol trapez eğimi
                    ctx.quadraticCurveTo(-chestW / 2, -6.8, -chestW / 2, -5.2); // Sol omuz başı
                }
                ctx.closePath();
                ctx.fill();

                // Streetwear Mock-Neck Taban Dikişi (Yüksek Yaka Seviyesi)
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(-4.2, -8.5);
                ctx.quadraticCurveTo(0, -7.5, 4.2, -8.5);
                ctx.stroke();

                if (isK2CyberCrop) {
                    // Siber Crop Top: Neon pembe askılar & açık göbek ve göbek deliği
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(-3.8, -8.5, 1.4, 5.0);
                    ctx.fillRect(2.4, -8.5, 1.4, 5.0);
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(-waistW / 2 - 0.2, 0.8, waistW + 0.4, 3.8);
                    ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
                    ctx.beginPath();
                    ctx.arc(0, 2.6, 0.45, 0, Math.PI * 2);
                    ctx.fill();
                } else if (isK2GrungeOversize) {
                    // Grunge Düşük Omuz: Sol omuz açıkta ten
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.moveTo(-chestW / 2, -6.5);
                    ctx.lineTo(-0.8, -8.5);
                    ctx.lineTo(-0.8, -4.5);
                    ctx.lineTo(-chestW / 2, -4.0);
                    ctx.closePath();
                    ctx.fill();
                    // Grunge yırtık etek ucu detayı
                    ctx.fillStyle = "#181124";
                    ctx.fillRect(-2.5, 3.2, 5.0, 1.4);
                } else if (isK2PastelHoodie) {
                    // Pastel Crop Hoodie: Beyaz kapüşon ipleri & ribana
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-1.6, -7.5); ctx.lineTo(-1.8, -2.5);
                    ctx.moveTo(1.6, -7.5); ctx.lineTo(1.8, -2.5);
                    ctx.stroke();
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(-waistW / 2, 3.2, waistW, 1.2);
                } else if (isK2Y2KCrop) {
                    // Y2K Crop Top: Açık göbek ve göğüste parlayan pembe kelebek motifi
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(-waistW / 2 - 0.2, 0.4, waistW + 0.4, 4.2);
                    ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
                    ctx.beginPath(); ctx.arc(0, 2.6, 0.45, 0, Math.PI * 2); ctx.fill();
                    // Pembe Holografik Kelebek
                    ctx.fillStyle = "#ec4899";
                    ctx.beginPath(); ctx.ellipse(-1.5, -2.5, 1.4, 1.8, -0.4, 0, Math.PI * 2); ctx.fill();
                    ctx.beginPath(); ctx.ellipse(1.5, -2.5, 1.4, 1.8, 0.4, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "#f472b6";
                    ctx.beginPath(); ctx.arc(0, -2.5, 0.7, 0, Math.PI * 2); ctx.fill();
                } else if (isK2BoxyTee) {
                    // Boxy Street Tişört: Göğüste minimal beyaz sokak logosu
                    ctx.fillStyle = "#f8fafc";
                    ctx.fillRect(-2.8, -3.5, 5.6, 1.2);
                    ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
                    ctx.fillRect(-waistW / 2, 3.2, waistW, 1.0);
                } else if (isK2CorsetBustier) {
                    // Bağcıklı Korse Büstiyer: Balen dikişleri & gümüş çapraz bağcıklar
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-3.0, -8.0); ctx.lineTo(-2.2, 4.0);
                    ctx.moveTo(3.0, -8.0); ctx.lineTo(2.2, 4.0);
                    ctx.stroke();
                    ctx.strokeStyle = "#94a3b8";
                    ctx.lineWidth = 0.7;
                    ctx.beginPath();
                    ctx.moveTo(-1.8, -5.0); ctx.lineTo(1.8, -2.5);
                    ctx.moveTo(1.8, -5.0); ctx.lineTo(-1.8, -2.5);
                    ctx.moveTo(-1.8, -1.0); ctx.lineTo(1.8, 1.5);
                    ctx.moveTo(1.8, -1.0); ctx.lineTo(-1.8, 1.5);
                    ctx.stroke();
                } else if (isK2AsymmCutout) {
                    // Asimetrik Cutout: Sol omuz ve köprücük kemiğinde dekolte ten
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.moveTo(-chestW / 2 + 1.0, -7.5);
                    ctx.quadraticCurveTo(-1.5, -8.5, 0, -5.0);
                    ctx.quadraticCurveTo(-2.5, -4.0, -chestW / 2 + 1.0, -4.5);
                    ctx.closePath();
                    ctx.fill();
                    ctx.strokeStyle = "#38bdf8";
                    ctx.lineWidth = 0.6;
                    ctx.beginPath(); ctx.arc(0, -5.0, 1.0, 0, Math.PI * 2); ctx.stroke();
                } else if (isK2CyberDress) {
                    // Cyber Neon Gövde: Neon pembe omuz askıları & siber göğüs paneli
                    ctx.fillStyle = "#ec4899";
                    ctx.fillRect(-5.2, -8.5, 1.6, 6.0); // Sol askı
                    ctx.fillRect(3.6, -8.5, 1.6, 6.0);  // Sağ askı
                    ctx.fillStyle = "#0ea5e9";
                    ctx.beginPath();
                    ctx.moveTo(-3.0, -4.5); ctx.lineTo(3.0, -4.5);
                    ctx.lineTo(1.8, 3.0); ctx.lineTo(-1.8, 3.0);
                    ctx.closePath();
                    ctx.fill();
                    // Neon siber çekirdek
                    ctx.fillStyle = "#38bdf8";
                    ctx.beginPath(); ctx.arc(0, -1.0, 1.2, 0, Math.PI * 2); ctx.fill();
                } else if (isK2GothDress) {
                    // Gotik Korse Bodice: Derin mor panel & gümüş çapraz bağcıklar
                    ctx.fillStyle = "#581c87";
                    ctx.beginPath();
                    ctx.moveTo(-3.8, -5.5); ctx.lineTo(3.8, -5.5);
                    ctx.lineTo(2.4, 4.0); ctx.lineTo(-2.4, 4.0);
                    ctx.closePath();
                    ctx.fill();
                    // Gümüş Çapraz Korse Bağcıkları
                    ctx.strokeStyle = "#cbd5e1";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(-2.8, -4.0); ctx.lineTo(2.8, -1.5);
                    ctx.moveTo(2.8, -4.0); ctx.lineTo(-2.8, -1.5);
                    ctx.moveTo(-2.5, -1.5); ctx.lineTo(2.5, 1.2);
                    ctx.moveTo(2.5, -1.5); ctx.lineTo(-2.5, 1.2);
                    ctx.moveTo(-2.2, 1.2); ctx.lineTo(2.2, 3.8);
                    ctx.moveTo(2.2, 1.2); ctx.lineTo(-2.2, 3.8);
                    ctx.stroke();
                } else if (isK2ReflectorVest) {
                    this.drawK2ReflectiveVestOverlay(ctx, teeColor, facing, isFemale, chestW, waistW, false, false, false);
                } else {
                    // Minimalist Taktik Göğüs Cebi
                    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
                    ctx.fillRect(1.5, -5.5, 4.8, 5.2);
                    ctx.fillStyle = teeAccent;
                    ctx.fillRect(1.5, -5.5, 4.8, 1.0);

                    if (isCyberTee) {
                        // Neon Mavi Orta Dikiş & Şerit
                        ctx.fillStyle = teeAccent;
                        ctx.fillRect(-0.5, -6.0, 1.0, 10.5);

                        // Cep Üstü Neon Yıldırım İkonu
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath();
                        ctx.moveTo(3.9, -4.0); ctx.lineTo(2.9, -2.5); ctx.lineTo(3.8, -2.5);
                        ctx.lineTo(3.1, -1.0); ctx.lineTo(4.7, -2.7); ctx.lineTo(3.8, -2.7);
                        ctx.closePath(); ctx.fill();
                    } else if (isGraffitiTee) {
                        // Göğüs ortasında canlı grafiti sprey lekesi
                        ctx.fillStyle = "#ec4899";
                        ctx.beginPath(); ctx.arc(-1.5, -2.2, 2.8, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#22c55e";
                        ctx.beginPath(); ctx.arc(2.0, -1.0, 2.2, 0, Math.PI * 2); ctx.fill();
                        ctx.fillStyle = "#facc15";
                        ctx.beginPath(); ctx.arc(0.2, 1.0, 1.6, 0, Math.PI * 2); ctx.fill();

                        // Cep üstü "SK8" mini tag
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 4px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText("SK8", 3.8, -2.0);

                        // Sprey damlacıkları (Bağımsız damlacıklar)
                        ctx.fillStyle = "#ec4899";
                        [[-4.2, -3.5, 0.7], [-3.0, 2.2, 0.8], [5.2, 0.5, 0.7]].forEach(([dx, dy, dr]) => {
                            ctx.beginPath();
                            ctx.arc(dx, dy, dr, 0, Math.PI * 2);
                            ctx.fill();
                        });
                    }
                }
            }

            // --- ÖZEL K2 KIYAFET DETAYLARI (Smokin, Kaban, Gala, K-Pop) ---
            if (isK2Tuxedo && !isBack) {
                // Beyaz Gömlek Göğsü (Pleated White Tux Shirt)
                ctx.fillStyle = "#f8fafc";
                ctx.beginPath();
                ctx.moveTo(isProfile ? 2.5 : -2.6, -8.0);
                ctx.lineTo(isProfile ? 5.2 : 2.6, -8.0);
                ctx.lineTo(isProfile ? 4.0 : 1.2, -1.0);
                ctx.lineTo(isProfile ? 2.0 : -1.2, -1.0);
                ctx.closePath();
                ctx.fill();

                // Saten Sivri Yaka (Satin Peaked Lapels)
                ctx.strokeStyle = "#27272a";
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(isProfile ? 2.0 : -4.8, -8.0);
                ctx.lineTo(isProfile ? 3.5 : -1.2, -1.0);
                ctx.moveTo(isProfile ? 5.5 : 4.8, -8.0);
                ctx.lineTo(isProfile ? 3.5 : 1.2, -1.0);
                ctx.stroke();

                // Kırmızı Saten Papyon (Ruby Red Bow Tie)
                ctx.fillStyle = "#dc2626";
                const bowX = isProfile ? 3.5 : 0;
                ctx.beginPath();
                ctx.moveTo(bowX - 2.2, -7.5); ctx.lineTo(bowX + 2.2, -6.5);
                ctx.lineTo(bowX + 2.2, -8.5); ctx.lineTo(bowX - 2.2, -7.5);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(bowX + 2.2, -7.5); ctx.lineTo(bowX - 2.2, -6.5);
                ctx.lineTo(bowX - 2.2, -8.5); ctx.lineTo(bowX + 2.2, -7.5);
                ctx.fill();
                ctx.fillStyle = "#facc15"; // Altın orta düğüm
                ctx.fillRect(bowX - 0.6, -7.9, 1.2, 1.2);

            } else if (isK2Overcoat && !isBack) {
                // Boğazlı Siyah Kazak (Black Roll-neck Turtleneck)
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                ctx.roundRect(isProfile ? 1.5 : -2.5, -9.0, isProfile ? 3.5 : 5.0, 5.5, 1.2);
                ctx.fill();

                // Kaban Ön Açıklığı & Kalın Dökümlü Yakalar
                ctx.strokeStyle = "#3f3f46";
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(isProfile ? 1.0 : -3.5, -8.5);
                ctx.lineTo(isProfile ? 1.5 : -2.2, 4.0);
                ctx.moveTo(isProfile ? 5.0 : 3.5, -8.5);
                ctx.lineTo(isProfile ? 4.5 : 2.2, 4.0);
                ctx.stroke();

                // Gümüş Kolye & Pendant (Silver Street Chain)
                ctx.strokeStyle = "#e2e8f0";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.arc(isProfile ? 3.2 : 0, -6.0, 2.2, 0, Math.PI);
                ctx.stroke();

            } else if (isK2ScarletGala && !isBack) {
                // Omuzları Açık Sweetheart Yaka (Off-shoulder Gala Neckline)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.moveTo(isProfile ? 1.5 : -4.5, -8.5);
                ctx.quadraticCurveTo(isProfile ? 3.5 : 0, -4.8, isProfile ? 5.5 : 4.5, -8.5);
                ctx.lineTo(isProfile ? 5.5 : 4.5, -8.5);
                ctx.lineTo(isProfile ? 1.5 : -4.5, -8.5);
                ctx.closePath();
                ctx.fill();

                // Altın Gerdanlık & Kolye
                ctx.strokeStyle = "#facc15";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.arc(isProfile ? 3.5 : 0, -7.5, 2.5, 0, Math.PI);
                ctx.stroke();

                // Korse Konturu & İpeksi Işıma
                ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
                ctx.lineWidth = 0.9;
                ctx.beginPath();
                ctx.moveTo(isProfile ? 2.5 : -waistW * 0.35, -4.5);
                ctx.quadraticCurveTo(isProfile ? 3.5 : 0, -3.0, isProfile ? 4.5 : waistW * 0.35, -4.5);
                ctx.stroke();

            } else if (isK2KpopRebel && !isBack) {
                // Beyaz Crop Top (İç Tişört)
                ctx.fillStyle = "#f8fafc";
                ctx.beginPath();
                ctx.roundRect(isProfile ? 2.0 : -2.8, -7.5, isProfile ? 3.2 : 5.6, 6.0, 1.0);
                ctx.fill();

                // K-Pop Deri Motorcu Ceketi Yakaları & Metalik Çapraz Fermuar
                ctx.fillStyle = "#18181b";
                ctx.beginPath();
                ctx.moveTo(isProfile ? 0.8 : -chestW * 0.42, -8.0);
                ctx.lineTo(isProfile ? 2.2 : -2.8, -4.5);
                ctx.lineTo(isProfile ? 1.2 : -3.8, 3.5);
                ctx.lineTo(isProfile ? 0.5 : -chestW * 0.45, 3.5);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = "#cbd5e1"; // Gümüş metal fermuar
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.moveTo(isProfile ? 3.8 : 1.5, -7.0);
                ctx.lineTo(isProfile ? 2.0 : -1.8, 2.5);
                ctx.stroke();

                // Boyunda Siyah Choker Kolye
                ctx.fillStyle = "#09090b";
                ctx.fillRect(isProfile ? 2.0 : -2.6, -8.6, isProfile ? 3.4 : 5.2, 1.2);

            } else if (isK2TechwearBomber) {
                // --- TOKYO TECHWEAR BOMBER JACKET ---
                const zipX = isProfile ? 3.2 : (isDiagonal ? (facing === 'down-right' ? 1.8 : -1.8) : 0);

                // 1. Katmanlı Beyaz Tişört Alt Etek Ucu (Layered Crisp White Undershirt Hem)
                ctx.fillStyle = "#f8fafc";
                ctx.fillRect(isProfile ? 0.8 : -waistW / 2 + 0.4, 3.8, isProfile ? 4.4 : waistW - 0.8, 2.2);
                ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(isProfile ? 0.8 : -waistW / 2 + 0.4, 3.8);
                ctx.lineTo(isProfile ? 5.2 : waistW / 2 - 0.4, 3.8);
                ctx.stroke();

                // 2. Ribana Dik Bomber Yakası (Bomber Ribbed Collar)
                ctx.fillStyle = "#09090b";
                ctx.beginPath();
                ctx.roundRect(isProfile ? 1.6 : -2.8, -8.6, isProfile ? 3.6 : 5.6, 1.5, 0.6);
                ctx.fill();

                if (!isBack) {
                    // 3. Cyber-Orange Endüstriyel Ön Fermuar
                    ctx.strokeStyle = "#f97316";
                    ctx.lineWidth = 1.3;
                    ctx.beginPath();
                    ctx.moveTo(zipX, -7.2);
                    ctx.lineTo(zipX, 3.8);
                    ctx.stroke();

                    // Fermuar Çift Turuncu Çekme Ucu & Kordon
                    ctx.fillStyle = "#ea580c";
                    ctx.fillRect(zipX - 0.7, 0.2, 1.4, 2.6);
                    ctx.fillStyle = "#fb923c";
                    ctx.fillRect(zipX - 0.4, 0.6, 0.8, 1.0);

                    // 4. Yan Göğüs & Bel Kargo Flap Cepleri
                    if (!isProfile) {
                        ctx.fillStyle = "#27272a";
                        ctx.fillRect(-chestW * 0.40, -2.5, 2.8, 4.2);
                        ctx.fillRect(chestW * 0.40 - 2.8, -2.5, 2.8, 4.2);
                        ctx.fillStyle = "#f97316"; // Turuncu mini dokuma dikiş
                        ctx.fillRect(-chestW * 0.40 + 0.4, -2.5, 0.8, 1.2);
                        ctx.fillRect(chestW * 0.40 - 1.2, -2.5, 0.8, 1.2);
                    }
                } else {
                    // 5. Sırt Paneli: Techwear Webbing Çapraz Askılar & Stencil Baskı
                    ctx.strokeStyle = "#27272a";
                    ctx.lineWidth = 1.4;
                    ctx.beginPath();
                    ctx.moveTo(-chestW * 0.35, -6.0); ctx.lineTo(chestW * 0.35, 2.5);
                    ctx.moveTo(chestW * 0.35, -6.0); ctx.lineTo(-chestW * 0.35, 2.5);
                    ctx.stroke();

                    // Turuncu Dikiş Noktaları (Bar-tacks)
                    ctx.fillStyle = "#f97316";
                    ctx.fillRect(-1.0, -2.0, 2.0, 1.2);

                    // Minimal Stencil Tag
                    ctx.fillStyle = "rgba(249, 115, 22, 0.85)";
                    ctx.font = "bold 4.5px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("TK-02", 0, -3.2);
                }

            } else if (isK2CyberChic) {
                // --- Y2K CYBER CHIC CROP & BÜSTİYER ---
                if (!isBack) {
                    // 1. Omuz ve Dekolte Ten Rengi (Off-shoulder bare chest & shoulders)
                    ctx.fillStyle = skinColor;
                    ctx.beginPath();
                    ctx.moveTo(isProfile ? 1.0 : -chestW * 0.46, -8.5);
                    ctx.lineTo(isProfile ? 5.2 : chestW * 0.46, -8.5);
                    ctx.lineTo(isProfile ? 4.8 : chestW * 0.40, -4.5);
                    ctx.quadraticCurveTo(isProfile ? 3.0 : 0, -3.2, isProfile ? 1.5 : -chestW * 0.40, -4.5);
                    ctx.closePath();
                    ctx.fill();

                    // 2. Açık Bel / Karın Dekoltesi (Exposed Midriff)
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(isProfile ? 1.0 : -waistW / 2 + 0.4, 0.5, isProfile ? 4.2 : waistW - 0.8, 4.0);

                    // Bel Çukuru / Göbek Deliği Vurgusu
                    ctx.fillStyle = "rgba(180, 83, 9, 0.35)";
                    ctx.fillRect(isProfile ? 4.2 : 0, 2.4, 0.8, 1.0);

                    // 3. Pastel Lila Büstiyer Gövdesi
                    ctx.fillStyle = "#c084fc";
                    ctx.beginPath();
                    ctx.moveTo(isProfile ? 1.2 : -chestW * 0.44, -4.5);
                    ctx.quadraticCurveTo(isProfile ? 3.0 : 0, -3.2, isProfile ? 4.8 : chestW * 0.44, -4.5);
                    ctx.lineTo(isProfile ? 4.5 : waistW * 0.45, 0.6);
                    ctx.lineTo(isProfile ? 1.2 : -waistW * 0.45, 0.6);
                    ctx.closePath();
                    ctx.fill();

                    // 4. Metalik Gümüş Merkez Halka / Toka
                    ctx.strokeStyle = "#e2e8f0";
                    ctx.lineWidth = 1.0;
                    ctx.beginPath();
                    ctx.arc(isProfile ? 3.4 : 0, -3.5, 1.4, 0, Math.PI * 2);
                    ctx.stroke();

                    // 5. Boyunda Pastel Lila Choker & Gümüş Kolye Ucu
                    ctx.fillStyle = "#c084fc";
                    ctx.fillRect(isProfile ? 1.8 : -2.6, -8.6, isProfile ? 3.4 : 5.2, 1.2);
                    ctx.fillStyle = "#e2e8f0";
                    ctx.fillRect(isProfile ? 3.2 : -0.5, -7.5, 1.0, 1.0);

                } else {
                    // Arkadan Bakış: Sırt Dekoltesi ve Çapraz Mor Korse İpleri
                    ctx.fillStyle = skinColor;
                    ctx.fillRect(isProfile ? -4.5 : -chestW * 0.42, -8.5, isProfile ? 9.0 : chestW * 0.84, 9.0);

                    // Çapraz Lila Korse Bağcıkları
                    ctx.strokeStyle = "#7e22ce";
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    ctx.moveTo(-chestW * 0.32, -7.5); ctx.lineTo(chestW * 0.32, -1.0);
                    ctx.moveTo(chestW * 0.32, -7.5); ctx.lineTo(-chestW * 0.32, -1.0);
                    ctx.moveTo(-chestW * 0.28, -4.0); ctx.lineTo(chestW * 0.28, 0.5);
                    ctx.moveTo(chestW * 0.28, -4.0); ctx.lineTo(-chestW * 0.28, 0.5);
                    ctx.stroke();

                    // Bel Bandı
                    ctx.fillStyle = "#c084fc";
                    ctx.fillRect(-waistW / 2 + 0.4, 0.2, waistW - 0.8, 1.2);
                }
            }

            
            if (isK2CatCostume) {
                const catTorsoFn = this.drawCatTorsoDetails || (typeof Karakter2Renderer !== 'undefined' && Karakter2Renderer.drawCatTorsoDetails) || (typeof K2Torso !== 'undefined' && K2Torso.drawCatTorsoDetails);
                if (typeof catTorsoFn === 'function') {
                    catTorsoFn.call(this, ctx, isProfile, isDiagonal, isBack, facing, chestW, waistW);
                }
            }

            ctx.restore();
        }

        static drawCatTorsoDetails(ctx, isProfile, isDiagonal, isBack, facing, chestW, waistW) {
            ctx.save();
            const whitePatch = '#fffbeb';
            const redCollar = '#ef4444';
            const bellGold = '#facc15';
            const bellHighlight = '#fef08a';
            const bellShadow = '#b45309';

            if (isBack) {
                // Arkadan bakış: Kırmızı boyun tasması ve sırt dikişi
                ctx.fillStyle = redCollar;
                ctx.beginPath();
                ctx.roundRect(-waistW * 0.28, -8.6, waistW * 0.56, 1.6, 0.8);
                ctx.fill();

                ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.moveTo(0, -7.0); ctx.lineTo(0, 4.5);
                ctx.stroke();

            } else if (isProfile) {
                // Yan Profil: Ön göğüs beyaz yama kavisi, boyun tasması & profilde altın çan
                ctx.fillStyle = whitePatch;
                ctx.beginPath();
                ctx.moveTo(2.4, -7.5);
                ctx.quadraticCurveTo(5.8, -3.5, 5.0, 4.5);
                ctx.lineTo(2.0, 4.5);
                ctx.quadraticCurveTo(3.2, -2.0, 1.2, -7.5);
                ctx.closePath();
                ctx.fill();

                // Kırmızı tasma bandı
                ctx.fillStyle = redCollar;
                ctx.fillRect(1.0, -8.6, 3.4, 1.6);

                // Profil Altın Çan
                const bellX = 4.4;
                const bellY = -6.8;
                ctx.fillStyle = bellGold;
                ctx.strokeStyle = bellShadow;
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.arc(bellX, bellY, 2.0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Çan parlama noktası
                ctx.fillStyle = bellHighlight;
                ctx.beginPath();
                ctx.arc(bellX - 0.5, bellY - 0.6, 0.65, 0, Math.PI * 2);
                ctx.fill();

                // Çan ağız yarığı
                ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
                ctx.lineWidth = 0.55;
                ctx.beginPath();
                ctx.moveTo(bellX - 0.8, bellY + 0.5); ctx.lineTo(bellX + 1.2, bellY + 0.5);
                ctx.stroke();

            } else if (isDiagonal) {
                // 3/4 Çapraz Ön: Göğüs & Göbek Beyaz Peluş Yaması, Kırmızı Tasma, Altın Çan
                const patchCenterX = (facing === 'down-right') ? 0.6 : -0.6;
                ctx.fillStyle = whitePatch;
                ctx.beginPath();
                ctx.ellipse(patchCenterX, -1.2, chestW * 0.28, 5.6, (facing === 'down-right' ? 0.08 : -0.08), 0, Math.PI * 2);
                ctx.fill();

                // Kırmızı Tasma
                ctx.fillStyle = redCollar;
                ctx.beginPath();
                ctx.roundRect(-waistW * 0.32, -8.6, waistW * 0.64, 1.6, 0.8);
                ctx.fill();

                // Altın Çan
                const bellX = patchCenterX;
                const bellY = -6.8;
                ctx.fillStyle = bellGold;
                ctx.strokeStyle = bellShadow;
                ctx.lineWidth = 0.65;
                ctx.beginPath();
                ctx.arc(bellX, bellY, 2.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Çan parlama noktası
                ctx.fillStyle = bellHighlight;
                ctx.beginPath();
                ctx.arc(bellX - 0.6, bellY - 0.7, 0.75, 0, Math.PI * 2);
                ctx.fill();

                // Çan yatay ses yarığı & delik
                ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(bellX - 1.2, bellY + 0.6); ctx.lineTo(bellX + 1.2, bellY + 0.6);
                ctx.stroke();
                ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
                ctx.beginPath();
                ctx.arc(bellX, bellY + 0.6, 0.45, 0, Math.PI * 2);
                ctx.fill();

                // Fermuar Çizgisi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(bellX, -4.4); ctx.lineTo(bellX, 4.4);
                ctx.stroke();

            } else {
                // Tam Ön (Güney): Simetrik Beyaz Göbek Yaması, Kırmızı Tasma, Parlak Altın Çan
                ctx.fillStyle = whitePatch;
                ctx.beginPath();
                ctx.ellipse(0, -1.0, chestW * 0.30, 5.8, 0, 0, Math.PI * 2);
                ctx.fill();

                // Peluş Dikiş Konturu
                ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
                ctx.lineWidth = 0.6;
                ctx.stroke();

                // Kırmızı Tasma
                ctx.fillStyle = redCollar;
                ctx.beginPath();
                ctx.roundRect(-chestW * 0.26, -8.6, chestW * 0.52, 1.7, 0.85);
                ctx.fill();

                // Altın Çan (Merkez)
                const bellY = -6.8;
                ctx.fillStyle = bellGold;
                ctx.strokeStyle = bellShadow;
                ctx.lineWidth = 0.7;
                ctx.beginPath();
                ctx.arc(0, bellY, 2.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Çan Üstü Altın Parıltı Noktası (135° Işık Kaynağı)
                ctx.fillStyle = bellHighlight;
                ctx.beginPath();
                ctx.arc(-0.7, bellY - 0.8, 0.8, 0, Math.PI * 2);
                ctx.fill();

                // Çan alt yarığı & orta delik
                ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
                ctx.lineWidth = 0.65;
                ctx.beginPath();
                ctx.moveTo(-1.4, bellY + 0.7); ctx.lineTo(1.4, bellY + 0.7);
                ctx.stroke();
                ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
                ctx.beginPath();
                ctx.arc(0, bellY + 0.7, 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Fermuar ve Metalik Çekme Ucu
                ctx.fillStyle = "#cbd5e1";
                ctx.fillRect(-0.4, -4.2, 0.8, 1.1);
                ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(0, -3.1); ctx.lineTo(0, 4.5);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * 🐱 K2 SEVİMLİ PATİ ELDİVENİ (Paw Mittens with Pink Beans)
         */
        static drawCatPawMitten(ctx, armW, wristY, teeColor, isFar, handPose, effFacing, isBack, isProfile) {
            ctx.save();
            ctx.translate(0, wristY + 0.3);

            const baseCol = teeColor || '#232326';
            const highlightCol = '#3f3f46';
            const shadowCol = '#151518';
            const pinkPad = '#f472b6';

            // 1. Peluş Pati Şekli
            ctx.fillStyle = isFar ? shadowCol : baseCol;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 0.7;

            ctx.beginPath();
            ctx.roundRect(-2.3, 0, 4.6, 4.8, [1.5, 1.5, 2.2, 2.2]);
            ctx.fill();
            ctx.stroke();

            // 135° Aydınlatma Vurgusu
            if (!isFar) {
                ctx.fillStyle = highlightCol;
                ctx.fillRect(-1.9, 0.4, 1.2, 1.0);
            }

            // 2. Pembe Pati Yastıkları (Beans): Öne/yana bakan avuç içlerinde görünür
            if (!isBack && handPose !== 'pocket') {
                // Ana avuç içi yastığı (Büyük pembe kalp/fasulye)
                ctx.fillStyle = pinkPad;
                ctx.beginPath();
                ctx.ellipse(0, 2.6, 1.3, 0.95, 0, 0, Math.PI * 2);
                ctx.fill();

                // 3 Adet Minik Parmak Fasulyesi (Toe Beans)
                ctx.beginPath();
                ctx.arc(-1.2, 1.2, 0.45, 0, Math.PI * 2);
                ctx.arc(0, 0.9, 0.45, 0, Math.PI * 2);
                ctx.arc(1.2, 1.2, 0.45, 0, Math.PI * 2);
                ctx.fill();
            } else if (isBack) {
                // Arkadan bakış: Pati sırtı 3 parmak dikiş çentiği
                ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(-0.8, 3.2); ctx.lineTo(-0.8, 4.6);
                ctx.moveTo(0.8, 3.2); ctx.lineTo(0.8, 4.6);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * 🐱 K2 SEVİMLİ PATİ BOTLARI (Cat Paw Booties)
         */
        static drawCatPawBootie(ctx, shoeStartX, shoeW, cargoColor, isProfile, isDiagonal, isBack, isFar) {
            ctx.save();
            const baseCol = cargoColor || '#232326';
            const highlightCol = '#3f3f46';
            const shadowCol = '#151518';
            const whiteToe = '#fffbeb';

            // Zemin Temas Gölgesi
            ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            ctx.beginPath();
            ctx.ellipse(shoeStartX + shoeW * 0.5, 2.8, shoeW * 0.52, 1.4, 0, 0, Math.PI * 2);
            ctx.fill();

            // Peluş Pati Botu Gövdesi
            ctx.fillStyle = isFar ? shadowCol : baseCol;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 0.8;

            ctx.beginPath();
            if (isProfile) {
                ctx.roundRect(shoeStartX, 0, shoeW, 2.7, [1.5, 2.2, 1.2, 1.2]);
            } else {
                ctx.roundRect(shoeStartX, 0, shoeW, 2.7, [1.5, 1.5, 2.2, 2.2]);
            }
            ctx.fill();
            ctx.stroke();

            // 135° Işık Vurgusu
            if (!isFar) {
                ctx.fillStyle = highlightCol;
                ctx.fillRect(shoeStartX + 0.8, 0.4, shoeW * 0.4, 0.7);
            }

            // 3 Adet Yuvarlak Parmak Çıkıntısı & Beyaz Peluş Uçlar
            if (!isBack) {
                ctx.fillStyle = whiteToe;
                const toeW = (shoeW - 1.2) / 3;
                for (let i = 0; i < 3; i++) {
                    const tx = shoeStartX + 0.6 + i * toeW;
                    ctx.beginPath();
                    ctx.ellipse(tx + toeW * 0.5, 2.1, toeW * 0.42, 0.6, 0, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Parmak ayırıcı mikro dikişler
                ctx.strokeStyle = "rgba(0, 0, 0, 0.28)";
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(shoeStartX + 0.6 + toeW, 1.2); ctx.lineTo(shoeStartX + 0.6 + toeW, 2.7);
                ctx.moveTo(shoeStartX + 0.6 + toeW * 2, 1.2); ctx.lineTo(shoeStartX + 0.6 + toeW * 2, 2.7);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * 🐱 K2 SALLANAN KEDİ KUYRUĞU
         * 2.5D İzometrik, Peluş Beyaz Uçlu, Sinüzoidal Kinematik Dalgalanma
         */
        static drawCatTail(ctx, facing, isBack, isSitting, isMoving, now, walkCycle, suitColor) {
            ctx.save();
            const baseCol = suitColor || '#232326';
            const highlightCol = '#3f3f46';
            const tipCol = '#fffbeb'; // Beyaz / Krem peluş uç

            const isProfile = (facing === 'right');
            const isQuarterFront = (facing === 'down-right');

            // Kuyruk Başlangıç Noktası (Pelvis tabanı / bel omurgası)
            const rootX = isProfile ? -4.2 : (isQuarterFront ? -2.8 : (isBack ? 0 : 2.5));
            const rootY = isSitting ? 8.5 : 5.8;

            ctx.translate(rootX, rootY);

            // Kinematik Salınım Açısı
            const idleSway = Math.sin(now / 340) * 0.22 + Math.cos(now / 520) * 0.10;
            const moveSway = isMoving ? (Math.sin(walkCycle * 1.4) * 0.42) : 0;
            const totalSway = isSitting ? (Math.sin(now / 600) * 0.12) : (idleSway + moveSway);

            ctx.rotate(totalSway);

            // S-Kıvrımlı Kuyruk Çizimi (Bézier Yolu & Kalınlık Derecesi)
            let p0, cp1, cp2, p3;

            if (isSitting) {
                p0 = { x: 0, y: 0 };
                cp1 = { x: 6.0, y: 2.5 };
                cp2 = { x: 10.5, y: -2.0 };
                p3 = { x: 13.0, y: -6.5 };
            } else if (isProfile) {
                p0 = { x: 0, y: 0 };
                cp1 = { x: -6.5, y: -2.0 };
                cp2 = { x: -11.0, y: -7.0 };
                p3 = { x: -9.5, y: -13.5 };
            } else if (isBack) {
                p0 = { x: 0, y: 0 };
                cp1 = { x: -5.0, y: -3.0 };
                cp2 = { x: -8.0, y: -9.0 };
                p3 = { x: -5.5, y: -15.0 };
            } else {
                p0 = { x: 0, y: 0 };
                cp1 = { x: 7.0, y: -2.0 };
                cp2 = { x: 12.0, y: -8.0 };
                p3 = { x: 9.5, y: -14.5 };
            }

            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // Zemin Düşüm Gölgesi / Kontur
            ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
            ctx.lineWidth = 3.6;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
            ctx.stroke();

            // Ana Renk Dolgusu
            ctx.strokeStyle = baseCol;
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, p3.x, p3.y);
            ctx.stroke();

            // 135° Işık Vurgusu (Üst kenar parlak çizgi)
            ctx.strokeStyle = highlightCol;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y - 0.5);
            ctx.bezierCurveTo(cp1.x, cp1.y - 0.5, cp2.x, cp2.y - 0.5, p3.x, p3.y - 0.5);
            ctx.stroke();

            // Beyaz / Krem Peluş Kuyruk Ucu
            ctx.strokeStyle = tipCol;
            ctx.lineWidth = 3.1;
            ctx.beginPath();
            ctx.moveTo(cp2.x * 0.4 + p3.x * 0.6, cp2.y * 0.4 + p3.y * 0.6);
            ctx.lineTo(p3.x, p3.y);
            ctx.stroke();

            // Fluffy Ponpon Tip
            ctx.fillStyle = tipCol;
            ctx.beginPath();
            ctx.arc(p3.x, p3.y, 1.9, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        /**
         * 🐱 K2 SEVİMLİ KEDİ KOSTÜMÜ KAPÜŞONU, 3D KULAKLAR VE BIYIKLAR
         * 2.5D İzometrik 8 Yönlü, 135° Işık Kaynağına Uygun, Peluş Doku & Hacim
         */
        static drawCatHood(ctx, p, facing, isBack, isProfile, skinColor, hoodColor) {
            ctx.save();
            const baseCol = hoodColor || '#232326';
            const highlightCol = '#3f3f46';
            const shadowCol = '#151518';
            const pinkInner = '#f472b6';
            const pinkFluff = '#fbcfe8';

            const hoodY = -2.5;

            if (isBack) {
                // --- TAM ARKA / 3/4 ARKA KAPÜŞON GÖRÜNÜMÜ ---
                const hoodW = 21.6;
                const hoodH = 21.4;

                const grad = ctx.createRadialGradient(-3.5, hoodY - 4.0, 3.0, 0, hoodY, 13.0);
                grad.addColorStop(0, highlightCol);
                grad.addColorStop(0.55, baseCol);
                grad.addColorStop(1, shadowCol);
                ctx.fillStyle = grad;
                ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                ctx.lineWidth = 1.0;

                ctx.beginPath();
                ctx.ellipse(0, hoodY, hoodW * 0.5, hoodH * 0.5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();

                // Kapüşon Orta Sırt Dikişi
                ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(0, hoodY - hoodH * 0.48);
                ctx.quadraticCurveTo(0.4, hoodY, 0, hoodY + hoodH * 0.48);
                ctx.stroke();

                // 3D Dik Kedi Kulakları (Arkadan Görünüm)
                this.drawBackCatEar(ctx, -6.6, hoodY - 9.0, -1, baseCol, highlightCol, shadowCol);
                this.drawBackCatEar(ctx, 6.6, hoodY - 9.0, 1, baseCol, highlightCol, shadowCol);

            } else if (isProfile) {
                // --- YAN PROFİL KAPÜŞON GÖRÜNÜMÜ ---
                const dirSign = (facing === 'right') ? 1 : -1;

                ctx.save();
                if (dirSign < 0) ctx.scale(-1, 1);

                const grad = ctx.createLinearGradient(-10.0, hoodY - 10.0, 10.0, hoodY + 10.0);
                grad.addColorStop(0, highlightCol);
                grad.addColorStop(0.6, baseCol);
                grad.addColorStop(1, shadowCol);
                ctx.fillStyle = grad;
                ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
                ctx.lineWidth = 0.9;

                // Yan profil kapüşon kılıfı
                ctx.beginPath();
                ctx.moveTo(-1.0, hoodY - 10.8);
                ctx.quadraticCurveTo(7.8, hoodY - 8.5, 7.2, hoodY - 0.5);
                ctx.quadraticCurveTo(5.8, hoodY + 6.0, 1.2, hoodY + 9.5);
                ctx.quadraticCurveTo(-7.2, hoodY + 8.8, -9.8, hoodY + 2.0);
                ctx.quadraticCurveTo(-10.8, hoodY - 6.0, -1.0, hoodY - 10.8);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // Yüz Açıklığı (Profilde yüzün görünmesi için kesik)
                ctx.fillStyle = skinColor;
                ctx.beginPath();
                ctx.moveTo(1.2, hoodY - 7.6);
                ctx.quadraticCurveTo(7.2, hoodY - 4.5, 6.8, hoodY + 0.5);
                ctx.quadraticCurveTo(5.6, hoodY + 5.2, 1.2, hoodY + 7.2);
                ctx.quadraticCurveTo(2.4, hoodY - 0.5, 1.2, hoodY - 7.6);
                ctx.closePath();
                ctx.fill();

                // Profil 3D Kedi Kulakları
                this.drawFrontCatEar(ctx, -2.0, hoodY - 9.5, 0.82, baseCol, highlightCol, shadowCol, pinkInner, pinkFluff, true);
                this.drawFrontCatEar(ctx, 3.2, hoodY - 9.0, 1.05, baseCol, highlightCol, shadowCol, pinkInner, pinkFluff, false);

                // Profil Kedi Burnu ve Bıyıkları
                ctx.fillStyle = pinkInner;
                ctx.beginPath();
                ctx.ellipse(6.8, hoodY + 3.8, 1.2, 0.9, 0.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = "rgba(40, 40, 45, 0.45)";
                ctx.lineWidth = 0.65;
                ctx.beginPath();
                ctx.moveTo(6.0, hoodY + 3.8); ctx.quadraticCurveTo(9.4, hoodY + 2.8, 12.0, hoodY + 3.2);
                ctx.moveTo(6.0, hoodY + 4.4); ctx.quadraticCurveTo(9.5, hoodY + 4.6, 12.2, hoodY + 5.4);
                ctx.moveTo(5.8, hoodY + 5.0); ctx.quadraticCurveTo(9.2, hoodY + 6.0, 11.5, hoodY + 7.2);
                ctx.stroke();

                ctx.restore();

            } else {
                // --- TAM ÖN / 3/4 ÖN KAPÜŞON GÖRÜNÜMÜ ---
                const isDiagonal = (facing === 'down-right' || facing === 'down-left');
                const dirSign = (facing === 'down-right') ? 1 : (facing === 'down-left' ? -1 : 0);
                const hoodW = 21.6;
                const hoodH = 21.4;

                const grad = ctx.createRadialGradient(-3.5, hoodY - 4.0, 2.5, 0, hoodY, 13.5);
                grad.addColorStop(0, highlightCol);
                grad.addColorStop(0.55, baseCol);
                grad.addColorStop(1, shadowCol);
                ctx.fillStyle = grad;
                ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
                ctx.lineWidth = 1.0;

                const faceOpenW = 15.6;
                const faceOpenH = 15.2;
                const faceOpenX = isDiagonal ? (dirSign * 0.9) : 0;
                const faceOpenY = hoodY + 0.8;

                // EvenOdd Kuralı ile Dış Kapüşon Çerçevesi (Yüz açığı boş bırakılır)
                ctx.beginPath();
                ctx.ellipse(0, hoodY, hoodW * 0.5, hoodH * 0.5, 0, 0, Math.PI * 2, false);
                ctx.ellipse(faceOpenX, faceOpenY, faceOpenW * 0.5, faceOpenH * 0.5, 0, 0, Math.PI * 2, true);
                ctx.fill('evenodd');
                ctx.stroke();

                // Yüz Açıklığının Peluş Katlantı Bordürü
                ctx.strokeStyle = "rgba(255, 255, 255, 0.20)";
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.ellipse(faceOpenX, faceOpenY, faceOpenW * 0.5, faceOpenH * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();

                // 3D Dik Kedi Kulakları
                this.drawFrontCatEar(ctx, -6.6, hoodY - 9.2, isDiagonal && dirSign > 0 ? 0.88 : 1.0, baseCol, highlightCol, shadowCol, pinkInner, pinkFluff, false);
                this.drawFrontCatEar(ctx, 6.6, hoodY - 9.2, isDiagonal && dirSign < 0 ? 0.88 : 1.0, baseCol, highlightCol, shadowCol, pinkInner, pinkFluff, false);

                // Sevimli Pembe Kedi Burnu
                const noseX = isDiagonal ? (dirSign * 1.1) : 0;
                const noseY = hoodY + 3.8;

                ctx.fillStyle = pinkInner;
                ctx.beginPath();
                ctx.moveTo(noseX - 1.3, noseY - 0.7);
                ctx.lineTo(noseX + 1.3, noseY - 0.7);
                ctx.quadraticCurveTo(noseX + 0.8, noseY + 0.8, noseX, noseY + 1.1);
                ctx.quadraticCurveTo(noseX - 0.8, noseY + 0.8, noseX - 1.3, noseY - 0.7);
                ctx.closePath();
                ctx.fill();

                // Burun Işıltısı
                ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
                ctx.beginPath();
                ctx.arc(noseX - 0.4, noseY - 0.3, 0.4, 0, Math.PI * 2);
                ctx.fill();

                // Küçük Dikey Burun-Dudak Hattı (Philtrum)
                ctx.strokeStyle = "rgba(40, 40, 45, 0.35)";
                ctx.lineWidth = 0.55;
                ctx.beginPath();
                ctx.moveTo(noseX, noseY + 1.1);
                ctx.lineTo(noseX, noseY + 1.9);
                ctx.stroke();

                // Yanak Kedi Bıyıkları (=^.^=)
                ctx.strokeStyle = "rgba(30, 30, 35, 0.45)";
                ctx.lineWidth = 0.65;

                // Sol Yanak Bıyıkları
                const lOriginX = noseX - 3.2;
                const lOriginY = noseY + 1.3;
                ctx.beginPath();
                ctx.moveTo(lOriginX, lOriginY - 0.6);
                ctx.quadraticCurveTo(lOriginX - 4.5, lOriginY - 1.6, lOriginX - 8.5, lOriginY - 1.0);
                ctx.moveTo(lOriginX, lOriginY);
                ctx.quadraticCurveTo(lOriginX - 4.8, lOriginY + 0.2, lOriginX - 9.0, lOriginY + 1.2);
                ctx.moveTo(lOriginX, lOriginY + 0.6);
                ctx.quadraticCurveTo(lOriginX - 4.4, lOriginY + 1.8, lOriginX - 8.2, lOriginY + 3.2);
                ctx.stroke();

                // Sağ Yanak Bıyıkları
                const rOriginX = noseX + 3.2;
                const rOriginY = noseY + 1.3;
                ctx.beginPath();
                ctx.moveTo(rOriginX, rOriginY - 0.6);
                ctx.quadraticCurveTo(rOriginX + 4.5, rOriginY - 1.6, rOriginX + 8.5, rOriginY - 1.0);
                ctx.moveTo(rOriginX, rOriginY);
                ctx.quadraticCurveTo(rOriginX + 4.8, rOriginY + 0.2, rOriginX + 9.0, rOriginY + 1.2);
                ctx.moveTo(rOriginX, rOriginY + 0.6);
                ctx.quadraticCurveTo(rOriginX + 4.4, rOriginY + 1.8, rOriginX + 8.2, rOriginY + 3.2);
                ctx.stroke();
            }

            ctx.restore();
        }

        /**
         * Önden/Çaprazdan 3D Kedi Kulağı Çizici (Peluş hacim & pembe kulak içi tüyleri)
         */
        static drawFrontCatEar(ctx, x, y, scale, baseCol, highlightCol, shadowCol, pinkInner, pinkFluff, isFar = false) {
            ctx.save();
            ctx.translate(x, y);
            if (scale !== 1.0) ctx.scale(scale, scale);

            const isLeft = (x < 0);
            const slant = isLeft ? -0.22 : 0.22;
            ctx.rotate(slant);

            // Kulak Dış Hacmi (Üçgen Peluş Piramit)
            ctx.fillStyle = isLeft ? highlightCol : baseCol;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
            ctx.lineWidth = 0.85;

            ctx.beginPath();
            ctx.moveTo(-3.8, 2.2);
            ctx.quadraticCurveTo(-3.2, -4.5, 0, -8.2); // Kulak sivri tepesi
            ctx.quadraticCurveTo(3.2, -4.5, 3.8, 2.2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Pembe Kulak İçi Boşluğu
            ctx.fillStyle = pinkInner;
            ctx.beginPath();
            ctx.moveTo(-2.4, 1.4);
            ctx.quadraticCurveTo(-1.8, -3.2, 0, -6.4);
            ctx.quadraticCurveTo(1.8, -3.2, 2.4, 1.4);
            ctx.closePath();
            ctx.fill();

            // Kulak İçi Yumuşak Beyaz/Pembe Tüy Tutamları (Ear Tuft Fluff)
            ctx.fillStyle = pinkFluff;
            ctx.beginPath();
            ctx.moveTo(-2.0, 1.2);
            ctx.quadraticCurveTo(-0.8, -1.2, 0.2, -3.0);
            ctx.quadraticCurveTo(0.0, -0.8, 1.8, 1.2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        /**
         * Arkadan 3D Kedi Kulağı Çizici
         */
        static drawBackCatEar(ctx, x, y, dir, baseCol, highlightCol, shadowCol) {
            ctx.save();
            ctx.translate(x, y);
            const slant = (dir < 0) ? -0.22 : 0.22;
            ctx.rotate(slant);

            ctx.fillStyle = (dir < 0) ? highlightCol : shadowCol;
            ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
            ctx.lineWidth = 0.85;

            ctx.beginPath();
            ctx.moveTo(-3.8, 2.2);
            ctx.quadraticCurveTo(-3.0, -4.5, 0, -8.2);
            ctx.quadraticCurveTo(3.0, -4.5, 3.8, 2.2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Arka sırt kıkırdak kabartısı
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(0, -8.0); ctx.lineTo(0, 1.8);
            ctx.stroke();

            ctx.restore();
        }

    }

    global.K2Torso = K2Torso;
    global.__k2Modules = global.__k2Modules || [];
    global.__k2Modules.push(K2Torso);

    function attach(target) {
        Object.getOwnPropertyNames(K2Torso).forEach(name => {
            if (name !== 'length' && name !== 'name' && name !== 'prototype') {
                target[name] = K2Torso[name];
            }
        });
    }

    if (global.Karakter2Renderer) {
        attach(global.Karakter2Renderer);
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = K2Torso;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
