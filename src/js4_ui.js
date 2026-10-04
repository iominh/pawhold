/* ===================== camera ===================== */
const cam = { tx: KX, tz: KZ, yaw: 0.8, pitch: 0.72, dist: 30 };
const keys = {};
function applyCam() {
  cam.tx = clamp(cam.tx, 4, MAP - 5); cam.tz = clamp(cam.tz, 4, MAP - 5);
  cam.dist = clamp(cam.dist, 10, 62); cam.pitch = clamp(cam.pitch, 0.3, 1.35);
  const cp = Math.cos(cam.pitch);
  camera.position.set(cam.tx + Math.sin(cam.yaw) * cp * cam.dist, Math.sin(cam.pitch) * cam.dist, cam.tz + Math.cos(cam.yaw) * cp * cam.dist);
  camera.lookAt(cam.tx, 0, cam.tz);
  camera.updateMatrixWorld();
}
function panBy(dx, dy) {
  const k = cam.dist * 0.0022, sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  cam.tx += -cy * dx * k + (-sy) * dy * k;
  cam.tz += sy * dx * k + (-cy) * dy * k;
}
const TWO_PI = Math.PI * 2;
const panVel = { x: 0, y: 0 };
const camGoal = { yaw: null, pitch: null, dist: null };
function panKeys(dt) {
  const ke = 1 - Math.exp(-9 * dt);
  if (camGoal.yaw !== null) { const d = camGoal.yaw - cam.yaw; cam.yaw += d * ke; if (Math.abs(d) < 0.002) { cam.yaw = camGoal.yaw; camGoal.yaw = null; } }
  if (camGoal.dist !== null) { const d = camGoal.dist - cam.dist; cam.dist += d * ke; if (Math.abs(d) < 0.03) { cam.dist = camGoal.dist; camGoal.dist = null; } }
  if (camGoal.pitch !== null) { const d = camGoal.pitch - cam.pitch; cam.pitch += d * ke; if (Math.abs(d) < 0.002) { cam.pitch = camGoal.pitch; camGoal.pitch = null; } }
  if (!pts.size && (Math.abs(panVel.x) > 8 || Math.abs(panVel.y) > 8)) { panBy(panVel.x * dt, panVel.y * dt); const f = Math.exp(-4.5 * dt); panVel.x *= f; panVel.y *= f; }
  const sp = cam.dist * 0.9 * dt, sy = Math.sin(cam.yaw), cy = Math.cos(cam.yaw);
  let fx = 0, rx = 0;
  if (keys.w || keys.arrowup) fx += 1; if (keys.s || keys.arrowdown) fx -= 1;
  if (keys.d || keys.arrowright) rx += 1; if (keys.a || keys.arrowleft) rx -= 1;
  cam.tx += (-sy * fx + cy * rx) * sp; cam.tz += (-cy * fx - sy * rx) * sp;
  if (keys.q) cam.yaw -= dt * 1.6; if (keys.e) cam.yaw += dt * 1.6;
}

/* ===================== toast, HUD, dock ===================== */
const $ = id => document.getElementById(id);
let toastTimer = 0;
function toast(msg, bad) {
  const t = $('toast');
  t.textContent = msg; t.className = 'on' + (bad ? ' bad' : '');
  if (bad) sfx('error');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 2800);
}

