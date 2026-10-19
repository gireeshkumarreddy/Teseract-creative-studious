"""SEO + GEO layer: page titles/descriptions, robots directives, share images, JSON-LD structured data, llms.txt and
sitemap.

Every sentence is taken from (or condensed from) the content master document, the owner's answers or the capture
reports (the project summaries in scripts/portfolio.json) - no invented claims, addresses, phone numbers, numbers or
reviews. Absolute URLs (canonical, og:url / og:image, sitemap, robots Sitemap line, schema @id/url, llms.txt links) are
only emitted when site.config.json has a "site_url"; until then the markup stays valid without them. Launch = set
site_url + indexable (owner's SEO request, 18 Oct; lib.config_problems() refuses indexable without site_url).
docs/SEO.md describes the whole layer and the keyword map.
"""
import json
import lib
from lib import CONFIG, BRAND, E, fmt
import content as C

SITE = (CONFIG.get('site_url') or '').rstrip('/')
NAME = CONFIG['brand_full']
TAIL = f' | {BRAND}'                       # short suffix keeps titles under ~60 chars
# Other names the studio is known by (site.config.json alternate_names; owner's SEO request, 18 Oct): the short brand.
# The owner may add the content document's double-S spelling once he signs it off; never case-only variants.
ALT_NAMES = [n for n in (CONFIG.get('alternate_names') or [BRAND]) if n and n != NAME]
# Robots directives of an indexable page (launch builds only): large image previews for a visual portfolio.
ROBOTS_OPEN = 'max-image-preview:large, max-snippet:-1, max-video-preview:-1'

# Search titles (at most ~60 chars incl. brand) and descriptions (~70-155 chars), per page key. One primary page per
# term (owner's SEO request, 18 Oct; docs/SEO.md keyword map): brand, studio and India terms on home, service terms on
# What We Create, portfolio on The Work, process on Our Approach; Client Stories never says "reviews" while the
# testimonials are samples.
META = {
    'home': (f'{NAME} | Website Design & Development',
             f'{NAME} designs and builds interactive, tailor-made websites and digital experiences for businesses '
             'across India and worldwide.'),
    'who': (f'Who We Are — About {NAME}',
            f'{BRAND} is a digital creative studio focused on design, technology and experiences, working with '
            'businesses, founders and teams that want to be different.'),
    'create': ('Web Design, Development & E-commerce Services' + TAIL,
               'Website design & UI/UX, development, landing pages, e-commerce, interactive & 3D, brand identity, '
               'product & SaaS, AI & automation and digital strategy.'),
    'approach': ('Our Approach — Website Design Process' + TAIL,
                 'Our website process in nine steps: understand, define, explore, design, refine, build, test, launch and '
                 'evolve. Great work doesn’t happen in one step.'),
    'work': ('The Work — Website Design Portfolio' + TAIL,
             'Our portfolio of client websites, e-commerce stores and self-initiated concepts, including SaaS landing '
             f'pages, by {NAME}.'),
    'stories': (f'Client Stories | {NAME}',
                'We believe the best measure of our work is what our clients think after working with us. Good work starts '
                'with good collaboration.'),
    'contact': ('Contact — Start a Website Project' + TAIL,
                'Have an idea, a new business or a website that needs a complete rethink? Tell us what you have in mind — '
                'you don’t need a perfect brief.'),
    'legal-privacy': (f'Privacy Policy | {NAME}',
                      f'How the {NAME} website handles your information: no analytics, no cookies and no trackers.'),
    'legal-terms': (f'Terms of Service | {NAME}',
                    f'Terms of service for the {NAME} website are coming soon. Questions in the meantime? Get in '
                    'touch by email or through the contact page.'),
    'notfound': ('Page Not Found' + TAIL, f'This page doesn’t exist. Head back to the {NAME} home page, explore our work or start a project with us.'),
}

PAGE_TYPE = {'who': 'AboutPage', 'contact': 'ContactPage', 'work': 'CollectionPage', 'create': 'WebPage',
             'approach': 'WebPage', 'stories': 'WebPage', 'home': 'WebPage', 'project': 'WebPage'}


def _key(ctx):
    if ctx.page == 'legal':
        return 'legal-' + ctx.route
    return ctx.page


