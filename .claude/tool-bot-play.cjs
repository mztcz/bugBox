// BUGBOX bot: headless Chromium plays whole games through the real UI (clicks and holds on the game's own buttons, cards and canvas).
// Speed-up: Playwright fake clock (timers fire only when the bot advances them) + game time fast-forwarded with the game's own
// tick() / checkFightEnd() (no drawing). No game rules are copied: choices read game state and game functions (statSum, entryFee, ...).
// Usage: node .claude/tool-bot-play.cjs [games per strategy = 20] [strategies = careful,greedy,breeder] [parallel pages = 4]
// Strategies: careful = fights only when its team stat sum (x HP fraction) beats the expected enemy stat sum (RB/WB: sum x HP multiplier);
//                       BOSS with its tier bug of the highest CON+STR once that bug's stat sum is at least the boss sum - 2;
//             greedy  = highest open tier, mode with the highest prize it can field and afford (1v1 2v2 3v3 6v6 BOSS RB WB);
//             breeder = careful + breeds in the Lab after every fight (bugs of the highest open tier first, best CON+STR + sum/2 pairs, while 2 can mate; at 30 bugs it kills
//                       the weakest down to 24 with the Lab skull).
// All: heal with food in the peaceful box before a fight, buy the strongest affordable Shop bug of the highest affordable tier
//      while money stays above the planned entry fee (max 10 bugs), pick None on obstacle offers. Pure mode, no tutorial.
// Player time = all simulated game time (fights + peaceful box) / 16 (the player runs every screen at the top speed 16x) + 0.25 s per bot tap.
// A game ends at the T5 BOSS win, game over, 8 h player time or 600 fights. Fight with no HP change for 20 s game time = triple tap on the
// glass (the game's panic); fight not over after 600 s game time = Leave (draw).
// Finished games are kept in <tmp>/bugbox-bot-<games>.jsonl: after a restart the same command continues.
// Output: table per strategy (time and fights to T2..T5 open and to the T5 BOSS win, game over share and tier, money curve,
// dead ends = steps where the UI did not let the bot go on, JS errors). Full data: <tmp>/bugbox-bot.json
const fs = require("fs"), path = require("path"), os = require("os");
let pw; try { pw = require("playwright") } catch { pw = require("/opt/node-tools/node_modules/playwright") }
const root = path.resolve(__dirname, "..");
const GAMES = +process.argv[2] || 20, STRATS = (process.argv[3] || "careful,greedy,breeder").split(","), PAR = +process.argv[4] || 4;
const TAP_S = .25, SPEED = 16, STALL_MS = 20e3, CAP_GAME_MS = 8 * 3600e3, CAP_FIGHTS = 600, FIGHT_CAP_MS = 600e3, MAX_BUGS = 10, BREED_MAX = 30;
const MONEY_AT = [10, 30, 60, 120, 180, 300, 480]; // minutes of player time for the money curve

