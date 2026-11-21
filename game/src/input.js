// Keyboard input: held movement keys plus one-shot action flags consumed once by the loop.
export const ACT = { CONFIRM: 1, PAUSE: 2, RETRY: 4, COIN: 8, SNUFF: 16, PERFUME: 32, CROUCH: 64, LEVEL: 128 };
const HELD = new Map();
const ACTIONS = new Map([
  ['Space', ACT.CONFIRM], ['Enter', ACT.CONFIRM],
  ['KeyP', ACT.PAUSE], ['Escape', ACT.PAUSE], ['KeyR', ACT.RETRY],
  ['KeyQ', ACT.COIN], ['KeyE', ACT.SNUFF], ['KeyF', ACT.PERFUME],
]);
export function createInput() {
  let actions = 0;
  let levelPick = -1;
  window.addEventListener('keydown', (e) => {
    HELD.set(e.code, true);
    if (ACTIONS.has(e.code) && !e.repeat) actions |= ACTIONS.get(e.code);
    if (['KeyC', 'ControlLeft'].includes(e.code)) actions |= ACT.CROUCH;
    if (/^Digit[1-5]$/.test(e.code)) { levelPick = Number(e.code.slice(5)) - 1; actions |= ACT.LEVEL; }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => HELD.set(e.code, false));
  window.addEventListener('blur', () => HELD.clear());
  const down = (...codes) => codes.some((c) => HELD.get(c));
  return {
    axis() {
      const x = (down('ArrowRight', 'KeyD') ? 1 : 0) - (down('ArrowLeft', 'KeyA') ? 1 : 0);
      const y = (down('ArrowDown', 'KeyS') ? 1 : 0) - (down('ArrowUp', 'KeyW') ? 1 : 0);
      return { x, y };
    },
    sprint() { return down('ShiftLeft', 'ShiftRight'); },
    crouchHeld() { return down('KeyC', 'ControlLeft'); },
    takeActions() { const a = actions; actions = 0; return a; },
    /** Read the queued one-shot flags without consuming them (menu screens peek before deciding). */
    peekActions() { return actions; },
    takeLevelPick() { const v = levelPick; levelPick = -1; return v; },
  };
}
