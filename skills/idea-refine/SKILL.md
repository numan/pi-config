---
name: idea-refine
description: Expand, compare, and converge vague ideas before specification. Use for ideation, concept refinement, or early assumption stress-testing.
---

# Refine an idea

Use this skill before specification when the user wants to explore alternatives
rather than commit to requirements or implementation.

Resolve relative resources against this skill's directory. If the optional idea
directory setup is useful, run:

```bash
bash <skill-dir>/scripts/idea-refine.sh
```

Replace `<skill-dir>` with this skill's absolute directory.

## Success criteria

The session produces:

- a clear target user and problem
- explicit success criteria and constraints
- two or three meaningfully different directions
- a recommended direction with tradeoffs
- load-bearing assumptions and ways to test them
- an intentionally small MVP and a `Not doing` list

## Workflow

### Understand and expand

Restate the idea as a crisp problem statement. Use `ask_user_question` when
available to resolve the target user, desired outcome, timing, and material
constraints. Ask only what is needed to make the exploration useful.

Generate a bounded set of distinct variations using relevant lenses such as
inversion, simplification, audience change, constraint removal, combination, or
scale. Don't mechanically apply every framework. When inside a repository,
inspect only enough existing context to keep ideas feasible.

### Evaluate and converge

Group promising variations into two or three directions. Compare them on:

- user value
- feasibility and hardest dependency
- differentiation
- assumptions that could invalidate the direction
- what each direction deliberately excludes

Be direct about weak ideas and unnecessary complexity. Don't turn early
enthusiasm into an implementation commitment.

### Sharpen

After the user selects a direction, produce:

```markdown
# [Idea name]

## Problem
## Recommended direction
## Success criteria
## Assumptions to validate
## MVP scope
## Not doing
## Open questions
```

Offer to save the one-pager to `docs/ideas/<idea-name>.md` or a user-supplied
path. Write it only after confirmation.

Use additional resources such as `frameworks.md`, `refinement-criteria.md`, and
`examples.md` selectively when the current decision needs them.

## Boundaries

- Don't generate a large undifferentiated idea list.
- Don't silently choose the first idea.
- Don't start specification, planning, or implementation.
- Don't save an artifact without confirmation.
- Stop once the selected direction and its assumptions are clear enough for the
  next workflow.
