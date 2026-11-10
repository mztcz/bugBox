function renderRecords() {
trackDynasty(bugsOwned.reduce((m, b) => max(m, b.gen || 1), 0));
const r = (l, f, c) => `<div>${l}: ${[run, records].map(R => `<b style="color:${c};">${f(R)}</b>`).join(" / ")}</div>`,
best = (v, n) => v > 0 ? `${n} (${v})` : "\u2014";
$("itab-rec").innerHTML =
'<div style="color:#556;font-size:9px;margin-bottom:4px;">this run / all games</div>' +
(run.end ? `<div>Last loss: <b style="color:#f44;">${run.end}</b></div>` : "") +
r("Games played", R => R.games, "#4cf") +
r("Games won", R => R.won, "#4f8") +
r("Fastest win", R => R.fast ? fmtT(R.fast) : "\u2014", "#fff") +
r("Kills", R => R.kills, "#ff5566") +
r("Fights", R => R.fights, "#4f8") +
r("Wins", R => R.wins, "#4f8") +
r("Win rate", R => (R.fights ? round(R.wins / R.fights * 100) : 0) + "%", "#fa4") +
r("Fight time min-avg-max", R => R.fN ? [R.fMin, R.fSum / R.fN, R.fMax].map(fmtT).join("-") : "\u2014", "#fff") +
r("Longest dynasty", R => "Gen " + R.longestDynasty, "#a4f") +
r("Most bugs at once", R => R.maxBugs, "#4cf") +
r("Best bug", R => best(R.bestSum, R.bestSumName), "#4f8") +
r("Top killer", R => best(R.bestKill, R.bestName), "#fd4")
}
function resetRecords() {
Object.assign(records, RECORDS0, { games: 1 }), saveRecords(), renderRecords()
}

// play time of this game (run.ms): real time with the page visible, counted in steps of max 6 s
let runT = Date.now(), heir = null;
const runTick = () => { const n = Date.now(); gameOn && !document.hidden && (run.ms += min(n - runT, 6e3)), runT = n };
// DNA (kept across games, key bugbox_dna): n = points, lv = Legacy levels in LEGACY order, bugs = heirloom candidates (T1-T3 bugs owned at the game win)
const dna = { n: 0, lv: [0, 0, 0, 0], bugs: [] },
LEGACY = [["Start money", l => "+$" + 150 * l], ["Shop stock", l => 6 + l + " bugs per tab"], ["Fight food", l => 3 + l + " food per fight"], ["Heirloom", l => l ? "1 bug up to T" + l : "no bug"]];
try { Object.assign(dna, JSON.parse(localStorage.getItem("bugbox_dna"))) } catch (e) {}
const saveDna = () => { try { localStorage.setItem("bugbox_dna", JSON.stringify(dna)) } catch (e) {} };
// Game end screen: game over (no next) or game won (next = what follows Continue). DNA = 1 per open tier above T1 + 2 for the win + 1 per 10 achievements; a game pays only what it has not paid yet (run.dna)
function gameEnd(next) {
const due = tierMax - 1 + 2 * run.won + floor(ACHIEVEMENTS.filter(a => achSt.done[a[0]]).length / 10), d = due - run.dna, t = $("over-title"), col = next ? "#44ff88" : "#ff4444";
run.dna = due, dna.n += d, next && (dna.bugs = bugsOwned.filter(b => tierOf(statSum(b)) < 4)), saveDna(), saveGame();
t.textContent = next ? "GAME WON" : "GAME OVER", t.style.color = col, t.style.textShadow = `0 0 16px ${col}88`;
$("over-body").innerHTML = (next ? `Time ${fmtT(run.ms)} \u00b7 Fights ${fightNum} \u00b7 Kills ${run.kills}<br>Best bug: ${run.bestSumName} (${run.bestSum})` : "Looks like you have ran out of bugs to kill... Good!") + `<br><b style="color:#4cf;">+${d} DNA</b>`;
$("over-go").style.display = next ? "contents" : "none", $("bt-cont").onclick = () => (ov("ov-over", 0), next());
ov("ov-over", 1), next && confetti(spans5(t), 5)
}
// Legacy screen (new game, after the intro): permanent bonuses, level n costs n DNA; heirloom = 1 candidate bug of tier <= Heirloom level
function renderLegacy() {
$("leg-dna").textContent = dna.n;
$("leg-body").innerHTML = '<p style="font-size:9px;color:#555566;margin-bottom:10px;">\u25b8 Permanent bonuses for every new game. Paid with DNA from finished games.</p><div class="shop-grid">' + LEGACY.map(([n, f], i) => {
const l = dna.lv[i];
return `<div class="card"><div class="card-name">${n} ${"\u25cf".repeat(l)}${"\u25cb".repeat(3 - l)}</div><div class="card-line">${f(l)}</div>${l < 3 ? `<button class="card-bt" style="width:100%;margin-top:8px;" ${dna.n > l ? "" : "disabled"} onclick="legBuy(${i})">${f(l + 1)} \u00b7 ${l + 1} DNA</button>` : ""}</div>`
}).join("") + "</div>" + (dna.bugs.length ? '<p style="font-size:9px;color:#555566;margin:10px 0;">\u25b8 Heirloom: tap 1 bug of the won game to take it into the new game.</p><div class="shop-grid" id="leg-grid"></div>' : "");
dna.bugs.forEach(b => {
const div = bugCard(b, "lg-ph-"), ok = tierOf(statSum(b)) <= dna.lv[3];
div.classList.toggle("card-off", !ok), div.classList.toggle("card-sel", b === heir), div.onclick = () => ok && (heir = b === heir ? null : b, renderLegacy()), $("leg-grid").appendChild(div)
})
}
const legBuy = i => (dna.n -= ++dna.lv[i], saveDna(), renderLegacy());
// New game start (after Legacy, or straight from the intro when there is nothing to show)
function legGo(tut) {
gameOn = 1, records.games++, saveRecords(), money += 150 * dna.lv[0];
heir && (Object.assign(heir, { id: bid++, mated: 0, curHp: maxHpOf(heir) }), bugsOwned.push(heir), achOwn(1), achBug(heir));
dna.bugs = [], saveDna(), updateMoney(), openShop(), tut && tutGo(2)
}
