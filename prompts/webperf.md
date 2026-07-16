---
description: Run a sourced web-performance audit for a URL, route, artifact, or browser-facing change
argument-hint: "[url-or-scope]"
---

Use the `web-performance-auditor` agent for `$ARGUMENTS`. Don't use this command
for a CLI, utility library, or server-only change without browser output.

Pass the target, framework or route when known, and all available Lighthouse,
CrUX, PageSpeed, trace, or live-browser artifacts.

Use measurement mode when valid runtime artifacts are available. Otherwise use
source mode, mark every finding as `potential impact`, and mark metrics as
`not measured`.

Return the full scorecard, artifacts used, relevant findings in priority order,
positive observations, and concrete verification-oriented recommendations.
Never infer Core Web Vital measurements from static source.
