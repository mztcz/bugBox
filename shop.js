const SHOP_ITEMS = [["🍯", "Honey Drop", 40, "Food that heals 5 HP"], ["🥩", "Protein Chunk", 60, "+1 STR for the next fight"], ["💉", "Healing Serum", 90, "Full HP for one bug"], ["🛡️", "Chitin Polish", 120, "−1 damage taken next fight"], ["🧪", "Mutagen", 200, "Random ability on the next egg"], ["🥚", "Incubator", 150, "Eggs hatch twice as fast"], ["🧲", "Pheromone Lure", 80, "Bugs mate sooner"], ["🪵", "Bark Shelter", 70, "Hiding spot, resting bugs heal"], ["🪨", "Rock Pile", 30, "Extra obstacle in the box"], ["🌡️", "Heat Lamp", 110, "+1 AGI while in the box"], ["🍄", "Glow Mushroom", 50, "Lights up the fog of war"], ["🔍", "Magnifier", 60, "Shows enemy stats before a fight"], ["📦", "Box Expansion", 300, "+25 box capacity and a bigger box"], ["🎨", "Shell Paint", 40, "Recolour one bug"], ["🏆", "Trophy Stand", 500, "Shows off your best bug"], ["🎰", "Mystery Egg", 120, "Hatches a bug of a random tier"], ["🧬", "Gene Splicer", 250, "Choose which parent passes each stat"], ["🪞", "Mirror Shard", 90, "Fight your own clone for a double prize"], ["🎲", "Lucky Dice", 50, "Reroll the shop shelf"], ["📜", "Bounty Contract", 30, "A named enemy: kill it for a triple prize"], ["💀", "Necro Amber", 400, "Revive one dead bug at 1 HP"], ["🧊", "Cryo Pod", 180, "Store one bug safely outside the box"], ["🍀", "Four-Leaf Clover", 70, "Next egg gets +1 to a random stat"], ["🕸️", "Spider Web", 60, "Enemy that walks in is stuck for 2s"], ["🔥", "Ember Pit", 80, "Bites dealt on it do +25% damage"], ["🎺", "War Horn", 100, "Your team charges at 1.5× speed for 3s"], ["🧃", "Adrenaline Shot", 70, "+2 AGI for one fight, −1 CON after"], ["🪖", "Acorn Helmet", 110, "Blocks the first bite of each fight"], ["🗡️", "Thorn Mandibles", 140, "+1 STR for good"], ["🧿", "Evil Eye", 90, "A random enemy starts the fight stunned"], ["🌫️", "Smoke Bomb", 60, "Enemies see half as far for 10s"], ["🐜", "Ant Mercenary", 150, "Hire a bug of the fight tier for one fight"], ["🏟️", "Arena Ticket", 40, "Bet on a fight between two strangers"], ["💰", "Betting Slip", 25, "Bet on your own fight: a win doubles it"], ["📈", "Sponsor Deal", 200, "+$20 per win for the next 10 fights"], ["🏦", "Bug Bank", 100, "Money earns 5% after every fight"], ["📛", "Name Tag", 15, "Rename a bug; its prizes +10%"], ["👑", "Crown", 350, "Allies near the crowned bug get +1 STR"], ["🎵", "Music Box", 60, "Bugs in the box mate 50% more often"], ["🌙", "Moon Lamp", 90, "Night in the box: rare acts twice as often"], ["🧭", "Compass", 50, "Always knows where the nearest enemy is"], ["🍬", "Sugar Cube", 20, "One bug may mate again"], ["🥇", "Medal Case", 80, "+1% prize per achievement unlocked"], ["🧫", "Petri Dish", 160, "Clone a bug as an egg, without abilities"], ["☢️", "Mutation Ray", 220, "Reroll one bug's abilities"], ["🦴", "Fossil", 300, "Hatches an ancient bug with one stat at 10"], ["🎁", "Loot Crate", 100, "A random item from this shelf"], ["🗺️", "Expedition Map", 120, "Bug leaves for 3 fights, returns with loot"], ["🏋️", "Training Wheel", 90, "+1 AGI after 5 minutes of running"], ["🍖", "Feast Platter", 75, "Drops 10 food into the box"], ["🧸", "Decoy Bug I", 80, "Fake bug: each enemy bites it once, then ignores it"], ["🌵", "Cactus", 45, "Obstacle that hurts bugs touching it"], ["🫧", "Bubble Shield", 130, "Immune for the first 3s of a fight"], ["📯", "Rally Banner", 110, "Allies near it never flee"], ["🪤", "Snap Trap", 70, "First enemy to step on it loses 5 HP"], ["🔮", "Crystal Ball", 60, "Preview the next enemies and box"], ["🃏", "Wild Card", 150, "Swap one enemy for a lower-tier bug"], ["🐣", "Nursery Nest", 140, "Hatched bugs get +1 CON"], ["🏮", "Rival Lantern", 250, "A rival bug that grows with your wins"], ["🎖️", "Hall of Fame", 500, "Retire a bug: its descendants get +1 to its best stat"], ["🧸", "Decoy Bug II", 160, "Fake bug: each enemy bites it twice, then ignores it"], ["🧸", "Decoy Bug III", 240, "Fake bug: each enemy bites it 3 times, then ignores it"]];
// Items (ids = index in SHOP_ITEMS): ITEM_ON = working items, ITEM_BUG = used on a bug, the rest of the inventory is armed for the next fight or egg (armed) or used at once.
// inv = owned counts, boxLv = Box Expansion level 0-3, trophy = Trophy Stand owned, itemSel = item waiting for a tap on a bug
const ITEM_ON = [0, 1, 3, 4, 6, 7, 11, 12, 13, 14, 17, 18, 19, 22, 32, 33, 41, 44, 46, 47, 50, 60, 61], ITEM_BUG = [0, 1, 3, 13, 41, 47],
ITEM_NOTE = { 18: "Used by Reroll in the Shop", 44: "Used on the NEW BUG screen in the Lab" },
itemCost = i => SHOP_ITEMS[i][2] * (12 === i ? 1 : tierRate(tierMax) / 2),
itemGet = i => 12 === i ? boxLv++ : 14 === i ? trophy = 1 : inv[i] = (inv[i] || 0) + 1,
itemMax = i => 12 === i && boxLv > 2 || 14 === i && trophy,
lootPick = () => rnd(ITEM_ON.filter(i => 46 !== i && !itemMax(i))),
useArmed = i => armed[i] > 0 && armed[i]--,
bestBug = () => bugsHome().reduce((m, b) => m && statSum(m) >= statSum(b) ? m : b, null);
let itemSel = null;
function buyItem(i, div) {
const c = itemCost(i);
if (!dev && money < c) return flashBlocked(div), void toast("Not enough money!");
money -= c, itemGet(i), updateMoney(), renderShop(), saveGame()
}
function openInv() {
itemSel = null;
const d = popup("ITEMS"), ids = ITEM_ON.filter(i => inv[i] > 0 || armed[i] > 0), bt = (html, fn) => { const b = document.createElement("button"); b.className = "bt", b.style = "width:100%;max-width:340px;height:auto;text-align:left;padding:6px;flex:none", b.innerHTML = html, b.onclick = () => (d.remove(), fn()), d.appendChild(b) };
ids.length || d.insertAdjacentHTML("beforeend", '<div style="font-size:10px;color:#888">No items. Buy them in the Shop, tab Items.</div>');
ids.forEach(i => { const [ic, nm, , ds] = SHOP_ITEMS[i]; bt(`${ic} ${nm} ×${inv[i] || 0}${armed[i] ? ` <span style="color:#4f8">ready ×${armed[i]}</span>` : ""}<br><span style="font-size:8px;color:#888">${ITEM_NOTE[i] || ds}</span>`, () => inv[i] > 0 && useItem(i)) });
bt("Close", () => {}), d.lastChild.style.textAlign = "center"
}
function useItem(i) {
const nm = SHOP_ITEMS[i][1];
if (ITEM_NOTE[i]) return toast(ITEM_NOTE[i]);
if (ITEM_BUG.includes(i)) return itemSel = i, toast(nm + ": tap a bug");
if (7 === i) { const o = placeObst(5, snapObstacles(), 0); if (!o) return toast("No room in the box"); o.sh = 1, spawnObst(o) }
inv[i]--;
if (32 === i) return openBet(2 * itemCost(i));
if (46 === i) { const g = lootPick(); itemGet(g), toast(`Loot Crate: ${SHOP_ITEMS[g][0]} ${SHOP_ITEMS[g][1]}`) }
else 7 === i ? toast(nm + " placed") : (armed[i] = (armed[i] || 0) + 1, toast(nm + " ready"));
saveGame(), openInv()
}
function itemOnBug(b) {
const i = itemSel, no = [hpFrac(b) >= 1 && "Full HP", b.fx?.str && "Already fed", , b.fx?.pol && "Already polished"][i] || 41 === i && !b.mated && "Not mated" || 47 === i && bugsHome().length < 2 && "Your last bug stays home" || b.away && "Bug is away";
itemSel = null;
if (no) return toast(no);
inv[i]--;
0 === i ? b.curHp = min(maxHpOf(b), b.curHp + 5) : 1 === i ? (b.fx ||= {}).str = 1 : 3 === i ? (b.fx ||= {}).pol = 1 : 13 === i ? b.hue = (b.hue + 20 * (1 + ri(17))) % 360 : 41 === i ? b.mated = 0 : (b.away = 3, fightTeam = fightTeam.filter(x => x !== b), inspected === b && (inspected = null));
toast(`${SHOP_ITEMS[i][1]}: ${b.name}`), saveGame()
}
// Expedition Map: n finished fights pass; a returning bug brings 2 random items; with no bug at home all return at once without loot
function awayStep(n) {
const home = bugsHome().length;
bugsOwned.forEach(b => {
if (!b.away) return;
const done = (b.away -= n) <= 0;
(done || !home) && (delete b.away, done && [0, 0].forEach(() => { const g = lootPick(); itemGet(g), toast(`${b.name} brought ${SHOP_ITEMS[g][0]} ${SHOP_ITEMS[g][1]}`) }))
})
}
// next egg in the box: Four-Leaf Clover +1 to a random stat, Mutagen 1 random ability of a stat without one
function eggItems(o) {
if (o.dead) return o;
const ks = SK.filter(k => o[k] < 20), pool = ABIL_IDS.filter(id => !o.abilities.some(a => ABILITIES[a].stat === ABILITIES[id].stat));
ks.length && statSum(o) < STAT_SUM_MAX && useArmed(22) && o[rnd(ks)]++;
pool.length && o.abilities.length < ABIL_MAX && useArmed(4) && o.abilities.push(rnd(pool));
return o
}
// row of bug cards in a popup; tap = fn(bug)
function cardRow(d, bugs, fn) {
const row = document.createElement("div");
row.style = "display:flex;flex-wrap:wrap;gap:8px;justify-content:center", d.appendChild(row);
bugs.forEach(b => { const c = makeBugCard({ name: b.name, line3: "", statsObj: b, abilB: b, dead: !1, showHp: !1, imgId: "pk-ph-" + b.id, img: b, style: "width:150px" }); fn && (c.onclick = () => fn(b)), row.appendChild(c) });
return d
}
// Arena Ticket: two strangers of a random open tier fight 1v1, the picked one wins = payout
function openBet(pay) {
const T = 1 + ri(tierMax), pair = [0, 1].map(() => makeBug({ ...genStats(T), hue: 20 * ri(18) })), d = cardRow(popup(`BET: TAP THE WINNER (WIN $${pay})`), pair, b => (d.remove(), leaveFight(), fightMode = 1, fightTeam = [b], startFight(null, T, pair.filter(x => x !== b), pay)))
}
let shopPool = [],
shopCart = [],
shopTab = 1;
function openShop() {
shopCart = [], shopTab = 1;
shopPool = [1, 2, 3, 4, 5].map(shopRoll), renderShop(), showScreen("s-shop")
}
const shopRoll = T => Array.from({ length: 6 + dna.lv[1] }, () => {
const b = makeBug(genStats(T));
return b.cost = round(bugValue(statSum(b)) * (1 + .25 * starsOf(statSum(b))) + 10 * tierRate(T) * b.abilities.length), b
});
// Reroll costs 1 Lucky Dice (item 18); free in Dev
function shopReroll(bt) {
if (!dev && !(inv[18] > 0)) return flashBlocked(bt), void toast("Reroll needs a Lucky Dice (tab Items)");
dev || inv[18]--, shopCart = shopCart.filter(b => !shopPool[shopTab - 1].includes(b)), shopPool[shopTab - 1] = shopRoll(shopTab), renderShop()
}
function setShopTab(t) { tierGate(t) && (shopTab = t, renderShop()) }
function shopApplyCard(div, btn, item) {
const inCart = shopCart.includes(item);
btn.className = "card-bt bt-sel", btn.textContent = inCart ? "✓ In cart — remove" : "Buy $" + item.cost, div.classList.toggle("card-sel", inCart), div.classList.toggle("card-off", !dev && !inCart && money < item.cost)
}
function updateShopFooter() {
const n = shopCart.length;
$("shop-cart-info").textContent = `${n} bug${1!==n?"s":""} selected`;
const doneBtn = $("bt-buy");
doneBtn.textContent = n > 0 ? "Buy →" : "BugBox →", doneBtn.disabled = !1
}
function renderShop() {
const g = $("shop-grid");
$("shop-tabs").innerHTML = (shopTab < 6 ? '<button class="bt-tier" onclick="shopReroll(this)">↻ Reroll 🎲' + (inv[18] || 0) + "</button>" : "") + [1, 2, 3, 4, 5, 6].map(t => `<button class="bt-tier${t === shopTab ? " prim" : ""}"${t < 6 ? lockAttr(t, 1) : ""} onclick="setShopTab(${t})">${t < 6 ? "T" + t : "Items"}</button>`).join("");
g.innerHTML = "";
// Items tab: working items first, bought at once (no cart)
if (shopTab > 5) return SHOP_ITEMS.map((_, i) => i).sort((a, b) => ITEM_ON.includes(b) - ITEM_ON.includes(a)).forEach(i => {
const [icon, name, , desc] = SHOP_ITEMS[i], on = ITEM_ON.includes(i), cost = itemCost(i), div = document.createElement("div"), own = 12 === i ? `level ${boxLv}/3` : 14 === i ? trophy ? "owned" : "" : inv[i] ? "own " + inv[i] : "";
div.className = "card" + (on && !itemMax(i) && (dev || money >= cost) ? "" : " card-off"), div.innerHTML = `<div class="card-head"><div class="card-img" style="font-size:30px;">${icon}</div><div class="card-info"><div class="card-name">#${i + 1} ${name}</div><div class="card-line"><span class="c-money">$${cost}</span> ${own}</div><div class="card-line">${desc}</div></div></div><button class="card-bt${on ? " bt-sel" : ""}" style="width:100%;margin-top:8px;"${on && !itemMax(i) ? "" : " disabled"}>${on ? itemMax(i) ? "Max" : "Buy $" + cost : "Coming soon"}</button>`;
on && !itemMax(i) && (div.lastChild.onclick = () => buyItem(i, div)), g.appendChild(div)
}), updateShopFooter(), armOverWatch();
shopPool[shopTab - 1].forEach((item, i) => {
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
btn.style = "width:100%;margin-top:8px;", div.appendChild(btn), shopApplyCard(div, btn, item), div.onclick = e => {
e.stopPropagation(), toggleCart(item, div)
}, g.appendChild(div)
}), updateShopFooter(), armOverWatch()
}
function toggleCart(item, div) {
if (shopCart.includes(item)) shopCart = shopCart.filter(x => x !== item), money += item.cost;
else {
if (!dev && money < item.cost) return flashBlocked(div), void toast("Not enough money!");
money -= item.cost, shopCart.push(item)
}
[...$("shop-grid").children].forEach((d, i) => shopApplyCard(d, d.lastChild, shopPool[shopTab - 1][i])), updateShopFooter(), updateMoney()
}
const OVER_DELAY = 3000;
let overTimer = null;
function cheapestOnShelf() { return shopPool.flat().reduce((m, it) => min(m, it.cost), 1 / 0) }
function runIsOver() { return !dev && !bugsOwned.length && !shopCart.length && money < cheapestOnShelf() }
function cancelOverWatch() { overTimer && (clearTimeout(overTimer), overTimer = null) }
function armOverWatch() {
cancelOverWatch();
if (!runIsOver()) return;
// no bugs, no money: opening the Shop counts as a finished fight for eggs and pupae (they hatch in the box)
// TODO when food costs money: a larva its player cannot feed crawls 10 s, then game over
youngReady(1);
overTimer = setTimeout(() => {
overTimer = null;
if (!runIsOver()) return;
if (youngAll().length) return void(openBox());
dropSave(), gameEnd()
}, OVER_DELAY)
}
function shopDone() {
if (!shopCart.length && !bugsOwned.length) return void toast("Buy at least 1 bug to start!");
bugsOwned.push(...shopCart);
achStep("bought", [10, 25], "buy", shopCart.length), achOwn(shopCart.length), shopCart.forEach(achBug), shopCart = [], updateMoney(), openBox()
}
