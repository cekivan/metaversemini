const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'js');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(f => {
    const lines = fs.readFileSync(path.join(dir, f), 'utf8').split('\n');
    lines.forEach((line, idx) => {
        if (/fillText.*(\[|\bE\b|Tuş|Etkileşim|Yaklaş)/i.test(line)) {
            if (/\[E|E'ye|Tuşuna|Tıkla|Otur|Dans/i.test(line)) {
                console.log(`${f}:${idx + 1} -> ${line.trim()}`);
            }
        }
    });
});

