# 3Dudes1Quest v1.0.9 — Adventure 1 Gold Master

This release freezes Adventure 1 as the stable base for Level 2.

## Critical reliability fixes

- The Lake Tahoe portal remains enterable after the victory tableau disappears.
- Old completed saves recover to a stable post-finale state.
- Saves made during the Zoey rescue resume the finale instead of becoming stuck.
- Boss defeat, finale stages, page hiding, app backgrounding, manual saves, and 20-second intervals persist progress.
- Continuing resumes the correct zone instead of replaying the Home Base title card.
- New Game and Replay clear all migrated legacy saves.
- Card and beacon totals are rebuilt from their actual saved arrays.
- Player, character, Triangle Power, boss, portal, and finale values are validated during loading.
- Corrupt save JSON is ignored safely while older saves still migrate.

## Combat consistency

- Daniel no longer receives a body-centered lighting flash when launching a heart.
- Triangle Power remains guarded against duplicate activation.
- The universal emoji + POWER control remains unchanged.

## QA

A non-destructive startup test exposes:

- `window.__GOLD_MASTER_QA__`
- `window.runGoldMasterQA()`

Add `?qa=1` to the game URL to display the report.
