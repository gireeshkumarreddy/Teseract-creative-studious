"""WHO WE ARE page (/who-we-are/) - the client's reference images 5, 6 and 7 on the black theme.

  1 Hero (image 5)        "who we are." display = the page H1 (Client update 5: the menu label / keyword, not the
                          image's "who are we."), monitor scene,
                          warm light streaks rebuilt in CSS/SVG over the prepared light layer.
  2 Founder (#founder)    WHO.founder, "The person behind TESERACT" (owner, 15 Oct: directly after the hero; the
                          page's stand-out section): the lit 4:5 type portrait (nameplate, no photo), roles, the
                          split-flap departure board + route strip over the real three-line headline, quote 1, the
                          three-paragraph bio. Builders: sections/founder.py.
  3 Intro (image 6 A-C)   H2 WHO.hero.title + WHO.hero.body as technical annotations around the floating
                          rock; the boxed-word statement (HOME.idea.body) beside the dial collage.
  4 Why TESERACT exists   WHO.why (#why, the owner's founder content): /02 bar, the statement with the red box on
                          "exactly the same.", the three struck lines the visitor restores, Gireesh's answer,
                          quote 2 (orange final dot), the closing box with its three goals.
  5 Our philosophy        WHO.philosophy: the /03 box (abstract image + text panel) and the 01-04 steps.
  6 How we think (img 7)  WHO.think as three editorial spreads; non-person brand-light panels replace the
                          reference's people photo.
  7 Our promise           WHO.promise as the closing statement.
Desktop (>= 1200px) places the image-6 and image-7 elements on their measured design grids (--x/--y in
design px, see 30-who.css; the founder and why boards use a 4-column grid snapped to the image-6 hairlines);
below that everything flows. Motion: src/js/30-who.js, founder blocks src/js/26-founder.js.

Owner micro-labels for approval (founder blocks; none adds a fact): "Meet the founder" (home teaser link),
"(tap to restore)" / "(click to restore)", the "0/3" counter, "from" / "to" (words from his headline), the
"01 — 03" counter and the 01-03 ordinals, the texture words (his four disciplines, from the headline), the
agency link "Who we are and why TESERACT exists", and the screen-reader-only state of each restore line
("Struck through. Press to restore." / "Restored. Press to strike through again.", 26-founder.js). No quote
attribution is added. The shard-to-discipline mapping is a visual interpretation (sections/founder.py
WAYPOINTS = 'nodes' removes it); FRAME = 'plate' drops the 4:5 border if the owner reads it as a placeholder.
Editorial overlay for approval: in "Why TESERACT exists" the value word of each of his three "X replaced Y."
lines ("thinking." / "identity." / "clarity.") is drawn struck in red (dimmed) until the visitor taps it, or the
next paragraph restores it; the words are always in the text and the restored end state reads exactly as written
(the culprit word only dims, it is never struck).

Also hosts the small inner-page building blocks reused by pages/contact.py, pages/legal.py and
pages/stories.py (page hero, section head with an id, corner dots, reference checklist seal, marks).
"""
import re
from lib import E, fmt, img, svg_inline, pill_label, longpath, PUBLIC, BRAND
from content import WHO, HOME, BRAND as BRAND_COPY
from sections import founder as FD

