# Owner-operated acceptance — currently UNVERIFIED

**Full cross-platform certification is NO-GO until the required physical iPhone Safari and Android Chrome checks pass. The automated review candidate can still be reviewed.**

No physical phone is connected to this task. The current local review server is bound to this Mac's loopback address; a phone cannot use its own127.0.0.1 to reach it. Use an owner-approved HTTPS preview of the exact PR commit for physical testing. Do not test current production and record it as the unmerged candidate. No preview deployment is performed without owner approval.

Record one result per device/browser/install mode in `evidence/owner-results-template.json`. Include exact commit, model, OS version, browser version, date, viewport/display mode, screenshot/video filenames, observed problems and PASS/FAIL/BLOCKED/UNVERIFIED. Blank fields are unverified, never a pass. Keep original screenshots at actual gameplay scale. Use a separate test browser profile or a backed-up test campaign; do not clear real player saves.

## Required environments

| Environment | Status | Evidence needed |
|---|---|---|
| Physical iPhone Safari | UNVERIFIED — device and approved preview required | Model/iOS/Safari version, screenshots, results below |
| Physical Android Chrome | UNVERIFIED — device and approved preview required | Model/Android/Chrome version, screenshots, results below |
| Installed iOS PWA | UNVERIFIED | Same iPhone, standalone mode, offline/update evidence |
| Installed Android PWA | UNVERIFIED | Same Android, standalone mode, offline/update evidence |
| Desktop Safari | Limited native GUI smoke PASS; full human matrix UNVERIFIED | Safari 27.0.1/macOS 27.0.1 private-window smoke recorded; full campaign/zoom/display checks pending |
| Desktop Chrome | Automated installed Chrome tests available; human window review pending | Browser/OS, laptop/large-monitor/zoom checks |
| Desktop Firefox | Local launch blocked; Linux engine CI is separate evidence | Actual branded Firefox/OS and normal-window checks |

Playwright WebKit does not certify Safari. Playwright-patched Firefox does not establish user-device Firefox acceptance. Emulated touch, pixel ratio, safe insets and toolbar sizes do not certify a physical display or reserved system gestures.

## Per-environment procedure

1. Open the approved preview, verify its exact candidate commit/release cache revision, and record the environment fields. Inspect title/Continue/Legacy/Survival labels with keyboard or touch.
2. In SoCal, Tahoe and Alaska, test move+jump, move+attack, move+jump+attack, switch while moving/attacking, fourth-contact switch/team action, rapid reversals, repeated jumps/switches, and releasing one finger while retaining others. Confirm no stuck action after every contact is released.
3. Adjust size, handedness, movement/action inset and lift. Check comfortable thumb reach and no overlap with the world/HUD. Reload and change worlds; preferences must persist. Reset touch controls; campaign progress must remain.
4. Test each world's pause, settings, dialogue, character status, objectives, charge meter and boss warnings at the device's shortest toolbar-expanded landscape height. Check both handed layouts near notches and navigation indicators. Capture native-size screenshots.
5. Rotate portrait→landscape and back while moving/jumping/attacking, while paused and inside settings. Inputs must release, the recovery gate must appear when applicable, and gameplay must resume only through explicit recovery. Verify focus and controls afterward.
6. Background, switch browser tabs, lock/unlock, interrupt with a real call/notification and return. Audio/input must suspend safely; resume explicitly. Repeat with headphones/Bluetooth. Do not label a synthetic visibility event as a phone-call test.
7. Enter/exit supported fullscreen and installed mode. Test browser/system edge gestures; reserved gestures may remain under OS control. Check that returning does not retain held movement or sound.
8. Complete all six encounters and one SoCal→Tahoe→Alaska Survival campaign, retaining the same roster. Verify health/OUT, charge/contributions, checkpoints, restoration and post-boss travel. Test a separate Legacy campaign. Record clarity/fairness problems without changing difficulty.
9. Save during normal play and around each boss; reload and resume. Verify an existing compatible save and a committed knockout. Test offline after a complete online load/install. Restore connectivity and use the existing safe-update flow; never clear saves to make an update appear successful.
10. On desktop, verify keyboard-only menus, visible focus, Escape/Pause, simultaneous aliases, window resizing, laptop and large/high-DPI screens, real browser zoom80/100/125/150%, fullscreen and reduced motion. Record Gamepad API availability/connected hardware; no controller mapping is implemented in this build.
11. Play at least30 minutes on each physical phone, including nine judges, Bloom/minions, Pine Queen/larvae/flyers, flood, Frost/blizzard/salmon and team bursts. Record stalls, heat, battery behavior and audio. If available, collect Safari/Chrome profiler traces. Do not infer GPU memory or thermal stability from JS heap or RAF alone.
12. Attach results and screenshot/video paths to the PR. Any missing required device, unusable controls, save loss, stuck input or repeatable severe stall keeps full certification NO-GO. Owner approval is separately required before merge/deployment.
