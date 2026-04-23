# Visual Test Branch Final Report Page Contract

This file is the canonical page contract for the generated static report page at `RUN_DIR/report/index.html`.

Ownership:

- `report-page-builder` owns final artifact generation for `RUN_DIR/report/index.html`
- `report-page-builder` owns final artifact generation for `RUN_DIR/summary.json`

The report must be static HTML. It is a readable artifact, not an app-like interactive UI. Do not require client-side filtering, tabs, search, routing, or bundled application behavior.

## Required section order

The page must present sections in this order:

1. run summary
2. executive summary
3. issues found
4. feature-by-feature results
5. non-UI changes
6. coverage gaps / blocked areas
7. artifact index

## Section requirements

### 1. Run summary

Include:

- branch name
- run directory shown as `RUN_DIR`
- local target URL or environment summary
- overall status
- report generation date/time if available from the run context

### 2. Executive summary

Provide a concise human-readable summary of:

- what changed or was tested
- whether the branch appears ready or has notable issues
- the highest-severity problems, if any
- the broad coverage level achieved

If no issues were found, say so plainly instead of implying uncertainty.

### 3. Issues found

List only real issues.

For each issue, include:

- title
- severity using exactly one of `Critical`, `High`, `Medium`, `Low`
- affected feature or flow
- concise reproduction summary
- direct evidence links
- canonical evidence location under `RUN_DIR/evidence/issues/<issue-slug>/...` when available

Display severity clearly and consistently so severe issues are easy to scan.

If no issues were found, include an explicit `No issues found.` state instead of leaving the section empty.

### 4. Feature-by-feature results

Create one subsection per feature.

Each feature subsection must include:

- feature name and slug when available
- outcome: `passed`, `partial`, `failed`, or `blocked`
- why the feature was in scope when the input artifacts provide that context
- flows exercised
- passed coverage summary
- gaps, blockers, or partial coverage details
- links to relevant screenshots and videos
- links to the feature outcome file when useful

Passed coverage belongs here, not in the issues section.

### 5. Non-UI changes

Summarize relevant non-UI changes separately from UI issues.

Only claim indirect validation when there is actual evidence in the run artifacts.

### 6. Coverage gaps / blocked areas

Make partial coverage and blocked areas explicit.

Include:

- flows not exercised
- setup blockers
- missing data or auth limits
- environment constraints
- any uncertainty that materially limits confidence

Do not hide gaps inside other sections.

### 7. Artifact index

Provide a compact index of important generated artifacts, including links when possible:

- `RUN_DIR/analysis/branch-analysis.md`
- `RUN_DIR/analysis/test-plan.md`
- `RUN_DIR/handoffs/testing-to-report.md`
- `RUN_DIR/handoffs/evidence-to-report.md`
- `RUN_DIR/results/<feature-slug>/outcome.md`
- screenshot directories
- video directories
- issue evidence directories
- `RUN_DIR/summary.json`

## Evidence linking rules

- Link to source evidence under `RUN_DIR/evidence/...` whenever possible.
- You may also embed screenshots directly in the HTML.
- You may link videos or embed them with standard HTML media elements.
- If assets are copied into `RUN_DIR/report/assets/...`, keep the original evidence paths canonical in the report content or artifact index.

## Representation rules

### No issues found

When the run is clean:

- state `No issues found.` in the issues section
- keep passed coverage visible in feature sections
- do not create placeholder issue cards

### Partial coverage

When coverage is incomplete:

- use `partial` or `blocked` status where appropriate
- explain what was covered and what was not
- keep blockers and confidence limits explicit

## Summary alignment

The page content must agree with `RUN_DIR/summary.json`.

`summary.json` remains machine-readable and must satisfy the canonical machine-readable contract referenced by `run.json -> templates.summarySchema`.
