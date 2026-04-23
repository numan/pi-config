---
name: visually-test-branch
---

# Visually Test Branch

Run an evidence-backed visual QA workflow for the current local branch. Keep the main session as the orchestrator, delegate browser work to subagents, and store every artifact inside the seeded run directory only.

## Announce at start

Say:

> "I'll inspect the seeded run context, send a researcher to analyze this branch and write a branch-specific test plan, then launch browser-testing subagents from those handoffs. All artifacts will stay in the seeded run directory."

## Step 1: Read the seeded run context

Read these files first with the plain `read` tool:

- `RUN_DIR/run.json`
- `RUN_DIR/context/launch.md`
- `RUN_DIR/context/artifact-contract.md`

`RUN_DIR/run.json` also records the canonical template paths for:

- `templates.testingHandoff`
- `templates.featureOutcome`
- `templates.summarySchema`
- `templates.reportOutline`

Treat `RUN_DIR` as the canonical run directory from the launch context. It will be a seeded directory under `pi/visual-tests/YYYY-MM-DD-<name>/`. Do not write any run artifact outside this tree.

## Step 2: Establish the run contract

Use this directory layout for every run:

```text
RUN_DIR/
  run.json
  context/
    launch.md
    artifact-contract.md
    target-environment.md
  analysis/
    branch-analysis.md
    test-plan.md
  handoffs/
    research-to-testing.md
    testing/
      <feature-slug>.md
    testing-to-report.md
    evidence-to-report.md
  evidence/
    screenshots/
    videos/
    issues/
      <issue-slug>/
  results/
    <feature-slug>/
      outcome.md
      assets/
  report/
    index.html
    assets/
  summary.json
```

Required artifact paths:

- `RUN_DIR/analysis/branch-analysis.md`
- `RUN_DIR/analysis/test-plan.md`
- `RUN_DIR/handoffs/research-to-testing.md`
- `RUN_DIR/handoffs/testing/<feature-slug>.md`
- `RUN_DIR/results/<feature-slug>/outcome.md`
- `RUN_DIR/handoffs/testing-to-report.md`
- `RUN_DIR/handoffs/evidence-to-report.md`
- `RUN_DIR/report/index.html`
- `RUN_DIR/summary.json`

If any phase wants a temporary file, put it under `RUN_DIR` instead of `/tmp`.

## Step 3: Confirm the branch target and local environment

Determine what local environment the branch should be tested against.

- Prefer evidence from the repository, existing docs, or the user's request.
- If the correct local URL or startup command is not obvious, ask the user before launching browser tests.
- Write the resolved target to `RUN_DIR/context/target-environment.md`.

That file must include:

- current branch name
- intended local URL
- how the app is expected to be running
- any auth/setup assumptions
- any known coverage limits

Do not describe this workflow as a replacement for CI. Do not frame the target as a preview or staging environment unless the user explicitly overrides the local-branch workflow.

## Step 4: Research the branch first

Spawn a `researcher` subagent before any visual testing.

The task must instruct the researcher to:

- analyze the current branch and working tree state
- identify user-visible changes, impacted features, and relevant non-UI changes
- produce a branch-specific test plan grounded in changed code
- write all artifacts into `RUN_DIR`
- avoid browser execution in the researcher phase

Use a task shaped like this:

```typescript
subagent({
  name: "🔎 Researcher",
  agent: "researcher",
  task: `Analyze the current branch for visual QA. Read ${"RUN_DIR/run.json"}, ${"RUN_DIR/context/launch.md"}, and ${"RUN_DIR/context/target-environment.md"}. Produce these files inside RUN_DIR only:
- analysis/branch-analysis.md
- analysis/test-plan.md
- handoffs/research-to-testing.md

The branch analysis must summarize branch intent, changed files, impacted features, relevant non-UI changes, risks, and open questions. The test plan must define feature-slugged browser test scopes, required screenshots/videos, and severity guidance for issues. The research-to-testing handoff must map each feature slug to what must be tested, evidence expectations, and output paths under RUN_DIR.`
})
```

Wait for the researcher to finish, then read:

- `RUN_DIR/analysis/branch-analysis.md`
- `RUN_DIR/analysis/test-plan.md`
- `RUN_DIR/handoffs/research-to-testing.md`

If the branch has no meaningful user-facing change, continue anyway: record the limited visual scope, summarize the non-UI changes, and keep the run artifacts complete.

## Step 5: Materialize per-feature testing handoffs

