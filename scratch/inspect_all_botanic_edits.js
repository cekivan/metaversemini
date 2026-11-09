const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
    crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
    lineNum++;
    if ([8041, 8528, 12745, 26613, 26874, 26920, 37383, 39326, 39407, 39411, 39415].includes(lineNum)) {
        try {
            const data = JSON.parse(line);
            console.log(`Line ${lineNum}:`, data.tool_calls[0].name, 'Target:', data.tool_calls[0].args.Target ? data.tool_calls[0].args.Target.substring(0, 60) : 'none');
        } catch (e) {
            console.error(e);
        }
    }
});

