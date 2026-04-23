import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import visuallyTestBranchExtension, { __test__ } from "../extensions/visually-test-branch/index.ts";

const { buildRunDir, seedRunArtifacts, buildInjectedPrompt } = __test__;

const testRoots = new Set<string>();

function createDeterministicRoot(name: string): string {
  const root = join(tmpdir(), `pi-agent-${name}`);
  rmSync(root, { recursive: true, force: true });
  mkdirSync(root, { recursive: true });
  testRoots.add(root);
  return root;
}

function initGitRepo(root: string, branch = "feature/fake-branch"): void {
  execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "Pi Test"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "pi-test@example.com"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["checkout", "-b", branch], { cwd: root, stdio: "ignore" });
  writeFileSync(join(root, "README.md"), "# test\n", "utf8");
  execFileSync("git", ["add", "README.md"], { cwd: root, stdio: "ignore" });
  execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "init"], {
    cwd: root,
    stdio: "ignore",
  });
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
      templates: {
        testingHandoff: "/fake/extensions/visually-test-branch/templates/testing-handoff.md",
        featureOutcome: "/fake/extensions/visually-test-branch/templates/feature-outcome.md",
        summarySchema: "/fake/extensions/visually-test-branch/templates/summary.schema.json",
        reportOutline: "/fake/extensions/visually-test-branch/templates/report-outline.md",
        finalReportPage: "/fake/extensions/visually-test-branch/templates/final-report-page.md",
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
        `- Testing handoff template: ${metadata.templates.testingHandoff}`,
        `- Feature outcome template: ${metadata.templates.featureOutcome}`,
        `- Summary schema: ${metadata.templates.summarySchema}`,
        `- Report outline: ${metadata.templates.reportOutline}`,
        `- Final report page contract: ${metadata.templates.finalReportPage}`,
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
      templates: {
        testingHandoff: "/repo/extensions/visually-test-branch/templates/testing-handoff.md",
        featureOutcome: "/repo/extensions/visually-test-branch/templates/feature-outcome.md",
        summarySchema: "/repo/extensions/visually-test-branch/templates/summary.schema.json",
        reportOutline: "/repo/extensions/visually-test-branch/templates/report-outline.md",
        finalReportPage: "/repo/extensions/visually-test-branch/templates/final-report-page.md",
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

  it("registers the command and executes the real handler path", async () => {
    const cwd = createDeterministicRoot("visual-handler");
    initGitRepo(cwd, "feature/handler-path");

    let registeredHandler: ((args: string | undefined, ctx: any) => Promise<void>) | undefined;
    let injectedMessage = "";
    const notifications: Array<{ message: string; level: string }> = [];

    visuallyTestBranchExtension({
      registerCommand(name: string, command: { handler: (args: string | undefined, ctx: any) => Promise<void> }) {
        assert.equal(name, "visually-test-branch");
        registeredHandler = command.handler;
      },
      sendUserMessage(message: string) {
        injectedMessage = message;
      },
    } as any);

    assert.ok(registeredHandler, "expected /visually-test-branch to register a handler");

    await registeredHandler!("focus checkout", {
      cwd,
      ui: {
        notify(message: string, level: string) {
          notifications.push({ message, level });
        },
      },
    });

    assert.deepEqual(notifications, []);

    const runRoot = join(cwd, "pi", "visual-tests");
    const [runDirName] = readdirSync(runRoot);
    assert.match(runDirName, /^\d{4}-\d{2}-\d{2}-feature-handler-path$/);

    const runDir = join(runRoot, runDirName);
    assert.equal(existsSync(join(runDir, "run.json")), true);
    assert.equal(existsSync(join(runDir, "context", "launch.md")), true);
    assert.equal(existsSync(join(runDir, "context", "artifact-contract.md")), true);

    const runJson = JSON.parse(readFileSync(join(runDir, "run.json"), "utf8"));
    assert.equal(runJson.branch, "feature/handler-path");
    assert.equal(runJson.userIntent, "focus checkout");
    assert.equal(typeof runJson.templates.testingHandoff, "string");
    assert.equal(typeof runJson.templates.featureOutcome, "string");
    assert.equal(typeof runJson.templates.summarySchema, "string");
    assert.equal(typeof runJson.templates.reportOutline, "string");
    assert.equal(typeof runJson.templates.finalReportPage, "string");
    assert.equal(existsSync(runJson.templates.testingHandoff), true);
    assert.equal(existsSync(runJson.templates.featureOutcome), true);
    assert.equal(existsSync(runJson.templates.summarySchema), true);
    assert.equal(existsSync(runJson.templates.reportOutline), true);
    assert.equal(existsSync(runJson.templates.finalReportPage), true);

    assert.match(injectedMessage, /^<skill name="visually-test-branch" location=".*workflow\.md">/);
    assert.doesNotMatch(injectedMessage, /^---$/m);
    assert.match(injectedMessage, /# Visually Test Branch/);
    assert.match(injectedMessage, /agent: "report-page-builder"/);
    assert.match(injectedMessage, /name: "🧾 Report Page Builder"/);
    assert.match(injectedMessage, /templates\.finalReportPage as the canonical page contract/);
    assert.match(injectedMessage, /templates\.summarySchema as the canonical machine-readable contract/);
    assert.match(injectedMessage, /Run context:/);
    assert.match(injectedMessage, new RegExp(`- Canonical run directory: ${runDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.match(injectedMessage, /- Current branch: feature\/handler-path/);
    assert.match(injectedMessage, /- User intent: focus checkout/);
  });
});
