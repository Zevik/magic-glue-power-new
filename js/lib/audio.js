// All the sounds are synthesised with Web Audio: no files to download, nothing to load.
// Browsers only allow audio after a tap, so the context is created on the first gesture.

const KEY = 'dabkesem.sound';
let ctx = null;
let master = null;
let enabled = true;
try { enabled = localStorage.getItem(KEY) !== 'off'; } catch { /* storage blocked */ }

const listeners = new Set();

function ensure() {
    if (!enabled) return null;
    if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.55;
        const comp = ctx.createDynamicsCompressor();
        master.connect(comp);
        comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

export function unlockAudio() { ensure(); }
export const isSoundOn = () => enabled;
export function onSoundChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

export function setSound(on) {
    enabled = on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch { /* storage blocked */ }
    if (on) { ensure(); sfx.tap(); }
    listeners.forEach(fn => fn(on));
}

// one note with an envelope; the building block of everything below
function tone({ freq = 440, to = null, dur = 0.2, type = 'sine', vol = 0.3, delay = 0, attack = 0.005, curve = 'exp' }) {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency[curve === 'exp' ? 'exponentialRampToValueAtTime' : 'linearRampToValueAtTime'](to, t0 + dur);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.3, vol = 0.2, from = 800, to = 800, q = 1, delay = 0, type = 'bandpass' }) {
    const c = ensure();
    if (!c) return;
    const t0 = c.currentTime + delay;
    const buffer = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * dur)), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const filter = c.createBiquadFilter();
    filter.type = type;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t0);
    filter.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + Math.min(0.02, dur / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(t0);
}

let lastTick = 0;
const pent = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.5];

export const sfx = {
    tap() { tone({ freq: 620, to: 420, dur: 0.09, type: 'triangle', vol: 0.22 }); },
    nav() { tone({ freq: 330, to: 660, dur: 0.18, type: 'sine', vol: 0.16 }); noise({ dur: 0.22, vol: 0.05, from: 500, to: 2500, q: 0.7 }); },
    pop() { tone({ freq: 700, to: 180, dur: 0.12, type: 'sine', vol: 0.3 }); },
    thud() { tone({ freq: 140, to: 45, dur: 0.22, type: 'sine', vol: 0.5 }); noise({ dur: 0.08, vol: 0.12, from: 400, to: 100, q: 0.8 }); },
    // marbles clicking together: pass a number to pick a note from a pentatonic scale
    click(i = Math.floor(Math.random() * pent.length)) {
        const now = performance.now();
        if (now - lastTick < 45) return; // many collisions in a frame should not become a buzz
        lastTick = now;
        tone({ freq: pent[i % pent.length] * 2, dur: 0.12, type: 'sine', vol: 0.07 });
    },
    snap() { tone({ freq: 900, to: 300, dur: 0.07, type: 'square', vol: 0.12 }); tone({ freq: 1500, dur: 0.05, type: 'sine', vol: 0.14, delay: 0.01 }); },
    whoosh() { noise({ dur: 0.45, vol: 0.14, from: 300, to: 3000, q: 0.9 }); },
    // the dive into the microscope: a tone that keeps climbing
    rise(dur = 3.2) {
        tone({ freq: 90, to: 1400, dur, type: 'sawtooth', vol: 0.05, curve: 'exp', attack: 0.3 });
        tone({ freq: 180, to: 2800, dur, type: 'sine', vol: 0.08, curve: 'exp', attack: 0.3 });
        noise({ dur, vol: 0.05, from: 200, to: 5000, q: 1.2 });
    },
    arrive() { [0, 4, 7, 12].forEach((s, i) => tone({ freq: 392 * Math.pow(2, s / 12), dur: 0.5, vol: 0.12, delay: i * 0.07 })); },
    chime() { [0, 2, 4].forEach((n, i) => tone({ freq: pent[n + 2], dur: 0.55, type: 'sine', vol: 0.16, delay: i * 0.09 })); },
    success() { [0, 2, 4, 7].forEach((n, i) => tone({ freq: pent[n], dur: 0.7, type: 'triangle', vol: 0.15, delay: i * 0.1 })); },
    boom() { tone({ freq: 90, to: 30, dur: 0.6, type: 'sine', vol: 0.6 }); noise({ dur: 0.5, vol: 0.3, from: 1800, to: 120, q: 0.6, type: 'lowpass' }); },
    sizzle() { noise({ dur: 0.9, vol: 0.1, from: 5000, to: 2500, q: 0.8, type: 'highpass' }); },
    // an elastic band stretching: pitch follows how far (0..1) it is pulled
    stretch(amount) { tone({ freq: 160 + amount * 520, dur: 0.06, type: 'triangle', vol: 0.05 }); },
    ping(i = 0) { tone({ freq: pent[(i + 3) % pent.length] * 2, to: pent[(i + 3) % pent.length] * 2.02, dur: 0.35, type: 'sine', vol: 0.1 }); },
    reveal() { tone({ freq: 440, to: 880, dur: 0.14, type: 'triangle', vol: 0.14 }); tone({ freq: 660, to: 1320, dur: 0.18, type: 'sine', vol: 0.1, delay: 0.05 }); }
};

// Browsers start audio only after a gesture
['pointerdown', 'keydown', 'touchstart'].forEach(name => window.addEventListener(name, unlockAudio, { once: true, passive: true }));
