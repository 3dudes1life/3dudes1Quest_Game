# 3Dudes1Quest 3.0 — Smooth Adventure

A browser platform adventure starring Will, Daniel, Caleb, Rigsby, and Zoey. Restore Southern California, protect Lake Tahoe, and discover the Alaska teaser.

## Play and develop

Serve this repository with a static HTTP server (for example `python3 -m http.server 8000`), then open `http://localhost:8000`. HTTPS or localhost is required for offline installation.

- Move: A/D or left/right arrows. Jump: W/up arrow.
- Power: Space/X/F. Switch: 1/2/3. Pause: Escape/P.
- SoCal Triangle Power: Q when charged. Mobile controls support simultaneous touches.
- Short taps are buffered. Release jump early for a shorter jump.
- Leaving the app or rotating the device pauses play. Resume explicitly when ready.

## Stability update

Both adventures now use `js/core/quest-runtime.js` for a fixed 60 Hz simulation, shared player movement, collision landing checks, input handling, and backup save storage. Rendering remains independent of simulation rate. Existing character sprites, world art, powers, and legacy save keys are preserved.

SoCal saves collectible and zone milestones immediately. Tahoe now saves spawned enemies and secret crystals as well as nests, memories, score, and boss progress, and restores a safe checkpoint. Both adventures save on pause/background transitions. Restart clears current and backup saves.

Character loading gates play and supports retry. The offline app installs a complete release before activation. Updates wait for the player to tap **UPDATE READY** on the title/pause screen; active adventures are paused and saved first. Sharing controls no longer cover gameplay controls on mobile.

## Tests

Node 20+ is required for the development tests; Node 24 is used in CI.

```sh
npm install
npx playwright install chromium
npm test
npm run test:browser
```

`CHROME_PATH` can select an existing Chrome executable. Browser tests serve their own local HTTP server and exercise desktop and mobile layouts, key/touch handling, all three powers against enemies, pause, save/reload, death, boss/portal scenarios, and offline startup. Unit tests compare movement at 30/60/120 Hz and check collision, jump buffering, and save recovery. GitHub Actions runs these checks on pushes and pull requests.

The boss scenarios use controlled game state to cover transitions quickly; they are not full human playthroughs. Physical iPhone/Safari and Android testing remains useful before calling a release fully device-verified.

## Active files

- `index.html` → `js/app109.js` (SoCal)
- `tahoe.html` → `js/tahoe253.js` (Tahoe)
- `js/core/quest-core.js` → shared cast, projectile definitions, and rendering helpers
- `js/core/quest-runtime.js` → shared timing, controls, movement, and persistence
- `alaska.html` → Adventure 3 coming-soon destination

Historical runtime files remain in the repository for reference; the HTML entrypoints above determine what players run.
