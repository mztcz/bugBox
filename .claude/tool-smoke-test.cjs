// BUGBOX smoke test: module check + headless run (box, fight, overlays). Exit 0 = OK.
// Usage: node .claude/tool-smoke-test.cjs         runs only after the user wrote okp (token set by --arm)
//        node .claude/tool-smoke-test.cjs --arm   UserPromptSubmit hook: prompt okp sets the token, any other prompt removes it
//        node .claude/tool-smoke-test.cjs --gate  PreToolUse hook on Skill: blocks skill okp without the token
const fs = require("fs"), path = require("path"), os = require("os"), { execFileSync } = require("child_process");
const root = path.resolve(__dirname, "..");
const token = path.join(os.tmpdir(), "bugbox-okp");
if (process.argv.includes("--arm")) { /^\s*okp\s*$/i.test(JSON.parse(fs.readFileSync(0, "utf8")).prompt || "") ? fs.writeFileSync(token, "") : fs.rmSync(token, { force: true }); process.exit(0) }
if (process.argv.includes("--gate")) { /okp/.test(JSON.parse(fs.readFileSync(0, "utf8")).tool_input?.skill) && !fs.existsSync(token) && (console.error("OKP BLOCKED: runs only after the user writes okp"), process.exit(2)); process.exit(0) }
if (!fs.existsSync(token)) { console.log("SMOKE BLOCKED: runs only after the user writes okp"); process.exit(1) }
const fail = msg => { console.log("SMOKE FAIL\n" + msg); process.exit(1) };
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const scripts = [...html.matchAll(/<script src="([^"]+\.js)"><\/script>/g)].map(m => m[1]);
const lost = [...html.matchAll(/(?:src|href)="(?!https?:|#|data:)([^"]+)"/g)].map(m => m[1]).filter(f => !fs.existsSync(path.join(root, f)));
lost.length && fail("missing local files: " + lost.join(", "));
// 0) CLAUDE.md File map: every `symbol` in a row (Area + Symbol, file names skipped) must exist in its file
const miss = [];
for (const row of fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8").split("\n")) {
  const c = row.split("|").map(s => s.trim()), f = (c[2] || "").match(/^`([\w.-]+)`$/);
  if (!f) continue;
  const src = fs.existsSync(path.join(root, f[1])) ? fs.readFileSync(path.join(root, f[1]), "utf8") : null;
  if (src === null) { miss.push(f[1] + ": file missing"); continue }
  for (const [, s] of (c[1] + c[3]).matchAll(/`[#.]?([\w.-]+)/g))
    /\./.test(s) || new RegExp(`(?<![\\w$-])${s}(?![\\w$-])`).test(src) || miss.push(f[1] + ": " + s);
}
miss.length && fail("file map symbols not found:\n" + miss.join("\n"));
// 1) all scripts as one ES module: duplicate top-level names (function/const/let/class) across files = SyntaxError
const mod = path.join(os.tmpdir(), "bugbox-smoke.mjs");
fs.writeFileSync(mod, scripts.map(f => fs.readFileSync(path.join(root, f), "utf8")).join("\n;\n"));
try { execFileSync(process.execPath, ["--check", mod], { stdio: "pipe" }) }
catch (e) { fail("module check: " + String(e.stderr).split("\n").filter(l => /Error|^\s*\^|bugbox-smoke/.test(l)).slice(0, 6).join("\n")) }
// 2) headless browser run
let pw;
try { pw = require("playwright") } catch { try { pw = require("/opt/node-tools/node_modules/playwright") } catch { fail("playwright not found") } }
(async () => {
  const b = await pw.chromium.launch(), p = await b.newPage(), errs = [];
  await p.route(/^https?:/, r => r.fulfill({ body: "" })); // external (Google Font) stubbed: offline must not fail; missing local files still do
  p.on("pageerror", e => errs.push("pageerror: " + e.message));
  p.on("console", m => m.type() === "error" && !/ERR_/.test(m.text()) && errs.push("console: " + m.text()));
  const step = async (name, js, ms) => { try { await p.evaluate(js) } catch (e) { errs.push(name + ": " + e.message.split("\n")[0]) } await p.waitForTimeout(ms) };
  await p.goto("file://" + path.join(root, "index.html")); await p.waitForTimeout(1500);
  await step("market", "openMkt(); mktCart = mktPool[0].slice(0, 3); mktDone()", 500);
  await step("box", "simSpd = 16", 3000);
  await step("overlays", "['info','tut','ach','morph','abil','rec'].forEach(openInfoTab); ov('ov-inf', 0); openDz(); ov('ov-design', 0); openLab(); openBoo(); showScreen('s-terr')", 800);
  await step("fight", "fightTeam = bugsOwned.slice(0, 2); fightMode = 2; startFight($('bt-combat'), 1)", 300);
  await step("fight speed", "simSpd = 16", 6000);
  const st = await p.evaluate("({ v: GAME_VERSION, bugs: bugsOwned.length, ms: Math.round(fightMs), done: fightDone, bar: (document.getElementById('err-bar') || {}).textContent || '' })").catch(e => ({ bar: e.message }));
  await step("leave fight", "$('bt-leave').click()", 800);
  st.bar && errs.push("err-bar: " + st.bar.trim());
  await b.close();
  errs.length ? fail(errs.join("\n")) : console.log(`SMOKE OK v${st.v}: ${scripts.length} scripts, fight ${st.ms} ms, done=${st.done}, bugs=${st.bugs}`);
})().catch(e => fail("runner: " + e.message));
