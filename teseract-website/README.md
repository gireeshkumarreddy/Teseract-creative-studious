# TESERACT Creative Studios — website

Static, framework-free website (black theme) built on the stack of the supplied ZIP project: a Python
(standard library only) generator writes every route to `dist/`, styles and scripts are
plain CSS/JS. Upload the **contents of `dist/`** to any static host.

## Build, check, preview

```sh
python scripts/build.py          # writes dist/ (also: npm run build)
python scripts/check.py          # static checks: routes, links, images, h1s, stray identity text
python -m http.server 4173 --directory dist   # preview at http://localhost:4173
```

`python scripts/build.py --out <dir>` builds into another folder.

## Configure before launch — `site.config.json`

| Key | Purpose |
|---|---|
| `brand` | Brand name used everywhere (`TESERACT`, the logo's spelling). |
| `email` | **Placeholder (`hello@example.com`)** — set the real address. Used by Email links and the contact form fallback. |
| `socials.instagram / linkedin / behance` | Empty = links render disabled ("Link coming soon"). |
| `form_endpoint` | Optional form service URL (e.g. Formspree). Empty = the contact form opens a pre-filled email instead. |
| `site_url` | Optional canonical origin. |
| `indexable` | `false` = `noindex` + `robots.txt Disallow` (default until rights to the portfolio imagery are confirmed). |

Rebuild after changing the config.

## Structure

```
scripts/build.py        page list + build pipeline (CSS/JS partials are concatenated)
scripts/lib.py          helpers: responsive picture(), buttons, labels, links, inline SVG
scripts/content.py      ALL copy, transcribed from the content master document
scripts/projects.py     portfolio data carried over from the ZIP
scripts/chrome*.py      <head>, pill header, menu overlay (image 3), footer
scripts/sections/       home page sections
scripts/pages/          inner pages + case studies + legal/404
src/css/NN-*.css        tokens, base, components, motion, then one file per section/page
src/js/NN-*.js          Lenis (vendored, MIT) + core runtime + per-section scripts
public/assets/          images, fonts, brand files (only referenced files are copied to dist)
```

## Page map

Home: Hero (reference) → The Idea (image 2) → What We Create → What We Believe & Our Numbers
→ A Different Kind of Agency → FAQ → Final CTA footer. Inner pages: Who We Are, What We Create,
Our Approach (image 4), The Work, five case studies, Client Stories, Contact, Privacy, Terms, 404.
The full-screen menu reproduces image 3.

## Design notes

- Structure, spacing and motion follow studio.budarina.design (spring 400/30/1 appear motion,
  Lenis smooth scroll on desktop/tablet, ticker galleries, coverflow carousel, rounded panels).
- Project presentation follows the ZIP's home gallery (scale 1.1→1 reveal, 1.018 hover zoom,
  mono caption box with letter roll), plus a "View Project" cursor pill.
- Typography: ONE typeface everywhere — Helvetica Neue, the face in the reference images. Visitors whose
  device has Helvetica Neue (macOS/iOS) see it; everywhere else the single stand-in is Inter Tight (SIL OFL,
  self-hosted), the closest free match to Helvetica Neue's proportions, chosen against the reference images.
  To show Helvetica Neue on every device, buy a Helvetica Neue **webfont** licence and add the WOFF2 files to
  `public/assets/fonts/` named `helvetica-neue-<weight>.woff2` (e.g. `helvetica-neue-300.woff2`,
  `helvetica-neue-400.woff2`, `helvetica-neue-500.woff2`, `helvetica-neue-700.woff2`; italics as
  `helvetica-neue-400-italic.woff2`). The build picks them up automatically.
- Respects `prefers-reduced-motion` (no smooth scroll, tickers, autoplay or transforms).

## Project videos

The site has built-in (currently unused) support for the studio's own project videos: the home laptop screen,
hero gallery tiles and case-page galleries. See **[MEDIA-GUIDE.md](MEDIA-GUIDE.md)**. In short, put the files in
`C:/Teseract-media/<project>/`, then run `python scripts/prepare_media.py --src C:/Teseract-media` and
`python scripts/build.py`. With no media prepared (`scripts/media-manifest.json` empty) every page is unchanged.

## Owner-supplied service-card images

The What We Create cards (home section and the What We Create page) show the owner's own designs (MODU, ed10, OBSCURA,
FaiPy, VYRN) next to the SIAARA / Mahira Select stills. `scripts/supplied.json` lists them (source file, crop, alt text,
fit); `python scripts/prepare_supplied.py` converts them from `C:/Teseract-media/_supplied/` into
`public/assets/supplied/` (WebP, 640/1280/1920 px, never upscaled) and writes `scripts/supplied-manifest.json`. Which card
shows which image is `MEDIA` in `scripts/sections/service_cards.py`. `check.py` fails when a mapped image is missing,
broken or out of date.

## Content limitations

- Testimonials in the content document are placeholders, so none are shown. Add real ones to
  `STORIES['testimonials']` in `scripts/content.py` as (quote, name, role, company).
- Case studies show the supplied imagery and metadata only; no narratives were supplied.
- The portfolio imagery comes from the supplied ZIP, which describes itself as a recreation of
  zzstudio.design. Confirm you hold the rights before publishing, then set `indexable: true`.
