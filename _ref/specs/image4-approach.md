# Image 4 — "Our Approach" flowchart page: implementation spec

Source: `_ref/images/4.webp` (1333 × 2000 px, white poster). All measurements were taken from the raster with scripts: connected-component bounding boxes, row and column ink profiles, radial scans, Hough-style ray fitting, and colour sampling. The working scripts are in `_ref/work4/`. Font metrics were fitted against **Geist** (variable, wght 100–900, UPM 1000, cap 710, x-height 530), the font shipped in the user's project (`dist/assets/geist.woff2`). I instanced Geist with fontTools and rendered it with PIL, then overlaid the renders on the source to check widths and stems.

* **Coordinates.** Every coordinate is in **design px (dpx)** on the 1333 × 2000 canvas: x from the left edge, y from the top. `%x = x / 13.33` and `%y = y / 20`.
* **Text positions.** A "top" for text is the top of its caps or ascenders, and a "baseline" is its baseline. Line pitch is measured baseline to baseline.
* **Accuracy.** Values marked *(est.)* are visual estimates. All other values are measured to about ±1 dpx. The source is a compressed raster that was probably AI-composited, so where measurements were inconsistent I give a single normalised value and mention the spread.

---

## 1. Canvas, frame and grid

| Item | Value |
|---|---|
| Canvas | 1333 × 2000 dpx, background `#FFFFFF` (sampled 254–255 / `#FEFEFE`) |
| Frame hairlines | vertical 1 px at **x = 43.5** and **x = 1289** (3.26 % / 96.7 %), full height, colour ≈ `#EFEFEF` (sampled 247–249 on 254). Inner frame width 1245.5 dpx |
| Ghost column line | vertical 1 px at **x = 495.5** (37.2 %), y 0 → ≈1850 (stops above the bottom rule), colour ≈ `#F2F2F2`. Optional; keep it at `rgba(0,0,0,.04)` |
| Content left edge | 78–81 dpx (wordmark 81, label 78, headline stem 79, bottom rule 81) → **left padding = 36 dpx inside the frame** |
| Content right edge | ≈1256–1296 (header tag 1256, intro 1243, notes up to 1296) |
| Upper spine x | **685** (51.4 %): lead-in from the top dot to step 01 and the first decision |
| Main spine x | **748.5** (56.15 %): from the first decision to step 09 |
| Step text column x | 716 for step 01 (node + 31); **781** for steps 02–09 (node + 32.5); 846–847 for inline titles 07–09 |
| Right-notes column x | 885 (01 note) · 1036–1065 (03/05/09 notes) · 1057 (bracket lists) |
| Left-notes column | right edge ≈ 675–690; left edge 372–512 depending on block |
| Far-left lists column | 236–586 (boxes 238–368; bracket lists 370–585) |

**Breakpoints** (same as the Framer reference): desktop `min-width: 1200px`; tablet `810px – 1199.98px`; phone `max-width: 809.98px`.

**Scaling unit for desktop:** `--W: min(100vw, 1440px)` and `--u: calc(var(--W) / 1333)`. This gives u = 0.90 at 1200, 1.00 at 1333 and 1.08 at 1440. Every dpx value in this document becomes `calc(N * var(--u))`.

---

## 2. Colour tokens (sampled)

| Token | Hex | Where / evidence |
|---|---|---|
| `--bg` | `#FFFFFF` | page (254–255) |
| `--frame` | `#EFEFEF` | frame hairlines at x 43.5 and 1289 |
| `--ink` | `#050505` | headline (core `#030303`), titles (`#050505`), numbers (`#060606`), "Details matter." (`#060606`), NO fills (`#030303`) |
| `--ink-2` | `#222222` | bracket lists (core `#222223`), wordmark (`#232323`), intro (`#1D1D1D`) |
| `--ink-3` | `#2E2E2E` | spaced subtitles (core `#2E2E2E`) |
| `--ink-4` | `#4D4D4D` | body notes (anti-aliased cores `#474747`–`#5C5C5C`; the true ink is darker than these AA cores) |
| `--ink-5` | `#6E6E6E` | nav (`#727272`), diamond labels (`#8A8A8A` AA, darkened here for AA contrast: 4.95:1) |
| `--line` | `#1F1F1F` | main spine, solid connectors, YES branches (integrated darkness ≈ 1 px of `#1A1A1A`) |
| `--line-2` | `#4A4A4A` | node rings, diamond outlines, boxes, brackets, dotted connectors |
| `--line-soft` | `#A3A3A3` | upper spine segment x = 685 (lighter: integrated darkness 93–127) |
| `--rule` | `#2B2B2B` | bottom rule (1.5 px), launch connector |
| `--rule-2` | `#6A6A6A` | footer vertical divider (x 613.5), evolve note rule (x 1017.5) |
| `--ray` | `#C8C8C8` | burst rays (sampled 204–227 along rays; draw them thin and light) |
| `--accent` | **`#0756FB`** | dense blue fills: YES (8,86,250), headline dot (7,87,253), top dot (10,85,251), most-saturated median (3,83,253). Contrast on white is 5.6:1, and white on accent is also 5.6:1 (AA) |
| `--on-accent` | `#FFFFFF` | YES/NO labels |

Thin blue rules (header tag rule and RESULT bracket) sample as `#8FA6C7`–`#7B92CB` because of sub-pixel AA. Draw them in `--accent` at 1.5 px.

---

## 3. Typography (fitted to Geist)

Method: font size = measured cap height ÷ 0.71 (or x-height ÷ 0.53). Letter spacing = (measured ink width − Geist natural ink width) ÷ (characters − 1). Weight was matched by the stem ÷ cap ratio. Measured ratios: headline 13/93 = 0.140; titles 4.5/33.5 ≈ 0.134; "Details matter." 7.5/61.5 = 0.122. Geist renders 0.126 at wght 400 and 0.154 at wght 500, so **display wght ≈ 460** and the footer display wght is 400.

Geist is wider than the Helvetica-Neue-like face in the mock. That is why the display sizes need strong negative tracking to keep the mock's line lengths. A render comparison (`_ref/work4/cmp_headline.png`, `cmp_step.png`, `cmp_list.png`) confirms the values below hold the widths within about 2 %. Fallback stack: `Geist, "Helvetica Neue", Helvetica, Arial, sans-serif`. If you fall back to Helvetica Neue Medium, halve the negative tracking.

| Role | Size (dpx) | wght | Line height | Letter spacing | Case | Colour | Measured basis |
|---|---|---|---|---|---|---|---|
| Wordmark "tesseract" | 20 | 400 | 1 | **0.39em** (7.8) | lower | ink-2 | ink 81–231 (w 151), x-height 10.5, letter pitch 18.1 |
| Nav labels | 10 | 500 | 1 | **0.22em** | UPPER | ink-5 | cap 7, STRATEGY w 65, TECHNOLOGY 86, gaps 30 → `gap: 28px` |
| Header tag "A BETTER / DIGITAL / EXPERIENCE" | 12 | 500 | 16 | 0.15em | UPPER | `#5A5A5A` | cap 9, pitch 16, w 68/54/86 |
| Section index "02 — 09" | 16 | 400 | 1 | 0 | – | `#333` | digits 12 high, w 63 |
| "our / approach" | 18.5 | 400 | 19 | −0.02em | lower | ink-2 | x-height 11, "approach" w 79, pitch 19 |
| **Headline** | **131** | **460** | **103 (0.786)** | **−0.12em** | Title | ink | cap 93, baselines 330/432/535/638/742 (pitch 103), stem 13 |
| Headline period dot | Ø 27 | – | – | – | – | accent | centre (630, 745), 12 dpx after "e", bottom 3 dpx below baseline |
| Intro paragraph | 18 | 400 | 22.3 (1.24) | −0.01em | Sentence | ink-2 | x-height 11, asc 14, w 247 |
| Step number "01–09" | 36 | 460 | 1 | −0.08em | – | ink | digits 24–26 high, "01" w 29 |
| Step title | 46 | 460 | 1 | **−0.10em** | Title | ink | cap 33.5 (Understand/Define), drifting to 30 on 08/09 → normalise to 46 |
| Step subtitle | 14 | 450 | **18.5** | **0.26em** | UPPER | ink-3 | cap 10–11, pitch 18–19, fits 0.24–0.31em |
| Body notes | 14 | 400 | 17.75 (1.27) | −0.01em | Sentence | ink-4 | width-fit 13.2–14.5, pitches 17–18.5 |
| NO captions ("Go deeper…") | 14.5 | 400 | 18 | −0.01em | Sentence | ink-4 | w 72/81/62, pitch 18 |
| Bracket lists | 14 | 450 | **22.3** (DESKTOP list: 20) | **0.15em** | UPPER | ink-2 | cap 11, pitches 22.2–22.7 / 20.1 |
| Boxes (IDEAS…) | 13 | 400 | 1 | 0.03em | UPPER | `#333` | cap 10, "REFERENCES" w 84 |
| RESULT label (step 01) | 14 | 600 | 1 | 0.08em | UPPER | accent | cap 11–12, w 61 |
| RESULT micro label (step 02) | 9.5 | 500 | 1 | 0.12em | UPPER | accent | cap 7, w 22 |
| Diamond label | 10.5 | 400 | 15 | 0 | Sentence | ink-5 | "direction?" w 49, pitch 15 |
| YES | 11 | 500 | 1 | 0.02em | UPPER | on-accent | cap 8, w 22 |
| NO | 10 | 500 | 1 | 0.02em | UPPER | on-accent | cap ≈7 |
| Footer display "Details matter." | **86** | **400** | 1 | **−0.085em** | Sentence | ink | cap 61.5, w 479, stem 7.5 |
| Footer paragraph | 14.5 | 400 | 19.5 | −0.01em | Sentence | `#555` | w 404/309/189, pitch 19.5 |
| Footer index "02 — 09" | 15 | 400 | 1 | 0 | – | `#444` | digits 12 high, w 63 |

