const { boot, assert } = require('./harness');
module.exports = {
  'boots, starts and grows an economy'() {
    const g = boot(); g.start();
    assert(g.run("document.getElementById('introVer').textContent").startsWith('Version '), 'version shown');
    g.put('house', 4, -3); g.put('house', 4, -1); g.put('camp', 0, 6); g.put('farm', -4, 4);
    g.steps(20 * 90);
    const r = g.json('G.res'), pop = g.json('[popCount(), G.popCap]');
    assert(r.wood > 140, 'wood grew: ' + r.wood); assert(pop[1] >= 11, 'housing grew: ' + pop); assert(pop[0] > 5, 'settlers arrived: ' + pop);
    assert(g.run("buildings.every(b => b.done)"), 'all buildings finished');
    assert(g.errs.length === 0, 'no page errors: ' + g.errs.join(' | '));
  },
  'raid arrives, defenders fight, settlers flee and return'() {
    const g = boot(); g.start();
    g.run("G.res = { wood: 900, stone: 300, food: 900, gold: 300 }");
    g.put('barracks', -5, 0); g.put('house', 4, -3); g.put('house', 4, -1); g.put('tower', 6, 0); g.put('tower', -6, 0);
    g.steps(20 * 30); g.run("trainUnit('archer'); trainUnit('archer'); trainUnit('guard')"); g.steps(20 * 10);
    g.run('startWave()'); g.steps(20 * 60);
    assert(g.run('G.kills') > 0, 'raiders killed: ' + g.run('G.kills'));
    assert(g.run('G.keepB.hp') > 0 && !g.run('G.over'), 'town survived');
    g.run("for (const e of enemies) if (!e.dead) killUnit(e);"); g.steps(20 * 8);
    assert(g.run("units.filter(u => u.role === 'worker' && u.state === 'flee').length") === 0, 'nobody still fleeing once the raid is over');
    assert(g.errs.length === 0, 'no page errors: ' + g.errs.join(' | '));
  },
  'resources regrow and settlers never idle with work available'() {
    const g = boot(); g.start();
    g.run("G.res = { wood: 5000, stone: 33, food: 4000, gold: 2800 }; for (let k = 0; k < 10; k++) __put('house', (k % 5) * 2 - 4, -5 - Math.floor(k / 5) * 2)");
    g.steps(20 * 60);
    assert(g.run("units.filter(u => u.node && u.node.type === 'stone').length") > 0, 'someone mines stone when it is scarce');
    g.run("for (const n of nodes.slice()) if (n.type !== 'wood') removeNode(n); __put('quarry', 4, -4); __put('farm', -4, 4)");
    g.steps(20 * 100);
    assert(g.run("nodes.some(n => n.type === 'stone')"), 'rocks regrow'); assert(g.run('G.res.stone') > 33, 'stone income continues');
    const idle = g.run("units.filter(u => u.role === 'worker' && u.state === 'idle' && u.wait > 1).length");
    assert(idle <= 2, 'idle settlers with work available: ' + idle);
  }
};
