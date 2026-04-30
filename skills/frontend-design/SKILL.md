---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic generated-UI defaults. Implement the actual usable experience, tailor it to the domain and audience, and validate the rendered result before finalizing.

The user provides frontend requirements: a component, page, application, game, tool, or interface to build. They may include context about the audience, product surface, brand, design system, technical stack, or constraints.

## Build With Empathy

Before coding, understand the outcome and choose a concrete product direction:

- **Purpose**: What problem does this interface solve, and what should be obvious on the first screen?
- **Audience**: Who uses it, how often, and under what pressure? Make workflows ergonomic, efficient, and comprehensive for that user.
- **Product context**: Match any existing design system, component library, icon set, spacing scale, navigation pattern, and interaction convention before inventing new ones.
- **Domain fit**: Let the subject matter drive the design. SaaS, CRM, dashboards, admin tools, and operational products should feel quiet, utilitarian, dense, organized, predictable, and built for scanning, comparison, and repeated action. Games, expressive sites, and playful tools can be more illustrative, animated, and surprising.
- **Constraints**: Framework, performance, accessibility, responsive breakpoints, asset availability, and expected states.
- **Differentiation**: Pick one or two memorable design decisions justified by the product context, not decoration for its own sake.

Build the requested experience itself. Do not make a landing page unless the user explicitly asks for marketing, launch, or sales content. For a site, app, game, or tool, the first screen should be the usable product experience rather than explanatory or promotional content.

## Interface and Control Choices

Use familiar controls for familiar jobs:

- icons in buttons for tools and actions
- swatches for color selection
- segmented controls for modes
- toggles or checkboxes for binary settings
- sliders, steppers, or inputs for numeric values
- menus for option sets
- tabs for views
- text or icon+text buttons for clear commands

Use the existing app's icon library when one is already enabled. Otherwise use `lucide` icons inside buttons whenever a suitable icon exists instead of manually drawn SVG icons. Add tooltips that name or describe unfamiliar icon-only controls.

Avoid rounded rectangular text pills when a familiar symbol or icon would communicate better, such as arrows for undo/redo, B/I icons for bold/italics, or save/download/zoom icons. Keep card border radii at 8px or less unless the existing design system requires otherwise.

Build feature-complete controls, states, and views that the target user would naturally expect. Do not put visible in-app text that explains the application's features, keyboard shortcuts, styling decisions, visual elements, or how to use the application; design the interface so those affordances are apparent.

Interactive elements should communicate clickability. Add `cursor: pointer` to buttons, clickable cards, links, icons, toggle switches, checkboxes, dropdowns, and elements with `onClick` handlers unless the project's design system already handles it.

## Layout and Composition

Avoid generic generated-UI defaults: interchangeable hero sections, nested cards, floating page-section cards, decorative gradients unrelated to the product, visible instructional placeholder text, broken responsive layouts, and cookie-cutter component patterns.

Do not put UI cards inside other cards. Do not style page sections as floating cards. Use cards for individual repeated items, modals, and genuinely framed tools. Page sections should be full-width bands or unframed layouts with constrained inner content.

Define stable dimensions with responsive constraints for fixed-format UI elements such as boards, grids, toolbars, icon buttons, counters, tiles, media, and canvases. Use `aspect-ratio`, grid tracks, min/max sizing, or container-relative sizing so hover states, labels, icons, pieces, loading text, and dynamic content cannot resize or shift the layout.

Make sure UI elements and on-screen text do not overlap incoherently. Text must fit within its parent on mobile and desktop; wrap it, move it to a new line, or use dynamic sizing so the longest word fits. Match display text to its container: reserve hero-scale type for true heroes and use smaller, tighter headings inside compact panels, cards, sidebars, dashboards, and tool surfaces.

Do not scale font size with viewport width. Use normal letter spacing (`0`); avoid negative letter spacing.

## Visual Direction

Choose typography, color, motion, and imagery that serve the product's tone:

- **Typography**: Use fonts that fit the brand and domain. Avoid defaulting to generic stacks or the same fashionable display font repeatedly.
- **Color**: Build a cohesive palette with CSS variables, but avoid one-note themes dominated by variations of a single hue. Limit dominant purple/purple-blue gradients, beige/cream/sand/tan, dark blue/slate, and brown/orange/espresso palettes unless the brand or subject requires them. Scan CSS colors before finalizing and revise if the page reads as one of these themes.
- **Motion**: Use animation for meaningful transitions and micro-interactions. One well-orchestrated reveal often works better than effects everywhere.
- **Backgrounds**: Do not add discrete orbs, gradient orbs, or bokeh blobs as decoration or backgrounds.
- **Assets**: Websites and games should use visual assets. Use image search, known relevant images, or generated bitmap images when appropriate. Primary media should reveal the actual product, place, object, state, gameplay, or person; avoid dark, blurred, cropped, stock-like, or purely atmospheric media when users need to inspect the real thing.

For branded, product, venue, portfolio, or object-focused pages, make the brand/product/place/object a first-viewport signal, not only tiny nav text or an eyebrow. The first viewport should leave a hint of the next section visible on mobile and desktop, including wide desktop.

For landing-page heroes, make the H1 the brand/product/place/person name or a literal offer/category. Put descriptive value props in supporting copy, not the headline. Hero text and the primary experience should not be inside a card. Prefer a relevant image, generated bitmap image, or immersive full-bleed interactive scene with text over it. Avoid split text/media hero layouts, gradient/SVG hero pages, and SVG hero illustrations when a real or generated image can carry the subject.

## Games, 3D, and Domain Logic

For games or interactive tools with established rules, physics, parsing, or AI engines, use a proven existing library for the core domain logic unless the user explicitly asks for a from-scratch implementation.

Use Three.js for 3D elements. Make the primary 3D scene full-bleed or unframed, not trapped inside a decorative card or preview container. Before finishing, verify with screenshots and canvas-pixel checks across desktop and mobile viewports that the scene is nonblank, correctly framed, interactive or moving when expected, and that referenced assets render without overlap.

For highly specific game assets, custom SVG, canvas, Three.js, or equivalent generated assets are appropriate.

## Validation and Handoff

Render the interface before finalizing. Inspect the rendered result across relevant mobile and desktop viewports for layout, clipping, spacing, missing content, text fit, overlap, focus visibility, responsive behavior, asset rendering, canvas rendering, and visual consistency. Revise until the rendered output matches the requirements or report what could not be validated.

When a site or app needs a dev server, start the local dev server after implementation and give the user the URL. If that port is already occupied, use another available port. For a static HTML file that works by opening it directly, do not start a dev server; give the user the local HTML file path instead.
