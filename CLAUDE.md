# CLAUDE.md — bugBox

## Projekt
- HTML5 hra o broucích. Veškerý text ve hře i kódu anglicky.
- Uživatel je neprogramátor, pracuje z Android telefonu.
- Sekce File map níže určuje, které soubory číst; čti jen ty.
- Nástroje v `.claude/` nazývej jmény z Tool files (hook-…, skill-…, agent-…, tool-…). Soubory ani spouštěcí slova se nepřejmenovávají.

## Kód
- **Herní pravidla, čísla, limity, balanc (věci které mají dopad na hráče které hráč potom zažije) měň jen přesně podle zadání. Každou další herní změnu nejdřív navrhni s dopadem a čekej na schválení. Neschválené nedělej!**
- **Všechny věci, které chceš udělat nebo změnit sám od sebe, nejdřív projdi s uživatelem a nech schválit.**
- Vždy ECS architektura, efektivní kód.
- Méně kódu, méně proměnných, méně názvů; stejná hra.
- Sdílené funkce volané z více míst místo mnoha podobných kusů kódu.
- Žádné redundance, duplicity ani mrtvý kód.
- Upravuj existující funkce místo přidávání souborů. Čti jen nutné části souborů.
- Při každé změně kódu zvyš verzi o +1 minor: `GAME_VERSION` v core.js, řádek 1. Změna jen .md souborů nebo souborů v `.claude/` verzi nemění.
- Sekci File map měň jen při oktk. Změny souborů a symbolů do té doby sbírej v chatu.
- Pokyn „oktk“ = samostatná zpráva uživatele „oktk“ = konec session: proveď skill skill-oktk (.claude/skills/skill-oktk/SKILL.md). Novou session nikdy nezakládej, uživatel si ji zakládá sám.
- Smoke test (`node .claude/tool-smoke-test.cjs`) se smí pouštět jenom když uživatel napíše oktk. Vlastní jiné testy (např. headless prohlížeč) jsou povolené kdykoliv.
- Uživatele nikdy nežádej, aby četl nebo upravoval kód.

## Workflow
- Repo: https://github.com/mztcz/bugBox
- Režim B (Claude Code, zápis do repa): commituj jen změněné soubory, push jen do session větve, žádný pull request. Do main jen přes oktk (skill-oktk). Commit zpráva: 1. řádek anglicky "vX.Y: nejdůležitější změny pro hráče", 1 prázdný řádek, pak SUM ve stejném znění jako v odpovědi k té změně (česky, bez řádku "vX.Y:").
- Po každém pushi do main napiš do odpovědi klikací testovací URL https://mztcz.github.io/bugBox/ a k ní verzi vX.Y, která je v main.
- Po každé změně kódu a pushi do session větve je první řádek odpovědi klikací URL `https://raw.githack.com/mztcz/bugBox/<session větev>/index.html` a k ní verze vX.Y. Nová verze se tam ukáže po pár minutách (cache raw.githack).
- Testovací artefakt https://claude.ai/artifact/DAGsKmWecR1uCaAMeUMhoB jen na požádání: posílej jen soubory změněné od jeho poslední verze, URL zůstává. Odpověď, která ho vytvoří nebo aktualizuje, začíná řádkem: odkaz, verze vX.Y, přibližná cena v tokenech (odhad z velikosti obsahu, který prošel kontextem).
- Režim A (chat bez zápisu do repa): hned bez ptaní naklonuj main. Když se `GAME_VERSION` liší od verze, kterou uvede uživatel, napiš to 1 řádkem a pracuj na klonu. Když klon zmizí, naklonuj znovu a zopakuj úpravy session. Když klonování selže, požádej o nahrání jen potřebných souborů.
- Režim A dodávka: jen změněné soubory, každý zvlášť, nikdy .zip. Každý soubor kumulativní = originál + všechny úpravy session.
- Režim A na požádání: testovací build `bugbox-vXX.X.html` (všechny .js a .css vložené do index.html), vytvořený skriptem, ne do repa.

