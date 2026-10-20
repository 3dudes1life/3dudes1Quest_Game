# Six-boss master build — implementation and owner review

**GO for owner review. NO-GO for merge or deployment until explicit final owner approval and passing CI on the submitted commit.** PR #12 remains draft. Production is unchanged. This continues checkpoint `ee3f12b469e5ebbf8fcdf9bbe205c3a76eb13b7d`; it does not replace the engine, protagonists or approved cinematic.

## Baseline and rollback

Main baseline: `39c8d2f4a46420fb2e925bc41fca45c1d846520f` (Origin Story merge, PR11). Rollback branch: `codex/rollback-origin-story-39c8d2f`. Development branch: `codex/six-boss-master`. Release stays 3.4.1; the additive cache revision is `master-six-encounters-1`. Exact final commit and its CI status are recorded in the PR and delivery message; this report does not imply deployment.

## Six-encounter implementation matrix

| Encounter | Actual behavior | Verification |
|---|---|---|
| Queen of Beige | PCH midpoint, original combat and three phases; independent saved victory, local color restoration, no rescue | Natural keyboard route; each character's real projectiles; reload and legacy active-Queen compatibility |
| Court of Supremes | Final arena, actual 1 → 3 → 9 judges; staggered flaming scrolls, warned temporary Rights Drain, recovery, OVERRULED!, then original Zoey rescue/Tahoe transition | Natural keyboard fight observes phases, drain and recovery; all powers; HP reload; nine-judge arena/cage/portal bounds |
| Toxic Bloom | Progressive lake contamination, three HP-bearing cores, toxic bubbles/algae minions, checkpoint, blue-water restoration | Natural keyboard route and all powers; partial-core reload, rotation, optional replay and reward protection |
| Pine Beetle Queen | Original three phases, Forest Drain, infected/restored trees, larvae/flyers; new campaigns require Bloom plus original objectives | Natural keyboard route with four nests/six memories, all powers and phases, Alaska transition |
| Pipeline Meltdown | Five industrial actor types, three actual shutoff valves, leak, glacier warning, moving ice, rising flood, high-ground escape and sealing/restoration | Natural keyboard route; all powers against valves; partial saves, industrial defeat records, flood death/reload recovery |
| Frost Queen | Original three phases, shield, blizzard, icicles and zombie salmon; rainbow aurora restored; HAWAII — COMING SOON | Natural keyboard completion, all powers and shield phases, restored aurora and ending captures |

## Artwork and destinations

All 19 relevant actors now use the runtime adapter. Existing four-cell idle/movement strips remain. Each has four additional **distinct** measured preparation, execution, hurt and defeat poses (76 poses), with transparent gutters, fixed foot pivots and nearest-neighbor rendering. Runtime phase transitions combine action poses with timed multiplication, wings, shield or transformation effects; they are not claimed as separate bespoke multi-frame phase atlases. Defeats use a hurt-to-defeat sequence and bounded fade queue. Projectile origins and collision boxes remain simulation-owned. Healthy salmon retain their established renderer.

The Pine Beetle Queen action source was regenerated to correct inconsistent proportions. Foreground pine variants, palms and rocks were generated and integrated; original geometry remains. Hillcrest now has a recognizable arched HILLCREST sign with supports, flags and surrounding pixel storefronts, based on the actual neighborhood landmark. San Diego, Hillcrest, PCH, West Hollywood, Hollywood and LA keep their routes and collectibles. Environmental state changes follow actual victories: coastal color, lake contamination/blue recovery, infected/recovered forest, industrial flood/repair and aurora.

[Visual review](review.html), [animated contact sheet](contact-sheet.html), [asset manifest](../../assets/master-build/manifest.json) and [generation provenance](GENERATED-ART.md) provide inspectable artwork at gameplay scale. Source posters are references, not runtime atlases. The approved protagonists, their powers and the 86-second nine-scene cinematic were not regenerated or redesigned. A cinematic style remaster remains a separate future decision.

## Saves and replay

The shared `quest-encounters.js` adds a versioned encounter record without renaming existing storage keys or changing existing collectible indices. It sanitizes malformed numbers and contradictory stage/core data. Genuine old victories and completed-world access remain; old late checkpoints do not falsely award newly introduced encounters. An old active Queen can finish in her saved arena.

Eligible existing players can replay the new encounters. Entry first persists and protects the campaign snapshot; quota failure refuses entry. Replay autosaves use a separate sidecar. Returning restores campaign position, score, collectibles, checkpoint and existing boss state. Winning records only the newly earned encounter completion, without duplicating rewards. Reload during a replay returns to the protected campaign. Flood failure retains earned valve/objective progress and resets the warning from safe ground. [Migration design and implemented contract](MIGRATION-DESIGN.md) describe the details.

## Automated and gameplay evidence

