---
description: Turn approved requirements into an ordered, verifiable implementation plan and worker-ready todos
argument-hint: "[feature-or-spec]"
---

Invoke `write-todos` for `$ARGUMENTS`.

Read the approved specification or requirements, project instructions, and the
relevant code and tests. Stay read-only while planning.

Produce the smallest dependency-ordered set of vertical tasks that covers the
accepted behavior. Each task must identify scope, likely files, constraints,
dependencies, observable acceptance criteria, verification, and an existing
reference or example when implementation shape isn't obvious.

Save durable planning artifacts in the project convention, or under `tasks/`
when none exists. Present the complete plan and todos, then wait for explicit
approval before implementation.
