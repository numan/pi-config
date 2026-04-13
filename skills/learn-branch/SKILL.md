---
name: learn-branch
description: Build a comprehensive understanding of everything changed on the current git branch. Use when asked to "learn this branch", "understand what changed on this branch", "review branch changes", "catch me up on this branch", "summarize this PR branch", or "analyze branch diff". Reconstructs branch intent from commit messages, diffs, and changed files, then produces an evidence-backed branch briefing.
---

# Learn Branch Changes

Understand the current branch by reconstructing what changed, why it changed, and which files and systems were affected.

## Step 1: Establish the comparison point

Work from the repository root.

Detect the default remote branch:

```bash
git symbolic-ref --quiet --short refs/remotes/origin/HEAD
```

If that succeeds, strip the `origin/` prefix and use the result as the base branch. If it fails, check common candidates in this order and use the first that exists:

```bash
git show-ref --verify --quiet refs/heads/main && echo main
git show-ref --verify --quiet refs/heads/master && echo master
git show-ref --verify --quiet refs/remotes/origin/main && echo main
git show-ref --verify --quiet refs/remotes/origin/master && echo master
```

Compute the merge base between `HEAD` and the base branch:

```bash
git merge-base HEAD <base-branch>
```

Use that merge base as the source of truth for all branch-wide diffs. Do not compare only against the previous commit.

## Step 2: Inventory the branch

Collect the high-level branch shape before reading files.

```bash
git status --short
git log --reverse --decorate --oneline <merge-base>..HEAD
git diff --stat <merge-base>..HEAD
git diff --name-status <merge-base>..HEAD
```

Capture:
- branch name
- base branch
- merge base commit
- number of commits on the branch
- whether there are uncommitted changes
- files added, modified, deleted, or renamed
- hotspots by file count and churn

Treat uncommitted changes as part of the branch state. Include them explicitly instead of silently ignoring them.

## Step 3: Reconstruct intent from commit history

Read the full commit messages, oldest first:

```bash
git log --reverse --format='COMMIT %H%nSUBJECT %s%nBODY%n%b%n==END==' <merge-base>..HEAD
```

For each commit, extract:
- the user-visible or product-facing intent
- the technical change made
- whether the commit appears to be foundational, follow-up, cleanup, fixup, or revert
- any explicit motivation, tradeoff, or TODO mentioned in the body

Use commit messages to infer intent, but verify every conclusion against the diff. If a commit message overstates or understates what changed, trust the code and note the mismatch.

## Step 4: Read the actual code changes

Read the branch diff in slices, then read the changed files directly.

Start with:

```bash
git diff --find-renames --unified=40 <merge-base>..HEAD --
```

Then read the changed files themselves, prioritizing in this order:

1. files with the largest diffs
2. entry points, route definitions, API surfaces, schema changes, or shared utilities
3. tests that reveal intended behavior
4. follow-up files with small but important wiring changes

Do not stop at the patch view when the surrounding file context matters. Read the full file for any change that affects:
- control flow
- public interfaces
- shared types
- data fetching or persistence
- auth, permissions, billing, analytics, or side effects
- error handling
- feature flags or configuration

## Step 5: Build a branch model

Synthesize the branch into a coherent model.

Answer these questions:

| Question | What to determine |
|---|---|
| What problem is this branch solving? | Product goal or engineering motivation |
| What changed behaviorally? | User-visible outcomes, API changes, background job changes, data flow changes |
| How is it implemented? | Main modules, responsibilities, and control flow |
| What are the key dependencies? | Shared utilities, external services, schema/contracts, feature flags |
| What changed incrementally? | Sequence of commits and why later commits were needed |
| What remains risky or unclear? | Gaps, follow-ups, weak test coverage, suspicious edge cases |

When the branch contains multiple unrelated tracks, split the model into separate change themes instead of forcing a single narrative.

## Step 6: Verify with targeted follow-up reads

After forming an initial theory, verify it.

Use focused git and file inspection to resolve ambiguity:

```bash
git diff <merge-base>..HEAD -- path/to/file
git blame -L <start>,<end> path/to/file
git show <commit>:path/to/file
git show <commit>
```

Use these checks when needed:
- trace where a new prop, function, field, or constant is consumed
- compare before/after behavior for a critical file
- inspect the exact commit that introduced a surprising line
- confirm whether tests cover the intended behavior or only implementation details

Do not present speculation as fact. Mark remaining uncertainty explicitly.

## Step 7: Produce the branch briefing

Present the result in a structured summary.

Use this format:

```markdown
## Branch Briefing

### Overview
- Base branch: ...
- Commits on branch: ...
- Working tree state: clean | has uncommitted changes
- Main purpose: ...

### Change Themes
1. Theme name
   - What changed: ...
   - Why it changed: ...
   - Key files: `...`, `...`
   - Important commits: `abcd123` — ...

### Commit Narrative
- `abcd123` — ...
- `efgh456` — ...

### File-Level Hotspots
- `path/to/file` — role in the branch, notable behavior changes
- `path/to/other` — role in the branch, notable behavior changes

### Behavior Changes
- User-visible:
  - ...
- Internal-only:
  - ...

### Risks / Open Questions
- ...

### What to Remember
- 3-5 bullets capturing the branch's most important changes
```

Keep the summary grounded in evidence from commits and code. Cite file paths and commit hashes whenever the reader would benefit from verification.

## Step 8: Exit criteria

Do not stop until all of these are true:

- every commit on the branch has been reviewed at least once
- every changed file has been classified by purpose
- the major change themes are clear
- the relationship between commit intent and code changes has been checked
- any uncommitted work has been acknowledged
- the final summary distinguishes facts from inference

If the branch is too large to read exhaustively in one pass, say so explicitly and provide:
- the areas fully reviewed
- the areas only skimmed
- the highest-risk files to inspect next
- the current confidence level in the branch model