/* ===================== tooltips ===================== */
const tipEl = $('tip');
const ENEMY_INFO = {
  wolf: 'Fast and fragile. Goes straight for your animals.', boar: 'Tough charger with lots of health.',
  raccoon: 'Throws stones from range. Kill it before it wears your walls down.', badger: 'Siege ram. Smashes walls and buildings, so keep it away from them.',
  chief: 'Bear Warlord, the boss of the raid. Focus every tower and defender on it.'
};
function statsRow(list) { return '<div class="st">' + list.map(x => `<span>${x}</span>`).join('') + '</div>'; }
function tipBuilding(def, extra, locked) {
  const st = [`HP ${def.hp}`];
  if (def.time) st.push(`Builds in ${def.time}s`);
  if (def.pop) st.push(`Housing +${def.pop}`);
  if (def.income) Object.keys(def.income).forEach(k => st.push(`+${def.income[k]} ${k}/s`));
  if (def.range) st.push(`Range ${def.range}`, `Damage ${def.dmg}${def.splash ? ' (area)' : ''}`);
  if (def.heal) st.push(`Heals within ${def.heal} tiles`);
  if (def.drop) st.push(`Drop-off: ${def.drop.join(', ')}`);
  return `<b>${def.name}</b><i class="role">${def.role || ''}</i><p class="what">${def.what || def.blurb || ''}</p>` +
    (def.help ? `<p class="help"><strong>How it helps:</strong> ${def.help}</p>` : '') +
    (def.tip ? `<p class="tipx">${def.tip}</p>` : '') + statsRow(st) + (locked ? `<p class="lockn">${locked}</p>` : '') + (extra || '');
}
function tipUnitDef(def) {
  const st = [`HP ${def.hp}`, `Damage ${def.dmg}`, `Range ${def.range}`];
  const ab = ABIL[Object.keys(UDEF).find(k => UDEF[k] === def)];
  return `<b>${def.name}</b><i class="role">${def.role}</i><p class="what">${def.what}</p><p class="help"><strong>How it helps:</strong> ${def.help}</p>` +
    (def.tip ? `<p class="tipx">${def.tip}</p>` : '') + statsRow(st) + (ab ? `<p class="tipx">Level 3 ability: ${ab.name}. ${ab.desc}</p>` : '');
}
function placeTip(x, y, above) {
  tipEl.classList.add('on');
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let left = clamp(x, 8, window.innerWidth - w - 8);
  let top = above ? y - h - 10 : y + 18;
  if (top < 8) top = 8; if (top + h > window.innerHeight - 8) top = window.innerHeight - h - 8;
  tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
}
function showTip(html, x, y, above) { if (tipEl.dataset.h !== html) { tipEl.innerHTML = html; tipEl.dataset.h = html; } placeTip(x, y, above); }
function hideTip() { tipEl.classList.remove('on'); tipEl.dataset.h = ''; }
let tipHold = 0;
const SWC = { wood: 'w', stone: 's', food: 'f', gold: 'g' };
const costHTML = c => Object.keys(c).map(k => `<span data-r="${k}" data-n="${c[k]}"><i class="sw ${SWC[k]}"></i>${c[k]}</span>`).join('');
const TABS = [{ id: 'town', name: 'Town' }, { id: 'defense', name: 'Defense' }, { id: 'army', name: 'Army' }];
let curTab = 'town', cards = [];
function renderDock() {
  $('tabs').innerHTML = TABS.map(t => `<button class="tab${t.id === curTab ? ' on' : ''}" data-tab="${t.id}">${t.name}</button>`).join('') + '<span class="hint" id="hint">Hover a card to see what it does</span>';
  const list = [];
  for (const k in BDEF) if (BDEF[k].cat === curTab) list.push({ kindOf: 'b', id: k, def: BDEF[k] });
  if (curTab === 'army') {
    for (const k in UDEF) if (k !== 'worker') list.push({ kindOf: 'u', id: k, def: UDEF[k] });
    list.push({ kindOf: 'x', id: 'smith', def: { name: 'Sharpen Weapons', cost: SMITH_COST[0], age: 2, blurb: 'Every defender and tower hits 20% harder per level.', role: 'Weapon upgrade', what: 'Pays the smiths to sharpen every weapon in the valley.', help: 'Each level adds +20% damage to every defender and every tower, up to three levels. Needs a finished Blacksmith.', tip: 'Worth buying before the boss raids at 5, 10 and 15.', hp: 0 } });
    for (const t of TECHS) list.push({ kindOf: 'x', id: t.id, def: { name: t.name, cost: t.cost[0], age: t.age, blurb: t.what, role: t.role, what: t.what, help: t.help, tip: t.tip, hp: 0 } });
  }
  const box2 = $('cards');
  box2.innerHTML = '';
  cards = list.map(it => {
    const el = document.createElement('button');
    el.className = 'card';
    el.innerHTML = `<div class="ic">${it.kindOf === 'u' ? unitIconSVG(it.def.sp) : it.kindOf === 'x' ? iconSVG(it.id === 'farm' ? 'farm' : it.id === 'tools' ? 'camp' : 'smith') : iconSVG(it.id)}</div><div class="nm">${it.def.name}</div><div class="cs">${costHTML(it.def.cost)}</div><span class="lk"></span>`;
    el.addEventListener('click', () => onCard(it));
    const showCard = () => {
      const d = it.def, r = el.getBoundingClientRect(), locked = d.age !== undefined && G.age < d.age ? `Unlocks in the ${AGES[d.age].name}` : '';
      const html = it.kindOf === 'u' ? tipUnitDef(d) : it.kindOf === 'x' ? `<b>${d.name}</b><i class="role">${d.role}</i><p class="what">${d.what}</p><p class="help"><strong>How it helps:</strong> ${d.help}</p><p class="tipx">${d.tip}</p>${locked ? `<p class="lockn">${locked}</p>` : ''}` : tipBuilding(d, '', locked);
      showTip(html, r.left, r.top - (document.documentElement.clientWidth <= 640 ? 0 : 0), true);
    };
    const hoverCard = () => { if (window.matchMedia && matchMedia('(hover: none)').matches) return; showCard(); };
    el.addEventListener('mouseenter', hoverCard); el.addEventListener('focus', hoverCard);
    el.addEventListener('mouseleave', hideTip); el.addEventListener('blur', hideTip);
    el.addEventListener('contextmenu', e => { e.preventDefault(); showCard(); tipHold = performance.now() + (document.documentElement.clientWidth <= 640 ? 2500 : 3500); });
    box2.appendChild(el);
    return { el, it, sig: '' };
  });
  $('tabs').querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => { curTab = b.dataset.tab; renderDock(); updateDock(true); }));
}
function onCard(it) {
  if (G.over) return;
  const d = it.def;
  if (it.kindOf === 'b') {
    if (G.age < d.age) return toast(`${d.name} unlocks in the ${AGES[d.age].name}`, true);
    G.build = G.build === it.id ? null : it.id; G.sel = null; G.selU = []; G.cmd = null; sfx('click');
    if (G.build) toast(d.wall ? `${d.name}: click or drag to build` : `${d.name}: click the ground to build`);
  } else if (it.kindOf === 'u') { trainUnit(it.id); }
  else if (it.id === 'smith') upgradeSmith();
  else researchTech(it.id);
  updateDock(true); syncBuildCancel();
}
function updateDock(force) {
  for (const c of cards) {
    const d = c.it.def;
    let cost = d.cost, lock = '', sel = false;
    if (c.it.kindOf === 'x') {
      if (c.it.id === 'smith') { cost = SMITH_COST[Math.min(G.smith, 2)]; lock = G.smith >= 3 ? 'Max' : `Lv ${G.smith + 1}`; }
      else { const t = TECHS.find(x => x.id === c.it.id), lv = G.tech[t.id]; cost = t.cost[Math.min(lv, t.max - 1)]; lock = lv >= t.max ? 'Max' : `Lv ${lv + 1}`; }
    }
    if (d.age !== undefined && G.age < d.age) lock = AGES[d.age].name.split(' ')[0];
    if (c.it.kindOf === 'b') sel = G.build === c.it.id;
    const poor = Object.keys(cost).map(k => (G.res[k] >= cost[k] ? 1 : 0)).join('');
    const sig = [lock, sel, poor, Object.keys(cost).map(k => cost[k]).join()].join('|');
    if (!force && sig === c.sig) continue;
    c.sig = sig;
    c.el.classList.toggle('locked', !!(d.age !== undefined && G.age < d.age));
    c.el.classList.toggle('sel', sel);
    c.el.querySelector('.lk').textContent = lock;
    if (c.it.kindOf === 'x' || d.wall) c.el.querySelector('.cs').innerHTML = costHTML(cost);
    c.el.querySelectorAll('.cs span').forEach(s => s.classList.toggle('no', G.res[s.dataset.r] < +s.dataset.n));
  }
}
const hud = { cache: {} };
function setText(id, v) { if (hud.cache[id] !== v) { hud.cache[id] = v; $(id).textContent = v; } }
function updateHUD() {
  setText('vWood', Math.floor(G.res.wood)); setText('vStone', Math.floor(G.res.stone));
  setText('vFood', Math.floor(G.res.food)); setText('vGold', Math.floor(G.res.gold));
  setText('vPop', popCount() + '/' + G.popCap); $('popChip').classList.toggle('full', popCount() >= G.popCap);
  setText('ageName', AGES[G.age].name);
  const ab = $('ageBtn');
  if (G.age >= 3) { ab.disabled = true; setText('ageBtn', 'Max age'); $('ageCost').innerHTML = ''; }
  else {
    const c = AGE_COST[G.age + 1];
    const html = costHTML(c);
    if (hud.cache.ageCost !== html) { hud.cache.ageCost = html; $('ageCost').innerHTML = html; }
    $('ageCost').querySelectorAll('span').forEach(s => s.classList.toggle('no', G.res[s.dataset.r] < +s.dataset.n));
    ab.disabled = false; ab.style.opacity = afford(c) ? 1 : 0.55;
  }
  const alive = enemies.filter(e => !e.dead).length + G.spawnQ.length;
  const wb = $('waveBox');
  if (G.wave >= TOTAL_WAVES) {
    setText('waveTxt', alive ? `Final raid: ${alive} raiders left` : 'The valley is quiet');
    $('callBtn').style.display = 'none'; wb.classList.toggle('hot', alive > 0); $('waveBar').style.width = '0';
  } else {
    const left = Math.max(0, Math.ceil(G.nextWave - G.t));
    setText('waveTxt', (alive ? `Raid ${G.wave}: ${alive} raiders  ·  ` : '') + `Raid ${G.wave + 1} in ${left}s`);
    $('callBtn').style.display = left > 5 ? '' : 'none';
    wb.classList.toggle('hot', alive > 0);
    const span = Math.max(1, G.nextWave - (hud.spanStart || 0));
    $('waveBar').style.width = clamp(100 - left / span * 100, 0, 100) + '%';
  }
  if (hud.lastNext !== G.nextWave) { hud.lastNext = G.nextWave; hud.spanStart = G.t; }
  setText('btnPause', G.paused ? 'Resume' : 'Pause');
  setText('btnSpeed', G.speed + 'x');
}