def _project(ctx):
    """The shown project of a project page, or None."""
    if ctx.page != 'project':
        return None
    import projects
    return next((x for x in projects.CASES if x['route'] == ctx.route), None)


TITLE_MAX, DESC_MAX = 56, 155        # project pages: search-result limits (titles incl. the brand suffix)


def _quoted(text):
    """A verbatim tagline in curly quotes, closed with a full stop when it has no end punctuation of its own; quotes
    inside it become single quotes (I turn ‘what if’ into ...), so the quotation never nests double quotes."""
    t = text.strip().replace('“', '‘').replace('”', '’')
    return f"“{t}”" + ('' if t[-1:] in '.!?…' else '.')


def _first_fit(options, limit):
    return next((o for o in options if len(o) <= limit), options[-1][:limit].rstrip())


# Project search descriptions (repair round, 19 Oct; drafted from each portfolio.json summary for the owner's review):
# the summary's facts + who made it ("by TESERACT" / "TESERACT's founder") within DESC_MAX, so a client case study never
# reads as the client's own page and a concept never as a real business; every status the site states is kept
# (simulated / demo / not connected / not affiliated / design concept). A project without a line here falls back to the
# summary + label forms in project_meta.
PROJECT_DESC = {
    'aivinci': 'A single-page website by TESERACT for Aivinci Creative Studio, an AI creative and technology studio: AI films, creative technology and digital products.',
    'geetha-jewellers': 'A one-page website by TESERACT for Geetha Jewellers, a gold and diamond jewellery shop: collections, a store-visit section and gold savings schemes.',
    'aeroskys': 'A travel booking website by TESERACT for AeroSkys: flights, hotels, holiday packages and buses; a working prototype in which bookings are simulated.',
    'derlin-haus': 'An online menswear shop by TESERACT for Derlin Haus: shirts, T-shirts and trousers, with search and filters, size selection and a bag with coupons.',
    'mahira-select': "An online store by TESERACT for Mahira Select's Indian ethnic womenswear, from sarees and kurta sets to lehengas, with a cart and checkout.",
    'san-media': 'A website by TESERACT for SAN Media Solution, a digital marketing agency: its services, packages and team, and a work page of reels, films and posters.',
    'siaara': 'An online saree boutique by TESERACT for SIAARA By S&A: handcrafted sarees by weave and colour, a wishlist, a bag and an English and Telugu switch.',
    'vynk': 'A travel eSIM store by TESERACT for Vynk Network, with plans by destination; in this preview build, accounts, codes and payments are simulated.',
    'livecv': 'A resume-builder website by TESERACT for LiveCV: one permanent live link per resume, shown with example profiles the site labels illustrative.',
    'hidden-stories': 'A website by TESERACT for Hidden Stories, eight short-stay homes in Hyderabad: a scroll-driven home-tour story, then search and booking in demo mode.',
    'aeroskys-careers': 'A careers site by TESERACT for Aeroskys: open roles in three groups, each with its own page, career ladder, hiring process and application.',
    'sagewell': 'A concept landing page by TESERACT for Sagewell, an invented AI reasoning model for developers and teams, with a prompt composer and a reasoning demo.',
    'vantline': 'A concept landing page by TESERACT for Vantline, an invented decision-intelligence copilot that explains what changed in your numbers, with sample data.',
    'tidings': 'A concept landing page by TESERACT for Tidings, an invented chat-commerce platform for small shops; not affiliated with WhatsApp or Meta.',
    'emberpost': 'A concept landing page by TESERACT for Emberpost, an invented people-first email app that files every email under its sender, with a sample inbox.',
    'ines-morrow': 'A portfolio concept by TESERACT for Ines Morrow, a fictional film and commercial editor, with a scrubbable reel timeline and a colour-grade slider.',
    'maren-holt': 'A concept landing page by TESERACT for Maren Holt, a fictional developmental editor with a weekly newsletter: sample essays, a reader and search.',
    'one-piece': 'A fan tribute to Monkey D. Luffy by TESERACT in cinematic, scroll-driven chapters, never sold; unofficial, not affiliated with the rights holders.',
    'tavra': "A concept store by TESERACT for TĀVRA, a women's sportswear concept built on Indian textile crafts; checkout and payment are not connected.",
    'velora': 'A concept website by TESERACT for VELORA, a fragrance-house concept, around its signature eau de parfum and an interactive bottle; ordering is not open.',
    'aaradhya': 'An editorial concept website by TESERACT for AARADHYA, a saree-house concept themed around Maa Durga: a love letter to the saree and to heritage.',
    'saanjh': 'A concept website by TESERACT for SAANJH, a drinks-brand concept of bottled Indian-flavoured blends: Kesar Cloud, Elaichi Silk and Gulab Velvet.',
    'vyrn': 'A fashion storefront concept by TESERACT for VYRN, a concept label of modern essentials: editorial sections, a collection, product pages; payments are off.',
    'vesper': 'A concept storefront by TESERACT for Vesper, an architectural-lighting brand concept: a shop, four collections and a day/night mode; no real orders.',
    'gireesh-portfolio': "A one-page personal site for Gireesh, TESERACT's founder: a portrait hero, an about statement, the kinds of work he offers to build and a meeting request.",
    'thenga': 'A one-page brand-concept website by TESERACT for THENGA, a coconut-water concept: a scroll-driven 3D coconut cracks open to reveal the can.',
    'gireesh-desk': "A six-page personal UI/UX portfolio for Gireesh, TESERACT's founder, styled as a designer's desk, with a work board and illustrative case studies.",
    'sedile': 'A concept 3D showroom and demo store by TESERACT for office chairs under the invented brand Sedile, with a Chair Finder and a demo checkout.',
    'gireesh-cinematic': "A cinematic personal portfolio for Gireesh, TESERACT's founder, built from WebGL and video scenes: a walk-out opening and a journey through time.",
}
# Client titles whose industry is too long for '<industry> website' (owner's keyword map: '<industry> website').
TITLE_INDUSTRY = {'aivinci': 'AI studio', 'san-media': 'Marketing agency', 'hidden-stories': 'Short-stay homes'}
CLIENT_TITLE_MAX = 60                # the client '<name> — <industry> website | TESERACT' form (plan C05: 60)


