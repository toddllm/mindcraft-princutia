const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');

describe('Initial Test - main.js startup', function() {
  it('should run main.js and exit or print something within a timeframe', function(done) {
    const mainPath = path.join(__dirname, '../../../main.js');

    const proc = spawn('node', [mainPath]);

    let output = '';
    let errorOutput = '';

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    setTimeout(() => {
      try {
        proc.kill('SIGINT');
        assert.ok(
          output.length > 0 || errorOutput.length > 0,
          'main.js produced no output'
        );
        done();
      } catch (err) {
        done(err);
      }
    }, 3000);
  });
});
