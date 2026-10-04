const GAME_VERSION = '1.2.2', GAME_BUILD = '9b5552d';
'use strict';
/* ===================== Pawhold: constants and definitions ===================== */
const MAP = 44, KX = 22, KZ = 22, MARGIN = 3, TOTAL_WAVES = 15;
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RES = ['wood', 'stone', 'food', 'gold'];

const AGES = [
  { name: 'Hamlet', sky: 0xa9d9ee, sun: 0xfff2d8, sunI: 0.85, pal: { wall: 0xb98a56, roof: 0xd8b85c, trim: 0x7b5232, beam: 0x7b5232, flag: 0xe4702b } },
  { name: 'Medieval Town', sky: 0xb7dcee, sun: 0xfff6e6, sunI: 0.9, pal: { wall: 0xd2c2a6, roof: 0xa5513f, trim: 0x6d4a30, beam: 0x6d4a30, flag: 0xc0392b } },
  { name: 'Castle Age', sky: 0xf0d9ae, sun: 0xffe2a8, sunI: 0.85, pal: { wall: 0x9ca3aa, roof: 0x3e6199, trim: 0xcfd4d8, beam: 0x6c737a, flag: 0x2f5fb3 } },
  { name: 'Gunpowder Age', sky: 0xc9b6dc, sun: 0xffd2b0, sunI: 0.8, pal: { wall: 0xb9bec6, roof: 0x2e3a55, trim: 0xe3b44e, beam: 0x8a919a, flag: 0x7a2fb3 } }
];
const AGE_COST = [null,
  { wood: 150, food: 120 },
  { wood: 260, stone: 200, food: 180, gold: 60 },
  { wood: 320, stone: 380, food: 300, gold: 260 }];

const BDEF = {
  house:    { name: 'Burrow House', cat: 'town', size: 1, age: 0, cost: { wood: 20 }, hp: 90, time: 3, pop: 3, r: 0.8, blurb: 'Shelter for 3 animals.', role: 'Housing', what: 'Burrows where your animals sleep. Every house raises the population cap by 3.', help: 'More animals means more settlers gathering and more defenders. New settlers only arrive while there is room, and soldiers count against the cap too.', tip: 'If the pop counter is full (say 8/8), nobody new will join. Build houses before you need them.' },
  farm:     { name: 'Berry Farm', cat: 'town', size: 1, age: 0, cost: { wood: 30 }, hp: 70, time: 4, r: 0.8, drop: ['food'], income: { food: 0.55 }, blurb: 'Grows food. Berries are dropped off here.', role: 'Food', what: 'A berry patch tended automatically.', help: 'Makes 0.55 food a second on its own, and settlers drop berries off here. Food feeds new settlers (25 each) and trains soldiers.', tip: 'Build beside berry bushes or close to the Hall to keep carry trips short.' },
  camp:     { name: 'Lumber Camp', cat: 'town', size: 1, age: 0, cost: { wood: 35 }, hp: 90, time: 3, r: 0.8, drop: ['wood'], blurb: 'Wood drop-off. Build beside a forest.', role: 'Wood drop-off', what: 'A stockpile where choppers unload their logs.', help: 'Settlers carry 8 wood a trip, so a long walk wastes most of their day. A camp beside a forest cuts the walk, and drop-offs here pay +25% over the Great Hall.', tip: 'Place it on the edge of a forest, not in the middle of your town.' },
  quarry:   { name: 'Quarry', cat: 'town', size: 1, age: 1, cost: { wood: 50 }, hp: 120, time: 5, r: 0.8, drop: ['stone', 'gold'], blurb: 'Stone and gold drop-off. Build beside rocks.', role: 'Stone and gold drop-off', what: 'A stone yard where miners unload rock and gold.', help: 'Stone builds walls, towers and the Castle Age. Like the camp, it pays +25% on everything dropped here and saves long trips.', tip: 'Put it next to grey rocks or gold veins.' },
  market:   { name: 'Market', cat: 'town', size: 1, age: 1, cost: { wood: 70, stone: 20 }, hp: 120, time: 5, r: 0.8, income: { gold: 0.45 }, blurb: 'Trades goods for a trickle of gold.', role: 'Gold income', what: 'Traders pay a steady stream of gold.', help: 'Earns 0.45 gold a second with no workers needed. Gold trains Guards, Knights and Musketeers, upgrades weapons and buys new ages.', tip: 'Several markets fund a much bigger army. They are safest inside your walls.' },
  barracks: { name: 'Barracks', cat: 'army', size: 2, age: 0, cost: { wood: 80, stone: 10 }, hp: 260, time: 7, r: 1.4, blurb: 'Trains defenders. Needed for the units below.', role: 'Training', what: 'Where defenders are trained. Open the Army tab and pick a unit.', help: 'Without one you cannot train soldiers. Defenders gather on the side raiders are coming from, fight them, and level up from kills. Select them and right-click to give orders.', tip: 'Build it near the Hall. Soldiers also count against housing.' },
  smith:    { name: 'Blacksmith', cat: 'army', size: 1, age: 2, cost: { wood: 60, stone: 60 }, hp: 160, time: 6, r: 0.8, blurb: 'Sharpens every weapon in the valley.', role: 'Weapon upgrades', what: 'A forge that sharpens every weapon in the valley.', help: 'Unlocks the Sharpen Weapons upgrade in the Army tab: +20% damage per level for every defender and tower, up to three levels.', tip: 'Worth it before the boss raids at 5, 10 and 15.' },
  palisade: { name: 'Palisade', cat: 'defense', size: 1, age: 0, cost: { wood: 6 }, hp: 110, time: 1.2, wall: true, r: 0.6, blurb: 'Wooden stakes. Drag to draw a line.', role: 'Cheap wall', what: 'A line of sharpened wooden stakes.', help: 'Raiders must chew through it or walk around. Your own animals walk straight through. It funnels raiders to where your towers and archers can reach them.', tip: 'Drag to draw a line. A gap in front of your towers makes a kill zone.' },
  wall:     { name: 'Stone Wall', cat: 'defense', size: 1, age: 1, cost: { stone: 8 }, hp: 340, time: 2, wall: true, r: 0.6, blurb: 'Sturdy stone. Drag to draw a line.', role: 'Strong wall', what: 'Stone blocks, over three times tougher than stakes.', help: 'Holds raiders under tower fire for much longer, especially against badger rams. Settlers repair it when idle.', tip: 'Back it with towers: walls buy time, towers do the killing.' },
  tower:    { name: 'Watchtower', cat: 'defense', size: 1, age: 0, cost: { wood: 45, stone: 5 }, hp: 240, time: 5, r: 0.8, range: 7, dmg: 8, rate: 1.1, shot: 'arrow', blurb: 'A fox archer keeps watch.', role: 'Ranged defense', what: 'A fox archer keeps watch from the top.', help: 'Shoots raiders within 7 tiles with no housing or food cost. Damage grows with each age and weapon upgrade.', tip: 'Place a few just behind your walls so raiders stall in range.' },
  ballista: { name: 'Ballista Tower', cat: 'defense', size: 1, age: 2, cost: { wood: 70, stone: 70 }, hp: 360, time: 7, r: 0.8, range: 9.5, dmg: 36, rate: 2.1, shot: 'bolt', blurb: 'Heavy bolts at long range.', role: 'Heavy ranged defense', what: 'A crossbow turret with a long reach.', help: 'Fires heavy bolts out to 9.5 tiles for 36 damage each. Slow, but great against boars, badger rams and the Warlord.', tip: 'Pair with cheaper watchtowers to cover the gaps while it reloads.' },
  cannon:   { name: 'Cannon Tower', cat: 'defense', size: 1, age: 3, cost: { stone: 90, gold: 70 }, hp: 460, time: 8, r: 0.8, range: 8.5, dmg: 58, rate: 3, splash: 1.7, shot: 'ball', blurb: 'Explosive damage in an area.', role: 'Area defense', what: 'A gunpowder cannon that blasts whole packs.', help: 'Cannonballs explode for 58 damage in a wide splash, so raiders bunched at your wall take it all at once.', tip: 'Best right behind a wall where raiders pile up.' },
  infirmary: { name: 'Healing Hut', cat: 'town', size: 1, age: 0, cost: { wood: 55, stone: 10 }, hp: 130, time: 5, r: 0.8, heal: 5, blurb: 'Heals animals and buildings nearby.', role: 'Healing', what: 'A cosy hut with a panda healer inside.', help: 'Animals within 5 tiles heal 3 hp a second and nearby buildings are mended too. Keeps your front line alive between raids.', tip: 'Put it just behind your walls where wounded defenders gather.' },
  keep:     { name: 'Great Hall', cat: 'none', size: 3, age: 0, cost: {}, hp: 1200, time: 1, r: 2.1, drop: ['wood', 'stone', 'food', 'gold'], pop: 5, blurb: 'The heart of the clan.', role: 'Heart of the clan', what: 'Your Great Hall. If it falls, the game is lost.', help: 'Settlers drop all resources off here and new ones arrive from it. It houses 5 animals and heals those standing close. It grows tougher with each age.', tip: 'Defend it above all else. Nothing else is as hard to replace.' }
};
const UDEF = {
  worker: { name: 'Settler', hp: 30, speed: 2.1, scale: 0.9, role: 'Settler', what: 'A hard-working villager.', help: 'Gathers wood, stone, berries and gold, builds what you place, and mends damaged buildings when idle. Gains levels by working: they carry more and work faster.', tip: 'Select one and right-click a tree, rock, building site or damaged building to send them.' },
  archer: { name: 'Fox Archer', sp: 'fox', hp: 34, speed: 2.3, dmg: 6, rate: 1.0, range: 5.5, cost: { food: 30, wood: 25 }, age: 0, shot: 'arrow', blurb: 'Fast and ranged.', role: 'Ranged defender', what: 'A quick fox with a bow.', help: 'Hits from 5.5 tiles away, so keep archers behind guards. At level 3 learns Volley, hitting several raiders at once.', tip: 'Cheap and needs no gold.' },
  guard:  { name: 'Panda Guard', sp: 'panda', hp: 110, speed: 1.8, dmg: 10, rate: 1.0, range: 1.1, cost: { food: 40, gold: 15 }, age: 0, blurb: 'Tough front line.', role: 'Front line', what: 'A sturdy panda with a heavy staff.', help: 'Soaks up damage so archers can shoot in peace. At level 3 learns Bamboo Guard: halves damage taken and draws raiders to it.', tip: 'Put them at the wall gap.' },
  knight: { name: 'Bear Knight', sp: 'bear', hp: 240, speed: 1.9, dmg: 22, rate: 1.1, range: 1.3, cost: { food: 70, gold: 55 }, age: 2, blurb: 'Armoured heavy hitter.', role: 'Heavy hitter', what: 'An armoured bear that hits hard.', help: 'High health and strong attacks, ideal against badger rams and the Warlord. At level 3 learns Cleave, a spinning area strike.', tip: 'Unlocks in the Castle Age.' },
  musket: { name: 'Rabbit Musketeer', sp: 'rabbit', hp: 44, speed: 2.2, dmg: 24, rate: 1.9, range: 7, cost: { food: 45, gold: 60 }, age: 3, shot: 'bullet', blurb: 'Powder and long range.', role: 'Long-range damage', what: 'A rabbit with a flintlock.', help: 'Slow but powerful shots from 7 tiles. At level 3 learns Aimed Shot: one huge hit.', tip: 'Unlocks in the Gunpowder Age.' }
};
const EDEF = {
  wolf:    { name: 'Wolf', sp: 'wolf', hp: 30, speed: 2.7, dmg: 5, rate: 0.9, range: 1.0, bounty: 3, scale: 1 },
  boar:    { name: 'Boar', sp: 'boar', hp: 90, speed: 1.7, dmg: 10, rate: 1.2, range: 1.0, bounty: 6, scale: 1 },
  raccoon: { name: 'Raccoon Slinger', sp: 'raccoon', hp: 34, speed: 2.2, dmg: 6, rate: 1.3, range: 4.2, bounty: 5, shot: 'stone', scale: 1 },
  badger:  { name: 'Badger Ram', sp: 'badger', hp: 170, speed: 1.3, dmg: 26, rate: 1.4, range: 1.1, bounty: 12, siege: true, scale: 1.1 },
  chief:   { name: 'Bear Warlord', sp: 'warbear', hp: 700, speed: 1.5, dmg: 30, rate: 1.3, range: 1.6, bounty: 90, scale: 1.7 }
};
const TECHS = [
  { id: 'armor', name: 'Tempered Armor', age: 2, need: 'smith', max: 3, cost: [{ wood: 40, stone: 60, gold: 60 }, { stone: 120, gold: 130 }, { stone: 200, gold: 250 }], role: 'Armor upgrade', what: 'Smiths forge sturdier armor for the whole clan.', help: 'Each level adds +15% health to every defender, and it applies to the ones you already have. Needs a finished Blacksmith.', tip: 'Pairs well with Sharpen Weapons.' },
  { id: 'farm', name: 'Crop Rotation', age: 1, need: null, max: 2, cost: [{ wood: 60, food: 60 }, { wood: 120, food: 140, gold: 40 }], role: 'Farming tech', what: 'Better planting means bigger harvests.', help: 'Each level makes every Berry Farm produce +25% more food, all year round.', tip: 'Cheap, and it pays off quickly with several farms.' },
  { id: 'tools', name: 'Sturdy Tools', age: 1, need: null, max: 2, cost: [{ wood: 70, stone: 30 }, { wood: 140, stone: 90, gold: 40 }], role: 'Gathering tech', what: 'Better axes, picks and baskets for every settler.', help: 'Each level lets settlers carry 2 more per trip, so fewer walks back to the drop-off.', tip: 'Best when your drop-offs are a long way from the trees.' }
];
const PROMO_COST = { food: 40, gold: 45 };
const PROMO_LVL = 5;
const SMITH_COST = [{ gold: 80, stone: 40 }, { gold: 160, stone: 90 }, { gold: 300, stone: 150 }];

