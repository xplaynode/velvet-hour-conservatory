// Vision: raycast cones occluded by walls and crates, plus the visibility model.
// Pure geometry — no DOM, no randomness — so shot scenes and live play agree exactly.

export function segHit(x1, y1, x2, y2, x3, y3, x4, y4) {
  const d = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (d === 0) return null;
  const t = ((x3 - x1) * (y4 - y3) - (y3 - y1) * (x4 - x3)) / d;
  const u = ((x3 - x1) * (y2 - y1) - (y3 - y1) * (x2 - x1)) / d;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? t : null;
}

/** Rect edges as segments, cached per rect object identity is unnecessary — levels are small. */
export function rectSegments(r) {
  const [x, y, w, h] = r;
  return [
    [x, y, x + w, y], [x + w, y, x + w, y + h],
    [x + w, y + h, x, y + h], [x, y + h, x, y],
  ];
}

export function occluderSegments(level) {
  const segs = [];
  for (const r of level.walls) segs.push(...rectSegments(r));
  for (const r of level.crates) segs.push(...rectSegments(r));
  return segs;
}

/** Cast one ray; returns distance to nearest occluder or maxDist. */
export function castRay(ox, oy, angle, maxDist, segs) {
  const ex = ox + Math.cos(angle) * maxDist;
  const ey = oy + Math.sin(angle) * maxDist;
  let best = maxDist;
  for (const s of segs) {
    const t = segHit(ox, oy, ex, ey, s[0], s[1], s[2], s[3]);
    if (t !== null && t * maxDist < best) best = t * maxDist;
  }
  return best;
}

/** Cone outline polygon for drawing: fan of rays across the field of view. */
export function conePolygon(x, y, facing, fov, range, segs, rays = 26) {
  const pts = [[x, y]];
  for (let i = 0; i <= rays; i++) {
    const a = facing - fov / 2 + (fov * i) / rays;
    const d = castRay(x, y, a, range, segs);
    pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d]);
  }
  return pts;
}

/** Line of sight between two points (walls/crates block; hedges and beds do not). */
export function lineOfSight(x1, y1, x2, y2, segs) {
  for (const s of segs) {
    if (segHit(x1, y1, x2, y2, s[0], s[1], s[2], s[3]) !== null) return false;
  }
  return true;
}

/** Squared distance — the hot paths compare ranges without paying for square roots. */
export function dist2(x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1; return dx * dx + dy * dy; }

export function pointInRect(px, py, r) {
  return px >= r[0] && px <= r[0] + r[2] && py >= r[1] && py <= r[1] + r[3];
}

/** Is the point lit? Inside any live lamp pool (or a keeper's carried lantern). */
export function lightAt(level, litLamps, px, py) {
  for (let i = 0; i < level.lamps.length; i++) {
    if (!litLamps[i]) continue;
    const dx = px - level.lamps[i][0];
    const dy = py - level.lamps[i][1];
    if (dx * dx + dy * dy < 92 * 92) return 1;
  }
  return 0;
}

/**
 * Visibility 0..1 of the player for one observer: perfume cloud and crouching in
 * flower beds / behind hedges crush it; standing in lamplight raises it.
 */
export function visibilityOf(player, level, litLamps) {
  if (player.perfume > 0) return 0.04;
  let v = 0.62;
  if (player.crouch) v -= 0.22;
  const inBed = level.beds.some((r) => pointInRect(player.x, player.y, r));
  const inHedge = level.hedges.some((r) => pointInRect(player.x, player.y, r));
  if (inBed && player.crouch) v -= 0.34;
  else if (inBed || inHedge) v -= 0.16;
  if (lightAt(level, litLamps, player.x, player.y)) v += 0.30;
  if (player.sprinting) v += 0.10;
  return Math.max(0.05, Math.min(1, v));
}

/** Can an observer at (x,y) facing `facing` see the player right now? Returns 0..1 strength. */
export function seeStrength(x, y, facing, fov, range, player, segs) {
  const dx = player.x - x;
  const dy = player.y - y;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return 0;
  let diff = Math.atan2(dy, dx) - facing;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  if (Math.abs(diff) > fov / 2) return 0;
  if (!lineOfSight(x, y, player.x, player.y, segs)) return 0;
  const closeness = 1 - dist / range;
  return 0.25 + closeness * 0.95;
}
