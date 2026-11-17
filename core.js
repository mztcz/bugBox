const GAME_VERSION = "75.24";
const {PI,random,max,min,hypot,sin,cos,atan2,round,abs,sign,pow,floor}=Math;
const TAU=2*PI, HALF_PI=PI/2;
const $ = id => document.getElementById(id);
function pathPts(g, n, fn) { for (let i = 0; i < n; i++) { const [x, y] = fn(i); i ? g.lineTo(x, y) : g.moveTo(x, y) } }
const SK = ["con", "str", "agi", "per", "arm"];
// volumes 0–1: sfx = Sound, mus = Music; mv = music variant (0 A, 1 B)
const sound = { sfx: .8, mus: .4, mv: 0, ctx: null };
function actx() { return sound.ctx || (sound.ctx = new(window.AudioContext || window.webkitAudioContext)) }
// one tone; with dest (music gain node) it ignores the Sound volume, at = start time
function beep(freq, dur, type, vol, slide, at, dest) {
if (!dest && !sound.sfx) return;
const c = actx(), t = at || c.currentTime, o = c.createOscillator(), g = c.createGain();
o.type = type || "square", o.frequency.setValueAtTime(freq, t);
slide && o.frequency.exponentialRampToValueAtTime(max(20, slide), t + dur);
g.gain.setValueAtTime((vol || .15) * (dest ? 1 : sound.sfx), t), g.gain.exponentialRampToValueAtTime(.001, t + dur);
o.connect(g), g.connect(dest || c.destination), o.start(t), o.stop(t + dur)
}
const ABIL_SND = { con: [180, .12, "triangle", .16, 110], str: [130, .1, "square", .1, 70], agi: [900, .07, "sine", .1, 1700], per: [1400, .09, "sine", .08, 1e3], arm: [520, .11, "triangle", .12, 780] }, abilSndT = {};
const SFX = {
bite(t) { beep(t ? 250 : 220, .09, "square", .12, 90) },
hatch() { beep(300, .12, "sine", .14, 620); setTimeout(() => beep(500, .16, "sine", .14, 880), 110) },
win() {[523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, .18, "triangle", .16), 120 * i)) },
lose() { beep(440, .6, "triangle", .16, 110) },
feed() { beep(660, .07, "sine", .1, 990) },
land() { beep(140, .06, "triangle", .14, 60) },
buy() { beep(990, .06, "square", .07); setTimeout(() => beep(1320, .12, "square", .07), 70) },
mate() { beep(600, .2, "sine", .1, 760); setTimeout(() => beep(700, .25, "sine", .1, 900), 180) },
die() { beep(400, .35, "sawtooth", .08, 80) },
lock() { beep(110, .12, "square", .1) },
// active ability of one stat; one sound per stat per 0.3 s
abil(s) { const t = performance.now(); t - (abilSndT[s] || 0) > 300 && (abilSndT[s] = t, beep(...ABIL_SND[s])) }
};
// music loops [bpm, base Hz, lead wave, 4 chords (semitones), 8-step arpeggio (chord tone index, 3+ = octave up, -1 rest), fight beat]:
// peaceful A, peaceful B, fight A, fight B; one step = 1/8 note
const MUSIC = [
[72, 262, "sine", [[0, 4, 7], [-3, 0, 4], [-7, -3, 0], [-5, -1, 2]], [0, 1, 2, 3, 2, 1, 0, 1], 0],
[60, 220, "triangle", [[0, 3, 7], [-4, 0, 3], [3, 7, 10], [-2, 2, 5]], [0, 2, 1, 3, 1, 2, 0, -1], 0],
[140, 220, "sawtooth", [[0, 3, 7], [-4, 0, 3], [-2, 2, 5], [-5, -1, 2]], [0, 1, 2, 1, 3, 2, 1, 2], 1],
[156, 147, "square", [[0, 3, 7], [-4, -1, 3], [-2, 2, 5], [-5, -1, 2]], [0, 0, 2, 1, 3, 1, 2, 1], 1]
];
// g = gain per side (0 peaceful, 1 fight), t = next step time, n = step count, side = playing side, sw = time of the last switch
const mus = { g: [], t: [0, 0], n: [0, 0], side: -1, sw: 0 };
// called every 100 ms: schedules 0.3 s ahead, 1 s cross-fade on a combat state change or volume change
function musTick() {
const c = sound.ctx;
if (!c || "running" !== c.state) return;
mus.g.length || (mus.g = [0, 1].map(() => { const g = c.createGain(); return g.gain.value = 0, g.connect(c.destination), g }));
const side = combatState ? 1 : 0, now = c.currentTime;
side !== mus.side && (mus.side = side, mus.sw = now, mus.g.forEach((g, i) => (g.gain.cancelScheduledValues(now), g.gain.setValueAtTime(g.gain.value, now), g.gain.linearRampToValueAtTime(i === side ? sound.mus : 0, now + 1))));
mus.g.forEach((g, i) => {
if (!sound.mus || i !== side && now > mus.sw + 1) return void(mus.t[i] = 0);
const [bpm, f0, w, ch, pat, hard] = MUSIC[2 * i + sound.mv], st = 30 / bpm, hz = s => f0 * 2 ** (s / 12);
mus.t[i] < now && (mus.t[i] = now + .05);
for (; mus.t[i] < now + .3; mus.t[i] += st) {
const n = mus.n[i]++ % 32, cd = ch[n >> 3], k = pat[n & 7], at = mus.t[i];
k >= 0 && beep(hz(cd[k % 3] + 12 * (k / 3 | 0)), st * (hard ? .5 : 1.6), w, hard ? .035 : .07, 0, at, g);
hard ? (beep(hz(cd[0] - 12), st * .8, "square", .05, 0, at, g), n & 1 || beep(150, .12, "sine", .35, 40, at, g)) : n & 7 || beep(hz(cd[0] - 12), st * 8, "sine", .12, 0, at, g)
}
})
}
