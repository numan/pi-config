---
description: Review a defined change for material correctness, maintainability, security, performance, and test risks
argument-hint: "[scope]"
---

Invoke `code-reviewer` for `$ARGUMENTS`, or for the current staged, unstaged, or
branch changes when no scope is supplied.

When `PI_SESSION_FILE` is available, derive
`${PI_SESSION_FILE%.jsonl}.review.md` and use it as the durable review record
path. Otherwise return the review inline and state that no durable record was
written. Follow the durable review record section of the loaded `code-reviewer`
skill before writing the artifact.

Establish intended behavior and the correct diff range, inspect tests and code
directly, and run focused validation when useful. Apply correctness,
readability, architecture, security, performance, and test checks only where
relevant.

Report only discrete, actionable findings supported by evidence. Don't invent a
finding to populate every axis. For each finding include priority, confidence,
`file:line` or command evidence, concrete impact, smallest valid remediation,
and verification.

Return an `APPROVED` or `NEEDS CHANGES` verdict, the exact reviewed range, the
review record path or why none was written, findings and their state, repair
rounds, positive observations, commands and outcomes, checks not run, and
residual risks. Update the durable record before returning.
