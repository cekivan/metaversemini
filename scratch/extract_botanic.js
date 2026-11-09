const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
    crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
    lineNum++;
    if (line.includes('renderBotanicShop.js') && line.includes('function drawNpcDefne')) {
        try {
            const data = JSON.parse(line);
            if (data.tool_calls && data.tool_calls[0] && data.tool_calls[0].args) {
                let content = data.tool_calls[0].args.Content;
                if (content.startsWith('"') && content.endsWith('"')) {
                    content = JSON.parse(content);
                }
                fs.writeFileSync('scratch/original_renderBotanicShop.js', content);
                console.log('Extracted original renderBotanicShop.js at lineNum', lineNum, 'size:', content.length);
                process.exit(0);
            }
        } catch (e) {
            console.error('Parse err at', lineNum, e.message);
        }
    }
});

