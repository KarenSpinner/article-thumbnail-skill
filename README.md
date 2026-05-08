# Article Thumbnail — Claude Code skill

A Claude Code skill that generates brand-consistent illustrated thumbnails for blog and Substack articles using Google's Gemini 2.5 Flash Image (Nano Banana). Claude reads your article, designs a scene, calls a small script, and shows you the result for iteration.

**Claude Code only.** Claude Desktop is not supported.

> This resource is a simplified version of the set up I use to generate images for multiple purposes. Feel free to adapt this to your use case as needed.

## What's in this folder

```
.
├── README.md             this file (read me first)
├── article-thumbnail/    the skill — copy into ~/.claude/skills/
│   └── SKILL.md          instructions for Claude + the BRAND BLOCK you customize
├── generate.js           the script — copy into your writing project's directory
└── .env.example          template for your API key — copy to your project as .env
```

The skill is pure instructional markdown. The actual API call lives in `generate.js`, which goes in your own writing project's directory alongside an `.env` file containing your Gemini API key. That keeps your secrets out of the shared skill folder.

## Architecture

Two locations:

- **The skill** at `~/.claude/skills/article-thumbnail/`. Pure markdown. No secrets, no code.
- **The script + your API key** in YOUR writing project (the directory where you draft articles and run Claude Code). When Claude runs Bash from your project, it finds `generate.js` and reads `.env` directly.

This keeps your API key out of `~/.claude/skills/` and keeps the skill folder shareable as a pure template.

## Prerequisites

- Claude Code installed (`claude --version`)
- Node.js 18+ (`node --version`)
- A Gemini API key from https://aistudio.google.com/apikey — **billing must be enabled on your Google AI Studio account.** Image generation (`gemini-2.5-flash-image`) is not available on the free tier; you need a payment method on file. Generations cost about $0.04 each as of early 2026.
- **Your brand assets** (see next section)

## Before you start: gather your brand assets

This skill cannot generate on-brand thumbnails without YOUR brand reference images. They are not optional and not provided by this distribution — every user supplies their own. **Gather these BEFORE starting the install** so you can paste their absolute file paths into the BRAND BLOCK in step 5.

You need:

1. **Primary character reference** — one PNG or JPG showing the recurring person/avatar/mascot that anchors every thumbnail. A clean, full-figure or shoulders-up view, drawn in your final brand style. Save somewhere on your local disk (e.g. `~/Pictures/brand/avatar.png`).

2. **Style anchor** — one PNG or JPG that exemplifies your illustration style: line weights, palette, shading technique, level of detail. This can be any on-brand illustration you already have. Save to local disk.

3. **Secondary character reference (optional)** — if you have a recurring second character (a sidekick, a mascot, a robot), include a clean reference image. Otherwise leave blank.

