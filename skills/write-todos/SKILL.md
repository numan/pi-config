---
name: write-todos
description: Convert an approved plan or defined scope into dependency-ordered, independently verifiable, worker-ready todos.
license: MIT
---

<!--
Merged with Addy Osmani's agent-skills planning-and-task-breakdown skill:
https://github.com/addyosmani/agent-skills/tree/main/skills/planning-and-task-breakdown
-->

# Write Todos

Break work into small, ordered, verifiable tasks, then write todos that a worker agent can execute without access to the planning conversation. Every todo must be self-contained: a worker reading only the todo body, referenced plan artifact, and existing code should produce the correct result.

## When to use

- You have a spec or clear requirements and need implementable tasks.
- A task feels too large or vague to start.
- Work needs dependency ordering or parallelization.
- You need to communicate scope to a human or worker agent.
- You are creating todos from a plan.

Do not use for single-file changes with obvious scope, or when a plan already contains well-scoped, worker-ready todos.

## Planning process

### 1. Stay read-only while planning

Before writing todos or code:

- Read the spec, plan, and relevant codebase sections.
- Identify existing patterns and conventions.
- Map dependencies between components.
- Note risks, unknowns, and required human decisions.

Do not implement during planning. The output is an ordered plan/todo set.

### 2. Identify the dependency graph

Map what depends on what, then order tasks from foundations upward.

```text
Database schema
    │
    ├── Shared types / API contracts
    │       │
    │       ├── Validation logic
    │       ├── API endpoints
    │       │       └── API client
    │       │               └── UI components
    │       └── Tests
    │
    └── Seed data / migrations
```

Foundational shared contracts come before consumers. High-risk tasks should happen early enough to fail fast.

### 3. Prefer vertical slices when possible

Avoid task lists that build every layer horizontally before anything works.

Bad:

```text
Task 1: Build all database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

Better:

```text
Task 1: User can register (schema + endpoint + UI + test)
Task 2: User can log in (auth endpoint + UI + test)
Task 3: User can create a task (task model + endpoint + UI + test)
Task 4: User can view tasks (query + endpoint + UI + test)
```

Each slice should leave the system in a working, testable state.

### 4. Size tasks for one worker session

Each todo should be one focused unit of work that a worker can complete, verify, and commit in one session.

| Size | Files | Scope | Guidance |
|---|---:|---|---|
| XS | 1 | Single function/config change | Good |
| S | 1-2 | One component or endpoint | Good |
| M | 3-5 | One feature slice | Good |
| L | 5-8 | Multi-component feature | Split if possible |
| XL | 8+ | Too large | Break down further |

Break a task down further if it would take more than one focused session, touches independent subsystems, has more than a few acceptance criteria, or contains "and" in the title.

### 5. Add checkpoints

After every 2-3 related tasks or each major phase, add a checkpoint:

```markdown
## Checkpoint: Foundation complete
- [ ] All foundation tests pass
- [ ] Application builds without errors
- [ ] Core contract reviewed before consumers are implemented
```

Checkpoints keep long plans from drifting.

## Todo structure

Every todo body should follow this structure:

```markdown
**Plan:** `plans/YYYY-MM-DD-<name>.md`

## What
[One paragraph: what this todo produces and why it matters]

## Dependencies
- [Todo numbers or files this depends on, or "None"]

## Constraints
- [Explicit architectural constraints that MUST be followed]
- [Libraries/patterns to use — or explicitly NOT use]
- [Reference existing code patterns: "Follow the pattern in src/foo.ts"]

## Files
- `src/path/to/file.ts` — [what this file does]
- `src/path/to/other.ts` — [what this file does]

## Expected Outcome
[Concrete description of what the finished code looks like]

### Example
[Short code snippet showing expected imports, patterns, and structure]

## Acceptance Criteria
- [ ] [Specific, verifiable criterion]
- [ ] [Another criterion]
- [ ] [Build/lint/test command passes]

