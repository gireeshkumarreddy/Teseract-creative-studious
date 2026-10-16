"""Home — section 1: HERO (reference ref-hero-nav §4–10, gallery tiles after ZIP §4–5).

Structure (reference geometry at 1440):
  lockup   rotating statement pill (brand 3D mark avatar) · H1 · lead + body copy
  CTAs     "Start a Project" (dark, brand-mark lead that opens to "+ You") · "Explore Our Work" (light)
  badge    red pulsing dot + mono tagline
  media    services marquee (48px, horizontal ticker) + 1000px framed 4/3/2-column vertical tickers
           of the studio's own websites (portfolio.json "home_gallery": stills cropped to each slot by
           focal point, up to 6 clips - the phone scrolls, or a project's portfolio.json "tile_clip" such as
           Aivinci's tiger); every tile links to its project page, and every project of the gallery is on
           screen at every width (stand-ins for the hidden columns, _columns()).

Copy comes from content.py / site.config.json only. The pill rotates brand statements taken
verbatim from the content document (no testimonials, which the document does not supply).
"""
import math
import lib
from lib import E, fmt, CONFIG, button, roll
import chrome
import content
import projects

HERO = content.HOME['hero']

# Rotating pill: short brand statements, verbatim from the document / menu artwork.
STATEMENTS = [
    CONFIG['menu_tagline'],                 # "Creativity meets functionality."
    content.HOME['believe']['body'][2],     # "We make complex things feel simple."
    content.HOME['believe']['title'],       # "Simple for people. Powerful for business."
    content.FOOTER['line'],                 # "Digital experiences, built around you."
]

# Gallery columns (reference §8.2): direction, speed px/s, hover factor, tile slot aspects. The slots keep
# the reference rhythm (landscape/portrait/square alternating so neighbouring columns never line up the same
# shape); the projects that fill them come from portfolio.json "home_gallery" (shown projects only).
L169, L43, SQ, P45 = '16/9', '4/3', '1/1', '4/5'
COLUMNS = [
    ('down', 25, 0.8, [L43, P45, L169, SQ, L43]),
    ('up', 34, 0.9, [SQ, L169, P45, '3/2', SQ]),
    ('down', 30, 0.9, ['7/5', P45, L169, SQ, L169]),
    ('up', 25, 0.8, [L43, P45, L169, '5/4', '3/2']),
]

TILE_SIZES = '(min-width:1440px) 316px, (min-width:800px) 30vw, 46vw'

# The projects' own phone-scroll clips (hero.mp4) replace up to 6 tiles in total, one per column in turn
# (columns 1-2 show at every width, 3 from 800px, 4 from 1440px), in the column's 2nd-4th tile whose shape
# suits the clip (never two clips stacked in one column). The slot keeps its aspect ratio and the clip covers
# it, so a clip only takes a slot within MAX_CLIP_CROP of its own aspect (log ratio 0.8 = 2.2x): a portrait
# phone clip goes into a portrait or square tile, never a landscape one (that showed a thin, often empty band).
VIDEO_SLOTS = (1, 2, 3)
MAX_VIDEO_TILES = 6
MAX_CLIP_CROP = 0.8
POSTER_W = 640             # a clip tile's poster: the 480 / 640 frames (cropped to the tile shape) cover 316px at 2x

# Fewer columns show on smaller screens (20-hero.css: column 4 from 1440px, column 3 from 800px). So that every project
# of the gallery is on every screen (owner, 15 Oct: the phone "has to be exactly the same" as the desktop), a hidden
# column's tiles are repeated in the columns still shown: below 1440px column 4's tiles join columns 1-3, below 800px
# column 3's (with the one it took from column 4) join columns 1-2 - ten tiles each on a phone, still one ticker
# transform per column. A stand-in shows only at those widths (.hero-col__item--lt1440 / --lt800) and keeps its
# original's slot shape and image file: where the original is on screen the browser already has that file (the
# tickers' clones load every tile), and a clip's stand-in is the clip's poster frame, so phones get no extra clip. With
# motion the stand-ins sit out the page's first layout and 20-hero.js lets them in after load, off screen (without JS or
# motion they are there from the start).
SHOWN = (4, 3, 2)          # columns on screen at >= 1440px, 800-1439px, < 800px


