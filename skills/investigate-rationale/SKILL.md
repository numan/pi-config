---
name: investigate-rationale
description: Investigate why existing code or a design decision exists using historical evidence. Use for rationale questions, not runtime walkthroughs or branch summaries.
metadata:
  source: https://github.com/cursor/plugins/tree/main/pstack/skills/why
  source-revision: be432a96ed36e48d05f44bf375864355f62263f9
---

# Investigate rationale

Explain the historical reasons for a specific implementation or design decision.
Return a cited account that separates recorded intent from interpretation.
This is a read-only investigation; a question about why code exists does not
itself authorize changing it.

## Anchor the question

Identify the target symbol, file, behavior, or decision from the request and
available context. Read the relevant code and note the current file and line
range. Resolve routine ambiguity from context; ask only when different targets
would materially change the investigation.

Use `learn-branch` for a current-branch briefing instead. A runtime walkthrough
does not need historical research unless the user also asks about intent.

## Trace the relevant history

Start with local evidence: nearby comments, tests, design records, and commits.
Use targeted blame and file history to locate the introduction or substantive
change, then inspect its message and diff. Follow renames, moves, or earlier
versions when the latest edit is only formatting or cleanup. Expand history
only to resolve a specific gap; don't dump the full repository history.

Read linked PR descriptions, review discussions, or issues when local evidence
is insufficient or references them as the rationale. Use `github` when querying
GitHub. Search other systems only when relevant and authorized; an available
connector is not a reason to search it. Do not sweep unrelated chats, sessions,
credentials, or private workspaces.

Delegate only substantial independent evidence gathering. Pass each investigator
the code anchor, question, known evidence, and unresolved gap. There is no
required investigator count or exhaustive list of systems to search.

## Assess the evidence

For each material explanation, distinguish:

- **Documented intent:** a contemporary comment, commit, PR, issue, or design
  record explicitly states the reason. Cite the passage and check what the
  associated change actually implemented.
- **Supported inference:** indirect evidence supports an explanation without
  stating it. Cite the evidence and label the explanation as inferred.
- **Unknown or speculative:** evidence is missing or several explanations fit.
  Name the gap; offer competing hypotheses only when they help answer the
  question, and identify what would distinguish them.

Code shows behavior, not the author's motivation. A plausible explanation today
is not proof of historical intent. Treat a hypothesis in the user's question as
one candidate, not a conclusion. If sources conflict, report the disagreement
rather than choosing the tidiest account. Distinguish the original reason from
whether its constraints still apply today.

## Stop and report

Stop when the question is supported by relevant evidence and no material
contradiction remains, or when a bounded search cannot resolve the remaining
gap. Report inaccessible sources or incomplete history rather than expanding
into unrelated systems. Do not run tests merely to establish historical intent.

Lead with the answer and its confidence. Include the target, source links or
commit hashes and file paths, material inferences, and unresolved questions.
Identify what was actually searched when the answer remains unknown. Keep the
report proportional; omit empty sections.

If the user is considering a change, summarize any evidenced constraints to
preserve and assumptions to recheck. Do not turn the investigation into an
unsolicited redesign or implementation.
