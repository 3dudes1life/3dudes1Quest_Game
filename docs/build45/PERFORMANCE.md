# Latency, pacing and repeated-workload evidence

## Method and environment

Apple M2 Pro,16GiB,macOS 27.0.1, installed Chrome 155.0.8059.85. Desktop 1280×800 and touch-emulated 844×390. Baseline is the exact verified deployed Build 4 commit 0ca1a2b; candidate is the final qualified runtime fingerprint. Both variants are preloaded into memory by one localhost server with identical headers/MIME behavior. [Transport manifest](evidence/comparison-transport.json) and [source hashes](evidence/qualified-source.json) identify the measured bytes. All 176 approved asset hashes remain identical.

Measurements ran sequentially after the final test/soak browsers closed and native Safari was paused. The machine is shared and unthrottled; background activity, browser-global caches, sequential order and small sample size limit causal comparisons. Earlier cross-disk startup measurements and renderer experiments are excluded. No loading/rendering speedup is claimed.

## Delivered event → actual action

Capture-listener performance.now to actual position, jump velocity or projectile-array mutation. Switch/team finish at the mutation notification immediately following private Survival state changes. Native keyboard events and trusted CDP touch contacts; three trials/action/world/profile/variant, 180 traces. Fixtures reset position/fill team charge; not a campaign. Excludes OS/hardware delivery, digitizer sampling and display scanout.

Values are median / nearest-rank p95 / maximum in milliseconds. Each cell combines 9 trials across the three worlds; raw per-world/trial timestamps remain in [latency.json](evidence/latency.json).

|Profile/action|Baseline ms|Candidate ms|
|---|---|---|
|keyboard movement|12.10 / 33.00 / 33.00|11.40 / 38.30 / 38.30|
|keyboard jump|13.30 / 29.80 / 29.80|13.60 / 14.90 / 14.90|
|keyboard attack|12.90 / 30.10 / 30.10|13.60 / 29.20 / 29.20|
|keyboard switch|0.40 / 0.70 / 0.70|0.40 / 1.60 / 1.60|
|keyboard team|0.50 / 1.00 / 1.00|0.60 / 1.40 / 1.40|
|touch movement|15.40 / 32.00 / 32.00|16.10 / 32.30 / 32.30|
|touch jump|15.40 / 32.00 / 32.00|15.70 / 33.20 / 33.20|
|touch attack|15.80 / 33.50 / 33.50|16.00 / 32.60 / 32.60|
|touch switch|0.70 / 1.50 / 1.50|0.60 / 1.40 / 1.40|
|touch team|0.70 / 1.40 / 1.40|0.90 / 1.30 / 1.30|

These measurements verify responses without confusing RAF cadence with latency. Small single-session differences do not establish a perceptual improvement or a hardware latency guarantee. The demonstrated repairs concern cancelled/stuck inputs and usable layout/preferences.

## Encounter animation/frame pacing

Controlled native encounter prerequisites: nine judges, Bloom/minions, phase 3 Pine Queen/larvae/flyers, Pipeline flood and phase 3 Frost/salmon/blizzard. Each scene samples 179 real RAF intervals with actual full-team activation around 1 s. No teleports/completion fixtures are labeled as natural-route evidence. Values: p95 / maximum ms, count over 33 ms. RAF includes scheduling/simulation/rendering; no GPU draw-completion timing.

|Encounter/profile|Baseline p95 / max / >33|Candidate p95 / max / >33|
|---|---|---|
|queen desktop|16.70 / 16.80 / 0|16.80 / 16.80 / 0|
|queen touch|16.70 / 16.80 / 0|16.80 / 16.80 / 0|
|court desktop|16.80 / 16.80 / 0|16.70 / 16.80 / 0|
|court touch|16.80 / 16.80 / 0|16.80 / 16.80 / 0|
|bloom desktop|16.80 / 16.80 / 0|16.80 / 16.80 / 0|
|bloom touch|16.80 / 16.80 / 0|16.70 / 16.80 / 0|
|pine-queen desktop|16.80 / 16.80 / 0|16.80 / 16.80 / 0|
|pine-queen touch|16.70 / 16.80 / 0|16.70 / 16.80 / 0|
|pipeline desktop|16.70 / 16.80 / 0|16.70 / 16.80 / 0|
|pipeline touch|16.80 / 16.80 / 0|16.80 / 16.80 / 0|
|frost-queen desktop|16.80 / 16.80 / 0|16.70 / 16.80 / 0|
|frost-queen touch|16.70 / 16.80 / 0|16.80 / 16.80 / 0|

