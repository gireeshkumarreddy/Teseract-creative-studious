"""Home — section 5: A DIFFERENT KIND OF AGENCY (reference images 9 + 8, spec
_ref/specs/image9-8-agency.md), on the black theme.

Part 1 (image 9) — H2 in two display lines + intro (two sentences) with a red rule; the astronaut
cut-out floating on black under a soft red ambient glow (behind the brain splash) and a faint ground
light; four annotated points (ordered list of H3s) tied to hot-spots on the figure by SVG leader
lines and "+" marks. Desktop ≥ 1024 is the reference composition on a 1614-unit artboard; tablet and
phone keep the "+" pins on the figure (numbered) and list the points below it.
Part 2 (image 8) — hairline, H3 "We work closely with our clients." (red full stop), the sub, a red
rule, the top-down meeting cut-out over an overhead light pool with its floor shadows, the
hand-lettered note and arrow; the section ends with the Start a Project CTA and a descriptive link to
/who-we-are/.

Copy is the document's only (content.py), mapped as in spec §4:
  H2 HOME.agency.label (+ typographic full stop) · intro HOME.agency.title + kicker ·
  points 01–03 = HOME.agency.nots, 04 = HOME.agency.closing up to its comma ·
  sub-lines: 01 STORIES.experience.lines[0:2] · 02 closing words of CREATE.services[0].body ·
  03 the FAQ answer to "Will my website look like a template?" ("Every project starts from zero") ·
  04 the rest of HOME.agency.closing ·
  part 2 = HOME.agency.body split after its first clause (subject "We" restored in the sub) ·
  note "Listen. Understand. Design." (APPROACH step 01 "First, we listen." + the approach verbs).
Micro-labels for client approval (spec §4): the three borrowed sub-lines 01–03, the note, the
ordinals 01–04, the full stop after the H2, the restored "We".

Motion (src/js/24-agency.js; static without JS and under reduced motion): headline line rise,
intro/sub fade-up (02-core data-reveal), red rules draw, glow + figure land (splash blooms, body
rises), "+" marks rotate in, leaders draw from the figure to each point, points stagger in, the
astronaut drifts ≤ 12 px either way with scroll (splash counter-drifts less), meeting photo opens
from the table outwards, the note's arrow and three lines are drawn in.
"""
import re

import lib
from lib import E, fmt, svg_inline
from content import HOME, CREATE, STORIES, FAQ, PRIMARY_CTA

A = 'assets/agency/'


def T(text):
    """Visible copy with typographic apostrophes (house style, as in HOME.idea)."""
    return fmt(text).replace("'", '’')


def _cap(s):
    s = s.strip()
    return s[:1].upper() + s[1:]


# Client approval switch (spec §4): the sub-lines of points 01–03 are document sentences borrowed from
# other sections (Client Experience, Website Design, the FAQ). False = the strict version that
# uses HOME.agency only: titles alone for 01–03, point 04 still split at its comma.
BORROWED_SUBLINES = True


def _points():
    """The four points: (title, [sub-line sentences]) — document wording only (spec §4)."""
    a = HOME['agency']
    nots = [n.rstrip('.').strip() for n in a['nots']]
    lead, rest = a['closing'].split(',', 1)                        # "Just good thinking" | "good design and …"
    if not BORROWED_SUBLINES:
        return [(nots[0], []), (nots[1], []), (nots[2], []), (lead.strip(), [_cap(rest)])]
    p1 = STORIES['experience']['lines'][:2]                        # "We communicate." "We share progress."
    web = next(s for s in CREATE['services'] if s['name'] == 'Website Design')['body']
    p2 = _cap(web.rsplit(' and ', 1)[1])                           # "Communicate your business clearly."
    # 03: the FAQ answer to "Will my website look like a template?" (WHO.why became the founder's "Why TESERACT exists"
    # on 15 Oct and no longer carries this sentence)
    src = next(ans for _q, ans in FAQ if 'Every project starts from zero' in ans)
    p3 = re.search(r'Every project starts from zero', src).group(0) + '.'
    assert p3 == 'Every project starts from zero.'
    return [(nots[0], p1), (nots[1], [p2]), (nots[2], [p3]), (lead.strip(), [_cap(rest)])]


# Leader geometry in artboard units (spec §1.3, viewBox "0 380 1614 1359" = image-9 y 380–1739).
# Paths run from the figure towards the text so they "grow" out of the hot-spots when drawn.
# (leader, number rule or None, + centre, + arm half-length)
LEADERS = [
    ('M489 516 L398 590 H194', None, (500, 507), 11),
    ('M1065 525 H1124 L1180 580', 'M1292 590 H1398', (1190, 588), 11),
    ('M678 1073 H580 L504 1039 H194', None, (695, 1072), 10),
    ('M1008 1126 H1069 L1135 1185 H1171', 'M1249 1188 H1343', (988, 1119), 10),
]
# The same hot-spots as % of the cut-out frame — the numbered pins used on tablet / phone.
PINS = [(4.9, 10.4), (94.3, 17.2), (30.2, 57.6), (68.1, 61.5)]


