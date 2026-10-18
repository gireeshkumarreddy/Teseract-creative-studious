"""Portfolio data: the studio's own websites.

scripts/portfolio.json is the curated table (client work, then concepts & interactive, in the owner's
order) and scripts/media-manifest.json (written by scripts/prepare_media.py) holds each site's captured
stills and recordings. A project is shown on the site ONLY when the manifest has it (info.txt
"permission: yes") with at least one still; the others appear automatically after the next
prepare_media.py + build.py. The ZIP portfolio (and its page-assets.json entries) is no longer used.

Names other modules rely on: PROJECTS (shown: client work, then concepts), CASES (shown projects with a page -
all of them), CLIENTS / CONCEPTS (each group in display order: curated, with scene colour families spread by
spread()), by_slug(slug) (a shown project or None). Each project dict:
  slug, title, group ('client' | 'concept'), group_name, label (always shown: 'Client Project' for client work,
  'Interactive Concept' / 'Concept Project' / 'Personal project' for the concepts - owner, 14 Oct), note (the small
  secondary line of an Interactive Concept, e.g. 'Unofficial, not affiliated with the brand', else None),
  label_kind ('client' | 'interactive' | 'concept' | 'personal': CSS modifier), tag (= label, the short form for pills),
  fan (a fan piece on film/TV/anime IP), industry, year, date (= year, for captions),
  services (' / ' joined), services_list, url (live site or None), kind ('case'), route ('projects/<slug>'),
  scene (device-scene style or None), device ('monitor' | 'laptop' | None), spill (screen light tint or None),
  scene_still (the still on the Work card's screen), tagline (verbatim or None), order,
  items  [gallery media in order: {'role', 'entry', 'type' ('image'|'video'), 'w', 'h', 'frame' ('desktop'|'phone'), 'alt'}]
  stills (the image items), images (= stills), cover (first still), laptop / hero (manifest video entries or None;
  None when portfolio.json "skip" lists 'laptop' / 'hero'), card_clip (the named clip on the Work card's screen,
  portfolio.json "card_clip", else None), card_poster (that clip's poster as a still item - the project's profile
  image where a still is shown, e.g. the Client Stories card - else None),
  tile_clip (the home hero tile's clip: portfolio.json "tile_clip", else hero), tile_clips (every clip the tile may play,
  preferred first: portfolio.json "tile_clip" may list several - owner, 17 Oct: the landing pages' 16:9 'tile' loop and
  their phone 'hero' - and the gallery plays the one that suits its slot, sections/home_hero._video_slots),
  home_laptop (the film the home laptop plays when portfolio.json "home_laptop" lists the project: its
  "home_laptop_clip" - played there even when "skip" keeps it off the project page, VYRN's film - else laptop),
  alts (portfolio.json "alt" overrides by role)
The title is info.txt's name unless portfolio.json "keep_title" is set (the owner's personal sites share the name
"Gireesh"; their README / page titles tell them apart).
Also: ROWS (the Work grid's row rhythm, used by spread() and pages/work.rows), clashes(), concept_intro(items)
(the one line introducing the concepts group, shared by the Work page and llms.txt), and label_text(p) (the label with
its secondary line, for alt text, link names and structured data).
"""
import json, pathlib
import lib

ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'scripts/portfolio.json').read_text(encoding='utf-8'))
YEAR = DATA['year']
GROUPS = DATA['groups']                                   # {'client': 'Client Work', 'concept': 'Concepts & Interactive'}
CATALOGUE = sorted(DATA['projects'], key=lambda e: e['order'])   # every curated project, shown or not
# Owner: never on the site (_ref/specs/DARK-THEME.md; Kingfisher removed 14 Oct, 23:20). check.py FORBIDDEN lists their
# names for the dist scan.
EXCLUDED = {'heeding', 'stepai', 'tgts', 'ghost-rider', 'got', 'avengers', 'the-paradise', 'kingfisher'}
_FALLBACK_INDUSTRY = {'client': 'Website', 'concept': 'Website concept'}
# Visible project labels (owner, 14 Oct - DARK-THEME.md 'Client update 8'): every client project is labelled
# CLIENT_LABEL, every concept one of CONCEPT_LABELS, so visitors see client vs concept at once (check.py enforces it).
CLIENT_LABEL = 'Client Project'
CONCEPT_LABELS = ('Interactive Concept', 'Concept Project', 'Personal project')
LABEL_KIND = {CLIENT_LABEL: 'client', 'Interactive Concept': 'interactive', 'Concept Project': 'concept',
              'Personal project': 'personal'}


