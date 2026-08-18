---
description: Run independent release checks in parallel and synthesize an evidence-backed go or no-go decision
argument-hint: "[scope]"
---

Invoke `shipping-and-launch` for `$ARGUMENTS` or the current change.

When `PI_SESSION_FILE` is available, derive
`${PI_SESSION_FILE%.jsonl}.review.md` as the durable review-record path and
follow the durable review record section of the loaded `code-reviewer` skill.
The coordinator alone writes this shared record; specialists return reports to
the coordinator. If no persistent session is available, return the synthesis
inline and state that no durable record was written.

For a material release, spawn these independent analysis-only agents in
parallel:

- `reviewer`: correctness, maintainability, architecture, security, performance
- `security-auditor`: applicable trust boundaries and exploitable risks
- `test-engineer`: coverage and validation gaps; analysis mode, no edits

Wait for all required results and read every artifact before synthesis. For a
change of at most two files and 50 lines that doesn't touch authentication,
payments, data access, configuration, environment, deployment, or another
high-risk boundary, run a single main-context release check instead.

Synthesize:

```markdown
## Ship decision: GO | NO-GO

### Blockers
### Recommended fixes
### Validation evidence
### Acknowledged risks
### Rollback triggers and procedure
### Specialist reports
### Review record
```

Write the synthesis to the durable review record using `Decision: GO | NO-GO`,
the exact reviewed range, verification evidence, finding states, specialist
reports, any repair task records, and residual risks. Preserve relevant evidence
from an existing record instead of silently discarding it.

A Critical security or P0 review finding is a blocker unless the user explicitly
accepts the documented risk. A GO decision requires a concrete rollback plan
and evidence for the checks claimed as passed. Don't deploy or perform another
external write without separate confirmation.
