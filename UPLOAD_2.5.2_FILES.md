# Upload v2.5.2

Upload every file and folder in this ZIP to the repository root, preserving the folder structure.

Replace:

- `tahoe.html`
- `service-worker.js`
- `js/pwa241.js`
- `js/core/quest-core.js`
- the 21 files inside `assets/sprites_hd/`

Add:

- `js/tahoe252.js`
- `EXACT_CAST_2.5.2_CHANGELOG.md`
- `VERSION.txt`

The sprite files are not new artwork. They are byte-for-byte copies of the locked Adventure 1 Gold Master assets.

Do not rename folders. After GitHub Pages finishes deploying, refresh once. The PWA updater will replace the 2.5.1 cache with 2.5.2 automatically.
