# Changelog

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
