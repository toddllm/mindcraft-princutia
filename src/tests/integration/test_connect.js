import { strict as assert } from 'assert/strict';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// If mocha's describe/it are not globally available, uncomment the following line:
// import { describe, it, before, after } from 'mocha';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Integration Test - Connect to Minecraft Server', function () {
  this.timeout(30000); // allow extra time for spawn

  let botProcess = null;

  before(function (done) {
    botProcess = spawn('node', [path.join(__dirname, '../../../main.js')], {
      cwd: path.join(__dirname, '../../../'),
      env: { ...process.env, NODE_ENV: 'test' },
    });

    let spawned = false;

    botProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      console.log('Bot STDOUT:', output);
      if (output.includes('Bot spawned.')) {
        spawned = true;
        done();
      }
    });

    botProcess.stderr.on('data', (data) => {
      console.error('Bot STDERR:', data.toString());
    });

    setTimeout(() => {
      if (!spawned) {
        done(new Error('Bot did not spawn in time.'));
      }
    }, 25000);
  });

  after(function (done) {
    if (botProcess) {
      botProcess.kill('SIGINT');
    }
    done();
  });

  it('should connect and spawn in the server', function () {
    assert(true, 'Bot spawned and connected to server.');
  });
});
