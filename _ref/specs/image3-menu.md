# Image 3: full-screen navigation menu overlay (implementation spec)

Source: `_ref/images/3.png`, 1600 × 857 px, RGBA (fully opaque), exported from Figma at 72 dpi.
Reference crops:
- `_ref/extracted/menu-art-reference.png`: art panel only, 900 × 672 px, cropped from image region `(0,64)–(900,736)`.
- `_ref/extracted/menu-annotated-overlay.png`: full frame with the fitted circles, guides and boxes drawn over it, for checking.

All coordinates are **image px in the 1600 × 857 frame** unless marked otherwise. `vw` and `vh` values are relative to 1600 × 857.

> **Fidelity note.** The image is almost certainly AI-generated and then upscaled. It has soft edges, smeared glyph feet, item pitches that drift by ±2 px, and swatch fills that do not match their own hex labels. Every value below is an exact measurement from the pixels. Where the pixels are not consistent, I give a systematised value to use, marked *(use)*. Estimates are marked *(est.)*.

---

## 0. Summary of key findings

| Topic | Finding |
|---|---|
| Background | `#FEFEFE` sampled (±1, many pure `#FFFFFF` pixels). Use `#FFFFFF` or a `--paper` token of `#FEFEFE`. |
| Ink | All dark text samples `#0E0E0E`–`#131313`. *(use)* `#111111`. |
| Menu typeface | **Not Helvetica Neue.** The R has a straight diagonal leg from the bowl junction, the W is pointed with its middle apex at full cap height, C/O/S are near-circular, and the tagline's y has a straight tail. This is a Proxima-Nova-style geometric grotesk. Of 25 fonts I rendered and compared, **Figtree** matched best, at weight **400** for the menu (top IoU tier, tied with DM Sans 500 / Albert Sans 500, and it needs ~0 tracking) and ~**500** for the small UI text. |
| Menu metrics | Cap height 33.8 px gives Figtree **48 px** (3.0 vw). Letter-spacing ≈ −0.01 em. Baseline pitch 76.6 px (1.6 × font size). Stems 3.9 px, bars 3.35 px. |
| Tagline / CTA / links | Tagline 20 px / 500, CTA label 17 px / 500, footer links 17 px / 500, all with letter-spacing −0.01 to −0.02 em. |
| "Aa" | Helvetica-Neue-like, medium weight, ~456 px font size, A cap top at y = 288. The **A** has a near-vertical gradient (CSS ≈ 165°) from `#4E0003` at the apex to `#FB2629` at the feet. The bottom ~25 % dissolves into a Gaussian red glow (σ ≈ 40–50 px) that sits only on the lower half, mostly to the left. |
| Swatch pixels ≠ labels | Swatch fills sample as `#000000` / **`#970102`** / **`#D20104`** / **`#ECECEC`**. Their labels say `#000000` / `#FF5A37` / `#FB2629` / `#F6F6F6`. The second swatch really is dark crimson, not orange. See §3.9 for the choice this forces. |
| Geometry | The large faint circle C1 is centred at (471.5, 462.3) with r = 202.8. The faint vertical guides x = 269 / 676 and the horizontal y = 664 are its left, right and bottom tangents. Arc C2 is centred at (417.8, 369.8) with r = 173.7 and passes exactly through the red dot. The red quarter-arc C3 is centred at (877.4, 730.6) with r = 215.8, and the diagonal guide ends on it. |
| Motion language | The reference site (Framer) uses spring {stiffness 400, damping 30, mass 1}: ζ = 0.75, 2.8 % overshoot, settles in ~400 ms. Entrance offsets are y 80 / 60 / 40 px, with delays of 0.2–0.5 s and a tween of 0.3 s at `cubic-bezier(.44,0,.56,1)`. The choreography in §7 reuses these. |

---

## 1. Frame layout (desktop, 1600 × 857)

```
x:   0 ────── 113 ─ 139 ──── 382 ───── 550 ── 638 ────── 900 │ 960 ─────────────── 1368   1461─1489 ─ 1600
     │  ART PANEL  (0 → 900 = 56.25 vw, y 64 → 736)          │  MENU COLUMN (60 vw → 85.5 vw)
     │  footer links y 742 → 813                              │  top bar centred on y ≈ 58
```

| Region | Box (x0, y0 → x1, y1) | % of frame |
|---|---|---|
| Side gutters | left text edge 113 (footer); right edge of X = 1489.5, i.e. 110.5 from the right | **7 vw (112 px)** *(use)* |
| Top bar centre line | y = 58 (CTA centre); tagline x-height centre 60.5; X centre 60 | 6.8 vh |
| Art panel | 0, 64 → 900, 736 (aspect 900 : 672 = 1.339) | 0–56.25 vw, 7.5–85.9 vh |
| Menu column | text left 960 (H stem ink at 962) → longest line ends 1367 | 60 vw → 85.5 vw |
| Menu block | HOME cap top 207.7 → CONTACT baseline 701.1; block centre 454.4 | 24.2 vh → 81.8 vh, centre 53.0 vh |
| Footer: legal | x 113, first baseline 755.5 | 7.06 vw |
| Footer: social | x 382, first baseline 754.5 | 23.9 vw |

---

## 2. Top bar

| Element | Measurement | Spec *(use)* |
|---|---|---|
| **Tagline** "Creativity meets functionality." | Ink box 672–921 × 51–70 (w 250). Cap/ascender top 51, x-height top 55.6, baseline 65.5, descender 70. Ink colour `#0E0E0E`. Ink centre x = 796.5, so it is centred on the viewport. | Figtree **500**, **20 px** (1.25 vw), line-height 1, letter-spacing **−0.02 em**, colour `#111`. Centred absolutely: `left:50%; translate:-50%`, baseline at y = 65.5. |
| **CTA pill** "Start a Project ↗" | Outer box 1198.5–1391.5 × 31–85, so **193 × 54 px**. Border 1.47 px measured (coverage) in near-black (`#232323` darkest after antialiasing). Fully rounded. | `height:54px; padding:0 30px; border:1.5px solid #111; border-radius:999px; gap:18px; background:transparent` |
| CTA label | Ink 1229–1334 (w 106), cap 52 → baseline 64.5 (cap 12.5). Left padding to the label ink is 30 px. | Figtree **500, 17 px**, letter-spacing −0.01 em, colour `#111` |
| CTA arrow ↗ | Ink 1352–1361 × 53–63 (10 × 11). Gap from the label is 18 px. Right padding is 30 px. | Inline SVG 10 × 10, path `M1 9 L9 1 M3 1 H9 V7`, stroke 1.6 px `currentColor`, `stroke-linecap:round` |
| **Close X** | Ink box 1461–1489 × 45–75 (**≈ 30 × 30**), centre (1475, 60). Stroke ≈ 2.4–2.8 px from coverage (8 px of ink per row across two 45° strokes). Ends look butt or square. Colour `#000`–`#111`. Gap from the CTA right edge is 69.5 px. | `<svg viewBox="0 0 30 30" width="30">` with `<path d="M1 1L29 29M29 1L1 29" stroke="#111" stroke-width="2.4" stroke-linecap="butt"/>`. Hit area 48 × 48, centred on (1475, 60). Right edge 7 vw from the viewport edge. |

---

## 3. Art panel (left), measured element by element

