# Loop Configuration — ketoan_lang2 (Minimal Triage, Opencode variant)

## Active Loops

| Pattern | Cadence | Status | Command |
|---------|---------|--------|---------|
| Daily Triage | 1d | L1 report-only | `opencode run "Run loop-triage. Read STATE.md first. Update High Priority and Watch List. No auto-fix in week one." --agent loop-triage` |

## Project Context

- Next.js app (accounting / Google Sheet tool) for a non-technical owner.
- Test/build commands the loop should respect:
  - `npm run test` (vitest)
  - `npm run lint` (eslint, max-warnings=0)
  - `npm run typecheck` (tsc --noEmit)
  - `npm run build` (next build --webpack)
- Read `AGENTS.md` (v2.0.0) — it is the primary operating file for this repo; this LOOP.md only adds the loop layer on top.

## Human Gates

- No auto-fix until L2 checklist complete. L1 = report-only, always.
- All high-risk paths require owner approval (see AGENTS.md safety section + `loop-constraints.md` denylist).
- Owner is non-technical → loop output in STATE.md must be plain-language.

## Worktrees

- Not needed at L1 (no code edits). Required from L2+: one worktree per fix attempt, discard after verifier REJECT.

## Connectors (MCP)

- MCP optional for L1 report-only loops.
- For L2+: GitHub MCP can read CI/issues; scope connectors to read + comment until trusted.

## Budget

- Max sub-agent spawns per run: 0 (L1).
- Daily cap: 100k tokens (from `loop-budget.md`).
- Review STATE.md daily.
- If token spend hits 80% of daily cap, switch to report-only.
- Kill switch: `loop-pause-all` (see `loop-budget.md`).

## Links

- Pattern reference: https://github.com/cobusgreyling/loop-engineering/blob/main/patterns/daily-triage.md
- Skill: `skills/loop-triage/SKILL.md`
- State: `STATE.md`
- Constraints: `loop-constraints.md`
