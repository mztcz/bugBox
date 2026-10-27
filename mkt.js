const MKT_ITEMS = [["🍯", "Honey Drop", 40, "Food that heals 5 HP"], ["🥩", "Protein Chunk", 60, "+1 STR for the next fight"], ["💉", "Healing Serum", 90, "Full HP for one bug"], ["🛡️", "Chitin Polish", 120, "−1 damage taken next fight"], ["🧪", "Mutagen", 200, "Random ability on the next egg"], ["🥚", "Incubator", 150, "Eggs hatch twice as fast"], ["🧲", "Pheromone Lure", 80, "Bugs mate sooner"], ["🪵", "Bark Shelter", 70, "Hiding spot, resting bugs heal"], ["🪨", "Rock Pile", 30, "Extra obstacle in the box"], ["🌡️", "Heat Lamp", 110, "+1 AGI while in the box"], ["🍄", "Glow Mushroom", 50, "Lights up the fog of war"], ["🔍", "Magnifier", 60, "Shows enemy stats before a fight"], ["📦", "Box Expansion", 300, "+2 box capacity"], ["🎨", "Shell Paint", 40, "Recolour one bug"], ["🏆", "Trophy Stand", 500, "Shows off your best bug"], ["🎰", "Mystery Egg", 120, "Hatches a bug of a random tier"], ["🧬", "Gene Splicer", 250, "Choose which parent passes each stat"], ["🪞", "Mirror Shard", 90, "Fight your own clone for a double prize"], ["🎲", "Lucky Dice", 50, "Reroll the market shelf"], ["📜", "Bounty Contract", 30, "A named enemy: kill it for a triple prize"], ["💀", "Necro Amber", 400, "Revive one dead bug at 1 HP"], ["🧊", "Cryo Pod", 180, "Store one bug safely outside the box"], ["🍀", "Four-Leaf Clover", 70, "Next egg gets +1 to a random stat"], ["🕸️", "Spider Web", 60, "Enemy that walks in is stuck for 2s"], ["🔥", "Ember Pit", 80, "Bites dealt on it do +25% damage"], ["🎺", "War Horn", 100, "Your team charges at 1.5× speed for 3s"], ["🧃", "Adrenaline Shot", 70, "+2 AGI for one fight, −1 CON after"], ["🪖", "Acorn Helmet", 110, "Blocks the first bite of each fight"], ["🗡️", "Thorn Mandibles", 140, "+1 STR for good"], ["🧿", "Evil Eye", 90, "A random enemy starts the fight stunned"], ["🌫️", "Smoke Bomb", 60, "Enemies see half as far for 10s"], ["🐜", "Ant Mercenary", 150, "Hire a bug of the fight tier for one fight"], ["🏟️", "Arena Ticket", 40, "Bet on a fight between two strangers"], ["💰", "Betting Slip", 25, "Bet on your own fight: a win doubles it"], ["📈", "Sponsor Deal", 200, "+$20 per win for the next 10 fights"], ["🏦", "Bug Bank", 100, "Money earns 5% after every fight"], ["📛", "Name Tag", 15, "Rename a bug; its prizes +10%"], ["👑", "Crown", 350, "Allies near the crowned bug get +1 STR"], ["🎵", "Music Box", 60, "Bugs in the box mate 50% more often"], ["🌙", "Moon Lamp", 90, "Night in the box: rare acts twice as often"], ["🧭", "Compass", 50, "Always knows where the nearest enemy is"], ["🍬", "Sugar Cube", 20, "One bug may mate again"], ["🥇", "Medal Case", 80, "+1% prize per achievement unlocked"], ["🧫", "Petri Dish", 160, "Clone a bug as an egg, without abilities"], ["☢️", "Mutation Ray", 220, "Reroll one bug's abilities"], ["🦴", "Fossil", 300, "Hatches an ancient bug with one stat at 10"], ["🎁", "Loot Crate", 100, "A random item from this shelf"], ["🗺️", "Expedition Map", 120, "Bug leaves for 3 fights, returns with loot"], ["🏋️", "Training Wheel", 90, "+1 AGI after 5 minutes of running"], ["🍖", "Feast Platter", 75, "Drops 10 food into the box"], ["🧸", "Decoy Bug", 80, "Fake bug that enemies bite first"], ["🌵", "Cactus", 45, "Obstacle that hurts bugs touching it"], ["🫧", "Bubble Shield", 130, "Immune for the first 3s of a fight"], ["📯", "Rally Banner", 110, "Allies near it never flee"], ["🪤", "Snap Trap", 70, "First enemy to step on it loses 5 HP"], ["🔮", "Crystal Ball", 60, "Preview the next enemies and box"], ["🃏", "Wild Card", 150, "Swap one enemy for a lower-tier bug"], ["🐣", "Nursery Nest", 140, "Hatched bugs get +1 CON"], ["🏮", "Rival Lantern", 250, "A rival bug that grows with your wins"], ["🎖️", "Hall of Fame", 500, "Retire a bug: its descendants get +1 to its best stat"]];
let mktPool = [],
mktCart = [],
mktTab = 1;
function openMkt() {
mktCart = [], mktTab = 1;
mktPool = [1, 2, 3, 4, 5].map(mktRoll), renderMkt(), showScreen("s-mkt")
}
const mktRoll = T => Array.from({ length: 6 }, () => {
const b = makeBug(genStats(T));
return b.cost = round(bugValue(statSum(b)) * (1 + .25 * starsOf(statSum(b))) + 10 * tierRate(T) * b.abilities.length), b
});
function mktReroll() { mktCart = mktCart.filter(b => !mktPool[mktTab - 1].includes(b)), mktPool[mktTab - 1] = mktRoll(mktTab), renderMkt() }
function setMktTab(t) { tierGate(t) && (mktTab = t, renderMkt()) }
function mktApplyCard(div, btn, item) {
const inCart = mktCart.includes(item);
btn.className = "card-bt bt-sel", btn.textContent = inCart ? "✓ In cart — remove" : "Buy $" + item.cost, div.classList.toggle("card-sel", inCart), div.classList.toggle("card-off", !dev && !inCart && money < item.cost)
}
function updateMktFooter() {
const n = mktCart.length;
$("mkt-cart-info").textContent = `${n} bug${1!==n?"s":""} selected`;
const doneBtn = $("bt-buy");
doneBtn.textContent = n > 0 ? "Buy →" : "BugBox →", doneBtn.disabled = !1
}
function renderMkt() {
const g = $("mkt-grid");
$("mkt-tabs").innerHTML = (mktTab < 6 ? '<button class="bt-tier" onclick="mktReroll()">↻ Reroll</button>' : "") + [1, 2, 3, 4, 5, 6].map(t => `<button class="bt-tier${t === mktTab ? " prim" : ""}"${t < 6 ? lockAttr(t) : ""} onclick="setMktTab(${t})">${t < 6 ? "T" + t : "Items"}</button>`).join("");
g.innerHTML = "";
if (mktTab > 5) return MKT_ITEMS.forEach(([icon, name, cost, desc], i) => {
const div = document.createElement("div");
div.className = "card", div.innerHTML = `<div class="card-head"><div class="card-img" style="font-size:30px;">${icon}</div><div class="card-info"><div class="card-name">#${i + 1} ${name}</div><div class="card-line"><span class="c-money">$${cost}</span></div><div class="card-line">${desc}</div></div></div><button class="card-bt" style="width:100%;margin-top:8px;" disabled>Coming soon</button>`, g.appendChild(div)
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
e.stopPropagation(), toggleCart(item, div)
}, g.appendChild(div)
}), updateMktFooter(), armOverWatch()
}
function toggleCart(item, div) {
if (mktCart.includes(item)) mktCart = mktCart.filter(x => x !== item), money += item.cost;
else {
if (!dev && money < item.cost) return flashBlocked(div), void toast("Not enough money!");
money -= item.cost, mktCart.push(item)
}
[...$("mkt-grid").children].forEach((d, i) => mktApplyCard(d, d.lastChild, mktPool[mktTab - 1][i])), updateMktFooter(), updateMoney()
}
const OVER_DELAY = 3000;
let overTimer = null;
function cheapestOnShelf() { return mktPool.flat().reduce((m, it) => min(m, it.cost), 1 / 0) }
function runIsOver() { return !dev && !bugsOwned.length && !mktCart.length && money < cheapestOnShelf() }
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
achStep("bought", [10, 25], "buy", mktCart.length), achOwn(mktCart.length), mktCart.forEach(achBug), mktCart = [], updateMoney(), openTerr()
}
