"""Static checks for dist/ (adapted from the ZIP project's check.py).

Verifies: route coverage, exactly one <h1> per page, unique ids, every local src/href/srcset
target and #fragment exists, image alt text and responsive attributes, safe external links,
CSS url() assets, reduced-motion support, no leftover build errors / stubs / third-party identity; project labels
(owner, 14 Oct: "Client Project" on every client card / page head / home tile / service-card caption, the concept
labels on the concepts, no "concept" wording on a client project's page or card), the owner-supplied service-card
images (scripts/supplied.json: prepared, valid WebP files of the recorded size and crop, shown where mapped) and the
Client Stories reviews (one per client project, rendered with rating and link, never as structured data or in the GEO
files; LAUNCH GUARD: an error while a SAMPLE review remains and site.config.json is indexable or has a site_url); the
owner's 14-15 Oct decisions: Kingfisher gone, VYRN without its A-COLD-WALL / Nike / sneaker screens and the cinematic
portfolio without its tool-logo screens and phone closing shot (OWNER_SKIPS) while the home laptop keeps its film,
E-commerce on exactly the owner's shops, a supplied frame of a project linked to that project, Aivinci's review card on
its tiger poster, Sedile prepared and listed everywhere as a Concept Project (OWNER_ADDED), the Work page's count; the
owner's 17 Oct decision: the six landing-page concepts (LANDING_SIX) as Concept Projects leading the home gallery, every
tile of a prepared one playing its clip (phones too), Aivinci's tile its tiger, 7 gallery clips at most, two of them on
the Product & SaaS card instead of LiveCV (one without prepared media yet: a warning); headings
read letter by letter (A11Y-04: an error, SPELLED_NAMES_ERROR); the founder (owner, 15 Oct): every line of
_ref/specs/founder-content.md verbatim on Who We Are, the founder section directly after the hero, no image of
him while none is supplied, the old 'Why we started' copy gone, the Person JSON-LD, the home teaser + its link, his
name as one screen-reader text and the restore toggles' accessible-name spacing.

    python scripts/check.py [--dist DIR]
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import hashlib, json, re, sys
import html as _h

ROOT = Path(__file__).resolve().parents[1]
DIST = Path(sys.argv[sys.argv.index('--dist') + 1]).resolve() if '--dist' in sys.argv else ROOT / 'dist'
sys.path.insert(0, str(ROOT / 'scripts'))
import projects  # noqa: E402
import seo  # noqa: E402  (TITLE_MAX: the landing pages' page titles)
import lib  # noqa: E402  (longpath: the workspace path can exceed Windows MAX_PATH)
from sections import service_cards  # noqa: E402  (MEDIA: which owner-supplied images each service card shows)
from pages import stories  # noqa: E402  (the Client Stories reviews: testimonials(), samples())
from content import STORIES  # noqa: E402

errors, warnings = [], []
pages = sorted(DIST.rglob('*.html'))
FORBIDDEN = ['zzstudio', 'ZZStudio', 'ZzStudio', 'AgenQ', 'Abdul Mutakabar', 'ayzz', 'Budarina', 'budarina', 'Sesteem', 'cal.com']
# The ZIP portfolio was replaced by the studio's own websites (owner, 13 Oct): none of its project names,
# routes or images may be referenced any more; Heeding and StepAI were removed by the owner.
FORBIDDEN += ['HOCL', 'Taurus Arena', 'FRAGILE BASE', 'Fragile Base', 'Aesthetic Origins', 'Tafuta', 'Two26', 'Evermark',
              'Risen Social', 'SunnaKids', 'hocl-labs', 'taurus-arena', 'fragile-base', 'aesthetic-origins', 'two26-studio',
              'evermark-global', 'risen-social', 'sunnakids', 'projects/real-estate', 'assets/home-0', 'assets/home-10',
              'assets/projects-', 'Heeding', 'heeding', 'FeedstockVerse', 'StepAI', 'stepai']
# Removed by the owner on 14 Oct (DARK-THEME.md): TGTS (government emblem, officials' portraits), Ghost Rider, Game of
# Thrones, Avengers (film/series footage, real actors) and The Paradise (real actor footage). projects.EXCLUDED
# keeps their slugs out of the data; these catch any name, route or media path in the output. (Not the bare word
# "ghost": CSS classes such as .btn--ghost use it.)
FORBIDDEN += ['TGTS', 'tgts', 'Telangana Technology', 'Ghost Rider', 'GHOST RIDER', 'ghost-rider', 'Spirit of Vengeance',
              'Game of Thrones', 'GAME OF THRONES', 'game-of-thrones', 'Avengers', 'AVENGERS', 'avengers', 'Doomsday',
              'media/got/', 'projects/got/', 'The Paradise', 'THE PARADISE', 'the-paradise', 'Srikanth Odela']
# Removed by the owner on 14 Oct, 23:20 (DARK-THEME.md): Kingfisher, the unofficial beer brand concept - its name, tagline,
# route and media in any case (projects.EXCLUDED keeps the slug out of the data).
FORBIDDEN += ['Kingfisher', 'kingfisher', 'KINGFISHER', 'KING OF GOOD TIMES', 'King of Good Times']
# Owner, 15 Oct: roles a project must always skip (portfolio.json "skip"): VYRN's A-COLD-WALL hero (a real label's name and
# layout: gallery-01, gallery-09, the phone scroll 'hero' and the laptop film, which opens on it) and its Nike-swoosh still
# (gallery-02); the cinematic portfolio's floating third-party tool logos (gallery-03 and the laptop recording). Owner
# answers, 15 Oct ~13:30: also VYRN's two sneaker screens with the faint swoosh (gallery-05, gallery-06) and the cinematic
# portfolio's phone copy of its closing shot (gallery-10).
OWNER_SKIPS = {'vyrn': {'gallery-01', 'gallery-02', 'gallery-05', 'gallery-06', 'gallery-09', 'hero', 'laptop'},
               'gireesh-cinematic': {'gallery-03', 'gallery-10', 'laptop'}}
# Owner, 15 Oct ~13:30: projects he added, with their group and label. Each must be prepared (in media-manifest.json
# 'projects'; prepare_media.py --skip lists a folder in 'order' only) and shown wherever the portfolio is listed (Work
# page, project page, JSON-LD, llms.txt, sitemap), with real alt text on every still. Owner defaults until he answers:
# Sedile is not E-commerce (ECOMMERCE, below) and has no home hero tile unless portfolio.json home_gallery lists it.
OWNER_ADDED = {'sedile': ('concept', 'Concept Project')}
# Owner, 14 Oct: the home laptop ("The Idea") plays the VYRN film only - vyrn/laptop.mp4, although VYRN's own page skips it.
HOME_FILM = 'vyrn'
# Owner, 14-15 Oct: "E-commerce" is a service of exactly these projects (and they are the E-commerce card's shops); not
# Sedile's demo cart (owner default, 15 Oct).
ECOMMERCE = {'derlin-haus', 'mahira-select', 'siaara', 'vyrn'}
# Stills never shown on a service card (owner, 15 Oct: TAVRA gallery-05 caught the site's ring cursor).
NOT_ON_CARDS = {'tavra': {'gallery-05'}}
# Owner, 17 Oct (DARK-THEME.md): the six landing-page concepts of his repo landing-concepts - Concept Projects that LEAD
# the home gallery (portfolio.json home_gallery, in this order), every one of their tiles playing its own clip, plus
# Aivinci's tiger (TIGER): 7 clips (home_hero.MAX_VIDEO_TILES). They are captured and re-captured one after another, so
# one without prepared media yet is a warning (not shown); with it, an error when it is not listed and shown like
# OWNER_ADDED, does not lead the gallery or has a tile that does not play its clip. The Product & SaaS card (service 06)
# shows two of them (their SaaS heroes) instead of LiveCV, which stays a client project everywhere else.
LANDING_SIX = ('sagewell', 'vantline', 'tidings', 'emberpost', 'ines-morrow', 'maren-holt')
# Owner, 17-18 Oct: taken out of the home gallery ONLY - each keeps its Work card and page: AARADHYA, ONE PIECE, TAVRA,
# THENGA, SAANJH and the cinematic portfolio (17 Oct), Geetha Jewellers (18 Oct ~19:05), the designer's desk portfolio
# (18 Oct ~22:05). portfolio.json home_gallery listing one, or a hero tile in the built page showing any project the
# list does not name (a stale dist after a home_gallery change), is an error - the auto-sync never publishes it.
GALLERY_HIDDEN = ('aaradhya', 'one-piece', 'tavra', 'thenga', 'saanjh', 'gireesh-cinematic', 'geetha-jewellers', 'gireesh-desk')
TIGER = ('aivinci', 'tiger')
GALLERY_CLIPS = 7
SAAS_CARD = '06'
ALT_MAX = 400                  # a landing page's still / recording alt text, at most (18 Oct: one or two sentences)


def webp_size(path):
    """(width, height) of a WebP file, or None when it is missing, truncated or not a WebP (RIFF/WEBP with a VP8, VP8L
    or VP8X first chunk)."""
    path = lib.longpath(path)
    if not path.is_file():
        return None
    data = path.read_bytes()
    if len(data) < 30 or data[:4] != b'RIFF' or data[8:12] != b'WEBP':
        return None
    if int.from_bytes(data[4:8], 'little') + 8 != len(data):       # truncated / padded file
        return None
    chunk = data[12:16]
    if chunk == b'VP8 ' and data[23:26] == b'\x9d\x01\x2a':
        return int.from_bytes(data[26:28], 'little') & 0x3FFF, int.from_bytes(data[28:30], 'little') & 0x3FFF
    if chunk == b'VP8L' and data[20] == 0x2F:
        bits = int.from_bytes(data[21:25], 'little')
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if chunk == b'VP8X':
        return int.from_bytes(data[24:27], 'little') + 1, int.from_bytes(data[27:30], 'little') + 1
    return None


def article(html, slug):
    """The Work card <article> of a project (or '')."""
    m = re.search(r'<article class="wk-card[^"]*"[^>]*aria-labelledby="wk-t-' + re.escape(slug) + r'".*?</article>', html, re.S)
    return m.group(0) if m else ''


def esc(text):
    return _h.escape(text, quote=False)


def own_words(fragment):
    """The text, alt text and aria-labels of an HTML fragment without quoted site text: a capture report may quote a
    client site's own heading (Hidden Stories' 'The concept' chapter); our own wording may not call client work a
    concept."""
    parts = re.findall(r'\b(?:alt|aria-label|title)="([^"]*)"', fragment) + [re.sub(r'<[^>]+>', ' ', fragment)]
    text = _h.unescape(' '.join(parts))
    return re.sub(r"'[^'\n]{1,160}'|\u2018[^\u2019]{1,160}\u2019|\u201c[^\u201d]{1,160}\u201d", ' ', text)


INTRO_TAGS = re.compile(r'<(?:h[1-6]|a|button|input|select|textarea|title)\b|\stabindex=', re.I)


def intro_audit(rel, html):
    """Intro logo animation overlay (scripts/chrome_intro.py): first in <body>, hidden, decorative (no text, headings or
    focusables), the full shard / letter set, the tsi-go sentinel after it, the session decision in the <head> script."""
    out = []
    if html.count('data-intro') != 1:
        return [f'{rel}: expected one intro overlay (data-intro), got {html.count("data-intro")}']
    m = re.search(r'<body\b[^>]*>\s*(<div class="tsi" data-intro\b[^>]*>.*?)(<script>[^<]*tsi-go[^<]*</script>)\s*<a class="skip-link"', html, re.S)
    if not m:
        return [f'{rel}: the intro overlay + tsi-go sentinel must come directly after <body>, before the skip link']
    ov = m.group(1)
    tag = re.match(r'<div[^>]*>', ov).group(0)
    if ' hidden' not in tag or 'aria-hidden="true"' not in tag:
        out.append(f'{rel}: the intro overlay must carry hidden and aria-hidden="true"')
    if INTRO_TAGS.search(ov):
        out.append(f'{rel}: the intro overlay contains a heading, link, control, tabindex or <title>')
    if re.sub(r'<[^>]+>', '', ov).strip():
        out.append(f'{rel}: the intro overlay contains text')
    n_sh, n_ch = ov.count('class="tsi__sh '), len(re.findall(r'class="tsi__ch"', ov))
    n_s = ov.count('class="tsi__ch tsi__ch--s"')
    if (n_sh, n_ch, n_s) != (4, 8, 15):
        out.append(f'{rel}: intro overlay has {n_sh} shard(s), {n_ch} TESERACT letter(s), {n_s} CREATIVE STUDIOS glyph(s) (expected 4/8/15)')
    head = html.split('</head>', 1)[0]
    if not all(k in head for k in ("'ts-intro'", "'ts-nav'", 'forced-colors')):
        out.append(f'{rel}: the <head> script no longer makes the intro session decision (ts-intro / ts-nav / forced-colors)')
    if re.search(r'href="[^"]*[?&]intro=', html):
        out.append(f'{rel}: a link carries the intro=0/1 review switch')
    return out


# Moved from the concepts group to client work by the owner (14 Oct): no "concept" anywhere on their page or card,
# not even quoted.
MOVED_TO_CLIENT = {'livecv'}


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs, self.images, self.ids, self.tags, self.h1 = [], [], [], [], 0
        self.videos = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.tags.append((tag, a))
        if tag == 'h1':
            self.h1 += 1
        if a.get('id'):
            self.ids.append(a['id'])
        for key in ('src', 'href'):
            if a.get(key) and not (tag == 'a' and a.get('aria-disabled') == 'true'):
                self.refs.append(a[key])
        if a.get('srcset'):
            self.refs.extend(part.strip().split()[0] for part in a['srcset'].split(','))
        if tag == 'img':
            self.images.append(a)
        if tag == 'video':                       # client media (lib.video): poster + every data-srcs variant must exist
            self.videos.append(a)
            if a.get('poster'):
                self.refs.append(a['poster'])
            try:
                self.refs.extend(s['src'] for s in json.loads(a.get('data-srcs') or '[]'))
            except (ValueError, TypeError, KeyError):
                self.refs.append('#invalid-data-srcs')


# A11Y-04 (mobile audit, 15 Oct): a heading built from per-letter spans is read letter by letter ('w h o w e a r e .' on
# Who We Are) unless the letters are aria-hidden next to one .sr-only text (the founder nameplate's pattern). An error
# since the Who We Are H1 fix landed (mobile fix group 7: sr-only 'Who we are.' + aria-hidden letters).
SPELLED_NAMES_ERROR = True
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


class SpelledNames(HTMLParser):
    """The names screen readers get for every h1 / h2 and every element an aria-labelledby points at (the regions they
    name): text outside aria-hidden subtrees, with a word break at each element boundary (the letter spans are
    inline-block, so Chromium and WebKit name them one by one). found = [(tag, id, name)] with three or more single
    letters / digits in a row."""

    def __init__(self, ids):
        super().__init__()
        self.ids, self.stack, self.open, self.found = ids, [], [], []

    def handle_starttag(self, tag, attrs):
        for c in self.open:
            c[2].append(' ')
        if tag in VOID:
            return
        a = dict(attrs)
        hidden = a.get('aria-hidden') == 'true' or bool(self.stack and self.stack[-1][1])
        self.stack.append((tag, hidden))
        if not hidden and (tag in ('h1', 'h2') or a.get('id') in self.ids):
            self.open.append([tag, a.get('id') or '', [], len(self.stack)])

    def handle_endtag(self, tag):
        if tag in VOID or not any(t == tag for t, _ in self.stack):
            return
        while self.stack.pop()[0] != tag:
            pass
        for c in self.open:
            c[2].append(' ')
        while self.open and self.open[-1][3] > len(self.stack):
            t, i, parts, _ = self.open.pop()
            name = ' '.join(''.join(parts).split())
            if re.search(r'(?:^|\s)[^\W_](?:\s[^\W_]){2,}(?=\s|$)', name):
                self.found.append((t, i, name))

    def handle_data(self, data):
        if not (self.stack and self.stack[-1][1]):
            for c in self.open:
                c[2].append(data)


def spelled_names(html):
    ids = {i for v in re.findall(r'aria-labelledby="([^"]+)"', html) for i in v.split()}
    sn = SpelledNames(ids)
    sn.feed(html)
    return [(t, i, n, i in ids) for t, i, n in sn.found]


for p in pages:
    html = lib.longpath(p).read_text(encoding='utf-8')
    page = Page()
    page.feed(html)
    rel = p.relative_to(DIST).as_posix()
    if page.h1 != 1:
        errors.append(f'{rel}: expected one h1, got {page.h1}')
    dupes = {i for i in page.ids if page.ids.count(i) > 1}
    if dupes:
        errors.append(f'{rel}: duplicate ids {sorted(dupes)}')
    if 'build-error' in html and 'class="build-error"' in html:
        errors.append(f'{rel}: contains a build-error block')
    if 'class="section stub"' in html:
        errors.append(f'{rel}: contains a stub section')
    if rel.startswith('projects/'):              # every project page: hero (device scene, or the first still) + gallery
        proj = next((x for x in projects.CASES if f"{x['route']}/index.html" == rel), None)
        hero = re.search(r'<section class="pj-hero".*?</section>', html, re.S)
        hero = hero.group(0) if hero else ''
        if not proj:
            errors.append(f'{rel}: project page for a project that is not shown')
        elif proj['scene']:
            if f'class="scn scn--{proj["scene"]} scn--{proj["device"]}' not in hero or 'class="scn-screen"' not in hero:
                errors.append(f'{rel}: project page without its device scene ({proj["scene"]} / {proj["device"]})')
            if proj['laptop'] and 'data-video' not in hero:
                errors.append(f'{rel}: device scene without the site recording')
        elif 'pj-frame--hero' not in hero:
            errors.append(f'{rel}: project page without hero media')
        if 'class="pj-gallery"' not in html:
            errors.append(f'{rel}: project page without a gallery')
        if proj:                                 # the label line above the H1 (+ an Interactive Concept's note)
            head = re.search(r'<section class="pj-head".*?</section>', html, re.S)
            head = head.group(0) if head else ''
            want = (f'<p class="pj-tag pj-tag--{proj["label_kind"]}"[^>]*><i aria-hidden="true"></i><span>{re.escape(esc(proj["label"]))}</span>'
                    + (f'<span class="pj-tag__note">{re.escape(esc(proj["note"]))}</span>' if proj.get('note') else ''))
            if not re.search(want, head):
                errors.append(f'{rel}: label "{projects.label_text(proj)}" not shown in the page head')
            nb = re.search(r'<section class="pj-next section".*?</section>', html, re.S)
            nb = nb.group(0) if nb else ''
            nh = re.search(r'id="pj-next-title"[^>]*><a href="([^"]+)"', nb)
            nx = nh and next((c for c in projects.CASES if nh.group(1).rstrip('/').endswith(f"{c['route']}/index.html")), None)
            if nx and f'<span class="scn-pill scn-pill--{nx["label_kind"]}"><i></i>{esc(nx["label"])}</span>' not in nb:
                errors.append(f'{rel}: next-project tile of {nx["slug"]} without its label pill "{nx["label"]}"')
            if nx and nx.get('note') and f'<span class="scn-note">{esc(nx["note"])}</span>' not in nb:
                errors.append(f'{rel}: next-project tile of {nx["slug"]} without its "{nx["note"]}" line')
            if proj['group'] == 'client':        # owner: client work is never worded as a concept (LiveCV moved, 14 Oct)
                main = re.search(r'<main\b.*?</main>', html, re.S)
                title_m = re.search(r'<title>(.*?)</title>', html, re.S)
                desc_m = re.search(r'<meta name="description" content="([^"]*)"', html)
                ld = ' '.join(re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S))
                body = main.group(0) if main else html
                for where, text in (('page content, alt text included', html if proj['slug'] in MOVED_TO_CLIENT else own_words(body)),
                                    ('title', title_m.group(1) if title_m else ''),
                                    ('description', desc_m.group(1) if desc_m else ''), ('JSON-LD', ld)):
                    if re.search(r'concept', text, re.I):
                        errors.append(f'{rel}: client project page has "concept" wording ({where})')
    if rel == 'work/index.html':                 # one scene (or plain frame) per shown project, stills only
        n_cards = html.count('<article class="wk-card')
        if n_cards != len(projects.CASES):
            errors.append(f'{rel}: {n_cards} cards for {len(projects.CASES)} shown projects')
        # stills only (the project pages play the recordings), except a project's portfolio.json "card_clip" (owner,
        # 14 Oct: Aivinci's tiger - the one card that autoplays; lazy, muted, looped, inline, poster: the video checks below)
        clips = [x for x in projects.CASES if x.get('card_clip')]
        if html.count('<video') != len(clips):
            errors.append(f'{rel}: {html.count("<video")} video(s) for {len(clips)} card clip(s) - the Work page shows stills otherwise')
        for x in clips:
            card = article(html, x['slug'])
            v = re.search(r'<video\b[^>]*>', card)
            if not v or x['card_clip']['variants'][0]['file'] not in v.group(0) or 'poster="' not in v.group(0):
                errors.append(f'{rel}: {x["slug"]}: card without its clip ({x["card_clip"]["variants"][0]["file"]}) and poster')
        if html.count('class="scn scn--') - html.count('class="scn scn--plain') != sum(1 for x in projects.CASES if x['scene']):
            errors.append(f'{rel}: device scene count does not match the shown projects with a scene')
        for x in projects.CASES:                 # every card carries its label (client: "Client Project")
            card = article(html, x['slug'])
            want = (f'<p class="wk-tag wk-tag--{x["label_kind"]}"><i aria-hidden="true"></i><span class="wk-tag__label">{re.escape(esc(x["label"]))}</span>'
                    + (f'<span class="wk-tag__note">{re.escape(esc(x["note"]))}</span>' if x.get('note') else ''))
            if not re.search(want, card):
                what = 'a client card lacks "Client Project"' if x['group'] == 'client' else f'concept card lacks its label "{projects.label_text(x)}"'
                errors.append(f'{rel}: {x["slug"]}: {what}')
            if x['scene'] and f'<span class="scn-pill scn-pill--{x["label_kind"]}"><i></i>{esc(x["label"])}</span>' not in card:
                errors.append(f'{rel}: {x["slug"]}: scene caption without the label "{x["label"]}"')
            if x['group'] == 'client' and re.search(r'concept', card if x['slug'] in MOVED_TO_CLIENT else own_words(card), re.I):
                errors.append(f'{rel}: {x["slug"]}: client card has "concept" wording')
        for key, items in (('client', projects.CLIENTS), ('concept', projects.CONCEPTS)):
            sec = re.search(r'<section class="wk-projects wk-projects--' + key + r'\b.*?</section>', html, re.S)
            sec = sec.group(0) if sec else ''
            for x in items:
                if f'aria-labelledby="wk-t-{x["slug"]}"' not in sec:
                    errors.append(f'{rel}: {x["slug"]} is not in the "{projects.GROUPS[key]}" section')
    if rel == 'index.html':                      # home hero gallery: every tile carries its label pill
        tiles = re.findall(r'<a class="hero-tile[^"]*" href="([^"]+)"[^>]*>(.*?)</a>', html, re.S)
        if not tiles and projects.PROJECTS:
            errors.append(f'{rel}: no hero gallery tiles')
        for href, inner in tiles:
            x = next((c for c in projects.CASES if href.rstrip('/').endswith(f"{c['route']}/index.html")), None)
            if not x:
                continue
            if f'<span class="hero-tile__tag hero-tile__tag--{x["label_kind"]}" aria-hidden="true"><i></i>{esc(x["label"])}</span>' not in inner:
                errors.append(f'{rel}: hero tile of {x["slug"]} without its label pill "{x["label"]}"')
            if x.get('note') and f'<span class="hero-tile__note">{esc(x["note"])}</span>' not in inner:
                errors.append(f'{rel}: hero tile of {x["slug"]} without its "{x["note"]}" line')
        for x in projects.CASES:                 # a portfolio.json "tile_clip" (Aivinci's tiger, the landing pages' loops) plays
            clips = x.get('tile_clips') or []    # on the project's tile (one of its list, the one that suits the slot)
            if any(c is not x.get('hero') for c in clips) and x['slug'] in (projects.DATA.get('home_gallery') or []) and not any(
                    href.rstrip('/').endswith(f"{x['route']}/index.html") and any(c['variants'][0]['file'] in inner for c in clips)
                    for href, inner in tiles):
                errors.append(f'{rel}: no hero tile of {x["slug"]} plays its tile clip ({clips[0]["variants"][0]["file"]})')
    if rel == 'client-stories/index.html':       # client reviews, the "Client Deck": a dot (tab) + a card slot per review (pages/stories.py)
        sec = re.search(r'<section class="section sto-rev".*?</section>', html, re.S)
        sec = sec.group(0) if sec else ''
        shown = stories.testimonials()
        if shown and ('role="tablist"' not in sec or 'aria-roledescription="carousel"' not in sec):
            errors.append(f'{rel}: client reviews deck missing ({len(shown)} review(s) in content.STORIES)')
        if sec.count('data-deck-slot') != len(shown):
            errors.append(f'{rel}: {sec.count("data-deck-slot")} deck card(s) for {len(shown)} review(s)')
        retired = {'sto-mono': r'\bsto-mono\b', 'sto-tab': r'\bsto-tab(?:__|[" ])', 'data-interval': r'\bdata-interval\b',
                   'data-voice-toggle': r'\bdata-voice-toggle\b', 'sto-rev__count': r'\bsto-rev__count\b'}   # the old profile-list design
        for old, pat in retired.items():         # (the dots keep the ids sto-tab-<slug>)
            if re.search(pat, sec):
                errors.append(f'{rel}: client reviews still carry the retired "{old}" markup')
        if shown and not re.search(r'<div class="sto-deck__slot[^"]*" data-deck-slot data-pos="0">\s*<article class="card sto-voice[^"]*" role="tabpanel" id="sto-panel-'
                                   + re.escape(shown[0]['project']['slug']) + '"', sec):
            errors.append(f'{rel}: the first review ({shown[0]["project"]["slug"]}) is not the front card of the deck (data-pos="0")')
        for t in shown:
            x = t['project']
            panel = re.search(r'<article class="card sto-voice[^"]*" role="tabpanel" id="sto-panel-' + re.escape(x['slug']) + r'".*?</article>', sec, re.S)
            panel = panel.group(0) if panel else ''
            if f'id="sto-tab-{x["slug"]}" aria-controls="sto-panel-{x["slug"]}"' not in sec or not panel:
                errors.append(f'{rel}: review of {x["slug"]} without its dot (tab) and card (tabpanel)')
                continue
            if t['rating'] and f'aria-label="Rated {t["rating"]:.1f} out of 5"' not in panel:
                errors.append(f'{rel}: review of {x["slug"]} without its rating {t["rating"]:.1f}')
            if f'href="../{x["route"]}/index.html"' not in panel or f'<span class="sto-voice__co">{esc(x["title"])}</span>' not in panel:
                errors.append(f'{rel}: review of {x["slug"]} without the company name or its "View project" link')
            if 'hero-tile__tag--client' not in panel or f'<i></i>{esc(x["label"])}</span>' not in panel:
                errors.append(f'{rel}: review of {x["slug"]} without the "{x["label"]}" pill on its still')
            if x.get('card_poster') and x['card_poster']['entry']['variants'][0]['file'].rsplit('-', 1)[0] + '-' not in panel:
                errors.append(f'{rel}: review of {x["slug"]} without its profile image, the {x["card_poster"]["role"]} still '
                              '(owner, 15 Oct: the same still as its Work card)')
        if bool(shown and stories.samples()) != ('class="sto-sample"' in sec):
            errors.append(f'{rel}: the "Sample reviews" tag must show exactly while sample testimonials are shown')
        d = re.search(r'<meta name="description" content="([^"]*)"', html)
        for t in shown:                          # the sample words stay out of the meta description
            if d and t['quote'].replace("'", '’')[:40] in _h.unescape(d.group(1)).replace("'", '’'):
                errors.append(f'{rel}: meta description quotes a testimonial')
    if rel in ('index.html', 'what-we-create/index.html'):   # service-card captions of projects carry their label
        for href, inner in re.findall(r'<a class="svc-(?:media__card|art)[^"]*" href="([^"]+)"[^>]*>(.*?)</a>', html, re.S):
            x = next((c for c in projects.CASES if href.rstrip('/').endswith(f"{c['route']}/index.html")), None)
            if x and esc(projects.label_text(x, ' · ')) not in inner:
                errors.append(f'{rel}: service-card caption of {x["slug"]} without its label "{x["label"]}"')
        for n, m in service_cards.MEDIA.items():          # every mapped owner-supplied image is on the page
            for it in m.get('images') or ():
                if it.get('supplied') and f'assets/supplied/{it["supplied"]}-' not in html:
                    errors.append(f'{rel}: service {n} does not show the supplied image "{it["supplied"]}"')
                x = projects.by_slug(it.get('slug') or '') if it.get('supplied') else None
                if x:                                     # a supplied frame of a project (VYRN): its own link, caption, page
                    for href, inner in re.findall(r'<a class="svc-(?:media__card|art)[^"]*" href="([^"]+)"[^>]*>(.*?)</a>', html, re.S):
                        if f'assets/supplied/{it["supplied"]}-' in inner and not (
                                href.rstrip('/').endswith(f"{x['route']}/index.html") and esc(projects.label_text(x, ' · ')) in inner):
                            errors.append(f'{rel}: service {n}: the supplied "{it["supplied"]}" frame must link to {x["route"]}/ '
                                          f'with its "{x["title"]}" caption (it opens {href})')
        for slug, roles in NOT_ON_CARDS.items():
            for role in roles:
                if re.search(r'<a class="svc-[^"]*"[^>]*>(?:(?!</a>).)*assets/media/' + re.escape(f'{slug}/{role}-'), html, re.S):
                    errors.append(f'{rel}: a service card shows {slug} {role} (captured with a cursor)')
    # SEO / GEO: title + description present and within search-result limits; JSON-LD parses.
    t = re.search(r'<title>(.*?)</title>', html, re.S)
    d = re.search(r'<meta name="description" content="([^"]*)"', html)
    if not t or not (10 <= len(_h.unescape(t.group(1))) <= 65):
        errors.append(f'{rel}: <title> missing or length outside 10-65 ({len(_h.unescape(t.group(1))) if t else 0})')
    if not d or not (50 <= len(_h.unescape(d.group(1))) <= 165):
        warnings.append(f'{rel}: meta description length {len(_h.unescape(d.group(1))) if d else 0} (aim 50-165)')
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S):
        try:
            json.loads(block)
        except ValueError as ex:
            errors.append(f'{rel}: invalid JSON-LD ({ex})')
        if re.search(r'"(?:Review|AggregateRating|Rating)"|ratingValue|reviewRating|aggregateRating', block):
            errors.append(f'{rel}: JSON-LD carries review / rating data (the Client Stories reviews must never be structured data)')
    errors.extend(intro_audit(rel, html))
    for word in FORBIDDEN:
        if word in html:
            errors.append(f'{rel}: contains third-party identity / retired portfolio text "{word}"')
    for ref in page.refs:
        u = urlsplit(ref)
        if u.scheme or u.netloc:
            continue
        if u.path:
            target = (p.parent / unquote(u.path)).resolve()
            if not lib.longpath(target).exists():
                errors.append(f'{rel}: missing {ref}')
        elif u.fragment and u.fragment not in page.ids:
            errors.append(f'{rel}: missing fragment {ref}')
    for img in page.images:
        if 'alt' not in img:
            errors.append(f'{rel}: image without alt ({img.get("src")})')
        if img.get('srcset') and not all(img.get(k) for k in ['width', 'height', 'sizes']):
            errors.append(f'{rel}: incomplete responsive image {img.get("src")}')
    for v in page.videos:
        missing = [k for k in ('muted', 'playsinline', 'loop', 'poster', 'width', 'height', 'data-srcs') if k not in v]
        if missing:
            errors.append(f'{rel}: video without {", ".join(missing)} ({v.get("poster")})')
        if v.get('preload') != 'none':
            errors.append(f'{rel}: video should be preload="none" (06-video.js loads it near the viewport)')
        if v.get('aria-hidden') != 'true' and not v.get('aria-label'):
            errors.append(f'{rel}: video needs aria-hidden="true" (decorative) or an aria-label ({v.get("poster")})')
    for tag, a in page.tags:
        if tag == 'a' and a.get('target') == '_blank' and 'noopener' not in (a.get('rel') or ''):
            errors.append(f'{rel}: unsafe external target {a.get("href")}')
        if tag == 'a' and not a.get('href'):
            errors.append(f'{rel}: <a> without href')
    for tag, hid, name, region in spelled_names(html):
        (errors if SPELLED_NAMES_ERROR else warnings).append(
            f'{rel}: <{tag}{f" id={hid}" if hid else ""}> is read letter by letter ("{name[:40]}")'
            + (', and so is the region it names (aria-labelledby)' if region else '')
            + ': keep the letters aria-hidden and give the words once in a .sr-only span (A11Y-04)')
    print('PASS' if not any(e.startswith(rel + ':') for e in errors) else 'FAIL', rel, 'images', len(page.images))

expected = ['index.html', '404.html', '404/index.html'] + [f'{r}/index.html' for r in
            ['who-we-are', 'what-we-create', 'our-approach', 'work', 'client-stories', 'contact', 'privacy', 'terms']]
expected += [f"{p['route']}/index.html" for p in projects.CASES]
for route in expected:
    if not lib.longpath(DIST / route).is_file():
        errors.append(f'Missing route {route}')

css = (DIST / 'styles.css').read_text(encoding='utf-8')
for asset in re.findall(r"url\(['\"]?(\./assets/[^'\")]+)", css):
    if not lib.longpath(DIST / asset).exists():
        errors.append(f'Missing CSS asset {asset}')
if 'prefers-reduced-motion' not in css:
    errors.append('styles.css has no prefers-reduced-motion handling')
# Intro CSS (src/css/04-intro.css): literal keyframes only (no var() inside a tsi- @keyframes), and the dock offsets
# = ((gap + word) / 2) / mark of the --brand-* header tokens (00-tokens.css), so the docked mark always lands in its slot.
intro_css = (ROOT / 'src/css/04-intro.css').read_text(encoding='utf-8')
tokens_css = (ROOT / 'src/css/00-tokens.css').read_text(encoding='utf-8')
for name, body in re.findall(r'@keyframes (tsi-[\w-]+)\{((?:[^{}]*\{[^{}]*\})*)\}', intro_css):
    if 'var(' in body:
        errors.append(f'04-intro.css: @keyframes {name} uses var() (keyframes must be literal)')


def brand_tokens(block):
    return {k: float(v) for k, v in re.findall(r'--brand-(mark|gap|word):([\d.]+)px', block)}


tok_desk = brand_tokens(re.search(r':root\{(.*?)\n\}', tokens_css, re.S).group(1))
tok_phone = {**tok_desk, **brand_tokens((re.search(r'@media \(max-width:799\.98px\)\{:root\{([^}]*)\}', tokens_css) or [''])[0])}
tok_xs = {**tok_phone, **brand_tokens((re.search(r'@media \(max-width:359\.98px\)\{:root\{([^}]*)\}', tokens_css) or [''])[0])}
for kf, t in (('tsi-dock', tok_desk), ('tsi-dock-p', tok_phone), ('tsi-dock-xs', tok_xs)):
    m = re.search(r'@keyframes ' + kf + r'\{from\{transform:translate3d\(([\d.]+)%', intro_css)
    if len(t) != 3 or not m:
        errors.append(f'04-intro.css: @keyframes {kf} or the --brand-* tokens it is derived from are missing')
        continue
    want = (t['gap'] + t['word']) / 2 / t['mark'] * 100
    if abs(float(m.group(1)) - want) > 0.01:
        errors.append(f'04-intro.css: @keyframes {kf} offset {m.group(1)}% should be {want:.2f}% (((gap + word) / 2) / mark of the header tokens)')
for extra in ('llms.txt', 'sitemap.xml'):       # GEO files: no retired / removed portfolio names either
    f = DIST / extra
    if f.exists():
        text = f.read_text(encoding='utf-8')
        for word in FORBIDDEN:
            if word in text:
                errors.append(f'{extra}: contains third-party identity / retired portfolio text "{word}"')
        for t in STORIES.get('testimonials') or []:   # reviews are on the page only, never in the GEO files
            q = (t.get('quote') or '').replace("'", '’')[:40] if isinstance(t, dict) else ''
            if q and q in text.replace("'", '’'):
                errors.append(f'{extra}: quotes a Client Stories testimonial ({t.get("project")})')
# Curated lists may only name shown projects (home_laptop also takes manifest-only films such as vyrn, never a
# portfolio slug that is not shown or an excluded one); skipped roles never reach the output; no two touching
# Work cards share a scene colour family when an arrangement without a clash exists.
catalogue = {e['slug'] for e in projects.CATALOGUE}
_prepared = {mp.get('slug') for mp in lib.media_manifest()['projects']}
for key in ('home_gallery', 'home_laptop'):
    for s in projects.DATA.get(key) or []:
        ok = projects.by_slug(s) or (key == 'home_laptop' and s not in catalogue and lib.media_entry(s))
        if key == 'home_gallery' and s in LANDING_SIX and s not in _prepared:
            continue                             # a landing page waiting for its media: warned below (LANDING_SIX)
        if not ok or s in projects.EXCLUDED:
            errors.append(f'portfolio.json {key}: "{s}" is not a shown project')
page_html = {p.relative_to(DIST).as_posix(): lib.longpath(p).read_text(encoding='utf-8') for p in pages}
all_html = '\n'.join(page_html.values())
idea = re.search(r'<section class="idea section".*?</section>', page_html.get('index.html', ''), re.S)
idea = idea.group(0) if idea else ''
for e in projects.CATALOGUE:
    for role in e.get('skip') or ():
        ref = f"assets/media/{e['slug']}/{role}-"
        for rel, h in page_html.items():
            if rel == 'index.html' and role == e.get('home_laptop_clip'):    # the home laptop's film (VYRN): there only
                h = h.replace(idea, '')
            if ref in h:
                errors.append(f"{e['slug']}: skipped {role} is referenced in the output ({rel})")
    if e['slug'] in OWNER_SKIPS and not OWNER_SKIPS[e['slug']] <= set(e.get('skip') or ()):
        errors.append(f"portfolio.json {e['slug']}: skip must list {sorted(OWNER_SKIPS[e['slug']] - set(e.get('skip') or ()))} "
                      '(owner, 15 Oct)')
if HOME_FILM not in (projects.DATA.get('home_laptop') or []) or f'assets/media/{HOME_FILM}/laptop-' not in idea:
    errors.append(f'index.html: the home laptop no longer plays the {HOME_FILM.upper()} film (assets/media/{HOME_FILM}/laptop-*.mp4)')
for x in projects.CASES:
    if ('E-commerce' in x['services_list']) != (x['slug'] in ECOMMERCE):
        errors.append(f"{x['slug']}: 'E-commerce' belongs to exactly {sorted(ECOMMERCE)} (owner, 14-15 Oct)")
for key, items in (('client', projects.CLIENTS), ('concept', projects.CONCEPTS)):
    bad = projects.clashes(items)
    if bad:
        warnings.append(f'Work page {key} grid: touching cards share a scene colour family {bad}')

# Project labels (owner, 14 Oct): client work = "Client Project"; concepts = one of projects.CONCEPT_LABELS, written in
# portfolio.json (projects.py would otherwise default it); an Interactive Concept keeps its "Unofficial, ..." line.
for e in projects.CATALOGUE:
    if e['slug'] in projects.EXCLUDED:
        continue
    if e['group'] == 'client' and e.get('label') not in (None, projects.CLIENT_LABEL):
        errors.append(f'portfolio.json {e["slug"]}: client project labelled "{e.get("label")}" instead of "{projects.CLIENT_LABEL}"')
    if e['group'] == 'concept' and e.get('label') not in projects.CONCEPT_LABELS:
        errors.append(f'portfolio.json {e["slug"]}: concept without one of the labels {list(projects.CONCEPT_LABELS)}')
for x in projects.CASES:
    if x['group'] == 'client' and x['label'] != projects.CLIENT_LABEL:
        errors.append(f'{x["slug"]}: client project without the label "{projects.CLIENT_LABEL}"')
    if x['label'] == 'Interactive Concept' and not x.get('note'):
        errors.append(f'{x["slug"]}: Interactive Concept without its "Unofficial, not affiliated with ..." line (label_note)')
    if x['group'] == 'client' and re.search(r'concept', x['industry'], re.I):
        errors.append(f'{x["slug"]}: client project industry "{x["industry"]}" uses "concept" wording')

# Prepared media (scripts/media-manifest.json, prepare_media.py): a curated project without a manifest entry is not shown
# (fine while it waits for its capture); one only in the manifest's 'order' was left out with --skip. The Work page counts
# every shown project: JSON-LD numberOfItems and the "Your project" slot = the next number.
_mf = lib.media_manifest()
_prepared = {mp.get('slug') for mp in _mf['projects']}
for e in projects.CATALOGUE:
    if (e['slug'] not in projects.EXCLUDED and e['slug'] not in _prepared and e['slug'] not in OWNER_ADDED
            and e['slug'] not in LANDING_SIX):     # (the landing pages' own warning: below)
        warnings.append(f"portfolio.json {e['slug']}: not in scripts/media-manifest.json 'projects', so not shown"
                        + (" (left out with prepare_media.py --skip)" if e['slug'] in _mf['order'] else ''))
_work = page_html.get('work/index.html', '')
_slot = re.search(r'<span class="wk-slot__n" aria-hidden="true">(\d+)</span>', _work)
if not _slot or int(_slot.group(1)) != len(projects.PROJECTS) + 1:
    errors.append(f'work/index.html: the "Your project" slot reads {_slot.group(1) if _slot else "nothing"}, not '
                  f'{len(projects.PROJECTS) + 1:02d} ({len(projects.PROJECTS)} shown projects + 1)')


def _graph(html):
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)
    try:
        return json.loads(m.group(1).replace('<\\/', '</'))['@graph'] if m else []
    except ValueError:
        return []


_list = next((n['mainEntity'] for n in _graph(_work) if (n.get('mainEntity') or {}).get('@type') == 'ItemList'), {})
_listed = [(li.get('item') or {}).get('name') for li in _list.get('itemListElement') or []]
if _list.get('numberOfItems') != len(projects.PROJECTS) or _listed != [x['title'] for x in projects.PROJECTS]:
    errors.append(f'work/index.html: JSON-LD ItemList lists {_list.get("numberOfItems")} work(s), not the '
                  f'{len(projects.PROJECTS)} shown projects in Work page order')
# Owner, 15 Oct (OWNER_ADDED): Sedile and any later addition - prepared, shown with its group and label, its own page,
# card, JSON-LD, llms.txt and sitemap entries, real alt text on every still (a capture "shows" line or a portfolio.json
# "alt" override, never the generic fallback or a capture note such as "at 1440 px"); no home hero tile unless
# portfolio.json home_gallery lists it; E-commerce only through ECOMMERCE (the services rule above).
_llms = lib.longpath(DIST / 'llms.txt').read_text(encoding='utf-8') if (DIST / 'llms.txt').exists() else ''
_smap = lib.longpath(DIST / 'sitemap.xml').read_text(encoding='utf-8') if (DIST / 'sitemap.xml').exists() else None
_tiles = re.findall(r'<a class="hero-tile[^"]*" href="([^"]+)"', page_html.get('index.html', ''))
_NOTE = re.compile(r'\b\d{3,4} ?px\b|\b\d+(?:\.\d+)? s\b|website (?:screen|recording) \d+ of \d+$')
# (the landing pages - LANDING_SIX, owner 17 Oct - go through the same checks once their media is prepared)
for slug, (group, label) in {**OWNER_ADDED, **{s: ('concept', 'Concept Project') for s in LANDING_SIX if s in _prepared}}.items():
    e = next((c for c in projects.CATALOGUE if c['slug'] == slug), None)
    x = projects.by_slug(slug)
    if not e:
        errors.append(f'portfolio.json: no "{slug}" entry (owner, 15 Oct: added as a {label})')
        continue
    if slug not in _prepared:
        errors.append(f"{slug}: not in scripts/media-manifest.json 'projects'"
                      + (" (only in its 'order': prepared with --skip)" if slug in _mf['order'] else '')
                      + f' - run python scripts/prepare_media.py --src C:/Teseract-media without --skip {slug}')
        continue
    if not x:
        errors.append(f'{slug}: prepared but not shown (no still, or info.txt without "permission: yes")')
        continue
    if (e['group'], e.get('label'), x['group'], x['label']) != (group, label, group, label):
        errors.append(f'{slug}: must be group "{group}" with the label "{label}" (owner, 15 Oct), not '
                      f'"{x["group"]}" / "{x["label"]}"')
    route = f"{x['route']}/index.html"
    page_ld = next((n['mainEntity'] for n in _graph(page_html.get(route, '')) if (n.get('mainEntity') or {}).get('@type') == 'CreativeWork'), {})
    if page_ld.get('name') != x['title'] or page_ld.get('description') != projects.label_text(x):
        errors.append(f'{route}: JSON-LD CreativeWork without the name "{x["title"]}" and the label "{projects.label_text(x)}"')
    if not re.search(r'\[' + re.escape(x['title']) + r'\]\([^)]*' + re.escape(x['route']) + r'[/)]', _llms):
        errors.append(f'llms.txt: no entry for {x["title"]} ({x["route"]}/)')
    if _smap is not None and f"/{x['route']}/</loc>" not in _smap:   # written once site_url is set (seo.sitemap)
        errors.append(f'sitemap.xml: no entry for {x["route"]}/')
    for it in x['stills'] + ([{'role': 'laptop', 'alt': x['alts'].get('laptop') or x['laptop'].get('alt') or ''}] if x['laptop'] else []):
        alt = (it['alt'] or '').strip()
        if not alt or _NOTE.search(alt):
            errors.append(f'{slug} {it["role"]}: alt text missing, generic or with a capture note ("{alt[:60]}") - '
                          'add a portfolio.json "alt" override')
    own = re.findall(r'<section class="pj-(?:hero|gallery-wrap)".*?</section>', page_html.get(route, ''), re.S)
    for img in re.findall(r'<img\b[^>]*assets/media/' + re.escape(slug) + r'/[^>]*>', ''.join(own) + article(_work, slug)):
        if not re.search(r'\balt="[^"]+"', img):                  # (the footer ring's copies are decorative: alt="")
            errors.append(f'{slug}: a page or Work card image without alt text ({img[:90]})')
# No home hero tile for a project home_gallery does not list (owner default, 15 Oct: his 20 tiles) - any project, not
# only the ones above (18 Oct: the designer's desk portfolio was taken out of the list while the built page still showed
# it, and nothing failed); the owner-hidden ones (GALLERY_HIDDEN) never back in the list, and they keep their Work card.
for x in projects.PROJECTS:
    if x['slug'] not in (projects.DATA.get('home_gallery') or []) and any(h.rstrip('/').endswith(f"{x['route']}/index.html") for h in _tiles):
        errors.append(f'index.html: a home hero tile shows {x["slug"]}, which portfolio.json home_gallery does not list '
                      '(owner default, 15 Oct: his 20 tiles; a stale build? run python scripts/build.py)')
for s in GALLERY_HIDDEN:
    if s in (projects.DATA.get('home_gallery') or []):
        errors.append(f'portfolio.json home_gallery: "{s}" is out of the home gallery (owner, 17-18 Oct; it keeps its Work card)')
    if not projects.by_slug(s) or not article(_work, s):
        errors.append(f'work/index.html: no Work card for {s} - out of the home gallery only, it keeps its card and page '
                      '(owner, 17-18 Oct)')

# Owner, 17 Oct (LANDING_SIX): each landing page a Concept Project in portfolio.json with its live url and tile clip;
# prepared, it leads home_gallery and EVERY hero tile of it plays its clip (its own tile a <video>, a stand-in for a
# hidden column the same clip from its <template data-clip>, so phones play it too); without prepared media yet a
# warning. Aivinci's own tile plays the tiger; the gallery's own tiles play GALLERY_CLIPS clips at most; the Product &
# SaaS card shows landing pages only (never LiveCV), each prepared one's still linked to its page on both pages. A tile
# playing a landing page's loop is a .hero-tile--loop: its labels sit at the frame's foot, clear of the site's headline
# (on touch screens in the name strip under the frame, 18 Oct). Its page title names its industry (seo.project_meta drops
# to '<name> — Website' when the industry makes it longer than seo.TITLE_MAX: 18 Oct, Maren Holt's).
_home = page_html.get('index.html', '')
_items = re.findall(r'<li class="hero-col__item([^"]*)"><a class="(hero-tile[^"]*)" href="([^"]+)"[^>]*>(.*?)</a></li>', _home, re.S)
_tile_cls = [(acls.split(), href, inner) for _, acls, href, inner in _items]
_items = [(cls, href, inner) for cls, _, href, inner in _items]
_gal = list(projects.DATA.get('home_gallery') or [])


def _plays(inner, clips):
    """True when a <video> in the tile's markup (its own, or the one in its <template data-clip>) plays one of clips."""
    return any(c['variants'][0]['file'] in v for v in re.findall(r'<video\b[^>]*>', inner) for c in clips)


