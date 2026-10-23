const teamMax = () => ({ mayhem: 1 / 0, rb: 10, wb: 10 })[fightMode] || +fightMode || 1,
bossFit = b => tierOf(statSum(b)) === enemyTier,
BOO_TIP = { 0: '<span style="color:#ff4444;">⚠</span> Bugs that LOSE a fight DIE permanently. Choose wisely.', 1: "1 v 1: one of your bugs against one enemy of the chosen tier.", 2: "2 v 2: two bugs on each side. Pick two that cover each other's weak stats.", 3: "3 v 3: three bugs on each side. You pay the entry fee for every enemy.", 6: "6 v 6: six bugs on each side. Big brawl, big entry fee, big prize.", mayhem: "MAYHEM: send as many bugs as you like, one enemy comes for each of them.", mc: "MC: one bug fights T1 to T5 in a row. Food drops after each win, every step costs its own entry fee.", boss: "BOSS: one bug of the chosen tier against a double-size boss. Beat it to open the next tier. Prize ×2.", rb: "RB: up to 10 bugs against a triple-size boss with 10× HP. Prize ×3.", wb: "WB: up to 10 bugs against a triple-size boss with 50× HP. Its lost HP stays until Sunday 23:59. Prize ×3." };
function openBoo(keepMode, keepTeam) {
$("boo-tip").innerHTML = BOO_TIP[keepMode ? fightMode : 0];
fightTeam = keepTeam ? keepTeam.map(f => ownedById(f.id)).filter(Boolean) : [], keepMode || (fightMode = 1, enemyTier = 1), renderBooGrid(), updateBooUI()
}
function setMode(n) {
$("boo-tip").innerHTML = BOO_TIP[n], fightMode = n, fightTeam = "boss" === n ? [] : fightTeam.slice(0, teamMax()), updateBooUI(), renderBooGrid()
}
function setTier(n) {
if (!tierGate(n)) return;
enemyTier = n, "boss" === fightMode && (fightTeam = fightTeam.filter(bossFit)), updateBooUI(), renderBooGrid()
}
function updateBooUI() {
const empty = !bugsOwned.length;
$("bt-boo-mkt").style.display = empty ? "" : "none";
$("bt-boo-terr").style.marginLeft = empty ? "0" : "auto";
document.querySelectorAll("#s-boo .bt-mode").forEach((el, i) => el.className = "bt-mode" + (!empty && fightMode === MODES[i] ? " prim" : ""));
$("tier-row").innerHTML = Array.from({ length: 5 }, (_, i) => `<button class="bt-tier${!empty && i + 1 === enemyTier ? " prim" : ""}"${lockAttr(i + 1)} onclick="setTier(${i + 1})">${String(i + 1).padStart(2, "0")}</button>`).join("");
$("boo-info").textContent = empty ? "" : `${fightTeam.length}/${isFinite(teamMax()) ? teamMax() : "∞"} selected — ${"mc" === fightMode ? "T1→T5" : `T${enemyTier}`}`;
const fee = entryFee("mc" === fightMode ? 1 : enemyTier);
$("bt-combat").textContent = `⚔ FIGHT ${fee ? "$" + fee : "Free"} →`;
$("bt-combat").disabled = !(fightTeam.length && ("string" == typeof fightMode || fightTeam.length === fightMode))
}
function booApplyCard(div, btn, b) {
const sel = fightTeam.find(x => x.id === b.id);
btn.className = "bt-sel", btn.textContent = sel ? "✓ Selected — remove" : "+ Send to fight", div.classList.toggle("card-sel", !!sel)
}
function renderBooGrid() {
const g = $("boo-grid");
g.innerHTML = "";
if (!bugsOwned.length) {
g.innerHTML = '<div class="empty-cell">Buy some bug first</div>';
return
}
fillSort($("boo-sort")), sortedOwned().forEach(b => {
const div = makeBugCard({
name: b.name,
line3: gkfLine(b),
statsObj: b,
abilB: b,
dead: !1,
showHp: !0,
hpFrac: hpFrac(b),
imgId: "fs-ph-" + b.id,
img: b
});
const btn = document.createElement("button");
btn.style = "width:100%;margin-top:7px;font-size:10px;", div.appendChild(btn), booApplyCard(div, btn, b), div.onclick = e => {
e.stopPropagation();
const idx = fightTeam.findIndex(x => x.id === b.id);
return idx >= 0 ? (fightTeam.splice(idx, 1), booApplyCard(div, btn, b), void updateBooUI()) : "boss" === fightMode && !bossFit(b) ? void flashBlocked(div) : fightTeam.length >= teamMax() ? (flashBlocked(div), void toast(`Max ${teamMax()} fighters!`)) : (fightTeam.push(b), booApplyCard(div, btn, b), void updateBooUI())
}, div.dataset.bid = b.id, g.appendChild(div)
})
}
