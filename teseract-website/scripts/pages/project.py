"""Project page (/projects/<slug>/) for the studio's own websites (scripts/projects.py).

  head     back link + "Case study NN / NN" (counted within the project's group) · the project's label (Client
           Project / Interactive Concept + its "Unofficial, ..." line / Concept Project / Personal project) ·
           H1 project name · year · industry · "What we created" chips ·
           "Visit site" (live URL, new tab) when the site is online
  hero     the project's device scene (lib.scene: backdrop + drawn monitor/laptop, portfolio.json "scene" /
           "device") playing its laptop recording through lib.video (lazy, poster first, poster only under
           reduced motion); a project without a scene style (owner: Geetha Jewellers, whose gold palette
           suits no backdrop) shows its first still full width instead
  gallery  the captured stills (scripts/media-manifest.json): desktop screens in the ZIP full/half rhythm,
           phone screens as pairs on a band; alt text = the capture report's "shows" lines
  next     next project within the same group (wrapping) with its scene tile + Start a Project; the tile always shows
           the project's label pill (a plain frame too: work.tile(..., caption=True))
No narrative headings (Challenge/Idea/Result...): there is no case-study copy, and none is invented.
"""
import lib
from lib import E, fmt, ICONS, roll, button, chip
import content
import projects as P
from pages.work import tile, lead_mark, caps

W = content.WORK

# Gallery runs edge to edge with 12 px gutters (8 px on phone), capped at 1920 px of imagery.
SIZES = {
    'full': '(min-width:1944px) 1920px, (min-width:800px) calc(100vw - 24px), calc(100vw - 16px)',
    'half': '(min-width:1944px) 954px, (min-width:800px) calc(50vw - 18px), (min-width:600px) calc(50vw - 12px), calc(100vw - 16px)',
    'phone': '(min-width:1200px) 340px, (min-width:800px) 28vw, 40vw',
}
# Still on the hero scene's screen (projects without a recording): about half the scene's width.
SCREEN_SIZES = '(min-width:1440px) 700px, (min-width:800px) 50vw, 84vw'
# Next-project tile: 7/12 of the 1344 px container on desktop, full container width below.
SIZES_NEXT = '(min-width:1440px) 756px, (min-width:800px) calc(100vw - 80px), calc(100vw - 32px)'
# Desktop rows, repeated: pair, full, pair, full, full, pair, ... (the ZIP case page's half/full rhythm).
RHYTHM = (2, 1, 2, 1, 1, 2, 1)
PHONES_AFTER = 3          # the phone screens follow the third desktop screen
# A next-project name longer than this wraps instead of the one-line letter roll (36-project.css .is-long): the owner's
# personal sites carry their sites' own long titles ("GIREESH — Artist · Creative · Storyteller", 41 characters).
NEXT_ROLL_MAX = 24


def _group(p):
    """The project's group as a list, and its position in it."""
    group = P.BY_GROUP[p['group']]
    return group, next(i for i, c in enumerate(group) if c['slug'] == p['slug'])


def _tag(p):
    """Visible label line above the title (owner, 14 Oct): "Client Project", "Interactive Concept" with its small
    "Unofficial, not affiliated with ..." line, "Concept Project" or "Personal project" - concepts are never presented
    as client commissions."""
    note = f'<span class="pj-tag__note">{E(p["note"])}</span>' if p.get('note') else ''
    return (f'<p class="pj-tag pj-tag--{E(p["label_kind"])}" data-reveal style="--y:40px;--d:120ms">'
            f'<i aria-hidden="true"></i><span>{E(p["label"])}</span>{note}</p>')


