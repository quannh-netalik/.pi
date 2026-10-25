---
name: atlassian-cli
description: >
  Use the atlassian-cli CLI for Jira and Confluence (also Bitbucket, JSM).
  Activate when the user mentions Jira, Confluence, Atlassian, an issue key like
  ABC-123, JQL or CQL, tickets, sprints, epics, boards, backlog, a wiki, space or
  page, or an *.atlassian.net link; or asks things like "my tickets", "what's
  assigned to me", "find the doc about X", "comment on / move / create a ticket",
  or "update the Confluence page". Replaces the old Atlassian MCP server.
---

# Use atlassian-cli

<!--
  Written for atlassian-cli 0.12.0 (https://github.com/omar16100/atlassian-cli). Verified 2026-10-21.
  Installed via `brew install omar16100/atlassian-cli/atlassian-cli`.
  Refresh manually after CLI upgrades.
-->

One binary for Jira, Confluence, Bitbucket (`bb`), JSM, Opsgenie, Bamboo.
Not every project uses Atlassian. Use the site, profile, and project keys the
current project's `AGENTS.md` (or docs) names; if it names none, run
`atlassian-cli auth list` and ask which profile to use. Credentials live in the
OS keychain / `~/.config/atlassian-cli`; never read, print, or pass tokens.

## The CLI describes itself

Do not guess subcommands or flags. Ask:

```bash
atlassian-cli --help
atlassian-cli jira --help            # issue, project, fields, bulk, api, ...
atlassian-cli jira issue --help      # search, get, create, update, transition, comments, ...
atlassian-cli confluence --help      # space, page, folder, blog, search, api, ...
atlassian-cli <svc> <cmd> <sub> --help
```

## Output

- Use `-f json` and pipe to `jq` for anything you parse. Default `table` is for humans.
- `-f markdown` for readable page bodies / issue views.
- `--envelope` wraps lists as `{"data": [...], "count": N}`.
- `--debug` logs requests/responses to stderr (no credentials) when a call fails.
- `-p <profile>` selects another site; `atlassian-cli auth list` shows profiles.

## Reads (run freely)

```bash
# Jira
atlassian-cli jira issue search --assignee @me --status "In Progress" -f json
atlassian-cli jira issue search --jql 'project = PROJ AND status != Done ORDER BY updated DESC' --limit 20 -f json
atlassian-cli jira issue get ABC-123 -f markdown
atlassian-cli jira issue get ABC-123 --fields summary,status,assignee -f json
atlassian-cli jira issue comments list ABC-123 -f json
atlassian-cli jira issue transitions ABC-123        # what moves are allowed now
atlassian-cli jira fields list -f json              # custom field ids/names

# Confluence
atlassian-cli confluence search text "onboarding guide" -f json
atlassian-cli confluence search cql 'space = MFS AND type = page AND title ~ "release"' --limit 20 -f json
atlassian-cli confluence space list -f json
atlassian-cli confluence page get <PAGE_ID> --body-only -f markdown   # reading only: lossy, drops macros
atlassian-cli confluence page get <PAGE_ID> --body-only               # raw storage XHTML: use this to edit
atlassian-cli confluence page list --help           # filter by space etc.
```

Useful queries (`@me` works only in filter flags; inside `--jql` use `currentUser()`):

```
assignee = currentUser() AND statusCategory != Done ORDER BY updated DESC
project = FS AND sprint in openSprints()
parent = ABC-123                                  # children of an epic
updated >= -7d AND assignee = currentUser()
text ~ "login" AND project = SHF
# CQL
type = page AND space = MFS AND lastmodified > now("-14d") ORDER BY lastmodified DESC
ancestor = <PAGE_ID>                              # all pages under a page
```

Page URLs look like `.../wiki/spaces/<KEY>/pages/<PAGE_ID>/<slug>`: take the
numeric `<PAGE_ID>` from the URL.

Raw REST fallback when no subcommand fits (GET is a read; `-d` without `-X` sends POST, a write):

```bash
atlassian-cli jira api /rest/api/3/myself
atlassian-cli jira api /rest/api/3/search/jql --query 'jql=project = ABC' --query maxResults=5
atlassian-cli confluence api --help
```

## Writes (explicit approval required)

Jira/Confluence edits are external side effects. Before ANY create, update,
comment, transition, assign, label, delete, bulk, or non-GET `api` call:

1. Show the exact command and what will change (issue key / page id, fields, body).
2. Wait for the user's explicit OK. Approval covers only that change.
3. Prefer `--dry-run` where offered (`jira issue transition`, `jira|confluence api`, `jira|confluence bulk`) and show its output first.
   `transition --to-status` can walk several transitions (up to `--max-hops`, default 10):
   always dry-run it and show every hop before asking.
4. After running, show the result (key, URL, new status).

```bash
# --description / comment --body take inline Markdown (converted to ADF); raw HTML stays literal text
atlassian-cli jira issue create --project PROJ --issue-type Task --summary "..." --description "..."
atlassian-cli jira issue update ABC-123 --help      # check flags first
atlassian-cli jira issue comments add ABC-123 --body "..."
atlassian-cli jira issue transition ABC-123 --to-status "In Progress" --dry-run
atlassian-cli jira issue assign ABC-123 --help
atlassian-cli jira api /rest/api/3/issue/ABC-1 -X PUT -d @payload.json --dry-run
```

Confluence page create/update:

- `--body` is a FILE path in HTML **storage format**, not inline text and not
  Markdown. Write it to a temp file (`f=$(mktemp -t page)`) and delete it
  afterwards. For macros, panels, links, mentions: read
  [Storage format](references/confluence-storage-format.md).
- `page create --space` takes the numeric space **ID**, not the key:
  `atlassian-cli confluence space get MFS -f json | jq -r '.results[0].id'`.
- To edit an existing page: fetch the storage body (`page get <ID> --body-only > "$f"`,
  never via `-f markdown`), change only what was asked, and pass `--message "<why>"`.
  `update` does not detect concurrent edits: re-check `.version.number`
  (`page get <ID> -f json`) right before updating; if it changed, re-fetch.

```bash
atlassian-cli confluence page create --space <SPACE_ID> --title "..." --body "$f" --parent <PAGE_ID>
atlassian-cli confluence page update <PAGE_ID> --body "$f" --message "..."
```

Deletes (`jira issue delete`, `page delete`, `api -X DELETE --force`) are
irreversible from the agent's side: confirm separately, even if a related
change was already approved. `--force` skips the CLI's own prompt, so the
user's confirmation is the only safeguard.

## Gotchas

- Transition names are workflow-specific; use `--to-status` or check `transitions` first.
- `--assignee` needs an account ID; email does not work despite the help text. Look it up:
  `jira api /rest/api/3/user/search --query query=<email>` (self: `/rest/api/3/myself`).
- `--limit` defaults to 25; `--limit 0` fetches every result.
- Team-managed projects have no Epic Link field. Link epics with
  `--field 'parent={"key":"ABC-12"}'`. Add to a sprint with `--sprint <numeric id>`
  (find ids: `jira api /rest/agile/1.0/board/<BOARD_ID>/sprint --query state=active`).
- `--fields` on `issue get`/`search` replaces the default columns.
- Custom fields: find ids with `jira fields list`, set with `--field 'customfield_NNNNN={"value":"X"}'`
  (shape depends on field type).
- A non-2xx `api` response still prints the body and exits 1.
- Warnings (e.g. "more match this query. Raise --limit, or use --limit 0") go to
  stderr: don't merge `2>&1` when piping JSON to `jq`.

## Read details only when needed

Paths are relative to this skill's directory. Do not preload.

| When | Read |
| --- | --- |
| Writing or editing a Confluence page body (code, panels, tables, links, mentions, status, TOC, expand, Jira macro) | [Storage format](references/confluence-storage-format.md) |
