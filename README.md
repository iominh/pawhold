# Pawhold

A 3D voxel medieval city-builder in the browser. A clan of foxes, pandas, rabbits and bears settles a valley, raises a town, walls it in and holds it against wolves, boars, raccoons and badger rams through four ages (Hamlet, Medieval Town, Castle Age, Gunpowder Age). Survive 15 raids to finish the chronicle.

Plain HTML + [Three.js r128](https://threejs.org/), no framework and no build step needed to run. Installable as a PWA and playable offline.

## Playing

| Action | How |
| --- | --- |
| Build | Pick a card in the dock, click the ground. Walls: drag to draw a line. Hover a card to see its role and how it helps. |
| Inspect | Hover any building or animal for a tooltip, or click it for the full panel. |
| Camera | Drag to pan, right-drag or Q/E to rotate, scroll or pinch to zoom, WASD/arrows to move. |
| Select animals | Click one, double-click for all of that kind, shift-drag to box select, or the **Army** button. |
| Command | Right-click ground to move, an enemy to attack, a tree/rock/site/damaged building to send settlers to work. Keys: `M` move, `T` attack-move, `H` hold, `X` stop, `F` ability, `Esc` deselect. |
| Levels | Defenders gain XP from kills and settlers from working. Defenders learn an ability at level 3 (Volley, Bamboo Guard, Cleave, Aimed Shot). |
| Healing | Animals heal slowly when out of combat, faster near the Great Hall, and quickly near a Healing Hut. Idle settlers repair damaged buildings for free once a raid ends. You can also pay to repair instantly from a building's panel. |
| Theme and weather | Follows your light/dark setting. Buttons cycle theme, weather (clear, cloudy, rain, storm, snow, fog) and sound. |

## Deploying on Vercel

The repository root is the static site, so no build is required.

1. Import `iominh/pawhold` in Vercel.
2. Framework preset: **Other**. Leave the build command empty and the output directory as the project root.
3. Deploy.

## Layout

```
index.html            PWA page (generated)
game.js               all game code (generated from src/)
sw.js                 service worker (generated, cache name changes each build)
manifest.webmanifest  PWA manifest
vendor/three.min.js   Three.js r128 (MIT)
icons/                app icons (regenerate with python3 src/mkicons.py, needs Pillow)
src/                  the editable sources: js1_core, js2_models, js3_sim, js5_env, js6_audio, js4_ui, head.html
```

After editing anything in `src/`, regenerate the deployable files:

```
npm run build:pwa
```

## Credits

Three.js is MIT licensed, see `vendor/THREE-LICENSE`. All sound is synthesized live with the Web Audio API.