def head(ctx, p):
    group, idx = _group(p)
    chips = ''.join(chip(s) for s in p['services_list'])
    visit = ''
    if p['url']:
        visit = button(ctx, 'Visit site', p['url'], variant='light', icon_name='arrow-ne', external=True, cls='pj-visit',
                       aria=f"Visit {'' if p['title'].lower().startswith('the ') else 'the '}{p['title']} website (opens in a new tab)")
    created = (f'''<div class="pj-head__services" data-reveal style="--y:40px;--d:400ms">
        <p class="pj-head__label" id="pj-created">What we created</p>
        <ul class="chips pj-head__chips" role="list" aria-labelledby="pj-created">{chips}</ul>
        {visit}
      </div>''' if chips or visit else '')
    back = (f'<a class="pj-back" href="{ctx.url("work")}" aria-label="Back to all work">'
            f'<span class="pj-back__icon" aria-hidden="true">{ICONS["arrow-r"]}</span>{roll("All work")}</a>')
    return f'''<section class="pj-head" aria-labelledby="pj-title">
  <div class="container">
    <nav class="pj-head__bar" aria-label="Case study" data-reveal="fade">
      {back}
      <span class="pj-head__count">Case study {idx + 1:02d} / {len(group):02d}</span>
    </nav>
    <div class="pj-head__grid">
      <div class="pj-head__main">
        {_tag(p)}
        <h1 class="pj-head__title{caps(p['title'])}" id="pj-title" data-reveal style="--y:80px;--d:200ms">{E(lib.name_text(p['title']))}</h1>
        <p class="pj-head__meta" data-reveal style="--y:40px;--d:300ms"><span>{E(p['year'])}</span><span class="pj-head__dot" aria-hidden="true">·</span><span>{E(p['industry'])}</span></p>
      </div>
      {created}
    </div>
  </div>
</section>'''


def _video_label(p, entry, role='laptop'):
    shows = ((p.get('alts') or {}).get(role) or entry.get('alt') or '').strip()
    return f"{p['title']} website recording" + (f' — {shows}' if shows else '')


def hero(ctx, p):
    """(html, still shown) - the device scene playing the laptop recording (or showing the Work still when
    there is no recording), or the first still full width when the project has no scene style."""
    first = None
    if p['scene']:
        if p['laptop']:
            # The screen is at most ~800 CSS px wide: the 1280 variant is sharp enough and the 1920 copies of the
            # 30 s owner recordings (15-20 MB) are never fetched.
            media = lib.video(ctx, p['laptop'], _video_label(p, p['laptop']), cls='scn-media', poster_width=1280, max_width=1280)
            src = p['laptop'].get('source') or {}
            top = max(p['laptop']['variants'], key=lambda v: v['width'])
            aspect = (src.get('width') or top['width']) / (src.get('height') or top['height'])
        else:
            st = p['scene_still']
            media = lib.media_img(ctx, st['entry'], st['alt'], sizes=SCREEN_SIZES, eager=True, cls='scn-media', max_width=1920)
            aspect = st['w'] / st['h']
        inner = lib.scene(ctx, p, media, caption=False, aspect=aspect)
    else:
        first = p['cover']
        media = lib.media_img(ctx, first['entry'], first['alt'], sizes=SIZES['full'], eager=True)
        inner = (f'<figure class="pj-frame pj-frame--hero reveal-image" style="aspect-ratio:{first["w"]}/{first["h"]}">'
                 f'{media}</figure>')
    # No scroll reveal on the scene: it is the page's largest paint (poster first), shown at once.
    return (f'<section class="pj-hero" aria-label="{E(p["title"])} website">'
            f'<div class="pj-hero__inner">{inner}</div></section>'), first


def _frame(ctx, it, slot, eager=False):
    if it['type'] == 'video':
        media = lib.video(ctx, it['entry'], it['alt'])
    else:
        media = lib.media_img(ctx, it['entry'], it['alt'], sizes=SIZES[slot], eager=eager)
    if slot == 'phone':
        return f'<figure class="pj-phone reveal-image" style="aspect-ratio:{it["w"]}/{it["h"]}">{media}</figure>'
    return f'<figure class="pj-frame pj-frame--{slot} reveal-image" style="aspect-ratio:{it["w"]}/{it["h"]}">{media}</figure>'


