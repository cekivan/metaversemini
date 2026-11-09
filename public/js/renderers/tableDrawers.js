/**
 * ============================================================================
 * MINI METAVERSE - MASA OYUNLARI ÇİZİM MOTORU (TABLE DRAWERS)
 * ============================================================================
 * Kafe, Nargile Salonu, Kıraathane ve VIP Kulüplerdeki masa nesnelerini çizer:
 * - Bilardo Masası (8-Ball)
 * - Geleneksel Tavla Masası
 * - Neon XOX Bistro Masası
 * - Amiral Battı Taktik Masası
 * - Ahşap Turnuva Satranç Masası
 * - Yuvarlak Batak & İskambil Masası
 * - 4 Kişilik 101 Okey Masası
 * - Canlı Blackjack 21 Masası
 */

// 1. BİLARDO MASASI ÇİZİMİ
function drawBilliardTableObj(x, y, w, h, isHover) {
    ctx.save();
    // Masa gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 8, w, h, 14);
    ctx.fill();

    // Hover parlaması (Performans dostu vektörel dış aura)
    if (isHover) {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.45)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 14);
        ctx.stroke();
    }

    // Ahşap Çerçeve
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = isHover ? "#facc15" : "#78350f";
    ctx.lineWidth = isHover ? 3 : 2;
    ctx.stroke();

    // Yeşil Çuha
    ctx.fillStyle = "#047857";
    ctx.beginPath();
    ctx.roundRect(x + 12, y + 12, w - 24, h - 24, 6);
    ctx.fill();

    // 6 Adet Delik
    ctx.fillStyle = "#0f172a";
    let pockets = [
        { px: x + 14, py: y + 14 }, { px: x + w / 2, py: y + 12 }, { px: x + w - 14, py: y + 14 },
        { px: x + 14, py: y + h - 14 }, { px: x + w / 2, py: y + h - 12 }, { px: x + w - 14, py: y + h - 14 }
    ];
    pockets.forEach(p => {
        ctx.beginPath(); ctx.arc(p.px, p.py, 5.5, 0, Math.PI * 2); ctx.fill();
    });

    // Beyaz Top
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(x + Math.round(w * 0.26), y + h / 2, 4.5, 0, Math.PI * 2); ctx.fill();

    // Üçgen Dizili Mini Toplar
    let rackX = x + Math.round(w * 0.78), rackY = y + h / 2;
    ctx.fillStyle = "#dc2626"; // Kırmızı
    ctx.beginPath(); ctx.arc(rackX, rackY, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000000"; // 8 numara
    ctx.beginPath(); ctx.arc(rackX + 7, rackY - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f59e0b"; // Sarı
    ctx.beginPath(); ctx.arc(rackX + 7, rackY + 4, 4, 0, Math.PI * 2); ctx.fill();

    // Çapraz Durmuş Istaka
    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x + 18, y + h - 16);
    ctx.lineTo(x + w - 25, y + 18);
    ctx.stroke();

    // Masa Üstü Lamba
    ctx.fillStyle = "rgba(254, 240, 138, 0.15)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2.2, h / 2.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Başlık Rozeti
    ctx.fillStyle = isHover ? "#facc15" : "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎱 8-Ball Bilardo", x + w / 2, y + h + 18);
    if (isHover) {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "10px sans-serif";
        ctx.fillText("(Tıkla ve Katıl / İzle)", x + w / 2, y + h + 30);
    }
    ctx.restore();
}
window.drawBilliardTableObj = drawBilliardTableObj;

