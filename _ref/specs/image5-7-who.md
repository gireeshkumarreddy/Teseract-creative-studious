# Images 5, 6 and 7: the "Who We Are" page on the black theme

This spec covers `/who-we-are/`. It is preparation only: there are no project code changes, only the assets in `public/assets/who/`.

**Sources**

| Image | Size and format |
|---|---|
| `_ref/images/5.webp` | 1536 × 1024, RGB, white |
| `_ref/images/6.webp` | 1333 × 2000, RGB, white |
| `_ref/images/7.webp` | 1125 × 2000, RGB, white |

**Read with:** `DARK-THEME.md` (the client brief, tokens and content rules) and `PLAN.md` (helpers and motion attributes).

**Method.** Every measurement comes from the raster: connected-component line boxes, ink/run profiles, column and row profiles for the hairlines, a Hough circle fit for the dial, colour sampling, and type fitting against **Geist** (the site font, variable 100–900, x-height 0.53, cap 0.709). The scripts are in `WD/_work/img567/`. Run them from WD with `python -I`:

| Script | Purpose |
|---|---|
| `lines.py` | Line and box detection |
| `fontfit.py`, `fit_targets.py`, `fit_run.py` | Type fitting |
| `monitor.py`, `light.py` | Image 5 assets |
| `rock.py`, `hand.py`, `rects.py`, `matte_white.py` | Image 6 and 7 assets |
| `export.py` | Writes the WebP files |
| `halo.py` | Halo check |
| `preview.py` | Previews on black, #0d0d0d and a checker |
| `lp.py` | Windows long-path helper |

**Coordinates.** Values are in design px (dpx) on each image's own canvas, with x from the left and y from the top. Text "top" means the top of caps or the x-height (stated each time). A size in dpx becomes CSS through the scaling unit given per section.

**Header.** Image 5 shows nav links and a "start a project" button. **Ignore them.** The site header is now logo + hamburger only (`chrome.header()`), transparent over the black hero. The top 80 dpx of image 5 (≈ 7.8 %) is exactly the header band, and the dark scene keeps it clear.

---

## 0. Decisions that the other sections depend on

1. **Page structure (document order kept):**

   | # | Section | Source |
   |---|---|---|
   | 1 | Hero | image 5 |
   | 2 | Intro | image 6, bands A+B. Holds the **H1** and `WHO.hero` |
   | 3 | Why we started | image 6, band C. `WHO.why` |
   | 4 | Our philosophy | image 6, band D. `WHO.philosophy` |
   | 5 | How we think | image 7, top and middle. `WHO.think` |
   | 6 | Our promise | image 7, bottom. `WHO.promise` |
   | 7 | Shared footer CTA | `chrome_footer` |

   Every field of `WHO` is rendered (see the §2 checklist).
2. **H1 = `WHO.hero.title`, "We're a small team with big ideas."** This is the document's page headline and is image 6's headline verbatim. Image 5's giant display word is the page name, set as a large `<p class="who-display">` (not a heading, and not `aria-hidden`; it reads naturally before the H1). One H1 per page. The hero `<section>` gets `aria-label="Who we are"`.
   *Alternative B (not recommended):* the display becomes the H1 ("who we are."), and the doc title becomes the intro's H2. That demotes the document's headline.
3. **Display wording: "who we are."** This is the document's page name and nav label, and the keyword phrase. The image says **"who are we."**, which is a reworded question, not document copy, so it needs client approval if they prefer it. Both strings use the same letters, so the layout is identical (5.405 em wide at the spec below).
4. **Brand spelling** comes from `lib.BRAND` (TESERACT). Never copy TESSERACT or "tesseract" from the images.
5. **Hero accent.** The light in image 5 is orange: streak peak `#FF762E` and full stop `#F75817`. This is photographic light, so keep it in the hero scene (photography stays as-is). For the **display full stop**, use a page-local `--who-accent:#F75817` (6.36:1 on black), the same pattern as the Approach page's local blue. If the client wants brand red everywhere, use `--red #FB2629` (5.41:1). Everything else on the page uses the site red accent rules. The flower in image 6 (`#D43E22`) is the natural red echo.

---

## 1. Assets extracted to `teseract-website/public/assets/who/`

All files are WebP and were verified in Edge on `#000` and `#0d0d0d` (`_builds/spec-567-shots/check.html` → `_builds/spec-567-shots/check-1440.png`). PNG masters with full alpha are in `WD/_work/img567/*.png`.

### 1.1 Raster files

| File | Px | KB | Source box (x0,y0,x1,y1) | Use | Max display (≤1.25× rule) |
|---|---|---|---|---|---|
| `who-hero-scene-1536.webp` / `-768.webp` | 1536×1024 / 768×512 | 38 / 15 | whole image 5 | Pre-composited hero (light + monitor) on **black**. Headline, header and orange dot removed. Fallback/poster, OG crop. | 1920 CSS px wide. The light is soft, but the monitor part goes soft above ~1.25× on 2× screens. |
| `who-hero-light-1536.webp` / `-768.webp` | 1536×1024 / 768×512 | 21 / 7 | whole image 5 | **Light layer only**: streaks on black, monitor area filled from its surroundings. Put it under `who-monitor` for parallax/tilt. Can use `mix-blend-mode:screen`. | Soft gradients, so it may stretch up to ~2× (exception to the rule, because it has no detail) |
| `who-monitor.webp` | 768×598 (alpha) | 33 | (413,110,1181,708) of image 5 | Monitor, stand and cable cut-out, with the original screen image (motion-blurred figure, abstract, not a team photo). | ≤ 960 CSS px wide |
| `who-rock.webp` | 576×489 (alpha) | 41 | (404,353,980,842) of image 6 | Floating rock, moss and red flower. The frosted glass square was removed (rebuild it in CSS, §4.2), and so was the touching leader line. | ≤ 720 CSS px wide |
| `who-hand.webp` | 306×192 (alpha) | 10 | (0,1054,306,1246) of image 6 | Hand on the dial. Dial lines, box border and finger-gap paper were removed. **The wrist exits the left edge** (alpha at x=0 on rows 66–147), so anchor `left:0`. The pinky tip ends at x=183, y≥162 (crop), where the laptop-photo frame overlaps it in the reference: **keep that overlap.** | ≤ 382 CSS px wide |
| `who-laptop.webp` | 255×130 | 5 | (194,1227,449,1357) of image 6 | Laptop-on-desk photo (inside the drawn frame). | ≤ 319 CSS px wide |
| `who-abstract-01.webp` | 94×94, greyscale | 1.3 | (46,616,140,710) of image 6 | Abstract greyscale ([WHO WE ARE] box thumb) | ≤ 118 CSS px |
| `who-abstract-02.webp` | 197×235, greyscale | 3.7 | (52,1604,249,1839) of image 6 | Abstract greyscale (philosophy box image) | ≤ 246 × 294 CSS px |
| `who-abstract-03.webp` | 149×153, greyscale | 2.5 | (46,1128,195,1281) of image 7 | Abstract greyscale (image 7 "(people)" tile) | ≤ 186 CSS px |

**Not extracted:** image 7's three-person portrait (695–1110 × 1066–1637, teal background `#0B3935`). It shows stock people and would read as a team photo. Per the brief it must not be used. §6.4 has the replacement.

### 1.2 Vector recreations (SVG)

All are `currentColor`, carry no width/height, and can be inlined with `lib.svg_inline('assets/who/…')`:

| File | viewBox | Draws |
|---|---|---|
| `who-globe.svg` | 56×32 | Flat wire globe (under the tag box) |
| `who-sphere.svg` | 64×64 | Wire sphere (bottom-left of band C) |
| `who-sparkle.svg` | 24 | Filled four-point star |
| `who-cube.svg` | 24×26 | Isometric cube outline |
| `who-rings.svg` | 40×26 | Two interlocking rings |
| `who-arrow.svg` | 24 | Bold ↗ with square terminals |
| `who-checker.svg` | 42×18 | Checker chip |
| `who-crenel.svg` | 56×12 | Two-row checker strip (box header) |
| `who-burst.svg` | 16 | Small sun/burst |
| `who-dial.svg` | 480×480, centred | Technical dial: rings at r 228/195/178/166/125/100, ticks every 5°, long ticks every 30°, decorative 000–330 labels, dashed crosshair |

