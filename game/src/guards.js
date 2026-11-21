// Guard brains: waypoint patrols, suspicion, investigation, alarm, barks — and Brass Sentinels.
// States: PATROL -> SUSPICIOUS (saw something) -> INVESTIGATE (walk to it) -> ALARM (full sight).
import { BARKS, DETECTION, STATE } from './config.js';
import { seeStrength } from './vision.js';

export function makeGuard(def, index) {
  const [x, y] = def.path[0];
  return {
    type: def.type, path: def.path, speed: def.speed, wp: 1, x, y,
    facing: Math.atan2(def.path[1][1] - y, def.path[1][0] - x),
    range: def.type === 'keeper' ? 265 : 245, fov: 1.85,
    state: STATE.PATROL, suspicion: 0, bark: '', barkT: 0, barkIdx: index,
    investigate: null, waitT: 0, seen: 0,
  };
}
export function makeSentinel(def) {
  return { ...def, facing: def.base, state: STATE.PATROL, suspicion: 0, fov: 1.15, bark: '', barkT: 0, isSentinel: true };
}
function say(g, list, game) {
  g.bark = list[g.barkIdx % list.length]; g.barkIdx += 2; g.barkT = 2.6;
  if (game) game.lastBark = g.bark;
}
function moveToward(g, tx, ty, dt, speed) {
  const dx = tx - g.x, dy = ty - g.y, d = Math.hypot(dx, dy);
  if (d < 4) return true;
  const want = Math.atan2(dy, dx);
  let diff = want - g.facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  g.facing += Math.max(-3.4 * dt, Math.min(3.4 * dt, diff));
  g.x += Math.cos(g.facing) * Math.min(speed * dt, d);
  g.y += Math.sin(g.facing) * Math.min(speed * dt, d);
  return d < 10;
}

export function updateObserver(g, dt, game, segs) {
  const p = game.player;
  if (g.barkT > 0) g.barkT -= dt;
  const range = g.isSentinel ? g.range : g.range + (g.type === 'keeper' ? 30 : 0);
  const strength = seeStrength(g.x, g.y, g.facing, g.fov, range, p, segs) * game.visibility;
  if (strength > 0) {
    const rate = strength * (p.sprinting ? 1.5 : 1) * (DETECTION.fillFar + (DETECTION.fillNear - DETECTION.fillFar) * strength);
    g.suspicion = Math.min(100, g.suspicion + rate * dt);
    g.seen += dt;
    g.lastSeen = { x: p.x, y: p.y };
  } else {
    g.suspicion = Math.max(0, g.suspicion - DETECTION.decay * dt);
    g.seen = 0;
  }
  const was = g.state;
  if (g.suspicion >= 100) g.state = STATE.ALARM;
  else if (g.suspicion >= 62 && g.state === STATE.PATROL) { g.state = STATE.SUSPICIOUS; say(g, BARKS.suspicious, game); }
  else if (g.suspicion >= 30 && g.state === STATE.SUSPICIOUS && g.lastSeen) { g.state = STATE.INVESTIGATE; g.investigate = g.lastSeen; say(g, BARKS.investigate, game); }
  else if (g.suspicion <= 4 && g.state !== STATE.PATROL) { g.state = STATE.PATROL; g.investigate = null; }
  if (g.state === STATE.ALARM && was !== STATE.ALARM) { say(g, BARKS.alarm, game); game.audio.alarm(); }
  if (g.state === STATE.ALARM) {
    game.alarm = Math.min(100, game.alarm + DETECTION.alarmFill * dt);
    if (g.lastSeen) g.investigate = g.lastSeen;
  }
  return strength;
}

export function updateGuard(g, dt, game, segs) {
  updateObserver(g, dt, game, segs);
  if (g.isSentinel) { g.facing = g.base + Math.sin(game.time * g.sweep) * 1.25; return; }
  if (g.state === STATE.ALARM || g.state === STATE.INVESTIGATE) {
    const t = g.investigate || { x: game.player.x, y: game.player.y };
    if (moveToward(g, t.x, t.y, dt, g.speed * (g.state === STATE.ALARM ? 1.65 : 1.25))) {
      g.waitT += dt;
      if (g.waitT > 2.2 && g.state === STATE.INVESTIGATE) { g.suspicion = Math.min(g.suspicion, 20); g.investigate = null; g.state = STATE.PATROL; }
    }
    // Capture: an alarmed guard who touches the thief lands a strike.
    const d = Math.hypot(g.x - game.player.x, g.y - game.player.y);
    if (g.state === STATE.ALARM && d < 30 && game.strikeCooldown <= 0) game.pendingStrike = true;
    return;
  }
  if (g.state === STATE.SUSPICIOUS) { // stop, stare toward the last glimpse
    if (g.lastSeen) {
      const want = Math.atan2(g.lastSeen.y - g.y, g.lastSeen.x - g.x);
      let diff = want - g.facing;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      g.facing += Math.max(-2.6 * dt, Math.min(2.6 * dt, diff));
    }
    return;
  }
  const [tx, ty] = g.path[g.wp];
  if (moveToward(g, tx, ty, dt, g.speed)) { g.wp = (g.wp + 1) % g.path.length; g.waitT = 0; }
}

/** True while any observer (guard or sentinel) is in full ALARM. */
export function anyAlarm(game) { return game.guards.some((g) => g.state === STATE.ALARM); }

/** Noise lure: a thrown coin pulls nearby PATROL/SUSPICIOUS guards to the ring point. */
export function lureGuards(game, x, y, radius) {
  let n = 0;
  for (const g of game.guards) {
    if (g.isSentinel) continue;
    if (Math.hypot(g.x - x, g.y - y) <= radius && g.state !== STATE.ALARM) {
      g.state = STATE.INVESTIGATE; g.investigate = { x, y }; g.suspicion = Math.max(g.suspicion, 45); n++;
    }
  }
  return n;
}
