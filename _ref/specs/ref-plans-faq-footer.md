# Reference spec: PLANS, FAQ and FOOTER (studio.budarina.design)

Sources: `_ref/budarina/index.html` (SSR HTML and CSS), the page module `script_main → vVZQBd57…14zGUka1.mjs` (saved as `_ref/extracted/pff/js/page.mjs`), `shared-lib.0Exy5o0y.mjs` and `OLSj4SMa6.SSkBQjp1.mjs`, plus the Phosphor `Plus.js@0.0.57` module. Working dumps are in `_ref/extracted/pff/` (`*_tree*.txt`, `*_css.txt`, `js/m_*.txt`, `appear.json`).
Values come from the code unless marked **(est.)**.

---

## 0. Global facts that affect all three sections

### Breakpoints (important: these differ from the usual Framer defaults)
From `#__framer__breakpoints` and the `data-framer-breakpoint-css` block:

| Name | Media query | Hidden-class used | Framer variant id |
|---|---|---|---|
| Desktop | `(min-width: 1440px)` | `.hidden-1qit58p` hides on desktop | `Z7pMW8Hkw` |
| Tablet | `(min-width: 800px) and (max-width: 1439.98px)` | `.hidden-cbel8a` | `OaOWYeQH9` |
| Phone | `(max-width: 799.98px)` | `.hidden-1172iny` | `gIpziZMxD` |

- Desktop is **≥1440**, not ≥1200. Between 800 and 1439px the **tablet** layout applies: stacked columns and smaller padding.
- Some text presets use their own breakpoints: H2 preset `1ytb7ki` uses 720–1023 / ≤719, and body preset `21ogod` uses 810–1439 / ≤809.
- The desktop canvas is 1440 px wide, and Framer computed y positions with a 1000 px viewport height. Section tops at 1440: **plans 4672.8, faq 6849.4, footer 8041.4, link bar 9041.4**, so the footer is 1000 px (100vh).

### Colour tokens (defined on `body`)
| Token | Value | Used for |
|---|---|---|
| `--token-aa303802…` | **#f2f2f2** (fallback #d9d9d9) | page background (`html body` and root) |
| `--token-00af65c3…` | **#161616** | all "black" text (presets fall back to #000, but the token resolves to #161616) |
| `--token-cd9f24d5…` | #fff | white text |
| `--token-547b5c15…` | #ffffff80 (rgba 255,255,255,.5) | footer clock and sub text |
| `--token-cecefbc2…` | #00000080 | "You" / "+" on the white contact button |
| `--token-076bd8bd…` | #000000a6 | default colour of preset 73mefd (usually overridden) |
| `--token-2f2b67dd…` | undefined, so fallback **rgb(22,22,22)** | FAQ plus icon |
| `--token-419394a1…` | undefined, so fallback **#050505** | footer bottom fade |

### Text presets used here
| Preset | Font | Size / weight | Letter-spacing | Line-height | Colour | Responsive |
|---|---|---|---|---|---|---|
| `1nkxi2y` (pill label) | Poppins | 14 / 500, **uppercase** | 0 | 120% | #fff | none |
| `1ytb7ki` (H2) | **Inter Display** | 56 / 600 | **-0.04em** | **1.1em** | #161616 | 720–1023: **48px**; ≤719: **32px**; `text-wrap: balance` |
| `199oqwb` (body / checklist) | Inter | 16 / 400 | **-0.3px** | 150% | #161616 | none |
| `17bojax` (body-semibold) | Inter | 16 / **600** | -0.3px | 150% | #161616 | none |
| `73mefd` (button label) | Inter | 16 / **500** | -0.3px | 150% | overridden per use | none |
| `21ogod` (large body) | Inter | **18** / 400 | -0.3px | 150% | #161616 | ≤809: **16px**; `text-wrap: balance` |
| `1ihf1r3` (H4) | Inter Display | 20 / 600 | -0.03em | 1.4em | #161616 | ≤719: 18px |
| `ooo2k9` (small button) | Inter | 12 / 500 | -0.02em | 16px | #fff | not used here |
| Plan title (inline) | **Plus Jakarta Sans** | 32 / 700 | -0.02em | 120% | rgb(22,22,22) | |
| Price parts (inline) | Plus Jakarta Sans | `$` 24/500 · amount **40/600** · suffix 24/500 | 0 | 100% | default #000 (est. use #161616) | |
| FAQ question (inline) | Plus Jakarta Sans | 20 / 600 | -0.02em | **1em** | #161616 | |
| Footer H2 (inline) | Plus Jakarta Sans | **40 / 600** | **-0.03em** desktop, -0.04em tablet | 1.3em | #fff | phone: **32px**, -0.04em |
| Footer clock | Plus Jakarta Sans | 18 / 500 | 0 | 1em | rgba(255,255,255,.5) | `font-feature-settings:'tnum'; font-variant-numeric: lining-nums` |
| Footer links | Inter | 14 / 500 | 0 | 20px | rgb(25,26,25) #191a19 | |

### Section pill (shared component `framer-3TZmM`, used by "PLANS" and "FAQs")
- Size: `display:flex; gap:10px; padding:8px 12px;` with height about **33px**.
- Background: `radial-gradient(50% 202.28% at 50% 50%, #5e5e5e 0%, #000 100%)`.
- Border: 1px `rgba(255,189,143,.26)`, drawn as an inset `::after` with radius inherited. Radius **57px**.
- Label: text between two dots, using preset 1nkxi2y (Poppins 14/500 uppercase white). "FAQs" renders as "FAQS".
- Dots, left and right:
  - Each is a **16×16** box with padding 4px, background `rgba(255,255,255,.49)`, 1px border `rgba(0,0,0,.35)` and radius 31px.
  - Inside each is a **4×4** circle in `rgba(0,0,0,.42)`.
- The pill is static, with no animation.

### Smooth scroll
- A Lenis smooth-scroll component (`framer-pnc1uf-container`) sits between the FAQ and footer. It is hidden on phone.
- Settings: `intensity:10`, so `duration = 1.0s` and easing `t => Math.min(1, 1.001 - 2**(-10*t))`.
- Anchor links (`a[href*="#"]`) scroll through Lenis.

---

## 1. PLANS section (`#plans`, `.framer-16my9wc`)

