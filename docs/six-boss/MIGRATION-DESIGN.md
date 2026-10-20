# Six-encounter save/progression design — before implementation

Verified baseline: `39c8d2f4a46420fb2e925bc41fca45c1d846520f`. Pages39342695567 and main stability39342695666 passed. Eight live production files matched main; normal live86-second cinematic retained Caleb and allowed movement. Rollback: `codex/rollback-origin-story-39c8d2f`.

The owner now explicitly authorizes the substantial changes assessed in the master audit. Reference posters remain reference-only; resulting runtime art still requires final owner approval.

## State and migration rules

Add an explicit, versioned encounter record independent of historical `bossDefeated`/Court grandfathering fields. Keep existing storage keys, old collectibles/actor indices, backups and completed-world access. Never clear storage during migration. Never treat an old Queen win as proof that Toxic Bloom, Pipeline Meltdown or a nine-judge final was won.

Fresh SoCal order: Queen in the PCH midpoint, then the Court of Supremes at City Hall after six cards, three beacons and the existing blockade. Queen defeat restores local color and does not start rescue; final Court victory begins the existing Zoey/rescue/portal sequence. Reserve the final arena before8840 so nine judges and their attacks cannot overlap the portal. West Hollywood identity is a landmark within the existing Hollywood stretch; do not remove or relabel the coastal route.

Fresh Tahoe: lake encounter and three damageable cores precede climbing and existing forest/nest progression; all existing memories, ground, nests and Queen remain. Fresh Alaska: explicit saved pipeline stages/valves precede the summit; existing relays/checkpoints/treasures remain. Flood failure returns to a safe pre-encounter checkpoint without erasing completed valves or legacy progress.

For old completed worlds, retain completion and outgoing destination access; offer explicit optional encounter replay. For old in-progress saves beyond a newly added gate, retain the checkpoint, record new encounters as unplayed, and allow an explicit return/replay rather than silently granting victory or trapping the player. Preserve actual old Court victory as a historical achievement separate from new final-nine completion. Preserve active old Queen health/phase when resuming; avoid reconstructing a rescue solely from a relocated mid-boss being dead.

Save/reload each phase and exercise primary/backup recovery. Sanitize every new numeric stage, timer, health and coordinate. Replays snapshot and restore the campaign, never award duplicated campaign rewards, and must refuse to start if the snapshot cannot be saved. Reset held input on replay, death, resize and interruption. Bound spawned minions and projectiles. All three established powers must damage each required target using the existing targeting/collision contract.

## Verification gate

Unit migration fixtures: fresh; Queen active; genuine old Court win; grandfathered Court flag; interrupted rescue; completed world; old Tahoe summit; old Alaska summit; malformed additive fields; backup recovery; quota failure. Natural required routes supplement controlled all-powers/phase tests. Neither new functionality nor art is deployment-ready until automated checks and owner visual/gameplay approval are complete. No Hawaii/Costa Rica gameplay; no permanent character elimination; no public difficulty increase.

## Implemented continuation contract

`QuestEncounters.read(world, save)` adds a version1 `encounters` object to each existing save; the historical schema versions and storage keys stay intact. `legacyAccess` preserves completed-world/rescue access, while `pastMid` preserves an old checkpoint beyond a newly inserted encounter. Neither flag marks a new encounter defeated. Old Court achievements remain historical `courtVictoryRecorded`; the new nine-judge final requires `finalComplete`.

SoCal records `queenComplete`, `finalComplete` and active Court phase/individual judge HP. New campaigns fight the Queen at PCH before City Hall. A pre-existing active Queen fight can finish at its saved LA arena with its original HP/phase, then proceed through the new Court. Midpoint Queen death never infers a rescue. New Court HP restores by phase; transient Rights Drain is cleared on reload and death.

Tahoe records three Bloom core HP values, contamination and explicit completion. Existing summit checkpoints retain access and can use Replay Toxic Bloom. A contradictory incomplete record with three zero cores repairs the final core rather than silently granting a victory.

Alaska records three valve HP values, five stable industrial-enemy defeat flags, explicit stage, flood timer and completion. Stage cannot advance beyond valve closure while any valve remains open. Death/reload during the flood restarts the warning at a safe ledge, retaining all closed valves, defeated industrial actors and existing relays/treasures. Old Glacier/Summit checkpoints can optionally replay the new encounter.

Optional replay requires successful campaign saving and a separate durable replay snapshot before entering. Replay autosaves/rotation/update saving write only the sidecar; the campaign's rewards/checkpoint/collectibles remain protected. Cancel restores the campaign. Victory records only the relevant encounter completion, retaining the campaign score and original position. If storage fails, entry/return is refused with a visible message and the in-memory protected snapshot stays available. Reload during replay safely returns to the last saved campaign; it does not auto-resume the optional fight. Original primary/backup recovery remains owned by QuestRuntime.

Coverage is in `tests/runtime.test.cjs`, `tests/court-progression341.cjs`, `tests/six-boss.cjs` and `tests/encounter-saves.cjs`. Controlled cases are kept separate from `test:audit` normal keyboard routes. No future-world gameplay or permanent elimination state was introduced.