# Reference checklist seal-check (ref-plans-faq-footer, appendix A), 20x29. Black theme: the light-grey
# seal + dark tick pair becomes a quiet raised #2C2C2C seal with a hairline rim and an --ink (#F4F4F2) tick.
SEAL = ('<svg class="seal" viewBox="0 0 20 29" width="20" height="29" aria-hidden="true" focusable="false">'
        '<path d="M15.4448 8.01492C15.6348 8.47431 15.9994 8.83947 16.4585 9.03011L18.0683 9.69694C18.5278 9.88724 18.8928 10.2523 19.0831 10.7117C19.2734 11.1711 19.2734 11.6873 19.0831 12.1467L18.4167 13.7554C18.2263 14.2151 18.2261 14.7318 18.4173 15.1912L19.0825 16.7994C19.1769 17.027 19.2254 17.2709 19.2255 17.5172C19.2255 17.7636 19.177 18.0075 19.0827 18.2351C18.9885 18.4626 18.8503 18.6694 18.6761 18.8436C18.5019 19.0177 18.2951 19.1558 18.0674 19.25L16.4587 19.9164C15.9994 20.1063 15.6342 20.4709 15.4436 20.93L14.7767 22.5399C14.5864 22.9993 14.2214 23.3644 13.762 23.5547C13.3026 23.745 12.7863 23.745 12.3269 23.5547L10.7182 22.8883C10.2588 22.6985 9.74276 22.6989 9.2836 22.8894L7.67374 23.5553C7.21457 23.7451 6.69881 23.745 6.23976 23.5548C5.7807 23.3647 5.41589 23.0001 5.22546 22.5411L4.55844 20.9308C4.36848 20.4714 4.00388 20.1063 3.54477 19.9156L1.93491 19.2488C1.47568 19.0586 1.11078 18.6938 0.920407 18.2346C0.730035 17.7755 0.729777 17.2595 0.919689 16.8001L1.58604 15.1914C1.77587 14.732 1.77548 14.216 1.58496 13.7568L0.919567 12.1458C0.825228 11.9183 0.776651 11.6743 0.776611 11.428C0.776572 11.1817 0.825071 10.9378 0.919337 10.7102C1.0136 10.4826 1.15179 10.2758 1.326 10.1017C1.50021 9.92752 1.70703 9.7894 1.93463 9.69521L3.54334 9.02886C4.00233 8.83908 4.36727 8.47493 4.55805 8.01635L5.22488 6.40649C5.41518 5.94706 5.78019 5.58205 6.23962 5.39175C6.69905 5.20145 7.21526 5.20145 7.67468 5.39175L9.28339 6.0581C9.74283 6.24793 10.2589 6.24754 10.718 6.05702L12.3285 5.39278C12.7879 5.20259 13.304 5.20263 13.7633 5.39289C14.2227 5.58315 14.5876 5.94806 14.778 6.40737L15.445 8.01771L15.4448 8.01492Z" fill="#2C2C2C" stroke="#FFFFFF" stroke-opacity=".16" stroke-width=".7"/>'
        '<path fill-rule="evenodd" clip-rule="evenodd" d="M13.9166 11.8509C14.0502 11.6411 14.0949 11.3867 14.041 11.1439C13.9871 10.901 13.8389 10.6895 13.6291 10.5559C13.4192 10.4223 13.1649 10.3776 12.922 10.4315C12.6792 10.4854 12.4677 10.6336 12.3341 10.8434L8.66283 16.6122L6.98283 14.5122C6.82751 14.3179 6.60138 14.1933 6.35418 14.1658C6.10699 14.1382 5.85897 14.21 5.6647 14.3653C5.47043 14.5206 5.34582 14.7468 5.31827 14.9939C5.29073 15.2411 5.36251 15.4892 5.51783 15.6834L8.01783 18.8084C8.111 18.925 8.23066 19.0177 8.36687 19.0788C8.50308 19.1398 8.65189 19.1674 8.80093 19.1594C8.94998 19.1513 9.09494 19.1077 9.22376 19.0324C9.35258 18.957 9.46154 18.8519 9.54158 18.7259L13.9166 11.8509Z" fill="#F4F4F2"/></svg>')

DOTS = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'

# Small white glyphs (kept for other inner pages that may import them).
GLYPHS = {
    'people': '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="8.2" r="3.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M4.8 19.6c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    'detail': '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="2.4" fill="currentColor"/><path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M5 8V5h3M16 5h3v3M19 16v3h-3M8 19H5v-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/></svg>',
}


def mark3d(ctx, cls, size, alt='', eager=False):
    return img(ctx, 'assets/brand/logo-mark-3d.webp', alt, w=size, h=round(size * 519 / 515), cls=cls, eager=eager)


def flat_mark(cls='pg-mark'):
    return f'<span class="{cls}" aria-hidden="true">{svg_inline("assets/brand/logo-mark.svg")}</span>'


def page_hero(ctx, label, title_html, *, sub_html='', extra='', cls=''):
    """Inner-page hero in the reference vocabulary: pill label, 72px H1, 18px balanced sub.
    Appear timings follow the reference hero (H1 y80 @200ms, sub y80 @300ms, extras @400ms+)."""
    sub = f'<p class="pg-hero__sub" data-reveal style="--y:80px;--d:300ms">{sub_html}</p>' if sub_html else ''
    return (f'<section class="pg-hero{(" " + cls) if cls else ""}" aria-labelledby="page-title">'
            f'<div class="container"><div class="pg-hero__inner">{pill_label(label)}'
            f'<h1 class="pg-hero__title" id="page-title" data-reveal style="--y:80px;--d:200ms">{title_html}</h1>'
            f'{sub}{extra}</div></div></section>')


def head(label, title_html, hid, *, sub_html=None, tag='h2', align='center', visible_title=True):
    """lib.section_head markup plus an id on the heading (for aria-labelledby)."""
    lab = pill_label(label) if label else ''
    sub = f'<p class="section-head__sub" data-reveal style="--d:160ms">{sub_html}</p>' if sub_html else ''
    if not visible_title:
        return f'<header class="section-head section-head--{align}">{lab}<{tag} class="sr-only" id="{hid}">{title_html}</{tag}></header>'
    return (f'<header class="section-head section-head--{align}">{lab}'
            f'<{tag} class="section-head__title" id="{hid}" data-split>{title_html}</{tag}>{sub}</header>')


