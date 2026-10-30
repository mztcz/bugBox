const TEAM_HUE = [210, 30];
const VIS_COL = "rgba(180,255,120,.35)";
const nearVisR = b => max(morphR(b) + 2, hasAbil(b, "v360") ? visRangeOf(b) * .25 : 0);
const drawLabel = (txt, x, y, col, px = 7) => (boxCx.fillStyle = col, boxCx.font = px + "px Courier New", boxCx.textAlign = "center", boxCx.fillText(txt, x, y));
const drawRing = (p, r, col) => (boxCx.save(), boxCx.strokeStyle = col, boxCx.globalAlpha = .4, boxCx.lineWidth = 1, boxCx.beginPath(), boxCx.arc(p.x, p.y, r, 0, 7), boxCx.stroke(), boxCx.restore());
function drawZoneVisOverlay() {
if (!sci("zone") && !sci("vis") && !sci("vis1") && !sci("vis2")) return;
ecsQuery("bug", "pos").forEach(e => {
const cb = C.combat.get(e);
if (cb && cb.dead) return;
const p = C.pos.get(e),
b = C.bug.get(e);
if (sci("zone")) {
for (const [a0, a1, col] of [[PI / 3, TAU / 3, "rgba(255,180,60,.10)"], [TAU / 3, PI, "rgba(255,60,60,.14)"]])
for (const sg of [1, -1]) {
boxCx.beginPath(), boxCx.moveTo(p.x, p.y), boxCx.arc(p.x, p.y, 34, p.dir + sg * a0, p.dir + sg * a1, sg < 0), boxCx.closePath();
boxCx.fillStyle = col, boxCx.fill()
}
boxCx.beginPath(), boxCx.arc(p.x, p.y, engageDistOf(b), 0, 7), boxCx.strokeStyle = "rgba(120,200,255,.25)", boxCx.lineWidth = 1, boxCx.stroke()
}
if (sci(combatState ? ((C.team.get(e) || {}).team === 1 ? "vis2" : "vis1") : "vis")) {
const visR = visRangeOf(b);
const fovH = fovHalfOf(b);
boxCx.beginPath(), boxCx.moveTo(p.x, p.y), boxCx.arc(p.x, p.y, visR, p.dir - fovH, p.dir + fovH), boxCx.closePath();
boxCx.strokeStyle = VIS_COL, boxCx.lineWidth = 1, boxCx.stroke(), boxCx.fillStyle = "rgba(180,255,120,.06)", boxCx.fill();
boxCx.beginPath(), boxCx.arc(p.x, p.y, nearVisR(b), 0, 7), boxCx.stroke(), boxCx.fill();
}
})
}
function drawCooldowns() {
if (!sci("abi")) return;
boxCx.font = "8px 'Courier New'", boxCx.textAlign = "left";
ecsQuery("bug", "pos").forEach(e => {
const cb = C.combat.get(e) || {};
if (cb.dead && !(cb.phoenixT > 0) && !(cb.fakeT > 0)) return;
const b = C.bug.get(e),
p = C.pos.get(e),
list = (b.abilities || []).filter(id => id === "phoenix" ? !cb.phoenixUsed : id === "fake" ? cb.fakeUsed < 2 : !0);
const r = morphR(b);
let yy = p.y + 4;
list.forEach(id => {
const has = ABILITIES[id].cd > 0, cd = cb.cd?.[id] || 0;
boxCx.fillStyle = has ? (cd <= 0 ? "#4f8" : "#fa6") : "#c8f";
boxCx.fillText(`${ABILITIES[id].name}${has?" "+(cd<=0?"\u2713":(cd/1000).toFixed(1)):""}`, p.x + r + 4, yy), yy += 9
})
})
}
// red hit flash; tutorial: blue tint with blue glow fading in 0.35 s
const tint = (b, col, a, x, y, dir) => a > 0 && a <= 1 && drawMorphBug(boxCx, ensureMorph(b), col, x, y, dir + HALF_PI, { alpha: a, shadow: !1, glow: "#4cf" === col ? col : null }),
drawHit = (b, t, x, y, dir) => (tint(b, "#ff2828", t.hitT, x, y, dir), tutTint?.b === b && tint(b, "#4cf", 1 - (performance.now() - tutTint.at) / 350, x, y, dir));
function sysRender(inCombat) {
const fe = inspected && (ecsQuery("bug", "pos").find(en => C.bug.get(en) === inspected || C.bug.get(en).id === inspected.id) ?? ecsQuery("young").find(en => C.young.get(en).bug === inspected));
fe == null && (inspected = null), syncFowBtn();
sysRenderObstacles(!1), drawZoneVisOverlay();
if (inCombat) {
groundMarks.forEach(m => {
boxCx.globalAlpha = .4 * m.t, boxCx.fillStyle = `hsl(${m.hue},40%,18%)`, boxCx.fillRect(m.x - 8, m.y - 4, 16, 8), boxCx.globalAlpha = 1
});
}
ecsQuery("food", "pos").forEach(e => {
const p = C.pos.get(e);
boxCx.fillStyle = "#c86", boxCx.beginPath(), boxCx.arc(p.x, p.y, 4, 0, 7), boxCx.fill();
boxCx.fillStyle = "#eb9", boxCx.beginPath(), boxCx.arc(p.x - 1, p.y - 1, 1.5, 0, 7), boxCx.fill()
});
ecsQuery("shell", "pos").forEach(drawShell), ecsQuery("young", "pos").forEach(drawYoung);
const ents = inCombat ? ecsQuery("bug", "pos", "team", "combat") : ecsQuery("bug", "pos", "vel", "walk");
const isGrey = e => { const c = C.combat.get(e); return c.dead || c.phoenixT > 0 || c.fakeT > 0 };
const rk = e => { const t = C.walk.get(e); return (t.pair?.phase && t.pair.b === e ? 1 : 0) + (t.top ? 2 : 0) };
const drawOrder = inCombat ? [...ents].sort((a, bb) => (isGrey(a) ? 0 : 1) - (isGrey(bb) ? 0 : 1)) :
[...ents].sort((a, bb) => rk(a) - rk(bb));
const post = [];
drawOrder.forEach(e => {
const b = C.bug.get(e),
p = C.pos.get(e), t = C.walk.get(e);
if (!inCombat) {
drawBugStyled(boxCx, b, p.x, p.y, p.dir, 1, b === inspected, posPhase(t));
drawHit(b, t, p.x, p.y, p.dir);
const r = morphR(b);
post.push(() => {
(!fow && (b === inspected || scienceOn && sci("hp"))) && drawHpBar(p, hpFrac(b), r);
t.prepT > 0 && sci("bite") && drawPrepBar(p, 1 - t.prepT / t.prepMax, r);
scienceOn && sci("nam") && drawLabel(b.name, p.x, p.y - r - 11, "#4cf")
});
return;
}
const tm = C.team.get(e),
cb = C.combat.get(e);
const cfg = ensureMorph(b), r = morphR(b);
if (isGrey(e)) {
cb.greyAt || (cb.greyAt = performance.now());
const k = min(1, floor((performance.now() - cb.greyAt) / 40) / 10);
drawBugStyled(boxCx, b, p.x, p.y, p.dir, 1 - k, b === inspected, null, sci("col") ? TEAM_HUE[tm.team] : null);
drawMorphBug(boxCx, cfg, "#6e6e76", p.x, p.y, p.dir + HALF_PI, { alpha: k, flat: 1, glow: b === inspected ? glowCol(b.hue) : null });
return;
}
cb.greyAt = 0;
const hitFrac = t.hitT || 0;
let offX = 7 * hitFrac * (cb.hitDx || 0) + 7 / 3 * cb.biteT * cos(p.dir),
offY = 7 * hitFrac * (cb.hitDy || 0) + 7 / 3 * cb.biteT * sin(p.dir);
if (cb.loudT > 0) { const amp = (cfg.legLen * 0.5 / 3) * sin(cb.loudT / 20), sa = p.dir + HALF_PI; offX += cos(sa) * amp, offY += sin(sa) * amp }
boxCx.globalAlpha = 1;
const k = cb.airT > 0 ? sin(PI * (1 - cb.airT / cb.airMs)) * (cb.dashT > 0 ? .5 : 1) : 0, by = p.y + offY - bugLen(b) * k * (cb.dashT > 0 ? .5 : 1), s = 1 + .15 * k;
k && (boxCx.fillStyle = "rgba(0,0,0,.45)", boxCx.beginPath(), boxCx.ellipse(p.x, p.y, r * (1 - .4 * k), r * .55 * (1 - .4 * k), p.dir, 0, TAU), boxCx.fill());
boxCx.save(), boxCx.translate(p.x + offX, by), boxCx.scale(s, s);
drawBugStyled(boxCx, b, 0, 0, p.dir, 1, b === inspected, k ? null : posPhase(t), sci("col") ? TEAM_HUE[tm.team] : null);
boxCx.restore();
drawHit(b, t, p.x + offX, by, p.dir);
post.push(() => {
if (cb.stunT > 0) drawLabel("\u2726", p.x, p.y - r - 13, "#fd4", 9)
if (sci("hp")) {
const f = max(0, cb.curHp / cb.maxHp);
drawHpBar(p, f, r, sci("col") ? `hsl(${TEAM_HUE[tm.team]},85%,55%)` : f >= 1 ? "#00ff66" : null)
}
if (sci("nam")) drawLabel(b.name, p.x, p.y - r - 11, 0 === tm.team ? "#44ccff" : "#ffaa44")
if (cb.abT > 0) drawLabel(cb.abTxt, p.x, p.y - r - 19, "#c8f")
if (sci("bite") && cb.prepVisT > 0) {
const prepR = max(0, min(1, 1 - cb.bitePrep / cb.bitePrepMax));
prepR > 0 && drawPrepBar(p, prepR, r)
}
});
if (cb.callT > 0 && sci("visr")) drawRing(p, cb.callR, cb.callCry ? "#f88" : "#8f8")
if (cb.loudT > 0 && sci("visr")) drawRing(p, loudRadius(b), "#ff8")
if (cb.callT > 0 && !cb.callCry && sci("visr")) {
boxCx.save(), boxCx.strokeStyle = "#8f8", boxCx.globalAlpha = .8, boxCx.lineWidth = 1.5, boxCx.beginPath();
boxCx.moveTo(cb.callX - 4, cb.callY - 4), boxCx.lineTo(cb.callX + 4, cb.callY + 4);
boxCx.moveTo(cb.callX + 4, cb.callY - 4), boxCx.lineTo(cb.callX - 4, cb.callY + 4);
boxCx.stroke(), boxCx.restore();
}
boxCx.globalAlpha = 1;
});
sysRenderObstacles(!0), post.forEach(fn => fn());
if (fow) {
const fp = C.pos.get(fe), fb = C.bug.get(fe) || inspected,
fr = visRangeOf(fb), fh = fovHalfOf(fb), fhr = nearVisR(fb);
boxCx.save(), boxCx.beginPath(), boxCx.rect(-9, -9, boxLW + 18, boxLH + 18);
boxCx.moveTo(fp.x + fhr * cos(fp.dir + fh), fp.y + fhr * sin(fp.dir + fh));
boxCx.arc(fp.x, fp.y, fhr, fp.dir + fh, fp.dir - fh + TAU), boxCx.arc(fp.x, fp.y, fr, fp.dir - fh, fp.dir + fh), boxCx.closePath();
boxCx.fillStyle = boxCx.shadowColor = "#000", boxCx.shadowBlur = fr / 4, boxCx.fill("evenodd"), boxCx.restore();
boxCx.strokeStyle = VIS_COL, boxCx.lineWidth = 1.5, boxCx.stroke()
}
if (inCombat && sci("dmg")) {
boxCx.textAlign = "center", boxCx.font = "bold 9px 'Courier New'";
dmgPops.forEach(d => {
boxCx.save(), boxCx.globalAlpha = max(0, min(1, d.t));
boxCx.fillStyle = d.team === 0 ? "#f66" : "#4cf";
boxCx.fillText(round(d.amount), d.p.x + d.x, d.p.y + d.y);
boxCx.restore()
})
}
drawCooldowns();
if (inCombat && scienceOn) { const [a0, a1, h0, h1] = teamAlive(ents); boxCx.save(), boxCx.fillStyle = "#fff", boxCx.font = "9px 'Courier New'", boxCx.textAlign = "center", boxCx.textBaseline = "top";
const y = boxK() < 1 ? -24 : 4;
boxCx.fillText(`${a0} (${h0}%) : ${a1} (${h1}%)`, boxLW / 2, y), boxCx.fillText(fmtT(fightMs), boxLW / 2, y + 11), boxCx.restore() }
const infoEl = $("box-info");
if (inspected) { infoEl.innerHTML = inspectLine(inspected); return }
if (!inCombat) return void(infoEl.textContent = `${bugsOwned.length} bug${1!==bugsOwned.length?"s":""} \u2014 select a bug to inspect`);
const [a0, a1] = teamAlive(ents);
infoEl.textContent = `Fight #${fightNum} \u2014 YOURS: ${a0} alive \u00b7 ${a1} alive :ENEMY \u2014 food ${foodLeft}`
}
function teamAlive(ents) {
const live = ents.filter(e => { const c = C.combat.get(e); return !c.dead || c.phoenixT > 0 });
const n = tm => live.filter(e => tm === C.team.get(e).team).length, h = tm => { let c = 0, m = 0; ents.forEach(e => { const cb = C.combat.get(e); tm === C.team.get(e).team && (c += max(0, cb.curHp), m += cb.maxHp) }); return round(100 * c / (m || 1)) };
return [n(0), n(1), h(0), h(1)]
}
// young: egg, larva (animated only while crawling, y.mv) (grub, caterpillar, worm), pupa / cocoon, shells and husks
const eggShape = (c, r) => (c.fillStyle = "#8d8a80", c.beginPath(), c.ellipse(0, 0, r, r * .74, 0, 0, 7), c.fill(), c.fillStyle = "#a5a298", c.beginPath(), c.ellipse(-r * .22, -r * .22, r * .4, r * .28, 0, 0, 7), c.fill()),
wob = y => y.ready && y.wait < YOUNG_SHAKE ? sin(y.t * 34) * .12 * (1 - y.wait / YOUNG_SHAKE) : 0,
zigPath = (c, z) => (c.beginPath(), pathPts(c, z.length, i => z[i])),
inLarva = (c, p, f) => (c.save(), c.translate(p.x, p.y), c.rotate(p.dir + HALF_PI), f(), c.restore());
const LARVA = [(c, y, p) => {
const [L, w] = lSize(y);
inLarva(c, p, () => {
for (let i = 6; i >= 1; i--) { const u = i / 6, r = w * (1 - .45 * u * u) * (1 + .12 * sin(y.mv * 7 - i * .9)); c.fillStyle = i % 2 ? "#eadcc0" : "#dccba9", c.beginPath(), c.ellipse(sin(u * PI) * w * .25, -L / 2 + u * L, r, r * .7, 0, 0, 7), c.fill(), c.strokeStyle = "rgba(110,80,40,.35)", c.lineWidth = .4, c.stroke() }
c.fillStyle = "#7a4a22", c.beginPath(), c.ellipse(0, -L / 2 - w * .1, w * .62, w * .55, 0, 0, 7), c.fill(), c.strokeStyle = "#3a2210", c.lineWidth = .6;
for (const s of [-1, 1]) c.beginPath(), c.moveTo(s * w * .25, -L / 2 - w * .5), c.lineTo(s * w * .1, -L / 2 - w * .85), c.stroke()
})
}, (c, y, p) => {
const w = lSize(y)[1], pts = larvaPts(y, p);
for (let i = 7; i >= 0; i--) {
const [x, yy] = pts[i], r = w * (i ? 1 - .3 * i / 8 : .8) * (1 + .06 * sin(y.mv * 6 - i));
c.fillStyle = i ? `hsl(${y.bug.hue},55%,${i % 2 ? 60 : 52}%)` : `hsl(${y.bug.hue},40%,28%)`, c.beginPath(), c.arc(x, yy, r, 0, 7), c.fill();
if (!i) continue;
const nx = i < 7 ? pts[i - 1][0] - pts[i + 1][0] : 1, ny = i < 7 ? pts[i - 1][1] - pts[i + 1][1] : 0, l = hypot(nx, ny) || 1;
c.fillStyle = "rgba(0,0,0,.45)";
for (const s of [-1, 1]) c.beginPath(), c.arc(x - ny / l * r * .6 * s, yy + nx / l * r * .6 * s, r * .16, 0, 7), c.fill()
}
}, (c, y, p) => {
const [L, w] = lSize(y);
inLarva(c, p, () => {
for (let i = 7; i >= 0; i--) {
const u = i / 7, cy = -L / 2 + u * L, r = w * (.45 + .55 * sin(min(1, u * 1.3 + .15) * PI * .8)), x = sin(y.mv * 5 + i * .8) * w * .35 * i / 8;
c.fillStyle = i % 2 ? "#d9d2c2" : "#c9c0ad", c.beginPath(), c.ellipse(x, cy, r, r * .8, 0, 0, 7), c.fill();
i % 2 || (c.strokeStyle = "rgba(70,60,45,.5)", c.lineWidth = .5, c.beginPath(), c.ellipse(x, cy, r * .95, r * .25, 0, PI * .1, PI * .9), c.stroke())
}
c.fillStyle = "#1d1914";
for (const s of [-1, 1]) c.beginPath(), c.arc(s * w * .18, -L / 2 - w * .1, w * .13 + .3, 0, 7), c.fill()
})
}];
// t = emerge time (0 = closed), k = pupation fade-in
function drawPupa(c, y, p, t, k = 1) {
const [rx, ry] = pupaGeo(y.bug), open = ease(t / 1.2);
c.save(), c.translate(p.x, p.y), c.rotate(p.dir + HALF_PI + (t ? 0 : wob(y)));
if (!y.pv) for (const s of [-1, 1]) {
const g = c.createLinearGradient(-rx, 0, rx, 0);
c.save(), c.translate(s * open * rx * .9, 0), c.rotate(s * open * .15), c.beginPath(), c.ellipse(0, 0, rx, ry, 0, s < 0 ? HALF_PI : -HALF_PI, s < 0 ? HALF_PI * 3 : HALF_PI), c.closePath(), c.clip();
g.addColorStop(0, "#5c3816"), g.addColorStop(.45, "#a8743a"), g.addColorStop(1, "#4e2e12"), c.fillStyle = g, c.globalAlpha *= k, c.fillRect(-rx, -ry, rx * 2, ry * 2), c.strokeStyle = "rgba(40,22,8,.6)", c.lineWidth = .5;
for (let i = 1; i < 6; i++) c.beginPath(), c.ellipse(0, -ry + i * ry / 3, rx, ry * .12, 0, 0, PI), c.stroke();
c.restore()
} else {
t && (c.beginPath(), c.rect(-rx * 2, -ry * .45, rx * 4, ry * 3), c.clip());
c.globalAlpha *= k, c.fillStyle = "#d8d2c4", c.beginPath(), c.ellipse(0, 0, rx * 1.05, ry * 1.08, 0, 0, 7), c.fill(), c.strokeStyle = "rgba(250,246,236,.85)", c.lineWidth = .35;
for (let i = 0; i < 16; i++) c.beginPath(), c.ellipse(0, (-ry + i * .618 % 1 * ry * 2) * .9, rx * 1.05, ry * .3, sin(i * 2.39) * .25, 0, PI * 1.4), c.stroke();
t && (c.strokeStyle = "#9c9484", c.lineWidth = .6, zigPath(c, zig(-rx, -ry * .45, rx, -ry * .45, 6, ry * .08)), c.stroke())
}
c.restore()
}
function drawYoung(e) {
const y = C.young.get(e), p = C.pos.get(e), c = boxCx, L = () => LARVA[y.lt](c, y, p), fade = (a, f) => (c.save(), c.globalAlpha *= a, f(), c.restore()), k = ease(y.t / 4.8);
c.save(), y.bug === inspected && (c.shadowColor = glowCol(y.bug.hue), c.shadowBlur = 14);
if ("egg" === y.st) {
c.translate(p.x, p.y), c.rotate(wob(y)), eggShape(c, y.r);
y.ready && y.wait < YOUNG_SHAKE && (c.strokeStyle = "rgba(40,36,30,.8)", c.lineWidth = .5, zigPath(c, zig(-y.r * .5, -y.r * .2, y.r * .5, y.r * .15, 5, y.r * .12)), c.stroke())
} else if ("emerge" === y.st) {
const [x, yy, d] = bugAt(y, p, y.t);
c.shadowBlur = 0, drawBugStyled(c, y.bug, x, yy, p.dir, 1, y.bug === inspected, d > 0 ? { wL: .32 * d, wR: .32 * d } : null), drawPupa(c, y, p, max(.01, y.t))
} else "hatch" === y.st ? fade(ease(y.t / .9), L) : "larva" === y.st ? L() : "pupating" === y.st ? (fade(1 - k, L), drawPupa(c, y, p, 0, k)) : drawPupa(c, y, p, 0);
c.restore()
}
function drawShell(e) {
const s = C.shell.get(e), p = C.pos.get(e), c = boxCx;
c.save(), c.globalAlpha = min(1, (s.life - s.t) / 3);
if ("husk" === s.k) drawPupa(c, s.o, p, 1.8);
else c.translate(p.x, p.y), c.rotate(s.rot), "egg" === s.k ? (zigPath(c, s.poly), c.closePath(), c.clip(), eggShape(c, s.r), c.fillStyle = "rgba(0,0,0,.18)", c.beginPath(), c.ellipse(0, 0, s.r * .7, s.r * .5, 0, 0, 7), c.fill()) :
(c.fillStyle = "#9b988e", c.beginPath(), c.moveTo(0, -s.s), c.lineTo(s.s * .8, s.s * .5), c.lineTo(-s.s * .6, s.s * .4), c.closePath(), c.fill());
c.restore()
}
