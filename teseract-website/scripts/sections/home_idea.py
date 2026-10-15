"""Home — section 2: THE IDEA (image 2, spec _ref/specs/image2-idea-section.md).

A live reproduction of the poster: top-right studio label, giant light two-line headline,
a gloved hand pinching thin strings out to the four disciplines, the left copy column and a
laptop on stone blocks whose screen cycles through our own project work.

Coordinate system: desktop/tablet render one artboard with the poster's aspect (1600 x 1999).
Strings are an SVG with that exact viewBox; the hand, labels and laptop are placed in % of the
same box, so every string stays attached to the pinch point and to its label dot at any width.
Phone re-lays the diagram in its own 375 x 340 box (spec section 6) and stacks everything else.

Copy: content.HOME['idea'] only. Brand label: CONFIG['brand_full'].
"""
import lib
from lib import E, CONFIG
import content
import projects

IDEA = content.HOME['idea']

# Board space (poster px @1600 wide). Pinch point = LSQ intersection of the fitted strings.
BW, BH = 1600, 1999
P = (281.95, 571.88)
# Phone diagram space (spec section 6, re-layout): hand 150 px wide at (0, 24) => pinch (119.5, 96.8).
MW, MH = 375, 340
PM = (119.5, 96.8)

# id, board end, board colour, phone end, phone colour, end marker ('dot' | 'tick' | 'pin' | None), discipline index.
# Colours are the greys measured on the (white) poster; _ink() turns each into soft white at the
# matching prominence for the black theme (darker grey on white = stronger white line on black).
STRINGS = [
    ('a',  (427.5, 50.5),   '#BABABA', (145.0, 5.3),   '#BDBDBD', 'tick', None),
    ('b',  (461.0, 434.5),  '#898989', (210.7, 26.8),  '#8C8C8C', 'dot', 0),
    ('b2', (417.6, 478.0),  'fade',    (182.0, 52.0),  'fade',    None, None),
    ('c',  (699.9, 601.4),  '#969696', (269.1, 107.3), '#969696', 'dot', 1),
    ('d',  (1196.0, 759.2), '#8D8D8D', (281.8, 162.4), '#8D8D8D', 'dot', 2),
    # E tucks 3px under the laptop lid's top edge (lid top y 874, poster). 21-idea.js keeps it docked
    # there when the laptop moves (scroll-linked rise, >1760px wide screens) - see LID below.
    ('e',  (898.7, 877.0),  '#B2B2B2', (375.0, 311.0), 'fade',    None, None),
    ('f',  (187.2, 740.8),  '#626262', (73.4, 179.9),  '#6A6A6A', 'dot', None),
    ('g',  (298.7, 792.7),  '#8E8E8E', (130.7, 246.4), '#8E8E8E', 'pin', 3),
    ('h',  (281.0, 959.5),  '#838383', (119.5, 321.8), '#838383', 'end', None),
]
# String E's dock on the lid (board px): rest point on the lid's top edge, lid top-left corner x.
LID = (892.7, 874.0, 587.0)

# Label offsets from their dot, in em of the label's own font size (measured on the poster):
# dot centre sits ~0.5em left of the first glyph, vertically on the first line's cap height;
# TECHNOLOGY hangs below-right of its pin.
TAG_OFFSETS = {0: ('.43em', '-.53em', 'two'), 1: ('.55em', '-.42em', 'one'), 2: ('.6em', '-.42em', 'one'), 3: ('.35em', '.4em', 'two')}

# Laptop crop (idea-laptop-*.webp, 1435 x 1131) and the display quad inside it (spec 4.1).
# Black theme: the page uses the *-dk cut-outs (hand, laptop base, lid overlay), re-matted against the
# poster white so no light fringe outlines them on the dark sheet - see _work/dk-hero/make_dark_mattes.py.
LAP_W, LAP_H = 1435, 1131
QUAD = [(434.85, 19.92), (1310.59, 20.97), (1307.93, 617.13), (438.42, 580.78)]   # TL, TR, BR, BL
BEZEL = (412, 0, 1336, 632)            # lid overlay box inside the laptop crop (see _work/idea/make_assets.py)
SCREEN_AR = 1.547                      # 16" display (3456 x 2234) — the media plane is warped onto QUAD

def _n(v):
    return f'{v:.2f}'.rstrip('0').rstrip('.')


INK = '#F4F4F2'          # = --ink


def _prominence(hex_grey):
    """0 (white) .. 1 (black): how strongly a poster grey stood out on the white poster."""
    return (255 - int(hex_grey.lstrip('#')[:2], 16)) / 255


def _ink(hex_grey, lo=.1, span=.4):
    """Poster grey on white -> soft-white opacity on black (strings land at ~.2-.35)."""
    return round(lo + _prominence(hex_grey) * span, 3)


