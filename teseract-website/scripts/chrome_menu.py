"""Full-screen menu overlay (image 3, spec `_ref/specs/image3-menu.md`).

render(ctx) -> the overlay HTML (id="site-menu"), placed right after the header by chrome.document().

Layout (desktop, 1600 x 857 design frame):
  * top bar: centred tagline (CONFIG['menu_tagline']), outline "Start a Project" pill, close X;
  * left: the decorative typographic art panel (aria-hidden): construction hairlines, circles, the
    red arc, dots, the gradient "Aa" with its dissolve + glow, "Typography / Helvetica Neue",
    the colour palette and the "01 —" index marker (rolls to the hovered item);
  * right: the 7 NAV items (site typeface --font-menu = var(--font), 400, uppercase), current page
    marked with aria-current;
  * bottom-left: legal links + social links (only the channels configured in site.config.json; others are omitted).
Phones: the bar's tagline and the art's colour palette, which the phone layout leaves out, return as one line at the
foot (.menu__sign: tagline + four palette chips); held sideways the tagline sits in the bar beside the pill.
Behaviour lives in src/js/10-menu.js, styles + choreography in src/css/11-menu.css.

Black theme (DARK-THEME.md): the composition is image 3's, re-lit for a black page. Construction
lines/circles are soft white at low alpha (the light frame's ink alphas x LINE_K), the black dot is a
soft-white dot, the red art (gradient Aa, dissolve, glows, arc, crosshair) keeps its colour and its
glows are tuned for black; the palette keeps the brand fills with a hairline ring on the black one.

The art SVGs use the image's own pixel coordinates (viewBox "0 64 900 672"), so every number below
can be checked directly against the spec / reference image.
"""
import lib
from lib import E, CONFIG
from content import NAV, PRIMARY_CTA

# Brand palette shown in the art panel. Fills and labels agree (art-director decision; the
# source image's labels contradicted its own fills).
SWATCHES = ['#000000', '#970102', '#FB2629', '#F6F6F6']

LINE = '#FFFFFF'      # construction lines on black (was #111 on white)
LINE_K = .62          # light-frame alphas x LINE_K: same visual weight for white-on-black hairlines
DOT = '#F4F4F2'       # image 3's black dot, re-cut as a soft-white dot (= --ink)
CROSS = '#E0484C'
RED = '#FB2629'
ARC_GLOW = [(.6, 0), (.75, .08), (.86, .19), (.94, .3), (1, .46)]   # light frame: .07/.17/.26/.42
TOP_HAZE = .2                                                         # light frame: .09

ARROW = ('<svg class="menu__cta-icon" viewBox="0 0 10 10" aria-hidden="true" focusable="false">'
         '<path d="M1 9 9 1M3 1h6v6" fill="none" stroke="currentColor" stroke-width="1.6" '
         'stroke-linecap="round" stroke-linejoin="round"/></svg>')

CLOSE = ('<svg viewBox="0 0 30 30" aria-hidden="true" focusable="false">'
         '<path class="menu__close-l" pathLength="1" d="M1 1 29 29"/>'
         '<path class="menu__close-l" pathLength="1" d="M29 1 1 29"/></svg>')


# --------------------------------------------------------------------------- art: gradients
def _lin(gid, x1, y1, x2, y2, stops, color=LINE, k=1.0):
    s = ''.join(f'<stop offset="{o}" stop-color="{color}" stop-opacity="{round(min(1, a * k), 3)}"/>' for o, a in stops)
    return f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


