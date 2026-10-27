// Keeps the caveman skill on for every session: injects caveman SKILL.md from the pinned git package
// once per session and again after compaction (same pattern as the i-have-adhd extension).
// "stop caveman" / "normal mode" turn it off for the session; "caveman mode" turns it back on.
// shortcut: if i-have-adhd handles "normal mode" first, this handler may not see it; say "stop caveman" too.

import { readFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent"

const SKILLS_DIR = join(homedir(), ".pi", "agent", "git", "github.com", "JuliusBrussee", "caveman", "skills")
const SKILL_PATH = join(SKILLS_DIR, "caveman", "SKILL.md")
const ULTRA_PATH = join(SKILLS_DIR, "ultracave", "SKILL.md")
const STATE_ENTRY = "caveman-bind-state"
const RULES_MSG = "caveman-bind-rules"
const OFF_MSG = "caveman-bind-disabled"
const OFF_PHRASES = new Set(["stop caveman", "normal mode"])
const ON_PHRASES = new Set(["caveman mode"])
const RULES_HEADER =
  `CAVEMAN MODE ACTIVE. The ruleset below applies to every response until turned off. "stop caveman" or "normal mode" turns it off for this session. On "/caveman ultra" or "ultracave", read and follow ${ULTRA_PATH}.`
const OFF_NOTICE =
  "CAVEMAN MODE OFF. Ignore the caveman ruleset injected earlier in this conversation."

type Marker = { role?: string; type?: string; customType?: string }

function loadRules(): string | undefined {
  try {
    return readFileSync(SKILL_PATH, "utf8").replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, "").trim() || undefined
  } catch {
    return undefined // skill not installed: extension stays inert
  }
}

// Newest marker wins; compaction drops old markers, so "not found" means re-inject.
function rulesInContext(ctx: ExtensionContext): boolean {
  let messages: readonly Marker[] = []
  try {
    messages = (ctx.sessionManager as any).buildSessionContext?.().messages ?? []
  } catch {}
  let active = false
  for (const m of messages) {
    if (m.role !== "custom" && m.type !== "custom_message") continue
    if (m.customType === RULES_MSG) active = true
    else if (m.customType === OFF_MSG) active = false
  }
  return active
}

function savedState(ctx: ExtensionContext): boolean | undefined {
  let state: boolean | undefined
  for (const e of ctx.sessionManager.getBranch()) {
    if (e.type === "custom" && e.customType === STATE_ENTRY && typeof (e.data as any)?.enabled === "boolean") {
      state = (e.data as any).enabled
    }
  }
  return state
}

export default function cavemanBind(pi: ExtensionAPI) {
  const rules = loadRules()
  if (!rules) return
  let enabled = true

  const sync = (ctx: ExtensionContext): void => {
    const injected = rulesInContext(ctx)
    if (enabled && !injected) {
      pi.sendMessage({ customType: RULES_MSG, content: `${RULES_HEADER}\n\n${rules}`, display: false }, { triggerTurn: false })
    } else if (!enabled && injected) {
      pi.sendMessage({ customType: OFF_MSG, content: OFF_NOTICE, display: false }, { triggerTurn: false })
    }
  }

  const restore = (ctx: ExtensionContext): void => {
    enabled = savedState(ctx) ?? true
    sync(ctx)
  }

  const setEnabled = (next: boolean, ctx: ExtensionContext): void => {
    enabled = next
    pi.appendEntry(STATE_ENTRY, { enabled })
    sync(ctx)
  }

  pi.on("input", async (event, ctx) => {
    const text = event.text.trim().toLowerCase()
    // short messages only: long pastes that quote "normal mode" must not flip the mode
    const says = (set: Set<string>) => text.length <= 40 && [...set].some((p) => text.includes(p))
    if (enabled && says(OFF_PHRASES)) setEnabled(false, ctx)
    else if (!enabled && says(ON_PHRASES)) setEnabled(true, ctx)
    return { action: "continue" } // model still sees the phrase and confirms in one line
  })
  pi.on("session_start", async (_e, ctx) => restore(ctx))
  pi.on("session_tree", async (_e, ctx) => restore(ctx))
  pi.on("session_compact", async (_e, ctx) => sync(ctx))
}
