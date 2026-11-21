// The dense HUD: top bar (wing, objective, detection %, ALARM meter, visibility, noise, loot,
// gadget charges, spotted count, strikes, GHOST tag) and a bottom legend + controls strip.
import { FONT_UI, PALETTE, TOTAL_TREASURES } from './config.js';

function bar(ctx, x, y, w, h, frac, color, label) {
  ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color; ctx.fillRect(x, y, Math.max(0, Math.min(1, frac)) * w, h);
  ctx.fillStyle = PALETTE.text; ctx.font = `11px ${FONT_UI}`; ctx.textAlign = 'left';
  ctx.fillText(label, x, y - 3);
}
export function drawHud(ctx, game) {
  const p = game.player;
  ctx.fillStyle = PALETTE.hudBar; ctx.fillRect(0, 0, 1280, 42);
  ctx.fillStyle = PALETTE.text; ctx.font = `bold 15px ${FONT_UI}`; ctx.textAlign = 'left';
  ctx.fillText(`VELVET HOUR · ${game.level.name}`, 12, 18);
  ctx.font = `12px ${FONT_UI}`; ctx.fillStyle = PALETTE.muted;
  ctx.fillText(game.hasOrchid ? 'Objective: ESCAPE through the gate ▸' : 'Objective: steal the Moon Orchid ✿, then escape', 12, 36);
  const det = Math.round(game.maxSuspicion);
  bar(ctx, 430, 22, 130, 10, det / 100, det > 70 ? PALETTE.danger : det > 35 ? '#ffd23e' : PALETTE.ok, `DETECTION ${det}%`);
  bar(ctx, 590, 22, 130, 10, game.alarm / 100, PALETTE.danger, `ALARM ${Math.round(game.alarm)}%`);
  bar(ctx, 750, 22, 90, 10, game.visibility, '#bfe3ff', `VISIBILITY ${Math.round(game.visibility * 100)}%`);
  bar(ctx, 870, 22, 90, 10, p.noise, '#ffb35c', `NOISE ${Math.round(p.noise * 100)}%`);
  ctx.fillStyle = PALETTE.text; ctx.font = `bold 13px ${FONT_UI}`; ctx.textAlign = 'right';
  ctx.fillText(`Loot ${game.loot}/${TOTAL_TREASURES}`, 1270, 17);
  ctx.font = `12px ${FONT_UI}`; ctx.fillStyle = PALETTE.muted;
  ctx.fillText(`Wing loot ${game.levelLoot}/${game.level.treasures.length} · Spotted ×${game.spotted} · Strikes ${game.strikes}/3${game.alarmsRaised === 0 ? ' · GHOST pace' : ''}`, 1270, 36);
  // Bottom strip: gadgets, legend, controls.
  ctx.fillStyle = PALETTE.hudBar; ctx.fillRect(0, 688, 1280, 32);
  ctx.textAlign = 'left'; ctx.font = `bold 12px ${FONT_UI}`; ctx.fillStyle = PALETTE.text;
  ctx.fillText(`Gadgets — [Q] Coin decoy ×${p.gadgets.coin}   [E] Snuff-cap ×${p.gadgets.snuff}   [F] Perfume puff ×${p.gadgets.perfume}${p.perfume > 0 ? ` (cloud ${p.perfume.toFixed(1)}s)` : ''}`, 12, 708);
  ctx.font = `11px ${FONT_UI}`; ctx.fillStyle = PALETTE.muted;
  ctx.fillText('Legend: pale calm · yellow wary · red ALARM · ? / ! markers · ✿ Orchid · ◆ loot · ❀ bed cover', 470, 708);
  ctx.textAlign = 'right';
  ctx.fillText('WASD · Shift sprint · C crouch · P pause · R retry · 1–5 wings', 1270, 708);
  if (game.toastT > 0) {
    ctx.font = `bold 16px ${FONT_UI}`; ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(5,12,8,0.85)';
    const w = ctx.measureText(game.toast).width + 28;
    ctx.fillRect(640 - w / 2, 52, w, 28);
    ctx.fillStyle = '#ffd98a'; ctx.fillText(game.toast, 640, 71);
  }
  if (game.lastBark) {
    ctx.font = `italic 13px ${FONT_UI}`; ctx.textAlign = 'center'; ctx.fillStyle = '#ffe9a8';
    ctx.fillText(`“${game.lastBark}”`, 640, 100);
  }
}
export function drawPanel(ctx, title, lines, prompt) {
  ctx.fillStyle = PALETTE.panel; ctx.fillRect(290, 150, 700, 400);
  ctx.strokeStyle = '#c9a44e'; ctx.lineWidth = 2; ctx.strokeRect(290, 150, 700, 400);
  ctx.textAlign = 'center'; ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 40px Georgia, serif'; ctx.fillText(title, 640, 215);
  ctx.font = `16px ${FONT_UI}`; ctx.fillStyle = PALETTE.muted;
  lines.forEach((l, i) => ctx.fillText(l, 640, 262 + i * 26));
  ctx.font = `bold 17px ${FONT_UI}`; ctx.fillStyle = '#ffd98a';
  ctx.fillText(prompt, 640, 262 + lines.length * 26 + 26);
}
