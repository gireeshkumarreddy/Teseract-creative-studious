"""Project page (/projects/<slug>/) for the studio's own websites (scripts/projects.py).

  head     back link + "Case study NN / NN" (counted within the project's group) · the project's label (Client
           Project / Interactive Concept + its "Unofficial, ..." line / Concept Project / Personal project) ·
           H1 project name · year · industry · "What we created" chips ·
           "Visit site" (live URL, new tab) when the site is online
  hero     the project's device scene (lib.scene: backdrop + drawn monitor/laptop, portfolio.json "scene" /
           "device") playing its laptop recording through lib.video (lazy, poster first, poster only under
           reduced motion), or showing its Work still (a still on the screen opens in the viewer below); a project
           without a scene style (owner: Geetha Jewellers, whose gold palette suits no backdrop) shows the plain frame
           of its Work card: its first still on the 16:10 stage, its first phone screen on the 4:5 stage of a phone
  gallery  the captured stills (scripts/media-manifest.json): desktop screens in the ZIP full/half rhythm,
           phone screens as pairs on a band (a swipe strip on phones); alt text = the capture report's "shows" lines.
           The hero's still is not repeated, and a still the hero shows only on wide screens opens the phone gallery.
           Every still is a link to its largest file (without JS it opens the image itself); 36-project.js opens it
           in a full-screen viewer instead (pinch / double-tap / wheel zoom, swipe between the page's stills, Back /
           Esc / X / swipe-down to close; owner default, 15 Oct), the first frame says "Tap to enlarge"
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

# Gallery runs edge to edge with 12 px gutters (8 px on phone), capped at 1920 px of imagery. Phone screens: pairs
# under 340 px each, a swipe strip of 72vw screens under 600 px (36-project.css; the 1170 variant on a 3x phone).
SIZES = {
    'full': '(min-width:1944px) 1920px, (min-width:800px) calc(100vw - 24px), calc(100vw - 16px)',
    'half': '(min-width:1944px) 954px, (min-width:800px) calc(50vw - 18px), (min-width:600px) calc(50vw - 12px), calc(100vw - 16px)',
    'phone': '(min-width:1200px) 340px, (min-width:800px) 28vw, (min-width:600px) 40vw, 72vw',
}
# Plain-frame hero (no scene style): the hero is narrower than 640 px - the 4:5 stage showing the phone screen - below a
# 656 px viewport (8 px gutters). The image the stage hides asks for 1px there, so only its smallest variant loads.
PLAIN_NARROW = 655.98
PLAIN_SIZES = {
    'wide': f'(max-width:{PLAIN_NARROW}px) 1px, (min-width:1944px) 1920px, (min-width:800px) calc(100vw - 24px), calc(100vw - 16px)',
    'narrow': f'(min-width:{PLAIN_NARROW + .02:.2f}px) 1px, calc(100vw - 16px)',
}
# "Tap to enlarge" (owner default 15 Oct: an approved functional label) on the first gallery frame, and the icon it
# shares with the hover badge of every still on hover-capable screens.
ZOOM_HINT = 'Tap to enlarge'
ZOOM_ICON = ('<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M9.5 2.5h4v4M13.5 2.5 9 7M6.5 13.5h-4v-4M2.5 13.5 7 9" '
             'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>')
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


def _largest(it):
    return max(it['entry']['variants'], key=lambda v: v['width'])


def _zoom(ctx, it, media, *, hint=False, badge=True, cls=''):
    """A still as a link to its largest file (2560 desktop / 1170 phone): without JS it opens the image itself;
    36-project.js opens it in the full-screen viewer instead, loading that file only then. The link's name is the
    still's alt text; the badge is decorative (the first frame's says "Tap to enlarge" on touch screens)."""
    label = f'<span class="pj-zoom__label">{E(ZOOM_HINT)}</span>' if hint else ''
    mark = (f'<span class="pj-zoom__badge{" pj-zoom__badge--hint" if hint else ""}" aria-hidden="true">{ZOOM_ICON}{label}</span>'
            if badge else '')
    return (f'<a class="pj-zoom{(" " + cls) if cls else ""}" href="{E(ctx.asset(_largest(it)["file"]))}" data-zoom>'
            f'{media}{mark}</a>')


def _phone_still(p):
    return next((s for s in p['stills'] if s['frame'] == 'phone'), None)


def hero(ctx, p):
    """(html, still not to repeat in the gallery, still the gallery opens with on narrow screens only) - the device
    scene playing the laptop recording, or showing the Work still when there is no recording (a link into the
    viewer, so the still the gallery no longer repeats stays enlargeable); without a scene style, the plain frame of
    the Work card: the first still on the 16:10 stage, the first phone screen on a phone's 4:5 stage (38-scene.css)."""
    skip = lead = None
    if p['scene']:
        if p['laptop']:
            # The screen is at most ~800 CSS px wide: the 1280 variant is sharp enough and the 1920 copies of the
            # 30 s owner recordings (15-20 MB) are never fetched.
            media = lib.video(ctx, p['laptop'], _video_label(p, p['laptop']), cls='scn-media', poster_width=1280, max_width=1280)
            src = p['laptop'].get('source') or {}
            top = max(p['laptop']['variants'], key=lambda v: v['width'])
            aspect = (src.get('width') or top['width']) / (src.get('height') or top['height'])
            inner = lib.scene(ctx, p, media, caption=False, aspect=aspect)
        else:
            st = skip = p['scene_still']
            media = lib.media_img(ctx, st['entry'], st['alt'], sizes=SCREEN_SIZES, eager=True, cls='scn-media', max_width=1920)
            # the scenes' shared SVG defs stay outside the link
            inner = lib.scene_defs(ctx) + _zoom(ctx, st, lib.scene(ctx, p, media, caption=False, aspect=st['w'] / st['h']),
                                                badge=False, cls='pj-zoom--hero')
    else:
        first = skip = p['cover']
        phone = _phone_still(p) if first['frame'] != 'phone' else None
        # both images load at once (the page's largest paint on either stage); the hidden one at its smallest variant
        img = lib.media_img(ctx, first['entry'], first['alt'], sizes=PLAIN_SIZES['wide'] if phone else SIZES['full'],
                            eager=True, cls='scn-media' + (' scn-media--wide' if phone else ''), max_width=1920,
                            attrs=f'style="object-position:{P.focal(p, first)}"')
        if phone:
            img += lib.media_img(ctx, phone['entry'], phone['alt'], sizes=PLAIN_SIZES['narrow'], eager=True,
                                 cls='scn-media scn-media--narrow', max_width=1280,
                                 attrs=f'style="object-position:{P.focal(p, phone)}"')
            lead = first          # the 4:5 stage shows the phone screen: the first still opens the gallery there
        inner = lib.plain_frame(p, img, cls='pj-frame--hero')   # the hero-media class check.py looks for
    # No scroll reveal on the scene: it is the page's largest paint (poster first), shown at once.
    return (f'<section class="pj-hero" aria-label="{E(p["title"])} website">'
            f'<div class="pj-hero__inner">{inner}</div></section>'), skip, lead


