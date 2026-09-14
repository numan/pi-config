---
description: Review a defined change for material correctness, maintainability, security, performance, and test risks
argument-hint: "[scope]"
---

Read and apply `code-reviewer` to `$ARGUMENTS`, or current staged, unstaged,
or branch changes when unspecified. Follow its inspection, validation,
finding thresholds, and output contract.

Own the durable review record at `${PI_SESSION_FILE%.jsonl}.review.md` when
`PI_SESSION_FILE` exists. Follow the skill's durable review record instructions
and update it before returning. Otherwise report inline and state that no
record was written.

Include the record path or reason absent, finding states, and repair rounds
alongside the skill's required verdict and report.