## Odpovědi (česky, tykej)
- Odrážky, číslované; čísla unikátní a rostoucí v rámci celé session.
- Na otázky odpovídej nejdřív doslovně, důsledně a na všechny.
- Stručně, přesně, konzistentně, mechanicky. Žádné vágní informace ani neurčité kvalifikátory bez dat či důvodu.
- Když něco nevíš, napiš "nevím". Ověřená fakta mají prioritu.
- Neopakuj fakt, frázi ani myšlenku. Nevkládej do odpovědí kód, úvahy ani mezikroky! Jen v SUM můžeš stručně popsat rozdíly, slovy, bez diffů.
- Nepoužívej slova: nepřesné, absolutní.
- Před odesláním zkontroluj: shodu osoby, opakování slov, diakritiku, chybějící slovesa, jednotky, logickou konzistenci.
- "vvv" od uživatele = v poslední odpovědi je chyba nebo neověřená informace; zkontroluj celou odpověď, ověř a oprav. Sám "vvv" nikdy nepiš.
- [sug] = konkrétní návrh kdykoliv, když jde něco udělat výrazně lépe, rychleji, stručněji nebo za méně tokenů.
- [tip] = když by mohl uživatel promptovat výrazně lépe.

## Konec každé odpovědi
1. 2 shrnující věty za celou zprávu (max 50 znaků) + [proc] = 1 stručný návrh, jak poslední krok udělat jinak a lépe; jen když jde výrazně lépe, jinak vynech.
2. [sou] související, [alt] alternativní, [opp] oponující informace.
3. [b] [c] [d] = tři next-step návrhy v infinitivu, spustitelné zadáním jednoho písmene.
4. Při změnách kódu: "SUM: " + seznam všech rozdílů proti začátku session (krom SUM bez slov psaných celých velkými písmeny), 1 prázdný řádek, 1–4 věty o změnách od poslední zprávy (součást SUM, bez čísla verze), nový řádek "vX.Y:" = jediné místo SUM s číslem verze.
5. SUM a 2 shrnující věty (bod 1) jsou výjimka z pravidel o opakování a délce: smí opakovat klíčové informace. Hlavní text odpovědi max 5 řádků; body 1–4 se do limitu nepočítají. Podrobnosti ověření (co a proč platí/neplatí) jen na vyžádání.

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
- **Market** = buying bugs (tabs T1–T5) and items (tab Items). File `mkt.js`, id `s-mkt`.
- **modes** (`fightMode`): `1 2 3 6` (NvN), `mayhem` (any count), `mc` (mortal combat: 1 bug, T1→T5 in a row), `boss` (1 bug, stat sum 10T−9..10T), `rb` raid boss and `wb` world boss (1–10 bugs).
- **tier** (`enemyTier` 1–5) = tens of the stat sum (`tierOf`): T1 5–9, T2 10–19, T3 20–29, T4 30–39, T5 40–50. Generated stats max 3/5/7/10/13 for T1–T5 (`tierLim`, `STAT_LIM`); sum clamped to 5 × that max. Boss stat sum 10T−1 (T5 50), boss abilities T−1.
- **unlocks** (Market tabs and Booker tiers, `tierOpen` = T ≤ `tierMax`, one game): only T1 open at start; winning a `boss` fight of tier T opens T+1 (toast). Locked tier tap: Pure shows toast via `tierGate`, Dev selects it.
- **Pure / Dev** (`dev`): intro tap on `[ TAP TO ENTER ]` = Pure (no DESIGN, no BG button), tap elsewhere = Dev (locked buttons grey but clickable; Leave in a fight also resets `mated`).
- **stats** 1–20; formulas run linearly from stat 1 to stat 20 (`statLin`), thresholds (5+, INT tiers, achievements) use the same stat. Stat sum max 50.

### Routing table — "I want to change X" → open this file, look for this symbol

