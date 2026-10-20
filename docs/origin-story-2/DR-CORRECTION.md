# Dominican Republic opening — targeted visual correction

Continues branch `codex/origin-story-2` and draft PR #13 from `a6815068ffd6c343328a60f1144dce4c46956f87`. No merge or deployment is authorized by this correction.

Scene 1 now depicts a turquoise Caribbean lagoon, lush coconut palms, tropical flowers and colorful Dominican-inspired timber buildings with louvered shutters, verandas and fretwork, under warm golden sunset lighting. The previous opening looked too similar to the SoCal coastal setting.

Only atlas panel 0 is replaced. The build script reconstructs the approved previous atlas, composites the new panel, and losslessly encodes the result. It rejects any decoded pixel change outside that panel. Browser regression tests independently verify all six panel hashes: panel 0 differs and panels 1–5 match their previous pixels exactly. Scene 7 continues to use the untouched SoCal art. The outgoing 350 ms dissolve naturally uses the corrected opening; the later scenes are otherwise unchanged.

The story renderer, captions, seven-scene schedule, 55-second duration, music/synthesizer, controls, approved cast assets, saves and gameplay callback remain unchanged. The existing approved-cast byte checks and face-overlay tests remain active. Cache revision becomes `origin-story-2-dr-1` so the established save-approved update flow can receive the artwork safely.

Runtime atlas: 1,384,810 bytes, up 141,896 bytes from the previous candidate. The new source PNG is review/build material and is not precached. No new runtime image request is added.

## Comparisons and preview

The comparison pairs use a controlled, matched one-second timeline position. The complete preview recordings run naturally without seeking.

- [Desktop before](screenshots/dr-correction/desktop-before.png) / [after](screenshots/dr-correction/desktop-after.png).
- [Landscape before](screenshots/dr-correction/mobile-before.png) / [after](screenshots/dr-correction/mobile-after.png).
- [Updated complete preview](review.html), including fresh naturally timed desktop and landscape recordings.

## Validation and approval

The 16-test unit suite, cinematic player-experience regression suite and naturally timed desktop/landscape composition suite passed locally. Required full GitHub CI must pass on the submitted correction commit. The composition suite covers every scene, source identity, face preservation, layer order, transparency/bounds, keyboard, replay timers/audio, fallback and now the unchanged-panel hashes. The existing cinematic suite covers handoff, Continue, skip/replay, saves, interruption/rotation, reduced motion, four touch sizes, audio and offline playback. Exact final results and commit SHA are recorded in PR #13 and the delivery message.

Physical-device testing, human listening and final owner artistic approval remain unperformed. Return this candidate for approval; do not merge or deploy.

## Original artwork and generation prompt

Generated using the built-in ImageGen tool. No protagonists were generated. Original output `exec-d58ee3e7-f5d2-4083-a75f-80333161fc7a.png` is preserved in the Codex generated-images folder and copied into `docs/origin-story-2/source/dominican-republic.png`. The build output is `assets/story2/scenes.webp`; per-panel pixel hashes are recorded in `assets/story2/manifest.json`.

+Use case: illustration-story. Asset: ONE original 16-bit-inspired pixel-art background for Scene 1 of an emotional retro game cinematic, wide 16:9 composition, preferably 1536x864. Depict a DISTINCTLY DOMINICAN REPUBLIC Caribbean seaside village at a warm golden tropical sunset. Brilliant luminous turquoise and aquamarine shallow Caribbean water, a pale coral-sand shore, lush broadleaf tropical greenery, many curving coconut palms with visible coconuts, richly colored hibiscus and bougainvillea. Distinctive Dominican-inspired Caribbean vernacular architecture framing the waterfront: joyful turquoise, coral pink, lemon yellow and sky-blue painted wooden facades, white gingerbread fretwork, shaded verandas, slender timber columns, louvered shutters, delicate wooden balcony railings and modest corrugated zinc roofs. Cozy romantic small-town Caribbean identity. Golden sunlight warms the colorful houses and lush vegetation; the water remains recognizably TURQUOISE, not dark blue or purple. Detailed crisp pixel clusters and rich original SNES-era scenery, no photorealistic or 3D treatment. Composition: broad open coconut-lined lagoon through the middle; colorful village buildings at left and right edges; low warm sun and tropical clouds; a quiet level pale coral-stone or wooden waterfront promenade across the bottom quarter where three existing characters will be composited later. Keep important architecture, turquoise water and vegetation in the middle/lower three quarters because the top sky may be cropped. Clear central foreground and uncluttered silhouettes for the characters. No people, animals, sprites, words, text, logos, flags, UI, overlays or borders. Absolutely avoid Southern California visual cues: no Mediterranean red-tile villas, no San Diego city skyline, no coastal highways, no arid hills, no California cliffs, no marina or yacht harbor. Do not create a multi-panel sheet. This is one new Caribbean scenery image; all other cinematic scenes and approved cast will remain unchanged.
