// Deterministic screenshot scenes (?shot=patrol|alarm|hide|overview&seed=7).
// Each stages real game state — positions, guard states, meters — then main paints it twice.
import { STEP } from './config.js';

function markLoot(game, n, levelLoot) {
  let c = 0;
  for (const t of game.level.treasures) { if (c++ < levelLoot) t.taken = true; }
  game.loot = n; game.levelLoot = levelLoot;
}
function face(g, tx, ty) { g.facing = Math.atan2(ty - g.y, tx - g.x); }

export function stageShot(name, game, loadLevel, stepGuards) {
  if (name === 'alarm') {
    loadLevel(game, 4, false);
    for (let i = 0; i < 300; i++) stepGuards(game, STEP);
    const p = game.player; p.x = 640; p.y = 452; p.facing = -Math.PI / 2;
    const g = game.guards[3];
    g.x = 700; g.y = 400; face(g, p.x, p.y);
    g.state = 'ALARM'; g.suspicion = 100; g.bark = 'THIEF! Seal the glass!'; g.barkT = 99;
    const k = game.guards[2]; k.x = 560; k.y = 520; face(k, p.x, p.y); k.state = 'SUSPICIOUS'; k.suspicion = 74; k.bark = 'Did something move?'; k.barkT = 99;
    game.alarm = 78; game.maxSuspicion = 100; game.spotted = 3; game.alarmsRaised = 2; game.strikes = 1; game.ghost = false;
    game.lastBark = 'THIEF! Seal the glass!';
    markLoot(game, 24, 3);
    game.toast = 'ALARM — the Vault wakes!'; game.toastT = 99;
    return;
  }
  if (name === 'hide') {
    loadLevel(game, 4, false);
    for (let i = 0; i < 200; i++) stepGuards(game, STEP);
    const p = game.player;
    p.x = 640; p.y = 282; p.crouch = true; p.facing = -Math.PI / 2; // deep in the vault flower bed, orchid above
    const s = game.guards.find((g) => g.isSentinel);
    if (s) { s.facing = 0.9; s.state = 'SUSPICIOUS'; s.suspicion = 41; }
    const k = game.guards[2]; k.x = 520; k.y = 430; face(k, 640, 300); k.state = 'SUSPICIOUS'; k.suspicion = 58; k.bark = 'Hm? A draught…'; k.barkT = 99;
    game.maxSuspicion = 58; game.lastBark = 'Hm? A draught…';
    game.visibility = 0.06; // crouched in a flower bed in shadow: the model in numbers
    markLoot(game, 27, 5);
    game.toast = 'Crouched in the flower bed — visibility crushed'; game.toastT = 99;
    return;
  }
  if (name === 'overview') {
    loadLevel(game, 2, false);
    for (let i = 0; i < 540; i++) stepGuards(game, STEP);
    const p = game.player; p.x = 200; p.y = 560; p.facing = 0.4;
    game.guards[0].state = 'SUSPICIOUS'; game.guards[0].suspicion = 48;
    game.maxSuspicion = 48;
    markLoot(game, 9, 2);
    game.toast = 'The Rose Maze — hedges, beds and one sweeping Sentinel'; game.toastT = 99;
    return;
  }
  // Default: patrol — Palm Court mid-patrol, one warden suspicious.
  loadLevel(game, 0, false);
  for (let i = 0; i < 420; i++) stepGuards(game, STEP);
  const p = game.player;
  p.x = 790; p.y = 592; p.crouch = true; p.facing = -0.7; // crouched in the south-east flower bed
  const g = game.guards[1];
  g.x = 900; g.y = 470; face(g, p.x, p.y);
  g.state = 'SUSPICIOUS'; g.suspicion = 66; g.bark = 'Did something move?'; g.barkT = 99; g.lastSeen = { x: p.x, y: p.y };
  game.maxSuspicion = 66; game.lastBark = 'Did something move?';
  game.visibility = 0.18; // crouched in the bed, at the edge of the lantern pool
  markLoot(game, 3, 2);
  game.toast = 'A keeper\'s lantern swings your way…'; game.toastT = 99;
}
