"""Home — section 4: WHAT WE BELIEVE + OUR NUMBERS (reference image 10, spec
_ref/specs/image10-believe.md), on the black theme.

Composition (desktop ≥ 1024 is the reference poster, placed in % of the content box):
  red dot + eyebrow → H2 in two uppercase lines → six-photo editorial strip with micro-captions and
  two corner captions → hairline → "01" + four-line statement (white lead sentence, grey
  continuation, two skewed "italic" phrases) → side label + two text columns → numbers row
  → red rule bleeding off the left edge of the viewport.
Tablet 800–1023.98 re-flows the strip into a two-band 12-column grid; phone ≤ 799.98 is a
2-column stacked flow (see 23-believe.css).

Copy is the document's (content.py) only:
  eyebrow HOME.believe.label · H2 HOME.believe.title · statement HOME.believe.body[0] (H3 = sentence
  1, <p> = sentence 2) · left column body[1] + body[2] · right column HOME.numbers (H3 label, body,
  <dl> of the four items). The reference's invented paragraphs are not used.
Micro-labels (client approval pending, every one restates document wording — see MICRO below and
the spec §8): six photo captions, two corner captions, the side label, the link text.

Motion (src/js/23-believe.js + 03-motion vocabulary; all static under reduced motion / no JS):
  eyebrow fade-up · H2 word/line rise (data-split) · photos clip-reveal upward with a slight
  scale-down, staggered in reading order, captions follow · hairline + stat rules + red rule draw
  in from the left · the statement's lead sentence brightens word by word from the reference grey
  to white, scroll-linked, and settles on the reference two-tone (white lead, grey continuation) ·
  numeric stats count up and settle on the exact document strings.

`card()`, `tile()` and `carousel()` (the former coverflow testimonial pieces) stay here as generic parts
(.bel-card / .bel-car CSS in 23-believe.css, behaviour in 23-carousel.js); Client Stories now has its own
client-reviews section (pages/stories.py), so nothing renders them today.
"""
import re

import lib
from lib import E, fmt, BRAND, CONFIG, ICONS, svg_inline
from content import HOME, CREATE, WHO, BRAND as BRAND_COPY


def T(text):
    """Visible copy with typographic apostrophes (house style, as in HOME.idea)."""
    return fmt(text).replace("'", '’')


# ==================================================================================================
# Section 4 — WHAT WE BELIEVE (image 10)
# ==================================================================================================

# The owner's six images (18 Oct; AI-generated, owner 18 Oct; note: LAUNCH-CHECKLIST.md 3g; originals in
# C:/Teseract-media/_supplied/believe-2026-10-18/). Web copies in public/assets/believe/ (non-manifest WebP, metadata
# stripped) at three widths each, <stem>-<w>.webp: 1x desktop (just above the slot's widest 1x box, 900–1439.98 and
# ≥ 1440), 2x desktop, 3x phone (the largest never above the original); src = the middle copy. The slot shapes and
# crops are in 23-believe.css (.bel__fig--1 … --6, list order = slot order = reading order).
# stem, widths, intrinsic w, h (of the largest copy), alt (literal: these are mood images, never the team or a
# client; any text in the image read in full), micro-caption (client-approved wording and order, unchanged; source
# in the comment).
PHOTOS = [
    ('believe-ai-agent-monitor', (160, 320, 640), 640, 640,
     'A desktop monitor showing an AI agent app: a blurred photo of football players under the headline '
     '“Engineered Comfort, Maximum Running Speed”, a text prompt and tool buttons',
     'Intuitive experiences'),        # CREATE.services[0] "feel intuitive" + "digital experiences"
    ('believe-orange-visor', (160, 320, 640), 640, 850,
     'A figure in black wearing a glowing orange visor over the eyes, against a white background',
     'Thoughtful design'),            # HOME.hero.lead "thoughtful … digital experiences"
    ('believe-people-first-poster', (320, 640, 1086), 1086, 1448,
     'Black-and-white poster reading “People first. Stories always.” and “Every face has a story. Every story '
     'deserves to be seen.”, between two groups of people dressed in black, one standing on the floor and one '
     'upside down on the ceiling',
     'People first'),                 # WHO.think[0] "People first."
    ('believe-overload-poster', (180, 360, 600), 600, 848,
     'Poster reading “Overload”: a dark, smeared face behind a black bar, surrounded by screenshots of TV news',
     'Complex made simple'),          # HOME.believe.body[2] "We make complex things feel simple."
    ('believe-puppet-screens', (180, 360, 640), 640, 1138,
     'A hand pulling red strings tied to floating, glitching browser windows on a black background',
     'Purposeful technology'),        # HOME.agency.closing "technology that serves a purpose"
    ('believe-exhibition-screens', (288, 600, 960), 960, 540,
     'A silhouetted figure standing in a dark hall of glowing image screens and coloured plinths',
     'The right idea'),               # WHO.philosophy.steps[2] "Then we find the right idea."
]

