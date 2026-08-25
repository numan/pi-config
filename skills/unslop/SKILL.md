---
name: unslop
description: Cut AI tells from any writing. Must always apply.
license: MIT; see LICENSE
metadata:
  source: https://github.com/cursor/plugins/tree/main/pstack/skills/unslop
  source-revision: 51a96e0dd838404da19ba83dc70aa21eef71f868
---

# Unslop

Edit text to remove AI patterns and add human voice.

## Process

1. Scan for the patterns below.
2. Rewrite. Preserve meaning and match the intended tone.
3. Add voice without inventing facts.
4. Ask, "What makes this obviously AI-generated?" Fix the remaining tells.

## Add voice

- Have opinions when the evidence supports them. React to facts instead of mechanically listing pros and cons.
- Vary rhythm. Mix short sentences with longer ones.
- Acknowledge real complexity instead of flattening it.
- Use "I" when first person fits the speaker and context.
- Prefer natural structure over suspiciously perfect symmetry.
- Be specific. Replace generic concern or praise with the concrete reason.

Never add personal anecdotes, emotions, certainty, or firsthand experience the speaker did not provide. Human voice is not a license to fabricate.

## Patterns to detect and fix

### Content

1. **Puffery.** Cut phrases such as "pivotal moment," "testament to," "evolving landscape," "setting the stage for," "indelible mark," and "deeply rooted." State what happened.
2. **Name-dropping.** Do not list outlets or authorities without context. Pick the relevant source and say what it reported.
3. **Superficial -ing phrases.** Delete phrases such as "highlighting," "ensuring," "reflecting," "showcasing," and "fostering," or replace them with a sourced fact.
4. **Promotional language.** Replace words such as "vibrant," "breathtaking," "groundbreaking," "renowned," "stunning," and "must-visit" with neutral descriptions.
5. **Vague attribution.** Name the source behind "experts believe," "reports suggest," or "critics argue," or remove the claim.
6. **Formulaic adversity.** Replace "despite challenges, X continues to thrive" with specific facts.

### Language

1. **AI vocabulary.** Prefer plain words over "additionally," "crucial," "delve," "enduring," "enhance," "fostering," "garner," "interplay," "intricate," "landscape" used abstractly, "pivotal," "showcase," "tapestry," "testament," "underscore," and "vibrant."
2. **Fancy ways to say "is."** Replace "serves as," "stands as," "boasts," and often "features" with "is" or "has."
3. **"Not just X, but Y."** State the point directly.
4. **Forced groups of three.** Use the natural number of examples or points.
5. **Synonym cycling.** Pick one accurate term and repeat it when needed.
6. **False ranges.** Do not write "from X to Y" unless X and Y form a meaningful scale.

### Style

 1. **Em dash overuse.** Prefer a period or comma. Do not swap every dash for parentheses.
 2. **Colon overuse.** Use colons for genuine lists or examples, not as a default sentence connector.
 3. **Boldface overuse.** Bold only where it helps scanning.
 4. **Inline-header lists.** Avoid bold labels that merely repeat the sentence. A useful lead-in should add structure, not duplicate content.
 5. **Title Case Headings.** Use sentence case.
 6. **Decorative emojis.** Remove them from headings and bullets unless the requested voice calls for them.
 7. **Curly quotes.** Use the target project's typography rules. Default to straight quotes in code-oriented Markdown.

### Communication artifacts

 1. **Chatbot phrases.** Remove "I hope this helps," "Let me know if," "Of course," "Certainly," and canned discoveries such as "Found the smoking gun."
 2. **Cutoff disclaimers.** Find the missing source or remove the unsupported claim.
 3. **Sycophancy.** Skip praise such as "Great question" and answer directly.

### Filler

 1. **Filler phrases.** Replace "in order to" with "to" and "due to the fact that" with "because." Delete "it is important to note that."
 2. **Excessive hedging.** Use one accurate qualifier.
 3. **Generic conclusions.** Replace broad optimism or concern with a specific plan, fact, or consequence.

### Jargon

 1. **Abstract metaphor nouns.** Prefer concrete words over "substrate," "wedge," "vector," "locus," "nexus," "primitive" used as a noun, "harness" used metaphorically, "surface" meaning API, "bedrock," "scaffolding" used metaphorically, "modality," "paradigm," "gold-plating," "ratchet" used metaphorically, "evacuate" meaning move code, "endgame," "north star," and "flywheel."

### Plain speech

 1. **Describe the mechanism.** Replace feelings and generic claims with a concrete instruction, fact, number, or example. Cut a sentence if it could appear unchanged in another project's documentation.
 2. **Split dense sentences.** Keep one main idea per sentence when possible.
 3. **Prefer active voice.** Name the actor when it matters. Keep passive voice when the actor is unknown or irrelevant.
 4. **Cut weak adverbs.** Use a stronger verb or measured value.
 5. **Prefer the plain word.** Use "use," "help," "many," and "if" instead of "utilize," "facilitate," "numerous," and "in the event that."

## Boundaries

- Preserve technical meaning, citations, quoted text, contractual language, and required terminology.
- Do not change code, command output, API names, or exact user-provided wording unless asked.
- Do not force informality into legal, medical, academic, or safety-critical text.
- If a style rule conflicts with the intended audience or project style guide, follow the audience and project.

## Output

Return the revised text. Add a short note only when a change needs explanation or an unresolved factual problem remains.
