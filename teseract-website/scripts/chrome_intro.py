"""Intro logo animation overlay (owner, 14 Oct: "the logo will come and then the logo will rotate and then right side the
names will come and then that should go to the header").

Rendered first in <body> on every page (any page can be the entry page). It stays `hidden` unless the inline <head>
script in chrome.py adds html.ts-intro (once per tab session, never on internal navigations, never under reduced motion,
Save-Data, forced colours or without JS). Styles: src/css/04-intro.css; runtime: src/js/01-intro.js.

The markup is generated from the brand SVGs themselves, so it follows any future logo change:
  - logo-mark.svg: its single path is split into the four shards (centre triangle + three slivers); each gets its centroid
    (the transform origin of its entry) and, for the slivers, its outward normal (data-n: the pointer-light facet shading).
  - wordmark-header.svg: TESERACT is split into its 8 letters (subpaths clustered by x-range) and CREATIVE STUDIOS into its
    15 glyph groups; each letter is copied verbatim into its own masked window (an svg whose viewBox is the letter's padded
    box), positioned in % of the wordmark, with the delay that brings the letters in right to left.
  - plus a plain single-SVG copy of each (.tsi__flat): once beat 3 is complete it replaces the 3D shards and the letter
    windows (same geometry, so the swap is invisible) and is what flies into the header - it renders like the header logo.
Decorative only: aria-hidden, no text, no <title>, no ids, nothing focusable (check.py audits this on every page).
"""
import math
import re

import lib

MARK = 'assets/brand/logo-mark.svg'
WORD = 'assets/brand/wordmark-header.svg'

# Beat 3 timing (ms from the overlay's first frame; mirrors 04-intro.css): each row's letters start right to left over
# STAGGER ms, the right-most at its row's start, so no letter ever appears left of the docking mark.
TESERACT_START, GLYPH_START, STAGGER = 1480, 1560, 340
PAD_LETTER, PAD_GLYPH = 3, 2          # window padding in wordmark units around each letter / stroked glyph

_CACHE = {}
_TOK = re.compile(r'[A-Za-z]|-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?')


def _points(d, tx=0.0, ty=0.0, k=1.0):
    """End points of an absolute path (M/L/H/V/A/Z and implicit lineto pairs). The logo is straight edges and
    quarter-circle corners, whose bounding box is that of their end points."""
    toks = _TOK.findall(d)
    pts, x, y, cmd, i = [], 0.0, 0.0, None, 0
    while i < len(toks):
        t = toks[i]
        if t.isalpha():
            cmd = t
            i += 1
            continue
        if cmd in ('M', 'L'):
            x, y = float(toks[i]), float(toks[i + 1])
            i += 2
            cmd = 'L'                       # extra pairs after M are implicit linetos
        elif cmd == 'H':
            x = float(t)
            i += 1
        elif cmd == 'V':
            y = float(t)
            i += 1
        elif cmd == 'A':
            x, y = float(toks[i + 5]), float(toks[i + 6])
            i += 7
        else:
            raise ValueError(f'chrome_intro: unsupported path command {cmd!r} in a brand SVG')
        pts.append((tx + k * x, ty + k * y))
    return pts


def _subpaths(d):
    return [s.strip() for s in re.split(r'(?=M)', d) if s.strip()]


def _bbox(pts, grow=0.0):
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    return [min(xs) - grow, min(ys) - grow, max(xs) + grow, max(ys) + grow]


def _n(v, nd=2):
    """Compact number: 3 decimals at most, no trailing zeros, no leading 0 before the point."""
    s = f'{round(v, nd):.{nd}f}'.rstrip('0').rstrip('.')
    if s in ('-0', ''):
        s = '0'
    return s.replace('0.', '.', 1) if s.startswith('0.') else s.replace('-0.', '-.', 1)


def _source(file):
    return lib.longpath(lib.PUBLIC / file).read_text(encoding='utf-8')


def _mark():
    raw = _source(MARK)
    d = re.search(r'<path\b[^>]*\sd="([^"]+)"', raw).group(1)
    subs = _subpaths(d)
    assert len(subs) == 4, f'chrome_intro: logo-mark.svg should hold 4 shards, found {len(subs)}'
    shards = {}
    for key, sub in zip(('c', 'l', 'r', 'b'), subs):     # path order: centre triangle, left, right, bottom sliver
        pts = list(dict.fromkeys(_points(sub)))
        cx, cy = sum(p[0] for p in pts) / len(pts), sum(p[1] for p in pts) / len(pts)
        vx, vy = cx - 50, cy - 50
        ln = math.hypot(vx, vy) or 1
        shards[key] = {'d': sub, 'o': f'{cx:.2f}% {cy:.2f}%', 'n': f'{_n(vx / ln, 3)},{_n(vy / ln, 3)}'}
    return shards


