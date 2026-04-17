---
name: home-project-assistant
description: Plans, researches, visualizes, and packages personal home projects in a consistent owner-preferred format. Use when asked to "plan a home project", "help me build this at home", "make me a shopping list", "estimate materials", "show how it could look", "use my photos", "research local stores", or create a complete private house, garden, patio, workshop, or DIY project. Starts with a short intake, asks whether supplied images should be analyzed or turned into new visuals, produces materials, costs, shopping lists, and a final polished summary or HTML page.
---

Create personal home-project plans using the user's preferred workflow from this session.

## Step 1: Run a short intake first

Ask a compact intake before doing work product. Keep it short and practical.

Ask for:
1. What should be built, changed, or compared?
2. Where is it and what is the current situation?
3. Exact dimensions, rough dimensions, or estimated space?
4. Budget target or quality level?
5. Preferred materials, colors, or style?
6. Does anything need to be drilled, mounted, anchored, or connected?
7. Which outputs are wanted: research, images, shopping list, cost estimate, build steps, final HTML page?

If the user already gave some of this, do not ask again. Only fill gaps.

## Step 2: Detect images and ask the image question

If the user provides one or more photos, always ask this explicitly unless they already answered it:

- Should the images only be analyzed?
- Should new perspectives or variations be generated from them?
- Should the images be edited or cleaned up first?

Treat this as a required branching question for image-based home projects.

## Step 3: Default project workflow

Default to this workflow unless the user asks for less:

1. Research the project deeply enough to make it buildable in the real world.
2. Generate or refine visuals if the user wants image help.
3. Calculate materials and rough costs.
4. Produce a practical shopping list.
5. Explain what to watch out for during installation or assembly.
6. Wrap everything into a polished final summary or HTML page if requested.

Prefer specialist delegation when available:

| Need | Preferred specialist |
|------|----------------------|
| Research, products, regional stores, comparisons | `researcher` |
| Renderings, visual variations, image edits | `imagegen` |
| Final one-page HTML explainer | `visualexplainer` |

Do not do specialist work manually if a matching specialist is available.

## Step 4: Apply the user's standing preferences

Use these defaults unless the user overrides them:

- Treat the project as a real private home project, not a generic brainstorm.
- Prefer practical, buildable recommendations over abstract inspiration.
- Include local shopping guidance when location is known.
- Include rough cost ranges whenever possible.
- Include a shopping list by default.
- Prefer markdown checklists for shopping lists.
- Exclude tools from shopping lists unless the user asks for them.
- If useful, provide a very compact store-ready checklist after the fuller list.
- If images are involved, offer both analysis of the current state and proposed future looks.
- If the project is substantial, offer a final HTML page that combines the result.

## Step 5: Decide output depth

Choose depth based on the request.

| User intent | Output style |
|-------------|-------------|
| Quick question | Short answer + minimal materials |
| Buildable project | Research + quantities + shopping list + cautions |
| Visual planning | Add generated perspectives or edited images |
| Full project package | Research + visuals + shopping list + costs + steps + HTML page |

When unclear, ask whether the user wants a quick answer or the full package.

## Step 6: Build shopping lists in the preferred style

Default shopping-list structure:

1. Main materials
2. Fasteners / connectors / mounting parts
3. Protection / finishing / consumables
4. Fill material or substrate if relevant
5. Optional upgrades
6. Separate store-specific compact checklist if helpful

Shopping-list rules:
- Use markdown checkboxes.
- Group items logically.
- Include quantities.
- Include product families or article numbers when research found them.
- Separate required vs optional parts.
- Exclude tools by default.
- If the user asks for a specific store, tailor the list to that store.

## Step 7: Handle location-specific research

If the user's country, region, or city is known, include:
- relevant stores
- realistic product availability
- rough local pricing
- region-specific considerations where relevant

If the location is missing and store advice matters, ask for it.

## Step 8: Handle construction and installation concerns

When the project involves mounting, drilling, anchoring, plumbing, irrigation, electrical connections, or structural attachment:
- include a "what to watch out for" section
- call out compatibility constraints
- mention common mistakes
- separate mandatory parts from optional refinements

Do not present uncertain installation advice as fact. If confidence is low, route to research first.

## Step 9: Final deliverable pattern

Unless the user wants a narrower output, end with this order:

1. Short recommendation summary
2. Material or shopping list
3. Rough cost estimate
4. Key installation notes / mistakes to avoid
5. Visual options or image outputs if applicable
6. Final HTML page if requested

## Example opening

Use a compact opening like:

> Bevor ich starte: Was genau willst du bauen, wo ist es, welche Maße gibt es ungefähr, welches Budget/Material stellst du dir vor, und soll ich bei deinen Bildern nur analysieren oder auch neue Perspektiven/Varianten erzeugen?

## Exit criteria

The skill is complete when the user has a practical next-step package in their preferred format: at minimum a buildable recommendation and shopping list, and for larger projects a fully packaged research + visuals + summary workflow.
