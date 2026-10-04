# Changelog

## 2.0.0
- Research tab with a 30-technology tree in four lines: Economy (Crop Rotation, Sturdy Tools, Hand Carts, Forestry, Deep Quarrying, Trade Routes, Attic Rooms, Herbal Medicine, Automatons, Fusion Lattice), Military (Sharpen Weapons, Tempered Armor, Drill Yard, Fletching, Veteran Training, War Banners, Aeronautics, Nanite Blood, Quantum Cores, Stellar Forge) and Defense (Reinforced Walls, Siegecraft, Watchfires, Rapid Repair, Masonry, Beacon Network, Orbital Targeting). Each has an age gate, often a building it needs, and one to three levels; effects apply to what you already have.
- Five ages beyond Skyward: Fusion (Fusion Reactor: free gold, stone and food; Panda Mech with Shockwave), Orbital (Orbital Beacon: strikes from the sky; Bear Dropship with Payload), Nanotech (Nanoforge: heals animals and mends buildings in reach; Nano Swarm with Disassemble), Quantum (Quantum Spire: entangled bolts hit three raiders; Quantum Warden that blinks with Phase Shift) and Stellar (Star Beacon: builds free Fighter Drones; Fox Starship with Nova). Twelve ages in all, walls to 6000 hp, each with its own palette.
- Endless mode: after the 25th raid the victory screen offers Keep playing; raids continue and keep growing, with Drakes (flying, from raid 22) and Juggernauts (4200 hp, from raid 26). Needed to actually reach the far ages.
- More sky traffic as the ages advance, winged drakes, hovering vehicles for every flying unit.

## 1.9.0
- Map is four times larger (88x88): more forests, lakes and hills to expand into. Raids still muster about 21 tiles from the Hall, the sun and its shadows follow the camera, and you can zoom out further.
- Skyward Age, a seventh age after Clockwork: white composite and cyan glass, glowing barrier walls (1850 hp), Skyscrapers (2x2, house 12, windows lit at night), Laser Towers (a beam every 0.6 s at 10 tiles), the Sky Port and Sky Skiffs: flying fox gunships that cross walls, water and crowds, with the level 3 ability Strafing Run. Airships and a courier drone cruise over a Skyward town.
- Restoring resources: Plant Saplings (12 food) and Berry Beds (10 wood, 6 food) in the Town tab, drag to plant rows; they grow into trees worth 30 wood and bushes worth 24 berries. Together with regrowth and building incomes, nothing can run out for good.
- Gathering animations: settlers swing an axe or pick, trees and rocks shake when struck, leaves and sparks fly, and new plantings sprout.
- Defenders no longer freeze at rally points: rally spots are assigned to living defenders (not a lifetime counter), a defender boxed in near its spot accepts it, and one that cannot reach its spot tries a neighbouring one instead of standing still. In the full campaign test this took freeze resets from 77 to 0.
- Water shimmer is now continuous instead of stepping (which flickered).
- Fix: a resource node removed while a settler walked to it was still gathered from.
- A test suite in tests/ (npm test): economy, raids, stuck-unit stress, pocket and trap rules, save round trips, UI, performance, and scripted campaigns on every difficulty, including a full 25-raid run through all seven ages.

## 1.8.1
- Fix: settlers you had once sent to a tree, rock or bush kept that preference for the rest of the game, so they could chop wood forever while stone sat at zero. The preference now lasts 90 seconds and is dropped as soon as that resource is plentiful.
- No resource can run out for good: the hills shed new boulders (up to 26 rocks), berry bushes reseed and gold veins surface slowly, always in reachable spots. The Quarry now also digs 0.12 stone a second on its own.

## 1.8.0
- Two new ages after Gunpowder: the Imperial Age (marble and crimson) and the Clockwork Age (iron, copper and brass). Walls, the Hall and every building take on the new look, and walls reach 1050 and 1400 hp.
- New defenses: Bombard Tower (Imperial, 115 area damage at 11 tiles, slow) and Clockwork Turret (Clockwork, a shot every 0.4 s at 8 tiles).
- New defenders: Elk Lancer (Imperial, fast shock cavalry; level 3 Stampede charges and shoves raiders) and Owl Sage (Clockwork, long-range bolts; level 3 Hoot of Courage heals defenders nearby by 30%).
- Raids now run to 25. Dire Wolves join from raid 9, Trolls (1500 hp siege giants) from raid 14 and in every boss raid from 20. A boss every fifth raid.

## 1.7.2
- Freeze guard: any animal that wants to be somewhere but has not moved for 6 seconds is reset on the spot (job released, path and bans cleared, nudged to a free tile) with a small puff, whatever the cause. Each reset is logged.
- Diagnostics in the Menu: version, frame rate, what every animal is doing, how many freeze resets happened and why, with a Copy button to send to the developer.
- Fix: Elite animals kept their larger size for only one frame.

## 1.7.1
- Update hint (installed app and website): when a new build has been fetched behind the running game, a bar offers "Reload now" (the game autosaves first) or "Later", naming the new version. The app checks for updates on load, whenever you return to it and every 20 minutes. A live version.json is published with each build.

