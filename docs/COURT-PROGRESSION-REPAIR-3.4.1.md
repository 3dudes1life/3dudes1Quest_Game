# 3.4.1 Supreme Court progression repair

## Reproduction and root cause

The version/cache repair was deployed separately in commit 4441b46c8e6f2778f13dae341cc07254c34a6f8e (PR #8). Fifteen unit tests, full PR CI 38167044170, main CI 38167449184 and Pages 38167449100 passed. Production bytes, visible version 3.4.1 in all three adventures, worker version and offline badges were checked. Production screenshots: test-results/version-repair341. The preceding version audit established that d6542e7 was deployed correctly; SoCal's v3.4 badge and VERSION.txt 2.5.3 were stale text/metadata. The owner's exact browser cache was not inspected; reported 3.0.0 is consistent with an older installed snapshot.

A fresh production adventure, driven exclusively through keyboard movement, jumping and attacks, collected six Gay Cards, restored three Prism Beacons, cleared the protest blockade and activated the Court with one judge before the Queen activated. There was no fresh-game Court activation failure in this reproduction.

A simulated legacy Queen-active checkpoint derived from that actual gameplay save reproduced the bypass on production: no Court completion flag + saved Queen active => applySave set courtDefeated=true, Court remained inactive and the saved Queen resumed. This deliberate grandfathering rule preserves legacy Queen/rescue progress but conflates preserved progression with an actual Court victory. A native 3.4.1 serialization of that migration is committed as tests/fixtures/socal-3.4.1-grandfathered.json. It is a reproduction fixture, not the owner's personal save. We cannot establish which saved/cache state the owner used without their exact data.

The renderer also showed the inactive Queen before Court completion, and the approach objective directed players straight to the Queen. These misleading presentation paths are corrected.

## Targeted repair

Fresh progression remains Flaming Laws / collectibles / blockade → Supreme Court → Queen → Zoey rescue → Tahoe. The Queen is drawn only after Court completion, and the entry objective names the Court. Court victory now records courtVictoryRecorded, independent of legacy grandfathering. Legacy progress is retained rather than retroactively locking players out of completed Queen/rescue stages.

Eligible existing players can choose Complete / Replay Supreme Court in the Adventure Menu; completed adventures have a matching button. Replay pauses/saves the campaign first, refuses to start if saving fails, isolates Court combat with normal controls/powers, and restores the saved campaign after victory or explicit cancellation. Replay starts with full temporary health; original health, collectibles, enemies, score, position/checkpoint, Queen health/phase and rescue/portal progress are restored. Replay does not farm campaign score. Autosaves, rotation and accepted PWA updates save the original checkpoint; a reload safely returns to that campaign rather than replacing it with a partial practice fight. Successful victory adds its genuine Court record. Reloaded partial replays can be started again from the menu.

Deaths during an active Court fight now respawn at its entrance instead of sending players far back across LA. Judges, one/three/five phases, flaming scrolls, warned two-second Rights Drain, power recovery, OVERRULED feedback, damage and rewards in the main adventure are unchanged. Cache revision court-repair-1 remains release 3.4.1 and enters the established safe-update flow. No artwork, powers, audio engine, world engine, save key or schema is replaced.

## Changes and verification

Changed production files: index.html (replay controls/help); js/app109.js (replay, genuine victory record, objective/render gating, Court death recovery, immediate paused-menu refresh, replay boss music selection); js/core/quest-release.js (isolated repair cache revision). Tests: court-progression341.cjs, browser.cjs, release-version.cjs, master340.cjs and the native grandfathered save fixture/fixture notes. The older controlled Court test now explicitly focuses its canvas before trusted Space attacks, matching ordinary startup/resumption.

New browser coverage runs a complete fresh SoCal approach using normal keyboard interactions, all three Court phases, real scrolls, warning/drain/blocked attacks/recovery, visible OVERRULED and Queen activation. Legacy and current 3.4.1 checkpoint checks cover replay, storage failure, original checkpoint autosaves, rotation/input release, death recovery, cancellation, victory, record persistence and completed rescue/portal preservation. The worker regression also confirms an unchanged service-worker script detects an imported cache-revision change and offers UPDATE READY.

Screenshots are under test-results/court-repair341: fresh/replay phase 1/2/3, OVERRULED and Queen unlock. Full unit/browser suites and GitHub CI must pass before deployment; delivery records exact results/SHA and fresh/existing-save production encounters. Physical-device testing and the owner's exact browser/save diagnosis remain unverified.
