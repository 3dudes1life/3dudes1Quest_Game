# 3Dudes1Quest v2.5.2 — Adventure 1 Exact Cast Lock

## Fixed

- Removed Tahoe's blocky emergency replacement character from the gameplay path.
- Tahoe now waits until the real Adventure 1 character sprite sheets are fully loaded before Play Tahoe can start.
- Will, Daniel, Caleb, and Rigsby use the exact sprite files from the Adventure 1 Gold Master.
- Zoey continues to use the exact Adventure 1 code-rendered beagle design.
- Added cache-busted immutable cast asset URLs so Safari and the installed Home Screen app cannot reuse a stale or failed character image response.
- If a cast file is genuinely missing, the game names the missing file and refuses to substitute a fake character.

## Unchanged

- Adventure 1 gameplay and world code.
- Tahoe world, enemies, Queen, saves, collectibles, powers, and controls.
- Existing Tahoe progress remains compatible.
