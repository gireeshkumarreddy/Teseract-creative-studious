"""CLIENT STORIES page (/client-stories/).

  hero        pill · H1 (STORIES.hero.title, two balanced sentences) · sub
  reviews     ONLY when content.STORIES['testimonials'] has entries: pill · H2 · "Sample reviews" tag (while a
              sample entry remains) · the "Client Deck" in a frame: one card per client (website still with its
              "Client Project" pill, company + industry with the rating, the quote about Gireesh, "View project"),
              the neighbours peeking dimmed on both sides; drag / swipe / flick it, click a peek, or use the one
              control row (previous · dots · next). Nothing auto-advances. Today: six SAMPLE reviews (owner, 14 Oct)
              to be replaced.
  experience  pill · H2 · body · the five collaboration lines as a staggered row of numbered
              cards (reference frame + price-card vocabulary) · the two closing lines emphasised
  review      reference wide card in the frame: title, body, high-emphasis "Leave a Review" button
              (mailto CONFIG.email with a prefilled subject)
CSS: src/css/34-stories.css (.sto-*), JS: src/js/34-stories.js (the deck). Shared look: .frame/.card/.dots
(02-components), the hero tile's label pill (.hero-tile__tag, 20-hero.css), page hero (.pg-hero, pages/who.py).
The page is self-contained (own label-swap button and typographic helper) so it does not depend on
the home-page sections, which are redesigned independently.
"""
import re
from urllib.parse import quote

import lib
from lib import E, fmt, CONFIG, BRAND, ICONS, pill_label
from content import STORIES
from pages.who import page_hero

DOTS = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>'


def T(text):
    """Visible copy with typographic apostrophes (house style)."""
    return fmt(text).replace("'", '’')


def swap_button(text, alt, href, *, cls='', icon_name=None, label=None):
    """Reference lg button (56 px, radius 16): two labels in a 24 px window that swap on hover
    (spring 500/60). On the black theme it is the white high-emphasis button."""
    ic = f'<span class="sto-btn__icon">{ICONS[icon_name]}</span>' if icon_name else ''
    return (f'<a class="sto-btn{(" " + cls) if cls else ""}" href="{E(href)}" aria-label="{E(label or text)}">'
            f'<span class="sto-btn__win" aria-hidden="true"><span class="sto-btn__t">{E(T(text))}{ic}</span>'
            f'<span class="sto-btn__t">{E(T(alt))}{ic}</span></span></a>')


# ------------------------------------------------------------------ client reviews (the "Client Deck")
# One card per content.STORIES['testimonials'] entry. The entry holds only the client's words: quote, rating, 'sample'
# flag (and a name / role, with consent). The company name, industry, label pill, glow colour, project still and link
# come from the CLIENT project in portfolio.json (projects.by_slug), so no project fact is restated by hand; concept
# projects are never used. The still is the project's profile image: the poster of its portfolio.json "card_clip" (owner,
# 15 Oct: Aivinci's tiger, the same still as its Work card - projects.card_poster), else its "scene_still" (the screen of
# its Work card), within its "skip" list, never a still with people's names, reviews or testimonials.
# Markup = APG tabbed carousel: a group (aria-roledescription "carousel") holding a viewport of slots, each slot one
# card (article role=tabpanel, aria-roledescription "slide"): website still with its "Client Project" pill, company +
# industry with the rating, the quote, "View project". Under it ONE control row: previous · a tablist of dots (one per
# client, named by the company) · next, plus a polite status line. All slots share one grid cell; data-pos is each
# card's rest offset from the front card, so the CSS paints the deck (front card, dimmed and turned peeks) before JS
# and the JS rest state equals it. Behaviour: src/js/34-stories.js (drag / swipe / flick, trackpad, peek click,
# arrows, dots; nothing auto-advances). The server emits no aria-hidden / tabindex: JS adds them, so without JS every
# review is read and 34-stories.css shows all six cards in a grid. No Review / AggregateRating structured data is
# emitted for them (check.py).
STAR = ICONS['star']
MEDIA_SIZES = '(max-width: 799.98px) calc(100vw - 104px), (max-width: 1023.98px) 452px, (max-width: 1279.98px) 464px, 504px'
# PERF-11 (mobile audit): only the front card and its two neighbours load their still with the page; the others carry
# it as data-src / data-srcset, which 34-stories.js copies in as the deck comes near them, plus a <noscript> copy, so
# without JS every card still shows its still. The far peeks (WIDE_REACH) are on screen from 800 px: a <picture> source
# for that width loads them there natively, so a visible peek never waits on app.js (phones still wait for the deck).
EAGER_REACH = 1
WIDE_REACH = 2
NEUTRAL_SPILL = 'rgba(255,255,255,.05)'     # glow for a project without a portfolio.json "spill" (none is invented)


