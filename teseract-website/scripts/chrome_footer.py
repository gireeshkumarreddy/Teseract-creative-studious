"""Global footer (reference `#footer` + final link bar, ref-plans-faq-footer §3).

render(ctx, cta=True)
  cta=True  -> 100vh black panel (120/80/62px top radius): radial grey sheet with five diagonal
               light streaks, the rotating "Circle Wrap" ring of 24 project cards (the studio's own websites) (12 arms, 15deg
               apart, card-centre radius 583px, 50s linear loop), progressive blur + bottom fade,
               then the live clock line, HOME.final_cta headline + doc lines and a white
               "Start a Project" button. Followed by the link bar. Phones (and phones held sideways) show
               the same ring at phone scale, cards 64-80px, only its upper arc above the CTA text; upright
               phones load 12 of its images (each card opposite shows the same one, TWIN_MEDIA).
  cta=False -> compact dark band (big wordmark, clock line, tagline) + the same link bar (without
               its small wordmark, which would repeat the big one); used on the contact and 404
               pages where the big CTA would be redundant.

Black theme (12-footer.css): the panel stays true black with its light streaks; on the black page
its rounded top is drawn by a hairline arc + rim light (pseudo-elements of .ft__bg, no markup). The
link bar is dark too: hairline divider, --ink-2 links, --muted-strong small type.

Clock: shows the visitor's local time ("— your local time"). If site.config.json gains an IANA
"timezone" (e.g. "Europe/London"), it shows the studio's time instead ("— our studio time").
Socials: only channels with a configured URL are rendered (ref-plans-faq-footer §G) — no dead links.
"""
import re

import lib
from lib import E, fmt, CONFIG, BRAND, button
from content import HOME, FOOTER, NAV

TIMEZONE = str(CONFIG.get('timezone') or '').strip()

# 24 ring cards, clockwise from 12 o'clock (arm k holds card k at 15k deg and card 12+k at
# 15k+180 deg): square crops of the studio's own websites (scripts/projects.py), one project after the
# other in the curated order, each round taking the next still of every project, so neighbouring cards
# always show different sites.
RING_CARDS = 24


