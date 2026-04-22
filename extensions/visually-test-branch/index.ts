import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";

type LaunchMetadata = {
  command: "/visually-test-branch";
  cwd: string;
  branch: string;
  branchSlug: string;
  runDir: string;
  createdAt: string;
  userIntent: string;
  seededFiles: {
    workflow: string;
    launch: string;
    artifactContract: string;
  };
};

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n*/, "");
}

function slugify(value: string): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return slug || "branch";
}

function getCurrentBranch(cwd: string): string {
  return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
    cwd,
    encoding: "utf8",
  }).trim();
}

function buildRunDir(cwd: string, now: Date, baseName: string): string {
  const date = now.toISOString().slice(0, 10);
  const rootDir = join(cwd, "pi", "visual-tests");
  const baseDir = join(rootDir, `${date}-${baseName}`);

  if (!existsSync(baseDir)) return baseDir;

  let counter = 2;
  while (existsSync(join(rootDir, `${date}-${baseName}-${counter}`))) {
    counter += 1;
  }
  return join(rootDir, `${date}-${baseName}-${counter}`);
}

function seedRunArtifacts(metadata: LaunchMetadata): void {
  mkdirSync(join(metadata.runDir, "context"), { recursive: true });

  writeFileSync(join(metadata.runDir, "run.json"), `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  writeFileSync(
    join(metadata.runDir, metadata.seededFiles.launch),
    [
      "# Launch Context",
      "",
      `- Command: ${metadata.command}`,
      `- Working directory: ${metadata.cwd}`,
      `- Git branch: ${metadata.branch}`,
      `- Branch slug: ${metadata.branchSlug}`,
      `- Run directory: ${metadata.runDir}`,
      `- Created at: ${metadata.createdAt}`,
      `- User intent: ${metadata.userIntent || "(none provided)"}`,
    ].join("\n") + "\n",
    "utf8",
  );
  writeFileSync(
    join(metadata.runDir, metadata.seededFiles.artifactContract),
    [
      "# Artifact Contract",
      "",
      "All artifacts for this /visually-test-branch run must live inside this run directory.",
      "",
      `- Canonical run directory: ${metadata.runDir}`,
      `- Launch metadata: ${join(metadata.runDir, "run.json")}`,
      `- Launch context: ${join(metadata.runDir, metadata.seededFiles.launch)}`,
      "- Do not write run artifacts to /tmp.",
      "- Do not use the session artifact folder as the source of truth.",
      "- Create any additional files under this directory tree only.",
    ].join("\n") + "\n",
    "utf8",
  );
}

export const __test__ = {
  stripFrontmatter,
  slugify,
  buildRunDir,
};

export default function visuallyTestBranchExtension(pi: ExtensionAPI) {
  pi.registerCommand("visually-test-branch", {
    description: "Start the local visually-test-branch workflow for the current git branch.",
    handler: async (args, ctx) => {
      const cwd = ctx.cwd;
      const workflowPath = join(dirname(new URL(import.meta.url).pathname), "workflow.md");
      const userIntent = (args ?? "").trim();

      let branch: string;
      try {
        branch = getCurrentBranch(cwd);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        ctx.ui.notify(`Failed to detect current git branch: ${message}`, "error");
        return;
      }

      const branchSlug = slugify(branch);
      const runDir = buildRunDir(cwd, new Date(), branchSlug);
      const metadata: LaunchMetadata = {
        command: "/visually-test-branch",
        cwd,
        branch,
        branchSlug,
        runDir,
        createdAt: new Date().toISOString(),
        userIntent,
        seededFiles: {
          workflow: workflowPath,
          launch: "context/launch.md",
          artifactContract: "context/artifact-contract.md",
        },
      };

      seedRunArtifacts(metadata);

      let workflowContent = readFileSync(workflowPath, "utf8");
      workflowContent = stripFrontmatter(workflowContent).trim();

      const taskBlock = [
        "Run context:",
        `- Canonical run directory: ${runDir}`,
        `- Launch metadata: ${join(runDir, "run.json")}`,
        `- Current branch: ${branch}`,
        `- Working directory: ${cwd}`,
        `- User intent: ${userIntent || "(none provided)"}`,
      ].join("\n");

      pi.sendUserMessage(
        `<skill name="visually-test-branch" location="${workflowPath}">\n${workflowContent}\n</skill>\n\n${taskBlock}`,
      );
    },
  });
}
