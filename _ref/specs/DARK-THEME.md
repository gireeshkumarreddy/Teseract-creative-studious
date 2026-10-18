# TESERACT — black theme + new references (client brief, 13 Oct)

## Client instructions (verbatim intent)
1. Header = logo + three-line hamburger only, on every breakpoint (DONE in scripts/chrome.py + src/css/10-header.css).
2. The ENTIRE site switches to a black theme. All pages, sections, components. Do not simply invert colours —
   refine so it looks intentional, premium, minimal, professionally art-directed. Strong contrast, readable,
   consistent on desktop/tablet/mobile.
3. Landing page first, using the client's reference images (images 10, 9, 8 for the home page sections);
   Who We Are page next (images 5, 6, 7).
4. SEO + GEO from the start: one keyword-focused H1 per page, logical H2/H3, meaningful alt text and
   descriptive internal links, semantic HTML, structured data where relevant, natural language, no stuffing.
5. Preserve structure and working functionality. **Do not fabricate business information or change the brand
   positioning.** Brand spelling is TESERACT (client-confirmed) even though the images say TESSERACT.

## Theme tokens (src/css/00-tokens.css — already applied)
| Token | Value | Use |
|---|---|---|
| --bg | #000 | page |
| --bg-1 | #060606 | quiet alternate band |
| --surface-1 / --paper | #0d0d0d | cards on the page |
| --surface-2 | #141414 | raised cards, inputs |
| --surface-3 | #1c1c1c | chips, hover |
| --ink | #f4f4f2 | primary text (never pure #fff for large text) |
| --ink-2 / --text-2 | rgba(244,244,242,.74) | secondary copy |
| --muted-strong | rgba(244,244,242,.62) | informational small text (AA) |
| --muted | rgba(244,244,242,.4) | decorative only |
| --line / --line-2 / --line-3 | rgba(255,255,255,.10/.06/.16) | hairlines, interactive borders |
| --frame | rgba(255,255,255,.035) | framed groups |
| --red / --red-deep / --red-dot | #fb2629 / #970102 / #ff3b3b | accent (dots, highlights, underlines, glows) |

