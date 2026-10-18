---
name: oktk
description: End-of-session routine for bugBox. Use when the user writes "oktk" ("ok, tady končím") or asks to finish the session, push, or ship the current changes.
---

# oktk – end of session

Run the steps in order. Stop and report if a step fails and cannot be fixed.

1. **Smoke test.** Run `node .claude/smoke.cjs` from the repo root. Never run it outside oktk. It runs only after the user writes oktk (a UserPromptSubmit hook sets a token, `SMOKE OK` removes it); `SMOKE BLOCKED` means no oktk was written: stop and report.
2. **Errors.** If it prints `SMOKE FAIL`, list each error in one line, fix the code, bump `GAME_VERSION` (core.js line 1, +1 minor) and rerun step 1. Repeat until `SMOKE OK`.
3. **File map.** Update the File map section of CLAUDE.md with the file and symbol changes collected during the session. Change nothing else in CLAUDE.md.
4. **Commit.** Stage only the files changed in this session (`git add <files>`, never `git add -A`). Message is one English line: `vX.Y: <what changed>`, with X.Y = current `GAME_VERSION`.
5. **Artifact.** The test artifact URL is in CLAUDE.md (section Workflow).
   - Read it first (`Artifact` action `read` with that `url`).
   - Publish with `url` set, `file_path` = `index.html`, and `files` = only the .js/.css files changed in this session, mapped to themselves (e.g. `{"core.js": "core.js"}`). Unchanged files stay in the artifact.
   - A new game file is added the same way. Never publish `.claude/` files.
6. **Report.** Write `vX.Y` and the artifact URL.
7. **Main.** Merge the session branch into main and push:
   `git fetch origin main`, `git checkout main`, `git merge --no-edit <session-branch>`, `git push -u origin main`.
   On a merge conflict, resolve it, rerun step 1, then push. Then write https://mztcz.github.io/bugBox/
8. **Session.** Do not delete the session branch (the proxy refuses it). Do not archive this session yourself: the final reply would be lost. Tell the user to archive it in the app. Never create a new session; the user creates sessions manually.
Retry `git push` / `git fetch` up to 4 times on network errors (2 s, 4 s, 8 s, 16 s).
