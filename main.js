$("game-version-tag").textContent = "v" + GAME_VERSION;
! function() {
const ctx = hidpi($("intro-art"), 200, 60), hues = shuf([120, 30, 275]);
ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 200, 60), [40, 100, 160].forEach((cx, i) => {
const m = randomMorph();
drawMorphBug(ctx, m, morphColor(hues[i]), cx, 32, 0, { scale: morphFitScale(m, 52, 48), shadow: !1, hue: hues[i] })
}), ctx.fillStyle = "#ffdd44", [
[10, 6],
[190, 6],
[10, 52],
[190, 52]
].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2))
}();
$("bt-buy").onclick = mktDone;
boxCv.addEventListener("pointerdown", dragStart);
boxCv.addEventListener("pointermove", dragMove);
boxCv.addEventListener("pointerup", endDrag);
boxCv.addEventListener("pointercancel", endDrag);
let tapT = [];
const tapHit = (cx, cy) => { const hitE = nearest(["bug", "pos"], cx, cy, en => bugLen(C.bug.get(en))) ?? nearest(["young", "pos"], cx, cy, youngR); return hitE != null && (C.bug.get(hitE) || C.young.get(hitE).bug) };
const TAP_R = 29, TAP_MS = 1000;
boxCv.onclick = e => {
const [cx, cy] = boxPt(e);
if (suppressClick) { suppressClick = !1; return }
const hit = tapHit(cx, cy);
if (hit) { inspected = hit === inspected ? null : hit, inspected && achieve("inspect"); return }
if (combatState) {
const now = performance.now();
tapT = tapT.filter(o => now - o.t < TAP_MS && hypot(o.x - cx, o.y - cy) < TAP_R), tapT.push({ x: cx, y: cy, t: now });
if (tapT.length >= 3) return tapT = [], void panicAll()
}
inspected = null
}, window.addEventListener("resize", () => {
$("s-box").classList.contains("active") && !combatState ? spawnBox() : resizeBoxCV()
}), $("bt-boo").onclick = () => {
openBoo(), showScreen("s-boo")
}, document.addEventListener("click", e => {
if (e.target.closest(".bt-mkt")) return leaveFight(), openMkt();
if (e.target.closest(".bt-lab")) return leaveFight(), openLab();
e.target.closest(".bt-box") && (leaveFight(), openBox())
}), document.addEventListener("click", closeKill), $("bt-combat").onclick = e => startFight(e.currentTarget, "mc" === fightMode ? 1 : enemyTier), $("bt-next").onclick = e => startFight(e.currentTarget, enemyTier + 1);
$("bt-speed").onclick = () => {
const seq = [.5, 1, 2, 4, 16],
cur = simSpd === 0 ? speedBeforePause : simSpd,
next = seq[(seq.indexOf(cur) + 1) % seq.length];
speedBeforePause = next, simSpd === 0 || (simSpd = next), tickDebt = 0, syncSpeedLabel()
}, $("bt-pause").onclick = () => {
simSpd === 0 ? simSpd = speedBeforePause : (speedBeforePause = simSpd, simSpd = 0);
tickDebt = 0, syncSpeedLabel()
}, $("bt-leave").onclick = leaveToBoo, $("bt-res").onclick = () => (renderResult(), ov("ov-res", 1)), $("ov-res").onclick = e => e.target.closest(".res-content") || ov("ov-res", 0), updateMoney();
$("bt-des").onclick = openDz, $("bt-bg").onclick = bgPick, $("bt-unmate").onclick = () => (bugsOwned.forEach(b => b.mated = 0), renderLab());
$("s-intro1").onclick = e => (dev = e.target.closest(".press-key, #bt-tut") ? 0 : 1, dev || ($("bt-des").style.display = "none"), openMkt(), e.target.closest("#bt-tut") && tutGo(2));
$("bt-set").onclick = () => {
$("gset-snd").checked = sound.on;
$("gset-sci").checked = scienceOn;
$("gset-bg").checked = !!bgOn;
$("gset-thm").value = bugTheme;
ov("ov-set", 1)
};
$("gset-snd").onchange = e => { sound.on = e.target.checked };
$("bt-fow").onclick = () => toggleFow();
let tap0, cardDrag = 0;
document.addEventListener("touchstart", e => tap0 = e.touches[0], { passive: !0 });
document.addEventListener("touchmove", e => cardDrag && (e.preventDefault(), drag && dragMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY, preventDefault() {} })), { passive: !1 });
document.addEventListener("touchend", e => {
const t = e.changedTouches[0];
e.target.closest(".card") && hypot(t.clientX - tap0.clientX, t.clientY - tap0.clientY) < 20 && (e.preventDefault(), e.target.click())
});
document.addEventListener("pointerdown", e => {
const c = e.target.closest(".pick-grid .card, #boo-grid .card, #res-body .card");
c && hold(500, () => {
// result card: close the result and focus that bug (alive or corpse) in the fight box
if (c.closest("#res-body")) {
const en = ecsQuery("bug").find(x => String(C.bug.get(x).id) === c.dataset.bid);
return void(ov("ov-res", 0), en != null && (inspected = C.bug.get(en), achieve("find")))
}
const b = bugOfCard(c);
b && findBug(b, e, 1)
})
});
// Find a bug: peaceful box + focus, dragIt = drag it with the finger while held
const findBug = (b, e, dragIt) => (achieve("find"), closeKill(), leaveFight(), openBox(), cardDrag = dragIt, requestAnimationFrame(() => requestAnimationFrame(() => {
const en = ecsQuery("bug").find(x => C.bug.get(x) === b), [cx, cy] = boxPt(e);
inspected = b, cardDrag && en != null && dragAt({ e: en, kind: "bug", pad: 21 }, cx, cy)
})));
// tutorial gate (capture): in forced steps only the current targets react, any other tap flashes them
["pointerdown", "click"].forEach(k => addEventListener(k, e => {
const s = TUT[tutStep], x = e.target, on = el => el?.contains?.(x);
if (!s) return;
"click" === k && setTimeout(tutCheck);
if (!s.f || ("click" === k ? s.t().some(on) && !on(s.p?.()) && !x.closest("#s-lab .card-img") || s.c?.(e) : on(s.p?.()))) return;
e.stopPropagation(), "click" === k && (s.x || tutBlink)(e)
}, !0));
["pointerup", "pointercancel"].forEach(k => document.addEventListener(k, () => (clearTimeout(holdT), cardDrag && (cardDrag = 0, endDrag()))));
