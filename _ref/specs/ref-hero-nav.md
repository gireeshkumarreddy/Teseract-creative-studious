# Reference spec: NAV BAR + HERO (studio.budarina.design)

Sources: `_ref/budarina/index.html` (SSR CSS, inline styles, `__framer__appearAnimationsContent`), plus the page/component JS modules fetched from framerusercontent.com into `_ref/js_dl/`. The unminified component CSS and props come from the JS. Intermediate dumps are in `_ref/extracted/`: `hero_tree_full.txt`, `nav_desktop_tree.txt`, `nav_mobile_tree.txt`, `all_css_rules.txt`, `appear_animations.json`, `page_module_nosvg.js` and `comp_4JFyF.js`.
Values are extracted exactly unless marked **(est.)**. Primary viewport: **1440 px**.

---

## 0. Breakpoints (important: they are not the usual Framer ones)

| Name (Framer) | Hash | Media query | Design canvas width |
|---|---|---|---|
| Desktop Wide | `1qit58p` | `(min-width: 1440px)` | 1440 |
| Tablet | `cbel8a` | `(min-width: 800px) and (max-width: 1439.98px)` | 800 |
| Phone | `1172iny` | `(max-width: 799.98px)` | 390 |

So a 1440 px viewport is exactly the first desktop pixel. Everything from 800 to 1439 px uses the tablet rules.
Text style presets use **their own** breakpoints:
- H1: ≥1024 px / 720–1023 px / <720 px.
- Body paragraph: ≥1440 px / 810–1439 px / <810 px.

These are listed in §4.

---

## 1. Global tokens

| Token | Value |
|---|---|
| Page/body bg (`--token-aa303802`) | **#F2F2F2** (fallback #D9D9D9) |
| Primary text (`--token-00af65c3`) | **#161616** |
| White token (`--token-cd9f24d5`) | #FFFFFF |
| White 50 % (`--token-547b5c15`) | rgba(255,255,255,.5) |
| Black 50 % (`--token-cecefbc2`) | rgba(0,0,0,.5) |
| Black 65 % (`--token-076bd8bd`) | rgba(0,0,0,.65) (preset default, overridden in hero) |
| Grey label (`--token-84002464`, not defined → fallback) | **#9BA1A5** rgb(155,161,165) |
| Red dot | **#ED3131** rgb(237,49,49) |

**Fonts**
- **Inter Display 600** (H1 only)
- **Inter** 400/500/600 (nav, body, buttons), Inter 500 *italic* (testimonial quotes)
- **Noto Sans Mono 500** ("LIMITED AVAILABILITY")
- **Poppins** 400/500 (tooltip, "You" chip)

The user project ships Geist / Geist Mono. A sensible mapping is Inter Display 600 → Geist 600 and Noto Sans Mono 500 → Geist Mono 500 (suggestion, not extracted).

**BG element** (`data-framer-name="BG"`, `.framer-m91p01`):
- `position:absolute; top:0; left:0; width:100%; height:1087px; z-index:1; overflow:hidden`
- `background: linear-gradient(180deg, rgba(255,255,255,0) 0%, #F5F5F5 100%)`
- Child "Shadow #0013" (`.framer-17d2oy3`) is the same gradient, 100 % × 1087 px, centred, so the gradient is stacked twice.

Net effect: #F2F2F2 at the top fading to #F5F5F5 at y = 1087 px. It is almost invisible, so a flat #F2F2F2 is an acceptable simplification.

**Page root**: flex column, centred, gap 0, `min-height:100vh`, fluid width (`width:auto` inline).

**Smooth scroll**: Lenis is mounted (component `framer-pnc1uf`, hidden on phone).
- `intensity: 10` gives Lenis `duration: 1.0 s`.
- Anchor `a[href*="#"]` clicks are intercepted and use `lenis.scrollTo(hash)`.
- Desktop and tablet only.

**Z-stacking**:
- BG: z 1
- Nav container: z 2, sticky
- Hero section: z 1 (later in DOM, so above BG)
- Gallery frame: z 0 (inside the hero)

---

## 2. Desktop geometry at 1440 × 900 (top of page, y in page px)

| Block | y-start → y-end | Size | Notes |
|---|---|---|---|
| Nav wrapper (in flow, sticky top:0) | 0 → 80 | 1440 × 80 | 16 px padding + 48 px pill + 16 px |
| `#hero` section | 80 → ≈1790 | 1440 wide | `padding: 64px 48px 56px`, flex column centred, **gap 56px** |
| container (`u8ezoo`) | 144 → ≈622 | 1344 wide, max-width 1440 | flex column centred, **gap 24px** |
| lockup (`9weylo`) | 144 → 515.2 | padding **16px**, gap **24px** | holds pill, H1 and paragraph |
| testimonial pill | 160 → 192 | 226 × 32 | |
| H1 | 216 → 421.2 | max-width 880; 3 lines × 68.4 | balanced wrap (est.) ≈ "Full-cycle design services / to help startups launch, / convert and scale better." |
| Paragraph | 445.2 → 499.2 | max-width 403; 2 lines × 27 | measured line widths 390 / 400 px |
| CTA block (`vd2imw`) | 539.2 → ≈621.6 | flex column, **gap 4px**, width min-content | |
| Buttons row (`nu6drx`) | 539.2 → 587.2 | row, **gap 8px**, centred | Contact ≈127 px + Plans ≈88 px (est.) |
| Availability badge | 591.2 → ≈621.6 | ≈ 30–37 px tall (est.) | |
| Marquee + gallery group (`1tbd01i`) | ≈677.6 → ≈1733.6 | flex column, **gap 8px**, width 100 % | |
| Logo marquee | ≈677.6 → 725.6 | 1344 × **48** | |
| Gallery frame "visual" | ≈733.6 → ≈1733.6 | 1344 × **1000** | 4 auto-scrolling columns |