/* ===================== selected building and unit panel ===================== */
function bDescribe(b) {
  const d = b.def;
  if (!b.done) return `Under construction: ${Math.floor(b.progress * 100)}%`;
  if (d.range) return `Range ${d.range} tiles. Damage ${Math.round(d.dmg * (1 + 0.3 * G.age) * dmgMult())}${d.splash ? ' (area)' : ''}.`;
  if (d.pop && b.type === 'house') return 'Houses 3 animals.';
  if (d.income) return Object.keys(d.income).map(k => `Makes ${(d.income[k] * (k === 'food' ? seasonFood() : 1)).toFixed(2)} ${k} per second${k === 'food' ? ' (' + SEASONS[ENV.season].name + ')' : ''}.`).join(' ') + (b.farmers ? ` ${b.farmers} settler${b.farmers > 1 ? 's' : ''} tending it for +${(b.farmers * 0.3 * seasonFood()).toFixed(2)} food/s.` : '');
  if (b.type === 'keep') return `Lose this and the clan is gone. Housing: ${G.popCap}.`;
  if (d.heal) return `Heals animals and buildings within ${d.heal} tiles.`;
  return '';
}
function repairCost(b) {
  const k = Object.keys(b.def.cost)[0] || 'wood', base = b.def.cost[k] || 60;
  return { [k]: Math.max(1, Math.ceil((1 - b.hp / b.maxhp) * base * 0.5)) };
}
const sumBtn = (label, fn, cls, dis) => {
  const x = document.createElement('button'); x.className = 'btn' + (cls ? ' ' + cls : ''); x.textContent = label; x.disabled = !!dis;
  x.addEventListener('click', () => { fn(); infoSig = ''; updateInfo(); });
  return x;
};
let infoSig = '';
function orderState(u) {
  if (u.role === 'worker') return { goto: 'Walking where you sent it', toNode: 'Heading to gather', gather: 'Gathering', toDrop: 'Carrying a load', toSite: 'Heading to build', build: 'Building', toRepair: 'Heading to repair', repair: 'Repairing', toFarm: 'Heading to tend a farm', farm: 'Tending a farm', flee: 'Running for cover' }[u.state] || 'Idle';
  if (u.order) return { move: 'Moving', amove: 'Attack-moving', attack: 'Attacking a target' }[u.order.type];
  return u.hold ? 'Holding position' : u.tgt ? 'Fighting' : 'Guarding';
}
const buildCancelEl = $('buildCancel');
function cancelBuild() { G.build = null; ghost.visible = false; updateDock(true); sfx('click'); syncBuildCancel(); }
function syncBuildCancel() { const on = !!G.build && !G.over; buildCancelEl.classList.toggle('on', on); if (on) buildCancelEl.textContent = '\u2715 Stop building'; }
buildCancelEl.addEventListener('click', cancelBuild);
function updateInfo() {
  syncBuildCancel();
  const el = $('info'), b = G.sel;
  const us = G.selU;
  if (b && !b.dead) return updateBuildingInfo(el, b);
  if (us.length) return updateUnitInfo(el, us);
  el.classList.remove('on'); infoSig = '';
}
function updateBuildingInfo(el, b) {
  el.classList.add('on');
  $('infoTitle').textContent = b.def.name;
  $('infoRole').textContent = b.def.role || '';
  $('infoXpBox').style.display = 'none';
  $('infoHp').style.width = clamp(b.hp / b.maxhp * 100, 0, 100) + '%';
  $('infoText').textContent = `${Math.ceil(b.hp)} / ${b.maxhp} hp. ${bDescribe(b)}`;
  $('infoHelp').textContent = (b.def.what ? b.def.what + ' ' : '') + (b.def.help || '') + (b.hp < b.maxhp && b.done ? ' Idle settlers repair it for free once the raid is over, or you can pay to repair it now.' : '');
  const sig = 'b' + b.id + ':' + (b.hp < b.maxhp) + ':' + b.done;
  if (sig === infoSig) return;
  infoSig = sig;
  const row = $('infoBtns');
  row.innerHTML = '';
  if (b.hp < b.maxhp && b.done) {
    const c = repairCost(b);
    const r = document.createElement('button'); r.className = 'btn go'; r.innerHTML = 'Repair ' + costHTML(c).replace(/<span/g, '<span style="display:inline-flex;gap:3px;align-items:center"');
    r.addEventListener('click', () => { if (!afford(c)) return toast('Not enough resources', true); pay(c); b.hp = b.maxhp; dropBar(b); sfx('done'); infoSig = ''; });
    row.appendChild(r);
  }
  if (b.type !== 'keep') {
    const x = document.createElement('button'); x.className = 'btn warn'; x.textContent = 'Demolish';
    x.addEventListener('click', () => { for (const k in b.def.cost) G.res[k] += Math.floor(b.def.cost[k] * 0.5); destroyBuilding(b, true); infoSig = ''; });
    row.appendChild(x);
  }
}
function updateUnitInfo(el, us) {
  el.classList.add('on');
  const one = us.length === 1 ? us[0] : null, soldiers = us.filter(u => u.role !== 'worker'), workers = us.length - soldiers.length;
  const ready = us.filter(canAbility), cd = Math.ceil(Math.min(...soldiers.filter(u => u.lvl >= 3).map(u => Math.max(0, u.abCd)), 99));
  if (one) {
    $('infoTitle').textContent = `${one.name} the ${one.elite ? 'Elite ' : ''}${one.def.name}`;
    $('infoRole').textContent = `${one.elite ? 'Elite · ' : ''}Level ${one.lvl}${one.trait ? ' · ' + TRAITS[one.trait] : ''}`;
    $('infoHp').style.width = clamp(one.hp / one.maxhp * 100, 0, 100) + '%';
    $('infoXpBox').style.display = '';
    $('infoXp').style.width = (one.lvl >= MAXLVL ? 100 : clamp(one.xp / xpNeed(one.lvl) * 100, 0, 100)) + '%';
    const dmg = one.role === 'worker' ? '' : ` Damage ${Math.round(unitDmg(one) / (one.trait === 'lucky' ? 1 : 1))}.`;
    $('infoText').textContent = `${Math.ceil(one.hp)} / ${one.maxhp} hp.${dmg} ${orderState(one)}.` + (one.lvl < MAXLVL ? ` XP ${one.xp} / ${xpNeed(one.lvl)}.` : ' Max level.');
    const ab = ABIL[one.role];
    $('infoHelp').textContent = one.role === 'worker'
      ? `Levels up by working: carries ${carryCap(one)} per trip and works ${Math.round(7 * (one.lvl - 1))}% faster. Right-click a tree, rock, site or damaged building to send it there.${one.elite ? '' : ` Reach level ${PROMO_LVL} to promote it to Elite.`}`
      : ab ? (one.lvl >= 3 ? `${ab.name}: ${ab.desc} ${one.abCd > 0 ? `Ready in ${Math.ceil(one.abCd)}s.` : 'Ready.'}` : `Learns ${ab.name} at level 3: ${ab.desc}`) : '';
  } else {
    $('infoTitle').textContent = `${us.length} animals`;
    $('infoRole').textContent = `${soldiers.length ? soldiers.length + ' defenders' : ''}${soldiers.length && workers ? ', ' : ''}${workers ? workers + ' settlers' : ''}`;
    const avgHp = us.reduce((s2, u) => s2 + u.hp / u.maxhp, 0) / us.length;
    $('infoHp').style.width = clamp(avgHp * 100, 0, 100) + '%';
    $('infoXpBox').style.display = 'none';
    $('infoText').textContent = `Average level ${(us.reduce((s2, u) => s2 + u.lvl, 0) / us.length).toFixed(1)}.`;
    $('infoHelp').textContent = 'Right-click the ground to move, an enemy to attack, or a tree, rock or damaged building to send settlers to work.';
  }
  const sig = ['u', us.map(u => u.id || (u.id = bid++)).join(), G.cmd, ready.length, cd, soldiers.some(u => u.hold), us.filter(canPromote).length, afford(PROMO_COST)].join('|');
  if (sig === infoSig) return;
  infoSig = sig;
  const row = $('infoBtns');
  row.innerHTML = '';
  row.appendChild(sumBtn('Move', () => { G.cmd = G.cmd === 'move' ? null : 'move'; }, G.cmd === 'move' ? 'on' : ''));
  if (soldiers.length) {
    row.appendChild(sumBtn('Attack-move', () => { G.cmd = G.cmd === 'amove' ? null : 'amove'; }, G.cmd === 'amove' ? 'on' : ''));
    row.appendChild(sumBtn('Hold', () => orderHold(us), soldiers.every(u => u.hold) ? 'on' : ''));
    if (soldiers.some(u => u.lvl >= 3)) row.appendChild(sumBtn(ready.length ? 'Ability (F)' : `Ability ${cd}s`, () => castAbilities(), 'go', !ready.length));
  }
  row.appendChild(sumBtn(soldiers.length ? 'Stop / Return' : 'Back to work', () => { orderStop(us, true); G.cmd = null; }));
  const promo = us.filter(canPromote);
  if (promo.length) row.appendChild(sumBtn(promo.length > 1 ? `Promote ${promo.length}` : 'Promote to Elite', () => promoteUnits(us), 'go', !afford(PROMO_COST)));
  row.appendChild(sumBtn('Deselect', () => { G.selU = []; G.cmd = null; }));
}
function deselectAll() { G.sel = null; G.selU = []; G.cmd = null; infoSig = ''; sfx('click'); }
$('infoClose').addEventListener('click', deselectAll);
function castAbilities() { let n = 0; for (const u of G.selU) if (useAbility(u)) n++; if (!n) toast('No ability ready or no raiders in reach', true); }
let hintedMove = false;
function selectUnits(list, add) {
  G.sel = null; G.build = null; ghost.visible = false;
  if (add) { for (const u of list) if (!G.selU.includes(u)) G.selU.push(u); } else G.selU = list.slice();
  G.cmd = null; infoSig = ''; sfx('click'); updateDock(true);
  if (!hintedMove) { hintedMove = true; toast('Right-click to move or attack. On touch, tap the ground to move and tap a raider to attack.'); }
}

