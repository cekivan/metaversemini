// scratch/test_adventure_map_render.js
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');

// 30 Günün Koordinatları (Genişlik: 860, Yükseklik: 480)
const MAP_NODES = [
    // 1. Satır: Başlangıç Kıyısı (Soldan Sağa, Gün 1 - 7)
    { day: 1,  x: 75,  y: 415, money: 500,   diamonds: 1 },
    { day: 2,  x: 165, y: 415, money: 1000,  diamonds: 2 },
    { day: 3,  x: 255, y: 415, money: 1500,  diamonds: 3 },
    { day: 4,  x: 345, y: 415, money: 2000,  diamonds: 4 },
    { day: 5,  x: 435, y: 415, money: 2500,  diamonds: 5 },
    { day: 6,  x: 525, y: 415, money: 3000,  diamonds: 6 },
    { day: 7,  x: 625, y: 410, money: 3500,  diamonds: 7,  isMilestone: true, milestoneType: 'star', milestoneTitle: '1. Hafta Sandığı' },

    // 2. Satır: Zümrüt Patika (Sağdan Sola, Gün 8 - 14)
    { day: 8,  x: 700, y: 325, money: 4000,  diamonds: 8 },
    { day: 9,  x: 605, y: 325, money: 4500,  diamonds: 9 },
    { day: 10, x: 510, y: 325, money: 5000,  diamonds: 10 },
    { day: 11, x: 415, y: 325, money: 5500,  diamonds: 11 },
    { day: 12, x: 320, y: 325, money: 6000,  diamonds: 12 },
    { day: 13, x: 225, y: 325, money: 6500,  diamonds: 13 },
    { day: 14, x: 125, y: 320, money: 7000,  diamonds: 14, isMilestone: true, milestoneType: 'trophy', milestoneTitle: '2. Hafta Sandığı' },

    // 3. Satır: Safir Sırtı (Soldan Sağa, Gün 15 - 21)
    { day: 15, x: 85,  y: 235, money: 7500,  diamonds: 15 },
    { day: 16, x: 180, y: 235, money: 8000,  diamonds: 16 },
    { day: 17, x: 275, y: 235, money: 8500,  diamonds: 17 },
    { day: 18, x: 370, y: 235, money: 9000,  diamonds: 18 },
    { day: 19, x: 465, y: 235, money: 9500,  diamonds: 19 },
    { day: 20, x: 560, y: 235, money: 10000, diamonds: 20 },
    { day: 21, x: 660, y: 230, money: 10500, diamonds: 21, isMilestone: true, milestoneType: 'gem', milestoneTitle: '3. Hafta Sandığı' },

    // 4. Satır: Kristal Geçidi (Sağdan Sola, Gün 22 - 27)
    { day: 22, x: 690, y: 140, money: 11000, diamonds: 22 },
    { day: 23, x: 595, y: 140, money: 11500, diamonds: 23 },
    { day: 24, x: 500, y: 140, money: 12000, diamonds: 24 },
    { day: 25, x: 405, y: 140, money: 12500, diamonds: 25 },
    { day: 26, x: 310, y: 140, money: 13000, diamonds: 26 },
    { day: 27, x: 215, y: 135, money: 13500, diamonds: 27 },

    // 5. Satır: Efsane Zirvesi (Gün 28 - 30)
    { day: 28, x: 190, y: 55,  money: 14000, diamonds: 28 },
    { day: 29, x: 330, y: 50,  money: 14500, diamonds: 29 },
    { day: 30, x: 520, y: 48,  money: 15000, diamonds: 30, isMilestone: true, milestoneType: 'crown', milestoneTitle: 'Aylık Efsane Zirvesi' }
];

function generateCurvedSvgPath() {
    let d = `M ${MAP_NODES[0].x} ${MAP_NODES[0].y}`;
    for (let i = 0; i < MAP_NODES.length - 1; i++) {
        const p1 = MAP_NODES[i];
        const p2 = MAP_NODES[i + 1];
        
        // Eğer satır dönüşüyse (örneğin 7->8, 14->15, 21->22, 27->28)
        if (p1.day === 7 && p2.day === 8) {
            d += ` C 720 410, 750 360, ${p2.x} ${p2.y}`;
        } else if (p1.day === 14 && p2.day === 15) {
            d += ` C 50 320, 20 270, ${p2.x} ${p2.y}`;
        } else if (p1.day === 21 && p2.day === 22) {
            d += ` C 740 230, 760 170, ${p2.x} ${p2.y}`;
        } else if (p1.day === 27 && p2.day === 28) {
            d += ` C 120 135, 110 75, ${p2.x} ${p2.y}`;
        } else {
            // Düz segment
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            d += ` Q ${midX} ${midY}, ${p2.x} ${p2.y}`;
        }
    }
    return d;
}

console.log('Path length calculation test...');
const svgPath = generateCurvedSvgPath();
console.log('SVG Path sample:', svgPath.substring(0, 100) + '...');