def _halves(line):
    """Split a headline line at the space nearest its middle (phone shows 4 lines)."""
    words = line.split(' ')
    if len(words) < 2:
        return [line]
    best, cut = None, 1
    for i in range(1, len(words)):
        d = abs(len(' '.join(words[:i])) - len(line) / 2)
        if best is None or d < best:
            best, cut = d, i
    return [' '.join(words[:cut]), ' '.join(words[cut:])]


def _title():
    lines, h = [], 0
    for li, line in enumerate(IDEA['title']):
        parts = []
        for half in _halves(line):
            parts.append(f'<span class="idea__m" style="--h:{h}"><span class="idea__mi">{E(half)}</span></span>')
            h += 1
        lines.append(f'<span class="idea__line" style="--l:{li}">{" ".join(parts)}</span>')
    return ' '.join(lines)


# Approximate Helvetica/Geist advance widths (1/1000 em) used only to reproduce the poster's line
# breaks at build time; the browser never wraps these lines (white-space:nowrap on desktop).
_ADV = {' ': 278, '’': 222, "'": 191, ',': 278, '.': 278, '-': 333, 'i': 222, 'j': 222, 'l': 222, 'f': 278,
        't': 278, 'r': 333, 'm': 833, 'w': 722, 'c': 500, 'k': 500, 's': 500, 'v': 500, 'x': 500, 'y': 500,
        'z': 500, 'I': 278, 'W': 944, 'M': 833}


def _em(s):
    return sum(_ADV.get(c, 556) - 60 for c in s) / 1000


def _wrap(text, measure):
    out, cur = [], ''
    for word in text.split(' '):
        nxt = (cur + ' ' + word).strip()
        if cur and _em(nxt) > measure:
            out.append(cur)
            cur = word
        else:
            cur = nxt
    return out + ([cur] if cur else [])


def _copy_lines():
    """Paragraph 1: one sentence per line, kept whole when it fits the column (15.5em), otherwise
    wrapped at 14em. Paragraph 2: natural wrap at the poster's narrower 12.5em measure."""
    p1 = []
    for s in IDEA['lines']:
        p1 += [s] if _em(s) <= 15.5 else _wrap(s, 14)
    return p1, _wrap(IDEA['body'], 12.5)


def _label_html(text):
    """Two-line labels break before 'and' (poster). Source casing is kept in the DOM (screen readers
    read words, not shouted letters); CSS sets the poster's uppercase."""
    words = text.split(' ')
    low = [w.lower() for w in words]
    if 'and' in low[1:]:
        k = low.index('and', 1)
        return E(' '.join(words[:k])) + '<br>' + E(' '.join(words[k:]))
    return E(text)


def _svg(kind):
    """kind 'board' (poster space) or 'phone' (re-laid diagram)."""
    W, H = (BW, BH) if kind == 'board' else (MW, MH)
    px, py = P if kind == 'board' else PM
    defs, lines, dots = [], [], []
    for i, (sid, bend, bcol, mend, mcol, marker, _tag) in enumerate(STRINGS):
        (ex, ey), col = (bend, bcol) if kind == 'board' else (mend, mcol)
        if col == 'fade':
            gid = f'idea-fade-{kind}-{sid}'
            base = _ink('#B4B4B4' if sid == 'e' else '#C9C9C9')
            defs.append(f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{_n(px)}" y1="{_n(py)}" x2="{_n(ex)}" y2="{_n(ey)}">'
                        f'<stop offset="0" stop-color="{INK}" stop-opacity="{base}"/>'
                        f'<stop offset="{".55" if sid == "e" else ".2"}" stop-color="{INK}" stop-opacity="{base}"/>'
                        f'<stop offset="1" stop-color="{INK}" stop-opacity="0"/></linearGradient>')
            paint = f'stroke="url(#{gid})"'
        else:
            paint = f'stroke="{INK}" stroke-opacity="{_ink(col)}"'
        dock = f' data-idea-e="{",".join(_n(v) for v in LID)}"' if (sid == 'e' and kind == 'board') else ''
        lines.append(f'<line class="idea__str" style="--i:{i}" x1="{_n(px)}" y1="{_n(py)}" x2="{_n(ex)}" y2="{_n(ey)}" {paint}{dock}/>')
        if marker:
            # label dots: solid ink (the poster's black dots); tick/pin/end: softer, like their strings
            r, op = {'dot': (2.5, 1), 'tick': (2, _ink('#AFAFAF', .2, .7)), 'pin': (1.6, _ink('#7A7A7A', .2, .7)),
                     'end': (1.3, _ink('#828282', .2, .7))}[marker]
            if kind == 'phone':
                r = {'dot': 2.1, 'tick': 1.5, 'pin': 1.3, 'end': 1.1}[marker]
            fill = f'fill="{INK}"' + (f' fill-opacity="{op}"' if op < 1 else '')
            dots.append(f'<circle class="idea__dot" style="--i:{i}" cx="{_n(ex)}" cy="{_n(ey)}" r="{r}" {fill}/>')
    return (f'<svg class="idea__strings idea__strings--{kind}" viewBox="0 0 {W} {H}" preserveAspectRatio="none" '
            f'aria-hidden="true" focusable="false" style="--ox:{_n(px)}px;--oy:{_n(py)}px">'
            f'<defs>{"".join(defs)}</defs>'
            f'<g class="idea__strs" fill="none" stroke-width="1" stroke-linecap="round">{"".join(lines)}</g>'
            f'<g class="idea__dots">{"".join(dots)}</g></svg>')


