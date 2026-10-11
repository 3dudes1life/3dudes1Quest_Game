# 3Dudes1Quest 3.4 — Three-World Master Release

A browser platform adventure starring Will, Daniel, Caleb, Rigsby, and Zoey. Restore Southern California, protect Lake Tahoe, and restore Alaska’s aurora. Three adventures are playable; Costa Rica and Hawaii are Coming Soon.

## Play and develop

Serve this repository with a static HTTP server (for example `python3 -m http.server 8000`), then open `http://localhost:8000`. HTTPS or localhost is required for offline installation.

- Move: A/D or left/right arrows. Jump: W/up arrow.
- Power: Space/X/F. Switch: 1/2/3. Pause: Escape/P.
- SoCal Triangle Power: Q when charged. Mobile controls support simultaneous touches.
- Short taps are buffered. Release jump early for a shorter jump.
- Leaving the app or rotating the device pauses play. Resume explicitly when ready.

## 3.4 three-world release

Original artwork now renders at 1280 × 720 on desktop and 640 × 360 on touch screens, with nearest-neighbor sprites and original colors. The restrictive 320 × 180 / 40-color pipeline is retired. SoCal and Tahoe retain their physics, content and saves, with clearer platforms and forest detail.

The shared cast has new world-specific outfits and animations, with Will bald throughout. SoCal adds Walking Flaming Laws and a three-phase Supreme Court encounter before the Queen of Beige. Tahoe adds interruptible Forest Drain, protected trees, flyers and giant larvae, followed by forest restoration.

Adventure 3, **Alaska: The Aurora Return**, adds four trail sections, three Aurora Relays, twelve optional shards, two hidden caches, snow gusts, shelter checkpoints, zombie salmon, the three-phase Frost Queen and a complete ending. All dudes and companions share the existing controls, powers, audio settings and PWA infrastructure. Tahoe's portal now enters playable Alaska.

See [the 3.4 release report](docs/RELEASE-3.4.md) for rendering comparisons, architecture, gameplay/testing evidence and device/listening limits; [Alaska design](docs/ALASKA-DESIGN.md) records the storyline and encounters. Run `npm test` and `npm run test:browser`; screenshots, signal reports and WAV previews are saved in `test-results` and uploaded by CI.

## 3.3 original audio release

Both adventures now share original title, world, boss, and victory chiptunes, a defeat cue, and 26 event effects. Open **Sound settings** on the title or pause screen for music/effects toggles, separate volumes, and master mute. Audio starts only after interaction, pauses safely, and works offline. The 3.2 artwork, pixel grid, physics, saves, and journey remain intact.

This release also fixes Space activation on pause-menu buttons, adds enemy/boss warnings and coordinated damage flashes, and clarifies first-time controls and checkpoints. See [the 3.3 release report](docs/RELEASE-3.3.md) for the gameplay audit, music/effect list, architecture, automated checks, and remaining listening/device checks. No human listening or physical-device verification is claimed.

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

## 3.2 retro gameplay release

The 3.2 branch starts from verified, deployed 3.1 (`2bd2c3932d66526fa141b4de2176e0b5bcc6b429`). The engine, 1280 × 720 physics world, collision boxes, existing character artwork, abilities, enemies, bosses, collectibles, and save formats remain in place.

- **Both adventures:** `js/core/quest-retro.js` renders the original content on a 320 × 180 grid, maps it to one authored 40-color palette, and presents exact 4 × 4 nearest-neighbor blocks on the logical canvas. Shared character rendering fixes inconsistent scaling and damage flashes. Rainbow Ricochet has block trails and bounce marks; Heartfield Burst has a segmented ring and pixel hearts; Cookie Toss has chocolate chips and a blinking fuse. Combat damage, cooldowns, jump strengths, and maximum speeds are preserved.
- **Movement:** faster direction reversal, predictable stopping, and one shared camera follow rule. Existing variable-height jumps, buffered input, coyote time, and swept platform landing remain. Partial input objects no longer produce a NaN direction. SoCal rejects repeated damage during invulnerability.
- **Southern California:** simpler sky bands and evenly lit scenes, clearer platform edges, stepped collectible bobbing, smaller zone announcements, and the same power rendering as Tahoe. Six Gay Cards, three Prism Beacons, Queen of Beige, Rigsby, Zoey, and the rescue/portal sequence remain. Portal completion cannot advance while paused.
- **Lake Tahoe:** matching palette and HUD, clearer platform edges and collectibles, reduced screen flashes, a 350 ms warning before the Queen charges, checkpoint camera reset, and objective text that distinguishes the original trail beetles from spawned minions. Weather, four nests, six memories, companions, boss phases, and the Alaska teaser remain.
- **Connected journey:** `js/core/quest-journey.js` provides one five-world route in title/pause menus and durable completion badges. Only SoCal and Tahoe have playable links. Alaska, Costa Rica, and Hawaii are marked coming later. Existing completed saves populate badges without rewriting campaign saves.
- **Menus:** `css/retro320.css` supplies squared panels, plain colors, monospaced labels, and consistent HUD styling while retaining 3.1 viewport geometry, scrollable menus, adjustable controls, and handedness preferences. Original source artwork is retained; no Nintendo assets or music are introduced.

