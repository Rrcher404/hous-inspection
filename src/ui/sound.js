// Tiny WebAudio blips. No audio files. Quiet by design: a ride-along, not an arcade.

export function createSound(store) {
  let ctx = null;
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      try { ctx = new C(); } catch { return null; }
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur, { type = 'sine', gain = 0.045, delay = 0, to } = {}) {
    const a = ac();
    if (!a) return;
    const t0 = a.currentTime + delay;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  const SFX = {
    click: () => tone(720, 0.05, { type: 'triangle', gain: 0.025 }),
    select: () => tone(560, 0.06, { type: 'triangle', gain: 0.03 }),
    correct: () => { tone(660, 0.12, { gain: 0.04 }); tone(990, 0.18, { gain: 0.035, delay: 0.09 }); },
    near: () => { tone(620, 0.12, { gain: 0.035 }); tone(740, 0.16, { gain: 0.03, delay: 0.1 }); },
    wrong: () => tone(300, 0.22, { type: 'sine', gain: 0.04, to: 210 }),
    xp: () => tone(1180, 0.07, { type: 'triangle', gain: 0.02 }),
    rank: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.28, { gain: 0.035, delay: i * 0.11 })),
    zone: () => tone(440, 0.25, { type: 'sine', gain: 0.02, to: 520 }),
    tool: () => tone(880, 0.04, { type: 'square', gain: 0.012 }),
  };

  return {
    play(name) {
      if (!store.settings?.sound) return;
      try { SFX[name]?.(); } catch { /* audio is a nicety */ }
    },
    unlock() { if (store.settings?.sound) ac(); },
  };
}
