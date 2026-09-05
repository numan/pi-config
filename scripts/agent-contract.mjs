const allowedFields = new Set([
  "auto-exit",
  "cli",
  "cwd",
  "deny-tools",
  "description",
  "disable-model-invocation",
  "interactive",
  "license",
  "model",
  "name",
  "session-mode",
  "skills",
  "source",
  "spawning",
  "system-prompt",
  "thinking",
  "tools",
]);

const knownTools = new Set([
  "ask_user_question",
  "bash",
  "claude",
  "code_search",
  "edit",
  "execute_command",
  "fetch_content",
  "get_search_content",
  "openai_image",
  "read",
  "set_tab_title",
  "source_check",
  "subagent",
  "subagent_done",
  "subagent_interrupt",
  "subagent_resume",
  "subagents_list",
  "todo",
  "web_search",
  "write",
]);

const thinkingLevels = new Set([
  "off",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
]);
const booleanFields = [
  "auto-exit",
  "disable-model-invocation",
  "interactive",
  "spawning",
];
const sessionModes = new Set(["standalone", "lineage-only", "fork"]);
const systemPromptModes = new Set(["append", "replace"]);

function commaSeparated(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function validateAgentMetadata({ metadata, fileName, skillNames }) {
  const issues = [];
  const expectedName = fileName.replace(/\.md$/, "");

  for (const key of Object.keys(metadata)) {
    if (!allowedFields.has(key)) issues.push(`unknown frontmatter field: ${key}`);
  }

  if (metadata.name !== expectedName) {
    issues.push(`name must match filename ${expectedName}`);
  }
  if (!metadata.description) issues.push("missing description");
  if (metadata.model !== "openai-codex/gpt-5.6-sol") {
    issues.push("model must be openai-codex/gpt-5.6-sol");
  }
  if (metadata.skill) issues.push("use plural skills frontmatter");

  if (metadata.thinking && !thinkingLevels.has(metadata.thinking)) {
    issues.push(`invalid thinking level: ${metadata.thinking}`);
  }
  for (const field of booleanFields) {
    if (metadata[field] && !["true", "false"].includes(metadata[field])) {
      issues.push(`invalid boolean ${field}: ${metadata[field]}`);
    }
  }
  if (metadata["session-mode"] && !sessionModes.has(metadata["session-mode"])) {
    issues.push(`invalid session-mode: ${metadata["session-mode"]}`);
  }
  if (
    metadata["system-prompt"] &&
    !systemPromptModes.has(metadata["system-prompt"])
  ) {
    issues.push(`invalid system-prompt: ${metadata["system-prompt"]}`);
  }

  for (const field of ["tools", "deny-tools"]) {
    if (!metadata[field]) continue;
    for (const tool of commaSeparated(metadata[field])) {
      if (!knownTools.has(tool)) issues.push(`unknown ${field} entry: ${tool}`);
    }
  }

  if (metadata.skills) {
    for (const skill of commaSeparated(metadata.skills)) {
      if (!skillNames.has(skill)) issues.push(`unknown skill: ${skill}`);
    }
  }

  return issues;
}
