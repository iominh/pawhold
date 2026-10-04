/* ===================== theme (day / night) and weather ===================== */
const ENV = {
  dark: false, mode: 'auto', night: 0, wType: 'clear', wAuto: true, wTimer: 50,
  w: { cloud: 0.1, rain: 0, snow: 0, fog: 0, storm: 0 },
  tod: 0.3, todMode: 'auto', todPin: 0.5, sCur: 0, sMode: 'auto', sPin: 0, sw: [1, 0, 0, 0], season: 0, seasonSeen: -1, elev: 1, tw: 0, flash: 0, nextBolt: 5, cover: 0, wet: 0, colSig: '', paintT: 0, wind: 0.3, sky: new THREE.Color(AGES[0].sky), cloudVis: 1
};
const WEATHER = {
  clear:  { cloud: 0.1, rain: 0, snow: 0, fog: 0, storm: 0, label: 'Clear' },
  cloudy: { cloud: 0.85, rain: 0, snow: 0, fog: 0, storm: 0, label: 'Overcast' },
  rain:   { cloud: 0.9, rain: 0.75, snow: 0, fog: 0, storm: 0, label: 'Rain' },
  storm:  { cloud: 1, rain: 1, snow: 0, fog: 0, storm: 1, label: 'Storm' },
  snow:   { cloud: 0.7, rain: 0, snow: 0.85, fog: 0, storm: 0, label: 'Snow' },
  fog:    { cloud: 0.5, rain: 0, snow: 0, fog: 1, storm: 0, label: 'Fog' }
};
const AUTO_BY_SEASON = [
  ['clear', 'clear', 'cloudy', 'rain', 'rain', 'fog'],
  ['clear', 'clear', 'clear', 'clear', 'cloudy', 'storm', 'rain'],
  ['cloudy', 'cloudy', 'rain', 'rain', 'fog', 'clear', 'storm'],
  ['snow', 'snow', 'snow', 'cloudy', 'fog', 'clear']
];
const SEASON_SEC = 150, DAY_SEC = 300;
const SEASONS = [
  { name: 'Spring', leaf: [0x5cc04a, 0x6fcf57, 0x4fb243], grass: [0x8fe66a, 0.28], food: 1.0, blurb: 'Spring: rain waters the valley and blossom drifts by.' },
  { name: 'Summer', leaf: [0x3f8a3c, 0x4a9a45, 0x367a38], grass: [0xb4d94a, 0.18], food: 1.1, blurb: 'Summer: long sunny days. Berry farms yield 10% more food.' },
  { name: 'Autumn', leaf: [0xdb7f2a, 0xc4532b, 0xe3a936], grass: [0xb59a45, 0.5], food: 1.3, blurb: 'Autumn: harvest time. Berry farms yield 30% more food, and leaves fall.' },
  { name: 'Winter', leaf: [0x56705a, 0x4f6a58, 0x5d7a64], grass: [0xc3cfc6, 0.55], food: 0.5, blurb: 'Winter: snow settles on the valley and berry farms yield half the food.' }
];
const SEASON_COL = SEASONS.map(x => ({ leaf: x.leaf.map(h => new THREE.Color(h)), grass: new THREE.Color(x.grass[0]), amt: x.grass[1] }));
const seasonFood = () => SEASONS.reduce((a, x, i) => a + ENV.sw[i] * x.food, 0);
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const WX_CYCLE = ['auto', 'clear', 'cloudy', 'rain', 'storm', 'snow', 'fog'];
const envEl = id => document.getElementById(id);

