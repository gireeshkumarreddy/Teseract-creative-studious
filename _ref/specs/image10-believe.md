# Image 10 — "What we believe" (HOME section 4, replaces the coverflow carousel)

Source: `WD/_ref/images/10.webp`, **1436 × 2000 px**, flat white page (`#FFFFFF` / `#FEFEFE`, no gradient or noise).
Destination: HOME section 4 on the **black theme** (DARK-THEME.md). Copy comes from `scripts/content.py` (`HOME.believe`, `HOME.numbers`). The image's invented paragraphs are **not** used (see §7).
All coordinates below are **image px**. `%W` = ÷ 1436. The content box runs from **x 36.8 to 1397.9** (width **1361.1 px = 94.78 %W**, margins 36.8 / 38.1 px = 2.56 / 2.65 %W). `%C` = % of that 1361 px content box. In CSS, `%C` maps directly to `cqi` on a `container-type:inline-size` element that has the site `.container` content width (1344 px at 1440, scale 0.9875).
Measured ink boxes use a 50 % (half-max) edge, with sub-pixel values where it matters. Regenerate everything with the scripts in §13.
Validation prototype (black theme, Geist, real crops, not site code): `WD/_work/spec10/proto.html`. Screenshots are in `WD/_work/spec10/proto-{1440,1280,1024,834,800,390}.png`.

---

## 0. Summary

| Item | Value |
|---|---|
| Composition | Label row → 2-line uppercase headline → 6-photo editorial strip with captions and two corner captions → full-width hairline → "01" + 4-line uppercase statement (black lead + grey continuation, 2 italic phrases) → left side label + 2 text columns → red rule bleeding off the left edge |
| Typeface look | Neo-grotesk (Helvetica-Neue-like), uppercase display with tight tracking. All display styles share one weight (stem/cap 0.101–0.105), i.e. **Light-Regular**. Geist (project font) is about 12–15 % wider, so the recommended sizes sit about 5 % under the measured caps with lighter tracking (§5) |
| Colours (ref) | ink `#000`; grey statement `#7E7E7E`–`#838383`; captions `#5A5A5A`; corner captions `#B9B9B9`; body `#2E2E2E`–`#363636`; red dots `#F73E48`–`#F9484F`; red rule core `#DB434E`; divider ≈ 1 px `#C8C8C8` |
| Black-theme mapping | §6. Ink `--ink`, grey continuation `rgba(244,244,242,.5)` (4.89:1), captions and body `--ink-2` (10.2:1), corner, side and stat labels `--muted-strong` (7.2:1), dots `--red-dot`, rule `--red`, divider `--line-3` |
| Photos | **Superseded 18 Oct:** the strip now shows the owner's six AI-generated images (home_believe.PHOTOS, `<stem>-<w>.webp` with srcset/sizes; DARK-THEME.md 18 Oct believe entries). The crops below were deleted. Originally: 6 rectangular crops in `teseract-website/public/assets/believe/` (§3.2), all 148–315 px wide. They display at **≤ 1.23×** native size at every tested width |
| Breakpoints (section-local) | **≥ 1024**: poster artboard (absolute % placement, faithful). **800–1023.98**: 12-col two-band strip. **≤ 799.98**: 2-col stacked flow. This matches the project's 1023.98 / 799.98 presets |

---

## 1. Canvas, grid and alignment lines

| Line | x (px) | %W | %C | Used by |
|---|---|---|---|---|
| Content left | 36.8–37 | 2.56 | 0 | dots, glass photo, captions, corner caption L, divider, side label, red-rule-free edge |
| Label text / "01" text | 68 / 69 | 4.74 / 4.81 | 2.28 / 2.35 | after the 18.5 px dot + 13 px gap |
| Headline ink left | 61 (S) / 64 (P) | 4.25 / 4.46 | 1.8 / 2.0 | optical indent of the big type. The headline box itself starts ≈ 52 px. **Recommendation:** keep the H2 flush with the content edge; the 24 px indent is a generator artefact and would push line 2 past the container |
| Hood photo / its caption | 352.1 | 24.52 | 23.17 | |
| Statement + left column | 369–371 | 25.77 | **24.39** | text grid column 2 |
| Right column | 901 | 62.74 | **63.48** | text grid column 3 |
| Red rule end | 909.5 | 63.34 | 64.1 | ≈ right-column start + 8 px |
| Content right | 1397.9 | 97.35 | 100 | headset photo, corner caption R, divider end |

Text grid: **24.39 % | 39.09 % | 36.52 %** of the content box (332 | 532 | 497 px). The measure inside column 2 is 440 px (32.3 %C, max line ink 370→809). Column 3 ink runs 901→1375 (474 px).

---

## 2. Element boxes (ink, image px)

