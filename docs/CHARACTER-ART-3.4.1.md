# Character artwork — 3.4.1

Baseline: verified deployed 3.4.0 `c455779aec2a373c78ecc16b60a53ceda069e6c3`; rollback branch `codex/rollback-3-4-0`. The 3.4 atlases are preserved for pets and rollback. Their older human rows are no longer used by the active hero/portrait pipeline.

Production assets: `assets/cast341/will.png`, `daniel.png`, `caleb.png`. Each is a newly generated six-column/six-row RGBA authoring sheet. Two rows per world supply twelve distinct poses: idle, two walking steps, two running steps, rising jump, falling jump, attack windup, attack release, hurt, victory and back view. These are recreated frames, not cropped owner reference sheets.

Primary references: Will’s Neon Retro DJ Character Sprite Sheet; Daniel’s 3Dudes1Quest_3.4.1_Daniel_Action_Reference; Caleb’s newest `caleb retro rainbow game player.png`. The newest Caleb PNG supersedes `caleb_s_rainbow_cookie_sprite_sheet.png`. Caleb is explicitly an adult man in his forties, with short facial hair, sunglasses, rainbow mullet and unicorn hoodie. Will stays completely bald with DJ headphones; Daniel retains short styled dark hair, sunglasses and neatly trimmed facial hair. No edits to Will or Daniel were made because of Caleb’s correction.

Source outputs (built-in image generation; originals retained):

- Will: `exec-6d44680f-44d8-4009-88c8-3141921de3d0.png`.
- Daniel: `exec-ab7f91ae-3aa9-4b8d-bed4-fce75d71cf8f.png`.
- Caleb: `exec-b644357d-1a5c-4877-b0c1-033a6da68715.png`.

Generated files were copied from the Codex generated_images folder into the repository. Discarded Caleb variants are not runtime assets. Actual alpha/channel checks and runtime renders, rather than generator previews, determine acceptance.

QuestCast detects empty alpha gutters and rejects unsafe grids. It trims occupied bounds once, uses a single scale per character/outfit across all its poses, creates 192 × 192 aligned animation strips, and clamps wide poses inside four-pixel horizontal margins. The destination remains 126 × 126 with the existing shared foot position and 44 × 72 player collision box. Idle/victory include a small intentional bob. Walk/run/fall/back are explicit animation strips; back poses are reviewable but gameplay continues to face left/right. No movement or camera behavior changes.

Portraits and compact HUD images derive from the same active world artwork. Character appearance and maturity require visual review; automated pixel tests establish nonempty frames, transparency, margins, consistent baselines and complete animation coverage, not a person's perceived age.

Daniel’s Reno photograph was mentioned in the brief but not attached or located. His approved action PNG supplies the current hairstyle/identity reference; photographic cross-check remains outstanding. Owner approval of the generated production visuals is required before deployment.

