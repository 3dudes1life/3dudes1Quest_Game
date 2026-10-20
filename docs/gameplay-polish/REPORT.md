# Enemy visibility & Tahoe forest progression — PR14 addition

The owner authorized both additions in the existing Survival draft, retaining the explicit **no merge / no deployment** gate. Survival remains intact. No new release version, world, engine, artwork pack, dependency or save schema is introduced. Cache revision changes to `survival-polish-1`; the established pause/save update flow remains in use.

## Gameplay screenshot audit

[Native comparison preview](review.html): 1280×800 desktop and 844×390 simulated touch landscape, with light and dark/detail-heavy scenery sections in every world. Before is the completed Survival commit `74e8cef779a1e8d7517893af83165a3f206b8236`; after is this candidate. The capture script uses actual world renderers and native entities at controlled camera positions. Alaska’s industrial capture calls the normal pipeline activation function to spawn its existing enemies. These are repeatable visual fixtures, not a claimed uninterrupted human playthrough.

- SoCal: beige bots and parchment scroll enemies share warm values with architecture/sunset; judges and drones lose dark silhouette detail in city scenery.
- Tahoe: brown beetles merge with trunks and the new dying forest; flying beetles lose wing edges against mountain and lake detail. Attack warning marks need a stable contrasting backing.
- Alaska: pale salmon and owls merge with snow; workers, machinery and oil silhouettes merge with the detailed industrial section. Existing outlined attack labels already provide adequate backing.

The shared measured-art renderer adds a muted light inner pixel edge and dark outer pixel edge, at most two logical pixels outside the rasterized silhouette. Approved sprite RGB is drawn over the edge; no recoloring, blur, filter, glow or replacement art. Integer destination anchors avoid fractional edge placement. Cached masks use the same canvas rendering backend as the original sprite to avoid nearest-neighbor sampling differences between CPU and GPU canvases. Short flat contact shadows apply to grounded enemies; drones, flyers, falling larvae, jumping Flaming Laws, flying Queen phases and floating bosses do not receive floating contact marks. Existing warning timing is unchanged; SoCal/Tahoe marks gain a compact dark backing.

Masks are built once per image/frame/size and bounded to 96 cached entries, with tracked storage. Normal rendering draws cached canvases; there is no per-frame pixel readback. Original background pixels and parallax calculations are unchanged. No enemy collision, movement, health, damage, spawn, phase or difficulty value changes.

## Tahoe progression and restoration

Existing approved green/brown/recovering tree props now use a fixed rank per position. Position thresholds target 10%,28%,58%,88%,96% infection. The finite decorative tree distribution measures **7%,25%,59%,90%,100%** across shoreline, early, middle, late and arena bands. Six decorative opening trees make the first infection visible immediately. These trees add no collision or combat targets.

The approved dying-forest background panel begins in the later forest rather than waiting for the final boss. No background asset was regenerated, recolored or replaced. Toxic Bloom still independently controls the contaminated lake and its restoration.

A real Queen defeat stops Forest Drain and active root infections using existing victory mechanics. A visual wave begins at the defeated Queen, propagates across world positions after a 500ms pause, and shows the approved recovering tree before green. The arena becomes green first, followed by the rest of the forest over roughly nine seconds. The existing restored background panel returns after 1.8 seconds. Restoration is visible in gameplay without depending on the victory text. The existing `bossDefeated` save flag makes a loaded completed forest fully green, including offline reload; no new persisted field is required. Root attack HP, timers, boost, geometry, rewards and checkpoints are preserved.

## Verification and evidence

The new browser module is registered in the full suite and GitHub workflow. It verifies all 19 actors in idle and attack poses on light/dark colors, unchanged near-opaque interior colors within their original alpha-compositing budget, bounded contrasting edges and flat grounded contact marks. Desktop and touch runs verify deterministic infestation bands, an actual-projectile Queen victory, stopped Drain/infections, brown → recovering → green stages, saved/reloaded restoration, and the separate contaminated/clear lake sequence. An installed-worker offline reload verifies the completed green forest.

[Regression results](results.json), [performance measurements](performance.json), and screenshots in the comparison preview provide reproducible evidence. Local verification passed: **20/20 unit tests, the full browser suite, and all six normal keyboard routes (legacy and Survival across three worlds)**. [Local validation log](validation.json). The final art/offline and polish assertions were rerun successfully after tightening wave-growth coverage and optimizing first-use mask generation with a separable distance scan. Exact-commit CI results are recorded in the draft PR and delivery message. Existing save, six-boss, cinematic, audio, offline, keyboard, mobile rotation and Survival tests remain required.

## Performance

Sequential unthrottled local Chrome measurements compared completed Survival `74e8cef` against the combined candidate in six world/device pairs, 239 walking RAF intervals each. Both stayed at **p95 ≤16.8ms**, with **zero intervals over33ms**. First-use action draws peaked at **15.4ms** locally; sampled cached masks used **2.60–3.94MiB**. Added runtime source is 3940 bytes; no runtime art or dependency was added. Mask storage after first-use action probes is reported separately from the JS heap in [raw measurements](performance.json); GPU storage and sustained physical-device thermal behavior are not established by this test. The separable distance scan reduces one-time mask work; warmed drawing uses the cached edge. First-use probes and cache bytes are retained in the raw data instead of being hidden by the walking summary.

## Files

- Runtime: `js/core/quest-master-art.js`, `js/app109.js`, `js/tahoe253.js`, `js/core/quest-release.js`.
- Verification: `tests/gameplay-polish.cjs`, registration in `tests/browser.cjs`, capture and measurement scripts.
- Review: this report, native comparisons, regression/performance evidence and updated Survival report/preview/scope record.

## Limits and owner review

Browser emulation does not establish physical iPhone Safari or Android Chrome success. Review movement/combat readability, restored forest timing, reduced-motion preferences and long-session thermal behavior on real devices. Short walking performance measurements do not establish worst-case boss stress or memory-leak absence. All approved source artwork remains intact; the same draft PR awaits final owner review and remains unmerged and undeployed.