# `sizes` per slot (the CSS width of .bel__fig--N in 23-believe.css): ≥ 1440 the 1344 px artboard, 900–1439.98
# the artboard at 100vw − 80 px, 520–899.98 the 12-column grid (≤ 760 px: 3, 6 or 5 columns), < 520 the
# two-column flow (half or full width of 100vw − 32 px).
SLOT_SIZES = [
    '(min-width:1440px) 149px, (min-width:900px) calc(11.08vw - 9px), (min-width:520px) calc(25vw - 14px), calc(50vw - 20px)',
    '(min-width:1440px) 149px, (min-width:900px) calc(11.08vw - 9px), (min-width:520px) calc(25vw - 14px), calc(50vw - 20px)',
    '(min-width:1440px) 315px, (min-width:900px) calc(23.44vw - 19px), (min-width:520px) calc(50vw - 20px), calc(100vw - 32px)',
    '(min-width:1440px) 170px, (min-width:900px) calc(12.6vw - 10px), (min-width:520px) calc(25vw - 14px), calc(50vw - 20px)',
    '(min-width:1440px) 170px, (min-width:900px) calc(12.6vw - 10px), (min-width:520px) calc(25vw - 14px), calc(50vw - 20px)',
    '(min-width:1440px) 280px, (min-width:900px) calc(20.81vw - 17px), (min-width:520px) calc(42vw - 18px), calc(100vw - 32px)',
]

ARROW = ('<svg class="bel__arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" '
         'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')


def _two_lines(text, before):
    """'Digital experiences built around your business.' -> ('Digital experiences', 'built around your business')."""
    text = T(text).rstrip('.')
    i = text.find(' ' + before)
    return (text[:i], text[i + 1:]) if i > 0 else (text, '')


def _corner(text, before, side, delay):
    a, b = _two_lines(text, before)
    lines = ' '.join(f'<span>{E(x)}</span>' for x in (a, b) if x)   # spaces keep the text readable when extracted
    return (f'<li class="bel__corner bel__corner--{side}" data-reveal="fade" style="--d:{delay}ms">'
            f'<p>{lines}</p></li>')


def _strip(ctx):
    items = []
    for i, ((stem, widths, w, h, alt, cap), sizes) in enumerate(zip(PHOTOS, SLOT_SIZES), 1):
        d = (i - 1) * 90
        srcset = ', '.join(f'{ctx.asset(f"assets/believe/{stem}-{x}.webp")} {x}w' for x in widths)
        img = lib.img(ctx, f'assets/believe/{stem}-{widths[1]}.webp', alt, w=w, h=h, cls='bel__img',
                      attrs=f'srcset="{E(srcset)}" sizes="{sizes}"')
        items.append(
            f'<li class="bel__fig bel__fig--{i}" data-reveal style="--d:{d}ms">'
            f'<figure><div class="bel__media">{img}</div>'
            f'<figcaption class="bel__cap">{E(cap)}</figcaption></figure></li>')
    # corner captions: CREATE.hero.title (left) and BRAND.tagline (right), verbatim
    items.append(_corner(CREATE['hero']['title'], 'built', 'l', 620))
    items.append(_corner(BRAND_COPY['tagline'], 'the', 'r', 700))
    return f'<ul class="bel__strip" role="list">{"".join(items)}</ul>'


def _statement():
    """HOME.believe.body[0] verbatim: sentence 1 is the H3 (white), sentence 2 the grey continuation.
    The reference sets the second 'easy to' and the last word in italic (skewed in CSS; the site
    font has no italic). 'It should' and the closing 'easy to remember.' are kept together so the
    narrow tiers never leave a lone grey 'IT' or a single-word last line ('REMEMBER.')."""
    text = T(HOME['believe']['body'][0])
    lead, sep, rest = text.partition('. ')
    if not sep:
        return f'<h3 class="bel__lead">{E(text)}</h3>'
    cont = E(rest)
    cont = re.sub(r'^(\S+ \S+)', r'<span class="bel__nw">\1</span>', cont, count=1)
    parts = cont.split('easy to')
    if len(parts) >= 3:          # italicise the second occurrence only
        cont = parts[0] + 'easy to' + parts[1] + '<i>easy to</i>' + 'easy to'.join(parts[2:])
    # last word in italic, bound to the two words before it (no single-word last line)
    cont = re.sub(r'(\S+ \S+) (\S+)$', r'<span class="bel__nw">\1 <i>\2</i></span>', cont)
    return (f'<h3 class="bel__lead">{E(lead)}.</h3> '
            f'<p class="bel__cont">{cont}</p>')


