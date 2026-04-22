{
  "id": "2a8db1bd",
  "title": "Todo 1: Add /visually-test-branch launcher extension and run-directory bootstrap",
  "tags": [
    "visually-test-branch"
  ],
  "status": "closed",
  "created_at": "2026-04-22T12:32:14.875Z"
}

**Plan:** `/Users/numan/.pi/agent/.pi/plans/2026-04-22-test-branch-skill/plan.md`

## What
Add a local extension-backed launcher for `/visually-test-branch`. This is the runtime entry point that mirrors `/plan`’s injection pattern but keeps all new logic local to this repo. It must create the canonical run directory under `pi/visual-tests/YYYY-MM-DD-<name>/`, seed bootstrap artifacts there, and inject the workflow markdown into the current session.

## Constraints
- Do **not** modify `git/github.com/HazAT/pi-interactive-subagents/**`; keep this feature local to `/Users/numan/.pi/agent`.
- Register the new extension in `settings.json`; do **not** rely on generic skill discovery for the slash command.
- The run directory must be created **before** sending the workflow prompt.
- All seeded files for a run must live inside the run directory; no `/tmp`, no session artifact folder as the source of truth.
- Detect the current branch with a real git command (e.g. `git rev-parse --abbrev-ref HEAD`) and slug it for the run name.
- If the same-day run directory already exists, generate a unique sibling folder rather than reusing it silently.
- Follow the `/plan` injection pattern in `git/github.com/HazAT/pi-interactive-subagents/pi-extension/subagents/index.ts` around the `pi.registerCommand("plan", ...)` block and the skill wrapping format `<skill name="..." location="...">`.
- Do **not** implement a generic workflow loader. This command is purpose-built for `visually-test-branch`.

## Files
- `extensions/visually-test-branch/index.ts` — register `/visually-test-branch`, build the run path, create seed artifacts, inject workflow markdown
- `settings.json` — enable the new local extension package/path
- `extensions/visually-test-branch/workflow.md` — read by the launcher (create placeholder import path even if Todo 2 fills the final content)

## Expected Outcome
Running `/visually-test-branch` creates a deterministic run folder in `pi/visual-tests/...`, writes launch metadata there, and sends a user message containing the workflow markdown wrapped in a `<skill>` tag plus explicit run-path context.

### Example
Use the `/plan` command shape as the reference for prompt injection, but add run-dir seeding before `sendUserMessage`:

```ts
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

pi.registerCommand("visually-test-branch", {
  description: "Launch branch visual QA: /visually-test-branch [optional focus]",
  handler: async (args, ctx) => {
    const workflowPath = join(dirname(new URL(import.meta.url).pathname), "workflow.md");
    const runDir = ensureVisualTestRunDir(process.cwd(), branchName, args);

    mkdirSync(join(runDir, "context"), { recursive: true });
    writeFileSync(join(runDir, "run.json"), JSON.stringify({ branchName, runDir }, null, 2));

    let content = readFileSync(workflowPath, "utf8").replace(/^---\n[\s\S]*?\n---\n*/, "");
    pi.sendUserMessage(
      `<skill name="visually-test-branch" location="${workflowPath}">\n${content.trim()}\n</skill>\n\nRun directory: ${runDir}`,
    );
  },
});
```

## Acceptance Criteria
- [ ] `/visually-test-branch` is registered from a local extension, satisfying ISC-2 and ISC-3.
- [ ] A run directory is created under `pi/visual-tests/YYYY-MM-DD-<name>/`, satisfying ISC-31 through ISC-33.
- [ ] `run.json` and at least one human-readable context file are seeded inside the run directory, supporting ISC-30, ISC-32, and ISC-39.
- [ ] The injected prompt uses `<skill name="visually-test-branch" ...>` and reads from `extensions/visually-test-branch/workflow.md`.
- [ ] No code changes are made under `git/github.com/HazAT/pi-interactive-subagents/**`, satisfying ISC-A-1.
