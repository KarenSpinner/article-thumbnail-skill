---
name: article-thumbnail
description: Generate a brand-consistent still thumbnail (cover image) for a blog or Substack article. For Claude Code only. Activate when the user asks for a thumbnail, cover image, hero image, or social preview for a written article. Reads the article, designs a scene that visually argues the article's main idea, then runs a small bundled Node script (generate.js) that calls Google's Gemini image API.
---

# Article Thumbnail Skill (Claude Code)

Generate brand-consistent still thumbnails for written articles. The thumbnail is a single image showing whatever the user's brand calls for — the recurring character(s), prop(s), composition, and constraints are all defined by the user in the BRAND BLOCK below.

> **This skill is designed for Claude Code only.** It uses Bash to invoke `generate.js`, a small zero-dependency Node script that lives in the user's writing project directory (the cwd where Claude Code is running). Claude Desktop does not have Bash and cannot drive this skill.

## When to use this skill

Activate when the user:

- Pastes or links an article and asks for a thumbnail / cover / hero image / social preview
- Says "make a thumbnail for this post"
- Asks for a cover image to go with a draft

Don't use this for animated content, video covers, photo-realistic imagery, or thumbnails that require extensive legible text.

## Prerequisites

Before this skill can run, the user must have completed these one-time setup steps:

1. **A Gemini API key** with billing enabled — stored in `.env` (with `GOOGLE_AI_API_KEY=...`) in the cwd, OR exported in their shell rc.
2. **`generate.js` in the cwd** — a small zero-dependency Node script that calls the Gemini API.
3. **Node.js 18+** installed.
4. **BRAND BLOCK filled in below** — every `[FILL IN ...]` marker replaced. The skill cannot work without this.

If the BRAND BLOCK still has `[FILL IN]` markers, stop and tell the user the skill isn't customized yet — they need to edit `~/.claude/skills/article-thumbnail/SKILL.md` to replace those markers. If `generate.js` is missing or the API key isn't set, the script's own error message will tell the user the specific problem when invoked.

---

## BRAND BLOCK (user customizes this — every field below)

> Replace each `[FILL IN ...]` placeholder with your own details. Once filled in, this section is the source of truth for every thumbnail. Don't change it per-article; only change it when your brand visual identity changes.

### Characters

**Primary character description:**
[FILL IN — Describe in 1-3 sentences. Include: gender/age range, distinctive physical features, what they're wearing or carrying, and the rendering style they're drawn in.]

