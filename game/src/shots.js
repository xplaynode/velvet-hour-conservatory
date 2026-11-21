// Deterministic screenshot scenes (?shot=patrol|alarm|hide|overview&seed=7).
// Each stages real game state — positions, guard states, meters — then main paints it twice.
// Every scene is staged dense: 3+ observers with overlapping cones, the thief mid-action,
// banners (toast + bark) up and a full HUD. All positions are fixed constants: seed-stable.
import { STEP } from './config.js';

function markLoot(game, n, levelLoot) {
  let c = 0;
  for (const t of game.level.treasures) { if (c++ < levelLoot) t.taken = true; }
  game.loot = n; game.levelLoot = levelLoot;
}
function face(g, tx, ty) { g.facing = Math.atan2(ty - g.y, tx - g.x); }
function place(g, x, y, tx, ty, state, suspicion, bark) {
  g.x = x; g.y = y; face(g, tx, ty);
  if (state) g.state = state;
  if (suspicion != null) g.suspicion = suspicion;
  if (bark) { g.bark = bark; g.barkT = 99; g.lastSeen = { x: tx, y: ty }; }
}

export function stageShot(name, game, loadLevel, stepGuards) {
  if (name === 'alarm') {
    loadLevel(game, 4, false);
    for (let i = 0; i < 300; i++) stepGuards(game, STEP);
    const p = game.player; // mid-chase: sprinting, Orchid in hand, noise ring flying
    p.x = 640; p.y = 452; p.facing = -Math.PI / 2; p.sprinting = true; p.noise = 0.92; p.crouch = false;
    game.hasOrchid = true; game.visibility = 0.94;
    place(game.guards[3], 700, 400, p.x, p.y, 'ALARM', 100, 'THIEF! Seal the glass!');
    place(game.guards[2], 560, 520, p.x, p.y, 'SUSPICIOUS', 74, 'Did something move?');
    place(game.guards[0], 500, 392, p.x, p.y, 'INVESTIGATE', 63, 'Checking the beds…');
    place(game.guards[1], 830, 528, p.x, p.y, 'SUSPICIOUS', 55, null);
    const s = game.guards.find((g) => g.isSentinel);
    if (s) { face(s, p.x, p.y); s.state = 'SUSPICIOUS'; s.suspicion = 47; }
    game.rings.push({ x: p.x, y: p.y + 26, r: 34, t: 0.35 });
    game.alarm = 78; game.maxSuspicion = 100; game.spotted = 3; game.alarmsRaised = 2; game.strikes = 1; game.ghost = false;
    game.lastBark = 'THIEF! Seal the glass!';
    markLoot(game, 24, 3);
    game.toast = 'ALARM — the Vault wakes!'; game.toastT = 99;
    return;
  }
  if (name === 'hide') {
    loadLevel(game, 4, false);
    for (let i = 0; i < 200; i++) stepGuards(game, STEP);
    const p = game.player; // crouched deep in the vault flower bed, perfume cloud swirling
    p.x = 640; p.y = 282; p.crouch = true; p.facing = -Math.PI / 2; p.perfume = 3.2; p.noise = 0.05;
    const s = game.guards.find((g) => g.isSentinel);
    if (s) { s.facing = 0.9; s.state = 'SUSPICIOUS'; s.suspicion = 41; }
    place(game.guards[2], 520, 430, 640, 300, 'SUSPICIOUS', 58, 'Hm? A draught…');
    place(game.guards[0], 428, 296, p.x, p.y, 'SUSPICIOUS', 52, 'Who goes there?');
    place(game.guards[1], 884, 332, p.x, p.y, 'PATROL', 12, null);
    place(game.guards[4], 760, 150, p.x, p.y, 'PATROL', 8, null);
    game.rings.push({ x: 566, y: 356, r: 30, t: 0.7 }); // a spent coin ring fading by the bed
    game.maxSuspicion = 58; game.lastBark = 'Hm? A draught…'; game.alarm = 22;
    game.visibility = 0.05; // crouched in a flower bed under perfume: the model in numbers
    markLoot(game, 27, 5);
    game.toast = 'Crouched in the flower bed — visibility crushed'; game.toastT = 99;
    return;
  }
  if (name === 'overview') {
    loadLevel(game, 2, false);
    for (let i = 0; i < 540; i++) stepGuards(game, STEP);
    const p = game.player; // crouched in the central maze bed while three cones converge
    p.x = 640; p.y = 408; p.crouch = true; p.facing = 0.4; p.noise = 0.1;
    const s = game.guards.find((g) => g.isSentinel);
    if (s) { s.facing = Math.PI / 2; s.state = 'SUSPICIOUS'; s.suspicion = 57; }
    place(game.guards[0], 302, 408, p.x, p.y, 'SUSPICIOUS', 48, 'Did something move?');
    place(game.guards[1], 982, 408, p.x, p.y, 'PATROL', 10, null);
    place(game.guards[2], 420, 606, p.x, p.y, 'PATROL', 6, null);
    game.rings.push({ x: 762, y: 472, r: 52, t: 0.5 }); // a coin decoy still ringing
    game.maxSuspicion = 57; game.lastBark = 'Did something move?';
    game.visibility = 0.12;
    markLoot(game, 14, 3);
    game.toast = 'The Rose Maze — hedges, beds and one sweeping Sentinel'; game.toastT = 99;
    return;
  }
  // Default: patrol — Palm Court, the thief slipping along a cone edge past three observers.
  loadLevel(game, 0, false);
  for (let i = 0; i < 420; i++) stepGuards(game, STEP);
  const p = game.player;
  p.x = 790; p.y = 592; p.crouch = true; p.facing = -0.7; p.noise = 0.3; // crouched in the south-east flower bed
  place(game.guards[1], 900, 470, p.x, p.y, 'SUSPICIOUS', 66, 'Did something move?');
  place(game.guards[0], 612, 462, p.x, p.y, 'PATROL', 14, null);
  place(game.guards[2], 1082, 428, p.x, p.y, 'PATROL', 9, null);
  game.rings.push({ x: 862, y: 538, r: 44, t: 0.45 }); // coin decoy ring beside the bed
  game.maxSuspicion = 66; game.lastBark = 'Did something move?'; game.spotted = 1;
  game.visibility = 0.18; // crouched in the bed, at the edge of the lantern pool
  markLoot(game, 3, 2);
  game.toast = 'A keeper\'s lantern swings your way…'; game.toastT = 99;
}
