"""Home — section 3: WHAT WE CREATE overview (reference SERVICES, ref-services-testimonials §2).

Structure (reference geometry at 1440: padding 120, header -> rows gap 80, rows gap 16):
  header   pill "WHAT WE CREATE" · H2 with the italic emphasis on the last words · doc sub lines
  rows     two large framed rows (Website Design, Website Development: info card + the owner's own design,
           MODU / ed10 - a row with several images of an owner-curated set becomes the reference "works" stack)
           then the remaining six services as two framed rows of three small cards
           (title line, first tags as chips + "+N" link to the full entry, project artwork)
  more     "See all services" -> /what-we-create/

All copy is content.CREATE; imagery is the owner's own designs and websites (see service_cards.MEDIA).
"""
from lib import E, button, pill_label
from content import CREATE
from sections import service_cards as sc

EMPHASIS = 'around your business.'


def title_html(text=None):
    """CREATE.hero.title with the reference italic treatment on its last words."""
    t = text or CREATE['hero']['title']
    if t.endswith(EMPHASIS):
        return f'{E(t[:-len(EMPHASIS)])}<em>{E(EMPHASIS)}</em>'
    return E(t)


def sub_html():
    return ''.join(f'<span class="svc__line">{E(sc._typo(line))}</span> ' for line in CREATE['hero']['body']).strip()


def render(ctx):
    services = CREATE['services']
    big, rest = services[:2], services[2:]
    more = lambda s: ctx.url('what-we-create', sc.slug(s['name']))  # noqa: E731
    rows = ''.join(sc.row(ctx, s, stack=sc.stackable(s['n'])) for s in big)
    smalls = ''.join(sc.small_row(ctx, rest[i:i + 3], more=more) for i in range(0, len(rest), 3))
    see_all = button(ctx, 'See all services', ctx.url('what-we-create'), variant='dark', icon_name='arrow-r', cls='svc__more-btn')
    return f'''<section class="svc section" id="services" aria-labelledby="services-title">
  <div class="svc__inner">
    <header class="section-head svc__head">
      {pill_label('What We Create')}
      <h2 class="section-head__title svc__title" id="services-title" data-split>{title_html()}</h2>
      <p class="section-head__sub svc__sub" data-reveal style="--d:160ms">{sub_html()}</p>
    </header>
    <div class="svc__rows">{rows}{smalls}</div>
    <div class="svc__more" data-reveal>{see_all}</div>
  </div>
</section>'''
