---
description: Conduct a five-axis code review — correctness, readability, architecture, security, performance
argument-hint: "[scope]"
---

Invoke the `code-reviewer` skill.

Review `$ARGUMENTS` if provided; otherwise review the current changes, staged changes, or recent commits. Cover all five axes:

1. **Correctness** — Does it match the spec/task? Are edge cases and errors handled? Are tests adequate?
2. **Readability** — Are names clear, logic straightforward, and code well organized?
3. **Architecture** — Does it follow existing patterns, preserve boundaries, and use the right abstraction level?
4. **Security** — Is input validated, output encoded, auth checked, and secret handling safe? Use `security-and-hardening` where needed.
5. **Performance** — Are there N+1 queries, unbounded operations, hot-path allocations, or avoidable re-renders? Use `performance-optimization` where needed.

Categorize findings as Critical, Required, Optional/Consider, Nit, or FYI. Output a structured review with specific file:line references and fix recommendations. Report verification commands run and their outcomes.
