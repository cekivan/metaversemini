const ZombieCostumeRenderer = (function () {
    const ZOMBIE_COSTUME_IDS = [
        'costume_zombie_1',
        'costume_zombie_2',
        'costume_zombie_3'
    ];

    const SPRITESHEET_SRC = '/assets/zombie-costumes/zombie_costumes_spritesheet.png';
    const FRAME_WIDTH = 84;
    const FRAME_HEIGHT = 124;

    const VARIANT_ROW_MAP = {
        'zombie1': 0,
        'zombie2': 1,
        'zombie3': 2
    };

    const ALL_FRAME_NAMES = [
        'idle1', 'idle2', 'idle3', 'idle4',
        'walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6',
        'run1', 'run2', 'run3', 'run4', 'run5', 'run6', 'run7', 'run8', 'run9', 'run10',
        'attack1', 'attack2', 'attack3', 'attack4', 'attack5', 'attack6',
        'hurt1', 'hurt2', 'hurt3', 'hurt4', 'hurt5'
    ];

    const FRAME_COL_MAP = {};
    ALL_FRAME_NAMES.forEach((name, idx) => {
        FRAME_COL_MAP[name] = idx;
    });

    const idleFrames = ['idle1', 'idle2', 'idle3', 'idle4'];
    const walkFrames = ['walk1', 'walk2', 'walk3', 'walk4', 'walk5', 'walk6'];
    const animationFrames = {
        run: Array.from({ length: 10 }, (_, index) => `run${index + 1}`),
        attack: Array.from({ length: 6 }, (_, index) => `attack${index + 1}`),
        hurt: Array.from({ length: 5 }, (_, index) => `hurt${index + 1}`)
    };

    let spritesheetImg = null;
    let spritesheetLoaded = false;

    function getSpritesheet() {
        if (typeof Image === 'undefined') return null;
        if (!spritesheetImg) {
            spritesheetImg = new Image();
            spritesheetImg.onload = () => {
                spritesheetLoaded = true;
            };
            spritesheetImg.onerror = () => {
                console.error(`Zombie costumes spritesheet failed to load: ${SPRITESHEET_SRC}`);
            };
            spritesheetImg.src = SPRITESHEET_SRC;
        }
        return spritesheetLoaded ? spritesheetImg : null;
    }

    // Erken ön yükleme başlat
    if (typeof Image !== 'undefined') {
        getSpritesheet();
    }

    function getCleanCostumeId(costumeId) {
        if (!costumeId) return null;
        return String(costumeId).replace(/^(costumes_|outfits_)/, '');
    }

    function isCostume(costumeId) {
        return ZOMBIE_COSTUME_IDS.includes(getCleanCostumeId(costumeId));
    }

    function getAnimation(p, isMoving, now, isPreview) {
        if (isPreview) return { frames: idleFrames, frameIndex: Math.floor(now / 480) % idleFrames.length };

        const action = p.zombieAnimation;
        if (action && p.zombieAnimationUntil > now && animationFrames[action]) {
            const startedAt = p.zombieAnimationStartedAt || now;
            const duration = Math.max(1, p.zombieAnimationUntil - startedAt);
            const progress = Math.min(0.999, Math.max(0, (now - startedAt) / duration));
            return { frames: animationFrames[action], frameIndex: Math.floor(progress * animationFrames[action].length) };
        }

        if (isMoving && p.isSprinting) return { frames: animationFrames.run, frameIndex: Math.floor(Math.abs(p.walkCycle || 0) * 1.25) % animationFrames.run.length };
        if (isMoving) return { frames: walkFrames, frameIndex: Math.floor(Math.abs(p.walkCycle || 0) / 1.5) % walkFrames.length };
        return { frames: idleFrames, frameIndex: Math.floor(now / 480) % idleFrames.length };
    }

    function draw(ctx, pX, pY, p, facing, isSitting, isMoving, walkCycle, isPreview) {
        const costumeId = (p && p.costume) || (p && p.outfit && p.outfit.startsWith('costume_') ? p.outfit : null);
        const clean = getCleanCostumeId(costumeId);
        if (!ZOMBIE_COSTUME_IDS.includes(clean)) return;

        const variant = clean.replace('costume_zombie_', 'zombie');
        const rowIndex = VARIANT_ROW_MAP[variant] !== undefined ? VARIANT_ROW_MAP[variant] : 0;

        const now = Date.now();
        const animation = getAnimation(p, isMoving && !isSitting, now, isPreview);
        const frameName = animation.frames[animation.frameIndex] || idleFrames[0];
        const colIndex = FRAME_COL_MAP[frameName] !== undefined ? FRAME_COL_MAP[frameName] : 0;

        const sheet = getSpritesheet();
        if (!sheet) return;

        ctx.save();
        ctx.translate(pX, pY);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 1, 13, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const isLeft = facing === 'left' || facing === 'up-left' || facing === 'down-left';
        if (isLeft) ctx.scale(-1, 1);
        ctx.imageSmoothingEnabled = true;

        const srcX = colIndex * FRAME_WIDTH;
        const srcY = rowIndex * FRAME_HEIGHT;
        ctx.drawImage(sheet, srcX, srcY, FRAME_WIDTH, FRAME_HEIGHT, -21, -62, 42, 62);
        ctx.restore();
    }

    return {
        isCostume,
        getCleanCostumeId,
        getNameTagOffset: () => -14,
        draw,
        ZOMBIE_COSTUME_IDS,
        animationFrames
    };
})();

if (typeof window !== 'undefined') {
    window.ZombieCostumeRenderer = ZombieCostumeRenderer;
}
if (typeof module !== 'undefined') {
    module.exports = ZombieCostumeRenderer;
}
