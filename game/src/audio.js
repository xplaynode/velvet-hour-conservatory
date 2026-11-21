// Tiny WebAudio blips (coin chime, snuff hiss, alarm sting). Fully guarded: silence on any failure,
// and never created in shot mode so screenshots stay deterministic and error-free.
let ctx = null;
export function createAudio(enabled) {
  function tone(freq, dur, type = 'sine', gain = 0.05, when = 0) {
    if (!enabled) return;
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime + when);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + when + dur);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + when); o.stop(ctx.currentTime + when + dur);
    } catch { /* audio is decoration only */ }
  }
  return {
    coin() { tone(1320, 0.12, 'triangle', 0.06); tone(1760, 0.16, 'triangle', 0.05, 0.07); },
    pickup() { tone(880, 0.1, 'sine', 0.05); tone(1174, 0.14, 'sine', 0.05, 0.06); },
    orchid() { [660, 880, 1108, 1318].forEach((f, i) => tone(f, 0.22, 'sine', 0.05, i * 0.09)); },
    snuff() { tone(220, 0.3, 'sawtooth', 0.02); },
    perfume() { tone(1560, 0.35, 'sine', 0.03); },
    alarm() { tone(392, 0.16, 'square', 0.05); tone(392, 0.16, 'square', 0.05, 0.2); },
    caught() { [440, 349, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.06, i * 0.13)); },
    win() { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.3, 'sine', 0.05, i * 0.11)); },
    clear() { tone(784, 0.18, 'triangle', 0.05); tone(1046, 0.24, 'triangle', 0.05, 0.1); },
    step(noise) { if (noise > 0.6) tone(90, 0.05, 'sine', 0.012); },
  };
}
