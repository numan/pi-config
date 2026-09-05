# Agents

This repository defines Pi agents for GPT-5.6 Sol. Each file in `agents/`
combines a bounded role with an explicit model, thinking level, tool set, skill
set, and completion behavior. `AGENTS.md` supplies the global engineering and
authorization policy.

## Agent inventory

| Agent | Category | Purpose |
|---|---|---|
| `scout` | Read-only specialist | Map a bounded code area, its behavior, tests, and risks |
| `researcher` | Read-only specialist | Answer an external or technical question with primary-source evidence |
| `reviewer` | Read-only specialist | Review a defined change for material engineering issues |
| `security-auditor` | Read-only specialist | Audit applicable trust boundaries and exploitable risks |
| `test-engineer` | Specialist writer | Analyze coverage or, when explicitly authorized, write tests only |
| `visual-tester` | Read-only specialist | Exercise browser-visible UI behavior and report visual defects |
| `web-performance-auditor` | Read-only specialist | Audit measured or potential browser performance problems |
| `worker` | Implementer | Complete one scoped task and return validation evidence |
| `autoresearch` | Implementer | Run a bounded batch of documented experiments |
| `planner` | Orchestrator | Resolve material choices and write an implementation-ready plan |
| `context-builder` | Orchestrator | Coordinate bounded evidence gathering and write one context artifact |
| `code-quality` | Orchestrator | Propose and coordinate approved behavior-preserving simplifications |

“Read-only specialist” describes product-code behavior. Some specialists have
`write` so they can produce a requested report artifact. Their role instructions
limit that permission to the artifact.

## Execution contract

Every local agent declares `model: openai-codex/gpt-5.6-sol`. The repository
validator rejects another model. Thinking levels vary by role:

- `low` for bounded repository reconnaissance
- `medium` for planning, implementation, browser QA, and routine orchestration
- `high` for broad review, security, performance, and external research

Agent system prompts append to the global policy. Do not switch them to
`replace` unless the replacement preserves authorization, evidence, testing,
and commit boundaries.

Agents with `spawning: false` are leaves. The three orchestrators may launch
bounded children:

- `planner` delegates only to close a blocking codebase or research gap.
- `context-builder` coordinates independent scouts and researchers.
- `code-quality` may use scouts during analysis and workers after checklist
  approval.

Do not add delegation to a leaf agent merely to route work. Give each child one
job, clear resource ownership, relevant evidence, and an output contract.
Parallelize independent read-only work; serialize changes to shared files.

## Agents, skills, and prompts

These layers have separate responsibilities:

| Layer | Responsibility | Example |
|---|---|---|
| Agent | Role, judgment boundary, tools, and output contract | `reviewer` |
| Skill | Specialized procedure loaded when relevant | `code-reviewer` |
| Prompt | User-facing command that composes a workflow | `/review` |

Keep detailed procedures in skills. Agent files should state only the role,
permission boundary, role-specific judgment, and result contract. Prompt
templates decide when to compose agents and who owns shared artifacts.

## Choosing an entry point

Invoke a named agent when one bounded role is enough:

- Use `scout` to understand a code path without designing a solution.
- Use `researcher` for current external facts or primary-source evidence.
- Use `reviewer`, `security-auditor`, or `web-performance-auditor` for one
  specialist assessment.
- Use `worker` for one approved, implementation-ready task.
- Use `planner` when material product or architecture choices remain.

Use a prompt template for a repeatable workflow:

| Command | Behavior |
|---|---|
| `/workflow` | Gather necessary context, approve a plan, implement sequentially, and review |
| `/review` | Review a defined change and update the durable review record when available |
| `/ship` | Run proportional release checks and synthesize a GO or NO-GO decision |
| `/test` | Apply TDD and testing strategy to new or corrected behavior |
| `/code-simplify` | Perform scoped behavior-preserving simplification |
| `/webperf` | Run a browser-facing performance audit |

Use `/ship` for independent release perspectives that can run concurrently.
Use `/workflow` for ordered work where planning, approval, implementation, and
review depend on previous stages. An automated sequential workflow is valid
when it preserves its approval boundary and verifies every child result.

## Shared artifacts

A task may ask a specialist to write an isolated report. Shared records require
one owner:

- In `/ship`, specialists return reports to the coordinator.
- In `/workflow`, the coordinator owns the durable review record and repair
  history.
- A reviewer writes the shared record only when the task explicitly designates
  it as record owner and supplies the path.

When `PI_SESSION_FILE` is available, coordinator prompts derive the adjacent
`*.review.md` path. Children must not independently derive or update that file.

## Adding or changing an agent

1. Create or edit `agents/<name>.md`.
2. Keep the role bounded to one deliverable.
3. Select the minimum tools needed for that role.
4. Load a skill only when it owns a distinct procedure not repeated in the
   agent body.
5. Set the GPT-5.6 Sol model and an explicit thinking level.
6. Enable spawning only for an agent that performs substantive orchestration.
7. Run `npm test`.

Update the inventory above when adding or removing an agent. If a prompt
references the agent, verify the command still assigns ownership, approval, and
shared artifacts unambiguously.
