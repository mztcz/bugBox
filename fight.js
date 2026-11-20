const BOSS = { boss: [1.5, 1], rb: [3, 10], wb: [3, 50] }, weekOf = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() - (d.getDay() + 6) % 7).toDateString() };
// fightFx = item effects of the running fight (bet payout, mir = Mirror Shard, slip payout); decoys = decoy bugs of the player team
let bosses = {}, wbWeek = "", match = null, fightFx = {}, decoys = [];
try { const s = JSON.parse(localStorage.getItem("bugbox_wb")); s?.v === SAVE_VER && (wbWeek = s.week, Object.entries(s.bugs).forEach(([k, b]) => bosses[k] = { ...b, id: bid++, role: roleOf(b), abilities: b.abilities.filter(a => ABILITIES[a]) })) } catch (e) {}
function wbKeep() {
if ("wb" !== fightMode || !combatState) return;
ecsQuery("team", "combat").forEach(e => { const c = C.combat.get(e); C.team.get(e).team && (c.dead ? delete bosses["wb" + enemyTier] : C.bug.get(e).curHp = c.curHp) });
try { localStorage.setItem("bugbox_wb", JSON.stringify({ v: SAVE_VER, week: wbWeek, bugs: Object.fromEntries(Object.entries(bosses).filter(([k]) => "w" === k[0])) })) } catch (e) {}
}
function buildEnemies(T) {
const m = BOSS[fightMode], k = fightMode + T, w = weekOf(), c = "chaos" === fightMode;
// tutorial first fight: all stats 1, half HP; CHAOS: player count ±33 %, each enemy tier T±1
if (!m) return Array.from({ length: c ? max(1, round(fightTeam.length * rf(.67, 1.33))) : fightTeam.length }, () => makeBug([12, 14].includes(tutStep) ? { con: 1, str: 1, arm: 1, agi: 1, int: 1, per: 1, hue: rf(0, 45), hpMul: .5, abilities: [] } : { ...genStats(c ? clamp(T + ri(3) - 1, 0, 5) : T), hue: rf(0, 45) }));
wbWeek !== w && (Object.keys(bosses).forEach(x => "w" === x[0] && delete bosses[x]), wbWeek = w);
const S = min(bossSum(T), SK.length * tierLim(T));
if (!bosses[k] || statSum(bosses[k]) !== S) {
const b = bosses[k] = makeBug({ ...genStats(T, S), hue: rf(0, 45), hpMul: m[1], abilities: shuf(ABIL_IDS.slice()).slice(0, min(4, T)) });
["bodyLength", "bodyWidth", "headSize", "legLen"].forEach(x => b.morph[x] *= m[0])
}
return [bosses[k]]
}
const foeN = () => BOSS[fightMode] ? 1 : +fightMode || max(1, fightTeam.length), prizeK = () => (BOSS[fightMode] || [1])[0],
entryFee = (T, n = foeN()) => 1 === fightMode && 0 === T ? 0 : 2 * (T + 1) * tierRate(T) * n;
const keepHp = () => ecsQuery("team", "combat").forEach(e => { const c = C.combat.get(e); C.team.get(e).team || c.dead || (C.bug.get(e).curHp = max(1, round(c.curHp))) });
const lookOf = b => ({ ...Object.fromEntries(SK.map(k => [k, b[k]])), morph: JSON.parse(JSON.stringify(b.morph)), hue: b.hue }),
fxEnd = () => bugsOwned.forEach(b => b.fx?.on && (b.str -= b.fx.d, b.arm -= b.fx.a, delete b.fx));
// foes + bet are given by the Arena Ticket (bet = payout) and by the Magnifier preview (foes only); fight items work in all modes but MC, Mirror Shard and Bounty not in boss modes
function startFight(btn, T, foes, bet) {
const plain = !bet && "mc" !== fightMode, open = plain && !BOSS[fightMode], peek = plain && !foes && armed[11] > 0;
foes ||= open && armed[17] > 0 ? Object.assign(fightTeam.map(b => makeBug({ ...lookOf(b), hue: rf(0, 45), abilities: b.abilities.slice() })), { mir: 1 }) : buildEnemies(T);
// fee by the enemies that come (each at its own tier)
const fee = bet ? 0 : foes.reduce((s, b) => s + entryFee(tierOf(statSum(b)), 1), 0);
if (!dev && money < fee) return void blocked(btn, "Not enough money!");
// Magnifier: enemy cards before the fee is paid
if (peek) { armed[11]--; const d = cardRow(popup(`ENEMIES · ENTRY $${fee}`), foes); return ["⚔ Fight", "← Back"].forEach((t, i) => { const b = document.createElement("button"); b.className = i ? "bt" : "warn bt", b.textContent = t, b.onclick = () => (d.remove(), i || startFight(btn, T, foes)), d.appendChild(b) }) }
money -= fee, enemyTier = T, updateMoney(), keepHp();
fightFx = bet ? { bet } : plain ? { mir: foes.mir && armed[17]--, slip: useArmed(33) && 2 * itemCost(33) } : {};
if (open && useArmed(19)) { const b = rnd(foes); b.bounty = 1, b.name = "📜 " + b.name }
decoys = plain ? [50, 60, 61].flatMap((i, n) => useArmed(i) ? [makeBug({ ...lookOf(rnd(fightTeam)), name: "Decoy", abilities: [], decoy: n + 1 })] : []) : [];
// Protein Chunk, Chitin Polish: on for this match
fightTeam.forEach(b => b.fx && !b.fx.on && (b.fx.on = 1, b.str += b.fx.d = b.fx.str ? min(20, b.str + 1) - b.str : 0, b.arm += b.fx.a = b.fx.pol ? min(20, b.arm + 1) - b.arm : 0));
// one match = one fight, or all steps of one MC
"mc" === fightMode && T > 1 && match || (match = { foes: [], prize: 0, kills: 0, ms: 0 });
bgPick(), bet || fightNum++, enemies = foes, groundMarks = [], dmgPops = [], fightDone = !1, foodLeft = 3 + dna.lv[2], combatState = !0, simSpd = 1, tickDebt = 0, syncSpeedLabel();
youngReady(1);
showScreen("s-box"), resizeBoxCV(), spawnBox()
}
function endFight() {
resultTimer && (clearTimeout(resultTimer), resultTimer = null);
dev && combatState && bugsOwned.forEach(b => b.mated = 0), keepHp(), buryDead(bugsInBoxView().filter(f => 0 === f.team && f.dead)), fxEnd(), fightFx = {};
combatState = !1, tickDebt = 0, simSpd = speedBeforePause, ecsQuery("team").forEach(ecsKill), ov("ov-res", 0), syncHud(!0)
}
const tallyFight = (lb, f) => (lb.fights = (lb.fights || 0) + 1, lb.killsTotal = (lb.killsTotal || 0) + (f.killsThis || 0)),
buryDead = dead => dead.forEach(f => {
const lb = ownedById(f.b.id), c = C.combat.get(f.eid) || f;
lb && !c.buried && (c.buried = 1, tallyFight(lb, f), hasAbil(lb, "fake") ? lb.curHp = 1 : (lb.losses++, bugsOwned = bugsOwned.filter(b => b.id !== f.b.id), run.end = `${lb.name} died in fight T${enemyTier}`))
});
function showFightResult() {
resultTimer = null;
if (!combatState) return;
wbKeep();
const all = bugsInBoxView(),
alive0 = all.filter(f => 0 === f.team && !f.dead),
dead0 = all.filter(f => 0 === f.team && f.dead),
alive1 = all.filter(f => 1 === f.team && !f.dead),
won = alive0.length > 0 && 0 === alive1.length,
allPlayer = all.filter(f => 0 === f.team),
allEnemy = all.filter(f => 1 === f.team);
keepHp();
const rt = $("res-title"), show = () => (renderResult(), $("bt-res").style.display = "");
rt.textContent = won ? "VICTORY!" : "DEFEAT", rt.style.color = won ? "#44ff88" : "#ff4444", won ? (SFX.win(), confetti(spans5(boxCv), 3)) : SFX.lose();
// Arena Ticket fight: only the payout, no records, achievements or fight counts of owned bugs
if (fightFx.bet) return won && (money += match.prize = fightFx.bet), updateMoney(), saveGame(), show(), ov("ov-res", 1);
dead0.length && achStep("lost", [1, 10], "lost", dead0.length);
const kills = allPlayer.reduce((s, f) => s + (f.killsThis || 0), 0);
addKills(kills);
buryDead(dead0), awayStep(1);
if (won) {
"boss" === fightMode && enemyTier >= tierMax && enemyTier < 5 && (toast(`Tier ${enemyTier} boss is defeated. T${tierMax = enemyTier + 1} opens`), screenFlash(TIER_COL[tierMax]));
// Bounty enemy ×3, Mirror Shard ×2, Betting Slip payout on top
const prize = allEnemy.reduce((s, f) => s + bugValue(statSum(f.b)) * (f.b.bounty ? 3 : 1), 0) * prizeK() * (fightFx.mir ? 2 : 1) + (fightFx.slip || 0);
money += prize, match.prize += prize, alive0.forEach(f => {
const lb = ownedById(f.b.id);
lb && (lb.wins++, tallyFight(lb, f), achSurvive(lb))
})
}
updateMoney();
// game win = first BOSS T5 win of this game
const first = won && "boss" === fightMode && 5 === enemyTier && !run.won;
first && (runTick(), run.won = 1, run.fast = run.ms, records.won++, records.fast = records.fast ? min(records.fast, run.ms) : run.ms);
achFight(won, dead0.length, alive0.length), achOwn(0), bugsOwned.forEach(b => b.mated = 0);
match.ms += fightMs, match.kills += kills, saveGame();
if (won && "mc" === fightMode && enemyTier < 5) {
match.foes.push(...allEnemy);
for (let n = 1 + ri(3); n--;) ecsSpawn({ food: {}, pos: { x: 30 + random() * (boxLW - 60), y: 30 + random() * (boxLH - 60), dir: 0 } });
return void($("bt-next").style.display = "")
}
[13, 15].includes(tutStep) && tutFought(alive0), show(), first ? gameEnd(offerObst) : won ? offerObst() : ov("ov-res", 1)
}
// Result screen body from the live fight box (HP after feeding) + enemies of earlier MC steps
function renderResult() {
const all = bugsInBoxView();
let html = "";
match.prize && (html += `<p style="color:#44ff88;font-size:10px;margin-bottom:8px;">+$${match.prize}</p>`);
scienceOn && (html += `<p style="color:#888;font-size:10px;margin-bottom:8px;">Time ${fmtT(match.ms)}</p>`);
const buildCard = (f, isPlayer) => {
const b = f.b,
isDead = f.dead,
lb = isPlayer ? ownedById(b.id) : null,
killsThis = f.killsThis || 0,
killsTot = isPlayer && lb ? lb.killsTotal || 0 : killsThis,
fightCount = isPlayer && lb ? lb.fights || 0 : 1,
imgId = `rc-ph-${isPlayer?"p":"e"}-${b.id}`;
const div = makeBugCard({
name: b.name,
line3: `G${b.gen||1} \u00b7 K${killsTot}${killsThis ? `(+${killsThis})` : ""}/F${fightCount}`,
statsObj: b,
abilB: b,
dead: isDead,
showHp: !0,
hpFrac: isDead ? 0 : f.curHp / f.maxHp,
imgId: imgId,
img: b
});
div.dataset.bid = b.id;
isPlayer || !BOSS[fightMode] || (div.querySelector(".card-lbl").innerHTML = ` <span style="color:#fa4">(${({ boss: "Boss", rb: "Raid Boss", wb: "World Boss" })[fightMode]})</span>`);
if (isDead) {
div.style.borderColor = "#442222";
const nm = div.querySelector(".card-name");
nm && (nm.style.color = "#555");
const cv = div.querySelector("#" + imgId).firstChild;
if (cv) {
const ctx = cv.getContext("2d"),
id = ctx.getImageData(0, 0, cv.width, cv.height), d = id.data;
for (let i = 0; i < d.length; i += 4) d[i + 3] > 0 && (d[i] = d[i + 1] = d[i + 2] = 90);
ctx.putImageData(id, 0, 0)
}
}
return div
};
const btnRow = `<div style="display:flex;gap:8px;">\n    <button class="nav-shop bt bt-shop f1">Shop 🛒</button>\n    <button class="nav-box bt bt-box f1">BugBox</button>\n    <button class="nav-lab bt bt-lab f1">Lab 🧬</button>\n    ${bugsOwned.length?'<button class="warn bt f1" onclick="leaveToBoo()">↺ Fight</button>':""}\n  </div>`;
bugsOwned.length || (html += '<p style="color:#ffdd44;font-size:10px;margin-bottom:8px;">⚠ No bugs left! Visit the Shop.</p>'), html += btnRow + `<div style="height:10px;"></div>`;
html += `<div class="grid2">\n    <div>\n      <div class="lbl-yours">YOUR BUGS</div>\n      <div id="rc-player-col" class="col4"></div>\n    </div>\n    <div>\n      <div class="lbl-enemy">ENEMY BUGS</div>\n      <div id="rc-enemy-col" class="col4"></div>\n    </div>\n  </div>` + btnRow + `<div id="res-cnt" style="position:absolute;right:6px;top:4px;font-size:8px;color:#44ccff;">${run.wins}/${fightNum}</div>`
$("res-body").innerHTML = html;
const playerCol = $("rc-player-col"),
enemyCol = $("rc-enemy-col");
all.forEach(f => 0 === f.team && ("mc" === fightMode && (f.killsThis = match.kills), playerCol.appendChild(buildCard(f, !0))));
match.foes.concat(all.filter(f => 1 === f.team)).forEach(f => enemyCol.appendChild(buildCard(f, !1)))
}
// Shared exit from the fight box (Leave, result buttons, nav buttons, card hold); during a running fight it counts as abandon
function leaveFight() {
if (!combatState) return;
fightDone || achieve("abandon");
if (labSt.larva) { const l = labSt.larva; l.dead || ownedById(l.id) || bugsOwned.push(l), labSt.larva = null }
wbKeep(), endFight(), fightTeam = fightTeam.filter(b => ownedById(b.id))
}
function leaveToBoo() {
const survivors = bugsInBoxView().filter(f => 0 === f.team && !f.dead).map(f => f.b);
leaveFight(), openBoo(!0, survivors), showScreen("s-boo")
}
function checkFightEnd() {
const ents = ecsQuery("team", "combat");
if (!ents.length) return;
const [a0, a1] = teamAlive(ents);
if (!fightDone && (0 === a0 || 0 === a1)) {
ents.forEach(e => {
const c = C.combat.get(e);
if (c.curHp <= 0) { c.dead = !0, c.curHp = 0, c.phoenixT = 0, c.fakeT = 0, clearActionState(c) }
else if (c.dead) { c.phoenixT = 0, c.fakeT = 0 }
});
fightDone = !0, resultTimer = setTimeout(showFightResult, 1000), slowT = 600, shake()
}
}