def _tags():
    items = []
    for i, (sid, bend, _bc, mend, _mc, _m, tag) in enumerate(STRINGS):
        if tag is None or tag >= len(IDEA['disciplines']):
            continue
        ox, oy, size = TAG_OFFSETS[tag]
        style = (f'--x:{_n(bend[0])};--y:{_n(bend[1])};--mx:{_n(mend[0])};--my:{_n(mend[1])};'
                 f'--tx:{ox};--ty:{oy};--i:{i}')
        items.append(f'<li class="idea__tag idea__tag--{size} idea__tag--{sid}" style="{style}">{_label_html(IDEA["disciplines"][tag])}</li>')
    return f'<ul class="idea__tags" role="list" aria-label="Disciplines we combine">{"".join(items)}</ul>'


def _laptop_list():
    """[(project, laptop clip)] for the screen, in the curated portfolio.json "home_laptop" order (owner, 14 Oct: only
    the VYRN launch film), at most 4: a shown project's home_laptop film (projects.py: its "home_laptop_clip" - VYRN's
    film, which its own project page skips - else its laptop clip), a slug without a project page (no portfolio.json
    entry) directly from the manifest."""
    out = []
    for slug in projects.DATA.get('home_laptop') or []:
        p = projects.by_slug(slug)
        if p and p['home_laptop']:
            out.append((p, p['home_laptop']))
        elif not p and slug not in {e['slug'] for e in projects.CATALOGUE} and slug not in projects.EXCLUDED:
            mp = lib.media_entry(slug)
            entry = ((mp or {}).get('media') or {}).get('laptop') or {}
            if entry.get('variants'):
                out.append((lib.media_project(mp), entry))
    return out[:4]


def _still_list():
    """Fallback without any recording: the cover stills of the curated (then all) shown projects, at most 4."""
    seen, out = set(), []
    for p in [projects.by_slug(s) for s in projects.DATA.get('home_laptop') or []] + projects.curated('home_gallery'):
        if p and p['slug'] not in seen and p['cover']['frame'] == 'desktop':
            seen.add(p['slug'])
            out.append(p)
    return out[:4]


def _slides(ctx):
    # Same slide shell for clips and stills (warp, cross-fade, inert, View Project link); the media fills
    # the screen (object-fit:cover) and 21-idea.js plays only the active slide's video.
    vids = _laptop_list()
    out = []
    for n, (p, entry) in enumerate(vids):
        if projects.by_slug(p['slug']) and entry is p.get('laptop'):
            label = (f'{p["title"]}' + (f' — {p["industry"]}' if p.get('industry') else '') + ' website on the laptop screen'
                     + (f' ({projects.label_text(p)})' if p.get('label') else ''))
        elif projects.by_slug(p['slug']):    # a "home_laptop_clip": the owner's VYRN launch film of his concept site
            label = f'{p["title"]} launch film on the laptop screen ({projects.label_text(p)})'
        else:                            # no project page: a film straight from the manifest
            label = f'{p["title"]} launch film on the laptop screen'
        media = lib.video(ctx, entry, label, cls='idea-slide__img idea-slide__video')
        cls = 'idea-slide' + (' is-active' if n == 0 else '')
        open_tag, close_tag = lib.project_tag(ctx, p, cls, extra=f'data-idea-slide{"" if n == 0 else " inert"}')
        out.append(f'{open_tag}{media}{close_tag}')
    if out:
        return ''.join(out), len(out)
    for n, p in enumerate(_still_list()):
        c = p['cover']
        sizes = '(min-width:1760px) 963px, (min-width:800px) 55vw, 75vw'
        img = lib.media_img(ctx, c['entry'], f'{p["title"]} — {p["industry"]} website on the laptop screen', sizes=sizes,
                            cls='idea-slide__img idea-slide__still', max_width=2560)
        cls = 'idea-slide' + (' is-active' if n == 0 else '')
        open_tag, close_tag = lib.project_tag(ctx, p, cls, extra=f'data-idea-slide{"" if n == 0 else " inert"}')
        out.append(f'{open_tag}{img}{close_tag}')
    return ''.join(out), len(out)


