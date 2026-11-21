// VELVET HOUR — boot, screens, the fixed-step loop, level flow, strikes and the GHOST rating.
// ?shot=<scene>&seed=7 stages a deterministic scene, paints twice and sets window.__shotReady.
import { DETECTION, STEP } from './config.js';
import { LEVELS } from './levels.js';
import { occluderSegments, visibilityOf } from './vision.js';
import { makeGuard, makeSentinel, updateGuard } from './guards.js';
import { makePlayer, updatePlayer, throwCoin, snuffLamp, puffPerfume } from './player.js';
import { ACT, createInput } from './input.js';
import { createAudio } from './audio.js';
import { drawScene, drawPanel } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = 1280; canvas.height = 720;
const audio = createAudio(!shotName);

export function createGame() {
  return {
    level: LEVELS[0], levelIndex: 0, player: null, guards: [], segs: [],
    litLamps: [], lampTimers: [], rings: [], time: 0, visibility: 0.6, maxSuspicion: 0,
    alarm: 0, loot: 0, levelLoot: 0, totalLootAtStart: 0, hasOrchid: false,
    spotted: 0, strikes: 0, alarmsRaised: 0, strikeCooldown: 0, pendingStrike: false,
    toast: '', toastT: 0, lastBark: '', audio, screen: 'title', unlocked: 1, ghost: true,
  };
}
const game = createGame();

export function loadLevel(game, idx, keepLoot) {
  const L = LEVELS[idx];
  // Fresh treasure state per attempt unless keeping campaign loot on advance.
  if (!keepLoot) for (const t of L.treasures) t.taken = false;
  game.level = L; game.levelIndex = idx;
  game.player = makePlayer(L);
  game.guards = [...L.guards.map((d, i) => makeGuard(d, i)), ...L.sentinels.map((d) => makeSentinel(d))];
  game.segs = occluderSegments(L);
  game.litLamps = L.lamps.map(() => true);
  game.lampTimers = L.lamps.map(() => 0);
  game.rings = []; game.alarm = 0; game.maxSuspicion = 0; game.hasOrchid = false;
  game.levelLoot = L.treasures.filter((t) => t.taken).length;
  game.strikeCooldown = 0; game.pendingStrike = false; game.lastBark = '';
  game.toast = `${L.name} — ${L.sub}`; game.toastT = 3;
}

function stepGuards(game, dt) {
  game.time += dt;
  let maxS = 0, anyAlarm = false;
  for (const g of game.guards) {
    const prev = g.state;
    updateGuard(g, dt, game, game.segs);
    if (g.state === 'ALARM') { anyAlarm = true; if (prev !== 'ALARM') { game.spotted++; game.alarmsRaised++; } }
    maxS = Math.max(maxS, g.suspicion);
  }
  game.maxSuspicion = maxS;
  if (!anyAlarm) game.alarm = Math.max(0, game.alarm - DETECTION.alarmDecay * dt);
  game.visibility = visibilityOf(game.player, game.level, game.litLamps);
}

function stepPlay(game, dt, input) {
  const acts = input.takeActions();
  if (acts & ACT.PAUSE) { game.screen = 'paused'; return; }
  if (acts & ACT.COIN) throwCoin(game.player, game);
  if (acts & ACT.SNUFF) snuffLamp(game.player, game);
  if (acts & ACT.PERFUME) puffPerfume(game.player, game);
  updatePlayer(game.player, dt, input, game);
  stepGuards(game, dt);
  // Lamp timers relight snuffed lamps.
  game.level.lamps.forEach((_, i) => {
    if (!game.litLamps[i]) { game.lampTimers[i] -= dt; if (game.lampTimers[i] <= 0) game.litLamps[i] = true; }
  });
  for (const r of game.rings) { r.t += dt; r.r += 260 * dt; }
  game.rings = game.rings.filter((r) => r.t < 1.2);
  if (game.toastT > 0) game.toastT -= dt;
  if (game.strikeCooldown > 0) game.strikeCooldown -= dt;
  if (game.pendingStrike) {
    game.pendingStrike = false; game.strikes++; game.strikeCooldown = 2.5;
    game.alarm = 35; game.audio.caught();
    for (const g of game.guards) { g.suspicion = Math.min(g.suspicion, 30); if (g.state === 'ALARM') g.state = 'INVESTIGATE'; }
    game.player.x = game.level.start[0]; game.player.y = game.level.start[1];
    game.toast = `Caught! Strike ${game.strikes}/3 — back to the shadows.`; game.toastT = 2.6;
    if (game.strikes >= 3) game.screen = 'over';
  }
  if (game.alarm >= 100) { game.alarm = 60; game.pendingStrike = true; }
  // Escape with the Orchid completes the wing.
  const L = game.level;
  if (game.hasOrchid && Math.hypot(L.exit[0] - game.player.x, L.exit[1] - game.player.y) < 30) {
    game.unlocked = Math.min(5, Math.max(game.unlocked, game.levelIndex + 2));
    game.ghost = game.alarmsRaised === 0 && game.strikes === 0;
    if (game.levelIndex === LEVELS.length - 1) { game.screen = 'victory'; game.audio.win(); }
    else { game.screen = 'complete'; game.audio.clear(); }
  }
}