The SVG `<text>` labels in the dial only pick up Geist Mono when inlined. Inside an `<img>` they fall back to the system mono.

### 1.3 Extraction notes and quality limits

- **Monitor (image 5).** The bezel is the largest very dark component. The background was flood-filled (L>140 and gradient <60), then limited to the dilated bezel hull plus the stand box. A bottom-face rule re-adds the bright-orange lower rim, which the flood had taken for background: orange pixels (R−B>130) up to 14 px below the bezel. The stand is cut where it enters the ledge, along the measured edge `y = 653 + 0.18 (x − 470)`. The bright gap between cable and neck stays transparent. Edge alpha is projected against a **locally inpainted background** (white → orange varies), then colour is de-contaminated.
  - Because the bezel is black, it disappears on black unless there is light behind it, so always place it over the light layer.
- **Light layer (image 5).** The white studio background is removed and only the orange light is kept. Intensity is the chroma (max−min) with γ 0.85. Hue is clamped warm, and dim pixels may not go yellow (an olive tint appeared otherwise). The ledge's white-hot core line (source ≈ `#FFFFE4`) is restored as pale amber `#FFC48C` from a dilated chroma field, but only within ±26 px of the measured ledge curve. Everything below the ledge fades to black (ledge + 12…58 px), so the headline zone is pure black. Header text, the headline letters and the orange full stop were inpainted out first, so no ghost letters remain.
- **Rock (image 6).** The frosted square was a white overlay with k = 0.227 at (475–541, 576–662). It was inverted (`R = (C − k·255)/(1−k)`) and its 1–2 px outline inpainted. In the cut-out it sits at (71,223)–(138,310) = left 12.3 %, top 45.6 %, w 11.6 %, h 17.8 %. Its interior is slightly softer than the surrounding rock because the overlay also blurred it. **The CSS glass tile in §4.2 sits exactly there and hides it.** If the tile is animated, keep it within ±6 px of that spot.
  - Pale grass tips read as a fine rim light on black. This is not a white halo: the halo check gives a mean edge excess of 0.18 levels.
- **Hand (image 6).** Skin is selected by warmth (R−B>14 and (R−B)/R ≥ 0.17 at the edges), so the grey dial lines and paper drop out. Paper between the fingers (shadowed, slightly warm) was removed by component (x<240, lum>150, low warmth ratio). The nails at x>260 were kept.
- **Halo check on black** (`halo.py`, edge pixels 0.05<α<0.95 brighter than α × the adjacent interior + 12 levels):

  | Asset | Halo pixels | Max excess |
  |---|---|---|
  | monitor | 0.65 % | 20 |
  | hand | 1.3 % | 20 |
  | rock | 3.3 % (pale blade tips; mean excess 0.18) | 40 |

  No visible white fringe at 1× or at 3× zoom.
- **Resolution.** The sources are small and AI-composited, so everything is ≤ 1× at 1440 for the reference layout:

  | Asset | Size at 1440 in the reference layout |
  |---|---|
  | rock | 605 px |
  | hand | 324 px |
  | laptop | 299 px |
  | monitor | ≈720 px |

  On 2× DPR screens everything except the soft light layer will look slightly soft. That is acceptable for this art direction, but never enlarge past the "Max display" column. **The abstracts are tiny** (94–197 px). Use them only at their reference scale, never as large panels.

### 1.4 Monitor geometry (for optional screen swaps and overlays)

**Monitor placement inside the image-5 / light-layer canvas (3:2):** `left 26.89 %`, `top 10.74 %`, `width 50.00 %`, `height 58.40 %`.

**Screen quad** (inner glass, corner radius ≈ 8 dpx):

| Corner | Source px | Monitor-crop % |
|---|---|---|
| TL | (460,138) | 6.1 / 4.7 |
| TR | (1074,256) | 86.1 / 24.4 |
| BR | (1152,671) | 96.2 / 93.8 |
| BL | ≈(466,571), intersected from the edges | 6.9 / 77.1 |

**Bezel outer:** (441,123) (466,116) (1079,242) (1111,350) (1172,687) (1152,693) (461,592) (447,559).

The device leans: the top edge rises 7.0° to the right (118 dpx over 614) and the right edge leans 10.6°. The streak angle is 13.5°.

---

## 2. Content mapping: `scripts/content.py` → the page

Every `WHO` string appears once, verbatim, as real HTML text. Uppercase styling must be done with `text-transform` so the DOM keeps sentence case (better for screen readers and for GEO quoting). `{brand}` goes through `fmt()`.

| Doc field | Text (verbatim) | Where it goes | Element |
|---|---|---|---|
| `hero.title` | We're a small team with big ideas. | Intro band A, top-left, 3 lines uppercase (image 6 headline) | **`<h1 id="page-title">`** |
| `hero.body[0]` | {brand} is a digital creative studio focused on design, technology and experiences. | Annotation directly under the H1 (image 6 "IDEAS THAT TURN…" slot), with a leader line to the rock. It comes first after the H1 in the DOM, which makes it the GEO definition sentence. | `<p class="who-note who-note--lead">` (sentence case, not mono, see §4.1) |
| `hero.body[1]` | We work with businesses, founders and teams that want to build something different. | `[ WHO WE ARE ]` box text, beside `who-abstract-01` | `<p>` |
| `hero.body[2]` | Our work sits somewhere between strategy, design, technology and creativity. | Top-right annotation (image 6 "CREATIVE THINKING…" slot), 4 lines, underline rule and leader to a node | `<p>` |
| `why.label` | Why We Started | Band C box header `WHY WE STARTED` + `/02` (image 6 "NOT JUST A STUDIO – A TEAM" bar) | `<p class="who-box__head">` |
| `why.title` | We started with a simple question. | First line of the `/02` box body | **`<h2 id="why-title">`** |
| `why.question` | Why do so many businesses with great ideas have websites that feel exactly the same? | The big boxed-word statement (image 6 "We combine…" slot). See §5.3 for the boxes and icons. | `<p class="who-statement">` |
| `why.answer` | We wanted to change that. | Row under the statement (image 6 globe/checker-chip slot), left column, 24 px ink | `<p>` |
| `why.body` | We believe your digital presence should not simply explain what your business does. It should communicate who you are, what you believe and why people should care. | Same row, right column, 16–18 px `--ink-2` | `<p>` |
| `why.closing` | That's why every project starts from zero. | "Collaboration" box beside the dial (crenel + burst header), above the divider, uppercase mono | `<p>` |
| `philosophy.label` | Our Philosophy | `/03` box header `OUR PHILOSOPHY /03` (image says "OUR APPROACH", which is a different page) | `<p class="who-box__head">` |
| `philosophy.title` | Understand first. Design second. Build better. | Text panel overlapping the abstract image, first paragraph | **`<h2 id="philosophy-title">`** |
| `philosophy.body` | We don't jump straight into design. | Text panel, second paragraph | `<p>` |
| `philosophy.steps[0–3]` | First, we understand the business. / Then we understand the people. / Then we find the right idea. / Then we build it. | Right column, numbered boxes 01–04 (not repeated inside the panel; the image duplicates them) | `<ol>` with `<li>`; the numbers are `aria-hidden` |
| `think.label` | How We Think | Image 7 top-left rail label "how we think" (small, lower case via CSS) | **`<h2 id="think-title">`** (a visually small H2 is fine) |
| `think.items[i][0]` | People first. / Details matter. / Different doesn't mean complicated. | Giant editorial heading of each spread (image 7 "People first. Always.", **without "Always."**) | **`<h3>`** ×3 |
| `think.items[i][1]` | Technology changes. Trends change. Design styles change. But people remain people. / A button. A transition. A headline. A colour. A loading screen. / We love creative ideas. But creativity should never get in the way of clarity. | Large statement (image 7 "We create experiences for real people…" slot) | `<p class="who-think__lead">` |
| `think.items[i][2]` | We create experiences that are easy to understand, enjoyable to use and meaningful to the people they're built for. / Small details can change how something feels. We care about those details. / If someone can't understand what you're offering, the design isn't doing its job. | Small text column (image 7 right-hand column; the left column slot is unused, see §6.3) | `<p>` |
| `promise.label` | Our Promise | Image 7 bottom-left rail label | `<p class="who-rail">` |
| `promise.title` | We will never build something just because everyone else is doing it. | Image 7 braces quote `{ … }`. The braces are CSS pseudo-elements, not text. | **`<h2 id="promise-title">`** |
| `promise.lines` | We'll question the obvious. / We'll explore different directions. / And we'll always ask: | Under the quote, 3 lines | `<ul role="list">` |
| `promise.question` | Is this right for the brand? | Last line, emphasised, with a red hand-drawn underline (keep the existing `who-promise__line` SVG idea) | `<p class="who-promise__q"><em>` |