def testimonials():
    """The reviews to show, in content order: the entry's keys with 'project' = the shown CLIENT project dict and
    'rating' rounded to one decimal (None when not given). Entries without a shown client project are left out;
    scripts/check.py reports them."""
    import projects
    out = []
    for t in STORIES.get('testimonials') or []:
        if not isinstance(t, dict) or not (t.get('quote') or '').strip():
            continue
        p = projects.by_slug(t.get('project') or '')
        if not p or p['group'] != 'client':
            continue
        r = t.get('rating')
        out.append({**t, 'project': p, 'rating': round(float(r), 1) if r else None})
    return out


def samples():
    """Testimonial entries still flagged 'sample': True (build.py prints a note; check.py blocks a launch build)."""
    return [t for t in STORIES.get('testimonials') or [] if isinstance(t, dict) and t.get('sample')]


def stars(rating):
    """Five stars, each filled by its share of the rating (4.8 = four full stars and 80 % of the fifth, 96 % of the
    row): a dim star with the bright one clipped on top. --k = the star's index (the one-time fill wipe staggers by
    it). Decorative: the rating's aria-label carries the value."""
    out = []
    for i in range(5):
        f = max(0.0, min(1.0, rating - i))
        out.append(f'<i style="--f:{f * 100:.0f}%;--k:{i}">{STAR}{STAR}</i>')
    return f'<span class="sto-stars" aria-hidden="true">{"".join(out)}</span>'


def _rating(rating):
    n = f'{rating:.1f}'
    return (f'<p class="sto-rate" role="img" aria-label="Rated {n} out of 5">'
            f'<span class="sto-rate__n">{n}</span>{stars(rating)}</p>')


