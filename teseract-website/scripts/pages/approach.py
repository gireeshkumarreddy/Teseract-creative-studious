"""OUR APPROACH page (/our-approach/) - the image-4 flowchart "How An Idea Becomes An Experience."

One DOM, two layouts (src/css/32-approach.css):
  >= 1200px  "poster": the 1333 x 2000 design canvas of image 4, scaled to the container
             (--u = W / 1333, W = min(container, 1440px)). Text blocks are absolutely placed at
             their measured design coordinates (--x/--y, box tops in design px). Every line, node,
             diamond, YES/NO circle and the launch burst live in one inline SVG overlay that shares
             the same coordinate system (viewBox 0 0 1333 2000), so connectors land exactly.
  <  1200px  "flow": the same <ol> of steps becomes a left-rail timeline; decisions become compact
             NO <- diamond -> YES rows (small inline SVGs) and the overlay SVG is hidden.
Motion (src/js/32-approach.js): the spine draws with scroll progress; steps, decisions, the burst
and the sign-off switch on (class .is-on on every [data-k] element) when the drawing tip reaches
their trigger y (data-y). Connector draws are SVG masks whose stroke-dashoffset is transitioned.

Black theme: the diagram is drawn white-on-black; every colour (incl. the arrowhead marker, class
w-ah) comes from the .ap tokens in 32-approach.css, so no colour literals live in this markup.

Copy: content.APPROACH (+ the WHO "Details matter." item as the sign-off, NAV label for the
kicker). The short diagram labels (decision questions, YES/NO, the boxes, the bracket lists that
the document does not supply, the discipline strip and the tag) are image 4's own labels.
"""
import math
import re

from lib import E, BRAND
from content import APPROACH, WHO, NAV

INDEX = '02 — 09'          # image 4's own pagination label (see report: master IA would be "04 - 07")
DISCIPLINES = ['Strategy', 'Design', 'Technology', 'Experience']
TAG = ['A better', 'digital', 'experience']

NODE = {1: (685, 195.5), 2: (748.5, 512.5), 3: (748.5, 743.5), 4: (748.5, 916.5), 5: (748.5, 1063.5),
        6: (748.5, 1298.5), 7: (748.5, 1437), 8: (748.5, 1648.5), 9: (748.5, 1748.5)}
ACCENT = {1, 8, 9}
INLINE = {7, 8, 9}
SPINE_X = 748.5


# ------------------------------------------------------------------ text helpers
def T(text):
    """Escape + typographic apostrophes."""
    return E(text.replace("'", '’'))


def _norm(s):
    return ' '.join(s.split())


def br(src, *lines, tag='br class="br-d"'):
    """Poster line breaks for a content string. The lines must re-join to the source exactly, so
    the copy can never drift from content.py. Below 1200px the .br-d breaks are hidden."""
    joined = ' '.join(lines)
    assert _norm(src) == _norm(joined), (src, joined)
    return f'<{tag}> '.join(T(l) for l in lines)


def brk(src, *lines):
    """Hard breaks (kept in every layout) - the spaced uppercase step subtitles."""
    return br(src, *lines, tag='br')


def at(x, y, **extra):
    s = f'--x:{x:g};--y:{y:g}'
    for k, v in extra.items():
        s += f';--{k}:{v:g}' if isinstance(v, (int, float)) else f';--{k}:{v}'
    return f' style="{s}"'


def strip_dot(s):
    return s.rstrip('.')


# ------------------------------------------------------------------ overlay SVG builder
def path_bbox(d, pad=12):
    """Bounding box of a path made of absolute M/L/H/V commands (all connectors are), padded so
    the stroke and the 8 x 6 arrowheads stay inside. Used as the mask region: a full-canvas mask
    region costs a full-size offscreen buffer per masked path on every repaint."""
    xs, ys = [], []
    x = y = 0.0
    for cmd, args in re.findall(r'([MLHV])([^MLHV]*)', d):
        nums = [float(n) for n in re.findall(r'-?\d+(?:\.\d+)?', args)]
        if cmd in 'ML':
            for i in range(0, len(nums), 2):
                x, y = nums[i], nums[i + 1]
                xs.append(x); ys.append(y)
        elif cmd == 'H':
            for x in nums:
                xs.append(x); ys.append(y)
        else:
            for y in nums:
                xs.append(x); ys.append(y)
    x0, y0 = min(xs) - pad, min(ys) - pad
    return f'x="{x0:g}" y="{y0:g}" width="{max(xs) - min(xs) + 2 * pad:g}" height="{max(ys) - min(ys) + 2 * pad:g}"'


