// scratch/test_smoking_arm_draw.js
const { createCanvas } = (() => {
    try {
        return require('canvas');
    } catch (e) {
        // Mock if canvas package not installed
        return {
            createCanvas: () => {
                const noop = () => {};
                return {
                    getContext: () => ({
                        save: noop, restore: noop, translate: noop, rotate: noop,
                        scale: noop, beginPath: noop, closePath: noop, moveTo: noop,
                        lineTo: noop, quadraticCurveTo: noop, bezierCurveTo: noop,
                        arc: noop, ellipse: noop, rect: noop, fillRect: noop,
                        roundRect: noop, fill: noop, stroke: noop,
                        fillStyle: '', strokeStyle: '', lineWidth: 1
                    })
                };
            }
        };
    }
})();

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function testArticulatedPositions() {
    const facings = ['down', 'down-right', 'right'];
    
    facings.forEach(facing => {
        const headY = -17.0;
        let mouthX, mouthY, shoulderX, shoulderY;
        let idleElbowX, idleElbowY, idleWristX, idleWristY;
        let liftedElbowX, liftedElbowY, liftedWristX, liftedWristY;
        
        if (facing === 'down') {
            mouthX = 0; mouthY = headY + 2.2;
            shoulderX = -9.5; shoulderY = -6.0;
            // Idle
            idleElbowX = -8.2; idleElbowY = 0.0;
            idleWristX = -7.5; idleWristY = 6.2;
            // Lifted to mouth
            liftedElbowX = -8.5; liftedElbowY = -0.6;
            liftedWristX = -3.4; liftedWristY = mouthY + 1.6;
        } else if (facing === 'down-right') {
            mouthX = 1.8; mouthY = headY + 2.5;
            shoulderX = -7.2; shoulderY = -5.0;
            // Idle
            idleElbowX = -5.8; idleElbowY = 0.8;
            idleWristX = -4.5; idleWristY = 6.4;
            // Lifted
            liftedElbowX = -6.2; liftedElbowY = 0.2;
            liftedWristX = -1.2; liftedWristY = mouthY + 1.8;
        } else {
            // Profile
            mouthX = 5.6; mouthY = headY + 2.4;
            shoulderX = 1.6; shoulderY = -5.8;
            // Idle
            idleElbowX = 3.2; idleElbowY = -0.4;
            idleWristX = 4.8; idleWristY = 5.6;
            // Lifted
            liftedElbowX = 3.8; liftedElbowY = -0.6;
            liftedWristX = 5.2; liftedWristY = mouthY + 2.0;
        }
        
        // Test at liftProgress = 0, 0.5, 1.0
        [0.0, 0.5, 1.0].forEach(p => {
            const eX = lerp(idleElbowX, liftedElbowX, p);
            const eY = lerp(idleElbowY, liftedElbowY, p);
            const wX = lerp(idleWristX, liftedWristX, p);
            const wY = lerp(idleWristY, liftedWristY, p);
            
            const upperArm = Math.hypot(eX - shoulderX, eY - shoulderY);
            const forearm = Math.hypot(wX - eX, wY - eY);
            const toMouth = Math.hypot(mouthX - wX, mouthY - wY);
            
            console.log(`[${facing}] lift=${p.toFixed(1)} -> Elbow: (${eX.toFixed(1)}, ${eY.toFixed(1)}) | Wrist: (${wX.toFixed(1)}, ${wY.toFixed(1)}) | toMouth: ${toMouth.toFixed(1)}px`);
        });
    });
}

testArticulatedPositions();
