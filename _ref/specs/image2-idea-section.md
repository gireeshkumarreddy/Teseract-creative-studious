# Image 2 — "The Idea" section (sits directly after the hero)

Source: `WD/_ref/images/2.webp`, 1600 × 1999 px (≈ 4:5; likely a 1080 × 1350 design upscaled ×1.481).
Copy source: `_ref/doc/master.txt` → section **THE IDEA** ("YOUR BUSINESS IS UNIQUE. YOUR WEBSITE SHOULD BE TOO." + the two body paragraphs).
All coordinates below are **image px at 1600 width**, then `%W` (÷1600) / `%H` (÷1999). `cqw` = px ÷ 16 (1 cqw = 1 % of a 1600-wide artboard). Values are measured unless marked *(est.)*.
Regeneration scripts: `WD/_work/img2/{lines.py, extract.py, screen.py, screen2.py, screen_assets.py}` (run with `python -I` from WD).

---

## 0. Summary

| Item | Value |
|---|---|
| Background | `#FEFEFE` (rgb 254,254,254; flat, no gradient/noise) |
| Text colour (all text) | `#0A0A0A` (headline stroke core samples `#070707`; thin strokes render ≈ `#303030`) |
| Strings | 1 px neutral grey lines, `#8C8C8C`-ish, radiating from one pinch point, drawn **behind** the hand, the headline and the laptop |
| Pinch point (line origin) | **(281.95, 571.88)** = 17.622 %W / 28.608 %H — LSQ intersection of 8 fitted lines, every line within ±1.2 px |
| Layer order (bottom→top) | bg → strings + dots (SVG) → hand PNG / laptop PNG → headline & all text |
| Typeface look | Neo-grotesk with large x-height (x/cap = 0.755), tight tracking. Helvetica Neue Light 300 matches stems; in-project **Geist** variable matches proportions well (recommended) |

---

## 1. Element boxes (ink bounding boxes)

| Element | x0–x1 | y0–y1 | %W (x0–x1) | %H (y0–y1) |
|---|---|---|---|---|
| Top-right label (2 lines, right-aligned) | 1363–1555 | 48–91 | 85.19–97.19 | 2.40–4.55 |
| Headline line 1 "Your business is unique." | 62–1381 | 136 (asc) / 139.4 (cap) – 269 (desc) | 3.88–86.31 | 6.80–13.46 |
| Headline line 2 "Your website should be too." | 63–1545 | 266 (asc) / 268.3 (cap) – 368 | 3.94–96.56 | 13.31–18.41 |
| Hand (crop `idea-hand.png`) | 0–354 | 400–703 | 0–22.13 | 20.01–35.17 |
| Label "STRATEGY / AND DESIGN" (text) | 471–583 | 425–462 | 29.44–36.44 | 21.26–23.11 |
| Label "UX DESIGN" | 711–798 | 596–609 | 44.44–49.88 | 29.81–30.47 |
| Label "UI DESIGN" | 1208–1287 | 754–766 | 75.50–80.44 | 37.72–38.32 |
| Label "TECHNOLOGY / AND STORYTELLING" | 307–491 | 803–841 | 19.19–30.69 | 40.17–42.07 |
| Body ¶1 (5 lines) | 66–510 | 1014–1190 | 4.13–31.88 | 50.73–59.53 |
| Body ¶2 (5 lines) | 66–428 | 1239–1419 | 4.13–26.75 | 61.98–70.99 |
| Laptop + stones (crop `idea-laptop.png`) | 165–1600 (bleeds right) | 868–1999 (bleeds bottom) | 10.31–100 | 43.42–100 |
| Laptop lid outer (black) | 587–1491 | 873 (top) – ≈1490 | 36.69–93.19 | 43.67–74.5 |
| Laptop screen display quad | see §4 | 887.9–1485.1 | 37.49–92.22 | 44.42–74.29 |
| Laptop deck (aluminium) left tip | x≈299 @ y≈1565 | | 18.7 | 78.3 |

