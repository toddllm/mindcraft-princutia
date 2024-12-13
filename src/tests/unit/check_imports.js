// check_imports.js
// This script tries to import all modules from the test_star_slash.js file
// individually to identify which one may contain a syntax error.

const paths = [
  '../../../src/actions/star-slash.js',
  '../../../src/agent/library/skills.js',
  '../../../src/agent/library/world.js',
  '../../../src/utils/friend-communication.js'
];

(async function checkImports() {
  for (const p of paths) {
    try {
      console.log(`Attempting to import: ${p}`);
      await import(p);
      console.log(`✅ Successfully imported: ${p}\n`);
    } catch (err) {
      console.error(`❌ Failed to import: ${p}`);
      console.error(`Error: ${err}\n`);
    }
  }
})();

