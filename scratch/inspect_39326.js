const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
    crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
    lineNum++;
    if (lineNum === 39326) {
        try {
            const data = JSON.parse(line);
            console.log('Path:', data.tool_calls[0].args.Path);
            console.log('Target:\n', data.tool_calls[0].args.Target);
            console.log('Replacement:\n', data.tool_calls[0].args.Replacement);
        } catch (e) {
            console.error(e);
        }
    }
});