Margins: headline ink left 62 px (3.88 %W), right 55 px; body left 66 px; top-label right margin 45 px (2.81 %W); label cap-top 49 px from top.

---

## 2. Typography (measured at 1600 px)

Cap heights measured on flat glyphs (T, E, D, I, Y stems) with a 50 % threshold. Font size = cap ÷ 0.714 (Helvetica Neue) or ÷ 0.71 (Geist); both give the same px within 1 %.

| Style | Cap h | Font-size @1600 | cqw | Line pitch → line-height | Tracking (Geist) | Tracking (Helvetica/Arial metrics) | Weight |
|---|---|---|---|---|---|---|---|
| Headline | 99.2 px (x-height 74.9, asc 101.6, desc 30.4) | **139.5 px** | **8.72cqw** | 129 px → **0.925** | **−0.068 em** (line 1 fits −0.062, line 2 −0.076) | −0.057 em (−0.055 / −0.059) | Light. Stem 8.5 px = 0.061 em → HN Light 300 / **Geist wght ≈ 260** |
| Body ¶ | 21.5 px | **30.4 px** | **1.90cqw** | 38.4 (¶1) / 37.75 (¶2) → **38 px = 1.25** | **−0.08 em** (fits −0.067…−0.092) | −0.06 em | Light. Stem 1.9 px → Geist 280–300 |
| Top label "TESSERACT / CREATIVE STUDIOS" | 17.5 px | **24.4 px** | **1.53cqw** | 25 px → **1.02** | **−0.083 em** @wght 400 (both lines agree: −0.083/−0.083) | ≈ −0.11 em | Regular 400 (stem 2.0 px) |
| Dot labels, 2-line (STRATEGY…, TECHNOLOGY…) | 15 px | **21 px** | **1.31cqw** | 22 px → **1.05** | **−0.045 em** (−0.041…−0.06) | — | Regular 400 (stem 1.6–1.9 px) |
| Dot labels, 1-line (UX DESIGN, UI DESIGN) | 13 px | **18.3 px** | **1.14cqw** | single line | **−0.035 em** | — | Regular 400–450 |

All uppercase labels are typed uppercase (`text-transform: uppercase` fine). No italics, no underline.
Recommendation: unify the dot labels to **19.5 px (1.22cqw), line-height 22 px (1.13), −0.04 em, Geist 400** unless pixel-matching the image; the size difference in the image reads as unintentional.

Font stacks: `font-family: Geist, "Helvetica Neue", Helvetica, Arial, sans-serif;` Headline `font-variation-settings:"wght" 260` (or `font-weight: 260`), body `font-weight: 300`, labels `400`.

### Baselines / cap-tops (use these to align; CSS box tops computed for Geist metrics asc 1.005 / desc 0.295)

| Line | Cap-top y | Baseline y | CSS block top (Geist) |
|---|---|---|---|
| Top label 1 / 2 | 48.3 / 73.8 | 65.7 / 91.0 | **44.5 px (2.78cqw)**, right edge 1555 (right: 2.81cqw) |
| Headline 1 / 2 | 139.4 / 268.3 | 238.6 / 367.6 | **≈124 px (7.75cqw)** (HN metrics: 123); left ≈ 60 px (3.75cqw) (ink 62) |
| Strategy label 1 / 2 | 425 / 447 | 439.5 / 461.5 | top 421, left 470 |
| UX label | 596 | 608.5 | top 591, left 710 |
| UI label | 754 | 766 | top 748.5, left 1207 |
| Technology label 1 / 2 | 803 / 825 | 817.5 / 840 | top 799, left 306 |
| Body ¶1 lines | 1014…1168 | 1035.7, 1074.1, 1112.5, 1150.9, 1189.3 | **top ≈ 1006 px (62.9cqw)**, left 64 px (4.0cqw) |
| Body ¶2 lines | 1239…1390 | 1260.3, 1298.3, 1336.3, 1374.3, 1412.3 | ¶ gap = 71 px baseline-to-baseline − 38 = **margin-top 32–33 px (2.04cqw ≈ 1.07em)** |