def _word():
    raw = _source(WORD)
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', raw).group(1).split()]
    W, H = vb[2], vb[3]
    # TESERACT: the first <path>, split into subpaths and clustered into letters by overlapping x-range
    first = re.search(r'<path\b[^>]*\sd="([^"]+)"[^>]*/>', raw)
    letters = []
    for sub in sorted(_subpaths(first.group(1)), key=lambda s: _bbox(_points(s))[0]):
        b = _bbox(_points(sub))
        if letters and b[0] <= letters[-1]['box'][2]:
            last = letters[-1]
            last['subs'].append(sub)
            last['box'] = [min(last['box'][0], b[0]), min(last['box'][1], b[1]), max(last['box'][2], b[2]), max(last['box'][3], b[3])]
        else:
            letters.append({'subs': [sub], 'box': b})
    assert len(letters) == 8, f'chrome_intro: TESERACT should split into 8 letters, found {len(letters)}'
    for L in letters:
        L['inner'] = f'<path d="{"".join(L["subs"])}"/>'
        L['pad'], L['small'] = PAD_LETTER, False
    # CREATIVE STUDIOS: one <g transform="translate(..) scale(..)"> per glyph; box = transformed end points +- stroke/2
    glyphs = []
    for m in re.finditer(r'<g transform="translate\(([-\d.]+)[ ,]+([-\d.]+)\) scale\(([\d.]+)\)">(.*?)</g>', raw, re.S):
        tx, ty, k = float(m.group(1)), float(m.group(2)), float(m.group(3))
        box = None
        for pm in re.finditer(r'<path\b([^>]*)/>', m.group(4)):
            attrs = pm.group(1)
            sw = re.search(r'stroke-width="([\d.]+)"', attrs)
            b = _bbox(_points(re.search(r'\sd="([^"]+)"', attrs).group(1), tx, ty, k), (float(sw.group(1)) * k / 2) if sw else 0)
            box = b if box is None else [min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3])]
        glyphs.append({'inner': m.group(0), 'box': box, 'pad': PAD_GLYPH, 'small': True})
    assert len(glyphs) == 15, f'chrome_intro: CREATIVE STUDIOS should hold 15 glyphs, found {len(glyphs)}'
    glyphs.sort(key=lambda g: g['box'][0])

    out = []
    for row, start in ((letters, TESERACT_START), (glyphs, GLYPH_START)):
        last_x = max(g['box'][0] for g in row)
        for g in row:
            x0, y0, x1, y1 = g['box']
            p = g['pad']
            wx, wy, ww, wh = x0 - p, y0 - p, (x1 - x0) + 2 * p, (y1 - y0) + 2 * p
            delay = round(start + STAGGER * (1 - x0 / last_x))
            style = (f'--x:{wx / W * 100:.3f}%;--y:{wy / H * 100:.3f}%;--w:{ww / W * 100:.3f}%;'
                     f'--h:{wh / H * 100:.3f}%;--d:{delay}ms')
            cls = 'tsi__ch tsi__ch--s' if g['small'] else 'tsi__ch'
            out.append(f'<span class="{cls}" style="{style}"><svg viewBox="{_n(wx)} {_n(wy)} {_n(ww)} {_n(wh)}" '
                       f'preserveAspectRatio="none" fill="currentColor" aria-hidden="true" focusable="false">{g["inner"]}</svg></span>')
    return ''.join(out)


def _flat():
    """The flying copies: the mark's single path and the wordmark's own content, verbatim."""
    mark = re.search(r'<path\b[^>]*\sd="([^"]+)"', _source(MARK)).group(1)
    raw = re.sub(r'<title>.*?</title>', '', _source(WORD), flags=re.S)
    m = re.search(r'<svg\b[^>]*\sviewBox="([^"]+)"[^>]*>(.*)</svg>', raw, re.S)
    attrs = 'aria-hidden="true" focusable="false"'
    return (f'<svg class="tsi__flat" viewBox="0 0 100 100" {attrs}><path d="{mark}"/></svg>',
            f'<svg class="tsi__flat" viewBox="{m.group(1)}" fill="currentColor" {attrs}>{m.group(2).strip()}</svg>')


def _shard(key, s, shade=True):
    svg = lambda cls: (f'<svg class="{cls}" viewBox="0 0 100 100" aria-hidden="true" focusable="false">'
                       f'<path d="{s["d"]}"/></svg>')
    n = f' data-n="{s["n"]}"' if key != 'c' else ''
    return (f'<div class="tsi__sh tsi__sh--{key}" style="--o:{s["o"]}"{n}>{svg("tsi__echo")}'
            f'<div class="tsi__arr">{svg("tsi__ink")}{svg("tsi__shade") if shade else ""}</div></div>')


def _build():
    sh = _mark()
    flat_mark, flat_word = _flat()
    return ('<div class="tsi" data-intro hidden aria-hidden="true">'
            '<div class="tsi__veil"><div class="tsi__tail"></div></div>'
            '<div class="tsi__light"></div>'
            '<div class="tsi__lock">'
            '<div class="tsi__fx tsi__fx--mark"><div class="tsi__fy"><div class="tsi__dock"><div class="tsi__mark">'
            '<div class="tsi__glint"></div>'
            '<div class="tsi__tilt"><div class="tsi__pulse"><div class="tsi__spin">'
            # the centre triangle is never shaded (only the slivers act as lit facets)
            f'{_shard("c", sh["c"], shade=False)}'
            f'<div class="tsi__ring">{_shard("r", sh["r"])}{_shard("b", sh["b"])}{_shard("l", sh["l"])}</div>'
            '</div></div></div>'
            f'</div>{flat_mark}</div></div></div>'
            f'<div class="tsi__fx tsi__fx--word"><div class="tsi__fy"><div class="tsi__word">{_word()}{flat_word}</div></div></div>'
            '</div>'
            '<i class="tsi__cue"></i>'
            '</div>'
            # parse sentinel: every beat starts on the same frame even when the overlay straddles two network chunks
            "<script>(function(d){if(d.classList.contains('ts-intro'))d.classList.add('tsi-go')})(document.documentElement)</script>")


def render(ctx):
    if 'html' not in _CACHE:
        _CACHE['html'] = _build()
    return _CACHE['html']