**Heading outline:** H1 (intro) → H2 why → H2 philosophy → H2 how we think → H3 ×3 → H2 promise. There are no other headings. Box headers and rail labels are `<p>`.

**Descriptive internal links** (copy uses page names only, so nothing is invented):

| Link text | Target | Where |
|---|---|---|
| "Our approach ↗" | `/our-approach/` | Philosophy box footer, and the image 7 rail label "our approach" |
| "Explore our work" | `/work/` | Optional, under the promise. Same wording as the home CTA. |

The footer CTA ("Have an idea?" + Start a Project) is already shared.

### 2.1 Invented content in the images (flagged) and the document-based replacement

| # | Image / where | Invented text or claim | Why it can't be used | Replacement (document-based) |
|---|---|---|---|---|
| 1 | 6, top-right | `LOCAL TIME / PARIS 02:23 PM` | Location claim (Paris) | `YOUR LOCAL TIME / 02:23 PM`, with the visitor's live time (page JS, `hh:mm a`, minutes, `<time datetime>`), the same as the footer's "your local time". If `site.config.json` gains a `timezone`, show `STUDIO TIME`, and still no city. Fallback with no JS: hide the time line. |
| 2 | 7, left rail | `2023 year` | Founding/year claim | Remove it. The rail keeps only doc labels and counters (§6.1). |
| 3 | 6, `/02` box | "We're a small, curious team of **designers, developers and thinkers** who love building digital experiences **that make a difference**." + header "NOT JUST A STUDIO – A TEAM" | Team composition and impact claim | Box header `WHY WE STARTED /02`. Body = `why.title` (H2). |
| 4 | 6, collab box | `A SMALL TEAM / A GLOBAL MINDSET` (+ COLLABORATION / IDEAS / PEOPLE / PROGRESS) | "Global mindset" is a scope claim; the list is not document copy | Above the divider: `why.closing` ("That's why every project starts from zero."). Below it: `A SMALL TEAM / WITH BIG IDEAS.` (H1 restated, decorative, `aria-hidden`). |
| 5 | 6, statement | "…to create digital experiences that **feel different**." | Paraphrase of HOME.idea, not WHO copy; "feel different" wording is not in the document | Statement = `why.question` (§5.3) |
| 6 | 7, giant heading | "People first. **Always.**" | "Always." is added to the document title | "People first." (2 lines, §6.2) |
| 7 | 7, statement | "We create experiences for real people, not just businesses." | Invented line | `think.items[0][1]` |
| 8 | 7, text columns | "We **design** experiences…" / "Technology changes. Trends change. But people remain people." (drops "Design styles change.") | Altered document sentences | The document sentences verbatim (§2 table) |
| 9 | 7, quote | "{We put people at the centre of everything we do — because great design starts with real human understanding.}" | Invented quote | `{` + `promise.title` + `}` |
| 10 | 7, portrait | Three smiling people in black/white tops on teal | Stock people **implied as the team** | Do not extract or use it. Use a non-person visual (§6.4). |
| 11 | 6, annotations | `CREATIVE THINKING / STRATEGIC DESIGN / MODERN TECHNOLOGY / REAL IMPACT` | "Real impact" is a results claim | `hero.body[2]` sentence |
| 12 | 6, annotations | `CURIOUS MINDS / DIFFERENT PERSPECTIVES / BIG IDEAS / REAL BUSINESS IMPACT` | Team characterisation and results claim | `hero.body[1]` sentence |
| 13 | 6, annotations | `IDEAS THAT TURN INTO DIGITAL REALITY.` | Invented tagline | `hero.body[0]` sentence |
| 14 | 6, annotations | `A DIFFERENT KIND OF AGENCY FOR A BRIGHTER DIGITAL TOMORROW.` | Home label reused, plus an invented promise | `BUILD BEYOND THE ORDINARY.` (the document's brand tagline, `content.BRAND['tagline']`) |
| 15 | 6, chips | `STRATEGY / DESIGN / TECH / IMPACT` | "Impact" is a results word | `STRATEGY / DESIGN / TECHNOLOGY / CREATIVITY` (`hero.body[2]` words) |
| 16 | 6, tag box | `IDEAS × DESIGN × TECHNOLOGY` | Not the document's list | `DESIGN × TECHNOLOGY × EXPERIENCES` (`hero.body[0]` words) |
| 17 | 6, box header | `OUR APPROACH /03` | Wrong label: this content is the document's *Our Philosophy* | `OUR PHILOSOPHY /03` |
| 18 | 6, panel | `THEN WHE UNDERSTAND` | Typo in the image | Not used. The steps render once, from the document. |
| 19 | 5, 6, 7 | `TESSERACT` / `tesseract` | Brand spelling | `lib.BRAND` |
| 20 | 5 | `who are we.` | Reworded page name | `who we are.` (client may approve the image wording, §0.3) |

### 2.2 Micro-labels introduced (for client approval)

All of these are pure descriptors that restate document wording or page names:

| # | Label | Source wording |
|---|---|---|
| 1 | `who we are.` (hero display) | Page name |
| 2 | `DESIGN × TECHNOLOGY × EXPERIENCES` | `hero.body[0]` |
| 3 | `[ WHO WE ARE ]` | Page name |
| 4 | `{BRAND} /01` + `STRATEGY · DESIGN · TECHNOLOGY · EXPERIENCES` | Pre-approved in DARK-THEME |
| 5 | `BUILD BEYOND THE ORDINARY.` | Brand tagline |
| 6 | `YOUR LOCAL TIME` | Visitor clock, the same as the footer |
| 7 | `WHY WE STARTED /02`, `OUR PHILOSOPHY /03` | Document section labels + index |
| 8 | Chips `STRATEGY / DESIGN / TECHNOLOGY / CREATIVITY` | `hero.body[2]` |
| 9 | `A SMALL TEAM / WITH BIG IDEAS.` | H1 |
| 10 | Rail: `how we think`, `our approach` (link), `{brand}` (lower case), `our promise`, counters `01 — 03` | Document labels, page name, brand |
| 11 | Per-spread tags: `(people)` `(experience)` · `(details)` `(feel)` · `(ideas)` `(clarity)` + `(01)` `(02)` `(03)` | Words from each `think` item |
| 12 | Bottom labels `(understand)` `(design)` `(build better)` | `philosophy.title` |

---

## 3. Page-wide tokens and rules (black theme)

```css
.page-who{
  --who-accent:#F75817;                 /* image 5 full stop (sampled). Only the display dot + hero */
  --who-glow:#FF762E;                   /* image 5 streak peak (for CSS light, §4.4) */
  --who-amber:#FFC48C;                  /* hot core under the monitor */
  --who-grid:rgba(255,255,255,.06);     /* poster grid hairlines (decorative) */
  --who-line:rgba(255,255,255,.22);     /* annotation box borders, frames */
  --who-lead:rgba(255,255,255,.30);     /* leader/connector lines */
  --who-node:var(--ink);                /* node squares */
  --who-bar:rgba(255,255,255,.08);      /* /01 box header bar (image: #E0E0E0) */
  --u6:calc(min(100vw,1440px) / 1333);  /* image-6 design unit (1 dpx). Desktop only */
}
```

- **Text colours and measured contrast** (WCAG, on the real backgrounds):

  | Colour | Use | Contrast |
  |---|---|---|
  | `--ink` | Headings and body | 19.07:1 on #000; 15.48:1 on #1c1c1c |
  | `--ink-2` | Secondary copy | 10.18:1 on #000; 9.46:1 on #141414 |
  | `--muted-strong` | All mono annotations and small labels | 7.21:1 on #000; 6.94:1 on #141414 |
  | `--muted` (.40) | Decorative glyphs/lines only | 3.42:1 |
  | `#000` on an `--ink` bar | Inverted `/02` header | 19.07:1 |
  | `--who-accent` (dot) | Display full stop | 6.36:1 |

  The image-7 grey micro-labels (`#717171`) map to `--muted-strong`, and image-7 body columns (`#3a3a3a`) map to `--ink-2`.
- **Annotation boxes:** transparent or `#0b0b0b` fill, `1px solid var(--who-line)`, radius 0 (technical look). Exception: the `/01` box's chamfered bottom-right corner (13 dpx), done with `clip-path:polygon(…)` plus an SVG border, or a `::after` diagonal. Header bars:
  - `/01`: `--who-bar` fill + `--ink` bold sans.
  - `/02`: **inverted**, an `--ink` bar with black text. This is the one "loud" element of band C.
  - `/03`: `1px` box with a bottom hairline.
- **Nodes** (connector ends): 22 dpx outlined square (`1px var(--who-lead)`) with a centred 9 dpx filled `--who-node` square. **One node per band may be `--red`** (the "one accent per section" rule). Use it on the node nearest the H1, the statement and the steps respectively.
- **Leader lines:** inline SVG, `stroke:var(--who-lead)`, `stroke-width:1`, `vector-effect:non-scaling-stroke`. Geometry is in §5, as dpx polylines.
- **Fonts:** `--font` (Geist) for sans, `--mono` (Geist Mono) for annotations. The fitted sizes below are Geist values; Geist is wider than the reference's Helvetica-like face, so tracking is kept within readable limits (display ≥ −0.06 em, text ≥ −0.02 em) and lines may run 2–5 % longer than the poster.
- **Breakpoints** (site): desktop ≥1440, tablet 800–1439.98, phone ≤799.98, plus the 1023 and 719 text presets.
  - **The image-6 artboard is absolute-positioned only at ≥1200 px.** Below that, the annotations flow (see §8).
  - Minimum sizes everywhere: mono labels ≥ 12 px (uppercase, `letter-spacing:.04em`); body text ≥ 15 px.

---

## 4. Section 1: Hero (image 5)

### 4.1 Measurements (canvas 1536 × 1024, 3:2)

| Element | Box / value (dpx) | % of canvas |
|---|---|---|
| Monitor (cut-out box) | x 413–1181, y 110–708 | left 26.9, top 10.7, w 50.0, h 58.4 |
| Main light streak, peak line | (5,191) → (380,311) → (1200,472) → (1530,557), i.e. **y = 191 + 0.24x**, angle 13.5° | Band thickness: 85 dpx at the left (x=5: y 149–232) → 115 at x 1530. Upper edge soft; lower edge **crisp** on the right (y ≈ 575–586). |
| Lower ledge light line | (0,575) (100,590) (200,607) (300,623) (380,630) (500,658) (700,694) (900,722) (1200,743) (1300,739) (1536,730) | A slow arc that peaks near x 1250. A hot amber core under the stand (x 470–760). |
| Display "who we are." | ink left x **104** (6.8 %); x-height top y **763** (74.5 %); ascender top y 701; baseline y **912** (89.1 %); full stop x 1413–1461, y 867–915 (Ø 48 dpx, centre 1437,890) | Width incl. dot 88.3 % |
| Display metrics | x-height 148, ascender 211, stem 56 → **Geist wght 900**, fitted size 274.6 dpx, fitted tracking −0.107 em (too tight in Geist) | |
| Word gaps | "who"→"are" 40 dpx, "are"→"we" 31 dpx (≈0.13 em) | |
| Display colour (ref) | Vertical gradient: `#2A2828` top → `#141313` at 40 % → `#757270` at the baseline | |

### 4.2 Black-theme recreation

**Layers:**

- **Light** (`who-hero-light-*`): `object-fit:fill`, horizontally `width:max(100%, var(--aw))`. Stretching the soft light horizontally is invisible, which avoids hard side edges on ultra-wide screens. Height = artboard.
- **Monitor** (`who-monitor.webp`), positioned at the measured % box of the artboard.
- **Display** text, live HTML.

Use `--aw:min(100vw, 150svh)` (the artboard width, 3:2) so the display baseline (89.1 %) always lands inside the first viewport.

**Display type.** Geist 900, `letter-spacing:-.06em` (5.405 em wide), `font-size:calc(var(--aw) * .1634)`. That gives 235 px at 1440×900 (aw 1350 → 221 px) and 136 px at 834. `line-height:.8`. Left edge at 6.8 % of the artboard. **The baseline sits at 89 % of artboard height.**

**Display colour** for the black theme:
```css
background:linear-gradient(180deg,#f4f4f2 0%,#f4f4f2 46%,rgba(244,244,242,.42) 100%);
-webkit-background-clip:text;background-clip:text;color:transparent;
```
Keep `color:var(--ink)` as the non-clip fallback. The bottom stop gives 3.68:1, which is ≥3:1 for large text. The full stop is a separate `<span class="who-display__dot">` with `color:var(--who-accent)` (non-clipped). On reduced motion it is static.

**Contrast safety, measured on the scene.** Scene rows 640–745 contain the bright ledge light (`--ink` on it reaches 1.04:1). Every row **below y 745 (72.8 %) gives ≥ 4.5:1** for `--ink`, and the x-height band (763–912) gives ≥ 15.7:1. The ascender of "h" (x 300–400, y 690–765) sits on dark scene (≥ 18.9:1). **Rule: the display's x-height top must stay at or below 74 % of the artboard height**, which is true at the sizes above. If a breakpoint puts the text higher, add a `linear-gradient(transparent, #000 60%)` scrim under it.

**Orange light reads as premium on black.** The bezel's black edge needs the light layer directly behind it; never place the monitor on bare `#000`.

**Optional CSS light** (no raster, animatable). Replace or augment the raster streak with:
```css
.who-hero__beam{position:absolute;left:-10%;right:-10%;top:calc(var(--ah)*.19);height:calc(var(--ah)*.16);
  transform:rotate(13.5deg);transform-origin:0 50%;
  background:linear-gradient(180deg,transparent 0%,rgba(255,118,46,.18) 35%,rgba(255,118,46,.85) 78%,rgba(255,150,80,.95) 82%,transparent 84%);
  filter:blur(18px);mix-blend-mode:screen}
```
The crisp lower edge is the 82→84 % stop. Plus a thin arc line for the ledge (SVG path through the §4.1 points, `stroke:#FFC48C`, `stroke-width:2`, `filter:blur(1.5px)`, with a 14 px blurred copy at 40 % opacity).

### 4.3 Motion

| Phase | Timing | What happens |
|---|---|---|
| Enter (no scroll) | 0 ms | Light fades in from 0 → 1 over 900 ms, ease `--ease`, with `clip-path:inset(0 100% 0 0)` → `inset(0)` along the 13.5° streak direction (a **light sweep**, 1.2 s). |
| | 200 ms | Monitor: `opacity 0→1`, `translateY(24px)→0`, `scale(.97)→1`, 900 ms, `--spring`. |
| | 450 ms | Display words rise (`data-split`, 38 ms word stagger, existing CSS). |
| | ≈850 ms | The **full stop** pops: `scale(0)→1` with `--spring`, 400 ms. |
| Idle | continuous | The light "breathes": opacity .88 ↔ 1, 7 s ease-in-out infinite, paused off-screen. The amber core under the stand flickers very slowly (0.9–1, 5 s). |
| Pointer (fine pointer, desktop) | rAF-lerped | Monitor tilts `rotateX/rotateY ±2.5°` + translate ±6 px toward the cursor (lerp 0.08); the light layer counter-moves ±10 px. **No tilt on touch.** |
| Scroll | 0 → 100 % of hero | Monitor `translateY(0 → -8%)` + `scale(1 → .94)`; light `translateY(0 → 4%)`; display `translateY(0 → -12%)`. Transform-only, rAF, paused off-screen. |
| Reduced motion | | All static. Use `who-hero-scene-*` as a single image, or the two layers unmoved. |

### 4.4 Responsive

| Width | Treatment |
|---|---|
| 1440 | Stage `height:100svh` (min 640, max 1000). Artboard `--aw:min(100vw,150svh)` centred. The display size is aw-linked. |
| 834 | Stage `min-height:78svh`. Artboard **130 % wide**, centred (crops the empty sides, so the monitor ≈ 65 % of the viewport). Display `font-size:16.3vw` (136 px) on one line. Its x-height top must stay below the ledge, so push the stage taller rather than the text higher. |
| 390 | Artboard **175 % wide**, centred on the monitor (`left:50%;translate:-50%`; the monitor fills ≈ 88 % of the viewport, at its 1.0× limit). The display goes on **two lines**: "who" / "we are." at `font-size:min(27vw,112px)`, left-aligned at the 16 px gutter, `line-height:.82`. "we are." is 3.283 em = 346 px at 390, inside the 358 px container (319 px at 360). Place it under the ledge glow, then a black area. Pointer tilt is off. Use the 768 light/scene files. |

**Priority:** the light (or scene) and the monitor are `loading=eager`, `fetchpriority=high`, `decoding=async`, with `sizes` matching the artboard width. They are decorative: `alt=""`.

---

## 5. Sections 2–4: Image 6 (intro, why, philosophy)

### 5.1 Poster grid (desktop artboard 1333 dpx = `min(100vw,1440px)`)

**Vertical hairlines** at x **351 / 667.5 / 1005** (26.3 / 50.1 / 75.4 %), full height. **Horizontal hairlines** at y **445 / 824 / 1513**, full width. The reference colour is `#F4F4F4`-ish on white (−7 levels).

On black, use `--who-grid` (rgba(255,255,255,.06)), 1 px, plus small 7 dpx "+" crosses at the intersections (rgba(255,255,255,.18)). The bands therefore are:

| Band | y range (dpx) | Contents |
|---|---|---|
| A | 0–445 | Header row + H1 + top annotations |
| B | 445–824 | Rock + side annotations |
| C | 824–1513 | Why |
| D | 1513–2000 | Philosophy |

Bands A+B are one `<section>` (intro). C and D are their own sections. Each band starts with the full-bleed hairline. That is the "intentional seam" between sections; no panels are needed.

### 5.2 Band A + B: intro (H1 + hero body)

| Element | dpx box | Type (fitted to Geist) / style | Content |
|---|---|---|---|
| Top-left brand label | x 34, cap 26–39 (cap 14 → **20 dpx**, sans 500, caps) | `--muted-strong` | `{BRAND}` (or omit, since the header logo is visible; recommended **omit** at ≥1200 to avoid a double logo) |
| Tag box | 557–794 × 24–51 (237×27); text cap 10 → **mono 14 dpx**, +.06 em | 1 px `--who-line` box, `--ink-2` text | `DESIGN × TECHNOLOGY × EXPERIENCES` |
| Globe under the tag | 642–696 × 63–94 | `who-globe.svg`, 54 dpx wide, `--muted` | — |
| Local time | right edge 1297; line 1 "LOCAL TIME" cap 10 (`--muted-strong`), line 2 cap 11 (`--ink`), **mono 15 dpx**, right-aligned | Live minutes | `YOUR LOCAL TIME` / `02:23 PM` |
| "+" box | 1098–1124 × 77–104 (26 dpx) | 1 px `--who-line`, centred 9 dpx plus | Decorative |
| **H1** | x 35; cap tops 126 / 201 / 276; cap 61; pitch 75 | **Geist 560, 86 dpx (`calc(86*var(--u6))`), line-height .872, tracking −.045 em, uppercase**. 3 lines: "WE'RE A / SMALL TEAM / WITH BIG IDEAS." The fitted tracking was −0.08…−0.10 em: too tight, so accept a wider line. "WITH BIG IDEAS." = 7.221 em = 621 dpx, ending at x ≈ 656, still left of the x 667.5 grid line. | `hero.title` |
| hero.body[0] note | x 172–360, y 402–431 → give it **x 172–470**, 2–3 lines | **Sans 17 dpx / 1.35, `--ink-2`** (this is the definition sentence, so it is not mono). The rule under it runs y 445 (on the grid line) from x 172 → 360. Leader: (360,445) → (408,496) → node at (461,496). | `hero.body[0]` |
| `[ WHO WE ARE ]` | 35–186 × 571–590 (cap 20 → **sans 700, 27 dpx**) | `--ink` | Page name |
| WHO box | 35–360 × 606–719; thumb 46–139 × 615–710 (`who-abstract-01`, 94 dpx); text x 154; reference 4 lines pitch 20 | Text **mono 15 dpx / 1.33, uppercase, `--ink-2`** | `hero.body[1]` (14 words, 4–5 lines at 25 ch) |
| hero.body[2] note | 799–946 × 147–208 (4 lines, pitch 17); rule y 221 from x 800 → 964; leader (800,221) → (759,298) → (686,298) → node (668–677, 293–303) | **Mono 14 dpx / 1.21, uppercase, `--ink-2`**. Break as: "Our work sits / somewhere between / strategy, design, / technology and creativity." | `hero.body[2]` |
| `/01` box | 1051–1297 × 295–450 (246×155); chamfer BR 13 dpx; header bar y 302–330 (inset 8) | Header: `{BRAND}` **sans 700, 22 dpx** + `/01` mono 17 dpx right. List x 1067 (`+`) / 1098 (text), items pitch 24.5, **mono 19 dpx**, `--ink-2`. Leader: (1051,450) → (1018,512) → node (955–972, 505–520). | `+ STRATEGY + DESIGN + TECHNOLOGY + EXPERIENCES` (`aria-hidden`, decorative) |
| Rock | `who-rock.webp` at 404–980 × 353–842 (576×489 dpx = 43.2 % width, centre x 692) | Ground glow below it on black: `radial-gradient(50% 18% at 50% 100%, rgba(255,255,255,.06), transparent)`. Shadow: none (it floats). | `alt=""` |
| Glass tile on the rock | 475–542 × 576–663 (67×87 dpx) | `backdrop-filter:blur(3px) brightness(1.25); background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.35)` | Decorative |
| Tagline note | 1151–1302 × 655–725 (4 lines, pitch 20), **mono 15 dpx** | Leader from the rock's right edge (968,617) → (1040,617) → node (1105–1124, 652–672). Bracket: vertical x 1115 from 677 → 743, then horizontal y 742 from 1116 → 1306. | `BUILD BEYOND THE ORDINARY.` |
| Node below the rock | 724–733 × 857–866 → line → node 867–876 × 958–966 | — | Connects into band C (the `/02` box) |

**Reading order (DOM):** H1 → body[0] → body[1] → body[2] → decorative group (`aria-hidden`: tag, globe, time, /01 list, tagline, nodes, lines). The rock comes last.

### 5.3 Band C: why we started

| Element | dpx box | Style | Content |
|---|---|---|---|
| `/02` box | 1015–1311 × 839–965 (296×126) | Header bar 1015–1248 × 839–860, **inverted** (`--ink` bg, black text, mono 700, 15 dpx, uppercase) + `/02` mono right. Body x 1029, **H2 inside, styled mono 18 dpx / 1.0 (pitch 17.5) uppercase `--ink`**, or optionally sans 22 dpx (more heading-like). | `WHY WE STARTED` / H2 `why.title` |
| Chips | y 980–1001: 1018–1101, 1113–1176, 1188–1234, 1246–1310 | Pill outline 1 px `--who-line`, radius 8, mono 13 dpx, `--ink-2` | `STRATEGY` `DESIGN` `TECHNOLOGY` `CREATIVITY` (`aria-hidden`; widen to fit) |
| **Statement** | x 503 → 1272 (769 dpx); 5 lines, cap tops 1081 / 1148 / 1226 / 1299 / 1366; pitch ≈ 71.3; cap 48 | **Geist 450, 68 dpx, line-height 1.05, tracking −.035 em** (fitted −0.047…−0.067; relaxed), `--ink` | `why.question` |
| Word boxes | e.g. "strategy," 949–1208 × 1076–1141; "design," 584–794 × 1147–1213; "storytelling" 628–947 × 1222–1287 | `display:inline-block; padding:0 .09em; border:1px solid rgba(255,255,255,.55); line-height:.94; margin:0 .04em`. On black, keep the box **lighter than the hairlines**: it is the typographic accent. | Box **"great ideas"**, **"websites"** and **"exactly the same?"** (3 boxes, as in the reference). One of them may take a `--red` 1 px border (the section's accent). Recommend **"exactly the same?"**. |
| Inline icons | ✦ 44×46 dpx (0.65 em) after "Why do so many"; cube 58×67 (≈1 em) before "businesses"; rings 90×56 (1.3 em) after "the same"; ↗ 40×42 (0.6 em) after "websites" | `who-sparkle/cube/rings/arrow.svg`, `height:.7–1em`, `vertical-align:-.1em`, `--ink`, `aria-hidden` | Suggested wrapping at 769 dpx: "Why do so many ✦ / ⬡ businesses with / [great ideas] have / [websites] ↗ that feel / [exactly the same?] ⊂⊃" |
| Answer + body row | replaces the globe/checker chip at 970–1097 × 1422–1466 → a row x 503–1272, y ~1440–1500 | Left: `why.answer`, **sans 500, 24 dpx `--ink`**. Right: `why.body`, **sans 17 dpx / 1.45 `--ink-2`**, max 46 ch. Optionally keep the globe+checker chip (`who-globe` + `who-checker`) as a 128×44 dpx decorative end-mark after the body. | `why.answer`, `why.body` |
| Collaboration box | 116–289 × 885–1057 (173×172) | Header: `who-crenel.svg` (127–238 × 896–913) + `who-burst.svg` (261–274). Text **mono 15 dpx / 1.2 uppercase `--ink`**. Divider y 1005 (130–277, `--who-line`). Lower lines `--muted-strong`. An arrow line from the box's right side at y 933, x 300 → 418, ends in an arrowhead. | Above: `why.closing`. Below: `A SMALL TEAM` / `WITH BIG IDEAS.` (`aria-hidden`) |
| Dial | Centre **(192,1132)**, r 228 / 195 / 178 / 166 / 125 / 100; extends off the left edge (x 192−228 = −36) | `who-dial.svg`, 480 dpx square centred there, colour rgba(255,255,255,.28). Ticks band brighter (.45). | Decorative |
| Hand | `who-hand.webp` at 0–306 × 1054–1246 (left:0) | Above the dial, below the laptop frame | `alt=""` |
| Dial → node leader | (405,1123) → node (457–466, 1118–1128) | `--who-lead` | — |
| Laptop photo | frame 183–460 × 1216–1369 (1 px `--who-line`); photo 194–449 × 1227–1357; small corner square top-right (452–460 × 1216–1224) | Photo `who-laptop.webp`, `.reveal-image`. The frame sits **above the hand's pinky tip**. | `alt=""` |
| Wire sphere | 55–165 × 1378–1487 (110 dpx) | `who-sphere.svg`, rgba(255,255,255,.45). Slow Y-rotation illusion (§5.5). | Decorative |

**DOM order:** `/02` label → H2 → statement → answer → body → closing → decorative collage (`aria-hidden` group: dial, hand, laptop, sphere, chips, the "A SMALL TEAM" lines).

### 5.4 Band D: our philosophy

| Element | dpx box | Style | Content |
|---|---|---|---|
| Box header | 40–358 × 1555–1596 (318×41) | Label **sans 700, 22 dpx (cap 16), uppercase `--ink`** at x 51; `/03` mono 17 dpx at x 315. Bottom hairline. | `OUR PHILOSOPHY` `/03` |
| Image | 50–250 × 1603–1839 (200×236) | `who-abstract-02.webp` (197×235 = 1.0×), `.reveal-image` | `alt=""` |
| Text panel | 251–554 × ≈1594–1895 (303×300), overlapping the image's right edge by 0 and the header's bottom | `#000` fill (it covers the box line), 1 px `--who-line`. Padding 26 dpx. Text **mono 21 dpx (cap 15), line pitch 26 (1.24), paragraph gap 12, uppercase `--ink`** | H2 `philosophy.title` (3 short lines) + `philosophy.body` |
| Panel → steps leader | (554,1668) → (575,1668) → node (≈ 662–681, 1747–1766) | `--who-lead`; that node is the band's `--red` node | — |
| Steps | Number boxes x 733–791 (58×52); tops 1590 / 1668 / 1746 / 1830 (pitch ≈ 80); numbers cap 18 → **Geist Mono 700, 25 dpx** centred; step text x 826, cap 18 → **Geist 400, 25 dpx**, tracking −.02 em (fitted −0.07, relaxed) | Boxes 1 px rgba(255,255,255,.35); text `--ink` | `<ol>` `philosophy.steps` |
| Link | Under the steps at x 826, ≈ +56 dpx | `lib.button(..., variant='light', icon_name='arrow-ne')` or a text link with roll | "Our approach" → `/our-approach/` |

### 5.5 Motion (image 6 bands)

- **Grid draw-in:** each band's hairlines `transform:scaleX(0)→1` (horizontals, origin left) / `scaleY(0)→1` (verticals, origin top), 1.2 s `--ease`, 0/120/240 ms stagger, when the band enters. Reduced motion: no transform.
- **Leader lines:** SVG `pathLength="1"`, `stroke-dasharray:1; stroke-dashoffset:1 → 0`, 700 ms `--ease`, after the text they connect (`--d` 150–300 ms). The nodes pop (`scale(.4)→1`, `--spring`) when their line arrives.
- **Annotations:** `data-reveal="fade"` + `--y:12px`, `data-stagger="70"` per band. Mono texts may use a short "decode" (random glyphs → final, ≤ 400 ms) only with `prefers-reduced-motion:no-preference`, **and the final text must be in the DOM from the start** (animate a visual overlay, not the text node).
- **Rock:** an idle float `translateY(±8px)` + `rotate(±0.6deg)`, 6.5 s ease-in-out infinite (paused off-screen). Scroll parallax `translateY(0 → -6%)` across the section. The glass tile follows the pointer by ±6 px (lerp) and stays over its spot (§1.3).
- **H1:** `data-split` (word rise). body[0] fades up at 250 ms.
- **Statement (band C):** `data-split` word rise. Then the word boxes draw (`clip-path:inset(0 100% 0 0)→inset(0)`, 500 ms, after their word). The icons enter:
  - ✦ rotates 0→90° + scale .6→1
  - the cube strokes draw
  - the rings slide together from ±.3 em
  - ↗ translates from (−4px, 4px)
- **Dial:** `rotate` linked to scroll progress through band C (−20° → +20°) and **eased (lerp .1)**. It reads as the hand turning the dial. Reduced motion: static.
- **Laptop:** `data-clip` reveal. **Sphere:** CSS idle `rotateY` illusion. Animate the latitude ellipses' `ry` ±1 or rotate the meridians' `rx` 30→24 alternately, 8 s, or simply rotate 360° in 40 s.
- **Steps (band D):** stagger 110 ms. As each step crosses 55 % of the viewport, its number box fills (`background:var(--ink); color:#000`, 300 ms) and stays filled. A one-way "progress" through 01–04.
- **Clock:** page JS updates the minute (`setTimeout` aligned to the next minute) while the intro is on screen. `12-footer.js` only ticks while the footer is visible, so don't reuse `[data-ft-clock]` here.

---

## 6. Sections 5–6: Image 7 (how we think, our promise)

### 6.1 Measurements (canvas 1125 × 2000)

| Element | dpx | Notes |
|---|---|---|
| Grid verticals | x **45** (from y ≈ 380 down), **265.5** (full), **838** (full), **1073.5** (from y ≈ 660 down) | 4.0 / 23.6 / 74.5 / 95.4 %. Reference colour ≈ −9…−13 levels on white → `--who-grid`. |
| Top rule | y **99**, from x 245 → right edge | Under the top labels |
| Top labels | Baseline 97, ascender top 82 → **Geist 400, 22.6 dpx**, tracking −.03 em (fitted −0.08; relaxed), colour `#1c1c1c` → `--ink` | "how we think" x 37 · "our philosophy" x 246 · "tesseract" right-aligned to 1081 |
| Counter | "02 — 03" x 38–117, y 389–404 (cap 15 → **21 dpx**) | → `01 — 03` per spread |
| Rail word | "our approach" x 40–128, y 635–671, 2 lines (21 dpx, lh 1.0) | → link "our / approach" |
| ~~"2023 year"~~ | x 41–135, y 867–886 | **Remove** (invented) |
| Giant heading | Baselines ≈ 617 / 798 / 970 (pitch 178 = **0.77 em**); P cap 166 → **234 dpx**; stem 21.5 → **Geist ≈ 430**; indents x **243 / 291 / 382** (0 / +0.21 em / +0.6 em); widths "People" 669, "Always." 692 (59.5 % / 61.5 % of the canvas) | Fitted tracking −0.048 em ("People") |
| `(people)` / `(experience)` tags | x 43 / 269, y 1083–1096, **13 dpx**, grey `#717171` → `--muted-strong` | Per-spread tags |
| Small abstract | 45–195 × 1127–1282 (151×155) | `who-abstract-03.webp` (149×153) |
| `(01)` | x 46, y 1300–1312, 13 dpx | Index |
| Statement | x 273–677, y 1163–1364, 4 lines, pitch ≈ 55; cap 38 → **Geist 400, 53 dpx, lh 1.04**, tracking −.04 em (fitted −0.077, relaxed) | `--ink` |
| Text columns | x 275–453 and 493–653, y 1449–1548, **17 dpx / 1.3**, tracking −.01 em | `--ink-2` |
| Portrait (not used) | 695–1110 × 1066–1637 (415×571, aspect **0.727**) | Replaced (§6.4) |
| Bottom labels | y 1707–1721: "(understand)" x 47, "(design)" x 497, "(build better)" x 980–1064 (right) — **13 dpx** `--muted-strong` | From `philosophy.title` |
| Quote | x 46–857, y 1825–1887, 2 lines, pitch 33; cap 22.5 → **Geist 400, 31.7 dpx**, tracking −.03 em | `{promise.title}` |

### 6.2 How we think: black-theme layout (desktop 1440)

Use the site container (1344 max) and a 12-column grid with gap 24. The image 7 columns map as follows:

| Column group | Holds | Image 7 x-range |
|---|---|---|
| Rail (cols 1–2) | Labels / counter | 0–265 |
| Main (cols 3–8) | Heading, statement, text | 265–838 |
| Side (cols 9–12) | Visual panel | 838–1110 |

Draw the image 7 hairlines at the column edges (`--who-grid`).

- **Top row:** H2 "how we think" (rail; Geist 400, 22 px, lower case via CSS `text-transform:lowercase`; the DOM keeps "How We Think") · link "our approach" (col 3) · `{brand}` lower case (right). A hairline under it (the y 99 rule).
- **Three spreads**, one per `think` item, stacked. Each spread:
  1. The rail (sticky `top:calc(var(--nav-h) + 24px)` inside the spread) shows the counter `01 — 03` (21 px).
  2. **H3 giant heading** with the staircase indents: line 2 at +.21 em at ≥1200 px, +.1 em at 800–1199, and 0 below 800. With the full indent, "mean complicated." measures 8.19 em, which equals the 720 px container exactly at 800 px.
     - **Uniform size `font-size:min(11vw,168px)`** (158 px at 1440). It must fit "mean complicated." (7.98 em) inside 1344 px; it fits at every width down to 390 (43 px → 343 px).
     - `line-height:.8`, Geist 430, `letter-spacing:-.045em`, `--ink`.
     - Line breaks are fixed with `<br>`: "People / first." · "Details / matter." · "Different doesn't / mean complicated."
     - The reference used 20.7 vw for a 2-word poster title. At 11 vw the three spreads share one scale; that is the deliberate trade-off. Optionally, spread 1 alone can use `min(16vw,230px)`.
  3. Lower grid row (image 7 y 1066–1637), left to right:
     - **(rail)** the tag pair `(people)` + `who-abstract-03` (149 px) + `(01)`
     - **(cols 3–7)** the tag `(experience)`, the statement `think[i][1]` (53 px → `clamp(30px,3.7vw,53px)`), and below it a single text column `think[i][2]` (17 px, max 34 ch, at the image's right-column x)
     - **(cols 8–12)** the visual panel (§6.4)
- **Spacing:**

  | Gap | dpx | CSS at 1440 |
  |---|---|---|
  | Heading baseline → lower row | 970 → 1066 | ≈ 0.42 em of the heading |
  | Statement → columns | 1364 → 1449 | ≈ 85 dpx → 80 px |
  | Spread → spread | — | 160 px, with a hairline |

### 6.3 Text column note

Image 7 shows two small columns. The document gives two lines per item, and the first is already the large statement, so **render one small column** (the second line) in the image's **right** column position (x 493). The empty left column keeps the air of the reference. Do not repeat text to fill it.

### 6.4 Replacement for the portrait (non-person visual, 0.727 aspect)

Recommended: **one brand-light panel per spread**, built in CSS (resolution-independent, no stock people). A `#0b0b0b` panel with 1 px `--who-line` and a soft light field:

| Spread | Light field |
|---|---|
| 01 | `radial-gradient(60% 50% at 70% 30%, rgba(255,118,46,.35), transparent 70%)`, the hero's orange |
| 02 | Off-white `rgba(244,244,242,.18)` at 30 % / 70 % |
| 03 | Red `rgba(251,38,41,.28)` |

Every spread also gets the **3D brand mark** (`assets/brand/logo-mark-3d.webp`, 515×519, displayed ≤ 520 px) centred with a slow `rotate(±4deg)` scroll link. The caption under the panel uses the tag pair.

Alternatives (client choice):

- **(a) ZIP project imagery** (`home-0x`, up to 3840 px): real work. Fits "Details matter." best, as a UI close-up crop. Do **not** caption it as a client result.
- **(b)** `who-rock.webp` again: not recommended (already used above).
- **(c)** The image 5 screen's blurred figure: not recommended (still a person).

### 6.5 Our promise (image 7 bottom)

- Bottom labels row: `(understand)` left · `(design)` centre (col 6) · `(build better)` right. 13–14 px `--muted-strong`, with a hairline above. The rail label `our promise` goes at the far left above the quote.
- **H2 quote:** Geist 400, `clamp(24px, 2.8vw, 40px)` (≈ 31.7 dpx × 1.28), lh 1.06, tracking −.03 em, `--ink`, max-width 860 px, 2–3 lines. `{` and `}` are `::before` / `::after` in `--muted-strong` (no text duplication).
- `promise.lines`: 18 px `--ink-2`, stacked, stagger 90 ms. `promise.question`: 24–28 px `--ink`, italic or `<em>`, with the red underline SVG draw (`stroke:var(--red)`, `pathLength=1`, dashoffset 1→0, 900 ms, delay 420 ms). It is the section's single red accent.

### 6.6 Motion (image 7)

- The top labels and rule slide in (rule `scaleX`, labels fade, 60 ms stagger).
- **Giant heading:** `data-split` word rise per spread, with the line staircase entering from slightly larger indents (`--x` +0.1 em → final, 900 ms `--ease`). The counter digits roll (the `roll` pattern) when a spread becomes active (IO at 50 %).
- **Visual panel:** `.reveal-image`-style scale 1.06→1 + fade. The light field drifts ±6 % with the pointer, and the 3D mark rotates with scroll.
- The rail stays sticky inside each spread. The counter updates `01 → 02 → 03` (aria-hidden; the H3 carries the meaning).
- **Promise:** the braces draw first (opacity + `translateX(∓8px)`), then the H2 word rise, then the lines, then the question and its underline draw.
- **Optional desktop upgrade:** pin the three spreads (`position:sticky` stage, 300 vh) and cross-fade between them. Only do this if it keeps all three spreads' text in the DOM, visible without JS, and stacked under reduced motion. The stacked version is the baseline.

---

## 7. SEO / GEO

- `<title>`: "Who We Are — {brand_full}" (existing). Meta description = `hero.body[0]` (existing in `build.py`).
- One H1 (`hero.title`) plus the H2/H3 outline in §2. The definition sentence (`hero.body[0]`) directly follows the H1 in the DOM. All copy is real text; nothing is baked into images.
- **Images:** every photo and cut-out on this page is decorative or illustrative stock, so all get `alt=""` (with `role` omitted). Do not write alt text such as "our studio" or "our team"; that would be an invented claim. The 3D brand mark in §6.4 is decorative too (`alt=""`; the brand is named in the text).
- **Structured data:** JSON-LD `AboutPage` with `mainEntity` `Organization`. It may sit inline in the page body (valid), or in `<head>` if a shared helper is added (see the shared requests).

  ```json
  {"@context":"https://schema.org","@type":"AboutPage","name":"Who We Are",
   "description":"{brand} is a digital creative studio focused on design, technology and experiences.",
   "mainEntity":{"@type":"Organization","name":"{brand}","alternateName":"{brand_full}",
     "description":"{brand} is a digital creative studio focused on design, technology and experiences.",
     "slogan":"Build beyond the ordinary.",
     "knowsAbout":["Website design","Website development","E-commerce","Interactive & 3D","Brand & digital identity","Product & SaaS","AI & automation","Digital strategy"]}}
  ```

  - `knowsAbout` = the `CREATE` service names.
  - Add `url` only when `site_url` is set.
  - **Do not add** address, founding date, employees, `areaServed` or `sameAs`. None of them is supplied, and the social URLs are empty.
- **Internal links:** "Our approach" → `/our-approach/` (twice: the philosophy footer and the image 7 rail). "Explore our work" → `/work/` (optional). The footer CTA → `/contact/`.

---

## 8. Responsive plan (all sections)

| Section | 1440 (desktop) | 834 (tablet) | 390 (phone) |
|---|---|---|---|
| Hero | §4.4: aw-linked artboard, display one line 16.3 % aw | Artboard 130 %, display 16.3 vw | Artboard 175 %, display 2 lines `min(27vw,112px)` |
| Intro A+B | Absolute artboard (`--u6`), the exact dpx boxes in §5.2; grid lines and leaders visible | **Flow layout.** Top row (tag + time) as a flex row. H1 `font-size:8.6vw` (72 px), 3 lines. body[0] under the H1 (18 px). The rock is centred at 72 % width (600 px max → 1.04×) with the glass tile. Below it a **2-column grid** of the three notes/boxes (WHO box, body[2] note, /01 box), each with a short 40 px leader stub to a node. The tagline note goes under the rock. Grid: only the centre vertical + band lines. | Stacked: tag row → H1 `11vw` (43 px; "WITH BIG IDEAS." 7.22 em = 310 px) → body[0] 17 px → rock 100 % (≤ 420 px) → WHO box (thumb 72 px) → body[2] note → /01 box → tagline. Leaders, nodes, globe and "+" are hidden; one hairline between groups. Time row stays (13 px). |
| Why (C) | Absolute artboard per §5.3 | /02 box (full width, max 520) → H2 → statement `clamp(34px,5.6vw,52px)` full width → answer/body 2 columns → collage below: dial 120 % width (clipped `overflow:hidden`), hand at left 46 % width, laptop 40 % overlapping the pinky, collab box at the right | /02 box → statement `8.6vw` (34 px; boxes `padding:0 .06em`; icons .6 em) → answer → body → collab box → collage (dial 150 % clipped, hand 70 % width ≤ 306 px = 1.0×, laptop 62 % ≤ 255 px) → sphere hidden |
| Philosophy (D) | Absolute: box left, steps right | Box (image 197 px + panel side by side, 520 px) → steps full width (number boxes 48 px, text 20 px) → link | Image (197 px, 1.0×, left) over the panel (full width, mono 16 px) → steps (44 px boxes, 17 px text) → link |
| Think | §6.2 rail + main + side grid | Rail becomes a top row (counter inline). Heading `11vw` (92 px). Lower row: statement + column (cols 1–7), panel (cols 8–12, aspect 0.727) | Rail labels inline (13 px). Heading `11vw` (43 px), staircase indent 0. The tag pair + abstract (100 px, 0.67×) go inline before the statement. Statement 28 px, column 16 px, panel full width at aspect **4:5** (not 0.727, to save height). |
| Promise | Labels row (3 positions), quote 40 px max 860 | Labels row, quote 30 px | Labels wrap inline (·-separated), quote 24 px, lines 17 px, question 22 px |

**General:**

- No horizontal scroll: clip the dial, the light and the rock overflow inside their sections (`overflow-x:clip`).
- The 16 px gutter on phones comes from `--page-pad`.
- Tap targets ≥ 44 px for links.
- All decorative SVG/IMG are `aria-hidden` / `alt=""`.

---

## 9. Implementation checklist (for the WHO page owner)

| Owner file | Contents |
|---|---|
| `scripts/pages/who.py` | The section renderers in §2 order. Keep the helpers that `contact.py` / `legal.py` import (`page_hero`, `head`, `DOTS`, `SEAL`, `flat_mark`, `mark3d`, `GLYPHS`). |
| `src/css/30-who.css` | Tokens in §3. Keep the `.pg-*` shared rules other pages use. |
| new `src/js/30-who.js` | Hero layers / tilt / scroll, the dial, steps progress, the clock, leader-line draw, the glass tile. |

- Assets via `lib.img(ctx, 'assets/who/…', '', w=…, h=…)`. Put explicit width/height (the px in §1.1) on every `<img>`. The SVG icons go through `lib.svg_inline('assets/who/who-….svg', cls)`.
- Everything is transform/opacity only, rAF-throttled, paused off-screen (IntersectionObserver), and disabled under `TS.reduced()` / without `html.motion`.
- Content: every string comes from `content.WHO` (plus `BRAND['tagline']`, `CREATE` service names for JSON-LD) through `fmt()`. Nothing else, except the §2.2 micro-labels.
