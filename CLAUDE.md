# CLAUDE.md — bugBox

## Projekt
- HTML5 hra o broucích. Veškerý text ve hře i kódu anglicky.
- Uživatel je neprogramátor, pracuje z Android telefonu.
- Sekce File map níže určuje, které soubory číst; čti jen ty.

## Kód
- Vždy ECS architektura, efektivní kód.
- Méně kódu, méně proměnných, méně názvů; hra stejná nebo lepší.
- Sdílené funkce volané z více míst místo mnoha podobných kusů kódu.
- Žádné redundance, duplicity ani mrtvý kód.
- Upravuj existující funkce místo přidávání souborů. Čti jen nutné části souborů.
- Při každé změně kódu zvyš verzi o +1 minor: `GAME_VERSION` v core.js, řádek 1. Změna jen .md souborů verzi nemění.
- Sekci File map měň jen při oktk. Změny souborů a symbolů do té doby sbírej v chatu.
- Pokyn „oktk“ (nebo „push“) = konec session: proveď skill oktk (.claude/skills/oktk/SKILL.md).
- Smoke test: `node .claude/smoke.cjs`. Hook ho spouští před každým `git push` a při chybě push zablokuje.
- Uživatele nikdy nežádej, aby četl nebo upravoval kód.

## Workflow
- Repo: https://github.com/mztcz/bugBox
- Režim B (Claude Code, zápis do repa): commituj jen změněné soubory, push přímo do main, žádný pull request. Commit zpráva = 1 řádek anglicky: "vX.Y: co se změnilo".
- Po každém pushi do main napiš do odpovědi klikací testovací URL: https://mztcz.github.io/bugBox/
- Testovací artefakt (aktualizuj jen změněné soubory, URL zůstává): https://claude.ai/artifact/DAGsKmWecR1uCaAMeUMhoB
- Režim A (chat bez zápisu do repa): hned bez ptaní naklonuj main. Když se `GAME_VERSION` liší od verze, kterou uvede uživatel, napiš to 1 řádkem a pracuj na klonu. Když klon zmizí, naklonuj znovu a zopakuj úpravy session. Když klonování selže, požádej o nahrání jen potřebných souborů.
- Režim A dodávka: jen změněné soubory, každý zvlášť, nikdy .zip. Každý soubor kumulativní = originál + všechny úpravy session.
- Režim A na požádání: testovací build `bugbox-vXX.X.html` (všechny .js a .css vložené do index.html), vytvořený skriptem, ne do repa.

## Odpovědi (česky, tykej)
- Odrážky, číslované; čísla unikátní a rostoucí v rámci celé session.
- Na otázky odpovídej nejdřív doslovně, důsledně a na všechny.
- Stručně, přesně, konzistentně, mechanicky. Žádné vágní informace ani neurčité kvalifikátory bez dat či důvodu.
- Když něco nevíš, napiš "nevím". Ověřená fakta mají prioritu.
- Neopakuj fakt, frázi ani myšlenku. Nevkládej do odpovědí kód, úvahy ani mezikroky. Diffy jen v SUM.
- Nepoužívej slova: nepřesné, absolutní.
- Před odesláním zkontroluj: shodu osoby, opakování slov, diakritiku, chybějící slovesa, jednotky, logickou konzistenci.
- "vvv" od uživatele = v poslední odpovědi je chyba nebo neověřená informace; zkontroluj celou odpověď, ověř a oprav. Sám "vvv" nikdy nepiš.
- [sug] = konkrétní návrh kdykoliv, když jde něco udělat výrazně lépe, rychleji, stručněji nebo za méně tokenů.
- [tip] = když by mohl uživatel promptovat výrazně lépe.

## Konec každé odpovědi
1. 2 shrnující věty za celou zprávu (max 50 znaků) + 1 stručný návrh, jak poslední krok udělat jinak a lépe.
2. [sou] související, [alt] alternativní, [opp] oponující informace.
3. [b] [c] [d] = tři next-step návrhy v infinitivu, spustitelné zadáním jednoho písmene.
4. Při změnách kódu: nový řádek "vX.Y:".
5. Hlavní text odpovědi max 5 řádků; body 1–4 se do limitu nepočítají. Podrobnosti ověření (co a proč platí/neplatí) jen na vyžádání.
6. "SUM: " (seznam všech rozdílů proti začátku session, bez slov psaných celých velkými písmeny) jen na vyžádání.

## File map
Simple bug life simulator. Plain `<script src>` files, no modules. Everything shares one global scope.
Load order = the order in `index.html`. `main.js` is last and is the only file that runs DOM code at load time
(static bindings, version tag). Other files bind handlers only to elements they build or open at runtime.

### Terms
- One room, one box, one canvas. The global `combatState` decides everything:
  **0** = peaceful box (feeding, mating, dragging), **1** = fight.
  Never say "terrarium" or "arena" for these two states.
