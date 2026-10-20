# Build3 — Survival & Throuple Power review candidate

**GO for owner gameplay review. NO-GO for merge/deployment until final owner approval and successful CI on the submitted commit.** Nothing in this candidate deploys to production. Exact commit and CI links are recorded in the draft PR and delivery message.

## Baseline and implementation

Baseline `ae5ec88a4d4ec445289c780696647a4cbb9e65b8`; main stability39364632962 and Pages39364632453 passed. Six critical production entry/story/release files matched baseline bytes. Remote rollback `codex/rollback-origin-story2-ae5ec88` preserved. Work branch `codex/survival-throuple-power`.

The additive shared campaign owns three independent four-heart pools, permanent knockouts, safe survivor selection, ended-run history, bounded one-time recovery, charge/contributions, three power tiers, world survival badges and shared persistence. Legacy play remains available. No engine rebuild, world geometry, base signature stats, boss design, approved artwork or cinematic change. See [architecture and save consistency](ARCHITECTURE.md) for the actual adapters, namespace, transaction/recovery rules and testing boundary.

Solo Surge emits the surviving signature twice. Double Trouble emits both surviving signatures twice. Throuple Power requires all three contributions and emits all three twice. Existing projectile collision, phases and shields apply; activation provides a short1200ms shield and original bounded retroSFX. T/touch activation is distinct from existing controls. Charge and contributions carry between worlds. The retirement achievement remains unimplemented/reserved for future Costa Rica completion.

Titles offer explicit opt-in, continuation and legacy play. The HUD uses existing portraits and accessible roster/health/OUT/contribution labels outside the reserved gameplay canvas. Pause menus show run status, world achievements and archive/fresh-run/legacy options. Local tester links provide damage protection and Reset Test Hearts in a separate namespace; the public hostname never enables these privileges. This is not a claimed production authentication system.

## Verification

- **20/20 unit tests**: fixed-step physics, collision/camera/power contracts, metadata/audio/world invariants plus independent HP, no switch/checkpoint healing, permanent knockout, ended-run history, survivor achievements, charge/contribution/consumption limits, one-time recovery, atomic quota behavior and committed-knockout backup recovery.
- **Full local browser suite passed**: existing legacy save fixtures, three-world controls/combat, all6 encounters, safe-update save refusal, replay protections, approved art, real audio rendering/lifecycle, mobile rotation/multitouch, offline launch, natural55-second7-scene cinematic and two natural composition recordings. Targeted survival/interrupt suites were rerun after final persistence/UI fixes; GitHub CI must verify the exact submitted tree.
- **Normal keyboard survival routes passed** for all three worlds: SoCal63.2s, Tahoe54.3s, Alaska33.0s. No teleports, invulnerability or completion flags in those routes. Each route initializes a fresh survival roster in that world; it is not presented as a single continuous three-world human playthrough. All three finished with three survivors. [Route evidence](keyboard-routes.json).
- **42 controlled encounter victories across7 survivor configurations**, including each of the6 encounters with Will alone, Daniel alone and Caleb alone. These use actual signature projectiles and observe required phases/shields; fixtures isolate arena prerequisites and apply damage protection. They establish power accessibility, not human difficulty balance. All three tiers activate and record correct1/2/3-survivor achievements. [Boss configurations](boss-configurations.json).
- Survival browser coverage: same roster through SoCal/Tahoe/Alaska and reloads; permanent knockout; protected optional replay; exact preservation of historical/current legacy bytes; quota pause/retry; stale-tab overwrite refusal; installed-worker offline resume with knockout/charge/contribution; local TEST isolation; blocked Rights Drain activation, protected boss transformation/Frost shield and eligible windup interruption.
- Desktop1280×800 and simulated touch844×390,852×393,932×430,740×320 and915×412: HUD outside logical gameplay, activation button44px minimum, no collisions with critical controls, portraits decoded, active-rotation held input released. Reduced-motion offline coverage. [Layout/state results](results.json).
- Final CI executes unit tests, the full browser suite, existing normal routes and survival normal routes. Screenshots/test artifacts are uploaded by the existing workflow. Exact CI result belongs to the submitted SHA, not an earlier checkpoint.

## Performance

Sequential local Chrome baseline-versus-survival samples: six world/device pairs,239 walking RAF intervals per sample. Median approximately16.7ms; p95 at most16.8ms in baseline and candidate; zero intervals over33ms in every sample. Additional fresh-page transfer about20.5–21.1KB; no new runtime artwork or dependencies. Candidate JS heap roughly8.0–8.9MB SoCal/Tahoe and18.2–18.3MB Alaska. Heap observations include GC variation and are not a memory leak proof. [Raw performance data](performance.json).

HUD mutations are event-driven and do not read layout every frame. New team bursts add at most6 existing projectiles; existing spatial collision/range/ricochet/spawn bounds constrain their targets. Existing particle caps and40-voice synthesizer cap remain. Reward ledger caps at2048 entries. Performance samples cover short walking sessions, not sustained thermal behavior or worst-case team-attack stress on physical phones.

## Modified files

Shared: new `quest-survival.js`/`survival.css`; storage routing in `quest-runtime.js`; world achievements in `quest-journey.js`; original effect in `quest-score.js`; viewport space in `quest-viewport.js`; cache revision/precache. Three active HTML entries load the module/styles. `app109.js`, `tahoe253.js` and `quest-adventure.js` add explicit adapters and successful-damage/objective hooks. Historical files remain unchanged.

Tests: runtime units; new survival, survivor-boss and interruption browser modules; normal-route Survival mode; browser/CI registration. Evidence/report/review and a reproducible performance sampler are included. All cast/background/story sources and approved cinematic timing remain unchanged.

## Remaining limitations and next scope

No physical iPhone Safari or Android Chrome testing, human audio listening, long-session thermal/memory testing or owner difficulty balancing is claimed. The controlled boss fixtures use protection; real-player survivor difficulty needs owner testing. Quota failures cannot preserve actions that were never durably saved; keep the tab open and retry. If storage cannot refresh the backup, the valid primary remains authoritative. Local testing is the fallback because secure production tester authorization is unavailable.

Enemy Visibility & Visual Hierarchy and Tahoe Forest Infestation Progression are captured in [the Build4 queue](BUILD-4-QUEUE.md). Their briefs place them after Survival review; a scope clarification was requested because “before final” conflicts with that gate. They are not falsely reported as implemented. No Hawaii/Costa Rica gameplay, public difficulty balancing, merge or deployment was started.