def _curly(text):
    """Apostrophes as the page prints them (lib.fmt on the visible summary)."""
    return text.replace("'", '’')


# The project's label (projects.py, owner 14 Oct) as a sentence opening for meta descriptions.
_LABEL_LEAD = {'Client Project': 'Client project', 'Interactive Concept': 'An interactive concept',
               'Concept Project': 'A self-initiated concept project', 'Personal project': 'A personal project'}


def project_meta(p):
    """(title, description) for a project page: facts only - name, industry, the project's summary (portfolio.json
    "summary", drafted from its capture report), the site's own tagline, its label (client project / interactive
    concept + its "unofficial" line / concept project / personal project) and, for client work, the services.
    Owner's SEO request, 18 Oct: a client case study targets '<industry> website' (not the client's own brand name);
    the description leads with the summary + label line when it fits, else the earlier forms. A concept's
    not-affiliated line (Tidings, ONE PIECE) is in every form."""
    # a name that already has a dash of its own ("Gireesh — a designer's working desk") never gets a second "— Website"
    own = []
    if p['group'] == 'client' and 'website' not in p['industry'].lower():
        forms = (f"{p['title']} — {i} website{TAIL}" for i in dict.fromkeys([p['industry'], TITLE_INDUSTRY.get(p.get('slug'), p['industry'])]))
        own = [t for t in forms if len(t) <= CLIENT_TITLE_MAX]
    title = own[0] if own else _first_fit([f"{p['title']} — {p['industry']}{TAIL}"]
                                          + ([] if ' — ' in p['title'] else [f"{p['title']} — Website{TAIL}"])
                                          + [f"{p['title']}{TAIL}"], TITLE_MAX)
    mine = PROJECT_DESC.get(p.get('slug'))
    if mine and len(mine) <= DESC_MAX:
        return title, _curly(mine)
    quote = _quoted(p['tagline']) + ' ' if p.get('tagline') else ''
    lead = _LABEL_LEAD.get(p.get('label'), 'A project')
    if p['group'] == 'client':
        what = f"{lead} by {NAME} ({', '.join(p['services_list'])})."
        tails = [what, f'{lead} by {NAME}.', f'By {NAME}.']
    else:
        note = f"; {p['note'][0].lower()}{p['note'][1:]}" if p.get('note') else ''
        what = f"{lead} by {NAME}{note}."
        tails = [what, f'By {NAME}{note}.']
    summary = (p.get('summary') or '').strip()
    lead_opts = [f'{summary} {t}'.strip() for t in tails] if summary else []
    head = f"{p['title']} ({p['industry']}): "
    return title, _curly(_first_fit(lead_opts + [head + quote + what, head + what, f"{p['title']}: {what}"], DESC_MAX))