/* ===================== renderer, scene, light ===================== */
const stageEl = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio || 1, 1.75), 2.5));  // supersample on low-dpi screens to smooth jagged voxel edges
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stageEl.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(AGES[0].sky);
scene.fog = new THREE.Fog(AGES[0].sky, 60, 130);
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
const hemi = new THREE.HemisphereLight(0xffffff, 0x6b8f5a, 0.72);
const sun = new THREE.DirectionalLight(AGES[0].sun, AGES[0].sunI);
sun.position.set(KX + 26, 46, KZ + 18);
sun.target.position.set(KX, 0, KZ);
sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 140 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(hemi, sun, sun.target);

function resize() {
  const w = stageEl.clientWidth || window.innerWidth, h = stageEl.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  { const dk = document.getElementById('dock'); if (dk) document.documentElement.style.setProperty('--dockh', dk.offsetHeight + 'px'); }
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
if (window.ResizeObserver) new ResizeObserver(resize).observe(stageEl);

/* ===================== world ===================== */
let seed = 0, kind = [], topY = [], occ = [], nodeAt = [];
let terrain = null, terrainBase = [];
const nodes = [];
const leafMats = [0x5cc04a, 0x6fcf57, 0x4fb243].map(c => new THREE.MeshLambertMaterial({ color: c }));
function hash(x, z) { const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return n - Math.floor(n); }
function vnoise(x, z) {
  const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const inMap = (i, j) => i >= 0 && j >= 0 && i < MAP && j < MAP;
const tileDist = (i, j) => Math.hypot(i - KX, j - KZ);

function addNode(type, i, j, amt) {
  const g = new THREE.Group();
  g.position.set(i + rnd(-0.12, 0.12), topY[i][j], j + rnd(-0.12, 0.12));
  g.rotation.y = rnd(0, 6.28);
  let max = 30;
  if (type === 'wood') {
    const lm = { mat: pick(leafMats) };
    box(g, -0.07, 0, -0.07, 0.14, 0.35, 0.14, 0x6b4a2f);
    box(g, -0.34, 0.3, -0.34, 0.68, 0.22, 0.68, 0, lm);
    box(g, -0.25, 0.5, -0.25, 0.5, 0.22, 0.5, 0, lm);
    box(g, -0.14, 0.7, -0.14, 0.28, 0.2, 0.28, 0, lm);
    g.scale.y = rnd(0.85, 1.3);
  } else if (type === 'stone') {
    max = 60;
    box(g, -0.3, 0, -0.25, 0.5, 0.3, 0.45, 0x9aa0a6);
    box(g, 0, 0, 0.05, 0.35, 0.4, 0.3, 0x868c93);
    box(g, -0.15, 0.28, -0.1, 0.3, 0.2, 0.3, 0xb1b7bd);
  } else if (type === 'food') {
    max = 24;
    box(g, -0.3, 0, -0.3, 0.6, 0.3, 0.6, 0x4c9a3e);
    box(g, -0.2, 0.28, -0.2, 0.4, 0.12, 0.4, 0x5aae4a);
    for (let k = 0; k < 6; k++) box(g, rnd(-0.28, 0.2), rnd(0.12, 0.3), rnd(-0.28, 0.2), 0.09, 0.09, 0.09, 0xd9344a);
  } else {
    max = 70;
    box(g, -0.3, 0, -0.25, 0.55, 0.28, 0.5, 0x8d9399);
    box(g, -0.15, 0.26, -0.12, 0.2, 0.22, 0.2, 0xf2c14e);
    box(g, 0.08, 0.2, 0.05, 0.16, 0.2, 0.16, 0xe3a92f);
    box(g, -0.28, 0.18, 0.12, 0.14, 0.16, 0.14, 0xf7d46c);
  }
  scene.add(g);
  const n = { type, i, j, x: g.position.x, z: g.position.z, amt: amt || max, max, group: g, workers: 0 };
  nodes.push(n);
  nodeAt[i][j] = n;
  return n;
}
function removeNode(n) {
  scene.remove(n.group);
  const k = nodes.indexOf(n); if (k >= 0) nodes.splice(k, 1);
  if (nodeAt[n.i][n.j] === n) nodeAt[n.i][n.j] = null;
}
function freeGrass(i, j) { return inMap(i, j) && kind[i][j] === 'g' && !occ[i][j] && !nodeAt[i][j] && tileDist(i, j) > 3.6 && i > 1 && j > 1 && i < MAP - 2 && j < MAP - 2; }

function genWorld(saved) {
  seed = saved ? saved.seed : Math.random() * 500;
  for (const n of nodes.slice()) removeNode(n);
  if (terrain) { scene.remove(terrain); if (terrain.dispose) terrain.dispose(); }
  kind = []; topY = []; occ = []; nodeAt = [];
  for (let i = 0; i < MAP; i++) { kind[i] = []; topY[i] = []; occ[i] = []; nodeAt[i] = []; }
  for (let i = 0; i < MAP; i++) for (let j = 0; j < MAP; j++) {
    const d = tileDist(i, j);
    const n = vnoise(i * 0.13 + seed, j * 0.13 + seed) * 0.65 + vnoise(i * 0.31 + seed, j * 0.31 + seed) * 0.35;
    let k = 'g', y = 0;
    if (d > 10) {
      if (n > 0.68) { k = 'h'; y = n > 0.78 ? 1 : 0.5; }
      else if (n < 0.26 && d > 13) { k = 'p'; y = -0.35; }
    }
    if (i < 2 || j < 2 || i >= MAP - 2 || j >= MAP - 2) { k = 'g'; y = 0; }
    kind[i][j] = k; topY[i][j] = y;
  }
  const geo1 = new THREE.BoxGeometry(1, 1, 1);
  terrain = new THREE.InstancedMesh(geo1, new THREE.MeshLambertMaterial({ color: 0xffffff }), MAP * MAP);
  terrain.receiveShadow = true;
  const m = new THREE.Matrix4(), c = new THREE.Color();
  terrainBase = [];
  let q = 0;
  for (let i = 0; i < MAP; i++) for (let j = 0; j < MAP; j++) {
    const top = topY[i][j], hgt = top + 1.8;
    m.makeScale(1, hgt, 1); m.setPosition(i, top - hgt / 2, j);
    terrain.setMatrixAt(q, m);
    const k = kind[i][j], h = hash(i, j);
    c.setHex(k === 'g' ? (h < 0.33 ? 0x7dbb55 : h < 0.66 ? 0x74b24e : 0x84c35c) : k === 'h' ? (h < 0.5 ? 0x8f9d8a : 0x9aa896) : 0x4aa8d0);
    terrain.setColorAt(q, c); terrainBase.push(c.clone());
    q++;
  }
  scene.add(terrain);
  if (saved) { for (const n of saved.nodes) if (freeGrass(n.i, n.j) || (inMap(n.i, n.j) && !nodeAt[n.i][n.j] && kind[n.i][n.j] !== 'p')) addNode(n.type, n.i, n.j, n.amt); return; }

  // keep tiles
  // forests
  for (let i = 3; i < MAP - 3; i++) for (let j = 3; j < MAP - 3; j++) {
    if (!freeGrass(i, j) || tileDist(i, j) < 5.5) continue;
    if (vnoise(i * 0.18 + seed * 1.7, j * 0.18 + seed * 0.9) > 0.58 && Math.random() < 0.72) addNode('wood', i, j);
    else if (Math.random() < 0.01) addNode('stone', i, j);
  }
  for (let i = 3; i < MAP - 3; i++) for (let j = 3; j < MAP - 3; j++) {
    if (kind[i][j] === 'h' && !nodeAt[i][j] && Math.random() < 0.2) addNode('stone', i, j);
  }
  // guaranteed starter resources near the hall
  const scatter = (type, cnt, rMin, rMax, spread) => {
    const a = rnd(0, 6.28), r = rnd(rMin, rMax);
    const cx = KX + Math.cos(a) * r, cz = KZ + Math.sin(a) * r;
    let placed = 0, guard = 0;
    while (placed < cnt && guard++ < 80) {
      const i = Math.round(cx + rnd(-spread, spread)), j = Math.round(cz + rnd(-spread, spread));
      if (freeGrass(i, j)) { addNode(type, i, j); placed++; }
    }
  };
  scatter('wood', 16, 8, 11, 2.6);
  scatter('stone', 6, 9, 12, 2);
  scatter('gold', 3, 11, 14, 1.5);
  for (let k = 0; k < 8; k++) {
    const a = rnd(0, 6.28), r = rnd(5, 8);
    const i = Math.round(KX + Math.cos(a) * r), j = Math.round(KZ + Math.sin(a) * r);
    if (freeGrass(i, j)) addNode('food', i, j);
  }
  for (let k = 0; k < 5; k++) {
    for (let t = 0; t < 40; t++) {
      const i = rint(4, MAP - 5), j = rint(4, MAP - 5);
      if (freeGrass(i, j) && tileDist(i, j) > 12) { addNode('gold', i, j); break; }
    }
  }
}

/* ===================== voxel helpers ===================== */
const unitGeo = new THREE.BoxGeometry(1, 1, 1);
const matCache = new Map();
const lampMat = new THREE.MeshBasicMaterial({ color: 0xbfe3f2 });   // windows and braziers; warm at night
const LAMP = { mat: lampMat, noshadow: true };
function mat(c, basic) {
  const k = c + (basic ? 'b' : '');
  let m = matCache.get(k);
  if (!m) { m = basic ? new THREE.MeshBasicMaterial({ color: c }) : new THREE.MeshLambertMaterial({ color: c }); matCache.set(k, m); }
  return m;
}
// box(parent, minX, minY, minZ, width, height, depth, color)
function box(p, x, y, z, w, h, d, c, o) {
  const m = new THREE.Mesh(unitGeo, (o && o.mat) || mat(c, o && o.basic));
  m.scale.set(w, h, d);
  m.position.set(x + w / 2, y + h / 2, z + d / 2);
  m.castShadow = !(o && o.noshadow);
  m.receiveShadow = true;
  p.add(m);
  return m;
}
function roofPyr(g, cx, y, cz, w, c, layers, step) {
  let s = w;
  for (let k = 0; k < layers && s > 0.05; k++) { box(g, cx - s / 2, y + k * 0.12, cz - s / 2, s, 0.12, s, c); s -= step; }
}
function flagAt(g, x, y, z, c) {
  box(g, x - 0.02, y, z - 0.02, 0.04, 0.55, 0.04, 0x5a4a3a);
  const f = box(g, x + 0.02, y + 0.32, z - 0.01, 0.26, 0.16, 0.03, c, { noshadow: true });
  (g.userData.flags = g.userData.flags || []).push(f);
}

/* ===================== animals ===================== */
const SPEC = {
  fox:     { bw: .3, bh: .26, bd: .5, ly: .16, hw: .28, body: 0xe4702b, belly: 0xf6ead8, leg: 0x3a2a22, sn: { w: .12, h: .1, l: .14, c: 0xf6ead8 } },
  panda:   { bw: .36, bh: .42, bd: .3, ly: .2, hw: .34, body: 0xf4f4f0, belly: 0xe6e6e0, leg: 0x1f1f22, sn: { w: .14, h: .1, l: .07, c: 0xdedbd2 } },
  rabbit:  { bw: .26, bh: .24, bd: .4, ly: .12, hw: .24, body: 0xe9e4da, belly: 0xffffff, leg: 0xcfc8ba, sn: { w: .1, h: .08, l: .06, c: 0xf0b8b8 } },
  bear:    { bw: .42, bh: .36, bd: .52, ly: .16, hw: .34, body: 0x7c4d2b, belly: 0x9a6a40, leg: 0x4d2e19, sn: { w: .16, h: .12, l: .1, c: 0xc59a6a } },
  wolf:    { bw: .28, bh: .26, bd: .6, ly: .2, hw: .26, body: 0x7b838c, belly: 0xc3c9ce, leg: 0x555c63, sn: { w: .1, h: .09, l: .2, c: 0x6a7178 }, eye: 0xff4a3a },
  boar:    { bw: .4, bh: .34, bd: .56, ly: .16, hw: .3, body: 0x5b3a2c, belly: 0x7e5642, leg: 0x2e1c14, sn: { w: .2, h: .12, l: .12, c: 0x8a5e48 }, eye: 0xff4a3a },
  raccoon: { bw: .28, bh: .24, bd: .42, ly: .14, hw: .26, body: 0x8a9098, belly: 0xc9ced2, leg: 0x2f3338, sn: { w: .1, h: .08, l: .1, c: 0xd8dcdf } },
  badger:  { bw: .42, bh: .3, bd: .6, ly: .12, hw: .28, body: 0x3b3b3f, belly: 0x55555a, leg: 0x222226, sn: { w: .1, h: .08, l: .12, c: 0xf0f0ec }, eye: 0xff4a3a },
  warbear: { bw: .42, bh: .36, bd: .52, ly: .16, hw: .34, body: 0x40302a, belly: 0x5a443a, leg: 0x2a1d18, sn: { w: .16, h: .12, l: .1, c: 0x8a6a50 }, eye: 0xff4a3a }
};

function makeAnimal(sp) {
  const S = SPEC[sp], g = new THREE.Group(), { bw, bh, bd, ly, hw } = S;
  const legs = [], arms = [], biped = sp === 'panda';
  if (biped) {
    // pandas stand and walk upright on two legs, arms swinging
    [1, -1].forEach(s => {
      const p = new THREE.Group();
      p.position.set(s * (bw / 2 - 0.1), ly, 0);
      box(p, -0.07, -ly, -0.07, 0.14, ly, 0.16, S.leg);
      g.add(p); legs.push(p);
      const a = new THREE.Group();
      a.position.set(s * (bw / 2 + 0.05), ly + bh - 0.06, 0);
      box(a, -0.05, -0.3, -0.05, 0.1, 0.3, 0.1, 0x1f1f22);
      g.add(a); arms.push(a);
    });
    box(g, -bw / 2, ly, -bd / 2, bw, bh, bd, S.body);
    box(g, -bw / 2 - 0.01, ly + bh - 0.17, -bd / 2 - 0.01, bw + 0.02, 0.17, bd + 0.02, 0x1f1f22);
    box(g, -bw / 2 + 0.05, ly + 0.04, bd / 2, bw - 0.1, bh - 0.26, 0.02, S.belly);
  } else {
    [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz]) => {
      const p = new THREE.Group();
      p.position.set(sx * (bw / 2 - 0.07), ly, sz * (bd / 2 - 0.09));
      box(p, -0.05, -ly, -0.05, 0.1, ly, 0.1, S.leg);
      g.add(p); legs.push(p);
    });
    box(g, -bw / 2, ly, -bd / 2, bw, bh, bd, S.body);
    box(g, -bw / 2 + 0.03, ly - 0.01, -bd / 2 + 0.08, bw - 0.06, 0.05, bd - 0.16, S.belly);
  }
  const head = new THREE.Group();
  if (biped) head.position.set(0, ly + bh - 0.06, -hw * 0.45 + 0.02);
  else head.position.set(0, ly + bh * 0.45, bd / 2 - 0.04);
  g.add(head);
  box(head, -hw / 2, 0, 0, hw, hw, hw * 0.9, S.body);
  const sn = S.sn;
  box(head, -sn.w / 2, 0.03, hw * 0.9, sn.w, sn.h, sn.l, sn.c);
  box(head, -0.03, 0.03 + sn.h - 0.02, hw * 0.9 + sn.l - 0.02, 0.06, 0.05, 0.04, 0x1a1a1a);
  const ey = S.eye || 0x111111;
  box(head, -hw / 2 + 0.04, hw * 0.55, hw * 0.9 - 0.01, 0.05, 0.05, 0.03, ey);
  box(head, hw / 2 - 0.09, hw * 0.55, hw * 0.9 - 0.01, 0.05, 0.05, 0.03, ey);
  const both = fn => { fn(-1); fn(1); };
  switch (sp) {
    case 'fox':
      both(s => { box(head, s * (hw / 2 - 0.05) - 0.045, hw, 0.04, 0.09, 0.15, 0.05, S.body); box(head, s * (hw / 2 - 0.05) - 0.045, hw + 0.11, 0.04, 0.09, 0.05, 0.05, 0x1a1a1a); });
      box(g, -0.05, ly + 0.1, -bd / 2 - 0.3, 0.1, 0.1, 0.32, S.body);
      box(g, -0.05, ly + 0.1, -bd / 2 - 0.34, 0.1, 0.1, 0.1, 0xf6ead8);
      break;
    case 'panda':
      both(s => { box(head, s * (hw / 2 - 0.04) - 0.05, hw - 0.03, 0.06, 0.1, 0.1, 0.06, 0x1f1f22); box(head, s * 0.1 - 0.045, hw * 0.5, hw * 0.9 - 0.015, 0.09, 0.1, 0.03, 0x1f1f22); });
      box(g, -0.06, ly + 0.04, -bd / 2 - 0.06, 0.12, 0.12, 0.08, 0xf4f4f0);
      break;
    case 'rabbit':
      both(s => { box(head, s * 0.06 - 0.035, hw, 0.03, 0.07, 0.3, 0.05, S.body); box(head, s * 0.06 - 0.015, hw + 0.02, 0.05, 0.03, 0.2, 0.02, 0xf0b8b8); });
      box(g, -0.06, ly + 0.1, -bd / 2 - 0.09, 0.12, 0.12, 0.1, 0xffffff);
      break;
    case 'bear': case 'warbear':
      both(s => box(head, s * (hw / 2 - 0.03) - 0.05, hw - 0.02, 0.05, 0.1, 0.09, 0.06, S.body));
      box(g, -0.05, ly + 0.15, -bd / 2 - 0.05, 0.1, 0.1, 0.07, S.body);
      if (sp === 'warbear') {
        box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, 0x8a919a);
        both(s => box(head, s * (hw / 2) - 0.03, hw + 0.04, 0.06, 0.06, 0.16, 0.06, 0xefe6c8));
        box(g, -bw / 2, ly + 0.04, -bd / 2 - 0.04, bw, bh, 0.05, 0x8e1f1f);
      }
      break;
    case 'wolf':
      both(s => box(head, s * (hw / 2 - 0.05) - 0.04, hw, 0.03, 0.08, 0.13, 0.05, S.body));
      box(g, -0.05, ly + 0.12, -bd / 2 - 0.26, 0.1, 0.12, 0.3, 0x666d75);
      box(g, -0.05, ly + 0.1, -bd / 2 - 0.3, 0.1, 0.1, 0.1, 0x2b3036);
      break;
    case 'boar':
      both(s => { box(head, s * 0.09 - 0.02, 0.02, hw * 0.9 + 0.08, 0.04, 0.1, 0.04, 0xf5f0e0); box(head, s * (hw / 2 - 0.05) - 0.04, hw - 0.02, 0.06, 0.08, 0.08, 0.05, S.body); });
      box(g, -0.04, ly + bh, -bd / 2 + 0.05, 0.08, 0.09, bd - 0.1, 0x2a1a12);
      box(g, -0.025, ly + 0.2, -bd / 2 - 0.08, 0.05, 0.05, 0.1, S.body);
      break;
    case 'raccoon':
      box(head, -hw / 2 - 0.005, hw * 0.45, hw * 0.9 - 0.015, hw + 0.01, 0.09, 0.03, 0x1d2024);
      both(s => box(head, s * (hw / 2 - 0.04) - 0.04, hw - 0.02, 0.05, 0.08, 0.08, 0.05, S.body));
      for (let k = 0; k < 4; k++) box(g, -0.06, ly + 0.08, -bd / 2 - 0.07 - k * 0.08, 0.12, 0.12, 0.08, k % 2 ? 0x2f3338 : 0x8a9098);
      break;
    case 'badger':
      box(g, -0.03, ly + bh, -bd / 2, 0.06, 0.02, bd, 0xf0f0ec);
      box(head, -0.03, hw, 0, 0.06, 0.02, hw * 0.9, 0xf0f0ec);
      both(s => box(head, s * (hw / 2 - 0.04) - 0.04, hw - 0.02, 0.05, 0.08, 0.07, 0.05, S.body));
      box(g, -0.1, ly + bh + 0.02, -bd / 2 - 0.1, 0.2, 0.18, bd + 0.35, 0x7a5230);
      box(g, -0.12, ly + bh, bd / 2 + 0.18, 0.24, 0.2, 0.08, 0x8a919a);
      break;
  }
  g.userData.legs = legs;
  g.userData.arms = arms;
  g.userData.head = head;
  return g;
}

