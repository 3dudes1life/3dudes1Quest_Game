# Our Story — 86-second storyboard

Source: verified audit commit `d2509392365aef1004657a12adfe41971f98c6f4`. Review branch: `codex/origin-story-cinematic`. This change starts at the verified audit baseline. Audit PR #10 was merged separately while the cinematic was in progress; main now has the same audit tree, and the cinematic PR targets main. This cinematic is not deployed. The release number stays 3.4.1.

The approved narrative is reproduced sentence for sentence in `QuestStory.scenes`. Original additional text is limited to scene headings, destination labels and two small visual jokes. No narration voice, commercial recordings or new character/villain illustrations are introduced.

| Time | Scene / composition | Narrative beats | Music / detail |
|---|---|---|---|
| 0–13s | Dominican Republic sunset; warm sea, palms, three characters and three hearts | Caribbean beginning → not ordinary → three hearts / no instruction manual | **Under the Caribbean Sun**, 96 BPM; triangle melody and bass, no percussion. Gentle water movement and existing idle frames. |
| 13–20s | A shared home; warm windows, the three together, an unfinished box | Together, they built a life. | Same gentle cue continues. Small “ASSEMBLY? ...MAYBE.” visual joke. |
| 20–31.5s | Same home in cooler colors; medical kit, masks and falling bills chart | Pandemic, economic crashes and a world questioning their love | **Closer Through the Storm**, 104 BPM; quiet minor variation, sparse noise percussion. No flashing or graphic suffering. |
| 31.5–37s | Rain and abstract shadows at the sides; the three stand close under one heart | Every challenge brought them closer. | Storm cue continues. Shadows are symbolic, not new enemies or villain artwork. |
| 37–49s | Three hearts and a rainbow over the crew | Love becomes stronger → strength beyond their own little family | **Three Hearts, Stronger**, 120 BPM; title-motif variation builds, quiet heart cue. |
| 49–63s | Mountains and stars; established attack poses, music, heart and cookie symbols | Defend community → protect planet → stand against color-draining enemies | Rising cue continues; familiar beacon sound. These are visual symbols, not changes to abilities. |
| 63–72s | The family walking at sunrise; named Rigsby and Zoey join both sides | Love/laughter/questionable decisions/two beagles → lifetime adventure | **Three Dudes. One Life. One Quest.**, 132 BPM; fuller pulse, bass and percussion. “DID SOMEONE PACK THE COOKIES?” visual joke. |
| 72–80s | Five small postcard landscapes linked by hearts | THREE DUDES. ONE LIFE. ONE QUEST. | SoCal → Tahoe → Alaska → Hawaii → Costa Rica. Last two marked future; Costa Rica marked “RETIRE, TOGETHER.” No playable future-world links. |
| 80–86s | SoCal sunrise, low skyline, family in run poses | And this is where their story begins. | Adventure cue, subtle portal effect; at 86s enter actual SoCal with the selected hero. |

## Playback contract

- First Start opens the story before the new adventure resets any previous campaign save. The game simulation has not started. End or **Skip Intro** performs the existing new-game action and hands off directly to gameplay.
- A separate presentation preference `3dudes1quest-origin-seen` suppresses later automatic introductions. Both finish and skip mark it seen. Storage failure remains nonfatal, but the preference may not persist.
- Continue always bypasses the cinematic, regardless of that preference. No save keys, schema, checkpoints or boss flags are migrated by the story.
- **Our Story** replays from the main menu and returns there on finish/skip. It does not reset/start an adventure or rewrite its save. Returning to the menu is intentional: an owner may replay the story while preserving a campaign.
- Visible Pause/Resume, mute and Skip controls use native buttons. A native modal isolates input and traps focus. Escape toggles pause. Tab/Enter/Space work normally. Resume requires an explicit action after backgrounding, rotation or fullscreen changes.
- Rotation, page hiding and blur pause the timeline; it never catches up by skipping story time. Browser toolbar changes relayout without adding story time. Portrait remains usable for interruption recovery; landscape is the intended viewing format.
- Reduced motion freezes scene animation, rain and sprite frames; timed captions and simple scene cuts remain. No flashing or typewriter text. Captions are readable HTML with polite sentence updates.
- Music and subtle effects use the existing gesture-unlocked `QuestAudio` graph and persisted music, effects, volume and mute settings. No second scheduler, sampled song or video download. The title canvas skips its background drawing while the cinematic is open.
- Logical art canvas: 640×360, nearest-neighbor presentation, approximately 12 draws/second during playback. Existing decoded character strips are reused. UI captions and controls retain readable screen-space type.

## Scope / approval

The supplied future journey order supersedes the older shared journey-label order, so metadata now lists Hawaii before Costa Rica. There is **no** new world, boss change, altered unlock, level edit or villain-art integration. Alaska's existing Costa Rica ending teaser remains unchanged under the instruction not to modify existing worlds; updating its story after this approval is a separate content decision. The cinematic and journey list show the newly requested route.

Owner approval is required before merging or deploying this cinematic. Review the entire sequence, timing, text, character appearance and music. Automated testing establishes behavior, not emotional or artistic approval.
