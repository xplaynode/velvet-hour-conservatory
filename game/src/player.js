// The thief: movement with wall collision, crouch/sprint noise model, pickups, the three gadgets.
import { GADGETS, PLAYER } from './config.js';
import { pointInRect } from './vision.js';
import { lureGuards } from './guards.js';

export function makePlayer(level) {
  return {
    x: level.start[0], y: level.start[1], radius: PLAYER.radius, facing: -Math.PI / 2,
    crouch: false, sprinting: false, noise: 0, perfume: 0, moving: false,
    gadgets: { coin: GADGETS.coin.charges, snuff: GADGETS.snuff.charges, perfume: GADGETS.perfume.charges },
  };
}
function blocked(level, x, y, r) {
  const solids = [...level.walls, ...level.crates, ...level.hedges];
  for (const s of solids) {
    if (x + r > s[0] && x - r < s[0] + s[2] && y + r > s[1] && y - r < s[1] + s[3]) return true;
  }
  for (const f of level.fountains) {
    if (Math.hypot(x - f[0], y - f[1]) < f[2] + r - 4) return true;
  }
  return x < 20 || x > 1260 || y < 60 || y > 700;
}
export function updatePlayer(p, dt, input, game) {
  const level = game.level;
  const ax = input.axis();
  p.crouch = input.crouchHeld();
  p.sprinting = input.sprint() && !p.crouch && (ax.x !== 0 || ax.y !== 0);
  const speed = p.crouch ? PLAYER.crouch : p.sprinting ? PLAYER.sprint : PLAYER.walk;
  p.moving = ax.x !== 0 || ax.y !== 0;
  if (p.moving) {
    const len = Math.hypot(ax.x, ax.y);
    const dx = (ax.x / len) * speed * dt, dy = (ax.y / len) * speed * dt;
    if (!blocked(level, p.x + dx, p.y, p.radius)) p.x += dx;
    if (!blocked(level, p.x, p.y + dy, p.radius)) p.y += dy;
    p.facing = Math.atan2(ax.y, ax.x);
  }
  // Noise model: sprinting is loud, walking middling, crouching nearly silent.
  const targetNoise = !p.moving ? 0 : p.crouch ? 0.12 : p.sprinting ? 1 : 0.5;
  p.noise += (targetNoise - p.noise) * Math.min(1, dt * 8);
  if (p.perfume > 0) p.perfume = Math.max(0, p.perfume - dt);
  // Hearing: sprint noise pulls nearby guards' heads around.
  if (p.noise > 0.85) {
    for (const g of game.guards) {
      if (!g.isSentinel && Math.hypot(g.x - p.x, g.y - p.y) < 120 && g.state === 'PATROL') {
        g.state = 'INVESTIGATE'; g.investigate = { x: p.x, y: p.y }; g.suspicion = Math.max(g.suspicion, 40);
      }
    }
  }
  // Pickups.
  for (const t of level.treasures) {
    if (!t.taken && Math.hypot(t.x - p.x, t.y - p.y) < PLAYER.collectRange) {
      t.taken = true; game.loot++; game.levelLoot++; game.audio.pickup();
      game.toast = `Treasure taken — ${t.kind} (${game.loot} total)`; game.toastT = 2.2;
    }
  }
  if (!game.hasOrchid && Math.hypot(level.orchid[0] - p.x, level.orchid[1] - p.y) < 28) {
    game.hasOrchid = true; game.audio.orchid();
    game.toast = 'THE MOON ORCHID IS YOURS — reach the gate!'; game.toastT = 3;
  }
}
export function throwCoin(p, game) {
  if (p.gadgets.coin <= 0) return false;
  p.gadgets.coin--;
  const x = p.x + Math.cos(p.facing) * 130, y = p.y + Math.sin(p.facing) * 130;
  game.rings.push({ x, y, r: 8, t: 0 });
  lureGuards(game, x, y, GADGETS.coin.noiseRadius);
  game.audio.coin();
  game.toast = 'Coin thrown — heads turn.'; game.toastT = 1.6;
  return true;
}
export function snuffLamp(p, game) {
  if (p.gadgets.snuff <= 0) return false;
  let best = -1, bd = GADGETS.snuff.radius;
  game.level.lamps.forEach((l, i) => {
    const d = Math.hypot(l[0] - p.x, l[1] - p.y);
    if (d < bd) { bd = d; best = i; }
  });
  if (best < 0) { game.toast = 'No lamp close enough to snuff.'; game.toastT = 1.6; return false; }
  p.gadgets.snuff--;
  game.litLamps[best] = false; game.lampTimers[best] = GADGETS.snuff.darkSeconds;
  game.audio.snuff();
  game.toast = 'Lamp snuffed — the dark deepens.'; game.toastT = 1.6;
  return true;
}
export function puffPerfume(p, game) {
  if (p.gadgets.perfume <= 0 || p.perfume > 0) return false;
  p.gadgets.perfume--;
  p.perfume = GADGETS.perfume.seconds;
  game.audio.perfume();
  game.toast = 'Perfume cloud — you are a rumour.'; game.toastT = 1.6;
  return true;
}
/** One-line gadget inventory for panels: "Coin ×3 · Snuff ×2 · Perfume ×1". */
export function gadgetSummary(p) {
  return `Coin ×${p.gadgets.coin} · Snuff ×${p.gadgets.snuff} · Perfume ×${p.gadgets.perfume}`;
}
export function inCover(p, level) {
  return level.beds.some((r) => pointInRect(p.x, p.y, r)) || level.hedges.some((r) => pointInRect(p.x, p.y, r));
}
