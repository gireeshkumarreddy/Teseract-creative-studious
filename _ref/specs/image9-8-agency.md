# Images 9 + 8 — "A Different Kind of Agency" (HOME section 5, parts 1 + 2), black theme

Sources: `WD/_ref/images/9.webp` (1614 × 1739) and `WD/_ref/images/8.webp` (1614 × 963). Both share the same
1614-px artboard width, so they are one continuous composition: image 8 starts with a full-width hairline that is the
seam between the two parts.
Copy source: `scripts/content.py` → `HOME['agency']` (+ the few document phrases listed in §4).
Brief: `_ref/specs/DARK-THEME.md` (black theme, content rules, SEO/GEO).

All coordinates are **image px on the 1614 artboard** unless marked. `u` = 1 artboard px; in CSS
`1u = 100cqw / 1614` on a child of an `inline-size` container that is the artboard (see §7). `@1344` = px when the
artboard is the 1344-px site container at a 1440 viewport (factor 0.8327).

**Working prototype (black theme, all three breakpoints, real assets):** `WD/_work/spec98/mock/index.html`
(serve: `http://127.0.0.1:4174/_work/spec98/mock/index.html`). Screenshots: `WD/_builds/spec-98-shots/mock-{1440,834,390}.png`.
It is NOT site code — the section owner ports it to `sections/home_agency.py` + `24-agency.css` (see §7–§9).

Regeneration scripts (run from WD with `python -I`): `_work/spec98/seg.py` (BiRefNet/ISNet masks from the locally cached
`~/.u2net/*.onnx`, no network), `extract9.py`, `extract8.py`, `note.py` → `note_svg.py`, `halo.py` (edge QA), `rows.py`,
`ext9.py`, `fit9.py`, `fit8.py` (measurements). NB: the packaged workspace path exceeds MAX_PATH for Python — write
into `public/assets/agency/` through an extended path (`'\\\\?\\' + os.path.abspath(p)`; helper `LP()` in the scripts).

---

## 0. Summary

| Item | Image 9 | Image 8 |
|---|---|---|
| Background | `#FEFEFE` flat (254,254,254); faint warm floor shadow under the figure | `#FEFEFE` flat; long soft floor shadows falling to the lower-left |
| Headline | 2 lines, uppercase, light neo-grotesk, cap 119.5 px, line pitch 145 (lh 0.86), ink `#000` | 3 lines, uppercase, light, cap 94 px, pitch 108.5 (lh 0.82), ink `#000`, **red full stop** |
| Accent red | intro rule `#C20804` 96 × 3; splash `#DE0E11` | full stop (Ø14, renders `#F74E49`), rule 94 × 3 (`#C14944` blurred) |
| Secondary text | intro `#161616`, 31 px/1.38; point sub-lines `#363636` | sub `#020202`, 39.4 px/1.22, sentence case |
| Graphic system | 4 numbered annotations, 1-px grey elbow leaders (horizontal + one 24–45° diagonal), black `+` hot-spots (18 px, ~2 px stroke) | hand-lettered 3-line note tilted −19° + curved arrow pointing at the scene |
| Hero visual | astronaut leaping, red brain splash above the helmet, soft floor shadow | top-down meeting: two boucle armchairs, round table, laptop, cup, notebook, pen, two people shaking hands |
| Black-theme treatment | transparent cut-out (+ split body / splash layers) + faint ground glow carrying a black shadow layer | transparent cut-out + floor-shadow layer over a faint overhead "light pool" (or the baked `-onblack` composite) |

---

## 1. Image 9 — measurements

### 1.1 Element boxes (ink)