def _typo(text):
    """Typographic apostrophes for display copy (content itself is unchanged)."""
    return text.replace("'", '’')


def _avatar(ctx, cls, size):
    return (f'<span class="{cls}">'
            f'{lib.img(ctx, "assets/brand/logo-mark-3d.webp", "", w=size, h=size, eager=True)}</span>')


def _pill(ctx):
    rows = ''.join(
        f'<span class="hero-pill__row{" is-active" if i == 0 else ""}">'
        f'{_avatar(ctx, "hero-pill__av", 32)}'
        f'<span class="hero-pill__bubble">{E(fmt(s))}</span></span>'
        for i, s in enumerate(STATEMENTS))
    tail = ('<svg class="hero-pill__tail" viewBox="0 0 34 13" aria-hidden="true" focusable="false">'
            '<path d="M9.084 0C8.531 0 8.084.448 8.084 1c0 0 0 0 1.23 0 1.229 0 5.651 8 8.138 8 2.488 0 '
            '6.002-8 7.849-8 1.846 0 1.229 0 1.229 0V0Z" fill="currentColor"/></svg>')
    tip = f'<span class="hero-pill__tip">{E(CONFIG["brand_full"])}{tail}</span>'
    # Decorative: the statements also live in the sections below and the menu artwork.
    return f'<div class="hero-pill" data-hero-pill aria-hidden="true">{rows}{tip}</div>'


def _ctas(ctx):
    lead = (_avatar(ctx, 'hero-cta__av', 28)
            + '<span class="hero-cta__plus">+</span><span class="hero-cta__you">You</span>')
    start = button(ctx, HERO['ctas'][0], ctx.url('contact'), variant='dark', lead=lead, cls='hero-cta hero-cta--start')
    work = button(ctx, HERO['ctas'][1], ctx.url('work'), variant='light', cls='hero-cta hero-cta--work')
    tagline = fmt(CONFIG['tagline']).rstrip('.')
    return f'''<div class="hero__cta">
      <div class="hero__buttons">
        <div class="hero__btn" data-reveal data-appear style="--d:400ms;--y:60px">{start}</div>
        <div class="hero__btn" data-reveal data-appear style="--d:400ms;--y:60px">{work}</div>
      </div>
      <p class="hero-badge" data-reveal data-appear style="--d:500ms;--y:40px">
        <span class="hero-badge__dot" aria-hidden="true"><i></i><i></i></span>
        <span class="hero-badge__text">{E(tagline)}</span>
      </p>
    </div>'''


def _marquee(ctx):
    """Services ticker in the reference logo-marquee slot (spec critic E: Geist 500 20/1 −0.02em at
    .40, a 12px brand mark at .35 between words). Decorative, like the reference's faded logo wall:
    the same services are listed in the What We Create section and the footer, so it is hidden from
    assistive tech instead of being read as a moving list."""
    mark = lib.svg_inline('assets/brand/logo-mark.svg', 'hero-marquee__mark')
    items = ''.join(
        f'<li class="hero-marquee__item"><span class="hero-marquee__word">{E(s)}</span>{mark}</li>'
        for s in content.FOOTER['services'])
    return (f'<div class="hero-marquee" data-reveal="fade" data-appear style="--d:600ms" aria-hidden="true">'
            f'<div class="hero-marquee__track" data-ticker data-direction="left" data-speed="25">'
            f'<ul class="hero-marquee__list" data-ticker-list role="list">{items}</ul>'
            f'</div></div>')


def _cap(title, industry):
    """Name caption: rolls in on hover / keyboard focus; on touch screens it is always shown, in a strip under the
    image (20-hero.css). A ' | ' binds to the word before it, like lib.name_text's separators."""
    ind = (f'<span class="hero-tile__dot">·</span>'
           f'<span class="hero-tile__ind">{roll(industry)}</span>') if industry else ''
    return (f'<span class="hero-tile__cap" aria-hidden="true">'
            f'<span class="hero-tile__title">{roll(lib.name_text(title).replace(" | ", chr(160) + "| "))}</span>{ind}</span>')


