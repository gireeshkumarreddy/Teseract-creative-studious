# Reference spec: SERVICES (`#services1`) and TESTIMONIALS (`#testimonials`)

Source: https://studio.budarina.design/ (Framer). Values come from the saved SSR HTML (`_ref/budarina/index.html`), the page module `page.mjs` (Framer component code, saved under `_ref/extracted/js_svc/`) and a headless Chromium render of the live site (Playwright, not the in-app browser). The render produced the screenshots and the measured boxes in `_ref/extracted/svc_shots/`. Anything I estimated is marked **(est.)**. Everything else was extracted exactly.

---

## 0. Breakpoints, design widths, globals

| Reference breakpoint (Framer) | media query | design width | our target |
|---|---|---|---|
| Desktop | `(min-width: 1440px)` | 1440 | `>=1200px` |
| Tablet | `(min-width: 800px) and (max-width: 1439.98px)` | 800 | `810–1199.98px` |
| Phone | `(max-width: 799.98px)` | 390 | `<=809.98px` |

The reference does **not** use the usual Framer 1200/810 breakpoints for layout. Its text-style presets switch at their own widths:
- H2 preset: 56px at >=1024, 48px at 720–1023, 32px below 720.
- H3 preset: 32px down to 720, then 28px.
- Body preset: 18px at >=810, 16px below 810.

At 1200–1439 the reference shows the *tablet* (stacked) layout. For our build, keep the side-by-side desktop layout from 1200px up. See §5.

- Page background: `#f2f2f2`, from token `--token-aa303802…`. Neither section sets its own background, so both sit on `#f2f2f2`.
- Main text colour token: `#161616`.
- Global smooth scroll: Lenis (Framer "Smooth Scroll" component) with intensity `10`.
- Fonts used in these two sections:
  - **Inter Display** 600, 600 italic, 700 (Framer-hosted rsms Inter Display).
  - **Inter** 400/500/600/700, plus 700 italic.
  - **Plus Jakarta Sans** 600/700 (Google).
  - **Poppins** 500 (Google).
  - **Helvetica** regular (system).
  - **Gloria Hallelujah** 400 (Google; 5.4px "see more" scribble inside the folder icon only).

---

## 1. Section label pill (shared by both sections; Framer component "BADGE")

Static. It has no hover and no animation.

```
.pill {
  display:flex; align-items:center; justify-content:center; gap:10px;
  padding:8px 12px; width:max-content; height:32.8px (auto);
  border-radius:57px;
  background: radial-gradient(50% 202.28% at 50% 50%, #5e5e5e 0%, #000 100%);
  position:relative;
}
.pill::after { /* Framer border overlay */
  content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  border:1px solid rgba(255,189,143,0.26);   /* faint warm-peach hairline */
}
.pill__dot {                         /* two of these, one on each side of the text */
  width:16px; height:16px; padding:4px; box-sizing:border-box;
  display:flex; align-items:center; justify-content:center;
  border-radius:31px; background:rgba(255,255,255,0.49);
  position:relative;
}
.pill__dot::after { content:""; position:absolute; inset:0; border-radius:inherit; border:1px solid rgba(0,0,0,0.35); }
.pill__dot > i { width:4px; height:4px; border-radius:50%; background:rgba(0,0,0,0.42); }   /* "screw" centre */
.pill__text {
  font: 500 14px/120% "Poppins", sans-serif;   /* 16.8px line */
  letter-spacing:0; text-transform:uppercase; color:#fff; white-space:pre;
}
```

Measured sizes: "SERVICES" pill is **140.7 × 32.8**; "TESTIMONIALS" pill is **172.8 × 32.8**.

---

## 2. SERVICES section (`#services1`, Framer name "SERVICES")

### 2.1 Section container

| | desktop ≥1440 | tablet 800–1439 | phone <800 |
|---|---|---|---|
| padding | `120px` (all sides) | `120px 48px` | `80px 16px` |
| gap (header → rows) | `80px` | `80px` | `56px` |
| layout | flex column, centred, `overflow:hidden` | same | same |
| measured height | 1928.6 @1440 | 3509 @1024 | 3169 @390 |

### 2.2 Header block (`.framer-1hbk6f5`)

The header is a flex column, centred, with `gap:20px` and `max-width:800px`. It contains the pill and then the H2.

H2, "Short Overview of What We Can Do for *Your Business*":
- `font-family:"Inter Display"`, `font-weight:600`, `font-size:56px`, `line-height:1.1em` (61.6px).
- `letter-spacing:-0.04em` (−2.24px at 56px).
- `color:#161616`, `text-align:center`, `text-wrap:balance`.
- "Your Business" is `<em>`: Inter Display **Italic 600**, same size, same colour, no other change.
- Measured box at 1440: 800 × 123.2 (two lines). It wraps as "Short Overview of What We / Can Do for *Your Business*".
- At 1024 it is still 56px. At 390 it is **32px**, line-height 35.2px, letter-spacing −1.28px, 358 × 105.6 (three lines).
- Header block height at desktop: 32.8 + 20 + 123.2 = **176px**.

### 2.3 Rows container (`.framer-5dpao1`)

The rows container is a flex column, `gap:16px`, `width:100%` (1200 at 1440). It holds three framed rows:
1. Large row 1, "Web/Mobile Apps": info card plus image.
2. Large row 2, "No-code Websites": info card plus image.
3. Small-cards row: "Branding & Logos", "2D & 3D Illustrations", "Motion Design".

