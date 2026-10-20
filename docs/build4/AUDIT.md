# Gameplay and interface audit

Audit methods: production title/pause captures and live controls in isolated profiles; actual keyboard routes in all three worlds; controlled survivor/encounter and save-failure scenarios. No owner browser storage was used. Screenshots are native viewport captures, not mockups. Controlled fixtures and natural routes are distinguished in their evidence.

| Priority | Verified defect | Repair and evidence |
|---|---|---|
| P1 | A title-page switch to Legacy did not advance the save revision. An older Survival tab could save and silently re-enable it. Production reproduction changed `enabled:false` back to`true` without conflict. | Mode changes are revisioned transactions; stale writers freeze. Quota refusal restores the prior mode, with visible recovery text. Leaving from a title preserves existing world snapshots. Two-tab native UI regression. |
| P1 | Survival character switching released held right/attack input. Baseline recorded right=true before switching and false afterward. | Manual selection keeps held controls; KO, blur, rotation, replay and other interruption safety paths still release them. Genuine keyboard regression in all three worlds; no acceleration/jump/collision/stat changes. |
| P1 | Survival HUD covered Tahoe pause headings; keyboard focus could remain behind menus. | Modal hierarchy, focus containment, background inertness and canvas focus on resume. Full-page titles keep normal Tab access to Share. Existing rotation manager retains ownership of its app-inert state. Desktop/compact touch tests. |
| P1 | A fourth touch did not switch in Tahoe while movement/jump/attack remained held. Its click-only binding differed from SoCal’s press binding. | Reuse SoCal’s pointer-press pattern through the existing shared input module for Switch/Pause/team actions. Four-contact combinations and keyboard activation pass in every world; compatibility clicks do not activate twice. |
| P1 | All-out Survival runs froze without a clear recovery panel. | Explicit ended-run dialog, saved-history explanation and archive/new-run or separate Legacy choices. Ended-run recovery verified with controlled knockouts and reload. |
| P2 | Full charge displayed an activation key despite missing three-character contributions or temporary Rights Drain. | Named missing contributors, READY text plus color, accessible explanations and DRAIN/WAIT feedback without consuming charge. Drain transitions refresh presentation only. |
| P2 | Routine attacks could overwrite OVERRULED! immediately after a real Court victory. | Three-second protection from routine power feedback for victory text; attacks continue and save/error messages retain their normal behavior. Natural Court fight regression. |
| P2 | Tahoe compared its selected character after the Survival accessor had already changed, dropping switch audio. SoCal also recorded the wrong previous character for switch feedback. | Capture the previous selection before changing it. One cue per changed character is asserted across all three worlds. Original audio engine/music unchanged. |
| P2 | SoCal showed an Alaska subtitle and an obsolete Rainbow Ricochet card label; Legacy/native restart actions were ambiguous. | Correct world badge/DJ Soundwave text, explicit Legacy/Survival/restart wording, archive labels and contribution help. Existing story and approved artwork remain intact. |
| P2 | Boss HUD labels used10px text; compact menus had inconsistent links and spacing. | 12px boss labels, consistent retro links, compact spacing, 44px+ actions and visible keyboard focus. Controlled six-boss screenshots assert bounded HUDs separated from objectives. |

## Findings retained without arbitrary tuning

Movement uses the existing fixed step. Acceleration/stopping, buffered and coyote jumps, variable jump height, swept landings, one-way platforms and camera bounds pass their established tests; actual keyboard routes remain responsive. No physics or difficulty values were changed merely to feel different.

All six established encounters retain their attack windows, phases, HP, damage, hitboxes, rewards and checkpoints. Native routes exercise their introductions, real attacks, phase transitions, victory and post-boss navigation. Controlled fixtures cover every survivor combination and existing temporary restrictions. The new repair protects reward feedback rather than changing boss rules.

The approved enemy contour/contact-shadow system, pixel rendering, parallax, Tahoe infection gradient, Forest Drain mechanics and brown-to-green restoration remain unchanged. Existing visual/forest regressions continue to verify them.

Original music transitions, finite non-silent signal, volume persistence, interruptions, offline playback and bounded scheduling remain under the existing audio tests. A measured single Survival-start click produced one menu cue in the baseline; no speculative audio-engine rewrite was made.
