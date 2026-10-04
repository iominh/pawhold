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

const WALL_COST = [{ wood: 6 }, { stone: 8 }, { stone: 10 }, { stone: 12 }];
const WALL_HP = [110, 340, 520, 760];
const BDEF = {
  house:    { name: 'Burrow House', cat: 'town', size: 1, age: 0, cost: { wood: 20 }, hp: 90, time: 3, pop: 3, r: 0.8, blurb: 'Shelter for 3 animals.', role: 'Housing', what: 'Burrows where your animals sleep. Every house raises the population cap by 3.', help: 'More animals means more settlers gathering and more defenders. New settlers only arrive while there is room, and soldiers count against the cap too.', tip: 'If the pop counter is full (say 8/8), nobody new will join. Build houses before you need them.' },
  farm:     { name: 'Berry Farm', cat: 'town', size: 1, age: 0, cost: { wood: 30 }, hp: 70, time: 4, r: 0.8, drop: ['food'], income: { food: 0.55 }, blurb: 'Grows food. Berries are dropped off here.', role: 'Food', what: 'A berry patch tended automatically.', help: 'Makes 0.55 food a second on its own, and settlers drop berries off here. Food feeds new settlers (25 each) and trains soldiers.', tip: 'Build beside berry bushes or close to the Hall to keep carry trips short.' },
  camp:     { name: 'Lumber Camp', cat: 'town', size: 1, age: 0, cost: { wood: 35 }, hp: 90, time: 3, r: 0.8, drop: ['wood'], blurb: 'Wood drop-off. Build beside a forest.', role: 'Wood drop-off', what: 'A stockpile where choppers unload their logs.', help: 'Settlers carry 8 wood a trip, so a long walk wastes most of their day. A camp beside a forest cuts the walk, and drop-offs here pay +25% over the Great Hall.', tip: 'Place it on the edge of a forest, not in the middle of your town.' },
  quarry:   { name: 'Quarry', cat: 'town', size: 1, age: 1, cost: { wood: 50 }, hp: 120, time: 5, r: 0.8, drop: ['stone', 'gold'], blurb: 'Stone and gold drop-off. Build beside rocks.', role: 'Stone and gold drop-off', what: 'A stone yard where miners unload rock and gold.', help: 'Stone builds walls, towers and the Castle Age. Like the camp, it pays +25% on everything dropped here and saves long trips.', tip: 'Put it next to grey rocks or gold veins.' },
  market:   { name: 'Market', cat: 'town', size: 1, age: 1, cost: { wood: 70, stone: 20 }, hp: 120, time: 5, r: 0.8, income: { gold: 0.45 }, blurb: 'Trades goods for a trickle of gold.', role: 'Gold income', what: 'Traders pay a steady stream of gold.', help: 'Earns 0.45 gold a second with no workers needed. Gold trains Guards, Knights and Musketeers, upgrades weapons and buys new ages.', tip: 'Several markets fund a much bigger army. They are safest inside your walls.' },
  barracks: { name: 'Barracks', cat: 'army', size: 2, age: 0, cost: { wood: 80, stone: 10 }, hp: 260, time: 7, r: 1.4, blurb: 'Trains defenders. Needed for the units below.', role: 'Training', what: 'Where defenders are trained. Open the Army tab and pick a unit.', help: 'Without one you cannot train soldiers. Defenders gather on the side raiders are coming from, fight them, and level up from kills. Select them and right-click to give orders.', tip: 'Build it near the Hall. Soldiers also count against housing.' },
  smith:    { name: 'Blacksmith', cat: 'army', size: 1, age: 2, cost: { wood: 60, stone: 60 }, hp: 160, time: 6, r: 0.8, blurb: 'Sharpens every weapon in the valley.', role: 'Weapon upgrades', what: 'A forge that sharpens every weapon in the valley.', help: 'Unlocks the Sharpen Weapons upgrade in the Army tab: +20% damage per level for every defender and tower, up to three levels.', tip: 'Worth it before the boss raids at 5, 10 and 15.' },
  wall:     { name: 'Wall', cat: 'defense', size: 1, age: 0, wall: true, r: 0.6, time: 1.6, get cost() { return WALL_COST[Math.min(G.age, 3)]; }, get hp() { return WALL_HP[Math.min(G.age, 3)]; }, blurb: 'Drag to draw a line. Upgrades itself as you advance.', role: 'Wall', what: 'A line of defence that grows with your clan: wooden stakes in the Hamlet, stone from the Medieval Town, battlements in the Castle Age and reinforced stone with the Gunpowder Age.', help: 'Raiders must chew through it or walk around. Your own animals walk straight through. Every time you advance an age, every wall you have already built is rebuilt stronger for free, keeping its damage. It funnels raiders to where your towers and archers can reach them.', tip: 'Drag to draw a line. A gap in front of your towers makes a kill zone. New walls cost more stone as the ages go on.' },
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
    const lm = { mat: pick(leafMats) }, v = hash(i * 5.3, j * 9.1);
    if (v < 0.5) {   // round canopy
      box(g, -0.07, 0, -0.07, 0.14, 0.35, 0.14, 0x6b4a2f);
      box(g, -0.34, 0.3, -0.34, 0.68, 0.22, 0.68, 0, lm);
      box(g, -0.25, 0.5, -0.25, 0.5, 0.22, 0.5, 0, lm);
      box(g, -0.14, 0.7, -0.14, 0.28, 0.2, 0.28, 0, lm);
    } else if (v < 0.78) {   // pine
      box(g, -0.06, 0, -0.06, 0.12, 0.3, 0.12, 0x5a3d26);
      [[0.74, 0.22], [0.56, 0.42], [0.38, 0.6], [0.2, 0.76]].forEach(([s, y]) => box(g, -s / 2, y, -s / 2, s, 0.2, s, 0, lm));
      box(g, -0.05, 0.94, -0.05, 0.1, 0.1, 0.1, 0, lm);
    } else {   // tall tree with a high crown
      box(g, -0.07, 0, -0.07, 0.14, 0.55, 0.14, 0x6b4a2f);
      box(g, -0.3, 0.48, -0.3, 0.6, 0.24, 0.6, 0, lm);
      box(g, -0.36, 0.66, -0.2, 0.72, 0.2, 0.44, 0, lm);
      box(g, -0.18, 0.84, -0.18, 0.36, 0.2, 0.36, 0, lm);
    }
    g.scale.y = rnd(0.85, 1.25);
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
