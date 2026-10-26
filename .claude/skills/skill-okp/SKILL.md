---
name: skill-okp
description: End-of-session routine for bugBox. Use only when the user's whole message is "okp".
---

# okp – end of session

Run the steps in order. Stop and report if a step fails and cannot be fixed.

0. **Anything to push?** Run `git fetch origin main`. If `git status --porcelain` is empty and `git rev-list --count origin/main..HEAD` is `0`, write "Do main není co pushnout, smoke nespuštěn." and stop: skip all steps below.
1. **Smoke test.** Run `node .claude/tool-smoke-test.cjs` from the repo root. It may run only when the user writes okp. `SMOKE BLOCKED` means no okp was written: stop and report.
2. **Errors.** If it prints `SMOKE FAIL`, list each error in one line, fix the code, bump `GAME_VERSION` (core.js line 1, +1 minor) and rerun step 1. Repeat until `SMOKE OK`.
3. **File map.** Update the File map section of CLAUDE.md with the file and symbol changes collected during the session. Change nothing else in CLAUDE.md.
4. **Commit.** Stage only the files changed in this session (`git add <files>`, never `git add -A`). Message format = CLAUDE.md, section Workflow (first line `vX.Y: <main changes for the player>`, X.Y = current `GAME_VERSION`, blank line, the list of all changes of the session in English).
5. **Main.** Merge the session branch into main and push:
   `git fetch origin main`, `git checkout main`, `git merge --no-edit <session-branch>`, `git push -u origin main`.
   On a merge conflict, resolve it, rerun step 1, then push.
6. **Report.** Write `vX.Y` and https://mztcz.github.io/bugBox/ . Nothing else: no Pages delay note, no test artifact offer. Do not publish the test artifact.
7. **Session.** Do not delete the session branch (the proxy refuses it). Do not archive this session yourself: the final reply would be lost. Do not tell the user to archive it. Never create a new session; the user creates sessions manually.
Retry `git push` / `git fetch` up to 4 times on network errors (2 s, 4 s, 8 s, 16 s).