// in-page helpers: game-time counter around tick(), fast-forward with the same step as simLoop, read-only state and choice helpers
const PAGE = () => `
window.__gt = 0; { const t0 = tick; tick = (dt, f) => (__gt += dt, t0(dt, f)) }
window.__ff = (ms, until) => { for (let t = 0; t < ms; t += COMBAT_STEP_MS) { if (until && until()) return; combatState || ecsQuery("bug").length === bugsOwned.length || spawnBox(); tick(COMBAT_STEP_MS, combatState), combatState && fightMs >= 0 && checkFightEnd() } };
// fight until it ends, or STALL_MS with no HP change (returns 1 = stalled)
window.__fight = () => { let h = -1, still = 0, r = 0; __ff(${FIGHT_CAP_MS}, () => { if (fightDone || fightMs >= ${FIGHT_CAP_MS}) return 1; if (fightMs < 0) return 0; const now = ecsQuery("combat").reduce((s, e) => s + C.combat.get(e).curHp, 0); now === h ? (still += COMBAT_STEP_MS) >= ${STALL_MS} && (r = 1) : (h = now, still = 0); return r }); return r };
// empty glass spot for the triple tap (screen px): box corner with no bug within 40 game px
window.__glass = () => { const r = boxCv.getBoundingClientRect(), ps = ecsQuery("bug", "pos").map(e => C.pos.get(e)); for (const [x, y] of [[15, 15], [boxLW - 15, 15], [15, boxLH - 15], [boxLW - 15, boxLH - 15]]) if (ps.every(p => Math.hypot(p.x - x, p.y - y) > 40)) return [r.left + (x + boxOX) * boxS, r.top + (y + boxOY) * boxS]; return null };
window.__hpf = b => (b.curHp == null ? maxHpOf(b) : b.curHp) / maxHpOf(b);
window.__opts = strat => {
  const out = [], fm = fightMode, et = enemyTier, own = bugsOwned.slice().sort((a, b) => statSum(b) * __hpf(b) - statSum(a) * __hpf(a));
  for (let T = 1; T <= tierMax; T++) for (const m of [1, 2, 3, 6, "boss", "rb", "wb"]) {
    fightMode = m, enemyTier = T;
    const cs = b => b.con + b.str, fit = m === "boss" ? own.filter(bossFit).sort((a, b) => cs(b) - cs(a)) : own.filter(bossFit), team = fit.slice(0, teamMax()), n = foeN();
    if (!team.length || (typeof m === "number" && team.length < m)) continue;
    const boss = BOSS[m], eSum = boss ? bossSum(T) * boss[1] : n * (T > 1 ? 10 * T - 7.15 : 8), fee = entryFee(T, n);
    const prize = boss ? bugValue(bossSum(T)) * prizeK() : n * bugValue(T > 1 ? 10 * T - 7 : 8), mine = team.reduce((s, b) => s + statSum(b) * __hpf(b), 0);
    out.push({ m, T, ids: team.map(b => b.id), fee, prize, adv: m === "boss" ? (statSum(team[0]) >= bossSum(T) - 2 && __hpf(team[0]) >= 1 ? 2 : 0) : mine / eSum, unlock: m === "boss" && T === tierMax });
  }
  fightMode = fm, enemyTier = et;
  return out
};
window.__st = () => ({ money, tierMax, bugs: bugsOwned.map(b => ({ id: b.id, sum: statSum(b), hp: __hpf(b), mated: b.mated, tier: tierOf(statSum(b)) })),
  young: youngAll().length, gt: __gt, combat: combatState, done: typeof fightDone !== "undefined" && fightDone, fights: fightNum, scr: (document.querySelector(".screen.active") || {}).id,
  over: getComputedStyle($("ov-over")).display !== "none", err: ($("err-bar") || {}).textContent || "" });
`;

