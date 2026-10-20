# Rendering defect investigation

Baseline inspected: `fcf991f5bf73c9d0789d89a0f5881a5e1991493f`, active `js/core/quest-story.js`, `QuestCast` strips and actual 86-second playback captures.

## Verified causes

1. The old hardship scene painted `30 × 10` blue rectangles at logical y=191 **after** `crew()`. These were symbolic masks, but fixed screen coordinates placed them across the approved characters' noses/mouths. They were real foreground primitives, not a missing-texture fallback or corrupt PNG. The baseline screenshot reproduces the blocks.
2. The old powers scene called `rainbow(x,178,35)` for each character **after** `crew(animation:'attack')`. Each circle occupied the face/head region. Multiple arcs crossed sunglasses and faces. The baseline screenshot reproduces this layering defect.
3. Old scenery used wide repeated rectangular cloud/house primitives. These were intentional procedural scenery, not GPU corruption, but their style differed sharply from the six-boss artwork and compounded the distracting block appearance.

The approved cast crops remain valid. Their strips have transparent gutters, consistent 192×192 human cells, uniform scaling and safe foot pivots. Most apparently solid source pixels have alpha 252/253, so a regression test must compare proper source-over composition, rather than assume fully opaque PNG colors. No protagonist regeneration or alpha rewrite was warranted.

## Actual repair

The defective mask and per-face rainbow code paths are removed. The active painter now orders environment → atmosphere → symbols → approved cast. No scene effect is drawn afterward across the characters. A 350 ms scenery-only dissolve keeps characters at full opacity; reduced motion uses direct cuts. Rainbow energy is a wide rear arch and low ground ellipse; music/heart/cookie symbols sit high or outside the crew. Rain is composited before characters. New scenery is an atlas, not replacement foreground artwork hiding an existing defect.

Every paint starts from identity transform, alpha=1 and nearest-neighbor rendering, and restores context state afterward. Cover crops retain aspect ratio. Human frame indexing follows the existing decoded strips; pets retain their approved 128×96 frame layout. Required cast images decode before playback. Scenery loads once on demand, with an eight-second bound and an existing-art fallback on failure. No game save is read or mutated by this presentation.

## Regression evidence

The composition test identifies draws from the unchanged approved cast images and snapshots the actual face pixels immediately after each sprite draw. It then compares those pixels exactly with the final canvas. This preserves source alpha and native nearest-neighbor rasterization without assuming fully opaque pixels or identical CPU/GPU resampling. A deliberately added face rectangle must fail this comparison. Tests also inspect actual drawImage smoothing, transform restoration, alpha gutters, all seven scenes on desktop and landscape, repeated-play timer/audio bounds and missing-scenery fallback.

Pixel comparisons establish that subsequent rendering does not obscure the approved face. They cannot establish emotional quality, age perception or owner artistic acceptance; the close-ups and complete previews support that review. No physical-device or human listening claim is made.
