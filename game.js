const GAME_VERSION = '2.0.0', GAME_BUILD = 'fe67040';
'use strict';
/* ===================== Pawhold: constants and definitions ===================== */
const MAP = 88, KX = 44, KZ = 44, MARGIN = 3, TOTAL_WAVES = 25, RAID_DIST = 21;   // raiders muster about 21 tiles out, whatever the map size
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const RES = ['wood', 'stone', 'food', 'gold'];

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
  { wood: 800, stone: 1400, food: 1100, gold: 1900 },
  { wood: 900, stone: 1700, food: 1300, gold: 2500 },
  { wood: 1000, stone: 2000, food: 1600, gold: 3200 },
  { wood: 1200, stone: 2400, food: 2000, gold: 4000 }];

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
  reactor:  { name: 'Fusion Reactor', cat: 'town', size: 2, age: 7, cost: { stone: 500, gold: 500 }, hp: 1200, time: 14, r: 1.4, income: { gold: 0.6, stone: 0.3, food: 0.4 }, blurb: 'Limitless power: gold, stone and food on its own.', role: 'Power', what: 'A containment dome with a star inside.', help: 'Produces 0.6 gold, 0.3 stone and 0.4 food a second with no workers. Research Fusion Lattice to boost every income further.', tip: 'Two reactors replace a whole mining economy.' },
  orbital:  { name: 'Orbital Beacon', cat: 'defense', size: 1, age: 8, cost: { stone: 400, gold: 700 }, hp: 900, time: 12, r: 0.8, range: 14, dmg: 240, rate: 7, splash: 3.2, shot: 'orbital', blurb: 'Calls down strikes from orbit.', role: 'Orbital strike', what: 'A targeting dish that talks to the satellites.', help: 'Every 7 seconds a strike lands for 240 damage in a 3.2 tile blast, out to 14 tiles. Nothing on the ground survives many of them.', tip: 'One in the middle of town reaches everything.' },
  nanoforge: { name: 'Nanoforge', cat: 'town', size: 1, age: 9, cost: { stone: 450, gold: 800 }, hp: 1000, time: 12, r: 0.8, heal: 8, mend: 0.012, blurb: 'Heals animals and mends buildings nearby.', role: 'Nanite aura', what: 'A hive of nanites that rebuild anything in reach.', help: 'Animals within 8 tiles heal 6 hp a second and every building within 8 tiles repairs 1.2% a second, raid or no raid.', tip: 'Walls next to a Nanoforge are nearly impossible to breach.' },
  quantum:  { name: 'Quantum Spire', cat: 'defense', size: 1, age: 10, cost: { stone: 500, gold: 1100 }, hp: 1100, time: 12, r: 0.8, range: 12, dmg: 90, rate: 0.5, chain: 3, shot: 'quantum', blurb: 'Entangled bolts hit three raiders at once.', role: 'Chain defense', what: 'A spire that fires entangled bolts.', help: 'Every half second it hits up to three raiders within 12 tiles for 90 each.', tip: 'Shreds packs; pair with an Orbital Beacon for bosses.' },
  starbeacon: { name: 'Star Beacon', cat: 'army', size: 2, age: 11, cost: { stone: 600, gold: 1500 }, hp: 1400, time: 16, r: 1.4, blurb: 'Builds free drone fighters.', role: 'Drone works', what: 'A beacon that assembles fighter drones from starlight.', help: 'Every 40 seconds a free Fighter Drone launches from it, up to 4 per beacon. Drones fly, need no housing and are rebuilt when lost.', tip: 'Several beacons give you an air force that never runs dry.' },
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
  mech:   { name: 'Panda Mech', sp: 'panda', hp: 460, speed: 1.9, dmg: 64, rate: 1.1, range: 1.6, cost: { food: 160, gold: 320 }, age: 7, blurb: 'A walking fortress.', role: 'Heavy mech', what: 'A panda in a fusion-powered walker.', help: 'Enormous health and crushing blows. At level 3 learns Shockwave: stamps the ground, hitting every raider within 2.5 tiles for 2x and shoving them back.', tip: 'Unlocks in the Fusion Age.' },
  dropship: { name: 'Bear Dropship', sp: 'bear', hp: 340, speed: 2.8, dmg: 44, rate: 0.8, range: 7, cost: { food: 180, gold: 420 }, age: 8, shot: 'laser', fly: true, blurb: 'A flying gun platform.', role: 'Flying gunship', what: 'A bear pilot in an armoured dropship.', help: 'Flies, shrugs off hits and rakes raiders with beams from 7 tiles. At level 3 learns Payload: drops a bomb for 3x damage in a 3 tile blast.', tip: 'Unlocks in the Orbital Age.' },
  swarm:  { name: 'Nano Swarm', sp: 'rabbit', hp: 140, speed: 3.4, dmg: 11, rate: 0.18, range: 4.5, cost: { food: 150, gold: 380 }, age: 9, shot: 'laser', fly: true, blurb: 'A cloud of tiny fliers.', role: 'Flying shredder', what: 'A rabbit herding a swarm of nanites.', help: 'Flies and fires five times a second. Shreds anything fast or fragile. At level 3 learns Disassemble: a burst of 8 shots at once.', tip: 'Unlocks in the Nanotech Age.' },
  warden: { name: 'Quantum Warden', sp: 'owl', hp: 300, speed: 3.0, dmg: 85, rate: 1.0, range: 9, cost: { food: 220, gold: 600 }, age: 10, shot: 'quantum', fly: true, blurb: 'Blinks across the battlefield.', role: 'Flying striker', what: 'An owl that is never quite where you last saw it.', help: 'Flies with entangled bolts from 9 tiles. At level 3 learns Phase Shift: blinks next to the nearest raider and heals 25%.', tip: 'Unlocks in the Quantum Age.' },
  starship: { name: 'Fox Starship', sp: 'fox', hp: 700, speed: 2.6, dmg: 140, rate: 1.2, range: 10.5, cost: { food: 260, gold: 900 }, age: 11, shot: 'orbital', fly: true, blurb: 'The pride of the fleet.', role: 'Flying capital ship', what: 'A fox captain on the bridge of a starship.', help: 'Flies, hits like an orbital strike from 10.5 tiles and takes a raid to bring down. At level 3 learns Nova: hits everything within 6 tiles for 2x.', tip: 'Unlocks in the Stellar Age.' },
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
  { id: 'fusion', name: 'Fusion Lattice', group: 'Economy', age: 7, need: 'reactor', max: 2, cost: [{ stone: 400, gold: 600 }, { stone: 600, gold: 1000 }], role: 'Power', what: 'Lattices that spread reactor power to every workshop.', help: 'Every income (farms, markets, quarries, reactors, tending) is +25% per level.', tip: 'The economy keystone of the late ages.' },
  { id: 'nano', name: 'Nanite Blood', group: 'Military', age: 9, need: 'nanoforge', max: 2, cost: [{ stone: 500, gold: 900 }, { stone: 700, gold: 1400 }], role: 'Regeneration', what: 'Nanites in every defender\'s veins.', help: 'Defenders regenerate 1% of their health a second per level, even in combat.', tip: 'Turns a long raid into a war of attrition you win.' },
  { id: 'quantumcore', name: 'Quantum Cores', group: 'Military', age: 10, need: 'quantum', max: 2, cost: [{ stone: 600, gold: 1200 }, { stone: 800, gold: 1800 }], role: 'Abilities', what: 'Cores that bend time for your defenders.', help: 'Ability cooldowns are another 15% shorter per level, on top of War Banners.', tip: 'With both maxed, abilities are almost always ready.' },
  { id: 'stellar', name: 'Stellar Forge', group: 'Military', age: 11, need: 'starbeacon', max: 3, cost: [{ stone: 700, gold: 1500 }, { stone: 900, gold: 2200 }, { stone: 1200, gold: 3000 }], role: 'Damage', what: 'Weapons forged in a captured star.', help: 'Every defender, tower and drone deals +15% damage per level.', tip: 'The last word in firepower.' },
  { id: 'targeting', name: 'Orbital Targeting', group: 'Defense', age: 8, need: 'orbital', max: 2, cost: [{ stone: 400, gold: 700 }, { stone: 600, gold: 1100 }], role: 'Towers', what: 'Satellites that spot for every tower.', help: 'Every tower reaches 1 tile further per level, and Orbital Beacons strike 1 second sooner.', tip: 'Covers the whole town from a few pylons.' },
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
  elk:     { bw: .34, bh: .34, bd: .62, ly: .3, hw: .28, body: 0x8a6a4a, belly: 0xb79a78, leg: 0x5a4030, sn: { w: .12, h: .1, l: .16, c: 0x6e5440 } },
  owl:     { bw: .3, bh: .36, bd: .28, ly: .12, hw: .3, body: 0x8a7458, belly: 0xe8dcc4, leg: 0xd9a24a, sn: { w: .08, h: .07, l: .08, c: 0xf2b134 } },
  troll:   { bw: .5, bh: .46, bd: .56, ly: .22, hw: .38, body: 0x5e7a5a, belly: 0x8aa082, leg: 0x3e5240, sn: { w: .18, h: .12, l: .12, c: 0x7f9a7a }, eye: 0xffb13a },
  drake:   { bw: .34, bh: .3, bd: .7, ly: .22, hw: .3, body: 0x7a1f2b, belly: 0xb8473a, leg: 0x3a1016, sn: { w: .12, h: .1, l: .22, c: 0x5a1520 }, eye: 0xffd23a },
  warbear: { bw: .42, bh: .36, bd: .52, ly: .16, hw: .34, body: 0x40302a, belly: 0x5a443a, leg: 0x2a1d18, sn: { w: .16, h: .12, l: .1, c: 0x8a6a50 }, eye: 0xff4a3a }
};

