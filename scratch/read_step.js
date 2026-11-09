const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/WIN11/.gemini/antigravity/brain/a42672a4-feaf-4dce-b597-7d8287cb2cc5/.system_generated/logs/transcript_full.jsonl'),
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  if (line.includes('"step_index":42024')) {
    try {
      const obj = JSON.parse(line);
      console.log(obj.content);
    } catch (e) {
      console.error(e);
    }
    process.exit(0);
  }
});

