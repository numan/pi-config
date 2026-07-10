---
description: Run a web performance audit via the web-performance-auditor agent
argument-hint: "[url-or-scope]"
---

`/webperf` targets web applications specifically. Do not use it for utility libraries, CLIs, or server-only code with no browser-facing output.

## Determine the mode

**Deep mode** — activate when any of these is available:

- Lighthouse JSON report.
- PageSpeed Insights JSON response with Lighthouse and CrUX data.
- CrUX API response.
- DevTools performance trace.
- A live URL plus configured performance tooling.
- Chrome DevTools MCP CLI output supplied by the user.

**Quick mode** — default when no measurement artifacts are available. Scan source code for structural anti-patterns and label every finding as `potential impact`.

## Run the audit

Spawn the `web-performance-auditor` subagent. Pass it explicitly:

- `$ARGUMENTS`, interpreted as URL, route, files, components, or diff scope.
- Any artifact paths or pasted JSON content.
- The target URL or page name when known.
- Which mode you expect: Quick or Deep.

The subagent must return a scorecard populated only with sourced values, a ranked list of findings, positive observations, and recommendations. Never fabricate metrics. Mark unmeasured fields as `not measured`.

## Output

Return the full audit report to the user. No merge step is needed; this is a single-agent command.
