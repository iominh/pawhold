/* ===================== game state ===================== */
const G = {
  res: { wood: 0, stone: 0, food: 0, gold: 0 }, age: 0, t: 0, wave: 0, nextWave: 90, speed: 1, paused: true, over: false,
  smith: 0, tech: { armor: 0, farm: 0, tools: 0 }, threat: 0, spawnQ: [], markers: [], slot: 0, birthT: 6, treeT: 0, keepB: null, kills: 0, sel: null, build: null, popCap: 5, selU: [], cmd: null
};
const buildings = [], units = [], enemies = [], shots = [], parts = [];
let bid = 1;
const TGT = { wood: 260, stone: 140, food: 200, gold: 80 };
const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const afford = c => Object.keys(c).every(k => G.res[k] >= c[k]);
const pay = c => { for (const k in c) G.res[k] -= c[k]; };
const dmgMult = () => 1 + 0.2 * G.smith;
const groundAt = (x, z) => { const i = Math.round(x), j = Math.round(z); return inMap(i, j) ? Math.max(0, topY[i][j]) : 0; };
function turnTo(cur, target, rate) { let d = target - cur; d = Math.atan2(Math.sin(d), Math.cos(d)); return cur + clamp(d, -rate, rate); }
function nearest(list, x, z, maxD, filter) {
  let best = null, bd = maxD;
  for (const o of list) { if (o.dead || (filter && !filter(o))) continue; const d = Math.hypot(o.x - x, o.z - z); if (d < bd) { bd = d; best = o; } }
  return best;
}

/* ===================== particles, shots, hp bars ===================== */
function puff(x, y, z, color, n, spd, life, size) {
  for (let k = 0; k < n && parts.length < 260; k++) {
    const m = new THREE.Mesh(unitGeo, mat(color, true));
    const s = size * rnd(0.6, 1.3);
    m.scale.setScalar(s); m.position.set(x, y, z); scene.add(m);
    parts.push({ m, vx: rnd(-1, 1) * spd, vy: rnd(0.4, 1.4) * spd, vz: rnd(-1, 1) * spd, life, max: life, s });
  }
}
function updateParts(dt) {
  for (let k = parts.length - 1; k >= 0; k--) {
    const p = parts[k];
    p.life -= dt;
    if (p.life <= 0) { scene.remove(p.m); parts.splice(k, 1); continue; }
    p.vy -= 9 * dt;
    p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt;
    p.m.scale.setScalar(p.s * (p.life / p.max));
  }
}
const SHOT = {
  arrow: { c: 0x6b4a2f, s: [0.05, 0.05, 0.3], sp: 15 }, bolt: { c: 0xdfe4e8, s: [0.07, 0.07, 0.55], sp: 19 },
  ball: { c: 0x25282c, s: [0.22, 0.22, 0.22], sp: 11 }, bullet: { c: 0xffd36b, s: [0.08, 0.08, 0.2], sp: 26, basic: true },
  stone: { c: 0x9aa0a6, s: [0.12, 0.12, 0.12], sp: 10 }
};
function shoot(src, tgt, kindName, dmg, splash, fy) {
  const S = SHOT[kindName];
  sfx(kindName, src.x, src.z);
  const m = new THREE.Mesh(unitGeo, mat(S.c, S.basic));
  m.scale.set(...S.s); m.castShadow = true;
  const y0 = (src.y || 0) + (fy || 0.6);
  m.position.set(src.x, y0, src.z); scene.add(m);
  shots.push({ m, tgt, dmg, splash: splash || 0, sp: S.sp, team: src.team === 1 ? 1 : 0, lx: tgt.x, lz: tgt.z, kind: kindName, src });
}
function updateShots(dt) {
  for (let k = shots.length - 1; k >= 0; k--) {
    const s = shots[k];
    if (s.tgt && !s.tgt.dead) { s.lx = s.tgt.x; s.lz = s.tgt.z; }
    const ty = (s.tgt && s.tgt.y || 0) + (s.tgt && s.tgt.hgt || 0.5) * 0.7;
    const dx = s.lx - s.m.position.x, dy = ty - s.m.position.y, dz = s.lz - s.m.position.z;
    const d = Math.hypot(dx, dy, dz), stp = s.sp * dt;
    if (d <= stp + 0.12) {
      if (s.splash) {
        const foes = s.team === 0 ? enemies : units;
        for (const f of foes) if (!f.dead && Math.hypot(f.x - s.lx, f.z - s.lz) <= s.splash) hurt(f, s.dmg, s.src);
        sfx('stone', s.lx, s.lz); puff(s.lx, 0.4, s.lz, 0xffb347, 10, 2.2, 0.5, 0.2); puff(s.lx, 0.4, s.lz, 0x555555, 6, 1.6, 0.6, 0.2);
      } else if (s.tgt && !s.tgt.dead) hurt(s.tgt, s.dmg, s.src);
      scene.remove(s.m); shots.splice(k, 1); continue;
    }
    s.m.position.x += dx / d * stp; s.m.position.y += dy / d * stp; s.m.position.z += dz / d * stp;
    s.m.lookAt(s.m.position.x + dx, s.m.position.y + dy, s.m.position.z + dz);
  }
}
const barBg = new THREE.SpriteMaterial({ color: 0x0b1114, depthTest: false, transparent: true });
const barGreen = new THREE.SpriteMaterial({ color: 0x86c45e, depthTest: false, transparent: true });
const barRed = new THREE.SpriteMaterial({ color: 0xe8654f, depthTest: false, transparent: true });
const camRight = new THREE.Vector3();
function showBar(t) {
  if (t.bar) return;
  const bg = new THREE.Sprite(barBg), fg = new THREE.Sprite(t.team === 1 ? barRed : barGreen);
  bg.renderOrder = 10; fg.renderOrder = 11;
  scene.add(bg, fg);
  t.bar = { bg, fg };
}
function dropBar(t) { if (t.bar) { scene.remove(t.bar.bg, t.bar.fg); t.bar = null; } }
function updateBars() {
  const e = camera.matrixWorld.elements;
  camRight.set(e[0], e[1], e[2]);
  const each = t => {
    if (!t.bar) return;
    const w = t.barW || 0.7, r = clamp(t.hp / t.maxhp, 0.001, 1);
    const y = (t.y || 0) + (t.hgt || 1) + 0.25;
    t.bar.bg.position.set(t.x, y, t.z); t.bar.bg.scale.set(w + 0.04, 0.12, 1);
    t.bar.fg.position.set(t.x - camRight.x * w * (1 - r) / 2, y - camRight.y * w * (1 - r) / 2, t.z - camRight.z * w * (1 - r) / 2);
    t.bar.fg.scale.set(w * r, 0.08, 1);
  };
  buildings.forEach(each); units.forEach(each); enemies.forEach(each);
}

