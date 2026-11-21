// Drawing: frame-filling glasshouse floors, lamp pools, occluded vision cones, cover, loot,
// guards with state markers and barks, the thief, noise rings — then the HUD.
import { PALETTE } from './config.js';
import { conePolygon } from './vision.js';
import { drawHud, drawPanel } from './hud.js';

function path(ctx, pts) {
  ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
}
function coneColor(g) {
  return g.state === 'ALARM' ? PALETTE.coneAlarm : g.state === 'PATROL' ? PALETTE.coneCalm : PALETTE.coneSus;
}
export function drawScene(ctx, game, segs) {
  const L = game.level;
  ctx.fillStyle = PALETTE.floor; ctx.fillRect(0, 0, 1280, 720);
  // Floor tiles + marble diamonds: dense texture across the whole frame.
  ctx.strokeStyle = PALETTE.tileLine; ctx.lineWidth = 1;
  for (let x = 0; x <= 1280; x += 64) { ctx.beginPath(); ctx.moveTo(x, 42); ctx.lineTo(x, 688); ctx.stroke(); }
  for (let y = 42; y <= 688; y += 64) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1280, y); ctx.stroke(); }
  ctx.fillStyle = PALETTE.marble;
  for (let x = 32; x < 1280; x += 128) for (let y = 74; y < 688; y += 128) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-7, -7, 14, 14); ctx.restore();
  }
  // Flower beds (walkable low cover) with blossom dots.
  for (const b of L.beds) {
    ctx.fillStyle = PALETTE.bed; ctx.fillRect(b[0], b[1], b[2], b[3]);
    ctx.fillStyle = PALETTE.bedFlower;
    for (let x = b[0] + 10; x < b[0] + b[2] - 4; x += 22) for (let y = b[1] + 10; y < b[1] + b[3] - 4; y += 18) {
      ctx.beginPath(); ctx.arc(x + ((y * 7) % 9), y, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Decorative plants.
  for (const pl of L.plants) {
    ctx.fillStyle = '#276b3d'; ctx.beginPath(); ctx.arc(pl[0], pl[1], pl[2], 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#35854e'; ctx.beginPath(); ctx.arc(pl[0] - 3, pl[1] - 3, pl[2] * 0.55, 0, Math.PI * 2); ctx.fill();
  }
  // Fountains.
  for (const f of L.fountains) {
    ctx.fillStyle = '#173d4d'; ctx.beginPath(); ctx.arc(f[0], f[1], f[2], 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#7fc7d9'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(f[0], f[1], f[2] - 8, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#bfe9f5'; ctx.beginPath(); ctx.arc(f[0], f[1], 5, 0, Math.PI * 2); ctx.fill();
  }
  // Hedges (low cover, blocks movement).
  for (const h of L.hedges) {
    ctx.fillStyle = PALETTE.hedge; ctx.fillRect(h[0], h[1], h[2], h[3]);
    ctx.fillStyle = PALETTE.hedgeLight;
    for (let x = h[0] + 8; x < h[0] + h[2] - 4; x += 20) { ctx.beginPath(); ctx.arc(x, h[1] + h[3] / 2, 5, 0, Math.PI * 2); ctx.fill(); }
  }
  // Lamp pools (only lit lamps), then lamp posts.
  L.lamps.forEach((l, i) => {
    if (!game.litLamps[i]) return;
    const gr = ctx.createRadialGradient(l[0], l[1], 6, l[0], l[1], 92);
    gr.addColorStop(0, 'rgba(255,205,105,0.34)'); gr.addColorStop(1, 'rgba(255,205,105,0)');
    ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(l[0], l[1], 92, 0, Math.PI * 2); ctx.fill();
  });
  // Vision cones under actors but over the floor dressing.
  for (const g of game.guards) {
    const range = g.isSentinel ? g.range : g.range + (g.type === 'keeper' ? 30 : 0);
    ctx.fillStyle = coneColor(g);
    path(ctx, conePolygon(g.x, g.y, g.facing, g.fov, range, segs)); ctx.fill();
    if (g.type === 'keeper' && !g.isSentinel) { // carried lantern pool extends sight
      const gr = ctx.createRadialGradient(g.x, g.y, 4, g.x, g.y, 66);
      gr.addColorStop(0, 'rgba(255,210,110,0.30)'); gr.addColorStop(1, 'rgba(255,210,110,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(g.x, g.y, 66, 0, Math.PI * 2); ctx.fill();
    }
  }
  // Walls and crates (occluders) over cones.
  for (const w of L.walls) { ctx.fillStyle = PALETTE.wall; ctx.fillRect(w[0], w[1], w[2], w[3]); ctx.fillStyle = PALETTE.wallTop; ctx.fillRect(w[0], w[1], w[2], 3); }
  for (const c of L.crates) {
    ctx.fillStyle = PALETTE.crate; ctx.fillRect(c[0], c[1], c[2], c[3]);
    ctx.strokeStyle = PALETTE.crateEdge; ctx.lineWidth = 2; ctx.strokeRect(c[0] + 1, c[1] + 1, c[2] - 2, c[3] - 2);
    ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[0] + c[2], c[1] + c[3]); ctx.moveTo(c[0] + c[2], c[1]); ctx.lineTo(c[0], c[1] + c[3]); ctx.stroke();
  }
  L.lamps.forEach((l, i) => {
    ctx.fillStyle = '#2c2c34'; ctx.fillRect(l[0] - 2, l[1] - 2, 4, 4);
    ctx.fillStyle = game.litLamps[i] ? PALETTE.lampCore : '#555049';
    ctx.beginPath(); ctx.arc(l[0], l[1], 6, 0, Math.PI * 2); ctx.fill();
  });
  // Exit gate + Moon Orchid.
  ctx.fillStyle = game.hasOrchid ? '#7fe08a' : '#5a6e5e';
  ctx.fillRect(L.exit[0] - 16, L.exit[1] - 22, 32, 44);
  ctx.fillStyle = '#0d2016'; ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'center'; ctx.fillText('GATE', L.exit[0], L.exit[1] + 4);
  if (!game.hasOrchid) {
    ctx.fillStyle = PALETTE.orchid; ctx.font = '30px Georgia'; ctx.fillText('✿', L.orchid[0], L.orchid[1] + 10);
    ctx.strokeStyle = 'rgba(233,184,255,0.6)'; ctx.beginPath(); ctx.arc(L.orchid[0], L.orchid[1], 20 + Math.sin(game.time * 3) * 3, 0, Math.PI * 2); ctx.stroke();
  }
  // Treasures.
  for (const t of L.treasures) {
    if (t.taken) continue;
    ctx.fillStyle = PALETTE.treasure; ctx.font = '17px Georgia'; ctx.fillText('◆', t.x, t.y + 6);
  }
  // Coin noise rings.
  for (const r of game.rings) {
    ctx.strokeStyle = `rgba(255,217,138,${Math.max(0, 1 - r.t / 1.2)})`; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke();
  }
  // Guards and sentinels.
  for (const g of game.guards) drawGuard(ctx, g);
  // The thief (perfume cloud swirls when active).
  const p = game.player;
  if (p.perfume > 0) {
    ctx.fillStyle = 'rgba(233,184,255,0.25)'; ctx.beginPath(); ctx.arc(p.x, p.y, 30, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = PALETTE.player;
  ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = PALETTE.playerTrim;
  ctx.beginPath(); ctx.arc(p.x + Math.cos(p.facing) * 6, p.y + Math.sin(p.facing) * 6, 6, 0, Math.PI * 2); ctx.fill();
  if (p.crouch) { ctx.strokeStyle = '#ffd98a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2); ctx.stroke(); }
  if (game.hasOrchid) { // the stolen Orchid rides above the thief's head, plain for all to see
    ctx.fillStyle = PALETTE.orchid; ctx.font = '18px Georgia'; ctx.textAlign = 'center'; ctx.fillText('✿', p.x, p.y - 20);
  }
  if (p.noise > 0.55) { // sprint noise ring
    ctx.strokeStyle = 'rgba(255,179,92,0.5)'; ctx.beginPath(); ctx.arc(p.x, p.y, 20 + p.noise * 26, 0, Math.PI * 2); ctx.stroke();
  }
  drawHud(ctx, game);
}
function drawGuard(ctx, g) {
  if (g.isSentinel) {
    ctx.fillStyle = '#8a6d2f'; ctx.fillRect(g.x - 11, g.y - 11, 22, 22);
    ctx.fillStyle = '#ffd94d'; ctx.beginPath(); ctx.arc(g.x, g.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe9a8'; ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center'; ctx.fillText('SENTINEL', g.x, g.y - 18);
  } else {
    ctx.fillStyle = g.type === 'keeper' ? '#7a4a21' : '#274b73';
    ctx.beginPath(); ctx.arc(g.x, g.y, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    ctx.beginPath(); ctx.arc(g.x + Math.cos(g.facing) * 6, g.y + Math.sin(g.facing) * 6, 5.5, 0, Math.PI * 2); ctx.fill();
    if (g.type === 'keeper') { ctx.fillStyle = '#ffd98a'; ctx.beginPath(); ctx.arc(g.x + 10, g.y - 8, 4, 0, Math.PI * 2); ctx.fill(); }
  }
  // Suspicion arc + state marker + bark.
  if (g.suspicion > 3) {
    ctx.strokeStyle = g.state === 'ALARM' ? '#ff5147' : '#ffd23e'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(g.x, g.y, 19, -Math.PI / 2, -Math.PI / 2 + (g.suspicion / 100) * Math.PI * 2); ctx.stroke();
  }
  const marker = g.state === 'ALARM' ? '!' : g.state === 'PATROL' ? '' : '?';
  if (marker) {
    ctx.font = 'bold 22px system-ui'; ctx.textAlign = 'center';
    ctx.fillStyle = g.state === 'ALARM' ? '#ff5147' : '#ffd23e';
    ctx.fillText(marker, g.x, g.y - 24);
  }
  if (g.barkT > 0 && g.bark) {
    ctx.font = 'italic 12px system-ui'; ctx.textAlign = 'center';
    const w = ctx.measureText(g.bark).width + 14;
    ctx.fillStyle = 'rgba(5,12,8,0.85)'; ctx.fillRect(g.x - w / 2, g.y - 52, w, 18);
    ctx.fillStyle = '#ffe9a8'; ctx.fillText(g.bark, g.x, g.y - 39);
  }
}
export { drawPanel };