/* ===================== placement ghost ===================== */
const ghostMat = new THREE.MeshBasicMaterial({ color: 0x86c45e, transparent: true, opacity: 0.45, depthWrite: false });
const ghost = new THREE.Group();
const ghostBox = new THREE.Mesh(unitGeo, ghostMat);
const ghostRing = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }));
ghostRing.rotation.x = -Math.PI / 2; ghostRing.position.y = 0.06;
ghost.add(ghostBox, ghostRing); ghost.visible = false; scene.add(ghost);
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitV = new THREE.Vector3();
const canvasEl = renderer.domElement;
function tileAt(cx, cy) {
  const r = canvasEl.getBoundingClientRect();
  ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1));
  ray.setFromCamera(ndc, camera);
  if (!ray.ray.intersectPlane(plane, hitV)) return null;
  const def = G.build ? BDEF[G.build] : null;
  if (def && def.size === 2) return [Math.floor(hitV.x), Math.floor(hitV.z)];
  return [Math.round(hitV.x), Math.round(hitV.z)];
}
function updateGhost(cx, cy) {
  if (!G.build || G.over) { ghost.visible = false; return; }
  const t = tileAt(cx, cy);
  if (!t) { ghost.visible = false; return; }
  const def = BDEF[G.build], [cx2, cz2] = centerOf(def, t[0], t[1]);
  const ok = canPlace(G.build, t[0], t[1]) && G.age >= def.age;
  const h = def.wall ? 0.7 : def.range ? 1.2 : 0.7;
  ghost.visible = true;
  ghost.position.set(cx2, 0, cz2);
  ghostBox.scale.set(def.size * 0.95, h, def.size * 0.95); ghostBox.position.y = h / 2;
  ghostMat.color.setHex(ok ? 0x86c45e : 0xe8654f);
  ghostRing.visible = !!def.range;
  if (def.range) ghostRing.scale.setScalar(def.range);
}
function tryPlace(ai, aj, quiet) {
  const type = G.build;
  if (!type) return false;
  const def = BDEF[type];
  if (G.age < def.age) { if (!quiet) toast(`${def.name} unlocks in the ${AGES[def.age].name}`, true); return false; }
  if (!canPlace(type, ai, aj)) { if (!quiet) toast(placeWhy || 'Cannot build there', true); return false; }
  if (!afford(def.cost)) { if (!quiet) toast('Not enough resources', true); return false; }
  pay(def.cost);
  placeBuilding(type, ai, aj, false);
  return true;
}

