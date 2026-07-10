---
description: Full planning workflow — scout, interactive spec/planning, execute todos, run code quality, and review
argument-hint: "<what-to-build>"
---

# Plan

A planning workflow that separates WHAT (spec) from HOW (plan). First clarify intent and requirements with the user, then figure out the technical approach and create todos.

**User request:** `$ARGUMENTS`

**Announce at start:** "Let me take a quick look, then I'll send a scout to map the codebase before we start the spec/planning session."

---

## Tab Titles

If a tab-title tool is available, use it to keep the user informed of progress in the multiplexer UI. Update the title at every phase transition.

| Phase         | Title example                                                  |
| ------------- | -------------------------------------------------------------- |
| Assessment    | `🔍 Assessing: <short task>`                                   |
| Scouting      | `🔍 Scouting: <short task>`                                    |
| Spec          | `📝 Spec: <short task>`                                        |
| Planning      | `💬 Planning: <short task>`                                    |
| Review plan   | `📋 Review: <short task>`                                      |
| Executing     | `🔨 Executing: 1/3 — <short task>` (update counter per worker) |
| Code quality  | `✨ Quality: <short task>`                                     |
| Reviewing     | `🔎 Reviewing: <short task>`                                   |
| Done          | `✅ Done: <short task>`                                        |

Name subagents with context too:

- Scout: `"🔍 Scout"`
- Spec/planning: `"💬 Planner"`
- Workers: `"🔨 Worker 1/3"`, `"🔨 Worker 2/3"`, etc.
- Code quality: `"✨ Code Quality"`
- Reviewer: `"🔎 Reviewer"`

---

## The Flow

```text
Phase 1: Quick Assessment (main session — 30s orientation)
    ↓
Phase 2: Scout (autonomous — deep codebase context)
    ↓
Phase 3: Interactive Spec/Planning Agent (clarifies WHAT, figures out HOW, has scout context)
    ↓
    Optional: Re-scout if spec/planner significantly changed scope
    ↓
Phase 4: Review Plan & Todos (main session)
    ↓
Phase 5: Execute Todos (workers — receive plan + scout context)
    ↓
Phase 6: Code Quality Pass (interactive — proposes and applies approved cleanup)
    ↓
Phase 7: Review
```

---

## Phase 1: Quick Assessment

Quick orientation — just enough to give the scout a focused mission:

```bash
ls -la
find . -type f -name "*.ts" | head -20  # or relevant extension
cat package.json 2>/dev/null | head -30
```

Spend ~30 seconds. You're looking for: tech stack, project shape, and the area relevant to the user's request. This tells you what to ask the scout to focus on.

---

## Phase 2: Scout

**Always spawn a scout before spec/planner.** The scout's context feeds the planning session — it helps the planner ask better questions and make better design decisions.

```typescript
subagent({
  name: "🔍 Scout",
  agent: "scout",
  task: "Analyze the codebase for [user's request area]. Map file structure, key modules, patterns, conventions, and existing code related to [feature area]. Focus on what a spec/planner would need to understand.",
});
```

**Wait for the scout to finish.** Read the scout's context artifact or summary — you'll pass it to the planner.

---

## Phase 3: Spawn Interactive Spec/Planning Agent

Spawn the interactive planner with the scout's context. The planner clarifies WHAT to build, explores the technical approach, validates design, runs a premortem, writes the plan, and creates todos with mandatory code examples/references.

```typescript
subagent({
  name: "💬 Planner",
  agent: "planner",
  interactive: true,
  task: `Plan workflow for: [what the user wants to build]

Clarify requirements and success criteria first, then plan the implementation approach.

Scout context:
[paste scout findings here — file structure, conventions, patterns, relevant code]`,
});
```

**The user works with the planner.** When done, the planner returns the plan and todos or the paths to the artifacts.

### Optional: Re-scout after planning

If the spec or planner significantly changed scope, spawn another scout targeting the new areas:

```typescript
subagent({
  name: "🔍 Scout (updated scope)",
  agent: "scout",
  task: "The plan changed scope. Gather context for [new areas]. Read the plan at [plan path]. Focus on [specific files/modules the planner identified that weren't in the original scout].",
});
```

Fold the new context into the worker tasks.

---

## Phase 4: Review Plan & Todos

Once the planner closes, read the plan and todos. If todos were created with the todo tool, list them:

```typescript
todo({ action: "list" });
```

Review with the user:

> "Here's what the planner produced: [brief summary]. Ready to execute, or anything to adjust?"

Do not start execution until the concrete plan/todos have been shown and explicitly approved.

---

## Phase 5: Execute Todos

Spawn workers sequentially. Each worker gets the plan path and scout context:

```typescript
subagent({
  name: "🔨 Worker 1/N",
  agent: "worker",
  task: "Implement TODO-xxxx. Mark the todo as done. Plan: [plan path]\n\nScout context: [paste scout summary from Phase 2, plus any re-scout from Phase 3]",
});

// Check result, then next todo
subagent({
  name: "🔨 Worker 2/N",
  agent: "worker",
  task: "Implement TODO-yyyy. Mark the todo as done. Plan: [plan path]\n\nScout context: [paste scout summary]",
});
```

**Always run workers sequentially in the same git repo** — parallel workers can conflict on commits.

---

## Phase 6: Code Quality Pass

After all implementation todos are complete, run the `code-quality` agent before final review. This catches readability, maintainability, and simplification opportunities while the branch context is still fresh.

```typescript
subagent({
  name: "✨ Code Quality",
  agent: "code-quality",
  interactive: true,
  task: "Study the current branch changes for code quality improvements. Focus only on changed code. Plan: [plan path]. Present a concrete refactor checklist and wait for explicit approval before implementing anything.",
});
```

**The user works with the code quality agent.** It must present a checklist and receive explicit approval before coordinating any refactors. If it creates or updates todos, review them before workers execute them. Let it complete approved cleanup before starting final review.

---

## Phase 7: Review

After all todos and approved code-quality cleanup are complete:

```typescript
subagent({
  name: "🔎 Reviewer",
  agent: "reviewer",
  interactive: false,
  task: "Review the recent changes. Plan: [plan path]. Include implementation and approved code-quality cleanup in scope.",
});
```

Triage findings:

- **P0** — Real bugs, security issues → fix now
- **P1** — Genuine traps, maintenance dangers → fix before merging
- **P2** — Minor issues → fix if quick, note otherwise
- **P3** — Nits → skip

Create todos for P0/P1, run workers to fix, re-review only if fixes were substantial.

---

## Completion Checklist

Before reporting done:

1. Scout ran before planner?
2. Scout context was passed to planner?
3. The plan/todos were shown to the user and explicitly approved before execution?
4. All worker todos closed?
5. Every todo has a polished commit using the `commit` skill?
6. Code quality pass ran after implementation?
7. Any code-quality checklist was explicitly approved before cleanup?
8. Reviewer has run after code-quality cleanup?
9. Reviewer findings triaged and addressed?
