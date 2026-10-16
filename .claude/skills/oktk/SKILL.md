---
name: oktk
description: End-of-session routine for bugBox. Use when the user writes "oktk" ("ok, tady končím") or asks to finish the session, push, or ship the current changes.
---

# oktk – end of session

Run the steps in order. Stop and report if a step fails and cannot be fixed.

1. **Smoke test.** Run `node .claude/smoke.cjs` from the repo root.
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
   The PreToolUse hook reruns the smoke test before every `git push` and blocks it on failure. On a merge conflict, resolve it, rerun step 1, then push. Then write https://mztcz.github.io/bugBox/
8. **Branch.** Delete the merged session branch on GitHub: `git push origin --delete <session-branch>`. Do not archive this session yourself: the final reply would be lost. Tell the user to archive it in the app.
9. **New session.** Create one with the `create_session` tool (claude-code-remote; load it with ToolSearch if needed): `source_url` = `https://github.com/mztcz/bugBox`, `source_revision` = `main`, `title` = `bugBox vX.Y`, no `prompt`. Report its title and id.

Retry `git push` / `git fetch` up to 4 times on network errors (2 s, 4 s, 8 s, 16 s).
