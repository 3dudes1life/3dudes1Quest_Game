# Compatibility matrix

Results apply to this candidate source, not to an already deployed release. The final draft PR records the exact commit and CI run. [Validation index](evidence/validation.json) links raw results and logs.

## Desktop and engine coverage

| Environment | Scope and result | Boundary |
|---|---|---|
| Installed Chrome, macOS arm64 | Automated keyboard, gameplay, menus/focus, supported fullscreen, viewport resize, DPR2 large screen, input latency, encounters and repeated workload | Headless browser; physical display, actual browser zoom, thermal stability and human comfort not certified |
| Native Safari 27.0.1, macOS 27.0.1 | Limited GUI smoke PASS: SoCal/Tahoe/Alaska entry, movement/jump/power input, character switching, pause, saved team, fresh menus and safe landing refresh | Separate private test window. Native WebDriver timed out. Full campaign/zoom/desktop display matrix remains owner acceptance |
| Playwright WebKit 26.5, macOS arm64 | Automated three-world keyboard/menu/layout/fullscreen-capability matrix | WebKit engine, not Safari or physical iPhone |
| Playwright Firefox 153.0, macOS arm64 | BLOCKED before page load by local graphics/sandbox launch failure | No security settings changed or reduced. Linux CI is a separate environment |
| Chromium, Firefox and WebKit on Linux | Strict separate GitHub CI job; exact versions and27world/profile cases in CI artifact | Engine tests do not establish branded browser/device certification; no allowed launch skips in CI |
| Physical desktop Chrome/Safari/Firefox | Full human matrix UNVERIFIED | Use [owner checklist](OWNER-CHECKLIST.md) for browser zoom80/100/125/150%, actual displays, keyboard comfort and listening |

## Emulated mobile and layout coverage

| Coverage | Automated evidence | Boundary |
|---|---|---|
|844×390,852×393,932×430 | Three-world controls, settings, preferences and interruption bounds | CSS viewport/touch emulation, not those exact phone models |
|740×280 and740×240 | Minimum44px controls, maximum positions, large/left-handed layouts and every boss in Legacy/Survival | At240px height the preserved full1280×720 world becomes small; geometric reachability is not a readability/comfort certification |
| Portrait↔landscape | Active move/jump/power, paused/settings, release/save/recovery/resume | Controlled viewport/orientation events; not an OS rotation or phone call |
| Simultaneous contacts | Trusted Chrome CDP move+jump+attack, release one contact, fourth-contact switch/team, pause | Engine event delivery, not real digitizer latency |
| Safe areas, toolbar changes, standalone display mode | Simulated padding, height changes and display-mode fixtures; existing offline/update suite | No real notch, browser chrome or installed mobile lifecycle claim |
|30/60/90/120Hz |24cases around actual fixed-step loops, normal/late boss states,480steps/case | Deterministic simulation fixture omits rendering; not panel refresh testing |
| Physical iPhone Safari / Android Chrome / installed PWA | UNVERIFIED — mandatory before full certification | No connected phone or approved candidate HTTPS preview available |

## Accessibility, saves and controller assessment

Keyboard focus stays in open pause/dialogue/recovery menus and returns to the canvas. Existing reduced-motion, visible focus, labels, text-based boss warnings and audio-independent cues remain; no color-only warning is introduced. Settings use labeled native select/range controls,44px targets, saved values, reset and visible storage-refusal feedback. Geometry and automation cannot establish human readability at every zoom/device size.

Both save families and full committed Survival envelopes remain compatible. Active/previously played stale writers still freeze; untouched titles can safely refresh from a newer valid envelope. Campaign progress is unaffected by touch preference changes. Existing boss/checkpoint/knockout/backup/quota/offline and safe-update tests remain required gates.

Gamepad API presence and connected count are recorded per engine. No connected gamepad or existing gameplay polling/mapping is assumed. This candidate adds no controller system.

**GO for a draft owner review after automated gates pass. NO-GO for full cross-platform certification until the required physical checks are recorded. No merge or deployment is performed.**
