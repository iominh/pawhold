const { boot, assert } = require('./harness');
function clutter(g, seed) {
  g.run(`let _s = ${seed} * 9301 + 49297; Math.random = function () { _s = (_s * 9301 + 49297) % 233280; return _s / 233280; };
    G.res = { wood: 9000, stone: 9000, food: 9000, gold: 9000 };
    for (let k = 0; k < 40; k++) __put('house', rnd(-12, 12), rnd(-12, 12));
    for (let k = 0; k < 30; k++) __put('wall', rnd(-11, 11), rnd(-11, 11));
    for (let k = 0; k < 6; k++) __put(pick(['tower', 'farm', 'camp', 'market', 'infirmary', 'barracks']), rnd(-10, 10), rnd(-10, 10));
    __put('barracks', -6, 0);
    for (let k = 0; k < 20 * 20; k++) step(0.05);
    for (let k = 0; k < 10; k++) trainUnit('archer'); for (let k = 0; k < 8; k++) trainUnit('guard');
    globalThis.HIST = new Map(); globalThis.STUCK = {};
    const moving = u => u.order ? u.order.type : (u.role === 'worker' && ['toNode', 'toDrop', 'toSite', 'toRepair', 'toFarm', 'goto'].includes(u.state) ? u.state : null);
    globalThis.tick = function () { for (const u of units) { if (u.dead) continue; const m = moving(u); let h = HIST.get(u); if (!m) { HIST.delete(u); continue; } if (!h) { HIST.set(u, { x: u.x, z: u.z, t: G.t }); continue; } if (Math.hypot(u.x - h.x, u.z - h.z) > 0.6) { h.x = u.x; h.z = u.z; h.t = G.t; h.flag = false; } else if (G.t - h.t > 5 && !h.flag) { h.flag = true; STUCK[u.role + ':' + m] = (STUCK[u.role + ':' + m] || 0) + 1; } } };`);
}
module.exports = {
  'no unit stays stuck in heavy clutter with random orders (3 seeds)'() {
    for (const seed of [3, 4, 7]) {
      const g = boot(); g.start(); clutter(g, seed);
      g.run(`for (let w = 0; w < 3; w++) { startWave(); for (let k = 0; k < 60 * 20; k++) { step(0.05); tick(); if (k % 100 === 0) { const us = units.filter(u => !u.dead && u.role !== 'worker'); const grp = us.filter(() => Math.random() < 0.5); if (grp.length) orderMove(grp, KX + rnd(-14, 14), KZ + rnd(-14, 14), false); } } }`);
      const stuck = g.json('STUCK'), kicks = g.run('DIAG.kicks');
      assert(Object.keys(stuck).length === 0, `seed ${seed} stuck: ` + JSON.stringify(stuck));
      assert(kicks <= 2, `seed ${seed} freeze resets: ${kicks} ` + g.run('JSON.stringify(DIAG.log.slice(0, 3))'));
      assert(g.errs.length === 0, 'no page errors: ' + g.errs.join(' | '));
    }
  },
  'units never spawn inside buildings and inside units are stepped out'() {
    const g = boot(); g.start();
    g.run("G.res = { wood: 9000, stone: 9000, food: 9000, gold: 9000 }; __put('barracks', -5, 0); for (let k = 0; k < 20 * 20; k++) step(0.05); const b = buildings.find(x => x.type === 'barracks'); for (let dx = -2; dx <= 2; dx++) if (!occ[b.i + dx][b.j + 3]) placeBuilding('house', b.i + dx, b.j + 3, true); for (let dx = -1; dx <= 1; dx++) if (!occ[KX + dx][KZ + 2]) placeBuilding('house', KX + dx, KZ + 2, true); for (let k = 0; k < 6; k++) trainUnit('archer'); for (let k = 0; k < 20; k++) step(0.05);");
    assert(g.run("units.every(u => u.dead || !blockedAt(u.x, u.z, 0, null))"), 'nobody stands inside a building');
    g.run("const u = units[0]; u.x = KX + 0.4; u.z = KZ + 2; for (let k = 0; k < 10; k++) step(0.05);");
    assert(g.run("!blockedAt(units[0].x, units[0].z, 0, null)"), 'unit placed inside a house is stepped out');
  },
  'a raider that is stuck slinks away, settlers are never pinned forever'() {
    const g = boot(); g.start();
    g.run("const ci = KX + 2, cj = KZ + 5; for (const [a, b] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) placeBuilding('house', ci + a, cj + b, true); globalThis.E = makeEnemy('wolf', ci, cj, 1); for (let k = 0; k < 26 * 20; k++) step(0.05);");
    assert(g.run("units.filter(u => u.role === 'worker' && u.state !== 'flee').length") >= 3, 'settlers went back to work while a raider chews a house');
    g.run("E.lastAct = G.t - 30; for (let k = 0; k < 20; k++) step(0.05);");
    assert(g.run('E.dead'), 'a long-idle raider leaves');
  }
};
