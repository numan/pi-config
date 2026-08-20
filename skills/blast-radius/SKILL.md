---
name: blast-radius
description: Find what a proposed or implemented code change could break beyond its diff, identify the safety assumptions, and prove the key assumption by running real code. Use for blast-radius analysis, impact analysis, "what could this break?", or reviewing a deceptively small change.
license: MIT; see LICENSE
metadata:
  source: https://github.com/cursor/plugins/tree/main/pstack/skills/blast-radius
  source-revision: 51a96e0dd838404da19ba83dc70aa21eef71f868
---

# Blast radius

Find what a change could break elsewhere before it ships. Caller lists are only the start. Focus on breakage that symbol search will miss.

## Evidence levels

For each fact the change's safety depends on, take it as far down this list as is cheap and report where you stopped.

1. **Assertion.** You inferred or stated it. This is not evidence on its own.
2. **Source.** You cited a real `file:line`, pinned dependency source, contract, or schema.
3. **Path analysis.** You traced the failure step by step and showed whether it can reach the changed code.
4. **Executable proof.** You ran a focused script or test against the real code and made it fail loudly if the assumption was wrong.
5. **Runtime reproduction.** You reproduced the relevant behavior in the running application.

Mark every safety fact that does not reach level 4 as unproven. Do not round confidence up.

## Process

1. **Define the change.** Read the diff and the complete changed files. Identify added, changed, and deleted symbols and the observable behavior that differs. For an uncommitted change, compare the working tree with its base. For a branch or pull request, inspect its merge base, commits, and complete diff.
2. **Find the key safety assumption.** Most apparently risky changes depend on one or two facts. State each as a falsifiable claim. If a claim holds, it should eliminate several speculative risks at once.
3. **Map the smallest affected area.** Trace direct callers, consumers, public contracts, persisted data, configuration, tests, and deployment behavior. Check pinned dependency versions and local patches before relying on library behavior.
4. **Look beyond symbol search.** Follow asynchronous ordering, teardown and lifecycle behavior, generated code, JSON and wire formats, database columns, other languages reading the same data, feature flags, jobs, caches, and downstream consumers. A search with no matches is evidence only when you name the query and scope.
5. **Rank risks honestly.** Keep risks with a plausible failure path. For each, state the trigger, mechanism, affected location, likelihood, impact, and cheapest check. Separate confirmed risks from cleared hypotheses.
6. **Prove the key assumption.** Prefer an existing focused test. Otherwise write the smallest temporary script or test that imports the shipped code or pinned library and calls the exact path in question. Run it and capture the command and result. Remove temporary artifacts unless they belong as a regression test.
7. **Widen review only when needed.** For a large or cross-system change, load `dispatching-parallel-agents` and delegate independent analyses with the same question and evidence requirements. Merge only findings backed by inspected artifacts.
8. **Polish the report.** Apply `unslop` if available. Preserve exact code references and strip private data before publishing anywhere.

## Stop conditions

Stop when you have:

- traced every meaningful changed contract to its direct consumers
- identified the one or two key safety assumptions
- proved those assumptions to the highest affordable evidence level
- separated real risks from checked and cleared hypotheses
- named any uninspected system or blocked validation

Do not modify production code unless the user also asked for implementation. A narrowly scoped test or disposable proof script is allowed for analysis, but remove it afterward unless the user authorized keeping it.

## Report

Use these sections:

- **What changed.** Explain the behavioral difference, including effects not obvious from the diff.
- **Safety assumption.** State each falsifiable claim, its evidence level, exact evidence, and whether it is proven or unproven.
- **Risks.** Include only plausible or confirmed risks. Give the failure mechanism, `file:line` or external contract, likelihood, impact, and check.
- **Cleared.** List hypotheses you investigated and the evidence that ruled them out.
- **Before merge.** Give the cheapest test or reproduction that catches the material failure. Include the command and result for any proof you ran.

Do not claim safety when validation was blocked. State the remaining uncertainty and the next executable check.