/* ===================== buildings ===================== */
function footprint(def, ai, aj) {
  const out = [];
  if (def.size === 3) { for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) out.push([ai + i, aj + j]); }
  else if (def.size === 2) { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) out.push([ai + i, aj + j]); }
  else out.push([ai, aj]);
  return out;
}
const centerOf = (def, ai, aj) => def.size === 2 ? [ai + 0.5, aj + 0.5] : [ai, aj];
let placeWhy = '';
function canPlace(type, ai, aj) {
  const def = BDEF[type];
  placeWhy = '';
  const fp = footprint(def, ai, aj);
  for (const [i, j] of fp) {
    if (i < MARGIN || j < MARGIN || i >= MAP - MARGIN || j >= MAP - MARGIN) return false;
    if (kind[i][j] !== 'g' || occ[i][j] || nodeAt[i][j]) return false;
  }
  if (!def.wall && wouldTrap(fp)) { placeWhy = 'That would trap your animals. Leave a gap to walk through'; return false; }
  return true;
}
/* Would filling these tiles cut any of your animals off from the Great Hall?  Walls do not count: your animals walk through them. */
const walkOpen = (i, j) => inMap(i, j) && kind[i][j] !== 'p' && (!occ[i][j] || occ[i][j].def.wall);
function floodFromKeep(block) {
  const seen = new Uint8Array(MAP * MAP), q = [];
  const k = G.keepB;
  if (!k) return seen;
  for (let di = -3; di <= 3; di++) for (let dj = -3; dj <= 3; dj++) {
    const i = Math.round(k.x) + di, j = Math.round(k.z) + dj;
    if (walkOpen(i, j) && !block.has(i * MAP + j) && !seen[i * MAP + j]) { seen[i * MAP + j] = 1; q.push(i * MAP + j); }
  }
  for (let h = 0; h < q.length; h++) {
    const c = q[h], ci = (c / MAP) | 0, cj = c % MAP;
    for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
      if (!di && !dj) continue;
      const i = ci + di, j = cj + dj, id = i * MAP + j;
      if (!walkOpen(i, j) || block.has(id) || seen[id]) continue;
      if (di && dj && (!walkOpen(ci + di, cj) || block.has((ci + di) * MAP + cj) || !walkOpen(ci, cj + dj) || block.has(ci * MAP + cj + dj))) continue;   // no squeezing through diagonal gaps
      seen[id] = 1; q.push(id);
    }
  }
  return seen;
}
function wouldTrap(fp) {
  const set = new Set(fp.map(([i, j]) => i * MAP + j));
  let near = false;   // quick reject: a building that touches nothing cannot enclose anything
  for (const [i, j] of fp) { for (let di = -1; di <= 1 && !near; di++) for (let dj = -1; dj <= 1; dj++) { const a = i + di, b = j + dj; if (!walkOpen(a, b) && !set.has(a * MAP + b)) { near = true; break; } } if (near) break; }
  if (!near) return false;
  const before = floodFromKeep(new Set()), after = floodFromKeep(set);
  for (const u of units) {
    if (u.dead) continue;
    const i = Math.round(u.x), j = Math.round(u.z), id = i * MAP + j;
    if (set.has(id)) continue;   // standing on the site: it gets nudged out
    if (before[id] && !after[id]) return true;
  }
  // also keep the Hall's own surroundings reachable from every side that was open
  return false;
}
function makeBuildingMesh(b) {
  if (b.group) scene.remove(b.group);
  b.turret = null;
  b.group = buildModel(b);
  b.group.userData.b = b;
  b.group.position.set(b.x, b.y, b.z);
  b.group.scale.y = b.done ? 1 : Math.max(0.06, b.progress);
  scene.add(b.group);
}
function addScaffold(b) {
  const g = new THREE.Group(), h = b.def.size / 2 - 0.05, top = b.def.size === 3 ? 1.6 : 1.1;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * h - 0.025, 0, z * h - 0.025, 0.05, top, 0.05, 0xb08850));
  box(g, -h, top * 0.55, -h, h * 2, 0.04, 0.04, 0xb08850); box(g, -h, top * 0.55, h, h * 2, 0.04, 0.04, 0xb08850);
  g.position.set(b.x, b.y, b.z);
  scene.add(g); b.scaf = g;
}
function refreshWalls(i, j) {
  for (const [di, dj] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const x = i + di, z = j + dj;
    if (inMap(x, z) && occ[x][z] && occ[x][z].def.wall) makeBuildingMesh(occ[x][z]);
  }
}
function placeBuilding(type, ai, aj, instant) {
  const def = BDEF[type];
  const b = { id: bid++, type, def, i: ai, j: aj, hp: def.hp, maxhp: def.hp, progress: instant ? 1 : 0, done: !!instant, builders: 0, cool: 0, group: null, turret: null, team: 0 };
  const [cx, cz] = centerOf(def, ai, aj);
  b.x = cx; b.z = cz; b.y = Math.max(0, topY[ai][aj]);
  b.hgt = def.size === 3 ? 2.4 : def.wall ? 0.9 : def.range ? 1.4 : def.size === 2 ? 1 : 0.9;
  b.barW = def.size === 3 ? 1.4 : def.size === 2 ? 1.1 : 0.7;
  b.cells = footprint(def, ai, aj);
  b.cells.forEach(([i, j]) => { occ[i][j] = b; });
  buildings.push(b); NAV.ver++;
  if (!instant) sfx('place', b.x, b.z);
  makeBuildingMesh(b);
  if (!b.done) addScaffold(b);
  evictFrom(b.cells);
  if (def.wall) refreshWalls(ai, aj);
  return b;
}
function finishBuilding(b) {
  b.done = true; b.progress = 1; b.group.scale.y = 1; b.builders = 0;
  if (b.scaf) { scene.remove(b.scaf); b.scaf = null; }
  puff(b.x, b.y + 0.3, b.z, 0xe9e2d0, 10, 1.6, 0.6, 0.18);
  sfx('done', b.x, b.z);
  if (b.def.wall) refreshWalls(b.i, b.j);
}
function destroyBuilding(b, silent) {
  b.dead = true;
  scene.remove(b.group); if (b.scaf) scene.remove(b.scaf);
  dropBar(b);
  b.cells.forEach(([i, j]) => { if (occ[i][j] === b) occ[i][j] = null; });
  buildings.splice(buildings.indexOf(b), 1); NAV.ver++;
  sfx('crumble', b.x, b.z);
  puff(b.x, b.y + 0.5, b.z, 0x9a8f80, 16, 2.4, 0.9, 0.22); puff(b.x, b.y + 0.5, b.z, 0x6b4a2f, 8, 2, 0.8, 0.18);
  if (b.def.wall) refreshWalls(b.i, b.j);
  if (G.sel === b) G.sel = null;
  for (const u of units) { if (u.site === b) { u.site = null; u.state = 'idle'; } if (u.rep === b) { u.rep = null; u.state = 'idle'; } }
  for (const e of enemies) { if (e.tgt === b) e.tgt = null; if (e.hitB === b) { e.hitB = null; e.blockT = 0; } }
  if (b === G.keepB) endGame(false);
  else if (!silent) toast(b.def.name + ' was destroyed', true);
}
function evictFrom(list) {
  const set = new Set(list.map(([i, j]) => i * 100 + j));
  for (const u of units.concat(enemies)) {
    if (u.dead) continue;
    if (!set.has(Math.round(u.x) * 100 + Math.round(u.z))) continue;
    outer: for (let r = 1; r < 5; r++) for (let a = 0; a < 12; a++) {
      const nx = u.x + Math.cos(a / 12 * 6.283) * r, nz = u.z + Math.sin(a / 12 * 6.283) * r;
      if (!blockedAt(nx, nz, u.team, null)) { u.x = nx; u.z = nz; break outer; }
    }
  }
}
function hurt(t, amt, src) {
  if (t.dead) return;
  if (t.shield > 0) amt *= 0.5;
  t.hp -= amt; t.hitT = 0.18; t.lastHit = G.t;
  if (src) t.lastSrc = src;
  sfx(t.cells ? 'bash' : 'hit', t.x, t.z);
  if (t.hp < t.maxhp) showBar(t);
  if (t.hp <= 0) {
    if (t.def && t.cells) destroyBuilding(t);
    else killUnit(t);
  }
}
function killUnit(u) {
  u.dead = true; u.deadT = 0; dropBar(u);
  if (u.release) u.release();
  if (u.badge) { u.model.remove(u.badge); u.badge = null; }
  sfx(u.team === 1 ? 'die' : 'dieFriend', u.x, u.z);
  if (u.team === 1) {
    G.res.gold += u.def.bounty; G.kills++;
    puff(u.x, 0.6, u.z, 0xf0b94a, 5, 1.8, 0.6, 0.12);
    const xp = Math.ceil(u.def.bounty * 0.9) + 2, s = u.lastSrc;
    if (s && s.team === 0 && s.role) grantXP(s, xp);
    else { const near = nearest(units, u.x, u.z, 8, o => o.role !== 'worker'); if (near) grantXP(near, Math.ceil(xp / 2)); }
    for (const o of units) if (!o.dead && o.role !== 'worker' && o !== s && dist2(o, u) < 5) grantXP(o, Math.ceil(xp * 0.25));
  }
  puff(u.x, 0.4, u.z, u.team === 1 ? 0x888888 : 0xffffff, 6, 1.5, 0.5, 0.12);
}