function addGear(g, role, sp) {
  const S = SPEC[sp], head = g.userData.head, hw = S.hw;
  if (role === 'archer') {
    box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.07, hw * 0.9 + 0.04, 0x3f7d46);
    box(g, -S.bw / 2 - 0.06, S.ly + 0.02, -0.05, 0.04, 0.34, 0.04, 0x7b5232);
    box(g, -0.06, S.ly + S.bh - 0.02, -S.bd / 2 + 0.02, 0.12, 0.2, 0.08, 0x5a3a22);
  } else if (role === 'guard') {
    box(head, -hw / 2 - 0.02, hw - 0.03, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, 0xaeb6bd);
    box(g, S.bw / 2 + 0.03, S.ly, 0.08, 0.04, 0.7, 0.04, 0x7b5232);
    box(g, S.bw / 2 + 0.025, S.ly + 0.7, 0.08, 0.06, 0.1, 0.06, 0xdfe4e8);
    box(g, -S.bw / 2 - 0.06, S.ly + 0.05, 0.0, 0.05, 0.26, 0.22, 0xc0392b);
  } else if (role === 'knight') {
    box(g, -S.bw / 2 - 0.015, S.ly + 0.04, -S.bd / 2 + 0.1, S.bw + 0.03, S.bh * 0.7, S.bd * 0.55, 0xb9c0c8);
    box(head, -hw / 2 - 0.02, hw - 0.05, -0.02, hw + 0.04, 0.14, hw * 0.9 + 0.04, 0xaeb6bd);
    box(head, -0.03, hw + 0.08, 0.1, 0.06, 0.12, 0.2, 0xc0392b);
    box(g, S.bw / 2 + 0.03, S.ly + 0.1, 0.1, 0.04, 0.5, 0.04, 0xdfe4e8);
  } else if (role === 'musket') {
    box(head, -hw / 2 - 0.04, hw - 0.01, -0.04, hw + 0.08, 0.05, hw * 0.9 + 0.08, 0x2e3a55);
    box(head, -hw / 2 + 0.02, hw + 0.04, 0.0, hw - 0.04, 0.07, hw * 0.9 - 0.04, 0x2e3a55);
    box(g, S.bw / 2 + 0.02, S.ly + 0.12, -0.1, 0.05, 0.05, 0.7, 0x4a4a4f);
    box(g, S.bw / 2 + 0.02, S.ly + 0.1, -0.2, 0.06, 0.08, 0.2, 0x7b5232);
  } else if (role === 'worker') {
    box(head, -hw / 2 - 0.04, hw - 0.02, -0.04, hw + 0.08, 0.04, hw * 0.9 + 0.08, 0xe2c36b);
    const c = sp === 'panda' ? box(g, -0.1, S.ly + 0.06, -S.bd / 2 - 0.14, 0.2, 0.2, 0.14, 0xffffff) : box(g, -0.1, S.ly + S.bh, -0.12, 0.2, 0.16, 0.2, 0xffffff);
    c.visible = false;
    g.userData.carry = c;
  }
}

