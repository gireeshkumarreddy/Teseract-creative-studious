"""WHAT WE CREATE page (/what-we-create/).

  hero     pill "WHAT WE CREATE" · H1 (CREATE.hero.title, italic emphasis on the last words) ·
           the three doc lines · an index of the eight services (in-page anchors)
  services all eight services as reference large rows (shared sections/service_cards.py):
           number, folder icon, name (h2), title line + body, note (Interactive & 3D), every tag
           as a chip, "Start a Project" deep link (contact/?service=<slug> pre-selects the form);
           info/image sides alternate on desktop; image cards = the owner's own designs / matching project work
           (service_cards.MEDIA; E-commerce and Interactive & 3D show their images as the "works" stack)
  cta      CREATE.cta in the reference frame + card ("Not sure what you need?" + "Let's Talk")

CSS: src/css/31-create.css (.create-*), card styles in src/css/22-services.css (.svc-*).
"""
import lib
from lib import E, button, pill_label
from content import CREATE
from sections import service_cards as sc
from sections.home_services import title_html

DOTS = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'


def _hero(ctx):
    h = CREATE['hero']
    sub = ' '.join(f'<span class="create-hero__line">{E(sc._typo(line))}</span>' for line in h['body'])
    index = ''.join(
        f'<li><a class="create-index__link" href="#{sc.slug(s["name"])}">'
        f'<span class="create-index__n">{E(s["n"])}</span><span>{E(s["name"])}</span></a></li>'
        for s in CREATE['services'])
    return f'''<section class="create-hero" aria-labelledby="page-title">
  <div class="create-hero__inner">
    {pill_label('What We Create')}
    <h1 class="create-hero__title" id="page-title" data-reveal style="--y:80px;--d:200ms">{title_html()}</h1>
    <p class="create-hero__sub" data-reveal style="--y:80px;--d:300ms">{sub}</p>
    <nav class="create-index" aria-label="Services on this page" data-reveal style="--y:40px;--d:400ms">
      <ul class="create-index__list" role="list">{index}</ul>
    </nav>
  </div>
</section>'''


def _services(ctx):
    rows = ''.join(
        sc.row(ctx, s, tag='h2', flip=bool(i % 2), number=True, note=True, stack=sc.stackable(s['n']), anchor=True, cta=True)
        for i, s in enumerate(CREATE['services']))
    return f'''<section class="create-list" aria-label="Services">
  <div class="create-list__inner svc__rows">{rows}</div>
</section>'''


def _cta(ctx):
    c = CREATE['cta']
    first, rest = c['lines'][0], c['lines'][1:]
    mark = lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=56, h=57, cls='create-cta__mark')
    lines = (f'<p class="create-cta__lead">{E(sc._typo(first))}</p>'
             + ''.join(f'<p class="create-cta__line">{E(sc._typo(t))}</p>' for t in rest))
    btn = button(ctx, sc._typo(c['cta']), ctx.url('contact'), variant='dark', icon_name='arrow-r', cls='create-cta__btn')
    return f'''<section class="create-cta" aria-labelledby="create-cta-title">
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
    return _hero(ctx) + _services(ctx) + _cta(ctx)
