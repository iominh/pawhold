/* ===================== theme (day / night) and weather ===================== */
const ENV = {
  dark: false, mode: 'auto', night: 0, wType: 'clear', wAuto: true, wTimer: 50,
  w: { cloud: 0.1, rain: 0, snow: 0, fog: 0, storm: 0 },
  flash: 0, nextBolt: 5, cover: 0, wet: 0, colSig: '', paintT: 0, wind: 0.3, sky: new THREE.Color(AGES[0].sky), cloudVis: 1
};
const WEATHER = {
  clear:  { cloud: 0.1, rain: 0, snow: 0, fog: 0, storm: 0, label: 'Clear' },
  cloudy: { cloud: 0.85, rain: 0, snow: 0, fog: 0, storm: 0, label: 'Overcast' },
  rain:   { cloud: 0.9, rain: 0.75, snow: 0, fog: 0, storm: 0, label: 'Rain' },
  storm:  { cloud: 1, rain: 1, snow: 0, fog: 0, storm: 1, label: 'Storm' },
  snow:   { cloud: 0.7, rain: 0, snow: 0.85, fog: 0, storm: 0, label: 'Snow' },
  fog:    { cloud: 0.5, rain: 0, snow: 0, fog: 1, storm: 0, label: 'Fog' }
};
const AUTO_WX = ['clear', 'clear', 'cloudy', 'rain', 'rain', 'fog', 'snow', 'storm'];
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
const rp = new Float32Array(R_N * 3), sp = new Float32Array(S_N * 3);
for (let i = 0; i < R_N; i++) { rp[i * 3] = KX + rnd(-WR, WR); rp[i * 3 + 1] = rnd(0, WH); rp[i * 3 + 2] = KZ + rnd(-WR, WR); }
for (let i = 0; i < S_N; i++) { sp[i * 3] = KX + rnd(-WR, WR); sp[i * 3 + 1] = rnd(0, WH); sp[i * 3 + 2] = KZ + rnd(-WR, WR); }
const dum = new THREE.Object3D();
function wrapAround(v, c) { return v < c - WR ? v + 2 * WR : v > c + WR ? v - 2 * WR : v; }
function updateParticles(dt, t, cx, cz) {
  const w = ENV.w;
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
  const x = KX + rnd(-16, 16), z = KZ + rnd(-16, 16), g = new THREE.Group();
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
const C_SUN = new THREE.Color(), C_MOON = new THREE.Color(0x9fb4ff);
const cA = new THREE.Color(), cB = new THREE.Color();
function paintTerrain() {
  if (!terrain || !terrainBase.length || !terrain.instanceColor) return;
  const k = Math.round(ENV.cover * 50) + ':' + Math.round(ENV.wet * 30);
  if (k === ENV.colSig) return;
  ENV.colSig = k;
  let q = 0;
  for (let i = 0; i < MAP; i++) for (let j = 0; j < MAP; j++) {
    cA.copy(terrainBase[q]);
    if (ENV.wet > 0) cA.multiplyScalar(1 - 0.2 * ENV.wet);
    cA.lerp(WHITE, ENV.cover * (kind[i][j] === 'p' ? 0.55 : 0.88));
    terrain.setColorAt(q++, cA);
  }
  terrain.instanceColor.needsUpdate = true;
}
function resetEnv() {
  ENV.cover = 0; ENV.wet = 0; ENV.colSig = ''; ENV.wTimer = 45; ENV.flash = 0;
  if (ENV.wAuto) ENV.wType = 'clear';
  refreshWeatherButton();
}

/* ---- per-frame update ---- */
const lerpN = (a, b, t) => a + (b - a) * t;
function updateEnv(dt, now) {
  const t = now || 0;
  if (ENV.wAuto) {
    ENV.wTimer -= dt;
    if (ENV.wTimer <= 0) { ENV.wTimer = rnd(55, 110); ENV.wType = pick(AUTO_WX); refreshWeatherButton(); }
  }
  const tg = WEATHER[ENV.wType], w = ENV.w, k = Math.min(1, dt * 0.5);
  for (const key of ['cloud', 'rain', 'snow', 'fog', 'storm']) w[key] += (tg[key] - w[key]) * k;
  ENV.night += ((ENV.dark ? 1 : 0) - ENV.night) * Math.min(1, dt * 1.2);
  const n = ENV.night;
  ENV.wind = (0.3 + 0.7 * w.storm + 0.25 * w.rain) * (1 + 0.3 * Math.sin(t * 0.0007));

  // sky and fog colour
  cA.setHex(AGES[G.age].sky).lerp(C_NIGHT, n * 0.92);
  cB.copy(C_GREY_DAY).lerp(C_GREY_NIGHT, n); cA.lerp(cB, w.cloud * 0.6);
  cA.lerp(C_BLACK, w.storm * 0.3 * (1 - n * 0.5));
  cB.copy(C_SNOW_DAY).lerp(C_SNOW_NIGHT, n); cA.lerp(cB, w.snow * 0.35);
  cB.copy(C_FOG_DAY).lerp(C_FOG_NIGHT, n); cA.lerp(cB, w.fog * 0.9);
  ENV.sky.lerp(cA, Math.min(1, dt * 1.5));
  scene.background.copy(ENV.sky).lerp(WHITE, ENV.flash * 0.5);
  scene.fog.color.copy(scene.background);
  const dense = Math.max(w.fog, w.rain * 0.55, w.snow * 0.45, w.storm * 0.7);
  scene.fog.near = lerpN(60, 12, dense); scene.fog.far = lerpN(130, 55, dense);

  // lights
  const dim = 1 - 0.5 * w.cloud;
  C_SUN.setHex(AGES[G.age].sun).lerp(C_MOON, n);
  sun.color.copy(C_SUN);
  sun.intensity = lerpN(AGES[G.age].sunI * dim, 0.34 * dim, n) + ENV.flash * 0.6;
  hemi.intensity = lerpN(0.72 * (1 - 0.25 * w.cloud), 0.42, n) + ENV.flash * 1.4;
  hemi.color.setHex(0xffffff).lerp(cB.setHex(0x8fa0d8), n);
  hemi.groundColor.setHex(0x6b8f5a).lerp(cB.setHex(0x2a3a4a), n);

  // sun and moon
  sunMesh.visible = w.cloud < 0.85;
  sunMesh.position.set(KX + (sun.position.x - KX) * 2.2, sun.position.y * 2.2, KZ + (sun.position.z - KZ) * 2.2);
  sunMesh.scale.setScalar(lerpN(7, 5, n));
  sunMesh.material.color.setHex(0xfff2b0).lerp(cB.setHex(0xe8eeff), n);
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
  ENV.cover = clamp(ENV.cover + (w.snow > 0.35 ? w.snow * 0.03 : -0.012) * dt, 0, 1);
  ENV.wet += (Math.max(w.rain, w.storm) - ENV.wet) * Math.min(1, dt * 0.3);
  ENV.paintT -= dt;
  if (ENV.paintT <= 0) { ENV.paintT = 0.35; paintTerrain(); }

  updateParticles(dt, t, cam.tx, cam.tz);
}
detectTheme();
refreshWeatherButton();
