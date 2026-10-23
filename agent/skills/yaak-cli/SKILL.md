---
name: yaak-cli
description: >
  Use the yaak CLI as HTTP client. Activate when the user mentions Yaak, a Yaak
  workspace, or the `yaak` command, or asks to call, hit, or smoke test
  HTTP/REST endpoints, save or organize API requests for reuse or manual
  testing, configure auth on saved requests, import an OpenAPI spec, a Postman,
  Insomnia, or Bruno collection, or a cURL command, or run saved requests across
  environments. Prefer over one-off `curl` when requests should be saved,
  reused, shared, or run as a set.
---

# Use Yaak

<!--
  Based on the official skill from `yaak agent install` (yaak-cli-version: 2026.9.0),
  plus local Safety rules. Not managed by the CLI: refresh manually after CLI upgrades.
-->

Yaak is a desktop API client. The `yaak` CLI reads and writes the **same local
database as the desktop app**, so anything you create shows up in the app
immediately, and vice versa. There is no server and no sign-in: `yaak auth` is
only for publishing plugins to the Yaak registry.

Requests you create are permanent user data in an app the user uses, not
scratch files: name them the way the user would and clean up anything created
just to test. The CLI is the right place to build, organize, and run requests.

## The CLI describes itself

Do not guess fields, body types, auth strategies, or template functions. The
CLI version and installed plugins decide what exists. Ask the CLI:

```bash
yaak --help                          # commands, plus agent hints at the bottom
yaak <command> --help                # flags for one command
yaak request schema http --pretty    # full request model, with guidance per field
yaak template-function list [filter] # template functions from installed plugins
yaak template-function show <name>   # one function's arguments
```

`request schema http` is generated from the real model and merges in auth
strategies contributed by plugins, so it is authoritative for request payloads.
`workspace`, `environment`, and `folder` have `schema` subcommands too.

Template syntax: `${[ my_var ]}` (not `{{ }}`); functions:
`${[ namespace.fn(a='aaa', b='bbb') ]}`.

## Resource model

- **Workspace** (`wk_…`): top-level container.
- **Folder** (`fl_…`): groups requests, can nest. Carries headers and auth that
  child requests inherit (usual way to apply one token to a group).
- **Request** (`rq_…`): HTTP, gRPC, or WebSocket. CLI can only create and send HTTP.
- **Environment** (`ev_…`): variables. Base environment plus sub-environments;
  a sub-environment overrides base vars of the same name, chosen per send with `-e`.
- **Cookie jar** (`cj_…`): cookies per workspace. Oldest used by default.

IDs are prefix-typed. Commands taking a workspace ID infer it when exactly one
workspace exists.

## Getting oriented

```bash
yaak --version
yaak workspace list
yaak request list <wk_id>
yaak request show <rq_id>
```

If `yaak` is missing, ask before installing (`npm install -g @yaakapp/cli` is a
global install). Pick the workspace matching the user's project before changing
anything; create one only when nothing fits.

## Core workflows

**Start from a spec when one exists.** `yaak import <path>` auto-detects
OpenAPI, Swagger, Postman, Insomnia, Bruno (file, ZIP, or directory), cURL, and
Yaak exports. `--workspace-id <wk_id>` imports into an existing workspace.

**Make the host swappable.** Put the base URL in a base-environment variable,
reference it as `${[ base_url ]}`, add a sub-environment per target. Then
`yaak -e ev_staging send <wk_id>` runs everything against staging.

**Chain instead of shell-plumbing.** A request can read another's response;
Yaak sends the dependency first if needed:

```
${[ response.body.path(request='rq_login', path='$.token') ]}
```

See `yaak template-function show response.body.path` for args (incl. when the
upstream request re-sends). To merely run in order, `yaak send <fl_id>` does that.

**Run a set.** `yaak send <rq_id|fl_id|wk_id>` with `--fail-fast` and
`--parallel`. IDs survive export/import, so a committed `yaak export <file>`
plus `--data-dir ./.yaak` gives a runnable suite in CI.

## Reading results

A plain send writes only the response body to stdout. Every response is
stored; inspect afterwards instead of parsing send output:

```bash
yaak response show <rq_id>             # latest response: status, timing, headers, final URL, error
yaak response list <rq_id> --limit 5   # history, newest first
yaak response body <rq_id>             # body only
```

Pass a response ID for a specific one. `-v` on send prints events prefixed
`*`, `>`, `<`, body after the last `<` line:

```bash
yaak -v request send <rq_id> 2>&1 | rg '^< HTTP'
```

**Exit codes:** 1 = send did not complete (unresolved variable, unreachable
host, TLS failure). **HTTP error statuses are not failures**: 404/500 exit 0,
and a folder whose requests all return 500 reports success. Never call an API
healthy from a clean exit; check the status.

## Execution rules

1. Resolve the workspace before mutating; prefer an existing one.
2. Read the schema rather than guessing field names, auth fields, or body shapes.
3. Create: `yaak request create <wk_id> -n <name> -m <method> -u <url>` or `--json '{...}'`.
4. `update` takes a JSON merge patch keyed by `id`: send only what changes.
   Arrays are replaced wholesale, not merged.
5. Never write a real secret into an environment variable. Reference one and let
   the user fill in the value.
6. Verify what you built by sending it (subject to Safety) and report the real HTTP status.
7. When the CLI and this skill disagree, the CLI is right. If stderr reports a
   newer version, tell the user; upgrading is a global install and needs approval.

## Safety

- Sends with external side effects (non-GET, or batch `send` of a folder/workspace
  to external services) need explicit approval per global Safety rules. GET to
  localhost/test targets is fine.
- Deletes (`yaak <resource> delete`, `yaak response delete`) need user
  confirmation first, then `--yes` in non-interactive shells.
- Do not run `yaak agent install`: it writes skills outside `~/.pi`.
