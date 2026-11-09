const fs = require('fs');
const vm = require('vm');

const filePath = 'public/js/worldRenderer.js';
let content = fs.readFileSync(filePath, 'utf8');

const s = '// TAVLA MASASI ÇİZİMİ';
const eSearch = '/**\r\n * Türkiye Karayolları / Şehir İçi Yön Tabelası Çizici';
const eSearchLF = '/**\n * Türkiye Karayolları / Şehir İçi Yön Tabelası Çizici';

const idxS = content.indexOf(s);
let idxE = content.indexOf(eSearch);
if (idxE === -1) {
    idxE = content.indexOf(eSearchLF);
}

console.log('Block Remaining Tables:', { idxS, idxE });

if (idxS === -1 || idxE === -1) {
    console.error('Table block not found!');
    process.exit(1);
}

content = content.slice(0, idxS) + '\n' + content.slice(idxE);

// Validate with VM script
new vm.Script(content);
console.log('VM Script check passed! Saving file...');
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated', filePath);
