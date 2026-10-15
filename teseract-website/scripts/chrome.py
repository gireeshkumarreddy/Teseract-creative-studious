"""Page shell: <head>, minimal header (logo + menu button), menu overlay slot, footer slot, page shade."""
import importlib, sys, traceback
import lib
from lib import E, fmt, CONFIG, BRAND, button, roll, icon, ICONS



def _safe(module, func, *args, **kw):
    try:
        return getattr(importlib.import_module(module), func)(*args, **kw)
    except Exception:
        tb = traceback.format_exc()
        print(f'!! {module}.{func} failed\n{tb}', file=sys.stderr)
        lib.FAILURES.append((module, func, tb))
        return f'<div class="build-error"><pre>{E(module)}.{E(func)} failed:\n{E(tb[-900:])}</pre></div>'


def wordmark(ctx, cls='wordmark'):
    """TESERACT with CREATIVE STUDIOS under it, as in the supplied logo (owner, 14 Oct). The header lockup re-sets the
    logo's own small-line glyphs a little larger so they stay legible at header size (_tools/make_header_lockup.py)."""
    return lib.svg_inline('assets/brand/wordmark-header.svg', cls)


def motion_toggle(label='Pause motion', cls=''):
    """Shared pause / play control for a [data-motion-scope] (WCAG 2.2.2; behaviour 02-core.js TS.motionToggle,
    look 02-components.css .motion-toggle). Place it inside the element that carries data-motion-scope. Hidden until
    the script shows it with motion on (without JS or under reduced motion nothing in the scope moves); on touch
    screens it is a 32px round icon-only button whose label stays readable to screen readers."""
    extra = f' {cls}' if cls else ''
    return (f'<button class="motion-toggle{extra}" type="button" data-motion-toggle hidden>'
            '<span class="motion-toggle__ic" aria-hidden="true"><i></i><i></i></span>'
            f'<span class="motion-toggle__label" data-motion-label>{E(label)}</span></button>')


def header(ctx):
    """Minimal header on every breakpoint: logo + three-line menu button. All navigation lives
    in the full-screen menu (chrome_menu.py)."""
    home = ' aria-current="page"' if ctx.route == '' else ''
    return f'''<header class="site-header" data-header>
  <div class="hdr">
    <a class="hdr-brand" href="{ctx.url('')}" aria-label="{E(CONFIG['brand_full'])} — home"{home}>
      <span class="hdr-brand__mark">{lib.svg_inline('assets/brand/logo-mark.svg')}</span>
      {wordmark(ctx, 'hdr-brand__word')}
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-menu" data-menu-open>
      <span class="nav-toggle__icon" aria-hidden="true"><i></i><i></i><i></i></span><span class="sr-only">Open menu</span>
    </button>
  </div>
</header>'''


def document(ctx, title, description, body, *, footer_cta=True):
    import seo
    full_title, description = seo.meta(ctx, title, description)
    b = ctx.base
    og = ctx.asset('assets/brand/og-image.jpg')
    page_url = seo.abs_url(ctx.route)
    if page_url:
        og = seo.SITE + '/assets/brand/og-image.jpg'
    canonical = (f'<link rel="canonical" href="{E(page_url)}">'
                 f'<meta property="og:url" content="{E(page_url)}">') if page_url else ''
    ld = seo.jsonld(seo.schema(ctx, full_title, description))
    menu = _safe('chrome_menu', 'render', ctx)
    footer = _safe('chrome_footer', 'render', ctx, cta=footer_cta and ctx.page not in ('contact', 'notfound'))
    intro = _safe('chrome_intro', 'render', ctx)   # intro logo animation overlay: hidden unless the head script opts in
    return f'''<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(full_title)}</title>
<meta name="description" content="{E(description)}">
<meta name="theme-color" content="#000000">
<meta name="color-scheme" content="dark">
{'<meta name="robots" content="noindex">' if CONFIG.get('indexable') and ctx.page == 'notfound' else '' if CONFIG.get('indexable') else '<meta name="robots" content="noindex,nofollow">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="{E(CONFIG['brand_full'])}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="{E(full_title)}">
<meta property="og:description" content="{E(description)}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="{E(CONFIG['brand_full'])} logo">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{E(full_title)}">
<meta name="twitter:description" content="{E(description)}">
{canonical}
<link rel="alternate" type="text/plain" href="{b}llms.txt" title="{E(CONFIG['brand_full'])} — summary for AI assistants">
{ld}
<link rel="icon" href="{ctx.asset('assets/brand/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="{ctx.asset('assets/brand/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{ctx.asset('assets/brand/apple-touch-icon-180.png')}">
<script>(function(d){{d.className=d.className.replace('no-js','js');var m=0;
try{{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){{d.classList.add('motion');m=1}}}}catch(e){{}}
try{{var s=sessionStorage,l=location,q=/[?&]intro=([01])(?:&|$)/.exec(l.search),r=document.referrer||'',o=l.origin,
n=s.getItem('ts-nav')==='1'||(!!o&&o!=='null'&&r.indexOf(o+'/')===0),
ok=m&&!l.hash&&!(navigator.connection&&navigator.connection.saveData)&&!matchMedia('(forced-colors: active)').matches&&!!d.animate&&!!d.getAnimations,
p=ok&&(q?q[1]==='1':!s.getItem('ts-intro')&&!n);
s.setItem('ts-intro','1');
if(p){{d.classList.add('ts-intro');
if(document.visibilityState!=='visible'){{d.classList.add('tsi-wait');document.addEventListener('visibilitychange',function w(){{if(document.visibilityState==='visible'){{d.classList.remove('tsi-wait');document.removeEventListener('visibilitychange',w)}}}})}}
var k=window.__tsiK=function(e){{if(e.type==='keydown'&&/^(Shift|Control|Alt|Meta|CapsLock|Fn|OS)$/.test(e.key))return;if(!window.__tsiT)window.__tsiT=performance.now();d.classList.add('tsi-skip')}};
['pointerdown','keydown','wheel','touchmove'].forEach(function(t){{addEventListener(t,k,{{capture:true,passive:true}})}});
addEventListener('animationstart',window.__tsiF=function f(e){{if(e.animationName==='tsi-failsafe'){{['pointerdown','keydown','wheel','touchmove'].forEach(function(t){{removeEventListener(t,k,true)}});removeEventListener('animationstart',f,true)}}}},true)}}}}catch(e){{}}
try{{var c=document.createElement('canvas').getContext('2d'),t='mmmmmmmmmmlliWQ@#',w=function(f){{c.font='72px '+f;return c.measureText(t).width}};d.classList.add('font-hn');if({'true' if lib.WEBFONT else 'false'}||w('"Helvetica Neue",monospace')!==w('monospace'))d.classList.add('font-hn-real')}}catch(e){{}}}})(document.documentElement)</script>
<link rel="preload" href="{b}assets/{'fonts/helvetica-neue-400.woff2' if lib.WEBFONT else 'inter-tight-latin.woff2'}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="{b}styles.css?v={lib.ASSET_VERSION.get('styles.css', '1')}">
<script src="{b}app.js?v={lib.ASSET_VERSION.get('app.js', '1')}" defer></script>
</head>
<body class="page-{ctx.page}">
{intro}
<a class="skip-link" href="#main">Skip to content</a>
{header(ctx)}
{menu}
<main id="main" tabindex="-1">
{body}
</main>
{footer}
<div class="page-shade" aria-hidden="true"></div>
</body>
</html>
'''
