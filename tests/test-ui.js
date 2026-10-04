const { boot, assert } = require('./harness');
module.exports = {
  'selection, deselect, build cancel, pop chip, menu, difficulty, tech and promote controls'() {
    const g = boot();
    assert(g.run("[...document.querySelectorAll('#introDiff .btn')].length") === 3, 'three difficulties on intro');
    g.run("document.querySelectorAll('#introDiff .btn')[0].click()"); assert(g.run('G.diff') === 'gentle' && g.run('G.nextWave') === 150, 'gentle picked before start');
    g.start();
    g.run("G.build = 'house'; updateInfo()"); assert(g.run("document.getElementById('buildCancel').classList.contains('on')"), 'stop-building bar shown');
    g.click('buildCancel'); assert(g.run('G.build') === null, 'build cancelled');
    g.run("selectUnits([units[0]], false); updateInfo()"); assert(g.run("document.getElementById('info').classList.contains('on')"), 'info panel open');
    g.click('infoClose'); assert(g.run('G.selU.length') === 0, 'close button deselects');
    g.click('popChip'); assert(g.run("document.getElementById('tip').textContent").includes('Population'), 'pop chip explains population');
    g.run('openSaveModal()'); assert(g.run("document.getElementById('diagText').textContent").includes('fps'), 'diagnostics shown');
    assert(g.run("document.querySelectorAll('#tips li').length") >= 8, 'tips listed'); g.run('closeSaveModal(false)');
    g.run("G.res = { wood: 9999, stone: 9999, food: 9999, gold: 9999 }; G.age = 2; curTab = 'research'; renderDock(); updateDock(true)");
    assert(g.run("[...document.querySelectorAll('.card .nm')].map(c => c.textContent).join()").includes('Crop Rotation'), 'tech cards present');
    g.run("__put('barracks', -5, 0); for (let k = 0; k < 20 * 20; k++) step(0.05); G.res = { wood: 9999, stone: 9999, food: 9999, gold: 9999 }; __put('house', 4, -3); for (let k = 0; k < 20 * 20; k++) step(0.05); trainUnit('guard'); const u = units.find(x => x.role === 'guard'); u.lvl = 5; applyStats(u); selectUnits([u], false); infoSig = ''; updateInfo()");
    assert(g.run("[...document.querySelectorAll('#infoBtns button')].map(b => b.textContent).join()").includes('Promote'), 'promote button for a level 5 unit');
    assert(g.errs.length === 0, 'no errors: ' + g.errs.join(' | '));
  },
  'mobile layout: touch controls exist and the game runs at phone size'() {
    const g = boot({ width: 390, height: 844, coarse: true }); g.start();
    for (const id of ['zoomIn', 'zoomOut', 'zoomReset', 'rotL', 'rotR', 'tiltBtn', 'compass']) assert(g.run(`!!document.getElementById('${id}')`), id + ' exists');
    g.run("camStep('rotR'); for (let k = 0; k < 60; k++) panKeys(0.016)"); assert(Math.abs(g.run('cam.yaw') - 0.8 - Math.PI / 4) < 0.05, 'rotate button eases to 45 degrees');
    g.steps(20 * 20); assert(g.errs.length === 0, 'no errors: ' + g.errs.join(' | '));
  }
};
