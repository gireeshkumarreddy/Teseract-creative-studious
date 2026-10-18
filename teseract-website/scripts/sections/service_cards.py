"""Shared service-card renderer (reference SERVICES rows, ref-services-testimonials §2).

Used by the home overview (sections/home_services.py) and the What We Create page
(pages/create.py). CSS: src/css/22-services.css (.svc-*). JS: src/js/22-services.js
(the reference "works" stack + Tap Here badge on the Website Design image card, §2.7).

Building blocks
  row(ctx, s, ...)        framed tray (r48, p16) = info card + image card ("large row")
  small_row(ctx, items)   framed tray holding up to three small cards (text + chips + artwork)
  folder(n)               47x48 folder icon whose papers pop out on hover (reference §2.6)
  chips(tags, ...)        reference tag chips with small stroke icons (drawn for this site)

Copy comes from content.CREATE; imagery (MEDIA) is the owner's own designs (scripts/supplied.json) and the studio's
own websites mapped by service. A large row with more than one image of an owner-curated set is the reference
"works" stack (What We Create page: E-commerce, Interactive & 3D); a small card shows the first two as front/back.
"""
import re
import lib
from lib import E, roll
import projects
from content import PRIMARY_CTA, NAV, HOME, CREATE

# ------------------------------------------------------------------ imagery per service
# Owner, 14 Oct (DARK-THEME.md 'Client update 8'), services 01-05 (and 06 since 17 Oct) - 'images': the card's images in
# order (front first):
#   {'supplied': name}   an owner-supplied image (scripts/supplied.json: the owner's own designs and sites, not
#                        portfolio projects): no project caption, the card links to The Work page
#   + 'slug'             ... of a site that IS a shown portfolio project (VYRN, owner 14-15 Oct): captioned with its
#                        name + label and linked to its page, like a captured still (on a small card it is the back
#                        print's own link, so clicking it opens that project, never the front print's)
#   {'slug', 'role'}     a captured still of a shown project (captioned with its name + label, linked to its page);
#                        a still the project skips (portfolio.json "skip", e.g. Mahira Select's) is never shown
#   'focal'              object-position for this card (default: the supplied image's / projects.focal)
#   'zoom'               (scale, origin) - a captured still drawn that much larger about that point (CSS scale, so
#                        the reveal and hover zooms still apply), for a screen whose own page margin would show as
#                        a light band along the card's edge (Vantline's and Sagewell's inset hero frames)
#   'small'              {'focal', 'zoom'} - this still's own framing as a small card's BACK print only (the front
#                        print, the row cards and the stack keep the above): the back print shows only the part the
#                        front print and its caption leave free, so a centred headline there reads as fragments
# and per service 'tap': 'low' - on phones the stack's Tap Here sticker sits low on the right, not in the top-right
# corner (for stills whose centred headline reaches that corner; 22-services.css .svc-media--tap-low)
# A small card shows the first two images (front / back); a large row shows the first, or - with more than one -
# all of them (at most three) as the "works" stack (What We Create page).
# Services 07-08 keep the earlier project mapping: 'slug' + 'roles' (captured stills, primary first); a mapped project
# that is not captured yet falls back to the first shown project of 'fallback', captioned with the portfolio section's
# name and linked to The Work page ('label': 'work' - the client's 13 Oct mechanism, kept for Digital Strategy).
# AI & Automation has no matching project: brand-mark card. 'focal': object-position per still for the row cards,
# without moving the same still elsewhere (projects.focal).
MEDIA = {
    # MODU and ed10: the owner's own website design / development concepts (whole monitor in view)
    '01': {'images': [{'supplied': 'website-design'}]},
    '02': {'images': [{'supplied': 'website-development'}]},
    # E-commerce = the owner's shops (derlin-haus, mahira-select, siaara, vyrn): a SIAARA saree still in front, the
    # owner's own VYRN categories frame behind it ("VYRN · Concept Project", linking to its page since VYRN became a
    # portfolio project, owner 14-15 Oct), and on the What We Create page's stack a Mahira Select saree still (its first
    # screen: allowed by its skip list)
    '03': {'images': [{'slug': 'siaara', 'role': 'gallery-01', 'focal': '30% 50%'},
                      {'supplied': 'ecommerce-vyrn-categories', 'slug': 'vyrn'},
                      {'slug': 'mahira-select', 'role': 'gallery-01', 'focal': '18% 50%'}]},
    # OBSCURA (front, whole design on its black page) and FaiPy (back, logo row cropped out): the owner's own designs
    '04': {'images': [{'supplied': 'interactive-3d-1-obscura'}, {'supplied': 'interactive-3d-2-faipy'}]},
    # Brand & Digital Identity = the owner's two brand concepts, each site's main hero screen (owner, 14 Oct): SAANJH
    # (Kesar Cloud bottle over 'SAVOUR') in front, VELORA ('The essence of subtle romance') behind it
    # Both are 16:9 heroes on ~4:3 cards: cropped from the left edge ('0% 50%'), so each hero headline stays whole
    # ('Good things. Slowly savoured.' / 'The essence of subtle romance') beside its bottle
    '05': {'images': [{'slug': 'saanjh', 'role': 'gallery-01', 'focal': '0% 50%'},
                      {'slug': 'velora', 'role': 'gallery-01', 'focal': '0% 50%'}]},
    # Product & SaaS = two of the owner's SaaS landing-page concepts (owner, 17 Oct: instead of LiveCV, which stays a
    # client project everywhere else), the two whose capture reports call them SaaS product landing pages: SAGEWELL (AI
    # reasoning model) in front, VANTLINE (decision-intelligence copilot) behind it, each site's hero. Both headlines are
    # centred on the 16:10 screen, so the cover crop of the ~4:3 cards keeps them whole ('The model that thinks before it
    # speaks.' / 'Know what changed and what to do about it.'); Vantline's is taken a little right of centre ('60% 50%'),
    # so the end of its wordmark at the screen's left edge is not left as a stray letter. On the home small card that
    # is true of the front print. 'tap': 'low' - on phones the What We Create stack's Tap Here sticker sits low on the
    # right, over the gardens / the field, instead of the top-right corner, where it covered the end of each headline
    # (22-services.css).
    # Vantline's hero frame sits inset on the site's white page (a 1.4% band above it, 6.3% below, read as a screenshot's
    # edge at the card's foot): drawn at 110% about '60% 20%' (18 Oct), neither band shows and its headline (x .32-.68 of
    # the screen, in a window of .15-.90) stays whole. Sagewell's frame is inset the same way (a cream margin, its last
    # 1.4% of the still, under the dark garden: a light strip at the card's foot, 18 Oct verifier): drawn at 103.5% about
    # '50% 20%', the window is y .007-.973 (the margin starts at .986) and x .10-.90, its headline (x .29-.71, y .23-.38)
    # whole.
    # Home small card (18 Oct verifier): behind the front print, Vantline's headline was cut to '...changed / ...about it.'
    # on desktop and by its own caption on tablets and phones; as the BACK print ('small') it shows the scene under the
    # headline instead - dusk sky, the glass pillar, the walker in the field - (the still's x .56-.92, y .48-.915: below
    # its 'Try Vantline free' button, above the white page margin), as on the Brand card. Drawn 2.3x larger there, so
    # _art asks for a larger file (_back_sizes).
    '06': {'images': [{'slug': 'sagewell', 'role': 'gallery-01', 'focal': '50% 50%', 'zoom': (1.035, '50% 20%')},
                      {'slug': 'vantline', 'role': 'gallery-01', 'focal': '60% 50%', 'zoom': (1.1, '60% 20%'),
                       'small': {'focal': '100% 50%', 'zoom': (2.3, '83.5% 85%')}}], 'tap': 'low'},
    '07': {'slug': None},
    # Digital Strategy: TAVRA's cursor-free stills (owner, 15 Oct: gallery-05 caught the site's ring cursor) - 'The Store'
    # (gallery-06) in front, the hero (gallery-01) behind; both checked at 100 %: no cursor ring, hover bubble or bag cursor
    '08': {'label': 'work', 'fallback': [('tavra', ['gallery-06', 'gallery-01']), ('saanjh', ['gallery-06', 'gallery-01'])]},
}
WORK_LABEL = next(label for key, label, _ in NAV if key == 'work')   # "The Work"