**Coordinate system for the build.** Use one inline SVG with `viewBox="0 64 900 672"` and `preserveAspectRatio="xMinYMin meet"`. That way **every image coordinate below can be pasted directly**. Text and swatches are HTML that is absolutely positioned inside the same container, which has `container-type:inline-size; aspect-ratio:900/672`. In that container 1 cqw = 9 px at the 900 px design width. Panel-relative percentages are `x/900` and `(y−64)/672`.

### 3.1 The "Aa" glyphs

| Item | Measurement |
|---|---|
| Typeface look | Neo-grotesk with a flat-topped A and a double-storey a with a spur tail. Labelled "Helvetica Neue". The weight is medium (stem ≈ 0.13–0.14 × cap height). In shape-matching IoU against the crisp part: Instrument Sans 500 0.786, Figtree 500 0.747, **Inter 500 0.746**, Arial 0.705. |
| A crisp extent | Apex flat top at **y = 288–289**, apex width 269–324 (55 px), apex centre x = 296.5. Crisp body to y ≈ 552. The feet dissolve and stay visible as pink to y ≈ 620. Overall A box including the dissolve: **x 125 → 457, y 288 → 622**. |
| A stems | Leg horizontal width 48–49 px. Leg slope 23.6° from vertical, so perpendicular stem ≈ **45 px**. Crossbar y ≈ 489–515 (≈ 26 px thick). |
| a extent | x-height top **y = 392** (overshoot). Stem right edge **x = 628**. Left bowl edge 445. Spur tail reaches x ≈ 655 at y ≈ 600. Bottom dissolves at 603–612. Box: **x 445 → 660, y 390 → 612**. Stem ≈ 40 px. |
| Baseline | ≈ **605–618** *(est.)* because the feet dissolve. The 'a' x-height (≈ 226 px) is about 0.685 × the A cap height (≈ 330 px), smaller than any real font's ratio. Render the 'a' at **0.93 em**. |
| Overlap / kerning | The A's right foot (≈ 457) overlaps the a's left edge (445) by 12 px. Use letter-spacing ≈ −0.07 em on the A. |
| Size *(use)* | font-size **456 px = 28.5 vw = 50.67 cqw**. With Inter metrics this gives cap height 331 px: A cap top 288, baseline ≈ 619. |

**Colour of the A, row-averaged across the crisp core (left leg | right leg):**

| y | 289 | 309 | 329 | 359 | 389 | 419 | 449 | 479 | 499 | 519 | 539 | 549 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| left | `#500706` | `#730102` | `#980202` | `#A10202` | `#AD0203` | `#B20202` | `#C90102` | `#E00302` | `#E30708` (bar) | `#F30D0F` | `#F82125` | `#F82A2F` |
| right | — | — | — | `#C00203` | `#CB0203` | `#D90404` | `#DD0302` | `#D30303` | ″ | `#E71416` | — | — |

A linear fit on the legs gives a gradient direction of **CSS 149°**. The fit over the whole A gives 172°. *(use)* **165°**. The right leg is about 0x20 brighter than the left leg at the same height.

**Colour of the a.** It is mostly `#D20506`–`#DD0808`, with a darker shaded band on the right stem (y 480–530: `#BD0405`–`#C50A0B`). The bowl's bottom-left is brightest (`#F50D0F`–`#FA2429`). The fitted direction is CSS ≈ 248°, i.e. dark top-right to bright bottom-left.

**Glyph gradients *(use)***. Each is set on its own letter's box:
```css
--aa-A: linear-gradient(165deg, #4E0003 0%, #730102 8%, #9C0202 20%, #B90202 33%,
                                #CF0202 48%, #E1050A 62%, #F01216 75%, #FB2629 86%, #FD4245 100%);
--aa-a: linear-gradient(235deg, #B80304 0%, #C40405 30%, #D40607 52%, #EC0F13 78%, #FB2629 100%);
```

**Dissolve and glow**, measured as the alpha of `#FB2629` over white, taken from the G channel:
- The crisp layer is opaque down to y ≈ 542 (75 % of the 288→622 box). Measured alpha at the A's left foot: y 560 = 0.82, 580 = 0.61, 600 = 0.20, 620 = 0.03.
- **There is no glow on the upper half.** Left of the A at y = 300–360 the alpha is ≤ 0.02 at 10 px out, and above the apex it is 0.
- The glow starts around y ≈ 390 and is strongest at y 480–540 on the **left** of the A. Alpha at distance d from the leg edge: d 2 = 0.50, 10 = 0.47, 20 = 0.40, 40 = 0.26, 60 = 0.12, 90 = 0.05. This fits a Gaussian edge with **σ ≈ 45 px** at opacity ≈ 0.9.
- Smaller glows sit under the A's right foot (alpha 0.42 at y 560, 0.24 at 600) and under the a's bowl (0.63, then 0.25 at 20 px below). The right side of the a's stem has no glow above y 560.
- Peak glow colour next to the leg is `#FFA1A1`. Glow pixels range `#FEA9A9` → `#FDE0DF` → `#FEF4F5`.

### 3.2 Construction lines (all 1 px hairlines, neutral unless noted)

Opacity is given as alpha of `#111` (integrated darkness ÷ 254). Each line fades in and out at its ends. Implement each as an SVG `<line>` with `vector-effect="non-scaling-stroke"` and its own `userSpaceOnUse` linear gradient. An `objectBoundingBox` gradient **fails on perfectly horizontal or vertical lines** because their bbox has zero height or width.

| id | Geometry (image px) | Peak α | Notes |
|---|---|---|---|
| V1 | x = 105.5, y 184 → 410 | **0.47** | Darkest vertical. Strong between 230 and 345, fades to 0 by 420. |
| V2 | x = 198.5, y 96 → 690 | 0.22 | Passes behind the A's glow (hidden 416–571). Fades at the top (96–140). |
| V3a | x = 550, y 140 → 362 | 0.45 | **Red-tinted crosshair.** Cross-profile core `#E8C0C1` with `#FBE6E8` sides, about a 1 px line of `#D8484C` at 45 %. Peaks at the dot (y 255). |
| V3b | x = 550, y 362 → 750 | 0.25 | Grey continuation. Runs behind the 'a' and is visible through its counters. |
| V4 | x = 626.5, y 232 → 430 (and a tick at 600 → 640) | 0.24 | Left edge of the palette block. |
| V5 | x = 725, y 384 → 722 | 0.33 | Passes behind the arc glow. |
| V6 | x = 269, y 448 → 485 and x = 676, y 296 → 480 | 0.10 | Left and right **tangents of C1**. Very faint. |
| V7 | x = 375, y 353 → 414; x = 411, y 392 → 505 | 0.10 | Faint grid lines inside the A counter. |
| H1 | y = 255, x 470 → 612 | 0.35 | **Red-tinted crosshair** through the red dot, same treatment as V3a. |
| H2 | y = 325.5, x 24 → 515 | **0.37** | Fades in over x 24 → 110 (α 0.08 → 0.37). Hidden behind the A between 250 and 340. |
| H3 | y = 395.5, x 360 → 640 | 0.15 | 'a' x-height line. |
| H4 | y = 500.5, x 13 → 690 | 0.25 | A crossbar line. Visible at 13–114 (fade-in), 410–475 and 632–687. |
| H5 | y = 619, x 576 → 740 | 0.35 | Leads into the "01 —" marker. Fades in at the left. |
| H6 | y = 664, x 446 → 497; y = 485, x 235 → 350; y = 522, x 220 → 275; y = 583, x 633 → 681 | 0.10 | Faint grid fragments. y = 664 is C1's bottom tangent. |
| D1 | (715.6, 416) → (779, 535), i.e. 28° from vertical (x = 0.5326·y + 494) | **0.80** in the middle (y 480–510), 0.20 at the ends | **Darkest guide.** Ends exactly on arc C3. |