### 3.2 verification

Ten unit tests cover timing at 30/60/120 Hz, actual movement distance, reversal/stopping, distinct character jumps, tap versus held jumps, landing from above, rising through one-way platforms, jump buffering, camera bounds, pause timing, and backup saves. Browser tests exercise keyboard and touch input, all powers defeating enemies, boss progression, save/reload, checkpoints, collectibles, damage protection, SoCal→Tahoe→Alaska transitions, and offline Tahoe startup. The full 3.1 landscape suite remains enabled.

`tests/retro.cjs` loads genuine 3.1 save fixtures, checks the displayed pixel grid and palette, renders every power in both worlds, checks pause-safe progression and the Queen's charge warning, and captures screenshots under `test-results/retro`. Layout/boss/menu captures remain under `test-results/landscape`. GitHub Actions retains both directories in its gameplay-screenshots artifact. See `tests/fixtures/README.md` for fixture provenance.

This is an NES-inspired presentation, not a hardware-accurate NES emulator. Fractional CSS scaling can produce uneven pixel widths on some screen sizes, but interpolation is disabled and sprites keep their aspect ratio. Palette conversion adds a small per-frame canvas readback; actual low-end phone performance still needs measurement. Automated boss scenarios are not a complete human campaign playthrough. No physical iPhone Safari or Android Chrome certification is claimed; the device checklist below still applies.

## 3.1 mobile landscape release

`js/core/quest-viewport.js` is the only viewport geometry owner for both active adventures. `css/viewport310.css` supplies the shared HUD, safe viewport, thumb gutters, and scrollable panels. It uses visualViewport dimensions/offsets with window fallback, safe-area env values, resize/orientation/fullscreen events, and installed display mode. The logical game and camera remain 1280 × 720. Side gutters in touch landscape preserve a larger world view while keeping controls off the canvas.

Rotation suspends the simulation, saves, clears all input, and makes the game inert behind a Continue dialog. Continue restores the previous paused/playing state without closing the player's menu or dialogue. Toolbar-only height changes relayout without interrupting play. In the pause menu, choose Small/Standard/Large controls or put movement on the right. Preferences are shared between adventures and tolerate unavailable storage. Full objective descriptions remain in the pause menu.

The audit traced `index.html` and `tahoe.html` and their script/style imports. Historical `app108*` and `tahoe2*` runtimes are inactive and were not edited. Superseded 1.0.8W and Safari canvas geometry was removed from active SoCal CSS; duplicate control-lock sheets are no longer loaded. A missing closing brace in Tahoe's 760px media query was repaired. Broad Safari touch cancellation was removed so menus can scroll; gameplay buttons still use pointer capture and touch-action:none. Artwork and all save keys/schemas remain unchanged.

### Verification and remaining device checks

The browser suite adds iPhone-sized touch viewports 844×390, 852×393, 932×430, and 740×280; 852×280 toolbar constraints; Android-sized 915×412; portrait/landscape rotation during three simultaneous real Chromium touch contacts; menu/dialogue rotation; minimum target sizes, hit testing, canvas/UI overlap checks; simulated notch insets; settings persistence; boss/completion screenshots. Existing combat, collectibles, save recovery, boss/portal and offline tests still run. Screenshots are written to `test-results/landscape` and retained as CI artifacts.

This is browser emulation, **not physical-device verification**. Before device-level signoff, test iPhone Safari and installed Home Screen mode (notch/Dynamic Island, expanding/collapsing bars, app switching, both landscape directions), and Android Chrome/PWA (gesture navigation, fullscreen entry/exit, rotation lock, multitouch while rotating). Check 280px-high views for comfortable sprite readability; all world geometry is preserved, so exceptionally short screens necessarily render smaller. Also test VoiceOver/TalkBack and external keyboards on actual devices. Automated boss tests use controlled scenarios rather than a complete human campaign playthrough.