/* ===================== RPG: names, traits, levels, abilities ===================== */
const NAMES = ['Bramble', 'Maple', 'Pip', 'Clover', 'Thistle', 'Rowan', 'Juniper', 'Nutmeg', 'Willow', 'Basil', 'Hazel', 'Sorrel', 'Burdock', 'Fern', 'Acorn', 'Tansy', 'Barley', 'Quill', 'Sage', 'Moss', 'Truffle', 'Poppy', 'Fennel', 'Briar'];
const TRAITS = { swift: 'Swift (+12% speed)', sturdy: 'Sturdy (+15% health)', keen: 'Keen (+12% damage)', lucky: 'Lucky (12% double hits)' };
const MAXLVL = 10;
const xpNeed = l => Math.round(18 * Math.pow(l, 1.45));
const ABIL = {
  archer: { name: 'Volley', cd: 18, desc: 'Fires at up to 4 raiders at once for 1.4x damage.' },
  guard: { name: 'Bamboo Guard', cd: 22, desc: 'Takes half damage for 6s and draws nearby raiders.' },
  knight: { name: 'Cleave', cd: 16, desc: 'Strikes every raider within 1.8 tiles for 2x damage.' },
  musket: { name: 'Aimed Shot', cd: 18, desc: 'One shot for 4x damage.' }
};
function applyStats(u) {
  const d = u.def, L = u.lvl - 1;
  const arm = u.role === 'worker' ? 1 : 1 + 0.15 * G.tech.armor, el = u.elite ? 1.35 : 1;
  const mh = Math.round(d.hp * (1 + 0.14 * L) * (u.trait === 'sturdy' ? 1.15 : 1) * arm * el);
  u.hp = Math.min(mh, u.hp + (mh - (u.maxhp || mh))); u.maxhp = mh;
  u.dmgM = (1 + 0.1 * L) * (u.trait === 'keen' ? 1.12 : 1) * (u.elite ? 1.3 : 1);
  u.speed = d.speed * (u.trait === 'swift' ? 1.12 : 1) * (1 + 0.012 * L) * (u.elite ? 1.08 : 1);
}
const badgeMats = {};
function badgeFor(l, elite) {
  const key = (elite ? 'e' : '') + l;
  if (!badgeMats[key]) {
    let m = null;
    try {
      const c = document.createElement('canvas'); c.width = 64; c.height = 32;
      const x = c.getContext('2d');
      if (x) {
        x.fillStyle = 'rgba(10,16,20,.82)'; x.fillRect(0, 0, 64, 32);
        x.fillStyle = elite ? '#ffe27a' : '#f0b94a'; x.font = 'bold 22px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText((elite ? '♛' : '★') + l, 32, 17);
        const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
        m = new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true });
      }
    } catch (e) { m = null; }
    badgeMats[key] = m || new THREE.SpriteMaterial({ color: elite ? 0xffe27a : 0xf0b94a, depthTest: false, transparent: true });
  }
  return badgeMats[key];
}
function setBadge(u) {
  if (u.lvl < 2 || u.dead) return;
  if (!u.badge) { u.badge = new THREE.Sprite(badgeFor(u.lvl, u.elite)); u.badge.renderOrder = 12; u.badge.scale.set(0.44, 0.22, 1); u.badge.position.set(0, (u.hgt || 0.8) + 0.55, 0); u.model.add(u.badge); }
  else u.badge.material = badgeFor(u.lvl, u.elite);
}
function grantXP(u, n) {
  if (!u || u.dead || u.team !== 0 || u.lvl >= MAXLVL) return;
  u.xp += n;
  while (u.lvl < MAXLVL && u.xp >= xpNeed(u.lvl)) {
    u.xp -= xpNeed(u.lvl); u.lvl++;
    applyStats(u); u.hp = u.maxhp; dropBar(u);
    setBadge(u);
    puff(u.x, u.y + 0.9, u.z, 0xf0b94a, 8, 1.6, 0.7, 0.1);
    sfx('level', u.x, u.z);
    if (u.lvl === 3 && ABIL[u.role]) toast(`${u.name} the ${u.def.name} reached level 3 and learned ${ABIL[u.role].name}`);
    else if (u.lvl === MAXLVL) toast(`${u.name} the ${u.def.name} reached the top level`);
  }
  if (u.lvl >= MAXLVL) u.xp = 0;
}
function canAbility(u) { return !!ABIL[u.role] && u.lvl >= 3 && u.abCd <= 0; }
function useAbility(u) {
  if (!canAbility(u)) return false;
  const d = u.def, dmg = d.dmg * dmgMult() * u.dmgM;
  let used = false;
  if (u.role === 'archer' || u.role === 'musket') {
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= d.range + 1).sort((a, b) => dist2(u, a) - dist2(u, b));
    if (u.role === 'archer') foes.slice(0, 4).forEach(e => { shoot(u, e, 'arrow', dmg * 1.4, 0, 0.5); used = true; });
    else if (foes[0]) { shoot(u, foes[0], 'bullet', dmg * 4, 0, 0.5); used = true; }
  } else if (u.role === 'guard') {
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 6);
    if (foes.length) { u.shield = 6; foes.forEach(e => { e.taunt = { u, until: G.t + 5 }; e.tgt = u; }); puff(u.x, 0.5, u.z, 0x9fd0ff, 10, 1.6, 0.6, 0.12); used = true; }
  } else if (u.role === 'knight') {
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 1.8);
    if (foes.length) { foes.forEach(e => hurt(e, dmg * 2, u)); puff(u.x, 0.5, u.z, 0xffffff, 12, 2.4, 0.4, 0.12); used = true; }
  }
  if (used) { u.abCd = ABIL[u.role].cd; u.atk = 0.25; sfx('ability', u.x, u.z); }
  return used;
}
function unitDmg(u) { return u.def.dmg * dmgMult() * u.dmgM * (u.trait === 'lucky' && Math.random() < 0.12 ? 2 : 1); }

/* ===================== healing ===================== */
function healUnit(u, amt, fx) {
  if (u.hp >= u.maxhp) return;
  u.hp = Math.min(u.maxhp, u.hp + amt);
  if (fx) { u.healFx = (u.healFx || 0) - 1; if (u.healFx <= 0) { u.healFx = 14; puff(u.x, u.y + 0.7, u.z, 0x7be07b, 2, 0.8, 0.5, 0.07); sfx('heal', u.x, u.z); } }
  if (u.hp >= u.maxhp - 0.01) dropBar(u);
}
function healSystem(dt) {
  const huts = buildings.filter(b => b.type === 'infirmary' && b.done), kp = G.keepB;
  for (const u of units) {
    if (u.dead || u.hp >= u.maxhp) continue;
    let rate = 0, fx = false;
    const calm = G.t - (u.lastHit || -99) > 6;
    if (calm) { rate += u.maxhp * 0.004; if (kp && dist2(u, kp) < 7) rate += u.maxhp * 0.012; }
    if (kp && dist2(u, kp) < 4.5) { rate += 2; fx = true; }
    for (const h of huts) if (dist2(u, h) <= h.def.heal) { rate += 3; fx = true; break; }
    if (rate > 0) healUnit(u, rate * dt, fx);
  }
  for (const b of buildings) {
    if (!b.done || b.hp >= b.maxhp) continue;
    for (const h of huts) if (dist2(b, h) <= h.def.heal + 0.5) { b.hp = Math.min(b.maxhp, b.hp + 2 * dt); break; }
    if (b.hp >= b.maxhp - 0.01) dropBar(b);
  }
}

/* ===================== spots, orders, stuck rescue ===================== */
function validSpot(x, z) {
  x = clamp(x, MARGIN, MAP - 1 - MARGIN); z = clamp(z, MARGIN, MAP - 1 - MARGIN);
  for (let r = 0; r <= 6; r += 0.75) {
    const n = r === 0 ? 1 : Math.round(r * 5);
    for (let a = 0; a < n; a++) {
      const nx = x + Math.cos(a / n * 6.283) * r, nz = z + Math.sin(a / n * 6.283) * r, i = Math.round(nx), j = Math.round(nz);
      if (inMap(i, j) && kind[i][j] !== 'p' && !occ[i][j]) return [nx, nz];
    }
  }
  return [KX, KZ + 2.4];
}
function unstick(u) {
  u.path = null; u.stuckT = 0; u.repathT = 0; u.noLos = G.t + 2; u.nudges = (u.nudges || 0) + 1;
  const sp = validSpot(u.x + rnd(-1.2, 1.2), u.z + rnd(-1.2, 1.2));
  u.x = sp[0]; u.z = sp[1];
  if (u.role === 'worker' && u.nudges >= 2) { if (u.node) { u.badNode = u.node; u.badUntil = G.t + 30; } releaseWorker(u); u.state = 'idle'; u.wait = 0.5; u.nudges = 0; }
  if (u.role !== 'worker' && u.team === 0) { u.tgt = null; u.giveUp = G.t + 3; if (u.order && u.order.type === 'move') u.order = null; }
}
function watchdog(u, dt) {
  if (u.mv === undefined || G.t - u.mv > 0.3) { u.wdT = 0; return; }
  if (!u.wdT) { u.wdT = 0.0001; u.wdX = u.x; u.wdZ = u.z; return; }
  u.wdT += dt;
  if (u.wdT >= 1.5) {
    const moved = Math.hypot(u.x - u.wdX, u.z - u.wdZ);
    u.wdT = 0;
    if (moved < 0.25) unstick(u); else u.nudges = 0;
  }
}
function moveMark(x, z, red) { puff(x, 0.15, z, red ? 0xe8654f : 0xf0b94a, 6, 0.9, 0.5, 0.08); }
function orderMove(list, x, z, amove) {
  const n = list.length, cols = Math.ceil(Math.sqrt(n));
  list.forEach((u, k) => {
    const ox = (k % cols - (cols - 1) / 2) * 0.85, oz = (Math.floor(k / cols) - (Math.ceil(n / cols) - 1) / 2) * 0.85;
    const sp = validSpot(x + ox, z + oz);
    if (u.role === 'worker') { releaseWorker(u); u.pref = null; u.state = 'goto'; u.gx = sp[0]; u.gz = sp[1]; }
    else { u.order = { type: amove ? 'amove' : 'move', x: sp[0], z: sp[1] }; u.hold = false; u.tgt = null; u.giveUp = 0; }
  });
  moveMark(x, z, amove); sfx('click');
}
function orderAttack(list, e) {
  list.forEach(u => { if (u.role !== 'worker') { u.order = { type: 'attack', tgt: e }; u.hold = false; } });
  moveMark(e.x, e.z, true); sfx('click');
}
function orderWork(list, target) {
  const workers = list.filter(u => u.role === 'worker');
  if (!workers.length) return false;
  for (const u of workers) {
    releaseWorker(u);
    if (target.amt !== undefined) { target.workers++; u.node = target; u.pref = target.type; u.state = 'toNode'; }
    else if (!target.done) { target.builders++; u.site = target; u.state = 'toSite'; }
    else { target.repairers = (target.repairers || 0) + 1; u.rep = target; u.state = 'toRepair'; }
  }
  moveMark(target.x, target.z); sfx('click');
  return true;
}
function orderHold(list) { list.forEach(u => { if (u.role !== 'worker') { u.order = null; u.hold = true; u.tgt = null; } }); sfx('click'); }
function orderStop(list, back) {
  list.forEach(u => {
    if (u.role === 'worker') { releaseWorker(u); u.pref = null; u.state = 'idle'; u.wait = 0; }
    else { u.order = null; u.hold = false; u.tgt = null; if (back) u.home = null; }
  });
  sfx('click');
}

