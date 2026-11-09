const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
    crlfDelay: Infinity
});

let lineNum = 0;
let edits = [];
rl.on('line', (line) => {
    lineNum++;
    if (line.includes('renderBotanicShop.js') && (line.includes('write_file') || line.includes('edit_file'))) {
        edits.push(lineNum);
    }
});
rl.on('close', () => {
    console.log('Edits to renderBotanicShop.js found at lines:', edits);
});

