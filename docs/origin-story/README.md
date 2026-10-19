# Origin story cinematic — owner review

**Status: preview only. Production is unchanged.**

Starting point: completed and verified master audit commit `d2509392365aef1004657a12adfe41971f98c6f4` (audit PR #10). The cinematic is on a separate branch and targets that audit branch for review. No new release number.

## Preview

Serve this repository with any static HTTP server. Open `/index.html` and choose **Our Story** to watch safely without replacing a save. A first new adventure plays it automatically; later new games can start directly. Continue always goes directly to saved gameplay. Full duration: **86 seconds**. Skip and pause are always visible.

The owner review page is `/docs/origin-story/review.html`. It links the playable game, all nine storyboard scenes, mobile examples, actual gameplay handoff and the locally generated music preview. Run `node tests/origin-story.cjs` to regenerate the audio and full evidence under `test-results/origin-story/`.

[Storyboard and timing](STORYBOARD.md) · [Desktop and mobile screenshots](screenshots/) · [Review page](review.html)

## Changes

- Nine original procedural pixel scenes, approved narrative unchanged, established hero/pet strips preserved.
- First-entry, skip, replay and direct selected-character handoff; separate presentation preference, no save migration.
- Shared original chiptune arrangements: gentle sunset, minor storm, rising theme and adventure theme, plus established subtle effects.
- Native modal keyboard focus, HTML captions, mute, explicit interruption recovery, reduced motion and compact landscape layouts.
- Story files added to the existing service-worker precache; safe-update flow preserved. Candidate cache revision changes without changing version 3.4.1.
- Shared nonplayable future-world labels reflect Hawaii → Costa Rica; existing levels, powers, bosses, saves and artwork remain intact.

## Verification

Final local and GitHub CI outcomes are recorded in the PR delivery. Automated coverage includes the full normally timed presentation and exact caption sequence, selected-character handoff, Continue, replay/skip save preservation, audio gesture lock and actual signal, rotation/background pause, reduced motion, four mobile landscape sizes and offline replay. Existing full unit, browser and three-world route suites remain required.

Review evidence deliberately distinguishes natural full playback from controlled timeline seeking for mobile screenshots. The WAV preview is an offline render of the same shared-synth musical arrangements, not a recording of speaker output or a claim of human listening verification. It excludes UI/scene effects. Playback honors your saved mute/volume preferences.

## Known limitations / decision

**NO-GO for production until owner cinematic approval.** Technical test results alone do not grant visual/music approval. No physical iPhone Safari/Android Chrome/PWA, thermal/battery or assistive-technology certification has been performed. Native modal support assumes modern browsers. No spoken voiceover or standalone video is supplied. Existing atlas poses include repetitions; this presentation preserves them.

Alaska still ends with its existing Costa Rica teaser; no ending or gameplay route was rewritten. The preview itself and future journey metadata use the newly approved Hawaii-before-Costa-Rica order. Resolve the older teaser in a separately scoped content change if desired.

Do not automatically begin villain-art integration. Production remains at the preserved baseline until the owner approves the relevant PRs.
