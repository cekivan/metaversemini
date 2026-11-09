// public/js/renderers/animalCostumeRenderer.js - 2.5D İzometrik 8 Yönlü Hayvan Kostümü Orkestratörü
// Bu dosya modüler mimariye ayrılmıştır. Her hayvan kostümü "public/js/renderers/costumes/" altında bağımsız birer modüldür.

const AnimalCostumeRenderer = (function () {
    const ANIMAL_COSTUME_IDS = [
        'costume_elephant',
        'costume_cockroach',
        'costume_bird',
        'costume_spider',
        'costume_lion',
        'costume_panda',
        'costume_frog',
        'costume_trex',
        'costume_anaconda'
    ];

    const registry = (typeof window !== 'undefined' && window.__animalCostumeModules) || {};

    function register(costumeId, definition) {
        if (!costumeId || !definition) return;
        const clean = getCleanCostumeId(costumeId);
        registry[clean] = definition;
    }

    function isCostume(costumeId) {
        if (!costumeId) return false;
        let clean = getCleanCostumeId(costumeId);
        return !!registry[clean] || ANIMAL_COSTUME_IDS.includes(clean);
    }

    function getCleanCostumeId(costumeId) {
        if (!costumeId) return null;
        return String(costumeId).replace('costumes_', '').replace('outfits_', '');
    }

    // İsim Etiketi Dikey Ofseti
    function getNameTagOffset(costumeId, p, isMoving) {
        const clean = getCleanCostumeId(costumeId);
        if (!clean) return 0;
        const mod = registry[clean];
        if (mod && typeof mod.getNameTagOffset === 'function') {
            return mod.getNameTagOffset(p, isMoving);
        }
        return 0;
    }

    // =========================================================================
    // ANA RENDER VE DISPATCH MOTORU (draw)
    // =========================================================================
    function draw(ctx, pX, pY, p, facing, isSitting, isMoving, walkCycle, isPreview) {
        let costumeId = (p && p.costume) || (p && p.outfit && p.outfit.startsWith('costume_') ? p.outfit : null);
        const clean = getCleanCostumeId(costumeId);
        if (!clean) return;

        const mod = registry[clean];
        if (!mod || typeof mod.draw !== 'function') return;

        ctx.save();
        ctx.translate(pX, pY);
        mod.draw(ctx, p, facing, isSitting, isMoving, walkCycle, isPreview);
        ctx.restore();
    }

    return {
        register,
        registry,
        isCostume,
        getCleanCostumeId,
        draw,
        getNameTagOffset,
        ANIMAL_COSTUME_IDS
    };
})();

if (typeof window !== 'undefined') {
    window.AnimalCostumeRenderer = AnimalCostumeRenderer;
}

if (typeof module !== 'undefined' && module.exports) {
    // Node.js ortamında alt modülleri otomatik bağla
    try {
        const costumeFiles = [
            'elephantCostume', 'cockroachCostume', 'birdCostume',
            'spiderCostume', 'lionCostume', 'pandaCostume',
            'frogCostume', 'trexCostume', 'anacondaCostume'
        ];
        costumeFiles.forEach(name => {
            const mod = require(`./costumes/${name}`);
            if (mod && mod.id) {
                AnimalCostumeRenderer.register(mod.id, mod);
            }
        });
    } catch (_) {}
    module.exports = AnimalCostumeRenderer;
}
