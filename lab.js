function openLab() {
labSt = newLab(), showScreen("s-lab"), renderLab();
const lay = $("lab-layout");
lay && (lay.scrollTop = 0)
}
function renderLab() {
closeKill(), updateMoney();
const lay = $("lab-layout"),
st = labSt;
if ("pick" === st.phase) {
lay.innerHTML = "";
const tip = document.createElement("div");
tip.style = "font-size:8px;color:#888;width:100%;max-width:700px;text-align:center;margin-bottom:2px;";
tip.textContent = "Tip: Tap any bug's picture to kill it. Hold any bug's card to find it.";
lay.appendChild(tip);
lay.appendChild(fillSort(document.createElement("div")));
const bar = document.createElement("div");
lay.style.cursor = "", lay.onclick = null, bar.id = "lab-topbar", bar.style = "width:100%;max-width:700px;", lay.appendChild(bar);
const grid = document.createElement("div");
return grid.className = "pick-grid", lay.appendChild(grid), renderLabGrid(grid), void labBar()
}
if ("result" === st.phase) {
const l = st.larva, pA = st.pA, pB = st.pB;
lay.innerHTML = `
      <div class="phase-box" style="max-width:520px;">
        <h3 class="tc">🥚 NEW BUG!</h3>
        <div id="lab-parents-row" style="display:flex;gap:8px;justify-content:center;align-items:flex-start;margin:10px 0;"></div>
        <div id="lab-child-row" style="display:flex;justify-content:center;margin:10px 0;"></div>
        <div class="tc"><button class="nav-lab bt" style="width:160px;padding:6px 28px;height:auto;">← Breeding Lab 🧬</button></div>
      </div>`;
lay.style.cursor = "pointer", lay.onclick = labBack;
const parentsRow = $("lab-parents-row"),
childRow = $("lab-child-row");
const mkCard = (bug, dead, isChild, lbl) => {
if (dead || !bug) {
const div = document.createElement("div");
div.className = "card", div.style = "position:relative;flex:1;min-width:0;max-width:170px;box-sizing:border-box;";
div.innerHTML = '<div class="empty-note">— gone —</div>';
return div
}
const card = makeKillableCard(bug, {
uid: "hatch",
extraStyle: "flex:1;min-width:0;max-width:170px;",
onKill: cardDiv => {
bugsOwned = bugsOwned.filter(x => x.id !== bug.id);
isChild ? (l.dead = !0) : (pA === bug ? st.pAdead = !0 : st.pBdead = !0);
freezeCardAsGone(cardDiv)
}
});
return abLbl(card, lbl), card.classList.add("card-meta"), card
};
if (pA || st.pAdead) parentsRow.appendChild(mkCard(pA, st.pAdead, !1, "A"));
if (pB || st.pBdead) parentsRow.appendChild(mkCard(pB, st.pBdead, !1, "B"));
const cc = mkCard(l.dead ? null : l, l.dead, !0);
childRow.appendChild(cc), markMeta(cc, l);
return
}
}
const abLbl = (card, l) => card.querySelector(".card-lbl").innerHTML = l ? ` <span style="color:${l==="A"?"#ffdd44":"#ff9933"}">(${l})</span>` : "";
function labApplyCard(div, b) {
const isA = labSt.pA?.id === b.id,
isB = labSt.pB?.id === b.id;
abLbl(div, isA ? "A" : isB ? "B" : "");
const old = div.querySelector(".bt-breed");
old && old.remove();
if (labSt.pA && labSt.pB && (isA || isB)) {
const info = div.querySelector(".card-info"),
gb = document.createElement("button");
gb.className = "nav-lab bt-breed", gb.style = "font-size:10px;padding:3px 8px;margin-top:3px;", gb.textContent = "🧬 Breed", gb.onclick = e => { e.stopPropagation(), breedNow() };
info && info.appendChild(gb)
}
const btn = div.querySelector(".bt-sel");
btn && (btn.textContent = isA || isB ? "Deselect" : "Select"), div.classList.toggle("card-sel", isA || isB), div.classList.toggle("card-off", !canParent(b))
}
function breedNow() {
if (boxFull()) return void toast("Box full");
labSt.pA && labSt.pB ? (labSt.larva = makeBug({
...computeOffspring(labSt.pA, labSt.pB),
wins: 0,
losses: 0
}), labSt.pA.mated = labSt.pB.mated = 1, achKids(labSt.pA, labSt.pB), labSt.larva.dead || (bugsOwned.push(labSt.larva), achOwn(1), achChild(labSt.larva, parentTier(labSt.pA, labSt.pB)), trackDynasty(labSt.larva.gen)), SFX.hatch(), labSt.phase = "result", renderLab(), labFx()) : toast("Select two bugs!")
}
const bugOfCard = div => bugsOwned.find(x => String(x.id) === div.dataset.bid);
function labApplyAll(grid) {
grid.querySelectorAll(".card").forEach(div => {
const b = bugOfCard(div);
b && labApplyCard(div, b)
}), labBar()
}
function labPick(b, div, grid, addOnly) {
const selected = labSt.pA?.id === b.id || labSt.pB?.id === b.id;
if (selected && addOnly) return;
if (!selected && !canParent(b)) return void flashBlocked(div);
if (!selected && boxFull()) return flashBlocked(div), void toast("Box full");
labSt.pA?.id === b.id ? (labSt.pA = labSt.pB, labSt.pB = null) : labSt.pB?.id === b.id ? labSt.pB = null : labSt.pA ? labSt.pB ? (labSt.pA = labSt.pB, labSt.pB = b) : labSt.pB = b : labSt.pA = b, labApplyAll(grid)
}
const BREED_SORT = [
["name", "Nam", b => b.name.toLowerCase()],
["gen", "Gen", b => b.gen],
["con", "Con", b => b.con],
["str", "Str", b => b.str],
["agi", "Agi", b => b.agi],
["per", "Per", b => b.per],
["int", "Int", b => b.int],
["abi", "Abi", b => b.abilities.length + b.abilities.map(id => ABILITIES[id].name).join()],
["pwr", "Pwr", statSum]
];
let labSort = "name", labDir = 1;
function setLabSort(k) { labDir = labSort === k ? -labDir : "name" === k ? 1 : -1, labSort = k, $("s-lab").classList.contains("active") ? renderLab() : renderBooGrid() }
function fillSort(el) {
el.style = "display:flex;gap:4px;flex-wrap:wrap;align-items:center;justify-content:center;width:100%;max-width:700px;margin-bottom:4px;";
el.innerHTML = '<span style="font-size:9px;color:#888;">Sort by</span>' +
BREED_SORT.map(([k, l]) => `<button class="bt${labSort===k?" card-sel":""}" style="min-width:0;height:auto;padding:2px 7px;font-size:9px;" onclick="setLabSort('${k}')">${l}</button>`).join("");
return el
}
const sortedOwned = () => { const val = BREED_SORT.find(r => r[0] === labSort)[2]; return [...bugsOwned].sort((x, y) => { const a = val(x), b = val(y); return labDir * ((a > b) - (a < b)) }) };
function renderLabGrid(grid) {
grid.innerHTML = "", sortedOwned().forEach(b => {
const div = makeKillableCard(b, {
uid: "lab",
onImgTap: cardDiv => { cardDiv.dataset.gone || labPick(b, cardDiv, grid, !0) },
onKill: cardDiv => {
bugsOwned = bugsOwned.filter(x => x.id !== b.id), labSt.pA?.id === b.id && (labSt.pA = null), labSt.pB?.id === b.id && (labSt.pB = null), labBar();
freezeCardAsGone(cardDiv), labApplyAll(grid)
}
});
const btn = document.createElement("button");
btn.className = "bt-sel", btn.style = "width:100%;margin-top:4px;font-size:10px;", div.appendChild(btn), div.dataset.bid = b.id, labApplyCard(div, b), div.onclick = e => {
if (e.stopPropagation(), div.dataset.gone) return;
closeKill(), labPick(b, div, grid, !1)
}, grid.appendChild(div)
}), labBar()
}
function labBar() {
const bar = $("lab-topbar");
if (!bar) return;
const st = labSt;
if (st.pA && st.pB) {
bar.innerHTML = `<button class="nav-lab wide">🧬 Breed ${st.pA.name} and ${st.pB.name}</button>`;
bar.querySelector("button").onclick = e => { e.stopPropagation(), breedNow() }
} else {
bar.innerHTML = '<button class="prim wide" disabled>Select Parent A and Parent B</button>'
}
}
function closeKill() {
if (!killPh) return;
killPhClose && killPhClose();
killPhClose = null, killPh = null
}
const HUE_OFF = [-40, -20, 20, 40];
const mutQ4 = () => { const r = random(); return r < .25 ? -1 : r < .5 ? 0 : r < .75 ? 1 : 2 };
function markMeta(card, b) {
if (!b.meta) return;
const rows = card.querySelectorAll(".sr");
SK.forEach((k, i) => {
const row = rows[i + 1], m = b.meta[k], p = b.meta[k + "P"];
if (!row || !(m || p)) return;
const sp = document.createElement("span");
sp.style = "position:absolute;right:0;font-size:8px;color:" + (m > 0 ? "#4f8" : "#e44");
sp.innerHTML = (p ? `<span style="color:${p === "A" ? "#ffdd44" : "#ff9933"}">${p}</span> ` : "") + (m ? (m > 0 ? "+" : "") + m : ""), row.appendChild(sp)
})
}
const parentTier = (a, b) => max(tierOf(statSum(a)), tierOf(statSum(b))),
FX_SIZE = [0, .4, .55, .7, .85, 1], FX_SPREAD = [0, .4, .75, 1, 1, 1], FX_COL = ["#4cf", "#fd4", "#a4f", "#4f8", "#f48", "#fff"];
function labFx() {
const l = labSt.larva, cc = $("lab-child-row").firstChild, s = statSum(l);
if (l.dead) return;
let src = [], lv = starsOf(s);
if (tierOf(s) > parentTier(labSt.pA, labSt.pB)) {
const u = document.createElement("span");
u.textContent = " ▲ NEW TIER", u.style = "color:#fd4;font-size:8px", cc.querySelector(".card-lbl").appendChild(u), lv = 5;
const r = u.getBoundingClientRect();
src = [0, 1, 2, 3, 4].map(i => [r.left + r.width * i / 5, r.left + r.width * (i + 1) / 5, r.bottom])
} else if (tierOf(s) === parentTier(labSt.pA, labSt.pB) && s > max(statSum(labSt.pA), statSum(labSt.pB))) src = [...cc.querySelectorAll(".sx")].map(e => { const r = e.getBoundingClientRect(); return [r.left, r.right, r.bottom] });
if (!src.length) return;
const cv = document.createElement("canvas"), cx = cv.getContext("2d"), d = devicePixelRatio || 1, W = innerWidth, H = innerHeight, k = FX_SIZE[lv];
let parts = [], left = src.length, last = performance.now();
cv.style = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:400", cv.width = W * d, cv.height = H * d, cx.scale(d, d), document.body.appendChild(cv);
src.forEach(([x0, x1, y], i) => setTimeout(() => {
left--, SFX.hatch();
for (let j = 0; j < 55; j++) { const a = rf(-.95 * PI, -.05 * PI), v = rf(260, 620); parts.push({ x: rf(x0, x1), y: y, vx: cos(a) * v * FX_SPREAD[lv], vy: sin(a) * v, w: rf(5, 9) * k, h: rf(3, 6) * k, r: rf(0, 6), vr: rf(-10, 10), c: FX_COL[j % 6], t: 0, life: rf(1.8, 2.8) }) }
}, 190 * i));
requestAnimationFrame(function step(now) {
const dt = min(.05, (now - last) / 1e3);
last = now, cx.clearRect(0, 0, W, H);
parts = parts.filter(p => {
p.t += dt, p.vx *= 1 - 1.2 * dt, p.vy = p.vy * (1 - 1.2 * dt) + 700 * dt, p.x += p.vx * dt, p.y += p.vy * dt, p.r += p.vr * dt;
const f = abs(cos(8 * p.t));
cx.save(), cx.globalAlpha = clamp(2 * (p.life - p.t), 0, 1), cx.translate(p.x, p.y), cx.rotate(p.r), cx.fillStyle = p.c, cx.fillRect(-p.w / 2, -p.h / 2 * f, p.w, p.h * f + 1), cx.restore();
return p.t < p.life && p.y < H + 40
});
parts.length || left ? requestAnimationFrame(step) : cv.remove()
})
}
function computeOffspring(a, b) {
const name = childName(a, b), child = { gen: max(a.gen, b.gen) + 1, name: name || "Dead", dead: !name, meta: {} };
const hr = random();
child.hue = hr < 1 / 3 ? a.hue : hr < 2 / 3 ? b.hue : ((random() < .5 ? a.hue : b.hue) + HUE_OFF[ri(4)] + 360) % 360, child.morph = mixMorph(a, b);
const avg = {};
SK.forEach(k => { const s = a[k] + b[k], h = s % 2 && rsign(); child[k] = avg[k] = (s + h) / 2, h && (child.meta[k + "P"] = h > 0 === a[k] > b[k] ? "A" : "B") });
shuf(SK.slice()).slice(0, 2).forEach(k => child[k] = clamp(child[k] + mutQ4(), 1, 20));
capSum(child), SK.forEach(k => child.meta[k] = child[k] - avg[k]);
return inheritAbilities(child, a, b), child
}
function labBack() {
const newId = labSt.larva.id;
openLab();
const div = document.querySelector(`.pick-grid .card[data-bid="${newId}"]`);
div && (div.scrollIntoView({ block: "center" }), flashBlocked(div))
}