# Construction guides: (id, x1, y1, x2, y2, stops) — peak alphas from spec §3.2.
GUIDES = [
    # order = draw order of the open choreography (§7.1: H2, V1, V2, H4, V3b, V4, V5, H3, H5, D1)
    ('H2', 24, 325.5, 515, 325.5, [(0, .08), (.18, .37), (.8, .36), (1, 0)]),
    ('V1', 105.5, 184, 105.5, 410, [(0, 0), (.2, .47), (.7, .45), (1, 0)]),
    ('V2', 198.5, 96, 198.5, 690, [(0, 0), (.08, .22), (.9, .22), (1, 0)]),
    ('H4', 13, 500.5, 690, 500.5, [(0, 0), (.15, .25), (.9, .25), (1, 0)]),
    ('V3b', 550, 362, 550, 750, [(0, .25), (.85, .25), (1, 0)]),
    ('V4', 626.5, 232, 626.5, 430, [(0, 0), (.15, .24), (.85, .24), (1, 0)]),
    ('V5', 725, 384, 725, 722, [(0, 0), (.12, .33), (.85, .33), (1, 0)]),
    ('H3', 360, 395.5, 640, 395.5, [(0, 0), (.15, .15), (.85, .15), (1, 0)]),
    ('H5', 576, 619, 740, 619, [(0, 0), (.45, .35), (1, .35)]),
    ('D1', 715.6, 416, 779, 535, [(0, .2), (.55, .8), (1, .25)]),
]


def _defs():
    g = [_lin(f'mn-g{i}', x1, y1, x2, y2, stops, k=LINE_K) for i, x1, y1, x2, y2, stops in GUIDES]
    g += [
        # the red crosshair through the red dot: a touch stronger than on white, where pink read as red
        _lin('mn-gCross', 0, 140, 0, 362, [(0, 0), (.52, .45), (1, 0)], CROSS, k=1.35),
        _lin('mn-gCrossH', 470, 0, 612, 0, [(0, 0), (.55, .38), (1, 0)], CROSS, k=1.35),
        _lin('mn-gArc', 869.9, 514.9, 663.7, 700.6, [(0, .1), (.4, 1), (.7, 1), (1, 0)], RED),
        _lin('mn-gArcMask', 663.7, 700.6, 869.9, 514.9, [(0, 0), (.3, 1), (.6, 1), (.85, .3), (1, 0)], '#fff'),
        _lin('mn-gC1', 609.8, 314, 520, 410, [(0, 0), (1, 1)], '#fff'),
        _lin('mn-gC2', 260.4, 0, 560.1, 0, [(0, .02), (.3, .16), (.62, .18), (1, .04)], k=LINE_K),
    ]
    # red light inside the big arc. On white it read as a pink haze; on black the same alphas read as
    # a deep ember, so the ramp is a little fuller toward the rim (still a soft radial, no hard edge).
    arc_glow = ('<radialGradient id="mn-gArcGlow" gradientUnits="userSpaceOnUse" cx="877.4" cy="730.6" r="215.8">'
                + ''.join(f'<stop offset="{o}" stop-color="{RED}" stop-opacity="{a}"/>'
                          for o, a in ARC_GLOW)
                + '</radialGradient>')
    top = ('<radialGradient id="mn-gTop" cx=".5" cy=".5" r=".5">'
           f'<stop offset="0" stop-color="{RED}" stop-opacity="{TOP_HAZE}"/><stop offset="1" stop-color="{RED}" stop-opacity="0"/></radialGradient>')
    masks = ('<mask id="mn-mArc" maskUnits="userSpaceOnUse" x="600" y="480" width="320" height="300">'
             '<rect x="600" y="480" width="320" height="300" fill="url(#mn-gArcMask)"/></mask>'
             '<mask id="mn-mC1" maskUnits="userSpaceOnUse" x="260" y="250" width="430" height="430">'
             '<rect x="260" y="250" width="430" height="430" fill="url(#mn-gC1)"/></mask>'
             '<clipPath id="mn-cTop"><rect x="400" y="64" width="152" height="200"/></clipPath>')
    return '<defs>' + ''.join(g) + arc_glow + top + masks + '</defs>'


