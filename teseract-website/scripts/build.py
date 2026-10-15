"""Build every route of the TESERACT website as static HTML (Python 3 standard library only).

    python scripts/build.py                 # -> dist/
    python scripts/build.py --out ../x      # -> another folder (used for parallel previews)
    python scripts/build.py --clean         # wipe the output folder first

CSS and JS are authored as ordered partials in src/css and src/js and concatenated.
Each page is assembled from section renderers; a failing renderer is reported and
replaced by a visible error block instead of aborting the whole build.
"""
import importlib, json, os, pathlib, shutil, sys, traceback

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import lib  # noqa: E402
from lib import Ctx, E, fmt, CONFIG, BRAND  # noqa: E402

FAILURES = lib.FAILURES


def safe(module, func='render', *args, **kw):
    """Import scripts/<module>.py and call func(*args); never abort the build."""
    try:
        mod = importlib.import_module(module)
        return getattr(mod, func)(*args, **kw)
    except Exception:
        tb = traceback.format_exc()
        FAILURES.append((module, func, tb))
        print(f'!! {module}.{func} failed\n{tb}', file=sys.stderr)
        return f'<section class="build-error"><pre>{E(module)}.{E(func)} failed:\n{E(tb[-1200:])}</pre></section>'


def _long(path):
    """Windows extended-length path so files deeper than MAX_PATH (260 chars) can be read/copied."""
    if os.name != 'nt':
        return pathlib.Path(path)
    s = str(pathlib.Path(path).absolute())
    prefix = '\\\\?\\'
    return pathlib.Path(s if s.startswith(prefix) else prefix + s)


def licensed_webfonts():
    """If the owner adds licensed Helvetica Neue WOFF2 files to public/assets/fonts/ named
    helvetica-neue-<weight>[-italic].woff2 (e.g. helvetica-neue-400.woff2, helvetica-neue-300-italic.woff2),
    declare them for the site font so every device renders Helvetica Neue."""
    import re
    folder = lib.longpath(lib.PUBLIC / 'assets/fonts')
    rules = []
    if folder.exists():
        for f in sorted(folder.iterdir()):
            m = re.fullmatch(r'helvetica-neue-(\d{3})(-italic)?\.woff2', f.name.lower())
            if not m:
                continue
            rel = f'assets/fonts/{f.name}'
            lib.USED.add(rel)
            style = 'italic' if m.group(2) else 'normal'
            rules.append(f"@font-face{{font-family:'TS Sans';src:url('./{rel}') format('woff2');"
                         f"font-weight:{m.group(1)};font-style:{style};font-display:swap}}")
    lib.WEBFONT = bool(rules)
    return '\n'.join(rules) + '\n' if rules else ''


def minify_css(css):
    """Conservative CSS minifier: drops comments (keeps /*! licence */), collapses whitespace and trims it
    around { } ; , only — never around ':' or combinators, so selector meaning cannot change."""
    import re
    css = re.sub(r'/\*(?!!).*?\*/', '', css, flags=re.S)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};,])\s*', r'\1', css)
    return css.replace(';}', '}').strip() + '\n'


def concat(src_dir, out_file, header):
    parts = [header]
    for f in sorted(src_dir.glob('*.*')):
        parts.append(f'\n/* ---- {f.name} ---- */\n' + f.read_text(encoding='utf-8'))
    text = ''.join(parts)
    if out_file.suffix == '.css' and '--no-minify' not in sys.argv:
        text = f'/*! {BRAND} styles — generated from src/css (edit the partials). */\n' + minify_css(text)
    out_file.write_text(text, encoding='utf-8')


# Each page: route, page key, <title>, description, list of (module, func) section renderers.
PAGES = [
    ('', 'home', None, CONFIG['description'], [
        ('sections.home_hero', 'render'),
        ('sections.home_idea', 'render'),
        ('sections.home_services', 'render'),
        ('sections.home_believe', 'render'),
        ('sections.home_founder', 'render'),     # owner, 15 Oct: the founder teaser
        ('sections.home_agency', 'render'),
        ('sections.home_faq', 'render'),
    ]),
    ('who-we-are', 'who', 'Who We Are', "{brand} is a digital creative studio focused on design, technology and experiences.", [
        ('pages.who', 'render'),
    ]),
    ('what-we-create', 'create', 'What We Create', 'Digital experiences built around your business: website design, development, e-commerce, interactive & 3D, brand, product, AI and strategy.', [
        ('pages.create', 'render'),
    ]),
    ('our-approach', 'approach', 'Our Approach', 'How an idea becomes an experience: understand, define, explore, design, refine, build, test, launch and evolve.', [
        ('pages.approach', 'render'),
    ]),
    ('work', 'work', 'The Work', "We could tell you we're different. But we'd rather show you.", [
        ('pages.work', 'render'),
    ]),
    ('client-stories', 'stories', 'Client Stories', 'Good work starts with good collaboration.', [
        ('pages.stories', 'render'),
    ]),
    ('contact', 'contact', 'Contact', "Let's build something worth remembering.", [
        ('pages.contact', 'render'),
    ]),
    ('privacy', 'legal', 'Privacy Policy', 'Privacy information for this website.', [
        ('pages.legal', 'privacy'),
    ]),
    ('terms', 'legal', 'Terms of Service', 'Terms of service for this website.', [
        ('pages.legal', 'terms'),
    ]),
]