function makeUnitModel(role, sp, scale) {
  const g = makeAnimal(sp);
  addGear(g, role, sp);
  const wrap = new THREE.Group();
  wrap.add(g);
  g.scale.setScalar(scale || 1);
  wrap.userData = g.userData;
  wrap.userData.body = g;
  return wrap;
}

/* ===================== buildings ===================== */
const STONE = 0x9aa1a8, STONE_TOP = 0xc6ccd1, WOOD = 0x8b5e34;
function wallNeighbors(b) {
  const f = (di, dj) => { const i = b.i + di, j = b.j + dj; return inMap(i, j) && occ[i][j] && occ[i][j].def.wall; };
  return { n: f(0, -1), s: f(0, 1), e: f(1, 0), w: f(-1, 0) };
}
function buildModel(b) {
  const t = b.type, A = G.age, P = AGES[A].pal, g = new THREE.Group();
  g.userData.flags = [];
  switch (t) {
    case 'house':
      box(g, -0.36, 0, -0.36, 0.72, 0.1, 0.72, 0x8a857b);
      box(g, -0.32, 0.08, -0.32, 0.64, 0.42, 0.64, P.wall);
      if (A >= 1) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.03, 0.08, z * 0.3 - 0.03, 0.06, 0.42, 0.06, P.beam));
      roofPyr(g, 0, 0.5, 0, 0.86, P.roof, 4, 0.22);
      box(g, -0.08, 0.08, 0.32, 0.16, 0.24, 0.03, 0x4a2f1c);
      box(g, 0.14, 0.28, 0.32, 0.1, 0.1, 0.03, 0xbfe3f2, LAMP);
      if (A >= 1) box(g, 0.16, 0.62, -0.22, 0.1, 0.3, 0.1, 0x77716a);
      break;
    case 'infirmary':
      box(g, -0.38, 0, -0.38, 0.76, 0.1, 0.76, 0x8a857b);
      box(g, -0.34, 0.08, -0.34, 0.68, 0.4, 0.68, 0xf1ebdc);
      roofPyr(g, 0, 0.48, 0, 0.9, 0x5fa05a, 4, 0.26);
      box(g, -0.07, 0.2, 0.34, 0.14, 0.3, 0.03, 0xd9442f);
      box(g, -0.15, 0.28, 0.34, 0.3, 0.14, 0.03, 0xd9442f);
      box(g, -0.08, 0.3, 0.36, 0.16, 0.1, 0.02, 0xffffff);
      box(g, 0.2, 0.26, 0.34, 0.1, 0.1, 0.03, 0xbfe3f2, LAMP);
      box(g, -0.3, 0.08, 0.2, 0.1, 0.12, 0.1, 0x5fa05a); box(g, -0.28, 0.2, 0.22, 0.06, 0.06, 0.06, 0xf2c14e);
      break;
    case 'farm':
      box(g, -0.45, 0, -0.45, 0.9, 0.06, 0.9, 0x6b4a2f);
      for (let k = 0; k < 4; k++) {
        box(g, -0.4, 0.06, -0.36 + k * 0.22, 0.8, 0.18, 0.1, k % 2 ? 0x6fb04a : 0x5ea03e);
        for (let q = 0; q < 3; q++) box(g, -0.3 + q * 0.3, 0.22, -0.34 + k * 0.22, 0.07, 0.07, 0.07, 0xd9344a);
      }
      box(g, 0.34, 0.06, 0.34, 0.04, 0.4, 0.04, WOOD);
      box(g, 0.26, 0.3, 0.34, 0.2, 0.04, 0.04, WOOD);
      box(g, 0.32, 0.4, 0.32, 0.08, 0.08, 0.08, 0xe2c36b);
      if (A >= 2) { box(g, -0.45, 0.06, -0.45, 0.28, 0.3, 0.28, P.wall); roofPyr(g, -0.31, 0.36, -0.31, 0.36, P.roof, 2, 0.16); }
      break;
    case 'camp':
      box(g, -0.45, 0, -0.45, 0.9, 0.05, 0.9, 0x7a5c3a);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.38 - 0.035, 0.05, z * 0.38 - 0.035, 0.07, 0.5, 0.07, WOOD));
      box(g, -0.46, 0.55, -0.46, 0.92, 0.07, 0.92, P.roof);
      box(g, -0.35, 0.05, 0.1, 0.7, 0.12, 0.12, WOOD); box(g, -0.3, 0.17, 0.1, 0.6, 0.12, 0.12, 0x9a6a3c); box(g, -0.35, 0.05, 0.26, 0.7, 0.12, 0.12, 0x9a6a3c);
      box(g, 0.2, 0.05, -0.3, 0.18, 0.14, 0.18, 0x6b4a2f);
      box(g, 0.27, 0.19, -0.28, 0.04, 0.2, 0.04, WOOD);
      if (A >= 2) flagAt(g, -0.4, 0.55, -0.4, P.flag);
      break;
    case 'quarry':
      box(g, -0.46, 0, -0.46, 0.92, 0.05, 0.92, 0x8a9096);
      box(g, -0.4, 0.05, -0.35, 0.4, 0.3, 0.4, 0xa9afb5);
      box(g, 0.05, 0.05, 0.0, 0.35, 0.22, 0.35, 0x9aa0a6);
      box(g, -0.3, 0.05, 0.15, 0.25, 0.14, 0.25, 0xb6bcc2);
      box(g, 0.3, 0.05, -0.3, 0.04, 0.35, 0.04, WOOD);
      box(g, 0.22, 0.36, -0.31, 0.2, 0.05, 0.06, 0x8a919a);
      box(g, 0.12, 0.27, 0.08, 0.1, 0.08, 0.1, 0xf2c14e);
      if (A >= 2) flagAt(g, -0.4, 0.3, -0.42, P.flag);
      break;
    case 'market':
      box(g, -0.4, 0, -0.2, 0.8, 0.3, 0.4, 0x7b5232);
      box(g, -0.3, 0.3, -0.1, 0.15, 0.1, 0.15, 0xe56b6f); box(g, -0.05, 0.3, -0.1, 0.15, 0.1, 0.15, 0xf0b94a); box(g, 0.18, 0.3, -0.1, 0.15, 0.1, 0.15, 0x86c45e);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.42 - 0.03, 0, z * 0.3 - 0.03, 0.06, 0.65, 0.06, WOOD));
      for (let k = 0; k < 6; k++) box(g, -0.45 + k * 0.15, 0.65, -0.36, 0.15, 0.06, 0.72, k % 2 ? P.roof : 0xf2efe6);
      if (A >= 2) flagAt(g, 0.4, 0.7, -0.3, P.flag);
      break;
    case 'smith':
      box(g, -0.34, 0, -0.34, 0.68, 0.4, 0.68, 0x7d848c);
      box(g, -0.4, 0.4, -0.4, 0.8, 0.1, 0.8, 0x3b3f45); box(g, -0.3, 0.5, -0.3, 0.6, 0.1, 0.6, 0x3b3f45);
      box(g, 0.12, 0.5, -0.28, 0.16, 0.4, 0.16, 0x6c737a);
      box(g, 0.14, 0.9, -0.26, 0.12, 0.08, 0.12, 0xff8a2b, { basic: true, noshadow: true });
      box(g, 0.2, 0, 0.36, 0.2, 0.1, 0.14, 0x2b2e33); box(g, 0.17, 0.1, 0.34, 0.26, 0.06, 0.18, 0x2b2e33);
      box(g, -0.08, 0, 0.34, 0.16, 0.24, 0.03, 0x2a1d18);
      break;
    case 'palisade': case 'wall': {
      const nb = wallNeighbors(b), pal = t === 'palisade';
      const c1 = pal ? WOOD : STONE, c2 = pal ? 0x9a6a3c : STONE_TOP;
      if (pal) {
        box(g, -0.16, 0, -0.16, 0.32, 0.7, 0.32, c1); box(g, -0.1, 0.7, -0.1, 0.2, 0.12, 0.2, c1); box(g, -0.04, 0.82, -0.04, 0.08, 0.08, 0.08, c1);
        if (nb.e) { box(g, 0.16, 0.12, -0.11, 0.34, 0.45, 0.22, c2); box(g, 0.2, 0.57, -0.07, 0.26, 0.1, 0.14, c1); }
        if (nb.w) { box(g, -0.5, 0.12, -0.11, 0.34, 0.45, 0.22, c2); box(g, -0.46, 0.57, -0.07, 0.26, 0.1, 0.14, c1); }
        if (nb.s) { box(g, -0.11, 0.12, 0.16, 0.22, 0.45, 0.34, c2); box(g, -0.07, 0.57, 0.2, 0.14, 0.1, 0.26, c1); }
        if (nb.n) { box(g, -0.11, 0.12, -0.5, 0.22, 0.45, 0.34, c2); box(g, -0.07, 0.57, -0.46, 0.14, 0.1, 0.26, c1); }
      } else {
        box(g, -0.26, 0, -0.26, 0.52, 0.85, 0.52, c1); box(g, -0.3, 0.85, -0.3, 0.6, 0.12, 0.6, c2);
        if (nb.e) { box(g, 0.26, 0, -0.18, 0.24, 0.65, 0.36, c1); box(g, 0.26, 0.65, -0.21, 0.24, 0.1, 0.42, c2); }
        if (nb.w) { box(g, -0.5, 0, -0.18, 0.24, 0.65, 0.36, c1); box(g, -0.5, 0.65, -0.21, 0.24, 0.1, 0.42, c2); }
        if (nb.s) { box(g, -0.18, 0, 0.26, 0.36, 0.65, 0.24, c1); box(g, -0.21, 0.65, 0.26, 0.42, 0.1, 0.24, c2); }
        if (nb.n) { box(g, -0.18, 0, -0.5, 0.36, 0.65, 0.24, c1); box(g, -0.21, 0.65, -0.5, 0.42, 0.1, 0.24, c2); }
      }
      break;
    }
    case 'tower': {
      let topY0;
      if (A === 0) {
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.05, 0, z * 0.3 - 0.05, 0.1, 0.85, 0.1, WOOD));
        box(g, -0.4, 0.8, -0.4, 0.8, 0.08, 0.8, 0x9a6a3c);
        box(g, -0.4, 0.88, -0.4, 0.8, 0.12, 0.06, WOOD); box(g, -0.4, 0.88, 0.34, 0.8, 0.12, 0.06, WOOD);
        box(g, -0.4, 0.88, -0.4, 0.06, 0.12, 0.8, WOOD); box(g, 0.34, 0.88, -0.4, 0.06, 0.12, 0.8, WOOD);
        box(g, 0.28, 0.9, 0.28, 0.1, 0.1, 0.1, 0xffc36b, LAMP);
        topY0 = 0.88;
      } else {
        box(g, -0.32, 0, -0.32, 0.64, 0.9, 0.64, STONE);
        box(g, -0.4, 0.9, -0.4, 0.8, 0.1, 0.8, STONE_TOP);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.1, 1.0, z * 0.3 - 0.1, 0.2, 0.14, 0.2, STONE_TOP));
        box(g, -0.06, 0.4, 0.32, 0.12, 0.2, 0.03, 0xffd36b, LAMP);
        flagAt(g, -0.3, 1.0, -0.3, P.flag);
        topY0 = 1.0;
      }
      const tur = new THREE.Group();
      tur.position.set(0, topY0, 0);
      const fx = makeUnitModel('archer', 'fox', 0.7);
      tur.add(fx);
      g.add(tur);
      b.turret = tur;
      break;
    }
    case 'ballista': {
      box(g, -0.34, 0, -0.34, 0.68, 1.0, 0.68, STONE);
      box(g, -0.42, 1.0, -0.42, 0.84, 0.1, 0.84, STONE_TOP);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.32 - 0.09, 1.1, z * 0.32 - 0.09, 0.18, 0.12, 0.18, STONE_TOP));
      flagAt(g, -0.32, 1.1, -0.32, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 1.1, 0);
      box(tur, -0.18, 0, -0.18, 0.36, 0.1, 0.36, 0x5a3a22);
      box(tur, -0.45, 0.12, -0.04, 0.9, 0.06, 0.06, 0x7b5232);
      box(tur, -0.05, 0.1, -0.3, 0.1, 0.08, 0.7, 0x5a3a22);
      box(tur, -0.03, 0.16, 0.05, 0.06, 0.04, 0.5, 0xdfe4e8);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'cannon': {
      box(g, -0.4, 0, -0.4, 0.8, 0.8, 0.8, 0x6c737a);
      box(g, -0.46, 0.8, -0.46, 0.92, 0.1, 0.92, 0xe3b44e);
      box(g, -0.42, 0.9, -0.42, 0.84, 0.08, 0.84, 0x8a919a);
      box(g, -0.08, 0.3, 0.4, 0.16, 0.25, 0.03, 0x25282c);
      flagAt(g, -0.38, 0.98, -0.38, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 0.98, 0);
      box(tur, -0.2, 0, -0.2, 0.4, 0.2, 0.4, 0x3b3f45);
      box(tur, -0.12, 0.16, -0.12, 0.24, 0.22, 0.75, 0x25282c);
      box(tur, -0.14, 0.14, 0.5, 0.28, 0.26, 0.08, 0xe3b44e);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'barracks':
      box(g, -0.85, 0, -0.9, 1.7, 0.55, 1.2, P.wall);
      box(g, -0.85, 0, -0.9, 1.7, 0.08, 1.2, 0x6f6a62);
      if (A >= 1) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.82 - 0.04, 0, z * 0.57 - 0.3 - 0.04, 0.08, 0.55, 0.08, P.beam));
      box(g, -0.95, 0.55, -0.95, 1.9, 0.1, 1.3, P.roof); box(g, -0.8, 0.65, -0.8, 1.6, 0.1, 1.0, P.roof); box(g, -0.55, 0.75, -0.6, 1.1, 0.1, 0.6, P.roof);
      box(g, -0.15, 0, 0.29, 0.3, 0.35, 0.03, 0x3a2616);
      box(g, -0.6, 0.28, 0.29, 0.18, 0.2, 0.03, 0xc0392b); box(g, 0.42, 0.28, 0.29, 0.18, 0.2, 0.03, 0x2f5fb3);
      box(g, 0.6, 0, 0.65, 0.06, 0.4, 0.06, WOOD); box(g, 0.5, 0.25, 0.63, 0.26, 0.08, 0.08, WOOD); box(g, 0.58, 0.4, 0.62, 0.1, 0.1, 0.1, 0xe2c36b);
      box(g, -0.7, 0, 0.62, 0.3, 0.2, 0.1, WOOD);
      flagAt(g, -0.85, 0.75, -0.85, P.flag);
      break;
    case 'keep':
      if (A === 0) {
        box(g, -1.1, 0, -1.0, 2.2, 0.7, 2.0, P.wall);
        box(g, -1.1, 0, -1.0, 2.2, 0.08, 2.0, 0x6b4a2f);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 1.05 - 0.06, 0, z * 0.95 - 0.06, 0.12, 0.7, 0.12, P.beam));
        roofPyr(g, 0, 0.7, 0, 2.4, P.roof, 6, 0.4);
        box(g, -0.2, 0, 1.0, 0.4, 0.5, 0.04, 0x3a2616);
        flagAt(g, 0, 1.42, 0, P.flag);
      } else if (A === 1) {
        box(g, -1.1, 0, -1.1, 2.2, 0.45, 2.2, STONE);
        box(g, -0.95, 0.45, -0.95, 1.9, 0.65, 1.9, P.wall);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.92 - 0.06, 0.45, z * 0.92 - 0.06, 0.12, 0.65, 0.12, P.beam));
        roofPyr(g, 0, 1.1, 0, 2.3, P.roof, 6, 0.38);
        box(g, 0.75, 0, 0.75, 0.5, 1.5, 0.5, STONE);
        roofPyr(g, 1.0, 1.5, 1.0, 0.66, P.roof, 3, 0.22);
        box(g, -0.2, 0, 1.1, 0.4, 0.5, 0.04, 0x3a2616);
        flagAt(g, 0, 1.7, 0, P.flag);
      } else {
        const st = A === 2 ? 0x9ca3aa : 0xb9bec6, st2 = A === 2 ? 0xa9afb5 : 0xc6ccd1;
        box(g, -1.3, 0, -1.3, 2.6, 1.0, 2.6, st);
        for (let k = 0; k < 6; k++) {
          const p = -1.3 + k * 0.48;
          box(g, p, 1.0, -1.3, 0.26, 0.16, 0.26, st2); box(g, p, 1.0, 1.04, 0.26, 0.16, 0.26, st2);
          box(g, -1.3, 1.0, p, 0.26, 0.16, 0.26, st2); box(g, 1.04, 1.0, p, 0.26, 0.16, 0.26, st2);
        }
        box(g, -0.65, 1.0, -0.65, 1.3, 1.0, 1.3, st2);
        roofPyr(g, 0, 2.0, 0, 1.5, P.roof, 5, 0.3);
        if (A === 3) { box(g, -0.7, 1.95, -0.7, 1.4, 0.06, 1.4, P.trim); box(g, -0.05, 2.6, -0.05, 0.1, 0.5, 0.1, P.trim); }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
          box(g, x * 1.15 - 0.25, 0, z * 1.15 - 0.25, 0.5, 1.5, 0.5, st2);
          roofPyr(g, x * 1.15, 1.5, z * 1.15, 0.66, P.roof, 3, 0.22);
          if (A === 3) box(g, x * 1.15 - 0.27, 1.3, z * 1.15 - 0.27, 0.54, 0.06, 0.54, P.trim);
        });
        box(g, -0.3, 0, 1.3, 0.6, 0.7, 0.04, 0x3a2616);
        flagAt(g, 0, A === 3 ? 3.0 : 2.5, 0, P.flag);
      }
      break;
  }
  return g;
}