### Body copy line breaks (exactly as image)
¶1 (each sentence starts on a new line; max ink width 444 px → `max-width: 460px / 28.75cqw`):
```
You don’t need another template.
You don’t need a website that looks
like everyone else’s.
You need something that feels like you.
That’s what we build.
```
¶2 (natural wrap at a narrower measure: widest line 362 px, next word would overflow at ≈410 → `max-width: 400px / 25cqw`):
```
We combine strategy, design,
technology, interaction and
storytelling to create websites
and digital experiences made
specifically for your brand.
```
Typographic apostrophes (’) are used in the image.

> Brand spelling flag: the image label reads **"TESSERACT"**; the user's logo is spelled **"TESERACT CREATIVE STUDIOS"**. Use the logo spelling unless told otherwise.

---

## 3. Strings, dots and labels (the "idea diagram")

All lines are straight, 1 px, start at the pinch point **P = (281.95, 571.88)** and pass *behind* the fingers (they are hidden where they cross the index/middle finger), *behind* the headline glyphs (black strokes are not lightened where line A crosses "Your"/"website"), and line E disappears *behind* the laptop lid.

Profile: each line renders as a ~2 px anti-aliased stroke with peak value ≈ #C8C8C8–#CBCBCB on #FEFEFE (integrated "ink" listed below). Equivalent crisp 1 px stroke colour = 254 − ink.

| Id | Ends at (x, y) | %W, %H | Length px | Angle (° from +x, y down) | Ink | 1 px stroke colour | ≈ opacity of #0A0A0A | End marker |
|---|---|---|---|---|---|---|---|---|
| A (up, through headline) | (427.5, 50.5) | 26.719, 2.526 | 541.3 | −74.40 | 68 | `#BABABA` | 0.28 | grey dot Ø4 px `#AFAFAF` (top of line at y 47) |
| B → STRATEGY AND DESIGN | (461.0, 434.5) | 28.812, 21.736 | 225.7 | −37.50 | 117 | `#898989` | 0.48 | black dot Ø5 px |
| B2 faint twin of B | fades out at r ≈ 150–175 px (≈ (420, 476)) | — | ~165 | −34.7 | ~35 | `#DCDCDC` → 0 | 0.15→0 | none (linear fade) *(est.)* |
| C → UX DESIGN | (699.9, 601.4) | 43.744, 30.085 | 419.0 | +4.04 | 104 | `#969696` | 0.43 | black dot Ø5 px |
| D → UI DESIGN | (1196.0, 759.2) | 74.750, 37.979 | 933.1 | +11.58 | 113 | `#8D8D8D` | 0.46 | black dot Ø5 px |
| E → behind laptop | (892.7, 874.0) = lid top edge | 55.794, 43.722 | 681.4 | +26.32 | 76 | `#B2B2B2` | 0.31 | none (tucks under lid) |
| F → unlabeled dot | (187.2, 740.8) | 11.700, 37.059 | 193.7 | +119.29 | 156 | `#626262` | 0.64 | black dot Ø5 px (darkest line) |
| G → TECHNOLOGY AND STORYTELLING | (298.7, 792.7) | 18.669, 39.655 | 221.5 | +85.66 | 112 | `#8E8E8E` | 0.46 | tiny grey dot Ø2.5 px `#7A7A7A` |
| H → straight down | (281.0, 959.5) | 17.562, 47.999 | 387.6 | +90.14 | 123 | `#838383` | 0.50 | tiny grey dot Ø2 px `#828282` |

