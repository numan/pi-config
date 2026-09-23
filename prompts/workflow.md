---
description: Approved planning, sequential implementation, and independent review
argument-hint: "<what-to-build>"
---

Run the full planning workflow for: `$ARGUMENTS`.

## Ownership and state

The coordinator owns approvals, implementation and cleanup orchestration, task
acceptance, state, and the review record. The planner only plans; `code-quality`
only proposes cleanup findings/checklists; reviewers only report findings.

Keep state in the plan: approved revision, repository, branch, starting HEAD,
review base SHA, ordered todo IDs, accepted commit SHAs, current stage, repair
rounds used, and pending decisions. Identify approval by a commit SHA or content
hash of the plan and breakdown, excluding mutable state. Update after accepted
handoffs. On resume, reconcile Git, todos, and state before continuing.

After approval, continue autonomously until complete, an explicit approval gate,
a material scope or risk decision, or a concrete blocker. Renew plan approval
only for material scope or design changes.

## Orchestration

Children pause with `subagent_wait({reason})` for user input or required child
results. Finish with `subagent_done({summary})`, not a preceding final answer.

1. Inspect project instructions and reuse current evidence. Record repository,
   branch, starting HEAD, and pre-existing worktree changes. Default review base
   to starting HEAD; record a different base before approval when the request
   includes pre-existing branch changes. Inspect relevant surrounding code regardless.
2. Apply the global delegation rule for substantial independent investigations.
   Gather coupled facts directly. Read all required results and artifacts.
3. Spawn interactive `planner` with the request, constraints, evidence, target
   plan path, and completion contract. Require a validated, worker-ready plan and
   proposed todo breakdown. Resolve routine choices autonomously and clarify
   only material ambiguity. This workflow owns the single concrete-plan approval;
   no separate approach checkpoint or actionable todo creation.
4. Read the plan and proposed todos. Merge or remove duplicate verification,
   generic QA, audit, review, cleanup, and final-validation items. Every todo
   must own a product, test, documentation, migration, configuration, or
   operational artifact. Update the plan to match, present both, and obtain
   explicit approval before creating actionable todos or implementing.
5. Create todos exactly from the approved breakdown, preserving dependencies
   and order. Execute sequentially through `worker` agents in the same repository.
   Supply one todo, plan path, relevant context, and the worker completion
   contract below. Apply its acceptance checks before proceeding.
6. Run `reviewer` in fresh context with the approved plan, acceptance criteria,
   exact base/head SHAs, verification evidence, and accepted risks. This is the
   sole independent review stage, including focused repair and cleanup follow-ups.

   Inspect the diff, changed tests, callers, and verification evidence directly;
   verify summaries. Rerun checks only for missing/inconsistent evidence, changed
   code, or specific unresolved regression risks. Apply `code-reviewer` thresholds
   and output contract; no findings is valid, and missing evidence is uncertainty.

   The coordinator alone maintains `${PI_SESSION_FILE%.jsonl}.review.md` when
   `PI_SESSION_FILE` exists. Record attempts, reviewed SHAs, dispositions, and
   repair results before continuing. Mark findings fixed, explicitly accepted,
   deferred if non-blocking, or dismissed with evidence. Unresolved P0 and
   unaccepted P1 block completion. P2 does not block or silently expand scope.

   Before creating repair todos, assess normal-use likelihood, impact, affected
   users, frequency, system containment, acceptance-criterion violations, repair
   complexity, and blast radius.

   Allow up to three autonomous repair rounds workflow-wide, including cleanup:
   one batch then focused review. Initialize counter to zero; increment before
   each batch, including failures/interruptions. Never reset across resumes/stages.
   Repeat only for eligible unresolved findings within budget and approval boundaries.

   Within approved scope and existing approval boundaries, automatically repair
   P0 and P1 involving security, authorization, data integrity, financial
   correctness, irreversible effects, or direct requirement violations.
   Other P1 requires a user decision; present rare, timing-dependent,
   backend-contained scenarios as risk-acceptance
   candidates before creating repair todos.

   Request a decision before fourth or subsequent repair rounds, or when repairs
   require a new state machine/cross-cutting abstraction, materially exceed the
   implementation, or create comparably severe findings. Offer applicable choices:
   accept P1 risk, authorize repairs, or approve reverting to the simpler design.
   P0 acceptance cannot permit completion. Review repair diffs and affected
   behavior; reopen settled findings only with new evidence.
7. Always spawn `code-quality` after review and repairs, supplying the plan,
   review base, current HEAD, verification evidence, accepted risks, and
   completion contract. Require behavioral-equivalence
   evidence and official documentation for version-sensitive recommendations.
   Override its approval/execution workflow: return findings and a proposed
   cleanup checklist only; no approval requests, actionable todos, edits, or workers.

   Require `subagent_done({summary})` with reviewed SHAs, concrete files and
   evidence, and the smallest behavior-preserving changes, benefits, and
   validation. Apply step 6's thresholds; no improvements means no checklist.

   Record findings and dispositions in step 6's review record; route defects
   through step 6. For cleanup, present one checklist and proposed todo breakdown,
   and obtain explicit user approval before creating actionable todos or
   implementing. If none is proposed or cleanup is declined, record that and
   continue without edits or further approval requests.

   Run approved cleanup todos sequentially through workers, one todo each,
   under the same completion contract and acceptance checks. Review cleanup
   diffs and affected behavior through step 6; record the resulting HEAD.

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