| # | Element | x0–x1 | %W | y0–y1 (cap-top → baseline) | Notes |
|---|---|---|---|---|---|
| 1 | Red dot (label) | 37–55 (Ø 18.5) | 2.58–3.83 | 87–105, centre y 96 | Vertically centred on the label cap height. Colour core `#F9484F` |
| 2 | Label "WHAT WE BELIEVE" | 68–264 (w 197) | 4.74–18.45 | 86.7 → 105.3 (cap 18.6) | ink `#2D2D2D`. Dot→text gap 13 px |
| 3 | Headline L1 "SIMPLE FOR PEOPLE." | 61–1153 (w 1093) | 4.25–80.36 | 150.4 → 243.3 (cap **92.5**) | `#000`, stems 9–10 px |
| 4 | Headline L2 "POWERFUL FOR BUSINESS." | 64–1386 (w 1323) | 4.46–96.59 | 271.0 → 359.7 (cap **88.6**) | L1 is set about 4 % larger than L2 (generator inconsistency); treat both as one size |
| 5 | Photo strip (6 photos + captions) | 36.8–1397.9 | 2.56–97.35 | photos 429.5–830.8, caption rows to 871.1 | §3 |
| 6 | Divider hairline | 37–1397 | 2.58–97.35 | y 957–960, centre **958.4** | ≈ 1 px `#C8C8C8` (rows 957/958/959/960 = `#E9E9E9 / #D2D2D2 / #D9D9D9 / #F5F5F5`) |
| 7 | Red dot ("01") | 37–55 (Ø 18.7) | 2.58–3.83 | 1041–1059, centre y 1050 | core `#F73E48` |
| 8 | "01" | 69–88 | 4.81–6.13 | 1041.7 → 1059.9 (cap 18.0) | `#353535`. Its cap-top sits 4.8 px above the statement cap-top |
| 9 | Statement L1 "A WEBSITE SHOULD NOT MAKE" | 370–1210 | 25.77–84.33 | 1046.5 → 1091.1 (cap **44.5**) | `#000` |
| 10 | Statement L2 "PEOPLE THINK TOO HARD. IT SHOULD" | 373–1384 | 25.97–96.45 | 1117.4 → 1161.6 | black up to "HARD.", grey from "IT SHOULD" |
| 11 | Statement L3 "BE EASY TO UNDERSTAND, *EASY TO*" | 374–1334 | 26.04–92.97 | 1187.7 → 1232.4 | grey `#7E7E7E`–`#838383`; "EASY TO" italic |
| 12 | Statement L4 "EXPLORE AND EASY TO *REMEMBER.*" | 374–1329 | 26.04–92.62 | 1257.8 → 1302.3 | "REMEMBER." italic. Line pitch **70.4 px**. Italic slant measured **≈ 8°** (stems shift 2.5–4.5 px over 28 px) |
| 13 | Side label "TESSERACT / CREATIVE STUDIOS / PHILOSOPHY" | 37–224 | 2.58–15.67 | cap-tops 1526.6 / 1551.3 / 1576.5 (pitch 25, cap 17) | `#3F3F3F`. Cap-top aligns with the left column's **2nd paragraph** first line (asc 1530) |
| 14 | Left column (3 ¶: 3 / 3 / 5 lines) | 370–809 | 25.77–56.41 | first asc-top 1382.5, x-top 1388, baseline 1403.5; last baseline ≈ 1836 | x-height **14.6**, line pitch **35.2**, ¶ gap +41.6 px. `#2E2E2E`–`#353535` |
| 15 | Right column (3 ¶: 4 / 4 / 4 lines) | 901–1375 | 62.74–95.82 | first top 1380 (2 px above the left column; treat as aligned); last baseline ≈ 1864 | ¶ gaps +34 / +41 px (inconsistent; use ≈ 1.45 em) |
| 16 | Red rule | **0**–909.5 (bleeds off the left page edge) | 0–63.34 | y 1923–1928, centre **1925.5**, ≈ 4.5–5 px | core `#DB434E` (compressed brand red) |

### Vertical rhythm (px at 1436, ≈ px at 1440)

| From → to | px |
|---|---|
| page top → label cap-top | 86.7 |
| label baseline → headline cap-top | 45.1 |
| headline cap-top pitch / baseline pitch | 120.6 / 116.4 |
| headline L2 baseline → strip top | 69.8 |
| photo bottom → its caption cap-top | 8.5–9.2 |
| strip photos (top → bottom) | 429.5 → 830.8 = **401.2** (= hood height) |
| caption row 2 baseline (corner captions) → divider | 87.3 (photo bottom → divider 127.7) |
| divider → statement cap-top | 88.1 (→ "01" cap-top 83.3) |
| statement last baseline → columns first ascender | 80.2 (baseline → baseline 101.2) |
| columns last baseline → red rule centre | 61.5 |
| red rule → page bottom | 74.5 |

---

## 3. The editorial strip

### 3.1 Positions (artboard = content box 1361.1 × 401.2, top at y 429.5)

