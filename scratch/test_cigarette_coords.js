// scratch/test_cigarette_coords.js
function testCoords() {
    const facings = ['right', 'down-right', 'down'];
    
    facings.forEach(facing => {
        let shoulderX, shoulderY, mouthX, mouthY;
        const headY = -17.0;
        
        if (facing === 'right') {
            shoulderX = 1.6;
            shoulderY = -5.8;
            mouthX = 5.6;
            mouthY = headY + 2.4;
        } else if (facing === 'down-right') {
            shoulderX = -7.2;
            shoulderY = -5.0;
            mouthX = 1.8;
            mouthY = headY + 2.5;
        } else {
            shoulderX = -9.5;
            shoulderY = -6.0;
            mouthX = 0.0;
            mouthY = headY + 2.2;
        }
        
        const dx = mouthX - shoulderX;
        const dy = mouthY - shoulderY;
        const dist = Math.hypot(dx, dy);
        const directAngle = Math.atan2(-dx, dy);
        
        console.log(`Facing: ${facing}`);
        console.log(`  Shoulder: (${shoulderX}, ${shoulderY}) -> Mouth: (${mouthX}, ${mouthY})`);
        console.log(`  Distance: ${dist.toFixed(2)}px | directAngle: ${directAngle.toFixed(3)} rad (${(directAngle * 180 / Math.PI).toFixed(1)} deg)`);
    });
}
testCoords();
