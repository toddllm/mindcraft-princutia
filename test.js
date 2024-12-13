import { readFileSync } from 'node:fs';
import { Buffer } from 'node:buffer';
import process from 'node:process';

if (process.argv.length < 3) {
  console.error('Usage: node analyzeFile.js <filename>');
  process.exit(1);
}

const filename = process.argv[2];

try {
  const data = readFileSync(filename);
  const text = data.toString('utf8');

  console.log(`Analyzing file: ${filename}\n`);
  
  // 1. Print each line, show control characters
  console.log('--- Line by Line (showing control chars as ^ and making all chars visible) ---');
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    // Make non-printable visible by replacing
    const visibleLine = line.replace(/[^\x20-\x7E]/g, (ch) => {
      const code = ch.charCodeAt(0);
      // Represent control chars as ^X
      return '^' + code.toString(16);
    });
    console.log(`${i + 1}: ${visibleLine}`);
  });

  // 2. Check for non-ASCII chars
  console.log('\n--- Checking for Non-ASCII Characters ---');
  let foundNonAscii = false;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    if (byte > 0x7F) {
      console.log(`Non-ASCII character 0x${byte.toString(16)} at byte offset ${i}`);
      foundNonAscii = true;
    }
  }
  if (!foundNonAscii) {
    console.log('No non-ASCII characters found.');
  }

  // 3. Print a hex dump
  console.log('\n--- Hex Dump of File ---');
  const hex = data.toString('hex');
  for (let i = 0; i < hex.length; i += 32) {
    const segment = hex.slice(i, i + 32);
    console.log(segment.match(/.{1,2}/g).join(' '));
  }

} catch (err) {
  console.error(`Error reading file: ${err.message}`);
  process.exit(1);
}

