"""THE WORK page (/work/).

Hero (reference page-hero lockup + project-name marquee, which the shared "Pause motion" control stops - WCAG 2.2.2,
chrome.motion_toggle) -> intro lines -> the studio's own projects in
two sections, "Client Work" and "Concepts & Interactive" (the latter introduced as self-initiated work,
never as client commissions; every concept card carries its label) -> how a case study is structured ->
"your project could be next" slot. Projects come from scripts/projects.py (shown = captured media).

Each card shows the project in its DEVICE SCENE (lib.scene: backdrop + drawn monitor/laptop, portfolio.json
"scene"/"device") with a gallery still on the screen - stills on this page, for speed, except a project's
portfolio.json "card_clip" (owner, 14 Oct: Aivinci's tiger, the one card that autoplays: muted, looped, inline, lazy,
playing only in view, its poster under reduced motion / Save-Data - lib.video + 06-video.js); the project pages play
the recordings. A project without a scene (owner: Geetha Jewellers) shows its still in the same frame.
Card text: title, the project's label ("Client Project", "Interactive Concept" + its "Unofficial, ..." line, "Concept
Project", "Personal project" - owner, 14 Oct; also the scene's caption pill), industry, year and services; the scene and
the text link both lead to the project page ("View Project" cursor through lib.project_tag). The tile helper is reused
by pages/project.py.
"""
import lib
from lib import E, fmt, ICONS, roll, button, pill_label
import chrome
import content
import projects as P

W = content.WORK

# Rendered widths of the card (container = 1344 px at >=1440, viewport - 2*40 on tablet, - 2*16 on phone).
SIZES_FULL = '(min-width:1440px) 1344px, (min-width:800px) calc(100vw - 80px), calc(100vw - 32px)'
SIZES_HALF = '(min-width:1440px) 664px, (min-width:800px) calc(50vw - 48px), calc(100vw - 32px)'
# Rendered widths of the still on a scene's screen: about half the card on a 16:10 stage (monitor 44 %,
# laptop 50 %), about 80 % of it on a narrow 4:5 stage (cards under 640 px: phones, tablet pairs).
# A card narrower than 640 px (phones, tablet pairs) - the 4:5 stage of a plain frame.
SIZES_NARROW = '(min-width:1440px) 640px, (min-width:800px) calc(50vw - 48px), calc(100vw - 32px)'
SCREEN_SIZES = {
    'full': '(min-width:1440px) 680px, (min-width:800px) 50vw, 84vw',
    'half': '(min-width:1440px) 340px, (min-width:1376px) 25vw, (min-width:800px) 40vw, 84vw',
}


def T(text):
    """Visible copy with typographic apostrophes (house style, as stories.T)."""
    return fmt(text).replace("'", '’')


def caps(title):
    """' is-caps' for an all-caps project name (AARADHYA, SAANJH): 90-font-hn.css eases its
    tracking so adjacent capitals keep a gap."""
    return ' is-caps' if title.isupper() else ''


def services(p):
    """Services as listed in the portfolio data (scripts/portfolio.json)."""
    return list(p.get('services_list') or [])


def _aspect(p):
    """Card flex ratio in a pair row: every card is a scene frame of the same aspect (16:10 stage; 4:5 when
    narrow, for both cards of a pair at once), so pairs share the width equally."""
    return 1.6


def lead_mark(ctx):
    """Brand avatar used as the leading visual of the high-emphasis (white, .btn--dark) CTA buttons
    (reference Contact button): the transparent mark on the same dark coin as the hero, agency and
    footer "Start a Project" buttons (.wk-lead)."""
    return lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=28, h=28, cls='wk-lead')


def caption(p, *, date=None, title=None, industry=None):
    """ZIP project caption: square black mono box, year on top, TITLE · INDUSTRY below.
    Decorative (aria-hidden): the same facts are in the card text / link name."""
    d = E(date if date is not None else p['date'])
    t = title if title is not None else p['title']
    i = industry if industry is not None else p['industry']
    ind = (f'<span class="wk-cap__dot">·</span><span class="wk-cap__ind">{roll(i)}</span>') if i else ''
    return (f'<span class="wk-cap" aria-hidden="true"><span class="wk-cap__date">{d}</span>'
            f'<span class="wk-cap__line"><span class="wk-cap__title">{roll(t)}</span>{ind}</span></span>')


