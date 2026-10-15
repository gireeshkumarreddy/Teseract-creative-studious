"""Home - the founder teaser (#founder-teaser), between What We Believe / Our Numbers and A Different Kind of Agency
(owner, 15 Oct: the founder "should be the entire website"). The same signature as Who We Are #founder, compact:
eyebrow bar, the fitted nameplate (no frame), the roles on one line, the route strip (complete in CSS, plays once
with JS, replays on tap), quote 1 inked as it is read, and "Meet the founder" (an owner micro-label) to
who-we-are/#founder (a hash entry skips the intro). No image of him, no cursor pill. Builders: sections/founder.py;
CSS 26-founder.css (.fdt); JS 26-founder.js.
"""
from lib import E
from sections import founder as FD
from pages.who import link_text

LINK = 'Meet the founder'


def render(ctx):
    f = FD.F
    html = f'''<section class="fdt section" id="founder-teaser" aria-labelledby="fdt-name">
  <div class="container"><div class="fdt__grid">
    <div class="fdt__id">
      {FD.bar('data-reveal="fade"')}
      {FD.nameplate('fdt-name', 'fdr-name--plate')}
      {FD.roles('inline', 'data-reveal style="--d:200ms"')}
      {FD.strip('teaser')}
    </div>
    <div class="fdt__say">
      {FD.pull_quote(f['quote'], 't')}
      <p class="fdt__more" data-reveal style="--d:240ms"><a class="who-link" href="{E(ctx.url('who-we-are', 'founder'))}">{link_text(LINK)}</a></p>
    </div>
  </div></div>
</section>'''
    return FD.guard(html, [f['label'], f['name'], ' · '.join(f['roles']), '“' + f['quote'] + '”', LINK])