# ================================================================== helpers for this page
A = 'assets/who/'
ARROW = ('<svg class="who-arr" viewBox="0 0 16 16" aria-hidden="true" focusable="false">'
         '<path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" stroke-width="1.5" '
         'stroke-linecap="square" stroke-linejoin="miter"/></svg>')


def T(text):
    """Escaped document copy with the typographic apostrophe (U+2019, as set in images 6 and 7: WE’RE).
    The wording is unchanged; at display sizes the straight ' reads as a typewriter tick."""
    return E(text).replace('&#x27;', '’')


def link_text(label):
    """Underlined link text + arrow; the last word and the arrow never separate when the line wraps."""
    head_, _, last = label.rpartition(' ')
    lead = f'<span class="who-link__t">{T(head_)} </span>' if head_ else ''
    return f'{lead}<span class="who-nw"><span class="who-link__t">{T(last)}</span>{ARROW}</span>'


def at(x, y, w=None, h=None, extra=''):
    """Design-grid position (design px of the reference canvas; used only on the desktop boards)."""
    s = f'--x:{x};--y:{y}' + (f';--w:{w}' if w is not None else '') + (f';--h:{h}' if h is not None else '')
    return s + (';' + extra if extra else '')


_SVG = {}


def svg(file, cls='', draw=False):
    """Inline one of the page's line icons (decorative, aria-hidden). draw=True adds pathLength=1 so the
    strokes can be drawn in. Only the ROOT <svg>'s width/height are dropped (lib.svg_inline strips them from
    every element, which empties the <rect>-built crenel/checker icons). Font attributes are dropped too:
    SVG text inherits the single site typeface."""
    if file not in _SVG:
        raw = longpath(PUBLIC / (A + file)).read_text(encoding='utf-8')
        raw = re.sub(r'<\?xml[^>]*>\s*|<title>.*?</title>', '', raw, flags=re.S).strip()
        raw = re.sub(r'\sfont-family="[^"]*"', '', raw)
        # decorative scale numerals (the dial's 000-330) would be indexed as page text and fail contrast
        # audits; the long 30-degree ticks carry the same technical look
        raw = re.sub(r'<g[^>]*>(?:\s*<text\b[^>]*>[^<]*</text>)+\s*</g>', '', raw)
        raw = re.sub(r'<text\b[^>]*>[^<]*</text>', '', raw)
        head, rest = raw.split('>', 1)
        head = re.sub(r'\s(role|aria-label|aria-hidden|width|height)="[^"]*"', '', head)
        _SVG[file] = head + '>' + rest
    raw = _SVG[file]
    c = f' class="{cls}"' if cls else ''
    raw = raw.replace('<svg', f'<svg{c} aria-hidden="true" focusable="false"', 1)
    if draw:
        raw = re.sub(r'<(path|circle|ellipse|rect)\b', r'<\1 pathLength="1"', raw)
    return raw


def node(x, y, red=False, d=0):
    """Connector end: 22 dpx outlined square + centred 9 dpx filled square (SVG, design px)."""
    return (f'<g class="who-node{" who-node--red" if red else ""}" style="--d:{d}ms">'
            f'<rect class="who-node__o" x="{x - 11}" y="{y - 11}" width="22" height="22"/>'
            f'<rect class="who-node__i" x="{x - 4.5}" y="{y - 4.5}" width="9" height="9"/></g>')


def wire(points, d=0, cls=''):
    pts = ' '.join(f'{x},{y}' for x, y in points)
    return f'<polyline class="who-wire{(" " + cls) if cls else ""}" points="{pts}" pathLength="1" style="--d:{d}ms"/>'


def wires(w, h, body):
    return (f'<svg class="who-wires" viewBox="0 0 {w} {h}" preserveAspectRatio="none" aria-hidden="true" '
            f'focusable="false">{body}</svg>')


def grid(vs=(), hs=(), crosses=()):
    """Poster hairlines (desktop) + small "+" crosses at the intersections."""
    lines = ''.join(f'<i class="who-grid__v" style="--x:{x}"></i>' for x in vs)
    lines += ''.join(f'<i class="who-grid__h" style="--y:{y}"></i>' for y in hs)
    lines += ''.join(f'<i class="who-grid__c" style="--x:{x};--y:{y}"></i>' for x, y in crosses)
    return f'<div class="who-grid" aria-hidden="true">{lines}</div>'


GRID_X = (351, 667.5, 1005)          # image 6 vertical hairlines


def rail(start='pin', end='pin'):
    """Phone circuit rail (< 800px, where the measured wires give way to one column): an empty SVG over the board that
    30-who.js fills with a vertical trace in the left gutter, a node at each [data-who-pin] box ('h' = beside its head /
    first child, 'l' = its first text line, 'c' = its centre; flags '!' = the red node, '-' = no node, the leader runs
    into the box's own marker) and a short leader into the box. The trace grows one way with scroll; start / end 'edge'
    run it to the board edge (bands A+B and C read as one trace)."""
    return (f'<svg class="who-rail" aria-hidden="true" focusable="false" data-who-rail '
            f'data-from="{start}" data-to="{end}"></svg>')