- Unit suite: **16/16 passed** locally, including strict fresh/legacy/malformed encounter normalization, fixed-step physics, saves/quota handling and release invariants.
- Full local browser suite passed, including release labels, controls, saves/backups, audio, mobile rotation/multitouch, Court progression/replays, art and all-world offline PWA checks, and the unchanged natural 86-second cinematic. Final submitted bytes must also pass GitHub CI.
- Controlled scenarios use real player power projectiles for all three characters against all six encounters. These deliberately isolate boss conditions; they are **separate from complete routes**. [Controlled results](controlled-results.json).
- All three complete routes use normal keyboard inputs and read-only guidance, without teleporting, invulnerability or boss-completion edits. SoCal: Queen midpoint, six cards, three beacons, Court nine judges, rescue and portal. Tahoe: Bloom, four nests, six memories, Queen and Alaska transition. Alaska: valves/flood, three relays, Frost Queen, zero deaths in the recorded run and Hawaii ending. [Natural route results](natural-results.json).
- Meaningful save scenarios cover partial Court HP, Bloom cores and valves; interrupted/rotated fights; replay snapshot protection; storage quota failure; malformed saves; flood death/reload; and retained legacy world access. Preparation/attack/hurt/transformation/defeat usage is observed in natural routes.
- Asset tests check 19 idle/movement strips and 76 distinct action poses, alpha, pivots, PNG/WebP integrity, three live renderers, desktop/touch landscape and all three worlds offline. All service-worker precache paths exist. Safe update approval and save blocking remain intact.

## Performance

[Raw measurements](performance.json) use sequential local headless Chrome, desktop 1280×800 and simulated touch 844×390, with 239 RAF intervals while walking per case. No throttling; shared machine. Candidate median 16.7ms, p95 at most 16.8ms, zero sampled intervals over 33ms. Baseline SoCal had five desktop and one touch interval over 33ms; other baseline cases had zero. This short sample does not establish sustained physical-device performance.

| World | Main baseline transfer | Candidate transfer | Desktop startup baseline → candidate | Touch startup baseline → candidate |
|---|---:|---:|---:|---:|
| SoCal | 7.91 MB | 11.81 MB | 579 → 501 ms | 466 → 468 ms |
| Tahoe | 7.67 MB | 11.95 MB | 531 → 582 ms | 490 → 538 ms |
| Alaska | 7.71 MB | 12.04 MB | 516 → 532 ms | 491 → 500 ms |

The detailed art still increases a fresh page's transfer by about 3.9–4.3 MB over main. Compared with the partial PNG checkpoint, SoCal/Tahoe decrease by about 0.39/0.36 MB despite the additional actions and actors; Alaska increases by about 0.06 MB. Encoded actor/backdrop payload fell from 17.36 MB PNG to 10.77 MB WebP before adding the shared foreground atlas ([compression record](compression.json)). Actor visible RGBA is lossless; backdrop maximum channel deviation is 2/255. Original PNGs remain review/build sources and are not redundantly precached. Only current-world art is loaded by each runtime; offline installation intentionally caches all worlds.

Observed JS heap is roughly 7–8 MB for SoCal/Tahoe and 18 MB for Alaska. GPU/decoded-image memory was not measured. Startup numbers are local observations, not cold mobile-network guarantees. Enemies, bubbles, falling ice and death-animation queues are bounded; no per-frame image processing was added.

## Modified files

Runtime: `index.html`, `tahoe.html`, `alaska.html`, `js/app109.js`, `js/tahoe253.js`, `js/core/quest-adventure.js`, `js/core/quest-master-art.js`, new `js/core/quest-encounters.js`, `js/core/quest-release.js`, `service-worker.js`. Earlier checkpoint `js/world-alaska.js` ending change remains.

Tests: `runtime.test.cjs`, `browser.cjs`, `alaska.cjs`, `audio.cjs`, `characters341.cjs`, `court-progression341.cjs`, `master340.cjs`, `master-art.cjs`, `audit-playthroughs.cjs`, new `six-boss.cjs` and `encounter-saves.cjs`.

Build/evidence: action/foreground generation and optimization scripts, measurement/preview scripts, 19 actor action PNG/WebP sets, runtime WebP scenery, foreground atlas, updated manifest, provenance, migration contract, contact sheet, screenshots and result records under `docs/six-boss/`. Existing audit/cinematic work is preserved.

## Remaining checks and recommendation

**GO for owner artwork/gameplay review; NO-GO for merge/deployment without that approval and green final CI.** No physical iPhone Safari or Android Chrome testing was performed. Real toolbar/notch behavior, simultaneous touch during rotation, installed-update behavior, low-memory reloads and sustained thermal/startup behavior need device checks. Browser emulation alone cannot establish those results. Detailed art remains heavier than main; slower-device memory/network measurements remain a material limitation. No Hawaii/Costa Rica gameplay, cinematic remaster, permanent elimination or public difficulty rebalance was added.