The block heights are confirmed by Framer's own layout math in the JS: buttons start at `80 + 64 + 339.4`. The H1 wraps to 3 lines when measured with the real Inter Display 600 font at 72 px / −0.05em. Above the fold at 900 px tall, about 166 px of the gallery is visible.

---

## 3. NAV BAR (component "Nav Copy", `framer-PhzAD`)

### 3.1 Container and wrapper
- Page slot `.framer-mgk21j-container`:
  - `position: sticky; top: 0; z-index: 2; width: 100%; height: auto`
  - Phone: `top: -4px`
- Wrapper `.framer-19lh77y`:
  - `display:flex; flex-direction:row; justify-content:center; align-items:center; gap:16px; padding:16px; width:100%`
  - `border-radius:20px`, no background
  - Total height 80 px

### 3.2 Pill (`.framer-1538w3f`)
| Property | Value |
|---|---|
| layout | `flex: 1 0 0; max-width: **720px**; height: **48px**; padding: **8px**; display:flex; justify-content: space-between; align-items:center` |
| radius | **16px** |
| background | `linear-gradient(142deg, rgba(242,242,242,0.91) 0%, rgba(255,255,255,0.93) 100%)` |
| blur | `backdrop-filter: blur(10px)` (+ `-webkit-`) |
| border | **1px solid rgba(27,26,28,0.08)**, drawn inside via `::after` (`box-sizing:border-box; border-radius:inherit; pointer-events:none`) |
| shadow | **none** |

At 1440 the pill is exactly 720 px wide, centred, leaving 704 px of inner width.

### 3.3 Left group (`.framer-vx2j8n`)
- Fixed **width 165px**; row; gap **8px**.
- **Logo tile** (`x0jevc`):
  - 32 × 32 (aspect 1), radius **10.67px**
  - `background: radial-gradient(95.31% 95.31% at 19.53% 0%, #343434 0%, #000 100%)`
  - border 0.554 px #161518 (inside)
  - 16 × 16 glyph, gradient-filled, centred at 50 % / 46.875 %
- **Brand text** "Budarina":
  - Inter **600**, 16px (Framer default size), letter-spacing **−0.7px**, line-height **24px**
  - Colour #000 (default)

### 3.4 Centre links (`.framer-isfbzt`)
- `flex: 1 0 0; justify-content: center; gap: 8px`.
- 4 links: Works, Services, Pricing, FAQs. These map to the page, `#services1`, `#plans` and `#faq`.
- Link component "Link" (`framer-ISG4Z`):
  - Box: `padding: 0 8px`; inner wrapper height **28px**; radius **10px**
  - Background: `rgba(255,255,255,0)` at rest → **hover `rgba(26,26,31,0.11)`**
  - Text: Inter **500 14px / 20px**, colour **#191A19** rgb(25,26,25), no letter-spacing
  - Measured widths (est.): Works 59, Services 74, Pricing 63, FAQs 53 px. The total is ≈272 px including the gaps.
  - Hover transition: spring `stiffness 500, damping 60, mass 1`. This is over-damped (ζ = 1.34): 95 % at ≈320 ms, settled ≈700 ms. CSS approximation: `transition: background-color 350ms cubic-bezier(.25,.8,.35,1)` (est.).

### 3.5 Right group (`.framer-143wu94`)
Row, gap **8px**, justify flex-end, width min-content (≈165 px).

**Telegram button** ("telegram" component, `framer-EwEDY`)
- 32 × 32, radius **10.67px**, `overflow:hidden`
- bg `rgba(49,166,224,0.08)`, border 1 px `rgba(49,166,224,0.32)`
- Icon: 16 × 15, colour #3098CE, centred at 46.875 % / 50 %
- Hover is a "fly-through":
  - The centred plane moves to `right:-19px; top:-15px` and exits top-right.
  - A duplicate plane parked at `left:-19px; bottom:-15px` moves to centre.

**WhatsApp button** (same component, variant Whatsapp)
- bg `rgba(5,255,98,0.08)`, border 1 px `rgba(0,157,58,0.24)`
- Icon 17 × 17 #21B95A
- Hover: icon `rotate: 0 → 28deg`

Both social buttons use a spring of `duration 0.4 s, bounce 0.2`. That is equivalent to stiffness ≈505.6, damping ≈35.98 (ζ 0.8), with 1.4 % overshoot and settling in ≈380 ms.

**CTA "Let's Work"** ("Button Switch", `framer-Pckah`, variant `s-dark`)

| Property | Value |
|---|---|
| size | **85 × 32**, `overflow:hidden`, radius **12px**, bg **#000** |
| shadow | `0 0.72px 3.04px -0.83px rgba(0,0,0,.18), 0 2.75px 11.53px -1.67px rgba(0,0,0,.18), 0 12px 50.4px -2.5px rgba(0,0,0,.18)` |
| text | preset `ooo2k9`: Inter **500 12px / 16px**, letter-spacing **−0.02em**, **#FFF** |
| text stack | column, gap 10, height 14, `overflow:hidden`, centred (top ≈48.3 %): "Let's Work" (visible) above "Send Email" (hidden) |
| hover: text | Item order swaps (layout-animated slide up ≈26 px), so "Send Email" shows |
| hover: blob | A blob (`1ur8ake`, `rgba(255,255,255,0.26)`, radius 50) parked above the button (`top:-46px; height:40px; left:-25px; right:-26px`) expands to `top:-84px; bottom:-24px; left:-14px; right:-14px`. This is a soft white wash sweeping down. |
| hover: shadow | → `none` |
| transition | spring 500 / 60 / 1 |