Shared components already converted (02-components.css): `.btn--dark` = HIGH-EMPHASIS WHITE button (name kept),
`.btn--light` = secondary outlined, `.btn--inverse` white, `.btn--outline` white outline, `.pill-label` dark glass
pill with warm hairline, `.section-head*`, `.chips/.chip` (white 6%), `.frame` (white 3.5% + hairline, r48),
`.card` (#141414→#0d0d0d gradient, top highlight, hairline), `.dots`, reveal-image bg, page shade (black),
cursor pill (light), skip link (light). Header: transparent → frosted black bar after scroll.

## Art direction rules
- Depth comes from layered near-blacks + hairlines + soft inner highlights, not from grey boxes. Panels that were
  white become #0b0b0b–#141414 surfaces with `inset 0 1px 0 rgba(255,255,255,.06)` and 1px rgba(255,255,255,.07) borders.
- Large rounded "panel over panel" transitions (hero → idea, FAQ → footer) must still read: give stacked panels
  different near-black values and/or a hairline top edge + subtle top glow, so seams are intentional.
- Text: --ink for headings/body, --ink-2 for secondary, --muted-strong for small informational labels. Body ≥ 4.5:1,
  large text ≥ 3:1. Never place --muted text on informational content.
- Red is an accent: status dots, active states, one highlighted word or rule per section at most, soft red glows
  (radial, ≤ 0.25 alpha) where a reference uses colour light. Do not paint big red areas unless the reference does.
- Photography/mockups stay as they are. Light-background images on black get a 1px rgba(255,255,255,.06) frame or
  are alpha-matted (cut-outs) when the reference shows them free-floating. Shadows on black: use dark, larger,
  softer shadows or a faint ground glow instead of grey drop shadows.
- Lines/strokes/construction lines: rgba(255,255,255,.18–.35); dotted connectors rgba(255,255,255,.3).
- Hover states: brighten (rgba(255,255,255,.06–.12) washes), never darken.
- Keep every animation and interaction working; adjust only colours/surfaces unless you are a redesign agent.

## New reference images (WD/_ref/images)
| Image | Section | Destination |
|---|---|---|
| 10.webp (1436×2000) | "What we believe — SIMPLE FOR PEOPLE. POWERFUL FOR BUSINESS." image strip + 01 statement + two text columns | HOME section 4 (replaces the coverflow carousel) |
| 9.webp (1614×1739) | "A DIFFERENT KIND OF AGENCY." astronaut + red brain, 4 annotated points | HOME section 5 (part 1) |
| 8.webp (1614×963) | "WE WORK CLOSELY WITH OUR CLIENTS." + top-down handshake photo + handwritten note | HOME section 5 (part 2) |
| 5.webp (1536×1024) | "who are we." hero, orange monitor | WHO WE ARE page hero (next step) |
| 6.webp (1333×2000) | "WE'RE A SMALL TEAM WITH BIG IDEAS." floating rock + technical annotations + 01–04 | WHO WE ARE page body (next step) |
| 7.webp (1125×2000) | "People first. Always." editorial | WHO WE ARE "How we think" (next step) |
The references are light (white). Recreate their composition, typography scale, rhythm, image placement and motion
potential — on the black theme.

## Content rules for the new references (IMPORTANT)
Copy comes from scripts/content.py (the client's document). The images contain extra marketing text that is NOT in the
document. Rules:
- Headlines/body: use the document's copy. Where an image headline differs, use the document version
  (e.g. image 8 sub "Turning your ideas into digital experiences." → use HOME.agency.body).
- Factual claims in images must NOT be used: locations ("LOCAL TIME PARIS"), years ("2023 year"), team composition
  ("designers, developers and thinkers"), results ("MEASURABLE RESULTS", "perform bigger", "more engagement"),
  "global mindset".
- Image 9's four invented points map 1:1 to the document's own four lines: 01 No unnecessary layers. 02 No confusing
  language. 03 No copy-paste solutions. 04 Just good thinking, good design and technology that serves a purpose.
- Short decorative micro-labels (image captions, annotation tags) may be used only if they are pure descriptors that
  restate document wording (e.g. "PEOPLE FIRST", "THOUGHTFUL DESIGN", "STRATEGY / DESIGN / TECHNOLOGY / EXPERIENCES",
  "IDEAS", "SIMPLE FOR PEOPLE"). List every micro-label you introduce in your report so the client can approve it.
- Do not present stock photos of people as the TESERACT team or as named clients. Image 7's three-person portrait must
  not be used as a team photo (flag it; use a non-person visual instead). Image 8's handshake photo may illustrate
  "working closely with clients" (generic, not a named client).
- Photo assets come from crops of the reference images (they are the client's supplied imagery). They are low
  resolution — keep display sizes ≤ ~1.25× their pixel size and note it in the report.

## SEO / GEO rules for every section
- Home has exactly one H1 (hero). Sections use H2 for the section title and H3 for sub-items (points, statements).
- Real text, not text baked into images. Decorative images alt="" ; meaningful images get concise, specific alt text.
- Descriptive link text ("Read how we work" > "Learn more"). Internal links to the relevant inner pages.
- Natural language from the document; no keyword stuffing; no hidden text.

## Client update (13 Oct, after the brief)
- **Reach is now 2M+** (was 400K+): `HOME['numbers']['items']` = 20K+ Community · **2M+ Reach** · Millions Views Generated · Global Clients & Projects.
  Any count-up animation must parse the suffix generically (K/M/+): 20K+ counts 0→20 "K+", 2M+ counts 0→2 "M+" (or 0→2.0 with one decimal
  only if it settles on exactly "2M+"). Final rendered text must equal the content strings exactly.
- The home H1 gets an approved keyword line *inside* the H1: "Website design & development studio" (small eyebrow above
  "We don't build ordinary websites."). The integrator adds it after the hero's dark pass — hero agents: do not remove it if present.

## Client update 2 (13 Oct): ONE typeface for the entire website
- The client wants a single typography everywhere: **Helvetica Neue** (the face in the reference images).
- Implemented in tokens: `--font` = 'TS Sans' (installed/licensed Helvetica Neue cuts by weight) → Geist fallback;
  `--font-menu` and `--mono` now both resolve to `var(--font)`. Figtree and Geist Mono are no longer bundled.
- Rules: never declare another font-family (no Figtree, no Geist Mono, no monospace, no font-family literals in CSS or
  SVG `<text>`): use `font-family:inherit` or `var(--font)`. Small labels keep their uppercase + letter-spacing styling
  in the site font. Tabular figures via `font-variant-numeric:tabular-nums` where numbers align.
- `html.font-hn` is set when the visitor really renders Helvetica Neue (Mac/iOS or licensed webfont). Display headlines
  whose negative tracking was fitted to Geist must stay legible in Helvetica Neue: as a rule keep display tracking
  ≥ -0.05em, or add a `.font-hn` override (Helvetica Neue needs roughly 0.5–0.8× the negative tracking Geist needs).

## Client update 3 (13 Oct): micro-labels APPROVED
The client approved all landing-page micro-labels and borrowed lines as built (What We Believe captions, corner captions,
side label, "Read how we think"; agency point sub-lines 01–04, the "Listen. Understand. Design." note, ordinals, and
"Who we are and why we started"). Do not change them. Who We Are labels still follow the same rule (restate document
wording, list them in the report).

## Client update 4 (13 Oct, 15:10): typeface stand-in is now INTER TIGHT (not Geist)
The client insisted the site must look like the font in the images (Helvetica Neue). Helvetica Neue stays first in the
stack (exact on macOS/iOS); the single stand-in everywhere else is now **Inter Tight** (self-hosted, OFL, 100–900 +
italic) — chosen in a side-by-side test against the reference crops (_builds/fontcmp/sheet.png). Geist is no longer used.
- `html.font-hn` is now ALWAYS set (both Helvetica Neue and Inter Tight have the narrow Helvetica proportions), so all
  `.font-hn` tracking rules apply on every device; `html.font-hn-real` marks real Helvetica Neue.
- font-check.cjs on this Windows machine must report only **Inter Tight**.
- Re-check any width-fitted headline (e.g. lines that must span the container) with Inter Tight metrics.

## Client update 5 (13 Oct): Who We Are decisions
- H1 = "who we are." (NOT "who are we.") — matches the menu label and is the better keyword. Same words, same width.
- Do NOT add "Always." to "People first."

## Client update 6 (13 Oct, 16:25): ONE typography = the light style of the image-2 headline
The client wants every heading and text on the site to look like "Your business is unique. Your website should be too."
(site typeface, LIGHT 300). Implemented globally in src/css/95-typography.css (!important on purpose): all text 300,
small UI (buttons, chips, pill labels, form controls) 400, strong/b 500. Do NOT reintroduce other weights or fonts, and do
not report this as an inconsistency. Keep the family (Helvetica Neue → Inter Tight) unchanged.

## Client update 7 (13 Oct, evening): the portfolio becomes the studio's OWN websites
The ZIP's ZZStudio projects (HOCL LABS, Taurus Arena, FRAGILE BASE, Aesthetic Origins, Tafuta, Two26, Evermark, Risen Social,
SunnaKids, "Web Design") are to be REPLACED by the owner's own websites. Captured media lives in C:/Teseract-media/<slug>/
(gallery-NN.png stills, laptop.mp4 / hero.mp4 masters, info.txt, capture-report.json) and goes through scripts/prepare_media.py.
- CLIENT WORK (11, permission confirmed by the owner): geetha-jewellers, derlin-haus, aeroskys, aeroskys-careers, vesper,
  vynk, mahira-select, siaara, aivinci, san-media, hidden-stories.
- CONCEPTS & FAN PROJECTS (8, a separate, clearly labelled section - never presented as client work): the-paradise, heeding,
  one-piece (unofficial fan tribute), kingfisher (unofficial concept), tgts (concept), livecv, stepai, gireesh-portfolio.
- vyrn: the owner's VYRN launch film, already on the home laptop (keep it).
- Facts allowed on the site: name and tagline exactly as each site shows them, the live URL, year 2026 (Vercel deploy dates),
  industry as evident from the site. Services default "Website Design & Development" (+ "E-commerce" for shops) - owner to
  confirm. Never invent clients, results, testimonials or case-study stories.
- Instagram: never download from Instagram; Reel captions were read only to identify projects. Fan sites based on other
  companies' IP (Marvel, HBO, One Piece, brand redesigns) carry an "unofficial concept / fan project" label.
- Device scenes in the style of the owner's 11 mockup reference images must be ORIGINAL (our own backgrounds and drawn
  devices with the real website video/screens inside); the reference photos belong to other creators and are not used.
- Not to be shown: personal sites of private people (wedding site, birthday page, invitation, other people's portfolios).
- Update (later the same evening): HEEDING is real client work after all - the owner designed the live site
  https://www.myheeding.com/en (a fan brand: show the product fans). It moves to CLIENT WORK; feedstockverse.vercel.app is only
  a fallback source. myheeding.com sits behind Vercel's Security Checkpoint: open it in a normal browser; if a challenge page
  stays, do not try to get around it - ask the owner to pause the checkpoint or send a preview link.
- VESPER (lighting): the owner wants the light switch ON/OFF interaction shown (stills of both states + a short clip).
- THE PARADISE moves to CONCEPTS & FAN PROJECTS.
- Owner-supplied screen recordings (clean 1920x1080 website captures, no Instagram overlays), staged in C:/Teseract-media:
  aaradhya (Maa Durga saree house, "durga saree.mp4"), tavra (TĀVRA Indian-craft activewear), saanjh (SAANJH drinks),
  velora (VELORA Paris fragrance, "Perfume.mp4"). All four are CONCEPTS (owner confirmed). Make HD stills from the videos.
- Concepts also get: Avengers Doomsday, Game of Thrones, Ghost Rider (owner's GitHub repos, run locally to capture).
  STEPAI is dropped (owner). Final split: CLIENT WORK 12 (heeding via myheeding.com, geetha-jewellers, derlin-haus, aeroskys,
  aeroskys-careers, vesper, vynk, mahira-select, siaara, aivinci, san-media, hidden-stories); CONCEPTS & INTERACTIVE 13
  (the-paradise, one-piece, kingfisher, tgts, livecv, gireesh-portfolio, aaradhya, tavra, saanjh, velora, avengers, got,
  ghost-rider). vyrn stays on the home laptop.
- CORRECTION (22:25): HEEDING = "Heeding Climate Solutions", an AI-powered sustainable-fuel platform (sourcing, compliance,
  traceability) - NOT a fan brand (ignore the earlier "show the product fans" note). Its marketing site is myheeding.com/en;
  feedstockverse.vercel.app ("FeedstockVerse": login, registration, collection tracking) looks like Heeding's platform app.
  Present both under the one client project "Heeding" (marketing site + platform screens) unless the owner says otherwise.
  myheeding.com's Vercel checkpoint passed in a normal browser without any challenge.
- REMOVED (owner, 22:28): HEEDING is NOT to appear anywhere on the website (neither myheeding.com nor FeedstockVerse).
  Exclude C:/Teseract-media/heeding from the build (delete it after its capture agent finishes); no follow-up capture.
  CLIENT WORK is now 11: geetha-jewellers, derlin-haus, aeroskys, aeroskys-careers, vesper, vynk, mahira-select, siaara,
  aivinci, san-media, hidden-stories.
- REMOVED (owner, 14 Oct ~13:15): TGTS (Telangana Technology Services concept) is NOT shown - it used the government
  emblem and officials' portraits. Capture deleted. CONCEPTS are now 12: aaradhya, tavra, velora, saanjh, the-paradise,
  one-piece, kingfisher, livecv, gireesh-portfolio, avengers, got, ghost-rider. Total portfolio 23.
- REMOVED (owner, 14 Oct ~13:25): GHOST RIDER ("Spirit of Vengeance") is NOT shown - film footage and a real actor's photo.
  Capture deleted. Total portfolio 22 (11 client, 11 concept).
- SKIPPED (owner, 14 Oct ~13:30): GAME OF THRONES and AVENGERS are not captured or shown (series/film footage and real
  actors). Downloaded repos deleted. FINAL PORTFOLIO = 20: CLIENT WORK 11 + CONCEPTS & INTERACTIVE 9 (aaradhya, tavra,
  velora, saanjh, the-paradise, one-piece, kingfisher, livecv, gireesh-portfolio). Service cards that pointed at avengers
  (Interactive & 3D) must use another shown project or the 'work' label.
- OWNER, 14 Oct ~14:10: THE PARADISE is REMOVED (real actor footage, consistent with Ghost Rider) - capture deleted; it must
  appear nowhere (add it to the exclusion safety nets). gireesh-portfolio label = "Personal project" (not "Concept").
  FINAL PORTFOLIO = 19: CLIENT WORK 11 + CONCEPTS & INTERACTIVE 8 (one-piece, aaradhya, tavra, velora, saanjh, kingfisher,
  livecv, gireesh-portfolio). Fan-project wording now applies only to one-piece.

## Client update 8 (14 Oct, ~14:40): owner's "Website Updates & Development Requirements"
1. LIVECV is a CLIENT project (move it from Concepts to Client Work). VYNK Network stays in Client Work.
2. Labels on every card, project page and home tile: "Client Project" (all client work), "Interactive Concept"
   (one-piece, kingfisher), "Concept Project" (aaradhya, tavra, velora, saanjh); gireesh-portfolio keeps "Personal project".
   one-piece and kingfisher keep a small secondary "Unofficial, not affiliated with the rights holders / the brand" line.
3. E-COMMERCE = derlin-haus + mahira-select + siaara (owner confirmed 14 Oct): add "E-commerce" to their services and use
   them where E-commerce is represented.
4. WAITING FOR OWNER IMAGES (no placeholders, no substitutes without approval): a tiger picture for AIVINCI's profile image
   (Work card / home tile / service card), a new image for the "What We Create" section (Website Design large card), a new
   Website Development image (home + What We Create page), and ~8 images for the E-commerce and Interactive & 3D (and other
   small) service cards - each mapped to the right card. Preserve layout, animations and responsiveness; check desktop and
   phone; no broken image links.
- Owner-supplied images (14 Oct, owner confirmed they are HIS OWN designs): C:/Teseract-media/_supplied/website-design.jpg
  (MODU, 1200x900) -> the Website Design service card (replace the old image; home + What We Create page);
  C:/Teseract-media/_supplied/website-development.jpg (ed10, 1536x1024) -> the Website Development card (home + What We
  Create page). They are not portfolio projects: no project caption; link to The Work page. Never upscale; keep the whole
  monitor in view when cropping.
- Owner images, batch 2 (14 Oct ~15:10), saved in C:/Teseract-media/_supplied/:
  INTERACTIVE & 3D card: interactive-3d-1-obscura.jpg (OBSCURA "Beyond the Veil", 1600x900, main/front) +
  interactive-3d-2-faipy.jpg (FaiPy, 1573x1000, second/back; crop OUT its bottom "Used by experts at Google / Microsoft /
  stripe / amazon" logo row so the site shows no third-party logos). Owner's own designs; no project caption.
  E-COMMERCE card: the owner's saree e-commerce sites (SIAARA and Mahira Select stills - pick clean saree/product frames,
  respecting the Mahira skip list) + the VYRN website frame ecommerce-vyrn-categories.png (1920x1080, Categories/Formal).
  Caption each with its real project where it is one (SIAARA, Mahira Select link to their project pages; VYRN has no
  project page -> no caption). Home small card = 2 images (front/back); What We Create page row may use 3.
  Still waiting: the tiger picture for AIVINCI's profile image.
- AIVINCI profile = the TIGER from aivinci.ai's "AI Video Story" section (owner, 14 Oct ~15:20): C:/Teseract-media/aivinci/
  tiger.mp4 (silent autoplay loop) + tiger.png (still/poster). Use it as Aivinci's Work-page card media (the one card that
  autoplays: muted, loop, playsinline, lazy, plays only in view, poster under reduced motion / Save-Data) and its home hero
  gallery tile; keep Aivinci's project-page scene video as is.
- OWNER REQUEST (14 Oct ~15:25) - BRAND & DIGITAL IDENTITY service card (05), home page AND What We Create page: replace
  its images with the owner's SAANJH and VELORA websites. Front = a SAANJH still that shows the brand system (e.g.
  gallery-02 "Follow your flavour" / Kesar Cloud bottle, or gallery-06 "Three moods" collection); back = a VELORA still
  (e.g. gallery-03 "Golden light. Bottled." Éclat bottle) - NOT velora gallery-05/06 (third-party photographer credits).
  Caption each with its project name + "Concept Project" and link to its project page (no longer the generic 'work' label).
  DONE 14 Oct: service_cards.MEDIA['05'] = saanjh gallery-06 ("Three moods" collection, front) + velora gallery-03
  ("Golden light. Bottled.", back); captions "SAANJH · Concept Project" / "VELORA · Concept Project", each linking to
  its project page (home small card front/back; What We Create row = the two-image "works" stack with Tap Here).
- OWNER CORRECTION (14 Oct ~17:45): the Brand & Digital Identity card must show each site's MAIN HERO screen, not the
  collection-cards screen: service_cards.MEDIA['05'] = saanjh gallery-01 (Kesar Cloud hero, front) + velora gallery-01
  (hero 'The essence of subtle romance', back). Captions/links unchanged.
- OWNER REQUEST (14 Oct ~17:45) - CLIENT STORIES page: an interactive client-testimonials section with seven client
  profiles based on the studio's real CLIENT projects, with SAMPLE testimonials the owner will replace with real ones
  later; ratings mixed 4.7 / 4.8 / 4.9 / 5.0. Samples are flagged in data and blocked from any indexable/launch build.
- OWNER CORRECTION (14 Oct ~18:05) - testimonials: the clients speak about the owner, GIREESH, by name ("Gireesh
  understood...", "Gireesh listened...") - never "the team", "they" or "people". Attribution stays company + industry.
- OWNER CHANGE (14 Oct ~18:15) - testimonials: REMOVE Vesper ("that lights thing ... there is no client for that") ->
  six profiles: aivinci 5.0, geetha-jewellers 4.9, derlin-haus 4.8, aeroskys 4.7, siaara 5.0, hidden-stories 4.8.
  The current section (profile list + big panel + arrows/pause/counter) is "a little confusing": the owner wants it
  clearer and MORE interactive -> redesign.
- OWNER DECISION (14 Oct ~18:25): VESPER moves to Concepts & Interactive as a "Concept Project" (industry "Architectural
  lighting concept"; no client behind it). Portfolio = client 11, concepts 8 (19 total).
- OWNER CONTACT DETAILS (14 Oct ~18:30): email gireesh.uiux@gmail.com (no longer a placeholder); socials Instagram
  https://www.instagram.com/itsgireesh.uiux/ , LinkedIn https://www.linkedin.com/in/gireesh-kumar-reddy-kolli-/ , GitHub
  https://github.com/gireeshkumarreddy (owner asked "also add the GitHub link"; verified via the GitHub API: login
  gireeshkumarreddy, name Gireesh). Tracking parameters (xtok, utm_*) stripped. Shown in the footer, menu, contact,
  JSON-LD sameAs; the menu now lists only supplied channels (Behance hidden until supplied).
- OWNER REQUEST (14 Oct ~18:40): the home laptop ("The Idea" section) plays ONLY the VYRN film - no other project clips
  rotate there (portfolio.json home_laptop = ["vyrn"]); one slide = looping video with a plain pause button, no count.
- OWNER REQUEST (14 Oct ~19:00) - LOGO: show "CREATIVE STUDIOS" under TESERACT as in the supplied logo (image 1). Header +
  footer bar use public/assets/brand/wordmark-header.svg (generated by _tools/make_header_lockup.py from the traced
  wordmark-lockup.svg: the logo's own small-line glyphs scaled 1.6x and re-tracked to 94% width so they stay legible at
  header size); the big footer mark uses the exact wordmark-lockup.svg. Header aspect-ratio 1474.29/201.84.
- OWNER REQUEST (14 Oct ~19:15) - INTRO LOGO ANIMATION - DONE (14 Oct): on opening the site the four shards of the mark
  assemble in 3D on a pure black stage (a faint studio light; the slivers tumble in and seat with a click + glint), the
  mark makes the header logo's own -120deg turn, "TESERACT / CREATIVE STUDIOS" (the wordmark's own glyphs) comes in from
  the RIGHT letter by letter, and the whole lockup flies (FLIP, mark first, name 40 ms behind) into the live header logo
  while the stage lifts and the hero's own entrance starts; ~2.9 s. Interactive: the visitor holds the light (pointer;
  a held finger on touch; an ambient sweep otherwise) - the mark tilts toward it and each sliver is shaded as a lit facet.
  Once per TAB SESSION on whatever page the visitor enters (sessionStorage 'ts-intro', decided in the inline <head>
  script before first paint); never on internal navigations ('ts-nav' / same-origin referrer), #hash entries, reduced
  motion, Save-Data, forced colours or without JS. Skip at any moment: click/tap, any key (Tab also focuses "Skip to
  content"), wheel, touch-move or scroll -> fast-forward to the header landing in <= 350 ms. Scroll is held only while it
  plays (input interception, never overflow:hidden). CSS failsafe: the overlay is gone by 4.9 s even if app.js never runs.
  Owner review: open the site in a new tab or add ?intro=1 to replay; ?intro=0 suppresses it (screenshots, lab audits).
  Tunables: TILT_Y / TILT_X / TORCH_TILT / SHADE / LERP_* at the top of src/js/01-intro.js; echo .26, glint .5, light pool
  .10 and the 6deg ring lag in src/css/04-intro.css; to trim to ~2.6 s shift beats 2-3 by -150 ms and fly 500-560 ms.
  Files: scripts/chrome_intro.py (markup generated from logo-mark.svg + wordmark-header.svg), chrome.py (head decision +
  overlay first in <body>), src/css/04-intro.css, src/js/01-intro.js, --brand-* tokens shared with 10-header.css;
  check.py audits the overlay and the dock offsets; screenshot tools seed sessionStorage 'ts-intro' (CAPTURE-NOTES.md).
  RULE: any future hide-on-scroll header must stay shown while html.ts-intro is set (else the intro falls back to a
  scale-and-fade landing). DONE 15 Oct: the reviews "Client Deck" and the intro are built,
  reviewed and fixed (QA 87 page checks, 0 problems, normal + reduced motion).
- OWNER CORRECTION (14 Oct ~19:40) - AIVINCI TIGER: the tiger clip is "super zoomed" - it must LOOK LIKE A WEBSITE, not a
  full-frame video: re-record aivinci.ai's "AI Video Story" section as a desktop SCREEN RECORDING (16:9, the site's nav,
  heading "WE TURN AI IDEAS INTO REAL VIDEOS." and the tiger playing inside its own video panel, page layout visible) and
  use it for Aivinci's Work-card clip and home hero tile (same files: aivinci/tiger.mp4 + tiger.png).