/* ===================== movement ===================== */
function blockedAt(x, z, team, ignoreB) {
  const i = Math.round(x), j = Math.round(z);
  if (!inMap(i, j)) return true;
  if (kind[i][j] === 'p') return true;
  const b = occ[i][j];
  if (b) { if (b === ignoreB) return false; if (team === 0 && b.def.wall) return false; return b; }
  return false;
}
const TRIES = [0, 0.6, -0.6, 1.2, -1.2, 1.9, -1.9];
function stepToward(u, tx, tz, dt, ignoreB) {
  const dx = tx - u.x, dz = tz - u.z, d = Math.hypot(dx, dz);
  if (d < 0.001) return { d, blocked: false, moved: false };
  const sp = Math.min(u.speed * dt, d), ang = Math.atan2(dx, dz);
  let direct = false;
  for (let k = 0; k < TRIES.length; k++) {
    const aa = ang + TRIES[k], nx = u.x + Math.sin(aa) * sp, nz = u.z + Math.cos(aa) * sp;
    const bl = blockedAt(nx, nz, u.team, ignoreB);
    if (!bl) { u.x = nx; u.z = nz; u.face = aa; u.moved = true; return { d, blocked: direct, moved: true }; }
    if (k === 0) direct = bl;
  }
  // slide along an axis when the diagonal is pinched between tiles
  const sx = Math.sign(dx) * sp, sz = Math.sign(dz) * sp;
  const opts = Math.abs(dx) > Math.abs(dz) ? [[sx, 0], [0, sz]] : [[0, sz], [sx, 0]];
  for (const [mx, mz] of opts) {
    if ((mx || mz) && !blockedAt(u.x + mx, u.z + mz, u.team, ignoreB)) { u.x += mx; u.z += mz; u.face = Math.atan2(mx, mz); u.moved = true; return { d, blocked: direct, moved: true }; }
  }
  return { d, blocked: direct, moved: false };
}
/* ===================== pathfinding (A* on the tile grid) ===================== */
// Friendly animals walk through their own walls and around everything else.
// Raiders treat walls and buildings as passable at a high cost, so they route around
// when the detour is short and breach the cheapest point when it is not.
const NAV = { ver: 0, budget: 8 };
const NN = MAP * MAP;
const navG = new Float32Array(NN), navPar = new Int32Array(NN), navSeen = new Uint32Array(NN), navClosed = new Uint32Array(NN);
let navStamp = 0;
const heapI = [], heapF = [];
const DI = [1, -1, 0, 0, 1, 1, -1, -1], DJ = [0, 0, 1, -1, 1, -1, 1, -1];
function hPush(i, f) {
  let k = heapI.length; heapI.push(i); heapF.push(f);
  while (k > 0) { const p = (k - 1) >> 1; if (heapF[p] <= f) break; heapI[k] = heapI[p]; heapF[k] = heapF[p]; k = p; }
  heapI[k] = i; heapF[k] = f;
}
function hPop() {
  const top = heapI[0], last = heapI.pop(), lf = heapF.pop(), n = heapI.length;
  if (n) {
    let k = 0;
    for (;;) {
      let c = 2 * k + 1;
      if (c >= n) break;
      if (c + 1 < n && heapF[c + 1] < heapF[c]) c++;
      if (heapF[c] >= lf) break;
      heapI[k] = heapI[c]; heapF[k] = heapF[c]; k = c;
    }
    heapI[k] = last; heapF[k] = lf;
  }
  return top;
}
function tileCost(team, i, j, ignoreB) {
  if (!inMap(i, j) || kind[i][j] === 'p') return Infinity;
  const b = occ[i][j];
  if (!b || b === ignoreB) return 0;
  if (team === 0) return b.def.wall ? 0 : Infinity;
  return b.def.wall ? 9 : 14;
}
const cornerBlocked = (i, j, ignoreB) => !inMap(i, j) || kind[i][j] === 'p' || (occ[i][j] && occ[i][j] !== ignoreB);
function findPath(team, sx, sz, tx, tz, ignoreB) {
  const si = clamp(Math.round(sx), 0, MAP - 1), sj = clamp(Math.round(sz), 0, MAP - 1);
  const ti = clamp(Math.round(tx), 0, MAP - 1), tj = clamp(Math.round(tz), 0, MAP - 1);
  let gi = ti, gj = tj;
  if (tileCost(team, gi, gj, ignoreB) === Infinity) {
    let found = false;
    for (let r = 1; r <= 4 && !found; r++) {
      for (let di = -r; di <= r && !found; di++) for (let dj = -r; dj <= r; dj++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
        if (tileCost(team, ti + di, tj + dj, ignoreB) !== Infinity) { gi = ti + di; gj = tj + dj; found = true; break; }
      }
    }
    if (!found) return null;
  }
  const goal = gi * MAP + gj, start = si * MAP + sj;
  if (goal === start) return [[tx, tz]];
  navStamp++; heapI.length = 0; heapF.length = 0;
  navG[start] = 0; navSeen[start] = navStamp; navPar[start] = -1;
  hPush(start, 0);
  let reached = false;
  while (heapI.length) {
    const n = hPop();
    if (navClosed[n] === navStamp) continue;
    navClosed[n] = navStamp;
    if (n === goal) { reached = true; break; }
    const ci = (n / MAP) | 0, cj = n % MAP;
    for (let d = 0; d < 8; d++) {
      const ni = ci + DI[d], nj = cj + DJ[d];
      const c = tileCost(team, ni, nj, ignoreB);
      if (c === Infinity) continue;
      if (d >= 4 && (cornerBlocked(ci + DI[d], cj, ignoreB) || cornerBlocked(ci, cj + DJ[d], ignoreB))) continue;
      const id = ni * MAP + nj;
      if (navClosed[id] === navStamp) continue;
      const ng = navG[n] + (d >= 4 ? 1.414 : 1) + c;
      if (navSeen[id] !== navStamp || ng < navG[id]) {
        navSeen[id] = navStamp; navG[id] = ng; navPar[id] = n;
        const dx = Math.abs(ni - gi), dz = Math.abs(nj - gj);
        hPush(id, ng + Math.max(dx, dz) + 0.414 * Math.min(dx, dz));
      }
    }
  }
  if (!reached) return null;
  const out = [];
  for (let n = goal; n !== start && n >= 0; n = navPar[n]) out.push([(n / MAP) | 0, n % MAP]);
  out.reverse();
  if (gi === ti && gj === tj && out.length) out[out.length - 1] = [tx, tz];
  return out;
}
function losClear(team, x0, z0, x1, z1, ignoreB) {
  const len = Math.hypot(x1 - x0, z1 - z0), n = Math.ceil(len / 0.25);
  const px = len > 0 ? -(z1 - z0) / len * 0.27 : 0, pz = len > 0 ? (x1 - x0) / len * 0.27 : 0;
  for (let k = 1; k <= n; k++) {
    const t = k / n, x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
    if (blockedAt(x, z, team, ignoreB) || blockedAt(x + px, z + pz, team, ignoreB) || blockedAt(x - px, z - pz, team, ignoreB)) return false;
  }
  return true;
}
// Walk toward (tx,tz) by the best route. Returns like stepToward, plus `breach` when a raider reaches a wall or building on its route.
function moveTo(u, tx, tz, dt, ignoreB) {
  const d = Math.hypot(tx - u.x, tz - u.z);
  if (d < 1.2) u.mvNear = G.t; else u.mv = G.t;
  if (d < 0.001) return { d, blocked: false, moved: false };
  if (d < 0.6 || (G.t > (u.noLos || 0) && losClear(u.team, u.x, u.z, tx, tz, ignoreB))) {
    u.path = null;
    const r = stepToward(u, tx, tz, dt, ignoreB);
    u.stuckT = r.moved ? 0 : (u.stuckT || 0) + dt;
    if (d >= 0.6 && u.stuckT > 0.4) { u.noLos = G.t + 2; u.stuckT = 0.7; u.repathT = 0; }
    return r;
  }
  const key = Math.round(tx) + ',' + Math.round(tz);
  u.repathT = (u.repathT || 0) - dt;
  const stale = !u.path || u.pathKey !== key || u.pathVer !== NAV.ver || (u.stuckT || 0) > 0.6;
  if (stale && u.repathT <= 0 && NAV.budget > 0) {
    NAV.budget--;
    u.repathT = 0.4 + Math.random() * 0.3; u.stuckT = 0;
    u.path = findPath(u.team, u.x, u.z, tx, tz, ignoreB); u.unreach = !u.path;
    u.pathKey = key; u.pathVer = NAV.ver; u.pi = 0;
  }
  const P = u.path;
  if (!P || !P.length) {
    if (u.team === 0 && u.unreach) return { d, blocked: false, moved: false, unreachable: true };
    const r = stepToward(u, tx, tz, dt, ignoreB);
    u.stuckT = r.moved ? 0 : (u.stuckT || 0) + dt;
    return r;
  }
  while (u.pi < P.length - 1 && Math.hypot(P[u.pi][0] - u.x, P[u.pi][1] - u.z) < 0.4) u.pi++;
  for (let j = Math.min(P.length - 1, u.pi + 6); j > u.pi; j--) {
    if (losClear(u.team, u.x, u.z, P[j][0], P[j][1], ignoreB)) { u.pi = j; break; }
  }
  const wp = P[u.pi];
  if (u.team === 1) {
    const bi = Math.round(wp[0]), bj = Math.round(wp[1]), ob = inMap(bi, bj) && occ[bi][bj];
    if (ob && ob !== ignoreB && Math.hypot(wp[0] - u.x, wp[1] - u.z) < 1.4) return { d, blocked: ob, breach: ob, moved: false };
  }
  const r = stepToward(u, wp[0], wp[1], dt, ignoreB);
  u.stuckT = r.moved ? 0 : (u.stuckT || 0) + dt;
  return r;
}