def _lines_svg():
    groups = []
    for i, (lead, rule, (cx, cy), r) in enumerate(LEADERS, 1):
        rule_html = f'<path class="agc-ld agc-ld--rule" pathLength="1" d="{rule}"/>' if rule else ''
        groups.append(
            f'<g class="agc-ln agc-ln--{i}" data-agc-ln="{i}">'
            f'<path class="agc-ld" pathLength="1" d="{lead}"/>{rule_html}'
            f'<path class="agc-pl" d="M{cx - r} {cy}h{2 * r}M{cx} {cy - r}v{2 * r}"/></g>')
    return (f'<svg class="agc-lines" viewBox="0 380 1614 1359" preserveAspectRatio="none" aria-hidden="true" '
            f'focusable="false">{"".join(groups)}</svg>')


def _srcset(ctx, name):
    return f'{ctx.asset(A + name + "-480.webp")} 480w, {ctx.asset(A + name + ".webp")} 772w'


def _figure(ctx):
    sizes = '(min-width:1024px) min(48vw, 643px), (min-width:800px) min(60vw, 520px), calc(100vw - 32px)'
    alt = 'Illustration: an astronaut in a white suit leaps forward while a red, brain-shaped splash bursts above the helmet'
    splash = lib.img(ctx, A + 'agency-astronaut-splash.webp', '', w=772, h=1198, cls='agc-fig__splash',
                     attrs=f'srcset="{_srcset(ctx, "agency-astronaut-splash")}" sizes="{sizes}"')
    body = lib.img(ctx, A + 'agency-astronaut-body.webp', alt, w=772, h=1198, cls='agc-fig__body',
                   attrs=f'srcset="{_srcset(ctx, "agency-astronaut-body")}" sizes="{sizes}"')
    shadow = lib.img(ctx, A + 'agency-astronaut-shadow.webp', '', w=1234, h=199, cls='agc-fig__shadow')
    # pins 01/02 sit on the splash, 03/04 on the body: --f = the drift factor of their layer (px)
    pins = ''.join(f'<span class="agc-pin" style="--x:{x}%;--y:{y}%;--k:{i};--f:{-6 if i < 2 else 12}">'
                   f'<span class="agc-pin__x"></span><i>{i + 1:02d}</i></span>'
                   for i, (x, y) in enumerate(PINS))
    return f'''<div class="agc-fig" data-agc-fig>
        <span class="agc-fig__glow" aria-hidden="true"></span>
        <span class="agc-fig__floor" aria-hidden="true"></span>
        {shadow}
        {splash}
        {body}
        <span class="agc-pins" aria-hidden="true">{pins}</span>
      </div>'''


def _point(i, title, subs):
    words = E(T(title)).replace('copy-paste', '<span class="agc-nw">copy-paste</span>')
    sub = ' '.join(f'<span>{E(T(s))}</span>' for s in subs)
    sub_html = f'<p class="agc-pt__s">{sub}</p>' if subs else ''
    return (f'<li class="agc-pt agc-pt--{i}" data-agc-pt="{i}">'
            f'<span class="agc-pt__n" aria-hidden="true">{i:02d}</span>'
            f'<h3 class="agc-pt__t">{words}</h3>{sub_html}</li>')


# Display kerning: at display tracking a vertical stem next to the T's bar (N|T, I|T, T|H) closes up
# completely in the fallback face, so the first glyph of each such pair gets a little extra space
# (.agc-k in 24-agency.css). The text itself is unchanged (no spaces, same accessible name).
_KERN = re.compile(r'([NnIi](?=[Tt])|[Tt](?=[Hh]))')


def _kern(html_text):
    return _KERN.sub(r'<span class="agc-k">\1</span>', html_text)


def _display_lines(lines, tail=''):
    """Display heading lines, each in its own mask for the line rise (24-agency.js / 24-agency.css)."""
    out = []
    for k, line in enumerate(lines):
        end = tail if k == len(lines) - 1 else ''
        out.append(f'<span class="agc-line" style="--k:{k}"><span class="agc-line__i">{_kern(E(T(line)))}{end}</span></span>')
    return ' '.join(out)


def _part1(ctx):
    a = HOME['agency']
    words = a['label'].split()
    h2 = _display_lines([' '.join(words[:2]), ' '.join(words[2:]) + '.'])
    points = ''.join(_point(i, t, s) for i, (t, s) in enumerate(_points(), 1))
    return f'''<div class="agc-a">
      <header class="agc-head">
        <h2 class="agc-title" id="agency-title" data-agc-in>{h2}</h2>
        <div class="agc-intro">
          <p class="agc-intro__p" data-reveal style="--d:220ms"><strong>{E(T(a['title']))}</strong> <span class="agc-intro__k">{E(T(a['kicker']))}</span></p>
          <span class="agc-rule" data-agc-in aria-hidden="true"></span>
        </div>
      </header>
      <div class="agc-stage">
        {_figure(ctx)}
        {_lines_svg()}
        <ol class="agc-pts" role="list">{points}</ol>
      </div>
    </div>'''


