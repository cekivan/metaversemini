const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
    crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
    lineNum++;
    if (lineNum >= 39950 && lineNum <= 40030) {
        if (line.includes('USER_INPUT')) {
            console.log(`User prompt at ${lineNum}:`, JSON.parse(line).content);
        }
        if (line.includes('read_file') && line.includes('renderBotanicShop.js')) {
            console.log(`Read file at ${lineNum}`);
        }
    }
});