/* ===================== pointer input ===================== */
const pts = new Map();
let down = null, painting = false, painted = false, lastPaint = '', pinch = null, marq = null, lastClick = { t: 0, u: null };
const pv = new THREE.Vector3();
function screenOf(o) {
  pv.set(o.x, (o.y || 0) + 0.5, o.z).project(camera);
  const r = canvasEl.getBoundingClientRect();
  return [r.left + (pv.x * 0.5 + 0.5) * r.width, r.top + (-pv.y * 0.5 + 0.5) * r.height, pv.z];
}
function unitAtScreen(list, cx, cy, maxPx) {
  let best = null, bd = maxPx;
  for (const u of list) {
    if (u.dead) continue;
    const [sx, sy, z] = screenOf(u);
    if (z > 1) continue;
    const d = Math.hypot(sx - cx, sy - cy);
    if (d < bd) { bd = d; best = u; }
  }
  return best;
}
function groundPoint(cx, cy) {
  const r = canvasEl.getBoundingClientRect();
  ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1));
  ray.setFromCamera(ndc, camera);
  return ray.ray.intersectPlane(plane, hitV) ? hitV : null;
}
function contextOrder(cx, cy) {
  const us = G.selU;
  if (!us.length) return;
  const foe = unitAtScreen(enemies, cx, cy, 30);
  if (foe) { if (us.some(u => u.role !== 'worker')) orderAttack(us, foe); else toast('Settlers cannot fight', true); return; }
  const p = groundPoint(cx, cy);
  if (!p) return;
  const i = Math.round(p.x), j = Math.round(p.z);
  let target = null;
  if (inMap(i, j)) {
    const nd = nodeAt[i][j], bb = occ[i][j];
    if (nd && nd.amt > 0) target = nd;
    else if (bb && (!bb.done || bb.hp < bb.maxhp)) target = bb;
  }
  const workers = us.filter(u => u.role === 'worker'), rest = us.filter(u => u.role !== 'worker');
  if (target && workers.length) { orderWork(workers, target); if (rest.length) orderMove(rest, p.x, p.z, false); }
  else orderMove(us, p.x, p.z, G.cmd === 'amove');
}
function leftClick(cx, cy, e) {
  const touch = e.pointerType === 'touch' || e.pointerType === 'pen';
  const R = touch ? 48 : 26, mine = unitAtScreen(units, cx, cy, R);
  if (mine) {
    const now = performance.now();
    if (lastClick.u === mine && now - lastClick.t < 380) selectUnits(units.filter(u => !u.dead && u.role === mine.role && Math.hypot(screenOf(u)[0] - screenOf(mine)[0], screenOf(u)[1] - screenOf(mine)[1]) < 900), false);
    else if (e.shiftKey && G.selU.includes(mine)) { G.selU = G.selU.filter(u => u !== mine); infoSig = ''; }
    else if (touch && G.selU.length === 1 && G.selU[0] === mine && now - lastClick.t > 380) { deselectAll(); lastClick = { t: now, u: null }; return; }
    else selectUnits([mine], e.shiftKey);
    lastClick = { t: now, u: mine };
    return;
  }
  if (touch && G.selU.length && !G.cmd) {
    const t0 = tileAt(cx, cy), b0 = t0 && inMap(t0[0], t0[1]) ? occ[t0[0]][t0[1]] : null;
    if (b0 && b0.done && b0.hp >= b0.maxhp) { G.selU = []; G.sel = b0; infoSig = ''; sfx('click'); return; }
    contextOrder(cx, cy); return;
  }
  if (G.selU.length && G.cmd) { const p = groundPoint(cx, cy); if (p) { const us = G.selU; orderMove(us, p.x, p.z, G.cmd === 'amove'); G.cmd = null; infoSig = ''; } return; }
  const foe = G.selU.length && unitAtScreen(enemies, cx, cy, touch ? 48 : 26);
  if (foe) { orderAttack(G.selU, foe); return; }
  const t = tileAt(cx, cy);
  G.selU = []; G.cmd = null;
  G.sel = t && inMap(t[0], t[1]) ? (occ[t[0]][t[1]] || null) : null;
  infoSig = '';
  if (G.sel) sfx('click');
}
function paint(cx, cy) {
  const t = tileAt(cx, cy);
  if (!t) return;
  const key = t[0] + ',' + t[1];
  if (key === lastPaint) return;
  lastPaint = key;
  if (tryPlace(t[0], t[1], true)) painted = true;
}
const marqEl = $('marquee');
canvasEl.addEventListener('contextmenu', e => e.preventDefault());
$('infoHelp').addEventListener('click', () => $('info').classList.toggle('more'));
canvasEl.addEventListener('pointerdown', e => {
  try { canvasEl.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  hideTip(); tipHold = 0;
  pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pts.size === 1) {
    down = { x: e.clientX, y: e.clientY, btn: e.button, moved: false, touch: e.pointerType === 'touch' || e.pointerType === 'pen', t: e.timeStamp };
    panVel.x = panVel.y = 0;
    painted = false;
    const def = G.build && BDEF[G.build];
    if (def && def.wall && e.button === 0 && !G.over) { painting = true; lastPaint = ''; paint(e.clientX, e.clientY); }
    else if (e.shiftKey && e.button === 0 && !G.build && !G.over) { marq = { x0: e.clientX, y0: e.clientY }; }
  } else { painting = false; marq = null; marqEl.style.display = 'none'; if (down) down.moved = true; pinch = null; }
  updateGhost(e.clientX, e.clientY);
});
canvasEl.addEventListener('pointermove', e => {
  const p = pts.get(e.pointerId);
  if (p) {
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 1 && down) {
      if (!down.moved && Math.hypot(e.clientX - down.x, e.clientY - down.y) > (down.touch ? 14 : 6)) down.moved = true;
      if (painting) paint(e.clientX, e.clientY);
      else if (marq) {
        if (down.moved) {
          marqEl.style.display = 'block';
          Object.assign(marqEl.style, { left: Math.min(marq.x0, e.clientX) + 'px', top: Math.min(marq.y0, e.clientY) + 'px', width: Math.abs(e.clientX - marq.x0) + 'px', height: Math.abs(e.clientY - marq.y0) + 'px' });
        }
      }
      else if (down.moved) {
        if (down.btn === 2) { cam.yaw -= dx * 0.006; cam.pitch += dy * 0.004; }
        else { panBy(dx, dy); const dts = Math.max(8, e.timeStamp - (down.lt || down.t)) / 1000; down.lt = e.timeStamp; panVel.x = panVel.x * 0.5 + (dx / dts) * 0.5; panVel.y = panVel.y * 0.5 + (dy / dts) * 0.5; }
      }
    } else if (pts.size === 2) {
      const a = [...pts.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y), ang = Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x);
      const mx = (a[0].x + a[1].x) / 2, my = (a[0].y + a[1].y) / 2;
      if (pinch) {
        camGoal.yaw = camGoal.pitch = camGoal.dist = null;
        const dA = Math.atan2(Math.sin(ang - pinch.a), Math.cos(ang - pinch.a)), g = pinch;
        g.accD += Math.abs(d - g.d); g.accA += Math.abs(dA) * d / 2;   // arc length travelled by the fingers while twisting
        if (!g.zoom && g.accD > 16 && g.accD > g.accA * 1.2) g.zoom = true;
        if (!g.rot && g.accA > 16 && g.accA > g.accD * 1.2) g.rot = true;
        panBy(mx - g.mx, my - g.my);
        if (g.zoom || (!g.rot && g.accD > g.accA)) cam.dist *= g.d / d;
        if (g.rot) cam.yaw += dA;   // twist clockwise -> the map turns clockwise under your fingers
        g.d = d; g.a = ang; g.mx = mx; g.my = my;
      } else pinch = { d, a: ang, mx, my, accD: 0, accA: 0, zoom: false, rot: false };
    }
  } else if (e.pointerType === 'mouse') hoverScene(e.clientX, e.clientY);
  updateGhost(e.clientX, e.clientY);
});
canvasEl.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hideTip(); });
let hoverT = 0;
const hoverObjs = [];
function hoverScene(cx, cy) {
  const now = performance.now();
  if (now - hoverT < 70) return;
  hoverT = now;
  if (G.build || pts.size || (tipHold && performance.now() < tipHold)) { if (G.build) hideTip(); return; }
  const r = canvasEl.getBoundingClientRect();
  ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1));
  ray.setFromCamera(ndc, camera);
  hoverObjs.length = 0;
  for (const b of buildings) hoverObjs.push(b.group);
  for (const u of units) if (!u.dead) hoverObjs.push(u.model);
  for (const e of enemies) if (!e.dead) hoverObjs.push(e.model);
  const hit = ray.intersectObjects(hoverObjs, true)[0];
  let target = null, isB = false;
  if (hit) {
    let o = hit.object;
    while (o && !(o.userData && (o.userData.b || o.userData.u))) o = o.parent;
    if (o) { target = o.userData.b || o.userData.u; isB = !!o.userData.b; }
  }
  if (!target) { const mine = unitAtScreen(units, cx, cy, 20) || unitAtScreen(enemies, cx, cy, 20); if (mine) target = mine; }
  if (!target) { hideTip(); return; }
  showTip(isB ? tipBuildingLive(target) : tipUnitLive(target), cx + 16, cy + 6, false);
}
function tipBuildingLive(b) {
  const status = !b.done ? `Under construction: ${Math.floor(b.progress * 100)}%` : b.hp < b.maxhp ? `Damaged: ${Math.ceil(b.hp)} / ${b.maxhp} hp` : `Healthy: ${b.maxhp} hp`;
  let extra = `<p class="tipx">${status}.${b.type === 'house' ? ` Population ${popCount()}/${G.popCap}.` : ''}</p>`;
  if (b.def.range) extra += `<p class="tipx">Currently hits for ${Math.round(b.def.dmg * (1 + 0.3 * G.age) * dmgMult())}.</p>`;
  return tipBuilding(b.def, extra);
}
function tipUnitLive(u) {
  if (u.team === 1) return `<b>${u.def.name}</b><i class="role" style="color:var(--danger)">Raider</i><p>${ENEMY_INFO[u.kind] || ''}</p>${statsRow([`HP ${Math.ceil(u.hp)} / ${Math.round(u.maxhp)}`, `Damage ${Math.round(u.dmg)}`, `Reward ${u.def.bounty} gold`])}`;
  const ab = ABIL[u.role];
  return `<b>${u.name} the ${u.def.name}</b><i class="role">Level ${u.lvl}${u.trait ? ' · ' + TRAITS[u.trait] : ''}</i><p>${u.def.what}</p>${statsRow([`HP ${Math.ceil(u.hp)} / ${u.maxhp}`, u.role === 'worker' ? orderState(u) : `Damage ${Math.round(u.def.dmg * dmgMult() * u.dmgM)}`])}<p class="tipx">Click to select, then right-click to give orders.${ab ? ` Learns ${ab.name} at level 3.` : ''}</p>`;
}
function endPointer(e, cancelled) {
  const wasOne = pts.size === 1;
  pts.delete(e.pointerId); pinch = null;
  if (!(wasOne && down && down.touch && down.moved && !cancelled && !painting && !marq) || (e.timeStamp - (down.lt || 0)) > 160) { panVel.x = panVel.y = 0; }
  if (marq && wasOne) {
    marqEl.style.display = 'none';
    if (down && down.moved && !cancelled) {
      const x0 = Math.min(marq.x0, e.clientX), x1 = Math.max(marq.x0, e.clientX), y0 = Math.min(marq.y0, e.clientY), y1 = Math.max(marq.y0, e.clientY);
      const sel = units.filter(u => { if (u.dead) return false; const [sx, sy] = screenOf(u); return sx >= x0 && sx <= x1 && sy >= y0 && sy <= y1; });
      if (sel.length) selectUnits(sel, false);
      down.moved = true; marq = null; painted = true;
    }
    marq = null;
  }
  if (wasOne && down && !down.moved && !cancelled && !painted && !G.over) {
    if (down.btn === 2) {
      if (G.build) { G.build = null; ghost.visible = false; updateDock(true); }
      else if (G.selU.length) contextOrder(e.clientX, e.clientY);
    } else if (down.btn === 0) {
      if (G.build) { const t = tileAt(e.clientX, e.clientY); if (t) tryPlace(t[0], t[1], false); }
      else leftClick(e.clientX, e.clientY, e);
    }
  }
  if (pts.size === 0) { down = null; painting = false; }
}
canvasEl.addEventListener('pointerup', e => endPointer(e, false));
canvasEl.addEventListener('pointercancel', e => endPointer(e, true));
function turnBy(a) { const base = camGoal.yaw !== null ? camGoal.yaw : cam.yaw; camGoal.yaw = base + a; panVel.x = panVel.y = 0; }
function turnBy(a) { const base = camGoal.yaw !== null ? camGoal.yaw : cam.yaw; camGoal.yaw = base + a; panVel.x = panVel.y = 0; }
const camHold = { id: null, t0: 0 };
function camStep(id) {
  if (id === 'zoomIn') cam.dist *= 0.78; else if (id === 'zoomOut') cam.dist *= 1.28;
  else if (id === 'rotL') turnBy(-Math.PI / 4); else if (id === 'rotR') turnBy(Math.PI / 4);
  else if (id === 'tiltBtn') camGoal.pitch = cam.pitch > 0.95 ? 0.6 : 1.15;
  else if (id === 'zoomReset') camGoal.dist = 30;
  else if (id === 'compass') { camGoal.yaw = 0.8 + Math.round((cam.yaw - 0.8) / TWO_PI) * TWO_PI; camGoal.pitch = 0.72; camGoal.dist = 30; }
  panVel.x = panVel.y = 0;
}
function camHoldTick(dt) {   // press and hold zoom / rotate / tilt buttons for smooth continuous movement
  if (!camHold.id || performance.now() - camHold.t0 < 260) return;
  camGoal.yaw = camGoal.pitch = camGoal.dist = null;
  if (camHold.id === 'zoomIn') cam.dist *= Math.exp(-1.3 * dt); else if (camHold.id === 'zoomOut') cam.dist *= Math.exp(1.3 * dt);
  else if (camHold.id === 'rotL') cam.yaw -= 1.5 * dt; else if (camHold.id === 'rotR') cam.yaw += 1.5 * dt;
  else if (camHold.id === 'tiltBtn') cam.pitch += (camHold.dir || 1) * 0.7 * dt;
}
for (const id of ['zoomIn', 'zoomOut', 'zoomReset', 'rotL', 'rotR', 'tiltBtn', 'compass']) {
  const b = $(id);
  b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try { b.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ } camHold.id = id; camHold.t0 = performance.now(); camHold.dir = cam.pitch > 0.95 ? -1 : 1; });
  const up = e => { if (camHold.id !== id) return; const held = performance.now() - camHold.t0; camHold.id = null; if (held < 260 && e.type === 'pointerup') camStep(id); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up);
  b.addEventListener('click', e => e.preventDefault());
}
canvasEl.addEventListener('wheel', e => { e.preventDefault(); cam.dist *= Math.exp(e.deltaY * 0.001); }, { passive: false });
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); if (!G.over && !$('intro').classList.contains('on')) G.paused = !G.paused; return; }
  if (k === '0' && !e.ctrlKey && !e.metaKey) { camGoal.dist = 30; return; }
  if (k === 'escape') { G.build = null; G.sel = null; G.selU = []; G.cmd = null; ghost.visible = false; updateDock(true); return; }
  if (!e.ctrlKey && !e.metaKey && G.selU.length && !G.over) {
    if (k === 'f') { castAbilities(); return; }
    if (k === 'h') { orderHold(G.selU); infoSig = ''; return; }
    if (k === 'x') { orderStop(G.selU, true); G.cmd = null; infoSig = ''; return; }
    if (k === 'm') { G.cmd = G.cmd === 'move' ? null : 'move'; infoSig = ''; return; }
    if (k === 't') { G.cmd = G.cmd === 'amove' ? null : 'amove'; infoSig = ''; return; }
  }
  keys[k] = true;
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

