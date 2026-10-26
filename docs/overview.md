# Overview

What lives where on a machine set up from this repo, and how the harnesses fit together.

## Layout

```
~/                              # <root>
|-- .config/                    # tool config outside Pi (not in this repo)
|   |-- herdr/                  # herdr: terminal workspace that runs agent sessions
|   |-- billion-context/        # context-compression proxy config
|   |-- atlassian-cli/          # Jira/Confluence profiles (credentials)
|   |-- context7/, gh/, git/    # CLI logins and git config
|-- .codex/                     # Codex harness state (not managed here)
|-- .pi/                        # THIS REPO
    |-- README.md
    |-- Brewfile                # Homebrew tools the agent rules depend on
    |-- docs/
    |   |-- overview.md         # this file
    |   |-- installation.md     # setup runbook for a new Mac
    |   |-- skill-evaluation.md # which skill-pack skills are worth installing
    |-- agent/                  # what Pi reads
        |-- AGENTS.md           # global rules: principles, workflow, tooling, git, safety
        |-- settings.json       # model, Pi packages, enabled tools
        |-- *.json              # per-package settings
        |-- extensions/         # local extensions (rtk.ts)
        |-- skills/             # local skills
        |-- auth.json, mcp.json, sessions/, npm/, git/ ...   # local only, gitignored
```

## How the harnesses work together

| Harness | Role | Config source |
|---|---|---|
| Pi | Primary coding agent | `~/.pi/agent` (this repo) |
| herdr | Runs and tracks agent sessions in panes; `herdr integration install pi` reports Pi's state to it | `~/.config/herdr` |
| Codex / Claude Code | Optional; can run `docs/installation.md` on a fresh Mac since they only need a shell | their own dirs, not synced |

Rule layering inside Pi, highest first:

1. `agent/AGENTS.md`: coding principles, workflow, tooling, git, safety and approvals, communication. One file; the Safety section outranks everything below.
2. Project `AGENTS.md`: project conventions and tool preferences (never relaxes safety).
3. Skills and style packs (mattpocock/skills, ponytail). See [skill-evaluation.md](skill-evaluation.md) for which skills earn their place.

## Working with it

- Change config: edit files under `~/.pi`, run `gitleaks git --staged --no-banner --redact`, commit, push.
- Other machine: `git -C ~/.pi pull --rebase`, then the follow-ups in [installation.md](installation.md#sync-between-machines).
- New file to sync: add a `!/path` line to `.gitignore` (allowlist).
