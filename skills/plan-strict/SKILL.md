---
name: plan-strict
description: Strict planning workflow that must execute the full scout → spec → planner → review → execute → review sequence. Use when asked to "follow the workflow exactly", "use the strict plan workflow", "plan this strictly", "do the full planning flow", or when the user wants the plan process enforced without shortcuts.
---

# Plan Strict

Run the full planning workflow without skipping phases.

## Core Rule

If this skill is invoked, do not answer the user's request directly from the main session.

- Do **not** short-circuit into a normal answer, even for review, refactor, suggestion, or analysis tasks.
- Do **not** skip scout, spec, or planner because the task seems obvious.
- Only stop early if the user explicitly tells you to stop or changes direction.
- If the workflow is already in progress, report the current phase and continue from there.

**Announce at start:** "Let me take a quick look, then I'll send a scout to map the codebase before we start the spec session."

## Tab Titles

Use `set_tab_title` at every phase transition.

| Phase | Title |
|---|---|
| Assessment | `🔍 Assessing: <short task>` |
| Scouting | `🔍 Scouting: <short task>` |
| Spec | `📝 Spec: <short task>` |
| Planning | `💬 Planning: <short task>` |
| Review plan | `📋 Review: <short task>` |
| Executing | `🔨 Executing: 1/N — <short task>` |
| Reviewing | `🔎 Reviewing: <short task>` |
| Done | `✅ Done: <short task>` |

Subagent names:
- Scout: `🔍 Scout`
- Spec: `📝 Spec`
- Planner: `💬 Planner`
- Workers: `🔨 Worker 1/N`, `🔨 Worker 2/N`, etc.
- Reviewer: `🔎 Reviewer`

## Phase 1: Quick Assessment

Spend about 30 seconds orienting yourself in the repo before spawning the scout.

Use lightweight commands such as:

```bash
ls -la
find . -type f -name "*.ts" | head -20
cat package.json 2>/dev/null | head -30
```

Gather only enough context to aim the scout.

## Phase 2: Scout

Always spawn a scout before spec/planner.

```typescript
subagent({
  name: "🔍 Scout",
  agent: "scout",
  task: "Analyze the codebase for [user request area]. Map file structure, key modules, patterns, conventions, and existing code related to [feature area]. Focus on what a spec agent and planner need to understand. Write a context artifact before exiting.",
})
```

Wait for the scout to finish.

### Required verification before advancing

Do not continue until the scout has produced an artifact path or an equivalent concrete deliverable you can read.

If the scout exits without the required output:
1. stop,
2. relaunch with tighter instructions,
3. or inspect the scout session,
4. then recover before moving on.

Do **not** fabricate scout findings.

Read the scout artifact and pass its contents to spec and planner.

## Phase 3: Spec

Spawn the interactive spec agent with the scout context.

```typescript
subagent({
  name: "📝 Spec",
  agent: "spec",
  interactive: true,
  task: `Define spec: [what the user wants to build]\n\nScout context:\n[paste scout findings here]`,
})
```

The user works with the spec agent. When done, they close it and return the spec artifact path.

### Required verification before advancing

Do not continue until you have the actual spec artifact path.

If the spec agent exits without the artifact:
1. stop,
2. relaunch or inspect the session,
3. recover,
4. then continue.

Do **not** invent a spec summary.

## Phase 4: Planner

Read the spec artifact first, then spawn the planner with both the spec path and scout context.

```typescript
read_artifact({ name: "specs/YYYY-MM-DD-<name>.md" })

subagent({
  name: "💬 Planner",
  agent: "planner",
  interactive: true,
  task: `Plan implementation for spec: specs/YYYY-MM-DD-<name>.md\n\nScout context:\n[paste scout findings here]`,
})
```

The planner focuses on HOW, not re-clarifying WHAT.

### Required verification before advancing

Do not continue until you have:
- the actual plan artifact path, and
- the created todos.

If the planner exits without either one:
1. stop,
2. relaunch or inspect the session,
3. recover,
4. then continue.

Do **not** improvise missing planning output.

### Optional re-scout

If scope changed materially, spawn a follow-up scout focused on the newly relevant areas and include that context in worker tasks.

## Phase 5: Review Plan & Todos

Read the plan and list todos.

```typescript
read_artifact({ name: "plans/YYYY-MM-DD-<name>.md" })
todo({ action: "list" })
```

Review with the user:

> "Here's what the planner produced: [brief summary]. Ready to execute, or anything to adjust?"

Do not start execution before this review step unless the user explicitly tells you to continue.

## Phase 6: Execute Todos

Run workers sequentially in the same repo.

```typescript
subagent({
  name: "🔨 Worker 1/N",
  agent: "worker",
  task: "Implement TODO-xxxx. Mark the todo as done. Plan: [plan path]\n\nScout context: [paste scout summary]",
})
```

After each worker finishes:
1. verify the result,
2. then launch the next worker.

Never run repo-writing workers in parallel.

## Phase 7: Review

After all execution todos are complete, launch the reviewer.

```typescript
subagent({
  name: "🔎 Reviewer",
  agent: "reviewer",
  interactive: false,
  task: "Review the recent changes. Plan: [plan path]",
})
```

Triage findings:
- **P0** — fix now
- **P1** — fix before merge
- **P2** — fix if quick, otherwise note
- **P3** — skip

If reviewer fixes are required, create follow-up todos, execute them sequentially, and re-review if the fixes were substantial.

## Self-check before every phase handoff

Before you claim a phase is complete, verify the evidence.

- **Scouting complete?** Confirm the scout actually ran and produced the required artifact/result.
- **Spec complete?** Confirm the spec agent actually ran and produced the spec artifact.
- **Planning complete?** Confirm the planner actually ran, the plan artifact exists, and todos were created.
- **Execution complete?** Confirm all planned execution todos are closed.
- **Review complete?** Confirm the reviewer actually ran and any P0/P1 findings were addressed.
- **Done?** Confirm all required phases happened in order and nothing was skipped.

## Exit Checklist

Before reporting done:

1. Scout ran before spec/planner.
2. Scout context was passed to spec and planner.
3. Scout/spec/planner each produced their required artifact/result before you advanced.
4. Plan review happened before worker execution.
5. Workers ran sequentially.
6. All worker todos are closed.
7. Reviewer ran.
8. Reviewer findings were triaged and addressed.
