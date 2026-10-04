const { boot, assert } = require('./harness');
module.exports = {
  'step time stays small with a big town and nothing leaks over 5 minutes'() {
    const g = boot(); g.start();
    g.run("G.res = { wood: 9999, stone: 9999, food: 9999, gold: 9999 }; for (let k = 0; k < 30; k++) __put('house', rnd(-10, 10), rnd(-10, 10)); for (let k = 0; k < 40; k++) __put('wall', rnd(-11, 11), rnd(-11, 11)); __put('barracks', -6, 0); for (let k = 0; k < 8; k++) __put('tower', rnd(-9, 9), rnd(-9, 9)); for (let k = 0; k < 30 * 20; k++) step(0.05); G.res = { wood: 9999, stone: 9999, food: 9999, gold: 9999 }; for (let k = 0; k < 25; k++) trainUnit(k % 2 ? 'archer' : 'guard');");
    const children0 = g.run('scene.children.length');
    const t0 = Date.now(); g.run("for (let w = 0; w < 4; w++) { startWave(); for (let k = 0; k < 75 * 20; k++) step(0.05); }"); const ms = Date.now() - t0;
    const perStep = ms / (4 * 75 * 20);
    assert(perStep < 2.5, 'ms per step: ' + perStep.toFixed(2));
    const children1 = g.run('scene.children.length'), parts = g.run('parts.length'), shots = g.run('shots.length');
    assert(children1 - children0 < 400, `scene children grew ${children0} -> ${children1}`);
    assert(parts <= 260 && shots < 200, `particles ${parts} shots ${shots}`);
    assert(g.errs.length === 0, 'no errors: ' + g.errs.join(' | '));
  }
};
