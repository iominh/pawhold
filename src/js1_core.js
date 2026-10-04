'use strict';
/* ===================== Pawhold: constants and definitions ===================== */
const MAP = 88, KX = 44, KZ = 44, MARGIN = 3, TOTAL_WAVES = 25, RAID_DIST = 21;   // raiders muster about 21 tiles out, whatever the map size
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RES = ['wood', 'stone', 'food', 'gold'];          // gathered by settlers
const RES2 = ['alloy', 'anti'];                          // made by late-age buildings: Alloy from the Fusion Age, Antimatter from the Quantum Age
const RES_NAME = { wood: 'Wood', stone: 'Stone', food: 'Food', gold: 'Gold', alloy: 'Alloy', anti: 'Antimatter' };

const AGES = [
  { name: 'Hamlet', sky: 0xa9d9ee, sun: 0xfff2d8, sunI: 0.85, pal: { wall: 0xb98a56, roof: 0xd8b85c, trim: 0x7b5232, beam: 0x7b5232, flag: 0xe4702b } },
  { name: 'Medieval Town', sky: 0xb7dcee, sun: 0xfff6e6, sunI: 0.9, pal: { wall: 0xd2c2a6, roof: 0xa5513f, trim: 0x6d4a30, beam: 0x6d4a30, flag: 0xc0392b } },
  { name: 'Castle Age', sky: 0xf0d9ae, sun: 0xffe2a8, sunI: 0.85, pal: { wall: 0x9ca3aa, roof: 0x3e6199, trim: 0xcfd4d8, beam: 0x6c737a, flag: 0x2f5fb3 } },
  { name: 'Gunpowder Age', sky: 0xc9b6dc, sun: 0xffd2b0, sunI: 0.8, pal: { wall: 0xb9bec6, roof: 0x2e3a55, trim: 0xe3b44e, beam: 0x8a919a, flag: 0x7a2fb3 } },
  { name: 'Imperial Age', sky: 0xe3d3c2, sun: 0xffe6c4, sunI: 0.86, pal: { wall: 0xe9e3d7, roof: 0x8c2d3a, trim: 0xd4af37, beam: 0x7a6a5a, flag: 0xb3122e } },
  { name: 'Clockwork Age', sky: 0xc4d4de, sun: 0xfff1dc, sunI: 0.9, pal: { wall: 0x707b87, roof: 0xb87333, trim: 0xe0b24a, beam: 0x3f464f, flag: 0x1f8a70 } },
  { name: 'Skyward Age', sky: 0x9fc6ff, sun: 0xfff8ee, sunI: 0.95, pal: { wall: 0xdfe6f0, roof: 0x2cc4d8, trim: 0x7fe0ff, beam: 0x3b4a5a, flag: 0x00e5ff } },
  { name: 'Fusion Age', sky: 0xb9d6ff, sun: 0xfff6f0, sunI: 0.95, pal: { wall: 0x2f3b4a, roof: 0xff7a2a, trim: 0xffb347, beam: 0x1b2430, flag: 0xff6a00 } },
  { name: 'Orbital Age', sky: 0x8fb4ff, sun: 0xffffff, sunI: 1.0, pal: { wall: 0xe8ecf4, roof: 0x5c6fff, trim: 0xc3d0ff, beam: 0x2a3350, flag: 0x5c6fff } },
  { name: 'Nanotech Age', sky: 0xa8e6d8, sun: 0xf4fff8, sunI: 0.95, pal: { wall: 0x1f2a2a, roof: 0x19e6a0, trim: 0x7fffd4, beam: 0x0f1a1a, flag: 0x19e6a0 } },
  { name: 'Quantum Age', sky: 0xcbb8ff, sun: 0xfff0ff, sunI: 0.95, pal: { wall: 0x3a2a5a, roof: 0xb060ff, trim: 0xe6c7ff, beam: 0x22183a, flag: 0xb060ff } },
  { name: 'Stellar Age', sky: 0x7a86c8, sun: 0xfff4d6, sunI: 1.0, pal: { wall: 0xf6f1ff, roof: 0xffd36b, trim: 0xffffff, beam: 0x3a3f66, flag: 0xffd36b } }
];
const AGE_COST = [null,
  { wood: 150, food: 120 },
  { wood: 260, stone: 200, food: 180, gold: 60 },
  { wood: 320, stone: 380, food: 300, gold: 260 },
  { wood: 420, stone: 540, food: 420, gold: 440 },
  { wood: 540, stone: 720, food: 560, gold: 720 },
  { wood: 600, stone: 900, food: 700, gold: 1000 },
  { wood: 700, stone: 1100, food: 900, gold: 1400 },
  { wood: 800, stone: 1400, food: 1100, gold: 1900, alloy: 250 },
  { wood: 900, stone: 1700, food: 1300, gold: 2500, alloy: 450 },
  { wood: 1000, stone: 2000, food: 1600, gold: 3200, alloy: 700 },
  { wood: 1200, stone: 2400, food: 2000, gold: 4000, alloy: 900, anti: 200 }];