def meta(ctx, title, description):
    """(full <title>, meta description) for this page."""
    if ctx.page == 'project':
        p = _project(ctx)
        if p:
            return project_meta(p)
        return f'{title} — Project{TAIL}', description
    t, d = META.get(_key(ctx), (None, None))
    if t:
        return fmt(t), fmt(d)
    return (f'{title}{TAIL}' if title else NAME), description


def robots(ctx):
    """<meta name="robots"> content. While site.config.json indexable is false: noindex,nofollow everywhere (with
    robots.txt Disallow). At launch: noindex on the not-found page and on /terms/ while it is the 'Coming soon'
    placeholder (pages/legal.TERMS_PLACEHOLDER), large previews on every other page (owner's SEO request, 18 Oct)."""
    if not CONFIG.get('indexable'):
        return 'noindex,nofollow'
    from pages import legal
    if ctx.page == 'notfound' or (ctx.page == 'legal' and ctx.route == 'terms' and legal.TERMS_PLACEHOLDER):
        return 'noindex'
    return ROBOTS_OPEN


def abs_url(route=''):
    if not SITE:
        return None
    return f'{SITE}/{route.strip("/") + "/" if route.strip("/") else ""}'


def still_variant(still, width=1280):
    """The prepared variant of a still at `width` (else the largest below it, else the smallest): a project's share
    image, its CreativeWork image and its sitemap images (prepare_media.py writes 480-2560 WebP copies)."""
    vs = sorted(still['entry']['variants'], key=lambda v: v['width'])
    vs = [v for v in vs if not v.get('thumb')] or vs
    return next((v for v in vs if v['width'] == width), None) or ([v for v in vs if v['width'] <= width] or vs)[-1]


def _abs_asset(file):
    """Absolute URL of a published file (launch builds); the file is copied into the build."""
    lib.USED.add(file)
    return f'{SITE}/{file}'


def og_image(ctx):
    """(og:image URL, width, height, alt) for a page: a project page shares its Work-card still (the 1280 copy), every
    other page the logo card (owner's SEO request, 18 Oct). Relative until site_url is set, absolute after."""
    p = _project(ctx)
    if p:
        st = p['scene_still']
        v = still_variant(st)
        src = ctx.asset(v['file'])
        # a short alt (name, industry, label), the long still description stays on the page's <img>
        import projects
        alt = f"{p['title']} — {p['industry']} website ({projects.label_text(p)})"
        return (_abs_asset(v['file']) if SITE else src), v['width'], v['height'], alt
    src = ctx.asset('assets/brand/og-image.jpg')
    return (_abs_asset('assets/brand/og-image.jpg') if SITE else src), 1200, 630, f'{NAME} logo'


def area_served():
    """site.config.json area_served (owner's answer, 18 Oct: remote, across India and worldwide - no city, no address):
    a country as a schema.org Country, 'Worldwide' as text."""
    return [a if a.strip().lower() == 'worldwide' else {'@type': 'Country', 'name': a}
            for a in (CONFIG.get('area_served') or []) if a and a.strip()]


def _knows():
    """The service names, then every distinct service tag (content.CREATE): what the studio knows about."""
    out = [s['name'] for s in C.CREATE['services']]
    seen = {t.lower() for t in out}
    for s in C.CREATE['services']:
        for t in s['tags']:
            if t.lower() not in seen:
                seen.add(t.lower())
                out.append(t)
    return out


