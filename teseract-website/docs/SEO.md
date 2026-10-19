# SEO, AEO and GEO layer: developer notes

This file covers the work done for the owner's SEO request of 18 Oct ("do the SEO and AEO and GEO ... keep all the keywords and also technical SEO ... if someone enters our company name the 1st should be our company"). It explains how the layer works, which page targets which search terms, and how the launch switch works.

Owner decisions this layer follows (`_ref/specs/DARK-THEME.md`, 18 Oct):

- **Indexing at launch only.** The site stays hidden until he says launch.
- **His own domain later.** Everything absolute follows the single `site_url` setting. No CNAME file is added now.
- **Remote, India-wide.** No city, street address, phone number or geo position.

## Where things live

| Piece | File | Notes |
|---|---|---|
| Titles and meta descriptions | `scripts/seo.py` `META` (main pages), `project_meta()` (project pages) | Titles at most 60 characters. Project titles fall back to fit `TITLE_MAX` (56). Descriptions about 70–155 characters. |
| `<head>` | `scripts/chrome.py` `document()` | Robots meta comes from `seo.robots()`. The share image comes from `seo.og_image()`. Canonical and `og:url` are set only when `site_url` is set, and never on the not-found page. `head_extra` takes the project pages' poster preload. |
| Robots directives | `seo.robots()` | When `indexable` is false, every page gets `noindex,nofollow`. At launch, the 404 page and the placeholder `/terms/` page get `noindex`. Every other page gets `max-image-preview:large, max-snippet:-1, max-video-preview:-1`. |
| Structured data (JSON-LD) | `seo.schema()` | **Organization** on every page: full-name description, `disambiguatingDescription` (one S), `alternateName`, `areaServed`, `contactPoint` (email and contact page only), `logo` (512 px), `founder`, and `sameAs`, which uses `org_profiles` or falls back to the socials. **WebSite** on every page (no SearchAction, because the site has no search). **WebPage** with `@id` = url + `#webpage` and a breadcrumb reference. **BreadcrumbList**, named from `content.NAV` and the project titles. Home only: **FAQPage**. Home and What We Create: the **OfferCatalog** of the 8 services (each Service carries all its tags, its anchor URL and its area). Home and Who We Are: **Person** (the founder). The Work page: an **ItemList** of **CreativeWork** items. Project pages: one CreativeWork (summary + label, the first still as `image`, `sameAs` = the client's live site). |
| llms.txt | `seo.llms_txt()` | Built from the full-name definition, the key facts (name and its one-S spelling with the meaning sentence, tagline, founder, where we work, contact, profiles), services, process, beliefs, FAQ, and every project with its summary. It never includes the sample reviews or the "Our Numbers" figures. |
| sitemap.xml | `seo.sitemap()`, called from `build.py` | Written only when `site_url` is set. Lists the indexable routes only (no 404, no placeholder terms) and up to 5 stills per project page as `image:image`. No `<lastmod>`, because there is no real per-page date. |
| robots.txt | `build.py` | `Disallow: /` while not indexable. `Allow: /` plus a `Sitemap:` line at launch. |
| Internal links | `lib.Ctx.url()` | Without `site_url`, links use `<route>/index.html` (works from `file://` and on the current preview). With `site_url`, links use the directory form `<route>/`, which matches the canonical. |
| Project summaries | `scripts/portfolio.json` `"summary"` | One factual sentence of at most 160 characters, drafted from each capture report's `site_is`. Shown under the project's meta line (`pages/project.py`, `.pj-head__summary`). Also used as the meta description (when it fits), in the CreativeWork description and in the llms.txt row. |
| Home FAQ | `scripts/content.py` `FAQ` | 12 entries. Five were added on 18 Oct for the owner to review: what the studio does, where it works, e-commerce, SaaS and landing pages, and what the name means. |
| Footer | `content.FOOTER['copyright']`, `chrome_footer._bar` | The copyright line now carries the full brand. Each service word links to its section on What We Create. |
| Project chips | `pages/project.py` `_chip()` | A "What we created" chip that names a service links to `what-we-create/#<service>`. |
| Logo for knowledge panels | `public/assets/brand/logo-512.png` | Drawn with `python scripts/prepare_assets.py --logo`, the same framing as the 180 px touch icon. |
| Guards | `scripts/check.py` (the SEO / GEO block near the end) and `lib.config_problems()` | Listed below. |

### Content rules

These keep the site's rankings safe and the copy honest:

- Nothing is invented: no reviews or ratings in structured data, no addresses, phone numbers, prices, client counts or awards.
- The six Client Stories testimonials are **samples**. They are never Review or AggregateRating markup and never appear in meta, llms.txt or JSON-LD (`check.py`, LAUNCH GUARD).
- Concept, fictional, demo and fan projects keep that status in every summary, description and label. Client pages never say "concept".
- No hidden text, keyword lists, misspelling blocks or city landing pages.
- The double-S spelling "Tesseract" appears only in the content document's name-meaning sentence (FAQ and llms.txt) and in llms.txt's line "Not affiliated with other companies or software named Tesseract". "TESSERACT Creative Studios" can become an `alternateName` once the owner approves it (`site.config.json` `alternate_names`).

## The launch switch

Launch means setting **both** `site_url` and `indexable` in `site.config.json`:

```json
"site_url": "https://www.your-domain.com",
"indexable": true
```

From those two values the build produces:

- canonical URLs, `og:url`, and absolute `og:image` / `twitter:image`
- directory-form internal links
- absolute JSON-LD `@id`, `url`, `logo` and `image` values, and breadcrumbs
- `sitemap.xml` with image entries
- `robots.txt` with `Allow: /` and a `Sitemap:` line
- large-preview robots meta on the indexable pages
- absolute llms.txt links

Guards:

- `lib.config_problems()`: `build.py` refuses to run, and `check.py` fails, when `indexable` is true without `site_url`, or when `site_url` is not an absolute `https://` address.
- `check.py` fails while sample testimonials remain and `indexable` or `site_url` is set (LAUNCH GUARD, LAUNCH-CHECKLIST 3c).
- `check.py` fails when `dist/CNAME` exists while `site_url` is empty. The Pages workflow ignores a CNAME file anyway; the domain is set in the repo under Settings > Pages.

The exact steps are in `LAUNCH-CHECKLIST.md` under "Launch steps".

### Testing the launch state without touching the real config

`lib.py` merges the JSON file named by the environment variable `TESERACT_CONFIG_OVERLAY` over `site.config.json`. `build.py` refuses to write `dist/` with an overlay, and `check.py` refuses to check `dist/` with one.

```sh
echo {"indexable": true, "site_url": "https://www.example-domain.com/"} > <scratch>/launch.json
TESERACT_CONFIG_OVERLAY=<scratch>/launch.json python -I -B scripts/build.py --out <scratch>/launch-dist
TESERACT_CONFIG_OVERLAY=<scratch>/launch.json python -I -B scripts/check.py --dist <scratch>/launch-dist
```

While the sample reviews remain, expect exactly one error: the LAUNCH GUARD. Results are written next to the scratch folder (`<scratch>/launch-dist.static-check-results.json`). The scratch build copies about 250 MB of media, so delete it afterwards.

## What check.py enforces (SEO / GEO block)

**Errors**

- Launch switch problems (above). `dist/CNAME` without a `site_url`.
- While not indexable: a page without `noindex,nofollow`, or a `robots.txt` without `Disallow: /` or with a Sitemap line.
- At launch: `robots.txt` without `Allow: /` and `Sitemap: <site_url>/sitemap.xml`. A noindex or nofollow on an indexable page. No `noindex` on the 404 or the placeholder terms.
- Without `site_url`: any canonical, `og:url`, absolute `og:image`, JSON-LD `@id` or absolute URL of ours, a sitemap.xml file, or absolute llms.txt links.
- With `site_url`, every non-404 page needs:
  - exactly one self canonical, equal to `seo.abs_url(route)` and to `og:url`
  - one absolute https `og:image` on the site that exists in the build
  - no internal href ending in `index.html`
- With `site_url`, the build as a whole needs:
  - sitemap `<loc>` entries equal to the canonicals of the indexable pages, with every listed image a file of the build
  - every llms.txt link under `site_url`
- Duplicate titles or meta descriptions (the 404 pair excepted).
- JSON-LD with `address`, `telephone`, `geo` (and similar keys), or with Review or rating data.
- Project summaries:
  - longer than 160 characters
  - a concept-group summary without concept, fictional, invented, unofficial, personal or demo
  - a client summary with "concept"
  - a summary that is not shown on its page
- The CreativeWork description must be `seo.work_description()` (summary + label).

**Warnings**

- A title over 60 characters.
- A meta description outside 70–160 characters.
- A shown project without a summary.

**Also checked:** one H1 per page, valid JSON-LD, and that every internal link resolves (a directory link resolves to its `index.html`).

## Keyword map: one primary page per term

Primary terms are what the page's title, description, H1 and structured data target. Secondary terms are supported by the page's copy.

| Page | Primary | Secondary |
|---|---|---|
| `/` (home) | TESERACT Creative Studios; TESERACT; brand variants (TESERACT studio, Teseract creative); "Tesseract Creative Studios" (name FAQ; alternateName after sign-off); website design and development studio; web design studio / website design agency India; website development company India; remote web design studio (India and worldwide); custom / tailor-made website design; what does TESERACT Creative Studios do; what does the name TESERACT mean | creative web design agency; bespoke website design; do I need a brief; custom website vs template; fixed packages (no prices); client involvement |
| `/who-we-are/` | about TESERACT Creative Studios; TESERACT founder (Person `#founder`); Gireesh product designer / UI/UX designer; digital creative studio | product design and UI/UX studio; why TESERACT exists |
| `/what-we-create/` | website design services and UI/UX (`#website-design`); website development and landing pages (`#website-development`); e-commerce design and development (`#e-commerce`); interactive & 3D (`#interactive-3d`); brand & digital identity (`#brand-digital-identity`); SaaS product and dashboard design (`#product-saas`); AI & automation (`#ai-automation`); digital and website strategy (`#digital-strategy`) | responsive design; design systems; wireframes and prototyping; business / corporate / CMS websites; web applications; cart & checkout, payment integration; scroll animation; brand guidelines; conversion strategy; SaaS landing pages |
| `/our-approach/` | website design process; web design process steps; how a website project works | after launch; support and evolution |
| `/work/` | TESERACT portfolio / work; website design portfolio; website case studies | client website examples; e-commerce and SaaS landing page examples; concept websites |
| `/client-stories/` | TESERACT client stories / client experience | "reviews" / "testimonials" only after real, consented reviews replace the samples |
| `/contact/` | contact TESERACT Creative Studios; start a website project; hire a website design studio | TESERACT email; project enquiry; budget estimate |
| `/privacy/`, `/terms/` | none | `/terms/` is noindexed while it is a placeholder |
| Client project pages | Title: the client's name + `<industry> website` (for example "Derlin Haus — Menswear e-commerce website"; a shorter industry from `seo.TITLE_INDUSTRY` where the full one is too long). Description (`seo.PROJECT_DESC`): the summary's facts with "by TESERACT", so the page never reads as the client's own | the summary's terms |
| Concept project pages | `<industry>` as written (for example "AI reasoning SaaS concept"). Tidings keeps "Not affiliated with WhatsApp or Meta" and ONE PIECE its fan disclaimer; neither targets the trademark. | |

Avoid these overlaps:

- SIAARA, AARADHYA and Mahira Select (saree / ethnic wear)
- THENGA and SAANJH (beverage brands)
- Derlin Haus and VYRN (fashion e-commerce)
- the three Gireesh personal sites and Who We Are (the person entity belongs on `/who-we-are/#founder`)

## Not done here (owner actions and other lanes)

See the plan's owner actions and `LAUNCH-CHECKLIST.md`. They cover:

- **Domain and Search Console:** buying the domain, the DNS and Pages settings, Search Console and Bing verification by DNS TXT.
- **Company profiles and name:** company profiles under the exact full name (then fill `org_profiles`), and using the full name everywhere.
- **Owner-only content:** real reviews, case-study narratives, and one-line descriptions for services 05–08.
- **Media lane:** video bitrate and WebM, and optionally a JPEG share image per project (project `og:image` is the WebP still today).
- **Performance pass:** CSS split, grain textures, idle initialisers.
