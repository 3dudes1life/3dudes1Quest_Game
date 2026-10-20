# Generated artwork provenance and limits

Created with the built-in ImageGen tool, using the owner's four PNG packs as creative references. The annotated owner posters were not sliced into runtime sprites. Their filenames are mapped per actor in `assets/master-build/manifest.json`. Character cast artwork was not regenerated.

The following are generation design briefs, not verbatim transcripts of the tool prompts:

- SoCal: transparent original 16-bit action sheets, consistent cells and foot alignment, Queen of Beige, fictional wigged judges, Walking Flaming Laws, HOA drones and beige cardboard robots; preserve approved palettes and identities; exclude text, labels, borders and scenery.
- Tahoe: transparent action rows for Toxic Bloom, Pine Beetle Queen, beetles, larvae, flyers and algae slime; retain approved silhouettes, insect colors and green lake creatures; no labels or backgrounds.
- Alaska: transparent rows for Frost Queen, pipeline workers, surveillance drones, turrets, machinery, oil slime, zombie salmon and snowy owls; retain the supplied designs; no wolves or polar bears.
- Dedicated Court correction: older male cartoon judge with white wig, black robe, moustache, sunglasses and gavel, matching the specific Court pack. This supersedes the unsuitable judge row in the SoCal generated source.
- Each world background: six original pixel-art scenery panels in a two-column, three-row image, no actors, text, UI or collision platforms. SoCal: coastal home, Hillcrest, PCH, WeHo, Hollywood, LA. Tahoe: blue lake, contaminated lake, green forest, infected forest, granite trail, restored summit. Alaska: river/mountains, glacier, pipeline leak, flood, Frost territory, restored aurora.

Generated originals in this session directory:
`/Users/williamzakrajshek/.codex/generated_images/01a0ba25-e813-7093-9fff-88912f595f74/`

| Repository file | Original generated file |
|---|---|
| `source/socal.png` | `exec-8c1e1342-a022-497a-b806-5fb1d603d8cd.png` |
| `source/tahoe.png` | `exec-83026b70-a861-4ccb-b3a9-13928bfbb866.png` |
| `source/alaska.png` | `exec-6beeff60-fb93-43e6-9c07-f90c5a9f038c.png` |
| `source/court.png` | `exec-2c0995bf-4420-4410-9720-85ee1eb2ac99.png` |
| `../../assets/master-build/socal-scenes.png` | `exec-6fdc3655-8888-43e7-af90-1748591da35e.png` |
| `../../assets/master-build/tahoe-scenes.png` | `exec-ed89861b-3cb9-47c9-9e70-2cb425e153e8.png` |
| `../../assets/master-build/alaska-scenes.png` | `exec-7e103425-c51c-4730-9568-1836f59a6363.png` |

## Actual production subset

Generated grids are irregular; large attack effects spill across columns. Only four measured poses per actor were normalized. `scripts/build-master-art.cjs` records source rectangles, dimensions, aspect-preserving scale, alpha cutoff, six-pixel side gutters, foot pivot and timing. It runs mechanical normalization in browser Canvas, with nearest-neighbor resampling. Regenerate with the preview server at port8881 and Playwright available; set `ART_BASE` and `CHROME_PATH` as needed.

12 actors are loaded by the active runtimes; seven proposed new enemies/bosses are review-only. All 19 compiled strips can be inspected in [the contact sheet](contact-sheet.html). Idle uses frames0/1 at180ms; movement uses2/3 at140ms. Reduced motion holds one pose. Damage flashes preserve the simulation's invulnerability timing. Existing power/projectile emission positions and collision boxes remain unchanged.

Attack poses, hurt poses, phase transformations and defeat animations are **not integrated or verified**. Existing procedural attack projectiles, warnings and particle feedback remain. Normal restored salmon retain the existing healthy renderer because this generated pack has no verified healthy-fish strip. These are development assets awaiting owner review, not approved final production artwork.

Scenery is preloaded, drawn from a cropped panel with modest overscan/parallax, and never processed per frame. Existing foreground trees, terrain, buildings, hazards and collision geometry remain; their simpler style still needs a separate consistency pass. The toxic-lake and pipeline leak/flood panels are not selected by gameplay until those encounters exist. They are included in the scenery files for review only.


## Six-encounter continuation

The original four source sheets and all protagonist/idle artwork remain. `scripts/build-master-actions.cjs` now measures four additional action poses per actor into 384×256 cells with pivot144,244. Preparation, execution, hurt and defeat are distinct images. Small disconnected fragments at source cell edges are excluded before normalization. Phase effects use these distinct poses plus actual Court multiplication, Pine wing/Forest Drain states and Frost shield/blizzard states; they do not substitute repeated idle frames for attacks. Hurt/death reactions play for120/880ms with bounded fading echoes.

Pine Queen action regeneration: built-in ImageGen, source `source/pine-actions.png`, original `exec-d040e6fd-b271-4b1b-ac4d-a1da7478387c.png` in the same session generated-images directory above. References: owner Tahoe PNG and existing generated Tahoe source. Brief: four isolated equally spaced preparation, acid-spit execution, hurt and collapsed defeat poses in one row; same crown, black/orange carapace, red eyes, wings and standing body scale; transparent; no labels, scenery or neighboring minions. This replaces only ambiguous Pine Queen action cuts, keeping her idle sheet.

Foreground generation: built-in ImageGen, source `source/foreground.png`, original `exec-f10da579-46eb-4a6c-a311-d9560ee5f94f.png`. References: owner Tahoe and Alaska packs. Brief: a transparent4×2 prop grid with green, yellow, restored and snowy pines; tall and fan palms; glacier and granite boulders; consistent baseline, generous separation, no text/characters/scenery. Normalized by `scripts/build-master-foreground.cjs`; props are decorative and never alter terrain collisions.

The earlier section describes the preserved partial checkpoint. In the completed candidate, all19 actors and the contaminated/disaster scenery panels are active. Actor PNG originals are retained, while lossless WebP is loaded at runtime. Visible RGB and alpha are checked unchanged; RGB under zero alpha may be normalized by the encoder. Background WebP uses near-lossless encoding: dimensions remain unchanged and the measured maximum RGB-channel error is2/255. Raw encoding measurements are in `compression.json`. Final owner approval of the resulting artwork remains required.

Hillcrest landmark: original Canvas pixel lettering, suspended arch structure, supports and Pride flags, informed by [the Hillcrest Business Association's sign restoration photographs](https://www.hillcrestbia.org/foundation). No photograph or organization logo file is embedded. Storefronts and studio facades use original code-native pixel details and preserve their existing world coordinates.

Rebuild order with optional Sharp build tooling and Playwright available: foundation (only when rebuilding original idle strips) → actions → optimize → foreground. `ART_BASE` selects the local source server. Runtime has no Sharp dependency. The rebuilt manifest records both PNG and WebP paths, action rectangles/pivots, source identities and encoding hashes.
