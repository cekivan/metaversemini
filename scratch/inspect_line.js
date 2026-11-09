const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
    crlfDelay: Infinity
});

let lineNum = 0;
rl.on('line', (line) => {
    lineNum++;
    if (lineNum === 40027) {
        try {
            const data = JSON.parse(line);
            console.log('Line 40027 tool call:', data.tool_calls ? data.tool_calls[0].name : 'none');
            if (data.tool_calls && data.tool_calls[0].args) {
                console.log('Target:', data.tool_calls[0].args.Target ? data.tool_calls[0].args.Target.substring(0, 100) : 'none');
            }
        } catch (e) {
            console.error(e);
        }
    }
});

