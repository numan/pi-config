---
description: Plan and execute substantial work through scoped context gathering, explicit plan approval, sequential implementation, and independent review
argument-hint: "<what-to-build>"
---

Run the full planning workflow for: `$ARGUMENTS`.

## Outcome

Deliver the requested change with an approved plan, completed todos, relevant
validation, and an independent final review.

## Orchestration

1. Inspect project instructions and enough repository context to scope the work.
2. Spawn a `scout` only when focused codebase facts are still needed for
   planning. Wait for it and read its artifact.
3. Spawn the interactive `planner` with the user request, known constraints,
   scout evidence, a target plan path, and access to `subagent_done`. Let it
   resolve material ambiguity, get approach approval, validate the design,
   write the plan, and create todos. Instruct it to call `subagent_done`
   immediately after reporting its completed planning artifacts and todos.
4. Read and present the concrete plan and ordered todos. Wait for explicit user
   approval before implementation.
5. Execute approved todos sequentially with `worker` agents in the same
   repository. Give each worker one todo, the plan path, relevant context, and
   explicit commit authorization. Read each result before starting the next.
6. Run `code-quality` only when the resulting branch has material
   behavior-preserving simplification opportunities. Its checklist requires
   approval before cleanup.
7. Run `reviewer` after implementation and approved cleanup. Fix P0/P1 findings
   through scoped todos, then re-review when fixes are substantial.

## Boundaries

- Parallelize only independent read-heavy investigations, never shared-state
  implementation.
- Don't repeat repository exploration already supported by current evidence.
- Don't start implementation before approval of the actual plan and todos.
- Don't synthesize required subagent results until all have returned and their
  artifacts have been read.
- Keep planning, implementation, quality cleanup, and review in their named
  layers; don't silently cross between them.

## Completion

Report the plan path, todos completed, commits created, validation commands and
results, review verdict, addressed findings, and remaining risks or blockers.