- OWNER REQUEST (14 Oct ~22:15) - ADD 4 GITHUB PROJECTS: Sedile (https://gireeshkumarreddy.github.io/Sedile/, 3D chair
  finder furniture store), Thenga (coconut-drink brand, repo only - its notes call it "a creative brand concept"; credited
  Unsplash / CC BY-SA Kerala photos), greenportfolio ("Gireesh - a designer's working desk", repo only) and
  cinematic-portofilo ("GIREESH - cinematic portfolio", WebGL, repo only). Proposed labels (owner may correct): Sedile +
  Thenga = "Concept Project"; the two portfolios = "Personal project". Captured into C:/Teseract-media/{sedile, thenga,
  gireesh-desk, gireesh-cinematic}; integration into portfolio.json after the intro/review run finishes.
- PORT (14 Oct ~23:00): TESERACT preview moved to http://localhost:4273/ (.claude/launch.json). Port 4173 is now used by
  an unrelated project of the owner (street fighter, another session): never touch it or its folder.
- OWNER DECISIONS (14 Oct ~23:20): (1) KINGFISHER (the beer brand concept) is REMOVED FROM THE WHOLE WEBSITE (add to
  projects.EXCLUDED + check.py FORBIDDEN; home gallery, Work page, project page, JSON-LD, llms.txt, sitemap). (2) VYRN
  becomes a full portfolio project - "Concept Project" (Concepts & Interactive), in the home gallery, with a project
  page, services incl. "E-commerce", and part of the E-commerce service card (its caption then links to its page). Source
  repo https://github.com/gireeshkumarreddy/VYRN (not hosted; the owner pasted the cinematic-portofilo link by mistake -
  that repo is his cinematic portfolio). The home laptop keeps the owner's VYRN film (C:/Teseract-media/vyrn/laptop.mp4).
  E-commerce = derlin-haus, mahira-select, siaara, vyrn. Applied in the integration run after the review and captures.