/* ---- theme follows the viewer; the button can override ---- */
const htmlEl = document.documentElement;
const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
function detectTheme() {
  const a = htmlEl.getAttribute('data-theme');
  ENV.mode = a === 'dark' || a === 'light' ? a : 'auto';
  ENV.dark = a === 'dark' || (a !== 'light' && !!(mq && mq.matches));
  const b = envEl('btnTheme');
  if (b) b.textContent = 'Theme: ' + (ENV.mode === 'auto' ? 'Auto' : ENV.mode === 'dark' ? 'Dark' : 'Light');
}
if (window.MutationObserver) new MutationObserver(detectTheme).observe(htmlEl, { attributes: true, attributeFilter: ['data-theme'] });
if (mq) { if (mq.addEventListener) mq.addEventListener('change', detectTheme); else if (mq.addListener) mq.addListener(detectTheme); }
envEl('btnTheme').addEventListener('click', () => {
  const next = ENV.mode === 'auto' ? 'light' : ENV.mode === 'light' ? 'dark' : 'auto';
  if (next === 'auto') htmlEl.removeAttribute('data-theme'); else htmlEl.setAttribute('data-theme', next);
  detectTheme(); sfx('click');
});
function refreshWeatherButton() {
  envEl('btnWeather').textContent = 'Weather: ' + WEATHER[ENV.wType].label + (ENV.wAuto ? ' (auto)' : '');
}
const TIME_MODES = [['auto', null], ['dawn', 0.25], ['day', 0.5], ['dusk', 0.75], ['night', 0.0]];
envEl('btnTime').addEventListener('click', () => {
  const i = TIME_MODES.findIndex(m => m[0] === ENV.todMode), nx = TIME_MODES[(i + 1) % TIME_MODES.length];
  ENV.todMode = nx[0]; if (nx[1] !== null) ENV.todPin = nx[1];
  envLabelSig = ''; sfx('click');
});
envEl('btnSeason').addEventListener('click', () => {
  if (ENV.sMode === 'auto') { ENV.sMode = 'pin'; ENV.sPin = Math.floor(ENV.sCur) % 4; }
  else if (ENV.sPin === 3) ENV.sMode = 'auto';
  else ENV.sPin++;
  envLabelSig = ''; sfx('click');
});
let envLabelSig = '';
function timeLabel() {
  const h = ENV.tod * 24, hh = Math.floor(h), mm = Math.floor((h - hh) * 60), n = ENV.night, e = ENV.elev, am = ENV.tod < 0.5;
  const clock = (hh % 12 || 12) + ':' + String(mm).padStart(2, '0') + (hh >= 12 ? 'pm' : 'am');
  const nm = n > 0.85 ? 'Night' : ENV.tw > 0.35 ? (am ? 'Sunrise' : 'Sunset') : n > 0.3 ? (am ? 'Dawn' : 'Dusk') : e > 0.8 ? 'Midday' : am ? 'Morning' : 'Afternoon';
  return nm + ' ' + clock;
}
function refreshEnvLabels() {
  const t = 'Time: ' + timeLabel() + (ENV.todMode === 'auto' ? '' : ' (set)'), se = 'Season: ' + SEASONS[ENV.season].name + (ENV.sMode === 'auto' ? '' : ' (set)');
  const sig = t + se;
  if (sig === envLabelSig) return;
  envLabelSig = sig;
  envEl('btnTime').textContent = t; envEl('btnSeason').textContent = se;
}
envEl('btnWeather').addEventListener('click', () => {
  const cur = ENV.wAuto ? 'auto' : ENV.wType;
  const next = WX_CYCLE[(WX_CYCLE.indexOf(cur) + 1) % WX_CYCLE.length];
  if (next === 'auto') { ENV.wAuto = true; ENV.wTimer = rnd(30, 60); }
  else { ENV.wAuto = false; ENV.wType = next; }
  refreshWeatherButton(); sfx('click');
});

/* ---- sky bodies, clouds, stars ---- */
const sunMesh = new THREE.Mesh(unitGeo, new THREE.MeshBasicMaterial({ color: 0xfff2b0, fog: false }));
scene.add(sunMesh);
const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
const clouds = [];
for (let k = 0; k < 10; k++) {
  const g = new THREE.Group(), parts = rint(4, 6);
  for (let q = 0; q < parts; q++) box(g, rnd(-3, 2), rnd(0, 0.8), rnd(-2, 1.5), rnd(2.5, 5), rnd(0.9, 1.6), rnd(2, 3.4), 0xffffff, { mat: cloudMat });
  g.position.set(rnd(-10, MAP + 10), rnd(30, 36), rnd(-10, MAP + 10));
  g.userData = { th: k / 10, sp: rnd(0.4, 0.9) };
  scene.add(g); clouds.push(g);
}
const starGeo = new THREE.BufferGeometry();
{
  const pos = new Float32Array(300 * 3);
  for (let i = 0; i < 300; i++) {
    const a = rnd(0, 6.283), e = rnd(0.2, 1.4), r = 140;
    pos[i * 3] = KX + Math.cos(a) * Math.cos(e) * r; pos[i * 3 + 1] = Math.sin(e) * r; pos[i * 3 + 2] = KZ + Math.sin(a) * Math.cos(e) * r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
}
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false }));
stars.frustumCulled = false; scene.add(stars);
const keepLight = new THREE.PointLight(0xffc36b, 0, 16, 1.6);
keepLight.position.set(KX, 3.2, KZ + 1.8);
scene.add(keepLight);

