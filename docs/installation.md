# Pi setup from scratch

Runbook for rebuilding this Pi config on a new Mac (Apple Silicon, zsh). The repo root is `~/.pi`; Pi reads `~/.pi/agent`.

## For humans

1. Install Pi: `curl -fsSL https://pi.dev/install.sh | sh`, open a new terminal, run `pi`.
2. Run `/login` and pick a provider.
3. Paste this prompt:

   ```
   Install my Pi setup by following https://raw.githubusercontent.com/quannh-netalik/.pi/master/docs/installation.md
   I approve the installs and shell-startup edits it lists. Ask before anything else.
   ```

The agent does the rest. It stops for the few steps that need you (your password for Homebrew, app logins) and lists them at the end. Any coding agent (Claude Code, Codex) works too; it just needs a shell.

## For agents

You are setting up this Pi config on the human's Mac. Fetch this file with `curl -fsSL <url>` if you don't have it locally yet; once step 2 is done, read `~/.pi/docs/installation.md` instead.

Rules for the agent running this:

- The kickoff prompt approves only what this file lists. Ask before any other install, commit, or push.
- Every step is idempotent: check first (`command -v`, `brew list`, `pi list`), skip what already exists.
- Never read `~/.pi/agent/auth.json`, `mcp-auth.json`, `mcp.json`, or `.env*` files.
- Track the steps with your todo tool. At the end, report what you installed, what you skipped, and every human step still open.

### 1. Preflight

```bash
uname -m                     # expect arm64
brew --version
```

If `brew` is missing, stop and ask the human to run this in a Terminal (it needs their password, and it also installs `git`), then continue:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then load it into your shell: `eval "$(/opt/homebrew/bin/brew shellenv)"`.

### 2. Put this repo in `~/.pi`

The Pi installer already created `~/.pi`, so check it out in place. Files the checkout would overwrite are copied to `~/.pi-backup/` first; untracked files like `agent/auth.json` stay.

```bash
cd ~/.pi
if [ ! -d .git ]; then
  git init -q -b master
  git remote add origin https://github.com/quannh-netalik/.pi.git
  git fetch -q origin master
  git ls-tree -r --name-only origin/master | while IFS= read -r f; do
    if [ -e "$f" ]; then mkdir -p "$HOME/.pi-backup/$(dirname "$f")" && cp -p "$f" "$HOME/.pi-backup/$f"; fi
  done
  git checkout -q -f -B master --track origin/master
fi
git status --short             # expect no output
```

### 3. Homebrew packages

```bash
brew bundle --file ~/.pi/Brewfile
```

If a cask fails with `It seems there is already an App at '/Applications/<App>.app'`, the app was installed by hand. It is already there: skip it and report it. The human can hand it to Homebrew later with `brew install --cask --adopt <cask>`. Formulae already installed by Homebrew are upgraded, not reinstalled.

### 4. Runtimes