def _art_back():
    guides = ''.join(
        f'<line class="art__draw art__guide" pathLength="1" style="--i:{n}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="url(#mn-g{i})"/>'
        for n, (i, x1, y1, x2, y2, _s) in enumerate(GUIDES))
    faint = ('<path class="art__faint" d="M269 448V485M676 296V480M375 353V414M411 392V505M446 664H497'
             f'M235 485H350M220 522H275M633 583H681M626.5 600V640" stroke="{LINE}" stroke-opacity="{round(.1 * LINE_K, 3)}"/>')
    # C1 drawn clockwise from 12 o'clock (two half arcs) so the dash reveal starts at -90deg.
    c1 = ('<g mask="url(#mn-mC1)"><path class="art__draw art__circle" pathLength="1" '
          f'd="M471.5 259.5A202.8 202.8 0 1 1 471.5 665.1A202.8 202.8 0 1 1 471.5 259.5" stroke="{LINE}" stroke-opacity="{round(.13 * LINE_K, 3)}"/></g>')
    c2 = ('<path class="art__draw art__circle" pathLength="1" d="M260.4 296.4A173.7 173.7 0 0 1 560.1 270.2" '
          'stroke="url(#mn-gC2)"/>')
    return (f'<svg class="art__svg art__svg--back" viewBox="0 64 900 672" preserveAspectRatio="xMinYMin meet" '
            f'aria-hidden="true" focusable="false">{_defs()}'
            '<g class="art__glows">'
            '<ellipse class="art__haze" cx="530" cy="160" rx="80" ry="85" fill="url(#mn-gTop)" clip-path="url(#mn-cTop)"/>'
            '<circle class="art__arcglow" cx="877.4" cy="730.6" r="215.8" fill="url(#mn-gArcGlow)" mask="url(#mn-mArc)"/>'
            '</g>'
            f'<g class="art__lines" fill="none">{guides}{faint}{c1}{c2}</g></svg>')


def _art_top():
    return ('<svg class="art__svg art__svg--top" viewBox="0 64 900 672" preserveAspectRatio="xMinYMin meet" '
            'aria-hidden="true" focusable="false"><g fill="none">'
            # C3 drawn from its top end (-92deg) down to -172deg
            '<path class="art__draw art__arc" pathLength="1" d="M869.9 514.9A215.8 215.8 0 0 0 663.7 700.6" stroke="url(#mn-gArc)"/>'
            '<line class="art__draw art__cross" pathLength="1" x1="550" y1="140" x2="550" y2="362" stroke="url(#mn-gCross)"/>'
            '<line class="art__draw art__cross art__cross--h" pathLength="1" x1="470" y1="255" x2="612" y2="255" stroke="url(#mn-gCrossH)"/>'
            '</g>'
            f'<circle class="art__dot art__dot--ink" cx="220.3" cy="170.2" r="8.4" fill="{DOT}"/>'
            '<circle class="art__dot art__dot--red" cx="549.8" cy="254.7" r="6.5" fill="#F90406"/>'
            '</svg>')


def _aa(cls, letters='Aa'):
    spans = ''.join(f'<span class="aa__{c}">{c}</span>' for c in letters)
    return f'<div class="aa aa--{cls}">{spans}</div>'


def _palette():
    items = ''.join(
        f'<li style="--c:{c};--i:{i}"><b></b><span>{c}</span></li>' for i, c in enumerate(SWATCHES))
    return (f'<div class="art__palette"><p class="art__lbl">Colour Palette</p>'
            f'<ul class="art__swatches">{items}</ul><i class="art__rule"></i></div>')


def _art(current_index):
    n = f'{current_index + 1:02d}'
    return (
        '<div class="menu__art-wrap" aria-hidden="true">'
        '<div class="menu__art">'
        f'{_art_back()}'
        # glow (A's outer left leg only) · soft (blurred copy the feet dissolve into) · crisp gradient letters
        f'<div class="art__aa">{_aa("glow", "A")}{_aa("soft")}{_aa("crisp")}</div>'
        f'{_art_top()}'
        '<div class="art__typo"><p class="art__lbl">Typography</p><p class="art__val">Helvetica Neue</p><i class="art__rule"></i></div>'
        f'{_palette()}'
        f'<div class="art__index"><span class="art__num" data-menu-num><span>{n}</span></span><i></i></div>'
        '</div></div>')