Use `font-feature-settings: "ss01" 0;` (default Geist). Use `font-variant-numeric: lining-nums` for numbers. Do not use tabular numbers: Geist tabular digits are too wide for "01".

---

## 4. Element inventory (desktop, dpx)

### 4.1 Header row (y 31–72)

| Element | Box | Notes |
|---|---|---|
| Wordmark `tesseract` | x 81–231, y 31–43 (baseline 43) | lowercase and letter-spaced. **Brand-spelling conflict:** mock "tesseract", master "TESSERACT", logo "TESERACT". Use whatever the logo/brand owner confirms |
| Nav | STRATEGY x 531–595 · DESIGN 625–671 · TECHNOLOGY 702–787 · EXPERIENCE 817–894; caps y 34–40 (baseline 40.5) | Starts at 39.8 % (x 531), so it is not centred on the page. Gap between items 30 px (28 + trailing tracking). Not in master copy: it reads as a capability strip, not navigation. Render it as `<ul aria-label="Disciplines">`, not as links |
| Blue rule | x 1135.5, y 32–71, 1.5 px accent | 33 dpx left of the tag text |
| Tag | x 1170–1256; baselines 39 / 55 / 71 | 3 lines |

### 4.2 Hero block

| Element | Box | Notes |
|---|---|---|
| "02 — 09" | x 78–140, y 139–150 | em dash with spaces |
| "our" / "approach" | x 78; "our" x-top 171, baseline 181; "approach" baseline 200 | 2 lines |
| Headline | x 72–676, cap-top 238 → descender 771 | lines: **How** (x 79–309) / **An Idea** (72–435) / **Becomes** (79–524) / **An** (72–214) / **Experience** (79–606) + blue dot |
| Gap label → headline | "approach" baseline 200 → "How" cap-top 238 = **38 dpx** | |
| Intro (top right) | x 996–1243, asc-top 125, baselines 139.5 / 162 / 184 / 206.5 | 4 lines, left-aligned; 74.7 % from left |

### 4.3 Spine, nodes and steps

Node anatomy: outer ring **Ø 31–32** (r = 15.5), 1 px `--line-2`, filled `--bg` so the spine passes behind it. Inner dot **Ø 10**: `--ink` for steps 02–07, `--accent` for 01, 03b, 08 and 09. The top dot and the traveller dot are solid accent with no ring.

| # | Node centre (dpx) | %x / %y | Dot | Number box | Title box (cap-top → baseline) | Subtitle lines (cap-top) |
|---|---|---|---|---|---|---|
| top | (685, 108) Ø 15 | 51.4 / 5.4 | accent, no ring | – | – | – |
| 01 | (685, 195.5) | 51.4 / 9.8 | **accent** | x 717–745, y 185–210 | "Understand" x 716–930, 226 → 259 | x 720: 275 "FIRST," / 294 "WE LISTEN." |
| 02 | (748.5, 512.5) | 56.2 / 25.6 | ink | 782–817, 502–526 | "Define" 781–895, 543 → 576 | x 784: 594 / 612 |
| 03 | (748.5, 743.5) | 56.2 / 37.2 | ink | 782–818, 731–756 | "Explore" 781–910, 772 → 805 | 823 / 841 |
| 03b (side) | (696, 845.5) | 52.2 / 42.3 | **accent** | – | – | – |
| 04 | (748.5, 916.5) | 56.2 / 45.8 | ink | 782–819, 905–929 | "Design" 781–901, 943 → 976 | x 785: 991 / 1010 |
| 05 | (748.5, 1063.5) | 56.2 / 53.2 | ink | 783–818, 1054–1078 | "Refine" 781–891, 1093 → 1125 | 1140 / 1159 |
| 06 | (748.5, 1298.5) | 56.2 / 64.9 | ink | 785–820, 1289–1313 | "Build" 784–860, 1325 → 1355 | x 787: 1369 / 1387 |
| 07 | (748.5, 1437) | 56.2 / 71.9 | ink | 785–819, 1428–1451 | **inline** "Test" 846–917, 1426 → 1457 | x 854: 1471 / 1490 |
| 08 | (749, 1648.5) | 56.2 / 82.4 | **accent** | 785–820, 1640–1664 | **inline** "Launch" 847–962, 1637 → 1666 | x 849: 1681 / 1699 |
| 09 | (748.5, 1748.5) | 56.2 / 87.4 | **accent** | 786–821, 1739–1763 | **inline** "Evolve" 847–950, 1736 → 1765 | x 850: 1781 / 1799 |

Rhythm rules derived from the table:
* **Stacked steps (01–06):** the number is vertically centred on the node centre (its cap-centre sits about 1.5 dpx lower). The title cap-top is at node + 26…30.5 (use **+28**), and the title baseline at node + 61…63. The first subtitle line cap-top is at node + 70…81.5 (use **+77**), and the second line follows 18.5 later.
* **Inline steps (07–09):** the number and title are vertically centre-aligned (`align-items:center`), with title-left = number-left + 61 (a **27 dpx** gap after the digits). The subtitle sits under the title at node + 33 and shares the title's left edge.
* **Node-to-node distances (dpx):** 317 · 231 · 173 · 147 · 235 · 138.5 · 211.5 · 100. The three steps that hold decision diamonds (01, 05, 07) get the tall gaps.

### 4.4 Decisions

All three diamonds are the same rhombus: **104 × 72** (half-diagonals 52 / 36), stroke 1 px `--line-2`, fill `--bg`, label centred.

| | Diamond centre | Label | YES circle (Ø 40, accent fill) | NO circle (Ø 32, ink fill) | NO caption (left-aligned) |
|---|---|---|---|---|---|
| D1 | (749, 392) | "Clear / direction?" (lines at 381 and 396) | (867.5, 392.5) | (633, 392.5) | x 597: "Go deeper. / Ask the right / questions." (tops 416 / 434 / 452) |
| D2 | (749, 1203) | "Everything / ready?" | (868, 1203) | (611.5, 1203) | x 590: "Refine and / improve." (1226 / 1247) |
| D3 | (800, 1542): offset +51 right so its **left vertex touches the spine** (748) | "All good?" (one line, cap 1538–1547) | (912, 1541.5) | (665, 1542) | x 638: "Fix, optimise / and retest." (1566 / 1585) |

D1 also has a 6 dpx stub above its top vertex (749, 350 → 356) in `--line-soft`.

### 4.5 Side content per step

