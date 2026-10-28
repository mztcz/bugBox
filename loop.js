let simLastT = 0,
tickDebt = 0;
function drawBoxBackdrop() {
boxCx.clearRect(-boxOX, -boxOY, boxLW + 2 * boxOX, boxLH + 2 * boxOY), boxK() < 1 && (boxCx.strokeStyle = "#fa4", boxCx.lineWidth = 2, boxCx.strokeRect(-1, -1, boxLW + 2, boxLH + 2));
if (bgOn && combatState && 3 !== bugTheme) return drawBg();
boxCx.fillStyle = "#0a0809", boxCx.fillRect(0, 0, boxLW, boxLH), boxCx.fillStyle = "#120f0a";
for (let i = 0; i < boxLW; i += 8)
for (let j = 0; j < boxLH; j += 8)(i + j) % 16 == 0 && boxCx.fillRect(i, j, 2, 2);
boxCx.strokeStyle = "#2a2a1a", boxCx.lineWidth = 2, boxCx.strokeRect(2, 2, boxLW - 4, boxLH - 4),
boxCx.fillStyle = "rgba(255,220,50,0.06)", boxCx.font = `${min(.09*boxLW,52)}px 'Courier New'`,
boxCx.textAlign = "center", boxCx.textBaseline = "middle", boxCx.fillText("BUGBOX", boxLW / 2, boxLH / 2)
}
function simLoop(ts) {
simFrame = requestAnimationFrame(simLoop);
const real = simLastT ? min(ts - simLastT, 100) : 16.67;
simLastT = ts;
drawBoxBackdrop();
if (!combatState) ecsQuery("bug").length !== bugsOwned.length && spawnBox();
tickDebt += real * simSpd / COMBAT_STEP_MS;
let guard = 0;
while (tickDebt >= 1 && guard++ < MAX_STEPS_PER_FRAME) {
tickDebt -= 1, tick(COMBAT_STEP_MS, combatState), combatState && checkFightEnd();
}
if (guard >= MAX_STEPS_PER_FRAME) tickDebt = 0;
sysAnimPhase(), syncHud();
sysRender(combatState)
}
function tick(dt, fight) {
if (fight && (fightDone || (fightMs += dt), fightMs <= 1e3)) return;
const dtS = dt / 1e3,
all = ecsQuery("bug", "pos", "vel", "walk");
all.forEach(e => {
const t = C.walk.get(e), b = C.bug.get(e);
t.hitT > 0 && (t.hitT = max(0, t.hitT - dt / 200));
drag?.moved && drag.e === e || C.combat.get(e)?.fakeT > 0 || (t.actT -= "walking" === t.act && t.slide == null && 5e3 * C.vel.get(e).v < spdOf(b) * dt ? 0 : dt) > 0 || ("thinking" === t.act || "fleeing" === t.act ? decide(e) : t.slide != null ? wallNext(e) : think(e))
});
fight && sysCombatAI(dt);
const ents = fight ? all.filter(e => !aiAct(C.walk.get(e)) && !C.combat.get(e).dead) : all;
sysGoToPoint(ents);
sysSteer(dt, ents), sysMove(dtS, all);
fight || (sysRareAct(dt, ents), sysMate(dt, ents)), sysFeed();
sysResolve(all, dtS)
}
let speedBeforePause = 1;
function syncSpeedLabel() {
$("bt-speed").textContent = "Speed " + (simSpd === 0 ? speedBeforePause : simSpd) + "×";
$("bt-pause").textContent = simSpd === 0 ? "\u25b6 PLAY" : "\u275a\u275a PAUSE"
}
