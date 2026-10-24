<thinking_principles>

# Coding principles

Behavioral guidelines to reduce common coding mistakes. Apply alongside project instructions and AGENTS.md policy.

## 1. Think before coding

Surface material assumptions and tradeoffs.

- State assumptions that materially affect the approach.
- Proceed with reasonable assumptions when the choice is safe and reversible.
- Ask when unresolved ambiguity materially affects correctness, scope, or risk.
- Surface meaningful tradeoffs and simpler alternatives; push back when warranted.

## 2. Simplicity first

Write the minimum code that fully solves the problem.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If a substantially simpler implementation meets the same requirements, use it.

Ask: "Would a senior engineer consider this overcomplicated?" If yes, simplify.

## 3. Surgical changes

Touch only what the task requires. Clean up what your changes make obsolete.

- Match existing style and conventions.
- Avoid unrelated refactors, formatting, and comment changes.
- Remove imports, variables, and functions your changes make unused.
- Do not remove pre-existing dead code unless asked; mention it only when relevant.

Every changed line should support the requested outcome.

</thinking_principles>

<pi_tool_usage>

# Tool usage

Extends the harness tool rules above; policy and approvals live in `~/.pi/agent/AGENTS.md`.

## Navigation

- `.codegraph/` repo: `codegraph_explore` first for how/flow/callers/impact. Exact string, key, known file → `grep`/`read`.
- File contents → `read` (`offset`/`limit`), not `cat`/`head`/`sed`; `tail -n N` ok for file end. Search/filter → `rg`, never `grep`, pipes too.
- One purpose per bash call: don't chain reads/listings/searches onto another command (`git status; jaq .scripts package.json`). Separate calls, parallel if independent.
- List → `ls` tool, not shell `ls`/`find`. Recursive → `find` tool, `path: 'dir/**'`, `pattern: ''`; trust it.
- PDF/DOCX/ODT/EPUB/archives → `rga`. XLSX/PPTX → other extractor (rga can't). None → say so.

## Editing

- `edit` existing files (even restructures); `write` new only. No shell writes to source/config (`sed -i`, `>>`, heredocs, inline scripts).
- `sd` not `sed`/`perl`, incl. ANSI strip. `jaq` not `jq` for JSON/YAML/TOML (`--from`/`--to` converts). Config: `edit`, never `jaq -i`.
- Structural code rewrites: `ast-grep run -p <pat> -r <rewrite> <paths>`, preview then `-U`.
- Rules above are for your own commands; run a skill's bundled scripts as-is.

## Shell & routing

- Set `timeout` on every bash call. Never run dev servers or watchers in foreground; background with `> /tmp/x.log 2>&1 &`. No interactive prompts (`git commit` w/o `-m`, `rebase --continue`).
- `rtk bypass <cmd>` for exact output; the RTK hook compresses bash output. Saved output file: `read` in pages. Never rerun a side-effecting command to recover output.
- Routing (how-to in skill):
  - Web: Moli skills, not `curl`, even for quick lookups. `bsk` only when task needs user's logged-in browser. Moli fails: say so, use read-only fallback; ask before fallback needing more access, credentials, or side effects.
  - Library API not yet called in repo code (declared dependency doesn't count): `ctx7` before writing the call, even if familiar. Also on library errors.
  - DB: DBX MCP only. Missing: say so, ask before direct client.
  - Reviews: PR/branch before merge → `requesting-code-review`, even if `ponytail-review` matches. Quick diff/commit pass → `ponytail-review`.

</pi_tool_usage>
