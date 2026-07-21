# 3Dudes1Quest v1.0.8J — Mobile Stable Rebuild

Upload and replace all four runtime files:

- `index.html`
- `css/style.css`
- `js/app108j.js`
- `js/remaster.js`

The previous 1.0.8I package referenced `js/remaster.js` without including it. Version 1.0.8J is self-contained for every file it newly references.

## Improvements

- Stable boot with no blocking orientation gate
- No MutationObserver or sessionStorage dependency during startup
- Existing 1.0.8I, H, and G saves migrate forward
- Apple-inspired touch controls with larger tap targets
- Mobile safe-area support
- Collectible and action messages remain above buttons
- Compact achievements and HUD
- Portrait remains playable; landscape expands to full screen
- Desktop keyboard controls remain unchanged
