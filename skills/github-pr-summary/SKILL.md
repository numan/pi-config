---
name: github-pr-summary
description: Generate a GitHub pull request description for the current branch, focused on user impact, branch-owned changes, and verified stacked-PR navigation.
---

# Generate a GitHub PR Summary

Study the current branch and produce a GitHub-compatible PR summary that explains the problem, solution, QA, deploy notes, and related work without including changes merged in from other branches.

## Step 1: Establish the branch-only scope

Work from the repository root.

Select the base branch in this order:

1. For an existing PR, use its actual `baseRefName`:

   ```bash
   gh pr view --json baseRefName --jq '.baseRefName'
   ```

2. Before PR creation, use the intended base already verified by the calling PR workflow or explicitly supplied by the user.
3. Otherwise check `git config --get branch."$(git branch --show-current)".gh-merge-base`.
4. Otherwise detect the default remote branch:

   ```bash
   git symbolic-ref --quiet --short refs/remotes/origin/HEAD
   ```

Using the intended non-default base prevents lower stack layers from leaking into the current PR summary. Resolve the selected branch under `refs/remotes/origin/` or the appropriate remote.

If default-branch detection fails, use the first branch that exists from this list:

```bash
git show-ref --verify --quiet refs/remotes/origin/main && echo origin/main
git show-ref --verify --quiet refs/remotes/origin/master && echo origin/master
git show-ref --verify --quiet refs/heads/main && echo main
git show-ref --verify --quiet refs/heads/master && echo master
```

Find the branch fork point:

```bash
git merge-base --fork-point <base-branch> HEAD
```

If `--fork-point` fails, fall back to:

```bash
git merge-base <base-branch> HEAD
```

Build the commit list from the first-parent history only:

```bash
git log --first-parent --no-merges --reverse --format='%H%x09%s' <fork-point>..HEAD
```

Treat the first-parent non-merge commits between that fork point and `HEAD` as the source of truth for what belongs in the PR summary.

Rules:
- Ignore merge commits.
- Ignore commits that arrived by merging another branch.
- Do not summarize code that exists only because another branch was merged in.
- If a branch commit modifies a file that also changed in a merged branch, describe only the delta introduced by the branch commit itself.
- If there are uncommitted changes, mention them only if the user explicitly asked for a summary of the working tree too. Otherwise ignore them.

## Step 2: Discover stacked-PR context

Check whether the current branch has a PR, identify the target repository, then collect repository PR metadata:

```bash
gh repo view --json nameWithOwner
gh pr view --json number,title,url,headRefName,baseRefName,body,headRepository,headRepositoryOwner,isCrossRepository
gh pr list --state all --limit 200 --json number,title,url,headRefName,baseRefName,state,headRepository,headRepositoryOwner,isCrossRepository
```

Build stack navigation only from verified evidence:

1. Exclude the current PR number from every candidate set.
2. Automatically detect navigation only for same-repository PRs: require `isCrossRepository` to be `false` and compare qualified refs as `<owner>/<repo>:<branch>`, using `headRepository.nameWithOwner` plus the target repository identity. Do not compare unqualified branch names.
3. Treat a remaining same-repository PR whose qualified head ref equals the current PR's qualified base ref as the immediate previous layer.
4. Treat a remaining same-repository PR whose qualified base ref equals the current PR's qualified head ref as the immediate next layer.
5. Repeat those relationships in both directions while each hop has exactly one match.
6. Read an existing `## Stack navigation` section from a verified adjacent stack PR to recover earlier layers that GitHub retargeted after merge. Verify every referenced PR number, title, URL, and repository with `gh pr view` before using it.
7. Do not infer a stack from similar titles, shared issue numbers, unqualified branch names, or chronology alone. If relationships are ambiguous, include only the contiguous verified layers or omit the section.

Do not add stack navigation before the current PR has a number and URL. Do not edit neighboring PRs unless the user explicitly asks.

When at least one adjacent layer is verified, place this section first:

```markdown
## Stack navigation

[← Previous: #123 — previous title](https://github.com/owner/repo/pull/123) · [Next: #125 — next title →](https://github.com/owner/repo/pull/125)

> Review and merge in numbered order (1 → 3). Each PR targets the layer immediately below it.

| Layer | Pull request | |
|---:|---|---|
| 1 | [#123 — previous title](https://github.com/owner/repo/pull/123) |
| 2 | [#124 — current title](https://github.com/owner/repo/pull/124) | **← current**
| 3 | [#125 — next title](https://github.com/owner/repo/pull/125) |
```

Use `Previous: base branch \`<name>\`` for the bottom layer and `Next: top of stack` for the top layer. Keep the layer count, review range, links, titles, order, and current marker consistent with verified PR metadata.

## Step 3: Inventory only the branch-authored changes

Collect the branch-only file list and per-commit diffs:

```bash
git diff --stat <fork-point>..HEAD
git diff --name-status <fork-point>..HEAD
git log --first-parent --no-merges --reverse --format='COMMIT %H%nSUBJECT %s%nBODY%n%b%n==END==' <fork-point>..HEAD
```

Then inspect each branch-authored commit directly:

```bash
git show --stat --summary --find-renames <commit>
git diff <commit>^! -- path/to/file
```