| # | Photo | x0–x1 (px) | w × h (px) | %W (x0 / w) | Artboard `--x / --y / --w / --h` (% of 1361.1 × 401.2) | Caption in image (ink) |
|---|---|---|---|---|---|---|
| 1 | Orange glass discs | 36.8–187.8 | 151.0 × 159.2 | 2.56 / 10.52 | **0 / 0 / 11.09 / 39.68** | "INTUITIVE EXPERIENCES" x 37–174, cap-top 597.3 |
| 2 | Grey rock (B&W) | 193.8–345.3 | 151.5 × 159.5 | 13.50 / 10.55 | **11.53 / 0 / 11.13 / 39.76** | "THOUGHTFUL DESIGN" x 194–321, cap-top 597.3 |
| 3 | Hooded figure, orange goggles | 352.1–671.2 | 319.1 × 401.0 | 24.52 / 22.22 | **23.17 / 0 / 23.44 / 100** | "PEOPLE FIRST APPROACH" x 352–505, cap-top 839.9 |
| 4 | White knot sculpture | 682.3–853.8 | 171.5 × 183.4 | 47.51 / 11.94 | **47.42 / 54.29 / 12.60 / 45.71** | "CLEAN INTERFACES" x 682–798, cap-top 839.9 |
| 5 | Glass slab, yellow gradient + mesh | 860.6–1032.5 | 171.9 × 183.6 | 59.93 / 11.97 | **60.52 / 54.29 / 12.63 / 45.71** | "MEANINGFUL TECHNOLOGY" x 862–1026, cap-top 839.9 |
| 6 | Silhouette with VR headset | 1181.9–1397.9 | 216.0 × 216.1 | 82.31 / 15.04 | **84.13 / 0 / 15.87 / 53.86** | "IDEAS THAT CREATE IMPACT" x 1183–1345, cap-top 654.3 |
| – | Corner caption L (2 lines, grey) | 37–214 | – | 2.58 / 12.4 | left 0, same row as captions 3–5 | "CREATIVE SOLUTIONS / FOR MODERN BUSINESSES", cap-tops 839.7 / 858.4 |
| – | Corner caption R (2 lines, grey, right-aligned) | 1220–1398 | – | 84.96 / 12.4 | right 0, same row | "DIGITAL EXPERIENCES / THAT MAKE A DIFFERENCE" |

- **Gutters:** 1→2 6.0, 2→3 6.8, 3→4 11.1, 4→5 6.8, 5→6 149.4 px (the empty bay before the headset is intentional air).
- **Alignment:** photos 1, 2, 3 and 6 are **top-aligned** (y 429.5). Photos 3, 4 and 5 are **bottom-aligned** (y 830.7). The tops of photos 4 and 5 (647.3) sit 1.7 px below the headset's bottom (645.6), so they read as one stair-step line.
- **Pairs:** photos 1 and 2 share one size (≈ 0.95 ratio). Photos 4 and 5 share one size (≈ 0.935). Photo 3 is ≈ 4:5 (0.796). Photo 6 is square.
- **Caption rows:** caption cap-top is 8.5–9.2 px under its photo. All captions are single-line, left-aligned to the photo's left edge, and never wider than the photo.

### 3.2 Extracted crops → `teseract-website/public/assets/believe/` (WebP q90, method 6)

**Superseded 18 Oct:** the strip now shows the owner's six AI-generated images (home_believe.PHOTOS, `<stem>-<w>.webp` with srcset/sizes; DARK-THEME.md 18 Oct believe entries). The crops below were deleted.

Edges were trimmed **inside** the half-max boundary: only pixels with ≥ 90 % coverage are kept. Any edge row or column still ≥ 4 levels lighter than its inner neighbour was then dropped (no white fringe on black). Paired photos were centre-trimmed to one common size. Ring check (outer 1 px ring vs. 2 px inside, + = lighter): −2.3 / −12.1 / −4.1 / −2.6 / −0.8 / −0.6, so no light fringe on any crop. The stone's −12 is a dark edge, which is invisible on black.

| File | Source box `[x0,y0,x1,y1)` | Pixel size | Ratio | Bytes | Max display (1.25×) |
|---|---|---|---|---|---|
| `believe-01-glass.webp` | 38, 432, 186, 587 | **148 × 155** | 148/155 | 2 930 | 185 × 194 |
| `believe-02-stone.webp` | 196, 432, 344, 587 | **148 × 155** | 148/155 | 4 990 | 185 × 194 |
| `believe-03-hood.webp` | 355, 432, 670, 829 | **315 × 397** | 315/397 | 4 492 | 394 × 496 |
| `believe-04-knot.webp` | 685, 649, 852, 829 | **167 × 180** | 167/180 | 1 782 | 209 × 225 |
| `believe-05-prism.webp` | 863, 649, 1030, 829 | **167 × 180** | 167/180 | 1 906 | 209 × 225 |
| `believe-06-headset.webp` | 1184, 432, 1396, 644 | **212 × 212** | 1/1 | 4 152 | 265 × 265 |

- These are **not** in `asset-manifest.json`. Render them with `lib.img(ctx, 'assets/believe/<file>', alt, w=<w>, h=<h>, cls=...)`, which gives one resolution with no srcset. Put the tile's aspect ratio on the wrapper and use `object-fit: cover` (the pair crops are 1 px off their tile ratio).
- Display scales in the prototype were 1440: 1.00–1.01, 1280: 0.90, 1024: 0.71, 834: ≤ 1.23, 800: ≤ 1.18, 390: ≤ 1.18. All are within the ≤ 1.25 rule. On 2× screens they upsample about 2–2.5× and will look soft: **flag to the client and request the original photos.**
- Light photos on black get the DARK-THEME frame: `box-shadow: inset 0 0 0 1px rgba(255,255,255,.06)` on an `::after` over the image, with a `#0d0d0d` placeholder background.

