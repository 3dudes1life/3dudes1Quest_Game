# 3Dudes1Quest — master game audit and stabilization

Audit date: **2026-10-19**, America/Los_Angeles. Release remains **3.4.1**. This document and the companion files are a reviewable stabilization PR; production is not changed by this audit.

## Outcome

No P0 crash, corrupted-save case or impossible required route was reproduced in the tested scenarios. One new P1 defect was confirmed and repaired: Alaska's installed-update session lacked the pause/save methods expected by UPDATE READY. Five safe P2 repairs clarify Tahoe's Start/Continue and exit direction, remove inactive opening-screen controls, correct the Hollywood card instruction, and increase tiny action/boss sublabels. No artwork, boss order, phase count, world geometry, power balance or save schema was replaced.

The approved **future** Queen-mid-level → Court-final1/3/9 structure differs materially from production. Toxic Bloom and Pipeline Meltdown are absent. These are documented future implementations, not falsely reported as completed repairs. [Design/save impact and approval requirements](master-audit/boss-design-impact.md).

## Baseline and rollback

- Main and deployed release: `2b1859551861bd2b6106d14ff8980892c3586c80`.
- All **123** checked production HTML/JS/CSS/cache/asset/metadata files matched local GitHub main bytes. The comparison includes legacy precache entries; it does not assert every cached image is drawn.
- Latest baseline main CI38169654387 and Pages38169653776 succeeded. No open PRs; working tree was clean. Existing development branches were inspected and left intact.
- Remote/local rollback ref: `codex/rollback-pre-master-audit-341` at that SHA. Earlier rollback3.4.0 also retained. New work is on `codex/master-audit-341`.
- Active entries: `index.html` → `js/app109.js`; `tahoe.html` → `js/tahoe253.js`; `alaska.html` → `QuestAdventure.create(AlaskaWorld)`. Shared runtime/core/cast/retro/audio/score/journey/viewport/release modules load from these entries. Historical filenames remain valid active entrypoints; archived alternative sprite sheets are not assumed active.

## Issue register and repair status

The complete [JSON register](master-audit/issue-register.json) and [CSV register](master-audit/issue-register.csv) contain severity, world/location, reproduction, expected/actual behavior, root cause, evidence and status for **18** entries.

| ID | Severity | Finding | This PR |
|---|---|---|---|
| A01 | P1 | Alaska UPDATE READY throws before saving/activation | Add actual session.pause/save; test actual Alaska worker update and quota failure |
| A02 | P2 | Play Tahoe silently resumes a checkpoint | Start Tahoe / Continue Tahoe, with save explanation |
| A03 | P2 | Post-Queen visible objective hides exit direction | Head-right/Alaska instruction in visible objective title |
| A04 | P2 | Opening screens expose inactive HUD/touch/pause controls | Hide gameplay chrome until world entry; keep geometry reserved |
| A05 | P2 | Hollywood says final card is in studio district | Correct instruction to downtown approach; no coordinate change |
| A06 | P2 | Touch/boss sublabels9px | Increase to10px; preserve44px controls and viewport tests |
| A07 | P1 | Legacy Queen save can infer Court completion | Existing explicit victory/replay mitigation retained and tested; future migration proposal documented |
| A08–A11 | P2 | Under-platform card readability, mixed art style, compact HUD/device readability, retained dead-minion stress risk | Documented open/deferred review; no speculative geometry/artwork/pruning changes |
| A18 | P2 | Immediate new-game/restart save replacement | Open confirmation/warning review; existing reset semantics retained |
| A12–A17 | P3 | Boss order/count, Toxic Bloom, Pipeline Meltdown, West Hollywood identity, world-selection policy, owl role | Documented future/design decisions; not implemented |

## UI/UX coverage

Reviewed loading/title, first-time start, continue, character/power selection, free world links, HUD, objectives, saving/checkpoints, pause/restart, dialogue, audio, boss feedback, victory/portal, touch preferences, rotation, readability and focus. New actual-session regressions cover all three worlds and save failure. Existing browser checks exercise native legacy saves, character powers and portraits, keyboard/touch aliases, simultaneous movement/jump/attack, pause/menu rotation, dialogues, completion, handedness/button size, safe areas and constrained height.

The interface remains retro and original assets stay intact. The opening-screen change hides nonfunctional chrome without changing the canvas/viewport reservations. Vital HUD text remains11px to preserve its constrained width; physical readability and larger-font layouts are still review items. Restart/new-game actions retain established behavior; destructive-action confirmation is a future usability review, not silently added here.

### Before / after evidence

| Finding | Before | After |
|---|---|---|
| Tahoe opening/action clarity | [Before](master-audit/screenshots/tahoe-title-before.png) | [After](master-audit/screenshots/tahoe-title-after.png) |
| Alaska opening/chrome | [Before](master-audit/screenshots/alaska-title-before.png) | [After](master-audit/screenshots/alaska-title-after.png) |
| Tahoe victory navigation | [Before](master-audit/screenshots/tahoe-victory-before.png) | [After](master-audit/screenshots/tahoe-victory-after.png) |

Desktop, mobile landscape, route, encounter, rescue and ending captures are additionally generated under `test-results/master-audit`, plus the established suite's artifact folders. CI uploads test-results. The before-victory image came from an audit-script timeout while it incorrectly waited stationary for an ending; the game was won and waiting for rightward travel. The resulting direction-copy finding is P2, not a false game-breaking report.

