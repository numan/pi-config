---
name: doubt-driven-development
description: Apply fresh-context adversarial review to high-stakes, unfamiliar, security-sensitive, or difficult-to-reverse technical decisions.
---

# Doubt-driven development

Challenge a load-bearing technical decision with fresh context before it becomes
expensive to reverse. This is an in-flight correctness check, not a general
review requirement for ordinary work.

## Use threshold

Use this skill when a decision is both uncertain and materially consequential,
for example:

- architecture or shared-state behavior with non-obvious invariants
- authentication, authorization, sensitive data, or production safety
- irreversible migrations or public contracts
- claims the type system, tests, or available evidence cannot directly prove
- unfamiliar code where a confident mistake would be costly

Don't use it for mechanical edits, straightforward implementation of an
approved design, ordinary summaries, formatting, or routine validation.

## Doubt cycle

### 1. Isolate the claim

Write the decision and why failure matters in two or three sentences. Define the
contract it must satisfy and the evidence currently supporting it.

If the claim cannot be stated precisely, resolve that ambiguity before review.

### 2. Extract the artifact

Provide the smallest reviewable artifact:

- relevant diff or function rather than the whole repository
- proposal and constraints rather than the discussion that produced it
- evidence separately from the conclusion

Remove prior persuasive reasoning that could anchor the reviewer.

### 3. Obtain fresh review

From a main orchestration context, use one independent reviewer with only the
artifact, contract, and this objective:

```text
Try to disprove that the artifact satisfies the contract. Identify unstated
assumptions, concrete counterexamples, hidden coupling, and realistic failure
modes. Support each finding with evidence. If no material issue is found, say
so rather than inventing one.
```

Choose a reviewer whose tools and domain match the claim. Don't recursively
spawn reviewers from a child agent unless the active runtime and parent
workflow explicitly support it. When fresh context isn't available, label a
self-review as lower confidence instead of presenting it as independent.

Use a second model or external reviewer only when the decision's risk and the
first review's uncertainty justify the added cost. Never send secrets or
sensitive artifacts to an external tool without authorization.

### 4. Reconcile

Classify each finding as:

- confirmed defect or violated assumption
- valid risk already controlled by evidence
- unresolved and requiring a focused experiment or user decision
- unsupported by the artifact or contract

Fix or test confirmed issues. Don't accept a finding merely because it came
from an adversarial reviewer.

### 5. Stop

Stop when one of these is true:

- no material finding remains
- focused validation proves the contested property
- the remaining uncertainty is explicitly accepted by the authorized decision
  maker
- another cycle would repeat the same evidence without changing confidence

Escalate rather than looping when the missing input is a product, risk, or
irreversible-action decision.

## Output

Record:

- claim and contract
- artifact reviewed
- reviewer independence and evidence
- findings and reconciliation
- validation performed
- final decision, confidence, and accepted uncertainty

Don't expose private reasoning or produce review theater. The value is a better
decision supported by new evidence.
