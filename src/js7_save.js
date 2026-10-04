/* ===================== versions, save slots, export and import ===================== */
const SAVE_FMT = 1, SAVE_PREFIX = 'pawhold.save.';
const SAVE_SLOTS = [['auto', 'Autosave'], ['1', 'Slot 1'], ['2', 'Slot 2'], ['3', 'Slot 3']];
let storageOK = true, storageWarned = false;

function snapshot() {
  return {
    fmt: SAVE_FMT, v: GAME_VERSION, build: GAME_BUILD, ts: Date.now(),
    meta: { wave: G.wave, age: G.age, pop: popCount(), t: Math.floor(G.t), season: SEASONS[ENV.season].name },
    seed, nodes: nodes.map(n => ({ type: n.type, i: n.i, j: n.j, amt: n.amt })),
    G: {
      res: Object.assign({}, G.res), age: G.age, t: G.t, wave: G.wave, nextWave: G.nextWave === Infinity ? -1 : G.nextWave, smith: G.smith, tech: Object.assign({}, G.tech), diff: G.diff, endless: !!G.endless, threat: G.threat,
      birthT: G.birthT, treeT: G.treeT, kills: G.kills, speed: G.speed, slot: G.slot,
      spawnQ: G.spawnQ.map(q => ({ dt: q.t - G.t, kind: q.kind, x: q.x, z: q.z, mult: q.mult }))
    },
    buildings: buildings.filter(b => !b.dead).map(b => ({ type: b.type, i: b.i, j: b.j, hp: b.hp, maxhp: b.maxhp, progress: b.progress, done: b.done })),
    units: units.filter(u => !u.dead).map(u => ({ role: u.role, sp: u.sp, x: u.x, z: u.z, hp: u.hp, lvl: u.lvl, xp: u.xp, trait: u.trait, name: u.name, carry: u.carry, carryType: u.carryType, slot: u.slot, home: u.home, hold: u.hold, elite: u.elite })),
    enemies: enemies.filter(e => !e.dead).map(e => ({ kind: e.kind, x: e.x, z: e.z, hp: e.hp, maxhp: e.maxhp, dmg: e.dmg })),
    env: { tod: ENV.tod, todMode: ENV.todMode, todPin: ENV.todPin, sCur: ENV.sCur, sMode: ENV.sMode, sPin: ENV.sPin, wType: ENV.wType, wAuto: ENV.wAuto, cover: ENV.cover },
    cam: { tx: cam.tx, tz: cam.tz, yaw: cam.yaw, pitch: cam.pitch, dist: cam.dist }
  };
}
function validSave(s) {
  return !!(s && typeof s === 'object' && s.fmt <= SAVE_FMT && s.G && Array.isArray(s.buildings) && Array.isArray(s.nodes) && s.buildings.some(b => b.type === 'keep'));
}
function applySnapshot(s) {
  clearEntities();
  genWorld(s);
  const g = s.G;
  Object.assign(G, {
    res: Object.assign({ wood: 0, stone: 0, food: 0, gold: 0, alloy: 0, anti: 0 }, g.res), age: g.age, t: g.t, wave: g.wave, nextWave: g.nextWave < 0 ? Infinity : g.nextWave, over: false, endless: !!g.endless, smith: g.smith, tech: Object.assign({}, g.tech || {}), diff: DIFF[g.diff] ? g.diff : 'normal', threat: g.threat,
    spawnQ: [], markers: [], slot: 0, birthT: g.birthT, treeT: g.treeT, kills: g.kills, sel: null, build: null, selU: [], cmd: null, speed: g.speed || 1
  });
  for (const q of g.spawnQ || []) G.spawnQ.push({ t: G.t + q.dt, kind: q.kind, x: q.x, z: q.z, mult: q.mult });
  for (const sb of s.buildings) {
    const b = placeBuilding(sb.type === 'palisade' ? 'wall' : sb.type, sb.i, sb.j, sb.done);
    if (b.def.wall) { const r = sb.maxhp ? Math.min(1, sb.hp / sb.maxhp) : 1; b.hp = b.maxhp * r; }
    else { b.maxhp = sb.maxhp || b.maxhp; b.hp = Math.min(sb.hp, b.maxhp); }
    if (!sb.done) { b.progress = sb.progress; b.group.scale.y = Math.max(0.06, sb.progress); }
    if (b.hp < b.maxhp) showBar(b);
    if (sb.type === 'keep') G.keepB = b;
  }
  for (const su of s.units) {
    const u = makeUnit(su.role, su.x, su.z, su.sp);
    u.name = su.name || u.name; u.trait = su.trait; u.lvl = su.lvl || 1; u.xp = su.xp || 0;
    u.elite = !!su.elite;
    u.maxhp = 0; applyStats(u);
    u.hp = Math.min(su.hp, u.maxhp); u.carry = su.carry || 0; u.carryType = su.carryType || null; u.slot = su.slot || 0; u.home = su.home || null; u.hold = !!su.hold;
    setBadge(u);
    if (u.hp < u.maxhp) showBar(u);
  }
  G.slot = Math.max(g.slot || 0, units.length);
  for (const se of s.enemies || []) {
    const e = makeEnemy(se.kind, se.x, se.z, 1);
    e.maxhp = se.maxhp; e.hp = Math.min(se.hp, se.maxhp); e.dmg = se.dmg;
    if (e.hp < e.maxhp) showBar(e);
  }
  if (!G.keepB) G.keepB = buildings.find(b => b.type === 'keep');
  const ev = s.env || {};
  Object.assign(ENV, { tod: ev.tod ?? 0.3, todMode: ev.todMode || 'auto', todPin: ev.todPin ?? 0.5, sCur: ev.sCur ?? 0, sMode: ev.sMode || 'auto', sPin: ev.sPin ?? 0, wType: ev.wType || 'clear', wAuto: ev.wAuto !== false, cover: ev.cover || 0, colSig: '', wTimer: 45 });
  ENV.seasonSeen = Math.floor(ENV.sCur) % 4; envLabelSig = ''; refreshWeatherButton();
  if (s.cam) Object.assign(cam, s.cam);
  hud.cache = {}; infoSig = '';
  $('endScreen').classList.remove('on'); $('intro').classList.remove('on');
  renderDock(); updateDock(true);
  G.paused = false;
}