ROW_SIZES = '(min-width:1440px) 584px, (min-width:1200px) 46vw, (min-width:800px) calc(100vw - 128px), calc(100vw - 48px)'
ROW_AR = 1.32727         # the large row's image card (.svc-media aspect-ratio, 22-services.css)
ART_SIZES = '(min-width:1200px) 290px, (min-width:800px) 300px, 70vw'
BACK_W = (210, 50, 24)   # a small card's back print: min(50%, 210px) of the artwork (22-services.css), ~50vw - 24px on phones


def slug(name):
    return re.sub(r'[^a-z0-9]+', '-', name.lower().replace('&', ' ')).strip('-')


def _typo(text):
    return text.replace("'", '’')


# ------------------------------------------------------------------ chip icons (20x20 stroke)
_I = {
    'compass': '<circle cx="10" cy="10" r="7.75"/><path d="m12.9 7.1-1.6 4.2-4.2 1.6 1.6-4.2z"/>',
    'route': '<circle cx="5" cy="15" r="2"/><circle cx="15" cy="4.5" r="2"/><path d="M7 15h5.25a2.75 2.75 0 0 0 0-5.5h-4.5a2.5 2.5 0 0 1 0-5H13"/>',
    'wireframe': '<rect x="2.5" y="3" width="15" height="14" rx="3"/><path d="M2.5 7.5h15M8 7.5V17"/>',
    'layers': '<path d="m10 2.75 7.25 3.75L10 10.25 2.75 6.5z"/><path d="m2.75 10 7.25 3.75L17.25 10M2.75 13.5l7.25 3.75 7.25-3.75"/>',
    'devices': '<rect x="1.75" y="3.5" width="11.5" height="9" rx="2"/><path d="M5.25 16h4.5M7.5 12.5V16"/><rect x="14.75" y="7" width="3.75" height="9" rx="1.25"/>',
    'cursor': '<path d="M4.5 3.5 15.5 8l-4.75 1.75L9 14.5z"/><path d="m10.75 9.75 4.5 4.5"/>',
    'components': '<path d="m10 2.25 2.75 2.75L10 7.75 7.25 5zM5 7.25 7.75 10 5 12.75 2.25 10zM15 7.25 17.75 10 15 12.75 12.25 10zM10 12.25l2.75 2.75L10 17.75 7.25 15z"/>',
    'tap': '<path d="m8.5 8.5 8 3-3.5 1.5-1.5 3.5z"/><path d="M8.5 2.75V4.5M2.75 8.5H4.5M4.4 4.4l1.25 1.25M12.6 4.4l-1.25 1.25M4.4 12.6l1.25-1.25"/>',
    'briefcase': '<rect x="2.5" y="6" width="15" height="11" rx="2.5"/><path d="M7 6V4.75C7 3.78 7.78 3 8.75 3h2.5c.97 0 1.75.78 1.75 1.75V6M2.5 10.5h15"/>',
    'building': '<path d="M3.75 17.25V4.5c0-.83.67-1.5 1.5-1.5h5.5c.83 0 1.5.67 1.5 1.5v12.75M12.25 8h2.5c.83 0 1.5.67 1.5 1.5v7.75M2 17.25h16M6.5 6.5h2.5M6.5 9.5h2.5M6.5 12.5h2.5"/>',
    'page': '<rect x="3.5" y="2.5" width="13" height="15" rx="2.5"/><path d="M6.75 6.5h6.5M6.75 9.25h4"/><rect x="6.75" y="12" width="4.5" height="2.5" rx="1.25"/>',
    'database': '<ellipse cx="10" cy="5" rx="6.25" ry="2.5"/><path d="M3.75 5v10c0 1.38 2.8 2.5 6.25 2.5s6.25-1.12 6.25-2.5V5M3.75 10c0 1.38 2.8 2.5 6.25 2.5s6.25-1.12 6.25-2.5"/>',
    'browser': '<rect x="2" y="3.5" width="16" height="13" rx="2.5"/><path d="M2 7.5h16M4.75 5.5h.01M6.75 5.5h.01M5.5 10.75h5M5.5 13.25h3"/>',
    'tag': '<path d="M10.6 2.75h5.15c.83 0 1.5.67 1.5 1.5V9.4c0 .4-.16.78-.44 1.06l-6.3 6.3a1.5 1.5 0 0 1-2.12 0L3.24 11.6a1.5 1.5 0 0 1 0-2.12l6.3-6.3c.28-.28.66-.44 1.06-.44z"/><circle cx="13.75" cy="6.25" r="1.25"/>',
    'bag': '<path d="M4.25 6.75h11.5l-.85 9.15a1.75 1.75 0 0 1-1.74 1.6H6.84a1.75 1.75 0 0 1-1.74-1.6z"/><path d="M7.25 8.75V5.5a2.75 2.75 0 0 1 5.5 0v3.25"/>',
    'cart': '<path d="M2 3h2.1l1.95 9.4a1.5 1.5 0 0 0 1.47 1.2h7.1a1.5 1.5 0 0 0 1.46-1.15L17.5 6.5H5"/><circle cx="7.75" cy="16.75" r="1.25"/><circle cx="14.25" cy="16.75" r="1.25"/>',
    'card': '<rect x="2" y="4.5" width="16" height="11" rx="2.5"/><path d="M2 8.5h16M5 12.25h3"/>',
    'clipboard': '<path d="M7.25 3.5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-10a2 2 0 0 0-2-2h-1.25"/><rect x="7.25" y="2" width="5.5" height="3" rx="1"/><path d="m7 10.25 1.5 1.5 3.5-3.5M7 14.5h6"/>',
    'phone': '<rect x="5" y="2" width="10" height="16" rx="2.5"/><path d="M8.5 15h3"/>',
    'scroll': '<rect x="5.25" y="2.25" width="9.5" height="15.5" rx="4.75"/><path d="M10 5.75v2.5"/>',
    'story': '<path d="M10 5.25C8.5 3.9 6.25 3.4 2.75 3.6v11c3.5-.2 5.75.3 7.25 1.65 1.5-1.35 3.75-1.85 7.25-1.65v-11c-3.5-.2-5.75.3-7.25 1.65zM10 5.25v11"/>',
    'toggle': '<rect x="2" y="5.5" width="16" height="9" rx="4.5"/><circle cx="13.5" cy="10" r="2.25"/>',
    'film': '<rect x="2.5" y="3" width="15" height="14" rx="2.5"/><path d="M6.5 3v14M13.5 3v14M2.5 7.5h4M2.5 12.5h4M13.5 7.5h4M13.5 12.5h4"/>',
    'cube': '<path d="M10 2.5 16.5 6.25v7.5L10 17.5l-6.5-3.75v-7.5z"/><path d="M3.5 6.25 10 10l6.5-3.75M10 10v7.5"/>',
    'type': '<path d="M4 5.25V3.5h12v1.75M10 3.5v13M7.5 16.5h5"/>',
    'drop': '<path d="M10 2.5c-3 3.6-5 6.35-5 9a5 5 0 0 0 10 0c0-2.65-2-5.4-5-9z"/><path d="M7.75 11.75A2.25 2.25 0 0 0 10 14"/>',
    'eye': '<path d="M1.75 10C3.6 6.2 6.5 4.5 10 4.5s6.4 1.7 8.25 5.5c-1.85 3.8-4.75 5.5-8.25 5.5S3.6 13.8 1.75 10z"/><circle cx="10" cy="10" r="2.75"/>',
    'id': '<rect x="2" y="4" width="16" height="12" rx="2.5"/><circle cx="7" cy="9" r="1.75"/><path d="M4.5 13.25c.4-1.3 1.4-2 2.5-2s2.1.7 2.5 2M12 8.5h3.5M12 11.5h2.5"/>',
    'book': '<path d="M4.25 15.5V4.25C4.25 3 5.25 2 6.5 2h9.25v11.25H6.5a2.25 2.25 0 0 0 0 4.5h9.25"/><path d="M8 6h4.25"/>',
    'gauge': '<path d="M3.25 14.5a6.75 6.75 0 1 1 13.5 0"/><path d="m10 14.5 3-3.75M3.25 17.25h13.5"/>',
    'bars': '<path d="M4 16.5V11M8 16.5V7M12 16.5v-6M16 16.5V4"/>',
    'cloud': '<path d="M6 15.5a3.75 3.75 0 0 1-.55-7.46A5 5 0 0 1 15 7.6a3.95 3.95 0 0 1-.25 7.9z"/>',
    'flow': '<rect x="2.5" y="2.5" width="5.5" height="5.5" rx="1.5"/><rect x="12" y="12" width="5.5" height="5.5" rx="1.5"/><path d="M8 5.25h3.25a3.5 3.5 0 0 1 3.5 3.5V12M13 10.25 14.75 12l1.75-1.75"/>',
    'loop': '<path d="M16.25 8A6.5 6.5 0 0 0 4.1 6.5M3.75 12a6.5 6.5 0 0 0 12.15 1.5"/><path d="M16.5 3.5V8H12M3.5 16.5V12H8"/>',
    'chat': '<path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v6a2.5 2.5 0 0 1-2.5 2.5H9.5L6 17v-3h-.5A2.5 2.5 0 0 1 3 11.5z"/><path d="M10 5.75c.3 1.5.85 2.05 2.25 2.25-1.4.2-1.95.75-2.25 2.25-.3-1.5-.85-2.05-2.25-2.25 1.4-.2 1.95-.75 2.25-2.25z"/>',
    'spark': '<path d="M9 2.5c.6 3.6 1.9 4.9 5.5 5.5-3.6.6-4.9 1.9-5.5 5.5-.6-3.6-1.9-4.9-5.5-5.5 3.6-.6 4.9-1.9 5.5-5.5z"/><path d="M15 12.5c.25 1.35.75 1.85 2.25 2.25-1.5.4-2 .9-2.25 2.25-.25-1.35-.75-1.85-2.25-2.25 1.5-.4 2-.9 2.25-2.25z"/>',
    'wrench': '<path d="M12.75 2.9a4.25 4.25 0 0 0-5.1 5.6l-4.6 4.6a1.95 1.95 0 0 0 2.75 2.75l4.6-4.6a4.25 4.25 0 0 0 5.6-5.1l-2.6 2.6-2.25-.5-.5-2.25z"/>',
    'code': '<path d="M6.5 6 2.5 10l4 4M13.5 6l4 4-4 4M11.25 4l-2.5 12"/>',
    'target': '<circle cx="10" cy="10" r="7.5"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r=".6"/>',
    'map': '<path d="m2.5 5 5-2 5 2 5-2v12l-5 2-5-2-5 2z"/><path d="M7.5 3v12M12.5 5v12"/>',
    'search': '<circle cx="9" cy="9" r="5.75"/><path d="m13.25 13.25 4.25 4.25"/>',
    'scale': '<path d="M10 3v14M6.5 17h7M4 6.25h12"/><path d="M4 6.25 1.75 11a2.25 2.25 0 0 0 4.5 0zM16 6.25 13.75 11a2.25 2.25 0 0 0 4.5 0z"/>',
    'structure': '<rect x="7.5" y="2.5" width="5" height="4" rx="1.2"/><rect x="2.5" y="13.5" width="5" height="4" rx="1.2"/><rect x="12.5" y="13.5" width="5" height="4" rx="1.2"/><path d="M10 6.5V10.5M5 13.5V12c0-.83.67-1.5 1.5-1.5h7c.83 0 1.5.67 1.5 1.5v1.5"/>',
    'trend': '<path d="m2.5 14.5 5-5 3.5 3.5 6.5-6.5M12.5 6.5h5v5"/>',
    'dot': '<circle cx="10" cy="10" r="3"/>',
}

