# 3Dudes1Quest v2.5.3 — Exact Cast Runtime Fix

## Root cause found
The shared hero renderer called `CanvasRenderingContext2D.ellipse()` with six arguments. The Canvas API requires seven. That runtime TypeError happened immediately before the sprite draw, was caught by the renderer, and returned `waiting`. This is why Rigsby and Zoey rendered while Will, Daniel, and Caleb stayed invisible.

## Fixed
- Corrected the shadow ellipse call to include `rotation`, `startAngle`, and `endAngle`.
- Added an actual browser renderer test for all 18 locked character-animation combinations.
- Tahoe will only enable Play after every Will, Daniel, and Caleb animation successfully paints through the shared renderer.
- Bumped the shared cast asset query and service-worker cache to 2.5.3.
- Added a new `js/tahoe253.js` path so Safari cannot reuse the broken runtime.
- Adventure 1 gameplay and all character art files remain unchanged.
