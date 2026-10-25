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


def chat_dock(ctx):
    """The 'Ask {brand}' launcher (owner, 21 Oct): bottom right on every page. Without JS it is a link to the contact
    form; src/js/40-chat.js turns it into the chat button and loads the chat (assets/chat/, built by build.py from
    src/chat/) on demand. The greeting bubble (content.CHAT 'hello') and the living launcher's lines (CHAT 'say', owner
    21 Oct 23:20: it wanders and talks) are left out on contact, the 404 and the legal pages. 'ask_label' shows under the
    mark only under reduced motion. Nothing when site.config.json chat.enabled is false."""
    chat = CONFIG.get('chat') or {}
    if not chat.get('enabled'):
        return ''
    import chat_kb
    from content import CHAT
    from lib import ASSET_VERSION as V
    b = ctx.base
    proj = ''
    if ctx.page == 'project':
        proj = ctx.route.split('/', 1)[1]
    sh = chat_kb.mark()
    shards = ''.join(
        f'<span class="cc-sh cc-sh--{k}" style="--o:{s["o"]}{"" if k == "c" else ";--nx:" + s["n"].split(",")[0] + ";--ny:" + s["n"].split(",")[1]}">'
        f'<svg viewBox="0 0 100 100" focusable="false"><path d="{s["d"]}"/></svg></span>' for k, s in sh.items())
    hello = say = ''
    key = {'home': 'home', 'stories': 'stories', 'create': 'create', 'approach': 'approach', 'who': 'who', 'work': 'work',
           'project': 'project'}.get(ctx.page)
    if key:
        title = ''
        if proj:
            import projects
            p = projects.by_slug(proj)
            title = chat_kb.prose_name(p) if p else ''      # "Like ONE PIECE (Luffy)?", "Like Gireesh's designer portfolio?"
        line = fmt(CHAT['hello'][key]).replace('{project}', title)
        q1, q2 = CHAT['hello_chips']
        hello = (f'<div class="cc-hello" id="cc-hello" hidden><p>{E(line)}</p>'
                 f'<button type="button" data-cc-q="price.website">{E(q1)}</button><button type="button" data-cc-q="ask">{E(q2)}</button>'
                 f'<button type="button" class="cc-hello__x" aria-label="{E(CHAT["hello_dismiss"])}">{ICONS["close"]}</button></div>')
        say = f' data-cc-say="{E("|".join(fmt(x) for x in CHAT["say"]))}"'   # the living launcher's lines (40-chat.js)
    email = '' if CONFIG.get('email_is_placeholder') else (CONFIG.get('email') or '')
    for f in chat_kb.AVATARS:
        lib.USED.add(f)
    data = (f'data-cc data-cc-base="{b}" data-cc-index="{"0" if (CONFIG.get("site_url") or "").strip() else "1"}" '
            f'data-cc-page="{E(ctx.page)}" data-cc-project="{E(proj)}" data-cc-email="{E(email)}" '
            f'data-cc-js="{b}assets/chat/chat.js?v={V.get("assets/chat/chat.js", "1")}" '
            f'data-cc-css="{b}assets/chat/chat.css?v={V.get("assets/chat/chat.css", "1")}" '
            f'data-cc-kb="{b}{chat_kb.KB_FILE}?v={V.get(chat_kb.KB_FILE, "1")}" '
            f'data-cc-ava="{b}{chat_kb.AVATARS[0]}" data-cc-ava2="{b}{chat_kb.AVATARS[1]}" '
            f'data-cc-l1="{E(fmt(CHAT["launcher_label"]))}" data-cc-l2="{E(fmt(CHAT["launcher_label_resume"]))}" '
            f'data-cc-p2="{E(fmt(CHAT["pill_resume"]))}"{say}')
    return (f'<div class="cc" {data}><a class="cc-launch" href="{ctx.url("contact", "project-form")}" '
            f'aria-label="{E(fmt(CHAT["launcher_nojs"]))}" data-cc-launch><span class="cc-mark" aria-hidden="true">{shards}</span>'
            f'<span class="cc-ask" aria-hidden="true">{E(CHAT["ask_label"])}</span>'
            f'<span class="cc-pill" aria-hidden="true">{E(fmt(CHAT["pill"]))}</span><i class="cc-dot" aria-hidden="true"></i></a>'
            f'{hello}</div>')


def document(ctx, title, description, body, *, footer_cta=True, head_extra=''):
    """The page. head_extra: trusted markup for the end of <head> (a project page's poster preload)."""
    import seo
    full_title, description = seo.meta(ctx, title, description)
    b = ctx.base
    # share image (owner's SEO request, 18 Oct): the logo card, or a project page's own Work-card still; absolute once
    # site_url is set. No canonical / og:url on the not-found page (a canonical on a noindexed soft 404 is a mixed signal).
    og, og_w, og_h, og_alt = seo.og_image(ctx)
    page_url = None if ctx.page == 'notfound' else seo.abs_url(ctx.route)
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
<meta name="robots" content="{seo.robots(ctx)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="{E(CONFIG['brand_full'])}">
<meta property="og:locale" content="en_GB">
<meta property="og:title" content="{E(full_title)}">
<meta property="og:description" content="{E(description)}">
<meta property="og:image" content="{E(og)}">
<meta property="og:image:width" content="{og_w}">
<meta property="og:image:height" content="{og_h}">
<meta property="og:image:alt" content="{E(og_alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{E(full_title)}">
<meta name="twitter:description" content="{E(description)}">
<meta name="twitter:image" content="{E(og)}">
<meta name="twitter:image:alt" content="{E(og_alt)}">
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
{head_extra}</head>
<body class="page-{ctx.page}">
{intro}
<a class="skip-link" href="#main">Skip to content</a>
{header(ctx)}
{menu}
<main id="main" tabindex="-1">
{body}
</main>
{footer}
{_safe('chrome', 'chat_dock', ctx)}
<div class="page-shade" aria-hidden="true"></div>
</body>
</html>
'''