### 3.6 Variants and behaviour
**Main** (desktop and tablet): as above.

**Mobile-default** (phone):
- Wrapper `padding: 8px` (design width 420).
- The **centre links are removed**; there is no hamburger.
- The pill holds only the logo group (165) and the right group (social + CTA), laid out space-between.

**Dark variants** (`scroll-dark` desktop/tablet, `mobile-dark` phone):
- Triggered while the **footer** is in the viewport (threshold 0, not once).
- Pill: border `rgba(255,255,255,0.06)` (mobile `0.08`), bg `linear-gradient(142deg, rgba(242,242,242,0.08), rgba(255,255,255,0.11))`.
- Brand text white.
- Links switch to "Dark Link": white text, hover bg `rgba(252,255,252,0.15)`.
- CTA switches to `s-light`: white bg, black blob, no shadow.
- Variant transition: tween **300 ms, delay 200 ms, linear** (`[0,0,1,1]`).

**Appear**: opacity only (see §9).

---

## 4. HERO lockup

### 4.1 Rotating testimonial pill ("review 2", `framer-Tzkav`, slot `.framer-x44ynd-container`)
**Slot**: **226 × 32**, `overflow: visible`, `cursor: pointer`. It has no appear animation and is visible immediately.

**Row** ("person"):
- `position:absolute; left:50%; top:50%; transform: translate(-50%,-50%)`
- `display:flex; gap:4px; align-items:center`, width min-content

**Avatar** ("Avatar Home 2", `framer-690z0`):
- **32 × 32 circle**, 1 px **#FFF** inner border
- Shadow `0 12px 24px -2px rgba(0,0,0,.12), 0 3px 4px -2px rgba(0,0,0,.1)`
- Image `object-fit: cover`

**Quote bubble** ("Overlay"):

| Property | Value |
|---|---|
| size | height **32px**, padding **12px**, width min-content, `overflow:hidden` |
| radius | **23px** |
| background | **`rgba(0,0,18,0.05)`**; no border, no shadow |
| text | Inter **500 italic 14px / 21px**, letter-spacing **−0.03em**, colour #000 (default), `white-space: pre` |
| measured row widths (est.) | 32 + 4 + (text + 24): 227 / 287 / 304 / 259 px |

The rows are centred on the 226 px slot and may overflow it.

**4 slides** (quote, then the hover tooltip text):

| Slide | Quote | Tooltip | Avatar URL |
|---|---|---|---|
| 1 | "WOWed me and the team!" | "Ramzi Assaf ~ Manager @ Sunny People, Lead @ Apple" | `…/7Nwj29Jw2ZDRu3HNNHS8PvV78.png` |
| 2 | "Product looks & works fantastically!" | "Rostislav Halipi ~ CEO @ Profit Pro" | `…/mueESnGcs56MpR9u1qE62diSarY.png` |
| 3 | "...took a concept from 0 to 1 in no time!" | "SVP of Engenering @ Sunny People" | `…/KyycioZcmugsotQKBzJZhbrUk.png` |
| 4 | "Top 1% talents! Highly creative!" | "Bassel Assad ~ CEO @ Trace" | `…/XT8erU9RVDll95DG0BhwC5fZx0.jpg` |

The tooltip text, including the typo, is reproduced as found. Avatar URLs are under `https://framerusercontent.com/images/`.

**Rotation timing** (from the component JS):
- Each variant schedules the next with `delay(() => setVariant(next), 2000)` when it becomes active.
- So the **period is 2000 ms per slide**: 1→2→3→4→1, an 8 s full cycle.
- The transition between slides is a **tween of 500 ms, `cubic-bezier(0.44, 0, 0.56, 1)`**.
- Visible hold ≈1.5 s.

**Slide motion** (a vertical "roll"):

| Role | Position | opacity | rotateX |
|---|---|---|---|
| Incoming (parked) | `top:175%` (≈56 px), below the slot | 0 | −50° |
| Active | `top:50%` | 1 | 0 |
| Outgoing | `top:-40px`, right-aligned (`right:-1px`) | 0 | +50° |

- `filter: blur(0px)` is set but not animated.
- There is no `perspective` on the parent, so rotateX reads as a vertical squash (cos 50° ≈ 0.64).
- Position changes are layout-animated with the same 500 ms tween.

**Hover tooltip** (`.framer-xdht5v`):
- `position:absolute; left:50%; top:-34px; translateX(-50%)`
- bg **#1F1F1F**, radius **6px**, padding **6px 8px**
- Text: Poppins **400 12px**, line-height 1em, letter-spacing 0.02em, #FFF
- Speech tail: SVG 34 × 13 at `top:20px`
- Opacity 0 → 1 on hover, spring `stiffness 500, damping 62, mass 2` (ζ 0.98, ≈290 ms to 95 %)
- The slide cycle keeps running during hover.

### 4.2 Headline H1 (`.framer-k3t41l`, preset `wd4756`)
| Property | ≥1024 px | 720–1023 px | <720 px |
|---|---|---|---|
| font | **Inter Display 600** | same | same |
| size | **72px** | 64px | 32px |
| line-height | **0.95em (68.4px)** | 0.95em (60.8px) | 1.05em (33.6px) |
| letter-spacing | **−0.05em (−3.6px)** | −0.05em | −0.05em |
| colour | **#161616** | | |
| align / wrap | center, **`text-wrap: balance`** | | |
| box | `width:100%; max-width:880px` (phone: max-width unset) | | |

Text: "Full-cycle design services to help startups launch, convert and scale better." It is 3 lines at all three sizes (measured).

