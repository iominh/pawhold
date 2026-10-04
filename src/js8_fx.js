/* ===================== scenery and ambient effects =====================
   Ground decoration (grass tufts, flowers, pebbles), chimney smoke, fireflies at night
   and shimmering water. Everything here is cosmetic and cheap: a few instanced meshes
   and a handful of particles, so it stays smooth on phones. */
const FX = { terrainRef: null, navVer: -1, decoT: 0, smokeT: 0, waterT: 0, waterSig: '', waterIdx: [], waterBase: [] };
const fxM = new THREE.Matrix4(), fxC = new THREE.Color(), fxQ = new THREE.Quaternion(), fxS = new THREE.Vector3(), fxP = new THREE.Vector3();
const TUFT_N = 2;   // tufts per decorated tile
const decoGeo = new THREE.BoxGeometry(1, 1, 1);
const tuftMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
const flowerMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
const pebbleMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
let tuftMesh = null, flowerMesh = null, pebbleMesh = null;
const decoTiles = [];   // { i, j, kind: 't'|'f'|'p', idx, slot }
const FLOWER_COLS = [0xf2567a, 0xf7d94c, 0xffffff, 0x9d7bff, 0xff9a3c];

function buildDeco() {
  for (const m of [tuftMesh, flowerMesh, pebbleMesh]) if (m) { scene.remove(m); m.dispose(); }
  decoTiles.length = 0;
  const tufts = [], flowers = [], pebbles = [];
  for (let i = 2; i < MAP - 2; i++) for (let j = 2; j < MAP - 2; j++) {
    const k = kind[i][j], h1 = hash(i * 3.1, j * 7.3), h2 = hash(i * 11.7, j * 5.9);
    if (k === 'g') {
      if (tileDist(i, j) < 2.6) continue;
      if (h1 < 0.42) tufts.push([i, j]);
      if (h2 < 0.085) flowers.push([i, j]);
    } else if (k === 'h' && h1 < 0.45) pebbles.push([i, j]);
  }
  tuftMesh = new THREE.InstancedMesh(decoGeo, tuftMat, Math.max(1, tufts.length * TUFT_N));
  flowerMesh = new THREE.InstancedMesh(decoGeo, flowerMat, Math.max(1, flowers.length * 2));
  pebbleMesh = new THREE.InstancedMesh(decoGeo, pebbleMat, Math.max(1, pebbles.length));
  tuftMesh.receiveShadow = flowerMesh.receiveShadow = pebbleMesh.receiveShadow = true;
  tuftMesh.castShadow = false; flowerMesh.castShadow = false; pebbleMesh.castShadow = false;
  let q = 0;
  for (const [i, j] of tufts) {
    for (let t = 0; t < TUFT_N; t++) {
      const hx = hash(i * 13 + t, j * 17) - 0.5, hz = hash(i * 19, j * 23 + t) - 0.5, hs = 0.18 + hash(i + t, j - t) * 0.16;
      fxP.set(i + hx * 0.8, topY[i][j] + hs / 2, j + hz * 0.8); fxS.set(0.09, hs, 0.09); fxQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hx * 3);
      fxM.compose(fxP, fxQ, fxS); tuftMesh.setMatrixAt(q, fxM);
      fxC.setHex(0x6fbf4e).offsetHSL(0, 0, (hash(i * 2 + t, j * 3) - 0.5) * 0.14); tuftMesh.setColorAt(q, fxC);
      decoTiles.push({ i, j, kind: 't', idx: q, m: fxM.clone() }); q++;
    }
  }
  q = 0;
  for (const [i, j] of flowers) {
    const hx = hash(i * 29, j * 31) - 0.5, hz = hash(i * 37, j * 41) - 0.5, col = FLOWER_COLS[Math.floor(hash(i * 43, j * 47) * FLOWER_COLS.length)];
    fxP.set(i + hx * 0.7, topY[i][j] + 0.11, j + hz * 0.7); fxS.set(0.05, 0.22, 0.05); fxQ.identity();
    fxM.compose(fxP, fxQ, fxS); flowerMesh.setMatrixAt(q, fxM); flowerMesh.setColorAt(q, fxC.setHex(0x4f9a3a)); decoTiles.push({ i, j, kind: 'f', idx: q, m: fxM.clone() }); q++;
    fxP.set(i + hx * 0.7, topY[i][j] + 0.25, j + hz * 0.7); fxS.set(0.14, 0.1, 0.14);
    fxM.compose(fxP, fxQ, fxS); flowerMesh.setMatrixAt(q, fxM); flowerMesh.setColorAt(q, fxC.setHex(col)); decoTiles.push({ i, j, kind: 'f', idx: q, m: fxM.clone() }); q++;
  }
  q = 0;
  for (const [i, j] of pebbles) {
    const hx = hash(i * 53, j * 59) - 0.5, hz = hash(i * 61, j * 67) - 0.5, s = 0.1 + hash(i * 71, j * 73) * 0.12;
    fxP.set(i + hx * 0.7, topY[i][j] + s / 2, j + hz * 0.7); fxS.set(s * 1.3, s, s); fxQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hz * 4);
    fxM.compose(fxP, fxQ, fxS); pebbleMesh.setMatrixAt(q, fxM); pebbleMesh.setColorAt(q, fxC.setHex(0xa9afb5).offsetHSL(0, 0, (hx) * 0.1));
    decoTiles.push({ i, j, kind: 'p', idx: q, m: fxM.clone() }); q++;
  }
  scene.add(tuftMesh, flowerMesh, pebbleMesh);
  FX.terrainRef = terrain; FX.navVer = -1;
  refreshDeco(true);
}
const ZERO_M = new THREE.Matrix4().makeScale(0, 0, 0);
function refreshDeco(force) {
  const winter = ENV.sw[3] > 0.5 || ENV.cover > 0.5;
  for (const d of decoTiles) {
    const hide = !!occ[d.i][d.j] || !!nodeAt[d.i][d.j] || (d.kind === 'f' && winter);
    if (!force && hide === d.hidden) continue;
    d.hidden = hide;
    const mesh = d.kind === 't' ? tuftMesh : d.kind === 'f' ? flowerMesh : pebbleMesh;
    mesh.setMatrixAt(d.idx, hide ? ZERO_M : d.m);
  }
  tuftMesh.instanceMatrix.needsUpdate = flowerMesh.instanceMatrix.needsUpdate = pebbleMesh.instanceMatrix.needsUpdate = true;
  if (tuftMesh.instanceColor) tuftMesh.instanceColor.needsUpdate = true;
  if (flowerMesh.instanceColor) flowerMesh.instanceColor.needsUpdate = true;
  if (pebbleMesh.instanceColor) pebbleMesh.instanceColor.needsUpdate = true;
}

