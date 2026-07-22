# 3Dudes1Quest v2.5.1 — Cast Visibility Hotfix

## Fixed
- Will, Daniel, and Caleb can no longer disappear in Adventure 2.
- Tahoe now uses a guarded shared renderer that always falls back to the exact Adventure 1 code-rendered hero when a sprite is late, missing, malformed, or rejected by the browser.
- Shared sprite painting now validates source frames and restores the canvas even when Safari throws an image error.
- Tahoe now uses Adventure 1 animation selection: idle, walk, jump, attack, hurt, and celebration.
- Rigsby's sprite draw now uses the same guarded sprite function.
- A final emergency renderer keeps the selected dude visible even if an unrelated Tahoe draw error occurs.

## Preserved
- Adventure 1 Gold Master files and gameplay are untouched.
- Existing Tahoe save data remains compatible.
- Will, Daniel, Caleb, Rigsby, Zoey, controls, and powers remain locked through QuestCore.
