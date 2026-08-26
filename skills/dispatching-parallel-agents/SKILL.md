---
name: dispatching-parallel-agents
description: Splits substantial independent work across Pi subagents and integrates their results. Use when asked to parallelize, delegate, fan out, or investigate multiple unrelated failures or subsystems. Do not use when tasks share mutable state or require sequential conclusions.
---

# Dispatching parallel agents

Finish independent work concurrently without shared-state conflicts, then
integrate and verify the combined result in the parent session.

## Decide whether to dispatch

Dispatch only when all of these are true:

- At least two substantial tasks can proceed without each other's conclusions.
- Each child can work from a self-contained handoff.
- Mutable files and resources can have one clear owner.
- Delegation will save more time or context than coordination will cost.

Do not dispatch trivial tasks, duplicate investigations, or work that needs one
coherent design first.

Treat dependencies as a graph. Dispatch tasks with no unmet dependencies in the
same wave. Wait for their results, integrate what later tasks need, then dispatch
the next wave.

## Choose the child mode

Call `subagents_list` once when the available agent definitions are unknown.
Choose the narrowest matching role rather than assuming a particular named agent
exists.

Use a fresh, focused child session by default. Use `fork: true` only when the
child needs the full parent conversation. Prefer autonomous, auto-exiting
children for bounded work and interactive children only when the user must drive
the child directly.

## Isolate mutable state

Read-only children may inspect overlapping files. Writing children must have
disjoint ownership of every mutable resource they may affect, including:

- source files, generated files, snapshots, and lockfiles
- the Git index and worktree operations
- databases, credentials, external resources, and dev servers
- build output or caches that a command may delete or rewrite

Assign shared changes to one worker or keep them in the parent session. If clean
ownership is uncertain, dispatch read-only investigation first and decide the
edits after the findings return.

## Prepare the handoff

Give each child:

- **Scope:** Exact subsystem, files, tests, issue, or artifact.
- **Goal:** One concrete outcome.
- **Mode:** Read-only investigation or implementation.
- **Ownership:** Mutable resources it owns and resources it must not change.
- **Context:** Relevant evidence, reproduction, decisions, and constraints.
- **Output:** Findings, changed files, verification, risks, and open questions.

Do not make a child rediscover decisions already made by the parent. Do not give
two children responsibility for the same outcome.

Use this compact task template:

```markdown
You are responsible for [domain].

Goal: [concrete outcome]
Scope: [files, tests, subsystem, issue, or artifact]
Mode: [read-only | implementation]
Owned resources: [files and mutable resources, or none]
Do not change: [shared files, behavior, or resources]
Context: [reproduction, evidence, and settled decisions]

Return:
- findings or root cause, with file or command evidence
- files changed, if any
- verification command and result
- conflicts, risks, or questions for the parent
```

## Dispatch and wait

Call `subagent()` once per independent task without waiting between calls. The
tool is asynchronous. Do not poll, sleep, tail logs, or repeatedly inspect
session files; completion is delivered back to the parent.

After dispatching, either work on unrelated coordination tasks or end the turn.
If no independent work remains, end the turn and wait for the harness rather
than filling the gap with speculative work.

Track every required result:

| Child | Scope | Mode | Owned resources | Required | Status |
|---|---|---|---|---|---|
| [name] | [boundary] | [read/write] | [resources] | [yes/no] | [running/done/failed] |

Do not give the final answer while a required child is still running.

## Handle results and failures

For each returned result:

1. Read the reported artifact and evidence.
2. Record findings, changed files, verification, and unresolved questions.
3. Check for conflicts with completed or running work.
4. Integrate it now only if doing so cannot interfere with another child.

Resume the same child when its existing context is useful. Do not create a
duplicate merely because a child stalled or asked for guidance. If a child exits
without its required artifact, retry once with the missing requirement stated
explicitly. If it still fails, report the gap instead of inventing a result.

## Integrate and verify

After every required child has returned or its failure has been accounted for:

1. Review every reported artifact and the combined diff.
2. Resolve overlapping edits or contradictory conclusions.
3. Run focused checks for each changed behavior.
4. Run representative parent-session verification for the integrated result.
5. Report what was proved, what failed, and any remaining risk.

Stop dispatching when another child would duplicate work, need shared writes,
depend on an unfinished result, or cost more coordination than doing the work in
the parent session.
