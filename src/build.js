// Assembles Pawhold from its source files.
//   node build.js                -> writes game.js and pawhold.html (single-file page with CDN three) next to the sources
//   node build.js pwa <outDir>   -> also writes the deployable PWA (index.html, game.js, sw.js) into outDir
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const here = __dirname;
const src = f => fs.readFileSync(path.join(here, f), 'utf8');
const ORDER = ['js1_core.js', 'js2_models.js', 'js3_sim.js', 'js5_env.js', 'js6_audio.js', 'js4_ui.js', 'js7_save.js', 'js8_fx.js'];
let version = '1.1.0';
for (const p of [path.join(here, '..', 'package.json'), path.join(here, 'package.json')]) { try { version = JSON.parse(fs.readFileSync(p, 'utf8')).version || version; break; } catch (e) { /* keep default */ } }
const body = ORDER.map(src).join('\n');
const build = crypto.createHash('sha1').update(body + src('head.html')).digest('hex').slice(0, 7);
const game = `const GAME_VERSION = '${version}', GAME_BUILD = '${build}';\n` + body;
const head = src('head.html');
const isPwa = process.argv[2] === 'pwa';
if (!isPwa) fs.writeFileSync(path.join(here, 'game.js'), game);
const cut = head.indexOf('<div id="stage">');
const headPart = head.slice(0, cut), bodyPart = head.slice(cut);
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
if (!isPwa) fs.writeFileSync(path.join(here, 'pawhold.html'), `${head}\n<script src="${CDN}"></script>\n<script>\n${game}\n</script>\n`);
if (isPwa) {
  const dir = path.resolve(process.argv[3] || path.join(here, '..'));
  const version = crypto.createHash('sha1').update(game + head).digest('hex').slice(0, 10);
  const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#17232a">
<meta name="color-scheme" content="light dark">
<meta name="description" content="Pawhold: a voxel medieval city-builder where foxes, pandas, rabbits and bears raise a town and hold it against raiders.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Pawhold">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/favicon-32.png" type="image/png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
${headPart}
</head>
<body>
${bodyPart}
<script src="vendor/three.min.js"></script>
<script src="game.js"></script>
<script>
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(dir, 'index.html'), doc);
  fs.writeFileSync(path.join(dir, 'game.js'), game);
  fs.writeFileSync(path.join(dir, 'sw.js'), src('sw.template.js').replace('__VERSION__', version));
  console.log('built PWA', version, '->', dir);
}
