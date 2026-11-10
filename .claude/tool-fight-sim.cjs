// BUGBOX fight simulator: Node, no browser, no drawing. Loads the game files from index.html into one VM context
// (DOM, canvas and audio stubbed) and runs the game's own tick() with the fixed step COMBAT_STEP_MS. No game rules are copied here.
// Usage: node .claude/tool-fight-sim.cjs a [n] [ids|all] [tiers]   optional: only these ability ids (comma list) and tiers (comma list, default 2,3,5)
//        node .claude/tool-fight-sim.cjs a [n]   each ability: bug with it vs the same bug without, 1v1 + 3v3, T2 T3 T5 (T1 bugs cannot roll
//                                                abilities: stats max 3, abilities need the stat 5+; the base bug has the ability's stat 5+) (default n 250)
//        node .claude/tool-fight-sim.cjs b [n]   each stat: +3 in one stat, -3 spread over the others (less when they are all 1, T1 sum 5-7), vs even split of the same sum, 1v1 + 3v3 (default n 250)
//        node .claude/tool-fight-sim.cjs c [n]   BOSS T1-T5 vs 1 bug of that tier (random genStats / max tier sum / max tier sum with CON and STR
//                                                at the tier limit); RB T1-T5 vs 1-10 bugs of that tier; WB T1-T5: one WB keeps its HP loss (the game's
//                                                wbKeep) over fights of a fresh team of 3/5/10 bugs until it dies: median fights to kill (max 10) (default n 200, WB n/10)
//        node .claude/tool-fight-sim.cjs custom '{"a":[{"con":5,"str":5,"agi":5,"per":5,"int":5,"abilities":["dash"]}],"b":[...],"mode":1,"tier":3,"n":500}'
//        a/b team entries without stats get genStats(tier); "b" omitted = the game's buildEnemies (bosses for boss modes)
// Output: % wins of team A, % draws (no end within CAP_MS game time), median fight length, median HP % left in the winning team.
// Glass taps: STALL_MS game time with no HP change = the game's triple-tap panic (panicAll), as a player does. After a panic the bugs get
// PANIC_WAIT_MS to stop fleeing, walk, see an enemy and bite (measured: next bite after a panic in 1v1 median 12-27 s, 90 % within 58-84 s);
// only then the next panic, max PANIC_MAX per fight, still no bite after the last wait = draw.
// Finished chunks are kept in <tmp>/bugbox-fight-sim-<set>-<n>.jsonl: after a restart the same command continues (the file name holds the game version).
// Base bugs (sets a, b): random genStats of the tier per fight, both sides copies. Tested side swaps team 0/1 every 2nd fight.
// Fight box: tierMax = fight tier (box size of the first time that tier is open). Fights run on all CPU cores (worker_threads).
const fs = require("fs"), path = require("path"), vm = require("vm"), os = require("os");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const root = path.resolve(__dirname, "..");
const CAP_MS = 600e3, STALL_MS = 30e3, PANIC_WAIT_MS = 90e3, PANIC_MAX = 5, WB_FIGHTS = 10;

