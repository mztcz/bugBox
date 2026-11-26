const WALK_MIN = 500, WALK_MAX = 1e4;
function setAct(e, act, ms = 1 / 0) {
const t = C.walk.get(e);
return t.slide = null, t.act = act, t.actT = ms
}
const intMs = e => statLin(C.bug.get(e), "int", 5e3, 500);
const think = (e, k = 1) => setAct(e, "thinking", k * intMs(e) + rf(-250, 250));
const aiAct = t => "fighting" === t.act || "fleeing" === t.act;
const newDir = e => C.vel.get(e).wanderAngle = C.pos.get(e).dir + rsign() * rf(0, TAU / 3);
const SN = ["CON", "STR", "ARM", "AGI", "INT", "PER"];
let dzAnim = 0,
money = 500,
bugsOwned = [],
bid = 1,
fightTeam = [],
fightMode = 1,
enemyTier = 0,
dev = 0,
statCap = 5,
tierMax = 0,
obstKinds = [0, 1],
inv = {}, armed = {}, boxLv = 0, trophy = 0,
labSt = newLab();
const tierOpen = T => T <= tierMax, lockAttr = (T, c) => ` style="${tierOpen(T) ? "" : "opacity:.3;"}${c && TIER_COL[T] ? "border-color:" + TIER_COL[T] : ""}"`,
tierGate = T => T > 5 || tierOpen(T) || dev || void(SFX.lock(), toast("Defeat tier boss to open"));
function newLab() { return { phase: "pick", pA: null, pB: null, larva: null } }
const MODES = [1, 2, 3, 6, "boss", "mayhem", "chaos", "mc", "rb", "wb"],
ri = n => floor(random() * n),
rf = (a, b) => a + random() * (b - a),
clamp = (v, a, b) => max(a, min(b, v)),
lerp = (a, b, k) => a + (b - a) * k,
rsign = () => random() < .5 ? -1 : 1,
ownedById = id => bugsOwned.find(b => b.id === id),
bugsHome = () => bugsOwned.filter(b => !b.away),
fmtT = ms => { const d = floor(ms / 100), p = n => String(n).padStart(2, "0"); return p(floor(d / 600)) + ":" + p(floor(d / 10) % 60) + "." + d % 10 };
// ip = turn in place (no forward move): runs turnIP (move.js) unless Dev Settings Turn = Old
function turnToward(e, want, step, ip) {
const p = C.pos.get(e), v = C.vel.get(e), d = norm(want - p.dir);
step *= v.tk ||= rf(.9, 1.1);
if (ip && turnMode !== "old") return turnIP(e, d, step) && !(v.tk = 0, v.tw = null);
return v.tw = null, abs(d) <= step ? (p.dir = norm(want), v.tk = 0, !0) : (p.dir = norm(p.dir + sign(d) * step), !1)
}
function norm(a) { a %= TAU; return a > PI ? a - TAU : a < -PI ? a + TAU : a }
function hidpi(canvas, w, h) {
const dpr = window.devicePixelRatio || 1;
canvas.width = round(w * dpr), canvas.height = round(h * dpr), canvas.style.width = w + "px", canvas.style.height = h + "px";
const ctx = canvas.getContext("2d");
return ctx.setTransform(dpr, 0, 0, dpr, 0, 0), ctx
}
// Saved game (one game): key bugbox_save, format SAVE_VER; gameOn = intro left (saving allowed). In a fight the save keeps fight HP and dead, loading applies them like Leave
const SAVE_KEY = "bugbox_save", SAVE_VER = 4, saveOk = s => s?.v === SAVE_VER && Array.isArray(s.bugs);
let gameOn = 0;
const gameSnap = () => ({ v: SAVE_VER, dev, money, bid, fightNum, tierMax, statCap, obstKinds, achSt, run, bugs: bugsOwned, world: savedWorld || worldSnap(), bosses: Object.fromEntries(Object.entries(bosses).filter(([k]) => "w" !== k[0])), sci: [scienceOn, sciSt], set: [[sound.sfx, sound.mus, sound.mv], bgOn, bugTheme, gait, palette], items: [inv, armed, boxLv, trophy],
fight: combatState && { T: enemyTier, d: fightDone, f: bugsInBoxView().filter(f => 0 === f.team && !C.combat.get(f.eid).buried).map(f => ({ b: { id: f.b.id }, curHp: f.curHp, killsThis: f.killsThis, dead: f.dead })) } });
function saveGame() { try { gameOn && (wbKeep(), localStorage.setItem(SAVE_KEY, JSON.stringify(gameSnap()))) } catch (e) {} }
function dropSave(bad) { try { gameOn = 0, bad && localStorage.setItem(SAVE_KEY + "_bad", bad), localStorage.removeItem(SAVE_KEY) } catch (e) {} }
const newGame = ask => (!ask || confirm("Restart game?")) && (dropSave(), location.reload());
function loadGame(s) {
({ dev, money, bid, fightNum, tierMax, statCap, obstKinds, achSt, bugs: bugsOwned, world: savedWorld } = s);
Object.assign(run, s.run), Object.assign(bosses, s.bosses), Object.values(bosses).forEach(b => b.id = bid++), scienceOn = s.sci[0], s.sci[1].forEach((o, i) => Object.keys(sciSt[i]).forEach(k => k in o && (sciSt[i][k] = o[k])));
s.set && ([sound.sfx, bgOn, bugTheme, gait, palette] = s.set, sound.sfx.length ? [sound.sfx, sound.mus, sound.mv] = sound.sfx : sound.sfx = sound.sfx ? .8 : 0), s.items && ([inv, armed, boxLv, trophy] = s.items);
const F = s.fight;
F && (fxEnd(), enemyTier = F.T, F.d || achieve("abandon"), dev && bugsOwned.forEach(b => b.mated = 0), F.f.forEach(f => { const b = ownedById(f.b.id); b && !f.dead && (b.curHp = max(1, round(f.curHp))) }), buryDead(F.f.filter(f => f.dead)))
}
