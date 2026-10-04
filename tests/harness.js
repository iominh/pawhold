/* Headless Pawhold: assembles the game from src/ and runs it in jsdom with a stubbed WebGL renderer.
   Usage: const { boot } = require('./harness'); const g = boot(); g.run('G.res.wood'); g.steps(20*60); */
const { JSDOM } = require('jsdom');
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const built = require(path.join(ROOT, 'src', 'build.js'));
const THREE_SRC = fs.readFileSync(path.join(ROOT, 'vendor', 'three.min.js'), 'utf8');

function boot(opts = {}) {
  const dom = new JSDOM('<!doctype html><html><body>' + built.head + '</body></html>', { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window, rafs = [], errs = [];
  w.requestAnimationFrame = cb => { rafs.push(cb); return 1; };
  Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return opts.width || 1200; } });
  Object.defineProperty(w.HTMLElement.prototype, 'clientHeight', { get() { return opts.height || 800; } });
  w.HTMLElement.prototype.setPointerCapture = () => {};
  w.HTMLCanvasElement.prototype.getContext = () => null;
  w.matchMedia = w.matchMedia || (() => ({ matches: !!opts.coarse, addEventListener() {}, addListener() {} }));
  if (opts.noStorage) Object.defineProperty(w, 'localStorage', { get() { throw new Error('blocked'); } });
  w.addEventListener('error', e => errs.push(e.message));
  const ctx = dom.getInternalVMContext();
  const run = code => new vm.Script(code).runInContext(ctx);
  run(THREE_SRC);
  run(`THREE.WebGLRenderer = class { constructor(){ this.domElement = document.createElement('canvas'); this.shadowMap = {}; } setPixelRatio(){} setSize(){} render(){} };`);
  if (opts.beforeGame) opts.beforeGame(w);
  run(built.game);
  let T = w.performance.now();
  const frames = n => { for (let k = 0; k < n; k++) { T += 16; rafs.splice(0).forEach(cb => cb(T)); } };
  frames(3);
  const steps = (n, dt = 0.05) => run(`for (let k = 0; k < ${n}; k++) step(${dt});`);
  const click = id => run(`document.getElementById('${id}').click()`);
  const start = () => { click('startBtn'); };
  // place a building near an offset from the Hall, searching outward for a legal spot
  run(`function __put(type, dx, dz) { G.build = type; for (let r = 0; r < 10; r++) for (let a = 0; a < 16; a++) { const i = Math.round(KX + dx + Math.cos(a / 16 * 6.283) * r), j = Math.round(KZ + dz + Math.sin(a / 16 * 6.283) * r); if (tryPlace(i, j, true)) { G.build = null; return occ[i][j]; } } G.build = null; return null; }`);
  const put = (type, dx, dz) => run(`!!__put('${type}', ${dx}, ${dz})`);
  return { dom, w, run, frames, steps, click, start, put, errs, json: code => JSON.parse(run(`JSON.stringify(${code})`)) };
}
function assert(cond, msg) { if (!cond) throw new Error('ASSERT: ' + msg); }
module.exports = { boot, assert };
