const fs = require('fs');

// Path definition for drawK2WavyShoulder in profile (dirSign = 1)
function getWavyShoulderProfilePath(dirSign) {
    // Top crown arc from nape to forehead
    // Angle in Canvas: 0 is right.
    // When dirSign = 1 (facing right):
    // Back of neck is x < 0. Forehead is x > 0.
    // Crown arc from x = -dirSign * 6.5, y = 7.5 (nape) around back of head, over crown, to forehead x = dirSign * 6.8, y = -7.0
    const path = [];
    return path;
}

console.log('Testing hair profile coordinates...');