# ================================================================== 1. hero (image 5)
def _hero(ctx):
    light = (f'<img class="who-hero__raster" src="{ctx.asset(A + "who-hero-light-1536.webp")}" '
             f'srcset="{ctx.asset(A + "who-hero-light-768.webp")} 768w, {ctx.asset(A + "who-hero-light-1536.webp")} 1536w" '
             f'sizes="(max-width: 799.98px) 175vw, (max-width: 1199.98px) 130vw, 100vw" width="1536" height="1024" '
             f'alt="" loading="eager" fetchpriority="high" decoding="async">')
    monitor = img(ctx, A + 'who-monitor.webp', '', w=768, h=598, cls='who-hero__img', eager=True,
                  attrs='fetchpriority="high"')
    # lower ledge light: the measured arc (image 5, design px), extended past both edges for wide screens
    ledge = ('M-420 520 C-200 548 0 575 100 590 S300 623 380 630 S600 678 700 694 S1050 735 1200 743 '
             'S1400 736 1536 730 S1800 722 1960 716')
    # "who we are." (Client update 5; image 5 reads "who are we.") - letters rise, the full stop is drawn as image 5's
    # round dot (the site face's period is square). The letter spans are inline-block, so screen readers would spell
    # them ('w h o w e a r e .', A11Y-04): the visual letters are aria-hidden and the H1 (and the hero region it
    # labels) is named once by the .sr-only words.
    words = ['who', 'we', 'are']
    letters = []
    k = 0
    for wi, word in enumerate(words):
        ls = ''
        for ch in word:
            ls += f'<span class="who-display__l" style="--i:{k}">{ch}</span>'
            k += 1
        if wi == len(words) - 1:
            ls += '<span class="who-display__dot"><span class="who-display__p">.</span></span>'
        letters.append(f'<span class="who-display__w">{ls}</span>')
    title = ' '.join(letters)
    return f'''<section class="who-hero" aria-labelledby="page-title" data-who-hero>
  <div class="who-hero__stage">
    <div class="who-hero__art" aria-hidden="true">
      <div class="who-hero__light" data-who-light>
        <div class="who-hero__lightin">
          {light}
          <span class="who-hero__beam who-hero__beam--up"></span>
          <span class="who-hero__beam who-hero__beam--main"><i class="who-hero__sheen"></i></span>
          <span class="who-hero__beam who-hero__beam--core"></span>
          <svg class="who-hero__ledge" viewBox="0 0 1536 1024" preserveAspectRatio="none" focusable="false">
            <path class="who-hero__ledge-glow" d="{ledge}"/>
            <path class="who-hero__ledge-line" d="{ledge}"/>
          </svg>
          <span class="who-hero__amber"></span>
        </div>
        <span class="who-hero__curtain"></span>
      </div>
      <div class="who-hero__monitor" data-who-monitor><div class="who-hero__tilt" data-who-tilt>{monitor}</div></div>
    </div>
    <h1 class="who-display" id="page-title" data-who-display><span class="sr-only">{E(' '.join(words).capitalize())}.</span><span class="who-display__txt" aria-hidden="true">{title}</span></h1>
  </div>
</section>'''


# ================================================================== 2. the person behind TESERACT (#founder)
def _founder(ctx):
    f = FD.F
    # the aside is the sticky unit on >= 800px: it carries no data-reveal of its own (a transform would not pin)
    html = f"""<section class="who-fdr" id="founder" aria-labelledby="founder-title" data-fdr>
  <div class="who-board who-board--f" data-who-in>
    {grid(GRID_X, (0,), [(x, 0) for x in GRID_X])}
    <div class="who-fdr__aside">
      {FD.bar('data-reveal="fade"')}
      {FD.frame(ctx)}
      {FD.roles('rows', 'data-reveal style="--d:200ms"')}
      {FD.links('data-reveal style="--d:260ms"')}
    </div>
    <div class="who-fdr__main">
      {FD.journey()}
      {FD.pull_quote(f['quote'], '1')}
      {FD.bio()}
    </div>
  </div>
</section>"""
    return FD.guard(html, [f['label'], f['name'], ' · '.join(f['roles']), *f['journey'], '“' + f['quote'] + '”', *f['body']])


