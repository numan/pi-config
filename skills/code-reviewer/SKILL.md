---
name: code-reviewer
description: Review local changes or pull requests for material correctness, maintainability, security, performance, and test issues without modifying code.
license: Apache-2.0 AND MIT
---

<!--
Originally vendored from Google Gemini CLI:
https://github.com/google-gemini/gemini-cli/tree/main/.gemini/skills/code-reviewer

Merged with Addy Osmani's agent-skills code-review-and-quality skill:
https://github.com/addyosmani/agent-skills/tree/main/skills/code-review-and-quality
-->

# Code reviewer

Review a defined local change or pull request. Report evidence-backed issues the
author would likely fix. Do not modify code or block on personal preference.

## Establish the target

For a remote pull request, read its description, linked issues, comments, diff,
and tests. Check it out only when authorized. For local work, inspect status,
staged and unstaged changes, the merge-base range when relevant, and the task,
plan, or specification that defines intent.

Read changed tests before judging the implementation. Trace affected callers,
types, boundaries, and one useful analogue rather than reviewing the diff in
isolation. Discover project validation commands from instructions and manifests.

## Review what applies

Check only relevant concerns:

- **Correctness:** requirements, boundaries, errors, state transitions,
  concurrency, and tests that would fail on regression.
- **Readability:** names, direct control flow, dead artifacts, duplication, and
  comments that explain intent rather than restating code.
- **Architecture:** local conventions, dependency direction, ownership,
  abstraction cost, explicit types, and feature logic leaking into shared code.
- **Security:** untrusted input, output encoding, authentication, authorization,
  secrets, injection, SSRF, dependencies, and unsafe side effects.
- **Performance:** unbounded work, N+1 access, hot-path allocation, unnecessary
  rendering, sequential independent work, and unsupported performance claims.
- **Tests:** observable contracts, realistic boundaries, and whether expensive
  higher-level coverage adds confidence unavailable at a lower layer.

Load `testing-strategy` when tests are materially added, changed, removed, slow,
or flaky. Run focused validation when safe and useful. Never claim a command
passed unless you ran it and checked the output.

## Finding threshold and priority

Report a finding only when it is introduced or exposed by the reviewed change,
supported by concrete evidence, material in this project, and specific enough
to fix and verify.

- **P0:** production breakage, data loss, financial-integrity failure, or a
  practical critical security issue.
- **P1:** realistic merge-blocking bug, security exposure, serious operational
  risk, or substantial maintainability regression on an active path.
- **P2:** bounded maintainability or quality issue worth addressing but not
  merge-blocking.

Skip preference-only nits and speculative scaling concerns. Before assigning
priority, weigh likelihood, harm, affected users, reversibility, existing
containment, approved requirements, and repair complexity. A reproducible rare
edge case is not automatically P1.

When the smallest repair requires a new state machine, cross-cutting tracking,
or more concepts than the reviewed change, present the simple and hardened
options. Do not silently turn a narrow review into a redesign.

For an explicitly requested strict maintainability audit, read
`references/strict-maintainability.md`. Do not apply that mode during ordinary
review.

## Output

For each finding include:

```markdown
### [P1] Concise title
- Confidence: high | medium
- Evidence: `path:line`, command, or reproduced behavior
- Impact: concrete consequence
- Remediation: smallest valid fix
- Verification: check that would prove the fix
```

Return `APPROVED` or `NEEDS CHANGES`, exact reviewed scope or commit range,
findings in priority order, positive observations, commands and outcomes,
checks not run, and residual risks. Do not approve with an unresolved P0 or
unaccepted P1. When evidence is incomplete, report the uncertainty and the next
investigation instead of asserting a defect.

## Durable review record

When the caller designates this agent as the record owner and supplies an
artifact path, read `references/review-record.md` and use that schema. In
parallel review, specialists return reports to one coordinator; only the
coordinator writes the shared record. Otherwise return the review inline.

## Boundaries

- Do not edit reviewed code.
- Do not manufacture findings to fill categories.
- Prefer a few high-confidence findings over a long checklist.
- Ask before switching branches after reviewing a remote pull request.
