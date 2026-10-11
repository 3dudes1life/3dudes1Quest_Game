# 3.3.0 — Retro Audio & Professional Gameplay

Baseline: verified 3.2.0 main commit `fbeb0c3312e59db1692f5af70022e288ac2251df`.

## What was played and what was controlled

Before implementation, both adventures were served locally and their opening sections played with ordinary keyboard movement, held/tapped jumps, powers, and character switching in an 844×390 touch-capable Chromium viewport. SoCal reached Hillcrest at x≈1813 with one collected card and 600 points; Tahoe reached x≈1793 with 3000 points, one nest cleared, and one memory. Title, pause, objective, and gameplay screenshots are retained locally under `test-results/release-3.3/audit`. This was browser-driven input and visual inspection, not a complete human playthrough.

The baseline unit/browser suite exercised all powers against enemies, save recovery, deaths, both boss/finale sequences, world transitions, mobile rotations and offline play. Bosses, late collectibles/checkpoints, end sequences, and save migrations use controlled state to reach those scenarios. No complete human campaign playthrough, physical iPhone/Android test, or human listening approval is claimed.

High-impact findings addressed:

- SoCal had a small private oscillator helper while Tahoe had no corresponding effects or shared settings. Neither world had a soundtrack.
- Paused gameplay intercepted Space before native menu buttons could activate. Save/Resume and sound controls now work with keyboard activation.
- The Queen of Beige could fire immediately on arena entry. Entry now gives 750 ms before the first shot, followed by a visible/audio warning during the final 300 ms before shots. Protesters also signal their throws. Movement physics and attack damage remain unchanged.
- Tahoe chargers accelerated without a windup. They now pause for a visible/audio 250 ms warning. The existing 350 ms Queen charge warning gains audio and a pixel marker.
- SoCal's boss hit-flash state was unused. Boss and enemy damage now visibly flashes in coordination with distinct effects.
- Title instructions explain direction, jump height, power attacks, contact damage, and pause/settings. SoCal checkpoint/respawn messages and Tahoe's explicit Save checkpoint button improve feedback. Screenshot review also exposed an unstyled Tahoe checkpoint notice overlapping the HUD; it now sits inside the world view, names the correct checkpoint, and reports storage failure honestly.

## Original soundtrack and effects

`js/core/quest-score.js` contains authored, deterministic musical phrases and harmonies, not random note generators or copied tunes:

| Cue | Original composition | Tempo |
| --- | --- | --- |
| Title | Three Dudes, One Quest | 116 BPM |
| SoCal | Sunshine Sidequest | 144 BPM |
| Tahoe | Pines Above the Lake | 126 BPM |
| Both bosses | No Beige Allowed | 172 BPM |
| Victory | Color Comes Home | 132 BPM, one-shot |
| Defeat/respawn | Short descending four-note cue | Under one second |

Pulse lead, triangle bass, quiet square accompaniment, and filtered deterministic noise percussion share one synthesis path. Eight-bar exploration/boss phrases loop on the audio clock. Victory is a four-bar fanfare; death ducks music briefly while the defeat cue plays. The title motif and named score registry can be reused by future worlds.

Twenty-six short effects cover jump, landing, Gay Card, beacon, switching, Rainbow Ricochet, Heartfield launch/burst, Cookie Toss, hit/defeat, damage, checkpoint, Triangle Power, boss appearance/hit/defeat, menus, save success, secrets, portal, nests, memories, charge warnings, defeat/respawn, and team combo. Effects have priorities and cooldowns; repetitive hits cannot drown out higher-priority warnings.

## Audio lifecycle and settings

`js/core/quest-audio.js` owns one gesture-created AudioContext and one 25 ms scheduler, with 120 ms look-ahead and a maximum of three music steps per tick. At most 40 source voices can exist, including scheduled notes and fading voices. Active effects have a separate 14-voice budget; important effects may retire lower-priority effects. Every source, filter, and envelope disconnects when ended. There are no fetched music files, new dependencies, or audio network services. The three new production audio/style files total about 18 KB uncompressed.

Gain envelopes and short transition fades avoid hard cuts. A compressor and conservative default levels provide headroom. No context is created before a trusted input gesture; synthetic events cannot unlock it. Pause stops music, rotation clears queued music, and focus loss/backgrounding stops the scheduler and suspends audio. Focus alone does not restart sound; the next intentional interaction resumes the context. Returning through browser history also requires interaction. Page lifecycle suspension prevents overlapping soundtracks across adventures.

Sound settings appear in title and pause menus: independent music/effects toggles and volumes, plus master mute. Settings use a separate `3dudes1quest-audio` key, so legacy campaign saves and completion badges are untouched. Native labels, checkboxes, ranges, keyboard focus, and existing scrollable landscape panels keep the controls accessible.

## Validation and evidence

- 12 unit tests: existing simulation/collision/save/camera checks plus score pitch/phrase validation and named-effect reference checks.
- Full Playwright suite: desktop and mobile movement, all powers defeating enemies, collectibles, checkpoints, damage/death, boss progression, SoCal→Tahoe→Alaska teaser, saves, multitouch, rotation, safe-area/compact layouts, and offline startup.
- Audio browser checks use real AudioContext/OfflineAudioContext: gesture restrictions, nonzero output, mute, separate volumes/toggles, keyboard settings, persistence, title/world/boss/victory selection, pause/resume, rotation, injected blur/focus lifecycle, duplicate scheduling, hard voice bounds, cleanup, and offline music.
- Genuine saves serialized by the 3.1 and 3.2 runtimes are loaded through the visible Continue/Play controls.
- All five scores and 26 effects produce finite, non-silent, unclipped rendered signals. Loop boundary checks detect unintended silence at phrase wrap. Audio stress checks also inspect live output amplitude. These objective checks do not establish subjective musical quality.
- Local headless Chromium timing on this Mac, 180 animation frames per mode: both worlds had a 16.7 ms median with music off and on; music-on p95 was 16.7 ms SoCal / 16.8 ms Tahoe. Normal music peaked at seven source voices and one scheduler. This short sample is not a low-end phone or battery benchmark.
- Screenshots: `test-results/audio` and `test-results/landscape`; sample WAVs and signal measurements: `test-results/audio`. GitHub CI uploads `test-results` as its gameplay-screenshots artifact (including the audio previews).

## Remaining checks

Human listening was not available in this execution environment. The generated WAV previews are for listening review; waveform/RMS checks are not a substitute for ears. Verify melody balance, repetition fatigue, phone-speaker bass audibility, and effect prominence in actual gameplay.

Test iPhone Safari and installed Home Screen mode, and Android Chrome/PWA, with silent mode, Bluetooth/headphone changes, phone calls, app switching, orientation lock, both landscape directions, and repeated resume. Browser-emulated rotation/focus checks do not establish those behaviors on hardware. Confirm performance/battery usage on lower-end phones. Existing fractional screen scaling and controlled-boss-test limitations still apply. Alaska remains a teaser; Costa Rica and Hawaii remain future route entries.

### Post-merge audio correction

The first post-merge stress run exposed a timing-dependent gain spike when priority effects cancelled notes before their envelopes began. Voice gains now start at zero, and retirement preserves the current envelope or explicitly silences future notes. A real offline-render regression verifies that 40 retired future voices produce silence. The service-worker cache revision is refreshed for this correction.