/* ---- storage ---- */
const mem = {};            // in-memory copy: works even when localStorage is blocked
let cloud = null, cloudOK = false, cloudBusy = {}, cloudDirty = {};
function storeGet(slot) {
  let s = mem[slot] || null;
  try { const raw = localStorage.getItem(SAVE_PREFIX + slot); if (raw) { const l = JSON.parse(raw); if (validSave(l) && (!s || l.ts > s.ts)) s = l; } } catch (e) { /* blocked */ }
  return s && validSave(s) ? s : null;
}
function cloudPush(slot) {
  if (!cloud) return;
  if (cloudBusy[slot]) { cloudDirty[slot] = true; return; }
  cloudBusy[slot] = true;
  const s = mem[slot];
  const op = s ? cloud.doc('save_' + slot).set({ d: JSON.stringify(s), ts: s.ts }) : cloud.doc('save_' + slot).delete();
  op.then(() => { cloudOK = true; }).catch(() => { cloudOK = false; }).then(() => {
    cloudBusy[slot] = false;
    if (cloudDirty[slot]) { cloudDirty[slot] = false; cloudPush(slot); }
  });
}
function storeSet(slot, snap) {
  mem[slot] = snap;
  let ls = true;
  try { localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(snap)); } catch (e) { ls = false; }
  cloudPush(slot);
  storageOK = ls || !!cloud;
  if (!storageOK && !storageWarned) { storageWarned = true; toast('This browser blocks saving. Use Export to keep a save file.', true); }
  return true;
}
function storeDel(slot) {
  delete mem[slot];
  try { localStorage.removeItem(SAVE_PREFIX + slot); } catch (e) { /* ignore */ }
  cloudPush(slot);
}
/* artifact database (private per viewer): survives when the browser blocks localStorage */
(async function cloudInit() {
  try {
    if (!window.claude || !claude.use) return;
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    cloud = db.collection('data/users/' + id);
    const snap = await cloud.get();
    snap.docs.forEach(d => {
      const slot = d.id.replace(/^save_/, ''), v = d.data();
      try { const s = JSON.parse(v.d); if (validSave(s) && SAVE_SLOTS.some(x => x[0] === slot) && (!mem[slot] || s.ts > mem[slot].ts)) mem[slot] = s; } catch (e) { /* skip */ }
    });
    cloudOK = true; storageOK = true;
    if (typeof refreshContinue === 'function') refreshContinue();
  } catch (e) { cloud = null; }
})();
function latestSave() {
  let best = null;
  for (const [id] of SAVE_SLOTS) { const s = storeGet(id); if (s && (!best || s.ts > best.ts)) best = { id, s }; }
  return best;
}
function saveTo(slot, quiet) {
  if (G.over) return false;
  const ok = storeSet(slot, snapshot());
  if (ok && !quiet) { toast(`Saved to ${SAVE_SLOTS.find(x => x[0] === slot)[1]}`); sfx('done'); }
  return ok;
}
function loadFrom(slot) {
  const s = storeGet(slot);
  if (!s) return toast('That slot is empty', true);
  applySnapshot(s); sfx('level'); toast(`Loaded ${SAVE_SLOTS.find(x => x[0] === slot)[1]}`);
}
let gameStarted = false;
let autoT = 15;
function autosaveTick(dt) {
  if (!gameStarted || G.paused || G.over) return;
  autoT -= dt;
  if (autoT <= 0) { autoT = 15; saveTo('auto', true); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden && gameStarted && !G.over) saveTo('auto', true); });