### 3.3 Circles and arcs

| id | Centre, radius | Visible part | Stroke |
|---|---|---|---|
| **C1** large thin circle | **(471.5, 462.3), r 202.8** (RANSAC fit on 1107 points) | Full circle, but the top-right sector from −80° to −15° fades to 0 | 1 px `#111` at α ≈ 0.12 (integrated darkness 15–42), lower half ≈ 0.10–0.16 |
| **C2** upper arc | **(417.8, 369.8), r 173.7** | −155° → −35°, i.e. (260.4, 296.4) → top (417.8, 196) → (560.1, 270.2). **Passes through the red dot.** | 1 px α ≈ 0.15 (peak 0.18 at −80° to −60°), ends faded |
| **C3** red arc | **(877.4, 730.6), r 215.8** | −172° → −92°, i.e. (663.7, 700.6) → (869.9, 514.9). Peak at −150° to −125° (≈ (733, 570)). | Stroke ≈ 1.25 px `#FB2629`, sampled `#F28A94` at the antialiased core. Fades to 0 at both ends. |
| C3 inner glow | Same centre. Radial falloff inward from the rim, as alpha of `#FB2629`: r 216 → 0.42, 209 → 0.33, 203 → 0.26, 197 → 0.24, 185 → 0.17, 173 → 0.12, 161 → 0.07, 143 → 0.03, ≤ 130 → 0 | Angular mask: full strength at −140° to −120°, ≈ 0.25 × at −100°, 0 at −172° and −90° | — |

### 3.4 Dots

| Dot | Centre | Size | Colour |
|---|---|---|---|
| Black dot (top-left) | **(220.3, 170.2)** | Ø **17 px** (r 8.4) | `#010101`, so use `#000`. No glow. |
| Red dot (crosshair) | **(549.8, 254.7)** | Ø **13 px** (r 6.5) | Core `#FD0403`/`#F80003` (*(use)* `#F90406`). Antialiased rim `#D82427`. Pinkish halo `#E8C8CB`–`#E1C1C2` out to r ≈ 13. |

### 3.5 Glows (soft red light, all `#FB2629`-based)

| id | Shape | Peak alpha | Implementation |
|---|---|---|---|
| G-Aa | Blurred copy of the glyphs, lower half only (see §3.1) | ≈ 0.5 at the glyph edge | CSS `filter: blur(44px)` on a red "Aa" copy, `opacity:.9`, with `mask-image: linear-gradient(180deg, transparent 0 32%, #000 62%)` and `translate:-10px 6px` |
| G-left | Extra soft bloom left of the A leg, centred ≈ (150, 520), ~130 × 110 px | 0.20 | `radial-gradient(ellipse 130px 110px at 150px 520px, rgba(251,38,41,.22), transparent 70%)` |
| G-top | Pink haze above the crosshair. x 448 → **hard edge at 552** (it stops at line V3), y 72 → 228, centre ≈ (530, 160) | 0.06 (`#FEF2F2`) | SVG ellipse with `rx 80 ry 85`, a radial gradient α 0.07 → 0, and `clipPath` x ≤ 552 |
| G-arc | C3 inner glow (§3.3) | 0.42 | SVG circle with a radial gradient plus an angular mask |
| G-dot | Halo around the red dot, r ≈ 13 | 0.30 | `filter: drop-shadow(0 0 5px rgba(251,38,41,.55))` |

### 3.6 Typography block (top-left)

| Item | Box / metrics | Spec *(use)* |
|---|---|---|
| "Typography" | Ink 139–215 (w 77), cap top 227, baseline ≈ 234.5 (cap ≈ 8), colour **`#868686`** | Figtree 500, **11 px** (1.222 cqw), letter-spacing **0.18 em**. Left 15.44 %, cap top at panel y 163 (24.26 %). |
| "Helvetica Neue" | Ink 139–243 (w 105), cap top 249, baseline 259.8 (cap ≈ 11), colour `#121212` | Figtree 500, **16 px** (1.778 cqw), letter-spacing −0.02 em, colour `#111` |
| Short rule | x 139 → 167 (**28 px**), y = 282, 1 px. Two-row antialias (190 / 141) ≈ 1 px of `#555` | `width:3.11cqw; height:1px; background:#555` |

### 3.7 Colour palette block (top-right of the art)

| Item | Measurement | Spec *(use)* |
|---|---|---|
| "Colour Palette" | Ink 638–736 (w 99), cap 256 → 263.8 (≈ 8), colour **`#858585`** | Figtree 500, **11 px**, letter-spacing **0.20 em**. Left 70.89 % (x 638), cap top at panel y 192. |
| Swatch row | Centre y **303** (panel 239 = 35.57 %). Centre x **657.4, 716.5, 776.5, 836.5**, pitch **59.7 px** (6.63 cqw). | — |
| Swatch 1–3 | Fill **Ø 34** px + white gap ≈ 2 px + ring ≈ 1.5 px in the fill colour, so outer **Ø 41** | `width:34px; aspect-ratio:1; border-radius:50%; background:var(--c); box-shadow:0 0 0 2px #FEFEFE, 0 0 0 3.5px var(--c);` |
| Swatch 4 | Solid **Ø 40** (817–856), **no ring**, `#ECECEC` | `width:40px; background:#ECECEC` |
| Sampled fills | **`#000000`**, **`#970102`** (range `#920202`–`#A20002`), **`#D20104`** (range `#CE0103`–`#D50004`), **`#ECECEC`** | see §3.9 |
| Hex labels | Each 40 px wide, centred under its swatch (centres 657.5 / 716.5 / 776.5 / 836.5). Cap 336 → 343.5 (≈ 7.5). Colour `#2C2C2C`. Bold. | Figtree **700, 9 px** (1 cqw), letter-spacing 0.02 em, colour `#222`, `text-align:center`. Cap top at panel y 272. |
| Rule | x 637 → 671 (**35 px**), y 370–371, **1.5 px**, `#1A1A1A` (coverage 1.63) | `width:3.89cqw; height:1.5px; background:#1A1A1A` |

### 3.8 Index marker "01 —"

| Item | Measurement | Spec |
|---|---|---|
| "01" | Ink 757–769, y 614–624 (cap ≈ 10.5), colour `#5E5E5E` | Figtree 400, **14 px**, `font-variant-numeric: tabular-nums`, colour `#5E5E5E` |
| Dash | x 787 → 813 (**26 px**), y 618.5, 1 px, `#8F8F8F`. Gap after "01" is 18 px. | Pseudo-element 26 × 1 px |
| Lead line | H5 ends at x ≈ 740, leaving a 17 px gap before "01" | — |

### 3.9 Decision needed: swatch colours vs labels

The pixels show the crimson ramp that the "Aa" gradient uses (`#970102`, `#D20104`). The labels name `#FF5A37` (coral orange) and `#FB2629`.
- **Option A, faithful to the look (recommended for the art):** fill the swatches with `#000000 / #970102 / #D20104 / #ECECEC`, and either keep the labels as brand copy or change them to match the fills.
- **Option B, faithful to the labels:** `#FF5A37` will read as orange and break the monochrome-red mood.

Brand accent for UI states: **`#FB2629`**. That is the label value and the colour of the glyph feet and the arc.

---

## 4. Menu items (right column)

