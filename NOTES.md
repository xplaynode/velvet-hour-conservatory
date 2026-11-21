# VELVET HOUR — design notes

## Pitch
Top-down stealth heist in a night botanical conservatory during a masquerade ball's last
hour ("velvet hour"). Deep green-black glasshouse floors fill the whole 1280×720 frame; warm
gas-lamp pools, hedge rows and flower beds shape light, sight and cover between marble halls.

## Why it is built this way
The live leaders win on scope and screenshot density: full-frame floor plans, huge
translucent cones, layered cover and a very dense HUD. VELVET HOUR answers on every axis —
5 wings (vs a typical 3), 23 guards & sentinels (19 patrolling + 4 sentinels), 34 treasures, 3 gadgets — and its four
screenshot scenes are staged to be dense: overlapping cones, a live ALARM in the Vault,
a crouched hide in a flower bed under a Sentinel, and the Rose Maze overview.

## Systems
- **Vision:** per-observer raycast cone fans (26 rays) clipped by wall/crate segments;
  line-of-sight checks share the same segment set. Hedges and beds never block sight —
  they are low cover that works through the visibility model instead.
- **Suspicion:** each observer fills 0–100 by sight strength × visibility × distance;
  thresholds drive PATROL/SUSPICIOUS/INVESTIGATE/ALARM with `?`/`!` markers, suspicion
  arcs and text barks. ALARM feeds the global alarm meter; capture lands strikes.
- **Visibility:** base profile modified by lamplight (+), crouch (−), flower-bed crouch
  (−−), sprint (+), perfume cloud (≈0). Lantern Keepers move their light pool with them.
- **Noise:** walk 0.5 / sprint 1.0 / crouch 0.12; loud sprinting lures nearby patrols.
- **Gadgets:** coin decoy (investigate lure + expanding noise ring), snuff-cap (nearest
  lamp dark for 6 s, shrinking effective sight), perfume puff (timed invisibility).
- **Campaign:** wing progression + level select (1–5 once unlocked), loot persistence
  across wings, GHOST rating for a no-alarm, no-strike campaign, pause/retry, 3 strikes.

## Determinism
Fixed seed scenes only: level dressing plants come from a fixed LCG per wing, guard
patrols are waypoint loops, and shot scenes advance the real simulation a fixed number
of 1/60 s steps before staging state. No Date.now / Math.random in game logic.
`main.ts` runs are byte-identical (verified ×3, see the coordinator report).

## Modules
config (tuning/palette/barks) · levels (5 wings as data) · vision (raycasts, LOS,
visibility) · guards (observer brains, sentinels, lures) · player (movement, collision,
noise, gadgets, pickups) · render (scene drawing) · hud (dense HUD + panels) ·
input (held keys + one-shot actions) · audio (guarded WebAudio blips) · shots
(deterministic scenes) · main (loop, screens, strikes, flow).

## Balance notes
Detection fills fastest point-blank in lamplight (≈95/s scaled by sight strength) and
slowest at cone edge in shadow; a crouched thief in a flower bed is roughly six times
harder to spot than a sprinting one under a lamp, which is the intended skill axis:
route through beds and snuffed lamps, spend coins to pull patrols off the Orchid line,
and save perfume for the Vault's overlapping Sentinel arcs.