TAG_ICON = {
    'UX Strategy': 'compass', 'User Journeys': 'route', 'Wireframes': 'wireframe', 'UI Design': 'layers',
    'Responsive Design': 'devices', 'Prototyping': 'cursor', 'Design Systems': 'components', 'Interaction Design': 'tap',
    'Business Websites': 'briefcase', 'Corporate Websites': 'building', 'Landing Pages': 'page', 'CMS Websites': 'database',
    'Interactive Websites': 'tap', 'Web Applications': 'browser',
    'Product Pages': 'tag', 'Shopping Experiences': 'bag', 'Cart & Checkout': 'cart', 'Payment Integration': 'card',
    'Order Management': 'clipboard', 'CMS': 'database', 'Mobile Experiences': 'phone',
    'Scroll animations': 'scroll', 'Interactive storytelling': 'story', 'Product interactions': 'cube',
    'Micro-interactions': 'toggle', 'Cinematic experiences': 'film', '3D environments': 'cube',
    'Typography': 'type', 'Colour Systems': 'drop', 'Visual Direction': 'eye', 'Digital Identity': 'id', 'Brand Guidelines': 'book',
    'Dashboards': 'gauge', 'SaaS Platforms': 'cloud', 'Mobile Interfaces': 'phone', 'User Flows': 'flow', 'Prototypes': 'cursor',
    'AI Experiences': 'spark', 'Workflow Automation': 'loop', 'AI Interfaces': 'chat', 'Internal Tools': 'wrench',
    'Intelligent Dashboards': 'bars', 'API Integrations': 'code',
    'Digital Positioning': 'target', 'Website Strategy': 'map', 'User Research': 'search', 'Competitor Analysis': 'scale',
    'Content Structure': 'structure', 'Conversion Strategy': 'trend',
}
# 'Product interactions' reads better as a pointer than a second cube.
TAG_ICON['Product interactions'] = 'tap'


