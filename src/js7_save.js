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
      res: Object.assign({}, G.res), age: G.age, t: G.t, wave: G.wave, nextWave: G.nextWave === Infinity ? -1 : G.nextWave, smith: G.smith, threat: G.threat,
      birthT: G.birthT, treeT: G.treeT, kills: G.kills, speed: G.speed, slot: G.slot,
      spawnQ: G.spawnQ.map(q => ({ dt: q.t - G.t, kind: q.kind, x: q.x, z: q.z, mult: q.mult }))
    },
    buildings: buildings.filter(b => !b.dead).map(b => ({ type: b.type, i: b.i, j: b.j, hp: b.hp, maxhp: b.maxhp, progress: b.progress, done: b.done })),
    units: units.filter(u => !u.dead).map(u => ({ role: u.role, sp: u.sp, x: u.x, z: u.z, hp: u.hp, lvl: u.lvl, xp: u.xp, trait: u.trait, name: u.name, carry: u.carry, carryType: u.carryType, slot: u.slot, home: u.home, hold: u.hold })),
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
    res: Object.assign({ wood: 0, stone: 0, food: 0, gold: 0 }, g.res), age: g.age, t: g.t, wave: g.wave, nextWave: g.nextWave < 0 ? Infinity : g.nextWave, over: false, smith: g.smith, threat: g.threat,
    spawnQ: [], markers: [], slot: 0, birthT: g.birthT, treeT: g.treeT, kills: g.kills, sel: null, build: null, selU: [], cmd: null, speed: g.speed || 1
  });
  for (const q of g.spawnQ || []) G.spawnQ.push({ t: G.t + q.dt, kind: q.kind, x: q.x, z: q.z, mult: q.mult });
  for (const sb of s.buildings) {
    const b = placeBuilding(sb.type, sb.i, sb.j, sb.done);
    b.maxhp = sb.maxhp || b.maxhp; b.hp = Math.min(sb.hp, b.maxhp);
    if (!sb.done) { b.progress = sb.progress; b.group.scale.y = Math.max(0.06, sb.progress); }
    if (b.hp < b.maxhp) showBar(b);
    if (sb.type === 'keep') G.keepB = b;
  }
  for (const su of s.units) {
    const u = makeUnit(su.role, su.x, su.z, su.sp);
    u.name = su.name || u.name; u.trait = su.trait; u.lvl = su.lvl || 1; u.xp = su.xp || 0;
    if (u.trait) applyStats(u); else { u.maxhp = Math.round(u.def.hp); }
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
function storeGet(slot) {
  try { const raw = localStorage.getItem(SAVE_PREFIX + slot); if (!raw) return null; const s = JSON.parse(raw); return validSave(s) ? s : null; } catch (e) { return null; }
}
function storeSet(slot, snap) {
  try { localStorage.setItem(SAVE_PREFIX + slot, JSON.stringify(snap)); storageOK = true; return true; }
  catch (e) { storageOK = false; if (!storageWarned) { storageWarned = true; toast('This browser blocks saving. Use Export to keep a save file.', true); } return false; }
}
function storeDel(slot) { try { localStorage.removeItem(SAVE_PREFIX + slot); } catch (e) { /* ignore */ } }
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
let autoT = 20;
function autosaveTick(dt) {
  if (!gameStarted || G.paused || G.over) return;
  autoT -= dt;
  if (autoT <= 0) { autoT = 20; saveTo('auto', true); }
}
document.addEventListener('visibilitychange', () => { if (document.hidden && gameStarted && !G.over) saveTo('auto', true); });
window.addEventListener('pagehide', () => { if (gameStarted && !G.over) saveTo('auto', true); });

/* ---- modal ---- */
const modalEl = $('saveModal');
let modalWasPaused = false;
const fmtDate = ts => new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
function slotMeta(s) {
  const m = s.meta || {};
  return `Raid ${m.wave ?? '?'} · ${AGES[m.age || 0].name} · ${m.pop ?? '?'} animals · ${m.season || ''} · v${s.v} · ${fmtDate(s.ts)}`;
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
function openSaveModal() {
  modalWasPaused = G.paused; G.paused = true;
  modalEl.classList.add('on'); renderSaveModal();
}
function closeSaveModal(loaded) {
  modalEl.classList.remove('on');
  if (!loaded) G.paused = modalWasPaused || $('intro').classList.contains('on');
}
$('btnSave').addEventListener('click', () => { sfx('click'); openSaveModal(); });
$('saveClose').addEventListener('click', () => closeSaveModal(false));
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
(function introInit() {
  $('introVer').textContent = `Version ${GAME_VERSION}`;
  const last = latestSave(), btn = $('contBtn');
  if (last) {
    btn.style.display = '';
    btn.textContent = `Continue (${last.id === 'auto' ? 'autosave' : 'slot ' + last.id}: raid ${last.s.meta.wave}, ${fmtDate(last.s.ts)})`;
    btn.addEventListener('click', () => { audioInit(); gameStarted = true; applySnapshot(last.s); sfx('level'); });
  }
  $('startBtn').addEventListener('click', () => { gameStarted = true; autoT = 20; });
  $('againBtn').addEventListener('click', () => { gameStarted = true; autoT = 20; });
})();
