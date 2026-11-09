const fs = require('fs');
let content = fs.readFileSync('src/handlers/socialHandler.js', 'utf8');
const searchStr = 'const resolvedLevel = tData.level || (calculateLevel ? calculateLevel(tData.totalXP || 0) : 1);';
if (!content.includes(searchStr)) {
    console.error('searchStr not found!');
    process.exit(1);
}

content = content.replace(
    'const resolvedLevel = tData.level || (calculateLevel ? calculateLevel(tData.totalXP || 0) : 1);',
    'const resolvedLevel = (tData.level !== undefined && tData.level !== null) ? Number(tData.level) : (calculateLevel ? calculateLevel(tData.totalXP || 0) : 0);'
);

content = content.replace(
    'const targetXP = (resolvedLevel < 100) ? ((typeof getDeltaXP === \'function\') ? getDeltaXP(resolvedLevel + 1) : 20) : 0;',
    'const targetXP = (resolvedLevel < 100) ? ((typeof getDeltaXP === \'function\') ? getDeltaXP(resolvedLevel + 1) : (resolvedLevel === 0 ? 1 : 19)) : 0;'
);

fs.writeFileSync('src/handlers/socialHandler.js', content, 'utf8');
console.log('src/handlers/socialHandler.js updated successfully!');