def chip_icon(tag):
    return f'<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">{_I[TAG_ICON.get(tag, "dot")]}</svg>'


def chips(tags, cls='', *, limit=None, more_href=None, name=''):
    """Tag chips. With limit, only the first tags are shown plus a '+N' chip that links to the
    full list (more_href) — used by the compact home cards."""
    shown = tags[:limit] if limit else tags
    items = ''.join(f'<li class="svc-chip">{chip_icon(t)}<span>{E(t)}</span></li>' for t in shown)
    rest = len(tags) - len(shown)
    if rest > 0 and more_href:
        label = f'{name}: see all {len(tags)} on the What We Create page'
        items += (f'<li><a class="svc-chip svc-chip--more" href="{E(more_href)}" aria-label="{E(label)}">'
                  f'<span aria-hidden="true">+{rest}</span>{lib.ICONS["arrow-ne"]}</a></li>')
    return f'<ul class="svc-chips{(" " + cls) if cls else ""}" role="list">{items}</ul>'


# ------------------------------------------------------------------ folder icon (reference §2.6)
_FOLDER_IDS = {}


def _folder_back(n):
    # gradient ids must be unique per document: number them per service and per use
    k = _FOLDER_IDS[n] = _FOLDER_IDS.get(n, 0) + 1
    gid = f'svcFolder{n}x{k}'
    return ('<svg class="svc-folder__back" viewBox="0 0 47 48" aria-hidden="true" focusable="false">'
            f'<defs><linearGradient id="{gid}" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0" stop-color="#5b5f64"/><stop offset="1" stop-color="#33373f"/></linearGradient></defs>'
            '<path d="M8 0h11.6c1.95 0 3.7 1.05 4.65 2.75l1.5 2.7c.38.68 1.1 1.1 1.88 1.1H39c4.4 0 8 3.6 8 8V40c0 4.4-3.6 8-8 8H8'
            f'c-4.4 0-8-3.6-8-8V8c0-4.4 3.6-8 8-8z" fill="url(#{gid})" stroke="#707070" stroke-width=".35"/></svg>')


