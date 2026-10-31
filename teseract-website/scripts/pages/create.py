"""WHAT WE CREATE page (/what-we-create/).

  hero     pill "WHAT WE CREATE" · H1 (CREATE.hero.title, italic emphasis on the last words) ·
           the three doc lines · an index of the eight services (in-page anchors)
  services all eight services as reference large rows (shared sections/service_cards.py; 05 Brand Kits & Identity
           links to the brand-kit section, 06 is Apps & SaaS since 31 Oct):
           number, folder icon, name (h2), title line + body, note (Interactive & 3D), every tag
           as a chip, "Start a Project" deep link (contact/?service=<slug> pre-selects the form);
           info/image sides alternate on desktop; image cards = the owner's own designs / matching project work
           (service_cards.MEDIA; E-commerce and Interactive & 3D show their images as the "works" stack)
  brand    'What is a brand kit?' (CREATE.brand_kits, owner 31 Oct): what a kit is, what's inside, and the brand kits
           the studio made (India Kids Casting, Hidden Stories) with their pages in the still viewer and their palettes
  cta      CREATE.cta in the reference frame + card ("Not sure what you need?" + "Let's Talk")

CSS: src/css/31-create.css (.create-*), card styles in src/css/22-services.css (.svc-*).
"""
import lib
import projects
from lib import E, button, pill_label
from content import CREATE
from sections import service_cards as sc
from sections.home_services import title_html
from tone import chapter, DARK, LIGHT
from pages.project import viewer, ZOOM_ICON

DOTS = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'


def _hero(ctx):
    h = CREATE['hero']
    sub = ' '.join(f'<span class="create-hero__line">{E(sc._typo(line))}</span>' for line in h['body'])
    index = ''.join(
        f'<li><a class="create-index__link" href="#{sc.slug(s["name"])}">'
        f'<span class="create-index__n">{E(s["n"])}</span><span>{E(s["name"])}</span></a></li>'
        for s in CREATE['services'])
    return f'''<section class="create-hero" aria-labelledby="page-title"{chapter(DARK)}>
  <div class="create-hero__inner">
    {pill_label('What We Create')}
    <h1 class="create-hero__title" id="page-title" data-reveal style="--y:80px;--d:200ms">{title_html()}</h1>
    <p class="create-hero__sub" data-reveal style="--y:80px;--d:300ms">{sub}</p>
    <nav class="create-index" aria-label="Services on this page" data-reveal style="--y:40px;--d:400ms">
      <ul class="create-index__list" role="list">{index}</ul>
    </nav>
  </div>
</section>'''


# two service rows per beat: the hero + rows 1-2 black, rows 3-4 white, 5-6 black, 7-8 white, the brand kits black,
# the CTA white, the footer black
ROW_CHAPTERS = {3: LIGHT, 5: DARK, 7: LIGHT}


def _services(ctx):
    rows = ''.join(
        sc.row(ctx, s, tag='h2', flip=bool(i % 2), number=True, note=True, stack=sc.stackable(s['n']), anchor=True, cta=True,
               mark=chapter(ROW_CHAPTERS[i + 1]) if i + 1 in ROW_CHAPTERS else '')
        for i, s in enumerate(CREATE['services']))
    return f'''<section class="create-list" aria-label="Services">
  <div class="create-list__inner svc__rows">{rows}</div>
</section>'''


def _zoom_link(ctx, img, sizes, cls):
    """A brand-kit image as a link to its largest file: 36-project.js opens it in the still viewer (one gallery per kit,
    [data-zoom-group]); without JS the link opens the image itself. Named by the image's own alt text (A11Y2-01)."""
    top = max(img['variants'], key=lambda v: v['width'])
    pic = lib.media_img(ctx, img, img['alt'], sizes=sizes)
    return (f'<a class="pj-zoom {cls}" href="{E(ctx.asset(top["file"]))}" aria-label="{E(img["alt"])}" data-zoom>'
            f'{pic}<span class="pj-zoom__badge" aria-hidden="true">{ZOOM_ICON}</span></a>')