# Organization logo for knowledge panels: the square mark on white (public/assets/brand/logo-512.png, drawn from
# logo-mark.svg like the 180 px touch icon by python scripts/prepare_assets.py --logo), else the touch icon.
LOGO = ('assets/brand/logo-512.png', 512) if lib.longpath(lib.PUBLIC / 'assets/brand/logo-512.png').exists() \
    else ('assets/brand/apple-touch-icon-180.png', 180)


def _org():
    founder = C.WHO['founder']['name']
    org = {
        '@type': 'Organization',
        'name': NAME,
        'alternateName': ALT_NAMES,
        'slogan': CONFIG.get('tagline'),
        # opens with the full name (WHO hero line 1 with the full brand) + the HOME hero lead
        'description': C.WHO['hero']['body'][0].replace('{brand}', NAME, 1) + ' ' + C.HOME['hero']['lead'],
        'disambiguatingDescription': f'{NAME} (spelled with one S) is a website design and development studio '
                                     f'founded by {founder}.',
        'knowsAbout': _knows(),
    }
    area = area_served()
    if area:
        org['areaServed'] = area
    if SITE:
        org['@id'] = SITE + '/#organization'
        org['url'] = SITE + '/'
        org['logo'] = {'@type': 'ImageObject', 'url': _abs_asset(LOGO[0]), 'width': LOGO[1], 'height': LOGO[1]}
        org['image'] = _abs_asset('assets/brand/og-image.jpg')
    email = CONFIG.get('email') if CONFIG.get('email') and not CONFIG.get('email_is_placeholder') else ''
    if email:
        org['email'] = email
    # how to reach the studio - no telephone, address or geo (owner's answer, 18 Oct: remote, nothing invented)
    contact = {'@type': 'ContactPoint', 'contactType': 'new projects', 'availableLanguage': 'English'}
    if email:
        contact['email'] = email
    if SITE:
        contact['url'] = abs_url('contact')
    if area:
        contact['areaServed'] = area
    org['contactPoint'] = contact
    # the studio's own company profiles (site.config.json org_profiles) once they exist; until then the founder's
    # profiles stand in (stop-gap, owner action: company pages under the exact full name)
    same = [u for u in CONFIG.get('org_profiles') or [] if u] or [u for u in (CONFIG.get('socials') or {}).values() if u]
    if same:
        org['sameAs'] = same
    # the founder (owner, 15 Oct): a reference to the Person node on the who / home pages, named for the pages without it
    # (typed, named and with its url, so the reference stands alone on the pages without the Person node)
    org['founder'] = ({'@type': 'Person', '@id': SITE + '/who-we-are/#founder', 'name': founder,
                       'url': abs_url('who-we-are') + '#founder'} if SITE else {'@type': 'Person', 'name': founder})
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
    """The eight services as an OfferCatalog: each with all its tags as serviceType, its anchor on What We Create
    (sections/service_cards.slug, the ids that page carries) and the area served."""
    from sections.service_cards import slug
    area = area_served()
    items = []
    for s in C.CREATE['services']:
        svc = {
            '@type': 'Service',
            'name': s['name'],
            'description': ' '.join(x for x in [s['title'], s.get('body', '')] if x).strip(),
            'serviceType': list(s['tags']),
            'provider': {'@id': SITE + '/#organization'} if SITE else {'@type': 'Organization', 'name': NAME},
        }
        if SITE:
            svc['url'] = abs_url('what-we-create') + '#' + slug(s['name'])
        if area:
            svc['areaServed'] = area
        items.append({'@type': 'Offer', 'itemOffered': svc})
    return {'@type': 'OfferCatalog', 'name': 'What we create', 'itemListElement': items}


def _crumb_names():
    """Breadcrumb names by route: the menu's own labels (content.NAV) and the legal pages' titles."""
    names = {route: label for _key, label, route in C.NAV}
    names.update({'privacy': 'Privacy Policy', 'terms': 'Terms of Service'})
    return names


