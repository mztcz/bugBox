const INTERACT_CHANCE = .10, BOX_CAP = 100;
// young = egg, larva, pupa or cocoon in the peaceful box (ECS or savedWorld during a fight)
const youngAll = () => [...ecsQuery("young").map(e => C.young.get(e)), ...savedWorld?.young || []],
boxFull = () => bugsOwned.length + youngAll().length >= BOX_CAP;
const MATE_HOLD_MIN = 3000, MATE_HOLD_MAX = 7000, MATE_TURN_MAX = 8000;
const LOVE_BITE_REACH = 2.5, LOVE_BITE_CONE = 1;
const mateOdds = () => bugsOwned.length <= 3 ? 1 : bugsOwned.length <= 10 ? .5 : .25;
const nibble = (a, y, t = C.bug.get(y)) => (C.walk.get(y).hitT = 1, t.curHp = max(1, (t.curHp == null ? maxHpOf(t) : t.curHp) - statLin(a, "str", 1, 10) * rollVar()));
const canParent = b => hpFrac(b) >= 1 && !b.mated;
function interactEligible(e) {
const b = C.bug.get(e);
return hpFrac(b) >= 1 && !C.walk.get(e).pair
}
function sysMate(dt, ents) {
const dtS = dt / 1e3;
for (let i = 0; i < ents.length; i++) {
const ea = ents[i], ta = C.walk.get(ea), was = ta.touch;
let now = null;
for (let j = i + 1; j < ents.length; j++) {
const eb = ents[j],
pa = C.pos.get(ea), pb = C.pos.get(eb),
ba = C.bug.get(ea), bbg = C.bug.get(eb);
if (hypot(pb.x - pa.x, pb.y - pa.y) > sepPair(ea, eb) * 1.15) continue;
(now ||= new Set).add(eb);
if (was?.has(eb)) continue;
if (!interactEligible(ea) || !interactEligible(eb)) continue;
if (random() >= INTERACT_CHANCE) continue;
if (!canParent(ba) || !canParent(bbg) || random() >= mateOdds() || boxFull()) {
ta.pair = C.walk.get(eb).pair = { a: ea, b: eb, ta: 1, tb: 1 };
continue
}
const subFirst = ba.str < bbg.str || (ba.str === bbg.str && random() < .5),
m = { a: subFirst ? ea : eb, b: subFirst ? eb : ea, phase: "turn", t: 0, hold: 0 };
[ea, eb].forEach(x => (setAct(x, "breeding"), C.walk.get(x).pair = m))
}
ta.touch = now
}
ents.forEach(e => {
const s = C.walk.get(e).pair;
if (!s || s.a !== e && C.pos.has(s.a)) return;
if (!C.pos.has(s.a) || !C.pos.has(s.b)) return void pairEnd(s);
s.phase ? mateStep(s, dt, dtS) : loveStep(s, dt, dtS)
})
}
function loveStep(s, dt, dtS) {
const pa = C.pos.get(s.a), pb = C.pos.get(s.b);
if (hypot(pb.x - pa.x, pb.y - pa.y) <= sepPair(s.a, s.b) * LOVE_BITE_REACH) {
for (const [x, y, k2] of [[s.a, s.b, "ta"], [s.b, s.a, "tb"]]) {
if (!s[k2]) continue;
const px = C.pos.get(x), py = C.pos.get(y), bx = C.bug.get(x), tx = C.walk.get(x), a = atan2(py.y - px.y, py.x - px.x);
C.vel.get(x).wanderAngle = a, turnToward(x, a, turningOf(bx) * dtS);
abs(norm(a - px.dir)) < LOVE_BITE_CONE && (tx.prepT = (tx.prepT || (tx.prepMax = bitePrepOf(bx))) - dt) <= 0 && (s[k2] = tx.prepT = 0, nibble(bx, y), SFX.bite())
}
if (s.ta || s.tb) return
}
pairEnd(s)
}
function mateStep(m, dt, dtS) {
const sp = C.pos.get(m.a), tp = C.pos.get(m.b),
sb = C.bug.get(m.a), tb = C.bug.get(m.b);
if ("turn" === m.phase) {
const away = atan2(sp.y - tp.y, sp.x - tp.x),
dx = tp.x - sp.x, dy = tp.y - sp.y, d = hypot(dx, dy) || .001,
rem = d - mateGap(m), step = min(abs(rem), spdOf(tb) * dtS);
if ((m.t += dt) >= MATE_TURN_MAX) return void pairEnd(m);
turnToward(m.a, away, turningOf(sb) * dtS) & turnToward(m.b, away, turningOf(tb) * dtS) &&
(tp.x -= dx / d * step * sign(rem), tp.y -= dy / d * step * sign(rem), step === abs(rem) && (m.phase = "hold", m.hold = MATE_HOLD_MIN + random() * (MATE_HOLD_MAX - MATE_HOLD_MIN)));
return
}
mateSnap(m), m.hold -= dt;
if (m.hold <= 0) {
const bug = boxFull() || makeBug({ ...computeOffspring(sb, tb) });
!1 === bug.dead && (ecsSpawn({
young: { st: "egg", bug, pT: parentTier(sb, tb), r: min(bugLen(sb), bugLen(tb)) * .25, ck: ri(3), lt: ri(3), pv: ri(2), eaten: 0, ready: 0, t: 0, trail: [] },
pos: { x: (sp.x + tp.x) / 2, y: (sp.y + tp.y) / 2, dir: rf(-PI, PI) }, vel: {}
}), achKids(sb, tb), achieve("mate"));
pairEnd(m, 1)
}
}
function mateGap(m) { return bugLen(C.bug.get(m.a)) * .55 }
function mateSnap(m) {
const sp = C.pos.get(m.a), tp = C.pos.get(m.b), g = mateGap(m);
tp.dir = sp.dir, tp.x = sp.x - cos(sp.dir) * g, tp.y = sp.y - sin(sp.dir) * g
}
function mateCancel(e) {
const s = C.walk.get(e).pair;
s && pairEnd(s)
}
function pairEnd(s, ok) {
[s.a, s.b].forEach(en => {
const t = C.walk.get(en);
if (!t) return;
t.pair = t.prepT = 0, ok && (C.bug.get(en).mated = 1), think(en, ok && en === s.a ? 2 : 1)
})
}
// fight start marks waiting eggs and pupae ready; each peaceful box open gives the ready ones a new 1–10 s window
const youngReady = fight => youngAll().forEach(y => fight ? ("egg" === y.st || "pupa" === y.st) && (y.ready = 1) : y.ready && (y.wait = rf(1, 10)));
const YOUNG_SHAKE = 1.6, LARVA_TURN = TAU / 5.99,
ease = k => k < 0 ? 0 : k > 1 ? 1 : k * k * (3 - 2 * k),
lSize = y => [bugLen(y.bug) * (.5 + .1 * y.eaten), ensureMorph(y.bug).bodyWidth * (.55 + .08 * y.eaten) + 1.2],
youngR = en => { const y = C.young.get(en); return "emerge" === y.st ? 0 : ("egg" === y.st ? y.r : "pupa" === y.st || "pupating" === y.st ? pupaGeo(y.bug)[1] : lSize(y)[0] * .6) + 10 },
shellAdd = (p, s) => ecsSpawn({ shell: { rot: 0, t: 0, vx: 0, vy: 0, vr: 0, life: rf(8, 12), ...s }, pos: { dir: 0, ...p } });
function zig(x1, y1, x2, y2, n, amp) {
const out = [], l = hypot(x2 - x1, y2 - y1) || 1;
for (let i = 0; i <= n; i++) { const u = i / n, j = i && i < n ? (i % 2 ? amp : -amp) : 0; out.push([x1 + (x2 - x1) * u - (y2 - y1) / l * j, y1 + (y2 - y1) * u + (x2 - x1) / l * j]) }
return out
}
// pupa / cocoon: [half width, half length, centre on the bug's axis] = head tip to body end, 1.2 × max(body width, head)
function pupaGeo(b) {
const m = ensureMorph(b), n = m.bodySegments, g = m.segmentGradient ?? 3, bl = m.bodyLength, sl = bl / (1 + .45 * (n - 1)), a = -bl / 2 - m.headSize;
let z = -1 / 0;
for (let s = 0; s < n; s++) z = max(z, -bl / 2 + sl / 2 - sl * (1 - getSegmentScale(g, 0, n)) / 2 + .45 * sl * s + sl * getSegmentScale(g, s, n) / 2);
return [max(m.bodyWidth, m.headSize) * 1.2, (z - a) / 2, (a + z) / 2]
}
// emerging bug: slides forward out of the pupa over 1.8 s
function bugAt(y, p, t) {
const c = pupaGeo(y.bug)[2] + ease((t - .4) / 1.4) * bugLen(y.bug) * 1.1;
return [p.x + cos(p.dir) * c, p.y + sin(p.dir) * c, c - pupaGeo(y.bug)[2]]
}
function larvaPts(y, p) {
const gap = lSize(y)[0] / 7, pts = [y.trail[0] || [p.x, p.y]];
for (let i = 1, acc = 0; i < y.trail.length && pts.length < 8; i++) (acc += hypot(y.trail[i][0] - y.trail[i - 1][0], y.trail[i][1] - y.trail[i - 1][1])) >= gap * pts.length && pts.push(y.trail[i]);
while (pts.length < 8) { const l = pts[pts.length - 1]; pts.push([l[0] - cos(p.dir) * gap, l[1] - sin(p.dir) * gap]) }
return pts
}
function crackEgg(y, p) {
const r = y.r, R = r * 1.3, piece = (poly, vx, vy, vr) => shellAdd(p, { k: "egg", r, poly, vx, vy, vr }),
shards = (n, sp) => { for (let i = 0; i < n; i++) { const a = rf(-PI, PI), v = r * rf(sp * .6, sp) * 2.4; shellAdd({ x: p.x + cos(a) * r * .4, y: p.y + sin(a) * r * .3 }, { k: "shard", s: r * rf(.15, .32), rot: rf(0, TAU), vx: cos(a) * v, vy: sin(a) * v, vr: rf(-8, 8) }) } };
if (0 === y.ck) { const z = zig(0, -R, 0, R, 7, r * .12); piece([[-R, -R], ...z, [-R, R]], -r * 1.6, 0, -.5), piece([[R, -R], ...z, [R, R]], r * 1.6, 0, .5), shards(6, 1) }
else if (1 === y.ck) {
const e = [[-R, -R * .2], [R * .9, -R], [R * .4, R]], cx = r * .15, cy = r * .1;
for (let i = 0; i < 3; i++) { const a = e[i], b = e[(i + 1) % 3], m = atan2(a[1] + b[1], a[0] + b[0]); piece([...zig(cx, cy, a[0], a[1], 4, r * .1), [(a[0] + b[0]) * 1.5, (a[1] + b[1]) * 1.5], ...zig(b[0], b[1], cx, cy, 4, r * .1)], cos(m) * r * 2.2, sin(m) * r * 2.2, rf(-2, 2)) }
shards(9, 1.4)
} else {
const ca = cos(p.dir), sa = sin(p.dir), cut = r * .35, pts = zig(cut * ca + R * sa, cut * sa - R * ca, cut * ca - R * sa, cut * sa + R * ca, 6, r * .1), l = pts[pts.length - 1],
cap = f => [...pts, [l[0] + f * ca * R * 2, l[1] + f * sa * R * 2], [pts[0][0] + f * ca * R * 2, pts[0][1] + f * sa * R * 2]];
piece(cap(1), ca * r * 3, sa * r * 3, rf(4, 7)), piece(cap(-1), -ca * r * .3, -sa * r * .3, 0), shards(5, 1)
}
}
// larva: AGI 1 walk and turn, wanders, turns to food seen with the future bug's PER; 3 meals, 2.5–4 s more crawling, then pupates
function larvaStep(e, y, p, dtS) {
const L = lSize(y)[0], f = y.eaten < 3 && seenFood(y.bug, p), m = L + 14;
if (y.chew > 0) return void(y.chew -= dtS);
if (f) {
y.tdir = atan2(f.y - p.y, f.x - p.x);
if (hypot(f.x - p.x, f.y - p.y) < L * .5 + 5) return void(ecsKill(ecsQuery("food", "pos").find(fe => C.pos.get(fe) === f)), y.chew = .9, 3 === ++y.eaten && (y.extra = rf(2.5, 4)))
} else (y.wt = (y.wt || 0) - dtS) <= 0 && (y.wt = rf(2, 4), y.tdir = p.dir + rf(-1, 1));
f || (p.x < m || p.x > boxLW - m || p.y < m || p.y > boxLH - m) && (y.tdir = atan2(boxLH / 2 - p.y, boxLW / 2 - p.x));
turnToward(e, y.tdir ?? p.dir, LARVA_TURN * dtS);
p.x = clamp(p.x + cos(p.dir) * BASE_WALK * dtS, L / 2, boxLW - L / 2), p.y = clamp(p.y + sin(p.dir) * BASE_WALK * dtS, L / 2, boxLH - L / 2);
y.trail.unshift([p.x, p.y]), y.trail.length > 400 && y.trail.pop();
if (y.eaten < 3 || (y.extra -= dtS) > 0) return;
if (1 === y.lt) { const q = larvaPts(y, p), h = q[0], t = q[7]; p.x = (h[0] + t[0]) / 2, p.y = (h[1] + t[1]) / 2, p.dir = atan2(h[1] - t[1], h[0] - t[0]) }
y.st = "pupating", y.t = 0
}
function sysYoung(dt) {
const dtS = dt / 1e3;
ecsQuery("young", "pos").forEach(e => {
const y = C.young.get(e), p = C.pos.get(e);
if (drag?.moved && drag.e === e) return;
y.t += dtS;
if (y.ready && (y.wait -= dtS) <= 0) return void(y.ready = y.t = 0, "egg" === y.st ? (crackEgg(y, p), y.st = "hatch") : y.st = "emerge");
"hatch" === y.st ? y.t > .9 && (y.st = "larva", y.t = 0) : "larva" === y.st ? larvaStep(e, y, p, dtS) : "pupating" === y.st ? y.t > 4.8 && (y.st = "pupa") : "emerge" === y.st && y.t > 1.8 && emerge(e, y, p)
});
ecsQuery("shell", "pos").forEach(e => {
const s = C.shell.get(e), p = C.pos.get(e), k = 1 - (s.t += dtS) / .5;
k > 0 && (p.x += s.vx * dtS * k, p.y += s.vy * dtS * k, s.rot += s.vr * dtS * k), s.t > s.life && ecsKill(e)
})
}
// the bug joins bugsOwned only now
function emerge(e, y, p) {
const nb = y.bug, [x, yy, d] = bugAt(y, p, 1.8), be = ecsSpawn(bugEntity(nb, x, yy, p.dir, -1));
nb.curHp = maxHpOf(nb), bugsOwned.push(nb), achOwn(1), achChild(nb, y.pT), achStep("hatched", [1, 10], "hatch"), trackDynasty(nb.gen), SFX.hatch();
C.walk.get(be).stride = .32 * d, think(be), shellAdd(p, { k: "husk", o: y }), ecsKill(e)
}
