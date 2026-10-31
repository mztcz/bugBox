const teamMax = () => ({ mayhem: 1 / 0, chaos: 1 / 0, rb: 10, wb: 10 })[fightMode] || +fightMode || 1,
bossFit = b => { const t = tierOf(statSum(b)); return "boss" === fightMode || "mayhem" === fightMode ? t === enemyTier : !BOSS[fightMode] || t <= enemyTier },
BOO_TIP = { 0: '<span style="color:#ff4444;">⚠</span> Bugs that LOSE a fight DIE permanently. Choose wisely.', 1: "1 v 1: one of your bugs against one enemy of the chosen tier.", 2: "2 v 2: two bugs on each side. Pick two that cover each other's weak stats.", 3: "3 v 3: three bugs on each side. You pay the entry fee for every enemy.", 6: "6 v 6: six bugs on each side. Big brawl, big entry fee, big prize.", mayhem: "MAYHEM: send as many bugs of the chosen tier as you like, one enemy comes for each of them.", chaos: "CHAOS: send any bugs of any tier. About as many enemies come (±33%), each of the chosen tier ±1. Entry fee by the enemies that come.", mc: "MC: one bug fights T1 to T5 in a row. Food drops after each win, every step costs its own entry fee.", boss: "BOSS: one bug of the chosen tier against a 1.5× size boss. Beat it to open the next tier. Prize ×2.", rb: "RB: up to 10 bugs against a triple-size boss with 10× HP. Only bugs of tier T or lower. Prize ×3.", wb: "WB: up to 10 bugs against a triple-size boss with 50× HP. Its lost HP stays until Sunday 23:59. Only bugs of tier T or lower. Prize ×3." };
function openBoo(keepMode, keepTeam) {
$("boo-tip").innerHTML = BOO_TIP[keepMode ? fightMode : 0];
fightTeam = keepTeam ? keepTeam.map(f => ownedById(f.id)).filter(Boolean) : [], keepMode || (fightMode = 1, enemyTier = 1), renderBooGrid(), updateBooUI()
}
function setMode(n) {
$("boo-tip").innerHTML = BOO_TIP[n], fightMode = n, fightTeam = fightTeam.filter(bossFit).slice(0, teamMax()), updateBooUI(), renderBooGrid()
}
function setTier(n) {
if (!tierGate(n)) return;
enemyTier = n, fightTeam = fightTeam.filter(bossFit), updateBooUI(), renderBooGrid()
}
function updateBooUI() {
const empty = !bugsOwned.length;
$("bt-boo-mkt").style.display = empty ? "" : "none";
$("bt-boo-box").style.marginLeft = empty ? "0" : "auto";
document.querySelectorAll("#s-boo .bt-mode").forEach((el, i) => el.className = "bt-mode" + (!empty && fightMode === MODES[i] ? " prim" : ""));
$("tier-row").innerHTML = Array.from({ length: 5 }, (_, i) => `<button class="bt-tier${!empty && i + 1 === enemyTier ? " prim" : ""}"${lockAttr(i + 1, !empty && i + 1 === enemyTier)} onclick="setTier(${i + 1})">T${i + 1}</button>`).join("");
$("boo-info").textContent = empty ? "" : `${fightTeam.length}/${isFinite(teamMax()) ? teamMax() : "∞"} selected — ${"mc" === fightMode ? "T1→T5" : `T${enemyTier}`}`;
// CHAOS: ranges over enemy count (±33%) and enemy tier (T±1)
const T = "mc" === fightMode ? 1 : enemyTier, n = foeN(), c = "chaos" === fightMode, a = c ? max(1, round(n * .67)) : n, z = c ? round(n * 1.33) : n,
tl = c ? max(1, T - 1) : T, th = c ? min(5, T + 1) : T, rg = (x, y) => x === y ? x : x + "–" + y, fee = rg(entryFee(tl, a), entryFee(th, z));
$("boo-fee").textContent = empty ? "" : `Entry ${fee ? "$" + fee : "Free"} · Win $${BOSS[fightMode] ? bugValue(bossSum(T)) * prizeK() : rg(bugValue(tl > 1 ? 10 * tl - 10 : 5) * a, bugValue(min(10 * th - 1, STAT_SUM_MAX)) * z)}${"mc" === fightMode ? " per step" : ""}`;
$("bt-combat").disabled = !(fightTeam.length && ("string" == typeof fightMode || fightTeam.length === fightMode))
}
function booApplyCard(div, btn, b) {
const sel = fightTeam.find(x => x.id === b.id);
btn.className = "bt-sel", btn.textContent = sel ? "✓ Selected — remove" : "+ Send to fight", div.classList.toggle("card-sel", !!sel), div.classList.toggle("card-off", !bossFit(b))
}
function renderBooGrid() {
const g = $("boo-grid");
g.innerHTML = "";
if (!bugsOwned.length) {
g.innerHTML = '<div class="empty-cell">Buy some bug first</div>';
return
}
fillSort($("boo-sort")), sortedOwned().forEach(b => {
const div = ownCard(b, "fs-ph-");
const btn = document.createElement("button");
btn.style = "width:100%;margin-top:7px;font-size:10px;", div.appendChild(btn), booApplyCard(div, btn, b), div.onclick = e => {
e.stopPropagation();
const idx = fightTeam.findIndex(x => x.id === b.id);
return idx >= 0 ? (fightTeam.splice(idx, 1), booApplyCard(div, btn, b), void updateBooUI()) : bossFit(b) ? fightTeam.length >= teamMax() ? (flashBlocked(div), void toast(`Max ${teamMax()} fighters!`)) : (fightTeam.push(b), booApplyCard(div, btn, b), void updateBooUI()) : void flashBlocked(div)
}, div.dataset.bid = b.id, g.appendChild(div)
})
}
