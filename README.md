# 3Dudes: Prism Panic — Browser Game Demo

An original, campy, PG-13, 8-bit-style platformer prototype built with plain HTML, CSS, and JavaScript.

No libraries, build tools, accounts, or paid services are required.

## Play locally

Open `index.html` in a modern browser.

For the most reliable local testing, run a small web server from this folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Controls

- Move: `A` / `D` or arrow keys
- Jump: `Space`, `W`, or up arrow
- Ability: `X`
- Switch character: `1`, `2`, `3`
- Touch controls appear automatically on phones and tablets

## Character abilities

- **Will — Sass Wave:** fires a “YAS” wave that stuns enemies.
- **Daniel — Prism Shield:** temporarily blocks damage.
- **Caleb — Power Smash:** destroys cracked beige blocks and nearby enemies.

## Goal

Collect all six prism shards and enter the rainbow portal.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload every file from this folder to the repository root.
3. Open the repository’s **Settings**.
4. Choose **Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the `main` branch and `/ (root)`.
7. Save. GitHub will provide the public game URL.

## Project files

- `index.html` — page structure and controls
- `style.css` — responsive arcade presentation
- `game.js` — game loop, physics, characters, enemies, level, sound, and pixel-art drawing

## Notes

This is a prototype using original names, mechanics, and programmatically drawn pixel art. It does not use Nintendo, Mario, or other third-party game assets.
