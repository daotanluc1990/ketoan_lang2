# Loop Constraints

> Add rules below with `/constraints <rule>` in your agent.
> The `loop-constraints` skill reads this file at the start of every run.
> Constraints here are **binding** — the agent MUST follow them.

## Push & Merge
- Don't push before telling me
- Never auto-merge to main without human approval
- Always create a draft PR first; let me review before marking ready

## Paths
- Never edit .env, .env.*, auth/, payments/, secrets/, credentials/
- Never edit infrastructure configs without human approval

## Code
- Always run tests before proposing a fix
- Never disable tests to make CI green
- Never refactor unrelated code — one fix per run
- Max 3 fix attempts per item; escalate after

## Communication
- Always tell me what you're about to do before doing it
- Never close an issue or PR without my approval

## Budget
- If token spend hits 80% of daily cap, switch to report-only
- If loop-pause-all is active, exit immediately

## ketoan_lang2 specific
- This project serves a non-technical owner. Output in STATE.md must be plain language (Vietnamese for owner-facing summaries, per AGENTS.md).
- Never edit: `.env*`, `vercel.json`, `schema.json`, `scripts/`, `templates/`, or anything under `auth/` / `payments/` without explicit owner approval.
- Never run `npm run build`, `npm run deploy`, or anything that touches Vercel without owner approval. L1 loop = report only, no commands beyond reading.
- Never edit `AGENTS.md` — it is the v2.0.0 source of truth for this repo.
- Respect the task-mode classification in AGENTS.md before suggesting any action.

---
<!-- Add your own rules below. Use plain English. The loop reads this verbatim. -->
