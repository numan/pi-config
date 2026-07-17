---
name: using-agent-skills
description: Select the minimum applicable skill set when the task doesn't already name a workflow. Don't use merely because a session started.
---

# Select agent skills

Choose the smallest skill set that fully covers the current task. Skills are
specialized procedures, not a checklist to apply to every request.

## Selection rules

1. If the user or prompt explicitly names a skill, load it.
2. Otherwise choose one primary skill whose trigger and deliverable match the
   task.
3. Add a supplemental skill only when it owns a distinct required procedure.
4. Don't load a skill whose behavior is already fully covered by the active
   agent or prompt.
5. Don't chain definition, planning, implementation, review, and shipping
   workflows unless the user requested that lifecycle.

Common primary routes:

- unclear underlying goal: `interview-me`
- idea exploration: `idea-refine`
- specification: `spec-driven-development`
- task decomposition: `write-todos`
- substantial implementation: `incremental-implementation`
- failing behavior: `debugging-and-error-recovery`
- changed behavior or bug proof: `test-driven-development`
- test architecture, coverage overlap, test refactoring, or slow tests: `testing-strategy`
- code review: `code-reviewer`
- security boundary work: `security-and-hardening`
- performance bottleneck: `performance-optimization`
- documentation: `docs-writer` or `documentation-and-adrs`
- release preparation: `shipping-and-launch`

Typical supplements:

- current official API evidence: `source-driven-development`
- UI implementation: `frontend-ui-engineering`
- public interface design: `api-and-interface-design`
- production diagnostics: `observability-and-instrumentation`
- high-stakes adversarial validation: `doubt-driven-development`
- git commit: `commit`

## Boundaries

- Don't use this meta-skill merely because a session started.
- Don't restate global engineering rules from every loaded skill.
- Don't use overlapping skills to create duplicate approval or verification
  gates.
- If two skills conflict, follow the one explicitly invoked for the current
  deliverable and surface any material unresolved conflict.

After selecting, follow the active skill's required workflow and stop conditions.
