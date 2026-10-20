# Build 4 — owner review candidate

**GO for owner review. Merge and deployment require explicit owner approval.** This branch starts at the verified PR14 production merge, `c3aba0f47f58c32870bf1e64ebd1a463295dd362`. [Release gates and rollback](BASELINE.md). The public release number remains 3.4.1; the candidate has a distinct service-worker cache revision.

## What changed

[Ranked audit and reproduced defects](AUDIT.md) explains the evidence behind each repair.

- Character switches preserve held movement, jumping and attacks. Knockout, rotation, backgrounding and other interruption paths continue releasing input safely.
- Switch, Pause and team actions share the existing pointer-press behavior. A fourth contact works while three movement/jump/attack contacts remain held, with no duplicate compatibility click.
- Menus have consistent spacing, focus indicators, modal focus containment and unobscured headings. Full-page title screens retain normal keyboard access to Share. Compact menus scroll; controls remain at least 44px high.
- Survival and Legacy labels explain their separate saves. Mode changes participate in stale-tab transactions. Leaving from a title no longer risks replacing a played world snapshot with an unstarted state.
- Team charge names missing contributors, identifies READY and temporary DRAIN/WAIT states, and explains practice fights. The pause summary shows each dude's health/OUT status, charge and achievements.
- An ended Survival run has explicit recovery choices and an archive explanation. Save refusal remains visible in the active menu.
- Corrected SoCal's world subtitle and Will's DJ Soundwave label. Fixed missing Tahoe switch audio and previous-character feedback. Victory text survives rapid routine attack feedback.

No movement constants, fixed-step timing, collision geometry, enemy/boss statistics, difficulty, hitboxes, approved sprites/backgrounds, soundtrack, forest restoration or seven-scene 55-second Origin Story were changed. No future worlds were built.

## Gameplay and six encounters

Every standalone Legacy route and every standalone Survival route passed using actual keyboard movement and combat. The separate continuous Survival campaign passed in **146.765 seconds**, using native travel and one run ID. Both world handoffs preserve exact individual health, charge, contributions and completed-world state. All three characters genuinely contribute during the campaign, followed by actual T activation. Its roster survives intact; permanent knockout carry and survivor selection are covered by controlled tests, rather than claimed from this route.

| World | Encounters exercised | Evidence |
|---|---|---|
| SoCal | Queen of Beige midpoint; Court finale, 1 → 3 → 9 judges, Rights Drain recovery, OVERRULED!, Zoey and Tahoe portal | Native Legacy/Survival routes, continuous campaign, restriction tests, survivor configurations |
| Tahoe | Toxic Bloom contamination/restoration; four nests, Pine Beetle Queen, Forest Drain and green restoration wave, Alaska travel | Native routes, actual-power restoration/reload assertions, continuous campaign |
| Alaska | Pipeline valves/rupture/flood; Frost Queen relays/shield, aurora restoration and ending | Native routes, continuous campaign, survivor configurations |

The local suite completes **126 controlled boss victories**: three sets of all seven nonempty survivor rosters × six encounters (default, repeated desktop, repeated mobile). Each set includes 18 single-survivor encounters. Real character projectiles determine victory; controlled invulnerability/arena prerequisites make these compatibility tests, not public difficulty or human fairness certification. Natural routes are reported separately. [Raw boss results](evidence/boss-default.json), [desktop repeat](evidence/boss-repeat-desktop.json), [mobile repeat](evidence/boss-repeat-mobile.json), [continuous campaign](evidence/campaign.json).

## Validation

- **20/20 unit tests**: movement/landing/jump buffering, fixed-step behavior, camera, combat helpers, save envelope and Survival rules.
- **Full Playwright suite passed**: release UI, mobile layouts/rotation and input release, character powers, six encounters, save migrations/corruption/quota/stale tabs, replay isolation, restricted team activation, enemy contours, deterministic forest infection/restoration, audio, safe updates and offline launches.
- **Six native keyboard routes passed**: three Legacy and three Survival; no teleports or forced boss completion used to claim those completions.
- **Continuous three-world Survival passed** as described above, independent of standalone routes.
- **New Build4 cases passed** on desktop and compact mobile: title navigation, modal focus, resume focus, held switching, four-contact actions in all worlds, missing-contributor feedback, ended-run recovery, stale mode writes and quota refusal. Existing landscape coverage includes 844×390, 852×393, 932×430, 915×412 and constrained 740×320 variants.
- **Origin Story 2.0 passed**: seven scenes/55 seconds, two naturally timed recordings, character face pixels/draw order, selected hero handoff, controls, interruption, reduced motion, audio and offline replay.
- Boss layout captures assert visible game canvases, bounded boss HUDs and separation from objectives on desktop and mobile. They are explicitly labeled controlled scenes.

[Validation logs and evidence](evidence/validation.json). GitHub CI and final head SHA are recorded in the draft PR so they can identify the exact committed candidate without a self-referential commit inside this file.

## Audio, saves and offline behavior

The original audio engine and score are retained. Automated audio tests check finite non-silent output, transitions, mute/volume persistence, gesture unlock, suspension, offline synthesis and bounded voices/schedulers. Switch cues are asserted once per changed selection. No human listening or physical speaker/headphone certification is claimed.

Legacy saves keep their existing keys. Survival schema and world snapshots remain compatible. Automated cases exercise checkpoint/boss reload, corrupted-primary backup recovery, committed knockout preservation, quota refusal, stale writers, practice replay isolation, completed-world access, offline launches and the established safe-update flow. Tests use isolated browser contexts and controlled fixtures; owner browser saves are never cleared. The new worker precaches the shared interface and style; activation remains within the established safe-update flow.

## Performance and limitations

[Measured performance and long-session report](PERFORMANCE.md) distinguishes the continuous campaign, protected soak workload and short sequential baseline comparison. This is a local Chrome qualification, not proof of physical mobile thermal or memory stability.

Before public release, owner review should include iPhone Safari and Android Chrome: repeated rotation/backgrounding, toolbar/notch behavior, four-contact controls, Bluetooth/audio interruption, fullscreen/PWA resume and offline save/update across a real installed release. Human assessment of game feel, readability and soundtrack remains necessary. Public difficulty balancing is intentionally deferred.

## Review package and files

Open [the visual review](review.html) for same-size before/after titles, pause screens and summaries, all six bosses, failure recovery and the campaign. All captures are actual browser output; click to inspect the native-size image.

Runtime changes: `index.html`, `tahoe.html`, `alaska.html`; `js/app109.js`, `js/tahoe253.js`, `js/core/quest-adventure.js`, `quest-survival.js`, `quest-runtime.js`, new `quest-interface.js`; new `css/polish4.css`; `quest-release.js` and `service-worker.js`. Tests and reproducible measurement/capture scripts accompany this report.

**Release decision: GO for draft owner review; no merge/deployment performed or authorized by this candidate.** Build4.5 is an assessment only; it is not started.