def _label(p):
    """Always-visible label pill on every tile - "Client Project", "Interactive Concept", "Concept Project" or
    "Personal project" (owner, 14 Oct: visitors see client vs concept at once, before any hover). An Interactive
    Concept's small "Unofficial, ..." line (portfolio.json label_note) shows under its pill too (Client update 8: on
    every card, project page and home tile) - on phones as a full-text strip under the image, so the artwork stays
    visible; the alt text and the link name carry it as well."""
    if not p.get('label'):
        return ''
    tag = (f'<span class="hero-tile__tag hero-tile__tag--{E(p.get("label_kind") or "concept")}" aria-hidden="true">'
           f'<i></i>{E(p["label"])}</span>')
    if not p.get('note'):
        return tag
    return f'<span class="hero-tile__labels" aria-hidden="true">{tag}<span class="hero-tile__note">{E(p["note"])}</span></span>'


def _ratio(ar):
    a, b = ar.split('/')
    return float(a) / float(b)


def _video_slots(pool):
    """{(column, tile): (project, hero clip)} for up to MAX_VIDEO_TILES projects of the pool that have one."""
    clips = [(p, p['tile_clip']) for p in pool if p.get('tile_clip')]   # hero.mp4, or a named clip (Aivinci's tiger)
    slots, per_col = {}, [0] * len(COLUMNS)
    for p, entry in clips:
        if len(slots) >= MAX_VIDEO_TILES:
            break
        src = entry.get('source') or {}
        v = entry['variants'][-1]
        car = (src.get('width') or v['width']) / (src.get('height') or v['height'])
        err = lambda ct: abs(math.log(_ratio(COLUMNS[ct[0]][3][ct[1]]) / car))
        free = [(c, t) for c in range(len(COLUMNS)) for t in VIDEO_SLOTS
                if t < len(COLUMNS[c][3]) and (c, t) not in slots and (c, t - 1) not in slots and (c, t + 1) not in slots
                and err((c, t)) <= MAX_CLIP_CROP]
        if not free:
            continue                        # no slot of a suitable shape left for this clip: its tiles stay stills
        # fewest videos in the column first, then the leftmost column, then the closest aspect (2nd tile on a tie)
        c, t = min(free, key=lambda ct: (per_col[ct[0]], ct[0], err(ct) + (0.1 if ct[1] != VIDEO_SLOTS[0] else 0)))
        slots[(c, t)] = (p, entry)
        per_col[c] += 1
    return slots


def _best_still(p, ar, used):
    """The project's still that suits a slot of aspect `ar` best (closest aspect, earlier gallery screens
    first), preferring stills not used yet in the gallery. Returns (still, aspect error)."""
    stills = p['stills']
    fresh = [s for s in stills if s['role'] not in used] or stills
    best = min(fresh, key=lambda s: abs(math.log(s['w'] / s['h'] / ar)) + 0.01 * stills.index(s))
    return best, abs(math.log(best['w'] / best['h'] / ar))


def _plan():
    """{(column, tile): ('video', project, clip) | ('still', project, still)} for every slot. Videos first;
    then each still slot, row by row, takes the project that is not a neighbour of the slot, has been used
    least, has a still that fits the slot's shape (a phone screen for a portrait slot) and comes first in
    the curated order - so repeats (fewer than 20 shown projects) are spread across columns."""
    pool = projects.curated('home_gallery') or projects.PROJECTS
    if not pool:
        return {}
    plan = {k: ('video', p, e) for k, (p, e) in _video_slots(pool).items()}
    uses = {p['slug']: 0 for p in pool}
    for _, p, _ in plan.values():
        uses[p['slug']] += 1
    used = {p['slug']: set() for p in pool}
    rank = {p['slug']: i for i, p in enumerate(pool)}
    for r in range(max(len(col[3]) for col in COLUMNS)):
        for c, col in enumerate(COLUMNS):
            if r >= len(col[3]) or (c, r) in plan:
                continue
            ar = _ratio(col[3][r])
            near = {plan[k][1]['slug'] for k in ((c, r - 1), (c - 1, r), (c + 1, r), (c, r + 1)) if k in plan}
            fits = {p['slug']: _best_still(p, ar, used[p['slug']]) for p in pool}
            p = min(pool, key=lambda q: (q['slug'] in near, uses[q['slug']], fits[q['slug']][1] > 0.45, rank[q['slug']]))
            still = fits[p['slug']][0]
            plan[(c, r)] = ('still', p, still)
            uses[p['slug']] += 1
            used[p['slug']].add(still['role'])
    return plan


