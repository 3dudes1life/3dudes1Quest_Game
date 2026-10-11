# 3Dudes1Quest 3.4.0 — Three-World Master Release

Baseline/rollback: verified 3.3.0 `0bcd42ed79310b2cd0be5c87c34c5e38f9290d78`. Only SoCal, Tahoe and Alaska are playable. Costa Rica and Hawaii remain future worlds.

## Graphics and characters

Active entrypoints are `index.html → js/app109.js`, `tahoe.html → js/tahoe253.js`, and `alaska.html → QuestAdventure.create(AlaskaWorld)`. Historical scripts/art are retained but do not supply the active character sprites or portraits.

The destructive 320 × 180 buffer and mandatory 40-color quantization are removed. Desktop uses native 1280 × 720; touch uses 640 × 360 with exact 2× nearest-neighbor presentation. Physics/camera coordinates remain 1280 × 720. Frame-by-frame palette readback/recoloring is gone. The active Home Base SVG is preserved; platforms gain clear top/bottom edges and Tahoe gains tiered forest details. Comparison modes `?renderqa=640|960|1280` support repeatable diagnostics.

Three original transparent cast atlases in `assets/cast340` provide separate casual, mountain and winter outfits. Will is bald with his existing pink/cyan glasses and beard. Daniel's navy/teal outfit and heart buckle differ from Caleb's orange jacket/cookie satchel. Rigsby's tricolor beagle/teal collar differs from Zoey's cream/brown coat/pink collar. No collision boxes, movement stats or character powers change.

`QuestCast` slices explicit atlas row bands, trims transparent bounds once at startup and aligns animation strips at a shared foot baseline. Human runtime frames are 192 × 192, rendered at 126 × 126 with surrounding transparency; pets use 128 × 96 strips. Idle breathing, alternating steps, rising/falling poses, attack recoil, tilted hurt reactions and bouncing celebrations use nearest-neighbor frames. Portraits derive from the same active world atlas. Loading/renderer checks gate gameplay; no older Will hair sprite appears while waiting. See [CAST-ART-3.4.md](CAST-ART-3.4.md) for asset sources and generation specifications.

Actual-size five-character lineups for all worlds and gameplay captures are in `test-results/master340`. Before/after and resolution comparisons are in `test-results/release-3.4`.

## Southern California

The original six Gay Cards, three Prism Beacons, blockade, Queen of Beige, Rigsby, Zoey rescue and Tahoe portal remain. Four Walking Flaming Laws are introduced gradually; some patrol elevated platforms. They warn before fireballs, occasionally jump, respond to all powers and burst into rainbow paper.

The fictional Supreme Court follows the blockade and precedes the Queen: one judge (3 HP), three judges (2 HP each), then five (1 HP each). Scroll attacks are staggered. Rights Drain has a one-second warning, lasts two seconds and restricts only primary attacks; movement/jumping remain available. Pausing suspends its timer. Death clears the restriction. Completion displays OVERRULED!, clears legal projectiles, saves the cleared milestone and leaves a three-second celebration before the Queen encounter. Existing saves already inside/past the Queen are grandfathered through the new Court gate.

## Lake Tahoe

The Pine Beetle Queen retains three phases, four nests, original trail enemies, memories, weather, checkpoints and Alaska portal. Forest Drain targets three visible trees. Yellow root markers can be hit by every power during a five-second infection window. Saving a tree awards feedback/score; losing one turns it yellow and increases attack frequency by 10%, capped at 30%. The Queen never heals from the forest. Flying beetles join phase one; giant larvae appear in later phases and become crawlers after landing. Active minions are capped at 24.

Victory removes larvae, scatters surviving beetles and gradually greens the affected trees. TAHOE IS ALIVE AGAIN! and FOREST RESTORED! announce recovery. Saved dead trees retain their bounded boost; unfinished infections reset safely when reloading.

## Alaska

[ALASKA-DESIGN.md](ALASKA-DESIGN.md) records the final encounter design. The 7,600-unit route crosses Trail Station, Frozen River, Glacier Pass and Aurora Ridge: three power-operated Aurora Relays, twelve optional shards, two supply caches, marked thin ice, stepping ledges, forecast gusts and three healing shelters. Zombie salmon patrol/jump/flop throughout the route, including a river-platform school; owls provide warned aerial attacks.

