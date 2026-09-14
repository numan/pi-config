---
description: Approved planning, sequential implementation, and independent review
argument-hint: "<what-to-build>"
---

Run the full planning workflow for: `$ARGUMENTS`.

## Ownership and state

The coordinator owns plan and cleanup-checklist approval, implementation and
cleanup orchestration, task acceptance, workflow state, and the review record.
The planner produces planning artifacts only. `code-quality` returns findings
and a proposed cleanup checklist only. Reviewers return findings without
implementing repairs.

Keep state in the plan: approved revision, repository, branch, starting HEAD,
review base SHA, ordered todo IDs, accepted commit SHAs, current stage, repair
rounds used, and pending decisions. Identify approval by a commit SHA or content
hash of the plan and breakdown, excluding mutable state. Update after accepted
handoffs. On resume, reconcile Git, todos, and state before continuing.

After approval, continue autonomously until complete, an explicit approval gate,
a material scope or risk decision, or a concrete blocker. Renew plan approval
only for material scope or design changes.

## Orchestration

1. Inspect project instructions and reuse current evidence. Record repository,
   branch, starting HEAD, and pre-existing worktree changes. Default review base
   to starting HEAD; record a different base before approval when the request
   includes pre-existing branch changes. Inspect relevant surrounding code regardless.
2. Apply the global delegation rule for substantial independent investigations.
   Gather coupled facts directly. Read all required results and artifacts.
3. Spawn interactive `planner` with the request, constraints, evidence, target
   plan path, and `subagent_done`. Require a validated, worker-ready plan and
   proposed todo breakdown. Resolve routine choices autonomously and clarify
   only material ambiguity. This workflow owns the single concrete-plan approval;
   no separate approach checkpoint or actionable todo creation. Require
   `subagent_done` immediately after reporting the planning artifact.
4. Read the plan and proposed todos. Merge or remove duplicate verification,
   generic QA, audit, review, cleanup, and final-validation items. Every todo
   must own a product, test, documentation, migration, configuration, or
   operational artifact. Update the plan to match, present both, and obtain
   explicit approval before creating actionable todos or implementing.
5. Create todos exactly from the approved breakdown, preserving dependencies
   and order. Execute sequentially through `worker` agents in the same repository.
   Supply one todo, plan path, relevant context, and the verbatim instruction
   below. Verify each contract and commit before accepting completion or
   starting the next worker.
6. Run `reviewer` in fresh context with the approved plan, acceptance criteria,
   exact base/head SHAs, verification evidence, and accepted risks. This is the
   sole independent review stage, including focused repair and cleanup follow-ups.

   Require direct inspection of the diff, changed tests, affected callers, and
   supporting verification evidence. Treat summaries as claims to verify. Rerun
   checks only for missing/inconsistent evidence, changed code, or a specific
   unresolved regression risk. Apply `code-reviewer` thresholds and output contract.
   No findings is valid; missing evidence is uncertainty, not a confirmed defect.

   The coordinator alone maintains `${PI_SESSION_FILE%.jsonl}.review.md` when
   `PI_SESSION_FILE` exists. Record attempts, reviewed SHAs, dispositions, and
   repair results before continuing. Mark findings fixed, explicitly accepted,
   deferred if non-blocking, or dismissed with evidence. Unresolved P0 and
   unaccepted P1 block completion. P2 does not block or silently expand scope.

   Before creating repair todos, assess normal-use likelihood, impact, affected
   users, frequency, system containment, acceptance-criterion violations, repair
   complexity, and blast radius.

   Allow one autonomous repair round across the workflow, including cleanup
   follow-ups: one repair batch followed by focused review. Within approved scope
   and existing approval boundaries, automatically repair P0 and P1 involving
   security, authorization, data integrity, financial correctness, irreversible
   effects, or direct requirement violations. Other P1 requires a user decision;
   present rare, timing-dependent, backend-contained scenarios as risk-acceptance
   candidates before creating repair todos.

   Request a decision before further repairs after that round, or when repairs
   require a new state machine/cross-cutting abstraction, materially exceed the
   implementation, or create comparably severe findings. Offer applicable choices:
   accept P1 risk, authorize repairs, or approve reverting to the simpler design.
   P0 acceptance cannot permit completion. Review repair diffs and affected
   behavior; reopen settled findings only with new evidence.
7. Always spawn `code-quality` after review and repairs, supplying the plan,
   review base, current HEAD, verification evidence, accepted risks, and
   `subagent_done`. Apply its agent criteria; require evidence of behavioral
   equivalence and official documentation for version-sensitive recommendations.
   Override its approval and execution workflow: this assignment produces findings
   and a proposed cleanup checklist only. It must not request approval, create
   actionable todos, edit code, or launch cleanup workers.

   Require a handoff recording reviewed SHAs, findings with concrete files and
   evidence, and a proposed checklist with the smallest behavior-preserving
   changes, expected benefits, and validation. Distinguish cleanup recommendations
   from defects and uncertainty using step 6's thresholds. Require `subagent_done`
   immediately after reporting the handoff, including when no improvements are
   needed; in that case, return no checklist or todos.

   The coordinator reads the handoff and records findings and dispositions in
   the same review record as step 6. Route defects through step 6. For cleanup,
   present one concrete checklist and proposed todo breakdown, and obtain explicit
   user approval before creating actionable todos or implementing. No improvements
   means no approval request. Record declined cleanup; continue without edits.

   The coordinator creates approved cleanup todos and runs sequential workers,
   one todo each, with the same mandatory validation, commits, and contract as
   implementation. Verify each contract and commit before accepting completion
   or launching the next worker. Review cleanup diffs and affected behavior
   through step 6; record the resulting HEAD.

## Worker completion contract

Include this instruction verbatim in every implementation, review-repair, and
cleanup worker's task message:

> You are explicitly authorized and required to commit this task's changes.
> Load the `commit` skill, validate, commit only this task's changes, and append
> the completion record with the full commit SHA to the todo before closing it.
> Do not report DONE or close the todo without successful required validation
> and a commit. If committing is blocked, report BLOCKED, append the record,
> release the todo, and leave it open.

Require this exact return contract:

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

Before acceptance or the next worker, verify the full SHA belongs to the working
branch and contains only task changes. Require DONE and successful validation.
Reject missing commits or `not authorized`; keep/reopen the todo until resolved.
Copy verified repair contracts into the review record and repair todo before
closure. Never infer completion from subagent exit or idle state.

## Boundaries and completion

Parallelize independent read-heavy investigation only, never shared-state writes.
Reuse evidence; don't create coordinator verification todos.
Keep planning, implementation, cleanup, and review in their assigned roles.

Require all workflow-owned changes committed and final review coverage of delivered
HEAD, including follow-ups. Preserve unrelated user changes; a globally clean
worktree is unnecessary. Reconcile approved todos as completed, blocked, or
explicitly cancelled with reasons. Never claim completion with required work blocked.

Report plan path, completed todos, commits, validation commands/results, review-record
path or why absent, verdict, addressed findings, repair rounds, and remaining risks.
