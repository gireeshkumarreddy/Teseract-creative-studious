"""Home section 6 — FAQ (reference `#faq`, ref-plans-faq-footer §2).

Near-black full-bleed panel (#0b0b0b, radius 120/80/32, hairline arcs on the rounded edges — black
theme, see 25-faq.css) stacked directly on top of the footer's true-black panel: left column = pill + heading + contact card (brand mark avatar, CONTACT.before copy, two outline
buttons with the reference's hover tint blob + label swap); right column = accordion of
content.FAQ (APG accordion: h3 > button[aria-expanded][aria-controls] + answer panel; no role=region
because seven panels can be open at once and would flood the landmark list; height + icon animation
in 25-faq.js / 25-faq.css).
"""
import lib
from lib import E, fmt, CONFIG, ICONS, pill_label
from content import FAQ, CONTACT

# Phosphor "Plus" (bold), exactly as the reference accordion icon.
PLUS = ('<svg viewBox="0 0 256 256" aria-hidden="true" focusable="false"><path fill="currentColor" '
        'd="M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z"/></svg>')


def _outline_button(href, title, detail, icon_html, detail_icon_html, label, *, external=False):
    """Reference outline button (component framer-wp8tk): 48px, radius 16, hairline border,
    a tint blob that drops in on hover and two label rows that swap places."""
    ext = ' target="_blank" rel="noopener"' if external else ''
    return (f'<a class="faq-btn" href="{E(href)}" aria-label="{E(label)}"{ext}>'
            f'<span class="faq-btn__blob" aria-hidden="true"></span>'
            f'<span class="faq-btn__win" aria-hidden="true">'
            f'<span class="faq-btn__row faq-btn__row--main"><span class="faq-btn__ic">{icon_html}</span><span>{E(title)}</span></span>'
            f'<span class="faq-btn__row faq-btn__row--alt"><span class="faq-btn__ic">{detail_icon_html}</span><span class="faq-btn__detail">{E(detail)}</span></span>'
            f'</span></a>')


def _contact_card(ctx):
    before = CONTACT['before']
    email = CONFIG.get('email') or ''
    # A placeholder address (site.config.json "email_is_placeholder") is never shown or announced;
    # the button still opens the visitor's email app, like the contact page.
    placeholder = bool(CONFIG.get('email_is_placeholder'))
    idea_label = next((f[1] for f in CONTACT['form']['fields'] if f[0] == 'idea'), 'Tell us about your idea')
    avatar = lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=56, h=56, cls='faq-card__mark')
    text = ' '.join([before['lines'][0]] + before['closing'])
    buttons = []
    if email:
        buttons.append(_outline_button(f'mailto:{email}', 'Email Us', 'Opens your email app' if placeholder else email,
                                       ICONS['mail'], ICONS['arrow-ne'],
                                       'Email us' if placeholder else f'Email us at {email}'))
    buttons.append(_outline_button(ctx.url('contact'), 'Start a Project', idea_label,
                                   lib.svg_inline('assets/brand/logo-mark.svg'), ICONS['arrow-r'],
                                   'Start a Project'))
    return f'''<div class="faq-card" data-reveal style="--d:120ms">
      <span class="faq-card__dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      <span class="faq-card__avatar">{avatar}</span>
      <div class="faq-card__copy">
        <h3 class="faq-card__title">{E(fmt(before["title"]))} {E(fmt(before["body"]))}</h3>
        <p class="faq-card__text">{E(fmt(text))}</p>
      </div>
      <div class="faq-card__actions">{"".join(buttons)}</div>
    </div>'''


def _item(i, q, a):
    qid, aid = f'faq-q-{i}', f'faq-a-{i}'
    return f'''<div class="faq__cell" data-reveal style="--y:150px">
      <div class="faq-item" data-faq-item>
        <h3 class="faq-item__h">
          <button class="faq-item__btn" type="button" id="{qid}" aria-expanded="false" aria-controls="{aid}">
            <span class="faq-item__q">{E(fmt(q))}</span>
            <span class="faq-item__icon" aria-hidden="true"><span class="faq-item__plus">{PLUS}</span></span>
          </button>
        </h3>
        <div class="faq-item__panel" id="{aid}">
          <div class="faq-item__clip"><p class="faq-item__a">{E(fmt(a))}</p></div>
        </div>
      </div>
    </div>'''


def render(ctx):
    items = ''.join(_item(i, q, a) for i, (q, a) in enumerate(FAQ, 1))
    return f'''<section class="home-faq section" id="faq" aria-labelledby="faq-title">
  <div class="faq__panel">
    <div class="faq__aside">
      <header class="faq__head">
        {pill_label('FAQs')}
        <h2 class="faq__title" id="faq-title" data-split>Have questions?</h2>
      </header>
      {_contact_card(ctx)}
    </div>
    <div class="faq__list" data-faq>
      {items}
    </div>
  </div>
</section>'''
