const bugLen = b => b ? ensureMorph(b).bodyLength : 22;
const callRadius = b => bugLen(b) * 7, loudRadius = b => bugLen(b) * 3, dashRange = b => bugLen(b) * 7, flankRange = b => bugLen(b) * 2, flankEnd = cb => { cb.flankA = 0, cb.cd.flanking = ABILITIES.flanking.cd };
const GRAB_HOLD_MS = 2500, FRONT_CONE = 20 * PI / 180, KB_DAMP = .72;
const BITE_PREP_MAX = 2000, BITE_PREP_MIN = 1000;
const ABILITIES = {};
[
["dash", "Dash", "agi", 5e3, 2000, `Leaps at 8x walking speed for up to {d}s at a target between biting reach and 7 body lengths away, and bites the instant it arrives, skipping the wind-up.`],
["jump", "Jump", "agi", 9e3, 600, `As soon as it reaches biting range with the target within 20 degrees of its nose, leaps over the target in {d}s, turning 150-210 degrees in mid-air, and lands at its rear, then turns straight back to it. The target must turn on its own to bite back.`],
["knockout", "Knock Out", "str", 8e3, 2400, `On a bite, stuns the target for {d}s + 0.1s per point your STR beats its CON (min 0.2s). Braced bugs are immune.`],
["kickback", "Kick Back", "str", 5e3, 350, `On a bite, shoves the target 1.5 of its body lengths, plus 0.14 for every point your STR beats its CON (minus 0.14 per point short, min 0.25), stuns it {d}s and, while sliding, spins it 60 degrees per body length shoved (max 180), plus a random -20 to +20 in steps of 10. Braced bugs go half as far, no stun, no spin.`],
["flanking", "Flanking", "int", 6e3, 0, `Once within 2 own body lengths of the target, even in biting reach, sidesteps around it to reach its rear, then bites. Gives up when bitten, when muted by Loud, when the target gets 3 body lengths away, or after circling 270 degrees. The cooldown starts when the flank ends.`],
["strongbite", "Strong Bite", "str", 7e3, 0, `Charges after a bite: the next bite deals double damage.`],
["swiftbite", "Swift Bite", "agi", 7e3, 0, `Charges after a bite: the next bite needs half the usual wind-up (${BITE_PREP_MAX} ms at AGI 1 to ${BITE_PREP_MIN} ms at AGI 20).`],
["backflip", "Backflip", "agi", 6e3, 1000, `After its 3rd bite on the same target, if the target is not stunned, leaps backward and keeps backing off on foot, {d}s in total; the first half is airborne. Slides along any wall it backs into.`],
["grab", "Grab", "str", 9e3, 0, `Seizes an enemy from behind its flanks and drags it 1 body length backward at half walking speed (max ${GRAB_HOLD_MS / 1e3}s). The victim cannot act.`],
["mark", "Mark", "int", 6e3, 3e3, `While it has a target, marks the target's spot with a green X for {d}s. Every ally within 7 body lengths that cannot see an enemy heads there; on arrival with nothing in sight it turns 270 degrees, then resumes its search.`],
["phoenix", "Phoenix", "con", 0, 5000, `Once per fight: on death, lies still for {d}s, then rises again at 10% HP.`],
["fake", "Fake Death", "int", 0, 3000, `Plays dead for {d}s, twice per fight: below 50% HP, then below 25% HP. Enemies stop targeting it.`],
["loud", "Loud", "per", 10e3, 4800, `After a bite attempt, screams for {d}s: every enemy within 3 body lengths cannot use any ability.`],
["cry", "Cry", "per", 0, 7e3, `Passive. When bitten, cries for {d}s: every ally within 7 body lengths that cannot see an enemy comes to its aid and follows it while it moves.`],
["v360", "360", "per", 0, 0, `Passive. Notices anything beside or behind it within a quarter of its sight range.`],
["braced", "Braced", "con", 0, 0, `Passive. Immune to Knock Out and Kick Back stun; Kick Back shoves it half as far and never spins it.`],
["focus", "Focus", "int", 0, 0, `Passive. Targets the weakest visible enemy by current HP instead of the closest one.`],
["tank", "Tank", "str", 0, 0, `Passive. Keeps walking at full speed even while biting and shoves any bug without Tank out of its path. Only the glass stops it.`],
["steadfast", "Steadfast", "agi", 0, 0, `Passive. Walks and turns at double speed, Dash included.`],
["flee", "Flee", "int", 0, 0, `Twice per fight, below 50% HP and below 25% HP, turns away and runs for 4.5-9s (shorter with higher INT) before hunting again. Bitten while stuck, it fights back instead. Plays dead first if it can.`],
["resilient", "Resilient", "con", 0, 0, `Passive. 50% more max HP than its CON alone gives.`],
["chitin", "Chitin", "con", 0, 0, `Passive. Every bite it takes does half damage.`]
].forEach(([id, name, stat, cd, dur, txt]) => ABILITIES[id] = { name, stat, cd, dur, txt });
const ABIL_IDS = Object.keys(ABILITIES);
const ABIL_MAX = 4, ABIL_INHERIT_ONE = .5, ABIL_INHERIT_BOTH = .75;
const ABIL_ROLL_CHANCE = [.5, .5, .25, .25, 0];
const ABIL_BY_STAT = {};
SK.forEach(k => ABIL_BY_STAT[k] = ABIL_IDS.filter(id => ABILITIES[id].stat === k));
const shuf = a => { for (let i = a.length - 1; i > 0; i--) { const j = floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
const bitePrepOf = (b, k = 1) => statLin(b, "agi", BITE_PREP_MAX, BITE_PREP_MIN) * k + rf(-125, 125),
biteDone = (cb, b, t, k) => (SFX.bite(t), cb.biteT = 1, cb.bitePrep = cb.bitePrepMax = bitePrepOf(b, k));
const FOV_MIN_DEG = 90, FOV_MAX_DEG = 94.5;
function engageDistOf(b) { const m = ensureMorph(b); return m.bodyLength / 2 + m.headSize * 2 }
function bugRadius(b) { const m = ensureMorph(b); return m.bodyLength / 2 + m.headSize }
const statLin = (b, k, a, z) => a + (z - a) * (b[k] - 1) / 19;
const visRangeOf = b => statLin(b, "per", 75, 300);
const fovHalfOf = b => statLin(b, "per", FOV_MIN_DEG, FOV_MAX_DEG) * PI / 360;
function seesPoint(b, p, x, y) {
const dx = x - p.x, dy = y - p.y, d2 = dx * dx + dy * dy, vr = visRangeOf(b);
if (d2 >= vr * vr) return !1;
if (hasAbil(b, "v360") && d2 < vr * vr * .0625) return !0;
return abs(norm(atan2(dy, dx) - p.dir)) <= fovHalfOf(b)
}
const liveE = x => { const c = C.combat.get(x); return c && !c.dead && c.curHp > 0 };
const memMsOf = b => statLin(b, "int", 3e3, 12e3), scanOf = b => statLin(b, "int", 0, TAU);
const huntTierOf = b => { const i = b.int; return i <= 3 ? 1 : i <= 6 ? 2 : i <= 8 ? 3 : 4 };
const rollVar = () => .8 + .4 * random();
function biteDodged(atkB, p, tb, tp, atkTeam) {
const chance = clamp(.12 + .02 * (tb.agi - atkB.agi), 0, .25);
if (random() >= chance) return !1;
return spawnDmgPop(tp, 0, atkTeam, atan2(tp.y - p.y, tp.x - p.x)), !0
}
function wakeToFight(e) {
const t = C.walk.get(e);
t && !aiAct(t) && (t.scanRemain = 0, t.seekX = t.turnA = null, setAct(e, "fighting"))
}
function flee(e, a, panic) {
const t = C.walk.get(e), cb = C.combat.get(e), p = C.pos.get(e), ms = 4e3 + intMs(e);
if ("fleeing" === t.act) return void(panic && (t.actT += ms));
wakeToFight(e), setAct(e, "fleeing", ms);
cb.fleeA = a, cb.fleeX = p.x, cb.fleeY = p.y, cb.fleeT = panic ? p.dir + norm(a - p.dir) / 2 : null
}
function biteNoticed(te) {
wakeToFight(te);
const tp = C.pos.get(te), ttm = C.team.get(te), tcb = C.combat.get(te);
if (!tp || !ttm) return;
"fleeing" === C.walk.get(te).act && (hypot(tp.x - tcb.fleeX, tp.y - tcb.fleeY) < bugLen(C.bug.get(te)) ? setAct(te, "fighting") : (tcb.fleeX = tp.x, tcb.fleeY = tp.y));
ecsQuery("bug", "pos", "team", "walk").forEach(oe => {
if (oe === te || C.team.get(oe).team !== ttm.team) return;
const ocb = C.combat.get(oe);
if (ocb && ocb.dead) return;
seesPoint(C.bug.get(oe), C.pos.get(oe), tp.x, tp.y) && wakeToFight(oe)
})
}
function applyBite(cb, ab, p, te, tb, tp, mult, atkTeam, atkE) {
const tcb = C.combat.get(te), fd = abs(norm(atan2(p.y - tp.y, p.x - tp.x) - tp.dir)),
flankMult = fd < PI / 3 ? 1 : fd < TAU / 3 ? 1.5 : 2;
if (atkE != null && (tcb.flankA > 0 || fd >= PI / 3 && tb.int < 5)) { tcb.avengeE = atkE, tcb.avengeA = atan2(p.y - tp.y, p.x - tp.x), tcb.flankA > 0 && flankEnd(tcb) }
let dmg = statLin(ab, "str", 1, 10) * rollVar() * flankMult * mult;
if (hasAbil(tb, "chitin")) dmg *= .5;
tcb.curHp -= dmg, C.walk.get(te).hitT = 1;
const ha = atan2(tp.y - p.y, tp.x - p.x);
tcb.hitDx = cos(ha), tcb.hitDy = sin(ha);
const sh = bugLen(tb) * .15 * rsign();
tcb.imX -= tcb.hitDy * sh, tcb.imY += tcb.hitDx * sh;
spawnDmgPop(tp, dmg, atkTeam, ha);
hasAbil(tb, "cry") && (tcb.callT = ABILITIES.cry.dur, tcb.callR = callRadius(tb), tcb.callTeam = atkTeam ? 0 : 1, tcb.callCry = 1, tcb.callX = tp.x, tcb.callY = tp.y);
if (tcb.curHp <= 0 && !(hasAbil(tb, "phoenix") && !tcb.phoenixUsed && !tcb.muted)) {
tcb.dead = !0, tcb.curHp = 0, cb.killsThis = (cb.killsThis || 0) + 1, cb.memT = 0, cb.searchPhase = 0;
groundMarks.push({ x: tp.x, y: tp.y, hue: tb.hue, t: 1 })
}
}
const COMBAT_DEFAULTS = {
dead: !1, killsThis: 0,
prepVisT: 0,
kbX: 0, kbY: 0, hitDx: 0, hitDy: 0, biteT: 0,
stunT: 0,
flyT: 0, flyDx: 0, flyDy: 0, flySp: 0, flyE: -1, airT: 0, airMs: 1, spinRemain: 0, spinDir: 1,
dashT: 0, dashHitPend: 0,
strongPend: 0, swiftPend: 0, backflipT: 0,
grabTarget: -1, grabbedBy: -1, grabDragLeft: 0, grabTimeLeft: 0, grabDx: 0, grabDy: 0,
flankA: 0,
callT: 0, callR: 0, callTeam: -1, callX: 0, callY: 0, callCry: 0, callDoneX: 0, callDoneY: 0, goOn: 0, goX: 0, goY: 0, loudT: 0, curTarget: -1,
aimTarget: -1, aimLock: 0, avengeE: -1, avengeA: 0, lostSide: 1, wasInRange: 0, regather: 0,
pickE: -1, swT: 0, biteE: -1, biteN: 0,
memT: 0, memX: 0, memY: 0, memA: 0, searchPhase: 0, fleeA: 0, fleeX: 0, fleeY: 0, fleeT: null, fledLvl: 0,
mvA: 0, mvSpd: 0,
imX: 0, imY: 0,
phoenixUsed: 0, phoenixT: 0, fakeUsed: 0, fakeT: 0, muted: 0, abT: 0, abTxt: ""
};
const newCombat = (b, curHp, maxHp, w = bitePrepOf(b)) => ({ ...COMBAT_DEFAULTS, cd: {}, curHp, maxHp, bitePrep: w, bitePrepMax: w });
const abilOrder = b => SK.filter(k => b[k] >= 5).sort((x, y) => b[y] - b[x] || (x < y ? -1 : 1));
function rollAbilities(b, out, used) {
for (const k of abilOrder(b)) {
if (out.length >= ABIL_MAX) break;
if (used.has(k) || !(random() < (ABIL_ROLL_CHANCE[out.length] || 0))) continue;
const pool = ABIL_BY_STAT[k].filter(id => !out.includes(id));
pool.length && (out.push(pool[ri(pool.length)]), used.add(k))
}
return out
}
function assignBirthAbilities(b) {
const out = (b.abilities || []).slice(0, ABIL_MAX);
return rollAbilities(b, out, new Set(out.map(id => ABILITIES[id].stat)))
}
function inheritAbilities(child, a, b) {
const pa = a.abilities || [], pb = b.abilities || [], out = [], used = new Set();
for (const k of abilOrder(child)) {
if (out.length >= ABIL_MAX) break;
for (const c of shuf(ABIL_BY_STAT[k].map(id => ({ id: id, n: pa.includes(id) + pb.includes(id) })).filter(c => c.n)))
if (random() < (2 === c.n ? ABIL_INHERIT_BOTH : ABIL_INHERIT_ONE)) { out.push(c.id), used.add(k); break }
}
rollAbilities(child, out, used);
return child.abilities = out, out
}
function hasAbil(b, id) { return b && b.abilities && b.abilities.includes(id) }
function abilTags(b) {
if (!b || !b.abilities || !b.abilities.length) return "";
return " | " + b.abilities.map(id => `<span style="color:#c8f;font-size:9px;">⬢${ABILITIES[id].name}</span>`).join(" ")
}
