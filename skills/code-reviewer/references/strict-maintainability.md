# Strict maintainability mode

Load this mode only when the user explicitly requests an unusually strict
structural or maintainability audit. Correct behavior remains necessary, but it
is not sufficient for approval in this mode.

## Additional review questions

- Can the change delete concepts, branches, wrappers, or modes instead of moving
  them?
- Does new conditional logic belong behind an existing model, dispatcher, or
  owning module?
- Does an abstraction clarify ownership or merely add indirection?
- Are casts, broad optionality, or silent fallbacks hiding an invariant?
- Does feature-specific logic leak into a shared path?
- Does the change duplicate a canonical helper or place logic in the wrong
  package?
- Has an already-large file become materially harder to navigate?
- Can related updates be made more atomic without adding disproportionate
  machinery?

## Finding bar

Report structural findings only when you can show the maintenance cost in the
actual change and propose a concrete, behavior-preserving remedy. Large files
and branch counts are signals, not automatic blockers. Do not assume a major
rewrite exists, and do not trade a local imperfection for a broader,
higher-risk architecture change.

Prefer remedies that remove moving parts:

- collapse duplicate branches
- delete pass-through wrappers
- reuse the canonical helper
- move logic to the module that owns the concept
- make the type boundary explicit
- extract a cohesive helper or module when it improves navigation
- separate orchestration from business logic

Apply the normal `code-reviewer` evidence, proportionality, priority, and output
contract. State that strict maintainability mode was requested.