def folder(n):
    """Folder with two papers (the front one carries the service number); papers lift out on hover.
    The graphite folder and paper-white sheets are an illustrated object, so they keep their own
    colours on the black theme (lifted a step lighter to separate from the card)."""
    paper = ('<svg viewBox="0 0 40 39" aria-hidden="true" focusable="false">'
             '<rect x=".25" y=".25" width="39.5" height="38.5" rx="4" fill="#efefed" stroke="#d6d6d3" stroke-width=".5"/>'
             f'<text x="5" y="10.5" font-size="6.5" font-weight="600" fill="#161616" font-family="inherit" letter-spacing=".2">{E(n)}</text>'
             '<path d="M5 15h22M5 18.5h16M5 22h19" stroke="#c2c2bf" stroke-width="1.2" stroke-linecap="round"/>'
             '<circle cx="33" cy="8" r="1.6" fill="#fb2629"/></svg>')
    return (f'<span class="svc-folder" aria-hidden="true">{_folder_back(n)}'
            f'<span class="svc-folder__paper svc-folder__paper--back"></span>'
            f'<span class="svc-folder__paper svc-folder__paper--front">{paper}</span>'
            f'<span class="svc-folder__lip"></span><span class="svc-folder__front"></span></span>')


# ------------------------------------------------------------------ image cards
def _caption(text, label=None, cls=''):
    """Unobtrusive project caption (decorative: the link and the image alt carry the same facts). A label too long
    for the one-line pill goes on its own line under the name (svc-cap--label)."""
    arrow = lib.ICONS['arrow-ne']
    lab = f'<span class="svc-cap__label">{E(label)}</span>' if label else ''
    mods = (' svc-cap--label' if label else '') + (f' {cls}' if cls else '')
    return (f'<span class="svc-cap{mods}" aria-hidden="true"><i class="svc-cap__dot"></i>'
            f'<span class="svc-cap__title">{roll(text)}</span>'
            f'<span class="svc-cap__icon">{arrow}</span>{lab}</span>')


CAP_ONE_LINE = 28        # longest "NAME · LABEL" caption that fits the one-line pill on the narrowest card


def _cap_text(name, p):
    """(caption text, label line or None): every project caption carries its label ("Client Project", "Concept
    Project", ...; an Interactive Concept with its "Unofficial, ..." line), in full."""
    label = projects.label_text(p, ' · ')
    one = f'{name} · {label}'
    return (one, None) if len(one) <= CAP_ONE_LINE else (name, label)


def _pick(p, roles):
    """The stills for a card: the listed roles first (when captured), then the project's other desktop and
    phone screens in gallery order; at most three (the "works" stack)."""
    by_role = {st['role']: st for st in p['stills']}
    chosen = [by_role[r] for r in roles or [] if r in by_role]
    rest = [st for st in p['stills'] if st not in chosen]
    rest = [st for st in rest if st['frame'] == 'desktop'] + [st for st in rest if st['frame'] != 'desktop']
    return (chosen + rest)[:3]


def resolve(n):
    """(project, stills, work_label) for a service mapped by project (07-08); (None, [], False) = the brand-mark card."""
    m = MEDIA[n]
    if 'slug' in m and m['slug'] is None:
        return None, [], False
    p = projects.by_slug(m['slug']) if m.get('slug') else None
    if p and m.get('label') != 'work':
        return p, _pick(p, m.get('roles')), False
    for slug, roles in m.get('fallback') or []:
        q = projects.by_slug(slug)
        if q:
            return q, _pick(q, roles), True
    if p:
        return p, _pick(p, m.get('roles')), True
    if projects.PROJECTS:
        return projects.PROJECTS[0], _pick(projects.PROJECTS[0], None), True
    return None, [], False


def _alt(p, s, work=False):
    """Alt text of a project image on a service card, with the project's label. A card under the portfolio label
    ('label': 'work', or a fallback for a project not captured yet) only illustrates the portfolio, so its alt text
    does not tie the project to the service; a mapped project names the service it evidently involves."""
    return (f'{p["title"]} — {p["industry"]} website' + ('' if work else f' ({s["name"]})')
            + f', {projects.label_text(p)}')


