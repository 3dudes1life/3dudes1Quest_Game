# 3Dudes1Quest v1.0.8K — Safari Game Mode

Upload and replace all four runtime files:

- `index.html`
- `css/style.css`
- `js/app108k.js`
- `js/remaster.js`

## Safari mobile fix

This release prevents iPhone Safari from zooming into POWER, JUMP, SWITCH,
movement, pause, and journal controls during rapid taps.

It adds:

- Fixed 1× viewport scale
- `touch-action: none` on the game and every control layer
- Double-tap zoom suppression
- Pinch/gesture zoom suppression while gameplay is active
- Page-scroll and overscroll suppression
- Native selection, callout, and tap-highlight suppression
- Direct pointer-driven POWER, JUMP, movement, and SWITCH input
- Synthetic Safari click suppression
- Input reset during orientation changes and page transitions
- Dynamic viewport support for changing Safari browser chrome
- Save migration from 1.0.8J and earlier versions

## Preserved

- 1.0.8J mobile HUD and safe-area layout
- Apple-inspired glass controls
- Desktop keyboard play
- Existing levels, boss, collectibles, and objectives
- Hero selection and character switching
