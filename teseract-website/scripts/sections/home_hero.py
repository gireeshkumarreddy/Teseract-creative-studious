"""Home — section 1: HERO (reference ref-hero-nav §4–10, gallery tiles after ZIP §4–5).

Structure (reference geometry at 1440):
  lockup   rotating statement pill (brand 3D mark avatar) · H1 · lead + body copy
  CTAs     "Start a Project" (dark, brand-mark lead that opens to "+ You") · "Explore Our Work" (light)
  badge    red pulsing dot + mono tagline
  media    services marquee (48px, horizontal ticker) + 1000px framed 4/3/2-column vertical tickers
           of the studio's own websites (portfolio.json "home_gallery": stills cropped to each slot by
           focal point, up to 7 clips - a project's portfolio.json "tile_clip" such as the six landing pages'
           16:9 loops and Aivinci's tiger, or a phone scroll); every tile links to its project page, and every
           project of the gallery is on screen at every width (stand-ins for the hidden columns, _columns(); a
           clip's stand-in plays the clip).

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
# shape); the projects that fill them come from portfolio.json "home_gallery" (shown projects only). Column 2's
# fourth slot is 16:9 (was the reference's 3:2; owner, 17 Oct: the six landing pages' 16:9 loops and the tiger take
# one landscape slot each with little crop - six exact 16:9 slots and the 3:2 of column 4 for the tiger, whose frame
# is centred; a 3:2 crop cut a landing page's wordmark and header button off its loop).
L169, L43, SQ, P45 = '16/9', '4/3', '1/1', '4/5'
COLUMNS = [
    ('down', 25, 0.8, [L43, P45, L169, SQ, L43]),
    ('up', 34, 0.9, [SQ, L169, P45, L169, SQ]),
    ('down', 30, 0.9, ['7/5', P45, L169, SQ, L169]),
    ('up', 25, 0.8, [L43, P45, L169, '5/4', '3/2']),
]

TILE_SIZES = '(min-width:1440px) 316px, (min-width:800px) 30vw, 46vw'

# Clips replace up to MAX_VIDEO_TILES tiles: the first projects of the gallery that have one (portfolio.json "tile_clip",
# else the hero.mp4 phone scroll). Owner, 17 Oct (DARK-THEME.md): the six landing-page concepts lead the gallery and
# every one of their tiles plays its own clip (hero first, then the second section), and Aivinci's tiger keeps moving -
# 7 clips. They are placed together (_video_slots): spread over the columns as evenly as they go (two at most in a
# column, never two stacked, never the lead tile), each in a slot that suits its shape - the slot keeps its aspect ratio
# and the clip covers it, so a clip only takes a slot within MAX_CLIP_CROP of its own frame (log ratio 0.5 = 1.65x: a
# 16:9 desktop loop never goes into a square tile, a 4:5 phone scroll never into a landscape one) - with the least crop
# in all. A project with several clips (the landing pages: the 16:9 tile.mp4, then the phone hero.mp4, whose 4:5 tile
# crop cuts the site's header and headline) plays the first unless a later one crops CLIP_PREFERENCE less. Ties go to
# the earlier projects in the higher, more left slot (columns 1-2 are what a phone shows from the first paint).
VIDEO_SLOTS = (1, 2, 3, 4)
MAX_VIDEO_TILES = 7
MAX_CLIP_CROP = 0.5
CLIP_PREFERENCE = 0.3
POSTER_W = 640             # a clip tile's poster: the 480 / 640 frames (cropped to the tile shape) cover 316px at 2x

# Fewer columns show on smaller screens (20-hero.css: column 4 from 1440px, column 3 from 800px). So that every project
# of the gallery is on every screen (owner, 15 Oct: the phone "has to be exactly the same" as the desktop), a hidden
# column's tiles are repeated in the columns still shown: below 1440px column 4's tiles join columns 1-3, below 800px
# column 3's (with the one it took from column 4) join columns 1-2 - ten tiles each on a phone, still one ticker
# transform per column. A stand-in shows only at those widths (.hero-col__item--lt1440 / --lt800) and keeps its
# original's slot shape and image file: where the original is on screen the browser already has that file (the
# tickers' clones load every tile). A clip's stand-in plays the clip (owner, 17 Oct: the six landing pages and the tiger
# move on phones too): its <video> waits in a <template> next to the <noscript> poster frame, and as the original's
# column is hidden there, a screen loads only the clips it shows, each only once on screen (06-video.js). With
# motion the stand-ins sit out the page's first layout and 20-hero.js lets them in from the page's start, off screen,
# and only then loads their images (held in <noscript>; after load) or puts in their clip; without JS they are plain
# tiles (a clip's: its poster) from the start. A repeat (fewer projects than slots) needs no stand-in (_plan).
SHOWN = (4, 3, 2)          # columns on screen at >= 1440px, 800-1439px, < 800px
FIRST_LOOP = 3             # _gap_cost: a stand-in above a column's first landing-page loop on a phone


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


def _clip_fit(p, ar):
    """(cost, clip) of the project's clip that suits a slot of aspect ar best, or None when none is within MAX_CLIP_CROP:
    the crop (log ratio of the slot's and the encoded frame's aspects - a phone scroll is prepared as 4:5), plus
    CLIP_PREFERENCE for a later clip of its list."""
    best = None
    for k, clip in enumerate(p.get('tile_clips') or ()):
        v = max(clip['variants'], key=lambda x: x['width'])
        crop = abs(math.log(ar * v['height'] / v['width']))
        if crop <= MAX_CLIP_CROP + 1e-9 and (not best or crop + CLIP_PREFERENCE * (k > 0) < best[0] - 1e-9):
            best = (crop + CLIP_PREFERENCE * (k > 0), clip)
    return best


def _video_slots(pool):
    """{(column, tile): (project, clip)} for the first MAX_VIDEO_TILES projects of the pool with a clip that suits a slot.
    A search over the ways to seat them all (as many clips in a column as an even spread allows, never in neighbouring
    tiles of a column, never the lead tile): the least crop in all; of equal ones, project by project in the curated
    order, the higher and then the more left slot (the search visits them in that order and keeps the first)."""
    slots = sorted(((c, t) for c, col in enumerate(COLUMNS) for t in VIDEO_SLOTS if t < len(col[3])), key=lambda ct: (ct[1], ct[0]))
    clips = []
    for p in pool:
        fits = {s: f for s in slots for f in [_clip_fit(p, _ratio(COLUMNS[s[0]][3][s[1]]))] if f}
        if fits:                            # else no slot suits its clip: its tiles stay stills
            clips.append((p, fits))
        if len(clips) == MAX_VIDEO_TILES:
            break
    while clips:
        n = len(clips)
        cap = -(-n // len(COLUMNS))         # clips per column: as even a spread as n allows
        rest = [sum(min(f[0] for f in fits.values()) for _, fits in clips[i:]) for i in range(n + 1)]   # lower bounds
        best = []

        def seat(i, used, total, per_col):
            if best and total + rest[i] >= best[0] - 1e-9:
                return
            if i == n:
                best[:] = [total, list(used)]
                return
            fits = clips[i][1]
            for c, t in slots:
                if (c, t) in fits and (c, t) not in used and per_col[c] < cap and (c, t - 1) not in used and (c, t + 1) not in used:
                    per_col[c] += 1
                    used.append((c, t))
                    seat(i + 1, used, total + fits[(c, t)][0], per_col)
                    used.pop()
                    per_col[c] -= 1

        seat(0, [], 0.0, [0] * len(COLUMNS))
        if best:
            return {s: (p, fits[s][1]) for (p, fits), s in zip(clips, best[1])}
        clips.pop()                         # no seating for all of them: the last one's tiles stay stills
    return {}


def _best_still(p, ar, used):
    """The project's still that suits a slot of aspect `ar` best (closest aspect, earlier gallery screens
    first), preferring stills not used yet in the gallery. Returns (still, aspect error)."""
    stills = p['stills']
    fresh = [s for s in stills if s['role'] not in used] or stills
    best = min(fresh, key=lambda s: abs(math.log(s['w'] / s['h'] / ar)) + 0.01 * stills.index(s))
    return best, abs(math.log(best['w'] / best['h'] / ar))


def _plan():
    """{(column, tile): ('video', project, clip) | ('still', project, still)} for every slot. Videos first;
    then each still slot, row by row, takes the project that is not near it, plays no clip (a repeat of a clip project
    would be one of its tiles standing still), has been used least, has a still that fits the slot's shape (a phone
    screen for a portrait slot) and comes first in the curated order. Near = any tile of the slot's own and the
    neighbouring columns: they slide past each other at their own speeds, and a column's last tile runs on into its lead.
    With fewer projects than slots (while landing pages wait for their media), the repeats are kept for the slots of the
    columns smaller screens hide first - column 4 (its lead last), then 3 - where a repeat needs no stand-in (_columns):
    a tablet and a phone show every project once, and at 1440px a repeat is never beside another tile of its project
    (owner, 15 Oct: the phone "has to be exactly the same" - every project, and no project twice side by side)."""
    pool = projects.curated('home_gallery') or projects.PROJECTS
    if not pool:
        return {}
    plan = {k: ('video', p, e) for k, (p, e) in _video_slots(pool).items()}
    clipped = {p['slug'] for _, p, _ in plan.values()}   # a repeat is never a clip project's (its tiles all move)
    uses = {p['slug']: 0 for p in pool}
    for _, p, _ in plan.values():
        uses[p['slug']] += 1
    used = {p['slug']: set() for p in pool}
    rank = {p['slug']: i for i, p in enumerate(pool)}
    free = [(c, r) for r in range(max(len(col[3]) for col in COLUMNS)) for c, col in enumerate(COLUMNS)
            if r < len(col[3]) and (c, r) not in plan]
    spare = max(0, len(free) - sum(p['slug'] not in clipped for p in pool))     # slots more than projects: repeats
    repeats = sorted(free, key=lambda k: (-k[0], k[1] == 0, -k[1]))[:spare]
    for c, r in [k for k in free if k not in repeats] + repeats:
        ar = _ratio(COLUMNS[c][3][r])
        near = {p['slug'] for (c2, _), (_, p, _) in plan.items() if abs(c2 - c) <= 1}
        fits = {p['slug']: _best_still(p, ar, used[p['slug']]) for p in pool}
        p = min(pool, key=lambda q: (q['slug'] in near, q['slug'] in clipped, uses[q['slug']], fits[q['slug']][1] > 0.45,
                                     rank[q['slug']]))
        still = fits[p['slug']][0]
        plan[(c, r)] = ('still', p, still)
        uses[p['slug']] += 1
        used[p['slug']].add(still['role'])
    return plan


def _shape(ar):
    r = _ratio(ar)
    return 'wide' if r >= 1.7 else 'landscape' if r > 1.15 else 'square' if r >= 0.9 else 'portrait'


def _clash(a, b):
    """How badly two neighbouring tiles go together: the same project, two clips (never stacked in a column, phones
    too: a clip's stand-in plays it), the same slot shape (or family of shapes), the same kind (client / concept), two
    stand-ins (they spread between the own tiles)."""
    return (4 * (a['p']['slug'] == b['p']['slug']) + 4 * (a['kind'] == b['kind'] == 'video') + (a['ar'] == b['ar'])
            + (_shape(a['ar']) == _shape(b['ar'])) + (a['p'].get('label_kind') == b['p'].get('label_kind'))
            + (not a['own'] and not b['own']))


def _clip_name(clip):
    """A clip's name (prepare_media.py: <name>-<width>.mp4): 'tile' = a landing page's 16:9 loop, 'tiger', 'hero'."""
    return clip['variants'][0]['file'].rsplit('/', 1)[-1].rsplit('-', 1)[0]


def _loop(t):
    """The tile plays a landing page's 16:9 loop (its site's hero, then its second section)."""
    return t['kind'] == 'video' and _clip_name(t['media']) == 'tile'


def _gap_cost(col, i, t):
    """What putting stand-in t before col[i] adds, at each width it shows at: its clashes with the two neighbours it
    gets there, less the clash of the pair it splits; on a phone also FIRST_LOOP when it would push the column's first
    landing-page loop further down (owner, 17 Oct: the six lead the gallery - a phone sees one in each column among its
    first tiles; a loop's own stand-in may go there)."""
    cost = 0.0
    for n in t['shows']:
        prev = next((x for x in reversed(col[:i]) if n in x['shows']), None)
        nxt = next((x for x in col[i:] if n in x['shows']), None)
        cost += _clash(prev, t) + _clash(t, nxt) - _clash(prev, nxt)    # never at an end: both neighbours exist
        if (n == min(SHOWN) and not _loop(t) and not any(_loop(x) for x in col[:i] if n in x['shows'])
                and any(_loop(x) for x in col[i:] if n in x['shows'])):
            cost += FIRST_LOOP
    return cost + 0.01 * i                 # a tie: the higher gap (on screen sooner)


def _columns(plan):
    """Each column's tiles in DOM order: [{kind, p, media, ar, own, lead, shows, repeat}], shows = the column counts
    (SHOWN) the tile is on screen at. The own tiles come from the plan; then, for 3 and for 2 columns, every tile of the
    column that goes (but a repeat of a project those columns show already) is repeated (a stand-in) in the shown
    column with the fewest tiles there (a clip: of those, the one
    with the fewest clips), in the gap where it fits best (_gap_cost) - never first (row 0 is the lead image) and never
    last (the ticker measures a list by its first and last items, which must show wherever the column does). The clips
    go in after the stills, whose stand-ins open gaps between the own clips (no two clips stacked). One keyboard /
    screen-reader stop per project: a repeat of a project (fewer projects than slots) stays clickable but is skipped,
    decided over the own tiles; a stand-in takes its original's (the two never show at the same width)."""
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
        for t in sorted((t for t in cols[n] if n + 1 in t['shows']), key=lambda t: t['kind'] == 'video'):
            if t['repeat'] and any(n in x['shows'] and x['p']['slug'] == t['p']['slug'] for col in cols[:n] for x in col):
                continue                   # a repeat of a project these columns show already: no stand-in (_plan)
            load = lambda c: (sum(n in x['shows'] for x in cols[c]),
                              sum(n in x['shows'] and x['kind'] == 'video' for x in cols[c]) if t['kind'] == 'video' else 0,
                              sum(1 / _ratio(x['ar']) for x in cols[c] if n in x['shows']), c)

            def seat(c):                   # ((stacked, first row), gap, stand-in): column c's best gap
                stand = dict(t, own=False, lead=False, shows={k for k in SHOWN if c < k <= n})
                col = cols[c]
                key = lambda i: (t['kind'] == 'video' and _stacked(col, i, stand), _first_row(col, i, stand),
                                 _gap_cost(col, i, stand))
                i = min(range(1, len(col)), key=key)
                return key(i)[:2], i, stand
            # 18 Oct (all six landing pages in): a clip's stand-in goes beside no other clip, a stand-in not right under a
            # lead tile at 3 columns where another gap is free - in the least loaded column that allows it (Emberpost's
            # had gone straight above Sagewell's own clip in column 2 at 834px, under its lead tile: two clips stacked, and
            # on screen from the page's start, so it came in only ~7 s later, once its place had left the screen)
            c = min(range(n), key=lambda c: (seat(c)[0], load(c)))
            _, i, stand = seat(c)
            cols[c].insert(i, stand)
    return cols


def _first_row(col, i, t):
    """True when stand-in t before col[i] would come right under the column's lead tile at 3 columns: in portrait a
    tablet (834px) has the gallery's first row on screen at the page's start, and a stand-in comes in only once none of
    its places is on screen (20-hero.js standIns) - there, seconds later."""
    n = SHOWN[1]
    prev = next((x for x in reversed(col[:i]) if n in x['shows']), None)
    return n in t['shows'] and bool(prev and prev['lead'])


def _stacked(col, i, t):
    """True when stand-in t before col[i] would sit next to a clip at a width it shows at (never two clips stacked in
    a column: owner, 17 Oct)."""
    for n in t['shows']:
        prev = next((x for x in reversed(col[:i]) if n in x['shows']), None)
        nxt = next((x for x in col[i:] if n in x['shows']), None)
        if any(x and x['kind'] == 'video' for x in (prev, nxt)):
            return True
    return False


def _media(ctx, t):
    """(media, clip): the tile's image or clip; a clip's stand-in gives its poster frame and, apart, its clip (_item)."""
    p, media = t['p'], t['media']
    alt = f"{p['title']} — {p['industry']} website" + (f" ({projects.label_text(p)})" if p.get('label') else '')
    if t['kind'] == 'video':
        if t['own']:                       # decorative: the link carries the project name
            return lib.video(ctx, media, max_width=1280, poster_width=POSTER_W), ''
        posters = sorted(media.get('poster') or [], key=lambda v: v['width'])
        fit = [v for v in posters if v['width'] <= POSTER_W] or posters[:1]
        if fit:                            # a clip's stand-in: the poster frame its clip tile shows (the same files) + the clip
            return (lib.media_img(ctx, {'variants': fit}, alt, sizes=TILE_SIZES),
                    lib.video(ctx, media, max_width=1280, poster_width=POSTER_W, still=False))
        media = _best_still(p, _ratio(t['ar']), set())[0]
    # The lead tile of columns 1-2 (on screen at every width) is the gallery's first image and the phone's LCP: eager +
    # fetchpriority=high, painted from the first frame (no script reveal; its entrance is CSS, 20-hero.css).
    eager = t['lead'] and min(SHOWN) in t['shows']
    return lib.media_img(ctx, media['entry'], alt, sizes=TILE_SIZES, max_width=1280, eager=eager,
                         attrs=f'style="object-position:{projects.focal(p, media)}"'), ''


def _item(ctx, t):
    p = t['p']
    name = f"View project: {p['title']} ({projects.label_text(p)})" if p.get('label') else None
    # the slot's aspect (--ar) sits on the tile: its media box takes it, and a loop's foot label is placed by it
    extra = f'style="--ar:{t["ar"]}"' + (' tabindex="-1" aria-hidden="true"' if t['repeat'] else '')
    # A landing page's loop (owner, 17 Oct) opens every frame with its site's nav and headline, which the label pill in
    # the top corner covered on phones: its labels sit at the foot of the frame instead (.hero-tile--loop, 20-hero.css).
    cls = 'hero-tile hero-tile--loop' if _loop(t) else 'hero-tile'
    open_tag, close_tag = lib.project_tag(ctx, p, cls, label=name, extra=extra)
    shows = '' if t['own'] else (' hero-col__item--lt1440' if 3 in t['shows'] else ' hero-col__item--lt800')
    box = 'hero-tile__media hero-tile__media--lead' if t['lead'] else 'hero-tile__media reveal-image'
    media, clip = _media(ctx, t)
    if not t['own']:                       # a stand-in's image waits in <noscript> until 20-hero.js lets the tile in (no
        media = f'<noscript>{media}</noscript>'   # download before; the ticker's copies of it too); without JS it is a plain <img>
        if clip:                           # ... and a clip's stand-in plays the clip: 20-hero.js puts the <video> from this
            media += f'<template data-clip>{clip}</template>'   # inert <template> in place of the poster frame (owner, 17 Oct)
    return (f'<li class="hero-col__item{shows}">{open_tag}'
            f'<span class="{box}">{media}</span>{_cap(p["title"], p["industry"])}{_label(p)}'
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
