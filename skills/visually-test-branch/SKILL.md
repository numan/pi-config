---
name: visually-test-branch
description: Branch-focused visual QA workflow for the current local branch. Use when asked to "visually test this branch", "test the current branch in the browser", "run branch visual QA", "generate a visual test report for this branch", or "inspect what this branch changed and test it". Starts with researcher-led branch analysis, delegates browser automation to testing subagents via agent-browser, and keeps all artifacts in one seeded run directory under pi/visual-tests.
---

# Visually Test Branch

Turn the current local branch into an evidence-backed visual QA run with durable handoffs and a self-contained artifact directory.

## What this workflow does

- analyzes the current local branch first
- uses a `researcher` subagent for branch understanding and test planning
- runs dedicated `browser-tester` subagents backed by the `agent-browser` skill
- writes every artifact for the run into one seeded `RUN_DIR`
- produces `RUN_DIR/report/index.html` and `RUN_DIR/summary.json`
- summarizes relevant non-UI changes separately and only cites indirect validation evidence when it was actually observed

Trigger phrases include:

- visually test this branch
- test the current branch in the browser
- run branch visual QA
- generate a visual test report for this branch
- inspect what this branch changed and test it

This is branch-focused local-environment QA. Do not describe it as CI, a CI replacement, or preview-environment testing.

## Step 1: Work from the seeded run directory

Use this skill through the `/visually-test-branch` launcher when possible.

Read these files first:

- `RUN_DIR/run.json`
- `RUN_DIR/context/launch.md`
- `RUN_DIR/context/artifact-contract.md`

`RUN_DIR/run.json` also records the template paths the workflow should use for deterministic outputs:

- `templates.testingHandoff`
- `templates.featureOutcome`
- `templates.summarySchema`
- `templates.reportOutline`
- `templates.finalReportPage`

Treat the seeded run directory as the only valid place for run artifacts. Keep every generated file inside `RUN_DIR`.

Standard artifact paths:

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

## Step 2: Resolve the local test target

Confirm what local environment should be exercised for this branch.

Write `RUN_DIR/context/target-environment.md` with:

- current branch
- local URL
- startup expectations
- auth or fixture assumptions
- known limits to coverage

If the correct local target is not clear from the repo or user request, ask the user before launching browser tests.

## Step 3: Start with branch analysis via researcher

Spawn a `researcher` subagent first. Do not start browser work until the researcher artifacts exist.

The researcher must write:

- `RUN_DIR/analysis/branch-analysis.md`
- `RUN_DIR/analysis/test-plan.md`
- `RUN_DIR/handoffs/research-to-testing.md`

The branch analysis must cover:

- branch intent
- changed files and hotspots
- impacted user-facing features
- relevant non-UI changes
- risks and open questions

The test plan must cover:

- feature slugs to test
- priority flows
- screenshots required on success
- videos required for multi-step or risky flows
- likely issue areas and severity expectations

The research-to-testing handoff must map each feature slug to:

- what to test
- why it matters for this branch
- setup notes
- required evidence
- exact output paths under `RUN_DIR`

## Step 4: Create durable handoffs for each testing subagent

Write one file per feature or flow under:

- `RUN_DIR/handoffs/testing/<feature-slug>.md`

Each handoff file must include:

- feature name and slug
- target URL or route
- setup steps
- flows to exercise
- required screenshots
- required videos
- indirect non-UI signals to watch for
- output paths for results and evidence

Use `templates.testingHandoff` from `RUN_DIR/run.json` as the canonical shape for these files.

This is the durable handoff from research to testing. Do not rely on memory or implicit conversation continuity alone.

## Step 5: Run browser testing only in subagents

Never drive the browser from the main session.

Spawn `browser-tester` subagents for each feature handoff and make browser automation explicit through the `agent-browser` skill in those subagents.

Each testing task must require outputs under `RUN_DIR` only:

- `RUN_DIR/results/<feature-slug>/outcome.md`
- `RUN_DIR/results/<feature-slug>/assets/...`
- `RUN_DIR/evidence/screenshots/...`
- `RUN_DIR/evidence/videos/...`
- `RUN_DIR/evidence/issues/<issue-slug>/...`

Use `templates.featureOutcome` from `RUN_DIR/run.json` as the canonical shape for `outcome.md`.

Tester outcomes must:

- record passed coverage inside `outcome.md`
- record failed or blocked flows clearly
- create one evidence directory per real issue
- tag each issue as Critical, High, Medium, or Low
- include reproduction notes and evidence paths

Do not create fake issue entries for passing coverage.

## Step 6: Preserve testing-to-report handoffs

After all testing subagents finish, read their outputs and write:

- `RUN_DIR/handoffs/testing-to-report.md`
- `RUN_DIR/handoffs/evidence-to-report.md`

`testing-to-report.md` must summarize:

- features tested
- pass/fail/partial outcome
- tested flows
- blocked coverage
- non-UI observations worth mentioning

`evidence-to-report.md` must index:

- success screenshots
- flow videos
- issue evidence directories
- severity mapping
- any evidence supporting non-UI claims indirectly

These are the durable handoffs from testing to final report assembly.

## Step 7: Delegate final artifact generation

Do not assemble the final page in the main session.

After `RUN_DIR/handoffs/testing-to-report.md` and `RUN_DIR/handoffs/evidence-to-report.md` exist, launch a dedicated report-building subagent:

```typescript
subagent({
  name: "🧾 Report Page Builder",
  agent: "report-page-builder",
  task: `Build the final static visual QA report for RUN_DIR. Read RUN_DIR/run.json, RUN_DIR/context/target-environment.md, RUN_DIR/handoffs/testing-to-report.md, RUN_DIR/handoffs/evidence-to-report.md, and every RUN_DIR/results/<feature-slug>/outcome.md file. Use RUN_DIR/run.json -> templates.finalReportPage as the canonical page contract and RUN_DIR/run.json -> templates.summarySchema as the canonical machine-readable contract. Write RUN_DIR/report/index.html and RUN_DIR/summary.json. Optional supporting files may be written under RUN_DIR/report/assets/, but evidence under RUN_DIR/evidence/... remains canonical.`
})
```

Required inputs for that subagent:

- `RUN_DIR/run.json`
- `RUN_DIR/context/target-environment.md`
- `RUN_DIR/handoffs/testing-to-report.md`
- `RUN_DIR/handoffs/evidence-to-report.md`
- every `RUN_DIR/results/<feature-slug>/outcome.md`
- `RUN_DIR/run.json -> templates.finalReportPage`
- `RUN_DIR/run.json -> templates.summarySchema`

Owned outputs for that subagent:

- `RUN_DIR/report/index.html`
- `RUN_DIR/summary.json`
- optional `RUN_DIR/report/assets/...`

The report page builder owns final artifact generation only. Keep all inputs and outputs under `RUN_DIR`.

## Step 8: Final checks

Before reporting completion:

- verify every required artifact exists inside `RUN_DIR`
- verify browser execution happened only in testing subagents
- verify research → testing handoff exists
- verify testing → report handoff exists
- verify issue/evidence → final report handoff exists
- verify the workflow stays branch-focused and local-environment-focused
- verify the report-page-builder subagent produced `RUN_DIR/report/index.html` and `RUN_DIR/summary.json`
- verify the report does not frame itself as CI replacement or preview-environment testing

## Exit criteria

Do not stop until you can point to:

- `RUN_DIR/analysis/branch-analysis.md`
- `RUN_DIR/analysis/test-plan.md`
- `RUN_DIR/handoffs/research-to-testing.md`
- `RUN_DIR/handoffs/testing-to-report.md`
- `RUN_DIR/handoffs/evidence-to-report.md`
- `RUN_DIR/report/index.html`
- `RUN_DIR/summary.json`
