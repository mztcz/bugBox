const INTERACT_CHANCE = .10, BOX_CAP = 100;
const boxFull = () => bugsOwned.length + boxEggs.length >= BOX_CAP;
const MATE_HOLD_MIN = 3000, MATE_HOLD_MAX = 7000, MATE_TURN_MAX = 8000;
let boxEggs = [];
const LOVE_BITE_REACH = 2.5, LOVE_BITE_CONE = 1;
const mateOdds = () => bugsOwned.length <= 3 ? 1 : bugsOwned.length <= 10 ? .5 : .25;
const nibble = (a, y, t = C.bug.get(y)) => (C.walk.get(y).hitT = 1, t.curHp = max(1, (t.curHp == null ? maxHpOf(t) : t.curHp) - statOf(a, "str") * rollVar()));
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
!1 === bug.dead && (boxEggs.push({
x: (sp.x + tp.x) / 2, y: (sp.y + tp.y) / 2,
r: max(bugLen(sb), bugLen(tb)) * .25,
bug,
ready: 0
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
function markEggsReady() { boxEggs.forEach(g => g.ready = 1) }
function hatchReadyEggs() {
const keep = [];
boxEggs.forEach(g => {
if (!g.ready) return void keep.push(g);
const nb = g.bug;
nb.curHp = maxHpOf(nb);
bugsOwned.push(nb), achOwn(1), achChild(nb), achStep("hatched", [1, 10], "hatch");
trackDynasty(nb.gen);
SFX.hatch()
});
boxEggs = keep
}
