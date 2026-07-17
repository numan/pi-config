---
name: test-driven-development
description: Proves new, changed, or corrected behavior with a failing test first, then implements the minimum fix and refactors safely. Use when implementing features, fixing bugs, or changing behavior where a red-green-refactor workflow is practical.
---

# Test-Driven Development

Prove behavior before implementing it. Write a test that fails for the expected reason, make the smallest change that passes, then refactor while the tests remain green.

Load and apply the `testing-strategy` skill before choosing a test layer, adding coverage, refactoring tests, or deciding how realistic an interaction must be. This skill owns the red-green-refactor workflow; `testing-strategy` owns test architecture, coverage overlap, cost, and interaction fidelity.

## Boundaries

Use TDD for:

- new logic or behavior
- bug fixes
- edge cases
- modifications that can regress observable behavior

Do not require a failing test first for pure documentation, static content, or configuration changes with no executable behavior. Still run the relevant validation.

Use browser automation in addition to TDD when the contract depends on real browser behavior.

## The TDD Cycle

```text
RED                 GREEN                 REFACTOR
Write a test   ->   Make it pass    ->   Improve safely
that fails          minimally            without behavior change
```

### 1. RED — Prove the Gap

Write the smallest test that demonstrates the missing or incorrect behavior.

Verify that it:

- fails before implementation
- fails for the expected reason
- observes behavior rather than implementation details
- is placed at the layer selected by `testing-strategy`

A test that passes immediately does not prove the gap. Recheck whether existing behavior already satisfies the contract, whether the assertion is wrong, or whether the test bypasses the relevant path.

```typescript
it('records when a task is completed', async () => {
  const task = await createTask({ title: 'Prepare slides' });

  const completed = await completeTask(task.id);

  expect(completed.completedAt).toBeInstanceOf(Date);
});
```

### 2. GREEN — Make the Minimum Change

Implement only what is necessary to satisfy the failing contract.

- Do not add speculative abstractions or unrelated cleanup.
- Keep the production design consistent with nearby code.
- Run the failing test and confirm it now passes.
- Run targeted regressions for the affected path.

```typescript
export async function completeTask(id: string): Promise<Task> {
  return db.tasks.update(id, {
    status: 'completed',
    completedAt: new Date(),
  });
}
```

### 3. REFACTOR — Improve Under Green Tests

Improve naming, structure, duplication, or boundaries without changing behavior.

- Keep tests green after each meaningful refactor.
- Do not rewrite assertions to accommodate a regression.
- Apply `testing-strategy` before restructuring or removing tests.
- Preserve an owning test for every meaningful contract.

## Bug-Fix Prove-It Pattern

For a reported bug:

1. Reproduce the bug with a focused test.
2. Confirm the test fails for the reported behavior.
3. Implement the root-cause fix.
4. Confirm the reproduction test passes.
5. Run relevant regressions.
6. Verify the original scenario end to end when practical.

If the bug cannot be reproduced deterministically, use `debugging-and-error-recovery` to gather evidence before changing behavior.

## Test Quality Gate

Defer test design decisions to `testing-strategy`, then ensure the TDD test:

- describes one observable contract
- uses deterministic inputs and controlled boundaries
- would fail if the behavior regressed
- does not merely assert mocks or internal call sequences
- does not duplicate a lower-level rule matrix through an expensive fixture

Load the detailed patterns reference exposed by `testing-strategy` when concrete unit, component, integration, E2E, mocking, or layered-refactoring examples are needed.

## Subagents

For complex or high-risk fixes, a fresh-context subagent may write only the reproduction test. Give it the bug report, relevant files, and an explicit output contract: produce a test that fails on current behavior and explain the failure. Verify the failure yourself before implementing the fix.

Do not delegate small, sequential changes when coordination costs more than the independent perspective provides.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll write tests after the code works" | A post-hoc test often mirrors the implementation and may never prove the original gap. |
| "The test passes, so the bug is fixed" | Confirm it failed before the fix and run relevant regressions. |
| "I tested it manually" | Manual evidence does not persist as a regression guard. |
| "I'll run the same test again to be safe" | Repeating an unchanged passing command adds no evidence. Run again only after a relevant change or under a more representative condition. |
| "The full page is more realistic" | Realism without unique confidence can create slow duplicate coverage. Apply `testing-strategy`. |

## Red Flags

- implementation written before any practical reproduction test
- a new test that never demonstrated the gap
- assertions changed only to make incorrect behavior pass
- bug fixes without regression coverage
- skipped or disabled tests used to reach green
- repeated test commands with no intervening change or more representative condition
- expensive high-level coverage added without checking existing lower-level ownership

## Verification

- [ ] The new or changed behavior had a failing test first when practical.
- [ ] The failure reason matched the intended gap.
- [ ] The minimum implementation made the test pass.
- [ ] Test architecture follows `testing-strategy`.
- [ ] Relevant targeted regressions pass.
- [ ] Broader validation passes or its limitation is reported.
- [ ] No tests were skipped or disabled to reach green.