for s in LANDING_SIX:
    e = next((c for c in projects.CATALOGUE if c['slug'] == s), None)
    if not e:
        errors.append(f'portfolio.json: no "{s}" entry (owner, 17 Oct: one of the six landing-page concepts)')
        continue
    if (e['group'], e.get('label')) != ('concept', 'Concept Project') or not e.get('url') or not e.get('tile_clip'):
        errors.append(f'portfolio.json {s}: a landing-page concept is group "concept", label "Concept Project", with its '
                      'live url and its "tile_clip" (owner, 17 Oct)')
    if s not in _prepared:
        warnings.append(f"{s}: landing page without prepared media yet, so not on the site (waits for its reviewed capture; "
                        f"then python scripts/prepare_media.py --src C:/Teseract-media without --skip {s})")
        continue
    x = projects.by_slug(s)
    if not x:
        continue                                 # prepared but not shown: the OWNER_ADDED checks above report it
    if s not in _gal[:len(LANDING_SIX)]:
        errors.append(f'portfolio.json home_gallery: {s} must lead the gallery with the other landing pages (owner, 17 Oct)')
    route = f"{x['route']}/index.html"
    mine = [(cls, inner) for cls, href, inner in _items if href.rstrip('/').endswith(route)]
    _t = re.search(r'<title>(.*?)</title>', page_html.get(route, ''), re.S)
    if _t and x['industry'] not in _h.unescape(_t.group(1)):
        errors.append(f'{route}: the page title "{_h.unescape(_t.group(1))}" leaves out the industry "{x["industry"]}" '
                      f'(longer than seo.TITLE_MAX = {seo.TITLE_MAX} with it): shorten portfolio.json {s} industry')
    # Its stills' alt texts are the names of their "Tap to enlarge" links and the viewer reads them out with its count:
    # one or two sentences (18 Oct verifier: the capture 'shows' lines ran 400-1300 characters), as portfolio.json "alt".
    for it in x['stills'] + ([{'role': 'laptop', 'alt': x['alts'].get('laptop') or x['laptop'].get('alt') or ''}] if x['laptop'] else []):
        if len(it['alt'] or '') > ALT_MAX:
            warnings.append(f'{s} {it["role"]}: alt text of {len(it["alt"])} characters (> {ALT_MAX}) - a screen reader reads it '
                            'in full as the link name and in the viewer: add a short portfolio.json "alt" override')
    if not x['tile_clips']:
        errors.append(f'{s}: no tile clip prepared (C:/Teseract-media/{s}/tile.mp4 or hero.mp4) - its home tile must play one')
    elif not any('--lt' not in cls and '<template' not in inner and _plays(inner, x['tile_clips']) for cls, inner in mine):
        errors.append(f'index.html: the home hero tile of {s} does not play its clip (owner, 17 Oct: every landing-page tile moves)')
    for cls, inner in mine:
        if not _plays(inner, x['tile_clips']) or ('--lt' in cls and '<template data-clip>' not in inner):
            errors.append(f'index.html: a hero tile of {s}{" (a stand-in)" if "--lt" in cls else ""} does not play its '
                          'clip - every landing-page tile moves, on phones too (owner, 17 Oct)')
            break
    loops = [c for c in x['tile_clips'] if c['variants'][0]['file'].rsplit('/', 1)[-1].startswith('tile-')]
    if any(href.rstrip('/').endswith(route) and _plays(inner, loops) and 'hero-tile--loop' not in acls
           for acls, href, inner in _tile_cls):
        errors.append(f'index.html: a hero tile of {s} plays its loop without the hero-tile--loop class (owner, 17 Oct: '
                      "the loop shows the site's hero - its labels sit at the frame's foot, clear of the nav and headline)")
