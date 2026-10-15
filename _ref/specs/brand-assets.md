# Brand assets: TESERACT CREATIVE STUDIOS

Source: `_ref/images/1.webp` (1672 × 941, RGB, effectively greyscale: max chroma 3/255).
Everything below was measured on that image. "px" means **source px** unless a unit says otherwise. **H** is the cap height of the main wordmark (52.5 px). Values marked (est.) are estimates. Everything else was measured: Canny line fits, 8× up-sampled 0.5-coverage contours, and coverage integrals.

Output folder: `_ref/extracted/`. Build scripts: `_work/brand/` (run from WD with `python -I`):
`build_mark.py 0.04 0.10` → `build_3d.py` → `build_wordmark.py` → `build_icons.py`.

---

## 0. Deliverables

| File | What | Size |
|---|---|---|
| `logo-mark-3d.png` | 3D mark, RGBA, tight crop, faces opaque, soft shadow kept as semi-transparent black | 515 × 519, 77 KB |
| `logo-mark-3d.webp` | same, WebP q90 with alpha | 32 KB |
| `logo-mark-3d-on-white.webp` | same composited on #FFFFFF (no alpha) | 8 KB |
| `logo-mark.svg` | flat mark, idealised 3-fold-symmetric geometry, `fill="currentColor"`, viewBox 0 0 100 100 | 343 B |
| `logo-mark-traced.svg` | flat mark, literal trace of the 3D faces (not symmetric), same viewBox | 379 B |
| `wordmark.svg` | "TΞSΞRΛCT" as filled outlines, `currentColor`, viewBox 0 0 1474.29 100 (cap = 100) | 1.1 KB |
| `wordmark-lockup.svg` | wordmark plus "CREATIVE STUDIOS" as paths (no font dependency), viewBox 0 0 1474.29 204.67 | 2.7 KB |
| `logo-lockup.svg` | flat mark, wordmark and sub-line stacked exactly as in the source, viewBox 0 -1002.46 1474.29 1207.12 | 2.9 KB |
| `logo-horizontal.svg` | derived header lockup (not in the source): mark 2.4 H tall, 0.9 H gap, wordmark centred on the mark | 1.4 KB |
| `favicon.svg` | flat mark with bold gaps; #111111, and #F5F5F5 under `prefers-color-scheme: dark` | 308 B |
| `favicon-32.png` | #111 mark on a white rounded tile (r 7 px) on transparent | 1.5 KB |
| `favicon.ico` | 16/32/48, white rounded tile + #111 mark | 4.2 KB |
| `apple-touch-icon-180.png` | opaque white, #111 mark 112 px tall, centred | 6.5 KB |
| `og-image.jpg` | 1200 × 630: 3D mark, wordmark and sub-line from the original, centred, pure #FFF background | 33 KB |

---

## 1. Spelling: one S

The wordmark has **8 glyphs: T · Ξ · S · Ξ · R · Λ · C · T**. It reads **"TESERACT" with a single S**, not "TESSERACT". Connected-component analysis finds exactly one S at x 674–726 px. Each E is three free-standing bars with no stem (Ξ). The A is a Λ with no crossbar.

The sub-line reads **"CREATIVE STUDIOS"**, 15 letters in 2 words. It uses ordinary E (with a stem) and A (with a crossbar).
→ Use "Teseract" in alt text, `<title>`, `aria-label` and meta (the SVGs already do). Flag the single-S spelling to the client to confirm it is intentional.

---

## 2. Source colours

| Token | Value | Where |
|---|---|---|
| background | #FEFEFE (254; noise 251–255) | canvas |
| wordmark ink | #0E0E0E core (median 14–16) | TΞSΞRΛCT |
| sub-line ink | #030303–#0E0E0E | CREATIVE STUDIOS |
| mark face, light | #E7E7E7 (231) to #FFFFFF highlights | upper facet of the central pyramid |
| mark face, mid | #D0D0D0–#DBDBDB (208–219) | lower facet and the 3 shards |
| mark side walls | #B2B2B2 (178, lit) down to #4F4F4F (79, in the gaps) | slab thickness |
| contact shadow | #C5C5C5 (197) next to pieces, fading to #FEFEFE over ~60 px towards the lower right | |

