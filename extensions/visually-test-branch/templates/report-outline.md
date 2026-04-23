# Visual Test Branch Supplemental Report Outline

This file is a supplemental content-outline reference for the final report.

It is not the canonical page contract. The canonical page contract for `RUN_DIR/report/index.html` lives at:

- `RUN_DIR/run.json -> templates.finalReportPage`

Use this outline only as supporting guidance for organizing content.

## Run summary

- Branch:
- Run directory: `RUN_DIR`
- Local target:
- Overall status:

## Executive summary

- What changed or was tested:
- Readiness summary:
- Highest-severity issues, if any:
- Broad coverage level:

## Issues found

### <issue-title>

- Feature:
- Severity: `Critical | High | Medium | Low`
- Reproduction:
- Evidence directory: `RUN_DIR/evidence/issues/<issue-slug>/`
- Supporting screenshots/videos:

Include only real issues here. Passing coverage belongs in the feature and flow sections.

## Feature-by-feature results

### <feature-name>

- Why in scope:
- Outcome: `passed | partial | failed | blocked`

#### <flow-name>

- Status:
- Passed coverage summary:
- Screenshots:
  - `RUN_DIR/evidence/screenshots/<feature-slug>/<screen-name>.png`
- Videos:
  - `RUN_DIR/evidence/videos/<feature-slug>/<flow-name>.mp4`
- Coverage gaps or blockers:

## Relevant non-UI changes

- Change summary:
- Indirect validation evidence:

## Coverage limits

-
-

## Artifact index

- `RUN_DIR/analysis/branch-analysis.md`
- `RUN_DIR/analysis/test-plan.md`
- `RUN_DIR/handoffs/testing-to-report.md`
- `RUN_DIR/handoffs/evidence-to-report.md`
- `RUN_DIR/results/<feature-slug>/outcome.md`
- `RUN_DIR/summary.json`