/* ===================== icons for the dock ===================== */
function shade(c, f) { return `rgb(${Math.min(255, ((c >> 16) & 255) * f) | 0},${Math.min(255, ((c >> 8) & 255) * f) | 0},${Math.min(255, (c & 255) * f) | 0})`; }
function iso(cx, cy, w, h, top, side) {
  const a = w, b = w / 2;
  return `<polygon points="${cx},${cy - b} ${cx + a},${cy} ${cx},${cy + b} ${cx - a},${cy}" fill="${shade(top, 1.08)}"/>` +
    `<polygon points="${cx - a},${cy} ${cx},${cy + b} ${cx},${cy + b + h} ${cx - a},${cy + h}" fill="${shade(side, 0.86)}"/>` +
    `<polygon points="${cx + a},${cy} ${cx},${cy + b} ${cx},${cy + b + h} ${cx + a},${cy + h}" fill="${shade(side, 0.64)}"/>`;
}
const ICONS = {
  house: [[24, 24, 13, 12, 0xd2c2a6, 0xd2c2a6], [24, 17, 16, 5, 0xa5513f, 0xa5513f]],
  infirmary: [[24, 27, 13, 10, 0xf1ebdc, 0xf1ebdc], [24, 19, 15, 5, 0x5fa05a, 0x5fa05a], [24, 26, 3, 4, 0xd9442f, 0xd9442f]],
  farm: [[24, 28, 17, 3, 0x6fb04a, 0x6b4a2f], [16, 26, 4, 3, 0xd9344a, 0xd9344a], [30, 28, 4, 3, 0xd9344a, 0xd9344a]],
  camp: [[24, 28, 15, 5, 0x9a6a3c, 0x7a5c3a], [24, 18, 16, 4, 0xd8b85c, 0xb9964a]],
  quarry: [[19, 30, 10, 8, 0xa9afb5, 0x8a9096], [29, 25, 9, 7, 0xb6bcc2, 0x7d848c]],
  market: [[24, 28, 14, 8, 0x9a6a3c, 0x7b5232], [24, 19, 16, 4, 0xe56b6f, 0xd9a5a5]],
  barracks: [[24, 27, 17, 10, 0x9ca3aa, 0x9ca3aa], [24, 19, 19, 5, 0x3e6199, 0x3e6199]],
  smith: [[24, 28, 13, 10, 0x7d848c, 0x7d848c], [24, 20, 15, 4, 0x3b3f45, 0x3b3f45], [31, 14, 3, 3, 0xff8a2b, 0xff8a2b]],
  palisade: [[24, 28, 6, 14, 0xb0814e, 0x8b5e34], [16, 26, 4, 12, 0xb0814e, 0x8b5e34], [32, 26, 4, 12, 0xb0814e, 0x8b5e34]],
  wall: [[24, 30, 9, 12, 0xc6ccd1, 0x9aa1a8], [15, 26, 5, 8, 0xc6ccd1, 0x9aa1a8]],
  tower: [[24, 30, 8, 16, 0xb9bfc5, 0x9aa1a8], [24, 16, 11, 3, 0xc6ccd1, 0xc6ccd1]],
  ballista: [[24, 30, 8, 16, 0xb9bfc5, 0x9aa1a8], [24, 16, 11, 3, 0xc6ccd1, 0xc6ccd1], [24, 12, 6, 2, 0x7b5232, 0x5a3a22]],
  cannon: [[24, 31, 10, 13, 0x6c737a, 0x6c737a], [24, 18, 12, 3, 0xe3b44e, 0xb98c2a], [24, 13, 4, 5, 0x25282c, 0x25282c]]
};
function iconSVG(type) {
  return `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ICONS[type].map(a => iso(...a)).join('')}</svg>`;
}
function unitIconSVG(sp) {
  const S = SPEC[sp], c = shade(S.body, 1), sn = shade(S.sn.c, 1);
  const ear = sp === 'rabbit' ? `<rect x="14" y="4" width="6" height="16" fill="${c}"/><rect x="28" y="4" width="6" height="16" fill="${c}"/>` :
    sp === 'panda' ? `<rect x="11" y="9" width="9" height="9" fill="#1f1f22"/><rect x="28" y="9" width="9" height="9" fill="#1f1f22"/>` :
    `<polygon points="12,20 14,6 22,14" fill="${c}"/><polygon points="36,20 34,6 26,14" fill="${c}"/>`;
  const patch = sp === 'panda' ? `<rect x="15" y="20" width="7" height="8" fill="#1f1f22"/><rect x="26" y="20" width="7" height="8" fill="#1f1f22"/>` : '';
  return `<svg viewBox="0 0 48 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${ear}<rect x="10" y="14" width="28" height="24" fill="${c}"/>${patch}<rect x="17" y="27" width="14" height="11" fill="${sn}"/><rect x="20" y="27" width="8" height="4" fill="#1a1a1a"/><rect x="16" y="22" width="4" height="4" fill="#111"/><rect x="28" y="22" width="4" height="4" fill="#111"/></svg>`;
}

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
function canPlace(type, ai, aj) {
  const def = BDEF[type];
  for (const [i, j] of footprint(def, ai, aj)) {
    if (i < MARGIN || j < MARGIN || i >= MAP - MARGIN || j >= MAP - MARGIN) return false;
    if (kind[i][j] !== 'g' || occ[i][j] || nodeAt[i][j]) return false;
  }
  return true;
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
    if (!b.def.wall) makeBuildingMesh(b);
    if (!b.done) addScaffoldFix(b);
  }
  sfx('age');
  toast(`A new age dawns: ${AGES[G.age].name}`);
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
  sun.position.set(KX + px * 46, Math.max(11, py * 46), KZ + (sunUp ? 18 : 14));
  if (sunUp) C_SUN.setHex(AGES[G.age].sun).lerp(C_DAWN, tw * 0.8); else C_SUN.copy(C_MOON);
  sun.color.copy(C_SUN);
  sun.intensity = (sunUp ? AGES[G.age].sunI * dim * sstep(-0.02, 0.3, ay) : 0.34 * dim * sstep(0.02, 0.3, -ay)) + ENV.flash * 0.6;
  hemi.intensity = lerpN(0.72 * (1 - 0.25 * w.cloud), 0.42, n) + ENV.flash * 1.4;
  hemi.color.setHex(0xffffff).lerp(cB.setHex(0xffd1a8), tw * 0.45).lerp(cB.setHex(0x8fa0d8), n);
  hemi.groundColor.setHex(0x6b8f5a).lerp(cB.setHex(0x2a3a4a), n);

  // sun and moon discs, stars
  sunMesh.visible = w.cloud < 0.85;
  sunMesh.position.set(KX + (sun.position.x - KX) * 2.2, sun.position.y * 2.2, KZ + (sun.position.z - KZ) * 2.2);
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