### 1.1 Section layout
| Property | Desktop ≥1440 | Tablet 800–1439 | Phone <800 |
|---|---|---|---|
| display | flex column, centred (`align-items:center`) | same | same |
| padding | **120px** all sides | **120px 80px** | **80px 16px** |
| gap (header to frame) | **80px** | 80px | **56px** |
| background | none (page #f2f2f2 shows through) | same | same |
| z-index / overflow | 0 / visible | | |

**Header block** (`.framer-1evvg13`):
- Flex column, centred, `gap:20px`, `width:100%`, `max-width:720px`, `overflow:hidden`.
- Contents, top to bottom:
  1. The pill "PLANS", about 33px tall.
  2. H2 **"What are the pricing plan options?"**, preset 1ytb7ki, centred. At 720px wide it breaks onto **2 lines (est.)**, balanced.
  3. Sub text, preset 199oqwb (Inter 16/150%, -0.3px), centred. Desktop and tablet put a `<br>` after the first sentence: "Go with subscription or choose a project-based quotation.⏎2 subscriptions plans, 2 fixed plans [web & app]". Phone shows one paragraph with no break.

### 1.2 Grey frame (`.framer-1ntxkwl`, "Frame 427321715")
| Property | Desktop | Tablet | Phone |
|---|---|---|---|
| width | **928px** (fixed) | 100% (viewport − 160) | 100% |
| background | **#e2e2e2** | #e2e2e2 | **unset (transparent)** |
| border | 1px `#0000000f` (rgba(0,0,0,.059)) | same | unset |
| radius | **48px** | 48px | (no visible frame) |
| padding | **16px** | 16px | **0** |
| gap | **16px** | 16px | 16px |
| layout | column: [Card 1 full width] then row `.framer-1xzszlr` [Card 2 + Card 3], row gap 16 | the row becomes a **column** | column |

Card widths:
- Desktop: Card 1 is **896px**. Cards 2 and 3 are **440px** each (440 + 16 + 440 = 896).
- Card 3's container is `align-self: stretch`, so both cards in the row share the same height.
- Tablet: every card is 100% wide (viewport − 192).
- Phone: every card is viewport − 32. The MVP card container is fixed at `height:777px` on phone.

### 1.3 Plan card base (component `framer-CBm0J`, "price-card")
- Base: `display:flex; flex-direction:column; gap:20px; padding:40px` (phone **32px**); `width:440px` (overridden to 100% of the container); `overflow:hidden`; `position:relative`.
- Background: **#fff**.
- Border: 1px #fff, drawn as an inset `::after`.
- Radius: **32px**.
- Box-shadow (exact):
  `inset 0 0 3px 0 rgba(0,0,0,.24), 0 0 0 1px rgba(0,0,0,.08), 0 4px 8px -7px rgba(31,28,28,.12), 0 16px 32px -7px rgba(31,28,28,.04)`
- Children, in order:
  1. **Top block** `.framer-7rfq1v`: column, `gap:16px`. Contains the icon, then the title and description (column, gap **8px**), then the price row, then the CTA block.
  2. **4 corner dots**, absolutely positioned, `z-index:1`. Each is a 7×7 circle in `#f3f3f3` (rgb 243,243,243) with radius 32 and `box-shadow: inset 0 1px 2px rgba(0,0,0,.06)`. Positions:
     - top 21, left 20
     - **top 21, left 413**
     - bottom 20, left 20
     - **bottom 20, left 413**
     - Reference quirk: the right-hand dots use a fixed `left:413px` in every variant, so in the 896px wide card they sit near the middle. Use `right:20px` in the rebuild.
  3. **Bottom block** `.framer-rvp4pj`: column, `gap:24px`. Contains the checklist (`.framer-pqe38t`, column, **gap 8px**), then the add-on toggle row.
- The "Limited availability" badge (Partnership) and the green "x2 Designers" badge (Partnership+) are absolutely positioned at **top:41px; right:39px**, `z-index:1`.

**Icons**:
| Card | Icon |
|---|---|
| Landing Page+ | Custom **folder icon** component, **40×40**; see 1.6 |
| Partnership | **48×48** round image (radius 97px), a grey gear app icon (`T8QWhfOI5NrdS9idwNWCIW2zvc.png`) |
| MVP | **48×47.6** image (aspect 1.0085, radius 111px), a compass app icon (`vB45qFrEJPEKjT8VJWWIUOYFs80.png`) |

- Hover on either image icon: `whileHover {rotate:360}` with spring **stiffness 400, damping 30, mass 1**.

**Title / description**:
- Title: Plus Jakarta Sans 32/700, -0.02em, lh 120%, rgb(22,22,22).
- Description: preset 199oqwb.

**Price row** (`.framer-r5r0cz`):
- `flex-direction:row; align-items:center; gap:2px`, line-height 100%.
- The `$` is 24/500. Because it is 24px against the 40px amount and vertically centred, it reads as a small leading `$`. It is **not** raised with `vertical-align: super`.
- Amount: 40/600 Plus Jakarta Sans.
- Suffix: 24/500 Plus Jakarta Sans. Values: `[fixed]` (Landing Page / Landing Page+), `+/month` (Partnership and Partnership+), `+ [fixed]` (MVP).
- White-space is `pre` on every part.

**CTA block** (`.framer-1r8gkc8`): column, `gap:12px`, centred (left-aligned in Card 1).
- **Black Contact button** (component `framer-Pckah`, variant "lg-dark"):
  - Size: full width × **56px** (360px wide in a 440 card; 388px in Card 1). Radius **16px**. Background **#000**. `overflow:hidden`. `href="mailto:…"`.
  - Shadow: `0 0.72px 3.04px -0.83px rgba(0,0,0,.18), 0 2.75px 11.53px -1.67px rgba(0,0,0,.18), 0 12px 50.4px -2.5px rgba(0,0,0,.18)`.
  - Decorative blob `.framer-1ur8ake`: `rgba(255,255,255,.26)`, radius 50px, height 40, `top:-46px; left:-25px; right:-26px`. It is hidden above the button and does **not** move on hover in this variant.
  - Labels `.framer-1yqe5g8`: column, gap **10px**, a window of `height:24px` at `top:calc(48.33% - 12px)` with `overflow:hidden`. It holds "Contact" and "Send an email", both in preset 73mefd (Inter 16/500, -0.3px) in **#fff**.
  - **Hover**: the two labels swap flex `order` and Framer animates the layout change. "Send an email" rises from y=34 to y=0 into view while "Contact" drops out below.
  - Transition: **spring stiffness 500, damping 60, mass 1** (no bounce, about 250–300ms).
- **"Better email? Let's chat ->"** underline link (component `framer-rIPFW`):
  - Box: `padding:4px; gap:2px`, column. The label uses preset 73mefd in #161616 (Inter 16/500).
  - Underline: a wrapper 1px tall with `overflow:hidden`, holding a line in **rgb(150,150,150)**.
  - Hover states:
    - Default: line is `width:1%; left:-10px`, so it is invisible.
    - Mouse enter ("Line IN"): `left:0; right:0` (full width), spring 500/60.
    - Mouse leave ("Line OUT"): `left:auto; right:-10px; width:1%`, spring 500/60. The line wipes out to the right. **After 350ms** it snaps back to Default with a 0-duration tween.
  - Net effect: the underline draws in from the left and exits to the right.
  - SSR container height is 35px. It renders as a plain `div`, not a link.

**Checklist rows**:
- Row: `display:flex; gap:8px; align-items:center` (rows that can wrap use `align-items:flex-start`).
- Icon box: **20×29**. Text: preset 199oqwb, `flex:1`.
- Check icon: a scalloped grey seal (#C2C2C2) with a black tick. The SVG is in the appendix.
- Ordering quirk: the source DOM sometimes puts the text first, but CSS `order` always places the icon first.

**Add-on toggle row** (`.framer-1jjfueb`):
- Row box: background **#f3f3f3**, radius **12px**, `padding:12px`, `cursor:pointer`, `tabindex=0`. The whole row is clickable (onTap).
- Inner row: gap 8px, `align-items:center`.
- Track: **32×20** (aspect 1.6), `padding:2px`, radius 200px, `overflow:hidden`.
  - OFF: background `rgba(0,0,0,.12)`, knob on the left (`justify-content:flex-start`).
  - ON: background **#000**, knob on the right (`justify-content:flex-end`).
- Knob: **16×16** white circle with `box-shadow: 0 1px 2px rgba(34,38,47,.08)`.
- Label: preset **17bojax** (Inter 16/600).
- Clicking switches the whole card to its paired variant with **spring 500/60**. Knob position and track colour animate, and the texts swap instantly (table below).

### 1.4 Card variants and content
| Framer variant | Name | Toggle | Title | Description | Price | Badge | Add-on label |
|---|---|---|---|---|---|---|---|
| `UZAMoS94S` (`v-14631ot`) | **website +** (shown at load) | **ON** (black) | Landing Page+ | Ideal for designing or redesigning website to double your conversion rates | $ **6,990** [fixed] | none | +No-code Developement: $2,000 |
| `DT1RFcmUg` (`v-1pwjs1z`) | Website Launch (after toggling off) | OFF | Landing Page | (same) | $ **4,990** [fixed] | none | same |
| `QDpMkBvrX` (`v-1lk617a`) | **subscription** (shown at load) | **OFF** | Partnership | Great if you need ongoing help, have many projects or have undefined scope of work | $ **5,990** +/month | **Limited availability** (grey) | Accelerator: x2 availability +$5,000 |
| `bMEuSitkG` (`v-1tuct9l`) | subscription+ (toggled on) | ON | Partnership+ | If you have multiple projects or need faster results and several hands at once | $ **10,990** +/month | **x2 Designers** (green) | same |
| `seUoVKYvL` (`v-rm05hd`) | **MVP plan** | **no toggle row** | MVP Launch Kit | Full App MVP (40-60 screens) or Website (design+dev) with 10+ unique pages. | $ **9,990** + [fixed] | none | — |

**Checklists**:
- Landing Page (8 items): 10-14 Days turnaround time, 2 Design Concepts, Custom 3D models or 2D illustrations, Professional Copywriting, High-converting sales funnel, 1 Month of FREE Support, Framer development, Animations.
- Partnership (7 items): Dedicated Design Lead, Team of senior level creatives (ui/ux, art, 3D, motion, no-code dev) at your service!, End-to-end project management, Unlimited Design request & revisions, 5/7 Communication via Slack & Loom, 1 workstream at a time, 1-3 days updates + 1 sync call/month.
- MVP (7 items): Dedicated Design Lead, Team of senior…, Go-to-market strategy plan, Predefined scope of work (SOW), 5/7 Communication via Slack & Loom, Framer or Webflow Web development, 50/25/25 secure payment.

**Badges**:
- "Limited availability":
  - Box: `padding:6px 10px; gap:4px`, radius 8px, background `linear-gradient(100deg, #e9e9e9 3%, #e6e6e6 86%)`.
  - Icon: 16px timer-pause icon in #7C7C7C.
  - Text: Plus Jakarta Sans 12/700, -0.03em, lh 12px, **rgb(123,123,123)**.
- "x2 Designers": same box with `linear-gradient(100deg, rgb(234,255,226) 3%, rgb(209,255,241) 86%)`, a 16px "flash" icon in #006803, and text in **rgba(0,104,3,1)**.

### 1.5 Card 1 horizontal layout ("website +" variant)
- Uses `--apxoa5` (row on desktop and tablet, **column on phone**), `align-items:flex-end`, **gap 40px**, padding 40 (phone 32).
- Left column (`7rfq1v`) and right column (`rvp4pj`) are each `flex:1 0 0` (388px each on desktop; 100% wide on phone).
- Left column order: folder icon → title and description → price (`width:min-content`) → CTA block (left-aligned). The button width is `(cardInner − 40) / 2` = 388px.
- Right column: 8-item checklist (gap 8), then 24px, then the toggle row.
- Estimated heights: Card 1 about **440px** on desktop; Partnership and MVP about **800px (est.)**.

### 1.6 Folder icon (component `framer-0mZVY`, 40×40, Landing Page card)
- Back: the "Union" SVG, a 40×37 folder silhouette.
  - Fill: `linearGradient #C30202 → #3A0909` (top to bottom).
  - Stroke: 0.05px #F46260.
  - See the appendix.
- Papers ("Group 6"): 37×10 at `top:6px`, with `box-shadow: 0 -0.195px 0.747px rgba(0,0,0,.2)`. It holds 4 stacked 8px-tall sheets:
  - widths 29 / 32 / 34 / 36
  - tops 0 / 1 / 1 / 2
  - fills `linear-gradient(180deg, #eaeaea|#f3f2f2|#f4f4f4|#eaeaea 0%, #5d5d5d 100%)`
- Front: "Rectangle 23", 31px tall at `bottom:1px`, full width, radius 3.91px, `linear-gradient(180deg, #ee3c3a 0%, #cf1719 100%)`, 0.05px border #f46160.
- Hover (spring 500/60): the papers rise about 1–2px.
  - Group: top 6 → 5
  - Sheets: tops 0 → -2, 1 → -1, 1 → 0
  - The last sheet re-centres.

### 1.7 Animations in Plans
- **None on scroll or appear.** Plans has no `data-framer-appear-id` and no in-view effects.
- Only hover and tap micro-interactions:
  - Icon spin: spring 400/30
  - Button label roll: spring 500/60
  - Underline wipe: spring 500/60, plus a 350ms reset
  - Toggle variant switch: spring 500/60
  - Folder papers: spring 500/60

---

## 2. FAQ section (`#faq`, `.framer-1udvhlu`, "faqs")

### 2.1 Panel
| Property | Desktop | Tablet | Phone |
|---|---|---|---|
| background | **#fff** | #fff | #fff |
| border-radius | **120px (all four corners)** | **80px** | **32px** |
| width | 100% of viewport (full bleed) | same | same |
| padding | **120px** | **80px** | **56px 24px 24px** |
| flex | **row**, `justify-content:center`, `align-items:flex-start`, **gap 100px** | **column**, gap **56px** | column, gap **32px** |
| z-index / overflow | 0 / visible | | |

- **Does it overlap the footer? No.** The FAQ panel and the footer are stacked siblings with no negative margins.
- What you see between them: the FAQ's rounded bottom corners (120px) and the footer's rounded top corners (120px) leave **#f2f2f2 page background** showing in the four corner wedges. That produces the "stacked rounded sheets" look.
- The Lenis component between them has no size.

### 2.2 Left column (`.framer-u8zzq7`)
- Column, **gap 40px** (phone 24px).
- Width:
  - Desktop: **40%** of the content width, `max-width:720px`. That is `min((W−240)×0.4, 720)`, so **480px at 1440**.
  - Tablet: 100%, max 800.
  - Phone: 100%.
- **Heading group** (`.framer-hq0vjp`): column, **gap 16px**.
  - Pill "FAQs".
  - H2 preset 1ytb7ki, **left-aligned**: "Have questions?!" `<br>` "We've got you!". That is 2 lines of 56px at 1.1em, about 123px tall.
- **Contact card** (`.framer-brtpoh`):
  - Box: background #fff, 1px #fff border (`::after`), **radius 24px**, **padding 40px** (phone 24px), column **gap 20px**.
  - Shadow: same 4-layer shadow as the plan cards — `inset 0 0 3px #0000003d, 0 0 0 1px #00000014, 0 4px 8px -7px #1f1c1c1f, 0 16px 32px -7px #1f1c1c0a`.
  - Avatar (`.framer-oj7qtf`):
    - Size and shape: **56×56**, radius **12px**, 1px #fff border, `box-shadow: 0 1px 2px #00000040`, `object-fit: cover` (616px source image).
    - Hover: `rotate:-4deg; scale:1.1` with spring 400/30.
  - Text: H4 preset 1ihf1r3 (Inter Display 20/600, -0.03em, 1.4em; ≤719 18px), left-aligned. The reference copy reads "Didn't find the answer? I'm human being, just like you - ask me anything 👇🏻".
  - Buttons (`.framer-13thh4`): column, **gap 8px**. Each button is **100% × 48px**. Width at 1440: `min((W−240)×.4,720) − 80` = **400px**. See 2.3.
  - Corner dots (desktop and tablet only; hidden on phone): 7×7 circles in **#ededed**, radius 32, `box-shadow: inset 0 2px 3px #00000014`. Positions:
    - top 21 / left 21
    - top 21 / right 19
    - bottom 20 / left 21
    - bottom 19 / right 19

### 2.3 Outline buttons ("Email Us" / "Chat on Whatsapp"; component `framer-wp8tk`)
- Element: `<a>`, 48px tall, full width, radius **16px**, transparent background, border 1px **rgba(34,34,34,.08)**, `overflow:hidden`, `cursor:pointer`.
- Hover tint blob (`.framer-su9k87`):
  - Rest: a **148×148** circle (radius 50px) in **rgba(26,27,28,.04)**, at `top:-154px; left:calc(50% − 74px)`, hidden above the button.
  - Hover: grows to `inset: -243px -15px -3px -19px`, tinting the whole button.
- Labels (`.framer-4u5hqf`):
  - Window: absolute, `height:22px; top:calc(50% − 11px)`, `overflow:hidden`, column, gap **10px**.
  - Row #1: icon + title (centred, gap **6px**).
  - Row #2: icon + detail (gap **4px**).
  - Text: preset **17bojax** (Inter 16/600, #161616).
  - Hover: rows swap `order`, so the detail ("ms.m…@gmail.com" / "+90 …") rolls into view.
- Transition: **spring stiffness 500, damping 60**.
- Icons:
  - Email: **18px** Gmail "M" image centred in a 20px box (`zak6mpqSaZ86OEXK3VZ6FZ86I.png`).
  - WhatsApp: **20px** 4-layer vector — green gradient #20B038→#60D66A disc, white glyph, #E0E0E0 rim. SVGs are in the appendix.
- Links: `mailto:` and `https://wa.me/<number>`.

### 2.4 Accordion (right column `.framer-1hd49lq`, component `framer-TAjGh` "FAQ")
- **List layout**:
  - Column, **gap 16px**, centred, `overflow:hidden`.
  - Desktop: `flex:1 0 0; max-width:800px`. The width is `min(max((W−240)×0.6 − 100, 1), 800)`, so **620px at 1440**.
  - Tablet: 100% (max 800). Phone: 100%.
  - 8 items, each 100% wide.
- **Item box**:
  - `display:flex; flex-direction:column; gap:20px; padding:28px; overflow:hidden; cursor:pointer`, `tabindex=0`.
  - Radius **20px**, border 1px **rgba(0,0,0,.1)** (`::after`), background transparent.
  - Closed height is **80px** (28 + 24 + 28).
- **Top row**: flex row, `align-items:center`, **gap 24px**.
  - Question: `h4`, Plus Jakarta Sans **20/600**, -0.02em, **line-height 1em**, #161616, `flex:1`.
  - Icon: **24×24**.
- **Icon**: Phosphor **"Plus", weight bold**, colour rgb(22,22,22). SVG: `viewBox 0 0 256 256`, path `M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z`.
- **Answer**:
  - Only rendered when open. Preset **21ogod** (Inter **18px**/150%, -0.3px, #161616; ≤809 **16px**).
  - `white-space: pre-wrap`; paragraphs are separated by `\n\n`. The reference copy uses "↳ " and "📍 " as bullet glyphs.
- **Open / close** (variants "Variant 1" closed and "Variant 2" open; tapping the item toggles):
  - Transition for every variant change: **tween 300ms, `cubic-bezier(0.44, 0, 0.56, 1)`**.
  - Height: Framer layout animation from 80px to the auto height, using that transition. The answer is mounted instantly and revealed by the growing `overflow:hidden` box, with no separate fade.
  - Icon rotation: **0° → 135°** when opening and 135° → 0° when closing, same 300ms ease. The plus becomes an ×.
  - Item hover: background becomes **rgba(0,0,0,.02)**, same 300ms ease.
  - Icon hover: `whileHover {rotate:10}` with **spring stiffness 400, damping 30**.
  - Several items can be open at once; each item is independent.
- **Scroll-in effect for each item** (Framer "appear on scroll"; wrapper is `framer-…-container`):
  - Initial and exit state: `opacity:0; transform: perspective(1200px) translateY(150px)`. SSR inline style is `opacity:0; transform:perspective(1200px) translateY(150px)`.
  - Animate to: `opacity:1; translateY(0)`.
  - Transition: **spring stiffness 400, damping 30, mass 1, delay 0**.
  - `animateOnce: true`, `threshold: 0`. No stagger delays; each item triggers on its own when it enters the viewport.

### 2.5 FAQ deltas
- Tablet: panel radius 80, column layout, padding 80, gap 56. Left column 100% (max 800); list 100% wide; the H2 drops to 48px between 720 and 1023px.
- Phone: radius 32, padding 56/24/24, gap 32. Left column gap 24; contact card padding 24 with no corner dots. H2 32px; answers 16px.

---

## 3. FOOTER (`#footer`, `.framer-jx0221`)

### 3.1 Structure and box
- The footer is **`height:100vh`** (1000 at canvas), full width, `display:flex` (row; column on phone), `overflow:hidden`, `position:relative`.
- Layers, bottom to top:
  1. **BG wrapper** `.framer-e4akcj`: `flex:1 0 0`, 100vh, column, `align-items:center`, `pointer-events:none`, `overflow:hidden`, z 0.
     - **Black panel** `.framer-uldrko` (absolute inset 0, z 0): `background:#000`, **border-top-left/right-radius 120px** (tablet **80px**, phone **62px / 64px**).
     - **Gradient sheet** `.framer-erqsjk` (absolute top/left/right 0, height 100%, z 0, above the black panel):
       - Background: `radial-gradient(100% 100% at 0% 0%, #2e2e2e 0%, #161616 100%)`.
       - Radius **120px** all corners (tablet 80, phone 64).
       - Mask: `radial-gradient(125% 100% at 0 0, #000 0%, rgba(0,0,0,.22) 88.29%, transparent 100%)`. The result is a soft grey glow from the top-left that fades into black.
       - It contains the **5 diagonal light streaks** (3.3).
     - **Spacer** `.framer-qgoc7t`: height **20vh** (tablet **15vh**). Hidden on phone.
     - **Ring wrapper** `.framer-18n1mq9` ("Circle Wrap"): **1276×1276**, centred horizontally, z 1, `transform-perspective:1200` (no tilt), visible overflow. Hidden on phone. See 3.2.
     - **Progressive blur** `.framer-v86o3o-container` ("Blur Gradient"): absolute `left:0; right:0; bottom:0; height:58%`, z 1. Hidden on phone.
       - Settings: blur **16**, direction to bottom.
       - Built from 8 stacked layers with `backdrop-filter: blur(b)` where b = 0.125, 0.25, 0.5, 1, 2, 4, 8, 16px.
       - Each layer is masked with `linear-gradient(to bottom, …)` bands at 12.5% steps: layer *i* is opaque from (i+1)×12.5% to (i+2)×12.5%, and the last layer is opaque from 87.5% to 100%.
     - **Bottom fade overlay** `.framer-11ak8h6`: absolute inset 0, z 2, `linear-gradient(180deg, rgba(5,5,5,0) 77%, #050505 100%)`. Hidden on phone.
  2. **Content** `.framer-4rtfqv` ("Content"): absolute inset 0, column, **justify-content:flex-end**, centred, `overflow:hidden`.
     - Tablet: `bottom:unset; height:100vh`. Phone: `height:min-content`.
     - It contains "Text + Button" `.framer-1pwa412`:
       - Height **70.25vh** (tablet **85vh**, phone **100vh**), so the group sits in the lower ~70% of the footer.
       - Column, centred, **gap 34px**, padding 0 20px.
       - The text group's centre lands at about **64.9vh** from the footer top on desktop (≈584px at a 900px viewport).
- **Link bar** `.framer-1gs5fd4`: a sibling *after* the footer, so it sits on the **#f2f2f2 page background**, not on black. See 3.6.

### 3.2 Rotating ring of app-icon cards ("Circle")
- **Mechanism** (this is not a ticker component):
  - A Framer **loop effect** on `.framer-109ssli` ("Circle", fills the 1276 wrapper, aspect 1).
  - It animates `rotate: 0 → 360deg`, **duration 50s**, `ease: [0,0,1,1]` (linear), `repeatType: loop`, `repeatDelay: 0`, `loopPauseOffscreen: true`.
  - Positive rotation means **clockwise**, at **7.2°/s**.
- **Arms**:
  - 12 "Arm" columns. Each is `width:min-content` (110), **height:100% (1276)**, `display:flex; flex-direction:column; justify-content:space-between; align-items:center`, `overflow:hidden`.
  - Arms are absolutely centred with `top:50%; left:50%; transform: translate(-50%,-50%) rotate(θ)`. Arm 1 is in normal flow, and Arm 8 uses `top:0; translateX(-50%)`; both give the same result.
  - Rotations: **θ = 0, 15, 30 … 165°**.
- **Cards**:
  - Each arm holds 2 cards, one at each end. The bottom card has an extra `rotate(180deg)`.
  - Result: **24 cards, 15° apart**, each **upright relative to the radius** (its top edge faces outward). The cards turn with the ring; they are not counter-rotated.
- **Geometry (desktop)**:
  - Card **110×110**.
  - Card-centre radius = 638 − 55 = **583px**.
  - Chord between neighbouring centres = 2·583·sin 7.5° ≈ **152px**, so the gap between cards is about **42px**.
  - Ring top edge = footer top + 20vh. Ring centre = 20vh + 638px. At 1440×900: centre y = 818, so the topmost card spans y 180–290.
  - Cards are vertically on screen roughly within ±104° of 12 o'clock. The lower part is softened by the 58% progressive blur and the #050505 fade.
  - Visually, the upper arc frames the headline, and the headline sits inside the ring.
- Tablet: same 1276px ring (clipped by `overflow:hidden`), spacer 15vh. Phone: ring hidden.
- **Card component** (`framer-QI6zF`, "Image"):
  - Image: `object-fit:cover`, radius **22px**, `overflow:hidden`.
  - Overlay `.framer-1rwfx39`: inset 0, radius 22, `background: linear-gradient(0deg, rgba(0,0,0,.22) 0%, rgba(0,0,0,.04) 100%)`, border 1px **rgba(255,255,255,.08)** (`::after`).
  - No hover state.
- **Image order** (angle clockwise from 12 o'clock; file names under `framerusercontent.com/images/`). The images are app icons and dark app screenshots — a gear, a compass, a leaderboard app, 3D character art and so on:

| θ | top card | θ+180 | bottom card |
|---|---|---|---|
| 0 | QPaFF3iXnRBQ7YCGpNg7lc69RE.png | 180 | Fv4spTpcS9Es7NGnC3VqCmiF7RU.png |
| 15 | dh4a8tTjRJQeHPnGN4S5i1aUKk4.png | 195 | same |
| 30 | EOmpTIL1LlYkxTrFAVsu9EiDSM.png | 210 | jeGXHfL3RPhZz9vgszUWsb3NQ.png |
| 45 | f1D1Lv1sCwiKnm3CxUiGhUCJw.png | 225 | CyI2ecxFV8QapHPC0iT2PLbtaw.jpg |
| 60 | chV8vvgbbUsVzn87Fk20NPNgTI.png | 240 | same |
| 75 | FOvTehyTW5wLREO5iLjhhCIbZg0.jpg | 255 | DDGcNJzqsDlouOW3FaXitQURk.jpg |
| 90 | R3rAE4BjcGkBuCNnfn6fv0y5Uv0.png | 270 | 7NaNFATg5ZlQu2Zc2LMUvPKyEX0.png |
| 105 | je8KGRDNPxmPkqMol5xIpikA.png | 285 | bPnWQt4DbpQPtbFF8eJAzCuhU.png |
| 120 | v0oAyTfNKNmflhrRba8DweO2Q.png | 300 | same |
| 135 | 6xTMrNgCn0I0YfL6nvheoBQ3Q8.png | 315 | FOvTehyTW5wLREO5iLjhhCIbZg0.jpg |
| 150 | jeGXHfL3RPhZz9vgszUWsb3NQ.png | 330 | R3rAE4BjcGkBuCNnfn6fv0y5Uv0.png |
| 165 | X538tNXPDaApbP8HFHmKFRZoQE.png | 345 | same |

**Suggested CSS for the rebuild** (equivalent to the reference):
```css
.ring{width:1276px;aspect-ratio:1;position:relative;animation:ring-spin 50s linear infinite}
.ring__arm{position:absolute;top:0;left:50%;width:110px;height:100%;
  display:flex;flex-direction:column;justify-content:space-between;
  transform:translateX(-50%) rotate(var(--a))}      /* --a: 0deg … 165deg step 15 */
.ring__arm > :last-child{transform:rotate(180deg)}
.ring__card{width:110px;height:110px;border-radius:22px;overflow:hidden;position:relative}
.ring__card::after{content:"";position:absolute;inset:0;border-radius:inherit;
  border:1px solid rgba(255,255,255,.08);
  background:linear-gradient(0deg,rgba(0,0,0,.22),rgba(0,0,0,.04))}
@keyframes ring-spin{to{transform:rotate(360deg)}}
/* pause when off-screen (IntersectionObserver → animation-play-state:paused); honour prefers-reduced-motion */
```

### 3.3 Diagonal light streaks (inside `.framer-erqsjk`)
- All five streaks share these properties:
  - `position:absolute; top:-209px; height:1269px; max-width:960px; opacity:.05; transform: skewX(45deg)`
  - The skew runs from top-left to bottom-right; the top edge shifts about 634px left.
- Each streak's fill is `linear-gradient(#fff 0% 83.93%, transparent 100%)` (the third uses 67%). Each also has a **horizontal mask** that breaks it into bands.

Placement and masks (left values computed at 1440):

| Class | width | left (formula) | left @1440 | mask (90deg) |
|---|---|---|---|---|
| ebko3b | 591 | calc(33.6111% − 295.522px) | 188.5 | #0000 0, #000 20.04%, #0000 36.18%, #000 55.41%, #00000021 67.12%, #000 78.23%, #0000 97.30% |
| 1fhm2p | 582 | calc(−1.52778% − 291.002px) | −313 | #0000 11.40%, #000 25.56%, #0000008c 41.70%, #00000021 67.12%, #000 78.23%, #0000 97.30% |
| 1un137w | 441 | calc(33.6806% − 220.619px) | 264.4 | fill to 67%; #0000 9.81%, #000 20.04%, #0000008c 28.59%, #0000006c 40.09%, #000 48.65%, #0004 54.50%, #00000021 78.58%, #000 88.55%, #0000 97.30% |
| 197l3p2 | 684 | calc(50.1389% − 341.798px) | 380.2 | #0000 0, #000 17.66%, #0000008c 26.64%, #000 35.23%, #0000 47.70%, #00000021 69.18%, #000 79.15%, #0000 97.30% |
| ledmzu | 426 | calc(49.0972% − 213.086px) | 493.9 | #0000 0, #000 20.04%, #0000008c 27.58%, #000 42.34%, #0000 48.60%, #00000021 67.12%, #000 74.95% 82.43%, #00000078 88.67%, #0000 97.30% |

### 3.4 Footer text and button (`.framer-1fbd8c2`, "Title + Sub")
- Container: **width 500px** (phone 100%), column, centred, **gap 20px**.
- **Live clock** (code component "On"):
  - Output: `new Intl.DateTimeFormat('en-US', {hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone:'Asia/Almaty', hour12:true})` plus `" is Our Time Now"` as a suffix, e.g. **"10:06:57 PM is Our Time Now"**. The hour is zero-padded, e.g. "09:…". No date is shown.
  - Updates every **1000ms** with `setInterval`. SSR renders it empty.
  - Style: Plus Jakarta Sans 18/500, lh 1em, tabular figures, rgba(255,255,255,.5).
  - For the rebuild, swap in the studio's own timezone.
- **H2** "and… it's always the right time for impactful design":
  - Plus Jakarta Sans **600**, **40px**, ls **-0.03em** (tablet 40px/-0.04em; phone **32px/-0.04em**), lh **1.3em**, #fff, centred.
  - Wraps to about 2 lines at 500px (est.).
- **Sub text**: preset 21ogod (Inter 18/150%, -0.3px; phone 16px), centred, **rgba(255,255,255,.5)**, `max-width:421px`. Reference copy: "Ready to bring your vision to life? Book a call or send an email, and let's make it happen!"
- **White Contact button** (component `framer-4JFyF`; variant "White" on desktop and tablet, "Variant 5" on phone):
  - Box: `display:flex; align-items:center; gap:8px; height:56px; padding:12px 20px 12px 12px`, `width:min-content`, `overflow:hidden`, background **#fff**, radius **16px**.
  - White variant: border 1px **rgba(0,0,0,.08)**, shadow `0 1px 3px rgba(0,0,0,.04), 0 6px 6px rgba(0,0,0,.03), 0 13px 8px rgba(0,0,0,.02), 0 22px 9px rgba(0,0,0,.01), 0 35px 10px rgba(0,0,0,0)`.
  - Phone variant: no border, shadow `0 .6px 1.32px rgba(0,0,0,.01), 0 2.29px 5.03px rgba(0,0,0,.05), 0 10px 22px rgba(0,0,0,.2)`.
  - Avatar group `.framer-zbx644`: **28×28** box. Three pieces are stacked inside it:
    - (a) "You" bubble `.framer-j2gvka`: 28px circle at right 0, background **rgba(0,0,0,.06)**, label "You" in Poppins 10/500 rgba(0,0,0,.5).
    - (b) "+" `.framer-mmoi38` in Poppins regular, rgba(0,0,0,.5), centred at left 50%.
    - (c) Avatar photo `.framer-1hla3d9`: 28px circle at left 0, `object-fit:cover`, drawn on top.
  - At rest only the avatar shows.
  - **Hover** (White variant): the group width goes 28 → **75px**, revealing **[avatar] + [You]**, and "+" moves to `left:51%`. On phone it is always **76px** wide (expanded). The spring is inherited — Framer default (est. spring 500/60).
  - Label "Contact": preset 73mefd (Inter 16/500, -0.3px), **#161616**.
  - Link: `mailto:`, opens in a new tab.
  - **Appear animation**: (a) and (b) have `data-framer-appear-id` **j2gvka** / **mmoi38**. They go from `opacity:0.001` to `1` on page load with **spring stiffness 400, damping 30, mass 1, delay 0**, on every breakpoint. "mmoi38" keeps `transformTemplate: translate(-50%,-50%)`. These are the only entries from `__framer__appearAnimationsContent` inside these three sections, and the same ids are also used by the hero's button instance.

### 3.5 Footer deltas
| | Desktop | Tablet | Phone |
|---|---|---|---|
| top radius (black panel) | 120 | 80 | 62 (left) / 64 (right) |
| spacer | 20vh | 15vh | hidden |
| ring, blur, bottom overlay | yes | yes | **hidden** |
| content height | 70.25vh, bottom-anchored | 85vh inside a 100vh box | 100vh (centred) |
| H2 | 40 / -0.03em | 40 / -0.04em | 32 / -0.04em |
| button | White (hover expands) | White | Variant 5 (always expanded, no border) |

### 3.6 Final link bar (`.framer-1gs5fd4`, after the footer)
- Bar: row, centred, **gap 8px**, **padding 24px 0**, total height about 76px. It sits on the page background **#f2f2f2**; links are dark-on-light.
- Links (component `framer-ISG4Z`, "Variant 1"):
  - Box: `padding:0 8px`, height **28px**, radius **10px**, background `rgba(255,255,255,0)`.
  - Text: Inter 14/500, lh 20px, **#191a19**.
  - **Hover**: background **rgba(26,26,31,.11)**, spring 500/60.
- Items and targets: Home → `./`, Services → `#services1`, Pricing → `#plans`, FAQs → `#faq`, Terms → `./terms`. Same-page anchors scroll through Lenis.

---

## 4. Motion summary
| Element | Trigger | From → to | Timing |
|---|---|---|---|
| FAQ items | scroll into view (once, threshold 0) | opacity 0, translateY 150px (perspective 1200) → 1, 0 | spring k=400, c=30, m=1, no delay or stagger |
| FAQ open/close | tap | height 80 → auto (layout); icon rotate 0 → 135° | tween **300ms cubic-bezier(.44,0,.56,1)** |
| FAQ item hover | hover | bg transparent → rgba(0,0,0,.02) | 300ms same ease |
| FAQ icon hover | hover | rotate 10° | spring 400/30 |
| FAQ contact avatar | hover | rotate −4°, scale 1.1 | spring 400/30 |
| Outline buttons | hover | tint blob grows; label rows swap | spring 500/60 |
| Plan icon image | hover | rotate 360° | spring 400/30 |
| Plan toggle row | tap | variant swap (knob slides, track #000 ↔ rgba(0,0,0,.12), title/price/badge texts swap) | spring 500/60 |
| Black Contact | hover | label roll "Contact" → "Send an email" | spring 500/60 |
| Underline link | enter / leave | line left-in (full width) → right-out → snap reset after 350ms | spring 500/60 |
| Folder icon | hover | sheets rise 1–2px | spring 500/60 |
| Footer ring | always (paused offscreen) | rotate 0 → 360° clockwise | **50s linear, infinite** |
| Footer "You"/"+" | page load (appear) | opacity 0.001 → 1 | spring 400/30 |
| Footer Contact | hover | avatar group width 28 → 75px | inherited spring (est.) |
| Footer links | hover | bg → rgba(26,26,31,.11) | spring 500/60 |
| Smooth scroll | wheel / anchors | Lenis, duration 1.0s, expo-out easing | desktop and tablet only |

Plans has no appear or scroll animations. Only `j2gvka` and `mmoi38` from the appear-animation JSON belong to these sections.

---

## Appendix A: SVGs

**Checklist seal-check (20×29)**
```html
<svg width="20" height="29" viewBox="0 0 20 29" fill="none"><path d="M15.4448 8.01492C15.6348 8.47431 15.9994 8.83947 16.4585 9.03011L18.0683 9.69694C18.5278 9.88724 18.8928 10.2523 19.0831 10.7117C19.2734 11.1711 19.2734 11.6873 19.0831 12.1467L18.4167 13.7554C18.2263 14.2151 18.2261 14.7318 18.4173 15.1912L19.0825 16.7994C19.1769 17.027 19.2254 17.2709 19.2255 17.5172C19.2255 17.7636 19.177 18.0075 19.0827 18.2351C18.9885 18.4626 18.8503 18.6694 18.6761 18.8436C18.5019 19.0177 18.2951 19.1558 18.0674 19.25L16.4587 19.9164C15.9994 20.1063 15.6342 20.4709 15.4436 20.93L14.7767 22.5399C14.5864 22.9993 14.2214 23.3644 13.762 23.5547C13.3026 23.745 12.7863 23.745 12.3269 23.5547L10.7182 22.8883C10.2588 22.6985 9.74276 22.6989 9.2836 22.8894L7.67374 23.5553C7.21457 23.7451 6.69881 23.745 6.23976 23.5548C5.7807 23.3647 5.41589 23.0001 5.22546 22.5411L4.55844 20.9308C4.36848 20.4714 4.00388 20.1063 3.54477 19.9156L1.93491 19.2488C1.47568 19.0586 1.11078 18.6938 0.920407 18.2346C0.730035 17.7755 0.729777 17.2595 0.919689 16.8001L1.58604 15.1914C1.77587 14.732 1.77548 14.216 1.58496 13.7568L0.919567 12.1458C0.825228 11.9183 0.776651 11.6743 0.776611 11.428C0.776572 11.1817 0.825071 10.9378 0.919337 10.7102C1.0136 10.4826 1.15179 10.2758 1.326 10.1017C1.50021 9.92752 1.70703 9.7894 1.93463 9.69521L3.54334 9.02886C4.00233 8.83908 4.36727 8.47493 4.55805 8.01635L5.22488 6.40649C5.41518 5.94706 5.78019 5.58205 6.23962 5.39175C6.69905 5.20145 7.21526 5.20145 7.67468 5.39175L9.28339 6.0581C9.74283 6.24793 10.2589 6.24754 10.718 6.05702L12.3285 5.39278C12.7879 5.20259 13.304 5.20263 13.7633 5.39289C14.2227 5.58315 14.5876 5.94806 14.778 6.40737L15.445 8.01771L15.4448 8.01492Z" fill="#C2C2C2"/><path fill-rule="evenodd" clip-rule="evenodd" d="M13.9166 11.8509C14.0502 11.6411 14.0949 11.3867 14.041 11.1439C13.9871 10.901 13.8389 10.6895 13.6291 10.5559C13.4192 10.4223 13.1649 10.3776 12.922 10.4315C12.6792 10.4854 12.4677 10.6336 12.3341 10.8434L8.66283 16.6122L6.98283 14.5122C6.82751 14.3179 6.60138 14.1933 6.35418 14.1658C6.10699 14.1382 5.85897 14.21 5.6647 14.3653C5.47043 14.5206 5.34582 14.7468 5.31827 14.9939C5.29073 15.2411 5.36251 15.4892 5.51783 15.6834L8.01783 18.8084C8.111 18.925 8.23066 19.0177 8.36687 19.0788C8.50308 19.1398 8.65189 19.1674 8.80093 19.1594C8.94998 19.1513 9.09494 19.1077 9.22376 19.0324C9.35258 18.957 9.46154 18.8519 9.54158 18.7259L13.9166 11.8509Z" fill="black"/></svg>
```

**Timer-pause icon (13×14, fill #7C7C7C, drawn in a 16px box with inset 1px 2px 2px)**
```html
<svg width="13" height="14" viewBox="0 0 13 14" fill="none"><path d="M7.92664 1.29967H4.0733C3.80664 1.29967 3.5933 1.08634 3.5933 0.819674C3.5933 0.553008 3.80664 0.333008 4.0733 0.333008H7.92664C8.1933 0.333008 8.40664 0.546341 8.40664 0.813008C8.40664 1.07967 8.1933 1.29967 7.92664 1.29967Z" fill="#7C7C7C"/><path d="M7.3333 12.313V10.353C7.3333 9.14634 8.14664 8.33301 9.3533 8.33301H11.3133C11.4666 8.33301 11.6133 8.34634 11.7533 8.37301C11.7666 8.21301 11.78 8.05301 11.78 7.88634C11.78 4.69301 9.18664 2.09967 5.99997 2.09967C2.8133 2.09967 0.219971 4.69301 0.219971 7.88634C0.219971 11.073 2.8133 13.6663 5.99997 13.6663C6.56664 13.6663 7.10664 13.573 7.62664 13.4263C7.43997 13.113 7.3333 12.7397 7.3333 12.313ZM6.49997 7.66634C6.49997 7.93967 6.2733 8.16634 5.99997 8.16634C5.72664 8.16634 5.49997 7.93967 5.49997 7.66634V4.33301C5.49997 4.05967 5.72664 3.83301 5.99997 3.83301C6.2733 3.83301 6.49997 4.05967 6.49997 4.33301V7.66634Z" fill="#7C7C7C"/><path d="M11.3133 8.99967H9.35997C8.50664 8.99967 7.99997 9.50634 7.99997 10.353V12.313C7.99997 13.1597 8.50664 13.6663 9.35997 13.6663H11.3133C12.16 13.6663 12.6666 13.1597 12.6666 12.313V10.353C12.6666 9.50634 12.16 8.99967 11.3133 8.99967ZM9.94664 12.373C9.94664 12.5863 9.7733 12.7597 9.5533 12.7597C9.33997 12.7597 9.16664 12.5863 9.16664 12.373V10.293C9.16664 10.0797 9.33997 9.90634 9.5533 9.90634C9.7733 9.90634 9.94664 10.0797 9.94664 10.293V12.373ZM11.5 12.373C11.5 12.5863 11.3266 12.7597 11.1133 12.7597C10.9 12.7597 10.72 12.5863 10.72 12.373V10.293C10.72 10.0797 10.9 9.90634 11.1133 9.90634C11.3266 9.90634 11.5 10.0797 11.5 10.293V12.373Z" fill="#7C7C7C"/></svg>
```

**Flash icon for "x2 Designers" (15×14, #006803)**
```html
<svg width="15" height="14" viewBox="0 0 15 14" fill="none"><path d="M6.21333 7.85331H8.27333V12.6533C8.27333 13.36 9.15333 13.6933 9.62 13.16L14.6667 7.42665C15.1067 6.92665 14.7533 6.14665 14.0867 6.14665H12.0267V1.34665C12.0267 0.63998 11.1467 0.306646 10.68 0.83998L5.63333 6.57331C5.2 7.07331 5.55333 7.85331 6.21333 7.85331Z" fill="#006803"/><path d="M5.66667 2.16665H1C0.726667 2.16665 0.5 1.93998 0.5 1.66665C0.5 1.39331 0.726667 1.16665 1 1.16665H5.66667C5.94 1.16665 6.16667 1.39331 6.16667 1.66665C6.16667 1.93998 5.94 2.16665 5.66667 2.16665Z" fill="#006803"/><path d="M5 12.8333H1C0.726667 12.8333 0.5 12.6066 0.5 12.3333C0.5 12.06 0.726667 11.8333 1 11.8333H5C5.27333 11.8333 5.5 12.06 5.5 12.3333C5.5 12.6066 5.27333 12.8333 5 12.8333Z" fill="#006803"/><path d="M3 7.49998H1C0.726667 7.49998 0.5 7.27331 0.5 6.99998C0.5 6.72665 0.726667 6.49998 1 6.49998H3C3.27333 6.49998 3.5 6.72665 3.5 6.99998C3.5 7.27331 3.27333 7.49998 3 7.49998Z" fill="#006803"/></svg>
```

**Folder back (40×37)**
- Outer path: `M3.9072 0C1.74932 0 0 1.74932 0 3.90721V32.5787C0 34.7366 1.74931 36.4859 3.9072 36.4859H36.0928C38.2507 36.4859 40 34.7366 40 32.5787V9.52927C40 7.37139 38.2507 5.62207 36.0928 5.62207H24.2512C23.6884 5.62207 23.1691 5.3195 22.8916 4.82991L21.2763 1.98041C20.5825 0.756435 19.2842 0 17.8772 0H3.9072Z`
- Fill: `linearGradient(x1=20 y1=0 → y2=36.49): #C30202 → #3A0909`, plus a hairline #F46260 inner stroke.
- The full markup, including the mask, is in `index.html`, symbol id `svg1096732083_2596`.

**FAQ plus icon** (Phosphor Plus, bold, 256 viewBox): see 2.4.

**WhatsApp icon (20×20)**: 4 layers, in this order:
1. Rim path, fill **#E0E0E0**
2. Disc path, fill `linearGradient #20B038 (bottom) → #60D66A (top)`
3. Handset path (11×10, white), inset 5px 5px 6px
4. Ring path, white

The markup is in `index.html`, symbols `svg-1181417009_847`, `svg138680020_789`, `svg1741960253_1211` and `svg674086335_874`.

## Appendix B: Implementation notes for the TESERACT rebuild
- Map this site's 1440/800 breakpoints onto the project's own (1200/810) on purpose. Keep the plans frame at a fixed 928px only when the viewport is ≥1200, and otherwise use `width:100%` with 80px side padding.
- Fonts: the reference mixes Inter / Inter Display (headings and body), Plus Jakarta Sans (titles, prices, questions, footer H2 and clock) and Poppins (pills). The local project ships Geist and Geist Mono variable fonts. If Geist replaces Inter, keep the weights and letter-spacing listed above, and use Geist Mono or `tabular-nums` for the clock.
- Framer springs translate to CSS as follows (est.):
  - k=500, c=60, m=1 is critically damped (ζ≈1.34), so it settles in about 0.35s. Use roughly `cubic-bezier(.2,.8,.2,1) 350ms`.
  - k=400, c=30, m=1 is ζ≈0.75 with a slight overshoot, settling in about 0.5s. Use roughly `cubic-bezier(.34,1.3,.64,1) 500ms`, or GSAP `elastic.out(1,0.75)`, or Motion's `spring(400,30)`.
- Respect `prefers-reduced-motion`: stop the ring and skip the FAQ translate-in.

---

## Critic additions

Measured live with headless Edge after `load` + 4 s (`_work/critic/measure.cjs` → `measure.json`). Values are [x, y(page), w, h].

### A. Corrections to §0: section tops and heights
The tops in §0 (plans 4672.8, faq 6849.4, footer 8041.4, link bar 9041.4) come from Framer's SSR layout estimate and are **wrong**. Measured values:

| Section | 1440×900 | 1024×768 | 390×844 |
|---|---|---|---|
| `#plans` | y 4760.6, h **1829.4** | y 6345.3, h 2462.4 | y 5863, h 2944 |
| `#faq` (panel) | y 6590, h **992** | y 8807.7, h 1488 | y 8807.1, h 1462.8 |
| `#footer` | y 7582, h 900 (= 100vh) | y 10295.7, h 768 | y 10269.9, h 844 |
| link bar | y 8482, h **76** | y 11063.7, h 76 | y 11113.9, h 76 |
| document height | 8558 | 11140 | 11190 |

### B. Plan cards (replaces the "≈800 (est.)" in §1.5)
- **Frame**: 928 × 1265.4 at x 256 (1440). At 1024 it is 864 wide (= viewport − 160). At 390 it is 358 wide with no frame.
- **Card heights**:
  - 1440: Card 1 896 × **440**; Partnership and MVP 440 × **777.4** each (row-stretched).
  - 1024: 440 / 734.4 / 660.
  - 390: 832.4 / 871.4 / 777 (MVP is fixed at 777).
- **H2** "What are the pricing plan options?" is 720 × **123.2** (2 lines) at 1440 and 1024, and 358 × 70.4 at 390.

### C. FAQ (measured)
- Left column: 480 × 548 at 1440, 800 × 520 at 1024, 342 × 466.8 at 390.
- Contact card: 480 × 336, 800 × 308, 342 × 323.6.
- List: 620 × 752 at 1440, which is 8 × 80 + 7 × 16.
- Before an item enters the viewport it reports y + 150 (the scroll-in translateY). Measure the list, not the items.
- Phone items wrap to 96–116 px tall.

### D. Footer ring correction (§3.2)
- The BG wrapper `.framer-e4akcj` is a column with **gap:10px**. The ring therefore starts at **20vh + 10 px**, not 20vh.
- At 1440×900 the measured ring top is footer + 190 px.
- The ring centre is at y **828** (not 818), and the topmost card spans y 190–300.
- §3.1 "text group centre ≈ 64.9vh" is the centre of the text **plus button** group (430.9 + 306/2 = 583.9 px). The text block alone (500 × 216 at y +430.9) centres at 59.9vh.

### E. ζ wording (App. B)
- k 500 / c 60 / m 1 has ζ = 1.34, which is **over-damped**, not critically damped. It reaches 95 % at 322 ms, 99 % at 483 ms and 99.9 % at 713 ms.
- Use the single spring table in `ref-hero-nav.md` → Critic additions §D.

### F. Footer content gap (PLAN: "light link bar with doc footer content")
- The reference bar is one row of 5 links, 76 px tall.
- The doc FOOTER has much more:
  - brand + "Digital experiences, built around you."
  - a services line
  - Instagram / LinkedIn / Email
  - 7 nav links (measured **689.8 px** at Geist 500 14 px + 0 8 padding + 8 gaps)
  - "© [YEAR] TESSERACT. All rights reserved."
  - "BUILT DIFFERENT. BUILT FOR YOU."

Proposed layout (est., reference vocabulary):

| Row | Content and style |
|---|---|
| Container | padding 32/48/24 desktop (24/16/20 phone), rows gap 20, on `#F2F2F2` |
| 1 | Left: wordmark (cap 10 px) + tagline (Geist 400 14/20, `#161616` 70 %). Right: socials as the reference Link component (14/500, 28 px tall, radius 10, hover `rgba(26,26,31,.11)` spring 500/60) |
| 2 | Centred: the 7 nav links as Link components, gap 8. `flex-wrap:wrap; row-gap:4px`, so they wrap below 720 px |
| 3 | 1 px hairline `rgba(0,0,0,.06)`, then a row with "© 2026 {BRAND}. All rights reserved." on the left and "BUILT DIFFERENT. BUILT FOR YOU." on the right. Both Geist Mono 500 12/16, +0.02em, uppercase, `#9BA1A5`. Phone: stacked and centred |
| Services line | Geist Mono 12/16 `#9BA1A5`, " · " separators. It sits under the tagline, or feeds the hero marquee only (it is already used there) |

### G. Content gaps for this section (need the user)
- **Clock time zone**: the reference uses Asia/Almaty. The doc gives no city or time zone. Add `timezone` to `site.config.json`, and hide the clock line when it is unset. Do not guess.
- **Contact channels**: the doc gives no e-mail address, phone, WhatsApp number or social URLs. The reference contact card uses "Email Us / Chat on Whatsapp" (+ number). Render only the channels the user supplies.
