// BUGBOX fight simulator: Node, no browser, no drawing. Loads the game files from index.html into one VM context
// (DOM, canvas and audio stubbed) and runs the game's own tick() with the fixed step COMBAT_STEP_MS. No game rules are copied here.
// Usage: node .claude/tool-fight-sim.cjs a [n]   each ability: bug with it vs the same bug without, 1v1 + 3v3, T1 T3 T5 (default n 2000)
//        node .claude/tool-fight-sim.cjs b [n]   each stat: +3 in one stat, -3 spread over the others (less when they are all 1, T1 sum 5-7), vs even split of the same sum, 1v1 + 3v3
//        node .claude/tool-fight-sim.cjs c [n]   BOSS, RB, WB of tier T vs teams of 1-10 player bugs of tier T (default n 200)
//        node .claude/tool-fight-sim.cjs custom '{"a":[{"con":5,"str":5,"agi":5,"per":5,"int":5,"abilities":["dash"]}],"b":[...],"mode":1,"tier":3,"n":500}'
//        a/b team entries without stats get genStats(tier); "b" omitted = the game's buildEnemies (bosses for boss modes)
// Output: % wins of team A, % draws (no end within CAP_MS game time), median fight length, median HP % left in the winning team.
// Finished chunks are kept in <tmp>/bugbox-fight-sim-<set>-<n>.jsonl: after a restart the same command continues.
// Base bugs (sets a, b): random genStats of the tier per fight, both sides copies. Tested side swaps team 0/1 every 2nd fight.
// Fight box: tierMax = fight tier (box size of the first time that tier is open). Fights run on all CPU cores (worker_threads).
// Set c: a fresh boss every fight (the game keeps one per tier; WB HP loss is not carried between sim fights).
const fs = require("fs"), path = require("path"), vm = require("vm"), os = require("os");
const { Worker, isMainThread, parentPort, workerData } = require("worker_threads");
const root = path.resolve(__dirname, "..");
const CAP_MS = 180e3;

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
    function simFight(A, B, mode, T, cap) {
      dev = 1, money = 1e9, tierMax = T, tutStep = -1, fightMode = mode, B || (bosses = {});
      bugsOwned = A.map(o => simBug(o, T)), fightTeam = bugsOwned.slice(), simFoes = B ? B.map(o => simBug(o, T)) : null;
      startFight(null, T);
      while (!fightDone && fightMs < cap) tick(COMBAT_STEP_MS, 1), fightMs >= 0 && checkFightEnd();
      const f = bugsInBoxView(), hp = t => { const g = f.filter(x => x.team === t); return g.reduce((s, x) => s + max(0, x.curHp), 0) / g.reduce((s, x) => s + x.maxHp, 0) },
        [a0, a1] = teamAlive(ecsQuery("team", "combat")), w = !fightDone ? -1 : a0 ? 0 : a1 ? 1 : -1;
      const r = { w, ms: fightMs, hp: w < 0 ? 0 : hp(w) };
      endFight(), simFoes = null;
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

// cell makers: run inside a worker, use the game's genStats / SK / capSum
const MAKERS = {
  // ability: same random tier bug on both sides (all members of a team), A has the ability
  abil: (ctx, { id, size, tier }) => { const s = Array.from({ length: size }, () => ctx.genStats(tier)), st = x => ({ con: x.con, str: x.str, agi: x.agi, per: x.per, int: x.int });
    return [s.map(x => ({ ...st(x), abilities: [id] })), s.map(x => ({ ...st(x), abilities: [] }))] },
  // stat: sum S of a random tier bug; B = even split; A = even split, +3 in stat k taken from the other 4 in turn (stats min 1, so fewer than 3 at a T1 sum 5-7)
  stat: (ctx, { stat: k, size, tier }) => { const mk = () => { const S = ctx.vm("statSum")(ctx.genStats(tier)), SK = ctx.vm("SK"), ev = Object.fromEntries(SK.map((x, i) => [x, Math.floor(S / 5) + (i < S % 5)]));
      const a = { ...ev }, oth = SK.filter(x => x !== k); for (let left = 3, j = 0; left && oth.some(o => a[o] > 1); j++) { const o = oth[j % 4]; a[o] > 1 && (a[o]--, a[k]++, left--) } return [a, ev] };
    const t = Array.from({ length: size }, mk); return [t.map(x => x[0]), t.map(x => x[1])] },
  boss: (ctx, { size, tier }) => [Array.from({ length: size }, () => ({})), null]
};
function runJob(ctx, j) { return cell(ctx, { n: j.n, mode: j.mode, tier: j.tier, swap: j.swap, a: j.a, b: j.b, make: j.maker && (c => MAKERS[j.maker](c, j)) }) }

if (!isMainThread && workerData !== "lib") {
  const ctx = load(); ctx.vm = e => vm.runInContext(e, ctx); ctx.simFight = ctx.vm("simFight"); ctx.genStats = ctx.vm("genStats");
  parentPort.on("message", j => parentPort.postMessage({ k: j.k, r: runJob(ctx, j) }));
  return;
}

if (require.main !== module) return void (module.exports = { load });
// main: build jobs, split each cell into chunks over the workers, merge medians by weighted average of chunk medians
const set = process.argv[2] || "a", N = set === "custom" ? JSON.parse(process.argv[3]).n || 500 : +process.argv[3] || (set === "c" ? 200 : 2000);
const probe = load(), v = e => vm.runInContext(e, probe), IDS = v("ABIL_IDS"), SK = v("SK"), NAMES = v("Object.fromEntries(ABIL_IDS.map(i => [i, ABILITIES[i].name]))");
const jobs = [];
if (set === "a") for (const id of IDS) for (const size of [1, 3]) for (const tier of [1, 3, 5]) jobs.push({ row: NAMES[id], col: `${size}v${size} T${tier}`, maker: "abil", id, size, tier, mode: size, n: N });
if (set === "b") for (const k of SK) for (const size of [1, 3]) for (const tier of [1, 3, 5]) jobs.push({ row: k.toUpperCase() + "+3", col: `${size}v${size} T${tier}`, maker: "stat", stat: k, size, tier, mode: size, n: N });
if (set === "c") for (const mode of ["boss", "rb", "wb"]) for (const tier of [1, 3, 5]) for (const size of [1, 2, 3, 5, 10]) jobs.push({ row: `${mode.toUpperCase()} T${tier}`, col: `${size} bugs`, maker: "boss", size, tier, mode, n: N, swap: false });
if (set === "custom") { const o = JSON.parse(process.argv[3]); jobs.push({ row: "A", col: `${o.mode} T${o.tier}`, a: o.a, b: o.b || null, mode: o.mode, tier: o.tier, n: o.n || 500, swap: !!o.b }) }
const W = os.cpus().length, CH = 50, chunks = [];
jobs.forEach((j, k) => { for (let d = 0; d < j.n; d += CH) chunks.push({ ...j, k, n: Math.min(CH, j.n - d) }) });
// progress file: finished chunks survive a restart; a run with the same set and n continues from it
const prog = path.join(os.tmpdir(), `bugbox-fight-sim-${set}-${N}.jsonl`), acc = jobs.map(() => ({ n: 0, win: 0, draw: 0, ms: 0, hp: 0 })), t0 = Date.now();
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
  const fmt = r => r ? `${(r.win / r.n).toFixed(0)}%${r.draw ? ` d${(r.draw / r.n).toFixed(0)}` : ""}` : "";
  console.log(`set ${set}, ${N} fights per cell, % wins of A (d = % draws, no end in ${CAP_MS / 1e3} s), v${v("GAME_VERSION")}, ${Math.round((Date.now() - t0) / 1e3)} s`);
  console.log(["", ...cols].join("\t"));
  rows.forEach(row => console.log([row, ...cols.map(c => fmt(R.find(r => r.row === row && r.col === c)))].join("\t")));
  console.log(`median fight length s / median winner HP % per column:`);
  console.log(["", ...cols.map(c => { const g = R.filter(r => r.col === c), s = x => g.reduce((t, r) => t + r[x] / r.n, 0) / g.length; return `${(s("ms") / 1e3).toFixed(0)}s ${s("hp").toFixed(0)}%` })].join("\t"));
  const out = path.join(os.tmpdir(), `bugbox-fight-sim-${set}.json`); fs.writeFileSync(out, JSON.stringify(R.map(r => ({ row: r.row, col: r.col, n: r.n, win: r.win / r.n, draw: r.draw / r.n, ms: r.ms / r.n, hp: r.hp / r.n })), null, 1));
  console.log("full table: " + out);
}
