# Build 4 performance qualification

**A dedicated Build 4.5 optimization release is not justified by these measurements alone.** No sustained pacing regression, runaway listener/cache count or duplicated audio scheduler was observed. First-use contour draws approach a frame budget on this fast host, and retained heap rises slightly; both warrant physical-device profiling before proposing an optimization release. Build4.5 has not started.

## Environment and method

Local Apple M2 Pro, 16GiB RAM, macOS27.0.1, Chrome155.0.8059.85, Node26.11.1. Desktop1280×800 and touch-emulated844×390. Headless, unthrottled Chrome; no physical iPhone/Android, thermal, battery, GPU-memory or low-end-device certification. [Environment](evidence/environment.json).

The final unchanged-runtime workload lasted **1200.489 seconds (20 minutes)** with two concurrent contexts in one Chrome. Each profile recorded **240 switches, 60 pause/resume cycles, 20 successful team activations and 20 direct world entries**, with **zero page errors**. Real keyboard movement/jump/attack/switch/pause inputs were used. It uses protected local tester saves and synthetic HP-threshold charge fixtures before actual T activation; it does not establish natural campaign earning or normal difficulty.

A separate native-keyboard continuous Survival campaign verifies real progression and contributions. The soak repeatedly navigates worlds directly; it does not claim 20 complete campaigns.

Sources were SHA256-recorded before and after the full workload and remained unchanged. [Fingerprint](evidence/qualified-source.json), [raw samples](evidence/soak-final.json), [summary](evidence/soak-summary.json). Runtime/CSS qualification includes all three entries and the worker. Test/capture/report scripts are not included in that runtime fingerprint.

## Long-session observations

Retained heap was sampled after explicit CDP garbage collection every10 seconds. The table excludes the first15 seconds of each world entry for comparable warm samples; raw data includes every sample. MB means decimal MB. These ranges and first/last changes are not evidence of a plateau or proof that a leak cannot exist.

| Profile/world | Warm retained heap MB | First → last warm MB | Listener range | Contour cache peak MB |
|---|---|---|---|---|
| Desktop / socal | 3.84–4.18 | 3.84 → 4.17 | 374–381 | 1.37 |
| Desktop / tahoe | 3.23–3.50 | 3.37 → 3.49 | 165–170 | 0.47 |
| Desktop / alaska | 3.33–3.51 | 3.36 → 3.48 | 174–181 | 0.37 |
| Touch / socal | 3.89–4.22 | 3.99 → 4.22 | 373–379 | 1.37 |
| Touch / tahoe | 3.31–3.56 | 3.41 → 3.52 | 165–169 | 0.47 |
| Touch / alaska | 3.37–3.57 | 3.45 → 3.53 | 174–180 | 0.51 |

Warm DOM node ranges remain 1558–1603 for SoCal, 734–749 for Tahoe and 595–610 for Alaska, across both profiles. SoCal reports at most two documents, Tahoe/Alaska one. Contour entries peak at20 (cap96), with no asset load failures. Audio has at most one scheduler and18 peak voices (budget40), with no voice accumulation observed. The small retained-heap increase (roughly0.08–0.33MB between comparable first/last samples) has not been attributed to a specific allocation and is not dismissed as harmless by assumption.

All120 frame windows per profile have p95 between16.7 and16.8ms. Fractions over33ms are0.0031% desktop and0.0063% touch. These are observed RAF intervals, not proof of rendering throughput or input latency. No aggregate p95 is reconstructed from window quantiles.

The first **797.719 seconds** overlapped local regression browsers; forced GC and navigation also affect pacing. Thus the soak is primarily repeat-operation and retained-resource evidence. Its steady frame intervals must not be presented as a controlled FPS benchmark. A completed five-minute baseline diagnostic is retained separately, but baseline switching released movement, so it is **not a matched long-session workload comparison**. Interrupted exploratory runs are not qualification results.

## Separate sequential comparison

After regression and soak browsers closed,12 samples ran sequentially: baseline/candidate × three worlds × desktop/touch. Each uses239 RAF intervals while walking, then isolated first-use attack/hurt/defeat draws. Asset/contour readbacks are CPU probes and do not measure GPU upload or every first-use path. A single sample per configuration has no statistical confidence interval; boot variance is not a proven regression.

All figures below are **baseline / candidate**. [Full measurements](evidence/performance.json).

| World/profile | RAF p95 ms | Intervals >33ms | Local boot ms | Maximum first-use draw ms |
|---|---|---|---|---|
| Socal · desktop | 16.7 / 16.8 | 0 / 0 | 802 / 785 | 12.5 / 11.5 |
| Tahoe · desktop | 16.7 / 16.7 | 0 / 0 | 564 / 596 | 15.4 / 15.1 |
| Alaska · desktop | 16.7 / 16.8 | 0 / 0 | 528 / 606 | 11.7 / 9.9 |
| Socal · touch | 16.7 / 16.7 | 1 / 0 | 583 / 502 | 11.2 / 5.6 |
| Tahoe · touch | 16.7 / 16.8 | 0 / 0 | 567 / 647 | 14.7 / 15.9 |
| Alaska · touch | 16.7 / 16.7 | 0 / 0 | 541 / 651 | 10.0 / 9.2 |

These short samples show similar pacing. Candidate cold boot spans502–651ms outside SoCal's785ms; baseline spans528–802ms. One baseline touch sample has a >33ms interval; none of the candidate samples do. This limited sample does not establish that the candidate is faster. Maximum first-use contour draw15.9ms remains a useful physical-device investigation target.

## Reproduction and limits

Install the repo's Playwright dependency and Chromium, or set CHROME_PATH to a suitable local Chrome. Serve the candidate with `node scripts/serve-review.cjs 8887`.

- `SOAK_MINUTES=20 SOAK_LABEL=final node scripts/soak-build4.cjs http://127.0.0.1:8887`
- Archive the baseline commit to a temporary checkout, set `BUILD4_BASELINE` to it, then run `node scripts/measure-build4.cjs` with other test browsers closed.
- Run `npm test`, `npm run test:browser`, `npm run test:audit`, and `SURVIVAL=1 npm run test:audit` separately.

Physical Safari/Android profiling, longer uninterrupted single-world sessions, heap allocation traces, image/GPU memory and real-device thermal tests remain open. A focused Build4.5 would be appropriate if those identify sustained missed frames or attributable resource growth; this candidate does not initiate it.
