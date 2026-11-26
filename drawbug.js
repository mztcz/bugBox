function drawBugStyled(ctx, b, x, y, dir, alpha = 1, highlighted = !1, phase = null, hueOv = null, shadow = !0, jaw = null) {
const cfg = ensureMorph(b),
hue = hueOv == null ? b.hue : hueOv;
drawMorphBug(ctx, cfg, morphColor(hue), x, y, dir + HALF_PI, {
alpha: alpha, hue: hue, shadow, jaw,
walk: phase,
glow: highlighted ? glowCol(hue) : null
})
}
const glowCol = hue => `hsl(${hue},80%,60%)`;
// leg phase: a number (both sides), or [[left, right] phases, [left, right] amplitudes] once a turn in place has run (turnIP)
const posPhase = t => { const P = (t.stride || 0) + 2.2 * (t.turnAcc || 0); return t.lw ? [[P + t.lw[0], P + t.lw[1]], t.la || [1, 1]] : P };
function sysAnimPhase() {
ecsQuery("bug", "pos").forEach(e => {
const p = C.pos.get(e), t = C.walk.get(e), q = t.ip || (t.la = null, [0, 0, 0]), dx = p.x - (t._px ?? p.x) - q[0], dy = p.y - (t._py ?? p.y) - q[1];
const dd = norm(p.dir - (t._pd ?? p.dir));
t.stride = (t.stride || 0) + wsOf(t)[6] * hypot(dx, dy), t.turnAcc = (t.turnAcc || 0) + max(0, abs(dd) - q[2]);
t._px = p.x, t._py = p.y, t._pd = p.dir, t.ip = null
})
}
function bugCardH(b, w = 54, h = 54) {
const c = document.createElement("canvas");
return drawMorphCentered(hidpi(c, w, h), b, w, h, PI / 4), c
}
