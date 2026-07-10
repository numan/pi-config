---
description: Break work into small verifiable tasks with acceptance criteria and dependency ordering
argument-hint: "[feature-or-spec]"
---

Invoke the `write-todos` skill.

Read the existing spec, plan, or requirements for `$ARGUMENTS`, plus relevant codebase sections. Then:

1. Enter plan mode: read only, no implementation changes.
2. Identify the dependency graph between components.
3. Prefer vertical slices: one complete path per task, not broad horizontal layers.
4. Write tasks/todos with explicit constraints, acceptance criteria, verification steps, dependencies, and likely files.
5. Include examples when implementation shape matters.
6. Add checkpoints between phases.
7. Present the plan/todos for human review and wait for explicit approval before implementation.

Save durable artifacts in the project-appropriate planning location. If no project convention exists, use `tasks/plan.md` and `tasks/todo.md`.