There are no scroll, appear or hover effects on the rows or frames themselves. They are static. The only motion is component-level hover (§2.6, §2.9).

### 2.4 Grey outer frame (all three rows)

```
.svc-frame {
  display:flex; flex-direction:row; align-items:flex-start; gap:16px;
  padding:16px; width:100%;
  border-radius:48px;
  background-color: rgba(17,17,18,0.06);     /* #1111120f → renders ≈ #e4e4e4 on #f2f2f2 */
  position:relative; overflow:hidden;         /* small-cards frame: overflow:visible */
}
.svc-frame::after { content:""; position:absolute; inset:0; border-radius:inherit; pointer-events:none;
  border:1px solid rgba(0,0,0,0.06); }        /* #0000000f */
```

- Large rows measure **1200 × 472** (16 + 440 + 16). The small-cards frame measures **1200 × 456.6**.
- Tablet: large frames use `flex-direction:column`, so the info card sits above the image. The small-cards frame uses `flex-wrap:wrap`.
- Phone:
  - Large frames: `border-radius:40px; flex-direction:column; gap:8px; padding:8px`.
  - Small-cards frame: `border-radius:44px; flex-direction:column; gap:8px; padding:8px`.

### 2.5 Info card (left column of each large row)

```
.svc-info {
  flex:1 0 0; width:1px; align-self:stretch;      /* 568 × 440 @1440 */
  display:flex; flex-direction:column; justify-content:flex-start;
  padding:40px; border-radius:40px; background:#f9f9f9; z-index:2;
  position:relative; overflow:hidden;
  box-shadow:
    inset 0 4px 4px -2px rgba(0,0,0,0.12),
    inset 0 -4px 4px -2px rgba(0,0,0,0.12),
    inset 0 0 3px 0 rgba(0,0,0,0.24),
    0 0 0 1px rgba(0,0,0,0.08),
    0 7px 11.4px -7px rgba(31,28,28,0.15),
    0 16px 24px -7px rgba(31,28,28,0.08);
}
.svc-info::after { content:""; position:absolute; inset:0; border-radius:inherit; border:1px solid #fff; pointer-events:none; }
/* Row 1 ("Web/Mobile Apps"): gap:32px; align-items:center (children are 100% wide anyway)  */
/* Row 2 ("No-code Websites"): gap:20px; align-items:flex-start                           */
```

Content is top-aligned (justify-content:flex-start).

Tablet: `flex:none; width:100%; height:auto; align-self:auto`. Measured 896 × 353.6 @1024.

Phone: `border-radius:32px; padding:28px; width:100%`. Measured 342 × 489 @390.

**Text group** (`.framer-edm8o1`): flex column, `gap:12px`, width 100%. Its children, in order:
1. **Folder icon**, 47 × 48. See §2.6.
2. **H3** (preset "zqfxam"):
   - Inter Display 700, 32px, line-height 1.3em (41.6px).
   - letter-spacing −0.05em (−1.6px), `#161616`, `text-wrap:balance`.
   - Phone (<720): 28px (36.4px line).
3. **Description** (preset "21ogod"):
   - Inter 400, 18px, line-height 150% (27px), letter-spacing −0.3px, `#161616`, `text-wrap:balance`.
   - Below 810: 16px.
   - Measured 488 × 81 (three lines) @1440.

**Chips container** (`.framer-1sm9kwb`): `display:flex; flex-wrap:wrap; gap:8px; width:100%`. Row 1 at 1440 measures 488 × 74 (two lines of chips).

**Chip, row 1** (custom stroke icons):

```
.chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px 6px 8px;
        border-radius:10px; background:rgba(81,82,94,0.08); height:33px; white-space:nowrap; }
.chip svg { width:20px; height:20px; stroke:#737373; stroke-width:1.5; fill:none; stroke-linecap:round; stroke-linejoin:round; }
.chip span { font:500 14px/150% Inter; letter-spacing:-0.3px; color:rgba(0,0,0,0.58); }   /* #00000094 */
```

Row 1 chips and icons (saved under `_ref/extracted/svc_assets/chip-*.svg`): calendar-event "1-2 months MVP", wallet "$8,000-$12,000", weight "Clean & Modern UI", document-code "Dev Hand-off Ready", command "Retaining & Intuitive UX". The first chip measures **149.5 × 33**.

**Chip, row 2:**
- Differences from row 1: `gap:4px; padding:6px 10px 6px 6px`.
- Icons are **Phosphor regular, 20px**, `color:rgba(0,0,0,0.5)`: Timer "2 weeks", Wallet "$4,000-$8,000", Ruler "Research", Scroll "Storytelling + Copywriting", FigmaLogo "Design", FramerLogo "Development", Lightbulb "Easily Manage, Update & Scale".
- The price chip text uses `rgba(0,0,0,0.5)`.

### 2.6 Folder icon (Framer component "folder", 47 × 48, hover-animated)

The icon is built from layers, all absolutely positioned inside a 47 × 48 box with `overflow:visible`. The SVGs are saved in `svc_assets/folder-*.svg`.