def tile(ctx, p, *, sizes, eager=False, cls='', focusable=False, size='full', caption=False):
    """Project tile: the project's device scene with its Work still on the screen (lib.scene), or - no scene
    style - the still itself in the same frame (lib.plain_frame), as a link with the View Project cursor.
    focusable=False keeps it out of the tab order when a text link next to it already leads to the same
    place (the card's own link then drives the hover state). Such a duplicate is also hidden from assistive
    tech, so screen-reader link lists name each project once (by the card's own link) instead of twice.
    A device scene always carries its label caption; caption=True also puts the label pill on a plain frame, and an
    Interactive Concept's "Unofficial, ..." line under the pill on both (the next-project tile, which has no card text
    with the label beside it)."""
    extra = '' if focusable or not lib.project_href(ctx, p) else 'tabindex="-1" aria-hidden="true"'
    open_, close = lib.project_tag(ctx, p, ('wk-tile wk-tile--scene ' + cls).strip(), extra=extra)
    clip = p.get('card_clip')
    if p['scene'] and clip:
        # the screen is at most ~600 CSS px wide: the 1280 variant (and its 1280 poster) is sharp enough
        media = lib.scene(ctx, p, lib.video(ctx, clip, clip_label(p, clip), cls='scn-media', max_width=1280, poster_width=1280),
                          note=caption, attrs='data-reveal="fade"', aspect=clip_aspect(clip))
    elif p['scene']:
        st = p['scene_still']
        img = lib.media_img(ctx, st['entry'], st['alt'], sizes=SCREEN_SIZES[size], eager=eager, cls='scn-media', max_width=1920)
        media = lib.scene(ctx, p, img, note=caption, attrs='data-reveal="fade"', aspect=st['w'] / st['h'])
    elif clip:
        media = lib.plain_frame(p, lib.video(ctx, clip, clip_label(p, clip), cls='scn-media', max_width=1920), caption=caption,
                                note=caption, attrs='data-reveal="fade"')
    else:
        st = p['cover']
        # on a narrow (4:5) stage a desktop still loses both edges: the project's first phone screen shows instead
        # (CSS container query in 38-scene.css; the hidden lazy image is never fetched)
        phone = next((s for s in p['stills'] if s['frame'] == 'phone'), None) if st['frame'] != 'phone' else None
        img = lib.media_img(ctx, st['entry'], st['alt'], sizes=sizes, eager=eager,
                            cls='scn-media' + (' scn-media--wide' if phone else ''), max_width=1920,
                            attrs=f'style="object-position:{P.focal(p, st)}"')
        if phone:
            img += lib.media_img(ctx, phone['entry'], phone['alt'], sizes=SIZES_NARROW, eager=eager,
                                 cls='scn-media scn-media--narrow', max_width=1280,
                                 attrs=f'style="object-position:{P.focal(p, phone)}"')
        media = lib.plain_frame(p, img, caption=caption, note=caption, attrs='data-reveal="fade"')
    return f'{open_}{media}{close}'


def clip_label(p, clip):
    """Accessible name of a card clip: the project and what the clip shows (capture report)."""
    shows = (clip.get('alt') or '').strip()
    return f"{p['title']} — {shows}" if shows else f"{p['title']} — video"


def clip_aspect(clip):
    src = clip.get('source') or {}
    top = max(clip['variants'], key=lambda v: v['width'])
    return (src.get('width') or top['width']) / (src.get('height') or top['height'])


def card_link(ctx, p):
    """Doc card template call to action: the project page, the live site, or nothing."""
    if p['kind'] == 'case':
        return (f'<a class="wk-link" href="{ctx.url(p["route"])}" aria-label="{E(W["card_cta"])}: {E(p["title"])}">'
                f'<span class="wk-link__label">{E(W["card_cta"])}</span>'
                f'<span class="wk-link__icon" aria-hidden="true">{ICONS["arrow-r"]}</span></a>')
    if p['kind'] == 'external':
        return (f'<a class="wk-link wk-link--ext" href="{E(p["url"])}" target="_blank" rel="noopener" '
                f'aria-label="Visit Site: {E(p["title"])} (opens in a new tab)">'
                f'<span class="wk-link__label">Visit Site</span>'
                f'<span class="wk-link__icon" aria-hidden="true">{ICONS["arrow-ne"]}</span></a>')
    return ''


