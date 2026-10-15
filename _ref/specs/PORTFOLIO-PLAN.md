# Portfolio rebuild plan — the studio's own websites (13 Oct, evening)

Source of truth for the decisions: DARK-THEME.md "Client update 7" (+ its later bullets). This file is the build plan.

## 1. Inputs
- `C:/Teseract-media/<slug>/` per project: `gallery-NN.png` (desktop 2880x1800 / phone 1170x2532 from live captures, or
  1920x1080 stills from the owner's own recordings), `laptop.mp4` (16:10 or 16:9 desktop scroll master), optional
  `hero.mp4` (780x1688 phone scroll), `info.txt` (name, url, permission, poster seconds), `capture-report.json`
  (pages, per-file "shows" text for alt text, `site_is`, `tagline_verbatim`, `issues`).
- `scripts/prepare_media.py --src C:/Teseract-media` turns them into `public/assets/media/<slug>/` variants +
  `scripts/media-manifest.json` (640/1280/1920/2560 widths, never upscaled, audio stripped, posters at the given second).
- `C:/Teseract-media/order.txt` controls manifest order (write it: clients first in the curated order below, then concepts).

## 2. Projects
> SUPERSEDED (13 Oct plan): the lists below are out of date. Current decisions: DARK-THEME.md 'Client update 8' and its
> later bullets (e.g. LiveCV is client work, Vesper a Concept Project, the home laptop plays only the VYRN film; the
> 14 Oct 22:15 / 23:20 decisions are applied by the integration run). The live list is scripts/portfolio.json.

CLIENT WORK (11, curated order; Heeding removed by the owner): aivinci, geetha-jewellers, derlin-haus, vesper, aeroskys,
mahira-select, siaara, san-media, vynk, hidden-stories, aeroskys-careers.
CONCEPTS & INTERACTIVE (13): avengers, got, ghost-rider, one-piece, aaradhya, tavra, velora, saanjh, kingfisher, tgts,
the-paradise, livecv, gireesh-portfolio.
Home laptop: vyrn first, then up to 3 client laptop clips (e.g. heeding, aivinci, derlin-haus).

Allowed facts per project: name + tagline exactly as the site shows them; live URL; year 2026; an industry label derived
from the site's own content (e.g. "Jewellery e-commerce", "Architectural lighting", "Travel booking", "Travel eSIM",
"AI creative studio", "Marketing agency", "Heritage stays", "Ceiling fans"); services default
"Website Design / Website Development" (+ "E-commerce" for shops with a cart) — flagged for owner confirmation in the report.
Concept projects carry a visible label: "Concept" for own concepts/redesigns; "Unofficial fan project — not affiliated with
the rights holders" for Avengers/Marvel, Game of Thrones, Ghost Rider, One Piece; "Unofficial concept" for Kingfisher and
TGTS (real brands/organisations). Never invent clients, results, quotes, metrics or case-study narratives.

## 3. Data model (scripts/projects.py)
Replace the ZIP list with entries built from a curated table + the media manifest:
`{slug, title, group: 'client'|'concept', industry, year: '2026', services, url (live link or None), label (concept label
or None), kind: 'case', route: 'projects/<slug>', images: [manifest gallery items], cover: gallery-01, laptop/hero video
entries}`. Keep `by_slug`, `CASES`, `PROJECTS` names so home/services/SEO keep working. The ZIP projects and their
`page-assets.json` entries are no longer referenced (their files stay in public/ but are not copied to dist).

## 4. Pages and sections
- Work page: hero marquee = all project names; intro (document copy) unchanged; the grid becomes TWO sections:
  "Client Work" (12) and "Concepts & Interactive" (13, intro line: self-initiated concepts and fan projects, not client
  commissions). Counts in the index line reflect the real numbers. Case-structure section + slot CTA unchanged.
- Project pages `/projects/<slug>/` for all 25: head (title, group badge/label, industry, year, services, "Visit site"
  external link when a live URL exists), a DEVICE SCENE hero (section 5) playing laptop.mp4, then the stills gallery
  (desktop frames in the existing full/half rhythm, phone frames as pairs), then "Next project" (within the same group).
- Home hero gallery: 20 tiles = the 12 clients + the 8 strongest concepts (avengers, got, one-piece, aaradhya, tavra,
  velora, ghost-rider, kingfisher). Slot shapes stay; covers cropped by focal point; up to 6 tiles play hero.mp4 clips.
