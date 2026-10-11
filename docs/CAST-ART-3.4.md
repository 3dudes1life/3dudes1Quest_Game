# Original cast art: 3.4.0

Production assets: `assets/cast340/socal.png`, `tahoe.png`, `alaska.png`. Generated using the built-in imagegen tool, with transparent backgrounds. Original outputs remain under the task's generated_images directory. Runtime row bands are explicitly measured; the decorative arrangement is not assumed to be a uniformly spaced atlas.

Base specification: original crisp 16-bit pixel sprites, six columns (idle, run A, run B, jump, attack, victory), five rows (Will, Daniel, Caleb, Rigsby, Zoey), transparent background, consistent physical features and proportions. Will completely bald, dark beard, existing pink/cyan glasses and tan skin; Daniel/Caleb retain their established brown-haired character appearances. Rigsby is the tricolor beagle with teal collar, Zoey the smaller cream/brown beagle with pink collar. Casual outfits: pink rainbow vest, navy/teal heart outfit, orange cookie-satchel outfit. No franchise artwork.

Tahoe edit prompt specification: edit the SoCal atlas; preserve positions/poses/faces/baldness/proportions and both dogs. Change only clothing: Will pink quilted hiking vest/rainbow patches; Daniel navy/teal mountain jacket/purple heart buckle; Caleb orange hiking jacket/cookie satchel; mountain trousers and boots. Preserve clean transparent spacing, sharp pixel edges, no captions/background.

Alaska edit prompt specification: edit the same SoCal atlas; preserve positions/poses/faces/baldness/proportions and both dogs. Change only clothing: Will hot-pink winter parka with hood down and rainbow scarf; Daniel navy/teal coat and purple heart badge; Caleb orange parka, cookie satchel and cream scarf; warm trousers/winter footwear. No side hair, hairline or head texture for Will. Preserve transparent background, clean poses and no captions.

Runtime QA generates actual-size five-character lineups for each world and validates every human animation through QuestCore. Close-up captures supplement gameplay-size evidence. Hurt/fall reactions and idle/victory movement are derived from aligned poses; they do not alter collision boxes. Historical sprite files remain for repository history; active gameplay/portraits load the new world atlas.

The later owner-approved DJ Will, short-haired/stubbled Daniel and rainbow-unicorn Caleb sheets belong to the separately requested 3.4.1 release. They are deliberately not mixed into this 3.4 build, in accordance with its required execution order.
