const MKT_ITEMS = [["🍯", "Honey Drop", 40, "Food that heals 5 HP"], ["🥩", "Protein Chunk", 60, "+1 STR for the next fight"], ["💉", "Healing Serum", 90, "Full HP for one bug"], ["🛡️", "Chitin Polish", 120, "−1 damage taken next fight"], ["🧪", "Mutagen", 200, "Random ability on the next egg"], ["🥚", "Incubator", 150, "Eggs hatch twice as fast"], ["🧲", "Pheromone Lure", 80, "Bugs mate sooner"], ["🪵", "Bark Shelter", 70, "Hiding spot, resting bugs heal"], ["🪨", "Rock Pile", 30, "Extra obstacle in the box"], ["🌡️", "Heat Lamp", 110, "+1 AGI while in the box"], ["🍄", "Glow Mushroom", 50, "Lights up the fog of war"], ["🔍", "Magnifier", 60, "Shows enemy stats before a fight"], ["📦", "Box Expansion", 300, "+2 box capacity"], ["🎨", "Shell Paint", 40, "Recolour one bug"], ["🏆", "Trophy Stand", 500, "Shows off your best bug"]];
let mktPool = [],
mktCart = [],
mktTab = 1;
function openMkt() {
mktCart = [], mktTab = 1;
mktPool = [1, 2, 3, 4, 5].map(T => Array.from({ length: 6 }, () => {
const b = makeBug(statsOf(T > 1 ? 10 * T - ri(10) : 7 + ri(3)));
return b.cost = (60 + ri(66)) * T, b
})), renderMkt(), showScreen("s-mkt")
}
function setMktTab(t) { mktTab = t, renderMkt() }
function mktApplyCard(div, btn, item) {
const inCart = mktCart.includes(item);
btn.className = "card-bt bt-sel", btn.textContent = inCart ? "✓ In cart — remove" : "Buy $" + item.cost, div.classList.toggle("card-sel", inCart)
}
function updateMktFooter() {
const n = mktCart.length;
$("mkt-cart-info").textContent = `${n} bug${1!==n?"s":""} selected`;
const doneBtn = $("bt-buy");
doneBtn.textContent = n > 0 ? "Buy →" : "BugBox →", doneBtn.disabled = !1
}
function renderMkt() {
const g = $("mkt-grid");
$("mkt-tabs").innerHTML = [1, 2, 3, 4, 5, 6].map(t => `<button class="bt-tier${t === mktTab ? " prim" : ""}" onclick="setMktTab(${t})">${t < 6 ? "T" + t : "Items"}</button>`).join("");
g.innerHTML = "";
if (mktTab > 5) return MKT_ITEMS.forEach(([icon, name, cost, desc]) => {
const div = document.createElement("div");
div.className = "card", div.innerHTML = `<div class="card-head"><div class="card-img" style="font-size:30px;">${icon}</div><div class="card-info"><div class="card-name">${name}</div><div class="card-line"><span class="c-money">$${cost}</span></div></div></div><div class="card-line">${desc}</div><button class="card-bt" style="width:100%;margin-top:8px;" disabled>Coming soon</button>`, g.appendChild(div)
}), updateMktFooter();
mktPool[mktTab - 1].forEach((item, i) => {
const div = makeBugCard({
name: item.name,
line3: `<span class="c-money">$${item.cost}</span>`,
statsObj: item,
abilB: item,
dead: !1,
showHp: !1,
imgId: "sh-ph-" + i,
img: item,
imgW: 52,
imgH: 52
});
const btn = document.createElement("button");
btn.style = "width:100%;margin-top:8px;", div.appendChild(btn), mktApplyCard(div, btn, item), div.onclick = e => {
e.stopPropagation(), toggleCart(item, div, btn)
}, g.appendChild(div)
}), updateMktFooter(), armOverWatch()
}
function toggleCart(item, div, btn) {
if (mktCart.includes(item)) mktCart = mktCart.filter(x => x !== item), money += item.cost;
else {
if (money < item.cost) return flashBlocked(div), void toast("Not enough money!");
money -= item.cost, mktCart.push(item)
}
mktApplyCard(div, btn, item), updateMktFooter(), updateMoney()
}
const OVER_DELAY = 3000;
let overTimer = null;
function cheapestOnShelf() { return mktPool.flat().reduce((m, it) => min(m, it.cost), 1 / 0) }
function runIsOver() { return !bugsOwned.length && !mktCart.length && money < cheapestOnShelf() }
function cancelOverWatch() { overTimer && (clearTimeout(overTimer), overTimer = null) }
function armOverWatch() {
cancelOverWatch();
if (!runIsOver()) return;
overTimer = setTimeout(() => {
overTimer = null;
if (!runIsOver()) return;
if (boxEggs.length) return void(openTerr());
ov("ov-over", 1)
}, OVER_DELAY)
}
function mktDone() {
if (!mktCart.length && !bugsOwned.length) return void toast("Buy at least 1 bug to start!");
bugsOwned.push(...mktCart);
achStep("bought", [10, 25], "buy", mktCart.length), achOwn(mktCart.length), mktCart = [], updateMoney(), openTerr()
}
