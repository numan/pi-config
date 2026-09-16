---
name: testing-strategy
description: Designs, audits, refactors, and optimizes automated tests while preserving confidence. Use when choosing test layers, reviewing test coverage or cost, removing redundant tests, fixing slow or timed-out tests, selecting realistic versus direct interactions, or restructuring unit, component, integration, and E2E coverage.
---

# Testing Strategy

Place each behavior at the lowest test layer that can prove it. Require every higher-level test to add unique boundary or user-flow confidence rather than repeat lower-level rule coverage through a more expensive fixture.

## Workflow

1. Identify the observable contracts, regression risks, and production code responsible for the behavior.
2. Search existing tests for the same messages, inputs, outcomes, and invariants.
3. Map each contract to its current and preferred owning layer.
4. Separate unique boundary confidence from duplicated rule coverage.
5. Add or refactor tests at the lowest sufficient layer.
6. Preserve one representative higher-level assertion when wiring, accessibility, integration, or a user sequence is the actual contract.
7. Run targeted validation and required repository checks, including representative regression validation appropriate to the change.

Choose evidence proportional to the change. Do not add a test merely to mirror a reversible, low-impact implementation change. For clipping or responsive layout, verify in a real browser; DOM assertions alone do not prove the visual result.

Use this coverage map when test ownership or removal is non-trivial. For a small change, identify ownership without producing a separate document:

| Contract | Current layer | Owning layer | Unique higher-level confidence |
|---|---|---|---|
| Behavior being protected | Existing test location | Lowest sufficient layer | Boundary failure only this layer catches |

Do not remove an assertion until its contract has an owning test or is shown not to be a meaningful contract.

## Choose the Lowest Sufficient Layer

Trace the callback, state, or effect responsible for the outcome before moving coverage. Include that production behavior in the chosen layer; do not recreate it in a test harness to make a lower-level test pass.

| Behavior | Preferred layer | Higher-level coverage |
|---|---|---|
| Pure validation rules, transformations, and edge-case matrices | Pure unit test | None unless a boundary can mis-wire the result |
| Hook, reducer, or state visibility transitions | Unit or hook test | One component smoke test when event/prop wiring matters |
| Component rendering, accessibility, and local interactions | Focused component test | Page test only when composition changes behavior |
| Routing, persistence, network, or multi-component flow | Integration test | E2E only for a critical user journey |
| Browser focus order, keyboard sequence, or cross-page journey | Browser/E2E test | Keep the scenario narrow and outcome-focused |

Before retaining a page, integration, or E2E assertion, answer:

1. What unique failure can this layer catch?
2. Which rules are already proven below it?
3. Can this test use one representative case instead of repeating the full matrix?

Move or delete higher-level coverage that has no unique answer.

## Audit Redundancy

Classify expensive assertions as:

- **Owning coverage**: the layer responsible for the complete behavior matrix.
- **Representative wiring**: one case proving data, events, accessibility, or state cross a boundary correctly.
- **Duplicate coverage**: repetition that catches no distinct failure mode.

Keep each rule matrix at one owning layer. For example, keep validation values and exact messages in a pure test, touched-error filtering in a unit or hook test, and one accessible field-error assertion in a page test.

Do not split one slow page test into several page tests merely to avoid a per-test timeout. Reduce total expensive setup, renders, interactions, and queries.

## Minimize Scenario Setup

Start at the nearest valid precondition for the transition under test. Load a saved fixture when creation is only setup; keep real creation and navigation when first-save behavior is the contract.

Identify the starting state, transition, and observable outcome before removing a repeated journey. Identical assertions after different transitions may protect distinct failures. Preserve those contracts even when splitting a long scenario.

Simplify unrelated setup and duplicated journeys before adding mocks or optimizing interactions. Replace an expensive unrelated widget only when its real behavior has dedicated coverage and the double preserves the interface used by the scenario. Keep the behavior under test real. Prefer a local double or an existing focused helper over global mocks or a configurable all-purpose harness.

## Match Interaction Fidelity to the Contract

Use realistic user interaction helpers when the contract includes:

- focus traversal or tab order
- keyboard or pointer sequencing
- default browser behavior across multiple events
- disabled-state enforcement or interaction timing
- a user journey whose order is meaningful

Use a direct event when the contract is a single handler or state transition. Do not simulate click, focus, tab traversal, and blur merely to exercise an `onBlur` contract.

Never replace a realistic sequence when doing so skips behavior users rely on. In that case, retain the sequence and move duplicated rule assertions lower.

## Diagnose Slow and Timed-Out Tests

Measure the conditions relevant to the failure, progressing toward the representative configuration rather than treating every entry as a mandatory run:

1. The test alone without instrumentation.
2. The test alone with CI instrumentation such as coverage, sanitizers, or tracing.
3. The representative suite, shard, or worker configuration.
4. The relevant CI environment differences: CPU, memory, worker count, runtime, and dependencies.

Inspect full application/page renders, state-changing loops, repeated accessibility-tree queries, realistic interaction sequences, timers, requests, shared state, and order dependence.

Prefer this repair order:

1. Simplify unrelated setup and remove duplicate high-level coverage while preserving owning tests and distinct transition coverage.
2. Move rule matrices and state filtering to pure, unit, or hook tests.
3. Retain one representative boundary assertion.
4. Narrow interaction fidelity only when sequencing is not the contract.
5. Optimize production code only when profiling identifies it as the bottleneck.
6. Increase a timeout only when the remaining scenario is irreducibly valuable and representative measurements justify the budget.

Verify before and after with comparable commands and configurations. Report focused and representative-suite timings separately, including remaining timeout margin. An isolated speedup or local shard pass does not establish that CI is fixed; distinguish measured local results from CI confirmation.

## Fixture Validity and Environmental Dependencies

When creating or changing tests, inspect relevant factory defaults, callbacks,
and validations, including dependencies outside the diff. Keep setup valid
independently of the execution date unless time is explicitly under test.

For related dates, use a shared controlled clock or explicit relationships that
preserve the required ordering. Fixed dates are valid for fixed-calendar
scenarios with controlled time; do not mix them with live-clock defaults when
fixture validity depends on their relationship.

When a clock dependency could invalidate a fixture, verify the affected examples
at a date beyond the identified failure boundary. Restore clock changes after
the check. Scope this verification to the demonstrated dependency rather than
running every test across a calendar matrix.

## Detailed Patterns

Read `references/testing-patterns.md` when concrete examples for unit, component, integration, E2E, mocking, or layered test refactoring are needed.

## Boundaries

- Use `test-driven-development` for the red-green-refactor implementation workflow.
- Use `debugging-and-error-recovery` to reproduce and localize an unknown failure before restructuring coverage.
- Use a browser automation skill when the contract requires real browser behavior.
- Preserve approval, authorization, and commit gates from the active workflow.

## Verification

Apply the checks relevant to the change. Follow the active project instructions for required checks and when to stop verification.

- [ ] Meaningful automated coverage is preserved; new tests protect behavior rather than mirror implementation.
- [ ] Higher-level tests identify unique boundary or transition confidence.
- [ ] The chosen layer includes the production behavior responsible for the outcome.
- [ ] Setup omits unrelated journeys without bypassing the transition under test.
- [ ] Removed assertions remain covered or are explicitly shown redundant.
- [ ] Interaction fidelity matches the behavior under test.
- [ ] Targeted tests pass.
- [ ] Representative regression validation passes or its limitation is reported.
- [ ] Performance claims include comparable before/after measurements.