def _frame(ctx, it, slot, *, hint=False, cls=''):
    """One gallery frame at its native aspect: a still is a link into the viewer (_zoom), a recording plays in place."""
    if it['type'] == 'video':
        media = lib.video(ctx, it['entry'], it['alt'])
    else:
        media = _zoom(ctx, it, lib.media_img(ctx, it['entry'], it['alt'], sizes=SIZES[slot]), hint=hint)
    extra = f' {cls}' if cls else ''
    if slot == 'phone':
        return f'<figure class="pj-phone reveal-image{extra}" style="aspect-ratio:{it["w"]}/{it["h"]}">{media}</figure>'
    return f'<figure class="pj-frame pj-frame--{slot} reveal-image{extra}" style="aspect-ratio:{it["w"]}/{it["h"]}">{media}</figure>'


def _phones(ctx, phones, hint=None):
    """Phone screens two by two, centred on a band (a lone last screen stays centred; a swipe strip on phones)."""
    rows = []
    for i in range(0, len(phones), 2):
        rows.append(f'<div class="pj-phones">{"".join(_frame(ctx, it, "phone", hint=it is hint) for it in phones[i:i + 2])}</div>')
    return ''.join(rows)


def media_gallery(ctx, p, *, skip=None, lead=None):
    """Gallery of the project's captured media (all gallery-NN items except `skip`, the still already shown
    as the hero): desktop screens in the RHYTHM rows (a pair left with one screen becomes full width), the
    phone screens as pairs on a band: the first band after the PHONES_AFTER-th desktop screen, each further band
    after the next desktop row (never two dark bands back to back while desktop screens remain). `lead` (the
    plain-frame hero's first still, which its 4:5 stage swaps for the phone screen) opens the gallery below a
    PLAIN_NARROW viewport only (36-project.css .pj-frame--lead), so phones still show it. The first frame phones
    see carries the "Tap to enlarge" hint (the lead, else the rhythm's first). Returns '' when there is nothing."""
    items = [it for it in p['items'] if it is not skip and it is not lead]
    desk = [it for it in items if it['frame'] != 'phone']
    phones = [it for it in items if it['frame'] == 'phone']
    if not items:
        return ''
    bands = [phones[j:j + 2] for j in range(0, len(phones), 2)]
    # the lead is the first frame phones see, so it carries the hint too (the rhythm's copy is hidden under
    # PLAIN_NARROW, 36-project.css); from PLAIN_NARROW up the lead is hidden and the rhythm's first frame has it
    frames = [_frame(ctx, lead, 'full', hint=lead['type'] != 'video', cls='pj-frame--lead')] if lead else []
    hint = next((it for it in desk + phones if it['type'] != 'video'), None)
    i, k = 0, 0
    while i < len(desk):
        n = min(RHYTHM[k % len(RHYTHM)], len(desk) - i)
        slot = 'half' if n == 2 else 'full'
        frames += [_frame(ctx, it, slot, hint=it is hint) for it in desk[i:i + n]]
        i += n
        k += 1
        if bands and i >= min(PHONES_AFTER, len(desk)):
            frames.append(_phones(ctx, bands.pop(0), hint))
    for band in bands:
        frames.append(_phones(ctx, band, hint))
    return (f'<section class="pj-gallery-wrap" aria-label="{E(p["title"])} project gallery">'
            f'<div class="pj-gallery">{"".join(frames)}</div></section>')


