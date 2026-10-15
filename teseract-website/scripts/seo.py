"""SEO + GEO layer: page titles/descriptions, JSON-LD structured data, llms.txt and sitemap.

Every sentence is taken from (or condensed from) the content master document — no invented
claims, addresses, numbers or reviews. Absolute URLs (canonical, sitemap, schema @id/url) are only
emitted when site.config.json has a "site_url"; until then the markup stays valid without them.
"""
import json
from lib import CONFIG, BRAND, E, fmt
import content as C

SITE = (CONFIG.get('site_url') or '').rstrip('/')
NAME = CONFIG['brand_full']
TAIL = f' | {BRAND}'                       # short suffix keeps titles under ~60 chars

# Search titles (≈ 50–65 chars incl. brand) and descriptions (≈ 140–160 chars), per page key.
META = {
    'home': (f'{NAME} | Website Design & Development',
             'We design and build interactive, tailor-made websites and digital experiences for businesses that want '
             'to be different — from first idea to launch.'),
    'who': ('Who We Are — Digital Creative Studio' + TAIL,
            f'{BRAND} is a digital creative studio focused on design, technology and experiences, working with '
            'businesses, founders and teams that want to be different.'),
    'create': ('Website Design, Development & E-commerce' + TAIL,
               'Website design and development, e-commerce, interactive & 3D, branding, product & SaaS, AI & automation '
               'and digital strategy — built around your business.'),
    'approach': ('Our Approach — From Idea to Experience' + TAIL,
                 'Our website process in nine steps: understand, define, explore, design, refine, build, test, launch and '
                 'evolve. Great work doesn’t happen in one step.'),
    'work': ('Our Work — Websites & Digital Products' + TAIL,
             'Explore a selection of work we’ve created for businesses, brands and digital products: client websites, '
             'e-commerce and self-initiated concepts.'),
    'stories': ('Client Stories' + TAIL,
                'We believe the best measure of our work is what our clients think after working with us. Good work starts '
                'with good collaboration.'),
    'contact': ('Contact — Start a Website Project' + TAIL,
                'Have an idea, a new business or a website that needs a complete rethink? Tell us what you have in mind — '
                'you don’t need a perfect brief.'),
    'legal-privacy': ('Privacy Policy' + TAIL, f'Privacy information for the {NAME} website.'),
    'legal-terms': ('Terms of Service' + TAIL, f'Terms of service for the {NAME} website.'),
    'notfound': ('Page Not Found' + TAIL, f'This page doesn’t exist. Head back to the {NAME} home page, explore our work or start a project with us.'),
}

PAGE_TYPE = {'who': 'AboutPage', 'contact': 'ContactPage', 'work': 'CollectionPage', 'create': 'WebPage',
             'approach': 'WebPage', 'stories': 'WebPage', 'home': 'WebPage', 'project': 'WebPage'}


def _key(ctx):
    if ctx.page == 'legal':
        return 'legal-' + ctx.route
    return ctx.page


TITLE_MAX, DESC_MAX = 56, 155        # project pages: search-result limits (titles incl. the brand suffix)


def _quoted(text):
    """A verbatim tagline in curly quotes, closed with a full stop when it has no end punctuation of its own; quotes
    inside it become single quotes (I turn ‘what if’ into ...), so the quotation never nests double quotes."""
    t = text.strip().replace('“', '‘').replace('”', '’')
    return f"“{t}”" + ('' if t[-1:] in '.!?…' else '.')


def _first_fit(options, limit):
    return next((o for o in options if len(o) <= limit), options[-1][:limit].rstrip())


# The project's label (projects.py, owner 14 Oct) as a sentence opening for meta descriptions.
_LABEL_LEAD = {'Client Project': 'Client project', 'Interactive Concept': 'An interactive concept',
               'Concept Project': 'A self-initiated concept project', 'Personal project': 'A personal project'}


def project_meta(p):
    """(title, description) for a project page: facts only - name, industry, the site's own tagline,
    its label (client project / interactive concept + its "unofficial" line / concept project / personal project)
    and, for client work, the services."""
    # a name that already has a dash of its own ("Gireesh — a designer's working desk") never gets a second "— Website"
    title = _first_fit([f"{p['title']} — {p['industry']}{TAIL}"] + ([] if ' — ' in p['title'] else [f"{p['title']} — Website{TAIL}"])
                       + [f"{p['title']}{TAIL}"], TITLE_MAX)
    quote = _quoted(p['tagline']) + ' ' if p.get('tagline') else ''
    lead = _LABEL_LEAD.get(p.get('label'), 'A project')
    if p['group'] == 'client':
        what = f"{lead} by {NAME} ({', '.join(p['services_list'])})."
    else:
        note = f"; {p['note'][0].lower()}{p['note'][1:]}" if p.get('note') else ''
        what = f"{lead} by {NAME}{note}."
    head = f"{p['title']} ({p['industry']}): "
    return title, _first_fit([head + quote + what, head + what, f"{p['title']}: {what}"], DESC_MAX)


