/* A scripted player: builds an economy and defenses in a sensible order and manages the army. Used by the campaign tests. */
function makePlayer(g) {
  const st = { houses: 0, farms: 0, camps: 0, quarries: 0, markets: 0, towers: 0, huts: 0, barracks: false, smith: false, walls: 0, t: 0 };
  const res = () => g.json('G.res');
  const count = type => g.run(`buildings.filter(b => b.type === '${type}').length`);
  const spots = [[6, 0], [0, 6], [-6, 0], [0, -6], [5, 5], [-5, -5], [5, -5], [-5, 5], [8, 2], [-8, -2], [2, 8], [-2, -8], [8, -3], [-8, 3], [3, 8], [-3, -8]];
  function tick() {
    const r = res(), pop = g.json('[popCount(), G.popCap]'), age = g.run('G.age');
    if (pop[0] >= pop[1] - 1 && r.wood >= 20 && count('house') < 30) g.put('house', 3 + (count('house') % 5) * 1.5 - 3, -4 - Math.floor(count('house') / 5) * 1.5);
    if (count('camp') < 1 && r.wood >= 35) g.put('camp', 0, 7);
    if (count('farm') < 2 + age && r.wood >= 30) g.put('farm', -4 + count('farm') * 1.5, 4);
    if (!count('barracks') && r.wood >= 80 && r.stone >= 10) g.put('barracks', -6, 0);
    if (count('tower') < 2 + age * 2 && r.wood >= 45 && r.stone >= 5) { const s = spots[count('tower') % spots.length]; g.put('tower', s[0], s[1]); }
    if (age >= 1 && count('quarry') < 1 && r.wood >= 50) g.put('quarry', 7, -6);
    if (age >= 1 && count('market') < 1 + age && r.wood >= 70 && r.stone >= 20) g.put('market', -7, 5 + count('market') * 1.5);
    if (count('infirmary') < 1 && r.wood >= 55 && r.stone >= 10 && age >= 1) g.put('infirmary', 2, 3);
    if (age >= 2 && !count('smith') && r.wood >= 60 && r.stone >= 60) g.put('smith', -3, -6);
    if (age >= 2 && count('ballista') < age - 1 && r.wood >= 70 && r.stone >= 70) { const s = spots[(count('ballista') + 4) % spots.length]; g.put('ballista', s[0] * 1.2, s[1] * 1.2); }
    if (age >= 3 && count('cannon') < age - 2 && r.stone >= 90 && r.gold >= 70) { const s = spots[(count('cannon') + 8) % spots.length]; g.put('cannon', s[0] * 1.3, s[1] * 1.3); }
    if (age >= 4 && count('bombard') < 2 && r.stone >= 170 && r.gold >= 150) g.put('bombard', count('bombard') ? -3 : 3, 0);
    if (age >= 5 && count('turret') < 3 && r.stone >= 120 && r.gold >= 230) g.put('turret', 4 * (count('turret') - 1), -2);
    if (age >= 6 && count('skyscraper') < 2 && r.stone >= 220 && r.gold >= 160) g.put('skyscraper', 6, -8 + count('skyscraper') * 3);
    if (age >= 6 && count('laser') < 4 && r.stone >= 150 && r.gold >= 320) { const s = spots[(count('laser') + 2) % spots.length]; g.put('laser', s[0] * 1.4, s[1] * 1.4); }
    if (age >= 6 && !count('skyport') && r.stone >= 200 && r.gold >= 300) g.put('skyport', -8, -6);
    // army
    const soldiers = g.run("units.filter(u => !u.dead && u.role !== 'worker').length");
    if (count('barracks') && pop[0] < pop[1] && soldiers < 6 + age * 4 + g.run('G.wave')) {
      const order = age >= 6 && count('skyport') ? ['skiff', 'sage', 'lancer', 'knight'] : age >= 5 ? ['sage', 'lancer', 'knight', 'archer'] : age >= 4 ? ['lancer', 'knight', 'archer', 'guard'] : age >= 3 ? ['musket', 'knight', 'archer', 'guard'] : age >= 2 ? ['knight', 'archer', 'guard'] : ['archer', 'guard'];
      g.run(`trainUnit('${order[soldiers % order.length]}')`);
    }
    // research / upgrades / age
    if (count('smith')) { g.run('upgradeSmith()'); g.run("researchTech('armor')"); }
    g.run("researchTech('farm'); researchTech('tools')");
    if (age < 6) g.run('advanceAge()');
    // promote veterans
    g.run("promoteUnits(units.filter(u => !u.dead && u.role !== 'worker'))");
  }
  return { tick, st };
}
module.exports = { makePlayer };
