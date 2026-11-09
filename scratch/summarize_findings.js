// scratch/summarize_findings.js
const fs = require('fs');
const findings = JSON.parse(fs.readFileSync('scratch/audit_report.json', 'utf8'));

const byType = {};
findings.forEach(f => {
    byType[f.type] = byType[f.type] || [];
    byType[f.type].push(f);
});

for (let type in byType) {
    console.log(`\n=== TYPE: ${type} (COUNT: ${byType[type].length}) ===`);
    byType[type].forEach(item => {
        console.log(`  ${item.file}:${item.line} -> ${item.lineText}`);
    });
}

