// Scratch test for drawCargoLegAndShoe & drawSittingCargoLegs
const fs = require('fs');

console.log('Testing leg and shoe syntax in isolation...');
// Dummy canvas 2D context mock
function createMockCtx() {
    return new Proxy({}, {
        get: (target, prop) => {
            if (prop === 'save' || prop === 'restore') return () => {};
            if (prop === 'translate' || prop === 'rotate' || prop === 'scale') return () => {};
            if (prop === 'beginPath' || prop === 'closePath' || prop === 'moveTo' || prop === 'lineTo') return () => {};
            if (prop === 'quadraticCurveTo' || prop === 'bezierCurveTo' || prop === 'arc' || prop === 'ellipse') return () => {};
            if (prop === 'rect' || prop === 'fillRect' || prop === 'strokeRect' || prop === 'roundRect') return () => {};
            if (prop === 'fill' || prop === 'stroke' || prop === 'clip') return () => {};
            return () => {};
        },
        set: () => true
    });
}

const mockCtx = createMockCtx();
console.log('Mock ctx ready');