def build(out, clean=False):
    lib.DIST = out
    if clean and out.exists():
        # fresh output: no stale pages/assets from earlier builds. A file that Windows keeps locked (e.g. a video a
        # browser is streaming from the preview server) is skipped instead of aborting the build half-way.
        locked = []
        shutil.rmtree(_long(out), onerror=lambda func, path, exc: locked.append(path))
        if locked:
            print(f'note: {len(locked)} locked file(s) left in place during --clean (overwritten below if still used)')
    out.mkdir(parents=True, exist_ok=True)
    concat(lib.ROOT / 'src/css', out / 'styles.css', f'/* {BRAND} — generated from src/css. Edit the partials, not this file. */\n')
    concat(lib.ROOT / 'src/js', out / 'app.js', f'/* {BRAND} — generated from src/js. Edit the partials, not this file. */\n')
    webfonts = licensed_webfonts()
    if webfonts:   # licensed Helvetica Neue files present: use them on every device (declared last, so they win)
        with open(lib.longpath(out / 'styles.css'), 'a', encoding='utf-8') as fh:
            fh.write('\n/* ---- licensed Helvetica Neue webfont (public/assets/fonts) ---- */\n' + webfonts)
    # Content fingerprints for cache busting: pages reference styles.css?v=<hash> / app.js?v=<hash>,
    # so browsers never combine new HTML with a stale cached stylesheet or script.
    import hashlib
    lib.ASSET_VERSION = {name: hashlib.sha1(lib.longpath(out / name).read_bytes()).hexdigest()[:10]
                         for name in ('styles.css', 'app.js')}
    chrome = importlib.import_module('chrome')

    def page(route, key, title, desc, sections, extra=None):
        ctx = Ctx(route, key)
        body = ''.join(safe(m, f, ctx) for m, f in sections)
        html = safe('chrome', 'document', ctx, title, fmt(desc), body, **(extra or {}))
        lib.write(route, html)

    for route, key, title, desc, sections in PAGES:
        page(route, key, title, desc, sections)

    projects = importlib.import_module('projects')
    for p in projects.CASES:
        ctx = Ctx(p['route'], 'project')
        body = safe('pages.project', 'render', ctx, p)
        lib.write(p['route'], safe('chrome', 'document', ctx, p['title'], f"{p['title']} — {p['industry']}. {p['services'] or ''}".strip(), body))

    # 404: rendered at /404/ and copied to /404.html with root-relative base fixed.
    ctx = Ctx('404', 'notfound')
    lib.write('404', safe('chrome', 'document', ctx, 'Page not found', 'This page does not exist.', safe('pages.legal', 'notfound', ctx)))
    root404 = lib.longpath(out / '404/index.html').read_text(encoding='utf-8').replace('"../', '"./').replace(' ../', ' ./')
    if CONFIG.get('site_url'):
        # hosts serve /404.html for missing nested paths too: anchor relative URLs at the site root
        base_tag = f'<base href="{E(CONFIG["site_url"].rstrip("/"))}/">'
        root404 = root404.replace('<head>', '<head>' + base_tag, 1)
    lib.longpath(out / '404.html').write_text(root404, encoding='utf-8')

    # Copy only referenced assets (plus fonts, which CSS references).
    for f in ['assets/inter-tight-latin.woff2', 'assets/inter-tight-latin-italic.woff2']:   # single typeface: Inter Tight stands in for Helvetica Neue
        lib.USED.add(f)
    copied = 0
    for rel in sorted(lib.USED):
        src = _long(lib.PUBLIC / rel)
        dst = _long(out / rel)
        if not src.exists():
            FAILURES.append(('assets', rel, 'missing source file'))
            print(f'!! missing asset {rel}', file=sys.stderr)
            continue
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists() or dst.stat().st_size != src.stat().st_size or dst.stat().st_mtime < src.stat().st_mtime:
            shutil.copy2(src, dst)
            copied += 1
    # SEO / GEO files: llms.txt always; sitemap.xml + robots Sitemap line once site_url is configured.
    seo = importlib.import_module('seo')
    (out / 'llms.txt').write_text(seo.llms_txt(), encoding='utf-8')
    routes = [r for r, *_ in PAGES] + [p['route'] for p in projects.CASES]
    sm = seo.sitemap(routes)
    if sm:
        (out / 'sitemap.xml').write_text(sm, encoding='utf-8')
    robots = 'User-agent: *\n' + ('Allow: /\n' if CONFIG.get('indexable') else 'Disallow: /\n')
    if sm and CONFIG.get('indexable'):
        robots += f'Sitemap: {seo.SITE}/sitemap.xml\n'
    (out / 'robots.txt').write_text(robots, encoding='utf-8')
    report = lib.build_report_path(out)          # internal build log: not published with the site
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps({'assets': len(lib.USED), 'copied': copied,
        'failures': [{'module': m, 'func': f, 'error': t[-600:]} for m, f, t in FAILURES]}, indent=1), encoding='utf-8')
    stale = lib.longpath(out / 'build-report.json')
    if stale.exists():
        try:
            stale.unlink()
        except OSError:
            pass
    print(f'Built {len(PAGES) + len(projects.CASES) + 1} routes into {out} — {len(lib.USED)} assets ({copied} copied), {len(FAILURES)} failure(s)')
    samples = importlib.import_module('pages.stories').samples()
    if samples:   # owner's preview reviews (content.STORIES['testimonials']); check.py blocks a launch build while they remain
        print(f'note: Client Stories shows {len(samples)} SAMPLE testimonial(s) - replace them with real client feedback before launch (LAUNCH-CHECKLIST.md 3c)')
    return 1 if FAILURES else 0


if __name__ == '__main__':
    out = lib.ROOT / 'dist'
    if '--out' in sys.argv:
        out = pathlib.Path(sys.argv[sys.argv.index('--out') + 1]).resolve()
    sys.exit(build(out, clean='--clean' in sys.argv))
