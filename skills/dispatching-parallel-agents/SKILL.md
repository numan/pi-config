---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies using pi subagents
---

# Dispatching parallel agents

Use this skill to split independent work across multiple pi subagents and keep
this session focused on orchestration. It is intentionally standalone: it does
not replace the `pi-interactive-subagents` extension or any bundled agent
skills. It gives the dispatch pattern; the extension supplies the runtime tools.

## Core principle

Dispatch one subagent per independent problem domain. Give each subagent a
narrow, self-contained task, let them run concurrently, then integrate their
results in the main session.

With `pi-interactive-subagents`, `subagent()` is asynchronous: it returns
immediately, the child runs in its own multiplexer pane, and completion is
steered back to the parent session. Do not poll, sleep, tail logs, or repeatedly
check status. The harness wakes the parent when a child finishes or asks for
help.

## When to use

Use parallel dispatch when all of these are true:

- There are 2 or more separable problems or work streams.
- Each stream can be understood without conclusions from the others.
- Subagents will not edit the same files or mutate the same fragile state.
- The main session can integrate results after all relevant subagents return.

Good examples:

- Separate test files fail for different reasons.
- Different subsystems need reconnaissance.
- Independent docs, frontend, backend, and infrastructure checks can happen at
  the same time.
- Multiple candidate libraries or APIs need evidence-backed research.

Do not use parallel dispatch when:

- A fix in one domain is likely to change the others.
- The task needs one coherent system-wide design first.
- Subagents would race on the same files, database, dev server state,
  credentials, or external resource.
- The user wants a tightly interactive planning conversation in one pane.

## Choose the right subagent mode

Prefer named agents from the installed subagent extension when they match the
role:

- `scout` for fast codebase reconnaissance.
- `researcher` for external or deep technical research, if available.
- `worker` for implementation from a concrete todo or handoff.
- `reviewer` for code review.
- `planner` only for interactive planning, not for parallel implementation.

Use fresh, focused child sessions by default. Do not use `fork: true` for normal
parallel work, because it copies the current conversation into every child and
wastes context. Use `fork: true` only when the child truly needs the full current
conversation, such as an `/iterate`-style follow-up.

Autonomous subagents should usually be non-interactive and allowed to auto-exit
through their agent definition. Interactive subagents, such as `planner` or an
iterate fork, are user-driven and can remain open without waking the parent on
status changes.

## Pattern

### 1. Identify independent domains

Group work by ownership and likely files touched. Each group must have a clear
boundary.

Example:

- Auth scout: map login/session flow only.
- Billing scout: map subscription and invoice flow only.
- Email scout: map template/rendering flow only.

If two groups would likely edit the same file, keep them sequential or assign
one subagent to investigate while the main session decides the edit.

### 2. Prepare focused handoffs

Each subagent task needs:

- **Role:** Which agent to use and why.
- **Scope:** Exact files, subsystem, test names, issue, or artifact to inspect.
- **Goal:** The concrete outcome.
- **Constraints:** Files or behavior not to change, shared resources to avoid,
  and whether implementation is allowed.
- **Output:** A concise summary with evidence, changed files, verification run,
  and open questions.

For implementation work, prefer creating explicit todos first and assign one
todo per worker. Workers need enough context to execute without redesigning the
plan.

### 3. Spawn subagents concurrently

Call `subagent()` once per independent domain. Because the tool is async, just
issue the calls; do not wait between them unless later tasks depend on earlier
results.

```typescript
subagent({
  name: "Scout: Auth",
  agent: "scout",
  task: "Map the auth/session flow. Read relevant files only. Return key files, patterns, risks, and recommended next steps. Do not edit files."
});

subagent({
  name: "Scout: Billing",
  agent: "scout",
  task: "Map the billing/subscription flow. Read relevant files only. Return key files, patterns, risks, and recommended next steps. Do not edit files."
});

subagent({
  name: "Scout: Email",
  agent: "scout",
  task: "Map email template rendering and delivery. Read relevant files only. Return key files, patterns, risks, and recommended next steps. Do not edit files."
});
```