| Step | Left side | Right side |
|---|---|---|
| 01 | NO loop (see §5) | Note x 885–1098, tops 291/308/325/342 (4 lines). **Blue RESULT bracket**: vertical x 1120.5 from y 284 to 367 with a top tick from x 1108 to 1120.5 at y 285 (a "˥" shape, no bottom tick), 1.5 px accent. "RESULT" x 1143–1203, cap 289–300. Result text x 1143–1276, tops 313/329/346 (3 lines) |
| 02 | Note x 455–690: 2 lines (tops 571/589), then 5 bullets (bullet dots Ø 5 at x 456–460, text x 474, **pitch 13.5**), then a "RESULT" micro label at x 456, y 680–686. The result sentence is missing in the mock | YES loop vertical x 986 plus a traveller dot (985.6, 549.4) Ø 14 |
| 03 | Boxes ×3: x 238–368 (**131 × 30**), tops 801 / 841 / 881 (pitch 40, gap 10), 1 px `--line-2`, square corners; dotted joiner to the side node 03b | Arrow → note x 1064–1296: 2 lines (764/782), then a 22 dpx paragraph gap, then 3 lines (822/840/858) |
| 04 | Dotted arrow ← note x 425–645, tops 936/954/969 | Bracket list x 1057–1255, y 913–1013: WIREFRAMES / UI DESIGN / DESIGN SYSTEM / INTERACTIONS (text x 1091, tops 921/944/966/988); fed by a solid elbow from the spine |
| 05 | Bracket list x 370–571, y 1030–1169: SPACING / RESPONSIVENESS / INTERACTIONS / HIERARCHY / READABILITY / MOTION (text x 398, pitch 22.2) | Arrow → note x 1048–1291, tops 1091/1108 |
| 06 | Solid arrow ← note x 372–608, tops 1312/1330/1349 | Bracket list x 1057–1232, y 1267–1369: DEVELOPMENT / CMS SETUP / INTEGRATIONS / RESPONSIVE (text x 1090, tops 1277/1299/1323/1345); fed by the YES2 dotted line |
| 07 | Bracket list x 417–585, y 1397–1582: DESKTOP … FUNCTIONALITY (9 items, text x 443, **pitch 20**) | – |
| 08 | Dashed arrow ← note x 512–675, tops 1638/1656/1673/1691 | Solid connector from x 992 to 1058 at y 1653 → **launch burst** (§4.6) |
| 09 | Bracket list x 371–581, y 1721–1807: ONGOING SUPPORT / IMPROVEMENTS / NEW FEATURES / SCALING (text x 405, pitch 21) | Grey rule x 1017.5, y 1745–1827 (1.5 px `--rule-2`), then a note x 1036–1268, tops 1748/1766/1783/1801/1819 (5 lines) |

**Bracket anatomy** (pure CSS): 1 px `--line-2` verticals with **10 dpx serifs** at top and bottom, opening inward. Text inset from the left bracket is 26–34 (use **30**). Vertical padding is 4–10 top and 6–15 bottom (use **8 / 12**).

### 4.6 Launch burst (step 08)

* **Black half-disc:** centre (1074, 1651), r 14, left semicircle only. It reads as a "C" crescent behind the blue disc (bbox x 1058–1081, y 1637–1665).
* **Blue disc:** centre (1074, 1649.5), r 9.5, accent.
* **Blue tick:** x 1073–1075 (2 px), y 1631 → 1640, accent (the "fuse" or antenna).
* **Rays:** fitted fan centre **(1089, 1647)**, about 15 dpx right of the disc. Inner radius **40** (an empty halo). The fan spans about **−108° to +108°** (0° = east, + = clockwise/down).
  * **Long rays:** about every **11.7°**. Measured angles: −78.9, −66.5, −54.4, −42.0, −31.4, −21.3, −11.2, 0, 11.9, 23.3, 35.2, 47.8, 61.5, 74.8, plus ≈ ±90 and ±102. Outer radius peaks at 143–148 near 0°/±30° and drops to ≈ 100 at ±80° and ≈ 85 at ±105°.
  * **Short rays:** interleaved at half-steps, from r 60 → 75–99.
  * Stroke **0.75 px `--ray`**, butt caps.

### 4.7 Bottom rule and footer

| Element | Value |
|---|---|
| Bottom rule | y 1848, x 81 → 971, **1.5 px `--rule`**. At x 971 it turns up to an arrow tip at y 1829 |
| Rule dot | accent Ø 14.5, centre (177.4, 1844.2): it sits on the rule (7.2 % of the rule length) |
| "Details matter." | x 82–560, cap-top 1881, baseline 1942 |
| Divider | x 613.5, y 1882 → 1954, 1.5 px `--rule-2` (30 dpx after the period) |
| Paragraph | x 644, tops 1891 / 1910 / 1930 (3 lines), 30 dpx right of the divider |
| "02 — 09" | x 1187–1249, digits 1910–1921 (vertically centred with paragraph line 2) |
| Bottom margin | 1954 → 2000 = 46 dpx |

---

## 5. Line system and connector map

**Stroke styles**
* **Solid ink:** 1 px `--line`. Used for the spine, YES branches, explore/refine/define/build leaders, the 04 elbow and the 09 return.
* **Soft:** 1 px `--line-soft`. Used for the upper spine x = 685 (top dot → D1 junction) and the D1 top stub.
* **Dotted:** 1 px `--line-2`, `stroke-dasharray: 2 4` (measured period 6, dash 1.5–2), butt caps. Used for every feedback loop, the NO branches of D2 and D3, the box joiners, the 03b link, YES2 → DEVELOPMENT, the design leader and the launch leader (dashed).
* **Heavy:** 1.5 px `--rule`. Used for the bottom rule and the launch connector.
* **Blue:** 1.5 px accent. Used for the header tag rule and the RESULT bracket.

**Arrowheads:** filled isosceles triangles **8 long × 6 wide**, fill `--line` (dark even on dotted lines). SVG marker: `M0,0 L8,3 L0,6 Z`, refX 8, refY 3, `markerUnits="userSpaceOnUse"`, `orient="auto-start-reverse"`.

**Connector list (SVG path data, design coordinates)**

```
# Spine
soft   M685,116 V179                    top dot → node 01
soft   M685,212 V392                    node 01 → D1 junction
soft   M749,350 V356                    stub above D1
solid  M697,392 H661   ►end             D1 left vertex → NO1 (tip 661, NO edge 649)
dot    M609,392 H583 V281 H671  ►start ►end   NO1 feedback loop (both arrowheads point right)
solid  M801,392 H846   ►end             D1 → YES1
solid  M888,392 H986 V652 H752  ►end    YES1 loop, re-enters spine below "Define"
solid  M749,496 V430   ►end             node 02 → up into D1 bottom vertex
solid  M749,528 V1166  ►end             main spine 02→05, arrow into D2 top vertex (tip 1166)
solid  M749,1282 V1241 ►end             node 06 → up into D2 bottom vertex
solid  M749,1314 V1764                  main spine 06→09 (passes D3 left vertex at 1542)
solid  M749,1764 V1820 H629 V1802       09 return (solid part)
dot    M629,1802 V1765 H598  ►end       09 return (dotted part) → ONGOING list (tip 597)

# Step 02
solid  M731,581 H698   ►end             leader ← define note

# Step 03
solid  M948,786 H1040  ►end             Explore → note
dot    M370,816 H431 · M370,856 H431 · M370,896 H431 · M431,816 V896   box joiners
dot    M431,845.5 H676 ►end             joiner → side node 03b
dot    M696,830 V762 H732               03b → node 03 (no arrowhead)

# Step 04
solid  M1056,955 H1013 V880 H751 ►end   list → spine (arrowhead at spine)
dot    M718,952 H665   ►end             leader ← design note

# Step 05 / D2
solid  M958,1109 H1024 ►end             Refine → note
solid  M801,1203 H847  ►end             D2 → YES2
solid  M868,1223 V1270 ►end             YES2 ↓ (continue)
dot    M889,1203 H991 V1308 H1056       YES2 → DEVELOPMENT bracket (no head)
dot    M697,1203 H630  ►end             D2 → NO2
dot    M572,1100 H611.5 V1186 ►end      SPACING (right) → NO2 top
dot    M369,1100 H335 V1203 H568 ►end   SPACING (left) → NO2 left

# Step 06
solid  M722,1330.5 H640 ►end            leader ← build note

# Step 07 / D3
solid  M800,1488 V1505 ►end             stub into D3 top vertex
solid  M852,1542 H891  ►end             D3 → YES3
solid  M912,1562 V1608 ►end             YES3 ↓
dot    M748,1542 H712  ►end             D3 → NO3 (tip 711)
dot    M586,1487 H622 V1542 H646 ►end   DESKTOP (right) → NO3
dot    M416,1487 H373 V1609 H800 V1581 ►end   DESKTOP (left) → up into D3 bottom

# Step 08 / 09
dot    M735,1651 H698  ►end             leader ← launch note
heavy  M992,1653 H1060                  Launch → burst
rule2  M1017.5,1745 V1827               evolve note rule

# Bottom
heavy  M81,1848 H971 V1830 ►end         bottom rule with up arrow (tip 1829)
```