async function playGame(browser, strat, gi) {
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } }), errs = [], dead = [], log = { strat, gi, opens: {}, money: [], fights: 0, taps: 0 };
  page.on("pageerror", e => errs.push(e.message.split("\n")[0]));
  page.on("console", m => m.type() === "error" && !/ERR_/.test(m.text()) && errs.push(m.text()));
  await page.route(/^https?:/, r => r.fulfill({ body: "" }));
  await page.clock.install();
  await page.goto("file://" + path.join(root, "index.html"));
  await page.clock.runFor(500);
  await page.evaluate(PAGE());
  const st = () => page.evaluate("__st()"), ev = (js, a) => page.evaluate(js, a), run = ms => page.clock.runFor(ms);
  const ptime = s => (s.gt / SPEED + log.taps * TAP_S * 1e3) / 60e3; // player minutes
  const tap = async (sel, what) => {
    process.env.BOT_DEBUG > 1 && console.error("tap " + (what || sel));
    try { await page.locator(sel).first().click({ timeout: 1500 }); log.taps++; await run(50); return true }
    catch (e) { dead.push(`${what || sel}: ${e.message.split("\n")[0].slice(0, 80)}`); return false }
  };
  const go = async scr => { const s = await st(); if (s.scr === scr) return true;
    return tap({ "s-shop": ".bt-shop:visible", "s-box": ".bt-box:visible, #s-box.active", "s-lab": ".bt-lab:visible", "s-boo": ".bt-boo:visible" }[scr], "nav " + scr) };
  // intro: tap on the frame, away from the 3rd bug = Pure, new game
  await page.locator("#s-intro1").click({ position: { x: 5, y: 5 } }); log.taps++; await run(200);
  let s = await st(), stop = "";
  const shop = async reserve => {
    let s = await st(); if (s.bugs.length >= MAX_BUGS) return;
    await go("s-shop");
    for (let k = 0; k < MAX_BUGS; k++) {
      s = await st(); if (s.bugs.length + (await ev("shopCart.length")) >= MAX_BUGS) break;
      // strongest affordable card of the highest affordable open tier
      const pick = await ev(`(() => { const left = money - ${reserve}; for (let T = tierMax; T >= 1; T--) { const p = shopPool[T - 1].map((b, i) => ({ i, b })).filter(o => !shopCart.includes(o.b) && o.b.cost <= left).sort((x, y) => statSum(y.b) - statSum(x.b))[0]; if (p) return { T, i: p.i } } return null })()`);
      if (!pick) break;
      (await ev("shopTab")) === pick.T || await tap(`#shop-tabs button >> nth=${pick.T}`, "shop tab");
      if (!await tap(`#shop-grid > .card >> nth=${pick.i}`, "shop card")) break;
    }
    await tap("#bt-buy", "buy");
  };
  const heal = async () => {
    for (let r = 0; r < 6; r++) {
      const hurt = await ev(`ecsQuery("bug","pos").filter(e => __hpf(C.bug.get(e)) < 1).slice(0, 8).map(e => { const p = C.pos.get(e), r = boxCv.getBoundingClientRect(); return [r.left + (p.x + boxOX + 14 * Math.cos(p.dir)) * boxS, r.top + (p.y + boxOY + 14 * Math.sin(p.dir)) * boxS] })`);
      if (!hurt.length) return;
      for (const [x, y] of hurt) { await page.mouse.move(x, y), await page.mouse.down(), await run(300), await page.mouse.up(), log.taps++ }
      await ev(`__ff(90e3, () => !ecsQuery("food").length || bugsOwned.every(b => __hpf(b) >= 1))`);
    }
  };
  const breed = async () => {
    await go("s-lab");
    // full box: kill the weakest (CON+STR + sum/2) down to BREED_MAX - 6 with the Lab skull (tap the picture, then the skull)
    const weak = await ev(`bugsOwned.length < ${BREED_MAX} ? [] : bugsOwned.slice().sort((a, b) => a.con + a.str + statSum(a) / 2 - b.con - b.str - statSum(b) / 2).slice(0, bugsOwned.length - ${BREED_MAX - 6}).map(b => b.id)`);
    for (const id of weak) { const c = `.pick-grid .card[data-bid="${id}"]`; if (await tap(`${c} .card-img canvas`, "kill pic")) await tap(`${c} span:text("💀")`, "kill skull"), await run(1000), log.culled = (log.culled || 0) + 1 }
    for (let k = 0; k < 15; k++) {
      const p = await ev(`bugsOwned.length >= ${BREED_MAX} || boxFull() ? null : (p => (p.filter(b => tierOf(statSum(b)) === tierMax).length >= 2 ? p.filter(b => tierOf(statSum(b)) === tierMax) : p).sort((a, b) => b.con + b.str + statSum(b) / 2 - a.con - a.str - statSum(a) / 2).slice(0, 2).map(b => b.id))(bugsOwned.filter(canParent))`);
      if (!p || p.length < 2) break;
      for (const id of p) if (!await tap(`.pick-grid .card[data-bid="${id}"]`, "lab card")) return;
      if (!await tap(".bt-breed:visible", "breed")) return;
      await run(300); await tap(".phase-box .nav-lab", "lab back");
    }
  };
  while (!stop) {
    s = await st();
    if (s.err) { errs.push("err-bar: " + s.err.trim()); }
    const pm = ptime(s);
    while (log.money.length < MONEY_AT.length && pm >= MONEY_AT[log.money.length]) log.money.push(s.money);
    if (pm * 60e3 >= CAP_GAME_MS) { stop = "time cap"; break }
    if (log.fights >= CAP_FIGHTS) { stop = "fight cap"; break }
    // no bugs: buy; nothing affordable = game over overlay after OVER_DELAY
    if (!s.bugs.length) {
      if (s.young) { await go("s-box"); await ev(`__ff(20e3, () => bugsOwned.length)`); await run(11e3); if ((await st()).bugs.length) continue }
      await shop(0); s = await st();
      if (!s.bugs.length) { await go("s-shop"); await run(3500); s = await st(); stop = s.over ? "game over" : "stuck: no bugs, no game over"; if (!s.over) dead.push(stop); break }
    }
    await go("s-box"); await heal();
    strat === "breeder" && await breed();
    const opts = await ev(`__opts("${strat}")`);
    s = await st();
    const cheapFee = Math.min(...opts.map(o => o.fee));
    let o;
    if (strat === "greedy") o = opts.filter(o => o.T === s.tierMax && o.fee <= s.money).sort((a, b) => b.prize - a.prize)[0] || opts.filter(o => o.fee <= s.money).sort((a, b) => b.T - a.T || b.prize - a.prize)[0];
    else { const ok = opts.filter(o => (o.adv > 1 || o.m === "boss" && o.adv >= 1) && o.fee <= s.money); o = ok.find(o => o.unlock) || ok.sort((a, b) => b.prize - b.fee - a.prize + a.fee)[0] }
    if (!o) {
      // no advantaged fight: buy stronger bugs first, then the cheapest fight anyway (counted)
      const n0 = s.bugs.length; await shop(cheapFee); s = await st();
      if (s.bugs.length > n0) continue;
      o = opts.filter(o => o.fee <= s.money).sort((a, b) => b.adv - a.adv)[0]; log.forced = (log.forced || 0) + 1;
      if (!o) { dead.push("no affordable fight"); await shop(0); if ((await st()).bugs.length === s.bugs.length) { stop = "stuck: no affordable fight"; break } continue }
    } else s.money - o.fee > 0 && await shop(o.fee);
    // Booker: mode, tier, team, FIGHT
    await go("s-boo");
    const mi = [1, 2, 3, 6, "boss", "mayhem", "chaos", "mc", "rb", "wb"].indexOf(o.m);
    await tap(`#s-boo .bt-mode >> nth=${mi}`, "mode");
    (await ev("enemyTier")) === o.T || await tap(`#tier-row button >> nth=${o.T - 1}`, "tier");
    const sel = await ev("fightTeam.map(b => b.id)");
    for (const id of sel) o.ids.includes(id) || await tap(`#boo-grid .card[data-bid="${id}"]`, "unselect");
    for (const id of o.ids) sel.includes(id) || await ev(`!!ownedById(${id})`) && await tap(`#boo-grid .card[data-bid="${id}"]`, "select");
    if (!await tap("#bt-combat:enabled", "FIGHT")) { await go("s-box"); continue }
    s = await st(); if (!s.combat) { dead.push("FIGHT did not start"); continue }
    log.fights++;
    while (await ev("__fight()")) { const g = await ev("__glass()"); if (!g) continue; for (let t = 0; t < 3; t++) await page.mouse.click(g[0], g[1]), log.taps++, await run(60); log.panics = (log.panics || 0) + 1 }
    s = await st();
    if (!s.done) { log.draws = (log.draws || 0) + 1; await tap("#bt-leave", "leave"); continue }
    await run(1100);
    const won = await ev(`$("res-title").textContent === "VICTORY!"`);
    process.env.BOT_DEBUG && console.error(`${strat}#${gi} f${log.fights} ${o.m} T${o.T} n${o.ids.length} adv ${o.adv.toFixed(2)} ${won ? "WIN" : "loss"} $${s.money} bugs ${s.bugs.length} tierMax ${s.tierMax} ${ptime(s).toFixed(1)} min, dead ends ${dead.length}`);
    await page.locator("button.bt", { hasText: /^None$/ }).count() && await tap("button.bt >> text=None", "offer None");
    s = await st();
    for (let T = 2; T <= s.tierMax; T++) log.opens[T] || (log.opens[T] = { min: ptime(s), fights: log.fights });
    if (won && o.m === "boss" && o.T === 5) { log.won = { min: ptime(s), fights: log.fights }; stop = "T5 boss won"; break }
    await tap("#res-body .nav-box", "result BugBox");
  }
  s = await st();
  log.stop = stop, log.tierEnd = s.tierMax, log.min = ptime(s), log.dead = dead, log.errs = [...new Set(errs)];
  await page.close();
  return log;
}