def viewer(p):
    """The still viewer's dialog as an inert <template>: 36-project.js clones it on the first tap / click, so the page
    pays nothing for it before. Its name is the gallery's; the slides take the page stills' own alt text. Controls in
    the thumb zone at the bottom: previous · close · next, the "3 / 10" count at the top."""
    arrow = ICONS['arrow-r']
    return f'''<template id="pj-viewer-tpl">
<dialog class="pj-viewer" aria-label="{E(p["title"])} project gallery">
  <div class="pj-viewer__shade" aria-hidden="true"></div>
  <div class="pj-viewer__stage" data-viewer-stage><div class="pj-viewer__track" data-viewer-track></div></div>
  <p class="pj-viewer__count" data-viewer-count aria-live="polite"></p>
  <div class="pj-viewer__bar">
    <button class="pj-viewer__btn pj-viewer__btn--prev" type="button" data-viewer-prev aria-label="Previous screen">{arrow}</button>
    <button class="pj-viewer__btn pj-viewer__btn--close" type="button" data-viewer-close aria-label="Close" autofocus>{ICONS['close']}</button>
    <button class="pj-viewer__btn pj-viewer__btn--next" type="button" data-viewer-next aria-label="Next screen">{arrow}</button>
  </div>
</dialog>
</template>'''


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
    hero_html, shown, lead = hero(ctx, p)
    return head(ctx, p) + hero_html + media_gallery(ctx, p, skip=shown, lead=lead) + viewer(p) + next_block(ctx, p)