def _shape(ar):
    r = _ratio(ar)
    return 'wide' if r >= 1.7 else 'landscape' if r > 1.15 else 'square' if r >= 0.9 else 'portrait'


def _clash(a, b):
    """How badly two neighbouring tiles go together: the same project, the same slot shape (or family of shapes), the
    same kind (client / concept), two stand-ins (they spread between the own tiles)."""
    return (4 * (a['p']['slug'] == b['p']['slug']) + (a['ar'] == b['ar']) + (_shape(a['ar']) == _shape(b['ar']))
            + (a['p'].get('label_kind') == b['p'].get('label_kind')) + (not a['own'] and not b['own']))


def _gap_cost(col, i, t):
    """What putting stand-in t before col[i] adds, at each width it shows at: its clashes with the two neighbours it
    gets there, less the clash of the pair it splits."""
    cost = 0.0
    for n in t['shows']:
        prev = next((x for x in reversed(col[:i]) if n in x['shows']), None)
        nxt = next((x for x in col[i:] if n in x['shows']), None)
        cost += _clash(prev, t) + _clash(t, nxt) - _clash(prev, nxt)    # never at an end: both neighbours exist
    return cost + 0.01 * i                 # a tie: the higher gap (on screen sooner)


def _columns(plan):
    """Each column's tiles in DOM order: [{kind, p, media, ar, own, lead, shows, repeat}], shows = the column counts
    (SHOWN) the tile is on screen at. The own tiles come from the plan; then, for 3 and for 2 columns, every tile of the
    column that goes is repeated (a stand-in) in the shown column with the fewest tiles there, in the gap where it fits
    best (_gap_cost) - never first (row 0 is the lead image) and never last (the ticker measures a list by its first
    and last items, which must show wherever the column does). One keyboard / screen-reader stop per project: a repeat
    of a project (fewer projects than slots) stays clickable but is skipped, decided over the own tiles; a stand-in
    takes its original's (the two never show at the same width)."""
    seen, cols = set(), []
    for c, col in enumerate(COLUMNS):
        tiles = []
        for r, ar in enumerate(col[3]):
            kind, p, media = plan[(c, r)]
            tiles.append({'kind': kind, 'p': p, 'media': media, 'ar': ar, 'own': True, 'lead': r == 0,
                          'shows': {n for n in SHOWN if c < n}, 'repeat': p['slug'] in seen})
            seen.add(p['slug'])
        cols.append(tiles)
    for n in SHOWN[1:]:                    # n columns shown: column index n goes
        for t in [t for t in cols[n] if n + 1 in t['shows']]:
            load = lambda c: (sum(n in x['shows'] for x in cols[c]), sum(1 / _ratio(x['ar']) for x in cols[c] if n in x['shows']), c)
            c = min(range(n), key=load)
            stand = dict(t, own=False, lead=False, shows={k for k in SHOWN if c < k <= n})
            col = cols[c]
            col.insert(min(range(1, len(col)), key=lambda i: _gap_cost(col, i, stand)), stand)
    return cols