// 2. TAVLA MASASI ÇİZİMİ
function drawTavlaTableObj(x, y, w, h, isHover) {
    ctx.save();
    // Masa gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.roundRect(x + 6, y + 8, w, h, 14);
    ctx.fill();

    // Hover parlaması (Performans dostu vektörel dış aura)
    if (isHover) {
        ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 12);
        ctx.stroke();
    }

    // Ahşap Çerçeve (Koyu Maun)
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = isHover ? "#f59e0b" : "#78350f";
    ctx.lineWidth = isHover ? 3 : 2;
    ctx.stroke();

    // Tavla Ahşap İçi (Ceviz rengi zemin)
    ctx.fillStyle = "#b45309";
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 10, w - 20, h - 20, 6);
    ctx.fill();

    // Orta ahşap bölme (Bar)
    ctx.fillStyle = "#78350f";
    ctx.fillRect(x + w / 2 - 4, y + 10, 8, h - 20);
    // Pirinç Menteşeler
    ctx.fillStyle = "#facc15";
    ctx.fillRect(x + w / 2 - 2, y + 18, 4, 8);
    ctx.fillRect(x + w / 2 - 2, y + h - 26, 4, 8);

    // Tavla Haneleri (Üçgenler)
    let leftW = (w - 28) / 2;
    let pointW = leftW / 6;

    // Sol taraf üst haneler
    for (let i = 0; i < 6; i++) {
        let pX = x + 10 + i * pointW;
        ctx.fillStyle = i % 2 === 0 ? "#7f1d1d" : "#fef08a";
        ctx.beginPath();
        ctx.moveTo(pX, y + 10);
        ctx.lineTo(pX + pointW / 2, y + 36);
        ctx.lineTo(pX + pointW, y + 10);
        ctx.closePath();
        ctx.fill();
    }
    // Sağ taraf üst haneler
    for (let i = 0; i < 6; i++) {
        let pX = x + w / 2 + 4 + i * pointW;
        ctx.fillStyle = i % 2 === 0 ? "#fef08a" : "#7f1d1d";
        ctx.beginPath();
        ctx.moveTo(pX, y + 10);
        ctx.lineTo(pX + pointW / 2, y + 36);
        ctx.lineTo(pX + pointW, y + 10);
        ctx.closePath();
        ctx.fill();
    }

    // Minik pullar masada
    ctx.fillStyle = "#f8fafc";
    ctx.beginPath(); ctx.arc(x + 22, y + 18, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 22, y + 27, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(x + w - 22, y + h - 18, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w - 22, y + h - 27, 4.5, 0, Math.PI * 2); ctx.fill();

    // 2 Adet 3D Zar masanın üstünde
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.roundRect(x + w / 2 - 18, y + h / 2 - 7, 13, 13, 2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(x + w / 2 + 5, y + h / 2 - 5, 13, 13, 2); ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(x + w / 2 - 12, y + h / 2 - 1, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#0f172a";
    ctx.beginPath(); ctx.arc(x + w / 2 + 9, y + h / 2 - 1, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w / 2 + 14, y + h / 2 + 3, 1.5, 0, Math.PI * 2); ctx.fill();

    // Sandalyeler (üst ve alt)
    [y - 12, y + h + 4].forEach(sy => {
        ctx.fillStyle = "#78350f";
        ctx.beginPath(); ctx.roundRect(x + w / 2 - 20, sy, 40, 10, 4); ctx.fill();
    });

    // Başlık Rozeti
    ctx.fillStyle = isHover ? "#f59e0b" : "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🎲 Geleneksel Tavla", x + w / 2, y + h + 18);
    if (isHover) {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "10px sans-serif";
        ctx.fillText("(Tıkla ve Katıl / İzle)", x + w / 2, y + h + 30);
    }
    ctx.restore();
}
window.drawTavlaTableObj = drawTavlaTableObj;

// 3. XOX MASASI ÇİZİMİ (Neon 3x3 Cam & Ahşap Bistro Masası)
function drawXoxTableObj(x, y, w, h, isHover) {
    ctx.save();
    let cx = x + w / 2;
    let cy = y + h / 2;

    // 1. Sandalyeler (Kuzey & Güney Sandalyeleri)
    [cy - 38, cy + 38].forEach((sy) => {
        // Sandalye gölgesi
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.beginPath();
        ctx.roundRect(cx - 16, sy + 3, 32, 16, 6);
        ctx.fill();

        // Sandalye Ahşap İskeleti
        ctx.fillStyle = "#3d1a0c";
        ctx.beginPath();
        ctx.roundRect(cx - 17, sy, 34, 18, 6);
        ctx.fill();

        // Sandalye Deri Minderi
        ctx.fillStyle = isHover ? "#b45309" : "#78350f";
        ctx.beginPath();
        ctx.roundRect(cx - 14, sy + 2, 28, 14, 4);
        ctx.fill();
    });

    // 2. Masa Taban Gölgesi
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 6, w / 2 + 2, h / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Hover Parlaması (Cyan & Neon Sarı Dış Işıltı)
    if (isHover) {
        ctx.strokeStyle = "rgba(6, 182, 212, 0.6)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2 + 4, h / 2 + 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 4. Ahşap Masif Bistro Kasası
    ctx.fillStyle = "#271206";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isHover ? "#06b6d4" : "#78350f";
    ctx.lineWidth = isHover ? 2.5 : 2;
    ctx.stroke();

    // 5. Füme Cam Üst Panel
    ctx.fillStyle = "#090d16";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 - 6, h / 2 - 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. XOX 3x3 Izgarası (Merkez Kare)
    let gridW = 34, gridH = 34;
    let gx = cx - gridW / 2;
    let gy = cy - gridH / 2;

    ctx.fillStyle = "#030712";
    ctx.beginPath();
    ctx.roundRect(gx, gy, gridW, gridH, 4);
    ctx.fill();

    // Izgara çizgileri (Neon Cyan)
    ctx.strokeStyle = "rgba(6, 182, 212, 0.7)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    // Dikey çizgiler
    ctx.moveTo(gx + gridW / 3, gy + 2); ctx.lineTo(gx + gridW / 3, gy + gridH - 2);
    ctx.moveTo(gx + (gridW / 3) * 2, gy + 2); ctx.lineTo(gx + (gridW / 3) * 2, gy + gridH - 2);
    // Yatay çizgiler
    ctx.moveTo(gx + 2, gy + gridH / 3); ctx.lineTo(gx + gridW - 2, gy + gridH / 3);
    ctx.moveTo(gx + 2, gy + (gridH / 3) * 2); ctx.lineTo(gx + gridW - 2, gy + (gridH / 3) * 2);
    ctx.stroke();

    // Örnek Oynanmış Taşlar (Sol üstte X, merkezde O, sağ altta X)
    let cellW = gridW / 3;
    let cellH = gridH / 3;

    // X taşı (Neon Mavi)
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(gx + 3, gy + 3); ctx.lineTo(gx + cellW - 3, gy + cellH - 3);
    ctx.moveTo(gx + cellW - 3, gy + 3); ctx.lineTo(gx + 3, gy + cellH - 3);
    ctx.stroke();

    // O taşı (Neon Amber/Sarı)
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(gx + cellW * 1.5, gy + cellH * 1.5, 3.8, 0, Math.PI * 2);
    ctx.stroke();

    // İkinci X taşı (Sağ alt)
    ctx.strokeStyle = "#38bdf8";
    ctx.beginPath();
    ctx.moveTo(gx + cellW * 2 + 3, gy + cellH * 2 + 3); ctx.lineTo(gx + gridW - 3, gy + gridH - 3);
    ctx.moveTo(gx + gridW - 3, gy + cellH * 2 + 3); ctx.lineTo(gx + cellW * 2 + 3, gy + gridH - 3);
    ctx.stroke();

    // 7. Masa Başlığı ve Rozet
    ctx.fillStyle = isHover ? "#06b6d4" : "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❌ XOX Düellosu ⭕", cx, y + h + 15);

    if (isHover) {
        let bounce = Math.sin(Date.now() / 180) * 3;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cx - 70, y - 28 + bounce, 140, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("🎮 XOX Oyna (Tıkla)", cx, y - 13 + bounce);
    }
    ctx.restore();
}
window.drawXoxTableObj = drawXoxTableObj;

// 4. AMİRAL BATTI MASASI ÇİZİMİ (Taktiksel Askeri Radar & Deniz Haritası Masası)
function drawAmiralBattiTableObj(x, y, w, h, isHover) {
    ctx.save();
    let cx = x + w / 2;
    let cy = y + h / 2;

    // 1. Sandalyeler (Kuzey & Güney Tabureleri)
    [cy - 38, cy + 38].forEach((sy) => {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        ctx.beginPath();
        ctx.roundRect(cx - 17, sy + 3, 34, 16, 5);
        ctx.fill();

        ctx.fillStyle = "#1e293b";
        ctx.beginPath();
        ctx.roundRect(cx - 18, sy, 36, 18, 5);
        ctx.fill();

        ctx.fillStyle = isHover ? "#047857" : "#065f46";
        ctx.beginPath();
        ctx.roundRect(cx - 15, sy + 2, 30, 14, 4);
        ctx.fill();
    });

    // 2. Masa Taban Gölgesi
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 6, w / 2 + 3, h / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Hover Parlaması (Askeri Zümrüt Yeşili)
    if (isHover) {
        ctx.strokeStyle = "rgba(34, 197, 94, 0.6)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2 + 4, h / 2 + 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 4. Askeri Metal Çerçeveli Masa Gövdesi
    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isHover ? "#22c55e" : "#334155";
    ctx.lineWidth = isHover ? 2.5 : 2;
    ctx.stroke();

    // 5. Radar Ekranı (Derin Deniz Yeşili)
    ctx.fillStyle = "#022c22";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2 - 6, h / 2 - 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Eşmerkezli Radar Halkaları
    ctx.strokeStyle = "rgba(34, 197, 94, 0.35)";
    ctx.lineWidth = 1;
    [10, 20, 28].forEach(r => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
    });

    // Radar Koordinat Kesişimi
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy); ctx.lineTo(cx + 28, cy);
    ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
    ctx.stroke();

    // 7. Dönen Radar İğnesi (Sweeper Beam)
    let angle = (Date.now() / 450) % (Math.PI * 2);
    ctx.strokeStyle = "rgba(74, 222, 128, 0.85)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * 26, cy + Math.sin(angle) * 26);
    ctx.stroke();

    // Yanıp sönen radar hedef noktası (Ping Blip)
    let blipAlpha = 0.5 + Math.sin(Date.now() / 200) * 0.4;
    ctx.fillStyle = `rgba(239, 68, 68, ${blipAlpha})`;
    ctx.beginPath();
    ctx.arc(cx + 6, cy - 5, 2, 0, Math.PI * 2);
    ctx.fill();

    // 8. Masa Başlığı ve Rozet
    ctx.fillStyle = isHover ? "#22c55e" : "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚓ Amiral Battı 🎯", cx, y + h + 15);

    if (isHover) {
        let bounce = Math.sin(Date.now() / 180) * 3;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cx - 75, y - 28 + bounce, 150, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#4ade80";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("⚓ Amiral Battı Oyna (Tıkla)", cx, y - 13 + bounce);
    }
    ctx.restore();
}
window.drawAmiralBattiTableObj = drawAmiralBattiTableObj;