def _note():
    """Hand-lettered "LISTEN. / UNDERSTAND. / DESIGN." + arrow (filled paths, currentColor).
    Adds a stroke mask that draws the arrow and three clip bands that write the lines in
    (local coordinates of the note's text group, measured from the paths)."""
    svg = svg_inline(A + 'agency-note.svg', cls='agc-note').replace('<svg class="agc-note"', '<svg class="agc-note" data-agc-in', 1)
    defs = ('<defs>'
            '<mask id="agc-note-arrow" maskUnits="userSpaceOnUse" x="0" y="0" width="140" height="80">'
            '<path class="agc-note__m agc-note__m--shaft" pathLength="1" d="M127.8 50.8 L119.1 56.2 L109.8 60.8 '
            'L100.2 64.1 L90.1 65.8 L79.8 66.1 L69.7 64.5 L59.9 61.8 L50.7 57.2 L42.3 51.3 L34.9 44.1 L28.5 36 '
            'L23.2 27.2 L18.1 18.2 L16.4 14.6"/>'
            '<path class="agc-note__m agc-note__m--barb" pathLength="1" d="M16.4 14.4 L28 18.3"/>'
            '<path class="agc-note__m agc-note__m--barb2" pathLength="1" d="M16 14.6 L16.3 28.2"/></mask>'
            '<clipPath id="agc-note-text">'
            '<rect class="agc-note__band" style="--k:0" x="0" y="0" width="100" height="31"/>'
            '<rect class="agc-note__band" style="--k:1" x="0" y="31" width="186" height="35"/>'
            '<rect class="agc-note__band" style="--k:2" x="0" y="66" width="106" height="34"/></clipPath>'
            '</defs>')
    svg = re.sub(r'(<svg[^>]*>)', lambda m: m.group(1) + defs, svg, count=1)
    svg = svg.replace('<g class="note-arrow">', '<g class="note-arrow" mask="url(#agc-note-arrow)">', 1)
    svg = re.sub(r'<g class="note-text"', '<g class="note-text" clip-path="url(#agc-note-text)"', svg, count=1)
    return svg


def _part2(ctx):
    a = HOME['agency']
    head, rest = a['body'].split(',', 1)                     # "We work closely with our clients" | "understand …"
    hw = head.split()
    lines = [' '.join(hw[k:k + 2]) for k in range(0, len(hw), 2)]   # WE WORK / CLOSELY WITH / OUR CLIENTS
    title = _display_lines(lines, tail='<span class="agc-b__dot">.</span>')
    sub = 'We ' + rest.strip()
    meeting_alt = ('Seen from above: two people shake hands across a small round table with a laptop, '
                   'coffee and a notebook, seated in white armchairs')
    scene = lib.img(ctx, A + 'agency-meeting.webp', meeting_alt, w=728, h=475, cls='agc-scene__img',
                    attrs=f'srcset="{ctx.asset(A + "agency-meeting-480.webp")} 480w, {ctx.asset(A + "agency-meeting.webp")} 728w" '
                          f'sizes="(min-width:1024px) min(45vw, 607px), (min-width:800px) min(82vw, 728px), calc(100vw - 32px)"')
    shadow = lib.img(ctx, A + 'agency-meeting-shadow.webp', '', w=800, h=655, cls='agc-scene__shadow')
    lead = lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=28, h=28, cls='agc-lead')
    btn = lib.button(ctx, PRIMARY_CTA, ctx.url('contact'), variant='dark', lead=lead, cls='agc-cta__btn')
    link_text = fmt('Who we are and why {brand} exists')       # owner micro-label: names the reworked section
    link = (f'<a class="agc-link" href="{E(ctx.url("who-we-are"))}">'
            f'<span class="agc-link__t">{E(link_text)}</span>'
            f'<span class="agc-link__i" aria-hidden="true">{lib.ICONS["arrow-r"]}</span></a>')
    return f'''<div class="agc-b">
      <div class="agc-b__stage">
        <div class="agc-b__copy">
          <h3 class="agc-b__title" data-agc-in>{title}</h3>
          <p class="agc-b__sub" data-reveal style="--d:200ms">{E(T(sub))}</p>
          <span class="agc-rule agc-rule--b" data-agc-in aria-hidden="true"></span>
        </div>
        <div class="agc-scene" data-agc-scene>
          <span class="agc-scene__pool" aria-hidden="true"></span>
          {shadow}
          {scene}
          {_note()}
        </div>
        <div class="agc-cta" data-reveal style="--d:480ms">
          {btn}
          {link}
        </div>
      </div>
    </div>'''


def render(ctx):
    return f'''<section class="agc section" id="agency" aria-labelledby="agency-title" data-agc>
  <div class="container">
    {_part1(ctx)}
    {_part2(ctx)}
  </div>
</section>'''