**Typeface identification** (letterforms and quantitative matching):
- **R:** straight diagonal leg leaving the bowl junction. Helvetica's leg is curved and vertical.
- **W:** pointed vertices, middle apex reaching cap height.
- **C / O / S:** near-circular with moderately open terminals.
- **Tagline y:** straight tail. **t:** slanted cut. **a:** double-storey. **f:** narrow.

I rendered each candidate so its cap height matched (33.8 px), solved letter-spacing so ink widths matched, and computed the 2-D IoU over all 7 lines:

| Font, weight | IoU run 1 (bisection) | IoU run 2 (direct compose) | Implied tracking |
|---|---|---|---|
| DM Sans 500 | 0.586 | 0.559 | +1.0–1.5 px (glyphs too narrow, so a poorer fit) |
| Albert Sans 500 | 0.584 | — | −1.3 px |
| **Figtree 400** | 0.578 | **0.559** (rank 1) | **−0.3 to −0.4 px (≈ −0.008 em, effectively 0)** |
| Inter 400 / Plus Jakarta 500 / **Geist 400** / Arial | 0.507 / 0.469 / 0.436 / 0.367 | 0.424 (Geist) / 0.445 (PJS) | — |

The top three are a statistical tie; the low absolute IoUs come from the soft upscaled source. Figtree wins on the tie-breakers: it needs essentially zero tracking, so its native widths match, and visually its stroke weight and W/R/C/S shapes match best. DM Sans looks heavier and more condensed, and Albert Sans is too wide.

Total-ink comparison puts the menu weight at **396–430**, i.e. **Regular 400**. The small UI text comes out at ≈ 500–570 (the blur in the upscale inflates small text), so **500**.
**Conclusion:** use a Proxima-Nova-style geometric grotesk at Regular. **Figtree 400** is the free match (Google Fonts, variable 300–900, self-host as woff2). If the project wants to keep its existing **Geist**, it works as a fallback but reads more technical: its R, G and S differ.

| Item | Ink box x | Cap top → baseline | Ink width | Figtree 400 @ 48 natural |
|---|---|---|---|---|
| HOME | 962 → 1095 | 207.7 → 241.5 | 134 | 134.1 |
| WHO WE ARE | 959 → 1254 | 285 → 318.8 | 296 | 304.5 |
| WHAT WE CREATE | 960 → 1367 | 363 → 396.8 | 408 | 415.8 |
| OUR APPROACH | 961 → 1317 | 440.4 → 474.2 | 357 | 365.8 |
| THE WORK | 960 → 1197 | 518 → 551.8 | 238 | 245.0 |
| CLIENT STORIES | 961 → 1317 | 593.3 → 627.1 | 357 | 366.6 |
| CONTACT | 961 → 1184 | 667.3 → 701.1 | 224 | 226.9 |

The PIL measurement has no GPOS kerning, so the natural widths above are 2–8 px wider than a browser would render (kerning on WA, AT, TH, AP, …).

**Spec *(use)*:**
```css
.menu__nav a {
  font: 400 clamp(34px, 3vw, 60px)/1.1 "Figtree", "Geist", system-ui, sans-serif;  /* 48px @1600 */
  letter-spacing: -0.01em;
  text-transform: uppercase;            /* source copy is uppercase too */
  color: #111;
  font-kerning: normal;
}
.menu__nav li + li { margin-top: calc(1.6em - 1.1em); }   /* pitch 1.6em = 76.8px @48px; measured 76.6 */
```
- Cap height 33.8 px. Stems 3.9 px, horizontal bars 3.35 px (ratio 0.115 / 0.099 of the cap height).
- Measured baseline pitches are 77.3, 78.0, 77.4, 77.6, 75.3, 74.0 px. Mean **76.6 px**, normalised to 1.6 em.
- **Placement:** `left: 60vw`. Put the block's visual centre at **53 vh**, i.e. `top:50%; translate:0 calc(-50% + 3vh)`. HOME's cap top then lands at 24.2 vh and CONTACT's baseline at 81.8 vh.

---

## 5. Footer links (bottom-left)

| Link | Ink box | Baseline |
|---|---|---|
| Privacy policy | 113 → 219 × 743 → 759 | 755.5 |
| Terms of service | 112 → 240 × 772 → 785 | 784.5 (pitch 29) |
| Instagram | 382 → 457 × 742 → 758 | 754.5 |
| LinkedIn | 382 → 444 × 769 → 781 | 781.5 (pitch 27) |
| Behance | 382 → 448 × 796 → 809 | 809 (pitch 27.5) |

Cap ≈ 12.5 px, colour `#0E0E0E`–`#0F0F0F`.

**Spec:** Figtree 500, **17 px**, line-height **28 px** (1.65), letter-spacing −0.005 em, colour `#111`. Use two columns at x = 7 vw and 23.9 vw (269 px apart). Align the first baselines. Place Behance's descender 44 px above the viewport bottom (`bottom:44px`).

---

## 6. Construction proposal

### 6.1 DOM

```html
<div class="menu" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" data-state="closed" hidden>
  <header class="menu__bar">
    <p class="menu__tagline">Creativity meets functionality.</p>
    <a class="menu__cta" href="/contact/">Start a Project <svg class="i-arrow" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 9 9 1M3 1h6v6"/></svg></a>
    <button class="menu__close" type="button" aria-label="Close menu"><svg viewBox="0 0 30 30"><path d="M1 1 29 29M29 1 1 29"/></svg></button>
  </header>

  <div class="menu__art" aria-hidden="true">          <!-- container-type:inline-size; aspect-ratio:900/672 -->
    <svg class="art__svg" viewBox="0 64 900 672">…§6.2…</svg>
    <div class="art__aa">
      <span class="aa aa--glow">A<span>a</span></span>
      <span class="aa aa--crisp"><span class="aa__A">A</span><span class="aa__a">a</span></span>
    </div>
    <svg class="art__svg art__svg--top" viewBox="0 64 900 672">…red dot + crosshair (above glyph glow)…</svg>
    <div class="art__typo"><p class="lbl">Typography</p><p class="val">Helvetica Neue</p><i class="rule"></i></div>
    <div class="art__palette"><p class="lbl">Colour Palette</p><ul>…4 × <li><b style="--c:#000"></b><span>#000000</span></li>…</ul><i class="rule"></i></div>
    <div class="art__index"><span class="art__num">01</span><i></i></div>
  </div>

  <nav class="menu__nav" aria-label="Primary"><ol>
    <li><a href="/" aria-current="page"><span class="mask"><span class="txt">Home</span></span></a></li>
    … Who We Are · What We Create · Our Approach · The Work · Client Stories · Contact
  </ol></nav>

  <ul class="menu__legal"><li><a href="/privacy/">Privacy policy</a></li><li><a href="/terms/">Terms of service</a></li></ul>
  <ul class="menu__social"><li><a href="…">Instagram</a></li><li><a href="…">LinkedIn</a></li><li><a href="…">Behance</a></li></ul>
</div>
```

**What goes where:**
- **CSS text with gradient and blur:** "Aa". It uses two stacked spans, a crisp gradient-clipped layer and a blurred glow copy. Both are masked.
- **Inline SVG:** all hairlines, both circles, the diagonal, the red arc with its glow, both dots, the crosshair, and the top haze. Give each guide its own userSpace gradient for the end fades. Use `vector-effect:non-scaling-stroke` so lines stay 1 px at every scale.
- **HTML:** labels, swatches, hex codes, the index marker, menu and links. This keeps the text crisp and selectable, and lets it scale with `cqw`.

