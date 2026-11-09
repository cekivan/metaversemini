const fs = require('fs');

let original = fs.readFileSync('scratch/original_renderBotanicShop.js', 'utf8');

// Apply the user's prior request (step 39326: removing [E] proximity prompts)
const target = `        // D) OYUNCU YAKINLIK VE İNTERAKTİF İPUÇLARI
        if (myAvatar) {
            // Defne'ye Yakınlık (Mesafe < 75px)
            let distDefne = Math.hypot(myAvatar.x - 310, myAvatar.y - 235);
            if (distDefne < 75) {
                drawInteractionPill(ctx, 310, 135, "🌱 [E] Botanikçi Defne (Tohum & Su Al)", "#22c55e");
            }

            // Rasim'e Yakınlık (Mesafe < 75px)
            let distRasim = Math.hypot(myAvatar.x - 750, myAvatar.y - 235);
            if (distRasim < 75) {
                drawInteractionPill(ctx, 750, 135, "💐 [E] Çiçek Tüccarı Rasim (Borsa & Satış)", "#eab308");
            }
        }
    }`;

const replacement = `        // D) OYUNCU YAKINLIK VE İNTERAKTİF İPUÇLARI (Kullanıcı talebiyle [E] yazıları kaldırıldı, tıklama veya [E] tuşu çalışmaya devam eder)
    }`;

if (original.includes(target)) {
    original = original.replace(target, replacement);
    console.log('Successfully replaced proximity prompt!');
} else {
    console.log('Target not found in original, checking whitespace...');
}

fs.writeFileSync('scratch/restored_renderBotanicShop.js', original, 'utf8');
console.log('Wrote scratch/restored_renderBotanicShop.js, length:', original.length);

