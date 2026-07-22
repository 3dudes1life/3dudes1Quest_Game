# 3Dudes1Quest v2.5.0 — Shared Cast Engine

## Locked forever across every adventure

- Will, Daniel, Caleb, Rigsby, and Zoey now come from one shared runtime: `js/core/quest-core.js`.
- Adventure files are no longer allowed to redefine the cast.
- Character names, colors, movement speeds, jump values, power names, power icons, sprite paths, and pet rendering are centralized and frozen.

## Exact Adventure 1 powers everywhere

- Will: **Rainbow Ricochet** — same launch size, speed, lifespan, target range, and two ricochets.
- Daniel: **Heartfield Burst** — same homing heart, trapping field, delayed burst, and area effect.
- Caleb: **Long-Range Cookie Toss** — same arc, sticky fuse, ground arming, and splash damage.
- Both Adventure 1 and Tahoe launch powers through the same shared factory.

## Controls locked

- Move: Arrow keys or A / D.
- Jump: Up Arrow or W.
- Power: Space, X, F, or the on-screen Power button.
- Space no longer jumps in Tahoe.
- Screen controls are forced visible on both desktop and mobile.

## Cast presentation locked

- Tahoe uses the exact Adventure 1 hero animation sheets for idle, walk, jump, attack, hurt, and celebrate.
- Rigsby uses the same Adventure 1 sprite and fallback renderer.
- Zoey uses the same Adventure 1 code-rendered beagle design—no replacement Zoey artwork.
- Level 1 and Level 2 share the same logical character hitboxes and movement values.

## Tahoe combat and quality

- Jumping on beetles or the Pine Beetle Queen does not damage them.
- Beetles, nests, and the Queen must be defeated with character powers.
- The Pine Beetle Queen received a code-only anatomy and presentation pass: segmented body, six articulated legs, wings, antennae, mandibles, eyes, crown, phase aura, and stronger boss labeling.
- No image files were generated or included.

## App updates

- Home Screen app cache bumped to `2.5.0`.
- New shared core, Adventure 1 runtime, Tahoe runtime, controls CSS, and locked sprites are precached.
- Existing automatic update checks and forced activation remain enabled.