**Z-order inside `.menu__art`:**
1. G-top, G-arc, G-left
2. Guides, C1, C2, D1 (beneath the glyphs, because V3b and V2 are hidden by them)
3. `aa--glow`
4. `aa--crisp`
5. C3 stroke, crosshair H1/V3a, red dot, black dot
6. HTML labels

### 6.2 SVG skeleton (image coordinates; paste as-is)

```html
<svg class="art__svg" viewBox="0 64 900 672" preserveAspectRatio="xMinYMin meet">
  <defs>
    <!-- reusable fade for a vertical guide: stops are re-declared per line with userSpaceOnUse -->
    <linearGradient id="gV1" gradientUnits="userSpaceOnUse" x1="0" y1="184" x2="0" y2="410">
      <stop offset="0" stop-color="#111" stop-opacity="0"/><stop offset=".2" stop-color="#111" stop-opacity=".47"/>
      <stop offset=".7" stop-color="#111" stop-opacity=".45"/><stop offset="1" stop-color="#111" stop-opacity="0"/></linearGradient>
    <!-- …gV2 (198.5: 96→690, .22), gV3b (550: 362→750, .25), gV4 (626.5: 232→430, .24), gV5 (725: 384→722, .33),
           gH2 (y325.5: x24→515, .37; first stop at 0 → .08, .18 → .37), gH3 (.15), gH4 (.25), gH5 (.35) -->
    <linearGradient id="gD1" gradientUnits="userSpaceOnUse" x1="715.6" y1="416" x2="779" y2="535">
      <stop offset="0" stop-color="#111" stop-opacity=".2"/><stop offset=".55" stop-color="#111" stop-opacity=".8"/>
      <stop offset="1" stop-color="#111" stop-opacity=".25"/></linearGradient>
    <linearGradient id="gCross" gradientUnits="userSpaceOnUse" x1="0" y1="140" x2="0" y2="362">
      <stop offset="0" stop-color="#D8484C" stop-opacity="0"/><stop offset=".52" stop-color="#D8484C" stop-opacity=".45"/>
      <stop offset="1" stop-color="#D8484C" stop-opacity="0"/></linearGradient>
    <linearGradient id="gCrossH" gradientUnits="userSpaceOnUse" x1="470" y1="0" x2="612" y2="0">
      <stop offset="0" stop-color="#D8484C" stop-opacity="0"/><stop offset=".55" stop-color="#D8484C" stop-opacity=".38"/>
      <stop offset="1" stop-color="#D8484C" stop-opacity="0"/></linearGradient>
    <linearGradient id="gArc" gradientUnits="userSpaceOnUse" x1="663.7" y1="700.6" x2="869.9" y2="514.9">
      <stop offset="0" stop-color="#FB2629" stop-opacity="0"/><stop offset=".3" stop-color="#FB2629"/>
      <stop offset=".6" stop-color="#FB2629"/><stop offset="1" stop-color="#FB2629" stop-opacity=".1"/></linearGradient>
    <radialGradient id="gArcGlow" gradientUnits="userSpaceOnUse" cx="877.4" cy="730.6" r="215.8">
      <stop offset=".60" stop-color="#FB2629" stop-opacity="0"/><stop offset=".75" stop-color="#FB2629" stop-opacity=".07"/>
      <stop offset=".86" stop-color="#FB2629" stop-opacity=".17"/><stop offset=".94" stop-color="#FB2629" stop-opacity=".26"/>
      <stop offset="1" stop-color="#FB2629" stop-opacity=".42"/></radialGradient>
    <mask id="mArc" maskUnits="userSpaceOnUse" x="600" y="480" width="320" height="300">
      <rect x="600" y="480" width="320" height="300" fill="url(#gArcMask)"/></mask>
    <linearGradient id="gArcMask" gradientUnits="userSpaceOnUse" x1="663.7" y1="700.6" x2="869.9" y2="514.9">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".32" stop-color="#fff"/>
      <stop offset=".58" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity=".15"/></linearGradient>
    <mask id="mC1" maskUnits="userSpaceOnUse" x="260" y="250" width="430" height="430">   <!-- kills C1's top-right sector -->
      <rect x="260" y="250" width="430" height="430" fill="url(#gC1)"/></mask>
    <linearGradient id="gC1" gradientUnits="userSpaceOnUse" x1="609.8" y1="314" x2="520" y2="410">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
    <radialGradient id="gTop" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FB2629" stop-opacity=".07"/>
      <stop offset="1" stop-color="#FB2629" stop-opacity="0"/></radialGradient>
    <clipPath id="cTop"><rect x="400" y="64" width="152" height="200"/></clipPath>
  </defs>

  <!-- 1. glows -->
  <ellipse cx="530" cy="160" rx="80" ry="85" fill="url(#gTop)" clip-path="url(#cTop)"/>
  <circle cx="877.4" cy="730.6" r="215.8" fill="url(#gArcGlow)" mask="url(#mArc)"/>

  <g fill="none" stroke-width="1" vector-effect="non-scaling-stroke" class="guides">
    <!-- 2. guides -->
    <line x1="105.5" y1="184" x2="105.5" y2="410" stroke="url(#gV1)"/>
    <line x1="198.5" y1="96"  x2="198.5" y2="690" stroke="url(#gV2)"/>
    <line x1="550"   y1="362" x2="550"   y2="750" stroke="url(#gV3b)"/>
    <line x1="626.5" y1="232" x2="626.5" y2="430" stroke="url(#gV4)"/>
    <line x1="725"   y1="384" x2="725"   y2="722" stroke="url(#gV5)"/>
    <line x1="24"  y1="325.5" x2="515" y2="325.5" stroke="url(#gH2)"/>
    <line x1="360" y1="395.5" x2="640" y2="395.5" stroke="url(#gH3)"/>
    <line x1="13"  y1="500.5" x2="690" y2="500.5" stroke="url(#gH4)"/>
    <line x1="576" y1="619"   x2="740" y2="619"   stroke="url(#gH5)"/>
    <line x1="715.6" y1="416" x2="779" y2="535" stroke="url(#gD1)"/>
    <!-- faint tangents/grid, α .10 -->
    <path d="M269 448V485M676 296V480M375 353V414M411 392V505M446 664H497M235 485H350M220 522H275M633 583H681" stroke="#111" stroke-opacity=".1"/>
    <!-- circles -->
    <circle cx="471.5" cy="462.3" r="202.8" stroke="#111" stroke-opacity=".13" mask="url(#mC1)"/>
    <path d="M260.4 296.4A173.7 173.7 0 0 1 560.1 270.2" stroke="#111" stroke-opacity=".16"/>
  </g>
</svg>
<!-- glyph layers go here (HTML) -->
<svg class="art__svg art__svg--top" viewBox="0 64 900 672" aria-hidden="true">
  <path d="M663.7 700.6A215.8 215.8 0 0 1 869.9 514.9" fill="none" stroke="url(#gArc)" stroke-width="1.25" vector-effect="non-scaling-stroke"/>
  <line x1="550" y1="140" x2="550" y2="362" stroke="url(#gCross)" vector-effect="non-scaling-stroke"/>
  <line x1="470" y1="255" x2="612" y2="255" stroke="url(#gCrossH)" vector-effect="non-scaling-stroke"/>
  <circle cx="220.3" cy="170.2" r="8.4" fill="#000"/>
  <circle class="red-dot" cx="549.8" cy="254.7" r="6.5" fill="#F90406" style="filter:drop-shadow(0 0 5px rgba(251,38,41,.55))"/>
</svg>
```
The gradient ids must be unique per document. Put `<defs>` in the first SVG and reference them from the second; that works within the same HTML document.