class Wires:
    """Collects SVG markup. Every connector gets its own userSpace mask whose solid white copy is
    'drawn' (pathLength=1, dashoffset 1 -> 0), so dotted and solid lines and their arrowheads
    reveal along the path. The mask region is the path's own padded bbox (cheap repaints). JS
    removes the mask once the draw is over."""

    def __init__(self):
        self.n = 0

    def line(self, d, cls='w-solid', *, s=False, e=False, t=0, dur=320, ez=None, extra=''):
        self.n += 1
        mid = f'apm{self.n}'
        st = f'--t:{t}ms;--dur:{dur}ms' + (f';--ez:var({ez})' if ez else '')
        marks = (' marker-start="url(#ap-ah)"' if s else '') + (' marker-end="url(#ap-ah)"' if e else '')
        return (f'<mask id="{mid}" class="w-mask" maskUnits="userSpaceOnUse" {path_bbox(d)}>'
                f'<path d="{d}" pathLength="1" style="{st}"/></mask>'
                f'<path class="{cls}{(" " + extra) if extra else ""}" d="{d}" mask="url(#{mid})"{marks}/>')


def node_svg(n, cx, cy, accent, delay=0):
    st = f' style="--nd:{delay}ms"' if delay else ''
    acc = ' is-accent' if accent else ''
    ripple = f'<circle class="w-ripple" cx="{cx:g}" cy="{cy:g}" r="5"/>' if accent else ''
    return (f'<g class="w-node{acc}"{st}><circle class="w-ring" cx="{cx:g}" cy="{cy:g}" r="15.5"/>'
            f'{ripple}<circle class="w-pip" cx="{cx:g}" cy="{cy:g}" r="5"/></g>')


def diamond_svg(cx, cy, lines):
    pts = f'{cx:g},{cy - 36:g} {cx + 52:g},{cy:g} {cx:g},{cy + 36:g} {cx - 52:g},{cy:g}'
    n = len(lines)
    texts = ''.join(f'<text class="w-dia-t" x="{cx:g}" y="{cy + (i - (n - 1) / 2) * 15 + 3.73:g}">{T(l)}</text>'
                    for i, l in enumerate(lines))
    return f'<polygon class="w-dia" points="{pts}" pathLength="1"/>{texts}'


def yes_svg(cx, cy):
    return (f'<g class="w-yes"><circle cx="{cx:g}" cy="{cy:g}" r="20"/>'
            f'<text x="{cx:g}" y="{cy + 3.9:g}">YES</text></g>')


def no_svg(cx, cy):
    return (f'<g class="w-no"><circle cx="{cx:g}" cy="{cy:g}" r="16"/>'
            f'<text x="{cx:g}" y="{cy + 3.55:g}">NO</text></g>')


# Launch burst (image 4 section 4.6): fan centre (1089, 1647), inner radius 40, long rays every
# ~11.7 deg with the measured outer radii, short rays interleaved at half steps.
BURST_C = (1089, 1647)
LONG_RAYS = [(-102, 84), (-90, 95), (-78.9, 103), (-66.5, 121), (-54.4, 125), (-42.0, 141), (-31.4, 145),
             (-21.3, 137), (-11.2, 147), (0, 143), (11.9, 136), (23.3, 119), (35.2, 118), (47.8, 104),
             (61.5, 92), (74.8, 80), (90, 72), (102, 64)]