def _alt(title, shows, fallback):
    """Alt text from the capture report's "shows" line, prefixed with the project name when it lacks it."""
    shows = (shows or '').strip()
    if not shows:
        return fallback
    return shows if title.lower() in shows.lower() else f'{title} — {shows}'


def _items(mp, title, skip=(), alts=None):
    rows = sorted((r, m) for r, m in (mp.get('media') or {}).items()
                  if r.startswith('gallery-') and m.get('variants') and r not in skip)
    alts = alts or {}
    out = []
    for i, (role, m) in enumerate(rows):
        src = m.get('source') or {}
        top = max(m['variants'], key=lambda v: v['width'])
        w, h = src.get('width') or top['width'], src.get('height') or top['height']
        frame = m.get('frame') if m.get('frame') in ('desktop', 'phone') else ('phone' if h > w else 'desktop')
        kind = 'video' if m.get('type') == 'video' else 'image'
        alt = _alt(title, alts.get(role) or m.get('alt'),
                   f'{title} — website {"recording" if kind == "video" else "screen"} {i + 1} of {len(rows)}')
        out.append({'role': role, 'entry': m, 'type': kind, 'w': w, 'h': h, 'frame': frame, 'alt': alt})
    return out


def _video(mp, role):
    m = (mp.get('media') or {}).get(role) or {}
    return m if m.get('type') == 'video' and m.get('variants') else None


def _clip(mp, name, alts):
    """A named loop clip (portfolio.json "card_clip" / "tile_clip") with its portfolio.json "alt" override, if any
    (a capture report's "shows" line can carry capture notes)."""
    m = _video(mp, name) if name else None
    return dict(m, alt=alts[name]) if m and alts.get(name) else m


def _tile_clips(mp, e, skip, alts):
    """The clips a home hero tile may play, preferred first: portfolio.json "tile_clip" (a clip name or a list of them;
    owner, 17 Oct: the six landing pages' ['tile', 'hero'] = the 16:9 desktop loop, then the phone scroll), else - or
    when none of them is prepared - the hero.mp4 phone scroll. 'skip' keeps a skipped 'hero' out of either."""
    names = e.get('tile_clip') or []
    names = [names] if isinstance(names, str) else list(names)
    clips = [m for m in (_clip(mp, n, alts) for n in names if not (n == 'hero' and 'hero' in skip)) if m]
    hero = None if 'hero' in skip else _video(mp, 'hero')
    return clips or ([hero] if hero else [])


def _poster(clip, name, title, alts):
    """The poster of a named clip as a still item (the project's profile image where a still is shown: the Client
    Stories card), alt text from portfolio.json "alt" ("<name>-poster"), else the clip's own."""
    vs = (clip or {}).get('poster') or []
    if not vs:
        return None
    top = max(vs, key=lambda v: v['width'])
    return {'role': f'{name}-poster', 'entry': {'variants': vs}, 'type': 'image', 'w': top['width'], 'h': top['height'],
            'frame': 'phone' if top['height'] > top['width'] else 'desktop',
            'alt': _alt(title, alts.get(f'{name}-poster') or clip.get('alt'), f'{title} — website screen')}


