#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXPECTED_DIR="$HOME/.pi/agent"

if [ "$SCRIPT_DIR" != "$EXPECTED_DIR" ]; then
  echo "Error: this repository must be cloned to $EXPECTED_DIR" >&2
  echo "Current location: $SCRIPT_DIR" >&2
  echo "Run: git clone git@github.com:numan/pi-config.git $EXPECTED_DIR" >&2
  exit 1
fi

if ! command -v pi >/dev/null 2>&1; then
  echo "Error: pi CLI not found. Install pi, then rerun ./setup.sh." >&2
  exit 1
fi

if [ ! -f "$EXPECTED_DIR/settings.json" ]; then
  echo "Error: tracked settings.json is missing; restore it from Git." >&2
  exit 1
fi

if [ -n "${PI_REPOS_DIR:-}" ]; then
  REPOS_DIR="$PI_REPOS_DIR"
elif [ "$(uname -s)" = "Darwin" ]; then
  REPOS_DIR="$HOME/Repos"
else
  REPOS_DIR="$HOME/repos"
fi

SUBAGENTS_SOURCE="$REPOS_DIR/pi-interactive-subagents"
SUBAGENTS_LINK="$HOME/.pi/local-packages/pi-interactive-subagents"

if [ ! -d "$SUBAGENTS_SOURCE" ]; then
  echo "Error: pi-interactive-subagents checkout not found at $SUBAGENTS_SOURCE" >&2
  echo "Clone it there or set PI_REPOS_DIR to its parent directory." >&2
  exit 1
fi

mkdir -p "$(dirname "$SUBAGENTS_LINK")"
if [ -L "$SUBAGENTS_LINK" ]; then
  rm "$SUBAGENTS_LINK"
elif [ -e "$SUBAGENTS_LINK" ]; then
  echo "Error: stable package path exists and is not a symlink: $SUBAGENTS_LINK" >&2
  exit 1
fi
ln -s "$SUBAGENTS_SOURCE" "$SUBAGENTS_LINK"

node -e '
  const fs = require("node:fs");
  const path = require("node:path");
  const settingsPath = process.argv[1];
  const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  const base = path.dirname(settingsPath);
  const missing = [];
  for (const entry of settings.packages ?? []) {
    const source = typeof entry === "string" ? entry : entry.source;
    if (!source || /^(npm:|git:|https?:|ssh:)/.test(source)) continue;
    const target = path.resolve(base, source);
    if (!fs.existsSync(target)) missing.push(`${source} (${target})`);
  }
  if (missing.length) {
    console.error("Error: required local Pi package paths are missing:");
    for (const item of missing) console.error(`  - ${item}`);
    console.error("See README.md for local checkout prerequisites.");
    process.exit(1);
  }
' "$EXPECTED_DIR/settings.json"

echo "Reconciling packages from settings.json..."
pi update --extensions

echo "Setup complete. Restart pi to load the reconciled configuration."