---

## 4. Statement detail

- Copy is **exactly `HOME.believe.body[0]`**: "A website should not make people think too hard. It should be easy to understand, easy to explore and easy to remember."
- Two-tone split at the first sentence end. Sentence 1 is ink (black → `--ink`). Sentence 2 is grey (`#7E7E7E` → `rgba(244,244,242,.5)`).
- Italics in the image: the **second "easy to"** (end of L3) and **"remember."** (L4). "explore" is upright. Reproduce exactly that.
  - **Gotcha:** Geist has no italic. Chrome's synthetic `font-style: italic` slants **14°**. `font-style: oblique 8deg` renders **upright** (measured 0°) because Geist has no `slnt` axis. Use `<i>` with `font-style:normal; display:inline-block; transform:skewX(-8deg); white-space:nowrap`. That measures 7.7°, matching the reference's ≈ 8°.
- Line breaks fall naturally at 4.6cqi in a column 75.6 %C wide: "A WEBSITE SHOULD NOT MAKE / PEOPLE THINK TOO HARD. IT SHOULD / BE EASY TO UNDERSTAND, EASY TO / EXPLORE AND EASY TO REMEMBER." This is identical to the image (verified at 1440 and 1280).
- Write **`It&nbsp;should`**. Without it, the tablet width leaves a lone grey "IT" at the end of the black line 2 (verified at 834).

---

## 5. Typography

Geist metrics (from the font file): UPM 1000, cap **0.710**, x-height **0.530**, ascender 1.005, descender 0.295. Ascender = cap height.
Geist stem / cap by weight (measured, 200 px "I"): 250 → 0.085, 300 → 0.092, **350 → 0.106**, 400 → 0.120, 450 → 0.134, 500 → 0.155.

### 5.1 Measured and fitted (Geist, canvas ink fit: font-size from the cap or x-height, tracking solved from the ink width)

| Style | Ref cap (or x) | Stem → weight | Geist size that matches the cap | Tracking needed to match the width @350 | Ref line pitch |
|---|---|---|---|---|---|
| Label "WHAT WE BELIEVE" | 18.6 | 2.0 px (0.107) → ~350 | 26.3 px (1.83 %W) | −0.076 em | – |
| Headline | 92.5 / 88.6 (avg 90.5) | 9.2–9.5 px (0.102) → **~340** | 130.3 / 124.8 (avg 127.5 = 8.88 %W) | −0.086 / **−0.10 em** | 118.5 (≈ 0.93) |
| Photo captions | 11.4 | 1.4–1.5 px (0.13) → ~450 | 16.1 px | −0.11…−0.14 em | – |
| Corner captions | 12.3 | ~1.5 px → ~400 | 17.5 px | −0.08…−0.13 em | 18.7 (1.07) |
| "01" | 18.0 | – | 25.4 px | – | – |
| Statement | 44.5 | 4.5 px (0.101) → **~340** | 62.7 px (4.37 %W, 4.61 %C) | −0.041 / −0.037 em | 70.4 (1.123) |
| Side label | 17.0 | 2.1–2.2 px (0.126) → ~420 | 23.9 px | −0.067…−0.078 em | 25 (1.05) |
| Body columns | x 14.6 | ~2.0 px → ~350 | 27.5 px (x-match) | −0.033…−0.064 em (avg −0.045) | 35.2 (1.28) |

**Why the recommendations deviate:** the reference face is narrower than Geist. Matching cap and width together needs −0.10 em on the headline, and a specimen test showed that makes "LE." and "SS." collide. At −0.08 em with a ≈ 6 % smaller size, the headline still spans 48→1375 px at 1440 (ref ink width 1323 → prototype 1327), with clean counters. Display weights drop about 20 units on black (light-on-dark irradiation). Small-text tracking is relaxed for legibility.

### 5.2 Recommended (black theme; `cqi` on the section's inner `.container`, so 1 cqi = 13.44 px at ≥ 1440)

