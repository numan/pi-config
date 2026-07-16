import assert from "node:assert/strict";
import test from "node:test";

import { validateAgentMetadata } from "./agent-contract.mjs";

const skillNames = new Set(["code-reviewer"]);
const valid = {
  name: "reviewer",
  description: "Review code.",
  model: "openai-codex/gpt-5.6-sol",
  thinking: "high",
  tools: "read, bash, write",
  skills: "code-reviewer",
  spawning: "false",
  "auto-exit": "true",
  "system-prompt": "append",
  "session-mode": "lineage-only",
};

function issues(overrides) {
  return validateAgentMetadata({
    metadata: { ...valid, ...overrides },
    fileName: "reviewer.md",
    skillNames,
  });
}

test("accepts the runtime-controlling agent contract", () => {
  assert.deepEqual(issues({}), []);
});

for (const [name, overrides, expected] of [
  ["thinking", { thinking: "definitely-invalid" }, /invalid thinking level/],
  ["boolean", { spawning: "sometimes" }, /invalid boolean spawning/],
  ["session mode", { "session-mode": "shared" }, /invalid session-mode/],
  ["system prompt", { "system-prompt": "merge" }, /invalid system-prompt/],
  ["tool", { tools: "read, imaginary_tool" }, /unknown tools entry/],
  ["denied tool", { "deny-tools": "imaginary_tool" }, /unknown deny-tools entry/],
  ["skill", { skills: "missing-skill" }, /unknown skill/],
  ["field", { typo_field: "value" }, /unknown frontmatter field/],
  ["singular skill", { skill: "code-reviewer", skills: "" }, /use plural skills/],
]) {
  test(`rejects an invalid ${name}`, () => {
    assert.match(issues(overrides).join("\n"), expected);
  });
}
