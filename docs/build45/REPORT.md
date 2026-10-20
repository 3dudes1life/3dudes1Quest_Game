# Build 4.5 — cross-platform review candidate

**GO for owner review after the automated gates recorded in the PR. Full physical-device certification remains NO-GO/UNVERIFIED.** No merge or deployment is performed by this candidate. The exact final commit and GitHub CI run are recorded in the draft PR, avoiding a self-referential commit inside this file.

[Production gates and rollback](BASELINE.md) · [Ranked audit](AUDIT.md) · [Compatibility matrix](MATRIX.md) · [Performance and latency](PERFORMANCE.md) · [Owner acceptance checklist](OWNER-CHECKLIST.md) · [Visual review](review.html) · [Reproduce checks](REPRODUCE.md).

## Delivered repairs

- Cancelled touches cannot leave a pending action after the last source is cancelled. Complete quick taps still work; releasing one source retains other contacts or keyboard aliases.
- Held controls ignore secondary mouse presses. Gameplay surfaces suppress browser context menus and retain explicit touch-action, selection and callout behavior; reserved system gestures remain under OS control.
- Existing controls gain independent movement/action inset and lift, alongside retained size and handedness choices. Values clamp to safe gutters as viewport dimensions change. Short landscapes use two action rows when a vertical column cannot fit below the HUD with usable targets. Narrow landscapes reserve another HUD line for wrapped boss warnings.
- Preferences persist under the existing `quest-controls` key, including old size/hand settings. Reset affects touch preferences only. Storage denial explains session-only adjustments and preserves campaign data.
- Fullscreen and visibility interruption clear held/discrete input presentation; Build 4 rotation pause/save/recovery and explicit resume remain intact.
- Fresh landing pages safely adopt a whole validated newer Survival commit before any gameplay has started. Active and previously played pages keep the stale-writer freeze; no save schema or progression is reset. Native hidden mode buttons now remain hidden under menu CSS.
- Automated input, viewport, cross-engine and scheduling coverage is expanded. CI includes a separate strict Chromium/Firefox/WebKit job in addition to the complete existing gameplay suite.

The renderer, approved artwork, parallax, pixel scaling, original audio,55-second/7-scene Origin Story, combat values, movement constants, powers, six bosses, saves, roster rules, checkpoints and difficulty are unchanged. The authoritative public version remains3.4.1 with a distinct Build 4.5 candidate cache revision. No future worlds or new controller system were added.

## Modified files

| Files | Purpose |
|---|---|
| `js/core/quest-runtime.js` | Cancelled input, primary mouse handling, context menus and interruption release |
| `js/core/quest-viewport.js`, `css/viewport310.css` | Saved control positions/reset, safe clamping, short-height rows and wrapped-warning space |
| `js/core/quest-survival.js`, `css/polish4.css` | Safe untouched-title refresh and native hidden mode actions |
| `js/core/quest-release.js` | Distinct candidate cache revision; public metadata stays consistent |
| `tests/build45.cjs`, `landing45.cjs`, `refresh45.cjs`, `short-boss45.cjs`, `cross-platform.cjs` | Contact/layout/title/refresh-rate/boss/browser regression coverage |
| `tests/browser.cjs`, `runtime.test.cjs`, `survival.cjs`, `.github/workflows/game-checks.yml` | Suite registration,90Hz coverage, played stale-writer fixture and strict multi-engine CI |
| `scripts/*45.cjs`, `docs/build45/` | Repeatable comparisons, measurements, workload, raw evidence, screenshots and owner review |

## Input, ergonomics and accessibility

All three adventures share the same held/discrete input and viewport owners. Regressions exercise native Chrome touch contacts, including move+jump+attack, individual finger release, fourth-contact switching and existing team/pause combinations. Controlled cancellation fixtures distinguish a completed quick tap from a cancelled gesture. Existing Build 4 tests continue verifying held switch behavior, team readiness, ended-run recovery and focus.

Adjustable positions, sizes, handedness, reload persistence, reset, quota refusal and unchanged campaign-save bytes are checked in every world. Landscape coverage includes 844×390,852×393,932×430,740×280 and constrained740×240; existing suites retain further sizes, portrait rotation and safe-area cases. Simulated insets and toolbar dimensions are identified as emulation. Menu controls remain scrollable, labeled and keyboard reachable, with focus containment and visible focus. Input settings do not consume gameplay keys while ranges/selects are focused.

Human thumb comfort, real notches/browser chrome, long-press/edge gestures, phone calls and installed mobile lifecycle remain physical-owner checks. A local geometry pass does not certify them.

