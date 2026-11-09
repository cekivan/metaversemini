// scratch/verify_html_assets.js
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('public/index.html', 'utf8');

const missingAssets = [];

// Script tags
const scriptRegex = /<script\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/socket.io/')) continue;
    const cleanSrc = src.split('?')[0];
    const fullPath = path.resolve('public', cleanSrc);
    if (!fs.existsSync(fullPath)) {
        missingAssets.push({ type: 'script', src, fullPath });
    }
}

// Link tags
const linkRegex = /<link\s+[^>]*href=["']([^"']+)["'][^>]*>/gi;
while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1];
    if (href.startsWith('http://') || href.startsWith('https://')) continue;
    const cleanHref = href.split('?')[0];
    const fullPath = path.resolve('public', cleanHref);
    if (!fs.existsSync(fullPath)) {
        missingAssets.push({ type: 'link', href, fullPath });
    }
}

console.log('Missing assets count in index.html:', missingAssets.length);
if (missingAssets.length > 0) {
    console.log(JSON.stringify(missingAssets, null, 2));
}