def _media(ctx, t):
    p, media = t['p'], t['media']
    alt = f"{p['title']} — {p['industry']} website" + (f" ({projects.label_text(p)})" if p.get('label') else '')
    if t['kind'] == 'video':
        if t['own']:                       # decorative: the link carries the project name
            return lib.video(ctx, media, max_width=1280, poster_width=POSTER_W)
        posters = sorted(media.get('poster') or [], key=lambda v: v['width'])
        fit = [v for v in posters if v['width'] <= POSTER_W] or posters[:1]
        if fit:                            # a clip's stand-in: the poster frame its clip tile shows (the same files)
            return lib.media_img(ctx, {'variants': fit}, alt, sizes=TILE_SIZES)
        media = _best_still(p, _ratio(t['ar']), set())[0]
    # The lead tile of columns 1-2 (on screen at every width) is the gallery's first image and the phone's LCP: eager +
    # fetchpriority=high, painted from the first frame (no script reveal; its entrance is CSS, 20-hero.css).
    eager = t['lead'] and min(SHOWN) in t['shows']
    return lib.media_img(ctx, media['entry'], alt, sizes=TILE_SIZES, max_width=1280, eager=eager,
                         attrs=f'style="object-position:{projects.focal(p, media)}"')


def _item(ctx, t):
    p = t['p']
    name = f"View project: {p['title']} ({projects.label_text(p)})" if p.get('label') else None
    extra = 'tabindex="-1" aria-hidden="true"' if t['repeat'] else ''
    open_tag, close_tag = lib.project_tag(ctx, p, 'hero-tile', label=name, extra=extra)
    shows = '' if t['own'] else (' hero-col__item--lt1440' if 3 in t['shows'] else ' hero-col__item--lt800')
    box = 'hero-tile__media hero-tile__media--lead' if t['lead'] else 'hero-tile__media reveal-image'
    return (f'<li class="hero-col__item{shows}">{open_tag}'
            f'<span class="{box}" style="--ar:{t["ar"]}">{_media(ctx, t)}</span>{_cap(p["title"], p["industry"])}{_label(p)}'
            f'{close_tag}</li>')


def _gallery(ctx):
    plan = _plan()
    if not plan:
        return ''
    cols = []
    for n, ((direction, speed, hover, _), tiles) in enumerate(zip(COLUMNS, _columns(plan)), 1):
        cols.append(
            f'<div class="hero-col hero-col--{n}" data-ticker data-direction="{direction}" data-speed="{speed}" data-hover="{hover}">'
            f'<ul class="hero-col__list" data-ticker-list role="list">{"".join(_item(ctx, t) for t in tiles)}</ul></div>')
    handles = ''.join(f'<i class="hero-gallery__handle hero-gallery__handle--{c}" aria-hidden="true"></i>' for c in ('tl', 'tr', 'bl', 'br'))
    # WCAG 2.2.2: the gallery, marquee and statement pill move indefinitely, so the hero is a [data-motion-scope]
    # with the shared pause control (chrome.motion_toggle; shown only when motion is on; sticky below the header
    # while the frame is on screen, docked on the frame's right edge). First in the frame so keyboard users reach
    # it before the tiles.
    control = f'<div class="hero-gallery__ui">{chrome.motion_toggle(cls="hero-gallery__motion")}</div>'
    return (f'<div class="hero-gallery" data-hero-gallery role="group" aria-label="Selected projects">'
            f'{control}{"".join(cols)}{handles}</div>')


def render(ctx):
    # The H1 carries no [data-reveal]: it is painted (opaque) from the first frame and only rises
    # a few px in CSS (20-hero.css), so it never depends on the script to become visible.
    return f'''<section class="hero section" id="hero" aria-labelledby="hero-title" data-motion-scope>
  <div class="hero__inner">
    <div class="hero__lockup">
      {_pill(ctx)}
      <h1 class="hero__title" id="hero-title"><span class="hero__kicker">{E(HERO["kicker"])}</span> <span class="hero__headline">{E(_typo(HERO["title"]))}</span></h1>
      <div class="hero__copy" data-reveal data-appear style="--d:300ms;--y:80px">
        <p class="hero__lead">{E(fmt(HERO["lead"]))}</p>
        <p class="hero__body">{E(fmt(HERO["body"]))}</p>
      </div>
    </div>
    {_ctas(ctx)}
  </div>
  <div class="hero__media">
    {_marquee(ctx)}
    {_gallery(ctx)}
  </div>
</section>'''