const DIFF = {
  gentle: { name: 'Gentle', first: 150, gapHi: 100, gapLo: 60, count: 0.65, mult: 0.8, blurb: 'Fewer, weaker raiders and long breaks between raids. Good for learning the valley.' },
  normal: { name: 'Normal', first: 120, gapHi: 74, gapLo: 48, count: 0.85, mult: 0.95, blurb: 'A fair fight. Raids come about every minute and grow steadily.' },
  hard:   { name: 'Hard', first: 90, gapHi: 64, gapLo: 40, count: 1.0, mult: 1.0, blurb: 'The original pace: fast raids, full packs, a boss every fifth raid.' }
};
const WALL_COST = [{ wood: 6 }, { stone: 8 }, { stone: 10 }, { stone: 12 }, { stone: 14, gold: 2 }, { stone: 16, gold: 4 }, { stone: 18, gold: 6 }, { stone: 20, gold: 8 }, { stone: 22, gold: 10 }, { stone: 24, gold: 12 }, { stone: 26, gold: 14 }, { stone: 28, gold: 16 }];
const WALL_HP = [110, 340, 520, 760, 1050, 1400, 1850, 2400, 3000, 3800, 4800, 6000];
// drag-to-paint buildings: walls and plantings
const BDEF = {
  house:    { name: 'Burrow House', cat: 'town', size: 1, age: 0, cost: { wood: 20 }, hp: 90, time: 3, pop: 3, r: 0.8, blurb: 'Shelter for 3 animals.', role: 'Housing', what: 'Burrows where your animals sleep. Every house raises the population cap by 3.', help: 'More animals means more settlers gathering and more defenders. New settlers only arrive while there is room, and soldiers count against the cap too.', tip: 'If the pop counter is full (say 8/8), nobody new will join. Build houses before you need them.' },
  farm:     { name: 'Berry Farm', cat: 'town', size: 1, age: 0, cost: { wood: 30 }, hp: 70, time: 4, r: 0.8, drop: ['food'], income: { food: 0.55 }, blurb: 'Grows food. Berries are dropped off here.', role: 'Food', what: 'A berry patch tended automatically.', help: 'Makes 0.55 food a second on its own, and settlers drop berries off here. Food feeds new settlers (25 each) and trains soldiers.', tip: 'Build beside berry bushes or close to the Hall to keep carry trips short.' },
  camp:     { name: 'Lumber Camp', cat: 'town', size: 1, age: 0, cost: { wood: 35 }, hp: 90, time: 3, r: 0.8, drop: ['wood'], blurb: 'Wood drop-off. Build beside a forest.', role: 'Wood drop-off', what: 'A stockpile where choppers unload their logs.', help: 'Settlers carry 8 wood a trip, so a long walk wastes most of their day. A camp beside a forest cuts the walk, and drop-offs here pay +25% over the Great Hall.', tip: 'Place it on the edge of a forest, not in the middle of your town.' },
  sapling:  { name: 'Plant Saplings', cat: 'town', size: 1, age: 0, get cost() { return { food: Math.max(4, 12 - 4 * ((G.tech && G.tech.forestry) || 0)) }; }, hp: 20, time: 6, r: 0.5, plant: 'wood', blurb: 'Grows a new tree where you place it.', role: 'Forestry', what: 'Settlers plant a sapling that grows into a full tree.', help: 'Once planted it becomes a tree worth 30 wood, and nearby saplings grow into a grove. Drag to plant a row. The way to bring a forest back next to your Lumber Camp.', tip: 'Plant right beside the camp so every trip is short.' },
  berrybed: { name: 'Berry Bed', cat: 'town', size: 1, age: 0, cost: { wood: 10, food: 6 }, hp: 20, time: 5, r: 0.5, plant: 'food', blurb: 'Grows a new berry bush.', role: 'Forestry', what: 'A bed of seedlings that becomes a berry bush.', help: 'Becomes a bush worth 24 berries once planted. Drag to plant a patch near a Berry Farm.', tip: 'Bushes do not need tending: settlers pick them like any other bush.' },
  quarry:   { name: 'Quarry', cat: 'town', size: 1, age: 1, cost: { wood: 50 }, hp: 120, time: 5, r: 0.8, drop: ['stone', 'gold'], income: { stone: 0.12 }, blurb: 'Stone and gold drop-off. Build beside rocks.', role: 'Stone and gold drop-off', what: 'A stone yard where miners unload rock and gold.', help: 'Stone builds walls, towers and new ages. Like the camp, it pays +25% on everything dropped here and saves long trips, and its quarrymen dig 0.12 stone a second on their own even when the rocks are gone.', tip: 'Put it next to grey rocks or gold veins.' },
  market:   { name: 'Market', cat: 'town', size: 1, age: 1, cost: { wood: 70, stone: 20 }, hp: 120, time: 5, r: 0.8, income: { gold: 0.45 }, blurb: 'Trades goods for a trickle of gold.', role: 'Gold income', what: 'Traders pay a steady stream of gold.', help: 'Earns 0.45 gold a second with no workers needed. Gold trains Guards, Knights and Musketeers, upgrades weapons and buys new ages.', tip: 'Several markets fund a much bigger army. They are safest inside your walls.' },
  barracks: { name: 'Barracks', cat: 'army', size: 2, age: 0, cost: { wood: 80, stone: 10 }, hp: 260, time: 7, r: 1.4, blurb: 'Trains defenders. Needed for the units below.', role: 'Training', what: 'Where defenders are trained. Open the Army tab and pick a unit.', help: 'Without one you cannot train soldiers. Defenders gather on the side raiders are coming from, fight them, and level up from kills. Select them and right-click to give orders.', tip: 'Build it near the Hall. Soldiers also count against housing.' },
  smith:    { name: 'Blacksmith', cat: 'army', size: 1, age: 2, cost: { wood: 60, stone: 60 }, hp: 160, time: 6, r: 0.8, blurb: 'Sharpens every weapon in the valley.', role: 'Weapon upgrades', what: 'A forge that sharpens every weapon in the valley.', help: 'Unlocks the Sharpen Weapons upgrade in the Army tab: +20% damage per level for every defender and tower, up to three levels.', tip: 'Worth it before the boss raids at 5, 10 and 15.' },
  wall:     { name: 'Wall', cat: 'defense', size: 1, age: 0, wall: true, r: 0.6, time: 1.6, get cost() { return WALL_COST[Math.min(G.age, WALL_COST.length - 1)]; }, get hp() { return WALL_HP[Math.min(G.age, WALL_HP.length - 1)]; }, blurb: 'Drag to draw a line. Upgrades itself as you advance.', role: 'Wall', what: 'A line of defence that grows with your clan: wooden stakes in the Hamlet, stone from the Medieval Town, battlements in the Castle Age, reinforced stone with the Gunpowder Age, marble in the Imperial Age, iron-bound in the Clockwork Age and a glowing barrier in the Skyward Age.', help: 'Raiders must chew through it or walk around. Your own animals walk straight through. Every time you advance an age, every wall you have already built is rebuilt stronger for free, keeping its damage. It funnels raiders to where your towers and archers can reach them.', tip: 'Drag to draw a line. A gap in front of your towers makes a kill zone. New walls cost more stone as the ages go on.' },
  tower:    { name: 'Watchtower', cat: 'defense', size: 1, age: 0, cost: { wood: 45, stone: 5 }, hp: 240, time: 5, r: 0.8, range: 7, dmg: 8, rate: 1.1, shot: 'arrow', blurb: 'A fox archer keeps watch.', role: 'Ranged defense', what: 'A fox archer keeps watch from the top.', help: 'Shoots raiders within 7 tiles with no housing or food cost. Damage grows with each age and weapon upgrade.', tip: 'Place a few just behind your walls so raiders stall in range.' },
  ballista: { name: 'Ballista Tower', cat: 'defense', size: 1, age: 2, cost: { wood: 70, stone: 70 }, hp: 360, time: 7, r: 0.8, range: 9.5, dmg: 36, rate: 2.1, shot: 'bolt', blurb: 'Heavy bolts at long range.', role: 'Heavy ranged defense', what: 'A crossbow turret with a long reach.', help: 'Fires heavy bolts out to 9.5 tiles for 36 damage each. Slow, but great against boars, badger rams and the Warlord.', tip: 'Pair with cheaper watchtowers to cover the gaps while it reloads.' },
  cannon:   { name: 'Cannon Tower', cat: 'defense', size: 1, age: 3, cost: { stone: 90, gold: 70 }, hp: 460, time: 8, r: 0.8, range: 8.5, dmg: 58, rate: 3, splash: 1.7, shot: 'ball', blurb: 'Explosive damage in an area.', role: 'Area defense', what: 'A gunpowder cannon that blasts whole packs.', help: 'Cannonballs explode for 58 damage in a wide splash, so raiders bunched at your wall take it all at once.', tip: 'Best right behind a wall where raiders pile up.' },
  bombard:  { name: 'Bombard Tower', cat: 'defense', size: 1, age: 4, cost: { stone: 170, gold: 150 }, hp: 640, time: 9, r: 0.8, range: 11, dmg: 115, rate: 4.2, splash: 2.4, shot: 'ball', blurb: 'A huge mortar for the biggest packs.', role: 'Siege defense', what: 'A great bronze bombard on a marble base.', help: 'Lobs a massive shell out to 11 tiles for 115 area damage. Slow to reload, but a direct hit on a bunched raid is devastating, and it is the answer to trolls.', tip: 'Place it centrally: its reach covers most of the town.' },
  turret:   { name: 'Clockwork Turret', cat: 'defense', size: 1, age: 5, cost: { stone: 120, gold: 230 }, hp: 540, time: 8, r: 0.8, range: 8, dmg: 26, rate: 0.42, shot: 'bullet', blurb: 'Rapid-fire brass gun.', role: 'Rapid defense', what: 'A brass turret that fires without pause.', help: 'A shot every 0.4 seconds out to 8 tiles. Shreds dire wolves and anything fast, and never runs out of ammunition.', tip: 'Pair it with a Bombard: the turret handles the fast ones while the bombard breaks the big ones.' },
  skyscraper: { name: 'Skyscraper', cat: 'town', size: 2, age: 6, cost: { stone: 220, gold: 160 }, hp: 900, time: 12, pop: 12, r: 1.4, blurb: 'A tower of homes: houses 12.', role: 'Housing', what: 'A glass-and-composite tower that reaches for the clouds.', help: 'Houses 12 animals on a 2x2 footprint, four times a Burrow House on a quarter of the land. Its windows light up at night.', tip: 'Replace clusters of old houses with one tower to free space inside the walls.' },
  laser:    { name: 'Laser Tower', cat: 'defense', size: 1, age: 6, cost: { stone: 150, gold: 320 }, hp: 700, time: 9, r: 0.8, range: 10, dmg: 34, rate: 0.6, shot: 'laser', blurb: 'A beam that never misses.', role: 'Beam defense', what: 'A slender pylon with a focusing lens.', help: 'Fires a beam every 0.6 seconds out to 10 tiles for 34 damage. Fast, long and accurate: the all-round defense of the Skyward Age.', tip: 'A ring of lasers around the walls makes the valley very hard to approach.' },
  skyport:  { name: 'Sky Port', cat: 'army', size: 2, age: 6, cost: { stone: 200, gold: 300 }, hp: 700, time: 12, r: 1.4, blurb: 'Launch pad for Sky Skiffs.', role: 'Flight', what: 'A landing pad with a maintenance drone.', help: 'Needed to train Sky Skiffs, the flying defenders that ignore walls, water and crowds. Skiffs launch from here.', tip: 'Build it inside the walls; skiffs can fly out over them.' },
  reactor:  { name: 'Fusion Reactor', cat: 'town', size: 2, age: 7, cost: { stone: 500, gold: 500 }, hp: 1200, time: 14, r: 1.4, income: { gold: 0.6, stone: 0.3, food: 0.4, alloy: 0.2 }, blurb: 'Power, and the first Alloy.', role: 'Power', what: 'A containment dome with a star inside.', help: 'Produces 0.6 gold, 0.3 stone, 0.4 food and 0.2 Alloy a second with no workers. Alloy is the new resource of the late ages: ages, buildings, units and research from here on need it. Research Fusion Lattice to boost every income further.', tip: 'Two reactors replace a whole mining economy.' },
  refinery: { name: 'Alloy Refinery', cat: 'town', size: 1, age: 7, cost: { stone: 300, gold: 250 }, hp: 800, time: 10, r: 0.8, convert: { from: { stone: 0.3, gold: 0.1 }, to: { alloy: 0.3 } }, blurb: 'Turns stone and gold into Alloy.', role: 'Refining', what: 'Furnaces that fuse stone and gold into alloy.', help: 'Consumes 0.3 stone and 0.1 gold a second to make 0.3 Alloy, as long as you have the stone and gold. Several refineries scale this up.', tip: 'Deep Quarrying and Trade Routes feed it.' },
  collider: { name: 'Collider', cat: 'town', size: 2, age: 10, cost: { stone: 500, gold: 600, alloy: 300 }, hp: 1100, time: 14, r: 1.4, convert: { from: { alloy: 0.4, gold: 0.2 }, to: { anti: 0.15 } }, blurb: 'Makes Antimatter from Alloy and gold.', role: 'Physics', what: 'A ring that smashes alloy into antimatter.', help: 'Consumes 0.4 Alloy and 0.2 gold a second to make 0.15 Antimatter, the rarest resource. Quantum and Stellar wonders need it.', tip: 'Build two; the Stellar Age is hungry.' },
  orbital:  { name: 'Orbital Beacon', cat: 'defense', size: 1, age: 8, cost: { stone: 400, gold: 700, alloy: 150 }, hp: 900, time: 12, r: 0.8, range: 14, dmg: 240, rate: 7, splash: 3.2, shot: 'orbital', blurb: 'Calls down strikes from orbit.', role: 'Orbital strike', what: 'A targeting dish that talks to the satellites.', help: 'Every 7 seconds a strike lands for 240 damage in a 3.2 tile blast, out to 14 tiles. Nothing on the ground survives many of them.', tip: 'One in the middle of town reaches everything.' },
  nanoforge: { name: 'Nanoforge', cat: 'town', size: 1, age: 9, cost: { stone: 450, gold: 800, alloy: 200 }, hp: 1000, time: 12, r: 0.8, heal: 8, mend: 0.012, blurb: 'Heals animals and mends buildings nearby.', role: 'Nanite aura', what: 'A hive of nanites that rebuild anything in reach.', help: 'Animals within 8 tiles heal 6 hp a second and every building within 8 tiles repairs 1.2% a second, raid or no raid.', tip: 'Walls next to a Nanoforge are nearly impossible to breach.' },
  quantum:  { name: 'Quantum Spire', cat: 'defense', size: 1, age: 10, cost: { stone: 500, gold: 1100, alloy: 250, anti: 60 }, hp: 1100, time: 12, r: 0.8, range: 12, dmg: 90, rate: 0.5, chain: 3, shot: 'quantum', blurb: 'Entangled bolts hit three raiders at once.', role: 'Chain defense', what: 'A spire that fires entangled bolts.', help: 'Every half second it hits up to three raiders within 12 tiles for 90 each.', tip: 'Shreds packs; pair with an Orbital Beacon for bosses.' },
  starbeacon: { name: 'Star Beacon', cat: 'army', size: 2, age: 11, cost: { stone: 600, gold: 1500, alloy: 300, anti: 150 }, hp: 1400, time: 16, r: 1.4, blurb: 'Builds free drone fighters.', role: 'Drone works', what: 'A beacon that assembles fighter drones from starlight.', help: 'Every 40 seconds a free Fighter Drone launches from it, up to 4 per beacon. Drones fly, need no housing and are rebuilt when lost.', tip: 'Several beacons give you an air force that never runs dry.' },
  infirmary: { name: 'Healing Hut', cat: 'town', size: 1, age: 0, cost: { wood: 55, stone: 10 }, hp: 130, time: 5, r: 0.8, heal: 5, blurb: 'Heals animals and buildings nearby.', role: 'Healing', what: 'A cosy hut with a panda healer inside.', help: 'Animals within 5 tiles heal 3 hp a second and nearby buildings are mended too. Keeps your front line alive between raids.', tip: 'Put it just behind your walls where wounded defenders gather.' },
  keep:     { name: 'Great Hall', cat: 'none', size: 3, age: 0, cost: {}, hp: 1200, time: 1, r: 2.1, drop: ['wood', 'stone', 'food', 'gold'], pop: 5, blurb: 'The heart of the clan.', role: 'Heart of the clan', what: 'Your Great Hall. If it falls, the game is lost.', help: 'Settlers drop all resources off here and new ones arrive from it. It houses 5 animals and heals those standing close. It grows tougher with each age.', tip: 'Defend it above all else. Nothing else is as hard to replace.' }
};
const UDEF = {
  worker: { name: 'Settler', hp: 30, speed: 2.1, scale: 0.9, role: 'Settler', what: 'A hard-working villager.', help: 'Gathers wood, stone, berries and gold, builds what you place, and mends damaged buildings when idle. Gains levels by working: they carry more and work faster.', tip: 'Select one and right-click a tree, rock, building site or damaged building to send them.' },
  archer: { name: 'Fox Archer', sp: 'fox', hp: 34, speed: 2.3, dmg: 6, rate: 1.0, range: 5.5, cost: { food: 30, wood: 25 }, age: 0, shot: 'arrow', blurb: 'Fast and ranged.', role: 'Ranged defender', what: 'A quick fox with a bow.', help: 'Hits from 5.5 tiles away, so keep archers behind guards. At level 3 learns Volley, hitting several raiders at once.', tip: 'Cheap and needs no gold.' },
  guard:  { name: 'Panda Guard', sp: 'panda', hp: 110, speed: 1.8, dmg: 10, rate: 1.0, range: 1.1, cost: { food: 40, gold: 15 }, age: 0, blurb: 'Tough front line.', role: 'Front line', what: 'A sturdy panda with a heavy staff.', help: 'Soaks up damage so archers can shoot in peace. At level 3 learns Bamboo Guard: halves damage taken and draws raiders to it.', tip: 'Put them at the wall gap.' },
  knight: { name: 'Bear Knight', sp: 'bear', hp: 240, speed: 1.9, dmg: 22, rate: 1.1, range: 1.3, cost: { food: 70, gold: 55 }, age: 2, blurb: 'Armoured heavy hitter.', role: 'Heavy hitter', what: 'An armoured bear that hits hard.', help: 'High health and strong attacks, ideal against badger rams and the Warlord. At level 3 learns Cleave, a spinning area strike.', tip: 'Unlocks in the Castle Age.' },
  lancer: { name: 'Elk Lancer', sp: 'elk', hp: 200, speed: 2.6, dmg: 30, rate: 1.0, range: 1.4, cost: { food: 90, gold: 85 }, age: 4, blurb: 'Fast, hard-hitting cavalry.', role: 'Shock cavalry', what: 'A tall elk with a steel lance.', help: 'Quick and strong, perfect for chasing down raccoon slingers and dire wolves. At level 3 learns Stampede: a charge that knocks back every raider in its path.', tip: 'Unlocks in the Imperial Age.' },
  sage:   { name: 'Owl Sage', sp: 'owl', hp: 80, speed: 2.3, dmg: 44, rate: 1.6, range: 7.5, cost: { food: 80, gold: 140 }, age: 5, shot: 'bolt', blurb: 'Long-range bolts and a healing song.', role: 'Support caster', what: 'A wise owl with a brass staff.', help: 'Fires bolts from 7.5 tiles. At level 3 learns Hoot of Courage: every defender within 4 tiles heals 30% of its health.', tip: 'Unlocks in the Clockwork Age. Keep it behind the line.' },
  skiff:  { name: 'Sky Skiff', sp: 'fox', hp: 160, speed: 3.3, dmg: 30, rate: 0.9, range: 6.5, cost: { food: 100, gold: 230 }, age: 6, shot: 'laser', fly: true, blurb: 'A flying fox gunship.', role: 'Flying defender', what: 'A fox pilot in a hovering skiff.', help: 'Flies straight over walls, water and crowds, so it is always where you need it. Beam weapon with 6.5 tiles of reach. At level 3 learns Strafing Run: a beam sweep that hits every raider within 5 tiles.', tip: 'Needs a Sky Port. Unlocks in the Skyward Age.' },
  mech:   { name: 'Panda Mech', sp: 'panda', hp: 460, speed: 1.9, dmg: 64, rate: 1.1, range: 1.6, cost: { food: 160, gold: 320, alloy: 40 }, age: 7, blurb: 'A walking fortress.', role: 'Heavy mech', what: 'A panda in a fusion-powered walker.', help: 'Enormous health and crushing blows. At level 3 learns Shockwave: stamps the ground, hitting every raider within 2.5 tiles for 2x and shoving them back.', tip: 'Unlocks in the Fusion Age.' },
  dropship: { name: 'Bear Dropship', sp: 'bear', hp: 340, speed: 2.8, dmg: 44, rate: 0.8, range: 7, cost: { food: 180, gold: 420, alloy: 60 }, age: 8, shot: 'laser', fly: true, blurb: 'A flying gun platform.', role: 'Flying gunship', what: 'A bear pilot in an armoured dropship.', help: 'Flies, shrugs off hits and rakes raiders with beams from 7 tiles. At level 3 learns Payload: drops a bomb for 3x damage in a 3 tile blast.', tip: 'Unlocks in the Orbital Age.' },
  swarm:  { name: 'Nano Swarm', sp: 'rabbit', hp: 140, speed: 3.4, dmg: 11, rate: 0.18, range: 4.5, cost: { food: 150, gold: 380, alloy: 80 }, age: 9, shot: 'laser', fly: true, blurb: 'A cloud of tiny fliers.', role: 'Flying shredder', what: 'A rabbit herding a swarm of nanites.', help: 'Flies and fires five times a second. Shreds anything fast or fragile. At level 3 learns Disassemble: a burst of 8 shots at once.', tip: 'Unlocks in the Nanotech Age.' },
  warden: { name: 'Quantum Warden', sp: 'owl', hp: 300, speed: 3.0, dmg: 85, rate: 1.0, range: 9, cost: { food: 220, gold: 600, alloy: 100, anti: 20 }, age: 10, shot: 'quantum', fly: true, blurb: 'Blinks across the battlefield.', role: 'Flying striker', what: 'An owl that is never quite where you last saw it.', help: 'Flies with entangled bolts from 9 tiles. At level 3 learns Phase Shift: blinks next to the nearest raider and heals 25%.', tip: 'Unlocks in the Quantum Age.' },
  starship: { name: 'Fox Starship', sp: 'fox', hp: 700, speed: 2.6, dmg: 140, rate: 1.2, range: 10.5, cost: { food: 260, gold: 900, alloy: 200, anti: 60 }, age: 11, shot: 'orbital', fly: true, blurb: 'The pride of the fleet.', role: 'Flying capital ship', what: 'A fox captain on the bridge of a starship.', help: 'Flies, hits like an orbital strike from 10.5 tiles and takes a raid to bring down. At level 3 learns Nova: hits everything within 6 tiles for 2x.', tip: 'Unlocks in the Stellar Age.' },
  drone:  { name: 'Fighter Drone', sp: 'fox', hp: 120, speed: 3.6, dmg: 30, rate: 0.6, range: 6, cost: {}, age: 11, shot: 'laser', fly: true, free: true, blurb: 'A free drone from the Star Beacon.', role: 'Drone fighter', what: 'An autonomous fighter the Star Beacon builds.', help: 'Launched free from a Star Beacon every 40 seconds, up to 4 per beacon. Needs no housing.', tip: 'Build beacons, not barracks, in the Stellar Age.' },
  musket: { name: 'Rabbit Musketeer', sp: 'rabbit', hp: 44, speed: 2.2, dmg: 24, rate: 1.9, range: 7, cost: { food: 45, gold: 60 }, age: 3, shot: 'bullet', blurb: 'Powder and long range.', role: 'Long-range damage', what: 'A rabbit with a flintlock.', help: 'Slow but powerful shots from 7 tiles. At level 3 learns Aimed Shot: one huge hit.', tip: 'Unlocks in the Gunpowder Age.' }
};
const EDEF = {
  wolf:    { name: 'Wolf', sp: 'wolf', hp: 30, speed: 2.7, dmg: 5, rate: 0.9, range: 1.0, bounty: 3, scale: 1 },
  boar:    { name: 'Boar', sp: 'boar', hp: 90, speed: 1.7, dmg: 10, rate: 1.2, range: 1.0, bounty: 6, scale: 1 },
  raccoon: { name: 'Raccoon Slinger', sp: 'raccoon', hp: 34, speed: 2.2, dmg: 6, rate: 1.3, range: 4.2, bounty: 5, shot: 'stone', scale: 1 },
  badger:  { name: 'Badger Ram', sp: 'badger', hp: 170, speed: 1.3, dmg: 26, rate: 1.4, range: 1.1, bounty: 12, siege: true, scale: 1.1 },
  direwolf: { name: 'Dire Wolf', sp: 'wolf', hp: 150, speed: 2.9, dmg: 15, rate: 0.8, range: 1.1, bounty: 14, scale: 1.35 },
  troll:   { name: 'Troll', sp: 'troll', hp: 1500, speed: 1.1, dmg: 62, rate: 1.9, range: 1.5, bounty: 120, siege: true, scale: 2.1 },
  drake:   { name: 'Drake', sp: 'drake', hp: 420, speed: 2.6, dmg: 36, rate: 1.0, range: 1.3, bounty: 40, scale: 1.4, fly: true },
  juggernaut: { name: 'Juggernaut', sp: 'troll', hp: 4200, speed: 1.0, dmg: 115, rate: 2.0, range: 1.6, bounty: 260, siege: true, scale: 2.7 },
  chief:   { name: 'Bear Warlord', sp: 'warbear', hp: 700, speed: 1.5, dmg: 30, rate: 1.3, range: 1.6, bounty: 90, scale: 1.7 }
};
/* Research tree. Each entry: id, name, age gate, building needed (or null), max level, cost per level, group, text.
   Effects are read where they apply through G.tech[id] (see techLevel / helpers in the sim). */