// 5. SATRANÇ MASASI ÇİZİMİ (Klasik Ahşap Masa, Kakma 8x8 Tahta & Çift LCD Satranç Saati)
function drawChessTableObj(x, y, w, h, isHover) {
    ctx.save();
    let cx = x + w / 2;
    let cy = y + h / 2;

    // 1. Sandalyeler (Kuzey & Güney Sandalyeleri)
    [cy - 38, cy + 38].forEach((sy) => {
        ctx.fillStyle = "rgba(0,0,0,0.32)";
        ctx.beginPath();
        ctx.roundRect(cx - 16, sy + 3, 32, 16, 5);
        ctx.fill();

        ctx.fillStyle = "#2c1810";
        ctx.beginPath();
        ctx.roundRect(cx - 17, sy, 34, 18, 5);
        ctx.fill();

        ctx.fillStyle = isHover ? "#854d0e" : "#451a03";
        ctx.beginPath();
        ctx.roundRect(cx - 14, sy + 2, 28, 14, 4);
        ctx.fill();
    });

    // 2. Masa Taban Gölgesi
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 6, w / 2 + 2, h / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Hover Parlaması (Altın Sarısı Çerçeve Parıltısı)
    if (isHover) {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.65)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, w / 2 + 4, h / 2 + 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 4. Koyu Maun Ağacı Masa Gövdesi
    ctx.fillStyle = "#3b1e10";
    ctx.beginPath();
    ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isHover ? "#facc15" : "#78350f";
    ctx.lineWidth = isHover ? 2.8 : 2;
    ctx.stroke();

    // 5. Ahşap Satranç Tahtası Kenarlığı (Ceviz Çerçeve)
    let boardSize = 36;
    let bx = cx - boardSize / 2 - 4;
    let by = cy - boardSize / 2;
    ctx.fillStyle = "#1c0d06";
    ctx.beginPath();
    ctx.roundRect(bx - 3, by - 3, boardSize + 6, boardSize + 6, 3);
    ctx.fill();

    // 6. Kakma Satranç Tahtası (8x8 Kareler)
    let sq = boardSize / 8;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            ctx.fillStyle = (r + c) % 2 === 0 ? "#fef08a" : "#78350f";
            ctx.fillRect(bx + c * sq, by + r * sq, sq, sq);
        }
    }

    // Minik Şah/Vezir Figürleri (Merkezde duran temsili 2 taş)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(bx + 3.5 * sq, by + 6.5 * sq, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#0f172a";
    ctx.beginPath();
    ctx.arc(bx + 4.5 * sq, by + 1.5 * sq, 2, 0, Math.PI * 2);
    ctx.fill();

    // 7. Dijital İkili Satranç Saati (Masanın Sağında)
    let clockX = bx + boardSize + 5;
    let clockY = cy - 8;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(clockX, clockY, 12, 16, 2);
    ctx.fill();

    // İki buton (Üst basma tuşları)
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(clockX + 1, clockY - 2, 4, 2);
    ctx.fillRect(clockX + 7, clockY - 1, 4, 2);

    // Çift mini LCD ekran
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(clockX + 2, clockY + 2, 8, 5);
    ctx.fillRect(clockX + 2, clockY + 9, 8, 5);

    // 8. Masa Başlığı ve Rozet
    ctx.fillStyle = isHover ? "#facc15" : "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("♟️ Klasik Satranç ♚", cx, y + h + 15);

    if (isHover) {
        let bounce = Math.sin(Date.now() / 180) * 3;
        ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
        ctx.strokeStyle = "#facc15";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cx - 70, y - 28 + bounce, 140, 22, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fef08a";
        ctx.font = "bold 10px sans-serif";
        ctx.fillText("♟️ Satranç Oyna (Tıkla)", cx, y - 13 + bounce);
    }
    ctx.restore();
}
window.drawChessTableObj = drawChessTableObj;

