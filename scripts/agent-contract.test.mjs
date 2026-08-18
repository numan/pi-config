import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { validateAgentMetadata } from "./agent-contract.mjs";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

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

const completionFields = [
  "Status:",
  "Task ID:",
  "Files changed:",
  "Verification:",
  "Commit SHA:",
  "Residual risks:",
];

test("worker and repair workflows share the completion contract", () => {
  for (const file of ["agents/worker.md", "prompts/workflow.md"]) {
    const content = read(file);
    for (const field of completionFields) {
      assert.ok(content.includes(field), `${file} must include ${field}`);
    }
  }

  const workerTools = read("agents/worker.md").match(/^tools:\s*(.+)$/m)?.[1]
    .split(",")
    .map((tool) => tool.trim());
  assert.ok(workerTools?.includes("todo"), "agents/worker.md must allow the todo tool");
  assert.match(read("extensions/todos/index.ts"), /completion record/i);
});

test("review and ship workflows use the shared durable review record", () => {
  const schemaPath = "skills/code-reviewer/references/review-record.md";
  const schema = read(schemaPath);
  for (const field of [
    "**Decision:**",
    "**Session:**",
    "**Plan:**",
    "**Todos:**",
    "**Scope:**",
    "**Reviewed range:**",
    "**Repair rounds:**",
    ...completionFields.map((field) => `**${field}**`),
    "## Specialist Reports",
    "## Residual Risks",
  ]) {
    assert.ok(schema.includes(field), `${schemaPath} must include ${field}`);
  }

  for (const file of [
    "agents/reviewer.md",
    "prompts/review.md",
    "prompts/ship.md",
    "skills/code-reviewer/SKILL.md",
  ]) {
    const content = read(file);
    assert.match(content, /review record/i, `${file} must reference the review record`);
    assert.doesNotMatch(
      content,
      /`skills\/code-reviewer\/references\/review-record\.md`/,
      `${file} must not resolve a global skill from the project cwd`,
    );
  }

  for (const [skillFile, reference] of [
    ["skills/code-reviewer/SKILL.md", "references/review-record.md"],
    ["skills/shipping-and-launch/SKILL.md", "../code-reviewer/references/review-record.md"],
  ]) {
    assert.ok(
      fs.existsSync(path.resolve(path.dirname(path.join(root, skillFile)), reference)),
      `${skillFile} must use a valid skill-relative review record path`,
    );
  }
});

test("setup and README treat settings.json as the package source of truth", () => {
  const setup = read("setup.sh");
  assert.doesNotMatch(setup, /Creating settings\.json/);
  assert.match(setup, /pi update --extensions/);

  const settings = JSON.parse(read("settings.json"));
  const readme = read("README.md");
  for (const entry of settings.packages) {
    const source = typeof entry === "string" ? entry : entry.source;
    assert.ok(readme.includes(`\`${source}\``), `README.md must list ${source}`);
  }
});

test("setup validates local packages and reconciles settings through Pi", (context) => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "pi-config-setup-"));
  context.after(() => fs.rmSync(home, { recursive: true, force: true }));

  const agentDir = path.join(home, ".pi", "agent");
  const binDir = path.join(home, "bin");
  const callsPath = path.join(home, "pi-calls.txt");
  fs.mkdirSync(agentDir, { recursive: true });
  fs.mkdirSync(binDir);
  fs.cpSync(path.join(root, "setup.sh"), path.join(agentDir, "setup.sh"));

  const settings = JSON.parse(read("settings.json"));
  for (const entry of settings.packages) {
    const source = typeof entry === "string" ? entry : entry.source;
    if (source && !/^(npm:|git:|https?:|ssh:)/.test(source)) {
      fs.mkdirSync(path.resolve(agentDir, source), { recursive: true });
    }
  }
  fs.writeFileSync(path.join(agentDir, "settings.json"), JSON.stringify(settings));
  fs.writeFileSync(
    path.join(binDir, "pi"),
    `#!/usr/bin/env bash\nprintf '%s\\n' "$*" >> "${callsPath}"\n`,
    { mode: 0o755 },
  );

  execFileSync("bash", [path.join(agentDir, "setup.sh")], {
    cwd: agentDir,
    env: { ...process.env, HOME: home, PATH: `${binDir}:${process.env.PATH}` },
  });

  assert.equal(fs.readFileSync(callsPath, "utf8").trim(), "update --extensions");
});
