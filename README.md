# VELVET HOUR — The Clockwork Conservatory · 5 wings · 23 guards & sentinels · 34 treasures · 3 gadgets
![make.fun bounty](https://make.fun/badge/best-stealth-game-20261121-1759.svg)
![rank](https://make.fun/badge/best-stealth-game-20261121-1759/xplaynode/velvet-hour-conservatory/rank.svg)
![reward](https://make.fun/badge/best-stealth-game-20261121-1759/xplaynode/velvet-hour-conservatory/reward.svg)
Competition: [make.fun — best stealth game](https://make.fun/bounty/best-stealth-game-20261121-1759) · Repository: xplaynode/velvet-hour-conservatory

A top-down stealth heist. During the masquerade ball's last hour, slip through a vast night
botanical conservatory — five glasshouse wings of palm courts, orchid houses, a rose maze, a
flooded grotto and the Glass Vault — and steal the Moon Orchid from every wing.

## How to play

- **Objective:** in each wing, take the **Moon Orchid** (✿), then escape through the **GATE**.
  Optional treasures (◆) — gems, orchid bulbs, gold snuffboxes, cameos, seedpods, tiaras —
  raise your campaign loot toward **34**.
- **Vision cones** are raycast and blocked by walls and crates: pale = calm, yellow =
  suspicious, red = ALARM. Guards move PATROL → SUSPICIOUS (`?`) → INVESTIGATE → ALARM (`!`),
  call out barks, and chase. An alarmed guard who reaches you lands a **strike** — three
  strikes and the wing restarts. Fill the ALARM meter and a strike lands too.
- **Visibility:** lamplight exposes you; shadow hides you; crouching (**C**) in flower beds
  crushes your visibility. **Noise:** sprinting (Shift) is fast and loud — nearby guards
  investigate the sound; crouch-walking is nearly silent.
- **Guards:** Patrol Wardens patrol loops; **Lantern Keepers** carry a moving lamp pool that
  extends their sight; **Brass Sentinels** (wings III–V) sweep fixed arcs like cameras.
- **Gadgets (3):** **Q** thrown coin decoy (noise ring lures guards), **E** snuff-cap
  (extinguishes the nearest lamp for 6 s), **F** perfume puff (4.5 s invisibility cloud).
  Charges are limited per wing — watch the HUD.
- Finish all five wings with no alarms and no strikes for the **GHOST** rating.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrows | Move |
| Shift | Sprint (loud) |
| C / Ctrl | Crouch (hide in flower beds) |
| Q / E / F | Coin decoy / snuff-cap / perfume puff |
| P / Esc | Pause |
| R | Retry wing after capture |
| 1–5 | Choose an unlocked wing on the title screen |
| Space / Enter | Begin / advance |

## Scope

- **5 wings:** Palm Court · Orchid House · Rose Maze Wing · Flooded Grotto · The Glass Vault
- **23 guards & sentinels:** 19 patrolling wardens/keepers + 4 sweeping Brass Sentinels
- **34 treasures** plus the Moon Orchid objective in every wing
- **3 gadgets**, raycast vision cones, suspicion/alarm simulation, light/shadow visibility,
  noise model, strikes, level select & progression, pause/retry, GHOST campaign rating
- Dense HUD: detection %, ALARM meter, visibility, noise, loot counters, gadget charges,
  objective, spotted count, strikes, legend and controls

## Structure

- `main.ts` — hand-in program (Node stdlib only): copies `game/` + `screenshots/` to the
  output dir and writes `dossier.json` via the vendored library.
- `vendor/makefun-game.ts` — the kit's dossier library, byte-identical.
- `game/index.html` + `game/src/*.js` — the game (11 ES modules: config, levels, vision,
  guards, player, render, hud, input, audio, shots, main). No libraries, no network.
- `screenshots/` — four deterministic renders (`?shot=…&seed=7` scenes in `shots.json`).

Run locally: serve `game/` with any static server and open `index.html`.

## Determinism & verification

Screenshot scenes are staged from the real simulation at a fixed seed (`shots.json`), and
`main.ts` produces a byte-identical `dossier.json` on repeated runs — both are checked by
the build pipeline before this entry is handed in.