def burst_svg(prefix=''):
    cx, cy = BURST_C
    rays = []
    for k, (a, r2) in enumerate(LONG_RAYS):
        rays.append((a, 40, r2))
        if k + 1 < len(LONG_RAYS):
            a2 = (a + LONG_RAYS[k + 1][0]) / 2
            rays.append((a2, 60, 76 + (k * 53) % 22))
    out = []
    for a, r1, r2 in rays:
        rad = math.radians(a)
        x1, y1 = cx + r1 * math.cos(rad), cy + r1 * math.sin(rad)
        x2, y2 = cx + r2 * math.cos(rad), cy + r2 * math.sin(rad)
        out.append(f'<path class="w-ray" d="M{x1:.1f},{y1:.1f}L{x2:.1f},{y2:.1f}" pathLength="1" style="--i:{abs(a) / 11.7:.2f}"/>')
    return (f'<g class="w-rays">{"".join(out)}</g>'
            '<path class="w-burst-half" d="M1074,1637a14,14 0 0 0 0,28Z"/>'
            '<circle class="w-burst-disc" cx="1074" cy="1649.5" r="9.5"/>'
            '<rect class="w-burst-tick" x="1073" y="1631" width="2" height="9"/>')


# ------------------------------------------------------------------ overlay SVG (poster)
def wires_svg():
    w = Wires()
    L = w.line
    g = []

    def grp(key, y, body, end=0, cls=''):
        g.append(f'<g class="w-grp{(" " + cls) if cls else ""}" data-k="{key}" data-y="{y:g}" data-end="{end}">{body}</g>')

    # static frame: hairlines, ghost column, ghost spine (always visible, very light)
    static = ('<path class="w-frame" d="M43.5,0V2040M1289,0V2040"/>'
              '<path class="w-col" d="M495.5,0V1850"/>'
              f'<path class="w-ghost" d="M685,116V392M{SPINE_X:g},428V1733"/>')

    # the spine itself: revealed by a clip rect that follows the drawing tip
    spine = (f'<g class="w-spine" clip-path="url(#ap-spine-clip)">'
             '<path class="w-soft" d="M685,115.5V180M685,211V392"/>'
             f'<path class="w-solid" d="M{SPINE_X:g},497V431" marker-end="url(#ap-ah)"/>'
             f'<path class="w-solid" d="M{SPINE_X:g},528V1164" marker-end="url(#ap-ah)"/>'
             f'<path class="w-solid" d="M{SPINE_X:g},1283V1242" marker-end="url(#ap-ah)"/>'
             f'<path class="w-solid" d="M{SPINE_X:g},1314V1733"/></g>')

    # 01 Understand
    grp('s1', 187, node_svg(1, *NODE[1], True))
    # D1 - Clear direction?
    grp('d1', 350,
        L('M748.5,349V356', 'w-soft', dur=120)
        + diamond_svg(748.5, 392, ['Clear', 'direction?'])
        + L('M696.5,392H652', e=True, t=420, dur=300)
        + L('M614,392.5H583V281H672', 'w-dot w-loop', s=True, e=True, t=800, dur=900, ez='--ap-loop')
        + L('M800.5,392H844.5', e=True, t=300, dur=260)
        + L('M887.5,392.5H986V652H752', e=True, t=600, dur=900, ez='--ap-loop')
        + no_svg(633, 392.5) + yes_svg(867.5, 392.5)
        + '<circle class="w-trav" r="7"/>', end=1800, cls='w-dec')
    # 02 Define
    grp('s2', 504, node_svg(2, *NODE[2], False) + L('M731,574H686', e=True, t=300, dur=280), end=700)
    # 03 Explore (+ boxes and the side node 03b)
    grp('s3', 735,
        node_svg(3, *NODE[3], False)
        + L('M950,786H1052', e=True, t=300, dur=320)
        + L('M369,816H431M369,856H431M369,896H431M431,816V896', 'w-dot', t=900, dur=450)
        + L('M431,856H677', 'w-dot', e=True, t=1150, dur=500)
        + node_svg('3b', 696, 856, True, delay=1550)
        + L('M696,840.5V762H746', 'w-dot', t=1700, dur=450), end=2300)
    # 04 Design
    grp('s4', 908,
        node_svg(4, *NODE[4], False)
        + L('M718,956H668', 'w-dot', e=True, t=300, dur=300)
        + L('M1056,955H1013V880H752', e=True, t=700, dur=650), end=1500)
    # 05 Refine
    grp('s5', 1055, node_svg(5, *NODE[5], False) + L('M958,1109H1038', e=True, t=300, dur=300), end=700)
    # D2 - Everything ready?
    grp('d2', 1160,
        diamond_svg(748.5, 1203, ['Everything', 'ready?'])
        + L('M800.5,1203H845', e=True, t=300, dur=260)
        + L('M868,1223V1268', e=True, t=760, dur=280)
        + L('M888,1203H991V1308H1056', 'w-dot w-loop', t=800, dur=900, ez='--ap-loop')
        + L('M696.5,1203H630.5', 'w-dot', e=True, t=420, dur=300)
        + L('M572,1100H611.5V1184', 'w-dot w-loop', e=True, t=800, dur=900, ez='--ap-loop')
        + L('M369,1100H335V1203H592.5', 'w-dot w-loop', e=True, t=800, dur=900, ez='--ap-loop')
        + no_svg(611.5, 1203) + yes_svg(868, 1203), end=1800, cls='w-dec')
    # 06 Build
    grp('s6', 1290, node_svg(6, *NODE[6], False) + L('M722,1334H612', e=True, t=300, dur=300), end=700)
    # 07 Test
    grp('s7', 1429, node_svg(7, *NODE[7], False))
    # D3 - All good?
    grp('d3', 1480,
        L('M800,1488V1503', e=True, dur=160)
        + diamond_svg(800, 1542, ['All good?'])
        + L('M852,1542H889', e=True, t=300, dur=240)
        + L('M912,1561.5V1606', e=True, t=760, dur=280)
        + L('M748,1542H684', 'w-dot', e=True, t=420, dur=300)
        + L('M586,1487H622V1542H646', 'w-dot w-loop', e=True, t=800, dur=900, ez='--ap-loop')
        + L('M416,1487H373V1609H800V1581', 'w-dot w-loop', e=True, t=800, dur=900, ez='--ap-loop')
        + no_svg(665, 1542) + yes_svg(912, 1541.5), end=1800, cls='w-dec')
    # 08 Launch (+ burst)
    grp('s8', 1640,
        node_svg(8, *NODE[8], True)
        + L('M735,1651H700', 'w-dot w-dash', e=True, t=300, dur=280)
        + L('M1004,1653H1060', 'w-heavy', t=300, dur=300)
        + burst_svg(), end=1400, cls='w-burst')
    # 09 Evolve (+ return to the ongoing list)
    grp('s9', 1740,
        node_svg(9, *NODE[9], True)
        + L('M748.5,1764V1820H629V1802', t=300, dur=420)
        + L('M629,1802V1765H592', 'w-dot', e=True, t=700, dur=380), end=1200)
    # Sign-off rule with the blue dot and the up arrow
    grp('end', 1790,
        L('M81,1848H971V1831', 'w-heavy', e=True, dur=1100, ez='--ap-loop')
        + '<circle class="w-rule-dot" cx="177.4" cy="1844.2" r="7.25"/>', end=1300)

    defs = ('<defs><marker id="ap-ah" viewBox="0 0 8 6" refX="8" refY="3" markerWidth="8" markerHeight="6" '
            'markerUnits="userSpaceOnUse" orient="auto-start-reverse"><path class="w-ah" d="M0,0L8,3L0,6Z"/></marker>'
            '<clipPath id="ap-spine-clip" clipPathUnits="userSpaceOnUse"><rect class="w-clip" x="0" y="0" width="1333" height="2000"/></clipPath></defs>')
    top = '<circle class="w-top" cx="685" cy="108" r="7.25"/><circle class="w-play" cx="685" cy="108" r="4.5"/>'
    return (f'<svg class="ap-wires" viewBox="0 0 1333 2000" preserveAspectRatio="xMidYMin meet" aria-hidden="true" focusable="false">'
            f'{defs}{static}{spine}{top}{"".join(g)}</svg>')


