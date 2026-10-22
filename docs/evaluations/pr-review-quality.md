# PR review quality replay

Use this bounded source replay to compare frozen review guidance on historical
Talkadot PR #6375. It measures useful findings and unsupported recommendations,
not approval rate. Eight fresh trials completed. Candidate guidance identified
two of five selected finding topics in all three development trials; baseline
identified none of those five. Both accepted the held-out control. Three target
topics were missed by every development response. This is a case-specific
observation, not evidence of general reliability.

## Observed results

The original rubric was sealed before inference. The benchmark worker assigned
these evidence-based scores; they have not been independently human-validated.
The original scoring gave partial credit when a finding lacked the prescribed
repair:

| Pair | Baseline score / 5 | Candidate score / 5 | Full targets, baseline / candidate | Unsupported, baseline / candidate |
|---|---:|---:|---|---|
| 1 | 0 | 1.5 | 0 / 1 | 0 / 0 |
| 2 | 0 | 1.5 | 0 / 1 | 0 / 0 |
| 3 | 0 | 2 | 0 / 2 | 0 / 0 |

Candidate reports consistently identify the wrong-object cache test and the
duplicated proposal-access policy. The original rubric gave the first two only
half credit for the cache finding because they proposed removing the redundant
reset and narrowing the test instead of a same-instance refresh regression.

That repair is valid. The coordinator identified the rubric's restriction before
seeing trial results and confirmed the two reports' evidence afterward. With
equivalent repairs credited, candidate scores are **2, 2, 2 out of 5**; baseline
scores remain **0, 0, 0**. The original scores above and sealed rubric are retained.
The tracked rubric now accepts equivalent repairs for future experiments. No
policy, input, or model trial was changed or rerun for this grading correction.

Neither variant recommends decoupling audit text from identity, named nullable
associations, or moving the feature documentation.

Baseline also reports a source-supported conditional access-policy inconsistency
in two runs. Its operational relevance and acceptable policy repair remain
unverified; it is not scored as an unsupported code-path claim or a target hit.
The third baseline run adds a useful notification-test setup simplification
outside the five-target denominator. Zero target hits does not mean zero useful
review observations. No report makes any of the four predeclared negative
recommendations. Both held-out reports return no findings without inventing
persistence or infrastructure requirements.

| Run | Baseline seconds / tool calls | Candidate seconds / tool calls |
|---|---|---|
| Development 1 | 142.86 / 41 | 127.73 / 41 |
| Development 2 | 131.59 / 40 | 118.72 / 40 |
| Development 3 | 163.28 / 41 | 117.92 / 41 |
| Held-out | 33.21 / 5 | 35.01 / 5 |

Development means: 145.91 seconds baseline, 121.46 candidate; each used 122 tool
calls across three trials. All eight processes took 870.33 seconds total.
Provider-reported total tokens, including cache reads: 1,423,674 baseline and
1,167,230 candidate for development. Reported catalog-cost estimates total
7.651076 across eight runs; these are not verified charges. Manual grading time
was not instrumented and is unknown. Sequential order and provider/cache
variation prevent a general performance claim.

All eight runs exited 0 with final `stop`, settled events, unchanged inputs,
empty stderr, and no tool-access violations. No retries, reruns or timeouts were
needed. The private `replay/grades.md` records per-run quotes, source evidence,
partial-credit rationale, extras, negative checks and usage. Preparation tests
pass (7 Python tests); the synthetic control passes 3 Ruby tests/10 assertions.
`npm test` passes (22 tests and agent/skill/prompt validation).

Frozen combined policy hashes:

| Variant | SHA-256 |
|---|---|
| Baseline | `d40af0c580a66114ef995261bd0085965eed3296eef4db4ec4fec784e4512cfc` |
| Candidate | `d13cda8380e4ef6725fa7f815b90589c9278adc9252a6d3c868306f0811d4457` |

## Inputs and policy

