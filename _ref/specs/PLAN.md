# TESERACT website — implementation map (Phase 2)

Project: `WD/teseract-website/` (evolved from the user's ZIP: Python-stdlib static build + vanilla CSS/JS, no framework).
Build: `python scripts/build.py [--out DIR]`. Pages are assembled from renderer modules in `scripts/sections/*.py` and `scripts/pages/*.py`; CSS/JS are ordered partials in `src/css/*.css` and `src/js/*.js` concatenated to `dist/styles.css` / `dist/app.js`.

## Source priority (from the brief)
1. Section ORDER on the home page: Hero (reference) → Image 2 section → reference sequence (services → testimonials → plans → FAQ → footer CTA).
2. CONTENT: the master document (`scripts/content.py` is a faithful transcription — use it, never invent claims, testimonials, clients, numbers or case-study narratives).
3. VISUAL TREATMENT + MOTION: the reference site (`_ref/specs/ref-*.md`), except where an image defines the design (image 2 = section after hero, image 3 = menu, image 4 = Our Approach page).
4. Project presentation / reveals / hover: the ZIP home gallery ("studio second section") — `_ref/specs/zip-project.md` §4–5 — plus a new "View Project" cursor pill (`src/js/05-cursor.js`, add `data-cursor` via `lib.project_tag`).

## Brand
- Name: `lib.BRAND` = "TESERACT" (spelling from the logo, image 1; configurable in `site.config.json`). Never hard-code the name; use `{brand}` in copy + `lib.fmt()`, or `lib.BRAND`.
- Assets (in `public/assets/brand/`): `logo-mark.svg` (flat mark, currentColor/black), `logo-mark-3d.webp|png` (the 3D render from image 1, transparent), `wordmark.svg` (TΞSΞRΛCT), `wordmark-lockup.svg` (+ CREATIVE STUDIOS), `favicon.*`, `og-image.jpg`.
- Palette (image 3 menu): black #000, deep red (sampled), red #FB2629, light grey #F6F6F6; reference neutrals: page #F2F2F2, text #161616/#121212, grey label #9BA1A5, red dot #ED3131. Red is an ACCENT only (dots, hover underline/marks, menu art). Our Approach page keeps image 4's blue accent locally (`--approach-accent`).
- Type: `--font` = 'TS Sans' (Helvetica Neue cuts via local()) → Geist. Weights: 300 light (image 2 headline), 400 body, 500/600 headings (maps to HN Medium), 700 bold. `--mono` Geist Mono for small uppercase labels. Reference sizes: H1 72/0.95/-0.05em (64 @720–1023, 32 @<720), H2 56/1.1/-0.04em (48, 32), body 16/1.5/-0.3px, large body 18 (16 <810), button 16/500/-0.3px, small button 12/500/-0.02em.
- Breakpoints (reference): desktop ≥1440, tablet 800–1439.98, phone ≤799.98 (+ text presets at 1023/719/809 as in specs).

## Shared helpers / components (already implemented — reuse, don't fork)
- `scripts/lib.py`: `Ctx(route,page)` (`ctx.url(route, frag)`, `ctx.asset(path)`), `picture(ctx,name,alt,sizes=,eager=,cls=)` (manifest assets with srcset), `ratio(name)`, `img(ctx,file,alt,w=,h=)` for non-manifest files under `public/`, `roll(text)`, `icon(name)`, `ICONS`, `button(ctx,text,href,variant='dark'|'light'|'outline'|'ghost'|'inverse',icon_name=,lead=,cls=)`, `pill_label(text)`, `section_head(label,title_html,sub_html=,align=)`, `chip(text)`, `project_href`, `project_tag(ctx,p,cls)` (returns open/close tag with `data-cursor`), `social_href(key)`, `fmt`, `E`.
- `scripts/content.py` (all copy), `scripts/projects.py` (`PROJECTS`, `CASES`, `by_slug`; each has title/date/industry/services/services_list/kind/url/route/cover/images).
- CSS: `00-tokens.css` (tokens, fonts, springs), `01-base.css` (reset, `.container`, `.section`), `02-components.css` (`.roll`, `.btn*`, `.pill-label`, `.section-head*`, `.chips/.chip`, `.frame`, `.card`, `.dots`), `03-motion.css`, `05-cursor.css`.
- Motion attributes (`02-core.js` + `03-motion.css`): `data-reveal` (`""`=fade-up 40px, `fade`, `blur`, `scale`; per-element `style="--d:120ms;--y:80px"`), `data-stagger="80"` on a parent assigns incremental `--d` to descendant `[data-reveal]`, `data-split` on display headings (word rise), `.reveal-image` wrapper (ZIP scale 1.1→1 + fade), `data-clip` (inset clip reveal), tickers (`data-ticker data-direction data-speed data-hover` + `data-ticker-list`), `data-nav-dark` (header switches to dark variant over it), `window.TS` (`TS.motion()`, `TS.reduced()`, `TS.lenis`, `TS.scrollTo`, `TS.lockScroll(bool)`, `TS.ready(fn)`).
- Smooth scroll: Lenis (duration 1.0, expo-out) on desktop/tablet fine pointers only, off under reduced motion — same as the reference.
- Page transitions: leave shade 240 ms + enter fade (ZIP pattern) — automatic for internal links.

## Page map

### Global chrome
| Part | Source | Owner files |
|---|---|---|
| Header pill nav (sticky, 720 px frosted pill: mark tile + wordmark · 4 quick links · "Start a Project" small dark button · menu toggle; dark variant over `[data-nav-dark]`; phone: mark+wordmark · CTA · toggle) | ref-hero-nav §3 | markup in `scripts/chrome.py` (`header()`), CSS `src/css/10-header.css` |
| Menu overlay (full-screen, image 3: top bar tagline/Start a Project outline pill/X; left typographic art panel "Aa" + palette + construction lines; right 7 large uppercase items; bottom-left legal + socials) | image 3 spec | `scripts/chrome_menu.py` (`render(ctx)`), `src/css/11-menu.css`, `src/js/10-menu.js` |
| Footer CTA (black panel, 120 px top radius, light streaks, rotating ring of project cards, live clock line, headline "Have an idea?" + doc lines + white "Start a Project" button; then light link bar with doc footer content) | ref-plans-faq-footer §3 + doc FINAL CTA/FOOTER | `scripts/chrome_footer.py` (`render(ctx, cta=True)`), `src/css/12-footer.css`, `src/js/12-footer.js` |

### Home (`/`)
| # | Section | Source | Content | Owner files |
|---|---|---|---|---|
| 1 | Hero | ref-hero-nav §4–9 | HOME.hero. Rotating pill = brand 3D mark avatar + doc statements (no fake quotes). H1, lead + body, CTAs "Start a Project" (dark, brand-mark lead + "You" chip hover) / "Explore Our Work" (light → work page). Badge: red pulsing dot + mono tagline. Marquee of FOOTER.services words. 4-column vertical-ticker gallery of ZIP project imagery (tiles link via `project_tag`, View Project cursor, caption roll). | `sections/home_hero.py`, `20-hero.css`, `20-hero.js` |
| 2 | The Idea (image 2) | image 2 spec | HOME.idea. Exact composition: top-right label, giant light 2-line headline, gloved hand + SVG strings to 4 discipline labels, left copy, laptop on stones with OUR project imagery on the screen. White panel with large top radius overlapping the hero gallery (reference FAQ→footer technique) for a seamless hand-off. | `sections/home_idea.py`, `21-idea.css`, `21-idea.js` |
| 3 | What We Create (overview) | ref-services | CREATE: pill + heading + 2 big rows (info card + image card) + small cards for the remaining services; tags as chips; image cards use matching ZIP project imagery; "Explore all services" → `/what-we-create/`. | `sections/home_services.py`, `sections/service_cards.py` (shared), `22-services.css` |
| 4 | What We Believe + Our Numbers | ref-testimonials (coverflow carousel) | HOME.believe + HOME.numbers rendered as carousel cards (statement + stat tiles), brand mark instead of client avatars, no stars/ratings. | `sections/home_believe.py`, `23-believe.css`, `23-carousel.js` |
| 5 | A Different Kind of Agency | ref-plans (frame + cards) | HOME.agency in the wide card (checklist of the "No …" lines), plus two cards teasing Who-We-Are philosophy & promise (doc copy) linking to `/who-we-are/`. No prices/toggles. | `sections/home_agency.py`, `24-agency.css` |
| 6 | FAQ | ref-faq (white 120 px-radius panel overlapping the footer) | `content.FAQ` (answers assembled from doc sentences) + contact card (CONTACT.before lines, Email + Start a Project buttons). | `sections/home_faq.py`, `25-faq.css`, `25-faq.js` |
| — | Footer CTA | see chrome | HOME.final_cta | chrome_footer |

### Inner pages (reference visual vocabulary: page hero = pill label + H1 72 px centred + sub; frames/cards/chips; same motion)
| Route | Content | Design notes | Owner files |
|---|---|---|---|
| `/who-we-are/` | WHO | hero; "Why we started" big question card; philosophy 4 steps; "How we think" 3 cards; promise statement | `pages/who.py`, `30-who.css` |
| `/what-we-create/` | CREATE | hero; all 8 services as reference service rows (alternating info/image); CTA card "Not sure what you need?" | `pages/create.py`, `31-create.css` (+ shared `service_cards.py`) |
| `/our-approach/` | APPROACH | **image 4 design** (flowchart: giant headline, 9-step spine, decision diamonds, bracket lists, "Details matter." footer). Blue accent local to the page. Scroll-drawn spine. Responsive collapse. | `pages/approach.py`, `32-approach.css`, `32-approach.js` |
| `/work/` | WORK + PROJECTS | hero; intro lines; project grid of all 10 ZIP projects (ZIP tile pattern: native aspect, reveal 1.1→1, hover zoom 1.018, mono caption box + roll, View Project cursor); card info per doc template (Industry, What we created, View Case Study →) — omit the "[specific business goal]" sentence; case-study structure explainer; CTA | `pages/work.py`, `33-work.css`, `33-work.js` |
| `/projects/<slug>/` (5) | PROJECTS case | ZIP case page: title, date · industry, services chips, 13-image gallery (half/full rhythm `{0,1,3,4,7,8}` half), reveals; next-project link; back to work. Doc's case structure headings are NOT rendered (no narrative supplied). | `pages/project.py`, `36-project.css` |
| `/client-stories/` | STORIES | hero; (no testimonials — doc has placeholders; render nothing fabricated); client-experience section; review CTA (mailto) | `pages/stories.py`, `34-stories.css` |
| `/contact/` | CONTACT | hero; form (fields from doc; submits to `form_endpoint` if configured else opens a pre-filled email to `CONFIG.email`); "Before you send" card | `pages/contact.py`, `35-contact.css`, `35-contact.js` |
| `/privacy/`, `/terms/`, `/404/` | honest minimal text | | `pages/legal.py` (`privacy`, `terms`, `notfound`), `37-legal.css` |

## Rules for every implementer
- Edit ONLY your owner files (plus new files you create under your own names). Shared files (`lib.py`, `chrome.py`, `00–05` CSS/JS, `content.py`, `projects.py`) are read-only — if you need a change there, describe it in your final report.
- Renderers: `def render(ctx) -> str` (sections/pages) unless noted. Wrap each section in `<section class="… section" id="…" aria-labelledby="…">`.
- Every image: `alt` text, width/height (or aspect-ratio wrapper), `sizes` correct per breakpoint, `loading=lazy` except above-the-fold.
- Accessibility: one `<h1>` per page (home's is in the hero), headings in order, focus-visible styles, buttons are `<button>`, links are `<a>`, `aria-*` for accordions/carousels/menus, `prefers-reduced-motion` respected (no autoplay/tickers, no transforms).
- No new runtime libraries. No external network resources at runtime (fonts/images are local).
- Verify: build to `WD/_builds/<your-key>/` with `python scripts/build.py --out ../_builds/<key>` (run from `WD/teseract-website`), then capture with `node ../_tools/shoot.cjs http://127.0.0.1:4174/_builds/<key>/<route>index.html ../_builds/<key>-shots/<name> 1440,834,390 --slices --wait=1500` (server already running on port 4174 serving WD). Read the PNGs, compare against the reference images / reference shots in `WD/_ref/shots/` and the source images in `WD/_ref/images/`, and iterate until faithful. Check `build-report.json` for failures and the shoot script's ERRORS for console errors / failed requests.
