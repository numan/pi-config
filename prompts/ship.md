---
description: Run the pre-launch checklist via parallel fan-out to specialist agents, then synthesize a go/no-go decision
argument-hint: "[scope]"
---

Invoke the `shipping-and-launch` skill.

`/ship` is a fan-out orchestrator. It runs specialist agents in parallel against `$ARGUMENTS` or the current change, then merges their reports into a single go/no-go decision with a rollback plan.

## Phase A — Parallel fan-out

Spawn three Pi subagents concurrently using the `subagent` tool. Issue all three subagent calls in the same assistant turn so they run in parallel:

1. **`reviewer`** — Run a five-axis review: correctness, readability, architecture, security, performance. Output the standard review template.
2. **`security-auditor`** — Run a vulnerability and threat-model pass. Check OWASP Top 10, secrets handling, auth/authz, dependency CVEs, and AI/LLM risks where applicable. Output the standard audit report.
3. **`test-engineer`** — Analyze test coverage. Identify gaps in happy path, edge cases, error paths, and concurrency scenarios. Output the standard coverage analysis.

Constraints:

- Subagents are independent and report back to the main session.
- Do not let one persona delegate to another.
- The main session merges results after all required subagents return.
- Do not provide the final ship decision until all three reports have arrived.

Skip fan-out only if all are true: the change touches 2 files or fewer, the diff is under 50 lines, and it does not touch auth, payments, data access, config/env, or deployment. Otherwise, default to fan-out.

## Phase B — Merge in main context

After all three reports return, synthesize:

1. **Code quality** — Aggregate Critical/Required findings from `reviewer` plus failing tests, lint, or build output.
2. **Security** — Promote Critical/High `security-auditor` findings to blockers. Cross-reference with the review's security axis.
3. **Performance** — Pull from code review and performance checks; cross-check Core Web Vitals if applicable.
4. **Accessibility** — Verify keyboard navigation, screen reader support, contrast, and semantic structure for UI changes.
5. **Infrastructure** — Environment variables, migrations, monitoring, feature flags, deployment safety.
6. **Documentation** — README, ADRs, changelog, operational notes.

## Phase C — Decision and rollback

Produce:

```markdown
## Ship Decision: GO | NO-GO

### Blockers
- [Source: finding + file:line]

### Recommended fixes
- [Source: finding + file:line]

### Acknowledged risks
- [Risk + mitigation]

### Rollback plan
- Trigger conditions: [signals that prompt rollback]
- Rollback procedure: [exact steps]
- Recovery time objective: [target]

### Specialist reports
- [reviewer report]
- [security-auditor report]
- [test-engineer report]
```

Rules:

1. Phase A agents run in parallel, not sequentially.
2. The rollback plan is mandatory before any GO decision.
3. If any specialist returns a Critical finding, default to NO-GO unless the user explicitly accepts the risk.
