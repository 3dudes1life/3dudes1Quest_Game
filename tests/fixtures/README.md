# 3.1 compatibility fixtures

These JSON saves were produced by the actual game runtime from main commit `2bd2c3932d66526fa141b4de2176e0b5bcc6b429` (3.1.0), served from a separate git archive before 3.2 modifications. Controlled state establishes milestones; the original runtime serializes the save.

- SoCal: one card, score 987, Caleb selected, player x=1300. Original key: `3dudes1quest-save-109`.
- Tahoe: checkpoint 3360, first memory and crystal collected, one nest destroyed, score 2234, Daniel selected. Original key: `3dudes1quest_tahoe_v250`.

`tests/retro.cjs` seeds these unchanged bytes and uses the visible Continue/Play controls to load them. Assertions verify preserved milestones and character selection before new gameplay.

## 3.2 compatibility fixtures

The `*-3.2.json` files were serialized by the actual 3.2.0 runtime from a separate archive of `fbeb0c3312e59db1692f5af70022e288ac2251df`. Controlled milestones: SoCal score 3300, Daniel, first card; Tahoe score 4400, checkpoint 3360, first memory. Audio browser tests load these through Continue/Play before checking sound lifecycle behavior.