def _stat(value, label, i):
    """<div><dt>label</dt><dd>value</dd></div>; the value is shown above the label (column-reverse).
    Numeric values ('20K+', '2M+') carry data-count for the count-up; the HTML text is always
    the document string, so no-JS, crawlers and screen readers get the exact value."""
    m = re.fullmatch(r'(\d+(?:\.\d+)?)(\D*)', value)
    count = f' data-count="{m.group(1)}" data-suffix="{E(m.group(2))}"' if m else ''
    return (f'<div class="bel__stat" data-reveal style="--d:{i * 110}ms;--y:24px">'
            f'<dt>{E(T(label))}</dt><dd><span class="bel__num"{count}>{E(value)}</span></dd></div>')


def render(ctx):
    b, n = HOME['believe'], HOME['numbers']
    s1, _, s2 = T(b['title']).partition('. ')
    lines = [s1 + '.', s2] if s2 else [T(b['title'])]
    title = ' '.join(f'<span class="bel__line">{E(x)}</span>' for x in lines)
    brand_rest = CONFIG['brand_full'].replace(BRAND, '').strip()
    side = [BRAND, brand_rest, re.sub(r'^Our\s+', '', WHO['philosophy']['label'])]
    side_html = ' '.join(f'<span>{E(x)}</span>' for x in side if x)
    stats = ''.join(_stat(v, l, i) for i, (v, l) in enumerate(n['items']))
    think = ctx.url('who-we-are', 'how-we-think')
    return f'''<section class="bel section" id="believe" aria-labelledby="believe-title">
  <div class="container bel__in">
    <p class="bel__eyebrow" data-reveal style="--y:20px"><span class="bel__dot" aria-hidden="true"></span>{E(T(b['label']))}</p>
    <h2 class="bel__title" id="believe-title" data-split>{title}</h2>
    {_strip(ctx)}
    <div class="bel__divider" data-reveal aria-hidden="true"></div>
    <div class="bel__grid">
      <p class="bel__index" data-reveal="fade" aria-hidden="true"><span class="bel__dot"></span>01</p>
      <div class="bel__statement" data-split data-bel-ink>{_statement()}</div>
      <p class="bel__side" data-reveal style="--d:80ms;--y:24px">{side_html}</p>
      <div class="bel__col bel__col--l" data-reveal style="--d:160ms;--y:32px">
        <p>{E(T(b['body'][1]))} <strong>{E(T(b['body'][2]))}</strong></p>
        <a class="bel__link" href="{E(think)}">Read how we think{ARROW}</a>
      </div>
      <div class="bel__col bel__col--r" data-reveal style="--d:260ms;--y:32px">
        <h3 class="bel__sub" id="believe-numbers">{E(T(n['label']))}</h3>
        <p>{E(T(n['body']))}</p>
      </div>
      <dl class="bel__stats">{stats}</dl>
    </div>
    <div class="bel__red" data-reveal aria-hidden="true"></div>
  </div>
</section>'''


# ==================================================================================================
# Generic testimonial card + coverflow carousel (styles .bel-card / .bel-car in 23-believe.css,
# behaviour in 23-carousel.js). Not used on the home page any more, nor on Client Stories, which has
# its own client-reviews section (pages/stories.py, 34-stories.css/js).
# ==================================================================================================

# Small upward trend line (reference stat icon, 22x20, drawn in brand red).
TREND = ('<svg class="bel-card__trend" viewBox="0 0 22 20" width="22" height="20" aria-hidden="true" focusable="false">'
         '<path d="M2.03 16.44 6.77 12.09a.5.5 0 0 1 .65-.02l3.45 2.74a.5.5 0 0 0 .67-.05l6.88-7.17M15.8 6.91l2.35.08'
         'c.46.02.82.4.81.86l-.04 2.56" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" '
         'stroke-linejoin="round"/></svg>')

DOTS = '<span class="bel-card__dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'


def _count_attrs(value):
    """data-count attributes for numeric stats such as 20K+ / 2M+ (count-up when visible)."""
    m = re.fullmatch(r'(\d+)(\D*)', value)
    if not m:
        return ''
    return f' data-count="{m.group(1)}" data-suffix="{E(m.group(2))}"'


