// The five wings of the Clockwork Conservatory. Rects are [x, y, w, h] in the 1280x720 frame.
// walls block sight and movement; crates block both; hedges block movement only (low cover);
// beds are walkable flower beds (crouch inside them to nearly vanish). Lamps light pools of
// radius 92. Guards patrol waypoint loops. Totals: 5 wings, 19 patrolling guards,
// 4 sentinels (23 observers), 34 treasures.

const W = (x, y, w, h) => [x, y, w, h];
const T = (x, y, kind) => ({ x, y, kind, taken: false });
const G = (type, path, speed = 52) => ({ type, path, speed });
const KINDS = ['gem', 'bulb', 'snuffbox', 'cameo', 'seedpod', 'tiara'];

function plants(seed, n, avoid) {
  // Deterministic decorative plants (fixed LCG, never Math.random): dense set dressing.
  let a = seed;
  const rnd = () => { a = (a * 1103515245 + 12345) & 0x7fffffff; return a / 0x7fffffff; };
  const out = [];
  let guard = 0;
  while (out.length < n && guard++ < 400) {
    const x = 40 + rnd() * 1200, y = 60 + rnd() * 620;
    if (avoid.some((r) => x > r[0] - 18 && x < r[0] + r[2] + 18 && y > r[1] - 18 && y < r[1] + r[3] + 18)) continue;
    out.push([Math.round(x), Math.round(y), 8 + Math.round(rnd() * 10)]);
  }
  return out;
}

function wing(o) {
  o.plants = plants(o.seed, o.plantCount || 26, [...o.walls, ...o.hedges, ...o.beds]);
  o.treasures.forEach((t, i) => { if (!t.kind) t.kind = KINDS[i % KINDS.length]; });
  return o;
}