| Style | font-size | weight | line-height | letter-spacing | case | colour |
|---|---|---|---|---|---|---|
| Label (eyebrow, `<p>`) | `clamp(13px, 1.76cqi, 24px)` | 400 | 1 | −0.04em | uppercase | `--ink` |
| Red dot | `.74em` square, `border-radius:50%`, gap `.54em` | – | – | – | – | `--red-dot` + `box-shadow:0 0 .6em rgba(255,59,59,.35)` |
| **H2** | `8.93cqi` (= 120 px @1344; 67 px @834). Phone `15.2cqi` (54 px @358) | **320** | .95 (phone .94) | −0.08em (phone −0.07em) | uppercase (CSS) | `--ink` |
| Photo captions (`figcaption`) | `clamp(11px, .93cqi, 12.5px)`; tablet 12, phone 11 | 470 | 1.2 | −0.015em | uppercase | `--ink-2` |
| Corner captions | `clamp(11px, 1.04cqi, 14px)`; tablet 12, phone 11 | 400 | 1.25 | −0.015em | uppercase | `--muted-strong` |
| "01" index | as label | 400 | 1 | −0.02em | – | `--ink` |
| Statement | `4.6cqi` (61.8 px @1344); tablet `5.6cqi`; phone `clamp(26px, 8.2cqi, 34px)` | 330 | 1.13 (phone 1.1) | −0.04em (phone −0.035em) | uppercase | lead `--ink`, continuation `rgba(244,244,242,.5)` |
| Side label | `clamp(12px, 1.47cqi, 20px)`; tablet 13, phone 12 | 420 | 1.08 | −0.03em | uppercase | `--muted-strong` |
| Body columns | `clamp(17px, 1.9cqi, 26px)`; tablet 18, phone 17 | 350 | 1.32 (phone 1.45) | −0.025em | sentence | `--ink-2`; emphasis sentence `--ink` |
| "Our numbers" H3 (micro) | as captions | 470 | 1.2 | −0.015em | uppercase | `--muted-strong` |
| Stat values | `4cqi` (54 px @1344); tablet 44, phone 34 | 320 | 1 | −0.06em | as written ("20K+", "400K+", "Millions", "Global") | `--ink` |
| Stat labels (`dt`) | as captions | 470 | 1.2 | −0.015em | uppercase | `--muted-strong` |
| Text link "Read how we think" | as captions | 500 | 1.2 | −0.015em | uppercase | `--ink`, red 1 px underline grows on hover |

Stat values keep their doc casing. In uppercase at 4cqi, "MILLIONS" overflows the 4-across cell at 1024–1280.

### 5.3 Spacing in CSS (Geist half-leading maths)

For Geist, the distance from the line box top to the cap-top equals the distance from the last baseline to the box bottom: **k = (lh/2 − 0.355) × font-size**. Margins = reference gap − k(above) − k(below), scaled to the recommended sizes:

| Gap | Ref | Desktop CSS (prototype) |
|---|---|---|
| label → H2 | 45.1 baseline→cap | `margin-top: 28px` on H2 (tablet 28, phone 20) |
| H2 → strip | 69.8 baseline→photo | `margin-top: 56px` (tablet 48, phone 40) |
| photo → caption | 8.5–9.2 photo→cap-top | caption `margin-top: 6px` |
| photos bottom → divider | 127.7 | `margin-top: 128px` on the divider (tablet 88, phone 64) |
| divider → statement | 88.1 | grid `margin-top: 75px` (tablet 64, phone 40). "01" `margin-top: -4px` (sits 4.8 px higher) |
| statement → columns | 80.2 (to ascender) | columns `margin-top: 60px` (tablet 56, phone 20). Side label `64px` (cap-top aligned with col-L line 1) |
| columns → stats | – | stats `margin-top: 72px` (tablet 56, phone 40) |
| last text → red rule | 61.5 | rule `margin-top: 60px` (phone 56) |
| red rule → section end | 74.5 | 74 px (phone 56); next section adds its own padding |
| section top | 86.7 to cap | `padding-top: 120px` (`.section`, then 104 / 72) |

---

## 6. Colour (white reference → black theme) and WCAG contrast