### 6.3 "Aa" CSS (inside `.menu__art`, 1 cqw = 9 px at design size)

```css
.menu__art { position:absolute; left:0; top:calc(64/857*100vh); width:56.25vw; aspect-ratio:900/672;
             container-type:inline-size; pointer-events:none; }
.art__svg  { position:absolute; inset:0; width:100%; height:100%; overflow:visible; }
.art__aa   { position:absolute; left:calc(125/900*100%); top:calc((288 - 64)/672*100%); /* A cap top */ }
.aa {
  position:absolute; left:0; top:0; display:block; white-space:nowrap;
  font: 500 50.67cqw/1 "Helvetica Neue", "HelveticaNeue", Helvetica, "Inter", Arial, sans-serif;   /* 456px */
  letter-spacing:-0.07em;
  /* align cap-top to the box top; with Inter metrics, shift up by (ascender - capHeight) */
  translate: 0 -0.24em;                     /* (est.) tune per resolved font; Chrome 133+: text-box: trim-both cap alphabetic */
}
.aa .aa__a, .aa > span { font-size:.93em; letter-spacing:0; }
.aa--crisp .aa__A { background:var(--aa-A); -webkit-background-clip:text; background-clip:text; color:transparent; }
.aa--crisp .aa__a { background:var(--aa-a); -webkit-background-clip:text; background-clip:text; color:transparent; }
.aa--crisp {   /* feet dissolve: opaque to 75 % of the 334 px glyph box, gone by 99 % */
  -webkit-mask-image: linear-gradient(180deg,#000 0,#000 74%,rgba(0,0,0,.8) 81%,rgba(0,0,0,.45) 87%,rgba(0,0,0,.2) 93%,transparent 99%);
          mask-image: linear-gradient(180deg,#000 0,#000 74%,rgba(0,0,0,.8) 81%,rgba(0,0,0,.45) 87%,rgba(0,0,0,.2) 93%,transparent 99%);
}
.aa--glow {
  color:#FB2629; filter: blur(4.9cqw);          /* 44px σ @ design size */
  opacity:.9; translate:-1.1cqw .7cqw;          /* -10px, +6px: glow leans left/down */
  -webkit-mask-image: linear-gradient(180deg, transparent 0 32%, #000 62%);
          mask-image: linear-gradient(180deg, transparent 0 32%, #000 62%);
}
.menu__art::before {          /* G-left bloom */
  content:""; position:absolute; inset:0;
  background: radial-gradient(14.4% 16.4% at 16.7% 67.9%, rgba(251,38,41,.22), transparent 70%);
}
```
- **Mask height:** the mask percentages assume the span box ≈ the glyph box (288 → 622). If the resolved font's line box is taller, express the stops in `em`: 0.74 em of the cap is ≈ y 542.
- **Exactness fallback:** if fidelity across fonts matters more than live text, outline "Aa" from Inter 500 (OFL) to `<path>`s in the SVG. Use `fill:url(#gA)` and `filter: feGaussianBlur stdDeviation=44` for the glow, plus a `<mask>` for the dissolve. The coordinates stay the same.
- **Blur cost:** the glow layer is static, so add `will-change: opacity` only while it animates. At the design size a 44 px CSS blur on an ~550 × 340 element is cheap.

### 6.4 Labels and swatches CSS (summary)

```css
.art__typo    { position:absolute; left:15.44%; top:calc((227-64-2)/672*100%); }  /* -2 ≈ half-leading at lh 1 */
.art__typo .lbl { font:500 1.222cqw/1 Figtree; letter-spacing:.18em; color:#868686; }
.art__typo .val { font:500 1.778cqw/1 Figtree; letter-spacing:-.02em; color:#111; margin-top:1.2cqw; }
.art__typo .rule{ display:block; width:3.11cqw; height:1px; background:#555; margin-top:2.3cqw; }
.art__palette { position:absolute; left:70.89%; top:calc((256-64-2)/672*100%); }
.art__palette .lbl { font:500 1.222cqw/1 Figtree; letter-spacing:.2em; color:#858585; }
.art__palette ul { display:flex; gap:calc(6.63cqw - 3.78cqw); margin-top:2.0cqw; }   /* centres 59.7px apart */
.art__palette b  { display:block; width:3.78cqw; aspect-ratio:1; border-radius:50%; background:var(--c);
                   box-shadow:0 0 0 .22cqw #FEFEFE, 0 0 0 .39cqw var(--c); }
.art__palette li:last-child b { width:4.44cqw; box-shadow:none; background:#ECECEC; }
.art__palette span { display:block; font:700 1cqw/1 Figtree; letter-spacing:.02em; color:#222; text-align:center; margin-top:1.4cqw; }
.art__palette .rule { display:block; width:3.89cqw; height:1.5px; background:#1A1A1A; margin-top:3cqw; }
.art__index { position:absolute; left:84.11%; top:calc((614-64-2)/672*100%); display:flex; align-items:center; gap:2cqw;
              font:400 1.556cqw/1 Figtree; color:#5E5E5E; font-variant-numeric:tabular-nums; }
.art__index i { width:2.89cqw; height:1px; background:#8F8F8F; }
```
Tune the vertical margins against `menu-art-reference.png`. The targets are cap tops of Helvetica Neue at 249, swatch centres at 303, hex caps at 336, and the rule at 370.5.

---

## 7. Motion: open and close choreography

Motion tokens follow the reference site's Framer values:

```css
:root{
  --spring: linear(0, 0.097, 0.298, 0.514, 0.7, 0.839, 0.933, 0.989, 1.017, 1.027, 1.028, 1.023, 1.017, 1.011, 1.006, 1.003, 1.001, 1, 1); /* k400 c30 m1, 450ms */
  --spring-dur: 450ms;                                   /* fallback: cubic-bezier(.22,1,.36,1) 600ms */
  --ease-out-expo: cubic-bezier(.16,1,.3,1);
  --ease-in-out-quart: cubic-bezier(.76,0,.24,1);
  --ease-framer: cubic-bezier(.44,0,.56,1);              /* reference tween, 300ms */
  --ease-in: cubic-bezier(.55,0,1,.45);
}
```

### 7.1 Open timeline (t = 0 at the click; interactive at ~450 ms, settled by ~1.25 s)

