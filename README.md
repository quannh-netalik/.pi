# pi-config

My [Pi](https://pi.dev) coding-agent config, synced between Macs.

## New machine

Follow [SETUP.md](SETUP.md). Short version:

1. `curl -fsSL https://pi.dev/install.sh | sh`, then run `pi` and `/login`
2. Tell the agent: "Install my Pi setup by following https://raw.githubusercontent.com/quannh-netalik/.pi/main/SETUP.md. I approve the installs and shell-startup edits it lists. Ask before anything else."

## What's in here

| Path | What |
|---|---|
| `agent/AGENTS.md` | Global agent rules: workflow, git, safety and approvals |
| `agent/APPEND_SYSTEM.md` | Tool usage rules and coding principles appended to the system prompt |
| `agent/settings.json` | Pi settings: default model, Pi packages, enabled tools |
| `agent/extensions/` | Local extensions (`rtk.ts` compresses bash output) |
| `agent/skills/` | Local skills: atlassian-cli, browser-skill, context7-cli, moli-*, yaak-cli |
| `agent/*.json` | Settings for individual packages (i-have-adhd, pi-fff, pi-atelier) |
| `Brewfile` | Homebrew tools the agent rules depend on |
| `SETUP.md` | Step-by-step setup runbook, written for an agent to run |

## Daily sync

```bash
git -C ~/.pi pull --rebase
pi update --extensions                 # if settings.json packages changed
brew bundle --file ~/.pi/Brewfile      # if Brewfile changed
```

Before pushing: `gitleaks git --staged --no-banner --redact`.

`.gitignore` is an allowlist: new files stay untracked until you add a `!/path` line. Credentials, sessions, caches and downloaded packages are never synced. See the table at the end of [SETUP.md](SETUP.md#not-synced-on-purpose).