// 6. BATAK MASASI ÇİZİMİ (Yuvarlak 4 Kişilik İskambil Masası)
function drawBatakTableObj(cx, cy, radius, chairCount, title, isHover) {
    ctx.save();
    // Masa Taban Gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(cx + 4, cy + 6, radius, radius * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hover parlaması (Performans dostu vektörel dış aura)
    if (isHover) {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.5)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.ellipse(cx, cy, radius + 3, radius * 0.78 + 3, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Ahşap Gövde
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isHover ? "#facc15" : "#78350f";
    ctx.lineWidth = isHover ? 3 : 2;
    ctx.stroke();

    // Bordo / Kırmızı Kadife Çuha
    ctx.fillStyle = "#7f1d1d";
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius - 8, (radius - 8) * 0.76, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Masadaki İskambil Kartları (Ortada açılmış 4 minik kart)
    let cardAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    cardAngles.forEach((ang) => {
        let cX = cx + Math.cos(ang) * 9;
        let cY = cy + Math.sin(ang) * 7;
        ctx.save();
        ctx.translate(cX, cY);
        ctx.rotate(ang + 0.3);
        ctx.fillStyle = "#ffffff";
        ctx.roundRect(-4, -6, 8, 12, 1.5);
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // Mini Maça / Kupa deseni
        ctx.fillStyle = (ang === 0 || ang === Math.PI) ? "#000000" : "#dc2626";
        ctx.fillRect(-1.5, -2, 3, 4);
        ctx.restore();
    });

    // Sandalyeler (Oval yerleşimli 4 adet deri sandalye)
    if (chairCount > 0) {
        let step = (Math.PI * 2) / chairCount;
        for (let i = 0; i < chairCount; i++) {
            let a = step * i + Math.PI / 4;
            let chX = cx + Math.cos(a) * (radius + 12);
            let chY = cy + Math.sin(a) * (radius * 0.78 + 9);
            ctx.fillStyle = "#3d1a0c";
            ctx.beginPath();
            ctx.ellipse(chX, chY, 10, 8, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isHover ? "#b45309" : "#78350f";
            ctx.beginPath();
            ctx.ellipse(chX, chY, 8, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Masa Başlığı
    ctx.fillStyle = isHover ? "#facc15" : "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`🃏 ${title}`, cx, cy + radius + 18);
    if (isHover) {
        ctx.fillStyle = "#38bdf8";
        ctx.font = "10px sans-serif";
        ctx.fillText("(Tıkla ve Katıl / İzle)", cx, cy + radius + 30);
    }
    ctx.restore();
}
window.drawBatakTableObj = drawBatakTableObj;

// 7. 101 OKEY MASASI ÇİZİMİ
function drawOkey101TableObj(x, y, w, h, isHover) {
    ctx.save();
    // Masa gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 6, w, h, 14);
    ctx.fill();

    // Hover parlaması (Performans dostu vektörel dış aura)
    if (isHover) {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.45)";
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.roundRect(x - 2, y - 2, w + 4, h + 4, 14);
        ctx.stroke();
    }

    // Ahşap Çerçeve & Gövde
    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = isHover ? "#38bdf8" : "#92400e";
    ctx.lineWidth = isHover ? 3 : 2;
    ctx.stroke();

    // Yeşil Çuha
    ctx.fillStyle = "#064e3b";
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 10, w - 20, h - 20, 8);
    ctx.fill();

    // 4 Adet Istaka (Üst, Alt, Sol, Sağ)
    ctx.fillStyle = "#b45309";
    ctx.fillRect(x + 22, y + 13, w - 44, 9); // Üst
    ctx.fillRect(x + 22, y + h - 22, w - 44, 9); // Alt
    ctx.fillRect(x + 13, y + 24, 9, h - 48); // Sol
    ctx.fillRect(x + w - 22, y + 24, 9, h - 48); // Sağ

    // Istakalar üzerindeki minik taşlar
    ctx.fillStyle = "#fef08a";
    for (let i = 0; i < 5; i++) {
        ctx.fillRect(x + 26 + i * 15, y + 14, 9, 7);
        ctx.fillRect(x + 26 + i * 15, y + h - 21, 9, 7);
    }

    // Ortadaki kapalı taş destesi
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(x + w / 2 - 13, y + h / 2 - 8, 12, 16);
    ctx.fillStyle = "#dc2626";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🀄", x + w / 2 - 7, y + h / 2 + 4);

    // Açık gösterge taşı
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + w / 2 + 2, y + h / 2 - 8, 12, 16);
    ctx.strokeRect(x + w / 2 + 2, y + h / 2 - 8, 12, 16);
    ctx.fillStyle = "#2563eb";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText("7", x + w / 2 + 8, y + h / 2 + 4);

    // Masa Başlığı
    ctx.fillStyle = isHover ? "#38bdf8" : "#ffffff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("🀄 101 Okey (4 Kişi)", x + w / 2, y + h + 18);
    if (isHover) {
        ctx.fillStyle = "#facc15";
        ctx.font = "10px sans-serif";
        ctx.fillText("(Tıkla ve Katıl / İzle)", x + w / 2, y + h + 30);
    }
    ctx.restore();
}
window.drawOkey101TableObj = drawOkey101TableObj;

// 8. CANLI BLACKJACK 21 MASASI ÇİZİMİ
function drawBlackjackTableObj(x, y, w, h, isHover) {
    ctx.save();
    // Masa taban gölgesi
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(x + w / 2 + 4, y + h / 2 + 6, w / 2, h / 2.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hover parlaması (Altın Işıma)
    if (isHover) {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.7)";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y + h / 2, w / 2 + 4, h / 2.3 + 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Ahşap / Deri Kenarlık (Armrest)
    ctx.fillStyle = isHover ? "#78350f" : "#451a03";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isHover ? "#facc15" : "#b45309";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Yeşil Çuha Masası (Casino Felt)
    ctx.fillStyle = "#047857";
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2 - 12, h / 2.4 - 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Masa Damgası (Felt Text)
    ctx.fillStyle = "rgba(254, 240, 138, 0.85)";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BLACKJACK 3:2", x + w / 2, y + h / 2 - 10);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "8px sans-serif";
    ctx.fillText("Kasa 17'de Durur", x + w / 2, y + h / 2 + 2);

    // Kasa / Krupiye Çip Tepsisi (Chip Rack)
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.roundRect(x + w / 2 - 20, y + 14, 40, 10, 3);
    ctx.fill();
    const chipColors = ['#ef4444', '#3b82f6', '#f59e0b', '#10b981'];
    chipColors.forEach((cc, ci) => {
        ctx.fillStyle = cc;
        ctx.beginPath();
        ctx.arc(x + w / 2 - 12 + ci * 8, y + 19, 3.5, 0, Math.PI * 2);
        ctx.fill();
    });

    // 3 Oyuncu Koltuğu / Bahis Halkaları
    const seatOffsets = [-36, 0, 36];
    seatOffsets.forEach(so => {
        ctx.strokeStyle = "rgba(250, 204, 21, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x + w / 2 + so, y + h / 2 + 24, 9, 0, Math.PI * 2);
        ctx.stroke();

        // Koltuk Taburesi
        ctx.fillStyle = "#78350f";
        ctx.beginPath();
        ctx.arc(x + w / 2 + so, y + h / 2 + 48, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#d97706";
        ctx.beginPath();
        ctx.arc(x + w / 2 + so, y + h / 2 + 47, 6, 0, Math.PI * 2);
        ctx.fill();
    });

    // Hover Tooltip
    if (isHover) {
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("🃏 Canlı Blackjack 21 Masası - Tıkla ve Masaya Otur", x + w / 2, y - 6);
    }
    ctx.restore();
}
window.drawBlackjackTableObj = drawBlackjackTableObj;

