/* Runs every tests/test-*.js file; each exports an async function or a map of named tests. */
const fs = require('fs'), path = require('path');
const files = fs.readdirSync(__dirname).filter(f => /^test-.*\.js$/.test(f)).sort();
const only = process.argv[2];
(async () => {
  let pass = 0, fail = 0;
  for (const f of files) {
    if (only && !f.includes(only)) continue;
    const mod = require(path.join(__dirname, f));
    const tests = typeof mod === 'function' ? { [f]: mod } : mod;
    for (const name in tests) {
      const t0 = Date.now();
      try { await tests[name](); pass++; console.log(`ok   ${f} › ${name} (${Date.now() - t0} ms)`); }
      catch (e) { fail++; console.log(`FAIL ${f} › ${name}: ${e.message}`); }
    }
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
