# TESERACT website — launch checklist

Everything below is a setting in `site.config.json` or a file you add, followed by a rebuild:

```sh
python scripts/build.py --clean
python scripts/check.py
```

Then upload the **contents of `dist/`** to your static host.

## Must do before going live

| # | What | Where | Why |
|---|---|---|---|
| 1 | ✓ Done (14 Oct): your real email address, `email_is_placeholder` is `false` | `site.config.json` → `email` | Email links and the contact form go to `gireesh.uiux@gmail.com`. Change it there if the address ever changes. |
| 2 | Set your domain, e.g. `https://teseract.studio` | `site.config.json` → `site_url` | Turns on canonical URLs, absolute Open Graph image, structured-data URLs, breadcrumbs and `sitemap.xml`. |
| 3 | Check the portfolio is all yours, then set `indexable` to `true` | `site.config.json` → `indexable` | The site is `noindex` + `robots.txt Disallow` until then. The ZIP's ZZStudio projects are being replaced by your own websites (client permission confirmed by you in chat). Before switching indexing on, also clear item 3b. |
| 3b | Photo licences inside your own sites | VELORA's gallery credits photographers (Denis Gorbuleac, Hassan Ouajbir) | Screenshots of a site show its photos too. Confirm you may use them, or the VELORA stills that show them are swapped out. See `SITE-ISSUES.md` for every site. |
| 3d | VYRN rights (every VYRN image on the site, plus your home laptop film) | `C:/Teseract-media/vyrn/` and `_supplied/ecommerce-vyrn-categories.png` | **Models' likeness, all VYRN imagery**: ✓ you confirmed (15 Oct) that the model images may be shown. For the record: every VYRN model photo is an AI recreation of reference screenshots made with prompts that keep the models' faces, and the repo does not say where those reference photos come from. Models appear in the VYRN project page's scene and stills (gallery-03, 04, 07, 08 and 10), its Work card, its home hero tile, the footer ring on every page (gallery-03), the next-project tile on SAANJH and your E-commerce frame. **Home film only**: it opens on the **A-COLD-WALL** hero, a real fashion label's name. The hero photo and layout come from another designer's published concept page for that label (the repo's own reference `image2.jpeg`). The Casual look in the categories sequence wears **Nike**-swoosh socks. You chose to keep the film; confirm these before launch, or replace the film. The project page shows no A-COLD-WALL screen and no film (`check.py` enforces this). **Sneakers**: ✓ resolved 15 Oct: you dropped the two screens whose Air Force 1-style sneakers carry a faint swoosh (gallery-05, Knitwear and Bomber; gallery-06, product cards 02 and 06). They are off the site (`portfolio.json` skip, `check.py` OWNER_SKIPS). **®**: the logo reads "VYRN®" in every still, the E-commerce frame and the film. The ® sign is only for a registered trademark. |
| 3e | Your other new projects (15 Oct) | `scripts/portfolio.json` | THENGA: its credited Kerala photos (Unsplash / CC BY-SA, incl. a real Kathakali performer) are in no still or video on our site. The logo's "®" is only for a registered mark. Gireesh — a designer's working desk: ✓ you confirmed (15 Oct) that "based in France, with roots in India" is true and that the illustrative FORME and SONAR case studies stay. The placeholder contact email shows in none of our media. GIREESH — Artist · Creative · Storyteller: the screens with third-party tool logos (Figma, Claude, ChatGPT …) and its desktop recording are left out, and so is the phone copy of the closing shot (gallery-10, your answer of 15 Oct). Confirm the two portraits on its "Projects" screens are not real private people. Sedile (added 15 Oct as a Concept Project, industry "3D chair showroom concept"): confirm the industry line and its light studio backdrop (white-glass, provisional). Until you answer it is not E-commerce and not in the home hero gallery, and the two stills with the site's kinked mesh-chair frames (gallery-03, 04) are left out. Its designers, prices and brand facts are the site's own fiction (its README); its footer says "Demo storefront — no real orders are processed." |
| 3c | Replace the six sample testimonials on Client Stories with real client feedback (and written consent) before launch | `scripts/content.py` → `STORIES['testimonials']`: put each client's own words and rating in `quote` / `rating`, then delete `'sample': True` | The six reviews shown today were written by us as a preview (ratings 4.7–5.0, as you asked). The page shows a "Sample reviews" tag while any remain, and `check.py` fails while one remains and `indexable` is `true` or `site_url` is set. Add a person's `name` / `role` only with their consent. |
| 4 | ✓ Done (14 Oct): Instagram, LinkedIn and GitHub URLs | `site.config.json` → `socials` | The footer, menu and structured data show only the channels that have a URL. Behance stays hidden until you add its URL. |

## Recommended