/* ---- rain and snow as voxel flecks ---- */
const R_N = 1500, S_N = 1200, WR = 26, WH = 24;
const rainMesh = new THREE.InstancedMesh(unitGeo, new THREE.MeshBasicMaterial({ color: 0xcfe3f5, transparent: true, opacity: 0.5, depthWrite: false, fog: false }), R_N);
const snowMesh = new THREE.InstancedMesh(unitGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92, depthWrite: false, fog: false }), S_N);
rainMesh.frustumCulled = snowMesh.frustumCulled = false;
rainMesh.count = snowMesh.count = 0;
scene.add(rainMesh, snowMesh);
const L_N = 260, lp = new Float32Array(L_N * 3);
const leafMesh = new THREE.InstancedMesh(unitGeo, new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x442211 }), L_N);
leafMesh.frustumCulled = false; leafMesh.count = 0;
const LEAF_AUT = [0xdb7f2a, 0xc4532b, 0xe3a936, 0xa8442a].map(h => new THREE.Color(h)), LEAF_SPR = [0xffc6dc, 0xffe3ec, 0xf7a8c8].map(h => new THREE.Color(h));
for (let i = 0; i < L_N; i++) { leafMesh.setColorAt(i, LEAF_AUT[i % 4]); lp[i * 3] = KX + rnd(-WR, WR); lp[i * 3 + 1] = rnd(0, 12); lp[i * 3 + 2] = KZ + rnd(-WR, WR); }
scene.add(leafMesh);
const rp = new Float32Array(R_N * 3), sp = new Float32Array(S_N * 3);
for (let i = 0; i < R_N; i++) { rp[i * 3] = KX + rnd(-WR, WR); rp[i * 3 + 1] = rnd(0, WH); rp[i * 3 + 2] = KZ + rnd(-WR, WR); }
for (let i = 0; i < S_N; i++) { sp[i * 3] = KX + rnd(-WR, WR); sp[i * 3 + 1] = rnd(0, WH); sp[i * 3 + 2] = KZ + rnd(-WR, WR); }
const dum = new THREE.Object3D();
function wrapAround(v, c) { return v < c - WR ? v + 2 * WR : v > c + WR ? v - 2 * WR : v; }
function updateLeaves(dt, t, cx, cz) {
  const w = ENV.w, aut = ENV.sw[2], spr = ENV.sw[0];
  const lw = clamp(aut + spr * 0.35, 0, 1) * clamp(1 - w.rain * 0.8 - w.snow, 0, 1);
  const n = Math.floor(L_N * lw);
  leafMesh.count = n;
  if (!n) return;
  const pal = aut >= spr ? LEAF_AUT : LEAF_SPR;
  let recol = false;
  for (let i = 0; i < n; i++) {
    let x = lp[i * 3] + (Math.sin(t * 0.0012 + i) * 0.9 + ENV.wind * 2.4) * dt, y = lp[i * 3 + 1] - (0.8 + (i % 4) * 0.18) * dt, z = lp[i * 3 + 2] + Math.cos(t * 0.001 + i * 1.7) * 0.6 * dt;
    if (y < 0) { y += 12; x = cx + rnd(-WR, WR); z = cz + rnd(-WR, WR); leafMesh.setColorAt(i, pal[i % pal.length]); recol = true; }
    x = wrapAround(x, cx); z = wrapAround(z, cz);
    lp[i * 3] = x; lp[i * 3 + 1] = y; lp[i * 3 + 2] = z;
    dum.rotation.set(t * 0.002 + i, i * 0.7 + t * 0.0015, 0); dum.scale.set(0.14, 0.04, 0.14);
    dum.position.set(x, y, z); dum.updateMatrix(); leafMesh.setMatrixAt(i, dum.matrix);
  }
  leafMesh.instanceMatrix.needsUpdate = true;
  if (recol && leafMesh.instanceColor) leafMesh.instanceColor.needsUpdate = true;
}
function updateParticles(dt, t, cx, cz) {
  const w = ENV.w;
  updateLeaves(dt, t, cx, cz);
  const rn = Math.floor(R_N * clamp(w.rain * 1.05, 0, 1));
  rainMesh.count = rn;
  if (rn > 0) {
    const fall = 24, drift = ENV.wind * 7;
    dum.rotation.set(0, 0, -Math.atan2(drift, fall)); dum.scale.set(0.03, 0.7, 0.03);
    for (let i = 0; i < rn; i++) {
      let x = rp[i * 3] + drift * dt, y = rp[i * 3 + 1] - (fall + (i % 7)) * dt, z = rp[i * 3 + 2];
      if (y < 0) { y += WH; x = cx + rnd(-WR, WR); z = cz + rnd(-WR, WR); }
      x = wrapAround(x, cx); z = wrapAround(z, cz);
      rp[i * 3] = x; rp[i * 3 + 1] = y; rp[i * 3 + 2] = z;
      dum.position.set(x, y, z); dum.updateMatrix(); rainMesh.setMatrixAt(i, dum.matrix);
    }
    rainMesh.instanceMatrix.needsUpdate = true;
    if (Math.random() < dt * 40 * w.rain) puff(cx + rnd(-14, 14), 0.08, cz + rnd(-14, 14), 0xcfe3f5, 1, 0.9, 0.25, 0.05);
  }
  const sn = Math.floor(S_N * clamp(w.snow * 1.1, 0, 1));
  snowMesh.count = sn;
  if (sn > 0) {
    dum.rotation.set(0, 0, 0); dum.scale.set(0.1, 0.1, 0.1);
    for (let i = 0; i < sn; i++) {
      let x = sp[i * 3] + Math.sin(t * 0.0009 + i) * 0.7 * dt + ENV.wind * 0.8 * dt, y = sp[i * 3 + 1] - (2.2 + (i % 5) * 0.25) * dt, z = sp[i * 3 + 2];
      if (y < 0) { y += WH; x = cx + rnd(-WR, WR); z = cz + rnd(-WR, WR); }
      x = wrapAround(x, cx); z = wrapAround(z, cz);
      sp[i * 3] = x; sp[i * 3 + 1] = y; sp[i * 3 + 2] = z;
      dum.position.set(x, y, z); dum.updateMatrix(); snowMesh.setMatrixAt(i, dum.matrix);
    }
    snowMesh.instanceMatrix.needsUpdate = true;
  }
}