| Element | x0–x1 | y0–y1 | %W | %H | @1344 container (px) |
|---|---|---|---|---|---|
| Headline L1 "A DIFFERENT" (cap box) | 71–949 | 101–220 | 4.40–58.80 | 5.81–12.65 | x 59–790, y 84–183 |
| Headline L2 "KIND OF AGENCY." (cap box) | 75–1149 | 248–365 | 4.65–71.19 | 14.26–20.99 | x 62–957, y 207–304 |
| Intro, 4 lines (ink) | 1198–1561 | 148–303 | 74.23–96.72 | 8.51–17.42 | x 998–1300, y 123–252 |
| Red rule | 1201–1296 (96) | 339–343 (3-px core 340–342) | 74.41–80.30 | 19.49–19.72 | x 1000–1079, y 282–286 |
| Cut-out frame `agency-astronaut.*` | 462–1234 | 382–1580 | 28.62–76.46 | 21.97–90.86 | x 385–1028, y 318–1316 |
| Splash, main body | 520–1084 | 409–836 | 32.22–67.16 | 23.52–48.07 | x 433–903, y 341–696 |
| Splash incl. droplets | 512–1105 | 390–1060 | 31.72–68.46 | 22.43–60.95 | x 426–920, y 325–883 |
| Astronaut figure | 470–1226 | 781–1571 | 29.12–75.96 | 44.91–90.34 | x 391–1021, y 650–1308 |
| Floor shadow frame `agency-astronaut-shadow.*` | 380–1614 | 1540–1739 | 23.54–100 | 88.56–100 | x 316–1344, y 1282–1448 |
| P1 "01" | 148–161 | 580–592 | 9.17–9.98 | 33.35–34.04 | x 123–134, y 483–493 |
| P1 title (2 lines) | 148–388 | 617–700 | 9.17–24.04 | 35.48–40.25 | x 123–323, y 514–583 |
| P1 sub (2 lines) | 154–380 | 724–767 | 9.54–23.54 | 41.63–44.11 | x 128–316, y 603–639 |
| P2 "02" | 1264–1280 | 580–592 | 78.31–79.31 | 33.35–34.04 | x 1053–1066, y 483–493 |
| P2 title | 1264–1518 | 616–697 | 78.31–94.05 | 35.42–40.08 | x 1053–1264, y 513–580 |
| P2 sub | 1267–1415 | 719–761 | 78.50–87.67 | 41.35–43.76 | x 1055–1178, y 599–634 |
| P3 "03" | 149–166 | 1028–1040 | 9.23–10.29 | 59.11–59.80 | x 124–138, y 856–866 |
| P3 title | 150–469 | 1065–1150 | 9.29–29.06 | 61.24–66.13 | x 125–391, y 887–958 |
| P3 sub | 154–354 | 1172–1215 | 9.54–21.93 | 67.40–69.87 | x 128–295, y 976–1012 |
| P4 "04" | 1204–1220 | 1176–1188 | 74.60–75.59 | 67.63–68.32 | x 1003–1016, y 979–989 |
| P4 title | 1206–1506 | 1213–1295 | 74.72–93.31 | 69.75–74.47 | x 1004–1254, y 1010–1078 |
| P4 sub | 1208–1499 | 1321–1364 | 74.85–92.87 | 75.96–78.44 | x 1006–1248, y 1100–1136 |