_tiger = projects.by_slug(TIGER[0])
if _tiger and TIGER[0] in _gal:
    tiger = [c for c in _tiger.get('tile_clips') or () if c['variants'][0]['file'].rsplit('/', 1)[-1].startswith(TIGER[1] + '-')]
    if not tiger or not any('--lt' not in cls and '<template' not in inner and _plays(inner, tiger)
                            for cls, href, inner in _items if href.rstrip('/').endswith(f"{_tiger['route']}/index.html")):
        errors.append(f'index.html: Aivinci\'s home hero tile does not play the {TIGER[1]} clip (owner, 17 Oct: keep the tiger moving)')
# Every project of the gallery is on screen at every width (4 / 3 / 2 columns: own tiles + stand-ins, owner 15 Oct: the
# phone "has to be exactly the same"), and a project shown twice there (fewer projects than slots, while landing pages
# wait for their media) never in the same or a neighbouring column: the columns slide past each other, and a column's
# last tile runs on into its lead (home_hero._plan; 18 Oct, two Siaara tiles side by side at the gallery's top).
_shown_gal = [x for x in (projects.by_slug(s) for s in _gal) if x]
for n in (4, 3, 2):
    _at = [(int(c), href) for c, body in re.findall(r'<div class="hero-col hero-col--(\d)"[^>]*>(.*?)</ul></div>', _home, re.S)
           for cls, href in re.findall(r'<li class="hero-col__item([^"]*)"><a class="hero-tile[^"]*" href="([^"]+)"', body)
           if int(c) <= n and ('--lt' not in cls or ('--lt1440' in cls and n < 4) or ('--lt800' in cls and n == 2))]
    for x in _shown_gal:
        cs = sorted(c for c, href in _at if href.rstrip('/').endswith(f"{x['route']}/index.html"))
        if not cs:
            errors.append(f'index.html: with {n} gallery columns no hero tile shows {x["title"]} (every gallery project at '
                          'every width, owner 15 Oct)')
        elif any(b - a <= 1 for a, b in zip(cs, cs[1:])):
            errors.append(f'index.html: with {n} gallery columns {x["title"]} shows twice in the same or neighbouring '
                          f'columns {cs} (home_hero._plan keeps a repeat two columns away)')