The feature head is `be0959fab503cc5c383aec6e53c2d5165046dfe1`. Its merge base
with the historical schema branch is
`fe6b7350cf859c062141d24ee3ae598f8d681a7e`. The schema layer's parent is
`bb03b5a60efb8aef1f3d6843ba7941e1d5f396b8`. Review the feature delta against
the schema layer, not main.
The migration remains supporting context, not a new feature-layer change.

The extractor reads committed Git objects with `git show`; it does not switch
branches, create worktrees, read uncommitted application code, or run Rails.
The development input contains 17 changed files and 18 dependency/instruction
files, a feature diff, and neutral product requirements. The manifest lists
all 35 paths and their SHA-256 hashes. Its sparse snapshot is not a complete
application or an executable dependency closure.

A separate, sealed synthetic input supplies a small grant/proposal implementation,
its focused tests, and feature documentation. It is withheld from development
trials and prompt/policy tuning. Its expected outcome is not in the agent input.
The benchmark author knows its design; this is a held-out execution check, not
an independently authored blind test.

Freeze these complete policy files, in this order, as the code-quality lens:

1. `agents/code-quality.md`
2. `skills/code-simplifier/SKILL.md`
3. `skills/testing-strategy/SKILL.md`
4. `skills/code-reviewer/SKILL.md`

Baseline bodies come from Git commit
`ed160a57d898f99bc40b4c97718126c4f807feff`. Candidate bodies come from disk once,
only after candidate-ready. Both include full frontmatter and bodies, with path
headers, through an explicit appended system prompt. Individual and combined
hashes are recorded. The changed role and testing/reviewer skills are included;
other global guidance is not. Both variants explicitly receive the same three
skill selections, including code-simplifier, so this does not measure automatic
skill-routing improvements. The neutral system prompt keeps execution read-only
without checklist approval despite the supplied role's implementation workflow.
The task is a fresh review request, without a previously approved checklist.

## Prepare and validate

Run from this configuration repository. Python 3, Git, Ruby with standard-library
Minitest, the historical Talkadot Git objects, and Pi 1.4.0 are available in the
preparation environment. There are no new dependencies.

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest discover \
  -s scripts/evaluations -p 'test_*.py'
ruby sessions/evaluations/2026-10-22-pr-review-quality/sealed-control/grants_test.rb
```

Private inputs and reports live only under the existing Git-ignored directory:

```text
sessions/evaluations/2026-10-22-pr-review-quality/
  sealed-control/                 # synthetic input sealed before trials
  sealed-control.tar.gz           # local preservation copy
  replay/
    manifest.json
    grades.md                     # manual evidence and effort
    rubric.md                     # outside reviewer input
    task.txt
    inputs/{development,heldout}/
    policies/{baseline,candidate}/policy.md
    runs/<case>/<trial>-<variant>/
      input/                      # fresh copy, no previous report or rubric
      trace.jsonl
      stderr.txt
      report.md
      run.json
```

Source snapshots, the synthetic control, frozen policies, traces, and grades are
local-only and Git-ignored. A fresh clone alone cannot reproduce the held-out
case: preserve the original control or its local archive, not a rewritten
replacement. Archive and restore it without changing its bytes:

```bash
tar -czf sessions/evaluations/2026-10-22-pr-review-quality/sealed-control.tar.gz \
  -C sessions/evaluations/2026-10-22-pr-review-quality sealed-control
# On a machine with the archived file copied into the same ignored directory:
tar -xzf sessions/evaluations/2026-10-22-pr-review-quality/sealed-control.tar.gz \
  -C sessions/evaluations/2026-10-22-pr-review-quality
```

Compare restored control file hashes with `manifest.json`'s `inputs.heldout`
before using it. Preserve the entire ignored directory to reproduce the exact
frozen policy and trial evidence. The tracked runner and rubric contain no
private application source.

The initial preparation has already run. Do not overwrite it. To rebuild in a
new ignored directory, retain the sealed control unchanged and choose a fresh
root:

```bash
python3 scripts/evaluations/pr_review_quality.py \
  --root sessions/evaluations/2026-10-22-pr-review-quality/replay-new \
  prepare --repo /home/arch/repos/talkadot \
  --control sessions/evaluations/2026-10-22-pr-review-quality/sealed-control
