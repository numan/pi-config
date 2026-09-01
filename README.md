# Pi Config

Personal [Pi](https://github.com/badlogic/pi-mono/tree/main/packages/coding-agent)
configuration for evidence-backed engineering workflows, visible subagents,
specialized review, and durable todo/QA artifacts.

## Setup

Pi discovers global resources from `~/.pi/agent`, so clone this repository there.
This checkout intentionally uses a local development checkout of
`pi-interactive-subagents`. `setup.sh` looks under `~/Repos` on macOS and
`~/repos` on other systems, then exposes the checkout through the stable
`~/.pi/local-packages/pi-interactive-subagents` path used by `settings.json`.

```bash
# Install Pi first.
case "$(uname -s)" in
  Darwin) REPOS_DIR="$HOME/Repos" ;;
  *) REPOS_DIR="$HOME/repos" ;;
esac
mkdir -p ~/.pi "$REPOS_DIR"
git clone git@github.com:numan/pi-interactive-subagents.git \
  "$REPOS_DIR/pi-interactive-subagents"
git clone git@github.com:numan/pi-config.git ~/.pi/agent
cd ~/.pi/agent
./setup.sh
```

Set `PI_REPOS_DIR` when your checkouts live elsewhere:

```bash
PI_REPOS_DIR="$HOME/code" ./setup.sh
```

Add provider credentials through Pi's normal authentication flow or
`~/.pi/agent/auth.json`, then restart Pi. `setup.sh` treats the tracked
`settings.json` as the source of truth, verifies local package paths, and runs
`pi update --extensions`; it does not maintain a second embedded settings file.

To update:

```bash
cd ~/.pi/agent
git pull
./setup.sh
```

## Architecture

- **Global policy:** `AGENTS.md` defines authorization, evidence, testing,
  validation, context, and delegation boundaries.
- **Named agents:** `agents/*.md` defines each role's model, thinking level,
  tools, skills, spawning behavior, and completion contract.
- **Visible subagents:** `pi-interactive-subagents` launches observable Pi
  sessions, with cmux integration when cmux is available.
- **Durable work state:** the local todos extension stores file-backed tasks;
  workers append structured completion evidence before closing a todo.
- **Durable review state:** `/review`, `/workflow`, and `/ship` use the current
  session's adjacent `*.review.md` record when `PI_SESSION_FILE` is available.
- **Progressive disclosure:** specialist procedures live in `skills/` and load
  only when their descriptions match the task.

## Agents

All role overrides in this repository are local:

| Agent | Purpose |
|---|---|
| `planner` | Resolve material decisions, write a plan, and create todos |
| `worker` | Implement one scoped task and return verified completion evidence |
| `reviewer` | Independent correctness and quality review |
| `scout` | Read-only repository reconnaissance |
| `researcher` | External and primary-source research |
| `context-builder` | Coordinate bounded evidence gathering |
| `code-quality` | Approval-gated behavior-preserving simplification |
| `security-auditor` | Trust-boundary and exploitability review |
| `test-engineer` | Coverage analysis or test-only implementation |
| `web-performance-auditor` | Source- or measurement-backed web performance audit |
| `visual-tester` | General browser-based visual QA |
| `autoresearch` | Bounded autonomous experiment batches |

The installed subagent package also provides runtime tools and any additional
package-owned roles visible through `subagents_list`.

## Skills and prompts

The tracked skills cover planning, implementation, TDD and testing strategy,
debugging, review, security, performance, observability, API/UI design,
documentation, CI/CD, migration, GitHub, launch, and Pi configuration. Use
`/skill:name` for direct invocation or let Pi load matching skills on demand.

Tracked prompt templates:

| Command | Purpose |
|---|---|
| `/workflow` | Plan, approve, implement sequentially, and review |
| `/review` | Review a defined change and update the durable review record |
| `/ship` | Fan out release checks and synthesize GO or NO-GO |
| `/test` | Apply the repository's testing strategy |
| `/code-simplify` | Find and perform scoped simplifications |
| `/webperf` | Audit browser-facing performance |

Package-provided commands include `/plan`, `/subagent`, and `/iterate`. Local
extension commands include `/todos` and `/cost`.

## Local extensions

| Extension | Purpose |
|---|---|
| `extensions/cmux/` | cmux status, notifications, and session metadata |
| `extensions/cost/` | `/cost` API-cost summary |
| `extensions/execute-command/` | Agent-triggered commands and steering |
| `extensions/todos/` | `/todos` TUI and the file-backed `todo` tool |

## Package configuration

`settings.json` is authoritative. Its package sources are:

| Source | Purpose |
|---|---|
| `git:github.com/HazAT/pi-smart-sessions` | AI-generated session names; only `extensions/smart-sessions.ts` is enabled |
| `../local-packages/pi-interactive-subagents` | Stable link to the platform-specific local development checkout |
| `npm:pi-web-access` | Web search, source checking, and content retrieval |
| `npm:pi-powerline-footer` | Footer status information |
| `npm:@juicesharp/rpiv-ask-user-question` | Structured question UI |
| `npm:@juicesharp/rpiv-btw` | Side-channel interaction support |
| `npm:pi-better-openai` | OpenAI provider behavior customization |

The default model is `openai-codex/gpt-5.6-sol` at medium thinking. Local model
providers and overrides live in `models.json`; MCP is currently empty.

## Validation

```bash
npm test
bash -n setup.sh
jq empty settings.json models.json mcp.json package.json
pi list
```

## Credits

Selected skills originate from or incorporate work by mitsuhiko/agent-stuff,
getsentry/skills, Google Gemini CLI, and Addy Osmani's agent-skills collection.
Individual files retain their source and license metadata.
