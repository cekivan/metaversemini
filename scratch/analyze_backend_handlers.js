// scratch/analyze_backend_handlers.js
const fs = require('fs');
const path = require('path');

const handlersDir = path.resolve('src', 'handlers');
const files = fs.readdirSync(handlersDir).filter(f => f.endsWith('.js'));

console.log('Analyzing handlers in:', handlersDir);
const issues = [];

files.forEach(file => {
    const filePath = path.join(handlersDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // 1. Check for nested socket.on (listener leak)
    const lines = content.split('\n');
    let insideSocketOn = false;
    let currentEvent = '';
    let braceDepth = 0;

    lines.forEach((line, idx) => {
        // Detect socket.on / io.on
        const onMatch = line.match(/(?:socket|io)\.on\s*\(\s*['"]([^'"]+)['"]/);
        if (onMatch) {
            if (insideSocketOn) {
                issues.push({
                    file,
                    line: idx + 1,
                    type: 'NESTED_SOCKET_ON',
                    detail: `socket.on('${onMatch[1]}') is registered inside socket.on('${currentEvent}')!`
                });
            } else {
                insideSocketOn = true;
                currentEvent = onMatch[1];
                braceDepth = 0;
            }
        }

        if (insideSocketOn) {
            for (const ch of line) {
                if (ch === '{') braceDepth++;
                if (ch === '}') {
                    braceDepth--;
                    if (braceDepth <= 0) {
                        insideSocketOn = false;
                        currentEvent = '';
                    }
                }
            }
        }

        // 2. Check for NaN risks in math operations
        if (line.includes('parseInt') && !line.includes('|| 0') && !line.includes('isNaN')) {
            if (line.includes('+') || line.includes('*') || line.includes('-')) {
                // Potential NaN propagation
            }
        }
    });
});

console.log('Issues found:', issues.length);
if (issues.length > 0) {
    console.log(JSON.stringify(issues, null, 2));
}