# Never two clips stacked in a column, at any width (owner, 17 Oct; the column's last tile runs on into its lead): a clip's
# stand-in counts where it shows (18 Oct: Emberpost's had gone straight above Sagewell's clip at 834px). A stand-in right
# under a lead tile at 3 columns is on screen from a tablet's first paint and comes in only seconds later: a warning.
for n in (4, 3, 2):
    for c, body in re.findall(r'<div class="hero-col hero-col--(\d)"[^>]*>(.*?)</ul></div>', _home, re.S):
        if int(c) > n:
            continue
        seq = [(cls, '<video' in inner or '<template data-clip>' in inner, href)
               for cls, href, inner in re.findall(r'<li class="hero-col__item([^"]*)"><a class="hero-tile[^"]*" href="([^"]+)"[^>]*>(.*?)</a></li>', body, re.S)
               if '--lt' not in cls or ('--lt1440' in cls and n < 4) or ('--lt800' in cls and n == 2)]
        for a, b in zip(seq, seq[1:] + seq[:1]):
            if a[1] and b[1] and a is not b:
                errors.append(f'index.html: with {n} gallery columns, column {c} stacks two clips ({a[2]} and {b[2]}) - '
                              'never two clips stacked in a column (owner, 17 Oct; home_hero._columns)')
        if n == 3 and len(seq) > 1 and '--lt' in seq[1][0]:
            warnings.append(f'index.html: with 3 gallery columns, column {c} has a stand-in ({seq[1][2]}) right under its '
                            "lead tile - on a tablet it comes in only once that place has left the screen")