def _ring_stills():
    import projects
    pool = projects.PROJECTS
    if not pool:
        return []
    out, k = [], 0
    while len(out) < RING_CARDS and k < RING_CARDS * 4:
        p = pool[k % len(pool)]
        stills = [s for s in p['stills'] if s['frame'] == 'desktop'] + [s for s in p['stills'] if s['frame'] != 'desktop']
        out.append((p, stills[(k // len(pool)) % len(stills)]))
        k += 1
    return out


# The five diagonal light streaks of the gradient sheet (§3.3): width, left, fill stop, 90deg mask.
STREAKS = [
    (591, 'calc(33.6111% - 295.522px)', '83.93%',
     '#0000 0%,#000 20.04%,#0000 36.18%,#000 55.41%,#00000021 67.12%,#000 78.23%,#0000 97.3%'),
    (582, 'calc(-1.52778% - 291.002px)', '83.93%',
     '#0000 11.4%,#000 25.56%,#0000008c 41.7%,#00000021 67.12%,#000 78.23%,#0000 97.3%'),
    (441, 'calc(33.6806% - 220.619px)', '67%',
     '#0000 9.81%,#000 20.04%,#0000008c 28.59%,#0000006c 40.09%,#000 48.65%,#0004 54.5%,#00000021 78.58%,#000 88.55%,#0000 97.3%'),
    (684, 'calc(50.1389% - 341.798px)', '83.93%',
     '#0000 0%,#000 17.66%,#0000008c 26.64%,#000 35.23%,#0000 47.7%,#00000021 69.18%,#000 79.15%,#0000 97.3%'),
    (426, 'calc(49.0972% - 213.086px)', '83.93%',
     '#0000 0%,#000 20.04%,#0000008c 27.58%,#000 42.34%,#0000 48.6%,#00000021 67.12%,#000 74.95% 82.43%,#00000078 88.67%,#0000 97.3%'),
]


def _sheet():
    streaks = ''.join(
        f'<i class="ft__streak" style="width:{w}px;left:{left};--fill:{fill};--mask:linear-gradient(90deg,{mask})"></i>'
        for w, left, fill, mask in STREAKS)
    return f'<div class="ft__black"></div><div class="ft__sheet">{streaks}</div>'


# Upright phones (< 600px) only ever show the top of the ring, about 6 of the 24 cards at a time and never a card
# together with the one opposite it (measured 360-599 wide), so there card 12+k shows card k's image: 12 downloads
# instead of 24 for the same ring of 24 cards. Small tablets and phones held sideways see more of the circle and keep
# all 24 (12-footer.css switches the twins' focal point with the same query).
TWIN_MEDIA = '(max-width:599.98px)'


def _img(ctx, item, style):
    import projects
    p, still = item
    # phone ring cards are 64-80px (12-footer.css), so a phone picks the smallest prepared rung
    return lib.media_img(ctx, still['entry'], '', max_width=640,
                         sizes='(max-width:799.98px) 80px, (max-height:500px) and (orientation:landscape) 80px, 110px',
                         attrs=f'style="{style}"' if style else f'style="object-position:{projects.focal(p, still)}"')


def _card(ctx, item, twin=None):
    if not item:
        return '<span class="ft__card"></span>'
    if not twin:
        return f'<span class="ft__card">{_img(ctx, item, "")}</span>'
    import projects
    srcset = re.search(r'srcset="([^"]*)"', _img(ctx, twin, '')).group(1)   # the same candidates, so the same file
    img = _img(ctx, item, f'--fp:{projects.focal(*item)};--fp-ph:{projects.focal(*twin)}')
    return (f'<span class="ft__card"><picture><source media="{TWIN_MEDIA}" srcset="{srcset}" sizes="80px">'
            f'{img}</picture></span>')


def _ring(ctx):
    cards = _ring_stills()
    cards += [None] * (RING_CARDS - len(cards))
    arms = ''.join(
        f'<div class="ft__arm" style="--a:{k * 15}deg">{_card(ctx, cards[k])}{_card(ctx, cards[12 + k], cards[k])}</div>'
        for k in range(12))
    blur = ''.join('<i></i>' for _ in range(8))
    return (f'<div class="ft__ring-wrap"><div class="ft__ring" data-ft-ring>{arms}</div></div>'
            f'<div class="ft__blur">{blur}</div><div class="ft__fade"></div>')


def _clock(cls='ft__clock', **attrs):
    """Live clock (filled by 12-footer.js; hidden without JS): the studio's time when a time zone
    is configured, otherwise the visitor's own."""
    extra = ''.join(f' {k.replace("_", "-")}="{E(v)}"' for k, v in attrs.items())
    tz = f' data-tz="{E(TIMEZONE)}"' if TIMEZONE else ''
    label = 'our studio time' if TIMEZONE else 'your local time'
    return (f'<p class="{cls}"{extra}><time class="ft__time" data-ft-clock{tz}>00:00:00 PM</time>'
            f'<span class="ft__clock-label"> — {label}</span></p>')


def _avatar(ctx):
    """Lead of the white button: brand-mark avatar; on hover it slides open to "[mark] + You"
    (reference footer Contact button)."""
    mark = lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=28, h=28)
    return (f'<span class="ft-av__you">You</span><span class="ft-av__plus">+</span>'
            f'<span class="ft-av__mark">{mark}</span>')


def _cta(ctx):
    fc = HOME['final_cta']
    lines = ' '.join(fmt(s) for s in fc['lines'])
    lines2 = ' '.join(fmt(s) for s in fc['lines2'])
    btn = button(ctx, fc['cta'], ctx.url('contact'), variant='inverse', lead=_avatar(ctx), cls='ft__btn')
    return f'''<section class="ft" id="footer-cta" data-nav-dark data-ft aria-labelledby="ft-title">
  <div class="ft__bg" aria-hidden="true">{_sheet()}{_ring(ctx)}</div>
  <div class="ft__content">
    <div class="ft__group">
      <div class="ft__text">
        {_clock(data_reveal='fade')}
        <h2 class="ft__title" id="ft-title" data-split>{E(fmt(fc["title"]))}</h2>
        <p class="ft__sub" data-reveal style="--d:140ms"><span>{E(lines)}</span> <span class="ft__sub-2">{E(lines2)}</span></p>
      </div>
      <div class="ft__action" data-reveal style="--d:240ms">{btn}</div>
    </div>
  </div>
</section>'''


def _compact(ctx):
    return f'''<div class="ft ft--compact" data-nav-dark data-ft>
  <div class="ft__bg" aria-hidden="true">{_sheet()}</div>
  <div class="ft__compact container">
    <div class="ft__compact-top" data-reveal="fade">
      {_clock()}
      <p class="ft__tagline">{E(fmt(CONFIG.get("tagline", "")))}</p>
    </div>
    <a class="ft__bigmark" href="{ctx.url('')}" aria-label="{E(BRAND)} home" data-reveal style="--d:120ms">{lib.svg_inline('assets/brand/wordmark-lockup.svg')}</a>
  </div>
</div>'''


def _bar_link(href, text, *, current=False, external=False, cls='ft-bar__link'):
    ext = ' target="_blank" rel="noopener"' if external else ''
    cur = ' aria-current="page"' if current is True else (' aria-current="true"' if current == 'section' else '')
    return f'<a class="{cls}" href="{E(href)}"{cur}{ext}>{E(text)}</a>'


def _socials():
    """FOOTER socials that the studio has actually supplied (site.config.json). Channels without a
    URL are left out rather than shown as dead links; a placeholder email address is never
    announced (the link still opens the visitor's email app)."""
    out = []
    email = CONFIG.get('email') or ''
    placeholder = bool(CONFIG.get('email_is_placeholder'))
    for name in FOOTER['socials']:
        key = name.lower()
        if key == 'email':
            if email:
                label = f'Email {BRAND}' if placeholder else f'Email {BRAND} at {email}'
                out.append(f'<li><a class="ft-bar__link" href="mailto:{E(email)}" aria-label="{E(label)}">Email</a></li>')
            continue
        href = lib.social_href(key)
        if href:
            out.append(f'<li><a class="ft-bar__link" href="{E(href)}" target="_blank" rel="noopener" '
                       f'aria-label="{E(BRAND)} on {E(name)} (opens in a new tab)">{E(name)}</a></li>')
    return ''.join(out)


def _bar(ctx, compact=False):
    current = ctx.route.split('/')[0]
    nav = ''.join(
        f'<li>{_bar_link(ctx.url(route), label, current=(True if route == ctx.route else ("section" if route == "work" and current == "projects" else False)))}</li>' for _key, label, route in NAV)
    # no-break space before each dot so a wrapped line never starts with a separator
    services = ' · '.join(FOOTER['services'])
    legal = (f'<li>{_bar_link(ctx.url("privacy"), "Privacy policy", current=current == "privacy")}</li>'
             f'<li>{_bar_link(ctx.url("terms"), "Terms of service", current=current == "terms")}</li>')
    brand = '' if compact else (f'<a class="ft-bar__brand" href="{ctx.url("")}" aria-label="{E(BRAND)} home">'
                                f'{lib.svg_inline("assets/brand/wordmark-header.svg", "ft-bar__word")}</a>')
    socials = _socials()
    social = f'<ul class="ft-bar__links ft-bar__social" role="list" aria-label="Social and email">{socials}</ul>' if socials else ''
    return f'''<div class="ft-bar{' ft-bar--compact' if compact else ''}">
  <div class="ft-bar__inner container">
    <div class="ft-bar__main">
      {brand}
      <p class="ft-bar__line">{E(fmt(FOOTER["line"]))}</p>
      <nav class="ft-bar__nav" aria-label="Footer">
        <ul class="ft-bar__links" role="list">{nav}</ul>
      </nav>
      <p class="ft-bar__services"><span class="sr-only">Services: </span>{E(services)}</p>
      {social}
    </div>
    <div class="ft-bar__meta">
      <p class="ft-bar__copy">{E(fmt(FOOTER["copyright"]))}</p>
      <ul class="ft-bar__links ft-bar__legal" role="list" aria-label="Legal">{legal}</ul>
      <p class="ft-bar__motto">{E(fmt(FOOTER["motto"]))}</p>
    </div>
  </div>
</div>'''


def render(ctx, cta=True):
    return f'''<footer class="site-footer{' site-footer--compact' if not cta else ''}" id="footer">
{_cta(ctx) if cta else _compact(ctx)}
{_bar(ctx, compact=not cta)}
</footer>'''