// any DOM / canvas / audio object: every property and call returns the stub itself; numbers read as 0
function stubs() {
  const num = { width: 360, height: 480, clientWidth: 360, clientHeight: 480, innerWidth: 360, innerHeight: 800, devicePixelRatio: 1, length: 0 };
  const fn = function () {}, p = new Proxy(fn, {
    get: (t, k) => k === Symbol.toPrimitive ? () => 0 : k === Symbol.iterator ? function* () {} : k in num ? num[k]
      : k === "getBoundingClientRect" ? () => ({ ...num, left: 0, top: 0, x: 0, y: 0 }) : k === "measureText" ? () => ({ width: 0 })
      : k === "classList" ? { add() {}, remove() {}, toggle() {}, contains: () => false } : k === "dataset" || k === "style" ? {} : p,
    set: () => true, apply: () => p, construct: () => p, has: () => true
  });
  return p;
}
function load() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const files = [...html.matchAll(/<script src="([^"]+\.js)"><\/script>/g)].map(m => m[1]);
  const p = stubs(), store = new Map();
  const ctx = {
    document: p, navigator: p, location: p, Image: p, AudioContext: p, webkitAudioContext: p, performance: { now: () => 0 },
    requestAnimationFrame: () => 0, cancelAnimationFrame() {}, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: { getItem: k => store.has(k) ? store.get(k) : null, setItem: (k, v) => store.set(k, String(v)), removeItem: k => store.delete(k) },
    addEventListener() {}, removeEventListener() {}, getComputedStyle: () => p, matchMedia: () => p, alert() {}, confirm: () => false,
    innerWidth: 360, innerHeight: 800, devicePixelRatio: 1, console, Math, JSON, Date, Object, Array, Map, Set, Promise
  };
  ctx.window = ctx, ctx.globalThis = ctx, ctx.self = ctx;
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), ctx, { filename: f });
  // sim setup inside the game scope: real game functions, custom teams through buildEnemies / fightTeam
  vm.runInContext(`
    const simGame = buildEnemies;
    var simFoes = null; buildEnemies = T => simFoes ? simFoes : simGame(T);
    Object.keys(SFX).forEach(k => SFX[k] = () => 0);
    function simBug(o, T) { const s = o.con == null ? genStats(T) : o; return makeBug({ con: s.con, str: s.str, agi: s.agi, per: s.per, int: s.int, abilities: o.abilities || s.abilities || [] }) }
    const simHp = () => ecsQuery("combat").reduce((s, e) => s + C.combat.get(e).curHp, 0);
    function simFight(A, B, mode, T, cap, keepBoss) {
      dev = 1, money = 1e9, tierMax = T, tutStep = -1, fightMode = mode, B || keepBoss || (bosses = {});
      bugsOwned = A.map(o => simBug(o, T)), fightTeam = bugsOwned.slice(), simFoes = B ? B.map(o => simBug(o, T)) : null;
      startFight(null, T);
      for (let h = -1, still = 0, pn = 0, wait = ${STALL_MS}; !fightDone && fightMs < cap;) {
        tick(COMBAT_STEP_MS, 1), fightMs >= 0 && checkFightEnd();
        if (fightMs < 0) continue;
        const now = simHp();
        if (now !== h) { h = now, still = 0; continue }
        if ((still += COMBAT_STEP_MS) < wait) continue;
        if (pn++ >= ${PANIC_MAX}) break;
        panicAll(), still = 0, wait = ${PANIC_WAIT_MS}
      }
      const f = bugsInBoxView(), hp = t => { const g = f.filter(x => x.team === t); return g.reduce((s, x) => s + max(0, x.curHp), 0) / g.reduce((s, x) => s + x.maxHp, 0) },
        [a0, a1] = teamAlive(ecsQuery("team", "combat")), w = !fightDone ? -1 : a0 ? 0 : a1 ? 1 : -1;
      const r = { w, ms: fightMs, hp: w < 0 ? 0 : hp(w) };
      "wb" === mode && wbKeep(), endFight(), simFoes = null;
      return r
    }`, ctx);
  return ctx;
}

// one cell = n fights; tested side (A) is team 0 in even fights, team 1 in odd ones
function cell(ctx, c) {
  const res = [];
  for (let i = 0; i < c.n; i++) {
    const [A, B] = c.make ? c.make(ctx) : [c.a, c.b], sw = c.swap !== false && i % 2;
    const r = ctx.simFight(sw ? B : A, sw ? A : B, c.mode, c.tier, CAP_MS);
    res.push({ win: r.w < 0 ? -1 : (r.w === 0) !== !!sw ? 1 : 0, ms: r.ms, hp: r.hp });
  }
  const med = a => { a.sort((x, y) => x - y); return a.length ? a[a.length >> 1] : 0 }, done = res.filter(r => r.win >= 0);
  return { win: 100 * res.filter(r => r.win === 1).length / c.n, draw: 100 * (c.n - done.length) / c.n, ms: med(res.map(r => r.ms)), hp: 100 * med(done.map(r => r.hp)) };
}

// WB campaign: one WB per run keeps its HP loss over up to WB_FIGHTS fights of a fresh team; win = median fights to kill it, draw = % runs it survived
function camp(ctx, c) {
  const f = [];
  for (let i = 0; i < c.n; i++) {
    let k = 1;
    for (; k <= WB_FIGHTS; k++) { ctx.simFight(MAKERS.boss(ctx, c)[0], null, "wb", c.tier, CAP_MS, k > 1); if (!ctx.vm(`bosses.wb${c.tier}`)) break }
    f.push(k);
  }
  f.sort((x, y) => x - y);
  return { win: f[f.length >> 1], draw: 100 * f.filter(k => k > WB_FIGHTS).length / c.n, ms: 0, hp: 0 };
}