def _build(e, mp):
    info, report = mp.get('info') or {}, mp.get('report') or {}
    # info.txt's name wins, unless portfolio.json "keep_title" says the curated title (the site's own README / page
    # title) tells two projects apart: the owner's personal sites are all named "Gireesh" by their info.txt
    title = (e['title'] if e.get('keep_title') else info.get('name') or e['title']).strip()
    group = e['group']
    services = list(e.get('services') or DATA['default_services'])
    # client work is always CLIENT_LABEL; a concept keeps its curated label (default 'Concept Project')
    label = CLIENT_LABEL if group == 'client' else (e.get('label') if e.get('label') in CONCEPT_LABELS else CONCEPT_LABELS[1])
    note = ((e.get('label_note') or '').strip() or None) if group == 'concept' else None
    skip = set(e.get('skip') or ())                         # portfolio.json "skip": stills / clips the owner does not show
    alts = dict(e.get('alt') or {})                          # portfolio.json "alt": alt text overrides by role
    items = _items(mp, title, skip, alts)
    stills = [it for it in items if it['type'] == 'image']
    laptop = None if 'laptop' in skip else _video(mp, 'laptop')
    tile_clips = _tile_clips(mp, e, skip, alts)
    if not stills:
        return None
    return {
        'slug': e['slug'], 'title': title, 'group': group, 'group_name': GROUPS[group],
        'label': label, 'note': note, 'label_kind': LABEL_KIND[label], 'tag': label,
        'fan': bool(e.get('fan')) and group == 'concept',
        'industry': (e.get('industry') or _FALLBACK_INDUSTRY[group]).strip(),
        'year': e.get('year') or YEAR, 'date': e.get('year') or YEAR,
        'services': ' / '.join(services), 'services_list': services,
        'url': e.get('url') or None, 'kind': 'case', 'route': f"projects/{e['slug']}",
        'scene': e.get('scene') or None,
        'device': (e.get('device') or 'monitor') if e.get('scene') else None,
        'spill': e.get('spill') or None,
        # the curated tagline wins: a capture report can pick up a section heading (Hidden Stories)
        'tagline': (e.get('tagline_verbatim') or report.get('tagline_verbatim') or '').strip() or None,
        'order': e['order'], 'focal': e.get('focal') or {},
        'items': items, 'stills': stills, 'images': stills, 'cover': stills[0],
        'scene_still': next((s for s in stills if s['role'] == e.get('scene_still')), None)
                       or next((s for s in stills if s['frame'] == 'desktop'), stills[0]),
        'laptop': laptop,
        'hero': None if 'hero' in skip else _video(mp, 'hero'),
        # named loop clips (prepare_media.py: <name>.mp4 + its <name>.png poster) - Aivinci's tiger, owner 14 Oct
        'card_clip': _clip(mp, e.get('card_clip'), alts),
        # its poster = the profile image wherever a still stands for the project (owner, 15 Oct: Aivinci's review card)
        'card_poster': _poster(_clip(mp, e.get('card_clip'), alts), e.get('card_clip'), title, alts),
        'tile_clip': (tile_clips or [None])[0], 'tile_clips': tile_clips,
        # the home laptop's film ("The Idea", portfolio.json home_laptop): portfolio.json "home_laptop_clip" names a
        # recording the home laptop plays even when "skip" keeps it off the project page (owner, 15 Oct: VYRN's film
        # stays on the home laptop, its project page shows clean stills only); else the page's laptop clip
        'home_laptop': _video(mp, e['home_laptop_clip']) if e.get('home_laptop_clip') else laptop,
        'alts': alts,
    }


def _shown():
    out = []
    for e in CATALOGUE:
        if e['slug'] in EXCLUDED:
            continue
        mp = lib.media_entry(e['slug'])
        p = _build(e, mp) if mp else None
        if p:
            out.append(p)
    return out


# Colour family of each scene backdrop: neighbouring cards on the Work page never share a family when
# the group allows it (owner: never two red scenes next to each other).
FAMILY = {'red-horizon': 'red', 'stone-red': 'red', 'blue-studio': 'blue', 'violet-rock': 'violet',
          'violet-white': 'violet', 'green-white': 'green', 'sky-white': 'sky', 'amber-rock': 'amber', 'white-glass': 'light', 'grey-wall': 'grey', None: 'plain'}


ROWS = (1, 2, 2)          # Work grid rhythm: one full-width card, then two pairs, repeated (pages/work.rows)


def _rows(n, pattern=ROWS):
    """Card positions 0..n-1 grouped in the Work grid's rows."""
    out, i, k = [], 0, 0
    while i < n:
        m = min(pattern[k % len(pattern)], n - i)
        out.append(list(range(i, i + m)))
        i += m
        k += 1
    return out


def _touching(n, pattern=ROWS):
    """{position: earlier positions whose card touches it}: the card before it in reading order (the pair partner,
    and the card above it once the grid stacks to one column on phones) and the card(s) directly above it - a
    full-width row touches both cards of the pair above / below it; pair over pair touches left-left and
    right-right."""
    rows = _rows(n, pattern)
    near = {i: ({i - 1} if i else set()) for i in range(n)}
    for above, below in zip(rows, rows[1:]):
        if len(above) == 1 or len(below) == 1:
            for b in below:
                near[b].update(above)
        else:
            for a, b in zip(above, below):
                near[b].add(a)
    return near


