---
description: Simplify code for clarity and maintainability — reduce complexity without changing behavior
argument-hint: "[scope]"
---

Invoke the `code-simplifier` skill.

Simplify recently changed code, or the specified scope `$ARGUMENTS`, while preserving exact behavior:

1. Read project instructions and study local conventions.
2. Identify the target code: recent changes unless a broader scope is specified.
3. Understand the code's purpose, callers, edge cases, and test coverage before touching it.
4. Scan for simplification opportunities:
   - Deep nesting → guard clauses or extracted helpers.
   - Long functions → split by responsibility.
   - Nested ternaries → if/else, switch, lookup, or named helper.
   - Generic names → descriptive names.
   - Duplicated logic → shared functions in the right layer.
   - Dead code → remove only after confirming.
5. Apply each simplification incrementally.
6. Run the narrowest relevant verification after risky changes.
7. Verify tests/checks pass, the build succeeds where applicable, and the diff is clean.

If tests fail after a simplification, revert that change and reconsider. Use `code-reviewer` to review the result when appropriate.