Simplified 3-token palette if preferred: `--string: #8C8C8C` (B, C, D, G, H), `--string-far: #B4B4B4` (A, E), `--string-strong: #626262` (F). Dots `#0A0A0A`, r = 2.5 px @1600 (0.156cqw).

Label ↔ dot relation: dot centre sits **≈ 10–12 px left of the text's first glyph** (gap dot-edge→text ≈ 8 px ≈ 0.4 em) and is vertically centred on the first line's cap-height (STRATEGY dot is 2 px low). Exception: TECHNOLOGY's line G ends at the label's **top-left corner** (dot 8 px left, 10 px above cap-top).

SVG skeleton (same coordinate system as the image; place over a 1600:1999 artboard, `preserveAspectRatio="none"` not needed because the artboard keeps the aspect):
```html
<svg class="idea-strings" viewBox="0 0 1600 1999" aria-hidden="true">
  <g fill="none" stroke-width="1" vector-effect="non-scaling-stroke" stroke-linecap="round">
    <line x1="281.95" y1="571.88" x2="427.5"  y2="50.5"  stroke="#BABABA"/>
    <line x1="281.95" y1="571.88" x2="461"    y2="434.5" stroke="#898989"/>
    <line x1="281.95" y1="571.88" x2="417.6"  y2="478"   stroke="url(#fadeB2)"/>
    <line x1="281.95" y1="571.88" x2="699.9"  y2="601.4" stroke="#969696"/>
    <line x1="281.95" y1="571.88" x2="1196"   y2="759.2" stroke="#8D8D8D"/>
    <line x1="281.95" y1="571.88" x2="892.7"  y2="874"   stroke="#B2B2B2"/>
    <line x1="281.95" y1="571.88" x2="187.2"  y2="740.8" stroke="#626262"/>
    <line x1="281.95" y1="571.88" x2="298.7"  y2="792.7" stroke="#8E8E8E"/>
    <line x1="281.95" y1="571.88" x2="281"    y2="959.5" stroke="#838383"/>
  </g>
  <g fill="#0A0A0A">
    <circle cx="461" cy="434.5" r="2.5"/><circle cx="699.9" cy="601.4" r="2.5"/>
    <circle cx="1196" cy="759.2" r="2.5"/><circle cx="187.2" cy="740.8" r="2.5"/>
  </g>
  <circle cx="427.5" cy="50.5" r="2" fill="#AFAFAF"/>
  <circle cx="298.7" cy="792.7" r="1.25" fill="#7A7A7A"/>
  <circle cx="281" cy="959.5" r="1" fill="#828282"/>
</svg>
```
(`vector-effect` keeps strokes 1 CSS px at any scale. Line E may be drawn longer — the laptop PNG covers its end.)

---

## 4. Extracted assets (`WD/_ref/extracted/`)

| File | Source box (x0,y0,x1,y1) | Size px | Notes |
|---|---|---|---|
| `idea-hand.png` / `.webp` (q90) | (0, 400, 354, 703) | **354 × 303** | Transparent bg; opaque bbox (0,1)–(352,301). Cuff exits the **left edge** (crop rows 185–300 = src y 585–700) → anchor `left:0`. Pinch point in crop = **(281.95, 171.88) = 79.65 % / 56.73 %**. |
| `idea-laptop.png` / `.webp` (q90) | (165, 868, 1600, 1999) | **1435 × 1131** | Laptop + stones, transparent above/around. Stones flush with crop **bottom** (x 79–1434 at last row) and **right** edge (rows 766–1130). Original website still on screen. |
| `idea-laptop-blank.png` / `.webp` | same | 1435 × 1131 | Screen filled `#111111` (window grown 2 px into the bezel so no light seam), notch kept black. |
| `idea-laptop-frame.png` / `.webp` | same | 1435 × 1131 | Screen area **transparent** (notch + bezel opaque) — put media *behind* it. |
| `idea-laptop-screen-mask.png` | same | 1435 × 1131 | White screen shape on transparent (for `mask-image`). |
| `previews/idea-hand-preview.png`, `idea-laptop-preview.png`, `idea-laptop-blank-preview.png`, `idea-laptop-overlay-test.png` | | | Verification renders (dark / checker / perspective grid test). |

