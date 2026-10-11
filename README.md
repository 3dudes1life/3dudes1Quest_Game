# 3Dudes1Quest 3.1 — Mobile Landscape Rescue

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

## 3.1 mobile landscape release

`js/core/quest-viewport.js` is the only viewport geometry owner for both active adventures. `css/viewport310.css` supplies the shared HUD, safe viewport, thumb gutters, and scrollable panels. It uses visualViewport dimensions/offsets with window fallback, safe-area env values, resize/orientation/fullscreen events, and installed display mode. The logical game and camera remain 1280 × 720. Side gutters in touch landscape preserve a larger world view while keeping controls off the canvas.

Rotation suspends the simulation, saves, clears all input, and makes the game inert behind a Continue dialog. Continue restores the previous paused/playing state without closing the player's menu or dialogue. Toolbar-only height changes relayout without interrupting play. In the pause menu, choose Small/Standard/Large controls or put movement on the right. Preferences are shared between adventures and tolerate unavailable storage. Full objective descriptions remain in the pause menu.

The audit traced `index.html` and `tahoe.html` and their script/style imports. Historical `app108*` and `tahoe2*` runtimes are inactive and were not edited. Superseded 1.0.8W and Safari canvas geometry was removed from active SoCal CSS; duplicate control-lock sheets are no longer loaded. A missing closing brace in Tahoe's 760px media query was repaired. Broad Safari touch cancellation was removed so menus can scroll; gameplay buttons still use pointer capture and touch-action:none. Artwork and all save keys/schemas remain unchanged.

### Verification and remaining device checks

The browser suite adds iPhone-sized touch viewports 844×390, 852×393, 932×430, and 740×280; 852×280 toolbar constraints; Android-sized 915×412; portrait/landscape rotation during three simultaneous real Chromium touch contacts; menu/dialogue rotation; minimum target sizes, hit testing, canvas/UI overlap checks; simulated notch insets; settings persistence; boss/completion screenshots. Existing combat, collectibles, save recovery, boss/portal and offline tests still run. Screenshots are written to `test-results/landscape` and retained as CI artifacts.

This is browser emulation, **not physical-device verification**. Before device-level signoff, test iPhone Safari and installed Home Screen mode (notch/Dynamic Island, expanding/collapsing bars, app switching, both landscape directions), and Android Chrome/PWA (gesture navigation, fullscreen entry/exit, rotation lock, multitouch while rotating). Check 280px-high views for comfortable sprite readability; all world geometry is preserved, so exceptionally short screens necessarily render smaller. Also test VoiceOver/TalkBack and external keyboards on actual devices. Automated boss tests use controlled scenarios rather than a complete human campaign playthrough.