def _kit(ctx, k, i):
    """One brand kit: its lead visual (India Kids Casting: the logo intro, played on request; else the first frame),
    name, what it is, the idea, the facts, its palette (name + hex), and its pages as a strip into the viewer."""
    hero = lib.supplied(k['hero'])
    pages = [x for x in (lib.supplied(n) for n in k['images']) if x]
    if not hero or not pages:                 # not prepared yet (scripts/prepare_supplied.py): left out, never a gap
        return ''
    kid = f'bk-{k["key"]}'
    if k.get('video'):
        poster = next(v for v in sorted(hero['variants'], key=lambda v: v['width']) if v['width'] >= 1280)
        lead = (f'<video class="bk-kit__video" controls preload="none" playsinline width="{poster["width"]}" '
                f'height="{poster["height"]}" poster="{E(ctx.asset(poster["file"]))}" aria-label="{E(k["video_label"])}">'
                f'<source src="{E(ctx.asset(k["video"]))}" type="video/mp4"></video>')
    else:
        lead = _zoom_link(ctx, hero, '(min-width:1200px) 420px, (min-width:800px) 40vw, 80vw', 'bk-kit__hero')
    facts = ''.join(f'<li>{E(sc._typo(f))}</li>' for f in k['facts'])
    pal = ''.join(f'<li class="bk-pal__c" style="--c:{c}"><span class="bk-pal__sw" aria-hidden="true"></span>'
                  f'<span class="bk-pal__name">{E(n)}</span><span class="bk-pal__hex">{E(c.upper())}</span></li>'
                  for n, c in k['palette'])
    strip = ''.join(f'<li class="bk-kit__item">{_zoom_link(ctx, x, "(min-width:800px) 420px, 72vw" if x["w"] > x["h"] else "(min-width:800px) 220px, 44vw", "bk-kit__page" + (" bk-kit__page--tall" if x["h"] > x["w"] else ""))}</li>'
                    for x in pages)
    p = projects.by_slug(k.get('project') or '')
    link = (f'<p class="bk-kit__more"><a class="bk-kit__link" href="{E(ctx.url(p["route"]))}">View the {E(p["title"])} website'
            f'<span aria-hidden="true"> {lib.ICONS["arrow-r"]}</span></a></p>' if p else '')
    flip = ' bk-kit--tall' if hero['h'] > hero['w'] else ''
    return f'''<article class="bk-kit bk-kit--{k["key"]}{flip}" aria-labelledby="{kid}-title" data-zoom-group>
      <div class="bk-kit__top">
        <div class="bk-kit__lead" data-reveal style="--y:40px">{lead}</div>
        <div class="bk-kit__info" data-reveal style="--y:40px;--d:120ms">
          <p class="bk-kit__n"><span>Kit {i + 1:02d}</span><span class="bk-kit__label">{E(k["label"])}</span></p>
          <h4 class="bk-kit__name" id="{kid}-title">{E(k["name"])}</h4>
          <p class="bk-kit__kind">{E(k["kind"])}</p>
          <p class="bk-kit__about">{E(sc._typo(k["about"]))}</p>
          <p class="bk-kit__idea">{E(sc._typo(k["idea"]))}</p>
          <ul class="bk-kit__facts" role="list">{facts}</ul>
          <ul class="bk-pal" role="list" aria-label="{E(k["name"])} brand colours">{pal}</ul>
          {link}
        </div>
      </div>
      <ul class="bk-kit__strip" role="list" aria-label="{E(k["name"])}: brand kit images">{strip}</ul>
    </article>'''


def _brand_kits(ctx):
    """'What is a brand kit?' (owner, 31 Oct: explain it on this page, with the brand kits the studio made); the
    Brand Kits & Identity row links here (#brand-kits). A black chapter between the last white rows and the CTA."""
    b = CREATE['brand_kits']
    kits = ''.join(_kit(ctx, k, i) for i, k in enumerate(b['kits']))
    body = ''.join(f'<p class="create-bk__text">{E(sc._typo(t))}</p>' for t in b['body'])
    inside = ''.join(
        f'<li class="create-bk__item" data-reveal style="--y:30px;--d:{80 * k}ms"><span class="create-bk__icon">{sc.icon_svg(ic)}</span>'
        f'<h4 class="create-bk__item-title">{E(t)}</h4><p class="create-bk__item-text">{E(sc._typo(d))}</p></li>'
        for k, (t, d, ic) in enumerate(b['inside']))
    return f'''<section class="create-bk" id="brand-kits" aria-labelledby="brand-kits-title"{chapter(DARK)}>
  <div class="create-bk__inner">
    <header class="create-bk__head">
      <div class="create-bk__head-l">
        {pill_label(b['label'])}
        <h2 class="create-bk__title" id="brand-kits-title" data-split>{E(b['title'])}</h2>
      </div>
      <div class="create-bk__intro" data-reveal style="--y:40px;--d:150ms">
        <p class="create-bk__lead">{E(sc._typo(b['lead']))}</p>
        {body}
      </div>
    </header>
    <h3 class="create-bk__label">{E(sc._typo(b['inside_label']))}</h3>
    <ul class="create-bk__grid" role="list">{inside}</ul>
    <h3 class="create-bk__label create-bk__label--kits">{E(sc._typo(b['kits_label']))}</h3>
    <div class="create-bk__kits">{kits}</div>
  </div>
</section>'''


def _cta(ctx):
    c = CREATE['cta']
    first, rest = c['lines'][0], c['lines'][1:]
    mark = lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=56, h=57, cls='create-cta__mark')
    lines = (f'<p class="create-cta__lead">{E(sc._typo(first))}</p>'
             + ''.join(f'<p class="create-cta__line">{E(sc._typo(t))}</p>' for t in rest))
    btn = button(ctx, sc._typo(c['cta']), ctx.url('contact'), variant='dark', icon_name='arrow-r', cls='create-cta__btn')
    return f'''<section class="create-cta" aria-labelledby="create-cta-title"{chapter(LIGHT)}>
  <div class="create-cta__inner">
    <div class="frame create-cta__frame" data-reveal style="--y:60px">
      <div class="card create-cta__card">
        {DOTS}
        <div class="create-cta__copy">
          <span class="create-cta__icon">{mark}</span>
          <h2 class="create-cta__title" id="create-cta-title" data-split>{E(c['title'])}</h2>
        </div>
        <div class="create-cta__side">
          <div class="create-cta__lines">{lines}</div>
          {btn}
        </div>
      </div>
    </div>
  </div>
</section>'''


def render(ctx):
    return (_hero(ctx) + _services(ctx) + _brand_kits(ctx) + _cta(ctx)
            + viewer({'title': 'Brand kit'}))      # the still viewer's template, for the brand-kit images
