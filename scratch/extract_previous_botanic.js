const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
    crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
    lineNum++;
    if (lineNum === 40022 || lineNum === 40026) {
        try {
            const data = JSON.parse(line);
            console.log(`Line ${lineNum} content length:`, data.content ? data.content.length : 0);
            if (lineNum === 40022) {
                fs.writeFileSync('scratch/previous_renderBotanicShop_part1.txt', data.content);
            }
            if (lineNum === 40026) {
                fs.writeFileSync('scratch/previous_renderBotanicShop_part2.txt', data.content);
            }
        } catch (e) {
            console.error(e);
        }
    }
});
rl.on('close', () => {
    console.log('Finished extracting previous renderBotanicShop parts');
});

