/* ===================== audio: everything is synthesized with Web Audio ===================== */
const AUD = { ctx: null, master: null, fx: null, amb: null, mus: null, noise: null, voices: 0, last: {}, mode: 0, wind: null, rain: null, cricket: null, droneG: null, nextBird: 3, mTime: 0, mStep: 0, mi: 2 };
const SND_LABEL = ['On', 'Effects only', 'Off'];

function audioInit() {
  if (AUD.ctx) { if (AUD.ctx.state === 'suspended') AUD.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  let c;
  try { c = new AC(); } catch (e) { return; }
  AUD.ctx = c;
  const comp = c.createDynamicsCompressor(); comp.connect(c.destination);
  AUD.master = c.createGain(); AUD.master.connect(comp);
  AUD.fx = c.createGain(); AUD.fx.gain.value = 0.9; AUD.fx.connect(AUD.master);
  AUD.amb = c.createGain(); AUD.amb.connect(AUD.master);
  AUD.mus = c.createGain(); AUD.mus.connect(AUD.master);
  const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  AUD.noise = buf;
  const loop = (type, f, q) => {
    const s = c.createBufferSource(); s.buffer = buf; s.loop = true;
    const flt = c.createBiquadFilter(); flt.type = type; flt.frequency.value = f; flt.Q.value = q;
    const g = c.createGain(); g.gain.value = 0;
    s.connect(flt); flt.connect(g); g.connect(AUD.amb); s.start();
    return { g, flt };
  };
  AUD.wind = loop('lowpass', 420, 0.4);
  AUD.rain = loop('highpass', 1600, 0.5);
  // crickets: a high tone chopped by a fast LFO
  const car = c.createOscillator(); car.frequency.value = 4300;
  const am = c.createGain(); am.gain.value = 0.5;
  const lfo = c.createOscillator(); lfo.frequency.value = 7;
  const lg = c.createGain(); lg.gain.value = 0.5;
  lfo.connect(lg); lg.connect(am.gain); car.connect(am);
  AUD.cricket = c.createGain(); AUD.cricket.gain.value = 0;
  am.connect(AUD.cricket); AUD.cricket.connect(AUD.amb);
  car.start(); lfo.start();
  // a soft drone under the music
  AUD.droneG = c.createGain(); AUD.droneG.gain.value = 0; AUD.droneG.connect(AUD.mus);
  [73.42, 110].forEach(f => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(AUD.droneG); o.start(); });
  applyAudioMode();
}
function applyAudioMode() {
  if (!AUD.ctx) return;
  const t = AUD.ctx.currentTime;
  AUD.master.gain.setTargetAtTime(AUD.mode === 2 ? 0 : 0.8, t, 0.05);
  AUD.mus.gain.setTargetAtTime(AUD.mode === 0 ? 0.5 : 0, t, 0.1);
}
function refreshSoundButton() { document.getElementById('btnSound').textContent = 'Sound: ' + SND_LABEL[AUD.mode]; }
document.getElementById('btnSound').addEventListener('click', () => {
  audioInit();
  AUD.mode = (AUD.mode + 1) % 3;
  applyAudioMode(); refreshSoundButton(); sfx('click');
});
window.addEventListener('pointerdown', audioInit);
window.addEventListener('keydown', audioInit);
refreshSoundButton();