# ================================================================== 3. intro (image 6 bands A, B, C)
def _intro(ctx):
    h = WHO['hero']
    b0, b1, b2 = (T(fmt(t)) for t in h['body'])
    title = T(h['title']).replace(' small', ' <br>small', 1).replace(' with', ' <br>with', 1)
    # ---- bands A + B: H2, the three hero.body annotations, rock, decorative boxes (board 1333 x 824)
    ab_wires = wires(1333, 824, ''.join([
        wire([(172, 445), (360, 445), (408, 496), (450, 496)], 300),        # body[0] rule + leader
        wire([(1060, 221), (800, 221), (759, 298), (683, 298)], 420),       # body[2] rule + leader
        wire([(1051, 450), (1018, 512), (975, 512)], 540),                  # /01 box leader
        wire([(968, 617), (1040, 617), (1104, 662)], 660),                  # rock -> tagline
        wire([(1115, 673), (1115, 742), (1306, 742)], 760, 'who-wire--br'),  # tagline bracket
        node(461, 496, red=True, d=900), node(672, 298, d=1000), node(964, 512, d=1100), node(1115, 662, d=1200),
    ]))
    deco_ab = f'''<div class="who-deco" aria-hidden="true">
      <div class="who-tag at" style="{at(675.5, 24, None, None, '--d:100ms')}" data-reveal="fade" aria-hidden="true"><p class="who-tag__box">Design <span>×</span> Technology <span>×</span> Experiences</p></div>
      <span class="who-globe at" style="{at(642, 63, 54)}">{svg('who-globe.svg')}</span>
      <div class="who-time at" style="{at(1297, 20)}" aria-hidden="true"><p class="who-time__in" data-who-time hidden><span class="who-time__l">Your local time</span> <time class="who-time__t" data-who-clock>00:00 AM</time></p></div>
      <span class="who-plus at" style="{at(1098, 77, 26)}"></span>
      <div class="who-b01 at" style="{at(1051, 295, 246, 155, '--d:300ms')}" data-reveal aria-hidden="true" data-who-pin="h">
        <p class="who-b01__head"><b>{T(BRAND)}</b><span>/01</span></p>
        <ul class="who-b01__list" role="list"><li>Strategy</li><li>Design</li><li>Technology</li><li>Experiences</li></ul>
      </div>
      <p class="who-note who-note--tagline at" style="{at(1151, 652, 170, '--d:420ms')}" data-reveal aria-hidden="true" data-who-pin="l-">{T(BRAND_COPY['tagline'])}</p>
      {ab_wires}
    </div>'''
    # the rock has its own in-view state (rise + one landing bob as it comes on screen, not when the board's top does)
    rock = f'''<div class="who-rock at" style="{at(404, 353, 576, 489)}" aria-hidden="true" data-who-in>
      <span class="who-rock__glow"></span>
      <div class="who-rock__par" data-who-par="-30"><div class="who-rock__float">
        {img(ctx, A + 'who-rock.webp', '', w=576, h=489, cls='who-rock__img')}
        <span class="who-rock__glass" data-who-glass></span>
      </div></div>
    </div>'''
    board_ab = f'''<div class="who-board who-board--ab" data-who-in>
    {grid(GRID_X, (445,), [(x, 445) for x in GRID_X])}
    {rail(end='edge')}
    <h2 class="who-intro__title at" id="intro-title" style="{at(35, 112, 640)}" data-split>{title}</h2>
    <p class="who-note who-note--lead at" style="{at(172, 366, 300, '--d:250ms')}" data-reveal data-who-pin="l!">{b0}</p>
    <div class="who-whobox at" style="{at(35, 571, 325, '--d:200ms')}" data-reveal data-who-pin="h">
      <p class="who-whobox__label"><span>Who we are</span></p>
      <div class="who-whobox__box">
        <span class="who-whobox__thumb">{img(ctx, A + 'who-abstract-01.webp', '', w=94, h=94)}</span>
        <p class="who-whobox__text">{b1}</p>
      </div>
    </div>
    <p class="who-note who-note--work at" style="{at(799, 140, 236, '--d:150ms')}" data-reveal data-who-pin="l-">{b2}</p>
    {deco_ab}
    {rock}
  </div>'''

    # ---- band C: the boxed-word statement (HOME.idea.body) + dial / sphere collage (board 1333 x 700; the owner
    #      removed the hand and the laptop photo, 15 Oct)
    def box(word, n):
        return f'<span class="who-bx" style="--n:{n}">{T(word)}</span>'

    def ic(name, file, draw=False):
        return f'<span class="who-ic who-ic--{name}" aria-hidden="true">{svg(file, draw=draw)}</span>'
    stmt_src = HOME['idea']['body']
    # the cube travels with "design," (image 6 line 2 starts with the cube) - one unbreakable group
    stmt = (f'We combine {ic("spark", "who-sparkle.svg")} {box("strategy,", 0)} '
            f'<span class="who-nw">{ic("cube", "who-cube.svg", True)} {box("design,", 1)}</span> technology, '
            f'{ic("rings", "who-rings.svg")} interaction and {box("storytelling", 2)} '
            f'{ic("arrow", "who-arrow.svg")} to create websites and digital experiences made specifically for your brand.')
    # guard: the rendered statement must read exactly as the document sentence
    plain = re.sub(r'\s+', ' ', re.sub(r'<svg.*?</svg>|<[^>]+>', '', stmt, flags=re.S)).strip()
    assert plain == stmt_src, plain
    disciplines = ''.join(f'<li>{T(d)}</li>' for d in HOME['idea']['disciplines'])
    tail = h['title'][h['title'].find('a small'):]          # "a small team with big ideas." (the H2, restated)
    small_team = T(tail).replace(' with', ' <br>with', 1)
    c_wires = wires(1333, 700, ''.join([
        wire([(728.5, 37.5), (808, 37.5), (871.5, 138)], 200),              # rock node -> chips node
        wire([(882, 138), (914, 138)], 420),                                 # -> chips (row spans 922-1311)
        wire([(300, 109), (418, 109)], 520, 'who-wire--arrow'),              # collab box arrow
        wire([(405, 299), (450, 299)], 640),                                 # dial -> node
        node(728.5, 37.5, d=100), node(871.5, 138, d=380), node(461, 299, red=True, d=820),
        '<path class="who-wire who-wire--head" d="M410 104 418 109 410 114" pathLength="1" style="--d:760ms"/>',
    ]))
    board_c = f'''<div class="who-board who-board--c" data-who-in>
    {grid(GRID_X, (), ())}
    {rail(start='edge')}
    <p class="who-stmt at" style="{at(503, 196, 800)}" data-split>{stmt}</p>
    <div class="who-deco" aria-hidden="true">
      <ul class="who-chips at" style="{at(922, 126, 389)}" role="list" aria-hidden="true" data-stagger="70" data-stagger-base="300" data-who-pin="h">{''.join(f'<li data-reveal="fade">{c}</li>' for c in ('Strategy', 'Design', 'Technology', 'Creativity'))}</ul>
      <div class="who-collab at" style="{at(116, 61, 200)}" data-reveal aria-hidden="true" data-who-pin="h!">
        <p class="who-collab__head">{svg('who-crenel.svg', 'who-collab__crenel')}{svg('who-burst.svg', 'who-collab__burst')}</p>
        <ul class="who-collab__list" role="list">{disciplines}</ul>
        <p class="who-collab__foot">{small_team}</p>
      </div>
      <div class="who-collage" aria-hidden="true">
        <div class="who-dial at" style="{at(-48, 68, 480, 480)}" data-who-dial>{svg('who-dial.svg')}</div>
        <span class="who-sphere at" style="{at(55, 556, 110, 110)}">{svg('who-sphere.svg')}</span>
      </div>
      <p class="who-endmark at" style="{at(1135, 600, 128, 44)}"><span class="who-endmark__g">{svg('who-globe.svg')}</span><span class="who-endmark__c">{svg('who-checker.svg')}</span></p>
      {c_wires}
    </div>
  </div>'''
    return f'''<section class="who-intro" id="intro" aria-labelledby="intro-title">
  {board_ab}
  {board_c}
</section>'''