/* ===================== audio: everything is synthesized with Web Audio ===================== */
const AUD = { ctx: null, master: null, fx: null, amb: null, mus: null, noise: null, voices: 0, last: {}, mode: 0, wind: null, rain: null, cricket: null, droneG: null, nextBird: 3, mTime: 0, mStep: 0, mi: 2 };
const SND_LABEL = ['On', 'Effects only', 'Off'];

function audioInit() {
  if (AUD.ctx) { if (AUD.ctx.state === 'suspended') AUD.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  let c;
  try { c = new AC(); } catch (e) { return; }
  AUD.ctx = c;
  const comp = c.createDynamicsCompressor(); comp.connect(c.destination);
  AUD.master = c.createGain(); AUD.master.connect(comp);
  AUD.fx = c.createGain(); AUD.fx.gain.value = 0.9; AUD.fx.connect(AUD.master);
  AUD.amb = c.createGain(); AUD.amb.connect(AUD.master);
  AUD.mus = c.createGain(); AUD.mus.connect(AUD.master);
  const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AUD.noise = buf;
  const loop = (type, f, q) => {
    const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
    const flt = c.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q;
    const g = c.createGain(); g.gain.value = 0;
    s.connect(flt); flt.connect(g); g.connect(AUD.amb); s.start();
    return { g, flt };
  };
  AUD.wind = loop('lowpass', 420, 0.4);
  AUD.rain = loop('highpass', 1600, 0.5);
  // crickets: a high tone chopped by a fast LFO
  const car = c.createOscillator(); car.frequency.value = 4300;
  const am = c.createGain(); am.gain.value = 0.5;
  const lfo = c.createOscillator(); lfo.frequency.value = 7;
  const lg = c.createGain(); lg.gain.value = 0.5;
  lfo.connect(lg); lg.connect(am.gain); car.connect(am);
  AUD.cricket = c.createGain(); AUD.cricket.gain.value = 0;
  am.connect(AUD.cricket); AUD.cricket.connect(AUD.amb);
  car.start(); lfo.start();
  // a soft drone under the music
  AUD.droneG = c.createGain(); AUD.droneG.gain.value = 0; AUD.droneG.connect(AUD.mus);
  [73.42, 110].forEach(f => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(AUD.droneG); o.start(); });
  applyAudioMode();
}
function applyAudioMode() {
  if (!AUD.ctx) return;
  const t = AUD.ctx.currentTime;
  AUD.master.gain.setTargetAtTime(AUD.mode === 2 ? 0 : 0.8, t, 0.05);
  AUD.mus.gain.setTargetAtTime(AUD.mode === 0 ? 0.5 : 0, t, 0.1);
}
function refreshSoundButton() { document.getElementById('btnSound').textContent = 'Sound: ' + SND_LABEL[AUD.mode]; }
document.getElementById('btnSound').addEventListener('click', () => {
  audioInit();
  AUD.mode = (AUD.mode + 1) % 3;
  applyAudioMode(); refreshSoundButton(); sfx('click');
});
window.addEventListener('pointerdown', audioInit);
window.addEventListener('keydown', audioInit);
refreshSoundButton();