Matting method: colour distance from bg #FEFEFE → solid core (morph-open to drop 1–2 px strings, holes filled except the real see-through gap between thumb and index finger) → edge alpha by projecting each pixel onto the line bg→local-foreground colour (foreground estimated by normalised convolution of interior pixels) → colour de-contamination `F = (C − (1−α)·bg)/α`. Result: no white halo on dark backgrounds (verified).
String removal: all 9 fitted lines were masked (5 px wide); where they touch the glove they were replaced by the glove's own edge alpha. Lines never pass *over* the glove in the source (they go behind the fingers), so the hand is clean; only two ≤2 px notches remain on the finger edges where line A crosses (invisible at 1×). The stub of line E on the lid top was patched. Stone highlight under the laptop (src ≈ 950,1634) is kept opaque (it is stone, not background).
Resolution caveat: the laptop asset is 1435 px wide = 1× at a 1600 px viewport; on 2× screens it will be soft — acceptable for this photo, or source a higher-res mockup.
Content caveat: the screen in the source shows a third-party website (Russian "ЭКСТРИМ КУЛЬТУРА" event) — replace it with project imagery (use blank/frame assets).

### 4.1 Laptop screen (display area) — inside `idea-laptop.png`

It is **not** a rectangle: a perspective quad (right side nearer the camera). Edges fitted with sub-pixel transitions (residual σ ≤ 0.19 px):

| Corner | crop px (x, y) | % of crop (W 1435, H 1131) | source px | % of source |
|---|---|---|---|---|
| TL | (434.85, 19.92) | 30.303, 1.761 | (599.85, 887.92) | 37.491, 44.418 |
| TR | (1310.59, 20.97) | 91.331, 1.854 | (1475.59, 888.97) | 92.224, 44.471 |
| BR | (1307.93, 617.13) | 91.145, 54.565 | (1472.93, 1485.13) | 92.058, 74.294 |
| BL | (438.42, 580.78) | 30.552, 51.351 | (603.42, 1448.78) | 37.714, 72.475 |

- Bounding box (crop): x 434.85–1310.59, y 19.92–617.13 → **875.7 × 597.2 px**; % = left 30.303, top 1.761, right 91.331, bottom 54.565.
- Skew: top edge Δy +1.05 px over 876 px (0.07°, ~level); **bottom edge Δy +36.4 px (2.39°)**; left edge leans out 3.6 px (0.36°), right edge 2.7 px (0.26°). Left height 560.9 px vs right 596.2 px (+6.3 %). An axis-aligned rectangle would be off by up to 36 px → use `matrix3d` (or a clip-path polygon as fallback).
- Display top corners rounded **r ≈ 6 px**; bottom corners square. Notch (crop px): x 818.5–904.5 (86 px), y 19.9–34.6 (≈14.7 px), bottom corners r ≈ 3 px. Bezel colour `#000`–`#050505`; original screen white `#FBF9F7`.