/* ===================== buttons, end screen ===================== */
function endGame(win) {
  G.over = true; G.paused = true;
  $('endTitle').textContent = win ? 'The chronicle is complete' : 'The Great Hall has fallen';
  $('endText').textContent = win
    ? `Fifteen raids broke against your walls. You reached the ${AGES[G.age].name} and defeated ${G.kills} raiders.`
    : `The clan held out for ${G.wave > 0 ? G.wave - 1 : 0} raids and defeated ${G.kills} raiders in the ${AGES[G.age].name}.`;
  $('endScreen').classList.add('on');
  sfx(win ? 'win' : 'lose');
}
$('startBtn').addEventListener('click', () => { audioInit(); sfx('click'); $('intro').classList.remove('on'); G.paused = false; });
$('againBtn').addEventListener('click', () => {
  $('endScreen').classList.remove('on');
  audioInit(); newGame(); G.paused = false; cam.tx = KX; cam.tz = KZ;
  renderDock(); updateDock(true); ghost.visible = false;
});
function refreshDiffButtons() {
  for (const [box, help] of [['introDiff', 'introDiffHelp'], ['menuDiff', 'menuDiffHelp']]) {
    const el = $(box); if (!el) continue;
    if (!el.childElementCount) for (const k in DIFF) { const b = document.createElement('button'); b.className = 'btn'; b.textContent = DIFF[k].name; b.dataset.d = k; b.addEventListener('click', () => { sfx('click'); setDifficulty(k, $('intro').classList.contains('on')); }); el.appendChild(b); }
    for (const b of el.children) b.classList.toggle('on', b.dataset.d === G.diff);
    $(help).textContent = DIFF[G.diff].blurb;
  }
}
try { const d = localStorage.getItem('pawhold.diff'); if (DIFF[d]) setDifficulty(d, true); } catch (e) { /* ignore */ }
refreshDiffButtons();
function popTip() {
  const w = units.filter(u => !u.dead && u.role === 'worker').length, s = units.filter(u => !u.dead && u.role !== 'worker').length, houses = buildings.filter(b => b.type === 'house' && b.done).length;
  const full = popCount() >= G.popCap;
  return `<b>Population ${popCount()} / ${G.popCap}</b><i class="role">${w} settlers, ${s} defenders</i><p class="what">Housing: the Great Hall holds ${BDEF.keep.pop} and each finished Burrow House ${BDEF.house.pop} more (${houses} house${houses === 1 ? '' : 's'} so far).</p><p class="help"><strong>How it grows:</strong> a new settler walks out of the Hall about every 11 seconds while there is room and you have 25 food. Trained defenders use housing too.</p><p class="tipx">${full ? 'Housing is full: nobody new will come until you build another Burrow House.' : 'Settlers also level up by working and can be promoted to Elite at level 5.'}</p>`;
}
$('popChip').addEventListener('click', e => { sfx('click'); showTip(popTip(), e.clientX || 60, (e.clientY || 60) + 14, false); tipHold = performance.now() + 4500; });
$('popChip').addEventListener('mouseenter', e => { if (!matchMedia('(pointer:coarse)').matches) showTip(popTip(), e.clientX, e.clientY + 14, false); });
$('popChip').addEventListener('mouseleave', () => { if (!tipHold) hideTip(); });
$('btnArmy').addEventListener('click', () => { const army = units.filter(u => !u.dead && u.role !== 'worker'); if (!army.length) return toast('No defenders yet. Build a Barracks and train some', true); selectUnits(army, false); });
$('btnMenu').addEventListener('click', () => { const hd = document.querySelector('.hud'); hd.classList.toggle('menu'); $('btnMenu').setAttribute('aria-expanded', hd.classList.contains('menu')); sfx('click'); });
$('btnPause').addEventListener('click', () => { if (!G.over && !$('intro').classList.contains('on')) G.paused = !G.paused; });
$('btnSpeed').addEventListener('click', () => { G.speed = G.speed >= 3 ? 1 : G.speed + 1; });
$('btnRotL').addEventListener('click', () => { cam.yaw -= 0.5; });
$('btnRotR').addEventListener('click', () => { cam.yaw += 0.5; });
$('ageBtn').addEventListener('click', () => { if (!G.over) { advanceAge(); updateDock(true); } });
$('callBtn').addEventListener('click', () => { if (!G.over && !G.paused) callEarly(); });
(function addAgeCost() {
  const s = document.createElement('span');
  s.id = 'ageCost'; s.style.cssText = 'display:flex;gap:6px;font-size:12px;color:var(--muted)';
  $('ageBtn').parentNode.insertBefore(s, $('ageBtn'));
})();

