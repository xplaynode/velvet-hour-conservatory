// VELVET HOUR — tuning, palette and shared constants. Logical field is the full 1280x720 frame.
export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const SEED = 7;
export const PLAYER = { radius: 13, walk: 148, sprint: 252, crouch: 82, collectRange: 24 };
export const DETECTION = { fillNear: 95, fillFar: 26, decay: 16, alarmFill: 30, alarmDecay: 7, captureAt: 100 };
export const GADGETS = {
  coin: { charges: 5, noiseRadius: 190, lureSeconds: 5 },
  snuff: { charges: 4, radius: 150, darkSeconds: 6 },
  perfume: { charges: 3, seconds: 4.5 },
};
export const TOTAL_TREASURES = 34;
/** 19 patrolling guards (wardens + lantern keepers) plus 4 Brass Sentinels = 23 observers. */
export const TOTAL_GUARDS = 23;
export const PALETTE = {
  floor: '#0d2016', floorAlt: '#10281b', marble: '#1a2e22', tileLine: '#1e3a29',
  wall: '#3d5a43', wallTop: '#54755c', hedge: '#1f5c33', hedgeLight: '#2e7d46',
  bed: '#33241a', bedFlower: '#c86a9a', crate: '#7a5a30', crateEdge: '#9a743e',
  lampGlow: 'rgba(255,196,96,0.20)', lampCore: '#ffd98a',
  coneCalm: 'rgba(190,230,255,0.21)', coneSus: 'rgba(255,214,64,0.33)', coneAlarm: 'rgba(255,64,48,0.38)',
  player: '#e8e3d5', playerTrim: '#8a2f3f', treasure: '#ffd94d', orchid: '#e9b8ff',
  text: '#f2ecd9', muted: '#a9bfa9', danger: '#ff5147', ok: '#7fe08a',
  panel: 'rgba(6,14,9,0.88)', hudBar: 'rgba(5,12,8,0.82)',
};
export const FONT = 'Georgia, "Times New Roman", serif';
export const FONT_UI = 'system-ui, "Segoe UI", sans-serif';
export const STATE = { PATROL: 'PATROL', SUSPICIOUS: 'SUSPICIOUS', INVESTIGATE: 'INVESTIGATE', ALARM: 'ALARM' };
/** Campaign ratings, best first. GHOST demands zero alarms and zero strikes across all 5 wings. */
export const RATINGS = { GHOST: 'GHOST', PHANTOM: 'VELVET PHANTOM', SPOTTED: 'SPOTTED CAT' };
export const BARKS = {
  suspicious: ['Hm? A draught…', 'Did something move?', 'Who goes there?'],
  investigate: ['Checking the beds…', 'Over here, I think.', 'Show yourself.'],
  alarm: ['THIEF! Seal the glass!', 'The Orchid! Stop her!', 'ALARM! ALARM!'],
  calm: ['All quiet.', 'Lovely night for a ball.', 'Mind the roses.'],
};