def _phones(ctx, phones):
    """Phone screens two by two, centred on a band (a lone last screen stays centred)."""
    rows = []
    for i in range(0, len(phones), 2):
        rows.append(f'<div class="pj-phones">{"".join(_frame(ctx, it, "phone") for it in phones[i:i + 2])}</div>')
    return ''.join(rows)


def media_gallery(ctx, p, *, skip=None):
    """Gallery of the project's captured media (all gallery-NN items except `skip`, the still already shown
    as the hero): desktop screens in the RHYTHM rows (a pair left with one screen becomes full width), the
    phone screens as pairs on a band: the first band after the PHONES_AFTER-th desktop screen, each further band
    after the next desktop row (never two dark bands back to back while desktop screens remain).
    Returns '' when there is nothing."""
    items = [it for it in p['items'] if it is not skip]
    desk = [it for it in items if it['frame'] != 'phone']
    phones = [it for it in items if it['frame'] == 'phone']
    if not items:
        return ''
    bands = [phones[j:j + 2] for j in range(0, len(phones), 2)]
    frames, i, k = [], 0, 0
    while i < len(desk):
        n = min(RHYTHM[k % len(RHYTHM)], len(desk) - i)
        slot = 'half' if n == 2 else 'full'
        frames += [_frame(ctx, it, slot) for it in desk[i:i + n]]
        i += n
        k += 1
        if bands and i >= min(PHONES_AFTER, len(desk)):
            frames.append(_phones(ctx, bands.pop(0)))
    for band in bands:
        frames.append(_phones(ctx, band))
    return (f'<section class="pj-gallery-wrap" aria-label="{E(p["title"])} project gallery">'
            f'<div class="pj-gallery">{"".join(frames)}</div></section>')


def next_block(ctx, p):
    group, idx = _group(p)
    if len(group) > 1:
        nxt, k, total = group[(idx + 1) % len(group)], (idx + 1) % len(group) + 1, len(group)
    else:                                   # alone in its group: continue with the other group
        others = [c for c in P.PROJECTS if c['slug'] != p['slug']]
        nxt, k, total = (others[0], 1, len(others)) if others else (None, 0, 0)
    c = W['cta']
    btns = (button(ctx, c['cta'], ctx.url('contact'), variant='dark', lead=lead_mark(ctx))
            + button(ctx, 'All work', ctx.url('work'), variant='light'))
    cta = f'''<div class="pj-next__cta" data-reveal style="--d:260ms">
      <p class="pj-next__line"><strong>{E(fmt(c['title']))}</strong> {E(fmt(c['body']))}</p>
      <div class="pj-next__btns">{btns}</div>
    </div>'''
    if not nxt:
        return f'<section class="pj-next section"><div class="container pj-next__grid">{cta}</div></section>'
    return f'''<section class="pj-next section" aria-labelledby="pj-next-title">
  <div class="container pj-next__grid">
    <div class="pj-next__head">
      <p class="pj-next__label" data-reveal>Next project <span aria-hidden="true">—</span> {k:02d} / {total:02d}</p>
      <h2 class="pj-next__title{caps(nxt['title'])}{' is-long' if len(nxt['title']) > NEXT_ROLL_MAX else ''}" id="pj-next-title" data-reveal style="--y:60px;--d:100ms"><a href="{ctx.url(nxt['route'])}" aria-label="Next project: {E(nxt['title'])}, {E(nxt['industry'])}"><span class="roll roll--css" data-text="{E(lib.name_text(nxt['title']))}"><span>{E(lib.name_text(nxt['title']))}</span></span></a></h2>
    </div>
    <div class="pj-next__media">{tile(ctx, nxt, sizes=SIZES_NEXT, cls='pj-next__tile', size='half', caption=True)}</div>
    {cta}
  </div>
</section>'''


def render(ctx, p):
    hero_html, shown = hero(ctx, p)
    return head(ctx, p) + hero_html + media_gallery(ctx, p, skip=shown) + next_block(ctx, p)
