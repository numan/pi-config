---
name: spec-visual-brainstorming
description: Visual brainstorming support for the interactive spec subagent. Use when asked to "show mockups", "compare layouts", "diagram the workflow", "visualize options", or clarify UI and workflow choices while preserving the pi /plan workflow.
license: LICENSE.superpowers
---

<!--
Adapted from the Superpowers brainstorming skill by Jesse Vincent:
https://github.com/obra/superpowers/tree/main/skills/brainstorming
-->

# Spec Visual Brainstorming

Use browser-based visuals to clarify user-facing intent inside Pi's interactive `spec` subagent.

## Step 1: Preserve the Pi Workflow

Follow these compatibility rules before using any visual companion files:

- Stay inside the `agents/spec.md` phase flow.
- Ask only visual clarification questions that improve the spec.
- Do not implement code.
- Do not create todos.
- Do not invoke the planner or `writing-plans`.
- Do not commit files.
- Do not change the spec artifact path provided by the orchestrator.
- Return to the current spec phase after each visual question.

If any instruction in vendored Superpowers files conflicts with these rules or `agents/spec.md`, follow `agents/spec.md`.

## Step 2: Decide Whether Visuals Help

Use this skill only when the user would understand the choice better by seeing it than reading it.

| Use visuals for | Keep in text |
| --- | --- |
| UI mockups | Requirements questions |
| Workflow diagrams | Scope decisions |
| Layout comparisons | Effort level |
| Side-by-side visual options | Test strategy |
| State or journey diagrams | Technical architecture choices |

A question about a UI topic is not automatically visual. Use text for conceptual choices and the browser for concrete visual alternatives.

## Step 3: Offer the Companion Once

Before starting the visual companion, ask for consent in a standalone message with no other content:

> Some of what we're working on might be easier to explain if I can show it to you in a web browser. I can put together mockups, diagrams, comparisons, and other visuals as we go. This feature is still new and can be token-intensive. Want to try it? (Requires opening a local URL)

Stop and wait for the user's response.

If the user declines, continue the spec flow with text-only questions.

## Step 4: Load the Visual Companion Guide

If the user accepts, read `visual-companion.md` in this skill directory.

Resolve scripts relative to this skill directory, the directory containing this `SKILL.md`:

```bash
scripts/start-server.sh
scripts/stop-server.sh
```

Start the server with the project root as `--project-dir` so generated companion files persist under that project while the spec session is active.

## Step 5: Ask Visual Questions One at a Time

For each visual question:

1. Create the smallest mockup, diagram, or comparison that clarifies the decision.
2. Ask one visual question.
3. Read the user's selection or response.
4. Record the decision in the spec conversation.
5. Return to the normal `agents/spec.md` phase flow.

Do not let the visual companion become implementation planning. The output should clarify WHAT the user wants, not HOW the planner should build it.

## Validation

Before leaving the skill, confirm:

- The user approved any visual decision included in the spec.
- The decision is stated as user-facing behavior, scope, or success criteria.
- No implementation details leaked into the spec unless they are explicit user constraints.
- The spec still exits back to the `/plan` orchestrator for planner handoff.