// cell makers: run inside a worker, use the game's genStats / SK / capSum
const MAKERS = {
  // ability: same random tier bug on both sides (all members of a team), A has the ability
  abil: (ctx, { id, size, tier }) => { const k = ctx.vm("ABILITIES")[id].stat, gen = () => { let x; do x = ctx.genStats(tier); while (x[k] < 5); return x }, s = Array.from({ length: size }, gen), st = x => ({ con: x.con, str: x.str, agi: x.agi, per: x.per, int: x.int });
    return [s.map(x => ({ ...st(x), abilities: [id] })), s.map(x => ({ ...st(x), abilities: [] }))] },
  // stat: sum S of a random tier bug; B = even split; A = even split, +3 in stat k taken from the other 4 in turn (stats min 1, so fewer than 3 at a T1 sum 5-7)
  stat: (ctx, { stat: k, size, tier }) => { const mk = () => { const S = ctx.vm("statSum")(ctx.genStats(tier)), SK = ctx.vm("SK"), ev = Object.fromEntries(SK.map((x, i) => [x, Math.floor(S / 5) + (i < S % 5)]));
      const a = { ...ev }, oth = SK.filter(x => x !== k); for (let left = 3, j = 0; left && oth.some(o => a[o] > 1); j++) { const o = oth[j % 4]; a[o] > 1 && (a[o]--, a[k]++, left--) } return [a, ev] };
    const t = Array.from({ length: size }, mk); return [t.map(x => x[0]), t.map(x => x[1])] },
  // boss modes: random tier bugs; BOSS variants: max tier sum, or max tier sum with CON and STR at the tier limit
  boss: (ctx, { size, tier, v }) => [Array.from({ length: size }, () => {
    if (!v) return {};
    const S = ctx.vm(`min(bossSum(${tier}), 5 * tierLim(${tier}))`), L = ctx.vm(`tierLim(${tier})`);
    if (v === "max") return ctx.genStats(tier, S);
    const o = { con: L, str: L }, rest = S - 2 * L; ["agi", "per", "int"].forEach((x, i) => o[x] = Math.floor(rest / 3) + (i < rest % 3)); return o
  }), null]
};
function runJob(ctx, j) { return j.camp ? camp(ctx, j) : cell(ctx, { n: j.n, mode: j.mode, tier: j.tier, swap: j.swap, a: j.a, b: j.b, make: j.maker && (c => MAKERS[j.maker](c, j)) }) }

if (!isMainThread && workerData !== "lib") {
  const ctx = load(); ctx.vm = e => vm.runInContext(e, ctx); ctx.simFight = ctx.vm("simFight"); ctx.genStats = ctx.vm("genStats");
  parentPort.on("message", j => parentPort.postMessage({ k: j.k, r: runJob(ctx, j) }));
  return;
}

