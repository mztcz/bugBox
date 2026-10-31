function drawBugStyled(ctx, b, x, y, dir, alpha = 1, highlighted = !1, phase = null, hueOv = null) {
const cfg = ensureMorph(b),
hue = hueOv == null ? b.hue : hueOv;
drawMorphBug(ctx, cfg, morphColor(hue), x, y, dir + HALF_PI, {
alpha: alpha, hue: hue,
walk: phase,
glow: highlighted ? glowCol(hue) : null
})
}
const glowCol = hue => `hsl(${hue},80%,60%)`;
const posPhase = t => (t.stride || 0) + 2.2 * (t.turnAcc || 0);
function sysAnimPhase() {
ecsQuery("bug", "pos").forEach(e => {
const p = C.pos.get(e), t = C.walk.get(e), dx = p.x - (t._px ?? p.x), dy = p.y - (t._py ?? p.y);
const dd = norm(p.dir - (t._pd ?? p.dir));
t.stride = (t.stride || 0) + .32 * hypot(dx, dy), t.turnAcc = (t.turnAcc || 0) + abs(dd);
t._px = p.x, t._py = p.y, t._pd = p.dir
})
}
function bugCardH(b, w = 54, h = 54) {
const c = document.createElement("canvas");
return drawMorphCentered(hidpi(c, w, h), b, w, h, PI / 4), c
}
