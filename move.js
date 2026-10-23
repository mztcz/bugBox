const BASE_WALK = 20, RUSH = 1.25;
const sf        = b => hasAbil(b, "steadfast") ? 2 : 1;
const spdOf     = b => statLin(b, "agi", BASE_WALK, 10 * BASE_WALK) * sf(b);
const turningOf = b => TAU / statLin(b, "agi", 5.99, .5) * sf(b);
const STUCK_CHECK_MS = 2000;
const SLIDE_K = .25;
const CORPSE_SLOW = .5;
const COMBAT_STEP_MS = 16, MAX_STEPS_PER_FRAME = 64;
const wallNext = e => random() < statLin(C.bug.get(e), "int", .5, .05) && think(e) || decide(e);
const facing = (p, a) => max(0, cos(a - p.dir));
const busy = t => t.pair || t.dropStuck;
function decide(e) {
const b = C.bug.get(e), t = C.walk.get(e);
if (t.turnA != null) return setAct(e, "turning");
if (combatState || hpFrac(b) < 1 || random() < .7) return setAct(e, "walking", rf(WALK_MIN, WALK_MAX)), newDir(e);
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
if (tu) return void(turnToward(e, t.turnA, turningOf(b) * dtS) && (v.wanderAngle = p.dir, t.turnA = null, wallNext(e)));
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
v.angVel += .9 * (random() - .5) * dtS, v.angVel *= .95, v.wanderAngle += v.angVel;
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
h.curHp = min(mx, h.curHp + mx / 5);
combatState || think(be);
achieve("feed"), combatState && achieve("feedFight"), 1 === C.team.get(be).team && achieve("fedEnemy"), achStep("fed", [10, 50], "fed"), ecsKill(fe);
break
}
}
})
}
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
if (busy(t) || !ru && "walking" !== t.act) return;
const spd = spdOf(b) * slow * (ru ? t.rushK : 1);
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
const SEEK_REACH = 40, SEEK_CROSS = .45, SEEK_CONE = PI / 3;
function seekPick(t, p) {
for (let i = 0; i < 9; i++) {
const a = p.dir + rf(-SEEK_CONE, SEEK_CONE), d = rf(.25, .5) * boxLW, x = p.x + cos(a) * d, y = p.y + sin(a) * d;
if (x > 40 && x < boxLW - 40 && y > 40 && y < boxLH - 40) return t.seekX = x, t.seekY = y
}
const far = p.x < boxLW / 2;
t.seekX = far ? boxLW * (1 - SEEK_CROSS) + random() * (boxLW * SEEK_CROSS - 40) : 40 + random() * (boxLW * SEEK_CROSS - 40);
t.seekY = 40 + random() * (boxLH - 80)
}
function sysSeek(ents) {
ents.forEach(e => {
const p = C.pos.get(e), v = C.vel.get(e), t = C.walk.get(e);
(t.seekX == null || hypot(t.seekX - p.x, t.seekY - p.y) < SEEK_REACH) && seekPick(t, p);
v.wanderAngle = atan2(t.seekY - p.y, t.seekX - p.x), v.angVel = 0
})
}
