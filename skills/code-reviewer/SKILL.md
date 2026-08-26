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

# Code Reviewer

Conduct professional, evidence-backed code reviews for local changes and remote pull requests. Review across five axes: correctness, readability, architecture, security, and performance, with explicit attention to tests and project conventions.

**Approval standard:** approve when the change clearly improves the codebase and follows project conventions, even if it is not exactly how you would have written it. Do not rubber-stamp. Do not block on personal preference.

## Workflow

### 1. Determine the review target

- **Remote PR:** If the user provides a PR number or URL, target that remote PR.
- **Local changes:** If no PR is specified, review current staged and unstaged changes.

### 2. Prepare context

For remote PRs:

1. Check out the PR with `gh pr checkout <PR_NUMBER>`.
2. Read the PR description, linked issues, and existing comments.
3. Run the project's standard verification command if it is safe and discoverable.

For local changes:

1. Run `git status`.
2. Read `git diff` and `git diff --staged` as applicable.
3. Read the task, plan, spec, or commit message that explains intent.
4. Review tests first; they reveal intended behavior and coverage.

Discover validation commands from project files and instructions. Do not assume `npm run preflight` exists.

### 3. Review against the five axes

#### Correctness

- Does the code match the task, spec, or PR description?
- Are edge cases handled: null, empty, boundary values, error paths?
- Are there off-by-one errors, race conditions, or state inconsistencies?
- Do tests verify behavior rather than implementation details?
- Would the tests fail if the new behavior regressed?

#### Readability and simplicity

- Are names descriptive and consistent with nearby code?
- Is control flow straightforward, without needless nesting or cleverness?
- Is related code grouped with clear boundaries?
- Are comments explaining non-obvious intent rather than restating code?
- Are there dead artifacts: unused variables, commented-out code, no-op shims, or stale fallback paths?
- Are repeated conditionals signaling a missing model, dispatcher, or helper?

#### Architecture

- Does the change follow existing patterns, or justify a new one?
- Are module boundaries maintained?
- Are dependencies flowing in the right direction, without circular dependencies?
- Is the abstraction level earned, not speculative?
- Does the change reduce complexity rather than relocate it?
- Is feature-specific logic kept out of shared/general-purpose modules?
- Are type boundaries explicit instead of hidden behind broad casts or silent fallbacks?

#### Security

- Is untrusted input validated at system boundaries?
- Are outputs encoded and queries parameterized?
- Are authentication and authorization checked where needed?
- Are secrets kept out of source, logs, prompts, and client-visible state?
- Are user-supplied URLs protected against SSRF/open redirects?
- Are new dependencies reviewed for maintenance, license, postinstall scripts, and vulnerabilities?

#### Performance

- Any N+1 queries, unbounded loops, unconstrained fetches, or missing pagination?
- Any synchronous work that should be asynchronous?
- Any unnecessary UI re-renders or hot-path allocations?
- Any sequential awaits that should be parallelized safely?
- Are claims about performance backed by measurements or clearly labeled as potential impact?

#### Test quality and cost

When tests are materially added, changed, removed, slow, or flaky, load and apply the `testing-strategy` skill.

For review specifically:

- verify that removed contracts retain an owning test
- require higher-level tests to identify their unique boundary confidence
- require comparable evidence for test-performance claims
- report which targeted and representative validation commands actually ran

### 4. Propose structural remedies

When you flag a structural issue, propose the concrete move:

- Replace conditional chains with a typed model, lookup, or dispatcher.
- Collapse duplicate branches into one clearer flow.
- Separate orchestration from business logic.
- Move feature-specific logic into the package/layer that owns it.
- Reuse a canonical helper instead of adding a near-duplicate.
- Make type boundaries explicit so downstream branching disappears.
- Delete pass-through wrappers that add indirection without meaning.
- Extract helpers or split large files when the file is becoming hard to reason about.

Prefer remedies that remove moving pieces over ones that merely spread complexity around.

### 5. Consider change size

Small, focused changes are easier to review and safer to merge.

- ~100 changed lines: good.
- ~300 changed lines: acceptable if it is one logical change.
- ~1000 changed lines: too large unless mostly generated, deletions, or mechanical refactor.

Watch total file size too. If a small diff materially grows an already-large file, ask whether to extract helpers, components, or modules before piling more on.

Separate refactors from feature work unless the cleanup is tiny and directly supports the feature.

### 6. Apply a proportionality gate

A reproducible edge case is not automatically merge-blocking. Before assigning
severity, weigh:

- likelihood in ordinary supported workflows
- severity and reversibility of the harm
- number of affected users and expected frequency
- existing containment, especially authoritative server checks
- whether the behavior violates an approved requirement
- complexity and regression risk of the smallest repair

Reserve merge-blocking findings for realistic incorrect behavior, security or
authorization exposure, data or financial integrity risk, irreversible effects,
or substantial regressions on active paths. Treat rare, bounded scenarios as
optional or accepted-risk candidates when the system already contains the harm.

If remediation requires a new state machine, cross-cutting operation tracking,
or more concepts than the reviewed change, present the simple and hardened
options instead of assuming the larger fix is required. Do not recursively
broaden review into adjacent theoretical races unless they are independently
likely and material.

### 7. Categorize findings

Use severity labels so the author knows what is required.

- **Critical:** Blocks merge. Security vulnerability, data loss risk, financial integrity failure, or broadly broken functionality.
- **Required:** Must address before merge because it causes realistic incorrect behavior, security exposure, data or financial integrity risk, or a substantial maintainability regression on an active path.
- **Optional / Consider:** Useful improvement, rare bounded edge case, or accepted-risk candidate; not required.
- **Nit:** Minor style or formatting issue. Author may ignore.
- **FYI:** Context only.

Lead with high-leverage issues. A few high-confidence findings are better than a long list of cosmetic nits.

### 8. Verify the verification

Report what you checked:

- Tests reviewed and whether they cover the behavior.
- Commands run and outcomes.
- Build/type/lint status when relevant.
- Manual verification or screenshots for UI changes.
- Any validation you could not run and why.

Never claim tests pass or a build succeeds unless you ran the command and saw success.

## Durable review record

When the caller supplies an artifact path, or when `PI_SESSION_FILE` is
available, read `references/review-record.md` and write the review record using
that schema. For parallel review, independent specialists return their reports
to one coordinator; only that coordinator writes or updates the shared record.
Use the inline format below when no durable path is available.

## Inline output format

```markdown
## Review Summary

**Verdict:** APPROVED | NEEDS CHANGES

**Overview:** [1-2 sentences summarizing the change and overall assessment]

### Critical Issues
- [File:line] [Description and specific fix]

### Required Changes
- [File:line] [Description and specific fix]

### Optional / Nits
- [File:line] [Description]

### What's Done Well
- [Specific positive observation]

### Verification Story
- Tests reviewed: [yes/no, observations]
- Commands run: [`command` → result]
- Build/type/lint verified: [yes/no]
- Security checked: [yes/no, observations]

### Residual Risks
- None | [specific remaining risk]
```

## Review checklist

```markdown
### Context
- [ ] I understand what this change does and why

### Correctness
- [ ] Change matches requirements
- [ ] Edge cases and error paths are handled
- [ ] Tests cover behavior adequately

### Readability
- [ ] Names are clear and consistent
- [ ] Logic is straightforward
- [ ] No unnecessary complexity or dead artifacts

### Architecture
- [ ] Follows existing patterns or justifies new ones
- [ ] Boundaries and dependency direction are clean
- [ ] Abstractions earn their complexity
- [ ] File/module size remains healthy

### Security
- [ ] No secrets in code/logs/prompts/client-visible state
- [ ] Input is validated and output encoded
- [ ] Injection, SSRF, auth, and dependency risks considered

### Performance
- [ ] No N+1 or unbounded operations
- [ ] No obvious hot-path regressions
- [ ] Performance claims are measured or clearly labeled

### Tests
- [ ] Behaviors are tested at the lowest sufficient layer
- [ ] Higher-level tests provide unique boundary confidence
- [ ] Expensive renders, queries, and interactions are necessary
- [ ] Removed assertions remain covered at an owning layer

### Verification
- [ ] Relevant tests/build/lint/type checks run or explicitly skipped with reason
- [ ] Verification story documented
```

## Common red flags

- "LGTM" without evidence of review.
- Passing tests treated as the only quality gate.
- Security-sensitive changes without security-focused scrutiny.
- Large PRs that are too big to review properly.
- Bug fixes without regression tests.
- Material test changes reviewed without applying `testing-strategy`.
- Comments without severity labels.
- Accepting "I'll clean it up later."
- Refactors that move code without reducing concepts.
- New conditionals scattered into unrelated paths.
- Bespoke helpers duplicating existing canonical helpers.
- New dependencies without review.

## Cleanup

For remote PRs, ask before switching branches after the review. Do not modify code during a review unless the user explicitly asks you to fix findings.
