---
name: skill-creator
description: Create, register, or update an agent skill and its SKILL.md according to the Agent Skills specification.
---

# Create an agent skill

Create a focused, progressively disclosed skill that Pi and other compatible
Agent Skills harnesses can discover and execute.

Resolve relative resources against this skill's directory.

## Establish the contract

Determine from the request and existing repository context:

- the skill's single job and expected deliverable
- specific user intents that should trigger it
- intents that must not trigger it
- required tools and environment assumptions
- target global, project, or package skill directory
- whether deterministic scripts or conditional references are necessary

Ask only for unresolved choices that materially affect the contract or install
location.

## Choose the smallest structure

Use `SKILL.md` alone when instructions are sufficient. Add:

- `references/` for detailed information loaded only when needed
- `scripts/` for deterministic, repeated processing or external tool wrappers
- `assets/` for output templates or static files

Don't create README, changelog, or setup files that the executing agent doesn't
need.

Read `references/design-principles.md` and
`references/skill-patterns.md` only when the skill's complexity warrants them.
Use `references/workflow-patterns.md` or `references/output-patterns.md` when the
workflow or deliverable needs a reusable pattern.

## Write `SKILL.md`

Use valid frontmatter:

```yaml
---
name: lowercase-hyphenated-name
description: Specific job, trigger, and important exclusion.
---
```

Requirements:

- `name` is 1-64 lowercase letters, digits, or hyphens, with no leading,
  trailing, or consecutive hyphens
- `description` is present, specific, and no longer than 1024 characters
- body instructions use imperative voice
- inputs, outputs, boundaries, stopping conditions, and validation are explicit
- examples remain only when they encode a required contract or measured gap
- reference and script paths are relative to the skill directory
- security or authorization invariants aren't delegated to optional skill text

Pi supports optional `license`, `compatibility`, `metadata`, `allowed-tools`, and
`disable-model-invocation` fields. Use harness-specific fields only when the
target harness requires them. See `references/claude-code-extensions.md` only
for a Claude Code target.

## Scripts

Add a script only when deterministic processing is better than model
instructions. Document its arguments, output schema, errors, and dependencies.
Prefer structured output and safe, idempotent behavior.

For Python scripts, use `uv run` and PEP 723 metadata when dependencies are
needed. In generated instructions, tell the agent to resolve the script path
against that generated skill's directory.

## Validate

From this skill's absolute directory, run:

```bash
uv run <skill-dir>/scripts/quick_validate.py <path-to-created-skill>
```

Replace `<skill-dir>` with this skill's absolute directory. If installed, the
upstream validator is also valid:

```bash
skills-ref validate <path-to-created-skill>
```

Fix every load-blocking error and review warnings. Then verify:

- the name and description trigger the intended requests and exclude adjacent
  workflows
- relative resources exist and are loaded conditionally
- scripts run against a representative safe input
- output and stopping behavior match the contract
- no unnecessary files or duplicated global policy remain

## Register

Pi discovers skills under global `~/.pi/agent/skills/` and `~/.agents/skills/`,
trusted project `.pi/skills/` and `.agents/skills/`, configured skill paths, and
package skill directories. Follow any closer project convention and update an
index only when the repository maintains one.

After creating or changing a global skill, reload Pi so discovery reflects the
new metadata.

## Final output

Report the created or updated paths, trigger contract, validation command and
result, registration action, and any environment requirement that remains.