Recommended flat colours: ink **#111111**, paper **#FFFFFF** (dark scheme: ink #F5F5F5 on #0D0D0D).

---

## 3. The mark

### 3.1 Construction (verified against the trace)
- Start from a **regular pointy-top hexagon** of circumradius R, vertices `V0..V5` clockwise from the top. With y pointing down: `V0=(0,-1) V1=(.866,-.5) V2=(.866,.5) V3=(0,1) V4=(-.866,.5) V5=(-.866,-.5)` × R.
- **Central piece:** equilateral triangle V0–V2–V4 (alternate vertices).
- **Three shards** fill the three isosceles triangles left over (around V5, V1 and V3). Each shard is **truncated at fraction t = 0.65** along its outer hexagon side and **pivots at one triangle vertex**:
  - left shard: V5, V0, F_L = V5 + t·(V4 − V5) = (−.866, .15)R
  - right shard: F_R = V1 + t·(V0 − V1) = (.3031, −.825)R, V1, V2
  - bottom shard: V4, F_B = V3 + t·(V2 − V3) = (.5629, .675)R, V3
  - This gives a **120° rotational pinwheel**: pivots V0 → V2 → V4, open ends at V4 → V0 → V2.
- **Gaps:** each shard's inner edge (pivot → F) diverges from the triangle edge by a **6.98° wedge**. The gap is 0 at the pivot and 0.175 R at the open end. In the source it measures about 9° and up to 52 px (0.23 R).
- **Flat rendering:** offset every *internal* edge inwards by gap/2 (outer hexagon edges stay on the hexagon).
  - `logo-mark.svg`: gap = **0.04 R**, which is 2.03 units in the 100-box.
  - `favicon.svg`: gap = **0.10 R** (1.5 units in its 32-box).
  - `apple-touch-icon`: gap = 0.05 R.
  - Rule: keep the gap ≥ 1 device px. Switch to the favicon geometry below about 48 px mark height.

### 3.2 Measured in the source (front faces, Canny line fits, residuals 0.35–2.4 px)
| piece | vertices (px) |
|---|---|
| central triangle | (828.7,172.0) (1038.0,496.8) (645.8,507.4) |
| left shard | (625.3,290.9) (825.0,172.2) (631.8,423.4) |
| right shard | (887.4,194.9) (1054.0,283.3) (1038.0,495.3) |
| bottom shard | (641.4,508.7) (969.7,552.7) (842.7,628.8) |

