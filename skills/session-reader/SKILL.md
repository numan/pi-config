---
name: session-reader
description: Parse and analyze Pi session JSONL files or session history, returning an evidence-backed account of what occurred.
---

# Read Pi sessions

Use this skill to inspect Pi session JSONL without flooding context with raw tool
payloads. Sessions usually live under `~/.pi/agent/sessions/`.

Resolve every relative path below against this skill's directory.

## Workflow

1. Locate candidate sessions by project and modification time.
2. Start with the table of contents.
3. Read the relevant conversation range.
4. Drill into individual turns or subagents only when needed.
5. Report claims with turn numbers, timestamps, tool names, or session paths.

```bash
ls -t ~/.pi/agent/sessions/*<project>*/*.jsonl | head -10
uv run <skill-dir>/scripts/read_session.py <path> --mode toc
uv run <skill-dir>/scripts/read_session.py <path> --offset 5 --limit 3
uv run <skill-dir>/scripts/read_session.py <path> --mode turn --turn 7
```

Replace `<skill-dir>` with this skill's absolute directory before running the
command.

## Modes

| Mode | Purpose |
| --- | --- |
| `conversation` | User and assistant text with compact tool hints |
| `toc` | Numbered exchange map for navigation |
| `turn` | Full detail for one exchange |
| `issues` | Errors, retries, failures, and complaints |
| `overview` | Session metadata and exchange summaries |
| `full` | Complete messages and tool I/O |
| `tools` | Tool calls and results only |
| `costs` | Token and cost data by turn |
| `subagents` | Delegated tasks, status, cost, and session paths |

Useful flags include `--offset`, `--limit`, `--turn`, `--search`, and
`--max-content`.

For a delegated session, take the JSONL path from `--mode subagents` and run the
same table-of-contents-first workflow against it.

Read `<skill-dir>/references/session-format.md` only when custom parsing is
necessary.

## Output

Return a concise account of what happened, supporting evidence, unresolved
ambiguity, and any relevant subagent paths. Don't expose secrets or reproduce
large raw payloads unless the user explicitly needs them.
