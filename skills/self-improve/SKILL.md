---
name: self-improve
description: Run an explicitly requested session retrospective and create evidence-backed improvement todos for agent config, tests, docs, or code.
disable-model-invocation: true
---

# Self-Improve

Reflect on the current session, identify concrete improvements, present them for approval, then create todos and execute.

## Step 1: Gather Context

Use what's already in the conversation — tool outputs, errors, subagent summaries, dev server logs, test results. You're in the session, so you have the context.

Only use the `session-reader` skill if you need to review a subagent's session that isn't summarized in the current conversation.

## Step 2: Analyze Improvement Areas

Examine each area below. Skip areas with no findings — only report what's actionable.

| Area | What to Look For |
|------|-----------------|
| **Agent config** | Could AGENTS.md instructions be clearer? Did the agent misunderstand something that better wording would prevent? |
| **Subagent behavior** | Did subagents struggle, go off-scope, or need repeated correction? Would better task descriptions or agent definitions help? |
| **Agent definitions** | Check `~/.pi/agent/agents/*.md` — are model choices, skills, or system prompts optimal for what was observed? |
| **Tests** | Were bugs found that tests should catch? Are existing tests stale or missing coverage for touched code? |
| **Documentation** | Are READMEs, inline docs, or references out of date after changes made this session? |
| **Scripts** | Did any scripts fail, produce wrong output, or need manual workarounds? |
| **Extensions & MCP** | Were MCP servers or extensions used that could be better configured? Were tools missing that would have helped? |
| **Skills** | Did any skill produce suboptimal results? Are trigger descriptions accurate? Would a new skill help? |
| **Code quality** | Did the session reveal patterns worth refactoring, error handling gaps, or repeated boilerplate? |
| **Workflow** | Were there unnecessary back-and-forth cycles, wasted API calls, or inefficient tool usage patterns? |

### Prefer mechanical enforcement for recurring corrections

Before proposing another instruction for a recurring mistake, check whether a
validator, lint rule, type constraint, runtime check, or existing tool can prevent
it reliably. Use the observed failure as evidence; don't generalize a one-off
into a global rule.

Choose the smallest mechanism that covers the demonstrated problem without
rejecting legitimate work. Check whether an existing mechanism was bypassed or
misconfigured before proposing a new one. If the decision requires judgment,
tighten the relevant existing instruction instead and explain why enforcement
would not fit.

In the suggestion, identify the failure, proposed mechanism or instruction,
affected files, and how to verify both rejection of the failure and acceptance
of legitimate cases. Keep the proposal within the requested scope and wait for
approval in Step 4 before implementing it. Don't automatically file external
issues or alter tools during the retrospective.

Remove redundant procedural reminders only after the approved mechanism is
verified. Preserve authorization and security policy even when a tool also
enforces it; enforcement does not replace the policy.

## Step 3: Determine Scope

For each finding, classify its scope:

| Scope | Where It Lives | Example |
|-------|---------------|---------|
| **Global** | `~/.pi/agent/` (AGENTS.md, skills, agents) | "Subagent worker should always run tests before committing" |
| **Project** | Project's `.claude/`, CLAUDE.md, or codebase | "Add integration test for the auth endpoint we just fixed" |

## Step 4: Present Suggestions

Present findings as a numbered table. Do NOT start working yet — wait for user approval.

Format each suggestion as:

```
## Improvement Suggestions

| # | Area | Scope | Suggestion | Reason | Changes |
|---|------|-------|------------|--------|---------|
| 1 | Tests | Project | Add test for X | Bug was found manually that a test would catch | Create `tests/test_x.py` |
| 2 | Agent config | Global | Clarify Y in AGENTS.md | Subagent misunderstood task scope twice | Edit AGENTS.md section Z |
| ... | | | | | |
```

After the table, ask:

> Which of these should I work on? (all / numbers / none)

## Step 5: Create Todos and Execute

For each approved suggestion:

1. Create a todo with the `todo` tool:
   - **title**: Short actionable summary
   - **tags**: `["self-improve", "<scope>"]` where scope is `global` or `project`
   - **body**: Full context — what to change, why, which files

2. Work through each todo:
   - Claim it
   - Make the changes
   - Verify the change works (run tests, validate config, etc.)
   - Commit only when explicitly authorized, using the `commit` skill
   - Mark the todo as done

3. After completing all todos, print a summary:

```
## Completed Improvements

| # | Todo | What Changed | Verified |
|---|------|-------------|----------|
| 1 | TODO-xxxx | Added test_x.py — passes ✓ | ✓ |
| 2 | TODO-yyyy | Updated AGENTS.md worker section | ✓ |
```