# ------------------------------------------------------------------ flow-mode mini SVGs
def mini_decision(label_lines, solid_no=False):
    """Compact NO <- diamond -> YES row (image-4 vocabulary) for the flow layout."""
    n = len(label_lines)
    texts = ''.join(f'<text class="m-dia-t" x="130" y="{44 + (i - (n - 1) / 2) * 14 + 3.6:g}">{T(l)}</text>'
                    for i, l in enumerate(label_lines))
    no_line = 'm-solid' if solid_no else 'm-dot'
    return ('<svg class="ap-dec__mini" viewBox="0 0 300 108" aria-hidden="true" focusable="false">'
            f'<path class="m-dot m-loop" d="M24,26V7"/><path class="m-ah" d="M21,9L24,1L27,9Z"/>'
            f'<path class="{no_line}" d="M78,44H49"/><path class="m-ah" d="M49,41L41,44L49,47Z"/>'
            '<polygon class="m-dia" points="130,8 182,44 130,80 78,44"/>'
            f'{texts}'
            '<path class="m-solid" d="M182,44H234"/><path class="m-ah" d="M234,41L242,44L234,47Z"/>'
            '<path class="m-solid" d="M262,64V96"/><path class="m-ah" d="M259,96L262,104L265,96Z"/>'
            '<g class="m-no"><circle cx="24" cy="44" r="16"/><text x="24" y="47.5">NO</text></g>'
            '<g class="m-yes"><circle cx="262" cy="44" r="20"/><text x="262" y="47.9">YES</text></g>'
            '</svg>')


