# Durable review record

Use a review record when a review artifact path is supplied or when
`PI_SESSION_FILE` is available. For a persistent session, derive the path as:

```bash
REVIEW_FILE="${PI_SESSION_FILE%.jsonl}.review.md"
```

The coordinator owns the record. Independent reviewers return evidence to the
coordinator rather than writing the same file concurrently. Update the record
after each review or repair attempt so interruption does not erase the latest
verdict.

```markdown
# Review Record

**Decision:** APPROVED | NEEDS CHANGES | GO | NO-GO
**Session:** `/absolute/path/session.jsonl` | unavailable
**Plan:** `/absolute/path/plan.md` | not provided
**Todos:** `TODO-...`, `REVIEW-FIX-...` | not provided
**Scope:** [requested scope]
**Reviewed range:** [base..HEAD, staged/unstaged, PR, or other exact target]
**Repair rounds:** 0 | 1 | 2

## Summary
[Concise evidence-backed assessment]

## Verification
- `[command]` — [pass, fail, or blocked with key evidence]

## Findings
### [P1] [Title]
- **Confidence:** high | medium
- **Evidence:** `path:line`, command, or reproduced behavior
- **Impact:** [concrete consequence]
- **Remediation:** [smallest valid fix]
- **Verification:** [check proving the fix]
- **State:** open | addressed by `<sha>` | accepted risk

## Repair Tasks
- **Status:** DONE | BLOCKED
- **Task ID:** `TODO-...` | `REVIEW-FIX-...`
- **Files changed:** [paths or `none`]
- **Verification:** [commands and results]
- **Commit SHA:** `<full SHA>` | `not authorized` | `none — blocked before commit`
- **Residual risks:** none | [specific risk]

## Specialist Reports
- **Reviewer:** [decision and evidence]
- **Security:** [decision and evidence]
- **Tests:** [decision and evidence]

## Residual Risks
- None | [specific non-blocking or accepted risk]
```

Omit empty finding, repair, or specialist subsections, but always retain the
header fields, summary, verification, and residual risks. Never mark a decision
approved or GO while an unresolved blocking finding remains. A repair worker's
completion contract may be copied into `Repair Tasks` without reformatting.