def _pos(i, n):
    """A card's rest offset from the front card (card 0): a loop from five cards, so the last ones wait on the left
    (n = 6: 0, 1, 2, -3, -2, -1); fewer cards line up to the right. Equals the JS rest offset (34-stories.js)."""
    return (i + n // 2) % n - n // 2 if n >= 5 else i


def _tag(p):
    """The always-visible label pill on the website still (the home hero tile's tag, sections/home_hero._label; a
    local copy so the page stays self-contained): "Client Project" for every review."""
    return (f'<span class="hero-tile__tag hero-tile__tag--{E(p["label_kind"])}" aria-hidden="true">'
            f'<i></i>{E(p["label"])}</span>')


def _card(ctx, t, i, n):
    """One slot of the deck. DOM order = reading order (company, industry, rating, quote, link, then the still); the
    CSS shows the still first. A card to the right of the front one is "is-right" (its caption row mirrors, >= 800 px;
    34-stories.js keeps the class in step while the deck moves)."""
    import projects
    p = t['project']
    d = _pos(i, n)
    still = p.get('card_poster') or p['scene_still']
    media = lib.media_img(ctx, still['entry'], still['alt'], sizes=MEDIA_SIZES, max_width=1280, cls='sto-voice__img',
                          attrs=f'style="object-position:{projects.focal(p, still)}" draggable="false"')
    if abs(d) > EAGER_REACH:
        media = _deferred(media, wide=abs(d) <= WIDE_REACH)
    person = ' · '.join(E(T(x)) for x in (t.get('name'), t.get('role')) if x)       # only with the person's consent
    person = f'<p class="sto-voice__person">{person}</p>' if person else ''
    link = lib.button(ctx, 'View project', ctx.url(p['route']), variant='light', icon_name='arrow-ne',
                      aria=f"View project: {p['title']}", cls='sto-voice__link', attrs='data-cursor-off')
    return f"""<div class="sto-deck__slot{" is-front" if d == 0 else " is-right" if d > 0 else ""}" data-deck-slot data-pos="{d}">
          <article class="card sto-voice" role="tabpanel" id="sto-panel-{p["slug"]}" aria-roledescription="slide" aria-labelledby="sto-tab-{p["slug"]}" style="--spill:{p.get("spill") or NEUTRAL_SPILL}">
            {DOTS}
            <div class="sto-voice__head">
              <div class="sto-voice__by">{person}<h3 class="sto-voice__h"><span class="sto-voice__co">{E(p["title"])}</span></h3>
                <p class="sto-voice__ind">{E(p["industry"])}</p></div>
              {_rating(t["rating"]) if t["rating"] else ""}
            </div>
            <div class="sto-voice__body">
              <blockquote class="sto-voice__quote"><p>&ldquo;{E(T(t["quote"].strip()))}&rdquo;</p></blockquote>
              {link}
            </div>
            <div class="sto-voice__media">{_tag(p)}{media}<i class="sto-voice__glare" aria-hidden="true"></i></div>
            <i class="sto-voice__dim" aria-hidden="true"></i>
          </article>
        </div>"""


def _deferred(img, wide=False):
    """The <img> with its src / srcset moved to data-src / data-srcset (34-stories.js loads it), followed by a
    <noscript> copy of the original for visitors without JS (34-stories.css hides the empty one there). wide: a far
    peek, wrapped in a <picture> whose >= 800 px source (the same files and sizes) the browser loads by itself."""
    lazy = img.replace(' src="', ' data-src="', 1).replace(' srcset="', ' data-srcset="', 1)
    if wide:
        at = dict(re.findall(r' (srcset|sizes)="([^"]*)"', img))
        lazy = f'<picture><source media="(min-width: 800px)" srcset="{at["srcset"]}" sizes="{at["sizes"]}">{lazy}</picture>'
    return f'{lazy}<noscript>{img}</noscript>'


def _tab(t, i):
    """One dot of the tablist: named by the company only (the browser announces "tab, 2 of 6")."""
    p = t['project']
    return (f'<button class="sto-deck__dot{" is-current" if i == 0 else ""}" type="button" role="tab" id="sto-tab-{p["slug"]}" '
            f'aria-controls="sto-panel-{p["slug"]}" aria-selected="{"true" if i == 0 else "false"}" tabindex="{0 if i == 0 else -1}" '
            f'aria-label="{E(p["title"])}"><i></i></button>')


def _reviews(ctx):
    items = testimonials()
    if not items:
        return ''
    r = STORIES['reviews']
    n = len(items)
    shows_samples = any(t.get('sample') for t in items)
    sub = f'<p class="section-head__sub" data-reveal style="--d:160ms">{E(T(r["body"]))}</p>' if r.get('body') else ''
    sample = (f'<p class="sto-sample" id="sto-sample" data-reveal style="--d:160ms"><i aria-hidden="true"></i>{E(T(r["sample_tag"]))}</p>'
              if shows_samples else '')
    slots = ''.join(_card(ctx, t, i, n) for i, t in enumerate(items))
    tabs = ''.join(_tab(t, i) for i, t in enumerate(items))
    described = ' aria-describedby="sto-sample"' if shows_samples else ''
    return f"""<section class="section sto-rev" id="client-reviews" aria-labelledby="client-reviews-title">
  <div class="container sto-rev__inner">
    <header class="section-head sto-head sto-rev__head">
      {pill_label(r['label'])}
      <h2 class="section-head__title" id="client-reviews-title" data-split>{E(T(r['title']))}</h2>
      {sub}{sample}
    </header>
    <div class="frame sto-rev__frame" data-reveal style="--y:60px">
      <div class="sto-deck{" is-single" if n == 1 else ""}" data-voices role="group" aria-roledescription="carousel" aria-label="Client reviews"{described}>
        <div class="sto-deck__vp" data-deck-vp data-cursor="Drag" data-cursor-icon="drag">
          <div class="sto-deck__track" id="sto-deck-track">{slots}</div>
        </div>
        <div class="sto-deck__ctrls">
          <button class="sto-rev__btn sto-rev__btn--prev" type="button" data-deck-prev aria-label="Previous client" aria-controls="sto-deck-track">{ICONS['arrow-r']}</button>
          <div class="sto-deck__dots" role="tablist" aria-label="Choose a client" style="--n:{n}">{tabs}</div>
          <button class="sto-rev__btn" type="button" data-deck-next aria-label="Next client" aria-controls="sto-deck-track">{ICONS['arrow-r']}</button>
        </div>
        <p class="sr-only" data-deck-status aria-live="polite" aria-atomic="true"></p>
      </div>
    </div>
  </div>
</section>"""


# ------------------------------------------------------------------ sections
def _hero(ctx):
    h = STORIES['hero']
    title = ''.join(f'<span class="sto-hero__line">{E(T(line))}</span> ' for line in h['title']).strip()
    return page_hero(ctx, 'Client Stories', title, sub_html=E(T(h['body'])), cls='sto-hero')


def _experience(ctx):
    x = STORIES['experience']
    n = len(x['lines'])
    steps = []
    for i, line in enumerate(x['lines'], 1):
        last = i == n
        steps.append(f'''<li class="card sto-step{" sto-step--last" if last else ""}" data-reveal style="--y:48px">
          {DOTS}
          <span class="sto-step__top" aria-hidden="true"><span class="sto-step__n mono">{i:02d}<span>/{n:02d}</span></span><span class="sto-step__pip" aria-hidden="true"></span></span>
          <span class="sto-step__t">{E(T(line))}</span>
        </li>''')
    c1, c2 = (x['closing'] + ['', ''])[:2]
    mark = lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=64, h=64, cls='sto-close__img')
    return f'''<section class="section sto-exp" id="experience" aria-labelledby="experience-title">
  <div class="container sto-exp__inner">
    <header class="section-head sto-head">
      {pill_label(x['label'])}
      <h2 class="section-head__title" id="experience-title" data-split>{E(T(x['title']))}</h2>
      <p class="section-head__sub" data-reveal style="--d:160ms">{E(T(x['body']))}</p>
    </header>
    <div class="frame sto-frame">
      <ol class="sto-steps" role="list" data-stagger="90">{''.join(steps)}</ol>
      <div class="card sto-close" data-reveal style="--y:48px;--d:200ms">
        {DOTS}
        <span class="sto-close__mark">{mark}</span>
        <p class="sto-close__text"><span class="sto-close__a">{E(T(c1))}</span> <span class="sto-close__b">{E(T(c2))}</span></p>
      </div>
    </div>
  </div>
</section>'''


