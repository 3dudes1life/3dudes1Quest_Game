# Upload v2.5.0

Upload every file and folder in this ZIP to the repository root, preserving the folder structure and replacing matching files.

Important new files:

- `js/core/quest-core.js`
- `js/tahoe250.js`
- `css/core250.css`

Important replaced files:

- `index.html`
- `tahoe.html`
- `js/app109.js`
- `js/pwa241.js`
- `service-worker.js`

No image files are included or replaced.

After GitHub Pages finishes deploying, fully close and reopen the Home Screen app once. The service worker will detect v2.5.0, activate it, and reload the app automatically.
