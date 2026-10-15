"""FOUNDER blocks ("Portrait in light"): shared by Who We Are (#founder, #why in pages/who.py) and the home teaser
(#founder-teaser, sections/home_founder.py). Copy: content.WHO['founder'] / WHO['why'], the owner's text (15 Oct,
_ref/specs/founder-content.md), word for word; nothing here adds a fact.

The person is a 4:5 hairline plate: his photo (owner, 15 Oct, supplied as his poster; the text-free portrait cut
from it is scripts/supplied.json 'founder-portrait', FOUNDER_PORTRAIT) under his name as a nameplate, lit by the
hero's warm light (rgb 255,118,46), which follows a finger or the mouse. Without the photo the plate falls back to a
faint texture of his four disciplines. The name is "Gireesh" only (owner, 15 Oct). His journey is a split-flap departure board ("from" / "to")
with a route strip whose four stops are the four shards of logo-mark.svg; the real three-line headline drives it.

Colour carries meaning: ORANGE (--fdr-accent, the hero's light) = the person; RED (--red) = sameness only.
Builders take an optional attrs string appended to their root tag (data-reveal etc.). guard() fails the build when
the rendered visible text differs from the content. CSS: src/css/26-founder.css, JS: src/js/26-founder.js.
"""
import re
from html.parser import HTMLParser

import lib
from lib import E, fmt, BRAND
from content import WHO
import chrome_intro as CI

_PHOTO = lib.supplied('founder-portrait')   # prepared by scripts/prepare_supplied.py (never upscaled)
FOUNDER_PORTRAIT = ({'file': _PHOTO['variants'][-1]['file'], 'w': _PHOTO['w'], 'h': _PHOTO['h'], 'alt': _PHOTO['alt']}
                    if _PHOTO else None)
WAYPOINTS = 'shards'      # owner switch: 'shards' (logo-mark pieces) | 'nodes' (plain who-node squares)
FRAME = 'portrait'        # owner switch: 'portrait' (4:5 hairline plate) | 'plate' (no border/crop marks, same light + texture)
F = WHO['founder']


def T(s):
    """Escaped copy, {brand} filled in, typographic apostrophe (house style)."""
    return E(fmt(s)).replace('&#x27;', '’')


# The journey's legs, derived from the headline ("From A to B."): each leg starts where the previous one ended.
LEGS = [re.fullmatch(r'From (.+) to (.+)\.', l).groups() for l in F['journey']]
assert all(LEGS[i][1] == LEGS[i + 1][0] for i in range(len(LEGS) - 1)), 'founder: the journey legs must chain'
DECK = [LEGS[0][0]] + [b for _, b in LEGS]          # aviation, business, technology, product design (derived, not typed)
SHARD_OF = {'aviation': 1, 'business': 2, 'technology': 3, 'product design': 0}   # logo-mark subpath index: 0 centre, 1 left, 2 right, 3 bottom
assert set(SHARD_OF) == set(DECK)


def _a(attrs):
    return (' ' + attrs) if attrs else ''


# ---------------------------------------------------------------- builders
def bar(attrs=''):
    """Eyebrow as an inverted bar: "THE PERSON BEHIND" in black on ink, then the brand in a hairline cell."""
    lead, brand = fmt(F['label']).rsplit(' ', 1)
    assert brand == BRAND, 'founder: the label must end with the brand'
    return (f'<p class="fdr-bar"{_a(attrs)}><span class="fdr-bar__a">{T(lead)}</span> '
            f'<span class="fdr-bar__b">{E(brand)}</span></p>')


def nameplate(hid, cls):
    """His name as a nameplate: the first name per letter (they arrive from the right, like the intro wordmark), any
    rest on line 2; the lines are fitted to the same width (26-founder.js scales them, transform only). The name is
    one word now ("Gireesh"), so there is one line.
    Screen readers get the name as ONE text node (.sr-only); the per-letter visual is aria-hidden, otherwise the
    heading (and the section landmark it names) is announced letter by letter ("G i r e e s h")."""
    first, _, rest = F['name'].partition(' ')
    letters = ''.join(f'<span class="fdr-l" style="--i:{i}">{E(ch)}</span>' for i, ch in enumerate(first))
    l2 = f' <span class="fdr-name__l2" data-fit aria-hidden="true">{T(rest)}</span>' if rest else ''
    return (f'<h2 class="fdr-name {cls}" id="{hid}" data-fdr-fit data-fdr-in><span class="sr-only">{T(F["name"])}</span>'
            f'<span class="fdr-name__l1" data-fit aria-hidden="true">{letters}</span>{l2}</h2>')


