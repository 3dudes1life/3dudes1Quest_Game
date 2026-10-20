# Six-boss master build — partial development checkpoint

**NO-GO for deployment. Not a complete six-boss release candidate.** This checkpoint uses the brief's explicit allowance to preserve verified work on a development branch when the full scope cannot safely be completed in one run. Nothing from this branch has been merged or deployed. Final artwork approval has not been requested because required gameplay and animations remain unfinished.

## Baseline and rollback

Exact main baseline: `39c8d2f4a46420fb2e925bc41fca45c1d846520f` (Origin Story merge, PR11). Main stability run39342695666 and Pages39342695567 succeeded. Eight fetched production HTML/runtime/release/worker files matched that commit. A fresh live production game completed the86-second origin cinematic, retained Caleb selection, handed off to SoCal and moved220logicalpixels without page errors. Evidence: local `test-results/six-boss/baseline/`. Rollback branch: `codex/rollback-origin-story-39c8d2f`. Development branch: `codex/six-boss-master`.

## What changed

- New preloaded Canvas artwork adapter with 12 active enemy/boss strips, four measured poses each, nearest-neighbor rendering, fixed foot pivots, reduced-motion support and existing damage flashes. No per-frame image processing or rendering dependency was added.
- 19 total compiled strips and four generated source sheets preserved. Seven proposed actors remain review-only. The source posters are creative references, not runtime atlases.
- Six geographically distinct SoCal backdrop panels; WeHo identity occupies part of the existing Hollywood stretch, preserving PCH and the full route. Tahoe lake/forest/trail/restoration and Alaska mountain/glacier/Frost/aurora scenery are selected by existing progression.
- Toxic-lake and pipeline disaster panels remain review-only. Existing foreground trees/buildings/terrain still need style consistency work.
- The active old Court name is now **Court of Supremes**. Internal save identifiers remain intact. This is a naming/art change, not the required boss reorder.
- Alaska ending now points to **Hawaii**, with Costa Rica identified as the fifth/final retirement destination. Neither future world is playable.
- Active art is preloaded before enabling entry and included in the atomic service-worker precache. Safe update approval, pause/save contracts and retained previous caches remain intact. Release version stays3.4.1; cache revision is `master-art-foundation-1`, identifying a development snapshot, not a newly shipped release.

## Six-encounter completion matrix

| Required encounter | This checkpoint | Remaining required work |
|---|---|---|
| SoCal Queen mid-boss | Existing Queen playable with candidate idle/walk art, in the original final location | Relocate to real midpoint; local color restoration; independent completion state; new action/phase/defeat animation |
| Court of Supremes final | Existing Court playable; approved fictional name and candidate judge art | Reorder after Queen, replace1/3/5 with readable1/3/9, final rescue ownership, additive migration/replay verification, full action/phase/defeat art |
| Toxic Bloom | Candidate four-pose strip and contaminated-lake background only; neither active | Full encounter, three cores, hazards/minions, victory/restoration, progression/save/replay integration and all-powers tests |
| Pine Beetle Queen | Existing playable Forest Drain, larvae/flyers, infections and restoration; candidate idle/walk art | Full attack/phase/defeat art, final required restoration wording, test interaction with new Bloom progression |
| Pipeline Meltdown | Candidate worker/drone/turret/machine/slime strips and disaster backgrounds only; inactive | Full valves/leaks/glacier/moving-ice/flood/high-ground encounter, fair checkpoint, all-powers validation, bounded hazards, save/replay integration |
| Frost Queen | Existing playable three phases, snowballs, salmon, blizzard, icicles and breakable shield; candidate idle/walk art | Full action/phase/defeat art and interaction with new pipeline progression |

No six-boss completion claim is supported. Existing four encounters and the old SoCal ordering are retained.

## Save migration

[Migration design](MIGRATION-DESIGN.md) was written before changing any progression behavior. **New migration code has not been implemented.** Existing storage keys, schema versions, collectible indices, checkpoints, backups, old victories and world unlocks are unchanged. Existing save/replay/backup tests protect compatibility for these presentation changes. They do not validate the proposed new encounter migration. Required fixtures for old Queen-active/rescue/completed worlds, legacy grandfathering, new optional replay, malformed fields and quota failure are documented for the next stage.

## Asset manifest and visual evidence

