---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic generated-UI defaults. Implement real working code with a clear aesthetic point of view and enough validation to catch broken layouts.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, product surface, design system, or technical constraints.

## Design Thinking

Before coding, understand the outcome and choose a concrete visual direction:
- **Purpose**: What problem does this interface solve? Who uses it, and what should be obvious on the first screen?
- **Product context**: Match any existing brand, design system, component library, spacing scale, and interaction conventions before inventing new ones.
- **Tone**: Pick a specific direction: brutally minimal, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc.
- **Constraints**: Framework, performance, accessibility, responsive breakpoints, and expected states.
- **Differentiation**: What memorable design decision is justified by this product context?

Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work; the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking without sacrificing usability
- Cohesive with a clear aesthetic point of view
- Responsive across relevant viewport sizes
- Complete for expected loading, empty, error, disabled, hover, focus, and active states when those states apply

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that serve the product's tone. Avoid defaulting to generic stacks or the same fashionable display font repeatedly; pair a distinctive display face with a readable body face when brand rules allow.
- **Color & Theme**: Commit to a cohesive palette. Use CSS variables for consistency. Dominant colors with sharp accents usually outperform timid, evenly distributed palettes.
- **Motion**: Use animation for meaningful transitions and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion for React when available. One well-orchestrated page load with staggered reveals often creates more delight than scattered effects everywhere.
- **Spatial Composition**: Use layout intentionally: asymmetry, overlap, diagonal flow, grid-breaking elements, generous negative space, or controlled density when they support the content.
- **Backgrounds & Visual Details**: Create atmosphere and depth with contextual effects such as gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.
- **Usability**: Keep familiar controls recognizable, make primary actions obvious, preserve keyboard focus states, and avoid decorative complexity that obscures the task.

Avoid generic generated-UI defaults: interchangeable hero sections, nested cards inside cards, decorative gradients unrelated to the product, visible instructional placeholder text, broken responsive layouts, and cookie-cutter component patterns.

Interpret creatively and make choices that feel designed for the specific context. Vary aesthetics across projects instead of converging on the same fonts, palettes, and layouts.

Match implementation complexity to the aesthetic vision. Maximalist designs can justify elaborate animations and effects. Minimalist or refined designs need restraint, precision, and careful spacing, typography, and state handling.

## Validation

Render the interface before finalizing. Inspect the rendered result for layout, clipping, spacing, missing content, focus visibility, responsive behavior, and visual consistency. Revise until the rendered output matches the requirements or report what could not be validated.

### Frontend: Cursor Pointer on Interactive Elements

Interactive elements should communicate clickability. Add `cursor: pointer` to buttons, clickable cards, links, icons, toggle switches, checkboxes, dropdowns, and elements with `onClick` handlers unless the project's design system already handles it.