Arrow-tip-to-target gaps in the mock vary from 8 to 30 dpx. Normalising them to **10 dpx** is acceptable and looks more deliberate.

---

## 6. Copy map (from the image) and cross-check with master "04 — OUR APPROACH"

`/` = line break as set in the image. Mark each break with `<br class="br-d">` and hide those breaks below 1200.

| Block | Image copy | Master (`master.txt` L83–116) | Difference / recommendation |
|---|---|---|---|
| Index | "02 — 09" / "our / approach" | "04 — OUR APPROACH" | Mock numbering is wrong for the master IA (7 sections). **Use "04 — 07"**, or confirm what the "02 — 09" pagination means |
| Headline | How / An Idea / Becomes / An / Experience● | "HOW AN IDEA BECOMES AN EXPERIENCE." | ✓ (the period becomes the blue dot) |
| Intro | "We don't just design websites. / We turn ideas into thoughtful, / effective and meaningful / digital experiences." | "Great work doesn't happen in one step. We take the time to understand, explore, design, build and refine." | **Different.** Recommend master copy: "Great work doesn't happen / in one step. We take the time / to understand, explore, design, / build and refine." (same 4-line footprint, ≤ 250 dpx) |
| 01 | Understand · "FIRST, / WE LISTEN." · "We learn about your business. / Your goals. Your audience. / Your competitors. Your challenges. / Your vision." · RESULT "A clear understanding / of what we're building / and why." | "Before we design anything, we learn about your business." … | The image drops "Before we design anything,". Restore it as a 5th line: "Before we design anything, / we learn about your business. / …" (fits; ends at y ≈ 376, 16 dpx above the YES line) |
| D1 | "Clear direction?" YES / NO "Go deeper. / Ask the right / questions." | – | Image-only (keep) |
| 02 | Define · "THEN, WE FIND / THE DIRECTION." · "We turn everything we've / learned into a clear plan. We define:" • The structure • The user journey • The content • The functionality • The visual direction · RESULT | same + "Result: A clear project blueprint." | **Result sentence missing** in the image (hidden by the headline overlap). Add "A clear project blueprint." |
| 03 | Explore · "NOW WE START / THINKING DIFFERENTLY." · "We explore ideas, layouts, / references and visual directions." ¶ "This is where we ask: / What could this become? / Not: What template should we use?" · boxes IDEAS / REFERENCES / DIRECTIONS | same | ✓ (boxes are image-only, derived from the copy) |
| 04 | Design · "THE IDEA STARTS / TO TAKE SHAPE." · "Typography. Colours. Layouts. / Components. Images. Interactions. / Everything starts coming together." · [WIREFRAMES · UI DESIGN · DESIGN SYSTEM · INTERACTIONS] | same | ✓ (list is image-only, consistent with master "03 — What we create › Website design") |
| 05 | Refine · "DETAILS MAKE / THE DIFFERENCE." · "We review every important detail / and refine until everything feels right." · [SPACING · RESPONSIVENESS · INTERACTIONS · HIERARCHY · READABILITY · MOTION] | "We review every important detail." + list + "We refine until everything feels right." | The image merges the two sentences. Prefer master: "We review every important detail. / We refine until everything feels right." |
| D2 | "Everything ready?" YES / NO "Refine and / improve." | – | Image-only |
| 06 | Build · "DESIGN MEETS / TECHNOLOGY." · "We develop the website, integrate / the required functionality and make / it responsive across devices." · [DEVELOPMENT · CMS SETUP · INTEGRATIONS · RESPONSIVE] | + "Once the direction is approved, we bring the experience to life." | **Missing lead sentence.** Add it as 2 extra lines and move the note top to y 1276 (6 lines × 17.75 → ends at 1382, which clears the DESKTOP bracket at 1397) |
| 07 | Test · "BEFORE PEOPLE / USE IT, WE TEST IT." · [DESKTOP · TABLET · MOBILE · NAVIGATION · FORMS · ANIMATIONS · PERFORMANCE · CONTENT · FUNCTIONALITY] | list identical | ✓ |
| D3 | "All good?" YES / NO "Fix, optimise / and retest." | – | Image-only (British "optimise" matches the master's "Colours") |
| 08 | Launch · "READY FOR / THE WORLD." · "Once everything is tested / and approved, we launch. / Your idea becomes a real / digital experience." | same | ✓ |
| 09 | Evolve · "LAUNCH IS / NOT THE END." · "Businesses change. Your website / should be able to change with them. / We can continue supporting, / improving and evolving your digital / experience as your business grows." · [ONGOING SUPPORT · IMPROVEMENTS · NEW FEATURES · SCALING] | same | ✓ (list is image-only) |
| Footer | "Details matter." · "A button. A transition. A headline. A colour. A loading screen. / Small details can change how something feels. / We care about those details." · "02 — 09" | Comes from **02 — WHO WE ARE › How we think › DETAILS MATTER** | Copy is identical but borrowed from another section. Keep it as the section sign-off |
| Header strip | STRATEGY · DESIGN · TECHNOLOGY · EXPERIENCE / "A BETTER DIGITAL EXPERIENCE" | not in master | Decorative capability strip; not navigation |

---

## 7. Construction

### 7.1 Strategy

* **Desktop (≥ 1200): "poster canvas".** `section.approach` is a positioned box of `1333u × 2000u`. Each text block is an absolutely positioned HTML element placed with `--x/--y` in dpx. Desktop text uses `white-space: nowrap` and explicit `<br>`s. All lines, nodes, diamonds, circles and the burst live in **one inline SVG overlay** (`viewBox="0 0 1333 2000"`, `width:100%; height:100%`). The SVG and the HTML share the same scale, so connectors land exactly. Use `vector-effect: non-scaling-stroke` on strokes so lines stay 1 px crisp at u = 0.9–1.08.
* **Tablet and phone (< 1200): "flow timeline".** The same DOM (an `<ol>` of steps in reading order) switches to a CSS grid with a left spine. Connectors become per-step mini-SVGs: leader ticks, a decision row and bracket lists. The big overlay SVG is `display:none`.
* The semantic order is the `<ol>`. The overlay SVG is `aria-hidden="true"`. Each decision gets an `sr-only` sentence.

### 7.2 HTML skeleton

```html
<section class="approach" id="approach" aria-labelledby="approach-title">
  <header class="ap-masthead">
    <span class="ap-wordmark">tesseract</span>
    <ul class="ap-disciplines" aria-label="Disciplines"><li>Strategy</li><li>Design</li><li>Technology</li><li>Experience</li></ul>
    <p class="ap-tag">A better<br>digital<br>experience</p>
  </header>

  <div class="ap-hero">
    <p class="ap-index">04 — 07</p>
    <p class="ap-kicker">our<br>approach</p>
    <h2 class="ap-title" id="approach-title">
      <span class="l">How</span><span class="l">An Idea</span><span class="l">Becomes</span><span class="l">An</span><span class="l">Experience<i class="ap-dot" aria-hidden="true"></i></span>
    </h2>
    <p class="ap-intro">Great work doesn't happen<br class="br-d"> in one step. …</p>
  </div>

  <svg class="ap-wires" viewBox="0 0 1333 2000" aria-hidden="true" focusable="false"> … §7.4 … </svg>

  <ol class="ap-steps">
    <li class="step" data-step="1" style="--y:195.5">
      <div class="step__head" style="--x:716;--y:180">
        <span class="step__num">01</span>
        <h3 class="step__name">Understand</h3>
        <p class="step__sub">First,<br>we listen.</p>
      </div>
      <p class="step__note" style="--x:885;--y:287">Before we design anything,<br class="br-d"> we learn about your business.<br class="br-d"> …</p>
      <div class="step__result" style="--x:1143;--y:287"><span class="result-label">Result</span><p>A clear understanding<br class="br-d"> of what we're building<br class="br-d"> and why.</p></div>
      <div class="decision" data-decision="1">
        <p class="sr-only">Decision: clear direction? Yes, continue to Define. No, go deeper and ask the right questions.</p>
        <p class="decision__no-caption" style="--x:597;--y:412">Go deeper.<br>Ask the right<br>questions.</p>
        <svg class="decision__mini" aria-hidden="true">…flow-mode only (§8.3)…</svg>
      </div>
    </li>
    <!-- step 2: .step__note--left; step 3: .step__boxes (ul of 3); steps 4,5,6,7,9: ul.bracket; step 7–9: .step--inline -->
  </ol>

  <div class="ap-signoff">
    <p class="ap-signoff__title">Details matter.</p>
    <p class="ap-signoff__body">A button. A transition. …</p>
    <p class="ap-index ap-index--end">04 — 07</p>
  </div>
</section>
```

### 7.3 CSS (core)

```css
.approach{
  --bg:#fff; --frame:#efefef; --ink:#050505; --ink-2:#222; --ink-3:#2e2e2e; --ink-4:#4d4d4d; --ink-5:#6e6e6e;
  --line:#1f1f1f; --line-2:#4a4a4a; --line-soft:#a3a3a3; --rule:#2b2b2b; --rule-2:#6a6a6a; --ray:#c8c8c8;
  --accent:#0756fb;
  --display: Geist, "Helvetica Neue", Helvetica, Arial, sans-serif;
  --ease-out: cubic-bezier(.22,1,.36,1);            /* expo-ish out */
  --ease-io:  cubic-bezier(.44,0,.56,1);            /* Framer tween in reference */
  --spring:   linear(0,.0653,.2121,.3862,.5547,.7,.8153,.9006,.9592,.9962,1.0169,1.0263,1.0283,1.0261,
                     1.0218,1.0168,1.0121,1.0081,1.0049,1.0026,1.001,1,.9995,.9992,.9992,.9993); /* 500ms ≙ spring k400 c30 m1 */
  background:var(--bg); color:var(--ink); font-family:var(--display); position:relative;
}
.approach *{ box-sizing:border-box }

/* ---------- DESKTOP POSTER ---------- */
@media (min-width:1200px){
  .approach{ --W:min(100vw,1440px); --u:calc(var(--W)/1333); width:var(--W); height:calc(2000*var(--u)); margin-inline:auto; }
  .approach::before,.approach::after{ content:""; position:absolute; top:0; bottom:0; width:1px; background:var(--frame); }
  .approach::before{ left:calc(43.5*var(--u)) } .approach::after{ left:calc(1289*var(--u)) }
  .ap-wires{ position:absolute; inset:0; width:100%; height:100%; overflow:visible; z-index:1; pointer-events:none }
  .approach [style*="--x"]{ position:absolute; left:calc(var(--x)*var(--u)); top:calc(var(--y)*var(--u)); z-index:2; white-space:nowrap }
  .br-d{ display:inline }

  .ap-wordmark{ font:400 calc(20*var(--u))/1 var(--display); letter-spacing:.39em; color:var(--ink-2) }        /* --x:81 --y:28 */
  .ap-disciplines{ display:flex; gap:calc(28*var(--u)); font:500 calc(10*var(--u))/1 var(--display);
                   letter-spacing:.22em; text-transform:uppercase; color:var(--ink-5); list-style:none; margin:0; padding:0 } /* --x:531 --y:33 */
  .ap-tag{ font:500 calc(12*var(--u))/calc(16*var(--u)) var(--display); letter-spacing:.15em; text-transform:uppercase; color:#5a5a5a;
           padding-left:calc(34.5*var(--u)); border-left:calc(1.5*var(--u)) solid var(--accent) }               /* --x:1135 --y:28 */
  .ap-index{ font:400 calc(16*var(--u))/1 var(--display); color:#333 }                                       /* --x:78 --y:137 */
  .ap-kicker{ font:400 calc(18.5*var(--u))/calc(19*var(--u)) var(--display); letter-spacing:-.02em; color:var(--ink-2) } /* --x:78 --y:165 */
  .ap-title{ font:460 calc(131*var(--u))/calc(103*var(--u)) var(--display); letter-spacing:-.12em; margin:0 }   /* --x:72 --y:233 (box top → cap-top 238) */
  .ap-title .l{ display:block; overflow:hidden; padding-bottom:.06em; margin-bottom:-.06em }
  .ap-dot{ display:inline-block; width:calc(27*var(--u)); height:calc(27*var(--u)); border-radius:50%; background:var(--accent);
           margin-left:calc(12*var(--u)); vertical-align:calc(-3*var(--u)) }
  .ap-intro{ font:400 calc(18*var(--u))/calc(22.3*var(--u)) var(--display); letter-spacing:-.01em; color:var(--ink-2) } /* --x:996 --y:121 */

  .step__num{ display:block; font:460 calc(36*var(--u))/1 var(--display); letter-spacing:-.08em }
  .step__name{ margin:calc(13*var(--u)) 0 0; font:460 calc(46*var(--u))/1 var(--display); letter-spacing:-.10em }
  .step__sub{ margin:calc(13*var(--u)) 0 0; font:450 calc(14*var(--u))/calc(18.5*var(--u)) var(--display);
              letter-spacing:.26em; text-transform:uppercase; color:var(--ink-3) }
  .step--inline .step__head{ display:grid; grid-template-columns:auto auto; column-gap:calc(27*var(--u)); align-items:center }
  .step--inline .step__sub{ grid-column:2; margin-top:calc(14*var(--u)) }
  .step__note,.decision__no-caption{ font:400 calc(14*var(--u))/calc(17.75*var(--u)) var(--display); letter-spacing:-.01em; color:var(--ink-4) }
  .result-label{ display:block; font:600 calc(14*var(--u))/1 var(--display); letter-spacing:.08em; text-transform:uppercase; color:var(--accent); margin-bottom:calc(12*var(--u)) }
  .bracket{ position:absolute; list-style:none; margin:0; padding:calc(8*var(--u)) calc(30*var(--u)) calc(12*var(--u));
            font:450 calc(14*var(--u))/calc(22.3*var(--u)) var(--display); letter-spacing:.15em; text-transform:uppercase; color:var(--ink-2) }
  .bracket--tight{ line-height:calc(20*var(--u)) }   /* DESKTOP list */
  .bracket::before,.bracket::after{ content:""; position:absolute; top:0; bottom:0; width:calc(10*var(--u)); border:1px solid var(--line-2) }
  .bracket::before{ left:0; border-right:0 } .bracket::after{ right:0; border-left:0 }
  .box{ width:calc(131*var(--u)); height:calc(30*var(--u)); display:grid; place-items:center; border:1px solid var(--line-2);
        font:400 calc(13*var(--u))/1 var(--display); letter-spacing:.03em; text-transform:uppercase; color:#333 }
  .ap-signoff__title{ font:400 calc(86*var(--u))/1 var(--display); letter-spacing:-.085em }  /* --x:82 --y:1868.5 */
  .ap-signoff__body{ font:400 calc(14.5*var(--u))/calc(19.5*var(--u)) var(--display); color:#555;
                     padding-left:calc(30*var(--u)); border-left:calc(1.5*var(--u)) solid var(--rule-2) } /* --x:613 --y:1882 */
  .decision__mini{ display:none }
}
```

The `--y` values for HTML text are **box tops**, not cap tops. Geist's vertical metrics are hhea/typo ascent 1005, descent −295, line gap 0 (content area 1.30 em), cap 710 and x-height 530. For a line box of height `LH`:
* **baseline** = top + LH/2 + 0.355·fs
* **cap-top** = top + LH/2 − 0.355·fs
* so **`--y` = cap-top − LH/2 + 0.355·fs**

Examples: headline (fs 131, LH 103) → 238 − 51.5 + 46.5 = **233**. "Define" (fs 46, LH 46) → 543 − 23 + 16.3 = **536.3**. Subtitle (fs 14, LH 18.5) → 594 − 9.25 + 4.97 = **589.7**. Body note (fs 14, LH 17.75) → asc-top ≈ cap-top − 0.5.

### 7.4 Overlay SVG (desktop)

```html
<svg class="ap-wires" viewBox="0 0 1333 2000" aria-hidden="true">
  <defs>
    <marker id="ah" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="8" markerHeight="6"
            markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path d="M0,0L8,3L0,6Z" fill="#1f1f1f"/></marker>
    <!-- reveal masks for dotted paths: one white solid path per dotted path, animated via dashoffset -->
  </defs>
  <g class="w-ghost"><path d="M685,108V392H697L749,428V1820" stroke="#ebebeb" fill="none"/></g>
  <g class="w-solid"  fill="none" stroke="var(--line)"   stroke-width="1" vector-effect="non-scaling-stroke"> …solid paths from §5… </g>
  <g class="w-soft"   fill="none" stroke="var(--line-soft)" stroke-width="1"> … </g>
  <g class="w-dot"    fill="none" stroke="var(--line-2)" stroke-width="1" stroke-dasharray="2 4"> … </g>
  <path id="spine-ink" d="M685,108V392H697L749,428V1820" fill="none" stroke="var(--line)" stroke-width="1"/>
  <!-- shapes on top of lines -->
  <g class="w-diamonds" fill="#fff" stroke="var(--line-2)">
    <polygon points="749,356 801,392 749,428 697,392"/>
    <polygon points="749,1167 801,1203 749,1239 697,1203"/>
    <polygon points="800,1506 852,1542 800,1578 748,1542"/>
  </g>
  <g class="w-nodes"> <!-- ring r15.5 fill #fff stroke --line-2 ; dot r5 -->
    <g class="node" data-for="1"><circle cx="685" cy="195.5" r="15.5"/><circle class="node__dot is-accent" cx="685" cy="195.5" r="5"/></g>
    … 02 (748.5,512.5) · 03 (748.5,743.5) · 03b (696,845.5 accent) · 04 (748.5,916.5) · 05 (748.5,1063.5)
    · 06 (748.5,1298.5) · 07 (748.5,1437) · 08 (749,1648.5 accent) · 09 (748.5,1748.5 accent)
  </g>
  <g class="w-yes"> <circle cx="867.5" cy="392.5" r="20"/> <circle cx="868" cy="1203" r="20"/> <circle cx="912" cy="1541.5" r="20"/> </g>  <!-- fill accent + <text> YES -->
  <g class="w-no">  <circle cx="633" cy="392.5" r="16"/> <circle cx="611.5" cy="1203" r="16"/> <circle cx="665" cy="1542" r="16"/> </g>     <!-- fill ink + <text> NO -->
  <circle class="dot-top" cx="685" cy="108" r="7.5" fill="var(--accent)"/>
  <circle class="dot-traveller" cx="986" cy="549.5" r="7" fill="var(--accent)"/>
  <path d="M1108,285H1120.5V367" stroke="var(--accent)" stroke-width="1.5" fill="none"/>            <!-- RESULT bracket -->
  <g class="burst" transform="translate(1089 1647)"><g id="rays" stroke="var(--ray)" stroke-width=".75"/></g>
  <path d="M1074,1637a14,14 0 0 0 0,28Z" fill="var(--ink)"/>                                        <!-- black half-disc (centre 1074,1651) -->
  <circle cx="1074" cy="1649.5" r="9.5" fill="var(--accent)"/><rect x="1073" y="1631" width="2" height="9" fill="var(--accent)"/>
  <path class="w-rule" d="M81,1848H971V1830" stroke="var(--rule)" stroke-width="1.5" fill="none" marker-end="url(#ah)"/>
  <circle class="dot-rule" cx="177.4" cy="1844.2" r="7.25" fill="var(--accent)"/>
</svg>
```

YES/NO and diamond labels can be SVG `<text>` (`font: 500 11px Geist; fill:#fff; text-anchor:middle; dominant-baseline:central`) or HTML. Rays generator (run once):

```js
const rays = document.getElementById('rays'), NS='http://www.w3.org/2000/svg', step=11.7;
for (let k=-9;k<=9;k++){ for (const half of [0, .5]){ if (k===9 && half) continue;
  const deg=(k+half)*step, a=deg*Math.PI/180, long=!half;
  const r1= long?40:60, r2= long? 148-0.55*Math.abs(deg) + ((k*37)%9-4) : 78+((k*53)%17) ; // ±4 jitter, deterministic
  const l=document.createElementNS(NS,'line');
  l.setAttribute('x1',r1*Math.cos(a)); l.setAttribute('y1',r1*Math.sin(a));
  l.setAttribute('x2',r2*Math.cos(a)); l.setAttribute('y2',r2*Math.sin(a));
  l.style.setProperty('--i', Math.abs(deg)/step); rays.append(l); } }
```

### 7.5 Fixes for problems in the mock (apply in the build)

1. **Step-02 note collides with the headline.** In the mock, bullets 4–5 and the RESULT label sit on top of "nce" (y 649–690). The free zone right of "An" is x 455–690, y 540–640. Re-set the note to fit: 2 intro lines (top 540), then the five bullets as a **2-column list** (3 + 2 rows, columns at x 455 and 575, 17.75 pitch), then one line "RESULT  A clear project blueprint.", which ends at ≈ 638. Alternatively, move the note to the empty band right of "Define" (x 1010–1250, y 560–700) and flip its leader to point right.
2. Bullet pitch 13.5 in the mock is cramped; use 17.75 like the other notes.
3. Arrow-tip gaps are inconsistent (8–30 dpx); use 10.
4. Title cap heights drift from 33.5 to 30 down the page; use one size (46).

---

## 8. Tablet and mobile (flow timeline)

### 8.1 Shared flow-mode structure (< 1200)

```css
@media (max-width:1199.98px){
  .ap-wires,.br-d{ display:none }
  .approach{ padding:var(--pad-top) var(--gutter) 0 }
  .ap-masthead{ display:flex; justify-content:space-between; align-items:center }
  .ap-title{ font-weight:460; font-size:clamp(56px, calc((100vw - 2*var(--gutter)) / 4.45), 124px);
             line-height:.79; letter-spacing:-.11em }   /* 4.45em ≈ width of "Experience●" */
  .ap-steps{ position:relative; display:grid; gap:0; list-style:none; margin:var(--steps-top) 0 0; padding:0 }
  .ap-steps::before,.ap-steps::after{ content:""; position:absolute; left:calc(var(--rail)/2); top:16px; bottom:0; width:1px }
  .ap-steps::before{ background:#ebebeb }                                   /* ghost */
  .ap-steps::after { background:var(--line); transform-origin:top; transform:scaleY(var(--p,0)) } /* drawn by scroll */
  .step{ display:grid; grid-template-columns:var(--rail) minmax(0,1fr); column-gap:var(--col-gap); padding-bottom:var(--step-gap); position:relative }
  .step::before{ /* node ring */ content:""; grid-column:1; justify-self:center; width:32px; height:32px; border-radius:50%;
                 border:1px solid var(--line-2); background:#fff radial-gradient(circle, var(--dot,#050505) 0 5px, transparent 5.5px); z-index:1 }
  .step[data-accent]::before{ --dot:var(--accent) }
  .step > *{ grid-column:2 }  .step__head{ grid-row:1; margin-top:-2px }
  .decision__mini{ display:block; width:100%; max-width:300px; height:auto; margin-top:20px }
}
```

### 8.2 Tablet (810–1199.98)

* Tokens: `--gutter:40px; --rail:48px; --col-gap:24px; --step-gap:72px; --pad-top:28px; --steps-top:88px`.
* **Masthead:** wordmark 18px with 0.39em tracking. Disciplines strip at 10px with 0.22em tracking, `gap:20px`. Hide the tag.
* **Hero:** two rows. Row 1 is the index and kicker. Row 2 is the headline (≈ 124px at 1000 wide; 0.79 line-height). The intro paragraph sits under the headline at `margin-left:auto; max-width:380px` (18px / 1.3), reproducing the desktop's top-right placement.
* **Step:** the step column is a sub-grid `grid-template-columns: minmax(0,1fr) minmax(0,1fr); column-gap:40px`.
  * Column A holds the head: number 32px, title 44px (−0.10em), subtitle 13px (0.26em).
  * Column B holds the **note** aligned to the title top (15px / 1.45, `--ink-4`) and the RESULT block.
  * Row 2 spans both columns and holds the extras: the boxes as an inline row of 3 chips (each `131×30`, gap 10), bracket lists (2 columns when there are 6 or more items, `column-gap:32px`), and the decision row (§8.3).
* **Inline steps (07–09)** keep number and title on one line.
* **Burst (08):** a 200 × 200 SVG floated right of the 08 head (`viewBox="1020 1530 260 240"`, reusing the desktop group).
* **Sign-off:** "Details matter." at 72px (−0.085em). Below it, a row of the paragraph (15px / 1.4) and "04 — 07" on the right. Add a 1.5px top rule with a blue dot at 7 % of its length (the mock's bottom rule).

### 8.3 Decision row (flow mode, inline SVG)

`viewBox="0 0 300 120"`, width 100 %, max 300px. It reproduces the desktop's NO ← ◇ → YES order.

```
NO   circle cx24  cy44 r16 fill ink, text "NO" 10px white
dot  M78,44 H46 ►            (dotted; solid for D1)
◇    points 130,8 182,44 130,80 78,44   (stroke --line-2, label 10.5px --ink-5 centred)
     M182,44 H240 ►          (solid)
YES  circle cx262 cy44 r20 fill accent, "YES" 11px white
     M262,64 V100 ►          (solid: "continue")
loop M24,28 V6 ►             (dotted up-arrow: "back to this step")
```

The NO caption is HTML under the SVG at `padding-left:0; max-width:140px` (14px / 1.3). Bracket-list feedback loops are not drawn in flow mode. The bracket list sits directly above the decision row, which carries the meaning.

### 8.4 Phone (≤ 809.98)

* Tokens: `--gutter:16px; --rail:28px; --col-gap:16px; --step-gap:56px; --pad-top:20px; --steps-top:56px`. The spine sits 30px from the viewport edge, and there is no horizontal scroll.
* **Masthead:** wordmark 16px (0.32em). Disciplines strip becomes a single row of 4 labels at 9px with 0.18em tracking and `gap:12px` (wraps to 2 rows below 360px). Hide the tag.
* **Headline:** `clamp(56px, (100vw − 32px)/4.45, …)`, which gives ≈ 77px at 375 and 69px at 320. Line-height 0.8, tracking **−0.09em** (loosened at small sizes so glyphs don't collide). Blue dot 0.2em.
* **Intro:** 16px / 1.35, full width, 20px below the headline.
* **Step head:**
  * Stacked steps: number 24px (−0.06em), title 36px (−0.09em), subtitle 11.5px (0.24em) with an 8px gap.
  * Inline steps keep number and title on one line: number 24px, title 36px, 14px gap.
* **Notes and lists:**
  * Notes 15px / 1.45 at full width, 16px top margin. RESULT label 12px (0.08em) with the result text below.
  * Boxes become 3 chips in one row (`flex:1 1 0; min-width:0; height:30px`, 11px text).
  * Bracket lists: 12px / 20px, 0.14em tracking, 2 columns if there are 6 or more items. Bracket serifs stay 10px.
* **Decision row:** as in §8.3, max-width 100 %.
* **Burst:** 140px wide, right-aligned under the 08 head, `opacity:.9`.
* **Sign-off:** "Details matter." `clamp(48px, 15vw, 72px)`, paragraph 15px / 1.45, "04 — 07" left-aligned under it. The top rule spans the full width with a 12px blue dot.

---

## 9. Motion (scroll-driven, premium, consistent with the reference)

Reference tokens extracted from `_ref/budarina/index.html` (`__framer__appearAnimationsContent`):
* Every appear uses a **spring with stiffness 400, damping 30, mass 1** (ζ = 0.75, ω₀ = 20 rad/s). It overshoots 2.8 % and settles in ≈ 460 ms. In CSS this is `--spring` (the `linear()` curve in §7.3) at **500 ms**.
* Entry offsets are **y 40 / 60 / 80 px** with delays of **0, 0.2, 0.3, 0.4, 0.5 s**.
* Opacity-only appears use a **tween of 300 ms, cubic-bezier(.44,0,.56,1)**.

### 9.1 Load (hero is above the fold)

| t (ms) | Element | Animation |
|---|---|---|
| 0 | masthead (wordmark, strip, tag) | opacity 0 → 1, 300 ms `--ease-io`. Tag rule `scaleY 0→1` (origin top) 500 ms `--spring` |
| 100 | index / kicker | y 40 → 0 + opacity, `--spring` 500 ms |
| 200 → 480 | headline lines | each `.l > span` `translateY(105%) → 0` inside the overflow mask, **900 ms `--ease-out`**, stagger **70 ms** |
| 900 | headline blue dot | scale 0 → 1, `--spring` 500 ms, then one 600 ms ripple (box-shadow 0 0 0 0 → 0 0 0 12px rgba(7,86,251,0)) |
| 500 | intro | y 40 → 0 + opacity, `--spring` 500 ms (matches the reference "y 40, delay .5") |
| 700 | top blue dot (685,108) | scale 0 → 1 `--spring`. It then becomes the **playhead** |

### 9.2 Spine draw (scrubbed)

* **Desktop.** `#spine-ink` has `stroke-dasharray: L` and `stroke-dashoffset: L − len(y)`. The target y is `y* = (0.6·innerHeight − sectionTop) / u`, so the tip follows a line 60 % down the viewport. The path `M685,108 V392 H697 L749,428 V1820` is monotonic in y, so build a 400-sample LUT of y → length and binary-search it. The **playhead** (the top blue dot, r 4.5 while travelling, r 7.5 at rest) is placed with `getPointAtLength`. Smooth with lerp `0.18` per frame (≈ 120 ms feel), and keep it scrubbed (no snapping). The ghost line `#EBEBEB` is always visible underneath.
* **Flow mode.** `.ap-steps` gets `--p = clamp(0, (0.6·vh − top) / height, 1)`, which drives `::after{transform:scaleY(var(--p))}`. There is no playhead dot (keep phones lightweight).
* `prefers-reduced-motion: reduce` → `--p:1` and full dashoffset 0. Show everything.

### 9.3 Step activation (triggered once when the playhead passes the node's y − 8)

| t (ms after trigger) | Element | Animation |
|---|---|---|
| 0 | node ring | scale .6 → 1 + stroke `#d0d0d0 → --line-2`, `--spring` 500 |
| 80 | node dot | scale 0 → 1, `--spring` 500. Accent dots add a ripple ring r 5 → 16, opacity .35 → 0, 700 ms `--ease-out` |
| 60 | number | y 16 → 0 + opacity, `--spring` 500 |
| 120 | title | mask reveal `translateY(100%) → 0`, 700 ms `--ease-out` |
| 220 | subtitle | opacity 0 → 1 and **letter-spacing .42em → .26em**, 900 ms `--ease-out` (the "tracking-in" studio signature) |
| 300 | leader arrows | solid: dashoffset L → 0, 280 ms `--ease-out`. Arrowhead marker fades in at the end (120 ms) |
| 420 | notes | opacity + `translateX(±20px) → 0` (towards the spine), `--spring` 500. Multi-paragraph notes stagger 60 ms |
| 420 | RESULT bracket (01) | path draw 400 ms, then RESULT label (tracking .2em → .08em) and text fade-up 12px |
| 480 | bracket lists | `::before/::after` scaleY 0 → 1 from centre, 400 ms `--ease-out`. Items y 8 → 0 + opacity, stagger 40 ms |
| 480 | boxes (03) | each box clip-path `inset(0 100% 0 0) → inset(0)`, 450 ms, stagger 80. Then the dotted joiners reveal (mask) 500 ms, then the 03b node pops |

**Dotted-line reveal technique:** a dotted stroke cannot be drawn with its own dasharray, because the dash pattern is already in use. Give each dotted path an SVG `<mask>` containing a duplicate **solid white** path with `stroke-width:4` and animate the mask path's `stroke-dashoffset` (L → 0). The visible dotted path keeps `2 4`.

### 9.4 Decision sequence (trigger: playhead reaches the diamond's top vertex)

| t (ms) | Element | Animation |
|---|---|---|
| 0 | diamond outline | dashoffset perimeter (≈ 253) → 0, 420 ms `--ease-out`; fill fades in at 200 ms |
| 200 | diamond label | opacity, 300 ms `--ease-io` |
| 300 | → YES connector | draw 260 ms |
| 480 | YES circle | scale .4 → 1, `--spring` 500, then "YES" opacity 200 ms |
| 420 | ← NO connector | dotted mask-reveal 300 ms |
| 620 | NO circle | scale .4 → 1, `--spring` 500 |
| 700 | NO caption | y 8 → 0 + opacity, 400 ms `--ease-out` |
| 800 | feedback loops | dotted mask-reveal along the path, **900 ms cubic-bezier(.65,0,.35,1)**, arrowheads fade 120 ms at the end |
| 1700 → ∞ | feedback loops idle | "marching" dots: `stroke-dashoffset: 0 → -12`, **1200 ms linear infinite**. Pause with an IntersectionObserver when off-screen |
| D1 only, 600 | YES loop + traveller | YES1 loop path draws 700 ms. The blue traveller dot runs along it (`offset-path: path('M888,392H986V652')`, `offset-distance 0 → 41 %`), 1200 ms `--ease-out`, and comes to rest at (986, 549.5) |

### 9.5 Launch burst (step 08 trigger)

| t (ms) | Element | Animation |
|---|---|---|
| 0 | Launch connector | draw 300 ms `--ease-out` |
| 250 | black half-disc + blue disc | scale 0 → 1, `--spring` 500. Blue tick `scaleY 0 → 1` (origin bottom) at 450 |
| 350 | rays | each ray's dashoffset (len → 0) 500 ms `--ease-out`, **delay = 350 + 14 ms × --i**, so the rays fire outward from 0° to ±108° |
| 1000 → ∞ | rays idle | opacity .55 ↔ 1, 2400 ms `ease-in-out` alternate infinite, `animation-delay: calc(var(--i) * -180ms)`. Pause off-screen |

### 9.6 Sign-off

Triggered when the sign-off top reaches 85 % of viewport height:

| t (ms) | Element | Animation |
|---|---|---|
| 0 | bottom rule | scaleX 0 → 1 (origin left), 1000 ms `cubic-bezier(.65,0,.35,1)` |
| 400 | rule dot | slides from x 81 to 177.4 (`translateX`), `--spring` 500 |
| 1000 | up-arrow segment | draws 200 ms |
| 150 | "Details matter." | mask line reveal 900 ms `--ease-out` |
| 450 | divider | scaleY 0 → 1, 400 ms |
| 500 | paragraph | y 40 → 0 + opacity, `--spring` 500 |
| 600 | "04 — 07" | opacity, 300 ms |

### 9.7 Performance and accessibility

* Animate only `transform`, `opacity`, `stroke-dashoffset` and `letter-spacing`. Letter-spacing runs only once and only on small text. Use one rAF loop with a passive scroll listener. Avoid layout reads inside the loop (cache `sectionTop` on resize via ResizeObserver).
* Add `will-change: transform` only while an element is animating.
* **Reduced motion:** disable the playhead, marching dots and ray shimmer. All elements render in their final state, with optional 200 ms opacity fades.
* Diamonds and YES/NO are `aria-hidden`; each decision has an `sr-only` sentence. Brackets use `<ul>` with list semantics. The headline is one `<h2>`; the line spans are presentational.
* Contrast: notes `#4D4D4D` 8.4:1; diamond labels `#6E6E6E` 4.95:1; accent on white 5.6:1. The lighter source greys (`#8A8A8A`) were darkened on purpose.

---

## 10. QA checklist (desktop at 1333 viewport)

* [ ] Spine centre at x 748.5. Node 02 centre y 512.5; node 09 centre y 1748.5.
* [ ] Headline baselines at 330, 432, 535, 638 and 742 (±2). "Becomes" right edge at x 524 (±6). Blue dot centre (630, 745).
* [ ] D1/D2 at x 749; D3 left vertex on the spine (x 748). Diamonds 104 × 72. YES Ø 40, NO Ø 32.
* [ ] Dotted period 6 px (2 on / 4 off). Arrowheads 8 × 6.
* [ ] Bracket serifs 10 px. List pitch 22.3 (DESKTOP list 20).
* [ ] Burst fan centre (1089, 1647), inner radius 40, longest ray ≈ 148.
* [ ] Bottom rule y 1848 from x 81 to 971, up arrow at 971, dot centre x 177.
* [ ] No text overlaps the headline (fix §7.5-1). No horizontal scroll at 320 / 375 / 810 / 1199 / 1200 / 1440.

---

## Appendix A — Measurement data (raw)

* Headline letter blocks: How 79–309 · An 72–213 · Idea 238–435 · Becomes 79–524 · An 72–214 · Experience 79–606 · dot 617–643 × 732–758. Stem of H is 13 px; cap 93.
* Wordmark letter boxes start at x = 81, 96, 116, 135, 152, 173, 187, 207, 226 (pitch ≈ 18.1).
* Top dot Ø 14.5 @ (685.1, 108.0). Traveller dot Ø 14.2 @ (985.6, 549.4). Rule dot Ø 14.5 @ (177.4, 1844.2).
* Rings: outer radius 15.5 (left edge 733.5 for x 748.5; top edge 497 for y 512.5). Inner dots Ø 10 (744–753).
* Line darkness integrals (Σ(254 − v) across the stroke): spine 241–308, YES loop 232, upper spine 93–127, boxes 205, brackets 240, bottom rule 374, launch line ~330, footer divider ~270.
* Burst long rays (angle°, r_in–r_out): −78.9 40–103 · −66.5 39–121 · −54.4 39–125 · −42.0 40–141 · −31.4 39–145 · −21.3 40–137 · −11.2 39–147 · 0 39–143 · 11.9 39–136 · 23.3 39–119 · 35.2 38–118 · 47.8 39–104 · 61.5 38–92 · 74.8 39–77.
* Reference motion: spring {stiffness 400, damping 30, mass 1} ×20 uses; y-offsets 40/60/80; delays 0/.2/.3/.4/.5 s; tween .3 s [.44,0,.56,1]; one spring {bounce .2, duration .4, delay .6}.

---

## Critic additions

### A. Breakpoint statement in §1 is wrong
The Framer reference uses **1440 / 800** (`#__framer__breakpoints`, verified), not 1200/810.
- **Poster switch at 1200 px.** Keeping the poster at ≥ 1200 is a legitimate *page-local* decision (u ≥ 0.9). Name it as such in the CSS, e.g. `/* approach-local */ @media (min-width:1200px)`.
- **Phone rules (§8.4).** Apply them at **≤ 799.98** so they match the global header and footer.
- **Tablet rules.** §8.2 then covers 800–1199.98.

### B. `--W: min(100vw, 1440px)` causes horizontal scroll on Windows and Linux
- **Problem.** `100vw` includes the classic scrollbar (15–17 px). The menu also sets `scrollbar-gutter: stable`. At a 1280 px window the poster is therefore 1280 px wide inside a 1263–1265 px layout viewport, so the page scrolls sideways.
- **Effect on QA.** §10's "no horizontal scroll at 1200/1440" fails on every non-overlay-scrollbar system.
- **Fix:** use container units:
```css
.approach-wrap{ container-type:inline-size; }                       /* full-width parent */
@media (min-width:1200px){
  .approach{ --u:calc(min(100cqw, 1440px) / 1333); width:calc(1333 * var(--u)); height:calc(2000 * var(--u)); margin-inline:auto; }
}
```
`cqw` resolves against the wrapper's content box, which excludes the scrollbar. The rest of §7.3 is unchanged.

### C. Collision with the global sticky header
The site header is a sticky 80 px wrapper (64 px on phone) holding the 800 px pill, which spans x 320–1120 at 1440. The poster masthead sits at y 31–72 dpx (31–78 px at u 0.9–1.08). The discipline strip (x 531–894 dpx) is directly under the pill.
- **Fix:** start the poster below the header. Use `.approach-wrap{ padding-top: var(--nav-h) }` (80 / 64 px); no dpx coordinates change.
- **Optional:** drop the poster's own "tesseract" wordmark, because the header already shows the brand. If you keep it, render it from `{BRAND}` in lowercase, 0.39 em tracked. The mock says "tesseract", the logo "TESERACT" and the doc "TESSERACT", so it must follow the brand decision.

### D. Minimum text size at u = 0.90 (1200 px)
Several sizes fall below 10 px at u = 0.9:
- discipline strip 10 dpx → 9 px;
- NO 10 dpx → 9 px;
- YES 11 dpx → 9.9 px;
- diamond labels 10.5 dpx → 9.45 px;
- RESULT micro label 9.5 dpx → **8.55 px**.

Use `font-size: max(10px, calc(N * var(--u)))` for every role ≤ 11 dpx. All of them are centred or left-anchored, so positions hold.

### E. Accent colour vs brand
- **Current plan.** PLAN keeps the blue `#0756FB` locally. It is the only blue on the site; brand red is used everywhere else.
- **Red alternative with the same contrast:** `#D20104`, the image-3 swatch fill.
  - It gives **5.6:1 on white**, identical to `#0756FB`. White on it is also 5.6:1.
  - So "RESULT", YES discs and dots stay AA.
  - `#FB2629` is only 3.9:1 and fails for the 14 px RESULT label.
- **Decision.** This is the owner's call, but the red option removes a one-off brand colour.

### F. Copy reminders (from §6, confirmed against `master.txt` L83–116)
- Index "02 — 09" becomes "04 — 07".
- Use the intro from the doc (L85–86).
- Step 01: prepend "Before we design anything,".
- Step 02: add "Result: A clear project blueprint." (L94).
- Step 05: split into two sentences (L103/L105).
- Step 06: add the lead sentence (L107).
- The "Details matter." sign-off is copy borrowed from Who We Are.
- "A BETTER DIGITAL EXPERIENCE" and the discipline strip do not appear in the doc. Treat them as decoration only.