```

The script refuses an existing output directory or a destination not ignored
by Git. Preparation does not freeze policies or invoke inference. For an alternate root,
pass that same `--root <path>` before `freeze` and `run` in every command below.
The default root already contains the completed experiment and must not be reused.

## Freeze and run after candidate-ready

Only after the coordinator signals candidate-ready:

```bash
python3 scripts/evaluations/pr_review_quality.py freeze --candidate-ready
```

Default profile: `openai-codex/gpt-6-astra`, thinking `high`, tools
`read,grep,find,ls`. Override provider/model/thinking only on `freeze`, never
between variants. The runner records and checks the Pi version and global
settings hash. It does not inspect authentication files; Pi uses its normal
configured authentication.

Predeclared budget: three development pairs, then one held-out pair, at most
900 seconds per process. Run sequentially in alternating order:

```bash
for pair in 1 2 3; do
  variants='baseline candidate'
  if [ "$pair" = 2 ]; then variants='candidate baseline'; fi
  for variant in $variants; do
    python3 scripts/evaluations/pr_review_quality.py \
      run development "$variant" --trial "$pair" || exit 1
  done
done
for variant in candidate baseline; do
  python3 scripts/evaluations/pr_review_quality.py \
    run heldout "$variant" --trial 1 || exit 1
done
```

Do not inspect held-out responses or change guidance during development trials.
Preserve failures; do not silently rerun an unsuccessful attempt. Runs refuse
to overwrite output. A policy change requires a new experiment directory and
disclosure, not a substituted candidate in this batch.

Each invocation uses JSON mode, no persisted session, an explicit neutral system
prompt and explicit frozen policy, and disables context discovery, skills,
extensions, MCP, prompt templates, themes, project trust, and automatic startup
network operations. Parent `PI_*` session variables are removed. Source tools
are read-only; no shell, write, edit, application execution, or network tool is
exposed. Inference itself still needs the provider network connection.

The working directory is not an OS sandbox. Read-only built-ins can technically
read outside it; the prompt forbids that and the runner audits resolved tool
paths (including symlinks) and invalidates violations. Explicit system and
append prompts prevent loading global `SYSTEM.md`/`APPEND_SYSTEM.md`. Other
normal Pi runtime/provider configuration is shared, not containerized.

The runner captures raw JSON events, stderr, final report, elapsed time,
provider-reported usage, tool-call count, command, hashes and validity. A zero
process exit alone is insufficient: it also requires an un-aborted settled
event, a final `stop` response with text, unchanged inputs, and no tool-access
violations. Timeouts and truncated/error/aborted responses are invalid, not
missed findings.

## Grade and report

The [current rubric](../../scripts/evaluations/rubric.md) covers five
targets: wrong-object cache coverage, duplicated access policy, audit reason as
identity, nullable foreign-key associations, and misplaced feature documentation.
It also checks unsupported transaction-loss claims, guaranteed same-Redis
fallbacks, privacy-blind raw exception advice, and objections to required repeat
grants or automatic count bypass. No labels or grading rules enter agent input.

For each run, save a private grading record with target scores (0, 0.5, 1),
quotes and source evidence, complete target hits, unsupported findings and
severity, low-value extras, manual grading minutes, and limitations. Use the
held-out pair to check for invented defects, not to tune the prompt. Summarize
all per-run grades, paired differences, elapsed time, tool effort and available
usage/cost. Mark absent provider metrics unknown. Record who graded each run;
agent-assigned scores need maintainer calibration before being treated as a
human-validated benchmark. Do not use keyword matching.

One selected PR, author-known targets, a synthetic control, and three pairs
cannot establish general reliability or statistical significance. Grading is
not blinded or independently human-validated. Changes to the role and composed
skills cannot isolate the effect of one sentence. This replay does not execute Rails, Redis, Sidekiq, or external event
integrations, and does not measure repository-wide discovery or full agent
orchestration. Keep those limits alongside any eventual result.