| # | What | Where | Why |
|---|---|---|---|
| 5 | Form service endpoint (e.g. Formspree) | `site.config.json` → `form_endpoint` | Without it the contact form opens the visitor's email app instead of sending directly. |
| 6 | Studio time zone (IANA, e.g. `Europe/London`) | `site.config.json` → `timezone` | The footer clock then shows studio time instead of the visitor's local time. |
| 7 | Helvetica Neue **webfont** licence | add `public/assets/fonts/helvetica-neue-300.woff2`, `-400`, `-500`, `-700` (+ `-400-italic`) | Shows the exact Helvetica Neue on every device. Today Mac/iOS see Helvetica Neue; elsewhere Inter Tight (closest free match) is used. |
| 8 | Higher-resolution originals of the reference photos | replace files in `public/assets/believe/`, `agency/`, `who/`, `idea/` (same names) | The photos were cut from the reference images and are slightly soft on high-resolution screens. |
| 9 | More client reviews | `scripts/content.py` → `STORIES['testimonials']`: one entry per client project (`project` slug, `quote`, `rating`) | Company name, industry, still and project link come from `portfolio.json`; client work only (see 3c for the samples). |
| 10 | Case-study narratives (Challenge / Idea / Experience / Details / Result) | `scripts/portfolio.json` (add fields per project) | Project pages show your HD stills, scene + video and the facts only; no stories were invented. |
| 11 | Confirm services per project | `scripts/portfolio.json` → `services` | Default is "Website Design / Website Development" (+ "E-commerce" for your shops: Derlin Haus, Mahira Select, SIAARA, VYRN). Add branding, UI/UX, SEO… where you did them. |
| 14 | Home hero gallery selection | `scripts/portfolio.json` → `home_gallery` | The gallery has 20 tiles for 23 projects: Careers at Aeroskys, your earlier Gireesh portfolio and Sedile are left out of it (all three stay on The Work page). Swap names in the list to choose others. |
| 12 | Live links: custom domains | `scripts/portfolio.json` → `url` | Several "Visit site" links are `*.vercel.app` / `*.netlify.app` addresses; switch to the clients' own domains when they have them. |
| 13 | Adding or replacing project media | `C:\Teseract-media\<project>\` then `python scripts/prepare_media.py --src C:/Teseract-media` and `python scripts/build.py` | See `MEDIA-GUIDE.md`. Captured stills/videos for all projects live there (outside OneDrive). |

## Hosting notes

- Any static host works (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3…). Turn on gzip/brotli compression (most hosts do it by default) — measured: stylesheet 250 KB → 48 KB, script 136 KB → 39 KB, home page HTML 137 KB → 25 KB with gzip.
- Serve `404.html` as the not-found page.
- CSS/JS URLs carry a content fingerprint (`styles.css?v=…`), so long cache lifetimes are safe for them.
- Videos: the host must support HTTP range requests (every real static host/CDN does; Safari needs it to play MP4). The local preview server doesn't, which only matters for testing in Safari locally.
- `public/assets/media/` holds the web versions of your project videos (≈2–9 MB each, never all loaded at once: each video loads only when it scrolls into view, at the size the screen needs).

## Decisions already made with you

- Brand spelling **TESERACT**; single typeface (Helvetica Neue → Inter Tight stand-in); black theme; header = logo + menu only.
- H1 line "Website design & development studio"; Reach **2M+**; approved micro-labels on What We Believe and A Different Kind of Agency.
- Who We Are: H1 "who we are."; "Always." omitted; no stock people shown as the team.
- One light typography everywhere (the "Your business is unique" style); 22 dark-theme audit fixes applied.
- Home laptop plays your VYRN film (silent, loops, pauses off-screen); Digital Strategy card labelled "The Work", now
  with a cursor-free TAVRA still ("The Store").
- Portfolio = your own websites: Client Work (11) + Concepts & Interactive (12: ONE PIECE as an unofficial fan
  project; AARADHYA, TĀVRA, VELORA, SAANJH, Vesper, VYRN, THENGA and Sedile as Concept Projects; your three personal sites);
  Heeding, StepAI and Kingfisher are not shown; Geetha Jewellers is shown as normal images (no device scene).
- E-commerce card: SIAARA in front, your VYRN categories frame behind it (captioned "VYRN · Concept Project", opens the
  VYRN page), Mahira Select in the What We Create stack. Aivinci's review card shows the tiger, like its Work card.
- Device scenes are original (drawn in code), colour-matched, a different project in each.
- Client Stories: an interactive client-reviews section with six client profiles (Aivinci, Geetha Jewellers, Derlin Haus,
  AeroSkys, SIAARA, Hidden Stories) and SAMPLE reviews until the real ones arrive (item 3c); never shown as
  search-engine review stars (no review structured data).
- Intro logo animation: plays once per browser-tab session on the first page opened. Open the site in a new tab, or add
  `?intro=1` to any page address, to see it again; `?intro=0` skips it (screenshots, audits).
