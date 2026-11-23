const GEAR = {
pincers: [{ sizeMult: .85, sweep: .4, baseGap: .4, tip: .4 }, { sizeMult: 1.35, sweep: .95, baseGap: .7, tip: 1.1 }, { sizeMult: 1.8, sweep: 1.6, baseGap: .95, tip: 2 }],
ant: [{ spread: 1.1 }, { spread: 2 }, { spread: 3 }],
antb: [{ spread: 2.2, len: .28 }, { spread: 3.2, len: .28 }, { spread: 3.2, len: .56 }],
eyes: [{ spread: .4, fwd: .85, sizeMult: .35 }, { spread: .62, fwd: .65, sizeMult: .35 }, { spread: .9, fwd: .4, sizeMult: .35 }]
};
// 16 head gear types (inherited); size headGearSize 0–9 from PER, f = headGearSize × 2/9 runs linearly through the 3 GEAR rows
const GEAR_LABEL = { pincers: "Pincers", ant: "Antennae", antb: "Antennae Bwd", eyes: "Eyes", fan: "Fan Antennae", feather: "Feather Antennae", stalk: "Eye Stalks", bead: "Bead Antennae", serrate: "Saw Antennae", comb: "Comb Antennae", club: "Club Antennae", bristle: "Bristle Antennae", knotswept: "Knotted Swept", sawswept: "Saw Swept", whipswept: "Whip Antennae", sswept: "S-curve Antennae" };
const GEAR_KEYS = Object.keys(GEAR_LABEL);
// 11 mandible types (inherited): [size z, axis points P1..P3 from the root in units of L (Sickle computed; Pliers P3 computed), width profile, teeth by STR [u, h in L, outgrowth]]
const tRow = (n, a, b, h) => [...Array(n)].map((_, i) => [a + (b - a) * i / max(1, n - 1), h]);
const MAND = {
sickle: [1.3, 0, (u, w) => w * pow(1 - u, .9), S => S >= 15 ? [[.36, .17], [.62, .17]] : [S >= 10 && [.5, .17]]],
stag: [1.3, [[.3, -.25], [.45, -.85], [.08, -1.1]], (u, w) => .85 * w * (1 - .75 * u), S => [S >= 6 && [.55, .3, 1], S >= 14 && [.8, .2, 1]]],
pliers: [1, [[.42, -.3], [.42, -.8]], (u, w) => 1.25 * w * sin(PI * (.12 + .8 * u)), S => [S >= 10 && [.45, .14]]],
saw: [1, [[.05, -.38], [.05, -.82], [-.06, -1.05]], (u, w) => .7 * w * (1 - .45 * u), S => [...tRow(2 + floor(S / 5), .2, .85, .1), [.97, .16]]],
tiger: [1.1, [[.3, -.35], [.3, -.85], [-.15, -1]], (u, w) => .9 * w * pow(1 - u, .8), S => S >= 5 ? tRow(3, .35, .65, .14) : []],
antler: [1.5, [[.35, -.2], [.45, -.95], [.05, -1.2]], (u, w) => .5 * w * (1 - .4 * u), S => S >= 8 ? [[.3, .12, 1], [.6, .1, 1]] : []],
forked: [1.2, [[.32, -.25], [.45, -.85], [.1, -1.1]], (u, w) => .8 * w * (1 - .7 * u), S => [S >= 4 && [.93, .22, 1], S >= 8 && [.6, .18, 1]]],
hook: [1, [[.35, -.3], [.35, -.75], [-.05, -.85]], (u, w) => 1.2 * w * (1 - .6 * u), S => [S >= 6 && [.45, .25, 1]]],
rove: [1, [[.2, -.35], [.2, -.85], [-.2, -.95]], (u, w) => .6 * w * pow(1 - u, .7), S => [S >= 12 && [.55, .1]]],
cyclo: [1.35, [[.3, -.3], [.4, -.95], [-.02, -1.15]], (u, w) => .65 * w * (1 - .6 * u), S => tRow(4 + floor(S / 4), .25, .85, .05)],
molar: [.9, [[.3, -.2], [.3, -.55], [.05, -.7]], (u, w) => .7 * w * (1 - .3 * u), () => [[.6, .1], [.8, .1]]]
};
const MAND_KEYS = Object.keys(MAND), MAND_LABEL = Object.fromEntries(MAND_KEYS.map(k => [k, k[0].toUpperCase() + k.slice(1)]));
const MORPH_FREE = { bodySegments: [1, 3], segmentGradient: [1, 5] };
const MORPH_STAT = { bodyLength: [16, 29], bodyWidth: [2, 11], headSize: [2, 6], legLen: [5, 14], headGearSize: [0, 9] };
const MORPH_RANGE = { ...MORPH_FREE, ...MORPH_STAT };
function statMorph(s) {
return { bodyLength: statLin(s, "con", 15.5, 29), bodyWidth: statLin(s, "arm", 2, 11), headSize: 2 + floor((s.int - 1) / 4), mand: s.str, legLen: statLin(s, "agi", 5, 14), headGearSize: floor((s.per - 1) / 2) }
}
function randomMorph() {
const m = {};
for (const k in MORPH_RANGE) { const [lo, hi] = MORPH_RANGE[k]; m[k] = lo + ri(hi - lo + 1) }
return m.headGear = rnd(GEAR_KEYS), m.mandType = rnd(MAND_KEYS), m
}
function ensureMorph(b) { return b.morph || (b.morph = randomMorph()), b.morph }
function syncMorph(b) { return Object.assign(ensureMorph(b), statMorph(b)) }
function inheritThird(va, vb, pool) {
const r = random();
if (r < 1 / 3) return va;
if (r < 2 / 3) return vb;
const rest = pool.filter(v => v !== va && v !== vb);
return rest.length ? rest[ri(rest.length)] : va
}
function mixMorph(a, b) {
const ma = ensureMorph(a), mb = ensureMorph(b), m = {};
for (const k in MORPH_FREE) {
const [lo, hi] = MORPH_FREE[k], pool = [];
for (let v = lo; v <= hi; v++) pool.push(v);
m[k] = inheritThird(ma[k], mb[k], pool)
}
return m.headGear = inheritThird(ma.headGear, mb.headGear, GEAR_KEYS), m.mandType = inheritThird(ma.mandType, mb.mandType, MAND_KEYS), m
}
function getSegmentScale(grad, s, segs) {
let i = s, g = grad;
g === 4 && (i = segs - 1 - s, g = 2), g === 5 && (i = segs - 1 - s, g = 1);
let sc = 1;
return g === 1 ? sc = 1 - .24 * i : g === 2 && (sc = 1 - .12 * i), max(sc, .1)
}
const hsl3 = (h, s, l) => `hsl(${h},${s}%,${l}%)`;
const SHADE = [null, { gear: 0, body: 2 }, { gear: 9, body: 9 }, null];
const NEON_BG = "#0a0809";
function bulgeGrad(t, gx, gy, r, hue, vol) {
if (vol < .05) return hsl3(hue, 62, 38);
const sp = vol * 3.6, dk = max(38 - sp, 6), g = t.createRadialGradient(gx, gy, r * .04, gx, gy, r * 1.05);
return g.addColorStop(0, hsl3(hue, 62, min(38 + sp, 72))), g.addColorStop(.45, hsl3(hue, 62, 38)),
g.addColorStop(.8, hsl3(hue, 62, (38 + dk) / 2)), g.addColorStop(1, hsl3(hue, 62, dk)), g
}
function strokeShades(hue, vol) {
return vol < .05 ? { base: hsl3(hue, 62, 38), over: null } :
{ base: hsl3(hue, 62, max(38 - 2 * vol, 8)), over: hsl3(hue, 62, min(38 + 1.6 * vol, 55)) }
}
function hexPath(t, cy, rx, ry) {
t.beginPath();
pathPts(t, 6, k => { const a = -HALF_PI + k * PI / 3; return [sin(a) * rx, cy + cos(a) * ry] });
t.closePath()
}
function backPattern(t, gk, cy, rx, ry) {
t.lineWidth = .5;
const seg = (x1, y1, x2, y2, x3, y3) => { t.beginPath(), t.moveTo(x1, y1), t.lineTo(x2, y2), x3 != null && t.lineTo(x3, y3), t.stroke() };
"pincers" === gk ? (seg(-rx * .5, cy - ry * .5, 0, cy - ry, rx * .5, cy - ry * .5), seg(-rx * .5, cy + ry * .5, 0, cy + ry, rx * .5, cy + ry * .5)) :
"ant" === gk ? (seg(-rx * .6, cy, rx * .6, cy), seg(0, cy - ry * .6, 0, cy + ry * .6)) :
"antb" === gk ? (seg(-rx * .5, cy - ry * .5, rx * .5, cy + ry * .5), seg(rx * .5, cy - ry * .5, -rx * .5, cy + ry * .5)) :
(hexPath(t, cy, rx * .45, ry * .45), t.stroke())
}
function renderMorphParts(t, cfg, wp, sh, nl, so) {
const bl = cfg.bodyLength, legSp = bl / 4, still = wp === null, L = cfg.legLen, hx = cfg.bodyWidth / 2;
t.lineWidth = nl ? .9 : .8, t.lineCap = t.lineJoin = nl ? "miter" : "round";
sh && (t.strokeStyle = hsl3(sh.hue, 62, 38));
for (let i = 1; i <= 3; i++) {
const ly = -bl / 2 + i * legSp, m = i - 2,
ph = gait ? (i % 2 ? 0 : PI) : i, sw = still ? 0 : min(L * .28 * (m ? 1.35 : .6), bl * .12), c = m * .15 * L;
// spider walk, saved here, to be used in the future with 4th leg pair:
// fan = [55, 25, 0][i - 1] * PI / 180; rotate each leg point (dx, dy) around the root (a, ly) towards the head
// by s * fan before adding the swing: dx' = dx * cos(fan) + s * dy * sin(fan), dy' = dy * cos(fan) - s * dx * sin(fan)
for (const s of [-1, 1]) {
const j = s > 0 ? 1 : 0, x = (cfg.legW ? cfg.legW[j] : wp) + ph, a = s * hx, w = c - s * sw * sin(x) * (cfg.legA ? cfg.legA[j] : 1), P = [[a, ly], [a + s * .4 * L, ly + w], [a + s * .648 * L, ly + w + .248 * L], [a + s * .733 * L, ly + w + .483 * L]],
lf = still ? 0 : max(0, s * cos(x)), k = so ? [1, .6 + .4 * lf, .3 + .7 * lf, lf] : [0, 0, 0, 0];
t.beginPath(), P.forEach(([px, py], j) => t.lineTo(px + (so ? k[j] * so[0] : 0), py + (so ? k[j] * so[1] : 0))), t.stroke()
}
}
so && t.translate(so[0], so[1]);
const grad = cfg.segmentGradient ?? 3, segLen = bl / (1 + .45 * (cfg.bodySegments - 1)),
f0 = getSegmentScale(grad, 0, cfg.bodySegments),
hy = -bl / 2, hs = cfg.headSize, gk = GEAR_LABEL[cfg.headGear] ? cfg.headGear : "eyes", mt = MAND[cfg.mandType] ? cfg.mandType : "sickle", S = cfg.mand ?? 1,
gf = clamp(cfg.headGearSize ?? 0, 0, 9) * 2 / 9, gs = sh ? strokeShades(sh.hue, sh.gear) : null;
const shape = (cy, rx, ry) => {
nl ? hexPath(t, cy, rx, ry) : (t.beginPath(), t.ellipse(0, cy, rx, ry, 0, 0, 7));
if (!nl) return sh && (t.fillStyle = bulgeGrad(t, 0, cy, max(rx, ry), sh.hue, sh.body)), void t.fill();
const sb = t.shadowBlur, sf = t.fillStyle;
t.shadowBlur = 0, t.fillStyle = NEON_BG, t.fill(), t.shadowBlur = sb, t.fillStyle = sf, t.lineWidth = .9, t.stroke()
};
let cy = hy + segLen / 2 - segLen * (1 - f0) / 2;
for (let s = 0; s < cfg.bodySegments; s++) {
const sc = getSegmentScale(grad, s, cfg.bodySegments), rw = cfg.bodyWidth * sc, rh = segLen * sc / 2;
shape(cy, rw, rh), nl && (backPattern(t, gk, cy, rw, rh), t.lineWidth = .9), cy += segLen * .45
}
// mandibles under the head: outline + round joint (no joint in Neon)
const e = esM(mt, S, hs), [polys, cap] = mandShape(mt, S, hy, hs, mandTheta(mt, S, hs, e, cfg.jaw), e), fc = t.fillStyle;
gs && (t.fillStyle = gs.base);
for (const s of [-1, 1]) {
for (const pl of polys) t.beginPath(), pathPts(t, pl.length, j => [s * pl[j][0], pl[j][1]]), t.closePath(), nl ? t.stroke() : t.fill();
nl || (t.beginPath(), t.arc(s * cap[0], cap[1], cap[2], 0, TAU), t.fill())
}
t.fillStyle = fc, shape(hy, hs, hs);
const dual = (path, w1, w2) => { gs && (t.lineWidth = w1, t.strokeStyle = gs.base), path(), gs && gs.over && (t.lineWidth = w2, t.strokeStyle = gs.over, path()) },
xm = mandXm(hs), pn = drawPen(t, hy, hs, gk === "eyes" ? 1 : esK(gk, gf, hs, xm), nl, dual, sh && ((x, y, r) => t.fillStyle = bulgeGrad(t, x, y, r, sh.hue, sh.gear)));
for (const s of [-1, 1]) gearSide(pn, gk, gf, hy, hs, xm, S, s)
}
function drawMorphBug(ctx, cfg, color, x, y, rot, { alpha = 1, scale = 1, walk = null, shadow = !0, glow = null, hue = null, flat = !1, jaw = null } = {}) {
jaw && (cfg = { ...cfg, jaw });
// walk = [[left, right] leg phases, [left, right] swing amplitudes] after a turn in place (posPhase): per-side legs as cfg.legW / cfg.legA
walk?.length && (cfg = { ...cfg, legW: walk[0], legA: walk[1] }, walk = 0);
const nl = !flat && 3 === bugTheme, sh = hue != null && SHADE[bugTheme] ? { hue, ...SHADE[bugTheme] } : null;
ctx.save(), ctx.globalAlpha = alpha, shadow && !nl && morphShadow(ctx, cfg, x, y, rot, scale, walk), ctx.translate(x, y), ctx.rotate(rot), ctx.scale(scale, scale);
glow ? (ctx.shadowColor = glow, ctx.shadowBlur = 14) : nl && (ctx.shadowColor = color, ctx.shadowBlur = 15);
ctx.fillStyle = ctx.strokeStyle = color, renderMorphParts(ctx, cfg, walk, sh, nl), ctx.restore()
}
const shCv = Object.assign(document.createElement("canvas"), { width: 0, height: 0 }), shCx = shCv.getContext("2d");
function morphShadow(ctx, cfg, x, y, rot, scale = 1, walk = null) {
// light from the top left: offset = body height above ground (0.3 × legs + 0.25 × width) × 0.71 per axis, grows with scale
const c = cos(rot), s = sin(rot), o = (.3 * cfg.legLen + .25 * cfg.bodyWidth) * Math.SQRT1_2, M = ctx.getTransform(), z = hypot(M.a, M.b), [, y0, x1, y1] = morphBox(cfg),
R = (hypot(x1, max(-y0, y1)) + .12 * cfg.bodyLength + 2 * o) * scale, n = Math.ceil(2 * R * z);
shCv.height < n && (shCv.width = shCv.height = n), shCx.setTransform(1, 0, 0, 1, 0, 0), shCx.clearRect(0, 0, n, n);
shCx.setTransform(z, 0, 0, z, n / 2, n / 2), shCx.rotate(rot), shCx.scale(scale, scale), shCx.fillStyle = shCx.strokeStyle = "#000";
renderMorphParts(shCx, cfg, walk, null, !1, [o * (c + s), o * (c - s)]);
ctx.save(), ctx.globalAlpha *= .35, ctx.shadowBlur = 0, ctx.drawImage(shCv, 0, 0, n, n, x - R, y - R, n / z, n / z), ctx.restore()
}
let palette = 0, gait = 1, bugTheme = 0;
function setBugTheme(v) { bugTheme = +v }
function setPalette(v) { palette = +v }
function setGait(v) { gait = +v }
function morphColor(hue) { return 3 === bugTheme ? `hsl(${hue},95%,62%)` : 1 === palette ? `hsl(${15+hue%60},${15+hue%40}%,${8+hue*7%28}%)` : 2 === palette ? `hsl(${20+hue%40},30%,${18+hue%12}%)` : `hsl(${hue},70%,45%)` }
// results that depend only on their inputs (mandible poses, ES factors, outlines), computed once
const MEMO = {}, memo = (key, fn) => MEMO[key] ??= fn();
const bez3 = (Q, u) => { const v = 1 - u, a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u; return [0, 1].map(i => a * Q[0][i] + b * Q[1][i] + c * Q[2][i] + d * Q[3][i]) };
// one right mandible (left = mirrored): head centre (0, hy), STR S, rotation th around the joint (positive = inwards), e = ES factor
// returns [polygons (outline from where the axis leaves the head + teeth), joint [x, y, r]]
function mandShape(mt, S, hy, hs, th, e = 1) {
const [z, A, prof, teeth] = MAND[mt], k = (S - 1) / 19, L = (3.5 + 10.5 * k + .4 * hs) * z * e, w = (.7 + 3.3 * k) * z * e, cv = .4 + 2.1 * k,
bx = .6 * hs * sin(PI / 9), by = hy - .6 * hs * cos(PI / 9), C = [bx + .28 * L * cv, by - .62 * L], T = [max(.4, .6 * bx * (1 - .5 * k)), by - L],
// Sickle: quadratic B → C → T as a cubic; Pliers has only P1, P2 in the table, its P3 is appended here (other types drop it with slice)
Q = [[bx, by], ...(A ? [...A.map(([a, b]) => [bx + a * L, by + b * L]), [.12 * bx, by - .74 * L]].slice(0, 3) : [[bx + 2 / 3 * (C[0] - bx), by + 2 / 3 * (C[1] - by)], [T[0] + 2 / 3 * (C[0] - T[0]), T[1] + 2 / 3 * (C[1] - T[1])], T])],
tg = u => { const p = bez3(Q, min(1, u + .01)), q = bez3(Q, max(0, u - .01)), l = hypot(p[0] - q[0], p[1] - q[1]) || 1; return [(p[0] - q[0]) / l, (p[1] - q[1]) / l] };
let u0 = 0;
for (let i = 1; i <= 60; i++) { const p = bez3(Q, i / 60); if (hypot(p[0], p[1] - hy) >= hs) { u0 = i / 60; break } }
const wr = min(1, .7 * hs / w), W = u => prof(u, w) * (wr + (1 - wr) * min(1, max(0, u - u0) / .25)),
side = (u, sg) => { const p = bez3(Q, u), d = tg(u), h = W(u) / 2 * sg; return [p[0] - d[1] * h, p[1] + d[0] * h] },
out = [], inn = [], pv = bez3(Q, u0), cs = cos(th), sn = sin(th);
for (let i = 0; i <= 18; i++) { const u = u0 + (1 - u0) * i / 18; out.push(side(u, 1)), inn.unshift(side(u, -1)) }
const polys = [out.concat(inn)];
for (const [u, h0, pr] of teeth(S).filter(q => q && q[0] > u0 + .06)) {
const h = h0 * L, m = side(u, -1), d = tg(u), a = pr ? .8 : 1, f = pr ? .6 : .25;
polys.push([side(max(0, u - .06), -1), [m[0] + d[1] * h * a + d[0] * h * f, m[1] - d[0] * h * a + d[1] * h * f], side(min(1, u + .06), -1)])
}
return [polys.map(pl => pl.map(([x, y]) => { const dx = x - pv[0], dy = y - pv[1]; return [pv[0] + dx * cs + dy * sn, pv[1] - dx * sn + dy * cs] })), [...pv, W(u0) / 2]]
}
// outline points outside the head (head centre at 0, 0)
const mandVis = (mt, S, hs, th, e) => mandShape(mt, S, 0, hs, th, e)[0].flat().filter(p => hypot(...p) > hs);
// ES: every type reaches as far from the head centre as Sickle at the same STR and head size
const esM = (mt, S, hs) => memo(`e|${mt}|${S}|${hs}`, () => { const reach = t => max(...mandShape(t, S, 0, hs, 0)[0].flat().map(p => hypot(...p))); return reach("sickle") / reach(mt) });
// poses [close, open]: close = largest inward turn with no visible point more than 10 % of the length over the body axis; rest = close − 6°; open = rest − up to 40°
function mandPose(mt, S, hs, e) {
return memo(`p|${mt}|${S}|${hs}|${e}`, () => {
const Lv = (3.5 + 10.5 * (S - 1) / 19) * MAND[mt][0], vis = th => mandVis(mt, S, hs, th, e);
let c = -1, o = 0;
while (c < 1.6 && vis(c + .02).every(([x]) => x >= -.1 * Lv)) c += .02;
// opening stops early when a visible point near the head (closer than hs + 2 px) turns past the head side zone
const r = c - PI / 30, mx = 2 * PI / 9, sa = th => max(0, ...vis(th).filter(p => hypot(...p) < hs + 2).map(([x, y]) => atan2(x, -y))),
lim = max(({ pliers: 110, saw: 90 }[mt] ?? 120) * PI / 180, sa(r) + PI / 90);
while (o < mx - 1e-9 && sa(r - min(mx, o + .02)) <= lim) o = min(mx, o + .02);
return [c, r - o]
})
}
// largest visible x of all types at STR 20 in rest, without ES: the head gear is placed outside it
const mandXm = hs => memo("x" + hs, () => max(...MAND_KEYS.map(t => max(...mandVis(t, 20, hs, mandPose(t, 20, hs, 1)[0] - PI / 30, 1).map(p => p[0])))));
// jaw = [wind-up progress 0–1, biteT ms]: walk = 33 % open, wind-up opens fully, bite: shut in 60 ms, hold to 300 ms, back to walk at 500 ms
function mandTheta(mt, S, hs, e, [p, bt] = [0, 0]) {
const [c, o] = mandPose(mt, S, hs, e), W = lerp(c, o, .33), u = 500 - bt;
return p = clamp(p, 0, 1), bt > 0 ? u < 60 ? lerp(o, c, u / 60) : u < 300 ? c : lerp(c, W, (u - 300) / 200) : lerp(W, o, p * p * (3 - 2 * p))
}
const gearAt = (gk, f) => { const T = GEAR[gk], i = min(1, floor(f)), k = f - i, o = {}; for (const q in T[i]) o[q] = lerp(T[i][q], T[i + 1][q], k); return o };
// one head gear on one side (s = 1 right, −1 left) through a pen; G = 4 px base size, m and D grow with PER, xm = mandible zone
function gearSide(pn, gk, f, hy, hs, xm, str, s) {
const G = 4, m = 1 + f / 2, D = 4 * f - 3 * (1 - f / 2), M = ([x, y]) => [s * x, y], q = (str - 1) / 19, R0 = [.98 * hs + .4, hy - .17 * hs - .07], R = M(R0), ey = hy - .55 * hs;
if (gk === "pincers") {
const g = gearAt(gk, .444 * f), p = G * g.sizeMult, X = max(hs + p * g.sweep, xm - 1.7 + .45 * p + 2.64 * f), ty = hy - hs - p;
return pn.bez(...[[.95 * hs, hy - .3 * hs], [X, hy - .3 * hs - .2 * p], [X, ty], [X - .45 * p, ty + .05 * p], [X, hy - hs - .5 * p]].map(M))
}
if (gk === "antb") { const g = gearAt(gk, f), A = [.3 * hs + G * (g.spread - .3), hy - .8 * hs - .4 * G]; return pn.line([[.3 * hs, hy - .8 * hs], A, [A[0] - G * g.len, A[1] + 2 * G * g.len]].map(M)) }
// eyes slide back along the head side (30° at STR 1 to 31.5° at STR 20) and 0–25 % farther out with STR
if (gk === "eyes") { const g = gearAt(gk, f), dx = hs * g.spread, dy = hs * g.fwd, a = atan2(dx, dy) + (30 + 1.5 * q) * PI / 180, d = hypot(dx, dy) * (1 + .25 * q); return pn.eye(M([d * sin(a), hy - d * cos(a)]), G * g.sizeMult * m) }
if (gk === "stalk") { const r0 = [.9 * hs, hy - .35 * hs], dx = (max(hs + G * m, xm + 1.5 + .42 * G + D) - r0[0]) / 2, X = M([r0[0] + dx, r0[1] - .35 * dx]); return pn.line([M(r0), X]), pn.dot(...X, .42 * G, 1) }
// antennae: root R on the head side → elbow E outside the mandibles → flagellum F forward and out
const ex = gk === "ant" ? max(hs + G * (gearAt(gk, f).spread - 1), xm + 1.5 + D) : max(hs + .3 * G, xm + 1.5 + D), E = M([ex, ey]), Lf = 1.1 * G * m + 1.5,
F = k => [ex + .34 * Lf * k, ey - .94 * Lf * k], out = (A, a, b) => M([A[0] + .94 * a, A[1] + .34 * a + b]);
// swept back (longhorn beetles): cubic curve from the root, 21 points
if (gk.endsWith("swept")) {
const Ls = 1.1 * G * m, x0 = xm + 1 + max(0, D) / 2, H = hy - hs,
Q = [...Array(21)].map((_, i) => bez3([R0, ...{
knotswept: [[x0, H - 1.7 * Ls], [x0 + 2 * Ls, H - Ls], [x0 + 1.6 * Ls, hy + 2.8 * Ls]], sawswept: [[x0 + .3 * Ls, H - Ls], [x0 + 1.4 * Ls, H - .4 * Ls], [x0 + 1.3 * Ls, hy + 1.8 * Ls]],
whipswept: [[x0 + .2 * Ls, H - .6 * Ls], [x0 + .9 * Ls, H], [x0 + 1.2 * Ls, hy + 3.6 * Ls]], sswept: [[x0 + .6 * Ls, H - 1.2 * Ls], [x0 + .2 * Ls, hy + .2 * Ls], [x0 + 1.1 * Ls, hy + 1.4 * Ls]]
}[gk]], i / 20));
pn.thin(Q.map(M), gk === "whipswept" ? .5 : .7);
if (gk === "knotswept") for (let i = 3; i < 20; i += 3) pn.ell(M(Q[i - 1]), M(Q[i + 1]), .28 * G);
if (gk === "sawswept") for (let i = 4; i <= 18; i += 2) {
const [x, y] = Q[i], dx = Q[i + 1][0] - Q[i - 1][0], dy = Q[i + 1][1] - Q[i - 1][1], l = (dy < 0 ? -1 : 1) * (hypot(dx, dy) || 1);
pn.tri(M([x, y]), M([x + dy / l * .4 * G, y - dx / l * .4 * G]), M(Q[i + 1]))
}
return
}
if (gk === "fan") {
const P = [ex + .25 * G, ey - .7 * G];
pn.line([R, E, M(P)]);
for (const o of [-.5, 0, .5]) { const an = -HALF_PI + .6 + .8 * o; pn.ell(M(P), M([P[0] + cos(an) * .9 * G * m, P[1] + sin(an) * .9 * G * m]), .16 * G) }
return
}
if (gk === "feather") {
const dx = .6 * G * m, dy = -1.8 * G * m, l = hypot(dx, dy), px = -dy / l, py = dx / l, b = .225 * G;
pn.line([R, E, M([ex + dx, ey + dy])]);
for (let i = 1; i <= 7; i++) { const x = ex + dx * i / 8, y = ey + dy * i / 8; pn.thin([M([x, y]), M([x - px * .45 * G + dx / l * b, y - py * .45 * G + dy / l * b])]), pn.thin([M([x, y]), M([x + px * .3 * G + dx / l * b, y + py * .3 * G + dy / l * b])]) }
return
}
if (gk === "bead") { pn.line([R, E]), pn.thin([E, M(F(1))], .5); for (let k = .2; k < 1.01; k += .2) pn.dot(...M(F(k)), .17 * G); return }
if (gk === "bristle") return pn.line([R, E, M(F(.35))]), pn.thin([M(F(.35)), M(F(.7))], .4);
pn.line([R, E, M(F(1))]);
if (gk === "serrate") for (let k = .25; k < .96; k += .14) pn.tri(M(F(k)), out(F(k), .3 * G, .1 * G), M(F(k + .1)));
if (gk === "comb") for (let k = .25; k < .96; k += .14) pn.thin([M(F(k)), out(F(k), .5 * G * m ** .5, -.15 * G)], .5);
if (gk === "club") [.6, .75, .9, 1].forEach((k, i) => pn.dot(...M(F(k)), (.1 + .06 * i) * G))
}
// drawing pen; ES factor k: a point outside the head moves along the ray from the head centre so its overhang beyond the rim is k ×
function drawPen(t, hy, hs, k, nl, dual, eyeFill) {
const mp = ([x, y]) => { const dy = y - hy, r = hypot(x, dy); if (k === 1 || r <= hs) return [x, y]; const q = (hs + (r - hs) * k) / r; return [x * q, hy + dy * q] },
path = P => (t.beginPath(), pathPts(t, P.length, j => mp(P[j]))), fl = () => nl ? t.stroke() : t.fill();
return {
line: P => dual(() => (path(P), t.stroke()), 1.6, .7),
thin: (P, w = .4) => { const lw = t.lineWidth; t.lineWidth = w, path(P), t.stroke(), t.lineWidth = lw },
tri: (...P) => (path(P), t.closePath(), fl()),
dot: (x, y, r, fixed) => { const [a, b] = mp([x, y]); t.beginPath(), t.arc(a, b, fixed ? r : r * k, 0, TAU), fl() },
ell: (A, B, ry) => { const a = mp(A), b = mp(B), dx = b[0] - a[0], dy = b[1] - a[1]; t.beginPath(), t.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, hypot(dx, dy) / 2 + ry * k * .3, ry * k, atan2(dy, dx), 0, TAU), fl() },
bez: (...P) => dual(() => { const [a, b, c, d, q] = P.map(mp); t.beginPath(), t.moveTo(...a), nl ? (t.lineTo(...q), t.lineTo(...d)) : t.bezierCurveTo(...b, ...c, ...d), t.stroke() }, 2, .9),
eye: ([x, y], r) => {
if (nl) return t.beginPath(), t.moveTo(x - r, y), t.lineTo(x, y - r), t.lineTo(x + r, y), t.lineTo(x, y + r), t.closePath(), void t.stroke();
const f0 = t.fillStyle;
eyeFill && eyeFill(x, y, r), t.beginPath(), t.arc(x, y, r, 0, TAU), t.fill(), t.fillStyle = f0
}
}
}
// measuring pen (head centre at 0, 0): largest overhang beyond the head rim, dot and ellipse radii included
function measPen(hs) {
let P = 0;
const pt = ([x, y], r = 0) => P = max(P, hypot(x, y) + r - hs), pts = L => L.forEach(p => pt(p));
return { get: () => P, line: pts, thin: pts, tri: (...a) => pts(a), dot: (x, y, r) => pt([x, y], r), ell: (A, B, ry) => (pt(A), pt(B, ry)), bez: (...a) => pts(a.slice(0, 4)), eye: pt }
}
// gear ES: every type except Eyes overhangs the head as far as Antennae at the same PER
const esK = (gk, f, hs, xm) => memo(`k|${gk}|${f.toFixed(3)}|${hs}|${xm.toFixed(2)}`, () => { const pr = g => { const p = measPen(hs); return gearSide(p, g, f, 0, hs, xm, 1, 1), p.get() }; return pr("ant") / max(.5, pr(gk)) });
// drawn extent [x0, y0, x1, y1] around the body centre (head up, mandibles open and closed, legs still), +1 px for line width
const BOX_K = ["bodyLength", "bodyWidth", "headSize", "legLen", "headGearSize", "headGear", "mandType", "mand", "bodySegments", "segmentGradient"];
function morphBox(m) {
return memo("b" + BOX_K.map(k => m[k]).join(), () => {
const b = [0, 0, 0, 0], ad = (x, y, r = 0) => { b[0] = min(b[0], x - r), b[1] = min(b[1], y - r), b[2] = max(b[2], x + r), b[3] = max(b[3], y + r) },
rec = { beginPath() {}, closePath() {}, stroke() {}, fill() {}, moveTo: ad, lineTo: ad, bezierCurveTo: (a, c, d, e, x, y) => (ad(a, c), ad(d, e), ad(x, y)), arc: ad, ellipse: (x, y, rx, ry) => ad(x, y, max(rx, ry)) };
for (const jaw of [[1, 0], [0, 300]]) renderMorphParts(rec, { ...m, jaw }, null, null, !1);
return b.map((v, i) => v + (i < 2 ? -1 : 1))
})
}
function morphR(b) { const [, y0, x1, y1] = morphBox(ensureMorph(b)); return max(x1, -y0, y1) }
// scale that fits the drawn bug (rotated by rot) into w × h, and the centre of its extent
function morphFit(cfg, w, h, rot = 0) {
const [x0, y0, x1, y1] = morphBox(cfg), c = cos(rot), s = sin(rot), X = [], Y = [];
for (const x of [x0, x1]) for (const y of [y0, y1]) X.push(x * c - y * s), Y.push(x * s + y * c);
const a = min(...X), b = max(...X), d = min(...Y), g = max(...Y);
return [min(w / (b - a), h / (g - d)), (a + b) / 2, (d + g) / 2]
}
// bug centred in w × h, scaled down only when it would not fit; o.scale multiplies (designer zoom)
function drawMorphCentered(ctx, b, w, h, rot = 0, { scale = 1, ...o } = {}) {
const cfg = ensureMorph(b), [k, cx, cy] = morphFit(cfg, w, h, rot), s = min(1, k) * scale;
drawMorphBug(ctx, cfg, morphColor(b.hue), w / 2 - s * cx, h / 2 - s * cy, rot, { shadow: !1, hue: b.hue, ...o, scale: s })
}