window.addEventListener('pagehide', () => { if (gameStarted && !G.over) saveTo('auto', true); });

/* ---- modal ---- */
const modalEl = $('saveModal');
let modalWasPaused = false;
const fmtDate = ts => new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
function slotMeta(s) {
  const m = s.meta || {};
  return `Raid ${m.wave ?? '?'} · ${(DIFF[s.G && s.G.diff] || DIFF.normal).name} · ${AGES[m.age || 0].name} · ${m.pop ?? '?'} animals · ${m.season || ''} · v${s.v} · ${fmtDate(s.ts)}`;
}
function renderSaveModal() {
  $('verLine').textContent = `Pawhold v${GAME_VERSION} (build ${GAME_BUILD})`;
  const box = $('slots'); box.innerHTML = '';
  for (const [id, name] of SAVE_SLOTS) {
    const s = storeGet(id), row = document.createElement('div');
    row.className = 'slot';
    row.innerHTML = `<div class="meta"><b>${name}</b><small>${s ? slotMeta(s) : 'Empty'}</small></div>`;
    const mk = (label, cls, fn, dis) => { const b = document.createElement('button'); b.className = 'btn ' + cls; b.textContent = label; b.disabled = !!dis; b.addEventListener('click', () => { fn(); renderSaveModal(); }); row.appendChild(b); };
    if (id !== 'auto') mk('Save', 'go', () => saveTo(id), G.over || !gameStarted);
    mk('Load', '', () => { loadFrom(id); closeSaveModal(true); }, !s);
    mk('Delete', 'warn', () => storeDel(id), !s);
    box.appendChild(row);
  }
  $('storeNote').style.display = storageOK ? 'none' : 'block';
}
function diagReport() {
  const w = units.filter(u => !u.dead && u.role === 'worker'), s = units.filter(u => !u.dead && u.role !== 'worker');
  const st = {}; for (const u of units) if (!u.dead) { const k = u.role === 'worker' ? u.state : (u.order ? u.order.type : u.hold ? 'hold' : u.tgt ? 'fighting' : 'guard'); st[k] = (st[k] || 0) + 1; }
  return { version: GAME_VERSION, build: GAME_BUILD, t: Math.round(G.t), wave: G.wave, diff: G.diff, settlers: w.length, defenders: s.length, raiders: enemies.filter(e => !e.dead).length, states: st, frozenResets: DIAG.kicks, recent: DIAG.log, fps: Math.round(1000 / Math.max(1, QUALITY.ema)), pixelRatio: QUALITY.pr, ua: navigator.userAgent.slice(0, 80) };
}
$('diagCopy').addEventListener('click', () => { const txt = JSON.stringify(diagReport(), null, 1); const done = () => toast('Diagnostics copied. Paste them to the developer'); if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => { $('diagText').textContent = txt; }); else $('diagText').textContent = txt; });
function openSaveModal() {
  modalWasPaused = G.paused; G.paused = true;
  modalEl.classList.add('on'); renderSaveModal(); refreshEndlessBtn();
  { const d = diagReport(); $('diagText').textContent = `v${d.version} (${d.build}) · ${d.fps} fps · ${d.settlers} settlers, ${d.defenders} defenders, ${d.raiders} raiders · frozen animals reset: ${d.frozenResets}\n` + Object.entries(d.states).map(([k, v]) => `${k}: ${v}`).join(', '); }
}
function closeSaveModal(loaded) {
  modalEl.classList.remove('on');
  if (!loaded) G.paused = modalWasPaused || $('intro').classList.contains('on');
}
$('btnSave').addEventListener('click', () => { sfx('click'); openSaveModal(); });
$('saveClose').addEventListener('click', () => closeSaveModal(false));
$('menuResume').addEventListener('click', () => closeSaveModal(false));
function refreshEndlessBtn() { $('endlessToggle').textContent = `Endless raids: ${G.endless ? 'On' : 'Off'}`; $('endlessToggle').classList.toggle('on', !!G.endless); }
$('endlessToggle').addEventListener('click', () => {
  G.endless = !G.endless; sfx('click'); refreshEndlessBtn();
  if (G.endless && G.wave >= TOTAL_WAVES && G.nextWave === Infinity) G.nextWave = G.t + 45;
  toast(G.endless ? 'Endless raids on: they keep coming after the 25th' : 'Endless raids off: the chronicle ends after raid 25');
});
let newArmed = 0;
$('saveNew').addEventListener('click', () => {
  const b = $('saveNew');
  if (!newArmed) { newArmed = setTimeout(() => { newArmed = 0; b.textContent = 'New game'; }, 3500); b.textContent = 'Tap again to restart'; return; }
  clearTimeout(newArmed); newArmed = 0; b.textContent = 'New game';
  audioInit(); newGame(); gameStarted = true; autoT = 15; cam.tx = KX; cam.tz = KZ;
  $('endScreen').classList.remove('on'); $('intro').classList.remove('on');
  renderDock(); updateDock(true); ghost.visible = false; closeSaveModal(true); G.paused = false;
  toast('New game started. Your earlier saves are still in their slots');
});
$('saveExport').addEventListener('click', () => {
  if (!gameStarted) return toast('Start a game first', true);
  const blob = new Blob([JSON.stringify(snapshot())], { type: 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `pawhold-save-v${GAME_VERSION}-${Date.now()}.json`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$('saveImport').addEventListener('click', () => $('saveFile').click());
$('saveFile').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const s = JSON.parse(rd.result);
      if (!validSave(s)) throw new Error('bad');
      gameStarted = true; applySnapshot(s); closeSaveModal(true); toast(`Imported save from v${s.v}`);
    } catch (err) { toast('That file is not a valid Pawhold save', true); }
  };
  rd.readAsText(f); e.target.value = '';
});

/* ---- start screen: version and continue ---- */
let contSlot = null;
function refreshContinue() {
  const last = latestSave(), btn = $('contBtn');
  if (!last || gameStarted) return;
  contSlot = last.id; btn.style.display = '';
  btn.textContent = `Continue (${last.id === 'auto' ? 'autosave' : 'slot ' + last.id}: raid ${last.s.meta.wave}, ${fmtDate(last.s.ts)})`;
}
(function introInit() {
  $('introVer').textContent = `Version ${GAME_VERSION}`;
  $('contBtn').addEventListener('click', () => { const s = contSlot && storeGet(contSlot); if (!s) return; audioInit(); gameStarted = true; applySnapshot(s); sfx('level'); });
  refreshContinue();
  $('startBtn').addEventListener('click', () => { gameStarted = true; autoT = 15; });
  $('againBtn').addEventListener('click', () => { gameStarted = true; autoT = 15; });
})();