### 4.3 Sub paragraph (`.framer-14h5gqv`, preset `21ogod`)
- Inter **400**.
- **18px** at ≥810 px, **16px** below 810 px. At 800–809 px the tablet layout gets 16 px.
- line-height **150 %**, letter-spacing **−0.3px**, colour **#161616**, `text-align:center`, `text-wrap: balance`.
- Box: `width:100%; max-width: 403px`.
- Text: "We deliver world-class designs, 3D, animations and no-code development to Tech & AI startups." This is 2 lines at 403 px and 2 lines at 358 px on phone.

---

## 5. Buttons (component "Button Call", `framer-4JFyF`)

| | **Contact** (variant "Variant 7") | **Plans** (variant "secondary") |
|---|---|---|
| slot | height **48px** (phone **56px**, width 100 %) | same |
| layout | `display:flex; gap:8px; align-items:center; justify-content:center; padding: **12px 20px 12px 12px**; width:min-content; overflow:hidden` | `padding: **12px 24px**` |
| radius | **16px** | **16px** |
| bg | **#000** | **#FFF** |
| border | none | **1px rgba(0,0,0,0.08)** (inside) |
| shadow | `0 0.6px 1.32px 0 rgba(0,0,0,.01), 0 2.29px 5.03px 0 rgba(0,0,0,.05), 0 10px 22px 0 rgba(0,0,0,.2)` | `0 1px 3px rgba(0,0,0,.04), 0 6px 6px rgba(0,0,0,.03), 0 13px 8px rgba(0,0,0,.02), 0 22px 9px rgba(0,0,0,.01), 0 35px 10px rgba(0,0,0,0)` |
| text | preset `73mefd`: Inter **500 16px / 24px (150 %)**, letter-spacing **−0.3px**, **#FFF** | same preset, **#161616** |
| leading visual | avatar group 28 px tall (see below) | none |
| width (est.) | 12 + 29 + 8 + 58 + 20 ≈ **127px** | 24 + 40 + 24 ≈ **88px** |
| hover | avatar group widens (below) | **shadow → none** |
| hover transition | spring `stiffness 500, damping 60, mass 1` | inherited (est. same spring) |

Links: Contact goes to `mailto:`; Plans goes to `#plans`.

**Contact avatar group** (`.framer-zbx644`, 28 px tall, overflow visible). The layers are absolute, listed bottom to top:
1. 2nd avatar `uk5fwr`: 28 × 28 circle, radius 320.
2. "You" chip `j2gvka`: 28 px circle, bg **#575757**, text "You" Poppins **500 10px** rgba(255,255,255,.5).
3. "+" glyph: Poppins 400 16 px, rgba(255,255,255,.5).
4. Main avatar `1hla3d9`: 28 × 28, `left:0`, on top.

States:
- **Rest** (desktop): group width **29px**. The layers sit stacked (2nd avatar `left ≈0`, chip `right:1px`, "+" `left:48%`), so only the top avatar shows.
- **Hover**: group width **48px**. The 2nd avatar moves to `left:24px; width:27px`, so it slides out to the right, overlapping by about 4 px. The chip goes to `right:20px` and "+" to `left:9px`. The whole button grows about 19 px wider.
- **Phone variant "mobile-dark"**: static, group width **74px**, showing `[avatar 28] + [You 28]` side by side. The "+" is centred and there is no 2nd avatar.

Appear sub-animations: the "You" chip (`j2gvka`) and "+" (`mmoi38`) each fade from 0.001 to 1 with spring 400/30 and no delay.

Images:
- Main avatar: `https://framerusercontent.com/images/gmoI9JAyF4Xg1nu11geoKpxrF0.jpg?width=616&height=616`
- 2nd avatar: `https://framerusercontent.com/images/gFjlEfWllIJ1NTDjpevk6EEMtQ.png?width=300&height=300`

---

## 6. "LIMITED AVAILABILITY" badge ("Availability", `framer-JLzKJ`, variant **Unavailable**)

**Box**: `display:flex; gap:8px; padding:8px; align-items:center`, width min-content. No background or border.

**Dot** ("Pulser", 12 × 12) has two stacked layers:
- **"Pulsing"**: 12 × 12, radius 10, bg **#ED3131**, opacity **0.84**.
- **"Solid"**: fills the dot, radius 10, bg **#ED3131**, `box-shadow: 0 0 20px 0 rgba(237,49,49,0.5)` (red glow).

**Text**:
- Noto Sans Mono **500 12px**, letter-spacing **0.02em**, colour **#9BA1A5**, uppercase as authored
- `user-select:none`
- line-height Framer default 1.2em (est.)

**Animation**: the Unavailable variant is **static** (its cycle callback is `undefined`).
The green "Available" variant has the pulse, which you could reuse for the red dot (optional):
1. After 600 ms, switch to "Available-2". The Pulsing layer grows 12 → 36 px (centred), radius 100, opacity 0.84 → 0, over a **700 ms tween with `cubic-bezier(.12,.23,.5,1)`**.
2. After 1000 ms, snap back (0 ms).
3. The loop period is ≈1.6 s.

---

## 7. Client-logo marquee (Framer "Ticker", slot `.framer-u3mn8v-container`)

| Property | Desktop | Tablet | Phone |
|---|---|---|---|
| slot | `width:100%` (1344 at 1440), **height 48px** | same | same |
| direction | **left** (`translateX(-n px)`) | left | left |
| speed | **25 px/s** (linear, infinite) | 25 | 25 |
| gap | **64px** | 40px | 28px |
| fade mask (`fadeWidth`) | **100 %**: `linear-gradient(to right, transparent 0%, #000 50%, #000 50%, transparent 100%)` (triangular; only the centre is fully opaque) | 40 %: `transparent 0%, #000 20%, #000 80%, transparent 100%` | 32 %: `… 16% … 84% …` |
| hoverFactor | 1 (no slowdown) | | |
| alignment | center | | |
| padding | 0 | | |

