const INFO_TABS = ["info", "tut", "ach", "morph", "abil", "rec"];
function openInfoTab(t) { ov("ov-inf", 1), infoTab(t) }
function infoTab(t) {
document.querySelectorAll(".info-tab").forEach(b => b.classList.toggle("prim", b.dataset.tab === t));
INFO_TABS.forEach(k => $("itab-" + k).style.display = k === t ? "" : "none");
t === "tut" && renderTutorial();
t === "ach" && renderAchievements();
t === "info" && renderInfoWiki();
t === "morph" && renderMorphWiki();
t === "abil" && renderAbilWiki();
t === "rec" && renderRecords();
$("info-foot").innerHTML = (t === "rec" ? '<button class="danger bt" onclick="resetRecords()">Reset</button>' : "") +
'<button class="ok bt" onclick="ov(&quot;ov-inf&quot;,0)">OK</button>'
}
const OV_PAUSE = ["ov-set", "ov-inf", "ov-design"];
let ovSpd = -1;
function ov(id, on) {
const r = $(id).style, h = $("s-box").querySelector(".topbar").offsetHeight;
// result screen: below the box top bar, content one more top bar height lower, Science buttons hidden
on || cancelAnimationFrame(dzAnim), r.display = on ? "flex" : "none", "ov-res" === id && (r.top = h + "px", r.paddingTop = 20 + h + "px", $("hud-sci").style.visibility = on ? "hidden" : "");
OV_PAUSE.includes(id) && (on ? ovSpd < 0 && (ovSpd = simSpd, simSpd = 0) : ovSpd >= 0 && !OV_PAUSE.some(o => "flex" === $(o).style.display) && (simSpd = ovSpd, ovSpd = -1), tickDebt = 0, syncSpeedLabel())
}
function showScreen(id) {
"s-shop" === id || cancelOverWatch();
("s-box" !== id || !combatState) && ov("ov-res", 0);
"s-box" !== id || combatState || (simSpd = 1, tickDebt = 0, syncSpeedLabel());
document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")), $(id).classList.add("active"), syncSimLoop();
if ("s-box" === id) {
combatState || youngReady(0);
const wantCombat = combatState;
requestAnimationFrame(() => {
requestAnimationFrame(() => {
combatState === wantCombat && (combatState && ecsQuery("bug").length ? resizeBoxCV() : spawnBox())
})
})
}
tutCheck(1), saveGame()
}
function updateMoney() {
["shop", "box", "lab", "boo"].forEach(k => { const el = $(k + "-money"); el.textContent = "$" + money, el.style.color = money < 0 ? "#f44" : "" });
money >= 1000 && achieve("rich1k"), money >= 5000 && achieve("rich5k")
}