/* ===================== main loop ===================== */
let last = performance.now(), uiT = 0;
const SIM_DT = 0.05;
function adaptQuality(frameMs, dt) {   // if frames are slow for a while, drop render resolution a notch; if comfortably fast, creep back up
  QUALITY.ema += (frameMs - QUALITY.ema) * 0.08;
  QUALITY.adjustT -= dt;
  if (QUALITY.adjustT > 0) return;
  const cap = targetPixelRatio();
  if (QUALITY.ema > 42 && QUALITY.pr > QUALITY.minPr) { QUALITY.pr = Math.max(QUALITY.minPr, QUALITY.pr - 0.25); renderer.setPixelRatio(QUALITY.pr); QUALITY.adjustT = 2.5; }
  else if (QUALITY.ema < 22 && QUALITY.pr < cap) { QUALITY.pr = Math.min(cap, QUALITY.pr + 0.25); renderer.setPixelRatio(QUALITY.pr); QUALITY.adjustT = 4; }
  else QUALITY.adjustT = 1;
}
function frame(now) {
  requestAnimationFrame(frame);
  const elapsed = Math.min(0.25, Math.max(0, (now - last) / 1000));
  last = now;
  adaptQuality(elapsed * 1000, elapsed);
  // fixed-step simulation that catches up after a slow frame, so the game keeps real-time pace on phones
  const dt = Math.min(SIM_DT, elapsed);
  if (!G.paused && !G.over) {
    let rem = elapsed * G.speed, steps = 0;
    while (rem > 0.0005 && steps < 6) { const h = Math.min(SIM_DT, rem); step(h); rem -= h; steps++; }
  }
  const adt = G.paused ? 0 : dt * G.speed;
  camHoldTick(dt); panKeys(dt); applyCam();
  updateEnv(dt, now); updateFx(dt, now); audioUpdate(dt); autosaveTick(dt);
  if (tipHold && now > tipHold) { tipHold = 0; hideTip(); }
  for (const u of units) if (!u.dead) animateUnit(u, adt);
  for (const e of enemies) if (!e.dead) animateUnit(e, adt);
  for (const b of buildings) {
    const fl = b.group.userData.flags;
    if (fl) for (let i = 0; i < fl.length; i++) fl[i].rotation.y = Math.sin(now / 260 + b.id + i) * 0.35;
  }
  if (G.sel && !G.sel.dead && G.sel.group) { /* selection ring */
    selRing.visible = true; selRing.position.set(G.sel.x, 0.08, G.sel.z); selRing.scale.setScalar(G.sel.def.size === 3 ? 2.4 : G.sel.def.size === 2 ? 1.5 : 0.8);
  } else selRing.visible = false;
  updateSelRings();
  updateBars();
  uiT -= dt;
  if (uiT <= 0) { uiT = 0.2; updateDock(false); updateInfo(); }
  updateHUD();
  renderer.render(scene, camera);
}
const selRings = [];
function updateSelRings() {
  const us = G.selU;
  for (let k = 0; k < us.length || k < selRings.length; k++) {
    let r = selRings[k];
    if (k >= us.length) { if (r) r.visible = false; continue; }
    if (!r) { r = selRings[k] = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xf0b94a, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false })); r.rotation.x = -Math.PI / 2; scene.add(r); }
    const u = us[k];
    if (!u.dead && !u.bar) showBar(u);
    r.visible = !u.dead; r.position.set(u.x, u.y + 0.06, u.z);
  }
  canvasEl.style.cursor = G.cmd ? 'crosshair' : '';
}
const selRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 40), new THREE.MeshBasicMaterial({ color: 0xf0b94a, side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false }));
selRing.rotation.x = -Math.PI / 2; selRing.visible = false; scene.add(selRing);

resize();
newGame();
renderDock(); updateDock(true);
applyCam();
requestAnimationFrame(frame);
