$("game-version-tag").textContent = "v" + GAME_VERSION;
let devBug;
! function() {
const ctx = hidpi($("intro-art"), 200, 60), hues = shuf([120, 30, 275]);
ctx.fillStyle = "#0a0a12", ctx.fillRect(0, 0, 200, 60), [40, 100, 160].forEach((cx, i) => {
const m = randomMorph(), s = morphFit(m, 52, 48)[0] * .9;
drawMorphBug(ctx, m, morphColor(hues[i]), cx, 32, 0, { scale: s, shadow: !1, hue: hues[i] }), devBug = { m, s }
}), ctx.fillStyle = "#ffdd44", [
[10, 6],
[190, 6],
[10, 52],
[190, 52]
].forEach(([x, y]) => ctx.fillRect(x, y, 2, 2))
}();
$("bt-buy").onclick = shopDone;
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
if (itemSel != null) return hit && bugsOwned.includes(hit) && !combatState ? itemOnBug(hit) : itemSel = null;
if (hit) { inspected = hit === inspected ? null : hit, inspected && achieve("inspect"); return }
if (combatState) {
const now = performance.now();
tapT = tapT.filter(o => now - o.t < TAP_MS && hypot(o.x - cx, o.y - cy) < TAP_R), tapT.push({ x: cx, y: cy, t: now });
if (tapT.length >= 3) return tapT = [], void panicAll()
}
inspected = null
}, window.addEventListener("resize", () => {
$("s-box").classList.contains("active") && !combatState ? spawnBox() : resizeBoxCV()
}), document.addEventListener("click", e => {
if (e.target.closest(".bt-boo")) return leaveFight(), openBoo(), showScreen("s-boo");
if (e.target.closest(".bt-shop")) return leaveFight(), openShop();
if (e.target.closest(".bt-lab")) return leaveFight(), openLab();
if (e.target.closest(".bt-inv")) return openInv();
e.target.closest(".bt-box") && (leaveFight(), openBox())
}), document.addEventListener("click", closeKill), $("bt-combat").onclick = e => startFight(e.currentTarget, "mc" === fightMode ? 0 : enemyTier), $("bt-next").onclick = e => startFight(e.currentTarget, enemyTier + 1);
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
// Dev = tap on the body or head of the 3rd intro bug (x 160): fills only, legs and antennae are strokes drawn transparent
const devHit = e => {
const r = e.target.getBoundingClientRect(), g = Object.assign(document.createElement("canvas"), { width: 1, height: 1 }).getContext("2d");
g.translate(160.5 - (e.clientX - r.left) * 200 / r.width, 32.5 - (e.clientY - r.top) * 60 / r.height), g.scale(devBug.s, devBug.s), g.fillStyle = "#fff", g.strokeStyle = "#0000", renderMorphParts(g, devBug.m, null, null, !1);
return g.getImageData(0, 0, 1, 1).data[3] > 0
};
// saved game: valid = TAP TO CONTINUE or NEW GAME (Pure, after a confirm) (dev from the save, opens the box); broken or old format = kept as bugbox_save_bad, new game
let saved = null, raw = null;
try { raw = localStorage.getItem(SAVE_KEY), saved = raw && JSON.parse(raw) } catch (e) {}
raw && !saveOk(saved) && (saved = null, dropSave(raw), toast("Saved game can't be loaded. New game"));
saved && ($("s-intro1").querySelector(".press-key").innerHTML = '[ TAP TO CONTINUE ] <span id="bt-new" style="padding:8px 4px;">[ NEW GAME ]</span>');
$("s-intro1").onclick = e => {
// TEMP while developing: a tap on the 3rd bug always starts a new Dev game, even with a save, no confirm.
// Official release: drop dv from go and from the confirm check (with a save, only NEW GAME / TUTORIAL start a new game).
const tut = e.target.closest("#bt-tut"), dv = "intro-art" === e.target.id && devHit(e), go = saved && !tut && !dv && !e.target.closest("#bt-new");
if (saved && !go && !dv && !confirm("Start a new game?")) return;
if (go) try { gameOn = 1, loadGame(saved) } catch (err) { return dropSave(JSON.stringify(saved)), location.reload() }
else dev = dv ? 1 : 0;
dev || ($("bt-des").style.display = "none");
// new game: Legacy screen first when there is DNA or a bought level
go ? openBox() : dna.n || dna.lv.some(l => l) ? (renderLegacy(), $("bt-leg").onclick = () => legGo(tut), showScreen("s-leg")) : legGo(tut)
};
// autosave every 5 s in a fight, every 10 s in the peaceful box
let saveN = 0;
setInterval(() => (runTick(), combatState || scrOn("s-box") && ++saveN % 2 < 1) && saveGame(), 5e3);
// save code = base64 of the save JSON (UTF-8)
const impRow = on => $("imp-row").style.display = on ? "flex" : "none";
$("bt-exp").onclick = () => {
const t = $("imp-txt");
impRow(1), t.value = btoa(unescape(encodeURIComponent(JSON.stringify(gameSnap())))), t.select();
(navigator.clipboard?.writeText(t.value) || Promise.reject()).then(() => toast("Save code copied"), () => toast("Copy the code"))
};
$("bt-imp").onclick = () => (impRow(1), $("imp-txt").value = "", $("imp-txt").focus());
$("bt-imp-ok").onclick = () => {
let s;
try { s = JSON.parse(decodeURIComponent(escape(atob($("imp-txt").value.trim())))) } catch (e) {}
saveOk(s) ? confirm("Load this save? The current game is replaced.") && (gameOn = 0, localStorage.setItem(SAVE_KEY, JSON.stringify(s)), location.reload()) : toast("Invalid save code")
};
$("bt-set").onclick = () => {
$("gset-mus").value = sound.mus * 100, $("gset-sfx").value = sound.sfx * 100, $("gset-mv").value = sound.mv;
$("gset-sci").checked = scienceOn;
$("gset-bg").checked = !!bgOn;
$("gset-thm").value = bugTheme;
$("gset-gait").value = gait, $("gset-turn").value = turnMode, $("gset-turn").parentNode.style.display = dev ? "" : "none";
$("gset-pal").value = palette;
impRow(0), ov("ov-set", 1)
};
$("gset-mus").oninput = e => (sound.mus = e.target.value / 100, mus.side = -1);
$("gset-sfx").onchange = e => (sound.sfx = e.target.value / 100, SFX.feed());
$("gset-mv").onchange = e => sound.mv = +e.target.value;
// audio starts on the first tap (browser rule), pauses while the page is hidden; music scheduler every 100 ms
["pointerdown", "pointerup"].forEach(t => addEventListener(t, () => document.hidden || "running" === sound.ctx?.state || actx().resume(), !0));
document.addEventListener("visibilitychange", () => sound.ctx && sound.ctx[document.hidden ? "suspend" : "resume"]());
setInterval(musTick, 100);
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
// Find a bug: peaceful box + focus, dragIt = drag it with the finger while held; tutorial hold: 3 red hit flashes
const findBug = (b, e, dragIt) => (dragIt && [8, 9].includes(tutStep) && [300, 700, 1100].forEach(ms => setTimeout(() => bugHit(b), ms)), achieve("find"), closeKill(), leaveFight(), openBox(), cardDrag = dragIt, requestAnimationFrame(() => requestAnimationFrame(() => {
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
