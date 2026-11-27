const BASE_WALK = 20, RUSH = 1.25;
const zf        = b => hasAbil(b, "zoom") ? 2 : 1;
const spdOf     = b => statLin(b, "agi", BASE_WALK, 10 * BASE_WALK) * zf(b);
const turningOf = b => TAU / statLin(b, "agi", 5.99, .5) * zf(b);
// Turn in place by style (gene morph.turnStyle, turnStyleOf). TURN_STYLES row: [name, smooth up to °, step at AGI 1 °, at AGI 20 °,
// pause between steps at AGI 1 ms, at AGI 20 ms, max step speed °/s, pivot % of the length from the head, inner legs (− back, + forward, |x| = swing),
// body shift × length (+ forward, − back, 0 none), shift only over this turn angle °, step ease E]. Smooth turns run at the caller's speed,
// legs 2.2 phase per rad; steps: n = max(1, min(ceil(T / step), floor(T / 15°))) equal steps of T / n at min(speed, max) × e(u),
// e(u) = (1 − E) + E · π/2 · sin(π u), u = share of the step done (0.03–0.97), half a gait cycle per step. The shift runs during the first half of
// the turn at 0.3 × spdOf and stops at a wall or obstacle. Legs per side: walk.lw phase offsets, walk.la amplitudes; walk.ip = shift and turn
// of this frame that sysAnimPhase keeps out of the stride. me = the single turn of v75.34 (Dev only)
const TURN_STYLES = {
tiger: ["Tiger beetle", 20, 60, 60, 120, 60, 720, 50, -.6, 0, 0, .8],
dung: ["Dung beetle", 10, 60, 60, 250, 150, 240, 50, -1, 0, 0, .5],
ground: ["Ground beetle", 180, 60, 60, 0, 0, 720, 45, .3, .4, 0, 0],
stag: ["Stag beetle", 20, 60, 60, 300, 150, 120, 55, -.3, -.2, 90, .6],
darkling: ["Darkling beetle", 30, 60, 60, 0, 0, 150, 50, -.2, .1, 0, .3],
me: ["ME", 30, 15, 60, 150, 0, 360, 70, -.4, -.3, 65, 0]
}, TURN_KEYS = ["tiger", "dung", "ground", "stag", "darkling"], TURN_LABEL = Object.fromEntries(TURN_KEYS.map(k => [k, TURN_STYLES[k][0]])),
DEG = PI / 180, TURN_MIN = 15 * DEG;
let turnMode = "bug", walkMode = "bug"; // Dev Settings Turn: old (before v75.34), bug (gene), me, or one style for every bug; Walk style: old (before v75.39), bug, or one style
// Free walk by style (same gene, act walking from decide). WALK_STYLES row: [speed × spdOf, walk min ms, max ms, steer noise ×, new direction ±°,
// thinking ×, leg phase per px, special: "sg" stop-and-go (every 0.3–0.8 s a stop of 150–300 ms, longer until its tiger turn ±0–45° ends), "dance" (30 % after a walk, also one ended by a wall:
// 2 × 180° dung turns the same way, then the same direction), or [, min ms, max ms, noise] = second mode taken by 50 % of the walks]
const WALK_STYLES = {
old: [1, WALK_MIN, WALK_MAX, 1, 120, 1, .32],
tiger: [1.5, 500, 3e3, .3, 60, 1, .24, "sg"],
dung: [.8, 3e3, 1e4, .1, 120, 1, .32, "dance"],
ground: [1.2, 1e3, 6e3, 1, 120, .5, .32],
stag: [.6, 500, 4e3, .6, 90, 1.5, .4],
darkling: [.7, 3e3, 1e4, .1, 120, 1, .36, [, 1e3, 4e3, 2.5]]
}, walkOf = b => WALK_STYLES[WALK_STYLES[walkMode] ? walkMode : ensureMorph(b).turnStyle], wsOf = t => t.ws || WALK_STYLES.old;
const turnStyleOf = b => TURN_STYLES[turnMode] ? turnMode : ensureMorph(b).turnStyle,
turnN = (b, T, s) => max(1, min(ceil(T / (statLin(b, "agi", s[2], s[3]) * DEG) - 1e-9), floor(T / TURN_MIN + 1e-9))), // steps of a turn T
turnEase = (E, u) => 1 - E + E * HALF_PI * sin(PI * clamp(u, .03, .97)),
turnEaseK = E => memo("te" + E, () => { let k = 0; for (let i = 0; i < 1e3; i++) k += 1e-3 / turnEase(E, (i + .5) / 1e3); return k }), // step time / (step / speed)
halfTurnS = (b, k = turnStyleOf(b)) => { const s = TURN_STYLES[k], n = turnN(b, PI, s); return PI > s[1] * DEG ? PI / min(turningOf(b), s[6] * DEG) * turnEaseK(s[11]) + (n - 1) * statLin(b, "agi", s[4], s[5]) / 1e3 : PI / turningOf(b) }; // half turn in place, s (Info)
function turnIP(e, d, step, k) {
const p = C.pos.get(e), v = C.vel.get(e), t = C.walk.get(e), b = C.bug.get(e), s = TURN_STYLES[TURN_STYLES[k] ? k : turnStyleOf(b)], g = sign(d), o = g > 0 ? 1 : 0, L = bugLen(b),
pv = (s[7] / 100 - .5) * L, sh = s[9] * L, ip = t.ip ||= [0, 0, 0], lw = t.lw ||= [0, 0], mv = (dx, dy) => (p.x += dx, p.y += dy, ip[0] += dx, ip[1] += dy);
let q = v.tw, A = abs(d), ms = COMBAT_STEP_MS;
q && q.g === g || (q = v.tw = { g, T: A, a: 0, w: 0, r: 0, bd: 0 });
t.la = o ? [1, abs(s[8])] : [abs(s[8]), 1];
const sm = q.T <= s[1] * DEG, rate = (sm ? step : min(step, s[6] * DEG * COMBAT_STEP_MS / 1e3)) / COMBAT_STEP_MS;
while (ms > 1e-9) {
if (q.w > 0) { const u = min(q.w, ms); q.w -= u, ms -= u; continue }
const Tc = A + q.a, sz = sm ? Tc : Tc / turnN(b, Tc, s), re = sm ? rate : rate * turnEase(s[11], q.a / sz), r = min(re * (s[11] && !sm ? min(ms, 2) : ms), A, sz - q.a),
c0 = cos(p.dir), s0 = sin(p.dir), f = r * (sm ? 2.2 : PI / sz);
ms -= r / re;
if (sh && q.T > s[10] * DEG && q.r < A && q.bd < abs(sh)) {
const bx = min(.3 * spdOf(b) * r / re / 1e3, abs(sh) - q.bd), k = sign(sh) * bx, nx = p.x + k * c0, ny = p.y + k * s0, m = bugRadius(b);
nx < m || ny < m || nx > boxLW - m || ny > boxLH - m || ecsQuery("obstacle", "pos").some(oe => { const [od, , , cr] = obstCap(oe, nx, ny); return od < cr + L / 2 }) ? q.bd = abs(sh) :
(mv(nx - p.x, ny - p.y), q.bd += bx, lw[0] += .32 * k, lw[1] += .32 * k)
}
p.dir = norm(p.dir + g * r), mv(pv * (cos(p.dir) - c0), pv * (sin(p.dir) - s0)), ip[2] += r, q.r += r, lw[1 - o] += f, lw[o] += f * sign(s[8]), A -= r;
if (A < 1e-9) return !0;
(q.a += r) >= sz - 1e-9 && (q.a = 0, q.w = statLin(b, "agi", s[4], s[5]))
}
return !1
}
const STUCK_CHECK_MS = 2000;
const SLIDE_K = .25;
const CORPSE_SLOW = .5;
const PULL_STRONG = PI / 9, PULL_WEAK = PI / 36, WALL_NEAR = .15;
const COMBAT_STEP_MS = 16, MAX_STEPS_PER_FRAME = 64;
const wallNext = e => { const b = C.bug.get(e); return random() < statLin(b, "int", .5, .05) && think(e, walkOf(b)[5]) || decide(e) };
// end of a walk (timer, or the turn after a wall or a stuck check): dung dance (30 %), else f
const danceOr = (e, f) => "dance" === walkOf(C.bug.get(e))[7] && random() < .3 ? (C.walk.get(e).dance = 2, danceTurn(e)) : f(e),
walkEnd = e => { const t = C.walk.get(e), w = "walking" === t.act && t.ws; w ? danceOr(e, () => think(e, w[5])) : think(e) },
danceTurn = e => (C.walk.get(e).turnA = norm(C.pos.get(e).dir + (C.walk.get(e).dg ||= rsign()) * (PI - 1e-6)), setAct(e, "turning"));
// new free walk by style; keep = same direction (after the dance); the stuck check starts here
function walkGo(e, keep) {
const t = C.walk.get(e), p = C.pos.get(e), w = walkOf(C.bug.get(e)), m = Array.isArray(w[7]) && random() < .5 ? w[7] : w;
setAct(e, "walking", rf(m[1], m[2])), t.ws = w, t.wn = m[3], t.dance = t.dg = 0, t.frzMs = 0, t.lastX = p.x, t.lastY = p.y, "sg" === w[7] && (t.sgT = rf(300, 800));
keep ? C.vel.get(e).wanderAngle = p.dir : newDir(e, w[4] * DEG)
}
const facing = (p, a) => max(0, cos(a - p.dir));
const busy = t => t.pair || t.dropStuck;
function decide(e) {
const b = C.bug.get(e), t = C.walk.get(e);
if (t.turnA != null) return setAct(e, "turning");
if (combatState || hpFrac(b) < 1 || random() < .7) return walkGo(e);
setAct(e, RARE_ACT[b.int > 4 ? ri(hasAbil(b, "flanking") ? 4 : 3) : 0], RARE_MIN + random() * RARE_SPAN), t.rareA = PI / 3, t.rareS = rsign(), t.rareE = null
}
function sysSteer(dt, ents) {
const dtS = dt / 1e3, foods = ecsQuery("food", "pos"), obs = ecsQuery("obstacle", "pos");
ents.forEach(e => {
const t = C.walk.get(e),
b = C.bug.get(e),
p = C.pos.get(e),
v = C.vel.get(e),
tu = "turning" === t.act,
ru = "rushing" === t.act;
if (!tu && !ru && "walking" !== t.act || t.slide != null) return;
if (busy(t)) return void(t.frzMs = 0, t.lastX = p.x, t.lastY = p.y);
if (tu) return void(turnToward(e, t.turnA, turningOf(b) * dtS, t.dance ? "dung" : 1) && (v.wanderAngle = p.dir, t.turnA = null, t.dance ? --t.dance ? danceTurn(e) : walkGo(e, 1) : danceOr(e, wallNext)));
if ("sg" === t.ws?.[7] && (t.sgS > 0 || (t.sgT -= dt) <= 0)) {
t.sgS > 0 || (t.sgS = rf(150, 300), t.sgT = rf(300, 800), t.sgA = norm(p.dir + rsign() * rf(0, PI / 4)));
t.sgA != null && turnToward(e, t.sgA, turningOf(b) * dtS, "tiger") && (t.sgA = null);
(t.sgS = max(t.sgS - dt, +(t.sgA != null))) > 0 || (v.wanderAngle = p.dir, v.tw = null, v.tk = 0);
return
}
if ((t.frzMs = (t.frzMs || 0) + dt) >= STUCK_CHECK_MS) {
const stuck = hypot(p.x - (t.lastX ?? p.x), p.y - (t.lastY ?? p.y)) < bugLen(b);
t.frzMs = 0, t.lastX = p.x, t.lastY = p.y;
if (stuck) return t.frzSide = t.frzSide || rsign(), t.turnA = norm(p.dir + t.frzSide * rf(HALF_PI, PI)), void setAct(e, "turning");
t.frzSide = 0
}
const fT = hurt(e) ? seenFood(b, p, foods) : null;
if (fT) {
const want = atan2(fT.y - p.y, fT.x - p.x);
ru || setAct(e, "rushing"), turnToward(e, want, turningOf(b) * dtS), (t.rushK = RUSH * facing(p, want)) || (t.frzMs = 0);
return
}
if (ru) return void decide(e);
v.angVel += .9 * (t.ws ? t.wn : 1) * (random() - .5) * dtS, v.angVel *= .95, v.wanderAngle += v.angVel;
if (combatState && t.seekX == null) {
const fx = p.x / boxLW, fy = p.y / boxLH, r = (t.mid ? PULL_WEAK : PULL_STRONG) * dtS;
(!t.mid || min(fx, 1 - fx, fy, 1 - fy) < WALL_NEAR) && (v.wanderAngle += clamp(norm(atan2(boxLH / 2 - p.y, boxLW / 2 - p.x) - v.wanderAngle), -r, r))
}
let vx = cos(v.wanderAngle),
vy = sin(v.wanderAngle);
[vx, vy] = rockAvoid(p, vx, vy, obs);
turnToward(e, atan2(vy, vx), turningOf(b) * dtS)
})
}
const hurt = e => { const b = C.bug.get(e), c = C.combat.get(e); return !(c && c.dead) && (c || b).curHp < maxHpOf(b) };
function seenFood(b, p, foods = ecsQuery("food", "pos")) {
let fT = null, fD2 = 1 / 0;
foods.forEach(fe => {
const fp = C.pos.get(fe), dx = fp.x - p.x, dy = fp.y - p.y, d2 = dx * dx + dy * dy;
d2 < fD2 && seesPoint(b, p, fp.x, fp.y) && (fD2 = d2, fT = fp)
});
return fT
}
function sysFeed() {
const foods = ecsQuery("food", "pos"), bugs = ecsQuery("bug", "pos", "walk");
foods.forEach(fe => {
const fp = C.pos.get(fe);
for (const be of bugs) {
const bp = C.pos.get(be), b = C.bug.get(be);
if (hurt(be) && hypot(bp.x - fp.x, bp.y - fp.y) < 16) {
const h = C.combat.get(be) || b, mx = maxHpOf(b);
h.curHp = min(mx, h.curHp + mx / 5 * (hasAbil(b, "glutton") ? (h !== b && abilShow(h, "glutton"), 2) : 1));
combatState || think(be);
achieve("feed"), combatState && achieve("feedFight"), 1 === C.team.get(be).team && achieve("fedEnemy"), achStep("fed", [10, 50], "fed"), ecsKill(fe);
break
}
}
})
}
// Bark Shelter (obstacle.sh): a resting bug touching it heals 1 HP/s in the peaceful box
const sysShelter = (dtS, bugs) => eachObstacle((o, _, oe) => o.sh && bugs.forEach(be => {
const b = C.bug.get(be), p = C.pos.get(be), c = obstCap(oe, p.x, p.y);
["thinking", "waiting", "observing"].includes(C.walk.get(be).act) && c[0] < c[3] + bugLen(b) / 2 && (b.curHp = min(maxHpOf(b), b.curHp + dtS))
}));
const ROCK_PAD = 20, ROCK_FORCE = 2.5;
// Point vs obstacle capsule (OBST_CAP turned by rot): [distance to the core segment, unit direction x, y, capsule radius]
function obstCap(oe, x, y) {
const p = C.pos.get(oe), o = C.obstacle.get(oe), [cx, cy, a, h, w] = capOf(o.kind)[o.v], r = o.r, co = cos(o.rot), so = sin(o.rot), c = cos(a + o.rot), s = sin(a + o.rot),
mx = p.x + r * (cx * co - cy * so), my = p.y + r * (cx * so + cy * co), t = clamp((x - mx) * c + (y - my) * s, -h * r, h * r),
dx = x - mx - c * t, dy = y - my - s * t, d = hypot(dx, dy) || .001;
return [d, dx / d, dy / d, w * r]
}
function rockAvoid(p, vx, vy, obs) {
obs.forEach(oe => {
const [d, nx, ny, cr] = obstCap(oe, p.x, p.y), rr = cr + ROCK_PAD;
if (d < rr) { const f = ROCK_FORCE * (rr - d) / rr; vx += nx * f, vy += ny * f }
});
return [vx, vy]
}
function sysMove(dtS, ents) {
const corpses = ents.filter(en => { const c = C.combat.get(en); return c && c.dead });
const slowOf = (e, p) => corpses.some(oe => oe !== e && hypot(C.pos.get(oe).x - p.x, C.pos.get(oe).y - p.y) < bugRadius(C.bug.get(oe))) ? CORPSE_SLOW : 1;
ents.forEach(e => {
const t = C.walk.get(e),
b = C.bug.get(e),
p = C.pos.get(e),
cb = C.combat.get(e);
if (cb && cb.dead) return;
const slow = corpses.length ? slowOf(e, p) : 1, m = bugRadius(b);
if (cb && aiAct(t)) {
let moved = 0;
if (cb.mvSpd) {
const step = cb.mvSpd * dtS * slow;
let ax = cos(cb.mvA), ay = sin(cb.mvA), wk = cb.backflipT > 0 ? 0 : -1;
(p.x <= m && ax < 0 || p.x >= boxLW - m && ax > 0) && (ax *= wk);
(p.y <= m && ay < 0 || p.y >= boxLH - m && ay > 0) && (ay *= wk);
p.x += ax * step, p.y += ay * step, moved = 1
}
if (cb.imX || cb.imY) { const lim = bugLen(b) * 2; p.x += clamp(cb.imX || 0, -lim, lim), p.y += clamp(cb.imY || 0, -lim, lim), cb.imX = 0, cb.imY = 0, moved = 1 }
cb.mvSpd = 0;
if (moved) clampToBox(e);
return
}
const ru = "rushing" === t.act;
if (busy(t) || !ru && ("walking" !== t.act || t.sgS > 0)) return;
const spd = spdOf(b) * slow * (ru ? t.rushK : wsOf(t)[0]);
if (t.slide != null) {
if ((abs(sin(t.slide)) > .5 ? (p.x < boxLW / 2 ? -1 : 1) * cos(p.dir) : (p.y < boxLH / 2 ? -1 : 1) * sin(p.dir)) > 0) {
const st = spd * dtS * cos(p.dir - t.slide);
p.x += cos(t.slide) * st, p.y += sin(t.slide) * st, clampToBox(e)
} else wallNext(e);
return
}
const nx = p.x + cos(p.dir) * spd * dtS,
ny = p.y + sin(p.dir) * spd * dtS,
hitX = nx < m || nx > boxLW - m,
hitY = ny < m || ny > boxLH - m;
if (!ru && (hitX || hitY)) {
const sx = hitX && (!hitY || random() < .5), n = sx ? nx < m ? 0 : PI : ny < m ? HALF_PI : -HALF_PI;
t.slide = sx ? sin(p.dir) >= 0 ? HALF_PI : -HALF_PI : cos(p.dir) >= 0 ? 0 : PI;
t.actT *= SLIDE_K, t.turnA = t.slide + sign(norm(n - t.slide)) * random() * HALF_PI;
return
}
p.x = nx, p.y = ny, clampToBox(e)
});
}
function sepPair(a, b) {
const ca = C.combat.get(a), cb = C.combat.get(b);
if (ca && cb && (ca.grabTarget === b || cb.grabTarget === a)) return 0;
return bugRadius(C.bug.get(a)) + bugRadius(C.bug.get(b))
}
const RESOLVE_MAX = 60;
const SEP_FIGHT_MULT = 4;
const UNSTICK_ACC = 90;
const STUCK_GIVE_UP = 2000;
function resolveBodies(ents, step) {
for (let i = 0; i < ents.length; i++)
for (let j = i + 1; j < ents.length; j++) {
const ca = C.combat.get(ents[i]),
cbb = C.combat.get(ents[j]);
if ([ca, cbb].some(c => c && (c.dead || c.airT > 0))) continue;
if ("breeding" === C.walk.get(ents[i]).act && "breeding" === C.walk.get(ents[j]).act) continue;
const minD = sepPair(ents[i], ents[j]),
a = C.pos.get(ents[i]),
c = C.pos.get(ents[j]),
dx = c.x - a.x,
dy = c.y - a.y,
dist = hypot(dx, dy) || .001,
ba = C.bug.get(ents[i]),
bb = C.bug.get(ents[j]);
C.vel.get(ents[i]).v > C.vel.get(ents[j]).v * 1.2 && dist < morphR(ba) + morphR(bb) && ecsFront(ents[i]);
if (minD <= 0 || dist >= minD) continue;
const ov = minD - dist,
nx = dx / dist,
ny = dy / dist;
const fast = combatState && [ents[i], ents[j]].some(x => aiAct(C.walk.get(x))),
h = min(ov / 2, step * (fast ? SEP_FIGHT_MULT : 1));
a.x -= nx * h, a.y -= ny * h, c.x += nx * h, c.y += ny * h
}
}
function resolveObstacles(ents, dtS) {
const obs = ecsQuery("obstacle", "pos");
ents.forEach(e => {
if (drag && drag.e === e) return;
const dcb = C.combat.get(e);
if (dcb && dcb.dead) return;
const p = C.pos.get(e), t = C.walk.get(e);
let ox = 0, oy = 0, deep = 0;
obs.forEach(oe => {
const [d, nx, ny, cr] = obstCap(oe, p.x, p.y), minD = cr + bugLen(C.bug.get(e)) / 2;
if (d >= minD) return;
ox += nx, oy += ny, deep = max(deep, minD - d)
});
if (deep <= 0) return void(t.pushV = 0, t.dropStuck = 0, t.stuckMs = 0);
t.dropStuck && (t.stuckMs = (t.stuckMs || 0) + 1e3 * dtS) > STUCK_GIVE_UP && (t.dropStuck = 0);
let len = hypot(ox, oy);
if (len < .001) ox = cos(p.dir), oy = sin(p.dir), len = 1;
t.pushV = min(RESOLVE_MAX, (t.pushV || 0) + UNSTICK_ACC * dtS);
const st = min(deep, t.pushV * dtS);
p.x += ox / len * st, p.y += oy / len * st;
const wx = p.x, wy = p.y;
clampToBox(e);
(p.x !== wx || p.y !== wy) && (p.x -= oy / len * st, p.y += ox / len * st, clampToBox(e))
})
}
function clampToBox(e) {
const p = C.pos.get(e), v = C.vel.get(e), m = bugRadius(C.bug.get(e));
isFinite(p.x + p.y) || (p.x = v.lx ?? m, p.y = v.ly ?? m);
p.x = clamp(p.x, m, boxLW - m), p.y = clamp(p.y, m, boxLH - m)
}
function sysResolve(ents, dtS) {
const step = RESOLVE_MAX * (dtS || COMBAT_STEP_MS / 1e3);
resolveBodies(ents, step);
resolveObstacles(ents, dtS);
ents.forEach(e => {
clampToBox(e);
const p = C.pos.get(e), v = C.vel.get(e), t = C.walk.get(e);
combatState && v.lx != null && (p.x - boxLW / 2) * (v.lx - boxLW / 2) <= 0 && abs(p.y / boxLH - .5) <= .25 && (t.mid = 1);
v.v = hypot(p.x - (v.lx ?? p.x), p.y - (v.ly ?? p.y)), v.lx = p.x, v.ly = p.y;
t.top && drag?.e !== e && !ents.some(o => o !== e && hypot(C.pos.get(o).x - p.x, C.pos.get(o).y - p.y) < engageDistOf(C.bug.get(o)) + bugRadius(C.bug.get(e))) && (t.top = 0)
})
}
const SHADE_FLAT = "rgba(0,0,0,.35)";
let flatCx = null, flatCol;
function sysRenderObstacles(top) {
const nl = 3 === bugTheme;
eachObstacle((o, p, e) => {
if ((drag?.e === e) !== top) return;
const d = OBST[o.kind][1];
for (const f of nl ? [0] : [1, 0]) {
boxCx.save(), boxCx.translate(p.x + 2 * f, p.y + 2.5 * f), boxCx.rotate(o.rot);
(flatCol = f ? SHADE_FLAT : nl && morphColor(47 * o.kind)) ? (flatCx || (flatCx = new Proxy(boxCx, {
get: (t, k) => { const val = t[k]; return "function" == typeof val ? val.bind(t) : val },
set: (t, k, val) => (t[k] = "fillStyle" === k || "strokeStyle" === k ? flatCol : val, !0)
})), boxCx.fillStyle = boxCx.strokeStyle = boxCx.shadowColor = flatCol, boxCx.shadowBlur = 8 * nl, d(flatCx, o.r, o.v)) : d(boxCx, o.r, o.v);
boxCx.restore()
}
})
}
const RARE_MIN = 3000, RARE_SPAN = 5000, RARE_GAP = 2, RARE_ACT = ["waiting", "observing", "stalking", "flankTraining"];
function sysRareAct(dt, ents) {
const dtS = dt / 1e3;
ents.forEach(e => {
const b = C.bug.get(e), p = C.pos.get(e), t = C.walk.get(e);
if (RARE_ACT.indexOf(t.act) < 1 || t.pair) return;
if (hpFrac(b) < 1) return void think(e);
const fl = "flankTraining" === t.act;
if (t.rareE == null) {
const tg = (fl ? [...ecsQuery("obstacle", "pos"), ...ecsQuery("food", "pos")] : ents.filter(o => o !== e)).find(o => seesPoint(b, p, C.pos.get(o).x, C.pos.get(o).y));
if (tg == null) {
const s = min(t.rareA, turningOf(b) * dtS);
return void(p.dir = norm(p.dir + t.rareS * s), (t.rareA -= s) <= 0 && setAct(e, "waiting", t.actT))
}
const op = C.pos.get(tg);
t.rareE = tg, t.rareX = op.x, t.rareY = op.y, fl && (t.rareS = rsign(), t.rareR = 0, t.actT = 8e3)
}
if (!C.pos.has(t.rareE)) return void think(e);
const op = C.pos.get(t.rareE), a = atan2(op.y - p.y, op.x - p.x), d = hypot(op.x - p.x, op.y - p.y);
turnToward(e, a, turningOf(b) * dtS);
if (fl) {
if (hypot(op.x - t.rareX, op.y - t.rareY) > 2) return void think(e);
if (t.rareR) {
const w = spdOf(b) * dtS / t.rareR, th = a + PI + t.rareS * w;
if ((t.rareA -= w) <= 0) return void think(e);
p.x = op.x + cos(th) * t.rareR, p.y = op.y + sin(th) * t.rareR, p.dir = norm(th + PI)
} else {
const s = spdOf(b) * RUSH * facing(p, a) * dtS;
d - s > flankRange(b) + (C.obstacle.get(t.rareE)?.r || 0) ? (p.x += cos(p.dir) * s, p.y += sin(p.dir) * s) : (t.rareR = max(d, bugRadius(b) + 10), t.rareA = 3 * PI, t.actT = RARE_MIN + random() * RARE_SPAN)
}
} else {
if ("stalking" !== t.act || d <= bugLen(b) * RARE_GAP) return;
const s = min(spdOf(C.bug.get(t.rareE)), spdOf(b)) * dtS;
p.x += cos(p.dir) * s, p.y += sin(p.dir) * s
}
clampToBox(e)
})
}
const SEEK_REACH = 40;
function sysGoToPoint(ents) {
ents.forEach(e => {
const p = C.pos.get(e), v = C.vel.get(e), t = C.walk.get(e);
if (t.seekX == null) return;
if (hypot(t.seekX - p.x, t.seekY - p.y) < SEEK_REACH) return void(t.seekX = t.seekY = null);
v.wanderAngle = atan2(t.seekY - p.y, t.seekX - p.x), v.angVel = 0
})
}
