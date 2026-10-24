---
name: skill-oktk
description: End-of-session routine for bugBox. Use only when the user's whole message is "oktk".
---

# oktk – end of session

Run the steps in order. Stop and report if a step fails and cannot be fixed.

0. **Anything to push?** Run `git fetch origin main`. If `git status --porcelain` is empty and `git rev-list --count origin/main..HEAD` is `0`, write "Do main není co pushnout, smoke nespuštěn." and stop: skip all steps below.
1. **Smoke test.** Run `node .claude/tool-smoke-test.cjs` from the repo root. It may run only when the user writes oktk. `SMOKE BLOCKED` means no oktk was written: stop and report.
2. **Errors.** If it prints `SMOKE FAIL`, list each error in one line, fix the code, bump `GAME_VERSION` (core.js line 1, +1 minor) and rerun step 1. Repeat until `SMOKE OK`.
3. **File map.** Update the File map section of CLAUDE.md with the file and symbol changes collected during the session. Change nothing else in CLAUDE.md.
4. **Commit.** Stage only the files changed in this session (`git add <files>`, never `git add -A`). Message format = CLAUDE.md, section Workflow (first line `vX.Y: <main changes for the player>`, X.Y = current `GAME_VERSION`, blank line, the session SUM).
5. **Main.** Merge the session branch into main and push:
   `git fetch origin main`, `git checkout main`, `git merge --no-edit <session-branch>`, `git push -u origin main`.
   On a merge conflict, resolve it, rerun step 1, then push.
6. **Report.** Write `vX.Y` and https://mztcz.github.io/bugBox/ . Add that GitHub Pages shows the new version with a delay (usually 1–2 minutes). Do not publish the test artifact. Offer to update it right away on request (URL in CLAUDE.md, section Workflow; only the changed .js/.css files) and give the extra cost: about 5 000 tokens + 300 tokens per 1 KB of changed files.
7. **Session.** Do not delete the session branch (the proxy refuses it). Do not archive this session yourself: the final reply would be lost. Tell the user to archive it in the app. Never create a new session; the user creates sessions manually.
Retry `git push` / `git fetch` up to 4 times on network errors (2 s, 4 s, 8 s, 16 s).
