let drag = null, suppressClick = !1, holdT = 0;
const DRAG_SLOP = 8, HOLD_MS = 250, hold = (ms, fn) => holdT = setTimeout(fn, ms);
const dragAt = (t, cx, cy, p = C.pos.get(t.e)) => ("bug" === t.kind && mateCancel(t.e), drag = { ...t, ox: p.x - cx, oy: p.y - cy, sx: cx, sy: cy, moved: !1 }, ecsFront(t.e));
const boxPt = e => { const r = boxCv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top] };
function nearest(comps, cx, cy, radius, dist = en => hypot(C.pos.get(en).x - cx, C.pos.get(en).y - cy)) {
let hit = null, best = 1 / 0;
ecsQuery(...comps).forEach(en => {
const d = dist(en), r = radius(en);
d < r && d < best && (best = d, hit = en)
});
return hit
}
function obstacleAt(cx, cy) { return nearest(["obstacle", "pos"], cx, cy, en => obstCap(en, cx, cy)[3] + 8, en => obstCap(en, cx, cy)[0]) }
function draggableAt(cx, cy) {
let e = nearest(["bug", "pos"], cx, cy, en => bugLen(C.bug.get(en)));
if (e != null) return { e: e, kind: "bug", pad: 21 };
e = nearest(["food", "pos"], cx, cy, () => 10);
if (e != null) return { e: e, kind: "food", pad: 5 };
e = obstacleAt(cx, cy);
return e == null ? null : { e: e, kind: "obstacle", pad: C.obstacle.get(e).r }
}
function dragStart(e) {
const [cx, cy] = boxPt(e), t = draggableAt(cx, cy);
suppressClick = !1, t || hold(HOLD_MS, () => canPlaceFood() && (ecsSpawn({ food: {}, pos: { x: cx, y: cy, dir: 0 } }), SFX.feed(), combatState && foodLeft--, suppressClick = !0));
if (!t || combatState) return;
dragAt(t, cx, cy);
boxCv.setPointerCapture && boxCv.setPointerCapture(e.pointerId)
}
function dragMove(e) {
if (!drag) return;
const [cx, cy] = boxPt(e), p = C.pos.get(drag.e);
if (!p) return void(drag = null);
if (!drag.moved && hypot(cx - drag.sx, cy - drag.sy) < DRAG_SLOP) return;
drag.moved || achieve({ bug: "drag", obstacle: "dragObst" }[drag.kind]), drag.moved = !0;
p.x = clamp(cx + drag.ox, drag.pad, boxLW - drag.pad);
p.y = clamp(cy + drag.oy, drag.pad, boxLH - drag.pad);
"bug" === drag.kind && (think(drag.e), C.walk.get(drag.e).dropStuck = C.walk.get(drag.e).top = 1);
if ("food" !== drag.kind && hypot(cx - drag.sx, cy - drag.sy) > 6) {
const a = atan2(cy - drag.sy, cx - drag.sx), d = drag.ha == null ? 0 : norm(a - drag.ha);
drag.ha = a, drag.sx = cx, drag.sy = cy, abs(d) < 2 && (drag.turn = (drag.turn || 0) + d);
const s = sign(drag.turn);
abs(drag.turn) > 5.6 && ("bug" === drag.kind ? p.dir = norm(p.dir + s * PI / 4) : (achieve("rotObst"), C.obstacle.get(drag.e).rot += s * PI / 4), drag.turn -= s * TAU)
}
e.preventDefault()
}
function endDrag() { drag && (suppressClick = drag.moved, drag = null) }