def mini_burst():
    return ('<svg class="ap-burst-mini" viewBox="990 1524 260 248" aria-hidden="true" focusable="false">'
            f'<path class="w-heavy" d="M992,1653H1060"/>{burst_svg()}</svg>')


# ------------------------------------------------------------------ HTML blocks
def head(n, step):
    x, y = NODE[n]
    inline = n in INLINE
    hx, hy = (783, y - 19.5) if inline else ((714 if n == 1 else 779.5), y - 16)
    sub_lines = SUBS[n]
    return (f'<div class="ap-head{" ap-head--inline" if inline else ""} ap-at"{at(hx, hy)}>'
            f'<h2 class="ap-head__title" id="ap-step-{n}"><span class="ap-num">{E(step["n"])}</span> '
            f'<span class="ap-name"><span>{T(step["name"])}</span></span></h2>'
            f'<p class="ap-sub">{brk(step["sub"], *sub_lines)}</p></div>')


SUBS = {1: ('First,', 'we listen.'), 2: ('Then, we find', 'the direction.'), 3: ('Now we start', 'thinking differently.'),
        4: ('The idea starts', 'to take shape.'), 5: ('Details make', 'the difference.'), 6: ('Design meets', 'technology.'),
        7: ('Before people', 'use it, we test it.'), 8: ('Ready for', 'the world.'), 9: ('Launch is', 'not the end.')}


def note(cls, x, y, html, tag='p', extra=''):
    return f'<{tag} class="ap-note ap-note--{cls} ap-at{(" " + extra) if extra else ""}"{at(x, y)}>{html}</{tag}>'


def bracket(items, x, y, w, inset, lh, extra=''):
    lis = ''.join(f'<li style="--i:{i}">{T(strip_dot(t))}</li>' for i, t in enumerate(items))
    cols = ' ap-list--cols' if len(items) >= 6 else ''
    rows = math.ceil(len(items) / 2)   # phone: two content-sized columns (DOM order runs down column 1 first)
    return f'<ul class="ap-list ap-x{cols} ap-at{(" " + extra) if extra else ""}"{at(x, y, w=w, lh=lh, rows=rows, **{"in": inset})}>{lis}</ul>'


def decision(key, question_lines, no_lines, no_src, nx, ny, yes_to, solid_no=False):
    q = ' '.join(question_lines)
    sr = f'Decision: {q} Yes, continue to {yes_to}. No, {no_src[0].lower() + no_src[1:]}'
    return (f'<div class="ap-dec" data-k="{key}">'
            f'<p class="sr-only">{T(sr)}</p>'
            f'{mini_decision(question_lines, solid_no)}'
            f'<p class="ap-dec__no ap-at" aria-hidden="true"{at(nx, ny)}>{br(no_src, *no_lines)}</p></div>')