def schema(ctx, full_title, description, extra=None):
    """JSON-LD graph for a page (list of nodes): Organization + WebSite on every page, the page itself (with its
    breadcrumb), the home FAQ / offer catalogue, the founder on home + Who We Are, the projects on The Work and their
    own pages. Never Review / AggregateRating (the Client Stories testimonials are samples; check.py)."""
    graph = []
    org = _org()
    graph.append(org)
    org_ref = {'@id': org['@id']} if SITE else {'@type': 'Organization', 'name': NAME}
    # the WebSite node on every page, so every @id reference resolves on the page itself (no SearchAction: no search)
    site = {'@type': 'WebSite', 'name': NAME, 'alternateName': ALT_NAMES, 'inLanguage': 'en', 'publisher': org_ref}
    if SITE:
        site['@id'] = SITE + '/#website'
        site['url'] = SITE + '/'
    graph.append(site)
    if ctx.page == 'home':
        org['hasOfferCatalog'] = _services()
        graph.append({'@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': fmt(q), 'acceptedAnswer': {'@type': 'Answer', 'text': fmt(a)}} for q, a in C.FAQ]})
    page = {'@type': PAGE_TYPE.get(ctx.page, 'WebPage'), 'name': full_title, 'description': description,
            'inLanguage': 'en', 'about': org_ref}
    url = None if ctx.page == 'notfound' else abs_url(ctx.route)
    if SITE:
        page['isPartOf'] = {'@id': SITE + '/#website'}
    if url:
        page['@id'] = url + '#webpage'
        page['url'] = url
        if ctx.route:
            page['breadcrumb'] = {'@id': url + '#breadcrumb'}
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
            page['@id'] = abs_url('work') + '#collection'       # the project pages' CreativeWork isPartOf
    p = _project(ctx)
    if p:
        cw = _work(p, org_ref)
        cw['isPartOf'] = {'@type': 'CollectionPage', 'name': 'The Work'}   # self-describing: /work/ holds the node
        if SITE:
            cw['isPartOf'].update({'@id': abs_url('work') + '#collection', 'url': abs_url('work')})
        if p.get('tagline'):
            cw['alternativeHeadline'] = p['tagline']
        page['mainEntity'] = cw
    if extra:
        page.update(extra)
    graph.append(page)
    if ctx.page in ('who', 'home'):
        person = _person(org_ref)
        graph.append(person)
        if person.get('@id'):                  # defined here once: the Organization only points at it
            org['founder'] = {'@id': person['@id']}
    if url and ctx.route:
        names = _crumb_names()
        crumbs = [(names.get('', 'Home'), '')]
        if p:
            crumbs += [(names.get('work', 'The Work'), 'work'), (p['title'], p['route'])]
        else:
            crumbs.append((names.get(ctx.route) or full_title.split(' | ')[0].split(' — ')[0], ctx.route))
        graph.append({'@type': 'BreadcrumbList', '@id': url + '#breadcrumb', 'itemListElement': [
            {'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': abs_url(r)} for i, (n, r) in enumerate(crumbs)]})
    return graph


def work_description(p):
    """A project's CreativeWork description: its summary (portfolio.json, from the capture report) + its label, so a
    concept is never read as client work."""
    import projects
    label = projects.label_text(p)
    return f"{p['summary'].strip()} {label}." if (p.get('summary') or '').strip() else label


def _work(p, org_ref):
    """CreativeWork node for a portfolio project (facts from scripts/portfolio.json + the capture report).
    sameAs = the live site, for client websites only; image = its first gallery still (launch builds)."""
    cw = {'@type': 'CreativeWork', 'name': p['title'], 'genre': p['industry'], 'dateCreated': p['year'],
          'creator': org_ref, 'description': work_description(p)}
    if SITE:
        cw['url'] = abs_url(p['route'])
        cw['image'] = _abs_asset(still_variant(p['cover'])['file'])
    if p['group'] == 'client' and p.get('url'):
        cw['sameAs'] = p['url']
    return cw


def jsonld(graph):
    data = json.dumps({'@context': 'https://schema.org', '@graph': graph}, ensure_ascii=False, separators=(',', ':'))
    return '<script type="application/ld+json">' + data.replace('</', '<\\/') + '</script>'