_own_clips = sum(1 for cls, href, inner in _items if '--lt' not in cls and '<template' not in inner and '<video' in inner)
if _own_clips > GALLERY_CLIPS:
    errors.append(f'index.html: the home hero gallery plays {_own_clips} clips (at most {GALLERY_CLIPS}: the six landing '
                  'pages + the tiger, owner 17 Oct)')
_saas = [it for it in service_cards.MEDIA[SAAS_CARD].get('images') or ()]
if not _saas or any(it.get('slug') not in LANDING_SIX or it.get('supplied') for it in _saas):
    errors.append(f'service_cards.MEDIA["{SAAS_CARD}"] (Product & SaaS): two captured stills of the SaaS landing pages, '
                  'nothing else (owner, 17 Oct: instead of LiveCV)')
for it in _saas:
    x = projects.by_slug(it.get('slug') or '')
    if not x:
        warnings.append(f'Product & SaaS card: {it.get("slug")} is not shown yet, so the card shows fewer landing pages')
        continue
    for rel in ('index.html', 'what-we-create/index.html'):
        if not re.search(r'<a class="svc-[^"]*" href="[^"]*' + re.escape(x['route']) + r'/index\.html"[^>]*>(?:(?!</a>).)*assets/media/'
                         + re.escape(f"{x['slug']}/{it['role']}-"), page_html.get(rel, ''), re.S):
            errors.append(f'{rel}: the Product & SaaS card does not show {x["slug"]} {it["role"]} linked to its page')