def step_li(n, step, side, extra):
    acc = ' ap-node--accent' if n in ACCENT else ''
    return (f'<li class="ap-step{" ap-step--inline" if n in INLINE else ""}" data-k="s{n}">'
            f'<span class="ap-node{acc}" aria-hidden="true"></span>'
            f'{head(n, step)}'
            f'<div class="ap-side">{side}</div>'
            f'{f"<div class={chr(34)}ap-extra{chr(34)}>{extra}</div>" if extra else ""}</li>')


def steps_html():
    S = {int(s['n']): s for s in APPROACH['steps']}
    out = []

    # 01 Understand
    s = S[1]
    side = (note('r', 885, 287.5, br(s['body'] + ' ' + ' '.join(s['list']),
                                     'Before we design anything,', 'we learn about your business.',
                                     'Your goals. Your audience.', 'Your competitors. Your challenges.', 'Your vision.'))
            + f'<div class="ap-result ap-at"{at(1143, 287)}><p class="ap-result__label">Result</p>'
              f'<p class="ap-result__text">{br(s["result"], "A clear understanding", "of what we" + chr(39) + "re building", "and why.")}</p></div>')
    extra = decision('d1', ['Clear', 'direction?'], ['Go deeper.', 'Ask the right', 'questions.'],
                     'Go deeper. Ask the right questions.', 597, 412.5, 'step 02, Define', solid_no=True)
    out.append(step_li(1, s, side, extra))

    # 02 Define
    s = S[2]
    bullets = ''.join(f'<li>{T(t)}</li>' for t in s['list'])
    side = (f'<div class="ap-note ap-note--l ap-note--define ap-at"{at(440, 548)}>'
            f'<p>{br(s["body"] + " " + s["list_intro"], "We turn everything we" + chr(39) + "ve", "learned into a clear plan. We define:")}</p>'
            f'<ul class="ap-bullets">{bullets}</ul>'
            f'<p class="ap-mini-result"><span class="ap-mini-result__label">Result</span> {T(s["result"])}</p></div>')
    out.append(step_li(2, s, side, ''))

    # 03 Explore
    s = S[3]
    ask = s['ask']
    side = (note('r', 1064, 760.5, br(s['body'], 'We explore ideas, layouts,', 'references and visual directions.'))
            + note('r', 1064, 818.5, br(' '.join(ask), ask[0], ask[1], ask[2] + ' ' + ask[3]), extra='ap-note--ask'))
    boxes = ''.join(f'<li style="--i:{i}">{T(t)}</li>' for i, t in enumerate(['Ideas', 'References', 'Directions']))
    extra = f'<ul class="ap-boxes ap-x ap-at"{at(238, 801)}>{boxes}</ul>'
    out.append(step_li(3, s, side, extra))

    # 04 Design
    s = S[4]
    side = note('l', 425, 932.5, br(' '.join(s['list']) + ' ' + s['body'],
                                     'Typography. Colours. Layouts.', 'Components. Images. Interactions.',
                                     'Everything starts coming together.'))
    extra = bracket(['Wireframes', 'UI Design', 'Design System', 'Interactions'], 1057, 913, 198, 34, 22.3)
    out.append(step_li(4, s, side, extra))

    # 05 Refine
    s = S[5]
    side = note('r', 1048, 1087.5, br(s['body'] + ' ' + s['closing'], s['body'], s['closing']))
    extra = (bracket(s['list'], 370, 1030, 201, 28, 22.2, extra='ap-list--left')
             + decision('d2', ['Everything', 'ready?'], ['Refine and', 'improve.'], 'Refine and improve.',
                        590, 1222.5, 'step 06, Build'))
    out.append(step_li(5, s, side, extra))

    # 06 Build
    s = S[6]
    side = note('l', 372, 1290, br(s['body'] + ' ' + s['closing'],
                                    'Once the direction is approved, we', 'bring the experience to life.',
                                    'We develop the website, integrate', 'the required functionality and make',
                                    'it responsive across devices.'))
    extra = bracket(['Development', 'CMS Setup', 'Integrations', 'Responsive'], 1057, 1267, 175, 33, 22.6)
    out.append(step_li(6, s, side, extra))

    # 07 Test
    s = S[7]
    extra = (bracket(s['list'], 417, 1397, 168, 26, 20, extra='ap-list--left')
             + decision('d3', ['All good?'], ['Fix, optimise', 'and retest.'], 'Fix, optimise and retest.',
                        638, 1562.5, 'step 08, Launch'))
    out.append(step_li(7, s, '', extra))

    # 08 Launch
    s = S[8]
    side = note('l', 512, 1634.5, br(s['body'] + ' ' + s['closing'], 'Once everything is tested',
                                      'and approved, we launch.', 'Your idea becomes a real', 'digital experience.'))
    extra = f'<div class="ap-burst ap-x">{mini_burst()}</div>'
    out.append(step_li(8, s, side, extra))

    # 09 Evolve
    s = S[9]
    side = note('r', 1036, 1744.5, br(s['body'] + ' ' + s['closing'], 'Businesses change. Your website',
                                       'should be able to change with them.', 'We can continue supporting,',
                                       'improving and evolving your digital', 'experience as your business grows.'),
                extra='ap-note--rule')
    extra = bracket(['Ongoing Support', 'Improvements', 'New Features', 'Scaling'], 371, 1721, 210, 34, 21, extra='ap-list--left')
    out.append(step_li(9, s, side, extra))
    return f'<ol class="ap-steps" role="list">{"".join(out)}</ol>'


