# PNG action-pack integration specification

This audit replaces **no** character, boss, enemy, background or production PNG. The owner's full approved collection is a separate integration phase. An annotated concept/action sheet is not accepted automatically as a runtime atlas.

## Delivery manifest

For each approved pack supply: stable actor/world identifier; original approved reference; production PNGs with real transparent alpha; frame rectangles in pixels; state names and frame order; frame durations/loop behavior; facing; common foot/origin pivot; visual bounds; projectile emission anchor; optional damage mask; intended logical draw size; palette/style notes; and licensing/ownership confirmation. Label incomplete/missing poses explicitly. Keep reference-only posters outside the runtime asset tree. Keep text labels, logos, decorative panels and neighboring actors out of frame rectangles.

## Existing contracts to preserve

- Shared logical world/canvas:1280×720, aspect-preserving viewport manager; touch render buffer640×360 and desktop1280×720. Nearest-neighbor rendering; test both outputs without stretching.
- Protagonists: `assets/cast341/{will,daniel,caleb}.png`, one6×6 authoring sheet each. Two rows/world, twelve authored poses/world. The current loader discovers transparent gutters and normalizes frames into192×192 cells. Maximum body180px high/184px wide, at least4px side padding, foot baseline188; common scale per character/world. Draw box126×126; **collision remains44×72**, centered on the established character anchor. Attack arms and jump poses must not change that collision box.
- Runtime strip counts: idle6, walk8, run8, jump4, fall4, attack6, hurt6, celebrate6, back6. These contain repeated authored poses; they are not proof of that many unique drawings. Current pose mapping: idle0, walk1/2, run3/4, jump5/fall6, attack7/8, hurt9, celebrate10, back11. If new packs add unique frames, change the art adapter under separate approval while preserving simulation clocks and attack timing.
- Will: bald adult, short grey facial hair, sunglasses, DJ headphones and cyan/purple music identity. Daniel: short dark hair, sunglasses/facial hair and heart identity. Caleb: adult man in his40s, facial hair/sunglasses, rainbow mullet and unicorn hoodie. Retain casual/mountain/winter identity. New Caleb reference supersedes the earlier childlike reference.
- Pets: `assets/cast340/{socal,tahoe,alaska}.png` uses a **different** six-column layout with normalized row boundaries0/265/509/753/948/1145. Rigsby/Zoey occupy rows3/4. Derived cells128×96, draw78×58. Do not reuse the human6×6 slicing rule. Keep companions and rescue roles.
- Powers remain internal `rainbow`/`heart`/`cookie`, displayed DJ Soundwave/Heartfield Burst/Cookie Toss. Soundwave58×22; heart38×34 with radius98 field; cookie32×32 with radius220 explosion. Preserve velocity, homing/ricochet, damage, fuse, cooldown rules and facing. Source of truth: `QuestCore.POWER_CONTRACT` and the committed3.4 power fixture.
- Boss/enemy boxes, states and source hooks are in [asset-inventory.csv](asset-inventory.csv). Most are **procedural renderers**, not existing PNG atlases. Replacing an unused `assets/sprites_hd` PNG will not update those actors. Add an approved drawing adapter at the active renderer; retain hit/attack/phase callbacks and base enemy save indices.
- Backgrounds/terrain: SoCal and Tahoe sections are largely procedural; Alaska uses a generated cached backdrop plus procedural terrain. Home Base also loads an SVG. Supply separate parallax/foreground/terrain layers with repeat, origin and section metadata. Graphics may follow existing platform rectangles and Tahoe's continuous ground function; do not turn the level into a new tile engine or alter collision heights to fit artwork.
- Portraits currently derive128×128 head crops from the same idle production frames, shown at24px/18px in HUD. Supply/approve a head crop per world if automatic cropping is unsuitable. Preserve accessible character/power text and44px controls; do not put vital labels into image pixels alone.

## Acceptance pipeline for the later phase

1. Inventory and hash references separately from runtime files; bind every requested actor/state to its approved manifest entry.
2. Validate file dimensions/alpha, transparent gutters, nonempty frames, frame counts, consistent pivots/baselines and no clipped attacks. Reject ambiguous annotated grids; request proper production frames instead of guessing.
3. Create normal-scale contact sheets for all poses/worlds and portraits, both facings, native desktop and simulated landscape. Obtain owner approval of the produced runtime art; reference approval is not automatic output approval.
4. Verify animation at actual movement/attack clocks, hurt/invulnerability and victory. Confirm unchanged hitboxes, projectiles, collision, saves and boss behavior with the existing contract fixtures and natural routes.
5. Precache a complete new snapshot with a distinct cache revision; test offline, failed installation, save-before-update activation and existing saves. Keep rollback assets until active clients have a safe update path.
6. Merge only after automated checks and visual review. Record physical iPhone Safari/Android Chrome checks separately; emulation alone does not verify device quality.

No requirement here authorizes new bosses, additional worlds or new powers. Toxic Bloom/Pipeline art may be inventoried as future-only until their playable designs are separately approved.