- Home laptop (Idea section): curated list (vyrn + 3 clients), not "first 4 in the manifest".
- Services cards (service_cards.MEDIA): each card shows a project whose site evidently involves that service:
  Website Design → aivinci; Website Development → aeroskys; E-commerce → geetha-jewellers (small card back print: mahira);
  Interactive & 3D → avengers (caption shows the concept label); Brand & Digital Identity → keep 'label': 'work';
  Product & SaaS → livecv; AI & Automation → brand card (unchanged); Digital Strategy → 'label': 'work' (owner request).
- SEO/GEO: Work page CollectionPage + ItemList of the 25 projects (name, url of the case page, creator = Organization);
  project pages CreativeWork (name, dateCreated 2026, about = industry, isPartOf the collection, url of the live site as
  `sameAs` only for client sites); llms.txt lists projects by group; meta titles/descriptions per project (≤56/155 chars,
  factual). Alt text from capture-report "shows".

## 5. Device scenes (original; styled after the owner's 11 mockup references, which are NOT used themselves)
A reusable `scene` renderer: a backdrop + a device + the media inside the screen.
- Backdrops (CSS gradients, SVG noise/turbulence, light falloff, floor reflections — no third-party photos):
  `red-horizon` (deep red glow over a dark dune line), `blue-studio` (teal-blue studio, thin horizon line, reflective
  floor), `stone-red` (black space, dark stone plinth blocks, red side light), `white-glass` (light grey seamless, glass
  shelf), `grey-wall` (warm concrete wall, desk edge, soft window light), `violet-rock` (violet→white gradient, dark rock
  plinth), `violet-white` (white studio with violet glow).
- Devices drawn in CSS/SVG: studio monitor on a stand, laptop (open, 3/4 front), with realistic bezel, edge highlight,
  stand and shadow. Screen content = `lib.video` (laptop.mp4, poster first) or a still (gallery-01).
- Each project gets a scene style chosen to suit its palette (e.g. avengers/ghost-rider → red-horizon or stone-red,
  aivinci/vynk → blue-studio, geetha/mahira/siaara/aaradhya → white-glass or grey-wall, livecv/san-media → violet-rock).
- Text on/near scenes: only the project's own name, group label and one factual line.
- Performance: videos load lazily and play only in view (06-video.js); scenes are pure CSS (no WebGL), reduced motion
  shows posters; no layout shift (fixed aspect boxes).

## 6. Quality gates
Clean build; check.py 0 errors; qa.cjs 0 problems at 1440/834/390 for all routes (+ --reduced); font-check only Inter
Tight; every project page renders its scene and gallery; LCP on home and a project page measured; no ZIP project name left
on the site; no Instagram material; concept labels visible; 95-typography.css untouched; Vryn laptop video still plays.

## 7. Owner feedback on the scene prototypes (13 Oct, ~22:20)
- EVERY scene shows a DIFFERENT project (never the same site twice across the scenes on a page or the gallery).
- The project on the screen must SUIT the backdrop's colours: pair by palette, e.g. dark/red cinematic sites (avengers,
  ghost-rider, got, one-piece) -> red-horizon / stone-red; blue/tech sites (vynk, aeroskys, aivinci, tgts) -> blue-studio;
  light fashion/heritage sites (mahira-select, siaara, aaradhya, velora) -> white-glass / violet-white; neutral home/
  product sites (heeding, derlin-haus, vesper, hidden-stories) -> grey-wall / stone-red; violet/neon or agency sites
  (san-media, livecv, saanjh, gireesh-portfolio) -> violet-rock / violet-white. Decide from the actual captures' colours.
- When NO backdrop suits a project's palette (owner's example: the gold Geetha Jewellers site), do NOT put it in a device:
  show it as normal full-width images instead.
- The owner's Instagram projects belong in these scenes - sourced from their live sites, GitHub code or the owner's own
  recordings (never from Instagram files).

## 8. Follow-up capture queue (after the main capture run)
- vesper: a short clip of the day/night switch ("See it after dark" -> lamps light up) - stills of both states already exist (gallery-01 day, gallery-02 night, gallery-04 night pendants).
- avengers, got, ghost-rider from the owner's GitHub copies in the scratchpad repos folder (run locally, capture like the live sites).
- heeding: CANCELLED (owner removed the project).
- the-paradise (captured 14 Oct): a single-page promo site for the film "The Paradise" (starring Nani, a Srikanth Odela
  film). It is a FAN/CONCEPT piece on someone else's film: label it "Unofficial fan project — not affiliated with the
  rights holders" (same as avengers/got/ghost-rider/one-piece); industry "Film promo concept"; red/dark palette ->
  stone-red or red-horizon (keep it apart from the other red scenes).
- mahira-select (captured 14 Oct): its catalogue photos have AI-generation artefacts and the product pages show
  hard-coded review counts. In the portfolio prefer stills that don't feature those artefacts or the fake review counts.