| Element | Ref colour (contrast on white) | Black-theme token | Contrast on `#000` (on `#0d0d0d`) |
|---|---|---|---|
| Page | `#FFF` / `#FEFEFE` | `--bg #000` | – |
| Label, "01", H2, statement lead, body emphasis, stat values, link | `#000`–`#2D2D2D` | `--ink #F4F4F2` | **19.07:1** (17.65) |
| Statement continuation | `#7E7E7E` (4.06:1) | `rgba(244,244,242,.5)` → `#7A7A79` | **4.89:1** (4.95). Large text, and AA even as normal text |
| Body columns | `#303030` (13.2:1) | `--ink-2` (.74) → `#B5B5B3` | **10.18:1** (9.78) |
| Photo captions | `#5A5A5A` (6.90:1) | `--ink-2` | **10.18:1** |
| Corner captions (lighter tier) | `#B9B9B9` (1.96:1, decorative on white) | `--muted-strong` (.62) → `#979796` | **7.21:1**. Keeps the lighter tier while staying informational-AA (never `--muted`) |
| Side label, "Our numbers", stat labels | `#3F3F3F` (10.5:1) | `--muted-strong` | **7.21:1** |
| Red dots (decorative status dots) | `#F73E48`–`#F9484F` | `--red-dot #FF3B3B` + soft glow ≤ .35 α | 5.94:1 |
| Red rule (the section's one red rule) | `#DB434E`, 4.5–5 px | `--red #FB2629`, 4 px | 5.41:1 |
| Divider | ≈ 1 px `#C8C8C8` | `--line-3 rgba(255,255,255,.16)` 1 px | – |
| Stat top rules (new) | – | `--line-3` 1 px | – |
| Photo frame (new, DARK-THEME rule) | – | inset 1 px `rgba(255,255,255,.06)` + `#0d0d0d` fill | – |

Contrast is computed (WCAG 2.x relative luminance) for each alpha composited on `#000` and `#0d0d0d`. The only red elements are two status dots and one rule, as DARK-THEME allows: no red text and no red areas.

---

## 7. Content mapping (document copy only)

| Image text | Rendered as | Source |
|---|---|---|
| WHAT WE BELIEVE | eyebrow `<p>` "What we believe" (CSS uppercase) | `HOME.believe.label` |
| SIMPLE FOR PEOPLE. POWERFUL FOR BUSINESS. | **H2** `#believe-title`, sentence case in the HTML, uppercase via CSS, one `<span>` per sentence (`display:block`) | `HOME.believe.title`, identical |
| A WEBSITE SHOULD NOT MAKE PEOPLE THINK TOO HARD. IT SHOULD BE EASY TO UNDERSTAND, EASY TO EXPLORE AND EASY TO REMEMBER. | Statement: **H3** (sentence 1) + `<p>` (sentence 2), both `display:inline` | `HOME.believe.body[0]`, identical |
| Left column ¶1 "Behind every beautiful experience, there should be a clear purpose. We make complex things feel simple." | left column `<p>`, with "We make complex things feel simple." in `--ink` (echoes the statement's two tones) | `HOME.believe.body[1]` + `body[2]`, identical |
| Left ¶2 "We believe good design is not just about how it looks…" | **dropped** (invented) | – |
| Left ¶3 "A great website should feel natural, intuitive and human…" | **dropped** (invented) | – |
| Right ¶1 "We combine strategy, design and technology … built around real business goals." | **dropped** (invented paraphrase) | – |
| Right ¶2 "When websites are easy for people, they perform better … more engagement, stronger connections and real growth." | **dropped** (results claims, banned by DARK-THEME) | – |
| Right ¶3 "Simple experiences lead to happier users, stronger brands and bigger opportunities…" | **dropped** (invented claims) | – |
| *(new)* | right column: **H3** "Our numbers" + `<p>` + `<dl>` of 4 stats (row below both columns) | `HOME.numbers.label`, `.body`, `.items` (20K+ Community · 400K+ Reach · Millions Views Generated · Global Clients & Projects) |
| TESSERACT CREATIVE STUDIOS PHILOSOPHY | side label `<p>` "TESERACT / Creative Studios / Philosophy" from `CONFIG['brand_full']`, never hard-coded | micro-label (§8) |
| 01 | decorative index, `aria-hidden="true"` | – |
| 6 photo captions + 2 corner captions | micro-labels (§8) | – |

The doc's numbers are used verbatim. "Global" comes from the document, not from the image's banned "global mindset".

---

## 8. Proposed micro-labels (for client approval)

Each one is a pure descriptor that restates document wording. The image's own wording is listed for comparison, with the reason for any change.

| Where | Image says | Proposed | Restates (content.py) |
|---|---|---|---|
| Photo 1, glass | INTUITIVE EXPERIENCES | **Intuitive experiences** | `CREATE.services[0].body` "feel intuitive" + "digital experiences" (alt: "Easy to understand", `HOME.believe.body[0]`) |
| Photo 2, stone | THOUGHTFUL DESIGN | **Thoughtful design** | `HOME.hero.lead` "thoughtful … digital experiences" (DARK-THEME example) |
| Photo 3, hood | PEOPLE FIRST APPROACH | **People first** | `WHO.think[0]` "People first." ("approach" dropped) |
| Photo 4, knot | CLEAN INTERFACES | **Complex made simple** | `HOME.believe.body[2]` "We make complex things feel simple." ("clean" is not doc wording) |
| Photo 5, prism | MEANINGFUL TECHNOLOGY | **Purposeful technology** | `HOME.agency.closing` "technology that serves a purpose" (alt: "Technology with a purpose") |
| Photo 6, headset | IDEAS THAT CREATE IMPACT | **The right idea** | `WHO.philosophy.steps[2]` "Then we find the right idea." ("create impact" is a results claim, so it is dropped) |
| Corner, left | CREATIVE SOLUTIONS FOR MODERN BUSINESSES | **Digital experiences / built around your business** | `CREATE.hero.title`, verbatim |
| Corner, right | DIGITAL EXPERIENCES THAT MAKE A DIFFERENCE | **Build beyond / the ordinary** | `BRAND.tagline` = `CONFIG.tagline`, verbatim |
| Side label | TESSERACT CREATIVE STUDIOS PHILOSOPHY | **TESERACT / Creative Studios / Philosophy** | `CONFIG.brand_full` + `WHO.philosophy.label` "Our Philosophy" |
| Numbers heading | – | **Our numbers** | `HOME.numbers.label`, verbatim |
| Link | – | **Read how we think** → `/who-we-are/#how-we-think` | `WHO.think.label` "How We Think" (descriptive internal link, SEO rule) |

Every caption fits on one line under its photo at ≥ 1280 (measured). At 1024–1279 the long ones wrap to 2 lines inside the photo width; `max-width:100%` keeps them there.

---

## 9. Semantics, SEO / GEO

- `<section class="believe section" id="believe" aria-labelledby="believe-title">`. **Keep `id="believe"`**, the current anchor.
- Eyebrow `<p>`; **H2** title; statement **H3** (sentence 1, inline) + `<p>` (inline). The numbers block has an **H3** "Our numbers". Heading order is H2 → H3 → H3. The H1 stays in the hero.
- Strip: `<ul role="list">` of `<li><figure><div class="…media">img</div><figcaption>…</figcaption></figure></li>`. Corner captions go in two more `<li>`s as plain text, not headings.
- Alt text (concise and literal; these are mood images that carry the section's meaning):
  1. "Two translucent orange glass discs on a pale surface"
  2. "Close-up of rough grey stone in black and white"
  3. "Hooded figure in orange-tinted goggles against a pale grey sky"
  4. "White looped sculpture against a white tiled wall"
  5. "Glass panel with a yellow gradient beside perforated metal"
  6. "Silhouette of a person wearing a headset against a pale blue sky"
- Photos 3 and 6 show anonymous people with faces obscured. They are editorial mood images, **never** captioned or described as the TESERACT team or a client.
- Stats: `<dl class="believe__stats">` with `<div><dt>Community</dt><dd>20K+</dd></div>`. The value is shown above the label via `flex-direction:column-reverse`; DOM order stays dt → dd.
- Italic phrases use `<i>` (stylistic, not `<em>`). The divider and red rule are `aria-hidden` presentational elements. "01" is `aria-hidden`.
- No new structured data is needed. The text is real HTML; there is no hidden text, and none is baked into images.

---

## 10. Responsive plan (validated in `_work/spec10/proto.html` at 1920 / 1440 / 1280 / 1024 / 834 / 800 / 390: no horizontal overflow at any width; photo scales ≤ 1.23)

### Desktop ≥ 1024: faithful poster artboard
- `.believe .container { container-type: inline-size }`. All sizes are in cqi, so the composition scales 944 → 1344 and then stays fixed (container cap). At 1920 it is centred at 1344.
- Header row: dot + label. H2 flush left, 2 lines, `white-space:nowrap` per line.
- Strip: `position:relative; aspect-ratio:1361/401.2`. Each `li` is absolute at `left:var(--x); top:var(--y); width:var(--w); height:var(--h)`, using the §3.1 percentages. Captions are absolute at `top:100%` with `margin-top:6px` and `max-width:100%`. The corner captions sit in the same row as the bottom captions, left 0 and right 0 (right-aligned).
- Divider, then the text grid `grid-template-columns: 24.39% 39.09% 1fr`:
  - row 1: "01" in col 1, statement in cols 2–3;
  - row 2: side label in col 1, purpose `<p>` + link in col 2 (padding-right 8 %), numbers H3 + `<p>` in col 3. The numbers H3 **hangs** above line 1 (`margin-top: calc(-1.2em - 16px)`) so both paragraphs start on the same line;
  - row 3: `<dl>` 4-across in cols 2–3, each cell with a 1 px `--line-3` top rule, `padding-top:20px` and `gap:0 24px`.
- Red rule: `height:4px; margin-left:calc(-1 * max(var(--page-pad), (100vw - var(--maxw))/2)); width:calc(max(var(--page-pad), (100vw - var(--maxw))/2) + 63.48cqi + 8px)`. It bleeds to the viewport's left edge and ends 8 px past the right column's start, as in the reference (909.5 px at 1440).

### Tablet 800–1023.98: two-band 12-col strip (prototype at 834 and 800)
- H2 `8.9cqi` (67 px @834, still 2 lines, ink width 742 of 754).
- Strip `display:grid; grid-template-columns:repeat(12,1fr); gap:40px 8px`. The photos become in-flow with `aspect-ratio` set on the media wrapper.
  - **Band 1 (top-aligned):** glass `1/4`, stone `4/7`, headset `9/13`. This keeps the desktop's top row with the air bay before the headset.
  - **Band 2:** hood `1/7` spans rows 2–3. Knot `7/10` and prism `10/13` sit in row 3 with `align-self:end`, so they stay bottom-aligned with the hood (as on desktop). The corner captions sit in row 2, cols `7/13`, at the top of the void: L left-aligned, R right-aligned below it with `margin-top:3.2em`.
  - Captions are static under each photo: 12 px, `margin-top:8px`.
- Text grid `16% 1fr 1fr`, `column-gap:32px`. Statement `5.6cqi` (42 px). Body 18 px. Side label 13 px. Stats 2×2 (`gap:28px 24px`), values 44 px.

### Phone ≤ 799.98: stacked 2-col flow (prototype at 390)
- Label 13 px. H2 `15.2cqi` (54 px @358), wraps naturally to 4 lines: "SIMPLE FOR / PEOPLE. / POWERFUL / FOR BUSINESS."
- Strip `grid-template-columns:repeat(2,1fr); gap:28px 8px`:
  - row 1: glass | stone;
  - row 2: hood full width (358 px = 1.14×);
  - row 3: knot | prism;
  - row 4: corner captions (left cell, stacked L then R) | headset (right cell).
- Captions 11 px.
- Divider `margin-top:64px`. Then a single column: "01" (13 px), statement `clamp(26px, 8.2cqi, 34px)` / 1.1 (≈ 6 lines), side label as a 3-line micro label, purpose `<p>` 17/1.45, link, then "Our numbers" H3 (static, not hanging) + `<p>`, then stats 2×2 (values 34 px).
- Red rule from the viewport's left edge to `var(--page-pad) + 62cqi`.

---

## 11. Motion (uses the existing `02-core.js` / `03-motion.css` vocabulary; everything is off under reduced motion)

| Element | Treatment |
|---|---|
| Label | `data-reveal` (fade-up 40 px) |
| H2 | `data-split` word rise (38 ms per word), lines 0 / 120 ms |
| Strip | `data-stagger="90"` on the `ul`. Each media wrapper is `.reveal-image` (ZIP 1.1→1 scale + fade) in reading order 1→6. Captions `data-reveal="fade"` with `--d` = photo delay + 240 ms. Corner captions fade last. Optional fine-pointer hover: `img` scale 1.03 over .9 s `var(--ease)` (tiles are not links, so no cursor pill). Optional scroll parallax on the inner `img` only: ±4 % `translateY`, hood 0, small tiles −4 %, headset +4 %, at 1.08 scale (stays ≤ 1.25× native). Disabled on `pointer:coarse` and under reduced motion |
| Divider | Draws left→right: `transform:scaleX(0)` → `none`, `transform-origin:0 50%`, 1.2 s `var(--ease)`. This needs a local override of the `[data-reveal]` transform |
| "01" dot | One `ts-pulse` ring when the statement enters |
| Statement | `data-split` on the wrapper `div` (the splitter recurses into the inline H3, `p` and `i`, so `--i` continues across both sentences). Optional scroll-linked "ink": the continuation's words step from `.25` to `.5` alpha as the block crosses 70→40 % of the viewport. Off on touch and under reduced motion |
| Columns | `data-reveal` with `data-stagger="120"` |
| Stats | Top rules draw like the divider (stagger 90 ms). Numeric values count up (20, 400 → final, 1.2 s ease-out, `font-variant-numeric:tabular-nums`). The final text is server-rendered for no-JS. "Millions" and "Global" only fade in |
| Red rule | `scaleX(0→1)` from the left, 1.4 s `var(--ease)`, 200 ms after the stats row enters (optionally scrubbed to section scroll progress) |

---

## 12. Implementation notes and gotchas

1. **Owner files** (PLAN): `scripts/sections/home_believe.py`, `src/css/23-believe.css`, plus a new `src/js/23-believe.js` if count-up, parallax or ink are added. **Do not delete** `card`, `tile` or `carousel` from `home_believe.py`, the `.bel-card` / `.bel-car` CSS in `23-believe.css`, or `src/js/23-carousel.js`. `scripts/pages/stories.py` (lines 65 and 78) imports them for Client Stories. Either keep them or move them to a shared module in the same change.
2. Crops are non-manifest: use `lib.img(...)` with `w`/`h`; `ctx.asset` registers them for copying into `dist/`.
3. Brand: build the side label from `CONFIG['brand_full']` ("TESERACT Creative Studios") + "Philosophy". Never hard-code TESSERACT.
4. Italic: use `skewX(-8deg)` on `<i>` (inline-block, nowrap). Do **not** rely on `font-style: italic` (14°) or `oblique 8deg` (renders upright).
5. Use `It&nbsp;should` in the statement (§4). Stat values stay in doc casing.
6. The H2 is flush with the content edge. The image's 24 px optical indent would overflow line 2 at 8.93cqi.
7. No horizontal page scroll: the red rule's negative margin is matched by its width calc. The section is inside `body{overflow-x:clip}`, and the prototype reports `scrollWidth == innerWidth` at every tested width.
8. Python on this workspace needs extended-length paths for writes under `teseract-website/public/…` (`\\?\` prefix), as in `lib.longpath`.

---

## 13. Reproduce / regenerate

Run from WD with `python -I` / `node`:

| Script | Purpose |
|---|---|
| `_tools/spec-10-measure.py _ref/images/10.webp` | band ink boxes |
| `_tools/spec-10-strip.py`, `_tools/spec-10-edges.py` | photo edge profiles |
| `_tools/spec-10-text.py`, `_tools/spec-10-rows.py` | text lines, cap bands (sub-px) |
| `_tools/spec-10-crop.py _ref/images/10.webp teseract-website/public/assets/believe --preview _work/spec10/crops-on-black.png` | regenerates the 6 crops + a preview on black |
| `_tools/spec-10-ring.py teseract-website/public/assets/believe` | fringe check |
| `_tools/spec-10-jobs.py` + `_tools/spec-10-fit.cjs` (page `_work/spec10/fit.html`) | Geist size and tracking fit |
| `_tools/spec-10-overlay.cjs` (page `_work/spec10/overlay.html`) | overlay Geist candidates on the reference |
| `_tools/spec-10-proto.cjs [widths]` | shoots `_work/spec10/proto.html` and prints overflow, photo-scale and caption checks |
