const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');

const divOpen = (html.match(/<div(\s|>)/gi) || []).length;
const divClose = (html.match(/<\/div>/gi) || []).length;
console.log('Div tags:', { open: divOpen, close: divClose, balanced: divOpen === divClose });

const scriptOpen = (html.match(/<script(\s|>)/gi) || []).length;
const scriptClose = (html.match(/<\/script>/gi) || []).length;
console.log('Script tags:', { open: scriptOpen, close: scriptClose, balanced: scriptOpen === scriptClose });