# Client Stories reviews (content.STORIES['testimonials'], owner 14 Oct): one per shown CLIENT project (never a concept;
# company, industry, label, still and link come from it), rating 1.0-5.0 with one decimal, a quote (warning above 320
# characters: it sets the deck's height); a SAMPLE review names no person and speaks about Gireesh by name. LAUNCH GUARD: sample reviews are a preview only - an indexable build, or one with a site_url, fails
# until every sample is replaced with real client feedback (LAUNCH-CHECKLIST.md 3c).
seen_reviews = set()
for i, t in enumerate(STORIES.get('testimonials') or []):
    where = f'content.STORIES["testimonials"][{i}]'
    if not isinstance(t, dict):
        errors.append(f'{where}: expected a dict (project, rating, quote, sample)')
        continue
    slug = t.get('project')
    x = projects.by_slug(slug or '')
    if not x or x['group'] != 'client':
        errors.append(f'{where}: "{slug}" is not a shown client project (reviews come from client work only)')
    if slug in seen_reviews:
        errors.append(f'{where}: a second review for "{slug}" (one profile per client)')
    seen_reviews.add(slug)
    r = t.get('rating')
    if r is not None and not (isinstance(r, (int, float)) and 1 <= r <= 5 and round(r, 1) == r):
        errors.append(f'{where}: rating {r!r} must be 1.0-5.0 with one decimal')
    if not (t.get('quote') or '').strip():
        errors.append(f'{where}: empty quote')
    if t.get('sample') and (t.get('name') or t.get('role')):
        errors.append(f'{where}: a sample review must not name a person')
    if t.get('sample') and 'Gireesh' not in (t.get('quote') or ''):
        errors.append(f'{where}: a sample review speaks about Gireesh by name (owner, 14 Oct)')
    if len((t.get('quote') or '').strip()) > 320:
        warnings.append(f'{where}: quote of {len(t["quote"].strip())} characters (> 320) - the longest quote sets the height of '
                        'the Client Stories deck, so every card grows')
