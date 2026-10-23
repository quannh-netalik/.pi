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

# Pi tool usage

Pi-specific setup on this machine. Extends the harness tool rules above; policy and approvals live in `~/.pi/agent/AGENTS.md`.

## Navigation

- **CodeGraph** (projects with `.codegraph/`): use `codegraph_explore` first for implementation discovery, behavior, flow, callers, change impact, and architecture. Go straight to `grep`/`read` for literal strings, config keys, or a known file. Treat returned source as already read; check missing callers, DI wiring, string/event dispatch, tests, or stale references with `grep`/`read`.
- **Search:** `grep` for content, `find` for paths. Results are ranked and capped: page with `cursor` or refine before calling them complete. `0 exact matches. Maybe you meant this?` means not found; the hits below it are guesses. Zero exact matches establishes absence only within the completed search's scope. Any continuation cursor means the search is incomplete; continue before concluding absence.
- **Shell `rg`/`fd`:** only when the tools cannot meet the task's requirements: gitignored or unindexed paths like `node_modules` (the `grep` tool returns unrelated hits there, not an error), every match of a large result set, reliable absence checks the tools cannot complete, searches that noticeably block Pi, or unsupported flags (`rg -l/-c/-o/-v/-U`, `fd -t/-d`). Keep the scope narrow and use `rtk bypass rg` or `rtk bypass fd` to avoid RTK filtering.
- **Read:** inspect raw file contents with `read`, using bounded `offset`/`limit` for long files; never shell `cat`, `head`, `tail`, `sed -n`, or `awk NR`. Shell may show targeted computations (`wc -l`, `jaq '.scripts' package.json`, `git diff`) and filtered logs; these are not substitutes for raw file inspection. Filter streams with `rg`, not shell `grep`. Repo searches still follow Search rules.
- **One purpose per bash call:** do not tuck reads, listings, or searches into another command (`git status; cat package.json`); make separate tool calls, in parallel when independent. Dependent calls stay sequential.
- **List:** use the `ls` tool; shell `ls` only for metadata (`ls -la`) or unsupported options. Use `find` for recursive listings.
- **Documents:** `rga` for PDF, DOCX/ODT, EPUB, and archives. No XLSX/PPTX adapter is installed; use another suitable extractor. Report missing required extractors.
- **DeepWiki:** `read_wiki_structure`, then `ask_wiki_question` (≤10 repos); skip `read_wiki_contents` (large) unless the whole wiki is needed. Verify answers against source.

## Editing

- **Edits:** `edit` for existing files; `write` only for new files, never full rewrites of existing files unless the user supplies the replacement. No shell writes for manual source or config edits (`sed -i`, heredocs, `>`, inline `python`/`node`); generators, formatters, codemods, and capturing command output to temporary files are fine.
- **Bulk changes:** `sd` (`-F` literal, `-p` preview) or `ast-grep run -p '<pattern>' -r '<rewrite>' <paths>` (preview, then `-U`; not `sg`). Scope to relevant paths, then review the full patch, not `--stat`.
- **Review diffs:** `rtk bypass git diff -- <files>` for unstaged changes; `rtk bypass git diff --staged -- <files>` for staged changes. `read` new untracked files, since neither diff includes them.
- **Text & data:** `sd` for substitutions in files and streams, including ANSI stripping; `awk` only for fields; never `sed`. Use `jaq`, not `jq`, for JSON/YAML/TOML queries and conversion (`--from`/`--to`). Edit hand-written config with `edit`, not `jaq -i`, which reserializes content and can lose comments and formatting.
- **Scripts:** existing CLIs first; `bun` for ad-hoc logic; Python when the project needs it or it is materially simpler. Project scripts use the project's runtime.
- **Skill commands:** adapt inline examples by purpose: `read` for file inspection, `sd` for substitutions, `jaq` for structured queries, and `rg` for permitted searches or stream filtering. Preserve semantics. Bundled scripts need not be rewritten for tool preferences; their execution still follows AGENTS.md approval rules.

## Shell & routing

- **Blocking commands:** set `timeout` on every bash call. Never run dev servers, watchers, or interactive prompts (`git commit` without `-m`, `rebase --continue`) in the foreground; background with `> /tmp/x.log 2>&1 &`.
- **RTK:** a hook compresses supported bash command output. Use `rtk bypass <cmd>` for exact, unfiltered output, including review diffs and output fed into `jaq`/`rg`. Bypass does not remove bash output limits. Read saved output files in bounded pages; if RTK suggests `tail -n +N <log>`, use `read` at offset N. If no saved output exists, narrow or capture a safely repeatable command. Never rerun a side-effecting command merely to recover output.
- **Routing** (how-to lives in each skill):
  - Web: Moli skills; `bsk` only when the task needs the user's logged-in browser. If Moli fails, report it and use a read-only fallback; ask before any fallback needing more access, credentials, or external side effects.
  - Library docs: `ctx7` before using a library API not yet verified in this repo, after a major upgrade, or when a call fails unexpectedly; official docs as fallback.
  - Databases: DBX MCP via `mcp`. If unavailable, say so and ask before using `psql`/`mysql`/`redis-cli`/`mongosh`.
  - Jira/Confluence: `atlassian-cli` skill, not Atlassian MCP. HTTP: `yaak-cli` skill. GitHub: `gh`.
  - Reviews: PR or branch before merge → `requesting-code-review`, even if `ponytail-review` also matches; quick pass on a diff or commit → `ponytail-review`.
  - `dust` over `du`; `hyperfine` over `time` only for commands safe to repeat, or with state reset using `--prepare`.
- **Missing tool, skill, or MCP:** report it and use the safest alternative that needs no new approval. If none exists, explain the blocker and ask for the required approval.

## Delegates

- `acp_delegate` is the subagent tool: use it whenever a skill says to dispatch a subagent or names `subagent`/`pi-subagents`. Take a skill's no-subagent path only if `acp_delegate` is unavailable.
- Briefs: task, done criteria, out of scope, and whether it may write. Tell it to do the work itself, not return instructions or re-delegate.
- Results are leads: verify findings that affect your conclusion or changes against the cited source and relevant context.

</pi_tool_usage>
