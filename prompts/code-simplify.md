---
description: Simplify defined code for readability and maintainability without changing behavior
argument-hint: "[scope]"
---

Invoke `code-simplifier` for `$ARGUMENTS`, or recently changed code when no scope
is supplied.

Read project instructions, callers, tests, and local conventions before editing.
Make only evidence-backed simplifications that reduce confusing control flow,
duplication, misleading names, mixed responsibilities, or unhelpful
indirection. Avoid broad rewrites and personal-style churn.

Apply changes incrementally, run focused behavioral validation after each
logical refactor, and finish with a clean diff plus the commands and outcomes
that support behavior preservation.