def card(ctx, p, n, size):
    slug = E(p['slug'])
    meta = []
    if p.get('label'):        # the project's label (owner, 14 Oct), always visible: Client Project / Interactive Concept
        # (+ its small "Unofficial, ..." line) / Concept Project / Personal project
        note = f'<span class="wk-tag__note">{E(p["note"])}</span>' if p.get('note') else ''
        meta.append(f'<p class="wk-tag wk-tag--{E(p["label_kind"])}"><i aria-hidden="true"></i>'
                    f'<span class="wk-tag__label">{E(p["label"])}</span>{note}</p>')
    # the year stays on the line of the industry's last word (never ' · 2026' alone on a line, e.g. at tablet width)
    head, _, last = p['industry'].rpartition(' ')
    meta.append(f'<p class="wk-meta"><span class="wk-meta__k">Industry:</span> {E(head + " " if head else "")}'
                f'<span class="wk-meta__item">{E(last)}<span class="wk-meta__sep" aria-hidden="true"> · </span>'
                f'<span class="sr-only">. Year: </span>{E(p["year"])}</span></p>')
    svc = services(p)
    if svc:
        # each service stays on one line with its trailing separator; lines break between services
        items = ' '.join(f'<span class="wk-meta__item">{E(s)}{"&nbsp;·" if i < len(svc) - 1 else ""}</span>'
                         for i, s in enumerate(svc))
        meta.append(f'<p class="wk-meta"><span class="wk-meta__k">What we created:</span> {items}</p>')
    link = card_link(ctx, p)
    # Info grid: index · title · call to action on one baseline, the doc's card lines below the title.
    return f'''<article class="wk-card wk-card--{size}" style="--a:{_aspect(p):.4f}" aria-labelledby="wk-t-{slug}">
  {tile(ctx, p, sizes=SIZES_FULL if size == 'full' else SIZES_HALF, size=size)}
  <div class="wk-info" data-reveal style="--y:24px;--d:120ms">
    <span class="wk-info__n" aria-hidden="true">{n:02d}</span>
    <h3 class="wk-info__title{caps(p['title'])}" id="wk-t-{slug}">{E(lib.name_text(p['title']))}</h3>
    <div class="wk-info__meta">{''.join(meta)}</div>
    {f'<div class="wk-info__cta">{link}</div>' if link else ''}
  </div>
</article>'''


def rows(items, pattern=P.ROWS):
    """Editorial rhythm: one full-width row, then two pairs, repeated (11 projects -> 1 2 2 1 2 2 1).
    Pairs size their tiles by aspect ratio (CSS) so both images keep their native ratio at equal height."""
    out, i, k = [], 0, 0
    while i < len(items):
        n = min(pattern[k % len(pattern)], len(items) - i)
        out.append(items[i:i + n]); i += n; k += 1
    return out


def hero(ctx):
    first, second = [T(t) for t in W['hero']['title']]
    names = ''.join(('<li class="is-caps">' if caps(p['title']) else '<li>') + f'{E(p["title"])}</li>' for p in P.PROJECTS)
    ctas = (button(ctx, content.PRIMARY_CTA, ctx.url('contact'), variant='dark', lead=lead_mark(ctx))
            + button(ctx, 'See the projects', ctx.url('work', 'projects'), variant='light'))
    return f'''<section class="wk-hero" aria-labelledby="wk-hero-title">
  <div class="container wk-hero__inner">
    <div class="wk-hero__lockup">
      {pill_label('The Work')}
      <h1 class="wk-hero__title" id="wk-hero-title" data-reveal style="--y:80px;--d:200ms"><span>{E(first)}</span> <span class="wk-hero__second">{E(second)}</span></h1>
      <p class="wk-hero__sub" data-reveal style="--y:80px;--d:300ms">{E(T(W['hero']['body']))}</p>
    </div>
    <div class="wk-hero__ctas" data-reveal style="--y:60px;--d:400ms">{ctas}</div>
  </div>
  <div class="container wk-hero__band" data-reveal="fade" style="--d:600ms" data-motion-scope>
    <div class="wk-marquee" data-ticker data-direction="left" data-speed="25" aria-hidden="true">
      <ul class="wk-marquee__list" data-ticker-list role="list">{names}</ul>
    </div>
    {chrome.motion_toggle(cls='wk-hero__motion')}
  </div>
</section>'''


def intro(ctx):
    it = W['intro']
    lines = ''.join(f'<li class="wk-intro__row" data-reveal><span class="wk-intro__n" aria-hidden="true">{i:02d}</span>'
                    f'<span class="wk-intro__text">{E(T(t))}</span></li>' for i, t in enumerate(it['lines'], 1))
    return f'''<section class="wk-intro section" aria-labelledby="wk-intro-title">
  <div class="container wk-intro__grid">
    <h2 class="wk-intro__title" id="wk-intro-title" data-split>{E(T(it['title']))}</h2>
    <div class="wk-intro__body">
      <ol class="wk-intro__list" role="list" data-stagger="140">{lines}</ol>
      <p class="wk-intro__closing" data-reveal style="--d:640ms"><i aria-hidden="true"></i>{E(T(it['closing']))}</p>
    </div>
  </div>
</section>'''