review_samples = stories.samples()
if review_samples and (lib.CONFIG.get('indexable') or (lib.CONFIG.get('site_url') or '').strip()):
    errors.append(f'LAUNCH GUARD: {len(review_samples)} SAMPLE testimonial(s) on Client Stories (scripts/content.py '
                  'STORIES["testimonials"], "sample": True) while site.config.json is indexable or has a site_url: replace '
                  'them with real client feedback (and written consent) before launch - LAUNCH-CHECKLIST.md 3c')
elif review_samples:
    warnings.append(f'{len(review_samples)} SAMPLE testimonial(s) on Client Stories: preview only, replace before launch '
                    '(LAUNCH-CHECKLIST.md 3c; check.py fails once indexable / site_url is set)')

# FOUNDER (owner, 15 Oct; sections/founder.py): the owner's text verbatim, its placement, no image of him, JSON-LD.
from sections import founder as _fd  # noqa: E402
from content import WHO as _WHO, FAQ as _FAQ  # noqa: E402


def _ntext(fragment):
    """Visible-ish text of an HTML fragment for copy comparisons: tags out, entities unescaped, typographic quotes
    straightened, whitespace collapsed, casefolded."""
    t = re.sub(r'<(script|style|svg)\b.*?</\1>', ' ', fragment, flags=re.S)
    t = _h.unescape(re.sub(r'<[^>]+>', '', t))
    t = t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return re.sub(r'\s+', ' ', t).strip().casefold()


def _section(html, sid):
    m = re.search(r'<section\b[^>]*\bid="' + re.escape(sid) + r'".*?</section>', html, re.S)
    return m.group(0) if m else ''


_who = page_html.get('who-we-are/index.html', '')
_home = page_html.get('index.html', '')
_spec = lib.ROOT.parent / '_ref/specs/founder-content.md'
if not _spec.exists():
    warnings.append(f'founder: {_spec} not found - verbatim founder copy not verified')
else:
    _src = _spec.read_text(encoding='utf-8')
    _src = _src[_src.index('Eyebrow:'):] if 'Eyebrow:' in _src else ''
    _lines = []
    for ln in _src.splitlines():
        ln = ln.strip()
        if not ln or ln in ('Headline:', 'Body:'):
            continue
        ln = re.sub(r'^(Eyebrow|Name|Roles|Headline|Quote 1|Quote 2|Section eyebrow|Column 1|Column 2|Closing):\s*', '', ln)
        if ln == 'THE PERSON BEHIND / TESERACT':
            ln = 'THE PERSON BEHIND TESERACT'
        parts = ln.split(' / ') if ln.startswith('Templates replaced') else [ln]
        for x in parts:
            x = x.strip()
            if len(x) > 1 and x[0] == '"' and x[-1] == '"':
                x = x[1:-1]
            _lines.append(x)
    if len(_lines) < 18:
        errors.append(f'founder: parsed only {len(_lines)} lines from {_spec.name} (format changed?)')
    _wt = _ntext(_who)
    for x in _lines:
        if _ntext(x) not in _wt:
            errors.append(f'who-we-are/index.html: founder content line missing or altered: "{x[:70]}"')
# 2. the home teaser: name, roles, quote 1, the link to who-we-are/#founder
_tea = _section(_home, 'founder-teaser')
if not _tea:
    errors.append('index.html: no founder teaser (section#founder-teaser)')
else:
    _f = _WHO['founder']
    for x in (_f['name'], ' · '.join(_f['roles']), _f['quote'], 'Meet the founder'):
        if _ntext(x) not in _ntext(_tea):
            errors.append(f'index.html #founder-teaser: missing "{x[:60]}"')
    if not re.search(r'<a\b[^>]*href="[^"]*who-we-are/index\.html#founder"', _tea):
        errors.append('index.html #founder-teaser: no link to who-we-are/index.html#founder')
