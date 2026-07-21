# v1.0.8V Self-Contained Playable Patch

Upload and replace:

- index.html
- css/style.css
- js/app108.js (new)
- js/remaster.js

The old module scripts remain in the repository but are no longer loaded. This version bundles the configuration, UI, controls, game engine, save logic, and startup into one browser script so a missing module or cache mismatch cannot strand the loading screen. The boot screen now also auto-dismisses.