- OWNER ANSWERS (15 Oct ~02:30): (1) Aivinci's Client Stories review card uses the TIGER (the website recording's poster,
  same as its Work card). (2) Digital Strategy card: swap the TAVRA gallery-05 still (captured ring cursor) for a
  cursor-free TAVRA still and show it to the owner. (3) VYRN project: leave OUT every screen showing the A-COLD-WALL hero
  (gallery-01, gallery-09, and the phone scroll hero.mp4 which starts on it) and the Nike-swoosh still (gallery-02); use
  only its clean screens. (4) The home laptop keeps the owner's VYRN film unchanged (it opens on the A-COLD-WALL hero; the
  owner chose to keep it). Labels: VYRN, Thenga, Sedile = "Concept Project"; gireesh-desk (greenportfolio) and
  gireesh-cinematic (cinematic-portofilo) = "Personal project". E-commerce = derlin-haus, mahira-select, siaara, vyrn.
- DONE 15 Oct (integration run, owner decisions 14 Oct 22:15 / 23:20 and 15 Oct 02:30): KINGFISHER removed from the whole
  site (projects.EXCLUDED, check.py FORBIDDEN, portfolio.json, order.txt; captures moved to C:/Teseract-media/_removed/
  kingfisher, prepared files pruned, stale dist page/media removed). Added as Concepts & Interactive: VYRN ("Concept
  Project", Fashion e-commerce concept, white-glass monitor, skip gallery-01/02/09 + hero + laptop: no A-COLD-WALL / Nike
  screen, project scene = gallery-03 still; the home laptop still plays vyrn/laptop via portfolio.json "home_laptop_clip"),
  THENGA ("Concept Project", Beverage brand concept, white-glass laptop; no credited Kerala photo in any still),
  "Gireesh — a designer's working desk" ("Personal project", grey-wall laptop) and "GIREESH — Artist · Creative ·
  Storyteller" ("Personal project", red-horizon monitor, skip gallery-03 + laptop: third-party tool logos); "keep_title"
  keeps those two names apart from info.txt's "Gireesh". Portfolio = client 11 + concepts 11 (22); home gallery = 20 tiles
  (Careers at Aeroskys and the earlier Gireesh portfolio left out of it). E-commerce = derlin-haus, mahira-select, siaara,
  vyrn; the E-commerce card's VYRN frame is captioned "VYRN · Concept Project" and is its own link to projects/vyrn/ (the
  back print no longer opens SIAARA). Aivinci's review card = the tiger poster (projects.card_poster). Digital Strategy =
  TAVRA gallery-06 ("The Store", focal 4% so its heading stays whole) + gallery-01, both cursor-free at 100 %; caption
  still "The Work". prepare_media.py gained --skip (Sedile, still being captured, was left out). check.py enforces all
  of it (OWNER_SKIPS, HOME_FILM, ECOMMERCE, NOT_ON_CARDS).