# 3. no image of him (nor a placeholder) while no portrait is supplied
for _rel, _sid in (('who-we-are/index.html', 'founder'), ('index.html', 'founder-teaser')):
    _sec = _section(page_html.get(_rel, ''), _sid)
    if _fd.FOUNDER_PORTRAIT is None and re.search(r'<(img|picture)\b', _sec):
        errors.append(f'{_rel} #{_sid}: an image while sections/founder.py FOUNDER_PORTRAIT is None (no photo of the founder)')
    if re.search(r'data-cursor', _sec):
        errors.append(f'{_rel} #{_sid}: data-cursor inside a founder section (no cursor pill there)')
if re.search(r'data-cursor', _section(_who, 'why')):
    errors.append('who-we-are/index.html #why: data-cursor inside the section')
# 4. the old "Why we started" copy is gone everywhere
for _rel, _h2 in page_html.items():
    for _old in ('We started with a simple question', 'We wanted to change that', 'Why do so many businesses', 'why we started'):
        if _old.casefold() in _h2.casefold():
            errors.append(f'{_rel}: still contains the replaced "Why we started" copy ("{_old}")')
# 5. the brand is TESERACT everywhere the visitor or a crawler reads it
for _name, _txt in [(r, h) for r, h in page_html.items()] + [(f, lib.longpath(DIST / f).read_text(encoding='utf-8'))
                                                          for f in ('llms.txt', 'sitemap.xml') if (DIST / f).exists()]:
    if 'TESSERACT' in _txt:
        errors.append(f'{_name}: spells the brand TESSERACT (the site uses TESERACT)')
# 6. Who We Are order: hero -> founder -> intro -> why -> philosophy -> how we think -> promise
_ix = [_who.find(m) for m in ('class="who-hero"', 'id="founder"', 'id="intro"', 'id="why"', 'id="philosophy"',
                               'id="how-we-think"', 'id="promise"')]
if -1 in _ix or _ix != sorted(_ix):
    errors.append(f'who-we-are/index.html: section order must be hero, founder, intro, why, philosophy, how we think, promise ({_ix})')
# 7. JSON-LD: exactly one Person (the founder) on who + home, the Organization's founder points at it
_soc = lib.CONFIG.get('socials') or {}
_same = [_soc[k] for k in ('linkedin', 'instagram', 'github') if _soc.get(k)]
for _rel in ('who-we-are/index.html', 'index.html'):
    _m = re.search(r'<script type="application/ld\+json">(.*?)</script>', page_html.get(_rel, ''), re.S)
    try:
        _g = json.loads(_m.group(1).replace('<\\/', '</'))['@graph'] if _m else []
    except ValueError:
        _g = []
        errors.append(f'{_rel}: JSON-LD does not parse')
    _ps = [n for n in _g if n.get('@type') == 'Person']
    _org = next((n for n in _g if n.get('@type') == 'Organization'), {})
    if len(_ps) != 1:
        errors.append(f'{_rel}: JSON-LD needs exactly one Person node (the founder), found {len(_ps)}')
        continue
    _pp = _ps[0]
    if _pp.get('name') != _WHO['founder']['name'] or _pp.get('jobTitle') != 'Founder' or not _pp.get('worksFor'):
        errors.append(f'{_rel}: founder Person must have name "{_WHO["founder"]["name"]}", jobTitle "Founder" and worksFor')
    if (_pp.get('sameAs') or []) != _same:
        errors.append(f'{_rel}: founder Person sameAs must be {_same} (site.config.json linkedin, instagram, github)')
    if _fd.FOUNDER_PORTRAIT is None and 'image' in _pp:
        errors.append(f'{_rel}: founder Person has an image while no portrait is supplied')
    _fref = _org.get('founder') or {}
    if not (_fref.get('@id') and _fref.get('@id') == _pp.get('@id')) and _fref.get('name') != _pp.get('name'):
        errors.append(f'{_rel}: the Organization\'s founder must reference the founder Person')
# 8. home agency point 03 sub-line (it borrowed WHO.why.closing until 15 Oct; now the FAQ answer)
_p3 = re.search(r'<li class="agc-pt agc-pt--3".*?<p class="agc-pt__s">(.*?)</p>', _home, re.S)
if not _p3 or _ntext(_p3.group(1)) != _ntext('Every project starts from zero.'):
    errors.append('index.html: agency point 03 sub-line must read "Every project starts from zero."')
# 10. what screen readers get (review, 15 Oct): his name as ONE text node with the per-letter nameplate aria-hidden
# (else "G i r e e s h"), and the restore toggles' inter-word spaces inside the spans (else Chromium names them
# "Templatesreplaced thinking.")
for _rel, _hid in (('who-we-are/index.html', 'founder-title'), ('index.html', 'fdt-name')):
    _nm = re.search(r'<h2\b[^>]*\bid="' + _hid + r'"[^>]*>(.*?)</h2>', page_html.get(_rel, ''), re.S)
    if not _nm or f'<span class="sr-only">{_WHO["founder"]["name"]}</span>' not in _nm.group(1) \
            or len(re.findall(r'data-fit aria-hidden="true"', _nm.group(1))) != len(_WHO['founder']['name'].split(' ', 1)):
        errors.append(f'{_rel} #{_hid}: the name must be one .sr-only text with every nameplate line aria-hidden')
_rsl = re.findall(r'<span class="fdr-rs__line" data-swap>(.*?)</span></li>', _section(_who, 'why'), re.S)
if len(_rsl) != 3 or any(not re.search(r'</span><span class="fdr-rs__r"> \w+ </span><span class="fdr-rs__v">', x) for x in _rsl):
    errors.append('who-we-are/index.html #why: each restore line needs its spaces inside .fdr-rs__r (accessible name)')

# Owner-supplied service-card images (scripts/supplied.json -> scripts/prepare_supplied.py): each one a service card maps
# must be prepared, every variant a valid WebP of the recorded size (in public/ and, when referenced, in dist/), the
# recorded crop the table's, and the source unchanged since it was prepared (when the source folder is on this machine).
supplied_table = json.loads(lib.longpath(lib.SUPPLIED_TABLE).read_text(encoding='utf-8')) if lib.longpath(lib.SUPPLIED_TABLE).exists() else {}
supplied_done = (json.loads(lib.longpath(lib.SUPPLIED_MANIFEST).read_text(encoding='utf-8')).get('images') or {}
                 if lib.longpath(lib.SUPPLIED_MANIFEST).exists() else {})
supplied_rows = {e['name']: e for e in supplied_table.get('images') or []}
mapped = {it['supplied'] for m in service_cards.MEDIA.values() for it in m.get('images') or () if it.get('supplied')}
for name in sorted(mapped | set(supplied_rows)):
    row, done = supplied_rows.get(name), supplied_done.get(name)
    if not row:
        errors.append(f'supplied image "{name}" is mapped in service_cards.MEDIA but not in scripts/supplied.json')
        continue
    if not done or not done.get('variants'):
        errors.append(f'supplied image "{name}" is not prepared (run python scripts/prepare_supplied.py)')
        continue
    if (done.get('source') or {}).get('crop') != (list(row['crop']) if row.get('crop') else None):
        errors.append(f'supplied image "{name}": prepared crop {done["source"].get("crop")} differs from supplied.json {row.get("crop")}')
    src = done.get('source') or {}
    for v in done['variants']:
        if v['width'] > (row['crop'][2] - row['crop'][0] if row.get('crop') else src.get('width', 0)):
            errors.append(f'supplied image "{name}": {v["file"]} is upscaled')
        size = webp_size(lib.PUBLIC / v['file'])
        if size != (v['width'], v['height']):
            errors.append(f'supplied image "{name}": public/{v["file"]} is missing or broken ({size or "not a valid WebP"})')
        if v['file'] in all_html:
            dsize = webp_size(DIST / v['file'])
            if dsize != (v['width'], v['height']):
                errors.append(f'supplied image "{name}": dist/{v["file"]} is missing or broken')
    source = Path(supplied_table.get('src') or '') / row['file']
    if supplied_table.get('src') and source.is_file():
        if hashlib.sha256(source.read_bytes()).hexdigest() != src.get('sha256'):
            errors.append(f'supplied image "{name}": {source} changed since it was prepared (run python scripts/prepare_supplied.py)')
    elif name in mapped:
        warnings.append(f'supplied image "{name}": source {source} not found on this machine (prepared copy used)')
    if name in mapped and not row.get('alt'):
        errors.append(f'supplied image "{name}" has no alt text in supplied.json')

report_file = lib.build_report_path(DIST)
report = json.loads(report_file.read_text(encoding='utf-8')) if report_file.exists() else {}
for f in report.get('failures', []):
    errors.append(f"build failure: {f['module']} {f['func']}")

summary = {'routes': len(expected), 'html_files': len(pages), 'errors': errors, 'warnings': warnings}
(ROOT / 'docs').mkdir(exist_ok=True)
(ROOT / 'docs/static-check-results.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
print(json.dumps(summary, indent=2))
if errors:
    raise SystemExit(1)