If the domains are truly independent, multiple tool calls can be made in the
same assistant turn. After spawning, either end the turn or work on unrelated
coordination tasks. Do not fabricate results before the harness reports them.

### 4. Handle child results as they arrive

Subagents finish independently. When each result is steered back:

1. Read the summary.
2. Note touched files, decisions, verification, and open questions.
3. Check whether it conflicts with completed or running subagents.
4. Decide whether to integrate now, wait for remaining results, or resume that
   child with extra guidance.

If a child asks for help through the subagent help flow, answer only the missing
question and resume that same session. Do not start a duplicate subagent unless
the original context is unusable.

### 5. Integrate and verify

After all relevant results arrive:

1. Review the combined diff or findings.
2. Resolve overlapping edits or contradictory recommendations.
3. Run the smallest meaningful verification first.
4. Run the broader suite or build required to support the final claim.
5. Report evidence-backed outcomes to the user.

## Prompt template

Use this structure for each child task:

```markdown
You are the [role] subagent for [domain].

Scope:
- [Files, tests, subsystem, issue, or artifact]

Goal:
- [Concrete outcome]

Constraints:
- Work only in this domain.
- Do not edit [shared files/resources] unless explicitly necessary.
- Do not spawn more subagents.
- Do not broaden the task into unrelated cleanup.

Required process:
1. Read the relevant project instructions and files before changing anything.
2. Investigate the root cause or current pattern.
3. Make only the minimal changes needed, if implementation is in scope.
4. Run targeted verification that proves your result.

Return:
- Root cause or findings.
- Files changed, if any.
- Verification command and result.
- Risks, conflicts, or questions for the parent session.
```

## Implementation example

```typescript
subagent({
  name: "Worker: Abort tests",
  agent: "worker",
  task: `Fix the failing tests in src/agents/agent-tool-abort.test.ts only.

Failures:
1. "should abort tool with partial output capture" expects "interrupted at".
2. "should handle mixed completed and aborted tools" aborts the fast tool.
3. "should properly track pendingToolCount" expects 3 results but gets 0.

These look like timing or race issues. Read the test and implementation before editing.
Do not just increase timeouts. Prefer event-based waiting or a production fix if the
implementation is wrong. Do not modify unrelated tests.

Return root cause, files changed, and verification output.`
});

subagent({
  name: "Worker: Batch completion",
  agent: "worker",
  task: `Fix the failing tests in src/agents/batch-completion-behavior.test.ts only.
Read the relevant implementation first. Keep changes limited to the batch completion
path unless evidence proves a shared root cause. Return root cause, files changed,
and verification output.`
});

subagent({
  name: "Worker: Approval races",
  agent: "worker",
  task: `Fix the failing test in src/agents/tool-approval-race-conditions.test.ts only.
Investigate why execution count is 0. Avoid unrelated refactors. Return root cause,
files changed, and verification output.`
});
```

## Common mistakes

- **Too broad:** "Fix all tests." Use one subagent per independent test file or
  subsystem.
- **Too much inherited context:** Avoid `fork: true` unless the child needs the
  whole conversation.
- **No boundaries:** State what files or resources are off limits.
- **No evidence:** Require verification commands and results.
- **Polling:** Do not watch session files or run status loops. The extension
  returns completion automatically.
- **Over-parallelizing implementation:** If workers would edit the same files,
  run them sequentially or split into investigate-only scouts first.

## Verification checklist

Before claiming the parallel work is complete, confirm:

- Every spawned subagent returned or was intentionally interrupted/resumed.
- Each result includes findings and verification, or a clear reason verification
  was not possible.
- No two subagents made conflicting edits.
- The combined diff is coherent and minimal.
- The final verification command ran in the main session and supports the claim.

## Key benefits

- **Speed:** Independent work completes concurrently.
- **Focus:** Each child has a narrow context and clear ownership.
- **Clean orchestration:** The parent session tracks decisions, not every detail.
- **Better supervision:** pi's subagent widget shows live state while async
  completion messages deliver the results when ready.