## 1.7.0
- Settlers always find work. Jobs (trees, rocks, berries, gold, building sites, repairs, drop-offs) are only chosen when they are reachable from the Great Hall, so nobody walks at a tree sealed off by buildings any more; the old 60-tile search limit is gone, so far forests are used; and any animal that ends up in a sealed pocket is stepped out of it. When nothing is left to gather or build, settlers go and tend Berry Farms (+0.3 food/s each, up to three per farm) instead of standing around. Trees regrow faster.
- Population chip in the top bar is now labelled "Pop", turns red when housing is full, and tapping it explains how population works and how to grow it.

## 1.6.1
- Phones no longer run the game in slow motion. The renderer was drawing at up to 2.5x resolution with a 4096 shadow map on every device, and on slow frames the simulation silently dropped time, so animals crawled or seemed to stand still. Render resolution is now capped by a pixel budget (lower on touch devices, 2048 shadows there), adapts down when frames get slow and back up when they are fast, and the simulation catches up after a slow frame so the game keeps real-time pace.

## 1.6.0
- Difficulty: Gentle, Normal and Hard, chosen on the start screen and changeable any time from the Menu (applies from the next raid). Hard is the old pace. Normal is now easier: the first raid comes at 2 minutes instead of 1.5, raids are 15% smaller and slightly weaker, with longer breaks. Gentle has 35% fewer raiders, 20% weaker, and up to 100 seconds between raids. Your choice is remembered and stored in saves.
- Tips: a "Tips for holding the valley" list in the Menu with nine practical pointers (housing, drop-offs, first defenders, walls and kill zones, boss raids, gold).

## 1.5.0
- Graphics: grass tufts, wildflowers and pebbles across the valley (hidden under buildings, flowers gone in winter), three tree shapes (round, pine, tall), chimney smoke from houses, the Hall and the Blacksmith, fireflies around the trees at night, rippling pond water and a soft vignette.
- Stuck units, two real causes fixed. Trained soldiers and newborn settlers could spawn inside a house built just below the Barracks or the Hall and never leave; spawn points now move to the nearest free spot and any animal standing inside a building is stepped out. And a raider chewing a building near the Hall used to pin every settler in flee mode for as long as it lived; settlers now only run from raiders that are close or hunting animals, run away from a raider at the Hall instead of toward it, and go back to work after 12 seconds of hiding. A raider that neither moves nor fights for 18 seconds slinks away so a raid cannot stall.

## 1.4.1
- Building placement can no longer trap your animals: a building that would cut any of them off from the Great Hall is refused with a message ("Leave a gap to walk through"), and the ghost shows red. Walls never count, because your animals walk through them.
- New 1x zoom reset button on the touch camera controls (key 0 on desktop). The reset-view button now also resets zoom.

## 1.4.0
- Palisade and Stone Wall are now one building, Wall, available from the start. It upgrades itself every age like towers do: wooden stakes, stone, battlements (Castle Age), reinforced stone with a gold band (Gunpowder Age). Existing walls are rebuilt stronger for free when you advance and keep their damage ratio.
- Wall cost and health follow your current age (6 wood, then 8, 10 and 12 stone; 110, 340, 520 and 760 hp).
- Old saves that contain palisades load as walls.

## 1.3.2
- New Game menu: the Save button is now Menu. It has Resume, New game (tap twice to confirm; saves are kept), the save slots, export and import, and a short phone how-to-play.
- Camera buttons on the right reworked to respond on touch down: tap for a step (zoom, 45 degree turn, tilt flip, reset) or press and hold for smooth continuous zoom, rotation and tilt.

## 1.3.1
- Fix: the Stop building button no longer overlaps the hint toast; toasts now sit above the button and the button text stays on one line.

## 1.3.0
- Mobile rotation reworked. Twisting two fingers now turns the map the way your fingers turn (it was backwards). Pinch-zoom and twist no longer fight each other: the gesture you start doing wins, with a small dead zone so a pinch never spins the map.
- New on-screen buttons: rotate left and right in 45 degree steps with smooth easing, a tilt toggle between a low and a high camera angle, and a reset-view button.

## 1.2.2
- A big "Stop building" button appears above the dock whenever a building is selected for placement, so build mode is easy to leave on touch screens.

## 1.2.1
- Mobile: bigger tap area for selecting animals, more forgiving tap versus drag detection, momentum when you flick-pan, two-finger drag to pan while pinching, and on-screen + / - zoom buttons.

## 1.2.0
- Technology: three new researchable upgrades in the Army tab. Tempered Armor (+15% defender health per level), Crop Rotation (+25% farm food per level) and Sturdy Tools (settlers carry +2 per level).
- Unit advancement: any animal that reaches level 5 can be promoted to Elite (+35% health, +30% damage, gold crown badge). Elite settlers carry 3 more.
- Mobile: a close button on the info panel, and tapping the selected animal again deselects it.
- Fix: loaded animals now keep their level stats.

## 1.1.1
- Autosave now runs every 15 seconds and no longer depends on browser storage: saves are also kept in memory and, in the claude.ai artifact, in its private per-user database, so Continue works after a reload even when localStorage is blocked.

## 1.1.0
- Save and load: three manual slots plus a 20-second autosave, with export and import of save files. A Continue button appears on the start screen.
- Version number shown on the start screen and in the save menu; saves record the version that made them.
- Seasons, sunrise-to-night day cycle, mobile layout, compact mobile tooltips, level-ups, unit orders, healing, hover explanations.

## 1.0.0
- First release: voxel town builder, four ages, raids, A* pathfinding, weather, synthesized audio, PWA.
