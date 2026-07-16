---
name: code-simplifier
description: Simplify defined code for clarity and maintainability while preserving behavior and following project conventions.
license: Apache-2.0 AND MIT
---

<!--
Based on Anthropic's code-simplifier agent:
https://github.com/anthropics/claude-plugins-official/blob/main/plugins/code-simplifier/agents/code-simplifier.md

Merged with Addy Osmani's agent-skills code-simplification skill:
https://github.com/addyosmani/agent-skills/tree/main/skills/code-simplification
-->

# Code Simplifier

Simplify code by reducing unnecessary complexity while preserving exact behavior. The goal is not fewer lines; it is code that another engineer can understand, modify, and debug faster.

## When to use

- Code works but feels heavier than necessary.
- A review flags readability or complexity issues.
- You encounter deeply nested logic, long functions, unclear names, or duplication.
- You are cleaning up recently modified code after a feature or bug fix.
- The user asks to simplify, clean up, refactor for clarity, or improve readability.

Do not use this skill when you do not understand the code yet, when the code is already clear, when the code is about to be replaced, or when simplification would make performance-critical code measurably slower.

## Core principles

### 1. Preserve behavior exactly

Never change what the code does, only how it expresses it. Preserve inputs, outputs, side effects, error behavior, ordering, performance characteristics that matter, and public APIs.

Before every change, ask:

- Does this produce the same output for every input?
- Does this maintain the same error behavior?
- Does this preserve side effects and ordering?
- Do existing tests still pass without modification?

If you are not sure, read more context or leave the code unchanged.

### 2. Follow project standards

Read applicable project convention files before changing style: `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `.clinerules`, `.github/copilot-instructions.md`, and relevant `.claude/rules/` or `.cursor/rules/` files.

Match nearby code for imports, typing, naming, error handling, formatting, framework patterns, and test style. Simplification that breaks local consistency is churn.

### 3. Prefer clarity over cleverness

Explicit code is usually better than compact code that requires a mental pause.

Simplify by:

- Reducing unnecessary nesting and branching.
- Eliminating redundant code and speculative abstractions.
- Improving names to describe intent and content.
- Consolidating related logic.
- Removing comments that restate obvious code.
- Keeping comments that explain non-obvious intent.
- Replacing nested ternaries with clearer control flow.

### 4. Maintain balance

Avoid over-simplification:

- Do not inline a helper that gives an important concept a name.
- Do not merge unrelated responsibilities into one function.
- Do not remove useful abstractions just to reduce line count.
- Do not remove validation, authorization, error handling, logging, or tests because they make code shorter.
- Do not introduce clever one-liners where a simple multi-line version is easier to read.

### 5. Scope to what changed

Default to recently modified or user-specified code. Avoid drive-by refactors outside scope unless explicitly asked. Keep simplification diffs reviewable and separate from feature work when practical.

## Simplification process

### Step 1: Understand before touching

Apply Chesterton's Fence: do not remove or rewrite something until you understand why it exists.

Before simplifying, answer:

- What is this code's responsibility?
- What calls it and what does it call?
- What are the edge cases and error paths?
- What tests define expected behavior?
- Why might it have been written this way: performance, platform constraint, history, compatibility?
- Does `git blame` or nearby code reveal important context?

### Step 2: Identify concrete opportunities

Look for specific signals.

| Pattern | Signal | Possible simplification |
|---|---|---|
| Deep nesting | Control flow is hard to follow | Guard clauses or extracted predicates |
| Long functions | Multiple responsibilities | Split into focused functions |
| Nested ternaries | Mental stack required | If/else, switch, lookup map, or named helper |
| Boolean flags | `doThing(true, false)` | Options object or separate named functions |
| Repeated conditionals | Same branch shape everywhere | Predicate, dispatcher, or explicit model |
| Generic names | `data`, `result`, `temp` | Domain-specific names |
| Misleading names | Name hides mutation or I/O | Rename to reflect behavior |
| Duplicated logic | Same code in multiple places | Shared helper in the right layer |
| Dead code | Unused, unreachable, commented-out blocks | Remove after confirming |
| Pass-through wrappers | No added meaning | Inline or delete |
| One-use abstractions | Strategy/factory with one implementation | Replace with direct code |
| Redundant casts | Type already inferred | Remove assertion |

### Step 3: Apply changes incrementally

Make one coherent simplification at a time. Run the narrowest relevant verification after each risky change. If tests fail, revert and reassess.

For large mechanical refactors, prefer automation such as codemods or AST transforms. Manual edits across hundreds of lines are error-prone and hard to review.

### Step 4: Verify the result

After the pass, compare before and after:

- Is the new version genuinely easier to understand?
- Did behavior remain unchanged?
- Did error handling and validation remain intact?
- Does the code follow local conventions?
- Is the diff focused and reviewable?
- Would a reviewer approve this as a net improvement?

If the simplified version is harder to understand or review, revert it.

## Rails-specific guidance

When simplifying Ruby on Rails code, prefer Rails conventions and the existing application architecture over generic object-oriented patterns.

### Respect Rails conventions

- Check the Rails version, `Gemfile`, `.rubocop.yml`, and nearby code before applying Rails-specific changes.
- Prefer framework conventions for file placement, naming, routing, associations, validations, callbacks, jobs, mailers, policies, and helpers.
- Consider service objects or action objects for workflows that coordinate multiple models, external side effects, transactions, or steps that do not belong to one record.
- Do not introduce form objects, presenters, or concerns just to reduce line count. Use them only when the project already has that pattern or the logic clearly has that responsibility.
- Do not rename models, routes, database columns, associations, or public methods unless the user explicitly asks for that behavioral change.

### Controllers

- Keep controller actions focused on HTTP concerns: loading records, authorizing, calling domain behavior, and rendering or redirecting.
- Move business workflows out of controllers when they coordinate multiple steps.
- Keep strong parameters explicit and close to their use.
- Prefer symbolic HTTP statuses such as `:not_found` over numeric codes.
- Keep `before_action` declarations narrowly scoped and easy to trace.

### Models and Active Record

- Prefer declarative Rails APIs over hand-rolled logic: associations, validations, enums, scopes, callbacks, and query methods.
- Keep macros grouped in the project's conventional order.
- Prefer modern validation style: `validates :email, presence: true`.
- Keep callbacks small, ordered by lifecycle, and limited to lifecycle work.
- Use scopes for simple reusable query fragments; use class methods for parameter-heavy relation builders.
- Prefer `find(id)` when absence should raise, `find_by(...)` for nullable lookups, and `exists?` for existence checks.
- Prefer hash conditions and bound parameters over interpolated SQL.
- Prefer `pluck`, `pick`, and `ids` when only scalar values are needed.
- Use `find_each` or batch APIs for large record iteration. Do not replace them with `each` unless the collection is intentionally loaded.
- Preserve eager loading unless you verify it is unnecessary.
- Be careful with `count`, `size`, and `length`; preserve current query/loading behavior.
- Use bang persistence methods when failure should raise, or explicitly handle false returns when it should not.

### Views, helpers, jobs, and migrations

- Keep database queries and business decisions out of views.
- Prefer partials and collection rendering when it improves clarity.
- Keep helpers presentation-focused.
- Use jobs for asynchronous side effects that do not belong in request/response paths.
- Keep migrations reversible when practical and preserve safety options such as indexes, constraints, foreign keys, and `dependent:` behavior.
- Do not combine schema refactors with broad data rewrites unless explicitly requested or already conventional.

## Examples

### Nested ternary

```typescript
// Before
const status = isLoading ? 'loading' : hasError ? 'error' : isComplete ? 'complete' : 'idle';