- OWNER REQUEST (15 Oct ~10:40): Who We Are intro (board C) - remove the HAND image and the laptop PHOTO from the dial
  collage (who-hand.webp, who-laptop.webp); the dial, sphere, wires, chips and statement stay.
- OWNER REQUEST (15 Oct ~11:00) - MOBILE FIRST: "really work on the mobile version ... has to be exactly the same [as
  desktop] ... even more good ... 99% of people will see the website in mobile". Full parity with desktop on phones
  (same content/features/quality, interactions adapted for touch, never removed). Process: mobile audit run1 (scratch
  mobile/run1) -> fixes -> audit run2 -> final QA.
- DONE 15 Oct (integration review fixes): alt overrides without capture notes (thenga + gireesh-desk laptop,
  gireesh-cinematic gallery-02/05); long scene-caption names (> lib.SCENE_NAME_LONG = 24 characters) wrap in a column left
  of the device (38-scene.css .scn-name--long) and grey-wall names get a soft shade; project names bind ' · ' / ' — ' to
  the word before (lib.name_text: no wrapped line starts with a separator); a project page's phone bands are spread over
  the gallery (GIREESH cinematic's second band follows the next desktop row). LAUNCH-CHECKLIST 3d now covers the likeness
  of every VYRN image (not just the film) + the faint sneaker swooshes (gallery-05/06) + VYRN®; 3e lists the desk site's
  "based in France" texts in our media. Open owner questions: LAUNCH-CHECKLIST 3d / 3e.
- OWNER ANSWERS (15 Oct ~13:30): VYRN - keep its model images (owner confirms they may be shown) but DROP the two
  sneaker screens with the faint swoosh (gallery-05, gallery-06). Desk portfolio: 'based in France, with roots in India'
  is TRUE - keep those screens; the illustrative FORME / SONAR case studies STAY. Cinematic portfolio: DROP the phone
  duplicate of the closing screen (gallery-10). Sedile (verified capture) is added as a Concept Project with the mobile
  fixes run.
- OWNER CORRECTION (15 Oct ~14:00) - SAN MEDIA scene: violet does not suit its white + green site -> new backdrop
  'green-white' (lib.SCENE_STYLES, 38-scene.css: leaf-green sky into a white studio, green-tinted white plinth; colour
  family 'green' in projects.spread). portfolio.json san-media scene = green-white (Work card + project page).
- OWNER CORRECTION (15 Oct ~14:15) - violet also wrong for Careers at Aeroskys: new 'sky-white' backdrop (sky blue into a
  white studio, cool plinth). The earlier Gireesh portfolio (dark, rust/orange) moved off violet-rock too: new
  'amber-rock' (warm ember sky, the rock lit amber). No project uses violet-rock any more; violet-white stays on LiveCV
  and SAANJH (their own palettes).
- OWNER REQUEST (15 Oct ~15:00) - FOUNDER: the content document has NO founder info; the owner supplied it (image of
  text, image itself NOT to be used) -> _ref/specs/founder-content.md (verbatim; brand spelled TESERACT). Who We Are
  gets 'The person behind TESERACT' (the site's most distinctive, interactive section; phone first; no photo of him
  until he sends a clean one) and 'Why we started' becomes 'Why TESERACT exists'; a founder teaser on home; Person
  JSON-LD. 'make sure this should be the entire website. This is the most important thing, make it interactive, make it unique.'
- OWNER (15 Oct ~15:10): the founder profile comes IMMEDIATELY AFTER THE HERO on Who We Are (hero -> founder -> intro ...).
- DONE 15 Oct (founder, "Portrait in light"): Who We Are = hero -> #founder ("The person behind TESERACT": eyebrow bar,
  a 4:5 hairline type plate with his name fitted as a nameplate over a texture of his four disciplines, lit by the hero's
  warm light that follows a finger / the mouse; roles; a split-flap "from / to" departure board + a route strip whose stops
  are the four logo-mark shards, driven by the real three-line headline (scroll, tap a line, tap the board); quote 1 inked
  as it is read; the bio with the first-place hackathon phrase in an orange frame) -> intro -> #why ("Why TESERACT exists":
  statement with the red box, three struck lines the visitor taps to restore - auto-restored when "Gireesh wanted to build
  something different." is read - 0/3 -> 3/3 + seal, quote 2 with the orange dot, the closing goals) -> philosophy ...
  Home: #founder-teaser after What We Believe (bar, nameplate, roles, strip, quote 1, "Meet the founder" -> #founder).
  NO photo and no placeholder (sections/founder.py FOUNDER_PORTRAIT = None; the plate is the slot for a clean portrait).
  Person JSON-LD (name, jobTitle Founder, worksFor, sameAs LinkedIn/Instagram/GitHub); llms.txt "The founder". home_agency
  point 03 now from the FAQ answer ("Every project starts from zero."). Owner micro-labels to approve: "Meet the founder",
  "(tap/click to restore)", "0/3", "from"/"to", "01 — 03", the texture words, "Who we are and why TESERACT exists"; switches
  WAYPOINTS='nodes' (no shard mapping) and FRAME='plate' (no 4:5 border). Files: sections/founder.py, home_founder.py,
  src/css/26-founder.css, src/js/26-founder.js (+ content.py, pages/who.py, build.py, home_agency.py, seo.py, check.py,
  30-who.css). check.py guards the verbatim copy, order, no image, JSON-LD, the teaser link and agency point 03.