## Simulation and gameplay verification

The actual three world runtimes are driven through controlled 30/60/90/120Hz schedules, with normal and late-boss fixtures. Inputs occur at identical simulation ticks; rendering is omitted only in this fixture to isolate simulation. Each eight-second case produces480 steps. The comparison includes player motion/jump apex, invulnerability, shots, damage/phase state, cooldowns, charge, contributions, save sequence and checkpoints. This is not a physical refresh-rate test.

Normal Legacy and Survival routes, all six encounters and the separate continuous Survival campaign are rerun through actual controls. The continuous campaign uses the native SoCal portal and Tahoe travel, one roster/run ID and exact health/charge/contribution handoffs, with genuine contributions and actual team activation. Protected encounter matrices and performance arenas are labeled separately from normal-route completions.

| World | Established encounters retained and exercised |
|---|---|
| SoCal | Queen of Beige midpoint; Court of Supremes1→3→9, temporary Rights Drain, OVERRULED!, Zoey/Tahoe navigation |
| Tahoe | Toxic Bloom/cores and separate lake restoration; Pine Beetle Queen, nests/larvae/flyers, Forest Drain and green restoration |
| Alaska | Pipeline valves/rupture/flood; Frost Queen relays/shield/blizzard/salmon, aurora restoration and ending |

## Performance evidence

[The performance report](PERFORMANCE.md) separates delivered-event-to-simulation measurements from RAF pacing, first-use CPU probes, controlled demanding encounters and the long protected workload. No hardware-to-photon, GPU-memory or thermal claim is made. Matched baseline/candidate profiles use the deployed Build 4 baseline, identical dimensions and sequential local Chrome runs.

First-use rendering spikes remain documented. Renderer experiments were not retained: a scratch-canvas hint failed pixel equivalence; other exploratory loading/contour changes lacked sufficient controlled evidence to justify changing the approved path. Final comparison resources are served through the same in-memory transport; exploratory cross-disk loading comparisons are excluded. No speedup is claimed merely from a near60Hz RAF cadence.

## Saves, audio and offline support

Existing Legacy and Survival storage contracts remain unchanged. An existing stale-tab regression was updated to enter gameplay in both tabs; untouched-title refresh now has its own regression, while committed knockout overwrite protection stays asserted. Tests cover existing saves, independent health, irreversible run knockouts, charge, checkpoint/boss reload, backup recovery, quota failures, stale tabs, practice snapshots, completed-world access, offline launch/resume and safe PWA updates. Touch preferences have their own key and are compared against unchanged campaign bytes while settings are adjusted. Tests use isolated profiles; owner storage is never cleared.

The original soundtrack/effects engine remains intact. Audio regressions cover finite non-silent signal, transitions, mute/volume persistence, interruptions and offline synthesis. Repeated workloads inspect scheduler/voice accumulation. Human listening and real call/Bluetooth interruption remain owner acceptance tasks.

## Automated results and limits

See [validation index](evidence/validation.json), raw logs and matrices. The draft PR records exact-head GitHub results and generated CI artifacts. Screenshots include same-size baseline/candidate controls, short-height layouts, settings, demanding encounters and gameplay.

An initial Linux WebKit matrix failed a fixed160ms movement assertion. The harness now checks the held alias and waits for actual displacement with a bounded functional timeout, saving detailed state/screenshot on failure. A second run passed desktop movement but caught a fixed70ms assumption before simulated safe-area layout applied. The harness now waits for actual layout values, retains the same bounds and closes its test-only QA overlay. These are functional gates, separate from latency measurements; final exact-head CI must pass without engine skips. [Investigation](evidence/ci-investigation.json).

Local Firefox launch is explicitly blocked by a pre-page graphics/sandbox failure. Native Safari 27.0.1 WebDriver session creation timed out before page load. A separate native GUI smoke then passed all three worlds, basic controls, pause, save/reload and the repaired landing/menu behavior in an isolated private window. This limited desktop evidence does not certify a complete native campaign or physical Safari. Linux CI engine results are separate. Playwright WebKit is not Safari; patched Firefox engine tests do not certify a user's installed Firefox. Installed Chrome automation does not replace human testing of browser zoom, displays, keyboard comfort or audio. Physical iPhone Safari and Android Chrome are required before full cross-platform certification; their template results remain UNVERIFIED.

**Decision: review candidate only.** Owner approval is required for merge/deployment. Full certification remains NO-GO until required physical checks are recorded against the exact approved candidate. No additional worlds or follow-on release is started.