def slides(n):
    """The images of service n in order, front first ([] = the brand-mark card). Each slide: p (project, or None for an
    owner-supplied image of no shown project), entry (media variants), alt, pos (object-position), fit ('cover' |
    'contain'), ground (the contain letterbox colour), work (links to The Work page), cap ((text, label line) or None)."""
    m, s = MEDIA[n], next(x for x in CREATE['services'] if x['n'] == n)
    if 'images' not in m:
        p, stills, work = resolve(n)
        if not p:
            return []
        own = m.get('focal', {}) if p['slug'] == m.get('slug') else {}
        # under the portfolio label the caption names the section only ("The Work"): a project label after it would
        # call The Work page a concept
        cap = (WORK_LABEL, None) if work else _cap_text(p['title'], p)
        return [{'p': p, 'entry': st['entry'], 'pos': own.get(st['role']) or projects.focal(p, st), 'fit': 'cover',
                 'ground': None, 'work': work, 'cap': cap,
                 'alt': _alt(p, s, work) if not k else f'{p["title"]} — {p["industry"]} website, image {k + 1} of {len(stills)}'}
                for k, st in enumerate(stills)]
    out = []
    for it in m['images']:
        if it.get('supplied'):
            img = lib.supplied(it['supplied'])
            if not img:                      # not prepared yet (scripts/prepare_supplied.py): left out, never a gap
                continue
            # a supplied frame of a shown project (VYRN): its caption and page; otherwise The Work page, no caption
            p = projects.by_slug(it['slug']) if it.get('slug') else None
            out.append({'p': p, 'entry': img, 'alt': img['alt'], 'pos': it.get('focal') or img.get('focal') or '50% 50%',
                        'fit': img.get('fit') or 'cover', 'ground': img.get('ground'), 'fade': img.get('fade'),
                        'ar': img['w'] / img['h'], 'work': not p, 'cap': _cap_text(p['title'], p) if p else None})
            continue
        p = projects.by_slug(it['slug'])
        st = next((x for x in p['stills'] if x['role'] == it.get('role')), None) if p else None
        if not st:                           # project not shown, or the still is not (owner skip list)
            continue
        out.append({'p': p, 'entry': st['entry'], 'alt': _alt(p, s), 'pos': it.get('focal') or projects.focal(p, st),
                    'fit': 'cover', 'ground': None, 'work': False, 'cap': _cap_text(p['title'], p), 'zoom': it.get('zoom'),
                    'small': it.get('small')})
    return out


def stackable(n):
    """True when service n's large row shows the "works" stack: an owner-curated image set with more than one image."""
    return 'images' in MEDIA[n] and len(slides(n)) > 1


def _tag(ctx, sl, cls, extra=''):
    """(open, close) for an image card: a link to the slide's project page, or to The Work page for an owner-supplied
    image and for a card under the portfolio label."""
    if sl['work']:
        name = f'{WORK_LABEL}: {HOME["hero"]["ctas"][1]}'          # "The Work: Explore Our Work"
        x = f' {extra}' if extra else ''
        return (f'<a class="{cls}" href="{E(ctx.url("work"))}" aria-label="{E(name)}" data-cursor="{E(WORK_LABEL)}"{x}>',
                '</a>')
    return lib.project_tag(ctx, sl['p'], cls, label=f"View project: {sl['p']['title']} ({projects.label_text(sl['p'])})",
                           extra=extra)


def _img(ctx, sl, alt, sizes, max_width, extra_style=''):
    style = '' if sl['fit'] == 'contain' else f'object-position:{sl["pos"]}'     # contained: centred by the card (CSS)
    zoom = f'scale:{sl["zoom"][0]};transform-origin:{sl["zoom"][1]}' if sl.get('zoom') else ''   # MEDIA 'zoom'
    style = ';'.join(x for x in (style, zoom, extra_style) if x)
    return lib.media_img(ctx, sl['entry'], alt, sizes=sizes, max_width=max_width,
                         attrs=f'style="{style}"' if style else '')


def _back_sizes(sl):
    """(sizes, max_width) for a small card's back print: ART_SIZES and the 640 file, or - for a still drawn larger by
    its 'zoom' (MEDIA 'small') - the width it is drawn at (cover on the 4:3 print, times the scale), up to the 1280 file,
    so a 2-3x phone or a 2x desktop never stretches a 640 file across it."""
    if not sl.get('zoom') or sl['fit'] == 'contain':
        return ART_SIZES, 640
    top = max(sl['entry']['variants'], key=lambda v: v['width'])
    k = max(1, top['width'] / top['height'] / (4 / 3)) * sl['zoom'][0]
    w, vw, px = BACK_W
    return f'(min-width:800px) {w * k:.0f}px, calc({vw * k:.0f}vw - {px * k:.0f}px)', 1280


def _row_sizes(sl):
    """ROW_SIZES for this slide: a still wider than the ~4:3 card is drawn (object-fit: cover) at the card's height,
    i.e. its aspect / the card's times the card's width, so the hint asks for that width and the browser never
    stretches a smaller file. A contained image is drawn at the card's width."""
    top = max(sl['entry']['variants'], key=lambda v: v['width'])
    k = 1 if sl['fit'] == 'contain' else top['width'] / top['height'] / ROW_AR
    if k < 1.01:
        return ROW_SIZES
    return (f'(min-width:1440px) {584 * k:.0f}px, (min-width:1200px) {46 * k:.1f}vw, '
            f'(min-width:800px) calc({100 * k:.1f}vw - {128 * k:.0f}px), calc({100 * k:.1f}vw - {48 * k:.0f}px)')


def _ground(sl):
    """(class suffix, style attribute) for a card whose image is shown whole: centred at full width on its own ground
    colour (--ground), its aspect (--ar) placing it; 'fade': 'bottom' dissolves its bottom edge (22-services.css)."""
    if sl['fit'] != 'contain':
        return '', ''
    fade = ' is-fade' if sl.get('fade') == 'bottom' else ''
    return f' is-contain{fade}', f' style="--ground:{E(sl["ground"] or "#000")};--ar:{sl.get("ar") or 16 / 9:.4f}"'


# AI & Automation has no project of its own: the brand's 3D mark on a deep gradient with
# construction rings; on the large card its tags float around the mark like the reference's
# 2D & 3D tag pills. (rotation, drift on hover / while centred on touch); the positions are CSS (.svc-pill--1..6,
# 22-services.css), so the phone panel can re-space all six
_PILLS = [
    (-6, (-10, -6)),
    (5, (10, -6)),
    (4, (-12, 0)),
    (-4, (12, 0)),
    (-3, (-8, 8)),
    (6, (8, 8)),
]