def roles(mode, attrs=''):
    """mode 'rows' (one role per row with a node; separators kept for screen readers) or 'inline' (one line, dots).
    Each separator is bound to the role before it, so a wrapped line never starts with a dot."""
    rs = F['roles']
    parts = [f'<span class="fdr-nw"><span class="fdr-role">{T(r)}</span> <span class="fdr-roles__sep">·</span></span>'
             for r in rs[:-1]]
    parts.append(f'<span class="fdr-role">{T(rs[-1])}</span>')
    return f'<p class="fdr-roles fdr-roles--{mode}"{_a(attrs)}>{" ".join(parts)}</p>'


# His own profiles (owner, 15 Oct: "add linkedin icons near Gireesh profile and instagram also"), from site.config.json
# socials; line icons on the site's 20 px grid at 1.5 px (lib.ICONS style), drawn here rather than a third-party set.
SOCIAL = (
    ('linkedin', 'LinkedIn', '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="3" y="3" width="14" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.5"/>'
                             '<path d="M7 9.2v4.6M10.2 13.8V9.2m0 2.2c0-1.3.9-2.3 2.1-2.3s1.9.8 1.9 2.2v2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
                             '<circle cx="7" cy="6.6" r=".95" fill="currentColor"/></svg>'),
    ('instagram', 'Instagram', '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><rect x="3" y="3" width="14" height="14" rx="4.2" fill="none" stroke="currentColor" stroke-width="1.5"/>'
                               '<circle cx="10" cy="10" r="3.2" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="14.1" cy="5.9" r=".95" fill="currentColor"/></svg>'),
)


def links(attrs=''):
    """His LinkedIn and Instagram as icon buttons (each named for screen readers; no visible text, so guard() is
    unaffected). Channels missing from site.config.json are left out, like the footer."""
    items = [f'<li><a class="fdr-links__a" href="{E(lib.social_href(k))}" target="_blank" rel="noopener" '
             f'aria-label="{E(F["name"])} on {label} (opens in a new tab)">{svg}</a></li>'
             for k, label, svg in SOCIAL if lib.social_href(k)]
    return (f'<ul class="fdr-links" role="list" aria-label="{E(F["name"])} online"{_a(attrs)}>{"".join(items)}</ul>'
            if items else '')


def frame(ctx):
    """The 4:5 plate: texture of his disciplines (CSS content, never DOM text), the warm light, crop marks, the
    nameplate. FOUNDER_PORTRAIT set = the photo becomes the bottom layer (no image and no placeholder until then)."""
    tex_words = ' · '.join(DECK) + ' · '
    tex = ''.join(f'<i data-t="{E(tex_words)}"></i>' for _ in range(12))
    photo = ''
    if FOUNDER_PORTRAIT:
        p = FOUNDER_PORTRAIT
        photo = lib.img(ctx, p['file'], p['alt'], w=p['w'], h=p['h'], cls='fdr-frame__photo')
    cls = f'fdr-frame fdr-frame--{FRAME}' + (' fdr-frame--photo' if FOUNDER_PORTRAIT else '')
    return f'''<div class="{cls}" data-fdr-frame data-fdr-in>
        <div class="fdr-frame__tex" aria-hidden="true">{tex}</div>
        {photo}<span class="fdr-frame__light" aria-hidden="true"></span>
        <span class="fdr-frame__cross" aria-hidden="true"></span>
        <span class="fdr-frame__marks" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        {nameplate('founder-title', 'fdr-name--frame')}
      </div>'''


def flap(word, mod):
    """One split-flap module (aria-hidden through its board): static top + bottom halves of the same word, two pins
    on the hinge. 26-founder.js adds the falling / landing leaves while it flips."""
    w = E(word)
    return (f'<span class="fdr-flap fdr-flap--{mod}" data-flap data-word="{w}">'
            f'<span class="fdr-flap__h fdr-flap__h--t"><span class="fdr-flap__w">{w}</span></span>'
            f'<span class="fdr-flap__h fdr-flap__h--b"><span class="fdr-flap__w">{w}</span></span>'
            f'<i class="fdr-flap__pin"></i><i class="fdr-flap__pin"></i></span>')


# Route strip (viewBox 0 0 360 48): four waypoints, three legs, each drawn in its own line language.
WAY_X, WAY_Y = (14, 126, 238, 344), 26
STRIP_LEGS = (
    'M28 26C52 4 88 4 112 26',                                   # 1 aviation -> business: a flight arc
    'M140 26H152V20H166V14H180V8H194V26H224',                    # 2 business -> technology: a stepped chart line
    'M252 26H266L274 18H290L298 26H306C316 26 318 12 330 20',    # 3 technology -> product design: a trace, then a pen curve
)