If you don't have these:
- Commission an illustrator to draw your character + a style example
- Generate them with an AI tool (Midjourney, ChatGPT image, Recraft, this skill's own `generate.js`) and iterate until on-brand
- Use existing thumbnail covers from your blog as references

Save them to a stable location on your local disk — the skill needs absolute file paths, and chat-attached images won't work. On macOS, get the absolute path of a file by right-clicking in Finder → hold Option → "Copy as Pathname".

> ⚠ **The skill will not work until you customize the BRAND BLOCK** in `~/.claude/skills/article-thumbnail/SKILL.md` with these asset paths and your aesthetic preferences. Step 5 below is required, not optional.

## Install (5 steps)

### 1. Install the skill

```bash
mkdir -p ~/.claude/skills/
cp -r article-thumbnail ~/.claude/skills/
```

### 2. Drop the script into your writing project

```bash
cp generate.js /path/to/your/writing-project/
```

Replace `/path/to/your/writing-project/` with the directory you usually open Claude Code from for blog work.

### 3. Add your API key

```bash
cd /path/to/your/writing-project/
echo 'GOOGLE_AI_API_KEY=your-key-here' > .env
```

(Or copy `.env.example` from this distribution and edit. The script also reads `GOOGLE_AI_API_KEY` from your shell rc if you'd rather export it there.)

If you use git in your writing project, add `.env` to your `.gitignore`.

### 4. Verify the script works

In your writing project directory:

```bash
node generate.js
# Expected output:
# Error: --prompt is required
```

That error means the script ran, found your API key, and validated arguments. **Healthy.** If you see a different error:

- "GOOGLE_AI_API_KEY is not set" → step 3 didn't take. Run `cat .env` to check.
- "Cannot find module" / "ERR_MODULE_NOT_FOUND" → Node version too old. Run `node --version`; must be 18+.

### 5. Customize the BRAND BLOCK — REQUIRED

**The skill will not produce useful output until you do this.** It ships as a template with `[FILL IN ...]` placeholders for everything brand-specific. If you skip this step, Claude has no character description, no reference paths, and no aesthetic constraints, and any thumbnail it generates will be generic and off-brand.

Open `~/.claude/skills/article-thumbnail/SKILL.md` in any text editor. Find `## BRAND BLOCK` near the top. Replace **every** `[FILL IN ...]` placeholder:

- **Primary character description** — what your recurring character looks like (the more specific, the better Gemini matches)
- **Secondary character description** — same for any second recurring character (or leave blank)
- **Illustration style** — concrete description of line weight, shading, palette
- **Reference image paths** — absolute paths to the brand asset PNGs/JPGs you gathered earlier:
  - Primary character ref: `/absolute/path/to/avatar.png`
  - Secondary character ref: `/absolute/path/to/sidekick.png` (or blank)
  - Style anchor: `/absolute/path/to/style-example.png`
- **Canvas dimensions** — aspect ratio and pixel size for your platform
- **Output directory** — where generated thumbnails should be saved
- **Composition policies** — your aesthetic (background, element count, environment, text, prop selection style, banned elements). See the **Example BRAND BLOCK** at the bottom of this README for what concrete answers look like.

Save the file. Claude Code reads the skill on each invocation, so changes take effect immediately.

**Verify nothing is left as a placeholder.** Search the file for `[FILL IN` — every occurrence should be gone before you try to use the skill.

### About reference images

Save your brand reference images somewhere on local disk you can find later — `~/Pictures/brand/`, `~/Documents/brand/`, anywhere. Then put their absolute paths in the BRAND BLOCK.

**Don't use chat-attached images as references.** The script reads files from local paths; chat attachments are sandboxed and unreachable. To get a file's absolute path on macOS: right-click in Finder → hold Option → "Copy as Pathname".

## Test

Open Claude Code in your writing project directory. Paste any short article and ask:

> Make a thumbnail for this article using the article-thumbnail skill.

Expected flow:

1. Claude reads the article and proposes a SCENE PLAN.
2. You confirm or iterate.
3. Claude calls `node generate.js --prompt=... --refs=... --output=...`.
4. Script saves a PNG, prints `OK: <path>`.
5. Claude uses the `Read` tool to view the result and offers critique.

If Claude tries to generate without a plan, the BRAND BLOCK probably isn't filled in. Check for remaining `[FILL IN]` markers in SKILL.md.

## Cost

Image generation via the Gemini API runs ~$0.04 per call (early 2026 rate; verify at https://ai.google.dev/gemini-api/docs/pricing). A typical thumbnail (1 generation + 1-2 edits) is $0.08-0.12.

**Image generation is not available on the Gemini API free tier.** You must enable billing on your Google AI Studio account before this skill can work. There's no free trial of the image model; the first call requires a payment method on file.

## Troubleshooting

**Claude says it doesn't have a skill called "article-thumbnail".**
Run `ls ~/.claude/skills/article-thumbnail/SKILL.md`. If missing, redo step 1. Make sure SKILL.md has YAML frontmatter (the `---` blocks at the top). Restart your Claude Code session.

**Claude can't find `generate.js` when it runs Bash.**
You're running Claude Code from a directory other than the one where you put `generate.js`. Either `cd` into the project directory before starting Claude Code, or copy `generate.js` to the directory you're in.

**`GOOGLE_AI_API_KEY is not set`.**
The `.env` is in a different directory than where Claude is running, or it wasn't saved. Verify: `pwd && cat .env`.

**`image not found` from the script.**
A reference path in the BRAND BLOCK is wrong, or the file moved. Verify: `ls "/path/to/file.png"`.

**Generated images don't match my brand.**
Composition policies in the BRAND BLOCK may be too vague. "Pure white background, no environment elements, no shadows on the floor" beats "minimal background". Reference images should be your most on-brand examples, not first drafts.

**Errors mentioning "billing", "PERMISSION_DENIED", or "model not available".**
The free Gemini API tier doesn't include image generation. Enable billing in Google AI Studio (Settings → Billing, add a payment method). After billing is on, retry — the script doesn't need to be reinstalled.

## Uninstall

```bash
rm -rf ~/.claude/skills/article-thumbnail
rm /path/to/your/writing-project/generate.js /path/to/your/writing-project/.env
```

## License

Adapt freely for your own brand. The composition policies in the BRAND BLOCK are designed to be replaced with your own aesthetic — what ships in the template is just placeholder structure.

---

## Example BRAND BLOCK (filled in)

This is what a complete, specific BRAND BLOCK looks like for a fictional editorial Substack about climate science. Use it as a reference for the level of specificity to aim for in your own — don't copy it verbatim.

```
### Characters

**Primary character description:**
A scientist in their forties with curly grey-streaked dark hair tied back, wire-frame glasses, wearing a navy fleece vest over a t-shirt. Friendly but serious expression. Drawn in a flat 2D editorial style with visible linework.

**Secondary character description:**
(none)

**Reference image paths:**
- Primary character ref: `/Users/jordan/Pictures/brand/scientist-canonical.png`
- Secondary character ref: (blank)
- Style anchor: `/Users/jordan/Pictures/brand/style-reference.png`

### Output

**Aspect ratio:** `3:2`
**Pixel size:** `1500x1000`
**Output directory:** `/Users/jordan/Documents/blog-covers/`

### Composition policies

**Illustration style:**
Hand-drawn 2D editorial. Medium-weight clean linework, flat colors with subtle gradient shading, slightly muted earthy palette (greens, blues, ochre, deep navy). Mid level of detail — enough to read facial expression at thumbnail size, not photorealistic.

**Background policy:**
Always a soft natural environment that hints at the article topic — sky, water, forest, lab interior, field — but kept simple and slightly out of focus so it never competes with the figure. Never pure white or fully empty.

**Element count:**
3-5 elements typical. The scientist always present; one or two prop/scene elements; sometimes a secondary natural element (a tree, a wave, a chart on a screen).

**Environment policy:**
Required — figures always inhabit a relevant scene. Plain backgrounds are forbidden.

**Text in image:**
Forbidden everywhere except readable scientific instrument labels (a thermometer reading, a date on a sample tag) when those are core to the article's point.

**Prop selection style:**
Domain-native scientific objects — sensors, samples, notebooks, beakers, drone, instrument readouts, satellite imagery, soil cores. Never symbolic icons (no trophies, magnifying glasses, lightbulbs, charts as decoration).

**Banned visual elements:**
No melting Earth, no polar bears, no smokestacks, no cliché climate-doom imagery. Avoid stock-photo composition (no posed handshakes, no person-pointing-at-screen).
```

This level of specificity is the goal: every field has a concrete answer that constrains the model, not vague platitudes. Vague BRAND BLOCKs produce off-brand thumbnails.