## Gameplay, progression and bosses

[World routes and boss matrix](master-audit/world-routes.md) distinguish coordinate sections from proposed names and designs. SoCal is Home Base/San Diego, Hillcrest, PCH, Hollywood and LA; there is no separately implemented West Hollywood section. Current Court and Queen are both at City Hall in the previous order. No stage was silently moved.

Normal-keyboard verification completed:

- **SoCal:** all six cards, three beacons, blockade, Court1/3/5 with real scrolls and Rights Drain/recovery, Queen, Zoey rescue, completion and Tahoe destination link.
- **Tahoe:** four nests, original trail enemies, all six memories, Queen, restoration and actual URL transition to Alaska. Optional crystals were not fully collected.
- **Alaska:** all required relays, thin-ice route/shelters, Frost Queen and Costa Rica Coming Soon ending. Baseline run had zero deaths; not a100% shard/cache collection run.

These used real keyboard events and the ordinary simulation clock. Read-only state observations guided the scripts; they did not teleport, set invulnerability, edit health/boss flags or skip required progression. [Machine-readable route/results evidence](master-audit/test-results.json). `npm run test:audit` reproduces the complete required routes in isolated contexts against a local candidate server; `AUDIT_BASE` can select another server. It does not use the owner's personal browser/save.

Controlled scenarios remain separate: older boss arena seeds, direct collision/power/death checks, corrupt/quota save fault injection, legacy checkpoint fixtures, and imported-worker update fixtures. They supplement natural play and are not described as complete campaign playthroughs.

## Audio, performance and reliability

Existing original seven-score/thirty-effect tests verify actual finite, non-silent Web Audio output, gesture unlock, transitions, mute/volume persistence, focus/rotation cancellation and bounded voices. No music or sound artwork was replaced. Current short emulated frame samples were approximately16.7ms median,16.7–16.8ms p95, with peak9 voices, at1280×720 desktop and640×360 touch rendering. These are short desktop automation observations, not physical-device performance or proof of long-session/battery stability. [Raw measurements](master-audit/test-results.json).

Safe update regression now exercises the actual Alaska controller, rather than only a mock session: old imported cache revision → waiting update → pause/save → activation → Continue at the stored checkpoint. Save failure blocks activation. No cache reset, storage deletion or new release version is introduced. Candidate cache revision `master-audit-1` isolates a later owner-accepted installation while preserving the established save-before-update flow and previous caches. Production remains on `court-repair-1` until this PR is approved and merged.

Offline regressions launch installed adventures/audio and validate matching release metadata. Earlier schema/save fixtures remain compatible. No new adventure, Toxic Bloom, Pipeline Meltdown, nine-judge phase or sequential-world lock is introduced.

## Artwork readiness

- [68-component logical asset inventory](master-audit/asset-inventory.csv) ([JSON](master-audit/asset-inventory.json)): protagonists, pets, bosses, enemy types, projectiles/effects, scenery/terrain sections, collectibles/hazards, portraits and HUD/UI; active renderer/path, dimensions, states, collision/animation contract and replacement status.
- [92 physical/precache image records](master-audit/physical-assets.csv): actual dimensions/bytes, runtime-request observation and production match. A precached or referenced historical PNG is not necessarily active gameplay artwork.
- [PNG action-pack specification](master-audit/png-integration-spec.md): manifests, alpha, frames, pivots, scale, hitboxes, source roles, generated portraits, touch/desktop checks, safe cache migration and separate owner approval of produced runtime art.

Most enemies, bosses, terrain and hazards are procedural drawings. Replacing an unused PNG will not update those visuals. Annotated reference sheets require a production adapter/atlas contract. The approved Will/Daniel/Caleb identity and world outfits remain unchanged, including adult Caleb.

## Verification and delivery status

Local unit tests and full browser suite pass; the natural three-world route run passes. New regressions cover actual per-world update contracts, quota blocking, opening/gameplay chrome, Start/Continue labels, minimum action-label size and visible Tahoe exit guidance. CI now runs both existing suites and `test:audit`; its timeout accommodates full natural-route verification rather than silently omitting it. Final remote commit SHA and exact CI outcome are supplied with PR delivery; no merge/deployment is performed in this audit.

Modified production files: `js/core/quest-adventure.js`, `js/core/quest-release.js`, `js/app109.js`, `js/tahoe253.js`, `tahoe.html`, `css/viewport310.css`. Test/CI changes: `tests/master-audit-ui.cjs`, `tests/audit-playthroughs.cjs`, `tests/browser.cjs`, `tests/release-version.cjs`, `tests/master340.cjs`, `package.json`, workflow. Documentation, structured registers/inventory/results and six evidence PNGs are under docs. No production asset file changed.

## Remaining risks / owner decisions

Physical iPhone Safari/Android Chrome/PWA testing, long-session memory/battery/thermal tests, human audio listening and the owner's exact save/browser-cache diagnosis remain unverified. Retained dead beetle records need prolonged stress testing; a crash/leak was not demonstrated. The overlapping one-way-platform card remains reachable but confusing. Direct world selection and hostile owl role need design clarification. Supplied artwork and the new boss ordering require the separate approval phase described above. Production remains the preserved known-good release while the PR is reviewed.
