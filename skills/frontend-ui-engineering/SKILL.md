---
name: frontend-ui-engineering
description: Build or modify production-quality user interfaces, including components, layout, interaction state, responsiveness, and accessibility.
---

# Frontend UI engineering

Build interfaces that fit the product, communicate hierarchy clearly, and work
through real user interactions. Prefer project-specific design evidence over
generic visual recipes.

## Inputs to establish

Before editing, inspect:

- the product goal and primary user task
- the existing design system, tokens, components, and content style
- one or two analogous screens in the repository
- framework and state-management conventions
- required viewports, interaction states, and accessibility constraints

When no design is supplied, infer a coherent visual direction from the product
and existing UI. Ask only if a missing preference would materially change the
brand, information architecture, or interaction model.

## Design contract

Define the destination before implementation:

- **Hierarchy:** what users must notice and do first
- **Structure:** content grouping and navigation model
- **Density:** compact, balanced, or spacious for the actual workflow
- **Tone:** product-specific visual and copy choices
- **States:** loading, empty, error, success, disabled, and long-content behavior
- **Responsiveness:** how hierarchy and interaction adapt, not just how columns
  collapse

Use the project's spacing, typography, color, radius, and elevation system.
When no system exists, create a restrained, consistent local vocabulary rather
than combining unrelated effects. Avoid stock card grids, arbitrary gradients,
excessive rounding, and decorative treatment that doesn't support the content.
These are symptoms to avoid, not a substitute for design judgment.

## Implementation

- Follow existing component and file conventions.
- Prefer semantic HTML and native interaction behavior.
- Keep data access, domain state, and presentation boundaries consistent with
  the codebase.
- Use the simplest state location that supports the interaction.
- Reuse established components before creating variants or abstractions.
- Design with realistic content, including long labels and empty data.
- Keep motion purposeful and respect reduced-motion preferences.
- Avoid performance work without evidence of a user-visible bottleneck.

## Accessibility

Meet the project's accessibility target and current applicable WCAG guidance.
At minimum, verify:

- keyboard reachability and visible focus
- semantic headings, landmarks, labels, and control names
- focus movement for dialogs, menus, and dynamic content
- sufficient contrast and non-color state indicators
- touch target and zoom behavior
- announcements for important asynchronous state changes

Prefer native elements over recreating controls with ARIA.

## Verification

Exercise the real interface rather than relying only on component props:

1. Start the application or relevant story/component environment.
2. Test the primary user flow with keyboard and pointer input.
3. Inspect loading, empty, error, success, and overflow states that apply.
4. Check the smallest and largest required viewports plus one intermediate size.
5. Capture screenshots for visual comparison when appearance changed.
6. Check console output and run relevant accessibility tooling when available.
7. Run focused component, integration, type, and build checks.

Use `agent-browser` for browser interaction and screenshots when available.
Report what was tested, evidence captured, and any state that remains unverified.

## Completion criteria

- visual hierarchy supports the primary task
- layout and content match the product's design language
- interactions work across required input methods and viewports
- applicable states are intentional rather than blank or broken
- accessibility and validation evidence support the completion claim
- no unrelated design-system expansion or speculative component abstraction was
  introduced