def _shard_path(word, x, y):
    subs = CI._subpaths(re.search(r'<path\b[^>]*\sd="([^"]+)"', CI._source(CI.MARK)).group(1))
    sub = subs[SHARD_OF[word]]
    pts = list(dict.fromkeys(CI._points(sub)))
    x0, y0, x1, y1 = CI._bbox(pts)
    k = (26 if SHARD_OF[word] == 0 else 22) / max(x1 - x0, y1 - y0)
    tx, ty = x - k * (x0 + x1) / 2, y - k * (y0 + y1) / 2
    q = list(dict.fromkeys(CI._points(sub, tx, ty, k)))
    return 'M' + ' L'.join(f'{CI._n(px)} {CI._n(py)}' for px, py in q) + 'Z'


def strip(variant):
    """The route strip under the board ('board') or on the home teaser ('teaser': plays once, replays on tap)."""
    shards = []
    for i, word in enumerate(DECK):
        x = WAY_X[i]
        c = ' fdr-strip__sh--c' if SHARD_OF[word] == 0 else ''
        if WAYPOINTS == 'nodes':
            shards.append(f'<g class="fdr-strip__sh fdr-strip__sh--{i + 1}{c}"><rect class="fdr-strip__nd" x="{x - 7}" y="{WAY_Y - 7}" width="14" height="14"/>'
                          f'<rect class="fdr-strip__ni" x="{x - 2.5}" y="{WAY_Y - 2.5}" width="5" height="5"/></g>')
        else:
            shards.append(f'<path class="fdr-strip__sh fdr-strip__sh--{i + 1}{c}" d="{_shard_path(word, x, WAY_Y)}"/>')
    plan = ''.join(f'<path class="fdr-strip__plan" d="{d}"/>' for d in STRIP_LEGS)
    fly = ''.join(f'<path class="fdr-strip__fly fdr-strip__fly--{i + 1}" pathLength="1" d="{d}"/>' for i, d in enumerate(STRIP_LEGS))
    x3 = ('<g class="fdr-strip__x3"><circle cx="274" cy="18" r="1.8"/><circle cx="298" cy="26" r="1.8"/>'
          '<path class="fdr-strip__tan" d="M318 12 330 20"/><rect x="316.5" y="10.5" width="3" height="3"/>'
          '<rect x="328.5" y="18.5" width="3" height="3"/></g>')
    ring = f'<circle class="fdr-strip__ring" cx="{WAY_X[-1]}" cy="{WAY_Y}" r="9"/>'
    play = ' data-fdr-strip data-play data-fdr-in' if variant == 'teaser' else ''
    return (f'<svg class="fdr-strip fdr-strip--{variant}" viewBox="0 0 360 48" aria-hidden="true" focusable="false"{play}>'
            f'{plan}{fly}{x3}{ring}{"".join(shards)}</svg>')


def journey():
    """The departure board (decorative, aria-hidden; leg 1 is its server state) above the real H3: his three-line
    headline as a departure list. Ordinals 01-03 are CSS counters, not text."""
    rows = '\n          '.join(
        f'<span class="fdr-dep__row{" is-on" if i == 0 else ""}" data-leg="{i + 1}"><span class="fdr-dep__t">{T(l)}</span></span>'
        for i, l in enumerate(F['journey']))
    n = len(F['journey'])
    return f'''<div class="fdr-journey" data-fdr-journey>
        <div class="fdr-board" data-fdr-board data-leg="1" data-deck="{E('|'.join(DECK))}" aria-hidden="true">
          <div class="fdr-board__row"><span>from</span><span class="fdr-board__n"><span class="fdr-roll"><span>01</span></span> — {n:02d}</span></div>
          {flap(DECK[0], 'from')}
          <div class="fdr-board__row fdr-board__row--to"><span>to</span></div>
          {flap(DECK[1], 'to')}
          {strip('board')}
        </div>
        <h3 class="fdr-dep" id="founder-journey" data-reveal="fade">
          {rows}
        </h3>
      </div>'''


def _words(sentence, a0, span):
    ws = sentence.split(' ')
    n = len(ws)
    return ws, [a0 + span * (i / (n - 1) if n > 1 else 0) for i in range(n)]


# The opening quotation mark, drawn: Inter Tight 300 sets a detached display-size “ as two straight slanted strokes
# (it reads as "//"), so the visible mark is two filled, rounded comma quotes in the accent; the real “ stays in the
# text, visually hidden (the copy, the guard and screen readers are unchanged). viewBox 42 x 32, two "6" shapes.
_QMARK_6 = 'M{a} 22C{a} 12.5 {b} 5 {c} 1.5L{d} 4C{e} 7 {f} 10.5 {f} 13.5A8.5 8.5 0 1 1 {a} 22Z'
QMARK = ('<svg class="fdr-q__m" viewBox="0 0 42 32" aria-hidden="true" focusable="false"><path d="'
         + ''.join(_QMARK_6.format(a=.5 + x, b=6 + x, c=16 + x, d=17.5 + x, e=11.5 + x, f=9 + x) for x in (0, 24))
         + '"/></svg>')


