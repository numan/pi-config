---
description: Review a defined change for material correctness, maintainability, security, performance, and test risks
argument-hint: "[scope]"
---

Invoke `code-reviewer` for `$ARGUMENTS`, or for the current staged, unstaged, or
branch changes when no scope is supplied.

Establish intended behavior and the correct diff range, inspect tests and code
directly, and run focused validation when useful. Apply correctness,
readability, architecture, security, performance, and test checks only where
relevant.

Report only discrete, actionable findings supported by evidence. Don't invent a
finding to populate every axis. For each finding include priority, confidence,
`file:line` or command evidence, concrete impact, smallest valid remediation,
and verification.

Return an `APPROVED` or `NEEDS CHANGES` verdict, findings in priority order,
positive observations, commands run and outcomes, and checks not run.