def _brand_panel(ctx, cls, size=240, tags=()):
    rings = ('<i class="svc-brand__glow"></i><i class="svc-brand__ring svc-brand__ring--1"></i>'
             '<i class="svc-brand__ring svc-brand__ring--2"></i>'
             '<i class="svc-brand__orbit"><b></b><b></b></i><i class="svc-brand__axis"></i>')
    pills = ''.join(
        f'<span class="svc-pill svc-pill--{i + 1}" style="--r:{r}deg;--dx:{dx}px;--dy:{dy}px;--i:{i}">{chip_icon(t)}<span>{E(t)}</span></span>'
        for i, (t, (r, (dx, dy))) in enumerate(zip(tags, _PILLS)))
    mark = lib.img(ctx, 'assets/brand/logo-mark-3d.webp', '', w=size, h=round(size * 519 / 515), cls='svc-brand__mark')
    return f'<div class="svc-brand {cls}" aria-hidden="true">{rings}{pills}{mark}</div>'


_FLOW_IDS = [0]


def _flow_card():
    """Back card of the AI & Automation small card: an automation flow drawn for this site
    (three steps wired together; the highlighted middle one is the AI step). Colours live in
    src/css/22-services.css (.svc-flow__*) so the drawing follows the theme."""
    _FLOW_IDS[0] += 1
    pid = f'svcFlowDots{_FLOW_IDS[0]}'

    def node(x, y, ai=False):
        m = ' svc-flow__node--ai' if ai else ''
        sq = ' svc-flow__sq--ai' if ai else ''
        bar = ' svc-flow__bar--ai' if ai else ''
        return (f'<rect class="svc-flow__node{m}" x="{x}" y="{y}" width="66" height="26" rx="8"/>'
                f'<rect class="svc-flow__sq{sq}" x="{x + 7}" y="{y + 7}" width="12" height="12" rx="4"/>'
                f'<rect class="svc-flow__bar{bar}" x="{x + 25}" y="{y + 8.5}" width="30" height="3.5" rx="1.75"/>'
                f'<rect class="svc-flow__bar{bar}" x="{x + 25}" y="{y + 15}" width="20" height="3" rx="1.5" opacity=".7"/>')
    return (f'<svg class="svc-flow" viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">'
            f'<defs><pattern id="{pid}" width="10" height="10" patternUnits="userSpaceOnUse">'
            f'<circle class="svc-flow__grid" cx="1.5" cy="1.5" r=".9"/></pattern></defs>'
            f'<rect width="200" height="150" fill="url(#{pid})"/>'
            f'<path class="svc-flow__wire" d="M82 37C104 37 98 75 118 75"/>'
            f'<path class="svc-flow__wire" d="M151 88C151 112 110 113 82 113"/>'
            f'{node(16, 24)}{node(118, 62, ai=True)}{node(16, 100)}'
            f'<circle class="svc-flow__pin" cx="82" cy="37" r="2.5"/><circle class="svc-flow__pin" cx="82" cy="113" r="2.5"/></svg>')


def media(ctx, s, *, stack=False):
    """Right-hand image card of a large row (lib.project_tag: View Project cursor; owner-supplied images link to The
    Work page). stack=True renders the reference "works" stack when the service has more than one image: the next
    image peeks from the bottom-right corner; a click on it (or the Tap Here badge) brings it forward."""
    sl = slides(s['n'])
    if not sl:
        return f'<div class="svc-media svc-media--brand">{_brand_panel(ctx, "svc-media__card", 300, s["tags"])}</div>'
    stack = stack and len(sl) > 1
    shown = sl[:3] if stack else sl[:1]
    cards = []
    for k, x in enumerate(shown):
        extra = f'data-stack-card data-pos="{k}"' + (' tabindex="-1" aria-hidden="true"' if k else '')
        gcls, gstyle = _ground(x)
        o, c = _tag(ctx, x, 'svc-media__card' + gcls, extra=((extra if stack else '') + gstyle).strip())
        pic = _img(ctx, x, x['alt'], _row_sizes(x), 1920)     # up to 1920: a 2x screen draws a cover crop ~1600 px wide
        cap = _caption(*x['cap']) if x['cap'] else ''
        cards.append(f'{o}<span class="svc-media__img reveal-image">{pic}</span>{cap}{c}')
    if not stack:
        return f'<div class="svc-media">{"".join(cards)}</div>'
    one = len({x['p']['slug'] if x['p'] else None for x in shown}) == 1 and shown[0]['p']
    # named by its service, so the page's stack buttons are told apart in a screen reader's list
    name = f'Show the next {s["name"]} image' + (' of this project' if one else '')
    tap = (f'<button class="svc-tap" type="button" data-stack-next aria-label="{E(name)}">'
           '<span class="svc-tap__icon" aria-hidden="true"><svg viewBox="0 0 20 20" focusable="false">'
           '<path d="M15.5 3.5v5.25a3.25 3.25 0 0 1-3.25 3.25H4.5M8 8.5 4.5 12 8 15.5" fill="none" stroke="currentColor" '
           'stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
           '<span class="svc-tap__label">Tap Here</span></button>')
    status = '<span class="sr-only" data-stack-status aria-live="polite"></span>'
    low = ' svc-media--tap-low' if MEDIA[s['n']].get('tap') == 'low' else ''   # MEDIA 'tap': 'low' (Product & SaaS)
    return f'<div class="svc-media svc-media--stack{low}" data-svc-stack>{"".join(cards)}{tap}{status}</div>'


