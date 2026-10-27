function statColor(v) {
const n = round(v);
return TIER_COL[n <= 3 ? 2 : n <= 6 ? 3 : n <= 10 ? 4 : 5]
}
const TIER_COL = ["", "", "#cc7722", "#cccc22", "#00ff66", "#22dddd"];
const statSum = o => SK.reduce((s, k) => s + o[k], 0);
const STAT_SUM_MAX = 50, STAT_LIM = [3, 5, 7, 10, 13];
const tierOf = s => min(5, floor(s / 10) + 1), bossSum = T => T > 4 ? STAT_SUM_MAX : 10 * T - 1,
tierRate = T => 2 ** T, bugValue = s => tierRate(tierOf(s)) * s,
starsOf = s => s >= STAT_SUM_MAX ? 5 : s < 10 ? 0 : max(0, s % 10 - 5), ROLES = [["Bulwark", "Ripper", "Scuttler", "Scout", "Scarab"], ["Tough", "Strong", "Swift", "Sentry", "Smart"], ["Eggshell", "Weakling", "Slug", "Mole", "Drone"], ["Fragile", "Weak", "Slow", "Blind", "Dumb"]],
roleOf = o => { const i = shuf([0, 1, 2, 3, 4]).sort((a, b) => o[SK[b]] - o[SK[a]]), v = i.map(j => o[SK[j]]), R = (g, j) => ROLES[g][i[j]];
return v[1] >= v[2] + 2 ? R(1, 1) + " " + R(0, 0) : v[0] >= v[1] + 2 ? R(0, 0) : v[3] <= v[2] - 2 ? R(3, 3) + " " + R(2, 4) : v[4] <= v[3] - 2 ? R(2, 4) : "Brawler" };
function genStats(T, S = T > 1 ? 10 * (T - 1) + min(ri(10), ri(10)) : 7 + ri(3)) {
const lim = tierLim(T), ks = shuf(SK.slice()), s = {};
S = min(S, 5 * lim);
for (let n = 4; n >= 0; n--) { const lo = max(1, S - lim * n); S -= s[ks[n]] = lo + ri(min(lim, S - n) - lo + 1) }
return s
}
const capSum = (o, lo = () => 1) => { let ks; while (statSum(o) > STAT_SUM_MAX && (ks = SK.filter(k => o[k] > lo(k))).length) o[rnd(ks)]--; return o };
const statScale = () => { const m = max(0, ...bugsOwned.flatMap(b => SK.map(k => b[k]))); return statCap = max(statCap, m >= 11 || tierOpen(4) ? 20 : m >= 6 || tierOpen(3) ? 10 : 5) },
tierLim = T => STAT_LIM[T - 1];
function statBars(statsObj, opts) {
const fs = (opts = opts || {}).fontSize || 8,
dead = opts.dead || !1,
scale = 100 / statScale(),
total = round(statSum(statsObj));
return `<div class="sr" style="justify-content:flex-end;"><span class="sv" style="width:2ch;display:flex;justify-content:center;font-size:${fs}px;color:${dead?"#555":"#888"}">(${total})</span></div>` + SK.map((k, i) => {
const sv = statsObj[k],
bc = dead ? "#444" : statColor(sv);
return `<div class="sr"><span class="sl" style="font-size:${fs}px;">${SN[i]}</span><div class="st"${opts.barW?` style="width:${opts.barW}px;flex:none;"`:""}><div class="sf" style="width:${clamp(scale*sv,0,100)}%;background:${bc}"></div></div><span class="sv" style="font-size:${fs}px;color:${dead?"#555":"#888"}">${round(sv)}</span></div>`
}).join("")
}
const SYL1 = ["Kr", "Veth", "Dor", "Br", "Zeph", "Th", "Ol", "Nex", "Grix", "Vael", "Mir", "Jex", "Wyr", "Sk", "Ph"],
SYL2 = ["ax", "eth", "oru", "rix", "ael", "rax", "ion", "elm", "yx", "ath", "oz", "im"];
const rnd = a => a[ri(a.length)], genName = () => rnd(SYL1) + rnd(SYL2);
const sylSplit = n => { const p = SYL1.find(s => n.startsWith(s)) || SYL1[0]; return [p, n.slice(p.length) || SYL2[0]] };
function childName(a, b) {
const [a1, a2] = sylSplit(a.name), [b1, b2] = sylSplit(b.name),
used = n => bugsOwned.some(x => x.name === n) || boxEggs.some(g => g.bug.name === n);
for (const f of [() => a1 + b2, () => b1 + a2, () => a1 + rnd(SYL2), () => b1 + rnd(SYL2), genName])
for (let i = 5; i--;) { const n = f(); if (!used(n)) return n }
}
function makeBug(o = {}) {
const b = {
id: bid++,
name: genName(),
gen: 1,
hue: 20 * ri(18),
morph: randomMorph(),
wins: 0,
losses: 0,
killsTotal: 0,
fights: 0,
con: 4,
str: 3,
agi: 3,
per: 5,
int: 3,
abilities: [],
...o
};
return o.abilities || b.abilities.length || (b.abilities = assignBirthAbilities(b)), b.curHp == null && (b.curHp = maxHpOf(b)), b.role = roleOf(b), syncMorph(b), b
}
function maxHpOf(b) { return round(statLin(b, "con", 12, 120) * (hasAbil(b, "resilient") ? 1.5 : 1) * (b.hpMul || 1)) }
function hpFrac(b) { const m = maxHpOf(b); return clamp((b.curHp == null ? m : b.curHp) / m, 0, 1) }
