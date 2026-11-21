// Drawing: richly textured per-wing floors, lush props, figured sprites, soft-edged
// vision cones, occluders, loot, barks — then the HUD. Visual layer only: no mechanics here.
import { PALETTE } from './config.js';
import { conePolygon } from './vision.js';
import { drawHud, drawPanel } from './hud.js';

function path(ctx, pts) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
// Deterministic 0..1 hash from coordinates — stable texture speckle, never Math.random.
function det(x, y) { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); }
function shadow(ctx, x, y, rx, ry) {
  ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
const FLOWER_COLS = ['#e86a9a', '#ffd94d', '#ff8a5c', '#c86ae8', '#ffffff', '#ff5c7a'];

// ---- Per-wing textured floors -------------------------------------------------
function drawFloor(ctx, game) {
  const idx = game.levelIndex, t = game.time;
  const base = ['#182b1e', '#131c22', '#2a2417', '#0d2c30', '#100f14'][idx];
  ctx.fillStyle = base; ctx.fillRect(0, 42, 1280, 646);
  if (idx === 0) { // Palm Court: stone tile checker + grout + centre medallion
    for (let x = 0; x < 1280; x += 64) for (let y = 42; y < 688; y += 64) {
      if (((x / 64) + ((y - 42) / 64)) % 2 === 0) { ctx.fillStyle = 'rgba(255,240,200,0.055)'; ctx.fillRect(x, y, 64, 64); }
      if (det(x, y) > 0.7) { ctx.fillStyle = 'rgba(0,0,0,0.10)'; ctx.fillRect(x + 8, y + 10, 22, 3); }
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.42)'; ctx.lineWidth = 2;
    for (let x = 0; x <= 1280; x += 64) { ctx.beginPath(); ctx.moveTo(x, 42); ctx.lineTo(x, 688); ctx.stroke(); }
    for (let y = 42; y <= 688; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(233,200,120,0.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(640, 365, 120, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(640, 365, 88, 0, Math.PI * 2); ctx.stroke();
  } else if (idx === 1) { // Orchid House: dark marble with veins + gold flecks
    ctx.strokeStyle = 'rgba(190,210,235,0.13)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 26; i++) {
      const x = det(i, 3) * 1280, y = 42 + det(i, 9) * 646;
      ctx.beginPath(); ctx.moveTo(x, y);
      ctx.lineTo(x + 60 + det(i, 5) * 90, y + 18 - det(i, 7) * 36); ctx.lineTo(x + 130 + det(i, 11) * 80, y + 8); ctx.stroke();
    }
    for (let i = 0; i < 90; i++) { ctx.fillStyle = 'rgba(233,200,120,0.20)'; ctx.fillRect(det(i, 21) * 1280, 42 + det(i, 23) * 646, 3, 3); }
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    for (let x = 0; x <= 1280; x += 128) { ctx.beginPath(); ctx.moveTo(x, 42); ctx.lineTo(x, 688); ctx.stroke(); }
    for (let y = 42; y <= 688; y += 128) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); }
  } else if (idx === 2) { // Rose Maze: gravel paths + speckle between the hedges
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = det(i, 31) > 0.5 ? 'rgba(255,235,190,0.10)' : 'rgba(0,0,0,0.13)';
      ctx.fillRect(det(i, 33) * 1280, 42 + det(i, 37) * 646, 3, 2);
    }
    ctx.fillStyle = 'rgba(214,188,140,0.16)';
    ctx.fillRect(0, 232, 1280, 52); ctx.fillRect(0, 392, 1280, 52); ctx.fillRect(0, 552, 1280, 52);
    ctx.fillRect(600, 42, 80, 646);
    ctx.strokeStyle = 'rgba(120,60,40,0.35)'; ctx.lineWidth = 2;
    for (const y of [232, 284, 392, 444, 552, 604]) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); }
  } else if (idx === 3) { // Flooded Grotto: teal water, ripples, plank walkways
    const wg = ctx.createLinearGradient(0, 42, 0, 688);
    wg.addColorStop(0, '#0e3238'); wg.addColorStop(0.5, '#0a272e'); wg.addColorStop(1, '#0e3238');
    ctx.fillStyle = wg; ctx.fillRect(0, 42, 1280, 646);
    ctx.strokeStyle = 'rgba(140,230,220,0.20)'; ctx.lineWidth = 1.6;
    for (let i = 0; i < 22; i++) {
      const x = det(i, 41) * 1280, y = 60 + det(i, 43) * 610, r = 12 + det(i, 47) * 26 + Math.sin(t * 1.4 + i) * 3;
      ctx.beginPath(); ctx.arc(x, y, Math.max(6, r), 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, Math.max(3, r * 0.55), 0, Math.PI * 2); ctx.stroke();
    }
    // Wooden plank walkways: two horizontal causeways + one vertical.
    for (const band of [[0, 318, 1280, 26], [0, 470, 1280, 26], [452, 42, 26, 646]]) {
      ctx.fillStyle = '#5d4226'; ctx.fillRect(band[0], band[1], band[2], band[3]);
      ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = 2;
      if (band[2] > band[3]) for (let x = band[0] + 26; x < band[0] + band[2]; x += 26) { ctx.beginPath(); ctx.moveTo(x, band[1]); ctx.lineTo(x, band[1] + band[3]); ctx.stroke(); }
      else for (let y = band[1] + 26; y < band[1] + band[3]; y += 26) { ctx.beginPath(); ctx.moveTo(band[0], y); ctx.lineTo(band[0] + band[2], y); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,220,160,0.25)'; ctx.strokeRect(band[0], band[1], band[2], band[3]);
    }
  } else { // Glass Vault: black-and-gold checker marble + red carpet cross
    for (let x = 0; x < 1280; x += 64) for (let y = 42; y < 688; y += 64) {
      ctx.fillStyle = (((x / 64) + ((y - 42) / 64)) % 2 === 0) ? 'rgba(255,255,255,0.075)' : 'rgba(201,164,78,0.075)';
      ctx.fillRect(x, y, 64, 64);
    }
    ctx.strokeStyle = 'rgba(201,164,78,0.30)'; ctx.lineWidth = 1.6;
    for (let x = 0; x <= 1280; x += 64) { ctx.beginPath(); ctx.moveTo(x, 42); ctx.lineTo(x, 688); ctx.stroke(); }
    for (let y = 42; y <= 688; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(122,18,32,0.88)'; ctx.fillRect(592, 42, 96, 646); ctx.fillRect(0, 330, 1280, 70);
    ctx.strokeStyle = '#c9a44e'; ctx.lineWidth = 3; ctx.strokeRect(592, 42, 96, 646); ctx.strokeRect(0, 330, 1280, 70);
    ctx.fillStyle = 'rgba(255,215,130,0.20)';
    for (let x = 20; x < 1280; x += 52) ctx.fillRect(x, 360, 16, 8);
    for (let y = 62; y < 688; y += 52) ctx.fillRect(632, y, 16, 8);
  }
}
// ---- Decorative props ----------------------------------------------------------
function drawProp(ctx, pr, t) {
  const { x, y } = pr;
  if (pr.type === 'palm') {
    shadow(ctx, x, y + 12, 16, 5);
    ctx.fillStyle = '#8a4f26'; ctx.beginPath(); ctx.moveTo(x - 9, y + 2); ctx.lineTo(x + 9, y + 2); ctx.lineTo(x + 6, y + 14); ctx.lineTo(x - 6, y + 14); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#c9a44e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 9, y + 3); ctx.lineTo(x + 9, y + 3); ctx.stroke();
    ctx.strokeStyle = '#2e8d4e'; ctx.lineWidth = 3.4;
    for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.92 + i * 0.3; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + Math.cos(a) * 15, y + Math.sin(a) * 15 - 5, x + Math.cos(a) * 26, y + Math.sin(a) * 22 + 7); ctx.stroke(); }
    ctx.fillStyle = '#3fae62'; ctx.beginPath(); ctx.arc(x, y - 3, 6, 0, Math.PI * 2); ctx.fill();
  } else if (pr.type === 'statue') {
    shadow(ctx, x, y + 16, 17, 5);
    ctx.fillStyle = '#6f7480'; ctx.fillRect(x - 11, y + 4, 22, 12);
    ctx.fillStyle = '#9aa0ab'; ctx.fillRect(x - 13, y + 2, 26, 4);
    ctx.fillStyle = '#c7ccd6'; ctx.beginPath(); ctx.arc(x, y - 12, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 5, y - 6, 10, 10);
    ctx.strokeStyle = '#c7ccd6'; ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(x + 4, y - 4); ctx.lineTo(x + 13, y + 3); ctx.stroke();
  } else if (pr.type === 'bench') {
    shadow(ctx, x, y + 8, 24, 5);
    ctx.fillStyle = '#5d3d1e';
    for (let i = 0; i < 3; i++) ctx.fillRect(x - 24, y - 8 + i * 6, 48, 4);
    ctx.fillRect(x - 24, y + 6, 48, 4);
    ctx.fillStyle = '#2c2c34'; ctx.fillRect(x - 20, y + 10, 4, 6); ctx.fillRect(x + 16, y + 10, 4, 6);
  } else if (pr.type === 'urn') {
    shadow(ctx, x, y + 11, 13, 4);
    ctx.fillStyle = '#7d5a8f'; ctx.beginPath(); ctx.moveTo(x - 8, y - 10); ctx.lineTo(x + 8, y - 10); ctx.lineTo(x + 5, y + 8); ctx.lineTo(x - 5, y + 8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#a67fc0'; ctx.fillRect(x - 10, y - 13, 20, 4);
    ctx.fillStyle = '#2e8d4e'; ctx.beginPath(); ctx.arc(x - 4, y - 16, 6, 0, Math.PI * 2); ctx.arc(x + 5, y - 17, 7, 0, Math.PI * 2); ctx.arc(x, y - 20, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = FLOWER_COLS[Math.floor(det(x, y) * 6)]; ctx.beginPath(); ctx.arc(x, y - 19, 2.6, 0, Math.PI * 2); ctx.fill();
  } else { // topiary: stacked clipped spheres on a small pot
    shadow(ctx, x, y + 14, 15, 5);
    ctx.fillStyle = '#6e4520'; ctx.fillRect(x - 7, y + 6, 14, 8);
    ctx.fillStyle = '#1f6b38'; ctx.beginPath(); ctx.arc(x, y + 2, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2e8d4e'; ctx.beginPath(); ctx.arc(x, y - 13, 9.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#46b96a'; ctx.beginPath(); ctx.arc(x - 4, y - 16, 4, 0, Math.PI * 2); ctx.arc(x + 5, y + 0, 4.4, 0, Math.PI * 2); ctx.fill();
  }
}
// ---- Vision cones: +15% visual reach, soft gradient, bright rim -----------------
function drawCone(ctx, g, segs) {
  const baseRange = g.isSentinel ? g.range : g.range + (g.type === 'keeper' ? 30 : 0);
  const range = baseRange * 1.15; // VISUAL ONLY — detection still uses the true range in guards.js
  const poly = conePolygon(g.x, g.y, g.facing, g.fov, range, segs);
  const cols = g.state === 'ALARM' ? ['rgba(255,52,32,0.52)', 'rgba(255,52,32,0.16)']
    : g.state === 'PATROL' ? ['rgba(178,226,255,0.30)', 'rgba(178,226,255,0.07)']
    : ['rgba(255,206,44,0.46)', 'rgba(255,206,44,0.13)'];
  const gr = ctx.createRadialGradient(g.x, g.y, 8, g.x, g.y, range);
  gr.addColorStop(0, cols[0]); gr.addColorStop(0.72, cols[0]); gr.addColorStop(1, cols[1]);
  ctx.fillStyle = gr; path(ctx, poly); ctx.fill();
  ctx.strokeStyle = g.state === 'ALARM' ? 'rgba(255,120,100,0.75)' : g.state === 'PATROL' ? 'rgba(210,240,255,0.42)' : 'rgba(255,226,110,0.68)';
  ctx.lineWidth = 2; path(ctx, poly); ctx.stroke();
  if (g.type === 'keeper' && !g.isSentinel) {
    const gr2 = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, 74);
    gr2.addColorStop(0, 'rgba(255,214,120,0.38)'); gr2.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = gr2; ctx.beginPath(); ctx.arc(g.x, g.y, 74, 0, Math.PI * 2); ctx.fill();
  }
}
export function drawScene(ctx, game, segs) {
  const L = game.level;
  drawFloor(ctx, game);
  // Flower beds: soil, stone edging, dense multi-colour blossom + leaf clusters.
  for (const b of L.beds) {
    ctx.fillStyle = '#3a2718'; ctx.fillRect(b[0], b[1], b[2], b[3]);
    ctx.fillStyle = '#2a1c10'; ctx.fillRect(b[0] + 5, b[1] + 5, b[2] - 10, b[3] - 10);
    ctx.strokeStyle = '#8d8574'; ctx.lineWidth = 3; ctx.strokeRect(b[0] + 1, b[1] + 1, b[2] - 2, b[3] - 2);
    for (let x = b[0] + 9; x < b[0] + b[2] - 4; x += 13) for (let y = b[1] + 9; y < b[1] + b[3] - 4; y += 11) {
      const d = det(x, y);
      ctx.fillStyle = '#2e7d46'; ctx.beginPath(); ctx.arc(x + 3, y + 3, 4.2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = FLOWER_COLS[Math.floor(d * 6) % 6];
      ctx.beginPath(); ctx.arc(x + ((y * 7) % 7), y, 2.9, 0, Math.PI * 2); ctx.fill();
      if (d > 0.62) { ctx.fillStyle = '#ffe9f2'; ctx.beginPath(); ctx.arc(x + 5, y + 5, 1.7, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  // Decorative props (under cones, over floors).
  for (const pr of L.props || []) drawProp(ctx, pr, game.time);
  // Decorative plants: terracotta pot + layered leaf blobs.
  for (const pl of L.plants) {
    shadow(ctx, pl[0], pl[1] + pl[2] * 0.7, pl[2] * 0.8, 4);
    ctx.fillStyle = '#8a4f26'; ctx.beginPath(); ctx.arc(pl[0], pl[1] + pl[2] * 0.55, pl[2] * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1e5c31'; ctx.beginPath(); ctx.arc(pl[0], pl[1], pl[2], 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2e8d4e';
    ctx.beginPath(); ctx.arc(pl[0] - pl[2] * 0.4, pl[1] - pl[2] * 0.3, pl[2] * 0.55, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(pl[0] + pl[2] * 0.38, pl[1] + pl[2] * 0.2, pl[2] * 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#4cc06e'; ctx.beginPath(); ctx.arc(pl[0] - 2, pl[1] - pl[2] * 0.45, pl[2] * 0.3, 0, Math.PI * 2); ctx.fill();
  }
  // Fountains: stone rim, deep water, animated-looking concentric rings, sparkles, jet.
  for (const f of L.fountains) {
    shadow(ctx, f[0], f[1] + f[2] * 0.8, f[2], 8);
    ctx.fillStyle = '#7b7f88'; ctx.beginPath(); ctx.arc(f[0], f[1], f[2] + 5, 0, Math.PI * 2); ctx.fill();
    const wg = ctx.createRadialGradient(f[0], f[1], 4, f[0], f[1], f[2]);
    wg.addColorStop(0, '#2e7d99'); wg.addColorStop(1, '#123644');
    ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(f[0], f[1], f[2], 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(160,225,245,0.65)'; ctx.lineWidth = 2;
    for (let r = 0; r < 3; r++) { const rr = f[2] - 7 - r * 10 + Math.sin(game.time * 2 + r * 1.7) * 2; ctx.beginPath(); ctx.arc(f[0], f[1], Math.max(5, rr), 0, Math.PI * 2); ctx.stroke(); }
    ctx.fillStyle = '#eaf9ff';
    for (let i = 0; i < 6; i++) ctx.fillRect(f[0] + (det(i, f[0]) - 0.5) * f[2] * 1.4, f[1] + (det(i, f[1]) - 0.5) * f[2] * 1.4, 2.4, 2.4);
    ctx.fillStyle = '#cfeef8'; ctx.beginPath(); ctx.arc(f[0], f[1], 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(207,238,248,0.8)'; ctx.beginPath(); ctx.moveTo(f[0], f[1] - 4); ctx.lineTo(f[0], f[1] - 15); ctx.stroke();
  }
  // Hedges: layered leaf blobs, highlights, rose dots in the Maze wing.
  for (const h of L.hedges) {
    shadow(ctx, h[0] + h[2] / 2, h[1] + h[3] + 3, h[2] / 2, 5);
    ctx.fillStyle = '#17452a'; ctx.fillRect(h[0], h[1], h[2], h[3]);
    for (let x = h[0] + 6; x < h[0] + h[2] - 2; x += 11) for (let y = h[1] + 5; y < h[1] + h[3] - 2; y += 10) {
      ctx.fillStyle = det(x, y) > 0.45 ? '#2e8d4e' : '#226b3a';
      ctx.beginPath(); ctx.arc(x + ((y * 3) % 5), y, 6.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = '#54c276';
    for (let x = h[0] + 10; x < h[0] + h[2] - 4; x += 23) { ctx.beginPath(); ctx.arc(x, h[1] + 7, 3, 0, Math.PI * 2); ctx.fill(); }
    if (game.levelIndex === 2) { ctx.fillStyle = '#e84a6a'; for (let x = h[0] + 16; x < h[0] + h[2] - 6; x += 34) { ctx.beginPath(); ctx.arc(x, h[1] + h[3] - 8, 2.8, 0, Math.PI * 2); ctx.fill(); } }
  }
  // Lamp pools (bigger, warmer), then cones over the dressing.
  L.lamps.forEach((l, i) => {
    if (!game.litLamps[i]) return;
    const gr = ctx.createRadialGradient(l[0], l[1], 6, l[0], l[1], 112);
    gr.addColorStop(0, 'rgba(255,208,110,0.42)'); gr.addColorStop(0.6, 'rgba(255,196,96,0.18)'); gr.addColorStop(1, 'rgba(255,196,96,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(l[0], l[1], 112, 0, Math.PI * 2); ctx.fill();
  });
  for (const g of game.guards) drawCone(ctx, g, segs);
  // Walls: body, cap, base shadow line.
  for (const w of L.walls) {
    ctx.fillStyle = PALETTE.wall; ctx.fillRect(w[0], w[1], w[2], w[3]);
    ctx.fillStyle = PALETTE.wallTop; ctx.fillRect(w[0], w[1], w[2], 4);
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(w[0], w[1] + w[3] - 3, w[2], 3);
    ctx.fillStyle = 'rgba(201,164,78,0.5)'; ctx.fillRect(w[0], w[1], w[2], 1.4);
  }
  // Crates: shadow, wood grain, frame, metal corners, nails.
  for (const c of L.crates) {
    shadow(ctx, c[0] + c[2] / 2, c[1] + c[3] + 3, c[2] / 2, 5);
    ctx.fillStyle = PALETTE.crate; ctx.fillRect(c[0], c[1], c[2], c[3]);
    ctx.strokeStyle = 'rgba(60,38,14,0.55)'; ctx.lineWidth = 1.4;
    for (let y = c[1] + 9; y < c[1] + c[3] - 3; y += 9) { ctx.beginPath(); ctx.moveTo(c[0] + 3, y + det(c[0], y) * 2); ctx.lineTo(c[0] + c[2] - 3, y); ctx.stroke(); }
    ctx.strokeStyle = PALETTE.crateEdge; ctx.lineWidth = 2.4; ctx.strokeRect(c[0] + 1, c[1] + 1, c[2] - 2, c[3] - 2);
    ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + c[2], c[1] + c[3]); ctx.moveTo(c[0] + c[2], c[1]); ctx.lineTo(c[0], c[1] + c[3]); ctx.stroke();
    ctx.strokeStyle = '#3d3d46'; ctx.lineWidth = 3.4;
    for (const [cx, cy] of [[c[0] + 5, c[1] + 5], [c[0] + c[2] - 5, c[1] + 5], [c[0] + 5, c[1] + c[3] - 5], [c[0] + c[2] - 5, c[1] + c[3] - 5]]) {
      ctx.beginPath(); ctx.moveTo(cx - 4, cy); ctx.lineTo(cx + 4, cy); ctx.moveTo(cx, cy - 4); ctx.lineTo(cx, cy + 4); ctx.stroke();
    }
  }
  // Lamp posts: pole, crossbar, glowing head.
  L.lamps.forEach((l, i) => {
    shadow(ctx, l[0], l[1] + 8, 9, 3.4);
    ctx.fillStyle = '#22222a'; ctx.fillRect(l[0] - 2, l[1] - 3, 4, 11);
    ctx.fillRect(l[0] - 7, l[1] - 8, 14, 3);
    if (game.litLamps[i]) { ctx.fillStyle = 'rgba(255,217,138,0.35)'; ctx.beginPath(); ctx.arc(l[0], l[1] - 4, 11, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = game.litLamps[i] ? PALETTE.lampCore : '#555049';
    ctx.beginPath(); ctx.arc(l[0], l[1] - 4, 6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9a44e'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(l[0], l[1] - 4, 6, 0, Math.PI * 2); ctx.stroke();
  });
  // Exit gate: arch, bars, plaque.
  ctx.fillStyle = '#22382a'; ctx.fillRect(L.exit[0] - 19, L.exit[1] - 26, 38, 52);
  ctx.strokeStyle = game.hasOrchid ? '#7fe08a' : '#c9a44e'; ctx.lineWidth = 3; ctx.strokeRect(L.exit[0] - 19, L.exit[1] - 26, 38, 52);
  ctx.strokeStyle = 'rgba(220,225,235,0.55)'; ctx.lineWidth = 2;
  for (let x = -12; x <= 12; x += 8) { ctx.beginPath(); ctx.moveTo(L.exit[0] + x, L.exit[1] - 22); ctx.lineTo(L.exit[0] + x, L.exit[1] + 22); ctx.stroke(); }
  ctx.fillStyle = '#0d2016'; ctx.fillRect(L.exit[0] - 15, L.exit[1] - 8, 30, 15);
  ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('GATE', L.exit[0], L.exit[1] + 3);
  if (!game.hasOrchid) {
    ctx.fillStyle = 'rgba(233,184,255,0.20)'; ctx.beginPath(); ctx.arc(L.orchid[0], L.orchid[1], 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.orchid; ctx.font = '30px Georgia'; ctx.textAlign = 'center'; ctx.fillText('✿', L.orchid[0], L.orchid[1] + 10);
    ctx.fillStyle = '#fff0fb';
    for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2 + game.time; ctx.beginPath(); ctx.arc(L.orchid[0] + Math.cos(a) * 13, L.orchid[1] + Math.sin(a) * 13, 2.2, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = 'rgba(233,184,255,0.65)'; ctx.beginPath(); ctx.arc(L.orchid[0], L.orchid[1], 20 + Math.sin(game.time * 3) * 3, 0, Math.PI * 2); ctx.stroke();
  }
  // Treasures: halo pedestal + gem.
  for (const t of L.treasures) {
    if (t.taken) continue;
    ctx.fillStyle = 'rgba(255,217,77,0.20)'; ctx.beginPath(); ctx.arc(t.x, t.y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = PALETTE.treasure; ctx.font = '17px Georgia'; ctx.textAlign = 'center'; ctx.fillText('◆', t.x, t.y + 6);
    ctx.fillStyle = '#fff6c9'; ctx.fillRect(t.x - 1, t.y - 11, 2, 2);
  }
  for (const r of game.rings) {
    ctx.strokeStyle = `rgba(255,217,138,${Math.max(0, 1 - r.t / 1.2)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = `rgba(255,217,138,${Math.max(0, 0.5 - r.t / 1.2)})`;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.62, 0, Math.PI * 2); ctx.stroke();
  }
  for (const g of game.guards) drawGuard(ctx, g, game.time);
  drawPlayer(ctx, game);
  // Subtle vignette over the world (under the HUD).
  const vg = ctx.createRadialGradient(640, 365, 320, 640, 365, 770);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(0.78, 'rgba(0,0,0,0.10)'); vg.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = vg; ctx.fillRect(0, 42, 1280, 646);
  drawHud(ctx, game);
}
// ---- Figured sprites -------------------------------------------------------------
function drawPlayer(ctx, game) {
  const p = game.player;
  if (p.perfume > 0) {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(233,184,255,0.16)';
      ctx.beginPath(); ctx.arc(p.x + Math.cos(game.time * 2 + i * 1.7) * 20, p.y + Math.sin(game.time * 1.6 + i * 2.1) * 15, 13 - i * 1.6, 0, Math.PI * 2); ctx.fill();
    }
  }
  shadow(ctx, p.x, p.y + 11, 14, 5);
  // Cloak: deep burgundy teardrop body, gold clasp, hood, pale face, dark mask dot.
  ctx.fillStyle = '#5e2438';
  ctx.beginPath(); ctx.arc(p.x, p.y + 2, p.radius + 1.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a3049'; ctx.beginPath(); ctx.arc(p.x - 3, p.y - 1, p.radius * 0.62, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2c1626'; ctx.beginPath(); ctx.arc(p.x, p.y - 4, 8.6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f0dfc2'; ctx.beginPath(); ctx.arc(p.x + Math.cos(p.facing) * 2.6, p.y - 4 + Math.sin(p.facing) * 2.6, 5.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#14100e'; ctx.beginPath(); ctx.arc(p.x + Math.cos(p.facing) * 5.4, p.y - 4 + Math.sin(p.facing) * 5.4, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(p.x, p.y + 6, 2.4, 0, Math.PI * 2); ctx.fill();
  // Direction tick: a short cloak-point toward facing.
  ctx.strokeStyle = '#e8c9d5'; ctx.lineWidth = 2.6;
  ctx.beginPath(); ctx.moveTo(p.x + Math.cos(p.facing) * 10, p.y + 2 + Math.sin(p.facing) * 10); ctx.lineTo(p.x + Math.cos(p.facing) * 17, p.y + 2 + Math.sin(p.facing) * 17); ctx.stroke();
  if (p.crouch) { ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius + 5, 0, Math.PI * 2); ctx.stroke(); }
  if (game.hasOrchid) { ctx.fillStyle = PALETTE.orchid; ctx.font = '18px Georgia'; ctx.textAlign = 'center'; ctx.fillText('✿', p.x, p.y - 20); }
  if (p.noise > 0.55) { ctx.strokeStyle = 'rgba(255,179,92,0.55)'; ctx.beginPath(); ctx.arc(p.x, p.y, 20 + p.noise * 26, 0, Math.PI * 2); ctx.stroke(); }
}
function drawGuard(ctx, g, time) {
  if (g.isSentinel) {
    shadow(ctx, g.x, g.y + 13, 17, 5.5);
    ctx.fillStyle = '#4c3d1c'; ctx.fillRect(g.x - 14, g.y + 6, 28, 7);
    ctx.fillStyle = '#8a6d2f'; ctx.beginPath(); ctx.arc(g.x, g.y + 4, 14, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#b8933f'; ctx.beginPath(); ctx.arc(g.x, g.y + 2, 10.5, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#5e4a1e'; ctx.fillRect(g.x - 14, g.y + 3, 28, 3.4);
    // Rotating eye: bright pupil offset along facing, sweeping with the dome.
    const ex = g.x + Math.cos(g.facing) * 6, ey = g.y - 2 + Math.sin(g.facing) * 3.4;
    ctx.fillStyle = '#fff3b0'; ctx.beginPath(); ctx.arc(ex, ey, 4.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c22418'; ctx.beginPath(); ctx.arc(ex + Math.cos(g.facing) * 1.8, ey + Math.sin(g.facing) * 1.2, 2.1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    for (const dx of [-9, 0, 9]) { ctx.beginPath(); ctx.arc(g.x + dx, g.y + 9.5, 1.5, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 9px system-ui'; ctx.textAlign = 'center'; ctx.fillText('SENTINEL', g.x, g.y - 19);
  } else {
    const keeper = g.type === 'keeper';
    shadow(ctx, g.x, g.y + 12, 14.5, 5);
    // Uniform body, shoulder pads, head, hat with brim, direction tick.
    ctx.fillStyle = keeper ? '#7a4a21' : '#274b73';
    ctx.beginPath(); ctx.arc(g.x, g.y + 2, 13.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = keeper ? '#96602c' : '#35619a';
    ctx.beginPath(); ctx.arc(g.x - 8, g.y - 3, 5, 0, Math.PI * 2); ctx.arc(g.x + 8, g.y - 3, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8c9a0'; ctx.beginPath(); ctx.arc(g.x, g.y - 4, 6.8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = keeper ? '#4a2c10' : '#16283e';
    ctx.beginPath(); ctx.ellipse(g.x, g.y - 8.5, 10.5, 3.6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(g.x - 5.5, g.y - 14.5, 11, 6.5);
    ctx.fillStyle = '#ffd94d'; ctx.fillRect(g.x - 5.5, g.y - 9.6, 11, 1.8);
    ctx.strokeStyle = '#f2ecd9'; ctx.lineWidth = 2.6;
    ctx.beginPath(); ctx.moveTo(g.x + Math.cos(g.facing) * 9, g.y + 2 + Math.sin(g.facing) * 9); ctx.lineTo(g.x + Math.cos(g.facing) * 16, g.y + 2 + Math.sin(g.facing) * 16); ctx.stroke();
    ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(g.x, g.y + 7, 2.2, 0, Math.PI * 2); ctx.fill();
    if (keeper) { // carried lantern: warm glow handled in cones; here the lantern box itself
      const lx = g.x + 13, ly = g.y - 6 + Math.sin(time * 3 + g.x) * 1.6;
      ctx.fillStyle = 'rgba(255,214,120,0.30)'; ctx.beginPath(); ctx.arc(lx, ly, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2c2c34'; ctx.fillRect(lx - 3.6, ly - 4.6, 7.2, 9.2);
      ctx.fillStyle = '#ffd98a'; ctx.fillRect(lx - 2.2, ly - 3, 4.4, 6);
    }
  }
  if (g.suspicion > 3) {
    ctx.strokeStyle = g.state === 'ALARM' ? '#ff5147' : '#ffd23e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(g.x, g.y, 20, -Math.PI / 2, -Math.PI / 2 + (g.suspicion / 100) * Math.PI * 2); ctx.stroke();
  }
  const marker = g.state === 'ALARM' ? '!' : g.state === 'PATROL' ? '' : '?';
  if (marker) {
    ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = g.state === 'ALARM' ? '#ff5147' : '#ffd23e';
    ctx.fillText(marker, g.x, g.y - 25);
  }
  if (g.barkT > 0 && g.bark) {
    ctx.font = 'italic 12px system-ui'; ctx.textAlign = 'center';
    const w = ctx.measureText(g.bark).width + 14;
    ctx.fillStyle = 'rgba(5,12,8,0.88)'; ctx.fillRect(g.x - w / 2, g.y - 54, w, 18);
    ctx.strokeStyle = 'rgba(255,233,168,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(g.x - w / 2, g.y - 54, w, 18);
    ctx.fillStyle = '#ffe9a8'; ctx.fillText(g.bark, g.x, g.y - 41);
  }
}
export { drawPanel };