def tile(value, label, *, trend=False, html_value=None):
    count = _count_attrs(value)
    if html_value:
        num = html_value
    elif count:   # animated digits are decorative; the final value is always in the accessibility tree
        num = f'<span class="bel-card__val" aria-hidden="true"{count}>{E(value)}</span><span class="sr-only">{E(value)}</span>'
    else:
        num = f'<span class="bel-card__val">{E(value)}</span>'
    icon = TREND if trend else ''
    return (f'<li class="bel-card__tile"><span class="bel-card__num">{num}{icon}</span>'
            f'<span class="bel-card__label">{E(label)}</span></li>')


def avatar_mark():
    """Brand mark in the reference avatar slot (44 px circle, near-black tile, white flat mark)."""
    return f'<span class="bel-card__avatar" aria-hidden="true">{svg_inline("assets/brand/logo-mark.svg")}</span>'


def card(*, quote_html, name, role, avatar_html='', tiles_html='', kicker_html='', stars=0,
         compact=False, single=False, statement=False, cls=''):
    """Reference testimonial card (Framer component "testimonials").

    kicker_html replaces the star row (used for brand statements); stars are only rendered when a
    real rating is supplied. quote_html is trusted, already-escaped HTML."""
    top = ''
    if stars:
        top = (f'<span class="bel-card__stars" role="img" aria-label="Rated {int(stars)} out of 5">'
               + ''.join(f'<i>{ICONS["star"]}</i>' for _ in range(int(stars))) + '</span>')
    elif kicker_html:
        # the slide's own aria-label ("n of N") already announces the position
        top = f'<span class="bel-card__kicker mono" aria-hidden="true">{kicker_html}</span>'
    who = (f'<div class="bel-card__author">{avatar_html}<span class="bel-card__who">'
           f'<span class="bel-card__name">{name}</span><span class="bel-card__role">{role}</span></span></div>')
    tiles = ''
    if tiles_html:
        mods = (' bel-card__tiles--strip' if compact else '') + (' bel-card__tiles--single' if single else '')
        tiles = f'<ul class="bel-card__tiles{mods}" role="list">{tiles_html}</ul>'
    qcls = 'bel-card__quote' + (' bel-card__quote--statement' if statement else '')
    body = quote_html if quote_html.lstrip().startswith('<blockquote') else f'<p>{quote_html}</p>'
    return (f'<article class="bel-card{(" " + cls) if cls else ""}">{DOTS}{top}'
            f'<div class="{qcls}">{body}</div>{who}{tiles}</article>')


def carousel(slides, *, label, cid, cls=''):
    """Coverflow carousel (reference Framer Slideshow). slides: list of card HTML strings.

    Markup follows the WAI-ARIA tabbed-carousel pattern: region with aria-roledescription
    "carousel", a rotation control, slides as tabpanels labelled "n of N" and dot tabs.
    Without JS the track is a native horizontal scroll-snap list."""
    n = len(slides)
    items = ''.join(
        f'<div class="bel-car__slide" id="{cid}-s{i + 1}" role="tabpanel" aria-roledescription="slide" '
        f'aria-label="{i + 1} of {n}" data-carousel-slide>{s}</div>'
        for i, s in enumerate(slides))
    dots = ''.join(
        f'<button class="bel-car__dot" type="button" role="tab" id="{cid}-t{i + 1}" aria-controls="{cid}-s{i + 1}" '
        f'aria-label="Slide {i + 1}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}">'
        f'<i aria-hidden="true"></i></button>'
        for i in range(n))
    pause = ('<button class="bel-car__play" type="button" data-carousel-toggle aria-label="Stop automatic slide show">'
             '<svg class="bel-car__ic-pause" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3.5 2.5v7M8.5 2.5v7" '
             'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
             '<svg class="bel-car__ic-play" viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="M3.6 2.2v7.6L9.8 6z" '
             'fill="currentColor" stroke="currentColor" stroke-width="1" stroke-linejoin="round"/></svg></button>') if n > 1 else ''
    controls = (f'<div class="bel-car__controls">'
                f'<div class="bel-car__dots" role="tablist" aria-label="Choose a slide">{dots}</div>{pause}</div>') if n > 1 else ''
    return (f'<section class="bel-car{(" " + cls) if cls else ""}" aria-roledescription="carousel" aria-label="{E(label)}" '
            f'data-carousel data-carousel-direction="right" data-interval="4000">'
            f'<div class="bel-car__viewport" data-carousel-viewport>'
            f'<div class="bel-car__track" data-carousel-track aria-live="off">{items}</div></div>'
            f'{controls}</section>')
