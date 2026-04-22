# Testing Handoff: <feature-name>

- Feature slug: `<feature-slug>`
- Run directory: `RUN_DIR`
- Source handoff: `RUN_DIR/handoffs/research-to-testing.md`
- Outcome path: `RUN_DIR/results/<feature-slug>/outcome.md`
- Outcome assets directory: `RUN_DIR/results/<feature-slug>/assets/`
- Screenshot directory: `RUN_DIR/evidence/screenshots/<feature-slug>/`
- Video directory: `RUN_DIR/evidence/videos/<feature-slug>/`
- Issue evidence root: `RUN_DIR/evidence/issues/`

## Why this area is in scope

Describe the changed code and user-visible behavior that make this feature relevant to the branch.

## Target and setup

- Local URL or route: `http://localhost:3000/<path>`
- Required setup/auth/data:
- Preconditions:

## Flows to exercise

1. 
2. 
3. 

## Required success evidence

### Screenshots

- `RUN_DIR/evidence/screenshots/<feature-slug>/<screen-name>.png` — what this screenshot proves
- `RUN_DIR/evidence/screenshots/<feature-slug>/<screen-name>.png` — what this screenshot proves

### Videos

- `RUN_DIR/evidence/videos/<feature-slug>/<flow-name>.mp4` — capture this when the flow is multi-step, issue-prone, or timing-sensitive

## Outcome contract

Write `RUN_DIR/results/<feature-slug>/outcome.md` with:

- overall outcome: `passed`, `partial`, `failed`, or `blocked`
- flows tested and what happened
- passed coverage recorded in the flow sections, not as issue entries
- coverage gaps or blockers
- non-UI observations seen indirectly in the browser
- issue list containing only real issues

## Issue contract

For each real issue, create one issue section in the outcome and one evidence directory:

- Issue slug: `<issue-slug>`
- Severity: `Critical`, `High`, `Medium`, or `Low`
- Evidence directory: `RUN_DIR/evidence/issues/<issue-slug>/`
- Include reproduction notes and links to screenshots/videos stored under `RUN_DIR`

## Risks and watch points

- 
- 