def llms_txt():
    """GEO: a plain-language summary for AI search/answer engines (llmstxt.org convention): who the studio is, the
    key facts (name and its spelling, tagline, founder, where it works, contact, profiles), services, process, FAQ and
    every project with its summary. Never the sample reviews or the 'Our Numbers' figures."""
    def link(route, label, frag=''):
        url = abs_url(route) or (route + '/index.html' if route else 'index.html')
        return f"[{label}]({url}{'#' + frag if frag else ''})"
    f = C.WHO['founder']
    email = CONFIG.get('email') if CONFIG.get('email') and not CONFIG.get('email_is_placeholder') else ''
    profiles = [u for u in CONFIG.get('org_profiles') or [] if u]
    soc = CONFIG.get('socials') or {}
    if profiles:
        prof = '- Profiles: ' + ', '.join(profiles)
    else:                               # stop-gap until the studio has its own pages (owner action)
        names = {'instagram': 'Instagram', 'linkedin': 'LinkedIn', 'github': 'GitHub', 'behance': 'Behance'}
        own = [f'{names.get(k, k)} {u}' for k, u in soc.items() if u]
        # the profiles the footer links as the studio's (and Organization.sameAs), said plainly to be the founder's
        prof = ("- Profiles: " + ', '.join(own) + " (the founder's own, used by the studio until it has company pages)") if own else ''
    lead = C.WHO['hero']['body'][0].replace('{brand}', f'{NAME} ({BRAND})', 1)
    lines = [f'# {NAME}', '',
             f'> {lead} {C.HOME["hero"]["lead"]}', '',
             C.HOME['hero']['body'], '',
             '## Key facts', '',
             f"- Name: {NAME} ({BRAND}), spelled with one S. {C.BRAND['meaning']} "
             'Not affiliated with other companies or software named Tesseract.',
             f"- Tagline: {CONFIG.get('tagline') or C.BRAND['tagline']}",
             f"- Founder: {link('who-we-are', f['name'], 'founder')} — {' · '.join(f['roles'])}",
             f'- Where we work: {C.WHERE_WE_WORK}',
             f"- Contact: {(email + '; ') if email else ''}{link('contact', 'contact page')}"]
    if prof:
        lines.append(prof)
    lines += ['', '## What we create', '']
    for s in C.CREATE['services']:
        lines.append(f"- {s['name']}: {s['title']} {s.get('body', '')} ({', '.join(s['tags'])})".replace('  ', ' '))
    lines += ['', '## How we work', '']
    for s in C.APPROACH['steps']:
        lines.append(f"{int(s['n'])}. {s['name']} — {s['sub']} {s.get('body', '')}".rstrip())
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
            if (p.get('summary') or '').strip():
                row += f" {_curly(p['summary'].strip())}"
            if p.get('tagline'):
                row += f" Tagline: {_quoted(p['tagline'])}"
            if p.get('url'):
                row += f" Live site: {p['url']}"
            lines.append(row)
    # each page with its own search description (META: what the URL contains), not its slogan
    lines += ['', '## Pages', '']
    for key, route, label in (('home', '', 'Home'), ('who', 'who-we-are', 'Who we are'),
                              ('create', 'what-we-create', 'What we create'), ('approach', 'our-approach', 'Our approach'),
                              ('work', 'work', 'The work'), ('stories', 'client-stories', 'Client stories'),
                              ('contact', 'contact', 'Contact')):
        lines.append(f"- {link(route, label)}: {META[key][1]}")
    lines.append('')
    return fmt('\n'.join(lines))


SITEMAP_IMAGES = 5                     # stills listed per project page (image sitemap)


def sitemap(routes):
    """sitemap.xml for the indexable routes (build.py leaves out the 404 and placeholder terms), once site_url is set.
    Project pages list their first stills as image:image entries (Google Images: owner's SEO request, 18 Oct). No
    <lastmod>: only a real per-page date would help, and the build time is not one."""
    if not SITE:
        return None
    import projects
    by_route = {p['route']: p for p in projects.CASES}
    urls = []
    for r in routes:
        p = by_route.get(r)
        imgs = ''.join(f'<image:image><image:loc>{E(_abs_asset(still_variant(st)["file"]))}</image:loc></image:image>'
                       for st in (p['stills'][:SITEMAP_IMAGES] if p else []))
        urls.append(f'<url><loc>{E(abs_url(r))}</loc>{imgs}</url>')
    return ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
            f'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">{"".join(urls)}</urlset>\n')
