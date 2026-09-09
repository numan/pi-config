---
name: source-driven-development
description: Verify version-sensitive framework or library implementation decisions against current official documentation and cite the sources.
---

# Source-Driven Development

## Overview

Verify version-sensitive framework and library decisions against official
documentation for the installed or explicitly requested version. Cite evidence
for material decisions. Routine, version-independent code does not require
external research or citations.

## When to Use

- The user wants code that follows current best practices for a given framework
- Building boilerplate, starter code, or patterns that will be copied across a project
- The user explicitly asks for documented, verified, or "correct" implementation
- Implementing features where the framework's recommended approach matters (forms, routing, data fetching, state management, auth)
- Reviewing or improving code that uses framework-specific patterns
- Framework-specific behavior depends on an API or version detail not established by current evidence

**When NOT to use:**

- Correctness does not depend on a specific version (renaming variables, fixing typos, moving files)
- Pure logic that works the same across all versions (loops, conditionals, data structures)
- The user explicitly wants speed over verification ("just do it quickly")

## The Process

```
DETECT ──→ FETCH ──→ IMPLEMENT ──→ CITE
  │          │           │            │
  ▼          ▼           ▼            ▼
 What       Get the    Follow the   Show your
 stack?     relevant   documented   sources
            docs       patterns
```

### Step 1: Detect Stack and Versions

Read the project's dependency file to identify exact versions:

```
package.json    → Node/React/Vue/Angular/Svelte
composer.json   → PHP/Symfony/Laravel
requirements.txt / pyproject.toml → Python/Django/Flask
go.mod          → Go
Cargo.toml      → Rust
Gemfile         → Ruby/Rails
```

Report the detected versions when they affect the recommendation. For example:

```
STACK DETECTED:
- React 19.1.0 (from package.json)
- Vite 6.2.0
- Tailwind CSS 4.0.3
→ Fetching official docs for the relevant patterns.
```

If versions are missing or ambiguous, inspect lockfiles and relevant runtime or
build configuration. Ask only when the unresolved version materially affects
the implementation. Preserve an explicitly requested target; don't substitute
the latest release.

### Step 2: Fetch Official Documentation

Fetch the specific documentation page needed to resolve the version-sensitive
decision. Reuse already-inspected evidence when it is current and applicable.

Prefer current official documentation for the target version over bundled skill
references. If remote documentation is unavailable and a bundled fallback is
used, disclose that fallback and any stale or unverified version assumptions.
Don't present bundled model or API guidance as current without verification.

**Source hierarchy (in order of authority):**

| Priority | Source | Example |
|----------|--------|---------|
| 1 | Official documentation | react.dev, docs.djangoproject.com, symfony.com/doc |
| 2 | Official blog / changelog | react.dev/blog, nextjs.org/blog |
| 3 | Web standards references | MDN, web.dev, html.spec.whatwg.org |
| 4 | Browser/runtime compatibility | caniuse.com, node.green |

**Not authoritative — never cite as primary sources:**

- Stack Overflow answers
- Blog posts or tutorials (even popular ones)
- AI-generated documentation or summaries
- Your own training data (that is the whole point — verify it)

**Be precise with what you fetch:**

```
BAD:  Fetch the React homepage
GOOD: Fetch react.dev/reference/react/useActionState

BAD:  Search "django authentication best practices"
GOOD: Fetch docs.djangoproject.com/en/6.0/topics/auth/
```

After fetching, extract the key patterns and note any deprecation warnings or migration guidance.

When official sources conflict with each other (e.g. a migration guide contradicts the API reference), surface the discrepancy to the user and verify which pattern actually works against the detected version.

### Step 3: Implement Following Documented Patterns

Write code that matches what the documentation shows:

- Use the API signatures from the docs, not from memory
- Use patterns compatible with the installed or requested version and task scope
- Flag relevant deprecations; don't expand the task into an unrequested migration
- If the docs don't cover something, flag it as unverified

When documentation differs from existing code, check whether the difference is
a compatibility issue or merely an alternative pattern. Preserve compatible
project conventions. Ask only when an unresolved choice materially changes
behavior, risk, or scope.

### Step 4: Cite Your Sources

Cite the official evidence supporting non-trivial, version-sensitive decisions
in the response. Don't add citations for routine code or repeat the same source
for every use of a pattern. Add a source comment only when it explains a durable
constraint or non-obvious choice future maintainers need.

**When a code comment is warranted:**

```typescript
// React 19 form handling with useActionState
// Source: https://react.dev/reference/react/useActionState#usage
const [state, formAction, isPending] = useActionState(submitOrder, initialState);
```

**In conversation:**

```
I'm using useActionState instead of manual useState for the
form submission state. React 19 replaced the manual
isPending/setIsPending pattern with this hook.

Source: https://react.dev/blog/2024/12/05/react-19#actions
"useTransition now supports async functions [...] to handle
pending states automatically"
```

**Citation rules:**

- Full URLs, not shortened
- Prefer deep links with anchors where possible (e.g. `/useActionState#usage` over `/useActionState`) — anchors survive doc restructuring better than top-level pages
- Quote a relevant passage when paraphrasing would lose a material distinction
- Include browser/runtime support data when compatibility affects the decision
- If a bounded lookup cannot verify a material claim, state the uncertainty and stop rather than widening indefinitely:

```
UNVERIFIED: I could not find official documentation for this
pattern. This is based on training data and may be outdated.
Verify before using in production.
```

Honesty about what you couldn't verify is more valuable than false confidence.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'm confident about this API" | Confidence is not evidence. Training data contains outdated patterns that look correct but break against current versions. Verify. |
| "Fetching docs wastes tokens" | Hallucinating an API wastes more. The user debugs for an hour, then discovers the function signature changed. One fetch prevents hours of rework. |
| "The docs won't have what I need" | If the docs don't cover it, that's valuable information — the pattern may not be officially recommended. |
| "I'll just mention it might be outdated" | A disclaimer doesn't help. Either verify and cite, or clearly flag it as unverified. Hedging is the worst option. |
| "This is a simple task, no need to check" | Check when correctness depends on a version-sensitive API; skip research for routine, version-independent code. |

## Red Flags

- Making a version-sensitive decision without applicable evidence
- Using "I believe" or "I think" about an API instead of citing the source
- Implementing a pattern without knowing which version it applies to
- Citing Stack Overflow or blog posts instead of official documentation
- Using deprecated APIs because they appear in training data
- Not reading `package.json` / dependency files before implementing
- Making material, version-sensitive claims without source citations
- Fetching an entire docs site when only one page is relevant

## Verification

After implementing with source-driven development:

- [ ] Relevant framework and library versions were established
- [ ] Material, version-sensitive decisions have applicable official evidence
- [ ] Bundled fallbacks and stale-source limitations are disclosed when used
- [ ] Code matches the installed or explicitly requested version
- [ ] Non-trivial, version-sensitive decisions include source citations
- [ ] Relevant deprecations are reported without unrequested migration
- [ ] Material conflicts are resolved or reported as blockers
- [ ] Material claims that could not be verified are identified as unverified