/* fireflies: tiny glowing motes that drift near the trees after dark (not in winter or rain) */
const FF_N = 40;
const ffMesh = new THREE.InstancedMesh(decoGeo, new THREE.MeshBasicMaterial({ color: 0xd9ff6e, transparent: true, opacity: 0.9 }), FF_N);
ffMesh.castShadow = false; ffMesh.frustumCulled = false; ffMesh.count = 0; scene.add(ffMesh);
const ffHome = [];
function seedFireflies() {
  ffHome.length = 0;
  const trees = nodes.filter(n => n.type === 'wood');
  for (let k = 0; k < FF_N; k++) {
    const t = trees.length ? trees[Math.floor(Math.random() * trees.length)] : { x: KX + rnd(-8, 8), z: KZ + rnd(-8, 8) };
    ffHome.push({ x: t.x + rnd(-1.5, 1.5), z: t.z + rnd(-1.5, 1.5), y: 0.4 + rnd(0, 0.9), ph: rnd(0, 6.28), sp: rnd(0.6, 1.3) });
  }
}
function updateFireflies(now) {
  const w = ENV.w || {}, vis = ENV.night * (1 - ENV.sw[3]) * clamp(1 - (w.rain || 0) * 2 - (w.snow || 0) * 2, 0, 1);
  const n = Math.floor(FF_N * clamp(vis, 0, 1));
  ffMesh.count = n;
  if (!n) return;
  if (!ffHome.length) seedFireflies();
  const t = now * 0.001;
  for (let k = 0; k < n; k++) {
    const f = ffHome[k], a = t * f.sp + f.ph;
    const blink = 0.5 + 0.5 * Math.sin(a * 3.1 + Math.sin(a * 1.7)), s = 0.05 + 0.05 * blink;
    fxP.set(f.x + Math.sin(a) * 0.9 + Math.sin(a * 2.3) * 0.3, f.y + Math.sin(a * 1.4) * 0.35, f.z + Math.cos(a * 0.8) * 0.9);
    fxS.setScalar(s); fxQ.identity(); fxM.compose(fxP, fxQ, fxS); ffMesh.setMatrixAt(k, fxM);
  }
  ffMesh.instanceMatrix.needsUpdate = true;
}