- Least-squares fit of the ideal model to these 12 vertices: centre **(835.65, 393.87)**, **R = 229.76 px**, rotation **−1.57°** (drawn upright), **t = 0.651**, RMS vertex error 7.96 px (3.5 % R).
- An anisotropic fit gives sx = 1.036: the render is about 3.5 % wider than a regular hexagon.
- Per-shard t: left 0.61, right 0.75, bottom 0.63. The right shard is longer in the render; the ideal model uses a uniform 0.65.
- Front-face bbox: x 625.3–1054.0, y 172.0–628.8 (428.7 × 456.8 px). Ideal hexagon: 397.9 × 459.5 px.
- 3D detail (est.): the central piece is a low **triangular pyramid**.
  - Apex K ≈ (757, 328) px = (−0.342, −0.287)R from the hex centre, which is (32.7, 34.8) in the `logo-mark.svg` box.
  - Facets: K–V0–V2 bright (#E7E7E7), K–V4–V2 mid grey (#D0D0D0), and a thin lit sliver along V0–K.
  - The shards are flat slabs with walls about 6–9 px thick (≈0.03 R) and a soft contact shadow down and to the right.

### 3.3 `logo-mark.svg` coordinates (viewBox 0 0 100 100)
- Mark bbox: 87.72 × 100, centred. Hex centre (50, 49.352), R = 50.648.
- Centre triangle: (50,0.73) (92.11,73.66) (7.89,73.66)
- Left shard: (6.14,24.03) (47.76,0) (6.14,55.27)
- Right shard: (66.81,8.41) (93.86,24.03) (93.86,72.09)
- Bottom shard: (8.38,75.97) (77.05,84.38) (50,100)

### 3.4 Verification
- Rasterised the SVG polygons (PIL, 4× supersampling) and compared with the traced silhouette in source space:
  - **IoU 0.880** (gap 0.04 R, upright)
  - 0.886 (gap 0.04 R, at the source's −1.57° tilt)
  - 0.897 (gap 0.02 R, tilted)
- The remaining difference is the render's irregularity: the wider right shard and the 3.5 % horizontal stretch.
- Side-by-side check: `_work/brand/mark_compare.png` (ideal / literal trace / source).
- Headless Chrome render: `_work/brand/chrome/preview_light.png`.

---

## 4. 3D mark raster (`logo-mark-3d.*`)

- **Crop in source:** x 619–1134, y 163–682 → **515 × 519 px**. The opaque faces sit at x 6–435, y 9–466 inside the crop. The remaining area to the right and bottom is shadow.
- **Matte model:**
  - Faces: the traced polygons, rasterised with 4× supersampled anti-aliasing, are α = 1.
  - Everything outside them is a black shadow: α = 1 − I/254, with a 1.5-level noise floor and a σ 0.6 px denoise.
  - Boundary pixels are split as `I = m·I_face + (1−m)(1−α_s)·254`. I_face is a 7×7 normalised-convolution estimate. Pixels darker or brighter than the model allows are handled separately.
  - The shadow is faded to 0 over the 22 px above y = 684, because in the source it runs into the wordmark.
- **Quality:** recompositing on #FEFEFE reproduces the source with mean error 0.67/255 and p99 5/255. 21 px exceed 25/255; all of them are on the lit bevel edges.
- **On dark or colour backgrounds:** walls and gaps go transparent-dark and the shadow darkens the backdrop. This looks natural (see `_work/brand/3d_preview.png`). The thin lit left wall of the left shard (≈6 px) becomes transparent.
- **Placement to rebuild the source composition in HTML.** Take the wordmark box (left edge of T, cap line) as the origin, wordmark width 774 px = 14.74 H:
  - image left = **+170.1 px = 21.98 %** of the wordmark width
  - image width = **66.54 %** of the wordmark width (515 px)
  - image top = **−527.4 px (−10.05 H)**; image bottom = 8.4 px (0.16 H) above the cap line
  - Equivalently, the mark's front-face bottom vertex sits 61.6 px (**1.17 H**) above the cap line.

---

## 5. Wordmark "TΞSΞRΛCT"

### 5.1 Global metrics
| metric | px | relative |
|---|---|---|
| cap height H (top of bars → baseline) | **52.5** (690.4 → 742.9) | 1 H = 100 SVG units |
| stroke, horizontal bars | 6.5–6.6 | |
| stroke, vertical stems | 6.5–6.9 | |
| stroke, diagonals (Λ 6.70/6.72, R leg 6.50) | ≈ 6.6 | **0.125 H (1/8 cap); SVG uses 12.5 u** |
| corner radius, outer (S, C, R bowl) | 10.6 (10.2–11.5) | 0.20 H → 20 u |
| corner radius, inner (concentric) | ≈ 4 | 0.075 H → 7.5 u |
| terminals | square / butt, cut horizontally at cap and baseline | |
| total width | **774.0** (448.9 → 1222.9) | **14.74 H** |
| ink colour | #0E0E0E | |

### 5.2 Glyphs (source px; SVG units = (x − 448.9)/0.525)
| glyph | x left–right (px) | width | SVG units | gap to previous |
|---|---|---|---|---|
| T | 448.90–510.20 | 61.3 = 1.168 H | 0–116.76 | – |
| Ξ (E) | 568.60–618.20 | 49.6 = 0.945 H | 228.00–322.48 | 58.4 = 1.112 H |
| S | 674.20–726.10 | 51.9 = 0.989 H | 429.14–528.00 | 56.0 = 1.067 H |
| Ξ (E) | 774.30–824.40 | 50.1 = 0.954 H | 619.81–715.24 | 48.2 = 0.918 H |
| R | 871.80–924.70 | 52.9 = 1.008 H | 805.52–906.29 | 47.4 = 0.903 H |
| Λ (A) | 963.58–1028.40 | 64.8 = 1.235 H | 980.34–1103.81 | 38.9 = 0.741 H |
| C | 1070.80–1121.70 | 50.9 = 0.970 H | 1184.57–1281.52 | 42.4 = 0.808 H |
| T | 1167.20–1222.90 | 55.7 = 1.061 H | 1368.19–1474.29 | 45.5 = 0.867 H |

**Tracking:**
- Mean gap between glyph boxes is **48.1 px = 0.917 H**; median 0.903 H.
- Mean centre-to-centre pitch is **102.2 px = 1.947 H**.
- From S onwards the pitch is regular at 97.7–100.3 px (≈1.89 H). The first two pitches are wider (T→Ξ 113.9, Ξ→S 106.8).
- The two Ts differ: 61.3 px vs 55.7 px. This is probably an artefact of the generated image; the SVG keeps the measured values.
- **Optional normalised variant (not built):** constant pitch 1.89 H, both Ts 1.11 H wide.
- If the wordmark were ever set in live Geist (cap-height 0.71 em), matching the width would need font-size = H/0.71 and letter-spacing 0.78 em. Not recommended, because the Ξ and Λ forms are custom. Use the SVG.

### 5.3 Glyph construction (SVG units, cap 0–100, w = 12.5, RO = 20, RI = 7.5)
- **T:** bar 0–12.5 across the full glyph width; stem 12.5 wide, centred, 0–100.
- **Ξ:** three bars, each the full glyph width × 12.5, at y 0 / 43.75 / 87.5. The middle bar is centred at y = 50 (measured 713.1–719.6 px). No stem.
- **S:** one closed band, 4 rounded corners (RO/RI, concentric).
  - Top bar from x = xl+20 to **xt = 525.71**. It stops 2.3 u short of the bowl's right edge (source: 1.2 px).
  - Left stem down to the middle bar (y 43.75–56.25), middle bar right, right stem down, bottom bar left to xl with a square terminal.
- **R:** stem 805.52–818.02 (full height) plus a bowl.
  - Bowl: top bar, right side x = 904.57, square top-left corner, rounded right corners RO/RI.
  - Bowl bar y **49.0–61.5**. This is lower than Ξ's middle bar: the bowl takes 0.615 H.
  - Leg: parallelogram at **39.8° from vertical**, horizontal width 16.27 u. Foot x 890.69–906.96 at the baseline, cut horizontally. It starts inside the bowl bar.
- **Λ:** polygon, axis cx = 1042.08. Strokes at **29.7° from vertical**, perpendicular 12.7 u (6.7 px).
  - Outer feet at cx ± 61.73. The apex is **flattened at the cap line: 9.37 u (4.9 px) flat**; the outer edges would meet 8.2 u (4.3 px) above it.
  - Inner feet at cx ± 47.1. Inner apex sharp at **y = 17.4** (measured 17.07 = 8.96 px below the cap). No crossbar.
- **C:** top and bottom bars with square right terminals, left side, outer corners RO 20, inner corners RI 7.5.

### 5.4 Verification
- Rendered `logo-lockup.svg` with headless Chrome at exactly source scale (width 774 px, top 164.08 px) and diffed it against the source.
- Wordmark: **soft-coverage IoU 0.895**, ink mass 96.5 % of the source.
- Overlays: `_work/brand/wm_ov1.png` and `wm_ov2.png` (red = source only, green = render only). Only sub-pixel fringes remain; there is a systematic offset of ≤ 0.2 px.

---

## 6. Sub-line "CREATIVE STUDIOS"

| metric | value |
|---|---|
| cap height h | **17.35 px** (780.5 → 797.85) = **0.3305 H** (H/h = 3.03) |
| stroke | horizontals 2.03–2.08 px, verticals 2.29–2.51 px (≈ 0.12–0.14 h). SVG uses one 4.4 u (2.31 px) centre-line stroke. |
| span | 533.56 → 1139.81 = **606.25 px = 0.783 × wordmark width**, centred (centre 836.7 vs 835.9) |
| letter gap | **24.0 px mean = 1.38 h = 0.457 H** (A→T 19.5 kerned; others 22.2–25.6) |
| word space | **53.6 px = 3.09 h** |
| vertical rhythm | wordmark baseline → sub-line cap line = **37.6 px = 0.716 H**; lockup height cap-to-sub-baseline = 2.047 H |
| style | extended geometric sans with super-elliptic corners (outer corners ≈ 7.5 × 5.8 px). Eurostile/Michroma look (est.). |

- Glyph widths (px): C 17.88, R 17.25, E 16.00, A 20.37, T 18.63, I 2.25, V 20.00, E 16.13, S 17.50, T 18.25, U 18.37, D 18.75, I 2.50, O 20.50, S 17.37. Most are 0.92–1.18 h; I is 0.13 h.
- In the SVGs the sub-line is built as stroked centre-lines (`stroke="currentColor"`, butt caps, miter joins). Corners are elliptical arcs: C/O rx 12–12.5 × ry 9 u, D/U 10.5 × 8.5, S 9.5 × 7.24, R 7.5 × 7.0. A, V and the R leg are filled polygons.
- Verification: IoU 0.76 (2-px strokes, so sub-pixel sensitive), ink mass 96.4 %, per-glyph centroid error ≤ 0.31 px.

**Live-text fallback (HTML), set in the site's Geist** (capHeight 710/1000), relative to the wordmark cap H:
```css
.brand-sub{font-family:Geist,"Helvetica Neue",Arial,sans-serif;font-weight:400;
  font-size:calc(var(--brand-cap) * .4655);   /* gives cap = 0.3305 H */
  letter-spacing:1.04em; margin-right:-1.04em; /* spans 0.783 x wordmark width */
  text-transform:uppercase; line-height:1; text-align:center}
```
Geist is narrower than the source face, so the letters look lighter and further apart. Prefer the path version in `wordmark-lockup.svg`.

---

## 7. Lockups

- **Stacked (source) lockup, `logo-lockup.svg`:**
  - Mark hex R = 437.6 u = 4.376 H, so mark height = 8.75 H.
  - Hex centre at x = wordmark centre (source offset 0.25 px, so treated as centred), y = −564.8 u.
  - Gap from the ideal hex bottom (y −127.2 u) to the cap line = 1.272 H (66.8 px); from the visible bottom vertex = 1.17 H (61.6 px).
  - Wordmark width / hex width = 1.94; wordmark width / visible mark width = 1.81.
- **Horizontal (derived), `logo-horizontal.svg`:**
  - Mark height 2.4 H; gap mark → T = 0.9 H; wordmark vertically centred on the hex centre.
  - Suggested header use: height 24–32 px (cap 10–13 px).
- **Minimum sizes:**
  - Wordmark: cap ≥ 8 px (stroke ≥ 1 px).
  - Lockup with sub-line: H ≥ 24 px, so the sub-line cap is ≥ 8 px. Below that, drop the sub-line.
  - Flat mark: use `logo-mark.svg` at ≥ 48 px and the favicon geometry below that.
- **Clear space (est.):** 1 H on every side of the wordmark; 0.25 × mark height around the mark.

---

## 8. Usage notes

- **Recolouring:**
  - Every flat SVG uses `currentColor`.
  - Inline the SVG, or use `mask-image:url(...)` with `background:currentColor`. Masks need http(s), because Chrome blocks them on `file://`.
  - As `<img>`, currentColor resolves to black.
  - Verified: an inline render in #F2F2F2 and #99AADD on #0D0D0D works (`_work/brand/chrome/preview2.png`).
- **Favicon dark mode:** verified in headless Chrome. With `preferredColorScheme` light the mark draws #111111; with dark it draws #F5F5F5.
- **Head tags:**
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon-180.png">
<meta property="og:image" content="/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
```
- **og-image:** source box (74.1, 80.5)–(1597.9, 880.5), scaled 0.7875.
  - White point lifted ×255/251.5, so the background is exactly #FFFFFF.
  - The content (mark top 163 → sub-line baseline 798) is 500 px tall, centred.
  - Wordmark cap in the OG image ≈ 41 px.

---

## Critic additions

### A. Spelling across all sources (decision needed from the owner)
| Source | Spelling |
|---|---|
| Image 1 (logo) | **TESERACT** (one S, confirmed by connected components, §1) |
| Image 2 (idea section label) | **TESSERACT** CREATIVE STUDIOS |
| Image 4 (approach masthead) | **tesseract** |
| Master doc (`master.txt`) | **TESSERACT** in every instance: title, L32, footer L165/L169, and the brand section L171–192 |

The doc's "What the Name Represents" (L177) explains the name as the 4-D *tesseract*. So 3 of 4 sources, and the stated meaning, use the double-S spelling. The logo may contain an image-generation typo.

PLAN.md uses TESERACT as a configurable `lib.BRAND`. Keep it configurable, and ask the owner before launch.

### B. Double-S wordmark variant, built so either answer is cheap
- **File:** `_ref/extracted/wordmark-tesseract.svg`, viewBox `0 0 1662.79 100`, `currentColor`, `aria-label="Tesseract"`, 1.5 KB.
- **How it was built:** the S glyph from `wordmark.svg` (429.14–528.00 u) is duplicated at **+188.5 u**. That value is the mean regular pitch from S onward (1.885 H, measured 186.2–191.0). All glyphs after it are shifted by the same 188.5 u.
- **Result:**
  - Glyph order: T Ξ S S Ξ R Λ C T.
  - Width: **16.63 H** (single-S: 14.74 H).
  - Rendered check: `_work/critic/wm.png`.
- **If TESSERACT is chosen, also regenerate these:**
  - `wordmark-lockup.svg` and `logo-lockup.svg`: re-centre "CREATIVE STUDIOS" on the new wordmark centre, x 831.4 u; keep the span at 0.783 × the *original* width, or rescale to 0.783 × 1662.79.
  - `logo-horizontal.svg`.
  - `og-image.jpg`.
  - Every `aria-label`, `<title>` and alt text.
- **No change needed:** the mark, favicons and apple-touch icon.

### C. Header use
- **Fit:** in the 800 px header pill the wordmark is 124 px wide, which is cap 8.4 px, just above the 8 px minimum from §7. The fit calculation is in ref-hero-nav → Critic additions §C. The double-S variant at the same cap would be 140 px (+16 px), which overflows the pill's ≈ 6 px of slack by about 10 px.
- **If TESSERACT is chosen**, do one of the following:
  - drop the cap to 7.5 px, which is below the minimum, so it is not recommended;
  - hide the quick links below 1200 px;
  - widen the pill to 820 px.