Rhythm: headline left 71; points inset to x 148 (left pair) and 1204/1264 (right pair). Intro column starts at x 1198
(49 px right of the headline's last glyph). The splash starts **26 px** under headline line 2's baseline — the visual
touches the type. Left pair numbers share a row with the right pair (P1/P2 at y 580); lower pair is staggered
(P3 y 1028, P4 y 1176). Inside a point: number cap-top → title cap-top **37**; title pitch **48**; title cap-top →
sub cap-top **107**; sub pitch **26.5**; sub is indented +5 px vs the title (optical: the title starts with a quote).

### 1.2 Typography (image 9)

Font size = cap ÷ 0.71 (Geist cap height; Helvetica Neue 0.714 — same px within 1 %). Weights from stem/em
(Geist stem/em: 300 = 0.069, 350 = 0.078, 400 = 0.085, 500 = 0.108, 550 = 0.120).

| Style | Cap | Size (u) | Pitch → lh | Measured stem | Weight → Geist | Tracking fitted in Geist | Case / colour |
|---|---|---|---|---|---|---|---|
| Headline | 119.5 | **168** | 145 → **0.86** | 13.1 px = 0.078 em | Light/Book → **300–350** | −0.094 em (L1), −0.128 em (L2: word space ~0.13 em) | UPPER, `#000` |
| Intro | 22 ('W') | **31** | 42.7 → **1.38** | ≈0.09 em | Regular → 350–400 | −0.06 … −0.08 em | Sentence, `#161616` |
| Point number | 12–13 | **18.3** | — | — | Regular 400 | tight (digits narrower than Geist's) | `01`…`04`, `#181818` |
| Point title | 36 | **50.7** | 48 → **0.947** | 6.05 px = 0.119 em | Medium → **500** (blur adds ~0.5 px) | −0.02 … −0.10 em (varies: AI-rendered); use **−0.035 em** | UPPER in ‘ ’ quotes, `#000` |
| Point sub | 16 | **22.5** | 26.5 → **1.18** | — | Regular 400 | **+0.03 … +0.045 em** (open tracking) | UPPER, `#363636` |

**The reference face is narrower than Geist** (headline/title fits need −0.09…−0.13 em, which makes Geist glyphs
collide). Do not chase the cap height; fit the *line length* instead:
- Headline: Geist **300**, `letter-spacing:-.06em`, `line-height:.86`, **154 u (= 9.54cqw of the artboard, 128 px @1440)**
  → line 2 ends at x≈ 975 px @1440, 114 px clear of the intro column (reference: 49 u). Cap = 109 u (−9 % vs ref).
- Point title: Geist 500, 50.7 u, −0.035 em, lh .947. Document titles are longer than the reference's two-word ones,
  so at the reference width (360 u) they set **3 lines** for 01–03 and 2 lines for 04 — correct, keep it; keep
  `copy-paste` unbreakable (`white-space:nowrap` span).
- Point sub: Geist 400, 22.5 u, +0.04 em, lh 1.178, max-width 300 u, `text-wrap:balance` (P4 sets as 3 balanced
  lines "GOOD DESIGN AND / TECHNOLOGY THAT / SERVES A PURPOSE."). Break P1 after the first sentence.
- Number: Geist 400 (or Geist Mono 400 on tablet/phone, see §6), 18.3 u, lh 1.
- Intro: Geist 350, 31 u, −0.03 em, lh 1.38; first sentence (`title`) in `--ink`, second (`kicker`) in `--ink-2`.

CSS box-top from a measured cap-top (Geist asc 1.005, desc 0.295, cap 0.71):
`box_top = cap_top − size × ((lh − 1.3)/2 + 0.295)` → title −6.0 u, sub −5.27 u, number −2.65 u, headline −0.075 × size.
In flow inside a point: title `margin-top: 15.35u`, sub `margin-top: 11.73u` (3-line titles push the sub down by 48 u).

### 1.3 Leader-line geometry (image 9)

All leaders are **1 px** lines (rendered ≈2.8 px blur, peak `#B8B8B8` → equivalent 1 px ≈ `#383838`), made of a
horizontal run + **one** diagonal (+ an optional second horizontal). `+` marks: black, arms 18 px (17–19), stroke ≈ 2 px,
centred on a "hot-spot" of the figure. Paths as SVG in artboard coordinates (viewBox `0 0 1614 1739`):

| Point | Leader path | Diagonal | `+` centre | Number rule | Hot-spot |
|---|---|---|---|---|---|
| 01 | `M194 590 H398 L489 516` (rule starts 33 px right of "01") | 39° up-right (dx 91, dy −74) | (500, 507) | — (leader *is* the rule) | splash, upper-left lobe |
| 02 | `M1065 525 H1124 L1180 580` (starts on the splash's right edge) | 45° down-right (dx 56, dy 55) | (1190, 588) | `M1292 590 H1398` (after "02") | splash, right edge |
| 03 | `M194 1039 H504 L580 1073 H678` | 24° down-right (dx 76, dy 34) | (695, 1072) | — | left hip / harness |
| 04 | `M1008 1126 H1069 L1135 1185 H1171` (starts 10 px right of the +) | 42° down-right (dx 66, dy 59) | (988, 1119) | `M1249 1188 H1343` (after "04") | backpack / right hip |

`+` centres as % of the cut-out frame (for the tablet/phone pins): 01 (4.9 %, 10.4 %), 02 (94.3 %, 17.2 %),
03 (30.2 %, 57.6 %), 04 (68.1 %, 61.5 %).
Black theme: leaders `rgba(255,255,255,.3)` 1 px (`vector-effect:non-scaling-stroke`, 1.5 px on 1× screens reads
like the reference), `+` in `--ink` at .9, 1.5–1.75 px. Leaders are decorative (`aria-hidden`).

---

## 2. Image 8 — measurements

| Element | x0–x1 | y0–y1 | %W | %H | @1344 container (px) |
|---|---|---|---|---|---|
| Top hairline (1 px `#D9D9D9`) | 67–1545 | 0–2 (core y 1) | 4.15–95.72 | 0.1 | x 56–1287 |
| Headline L1 "WE WORK" | 101–646 | 102–196 | 6.26–40.02 | 10.59–20.35 | x 84–538, y 85–163 |
| Headline L2 "CLOSELY WITH" | 103–860 | 212–305 | 6.38–53.28 | 22.01–31.67 | x 86–716, y 177–254 |
| Headline L3 "OUR CLIENTS" | 103–761 | 319–411 | 6.38–47.15 | 33.13–42.68 | x 86–634, y 266–342 |
| Red full stop (round, Ø 14) | 767–780 | 396–409 | 47.52–48.33 | 41.12–42.47 | x 639–650, y 330–341 |
| Sub, 2 lines (asc–desc) | 105–486 | 459–542 | 6.51–30.11 | 47.66–56.28 | x 87–405, y 382–451 |
| Red rule | 106–199 (94) | 573–575 (3) | 6.57–12.33 | 59.50–59.71 | x 88–166, y 477–479 |
| Cut-out frame `agency-meeting.*` | 578–1306 | 334–809 | 35.81–80.92 | 34.68–84.01 | x 481–1088, y 278–674 |
| Shadow frame `agency-meeting-shadow.*` | 540–1340 | 304–959 | 33.46–83.02 | 31.57–99.58 | x 450–1116, y 253–799 |
| Note text (tilted −19°) | 1243–1440 | 634–753 | 77.01–89.22 | 65.84–78.19 | x 1035–1199, y 528–627 |
| Note arrow (curve + head, points up-left at the right chair) | 1122–1252 | 677–738 | 69.52–77.57 | 70.30–76.64 | x 934–1043, y 564–615 |
| `agency-note.svg` box (arrow + text) | 1108–1454 | 601–758 | 68.65–90.09 | 62.41–78.71 | x 923–1211, y 500–631 |

The scene interlocks with the headline: the right armchair occupies x 1040–1303 from y 339 (beside lines 1–2), the
left armchair starts at y≈ 490 under line 3; the laptop's top corner (≈ 835, 408) almost touches "CLIENTS.".

### 2.1 Typography (image 8)

| Style | Cap | Size (u) | Pitch → lh | Stem | Weight → Geist | Tracking fitted (Geist 300) | Notes |
|---|---|---|---|---|---|---|---|
| Headline | 94 | **132.4** | 108.5 → **0.82** | 8 px = 0.060 em | Light → **250–300** | −0.088 / −0.108 / −0.127 em | UPPER; the full stop is red |
| Sub | 28 ('T') | **39.4** | 48.5 → **1.22** | — | Light/Regular → **300** | −0.031 em | Sentence case |

Recommendation: headline Geist 300, **132.4 u (8.2cqw, 110 px @1440)**, `letter-spacing:-.065em`, `line-height:.82`
— "CLOSELY WITH" then ends at x≈ 930 u, clear of the right chair (1040). Sub Geist 300, 39.4 u, −0.035 em, lh 1.22,
max-width 440 u. Use the same weight (300) for both section headlines so parts 1 and 2 read as one system (measured:
image 9 ≈ 350, image 8 ≈ 250).

---

## 3. Colour on black

| Role | Reference | Black theme | Contrast on `#000` (measured in the prototype @1440) |
|---|---|---|---|
| Headlines, point titles | `#000` | `--ink #f4f4f2` | 19.1 : 1 |
| Intro first sentence | `#161616` | `--ink` | 19.1 : 1 |
| Intro second sentence, image-8 sub | `#161616` / `#020202` | `--ink-2` (.74) | 10.2 : 1 |
| Point sub-lines, numbers | `#363636` / `#181818` | `--muted-strong` (.62) | 7.2 : 1 (numbers 6.4–7.0 : 1 sampled) |
| Hand-lettered note | `#0D0C0C` | `--ink-2` (decorative) | 10.2 : 1 |
| Rules, full stop | `#C20804` / `#F74E49` | `--red #fb2629` (one accent per part) | 5.4 : 1 (non-text) |
| Leaders | ≈`#383838` 1 px | `rgba(255,255,255,.3)` | 2.5 : 1 (decorative) |
| `+` hot-spots | `#000` | `--ink` @ .9 | — |
| Ground under figures | grey shadows on white | radial glow `rgba(255,255,255,.085)` → 0, black shadow layer on top | text never sits on the glow (max `#1e1e1e`; even there `--muted-strong` = 6.6 : 1) |

Red budget per DARK-THEME: part 1 = splash (photography) + intro rule; part 2 = full stop + rule. No other red.

---

## 4. Content mapping (document only)

| Slot | Reference text (NOT used) | Use (source) |
|---|---|---|
| Part 1 H2 | "A DIFFERENT KIND OF AGENCY." | `HOME.agency.label` "A Different Kind of Agency" (+ typographic full stop, rendered uppercase by CSS) |
| Intro (2 sentences) | "We don't do ordinary. … perform bigger." | `HOME.agency.title` "We don't want to look like every other agency." + `HOME.agency.kicker` "Because we're not trying to be one." |
| Point 01 title / sub | ‘CREATIVE THINKING’ / IDEAS THAT CREATE REAL IMPACT. | ‘No unnecessary layers’ (`HOME.agency.nots[0]`) / "We communicate. We share progress." (STORIES › Client Experience lines 1–2) |
| Point 02 | ‘STRATEGIC APPROACH’ / DESIGN WITH PURPOSE. | ‘No confusing language’ (`nots[1]`) / "Communicate your business clearly." (CREATE › Website Design body, closing words) |
| Point 03 | ‘MODERN TECHNOLOGY’ / SOLUTIONS THAT SCALE WITH YOU. | ‘No copy-paste solutions’ (`nots[2]`) / "Every project starts from zero." (WHO › Why We Started closing; FAQ) |
| Point 04 | ‘MEASURABLE RESULTS’ / BEAUTIFUL EXPERIENCES THAT PERFORM. | ‘Just good thinking’ / "Good design and technology that serves a purpose." (`HOME.agency.closing`, split at its comma) |
| Part 2 headline | "WE WORK CLOSELY WITH OUR CLIENTS." | "We work closely with our clients." (`HOME.agency.body`, first clause) — red full stop |
| Part 2 sub | "Turning your ideas into digital experiences." | "We understand what they're trying to achieve and build around that." (rest of `HOME.agency.body`; the shared subject "We" restored). Strictly verbatim fallback: "Understand what they're trying to achieve and build around that." |
| Hand-lettered note | "IDEAS / PLANNING / REAL RESULTS." (invented results claim) | **"LISTEN. / UNDERSTAND. / DESIGN."** (APPROACH 01 *Understand* — "First, we listen."; approach steps *understand … design*). Built only from glyphs the reference lettering contains (I D E A S P L N G R U T .). "Understand · Define · Build" (also document words) would need F and B, which the supplied lettering lacks — set it in type if the client prefers it. |
| Notebook print in the photo | "TESSERACT" (garbled, wrong brand spelling) | removed (inpainted to a plain black cover) |

**Strict alternative for the four points** (no borrowed sub-lines): titles only for 01–03, and 04 split as above.
**Micro-labels / borrowed lines introduced — for client approval:** the three sub-lines of 01–03 (above), the note
"Listen. Understand. Design.", the ordinals 01–04, the typographic full stop after the H2, and the restored "We" in
the part-2 sub. Nothing else is added; the reference's results/positioning claims ("perform bigger", "measurable
results", "real impact", "scale with you", "real results") are not used anywhere.

Photo rule: the meeting photo illustrates "working closely with clients" generically — never caption the people as
the TESERACT team or as a named client.

---

## 5. Assets — `WD/teseract-website/public/assets/agency/`

| File | Px | Bytes | What / how |
|---|---|---|---|
| `agency-astronaut.png` | 772 × 1198 RGBA | 884 k | master cut-out: astronaut + red splash + all droplets, no floor shadow, frame = image-9 box (462, 382)–(1234, 1580) |
| `agency-astronaut.webp` | 772 × 1198 RGBA | 160 k | same, q90 (use this) |
| `agency-astronaut-480.webp` | 480 × 745 RGBA | 96 k | phone source (`srcset` 480w / 772w) |
| `agency-astronaut-body.webp` | 772 × 1198 RGBA | 61 k | astronaut only, same frame (motion layer) |
| `agency-astronaut-splash.webp` | 772 × 1198 RGBA | 93 k | splash + droplets only, same frame (motion layer) |
| `agency-astronaut-shadow.png` / `.webp` | 1234 × 199 RGBA | 22 k / 15 k | floor shadow, black + alpha = measured density (peak .41), frame (380, 1540)–(1614, 1739) |
| `agency-meeting.png` | 728 × 475 RGBA | 352 k | master cut-out: 2 chairs, 2 people, table + leg, laptop, cup, notebook (print removed), pen; frame (578, 334)–(1306, 809) |
| `agency-meeting.webp` | 728 × 475 RGBA | 44 k | same, q90 (use this) |
| `agency-meeting-480.webp` | 480 × 313 RGBA | 28 k | phone source |
| `agency-meeting-shadow.png` / `.webp` | 800 × 655 RGBA | 42 k / 26 k | floor shadows (black + alpha = density, peak .72 in the under-table pocket, typical .15–.35), frame (540, 304)–(1340, 959); cut-out sits at offset (38, 30) |
| `agency-meeting-onblack.webp` / `.png` | 800 × 655 RGB | 40 k / 286 k | art-directed composite: scene + shadows over an overhead light pool (max `#1e1e1e`), all four edges pure `#000` (max value 2) — drop-in alternative on `--bg` |
| `agency-note.svg` | viewBox 346 × 157 (u) | 11.6 k | "LISTEN. / UNDERSTAND. / DESIGN." + arrow, filled paths, `fill="currentColor"`, text group `rotate(-19)`; box (1108, 601)–(1454, 758) |

**Matte method / QA**
- Astronaut: white suit on a white ground — a colour key loses the rim light, so the silhouette comes from BiRefNet
  (local model) and the 2-px rim mixes the ML soft edge (low contrast) with a colour projection against `#FEFEFE`
  (gloves, sole, visor) + colour decontamination. Splash: colour key; specular highlights enclosed by red are kept,
  holes that reach neutral white are real gaps (transparent), so the splash reads as a lacy 3D form on black.
  Leader lines, `+` marks and text that touch the frame are excluded (verified 0 alpha at all eight leader/plus areas).
- Meeting: BiRefNet on the untouched photo loses the left chair's outer arm (white boucle on white); a second pass on a
  highlight-stretched copy (rgb⁶) traces both chairs; union + clean-up. White ground inside the left man's curls is
  removed (neutral vs. the warm boucle), one trapped floor-shadow patch between table and shin is removed, the
  handwritten note/arrow and the headline are excluded, the floor shadow under the note is in-painted in the shadow layer.
- Halo check on black (`_work/spec98/halo.py`: edge pixels brighter than the solid interior within 4 px by > 40 lum):
  astronaut **0.024 %** (9 px, specular droplets), meeting **0 %**, splash 0.03 %, body 0 %. Zoomed previews on
  `#000`/`#0d0d0d`/white: `_work/spec98/pv/` — no white fringe on the visor, gloves, sole, hair, chairs or droplets.

**Decision (b): transparent cut-out, not a framed photo.** A framed version puts a 600 × 400 white rectangle in a black
page — the brightest object on the site, it breaks the black theme and kills the reference's free-floating
composition (headline and note interlocking with the scene). The cut-out keeps the white chairs and suits as the light
source of the composition and lets the headline wrap around the scene exactly as in the reference. Because a cut-out
loses its floor shadows on black, the shadows are exported separately and shown over a faint overhead light pool —
a "lit studio floor" that grounds the scene without a box. `agency-meeting-onblack.webp` is the same look baked into
one opaque file (edges exactly `#000`) for implementers who prefer a single image; only use it on a pure `--bg` band.

**Resolution budget (≤ 1.25 × natural px per DARK-THEME):**
astronaut 772 px → shown 643 px @1440 (0.83 ×), ≈ 500 px tablet, 358 px phone (use the 480 file); meeting 728 px →
606 px @1440, ≤ 728 px tablet (cap the wrapper at `max-width:728px`), 358 px phone (480 file). Never upscale either
beyond 965 / 910 CSS px. Both are below 1 × at desktop, so they stay sharp on 1× and acceptable on 2× screens.

---

## 6. Responsive plan (black theme)

Validated in the prototype at 1440 / 834 / 390 (no horizontal overflow: `scrollWidth == clientWidth` at all three).

**Desktop ≥ 1200 — reference composition.** One artboard container (`.agc`, `container-type:inline-size`) per part,
every position and font size in `u` (§7):
- Part 1 head row: grid `1fr 364u`, gap 48u; H2 154u/.86/−.06em; intro 31u + rule 96u × 3 px, padding-top 40u.
- Part 1 stage: `aspect-ratio:1614/1359` (artboard y 380–1739), margin-top 14u. Absolutely positioned: glow,
  shadow (380, 1160 stage-y), cut-out (462, 2), SVG leaders (viewBox `0 380 1614 1359`), four `<li>` points at
  (148, 197.35) (1264, 197.35) (149, 645.35) (1204, 793.35) — stage-y = image-y − 380, box-top corrections from §1.2.
- Part 2: hairline (`border-top:1px solid var(--line)`), stage `aspect-ratio:1614/963` (may be trimmed to 1614/880 —
  the bottom 80 u is only shadow fall-off); copy block at (101, 91), scene at (578, 334), shadow at (540, 304),
  light pool at (560, 330) 840 × 620u, note at (1108, 601) width 345.6u.
- At 1200–1439 everything scales with the container (title ≥ 35 px, sub ≥ 15.6 px, numbers ≥ 12.7 px).

**Tablet 800–1199 — figure + annotated list.** The side annotations would collide with the figure at this width, so:
- H2 `clamp(56px,11.2vw,128px)`, intro full width (max 560 px) under it, rule 72 px.
- Figure centred, `width:min(66%,560px)`; leaders/glow/shadow hidden; four `+` pins stay on the figure at the
  hot-spot % (§1.3) with tiny mono numbers (11 px Geist Mono, `--muted-strong`) — they key the list below.
- Points as a 2 × 2 grid (gap 40/32), each with a 1-px `--line` top border, number (13 px Geist Mono), title
  `clamp(24px,3.2vw,30px)` on one line, sub 13 px +.04em uppercase.
- Part 2: headline `clamp(48px,11vw,120px)` full width, sub `clamp(20px,2.8vw,28px)` max 520 px, rule; the scene
  wrapper right-aligned `width:min(92%,728px)` below the copy, shadow/pool positioned in % of the wrapper
  (shadow `left:-5.2%; top:-6.3%; width:109.9%`), note bottom-right `width:min(42%,300px); right:-2%; bottom:-22%`.

**Phone < 800.** Same order as tablet, one column: H2 `clamp(40px,12.2vw,64px)` (−.055em, lh .9), intro, rule,
figure full width (480 file) with pins, points stacked (title 26 px), part-2 headline `clamp(38px,11.4vw,60px)`,
sub, rule, scene full width (480 file), note `width:52%` under the scene's right side (leave ~88 px bottom margin).
Wrap the section in `overflow-x:clip` (the light pool and shadow layers bleed past the scene by design).

---

## 7. Implementation recipe (for `sections/home_agency.py` + `24-agency.css`)

Semantics:
```html
<section class="agency section" id="agency" aria-labelledby="agency-title">
  <div class="container"><div class="agc">                      <!-- container-type:inline-size -->
    <div class="agc-head">
      <h2 class="agc-title" id="agency-title" data-split>A Different Kind of Agency.</h2>
      <div class="agc-intro"><p><strong>We don’t want to look like every other agency.</strong> Because we’re not trying to be one.</p><span class="rule-red" aria-hidden="true"></span></div>
    </div>
    <div class="agc-stage">
      <div class="agc-figwrap">  glow · shadow img (alt="") · body+splash imgs or the merged webp (alt below) · 4 pins (aria-hidden) </div>
      <svg class="agc-lines" viewBox="0 380 1614 1359" preserveAspectRatio="none" aria-hidden="true"> leaders + plus marks (§1.3) </svg>
      <ol class="agc-points" role="list"> 4 × <li class="pt pt1"><span class="n" aria-hidden="true">01</span><h3>No unnecessary layers</h3><p>…</p></li> </ol>
    </div>
  </div>
  <div class="agc2"> hairline · <h3 class="agc2-title">We work closely with our clients<span class="dot">.</span></h3> · <p class="agc2-sub">…</p> · rule · scene (pool, shadow img alt="", cut-out img with alt, note span aria-hidden) </div>
  </div>
</section>
```
- Units: `.agc-stage > *, .agc-head > * { --u: calc(100cqw / 1614); }` then e.g. `left: calc(148 * var(--u))`
  (the custom property resolves against the artboard container at the use site). Titles get the quotes from CSS:
  `quotes:'\2018' '\2019'; h3::before{content:open-quote} h3::after{content:close-quote}` so the H3 text stays clean.
- Points list: `<ol>` (they are numbered); numbers `aria-hidden` (the list already conveys order).
- Alt text: astronaut — "Illustration: an astronaut leaps forward while a red, brain-shaped splash bursts above the
  helmet" (or `alt=""` if the owner treats it as decorative); meeting — "Seen from above: two people shake hands across
  a small round table with a laptop, coffee and a notebook" (no team/client claim). Shadows, glow, note: decorative.
- Note: `lib.svg_inline('assets/agency/agency-note.svg', cls='agc2-note')` (decorative, `fill=currentColor`, set
  `color:var(--ink-2)`; 11.6 kB). The prototype uses a CSS mask instead — in the site prefer the inline SVG, because
  only files referenced through `ctx.asset`/`lib.*` are copied by the build.
- Images: `lib.img(ctx, 'assets/agency/agency-astronaut.webp', alt, w=772, h=1198, attrs=f'srcset="{ctx.asset("assets/agency/agency-astronaut-480.webp")} 480w, {ctx.asset("assets/agency/agency-astronaut.webp")} 772w" sizes="(min-width:1200px) 48vw, (min-width:800px) 66vw, 100vw"')`
  (`ctx.asset` registers each file for copying); meeting likewise with 480w/728w and
  `sizes="(min-width:1200px) 45vw, (min-width:800px) 92vw, 100vw"`. Shadows: `lib.img(..., '', w=, h=)` (alt="").
- Full CSS for all three breakpoints is in the prototype `_work/spec98/mock/index.html` (≈ 120 lines) — port it,
  replacing raw values with tokens (`--ink`, `--ink-2`, `--muted-strong`, `--line`, `--red`).
- Internal link (SEO): this section has no CTA in the reference; if one is wanted, use descriptive text such as
  "Read how we work with clients" → `/client-stories/` or "See our approach" → `/our-approach/` under the part-2 rule.

---

## 8. Motion potential (all off under `prefers-reduced-motion`; use the shared attributes)

| Element | Motion | Notes |
|---|---|---|
| H2 / part-2 headline | `data-split` word rise | shared |
| Intro, sub | `data-reveal` fade-up, `--d:120ms` | shared |
| Red rules, hairline | `transform:scaleX(0→1)`, origin left, 600 ms `--ease`, after the text | add a `.is-in` hook or `data-reveal="fade"` + CSS |
| Astronaut | body layer fade + `translateY(40px→0)` 900 ms; idle float ±6 px / 7 s ease-in-out | use `agency-astronaut-body.webp` + `-splash.webp` stacked in the same frame |
| Splash | scale .96→1 + fade 1.1 s, idle drift ±10 px / 9 s counter-phase, optional scroll parallax −30 px over the stage | splash and body overlap only by droplets, layers align pixel-exact |
| Floor shadow | `scaleX(.94↔1)` + opacity .8↔1 in sync with the float (smaller when the figure rises) | |
| Leaders | `stroke-dasharray` draw 700 ms each, stagger 120 ms, after the figure lands; `+` rotate −90°→0 + fade | SVG paths are short; set `pathLength="1"` and animate `stroke-dashoffset:1→0` |
| Points | `data-stagger="80"` fade-up | |
| Point hover (desktop) | its leader brightens .3→.6 and its `+` rotates 45° | pairs text with hot-spot |
| Meeting scene | `.reveal-image` scale 1.04→1 + fade, or `data-clip` | |
| Note | arrow then text wiped in with `clip-path:inset(0 100% 0 0)→inset(0)` 900 ms after the scene | the SVG is filled paths, not strokes |

---

## 9. Verification done for this spec

- Prototype screenshots read at 1440 / 834 / 390 (`_builds/spec-98-shots/mock-*.png`): composition matches images 9 and
  8, no page overflow (`_tools/spec-98-overflow.cjs`: scrollWidth == viewport at all widths; the pool/shadow layers
  that extend past the viewport are clipped by `overflow-x:clip`), no console errors other than the prototype's
  missing favicon. Side-by-side sheets: `_builds/spec-98-shots/compare-9.png`, `compare-8.png`.
- Rendered text contrast measured from the screenshot pixels (`_tools/spec-98-contrast.cjs`): headlines/titles 19.1 : 1,
  intro/sub 10.2 : 1, point sub-lines 7.2 : 1, numbers ≥ 6.4 : 1.
- Site untouched apart from the new asset folder: `scripts/build.py --out ../_builds/spec-98` → 0 failures;
  `scripts/check.py` → 0 errors / 0 warnings; `_tools/qa.cjs … --routes=home,work/` → 0 problems.