/* ---- voices ---- */
function mkOut(vol, pan) {
  const c = AUD.ctx, g = c.createGain();
  g.gain.value = vol;
  let last = g;
  if (c.createStereoPanner && pan) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); last = p; }
  last.connect(AUD.fx);
  return g;
}
function tone(out, f, dur, type, vol, when, slide) {
  const c = AUD.ctx;
  if (AUD.voices > 30) return;
  const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  AUD.voices++; o.onended = () => { AUD.voices--; };
}
function noise(out, dur, vol, type, f0, f1, q, when, attack) {
  const c = AUD.ctx;
  if (AUD.voices > 30) return;
  const t = c.currentTime + (when || 0), s = c.createBufferSource(), flt = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AUD.noise;
  flt.type = type || 'lowpass'; flt.Q.value = q || 1;
  flt.frequency.setValueAtTime(f0, t);
  if (f1) flt.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (attack || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(flt); flt.connect(g); g.connect(out);
  s.start(t, Math.random() * 1.4, dur + 0.05);
  AUD.voices++; s.onended = () => { AUD.voices--; };
}
const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, C6: 1046.5, A4: 440, F5: 698.46, E4: 329.63, A3: 220 };
const SFX = {
  click: o => tone(o, 660, 0.05, 'square', 0.06),
  error: o => tone(o, 150, 0.2, 'sawtooth', 0.12, 0, 100),
  place: o => { noise(o, 0.12, 0.35, 'lowpass', 500, 200); tone(o, 110, 0.12, 'square', 0.1, 0, 70); },
  done: o => { tone(o, NOTE.C5, 0.2, 'triangle', 0.16); tone(o, NOTE.G5, 0.32, 'triangle', 0.16, 0.09); },
  hammer: o => { tone(o, 420, 0.05, 'square', 0.05, 0, 250); noise(o, 0.04, 0.12, 'bandpass', 1800, 0, 2); },
  chop: o => noise(o, 0.06, 0.16, 'bandpass', 900, 500, 2),
  clink: o => tone(o, 1500, 0.05, 'square', 0.04, 0, 1100),
  coin: o => { tone(o, 1320, 0.12, 'sine', 0.06); tone(o, 1760, 0.18, 'sine', 0.06, 0.06); },
  spawn: o => tone(o, 600, 0.12, 'sine', 0.09, 0, 980),
  arrow: o => noise(o, 0.15, 0.2, 'bandpass', 2400, 900, 2),
  bolt: o => { tone(o, 190, 0.25, 'sawtooth', 0.12, 0, 80); noise(o, 0.12, 0.16, 'bandpass', 1500, 600, 2); },
  ball: o => { tone(o, 110, 0.55, 'sine', 0.5, 0, 34); noise(o, 0.45, 0.5, 'lowpass', 900, 120); },
  bullet: o => { noise(o, 0.1, 0.4, 'highpass', 1800, 0); tone(o, 900, 0.08, 'square', 0.08, 0, 200); },
  stone: o => tone(o, 300, 0.1, 'triangle', 0.1, 0, 150),
  hit: o => { noise(o, 0.08, 0.28, 'lowpass', 700, 200); tone(o, 140, 0.08, 'square', 0.08); },
  bash: o => { noise(o, 0.14, 0.35, 'lowpass', 420, 120); tone(o, 80, 0.15, 'square', 0.18); },
  die: o => tone(o, 320, 0.3, 'sawtooth', 0.1, 0, 80),
  dieFriend: o => tone(o, 540, 0.35, 'triangle', 0.12, 0, 200),
  crumble: o => { noise(o, 0.8, 0.45, 'lowpass', 520, 70); tone(o, 60, 0.5, 'sine', 0.35); },
  horn: o => { tone(o, 98, 1.1, 'sawtooth', 0.2); tone(o, 147, 1.1, 'sawtooth', 0.12); tone(o, 98, 1.4, 'sawtooth', 0.22, 1.25); tone(o, 147, 1.4, 'sawtooth', 0.12, 1.25); },
  howl: o => { tone(o, 380, 1.0, 'sine', 0.1, 0.5, 720); tone(o, 720, 0.9, 'sine', 0.08, 1.4, 420); },
  age: o => { [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => tone(o, f, 0.4, 'triangle', 0.16, i * 0.13)); tone(o, NOTE.C6, 0.9, 'sine', 0.1, 0.55); },
  level: o => { tone(o, NOTE.E5, 0.14, 'triangle', 0.14); tone(o, NOTE.G5, 0.14, 'triangle', 0.14, 0.09); tone(o, NOTE.C6, 0.3, 'triangle', 0.14, 0.18); },
  ability: o => { noise(o, 0.35, 0.3, 'bandpass', 500, 2400, 3); tone(o, 330, 0.3, 'sawtooth', 0.1, 0, 660); },
  heal: o => { tone(o, 880, 0.2, 'sine', 0.05); tone(o, 1175, 0.25, 'sine', 0.05, 0.08); },
  crack: o => noise(o, 0.18, 0.7, 'highpass', 2200, 400),
  thunder: o => noise(o, 3, 0.8, 'lowpass', 340, 50, 1, 0, 0.25),
  win: o => { [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.G5, NOTE.C6].forEach((f, i) => tone(o, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  lose: o => { [NOTE.A4, NOTE.F5 / 1.26, NOTE.E4, NOTE.A3].forEach((f, i) => tone(o, f, 0.7, 'sawtooth', 0.1, i * 0.3, f * 0.9)); }
};
const SFX_GAP = { arrow: 0.06, hit: 0.05, bash: 0.08, coin: 0.25, chop: 0.14, clink: 0.14, hammer: 0.18, die: 0.05, dieFriend: 0.1, bolt: 0.1, stone: 0.08, bullet: 0.06, place: 0.05, spawn: 0.1, click: 0.03, done: 0.1, heal: 0.6, ability: 0.1 };
function sfx(name, x, z) {
  const c = AUD.ctx;
  if (!c || AUD.mode === 2 || !SFX[name]) return;
  const now = c.currentTime;
  if (AUD.last[name] !== undefined && now - AUD.last[name] < (SFX_GAP[name] || 0.02)) return;
  AUD.last[name] = now;
  let vol = 1, pan = 0;
  if (x !== undefined) {
    const dx = x - cam.tx, dz = z - cam.tz;
    vol = clamp(1 - Math.hypot(dx, dz) / 45, 0.12, 1);
    pan = clamp((dx * Math.cos(cam.yaw) - dz * Math.sin(cam.yaw)) / 22, -1, 1);
  }
  SFX[name](mkOut(vol, pan));
}
function birdChirp() {
  const c = AUD.ctx;
  if (!c || AUD.mode === 2) return;
  const o = mkOut(0.5, rnd(-0.8, 0.8)), base = rnd(2000, 3200), n = rint(2, 4);
  for (let i = 0; i < n; i++) tone(o, base, 0.07, 'sine', 0.035, i * 0.09, base * rnd(1.15, 1.5));
}

/* ---- gentle generative music: lute-like plucks, drums during raids ---- */
const SC_DAY = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25];
const SC_NIGHT = [220, 261.63, 293.66, 349.23, 440, 523.25];
const SC_WAR = [146.83, 174.61, 220, 261.63, 293.66, 349.23];
function pluck(f, when, vol, dur) {
  const c = AUD.ctx, t = c.currentTime + when, o = c.createOscillator(), g = c.createGain(), flt = c.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = f; flt.type = 'lowpass'; flt.frequency.value = Math.min(5000, f * 5);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(flt); flt.connect(g); g.connect(AUD.mus); o.start(t); o.stop(t + dur + 0.05);
}
function drum(when, vol) {
  const c = AUD.ctx, t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.connect(g); g.connect(AUD.mus); o.start(t); o.stop(t + 0.35);
}
function musicTick() {
  const c = AUD.ctx;
  if (AUD.mode !== 0 || G.paused || G.over) { AUD.mTime = Math.max(AUD.mTime, c.currentTime); return; }
  const raid = enemies.some(e => !e.dead), n = ENV.night, bpm = raid ? 104 : n > 0.5 ? 60 : 72, stepLen = 60 / bpm / 2;
  if (AUD.mTime < c.currentTime) AUD.mTime = c.currentTime + 0.05;
  const sc = raid ? SC_WAR : n > 0.5 ? SC_NIGHT : SC_DAY, p = raid ? 0.62 : n > 0.5 ? 0.28 : 0.45;
  while (AUD.mTime < c.currentTime + 0.6) {
    const s = AUD.mStep++, when = AUD.mTime - c.currentTime;
    if (Math.random() < p) { AUD.mi = clamp(AUD.mi + rint(-2, 2), 0, sc.length - 1); pluck(sc[AUD.mi], when, 0.07, raid ? 0.35 : 0.7); }
    if (s % 8 === 0) pluck(sc[0] / 2, when, 0.06, 1.4);
    if (raid && s % 4 === 0) drum(when, s % 8 === 0 ? 0.5 : 0.3);
    AUD.mTime += stepLen;
  }
  AUD.droneG.gain.setTargetAtTime(raid ? 0.035 : 0.018 + 0.015 * n, c.currentTime, 1);
}

/* ---- ambient beds follow the weather and time of day ---- */
function audioUpdate(dt) {
  const c = AUD.ctx;
  if (!c || AUD.mode === 2) return;
  const t = c.currentTime, w = ENV.w, n = ENV.night;
  AUD.wind.g.gain.setTargetAtTime(0.025 + 0.1 * ENV.wind + 0.12 * w.storm, t, 0.5);
  AUD.wind.flt.frequency.setTargetAtTime(300 + ENV.wind * 600, t, 0.5);
  AUD.rain.g.gain.setTargetAtTime(0.16 * w.rain, t, 0.5);
  AUD.cricket.gain.setTargetAtTime(0.012 * n * (1 - w.rain) * (1 - w.snow), t, 1);
  AUD.nextBird -= dt;
  if (AUD.nextBird <= 0) { AUD.nextBird = rnd(2.5, 7); if (n < 0.4 && w.rain < 0.2 && w.storm < 0.2 && !G.paused && Math.random() > ENV.sw[3] * 0.85) birdChirp(); }
  musicTick();
}

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
const panVel = { x: 0, y: 0 };
function panKeys(dt) {
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
    if (c.it.kindOf === 'x') c.el.querySelector('.cs').innerHTML = costHTML(cost);
    c.el.querySelectorAll('.cs span').forEach(s => s.classList.toggle('no', G.res[s.dataset.r] < +s.dataset.n));
  }
}
const hud = { cache: {} };
function setText(id, v) { if (hud.cache[id] !== v) { hud.cache[id] = v; $(id).textContent = v; } }
function updateHUD() {
  setText('vWood', Math.floor(G.res.wood)); setText('vStone', Math.floor(G.res.stone));
  setText('vFood', Math.floor(G.res.food)); setText('vGold', Math.floor(G.res.gold));
  setText('vPop', popCount() + '/' + G.popCap);
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
  if (d.income) return Object.keys(d.income).map(k => `Makes ${(d.income[k] * (k === 'food' ? seasonFood() : 1)).toFixed(2)} ${k} per second${k === 'food' ? ' (' + SEASONS[ENV.season].name + ')' : ''}.`).join(' ');
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
  if (u.role === 'worker') return { goto: 'Walking where you sent it', toNode: 'Heading to gather', gather: 'Gathering', toDrop: 'Carrying a load', toSite: 'Heading to build', build: 'Building', toRepair: 'Heading to repair', repair: 'Repairing', flee: 'Running for cover' }[u.state] || 'Idle';
  if (u.order) return { move: 'Moving', amove: 'Attack-moving', attack: 'Attacking a target' }[u.order.type];
  return u.hold ? 'Holding position' : u.tgt ? 'Fighting' : 'Guarding';
}
const buildCancelEl = $('buildCancel');
function cancelBuild() { G.build = null; ghost.visible = false; updateDock(true); sfx('click'); syncBuildCancel(); }
function syncBuildCancel() { const on = !!G.build && !G.over; buildCancelEl.classList.toggle('on', on); if (on) buildCancelEl.textContent = `\u2715 Stop building ${BDEF[G.build].name}`; }
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
  if (!canPlace(type, ai, aj)) { if (!quiet) toast('Cannot build there', true); return false; }
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
      if (pinch) { panBy(mx - pinch.mx, my - pinch.my); cam.dist *= pinch.d / d; cam.yaw -= Math.atan2(Math.sin(ang - pinch.a), Math.cos(ang - pinch.a)); }
      pinch = { d, a: ang, mx, my };
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
const zoomBy = f => { cam.dist *= f; panVel.x = panVel.y = 0; };
$('zoomIn').addEventListener('click', () => zoomBy(0.78));
$('zoomOut').addEventListener('click', () => zoomBy(1.28));
canvasEl.addEventListener('wheel', e => { e.preventDefault(); cam.dist *= Math.exp(e.deltaY * 0.001); }, { passive: false });
window.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); if (!G.over && !$('intro').classList.contains('on')) G.paused = !G.paused; return; }
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
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!G.paused && !G.over) for (let k = 0; k < G.speed; k++) step(dt);
  const adt = G.paused ? 0 : dt * G.speed;
  panKeys(dt); applyCam();
  updateEnv(dt, now); audioUpdate(dt); autosaveTick(dt);
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
      res: Object.assign({}, G.res), age: G.age, t: G.t, wave: G.wave, nextWave: G.nextWave === Infinity ? -1 : G.nextWave, smith: G.smith, tech: Object.assign({}, G.tech), threat: G.threat,
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
    res: Object.assign({ wood: 0, stone: 0, food: 0, gold: 0 }, g.res), age: g.age, t: g.t, wave: g.wave, nextWave: g.nextWave < 0 ? Infinity : g.nextWave, over: false, smith: g.smith, tech: Object.assign({ armor: 0, farm: 0, tools: 0 }, g.tech), threat: g.threat,
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
    u.elite = !!su.elite; if (u.elite) u.model.scale.multiplyScalar(1.12);
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
let autoT = 20;
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
  $('startBtn').addEventListener('click', () => { gameStarted = true; autoT = 20; });
  $('againBtn').addEventListener('click', () => { gameStarted = true; autoT = 20; });
})();