- DONE 15 Oct (founder review fixes): the restored "X replaced Y." lines read exactly as written (the culprit word only
  dims; the red strike on the value word is on the owner-approval list); each quote sentence starts its own line; the
  quote ink swaps sentence by sentence; quote 2's stop is a plain full stop until it lights orange; the opening quote mark
  is a drawn orange pair (the real “ stays in the text); flap pins are neutral rivets on the module edge; >= 800px the
  board's story plays by itself once in view (leg 1 -> 2 -> 3, a #founder landing starts on 01); landscape phones keep the
  aside pinned (plate sized to the screen height); closing goals wrap balanced; screen readers get his name as one word
  and the restore lines with proper names and a per-state description (Struck through / Restored: owner micro-labels);
  Space acts on key-up, never on repeat; the strikes show in Windows High Contrast; the plate's light no longer moves on
  scroll (cheaper phone scroll) and stops its loop when the pointer rests.
- DONE 15 Oct (mobile fixes, group 1: owner answers of ~13:30 + Sedile): VYRN skips gallery-05/06 (sneaker swooshes) and
  the cinematic portfolio gallery-10 (phone copy of the closing shot; its page keeps one band of two phones) - portfolio.json
  "skip" + check.py OWNER_SKIPS. SEDILE added to the concepts as a "Concept Project" (order.txt after thenga, prepared
  without --skip; portfolio.json order 23): industry "3D chair showroom concept" (what the site is; owner to confirm),
  Website Design + Website Development, live URL, tagline verbatim, white-glass + monitor (its white editorial page;
  scene_confirmed false until the owner has seen it), Work card screen gallery-01, alt overrides where the capture notes
  carried px / seconds. Owner defaults until he answers: NOT E-commerce (still derlin-haus, mahira-select, siaara, vyrn),
  NOT in the home hero gallery (his 20 tiles), gallery-03/04 (the site's kinked mesh-chair frames) left out. Portfolio =
  client 11 + concepts 12 (23); the Work page's "Your project" slot reads 24; Sedile is the last concept card (full width,
  the colour spread puts no light scene next to another). check.py: OWNER_ADDED (prepared, shown with its group/label,
  page, card, JSON-LD, llms.txt, sitemap once site_url is set, real alt text, no home tile unless home_gallery lists it),
  the Work count (slot + ItemList) and an A11Y-04 warning for headings read letter by letter (today the Who We Are H1;
  SPELLED_NAMES_ERROR = True once mobile group 7 lands). LAUNCH-CHECKLIST 3d / 3e / 14 updated (models, sneakers, desk
  site confirmed; Sedile's open questions).
- OWNER (15 Oct ~16:15): his PHOTO is supplied (the 'Founders Series' poster; text-free 4:5 portrait cut from it, poster grid hairlines blended out: scripts/supplied.json 'founder-portrait' -> sections/founder.py FOUNDER_PORTRAIT, the Who We Are plate; the plate's centre crosshair is hidden over the photo). The NAME is "Gireesh" only, never the full name (content.WHO founder name, founder-content.md, Person JSON-LD; one-line nameplate). A larger original photo would be sharper on 3x phones.
- OWNER REQUEST (17 Oct) - SIX LANDING-PAGE CONCEPTS from his public repo gireeshkumarreddy/landing-concepts (live on
  GitHub Pages; 'Six interactive SaaS and personal-brand landing page concepts'): sagewell, vantline, tidings, emberpost,
  ines-morrow (folder creative-portfolio), maren-holt -> full portfolio projects (group concept, 'Concept Project',
  Work page + project pages), LEADING the home hero gallery, every one of the six tiles autoplaying its own clip (hero
  first, then the second section). 'we are targeting SaaS and professional people, professional websites'.
  HOME GALLERY ONLY (owner): remove AARADHYA ('Durga Mata') and what matters least to professional clients - chosen:
  aaradhya, one-piece, tavra, thenga, saanjh, gireesh-cinematic (they stay on the Work page with their pages). Gallery =
  the six landing pages + the 10 client tiles + vyrn, velora, vesper, gireesh-desk (20). PRODUCT & SAAS service card
  (owner: yes) shows two of the SaaS landing pages instead of LiveCV. Captures: C:/Teseract-media/<slug> (tile.mp4 =
  hero -> second section loop). Integration after the mobile-fix finish run.
  OWNER (17 Oct): keep AIVINCI's tiger moving too -> the home gallery plays 7 clips (the six landing pages + the tiger);
  all six landing-page tiles must also move on phones.
  OWNER (17 Oct, later): fix every landing site's own issues in the landing-concepts repo (Sagewell first, then the other
  five) and re-capture the fixed parts; add the six to the TESERACT site SOONER (with the captures ready) and swap the
  re-captured media in later.
- DONE 16 Oct (mobile fixes run) - groups 2-8 of the 15 Oct mobile audit (58 findings), integration pass 17 Oct; owner
  defaults of the audit applied, nothing beyond them. SHELL: viewport-fit=cover + safe-area page padding, 56px header in
  short landscape, the footer ring at phone size (upper arc, 480 thumbs), footer links 3+2+2 and footer/menu copy >= 14px,
  menu tagline + palette chips on phones, --h1-phone (clamp 42-46px) on every page H1 under 720px, one shared "Pause
  motion" control (TS.motionToggle + [data-motion-scope]; 32px icon, 44px hit area on touch) used by the hero gallery,
  the Work marquee and clips. HOME: stand-in tiles put every gallery project on phones, static tile captions on touch,
  first row eager (LCP), hero tag notes under the image, The Idea's play/pause follows the clip (Low Power Mode), laptop
  rise on scroll for touch, FAQ wider and :hover only on hover screens. MEDIA: 4:5 hero clips 480/640 at CRF 28, lazy
  tile posters, a PLAY pill where autoplay is refused, a pause toggle on every other looping clip, 1440 + 480 still
  rungs, 96/192 copies of the 3D mark. WORK + PROJECTS: phone screens in a swipe strip (72vw, snap), a tap-to-enlarge
  still viewer on every project page (pinch / double-tap zoom, swipe, Esc / Back / X; default 1), Geetha opens on a
  phone screen, landscape heroes fit the screen, scene names >= 24px with a scrim, content-visibility on scene stages,
  Work numbers inline. STORIES / CONTACT / 404: pinch-zoom and selectable quotes on the deck, the swipe drives the card
  light, 44px dots, lazy back-card stills, field outlines 3.6:1, Enter moves to the next field, contact pulse x3, 404
  float x2 with Start a Project first on phones. WHO / APPROACH / CREATE: the Who We Are H1 reads as one heading (sr-only
  + aria-hidden letters; check.py SPELLED_NAMES_ERROR now True), a phone "circuit" rail through the boards, scroll-driven
  tilt / light on touch, loops play once, one sentence per line, the approach tagline on phones, 16px notes, the Define
  bullets never leave a word alone. SERVICE CARDS: the card centred on screen plays its hover motion on touch (.is-live,
  rests after 4.8s), all 6 AI pills, Tap Here sticker clear of the captions, 12px caption labels, buttons named "Show the
  next <service> image". Integration: The Idea and Our Approach keep their copy out of a landscape notch (safe-area
  padding; the Idea's hand and laptop still run to the screen edges), clean rebuild (build.py --clean). Micro-labels in use under default 11, for the owner's approval: "Play",
  "Pause the video — <project>", "Pause motion" / "Play motion", "Tap to enlarge", "Previous screen" / "Next screen" /
  "Close", "Show the next <service> image". Still with the owner: sharper believe / who photos and a >= 1400px 3D logo
  render (defaults 2-4: no change, the 3D render stays in the How-we-think panels, no 960 laptop clips), Sedile's
  industry line + white-glass backdrop. Open: the footer ring spins without a pause control (WCAG 2.2.2), the 404
  float runs 15s; a real-iPhone pass (notch, Low Power Mode, :active washes).
  OWNER (17 Oct): Tidings - swap the eight real-person avatar photos for original illustrated avatars (in the
  landing-concepts repo), then re-capture the Tidings files that show them.
- DONE 17 Oct (landing-six integration, first run - the media the captures had reviewed by then): portfolio.json has all
  six as Concept Projects, first in the concepts group (orders 13-18; the earlier concepts keep their order after them),
  titles = the names the sites show (info.txt / wordmark; each page title in its note): Sagewell ('AI reasoning SaaS
  concept', green-white + monitor), Vantline ('Decision-intelligence SaaS concept', sky-white + laptop), Tidings
  ('Chat-commerce SaaS concept', violet-white + monitor; label_note 'Not affiliated with WhatsApp or Meta', the site's
  own line, as its capture review asks), Emberpost, Ines Morrow, Maren Holt (from the sites' own code until captured;
  scenes provisional, scene_confirmed false for all six). home_gallery = the six + the 14 (aaradhya, one-piece, tavra,
  thenga, saanjh, gireesh-cinematic left the gallery only). Gallery: 7 clips (MAX_VIDEO_TILES) seated together
  (home_hero._video_slots: even spread, never stacked, VIDEO_SLOTS 1-4, crop <= 0.5): the landing pages play their 16:9
  tile.mp4 in landscape slots (portfolio.json tile_clip ['tile', 'hero']: the phone loop only where a portrait slot is
  left), the tiger a 3/2 slot; a clip's stand-in for a hidden column now plays the clip (<template data-clip>, 20-hero.js),
  so all of them move at 834 / 390 / 360 too, each only while on screen (posters under reduced motion / Save-Data, no
  JS); a clip project is never a still repeat. Product & SaaS card (service 06) = the Sagewell + Vantline heroes
  (LiveCV stays a client project). check.py: LANDING_SIX / TIGER / GALLERY_CLIPS / SAAS_CARD (a landing page without
  media = a warning). On the site now: Sagewell, Vantline, Tidings; Emberpost, Ines Morrow, Maren Holt wait for their
  reviewed captures (the refresh run prepares them; until then 3 of the 7 clips are client phone scrolls).
  Repair 1 (18 Oct, after the verifiers): a landing page's loop tile (.hero-tile--loop) carries its label pill (and
  Tidings' note) at the FOOT of the frame, bottom left, at every width - the top-corner pill covered the sites' headlines
  on phones / tablets and the note did on desktop; on pointer screens the pill gives way to the hover caption (the
  tiger and the stills keep the top corner). Column 2's 4th slot is 16:9 (was 3:2): six exact 16:9 slots for the six
  loops, the tiger keeps the 3:2 (Vantline's wordmark and 'Start free' are no longer cropped off). Phones: stand-ins
  no longer push a column's first landing page down (Sagewell is the 2nd tile of column 2). What We Create: the
  Product & SaaS Tap Here sticker sits low on the right on phones (MEDIA '06' 'tap': 'low'), clear of both headlines and
  the caption; Vantline's crop '60% 50%' (no stray letter of its wordmark). Work cards: the year stays on the line of
  the industry's last word. Tidings alts (gallery-04 / -06) no longer name the headings above the frame; Maren Holt's
  industry 'Book editor personal-brand concept' (README). _tools/nojs.cjs takes a base URL (default :4273), widths
  and --routes=.
  Repair 2 (18 Oct): while landing pages wait for their media (fewer projects than the 20 slots), a repeated project
  sits only in the columns smaller screens hide first (column 4, then 3), never in its own or a neighbouring column (a
  column's last tile running on into its lead counts: two Siaara tiles had met at the gallery's top) - tablets and
  phones show every project once (check.py). The gallery columns take a fixed share of the frame (4 / 3 / 2 columns),
  so a first paint with only part of the gallery parsed no longer narrows them later (layout shift). Phones: the
  stand-ins come in at the page's start (the gallery's top tiles on screen included), not after load - with the gallery
  already on screen at the start (a restored scroll) they still wait for their place to leave the screen (no layout
  shift). Product & SaaS: Vantline's hero is drawn at 110% about '60% 20%' (service_cards MEDIA 'zoom'), so its site's
  white page margin no longer shows as a light band at the card's foot.
- OWNER REQUEST (18 Oct, ~00:45) - QUEUED, start ONLY after the six-landing-pages work (captures, repo fixes, integration,
  refreshes, final sync) is finished: 'do the SEO and AEO and GEO ... super level ... keep all the keywords and also
  technical SEO ... tell me what you did ... if someone enters our company name the 1st [result] should be our company
  and in the suggestions also ... highly important'. Existing base: scripts/seo.py (titles/descriptions, JSON-LD, llms.txt,
  sitemap when site_url is set); site.config.json site_url is empty and indexable is false (noindex,nofollow).
  OWNER ANSWERS (18 Oct) for the SEO pass: indexing LATER, AT LAUNCH (do all SEO work now, keep noindex until the owner
  says launch); domain: the owner WILL BUY one (prepare everything for a custom domain - site_url/canonical/sitemap/CNAME
  switch in one place - he will tell the address); location: REMOTE / INDIA-WIDE (no city; serves clients across India
  and worldwide - no fake address).
  OWNER (18 Oct ~19:05): ALSO HIDE GEETHA JEWELLERS from the home gallery (keeps its Work card + page). Gallery = the six
  landing pages + 13 others (aivinci, derlin-haus, aeroskys, mahira-select, siaara, san-media, vynk, livecv, hidden-stories,
  vyrn, velora, vesper, gireesh-desk) in the same 4 columns / 20 tiles - no new columns (owner: replace, don't extend).
- OWNER REQUEST (18 Oct ~19:35): WHAT WE BELIEVE (home section 4) - delete the six previous strip images
  (public/assets/believe/believe-01..06) and REPLACE them with six images the owner supplied in chat, saved as originals in
  C:/Teseract-media/_supplied/believe-2026-10-18/ (a exhibition-screens 960x540, b ai-agent-monitor 736x736, c
  people-first-poster 1086x1448, d orange-visor 736x977, e puppet-screens 900x1600, f overload-poster 736x1040).
  Licence to confirm before launch: they look like web-sourced images (736 px Pinterest-size copies); b shows a third-party
  UI design and brand ('ORRISO', 'Vireel'), e shows Facebook-like page screenshots, f shows TV-news screenshots with real people.
  DONE 18 Oct (believe): the six believe-01..06 files are deleted (public/ and dist/, no reference left in code) and the
  strip shows the owner's six in the approved caption order: 1 Intuitive experiences = b monitor, 2 Thoughtful design =
  d orange visor, 3 People first = c PEOPLE FIRST poster (the tall slot), 4 Complex made simple = f OVERLOAD poster,
  5 Purposeful technology = e puppet screens, 6 The right idea = a exhibition hall. Web copies in public/assets/believe/
  <name>-<w>.webp, two widths each (320/640, 640/1086, 360/600, 600/960; never above the original, metadata stripped,
  srcset + sizes per slot, lazy; ~117 KB on a desktop, ~254 KB on a 3x phone; OVERLOAD's halftone pre-blurred 1 px against
  moire). Literal alts (poster text read exactly; never the team or a client). 23-believe.css: same artboard, rhythm,
  captions, corner captions and motion; slots 1-2 148/155 (visor shows head + shoulders), 3 315/397 (poster lettering
  untouched), 4-5 now 3:4 and taller (top at 43 %; OVERLOAD centred on the word, the puppet from the hand down), 6 an exact
  16:9 at the top band's height; tablet: the exhibition spans 5 columns; phones: it spans both columns and the two corner
  captions close the strip below it, left and right. Licence: LAUNCH-CHECKLIST.md 3g (item 8 no longer lists believe/).
- DONE 18 Oct (landing-six integration, refresh run): all six captures reviewed, none re-capturing (lc-wait) -
  prepare_media.py without --skip brought in EMBERPOST, INES MORROW and MAREN HOLT (Sagewell, Vantline, Tidings unchanged:
  not re-captured since the first run). portfolio.json reconciled with their capture reports: verified true; industry
  'People-first email SaaS concept' (README 'people-first email'), 'Film editor portfolio concept', 'Book editor
  personal-brand concept'; taglines = the reports' tagline_verbatim ('Email organised around the people behind it.',
  'Cuts that keep people watching', 'Notes for better books'); notes cite the captures; alt overrides where a 'shows'
  line carried capture notes (px, scroll positions, 'the only control clicked') and Emberpost gallery-02's top strip
  (its review). Scenes kept, scene_confirmed false: white-glass + laptop, blue-studio + monitor, grey-wall + laptop.
  Gallery: the six 16:9 tile.mp4 loops in the six 16:9 slots (no crop) + the tiger in column 4's 3:2 = 7 clips, all
  moving at 1440 / 834 / 390 / 360 (phones load only these 7 x 480 files). home_hero._columns: a clip's stand-in never
  sits beside another clip, and no stand-in goes right under a lead tile at 3 columns where another gap is free
  (Emberpost's had stacked on Sagewell's clip at 834px and, on screen from the first paint, came in ~7 s late); check.py:
  two clips stacked in a column at any width = error, a stand-in under a lead tile at 3 columns = warning. Product & SaaS
  card unchanged (Sagewell + Vantline). With Geetha Jewellers out of the gallery (19 projects) Derlin Haus repeats in
  column 4 (shown at 1440px+ only, three columns from its own tile).
  OWNER (18 Oct ~19:45): the six believe images are AI-GENERATED (his words: 'they are AI generated, so I believe there is no
  copyright'). Licence item answered by the owner; keep only a light note about the visible brand-like names / news-style
  faces inside the images.
  DONE 18 Oct (believe, follow-up): LAUNCH-CHECKLIST 3g rewritten as answered (AI-generated per the owner; only a light note
  on the made-up brand-like names ORRISO / Vireel, the Facebook-like screens and the presenter-like faces; row 8 'see 3g';
  home_believe.py comment likewise). A 1x-desktop copy added per image (monitor 160, visor 160, poster 320, OVERLOAD 180,
  puppet 180, exhibition 288; srcset now three widths, src = the middle copy): ~43 KB on a 1x desktop instead of ~117 KB,
  2x / 3x pick the same files as before. The PEOPLE FIRST alt also reads the sub-line ('Every face has a story. Every story
  deserves to be seen.'). 23-believe.css: tablet exhibition at 1.62 (as tall as the monitor / visor, ±1 px, captions on one
  line; ~4.5 % off each side, silhouette whole); 520-899 OVERLOAD / puppet captions keep a one-line box so a wrapped
  'PURPOSEFUL TECHNOLOGY' no longer lifts its image; corner-caption lines balanced ('BUILT AROUND / YOUR BUSINESS' at 320).
  OWNER (18 Oct ~21:35): the footer ring keeps AUTOPLAYING - no pause control, no stop after one turn (closes the WCAG 2.2.2 question).
- DONE 18 Oct (landing-six integration, refresh repair 1, after the verifiers): MAREN HOLT's industry is now 'Book editor &
  newsletter concept' (the site: a fictional developmental editor with a weekly newsletter; registry 'Editor & newsletter')
  - with 'Book editor personal-brand concept' its page title ran past seo.TITLE_MAX (56) and fell back to 'Maren Holt —
  Website | TESERACT' (og:title and JSON-LD too); check.py: a landing page whose page title leaves out its industry = error.
  PRODUCT & SAAS: Sagewell's hero is drawn at 103.5% about '50% 20%' (service_cards MEDIA 'zoom', as Vantline's), so its
  site's cream page margin no longer shows as a light strip at the card's foot (stack and home front print); on the home
  small card Vantline's BACK print has its own framing (MEDIA 'small': the scene under the headline - dusk sky, glass
  pillar, walker - at 2.3x, a 1280 file asked for by its sizes) instead of headline fragments beside the front print and
  under its caption. GALLERY: on touch phones (under 600px) a landing page's loop tile carries its pill in the name strip
  under the frame (name, pill, then Tidings' note), so the whole loop shows; tablets and pointer screens keep it at the
  frame's foot. Without motion (reduced motion / no JS) the gallery frame takes its columns' full height (the ticker's
  copies not drawn, room kept under the Idea section's lift): all 19 projects whole at 1920 / 1440 / 834 / 390 / 360 (was
  10-15). HEADER: without JS the frosted bar is always drawn (scrolled content showed through the logo). Still open: Ines
  Morrow's loop shows its Reel as the live site draws it (heading and film titles in the background colour) and all six
  live pages carry the hub's title in their HTML - both fixes belong to landing-concepts (LAUNCH-CHECKLIST 3f).
  OWNER (18 Oct ~22:05): ALSO HIDE 'Gireesh - a designer's working desk' (gireesh-desk, the green Personal project) from the home
  gallery (keeps its Work card + page). Gallery = six landing pages + 12 others, same 4 columns / 20 tiles.
- OWNER (18 Oct ~22:10, going to sleep, laptop on charge all night, 'I'm not going to touch anything'): do EVERYTHING by 07:00
  on 19 Oct without him - the second push + testing, all the landing-concepts repo fixes + re-captures + media swap + push,
  and the full SEO / AEO / GEO / technical-SEO pass (keywords, brand-name #1 + suggestions goal, report of what was done),
  following every earlier instruction. Pushes to GitHub are authorised by this request.
