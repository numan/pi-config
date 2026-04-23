---
name: refactor-branch-changes
description: Review and refactor changes on the current git branch. Use when asked to "refactor this branch", "clean up this branch", "simplify branch changes", "refactor the current branch", "review this diff for refactors", or "improve code on this branch". Always runs a scout → prioritized refactor todos → user approval → sequential worker implementation workflow focused on readability, simplicity, and maintainability while preserving behavior.
---

# Refactor Branch Changes

Study the current branch, identify high-value refactors in the changed code, and improve the implementation without changing behavior.

This skill must always run the workflow below in order. Do not skip ahead to editing code.

## Required workflow

1. scout and learn the current branch changes
2. create a todo list of the most impactful refactors focused on readability, simplicity, and maintainability
3. ask the user to approve the checklist
4. launch worker subagents to implement the approved todos sequentially

If the user wants recommendations only, still complete steps 1-3 and stop before step 4.

## Step 1: Scout and learn the branch

Always delegate the branch investigation to a `scout` subagent first.

The scout should:
- learn the current branch using the same evidence standard as the `learn-branch` skill
- identify the branch purpose, hotspots, risky files, and likely refactor candidates
- focus on changed code on the current branch, including uncommitted work
- ground every recommendation in actual files and diffs

Tell the scout to:
- establish the base branch and merge base
- inspect `git status --short`, commit history, diff stat, and changed files
- read the branch diff and then read the changed files directly
- read nearby `AGENTS.md`, `CLAUDE.md`, and convention files before suggesting refactors
- produce a concise branch briefing plus a shortlist of the highest-impact refactor opportunities

Do not draft todos until the scout result is back and you have reviewed it.

## Step 2: Create the refactor todo list

Turn the scout findings into a concrete todo list using the `todo` tool.

The todo list must:
- include only the most impactful refactors
- focus on readability, simplicity, and maintainability
- preserve behavior unless the user explicitly asks for behavior changes
- be sequenced so workers can implement one todo at a time
- be self-contained enough that a worker can execute each todo without the planning conversation

When writing todos:
- prefer fewer, higher-value todos over a long low-value checklist
- include specific files, expected outcomes, and acceptance criteria
- name the exact code smell or maintenance problem being improved
- avoid speculative cleanups or stylistic churn
- use the conventions from the `write-todos` skill

Prioritize this order:

| Priority | Look for | Preferred refactor |
|---|---|---|
| High | duplicated logic across changed files | extract or consolidate at the existing abstraction level |
| High | deeply nested conditionals or nested ternaries | flatten control flow with guard clauses, helper functions, or clear `if` chains |
| High | functions or components mixing multiple concerns | split by responsibility if it improves readability without scattering logic |
| High | confusing naming in new branch code | rename for intent and consistency |
| Medium | over-abstracted one-off helpers | inline or simplify |
| Medium | long transformation chains that hide intent | break into named intermediate values |
| Medium | repeated derived values or repeated work in hot paths | compute once in the right scope |
| Medium | brittle branching around nullish or optional values | simplify data flow and make assumptions explicit |
| Low | cosmetic style inconsistencies | fix only when already touching the line |

## Step 3: Ask for approval

Before any implementation work starts, present the concrete checklist to the user and explicitly ask for approval.

General intent to proceed is not enough. Phrases like "just do it", "go ahead", or "proceed" do **NOT** count as approval unless they are clearly responding to the checklist you just presented.

The required sequence is:
1. present the branch summary and concrete todo checklist
2. wait for the user's explicit approval of that checklist
3. only after that, claim the first todo or launch the first worker

This approval gate cannot be skipped.

Use this format:

```markdown
## Proposed Refactor Checklist

### Branch Summary
- Purpose: ...
- Main hotspots: ...
- Refactor direction: ...

### Todo List
1. [todo title]
   - Why: ...
   - Files: `...`
   - Expected benefit: readability | simplicity | maintainability
2. ...

Reply with approval and any edits to the checklist. I will only start implementation after approval.
```

Do not claim todos or spawn workers before the user explicitly approves the checklist.

Hard stop: if you have not yet shown the checklist in the required format and received explicit approval of that checklist, do not begin implementation.

## Step 4: Launch worker subagents sequentially

After approval, implement the todos by launching `worker` subagents one at a time, in order.

Rules:
- claim the todo before launching the worker when appropriate
- give each worker exactly one todo
- explicitly instruct the worker to validate its changes, then create a git commit for that todo before exiting
- explicitly instruct the worker to read and follow the `commit` skill when writing that commit
- wait for the worker result before starting the next todo
- if a worker reports missing context, update the todo before retrying
- do not batch multiple todos into one worker task
- after each worker finishes, review the result, note validation, and confirm the todo-specific commit was created before moving to the next todo
- close completed todos as they are finished

After all approved todos are implemented, stop with a summary of the completed refactors, affected file paths, validation results, and the per-todo commits that were created.

## Refactor principles

Apply these principles throughout the workflow:
- prefer clarity over cleverness or brevity
- remove duplication before adding abstractions
- avoid nested ternary expressions; use clear branching instead
- reduce unnecessary nesting with guard clauses and early returns
- keep helpful abstractions; remove only the ones that add indirection without value
- keep related logic together unless extracting it makes the code easier to understand
- choose explicit names for variables, helpers, and booleans
- avoid large refactors that obscure the branch's original intent
- do not add comments for obvious code
- maintain project import ordering, typing style, and framework patterns

Use this balance guide:

| If the code is... | Then... |
|---|---|
| repetitive and local | simplify inline first |
| reused in multiple changed call sites | extract a helper near the usage |
| performance-sensitive | remove redundant work without making the code harder to read |
| already simple but verbose | avoid churn for minimal gain |
| compact but hard to scan | expand it into explicit steps |

## Exit criteria

Do not stop until all relevant items are true:
- a scout subagent investigated the branch first
- the current branch changes were learned before proposing edits
- a prioritized todo checklist was created from evidence
- the user explicitly approved the checklist before implementation
- worker subagents were launched sequentially, one todo at a time
- each completed refactor stayed grounded in branch code and preserved behavior
- validation results were captured for implemented todos
- each completed todo was committed before the next worker started
- the final response clearly summarized the per-todo commits that were created