/* ---- lightning ---- */
const bolts = [];
function strike() {
  const x = (typeof cam !== 'undefined' ? cam.tx : KX) + rnd(-16, 16), z = (typeof cam !== 'undefined' ? cam.tz : KZ) + rnd(-16, 16), g = new THREE.Group();
  let px = 0;
  for (let k = 0; k < 8; k++) {
    const y = 30 - k * 3.7, nx = px + rnd(-0.9, 0.9);
    box(g, Math.min(px, nx) - 0.08, y - 3.7, -0.08, Math.abs(nx - px) + 0.16, 3.7, 0.16, 0xffffff, { basic: true, noshadow: true });
    px = nx;
  }
  g.position.set(x, 0, z); scene.add(g);
  bolts.push({ g, life: 0.22 });
  puff(x, 0.3, z, 0xffffff, 8, 2.5, 0.4, 0.15);
  ENV.flash = 1;
  sfx('crack'); setTimeout(() => sfx('thunder'), rint(350, 1400));
}

/* ---- snow cover and wet ground ---- */
const WHITE = new THREE.Color(0xffffff), C_BLACK = new THREE.Color(0x000000);
const C_GREY_DAY = new THREE.Color(0x93a1ad), C_GREY_NIGHT = new THREE.Color(0x1a212b);
const C_SNOW_DAY = new THREE.Color(0xe3eaf1), C_SNOW_NIGHT = new THREE.Color(0x3b4655);
const C_FOG_DAY = new THREE.Color(0xd0d6da), C_FOG_NIGHT = new THREE.Color(0x242b34);
const C_NIGHT = new THREE.Color(0x0b1430), C_STORM = new THREE.Color(0x5c6570), C_CLOUD_NIGHT = new THREE.Color(0x3a4558);
const C_SUN = new THREE.Color(), C_MOON = new THREE.Color(0x9fb4ff), C_SUNRISE = new THREE.Color(0xf6a98c), C_SUNSET = new THREE.Color(0xf0803f), C_DAWN = new THREE.Color(0xff9a52);
const cA = new THREE.Color(), cB = new THREE.Color();
const ICE = new THREE.Color(0xcfe9f2), tintC = new THREE.Color();
let tintAmt = 0;
function paintTerrain() {
  if (!terrain || !terrainBase.length || !terrain.instanceColor) return;
  const k = Math.round(ENV.cover * 50) + ':' + Math.round(ENV.wet * 30) + ':' + Math.round(tintAmt * 40) + tintC.getHexString() + Math.round(ENV.sw[3] * 20);
  if (k === ENV.colSig) return;
  ENV.colSig = k;
  let q = 0;
  for (let i = 0; i < MAP; i++) for (let j = 0; j < MAP; j++) {
    cA.copy(terrainBase[q]);
    const kd = kind[i][j];
    if (kd === 'g') cA.lerp(tintC, tintAmt); else if (kd === 'h') cA.lerp(tintC, tintAmt * 0.4); else if (kd === 'p') cA.lerp(ICE, ENV.sw[3] * 0.75);
    if (ENV.wet > 0) cA.multiplyScalar(1 - 0.2 * ENV.wet);
    cA.lerp(WHITE, ENV.cover * (kd === 'p' ? 0.55 : 0.88));
    terrain.setColorAt(q++, cA);
  }
  terrain.instanceColor.needsUpdate = true;
}
function resetEnv() {
  ENV.cover = 0; ENV.wet = 0; ENV.colSig = ''; ENV.wTimer = 45; ENV.flash = 0;
  if (ENV.wAuto) ENV.wType = 'clear';
  ENV.tod = 0.3; ENV.sCur = ENV.sMode === 'auto' ? 0 : ENV.sPin; ENV.sw = [0, 0, 0, 0]; ENV.sw[Math.floor(ENV.sCur) % 4] = 1; ENV.season = Math.floor(ENV.sCur) % 4; ENV.seasonSeen = ENV.season; envLabelSig = '';
  refreshWeatherButton();
}