Overlay recipe (perspective-correct):
```html
<div class="idea-laptop" style="position:relative;aspect-ratio:1435/1131">
  <img src="idea-laptop-blank.webp" class="abs-fill" alt="">
  <div class="idea-screen-stage"><!-- 1435×1131 px stage scaled to the wrapper -->
    <img class="idea-screen-media" src="project.webp" width="1440" height="900" alt="">
  </div>
  <img src="idea-laptop-frame.webp" class="abs-fill" alt="Laptop on stone blocks showing a Teseract project">
</div>
```
```css
.idea-screen-stage{position:absolute;left:0;top:0;width:1435px;height:1131px;transform-origin:0 0;transform:scale(var(--k,1))}
.idea-screen-media{position:absolute;left:0;top:0;width:1440px;height:900px;object-fit:cover;transform-origin:0 0;
  transform:matrix3d(0.553874292,-0.000139312299,0,-4.14153059e-05,0.00736808034,0.627683669,0,7.75834514e-06,0,0,1,0,434.85,19.92,0,1)}
```
`--k = wrapper.clientWidth / 1435` (set with a ResizeObserver). For other media sizes use:
```js
// quad corners TL,TR,BR,BL in stage px; returns CSS matrix3d for a w×h element (transform-origin 0 0)
function quadMatrix3d(w,h,[x0,y0],[x1,y1],[x2,y2],[x3,y3]){
  const dx1=x1-x2,dx2=x3-x2,dx3=x0-x1+x2-x3, dy1=y1-y2,dy2=y3-y2,dy3=y0-y1+y2-y3;
  const den=dx1*dy2-dx2*dy1, g=(dx3*dy2-dx2*dy3)/den, hh=(dx1*dy3-dx3*dy1)/den;
  const a=x1-x0+g*x1, b=x3-x0+hh*x3, d=y1-y0+g*y1, e=y3-y0+hh*y3;
  return `matrix3d(${a/w},${d/w},0,${g/w},${b/h},${e/h},0,${hh/h},0,0,1,0,${x0},${y0},0,1)`;
}
// quadMatrix3d(1440,900,[434.85,19.92],[1310.59,20.97],[1307.93,617.13],[438.42,580.78])
```
(Formula verified against OpenCV `getPerspectiveTransform`; corners reproduce to 0.01 px.) The frame PNG's window is 2 px larger than the quad, so the `#111` of the blank shows in that hairline instead of white. Optionally round the media's top corners (`border-radius: 6px 6px 0 0` before the warp).
Fallback without 3D: media at the bbox (left 30.303 %, top 1.761 %, width 61.028 %, height 52.804 % of the laptop box) with `clip-path: polygon(0% 0%, 100% 0.176%, 99.696% 100%, 0.408% 93.913%)` — fits the frame but is not perspective-warped.

---

## 5. Visual hierarchy

1. **Headline** (139 px Light, ~93 % of width, 2 lines) — dominant; sits at the top, 7.75 cqw down.
2. **Laptop on stones** (largest image mass, bottom-right ~56 % of height, bleeding right + bottom) — "proof".
3. **Hand pinching strings** (left edge, under the headline) — the concept: one gesture connects Strategy & Design → UX → UI → Technology & Storytelling; one string runs into the laptop (the idea becomes the product).
4. **Body copy** (30 px Light, left column, between the diagram and the laptop deck).
5. **Micro labels** (19–21 px uppercase) and the **top-right studio label** (24 px) — quiet, technical annotations.
Generous white space; no rules, cards or colour accents — monochrome on `#FEFEFE`, photo greys only (glove ≈ `#8B8B7A`, stones warm greys, laptop silver/black).

---

## 6. Responsive layout

### Desktop ≥1200 px (and tablet 810–1199 px): fixed artboard, scaled
- `.idea{container-type:inline-size; position:relative; aspect-ratio:1600/1999; width:100%; overflow:hidden; background:#FEFEFE}` (height = 124.94 vw; optionally cap the artboard at 1920 px wide, centred).
- Every element absolutely positioned in **cqw** (= image px ÷ 16):

