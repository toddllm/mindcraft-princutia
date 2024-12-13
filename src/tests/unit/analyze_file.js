import fs from 'fs';
import path from 'path';

const filePath = process.argv[2];
if (!filePath) {
  console.error("Usage: node analyze_file.js <path-to-file>");
  process.exit(1);
}

// Read the file content
const code = fs.readFileSync(path.resolve(filePath), 'utf8');

try {
  // Attempt to parse by wrapping in an async function (since top-level await might appear)
  // If you don't use top-level await, this can be just `new Function(code)`.
  new Function("return (async () => {\n" + code + "\n})();");
  console.log("✅ The file has no immediate syntax errors detectable by this method.");
} catch (error) {
  if (error instanceof SyntaxError) {
    console.error(`❌ Syntax error detected: ${error.message}`);
    // Attempt to find a line number
    const match = error.stack.match(/<anonymous>:(\d+):(\d+)/);
    if (match) {
      const lineNumber = parseInt(match[1], 10) - 1; // Adjust if needed
      console.error(`Potentially at line: ${lineNumber}`);
      const lines = code.split('\n');
      if (lines[lineNumber - 1]) {
        console.error(`Context around line ${lineNumber}:`);
        console.error(lines.slice(Math.max(lineNumber - 3, 0), lineNumber + 2).join('\n'));
      }
    }
  } else {
    console.error(`❌ Unexpected error: ${error}`);
  }
}