| t (ms) | Target | From → to | Duration / easing |
|---|---|---|---|
| 0 | `.menu` overlay | `clip-path: circle(0 at 92.2% 7%)` → `circle(150vmax at 92.2% 7%)`. The origin is the trigger/X centre (1475, 60). The far corner is 1676 px away. | 700 ms `--ease-in-out-quart` |
| 0 | Page behind | `scale 1 → .985`, `filter: brightness(1 → .96)` (optional) | 700 ms same |
| 80 | Trigger → X | The two burger bars rotate 0 → ±45° and translate to the centre. The 30 px X lines draw. | 450 ms `--spring` |
| 200 + 50·i | Guides (H2, V1, V2, H4, V3b, V4, V5, H3, H5, D1) | Draw: `stroke-dasharray:1; pathLength=1; stroke-dashoffset 1 → 0` | 900 ms `cubic-bezier(.65,0,.35,1)` |
| 260 | Tagline | opacity 0.001 → 1, y 10 → 0 | 500 ms `--ease-out-expo` |
| 280 + 60·i (i = 0…6) | Menu items | Inner `.txt` translateY(**105 %** → 0) inside `.mask{overflow:hidden; padding-bottom:.06em}`; opacity 0.001 → 1 | `--spring-dur` with `--spring` (last item starts at 640 and settles ~1090) |
| 300 | C1 + C2 | Circle draws from −90°, a dash reveal | 1200 ms `--ease-out-expo` |
| 320 | CTA pill | opacity 0 → 1, y 10 → 0. The border could also draw via `clip-path: inset(0 100% 0 0 round 999px)` → `inset(0 0 0 0 round 999px)`. | 500 ms `--ease-out-expo` |
| 320 | **Aa crisp** | opacity 0 → 1, `scale 1.04 → 1` (origin 30 % 80 %), `translateY 24px → 0`, `filter: blur(10px) → blur(0)` | 900 ms `--ease-out-expo` |
| 450 | Aa glow | opacity 0 → .9 | 1200 ms `ease-out` |
| 450 | C3 arc | Stroke draw from the top end (−92°) to −172° | 1000 ms `cubic-bezier(.65,0,.35,1)` |
| 600 | Black dot | scale 0 → 1 | spring with bounce .2, 400 ms ≈ `cubic-bezier(.34,1.56,.64,1)` 400 ms |
| 650 | Red dot | scale 0 → 1, then the halo pulse starts | same pop. Pulse: `drop-shadow` blur 5 → 10 px, alpha .55 → .2, 2400 ms `ease-in-out` infinite alternate |
| 600–700 | Typography block, palette label | opacity 0 → 1, y 8 → 0 | 500 ms `--ease-out-expo`, stagger 50 |
| 700 + 50·i | Swatches | scale .4 → 1, opacity 0 → 1 | `--spring` 450 ms |
| 750 | Rules | `scaleX 0 → 1` (origin left) | 500 ms `--ease-out-expo` |
| 800 | Arc inner glow, G-top | opacity 0 → 1 | 800 ms ease-out |
| 850 | "01 —" | Digit rolls up (y 100 % → 0); dash scaleX 0 → 1 | 400 ms `--ease-out-expo` |
| 600 + 40·i | Footer links (5) | opacity 0 → 1, y 10 → 0 | 500 ms `--ease-out-expo` |

### 7.2 Close (≈ 650 ms; interruptible by reversing a GSAP or WAAPI timeline)

| t | Target | Change | Duration / easing |
|---|---|---|---|
| 0 | Menu items, last to first, stagger 25 ms | `.txt` translateY 0 → −40 %, opacity → 0 | 260 ms `--ease-in` |
| 0 | Art panel (whole) | opacity → 0, `scale → .98` | 300 ms `--ease-in` |
| 0 | Header, footer | opacity → 0 | 200 ms `--ease-framer` |
| 0 | X → burger | Reverse morph | 350 ms `--spring` |
| 120 | Overlay | `clip-path` back to `circle(0 at 92.2% 7%)` | 550 ms `--ease-in-out-quart` |
| 670 | — | `hidden`, unlock scroll, return focus to the trigger | — |

### 7.3 Reduced motion
`@media (prefers-reduced-motion: reduce)`:
- Overlay opacity 0 → 1 over 200 ms linear.
- All children appear at once.
- No clip-path, transforms or blur transitions.
- The red-dot pulse is disabled.
- Guides render fully drawn.

---

## 8. Interaction states (palette-consistent)

| Element | Hover / focus | Active / current |
|---|---|---|
| Menu item | Colour `#111` → **`#FB2629`** (250 ms ease). `translateX(0 → 14px)` (450 ms `--ease-out-expo`). A **10 px red dot** (`#FB2629`) scales 0 → 1 at `left:-26px`, vertically centred on the cap middle (≈ 0.35 em above the baseline). Siblings dim: `ol:hover li:not(:hover) a { opacity:.28 }` (300 ms). **Art tie-in:** the "01" marker rolls to the hovered index (01–07), with the old digit going y 0 → −100 % and the new one 100 % → 0 over 350 ms `--ease-out-expo`. The Aa glow opacity goes .9 → 1. | `aria-current="page"`: colour `#FB2629` and a permanent dot. `:active` scale .985 for 100 ms. |
| Focus-visible (all links and buttons) | `outline:2px solid #FB2629; outline-offset:6px; border-radius:4px` | — |
| CTA pill | Background → `#FB2629`, border → `#FB2629`, text → `#FFF` (300 ms `--ease-out-expo`). Arrow `translate(3px,-3px)`. | `scale .97` |
| Close X | `rotate(90deg)` 450 ms `--ease-out-expo`; stroke → `#FB2629` | — |
| Footer links | Colour → `#FB2629`. A 1 px underline grows from the left via `background-size:0 1px → 100% 1px`, 300 ms `--ease-out-expo`. | — |

---

## 9. Responsive behaviour

The breakpoints match the Framer reference: desktop ≥ 1200, tablet 810–1199.98, phone ≤ 809.98.

### 9.1 Desktop ≥ 1200 (design above)
- Everything scales with `vw` and `cqw`.
- Art panel `width:56.25vw`, `top: 7.5vh`. If the viewport is short (`max-height: 760px`), scale the art by height instead: `width:min(56.25vw, 133.9vh * .85)`.
- Menu `left:60vw`, font `clamp(34px,3vw,60px)`.
- At 1200 px wide the menu font is 36 px, and "WHAT WE CREATE" is ≈ 306 px wide inside a 360 px column (60 vw → 93 vw).
- Gutters 7 vw (min 40 px).

### 9.2 Tablet 810–1199
- **Landscape (≥ 1024 wide or `orientation:landscape`):**
  - Keep two columns. Art `width:50vw; top:12vh`, menu `left:54vw`, font `clamp(36px,4.2vw,48px)`.
  - Hide the hex labels and the "Typography/Helvetica Neue" block when the panel is narrower than 560 px (`@container (width < 560px)`). Keep the swatches, Aa, guides, dots and arc.
  - Tagline hidden below 960 px.
- **Portrait (810–1023, e.g. 820 × 1180):** stack the layout.
  - Header 88 px tall: CTA 48 px high, X 28 px.
  - Menu block first: `padding: 120px 7vw 0`, font `clamp(44px,6.2vw,56px)`, pitch 1.35 em.
  - Art panel below it: `width:86vw; margin-left:-4vw` (bleeds left), max-height 46 vh, aspect ratio kept. Labels as in landscape.
  - Footer links after the art, in two columns, `bottom: 32px`.
- Motion is the same as desktop. Reduce the guide stagger to 35 ms.

### 9.3 Phone ≤ 809 (design reference 390 × 844)
- **Header:** height 72 px, `padding:0 20px`. Tagline hidden. CTA becomes compact: height 40 px, `padding:0 16px`, 14 px/500, arrow 9 px, gap 10 px. X is 24 px (stroke 2 px) in a 44 × 44 hit area, 20 px from the right.
- **Menu items:**
  - `padding-top: 96px; padding-inline: 20px`.
  - Font `clamp(30px, 9.2vw, 40px)` (36 px at 390), weight 400, letter-spacing −0.01 em, line-height 1.05, pitch **1.32 em**. Seven items take ≈ 333 px.
  - Hover dot becomes the active indicator: 8 px, `left:-16px` (inside the gutter). Dimming is off on touch.
