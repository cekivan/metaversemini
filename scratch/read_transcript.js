const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript.jsonl'),
  crlfDelay: Infinity
});

let capture = false;
let count = 0;
rl.on('line', (line) => {
  if (line.includes('"step_index":37765')) {
    capture = true;
  }
  if (capture && count < 25) {
    count++;
    try {
      const data = JSON.parse(line);
      console.log('--- Step:', data.step_index, data.type);
      if (data.thinking) console.log('Thinking:', (data.thinking || '').slice(0, 300));
      if (data.tool_calls) console.log('Tool calls:', JSON.stringify(data.tool_calls || []).slice(0, 300));
      if (data.content && data.source === 'MODEL') console.log('Content:', data.content.slice(0, 300));
    } catch (e) {}
  }
});

