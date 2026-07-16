---
description: Inspect the project, resolve material product ambiguity, and write an implementation-independent specification
argument-hint: "[feature]"
---

Invoke `spec-driven-development` for `$ARGUMENTS`.

First inspect project instructions, existing product behavior, stack, commands,
and relevant code. Ask the user only for unresolved product preferences or
constraints that would materially change the specification.

Write a specification covering:

- objective, users, and intended outcome
- in-scope and out-of-scope behavior
- observable acceptance criteria
- material edge and failure cases
- established technical and operational constraints
- test and documentation expectations
- authorization boundaries and unresolved assumptions

Don't choose an implementation architecture unless it is itself a stated
constraint. Save to the project's specification location, or `SPEC.md` when no
convention exists. Present the artifact and wait for approval before planning or
implementation.