| layer | size / position | look |
|---|---|---|
| `folder-back.svg` | inset 0 | dark folder back (#2A2F38 → #4C5054 gradient, #585858 edge) |
| `folder-page-back.svg` | 40 × 40, top `calc(45.83% - 20px)`, left `calc(51.06% - 20px)` | grey paper #DFDFDF / #CECECE |
| page-front group | 40 × 39, top `calc(45.83% - 19.5px)`, left `calc(48.94% - 20px)` | `folder-page-front.svg` (#F4F4F4 paper, 0.06px #E3E3E3 stroke) plus tiny "see more" text (Gloria Hallelujah 5.43px, centred at 53%/51%) |
| `folder-vector2-lip.svg` | 42 × 26, bottom 2px, centred | #666 gradient lip |
| front (row 1, "Variant 1") | `folder-front-dark.svg`, height 35, left 0, right −1px, bottom 0 | dark gradient front #23262C / #272A31 / #1B1A1A |
| front (row 2, "Variant 3") | div, height 31, left 0, right 0, bottom 0 | glass front: `linear-gradient(174deg, rgba(76,79,83,.8) 0%, rgba(39,42,48,.8) 78.4%, rgba(35,38,44,.8) 100%)`, `backdrop-filter:blur(1.15px)`, `border-radius:8.04px`, `box-shadow: inset 0 .23px 1.15px rgba(252,255,255,.5)` |

**Hover** (mouseenter or mouseleave on the icon itself) makes the papers pop out of the folder:
- page-back moves to `top:-9px; left:calc(46.81% - 20px)` and rotates −12°.
- page-front group moves to `top:-10px; left:calc(53.19% - 20px)` and rotates +6°.
- Enter uses spring `{stiffness:500, damping:40, mass:1}`. Leave uses spring `{stiffness:500, damping:60, mass:1}`.
- CSS approximation (est.): enter `transition: transform 420ms cubic-bezier(.34,1.3,.64,1), top 420ms…`; leave `350ms cubic-bezier(.22,1,.36,1)`.

### 2.7 Image card (right column of each large row)

The container (`.framer-11y3sv7-container` / `.framer-1of6ya-container`) is `width:50%` of the frame content box, `aspect-ratio:1.32727`. At 1440 it measures **584 × 440**.
- Tablet: `width:100%`. Measured 896 × 675 @1024.
- Phone: `width:100%; aspect-ratio:1.33061`. Measured 342 × 257 @390.

On desktop and tablet the card uses the variant **"simple"**: one framed image, static, no hover.

```
.svc-img { position:absolute; top:0; left:0; right:0; aspect-ratio:1.32727; border-radius:40px;
           /* same 6-layer box-shadow as .svc-info */ ; overflow:hidden; background:none; }
.svc-img::after { 1px solid #fff border overlay }
.svc-img img { width:100%; height:100%; object-fit:contain; object-position:center; border-radius:inherit; }
```

- Row 1 image: `nx3TsUmcv0VsUdsNXSnyNQRuKT8.png` (1920 × 1440). It is an isometric UI mock with a transparent edge, so the frame tint shows through.
- Row 2 image: `oDOFuLRmO84z6j97bzxiZ9Lck0.png` (1600 × 1200). It is a light-grey website mock that fills the frame.
- Image URLs follow the pattern `https://framerusercontent.com/images/<id>.png`. 512px previews are in `_ref/extracted/svc_imgs/`.

**Phone-only variant for row 1: "works" stack with a "Tap Here" badge.** Row 2 stays "simple" on phone. This could optionally be used on desktop too.

The stack is 4 cards. Each has the same frame (radius 40, 1px #fff border, same shadow stack) and is positioned with `transform: translate(-50%,-50%) rotate(r)` at a percentage of the container:
- **Default state:**
  - Image 1 fills the frame (top 0, left 0, right 0, rotate 0).
  - Image 2 is parked at `top:140%; left:134%`, rotated 3°, so only its top-left corner peeks into the bottom-right corner of the frame. It is clipped by the frame's `overflow:hidden`.
  - Image 3 is parked at `top:160%; left:149%`, rotated 3°.
- **Clicking the peeking card** advances the stack: "Variant 2", then 3, then 4.
  - The new current card animates to `top:0; left:50%; translateX(-50%); rotate 0`.
  - The previous card flies to `top:-22%; left:145%` and rotates 14°, so it now peeks from the top-right corner.
  - The next card moves to the bottom-right park position (`top:140%; left:134%`, rotate 13°).
  - Clicking the top-right card goes back one step.
  - Transition: spring `{stiffness:500, damping:60}`.
- **Peeking-card hover:** `scale:1.1; rotate:-1°` (or `-2°` for the back card). Spring `{stiffness:400, damping:30}`.
- **"Tap Here" badge:**
  - Size and look: 99 × 36, `background:#000`, `border-radius:12px`, `cursor:pointer`.
  - Text: Inter 600 14px/1.2 white, right 9px.
  - Icon: Phosphor ArrowBendLeftDown, white, 20px, left 5px.
  - Placement: centred at `top:83%; left:88%`, rotated −19°.
  - Hover: rotate −27°, y −11px, spring 400/30.
  - Idle "attention wiggle" loop: hold 2000ms, then rotate to 6°, −4°, 6°, −4° and back to 0°, with 100ms between steps (each step spring 500/60). The icon counter-rotates −13°, 9°, −13°, 10° and nudges ±3–4px vertically.
  - The loop repeats every ≈2.4s.

### 2.8 Small-cards row (frame §2.4, `overflow:visible`)

The three cards are `flex:1 0 0; align-self:stretch`. Each measures **378.7 × ≈424** at 1440; the Framer width hint is `(100vw − 304px)/3`.
- Tablet: cards get `min-width:320px` and wrap. At 1024 that gives 440 + 440 on the first line and 896 full-width on the second.
- Phone: `width:100%`, stacked with an 8px gap.

```
.svc-small {
  display:flex; flex-direction:column; gap:0; overflow:hidden; cursor:pointer;
  border-radius:40px; background:#f9f9f9;  /* 1px #fff border overlay + the same 6-layer shadow as .svc-info */
}
.svc-small__text { padding:40px; display:flex; flex-direction:column; gap:12px; }   /* phone: padding 28px */
.svc-small__art  { width:100%; height:210px; position:relative; overflow:visible; } /* clipped by the card */
```

Titles:
- "Branding & Logos" uses the H3 preset: Inter Display 700, 32px, −0.05em.
- "2D & 3D Illustrations" and "Motion Design" use **Plus Jakarta Sans 700, 32px, line-height 120%, letter-spacing −0.02em**. This is an inconsistency in the reference; we recommend using one style for all three.

Descriptions use preset "21ogod" (Inter 18/27, −0.3px).

### 2.9 Small-card artwork and hover choreography

All hover transitions are spring `{stiffness:500, damping:60, mass:1}`. A CSS approximation is ≈450ms `cubic-bezier(.22,1,.36,1)` (est.).

**Branding & Logos**

Idle state:
- A 311 × 212 group is centred horizontally, top `calc(40.95% - 106px)`.
- It holds two app-icon images:
  - A: 172 × 172, `right:20px`, vertically centred, rotate **15°**.
  - B: 121 × 121, `bottom:20px; left:15px`, rotate **−15°**, z-index 1.
- A hidden "brand kit" group has `opacity:0` and measures 736 × 276 (centred, `bottom:-50px`). Its contents start spread apart:
  - Image 162 × 154, r24, `bottom:121; left:574`.
  - Image 166 × 157, r24, `bottom:118; right:570`.
  - A 334 × 38 palette bar, `bottom:6`, centred.

Hover state:
- Icon A flies out to `top:calc(5.66% - 86px); right:-222px`.
- Icon B flies out to `bottom:89px; left:-186px`.
- The brand-kit group fades to `opacity:1` and shrinks to **336 × 201** at `top:-9px`, centred.
- Inside it, the images snap to the top-left (`top:0; left:0`) and top-right (`top:1px; right:0`) corners and the palette bar moves to `bottom:0; left:0`.
- The palette bar is 4 swatches, each 81px wide, radius 16, colours **#D9D9D9, #5D17EA, #14141A, #CEFF1C**, placed at x = 0, 85, (right 85), (right 0).

**2D & 3D Illustrations**
- The artwork is an 884 × 557 canvas (`overflow:hidden`), centred horizontally, top `calc(-32.38% - 278.5px)`.
- It contains an open grey "box":
  - Gradients `linear-gradient(-90deg,#c3c3c3,#b7b5b5 54.9%,#c5c4c4)` and `linear-gradient(163deg,#afafaf,#e7e7e7)`.
  - Floating SVG tag pills "2D/3D, Art, Illustrations, Mascots, Custom, Concept, Games".
- Two character cards (radius 24, 1px #fff border) sit in the box:
  - 130 × 177, rotate **11°**, at canvas (x 409, y 376.5).
  - 110 × 150, rotate **−7°**, at (334, 384).
- **Hover:** the cards rise out of the box. The first moves to top 327 (−49.5px) and the second to top 354 (−30px). Sizes stay the same.

**Motion Design**
- Artwork is a Spline iframe, `https://my.spline.design/escapeanimatedlandingpage-b32e11f11ff6d3761195270209ae600a/`.
- The iframe container is height 355, `bottom:-105px; left:-94px; right:-92px` (it bleeds out and is clipped by the card).
- No hover; `cursor:auto`.

### 2.10 Measured boxes (Playwright, viewport 1440)

| element | x | y (page) | w × h |
|---|---|---|---|
| `#services1` | 0 | 1789.6 | 1440 × 1928.6 |
| pill | 649.7 | 1909.6 | 140.7 × 32.8 |
| h2 | 320 | 1962.4 | 800 × 123.2 |
| row 1 frame | 120 | 2165.6 | 1200 × 472 |
| row 1 info card | 136 | 2181.6 | 568 × 440 |
| row 1 image | 720 | 2181.6 | 584 × 440 |
| row 1 h3 / desc / chips | 176 | 2281.6 / 2335.2 / 2448.2 | 488 × 41.6 / 81 / 74 |
| row 2 frame | 120 | 2653.6 | 1200 × 472 |
| small-cards frame | 120 | 3141.6 | 1200 × 456.6 |
| small cards | 136 / 530.7 / 925.3 | 3157.6 | 378.7 × 424.6 |

Desktop vertical rhythm: 120 top padding → 176 header → 80 gap → 472 → 16 → 472 → 16 → 456.6 → 120 bottom padding.

---

## 3. TESTIMONIALS section (`#testimonials`)

### 3.1 Section container

| | desktop | tablet | phone |
|---|---|---|---|
| padding | `120px` | `120px 80px` | `80px 16px` |
| gap (header → carousel) | `64px` | `64px` | `56px` |
| overflow | **hidden** (this clips the side cards at the viewport edge) | | |
| measured height | 1042.4 | 1042.4 | 1155 |

Spacing between sections: services bottom padding 120 plus testimonials top padding 120 gives **240px** from the small-cards frame to the "TESTIMONIALS" pill on desktop. On phone it is 160px.

### 3.2 Header (`.framer-y5lt1`)

The header is a flex column, centred, `gap:20px`, `max-width:720px`. It contains three items.

1. The pill, "TESTIMONIALS" (§1).
2. The H2, "How we helped `<br>` our ~~clients~~ partners". It sits in a 720px-wide row (`.framer-w05bmr`, `overflow:hidden`, relative):
   - Font: **Plus Jakarta Sans 600, 56px**, line-height 1.3em (72.8px), `#161616`, centred.
   - **Letter-spacing:** −0.03em at ≥1440, −0.04em on tablet, −0.04em at **32px** on phone.
   - `text-shadow: 0 1px 2px rgba(0,0,0,0.25)`.
   - Explicit `<br>` after "How we helped".
   - Measured 720 × 145.6.
   - **Strike on "clients":** this is not CSS `line-through`. It is a hand-drawn scribble SVG (`svc_assets/strike-clients.svg`, 128 × 72 viewBox, fill `#1A1A1A`) stretched with `fit:stretch` over the word, with `z-index:1`.
     - Desktop: `position:absolute; height:72px; bottom:-8px; left:216px; right:344px` (160px wide).
     - Tablet: `bottom:-14px; left:238px` (138px wide).
     - Phone: `width:91px; height:41px; bottom:-6px; left:91px`; the row and H2 are 358px wide.
3. The sub-line, "Fortunate to not just work together, but build connections that last a lifetime.":
   - Inter 400, 16px/150% (24px), letter-spacing −0.3px, `#161616`, centred, width 100%.
   - Desktop: one line, 720 × 24. Phone: two lines.

Header height on desktop: 32.8 + 20 + 145.6 + 20 + 24 = **242.4**.

### 3.3 Carousel (Framer built-in **Slideshow** component), desktop and tablet

Exact props extracted from `page.mjs`:

```
direction:"right", autoPlayControl:true, intervalControl:4 (s), dragControl:true,
itemAmount:1, startFrom:0, alignment:"center", gap:24, padding:12,
transitionControl:{ type:"tween", duration:0.7, ease:[0.44,0,0.56,1], delay:0 },
effectsOptions:{ effectsOpacity:0.1, effectsScale:0.8, effectsRotate:20, effectsPerspective:700, effectsHover:true },
fadeOptions:{ fadeContent:false, overflow:true /* overflow visible */, fadeWidth:48, fadeInset:0, fadeAlpha:0 },
arrowOptions:{ showMouseControls:false /* arrows hidden */, arrowSize:40, arrowRadius:40, arrowFill:"rgba(0,0,0,0.2)" },
progressOptions:{ showProgressDots:true, dotSize:10, dotsGap:8, dotsPadding:10, dotsInset:0, dotsRadius:130,
                  dotsFill:"rgb(84,84,84)", dotsBackground:"rgba(28,28,31,0.08)", dotsOpacity:0.3, dotsActiveOpacity:1, dotsBlur:0 }
```

**Geometry:**
- The container is **584 × 496**, centred in the section; at 1440 it sits at x 428.
- `section{padding:12px}`, so the content box is 560 × 472.
- The wrapper div has `position:absolute; inset:0; padding:inherit; overflow:visible; perspective:700px`.
- The `<ul>` is a flex row with `gap:24px`, `transform-style:preserve-3d`, `cursor:grab` (`grabbing` while dragging), `touch-action:pan-y`, `user-select:none`.
- Each slide `<li>` is **560px wide** (100% of the content box) and 472px tall. The card inside is top-aligned and 432px tall.
- The step distance is 560 + 24 = **584px**.
- The slide list is rendered **4 times** for an infinite wrap, and the track translateX wraps seamlessly.

**Per-slide 3D effect.** This is what makes the centre card crisp and the side cards small and faded. Let `p` be the slide's left edge relative to the content box: `p = slideIndex*584 + trackX`. Interpolate with linear piecewise mapping, clamped at the ends:

| p | −560 | 0 | 24 | 560 |
|---|---|---|---|---|
| opacity | 0.1 | 1 | 1 | 0.1 |
| scale | 0.8 | 1 | 1 | 0.8 |
| rotateY | −20° | 0 | 0 | +20° |
| transform-origin-x | 100% | 100% | 0% | 0% |

transform-origin-y is 50%.

At rest, the left neighbour has `opacity:.1; transform: scale(.8) rotateY(-20deg)` with origin at its **right** edge. The right neighbour has `scale(.8) rotateY(20deg)` with origin at its **left** edge. This was verified live: `matrix3d(0.7518,0,±0.342,…)` with origins `560px 236px` and `0px 236px`.

So the side cards keep a 24px gap to the centre card and their far edges recede (a coverflow fan). Visible projected width is ≈265px each at 1440.

There is **no blur filter**. The "soft" look comes from 10% opacity plus the 3D rasterisation. If you want blur, `filter:blur(2px)` driven by the same ramp is an optional embellishment (est.).

**Autoplay:**
- Every **4000ms** the track animates +584px (direction "right"). The card to the *left* of centre slides into the centre, so cards travel left to right.
- The animation is a tween of **700ms, `cubic-bezier(0.44,0,0.56,1)`**. Opacity, scale, rotation and origin follow the position, so they ease in sync.
- The live sample showed a translate from −3504 to −2920 to −2336px, with moves ≈4.2s apart.
- `effectsHover:true` means it does **not** pause on hover.
- It pauses while the tab is hidden (`visibilitychange`).
- Any manual navigation resets the 4s timer. Autoplay is suspended while dragging.

**Drag:**
- Drag is on the x axis, with direction lock, `dragMomentum:false`.
- On release:
  - If `|velocity| > 200px/s`, move `max(1, round(|dx|/560))` slides in the drag direction.
  - Otherwise, if `|dx| > 280` (half a card), move `round(|dx|/560)` slides.
  - Otherwise snap back.
- The snap uses the same 700ms tween.

**Pagination dots:**
- Position: `position:absolute; bottom:0; left:50%; transform:translateX(-50%)`, inside the 584 × 496 container. Measured pill **84 × 30** at (678, 4610.6), which leaves a ≈22px gap below the card.
- Pill: `display:flex; border-radius:130px; background:rgba(28,28,31,0.08)`, no blur.
- Four buttons with padding `10px 4px 10px 10px`, `10px 4px`, `10px 4px`, `10px 10px 10px 4px`.
- Each dot is a 10 × 10 circle, `background:#545454`. Opacity is **1 when active, 0.3 otherwise**, animated over **300ms**.
- Clicking a dot animates to that slide using the 700ms tween.
- Arrows exist but are `display:none`.

**Appear:**
- The carousel wrapper starts at `opacity:0.001` and fades to 1 over **300ms `cubic-bezier(.44,0,.56,1)`**, delay 0, on load (Framer optimized appear `2tnupa`).
- The slideshow also stays at 0.001 opacity until it has measured itself.
- No y or scale offset.

**Section-level motion:** none. The header, H2 and scribble have no scroll or appear effects.

### 3.4 Testimonial card (Framer component "testimonials")

```
.t-card {
  width:100%; /* 560 desktop, 334 phone */  padding:40px /* phone 28px */;
  display:flex; flex-direction:column; align-items:center; justify-content:flex-start; gap:20px;
  background:#fff; border-radius:24px; position:relative; overflow:visible;
  box-shadow: inset 0 0 3px 0 rgba(0,0,0,0.24), 0 0 0 1px rgba(0,0,0,0.08),
              0 4px 8px -7px rgba(31,28,28,0.12), 0 16px 32px -7px rgba(31,28,28,0.04);
}
.t-card::after { 1px solid #fff border overlay, radius inherit }
```

The card is ≈432px tall on desktop (content-driven).

Children, in order:
1. **Stars**: `svc_assets/stars-96x16.svg`, 96 × 16. Five solid **black** 16px stars on a 20px pitch.
2. **Quote**:
   - Inter 400, 18px, line-height **175%** (31.5px), centred, `#161616`, width 100%, about 4 lines on desktop.
   - Highlights use `<strong>` (Inter 700) on cards 1–2 and `<em><strong>` (Inter 700 *italic*) on cards 3–4.
   - The quote marks are part of the text.
3. **Author row**: flex row, centred, `gap:8px`. On phone it is a column.
   - Avatar: 44 × 44 circle, `object-fit:cover`, 1px #fff border overlay, `box-shadow:0 3px 4px -2px rgba(0,0,0,0.1)`.
   - Name block: flex column, `gap:4px`, `align-items:flex-start` (phone: centre).
   - Name: **Plus Jakarta Sans 700, 18px**, line-height 100%, letter-spacing 0, default text colour (#000).
   - Role: Inter 400, 14px, line-height 24px, `#757575`.
4. **Stat tiles row**: flex row, `gap:7.04px`, width 100%. On phone it is a column of full-width tiles.
   - Tile: `flex:1 0 0; background:rgba(0,0,0,0.04); border-radius:16px; padding:20px 16px; display:flex; flex-direction:column; justify-content:flex-end; align-items:flex-start; gap:12px`. Phone and single-tile cards use `align-items:center`.
   - Tile height ≈104px (measured on phone).
   - Number row: flex row, `gap:5px`, `align-items:center`.
   - Number: **Helvetica regular, 40px/40px, letter-spacing −0.8px, `#2e2e2e`**.
   - Optional green icon after the number: Phosphor **Rocket** regular 20px, `#00997E`, `rotate(43deg)`; or the custom 22 × 20 / 23 × 20 trend icons (`stat-icon-*.svg`, stroke `#00997E` 1.25px).
   - Label: Inter 400, 12px, line-height 100%, `#727272`.
5. **Corner "rivets"**: four absolute 7 × 7 circles, `background:#EDEDED`, `box-shadow:inset 0 2px 3px rgba(0,0,0,0.08)`, z-index 1, at:
   - top 21 / left 21
   - top 21 / right 19
   - bottom 20 / left 21
   - bottom 19 / right 19

**Card content in slide order** (slide 0 is shown first; with direction "right", the order then cycles backwards: 0 → 3 → 2 → 1):

| slot | quote (highlights in **bold**) | name / role | tiles |
|---|---|---|---|
| 0 | "I lead Product GenAI for Siri at Apple… have **high-standards** … Marina is a **world-class designer**. She designed two of my previous startups & **WOWed me and the team**…" | Ramzi Assaf / Senior Product Lead @ Apple | 100/10 Satisfaction Score · 2/2 🚀 Startups Launched |
| 1 | "Sesteem did an amazing job… **got my vision** … **process easy** … **looks fantastic** and **works perfectly**…" | Rostislav Haliplii / Founder @ Profit.com | 10x ↗ Retention Increase · 25% ↗ Conversion Rate |
| 2 | "Marina is ***incredibly creative, highly professional,*** and ***knows exactly what she's doing—better than most.*** …" | Bassel Assaad / Founder of Tracee App | single centred tile: 1month 🚀 Time to Launch MVP |
| 3 | "…able to ***take a concept from 0 to 1 in no time***…" | Elie Matta / SVP of Engineering @ GoCity | 1+ year Collaborating Time · 2/2 🚀 Startups Launched |

### 3.5 Tablet and phone deltas

- **Tablet (800–1439):**
  - Same 584 × 496 carousel and effects as desktop.
  - Section padding 120/80.
  - H2 letter-spacing −0.04em; scribble 138px wide, `bottom:-14px; left:238px`.
- **Phone (<800):** a separate Slideshow instance.
  - Container `width:100%; height:735px`, so the slide width is 358 − 24 = **334px**.
  - Same autoplay (4s), tween (0.7s ease .44,0,.56,1), drag, gap 24, padding 12 and dots.
  - Effects: `effectsOpacity:0, effectsScale:1, effectsRotate:0, effectsPerspective:1200`. Neighbouring cards fade fully out (0 opacity at ±1 slide) with no scale and no 3D.
  - Card padding 28px.
  - Author block is stacked and centred: avatar above, name and role centred.
  - Tiles are stacked full width (278 × 104), centred.
  - Card heights ≈555–666px.
  - H2 is 32px, −0.04em, 358 wide (83.2px tall).

### 3.6 Measured boxes (viewport 1440)

| element | x | y | w × h |
|---|---|---|---|
| `#testimonials` | 0 | 3718.2 | 1440 × 1042.4 |
| pill | 633.6 | 3838.2 | 172.8 × 32.8 |
| h2 | 360 | 3891 | 720 × 145.6 |
| scribble | 576 | 3972.6 | 160 × 72 |
| sub-line | 360 | 4056.6 | 720 × 24 |
| carousel `<section>` | 428 | 4144.6 | 584 × 496 |
| centre card | 440 | 4156.6 | 560 × ≈432 |
| side cards (projected) | 151 → 416 and 1024 → 1289 | | ≈265 wide |
| dots pill | 678 | 4610.6 | 84 × 30 |

---

## 4. Motion summary

| element | trigger | property | timing |
|---|---|---|---|
| Testimonials carousel wrapper | load | opacity .001 → 1 | 300ms `cubic-bezier(.44,0,.56,1)` |
| Carousel track | every 4000ms, drag, dot click | translateX ±584px; per-slide opacity/scale/rotateY/origin from position | 700ms `cubic-bezier(.44,0,.56,1)` |
| Carousel dots | slide change | opacity .3 ↔ 1 | 300ms (motion default ease) |
| Folder icon | hover icon | papers translate up 11–12px and rotate −12°/+6° | spring 500/40 in, 500/60 out |
| Branding card | hover card | logos fly out ±200px; brand kit fades in and converges | spring 500/60 |
| 2D & 3D card | hover card | character cards rise 49.5/30px | spring 500/60 |
| Phone "works" stack | tap peeking card | card swap (translate/rotate) | spring 500/60; card hover scale 1.1 spring 400/30 |
| "Tap Here" badge | idle loop / hover | wiggle 0→6→−4→6→−4→0° every ≈2.4s / rotate −27°, y −11 | spring 500/60, 100ms steps / spring 400/30 |
| Rows, frames, headings | none | none | none |

Framer spring to CSS approximations (est.):
- stiffness 500 / damping 60 ≈ `450ms cubic-bezier(.22,1,.36,1)`.
- 500/40 ≈ `500ms cubic-bezier(.34,1.25,.64,1)` (slight overshoot).
- 400/30 ≈ `450ms cubic-bezier(.34,1.35,.64,1)`.

---

## 5. Implementation notes for our build (breakpoints 1200 / 810)

- **Desktop ≥1200:**
  - Use the side-by-side large rows. Image is `width:50%`, aspect 1.32727; info card is `flex:1`.
  - At a 1200 viewport with 120px padding, content is 960: image 464 × 350, info card 448 wide. The row grows if info content is taller than 350.
  - For 1200–1439 you may use `padding-inline: clamp(48px, 8.33vw, 120px)` so the small cards (minimum ≈320) do not get cramped (est.).
- **Tablet 810–1199:** stacked rows (frames become columns) and wrapping small cards with `min-width:320px`.
- **Phone ≤809:** the phone values above.
- **Carousel without Framer:** render the slides 3–4 times (or clone the edges) and animate the track with WAAPI/GSAP using a 700ms `cubic-bezier(.44,0,.56,1)` ease. On every frame (rAF or GSAP `onUpdate`), compute each slide's `p` and apply the interpolation table from §3.3:

```js
const ITEM = 560, GAP = 24, PARENT = 560;            // desktop (phone: ITEM = PARENT = containerW - 24)
const C = [-ITEM, 0, PARENT - ITEM + GAP, PARENT];   // [-560, 0, 24, 560]
const lerp = (x, xs, ys) => { if (x <= xs[0]) return ys[0]; for (let i = 1; i < xs.length; i++) if (x <= xs[i]) { const t = (x - xs[i-1]) / (xs[i] - xs[i-1] || 1); return ys[i-1] + t * (ys[i] - ys[i-1]); } return ys[ys.length-1]; };
slides.forEach((el, i) => {
  const p = i * (ITEM + GAP) + trackX;
  const o = lerp(p, C, [0.1, 1, 1, 0.1]), s = lerp(p, C, [0.8, 1, 1, 0.8]),
        r = lerp(p, C, [-20, 0, 0, 20]),  ox = lerp(p, C, [1, 1, 0, 0]);
  el.style.opacity = o; el.style.transformOrigin = `${ox * 100}% 50%`;
  el.style.transform = `scale(${s}) rotateY(${r}deg)`;
});
// wrapper: perspective:700px; track: transform-style:preserve-3d; section overflow:hidden; carousel overflow:visible
```

- Autoplay with `setTimeout(next, 4000)` restarted after each move. Pause on `document.hidden`. Do not pause on hover. Respect `prefers-reduced-motion` (disable autoplay and 3D, crossfade instead).
- **Strike-through:** absolutely position `strike-clients.svg` over the word, or use an inline SVG path with `stroke-dashoffset` draw-on as an optional enhancement (est.). Keep a real `<s>`/`<del>` in the markup for accessibility.

---

## 6. Assets extracted

- `_ref/extracted/svc_assets/`:
  - Section label: none (CSS only).
  - Chips: `chip-calendar-event.svg`, `chip-wallet.svg`, `chip-weight.svg`, `chip-document-code.svg`, `chip-command.svg`.
  - Folder icon layers: `folder-back.svg`, `folder-page-back.svg`, `folder-page-front.svg`, `folder-vector2-lip.svg`, `folder-front-dark.svg`.
  - Testimonials: `stars-96x16.svg`, `stat-icon-117z5pa.svg`, `stat-icon-1gzi25k.svg`, `strike-clients.svg`, `slideshow-back-arrow.svg`.
- `_ref/extracted/svc_imgs/`: 512px previews of the service images (row images, branding icons, 2D/3D character cards).
- `_ref/extracted/svc_shots/`:
  - Screenshots of the live render: `services1_{d,t,p}.png`, `testimonials_{d,t,p}.png` at 1440, 1024 and 390.
  - `info_*.json`: measured boxes.
  - `carousel_*.json`: track and slide transforms sampled every 250ms.
- `_ref/extracted/js_svc/page.mjs`: Framer page bundle. Search it for `Jn(` (Slideshow), `ll=` (folder), `wl=` (small card), `Na=` (works stack), `fa=` (badge) and `_c` (testimonial card).

---

## Critic additions

### A. Breakpoints
- **The conflict.** The §0 "our target" column and §5 (1200/810) conflict with PLAN.md and `00-tokens.css`, which use the reference's own **1440/800** (verified in `#__framer__breakpoints`).
- **If 1440/800 is kept** (recommended for fidelity): between 800 and 1439 the large rows are stacked and the small cards wrap with `min-width:320px`, exactly as in the reference.
- **If side-by-side from 1200 is wanted:** declare it as a section-local `@media (min-width:1200px)` and apply §5's `padding-inline: clamp(48px, 8.33vw, 120px)`.

### B. Spring approximations
§4's bezier stand-ins (500/60 ≈ 450 ms `(.22,1,.36,1)`; 400/30 ≈ 450 ms `(.34,1.35,.64,1)`) differ from those in ref-hero-nav and ref-plans. Use the single table in `ref-hero-nav.md` → Critic additions §D:
- 400/30: `--spring` over 400 ms;
- 500/60: `--spring-soft` over 700 ms;
- tween: `cubic-bezier(.44,0,.56,1)`.

### C. Carousel content for "What We Believe + Our Numbers" (PLAN home §4)
The doc has **no testimonials**: `master.txt` L141–143 are `[Client testimonial goes here.]` placeholders. So:
- no stars, avatars, names or quotes;
- the coverflow needs **≥ 4 slides**. With 2 slides the left and right neighbours are the same card; with 3, the wrap shows a repeat on every step.

Suggested 4 cards, using doc text only:
1. "SIMPLE FOR PEOPLE. POWERFUL FOR BUSINESS." + the L16 sentence.
2. "Behind every beautiful experience, there should be a clear purpose." + "We make complex things feel simple."
3. Stat tiles "20K+ Community" · "400K+ Reach".
4. Stat tiles "Millions Views Generated" · "Global Clients & Projects" + the L20 sentence.

Stat tiles keep the reference style: 40 px number, 12 px label, `rgba(0,0,0,.04)` tile. "Millions" and "Global" are words, but at 40 px they are about 130 px and 115 px wide (est.). That fits the ≈204 px tile inner width ((480 − 7)/2 − 32), so no size change is needed.
