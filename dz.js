let dz = Object.assign({ hue: 120, con: 5, str: 5, agi: 5, int: 5, per: 5, link: 1, abils: ["", "", "", ""] }, randomMorph()),
dzSide = 0, dzZoom = 1;
dzSync();
function dzSync() { dz.link && Object.assign(dz, statMorph(dz)) }
const DZ_ROWS = [["hue", "Hue", 0, 340, 20], ["bodySegments", "Segments"], ["segmentGradient", "Gradient"],
["headGear", "Gear type", 0, GEAR_KEYS.length - 1], ["bodyLength", "Length"], ["bodyWidth", "Width"],
["legLen", "Legs"], ["headSize", "Head"], ["headGearSize", "Gear size"]],
DZ_RED = ["hue", "bodySegments", "segmentGradient", "headGear"],
dzLo = r => r[2] ?? MORPH_RANGE[r[0]][0],
dzStep = r => r[4] ?? 1,
dzHi = r => r[3] ?? MORPH_RANGE[r[0]][1],
dzVal = k => k === "headGear" ? GEAR_KEYS.indexOf(dz.headGear) : dz[k],
dzTxt = k => k === "headGear" ? GEAR_LABEL[dz.headGear] : k === "headGearSize" ? SIZE_LABEL[dz.headGearSize] : k in MORPH_STAT ? round(dz[k] * 10) / 10 : dz[k],
dzLocked = k => dz.link && k in MORPH_STAT;
function dzRefresh() {
DZ_ROWS.forEach(r => {
const k = r[0], el = $("dz-" + k);
if (!el) return;
const lock = dzLocked(k);
el.disabled = lock, el.value = dzVal(k), $("dz-val-" + k).textContent = dzTxt(k);
el.parentNode.className = "dz-row" + (DZ_RED.includes(k) ? " dzr" : "") + (lock ? " dzl" : "")
});
SK.forEach(k => { const e = $("dz-val-" + k); e && (e.textContent = dz[k]) })
}
function dzAbils(slot) {
const taken = dz.abils.filter((a, i) => a && i !== slot);
return `<option value="">Ability ${slot + 1}</option>` + ABIL_IDS.filter(id => !taken.includes(id))
.sort((a, b) => SK.indexOf(ABILITIES[a].stat) - SK.indexOf(ABILITIES[b].stat) || ABILITIES[a].name.localeCompare(ABILITIES[b].name))
.map(id => `<option value="${id}"${dz.abils[slot] === id ? " selected" : ""}>(${ABILITIES[id].stat.toUpperCase()}) ${ABILITIES[id].name}</option>`).join("")
}
function dzStatRows() {
return SK.map(k => `<div class="dz-row"><span class="dz-lbl">${k.toUpperCase()} <b id="dz-val-${k}">${dz[k]}</b></span>
     <input type="range" id="dz-${k}" min="1" max="20" value="${dz[k]}"></div>`).join("")
}
function dzExtras() {
$("dz-extras").innerHTML = dzStatRows();
$("dz-abils").innerHTML =
[0, 1, 2, 3].map(i => `<div class="dz-row"><select id="dz-abil-${i}">${dzAbils(i)}</select></div>`).join("") +
(combatState ? `<div class="dz-row"><span class="dz-lbl">Add to</span>
       <button class="bt" id="bt-des-side" style="padding:2px 8px;">${dzSide === 0 ? "YOUR TEAM" : "ENEMY"}</button></div>` : "");
SK.forEach(bindRange);
[0, 1, 2, 3].forEach(i => {
$("dz-abil-" + i).onchange = ev => {
const id = dz.abils[i] = ev.target.value;
if (id) { const k = ABILITIES[id].stat; dz[k] = max(dz[k], 5), capSum(dz, s => dz.abils.some(a => a && ABILITIES[a].stat === s) ? 5 : 1) }
dzSync(), dzExtras(), dzRefresh()
}
});
const sideBtn = $("bt-des-side");
sideBtn && (sideBtn.onclick = () => { dzSide = dzSide ? 0 : 1, dzExtras() })
}
function bindRange(k) {
const el = $("dz-" + k);
el.oninput = () => {
let v = parseInt(el.value);
SK.includes(k) && (el.value = v = min(v, STAT_SUM_MAX - statSum(dz) + dz[k]));
k === "headGear" ? dz.headGear = GEAR_KEYS[v] : dz[k] = v;
SK.includes(k) && dzSync(), dzRefresh()
}
}
function openDz() {
ov("ov-design", 1);
const ctr = $("dz-ctr");
if (!ctr.dataset.done) {
ctr.dataset.done = "1";
ctr.innerHTML = `<div class="dz-row"><span class="dz-lbl">Stat-linked</span>
       <input type="checkbox" id="dz-link"${dz.link?" checked":""}></div>` +
DZ_ROWS.map(r => `<div class="dz-row"><span class="dz-lbl">${r[1]} <b id="dz-val-${r[0]}">${dzTxt(r[0])}</b></span>
       <input type="range" id="dz-${r[0]}" min="${dzLo(r)}" max="${dzHi(r)}" step="${dzStep(r)}" value="${dzVal(r[0])}"></div>`).join("");
DZ_ROWS.forEach(r => bindRange(r[0]));
$("dz-link").onchange = e => {
dz.link = e.target.checked ? 1 : 0;
dzSync(), dzRefresh()
};
$("bt-des-rnd-m").onclick = () => {
const m = randomMorph();
dz.link && Object.keys(MORPH_STAT).forEach(k => delete m[k]);
Object.assign(dz, { hue: 20 * ri(18) }, m), dzRefresh(), dzExtras()
};
$("bt-des-rnd-s").onclick = () => {
SK.forEach(k => dz[k] = 1 + ri(10));
dzSync(), dzRefresh(), dzExtras()
};
$("dz-zoom").oninput = ev => dzZoom = (500 - ev.target.value) / 100;
$("bt-des-spawn").onclick = dzSpawn
}
dzExtras(), dzRefresh();
dzFit();
$("bt-des-spawn").textContent = "Spawn";
const cv = $("dz-cv"), ctx = hidpi(cv, 150, 130);
cancelAnimationFrame(dzAnim);
! function tick() {
ctx.clearRect(0, 0, 150, 130), ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 150, 130);
drawMorphBug(ctx, dz, morphColor(dz.hue), 75, 65 + 2 * dz.headSize * dzZoom, 0,
{ hue: dz.hue, scale: dzZoom, walkL: .006 * performance.now(), walkR: .006 * performance.now() });
dzAnim = requestAnimationFrame(tick)
}()
}
function dzFit() {
const r = boxCv.getBoundingClientRect(), fr = $("dz-box");
if (!r.height) return;
fr.style.maxHeight = (r.height - 8) + "px";
fr.style.marginTop = max(4, r.top + (r.height - fr.offsetHeight) / 2) + "px"
}
function dzSpawn() {
const { hue, con, str, agi, int: intel, per, abils, link, ...m } = dz,
picked = abils.filter(a => a),
nb = makeBug({ hue: hue, morph: { ...m }, con: con, str: str, agi: agi, int: intel, per: per, abilities: picked });
if (link || Object.assign(nb.morph, m), !combatState) return bugsOwned.push(nb), achOwn(1), void updateMoney();
const mhp = maxHpOf(nb);
nb.curHp = mhp;
const c = bugEntity(nb, 0 === dzSide ? .18 * boxLW : .82 * boxLW, 30 + random() * (boxLH - 60), 0 === dzSide ? 0 : PI, dzSide);
c.vel.wanderAngle = 0;
c.combat = newCombat(nb, mhp, mhp);
think(ecsSpawn(c));
}
