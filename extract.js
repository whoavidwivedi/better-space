import { createReadStream } from 'fs';
import { createInterface } from 'readline';

async function extract() {
  const fileStream = createReadStream('/Users/whoavidwivedi/.gemini/antigravity/brain/4ac1ad1a-91f3-4d29-996e-7724dac85179/.system_generated/logs/transcript_full.jsonl');
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity });

  let latestContent = null;
  
  for await (const line of rl) {
    try {
      const data = JSON.parse(line);
      
      // Look for the last successful multi_replace_file_content that modified livekit-room.tsx
      if (data.type === "TOOL_RESPONSE" && data.tool_responses) {
        for (const resp of data.tool_responses) {
          if (resp.name === "multi_replace_file_content" && resp.response && resp.response.output && resp.response.output.includes("livekit-room.tsx")) {
             // wait, multi_replace doesn't output the full file.
          }
        }
      }
      
    } catch(e) {}
  }
}
extract();