[Complete integrated asset manifest](../../assets/master-build/manifest.json) records approved reference filenames, generated source hashes, runtime hashes, four source rectangles per strip, dimensions, normalization scale, foot pivot, timing, active/review status and background panel selection. Projectile emission and hitbox ownership remain with the existing simulation.

[Visual review](review.html) includes before/after gameplay, landscape captures, the existing Court/Pine/Frost encounters from natural keyboard routes, background panels and an actual compiled-strip contact sheet. These are partial artwork evidence, **not six-boss screenshots**. [Generation provenance](GENERATED-ART.md) identifies the built-in ImageGen workflow and generated original files.

Unverified and inactive animation states: attack pose, hurt pose, phase transformation and defeat. Existing procedural projectiles/warnings/particles remain. Healthy salmon retain their existing renderer. Characters, powers, cast sheets and the cinematic were not regenerated.

## Verification

- Unit suite:15/15 passed (fixed-step movement, collision/jump behavior, save fallback/quota handling, character/power invariants and release metadata).
- Natural keyboard routes: all three passed without teleports, invulnerability or forced boss completion. SoCal:6cards/3beacons, genuine Court victory, Queen, Zoey rescue, Tahoe portal. Tahoe:4nests/6memories, Queen, Alaska transition. Alaska:3relays, Frost Queen and Hawaii ending, zero deaths in this run.
- Full browser suite and PR CI: see linked development PR/checks and final handoff for the exact completed results. This checkpoint must not be merged on a pending or failed check.
- New artwork regression checks cover19nonempty transparent four-frame strips, dimensions/gutters/foot pivots,12active cache memberships, three live renderers, desktop/landscape captures, and installed offline loading in all three worlds with a preserved storage sentinel.
- Existing browser coverage includes all powers, Court temporary warned Rights Drain/recovery, legacy Court replays and quota protection, Forest Drain, Frost shield/thaw, audio signal/autoplay/settings, mobile multitouch rotation, safe-update save blocking, backups, native old saves, release badges and86-second cinematic handoff/replay/skip/interruption/reduced motion.
- Physical iPhone Safari and Android Chrome testing: **not performed**. Real notch/toolbar/rotation, touch latency, memory pressure, install/update and sustained thermal behavior remain device checks.

## Performance observations

[Raw before/after measurements](performance.json): same local headless Chrome, sequential baseline/candidate cases, desktop1280×800 and simulated touch844×390,239RAF intervals while walking per case. Shared machine, no throttling. Median16.7ms; p95 up to16.8ms for baseline and candidate; no sampled intervals over33ms. This short diagnostic does not establish physical-device performance or long-session stability.

Fresh page resource transfer increased from approximately7.7–7.9MB to12.0–12.3MB per world, primarily detailed PNG backgrounds (+4.2–4.6MB). Observed local boot times were447–604ms baseline and465–864ms candidate; network conditions and shared load make these unsuitable as a cold-mobile startup guarantee. JS heap observations are recorded, but GPU/decoded image memory was not measured. Before deployment, optimize art payloads and measure real-device startup, memory and sustained play. Assets are processed once at build time; active drawing uses bounded image reads and existing effect/enemy limits.

## Changed files

Runtime: `index.html`, `tahoe.html`, `alaska.html`, `js/app109.js`, `js/tahoe253.js`, `js/core/quest-adventure.js`, `js/core/quest-master-art.js`, `js/core/quest-release.js`, `js/world-alaska.js`, `service-worker.js`.

Tests/tooling: `tests/browser.cjs`, `tests/master340.cjs`, `tests/master-art.cjs`, `scripts/build-master-art.cjs`, `scripts/measure-master-art.cjs`.

Assets/evidence: `assets/master-build/manifest.json`,19actor PNGs,3scene PNGs, `docs/six-boss/` source/provenance/design/report/review/contact-sheet/performance/screenshots. Historical audit/cinematic files remain untouched.

## Remaining work / recommendation

**NO-GO.** Preserve this branch and its draft PR. Complete both new encounters, SoCal reordering/1-3-9 arena, additive save migration and safe new-encounter replays, all action/phase/defeat animation, full six-route gameplay/save reload testing, final restoration copy, foreground consistency, performance work and physical-device checks. Then produce the complete six-boss acceptance package and obtain the owner's explicit final artwork/gameplay approval before merge or deployment. This report does not request deployment approval for incomplete work.
