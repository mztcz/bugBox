const RECORDS0 = { games: 0, kills: 0, fights: 0, wins: 0, maxBugs: 0, bestKill: 0, bestName: "\u2014", bestSum: 0, bestSumName: "\u2014", longestDynasty: 0, fN: 0, fSum: 0, fMin: 0, fMax: 0 };
const records = { ...RECORDS0 }, run = { ...RECORDS0, games: 1 }, RECS = [records, run];
try { const s = localStorage.getItem("bugbox_records"); s && Object.assign(records, JSON.parse(s)) } catch (e) {}
function saveRecords() { try { localStorage.setItem("bugbox_records", JSON.stringify(records)) } catch (e) {} }
records.games++, saveRecords();
let achSt = { done: {}, own: 0, ownMax: 0, fed: 0, bought: 0, kills: 0, wins: 0, streak: 0, bred: 0, lost: 0, hatched: 0, scared: 0 };
const TUTORIAL = [
["own", "own a bug"],
["feed", "feed a bug"],
["drag", "drag a bug"],
["inspect", "inspect a bug"],
["breed", "breed a bug"],
["mate", "mate a bug"],
["find", "find a bug"],
["kill", "kill a bug"],
["fight", "fight a bug"],
["feedFight", "feed a fighting bug"],
["scare", "scare a fighting bug"],
["dragObst", "drag an obstacle"],
["rotObst", "rotate an obstacle"]
];
const ACHIEVEMENTS = [
// must stay the first entry: the tutorial checks it and fires confetti from its tick
["tutorial", "tutorial walkthrough"],
["own10", "own 10 bugs (at the same time)"],
["own50", "own 50 bugs"],
["own75", "own 75 bugs"],
["own100", "own 100 bugs"],
["gen5", "produce 5 generations"],
["gen10", "produce 10 generations"],
["gen15", "produce 15 generations"],
["gen20", "produce 20 generations"],
["gen25", "produce 25 generations"],
["gen30", "produce 30 generations"],
["gen33", "produce 33 generations"],
["heavy", "breed a heavy bug (con 5+)"],
["strong", "breed a strong bug (str 5+)"],
["fast", "breed a fast bug (agi 5+)"],
["aware", "breed an aware bug (per 5+)"],
["clever", "breed a clever bug (int 5+)"],
["weak", "breed a weak bug (stat sum 5)"],
["powerful", "breed a powerful bug (stat sum 20+)"],
["superior", "breed a superior bug (stat sum 30+)"],
["elite", "breed an elite bug (stat sum 40+)"],
["fiveStars", "breed a five-star bug (stat sum 50)"],
["newTier", "breed a bug of a higher tier than both parents"],
...[1, 2, 3, 4, 5].map(T => ["ownT" + T, `own a T${T} bug`]),
...[2, 3, 4, 5].flatMap(T => [1, 2, 3, 4].map(n => [`t${T}s${n}`, `own a T${T} ${"★".repeat(n)} bug`])),
["skilled", "breed a skilled bug (1 ability)"],
["skilful", "breed a skilful bug (2 abilities)"],
["expert", "breed an expert bug (3 abilities)"],
["master", "breed a master bug (4 abilities)"],
...[1, 2, 3, 4, 5].map(t => ["tier" + t, "win at tier " + t]),
["win1", "win 1 v 1"],
["win2", "win 2 v 2"],
["win3", "win 3 v 3"],
["win6", "win 6 v 6"],
["winmayhem", "win mayhem"],
...Object.entries({ mc: "mortal combat", boss: "boss fight", rb: "raid boss", wb: "world boss" }).flatMap(([m, n]) => Array.from({ length: 5 }, (_, i) => [m + (i + 1), `beat ${n} T${i + 1}`])),
["tough", "create a tough bug (survived 5 combats)"],
["rough", "create a rough bug (survived 10 combats)"],
["veteran", "create a veteran bug (survived 15 combats)"],
["hero", "create a hero bug (survived 20 combats)"],
["legendary", "create a legendary bug (survived 30 combats)"],
["fed10", "feed bugs 10 times"],
["fed50", "feed bugs 50 times"],
["fedEnemy", "feed an enemy bug"],
["scared5", "scare 5 bugs"],
["scare5x", "scare a bug 5 times in one combat"],
["terrify", "terrify a bug (10 scares in one combat)"],
["ptsd", "PTSD a bug (15 scares in one combat)"],
["hatch1", "hatch an egg in the box"],
["hatch10", "hatch 10 eggs"],
["buy10", "buy 10 bugs on the market"],
["buy25", "buy 25 bugs on the market"],
["rich1k", "hold $1000 at once"],
["rich5k", "hold $5000 at once"],
["kill10", "kill 10 enemy bugs"],
["kill50", "kill 50 enemy bugs"],
["kill100", "kill 100 enemy bugs"],
["win5", "win 5 fights"],
["win25", "win 25 fights"],
["win50", "win 50 fights"],
["streak5", "win 5 fights in a row"],
["flawless", "win a fight without losing a bug"],
["lastStand", "win a fight with one bug left"],
["lost1", "lose a bug in combat"],
["lost5", "lose 5 bugs in combat"],
["lost10", "lose 10 bugs in combat"],
["lost25", "lose 25 bugs in combat"],
["lost50", "lose 50 bugs in combat"],
["lostM3", "lose 3 bugs in one match"],
["lostM6", "lose 6 bugs in one match"],
["lostM9", "lose 9 bugs in one match"],
["lostM15", "lose 15 bugs in one match"],
["lostM20", "lose 20 bugs in one match"],
["bred10", "breed 10 bugs"],
["bred50", "breed 50 bugs"],
["allFive", "breed a bug with every stat 5+"],
["statTen", "breed a bug with a stat at 10"],
["perfect", "breed a perfect bug (all records 10)"],
["cull", "cull a bug in the lab"],
["science", "turn on Science mode"],
["abandon", "abandon a fight"],
["breeder10", "good breeder (10 different abilities in your bugs)"],
["breeder20", "master breeder (every ability in your bugs)"],
["elite4", "own 3 bugs with 4 abilities each"],
["fullBox", "fill the box (100 bugs and eggs)"],
["matedAll", "have every bug mated in one round"],
["playboy", "Playboy (a bug with 5 offspring)"],
["familyMan", "Family Man (a bug with 10 offspring)"],
["rabbit", "Rabbit (a bug with 15 offspring)"],
["genghisKhan", "Genghis Khan (a bug with 20 offspring)"]
];
const TUT_K = new Set(TUTORIAL.map(a => a[0]));
const ACH_TEXT = {};
[...TUTORIAL, ...ACHIEVEMENTS].forEach(([k, t]) => ACH_TEXT[k] = t);
function achieve(k) {
if (!ACH_TEXT[k] || achSt.done[k]) return;
achSt.done[k] = 1, TUT_K.has(k) || toast("Achieved: " + ACH_TEXT[k])
}
function achAt(x, marks, pre) { marks.forEach(m => { const [v, a] = pre ? [m, pre + m] : m; x >= v && achieve(a) }) }
function achStep(field, marks, prefix, add) {
achSt[field] += add == null ? 1 : add; achAt(achSt[field], marks, prefix)
}
function achOwn(added) {
added && (achSt.own += added), achSt.ownMax = max(achSt.ownMax, bugsOwned.length);
RECS.forEach(r => {
r.maxBugs = max(r.maxBugs, bugsOwned.length);
bugsOwned.forEach(b => {
(b.killsTotal || 0) > r.bestKill && (r.bestKill = b.killsTotal, r.bestName = b.name);
const s = round(statSum(b));
s > r.bestSum && (r.bestSum = s, r.bestSumName = b.name)
})
}), saveRecords();
bugsOwned.length && achieve("own"), achSt.ownMax >= 10 && achieve("own10"),
achAt(achSt.own, [50, 75, 100], "own");
const kinds = new Set;
bugsOwned.forEach(b => (b.abilities || []).forEach(a => kinds.add(a)));
kinds.size >= 10 && achieve("breeder10"), kinds.size >= ABIL_IDS.length && achieve("breeder20");
bugsOwned.filter(b => (b.abilities || []).length >= 4).length >= 3 && achieve("elite4");
boxFull() && achieve("fullBox");
bugsOwned.length > 1 && bugsOwned.every(b => b.mated) && achieve("matedAll")
}
function achKids(...parents) {
parents.forEach(p => {
if (!p) return;
p.kids = (p.kids || 0) + 1;
achAt(p.kids, [[5, "playboy"], [10, "familyMan"], [15, "rabbit"], [20, "genghisKhan"]])
})
}
function achBug(b) {
const s = statSum(b), T = tierOf(s), n = starsOf(s);
achieve("ownT" + T), n > 4 ? achieve("fiveStars") : n && achieve(`t${T}s${n}`)
}
function achChild(b, pT) {
achBug(b), tierOf(statSum(b)) > pT && achieve("newTier"), achieve("breed"), achStep("bred", [10, 50], "bred");
const sum = statSum(b),
na = (b.abilities || []).length;
[["con", "heavy"], ["str", "strong"], ["agi", "fast"], ["per", "aware"], ["int", "clever"]].forEach(([k, a]) => b[k] >= 5 && achieve(a));
sum <= 5 && achieve("weak");
achAt(sum, [[20, "powerful"], [30, "superior"], [40, "elite"]]);
achAt(na, [[1, "skilled"], [2, "skilful"], [3, "expert"], [4, "master"]]);
SK.every(k => b[k] >= 5) && achieve("allFive"),
SK.some(k => b[k] >= 10) && achieve("statTen"),
SK.every(k => b[k] >= 10) && achieve("perfect")
}
function achSurvive(b) {
achAt(b.fights || 0, [[5, "tough"], [10, "rough"], [15, "veteran"], [20, "hero"], [30, "legendary"]])
}
function achFight(won, lost, alive) {
achieve("fight");
lost && achStep("lost", [1, 5, 10, 25, 50], "lost", lost);
achAt(lost, [3, 6, 9, 15, 20], "lostM");
RECS.forEach(r => (r.fMin = r.fN++ ? min(r.fMin, fightMs) : fightMs, r.fMax = max(r.fMax, fightMs), r.fSum += fightMs, r.fights++, won && r.wins++)), saveRecords();
if (!won) return void (achSt.streak = 0);
achieve("tier" + enemyTier), achieve("win" + fightMode), achieve(fightMode + enemyTier);
achSt.streak++, achStep("wins", [5, 25, 50], "win"),
achSt.streak >= 5 && achieve("streak5"), lost || achieve("flawless"), 1 === alive && achieve("lastStand")
}
function achList(list) {
return list.map(([k, t]) => `<div style="color:${achSt.done[k]?"#44ff88":"#445566"};">${achSt.done[k]?"\u2714":"\u2610"} ${t}</div>`).join("")
}
function renderTutorial() { $("itab-tut").innerHTML = achList(TUTORIAL) }
function renderAchievements() {
$("itab-ach").innerHTML = `<div style="color:#ffdd44;margin-bottom:6px;">${ACHIEVEMENTS.filter(([k])=>achSt.done[k]).length} / ${ACHIEVEMENTS.length}</div>` + achList(ACHIEVEMENTS)
}
// Tutorial walkthrough (one game, not saved): tutStep 0 = off. Step: d first delay, t() blink targets (selected ones drop out), ok() = go to step "to" or the next one,
// f = forced (only targets react, except the held element p; c(e) extra allowed click, p() element that may be held, x(e) action on any other click), h = flash ms, n = flashes before the next step
let tutStep = 0, tutT = 0, tutN = 0, tutPar = null, tutKid = null, tutTint = null, tutFoc = null, tutMark = null, tutFed = 0;
const scrOn = id => $(id).classList.contains("active"),
kidCard = () => document.querySelector(`.pick-grid .card[data-bid="${tutKid.id}"]`),
allSel = () => TUT[tutStep].t().every(x => x?.matches(".card-sel")),
fightOn = () => combatState && scrOn("s-box"),
TUT = {
2: { f: 1, t: () => [0, 3].map(i => $("mkt-grid").children[i]), ok: allSel },
3: { f: 1, t: () => [$("bt-buy")], ok: () => scrOn("s-box") },
4: { f: 1, t: () => [$("bt-lab")], ok: () => scrOn("s-lab") },
5: { f: 1, t: () => [0, 1].map(i => document.querySelectorAll(".pick-grid .card")[i]), ok: allSel },
6: { f: 1, d: 1e3, t: () => [$("lab-topbar").querySelector("button")], ok: () => "result" === labSt.phase && (tutKid = labSt.larva, tutPar = labSt.pB.con + labSt.pB.str > labSt.pA.con + labSt.pA.str ? labSt.pB : labSt.pA) },
7: { f: 1, t: () => [], x: () => labBack(), ok: () => "pick" === labSt.phase },
8: { f: 1, d: 3e3, h: 1e3, n: 5, t: () => [kidCard()], p: kidCard, ok: () => scrOn("s-box"), to: 10 },
9: { f: 1, t: () => [$("s-lab").querySelector(".bt-box")], p: kidCard, x: e => kidCard().contains(e.target) ? findBug(tutKid, e, 0) : tutBlink(), ok: () => scrOn("s-box") },
10: { f: 1, t: () => [tutPar], c: e => e.target === boxCv && tapHit(...boxPt(e)) === tutPar && !(suppressClick = !1), ok: () => inspected === tutPar },
11: { f: 1, d: 1e3, t: () => [$("bt-boo")], ok: () => scrOn("s-boo") },
12: { f: 1, t: () => { const c = document.querySelector(`#boo-grid .card[data-bid="${tutPar.id}"]`); return [c?.classList.contains("card-sel") ? $("bt-combat") : c] }, ok: fightOn },
13: { t: () => [], ok: () => scrOn("s-boo") },
14: { f: 1, t: () => [$("bt-combat")], ok: fightOn, to: 13 },
15: { h: 1e3, t: () => scrOn("s-box") && !combatState ? [foodFlash] : [], ok: () => tutFed },
16: { t: () => scrOn("s-box") && !combatState ? [$("bt-inf")] : [], ok: () => !combatState && "flex" === $("ov-inf").style.display },
17: { t: () => [document.querySelector('.info-tab[data-tab="ach"]')], ok: () => "" === $("itab-ach").style.display }
};
const tutTargets = () => TUT[tutStep].t().filter(x => x && !x.matches?.(".card-sel,.prim")),
tutFlash = x => x.nodeType ? flashBlocked(x, TUT[tutStep].h) : x.call ? x() : bugFlash(x),
tutBlink = () => TUT[tutStep].n ? tutFlash(tutTargets()[0]) : tutLoop(0);
function tutGo(n) {
tutStep = n, tutN = 0, clearTimeout(tutT);
if (18 === n) return tutStep = 0, void setTimeout(tutDone, 1e3);
n && (tutLoop(), tutCheck())
}
function tutCheck(re) {
const s = TUT[tutStep];
s && (s.ok() ? tutGo(s.to || tutStep + 1) : re && tutLoop())
}
// wait d, flash each target 1 s apart, wait 3 s (+ flash length), repeat; with n: after n rounds go to the next step
function tutLoop(d = TUT[tutStep].d || 3e3, i = 0) {
clearTimeout(tutT), tutT = setTimeout(() => {
const s = TUT[tutStep], ts = tutTargets();
ts[i] && tutFlash(ts[i]);
++i < ts.length ? tutLoop(1e3, i) : s.n && ++tutN >= s.n ? tutT = setTimeout(() => tutGo(tutStep + 1), s.h) : tutLoop(3e3 + (s.h || 0))
}, d)
}
// bug in the box: red hit flash, then the blue tint + glow drawn by drawHit
const bugHit = b => { const en = entOf(b); return en != null && (C.walk.get(en).hitT = 1) };
function bugFlash(b) { bugHit(b) && (tutTint = { b, at: performance.now() + 200 }) }
// blue food mark: in the front view cone of the wounded fighter tutFoc (cut to the box, off obstacles), else (or if the cone has no room) anywhere in the box
function foodFlash() {
const en = tutFoc && entOf(tutFoc), p = en != null && hpFrac(tutFoc) < 1 && C.pos.get(en);
for (let i = 0; i < 60; i++) {
const c = p && i < 30, a = c && p.dir + rf(-1, 1) * fovHalfOf(tutFoc), d = c && rf(bugLen(tutFoc) + 15, visRangeOf(tutFoc)),
x = c ? p.x + d * cos(a) : rf(8, boxLW - 8), y = c ? p.y + d * sin(a) : rf(8, boxLH - 8);
if (x > 8 && x < boxLW - 8 && y > 8 && y < boxLH - 8 && obstacleAt(x, y) == null) return void(tutMark = { x, y, at: performance.now() })
}
}
// after a tutorial fight: the most wounded surviving player fighter gets the food hint
function tutFought(alive) {
const w = alive.filter(f => f.curHp < f.maxHp).sort((a, b) => a.curHp / a.maxHp - b.curHp / b.maxHp)[0];
tutFoc = w && ownedById(w.b.id), tutGo(15)
}
function tutDone() {
achieve("tutorial"), renderAchievements();
const r = $("itab-ach").children[1].getBoundingClientRect();
r.width && confetti([[r.left, r.left + 11, r.bottom]], 5)
}
function addKills(n) { n > 0 && (RECS.forEach(r => r.kills += n), saveRecords(), achStep("kills", [10, 50, 100], "kill", n)) }
function trackDynasty(gen) {
RECS.forEach(r => r.longestDynasty = max(r.longestDynasty, gen)), saveRecords();
achAt(gen, [5, 10, 15, 20, 25, 30, 33], "gen")
}