function makeAnimal(sp) {
  const S = SPEC[sp], g = new THREE.Group(), { bw, bh, bd, ly, hw } = S;
  const legs = [], arms = [], biped = sp === 'panda' || sp === 'owl' || sp === 'troll';
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
    case 'elk':
      both(s => { box(head, s * (hw / 2 - 0.03) - 0.02, hw, 0.08, 0.04, 0.22, 0.04, 0x5a4030); box(head, s * (hw / 2 + 0.05) - 0.02, hw + 0.14, 0.08, 0.04, 0.12, 0.04, 0x5a4030); box(head, s * (hw / 2 - 0.1) - 0.02, hw + 0.18, 0.08, 0.04, 0.1, 0.04, 0x5a4030); box(head, s * (hw / 2 - 0.05) - 0.04, hw - 0.02, 0.02, 0.08, 0.08, 0.05, S.body); });
      box(g, -0.03, ly + 0.12, -bd / 2 - 0.08, 0.06, 0.06, 0.1, S.body);
      break;
    case 'owl':
      both(s => box(head, s * (hw / 2 - 0.04) - 0.03, hw - 0.02, 0.02, 0.06, 0.1, 0.05, S.body));
      box(head, -hw / 2 + 0.02, hw * 0.45, hw * 0.9 - 0.02, 0.1, 0.1, 0.03, 0xf2e6c8); box(head, hw / 2 - 0.12, hw * 0.45, hw * 0.9 - 0.02, 0.1, 0.1, 0.03, 0xf2e6c8);
      both(s => box(g, s * (bw / 2 + 0.02) - 0.03, ly + 0.04, -bd / 2 + 0.02, 0.06, bh - 0.08, bd - 0.04, 0x6e5a42));
      box(g, -0.08, ly - 0.02, -bd / 2 - 0.12, 0.16, 0.06, 0.14, S.body);
      break;
    case 'troll':
      both(s => box(head, s * (hw / 2 - 0.06) - 0.04, hw - 0.04, 0.05, 0.08, 0.1, 0.06, S.body));
      both(s => box(head, s * 0.09 - 0.03, -0.02, hw * 0.9 + 0.02, 0.06, 0.12, 0.06, 0xf1ecd8));
      box(g, bw / 2 + 0.02, ly + 0.1, -0.2, 0.12, 0.12, 0.7, 0x5a3a22); box(g, bw / 2 - 0.02, ly + 0.08, -0.45, 0.2, 0.2, 0.22, 0x6c737a);
      box(g, -bw / 2 - 0.02, ly + bh - 0.1, -bd / 2 - 0.02, bw + 0.04, 0.12, bd + 0.04, 0x3e5240);
      break;
    case 'drake':
      both(s => { box(head, s * (hw / 2 - 0.04) - 0.03, hw, 0.02, 0.06, 0.18, 0.05, 0x3a1016); const w = box(g, s > 0 ? bw / 2 : -bw / 2 - 0.9, ly + bh - 0.04, -0.2, 0.9, 0.04, 0.5, 0x5a1520); w.userData.wing = s; (g.userData.wings = g.userData.wings || []).push(w); });
      box(g, -0.05, ly + 0.08, -bd / 2 - 0.5, 0.1, 0.1, 0.55, S.body); box(g, -0.1, ly + 0.1, -bd / 2 - 0.62, 0.2, 0.08, 0.14, 0x3a1016);
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
  const S = SPEC[sp], head = g.userData.head, hw = S.hw, both = fn => { fn(-1); fn(1); };
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
  } else if (role === 'lancer') {
    box(g, -S.bw / 2 - 0.015, S.ly + 0.06, -S.bd / 2 + 0.12, S.bw + 0.03, S.bh * 0.6, S.bd * 0.5, 0xd4af37);
    box(g, S.bw / 2 + 0.03, S.ly + 0.18, -0.3, 0.04, 0.04, 1.0, 0xdfe4e8); box(g, S.bw / 2 + 0.01, S.ly + 0.16, 0.6, 0.08, 0.08, 0.12, 0xb3122e);
    box(head, -hw / 2 - 0.02, hw - 0.04, -0.02, hw + 0.04, 0.1, hw * 0.9 + 0.04, 0xaeb6bd);
  } else if (role === 'sage') {
    box(head, -hw / 2 - 0.03, hw - 0.02, -0.03, hw + 0.06, 0.06, hw * 0.9 + 0.06, 0x1f8a70);
    box(head, -0.05, hw + 0.04, 0.02, 0.1, 0.16, 0.1, 0x1f8a70);
    box(g, S.bw / 2 + 0.06, S.ly, 0.05, 0.04, 0.8, 0.04, 0x7b5232); box(g, S.bw / 2 + 0.03, S.ly + 0.8, 0.02, 0.1, 0.1, 0.1, 0xe0b24a, LAMP);
  } else if (role === 'mech') {   // a walker frame around the panda
    box(g, -S.bw / 2 - 0.08, S.ly - 0.02, -S.bd / 2 - 0.06, S.bw + 0.16, S.bh + 0.1, S.bd + 0.12, 0x2f3b4a);
    box(g, -S.bw / 2 - 0.1, S.ly + S.bh * 0.5, -S.bd / 2 - 0.08, S.bw + 0.2, 0.08, S.bd + 0.16, 0xffb347);
    both(s => { box(g, s * (S.bw / 2 + 0.12) - 0.08, S.ly + S.bh - 0.05, -0.1, 0.16, 0.16, 0.5, 0x1b2430); box(g, s * (S.bw / 2 + 0.12) - 0.04, S.ly + S.bh - 0.01, 0.38, 0.08, 0.08, 0.06, 0xff7a2a, LAMP); });
    box(head, -hw / 2 - 0.03, hw - 0.03, -0.03, hw + 0.06, 0.1, hw * 0.9 + 0.06, 0x2f3b4a); box(head, -0.12, hw * 0.5, hw * 0.9 - 0.02, 0.24, 0.06, 0.03, 0xff7a2a, LAMP);
  } else if (role === 'dropship' || role === 'swarm' || role === 'warden' || role === 'starship' || role === 'drone') {
    const C = { dropship: [0xe8ecf4, 0x5c6fff, 0xc3d0ff], swarm: [0x1f2a2a, 0x19e6a0, 0x7fffd4], warden: [0x3a2a5a, 0xb060ff, 0xe6c7ff], starship: [0xf6f1ff, 0xffd36b, 0xffffff], drone: [0xf6f1ff, 0xffd36b, 0xffffff] }[role];
    for (const p of g.userData.legs) p.visible = false;
    const L = role === 'starship' ? 0.5 : role === 'dropship' ? 0.3 : 0.12, W = role === 'swarm' || role === 'drone' ? 0.06 : 0.14;
    box(g, -S.bw / 2 - W, S.ly - 0.3, -S.bd / 2 - L, S.bw + W * 2, 0.18, S.bd + L * 2, C[0]);
    box(g, -S.bw / 2 - W + 0.04, S.ly - 0.14, -S.bd / 2 - L + 0.04, S.bw + W * 2 - 0.08, 0.06, S.bd + L * 2 - 0.08, C[1]);
    both(s => box(g, s * (S.bw / 2 + W + 0.12) - 0.1, S.ly - 0.4, -0.12, 0.2, 0.1, 0.24, C[2], LAMP));
    if (role === 'starship') { box(g, -0.08, S.ly - 0.26, S.bd / 2 + 0.5, 0.16, 0.12, 0.5, C[1]); both(s => box(g, s * 0.5 - 0.04, S.ly - 0.3, -S.bd / 2 - 0.5, 0.08, 0.3, 0.3, C[1])); }
    if (role === 'swarm') for (let k = 0; k < 6; k++) box(g, rnd(-0.4, 0.3), S.ly + rnd(0.1, 0.5), rnd(-0.4, 0.3), 0.05, 0.05, 0.05, C[1], LAMP);
    if (role === 'warden') box(g, -S.bw / 2 - 0.2, S.ly + S.bh + 0.1, -S.bd / 2 - 0.2, S.bw + 0.4, 0.04, S.bd + 0.4, C[2], LAMP);
    box(g, S.bw / 2 + W - 0.02, S.ly + 0.05, -0.1, 0.05, 0.05, 0.55, 0x2a3350); box(g, S.bw / 2 + W - 0.04, S.ly + 0.04, 0.42, 0.09, 0.09, 0.08, C[2], LAMP);
    box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, C[0]);
  } else if (role === 'skiff') {   // the fox sits in a hovering skiff: hull below, canopy ring, thruster glow
    for (const p of g.userData.legs) p.visible = false;
    box(g, -S.bw / 2 - 0.12, S.ly - 0.3, -S.bd / 2 - 0.16, S.bw + 0.24, 0.16, S.bd + 0.36, 0xdfe6f0);
    box(g, -S.bw / 2 - 0.08, S.ly - 0.16, -S.bd / 2 - 0.1, S.bw + 0.16, 0.08, S.bd + 0.2, 0x2cc4d8);
    box(g, -0.08, S.ly - 0.42, -S.bd / 2 - 0.05, 0.16, 0.12, 0.16, 0x7fe0ff, LAMP); box(g, -0.08, S.ly - 0.42, S.bd / 2 - 0.1, 0.16, 0.12, 0.16, 0x7fe0ff, LAMP);
    box(g, S.bw / 2 + 0.05, S.ly + 0.1, -0.1, 0.05, 0.05, 0.6, 0x3b4a5a); box(g, S.bw / 2 + 0.035, S.ly + 0.085, 0.45, 0.08, 0.08, 0.1, 0x5cf0ff, LAMP);
    box(head, -hw / 2 - 0.02, hw - 0.02, -0.02, hw + 0.04, 0.08, hw * 0.9 + 0.04, 0xdfe6f0);
  } else if (role === 'worker') {
    box(head, -hw / 2 - 0.04, hw - 0.02, -0.04, hw + 0.08, 0.04, hw * 0.9 + 0.08, 0xe2c36b);
    const c = sp === 'panda' ? box(g, -0.1, S.ly + 0.06, -S.bd / 2 - 0.14, 0.2, 0.2, 0.14, 0xffffff) : box(g, -0.1, S.ly + S.bh, -0.12, 0.2, 0.16, 0.2, 0xffffff);
    c.visible = false;
    g.userData.carry = c;
    // a tool in the right paw, shown only while working: axe head one side, pick the other, swapped by what is being gathered
    const tool = new THREE.Group(); tool.position.set(S.bw / 2 + 0.06, S.ly + S.bh * 0.5, S.bd / 2 - 0.05);
    box(tool, -0.02, -0.05, -0.02, 0.04, 0.42, 0.04, 0x7b5232);
    const axe = box(tool, -0.02, 0.3, 0.02, 0.1, 0.12, 0.04, 0xcfd4d8), pick = box(tool, -0.12, 0.33, -0.015, 0.24, 0.04, 0.03, 0x8a919a);
    tool.visible = false; g.add(tool); g.userData.tool = tool; g.userData.axe = axe; g.userData.pick = pick;
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
    case 'sapling':
      box(g, -0.3, 0, -0.3, 0.6, 0.05, 0.6, 0x5a4030);
      box(g, -0.03, 0.05, -0.03, 0.06, 0.35, 0.06, 0x6b4a2f); box(g, -0.12, 0.3, -0.12, 0.24, 0.16, 0.24, 0x6fcf57);
      [[-0.22, -0.22], [0.14, -0.22], [-0.22, 0.14], [0.14, 0.14]].forEach(([x, z]) => box(g, x, 0.05, z, 0.08, 0.1, 0.08, 0x7fd45f));
      break;
    case 'berrybed':
      box(g, -0.32, 0, -0.32, 0.64, 0.06, 0.64, 0x6b4a2f);
      for (let k = 0; k < 3; k++) for (let m = 0; m < 3; m++) box(g, -0.24 + k * 0.18, 0.06, -0.24 + m * 0.18, 0.1, 0.1, 0.1, (k + m) % 2 ? 0x5aae4a : 0x4c9a3e);
      box(g, -0.05, 0.14, -0.05, 0.08, 0.08, 0.08, 0xd9344a);
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
    case 'wall': {
      const nb = wallNeighbors(b), pal = A === 0;
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
        if (A >= 2) {   // battlements on the post and along the runs
          [[-0.3, -0.3], [0.18, -0.3], [-0.3, 0.18], [0.18, 0.18]].forEach(([x, z]) => box(g, x, 0.97, z, 0.12, 0.14, 0.12, c2));
          if (nb.e) box(g, 0.32, 0.75, -0.04, 0.12, 0.12, 0.08, c2); if (nb.w) box(g, -0.44, 0.75, -0.04, 0.12, 0.12, 0.08, c2);
          if (nb.s) box(g, -0.04, 0.75, 0.32, 0.08, 0.12, 0.12, c2); if (nb.n) box(g, -0.04, 0.75, -0.44, 0.08, 0.12, 0.12, c2);
        }
        if (A >= 3) box(g, -0.31, 0.5, -0.31, 0.62, 0.06, 0.62, P.trim);   // gold band
        if (A >= 4) box(g, -0.3, 0.97, -0.3, 0.6, 0.08, 0.6, A >= 6 ? 0x7fe0ff : A >= 5 ? 0xb87333 : 0xe9e3d7, A >= 6 ? LAMP : undefined);   // marble cap, copper, then a glowing barrier rail
        if (A >= 6) { if (nb.e) box(g, 0.26, 0.5, -0.03, 0.24, 0.06, 0.06, 0x7fe0ff, LAMP); if (nb.w) box(g, -0.5, 0.5, -0.03, 0.24, 0.06, 0.06, 0x7fe0ff, LAMP); if (nb.s) box(g, -0.03, 0.5, 0.26, 0.06, 0.06, 0.24, 0x7fe0ff, LAMP); if (nb.n) box(g, -0.03, 0.5, -0.5, 0.06, 0.06, 0.24, 0x7fe0ff, LAMP); }
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
    case 'reactor': {
      box(g, -0.95, 0, -0.95, 1.9, 0.3, 1.9, 0x2f3b4a);
      [[0.8, 0.5], [0.62, 0.4], [0.4, 0.3]].forEach(([s, h], k) => box(g, -s, 0.3 + k * 0.45, -s, s * 2, h, s * 2, k % 2 ? 0x1b2430 : 0x2f3b4a));
      box(g, -0.22, 0.45, -0.22, 0.44, 1.1, 0.44, 0xff7a2a, LAMP);
      [[-0.9, 0], [0.7, 0], [0, -0.9], [0, 0.7]].forEach(([x, z]) => { box(g, x, 0.3, z, 0.2, 0.9, 0.2, 0x1b2430); box(g, x + 0.05, 1.2, z + 0.05, 0.1, 0.3, 0.1, 0xffb347, LAMP); });
      box(g, -0.3, 1.7, -0.3, 0.6, 0.08, 0.6, 0xffb347);
      break;
    }
    case 'orbital': {
      box(g, -0.4, 0, -0.4, 0.8, 0.14, 0.8, 0xe8ecf4);
      box(g, -0.1, 0.14, -0.1, 0.2, 1.1, 0.2, 0x2a3350);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.04, 0.14, z * 0.3 - 0.04, 0.08, 0.6, 0.08, 0xc3d0ff));
      const tur = new THREE.Group(); tur.position.set(0, 1.24, 0);
      box(tur, -0.45, 0, -0.45, 0.9, 0.08, 0.9, 0xe8ecf4); box(tur, -0.32, 0.08, -0.32, 0.64, 0.08, 0.64, 0x5c6fff); box(tur, -0.06, 0.16, -0.06, 0.12, 0.3, 0.12, 0xc3d0ff, LAMP);
      g.add(tur); b.turret = tur; (g.userData.spin = g.userData.spin || []).push(tur);
      break;
    }
    case 'nanoforge': {
      box(g, -0.42, 0, -0.42, 0.84, 0.3, 0.84, 0x1f2a2a);
      [[-0.34, -0.34], [0.14, -0.34], [-0.34, 0.14], [0.14, 0.14]].forEach(([x, z]) => box(g, x, 0.3, z, 0.2, 0.7, 0.2, 0x0f1a1a));
      box(g, -0.3, 0.55, -0.3, 0.6, 0.12, 0.6, 0x19e6a0, LAMP); box(g, -0.3, 0.95, -0.3, 0.6, 0.12, 0.6, 0x19e6a0, LAMP);
      box(g, -0.12, 0.3, -0.12, 0.24, 0.9, 0.24, 0x7fffd4, LAMP);
      break;
    }
    case 'quantum': {
      box(g, -0.36, 0, -0.36, 0.72, 0.12, 0.72, 0x3a2a5a);
      [[0.22, 0.9], [0.16, 0.7], [0.1, 0.5]].forEach(([s, h], k) => box(g, -s, 0.12 + k * 0.75, -s, s * 2, h, s * 2, k % 2 ? 0x22183a : 0x3a2a5a));
      [0.5, 1.0, 1.5].forEach(y => box(g, -0.3, y, -0.3, 0.6, 0.05, 0.6, 0xb060ff, LAMP));
      const tur = new THREE.Group(); tur.position.set(0, 2.1, 0);
      box(tur, -0.12, 0, -0.12, 0.24, 0.24, 0.24, 0xe6c7ff, LAMP);
      g.add(tur); b.turret = tur; (g.userData.spin = g.userData.spin || []).push(tur);
      break;
    }
    case 'starbeacon': {
      box(g, -0.95, 0, -0.95, 1.9, 0.2, 1.9, 0x3a3f66);
      box(g, -0.55, 0.2, -0.55, 1.1, 0.25, 1.1, 0xf6f1ff);
      box(g, -0.2, 0.45, -0.2, 0.4, 2.4, 0.4, 0xf6f1ff); box(g, -0.08, 2.85, -0.08, 0.16, 0.5, 0.16, 0xffd36b, LAMP);
      [[-0.85, -0.85], [0.65, -0.85], [-0.85, 0.65], [0.65, 0.65]].forEach(([x, z]) => box(g, x, 0.2, z, 0.2, 0.5, 0.2, 0xffd36b, LAMP));
      const ring = new THREE.Group(); ring.position.set(0, 1.6, 0);
      [0, 1, 2, 3].forEach(k => { const a = k / 4 * Math.PI * 2; box(ring, Math.cos(a) * 0.6 - 0.06, 0, Math.sin(a) * 0.6 - 0.06, 0.12, 0.12, 0.12, 0xffffff, LAMP); });
      g.add(ring); (g.userData.spin = g.userData.spin || []).push(ring);
      break;
    }
    case 'skyscraper': {
      const h1 = hash(b.i * 3, b.j * 5);
      box(g, -0.9, 0, -0.9, 1.8, 0.2, 1.8, 0x8a929c);
      const tiers = [[0.8, 1.4], [0.68, 1.2], [0.56, 1.0], [0.44, 0.6 + h1 * 0.5]];
      let y = 0.2;
      for (const [s, hh] of tiers) {
        box(g, -s, y, -s, s * 2, hh, s * 2, 0xdfe6f0);
        for (let fl = 0; fl < Math.floor(hh / 0.3); fl++) { const fy = y + 0.08 + fl * 0.3; box(g, -s - 0.01, fy, -s + 0.1, 0.02, 0.14, s * 2 - 0.2, 0xbfe3f2, LAMP); box(g, s - 0.01, fy, -s + 0.1, 0.02, 0.14, s * 2 - 0.2, 0xbfe3f2, LAMP); box(g, -s + 0.1, fy, s - 0.01, s * 2 - 0.2, 0.14, 0.02, 0xbfe3f2, LAMP); box(g, -s + 0.1, fy, -s - 0.01, s * 2 - 0.2, 0.14, 0.02, 0xbfe3f2, LAMP); }
        box(g, -s - 0.03, y + hh - 0.06, -s - 0.03, s * 2 + 0.06, 0.06, s * 2 + 0.06, 0x2cc4d8);
        y += hh;
      }
      box(g, -0.03, y, -0.03, 0.06, 0.6, 0.06, 0x3b4a5a); box(g, -0.05, y + 0.6, -0.05, 0.1, 0.1, 0.1, 0xff4a6a, LAMP);
      break;
    }
    case 'laser': {
      box(g, -0.3, 0, -0.3, 0.6, 0.12, 0.6, 0x8a929c);
      box(g, -0.14, 0.12, -0.14, 0.28, 1.3, 0.28, 0xdfe6f0);
      [0.4, 0.8].forEach(yy => box(g, -0.17, yy, -0.17, 0.34, 0.06, 0.34, 0x2cc4d8));
      const tur = new THREE.Group();
      tur.position.set(0, 1.42, 0);
      box(tur, -0.2, 0, -0.2, 0.4, 0.14, 0.4, 0x3b4a5a);
      box(tur, -0.1, 0.12, -0.1, 0.2, 0.2, 0.2, 0xdfe6f0);
      box(tur, -0.06, 0.16, 0.08, 0.12, 0.12, 0.45, 0x3b4a5a); box(tur, -0.05, 0.17, 0.5, 0.1, 0.1, 0.06, 0x5cf0ff, LAMP);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'skyport': {
      box(g, -0.95, 0, -0.95, 1.9, 0.14, 1.9, 0x8a929c);
      box(g, -0.8, 0.14, -0.8, 1.6, 0.04, 1.6, 0x3b4a5a);
      [[-0.7, -0.7], [0.5, -0.7], [-0.7, 0.5], [0.5, 0.5]].forEach(([x, z]) => box(g, x, 0.18, z, 0.2, 0.06, 0.2, 0x7fe0ff, LAMP));
      box(g, -0.6, 0.17, -0.04, 1.2, 0.03, 0.08, 0x7fe0ff, LAMP); box(g, -0.04, 0.17, -0.6, 0.08, 0.03, 1.2, 0x7fe0ff, LAMP);
      box(g, 0.55, 0.18, -0.9, 0.35, 0.9, 0.35, 0xdfe6f0); box(g, 0.6, 1.08, -0.85, 0.25, 0.2, 0.25, 0x2cc4d8);
      const dr = new THREE.Group(); dr.position.set(-0.3, 0.9, 0.2);
      box(dr, -0.12, 0, -0.12, 0.24, 0.12, 0.24, 0xdfe6f0); box(dr, -0.3, 0.12, -0.02, 0.6, 0.03, 0.04, 0x3b4a5a); box(dr, -0.02, 0.12, -0.3, 0.04, 0.03, 0.6, 0x3b4a5a); box(dr, -0.05, -0.08, -0.05, 0.1, 0.08, 0.1, 0x5cf0ff, LAMP);
      g.add(dr); (g.userData.spin = g.userData.spin || []).push(dr);
      break;
    }
    case 'bombard': {
      box(g, -0.46, 0, -0.46, 0.92, 0.6, 0.92, 0xe9e3d7);
      box(g, -0.52, 0.6, -0.52, 1.04, 0.1, 1.04, 0xd4af37);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.4 - 0.08, 0.7, z * 0.4 - 0.08, 0.16, 0.16, 0.16, 0xe9e3d7));
      flagAt(g, -0.44, 0.7, -0.44, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 0.7, 0);
      box(tur, -0.26, 0, -0.26, 0.52, 0.22, 0.52, 0x5a4a3a);
      box(tur, -0.17, 0.2, -0.2, 0.34, 0.34, 0.6, 0x8c6d3a);
      box(tur, -0.2, 0.18, 0.3, 0.4, 0.38, 0.1, 0xd4af37);
      box(tur, -0.12, 0.26, -0.3, 0.24, 0.24, 0.1, 0x3b3f45);
      g.add(tur); b.turret = tur;
      break;
    }
    case 'turret': {
      box(g, -0.34, 0, -0.34, 0.68, 0.95, 0.68, 0x707b87);
      box(g, -0.4, 0.95, -0.4, 0.8, 0.08, 0.8, 0xe0b24a);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => box(g, x * 0.3 - 0.06, 0.3 + z * 0.1, z * 0.3 - 0.06, 0.12, 0.3, 0.12, 0xb87333));
      box(g, -0.06, 0.35, 0.34, 0.12, 0.2, 0.03, 0xffd36b, LAMP);
      flagAt(g, -0.3, 1.03, -0.3, P.flag);
      const tur = new THREE.Group();
      tur.position.set(0, 1.03, 0);
      box(tur, -0.2, 0, -0.2, 0.4, 0.16, 0.4, 0x3f464f);
      box(tur, -0.16, 0.14, -0.16, 0.32, 0.26, 0.32, 0xb87333);
      [-0.08, 0.08].forEach(x => box(tur, x - 0.03, 0.22, 0.1, 0.06, 0.06, 0.5, 0x25282c));
      box(tur, -0.1, 0.4, -0.1, 0.2, 0.08, 0.2, 0xe0b24a);
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
        if (A >= 3) { box(g, -0.7, 1.95, -0.7, 1.4, 0.06, 1.4, P.trim); box(g, -0.05, 2.6, -0.05, 0.1, 0.5, 0.1, P.trim); }
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([x, z]) => {
          box(g, x * 1.15 - 0.25, 0, z * 1.15 - 0.25, 0.5, 1.5, 0.5, st2);
          roofPyr(g, x * 1.15, 1.5, z * 1.15, 0.66, P.roof, 3, 0.22);
          if (A >= 3) box(g, x * 1.15 - 0.27, 1.3, z * 1.15 - 0.27, 0.54, 0.06, 0.54, P.trim);
        });
        box(g, -0.3, 0, 1.3, 0.6, 0.7, 0.04, 0x3a2616);
        flagAt(g, 0, A >= 3 ? 3.0 : 2.5, 0, P.flag);
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
  sapling: [[24, 32, 14, 3, 0x5a4030, 0x4a3426], [24, 24, 3, 9, 0x6b4a2f, 0x4a3426], [24, 16, 9, 6, 0x6fcf57, 0x4fb243]],
  berrybed: [[24, 30, 15, 4, 0x6b4a2f, 0x4a3426], [20, 24, 5, 4, 0x5aae4a, 0x3f8a35], [28, 24, 5, 4, 0x5aae4a, 0x3f8a35], [24, 20, 4, 4, 0xd9344a, 0xb52a3c]],
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
  cannon: [[24, 31, 10, 13, 0x6c737a, 0x6c737a], [24, 18, 12, 3, 0xe3b44e, 0xb98c2a], [24, 13, 4, 5, 0x25282c, 0x25282c]],
  reactor: [[24, 30, 20, 8, 0x2f3b4a, 0x1b2430], [24, 22, 12, 6, 0x2f3b4a, 0x1b2430], [24, 15, 5, 8, 0xff7a2a, 0xff7a2a]],
  orbital: [[24, 32, 10, 5, 0xe8ecf4, 0xc3d0ff], [24, 20, 4, 14, 0x2a3350, 0x1b2430], [24, 12, 16, 4, 0xe8ecf4, 0x5c6fff]],
  nanoforge: [[24, 32, 14, 5, 0x1f2a2a, 0x0f1a1a], [24, 22, 8, 12, 0x7fffd4, 0x19e6a0], [24, 17, 12, 3, 0x19e6a0, 0x19e6a0]],
  quantum: [[24, 33, 12, 4, 0x3a2a5a, 0x22183a], [24, 20, 6, 16, 0x3a2a5a, 0x22183a], [24, 8, 5, 5, 0xe6c7ff, 0xb060ff]],
  starbeacon: [[24, 32, 18, 6, 0x3a3f66, 0x2a2f4d], [24, 16, 6, 18, 0xf6f1ff, 0xd8d2e8], [24, 6, 4, 6, 0xffd36b, 0xffd36b]],
  skyscraper: [[24, 34, 14, 6, 0xdfe6f0, 0xb9c3cf], [24, 24, 12, 10, 0xdfe6f0, 0xb9c3cf], [24, 14, 9, 10, 0xdfe6f0, 0xb9c3cf], [24, 10, 2, 5, 0x2cc4d8, 0x2cc4d8]],
  laser: [[24, 32, 10, 5, 0x8a929c, 0x6f777f], [24, 18, 5, 16, 0xdfe6f0, 0xb9c3cf], [24, 12, 8, 5, 0x3b4a5a, 0x2b3744], [24, 9, 4, 3, 0x5cf0ff, 0x5cf0ff]],
  skyport: [[24, 30, 20, 5, 0x3b4a5a, 0x2b3744], [24, 28, 10, 2, 0x7fe0ff, 0x7fe0ff], [32, 20, 5, 10, 0xdfe6f0, 0xb9c3cf], [18, 18, 6, 3, 0xdfe6f0, 0xb9c3cf]],
  bombard: [[24, 32, 13, 10, 0xe9e3d7, 0xcfc8ba], [24, 22, 15, 3, 0xd4af37, 0xb8922a], [24, 16, 8, 7, 0x8c6d3a, 0x6b5230]],
  turret: [[24, 31, 9, 15, 0x707b87, 0x5a636e], [24, 16, 11, 3, 0xe0b24a, 0xb8922a], [24, 11, 7, 6, 0xb87333, 0x8f5a28]]
};
function iconSVG(type) {
  if (type === 'wall' && G.age === 0) type = 'palisade';
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
  smith: 0, tech: {}, diff: 'normal', threat: 0, spawnQ: [], markers: [], slot: 0, birthT: 6, treeT: 0, keepB: null, kills: 0, sel: null, build: null, popCap: 5, selU: [], cmd: null
};
const buildings = [], units = [], enemies = [], shots = [], parts = [];
let bid = 1;
const TGT = { wood: 260, stone: 140, food: 200, gold: 80 };
const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const afford = c => Object.keys(c).every(k => G.res[k] >= c[k]);
const pay = c => { for (const k in c) G.res[k] -= c[k]; };
const dmgMult = () => (1 + 0.2 * G.smith) * (1 + 0.15 * ((G.tech && G.tech.stellar) || 0));
const TL = id => (G.tech && G.tech[id]) || 0;   // tech level
const towerDmgMult = () => 1 + 0.15 * TL('siegecraft');
const towerRange = def => def.range + 0.5 * TL('watchfires') + TL('targeting') + (def.shot === 'laser' ? 2 * TL('beacon') : 0);
const uRange = u => u.def.range + (u.def.shot && u.team === 0 ? 0.5 * TL('fletching') : 0);
const incomeMult = (b, k) => (1 + 0.3 * TL('automata')) * (1 + 0.25 * TL('fusion')) * (k === 'food' ? seasonFood() * (1 + 0.25 * TL('farm')) : 1) * (b.type === 'market' && k === 'gold' ? 1 + (0.2 / 0.45) * TL('trade') : 1) * (b.type === 'quarry' && k === 'stone' ? 1 + TL('quarrying') : 1);
function bMaxHp(def) { if (def.wall) return Math.round(def.hp * (1 + 0.25 * TL('walls'))); if (def.plant) return def.hp; return Math.round((def.hp + (def.cat === 'none' ? 600 * G.age : 0)) * (1 + 0.15 * TL('masonry'))); }
function refreshBuildingHp() { for (const b of buildings) { const m = bMaxHp(b.def); if (m !== b.maxhp) { const r = b.hp / b.maxhp; b.maxhp = m; b.hp = Math.min(m, m * r); if (b.hp < b.maxhp - 0.5) showBar(b); } } }
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
const SHAKING = [];
function updateShakes(dt) {   // trees and rocks wobble when struck
  for (let k = SHAKING.length - 1; k >= 0; k--) {
    const n = SHAKING[k]; n.shake -= dt;
    if (n.shake <= 0 || !n.group) { if (n.group) { n.group.rotation.z = 0; n.group.rotation.x = 0; } SHAKING.splice(k, 1); continue; }
    const a = Math.sin(n.shake * 40) * n.shake * 0.35;
    n.group.rotation.z = a; n.group.rotation.x = a * 0.5;
    if (n.growT) { n.growT -= dt; const s = 1 - Math.max(0, n.growT) / 1.2 * 0.65; n.group.scale.setScalar(s); if (n.growT <= 0) { n.growT = 0; n.group.scale.setScalar(1); } }
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
  stone: { c: 0x9aa0a6, s: [0.12, 0.12, 0.12], sp: 10 }, laser: { c: 0x5cf0ff, s: [0.06, 0.06, 1.3], sp: 55, basic: true },
  orbital: { c: 0xfff1a8, s: [0.16, 0.16, 0.16], sp: 42, basic: true }, quantum: { c: 0xd49cff, s: [0.08, 0.08, 0.9], sp: 50, basic: true }
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
/* Reachability from the Great Hall, cached per map change. Settlers only take jobs they can reach, and anything sealed in a pocket is stepped out. */
const REACH = { ver: -1, map: null };
function reachMap() {
  if (REACH.ver !== NAV.ver || !REACH.map) { REACH.map = floodFromKeep(new Set()); REACH.ver = NAV.ver; }
  return REACH.map;
}
const reachAt = (i, j) => inMap(i, j) && reachMap()[i * MAP + j] === 1;
function reachableNear(o) {   // a node tile itself, or any tile touching a building's footprint
  if (o.cells) { for (const [i, j] of o.cells) for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) if (reachAt(i + di, j + dj)) return true; return false; }
  return reachAt(Math.round(o.x), Math.round(o.z)) || reachAt(o.i, o.j);
}
function escapePocket(u) {   // stand on a tile the Hall can reach, as close as possible to where the animal is now
  const ci = Math.round(u.x), cj = Math.round(u.z);
  for (let r = 1; r <= 10; r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) {
    if (Math.max(Math.abs(di), Math.abs(dj)) !== r) continue;
    if (reachAt(ci + di, cj + dj)) { u.x = ci + di; u.z = cj + dj; u.path = null; u.stuckT = 0; return true; }
  }
  const sp = validSpot(KX, KZ + 2.6); u.x = sp[0]; u.z = sp[1]; u.path = null; return true;
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
  const mh = bMaxHp(def);
  const b = { id: bid++, type, def, i: ai, j: aj, hp: mh, maxhp: mh, progress: instant ? 1 : 0, done: !!instant, builders: 0, cool: 0, group: null, turret: null, team: 0 };
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
  if (b.def.plant) {   // a planting becomes a resource node the moment it is finished
    const i = b.i, j = b.j, type = b.def.plant;
    destroyBuilding(b, true);
    const n = addNode(type, i, j, type === 'wood' ? 30 : 24);
    n.group.scale.setScalar(0.35); n.growT = 1.2; if (!SHAKING.includes(n)) { n.shake = 0.6; SHAKING.push(n); }
    puff(n.x, 0.4, n.z, 0x6fcf57, 8, 1.2, 0.6, 0.08); sfx('done', n.x, n.z);
    return;
  }
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
  if (!silent || !b.def.plant) { sfx('crumble', b.x, b.z); puff(b.x, b.y + 0.5, b.z, 0x9a8f80, 16, 2.4, 0.9, 0.22); puff(b.x, b.y + 0.5, b.z, 0x6b4a2f, 8, 2, 0.8, 0.18); }
  if (b.def.wall) refreshWalls(b.i, b.j);
  if (G.sel === b) G.sel = null;
  for (const u of units) { if (u.site === b) { u.site = null; u.state = 'idle'; } if (u.rep === b) { u.rep = null; u.state = 'idle'; } if (u.farm === b) { u.farm = null; u.state = 'idle'; } }
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
  musket: { name: 'Aimed Shot', cd: 18, desc: 'One shot for 4x damage.' },
  lancer: { name: 'Stampede', cd: 20, desc: 'Charges 3 tiles ahead, hitting raiders in the way for 1.6x damage and shoving them aside.' },
  sage: { name: 'Hoot of Courage', cd: 24, desc: 'Every defender within 4 tiles heals 30% of its health.' },
  skiff: { name: 'Strafing Run', cd: 16, desc: 'A beam sweep that hits every raider within 5 tiles for 1.2x damage.' },
  mech: { name: 'Shockwave', cd: 18, desc: 'Stamps the ground: every raider within 2.5 tiles takes 2x damage and is shoved back.' },
  dropship: { name: 'Payload', cd: 20, desc: 'Drops a bomb on the nearest raider for 3x damage in a 3 tile blast.' },
  swarm: { name: 'Disassemble', cd: 12, desc: 'A burst of 8 shots at once.' },
  warden: { name: 'Phase Shift', cd: 16, desc: 'Blinks beside the nearest raider and heals 25%.' },
  starship: { name: 'Nova', cd: 22, desc: 'Everything within 6 tiles takes 2x damage.' }
};
function applyStats(u) {
  const d = u.def, L = u.lvl - 1;
  const arm = u.role === 'worker' ? 1 : (1 + 0.15 * TL('armor')) * (u.role === 'skiff' ? 1 + 0.2 * TL('aero') : 1), el = u.elite ? 1.35 : 1;
  const mh = Math.round(d.hp * (1 + 0.14 * L) * (u.trait === 'sturdy' ? 1.15 : 1) * arm * el);
  u.hp = Math.min(mh, u.hp + (mh - (u.maxhp || mh))); u.maxhp = mh;
  u.dmgM = (1 + 0.1 * L) * (u.trait === 'keen' ? 1.12 : 1) * (u.elite ? 1.3 : 1);
  u.speed = d.speed * (u.trait === 'swift' ? 1.12 : 1) * (1 + 0.012 * L) * (u.elite ? 1.08 : 1) * (u.role === 'worker' ? 1 + 0.1 * TL('carts') : (1 + 0.08 * TL('drill')) * (u.role === 'skiff' ? 1 + 0.2 * TL('aero') : 1));
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
  u.xp += TL('veterans') >= 2 && u.role !== 'worker' ? Math.ceil(n * 1.5) : n;
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
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= uRange(u) + 1).sort((a, b) => dist2(u, a) - dist2(u, b));
    if (u.role === 'archer') foes.slice(0, 4).forEach(e => { shoot(u, e, 'arrow', dmg * 1.4, 0, 0.5); used = true; });
    else if (foes[0]) { shoot(u, foes[0], 'bullet', dmg * 4, 0, 0.5); used = true; }
  } else if (u.role === 'guard') {
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 6);
    if (foes.length) { u.shield = 6; foes.forEach(e => { e.taunt = { u, until: G.t + 5 }; e.tgt = u; }); puff(u.x, 0.5, u.z, 0x9fd0ff, 10, 1.6, 0.6, 0.12); used = true; }
  } else if (u.role === 'knight') {
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 1.8);
    if (foes.length) { foes.forEach(e => hurt(e, dmg * 2, u)); puff(u.x, 0.5, u.z, 0xffffff, 12, 2.4, 0.4, 0.12); used = true; }
  } else if (u.role === 'lancer') {   // Stampede: charge 4 tiles forward, hitting and shoving every raider on the way
    const fx = Math.sin(u.face), fz = Math.cos(u.face);
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 4.5 && ((e.x - u.x) * fx + (e.z - u.z) * fz) > 0);
    if (foes.length) {
      foes.forEach(e => { hurt(e, dmg * 1.6, u); const sp = validSpot(e.x + fx * 1.6 + rnd(-0.4, 0.4), e.z + fz * 1.6 + rnd(-0.4, 0.4)); e.x = sp[0]; e.z = sp[1]; e.path = null; });
      const sp = validSpot(u.x + fx * 3, u.z + fz * 3); u.x = sp[0]; u.z = sp[1]; u.path = null;
      puff(u.x, 0.4, u.z, 0xd9c9a0, 14, 2.6, 0.5, 0.12); used = true;
    }
  } else if (u.role === 'mech') {   // Shockwave
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 2.5);
    if (foes.length) { foes.forEach(e => { hurt(e, dmg * 2, u); const ax = e.x - u.x, az = e.z - u.z, al = Math.hypot(ax, az) || 1; if (!e.fly) { const sp = validSpot(e.x + ax / al * 1.8, e.z + az / al * 1.8); e.x = sp[0]; e.z = sp[1]; e.path = null; } }); puff(u.x, 0.3, u.z, 0xffb347, 18, 3, 0.5, 0.14); used = true; }
  } else if (u.role === 'dropship') {   // Payload
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 7).sort((a, b) => dist2(u, a) - dist2(u, b));
    if (foes[0]) { shoot(u, foes[0], 'orbital', dmg * 3, 3, 1.2); used = true; }
  } else if (u.role === 'swarm') {   // Disassemble
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= uRange(u) + 1).sort((a, b) => dist2(u, a) - dist2(u, b));
    if (foes[0]) { for (let k = 0; k < 8; k++) shoot(u, foes[k % foes.length], 'laser', dmg, 0, 1.1); used = true; }
  } else if (u.role === 'warden') {   // Phase Shift
    const t = nearest(enemies, u.x, u.z, 20);
    if (t) { puff(u.x, 1, u.z, 0xd49cff, 10, 1.5, 0.5, 0.1); u.x = t.x + rnd(-1, 1); u.z = t.z + rnd(-1, 1); u.hp = Math.min(u.maxhp, u.hp + u.maxhp * 0.25); dropBar(u); if (u.hp < u.maxhp) showBar(u); puff(u.x, 1, u.z, 0xd49cff, 10, 1.5, 0.5, 0.1); used = true; }
  } else if (u.role === 'starship') {   // Nova
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 6);
    if (foes.length) { foes.forEach(e => hurt(e, dmg * 2, u)); puff(u.x, 1.2, u.z, 0xfff1a8, 24, 4, 0.7, 0.16); used = true; }
  } else if (u.role === 'skiff') {   // Strafing Run: beam every raider nearby
    const foes = enemies.filter(e => !e.dead && dist2(u, e) <= 5);
    if (foes.length) { foes.forEach(e => shoot(u, e, 'laser', dmg * 1.2, 0, 1.2)); used = true; }
  } else if (u.role === 'sage') {   // Hoot of Courage: heal every defender nearby
    const allies = units.filter(o => !o.dead && o.role !== 'worker' && dist2(u, o) <= 4 && o.hp < o.maxhp);
    if (allies.length) { allies.forEach(o => { o.hp = Math.min(o.maxhp, o.hp + o.maxhp * 0.3); dropBar(o); if (o.hp < o.maxhp) showBar(o); puff(o.x, o.y + 0.9, o.z, 0x7be07b, 6, 1.2, 0.6, 0.1); }); used = true; }
  }
  if (used) { u.abCd = ABIL[u.role].cd * (1 - 0.15 * TL('banners')) * (1 - 0.15 * TL('quantumcore')); u.atk = 0.25; sfx('ability', u.x, u.z); }
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
  const huts = buildings.filter(b => b.def.heal && b.done), kp = G.keepB;
  for (const u of units) {
    if (u.dead || u.hp >= u.maxhp) continue;
    let rate = 0, fx = false;
    const calm = G.t - (u.lastHit || -99) > 6;
    if (calm) { rate += u.maxhp * 0.004; if (kp && dist2(u, kp) < 7) rate += u.maxhp * 0.012; }
    if (kp && dist2(u, kp) < 4.5) { rate += 2; fx = true; }
    for (const h of huts) if (dist2(u, h) <= h.def.heal) { rate += h.type === 'nanoforge' ? 6 : 3; fx = true; break; }
    if (u.role !== 'worker' && TL('nano')) rate += u.maxhp * 0.01 * TL('nano');
    if (rate > 0) healUnit(u, rate * dt * (1 + 0.4 * TL('medicine')), fx);
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
/* Last line of defence: any animal that wants to be somewhere but has not moved for 6 seconds is reset
   (jobs released, path and bans cleared, nudged to a free spot) and the event is logged for the Menu's diagnostics. */
const DIAG = { kicks: 0, log: [], t: 0 };
const MOVING_STATES = { toNode: 1, toDrop: 1, toSite: 1, toRepair: 1, toFarm: 1, goto: 1 };   // fleeing settlers hide on purpose; the 12 s brave rule covers them
function wantsToMove(u) {
  if (u.role === 'worker') return !!MOVING_STATES[u.state];
  if (u.order) return true;
  if (u.hold || u.tgt || u.giveUp > G.t) return false;
  const sp = u.home || rallyPos(u.rIdx || 0);
  return Math.hypot(sp[0] - u.x, sp[1] - u.z) > 2.6;
}
function freezeGuard(dt) {
  DIAG.t -= dt; if (DIAG.t > 0) return; DIAG.t = 0.5;
  for (const u of units) {
    if (u.dead) continue;
    if (!wantsToMove(u)) { u.fzT = undefined; continue; }
    if (u.fzT === undefined || Math.hypot(u.x - u.fzX, u.z - u.fzZ) > 0.4) { u.fzT = G.t; u.fzX = u.x; u.fzZ = u.z; continue; }
    if (G.t - u.fzT < 6) continue;
    const i = Math.round(u.x), j = Math.round(u.z);
    const why = { t: Math.round(G.t), role: u.role, state: u.state, order: u.order && u.order.type, path: !!u.path, pi: u.pi, unreach: !!u.unreach, stuckT: +(u.stuckT || 0).toFixed(1), noLos: u.noLos > G.t, blockedHere: !!blockedAt(u.x, u.z, 0, null), reachHere: reachAt(i, j), tile: kind[i] && kind[i][j], occ: !!(occ[i] && occ[i][j]), near: units.filter(o => !o.dead && o !== u && Math.hypot(o.x - u.x, o.z - u.z) < 0.8).length, v: GAME_VERSION };
    DIAG.kicks++; DIAG.log.push(why); if (DIAG.log.length > 12) DIAG.log.shift();
    // reset everything that could be holding it
    releaseWorker(u); u.state = 'idle'; u.wait = 0; u.wp = null; u.order = null; u.tgt = null; u.path = null; u.unreach = false; u.stuckT = 0; u.repathT = 0; u.noLos = 0; u.badNode = null; u.badSite = null; u.badUntil = 0; u.nudges = 0; u.fleeTo = null; u.brave = G.t + 4;
    if (u.role !== 'worker') { u.giveUp = G.t + 1; if (u.home && Math.hypot(u.home[0] - u.x, u.home[1] - u.z) > 1.2) u.home = null; }
    if (!reachAt(i, j)) escapePocket(u);
    else { const sp = validSpot(u.x + rnd(-1.5, 1.5), u.z + rnd(-1.5, 1.5)); u.x = sp[0]; u.z = sp[1]; }
    u.fzT = undefined;
    puff(u.x, u.y + 0.6, u.z, 0xffffff, 4, 1, 0.4, 0.07);
  }
}
function watchdog(u, dt) {
  if (u.fly) { u.wdT = 0; return; }
  if (u.team === 0 && !reachAt(Math.round(u.x), Math.round(u.z))) { escapePocket(u); u.wdT = 0; return; }
  if (blockedAt(u.x, u.z, u.team === 0 ? 0 : 1, null) === true || (u.team === 0 && blockedAt(u.x, u.z, 0, null))) {   // standing inside a building or cliff: step out to the nearest free spot
    const sp = validSpot(u.x, u.z); u.x = sp[0]; u.z = sp[1]; u.path = null; u.wdT = 0; return;
  }
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
    if (target.amt !== undefined) { target.workers++; u.node = target; u.pref = target.type; u.prefUntil = G.t + 90; u.state = 'toNode'; }
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
  if (u.fly) {   // flyers go straight there, over everything
    if (d < 1.2) u.mvNear = G.t; else u.mv = G.t;
    if (d < 0.001) return { d, blocked: false, moved: false };
    const sp = Math.min(u.speed * dt, d); u.x += (tx - u.x) / d * sp; u.z += (tz - u.z) / d * sp; u.face = Math.atan2(tx - u.x, tz - u.z); u.moved = true; u.stuckT = 0;
    u.x = clamp(u.x, 1, MAP - 2); u.z = clamp(u.z, 1, MAP - 2);
    return { d, blocked: false, moved: true };
  }
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
  u.y += ((groundAt(u.x, u.z) + (u.fly ? 1.1 + Math.sin(G.t * 2.1 + (u.slot || 0)) * 0.12 : 0)) - u.y) * Math.min(1, dt * 10);
  m.position.set(u.x, u.y, u.z);
  u.vis = turnTo(u.vis === undefined ? u.face : u.vis, u.face, dt * 10);
  m.rotation.y = u.vis;
  if (u.moved) u.walk += dt * u.speed * 4.2;
  ud.legs.forEach((p, i) => { p.rotation.x = u.moved ? Math.sin(u.walk) * 0.7 * (i === 0 || i === 3 ? 1 : -1) : p.rotation.x * 0.8; });
  if (ud.arms) ud.arms.forEach((p, i) => { p.rotation.x = u.moved ? Math.sin(u.walk) * 0.6 * (i === 0 ? -1 : 1) : p.rotation.x * 0.8; });
  const bob = u.moved ? Math.abs(Math.sin(u.walk)) * 0.05 : (u.state === 'gather' || u.state === 'build') ? Math.abs(Math.sin(G.t * 9)) * 0.07 : 0;
  m.position.y = u.y + bob;
  if (u.atk > 0) { u.atk -= dt; ud.body.position.z = Math.sin(clamp(u.atk / 0.25, 0, 1) * Math.PI) * 0.18; } else ud.body.position.z = 0;
  if (ud.wings) for (const w of ud.wings) w.rotation.z = w.userData.wing * Math.sin(G.t * 9 + (u.slot || 0)) * 0.5;
  if (ud.tool) {   // settlers swing a tool while gathering, building, repairing or tending
    const working = u.state === 'gather' || u.state === 'build' || u.state === 'repair' || u.state === 'farm';
    ud.tool.visible = working;
    if (working) {
      const sw = Math.sin(G.t * 9 + (u.slot || 0)), isPick = u.state === 'gather' && u.node && (u.node.type === 'stone' || u.node.type === 'gold');
      ud.axe.visible = !isPick; ud.pick.visible = isPick;
      ud.tool.rotation.x = -0.9 + sw * 0.9; ud.body.rotation.x = Math.max(0, sw) * 0.12;
      if (ud.head) ud.head.rotation.x = Math.max(0, sw) * 0.25;
    } else { ud.body.rotation.x = 0; if (ud.head) ud.head.rotation.x = 0; }
  }
  { const es = u.elite ? 1.12 : 1; if (u.hitT > 0) { u.hitT -= dt; m.scale.set(es * (1 + u.hitT), es * (1 - u.hitT * 1.4), es * (1 + u.hitT)); } else m.scale.set(es, es, es); }
  u.moved = false;
}

/* ===================== workers ===================== */
function releaseWorker(u) {
  if (u.node) { u.node.workers = Math.max(0, u.node.workers - 1); u.node = null; }
  if (u.site) { u.site.builders = Math.max(0, u.site.builders - 1); u.site = null; }
  if (u.rep) { u.rep.repairers = Math.max(0, (u.rep.repairers || 1) - 1); u.rep = null; }
  if (u.farm) { u.farm.farmers = Math.max(0, (u.farm.farmers || 1) - 1); u.farm = null; }
}
function findSite(u) {
  let best = null, bd = 40;
  for (const b of buildings) {
    if (b.done || b.builders >= (b.def.size >= 2 ? 3 : 2) || (u.badSite === b && G.t < u.badUntil) || !reachableNear(b)) continue;
    const d = Math.hypot(b.x - u.x, b.z - u.z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function findFarm(u) {
  let best = null, bd = 1e9;
  for (const b of buildings) {
    if (b.type !== 'farm' || !b.done || (b.farmers || 0) >= 3 || !reachableNear(b)) continue;
    const d = Math.hypot(b.x - u.x, b.z - u.z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function findRepair(u) {
  if (TL('repair') < 2 && enemies.some(e => !e.dead)) return null;
  let best = null, bd = 45;
  for (const b of buildings) {
    if (!b.done || b.hp >= b.maxhp * 0.9 || (b.repairers || 0) >= 2 || !reachableNear(b)) continue;
    const d = Math.hypot(b.x - u.x, b.z - u.z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function findDrop(x, z, type) {
  let best = null, bd = 1e9;
  for (const b of buildings) {
    if (!b.done || !b.def.drop || !b.def.drop.includes(type) || (b.type !== 'keep' && !reachableNear(b))) continue;
    const d = Math.hypot(b.x - x, b.z - z);
    if (d < bd) { bd = d; best = b; }
  }
  return best;
}
function pickNode(u) {
  const order = RES.slice().sort((a, b) => G.res[a] / TGT[a] - G.res[b] / TGT[b]);
  if (u.pref && (G.t > (u.prefUntil || 0) || G.res[u.pref] > TGT[u.pref] * 3)) u.pref = null;   // an order to gather something only sticks for a while, and never once that resource is plentiful
  if (u.pref) { order.splice(order.indexOf(u.pref), 1); order.unshift(u.pref); }
  for (const type of order) {
    let best = null, bs = 1e9;
    for (const n of nodes) {
      if (n.type !== type || n.amt <= 0 || n.workers >= 4 || (n === u.badNode && G.t < u.badUntil) || !reachableNear(n)) continue;
      const dr = findDrop(n.x, n.z, type);
      const sc = Math.hypot(n.x - u.x, n.z - u.z) + (dr ? Math.hypot(dr.x - n.x, dr.z - n.z) : 30);
      if (sc < bs) { bs = sc; best = n; }
    }
    if (best) { best.workers++; return best; }
  }
  return null;
}
function updateWorker(u, dt) {
  // Settlers run from raiders that are close, or a little further away when the raider is hunting animals rather than chewing a building.
  let scare = nearest(enemies, u.x, u.z, 3.5);
  if (scare) {
    const sd = Math.hypot(scare.x - u.x, scare.z - u.z), hunting = scare.tgt && !scare.tgt.cells;
    if ((sd > 2.2 && !hunting) || (scare.lastAct !== undefined && G.t - scare.lastAct > 8) || (u.brave || 0) > G.t) scare = null;
  }
  if (scare) {
    if (u.state !== 'flee') { releaseWorker(u); u.state = 'flee'; u.fleeSince = G.t; }
    u.fleeT = 2.5;
    if (G.t - u.fleeSince > 12) { u.brave = G.t + 8; u.state = 'idle'; u.wait = 0; scare = null; }   // pinned for too long: get back to work and take the risk
  }
  if (u.state === 'flee') {
    u.fleeT -= dt;
    let fx = KX + ((u.slot % 7) - 3) * 0.75, fz = KZ + 2.7 + (Math.floor(u.slot / 7) % 3) * 0.75;
    if (scare && Math.hypot(scare.x - KX, scare.z - KZ) < 6) {   // the raider is at the Hall: run the other way instead
      const ax = u.x - scare.x, az = u.z - scare.z, al = Math.hypot(ax, az) || 1;
      if (!u.fleeTo || G.t - (u.fleeToT || 0) > 1.5) { u.fleeTo = validSpot(u.x + ax / al * 4, u.z + az / al * 4); u.fleeToT = G.t; }
      fx = u.fleeTo[0]; fz = u.fleeTo[1];
    } else u.fleeTo = null;
    if (Math.hypot(fx - u.x, fz - u.z) > 0.9) moveTo(u, fx, fz, dt * 1.25);
    if (u.fleeT <= 0 && !scare) { u.state = 'idle'; u.fleeTo = null; }
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
      { const f = findFarm(u); if (f) { f.farmers = (f.farmers || 0) + 1; u.farm = f; u.state = 'toFarm'; break; } }
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
        puff(n.x, 0.4, n.z, n.type === 'wood' ? 0x6b4a2f : n.type === 'gold' ? 0xf2c14e : n.type === 'food' ? 0xd9344a : 0xb1b7bd, 3, 1.3, 0.4, 0.07);
        if (n.type === 'wood') puff(n.x, 0.9, n.z, pick([0x5cc04a, 0x6fcf57, 0x4fb243]), 3, 0.7, 0.9, 0.08);   // leaves shaken loose
        else if (n.type !== 'food') puff(n.x, 0.5, n.z, 0xfff1a8, 2, 2.2, 0.25, 0.04);   // sparks
        n.shake = 0.35; if (!SHAKING.includes(n)) SHAKING.push(n);
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
      r.hp = Math.min(r.maxhp, r.hp + r.maxhp * 0.05 * (1 + 0.06 * (u.lvl - 1)) * (1 + TL('repair')) * dt);
      if (Math.random() < dt * 2) { puff(r.x + rnd(-0.3, 0.3), r.y + 0.4, r.z + rnd(-0.3, 0.3), 0x7be07b, 1, 0.8, 0.4, 0.06); sfx('hammer', r.x, r.z); }
      break;
    }
    case 'toFarm': {
      const f = u.farm;
      if (!f || f.dead || !f.done) { releaseWorker(u); u.state = 'idle'; break; }
      if (Math.hypot(f.x - u.x, f.z - u.z) > f.def.r + 0.5) { const r = moveTo(u, f.x, f.z, dt, f); if (r.unreachable) { releaseWorker(u); u.state = 'idle'; u.wait = 2; } }
      else { u.state = 'farm'; u.think = 0; u.gt = 0; }
      break;
    }
    case 'farm': {   // tending a Berry Farm: extra food while there is nothing else to gather or build
      const f = u.farm;
      if (!f || f.dead || !f.done) { releaseWorker(u); u.state = 'idle'; break; }
      u.face = Math.atan2(f.x - u.x, f.z - u.z);
      u.gt += dt; if (u.gt > 2.5) { u.gt = 0; grantXP(u, 1); puff(f.x + rnd(-0.3, 0.3), f.y + 0.3, f.z + rnd(-0.3, 0.3), 0xd9344a, 1, 0.6, 0.4, 0.05); }
      u.think += dt;
      if (u.think > 6) {   // look for proper work every few seconds
        u.think = 0;
        const s = findSite(u), n = s ? null : pickNode(u);
        if (s) { releaseWorker(u); s.builders++; u.site = s; u.state = 'toSite'; }
        else if (n) { releaseWorker(u); u.node = n; u.state = 'toNode'; }
      }
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
    name: pick(NAMES), lvl: 1, xp: 0, dmgM: 1, abCd: 0, shield: 0, order: null, hold: false, home: null, fly: !!d.fly, trait: role === 'worker' ? null : pick(Object.keys(TRAITS)), giveUp: 0
  };
  if (u.trait) applyStats(u);
  u.release = () => releaseWorker(u);
  model.userData.u = u;
  model.position.set(x, u.y, z);
  scene.add(model);
  units.push(u);
  return u;
}
/* Rally spots: an arc facing the threat, one spot per living defender (index among the living, not a lifetime counter,
   so late-game armies do not pile onto the same few tiles). */
function rallyPos(idx) {
  const perRing = 9, ring = Math.floor(idx / perRing), k = idx % perRing;
  const ang = G.threat + (k - 4) * 0.26 + (ring % 2 ? 0.13 : 0), r = 5.5 + ring * 0.95;
  return [KX + Math.cos(ang) * r, KZ + Math.sin(ang) * r];
}
function assignRally() {   // called once per step before soldiers think
  let k = 0;
  for (const u of units) if (!u.dead && u.role !== 'worker') u.rIdx = k++;
}
function engage(u, t, dt, forced) {
  const d = u.def, dd = dist2(u, t);
  if (dd > uRange(u) * 0.95) {
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
  if (!t || t.dead || dist2(u, t) > (u.hold ? uRange(u) + 1 : 13)) {
    t = u.tgt = nearest(enemies, u.x, u.z, u.hold ? uRange(u) + 0.3 : 10, e => (e !== u.skip || G.t > u.skipT) && (u.hold || amove || Math.hypot(e.x - KX, e.z - KZ) < RAID_DIST + 4));
  }
  if (t) { engage(u, t, dt, false); return; }
  if (amove) {
    const o2 = u.order;
    if (Math.hypot(o2.x - u.x, o2.z - u.z) < 0.5 || (u.stuckT || 0) > 1.2) { u.home = [o2.x, o2.z]; u.order = null; u.stuckT = 0; }
    else { const r = moveTo(u, o2.x, o2.z, dt); if (r.unreachable) u.order = null; }
    return;
  }
  if (u.hold || u.giveUp > G.t) return;
  const sp = u.home || validSpot(...rallyPos(u.rIdx || 0));
  const dsp = Math.hypot(sp[0] - u.x, sp[1] - u.z);
  if (dsp > 1.0) {
    const r = moveTo(u, sp[0], sp[1], dt);
    if (r.unreachable || (u.stuckT || 0) > 1.5) {
      u.stuckT = 0;
      if (dsp < 2.6) { u.home = [u.x, u.z]; u.giveUp = G.t + 6; }   // close enough and boxed in by friends: this is our spot now
      else { u.home = validSpot(sp[0] + rnd(-1.5, 1.5), sp[1] + rnd(-1.5, 1.5)); u.giveUp = G.t + 1; }   // try a neighbouring spot instead of sulking
    }
  }
}

/* ===================== enemies ===================== */
function makeEnemy(kindName, x, z, mult) {
  const d = EDEF[kindName];
  const model = makeUnitModel(null, d.sp, d.scale);
  const hp = d.hp * mult;
  const e = {
    team: 1, kind: kindName, def: d, x, z, y: groundAt(x, z), hp, maxhp: hp, dmg: d.dmg * (1 + (mult - 1) * 0.6), speed: d.speed * rnd(0.92, 1.08), model,
    face: 0, walk: rnd(0, 6), atk: 0, cd: rnd(0, 1), hgt: 0.8 * d.scale, barW: 0.5 * d.scale + 0.2, dead: false, retarget: 0, blockT: 0, hitT: 0, moved: false, fly: !!d.fly
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
  if (e.lastAct === undefined) { e.lastAct = G.t; e.actX = e.x; e.actZ = e.z; }
  if (Math.hypot(e.x - e.actX, e.z - e.actZ) > 0.5) { e.lastAct = G.t; e.actX = e.x; e.actZ = e.z; }
  if (G.t - e.lastAct > 18) {   // a raider that has neither moved nor fought for a long while is stuck: it slinks away so the raid can end
    e.hp = 0; e.dead = true; scene.remove(e.model); dropBar(e); puff(e.x, e.y + 0.5, e.z, 0x9a8f80, 8, 1.4, 0.7, 0.12);
    toast('A lost raider gave up and slunk away'); return;
  }
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
      e.cd = d.rate; e.atk = 0.25; e.lastAct = G.t;
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
  const t = nearest(enemies, b.x, b.z, towerRange(def));
  if (!t) { b.cool = 0.2; return; }
  b.cool = def.rate * (def.shot === 'laser' && TL('beacon') ? 0.8 : 1) - (def.shot === 'orbital' ? TL('targeting') : 0);
  if (def.chain) { const R = towerRange(def), foes = enemies.filter(e => !e.dead && dist2(b, e) <= R).sort((p, q) => dist2(b, p) - dist2(b, q)).slice(0, def.chain); foes.forEach(e => shoot(b, e, def.shot, def.dmg * (1 + 0.3 * G.age) * dmgMult() * towerDmgMult(), 0, 1.6)); return; }
  if (b.turret) b.turret.rotation.y = Math.atan2(t.x - b.x, t.z - b.z);
  shoot(b, t, def.shot, def.dmg * (1 + 0.3 * G.age) * dmgMult() * towerDmgMult(), def.splash, def.shot === 'orbital' ? 9 : b.y + (b.type === 'tower' ? 1.2 : 1.3) - b.y);
}

/* ===================== waves ===================== */
function planWave(n) {
  const cost = { wolf: 1, boar: 3, raccoon: 2, badger: 5, direwolf: 4, troll: 13, drake: 7, juggernaut: 30 };
  const opts = ['wolf'];
  if (n >= 2) opts.push('boar'); if (n >= 3) opts.push('raccoon'); if (n >= 4) opts.push('badger');
  if (n >= 9) opts.push('direwolf', 'direwolf'); if (n >= 14) opts.push('troll'); if (n >= 19) opts.push('troll'); if (n >= 22) opts.push('drake', 'drake'); if (n >= 26) opts.push('juggernaut');
  let left = (3 + n * 2.4) * (DIFF[G.diff] || DIFF.normal).count; const list = [];
  if (n % 5 === 0) { list.push('chief'); left -= 8; if (n >= 20) { list.push('troll'); left -= 13; } }
  while (left > 0) { const k = pick(opts); list.push(k); left -= cost[k]; }
  return list;
}
function spawnPoint(a) {
  const dx = Math.cos(a), dz = Math.sin(a), k = Math.min(RAID_DIST / Math.max(Math.abs(dx), Math.abs(dz)), MAP / 2 - 3.5);
  let x = clamp(KX + dx * k, 3, MAP - 4), z = clamp(KZ + dz * k, 3, MAP - 4);
  for (let r = 0; r < 6; r++) { const i = Math.round(x), j = Math.round(z); if (kind[i][j] === 'g') break; x += dx * -0.8; z += dz * -0.8; }
  return [x, z];
}
const COMPASS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
const compassName = a => COMPASS[(Math.round(((a % 6.2832) + 6.2832) % 6.2832 / (Math.PI / 4))) % 8];
function startWave() {
  G.wave++;
  const D = DIFF[G.diff] || DIFF.normal, list = planWave(G.wave), mult = (1 + 0.09 * (G.wave - 1)) * D.mult;
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
  G.nextWave = G.wave >= TOTAL_WAVES && !G.endless ? Infinity : G.t + clamp(D.gapHi - Math.min(G.wave, 25) * 1.6, D.gapLo, D.gapHi);
  sfx('horn'); setTimeout(() => sfx('howl'), 900);
  toast(`Raid ${G.wave}${G.wave > TOTAL_WAVES ? ' (endless)' : ' of ' + TOTAL_WAVES}: ${list.length} raiders from the ${groups.map(compassName).join(' and ')}`, true);
}
function setDifficulty(d, quiet) {
  if (!DIFF[d]) return;
  G.diff = d;
  if (G.wave === 0 && !G.over) G.nextWave = DIFF[d].first;   // before the first raid the countdown follows the new setting right away
  try { localStorage.setItem('pawhold.diff', d); } catch (e) { /* ignore */ }
  if (!quiet) toast(`Difficulty: ${DIFF[d].name}. It applies from the next raid`);
  if (typeof refreshDiffButtons === 'function') refreshDiffButtons();
}
function callEarly() {
  if (G.over || (G.wave >= TOTAL_WAVES && !G.endless) || G.nextWave === Infinity) return;
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
  const bar = buildings.filter(b => b.type === (d.fly ? 'skyport' : 'barracks') && b.done).sort((a, b) => dist2(a, G.keepB) - dist2(b, G.keepB))[0];
  if (!bar) return toast(d.fly ? 'Build a Sky Port first' : 'Build a Barracks first', true);
  if (popCount() >= G.popCap) return toast('Not enough housing. Build more Burrow Houses', true);
  if (!afford(d.cost)) return toast('Not enough resources', true);
  pay(d.cost);
  const sp0 = validSpot(bar.x + rnd(-0.4, 0.4), bar.z + 1.5), u = makeUnit(role, sp0[0], sp0[1]);
  if (TL('veterans') >= 1) { u.lvl = 2; applyStats(u); u.hp = u.maxhp; setBadge(u); }
  puff(u.x, 0.5, u.z, 0xffffff, 5, 1.2, 0.4, 0.1); sfx('spawn', u.x, u.z);
}
const carryCap = u => 8 + (u.lvl >> 1) + 2 * TL('tools') + (u.elite ? 3 : 0);
function techNext(t) { return TL(t.id) >= t.max ? null : techCostAt(t, TL(t.id)); }
function researchTech(id, quiet) {
  const t = TECHS.find(x => x.id === id);
  if (!t) return false;
  if (G.age < t.age) { if (!quiet) toast(`${t.name} needs ${AGES[t.age].name}`, true); return false; }
  if (t.need && !buildings.some(b => b.type === t.need && b.done)) { if (!quiet) toast(`Build a ${BDEF[t.need].name} first`, true); return false; }
  const c = techNext(t);
  if (!c) { if (!quiet) toast(`${t.name} is fully researched`); return false; }
  if (!afford(c)) { if (!quiet) toast('Not enough resources', true); return false; }
  pay(c); G.tech[id] = TL(id) + 1;
  applyTechEffects(id);
  sfx('done'); toast(`${t.name} level ${G.tech[id]} researched`);
  return true;
}
function applyTechEffects(id) {   // retroactive effects for things that already exist
  if (['armor', 'carts', 'drill', 'aero'].includes(id)) for (const u of units) if (!u.dead) { applyStats(u); dropBar(u); if (u.hp < u.maxhp) showBar(u); }
  if (['walls', 'masonry'].includes(id)) refreshBuildingHp();
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
    puff(u.x, u.y + 0.9, u.z, 0xffe27a, 14, 2, 0.8, 0.15); sfx('age', u.x, u.z);
  }
  if (n) toast(`${n} ${n > 1 ? 'animals' : el[0].name} promoted to Elite: +35% health, +30% damage`);
}
function upgradeSmith() {
  if (!buildings.some(b => b.type === 'smith' && b.done)) return toast('Build a Blacksmith first', true);
  if (G.smith >= 3) return;
  const c = SMITH_COST[G.smith];
  if (!afford(c)) return toast('Not enough resources', true);
  pay(c); G.smith++;
  toast(`Weapons sharpened: +${G.smith * 20}% damage`);
}
function advanceAge() {
  if (G.age >= AGES.length - 1) return;
  const c = AGE_COST[G.age + 1];
  if (!afford(c)) return toast('Not enough resources to advance', true);
  pay(c); G.age++;
  for (const b of buildings) {
    if (b.type === 'keep') { b.maxhp = bMaxHp(b.def); b.hp = Math.min(b.maxhp, b.hp + b.maxhp * 0.4); }
    if (b.def.wall) { const r = b.hp / b.maxhp; b.maxhp = bMaxHp(b.def); b.hp = b.maxhp * r; if (b.hp < b.maxhp) showBar(b); }
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
  G.popCap = BDEF.keep.pop + buildings.reduce((s, b) => s + (b.done && b.def.pop && b.type !== 'keep' ? b.def.pop + (b.type === 'house' ? TL('housing') : b.type === 'skyscraper' ? 3 * TL('housing') : 0) : 0), 0);
  for (const b of buildings) {
    if (!b.done) continue;
    if (b.def.income) for (const k in b.def.income) G.res[k] += b.def.income[k] * dt * incomeMult(b, k);
    if (b.farmers) G.res.food += b.farmers * 0.3 * dt * incomeMult(b, 'food');
    if (b.def.mend) for (const o of buildings) if (o !== b && o.done && o.hp < o.maxhp && dist2(o, b) <= b.def.heal) { o.hp = Math.min(o.maxhp, o.hp + o.maxhp * b.def.mend * dt); if (o.hp >= o.maxhp) dropBar(o); }
    if (b.type === 'starbeacon') { b.droneT = (b.droneT || 15) - dt; if (b.droneT <= 0) { b.droneT = 40; const mine = units.filter(u => !u.dead && u.role === 'drone' && u.home2 === b.id).length; if (mine < 4) { const sp0 = validSpot(b.x + rnd(-1, 1), b.z + 1.8), u = makeUnit('drone', sp0[0], sp0[1]); u.home2 = b.id; puff(u.x, 1, u.z, 0xfff1a8, 8, 1.4, 0.6, 0.1); sfx('spawn', u.x, u.z); } } }
    if (b.def.range) updateTower(b, dt);
  }
  // new settlers
  G.birthT -= dt;
  if (G.birthT <= 0) {
    G.birthT = 11;
    const workers = units.filter(u => u.role === 'worker' && !u.dead).length;
    if (popCount() < G.popCap && G.res.food >= 25 && workers < 30) { G.res.food -= 25; const sp0 = validSpot(KX + rnd(-1, 1), KZ + 2.3), u = makeUnit('worker', sp0[0], sp0[1]); puff(u.x, 0.5, u.z, 0xffffff, 4, 1, 0.4, 0.08); sfx('spawn', u.x, u.z); }
  }
  // forests regrow slowly
  G.treeT -= dt;
  if (G.treeT <= 0) {
    G.treeT = 9 / (1 + 0.6 * TL('forestry'));
    const trees = nodes.filter(n => n.type === 'wood');
    if (trees.length && trees.length < 110) {
      const p = pick(trees), i = p.i + rint(-1, 1), j = p.j + rint(-1, 1);
      if (freeGrass(i, j)) addNode('wood', i, j, 18);
    }
  }
  // the hills shed new boulders, berry bushes reseed and gold veins surface slowly, so no resource can run out for good
  G.rockT = (G.rockT || 0) - dt;
  if (G.rockT <= 0) {
    G.rockT = 24;
    const rocks = nodes.filter(n => n.type === 'stone').length, berries = nodes.filter(n => n.type === 'food').length, veins = nodes.filter(n => n.type === 'gold').length;
    const spot = (pred) => { for (let k = 0; k < 40; k++) { const i = rint(3, MAP - 4), j = rint(3, MAP - 4); if (pred(i, j) && !occ[i][j] && !nodeAt[i][j] && tileDist(i, j) > 5 && reachAt(i, j)) return [i, j]; } return null; };
    if (rocks < 26 + 6 * TL('quarrying')) { const s = spot((i, j) => kind[i][j] === 'h' || (kind[i][j] === 'g' && tileDist(i, j) > 12)); if (s) { addNode('stone', s[0], s[1], 40); puff(s[0], 0.4, s[1], 0xb1b7bd, 6, 1.2, 0.5, 0.1); } }
    if (berries < 14) { const s = spot((i, j) => kind[i][j] === 'g'); if (s) addNode('food', s[0], s[1], 20); }
    if (veins < 8 && Math.random() < 0.5) { const s = spot((i, j) => kind[i][j] === 'h' || (kind[i][j] === 'g' && tileDist(i, j) > 14)); if (s) addNode('gold', s[0], s[1], 40); }
  }
  // waves
  if (G.t >= G.nextWave) startWave();
  while (G.spawnQ.length && G.spawnQ[0].t <= G.t) { const s = G.spawnQ.shift(); const e = makeEnemy(s.kind, s.x, s.z, s.mult); puff(e.x, 0.5, e.z, 0xe8654f, 6, 1.5, 0.5, 0.12); }
  for (let k = G.markers.length - 1; k >= 0; k--) if (G.t > G.markers[k].until) { scene.remove(G.markers[k].mk); G.markers.splice(k, 1); }
  // actors
  assignRally();
  for (const u of units) if (!u.dead) { if (u.role === 'worker') updateWorker(u, dt); else updateSoldier(u, dt); }
  for (const e of enemies) if (!e.dead) updateEnemy(e, dt);
  for (const o of units) if (!o.dead) watchdog(o, dt);
  freezeGuard(dt);
  for (const e of enemies) if (!e.dead) watchdog(e, dt);
  healSystem(dt);
  if (G.selU.length) G.selU = G.selU.filter(u => !u.dead);
  // separation
  const all = units.concat(enemies).filter(o => !o.dead);
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) {
    const p = all[a], q = all[b], dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz);
    if (p.fly || q.fly) continue;
    if (d < 0.42 && d > 0.001) {
      const push = (0.42 - d) * 0.35, ux = dx / d * push, uz = dz / d * push;
      if (!blockedAt(p.x - ux, p.z - uz, p.team, null)) { p.x -= ux; p.z -= uz; }
      if (!blockedAt(q.x + ux, q.z + uz, q.team, null)) { q.x += ux; q.z += uz; }
    }
  }
  updateShots(dt); updateParts(dt); updateShakes(dt);
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
  if (!G.over && !G.endless && G.wave >= TOTAL_WAVES && !G.spawnQ.length && !enemies.some(e => !e.dead)) endGame(true);
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
  Object.assign(G, { res: { wood: 140, stone: 30, food: 100, gold: 20 }, age: 0, t: 0, wave: 0, nextWave: (DIFF[G.diff] || DIFF.normal).first, over: false, endless: false, smith: 0, tech: {}, threat: rnd(0, 6.28), spawnQ: [], markers: [], slot: 0, birthT: 6, treeT: 6, kills: 0, sel: null, build: null, selU: [], cmd: null });
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
  orbital: o => { noise(o, 0.5, 0.5, 'lowpass', 900, 200); tone(o, 70, 0.5, 'sawtooth', 0.25, 0, 30); },
  quantum: o => { tone(o, 980, 0.18, 'triangle', 0.08, 0, 1600); tone(o, 1400, 0.12, 'sine', 0.05, 0.04, 2200); },
  laser: o => { tone(o, 1400, 0.14, 'sine', 0.07, 0, 300); tone(o, 2200, 0.1, 'triangle', 0.04, 0.02, 500); },
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
const SFX_GAP = { arrow: 0.06, hit: 0.05, bash: 0.08, coin: 0.25, chop: 0.14, clink: 0.14, hammer: 0.18, die: 0.05, dieFriend: 0.1, bolt: 0.1, stone: 0.08, bullet: 0.06, laser: 0.05, orbital: 0.3, quantum: 0.05, place: 0.05, spawn: 0.1, click: 0.03, done: 0.1, heal: 0.6, ability: 0.1 };
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
  cam.dist = clamp(cam.dist, 10, 95); cam.pitch = clamp(cam.pitch, 0.3, 1.35);
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
  chief: 'Bear Warlord, the boss of the raid. Focus every tower and defender on it.',
  direwolf: 'Dire Wolf: bigger, faster and meaner. Turrets and lancers deal with it best.',
  troll: 'Troll: a walking siege engine with enormous health. Bombards and knights, and keep settlers well away.',
  drake: 'Drake: flies straight over your walls. Towers and flying defenders bring it down.',
  juggernaut: 'Juggernaut: an endless-mode siege monster. Orbital strikes and starships, or it walks through the town.'
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
const TABS = [{ id: 'town', name: 'Town' }, { id: 'defense', name: 'Defense' }, { id: 'army', name: 'Army' }, { id: 'research', name: 'Research' }];
let curTab = 'town', cards = [];
const TECH_ICON = { farm: 'farm', tools: 'camp', carts: 'camp', forestry: 'sapling', quarrying: 'quarry', trade: 'market', housing: 'house', medicine: 'infirmary', automata: 'smith', armor: 'smith', drill: 'barracks', fletching: 'tower', veterans: 'barracks', banners: 'barracks', aero: 'skyport', walls: 'wall', siegecraft: 'ballista', watchfires: 'tower', repair: 'camp', masonry: 'quarry', beacon: 'laser', smith: 'smith', fusion: 'reactor', nano: 'nanoforge', quantumcore: 'quantum', stellar: 'starbeacon', targeting: 'orbital' };
function techIcon(id) { return iconSVG(TECH_ICON[id] || 'smith'); }
function renderDock() {
  $('tabs').innerHTML = TABS.map(t => `<button class="tab${t.id === curTab ? ' on' : ''}" data-tab="${t.id}">${t.name}</button>`).join('') + '<span class="hint" id="hint">Hover a card to see what it does</span>';
  const list = [];
  for (const k in BDEF) if (BDEF[k].cat === curTab) list.push({ kindOf: 'b', id: k, def: BDEF[k] });
  if (curTab === 'army') {
    for (const k in UDEF) if (k !== 'worker' && !UDEF[k].free) list.push({ kindOf: 'u', id: k, def: UDEF[k] });
  }
  if (curTab === 'research') {
    list.push({ kindOf: 'x', id: 'smith', def: { name: 'Sharpen Weapons', cost: SMITH_COST[0], age: 2, need: 'smith', group: 'Military', blurb: 'Every defender and tower hits 20% harder per level.', role: 'Military', what: 'Pays the smiths to sharpen every weapon in the valley.', help: 'Each level adds +20% damage to every defender and every tower, up to three levels. Needs a finished Blacksmith.', tip: 'Worth buying before every boss raid.', hp: 0 } });
    for (const t of TECHS) list.push({ kindOf: 'x', id: t.id, def: { name: t.name, cost: t.cost[0], age: t.age, need: t.need, group: t.group, blurb: t.what, role: t.group + ' · ' + t.role, what: t.what, help: t.help + (t.need ? ` Needs a ${BDEF[t.need].name}.` : ''), tip: t.tip, hp: 0 } });
    list.sort((a, b) => (a.def.group > b.def.group ? 1 : a.def.group < b.def.group ? -1 : 0) || a.def.age - b.def.age);
  }
  const box2 = $('cards');
  box2.innerHTML = '';
  cards = list.map(it => {
    const el = document.createElement('button');
    el.className = 'card';
    el.innerHTML = `<div class="ic">${it.kindOf === 'u' ? unitIconSVG(it.def.sp) : it.kindOf === 'x' ? techIcon(it.id) : iconSVG(it.id)}</div><div class="nm">${it.def.name}</div><div class="cs">${costHTML(it.def.cost)}</div><span class="lk"></span>`;
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
    if (G.build) toast(d.wall || d.plant ? `${d.name}: click or drag to place` : `${d.name}: click the ground to build`);
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
      else { const t = TECHS.find(x => x.id === c.it.id), lv = TL(t.id); cost = techCostAt(t, Math.min(lv, t.max - 1)); lock = lv >= t.max ? 'Max' : `Lv ${lv + 1}/${t.max}`; }
    }
    if (d.age !== undefined && G.age < d.age) lock = AGES[d.age].name.split(' ')[0];
    else if (c.it.kindOf === 'x' && d.need && !buildings.some(b => b.type === d.need && b.done)) lock = 'Needs ' + BDEF[d.need].name.split(' ')[0];
    if (c.it.kindOf === 'b') sel = G.build === c.it.id;
    const poor = Object.keys(cost).map(k => (G.res[k] >= cost[k] ? 1 : 0)).join('');
    const sig = [lock, sel, poor, Object.keys(cost).map(k => cost[k]).join()].join('|');
    if (!force && sig === c.sig) continue;
    c.sig = sig;
    c.el.classList.toggle('locked', !!(d.age !== undefined && G.age < d.age) || (c.it.kindOf === 'x' && !!d.need && !buildings.some(b => b.type === d.need && b.done)));
    c.el.classList.toggle('sel', sel);
    c.el.querySelector('.lk').textContent = lock;
    if (c.it.kindOf === 'x' || d.wall || d.plant) c.el.querySelector('.cs').innerHTML = costHTML(cost);
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
  if (G.age >= AGES.length - 1) { ab.disabled = true; setText('ageBtn', 'Max age'); $('ageCost').innerHTML = ''; }
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
    if (def && (def.wall || def.plant) && e.button === 0 && !G.over) { painting = true; lastPaint = ''; paint(e.clientX, e.clientY); }
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
    ? `Twenty-five raids broke against your walls. You reached the ${AGES[G.age].name} and defeated ${G.kills} raiders.`
    : `The clan held out for ${G.wave > 0 ? G.wave - 1 : 0} raids and defeated ${G.kills} raiders in the ${AGES[G.age].name}.`;
  $('endScreen').classList.add('on'); $('endlessBtn').style.display = win ? '' : 'none';
  sfx(win ? 'win' : 'lose');
}
$('startBtn').addEventListener('click', () => { audioInit(); sfx('click'); $('intro').classList.remove('on'); G.paused = false; });
$('endlessBtn').addEventListener('click', () => { $('endScreen').classList.remove('on'); G.over = false; G.paused = false; G.endless = true; G.nextWave = G.t + 45; toast('Endless mode: the raids keep coming and keep growing. Reach for the stars'); sfx('click'); });
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
    const sp = b.group.userData.spin;
    if (sp) for (let i = 0; i < sp.length; i++) { sp[i].rotation.y = now / (b.type === 'skyport' ? 120 : 900); if (b.type === 'skyport') sp[i].position.y = 0.9 + Math.sin(now / 500 + b.id) * 0.12; }
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
    res: Object.assign({ wood: 0, stone: 0, food: 0, gold: 0 }, g.res), age: g.age, t: g.t, wave: g.wave, nextWave: g.nextWave < 0 ? Infinity : g.nextWave, over: false, endless: !!g.endless, smith: g.smith, tech: Object.assign({}, g.tech || {}), diff: DIFF[g.diff] ? g.diff : 'normal', threat: g.threat,
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
  modalEl.classList.add('on'); renderSaveModal();
  { const d = diagReport(); $('diagText').textContent = `v${d.version} (${d.build}) · ${d.fps} fps · ${d.settlers} settlers, ${d.defenders} defenders, ${d.raiders} raiders · frozen animals reset: ${d.frozenResets}\n` + Object.entries(d.states).map(([k, v]) => `${k}: ${v}`).join(', '); }
}
function closeSaveModal(loaded) {
  modalEl.classList.remove('on');
  if (!loaded) G.paused = modalWasPaused || $('intro').classList.contains('on');
}
$('btnSave').addEventListener('click', () => { sfx('click'); openSaveModal(); });
$('saveClose').addEventListener('click', () => closeSaveModal(false));
$('menuResume').addEventListener('click', () => closeSaveModal(false));
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
  const t = now * 0.0011;
  for (let k = 0; k < FX.waterIdx.length; k++) {
    const q = FX.waterIdx[k], i = (q / MAP) | 0, j = q % MAP;
    const f = 1 + 0.045 * Math.sin(t + i * 0.7 + j * 0.5) + 0.025 * Math.sin(t * 1.6 - i * 0.4 + j * 0.9);
    fxC.copy(FX.waterBase[k]).multiplyScalar(f * (1 - ENV.sw[3] * 0.6) + ENV.sw[3] * 0.6);
    terrain.setColorAt(q, fxC);
  }
  terrain.instanceColor.needsUpdate = true;
}

/* Skyward Age traffic: a few airships and a courier drone cruise above the town once the clan reaches the clouds */
const SHIPS = [];
function makeAirship(k) {
  const g = new THREE.Group();
  if (k % 3 === 2) {   // courier drone
    box(g, -0.18, 0, -0.18, 0.36, 0.14, 0.36, 0xdfe6f0); box(g, -0.42, 0.14, -0.03, 0.84, 0.03, 0.06, 0x3b4a5a); box(g, -0.03, 0.14, -0.42, 0.06, 0.03, 0.84, 0x3b4a5a);
    box(g, -0.06, -0.1, -0.06, 0.12, 0.1, 0.12, 0x5cf0ff, LAMP);
  } else {
    box(g, -0.5, 0, -1.2, 1.0, 0.5, 2.4, k % 3 ? 0xdfe6f0 : 0x2cc4d8); box(g, -0.36, 0.1, -1.35, 0.72, 0.3, 0.2, 0x3b4a5a);
    box(g, -0.22, -0.3, -0.5, 0.44, 0.3, 1.0, 0x3b4a5a); box(g, -0.2, -0.26, -0.45, 0.4, 0.08, 0.9, 0xbfe3f2, LAMP);
    box(g, -0.6, 0.15, 0.9, 0.1, 0.35, 0.4, 0x7fe0ff, LAMP); box(g, 0.5, 0.15, 0.9, 0.1, 0.35, 0.4, 0x7fe0ff, LAMP);
  }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; } });
  scene.add(g);
  return { g, r: 9 + k * 4.5, h: 6 + k * 1.2, ph: k * 2.1, sp: (k % 3 === 2 ? 0.5 : 0.17) * (k % 2 ? 1 : -1) };
}
function updateAirships(now) {
  const want = G.age >= 6 ? 3 : 0;
  while (SHIPS.length < want) SHIPS.push(makeAirship(SHIPS.length));
  while (SHIPS.length > want) scene.remove(SHIPS.pop().g);
  const t = now * 0.001;
  for (const s of SHIPS) {
    const a = s.ph + t * s.sp, x = KX + Math.cos(a) * s.r, z = KZ + Math.sin(a) * s.r;
    s.g.position.set(x, s.h + Math.sin(t * 0.7 + s.ph) * 0.3, z);
    s.g.rotation.y = -a + (s.sp > 0 ? 0 : Math.PI);
  }
}
function updateFx(dt, now) {
  updateAirships(now);
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
  updateWater(now);   // every frame: a stepped update reads as flicker
}