/* ---- voices ---- */
function mkOut(vol, pan) {
  const c = AUD.ctx, g = c.createGain();
  g.gain.value = vol;
  let last = g;
  if (c.createStereoPanner && pan) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); last = p; }
  last.connect(AUD.fx);
  return g;
}
function tone(out, f, dur, type, vol, when, slide) {
  const c = AUD.ctx;
  if (AUD.voices > 30) return;
  const t = c.currentTime + (when || 0), o = c.createOscillator(), g = c.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  AUD.voices++; o.onended = () => { AUD.voices--; };
}
function noise(out, dur, vol, type, f0, f1, q, when, attack) {
  const c = AUD.ctx;
  if (AUD.voices > 30) return;
  const t = c.currentTime + (when || 0), s = c.createBufferSource(), flt = c.createBiquadFilter(), g = c.createGain();
  s.buffer = AUD.noise;
  flt.type = type || 'lowpass'; flt.Q.value = q || 1;
  flt.frequency.setValueAtTime(f0, t);
  if (f1) flt.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + (attack || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(flt); flt.connect(g); g.connect(out);
  s.start(t, Math.random() * 1.4, dur + 0.05);
  AUD.voices++; s.onended = () => { AUD.voices--; };
}
const NOTE = { C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, C6: 1046.5, A4: 440, F5: 698.46, E4: 329.63, A3: 220 };
const SFX = {
  click: o => tone(o, 660, 0.05, 'square', 0.06),
  error: o => tone(o, 150, 0.2, 'sawtooth', 0.12, 0, 100),
  place: o => { noise(o, 0.12, 0.35, 'lowpass', 500, 200); tone(o, 110, 0.12, 'square', 0.1, 0, 70); },
  done: o => { tone(o, NOTE.C5, 0.2, 'triangle', 0.16); tone(o, NOTE.G5, 0.32, 'triangle', 0.16, 0.09); },
  hammer: o => { tone(o, 420, 0.05, 'square', 0.05, 0, 250); noise(o, 0.04, 0.12, 'bandpass', 1800, 0, 2); },
  chop: o => noise(o, 0.06, 0.16, 'bandpass', 900, 500, 2),
  clink: o => tone(o, 1500, 0.05, 'square', 0.04, 0, 1100),
  coin: o => { tone(o, 1320, 0.12, 'sine', 0.06); tone(o, 1760, 0.18, 'sine', 0.06, 0.06); },
  spawn: o => tone(o, 600, 0.12, 'sine', 0.09, 0, 980),
  arrow: o => noise(o, 0.15, 0.2, 'bandpass', 2400, 900, 2),
  bolt: o => { tone(o, 190, 0.25, 'sawtooth', 0.12, 0, 80); noise(o, 0.12, 0.16, 'bandpass', 1500, 600, 2); },
  ball: o => { tone(o, 110, 0.55, 'sine', 0.5, 0, 34); noise(o, 0.45, 0.5, 'lowpass', 900, 120); },
  orbital: o => { noise(o, 0.5, 0.5, 'lowpass', 900, 200); tone(o, 70, 0.5, 'sawtooth', 0.25, 0, 30); },
  quantum: o => { tone(o, 980, 0.18, 'triangle', 0.08, 0, 1600); tone(o, 1400, 0.12, 'sine', 0.05, 0.04, 2200); },
  laser: o => { tone(o, 1400, 0.14, 'sine', 0.07, 0, 300); tone(o, 2200, 0.1, 'triangle', 0.04, 0.02, 500); },
  bullet: o => { noise(o, 0.1, 0.4, 'highpass', 1800, 0); tone(o, 900, 0.08, 'square', 0.08, 0, 200); },
  stone: o => tone(o, 300, 0.1, 'triangle', 0.1, 0, 150),
  hit: o => { noise(o, 0.08, 0.28, 'lowpass', 700, 200); tone(o, 140, 0.08, 'square', 0.08); },
  bash: o => { noise(o, 0.14, 0.35, 'lowpass', 420, 120); tone(o, 80, 0.15, 'square', 0.18); },
  die: o => tone(o, 320, 0.3, 'sawtooth', 0.1, 0, 80),
  dieFriend: o => tone(o, 540, 0.35, 'triangle', 0.12, 0, 200),
  crumble: o => { noise(o, 0.8, 0.45, 'lowpass', 520, 70); tone(o, 60, 0.5, 'sine', 0.35); },
  horn: o => { tone(o, 98, 1.1, 'sawtooth', 0.2); tone(o, 147, 1.1, 'sawtooth', 0.12); tone(o, 98, 1.4, 'sawtooth', 0.22, 1.25); tone(o, 147, 1.4, 'sawtooth', 0.12, 1.25); },
  howl: o => { tone(o, 380, 1.0, 'sine', 0.1, 0.5, 720); tone(o, 720, 0.9, 'sine', 0.08, 1.4, 420); },
  age: o => { [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => tone(o, f, 0.4, 'triangle', 0.16, i * 0.13)); tone(o, NOTE.C6, 0.9, 'sine', 0.1, 0.55); },
  level: o => { tone(o, NOTE.E5, 0.14, 'triangle', 0.14); tone(o, NOTE.G5, 0.14, 'triangle', 0.14, 0.09); tone(o, NOTE.C6, 0.3, 'triangle', 0.14, 0.18); },
  ability: o => { noise(o, 0.35, 0.3, 'bandpass', 500, 2400, 3); tone(o, 330, 0.3, 'sawtooth', 0.1, 0, 660); },
  heal: o => { tone(o, 880, 0.2, 'sine', 0.05); tone(o, 1175, 0.25, 'sine', 0.05, 0.08); },
  crack: o => noise(o, 0.18, 0.7, 'highpass', 2200, 400),
  thunder: o => noise(o, 3, 0.8, 'lowpass', 340, 50, 1, 0, 0.25),
  win: o => { [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6, NOTE.G5, NOTE.C6].forEach((f, i) => tone(o, f, 0.5, 'triangle', 0.16, i * 0.16)); },
  lose: o => { [NOTE.A4, NOTE.F5 / 1.26, NOTE.E4, NOTE.A3].forEach((f, i) => tone(o, f, 0.7, 'sawtooth', 0.1, i * 0.3, f * 0.9)); }
};
const SFX_GAP = { arrow: 0.06, hit: 0.05, bash: 0.08, coin: 0.25, chop: 0.14, clink: 0.14, hammer: 0.18, die: 0.05, dieFriend: 0.1, bolt: 0.1, stone: 0.08, bullet: 0.06, laser: 0.05, orbital: 0.3, quantum: 0.05, place: 0.05, spawn: 0.1, click: 0.03, done: 0.1, heal: 0.6, ability: 0.1 };
function sfx(name, x, z) {
  const c = AUD.ctx;
  if (!c || AUD.mode === 2 || !SFX[name]) return;
  const now = c.currentTime;
  if (AUD.last[name] !== undefined && now - AUD.last[name] < (SFX_GAP[name] || 0.02)) return;
  AUD.last[name] = now;
  let vol = 1, pan = 0;
  if (x !== undefined) {
    const dx = x - cam.tx, dz = z - cam.tz;
    vol = clamp(1 - Math.hypot(dx, dz) / 45, 0.12, 1);
    pan = clamp((dx * Math.cos(cam.yaw) - dz * Math.sin(cam.yaw)) / 22, -1, 1);
  }
  SFX[name](mkOut(vol, pan));
}
function birdChirp() {
  const c = AUD.ctx;
  if (!c || AUD.mode === 2) return;
  const o = mkOut(0.5, rnd(-0.8, 0.8)), base = rnd(2000, 3200), n = rint(2, 4);
  for (let i = 0; i < n; i++) tone(o, base, 0.07, 'sine', 0.035, i * 0.09, base * rnd(1.15, 1.5));
}

/* ---- gentle generative music: lute-like plucks, drums during raids ---- */
const SC_DAY = [293.66, 329.63, 369.99, 440, 493.88, 587.33, 659.25];
const SC_NIGHT = [220, 261.63, 293.66, 349.23, 440, 523.25];
const SC_WAR = [146.83, 174.61, 220, 261.63, 293.66, 349.23];
function pluck(f, when, vol, dur) {
  const c = AUD.ctx, t = c.currentTime + when, o = c.createOscillator(), g = c.createGain(), flt = c.createBiquadFilter();
  o.type = 'triangle'; o.frequency.value = f; flt.type = 'lowpass'; flt.frequency.value = Math.min(5000, f * 5);
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(flt); flt.connect(g); g.connect(AUD.mus); o.start(t); o.stop(t + dur + 0.05);
}
function drum(when, vol) {
  const c = AUD.ctx, t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(38, t + 0.25);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.connect(g); g.connect(AUD.mus); o.start(t); o.stop(t + 0.35);
}
function musicTick() {
  const c = AUD.ctx;
  if (AUD.mode !== 0 || G.paused || G.over) { AUD.mTime = Math.max(AUD.mTime, c.currentTime); return; }
  const raid = enemies.some(e => !e.dead), n = ENV.night, bpm = raid ? 104 : n > 0.5 ? 60 : 72, stepLen = 60 / bpm / 2;
  if (AUD.mTime < c.currentTime) AUD.mTime = c.currentTime + 0.05;
  const sc = raid ? SC_WAR : n > 0.5 ? SC_NIGHT : SC_DAY, p = raid ? 0.62 : n > 0.5 ? 0.28 : 0.45;
  while (AUD.mTime < c.currentTime + 0.6) {
    const s = AUD.mStep++, when = AUD.mTime - c.currentTime;
    if (Math.random() < p) { AUD.mi = clamp(AUD.mi + rint(-2, 2), 0, sc.length - 1); pluck(sc[AUD.mi], when, 0.07, raid ? 0.35 : 0.7); }
    if (s % 8 === 0) pluck(sc[0] / 2, when, 0.06, 1.4);
    if (raid && s % 4 === 0) drum(when, s % 8 === 0 ? 0.5 : 0.3);
    AUD.mTime += stepLen;
  }
  AUD.droneG.gain.setTargetAtTime(raid ? 0.035 : 0.018 + 0.015 * n, c.currentTime, 1);
}

/* ---- ambient beds follow the weather and time of day ---- */
function audioUpdate(dt) {
  const c = AUD.ctx;
  if (!c || AUD.mode === 2) return;
  const t = c.currentTime, w = ENV.w, n = ENV.night;
  AUD.wind.g.gain.setTargetAtTime(0.025 + 0.1 * ENV.wind + 0.12 * w.storm, t, 0.5);
  AUD.wind.flt.frequency.setTargetAtTime(300 + ENV.wind * 600, t, 0.5);
  AUD.rain.g.gain.setTargetAtTime(0.16 * w.rain, t, 0.5);
  AUD.cricket.gain.setTargetAtTime(0.012 * n * (1 - w.rain) * (1 - w.snow), t, 1);
  AUD.nextBird -= dt;
  if (AUD.nextBird <= 0) { AUD.nextBird = rnd(2.5, 7); if (n < 0.4 && w.rain < 0.2 && w.storm < 0.2 && !G.paused && Math.random() > ENV.sw[3] * 0.85) birdChirp(); }
  musicTick();
}