def meta(ctx, title, description):
    """(full <title>, meta description) for this page."""
    if ctx.page == 'project':
        import projects
        p = next((x for x in projects.CASES if x['route'] == ctx.route), None)
        if p:
            return project_meta(p)
        return f'{title} — Project{TAIL}', description
    t, d = META.get(_key(ctx), (None, None))
    if t:
        return fmt(t), fmt(d)
    return (f'{title}{TAIL}' if title else NAME), description


def abs_url(route=''):
    if not SITE:
        return None
    return f'{SITE}/{route.strip("/") + "/" if route.strip("/") else ""}'


def _org():
    org = {
        '@type': 'Organization',
        'name': NAME,
        'alternateName': BRAND,
        'slogan': CONFIG.get('tagline'),
        'description': fmt(C.WHO['hero']['body'][0]) + ' ' + C.HOME['hero']['lead'],
        'knowsAbout': [s['name'] for s in C.CREATE['services']],
    }
    if SITE:
        org['@id'] = SITE + '/#organization'
        org['url'] = SITE + '/'
        org['logo'] = SITE + '/assets/brand/apple-touch-icon-180.png'
    if CONFIG.get('email') and not CONFIG.get('email_is_placeholder'):
        org['email'] = CONFIG['email']
    same = [u for u in (CONFIG.get('socials') or {}).values() if u]
    if same:
        org['sameAs'] = same
    # the founder (owner, 15 Oct): a reference to the Person node on the who / home pages
    org['founder'] = {'@id': SITE + '/who-we-are/#founder'} if SITE else {'@type': 'Person', 'name': C.WHO['founder']['name']}
    return org


# Facts from the owner's founder text only (content.WHO['founder']); no image until a portrait exists
# (sections/founder.py FOUNDER_PORTRAIT).
FOUNDER_KNOWS = ['Product Design', 'UI/UX', 'interactive digital experiences']


def _person(org_ref):
    f = C.WHO['founder']
    soc = CONFIG.get('socials') or {}
    assert all(k in f['body'][1] for k in FOUNDER_KNOWS), 'seo: knowsAbout must be verbatim from the founder text'
    p = {'@type': 'Person', 'name': f['name'], 'jobTitle': 'Founder', 'worksFor': org_ref, 'knowsAbout': FOUNDER_KNOWS}
    same = [soc[k] for k in ('linkedin', 'instagram', 'github') if soc.get(k)]
    if same:
        p['sameAs'] = same
    if SITE:
        p['@id'] = SITE + '/who-we-are/#founder'
        p['url'] = abs_url('who-we-are') + '#founder'
        from sections import founder as FD
        if FD.FOUNDER_PORTRAIT:
            p['image'] = SITE + '/' + FD.FOUNDER_PORTRAIT['file']
    return p


def _services():
    return {
        '@type': 'OfferCatalog',
        'name': 'What we create',
        'itemListElement': [{
            '@type': 'Offer',
            'itemOffered': {
                '@type': 'Service',
                'name': s['name'],
                'description': ' '.join(x for x in [s['title'], s.get('body', '')] if x).strip(),
                'serviceType': ', '.join(s['tags'][:4]),
                'provider': {'@id': SITE + '/#organization'} if SITE else {'@type': 'Organization', 'name': NAME},
            },
        } for s in C.CREATE['services']],
    }


def schema(ctx, full_title, description, extra=None):
    """JSON-LD graph for a page (list of nodes)."""
    graph = []
    org = _org()
    graph.append(org)
    org_ref = {'@id': org['@id']} if SITE else {'@type': 'Organization', 'name': NAME}
    if ctx.page == 'home':
        site = {'@type': 'WebSite', 'name': NAME, 'alternateName': BRAND, 'inLanguage': 'en', 'publisher': org_ref}
        if SITE:
            site['@id'] = SITE + '/#website'
            site['url'] = SITE + '/'
        graph.append(site)
        org['hasOfferCatalog'] = _services()
        graph.append({'@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in C.FAQ]})
    page = {'@type': PAGE_TYPE.get(ctx.page, 'WebPage'), 'name': full_title, 'description': description,
            'inLanguage': 'en', 'about': org_ref}
    if SITE:
        page['url'] = abs_url(ctx.route)
        page['isPartOf'] = {'@id': SITE + '/#website'}
    if ctx.page == 'create':
        org['hasOfferCatalog'] = _services()
    if ctx.page == 'approach':
        page['mainEntity'] = {'@type': 'ItemList', 'name': 'How an idea becomes an experience', 'itemListOrder': 'Ascending',
                              'itemListElement': [{'@type': 'ListItem', 'position': i + 1,
                                                   'name': f"{s['name']} — {s['sub']}",
                                                   'description': s.get('body') or s.get('closing') or ''}
                                                  for i, s in enumerate(C.APPROACH['steps'])]}
    if ctx.page == 'work':
        import projects
        page['mainEntity'] = {'@type': 'ItemList', 'name': 'Selected work', 'numberOfItems': len(projects.PROJECTS),
                              'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'item': _work(p, org_ref)}
                                                  for i, p in enumerate(projects.PROJECTS)]}
        if SITE:
            page['@id'] = abs_url('work') + '#collection'
    if ctx.page == 'project':
        import projects
        p = next((x for x in projects.CASES if x['route'] == ctx.route), None)
        if p:
            cw = _work(p, org_ref)
            cw['isPartOf'] = {'@id': abs_url('work') + '#collection'} if SITE else {'@type': 'CollectionPage', 'name': 'The Work'}
            if p.get('tagline'):
                cw['alternativeHeadline'] = p['tagline']
            page['mainEntity'] = cw
    if extra:
        page.update(extra)
    graph.append(page)
    if ctx.page in ('who', 'home'):
        graph.append(_person(org_ref))
    if SITE and ctx.route:
        crumbs = [('Home', '')]
        parts = ctx.route.split('/')
        if parts[0] == 'projects':
            crumbs.append(('The Work', 'work'))
        crumbs.append((full_title.split(' | ')[0].split(' — ')[0], ctx.route))
        graph.append({'@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': abs_url(r)} for i, (n, r) in enumerate(crumbs)]})
    return graph