/* ---- per-frame update ---- */
const lerpN = (a, b, t) => a + (b - a) * t;
function updateEnv(dt, now) {
  const t = now || 0, gdt = G.paused ? 0 : dt * G.speed, TAU = Math.PI * 2;
  // seasons
  if (ENV.sMode === 'auto') ENV.sCur = (ENV.sCur + gdt / SEASON_SEC) % 4;
  else { const d = ((ENV.sPin - ENV.sCur + 6) % 4) - 2; ENV.sCur = (ENV.sCur + clamp(d, -dt * 1.2, dt * 1.2) + 4) % 4; }
  { const si = Math.floor(ENV.sCur) % 4, f = ENV.sCur - Math.floor(ENV.sCur), b2 = sstep(0.72, 1, f);
    ENV.sw[0] = ENV.sw[1] = ENV.sw[2] = ENV.sw[3] = 0; ENV.sw[si] = 1 - b2; ENV.sw[(si + 1) % 4] = b2;
    ENV.season = b2 > 0.5 ? (si + 1) % 4 : si; }
  if (ENV.season !== ENV.seasonSeen) {
    ENV.seasonSeen = ENV.season;
    if (G.t > 1) { toast(SEASONS[ENV.season].blurb); sfx('age'); }
    if (ENV.wAuto) ENV.wTimer = Math.min(ENV.wTimer, 6);
  }
  // time of day
  if (ENV.todMode === 'auto') ENV.tod = (ENV.tod + gdt / DAY_SEC) % 1;
  else { const dd = (ENV.todPin - ENV.tod + 1) % 1; if (dd > 0.001) ENV.tod = (ENV.tod + Math.min(dd, dt * 0.18)) % 1; }
  const ang = (ENV.tod - 0.25) * TAU, ax = Math.cos(ang), ay = Math.sin(ang);
  ENV.elev = ay;
  ENV.tw = Math.pow(clamp(1 - Math.abs(ay) / 0.32, 0, 1), 1.3);
  ENV.night = sstep(0.12, -0.28, ay);
  const n = ENV.night, tw = ENV.tw, sunUp = ay >= -0.02, am = ENV.tod < 0.5;
  // season colours: trees and grass
  for (let k = 0; k < 3; k++) {
    cA.setRGB(0, 0, 0);
    for (let i = 0; i < 4; i++) if (ENV.sw[i] > 0) { const c = SEASON_COL[i].leaf[k]; cA.r += c.r * ENV.sw[i]; cA.g += c.g * ENV.sw[i]; cA.b += c.b * ENV.sw[i]; }
    cA.lerp(WHITE, ENV.cover * 0.55);
    leafMats[k].color.copy(cA);
  }
  tintC.setRGB(0, 0, 0); tintAmt = 0;
  for (let i = 0; i < 4; i++) { const c = SEASON_COL[i].grass; tintC.r += c.r * ENV.sw[i]; tintC.g += c.g * ENV.sw[i]; tintC.b += c.b * ENV.sw[i]; tintAmt += SEASON_COL[i].amt * ENV.sw[i]; }

  if (ENV.wAuto) {
    ENV.wTimer -= dt;
    if (ENV.wTimer <= 0) { ENV.wTimer = rnd(55, 110); ENV.wType = pick(AUTO_BY_SEASON[ENV.season]); refreshWeatherButton(); }
  }
  const tg = WEATHER[ENV.wType], w = ENV.w, k = Math.min(1, dt * 0.5);
  for (const key of ['cloud', 'rain', 'snow', 'fog', 'storm']) w[key] += (tg[key] - w[key]) * k;
  ENV.wind = (0.3 + 0.7 * w.storm + 0.25 * w.rain) * (1 + 0.3 * Math.sin(t * 0.0007));

  // sky and fog colour: day blue, orange at sunrise and sunset, deep blue at night
  cA.setHex(AGES[G.age].sky).lerp(cB.setHex(0xcfdbe6), ENV.sw[3] * 0.25);
  cA.lerp(am ? C_SUNRISE : C_SUNSET, tw * 0.78 * (1 - w.cloud * 0.4));
  cA.lerp(C_NIGHT, n * 0.92);
  cB.copy(C_GREY_DAY).lerp(C_GREY_NIGHT, n); cA.lerp(cB, w.cloud * 0.6);
  cA.lerp(C_BLACK, w.storm * 0.3 * (1 - n * 0.5));
  cB.copy(C_SNOW_DAY).lerp(C_SNOW_NIGHT, n); cA.lerp(cB, w.snow * 0.35);
  cB.copy(C_FOG_DAY).lerp(C_FOG_NIGHT, n); cA.lerp(cB, w.fog * 0.9);
  ENV.sky.lerp(cA, Math.min(1, dt * 1.5));
  scene.background.copy(ENV.sky).lerp(WHITE, ENV.flash * 0.5);
  scene.fog.color.copy(scene.background);
  const dense = Math.max(w.fog, w.rain * 0.55, w.snow * 0.45, w.storm * 0.7);
  scene.fog.near = lerpN(60, 12, dense); scene.fog.far = lerpN(130, 55, dense);

  // lights: the sun arcs east to west, the moon takes over below the horizon
  const dim = 1 - 0.5 * w.cloud;
  const px = sunUp ? ax : -ax, py = sunUp ? ay : -ay;
  const fx = typeof cam !== 'undefined' ? cam.tx : KX, fz = typeof cam !== 'undefined' ? cam.tz : KZ;
  sun.position.set(fx + px * 46, Math.max(11, py * 46), fz + (sunUp ? 18 : 14)); sun.target.position.set(fx, 0, fz); sun.target.updateMatrixWorld();
  if (sunUp) C_SUN.setHex(AGES[G.age].sun).lerp(C_DAWN, tw * 0.8); else C_SUN.copy(C_MOON);
  sun.color.copy(C_SUN);
  sun.intensity = (sunUp ? AGES[G.age].sunI * dim * sstep(-0.02, 0.3, ay) : 0.34 * dim * sstep(0.02, 0.3, -ay)) + ENV.flash * 0.6;
  hemi.intensity = lerpN(0.72 * (1 - 0.25 * w.cloud), 0.42, n) + ENV.flash * 1.4;
  hemi.color.setHex(0xffffff).lerp(cB.setHex(0xffd1a8), tw * 0.45).lerp(cB.setHex(0x8fa0d8), n);
  hemi.groundColor.setHex(0x6b8f5a).lerp(cB.setHex(0x2a3a4a), n);

  // sun and moon discs, stars
  sunMesh.visible = w.cloud < 0.85;
  sunMesh.position.set(fx + (sun.position.x - fx) * 2.2, sun.position.y * 2.2, fz + (sun.position.z - fz) * 2.2);
  sunMesh.scale.setScalar(lerpN(7, 5, n) * (1 + tw * 0.35));
  if (sunUp) sunMesh.material.color.setHex(0xfff2b0).lerp(cB.setHex(0xff7a30), tw * 0.85); else sunMesh.material.color.setHex(0xe8eeff);
  stars.material.opacity = n * (1 - w.cloud) * 0.9;
  stars.visible = stars.material.opacity > 0.02;

  // clouds drift, thicken with the weather, and fade when the camera is above them
  const camLow = camera.position.y < 28 ? 1 : 0;
  ENV.cloudVis += (camLow - ENV.cloudVis) * Math.min(1, dt * 3);
  cloudMat.opacity = ENV.cloudVis;
  cloudMat.color.setHex(0xffffff).lerp(C_STORM, Math.max(w.rain * 0.6, w.storm)).lerp(C_CLOUD_NIGHT, n * 0.8);
  for (const c of clouds) {
    c.position.x += c.userData.sp * (1 + ENV.wind * 2) * dt;
    if (c.position.x > MAP + 22) { c.position.x = -22; c.position.z = rnd(-10, MAP + 10); }
    const vis = clamp((w.cloud + 0.15 - c.userData.th) * 4, 0, 1);
    c.scale.set(vis * (1 + w.cloud * 0.6), vis, vis * (1 + w.cloud * 0.6));
    c.visible = vis > 0.02;
  }

  // windows and braziers warm up at night
  lampMat.color.setHex(0xbfe3f2).lerp(cB.setHex(0xffd36b), n);
  keepLight.intensity = n * 1.6;

  // lightning
  ENV.flash = Math.max(0, ENV.flash - dt * 4.5);
  if (w.storm > 0.5) { ENV.nextBolt -= dt; if (ENV.nextBolt <= 0) { ENV.nextBolt = rnd(3, 9); strike(); } }
  for (let i = bolts.length - 1; i >= 0; i--) { bolts[i].life -= dt; if (bolts[i].life <= 0) { scene.remove(bolts[i].g); bolts.splice(i, 1); } }

  // ground: snow settles, rain darkens
  { const floor = ENV.sw[3] * 0.5;
    ENV.cover = clamp(ENV.cover + (w.snow > 0.35 ? w.snow * 0.03 : ENV.cover > floor ? -0.012 : 0.01) * dt, 0, 1); }
  ENV.wet += (Math.max(w.rain, w.storm) - ENV.wet) * Math.min(1, dt * 0.3);
  ENV.paintT -= dt;
  if (ENV.paintT <= 0) { ENV.paintT = 0.35; paintTerrain(); }

  updateParticles(dt, t, cam.tx, cam.tz);
  ENV.labT = (ENV.labT || 0) - dt; if (ENV.labT <= 0) { ENV.labT = 0.4; refreshEnvLabels(); }
}
detectTheme();
refreshWeatherButton();