const TECHS = [
  // economy
  { id: 'farm', name: 'Crop Rotation', group: 'Economy', age: 1, need: null, max: 3, cost: [{ wood: 60, food: 60 }, { wood: 120, food: 140, gold: 40 }, { wood: 200, food: 240, gold: 120 }], role: 'Farming', what: 'Better planting means bigger harvests.', help: 'Each level makes every Berry Farm produce +25% more food, all year round, and farm tending gets the same bonus.', tip: 'Cheap, and it pays off quickly with several farms.' },
  { id: 'tools', name: 'Sturdy Tools', group: 'Economy', age: 1, need: null, max: 3, cost: [{ wood: 70, stone: 30 }, { wood: 140, stone: 90, gold: 40 }, { wood: 220, stone: 160, gold: 120 }], role: 'Gathering', what: 'Better axes, picks and baskets for every settler.', help: 'Each level lets settlers carry 2 more per trip, so fewer walks back to the drop-off.', tip: 'Best when your drop-offs are a long way from the trees.' },
  { id: 'carts', name: 'Hand Carts', group: 'Economy', age: 1, need: null, max: 2, cost: [{ wood: 90, food: 40 }, { wood: 180, stone: 60, gold: 60 }], role: 'Logistics', what: 'Little carts so settlers hurry between jobs.', help: 'Settlers walk 10% faster per level. Applies to every settler at once.', tip: 'Stacks nicely with Sturdy Tools on a big map.' },
  { id: 'forestry', name: 'Forestry', group: 'Economy', age: 1, need: 'camp', max: 2, cost: [{ wood: 80, food: 50 }, { wood: 160, food: 120, gold: 50 }], role: 'Forestry', what: 'Woodsmen tend the forest as they cut it.', help: 'Trees regrow 60% faster per level and Plant Saplings costs 4 food less per level.', tip: 'Turns a Lumber Camp into a permanent wood supply.' },
  { id: 'quarrying', name: 'Deep Quarrying', group: 'Economy', age: 1, need: 'quarry', max: 3, cost: [{ wood: 80, stone: 40 }, { wood: 120, stone: 120, gold: 60 }, { stone: 240, gold: 160 }], role: 'Mining', what: 'Shafts sunk below the rock.', help: 'Every Quarry digs +0.12 stone a second more per level, and the hills shed more boulders.', tip: 'The long-term answer to stone for late ages.' },
  { id: 'trade', name: 'Trade Routes', group: 'Economy', age: 2, need: 'market', max: 3, cost: [{ wood: 120, gold: 60 }, { wood: 200, stone: 80, gold: 160 }, { stone: 160, gold: 320 }], role: 'Commerce', what: 'Caravans link your markets to far valleys.', help: 'Every Market earns +0.2 gold a second more per level.', tip: 'Three markets with full trade routes fund an army by themselves.' },
  { id: 'housing', name: 'Attic Rooms', group: 'Economy', age: 1, need: null, max: 2, cost: [{ wood: 100, stone: 20 }, { wood: 200, stone: 80, gold: 50 }], role: 'Housing', what: 'Extra rooms under every roof.', help: 'Every Burrow House holds 1 more animal per level, and Skyscrapers 3 more.', tip: 'Cheaper than more houses once you have a dozen.' },
  { id: 'medicine', name: 'Herbal Medicine', group: 'Economy', age: 1, need: 'infirmary', max: 2, cost: [{ wood: 60, food: 80 }, { food: 160, gold: 90 }], role: 'Healing', what: 'Poultices and tonics for the wounded.', help: 'All healing is 40% faster per level: the Hall, Healing Huts and natural recovery.', tip: 'Veterans are worth keeping alive; this keeps them alive.' },
  { id: 'automata', name: 'Automatons', group: 'Economy', age: 5, need: 'smith', max: 1, cost: [{ stone: 300, gold: 400 }], role: 'Industry', what: 'Clockwork helpers in every workshop.', help: 'Farms, Markets and Quarries produce 30% more on their own.', tip: 'One purchase, everything ticks faster.' },
  // military
  { id: 'armor', name: 'Tempered Armor', group: 'Military', age: 2, need: 'smith', max: 3, cost: [{ wood: 40, stone: 60, gold: 60 }, { stone: 120, gold: 130 }, { stone: 200, gold: 250 }], role: 'Armor', what: 'Smiths forge sturdier armor for the whole clan.', help: 'Each level adds +15% health to every defender, including the ones you already have.', tip: 'Pairs well with Sharpen Weapons.' },
  { id: 'drill', name: 'Drill Yard', group: 'Military', age: 1, need: 'barracks', max: 2, cost: [{ wood: 80, food: 60 }, { wood: 160, food: 120, gold: 60 }], role: 'Training', what: 'Daily drills on the parade ground.', help: 'Defenders move 8% faster per level and reach the fight sooner.', tip: 'Great for guards, who are slow.' },
  { id: 'fletching', name: 'Fletching', group: 'Military', age: 1, need: 'barracks', max: 2, cost: [{ wood: 90, food: 40 }, { wood: 160, stone: 40, gold: 70 }], role: 'Ranged', what: 'Straighter arrows and better sights.', help: 'Every ranged defender (archers, musketeers, sages, skiffs) reaches 0.5 tiles further per level.', tip: 'Lets archers shoot over a wall from further back.' },
  { id: 'veterans', name: 'Veteran Training', group: 'Military', age: 2, need: 'barracks', max: 2, cost: [{ food: 120, gold: 90 }, { food: 220, gold: 220 }], role: 'Experience', what: 'Old hands teach the recruits.', help: 'Level 1: new defenders start at level 2. Level 2: all defenders gain 50% more experience.', tip: 'Gets you to level 3 abilities and level 5 promotions much sooner.' },
  { id: 'banners', name: 'War Banners', group: 'Military', age: 3, need: 'barracks', max: 2, cost: [{ wood: 100, gold: 150 }, { stone: 150, gold: 300 }], role: 'Abilities', what: 'Banners that rally the clan.', help: 'Every ability recharges 15% faster per level.', tip: 'Volley and Cleave every few seconds change a boss fight.' },
  { id: 'aero', name: 'Aeronautics', group: 'Military', age: 6, need: 'skyport', max: 2, cost: [{ stone: 200, gold: 300 }, { stone: 300, gold: 500 }], role: 'Flight', what: 'Lighter hulls and hotter thrusters.', help: 'Sky Skiffs get +20% health and speed per level.', tip: 'Skiffs are already the fastest thing in the valley.' },
  // defense
  { id: 'walls', name: 'Reinforced Walls', group: 'Defense', age: 1, need: null, max: 3, cost: [{ wood: 60, stone: 60 }, { stone: 160, gold: 40 }, { stone: 300, gold: 120 }], role: 'Walls', what: 'Thicker courses and braced posts.', help: 'Every wall has +25% health per level, existing walls included.', tip: 'Walls buy time; this buys more of it.' },
  { id: 'siegecraft', name: 'Siegecraft', group: 'Defense', age: 2, need: 'smith', max: 3, cost: [{ wood: 80, stone: 80, gold: 40 }, { stone: 160, gold: 140 }, { stone: 260, gold: 280 }], role: 'Towers', what: 'Heavier bolts, better powder, truer barrels.', help: 'Every tower deals +15% damage per level, on top of Sharpen Weapons.', tip: 'Your towers never sleep, so this is always working.' },
  { id: 'watchfires', name: 'Watchfires', group: 'Defense', age: 1, need: null, max: 2, cost: [{ wood: 70, stone: 20 }, { wood: 120, stone: 80, gold: 40 }], role: 'Towers', what: 'Braziers on every tower top.', help: 'Every tower sees and shoots 0.5 tiles further per level.', tip: 'Half a tile is a whole extra row of raiders under fire.' },
  { id: 'repair', name: 'Rapid Repair', group: 'Defense', age: 2, need: null, max: 2, cost: [{ wood: 100, stone: 50 }, { wood: 160, stone: 120, gold: 60 }], role: 'Repair', help: 'Settlers repair buildings twice as fast per level, and at level 2 they keep repairing during a raid.', what: 'Timber frames stacked and ready.', tip: 'Walls that heal between waves of the same raid.' },
  { id: 'masonry', name: 'Masonry', group: 'Defense', age: 2, need: 'quarry', max: 3, cost: [{ stone: 100, gold: 30 }, { stone: 200, gold: 100 }, { stone: 320, gold: 220 }], role: 'Buildings', what: 'Dressed stone for every building.', help: 'Every building other than walls has +15% health per level, including the Great Hall.', tip: 'Makes towers and the Hall survive a badger ram.' },
  { id: 'fusion', name: 'Fusion Lattice', group: 'Economy', age: 7, need: 'reactor', max: 2, cost: [{ stone: 400, gold: 600 }, { stone: 600, gold: 1000, alloy: 120 }], role: 'Power', what: 'Lattices that spread reactor power to every workshop.', help: 'Every income (farms, markets, quarries, reactors, tending) is +25% per level.', tip: 'The economy keystone of the late ages.' },
  { id: 'nano', name: 'Nanite Blood', group: 'Military', age: 9, need: 'nanoforge', max: 2, cost: [{ stone: 500, gold: 900, alloy: 150 }, { stone: 700, gold: 1400, alloy: 250 }], role: 'Regeneration', what: 'Nanites in every defender\'s veins.', help: 'Defenders regenerate 1% of their health a second per level, even in combat.', tip: 'Turns a long raid into a war of attrition you win.' },
  { id: 'quantumcore', name: 'Quantum Cores', group: 'Military', age: 10, need: 'quantum', max: 2, cost: [{ stone: 600, gold: 1200, anti: 40 }, { stone: 800, gold: 1800, anti: 80 }], role: 'Abilities', what: 'Cores that bend time for your defenders.', help: 'Ability cooldowns are another 15% shorter per level, on top of War Banners.', tip: 'With both maxed, abilities are almost always ready.' },
  { id: 'stellar', name: 'Stellar Forge', group: 'Military', age: 11, need: 'starbeacon', max: 3, cost: [{ stone: 700, gold: 1500, anti: 80 }, { stone: 900, gold: 2200, anti: 120 }, { stone: 1200, gold: 3000, anti: 180 }], role: 'Damage', what: 'Weapons forged in a captured star.', help: 'Every defender, tower and drone deals +15% damage per level.', tip: 'The last word in firepower.' },
  { id: 'targeting', name: 'Orbital Targeting', group: 'Defense', age: 8, need: 'orbital', max: 2, cost: [{ stone: 400, gold: 700 }, { stone: 600, gold: 1100, alloy: 100 }], role: 'Towers', what: 'Satellites that spot for every tower.', help: 'Every tower reaches 1 tile further per level, and Orbital Beacons strike 1 second sooner.', tip: 'Covers the whole town from a few pylons.' },
  { id: 'beacon', name: 'Beacon Network', group: 'Defense', age: 6, need: 'laser', max: 1, cost: [{ stone: 250, gold: 450 }], role: 'Lasers', what: 'Relay lenses between the pylons.', help: 'Laser Towers reach 2 tiles further and fire 20% faster.', tip: 'A ring of networked lasers covers the whole town.' }
];
const techCostAt = (t, lv) => t.cost[Math.min(lv, t.cost.length - 1)];