**Logos** (SVG, black or #1E1E1E fills, shown with reduced opacity). Each sits in a fixed-width box with height from its aspect ratio:

| Logo | Width × height (px) | Opacity |
|---|---|---|
| logo 5 | 62 × 16 | **0.35** |
| logo 4 | 101 × 18 | 0.40 |
| logo 3 | 74 × 20 | **0.35** |
| logo 2 | 108 × 23 | 0.40 |
| logo 01 | 92 × 25 | 0.40 |
| logo 1 | 89 × 23 | 0.40 |
| "Oxxy" | 58 × 20, group opacity 0.40 | 0.40 |

"Oxxy" is a 20 × 20 icon plus the text "Oxxy" in Inter **700 15px**, letter-spacing −0.05em, #1E1E1E, positioned at `left:23px; bottom:1px`.

One set is 584 px of logos + 7 × 64 gaps = **1032 px**, so 41.3 s per set at desktop.

---

## 8. Project gallery ("visual" frame, `.framer-u3x5l7`)

### 8.1 Frame
| Property | Value |
|---|---|
| size | `width:100%` (1344 at 1440) × **height 1000px** (tablet 1000px, phone **100vh**) |
| layout | `display:flex; flex-direction:row; align-items:center; justify-content:center; gap: **16px**; padding: **0 16px**` (phone: gap **10px**, padding **0 8px**) |
| background | **`rgba(17,17,18,0.06)`**, which renders as ≈#E4E4E4 on #F2F2F2 (est.) |
| border | **1px solid rgba(0,0,0,0.06)** (inside, `::after`) |
| radius | **0** (square corners) |
| overflow | visible on the frame; each column's ticker section is `overflow:hidden`, so tiles are clipped at the frame's top and bottom edges (no vertical padding) |

**Corner "handles"**: 4 dots at the corners, giving a Figma-selection look.
- 8 × 8, `border-radius:100%`, bg **#FFF**
- Border 1 px **rgba(0,0,0,0.15)**
- Shadow `0 4px 4.8px -4px rgba(0,0,0,0.35)`, z-index 1
- Positions: `top:-3px; left:-3px` / `top:-3px; right:-3px` / `bottom:-3px; left:-3px` / `bottom:-3px; right:-3px`

### 8.2 Columns (vertical Tickers)

**Columns per breakpoint**:
- **Desktop: 4 columns**.
- **Tablet: 3** (C4 hidden).
- **Phone: 2** (C3 and C4 hidden).

Each column is `flex: 1 0 0; width:1px; height:100%`.

**Column width**:
- At 1440: (1312 − 3 × 16) / 4 = **316px**.
- At 1024: 288 px. At 800: 213.3 px.
- At 390 (phone): (342 − 10) / 2 = 166 px.

**Tiles**: width 100 % of the column, height from the aspect ratio.
- 1 px **#FFF** inner border (`::after`).
- **Radius 0**.
- Images use `object-fit: cover`, except "ebook" and "ui1", which use `fill`.
- Videos are Vimeo with autoplay, loop, muted, no controls, transparent bg and radius 0.

| Col | Direction | Speed | Gap (ph) | Align | hoverFactor | Tiles in order (aspect = w/h) | Set length @1440 | s/set |
|---|---|---|---|---|---|---|---|---|
| C1 "Left" `19x70op` | **bottom** (content moves **down**) | **25 px/s** | 16 (8) | center | **0.8** | video vimeo.com/1126198767 (1.77368) · `6fsCyElHf3dTI1QsHZU87vclVMs.png` (0.910811) · video vimeo.com/1126202431 (1.56744) · `c91nBfPvv2zv4w2JRXHXAlACBg.png` (1.33333) | 1027.7 px | 41.1 |
| C2 "Left" `plm6zr` | **top** (moves **up**) | **34 px/s** | 16 (8) | flex-start | **0.9** | `7FA4UFLZQq1mQGTfOmuC03PJnUM.png` (1.10131, fill) · video vimeo.com/1126202739 (1.39256) · `iGx1QnFsSHkhFd5CpkZnQjjkzEM.png` (1.19081) · `wiCmgi6F5WKX7rOcNBrzD9qk4k.png` (1.24769) · `AnajOlQe3IEK2LSCH4LSyvGlk.webp` (1.33333) | 1349.5 px | 39.7 |
| C3 "Center" `m8bl71` (hidden on phone) | **bottom** | **30 px/s** | 16 | center | **0.9** | video vimeo.com/1126202556 (1.39256) · `mcJrnRYIEBYmU1hkE5F2hQSng6o.png` (1.65196) · `bAf6qFqvs65I06Q64IaiJlDg3yg.png` (1.42797) · `T84l0svKY3JEgAazW8pR4NqGus.png` (0.849057) | 1075.7 px | 35.9 |
| C4 "Center" `ngxjp6` (desktop only) | **top** | **25 px/s** | 16 | center | **0.8** | `qGFk41NKAR25liFehN63DzXhxc.png` (1.53192, no border) · `RsCqhNjr0ijZHLVNYTNUUWf7Qpo.png` (1.31641, fill) · video vimeo.com/1126198458 (1.39256) · `xJV19tyfZo260ILt5Bg4FcSVs.png` (1.40541) · video vimeo.com/1126202666 (1.39256) | 1205.0 px | 48.2 |

Image URLs are under `https://framerusercontent.com/images/`.

The directions alternate **down, up, down, up**, and the speeds differ slightly so the columns drift out of phase. Column fade masks are **off** (`fadeContent:false`).
**Hover**: the hovered column slows to `playbackRate = hoverFactor` (0.8 or 0.9) and returns to 1 on mouse leave.

### 8.3 Ticker algorithm (exact, from the Framer Ticker source)
1. Measure `parent` (the section's height or width) and `children` (first item start to last item end, plus `gap`).
2. Render the original items plus `round(parent/children*2)+1` cloned copies (`aria-hidden`).
3. Compute `U = children + children * round(parent/children)`.
4. Animate the `<ul>` with WAAPI: `transform: [T(0), T(U)]`, `duration = U / speed * 1000 ms`, `easing: linear`, `iterations: Infinity`. The direction transforms are:
   - `left: translateX(-n)`
   - `right: translateX(n)`
   - `top: translateY(-n)`
   - `bottom: translateY(n)`, with the `<ul>` offset `top: -U`
5. Pause the animation when the section is out of view; resume when it is in view.
6. The SSR markup ships the section at `opacity:0`. It flips to 1 after the first measurement, with no fade.

---

## 9. Appear animations (`__framer__appearAnimationsContent`)

All animations start on page load. Every one uses initial `opacity: 0.001`, with scale 1 and rotation 0.

| appear-id | Element | Initial → animate | Transition | Delay |
|---|---|---|---|---|
| `mgk21j` | Nav container | opacity .001 → 1 (no movement) | spring **stiffness 400, damping 30, mass 1** | **0 s** |
| `k3t41l` | H1 | opacity .001 → 1, **y 80 → 0** | spring 400/30/1 | **0.2 s** |
| `14h5gqv` | Paragraph | opacity .001 → 1, **y 80 → 0**, `transformPerspective:1200` | spring 400/30/1 | **0.3 s** |
| `1chk9pa` | Contact button slot | opacity .001 → 1, **y 60 → 0** | spring 400/30/1 | **0.4 s** |
| `9co8z7` | Plans button slot | opacity .001 → 1, **y 60 → 0** | spring 400/30/1 | **0.4 s** |
| `j2gvka` / `mmoi38` | "You" chip / "+" in Contact | opacity .001 → 1 | spring 400/30/1 | 0 s |
| `9g7ltu` | Availability badge | opacity .001 → 1, **y 40 → 0** | spring 400/30/1 | **0.5 s** |
| `u3mn8v` | Logo marquee slot | opacity .001 → 1 (no movement) | spring **duration 0.4 s, bounce 0.2** (≈ k 505.6, c 35.98) | **0.6 s** |

The values are identical at all three breakpoints.
These elements are **not** animated on appear: the testimonial pill and the gallery (it appears on hydration).

**Spring maths**

Spring 400/30/1:
- ζ = 0.75, ω0 = 20 rad/s
- Overshoot **2.75 %**, which is about 2.2 px past 0 for an 80 px move
- 95 % reached at ≈157 ms; settled within 0.1 % at ≈400 ms
- CSS equivalent (duration **400 ms**):
  `linear(0, 0.048, 0.162, 0.302, 0.446, 0.581, 0.703, 0.799, 0.875, 0.934, 0.973, 1, 1.016, 1.025, 1.027, 1.027, 1.024, 1.02, 1.016, 1.012, 1.009, 1.006, 1.004, 1.002, 1)`
- Simpler fallback: `cubic-bezier(0.22, 1, 0.36, 1)` over 600 ms (est.)

Spring 0.4 s / bounce 0.2:
- ζ 0.8, overshoot 1.4 %, settled ≈376 ms
- `linear(0, 0.052, 0.174, 0.319, 0.464, 0.601, 0.713, 0.804, 0.875, 0.926, 0.962, 0.987, 1.001, 1.01, 1.014, 1.014, 1.014, 1.012, 1.01, 1.008, 1.006, 1.004, 1.003, 1.002, 1)` over 380 ms

Hover spring 500/60/1:
- Over-damped
- `linear(0, 0.132, 0.326, 0.494, 0.622, 0.719, 0.791, 0.845, 0.884, 0.914, 0.936, 0.953, 0.965, 0.974, 0.981, 0.985, 0.989, 0.992, 0.994, 0.996, 0.997, 0.998, 0.998, 0.999, 1)` over 700 ms

Tooltip spring 500/62/2:
- `linear(0, 0.054, 0.169, 0.303, 0.434, 0.551, 0.65, 0.732, 0.796, 0.847, 0.886, 0.916, 0.938, 0.955, 0.967, 0.976, 0.983, 0.988, 0.991, 0.994, 0.996, 0.997, 0.998, 0.999, 1)` over 550 ms

**Order of the stagger**:
1. Nav at 0 s
2. H1 at 0.2 s
3. Paragraph at 0.3 s
4. Buttons at 0.4 s
5. Badge at 0.5 s
6. Marquee at 0.6 s

The vertical travel shrinks down the stack: 80 → 80 → 60 → 40 px. Under `prefers-reduced-motion`, drop the y offsets and use opacity only (recommendation).

---

## 10. Breakpoint deltas

### Tablet (800–1439.98 px)
**Page and nav**
- The page is fluid; the design canvas is 800.
- Nav is still the **Main** variant with links. The pill is max 720 px, so at 800 px it is 720 px with 24 px left on each side.
- DOM order changes: BG 0, nav 2, hero 3. The visual result is the same.

**Hero lockup**
- Hero padding is unchanged (`64px 48px 56px`). The container **gap becomes 28px** (was 24).
- H1: 64 px / 0.95em between 720 and 1023 px; 72 px at 1024 px and up. At 800 px the width is 672 px (704 − 2 × 16 lockup padding), giving 3 lines.
- Paragraph: 18 px at ≥810 px, 16 px between 800 and 809 px.

**Marquee and gallery**
- Marquee: gap **40px**, mask fade 20 % / 80 %.
- Gallery: **3 columns** (C1, C2, C3); frame height 1000 px, gap 16, padding 0 16. Columns are 213 px wide at 800 and 288 px at 1024.

### Phone (≤799.98 px; canvas 390)
**Nav**
- **Mobile-default** variant: wrapper `padding:8px`, so the pill is 374 px wide at 390.
- Logo and brand on the left; Telegram, WhatsApp and "Let's Work" on the right.
- No links and **no menu button**.
- Sticky `top:-4px`.

**Hero lockup**
- Hero: `padding: 64px 16px 56px`, **gap 48px**. The lockup has **padding 0**. The H1 `max-width` is unset, so it fills 358 px.
- H1: 32 px / 1.05em (33.6 px), letter-spacing −0.05em, 3 lines. The paragraph is 16 px / 24 px, 2 lines.
- Testimonial pill: same 226 × 32.

**Buttons**
- The row becomes a **column**, width 100 %, gap 8. Each button slot is **100 % × 56px** with centred content.
- Contact uses the "mobile-dark" variant (static avatar + "+" + You, 74 px).

**Badge and marquee**
- Badge is unchanged (still delay 0.5 s).
- Marquee: gap **28px**, fade 16 % / 84 %.

**Gallery**
- Height **100vh**, padding **0 8px**, gap **10px**, **2 columns** (C1 and C2, 166 px each at 390). Ticker gap **8px**.
- Smooth-scroll (Lenis) is not mounted on phone.

---

## 11. Implementation notes for the rebuild
- **Tickers**: implement once with WAAPI per §8.3.
  - Clone items enough to cover twice the viewport.
  - Use `animation.playbackRate` for the hover slowdown.
  - Use an IntersectionObserver for pause/resume.
  - Honour `prefers-reduced-motion` by pausing.
- **Testimonial pill**: absolute rows plus `setInterval(2000)`.
  - Toggle classes `.is-active` (top 50 %, rotateX 0, opacity 1), `.is-next` (top 175 %, rotateX −50°, opacity 0) and `.is-prev` (top −40 px, rotateX 50°, opacity 0).
  - Use `transition: all 500ms cubic-bezier(.44,0,.56,1)`.
  - Animate `top` via transform: translateY of −56 px / 0 / +56 px relative to centre (est. equivalent).
- **Nav**:
  - Sticky wrapper 80 px tall with a transparent background.
  - Only the 720 px pill is frosted (blur 10).
  - An IntersectionObserver on the footer toggles the dark variant (300 ms linear, 200 ms delay).
- **All `data-border` borders** are drawn with `::after { inset:0; border:1px solid …; border-radius:inherit; pointer-events:none }`, so they don't change layout size.
- **Brand swap**:
  - "Budarina" → "TESERACT CREATIVE STUDIOS". The 165 px fixed left group will need widening, or a shorter wordmark.
  - Telegram and WhatsApp can stay as 32 × 32 tinted squares, or be swapped for the user's channels.

---

## Critic additions

Added by the completeness review (2026-10-12). Live values were measured with headless Edge (Playwright from `_tools/node_modules`, not the in-app browser) on https://studio.budarina.design/ after `load` + 4 s. The script is `_work/critic/measure.cjs` and the output is `_work/critic/measure.json`.

### A. Breakpoints verified (applies to every spec)
`#__framer__breakpoints` = `[(min-width:1440px), (min-width:800px) and (max-width:1439.98px), (max-width:799.98px)]`. The reference does **not** use 1200/810. The project tokens (`src/css/00-tokens.css`) and header already use 1439.98/799.98. `image2`, `image3` §9, `image4` §1, `ref-services` §5 and `ref-plans` App. B still say 1200/810, and `image3`/`image4` wrongly call that "the Framer reference". Pick one set for the site. The recommendation is the reference set, 1440/800, for global layout. Page-local switches, such as image 4's poster at ≥1200, are allowed if named explicitly.

### B. Measured boxes replacing the (est.) values in §2 / §10  [x, y(page), w, h]
| Element | 1440×900 | 1024×768 | 390×844 |
|---|---|---|---|
| nav pill | 360,16, 720×48 | 152,16, 720×48 | 8,8, 374×48 (wrapper 64 tall) |
| `#hero` | y 80, h 1709.6 | y 80, h 1713.6 | y 64, h 1475.2 |
| H1 | 280,216, 880×205.2 (3×68.4) | 72,216, 880×205.2 (72 px) | 16,184, 358×100.8 (3×33.6) |
| paragraph | 518.5,445.2, 403×54 | 310.5,445.2, 403×54 | 16,308.8, 358×48 |
| buttons row | 608.3,539.2, **223.4×48** (confirms 127 + 8 + 88) | 400.3,543.2, 223.4×48 (container gap 28) | 16,380.8, 358×120 (56 + 8 + 56) |
| availability badge | 627.6,591.2, **184.8×30.4** | 419.6,595.2, 184.8×30.4 | 102.6,504.8, 184.8×30.4 |
| marquee | 48,677.6, 1344×48 | 48,681.6, 928×48 | 16,583.2, 358×48 |
| gallery frame | 48,733.6, 1344×1000 | 48,737.6, 928×1000 | 16,639.2, 358×**844 (=100vh)** |

### C. TESERACT header fit (Geist 500 advance widths, no kerning, ±3 % est.)
- **Doc quick links** (`chrome.py` QUICK_LINKS) at 14 px, each with 0 8 px padding: "The Work" 79.5, "What We Create" 125.2, "Our Approach" 108.1, "Client Stories" 106.8. With 3×8 gaps that is **443.6 px** (the reference set is 272).
- **Brand group**: 32 tile + 10 gap + wordmark. The wordmark width is 14.74 × cap: cap 8.4 gives 124, cap 9 gives 133, cap 10 gives 147.
- **Right group**: "Start a Project" at 12/500/−0.02em is 79.9 text, so a 104 button + 8 + 32 toggle = **144**.
- **Need**: 166 + (443.6 + 24 link padding) + 144 = **777.6 px** of pill inner width, so the pill must be **≥ 794 px**. The build's `--pill-w:800px` fits with about 6 px of slack.
- **Problem at 800–1023 px**: the build sets the pill to 720 (inner 704) and the link gap to 2 px. That still needs ≈ 740 px, so the links overflow by about 36 px. **Fix**: hide `.nav-links` below 1024 px (toggle-only header, as on phone). Alternatively, use short labels: "Work" 51.8, "Services" 73.6, "Approach" 80.5, "Stories" 63.8 (total 293.7, fits 704).
- **Phone**: the inner width is 358, which holds 160 (wordmark 118) + 144 = 304, so it fits. At 320 px the inner width is 288, so the wordmark must drop to ≤ 96 px. The build does this at ≤359.98. ✓

### D. One spring table (the specs give 4 different CSS approximations for the same springs)
| Framer transition | ζ | 95 % | settle | CSS to use |
|---|---|---|---|---|
| spring 400/30/1 (all appears, icon spin, FAQ items, menu) | 0.75, 2.8 % overshoot | 157 ms (first crossing) | ≈ 490 ms (0.1 % envelope) | §9 `linear()` **over 400 ms**. The menu's 19-pt curve (450 ms) and image 4's 26-pt curve (500 ms) are correct samplings of the same spring and are only valid with their own duration. **Project bug**: `--spring` (400 ms curve) is paired with `--spring-d:600ms`, which plays the spring 1.5× slower. Set `--spring-d:400ms`, or use this 600 ms sampling: `linear(0,0.065,0.212,0.386,0.555,0.7,0.815,0.901,0.959,0.996,1.017,1.026,1.028,1.026,1.022,1.017,1.012,1.008,1.005,1.003,1.001,1,0.999,0.999,0.999,0.999,0.999,1,1,1,1)` |
| spring 500/60/1 (all hovers, toggles, label rolls) | 1.34, over-damped (not "critically damped" as ref-plans App. B says) | 322 ms | 99 % 483 ms, 99.9 % 713 ms | `--spring-soft` over **700 ms** (500 ms is acceptable: it ends at 99 %). Retire the 350 ms / 450 ms bezier approximations in ref-services §4 and ref-plans App. B |
| spring 0.4 s / bounce 0.2 (marquee appear) | 0.8 | — | 380 ms | §9 curve over 380 ms |
| spring 500/40/1 (folder papers in) | 0.894, 0.2 % overshoot | — | ≈ 390 ms (0.1 % envelope) | `cubic-bezier(.25,1,.5,1)` 400 ms (est.) |
| spring 500/62/2 (tooltip) | 0.98 | 290 ms | ≈ 550 ms | §9 curve over 550 ms |
| tween `cubic-bezier(.44,0,.56,1)` | — | — | 300 / 500 / 700 ms | exact |

### E. Marquee without client logos (TESERACT has none; PLAN uses the doc FOOTER services line)
- **Items**: "Web Design · Development · E-commerce · Interactive · Branding · Product · AI".
- **Item text**: Geist 500, 20 px / 1, −0.02em, `#161616` at **opacity .40**. This matches the reference logos: 16–25 px tall at .35/.40.
- **Separator**: a 12 px `logo-mark.svg` at opacity .35, between words.
- **Spacing and motion**: gap 64 / 40 / 28 px (desktop / tablet / phone), speed 25 px/s, the same triangular / 20–80 % / 16–84 % fade masks as §7, and the same appear (delay 0.6 s, spring 0.4/0.2).
- **Measured word widths**: 109.3 / 122.7 / 117.1 / 99.2 / 82.8 / 73.3 / 18.6 (sum 623). One set is therefore ≈ 1603 px at gap 64 (64 s per set), 1267 px at gap 40, and 1099 px at gap 28. That is longer than the 1344 px slot, so the ticker clones per §8.3 still work.
- **Font coverage**: `geist.woff2`, `geist-mono-latin.woff2` and `figtree-latin.woff2` (Google latin subsets) have **no →, ↗ or ★** (U+2192/2197/2605 are missing; checked with fontTools). Draw every arrow and star as inline SVG (`lib.icon`), never as a typed glyph. The doc uses "→" in 6 CTAs.

### F. Font-stack risk: `--font:'TS Sans', Geist`
- **The setup.** `TS Sans` resolves to the local Helvetica Neue cuts on macOS and iOS only. Windows and Android get Geist.
- **The problem.** The image specs fitted their tracking to **Geist**. Helvetica Neue needs different values:

| Element | Geist | Helvetica Neue |
|---|---|---|
| Image 2 headline | −0.068em | −0.057em |
| Image 4 headline | −0.12em | about −0.06em ("halve the negative tracking", image4 §3) |

- **Effect on Apple devices.** Any block styled with `var(--font)` while using the Geist-fitted tracking renders too tight. On image 4 that is about 8 px per glyph at 131 px, so glyphs collide.
- **Rule:**
  - Elements whose tracking was fitted to Geist must use `font-family: Geist, …` directly: the image 2 headline and body, the whole approach poster, and "Details matter.".
  - Keep `TS Sans` only where the tracking came from the reference's Inter presets (−0.05em / −0.04em / −0.3px). Those are close enough for both families.
