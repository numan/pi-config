import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { __test__ } from "../extensions/visually-test-branch/index.ts";

const { buildRunDir, seedRunArtifacts, buildInjectedPrompt } = __test__;

const testRoots = new Set<string>();

function createDeterministicRoot(name: string): string {
  const root = join(tmpdir(), `pi-agent-${name}`);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  testRoots.add(root);
  return root;
}

afterEach(() => {
  for (const root of testRoots) {
    rmSync(root, { recursive: true, force: true });
  }
  testRoots.clear();
});

describe("visually-test-branch extension helpers", () => {
  it("buildRunDir uses the date-prefixed branch slug and increments for uniqueness", () => {
    const cwd = createDeterministicRoot("visual-run-dir");
    const now = new Date("2026-04-22T12:47:24.000Z");

    const first = buildRunDir(cwd, now, "feature-branch");
    assert.equal(first, join(cwd, "pi", "visual-tests", "2026-04-22-feature-branch"));

    mkdirSync(first, { recursive: true });
    const second = buildRunDir(cwd, now, "feature-branch");
    assert.equal(second, join(cwd, "pi", "visual-tests", "2026-04-22-feature-branch-2"));

    mkdirSync(second, { recursive: true });
    const third = buildRunDir(cwd, now, "feature-branch");
    assert.equal(third, join(cwd, "pi", "visual-tests", "2026-04-22-feature-branch-3"));
  });

  it("seedRunArtifacts writes the manifest and required context files inside the run directory", () => {
    const cwd = createDeterministicRoot("visual-seed");
    const runDir = join(cwd, "pi", "visual-tests", "2026-04-22-fake-branch");
    const metadata = {
      command: "/visually-test-branch" as const,
      cwd,
      branch: "feature/fake-branch",
      branchSlug: "feature-fake-branch",
      runDir,
      createdAt: "2026-04-22T12:47:24.000Z",
      userIntent: "Check the settings page and dashboard.",
      seededFiles: {
        workflow: "/fake/extensions/visually-test-branch/workflow.md",
        launch: "context/launch.md",
        artifactContract: "context/artifact-contract.md",
      },
    };

    seedRunArtifacts(metadata);

    const runJsonPath = join(runDir, "run.json");
    const launchPath = join(runDir, "context", "launch.md");
    const artifactContractPath = join(runDir, "context", "artifact-contract.md");

    assert.equal(existsSync(runJsonPath), true);
    assert.equal(existsSync(launchPath), true);
    assert.equal(existsSync(artifactContractPath), true);

    assert.deepEqual(JSON.parse(readFileSync(runJsonPath, "utf8")), metadata);
    assert.equal(
      readFileSync(launchPath, "utf8"),
      [
        "# Launch Context",
        "",
        "- Command: /visually-test-branch",
        `- Working directory: ${cwd}`,
        "- Git branch: feature/fake-branch",
        "- Branch slug: feature-fake-branch",
        `- Run directory: ${runDir}`,
        "- Created at: 2026-04-22T12:47:24.000Z",
        "- User intent: Check the settings page and dashboard.",
        "",
      ].join("\n"),
    );
    assert.equal(
      readFileSync(artifactContractPath, "utf8"),
      [
        "# Artifact Contract",
        "",
        "All artifacts for this /visually-test-branch run must live inside this run directory.",
        "",
        `- Canonical run directory: ${runDir}`,
        `- Launch metadata: ${join(runDir, "run.json")}`,
        `- Launch context: ${join(runDir, "context", "launch.md")}`,
        "- Do not write run artifacts to /tmp.",
        "- Do not use the session artifact folder as the source of truth.",
        "- Create any additional files under this directory tree only.",
        "",
      ].join("\n"),
    );
  });

  it("buildInjectedPrompt preserves the exact skill wrapper and run-context block shape", () => {
    const metadata = {
      command: "/visually-test-branch" as const,
      cwd: "/repo",
      branch: "feature/fake-branch",
      branchSlug: "feature-fake-branch",
      runDir: "/repo/pi/visual-tests/2026-04-22-feature-fake-branch",
      createdAt: "2026-04-22T12:47:24.000Z",
      userIntent: "",
      seededFiles: {
        workflow: "/repo/extensions/visually-test-branch/workflow.md",
        launch: "context/launch.md",
        artifactContract: "context/artifact-contract.md",
      },
    };

    const prompt = buildInjectedPrompt(
      metadata.seededFiles.workflow,
      "# Workflow\n\nDo the thing.",
      metadata,
    );

    assert.equal(
      prompt,
      [
        `<skill name="visually-test-branch" location="${metadata.seededFiles.workflow}">`,
        "# Workflow",
        "",
        "Do the thing.",
        "</skill>",
        "",
        "Run context:",
        `- Canonical run directory: ${metadata.runDir}`,
        `- Launch metadata: ${join(metadata.runDir, "run.json")}`,
        `- Current branch: ${metadata.branch}`,
        `- Working directory: ${metadata.cwd}`,
        "- User intent: (none provided)",
      ].join("\n"),
    );
  });
});