def spread(items, pattern=ROWS):
    """The group in display order: the curated order, except that no two cards that touch on the Work grid (side
    by side, one above the other - a full-width card and both cards of the pair above or below it - or one after
    the other in the one-column phone layout) share a scene colour family (owner: never two same-colour cards next
    to each other). Slot by slot it takes the earliest project in the curated order that keeps the rest
    arrangeable (an exhaustive, memoised search over colour families), so with no clash the curated order is
    unchanged. When no arrangement avoids every clash, only consecutive cards are kept apart (the earlier rule)."""
    fam = lambda p: FAMILY.get(p['scene'], p['scene'])
    n = len(items)
    near = _touching(n, pattern)
    order, queues = [], {}                      # colour families in order of their first project; projects per family
    for p in items:
        f = fam(p)
        if f not in queues:
            queues[f] = []
            order.append(f)
        queues[f].append(p)
    rank = {id(p): i for i, p in enumerate(items)}
    failed = set()

    def place(pos, counts, placed):
        if pos == n:
            return []
        key = (pos, counts, tuple(placed[max(0, pos - 3):]))
        if key in failed:
            return None
        left = dict(zip(order, counts))
        # families in the curated rank of their next unplaced project
        cands = sorted((rank[id(queues[f][len(queues[f]) - left[f]])], f) for f in order if left[f])
        for _, f in cands:
            if any(placed[j] == f for j in near[pos]):
                continue
            rest = place(pos + 1, tuple(c - (o == f) for o, c in zip(order, counts)), placed + [f])
            if rest is not None:
                return [f] + rest
        failed.add(key)
        return None

    fams = place(0, tuple(len(queues[f]) for f in order), [])
    if fams is None:                            # unavoidable clash: never the same family twice in a row
        rest, out = list(items), []
        while rest:
            prev = fam(out[-1]) if out else None
            options = [i for i in range(len(rest)) if fam(rest[i]) != prev] or list(range(len(rest)))
            out.append(rest.pop(options[0]))
        return out
    taken = {f: 0 for f in order}
    out = []
    for f in fams:
        out.append(queues[f][taken[f]])
        taken[f] += 1
    return out


def clashes(items, pattern=ROWS):
    """[(slug above / before, slug)] for touching cards that share a colour family (check.py)."""
    fam = lambda p: FAMILY.get(p['scene'], p['scene'])
    near = _touching(len(items), pattern)
    return [(items[j]['slug'], items[i]['slug']) for i in range(len(items)) for j in sorted(near[i])
            if fam(items[i]) == fam(items[j])]


def label_text(p, sep=', '):
    """The project's label with its secondary line, if any: 'Client Project',
    'Interactive Concept, unofficial, not affiliated with the brand' (sep=' · ' keeps the note's capital)."""
    if not p.get('note'):
        return p['label']
    note = p['note'] if sep.strip() != ',' else p['note'][0].lower() + p['note'][1:]
    return f"{p['label']}{sep}{note}"


def concept_intro(items):
    """The one line introducing the concepts group (Work page and llms.txt): the fan-project sentence only while a
    fan project is shown."""
    if any(p.get('fan') for p in items):
        return ('Self-initiated concepts and fan projects, not client commissions. '
                'Fan pieces are unofficial and not affiliated with the rights holders.')
    return 'Self-initiated concepts, not client commissions.'


PROJECTS = _shown()
CLIENTS = spread([p for p in PROJECTS if p['group'] == 'client'])
CONCEPTS = spread([p for p in PROJECTS if p['group'] == 'concept'])
PROJECTS = CLIENTS + CONCEPTS                             # client work first, whatever the table order
CASES = PROJECTS
BY_GROUP = {'client': CLIENTS, 'concept': CONCEPTS}


def by_slug(slug):
    """The shown project for a slug, or None (not curated, or not captured yet)."""
    return next((p for p in PROJECTS if p['slug'] == slug), None)


def curated(key):
    """Shown projects for a curated list in portfolio.json ('home_gallery'), in that order."""
    return [p for p in (by_slug(s) for s in DATA.get(key) or []) if p]


def focal(p, still):
    """object-position for a still cropped into a tile: per-still override from portfolio.json ("focal":
    {"gallery-03": "40% 30%"}), else the top of a phone screen (its header and first screen) or a point a
    little above the middle of a desktop screen (where headlines sit)."""
    return p['focal'].get(still['role']) or ('50% 0%' if still['frame'] == 'phone' else '50% 40%')