def _review(ctx):
    r = STORIES['review_cta']
    email = CONFIG.get('email') or ''
    href = f'mailto:{email}?subject={quote("Review for " + BRAND)}' if email else ctx.url('contact')
    btn = swap_button(f"{r['cta']}", 'Send an email', href, icon_name='arrow-r', cls='sto-review__btn',
                      label=f"{r['cta']} (opens your email app)" if email else r['cta'])
    note = f'<p class="sto-review__mail mono">{E(email)}</p>' if email and not CONFIG.get('email_is_placeholder') else ''
    return f'''<section class="section sto-review" id="review" aria-labelledby="review-title">
  <div class="container sto-review__inner">
    <div class="frame sto-review__frame" data-reveal style="--y:60px">
      <div class="card sto-review__card">
        {DOTS}
        <div class="sto-review__main">
          <span class="sto-review__icon" aria-hidden="true">{lib.svg_inline('assets/brand/logo-mark.svg')}</span>
          <div class="sto-review__copy">
            <h2 class="sto-review__title" id="review-title">{E(T(r['title']))}</h2>
            <p class="sto-review__body">{E(T(r['body']))}</p>
          </div>
        </div>
        <div class="sto-review__cta">{btn}{note}</div>
      </div>
    </div>
  </div>
</section>'''


def render(ctx):
    return _hero(ctx) + _reviews(ctx) + _experience(ctx) + _review(ctx)