function animateUnit(u, dt) {
  const m = u.model, ud = m.userData;
  u.y += (groundAt(u.x, u.z) - u.y) * Math.min(1, dt * 10);
  m.position.set(u.x, u.y, u.z);
  u.vis = turnTo(u.vis === undefined ? u.face : u.vis, u.face, dt * 10);
  m.rotation.y = u.vis;
  if (u.moved) u.walk += dt * u.speed * 4.2;
  ud.legs.forEach((p, i) => { p.rotation.x = u.moved ? Math.sin(u.walk) * 0.7 * (i === 0 || i === 3 ? 1 : -1) : p.rotation.x * 0.8; });
  if (ud.arms) ud.arms.forEach((p, i) => { p.rotation.x = u.moved ? Math.sin(u.walk) * 0.6 * (i === 0 ? -1 : 1) : p.rotation.x * 0.8; });
  const bob = u.moved ? Math.abs(Math.sin(u.walk)) * 0.05 : (u.state === 'gather' || u.state === 'build') ? Math.abs(Math.sin(G.t * 9)) * 0.07 : 0;
  m.position.y = u.y + bob;
  if (u.atk > 0) { u.atk -= dt; ud.body.position.z = Math.sin(clamp(u.atk / 0.25, 0, 1) * Math.PI) * 0.18; } else ud.body.position.z = 0;
  if (u.hitT > 0) { u.hitT -= dt; m.scale.set(1 + u.hitT, 1 - u.hitT * 1.4, 1 + u.hitT); } else m.scale.set(1, 1, 1);
  u.moved = false;
}

