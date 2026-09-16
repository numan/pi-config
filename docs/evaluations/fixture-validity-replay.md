# Fixture-validity review replay

## Result

Both the baseline and revised guidance detected the mixed-clock fixture defect
and accepted the frozen-clock counterexample. This single paired replay does
not demonstrate a detection-rate improvement. It confirms that the revised
instructions handle this case without banning legitimate fixed dates.

The revision adds fixture-validity guidance to
[`testing-strategy`](../../skills/testing-strategy/SKILL.md) and one dependency
inspection sentence to [`code-reviewer`](../../skills/code-reviewer/SKILL.md).
No model settings, production code, repository-local rules, or CI changed.

## Case and isolation

Run date: 2026-09-16.

The historical input is the merged change from
[Talkadot PR #5784](https://github.com/Talkadot/talkadot/pull/5784):

- Base: `7a3e9cdcdcc2d97e96d2f51ca591e254d9d8a046`
- Head: `cb48c174786e68e036ad83da1601d5e2ef1a7ac9`
- Reviewed diff: the controller and serializer confirmation specs only.
- Supporting snapshot: root and API instructions; both specs; quote and deal
  factories and models; confirmation controller and serializer; public quote
  resolver; Rails and RSpec helpers. All 13 files came from the historical head.
- Additional input: a synthetic serializer spec that freezes time to
  `Time.utc(2026, 8, 27, 12)` around all setup, uses the same fixed October 15
  event date and quote factory, and asserts that serialization preserves the
  event date. This is a negative control, not historical code.

Two fresh Pi CLI processes reviewed identical inputs with
`openai-codex/gpt-6-astra`, reasoning `high`, on Pi 0.85.1. One received the old
skill bodies; the other received the revised bodies. Global context, skill
and extension discovery, prompt templates, and session reuse were disabled.
Both received the complete two-skill policy through `--append-system-prompt`.
Only `read` and `bash` were exposed. The processes ran concurrently in separate
sparse source directories, with no Rails runtime.

The task restricted review to the supplied snapshot, prohibited later history,
network access, edits, dependency installation, and outside-directory reads,
and asked reviewers to assess the change as introduced on August 27. These
were prompt restrictions, not an OS sandbox. No conversation about the incident,
fixing PR, grading rubric, or expected finding was passed to either reviewer.

Source and task hashes matched between variants. Source hashes remained
unchanged after both processes exited. The replay used a reduced harness and
preselected dependency files; it does not measure repository-wide discovery,
Sol implementation behavior, or the full production orchestration workflow.

## Predeclared grading and observations

The rubric was written before either run. Grades below are manual assessments
of the returned reports, not an automated judge.

| Criterion | Baseline | Revised |
|---|---|---|
| Connect both fixed-date specs to the live-clock factory and model validation | Pass | Pass |
| Identify September 16 as the first invalid execution date | Pass | Pass |
| Recommend a durable local repair without weakening production validation | Pass | Pass |
| Propose affected-spec checks across the boundary with scoped clock control | Pass | Pass |
| Accept the frozen-clock negative control | Pass | Pass |
| Distinguish source/date checks from unperformed RSpec runs | Pass | Pass |

Baseline evidence:

> These fixtures become invalid on **2026-09-16**. Quote creation then fails
> before the affected confirmation assertions.

> Freeze time around the affected examples, including their factory setup,
> using the supplemental spec's block-scoped Timecop approach.

Revised evidence:

> These fixtures are valid on introduction day but become invalid on
> **2026-09-16**, when the balance date becomes October 16.

> For the controller context, use an enclosing time block/around hook that also
> covers eager setup.

Both returned `NEEDS CHANGES` for the historical specs and `APPROVED` for the
supplemental spec. Baseline assigned P2; revised assigned P1. That priority
change is an observation, not evidence of a general quality improvement.

Both processes exited 0 with empty stderr. Wall time was 80.69 seconds for
baseline and 83.98 seconds for revised. These concurrent, single-run timings
are descriptive, not a performance comparison. Tokens and cost were not
measured.

## Verification and limitations

- Both skill directories passed `skill-creator/scripts/quick_validate.py` via
  `uv run`, with no errors or warnings.
- `npm test` passed: 19 tests plus validation of 12 agents, 41 skills, and
  6 prompts.
- `git diff --check` passed after the edits.
- The coordinator independently checked date arithmetic: September 15 plus
  30 days equals October 15; September 16 plus 30 days exceeds it; the
  supplemental frozen August 27 date preserves the ordering.
- No Rails/RSpec execution or production patch was part of this replay.
- Reviewer stdout was retained, but tool-event traces were not captured.
  Reviewer-reported Ruby syntax and arithmetic commands were not independently
  audited; only the coordinator's separate date check is directly verified.
- One case, one pair, and a synthetic negative control cannot establish
  reliability or causal improvement. Do not increase reasoning effort or add
  review stages based on this result.

## Local evidence and reproduction

Private source snapshots and full reports are retained locally under the
Git-ignored directory:

```text
sessions/evaluations/2026-09-16-fixture-validity/
  manifest.json
  rubric.json
  task.txt
  prepare.py
  run.py
  baseline-code-reviewer.md
  baseline-testing-strategy.md
  source/
  baseline/{source/,code-reviewer.md,testing-strategy.md,task.txt,output.txt,stderr.txt,run.json}
  candidate/{source/,code-reviewer.md,testing-strategy.md,task.txt,output.txt,stderr.txt,run.json}
```

Each `run.json` records model, reasoning, Pi version, hashes, exit status, and
elapsed time. The archived scripts show preparation and invocation; copy the
case to a new directory before another run to preserve the recorded results.
`run.py candidate` reads the current global skills, so use the archived candidate
policy files if reproducing this exact revision rather than evaluating a later
one. The sparse snapshot is not an executable Talkadot checkout.

The CLI profile was:

```text
pi --print --no-session --no-context-files --no-skills --no-extensions
   --no-prompt-templates --tools read,bash
   --provider openai-codex --model gpt-6-astra --thinking high
   --append-system-prompt <complete supplied skill bodies> <task text>
```

Both runs set `PI_OFFLINE=1` to skip startup network operations; inference still
used the configured Codex provider. Reproduction requires access to that
provider and, if rebuilding the private source snapshot, Talkadot GitHub access.
