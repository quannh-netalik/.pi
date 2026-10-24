# Skill evaluation

Which skills from the three skill packs are worth installing in this Pi setup, based on test runs in October 2026.

Status: **2 recommended, 12 optional, 45 drop** out of 59 skills. Not yet applied to `agent/settings.json`.

## Sources

| Short | Pack | Skills |
|---|---|---|
| SP | [obra/superpowers](https://github.com/obra/superpowers/tree/main/skills) | 15 |
| MP | [mattpocock/skills](https://github.com/mattpocock/skills) | 38 |
| PT | [ponytail](https://www.npmjs.com/package/@dietrichgebert/ponytail) (`npm:@dietrichgebert/ponytail`) | 6 |

## How it was tested

- **Arms:** each test ran the same task with the skill (`/skill:<name>` or loaded by itself) and without it. Rival skills from other packs ran on the same task, head to head.
- **Models:** round 1–3 used opus-5-5, opus-5, fable-5-1 and sonnet-5-5. Round 4 used sonnet-5-5 and opus-5-5, 4 runs per arm.
- **Fixtures:** small repos with planted bugs, hidden tests, review decoys, and a simulated user for interview-style skills.
- **Scoring:** blind auditors (opus-5-5) scored results only, 0–10, without seeing which arm produced them. Round 3 scores were re-checked by 4 reviewers. Their findings (rubrics that copied skill doctrine, unfair prompts, a scoring error) were corrected before the verdicts below.
- **Columns:** Δ is the change in score vs no skill, on a 10-point scale. Cost is relative to no skill. "Only when typed" means the skill has `disable-model-invocation` or never loads by itself, so it costs nothing until you type it.

| Round | What | Runs | Run cost |
|---|---|---|---|
| 1 | Ponytail ultra mode on vs off, 7 tasks | 112 | $21 |
| 2 | 13 installed SP/MP skills, one test each | 310 | $71 |
| 3 | 11 more tests for uninstalled skills, plus reading the other 28 skills | 192 | $95 |
| 4 | Superpowers re-test with harder tasks, head to head with MP and PT | 170 | $55 |

## Recommended (2)

| Skill | Src | Effectiveness | Cost | Why |
|---|---|---|---|---|
| `ponytail-review` | PT | +2.4. Found the planted qty bug in 16/16 runs vs 2/16 without. In round 4 it found all 4 planted bugs and matched every other reviewer | 0.75× (cheapest reviewer) | Best reviewer at the lowest cost |
| `grilling` | MP | +1.6 in round 3, loaded by itself 8/8. On a vague idea: 10 vs 4 | 1.4× when used | Asks you questions before building. Type "grill me" for vague ideas; it didn't start by itself there |

## Optional (12): weak or untested, but low risk

Most run only when you type them.

| Skill | Src | Effectiveness | Cost | Why optional |
|---|---|---|---|---|
| `domain-modeling` | MP | −0.4 by itself | Loads by itself, small | Required by `grill-with-docs`; install only with it |
| `grill-with-docs` | MP | +0.4 | Only when typed | Grilling plus a glossary and design records; small gain |
| `to-questionnaire` | MP | Strongest round 3 win, but the test was unfair. Round 4 vague idea: 7 vs 4 | Only when typed, 1.0× | Asks before writing; the real effect is smaller than measured |
| `improve-codebase-architecture` | MP | About +2.3 out of 8 | Only when typed, 2.6× | Real gain, but medium-low confidence |
| `codebase-design` | MP | Not tested alone | Loads by itself | Required by the one above |
| `prototype` | MP | About +0.9, on 2 of 4 models | 2.9× | Weak; install a copy with `disable-model-invocation: true` so it runs only when typed |
| `writing-for-agents` | MP | About +0.5. Round 4: tie, 1.1× | Loads by itself, cheap | Small gain for writing skills and `AGENTS.md` |
| `handoff` | MP | +0.2–0.8; a run without it continued just as well | Only when typed | Harmless, unproven |
| `wait-what` | MP | About +0.7 on facts | Only when typed | Harmless, unproven |
| `ponytail-audit` | PT | +1.2 on its own job, but the gain rests on disputed findings | Only when typed | Useful for whole-repo audits |
| `ponytail-debt` | PT | Wins on its own job, 6/6 vs 4/6 | Only when typed | Only 1 file in use has its markers |
| `retro` | MP | Never run | Only when typed | Read-only check looked good; trims bloated `AGENTS.md` |

## Drop: tested, no gain (20)

| Skill | Src | Effectiveness | Cost | Why drop |
|---|---|---|---|---|
| `systematic-debugging` | SP | Tie (10 vs 10), rounds 3 and 4 | 1.0× / 1.5× time | The `AGENTS.md` bug rule already does this |
| `diagnosing-bugs` | MP | Tie | 1.2× | Same |
| `test-driven-development` | SP | Tie; never loads by itself (0/8) | 1.3× | Typing "test-first" does the same |
| `tdd` | MP | Tie | 1.3× / 1.6× time | Same |
| `verification-before-completion` | SP | +0.25 in round 4, +0.75 in round 3 | 1.1× | Too small to matter |
| `receiving-code-review` | SP | Tie (10 vs 10) | 1.0× | Models already push back on wrong comments |
| `requesting-code-review` | SP | Tie | 1.1×, 2.3× time in round 3 | `ponytail-review` is cheaper |
| `code-review` | MP | Tie | 2.1–2.5× | `ponytail-review` is cheaper |
| `executing-plans` | SP | Tie | 3.1× / 4× time | Plain "implement PLAN.md" does the same |
| `subagent-driven-development` | SP | Tie | **21×** ($4.63 vs $0.22 per run); 2 of 4 runs hit the 45-min cap | Very expensive, no gain |
| `implement` | MP | Tie | 1.0–1.7× | No gain |
| `writing-plans` | SP | Round 4 tie (a fresh agent built 10/10 from both plans); round 3 +1.1 | 1.8× / 2× time | Plans come out 3× longer and add commit steps |
| `brainstorming` | SP | Vague idea 10 vs 4 | 1.5× / 2.5× time | Ties `grilling`, which is cheaper |
| `grill-me` | MP | −0.1 vs `grilling` | – | It only loads `grilling` |
| `dispatching-parallel-agents` | SP | **−1** (opus 8 vs 10; a duration test failed twice; 0 subagents used) | 1.1× | Made results worse |
| `writing-skills` | SP | Tie; skills from every setup worked | 4.4× / 3.6× time | Same result, 4× the cost |
| `using-superpowers` | SP | The whole bundle won 1 of 9 tests | 1.1–2.1× on every task | Bundle bootstrap; it fights the `AGENTS.md` rules |
| `to-spec` | MP | +1.6 on 3 models, but the test was unfair | – | Needs per-repo setup; inconclusive |
| `ponytail` (fallback) | PT | Never read in 112 runs | – | Hide it only. **Keep the file**: ultra mode reads it from disk |
| `ponytail-gain`, `ponytail-help` | PT | Display-only, never used | – | No value |

## Drop: read but not run (23)

| Skill(s) | Src | Why drop |
|---|---|---|
| `using-git-worktrees`, `finishing-a-development-branch` | SP | They commit, merge or delete without asking; only useful with the bundle on |
| `diagnosing-superpowers` | SP | Only for filing superpowers bug reports |
| `to-tickets`, `triage`, `wayfinder`, `implement-spec`, `setup-matt-pocock-skills`, `ask-matt` | MP | Need an issue tracker and per-repo setup |
| `pr` | MP | Its PR format conflicts with the one in `AGENTS.md` |
| `research`, `wizard` | MP | `research` clashes with the ctx7/Moli routing; `wizard` reads `.env`, which `AGENTS.md` forbids |
| `teach`, `git-guardrails-claude-code`, `setup-pre-commit`, `scaffold-exercises`, `migrate-to-shoehorn` | MP | Off-topic, or only for Claude Code |
| `chief-of-staff`, `claude-handoff`, `loop-me`, `setup-ts-deep-modules`, `writing-beats`, `writing-fragments`, `writing-shape` | MP | Unfinished drafts (`in-progress/`); `claude-handoff` is for the Claude CLI only |

## Other findings

- **Ponytail ultra mode** (the extension, not a skill): composite score 4.74 vs 4.41 with it off, at the same cost. Most of the gain came from one scope-creep task, where it stopped 5 of 6 runs from building an unasked-for config registry. Keep it on.
- **Superpowers bundle as shipped** (extension + bootstrap + all 15 skills): won only the vague-idea test (8.5). It never loaded the debugging, TDD or verification skills by itself, and cost 1.1–2.1× more. Don't install it.
- **Safety:** no hard fails in round 4's 170 runs. Nothing weakened tests, committed or pushed without permission, or read secrets.
- **Vague ideas** are the one place where any skill clearly helped. With no skill the agent built the tool straight away without asking anything (4/10). `/skill:grilling` or "grill me" gives 10/10.

## Limits

- In 7 of 9 round 4 tests, the setup with no skill already scored 10/10 in 20–90 s. "Drop" means no gain on everyday-sized tasks. It doesn't rule out gains on very hard tasks.
- Runs per arm were small (n=4 in round 4), so differences under about 1 point are noise.
- Community evidence (GitHub issues, reviews) was thin for most skills and was used only to break ties.
- The raw runs, fixtures and audit files lived in `/tmp/sk-eval` and `/tmp/pt-exp2` on the test machine. They are not kept in this repo.

## Proposed config

1. **Superpowers:** remove the package entry from `agent/settings.json`. That also turns off its extension and bootstrap.
2. **mattpocock/skills:** `grilling`, plus whichever optional skills you want. Install `prototype` as a local copy under `agent/skills/prototype/` with `disable-model-invocation: true`.
3. **Ponytail:** `{"source": "npm:@dietrichgebert/ponytail", "skills": ["ponytail-review"]}`, adding `ponytail-audit` and `ponytail-debt` if wanted. Keep ultra mode on.
4. **Rules:** remove routing to the dropped skills from `agent/AGENTS.md` and `agent/APPEND_SYSTEM.md`.