/* ===================== workers ===================== */
function releaseWorker(u) {
  if (u.node) { u.node.workers = Math.max(0, u.node.workers - 1); u.node = null; }
  if (u.site) { u.site.builders = Math.max(0, u.site.builders - 1); u.site = null; }
  if (u.rep) { u.rep.repairers = Math.max(0, (u.rep.repairers || 1) - 1); u.rep = null; }
}
function findSite(u) {
  let best = null, bd = 40;
  for (const b of buildings) {
    if (b.done || b.builders >= (b.def.size >= 2 ? 3 : 2) || (u.badSite === b && G.t < u.badUntil)) continue;
    const d = Math.hypot(b.x - u.x, b.z - u.z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function findRepair(u) {
  if (enemies.some(e => !e.dead)) return null;
  let best = null, bd = 45;
  for (const b of buildings) {
    if (!b.done || b.hp >= b.maxhp * 0.9 || (b.repairers || 0) >= 2) continue;
    const d = Math.hypot(b.x - u.x, b.z - u.z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function findDrop(x, z, type) {
  let best = null, bd = 1e9;
  for (const b of buildings) {
    if (!b.done || !b.def.drop || !b.def.drop.includes(type)) continue;
    const d = Math.hypot(b.x - x, b.z - z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function pickNode(u) {
  const order = RES.slice().sort((a, b) => G.res[a] / TGT[a] - G.res[b] / TGT[b]);
  if (u.pref) { order.splice(order.indexOf(u.pref), 1); order.unshift(u.pref); }
  for (const type of order) {
    let best = null, bs = 1e9;
    for (const n of nodes) {
      if (n.type !== type || n.amt <= 0 || n.workers >= 3 || (n === u.badNode && G.t < u.badUntil)) continue;
      const dr = findDrop(n.x, n.z, type);
      const sc = Math.hypot(n.x - u.x, n.z - u.z) + (dr ? Math.hypot(dr.x - n.x, dr.z - n.z) : 30);
      if (sc < bs) { bs = sc; best = n; }
    }
    if (best && bs < 60) { best.workers++; return best; }
  }
  return null;
}
function updateWorker(u, dt) {
  const scare = nearest(enemies, u.x, u.z, 3.5);
  if (scare) { if (u.state !== 'flee') { releaseWorker(u); u.state = 'flee'; } u.fleeT = 2.5; }
  if (u.state === 'flee') {
    u.fleeT -= dt;
    { const fx = KX + ((u.slot % 7) - 3) * 0.75, fz = KZ + 2.7 + (Math.floor(u.slot / 7) % 3) * 0.75;
      if (Math.hypot(fx - u.x, fz - u.z) > 0.9) moveTo(u, fx, fz, dt * 1.25); }
    if (u.fleeT <= 0 && !scare) u.state = 'idle';
    return;
  }
  switch (u.state) {
    case 'idle':
      u.wait -= dt;
      if (u.wait > 0) { if (u.wp && Math.hypot(u.wp[0] - u.x, u.wp[1] - u.z) > 0.6 && (u.stuckT || 0) < 1.2) moveTo(u, u.wp[0], u.wp[1], dt * 0.6); break; }
      u.wait = 0.4; u.wp = null;
      if (u.carry > 0) { u.state = 'toDrop'; break; }
      { const s = findSite(u); if (s) { s.builders++; u.site = s; u.state = 'toSite'; break; } }
      { const r = findRepair(u); if (r) { r.repairers = (r.repairers || 0) + 1; u.rep = r; u.state = 'toRepair'; break; } }
      { const n = pickNode(u); if (n) { u.node = n; u.state = 'toNode'; break; } }
      u.wait = 1.6; u.wp = validSpot(KX + rnd(-3, 3), KZ + rnd(2.2, 4));
      break;
    case 'toNode': {
      const n = u.node;
      if (!n || n.amt <= 0) { releaseWorker(u); u.state = 'idle'; break; }
      u.think += dt;
      if (u.think > 1) { u.think = 0; const s = findSite(u); if (s) { releaseWorker(u); s.builders++; u.site = s; u.state = 'toSite'; break; } }
      if (Math.hypot(n.x - u.x, n.z - u.z) > 0.75) { const r = moveTo(u, n.x, n.z, dt); if (r.unreachable) { u.badNode = n; u.badUntil = G.t + 30; releaseWorker(u); u.state = 'idle'; u.wait = 0.5; } }
      else { u.state = 'gather'; u.gt = 0; }
      break;
    }
    case 'gather': {
      const n = u.node;
      if (!n || n.amt <= 0) { releaseWorker(u); u.state = u.carry > 0 ? 'toDrop' : 'idle'; break; }
      u.face = Math.atan2(n.x - u.x, n.z - u.z);
      u.gt += dt;
      if (u.gt >= 0.8 / (1 + 0.07 * (u.lvl - 1))) {
        u.gt = 0; n.amt--; u.carry++; u.carryType = n.type;
        if (n.type === 'wood') sfx('chop', n.x, n.z); else if (n.type !== 'food') sfx('clink', n.x, n.z);
        puff(n.x, 0.4, n.z, n.type === 'wood' ? 0x6b4a2f : n.type === 'gold' ? 0xf2c14e : n.type === 'food' ? 0xd9344a : 0xb1b7bd, 2, 1.2, 0.35, 0.07);
        if (n.amt <= 0) { releaseWorker(u); removeNode(n); u.state = 'toDrop'; break; }
      }
      if (u.carry >= carryCap(u)) { releaseWorker(u); u.state = 'toDrop'; }
      break;
    }
    case 'toDrop': {
      const b = findDrop(u.x, u.z, u.carryType);
      if (!b) { u.state = 'idle'; u.wait = 2; break; }
      if (Math.hypot(b.x - u.x, b.z - u.z) > b.def.r + 0.45) { const r = moveTo(u, b.x, b.z, dt, b); if (r.unreachable) { u.state = 'idle'; u.wait = 2; } }
      else {
        const amt = Math.round(u.carry * (b.type === 'keep' ? 1 : 1.25));
        G.res[u.carryType] += amt; u.carry = 0; grantXP(u, 2); sfx('coin', b.x, b.z);
        puff(b.x, b.y + 0.8, b.z, 0xf0b94a, 3, 1, 0.4, 0.08);
        u.state = 'idle'; u.wait = 0;
      }
      break;
    }
    case 'toSite': {
      const s = u.site;
      if (!s || s.done) { releaseWorker(u); u.state = 'idle'; break; }
      if (Math.hypot(s.x - u.x, s.z - u.z) > s.def.r + 0.5) { const r = moveTo(u, s.x, s.z, dt, s); if (r.unreachable) { u.badSite = s; u.badUntil = G.t + 20; releaseWorker(u); u.state = 'idle'; u.wait = 0.5; } }
      else u.state = 'build';
      break;
    }
    case 'build': {
      const s = u.site;
      if (!s || s.done) { releaseWorker(u); u.state = 'idle'; break; }
      u.face = Math.atan2(s.x - u.x, s.z - u.z);
      s.progress = Math.min(1, s.progress + dt * (1 + 0.06 * (u.lvl - 1)) / s.def.time);
      if (Math.random() < dt * 2.2) sfx('hammer', s.x, s.z);
      s.group.scale.y = Math.max(0.06, s.progress);
      if (Math.random() < dt * 3) puff(s.x + rnd(-0.3, 0.3), s.y + 0.2, s.z + rnd(-0.3, 0.3), 0xd9c9a0, 1, 1, 0.4, 0.07);
      if (s.progress >= 1) { finishBuilding(s); grantXP(u, 4); u.site = null; u.state = 'idle'; u.wait = 0; }
      break;
    }
    case 'toRepair': {
      const r = u.rep;
      if (!r || r.dead || r.hp >= r.maxhp) { releaseWorker(u); u.state = 'idle'; break; }
      if (Math.hypot(r.x - u.x, r.z - u.z) > r.def.r + 0.55) { const m = moveTo(u, r.x, r.z, dt, r); if (m.unreachable) { releaseWorker(u); u.state = 'idle'; u.wait = 2; } }
      else u.state = 'repair';
      break;
    }
    case 'repair': {
      const r = u.rep;
      if (!r || r.dead || r.hp >= r.maxhp) { if (r && r.hp >= r.maxhp) { dropBar(r); grantXP(u, 3); } releaseWorker(u); u.state = 'idle'; u.wait = 0; break; }
      u.face = Math.atan2(r.x - u.x, r.z - u.z);
      r.hp = Math.min(r.maxhp, r.hp + r.maxhp * 0.05 * (1 + 0.06 * (u.lvl - 1)) * dt);
      if (Math.random() < dt * 2) { puff(r.x + rnd(-0.3, 0.3), r.y + 0.4, r.z + rnd(-0.3, 0.3), 0x7be07b, 1, 0.8, 0.4, 0.06); sfx('hammer', r.x, r.z); }
      break;
    }
    case 'goto': {
      const r = moveTo(u, u.gx, u.gz, dt);
      if (Math.hypot(u.gx - u.x, u.gz - u.z) < 0.5 || r.unreachable || u.stuckT > 1.2) { u.state = 'idle'; u.wait = 3; u.stuckT = 0; }
      break;
    }
  }
  if (u.carry > 0 && u.model.userData.carry) {
    u.model.userData.carry.visible = true;
    u.model.userData.carry.material = mat({ wood: 0x8b5e34, stone: 0xb1b7bd, food: 0xd9344a, gold: 0xf2c14e }[u.carryType] || 0xffffff);
  } else if (u.model.userData.carry) u.model.userData.carry.visible = false;
}

/* ===================== units ===================== */
function makeUnit(role, x, z, spOverride) {
  const d = UDEF[role];
  const sp = spOverride || (role === 'worker' ? pick(['rabbit', 'fox', 'panda', 'bear']) : d.sp);
  const model = makeUnitModel(role, sp, d.scale || 1);
  const u = {
    team: 0, role, sp, def: d, x, z, y: groundAt(x, z), hp: d.hp, maxhp: d.hp, speed: d.speed, model, state: 'idle', face: rnd(0, 6.28),
    walk: 0, atk: 0, cd: rnd(0, 0.5), carry: 0, carryType: null, slot: G.slot++, hgt: 0.8, barW: 0.55, dead: false, wait: 0, think: 0, hitT: 0, moved: false,
    name: pick(NAMES), lvl: 1, xp: 0, dmgM: 1, abCd: 0, shield: 0, order: null, hold: false, home: null, trait: role === 'worker' ? null : pick(Object.keys(TRAITS)), giveUp: 0
  };
  if (u.trait) applyStats(u);
  u.release = () => releaseWorker(u);
  model.userData.u = u;
  model.position.set(x, u.y, z);
  scene.add(model);
  units.push(u);
  return u;
}
function rallyPos(slot) {
  const ang = G.threat + ((slot % 9) - 4) * 0.26, r = 5.5 + (Math.floor(slot / 9) % 3) * 0.9;
  return [KX + Math.cos(ang) * r, KZ + Math.sin(ang) * r];
}
function engage(u, t, dt, forced) {
  const d = u.def, dd = dist2(u, t);
  if (dd > d.range * 0.95) {
    const r = moveTo(u, t.x, t.z, dt);
    if (r.unreachable) { if (forced) u.order = null; else { u.tgt = null; u.skip = t; u.skipT = G.t + 3; } }
    return;
  }
  u.face = Math.atan2(t.x - u.x, t.z - u.z);
  if (u.abCd <= 0 && u.lvl >= 3) useAbility(u);
  if (u.cd <= 0) {
    u.cd = d.rate; u.atk = 0.25;
    if (d.shot) shoot(u, t, d.shot, unitDmg(u), 0, 0.5);
    else hurt(t, unitDmg(u), u);
  }
}
function updateSoldier(u, dt) {
  u.cd -= dt; u.abCd -= dt; if (u.shield > 0) u.shield -= dt;
  const d = u.def, o = u.order;
  if (o && o.type === 'attack') {
    if (!o.tgt || o.tgt.dead) u.order = null; else { engage(u, o.tgt, dt, true); return; }
  }
  if (o && o.type === 'move') {
    if (Math.hypot(o.x - u.x, o.z - u.z) < 0.5 || (u.stuckT || 0) > 1.2) { u.home = [o.x, o.z]; u.order = null; u.stuckT = 0; }
    else { const r = moveTo(u, o.x, o.z, dt); if (r.unreachable) u.order = null; return; }
  }
  const amove = u.order && u.order.type === 'amove';
  let t = u.tgt;
  if (!t || t.dead || dist2(u, t) > (u.hold ? d.range + 1 : 13)) {
    t = u.tgt = nearest(enemies, u.x, u.z, u.hold ? d.range + 0.3 : 10, e => (e !== u.skip || G.t > u.skipT) && (u.hold || amove || Math.hypot(e.x - KX, e.z - KZ) < 22));
  }
  if (t) { engage(u, t, dt, false); return; }
  if (amove) {
    const o2 = u.order;
    if (Math.hypot(o2.x - u.x, o2.z - u.z) < 0.5 || (u.stuckT || 0) > 1.2) { u.home = [o2.x, o2.z]; u.order = null; u.stuckT = 0; }
    else { const r = moveTo(u, o2.x, o2.z, dt); if (r.unreachable) u.order = null; }
    return;
  }
  if (u.hold || u.giveUp > G.t) return;
  const sp = u.home || validSpot(...rallyPos(u.slot));
  if (Math.hypot(sp[0] - u.x, sp[1] - u.z) > 1.0) {
    const r = moveTo(u, sp[0], sp[1], dt);
    if (r.unreachable || (u.stuckT || 0) > 1.5) { u.giveUp = G.t + 4; u.stuckT = 0; if (u.home) u.home = null; }
  }
}

/* ===================== enemies ===================== */
function makeEnemy(kindName, x, z, mult) {
  const d = EDEF[kindName];
  const model = makeUnitModel(null, d.sp, d.scale);
  const hp = d.hp * mult;
  const e = {
    team: 1, kind: kindName, def: d, x, z, y: groundAt(x, z), hp, maxhp: hp, dmg: d.dmg * (1 + (mult - 1) * 0.6), speed: d.speed * rnd(0.92, 1.08), model,
    face: 0, walk: rnd(0, 6), atk: 0, cd: rnd(0, 1), hgt: 0.8 * d.scale, barW: 0.5 * d.scale + 0.2, dead: false, retarget: 0, blockT: 0, hitT: 0, moved: false
  };
  model.userData.u = e;
  model.position.set(x, e.y, z);
  scene.add(model);
  enemies.push(e);
  return e;
}
function chooseTarget(e) {
  if (e.taunt && !e.taunt.u.dead && G.t < e.taunt.until) return e.taunt.u;
  if (e.def.siege) {
    const b = nearest(buildings, e.x, e.z, 14);
    return b || G.keepB;
  }
  const u = nearest(units, e.x, e.z, e.def.range > 2 ? 6 : 4.5);
  return u || G.keepB;
}
function updateEnemy(e, dt) {
  e.cd -= dt; e.retarget -= dt;
  if (e.retarget <= 0 || !e.tgt || e.tgt.dead) { e.retarget = 0.7; e.tgt = chooseTarget(e); }
  const d = e.def;
  let t = e.tgt;
  if (e.hitB && e.hitB.dead) { e.hitB = null; e.blockT = 0; }
  const reachOf = o => (o.cells ? o.def.r : 0.3) + d.range;
  if (e.hitB && Math.hypot(e.hitB.x - e.x, e.hitB.z - e.z) < e.hitB.def.r + 1.2) t = e.hitB;
  else if (e.hitB) { e.hitB = null; e.blockT = 0; }
  if (!t) return;
  const dd = Math.hypot(t.x - e.x, t.z - e.z);
  if (dd > reachOf(t)) {
    const r = moveTo(e, t.x, t.z, dt, t.cells ? t : null);
    if (r.breach) { e.hitB = r.breach; }
    else if (r.blocked && r.blocked !== true && r.blocked.cells) { e.blockT += dt; if (e.blockT > 0.7) e.hitB = r.blocked; }
    else if (r.moved && !r.blocked) e.blockT = 0;
  } else {
    e.face = Math.atan2(t.x - e.x, t.z - e.z);
    if (e.cd <= 0) {
      e.cd = d.rate; e.atk = 0.25;
      if (d.shot) shoot(e, t, d.shot, e.dmg, 0, 0.5);
      else hurt(t, e.dmg * (d.siege && t.cells ? 2.5 : 1), e);
    }
  }
}

/* ===================== towers, income, growth ===================== */
function updateTower(b, dt) {
  b.cool -= dt;
  const def = b.def;
  if (b.cool > 0) return;
  const t = nearest(enemies, b.x, b.z, def.range);
  if (!t) { b.cool = 0.2; return; }
  b.cool = def.rate;
  if (b.turret) b.turret.rotation.y = Math.atan2(t.x - b.x, t.z - b.z);
  shoot(b, t, def.shot, def.dmg * (1 + 0.3 * G.age) * dmgMult(), def.splash, b.y + (b.type === 'tower' ? 1.2 : 1.3) - b.y);
}

/* ===================== waves ===================== */
function planWave(n) {
  const cost = { wolf: 1, boar: 3, raccoon: 2, badger: 5 };
  const opts = ['wolf'];
  if (n >= 2) opts.push('boar'); if (n >= 3) opts.push('raccoon'); if (n >= 4) opts.push('badger');
  let left = 3 + n * 2.4; const list = [];
  if (n % 5 === 0) { list.push('chief'); left -= 8; }
  while (left > 0) { const k = pick(opts); list.push(k); left -= cost[k]; }
  return list;
}
function spawnPoint(a) {
  const dx = Math.cos(a), dz = Math.sin(a), k = (MAP / 2 - 3.5) / Math.max(Math.abs(dx), Math.abs(dz));
  let x = clamp(KX + dx * k, 3, MAP - 4), z = clamp(KZ + dz * k, 3, MAP - 4);
  for (let r = 0; r < 6; r++) { const i = Math.round(x), j = Math.round(z); if (kind[i][j] === 'g') break; x += dx * -0.8; z += dz * -0.8; }
  return [x, z];
}
const COMPASS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
const compassName = a => COMPASS[(Math.round(((a % 6.2832) + 6.2832) % 6.2832 / (Math.PI / 4))) % 8];
function startWave() {
  G.wave++;
  const list = planWave(G.wave), mult = 1 + 0.09 * (G.wave - 1);
  const a1 = rnd(0, 6.283), a2 = a1 + Math.PI + rnd(-1, 1);
  const groups = G.wave >= 4 ? [a1, a2] : [a1];
  G.threat = a1;
  const pts = groups.map(spawnPoint);
  list.forEach((k, idx) => {
    const p = pts[idx % pts.length];
    G.spawnQ.push({ t: G.t + 0.4 + idx * 0.55, kind: k, x: p[0] + rnd(-1.5, 1.5), z: p[1] + rnd(-1.5, 1.5), mult });
  });
  pts.forEach(p => {
    const mk = new THREE.Group();
    box(mk, -0.1, 0, -0.1, 0.2, 2.2, 0.2, 0xe8654f, { basic: true, noshadow: true });
    box(mk, 0.1, 1.6, -0.1, 0.6, 0.4, 0.05, 0xe8654f, { basic: true, noshadow: true });
    mk.position.set(p[0], 0, p[1]); scene.add(mk);
    G.markers.push({ mk, until: G.t + 9 + list.length * 0.55 });
  });
  G.nextWave = G.wave >= TOTAL_WAVES ? Infinity : G.t + clamp(64 - G.wave * 1.6, 40, 64);
  sfx('horn'); setTimeout(() => sfx('howl'), 900);
  toast(`Raid ${G.wave} of ${TOTAL_WAVES}: ${list.length} raiders from the ${groups.map(compassName).join(' and ')}`, true);
}
function callEarly() {
  if (G.over || G.wave >= TOTAL_WAVES || G.nextWave === Infinity) return;
  const left = Math.max(0, G.nextWave - G.t);
  if (left < 5) return;
  G.res.gold += Math.floor(left * 0.7);
  startWave();
}

/* ===================== training and upgrades ===================== */
function popCount() { let n = 0; for (const u of units) if (!u.dead) n++; return n; }
function trainUnit(role) {
  const d = UDEF[role];
  if (G.age < d.age) return toast(`${d.name} needs ${AGES[d.age].name}`, true);
  const bar = buildings.filter(b => b.type === 'barracks' && b.done).sort((a, b) => dist2(a, G.keepB) - dist2(b, G.keepB))[0];
  if (!bar) return toast('Build a Barracks first', true);
  if (popCount() >= G.popCap) return toast('Not enough housing. Build more Burrow Houses', true);
  if (!afford(d.cost)) return toast('Not enough resources', true);
  pay(d.cost);
  const u = makeUnit(role, bar.x + rnd(-0.4, 0.4), bar.z + 1.5);
  puff(u.x, 0.5, u.z, 0xffffff, 5, 1.2, 0.4, 0.1); sfx('spawn', u.x, u.z);
}
const carryCap = u => 8 + (u.lvl >> 1) + 2 * G.tech.tools + (u.elite ? 3 : 0);
function techNext(t) { return G.tech[t.id] >= t.max ? null : t.cost[G.tech[t.id]]; }
function researchTech(id) {
  const t = TECHS.find(x => x.id === id);
  if (G.age < t.age) return toast(`${t.name} needs ${AGES[t.age].name}`, true);
  if (t.need && !buildings.some(b => b.type === t.need && b.done)) return toast(`Build a ${BDEF[t.need].name} first`, true);
  const c = techNext(t);
  if (!c) return toast(`${t.name} is fully researched`);
  if (!afford(c)) return toast('Not enough resources', true);
  pay(c); G.tech[id]++;
  if (id === 'armor') for (const u of units) if (!u.dead) { applyStats(u); dropBar(u); }
  sfx('done'); toast(`${t.name} level ${G.tech[id]} researched`);
}
const canPromote = u => !u.dead && !u.elite && u.lvl >= PROMO_LVL;
function promoteUnits(us) {
  const el = us.filter(canPromote);
  if (!el.length) return toast(`Units need level ${PROMO_LVL} to be promoted`, true);
  let n = 0;
  for (const u of el) {
    if (!afford(PROMO_COST)) { if (!n) toast('Not enough resources to promote', true); break; }
    pay(PROMO_COST); u.elite = true; n++;
    applyStats(u); u.hp = u.maxhp; dropBar(u); setBadge(u);
    u.model.scale.multiplyScalar(1.12);
    puff(u.x, u.y + 0.9, u.z, 0xffe27a, 14, 2, 0.8, 0.15); sfx('age', u.x, u.z);
  }
  if (n) toast(`${n} ${n > 1 ? 'animals' : el[0].name} promoted to Elite: +35% health, +30% damage`);
}
function upgradeSmith() {
  if (!buildings.some(b => b.type === 'smith' && b.done)) return toast('Build a Blacksmith first', true);
  if (G.smith >= 3) return toast('Weapons are fully sharpened');
  const c = SMITH_COST[G.smith];
  if (!afford(c)) return toast('Not enough resources', true);
  pay(c); G.smith++;
  toast(`Weapons sharpened: +${G.smith * 20}% damage`);
}
function advanceAge() {
  if (G.age >= 3) return;
  const c = AGE_COST[G.age + 1];
  if (!afford(c)) return toast('Not enough resources to advance', true);
  pay(c); G.age++;
  for (const b of buildings) {
    if (b.type === 'keep') { b.maxhp = BDEF.keep.hp + 600 * G.age; b.hp = Math.min(b.maxhp, b.hp + b.maxhp * 0.4); }
    if (b.def.wall) { const r = b.hp / b.maxhp; b.maxhp = b.def.hp; b.hp = b.maxhp * r; if (b.hp < b.maxhp) showBar(b); }
    makeBuildingMesh(b);
    if (!b.done) addScaffoldFix(b);
  }
  sfx('age'); renderDock(); updateDock(true);
  toast(`A new age dawns: ${AGES[G.age].name}` + (buildings.some(b => b.def.wall) ? '. Your walls were rebuilt stronger' : ''));
  puff(G.keepB.x, 1.5, G.keepB.z, 0xf0b94a, 24, 3, 1, 0.2);
}
function addScaffoldFix(b) { if (b.scaf) { scene.remove(b.scaf); b.scaf = null; } addScaffold(b); }

/* ===================== main simulation step ===================== */
function step(dt) {
  G.t += dt; NAV.budget = 10;
  G.popCap = BDEF.keep.pop + buildings.reduce((s, b) => s + (b.done && b.def.pop && b.type !== 'keep' ? b.def.pop : 0), 0);
  for (const b of buildings) {
    if (!b.done) continue;
    if (b.def.income) for (const k in b.def.income) G.res[k] += b.def.income[k] * dt * (k === 'food' ? seasonFood() * (1 + 0.25 * G.tech.farm) : 1);
    if (b.def.range) updateTower(b, dt);
  }
  // new settlers
  G.birthT -= dt;
  if (G.birthT <= 0) {
    G.birthT = 11;
    const workers = units.filter(u => u.role === 'worker' && !u.dead).length;
    if (popCount() < G.popCap && G.res.food >= 25 && workers < 30) { G.res.food -= 25; const u = makeUnit('worker', KX + rnd(-1, 1), KZ + 2.3); puff(u.x, 0.5, u.z, 0xffffff, 4, 1, 0.4, 0.08); sfx('spawn', u.x, u.z); }
  }
  // forests regrow slowly
  G.treeT -= dt;
  if (G.treeT <= 0) {
    G.treeT = 14;
    const trees = nodes.filter(n => n.type === 'wood');
    if (trees.length && trees.length < 90) {
      const p = pick(trees), i = p.i + rint(-1, 1), j = p.j + rint(-1, 1);
      if (freeGrass(i, j)) addNode('wood', i, j, 18);
    }
  }
  // waves
  if (G.t >= G.nextWave) startWave();
  while (G.spawnQ.length && G.spawnQ[0].t <= G.t) { const s = G.spawnQ.shift(); const e = makeEnemy(s.kind, s.x, s.z, s.mult); puff(e.x, 0.5, e.z, 0xe8654f, 6, 1.5, 0.5, 0.12); }
  for (let k = G.markers.length - 1; k >= 0; k--) if (G.t > G.markers[k].until) { scene.remove(G.markers[k].mk); G.markers.splice(k, 1); }
  // actors
  for (const u of units) if (!u.dead) { if (u.role === 'worker') updateWorker(u, dt); else updateSoldier(u, dt); }
  for (const e of enemies) if (!e.dead) updateEnemy(e, dt);
  for (const o of units) if (!o.dead) watchdog(o, dt);
  for (const e of enemies) if (!e.dead) watchdog(e, dt);
  healSystem(dt);
  if (G.selU.length) G.selU = G.selU.filter(u => !u.dead);
  // separation
  const all = units.concat(enemies).filter(o => !o.dead);
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) {
    const p = all[a], q = all[b], dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.42 && d > 0.001) {
      const push = (0.42 - d) * 0.35, ux = dx / d * push, uz = dz / d * push;
      if (!blockedAt(p.x - ux, p.z - uz, p.team, null)) { p.x -= ux; p.z -= uz; }
      if (!blockedAt(q.x + ux, q.z + uz, q.team, null)) { q.x += ux; q.z += uz; }
    }
  }
  updateShots(dt); updateParts(dt);
  // clean up the fallen
  for (const list of [units, enemies]) for (let k = list.length - 1; k >= 0; k--) {
    const o = list[k];
    if (!o.dead) continue;
    o.deadT += dt;
    o.model.rotation.z = Math.min(1.5, o.deadT * 5);
    o.model.position.y = o.y - Math.min(0.3, o.deadT * 0.5);
    if (o.deadT > 0.9) { scene.remove(o.model); list.splice(k, 1); }
  }
  // victory
  if (!G.over && G.wave >= TOTAL_WAVES && !G.spawnQ.length && !enemies.some(e => !e.dead)) endGame(true);
}

/* ===================== new game ===================== */
function clearEntities() {
  for (const b of buildings) { scene.remove(b.group); if (b.scaf) scene.remove(b.scaf); dropBar(b); }
  for (const o of units.concat(enemies)) { scene.remove(o.model); dropBar(o); }
  for (const s of shots) scene.remove(s.m);
  for (const p of parts) scene.remove(p.m);
  for (const m of G.markers) scene.remove(m.mk);
  buildings.length = units.length = enemies.length = shots.length = parts.length = 0;
}
function newGame() {
  clearEntities();
  genWorld();
  Object.assign(G, { res: { wood: 140, stone: 30, food: 100, gold: 20 }, age: 0, t: 0, wave: 0, nextWave: 90, over: false, smith: 0, tech: { armor: 0, farm: 0, tools: 0 }, threat: rnd(0, 6.28), spawnQ: [], markers: [], slot: 0, birthT: 6, treeT: 6, kills: 0, sel: null, build: null, selU: [], cmd: null });
  resetEnv();
  G.keepB = placeBuilding('keep', KX, KZ, true);
  for (let k = 0; k < 5; k++) makeUnit('worker', KX - 2 + k, KZ + 2.4);
  scene.background.setHex(AGES[0].sky); scene.fog.color.setHex(AGES[0].sky); sun.color.setHex(AGES[0].sun);
}