| Element | left | top | width | font-size |
|---|---|---|---|---|
| Top label (text-align right) | right **2.81cqw** | **2.78cqw** | auto | 1.53cqw / lh 1.02 |
| Headline | **3.75cqw** | **7.75cqw** | auto (nowrap per line) | **8.72cqw** / lh 0.925 / −0.068em |
| Strings SVG | 0 | 0 | 100 % × 100 % (viewBox 0 0 1600 1999) | — |
| Hand | **0** | **25.0cqw** | **22.125cqw** (h 18.94cqw) | — |
| Label Strategy | 29.38cqw | 26.31cqw | — | 1.31cqw / lh 1.05 |
| Label UX | 44.38cqw | 36.94cqw | — | 1.14cqw |
| Label UI | 75.44cqw | 46.78cqw | — | 1.14cqw |
| Label Technology | 19.13cqw | 49.94cqw | — | 1.31cqw / lh 1.05 |
| Body (¶1 + ¶2) | **4.0cqw** | **62.88cqw** | max 28.75cqw (¶2 25cqw) | **1.90cqw** / lh 1.25 / −0.08em; ¶ gap 2.04cqw |
| Laptop | **10.3125cqw** | **54.25cqw** | **89.6875cqw** (to right edge; bottom flush) | — |

- Tablet (810–1199): same artboard; protect legibility with `font-size: max(11px, 1.31cqw)` for labels, `max(15px, 1.9cqw)` for body, `max(11px,1.53cqw)` for the top label. At 810 px the headline is 70 px and still fits 2 lines.

### Mobile ≤809 px: stacked flow (16 px side gutters, artboard abandoned)
1. **Top label** right-aligned, 11–12 px, lh 1.05, −0.06em, margin-bottom 24 px.
2. **Headline** 4 lines with manual breaks: "Your business / is unique. / Your website / should be too." — `font-size: 12.2vw` (≈46 px @375), lh 0.95, −0.055em, wght 260.
3. **Diagram block** (full-bleed, `aspect-ratio: 375/340`, own SVG viewBox 0 0 375 340) *(re-layout, est.)*: hand at left 0, top 24, width 150 px (scale 0.4237) → pinch (119.5, 96.8). Strings at the original angles, shortened: A −74.4° len 95 → (145, 5) grey tick; B −37.5° len 115 → (211, 27) + "STRATEGY / AND DESIGN"; C 4° len 150 → (269, 107) + "UX DESIGN"; D re-angled 22° len 175 → (282, 162) + "UI DESIGN"; E 40° fading out at the block bottom (leads the eye to the laptop); F 119° len 95 → (73, 180) dot; G 85.7° len 150 → (131, 246) + "TECHNOLOGY / AND STORYTELLING"; H 90° len 225 → (120, 322). Labels 11 px, dots r 2.
4. **Body copy** 17 px / lh 1.35 / −0.03em, ¶ gap 16 px; drop the forced sentence breaks of ¶1 (let it wrap) or keep them — both read well at 343 px.
5. **Laptop on stones** last, full-bleed and bottom-flush: `width: 118vw; margin-left: −21.7vw` (centres the screen; screen ≈ 72 vw wide), stones cropped on the left by `overflow:hidden`.

---

## 7. Motion (proposed — aligned with the reference site's Framer appear tokens, not visible in a still)
Reference tokens (`_ref/budarina/index.html`, framer/appear): initial `{opacity:0.001, y:80}` → `{opacity:1, y:0}`, spring `{stiffness:400, damping:30, mass:1}`, delays 0 / 0.2 / 0.3 / 0.4 / 0.5 s; tween ease `cubic-bezier(0.44,0,0.56,1)` 300 ms.
- Headline lines: y 80→0 + fade, spring 400/30/1, stagger 100 ms, on enter (once, 30 % visible).
- Hand: x −40→0 + fade, same spring, delay 0.2 s.
- Strings: draw from the pinch outward (`stroke-dasharray = length`, dashoffset → 0), 900 ms `cubic-bezier(0.44,0,0.56,1)`, stagger 60 ms in order A,B,C,D,E,F,G,H, start 0.35 s; dot scale 0→1 (200 ms) when its line completes; label fade + y 8→0 (300 ms) right after.
- Laptop: y 80→0 + fade, spring, delay 0.2 s; optional slow scroll parallax on stones (−4 % translateY).
- `prefers-reduced-motion`: show final state, no draw-on.