# ================================================================== 4. why TESERACT exists (image-6 language)
def _why(ctx):
    w = WHO['why']
    title = fmt(w['title'])
    lead, rest = title.split(': ', 1)
    lead += ':'
    tail = 'exactly the same.'
    assert rest.endswith(tail)
    mid = rest[:-len(tail)]
    assert lead + ' ' + mid + tail == title
    rows = []
    for i, line in enumerate(w['replaced']):            # "Templates replaced thinking." -> culprit / verb / value
        a, r, v = re.fullmatch(r'(\w+) (replaced) (\w+\.)', line).groups()
        # the inter-word spaces sit INSIDE the verb span: with bare spaces between the spans Chromium computes the
        # toggle's accessible name as "Templatesreplaced thinking."
        rows.append(f'<li class="fdr-rs__row" style="--n:{i}"><span class="fdr-rs__line" data-swap>'
                    f'<span class="fdr-rs__a">{T(a)}</span><span class="fdr-rs__r"> {T(r)} </span><span class="fdr-rs__v">{T(v)}</span></span></li>')
    a, b = fmt(w['body']).split('. ', 1)
    a += '.'
    h, rest_c = w['closing'].split(': ', 1)
    h += ':'
    lines = rest_c.split(', ')
    lines = [l + ',' for l in lines[:-1]] + lines[-1:]
    assert ' '.join([h] + lines) == w['closing'] and len(lines) == 3
    goals = ' '.join(f'<span class="who-close__ln" style="--i:{i}">{T(l)}</span>' for i, l in enumerate(lines))
    # the H2 IS the inverted bar; column 2 (Gireesh's answer) stays one paragraph
    html = f"""<section class="who-why" id="why" aria-labelledby="why-title">
  <div class="who-board who-board--w" data-who-in>
    {grid(GRID_X, (0,), [(x, 0) for x in GRID_X])}
    <div class="who-b02" data-reveal><h2 class="who-b02__head" id="why-title"><span>{T(fmt(w['label']))}</span><span class="who-b02__n" aria-hidden="true">/02</span></h2></div>
    <p class="who-q" data-split><span class="who-q__lead">{T(lead)}</span> {T(mid)}<span class="who-bx who-bx--red" style="--n:0">{T(tail)}</span></p>
    <div class="fdr-rs" data-fdr-rs data-reveal style="--d:120ms">
      <p class="fdr-rs__head" hidden><span class="fdr-rs__hint" id="fdr-rs-hint" aria-hidden="true" data-fine="(click to restore)">(tap to restore)</span>
        <span class="fdr-rs__count" aria-hidden="true"><span class="fdr-roll"><span>0</span></span>/{len(rows)}</span><span class="fdr-rs__seal" aria-hidden="true">{SEAL}</span></p>
      <ul class="fdr-rs__list" role="list">{''.join(rows)}</ul>
    </div>
    <p class="who-ab" data-reveal data-fdr-rs-trigger><span class="who-ab__a">{T(a)}</span> <span class="who-ab__b">{T(b)}</span></p>
    {FD.pull_quote(w['quote'], '2', dot=True)}
    <div class="who-close" data-reveal style="--d:200ms">
      <p class="who-close__head" aria-hidden="true">{svg('who-crenel.svg', 'who-close__crenel')}{svg('who-burst.svg', 'who-close__burst')}</p>
      <p class="who-close__t"><span class="who-close__h">{T(h)}</span> {goals}</p>
    </div>
  </div>
</section>"""
    return FD.guard(html, [w['label'], w['title'], *w['replaced'], w['body'], '“' + w['quote'] + '”', w['closing']])