(async () => {
  const browser = await pw.chromium.launch(), jobs = [], logs = [], t0 = Date.now();
  const prog = path.join(os.tmpdir(), `bugbox-bot-${GAMES}.jsonl`), keep = fs.existsSync(prog) ? fs.readFileSync(prog, "utf8").split("\n").filter(Boolean).map(JSON.parse) : [];
  keep.forEach(l => STRATS.includes(l.strat) && logs.push(l));
  STRATS.forEach(st => { for (let g = 0; g < GAMES; g++) logs.some(l => l.strat === st && l.gi === g) || jobs.push([st, g]) });
  let next = 0;
  await Promise.all(Array.from({ length: PAR }, async () => {
    while (next < jobs.length) {
      const [st, g] = jobs[next++];
      const l = await playGame(browser, st, g).catch(e => ({ strat: st, gi: g, stop: "bot crash", dead: [e.message.split("\n")[0]], errs: [], opens: {}, money: [], fights: 0 }));
      logs.push(l), fs.appendFileSync(prog, JSON.stringify(l) + "\n"), process.stderr.write(`\r${logs.length}/${STRATS.length * GAMES} games, ${Math.round((Date.now() - t0) / 1e3)} s   `);
    }
  }));
  await browser.close();
  process.stderr.write("\n");
  fs.writeFileSync(path.join(os.tmpdir(), "bugbox-bot.json"), JSON.stringify(logs, null, 1));
  const med = a => { a = a.filter(x => x != null).sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null }, f0 = x => x == null ? "–" : Math.round(x);
  console.log(`bot ${GAMES} games per strategy, ${Math.round((Date.now() - t0) / 1e3)} s real. cells: median player min / median fights / games reaching`);
  console.log(["", ...STRATS].join("\t"));
  const row = (name, fn) => console.log([name, ...STRATS.map(st => fn(logs.filter(l => l.strat === st)))].join("\t"));
  for (let T = 2; T <= 5; T++) row(`T${T} open`, g => { const r = g.filter(l => l.opens[T]); return `${f0(med(r.map(l => l.opens[T].min)))}m/${f0(med(r.map(l => l.opens[T].fights)))}f/${r.length}` });
  row("T5 boss won", g => { const r = g.filter(l => l.won); return `${f0(med(r.map(l => l.won.min)))}m/${f0(med(r.map(l => l.won.fights)))}f/${r.length}` });
  row("game over %", g => f0(100 * g.filter(l => l.stop === "game over").length / g.length) + "%");
  for (let T = 1; T <= 5; T++) row(` over in T${T}`, g => g.filter(l => l.stop === "game over" && l.tierEnd === T).length);
  row("other ends", g => Object.entries(g.filter(l => l.stop !== "game over" && !l.won).reduce((a, l) => (a[l.stop] = (a[l.stop] || 0) + 1, a), {})).map(([k, v]) => `${k} ${v}`).join(", ") || "–");
  row("fights (median)", g => f0(med(g.map(l => l.fights))));
  row("forced fights", g => f0(med(g.map(l => l.forced || 0))));
  row("draws (Leave)", g => g.reduce((s, l) => s + (l.draws || 0), 0));
  row("culled (Lab skull)", g => g.reduce((s, l) => s + (l.culled || 0), 0));
  row("glass taps (x3)", g => g.reduce((s, l) => s + (l.panics || 0), 0));
  MONEY_AT.forEach((m, i) => row(`$ at ${m} min`, g => { const r = g.filter(l => l.money.length > i); return r.length ? `$${f0(med(r.map(l => l.money[i])))} (${r.length})` : "–" }));
  row("dead ends", g => g.reduce((s, l) => s + l.dead.length, 0));
  row("JS errors", g => g.reduce((s, l) => s + l.errs.length, 0));
  const all = (k) => [...new Set(logs.flatMap(l => l[k].map(x => `${l.strat}: ${x}`)))];
  console.log("dead ends:\n" + (all("dead").slice(0, 20).join("\n") || "none"));
  console.log("JS errors:\n" + (all("errs").slice(0, 20).join("\n") || "none"));
})();