def hero_html():
    words = APPROACH['hero']['title'].rstrip('.').split()
    words = [w[:1].upper() + w[1:] for w in words]
    groups = [words[0:1], words[1:3], words[3:4], words[4:5], words[5:6]]
    lines = []
    for i, gw in enumerate(groups):
        last = i == len(groups) - 1
        dot = '<i class="ap-title__dot" aria-hidden="true"></i>' if last else ''
        lines.append(f'<span class="l" style="--i:{i}"><span>{T(" ".join(gw))}{dot}</span> </span>')
    body = ' '.join(APPROACH['hero']['body'])
    kicker = next(label for key, label, _ in NAV if key == 'our-approach').lower().split()
    return (f'<div class="ap-hero">'
            f'<p class="ap-index ap-at"{at(78, 137)}>{E(INDEX)}</p>'
            f'<p class="ap-kicker ap-at"{at(78, 165)}>{"<br>".join(E(k) for k in kicker)}</p>'
            f'<h1 class="ap-title ap-at" id="ap-title"{at(68, 233)}>{"".join(lines)}</h1>'
            f'<p class="ap-intro ap-at"{at(996, 122)}>{br(body, "Great work doesn" + chr(39) + "t happen", "in one step. We take the time", "to understand, explore, design,", "build and refine.")}</p>'
            f'</div>')


def masthead_html():
    disc = ''.join(f'<li>{E(d)}</li>' for d in DISCIPLINES)
    return (f'<div class="ap-mast">'
            f'<p class="ap-word ap-at"{at(81, 26)}>{E(BRAND.lower())}</p>'
            f'<ul class="ap-disc ap-at" aria-label="Disciplines"{at(531, 32)}>{disc}</ul>'
            f'<p class="ap-tag ap-at"{at(1170, 26.7)}>{"<br>".join(E(t) for t in TAG)}</p>'
            f'</div>')


def signoff_html():
    title, line1, line2 = next(item for item in WHO['think']['items'] if item[0].startswith('Details'))
    body = br(line1 + ' ' + line2, line1, 'Small details can change how something feels.', 'We care about those details.')
    return (f'<div class="ap-sign" data-k="end">'
            f'<span class="ap-sign__rule" aria-hidden="true"><i></i></span>'
            f'<h2 class="ap-sign__title ap-at"{at(76, 1868.5)}><span>{T(title)}</span></h2>'
            f'<p class="ap-sign__body ap-at"{at(644, 1886)}>{body}</p>'
            f'<p class="ap-sign__index ap-at" aria-hidden="true"{at(1187, 1908)}>{E(INDEX)}</p>'
            f'</div>')


def render(ctx):
    return (f'<section class="ap" id="approach" aria-labelledby="ap-title">'
            f'<div class="ap-poster">'
            f'{wires_svg()}'
            f'{masthead_html()}{hero_html()}{steps_html()}{signoff_html()}'
            f'</div></section>')