function draw(game) {
  drawScene(ctx, game, game.segs);
  if (game.screen === 'title') drawPanel(ctx, 'VELVET HOUR', [
    'The Clockwork Conservatory — a top-down stealth heist',
    '5 wings · 23 guards & sentinels · 34 treasures · 3 gadgets',
    'Steal each wing\'s Moon Orchid and slip out the gate.',
    'Stay out of the cones. Crouch in flower beds. Mind the lamps.',
    `Wings unlocked: ${game.unlocked} — press 1–5 to choose, Space to begin`,
  ], 'SPACE — begin the heist');
  else if (game.screen === 'paused') drawPanel(ctx, 'Paused', ['The ball holds its breath.'], 'P — resume');
  else if (game.screen === 'complete') drawPanel(ctx, 'Wing Cleared', [
    `${game.level.name} robbed. Loot so far: ${game.loot}.`,
    game.alarmsRaised === 0 ? 'Not one alarm — GHOST pace kept.' : `Alarms raised: ${game.alarmsRaised}.`,
  ], 'SPACE — next wing');
  else if (game.screen === 'over') drawPanel(ctx, 'Caught', ['Three strikes. The wardens drag you to the gatehouse.'], 'R — retry the wing · SPACE — retry');
  else if (game.screen === 'victory') drawPanel(ctx, 'THE ORCHID IS YOURS', [
    `Campaign loot: ${game.loot}/34 treasures. Strikes: ${game.strikes}.`,
    game.alarmsRaised === 0 && game.strikes === 0 ? 'Rating: GHOST — the ball never knew.' : 'Rating: VELVET PHANTOM — seen, but never held.',
  ], 'SPACE — play again');
}

if (shotName) {
  loadLevel(game, 0, false);
  stageShot(shotName, game, loadLevel, stepGuards);
  game.screen = 'play';
  let painted = 0;
  const paint = () => { draw(game); if (++painted < 2) requestAnimationFrame(paint); else window.__shotReady = true; };
  requestAnimationFrame(paint);
} else {
  loadLevel(game, 0, false);
  const input = createInput();
  let last = performance.now(), acc = 0;
  const frame = (now) => {
    requestAnimationFrame(frame);
    acc += Math.min((now - last) / 1000, 0.25); last = now;
    const actsPeek = () => input.takeActions();
    while (acc >= STEP) {
      acc -= STEP;
      if (game.screen === 'play') stepPlay(game, STEP, input);
      else {
        // Menu screens still consume one-shot actions exactly once per step.
        const acts = actsPeek();
        if (game.screen === 'title') {
          if (acts & ACT.LEVEL) { const pick = input.takeLevelPick(); if (pick >= 0 && pick < game.unlocked) loadLevel(game, pick, false); }
          if (acts & ACT.CONFIRM) { game.screen = 'play'; }
        } else if (game.screen === 'paused' && (acts & ACT.PAUSE)) game.screen = 'play';
        else if (game.screen === 'complete' && (acts & ACT.CONFIRM)) { loadLevel(game, game.levelIndex + 1, true); game.screen = 'play'; }
        else if (game.screen === 'over' && (acts & (ACT.RETRY | ACT.CONFIRM))) { game.strikes = 0; game.loot -= game.levelLoot; loadLevel(game, game.levelIndex, false); game.screen = 'play'; }
        else if (game.screen === 'victory' && (acts & ACT.CONFIRM)) { game.strikes = 0; game.loot = 0; game.alarmsRaised = 0; game.spotted = 0; loadLevel(game, 0, false); game.screen = 'play'; }
        if (game.screen !== 'play' && game.screen !== 'title') { /* panels only */ }
        if (game.screen === 'title') stepGuards(game, STEP); // living backdrop patrols
      }
    }
    draw(game);
  };
  requestAnimationFrame(frame);
}