# --------------------------------------------------------------------------- links
def _current(ctx, route):
    """'page' for the exact page, 'true' for a section's sub-page (case studies live under The Work)."""
    here = ctx.route
    if here == route:
        return 'page'
    if route == 'work' and here.startswith('projects/'):
        return 'true'
    return None


def _nav(ctx):
    items = []
    for i, (key, label, route) in enumerate(NAV):
        cur = _current(ctx, route)
        aria = f' aria-current="{cur}"' if cur else ''
        items.append(
            f'<li style="--i:{i}"><a class="menu__link" href="{E(ctx.url(route))}" data-menu-index="{i}"{aria}>'
            f'<span class="menu__label"><span class="menu__mask"><span class="menu__txt">{E(label)}</span></span></span></a></li>')
    return f'<nav class="menu__nav" aria-label="Menu"><ol class="menu__list" role="list">{"".join(items)}</ol></nav>'


def _foot_link(href, label, i, *, aria=''):
    return f'<li style="--i:{i}"><a class="menu__flink" href="{E(href)}"{aria}><span>{E(label)}</span></a></li>'


def _sign(tagline):
    """Phone foot line (11-menu.css .menu__sign): the menu tagline + the art panel's four palette chips. Hidden
    wherever the bar shows the tagline and the art its palette, so the tagline is never read twice; the chips are
    decoration, like the art panel."""
    chips = ''.join(f'<i style="--c:{c};--i:{i}"></i>' for i, c in enumerate(SWATCHES))
    tag = f'<p class="menu__sign-tag">{E(tagline)}</p>' if tagline else ''
    return f'<div class="menu__sign">{tag}<span class="menu__chips" aria-hidden="true">{chips}</span></div>'


def _footer(ctx, tagline=''):
    legal = []
    for i, (route, label) in enumerate([('privacy', 'Privacy policy'), ('terms', 'Terms of service')]):
        cur = ' aria-current="page"' if ctx.route == route else ''
        legal.append(_foot_link(ctx.url(route), label, i, aria=cur))
    # only the channels the studio has supplied (site.config.json "socials"), like the footer: no dead links
    channels = [('instagram', 'Instagram'), ('linkedin', 'LinkedIn'), ('github', 'GitHub'), ('behance', 'Behance')]
    social = []
    for j, (key, label) in enumerate([c for c in channels if lib.social_href(c[0])]):
        social.append(f'<li style="--i:{j + 2}"><a class="menu__flink" href="{E(lib.social_href(key))}" target="_blank" rel="noopener">'
                      f'<span>{E(label)}</span><span class="sr-only"> (opens in a new tab)</span></a></li>')
    return (f'<div class="menu__foot">{_sign(tagline)}'
            f'<ul class="menu__legal" role="list" aria-label="Legal">{"".join(legal)}</ul>'
            + (f'<ul class="menu__social" role="list" aria-label="Social">{"".join(social)}</ul>' if social else '') + '</div>')


def render(ctx):
    current = next((i for i, (_k, _l, r) in enumerate(NAV) if _current(ctx, r)), 0)
    tagline = CONFIG.get('menu_tagline') or ''
    return f'''<div class="menu" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu" data-state="closed" data-lenis-prevent hidden>
<div class="menu__inner">
  <div class="menu__bar">
    {f'<p class="menu__tagline">{E(tagline)}</p>' if tagline else ''}
    <div class="menu__actions">
      <a class="menu__cta" href="{E(ctx.url('contact'))}"{' aria-current="page"' if ctx.route == 'contact' else ''}><span class="menu__cta-label">{E(PRIMARY_CTA)}</span>{ARROW}</a>
      <button class="menu__close" type="button" aria-label="Close menu" data-menu-close>{CLOSE}</button>
    </div>
  </div>
  {_art(current)}
  {_nav(ctx)}
  {_footer(ctx, tagline)}
</div>
</div>'''
