# Pi Config

My personal [pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent) configuration — agents, skills, extensions, and prompts that shape how pi works for me.

## Setup

Clone this repo directly to `~/.pi/agent/` — pi auto-discovers everything from there (extensions, skills, agents, AGENTS.md, mcp.json). No symlinks, no manual wiring.

### Fresh machine

```bash
# 1. Install pi (https://github.com/badlogic/pi)

# 2. Clone this repo as your agent config
mkdir -p ~/.pi
git clone git@github.com:HazAT/pi-config ~/.pi/agent

# 3. Run setup (installs packages + extension deps)
cd ~/.pi/agent && ./setup.sh

# 4. Add your API keys to ~/.pi/agent/auth.json

# 5. Restart pi
```

### Updating

```bash
cd ~/.pi/agent && git pull
```

---

## Architecture

This config uses **subagents** — visible pi sessions spawned in cmux terminals. Each subagent is a full pi session with its own identity, tools, and skills. The user can watch agents work in real-time and interact when needed.

### Key Concepts

- **Subagents** — visible cmux terminals running pi. Autonomous agents self-terminate via `subagent_done`. Interactive agents wait for the user.
- **Agent definitions** (`agents/*.md`) — one source of truth for model, tools, skills, and identity per role.
- **Plan workflow** — `/plan` spawns an interactive planner subagent, then orchestrates workers and reviewers.
- **Iterate pattern** — `/iterate` forks the session into a subagent for quick fixes without polluting the main context.

---

## Agents

Specialized roles with baked-in identity, workflow, and review rubrics. Most agents now ship with the [pi-interactive-subagents](https://github.com/HazAT/pi-interactive-subagents) package; local overrides live in `agents/`.

| Agent | Source | Purpose |
|-------|--------|---------|
| **spec** | package | Interactive spec agent — clarifies WHAT to build (intent, requirements, ISC) |
| **planner** | package | Interactive planning — takes a spec and figures out HOW to build it |
| **scout** | package | Fast codebase reconnaissance — gathers context without making changes |
| **worker** | package | Implements tasks from todos, commits with polished messages |
| **reviewer** | package | Reviews code for quality, security, correctness |
| **visual-tester** | package | General visual QA agent — available for ad hoc browser/UI checks |
| **claude-code** | package | Delegates autonomous tasks to Claude Code |
| **researcher** | local | Deep research using parallel.ai tools + Claude Code for code analysis |
| **browser-tester** | local | Dedicated visually-test-branch browser tester — executes feature handoffs, captures run-dir evidence, writes deterministic outcomes |
| **autoresearch** | local | Autonomous experiment loop — runs, measures, and optimizes iteratively |

## Skills

Loaded on-demand when the context matches.

| Skill | When to Load |
|-------|-------------|
| **commit** | Making git commits (mandatory for every commit) |
| **code-simplifier** | Simplifying or cleaning up code |
| **frontend-design** | Building web components, pages, or apps |
| **github** | Working with GitHub via `gh` CLI |
| **iterate-pr** | Iterating on a PR until CI passes |
| **learn-codebase** | Onboarding to a new project, checking conventions |
| **session-reader** | Reading and analyzing pi session JSONL files |
| **skill-creator** | Scaffolding new agent skills |
| **write-todos** | Writing clear, actionable todos from a plan |
| **spec-visual-brainstorming** | Visual mockups, diagrams, and comparisons inside the interactive spec subagent |
| **self-improve** | End-of-session retrospective — surfaces improvements and creates todos |
| **cmux** | Managing terminal sessions via cmux |
| **presentation-creator** | Creating data-driven presentation slides |
| **add-mcp-server** | Adding MCP server configurations |
| **visually-test-branch** | Running branch-focused visual QA for the current local branch with researcher + browser-testing subagents |

## Extensions

| Extension | What it provides |
|-----------|------------------|
| **answer/** | `/answer` command + `Ctrl+.` — extracts questions into interactive Q&A UI |
| **cmux/** | cmux integration — notifications, sidebar, workspace tools |
| **cost/** | `/cost` command — API cost summary |
| **execute-command/** | `execute_command` tool — lets the agent self-invoke slash commands |
| **todos/** | `/todos` command + `todo` tool — file-based todo management |
| **visually-test-branch/** | `/visually-test-branch` launcher — seeds one `pi/visual-tests/...` run directory, then injects the branch QA workflow |

## Commands

| Command | Description |
|---------|-------------|
| `/plan <description>` | Start a planning session — spawns planner subagent, then orchestrates execution |
| `/subagent <agent> <task>` | Spawn a subagent (e.g., `/subagent scout analyze the auth module`) |
| `/iterate [task]` | Fork session into interactive subagent for quick fixes |
| `/answer` | Extract questions into interactive Q&A |
| `/todos` | Visual todo manager |
| `/cost` | API cost summary |
| `/visually-test-branch` | Analyze the current local branch, use `researcher` for branch understanding, run dedicated `browser-tester` subagents backed by `agent-browser`, and save `report/index.html` + `summary.json` inside one `pi/visual-tests/...` run directory |

`/visually-test-branch` is for local branch QA only. It keeps all run artifacts in one seeded directory, summarizes non-UI changes separately, and only claims indirect validation evidence for those changes when the run actually observed it.

## Packages

Installed via `pi install`, managed in `settings.json`.

| Package | Description |
|---------|-------------|
| [pi-interactive-subagents](https://github.com/HazAT/pi-interactive-subagents) | Subagent tools + agent definitions + `/plan`, `/subagent`, `/iterate` commands |
| [pi-parallel](https://github.com/HazAT/pi-parallel) | Parallel web search, extract, research, and enrich tools |
| [pi-smart-sessions](https://github.com/HazAT/pi-smart-sessions) | AI-generated session names |
| [pi-diff-review](https://github.com/badlogic/pi-diff-review) | Interactive diff review UI |
| [chrome-cdp-skill](https://github.com/pasky/chrome-cdp-skill) | Chrome DevTools Protocol CLI for visual testing |

---

## Credits

Extensions from [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff): `answer`, `todos`

Skills from [mitsuhiko/agent-stuff](https://github.com/mitsuhiko/agent-stuff): `commit`, `github`

Skills from [getsentry/skills](https://github.com/getsentry/skills): `code-simplifier`