Use commit-level inspection to separate branch-authored work from merged-in background churn.

Do not rely only on the final aggregate diff when merge commits are present.

## Step 4: Read the changed files

Read the files touched by the branch-authored commits.

Prioritize in this order:
1. entry points, routes, controllers, API handlers, database/schema changes
2. shared types, hooks, services, utilities, background jobs
3. components and views with user-visible impact
4. tests that reveal intended behavior

When a diff changes control flow, public interfaces, or data shape, read the full file instead of only the patch.

## Step 5: Reconstruct the narrative

Answer these questions before writing:

| Question | What to capture |
|---|---|
| What problem did the branch solve? | User pain, product gap, operational issue, or engineering bottleneck |
| What changed for users? | UI behavior, API behavior, workflows, or reliability improvements |
| What changed technically? | Main architectural choices, data flow, algorithm, or integration changes |
| Why this approach? | Non-obvious tradeoffs and explicit "Why not X?" reasoning |
| What must QA verify? | Concrete user journeys or API checks |
| Are there deploy concerns? | Migrations, env vars, feature flags, backfills, jobs, or sequencing |

Keep the narrative grounded in evidence from commits and code. Do not guess at intent when the code does not support it.

## Step 6: Categorize files for the summary tables

Group files by the system they affect.

Use these heuristics:
- **Backend Changes**: server code, API code, jobs, workers, models, migrations, database files, infrastructure tied to runtime behavior
- **Frontend Changes**: components, routes, views, hooks, client state, styles, assets, client-side tests
- If a file does not clearly fit either bucket, place it in the section that best matches the user-facing surface it supports.
- Omit empty subsections.

For each file row:
- Use backticks around the path.
- In the `Change` column, start new files with `**New** — ...`.
- For modified files, start with a plain verb phrase such as `Adds`, `Updates`, `Refactors`, `Removes`, `Extends`, or `Reworks`.
- Describe the behavioral significance, not a line-by-line diff.

## Step 7: Write the PR summary in GitHub markdown

Output valid GitHub markdown only. Do not add a preamble.

When the calling workflow requests a navigation-only update, output only the verified `## Stack navigation` section; the calling workflow owns preserving and recomposing the existing body. Otherwise use this structure when the sections apply and put verified `## Stack navigation` before every other section.

```markdown
## Issue
- [Issue title](https://github.com/org/repo/issues/123)

## Problem
2-4 sentences describing the user or business pain.

## Solution
2-4 sentences describing the high-level approach.

### Algorithm/Architecture Design
- **Pattern/approach**: explanation.
- **Why not X?** explanation.

### Backend Changes
| File | Change |
|---|---|
| `path/to/file.rb` | Adds ... |
| `path/to/new_file.rb` | **New** — Introduces ... |

### Frontend Changes
| File | Change |
|---|---|
| `src/Feature.tsx` | Updates ... |

## QA
1. Step one.
2. Step two.
3. Verify specific outcomes.

## Deploy Notes
- Run migration ...
- Set `ENV_VAR` (default: `false`) ...

## Screenshots

## Related
- Fixes #123
- Related: #456
- Background: [Doc title](https://...)
```

## Step 8: Apply writing rules

Follow these rules strictly:
- Write for the PR reviewer first and the end user second.
- Put **user-facing impact** before implementation detail.
- Keep the **Problem** and **Solution** sections to 2-4 sentences each.
- Use backticks for file names and component names.
- Bold key terms, algorithm names, and architectural patterns on first use.
- Include **Why not X?** bullets only when the choice is non-obvious.
- Include environment variables in backticks and note defaults inline when known.
- Omit any section that genuinely does not apply.
- Leave **Screenshots** as a header only with no placeholder text under it.
- Keep the tone direct, specific, and conversational without filler.

## Step 9: Check section-specific requirements

### Issue
Include only when you can identify a real GitHub issue URL or issue reference with high confidence. If there is no reliable issue reference, omit the section.

### Problem
Explain the gap being fixed from the user's perspective when possible. Avoid repeating implementation details here.

### Solution
Start high-level, then expand into subsections only when they add useful detail.

### QA
Write manual test steps as a numbered list. Use specific actions and verifications such as click targets, routes, filters, API actions, or expected text changes.

### Deploy Notes
Include only if there are migrations, data backfills, new jobs, feature flags, config changes, env vars, rollout sequencing, or operational caveats.

### Related
Include linked issues with `Fixes #N` when supported by the branch evidence. Add related PRs or docs only when they materially help the reviewer.

## Step 10: Final validation

Before returning the full summary, verify:
- Only first-parent non-merge commits relative to the PR's actual base branch were considered.
- Lower stack layers and merged-in branch work were excluded from the narrative.
- Stack navigation appears first when a stack was verified, and every layer, link, title, endpoint label, and current marker matches GitHub metadata.
- Every file mentioned was actually changed by a branch-authored commit.
- The markdown is valid GitHub markdown.
- Empty sections were omitted.
- `Screenshots` is blank except for the header.
- Claims about behavior or deployment are supported by code, tests, or commit evidence.

For navigation-only output, verify the stack metadata checks above and return no content outside the navigation section.

If branch-only authorship is ambiguous because history was rewritten or commits were cherry-picked, say so briefly in the relevant section instead of presenting speculation as fact.
