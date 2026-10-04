const { boot, assert } = require('./harness');
module.exports = {
  'placement refuses to trap animals, walls never count'() {
    const g = boot(); g.start();
    g.run("G.res = { wood: 900, stone: 900, food: 900, gold: 900 }; let wi = KX + 9, wj = KZ + 9; outer: for (let i = KX + 6; i < KX + 20; i++) for (let j = KZ + 6; j < KZ + 20; j++) { let ok = true; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if (!freeGrass(i + a, j + b)) ok = false; if (ok) { wi = i; wj = j; break outer; } } globalThis.WI = wi; globalThis.WJ = wj; const u = units.find(u => u.role === 'worker'); u.x = wi; u.z = wj; for (const [a, b] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]) placeBuilding('house', wi + a, wj + b, true);");
    assert(!g.run("canPlace('house', WI, WJ + 1)"), 'closing the ring is refused'); assert(g.run('placeWhy').includes('trap'), 'with a reason');
    assert(g.run("canPlace('wall', WI, WJ + 1)"), 'a wall may close it (animals walk through walls)');
    assert(g.run("(() => { for (let i = KX - 12; i < KX - 4; i++) for (let j = KZ - 12; j < KZ - 4; j++) if (freeGrass(i, j) && canPlace('house', i, j)) return true; return false; })()"), 'a house elsewhere is fine');
  },
  'sealed pocket: animal escapes, sealed tree never targeted, farms tended when nothing is left'() {
    const g = boot(); g.start();
    g.run("G.res = { wood: 9000, stone: 9000, food: 9000, gold: 9000 }; const ci = KX + 8, cj = KZ + 8; for (const [a, b] of [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]]) { if (nodeAt[ci + a][cj + b]) removeNode(nodeAt[ci + a][cj + b]); placeBuilding('house', ci + a, cj + b, true); } if (nodeAt[ci][cj]) removeNode(nodeAt[ci][cj]); globalThis.TN = addNode('wood', ci, cj, 30); const w = units.find(u => u.role === 'worker'); w.x = ci; w.z = cj; releaseWorker(w); w.state = 'idle'; w.wait = 0; globalThis.W = w; for (let k = 0; k < 3 * 20; k++) step(0.05);");
    assert(g.run('Math.hypot(W.x - (KX + 8), W.z - (KZ + 8)) > 1.4'), 'settler escaped the pocket');
    g.steps(20 * 30);
    assert(!g.run('units.some(u => u.node === TN)'), 'nobody targets the sealed tree');
    g.run("for (const n of nodes.slice()) removeNode(n); __put('farm', 3, 3); __put('farm', -3, 3); for (let k = 0; k < 25 * 20; k++) step(0.05);");
    const idle = g.run("units.filter(u => u.role === 'worker' && u.state === 'idle' && u.wait > 1).length"), farming = g.run("units.filter(u => u.state === 'farm' || u.state === 'toFarm').length");
    assert(idle === 0, 'nobody idles: ' + g.run("JSON.stringify(units.filter(u=>u.role==='worker').map(u=>u.state))"));
    g.run("for (const n of nodes.slice()) removeNode(n); G.rockT = 999; G.treeT = 999; for (let k = 0; k < 10 * 20; k++) step(0.05);");
    assert(g.run("units.filter(u => u.state === 'farm' || u.state === 'toFarm').length") >= 3, 'settlers tend farms when truly nothing is left: ' + g.run("JSON.stringify(units.filter(u=>u.role==='worker').map(u=>u.state))"));
  }
};