- **Art (collapsed band):**
  - Placed after the menu: `width:100vw; height:clamp(200px, 32vh, 280px); margin-top:24px`.
  - Uses the same SVG and layers, re-framed on the core composition: `viewBox="100 184 620 500"` (A, a, C1, crosshair, red and black dots, D1, start of the arc). The Aa container uses the same `cqw` maths against a 620-unit-wide frame.
  - **Hide:** Typography block, palette block, "01 —", faint grid H6/V6/V7.
  - Glow blur scales automatically (4.9 cqw). Clamp it with `max(18px, 4.9cqw)` so it still reads at small sizes.
- **Footer:** two columns (`grid-template-columns:1fr 1fr; gap:24px`), 14 px/500, line-height 1.6, `padding: 16px 20px calc(20px + env(safe-area-inset-bottom))`.
- **Short screens:**
  - `@media (max-height: 720px)`: art band height 160 px, or hide it entirely below 640 px tall.
  - The overlay itself is `overflow-y:auto; overscroll-behavior:contain` as a safety net.
- **Motion on phone:**
  - Overlay reveal: `clip-path: inset(0 0 100% 0)` → `inset(0)` (a top-down curtain, 600 ms `--ease-in-out-quart`). A circle from a small corner trigger looks thin on tall screens.
  - Items stagger 45 ms, y offset 105 %.
  - Art fades and scales 1.04 → 1 over 700 ms, starting at 350 ms.
  - Guides draw over 700 ms.

---

## 10. Behaviour and accessibility checklist
- The trigger button has `aria-expanded`/`aria-controls="site-menu"`. On open: set `hidden=false` and `data-state="open"`, lock body scroll (`overflow:hidden`; `scrollbar-gutter:stable` on `html` to avoid layout shift), and focus the first menu link after 280 ms.
- Trap focus inside the dialog. **Esc** closes. Clicking a menu link closes the menu, then navigates; for same-page anchors, close first and scroll after 300 ms.
- The art panel is `aria-hidden="true"` and its labels are not focusable.
- Contrast: `#111` on `#FEFEFE` is 18.9 : 1. `#FB2629` hover text on white is 3.9 : 1, which is AA only for large text; menu items at ≥ 30 px qualify. The `#868686` labels (3.6 : 1) are decorative.
- `font-display: swap` for Figtree. Preload the 400/500 woff2 so the first menu open does not flash the fallback.
- **Performance:** animate only `transform`, `opacity`, `clip-path` and stroke-dashoffset. Set `will-change` only during the timeline. Keep the overlay out of the render tree while closed (`hidden` / `content-visibility:hidden`).

---

## 11. Verification targets (side-by-side with `menu-art-reference.png`)
Render the overlay at 1600 × 857 and diff it against `_ref/images/3.png`. These must line up to ±2 px:

| Check | Target |
|---|---|
| Menu baselines | 241.5 / 318.8 / 396.8 / 474.2 / 551.8 / 627.1 / 701.1, left ink ≈ 960 |
| Top bar | Tagline ink 672–921, baseline 65.5. CTA box 1198.5–1391.5 × 31–85. X box 1461–1489 × 45–75. |
| Aa | A apex top y 288, apex centre x 296.5. 'a' stem right x 628, 'a' top y 392. |
| Dots | Black dot (220.3, 170.2) Ø 17. Red dot (549.8, 254.7) Ø 13. |
| Circles | C1 (471.5, 462.3) r 202.8. C2 (417.8, 369.8) r 173.7. C3 (877.4, 730.6) r 215.8. |
| Swatches | Centres y 303, x 657.4 / 716.5 / 776.5 / 836.5 |
| Footer | First baselines 755.5 (x 113) and 754.5 (x 382) |

---

## Critic additions

### A. Breakpoint statement in §9 is wrong
§9 says "desktop ≥ 1200, tablet 810–1199.98, phone ≤ 809.98" match the Framer reference. The reference uses **1440 / 800–1439.98 / ≤ 799.98** (`#__framer__breakpoints`, verified), and so do the project tokens.
- **Phone layout (§9.3)**: use it at **≤ 799.98**.
- **Desktop composition (§9.1)**: keep the `vw`-scaled layout from **≥ 1024** (it reads well down to 1024: menu font 34 px, art 576 px wide).
- **Landscape / portrait tablet rules (§9.2)**: apply them only to 800–1023.

### B. The trigger and the X are in different places (§7.1 "burger morphs into X" and the `circle(… at 92.2% 7%)` origin)
- **Where the trigger is.** The menu is opened from the toggle inside the header pill (`chrome.py`, `.nav-toggle`, 32 × 32, last item of the pill). Measured from the build CSS (pill 800 px, 8 px padding):
  - **(1096, 40)** at 1440 × 900, i.e. 76.1 % / 4.4 vh;
  - (888, 40) at 1024;
  - (358, 32) at 390.
- **Where the X is.** Image 3's X sits at 92.2 % / 7 vh, which is (1327, 63) at 1440 × 900.
- **Consequences:**
  - The bars cannot morph in place into the image-3 X.
  - A clip circle centred at 92.2 % 7 % does not grow from the control the user clicked.
- **Fix:**
  - **Origin.** On open, read `toggle.getBoundingClientRect()` and set `--ox/--oy` to its centre. Animate `clip-path: circle(0 at var(--ox) var(--oy))` → `circle(var(--R) at …)`. `--R = Math.hypot(Math.max(ox, innerWidth − ox), Math.max(oy, innerHeight − oy))`, which is 1393 px at 1440 × 900 from (1096, 40).
  - **The two X shapes.**
    - The header toggle's bars rotate to an X at t = 80 ms (§7.1). The overlay (z above the header) then covers it.
    - The menu's own X (image 3 position) draws in at t = 200 ms: two 30 px strokes, `pathLength=1`, dashoffset 1 → 0, 300 ms `--ease-out-expo`, the second stroke delayed 60 ms.
  - **Close.** The close sequence is reversed. Focus returns to the header toggle.
  - **Phone.** The phone curtain (`inset(0 0 100% 0)` → `inset(0)`) needs no origin.

### C. Content conflicts in this design (need a decision; PLAN priority 2 says the doc wins on copy)
| Slot | Image 3 | Master doc | Recommendation |
|---|---|---|---|
| Top-bar tagline | "Creativity meets functionality." | Tagline: "**Build beyond the ordinary.**" | Use the doc tagline. It is 226 px vs 261 px at Figtree 500 20 px (advance widths), so it stays centred and shorter |
| Social links | Instagram · LinkedIn · Behance | Instagram · LinkedIn · Email | Use the doc set. Real URLs and the address are still missing |
| Art label "Typography / Helvetica Neue" | names Helvetica Neue | n/a | The site renders Geist (Figtree in the menu), so the label is factually wrong for the site. Change it to "Geist", or keep it as pure art (it is `aria-hidden`). Owner's call |
| Swatch hex labels | #000000 / #FF5A37 / #FB2629 / #F6F6F6 under fills #000 / #970102 / #D20104 / #ECECEC | n/a | §3.9 Option A. Make the labels match the fills (#000000 / #970102 / #D20104 / #ECECEC) so the art does not show wrong hex codes. Note that `00-tokens.css` has `--red-deep:#a3060a`, which is neither value; sampled range #920202–#A20002, recommended #970102 |

### D. Glyph coverage
`figtree-latin.woff2` (the project copy) has no ↗ or → (U+2197/2192 are missing; checked with fontTools). §6.1 already uses an inline SVG arrow. Keep it that way for every arrow in the overlay.
