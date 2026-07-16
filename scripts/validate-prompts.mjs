import fs from "node:fs";
import path from "node:path";

import { validateAgentMetadata } from "./agent-contract.mjs";

const root = path.resolve(import.meta.dirname, "..");
const failures = [];

function filesIn(directory, predicate = () => true) {
  return fs
    .readdirSync(path.join(root, directory), { withFileTypes: true })
    .filter((entry) => entry.isFile() && predicate(entry.name))
    .map((entry) => path.join(root, directory, entry.name))
    .sort();
}

function skillFiles() {
  return fs
    .readdirSync(path.join(root, "skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(root, "skills", entry.name, "SKILL.md"))
    .filter(fs.existsSync)
    .sort();
}

function filesRecursively(directory) {
  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...filesRecursively(target));
    else if (entry.isFile() && [".md", ".py", ".sh", ".txt"].includes(path.extname(entry.name))) {
      found.push(target);
    }
  }
  return found;
}

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function relative(file) {
  return path.relative(root, file);
}

function frontmatter(file) {
  const text = read(file);
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    failures.push(`${relative(file)}: missing YAML frontmatter`);
    return {};
  }

  const result = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const field = lines[index].match(/^([a-zA-Z0-9_-]+):(?:\s*(.*))?$/);
    if (!field) continue;

    const [, key, rawValue = ""] = field;
    if (rawValue === "|" || rawValue === ">") {
      const parts = [];
      while (index + 1 < lines.length && /^\s+/.test(lines[index + 1])) {
        parts.push(lines[index + 1].trim());
        index += 1;
      }
      result[key] = parts.join(" ");
    } else {
      result[key] = rawValue.replace(/^(["'])(.*)\1$/, "$2").trim();
    }
  }
  return result;
}

function words(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

const agents = filesIn("agents", (name) => name.endsWith(".md"));
const prompts = filesIn("prompts", (name) => name.endsWith(".md"));
const skills = skillFiles();
const skillMetadata = new Map(skills.map((file) => [file, frontmatter(file)]));
const skillNames = new Set(
  [...skillMetadata.values()].map((metadata) => metadata.name).filter(Boolean),
);
const settings = JSON.parse(read(path.join(root, "settings.json")));

if (settings.defaultProvider !== "openai-codex" || settings.defaultModel !== "gpt-5.6-sol") {
  failures.push(
    `settings.json: default model must be openai-codex/gpt-5.6-sol, found ${settings.defaultProvider}/${settings.defaultModel}`,
  );
}

for (const file of agents) {
  const metadata = frontmatter(file);
  for (const issue of validateAgentMetadata({
    metadata,
    fileName: path.basename(file),
    skillNames,
  })) {
    failures.push(`${relative(file)}: ${issue}`);
  }
}

let skillDescriptionCharacters = 0;
for (const file of skills) {
  const metadata = skillMetadata.get(file);
  const directoryName = path.basename(path.dirname(file));
  if (metadata.name !== directoryName) {
    failures.push(`${relative(file)}: skill name must match directory name`);
  }
  if (!metadata.description) {
    failures.push(`${relative(file)}: missing description`);
  } else {
    skillDescriptionCharacters += metadata.description.length;
    if (metadata.description.length > 200) {
      failures.push(
        `${relative(file)}: discovery description is ${metadata.description.length} characters; keep it at or below 200`,
      );
    }
  }
}

for (const file of prompts) {
  const metadata = frontmatter(file);
  if (!metadata.description) {
    failures.push(`${relative(file)}: missing prompt description`);
  }
}

const promptSources = [
  path.join(root, "AGENTS.md"),
  ...agents,
  ...prompts,
  ...filesRecursively(path.join(root, "skills")),
];
const bannedPatterns = [
  ["${CLAUDE_SKILL_ROOT}", "use a skill-relative path instead of CLAUDE_SKILL_ROOT"],
  ["/mnt/skills/user/", "use a skill-relative path instead of /mnt/skills/user"],
];
for (const file of promptSources) {
  const text = read(file);
  for (const [pattern, message] of bannedPatterns) {
    if (text.includes(pattern)) {
      failures.push(`${relative(file)}: ${message}`);
    }
  }
}

const metrics = {
  agents: agents.reduce((total, file) => total + words(read(file)), 0),
  global: words(read(path.join(root, "AGENTS.md"))),
  prompts: prompts.reduce((total, file) => total + words(read(file)), 0),
  skillDescriptions: skillDescriptionCharacters,
  skillBodies: skills.reduce((total, file) => total + words(read(file)), 0),
};

const budgets = {
  agents: 7000,
  global: 1200,
  prompts: 1800,
  skillDescriptions: 6000,
};
for (const [name, maximum] of Object.entries(budgets)) {
  if (metrics[name] > maximum) {
    failures.push(`${name}: ${metrics[name]} exceeds prompt budget ${maximum}`);
  }
}

console.log("GPT-5.6 Sol prompt metrics:");
for (const [name, value] of Object.entries(metrics)) {
  console.log(`- ${name}: ${value}`);
}

if (failures.length > 0) {
  console.error("\nValidation failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`\nValidated the GPT-5.6 Sol default, ${agents.length} agents, ${skills.length} skills, and ${prompts.length} prompts.`);
