# 3.1 compatibility fixtures

These JSON saves were produced by the actual game runtime from main commit `2bd2c3932d66526fa141b4de2176e0b5bcc6b429` (3.1.0), served from a separate git archive before 3.2 modifications. Controlled state establishes milestones; the original runtime serializes the save.

- SoCal: one card, score 987, Caleb selected, player x=1300. Original key: `3dudes1quest-save-109`.
- Tahoe: checkpoint 3360, first memory and crystal collected, one nest destroyed, score 2234, Daniel selected. Original key: `3dudes1quest_tahoe_v250`.

`tests/retro.cjs` seeds these unchanged bytes and uses the visible Continue/Play controls to load them. Assertions verify preserved milestones and character selection before new gameplay.

## 3.2 compatibility fixtures

The `*-3.2.json` files were serialized by the actual 3.2.0 runtime from a separate archive of `fbeb0c3312e59db1692f5af70022e288ac2251df`. Controlled milestones: SoCal score 3300, Daniel, first card; Tahoe score 4400, checkpoint 3360, first memory. Audio browser tests load these through Continue/Play before checking sound lifecycle behavior.

The `*-3.3.json` fixtures were serialized by the original 3.3.0 runtime at `0bcd42ed79310b2cd0be5c87c34c5e38f9290d78`, using its actual SoCal pause save and Tahoe save function. Both have score 3407 and Caleb selected; SoCal preserves health 3. Tahoe has checkpoint 3360 and its established loader restores health to 4 (Tahoe never serialized current health). The 3.4 visual suite loads them through Continue/Play and verifies those values.
Native 3.4.0 fixtures were written by the deployed `c455779aec2a373c78ecc16b60a53ceda069e6c3` runtime. Each selects Caleb with score 3417. SoCal preserves Court completion; Tahoe preserves checkpoint 3360 and a lost yellow tree; Alaska preserves shelter 2450 and the first cleared relay. Character tests load these unmodified snapshots into 3.4.1.