const PROMO_COST = { food: 40, gold: 45 };
const PROMO_LVL = 5;
const SMITH_COST = [{ gold: 80, stone: 40 }, { gold: 160, stone: 90 }, { gold: 300, stone: 150 }];

/* ===================== renderer, scene, light ===================== */
const stageEl = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias: true });
const COARSE = window.matchMedia && matchMedia('(pointer:coarse)').matches;
const QUALITY = { pr: 1, pixelBudget: COARSE ? 2.6e6 : 6.5e6, maxPr: COARSE ? 2 : 2.5, minPr: 0.75, ema: 16, adjustT: 0 };
function targetPixelRatio() {   // supersample on sharp desktops, but cap total pixels so phones keep a smooth frame rate
  const w = stageEl.clientWidth || window.innerWidth, h = stageEl.clientHeight || window.innerHeight, dpr = window.devicePixelRatio || 1;
  const want = COARSE ? dpr : Math.max(dpr, 1.75);
  return clamp(Math.min(want, Math.sqrt(QUALITY.pixelBudget / Math.max(1, w * h))), QUALITY.minPr, QUALITY.maxPr);
}
QUALITY.pr = targetPixelRatio();
renderer.setPixelRatio(QUALITY.pr);
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
sun.shadow.mapSize.set(COARSE ? 2048 : 4096, COARSE ? 2048 : 4096);
Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 140 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
scene.add(hemi, sun, sun.target);

function resize() {
  const w = stageEl.clientWidth || window.innerWidth, h = stageEl.clientHeight || window.innerHeight;
  QUALITY.pr = Math.min(QUALITY.pr, targetPixelRatio()); renderer.setPixelRatio(QUALITY.pr);
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
  n.amt = 0;   // anyone walking to it lets go
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