## Verification
- [ ] `command to run`
- [ ] Manual check: [what to verify, if applicable]
```

## Rules for worker-ready todos

### 1. Constraints are explicit, not implied

If the plan says "use Effect v4 for services," every relevant todo must repeat it.

| Bad | Good |
|---|---|
| "Build the EventBus service" | "Build EventBus as an Effect v4 service. Import from `effect`. Use `Effect.gen`, `Layer`, and `Context.Tag`; do not use plain classes." |
| "Add WebSocket support" | "Add WebSocket support using the `ws` package. Do not use `socket.io`." |
| "Create the component" | "Create the component using React 19 and Tailwind v4 utilities. No CSS modules or styled-components." |

### 2. Examples show the real shape

Include a small code example when implementation style matters.

```markdown
### Example

The service should look like this, not like a plain class:

\```typescript
import { Effect, Context, Layer } from "effect"

class EventBus extends Context.Tag("EventBus")<EventBus, {
  readonly subscribe: (topic: string) => Effect.Effect<Subscription>
  readonly publish: (event: PiEvent) => Effect.Effect<void>
}>() {}

const EventBusLive = Layer.effect(EventBus, Effect.gen(function* () {
  // implementation using Effect primitives
}))
\```
```

Without examples, workers default to common patterns they already know, which may not match the plan.

### 3. Anti-patterns are named

If a wrong approach looks plausible, call it out:

```markdown
## Constraints
- Use Effect v4 services with `Context.Tag` and `Layer`.
- **Do NOT** use plain classes with manual observer patterns.
- **Do NOT** use `useSyncExternalStore` with hand-rolled subscriptions.
```

### 4. Each todo is self-contained

A worker reads the todo body, the referenced plan, and existing code. Do not rely on hidden planning-chat context.

Each todo must:

- Reference the plan path.
- List all likely files to create or modify.
- Note existing files to read for examples.
- Repeat architectural constraints relevant to that task.
- Include dependencies and ordering.

### 5. Acceptance criteria are verifiable

| Vague | Verifiable |
|---|---|
| "Code is clean" | "`vp check` passes with no errors" |
| "Works correctly" | "Running `node -e 'import { EventBus } from "./src/services/EventBus"'` succeeds" |
| "Tests pass" | "`vp test src/core/EventNode.test.ts` passes" |
| "Follows conventions" | "All imports use `effect`; no plain `new EventBus()` instantiation" |

## Plan document template

Use this when the user needs a full plan before todo creation:

```markdown
# Implementation Plan: [Feature/Project Name]

## Overview
[One paragraph summary]

## Architecture Decisions
- [Decision and rationale]

## Task List

### Phase 1: Foundation
- [ ] Task 1: ...
- [ ] Task 2: ...

### Checkpoint: Foundation
- [ ] Tests pass and build is clean

### Phase 2: Core Features
- [ ] Task 3: ...
- [ ] Task 4: ...

### Checkpoint: Core Features
- [ ] End-to-end flow works

### Phase 3: Polish
- [ ] Task 5: ...

## Risks and Mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| [Risk] | [High/Med/Low] | [Strategy] |

## Open Questions
- [Question needing human input]
```

## Parallelization guidance

- **Safe to parallelize:** independent feature slices, tests for already-implemented features, documentation, isolated components with stable contracts.
- **Must be sequential:** database migrations, shared contracts, shared state changes, dependency chains.
- **Needs coordination:** work sharing an API contract; define the contract first, then parallelize consumers.

## Checklist before creating todos

Before calling `todo(action: "create")`, verify:

- [ ] Every task has acceptance criteria.
- [ ] Every task has a verification step.
- [ ] Dependencies are identified and ordered correctly.
- [ ] No task is XL-sized or touches too many independent subsystems.
- [ ] Checkpoints exist between major phases.
- [ ] Every architectural decision appears as an explicit constraint in relevant todos.
- [ ] Every todo has a code example when shape/pattern matters.
- [ ] No todo relies on planning-conversation context only.
- [ ] Anti-patterns are named where workers might drift.
- [ ] The human has reviewed and approved the plan when approval is required.

## Common red flags

- Starting implementation without a written task list.
- Tasks that say "implement the feature" without acceptance criteria.
- No verification steps.
- All tasks are large horizontal layers.
- Dependency order is ignored.
- Todos omit important constraints from the plan.
- Todos lack examples for non-obvious architecture.
- Acceptance criteria are subjective instead of command-checkable.
