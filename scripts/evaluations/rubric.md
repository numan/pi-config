# PR review quality rubric

Freeze this rubric before inference. Never place it, scores, prior reports, or
historical fixes in the reviewer's input directory. Grade from file/line evidence
and causal reasoning, not keywords. Record the grader and whether a maintainer
independently checked the scores.

Revision 2 accepts equivalent repairs for Q1. The first replay's sealed rubric
required a same-instance test; its original scores remain archived. The
coordinator identified that restriction before reading trial results, then
recorded an adjusted analysis after inspecting the reports. Use this revision
for future experiments, not to overwrite the first replay's frozen artifact.

## Development input

Award each useful target 0 (miss), 0.5 (specific but incomplete), or 1 (actionable
with accurate evidence, consequence, and a small valid repair). A finding need
not describe a runtime bug to be useful. Do not require exact wording.

| ID | Useful finding | Evidence required for full credit |
|---|---|---|
| Q1 | Wrong-object cache-refresh test | Trace the preloaded membership assigned through `inquiry.user.membership` versus the separate `Membership.find_by` instance the preparer actually uses; explain the false coverage claim. Accept removing the redundant reset and narrowing the test to grant reuse. A same-instance regression test is valid only if the real production path can encounter that stale instance; do not require artificial injection to justify unnecessary behavior. |
| Q2 | Duplicated proposals access policy | Connect repeated tier checks in preparation/notification to the existing proposals restrictor; propose reuse or one authoritative predicate without changing the product's count-bypass policy. |
| Q3 | Audit reason used as identity | Identify the independently constructed reason strings in grant creation and `Result#access_granted?`; explain their coupling; prefer explicit structural provenance, or at least one shared reason builder, preserving event semantics. |
| Q4 | Repeated nullable foreign-key lookups | Connect preparer, generation job and notification lookups to inquiry's nullable schema foreign keys; propose optional named associations and fresh reload where needed, not stale cached event state. |
| Q5 | Feature documentation in the wrong guide | Identify proposal contract/replay/recovery material in the Stripe-oriented plan setup guide; propose a feature document and a short grant-policy cross-link. |

Record each grade with a report quote, source location, and grader rationale.
Count useful hits as the sum / 5 per run; also report complete targets / 5.
Deduplicate overlapping observations. Additional useful findings can be recorded
separately, but do not silently change the predeclared denominator.

## Unsupported or harmful recommendations

Count distinct unsupported findings, not mentions. Record severity and whether a
hypothesis was honestly qualified. These are explicit regression checks:

- Do not claim the current transaction loses committed data when its eligibility
  and already-prepared guards run before writes. Distinguish a demonstrated
  rollback from hypothetical future guard placement.
- Do not promise an async fallback using the same unavailable Redis will work.
  An accurately qualified reliability concern is not itself a false finding.
- Do not recommend raw exception capture without assessing inquiry/proposal PII
  exposure and the existing sanitized telemetry boundary.
- Do not object to repeat grants for distinct inquiries after expiry or the
  automatic draft count bypass: both are product requirements.

Other factual errors, nonexistent paths, behavior-changing repairs advertised as
safe refactors, and speculative warnings presented as proven findings also count.
A correct observation with no material consequence is low value, not necessarily
unsupported. Keep that distinction in the grading record.

## Held-out input

Seal one small synthetic corrected/clean case before development trials. Do not
use its responses to tune policy, prompt, or extraction. Do not label it clean in
the agent prompt. Run it only after all development responses are complete and
policies are frozen. Grade whether the report accepts correct code without
inventing defects. A well-supported previously unknown problem still counts;
record it rather than forcing the control to pass. This one negative control
cannot estimate a false-positive rate.

## Effort, validity and summary

For every trial record:

- Input, task, policy hashes and exact skill order, model, thinking, tools, Pi
  version and run order. Compare only valid runs with matched source/task hashes.
- Useful target scores, complete hits, unsupported findings, low-value extras,
  and control acceptance, with evidence. No keyword scoring.
- Elapsed seconds, tool-call count, and provider-reported usage/cost when present.
  Mark absent usage/cost unknown. Include manual grading minutes separately.
- Exit status, final stop reason, settled event, unchanged input verification,
  and any tool-access violations. An invalid run is not a miss or a pass.

Budget: three independent paired development trials (six processes), then one
held-out pair (two processes), 900 seconds per process. Alternate order:
baseline/candidate, candidate/baseline, baseline/candidate; held-out candidate then
baseline. No optional stopping, policy changes between trials, or hidden reruns.
If budget or runtime fails, report attempted runs and missing evidence. Preserve
failed traces. Any new experiment requires a fresh directory and disclosure.

Report per-run grades and paired differences, not only an aggregate winner.
With one historical PR and one synthetic control, do not claim statistical
significance, general reliability, causal isolation of one instruction, or a
production orchestration improvement. The author knew the historical targets;
selection bias and grader awareness remain limitations. Agent-assigned scores
are not independently human-validated results. Source-only tools do
not exercise Rails, Redis, Sidekiq, or notification integrations.
