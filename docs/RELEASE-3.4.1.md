# 3Dudes1Quest 3.4.1 — Character Identity & Signature Powers

## Baseline and release gate

Verified 3.4.0 baseline: `c455779aec2a373c78ecc16b60a53ceda069e6c3`, merged in PR #6. Local tests, PR CI run 38162035263, main CI run 38162373305 and Pages deployment run 38162373554 passed. Deployed bytes matched the release, and desktop/emulated-touch movement, powers, audio and rotation resumption passed in all three adventures. Rollback: `codex/rollback-3-4-0`.

3.4.1 is a separate release candidate on `codex/character-identity-3-4-1`. Owner approval of these generated production visuals is required before merge/deployment; approval of reference PNGs is not assumed to approve the resulting runtime assets. Costa Rica remains Coming Soon.

## Characters and animation

[CHARACTER-ART-3.4.1.md](CHARACTER-ART-3.4.1.md) records source files, references, layout and limitations. Three new RGBA authoring sheets contain twelve poses per character per world. The shared loader builds idle, walk, run, jump, fall, attack, hurt, victory and back-facing strips with safe alpha gutters, common foot baselines and unclipped margins. Wide attacks remain inside their frames. Attack animation advances from each attack's start time, preserving the original attack duration and cooldown. Back-facing art is available to the renderer and review package; ordinary platforming keeps left/right facing.

Will is bald, wears sunglasses and DJ headphones, and uses a navy/cyan/purple music outfit. Daniel has short styled dark hair, trimmed facial hair, sunglasses and a blue jacket with heart details. The newest Caleb reference supersedes the earlier sheet: he is an adult man in his forties with short facial hair, sunglasses, rainbow mullet, unicorn hoodie, colorful accessories and distinct casual/mountain/winter variants. The correction affected Caleb's assets/reference only; it did not redirect Will or Daniel's designs.

Character selection, dialogue portraits and compact HUD images use the same world-specific artwork. Pixels use nearest-neighbor rendering and the same 126 × 126 destination box. Player hitboxes, movement stats, saves, camera and viewport geometry remain unchanged.

## Powers and audio

Will's public identity is DJ Soundwave: cyan/purple pixel arcs and music notes point with the projectile's actual direction, including ricochets. The internal `rainbow` projectile identifier remains compatible with existing targeting, collision, damage, speed, lifetime, ricochets and cooldowns. Old Rainbow Ricochet labels are removed from active UI/runtime text. The existing ricochet effect is adapted into an original short musical two-voice cue in the shared audio engine.

Daniel retains pink pixel hearts, homing/trapping/burst mechanics and original Heartfield audio. Caleb retains chocolate-chip Cookie Toss, adds direction-aware rainbow trails and small animated sparkles, and keeps the original launch/impact effects and bomb timing. No second audio graph, sampled tracks or new voice-limit exceptions. Seven music scores and thirty effects remain. Optional Bass Drop/Reiki specials are deferred to preserve balance and avoid introducing a new ability system. Existing SoCal Triangle Power is retained.

SoCal Court/Laws/Queen/Zoey, Tahoe Queen/Forest Drain/larvae/restoration, Alaska Frost Queen/salmon/weather/aurora and world transitions are preserved. Alaska's save key and schema stay unchanged. The 3.4.1 PWA cache includes the new sheets while retaining the 3.4 pet atlases and existing world assets.

## Modified files

- Production artwork: `assets/cast341/{will,daniel,caleb}.png`.
- Shared character/presentation/audio: `js/core/quest-cast.js`, `quest-core.js`, `quest-retro.js`, `quest-score.js`, `quest-adventure.js`.
- Entry/UI integration and metadata: `index.html`, `tahoe.html`, `alaska.html`, `js/app109.js`, `js/tahoe253.js`, `css/visual340.css`, `js/gold-master-self-test.js`, `js/pwa241.js`, `service-worker.js`, `package.json`, `README.md`.
- Validation: `tests/characters341.cjs`, `tests/browser.cjs`, `tests/runtime.test.cjs`, `tests/visual340.cjs`, `tests/fixtures/{socal,tahoe,alaska}-3.4.json`, `tests/fixtures/power-contract-3.4.json`, fixture README.
- Documentation: this report, artwork notes and `character-prompts-3.4.1.json`. The built-in image-generation prompt set is preserved verbatim.

## Automated coverage and review evidence

Fourteen unit tests include an exact comparison against 3.4 character movement stats and all six left/right projectile entities plus the power contract. Separate assertions cover walking/running/rising/falling selection and windup-to-release attack timing. Existing runtime movement/collision/frame-rate/save/audio/world-route tests remain.

The full browser suite covers older 3.1/3.2/3.3 saves, mobile landscape sizes and three-touch rotation, pause/dialogue/completion, keyboard controls, powers, collectibles/checkpoints, audio gesture/settings/lifecycle/real rendered signals, all three boss systems and offline launch/audio. A complete normal-clock Alaska keyboard run reaches its relays, boss and ending. Court/Tahoe boss tests use controlled arena prerequisites followed by normal keyboard play; they are not full legacy campaign playthroughs.

New character checks inspect all 27 character/animation strips per world for nonempty frames, transparent margins and foot baselines; exercise all three characters in desktop and 844 × 390 landscape; assert HUD portrait visibility; capture each character; and defeat Flaming Laws with all three left-facing powers. Existing right-facing power/boss tests remain. Native save fixtures were captured using the deployed 3.4 runtime and restore Court completion, a lost Tahoe tree and a cleared Alaska relay. The older Tahoe save assertion now samples restored health atomically before gameplay ticks, avoiding an enemy-contact race.

Review files in `test-results/characters341`: each world's `*-animations.png` is a normal-gameplay-scale comparison, `*-portraits.png` shows faces, `*-powers.png` shows both projectile directions, and `*-{will,daniel,caleb}-{gameplay,mobile}.png` shows live rendering. CI uploads generated test-results in the gameplay-screenshots artifact. Local review also includes the three approved reference PNGs. Final source SHA and CI results are supplied with delivery.

## Remaining limits and recommendation

GO for review only when local tests and CI pass. NO-GO for deployment until the owner approves the generated character visuals.

Automated alpha/frame checks cannot determine whether a face appears the correct age or matches a photograph; the normal-scale and portrait images need owner review. Daniel's Reno photograph has not been provided/located, so the approved PNG is the current primary reference and photographic cross-check remains outstanding. Physical iPhone Safari and Android Chrome/PWA checks, long-session performance/battery measurements and human audio listening remain unverified. Browser emulation and headless Web Audio tests do not establish those results.

