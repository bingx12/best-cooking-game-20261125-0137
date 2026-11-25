// Sizzle & Serve — every sound is synthesized with WebAudio; no audio files.
// One job: short, punchy effects for chopping, sizzling, serving and mistakes.

let ctx = null;
let muted = false;

function audioContext() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  } catch {
    return null;
  }
  return ctx;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

// Resume on the first user gesture; browsers block audio before one.
export function unlockAudio() {
  const ac = audioContext();
  if (ac && ac.state === 'suspended') ac.resume().catch(() => {});
}

function tone(freq, dur, type, vol, slideTo) {
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    gain.gain.setValueAtTime(vol, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur);
  } catch {
    // Headless or locked audio: the game plays on silently.
  }
}

function noiseBurst(dur, vol, lowpass) {
  if (muted) return;
  const ac = audioContext();
  if (!ac) return;
  try {
    const len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ac.createBufferSource();
    src.buffer = buf;
    const filter = ac.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass;
    const gain = ac.createGain();
    gain.gain.value = vol;
    src.connect(filter).connect(gain).connect(ac.destination);
    src.start();
  } catch {
    // Silent fallback.
  }
}

export const sfx = {
  pickup() { tone(520, 0.07, 'triangle', 0.12, 760); },
  place() { tone(330, 0.08, 'triangle', 0.14, 240); },
  chop() { noiseBurst(0.06, 0.22, 1800); tone(180, 0.05, 'square', 0.08, 120); },
  sizzleStart() { noiseBurst(0.35, 0.10, 5200); },
  sizzleLoop() { noiseBurst(0.18, 0.05, 4200); },
  ding() { tone(880, 0.16, 'sine', 0.16); tone(1318, 0.22, 'sine', 0.12); },
  serve() { tone(660, 0.09, 'triangle', 0.14, 990); tone(990, 0.14, 'triangle', 0.12, 1320); },
  error() { tone(160, 0.18, 'sawtooth', 0.10, 110); },
  tick() { tone(980, 0.04, 'square', 0.05); },
  gameOver() { tone(392, 0.25, 'triangle', 0.14, 330); tone(330, 0.3, 'triangle', 0.14, 262); tone(262, 0.5, 'triangle', 0.14, 196); },
  start() { tone(523, 0.1, 'triangle', 0.14); tone(659, 0.1, 'triangle', 0.14); tone(784, 0.18, 'triangle', 0.14); },
};