**Secondary character description (optional):**
[FILL IN — Describe similarly, or leave blank if you don't have a recurring second character.]

**Reference image paths:**
- Primary character ref: `[FILL IN — absolute path]`
- Secondary character ref (if applicable): `[FILL IN — absolute path or leave blank]`
- Style anchor (an image that exemplifies the desired illustration style): `[FILL IN — absolute path]`

### Output

**Aspect ratio:**
`[FILL IN — e.g. 16:9, 4:3, 1:1, 3:2]`

**Pixel size:**
`[FILL IN — e.g. 1456x816, 1200x630, 1080x1080]`

**Output directory:**
`[FILL IN — absolute path where generated thumbnails should be saved, e.g. /Users/you/Pictures/thumbnails/]`

### Composition policies

These are YOUR aesthetic rules. They drive every scene plan.

**Illustration style:**
[FILL IN — Describe the visual style in concrete terms: line weight (thin/medium/heavy), color treatment (flat colors / soft shading / gradients / watercolor / photo-real), palette (saturated / muted / pastel / monochrome), level of detail. The more specific, the better Gemini will match it.]

**Background policy:**
[FILL IN — describe the background convention. Examples: "Pure white, no environment" / "A subtly blurred environment that hints at the article's domain (kitchen, office, garden)" / "Abstract gradient in brand colors" / "Whatever fits the article tone — figures-on-plain-background or scenic both fine".]

**Element count:**
[FILL IN — typical maximum number of distinct elements (figures + props). Examples: "3 max — primary + secondary + 1 prop" / "5-6 elements OK" / "no fixed limit, judge per article".]

**Environment policy:**
[FILL IN — when (if ever) is an environment/setting allowed? Examples: "Never — figures sit on plain background" / "Always — figures inhabit a scene relevant to the article" / "Optional based on article tone".]

**Text in image:**
[FILL IN — your policy on words/letters/numbers in the image. Examples: "Forbidden anywhere" / "Title text in lower third allowed" / "Labels on objects allowed when they're integral (clock numbers, signage)" / "No constraint".]

**Prop selection style:**
[FILL IN — describe how you pick props. Examples: "Domain-native — only objects the article's actual subjects would touch in real life" / "Symbolic icons — use recognizable visual metaphors (trophy = win, clock = time)" / "Abstract / geometric forms" / "Photographic real-world objects". This is one of the most important brand decisions; be specific.]

**Banned visual elements (optional):**
[FILL IN — list specific elements you never want, or leave blank. Examples: "no charts/graphs/data viz" / "no gift wrapping or rhinestones" / "no children" / "no real-world brand logos".]

---

## Workflow

When the user gives you an article and asks for a thumbnail:

### Step 1 — Read the article carefully

Identify:

- **Core finding**: the one cause-effect or insight the article is arguing. Not the topic — the *finding*. ("Flattery makes a model skip planning" is a finding; "AI politeness research" is just a topic.)
- **Tone**: confident, skeptical, alarmed, hopeful, technical-dry, etc.
- **Concrete domain objects**: physical/visual things that appear in the article's actual subject. Cooking → ingredients, utensils. Coding → terminals, code. Carpentry → lumber, tools. These are candidate props.

### Step 2 — Design the scene per the BRAND BLOCK policies

Output a single coherent scene plan. The BRAND BLOCK composition policies (background, element count, environment, text, prop style, banned elements) are constraints — design WITHIN them, not around them.

Use this structure:

```
SCENE PLAN
- Core finding (1 sentence): ...
- Composition: <where each character is, where the prop is, what's around them — consistent with the BRAND BLOCK background/environment/element-count policies>
- Prop: <one specific object — applying the BRAND BLOCK prop_selection_style>
- Action / state shown: <what the figures are DOING in this single frozen moment that conveys the finding>
- Why this works: <one sentence connecting the visual to the article's core finding>
```

### Step 3 — Confirm with user

Each call to `generate.js` is a paid API call. Plan iteration in text is free (just Claude tokens). Before generating anything, show the SCENE PLAN to the user and ask if they want to proceed or iterate.

**If the article has more than one strong angle**, you can offer the user choices:

- **Multiple SCENE PLAN variants** — propose 2-3 different framings of the article (e.g., the cause, the effect, the surprise, the human element, the takeaway), let the user pick which to render. Cheapest path: only one image generation.
- **Multiple image variants of ONE scene plan** — Gemini produces different visual interpretations from the same prompt. Useful when the plan is right but you want to compare a few rendered versions and pick the most on-brand one. Run `generate.js` N times with the same prompt and refs, varying only the `--output` filename.
- **Both** — pick a plan first, then render multiple variants of it.

Don't decide for the user how many images to render — this is their cost decision. Tell them the per-image cost for the model they're using (look it up at https://ai.google.dev/gemini-api/docs/pricing — pricing varies by model and shifts over time, so don't quote a hardcoded number) and ask how many they want. Some users want one shot; others want 3-5 variants to compare.

### Step 4 — Generate via Bash

Build the full image prompt using the PROMPT TEMPLATE below, then call `generate.js` from the cwd:

```bash
node generate.js \
  --prompt="<your full prompt with the scene description and constraints>" \
  --refs="<primary character path>,<secondary character path>,<style anchor path>" \
  --output="<output_directory>/<article-slug>-YYYY-MM-DD.png"
```

The `--refs` argument is a comma-separated list of absolute paths from the BRAND BLOCK. Skip secondary character if blank.

**If the user asked for multiple variants of the same scene** (Step 3), call `generate.js` once per variant with the same `--prompt` and `--refs` but a different `--output` filename. Run them sequentially (not parallel) to avoid rate-limit issues. Suffix outputs like `<slug>-v1.png`, `<slug>-v2.png`, `<slug>-v3.png`. Each call is a separate API call.

On success, the script prints `OK: <output_path>` to stdout.

If the script returns "GOOGLE_AI_API_KEY is not set", the user hasn't created a `.env` file in the cwd yet. Tell them to run `echo 'GOOGLE_AI_API_KEY=your-key' > .env` (with their actual key) in this directory, then retry.

### Step 5 — View and critique

Use the `Read` tool to view the generated PNG. Check it against the BRAND BLOCK policies AND the universal best practices (next section):

- ✓/✗ Background follows the brand background policy?
- ✓/✗ Element count within the brand max?
- ✓/✗ Environment matches the brand environment policy?
- ✓/✗ Text policy honored?
- ✓/✗ Prop matches the brand prop_selection_style?
- ✓/✗ No banned elements present?
- ✓/✗ Characters look like the brand references?
- ✓/✗ Aspect ratio matches the brand canvas?

If any check fails, propose a targeted edit (next step).

### Step 6 — Iterate via edit, not regenerate

When the user wants changes, prefer editing the existing image:

```bash
node generate.js \
  --input="<previous output path>" \
  --prompt="<edit instructions: what to change AND what to preserve>" \
  --output="<new output path>"
```

Editing preserves character/style/composition between iterations. Regenerating produces a fresh image that may differ in unwanted ways. Each edit is its own paid API call at the model's current per-image rate (see https://ai.google.dev/gemini-api/docs/pricing).

State explicitly what to change AND what to preserve in the edit prompt. Vague instructions like "make it better" don't work.

---

## Universal best practices (apply regardless of brand)

These are aesthetic patterns that hold across most editorial illustration styles. They complement (don't override) the BRAND BLOCK.

1. **One coherent scene, not a collage.** Whatever the brand background policy, all elements should look like they belong together — same lighting, same scale relationships, same illustration style. Avoid the "transparent PNG cutouts pasted on a background" look unless the brand explicitly wants it.

2. **Characters must match brand references.** Always pass the brand's reference images via `--refs`. Even with refs there will be slight drift; describe the characters specifically in the prompt to reinforce.

3. **The prop should ENACT the article's finding, not just symbolize it.** Whatever prop style the brand uses (domain-native, symbolic, abstract), the prop should *do something* that conveys the article's cause-effect, not sit there inert. A wilting plant tells more story than a healthy plant; a stack of paperwork shrinking tells more than a static stack.

4. **Specificity beats vagueness in prompts.** "A stack of papers" is vague; "a tall stack of yellow sticky notes that visibly shrinks" is specific. The more concrete the description (size, color, count, what's happening to it), the more on-target the result.

5. **Two-element comparison is one slot.** When an article hinges on a comparison (honest vs gamed, before vs after, version A vs version B), it's acceptable to use a tightly-coupled prop pair — two instances of the same kind of object differing in the dimension the article is about. Counts as one prop slot for element-count purposes.

---

## PROMPT TEMPLATE (for the `--prompt` argument)

Build the prompt using this skeleton — substitute values from the article and the BRAND BLOCK:

```
Generate a single illustrated frame in the EXACT style of the reference images, featuring the EXACT characters from the references.

Scene to render:
<your scene description from Step 2>

Style and constraints (violating any = wrong output):
- Illustration style: <BRAND illustration_style>
- Background: <BRAND background_policy>
- Aspect ratio: <BRAND aspect_ratio>
- Primary character must look identical to the first reference image
- <Secondary character must look identical to the second reference image — only if applicable>
- Match the style anchor's line weights, palette, and shading exactly
- Text in image: <BRAND text_in_image policy>
- Element count: stay within <BRAND element_count>
- Banned elements: <BRAND banned_elements, if any>
```

Pass the references via `--refs` in this order: primary character, secondary character (if any), style anchor.

---

## COMMON PITFALLS

1. **Environment leak.** Even with explicit "no environment" rules, Gemini sometimes adds a desk, bookshelf, floor, or window. If the brand background policy forbids this, edit it out: re-run with `--input=<previous>` and prompt "Remove the [specific environment element]. Background should be <BRAND background_policy>. Keep everything else identical."

2. **Text bleed-through.** Even with "no text" rules, Gemini sometimes renders text on paper, signs, screens, or labels. If the brand text policy forbids this, edit it out: "Remove all text, words, letters, and numbers from <specific element>. Replace with abstract handwriting-like squiggles or blank texture. Keep everything else identical."

3. **Character drift.** Gemini's character consistency from references is good but not perfect. Slight face-shape, hair-color, or proportion drift is normal. If the drift is severe, regenerate from scratch (don't edit — editing won't fix identity). Adding more specific physical-feature description in the prompt also helps.

4. **Aspect ratio ignored.** Gemini sometimes ignores aspect ratio if not stated forcefully. State it twice in the prompt if needed.

5. **"Subtle" or "atmospheric" effects produce environment as a side effect.** If the brand background policy is plain, avoid these adjectives. Stick to concrete physical descriptions of what's actually visible.

6. **Editing prompts that delete more than intended.** "Remove the red marks" can sometimes remove the object the marks were on. Always state what to PRESERVE alongside what to remove.

---

## Cost notes

Each call to `generate.js` is one API call to the configured model, billed at that model's per-image rate. Pricing varies significantly by model — `gemini-2.5-flash-image` is cheaper than `gemini-3-pro-image-preview` by an order of magnitude or more.

When the user is making a cost-sensitive decision (number of variants to render, which model to use, whether to iterate via edit vs. regenerate), look up the current per-image price for their chosen model at https://ai.google.dev/gemini-api/docs/pricing and quote the actual current rate. **Do not rely on hardcoded numbers in this skill or in the README** — pricing changes over time and varies by model. Tell the user the current real cost so they can decide.

Plan iteration (text-only conversation about the SCENE PLAN) is free. Image generation and editing each cost one API call. The user decides how many calls to make.
