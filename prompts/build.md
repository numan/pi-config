---
description: Implement approved tasks incrementally with behavioral validation and scoped commits
argument-hint: "[auto|all]"
---

Invoke `incremental-implementation`, `test-driven-development` when behavior is
changing, and `commit` before each authorized commit. In automatic mode, invoke
`write-todos` when the specification has no implementation plan.

`$ARGUMENTS` selects the mode:

- Empty: implement the next approved pending task, validate it, commit it, update
  its status, and stop.
- `auto` or `all`: create a plan from the specification when needed, obtain one
  explicit approval of the concrete plan, then execute every task in dependency
  order without pausing between successful tasks.

Before editing, inspect project instructions, the task, relevant code and tests,
and the working tree. Preserve unrelated user changes.

For each task:

1. Confirm its scope and observable acceptance criteria.
2. Add a failing behavioral test first when practical.
3. Implement the smallest complete change.
4. Run the most relevant tests and affected checks.
5. Load `commit`, commit only that task's changes, and update the todo.

In automatic mode, require a real specification. Reuse an existing approved
plan when available. Otherwise use `write-todos` to create worker-ready tasks,
present the full concrete plan, and wait for exactly one explicit approval
before execution. Don't add another routine approval between successful tasks.
Stop only for a material ambiguity, unauthorized scope expansion, destructive
action, validation failure without a grounded fix, or a working-tree conflict
that risks unrelated changes.

Finish with tasks completed, commits, validation evidence, skipped work, and
blockers.