def pull_quote(text, mod, dot=False):
    """Monumental two-sentence pull quote; the emphasis moves from sentence 1 to sentence 2 as it is read (each
    word carries its own threshold --a; 26-founder.js writes --p). The swap is sentence-level: sentence 2 lights
    first and nearly together (a = .30 + .10t), then sentence 1 dims (a = .55 + .10t), so the states are "1 lit",
    "both lit", "2 lit" (the end state, from p ~ .85) and a sub-sentence fragment is never the only bright text.
    dot=True: the final full stop is drawn as the hero's orange round dot (the real "." stays in the text, visually
    hidden). No attribution is added."""
    sents = [s.strip() for s in re.findall(r'[^.]+\.', text)]
    assert ' '.join(sents) == text and len(sents) == 2, f'founder: quote must be two sentences: {text!r}'
    out = []
    for si, s in enumerate(sents):
        ws, aa = _words(s, .55 if si == 0 else .30, .10)
        spans = []
        for wi, (w, a) in enumerate(zip(ws, aa)):
            body = T(w)
            if dot and si == len(sents) - 1 and wi == len(ws) - 1:
                assert body.endswith('.')
                body = body[:-1] + '<span class="fdr-dot"><span class="fdr-dot__p">.</span></span>'
            spans.append(f'<span class="fdr-w" style="--a:{a:.3f}">{body}</span>')
        out.append(f'<span class="fdr-q__s fdr-q__s--{si + 1}">{" ".join(spans)}</span>')
    return (f'<figure class="fdr-q fdr-q--{mod}" data-fdr-q data-reveal style="--y:32px"><blockquote class="fdr-q__b">'
            f'<p class="fdr-q__t"><span class="fdr-q__o"><span class="sr-only">“</span>{QMARK}</span>{" ".join(out)}”</p>'
            f'</blockquote></figure>')


WIN = 'first-place hackathon achievement'


def bio():
    """The three paragraphs; the first-place hackathon phrase stays in its sentence, drawn in an orange frame."""
    b = F['body']
    assert b[2].count(WIN) == 1
    p3 = T(b[2]).replace(WIN, f'<strong class="fdr-win">{WIN}</strong>', 1)
    return (f'<div class="fdr-bio"><p class="fdr-bio__p fdr-bio__p--lead" data-reveal>{T(b[0])}</p>'
            f'<p class="fdr-bio__p" data-reveal style="--d:80ms">{T(b[1])}</p>'
            f'<p class="fdr-bio__p" data-reveal style="--d:160ms">{p3}</p></div>')


# ---------------------------------------------------------------- copy guard
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
BLOCK = {'p', 'div', 'section', 'header', 'footer', 'figure', 'figcaption', 'blockquote', 'ul', 'ol', 'li', 'br',
         'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}


class _Text(HTMLParser):
    """Text a reader gets: skips aria-hidden="true" subtrees, <svg>, <script> and <style>."""

    def __init__(self):
        super().__init__()
        self.out, self.skip = [], 0

    def handle_starttag(self, tag, attrs):
        if self.skip:
            if tag not in VOID:
                self.skip += 1
            return
        if tag in BLOCK:
            self.out.append(' ')
        if tag in ('svg', 'script', 'style') or dict(attrs).get('aria-hidden') == 'true':
            if tag not in VOID:
                self.skip = 1

    def handle_endtag(self, tag):
        if self.skip:
            self.skip -= 1
            return
        if tag in BLOCK:
            self.out.append(' ')

    def handle_startendtag(self, tag, attrs):
        if not self.skip and tag in BLOCK:
            self.out.append(' ')

    def handle_data(self, data):
        if not self.skip:
            self.out.append(data)


def visible_text(html):
    p = _Text()
    p.feed(html)
    p.close()
    return ''.join(p.out)


def norm(s):
    s = s.replace('’', "'").replace('“', '"').replace('”', '"')
    return re.sub(r'\s+', ' ', s).strip().casefold()


def guard(html, parts):
    """The rendered visible text must read exactly as the content (in order); anything else fails the build."""
    got, want = norm(visible_text(html)), norm(' '.join(fmt(p) for p in parts))
    assert got == want, f'founder copy guard:\n got: {got}\nwant: {want}'
    return html
