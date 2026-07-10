---
description: Implement tasks incrementally — build, test, verify, commit. Add "auto" to run the whole plan in one approved pass.
argument-hint: "[auto|all]"
---

Invoke the `incremental-implementation` skill alongside `test-driven-development` and `commit`.

## Modes

- `/build` — implement the next pending task, then stop: one careful slice at a time.
- `/build auto` — generate the plan if needed, get one explicit approval, then implement every task without stopping between tasks.

`$ARGUMENTS` selects the mode. Treat `auto` or `all` as autonomous mode; anything else, including empty arguments, is single-task mode. Autonomous mode does not remove verification. Every task still needs tests, checks, and its own commit.

## Default: one task

Pick the next pending task from the plan or todo list. Then:

1. Read the task's acceptance criteria.
2. Load relevant context: existing code, patterns, types, project instructions.
3. Write or update a failing test for the expected behavior when applicable.
4. Implement the minimum code to pass the test.
5. Run the relevant test suite for regressions.
6. Run the relevant build/type/lint check discovered from the project.
7. Commit with the `commit` skill.
8. Mark the task complete and stop.

## Autonomous: the whole plan (`/build auto`)

Use this once a spec exists and the user wants to collapse plan + build into one run. It removes manual stepping between tasks, not verification.

1. Require a spec. Look for `SPEC.md`, `docs/SPEC.md`, or a file under `spec/`. A README or arbitrary doc does not count. If none exists, stop and tell the user to run `/spec` first.
2. Establish a clean baseline with `git status --porcelain`. If uncommitted changes exist outside expected planning artifacts, stop and ask the user to commit, stash, or confirm handling.
3. Plan if needed. If no plan/todo artifact exists, invoke `write-todos` to generate worker-ready todos from the spec.
4. Present the full plan/todos and wait for explicit approval: "approve", "go", or "yes". Hedged responses are not approval.
5. Execute tasks in dependency order. For each task, run the full default loop and make one commit per task. Stage only files touched by that task and its task-status update.
6. Stop and ask the user when tests cannot be made to pass, the build breaks without an obvious fix, the spec is ambiguous, or the task is high-risk/irreversible.
7. Summarize tasks completed, tests added, commits made, and anything skipped or blocked.

If any step fails, follow `debugging-and-error-recovery`.
