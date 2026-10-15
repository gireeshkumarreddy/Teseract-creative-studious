"""PRIVACY (/privacy/), TERMS (/terms/) and 404 (/404/ + root 404.html).

Honest and minimal: the privacy page describes what this static site actually does (no analytics,
cookies or trackers; the contact form opens the visitor's email app, or posts to the configured form
service). Terms are a placeholder until the studio publishes its own. CSS: src/css/37-legal.css (.lg-*, .nf-*).
"""
from lib import E, fmt, CONFIG, BRAND, ICONS, button
from content import PRIMARY_CTA
from pages.who import page_hero, mark3d, flat_mark, SEAL, DOTS

EMAIL = CONFIG.get('email') or ''
PLACEHOLDER = bool(CONFIG.get('email_is_placeholder'))
ENDPOINT = (CONFIG.get('form_endpoint') or '').strip()


def _email_button(ctx, label='Email us'):
    """Reference outline button (same component as the contact page's)."""
    detail = EMAIL if (EMAIL and not PLACEHOLDER) else 'Opens your email app'
    icon = f'<span class="ct-out__icon">{ICONS["mail"]}</span>'
    return (f'<a class="ct-out lg-out" href="mailto:{E(EMAIL)}" aria-label="{E(label)}{(" at " + E(EMAIL)) if not PLACEHOLDER else ""}">'
            f'<span class="ct-out__blob" aria-hidden="true"></span><span class="ct-out__win" aria-hidden="true">'
            f'<span class="ct-out__row">{icon}<span>{E(label)}</span></span>'
            f'<span class="ct-out__row">{icon}<span>{E(detail)}</span></span></span></a>')


def _doc(ctx, blocks, *, aside=''):
    items = ''.join(
        f'<section class="lg-block" aria-labelledby="lg-{i}" data-reveal style="--y:40px">'
        f'<h2 class="lg-block__t" id="lg-{i}">{E(t)}</h2>{body}</section>'
        for i, (t, body) in enumerate(blocks, 1))
    return (f'<div class="lg-body"><div class="container"><div class="frame lg-frame" data-reveal style="--y:60px;--d:200ms">'
            f'<article class="card lg-card">{DOTS}{aside}{items}</article></div></div></div>')


def privacy(ctx):
    glance = ''.join(f'<li>{SEAL}<span>{E(t)}</span></li>' for t in ('No analytics', 'No cookies', 'No trackers'))
    aside = f'<ul class="lg-glance" role="list" aria-label="At a glance">{glance}</ul>'
    contact = f'<a class="ct-link" href="{ctx.url("contact")}">contact form</a>'
    if ENDPOINT:
        form = (f'<p>When you send the {contact}, the details you enter are submitted to the form service this website uses, '
                f'so that your message reaches {E(BRAND)}. Nothing is stored on this website itself.</p>')
    else:
        form = (f'<p>The {contact} doesn&rsquo;t send or store anything by itself. When you press the button, it opens '
                f'your own email app with your message filled in, so you decide whether to send it. If you do, it reaches '
                f'{E(BRAND)} like any other email.</p>')
    blocks = [
        ('What this website collects',
         '<p>Nothing on its own. There are no analytics, advertising or tracking scripts, and no cookies are set '
         'when you visit.</p>'),
        ('The contact form', form),
        ('Storage in your browser',
         '<p>To make page transitions smooth, the website briefly notes in your browser&rsquo;s session storage that '
         'you followed a link. It contains no personal information, never leaves your device and is cleared when you '
         'close the tab.</p>'),
        ('Third parties',
         '<p>Fonts, images and scripts are served from this website itself, so browsing it doesn&rsquo;t send requests to '
         'third-party services. Links to other websites, such as the live sites of projects we have worked on, open '
         'those websites, which have their own policies.</p>'),
        ('Questions',
         f'<p>If you have any questions about privacy, get in touch by email.</p>{_email_button(ctx)}'),
    ]
    hero = page_hero(ctx, 'Privacy', 'Privacy Policy',
                     sub_html=E(fmt('A short, honest summary of how the {brand} website handles your information.')),
                     cls='lg-hero')
    return hero + _doc(ctx, blocks, aside=aside)


def terms(ctx):
    blocks = [
        ('Coming soon',
         f'<p>{E(BRAND)} will publish the terms of service for this website here.</p>'),
        ('Questions in the meantime',
         '<p>If you have any questions about these terms, please get in touch.</p>'
         f'<div class="lg-actions">{_email_button(ctx)}'
         f'{button(ctx, "Contact", ctx.url("contact"), variant="dark", icon_name="arrow-r", cls="lg-btn")}</div>'),
    ]
    hero = page_hero(ctx, 'Terms', 'Terms of Service', cls='lg-hero')
    return hero + _doc(ctx, blocks)


def notfound(ctx):
    lead = f'<span class="nf-lead">{flat_mark("nf-lead__mark")}</span>'
    zero = f'<span class="nf-zero">{mark3d(ctx, "nf-zero__img", 220, eager=True)}</span>'
    return f'''<section class="nf" aria-labelledby="page-title">
  <div class="container nf__inner">
    <h1 class="nf__code" id="page-title" data-reveal style="--y:80px;--d:120ms">
      <span class="sr-only">404, page not found</span>
      <span class="nf__digits" aria-hidden="true"><span>4</span>{zero}<span>4</span></span>
    </h1>
    <p class="nf__text" data-reveal style="--y:60px;--d:260ms">This page doesn&rsquo;t exist.</p>
    <div class="nf__actions" data-reveal style="--y:60px;--d:380ms">
      {button(ctx, 'Home', ctx.url(''), variant='light')}
      {button(ctx, PRIMARY_CTA, ctx.url('contact'), variant='dark', lead=lead)}
    </div>
  </div>
</section>'''
