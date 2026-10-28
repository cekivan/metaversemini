// scratch/test_smoking_arm_kinematics.js
function testKinematics() {
    const facings = ['down', 'down-right', 'right'];
    
    facings.forEach(facing => {
        let shoulderX, shoulderY, mouthX, mouthY;
        const headY = -17.0;
        
        if (facing === 'down') {
            shoulderX = -9.5;
            shoulderY = -6.0;
            mouthX = 0.0;
            mouthY = headY + 2.2; // -14.8
        } else if (facing === 'down-right') {
            shoulderX = -7.2;
            shoulderY = -5.0;
            mouthX = 1.8;
            mouthY = headY + 2.5; // -14.5
        } else {
            shoulderX = 1.6;
            shoulderY = -5.8;
            mouthX = 5.6;
            mouthY = headY + 2.4; // -14.6
        }
        
        // Upper arm length = 6.0px (sleeve portion)
        // Forearm length = 6.0px (skin forearm to wrist)
        // Hand = 2.0px
        // In lifted pose:
        // Elbow bends naturally:
        let elbowX, elbowY, wristX, wristY;
        
        if (facing === 'down') {
            // Elbow stays on the side of the ribcage
            elbowX = shoulderX + 1.8; // -7.7
            elbowY = shoulderY + 5.5; // -0.5
            // Forearm extends up and inward to mouth
            wristX = mouthX - 3.2; // -3.2 (hand rests just beside/under lips)
            wristY = mouthY + 1.8; // -13.0
        } else if (facing === 'down-right') {
            elbowX = shoulderX + 1.5; // -5.7
            elbowY = shoulderY + 5.2; // 0.2
            wristX = mouthX - 2.8; // -1.0
            wristY = mouthY + 1.8; // -12.7
        } else {
            // Profile
            elbowX = shoulderX + 2.2; // 3.8
            elbowY = shoulderY + 5.0; // -0.8
            wristX = mouthX + 1.5; // 7.1
            wristY = mouthY + 2.0; // -12.6
        }
        
        const upperArmLen = Math.hypot(elbowX - shoulderX, elbowY - shoulderY);
        const forearmLen = Math.hypot(wristX - elbowX, wristY - elbowY);
        const wristToMouth = Math.hypot(mouthX - wristX, mouthY - wristY);
        
        console.log(`Facing: ${facing}`);
        console.log(`  Shoulder: (${shoulderX}, ${shoulderY})`);
        console.log(`  Elbow:    (${elbowX.toFixed(1)}, ${elbowY.toFixed(1)}) | UpperArmLen: ${upperArmLen.toFixed(1)}px`);
        console.log(`  Wrist:    (${wristX.toFixed(1)}, ${wristY.toFixed(1)}) | ForearmLen:  ${forearmLen.toFixed(1)}px`);
        console.log(`  Mouth:    (${mouthX.toFixed(1)}, ${mouthY.toFixed(1)}) | WristToMouth: ${wristToMouth.toFixed(1)}px`);
    });
}
testKinematics();