The original fictional Frost Queen declares “NO SARCASM IN THE LAST FRONTIER!” Phase one uses snowballs/salmon; phase two uses blizzards, fixed warned icicle locations and temporary ice; phase three combines attacks, larger salmon and a three-hit shield. Any power can break it. Warnings last 800 ms; active nearby enemies and effects are bounded. Death clears arena hazards/summons and resets the boss while keeping relay/treasure milestones.

Victory breaks the shield, restores harmless normal salmon, stops blizzards and paints a rainbow aurora. Alaska completion persists. The ending announces ADVENTURE 3 COMPLETE, THE LAST FRONTIER IS SAVED!, NEXT ADVENTURE: COSTA RICA, COMING SOON... No fourth adventure is implemented.

## Shared systems, audio and saves

QuestAdventure composes the existing fixed-step simulation, movement/camera/input, cast/power contract, renderer, audio graph, viewport lifecycle and backup saves. SoCal and Tahoe retain their existing runtime files and save keys. Alaska has its own versioned save key. Cleared boss/progression milestones survive reloads; unfinished Court/Alaska boss encounters restart safely. The 3.1 viewport manager remains the only viewport owner, including safe areas, landscape controls/preferences, rotation pause/save/input release and explicit resumption.

All five original scores and 26 effects remain. Two original eight-bar Alaska scores are added: Aurora Footprints (132 BPM) and No Sarcasm in the Last Frontier (168 BPM). Ice, snow, shard and salmon effects bring the total to 30. The single 3.3 audio graph, volume/mute settings, gesture rules, voice limits and scheduled-voice gain-retirement fix remain intact. No sampled music, duplicate engines or external media services.

QuestJourney exposes three playable links, retains badges and migrates Alaska completion from its save. Manifest shortcuts and the 3.4.0 PWA cache include all three worlds and the new shared runtime/atlases. Existing save and audio/touch preference keys remain compatible.

## Verification evidence

The 13 unit tests cover fixed-step frame-rate invariance, collisions, movement/jumping/camera, backup saves, original score/effect validity and Alaska route geometry. Browser tests include native 3.1, 3.2 and 3.3 saves; powers, collectibles/checkpoints, existing endings/transitions; sound lifecycle/signal/node limits; offline launch/audio; all legacy layout/rotation cases and new Alaska coverage. Tested touch sizes include 844 × 390, 852 × 393, 932 × 430, 740 × 280 and Android-sized 915 × 412, plus three desktop sizes. Three simultaneous touch inputs are released after rotation, including paused/menu scenarios.

Actual gameplay: a complete live-clock keyboard Alaska run from New Game through all relays, the unmodified Queen and ending; live Court and enhanced Tahoe Queen fights from controlled arena setups; additional SoCal/Tahoe keyboard movement/jumping/powers with all characters. Arena setup bypasses earlier collection requirements and positions the player; fights themselves use normal keyboard events, normal health and normal clocks. Alaska's complete route uses no teleports, health edits, invulnerability overrides or enemy removals.

Separate controlled scenarios isolate Court multiplication/temporary drain/save migration, every power on Flaming Laws and infection points, Forest Drain interruption/failure/save/boost/restoration, larvae/flyers, Queen phases/blizzard/icicles/shield, all powers breaking the shield, checkpoint deaths and backup-save recovery. These are not claimed as full legacy campaign playthroughs.

Resolution comparisons (120 animation frames each, local headless Chrome): median 16.7 ms; p95 16.7–16.8 ms at all three resolutions on desktop and emulated touch. Observed SoCal JS heaps were 6.2–7.4 MB with redesigned cast assets. Alaska has separate timing/heap samples. These short samples measure Mac browser behavior, not phone hardware, long-session leaks or battery usage. The cached Alaska mountain/star backdrop avoids rebuilding static scenery each frame.

Real Web Audio rendering checks seven scores and 30 effects for finite, non-silent, unclipped signals. Human listening is not claimed. Physical iPhone Safari/Android Chrome/PWA checks remain outstanding: rotation, toolbar transitions, calls/backgrounding, audio output changes/silent mode, performance and battery. Fractional outer viewport scaling preserves aspect ratio but cannot guarantee one physical pixel per logical pixel on every screen.

CI uploads `test-results` as gameplay-screenshots. Deployment requires the full local suite and PR checks to pass; final merge SHA and live-release verification are reported with delivery.