# ================================================================== 5. our philosophy (image 6 band D)
def _philosophy(ctx):
    p = WHO['philosophy']
    steps = ''.join(
        f'<li class="who-step" style="--i:{i}" data-who-step data-reveal data-who-pin="c"><span class="who-step__n" aria-hidden="true">{i + 1:02d}</span>'
        f'<h3 class="who-step__t">{T(s)}</h3></li>' for i, s in enumerate(p['steps']))
    d_wires = wires(1333, 500, ''.join([
        wire([(554, 155), (575, 155), (660, 245)], 500),
        node(671, 245, red=True, d=820),
    ]))
    link = ctx.url('our-approach')
    return f'''<section class="who-phil" id="philosophy" aria-labelledby="philosophy-title">
  <div class="who-board who-board--d" data-who-in>
    {grid(GRID_X, (0,), [(x, 0) for x in GRID_X])}
    {rail()}
    <div class="who-b03 at" style="{at(40, 42, 318, 293)}" data-reveal="fade" data-who-pin="h">
      <p class="who-b03__head"><span>{T(p['label'])}</span><span class="who-b03__n" aria-hidden="true">/03</span></p>
      <div class="who-b03__img reveal-image">{img(ctx, A + 'who-abstract-02.webp', '', w=197, h=235)}</div>
    </div>
    <div class="who-panel6 at" style="{at(251, 82, 303, '--d:200ms')}" data-reveal data-who-pin="h!">
      <h2 class="who-panel6__title" id="philosophy-title">{' '.join(f'<span class="who-panel6__ln">{T(x)}</span>' for x in _sentences(p['title']))}</h2>
      <p class="who-panel6__body">{T(p['body'])}</p>
    </div>
    <ol class="who-steps at" style="{at(733, 77, 560)}" role="list" data-stagger="110" data-stagger-base="150">{steps}</ol>
    <p class="who-phil__more at" style="{at(826, 405, None, None, '--d:600ms')}" data-reveal data-who-pin="l"><a class="who-link" href="{link}">{link_text("Our approach: how an idea becomes an experience")}</a></p>
    <div class="who-deco" aria-hidden="true">{d_wires}</div>
  </div>
</section>'''


# ================================================================== 6. how we think (image 7)
THINK = [
    # tags (rail, main), lead line breaks, side visual, link
    {'tags': ('people', 'experience'), 'panel': 'mark', 'link': ('what-we-create', 'See what we create')},
    {'tags': ('details', 'feel'), 'panel': 'detail', 'link': ('work', 'Explore our work')},
    {'tags': ('ideas', 'clarity'), 'panel': 'flat', 'link': ('contact', 'Start a project')},
]


def _sentences(text):
    parts = [s.strip() for s in re.findall(r'[^.]+\.', text)]
    return parts if ' '.join(parts) == text else [text]


def _think_title(title, n):
    """Giant H3 in the image-7 staircase: one line per <span class="who-sp__ln"> (indents in CSS)."""
    if n == 2:
        lines = ['Different', "doesn't mean", 'complicated.']
    else:
        lines = title.split(' ')
    assert ' '.join(lines) == title
    return ' '.join(f'<span class="who-sp__ln">{T(l)}</span>' for l in lines)