if (require.main !== module) return void (module.exports = { load });
// main: build jobs, split each cell into chunks over the workers, merge medians by weighted average of chunk medians
const set = process.argv[2] || "a", N = set === "custom" ? JSON.parse(process.argv[3]).n || 500 : +process.argv[3] || (set === "c" ? 200 : 250);
const probe = load(), v = e => vm.runInContext(e, probe), IDS = v("ABIL_IDS"), SK = v("SK"), NAMES = v("Object.fromEntries(ABIL_IDS.map(i => [i, ABILITIES[i].name]))");
const jobs = [];
const ONLY = process.argv[4] && process.argv[4] !== "all" ? process.argv[4].split(",") : IDS, TIERS = process.argv[5] ? process.argv[5].split(",").map(Number) : [2, 3, 5];
if (set === "a") for (const id of ONLY) for (const size of [1, 3]) for (const tier of TIERS) jobs.push({ row: NAMES[id], col: `${size}v${size} T${tier}`, maker: "abil", id, size, tier, mode: size, n: N });
if (set === "b") for (const k of SK) for (const size of [1, 3]) for (const tier of [1, 3, 5]) jobs.push({ row: k.toUpperCase() + "+3", col: `${size}v${size} T${tier}`, maker: "stat", stat: k, size, tier, mode: size, n: N });
if (set === "c") for (const tier of [1, 2, 3, 4, 5]) {
  for (const v of ["", "max", "constr"]) jobs.push({ row: `BOSS T${tier}`, col: ["random", "max sum", "max CON+STR"][["", "max", "constr"].indexOf(v)], maker: "boss", size: 1, v, tier, mode: "boss", n: N, swap: false });
  for (const size of [1, 2, 3, 5, 10]) jobs.push({ row: `RB T${tier}`, col: `${size} bugs`, maker: "boss", size, tier, mode: "rb", n: N, swap: false });
  for (const size of [3, 5, 10]) jobs.push({ row: `WB T${tier}`, col: `${size} bugs`, camp: 1, maker: "boss", size, tier, mode: "wb", n: Math.max(1, N / 10), swap: false });
}
if (set === "custom") { const o = JSON.parse(process.argv[3]); jobs.push({ row: "A", col: `${o.mode} T${o.tier}`, a: o.a, b: o.b || null, mode: o.mode, tier: o.tier, n: o.n || 500, swap: !!o.b }) }
const W = os.cpus().length, CH = 50, chunks = [];
jobs.forEach((j, k) => { for (let d = 0; d < j.n; d += CH) chunks.push({ ...j, k, n: Math.min(CH, j.n - d) }) });
// progress file: finished chunks survive a restart; a run with the same set and n continues from it
const prog = path.join(os.tmpdir(), `bugbox-fight-sim-${set}-${N}-v${v("GAME_VERSION")}${set === "a" ? "-" + ONLY.length + ONLY[0] + TIERS.join("") : ""}.jsonl`), acc = jobs.map(() => ({ n: 0, win: 0, draw: 0, ms: 0, hp: 0 })), t0 = Date.now();
const add = (c, r) => { const a = acc[chunks[c].k], n = chunks[c].n; a.n += n, a.win += r.win * n, a.draw += r.draw * n, a.ms += r.ms * n, a.hp += r.hp * n };
const have = new Set(set === "custom" || !fs.existsSync(prog) ? [] : fs.readFileSync(prog, "utf8").split("\n").filter(Boolean).map(l => { const { c, r } = JSON.parse(l); return add(c, r), c }));
const queue = chunks.map((_, c) => c).filter(c => !have.has(c));
let done = have.size;
queue.length || report();
const pool = Array.from({ length: Math.min(W, queue.length) }, () => new Worker(__filename));
pool.forEach(w => {
  const send = () => queue.length ? (w.cur = queue.shift(), w.postMessage(chunks[w.cur])) : w.terminate();
  w.on("message", ({ r }) => {
    add(w.cur, r), set === "custom" || fs.appendFileSync(prog, JSON.stringify({ c: w.cur, r }) + "\n");
    ++done % 20 || process.stderr.write(`\r${done}/${chunks.length} chunks, ${Math.round((Date.now() - t0) / 1e3)} s`);
    done === chunks.length && report(), send();
  });
  w.on("error", e => { console.error("worker error: " + e.stack); process.exit(1) });
  send();
});
function report() {
  process.stderr.write("\n");
  const cols = [...new Set(jobs.map(j => j.col))], rows = [...new Set(jobs.map(j => j.row))], R = jobs.map((j, k) => ({ ...j, ...acc[k] }));
  const fmt = r => !r ? "" : r.camp ? (r.win / r.n > WB_FIGHTS ? `>${WB_FIGHTS}f` : `${(r.win / r.n).toFixed(0)}f`) + (r.draw ? ` x${(r.draw / r.n).toFixed(0)}` : "") : `${(r.win / r.n).toFixed(0)}%${r.draw ? ` d${(r.draw / r.n).toFixed(0)}` : ""}`;
  console.log(`set ${set}, ${N} fights per cell, % wins of A (d = % draws: no bite after ${PANIC_MAX} glass panics or no end in ${CAP_MS / 1e3} s; WB rows: f = median fights to kill, x = % WBs alive after ${WB_FIGHTS} fights), v${v("GAME_VERSION")}, ${Math.round((Date.now() - t0) / 1e3)} s`);
  console.log(["", ...cols].join("\t"));
  rows.forEach(row => console.log([row, ...cols.map(c => fmt(R.find(r => r.row === row && r.col === c)))].join("\t")));
  console.log(`median fight length s / median winner HP % per column:`);
  console.log(["", ...cols.map(c => { const g = R.filter(r => r.col === c), s = x => g.reduce((t, r) => t + r[x] / r.n, 0) / g.length; return `${(s("ms") / 1e3).toFixed(0)}s ${s("hp").toFixed(0)}%` })].join("\t"));
  const out = path.join(os.tmpdir(), `bugbox-fight-sim-${set}.json`); fs.writeFileSync(out, JSON.stringify(R.map(r => ({ row: r.row, col: r.col, n: r.n, win: r.win / r.n, draw: r.draw / r.n, ms: r.ms / r.n, hp: r.hp / r.n })), null, 1));
  console.log("full table: " + out);
}
