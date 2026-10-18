"""Shared build helpers (Python 3 standard library only).

Every page/section renderer receives a Ctx and returns an HTML string. Use the helpers
here for anything that touches URLs or assets so that:
  * relative links work from file:// as well as any static host (ZIP convention), and
  * only the assets that are actually referenced get copied into dist/.
"""
import datetime, html, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
DIST = ROOT / 'dist'
CONFIG = json.loads((ROOT / 'site.config.json').read_text(encoding='utf-8'))
BRAND = CONFIG['brand']
YEAR = datetime.date.today().year
ASSETS = {a['name']: a for a in json.loads((ROOT / 'scripts/asset-manifest.json').read_text(encoding='utf-8'))}
USED = set()          # paths relative to public/, e.g. 'assets/home-01-1280.webp'
FAILURES = []         # (module, func, traceback) collected during a build
WEBFONT = False       # True when licensed Helvetica Neue webfont files are bundled (build.licensed_webfonts)
ASSET_VERSION = {}    # {'styles.css': hash, 'app.js': hash} — cache-busting query strings set by build.py
E = html.escape


def build_report_path(out):
    """Where build.py writes its build report for an output folder: docs/build-report.json for dist/ (kept out of
    the published site), <folder>.build-report.json next to any other output folder. Compared with ROOT/dist, not
    DIST: build.py points DIST at its --out folder, so a preview build would overwrite dist's report."""
    out = pathlib.Path(out).resolve()
    if out == (ROOT / 'dist').resolve():
        return ROOT / 'docs' / 'build-report.json'
    return out.parent / f'{out.name}.build-report.json'


def longpath(path):
    """Windows extended-length path (the packaged workspace path can exceed MAX_PATH)."""
    import os
    if os.name != 'nt':
        return pathlib.Path(path)
    p = str(pathlib.Path(path).absolute())
    prefix = '\\\\?\\'
    return pathlib.Path(p if p.startswith(prefix) else prefix + p)


def fmt(text):
    """Substitute {brand}/{year} placeholders in copy."""
    return text.replace('{brand}', BRAND).replace('{year}', str(YEAR))


def name_text(title):
    """A project name as visible text: each ' · ' / ' — ' separator is bound to the word before it (no-break space), so
    a wrapped line never starts with one ("GIREESH — Artist · Creative · Storyteller"). Same words; alt texts,
    aria-labels, <title> and structured data keep the plain name."""
    return title.replace(' · ', ' · ').replace(' — ', ' — ')


class Ctx:
    def __init__(self, route, page):
        self.route = route.strip('/')                       # '' for home, 'work', 'projects/derlin-haus'
        self.page = page                                    # page key, e.g. 'home', 'work', 'project'
        depth = 0 if not self.route else self.route.count('/') + 1
        self.base = '../' * depth or './'

    def url(self, route, frag=''):
        route = route.strip('/')
        path = self.base + (route + '/index.html' if route else 'index.html')
        return path + (('#' + frag) if frag else '')

    def asset(self, file):
        """Reference a file under public/ (e.g. 'assets/brand/logo-mark.svg')."""
        USED.add(file)
        return self.base + file


def picture(ctx, name, alt, *, sizes='100vw', eager=False, cls='', attrs='', max_width=None):
    """Responsive <img> for a manifest asset (rasters get srcset, vectors a plain img)."""
    a = ASSETS[name]
    c = f' class="{cls}"' if cls else ''
    if 'file' in a:
        return f'<img{c} src="{ctx.asset(a["file"])}" alt="{E(alt)}" loading="lazy" decoding="async"{(" " + attrs) if attrs else ""}>'
    variants = [v for v in a['variants'] if not max_width or v['width'] <= max_width] or a['variants'][:1]
    for v in variants:
        USED.add(v['file'])
    default = next((v for v in variants if v['width'] >= 1280), variants[-1])
    srcset = ', '.join(f'{ctx.base}{v["file"]} {v["width"]}w' for v in variants)
    pri = ' fetchpriority="high"' if eager else ''
    return (f'<img{c} src="{ctx.base}{default["file"]}" srcset="{srcset}" sizes="{sizes}" '
            f'width="{a["native_width"]}" height="{a["native_height"]}" alt="{E(alt)}" '
            f'loading="{"eager" if eager else "lazy"}" decoding="async"{pri}{(" " + attrs) if attrs else ""}>')


def ratio(name):
    a = ASSETS[name]
    return f'{a["native_width"]}/{a["native_height"]}'


# The 3D brand mark (515 x 519) is mostly drawn as a 20-64 px avatar (hero pill + CTA, footer, FAQ, agency, stories,
# create, contact, Work): img() then serves the small copies scripts/prepare_assets.py --brand writes (96 / 192 px, a
# few KB each) instead of the 31 KB master, so callers keep passing the master's path. Larger marks (Who We Are panels,
# service cards, 404) keep the master.
MARK_3D, MARK_3D_W, MARK_3D_SMALL, AVATAR_MAX = 'assets/brand/logo-mark-3d.webp', 515, (96, 192), 64


def _mark_src(ctx, w):
    """(src, ' srcset sizes' or '') for the 3D mark drawn w CSS px wide: the copies up to the first that covers a 3x
    screen (a 32 px avatar needs only the 96)."""
    have = [(n, f'assets/brand/logo-mark-3d-{n}.webp') for n in MARK_3D_SMALL
            if longpath(PUBLIC / f'assets/brand/logo-mark-3d-{n}.webp').exists()]
    cand = []
    for n, f in have:
        cand.append((n, f))
        if n >= 3 * w:
            break
    if not cand:
        return ctx.asset(MARK_3D), ''
    if cand[-1][0] < 3 * w:
        cand.append((MARK_3D_W, MARK_3D))
    if len(cand) == 1:
        return ctx.asset(cand[0][1]), ''
    return ctx.asset(cand[0][1]), f' srcset="{", ".join(f"{ctx.asset(f)} {n}w" for n, f in cand)}" sizes="{w}px"'


