# Reproduce the candidate checks

Use this branch's exact final commit. The draft PR records its SHA and exact-head CI run. `package.json` pins Playwright; CI uses Node24 and Linux browser dependencies. Local qualification used Node26.11.1 on macOS, installed Chrome 155.0.8059.85 and Playwright WebKit 26.5.

```sh
npm install --ignore-scripts
npx playwright install chromium firefox webkit
npm test
npm run test:browser
npm run test:audit
SURVIVAL=1 npm run test:audit
node tests/cross-platform.cjs
```

On Linux, use `npx playwright install --with-deps chromium firefox webkit`. Local installed Chrome can be selected through `CHROME_PATH`. `NODE_PATH` is only needed when using the bundled Codex Node dependency directory instead of a local npm install. All test browsers use isolated contexts. Do not clear owner saves to make a test pass.

The cross-platform job is strict by default. Movement checks assert the remaining held alias and wait for actual displacement with a bounded3s functional timeout; they do not use a fixed160ms sleep as a speed guarantee. Failures save engine/profile/world, held input, pause/focus/visibility, position and a screenshot. Safe-area assertions wait for scheduled CSS inset values before checking the same bounds; the test-only QA overlay is closed. Separate event-to-action traces measure responsiveness. `ALLOW_ENGINE_BLOCKED=1` was used only for the documented local pre-page Firefox launch failure; it never permits a functional assertion failure. CI does not set it. Firefox's Linux result is separate from native branded Firefox acceptance.

## Local visual review and repeated workload

```sh
node scripts/serve-review.cjs 8888
```

Open `http://127.0.0.1:8888/docs/build45/review.html`. The server prints an older review-path default; the Build 4.5 path above is the intended page.

In another terminal:

```sh
SOAK_MINUTES=20 SOAK_LABEL=final node scripts/soak-build45.cjs http://127.0.0.1:8888
node scripts/capture-controls45.cjs
```

Control comparisons default to baseline8889/candidate8888; environment variables `BASELINE_URL` and `CANDIDATE_URL` can override these. The protected soak navigates worlds every minute, uses real keyboard input and labeled team-charge fixtures, and samples forced-GC JS heap. It does not complete a natural campaign or certify mobile heat/battery behavior. Full natural route and continuous-campaign evidence comes from the browser/audit suites.

## Matched performance comparisons

Prepare a separate unchanged archive/checkout of exact baseline `0ca1a2bc79246a08e567dfc92f28052b611a2c81`. The comparison server reads it from `/tmp/quest-build45-baseline`, or set `BUILD45_BASELINE` to another absolute path. Current working directory is the candidate. Freeze both sources before starting the server: it snapshots files into memory and will not notice later edits.

```sh
node scripts/serve-comparison45.cjs 8890
```

After all regression/soak browsers have closed, run the following sequentially with both variables set in the measurement terminal:

```sh
export BASELINE_URL=http://127.0.0.1:8890/baseline
export CANDIDATE_URL=http://127.0.0.1:8890/candidate
node scripts/measure-input45.cjs
node scripts/profile-encounters45.cjs
node scripts/measure-assets45.cjs
```

The `/manifest` endpoint records per-file SHA256 values. Baseline and candidate share one in-memory transport and response headers. Copy raw `test-results/build45` data with methods intact; do not label delivered-event timing as hardware-to-photon latency or RAF as input latency. Every actor/encounter fixture and remaining limitation is described in [PERFORMANCE.md](PERFORMANCE.md).

Phone testing requires an owner-approved HTTPS preview of the exact candidate. A phone's localhost does not point to this Mac. Use [OWNER-CHECKLIST.md](OWNER-CHECKLIST.md); no candidate preview deployment is performed by this PR.