/* chimney smoke from finished houses and the blacksmith */
function updateSmoke(dt) {
  FX.smokeT -= dt;
  if (FX.smokeT > 0 || parts.length > 150) return;
  FX.smokeT = 0.3;
  const homes = buildings.filter(b => b.done && (b.type === 'house' || b.type === 'smith' || b.type === 'keep'));
  if (!homes.length) return;
  const cold = 0.6 + ENV.sw[3] * 0.4 + ENV.night * 0.3;   // more fires burning in winter and at night
  for (let k = 0; k < 2; k++) {
    if (Math.random() > cold * 0.6) continue;
    const b = homes[Math.floor(Math.random() * homes.length)];
    if (b.type === 'smith') puff(b.x + 0.1, b.y + 1.0, b.z - 0.1, Math.random() < 0.5 ? 0xff9a3c : 0x5d6066, 1, 0.22, 1.4, 0.06);
    else if (b.type === 'keep') puff(b.x + 0.6, b.y + 2.3, b.z - 0.5, 0xd7dbe0, 1, 0.18, 2.2, 0.09);
    else puff(b.x + 0.21, b.y + 0.96, b.z - 0.17, 0xd7dbe0, 1, 0.16, 1.8, 0.07);
  }
}

/* water shimmer: pond tiles ripple with a slow brightness wave */
function updateWater(now) {
  if (!terrain || !terrain.instanceColor) return;
  if (FX.waterSig !== ENV.colSig || FX.terrainRef !== terrain) {
    FX.waterSig = ENV.colSig; FX.waterIdx.length = 0; FX.waterBase.length = 0;
    let q = 0;
    for (let i = 0; i < MAP; i++) for (let j = 0; j < MAP; j++, q++) if (kind[i][j] === 'p') { FX.waterIdx.push(q); terrain.getColorAt(q, fxC); FX.waterBase.push(fxC.clone()); }
  }
  if (!FX.waterIdx.length) return;
  const t = now * 0.0016;
  for (let k = 0; k < FX.waterIdx.length; k++) {
    const q = FX.waterIdx[k], i = (q / MAP) | 0, j = q % MAP;
    const f = 1 + 0.07 * Math.sin(t + i * 0.9 + j * 0.6) + 0.04 * Math.sin(t * 1.7 - i * 0.5 + j * 1.3);
    fxC.copy(FX.waterBase[k]).multiplyScalar(f * (1 - ENV.sw[3] * 0.6) + ENV.sw[3] * 0.6);
    terrain.setColorAt(q, fxC);
  }
  terrain.instanceColor.needsUpdate = true;
}

function updateFx(dt, now) {
  if (terrain && FX.terrainRef !== terrain) { buildDeco(); seedFireflies(); }
  if (!tuftMesh) return;
  FX.decoT -= dt;
  if (NAV.ver !== FX.navVer || FX.decoT <= 0) { FX.navVer = NAV.ver; FX.decoT = 2; refreshDeco(false); }
  // season tint for the ground cover
  fxC.setHex(0xffffff); if (tintAmt > 0) fxC.lerp(tintC, tintAmt * 0.9); fxC.lerp(WHITE, ENV.cover * 0.85);
  if (ENV.night > 0) fxC.multiplyScalar(1 - 0.08 * ENV.night);
  tuftMat.color.copy(fxC); pebbleMat.color.copy(fxC);
  updateFireflies(now);
  if (!G.paused) updateSmoke(dt);
  FX.waterT -= dt;
  if (FX.waterT <= 0) { FX.waterT = 0.1; updateWater(now); }
}