export const LEVELS = [
  wing({
    name: 'I — Palm Court', sub: 'Cross the fountain court. Learn the cones.',
    seed: 11, start: [70, 620], orchid: [1180, 110], exit: [1210, 640],
    walls: [W(0, 40, 1280, 14), W(0, 706, 1280, 14), W(0, 40, 14, 680), W(1266, 40, 14, 680),
      W(300, 40, 16, 300), W(300, 430, 16, 276), W(640, 150, 16, 330), W(640, 560, 16, 146),
      W(960, 40, 16, 260), W(960, 390, 16, 316), W(420, 300, 220, 16), W(760, 470, 200, 16)],
    crates: [W(180, 200, 44, 44), W(190, 470, 44, 44), W(520, 120, 44, 44), W(840, 250, 44, 44), W(1080, 480, 44, 44), W(520, 580, 44, 44)],
    hedges: [W(90, 300, 150, 30), W(420, 560, 150, 30), W(1020, 180, 160, 30), W(720, 90, 150, 30)],
    beds: [W(360, 130, 200, 64), W(700, 560, 220, 64), W(90, 520, 180, 60), W(1010, 560, 180, 60)],
    lamps: [[160, 140], [470, 380], [800, 160], [1130, 360], [620, 640], [180, 640]],
    fountains: [[470, 470, 46]],
    treasures: [T(240, 120), T(560, 210), T(700, 110), T(880, 420), T(1150, 620), T(120, 430), T(760, 620)],
    guards: [G('warden', [[200, 160], [560, 160], [560, 400], [200, 400]]),
      G('keeper', [[820, 620], [820, 300], [1120, 300], [1120, 620]], 46),
      G('warden', [[1060, 110], [1060, 300], [760, 300], [760, 110]], 58)],
    sentinels: [],
  }),
  wing({
    name: 'II — Orchid House', sub: 'Lantern Keepers carry their light with them.',
    seed: 23, start: [70, 110], orchid: [1180, 620], exit: [1210, 90],
    walls: [W(0, 40, 1280, 14), W(0, 706, 1280, 14), W(0, 40, 14, 680), W(1266, 40, 14, 680),
      W(260, 200, 16, 340), W(520, 40, 16, 300), W(520, 430, 16, 276), W(800, 180, 16, 360),
      W(1040, 40, 16, 280), W(1040, 410, 16, 296), W(276, 360, 244, 16), W(816, 340, 224, 16), W(120, 520, 140, 16)],
    crates: [W(140, 300, 44, 44), W(380, 110, 44, 44), W(660, 250, 44, 44), W(920, 560, 44, 44), W(1140, 250, 44, 44), W(380, 580, 44, 44), W(660, 560, 44, 44)],
    hedges: [W(90, 200, 140, 30), W(560, 120, 180, 30), W(860, 90, 150, 30), W(560, 620, 180, 30), W(1080, 470, 140, 30)],
    beds: [W(300, 440, 200, 64), W(580, 380, 200, 64), W(860, 200, 170, 64), W(90, 580, 200, 64), W(1000, 560, 200, 64)],
    lamps: [[150, 420], [420, 240], [700, 90], [930, 420], [1180, 160], [420, 640]],
    fountains: [[660, 640, 38]],
    treasures: [T(180, 90), T(430, 420), T(700, 300), T(900, 120), T(1180, 420), T(240, 640), T(960, 660)],
    guards: [G('keeper', [[150, 620], [150, 200], [430, 200], [430, 620]], 46),
      G('warden', [[620, 140], [980, 140], [980, 460], [620, 460]]),
      G('keeper', [[1120, 620], [1120, 200], [880, 200], [880, 620]], 48),
      G('warden', [[340, 90], [340, 300], [120, 300], [120, 90]], 56)],
    sentinels: [],
  }),
  wing({
    name: 'III — Rose Maze Wing', sub: 'A hedge maze. A Brass Sentinel sweeps the centre.',
    seed: 37, start: [70, 640], orchid: [640, 110], exit: [1210, 640],
    walls: [W(0, 40, 1280, 14), W(0, 706, 1280, 14), W(0, 40, 14, 680), W(1266, 40, 14, 680),
      W(580, 40, 16, 120), W(700, 40, 16, 120), W(400, 560, 480, 16)],
    crates: [W(200, 200, 44, 44), W(1040, 200, 44, 44), W(200, 520, 44, 44), W(1040, 520, 44, 44)],
    hedges: [W(120, 140, 420, 34), W(740, 140, 420, 34), W(120, 300, 300, 34), W(560, 300, 160, 34), W(860, 300, 300, 34),
      W(120, 460, 420, 34), W(740, 460, 420, 34), W(300, 600, 240, 34), W(740, 600, 240, 34),
      W(440, 174, 34, 126), W(806, 174, 34, 126), W(440, 334, 34, 126), W(806, 334, 34, 126)],
    beds: [W(160, 220, 220, 56), W(900, 220, 220, 56), W(480, 380, 320, 56), W(160, 540, 220, 56), W(900, 540, 220, 56)],
    lamps: [[90, 90], [1190, 90], [640, 380], [90, 660], [1190, 660], [330, 380]],
    fountains: [[640, 640, 40]],
    treasures: [T(640, 200), T(150, 380), T(1130, 380), T(300, 90), T(980, 90), T(640, 540)],
    guards: [G('warden', [[180, 250], [620, 250], [620, 90], [180, 90]], 60),
      G('warden', [[1100, 250], [660, 250], [660, 90], [1100, 90]], 60),
      G('keeper', [[180, 660], [180, 420], [620, 420], [620, 660]], 47),
      G('warden', [[1100, 660], [1100, 420], [660, 420], [660, 660]], 55)],
    sentinels: [{ x: 640, y: 250, base: 0.4, sweep: 1.1, range: 300 }],
  }),
  wing({
    name: 'IV — Flooded Grotto', sub: 'Dark water halls. Snuff the lamps and swim the shadows.',
    seed: 49, start: [70, 360], orchid: [1180, 360], exit: [1210, 110],
    walls: [W(0, 40, 1280, 14), W(0, 706, 1280, 14), W(0, 40, 14, 680), W(1266, 40, 14, 680),
      W(320, 40, 16, 240), W(320, 370, 16, 336), W(620, 180, 16, 380), W(920, 40, 16, 240), W(920, 370, 16, 336),
      W(336, 280, 284, 16), W(636, 120, 284, 16), W(336, 560, 284, 16), W(636, 620, 284, 16)],
    crates: [W(160, 160, 44, 44), W(460, 420, 44, 44), W(760, 220, 44, 44), W(1060, 520, 44, 44), W(160, 560, 44, 44), W(760, 560, 44, 44)],
    hedges: [W(90, 260, 170, 30), W(400, 90, 170, 30), W(700, 420, 170, 30), W(1010, 160, 170, 30)],
    beds: [W(380, 620, 200, 60), W(960, 580, 200, 60), W(90, 420, 180, 60), W(680, 90, 200, 60)],
    lamps: [[180, 110], [480, 330], [800, 480], [1120, 200], [480, 660], [1120, 620]],
    fountains: [[480, 150, 42], [800, 640, 42]],
    treasures: [T(240, 640), T(540, 200), T(840, 330), T(1140, 90), T(120, 200), T(1020, 420)],
    guards: [G('keeper', [[160, 620], [160, 120], [520, 120], [520, 620]], 45),
      G('warden', [[740, 620], [740, 240], [1140, 240], [1140, 620]], 54),
      G('keeper', [[1140, 120], [700, 120], [700, 330], [1140, 330]], 47)],
    sentinels: [{ x: 470, y: 470, base: 2.4, sweep: 0.9, range: 280 }],
  }),
  wing({
    name: 'V — The Glass Vault', sub: 'The Moon Orchid itself. Five wardens, two Sentinels, one hour left.',
    seed: 61, start: [70, 640], orchid: [640, 120], exit: [1210, 640],
    walls: [W(0, 40, 1280, 14), W(0, 706, 1280, 14), W(0, 40, 14, 680), W(1266, 40, 14, 680),
      W(240, 200, 16, 320), W(1024, 200, 16, 320), W(480, 40, 16, 200), W(784, 40, 16, 200),
      W(480, 470, 16, 236), W(784, 470, 16, 236), W(256, 340, 224, 16), W(800, 340, 224, 16),
      W(560, 200, 160, 16), W(560, 560, 160, 16)],
    crates: [W(130, 110, 44, 44), W(1100, 110, 44, 44), W(340, 560, 44, 44), W(900, 560, 44, 44), W(600, 380, 44, 44), W(340, 120, 44, 44), W(900, 120, 44, 44)],
    hedges: [W(90, 420, 130, 30), W(1060, 420, 130, 30), W(520, 640, 240, 30), W(520, 80, 240, 30)],
    beds: [W(280, 420, 180, 64), W(820, 420, 180, 64), W(90, 560, 180, 64), W(1010, 560, 180, 64), W(540, 250, 200, 64)],
    lamps: [[120, 200], [1160, 200], [640, 420], [330, 640], [950, 640], [640, 70]],
    fountains: [[150, 640, 36], [1130, 640, 36]],
    treasures: [T(150, 300), T(1130, 300), T(400, 200), T(880, 200), T(640, 660), T(90, 90), T(1190, 90), T(400, 620)],
    guards: [G('warden', [[140, 160], [440, 160], [440, 620], [140, 620]], 58),
      G('warden', [[1140, 160], [840, 160], [840, 620], [1140, 620]], 58),
      G('keeper', [[520, 620], [520, 300], [760, 300], [760, 620]], 48),
      G('warden', [[300, 380], [640, 380], [980, 380]], 64),
      G('keeper', [[980, 90], [300, 90], [300, 240], [980, 240]], 50)],
    sentinels: [{ x: 380, y: 250, base: 0.9, sweep: 1.2, range: 290 }, { x: 900, y: 480, base: 2.8, sweep: 1.2, range: 290 }],
  }),
];
export const LEVEL_COUNT = LEVELS.length;
export const WING_NAMES = LEVELS.map((l) => l.name);
export const SENTINEL_TOTAL = LEVELS.reduce((n, l) => n + l.sentinels.length, 0);
export const GUARD_TOTAL = LEVELS.reduce((n, l) => n + l.guards.length + l.sentinels.length, 0);
export const TREASURE_TOTAL = LEVELS.reduce((n, l) => n + l.treasures.length, 0);
