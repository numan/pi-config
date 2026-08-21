---
description: Plan and execute substantial work through scoped context gathering, explicit plan approval, sequential implementation, and independent review
argument-hint: "<what-to-build>"
---

Run the full planning workflow for: `$ARGUMENTS`.

## Outcome

Deliver the requested change with an approved plan, completed todos, relevant
validation, and an independent final review.

## Orchestration

1. Inspect project instructions and use subagents to gather enough repository
   context to scope the work. Wait for them and read their artifacts.
2. Spawn additional `scout`s only when focused codebase facts are still needed for
   planning. Wait for them and read their artifacts.
3. Spawn the interactive `planner` with the user request, known constraints,
   scout evidence, a target plan path, and access to `subagent_done`. Let it
   resolve material ambiguity, get approach approval, validate the design, and
   write the plan with a worker-ready proposed todo breakdown. Tell it that this
   workflow owns concrete-plan approval and that it must not create actionable
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
   path, relevant context, and explicit commit authorization. Read each result
   before starting the next.
6. Run `code-quality` only when the resulting branch has material
   behavior-preserving simplification opportunities. Its checklist requires
   approval before cleanup.
7. Run `reviewer` after implementation and approved cleanup. This is the sole
   independent final-review stage. When `PI_SESSION_FILE` is available, use
   `${PI_SESSION_FILE%.jsonl}.review.md` as the durable review record and keep
   one coordinator as its sole writer. Create scoped review-repair todos only
   from concrete findings, fix P0/P1 findings, then re-review when fixes are
   substantial. Record each attempt, finding state, and repair result before
   continuing.

Every implementation or review-repair worker must return this exact completion
contract:

```markdown
Status: DONE | BLOCKED
Task ID: TODO-... | REVIEW-FIX-...
Files changed:
- `path` — delivered behavior
Verification:
- `command` — pass, fail, or blocked with key output
Commit SHA: `<full SHA>` | not authorized | none — blocked before commit
Residual risks: none | specific remaining risk or blocker
```

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