def _laptop(ctx):
    k = 960 / LAP_W
    base = (f'<img class="idea__lap-base" src="{ctx.asset("assets/idea/idea-laptop-base-dk.webp")}" '
            f'srcset="{ctx.asset("assets/idea/idea-laptop-base-dk-960.webp")} 960w, {ctx.asset("assets/idea/idea-laptop-base-dk.webp")} {LAP_W}w" '
            f'sizes="(min-width:1760px) 1579px, (min-width:800px) 90vw, 122vw" width="{LAP_W}" height="{LAP_H}" '
            f'alt="A laptop resting on rough stone blocks, its screen showing our project work" loading="lazy" decoding="async">')
    bw, bh = BEZEL[2] - BEZEL[0], BEZEL[3] - BEZEL[1]
    bez_style = (f'left:{_n(BEZEL[0] / LAP_W * 100)}%;top:{_n(BEZEL[1] / LAP_H * 100)}%;'
                 f'width:{_n(bw / LAP_W * 100)}%')
    bezel = (f'<img class="idea__lap-bezel" src="{ctx.asset("assets/idea/idea-laptop-bezel-dk.webp")}" '
             f'srcset="{ctx.asset("assets/idea/idea-laptop-bezel-dk-960.webp")} {round(bw * k)}w, {ctx.asset("assets/idea/idea-laptop-bezel-dk.webp")} {bw}w" '
             f'sizes="(min-width:1760px) 1017px, (min-width:800px) 58vw, 79vw" width="{bw}" height="{bh}" style="{bez_style}" '
             f'alt="" loading="lazy" decoding="async">')
    quad = ';'.join(f'{x / LAP_W:.5f},{y / LAP_H:.5f}' for x, y in QUAD)
    slides, n = _slides(ctx)
    # one slide (owner, 14 Oct: only the VYRN film): a plain pause button for the looping video, no "01/01" count
    count = (f'<span class="idea__toggle-count" aria-hidden="true"><b data-idea-count>01</b>/{n:02d}</span>' if n > 1 else '')
    toggle = (f'<button class="idea__toggle" type="button" aria-pressed="false" data-idea-toggle hidden>'
              f'<span class="idea__toggle-ic" aria-hidden="true"><i></i><i></i></span>{count}'
              f'<span class="sr-only">{"Pause the project slideshow" if n > 1 else "Pause the video"}</span></button>')
    screen = ('role="group" aria-roledescription="slideshow" aria-label="Selected projects"' if n > 1
              else 'role="group" aria-label="Project film"')
    return (f'<div class="idea__laptop" data-reveal style="--y:80px;--d:120ms">'
            f'<div class="idea__device" data-idea-device data-quad="{quad}" data-ar="{SCREEN_AR}">'
            f'{base}<div class="idea-screen" data-idea-screen {screen}>'
            f'{slides}</div>{bezel}{toggle}</div></div>')


def render(ctx):
    # brand name as configured (logo spelling) + "Creative Studios"; CSS sets the poster's uppercase
    brand = CONFIG['brand_full'].split(' ', 1)
    label = '<br>'.join(E(s) for s in brand)
    hand = lib.img(ctx, 'assets/idea/idea-hand-dk.webp', '', w=354, h=303, cls='idea__hand')
    p1, p2 = _copy_lines()
    # The copy column reveals as ONE group (21-idea.js observes the block): lines rise in a
    # staggered cascade, the second paragraph one beat later. Per-line observers made the lower
    # lines wait for both the scroll and their stagger delay, and could be skipped on fast jumps.
    ln = lambda s, d: f'<span class="idea__ln" style="--d:{d}ms">{E(s)}</span>'
    copy = (f'<div class="idea__copy" data-idea-copy>'
            f'<p class="idea__p">{" ".join(ln(s, 80 + i * 70) for i, s in enumerate(p1))}</p>'
            f'<p class="idea__p">{" ".join(ln(s, 80 + (len(p1) + i) * 70 + 60) for i, s in enumerate(p2))}</p></div>')
    return f'''<section class="idea section" id="idea" aria-labelledby="idea-title" data-idea>
  <div class="idea__board">
    <p class="idea__brand" data-reveal="fade" style="--d:200ms">{label}</p>
    <h2 class="idea__title" id="idea-title" data-idea-title>{_title()}</h2>
    <div class="idea__diagram" data-idea-diagram>
      {_svg('board')}{_svg('phone')}
      {hand}
      {_tags()}
    </div>
    {copy}
    {_laptop(ctx)}
  </div>
</section>'''