[Raw encounter data](evidence/encounters.json) retains geometry, team charge 100→0, cache, audio and heap observations. One brief scene per case does not prove long boss-battle/thermal stability.

## First use, loading and decode

Explicit first-use CPU probes draw each actor attack/hurt/defeat after input trials at representative boss sizes, preserving original pixels. The probe batches many cold poses in one task; its total task is not ordinary gameplay. Individual worst draws remain reported. Renderer/loading experiments were discarded because evidence did not justify a gain and one scratch-canvas hint failed pixel equivalence. Original renderer retained.

|Probe|Baseline ms|Candidate ms|
|---|---|---|
|Individual first-use draws: median / p95 / max|1.40 / 6.90 / 15.50|1.65 / 9.20 / 12.90|

Baseline worst first-use probe: toxic-bloom / attack at 205 px, 15.50ms (tahoe, touch).

Candidate worst first-use probe: toxic-bloom / attack at 205 px, 12.90ms (tahoe, touch).

The Long Tasks API also records tasks during startup and the input observation window, excluding any task overlapping the intentionally batched first-use probe. These are browser main-thread tasks, not GPU timings.

|Variant|Startup tasks / max ms|Input-window tasks / max ms|
|---|---|---|
|baseline|12 / 322|0 / 0|
|candidate|11 / 340|0 / 0|

Ready-time values include initial page navigation, asset readiness and the existing boot presentation; they are not pure download/decode timings.

|Page ready,6contexts per variant|Baseline|Candidate|
|---|---|---|
|Median / p95 / max ms|514.00 / 1086.00 / 1086.00|525.50 / 1031.00 / 1031.00|

A separate 66-image probe uses 11 unchanged approved images×3 rounds×2 variants, fresh contexts/image objects, with no game initialized. Load-event time includes fetch and initial decoding; explicit Image.decode after onload records remaining decode/queue wait, not all decoder CPU or GPU upload. Browser-global caches can remain.

|Image probe: 33 samples per variant|Baseline median / p95 / max ms|Candidate median / p95 / max ms|
|---|---|---|
|Load event|1.30 / 2.40 / 2.80|1.40 / 2.60 / 2.70|
|Decode wait after load|11.90 / 32.50 / 32.60|12.00 / 32.70 / 33.00|
|Total ready|13.20 / 34.60 / 35.10|13.40 / 34.70 / 35.60|

[Raw decode probes](evidence/asset-decode.json). No mobile-network, physical decoder, GPU-memory or texture-upload certification. Cold contour draws remain a measured risk, not a claimed repaired bottleneck.

## Twenty-minute repeated workload

Two isolated desktop/emulated-touch contexts in one headless Chrome, each 20 minutes. Protected local tester namespace; actual keyboard movement/jump/attack/switch/pause, direct world entry every minute and synthetic earned-charge fixtures followed by real T activation. GC-forced retained JS heap sampled about every 10 s. This is not a natural campaign. Other regression/capture browsers ran concurrently, so soak RAF windows are diagnostic and excluded from matched pacing comparisons.

|Profile|Wall s|Samples|Switch/pause/team/world entries|Max schedulers / sampled voices / lifetime peak voices / contours|
|---|---|---|---|---|
|desktop|1200.1|120|240 / 60 / 20 / 20|1 / 9 / 17 / 20|
|touch|1200.2|120|240 / 60 / 20 / 20|1 / 12 / 18 / 20|

|Profile/world|GC heap min–max MiB|First→last same-world MiB|Listeners min–max|Max documents|
|---|---|---|---|---|
|desktop socal|3.12–4.02|3.12→3.98|392–401|2|
|desktop tahoe|2.88–3.36|2.88→3.34|182–187|1|
|desktop alaska|2.81–3.37|2.81→3.34|191–197|1|
|touch socal|3.19–4.05|3.19→4.01|393–398|2|
|touch tahoe|2.91–3.42|2.91→3.38|182–186|1|
|touch alaska|2.82–3.38|2.82→3.36|192–201|1|

The workload reports no page errors or failed approved assets and retains the scheduler/voice/cache bounds. Heap values describe JS after forced GC within the current document/world; they omit decoded image surfaces, GPU resources and process-wide memory. Repeated navigation resets documents, so bounded observations do not prove absence of every same-scene leak. No thermal or battery claim. [Raw workload](evidence/soak.json).

## Decision

The candidate is suitable for owner review after automated CI passes. Full physical certification remains NO-GO/UNVERIFIED. Required iPhone/Android/PWA tests include 30-minute native sessions, actual interruptions and profiler observations. No further optimization release or artwork/renderer change is started automatically.
