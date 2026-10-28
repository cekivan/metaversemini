const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('public/index.html', 'utf8');
const scriptRegex = /<script[^>]+src=["']([^"']+)["']/g;
let m;
const scripts = [];
while ((m = scriptRegex.exec(html)) !== null) {
  scripts.push(m[1]);
}
console.log('Total scripts found in index.html:', scripts.length);

const jsDir = 'public/js';
const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));

const unref = jsFiles.filter(f => !scripts.some(s => s.includes(f)));
console.log('Unreferenced in public/js:', unref);

// Also renderers subfolder
if (fs.existsSync('public/js/renderers')) {
  const rendFiles = fs.readdirSync('public/js/renderers').filter(f => f.endsWith('.js'));
  const unrefRend = rendFiles.filter(f => !scripts.some(s => s.includes(f)));
  console.log('Unreferenced in public/js/renderers:', unrefRend);
}