| Area of the game | File | Symbol |
|---|---|---|
| Layout, screens, buttons, overlays (markup), crash reporter, Booker sort row | `index.html` | `#s-terr` `#s-boo` `#s-lab` `#s-mkt`, `#terr-bar-row`, `#ov-set`, `#boo-sort` |
| Colours, fonts, sizes, spacing, screen shake | `style.css` | `#toast`, `.shake` |
| Version number (shown by `main.js`), math helpers, sound effects (bite pitch: 250 Hz enemy, 220 Hz player), polygon path helper | `core.js` | `GAME_VERSION` (line 1), `SFX`, `beep`, `pathPts` |
| Tutorial list, achievement list, unlock rules, toasts on unlock, record updates (saved `records` + this game's `run`, both via `RECS`), threshold unlocks, tier/star/five-star achievements of a new owned bug (Market, lab, hatched egg; not designer), new tier achievement | `achievements.js` | `achSt`, `records`, `run`, `RECS`, `bugbox_records`, `achAt`, `achBug`, `achChild` |
| Starting money ($100), tunables (walk timers), global variables, fight modes, act setter, turning, random sign, owned bug by id, fresh lab state, Pure/Dev flag, stat scale ratchet, tier unlocks, locked button attribute and tap gate, allowed obstacle kinds and pending obstacle offer | `state.js` | `dev`, `statCap`, `tierMax`, `tierOpen`, `lockAttr`, `tierGate`, `obstKinds`, `obstOffer`, `bugsOwned`, `fightMode`, `MODES`, `enemyTier` (1–5), `WALK_MIN`, `WALK_MAX`, `setAct` (only act setter), `think` (pause, length by INT), `aiAct`, `newDir` (random walk direction, called only by move.js decide), `turnToward` (takes the entity), `intMs` (INT pause base, also flee length), `rsign`, `ownedById`, `newLab` |
| Bug object, names, stat bars (scale 5/10/20 ratcheting for the whole game: 10 at stat 6+ or T3 open, 20 at stat 11+ or T4 open, same scale for all cards; sum row: grey (sum) centred over the numbers), stat colours (green up to 10), tier stat limit, max HP (boss HP multiplier), stat sum cap 50, tier from sum, bug value (shared economy: rate $2^T per stat point, value = rate × stat sum), shared stat generator (Market + enemies + bosses), boss sum, stars, roles (default Fighter) | `bug.js` | `maxHpOf`, `hpMul`, `statColor`, `statScale`, `tierLim`, `STAT_SUM_MAX`, `capSum`, `STAT_LIM`, `tierRate`, `bugValue`, `tierOf`, `genStats`, `bossSum`, `starsOf`, `roleOf`, `ROLES` |
| Ability list, ability rules, ability roll chance per slot (`ABIL_ROLL_CHANCE` 25/20/10/5/0 %), lost-target scan max 180° (`scanOf`), bite damage, dodge, bite side shove, bite prep by AGI, flee, inheritance, linear stat formula (value at stat 1 → value at stat 20) | `abilities.js` | `ABILITIES`, `applyBite`, `biteDodged`, `biteDone`, `bitePrepOf`, `flee`, `newCombat`, `statLin` |
| Bug cards (Market/lab/Booker/result; rows: name stars label / tier · role in default colour / G · K/F / mated / price; image right with half-width HP bar above), star and tier colours, HP bars, kill button (sets `run.end`), focus line (stats + grey stat sum in brackets), blocked-flash, toast text | `cards.js` | `makeBugCard`, `STAR_COL`, `gkfLine`, `hpBar`, `drawHpBar`, `inspectLine`, `toast`, `flashBlocked` |
| Screen switching, info overlay tabs, money display (Market, box, lab, Booker `boo-money`), closing the result screen shows a pending obstacle offer | `screens.js` | |
| Bug body shapes (stat-linked from stats 1–20, length/width/legs not rounded), colour palette, walk style (gait), graphics theme, shadow (leg shadow = straight line from shifted leg root to foot), one-colour corpse, head-to-tail top | `morph.js` | `statMorph`, `randomMorph`, `setPalette`, `setGait`, `setBugTheme`, `drawMorphBug` option `flat`, `morphTop` |
| Drawing one bug, card thumbnails | `drawbug.js` | `drawBugStyled` |
| Box background art (random per fight, index.html #bt-bg rerolls) | `bg.js` | `drawBg`, `bgPick` |
| Obstacle types, names, shapes and variants (index = kind, `v` = variant), capsule hitbox per variant measured from drawn pixels on first use of a kind (PCA axis, 1st–99th percentile length and width, ratios of r) | `obst.js` | `OBST`, `OBST_NAME`, `OBST_CAP`, `capOf` |
| Box canvas, `combatState` declaration, Science HUD toggles (kept per combat state), obstacle and bug spawning (1–3 obstacles per box and per fight, start kinds Rock + Leaf; after a win pick 1 of 3 new kinds while 3+ remain, shown when the result screen closes), fight-only buttons (BG only in Dev), top-left title per mode, damage number spawn, fight box size (area = `tierMax` / 4 of the full box: T1 1/4, T2 2/4, T3 3/4, T4+ full; peaceful positions not rescaled across combat states) | `terr.js` | `boxK`, `resizeBoxCV`, `rescaleBox`, `bugsInTerrView`, `sciSt`, `genObstacles`, `placeObst`, `spawnObst`, `offerObst`, `showObstOffer`, `spawnTerr`, `HUD_FIGHT_ONLY`, `syncHud`, `spawnDmgPop` |
| Market screen (tabs T1–T5: 6 bugs each from `genStats`, price = `bugValue` × (1 + 0.25 × stars) + 10 × `tierRate` per ability, rounded, T2–T5 locked until unlocked; unaffordable cards dimmed `card-off`; tab Items: numbered sample items, buying not active yet), game-over check | `mkt.js` | `openMkt`, `renderMkt`, `mktDone`, `armOverWatch`, `mktTab`, `setMktTab`, `MKT_ITEMS` |
| Entity system (rarely touched), draw order (dragged item on top, faster bug on top of a slower one it overlaps) | `ecs.js` | `ecsQuery`, `C`, `ecsFront` |
| Act choice, walking, steering, wandering, feeding (rush to seen food at any HP below max; in fight not while in melee), collisions (obstacles as capsules via `obstCap`, shared with input.js), wall hit (slide along the glass, then `wallNext`), wall margin = bug radius, stuck manoeuvre, corpse slow-down (speed × `CORPSE_SLOW` = 0.5), busy bug skips walking, rare acts (INT 5+ picks equally from `RARE_ACT`), feeding also in fight, fight seek points (next point inside ±60° of heading, `SEEK_CONE`; else the other half of the box), overlap layering (faster bug via `ecsFront`, speed = `v` in `vel`) | `move.js` | `obstCap`, `resolveObstacles`, `rockAvoid`, `resolveBodies`, `decide` (only act chooser), `sysSteer`, `sysMove`, `sysSeek`, `SLIDE_K`, `wallNext`, `clampToBox`, `busy`, `sysRareAct`, `RARE_ACT`, `sysFeed`, `CORPSE_SLOW`, `sysRenderObstacles` (shadow pass, neon pass via `flatCol`) |
| Mating (act `breeding`, needs full HP and both not `mated`), love bites (also when a pair is `mated`), one pair object shared by both bugs in `walk.pair` (mating pair has `phase`), touches of the last frame in `walk.touch`, eggs (egg keeps parents' tier `pT`), hatching, box capacity | `mate.js` | `interactEligible`, `loveStep`, `mateStep`, `pairEnd`, `mateCancel` |
| Breeding lab (sorting: first tap `Nam` A→Z, all others highest first; selection, offspring = parents' average, .5 random, 2 mutations, sum cap 50; NEW BUG! celebration: NEW TIER or 1–5 star confetti bursts, stars only when the child tier equals the higher parent tier and its sum beats the stronger parent; parent label (A)/(B); sort row and sorted list shared with Booker; breed cost = `tierRate`(higher parent tier) × (sum A + sum B) / 4, rounded, shown on both Breed buttons, not enough money = blocked-flash + toast) | `lab.js` | `breedCost`, `BREED_SORT`, `setLabSort`, `fillSort`, `sortedOwned`, `abLbl`, `computeOffspring`, `markMeta`, `parentTier`, `labFx` |
| Booker screen (modes, tier buttons 01–05 with T2–T5 locks, sort row, team picking, BOSS filter = bug of the chosen tier, FIGHT button shows the entry fee (Free when 0), money top-left, `#boo-tip` = warning (`BOO_TIP[0]`) on a fresh open, mode tip after a mode tap or when the mode is kept) | `boo.js` | `BOO_TIP`, `openBoo`, `setMode`, `setTier`, `teamMax`, `bossFit` |
| Fight AI, targeting, ability firing, target switch to weakest attacker, panic burst (flee angle inside the bug's quadrant from box centre, first half of the turn on the spot), flee food pull (max 30 deg), combat timers, damage number motion | `combatai.js` | `sysCombatAI`, `panicAll`, `tickTimers` |
| What is drawn each frame (food also in fight), bottom info line, red hit overlay, hit recoil 7 px and biter lunge 7/3 px, floating damage numbers (offset from the bitten bug's position), grey corpse fade, centred labels, call/noise rings | `render.js` | `drawHit`, `dmgPops`, `drawLabel`, `drawRing` |
| Hit-testing under the finger (obstacles by capsule), dragging, obstacle rotation by circling | `input.js` | `nearest`, `obstacleAt`, `draggableAt`, `dragStart`, `dragMove`, `endDrag` |
| Static DOM bindings, version tag, intro Pure/Dev choice, triple-tap panic, focus on corpses | `main.js` | `tapT` |
| Simulation loop, speed, box backdrop | `loop.js` | `tick(dt, fight)` = one simulation step, sole countdown of `actT` and `hitT`, `simLoop`, `drawBoxBackdrop` |
| Enemy generation (`genStats` by tier), bosses (stat sum `bossSum`, BOSS 2×, RB 3× 10 HP, WB 3× 50 HP, kept per tier, a boss whose sum differs from the clamped target is replaced at fight start), entry fee 2 × T × `tierRate`(T) per enemy (1v1 T1 free), paid at fight start and at each MC step (not enough money = blocked-flash + toast, no fight), prize (+$) = sum of `bugValue` of the beaten enemies × BOSS 2 / RB 3 / WB 3 (first number of `BOSS`), no prize on a loss, fight start (salute toast + freeze), result screen (enemy boss label, K(+kills this fight)/F, wins/started fights `res-cnt` in the bottom-right corner inside the result panel, from `run.wins` and `fightNum`), per-bug fight tally, MC break (food + NEXT), fight-end and stalemate check, fight end removes all fight entities | `fight.js` | `entryFee`, `startFight`, `buildEnemies`, `BOSS`, `bosses`, `wbKeep`, `weekOf`, `checkFightEnd`, `endFight`, `showFightResult`, `tallyFight` |
| Bug designer overlay, stat-linked morph sync, stat sliders 1–20 with sum cap 50 | `dz.js` | `dzSync` |
| Info / Morphology / Abilities texts | `wiki.js` | |
| Records screen (columns this run / all games, `Last loss` = `run.end`) | `records.js` | `renderRecords` |

### Naming rules
- `SCREAMING_SNAKE_CASE` — constants that never change.
- `camelCase` — variables and functions.
- **stats** = a single bug's `con str agi int per` and HP. Nothing else.
  Cross-game totals are **records**. One game's unlocks are **achievements**.
- ECS components: `bug pos vel walk team combat food obstacle`,
  read with `C.pos.get(entity)`, listed with `ecsQuery("bug","pos")`.
  `pos` = only `x y dir`. `walk` also holds stuck, drag and leg-animation state (`stride`, `top`, `dropStuck`), mating/love-bite pair `pair`, touches `touch`, love-bite prep `prepT prepMax` and hit flash `hitT`. The `bug` object holds no temporary timers. `vel` also holds speed `v`, last position `lx ly` and turn factor `tk`.
- **act** = what a bug does now, one timer: `walk.act` + `walk.actT`.
  Set only with `setAct`. Values: `thinking walking turning rushing waiting observing stalking flankTraining breeding fighting fleeing`.
  `fighting` and `fleeing` = movement driven by `combatai.js` (`aiAct`). Wall slide = `walk.slide`, not an act.
- Mating checks HP.
- Teams: `0` = player, `1` = enemy.

### Running it
Open `index.html`. All paths are relative, so it works from a local folder or from GitHub Pages with no build step. The `index.html` contains an on-screen crash reporter (red bar at the bottom). It prints missing files and JS errors (Android has no console).

### Tool files
- **tool-smoke-test** `.claude/tool-smoke-test.cjs` = smoke test: local files linked from `index.html` must exist, every backticked symbol in a routing table row (Area + Symbol columns, file names skipped) must exist in its file; external requests (Google Font) are stubbed so offline runs pass, then all scripts as one ES module (duplicate top-level names across files fail), then headless Chromium: market, box, info tabs, designer, lab, booker, 2v2 fight, leave.
- `.claude/settings.json` = 3 hooks: **hook-context-compress** (PreCompact: full-context reminder), **hook-oktk-start** (UserPromptSubmit, `tool-smoke-test.cjs --arm`: prompt oktk sets the token, any other prompt removes it), **hook-oktk-block** (PreToolUse on Skill, `tool-smoke-test.cjs --gate`: skill oktk needs the token).
- **skill-oktk** `.claude/skills/skill-oktk/SKILL.md` = end-of-session routine triggered by "oktk".
- **agent-skoukni-kod** `.claude/agents/agent-skoukni-kod.md` = read-only review subagent; run only when the user writes "skoukniKod" (Agent tool, `subagent_type: agent-skoukni-kod`).
`style.css` has few, very long lines — prefer `grep -o` with a short context over `grep -n`. The `.js` files are multi-line; `grep -n` is safe.

### Saved data
- `bugbox_records` in localStorage = cross-game **records** (games, kills, fights,
  wins, best bug count, best stat sum, top killer, longest dynasty). Persists. Reset button only.
- `bugbox_wb` in localStorage = World Bosses of the current week (lost HP kept until Sunday 23:59, killed WB is replaced). The only saved bugs.
- Tutorial, achievements (`achSt`) and `run` (this game's records) are **one game each**. Never persist them.
- `mated` resets for all bugs in `showFightResult` (completed fight). Leave skips it, except in Dev (`endFight`).
- Player bugs, money, eggs, BOSS and RB are never saved. Reloading the page starts a new game.
