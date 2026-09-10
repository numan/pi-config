---
description: Plan and execute substantial work through scoped context gathering, explicit plan approval, sequential implementation, and independent review
argument-hint: "<what-to-build>"
---

Run the full planning workflow for: `$ARGUMENTS`.

## Outcome

Deliver the requested change with an approved plan, completed todos, relevant
validation, and an independent final review.

## Orchestration

1. Inspect project instructions and reuse current repository evidence to scope
   the work.
2. Apply the global delegation rule where substantial independent investigation
   is useful. Gather small or tightly coupled facts directly. Wait for required
   subagent results and read their artifacts; don't require a scout round.
3. Spawn the interactive `planner` with the user request, known constraints,
   available evidence, a target plan path, and access to `subagent_done`. Let it
   resolve material ambiguity, choose routine design details autonomously,
   validate the design, and write a worker-ready plan and proposed todo breakdown.
   Tell it that this workflow owns the single concrete-plan approval, with no
   separate approach checkpoint, and that it must not create actionable
   todo records, final-review, generic QA, audit, cleanup, or final-validation
   todos. Instruct it to call `subagent_done` immediately after reporting its
   completed planning artifact and proposed breakdown.
4. Read the concrete plan and proposed todos. Before presenting them, remove or
   merge any item that only reruns another todo's verification or duplicates
   `code-quality`, independent review, or review repair. Require every proposed
   todo to own a product, test, documentation, migration, configuration, or
   operational artifact. Update the plan artifact to match the deduplicated
   breakdown, present both, then wait for explicit user approval.
5. After approval, create actionable todo records exactly from the approved
   breakdown, preserving order and dependencies. Execute them sequentially with
   `worker` agents in the same repository. Give each worker one todo, the plan
   path, relevant context, and the verbatim commit instruction below. Verify each
   completion contract and commit before accepting completion or starting the next.
6. Run `reviewer` after implementation. This is the sole independent review
   stage. When `PI_SESSION_FILE` is available, use
   `${PI_SESSION_FILE%.jsonl}.review.md` as the durable review record and keep
   one coordinator as its sole writer. Record each attempt, finding state, and
   repair result before continuing.

   Before creating a review-repair todo, triage each finding by:

   - likelihood in normal supported use
   - consequence, affected users, and expected frequency
   - existing backend or system containment
   - whether it violates an approved acceptance criterion
   - remediation complexity and blast radius

   Automatically repair P0 findings and P1 findings involving security,
   authorization, data integrity, financial correctness, irreversible effects,
   or a direct violation of approved requirements. For other P1 findings, do not
   let review silently expand the approved scope. If the scenario is rare,
   timing-dependent, and contained by an authoritative backend, present it as an
   accepted-risk candidate and ask the user before creating a repair todo.

   Stop and request a user risk decision when a proposed repair requires a new
   state machine or cross-cutting abstraction, is materially broader than the
   original implementation, creates another finding of comparable severity, or
   follows an already completed autonomous repair round. Offer three choices:
   accept the risk, implement the hardening, or revert to the simpler design.
   Re-review substantial repairs after the decision.
7. After independent review and any approved repairs are complete, run
   `code-quality` only when the resulting branch has material behavior-preserving
   simplification opportunities. Its checklist requires approval before cleanup.

Include this instruction verbatim in every implementation and review-repair
worker's task message:

> You are explicitly authorized and required to commit this task's changes.
> Load the `commit` skill, validate, commit only this task's changes, and append
> the completion record with the full commit SHA to the todo before closing it.
> Do not report DONE or close the todo without successful required validation
> and a commit. If committing is blocked, report BLOCKED, append the record,
> release the todo, and leave it open.

Every implementation or review-repair worker must return this exact completion
contract:

```markdown
Status: DONE | BLOCKED
Task ID: TODO-... | REVIEW-FIX-...
Files changed:
- `path` — delivered behavior
Verification:
- `command` — pass, fail, or blocked with key output
Commit SHA: `<full SHA>` | none — blocked before commit
Residual risks: none | specific remaining risk or blocker
```

Before accepting completion or starting the next worker, verify that the reported
full SHA identifies a commit in the working branch and that its diff contains
only the task's changes. Require `Status: DONE`, successful required validation,
and that verified SHA. Reject `not authorized` or a missing commit; keep the todo
open (or reopen it if closed prematurely) and resolve the blocker before proceeding.

For repair work, copy the verified contract into the review record and the
repair todo before closing it. Do not infer completion from subagent exit or
idle state.

## Boundaries

- Parallelize only independent read-heavy investigations, never shared-state
  implementation.
- Don't repeat repository exploration already supported by current evidence.
- Don't create actionable todo records or start implementation before approval
  of the actual plan and proposed todo breakdown.
- Don't synthesize required subagent results until all have returned and their
  artifacts have been read.
- Keep planning, implementation, quality cleanup, and review in their named
  layers; don't silently cross between them.
- Focused tests, builds, type checks, and smoke checks belong to the worker todo
  that owns the changed behavior. Coordinator checkpoints consume that evidence;
  they are not separate review todos.

## Completion

Report the plan path, todos completed, commits created, validation commands and
results, review-record path or why none was written, review verdict, addressed
findings, repair rounds, and remaining risks or blockers.