def img(ctx, file, alt, *, w=None, h=None, cls='', eager=False, attrs=''):
    """<img> for a non-manifest local asset under public/ (the 3D brand mark as an avatar: its small copies)."""
    size = (f' width="{w}"' if w else '') + (f' height="{h}"' if h else '')
    c = f' class="{cls}"' if cls else ''
    src, srcset = (_mark_src(ctx, int(w)) if file == MARK_3D and w and int(w) <= AVATAR_MAX else (ctx.asset(file), ''))
    return (f'<img{c} src="{src}"{srcset} alt="{E(alt)}"{size} loading="{"eager" if eager else "lazy"}" '
            f'decoding="async"{(" " + attrs) if attrs else ""}>')


def roll(text):
    """Letter-roll hover text (ZIP pattern). Put the accessible name on the parent."""
    t = E(text)
    return f'<span class="roll" aria-hidden="true"><span>{t}</span><span>{t}</span></span>'


ICONS = {
    'arrow-ne': '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'arrow-r': '<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'plus': '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 4v16M4 12h16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    'close': '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M10 10 38 38M38 10 10 38" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    'menu': '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M3 8.5h18M3 15.5h18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    'check': '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m5.5 10.4 2.9 2.9 6.1-6.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'star': '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="m10 1.8 2.5 5.2 5.7.8-4.1 4 1 5.7L10 14.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z" fill="currentColor"/></svg>',
    'mail': '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="2.5" y="4.5" width="15" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m3.5 6 6.5 5 6.5-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}


def icon(name, cls='icon'):
    return f'<span class="{cls} {cls}--{name}">{ICONS[name]}</span>'


def mark(ctx, cls='brand-mark-img', alt=''):
    """Flat brand mark (inline-able via <img>; colour baked in SVG)."""
    return img(ctx, 'assets/brand/logo-mark.svg', alt, w=32, h=32, cls=cls)


def button(ctx, text, href, *, variant='dark', icon_name=None, lead=None, external=False, cls='', attrs='', aria=None):
    """Pill button. variant: dark | light | outline | ghost. lead: HTML placed before the label
    (e.g. the brand-mark avatar like the reference's 'Contact' button). aria: a fuller accessible
    name than the visible label (e.g. "Visit the X website (opens in a new tab)")."""
    ext = ' target="_blank" rel="noopener"' if external else ''
    lead_html = f'<span class="btn__lead" aria-hidden="true">{lead}</span>' if lead else ''
    ic = f'<span class="btn__icon" aria-hidden="true">{ICONS[icon_name]}</span>' if icon_name else ''
    return (f'<a class="btn btn--{variant}{(" " + cls) if cls else ""}" href="{E(href)}" aria-label="{E(aria or text)}"{ext}'
            f'{(" " + attrs) if attrs else ""}>{lead_html}<span class="btn__label">{roll(text)}</span>{ic}</a>')


def pill_label(text, *, tone='dark', cls=''):
    """Reference section label: dark pill with a small ring dot either side."""
    return (f'<span class="pill-label pill-label--{tone}{(" " + cls) if cls else ""}" data-reveal>'
            f'<i aria-hidden="true"></i><span>{E(text)}</span><i aria-hidden="true"></i></span>')


def section_head(label, title_html, *, sub_html=None, align='center', tag='h2', cls='', title_cls=''):
    """Reference section header: pill label, large tight heading, optional sub copy.
    title_html is trusted HTML (may contain <em>, <s>, <br>)."""
    sub = f'<p class="section-head__sub" data-reveal style="--d:160ms">{sub_html}</p>' if sub_html else ''
    lab = pill_label(label) if label else ''
    return (f'<header class="section-head section-head--{align}{(" " + cls) if cls else ""}">{lab}'
            f'<{tag} class="section-head__title{(" " + title_cls) if title_cls else ""}" data-split>{title_html}</{tag}>{sub}</header>')


def chip(text, cls=''):
    return f'<li class="chip{(" " + cls) if cls else ""}">{E(text)}</li>'


def ext_link(href):
    return ' target="_blank" rel="noopener"' if href.startswith('http') else ''


def social_href(key):
    """Configured social URL or '' when not yet supplied (callers then leave that channel out)."""
    return (CONFIG.get('socials') or {}).get(key) or ''


def write(route, body):
    dest = longpath(DIST / (route + '/index.html' if route else 'index.html'))
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(body, encoding='utf-8')


def strip_ws(s):
    return re.sub(r'>\s+<', '><', s)


def project_href(ctx, p):
    """Destination of a project: its case-study page, the live client site, or None."""
    if p['kind'] == 'case':
        return ctx.url(p['route'])
    if p['kind'] == 'external':
        return p['url']
    return None


def project_tag(ctx, p, cls, *, label=None, extra=''):
    """Opening/closing tag pair for a project tile: <a> with the View Project cursor when the
    project has a destination, otherwise a plain <div>. Returns (open, close)."""
    href = project_href(ctx, p)
    if not href:
        return f'<div class="{cls} is-static"{(" " + extra) if extra else ""}>', '</div>'
    external = p['kind'] == 'external'
    name = label or (f"Visit {p['title']} (opens in a new tab)" if external else f"View project: {p['title']}")
    cursor = 'Visit Site' if external else 'View Project'
    return (f'<a class="{cls}" href="{E(href)}" aria-label="{E(name)}" data-cursor="{cursor}"'
            f'{" data-cursor-external=true" if external else ""}{ext_link(href)}{(" " + extra) if extra else ""}>', '</a>')


_SVG_CACHE = {}


def svg_inline(file, cls='', label=None):
    """Inline an SVG from public/ so it inherits currentColor (e.g. the brand mark/wordmark in dark
    contexts). Decorative unless a label is given."""
    if file not in _SVG_CACHE:
        raw = longpath(PUBLIC / file).read_text(encoding='utf-8')
        raw = re.sub(r'<\?xml[^>]*>\s*', '', raw)
        raw = re.sub(r'<title>.*?</title>', '', raw, flags=re.S)
        # strip size/a11y attributes from the ROOT <svg> tag only — inner <rect width/height> must survive
        raw = re.sub(r'<svg\b[^>]*>', lambda m: re.sub(r'\s(role|aria-label|aria-hidden|width|height)="[^"]*"', '', m.group(0)), raw, count=1)
        _SVG_CACHE[file] = raw
    raw = _SVG_CACHE[file]
    a11y = f' role="img" aria-label="{E(label)}"' if label else ' aria-hidden="true" focusable="false"'
    c = f' class="{cls}"' if cls else ''
    return raw.replace('<svg', f'<svg{c}{a11y}', 1)


# ---------------------------------------------------------------- the studio's own project media
# scripts/prepare_media.py encodes the captured stills/recordings into public/assets/media/ and writes
# scripts/media-manifest.json; scripts/projects.py joins it with the curated scripts/portfolio.json.

MEDIA_MANIFEST = ROOT / 'scripts/media-manifest.json'
MEDIA_YES = {'yes', 'y', 'true', 'granted', 'approved', 'ok'}
_MEDIA = None


def media_manifest():
    """Cached media manifest; the empty structure when the file is missing."""
    global _MEDIA
    if _MEDIA is None:
        f = longpath(MEDIA_MANIFEST)
        data = json.loads(f.read_text(encoding='utf-8')) if f.exists() else {}
        projects = data.get('projects') or []
        order = data.get('order') or []
        rank = {s: i for i, s in enumerate(order)}
        projects = sorted(projects, key=lambda p: rank.get(p.get('slug'), len(rank)))   # stable: manifest order otherwise
        _MEDIA = {'projects': projects, 'order': order}
    return _MEDIA


def media_projects(role=None):
    """Manifest projects cleared for the website (info.txt "permission: yes"), in manifest order;
    with `role` ('laptop', 'hero', 'gallery-01', ...) only those that have that item."""
    out = []
    for p in media_manifest()['projects']:
        if str((p.get('info') or {}).get('permission', '')).strip().lower() not in MEDIA_YES:
            continue
        if role and not ((p.get('media') or {}).get(role) or {}).get('variants'):
            continue
        out.append(p)
    return out


def media_entry(slug):
    """The cleared manifest project for a slug, or None."""
    return next((p for p in media_projects() if p.get('slug') == slug), None)


def media_project(mp):
    """projects.py-style dict for a manifest project, so project_tag() can link it: the portfolio project
    (its page) when the slug is a shown project, else the url from info.txt, else no link (a film on the home
    laptop without a portfolio.json entry)."""
    import projects as P
    known = P.by_slug(mp.get('slug', ''))
    if known:
        return known
    info = mp.get('info') or {}
    url = (info.get('url') or '').strip()
    if url and not re.match(r'^https?://', url, re.I):
        url = 'https://' + url if re.match(r'^[\w.-]+\.[a-z]{2,}(/|$)', url, re.I) else ''
    title = info.get('name') or mp.get('slug', '')
    kind = 'external' if url else 'static'
    return {'slug': mp.get('slug', ''), 'title': title, 'industry': info.get('industry') or '', 'kind': kind,
            'route': None, 'url': url or None}


# A still's 480 px "thumb" variant (prepare_media.py) is offered only to an image whose sizes are all fixed lengths the
# thumb still covers on a 2x screen when object-fit:cover crops it into a SQUARE box: the limit is half its short side
# (a 480x270 thumb: 135 px), as a 16:9 still in a square card is drawn ~1.8x wider than the card and its height is what
# fills the box. That is the footer ring: 110 px desktop cards (2x: 220 of 270 file px) and 64-80 px phone cards (3x:
# 240). Larger or fluid images (vw, cover crops in big tiles) never list it, so the browser cannot draw them from it.
def _small(sizes, thumb):
    limit = min(thumb['width'], thumb['height']) / 2
    vals = [part.strip().rsplit(None, 1)[-1] for part in sizes.split(',') if part.strip()]
    return bool(vals) and all(re.fullmatch(r'\d+(\.\d+)?px', v) and float(v[:-2]) <= limit for v in vals)


def media_img(ctx, entry, alt, *, sizes='100vw', eager=False, cls='', attrs='', max_width=None):
    """Responsive WebP <img> for a manifest image item (variants written by scripts/prepare_media.py),
    never wider than max_width when given; the 480 thumbnail only for a small fixed size (_small).
    Lazy unless eager (then fetchpriority=high)."""
    vs = sorted(entry['variants'], key=lambda v: v['width'])
    thumb = next((v for v in vs if v.get('thumb')), None)
    if thumb and not _small(sizes, thumb):
        vs = [v for v in vs if not v.get('thumb')] or vs
    if max_width:
        vs = [v for v in vs if v['width'] <= max_width] or vs[:1]
    for v in vs:
        USED.add(v['file'])
    default = next((v for v in vs if v['width'] >= 1280), vs[-1])
    srcset = ', '.join(f'{ctx.base}{v["file"]} {v["width"]}w' for v in vs)
    c = f' class="{cls}"' if cls else ''
    pri = ' fetchpriority="high"' if eager else ''
    return (f'<img{c} src="{ctx.base}{default["file"]}" srcset="{srcset}" sizes="{sizes}" width="{vs[-1]["width"]}" '
            f'height="{vs[-1]["height"]}" alt="{E(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async"{pri}'
            f'{(" " + attrs) if attrs else ""}>')


# ---------------------------------------------------------------- owner-supplied images (service cards)
# scripts/supplied.json (curated: source file, crop, alt, fit, focal) + scripts/supplied-manifest.json (the WebP
# variants scripts/prepare_supplied.py wrote into public/assets/supplied/). Rendered with media_img(), so only the
# images a page uses are copied to dist/.

SUPPLIED_TABLE = ROOT / 'scripts/supplied.json'
SUPPLIED_MANIFEST = ROOT / 'scripts/supplied-manifest.json'
_SUPPLIED = None


def supplied(name):
    """The owner-supplied image `name`: its supplied.json entry (title, alt, fit, ground, focal, crop) plus 'variants'
    and the prepared size 'w' x 'h' - or None when it is not in the table or has not been prepared yet."""
    global _SUPPLIED
    if _SUPPLIED is None:
        table = json.loads(longpath(SUPPLIED_TABLE).read_text(encoding='utf-8')) if longpath(SUPPLIED_TABLE).exists() else {}
        done = (json.loads(longpath(SUPPLIED_MANIFEST).read_text(encoding='utf-8')).get('images') or {}
                if longpath(SUPPLIED_MANIFEST).exists() else {})
        _SUPPLIED = {}
        for e in table.get('images') or []:
            m = done.get(e['name']) or {}
            if m.get('variants'):
                top = max(m['variants'], key=lambda v: v['width'])
                _SUPPLIED[e['name']] = {**e, 'variants': m['variants'], 'w': top['width'], 'h': top['height']}
    return _SUPPLIED.get(name)


# ---------------------------------------------------------------- device scenes (src/css/38-scene.css)
# A scene = a backdrop drawn in CSS/SVG + a studio monitor or laptop drawn in CSS 3D whose screen shows the
# project's own media (a gallery still, or its laptop.mp4 through video()). Ported from the scene prototype the
# owner approved on 13 Oct; no third-party photos, no WebGL. Markup:
#   figure.scn.scn--STYLE.scn--DEVICE > .scn-stage > .scn-bg (backdrop) + .scn-dev > .scn-rig > .scn-body >
#   device parts ... .scn-screen > MEDIA ; figcaption.scn-cap (group pill + name). The SVG backdrops use the
#   gradients/filters in SCENE_DEFS, written once per page by scene_defs().

SCENE_STYLES = ('red-horizon', 'blue-studio', 'stone-red', 'white-glass', 'grey-wall', 'violet-rock', 'violet-white',
                'green-white', 'sky-white', 'amber-rock')
SCENE_LIGHT = {'white-glass'}                       # light backdrop: dark caption
# A caption name longer than this (the owner's personal sites' own long titles) wraps in a narrow column left of the
# device (38-scene.css .scn-name--long) instead of running into the lid / panel's top edge.
SCENE_NAME_LONG = 24

_DUNE = 'M0 52 C 160 40 300 30 470 26 C 640 22 760 16 900 18 C 1060 20 1200 34 1340 30 C 1460 27 1540 34 1600 40'
_ROCK = ('M20 520 L35 380 L50 260 L70 180 L110 110 L150 78 L205 58 L260 46 L330 30 L400 18 L470 12 L540 11 L610 16 '
         'L680 24 L740 36 L790 50 L840 74 L880 104 L915 150 L945 220 L965 320 L980 520 Z')
_GRAIN = '<i class="scn-grain"></i><i class="scn-vig"></i>'
_BG = {
    'red-horizon': (
        '<i class="scn-wall"></i>'
        '<svg class="scn-dune" viewBox="0 0 1600 600" preserveAspectRatio="none" focusable="false">'
        f'<path d="{_DUNE} V600 H0Z" fill="url(#scn-g-dune)"/><path d="{_DUNE} V600 H0Z" fill="url(#scn-g-dune-sheen)"/>'
        f'<path d="{_DUNE}" fill="none" stroke="rgba(255,96,72,.55)" stroke-width="1.5" vector-effect="non-scaling-stroke" '
        'filter="url(#scn-f-soft)"/></svg><i class="scn-sheen"></i>' + _GRAIN),
    'blue-studio': '<i class="scn-wall"></i><i class="scn-floor"></i><i class="scn-ledge"></i>' + _GRAIN,
    'stone-red': '<i class="scn-wall"></i>' + _GRAIN,
    'white-glass': '<i class="scn-wall"></i>' + _GRAIN,
    'grey-wall': '<i class="scn-wall"></i><i class="scn-gobo"></i><i class="scn-cast"></i>' + _GRAIN,
    'violet-rock': (
        '<i class="scn-wall"></i>'
        '<svg class="scn-rock" viewBox="0 0 1000 520" focusable="false"><g filter="url(#scn-f-rock)">'
        f'<path fill="#24212b" d="{_ROCK}"/>'
        '<path fill="#6a6482" d="M205 58 L260 46 L330 30 L400 18 L470 12 L540 11 L610 16 L680 24 L740 36 L700 70 L600 84 L480 92 L360 88 L250 80 Z"/>'
        '<path fill="#211e28" d="M50 260 L70 180 L110 110 L150 78 L205 58 L250 80 L200 150 L130 240 L80 300 Z"/>'
        '<path fill="#7d76a0" d="M740 36 L790 50 L840 74 L880 104 L915 150 L945 220 L860 230 L790 170 L700 70 Z"/>'
        '<path fill="#2e2b3a" d="M250 80 L360 88 L480 92 L600 84 L700 70 L790 170 L760 280 L620 330 L440 340 L300 300 L200 150 Z"/>'
        '<path fill="#15131a" d="M20 520 L35 380 L50 260 L80 300 L130 240 L200 150 L300 300 L260 420 L200 520 Z"/>'
        '<path fill="#1c1a23" d="M200 520 L260 420 L300 300 L440 340 L620 330 L760 280 L720 420 L680 520 Z"/>'
        '<path fill="#2b2840" d="M680 520 L720 420 L760 280 L790 170 L860 230 L945 220 L965 320 L980 520 Z"/>'
        '</g>'
        f'<path d="{_ROCK}" fill="url(#scn-g-rock-shade)"/><path d="{_ROCK}" fill="url(#scn-g-rock-violet)"/>'
        '<path d="M150 78 L205 58 L260 46 L330 30 L400 18 L470 12 L540 11 L610 16 L680 24 L740 36 L790 50 L840 74 L880 104 '
        'L915 150 L945 220 L965 320" fill="none" stroke="rgba(240,232,255,.75)" stroke-width="2" filter="url(#scn-f-soft)"/>'
        '</svg>' + _GRAIN),
    'violet-white': (
        '<i class="scn-wall"></i>'
        '<svg class="scn-plinth" viewBox="0 0 1000 720" focusable="false">'
        '<rect x="20" y="60" width="960" height="680" fill="url(#scn-g-plinth-body)"/>'
        '<ellipse cx="500" cy="60" rx="480" ry="44" fill="url(#scn-g-plinth-top)"/>'
        '<path d="M20 60 A480 44 0 0 0 980 60" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.4"/>'
        '<path d="M20 64 A480 44 0 0 0 980 64" fill="none" stroke="rgba(150,145,190,.18)" stroke-width="5" filter="url(#scn-f-soft)"/>'
        '</svg><i class="scn-grain"></i>'),
    # owner, 15 Oct: SAN Media's own white + leaf-green palette - the violet-white studio and plinth in green
    'green-white': (
        '<i class="scn-wall"></i>'
        '<svg class="scn-plinth" viewBox="0 0 1000 720" focusable="false">'
        '<rect x="20" y="60" width="960" height="680" fill="url(#scn-g-plinth-body-gw)"/>'
        '<ellipse cx="500" cy="60" rx="480" ry="44" fill="url(#scn-g-plinth-top-gw)"/>'
        '<path d="M20 60 A480 44 0 0 0 980 60" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.4"/>'
        '<path d="M20 64 A480 44 0 0 0 980 64" fill="none" stroke="rgba(120,170,100,.2)" stroke-width="5" filter="url(#scn-f-soft)"/>'
        '</svg><i class="scn-grain"></i>'),
    # owner, 15 Oct: Careers at Aeroskys' white + sky-blue site - the same studio and plinth in sky blue
    'sky-white': (
        '<i class="scn-wall"></i>'
        '<svg class="scn-plinth" viewBox="0 0 1000 720" focusable="false">'
        '<rect x="20" y="60" width="960" height="680" fill="url(#scn-g-plinth-body-sw)"/>'
        '<ellipse cx="500" cy="60" rx="480" ry="44" fill="url(#scn-g-plinth-top-sw)"/>'
        '<path d="M20 60 A480 44 0 0 0 980 60" fill="none" stroke="rgba(255,255,255,.95)" stroke-width="2.4"/>'
        '<path d="M20 64 A480 44 0 0 0 980 64" fill="none" stroke="rgba(110,150,200,.2)" stroke-width="5" filter="url(#scn-f-soft)"/>'
        '</svg><i class="scn-grain"></i>'),
    # owner, 15 Oct: the earlier Gireesh portfolio (dark with rust / orange) - the violet-rock rock, lit warm
    'amber-rock': (
        '<i class="scn-wall"></i>'
        '<svg class="scn-rock" viewBox="0 0 1000 520" focusable="false"><g filter="url(#scn-f-rock-amber)">'
        f'<path fill="#2b211c" d="{_ROCK}"/>'
        '<path fill="#8a6a58" d="M205 58 L260 46 L330 30 L400 18 L470 12 L540 11 L610 16 L680 24 L740 36 L700 70 L600 84 L480 92 L360 88 L250 80 Z"/>'
        '<path fill="#251c18" d="M50 260 L70 180 L110 110 L150 78 L205 58 L250 80 L200 150 L130 240 L80 300 Z"/>'
        '<path fill="#a77d62" d="M740 36 L790 50 L840 74 L880 104 L915 150 L945 220 L860 230 L790 170 L700 70 Z"/>'
        '<path fill="#3a2b24" d="M250 80 L360 88 L480 92 L600 84 L700 70 L790 170 L760 280 L620 330 L440 340 L300 300 L200 150 Z"/>'
        '<path fill="#181210" d="M20 520 L35 380 L50 260 L80 300 L130 240 L200 150 L300 300 L260 420 L200 520 Z"/>'
        '<path fill="#211915" d="M200 520 L260 420 L300 300 L440 340 L620 330 L760 280 L720 420 L680 520 Z"/>'
        '<path fill="#3d2a20" d="M680 520 L720 420 L760 280 L790 170 L860 230 L945 220 L965 320 L980 520 Z"/>'
        '</g>'
        f'<path d="{_ROCK}" fill="url(#scn-g-rock-shade)"/><path d="{_ROCK}" fill="url(#scn-g-rock-amber)"/>'
        '<path d="M150 78 L205 58 L260 46 L330 30 L400 18 L470 12 L540 11 L610 16 L680 24 L740 36 L790 50 L840 74 L880 104 '
        'L915 150 L945 220 L965 320" fill="none" stroke="rgba(255,226,198,.75)" stroke-width="2" filter="url(#scn-f-soft)"/>'
        '</svg>' + _GRAIN),
}

SCENE_DEFS = (
    '<svg class="scn-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs>'
    '<linearGradient id="scn-g-dune" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a0205"/>'
    '<stop offset=".045" stop-color="#220103"/><stop offset=".2" stop-color="#090000"/><stop offset="1" stop-color="#000"/></linearGradient>'
    '<radialGradient id="scn-g-dune-sheen" cx=".5" cy=".02" r=".5" gradientTransform="translate(0 0) scale(1 .35)">'
    '<stop offset="0" stop-color="#ff3a2a" stop-opacity=".42"/><stop offset=".55" stop-color="#ff2a20" stop-opacity=".08"/>'
    '<stop offset="1" stop-color="#ff2a20" stop-opacity="0"/></radialGradient>'
    '<linearGradient id="scn-g-rock-shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0820" stop-opacity="0"/>'
    '<stop offset=".45" stop-color="#0c0820" stop-opacity=".25"/><stop offset="1" stop-color="#06040f" stop-opacity=".85"/></linearGradient>'
    '<linearGradient id="scn-g-rock-violet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4a2fd0" stop-opacity=".32"/>'
    '<stop offset=".45" stop-color="#4a2fd0" stop-opacity="0"/><stop offset=".8" stop-color="#d9ccff" stop-opacity="0"/>'
    '<stop offset="1" stop-color="#d9ccff" stop-opacity=".12"/></linearGradient>'
    '<linearGradient id="scn-g-plinth-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d4d2e0"/>'
    '<stop offset=".22" stop-color="#f3f3f8"/><stop offset=".42" stop-color="#ffffff"/><stop offset=".7" stop-color="#ebebf1"/>'
    '<stop offset="1" stop-color="#c4c2d2"/></linearGradient>'
    '<radialGradient id="scn-g-plinth-top" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/>'
    '<stop offset="1" stop-color="#efeef5"/></radialGradient>'
    '<linearGradient id="scn-g-plinth-body-gw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfdcc8"/>'
    '<stop offset=".22" stop-color="#f1f6ee"/><stop offset=".42" stop-color="#ffffff"/><stop offset=".7" stop-color="#e9f0e5"/>'
    '<stop offset="1" stop-color="#bccdb3"/></linearGradient>'
    '<radialGradient id="scn-g-plinth-top-gw" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/>'
    '<stop offset="1" stop-color="#eef4ea"/></radialGradient>'
    '<linearGradient id="scn-g-plinth-body-sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9d6e4"/>'
    '<stop offset=".22" stop-color="#eff4f9"/><stop offset=".42" stop-color="#ffffff"/><stop offset=".7" stop-color="#e7eef5"/>'
    '<stop offset="1" stop-color="#b6c6d8"/></linearGradient>'
    '<radialGradient id="scn-g-plinth-top-sw" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#ffffff"/>'
    '<stop offset="1" stop-color="#edf3f9"/></radialGradient>'
    '<linearGradient id="scn-g-rock-amber" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#d2541c" stop-opacity=".34"/>'
    '<stop offset=".45" stop-color="#d2541c" stop-opacity="0"/><stop offset=".8" stop-color="#ffd8b4" stop-opacity="0"/>'
    '<stop offset="1" stop-color="#ffd8b4" stop-opacity=".14"/></linearGradient>'
    '<filter id="scn-f-soft" x="-5%" y="-50%" width="110%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>'
    '<filter id="scn-f-rock" x="-4%" y="-8%" width="108%" height="116%" color-interpolation-filters="sRGB">'
    '<feTurbulence type="fractalNoise" baseFrequency=".0085 .013" numOctaves="7" seed="4" result="n"/>'
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="shape"/>'
    '<feDiffuseLighting in="n" surfaceScale="10" diffuseConstant="1.3" lighting-color="#efe8ff" result="l">'
    '<feDistantLight azimuth="300" elevation="26"/></feDiffuseLighting>'
    '<feComponentTransfer in="l" result="lc"><feFuncR type="gamma" amplitude="1.3" exponent="1.9" offset="0"/>'
    '<feFuncG type="gamma" amplitude="1.3" exponent="1.9" offset="0"/><feFuncB type="gamma" amplitude="1.3" exponent="1.9" offset="0"/>'
    '</feComponentTransfer><feComposite in="lc" in2="shape" operator="arithmetic" k1="1.2" k2="0" k3=".03" k4="0"/></filter>'
    '<filter id="scn-f-rock-amber" x="-4%" y="-8%" width="108%" height="116%" color-interpolation-filters="sRGB">'
    '<feTurbulence type="fractalNoise" baseFrequency=".0085 .013" numOctaves="7" seed="4" result="n"/>'
    '<feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="shape"/>'
    '<feDiffuseLighting in="n" surfaceScale="10" diffuseConstant="1.3" lighting-color="#ffe6d0" result="l">'
    '<feDistantLight azimuth="300" elevation="26"/></feDiffuseLighting>'
    '<feComponentTransfer in="l" result="lc"><feFuncR type="gamma" amplitude="1.3" exponent="1.9" offset="0"/>'
    '<feFuncG type="gamma" amplitude="1.3" exponent="1.9" offset="0"/><feFuncB type="gamma" amplitude="1.3" exponent="1.9" offset="0"/>'
    '</feComponentTransfer><feComposite in="lc" in2="shape" operator="arithmetic" k1="1.2" k2="0" k3=".03" k4="0"/></filter>'
    '</defs></svg>')


def scene_defs(ctx):
    """The scenes' shared SVG gradients/filters, once per page (put it before the first scene; scene() adds it
    itself when nobody did)."""
    if getattr(ctx, 'scn_defs', False):
        return ''
    ctx.scn_defs = True
    return SCENE_DEFS


def _scene_props(style):
    """3D props that share the device camera: stone blocks, the bent-glass riser, the concrete desk."""
    box = ('<div class="scn-box{m}"><i class="scn-b-top"></i><i class="scn-b-left"></i>'
           '<i class="scn-b-right"></i><i class="scn-b-front"></i></div>')
    if style == 'stone-red':
        return box.format(m=' scn-box--l') + box.format(m=' scn-box--r') + box.format(m=' scn-box--ped')
    if style == 'white-glass':
        bends = ''.join(f'<i class="scn-wg-bend scn-wg-bend--{n}"></i>' for n in range(1, 7))
        return ('<div class="scn-box scn-wg"><i class="scn-wg-floor"></i><i class="scn-wg-back"></i><i class="scn-wg-inner"></i>'
                f'<i class="scn-wg-top"></i>{bends}<i class="scn-wg-side"></i><i class="scn-wg-front"></i></div>')
    if style == 'grey-wall':
        return ('<i class="scn-gw-ao"></i><i class="scn-gw-under"></i><i class="scn-gw-legcast"></i>'
                '<div class="scn-box scn-desk"><i class="scn-b-top"></i><i class="scn-b-front"></i></div>'
                '<div class="scn-box scn-leg"><i class="scn-b-left"></i><i class="scn-b-front"></i></div>')
    return ''


def _scene_device(device, media_html, props):
    screen = f'<div class="scn-screen">{media_html}<i class="scn-glass"></i></div>'
    if device == 'laptop':
        parts = ('<div class="scn-deck"><i class="scn-spk scn-spk--l"></i><i class="scn-kb"></i><i class="scn-spk scn-spk--r"></i>'
                 '<i class="scn-pad"></i><i class="scn-face scn-e-l"></i><i class="scn-face scn-e-r"></i><i class="scn-face scn-e-f"></i></div>'
                 '<div class="scn-lid"><i class="scn-face scn-e-t"></i><i class="scn-face scn-e-l"></i><i class="scn-face scn-e-r"></i>'
                 f'<i class="scn-cam"></i>{screen}</div>')
    else:
        parts = ('<div class="scn-foot"><i class="scn-face scn-e-f"></i></div>'
                 '<div class="scn-neck"><i class="scn-face scn-e-l"></i><i class="scn-face scn-e-r"></i></div>'
                 '<div class="scn-panel"><i class="scn-face scn-e-t"></i><i class="scn-face scn-e-b"></i>'
                 f'<i class="scn-face scn-e-l"></i><i class="scn-face scn-e-r"></i>{screen}</div>')
    return (f'<div class="scn-dev scn-{device}"><div class="scn-rig"><div class="scn-body">'
            f'{props}<i class="scn-shadow"></i><i class="scn-spill"></i>{parts}</div></div></div>')


def scene_caption(project, *, name=True, note=False):
    """Label pill ("Client Project", "Interactive Concept", "Concept Project", "Personal project") + the project's own
    name (name=False: the pill only); note=True adds an Interactive Concept's small "Unofficial, ..." line under the
    pill (a tile with no card text beside it: the next-project tile). Decorative: the same facts are in the text next
    to the scene and in the link's name."""
    pill = project.get('label') or ('Client Project' if project.get('group') == 'client' else 'Concept Project')
    kind = project.get('label_kind') or ('client' if project.get('group') == 'client' else 'concept')
    long = ' scn-name--long' if len(project['title']) > SCENE_NAME_LONG else ''
    return (f'<figcaption class="scn-cap" aria-hidden="true"><span class="scn-pill scn-pill--{kind}"><i></i>{E(pill)}</span>'
            + (f'<span class="scn-note">{E(project["note"])}</span>' if note and project.get('note') else '')
            + (f'<span class="scn-name{long}">{E(name_text(project["title"]))}</span>' if name else '') + '</figcaption>')


def scene(ctx, project, media_html, *, device=None, style=None, caption=True, note=False, cls='', attrs='', aspect=None):
    """Device scene around `media_html` - an element with class "scn-media" (media_img(..., cls='scn-media') or
    video(..., cls='scn-media')). style / device default to the project's portfolio.json "scene" / "device".
    aspect = the media's width / height: 16:10 media (sites captured at 1440x900) get a 16:10 screen
    (scn--tall), so nothing of the capture is cropped; 16:9 media keep the 16:9 screen.
    A project without a scene style (owner: Geetha Jewellers) gets plain_frame(): no device, no backdrop.
    Fixed-aspect stage (16:10; 4:5 when the scene is narrower than 640px) = no layout shift while media loads."""
    style = style or project.get('scene')
    if style not in SCENE_STYLES:
        return plain_frame(project, media_html, note=note, cls=cls, attrs=attrs)
    device = device if device in ('monitor', 'laptop') else (project.get('device') or 'monitor')
    tall = bool(aspect) and aspect < 1.69
    mods = (f'scn scn--{style} scn--{device}' + (' scn--tall' if tall else '')
            + (' scn--light' if style in SCENE_LIGHT else '') + (f' {cls}' if cls else ''))
    spill = f' style="--spill:{E(project["spill"])}"' if project.get('spill') else ''
    return (f'{scene_defs(ctx)}<figure class="{mods}"{spill}{(" " + attrs) if attrs else ""}><div class="scn-stage">'
            f'<div class="scn-bg" aria-hidden="true">{_BG[style]}</div>'
            f'{_scene_device(device, media_html, _scene_props(style))}</div>'
            f'{scene_caption(project, note=note) if caption else ""}</figure>')


def plain_frame(project, media_html, *, caption=False, note=False, cls='', attrs=''):
    """A scene's frame without device or backdrop (same stage, corners and aspect, so plain and device cards line
    up in a row): the still fills it, cropped at its focal point on a narrow (4:5) stage. caption=True adds the label
    pill only (the project's name would sit on the website itself, e.g. Geetha Jewellers' light gold page)."""
    return (f'<figure class="scn scn--plain{(" " + cls) if cls else ""}"{(" " + attrs) if attrs else ""}>'
            f'<div class="scn-stage">{media_html}</div>{scene_caption(project, name=False, note=note) if caption else ""}</figure>')


def _attr_json(items):
    return json.dumps(items, separators=(',', ':')).replace('&', '&amp;').replace("'", '&#39;').replace('<', '&lt;')


def clip_owner(entry):
    """Title of the project a manifest clip belongs to (the media folder it came from), or '' - the name in its pause
    control ("Pause the video — Aivinci Creative Studio", 06-video.js)."""
    folder = ((entry.get('source') or {}).get('file') or '').split('/')[0]
    slug = re.sub(r'[^a-z0-9]+', '-', folder.lower()).strip('-')
    mp = media_entry(slug) if slug else None
    return media_project(mp)['title'] if mp else ''


def video(ctx, entry, label='', *, cls='', eager=False, max_width=None, poster_width=1280, lazy_poster=None, still=True):
    """Muted, looping, inline <video> for a manifest media item; decorative unless `label` is given.
    No src in the HTML: 06-video.js picks the variant for the element's width x DPR and loads it when the
    video approaches the viewport; the poster (largest variant <= poster_width) shows without JS, under
    reduced motion and on Save-Data. A labelled clip carries its project's name (data-video-name) for the pause /
    play control 06-video.js gives every looping clip outside a section with its own control.
    lazy_poster (default: a decorative clip = a home hero gallery tile, whose columns are display:none at some
    widths, and browsers fetch a poster attribute even for a hidden element): the posters <= poster_width go in
    data-poster (JSON, like data-srcs) and 06-video.js sets the one for the tile's width x DPR once the tile is
    rendered; poster="" (empty: no frame yet) keeps the attribute, and a <noscript> copy of the poster shows the
    frame without JS (06-video.css hides the empty video there) - still=False leaves that copy out where the caller
    gives its own no-JS frame (a home gallery stand-in's clip, which waits in a <template>: home_hero._item)."""
    variants = sorted(entry.get('variants') or [], key=lambda v: v['width'])
    if max_width:
        variants = [v for v in variants if v['width'] <= max_width] or variants[:1]
    if not variants:
        return ''
    lazy = (not label) if lazy_poster is None else lazy_poster
    srcs = [{'w': v['width'], 'src': ctx.asset(v['file'])} for v in variants]
    posters = sorted(entry.get('poster') or [], key=lambda p: p['width'])
    fit = [p for p in posters if p['width'] <= poster_width] or posters[:1]
    poster = fit[-1:]
    if lazy and poster:
        poster_attr = f" poster=\"\" data-poster='{_attr_json([{'w': p['width'], 'src': ctx.asset(p['file'])} for p in fit])}'"
    else:
        poster_attr = f' poster="{E(ctx.asset(poster[0]["file"]))}"' if poster else ''
    top = variants[-1]
    a11y = f'aria-label="{E(label)}"' if label else 'aria-hidden="true"'
    owner = clip_owner(entry) if label else ''
    name = f' data-video-name="{E(owner)}"' if owner else ''
    still = (f'<noscript><img class="media-video media-video--still{(" " + cls) if cls else ""}" src="{ctx.asset(poster[0]["file"])}" '
             f'alt="" width="{poster[0]["width"]}" height="{poster[0]["height"]}" loading="lazy" decoding="async"></noscript>'
             if lazy and poster and still else '')
    return (f'<video class="media-video{(" " + cls) if cls else ""}" muted playsinline loop preload="none" '
            f'disablepictureinpicture disableremoteplayback {a11y}{poster_attr} width="{top["width"]}" height="{top["height"]}" '
            f"data-video{' data-video-eager' if eager else ''}{name} data-srcs='{_attr_json(srcs)}'></video>{still}")