- **box** = the canvas and its bugs, in both combat states.
- **Booker** = the screen where the player picks bugs, mode and tier. File `boo.js`, id `s-boo`.
- **Market** = buying bugs. File `mkt.js`, id `s-mkt`. **Shop** is reserved for a future screen that sells box items.
- **modes** (`fightMode`): `1 2 3 6` (NvN), `mayhem` (any count), `mc` (mortal combat: 1 bug, T1→T5 in a row), `boss` (1 bug, stat sum 10T−9..10T), `rb` raid boss and `wb` world boss (1–10 bugs).
- **tier** (`enemyTier` 1–5): enemy stat sum 10T−9..10T (T1: 5..10), boss 10T; boss abilities T−1.

### Routing table — "I want to change X" → open this file, look for this symbol

| Area of the game | File | Symbol |
|---|---|---|
| Layout, screens, buttons, overlays (markup), crash reporter | `index.html` | `#s-terr` `#s-boo` `#s-lab` `#s-mkt`, `#terr-bar-row`, `#ov-set` |
| Colours, fonts, sizes, spacing, screen shake | `style.css` | `#toast`, `.shake` |
| Version number (shown by `main.js`), math helpers, sound effects (bite pitch: 250 Hz enemy, 220 Hz player) | `core.js` | `GAME_VERSION` (line 1), `SFX`, `beep` |
| Tutorial list, achievement list, unlock rules, toasts on unlock, record updates (saved `records` + this game's `run`, both via `RECS`) | `achievements.js` | `achSt`, `records`, `run`, `RECS`, `bugbox_records` |
| Starting money, tunables (walk timers), global variables, fight modes, act setter, turning | `state.js` | `bugsOwned`, `fightMode`, `MODES`, `enemyTier` (1–5), `WALK_MIN`, `WALK_MAX`, `setAct` (only act setter), `think` (pause, length by INT), `aiAct`, `newDir` (random walk direction, called only by move.js decide), `turnToward`, `intMs` (INT pause base, also flee length) |
| Bug object, names, stat bars, max HP (boss HP multiplier) | `bug.js` | `maxHpOf`, `hpMul` |
| Ability list, ability rules, bite damage, dodge, bite side shove, bite prep by AGI, flee, inheritance | `abilities.js` | `ABILITIES`, `applyBite`, `biteDodged`, `biteDone`, `bitePrepOf`, `flee`, `newCombat` |
| Bug cards (Market/lab/Booker/result), HP bars, kill button (sets `run.end`), focus line, blocked-flash, toast text | `cards.js` | `makeBugCard`, `drawHpBar`, `inspectLine`, `toast`, `flashBlocked` |
| Screen switching, info overlay tabs, money display | `screens.js` | |
| Bug body shapes, colour palette, walk style (gait), graphics theme, shadow (leg shadow = straight line from shifted leg root to foot), one-colour corpse | `morph.js` | `randomMorph`, `setPalette`, `setGait`, `setBugTheme`, `drawMorphBug` option `flat` |
| Drawing one bug, card thumbnails | `drawbug.js` | `drawBugStyled` |
| Box background art (random per fight, index.html #bt-bg rerolls) | `bg.js` | `drawBg`, `bgPick` |
| Obstacle types, shapes and variants (index = kind, `v` = variant) | `obst.js` | `OBST` |
| Box canvas, `combatState` declaration, Science HUD toggles (kept per combat state), obstacle and bug spawning, fight-only buttons, top-left title per mode, damage number spawn | `terr.js` | `bugsInTerrView`, `sciSt`, `genObstacles`, `spawnTerr`, `HUD_FIGHT_ONLY`, `syncHud`, `spawnDmgPop` |
| Market screen, game-over check | `mkt.js` | `openMkt`, `renderMkt`, `mktDone`, `armOverWatch` |
| Entity system (rarely touched), draw order (dragged item on top, faster bug on top of a slower one it overlaps) | `ecs.js` | `ecsQuery`, `C`, `ecsFront` |
| Act choice, walking, steering, wandering, feeding (rush to seen food), collisions, wall hit (slide along the glass, then `wallNext`), wall margin = bug radius, stuck manoeuvre, corpse slow-down (speed × `CORPSE_SLOW` = 0.5), busy bug skips walking, rare acts (INT 5+ picks equally from `RARE_ACT`), feeding also in fight, fight seek points, overlap layering (faster bug via `ecsFront`, speed = `p.v`) | `move.js` | `resolveBodies`, `decide` (only act chooser), `sysSteer`, `sysMove`, `sysSeek`, `SLIDE_K`, `wallNext`, `clampToBox`, `busy`, `sysRareAct`, `RARE_ACT`, `sysFeed`, `CORPSE_SLOW`, `sysRenderObstacles` (shadow pass, neon pass via `flatCol`) |
| Mating (act `breeding`, needs full HP and both not `mated`), love bites (`loveBites`, also when a pair is `mated`), eggs, hatching, box capacity | `mate.js` | `interactEligible` |
| Breeding lab (sorting: first tap `Nam` A→Z, all others highest first; selection, offspring) | `lab.js` | `BREED_SORT`, `setLabSort` |
| Booker screen (modes, tier buttons 01–05, team picking, BOSS stat-sum filter) | `boo.js` | `openBoo`, `setMode`, `setTier`, `teamMax`, `bossFit` |
| Fight AI, targeting, ability firing, target switch to weakest attacker, panic burst (flee angle inside the bug's quadrant from box centre, first half of the turn on the spot), flee food pull (max 30 deg), combat timers, damage number motion | `combatai.js` | `sysCombatAI`, `panicAll`, `tickTimers` |
| What is drawn each frame (food also in fight), bottom info line, red hit overlay, hit recoil 7 px and biter lunge 7/3 px, floating damage numbers (offset from the bitten bug's position), grey corpse fade | `render.js` | `drawHit`, `dmgPops` |
| Hit-testing under the finger, dragging, obstacle rotation by circling | `input.js` | `nearest`, `obstacleAt`, `draggableAt`, `dragStart`, `dragMove`, `endDrag` |
| Static DOM bindings, version tag, triple-tap panic, focus on corpses | `main.js` | `tapT` |
| Simulation loop, speed, box backdrop | `loop.js` | `tick(dt, fight)` = one simulation step, sole countdown of `actT` and `hitT`, `simLoop`, `drawBoxBackdrop` |
| Enemy generation (stat sum by tier), bosses (BOSS 2×, RB 3× 10 HP, WB 3× 50 HP, kept per tier), prize $80×T×HP multiplier, fight start (salute toast + freeze), result screen, per-bug fight tally, MC break (food + NEXT), fight-end and stalemate check, fight end removes all fight entities | `fight.js` | `statsOf`, `buildEnemies`, `BOSS`, `bosses`, `wbKeep`, `weekOf`, `checkFightEnd`, `endFight`, `showFightResult`, `tallyFight` |
| Bug designer overlay | `dz.js` | |
| Info / Morphology / Abilities texts | `wiki.js` | |
| Records screen (columns this run / all games, `Last loss` = `run.end`) | `records.js` | `renderRecords` |

### Naming rules
- `SCREAMING_SNAKE_CASE` — constants that never change.
- `camelCase` — variables and functions.
- **stats** = a single bug's `con str agi int per` and HP. Nothing else.
  Cross-game totals are **records**. One game's unlocks are **achievements**.
- ECS components: `bug pos vel walk team combat food obstacle`,
  read with `C.pos.get(entity)`, listed with `ecsQuery("bug","pos")`.
- **act** = what a bug does now, one timer: `walk.act` + `walk.actT`.
  Set only with `setAct`. Values: `thinking walking turning rushing waiting observing stalking flankTraining breeding fighting fleeing`.
  `fighting` and `fleeing` = movement driven by `combatai.js` (`aiAct`). Wall slide = `walk.slide`, not an act.
- Mating checks HP.
- Teams: `0` = player, `1` = enemy.

### Running it
Open `index.html`. All paths are relative, so it works from a local folder or from GitHub Pages with no build step. The `index.html` contains an on-screen crash reporter (red bar at the bottom). It prints missing files and JS errors (Android has no console).

### Tool files
- `.claude/smoke.cjs` = smoke test: local files linked from `index.html` must exist, every backticked symbol in a routing table row (Area + Symbol columns, file names skipped) must exist in its file; external requests (Google Font) are stubbed so offline runs pass, then all scripts as one ES module (duplicate top-level names across files fail), then headless Chromium: market, box, info tabs, designer, lab, booker, 2v2 fight, leave. `--hook` exits 2 on failure.
- `.claude/settings.json` = PreToolUse hook runs the smoke test before every `git push` and blocks it on failure.
- `.claude/skills/oktk/SKILL.md` = end-of-session routine triggered by "oktk".
- `.claude/agents/skoukni-kod.md` = read-only review subagent; run only when the user writes "skoukniKod" (Agent tool, `subagent_type: skoukni-kod`).
`style.css` has few, very long lines — prefer `grep -o` with a short context over `grep -n`. The `.js` files are multi-line; `grep -n` is safe.

### Saved data
- `bugbox_records` in localStorage = cross-game **records** (games, kills, fights,
  wins, best bug count, best stat sum, top killer, longest dynasty). Persists. Reset button only.
- `bugbox_wb` in localStorage = World Bosses of the current week (lost HP kept until Sunday 23:59, killed WB is replaced). The only saved bugs.
- Tutorial, achievements (`achSt`) and `run` (this game's records) are **one game each**. Never persist them.
- `mated` resets for all bugs only in `showFightResult` (completed fight). Leave skips it.
- Player bugs, money, eggs, BOSS and RB are never saved. Reloading the page starts a new game.