- **Node 24 via [fnm](https://github.com/Schniz/fnm)** (Pi extensions and npm CLIs run on it). `fnm` comes from the Brewfile. Add the shell hook to `~/.zshrc` if it is not there yet, then install Node:
  ```bash
  grep -q 'fnm env' ~/.zshrc || echo 'eval "$(fnm env --use-on-cd --shell zsh)"' >> ~/.zshrc
  eval "$(fnm env --use-on-cd --shell zsh)"
  fnm install 24 && fnm default 24
  node --version             # expect v24.x
  ```
- **Bun** (ad-hoc scripts; edits `~/.zshrc`):
  ```bash
  command -v bun >/dev/null || curl -fsSL https://bun.sh/install | bash
  ```
- `uv` comes from the Brewfile.

### 5. Global CLIs

```bash
npm install -g ctx7 @yaakapp/cli @colbymchenry/codegraph
[ -x ~/.dbx/bin/dbx-mcp ] || npm install -g @dbx-app/mcp-server
curl --proto '=https' --tlsv1.2 -fsSL https://github.com/lexmount/moli/releases/latest/download/moli-installer.sh | sh
```

- `ctx7`: context7-cli skill. `yaak`: yaak-cli skill (the Yaak desktop app comes from the Brewfile cask). `codegraph`: required by `@henryqw/pi-codegraph`. DBX MCP server: either `~/.dbx/bin/dbx-mcp` (installed from the DBX app) or the npm `dbx-mcp-server`; npm is only installed when the app binary is missing. `moli`: moli-* skills (installs to `~/.local/bin`).
- `bsk` (browser-skill): follow <https://github.com/Tencent/BrowserSkill/blob/main/AGENT_INSTALL.md> for the CLI only. The browser extension is a human step (see Human steps after setup).

### 6. Pi packages

Packages are declared in `agent/settings.json` (`packages`). Install them:

```bash
pi update --extensions
pi list                      # must match settings.json "packages"
```

### 7. Integrations

```bash
herdr integration install pi   # writes agent/extensions/herdr-agent-state.ts (gitignored)
rtk --version                  # agent/extensions/rtk.ts needs >= 0.23.0
```

Set ponytail's default level to `ultra` (config lives outside this repo):

```bash
mkdir -p ~/.config/ponytail
[ -f ~/.config/ponytail/config.json ] || printf '{\n  "defaultMode": "ultra"\n}\n' > ~/.config/ponytail/config.json
rtk bypass cat ~/.config/ponytail/config.json   # expect "defaultMode": "ultra"
```

### 8. MCP servers

Pi's built-in MCP serves the tools. It reads `~/.pi/agent/mcp.json`, which is not in git (it can hold tokens). `pi mcp add` replaces an existing entry, so only add the server if it is missing:

```bash
pi mcp list --json > /tmp/pi-mcp.json
if ! rg -q '"dbx"' /tmp/pi-mcp.json; then
  if [ -x ~/.dbx/bin/dbx-mcp ]; then pi mcp add dbx -- ~/.dbx/bin/dbx-mcp
  else pi mcp add dbx -- dbx-mcp-server; fi
fi
pi mcp list
```

It should show `connected` with `codemode` exposure. `dbx` reads its connections from the DBX app. It lists no databases until the human adds connections there.

### 9. Verify

```bash
for t in pi fnm node npm bun uv gh rtk herdr sd jaq ast-grep fd hyperfine gitleaks rga atlassian-cli ctx7 yaak codegraph moli bsk; do
  printf '%-14s %s\n' "$t" "$(command -v "$t" || echo MISSING)"
done
pi mcp list                    # dbx: connected
```

Then tell the human to restart `pi`, run `/login` again if the provider they want is missing, and check the startup output for `[rtk] ... extension disabled` or codegraph `prerequisites missing`. Finish by listing the human steps below.

## Human steps after setup (interactive, the agent hands these over)

1. GitHub (only to push changes back or use `gh`): `gh auth login`.
2. DBX: open DBX.app, add your database connections, then set the allowlist and access mode in **Settings → MCP** (Read only is the safe default).
3. BrowserSkill: install the browser extension and pair it (`bsk doctor` shows status).
4. Jira/Confluence (optional, only if a project uses them): `atlassian-cli auth login`, one profile per site. Put each project's site, profile, and project keys in that project's `AGENTS.md`, not in this repo.
5. Context7 and Yaak: log in if a skill asks (`ctx7 --help`, `yaak --help`).
6. herdr: launch with `herdr` once.

## Sync between machines

- **Pull:** `git -C ~/.pi pull --rebase`. Then:
  - `settings.json` packages changed: `pi update --extensions`
  - `Brewfile` changed: `brew bundle --file ~/.pi/Brewfile`
- **Push:** commit as usual. Run `gitleaks git --staged --no-banner --redact` first.
- **Track a new file:** `.gitignore` is an allowlist. Add a `!/agent/<file>` line.

### Not synced, on purpose

| Path | Why |
|---|---|
| `agent/auth.json`, `agent/mcp.json`, `agent/mcp-auth.json` | credentials, tokens (`mcp-auth.json` holds MCP OAuth sign-ins) |
| `agent/sessions/` | private chat history, large |
| `agent/npm/`, `agent/git/`, `agent/install/`, `agent/bin/` | regenerated by Pi and its installer |
| `agent/models-store.json`, `agent/mcp.log*`, `agent/fff/` | caches and per-machine state |
| `*.log`, `.DS_Store`, `*.lock` | noise |
