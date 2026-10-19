# World-route verification

Baseline: production/main `2b1859551861bd2b6106d14ff8980892c3586c80`. Read-only observers selected keyboard actions; no teleports, invulnerability, enemy-health changes or completion flags were used in the natural routes. Automated play is not a human usability study.

| World | Actual geometry / order | Natural keyboard result | Limits |
|---|---|---|---|
| Southern California | 9200-wide world, ground620, 1280×720 logical camera. HOME BASE0–1450 → HILLCREST1450–3300 → PCH3300–5000 → HOLLYWOOD5000–6600 → LOS ANGELES6600–9200. Court gate7980; Queen arena8080–8500; portal8840. | Six cards, three beacons, blockade, Court1/3/5 and real Rights Drain, Queen three phases, Zoey rescue, completion screen and Tahoe destination link. | Not all optional secrets or all characters through every boss. Current route is the previous boss order. |
| Lake Tahoe | 9800-wide sloping world. Emerald Shore0–1050; Whispering Pines1050; Eagle Creek2600; Fallen Timber4050; Crystal Cave5300; Granite Crown6850; Infested Summit8200. Nests2250/4720/6380/8020; Queen gate8420. | Four nests, original18 beetles, all six memories, three-phase Queen, restored forest and actual URL transition to Alaska through ordinary rightward movement. | Optional crystals not all collected. First audit script incorrectly waited stationary for an automatic ending; corrected route walks to the portal. That script timeout is not recorded as a game-breaking defect. |
| Alaska | 7600-wide world, ground620. Trail Station0; Frozen River2400; Glacier Pass4400; Aurora Ridge6200. Relays1150/3850/5900; shelters2450/4800/6320; Queen gate6500; exit near7400. | Three relays, thin-ice ledges, shelter dialogue, Frost Queen and Costa Rica Coming Soon ending; zero deaths in the recorded baseline run. | Optional12 shards/two caches not a completionist run. No pipeline or flood encounter was present. |

## Destination identity

Home Base/San Diego is the opening environment, not a separately selected San Diego level. Hillcrest is its own coordinate segment. PCH is an additional coastal segment. The current HOLLYWOOD studio district is distinct from downtown LA, but it is not explicitly a West Hollywood district. No separate West Hollywood geometry, checkpoint or art hook exists. This audit does not invent or relabel a missing destination.

## Boss implementation matrix

| Encounter | Actual playable status | Attacks / phases / recovery | Approved design gap |
|---|---|---|---|
| Queen of Beige | SoCal, **after Court**, 10HP | Three health phases; warned fines/beige spreads; summoned ghosts; damage flashes; finale/rescue on defeat | Moving her to mid-level requires new progression/save design approval. |
| Supreme Court | SoCal, **before Queen** | 1/3/5 judges with3/2/1HP; flaming scrolls; 60-tick warning and120-tick temporary Rights Drain; restored powers; OVERRULED; arena respawn and save-preserving replay | Approved future final encounter is1/3/9; not implemented in this audit. |
| Toxic Bloom | **Not implemented** | No encounter entity, algae attacks, toxic bubbles or lake contamination/restoration sequence | Approved future design only. |
| Pine Beetle Queen | Tahoe final boss, 18HP | Ground charge → flight → corruption; larvae, flying beetles, infection targets, failed-root strength boost and gradual forest restoration | Existing Forest Drain implemented. Toxic Bloom is separate, absent. |
| Pipeline Meltdown | **Not implemented** | Existing relays are aurora devices; thin ice/weather are not a pipeline/flood escape | Workers/drones/valves/leak/glacier melt/flood/restoration all require a separate approved implementation. |
| Frost Queen | Alaska final boss, 12HP | Three phases; warned snowballs/summoned salmon; blizzard/icicles; breakable ice shield; salmon/aurora restoration and ending | Existing encounter verified. No wolves or polar bears are enemies; two hostile owls require design clarification before new artwork. |

## Saves and access

SoCal schema2/key `3dudes1quest-save-109`; Tahoe schema3/key `3dudes1quest_tahoe_v250`; Alaska schema1/key `3dudes1quest_alaska_v340`. Existing keys and schema stay unchanged. Earlier fixtures3.1–3.4.1 remain in browser regressions. Legacy Queen progress can imply Court completion; the existing explicit victory record and replay option are preserved, rather than erasing that progress. World selection intentionally exposes all three playable destinations. Costa Rica/Hawaii have no playable link.