def _work(p, org_ref):
    """CreativeWork node for a portfolio project (facts from scripts/portfolio.json + the capture report).
    sameAs = the live site, for client websites only."""
    import projects
    cw = {'@type': 'CreativeWork', 'name': p['title'], 'genre': p['industry'], 'dateCreated': p['year'],
          'creator': org_ref, 'description': projects.label_text(p)}
    if SITE:
        cw['url'] = abs_url(p['route'])
    if p['group'] == 'client' and p.get('url'):
        cw['sameAs'] = p['url']
    return cw


def jsonld(graph):
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':'))
    return '<script type="application/ld+json">' + data.replace('</', '<\\/') + '</script>'


def llms_txt():
    """GEO: a plain-language summary for AI search/answer engines (llmstxt.org convention)."""
    link = lambda route, label: f'[{label}]({abs_url(route) or (route + "/index.html" if route else "index.html")})'
    lines = [f'# {NAME}', '',
             f'> {fmt(C.WHO["hero"]["body"][0])} {C.HOME["hero"]["lead"]}', '',
             C.HOME['hero']['body'], '',
             '## What we create', '']
    for s in C.CREATE['services']:
        lines.append(f"- {s['name']}: {s['title']} {s.get('body', '')} ({', '.join(s['tags'])})".replace('  ', ' '))
    lines += ['', '## How we work', '']
    for s in C.APPROACH['steps']:
        lines.append(f"{int(s['n'])}. {s['name']} — {s['sub']} {s.get('body', '')}".rstrip())
    f = C.WHO['founder']
    lines += ['', '## What we believe', '', C.HOME['believe']['title'], *C.HOME['believe']['body']]
    lines += ['', '## The founder', '', f"{f['name']} — {' · '.join(f['roles'])}.", f['body'][0]]
    lines += ['', '## Frequently asked questions', '']
    for q, a in C.FAQ:
        lines += [f'- **{q}** {a}']
    import projects
    for key, items in (('client', projects.CLIENTS), ('concept', projects.CONCEPTS)):
        if not items:
            continue
        lines += ['', f"## {projects.GROUPS[key]}", '']
        if key == 'concept':             # the Work page's concepts intro (one shared line)
            lines += [projects.concept_intro(items), '']
        for p in items:
            bits = [p['industry'], p['year']]
            if p.get('label'):
                bits.append(projects.label_text(p))
            row = f"- {link(p['route'], p['title'])}: {'; '.join(bits)}."
            if p.get('tagline'):
                row += f" Tagline: {_quoted(p['tagline'])}"
            if p.get('url'):
                row += f" Live site: {p['url']}"
            lines.append(row)
    lines += ['', '## Pages', '',
              f"- {link('', 'Home')}: {C.HOME['hero']['title']}",
              f"- {link('who-we-are', 'Who we are')}: {C.WHO['hero']['title']}",
              f"- {link('what-we-create', 'What we create')}: {C.CREATE['hero']['title']}",
              f"- {link('our-approach', 'Our approach')}: {C.APPROACH['hero']['title']}",
              f"- {link('work', 'The work')}: {C.WORK['hero']['body']}",
              f"- {link('client-stories', 'Client stories')}: {C.STORIES['experience']['title']}",
              f"- {link('contact', 'Contact')}: {C.CONTACT['hero']['title']}", '']
    return fmt('\n'.join(lines))


def sitemap(routes):
    if not SITE:
        return None
    urls = ''.join(f'<url><loc>{E(abs_url(r))}</loc></url>' for r in routes)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">{urls}</urlset>\n'