---

## Critic additions

### A. Breakpoints
§6 uses 1200/810. The reference and the project tokens use **1440/800** (`__framer__breakpoints`, verified). The artboard maths is width-driven, so it works at any width. Only change the switch to the stacked mobile flow: it should happen at **≤ 799.98 px**, matching the global phone breakpoint. The text floors (`max(15px, 1.9cqw)` etc.) protect 800–1199.

### B. Hand-off from the hero: there is no reference "overlap technique"
PLAN.md says this panel overlaps the hero gallery "(reference FAQ→footer technique)". The reference does **not** overlap. In the CSS, `#faq` and `#footer` are plain stacked siblings with no negative margins; only their 120 px radii leave `#F2F2F2` wedges. The overlap therefore has to be specified here:

```css
.idea{ --r:120px; position:relative; z-index:2;              /* hero is z 1 */
       margin-top:calc(-1 * var(--r));                       /* covers the last r px of the 1000px ticker frame */
       border-radius:var(--r) var(--r) 0 0; background:#FEFEFE; /* matte target of the PNGs, not #FFF */
       overflow:hidden; }
@media (max-width:1439.98px){ .idea{ --r:80px } }            /* = FAQ tablet radius */
@media (max-width:799.98px) { .idea{ --r:32px } }            /* = FAQ phone radius */
```

The wedges then show the moving gallery, not the page background. That is the intended "sheet over the work" effect.

- **Corner clearance for the top-right label.** A point inset d px on both axes from a corner is inside the rounded shape only if d ≥ r·(1 − 1/√2) = 0.293 r.
  - At 1440 (r 120) the label's top-right corner sits at (40.5, 40), which is inside by 5 px.
  - At 810–1000 (r 80) it sits at (22.8, 22.5) from the corner, which is **outside** the 80 px arc, so the ink is clipped.
  - **Fix:** `top: max(2.78cqw, calc(.3 * var(--r) + 12px)); right: max(2.81cqw, calc(.3 * var(--r) + 12px));` This gives 48 / 36 / 21.6 px.

### C. Wide screens (artboard cap)
§6 suggests "optionally cap the artboard at 1920 px, centred". Two assets have **hard cut edges** that only work at the viewport edge:
- the hand cuff exits the crop's **left** edge;
- the stones are flush with the crop's **right** and **bottom** edges.

On a capped, centred artboard both cuts show as vertical lines inside a `#FEFEFE` band. Pick one of these fixes:
- (a) do not cap (at 2560 the headline is 223 px, which is acceptable for a hero-scale statement);
- (b) when capped, pin the hand to `left: calc((1920px - 100vw) / 2)` and the laptop to `right: calc((1920px - 100vw) / 2)`, so both still bleed off the viewport;
- (c) add 48 px horizontal alpha fades: `mask-image: linear-gradient(90deg, transparent, #000 48px)` on the hand and the mirror on the laptop.

### D. Content and brand
- **Top-right label**: render `{BRAND}` + "CREATIVE STUDIOS" from config. The image says TESSERACT, the logo says TESERACT and the doc says TESSERACT (see brand-assets Critic additions). With TESERACT, line 1 is one glyph shorter. The label is right-aligned, so nothing else moves.
- **Headline casing**: the doc has "YOUR BUSINESS IS UNIQUE. YOUR WEBSITE SHOULD BE TOO." in caps, and the image uses sentence case. Use the image casing; the words are identical.
- **Discipline labels**: "STRATEGY AND DESIGN", "UX DESIGN", "UI DESIGN" and "TECHNOLOGY AND STORYTELLING" exist only in the image, not the doc. They are acceptable as decoration and consistent with the doc ¶2 ("strategy, design, technology, interaction and storytelling").
- **Laptop screen media**: every ZIP project image is ZZStudio client work (see zip-project §13). Use it only as a flagged placeholder until TESERACT supplies its own screen capture.
