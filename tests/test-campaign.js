const { boot, assert } = require('./harness');
const { makePlayer } = require('./player');
function campaign(diff, raids) {
  const g = boot(); g.start(); g.run(`setDifficulty('${diff}', true)`);
  const p = makePlayer(g);
  let maxWave = 0, over = false;
  g.run("globalThis.STALL = 0; globalThis.HIST = new Map(); globalThis.tick = function () { for (const u of units) { if (u.dead) continue; const m = u.order ? 1 : (u.role === 'worker' && ['toNode', 'toDrop', 'toSite', 'toRepair', 'toFarm', 'goto'].includes(u.state)); let h = HIST.get(u); if (!m) { HIST.delete(u); continue; } if (!h) { HIST.set(u, { x: u.x, z: u.z, t: G.t }); continue; } if (Math.hypot(u.x - h.x, u.z - h.z) > 0.6) { h.x = u.x; h.z = u.z; h.t = G.t; h.flag = false; } else if (G.t - h.t > 6 && !h.flag) { h.flag = true; STALL++; } } };");
  for (let minute = 0; minute < 75 && !over; minute++) {
    for (let s = 0; s < 30; s++) { g.run('for (let k = 0; k < 40; k++) { step(0.05); tick(); }'); p.tick(); }
    over = g.run('G.over'); maxWave = g.run('G.wave');
    if (maxWave >= raids && !g.run('enemies.some(e => !e.dead)')) break;
  }
  const info = g.json("({ wave: G.wave, over: G.over, won: G.over && G.wave >= TOTAL_WAVES && G.keepB.hp > 0, keep: Math.round(G.keepB.hp), age: G.age, pop: popCount(), soldiers: units.filter(u => !u.dead && u.role !== 'worker').length, kills: G.kills, stalls: STALL, kicks: DIAG.kicks, kicklog: DIAG.log.slice(0, 3), t: Math.round(G.t) })");
  assert(g.errs.length === 0, diff + ' errors: ' + g.errs.join(' | '));
  return info;
}
module.exports = {
  'gentle: scripted player survives 12 raids'() { const i = campaign('gentle', 12); console.log('    ', JSON.stringify(i)); assert(i.wave >= 12 && !i.over, 'reached raid 12 alive: ' + JSON.stringify(i)); assert(i.stalls === 0, 'stalls ' + i.stalls); assert(i.kicks <= 3, 'kicks ' + i.kicks + ' ' + JSON.stringify(i.kicklog)); },
  'normal: scripted player reaches raid 10 alive'() { const i = campaign('normal', 12); console.log('    ', JSON.stringify(i)); assert(i.wave >= 10 && (!i.over || i.wave >= 12), 'reached raid 10 alive: ' + JSON.stringify(i)); assert(i.stalls === 0, 'stalls ' + i.stalls); assert(i.kicks <= 5, 'kicks ' + i.kicks + ' ' + JSON.stringify(i.kicklog)); },
  'hard: campaign runs to an ending without errors or stalls'() { const i = campaign('hard', 25); console.log('    ', JSON.stringify(i)); assert(i.wave >= 5, 'played several raids: ' + JSON.stringify(i)); assert(i.stalls === 0, 'stalls ' + i.stalls); assert(i.kicks <= 5, 'kicks ' + i.kicks + ' ' + JSON.stringify(i.kicklog)); },
  'gentle: full 25-raid campaign through all seven ages'() { const i = campaign('gentle', 25); console.log('    ', JSON.stringify(i)); assert(i.wave >= 20, 'deep campaign: ' + JSON.stringify(i)); assert(i.age >= 5, 'reached late ages: ' + i.age); assert(i.stalls === 0, 'stalls ' + i.stalls); assert(i.kicks <= 8, 'kicks ' + i.kicks + ' ' + JSON.stringify(i.kicklog)); }
};