Convert the research output into durable per-feature files under `RUN_DIR/handoffs/testing/`.

Create one file per impacted feature or flow:

- `RUN_DIR/handoffs/testing/<feature-slug>.md`

Each file must include:

- feature name and slug
- why this area is in scope for the branch
- local URL / route / setup needed
- exact flows to exercise
- screenshots that must be captured even on success
- videos that must be captured when the flow is multi-step or issue-prone
- where the tester must write outcome and assets
- known risks and non-UI observations to watch indirectly

Use the template path from `RUN_DIR/run.json -> templates.testingHandoff` as the canonical shape for these files.

These files are the durable handoff from research to browser testing.

## Step 6: Launch browser-driven testing in subagents

Never drive the browser from the main session. Launch one or more testing subagents and rely on `agent-browser` there.

Use `browser-tester` subagents for browser work. Each task must point to one per-feature handoff file and require all outputs under `RUN_DIR`.

Use tasks shaped like this:

```typescript
subagent({
  name: "🧪 Browser Tester: <feature>",
  agent: "browser-tester",
  task: `Execute the visual QA handoff at RUN_DIR/handoffs/testing/<feature-slug>.md.

Use browser automation through the agent-browser skill in this subagent, not in the main session. Save every artifact inside RUN_DIR only.

Required outputs:
- RUN_DIR/results/<feature-slug>/outcome.md
- RUN_DIR/results/<feature-slug>/assets/... (supporting assets if needed)
- RUN_DIR/evidence/screenshots/... for captured screenshots
- RUN_DIR/evidence/videos/... for captured videos
- RUN_DIR/evidence/issues/<issue-slug>/... for issue-specific evidence

Use the template path from RUN_DIR/run.json -> templates.featureOutcome for outcome.md.
Record passed coverage inside outcome.md, not as fake issues. For each real issue, include severity (Critical/High/Medium/Low), reproduction notes, and evidence paths.`
})
```

Run testing subagents sequentially when they share the same local app state or credentials. Parallelize only when the flows are independent and safe.

## Step 7: Build durable report handoffs

After testing finishes, read every `RUN_DIR/results/<feature-slug>/outcome.md` file and create:

- `RUN_DIR/handoffs/testing-to-report.md`
- `RUN_DIR/handoffs/evidence-to-report.md`

`testing-to-report.md` must summarize:

- each feature tested
- pass/fail/partial outcome
- tested flows
- gaps or blocked coverage
- relevant non-UI observations

`evidence-to-report.md` must index:

- screenshots for successful coverage
- videos for important flows
- issues, severities, and their evidence directories
- any evidence that supports non-UI claims indirectly

These files are the durable handoff from testing to report compilation.

## Step 8: Assemble the final report

Build the report only after the testing and evidence handoffs exist.

Create:

- `RUN_DIR/report/index.html`
- `RUN_DIR/summary.json`

Use these template references from `RUN_DIR/run.json`:

- `templates.reportOutline` for the report structure
- `templates.summarySchema` for the machine-readable contract

The report must include:

- branch name and test target summary
- impacted features section
- one subsection per impacted feature
- nested tested-flow subsections under each feature
- passed coverage inside the relevant feature or flow section
- screenshots and videos embedded or linked from the run directory
- issues found section
- one subsection per issue with severity and evidence
- relevant non-UI changes summarized separately
- indirect validation evidence for non-UI changes when available
- explicit coverage limits when parts were untestable

`summary.json` must be machine-readable and match the schema at `templates.summarySchema`. At minimum, include:

- `branch`
- `runDir`
- `targetEnvironment`
- `features[]` with `slug`, `name`, `outcome`, `outcomePath`, and `flows[]`
- `issues[]` with `slug`, `title`, `severity`, `featureSlug`, and `evidenceDir`
- `nonUiChanges[]`
- `overallStatus`

## Step 9: Final verification before reporting back

Before you say the workflow is complete:

1. Read back the final artifacts you created.
2. Confirm every required artifact lives under `RUN_DIR`.
3. Confirm browser execution happened only in subagents.
4. Confirm research → testing, testing → report, and issue/evidence → final report handoffs are all present as files.
5. Confirm the report does not describe this workflow as CI replacement or preview-environment testing.

In the final user-facing summary, include the exact run directory and the paths to:

- `analysis/branch-analysis.md`
- `analysis/test-plan.md`
- `report/index.html`
- `summary.json`