def concept_intro():
    """One honest line for the concepts section (projects.concept_intro, shared with llms.txt)."""
    return P.concept_intro(P.CONCEPTS)


def group_section(ctx, key, items, first):
    """One portfolio group: H2 + its real project count, the concepts' intro line, then the cards (1 2 2 rhythm)."""
    n, html = 0, []
    for row in rows(items):
        size = 'full' if len(row) == 1 else 'half'
        cards = []
        for p in row:
            n += 1
            cards.append(card(ctx, p, n, size))
        html.append(f'<div class="wk-row wk-row--{"full" if size == "full" else "pair"}">{"".join(cards)}</div>')
    hid = f'wk-{key}-title'
    count = f'{len(items):02d} project{"" if len(items) == 1 else "s"}'
    intro_line = (f'<p class="wk-group__intro" data-reveal style="--d:120ms">{E(concept_intro())}</p>'
                  if key == 'concept' else '')
    anchor = ' id="projects"' if first else ''       # the hero's "See the projects" lands on the first group
    return f'''<section class="wk-projects wk-projects--{key} section"{anchor} aria-labelledby="{hid}">
  <div class="container">
    <div class="wk-index wk-index--group" data-reveal="fade">
      <h2 class="wk-index__title" id="{hid}">{E(P.GROUPS[key])}</h2>
      <span class="wk-index__count">{count}</span>
    </div>
    {intro_line}
    <div class="wk-grid">{''.join(html)}</div>
  </div>
</section>'''


def grid(ctx):
    out = [lib.scene_defs(ctx)]          # the scenes' shared SVG gradients/filters, once, ahead of the cards
    for key, items in (('client', P.CLIENTS), ('concept', P.CONCEPTS)):
        if items:
            out.append(group_section(ctx, key, items, first=len(out) == 1))
    return ''.join(out)


def story(ctx):
    """The document's CASE STUDY STRUCTURE (label used as the heading; no invented headline)."""
    items = ''.join(
        f'<li class="card wk-story__card" data-reveal><span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'
        f'<div class="wk-story__copy"><h3 class="wk-story__name">{E(name)}</h3><p class="wk-story__q">{E(q)}</p></div>'
        f'<span class="wk-story__n" aria-hidden="true">{i:02d}</span></li>'
        for i, (name, q) in enumerate(W['case_structure'], 1))
    return f'''<section class="wk-story section" aria-labelledby="wk-story-title">
  <div class="container">
    <header class="section-head section-head--center wk-story__head">
      {pill_label('Case Studies')}
      <h2 class="section-head__title" id="wk-story-title" data-split>Case study structure</h2>
    </header>
    <div class="frame wk-story__frame">
      <ol class="wk-story__list" role="list" data-stagger="90">{items}</ol>
    </div>
  </div>
</section>'''


def slot(ctx):
    c = W['cta']
    handles = ''.join(f'<i class="wk-slot__h wk-slot__h--{k}" aria-hidden="true"></i>' for k in ('tl', 'tr', 'bl', 'br'))
    return f'''<section class="wk-cta section" aria-labelledby="wk-cta-title">
  <div class="container">
    <div class="wk-slot" data-reveal="scale">
      {handles}
      <svg class="wk-slot__x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 0 100 100M100 0 0 100" fill="none" stroke="currentColor" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>
      <div class="wk-slot__inner">
        <span class="wk-slot__n" aria-hidden="true">{len(P.PROJECTS) + 1:02d}</span>
        <h2 class="wk-slot__title" id="wk-cta-title" data-split>{E(T(c['title']))}</h2>
        <p class="wk-slot__body" data-reveal style="--d:160ms">{E(T(c['body']))}</p>
        <div data-reveal style="--y:60px;--d:260ms">{button(ctx, c['cta'], ctx.url('contact'), variant='dark', lead=lead_mark(ctx))}</div>
      </div>
      {caption(None, date='Next', title='Your project', industry='')}
    </div>
  </div>
</section>'''


def render(ctx):
    return hero(ctx) + intro(ctx) + grid(ctx) + story(ctx) + slot(ctx)
