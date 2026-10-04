const { boot, assert } = require('./harness');
module.exports = {
  'late-game save round trip keeps everything'() {
    const g = boot(); g.start();
    g.run("setDifficulty('hard', true); G.res = { wood: 99999, stone: 99999, food: 99999, gold: 99999 }; for (let k = 0; k < 5; k++) advanceAge(); for (let k = 0; k < 6; k++) __put('house', (k % 3) * 2 - 2, -5 - Math.floor(k / 3) * 2); __put('barracks', -6, 0); __put('smith', 6, 0); __put('bombard', 5, 5); __put('turret', -5, 5); __put('wall', 0, 8); __put('wall', 1, 8); for (let k = 0; k < 40 * 20; k++) step(0.05); G.res = { wood: 99999, stone: 99999, food: 99999, gold: 99999 }; trainUnit('lancer'); trainUnit('sage'); trainUnit('knight'); for (let k = 0; k < 10 * 20; k++) step(0.05); researchTech('armor'); researchTech('farm'); upgradeSmith(); const L = units.find(u => u.role === 'lancer'); L.lvl = 5; applyStats(L); promoteUnits([L]); G.wave = 17; startWave(); for (let k = 0; k < 5 * 20; k++) step(0.05);");
    const before = g.json("({ age: G.age, wave: G.wave, diff: G.diff, tech: G.tech, smith: G.smith, b: buildings.map(b => b.type).sort(), u: units.filter(u => !u.dead).map(u => u.role + (u.elite ? '*' : '') + u.lvl).sort(), e: enemies.filter(e => !e.dead).length, wallHp: buildings.find(b => b.type === 'wall').maxhp })");
    g.run("saveTo('1'); newGame(); loadFrom('1');");
    const after = g.json("({ age: G.age, wave: G.wave, diff: G.diff, tech: G.tech, smith: G.smith, b: buildings.map(b => b.type).sort(), u: units.filter(u => !u.dead).map(u => u.role + (u.elite ? '*' : '') + u.lvl).sort(), e: enemies.filter(e => !e.dead).length, wallHp: buildings.find(b => b.type === 'wall').maxhp })");
    assert(JSON.stringify(before) === JSON.stringify(after), 'round trip differs:\n' + JSON.stringify(before) + '\n' + JSON.stringify(after));
    g.steps(20 * 20); assert(g.errs.length === 0, 'no errors after load: ' + g.errs.join(' | '));
  },
  'old saves with palisades load, autosave works without localStorage via the artifact database'() {
    const store = {};
    const fake = { use: async n => n === 'user' ? { id: async () => 'u1' } : n === 'db' ? { collection: () => ({ get: async () => ({ docs: Object.entries(store).map(([id, v]) => ({ id, data: () => v })) }), doc: id => ({ set: async v => { store[id] = v; }, delete: async () => { delete store[id]; } }) }) } : null };
    const g = boot({ noStorage: true, beforeGame: w => { w.claude = fake; } });
    return new Promise(res => setTimeout(res, 30)).then(() => {
      g.start(); g.run("G.res.wood = 777"); g.steps(20 * 5); g.frames(1200);
      return new Promise(res => setTimeout(res, 30));
    }).then(() => {
      assert(store.save_auto, 'autosave landed in the database');
      const raw = JSON.parse(store.save_auto.d); raw.buildings.push({ type: 'palisade', i: 10, j: 10, hp: 50, maxhp: 110, progress: 1, done: true });
      g.run(`applySnapshot(${JSON.stringify(raw)})`);
      assert(g.run("buildings.some(b => b.type === 'wall' && b.i === 10)"), 'palisade became a wall'); assert(g.run('G.res.wood') === 777, 'resources restored');
    });
  }
};