# ------------------------------------------------------------------ info card + rows
def _desc(s, cls='svc-info__desc'):
    lead = f'<span class="svc-lead">{E(_typo(s["title"]))}</span>'
    body = f' {E(_typo(s["body"]))}' if s.get('body') else ''
    return f'<p class="{cls}">{lead}{body}</p>'


def contact_href(ctx, s):
    """Contact page with this service pre-selected (src/js/35-contact.js reads ?service=)."""
    return f'{ctx.url("contact")}?service={slug(s["name"])}'


def _cta(ctx, s):
    arrow = lib.ICONS['arrow-r']
    return (f'<div class="svc-info__foot"><a class="svc-cta" data-letter-roll href="{E(contact_href(ctx, s))}" '
            f'aria-label="{E(PRIMARY_CTA)}: {E(s["name"])}"><span class="svc-cta__label">{roll(PRIMARY_CTA)}</span>'
            f'<span class="svc-cta__icon" aria-hidden="true">{arrow}</span></a></div>')


def info(ctx, s, *, hid, tag='h3', number=False, total=8, note=False, cta=False):
    num = (f'<span class="svc-info__num" aria-hidden="true"><b>{E(s["n"])}</b>/{total:02d}</span>' if number else '')
    note_html = (f'<p class="svc-info__note"><i aria-hidden="true"></i>{E(_typo(s["note"]))}</p>'
                 if note and s.get('note') else '')
    return (f'<div class="svc-info">'
            f'<div class="svc-info__text"><div class="svc-info__top">{folder(s["n"])}{num}</div>'
            f'<{tag} class="svc-info__title" id="{hid}">{E(s["name"])}</{tag}>{_desc(s)}{note_html}</div>'
            f'{chips(s["tags"])}{_cta(ctx, s) if cta else ""}</div>')


def row(ctx, s, *, tag='h3', flip=False, number=False, note=False, stack=False, anchor=False, cta=False, reveal=True):
    """Large framed row: info card + image card (reference rows 1-2)."""
    sid = slug(s['name'])
    hid = f'svc-{sid}-title'
    rid = f' id="{sid}"' if anchor else ''
    rev = ' data-reveal style="--y:60px"' if reveal else ''
    mods = (' svc-row--flip' if flip else '') + (' svc-row--cta' if cta else '')
    return (f'<article class="svc-frame svc-row{mods}"{rid} aria-labelledby="{hid}"{rev}>'
            f'{info(ctx, s, hid=hid, tag=tag, number=number, note=note, cta=cta)}{media(ctx, s, stack=stack)}</article>')


# ------------------------------------------------------------------ small cards (reference §2.8-2.9)
def _art(ctx, s):
    """Small-card artwork: the front print (+ its caption) and a back print, as one link. A back print of ANOTHER
    project (Brand & Digital Identity: VELORA behind SAANJH; E-commerce: VYRN behind SIAARA) is its own link with its own
    caption, pinned to the back print's top-right corner (22-services.css .svc-art--back), so each project names itself
    and opens its own page."""
    sl = slides(s['n'])
    if not sl:
        back = f'<span class="svc-art__card svc-art__card--back svc-art__card--paper" aria-hidden="true">{_flow_card()}</span>'
        front = _brand_panel(ctx, 'svc-art__card svc-art__card--front', 180)
        return f'<div class="svc-art svc-art--brand">{back}{front}</div>'
    first = sl[0]
    o, c = _tag(ctx, first, 'svc-art')
    other = len(sl) > 1 and sl[1]['p'] and not sl[1]['work'] and sl[1]['p'] is not first['p']
    if len(sl) > 1:
        gcls, gstyle = _ground(sl[1])
        sm = sl[1].get('small') or {}            # MEDIA 'small': the still's own framing as a back print
        back = {**sl[1], 'pos': sm.get('focal') or sl[1]['pos'], 'zoom': sm.get('zoom') or sl[1].get('zoom')}
        back_img = _img(ctx, back, '', *_back_sizes(back))
    else:  # a single image: the back print is a detail crop of it
        gcls, gstyle = _ground(first)
        back_img = _img(ctx, first, '', ART_SIZES, 1280, 'transform-origin:50% 40%;transform:scale(1.6)')
    back = f'<span class="svc-art__card svc-art__card--back{gcls}"{gstyle} aria-hidden="true">{back_img}</span>'
    fcls, fstyle = _ground(first)
    front_img = _img(ctx, first, first['alt'], ART_SIZES, 1280)
    front = f'<span class="svc-art__card svc-art__card--front reveal-image{fcls}"{fstyle}>{front_img}</span>'
    cap = _caption(*first['cap']) if first['cap'] else ''
    if other:
        bo, bc = _tag(ctx, sl[1], 'svc-art svc-art--back')
        return f'{o}{front}{cap}{c}{bo}{back}{_caption(*sl[1]["cap"], cls="svc-cap--back")}{bc}'
    return f'{o}{back}{front}{cap}{c}'


def small(ctx, s, *, tag='h3', more_href=None):
    sid = slug(s['name'])
    hid = f'svc-{sid}-title'
    tags = chips(s['tags'], 'svc-chips--compact', limit=3, more_href=more_href, name=s['name']) if more_href else ''
    return (f'<article class="svc-small" aria-labelledby="{hid}">'
            f'<div class="svc-small__text"><{tag} class="svc-small__title" id="{hid}">{E(s["name"])}</{tag}>'
            f'{_desc(s, "svc-small__desc")}{tags}</div>'
            f'<div class="svc-small__art">{_art(ctx, s)}</div></article>')


def small_row(ctx, items, *, tag='h3', more=None):
    """Framed tray of up to three small cards. more(s) -> href of the service's full entry."""
    cards = ''.join(small(ctx, s, tag=tag, more_href=more(s) if more else None) for s in items)
    return f'<div class="svc-frame svc-smalls" data-reveal style="--y:60px">{cards}</div>'