def _panel(ctx, kind, i):
    if kind == 'flat':
        visual = f'<span class="who-pnl__flat">{svg_inline("assets/brand/logo-mark.svg")}</span>'
    else:
        visual = mark3d(ctx, 'who-pnl__mark', 515)
    return (f'<div class="who-pnl who-pnl--{i + 1}" aria-hidden="true" data-who-pnl>'
            f'<span class="who-pnl__light"></span><span class="who-pnl__grid"></span>'
            f'<span class="who-pnl__vis" data-who-rot>{visual}</span></div>')


def _think(ctx):
    t = WHO['think']
    n = len(t['items'])
    spreads = []
    for i, ((title, lead, body), cfg) in enumerate(zip(t['items'], THINK)):
        lead_html = ' '.join(f'<span class="who-sp__s">{T(s)}</span>' for s in _sentences(lead))
        rail_tag, main_tag = cfg['tags']
        abstract = (f'<span class="who-sp__abs">{img(ctx, A + "who-abstract-03.webp", "", w=149, h=153)}</span>'
                    if i == 0 else '')
        rail_link = (f'<a class="who-sp__raillink" href="{ctx.url("our-approach")}">Our <br>approach</a>' if i == 0 else '')
        route, label = cfg['link']
        spreads.append(f'''<article class="who-sp who-sp--{i + 1}" aria-labelledby="think-{i + 1}" data-who-sp>
      <div class="who-sp__rail">
        <p class="who-sp__count" aria-hidden="true"><span class="who-sp__roll"><span>{i + 1:02d}</span></span> <span class="who-sp__dash">—</span> {n:02d}</p>
        {rail_link}
      </div>
      <h3 class="who-sp__title" id="think-{i + 1}" data-split>{_think_title(title, i)}</h3>
      <div class="who-sp__low">
        <div class="who-sp__side" aria-hidden="true" data-reveal="fade">
          <p class="who-sp__tag">({rail_tag})</p>
          {abstract}
          <p class="who-sp__idx">({i + 1:02d})</p>
        </div>
        <div class="who-sp__main">
          <p class="who-sp__tag who-sp__tag--main" aria-hidden="true" data-reveal="fade">({main_tag})</p>
          <p class="who-sp__lead" data-reveal style="--d:120ms">{lead_html}</p>
          <div class="who-sp__cols" data-reveal style="--d:220ms">
            <p class="who-sp__body">{T(body)}</p>
            <p class="who-sp__more"><a class="who-link" href="{ctx.url(route)}">{link_text(label)}</a></p>
          </div>
        </div>
        {_panel(ctx, cfg['panel'], i)}
      </div>
    </article>''')
    return f'''<section class="who-think" id="how-we-think" aria-labelledby="think-title">
  <div class="who-ed">
    <div class="who-ed__grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="who-ed__top" data-who-in>
      <h2 class="who-ed__label who-ed__label--h" id="think-title">{T(t['label'])}</h2>
      <a class="who-ed__label who-ed__link" href="#philosophy">{T(WHO['philosophy']['label'])}</a>
      <p class="who-ed__label who-ed__brand" aria-hidden="true">{T(BRAND)}</p>
    </div>
    {''.join(spreads)}
  </div>
</section>'''


# ================================================================== 7. our promise (image 7 bottom)
def _promise(ctx):
    p = WHO['promise']
    lines = ''.join(f'<li data-reveal style="--y:24px">{T(l)}</li>' for l in p['lines'])
    # (understand) (design) (build better): the verbs of WHO.philosophy.title
    labels = ['understand', 'design', 'build better']
    assert all(l in WHO['philosophy']['title'].lower() for l in labels)
    underline = ('<svg class="who-promise__line" viewBox="0 0 420 24" preserveAspectRatio="none" aria-hidden="true" focusable="false">'
                 '<path d="M5 15.5C70 8.5 170 5.5 262 7.2c55 1 104 4.2 153 9.3" pathLength="1"/></svg>')
    return f'''<section class="who-promise" id="promise" aria-labelledby="promise-title">
  <div class="who-ed who-ed--promise" data-who-in>
    <div class="who-ed__grid" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <ul class="who-promise__labels" role="list" aria-hidden="true" data-reveal="fade">{''.join(f'<li>({T(l)})</li>' for l in labels)}</ul>
    <div class="who-promise__body">
      <p class="who-promise__rail" data-reveal="fade">{T(p['label'])}</p>
      <h2 class="who-promise__title" id="promise-title" data-split>{T(p['title'])}</h2>
      <ul class="who-promise__lines" role="list" data-stagger="90" data-stagger-base="300">{lines}</ul>
      <p class="who-promise__q" data-reveal style="--y:40px;--d:620ms"><em>{T(p['question'])}</em>{underline}</p>
    </div>
  </div>
</section>'''


def render(ctx):
    # owner, 15 Oct: the founder profile comes directly after the hero
    return _hero(ctx) + _founder(ctx) + _intro(ctx) + _why(ctx) + _philosophy(ctx) + _think(ctx) + _promise(ctx)