// After
function getStatus(isLoading: boolean, hasError: boolean, isComplete: boolean): string {
  if (isLoading) return 'loading';
  if (hasError) return 'error';
  if (isComplete) return 'complete';
  return 'idle';
}
```

### Dense chained reduce

```typescript
// Before
const result = items.reduce((acc, item) => ({
  ...acc,
  [item.id]: { ...acc[item.id], count: (acc[item.id]?.count ?? 0) + 1 },
}), {});

// After
const countById = new Map<string, number>();
for (const item of items) {
  countById.set(item.id, (countById.get(item.id) ?? 0) + 1);
}
```

### Rails scalar query

```ruby
# Before
user_emails = User.active.map(&:email)

# After
user_emails = User.active.pluck(:email)
```

### Rails bound query

```ruby
# Before
orders = Order.where("status = '#{params[:status]}'")

# After
orders = Order.where(status: params[:status])
```

## Verification checklist

- [ ] Existing tests pass without modification.
- [ ] Build/type/lint/format checks pass where relevant.
- [ ] Behavior, error handling, and side effects are preserved.
- [ ] The diff is focused and free of unrelated changes.
- [ ] Project conventions and nearby patterns are followed.
- [ ] No security checks, validations, authorization, or logging were weakened.
- [ ] No dead code, unused imports, or commented-out experiments remain.

## Common rationalizations

| Rationalization | Reality |
|---|---|
| "Fewer lines is simpler" | Simplicity is comprehension speed, not line count. |
| "I'll simplify unrelated code too" | Unscoped cleanup creates noisy diffs and regression risk. |
| "The abstraction might be useful later" | Speculative abstraction is current complexity. Re-add it when needed. |
| "I'll refactor while adding this feature" | Mixed feature/refactor diffs are harder to review and revert. |
| "The original author had a reason" | Maybe. Verify the reason before preserving or removing it. |

## Red flags

- Tests need changes for a claimed behavior-preserving refactor.
- Error handling or validation disappears.
- The new version is cleverer than the old one.
- Renames reflect personal preference rather than project convention.
- Many simplifications are batched into one hard-to-review diff.
- Work spreads beyond the requested scope without approval.
