# Origin Story 2.0 — review candidate

**55 seconds. Seven scenes. GO for owner visual/listening review; NO-GO for merge or deployment until explicit approval and green final CI.** This is a separate cinematic build from verified six-boss merge `fcf991f5bf73c9d0789d89a0f5881a5e1991493f`. Production remains unchanged.

## Review package

Open [the visual review](review.html). It includes complete desktop and landscape recordings, seven scenes at both sizes, approved character close-ups, before/after defect comparisons and the actual synthesized music preview. Videos are silent browser recordings and include a brief menu lead-in; the cinematic clock itself is 55 seconds. The embedded **Our Story** replay supplies the actual interactive experience with synchronized audio after a user gesture. Replay does not start or rewrite a campaign.

- [Revised storyboard](STORYBOARD.md): timing, condensed narrative and musical progression.
- [Rendering investigation](RENDERING-INVESTIGATION.md): reproduced root causes and actual repair.
- [Generated scenery / exact prompt](GENERATED-ART.md), [runtime asset manifest](../../assets/story2/manifest.json).
- [Composition and naturally timed playback results](composition-results.json), [player-experience results](player-experience-results.json), [three-world keyboard routes](world-routes.json).

## What changed

The active cinematic uses original pixel scenery matching the six-boss environments, the existing approved cast and existing character animation strips. The rectangular masks and per-face rainbow circles have been removed from the renderer. Environment, atmosphere and symbolic effects now render before the characters. A 350 ms background-only dissolve softens scene changes; reduced motion uses direct cuts. Seven concise scenes preserve the Dominican Republic beginning, adult cast, shared family, pandemic/economic struggle/hateful attacks, love becoming strength, community/planet mission, humor and both beagles. The five-world order remains SoCal → Tahoe → Alaska → Hawaii → Costa Rica, with retirement together in Costa Rica.

The final scene reuses the active SoCal background and the existing callback hands the selected character directly into actual Home Base gameplay. Continue bypasses the story. Our Story remains a non-destructive replay. Native controls, Escape pause, keyboard focus, rotation/background recovery, reduced motion, saved audio settings and offline playback remain supported. The pause notice is kept in the upper composition safe zone.

Music reuses the existing original chiptune score and single shared engine. The shorter scene schedule rearranges gentle → reflective → hopeful → triumphant/adventurous cues at 0, 15, 24 and 40 seconds, followed by the existing SoCal gameplay cue. The shared engine retains its short voice fades, bounded scheduler and gesture restrictions. The WAV is rendered from that same score/synthesizer, not a separate recording or downloaded song.

## Test evidence

16 unit tests pass locally. All three candidate normal-keyboard routes pass. The player-experience suite passes the naturally timed 55-second presentation, all caption beats, selected-character handoff, Continue bypass, save preservation, skip/replay, pause/background/rotation, mute, reduced motion, four touch viewports and offline playback. The composition suite adds naturally timed desktop and landscape recordings, every scene, approved-cast byte hashes, exact post-sprite face-pixel comparisons, a deliberate face-overlay negative control, actual drawImage nearest-neighbor state, transform restoration, alpha gutters, keyboard navigation, five repeated replays with bounded audio/timer state, and missing-scenery fallback.

The full local browser suite passed, including the installed Tahoe offline check after the cinematic scenarios. Final GitHub CI status is recorded in the PR and final delivery for the exact submitted commit. Initial composition-test development exposed source-alpha and CPU/GPU reference-raster differences; the final test snapshots the actual approved draw before checking for later overlays. Those test-reference failures did not justify altering the approved characters.

## Weight and runtime behavior

One new runtime atlas: **1,242,914 bytes**, 1024×864; about 3.54 MB of decoded RGBA before browser/GPU overhead. It decodes lazily once per visit when the story is opened, then is reused for replays. The existing atomic PWA precache includes this asset once per new release. Original source PNG, screenshots, WAV and review videos are excluded from runtime precaching. Build-time nearest-neighbor resizing/near-lossless encoding avoids per-frame processing. Load failure falls back to the already-loaded SoCal art; required cast strips decode before playback.

One animation request is pending while active, zero after finish/pause; existing audio voices remain bounded at 40 with one scheduler. No runtime pixel readback was added: face probes and alpha analysis run only in tests. New release metadata keeps version 3.4.1 and changes cache revision to `origin-story-2-1`, retaining the established save-approved update flow and caches.

## Modified files and scope

Runtime: `js/core/quest-story.js`, `css/origin-story.css`, `js/core/quest-release.js`, `service-worker.js`, new `assets/story2/scenes.webp` and manifest. Build/test: `scripts/build-story2.cjs`, `tests/origin-story.cjs`, new `tests/story2-composition.cjs`, `tests/browser.cjs`. Evidence and source: `docs/origin-story-2/`. Historical origin documentation remains available.

No game engine, boss/world runtime, approved protagonist/pet asset, power, combat balance, save schema or progression state was changed. No new world or survival mechanic was started.

## Known limitations / acceptance

Physical iPhone Safari and Android Chrome testing was **not performed**. No human listening or owner emotional/artistic acceptance is claimed. Browser simulations cover landscape at 844×390, 852×393, 932×430 and 740×320 plus portrait interruption. Real notch/toolbar/rotation, memory pressure, startup latency and sustained device behavior remain checks for hardware. Automated pixel tests establish layering and source identity, not artistic quality or perceived age. Silent recordings do not establish audio/video synchronization; the interactive preview and shared-score WAV are provided for listening review.

Obtain the owner's explicit final approval before merging or deploying. Stop after this candidate; do not start another build automatically.
